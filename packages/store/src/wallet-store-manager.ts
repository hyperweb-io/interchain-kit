import { AssetList, Chain } from '@chain-registry/types';
import { Config, DownloadInfo, EndpointOptions, SignerOptions, SignType, WalletManager, WalletName, WalletState } from '@interchain-kit/core';
import { ChainWalletState } from '@interchain-kit/store';
import { SigningClient } from '@interchainjs/cosmos/signing-client';
import { ICosmosGenericOfflineSigner } from '@interchainjs/cosmos/types';
import { SigningOptions as InterchainSigningOptions } from '@interchainjs/cosmos/types/signing-client';
import { HttpEndpoint } from '@interchainjs/types';

import { ChainWalletStore } from './chain-wallet-store';
import { ChainWalletState, WalletStoreManagerState } from './types';
import { INTERCHAIN_STORAGE_KEY, InterchainStorage } from './utils';
import { findChainWalletState, updateChainWalletState } from './utils/flat-state-utils';
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

    // 构建扁平化的初始状态
    const chainWalletStates: ChainWalletState[] = [];

    // 初始化每个钱包的链状态
    config.wallets.forEach(wallet => {
      config.chains.forEach(chain => {
        chainWalletStates.push({
          walletName: wallet.info.name,
          chainName: chain.chainName,
          walletState: WalletState.Disconnected,
          account: null,
          errorMessage: undefined,
          rpcEndpoint: '',
        });
      });
    });

    const initialState: WalletStoreManagerState = {
      isReady: false,
      currentWalletName: '',
      currentChainName: '',
      chainWalletStates,
      walletConnectQRCodeUri: '',
    };

    this.state = new ObservableState(initialState);

    // 监听状态变化，自动保存到 localStorage
    this.state.subscribe((state) => {
      console.log(state);
      InterchainStorage.set(INTERCHAIN_STORAGE_KEY, {
        currentWalletName: state.currentWalletName,
        currentChainName: state.currentChainName,
        chainWalletStates: state.chainWalletStates,
      });
    });


    config.wallets.forEach((wallet) => {
      wallet.setChainMap(config.chains);
      wallet.setAssetLists(config.assetLists);
      const walletStore = new WalletStore(wallet, config.chains, this.walletManager, this);
      this.WalletStores.set(wallet.info.name, walletStore);
      this.wallets.push(walletStore);
    });
  }

  restoreState() {
    const state = InterchainStorage.get(INTERCHAIN_STORAGE_KEY);

    const lastChainWalletStateMap = new Map<string, ChainWalletState>(state.chainWalletStates.map((chainWalletState: ChainWalletState) => [chainWalletState.walletName + chainWalletState.chainName, chainWalletState]));

    const oldChainWalletStateToRestore: ChainWalletState[] = [];
    const newChainWalletStateToRestore: ChainWalletState[] = [];
    this.state.proxy.chainWalletStates.forEach((chainWalletState: ChainWalletState) => {
      const lastChainWalletState = lastChainWalletStateMap.get(chainWalletState.walletName + chainWalletState.chainName);
      if (lastChainWalletState) {
        oldChainWalletStateToRestore.push(lastChainWalletState);
      } else {
        newChainWalletStateToRestore.push(chainWalletState);
      }
    });


    if (state) {
      this.state.proxy.chainWalletStates = [...oldChainWalletStateToRestore, ...newChainWalletStateToRestore];
      this.state.proxy.currentWalletName = state.currentWalletName;
      this.state.proxy.currentChainName = state.currentChainName;
    }
  }

  subscribe(listener: (state: WalletStoreManagerState) => void): () => void {
    return this.state.subscribe(listener);
  }

  async init(): Promise<void> {

    this.restoreState();


    await Promise.all(
      this.wallets.map(async (walletStore) => await walletStore.init())
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

  get walletConnectQRCodeUri(): string | null {
    return this.state.proxy.walletConnectQRCodeUri;
  }

  setCurrentWalletName(name: string) {
    this.state.proxy.currentWalletName = name;
  }

  setCurrentChainName(chainName: string) {
    this.state.proxy.currentChainName = chainName;
  }

  updateChainWalletState(walletName: string, chainName: string, chainState: Partial<ChainWalletState>) {
    this.state.proxy.chainWalletStates = updateChainWalletState(this.state.proxy.chainWalletStates, walletName, chainName, chainState);
  }

  subscribeWithSelector<S>(selector: (state: WalletStoreManagerState) => S, listener: (selected: S) => void) {
    return this.state.subscribeWithSelector(selector, listener);
  }

  getChainWalletState(walletName: WalletName, chainName: string) {
    const chainWalletState = findChainWalletState(this.state.proxy.chainWalletStates, walletName, chainName);
    return chainWalletState || {} as ChainWalletState;
  }

  getWalletByName(name: WalletName): WalletStore | undefined {
    const wallet = this.WalletStores.get(name);
    return wallet;
  }

  getChainWalletByName(walletName: string, chainName: string): ChainWalletStore {
    const chainWallet = this.getWalletByName(walletName)?.getChainWalletByChainName(chainName);
    if (!chainWallet) {
      throw new Error(`Chain wallet with name ${chainName} not found`);
    }
    return chainWallet;
  }

  async connect(walletName: string, chainName: string) {
    const chainWallet = this.getChainWalletByName(walletName, chainName);
    await chainWallet.connect();
  }

  async disconnect(walletName: string, chainName: string) {
    const chainWallet = this.getChainWalletByName(walletName, chainName);
    await chainWallet.disconnect();
  }

  async getAccount(walletName: string, chainName: string) {
    const chainWallet = this.getChainWalletByName(walletName, chainName);
    return chainWallet.getAccount();
  }

  async getOfflineSigner(walletName: string, chainName: string) {
    const chainWallet = this.getChainWalletByName(walletName, chainName);
    return chainWallet.getOfflineSigner();
  }

  async getRpcEndpoint(walletName: string, chainName: string): Promise<string | HttpEndpoint> {
    const chainWallet = this.getChainWalletByName(walletName, chainName);
    return chainWallet.getRpcEndpoint();
  }

  async getSigningClient(walletName: string, chainName: string): Promise<SigningClient> {
    const rpcEndpoint = await this.getRpcEndpoint(walletName, chainName);
    const offlineSigner = await this.getOfflineSigner(walletName, chainName) as ICosmosGenericOfflineSigner;
    const signerOptions = await this.getSignerOptions(chainName);
    const signingClient = await SigningClient.connectWithSigner(rpcEndpoint, offlineSigner, signerOptions);
    return signingClient;
  }

  setWalletConnectQRCodeUri(uri: string) {
    this.state.proxy.walletConnectQRCodeUri = uri;
  }

  clearWalletConnectQRCodeUri() {
    this.state.proxy.walletConnectQRCodeUri = null;
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