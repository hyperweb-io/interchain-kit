import { AssetList, Chain } from '@chain-registry/types';
import { Config, DownloadInfo, EndpointOptions, GenericSignRequest, GenericSignResponse, SignerOptions, SignType, WalletAccount, WalletManager, WalletName, WalletState } from '@interchain-kit/core';
import { SigningClient } from '@interchainjs/cosmos/signing-client';
import { ICosmosGenericOfflineSigner } from '@interchainjs/cosmos/types';
import { SigningOptions as InterchainSigningOptions } from '@interchainjs/cosmos/types/signing-client';
import { HttpEndpoint } from '@interchainjs/types';

import { ChainWalletState, isWalletConnectState, WalletStoreManagerState } from './types';
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
        // 为 WalletConnect 钱包创建特殊状态
        if (wallet.info.mode === 'wallet-connect') {
          chainWalletStates.push({
            walletName: wallet.info.name,
            chainName: chain.chainName,
            walletState: WalletState.NotExist,
            account: null,
            errorMessage: undefined,
            rpcEndpoint: '',
            qrCodeUri: null  // WalletConnect 钱包特有的字段
          });
        } else {
          // 普通钱包使用基础状态
          chainWalletStates.push({
            walletName: wallet.info.name,
            chainName: chain.chainName,
            walletState: WalletState.NotExist,
            account: null,
            errorMessage: undefined,
            rpcEndpoint: ''
          });
        }
      });
    });

    const initialState: WalletStoreManagerState = {
      isReady: false,
      currentWalletName: '',
      currentChainName: '',
      chainWalletStates,
    };

    this.state = new ObservableState(initialState);

    config.wallets.forEach((wallet) => {
      wallet.setChainMap(config.chains);
      wallet.setAssetLists(config.assetLists);
      const walletStore = new WalletStore(wallet, config.chains, this.walletManager, this);
      this.WalletStores.set(wallet.info.name, walletStore);
      this.wallets.push(walletStore);
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

  getChainWalletByName(walletName: WalletName, chainName: string): WalletStore | undefined {
    const wallet = this.getWalletByName(walletName);
    return wallet;
  }

  async connect(walletName: string, chainName: string) {
    const wallet = this.getChainWalletByName(walletName, chainName);
    const chain = this.getChainByName(chainName);
    if (wallet && chain) {
      return wallet.connect(chain.chainId);
    }
  }

  async disconnect(walletName: string, chainName: string) {
    const wallet = this.getChainWalletByName(walletName, chainName);
    const chain = this.getChainByName(chainName);
    if (wallet && chain) {
      return wallet.disconnect(chain.chainId);
    }
  }

  async getAccount(walletName: string, chainName: string) {
    const wallet = this.getChainWalletByName(walletName, chainName);
    const chain = this.getChainByName(chainName);
    if (wallet && chain) {
      return wallet.getAccount(chain.chainId);
    }
  }

  async getOfflineSigner(walletName: string, chainName: string) {
    const wallet = this.getChainWalletByName(walletName, chainName);
    const chain = this.getChainByName(chainName);
    if (wallet && chain) {
      return wallet.getOfflineSigner(chain.chainId);
    }
  }

  async getRpcEndpoint(walletName: string, chainName: string): Promise<string | HttpEndpoint> {
    const wallet = this.getChainWalletByName(walletName, chainName);
    const chain = this.getChainByName(chainName);
    if (wallet && chain) {
      return wallet.getRpcEndpoint(chain.chainId);
    }
    throw new Error(`Wallet ${walletName} or chain ${chainName} not found`);
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

  // 简单的 QR code URI 获取方法
  getQRCodeUri(walletName: string, chainName: string): string | null {
    const state = this.getChainWalletState(walletName, chainName);
    if (isWalletConnectState(state)) {
      return state.qrCodeUri;
    }
    return null;
  }

  // 简单的 QR code URI 设置方法
  setQRCodeUri(walletName: string, chainName: string, uri: string | null): void {
    const state = this.getChainWalletState(walletName, chainName);
    if (isWalletConnectState(state)) {
      this.updateChainWalletState(walletName, chainName, { qrCodeUri: uri });
    }
  }

  // 链钱包连接方法
  async connectChainWallet(walletName: string, chainName: string): Promise<void> {
    const wallet = this.getWalletByName(walletName);
    const chain = this.getChainByName(chainName);

    if (!wallet || !chain) {
      throw new Error(`Wallet ${walletName} or chain ${chainName} not found`);
    }

    const walletState = this.getChainWalletState(walletName, chainName)?.walletState;
    if (walletState === WalletState.NotExist) {
      return;
    }

    this.updateChainWalletState(walletName, chainName, { walletState: WalletState.Connecting });

    // 如果是 WalletConnect 钱包，设置 QR code URI 回调
    if (wallet.info.mode === 'wallet-connect' && 'setOnPairingUriCreatedCallback' in wallet) {
      (wallet as any).setOnPairingUriCreatedCallback((uri: string) => {
        this.setQRCodeUri(walletName, chainName, uri);
      });
    }

    await wallet.connect(chain.chainId);
    this.updateChainWalletState(walletName, chainName, { walletState: WalletState.Connected });

    // 连接成功后清空 QR code URI
    if (wallet.info.mode === 'wallet-connect') {
      this.setQRCodeUri(walletName, chainName, null);
    }

    await this.getAccount(walletName, chainName);
  }

  // 链钱包断开连接方法
  async disconnectChainWallet(walletName: string, chainName: string): Promise<void> {
    const wallet = this.getWalletByName(walletName);
    const chain = this.getChainByName(chainName);

    if (!wallet || !chain) {
      throw new Error(`Wallet ${walletName} or chain ${chainName} not found`);
    }

    try {
      await wallet.disconnect(chain.chainId);
      this.updateChainWalletState(walletName, chainName, { walletState: WalletState.Disconnected });

      // 断开连接时清空 QR code URI
      if (wallet.info.mode === 'wallet-connect') {
        this.setQRCodeUri(walletName, chainName, null);
      }
    } catch (error) {
      this.updateChainWalletState(walletName, chainName, {
        errorMessage: error instanceof Error ? error.message : String(error)
      });
      console.error(`Error disconnecting for chain ${chainName}:`, error);
    }
  }

  // 获取链钱包账户
  async getChainWalletAccount(walletName: string, chainName: string): Promise<WalletAccount> {
    const wallet = this.getWalletByName(walletName);
    const chain = this.getChainByName(chainName);

    if (!wallet || !chain) {
      throw new Error(`Wallet ${walletName} or chain ${chainName} not found`);
    }

    try {
      const existedAccount = this.getChainWalletState(walletName, chainName)?.account;
      if (existedAccount) {
        return existedAccount;
      }
      const account = await wallet.getAccount(chain.chainId);
      this.updateChainWalletState(walletName, chainName, { account });
      return account;
    } catch (error) {
      this.updateChainWalletState(walletName, chainName, {
        errorMessage: error instanceof Error ? error.message : String(error)
      });
      console.error(`Error getting account for chain ${chainName}:`, error);
      throw error;
    }
  }

  // 链钱包签名方法
  async signChainWallet(walletName: string, chainName: string, data: GenericSignRequest): Promise<GenericSignResponse> {
    const wallet = this.getWalletByName(walletName);
    const chain = this.getChainByName(chainName);

    if (!wallet || !chain) {
      throw new Error(`Wallet ${walletName} or chain ${chainName} not found`);
    }

    try {
      const result = await wallet.sign(chain.chainId, data);
      return result;
    } catch (error) {
      this.updateChainWalletState(walletName, chainName, {
        errorMessage: error instanceof Error ? error.message : String(error)
      });
      console.error(`Error signing for chain ${chainName}:`, error);
      throw error;
    }
  }
}