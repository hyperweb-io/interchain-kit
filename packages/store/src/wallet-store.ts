import { Chain } from '@chain-registry/types';
import { BaseWallet, GenericOfflineSigner, GenericSignRequest, GenericSignResponse, UniWallet, WalletAccount, WalletManager, WalletState } from '@interchain-kit/core';

import { ChainWalletStore } from './chain-wallet-store';
import { calculateWalletState, getWalletErrorMessage } from './utils/flat-state-utils';
import { WalletStoreManager } from './wallet-store-manager';

export class WalletStore extends BaseWallet<GenericSignRequest, GenericSignResponse, GenericOfflineSigner> {

  walletManager: WalletManager;
  wallet: UniWallet;
  chains: Chain[] = [];
  storeManager: WalletStoreManager;
  chainWallets: Map<Chain['chainName'], ChainWalletStore> = new Map<Chain['chainName'], ChainWalletStore>();

  constructor(wallet: UniWallet, chains: Chain[], walletManager: WalletManager, storeManager: WalletStoreManager) {
    super(wallet.info);

    this.walletManager = walletManager;
    this.chains = chains;
    this.wallet = wallet;
    this.storeManager = storeManager;

    this.chains.forEach(chain => {
      this.chainWallets.set(chain.chainName, new ChainWalletStore(wallet, chain, walletManager, storeManager));
    });
  }

  getChainWalletByChainName(chainName: Chain['chainName']): ChainWalletStore {
    const chainWallet = this.chainWallets.get(chainName);
    if (!chainWallet) {
      throw new Error(`Chain wallet with name ${chainName} not found`);
    }
    return chainWallet;
  }

  async init(): Promise<void> {

    // this.wallet.events.on('accountChanged', () => {
    //   console.log('accountChanged');
    //   // 重新获取所有链的账户
    //   this.chains.forEach(chain => {
    //     this.getAccount(chain.chainId);
    //   });
    // });

    const chainWallets = Array.from(this.chainWallets.values());
    await Promise.all(chainWallets.map(async chainWallet => chainWallet.init()));

  }

  get walletState() {
    return this.getWalletState();
  }

  get errorMessage(): string | undefined {
    return getWalletErrorMessage(this.storeManager.state.proxy.chainWalletStates, this.wallet.info.name);
  }

  getWalletState(): WalletState {
    return calculateWalletState(this.storeManager.state.proxy.chainWalletStates, this.wallet.info.name);
  }

  async connect(chainId: Chain['chainId']): Promise<void> {
    const chain = this.wallet.getChainById(chainId);
    await this.getChainWalletByChainName(chain.chainName).connect();
  }

  async disconnect(chainId: Chain['chainId']): Promise<void> {
    const chain = this.wallet.getChainById(chainId);
    await this.getChainWalletByChainName(chain.chainName).disconnect();
  }

  async getAccount(chainId: Chain['chainId']): Promise<WalletAccount> {
    const chain = this.wallet.getChainById(chainId);
    return this.getChainWalletByChainName(chain.chainName).getAccount();
  }

  async sign(chainId: Chain['chainId'], data: GenericSignRequest): Promise<GenericSignResponse> {
    const chain = this.wallet.getChainById(chainId);
    return this.getChainWalletByChainName(chain.chainName).sign(chainId, data);
  }

  async getOfflineSigner(chainId: Chain['chainId']): Promise<GenericOfflineSigner> {
    const chain = this.wallet.getChainById(chainId);
    return this.getChainWalletByChainName(chain.chainName).getOfflineSigner();
  }

  async addSuggestChain(chainId: Chain['chainId']): Promise<void> {
    const chain = this.wallet.getChainById(chainId);
    return this.getChainWalletByChainName(chain.chainName).addSuggestChain();
  }

  async getProvider(chainId: Chain['chainId']): Promise<any> {
    const chain = this.wallet.getChainById(chainId);
    return this.getChainWalletByChainName(chain.chainName).getProvider();
  }

} 