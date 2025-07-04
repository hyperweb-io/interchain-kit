import { chainRegistryChainToKeplr } from '@chain-registry/keplr';
import { Chain } from '@chain-registry/types';
import { CosmosAminoDoc, CosmosDirectDoc } from '@interchainjs/cosmos';
import { AminoGenericOfflineSigner, AminoSignResponse, DirectGenericOfflineSigner, DirectSignResponse, ICosmosGenericOfflineSigner, StdSignature } from '@interchainjs/cosmos/types/wallet';

import { BroadcastMode, SignOptions, SignType, WalletAccount } from '../types';
import { CosmosSignRequest } from '../types/sign-request';
import { CosmosSignResponse } from '../types/sign-response';
import { getClientFromExtension } from '../utils';
import { isCosmosAminoDoc, isCosmosArbitraryDoc, isCosmosDirectDoc } from '../utils/sign-doc';
import { BaseWallet } from './base-wallet';

export class CosmosWallet extends BaseWallet<CosmosSignRequest, CosmosSignResponse, ICosmosGenericOfflineSigner> {

  preferredSignType: SignType = 'amino';

  defaultSignOptions: SignOptions = {
    disableBalanceCheck: true,
    preferNoSetFee: true,
    preferNoSetMemo: true
  };

  setPreferredSignType(type: SignType) {
    this.preferredSignType = type;
  }

  setSignOptions(signOptions: SignOptions) {
    this.defaultSignOptions = {
      ...this.defaultSignOptions,
      ...signOptions
    };
  }

  bindingEvent() {
    window.addEventListener(this.info.keystoreChange, () => {
      this.events.emit('accountChanged', () => { });
    });
  }
  async init(): Promise<void> {
    this.bindingEvent();
    this.client = await getClientFromExtension(this.info.cosmosKey);
  }

  async connect(chainId: string): Promise<void> {
    try {
      await this.client.enable(chainId);
    } catch (error) {
      if (!(error as any).message.includes(`rejected`)) {
        await this.addSuggestChain(chainId);
      } else {
        throw error;
      }
    }
  }
  async disconnect(chainId: string): Promise<void> {
    this.client.disable?.(chainId);
    this.client.disconnect?.(chainId);
  }
  async getAccount(chainId: string): Promise<WalletAccount> {
    const key = await this.client.getKey(chainId);
    return {
      username: key.name,
      address: key.bech32Address,
      algo: key.algo,
      pubkey: key.pubKey,
      isNanoLedger: key.isNanoLedger,
    };
  }
  async getOfflineSigner(chainId: string) {
    const account = await this.getAccount(chainId);

    if (account.isNanoLedger) {
      return new AminoGenericOfflineSigner({
        getAccounts: async () => [account],
        signAmino: async (signer, signDoc) => {
          return this.signAmino(chainId, signer, signDoc);
        }
      });
    }

    if (this.preferredSignType === 'amino') {
      return new AminoGenericOfflineSigner({
        getAccounts: async () => [await this.getAccount(chainId)],
        signAmino: async (signer, signDoc) => {
          return this.signAmino(chainId, signer, signDoc);
        }
      });
    } else {
      return new DirectGenericOfflineSigner({
        getAccounts: async () => [await this.getAccount(chainId)],
        signDirect: async (signer, signDoc) => {
          return this.signDirect(chainId, signer, signDoc);
        }
      });
    }
  }

  async sign(chainId: Chain['chainId'], request: CosmosSignRequest): Promise<CosmosSignResponse> {
    try {
      const signerAddress = request.signerAddress || (await this.getAccount(chainId)).address;

      let result;
      switch (request.method) {
        case 'cosmos_amino':
          if (!isCosmosAminoDoc(request.data)) {
            return {
              success: false,
              error: 'Invalid amino sign data',
              method: request.method
            };
          }
          result = await this.signAmino(chainId, signerAddress, request.data);
          break;
        case 'cosmos_direct':
          if (!isCosmosDirectDoc(request.data)) {
            return {
              success: false,
              error: 'Invalid direct sign data',
              method: request.method
            };
          }
          result = await this.signDirect(chainId, signerAddress, request.data);
          break;
        case 'cosmos_arbitrary':
          if (!isCosmosArbitraryDoc(request.data)) {
            return {
              success: false,
              error: 'Invalid arbitrary sign data',
              method: request.method
            };
          }
          result = await this.signArbitrary(chainId, signerAddress, request.data);
          break;
        default:
          return {
            success: false,
            error: `Unsupported sign method: ${request.method}`,
            method: request.method
          };
      }

      return {
        success: true,
        method: request.method,
        result
      };
    } catch (error) {
      console.log('sign error', error);
      throw error;
    }
  }

  private async signAmino(chainId: string, signer: string, signDoc: CosmosAminoDoc): Promise<AminoSignResponse> {
    return this.client.signAmino(chainId, signer, signDoc);
  }

  private async signDirect(chainId: string, signer: string, signDoc: CosmosDirectDoc): Promise<DirectSignResponse> {
    return this.client.signDirect(chainId, signer, signDoc);
  }

  private async signArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<StdSignature> {
    return this.client.signArbitrary(chainId, signer, data);
  }

  verifyArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<boolean> {
    return this.client.verifyArbitrary(chainId, signer, data);
  }

  async sendTx(chainId: string, tx: Uint8Array, mode: BroadcastMode): Promise<Uint8Array> {
    return this.client.sendTx(chainId, tx, mode);
  }
  async addSuggestChain(chainId: string): Promise<void> {
    const chain = this.getChainById(chainId);
    const chainInfo = chainRegistryChainToKeplr(chain, this.assetLists);
    try {
      await this.client.experimentalSuggestChain(chainInfo);
    } catch (error) {
      console.log('add suggest chain error', error);
      throw error;
    }
  }
  async getProvider() {
    return this.client;
  }
}