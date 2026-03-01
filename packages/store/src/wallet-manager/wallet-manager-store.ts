import { AssetList, Chain } from '@chain-registry/types';
import { BaseWallet, ChainName, CosmosSigningOptions, DeviceType, DownloadInfo, EndpointOptions, Endpoints, OS, SignerOptions, SignType, WalletAccount, WalletManager, WalletState } from '@interchain-kit/core';
import { AminoSigner, CosmosSignerConfig, createCosmosQueryClient, DirectSigner,OfflineSigner } from '@interchainjs/cosmos';
import { HttpEndpoint } from '@interchainjs/types';
import { getSigner, COSMOS_DIRECT, COSMOS_AMINO } from 'interchainjs';

import { createProxiedWallet } from '../proxied-wallets';
import { InterchainStore } from '../store';
import { ChainWalletState, InterchainStoreType } from '../types';
import { LocalStorage } from '../utils/local-storage';
import type { ChainWalletStore } from './chain-wallet-store';
import { WalletStore } from './wallet-store';
export class WalletManagerStore implements WalletManager {

  wallets: WalletStore[];

  store: InterchainStore;

  walletManager: WalletManager;

  chains: Chain[];

  assetLists: AssetList[];

  localStorage: LocalStorage;

  constructor(chains: Chain[], assetLists: AssetList[], wallets: BaseWallet[], signerOptions?: SignerOptions, endpointOptions?: EndpointOptions) {
    this.localStorage = new LocalStorage();

    this.store = new InterchainStore();

    const proxiedWallets = wallets.map(wallet => {
      wallet.setChainMap(chains);
      wallet.setAssetLists(assetLists);



      return createProxiedWallet(wallet, this.store);
    });

    this.walletManager = new WalletManager(chains, assetLists, proxiedWallets, signerOptions, endpointOptions);

    this.chains = chains;
    this.assetLists = assetLists;

    this.wallets = proxiedWallets.map(proxiedWallet => new WalletStore(proxiedWallet, chains, this.store, this.walletManager));
  }

