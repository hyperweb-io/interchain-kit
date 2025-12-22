import { Chain } from '@chain-registry/types';
import { BaseWallet, CosmosWallet, DirectSignDoc, getWalletByType, isInstanceOf, OfflineAminoSigner, OfflineDirectSigner, SignType, WalletAccount, WalletManager, WalletState, WCWallet } from '@interchain-kit/core';
import { StdSignDoc } from '@interchainjs/types';

import { InterchainStore } from '../store';

export class ChainWalletStore extends BaseWallet {

  networkWalletMap: Map<Chain['chainType'], BaseWallet>;

  wallet: BaseWallet;
  chain: Chain;

  store: InterchainStore;

  walletManager: WalletManager;

  constructor(wallet: BaseWallet, chain: Chain, store: InterchainStore, walletManager: WalletManager) {
    super(wallet.info);
    this.wallet = wallet;
    this.chain = chain;
    this.store = store;
    this.walletManager = walletManager;
    this.info = this.wallet.info;
  }

  get walletState(): WalletState {
    return this.store.getChainWalletState(this.chain.chainName, this.wallet.info.name)?.walletState || WalletState.NotExist;
  }

  get errorMessage(): string {
    return this.store.getChainWalletState(this.chain.chainName, this.wallet.info.name)?.errorMessage || '';
  }

  async init(): Promise<void> {
    this.wallet.events.on('accountChanged', () => {
      this.refreshAccount();
    });
  }
  async connect(): Promise<void> {

    const chainWalletState = this.store.getChainWalletState(this.wallet.info.name, this.chain.chainName);
    if (chainWalletState && chainWalletState.walletState === WalletState.NotExist) {
      return Promise.resolve();
    }

    if (isInstanceOf(this.wallet, WCWallet)) {
      this.wallet.setOnPairingUriCreatedCallback((uri) => {
        console.log('Callback called with uri:', uri);
        this.store.setState({ walletConnectQRCodeUri: uri });
      });
    }

    try {
      this.store.updateChainWalletState(this.wallet.info.name, this.chain.chainName, { walletState: WalletState.Connecting, errorMessage: '' });
      await this.wallet.connect(this.chain.chainId);
      const account = await this.getAccount();
      this.store.updateChainWalletState(this.wallet.info.name, this.chain.chainName, { walletState: WalletState.Connected, account });
    } catch (error) {
      this.store.updateChainWalletState(this.wallet.info.name, this.chain.chainName, { walletState: WalletState.Disconnected, errorMessage: (error as any).message });
    }
  }
  async disconnect(): Promise<void> {

    if (isInstanceOf(this.wallet, WCWallet)) {
      this.wallet.events.on('disconnect', () => {
        this.store.updateChainWalletState(this.wallet.info.name, this.chain.chainName, { walletState: WalletState.Disconnected, account: undefined });
      });
    }

    try {
      await this.wallet.disconnect(this.chain.chainId);
      this.store.updateChainWalletState(this.wallet.info.name, this.chain.chainName, { walletState: WalletState.Disconnected, account: undefined, errorMessage: '' });
    } catch (error) {
      console.error(error);
    }
  }

  async refreshAccount(): Promise<void> {
    try {
      const account = await this.wallet.getAccount(this.chain.chainId);

      this.store.updateChainWalletState(this.wallet.info.name, this.chain.chainName, { account });
    } catch (error) {
      this.store.updateChainWalletState(this.wallet.info.name, this.chain.chainName, { walletState: WalletState.Disconnected, account: undefined, errorMessage: (error as any).message });
    }
  }

  async getAccount(): Promise<WalletAccount> {
    const existed = this.store.getChainWalletState(this.wallet.info.name, this.chain.chainName)?.account;
    if (existed) {
      return existed;
    }
    const account = await this.wallet.getAccount(this.chain.chainId);
    this.store.updateChainWalletState(this.wallet.info.name, this.chain.chainName, { account });
    return account;
  }
  addSuggestChain(): Promise<void> {
    return this.wallet.addSuggestChain(this.chain.chainId);
  }
  getProvider(): Promise<any> {
    return this.wallet.getProvider(this.chain.chainId);
  }
  async getOfflineSigner(preferSignType?: SignType): Promise<OfflineAminoSigner | OfflineDirectSigner> {

    const cosmosWallet = getWalletByType(this.wallet, CosmosWallet);

    const preferredSignTypeFromSettings = this.walletManager.getPreferSignType(this.chain.chainName);

    const account = await this.getAccount();

    const aminoOfflineSigner = {
      getAccounts: async () => [account],
      signAmino: async (signer: string, signDoc: StdSignDoc) => {
        return cosmosWallet.signAmino(this.chain.chainId, signer, signDoc, {});
      }
    };
    const directOfflineSigner = {
      getAccounts: async () => [account],
      signDirect: async (signer: string, signDoc: DirectSignDoc) => {
        return cosmosWallet.signDirect(this.chain.chainId, signer, signDoc, {});
      }
    };

    const signType = preferSignType || preferredSignTypeFromSettings;


    if (account.isNanoLedger || signType === 'amino') {
      return aminoOfflineSigner;
    }
    return directOfflineSigner;

  }

  getWalletOfType<T>(WalletClass: new (...args: any[]) => T) {
    return getWalletByType(this.wallet, WalletClass);
  }
}