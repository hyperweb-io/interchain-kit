import { Chain } from '@chain-registry/types';
import {
  AminoGenericOfflineSigner,
  DirectGenericOfflineSigner,
} from '@interchainjs/cosmos/types/wallet';
import { AminoSignResponse, DirectSignResponse, StdSignature } from '@interchainjs/cosmos/types/wallet';
import { IGenericOfflineSigner, StdSignDoc } from '@interchainjs/types';
import { PairingTypes, SessionTypes, SignClientTypes } from '@walletconnect/types';
import UniversalProvider, { ConnectParams, UniversalProviderOpts } from '@walletconnect/universal-provider';
import { fromByteArray, toByteArray } from 'base64-js';

import { WalletConnectIcon } from '../constant';
import { BroadcastMode, DirectSignDoc, SignOptions, SignType, WalletAccount } from '../types';
import { BaseSignRequest } from '../types/sign-request';
import { BaseSignResponse } from '../types/sign-response';
import { Algo, Wallet, WcEventTypes, WcProviderEventType } from '../types/wallet';
import { BaseWallet } from './base-wallet';


export class WCWallet extends BaseWallet {

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
    this.events.removeAllListeners();

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
    this.bindingEvent();
  }

  setOnPairingUriCreatedCallback(callback: (uri: string) => void) {
    this.onPairingUriCreated = callback;
  }

  async connect(chainIds: string) {

    // const chainIdsWithNS = Array.isArray(chainIds) ? chainIds.map((chainId) => `cosmos:${chainId}`) : [`cosmos:${chainIds}`]

    if (this.session) {
      return;
    }

    const _chainIds = Array.from(this.chainMap).map(([chainId, chain]) => chainId);
    const cosmosChainNS: string[] = [];
    const eip155ChainNS: string[] = [];

    _chainIds.forEach((chainId) => {
      const chain = this.getChainById(chainId);
      if (chain.chainType === 'cosmos') {
        cosmosChainNS.push(`cosmos:${chainId}`);
      }
      if (chain.chainType === 'eip155') {
        eip155ChainNS.push(`eip155:${chainId}`);
      }
    });

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
    await this.provider.disconnect();
    localStorage.removeItem('wc-session');
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

    if (this.accountToRestore) {
      return this.accountToRestore;
    }

    const account = await this.getCosmosAccount(chainId);

    return {
      address: account.address,
      algo: 'secp256k1',
      pubkey: toByteArray(account.pubkey),
      username: '',
      isNanoLedger: null,
      isSmartContract: null
    };
  }

  async getCosmosAccount(chainId: string): Promise<{ address: string, algo: Algo, pubkey: string }> {

    try {

      const accounts = await this.provider.request({
        method: 'cosmos_getAccounts',
        params: []
      }, `cosmos:${chainId}`) as any[];

      const { address, algo, pubkey } = accounts[0];
      return {
        address,
        algo: algo as Algo,
        pubkey: pubkey,
      };
    } catch (error) {
      console.log('get cosmos account error', error);
      throw error;
    }
  }

  async getOfflineSigner(chainId: string, preferredSignType?: SignType) {
    if (preferredSignType === 'amino') {
      return new AminoGenericOfflineSigner({
        getAccounts: async () => [await this.getAccount(chainId)],
        signAmino: async (signer, signDoc) => {
          return this.signAmino(chainId, signer, signDoc);
        }
      }) as IGenericOfflineSigner;
    } else if (preferredSignType === 'direct') {
      return new DirectGenericOfflineSigner({
        getAccounts: async () => [await this.getAccount(chainId)],
        signDirect: async (signer, signDoc) => {
          return this.signDirect(chainId, signer, signDoc);
        }
      }) as IGenericOfflineSigner;
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

  signDirect(chainId: string, signer: string, signDoc: DirectSignDoc, signOptions?: SignOptions): Promise<DirectSignResponse> {
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
    return this.provider.request({
      method: 'cosmos_signDirect',
      params: signDocValue,
    }, `cosmos:${chainId}`) as Promise<DirectSignResponse>;
  }

  sendTx(chainId: string, tx: Uint8Array, mode: BroadcastMode): Promise<Uint8Array> {
    throw new Error('Method not implemented.');
  }

  sign(chainId: string, data: BaseSignRequest): Promise<BaseSignResponse> {
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
      console.log('session_delete:', event);
      localStorage.removeItem('wc-session');
    });

    this.provider.on('session_event', (error: { message: string; code: number }) => {
      console.log('session_event:', event);
    });



    this.provider.on('session_request', (error: { message: string; code: number }) => {
      console.log('session_request', event);
    });

    this.provider.on('display_uri', (uri: string) => {
      this.pairingUri = uri;
      this.onPairingUriCreated && this.onPairingUriCreated(uri);
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


