import { Chain } from '@chain-registry/types';
import { BaseWallet, GenericOfflineSigner, GenericSignRequest, GenericSignResponse, UniWallet, WalletAccount, WalletManager, WalletState } from '@interchain-kit/core';
import { AminoGenericOfflineSigner, AminoSignResponse, CosmosAminoDoc, CosmosDirectDoc, DirectGenericOfflineSigner, DirectSignResponse } from '@interchainjs/cosmos/types';
import { HttpEndpoint } from '@interchainjs/types';

import { isWalletConnectState } from './types';
import { calculateWalletState, getWalletErrorMessage } from './utils/flat-state-utils';
import { WalletStoreManager } from './wallet-store-manager';

export class WalletStore extends BaseWallet<GenericSignRequest, GenericSignResponse, GenericOfflineSigner> {

  walletManager: WalletManager;
  wallet: UniWallet;
  chains: Chain[] = [];
  storeManager: WalletStoreManager;

  constructor(wallet: UniWallet, chains: Chain[], walletManager: WalletManager, storeManager: WalletStoreManager) {
    super(wallet.info);

    this.walletManager = walletManager;
    this.chains = chains;
    this.wallet = wallet;
    this.storeManager = storeManager;
  }

  async init(): Promise<void> {
    try {
      this.wallet.events.on('accountChanged', () => {
        console.log('accountChanged');
        // 重新获取所有链的账户
        this.chains.forEach(chain => {
          this.getAccount(chain.chainId);
        });
      });
      await this.wallet.init();

      // 初始化所有链的状态
      this.chains.forEach(chain => {
        this.storeManager.updateChainWalletState(
          this.wallet.info.name,
          chain.chainName,
          { walletState: WalletState.Disconnected }
        );
      });
    } catch (error) {
      this.chains.forEach(chain => {
        this.storeManager.updateChainWalletState(
          this.wallet.info.name,
          chain.chainName,
          { errorMessage: error instanceof Error ? error.message : String(error) }
        );
      });
    }
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
    if (!chain) {
      throw new Error(`Chain with ID ${chainId} not found`);
    }

    const walletState = this.storeManager.getChainWalletState(this.wallet.info.name, chain.chainName)?.walletState;
    if (walletState === WalletState.NotExist) {
      return;
    }

    this.storeManager.updateChainWalletState(
      this.wallet.info.name,
      chain.chainName,
      { walletState: WalletState.Connecting }
    );

    // 如果是 WalletConnect 钱包，设置 QR code URI 回调
    if (this.wallet.info.mode === 'wallet-connect' && 'setOnPairingUriCreatedCallback' in this.wallet) {
      (this.wallet as any).setOnPairingUriCreatedCallback((uri: string) => {
        this.storeManager.setQRCodeUri(this.wallet.info.name, chain.chainName, uri);
      });
    }

    await this.wallet.connect(chainId);
    this.storeManager.updateChainWalletState(
      this.wallet.info.name,
      chain.chainName,
      { walletState: WalletState.Connected }
    );

    // 连接成功后清空 QR code URI
    if (this.wallet.info.mode === 'wallet-connect') {
      this.storeManager.setQRCodeUri(this.wallet.info.name, chain.chainName, null);
    }

    await this.getAccount(chainId);
  }

  async disconnect(chainId: Chain['chainId']): Promise<void> {
    const chain = this.wallet.getChainById(chainId);
    if (!chain) {
      throw new Error(`Chain with ID ${chainId} not found`);
    }

    try {
      await this.wallet.disconnect(chainId);
      this.storeManager.updateChainWalletState(
        this.wallet.info.name,
        chain.chainName,
        { walletState: WalletState.Disconnected }
      );

      // 断开连接时清空 QR code URI
      if (this.wallet.info.mode === 'wallet-connect') {
        this.storeManager.setQRCodeUri(this.wallet.info.name, chain.chainName, null);
      }
    } catch (error) {
      this.storeManager.updateChainWalletState(
        this.wallet.info.name,
        chain.chainName,
        { errorMessage: error instanceof Error ? error.message : String(error) }
      );
      console.error(`Error disconnecting for chain ${chain.chainName}:`, error);
    }
  }

  async getAccount(chainId: Chain['chainId']): Promise<WalletAccount> {
    const chain = this.wallet.getChainById(chainId);
    if (!chain) {
      throw new Error(`Chain with ID ${chainId} not found`);
    }

    try {
      const existedAccount = this.storeManager.getChainWalletState(this.wallet.info.name, chain.chainName)?.account;
      if (existedAccount) {
        return existedAccount;
      }
      const account = await this.wallet.getAccount(chainId);
      this.storeManager.updateChainWalletState(this.wallet.info.name, chain.chainName, { account });
      return account;
    } catch (error) {
      this.storeManager.updateChainWalletState(
        this.wallet.info.name,
        chain.chainName,
        { errorMessage: error instanceof Error ? error.message : String(error) }
      );
      console.error(`Error getting account for chain ${chain.chainName}:`, error);
      throw error;
    }
  }

