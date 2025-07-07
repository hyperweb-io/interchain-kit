import { Chain } from '@chain-registry/types';
import { SessionTypes, SignClientTypes } from '@walletconnect/types';
import UniversalProvider, { UniversalProviderOpts } from '@walletconnect/universal-provider';

import { WalletConnectIcon } from '../../constant';
import { GenericOfflineSigner, GenericSignRequest, GenericSignResponse, Wallet } from '../../types';
import { UniWallet } from '../multichain-wallet';
import { WCCosmosWallet } from './wc-cosmos-wallet';
import { WCEthereumWallet } from './wc-ethereum-wallet';

export class WCWallet extends UniWallet {
  pairingUri: string;
  session: SessionTypes.Struct;
  provider: UniversalProvider;
  walletConnectOption: UniversalProviderOpts;
  onPairingUriCreated: (uri: string) => void;


  networkWalletMap: Map<Chain['chainType'], WCCosmosWallet | WCEthereumWallet> = new Map();

  constructor(option?: Wallet, walletConnectOption?: SignClientTypes.Options) {
    const defaultWalletConnectOption: Wallet = {
      name: 'WalletConnect',
      prettyName: 'Wallet Connect',
      mode: 'wallet-connect',
      logo: WalletConnectIcon
    };

    super({ ...defaultWalletConnectOption, ...option });
    this.walletConnectOption = walletConnectOption;
  }

  setWalletConnectOption(walletConnectOption: UniversalProviderOpts) {
    this.walletConnectOption = walletConnectOption;
  }

  async init(): Promise<void> {
    this.events.removeAllListeners();

    const defaultOption: UniversalProviderOpts = {
      projectId: '15a12f05b38b78014b2bb06d77eecdc3',
      relayUrl: 'wss://relay.walletconnect.org',
      metadata: {
        name: 'Example Dapp',
        description: 'Example Dapp',
        url: '#',
        icons: ['https://walletconnect.com/walletconnect-logo.png']
      }
    };

    const savedStringifySession = localStorage.getItem('wc-session');
    const savedSession = savedStringifySession ? JSON.parse(savedStringifySession) : undefined;

    this.provider = await UniversalProvider.init({
      ...defaultOption,
      ...this.walletConnectOption,
      session: savedSession
    });

    this.bindingEvent();

    // Initialize all network wallets with the provider
    Array.from(this.networkWalletMap.values()).forEach(wallet => {
      wallet.setProvider(this.provider);
    });
  }

  setOnPairingUriCreatedCallback(callback: (uri: string) => void) {
    this.onPairingUriCreated = callback;
  }

  async connect(chainId: Chain['chainId']): Promise<void> {

    if (this.session) {
      return;
    }

    // Collect connect params from all child wallets
    const connectParam = {
      namespaces: {}
    };

    // Get the specific wallet for this chain
    const chain = this.getChainById(chainId);
    const wallet = this.getWalletByChainType(chain.chainType);

    if (wallet && typeof (wallet as any).getConnectParams === 'function') {
      const walletParams = await (wallet as any).getConnectParams(chainId);
      Object.assign(connectParam.namespaces, walletParams);
    }


    try {
      const session = await this.provider.connect(connectParam);
      this.session = session;
      this.pairingUri = null;
      this.onPairingUriCreated && this.onPairingUriCreated(null);
      localStorage.setItem('wc-session', JSON.stringify(this.session));
    } catch (error) {
      console.log('wc connect error', error);
      throw error;
    }
  }

  async disconnect(chainId: Chain['chainId']): Promise<void> {
    if (!this.session) {
      return;
    }

    try {
      await this.provider.disconnect();
      this.session = null;
      this.pairingUri = null;
      localStorage.removeItem('wc-session');
    } catch (error) {
      console.log('wc disconnect error', error);
      throw error;
    }
  }

  async getAccount(chainId: Chain['chainId']): Promise<any> {
    const chain = this.getChainById(chainId);
    const wallet = this.getWalletByChainType(chain.chainType);

    if (wallet && typeof (wallet as any).getAccount === 'function') {
      return await (wallet as any).getAccount(chainId);
    }

    throw new Error(`No wallet found for chain type: ${chain.chainType}`);
  }

  async getOfflineSigner(chainId: Chain['chainId']): Promise<GenericOfflineSigner> {
    const chain = this.getChainById(chainId);
    const wallet = this.getWalletByChainType(chain.chainType);

    if (wallet && typeof (wallet as any).getOfflineSigner === 'function') {
      return await (wallet as any).getOfflineSigner(chainId);
    }

    throw new Error(`No wallet found for chain type: ${chain.chainType}`);
  }

  async sign(chainId: Chain['chainId'], data: GenericSignRequest): Promise<GenericSignResponse> {
    const chain = this.getChainById(chainId);
    const wallet = this.getWalletByChainType(chain.chainType);

    if (wallet && typeof (wallet as any).sign === 'function') {
      return await (wallet as any).sign(chainId, data);
    }

    throw new Error(`No wallet found for chain type: ${chain.chainType}`);
  }

  async addSuggestChain(chainId: Chain['chainId']): Promise<void> {
    const chain = this.getChainById(chainId);
    const wallet = this.getWalletByChainType(chain.chainType);

    if (wallet && typeof (wallet as any).addSuggestChain === 'function') {
      return await (wallet as any).addSuggestChain(chainId);
    }

    throw new Error(`No wallet found for chain type: ${chain.chainType}`);
  }

  bindingEvent(): void {
    this.provider.on('disconnect', (error: { message: string; code: number }) => {
      console.error('disconnect:', error);
    });

    this.provider.on('session_delete', (error: { message: string; code: number }) => {
      console.log('session_delete:', error);
      localStorage.removeItem('wc-session');
    });

    this.provider.on('session_event', (error: { message: string; code: number }) => {
      console.log('session_event:', error);
    });

    this.provider.on('session_request', (error: { message: string; code: number }) => {
      console.log('session_request', error);
    });

    this.provider.on('display_uri', (uri: string) => {
      console.log('display_uri', uri);
      this.pairingUri = uri;
      this.onPairingUriCreated && this.onPairingUriCreated(uri);
    });
  }

  async getProvider(chainId: Chain['chainId']): Promise<any> {
    return this.provider;
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