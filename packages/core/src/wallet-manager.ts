import { InjSigningClient } from '@interchainjs/injective/signing-client';
import { HttpEndpoint } from '@interchainjs/types';
import { Chain, AssetList } from '@chain-registry/v2-types'
import { BaseWallet } from './base-wallet'
import { WCWallet } from './wc-wallet';
import { ChainName, EndpointOptions, SignerOptions, WalletState } from './types'
import { ChainNameNotExist, createObservable, getValidRpcEndpoint, isValidRpcEndpoint, NoValidRpcEndpointFound, WalletNotExist } from './utils'
import { OfflineSigner } from '@interchainjs/cosmos/types/wallet';
import { SignerOptions as InterchainSignerOptions } from 'interchainjs/types';
import { RpcQuery } from 'interchainjs/query/rpc';
import { SigningClient } from 'interchainjs/signing-client';
import { CosmosSigningClient } from 'interchainjs/cosmos';
import { CosmWasmSigningClient } from 'interchainjs/cosmwasm';

export class WalletManager {
  chains: Chain[] = []
  assetLists: AssetList[] = []
  wallets: BaseWallet[] = []
  currentWalletName: string | undefined
  signerOptions: SignerOptions | undefined
  endpointOptions: EndpointOptions | undefined
  rpcEndpoint: Record<string, string | HttpEndpoint> = {}
  restEndpoint: Record<string, string | HttpEndpoint> = {}

  constructor(
    chain: Chain[],
    assetLists: AssetList[],
    wallets: BaseWallet[],
    signerOptions?: SignerOptions,
    endpointOptions?: EndpointOptions,

    onUpdate?: () => void
  ) {
    this.chains = chain
    this.assetLists = assetLists
    this.wallets = wallets.map(wallet => createObservable(wallet, onUpdate))
    this.signerOptions = signerOptions
    this.endpointOptions = endpointOptions

    return createObservable(this, onUpdate)
  }

  async init() {
    await this.initRpcEndpoint()
    await Promise.all(this.wallets.map(async (wallet) => wallet.init()))
  }

  static async create(
    chain: Chain[],
    assetLists: AssetList[],
    wallets: BaseWallet[],
    signerOptions?: SignerOptions,
    endpointOptions?: EndpointOptions,
    onUpdate?: () => void
  ) {
    const wm = new WalletManager(chain, assetLists, wallets, signerOptions, endpointOptions, onUpdate)
    await wm.init()
    return wm
  }

  async connect(walletName: string) {

    const wallet = this.wallets.find(wallet => wallet.option.name === walletName)

    if (!wallet) {
      throw new WalletNotExist(walletName)
    }

    const chainIds: string[] = this.chains.map(chain => chain.chainId)

    this.currentWalletName = walletName

    wallet.errorMessage = ''
    wallet.walletState = WalletState.Connecting

    try {
      await wallet.connect(chainIds)

      wallet.walletState = WalletState.Connected

    } catch (error: any) {
      wallet.walletState = WalletState.Reject
      wallet.errorMessage = error.message
      throw error
    }
  }

  async disconnect(walletName: string) {
    const wallet = this.wallets.find(wallet => wallet.option.name === walletName)

    if (wallet instanceof WCWallet) {
      await wallet.disconnect()
    } else {
      await wallet.disconnect(this.chains.map(chain => chain.chainId))
    }
    wallet.walletState = WalletState.Disconnected
  }

  getCurrentWallet() {
    return this.wallets.find(wallet => wallet.option.name === this.currentWalletName)
  }

  addChain(chain: Chain) {
    this.chains.push(chain)
  }

  getChainLogo(chainName: ChainName) {
    const assetList = this.assetLists.find(assetList => assetList.chainName === chainName)
    return assetList.assets[0].logoURIs.png || assetList.assets[0].logoURIs.svg || undefined
  }

  getWalletByName(walletName: string): BaseWallet {
    return this.wallets.find(wallet => wallet.option.name === walletName)
  }

  getChainByName(chainName: string): Chain {
    const chain = this.chains.find(chain => chain.chainName === chainName)
    return chain
  }

