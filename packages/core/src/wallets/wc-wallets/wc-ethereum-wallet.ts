import { Chain } from '@chain-registry/types';
import UniversalProvider from '@walletconnect/universal-provider';

import { WalletConnectIcon } from '../../constant';
import { WalletAccount } from '../../types';
import { EthereumWallet } from '../ethereum-wallet';
import { IWCCommon } from './wc-common';
import { WCWallet } from './wc-wallet';

export class WCEthereumWallet extends EthereumWallet implements IWCCommon {

  provider: UniversalProvider;
  wcWallet: WCWallet;

  constructor() {
    super({
      name: 'WalletConnect',
      prettyName: 'Wallet Connect',
      mode: 'wallet-connect',
      logo: WalletConnectIcon
    });
    this.isSwitchingNetwork = false;
  }
  setWCWallet(wallet: WCWallet): void {
    this.wcWallet = wallet;
  }
  getWCWallet(): WCWallet {
    return this.wcWallet;
  }

  setWCProvider(provider: UniversalProvider): void {
    this.provider = provider;
  }
  getWCProvider(): UniversalProvider {
    return this.provider;
  }

  bindingEvent(): void {
    // Event binding is handled by the parent WCWallet
    // This method can be extended if needed
  }

  async init(): Promise<void> {
    // Initialization is handled by the parent WCWallet
    return Promise.resolve();
  }
  connect(chainId: Chain['chainId']): Promise<void> {
    return this.wcWallet.connect(chainId);
  }
  disconnect(chainId: Chain['chainId']): Promise<void> {
    return this.wcWallet.disconnect();
  }
  async getAccount(chainId: Chain['chainId']): Promise<WalletAccount> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const accounts = await this.provider.request({
        method: 'eth_accounts',
        params: []
      }, `eip155:${chainId}`) as string[];

      return {
        address: accounts[0],
        algo: 'eth_secp256k1',
        pubkey: null,
        username: '',
        isNanoLedger: null,
        isSmartContract: null
      };
    } catch (error) {
      console.log('get ethereum account error', error);
      throw error;
    }
  }

  async addSuggestChain(chainId: Chain['chainId']): Promise<void> {
    // Ethereum chain addition is typically handled by the wallet
    throw new Error('Method not implemented.');
  }

  async getProvider(chainId: Chain['chainId']): Promise<any> {
    return this.provider;
  }

  async switchChain(chainId: string): Promise<void> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      await this.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${parseInt(chainId).toString(16)}` }]
      }, `eip155:${chainId}`);
    } catch (error) {
      console.log('switch chain error:', error);
      throw error;
    }
  }

  async sendTransaction(transactionParameters: any): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const result = await this.provider.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters]
      }, undefined, this.wcWallet?.options?.signingRequestExpiry) as string;
      return result;
    } catch (error) {
      console.log('send transaction error:', error);
      throw error;
    }
  }

  async signMessage(message: string): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const result = await this.provider.request({
        method: 'personal_sign',
        params: [message]
      }, undefined, this.wcWallet?.options?.signingRequestExpiry) as string;
      return result;
    } catch (error) {
      console.log('sign message error:', error);
      throw error;
    }
  }

  async getCurrentChainId(): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const chainId = await this.provider.request({
        method: 'eth_chainId',
        params: []
      }) as string;
      return parseInt(chainId, 16).toString();
    } catch (error) {
      console.log('get current chain id error:', error);
      throw error;
    }
  }

  async request(method: string, params?: any[]): Promise<any> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      return await this.provider.request({
        method,
        params: params || []
      });
    } catch (error) {
      console.log('request error:', error);
      throw error;
    }
  }


}