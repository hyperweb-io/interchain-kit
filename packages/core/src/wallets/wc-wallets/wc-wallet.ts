import { Chain } from '@chain-registry/types';
import type { StdSignature } from '@interchainjs/amino';
import { AminoSignResponse, DirectSignResponse, SignOptions } from '@interchainjs/cosmos';
import { StdSignDoc } from '@interchainjs/types';
import { PairingTypes, SessionTypes, SignClientTypes } from '@walletconnect/types';
import UniversalProvider, { ConnectParams, UniversalProviderOpts } from '@walletconnect/universal-provider';
import { fromByteArray, toByteArray } from 'base64-js';
import { BroadcastMode } from 'interchainjs';

import { WalletConnectIcon } from '../../constant';
import { DirectSignDoc, SignType, Wallet, WalletAccount, WCDirectSignResponse, WcEventTypes, WcProviderEventType } from '../../types';
import { MultiChainWallet } from '../multichain-wallet';
import { isWCCommon } from './wc-common';


export class WCWallet extends MultiChainWallet {

  pairingUri: string;

  session: SessionTypes.Struct;

  // signClient: InstanceType<typeof SignClient>;

  provider: UniversalProvider;

  pairingToConnect: PairingTypes.Struct = null;

  sessionToConnect: SessionTypes.Struct = null;

  // walletConnectOption: SignClientTypes.Options

  walletConnectOption: UniversalProviderOpts;

  onPairingUriCreated: (uri: string) => void;

  accountToRestore: WalletAccount | null = null;

  setAccountToRestore(account: WalletAccount) {
    this.accountToRestore = account;
  }

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

