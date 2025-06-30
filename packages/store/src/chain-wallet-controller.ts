import { IGenericOfflineSigner } from '@interchainjs/types';
import { AminoGenericOfflineSigner, CosmosAminoDoc, CosmosDirectDoc, DirectGenericOfflineSigner } from '@interchainjs/cosmos/types';
import { Chain } from '@chain-registry/types';
import { BaseWallet, CosmosWallet, EthereumWallet, MultiChainWallet, WalletAccount, WalletManager, WalletState, MultiSignDoc, MultiSignResponse } from '@interchain-kit/core';
import { ObservableState } from './utils/observable-state';
import { ChainWalletState } from './types';
import { isSameConstructor } from './utils';


export class ChainWalletController<
  TSignData extends MultiSignDoc = MultiSignDoc,
  TSignResponse extends MultiSignResponse = MultiSignResponse,
  TOfflineSigner = IGenericOfflineSigner
> extends BaseWallet<TSignData, TSignResponse, TOfflineSigner> {
  walletManager: WalletManager;
  wallet: BaseWallet<TSignData, TSignResponse, TOfflineSigner>;
  chain: Chain;
  state: ObservableState<ChainWalletState>;

  constructor(chain: Chain, wallet: BaseWallet<TSignData, TSignResponse, TOfflineSigner>, walletManager: WalletManager) {
    super(wallet.info);

    this.walletManager = walletManager;

    this.chain = chain;

    this.wallet = wallet;

    this.state = new ObservableState<ChainWalletState>({
      chainName: chain.chainName,
      walletName: wallet.info.name,
      walletState: WalletState.Disconnected,
      rpcEndpoint: chain.apis?.rpc?.[0]?.address || '',
      account: null,
      errorMessage: null
    });
  }

  async init(): Promise<void> {
    try {
      await this.wallet.init();
    } catch (error) {
      this.state.proxy.errorMessage = error instanceof Error ? error.message : String(error);
    }
  }

  async connect(): Promise<void> {
    try {
      this.state.proxy.walletState = WalletState.Connecting;
      await this.wallet.connect(this.chain.chainId);
      this.state.proxy.walletState = WalletState.Connected;
    } catch (error) {
      this.state.proxy.errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error connecting to wallet for chain ${this.chain.chainName}:`, error);
    }
  }

  async disconnect(): Promise<void> {
    await this.wallet.disconnect(this.chain.chainId);
    this.state.proxy.walletState = WalletState.Disconnected;
  }

  async getAccount(): Promise<WalletAccount> {
    try {
      const existedAccount = this.state.proxy.account;
      if (existedAccount) {
        return existedAccount;
      }
      const account = await this.wallet.getAccount(this.chain.chainId);
      this.state.proxy.account = account;
      this.state.proxy.walletState = WalletState.Connected;
      return account;
    } catch (error) {
      this.state.proxy.errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error getting account for chain ${this.chain.chainName}:`, error);
      throw error;
    }
  }

  async sign(chainId: Chain['chainId'], data: TSignData): Promise<TSignResponse> {
    return this.wallet.sign(chainId || this.chain.chainId, data);
  }

  async getOfflineSigner(): Promise<TOfflineSigner> {
    if (this.chain.chainType === 'cosmos') {
      const preferredSignType = this.walletManager.getPreferSignType(this.chain.chainId);
      const cosmosWallet = this.getWalletOfType(CosmosWallet);
      if (preferredSignType === 'amino') {
        return new AminoGenericOfflineSigner({
          getAccounts: async () => [await this.getAccount()],
          signAmino: async (signerAddress: string, signDoc: CosmosAminoDoc) => {
            try {
              const result = await cosmosWallet.signAmino(this.chain.chainId, signerAddress, signDoc);
              return result;
            } catch (error) {
              this.state.proxy.errorMessage = error instanceof Error ? error.message : String(error);
              console.error(`Error signing Amino for chain ${this.chain.chainName}:`, error);
              throw error;
            }
          }
        }) as unknown as TOfflineSigner;
      }
      if (preferredSignType === 'direct') {
        return new DirectGenericOfflineSigner({
          getAccounts: async () => [await cosmosWallet.getAccount(this.chain.chainId)],
          signDirect: async (signerAddress: string, signDoc: CosmosDirectDoc) => {
            try {
              const result = await cosmosWallet.signDirect(this.chain.chainId, signerAddress, signDoc);
              return result;
            } catch (error) {
              this.state.proxy.errorMessage = error instanceof Error ? error.message : String(error);
              console.error(`Error signing Direct for chain ${this.chain.chainName}:`, error);
              throw error;
            }
          }
        }) as unknown as TOfflineSigner;
      }
    }
    return this.wallet.getOfflineSigner(this.chain.chainId);
  }

  async addSuggestChain(): Promise<void> {
    return this.wallet.addSuggestChain(this.chain.chainId);
  }

  async getProvider(): Promise<any> {
    return this.wallet.getProvider(this.chain.chainId);
  }

  subscribe(listener: (state: ChainWalletState) => void): () => void {
    return this.state.subscribe(listener);
  }

  getWalletOfType<T>(
    WalletClass: new (...args: any[]) => T
  ): T | undefined {
    if (this.wallet instanceof WalletClass) {
      return this.wallet as T;
    }
    if (this.wallet instanceof MultiChainWallet) {
      if (isSameConstructor(WalletClass as any, CosmosWallet as any)) {
        const cosmosWallet = this.wallet.getWalletByChainType('cosmos');
        if (cosmosWallet) {
          return cosmosWallet as T;
        }
      }
      if (isSameConstructor(WalletClass as any, EthereumWallet as any)) {
        const ethereumWallet = this.wallet.getWalletByChainType('eip155');
        if (ethereumWallet) {
          return ethereumWallet as T;
        }
      }
    }
    throw new Error(`No wallet of type ${WalletClass.name} found`);
  }

  async getRpcEndpoint() {
    const existedRpcEndpoint = this.state.proxy.rpcEndpoint;
    if (existedRpcEndpoint) {
      return existedRpcEndpoint;
    }
    const rpcEndpoint = await this.walletManager.getRpcEndpoint(this.wallet.info.name, this.chain.chainId);

    this.state.proxy.rpcEndpoint = rpcEndpoint;
    return rpcEndpoint;
  }

  getChainWalletState() {
    return this.state.proxy
  }
}