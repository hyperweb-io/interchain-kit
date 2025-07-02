import { AssetList, Chain } from '@chain-registry/types';
import { Config, DownloadInfo, EndpointOptions, SignerOptions, SignType, WalletManager, WalletName, WalletState } from '@interchain-kit/core';
import { SigningClient } from '@interchainjs/cosmos/signing-client';
import { ICosmosGenericOfflineSigner } from '@interchainjs/cosmos/types';
import { SigningOptions as InterchainSigningOptions } from '@interchainjs/cosmos/types/signing-client';
import { HttpEndpoint } from '@interchainjs/types';

import { ChainWalletStore } from './chain-wallet-store';
import { ChainWalletState, WalletStoreManagerState } from './types';
import { ObservableState } from './utils/observable-state';
import { WalletStore } from './wallet-store';

export class WalletStoreManager {
  walletManager: WalletManager;
  WalletStores: Map<WalletName, WalletStore> = new Map<WalletName, WalletStore>();
  state: ObservableState<WalletStoreManagerState>;
  config: Config;
  chains: Chain[] = [];
  assetLists: AssetList[];
  wallets: WalletStore[] = [];

  constructor(config: Config) {
    this.walletManager = new WalletManager(config.chains, config.assetLists, config.wallets, config.signerOptions, config.endpointOptions);
    this.config = config;
    this.chains = config.chains;
    this.assetLists = config.assetLists;

    // 构建初始 state 树
    const initialState: WalletStoreManagerState = {
      isReady: false,
      currentWalletName: '',
      currentChainName: '',
      wallets: {},
    };
    // 遍历 config.wallets 和 config.chains 填充 wallets 字段
    config.wallets.forEach(wallet => {
      initialState.wallets[wallet.info.name] = {
        walletState: WalletState.NotExist,
        errorMessage: undefined,
        chains: {},
      };
      config.chains.forEach(chain => {
        initialState.wallets[wallet.info.name].chains[chain.chainName] = {
          walletState: WalletState.NotExist,
          account: null,
          errorMessage: undefined,
        };
      });
    });
    this.state = new ObservableState(initialState);

    config.wallets.forEach((wallet) => {
      wallet.setChainMap(config.chains);
      wallet.setAssetLists(config.assetLists);
      const walletController = new WalletStore(wallet, config.chains, this.walletManager);
      this.WalletStores.set(wallet.info.name, walletController);
      this.wallets.push(walletController);
    });
  }

  subscribe(listener: (state: WalletStoreManagerState) => void): () => void {
    return this.state.subscribe(listener);
  }

  async init(): Promise<void> {

    await Promise.all(
      this.wallets.map(async (walletController) => walletController.init())
    );

    await this.walletManager.init();

    this.state.proxy.isReady = true;
  }

  get isReady(): boolean {
    return this.state.proxy.isReady;
  }

  get currentWalletName(): WalletName {
    return this.state.proxy.currentWalletName;
  }

  get currentChainName(): Chain['chainName'] {
    return this.state.proxy.currentChainName;
  }

  setCurrentWalletName(name: string) {
    this.state.proxy.currentWalletName = name;
  }

  setCurrentChainName(chainName: string) {
    this.state.proxy.currentChainName = chainName;
  }

  setWalletState(walletName: string, walletState: WalletState) {
    this.state.proxy.wallets[walletName].walletState = walletState;
  }

  setChainWalletState(walletName: string, chainName: string, chainState: Partial<ChainWalletState>) {
    Object.assign(this.state.proxy.wallets[walletName].chains[chainName], chainState);
  }

  subscribeWithSelector<S>(selector: (state: WalletStoreManagerState) => S, listener: (selected: S) => void) {
    return this.state.subscribeWithSelector(selector, listener);
  }

  getChainWalletState(walletName: WalletName, chainName: string) {
    return this.state.proxy.wallets[walletName].chains[chainName];
  }

  getWalletByName(name: WalletName): WalletStore | undefined {
    const wallet = this.WalletStores.get(name);
    return wallet;
  }
  getChainWalletByName(walletName: WalletName, chainName: string): ChainWalletStore | undefined {
    const wallet = this.getWalletByName(walletName);
    const chainWallet = wallet?.getChainWalletByChainName(chainName);
    return chainWallet;
  }
  async connect(walletName: string, chainName: string) {
    return this.getChainWalletByName(walletName, chainName)?.connect();
  }
  async disconnect(walletName: string, chainName: string) {
    return this.getChainWalletByName(walletName, chainName)?.disconnect();
  }
  async getAccount(walletName: string, chainName: string) {
    return this.getChainWalletByName(walletName, chainName)?.getAccount();
  }
  async getOfflineSigner(walletName: string, chainName: string) {
    return this.getChainWalletByName(walletName, chainName)?.getOfflineSigner();
  }
  getRpcEndpoint(walletName: string, chainName: string): Promise<string | HttpEndpoint> {
    //cache
    //dedupe


    return this.getChainWalletByName(walletName, chainName)?.getRpcEndpoint();
  }

  async getSigningClient(walletName: string, chainName: string): Promise<SigningClient> {
    const rpcEndpoint = await this.getRpcEndpoint(walletName, chainName);
    const offlineSigner = await this.getOfflineSigner(walletName, chainName) as ICosmosGenericOfflineSigner;
    const signerOptions = await this.getSignerOptions(chainName);
    const signingClient = await SigningClient.connectWithSigner(rpcEndpoint, offlineSigner, signerOptions);
    return signingClient;
  }



  //util function just delegate from walletManager
  addChains(newChains: Chain[], newAssetLists: AssetList[], signerOptions?: SignerOptions, newEndpointOptions?: EndpointOptions) {
    return this.walletManager.addChains(newChains, newAssetLists, signerOptions, newEndpointOptions);
  }
  getChainLogoUrl(chainName: string): string {
    return this.walletManager.getChainLogoUrl(chainName);
  }
  getChainByName(chainName: string) {
    return this.walletManager.getChainByName(chainName);
  }
  getAssetListByName(chainName: string) {
    return this.walletManager.getAssetListByName(chainName);
  }
  getPreferSignType(chainName: string): SignType {
    return this.walletManager.getPreferSignType(chainName);
  }
  getSignerOptions(chainName: string): InterchainSigningOptions {
    return this.walletManager.getSignerOptions(chainName);
  }
  getEnv() {
    return this.walletManager.getEnv();
  }
  getDownloadLink(walletName: string): DownloadInfo {
    return this.walletManager.getDownloadLink(walletName);
  }
}