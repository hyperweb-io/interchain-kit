import { Chain } from '@chain-registry/types';
import { PublicKey, Transaction } from '@solana/web3.js';
import UniversalProvider from '@walletconnect/universal-provider';
import base58 from 'bs58';
import { Buffer } from 'buffer';

import { WalletConnectIcon } from '../../constant';
import { WalletAccount } from '../../types';
import { SolanaWallet } from '../solana-wallet';
import { IWCCommon } from './wc-common';
import { WCWallet } from './wc-wallet';

export class WCSolanaWallet extends SolanaWallet implements IWCCommon {
  provider: UniversalProvider;
  wcWallet: WCWallet;

  constructor() {
    super({
      name: 'WalletConnect',
      prettyName: 'Wallet Connect',
      mode: 'wallet-connect',
      logo: WalletConnectIcon
    });
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

  async connect(chainId: Chain['chainId']): Promise<void> {
    return this.wcWallet.connect(chainId);
  }

  async disconnect(chainId: Chain['chainId']): Promise<void> {
    return this.wcWallet.disconnect();
  }

  async getAccount(chainId: Chain['chainId']): Promise<WalletAccount> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    if (!this.provider.session) {
      throw new Error('Session not initialized');
    }


    const accounts = this.provider.session.namespaces.solana.accounts;
    if (accounts.length > 0) {
      // CAIP-10 format: solana:<chain_id>:<address>
      const account = accounts[0].split(':')[2]; // Extract the address part
      const publicKey = new PublicKey(account); // Validate Solana address
      return {
        address: account,
        pubkey: publicKey.toBytes(),
        algo: 'secp256k1',
        username: '',
        isNanoLedger: null,
        isSmartContract: null
      };
    }

  }

  async addSuggestChain(chainId: Chain['chainId']): Promise<void> {
    // Solana chain addition is typically handled by the wallet
    throw new Error('Method not implemented.');
  }

  async getProvider(chainId: Chain['chainId']): Promise<any> {
    return this.provider;
  }

  async request(method: string, params: any): Promise<any> {
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

  async signAllTransactions(transactions: any[]): Promise<any[]> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const result = await this.provider.request({
        method: 'solana_signAllTransactions',
        params: { transactions }
      }, undefined, this.wcWallet?.options?.signingRequestExpiry) as any[];
      return result;
    } catch (error) {
      console.log('sign all transactions error:', error);
      throw error;
    }
  }

  async signAndSendAllTransactions(transactions: any[]): Promise<any> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const result = await this.provider.request({
        method: 'solana_signAndSendAllTransactions',
        params: { transactions }
      }, undefined, this.wcWallet?.options?.signingRequestExpiry);
      return result;
    } catch (error) {
      console.log('sign and send all transactions error:', error);
      throw error;
    }
  }

  async signAndSendTransaction(transaction: Transaction): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const result = await this.provider.request({
        method: 'solana_signAndSendTransaction',
        params: {
          transaction: transaction.serialize({ verifySignatures: false }).toString('base64')
        }
      }, undefined, this.wcWallet?.options?.signingRequestExpiry) as string;
      return result;
    } catch (error) {
      console.log('sign and send transaction error:', error);
      throw error;
    }
  }

  async signIn(data: any): Promise<{ address: string; signature: Uint8Array; signedMessage: Uint8Array }> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const result = await this.provider.request({
        method: 'solana_signIn',
        params: { data }
      }) as { address: string; signature: Uint8Array; signedMessage: Uint8Array };
      return result;
    } catch (error) {
      console.log('sign in error:', error);
      throw error;
    }
  }

  async signMessage(message: Uint8Array, encoding?: 'utf8' | 'hex'): Promise<Uint8Array> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    const { address } = await this.getAccount('solana');

    try {
      const result = await this.provider.request({
        method: 'solana_signMessage',
        params: { message: base58.encode(message), pubkey: address }
      }, undefined, this.wcWallet?.options?.signingRequestExpiry) as Uint8Array;
      return result;
    } catch (error) {
      console.log('sign message error:', error);
      throw error;
    }
  }

  async signTransaction(transaction: Transaction): Promise<Transaction> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {

      const { signature } = await this.provider.client.request<{
        signature: string
        transaction?: string
      }>({
        chainId: this.provider.session.namespaces.solana.chains[0],
        topic: this.provider.session.topic,
        request: {
          method: 'solana_signTransaction',
          params: {
            ...transaction,
            transaction: transaction.serialize({ verifySignatures: false }).toString('base64')
          }
        },
        expiry: this.wcWallet?.options?.signingRequestExpiry,
      });

      const account = await this.getAccount('solana');

      transaction.addSignature(new PublicKey(account.address), Buffer.from(base58.decode(signature)));

      return transaction;
    } catch (error) {
      console.log('sign transaction error:', error);
      throw error;
    }
  }
}
