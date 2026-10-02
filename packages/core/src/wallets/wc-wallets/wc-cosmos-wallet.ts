import { Chain } from '@chain-registry/types';
import { StdSignature } from '@interchainjs/amino';
import { AminoSignResponse, DirectSignResponse } from '@interchainjs/cosmos';
import { StdSignDoc } from '@interchainjs/types';
import UniversalProvider from '@walletconnect/universal-provider';
import { fromByteArray, toByteArray } from 'base64-js';

import { WalletConnectIcon } from '../../constant';
import { BroadcastMode, DirectSignDoc, SignOptions, SignType, WalletAccount, WCDirectSignResponse } from '../../types';
import { OfflineAminoSigner, OfflineDirectSigner } from '../../types/cosmos';
import { CosmosWallet } from '../cosmos-wallet';
import { IWCCommon } from './wc-common';
import { WCWallet } from './wc-wallet';

export class WCCosmosWallet extends CosmosWallet implements IWCCommon {
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

  setWCProvider(provider: UniversalProvider): void {
    this.provider = provider;
  }

  getWCProvider(): UniversalProvider {
    return this.provider;
  }
  setWCWallet(wallet: WCWallet): void {
    this.wcWallet = wallet;
  }
  getWCWallet(): WCWallet {
    return this.wcWallet;
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
        method: 'cosmos_getAccounts',
        params: []
      }, `cosmos:${chainId}`) as any[];

      const { address, algo, pubkey } = accounts[0];
      return {
        address: address,
        algo: 'secp256k1',
        pubkey: toByteArray(pubkey),
        username: '',
        isNanoLedger: null,
        isSmartContract: null
      };
    } catch (error) {
      console.log('get cosmos account error', error);
      throw error;
    }
  }
  addSuggestChain(chainId: Chain['chainId']): Promise<void> {
    throw new Error('Method not implemented.');
  }
  async getProvider(): Promise<any> {
    return this.provider;
  }
  async getOfflineSigner(chainId: Chain['chainId'], preferredSignType: SignType): Promise<OfflineAminoSigner | OfflineDirectSigner> {
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
  setSignOptions(options: SignOptions): void {
    // Sign options are handled by the parent WCWallet
    // This method can be extended if needed
  }

  bindingEvent(): void {
    // Event binding is handled by the parent WCWallet
    // This method can be extended if needed
  }
  async signAmino(chainId: string, signer: string, signDoc: StdSignDoc, signOptions?: SignOptions): Promise<AminoSignResponse> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const result = await this.provider.request({
        method: 'cosmos_signAmino',
        params: {
          signerAddress: signer,
          signDoc,
        },
      }, `cosmos:${chainId}`, this.wcWallet?.options?.signingRequestExpiry);

      return result as AminoSignResponse;
    } catch (error) {
      console.log('signAmino error:', error);
      throw error;
    }
  }
  signArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<StdSignature> {
    throw new Error('Method not implemented.');
  }
  verifyArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  async signDirect(chainId: string, signer: string, signDoc: DirectSignDoc, signOptions?: SignOptions): Promise<DirectSignResponse> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    const signDocValue = {
      signerAddress: signer,
      signDoc: {
        chainId: signDoc.chainId,
        bodyBytes: fromByteArray(signDoc.bodyBytes),
        authInfoBytes: fromByteArray(signDoc.authInfoBytes),
        accountNumber: signDoc.accountNumber.toString(),
      },
    };

    try {
      const result = await (this.provider.request({
        method: 'cosmos_signDirect',
        params: signDocValue,
      }, `cosmos:${chainId}`, this.wcWallet?.options?.signingRequestExpiry) as Promise<WCDirectSignResponse>);

      return {
        signed: {
          accountNumber: result.signed.accountNumber,
          authInfoBytes: toByteArray(result.signed.authInfoBytes),
          bodyBytes: toByteArray(result.signed.bodyBytes),
          chainId: result.signed.chainId,
        },
        signature: result.signature
      };
    } catch (error) {
      console.log('signDirect error:', error);
      throw error;
    }
  }
  sendTx(chainId: string, tx: Uint8Array, mode: BroadcastMode): Promise<Uint8Array> {
    throw new Error('Method not implemented.');
  }







}