
import { AssetList, Chain } from '@chain-registry/types';
import { MultiSignDoc, MultiSignResponse, SignType, Wallet, WalletAccount } from '../types';
import { BaseWallet } from './base-wallet';
import { IGenericOfflineSigner } from '@interchainjs/types';

export class MultiChainWallet<
  TSignData extends MultiSignDoc = any,
  TSignResponse extends MultiSignResponse = any,
  TOfflineSigner = IGenericOfflineSigner
> extends BaseWallet<TSignData, TSignResponse, TOfflineSigner> {

  networkWalletMap: Map<Chain['chainType'], BaseWallet<TSignData, TSignResponse, TOfflineSigner>> = new Map()

  constructor(info?: Wallet, networkWalletMap?: Map<Chain['chainType'], BaseWallet<TSignData, TSignResponse, TOfflineSigner>>) {
    super(info);

    if (networkWalletMap) {
      networkWalletMap.forEach((wallet, key) => {
        if (this.networkWalletMap.has(key)) {
          this.networkWalletMap.set(key, wallet);
        }
      })
    }
  }

  setNetworkWallet(chainType: Chain['chainType'], wallet: BaseWallet<TSignData, TSignResponse, TOfflineSigner>): void {
    this.networkWalletMap.set(chainType, wallet);
  }

  setChainMap(chains: Chain[]): void {
    this.chainMap = new Map(chains.map(chain => [chain.chainId, chain]))
    this.networkWalletMap.forEach(wallet => {
      wallet.setChainMap(chains)
    })
  }

  addChain(chain: Chain): void {
    this.chainMap.set(chain.chainId, chain);
    this.networkWalletMap.forEach(wallet => {
      wallet.addChain(chain)
    })
  }

  setAssetLists(assetLists: AssetList[]): void {
    this.networkWalletMap.forEach(wallet => {
      wallet.setAssetLists(assetLists)
    })
  }

  async init(): Promise<void> {
    const wallets = Array.from(this.networkWalletMap.values());

    wallets.forEach(wallet => {
      wallet.events.on('accountChanged', () => {
        this.events.emit('accountChanged', () => {

        });
      })
    })


    try {
      await Promise.all(wallets.map(async wallet => wallet.init()))
    } catch (error) {
      console.log('Error initializing wallets:', error);
      // throw error
    }
  }
  getWalletByChainType(chainType: Chain['chainType']) {
    const wallet = this.networkWalletMap.get(chainType);
    if (!wallet) {
      throw new Error(`Unsupported chain type: "${chainType}"`);
    }
    return wallet;
  }
  async sign(chainId: Chain['chainId'], signData: TSignData): Promise<TSignResponse> {
    const chain = this.getChainById(chainId);
    const networkWallet = this.getWalletByChainType(chain.chainType);
    return networkWallet.sign(chainId, signData);
  }
  async connect(chainId: Chain['chainId']): Promise<void> {
    const chain = this.getChainById(chainId);
    const networkWallet = this.getWalletByChainType(chain.chainType);
    await networkWallet.connect(chainId);
  }
  async disconnect(chainId: Chain['chainId']): Promise<void> {
    const chain = this.getChainById(chainId);
    const networkWallet = this.getWalletByChainType(chain.chainType);
    await networkWallet.disconnect(chainId);
  }
  async getAccount(chainId: Chain['chainId']): Promise<WalletAccount> {
    const chain = this.getChainById(chainId);
    const networkWallet = this.getWalletByChainType(chain.chainType);
    if (!networkWallet) {
      return Promise.reject(new Error('Unsupported chain type'))
    }
    return networkWallet.getAccount(chainId);
  }
  async getOfflineSigner(chainId: Chain['chainId'], preferSignType?: SignType) {
    const chain = this.getChainById(chainId);
    const networkWallet = this.getWalletByChainType(chain.chainType);
    return networkWallet.getOfflineSigner(chainId);
  }
  async addSuggestChain(chainId: string): Promise<void> {
    const chain = this.chainMap.get(chainId);
    const networkWallet = this.getWalletByChainType(chain.chainType);
    return networkWallet.addSuggestChain(chainId);
  }
  getProvider(chainId: string) {
    const chain = this.getChainById(chainId);
    const networkWallet = this.getWalletByChainType(chain.chainType);
    return networkWallet.getProvider(chainId);
  }
}