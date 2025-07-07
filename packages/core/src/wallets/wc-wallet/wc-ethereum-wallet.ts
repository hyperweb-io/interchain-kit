import { Chain } from '@chain-registry/types';
import { SessionTypes } from '@walletconnect/types';
import UniversalProvider from '@walletconnect/universal-provider';

import { WalletConnectIcon } from '../../constant';
import { WalletAccount } from '../../types';
import { EthereumSignRequest } from '../../types/sign-request';
import { EthereumSignResponse } from '../../types/sign-response';
import { EthereumWallet } from '../ethereum-wallet';

export class WCEthereumWallet extends EthereumWallet {
  session: SessionTypes.Struct;
  provider: UniversalProvider;
  accountToRestore: WalletAccount | null = null;

  constructor(option?: any) {
    const defaultWalletConnectOption = {
      name: 'WalletConnect Ethereum',
      prettyName: 'Wallet Connect Ethereum',
      mode: 'wallet-connect',
      logo: WalletConnectIcon
    };

    super({ ...defaultWalletConnectOption, ...option });
  }

  setProvider(provider: UniversalProvider) {
    this.provider = provider;
  }

  setAccountToRestore(account: WalletAccount) {
    this.accountToRestore = account;
  }

  async init(): Promise<void> {
    if (!this.provider) {
      throw new Error('Provider must be set before initialization');
    }
    this.bindingEvent();
  }

  // Ethereum-specific connect parameters
  async getConnectParams(chainId: Chain['chainId']) {
    return {
      eip155: {
        methods: [
          'eth_sendTransaction',
          'eth_signTransaction',
          'eth_sign',
          'personal_sign',
          'eth_signTypedData',
          'trust_sendTransaction',
        ],
        chains: [`eip155:${chainId}`],
        events: [] as string[]
      }
    };
  }

  // Connection is handled by parent WCWallet
  async connect(chainId: Chain['chainId']): Promise<void> {
    throw new Error('Connection should be handled by parent WCWallet. Use WCWallet.connect() instead.');
  }

  // Disconnection is handled by parent WCWallet
  async disconnect(chainId: Chain['chainId']): Promise<void> {
    throw new Error('Disconnection should be handled by parent WCWallet. Use WCWallet.disconnect() instead.');
  }

  async getAccount(chainId: Chain['chainId']): Promise<WalletAccount> {
    if (this.accountToRestore) {
      return this.accountToRestore;
    }

    try {
      const accounts = await this.provider.request({
        method: 'eth_requestAccounts',
        params: []
      }, `eip155:${chainId}`) as string[];

      return {
        address: accounts[0],
        pubkey: new Uint8Array(),
        algo: 'eth_secp256k1',
        isNanoLedger: false,
        isSmartContract: false,
        username: 'ethereum'
      };
    } catch (error) {
      console.log('get ethereum account error', error);
      throw error;
    }
  }

  async getOfflineSigner(chainId: Chain['chainId']): Promise<any> {
    return {} as any;
  }

  async sign(chainId: Chain['chainId'], data: EthereumSignRequest): Promise<EthereumSignResponse> {
    throw new Error('Method not implemented.');
  }

  async addSuggestChain(chainId: Chain['chainId']): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async getProvider(chainId: Chain['chainId']): Promise<any> {
    return this.provider;
  }

  bindingEvent(): void {
    // Events are now handled by the parent WCWallet
    // This method is kept for compatibility but does nothing
  }

  unbindingEvent(): void {
    // Events are now handled by the parent WCWallet
    // This method is kept for compatibility but does nothing
  }

  async ping() {
    if (!this.provider) {
      return;
    }
    try {
      await this.provider.client.ping({
        topic: this.session.topic
      });
      return 'success';
    } catch (error) {
      console.log(error);
      return 'failed';
    }
  }
}