  async init() {
    try {
      // 先恢复数据，再设置订阅
      this.restore();

      this.store.subscribe((state) => {
        this.localStorage.save({
          chainWalletStates: state.chainWalletStates,
          currentWalletName: state.currentWalletName,
          currentChainName: state.currentChainName,
        });
      });

      await Promise.all(this.wallets.map(wallet => wallet.init()));

      this.store.setState({ isReady: true });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  restore() {
    const oldState = this.localStorage.load();

    this.store.setState({
      chainWalletStates: oldState.chainWalletStates || [],
      currentWalletName: oldState.currentWalletName || '',
      currentChainName: oldState.currentChainName || ''
    });

    // 重建索引映射
    this.store.buildIndexMap();

    // 获取当前有效的 wallet 和 chain 名称集合
    const validWalletNames = new Set(this.wallets.map(wallet => wallet.info.name));
    const validChainNames = new Set(this.chains.map(chain => chain.chainName));

    // 1. 移除不需要的 chain wallet state（wallet 或 chain 不再存在）
    const filteredChainWalletStates = this.store.getState().chainWalletStates.filter(state => {
      return validWalletNames.has(state.walletName) && validChainNames.has(state.chainName);
    });

    // 2. 新增原本没有的 chain wallet state
    const newChainWalletStates: ChainWalletState[] = [];
    this.wallets.forEach(wallet => {
      this.chains.forEach(chain => {
        if (!this.store.isChainWalletStateExisted(wallet.info.name, chain.chainName)) {
          newChainWalletStates.push({
            walletName: wallet.info.name,
            chainName: chain.chainName,
            rpcEndpoint: '',
            walletState: WalletState.Disconnected,
            account: undefined,
            errorMessage: ''
          });
        }
      });
    });
    // 合并过滤后的状态和新增的状态
    const finalChainWalletStates = [...filteredChainWalletStates, ...newChainWalletStates];

    this.store.setState({ chainWalletStates: finalChainWalletStates });

    let isOldWalletNameExisted = false;
    let isOldChainNameExisted = false;
    for (const cws of finalChainWalletStates) {
      if (cws.walletName === oldState.currentWalletName) {
        isOldWalletNameExisted = true;
      }
      if (cws.chainName === oldState.currentChainName) {
        isOldChainNameExisted = true;
      }
    }

    // 直接设置state，避免触发emit
    this.store.setState({
      chainWalletStates: finalChainWalletStates,
      currentWalletName: isOldWalletNameExisted ? oldState.currentWalletName : '',
      currentChainName: isOldChainNameExisted ? oldState.currentChainName : '',
    });


    this.store.buildIndexMap();



  }


  subscribe(callback: (state: InterchainStoreType) => void) {
    return this.store.subscribe(callback);
  }

  getState() {
    return this.store.getState();
  }

  get walletConnectQRCodeUri() {
    return this.store.getState().walletConnectQRCodeUri;
  }

  get isReady() {
    return this.store.getState().isReady;
  }

  get currentWalletName() {
    return this.store.getState().currentWalletName;
  }

  get currentChainName() {
    return this.store.getState().currentChainName;
  }

  setCurrentWalletName(walletName: string) {
    this.store.setCurrentWalletName(walletName);
  }

  setCurrentChainName(chainName: string) {
    this.store.setCurrentChainName(chainName);
  }

  getChainById(chainId: string): Chain | undefined {
    return this.walletManager.getChainById(chainId);
  }

  getChainWalletState(walletName: string, chainName: string): ChainWalletState | undefined {
    return this.store.getChainWalletState(walletName, chainName);
  }

  updateChainWalletState(walletName: string, chainName: string, data: Partial<ChainWalletState>) {
    this.store.updateChainWalletState(walletName, chainName, data);
  }

  getChainWalletByName(walletName: string, chainName: Chain['chainName']): ChainWalletStore | undefined {
    const walletStore = this.wallets.find(w => w.info.name === walletName);
    return walletStore?.getChainWalletStore(chainName);
  }

  get modalIsOpen() {
    return this.store.getState().modalIsOpen;
  }

  openModal() {
    this.store.setState({ modalIsOpen: true });
  }
  closeModal() {
    this.store.setState({ modalIsOpen: false });
  }

  get signerOptions(): SignerOptions {
    return this.walletManager.signerOptions;
  }
  get endpointOptions(): EndpointOptions {
    return this.walletManager.endpointOptions;
  }
  get preferredSignTypeMap(): Record<string, SignType> {
    return this.walletManager.preferredSignTypeMap;
  }
  get signerOptionMap(): Record<string, CosmosSigningOptions> {
    return this.walletManager.signerOptionMap;
  }
  get endpointOptionsMap(): Record<string, Endpoints> {
    return this.walletManager.endpointOptionsMap;
  }
  addChains(newChains: Chain[], newAssetLists: AssetList[], signerOptions?: SignerOptions, newEndpointOptions?: EndpointOptions): Promise<void> {
    return this.walletManager.addChains(newChains, newAssetLists, signerOptions, newEndpointOptions);
  }
  getChainLogoUrl(chainName: ChainName): string {
    return this.walletManager.getChainLogoUrl(chainName);
  }
  getWalletByName(walletName: string): WalletStore | undefined {
    return this.wallets.find(w => w.info.name === walletName);
  }
  getChainByName(chainName: string): Chain | undefined {
    return this.walletManager.getChainByName(chainName);
  }
  getAssetListByName(chainName: string): AssetList {
    return this.walletManager.getAssetListByName(chainName);
  }
  connect(walletName: string, chainName: string): Promise<void> {
    const chainWallet = this.getWalletByName(walletName).getChainWalletStore(chainName);

    return chainWallet.connect();
  }
  disconnect(walletName: string, chainName: string): Promise<void> {
    const chainWallet = this.getWalletByName(walletName).getChainWalletStore(chainName);

    return chainWallet.disconnect();
  }
  getAccount(walletName: string, chainName: string): Promise<WalletAccount> {
    const chainWallet = this.getWalletByName(walletName).getChainWalletStore(chainName);

    return chainWallet.getAccount();
  }
  async getRpcEndpoint(walletName: string, chainName: string): Promise<string | HttpEndpoint> {
    const existed = this.getChainWalletState(walletName, chainName)?.rpcEndpoint;
    if (existed) {
      return existed;
    }
    const rpcEndpoint = await this.walletManager.getRpcEndpoint(walletName, chainName) as string;
    this.updateChainWalletState(walletName, chainName, { rpcEndpoint });
    return rpcEndpoint;
  }
  getPreferSignType(chainName: string): SignType {
    return this.walletManager.getPreferSignType(chainName);
  }
  getSignerOptions(chainName: string): CosmosSigningOptions {
    return this.walletManager.getSignerOptions(chainName);
  }
  getOfflineSigner(walletName: string, chainName: string): Promise<any> {
    return this.getWalletByName(walletName).getChainWalletStore(chainName).getOfflineSigner();
  }
  async getSigningClient(walletName: string, chainName: ChainName): Promise<DirectSigner | AminoSigner> {
    try {
      const chain = this.getChainByName(chainName);
      const rpcEndpoint = await this.getRpcEndpoint(walletName, chainName);
      const preferredSignType = this.getPreferSignType(chainName);
      const offlineSigner = (await this.getOfflineSigner(walletName, chainName)) as unknown as OfflineSigner;
      const defaultSignerOptions = await this.getSignerOptions(chainName);

      const signerOptions: CosmosSignerConfig = {
        queryClient: await createCosmosQueryClient(rpcEndpoint as string),
        addressPrefix: chain.bech32Prefix,
        chainId: chain.chainId,
        ...defaultSignerOptions.cosmosSignerConfig,
      };

      if (preferredSignType === 'direct') {
        return getSigner<DirectSigner>(offlineSigner, {
          preferredSignType: COSMOS_DIRECT,
          signerOptions,
        });
      } else {
        return getSigner<AminoSigner>(offlineSigner, {
          preferredSignType: COSMOS_AMINO,
          signerOptions,
        });
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  getEnv(): { browser: string; device: DeviceType; os: OS; } {
    return this.walletManager.getEnv();
  }
  getDownloadLink(walletName: string): DownloadInfo {
    return this.walletManager.getDownloadLink(walletName);
  }
}