  async sign(chainId: Chain['chainId'], data: GenericSignRequest): Promise<GenericSignResponse> {
    const chain = this.wallet.getChainById(chainId);
    if (!chain) {
      throw new Error(`Chain with ID ${chainId} not found`);
    }

    try {
      const result = await this.wallet.sign(chainId, data);
      return result;
    } catch (error) {
      this.storeManager.updateChainWalletState(
        this.wallet.info.name,
        chain.chainName,
        { errorMessage: error instanceof Error ? error.message : String(error) }
      );
      console.error(`Error signing for chain ${chain.chainName}:`, error);
      throw error;
    }
  }

  async getOfflineSigner(chainId: Chain['chainId']): Promise<GenericOfflineSigner> {
    const chain = this.wallet.getChainById(chainId);
    if (!chain) {
      throw new Error(`Chain with ID ${chainId} not found`);
    }

    if (chain.chainType === 'cosmos') {
      const preferredSignType = this.walletManager.getPreferSignType(chainId);
      if (preferredSignType === 'amino') {
        return new AminoGenericOfflineSigner({
          getAccounts: async () => [await this.getAccount(chainId)],
          signAmino: async (signerAddress: string, signDoc: CosmosAminoDoc) => {
            const signRequest: GenericSignRequest = {
              method: 'cosmos_amino',
              data: signDoc,
              chainId: chainId,
              signerAddress: signerAddress,
            };

            const result = await this.sign(chainId, signRequest);
            return result.result as AminoSignResponse;
          }
        }) as unknown as GenericOfflineSigner;
      }
      if (preferredSignType === 'direct') {
        return new DirectGenericOfflineSigner({
          getAccounts: async () => [await this.getAccount(chainId)],
          signDirect: async (signerAddress: string, signDoc: CosmosDirectDoc) => {
            const signRequest: GenericSignRequest = {
              method: 'cosmos_direct',
              data: signDoc,
              chainId: chainId,
              signerAddress: signerAddress,
            };
            const result = await this.sign(chainId, signRequest);
            return result.result as DirectSignResponse;
          }
        }) as unknown as GenericOfflineSigner;
      }
    }
    return this.wallet.getOfflineSigner(chainId);
  }

  async addSuggestChain(chainId: Chain['chainId']): Promise<void> {
    const chain = this.wallet.getChainById(chainId);
    if (!chain) {
      throw new Error(`Chain with ID ${chainId} not found`);
    }
    return this.wallet.addSuggestChain(chainId);
  }

  async getProvider(chainId: Chain['chainId']): Promise<any> {
    const chain = this.wallet.getChainById(chainId);
    if (!chain) {
      throw new Error(`Chain with ID ${chainId} not found`);
    }
    return this.wallet.getProvider(chainId);
  }

  async getRpcEndpoint(chainId: Chain['chainId']): Promise<string | HttpEndpoint> {
    const chain = this.wallet.getChainById(chainId);
    if (!chain) {
      throw new Error(`Chain with ID ${chainId} not found`);
    }

    const existedRpcEndpoint = this.storeManager.getChainWalletState(this.wallet.info.name, chain.chainName)?.rpcEndpoint;
    if (existedRpcEndpoint) {
      return existedRpcEndpoint;
    }
    const rpcEndpoint = await this.walletManager.getRpcEndpoint(this.wallet.info.name, chain.chainName);

    this.storeManager.updateChainWalletState(this.wallet.info.name, chain.chainName, { rpcEndpoint });
    return rpcEndpoint;
  }

  // 获取 QR code URI
  getQRCodeUri(chainId: Chain['chainId']): string | null {
    const chain = this.wallet.getChainById(chainId);
    if (!chain) {
      return null;
    }

    const state = this.storeManager.getChainWalletState(this.wallet.info.name, chain.chainName);
    if (isWalletConnectState(state)) {
      return state.qrCodeUri;
    }
    return null;
  }

  // 设置 QR code URI
  setQRCodeUri(chainId: Chain['chainId'], uri: string | null): void {
    const chain = this.wallet.getChainById(chainId);
    if (!chain) {
      return;
    }

    const state = this.storeManager.getChainWalletState(this.wallet.info.name, chain.chainName);
    if (isWalletConnectState(state)) {
      this.storeManager.updateChainWalletState(this.wallet.info.name, chain.chainName, { qrCodeUri: uri });
    }
  }
} 