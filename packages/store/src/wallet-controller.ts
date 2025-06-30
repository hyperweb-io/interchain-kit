import { IGenericOfflineSigner } from '@interchainjs/types';
import { Chain } from '@chain-registry/types';
import { BaseWallet, WalletManager, WalletState, WalletAccount, MultiSignDoc, MultiSignResponse } from '@interchain-kit/core';
import { ChainWalletController } from './chain-wallet-controller';
import { WalletControllerState } from './types';
import { ObservableState } from './utils/observable-state';

export class WalletController<
  TSignData extends MultiSignDoc = MultiSignDoc,
  TSignResponse extends MultiSignResponse = MultiSignResponse,
  TOfflineSigner = IGenericOfflineSigner
> extends BaseWallet<TSignData, TSignResponse, TOfflineSigner> {

  walletManager: WalletManager;

  wallet: BaseWallet<TSignData, TSignResponse, TOfflineSigner>;

  chains: Chain[] = [];

  chainWallets: Map<Chain['chainName'], ChainWalletController<TSignData, TSignResponse, TOfflineSigner>> = new Map();

  state: ObservableState<WalletControllerState> = new ObservableState<WalletControllerState>({
    walletState: WalletState.NotExist,
  });

  constructor(wallet: BaseWallet<TSignData, TSignResponse, TOfflineSigner>, chains: Chain[], walletManager: WalletManager) {
    super(wallet.info);

    this.walletManager = walletManager;

    this.chains = chains;

    this.wallet = wallet;

    // Initialize state with proper initial walletState
    this.state = new ObservableState<WalletControllerState>({
      walletState: WalletState.NotExist,
    });

    this.chains.forEach(chain => {
      // Initialize chain wallets
      const chainWallet = new ChainWalletController(chain, this.wallet, this.walletManager);
      this.chainWallets.set(chain.chainName, chainWallet);
    });
  }

  async init(): Promise<void> {
    const chainWallets = Array.from(this.chainWallets.values());
    await Promise.all(chainWallets.map(async (chainWallet) => chainWallet.init()));
  }

  get walletState() {
    return this.getWalletState()
  }

  get errorMessage(): string | undefined {
    // Collect error messages from all chain wallets
    const errorMessages = Array.from(this.chainWallets.values())
      .map(chainWallet => chainWallet.state.proxy.errorMessage)
      .filter(message => message !== undefined);
    // If any chain wallet has an error message, return the first one
    return errorMessages.length > 0 ? errorMessages[0] : undefined;
  }

  getWalletState(): WalletState {
    const walletStates = Array.from(this.chainWallets.values()).map(chainWallet => chainWallet.state.proxy.walletState);

    let state: WalletState = WalletState.NotExist;

    // Check for Connecting state first - if any chain is connecting, return Connecting
    if (walletStates.some(state => state === WalletState.Connecting)) {
      state = WalletState.Connecting;
    }
    // Then check for Connected state - if any chain is connected, return Connected
    else if (walletStates.some(state => state === WalletState.Connected)) {
      state = WalletState.Connected;
    }
    // Then check if all chains are disconnected
    else if (walletStates.every(state => state === WalletState.Disconnected)) {
      state = WalletState.Disconnected;
    }

    return state;
  }

  getChainWalletByChainName(chainName: string): ChainWalletController<TSignData, TSignResponse, TOfflineSigner> | undefined {
    const chainWallet = this.chainWallets.get(chainName);
    return chainWallet;
  }

  subscribe(listener: (state: WalletControllerState) => void): () => void {
    return this.state.subscribe(listener);
  }

  async connect(chainId: Chain['chainId']): Promise<void> {
    const chain = this.wallet.getChainById(chainId);
    await this.getChainWalletByChainName(chain.chainName)?.connect();
  }

  async disconnect(chainId: Chain['chainId']): Promise<void> {
    const chain = this.wallet.getChainById(chainId);
    await this.getChainWalletByChainName(chain.chainName)?.disconnect();
  }

  async getAccount(chainId: Chain['chainId']): Promise<WalletAccount> {
    const chain = this.wallet.getChainById(chainId);
    return this.getChainWalletByChainName(chain.chainName)?.getAccount();
  }

  async sign(chainId: Chain['chainId'], data: TSignData): Promise<TSignResponse> {
    const chain = this.wallet.getChainById(chainId);
    return this.getChainWalletByChainName(chain.chainName)?.sign(chainId, data);
  }

  async getOfflineSigner(chainId: Chain['chainId']): Promise<TOfflineSigner> {
    const chain = this.wallet.getChainById(chainId);
    return this.getChainWalletByChainName(chain.chainName)?.getOfflineSigner();
  }

  async addSuggestChain(chainId: Chain['chainId']): Promise<void> {
    const chain = this.wallet.getChainById(chainId);
    return this.getChainWalletByChainName(chain.chainName)?.addSuggestChain();
  }

  async getProvider(chainId: Chain['chainId']): Promise<any> {
    const chain = this.wallet.getChainById(chainId);
    return this.getChainWalletByChainName(chain.chainName)?.getProvider();
  }
}