  async init(): Promise<void> {
    // this.events.removeAllListeners()

    const defaultOption: UniversalProviderOpts = {
      projectId: '15a12f05b38b78014b2bb06d77eecdc3',
      // optional parameters
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


    // this.signClient = await SignClient.init({ ...defaultOption, ...this.walletConnectOption })



    this.provider = await UniversalProvider.init({ ...defaultOption, ...this.walletConnectOption, session: savedSession });

    Array.from(this.networkWalletMap.values()).forEach((wallet) => {
      if (isWCCommon(wallet)) {
        wallet.setWCProvider(this.provider);
        wallet.setWCWallet(this);
      }
      wallet.info = this.info;
      wallet.chainMap = this.chainMap;
    });


    this.bindingEvent();
  }

  setOnPairingUriCreatedCallback(callback: (uri: string) => void) {
    console.log('setOnPairingUriCreatedCallback called with callback:', callback);
    console.log('this.onPairingUriCreated before:', this.onPairingUriCreated);
    this.onPairingUriCreated = callback;
    console.log('this.onPairingUriCreated after:', this.onPairingUriCreated);
    console.log('this context:', this);
  }

  async connect(chainIds: string) {

    // const chainIdsWithNS = Array.isArray(chainIds) ? chainIds.map((chainId) => `cosmos:${chainId}`) : [`cosmos:${chainIds}`]

    const _chainIds = Array.from(this.chainMap).map(([chainId, chain]) => chainId);
    const cosmosChainNS: string[] = [];
    const eip155ChainNS: string[] = [];
    const solanaChainNS: string[] = [];

    _chainIds.forEach((chainId) => {
      const chain = this.getChainById(chainId);
      if (chain.chainType === 'cosmos') {
        cosmosChainNS.push(`cosmos:${chainId}`);
      }
      if (chain.chainType === 'eip155') {
        eip155ChainNS.push(`eip155:${chainId}`);
      }
      if (chain.chainType === 'solana') {
        solanaChainNS.push(`solana:${chainId}`);
      }
    });

    // Reuse existing session only if it covers all required chains
    if (this.provider.session) {
      const sessionChains = Object.values(this.provider.session.namespaces)
        .flatMap((ns) => ns.chains ?? []);
      const requiredChains = [...cosmosChainNS, ...eip155ChainNS, ...solanaChainNS];
      const allIncluded = requiredChains.every(c => sessionChains.includes(c));

      if (allIncluded) {
        return Promise.resolve();
      }
      // Stale session — disconnect before creating a new one
      await this.disconnect();
    }

    const connectParam: ConnectParams = {
      namespaces: {},
    };

    if (cosmosChainNS.length) {
      connectParam.namespaces.cosmos = {
        methods: [
          'cosmos_signAmino',
          'cosmos_signDirect',
          'cosmos_getAccounts',
        ],
        chains: cosmosChainNS,
        events: ['accountsChanged', 'chainChanged'],
      };
    }

    if (eip155ChainNS.length) {
      connectParam.namespaces.eip155 = {
        methods: [
          'eth_sendTransaction',
          'eth_signTransaction',
          'eth_sign',
          'personal_sign',
          'eth_signTypedData',
          'trust_sendTransaction',
        ],
        chains: eip155ChainNS,
        events: []
      };
    }

    if (solanaChainNS.length) {

      connectParam.namespaces.solana = {
        methods: [
          'solana_signTransaction',
          'solana_signMessage',
        ],
        chains: solanaChainNS,
        events: [],
      };
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

  async disconnect(): Promise<void> {
    // await this.provider.client.session.delete(this.provider?.session?.topic, { code: 6000, message: 'user disconnect!!' })

    this.session = null;
    if (this.provider?.session) {
      await this.provider.disconnect();
      localStorage.removeItem('wc-session');
    }

    // this.provider.client.pairing.delete(this.pairingToConnect.topic, { code: 6000, message: 'user disconnect!!' })
    // await this.provider.client.disconnect({ topic: this.sessionToConnect.topic, reason: { code: 6000, message: 'user disconnect!!' } })
    // await this.provider.client.pairing.delete(this.pairingToConnect.topic, { code: 6000, message: 'user disconnect!!' })
    // await this.removeSession()
    // this.sessionToConnect = null
  }

  async getAccounts(): Promise<WalletAccount[]> {
    const accounts: WalletAccount[] = [];

    const namespaces = this.session.namespaces;

    Object.entries(namespaces).forEach(([namespace, session]: [string, SessionTypes.BaseNamespace]) => {
      session.accounts.forEach((account: string) => {
        const [namespace, chainId, address] = account.split(':');
        accounts.push({
          address: address,
          algo: 'secp256k1',
          pubkey: null,
          username: '',
          isNanoLedger: null,
          isSmartContract: null
        });
      });
    });

    return accounts;
  }

  async getAccount(chainId: Chain['chainId']): Promise<WalletAccount> {
    const chain = this.getChainById(chainId);
    const wallet = this.getWalletByChainType(chain.chainType);
    return wallet.getAccount(chainId);
  }



  async getOfflineSigner(chainId: string, preferredSignType?: SignType) {
    if (preferredSignType === 'amino') {
      return {
        getAccounts: async () => [await this.getAccount(chainId)],
        signAmino: async (signer: string, signDoc: StdSignDoc) => {
          return this.signAmino(chainId, signer, signDoc);
        }
      };
    } else if (preferredSignType === 'direct') {
      return {
        getAccounts: async () => [await this.getAccount(chainId)],
        signDirect: async (signer: string, signDoc: DirectSignDoc) => {
          return this.signDirect(chainId, signer, signDoc);
        }
      };
    }
  }

  async signAmino(chainId: string, signer: string, signDoc: StdSignDoc, signOptions?: SignOptions): Promise<AminoSignResponse> {
    try {
      // const result = await this.signClient.request({
      //   topic: this.session.topic,
      //   chainId: `cosmos:${chainId}`,
      //   request: {
      //     method: 'cosmos_signAmino',
      //     params: {
      //       signerAddress: signer,
      //       signDoc,
      //     },
      //   },
      // });
      const result = await this.provider.request({
        method: 'cosmos_signAmino',
        params: {
          signerAddress: signer,
          signDoc,
        },
      }, `cosmos:${chainId}`);

      return result as AminoSignResponse;
    } catch (error) {
      console.log(error);
    }
  }

  signArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<StdSignature> {
    throw new Error('Method not implemented.');
  }

  verifyArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async signDirect(chainId: string, signer: string, signDoc: DirectSignDoc, signOptions?: SignOptions): Promise<DirectSignResponse> {
    const signDocValue = {
      signerAddress: signer,
      signDoc: {
        chainId: signDoc.chainId,
        bodyBytes: fromByteArray(signDoc.bodyBytes),
        authInfoBytes: fromByteArray(signDoc.authInfoBytes),
        accountNumber: signDoc.accountNumber.toString(),
      },
    };
    // return this.signClient.request({
    //   topic: this.session.topic,
    //   chainId: `cosmos:${chainId}`,
    //   request: {
    //     method: 'cosmos_signDirect',
    //     params: signDocValue,
    //   },
    // });

    const result = await (this.provider.request({
      method: 'cosmos_signDirect',
      params: signDocValue,
    }, `cosmos:${chainId}`) as Promise<WCDirectSignResponse>);

    return {
      signed: {
        accountNumber: result.signed.accountNumber,
        authInfoBytes: toByteArray(result.signed.authInfoBytes),
        bodyBytes: toByteArray(result.signed.bodyBytes),
        chainId: result.signed.chainId,
      },
      signature: result.signature
    };
  }

  sendTx(chainId: string, tx: Uint8Array, mode: BroadcastMode): Promise<Uint8Array> {
    throw new Error('Method not implemented.');
  }

  sign(chainId: string, message: string): Promise<any> {
    throw new Error('Method not implemented.');
  }

  addSuggestChain(chainId: Chain['chainId']): Promise<void> {
    throw new Error('Method not implemented.');
  }

  bindingEvent(): void {
    this.provider.on('disconnect', (error: { message: string; code: number }) => {
      console.error('disconnect:', error);
    });

    this.provider.on('session_delete', (error: { message: string; code: number }) => {
      console.log('session_delete:', error);
      localStorage.removeItem('wc-session');

      // Emit disconnect event to notify StatefulWallet
      this.events.emit('disconnect', '');
    });

    this.provider.on('session_event', (error: { message: string; code: number }) => {
      console.log('session_event:', event);
    });



    this.provider.on('session_request', (error: { message: string; code: number }) => {
      console.log('session_request', event);
    });

    this.provider.on('display_uri', (uri: string) => {
      this.pairingUri = uri;

      // 动态获取 onPairingUriCreated 回调
      if (this.onPairingUriCreated) {
        console.log('Calling onPairingUriCreated callback');
        this.onPairingUriCreated(uri);
      } else {
        console.log('onPairingUriCreated is undefined, callback not called');
      }
    });

    this.events.removeAllListeners();
    const events = [...Object.keys(WcEventTypes), ...Object.keys(WcProviderEventType)];
    // for (const event of events) {
    //   this.signClient.core.on(event, (data: never) => {
    //     this.events.emit(event, data)

    //     if (event === 'accountsChanged') {
    //       this.events.emit('keystoreChange')
    //     }

    //   })
    // }

    // this.signClient.events.on('session_event', (data: SignClientTypes.EventArguments['session_event']) => {
    //   console.log('session_event_trigger', data)
    //   this.events.emit('accountChanged', data)
    // })

    for (const event of events) {
      // console.log(event)
      // this.provider.on(event as any, (data: any) => {
      //   console.log(event, data)
      // })
    }

  }

  unbindingEvent(): void {
    this.provider.events.removeAllListeners('session_event');
    this.events.removeAllListeners();
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

  async getProvider() {
    return this.provider;
  }
}


