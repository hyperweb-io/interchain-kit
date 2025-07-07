import { Chain } from '@chain-registry/types';
import { AminoGenericOfflineSigner } from '@interchainjs/cosmos/types/wallet';
import { AminoSignResponse, DirectSignResponse, StdSignature } from '@interchainjs/cosmos/types/wallet';
import { StdSignDoc } from '@interchainjs/types';
import { SessionTypes } from '@walletconnect/types';
import UniversalProvider from '@walletconnect/universal-provider';
import { fromByteArray, toByteArray } from 'base64-js';

import { WalletConnectIcon } from '../../constant';
import { BroadcastMode, DirectSignDoc, GenericOfflineSigner, SignOptions, WalletAccount } from '../../types';
import { CosmosSignRequest } from '../../types/sign-request';
import { CosmosSignResponse } from '../../types/sign-response';
import { Algo } from '../../types/wallet';
import { CosmosWallet } from '../cosmos-wallet';

export class WCCosmosWallet extends CosmosWallet {
  session: SessionTypes.Struct;
  provider: UniversalProvider;
  accountToRestore: WalletAccount | null = null;

  constructor(option?: any) {
    const defaultWalletConnectOption = {
      name: 'WalletConnect Cosmos',
      prettyName: 'Wallet Connect Cosmos',
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

  async getConnectParams(chainId: Chain['chainId']) {
    return {
      cosmos: {
        methods: [
          'cosmos_signAmino',
          'cosmos_signDirect',
          'cosmos_getAccounts',
        ],
        chains: [`cosmos:${chainId}`],
        events: ['accountsChanged', 'chainChanged'],
      }
    };
  }

  async connect(chainId: Chain['chainId']): Promise<void> {
    throw new Error('Connection should be handled by parent WCWallet. Use WCWallet.connect() instead.');
  }

  async disconnect(chainId: Chain['chainId']): Promise<void> {
    throw new Error('Disconnection should be handled by parent WCWallet. Use WCWallet.disconnect() instead.');
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

  async getOfflineSigner(chainId: Chain['chainId']): Promise<GenericOfflineSigner> {
    return new AminoGenericOfflineSigner({
      getAccounts: async () => [await this.getAccount(chainId)],
      signAmino: async (signer, signDoc) => {
        return this.signAmino(chainId, signer, signDoc);
      }
    }) as GenericOfflineSigner;
  }

  async signAmino(chainId: string, signer: string, signDoc: StdSignDoc, signOptions?: SignOptions): Promise<AminoSignResponse> {
    try {
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
      throw error;
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
    return this.provider.request({
      method: 'cosmos_signDirect',
      params: signDocValue,
    }, `cosmos:${chainId}`) as Promise<DirectSignResponse>;
  }

  sendTx(chainId: string, tx: Uint8Array, mode: BroadcastMode): Promise<Uint8Array> {
    throw new Error('Method not implemented.');
  }

  async sign(chainId: Chain['chainId'], request: CosmosSignRequest): Promise<CosmosSignResponse> {
    throw new Error('Method not implemented.');
  }

  async addSuggestChain(chainId: Chain['chainId']): Promise<void> {
    throw new Error('Method not implemented.');
  }

  getProvider(): any {
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