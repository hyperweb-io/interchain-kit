import { Chain } from '@chain-registry/types';
import { BaseWallet, clientNotExistError, CosmosAminoSignRequest, GenericOfflineSigner, GenericSignRequest, GenericSignResponse, UniWallet, WalletAccount, WalletManager, WalletState, WCWallet } from '@interchain-kit/core';
import { AminoGenericOfflineSigner, AminoSignResponse, DirectGenericOfflineSigner, DirectSignResponse } from '@interchainjs/cosmos/types/wallet';
import { HttpEndpoint } from '@interchainjs/types';

import { ChainWalletState } from './types';
import { WalletStoreManager } from './wallet-store-manager';


export class ChainWalletStore extends BaseWallet<GenericSignRequest, GenericSignResponse, GenericOfflineSigner> {

  wallet: UniWallet;
  chain: Chain;
  walletManager: WalletManager;
  storeManager: WalletStoreManager;
  constructor(wallet: UniWallet, chain: Chain, walletManager: WalletManager, storeManager: WalletStoreManager) {
    super(wallet.info);
    this.wallet = wallet;
    this.chain = chain;
    this.walletManager = walletManager;
    this.storeManager = storeManager;
  }

  updateState(chainWalletState: Partial<ChainWalletState>) {
    this.storeManager.updateChainWalletState(
      this.wallet.info.name,
      this.chain.chainName,
      chainWalletState
    );
  }

  async init(): Promise<void> {
    try {
      await this.wallet.init();
      this.updateState({ walletState: WalletState.Disconnected, errorMessage: null });
    } catch (error) {
      if ((error as any).message === clientNotExistError.message) {
        console.log('clientNotExistError', this.wallet.info.name, this.chain.chainName);
        this.updateState({ walletState: WalletState.NotExist, errorMessage: null });
      } else {
        this.updateState({ errorMessage: error instanceof Error ? error.message : String(error) });
      }
    }
  }
  async connect(): Promise<void> {

    if (this.wallet instanceof WCWallet) {
      this.wallet.setOnPairingUriCreatedCallback((uri) => {
        this.storeManager.setWalletConnectQRCodeUri(uri);
      });
    }


    try {
      const walletState = this.storeManager.getChainWalletState(this.wallet.info.name, this.chain.chainName)?.walletState;
      if (walletState === WalletState.NotExist) {
        return;
      }


      await this.wallet.connect(this.chain.chainId);
      await this.forceGetAccount();
      this.updateState({ walletState: WalletState.Connected });
    } catch (error) {
      this.updateState({ walletState: WalletState.Disconnected });
    }
  }
  async disconnect(): Promise<void> {

    const walletState = this.storeManager.getChainWalletState(this.wallet.info.name, this.chain.chainName)?.walletState;
    if (walletState === WalletState.NotExist) {
      return;
    }


    if (this.wallet instanceof WCWallet) {
      this.storeManager.setWalletConnectQRCodeUri('');
    }

    try {
      await this.wallet.disconnect(this.chain.chainId);
      this.updateState({ walletState: WalletState.Disconnected });
    } catch (error) {
      console.error(error);
    }
  }
  async sign(chainId: string, data: GenericSignRequest): Promise<GenericSignResponse> {
    try {
      const signResponse = await this.wallet.sign(chainId, data);
      return signResponse;
    } catch (error) {
      this.updateState({ errorMessage: error instanceof Error ? error.message : String(error) });
    }
  }

  async getAccount(): Promise<WalletAccount> {
    const existedAccount = this.storeManager.getChainWalletState(this.wallet.info.name, this.chain.chainName)?.account;
    if (existedAccount) {
      return existedAccount;
    }
    const account = await this.wallet.getAccount(this.chain.chainId);
    this.updateState({ account });
    return account;
  }

  async forceGetAccount(): Promise<WalletAccount> {
    const account = await this.wallet.getAccount(this.chain.chainId);
    this.updateState({ account });
    return account;
  }

  async getOfflineSigner(): Promise<GenericOfflineSigner> {
    const preferSignType = this.walletManager.getPreferSignType(this.chain.chainName);
    if (this.chain.chainType === 'cosmos') {
      if (preferSignType === 'amino') {
        return new AminoGenericOfflineSigner({
          getAccounts: async () => [await this.getAccount()],
          signAmino: async (signerAddress, signDoc) => {
            const doc: CosmosAminoSignRequest = {
              method: 'cosmos_amino',
              data: signDoc,
              chainId: this.chain.chainId,
              signerAddress,
            };
            const signResponse = await this.sign(this.chain.chainId, doc);
            return signResponse.result as AminoSignResponse;
          }
        });
      }
      if (preferSignType === 'direct') {
        return new DirectGenericOfflineSigner({
          getAccounts: async () => [await this.getAccount()],
          signDirect: async (signerAddress, signDoc) => {
            const doc: CosmosSignRequest = {
              method: 'cosmos_direct',
              data: signDoc,
              chainId: this.chain.chainId,
              signerAddress,
            };
            const signResponse = await this.sign(this.chain.chainId, doc);
            return signResponse.result as DirectSignResponse;
          }
        });
      }
    }
  }
  async addSuggestChain(): Promise<void> {
    return this.wallet.addSuggestChain(this.chain.chainId);
  }
  async getProvider(): Promise<any> {
    return this.wallet.getProvider(this.chain.chainId);
  }
  async getRpcEndpoint(): Promise<string | HttpEndpoint> {
    const existedRpcEndpoint = this.storeManager.getChainWalletState(this.wallet.info.name, this.chain.chainName)?.rpcEndpoint;
    if (existedRpcEndpoint) {
      return existedRpcEndpoint;
    }
    const rpcEndpoint = await this.walletManager.getRpcEndpoint(this.wallet.info.name, this.chain.chainName);
    this.updateState({ rpcEndpoint });
    return rpcEndpoint;
  }

  getWalletOfType<T extends BaseWallet>(type: new (...args: any[]) => T): T | undefined {
    return this.wallet.getWalletOfType(type);
  }
}