import { InjSigningClient } from '@interchainjs/injective/signing-client';
import { HttpEndpoint } from '@interchainjs/types';
import { Chain, AssetList } from '@chain-registry/v2-types'
import { BaseWallet } from './base-wallet'
import { WCWallet } from './wc-wallet';
import { ChainName, EndpointOptions, SignerOptions, WalletManagerState, WalletState } from './types'
import { ChainNameNotExist, createObservable, getValidRpcEndpoint, getWalletNameFromLocalStorage, isValidRpcEndpoint, NoValidRpcEndpointFound, removeWalletNameFromLocalStorage, setWalletNameToLocalStorage, WalletNotExist } from './utils'
import { OfflineSigner } from '@interchainjs/cosmos/types/wallet';
import { SignerOptions as InterchainSignerOptions } from 'interchainjs/types';
import { RpcQuery } from 'interchainjs/query/rpc';
import { SigningClient } from 'interchainjs/signing-client';
import { CosmosSigningClient } from 'interchainjs/cosmos';
import { CosmWasmSigningClient } from 'interchainjs/cosmwasm';
import { chainRegistryChainToKeplr } from '@chain-registry/v2-keplr';

export class WalletManager {
  chains: Chain[] = []
  assetLists: AssetList[] = []
  wallets: BaseWallet[] = []
  currentWalletName: string | undefined
  signerOptions: SignerOptions | undefined
  endpointOptions: EndpointOptions | undefined
  rpcEndpoint: Record<string, string | HttpEndpoint> = {}
  restEndpoint: Record<string, string | HttpEndpoint> = {}
  state: WalletManagerState = WalletManagerState.Initializing

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
    this.state = WalletManagerState.Initializing

    await Promise.all(this.wallets.map(async (wallet) => wallet.init()))

    const loggedWallet = getWalletNameFromLocalStorage()
    if (loggedWallet) {
      await this.connect(loggedWallet)
    }

    this.state = WalletManagerState.Initialized
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

    wallet.errorMessage = ''
    wallet.walletState = WalletState.Connecting

    try {
      await Promise.all(this.chains.map(async chain => {
        try {
          await wallet.connect(chain.chainId)
        } catch (error) {
          if (
            (error as any).message === `There is no chain info for ${chain.chainId}` ||
            (error as any).message === `There is no modular chain info for ${chain.chainId}`
          ) {
            const chainInfo = chainRegistryChainToKeplr(chain, this.assetLists)
            await wallet.addSuggestChain(chainInfo)
          } else {
            throw error
          }
        }
      }))

      this.currentWalletName = walletName
      wallet.walletState = WalletState.Connected

      setWalletNameToLocalStorage(walletName)

    } catch (error: any) {
      wallet.walletState = WalletState.Rejected
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

    removeWalletNameFromLocalStorage()
  }

  getCurrentWallet() {
    return this.wallets.find(wallet => wallet.option.name === this.currentWalletName)
  }

  addChain(chain: Chain) {
    this.chains.push(chain)
  }

  getChainLogoUrl(chainName: ChainName) {
    const assetList = this.assetLists.find(assetList => assetList.chainName === chainName)
    return assetList?.assets?.[0].logoURIs?.png || assetList?.assets?.[0].logoURIs?.svg || undefined
  }

  getWalletByName(walletName: string): BaseWallet {
    return this.wallets.find(wallet => wallet.option.name === walletName)
  }

  getChainByName(chainName: string): Chain {
    const chain = this.chains.find(chain => chain.chainName === chainName)
    return chain
  }

  getRpcEndpoint = async (chainName: string) => {
    const cacheKey = `${chainName}`
    const cachedRpcEndpoint = this.rpcEndpoint[cacheKey]
    if (cachedRpcEndpoint) {
      return cachedRpcEndpoint
    }

    const chain = this.getChainByName(chainName)

    const providerRpcEndpoints = this.endpointOptions?.endpoints?.[chain.chainName]?.rpc || []
    // const walletRpcEndpoints = wallet?.option?.endpoints?.[chain.chainName]?.rpc || []
    const chainRpcEndpoints = chain.apis.rpc.map(url => url.address)


    if (providerRpcEndpoints?.[0]) {
      this.rpcEndpoint[cacheKey] = providerRpcEndpoints[0]
      return this.rpcEndpoint[cacheKey]
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
      promises.push(this.getRpcEndpoint(chain.chainName))
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
    const rpc = await this.getRpcEndpoint(chainName)
    return new RpcQuery(rpc)
  }

  async getInterchainSignerOptions(walletName: string, chainName: string) {
    const wallet = this.getWalletByName(walletName)
    const chain = this.getChainByName(chainName)
    const rpcEndpoint = await this.getRpcEndpoint(chainName)
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

  isWalletConnected = (walletName: string) => {
    return this.getWalletByName(walletName)?.walletState === WalletState.Connected
  }

  async getSigningClient(walletName: string, chainName: ChainName): Promise<SigningClient> {
    if (!this.isWalletConnected(walletName)) return null
    const { rpcEndpoint, offlineSigner, options } = await this.getInterchainSignerOptions(walletName, chainName)
    return SigningClient.connectWithSigner(rpcEndpoint, offlineSigner, options)
  }

  async getSigningCosmosClient(walletName: string, chainName: ChainName): Promise<CosmosSigningClient> {
    if (!this.isWalletConnected(walletName)) return null
    const { rpcEndpoint, offlineSigner, options } = await this.getInterchainSignerOptions(walletName, chainName)
    return CosmosSigningClient.connectWithSigner(rpcEndpoint, offlineSigner, options)
  }

  async getSigningCosmwasmClient(walletName: string, chainName: ChainName,): Promise<CosmWasmSigningClient> {
    if (!this.isWalletConnected(walletName)) return null
    const { rpcEndpoint, offlineSigner, options } = await this.getInterchainSignerOptions(walletName, chainName)
    return CosmWasmSigningClient.connectWithSigner(rpcEndpoint, offlineSigner, options)
  }

  async getSigningInjectiveClient(walletName: string, chainName: ChainName): Promise<InjSigningClient> {
    if (!this.isWalletConnected(walletName)) return null
    const { rpcEndpoint, offlineSigner, options } = await this.getInterchainSignerOptions(walletName, chainName)
    return InjSigningClient.connectWithSigner(rpcEndpoint, offlineSigner, options)
  }

}