  getRpcEndpoint = async (wallet: BaseWallet, chainName: string) => {
    const cacheKey = `${chainName}`
    const cachedRpcEndpoint = this.rpcEndpoint[cacheKey]
    if (cachedRpcEndpoint) {
      return cachedRpcEndpoint
    }

    const chain = this.getChainByName(chainName)

    const providerRpcEndpoints = this.endpointOptions?.endpoints?.[chain.chainName]?.rpc || []
    // const walletRpcEndpoints = wallet?.option?.endpoints?.[chain.chainName]?.rpc || []
    const chainRpcEndpoints = chain.apis.rpc.map(url => url.address)

    if (providerRpcEndpoints?.[0] && await isValidRpcEndpoint(providerRpcEndpoints[0])) {
      this.rpcEndpoint[cacheKey] = providerRpcEndpoints[0]
    }

    // if (walletRpcEndpoints?.[0] && await isValidRpcEndpoint(providerRpcEndpoints[0])) {
    //   this.rpcEndpoint[cacheKey] = walletRpcEndpoints[0]
    // }

    if (chainRpcEndpoints[0] && await isValidRpcEndpoint(chainRpcEndpoints[0])) {
      this.rpcEndpoint[cacheKey] = chainRpcEndpoints[0]
    }

    const validRpcEndpoint = await getValidRpcEndpoint([...providerRpcEndpoints, ...chainRpcEndpoints])

    if (validRpcEndpoint === '') {
      throw new NoValidRpcEndpointFound()
    }

    this.rpcEndpoint[cacheKey] = validRpcEndpoint
    return validRpcEndpoint
  }

  initRpcEndpoint = async () => {
    const promises = []
    for (const chain of this.chains) {
      promises.push(this.getRpcEndpoint(null, chain.chainName))
    }
    await Promise.all(promises)
  }

  getPreferSignType(chainName: string) {
    return this.signerOptions?.preferredSignType?.(chainName) || 'amino'
  }

  getSignerOptions(chainName: string): InterchainSignerOptions {
    return this.signerOptions?.signing?.(chainName) || {}
  }

  getOfflineSigner(wallet: BaseWallet, chainName: string): OfflineSigner {
    const chain = this.getChainByName(chainName)
    const signType = this.getPreferSignType(chainName)
    if (signType === 'direct') {
      return wallet.getOfflineSignerDirect(chain.chainId)
    } else {
      return wallet.getOfflineSignerAmino(chain.chainId)
    }
  }

  async getAccount(walletName: string, chainName: ChainName) {

    const chain = this.chains.find(c => c.chainName === chainName)
    const wallet = this.wallets.find(w => w.option.name === walletName)

    if (!chain) {
      throw new ChainNameNotExist(chainName)
    }

    if (!wallet) {
      throw new WalletNotExist(walletName)
    }

    return wallet.getAccount(chain.chainId)
  }

  async getQueryClient(walletName: string, chainName: ChainName) {
    const wallet = this.getWalletByName(walletName)
    const rpc = await this.getRpcEndpoint(wallet, chainName)
    return new RpcQuery(rpc)
  }

  async getInterchainSignerOptions(walletName: string, chainName: string) {
    const wallet = this.getWalletByName(walletName)
    const chain = this.getChainByName(chainName)
    const rpcEndpoint = await this.getRpcEndpoint(wallet, chainName)
    const offlineSigner = this.getOfflineSigner(wallet, chainName)
    const signerOptions = this.getSignerOptions(chainName)
    const preferredSignType = this.getPreferSignType(chainName) as 'amino' | 'direct'
    const options: InterchainSignerOptions = {
      ...signerOptions,
      preferredSignType,
      prefix: chain.bech32Prefix,
      broadcast: {
        checkTx: true,
        deliverTx: false,
      },
    }
    return {
      rpcEndpoint,
      offlineSigner,
      options
    }
  }

  async getSigningClient(walletName: string, chainName: ChainName): Promise<SigningClient> {
    const { rpcEndpoint, offlineSigner, options } = await this.getInterchainSignerOptions(walletName, chainName)
    return SigningClient.connectWithSigner(rpcEndpoint, offlineSigner, options)
  }

  async getSigningCosmosClient(walletName: string, chainName: ChainName): Promise<CosmosSigningClient> {
    const { rpcEndpoint, offlineSigner, options } = await this.getInterchainSignerOptions(walletName, chainName)
    return CosmosSigningClient.connectWithSigner(rpcEndpoint, offlineSigner, options)
  }

  async getSigningCosmwasmClient(walletName: string, chainName: ChainName,): Promise<CosmWasmSigningClient> {
    const { rpcEndpoint, offlineSigner, options } = await this.getInterchainSignerOptions(walletName, chainName)
    return CosmWasmSigningClient.connectWithSigner(rpcEndpoint, offlineSigner, options)
  }

  async getSigningInjectiveClient(walletName: string, chainName: ChainName): Promise<InjSigningClient> {
    const { rpcEndpoint, offlineSigner, options } = await this.getInterchainSignerOptions(walletName, chainName)
    return InjSigningClient.connectWithSigner(rpcEndpoint, offlineSigner, options)
  }

}