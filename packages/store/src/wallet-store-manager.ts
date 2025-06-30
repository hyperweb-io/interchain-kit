import { Chain, AssetList } from '@chain-registry/types';
import { HttpEndpoint } from '@interchainjs/types';
import { Config, DownloadInfo, EndpointOptions, SignerOptions, SignType, WalletManager, WalletName } from "@interchain-kit/core";
import { ObservableState } from "./utils/observable-state";
import { WalletController } from "./wallet-controller";
import { ChainWalletState, WalletStoreManagerState } from './types';
import { ChainWalletController } from "./chain-wallet-controller";
import { SigningOptions as InterchainSigningOptions } from '@interchainjs/cosmos/types/signing-client';
import { SigningClient } from '@interchainjs/cosmos/signing-client';
import { ICosmosGenericOfflineSigner } from '@interchainjs/cosmos/types';

export class WalletStoreManager {
  walletManager: WalletManager;
  walletControllers: Map<WalletName, WalletController> = new Map<WalletName, WalletController>();
  state: ObservableState<WalletStoreManagerState> = new ObservableState<WalletStoreManagerState>({ isReady: false, currentWalletName: '', currentChainName: '' });
  config: Config
  chains: Chain[] = []
  assetLists: AssetList[];
  wallets: WalletController[] = []

  constructor(config: Config) {
    this.walletManager = new WalletManager(config.chains, config.assetLists, config.wallets, config.signerOptions, config.endpointOptions);
    this.config = config;
    this.chains = config.chains
    this.assetLists = config.assetLists

    config.wallets.forEach((wallet) => {
      wallet.setChainMap(config.chains);
      wallet.setAssetLists(config.assetLists);
      const walletController = new WalletController(wallet, config.chains, this.walletManager);
      this.walletControllers.set(wallet.info.name, walletController);
      this.wallets.push(walletController);
    })
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

  setCurrentWalletName(name: WalletName) {
    this.state.proxy.currentWalletName = name;
  }

  setCurrentChainName(chainName: string) {
    this.state.proxy.currentChainName = chainName;
  }

  getChainWalletState(walletName: WalletName, chainName: string) {
    const chainWallet = this.getChainWalletByName(walletName, chainName);
    return chainWallet?.state.proxy || {} as ChainWalletState
  }

  getWalletByName(name: WalletName): WalletController | undefined {
    const wallet = this.walletControllers.get(name);
    return wallet;
  }
  getChainWalletByName(walletName: WalletName, chainName: string): ChainWalletController | undefined {
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


    return this.getChainWalletByName(walletName, chainName)?.getRpcEndpoint()
  }

  async getSigningClient(walletName: string, chainName: string): Promise<SigningClient> {
    const rpcEndpoint = await this.getRpcEndpoint(walletName, chainName)
    const offlineSigner = await this.getOfflineSigner(walletName, chainName) as ICosmosGenericOfflineSigner
    const signerOptions = await this.getSignerOptions(chainName)
    const signingClient = await SigningClient.connectWithSigner(rpcEndpoint, offlineSigner, signerOptions)
    return signingClient
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