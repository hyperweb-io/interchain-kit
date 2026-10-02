import { CosmosWallet, DirectSignDoc, SignOptions, WalletAccount } from '@interchain-kit/core';
import { AminoSignResponse } from '@interchainjs/cosmos';
import { StdSignDoc } from '@interchainjs/types';

import { ChainInfo } from './types';

declare global {
  interface Window {
    ethereum: any;
  }
}

export class LeapCosmosExtensionMetaMask extends CosmosWallet {
  snapId: string = 'npm:@leapwallet/metamask-cosmos-snap';

  supportedChains: { [chainId: string]: ChainInfo } = {};

  async init() {
    if (!window.ethereum || window.ethereum.isMetaMask !== true) {
      throw new Error('MetaMask is not installed');
    }
    this.supportedChains = await this.getSupportedChains();
  }

  async getSupportedChains() {
    return window.ethereum.request({
      method: 'wallet_invokeSnap',
      params: {
        snapId: this.snapId,
        request: {
          method: 'getSupportedChains',
        },
      },
    });
  }

  async connect(chainId: string) {
    await window.ethereum.request({
      method: 'wallet_requestSnaps',
      params: {
        [this.snapId]: {},
      },
    });
    if (!this.supportedChains[chainId as string]) {
      throw new Error(`There is no chain info for ${chainId}`);
    }
  }

  async disconnect(chainId: string): Promise<void> {
    await window.ethereum.request({
      method: 'wallet_revokePermissions',
      params: [
        {
          eth_accounts: {},
        },
      ],
    });
  }

  async getAccount(chainId: string): Promise<WalletAccount> {
    const result = await window.ethereum.request({
      method: 'wallet_invokeSnap',
      params: {
        snapId: this.snapId,
        request: {
          method: 'getKey',
          params: {
            chainId,
          }
        },
      },
    });

    const { address, pubkey, algo, isNanoLedger, name } = result;

    return {
      address,
      algo,
      pubkey: new Uint8Array(Object.values(pubkey)),
      isNanoLedger,
      isSmartContract: false,
      username: 'leap cosmos in metamask',
    };
  }

  async getOfflineSigner(chainId: string) {
    return super.getOfflineSigner(chainId, 'amino');
  }

  async getAccounts(chainIds: string[]): Promise<WalletAccount[]> {
    throw new Error('Method not implemented.');
  }

  getOfflineSignerAmino(chainId: string) {
    return {
      getAccounts: async () => [await this.getAccount(chainId)],
      signAmino: async (signer: string, signDoc: StdSignDoc, signOptions?: SignOptions) => {
        return this.signAmino(chainId, signer, signDoc, signOptions);
      }
    };
  }

  async signAmino(chainId: string, signer: string, signDoc: any, signOptions?: any): Promise<AminoSignResponse> {
    const result = await window.ethereum.request({
      method: 'wallet_invokeSnap',
      params: {
        snapId: this.snapId,
        request: {
          method: 'signAmino',
          params: {
            signDoc,
            signerAddress: signer,
            chainId
          }
        },
      },
    });
    return result;
  }

  getOfflineSignerDirect(chainId: string) {
    return {
      getAccounts: async () => [await this.getAccount(chainId)],
      signDirect: async (signer: string, signDoc: DirectSignDoc, signOptions?: SignOptions) => {
        return this.signDirect(chainId, signer, signDoc, signOptions);
      }
    };
  }

  async signDirect(chainId: string, signer: string, signDoc: DirectSignDoc, signOptions?: SignOptions): Promise<any> {
    return window.ethereum.request({
      method: 'wallet_invokeSnap',
      params: {
        snapId: this.snapId,
        request: {
          method: 'signDirect',
          params: {
            signDoc,
            signerAddress: signer,
            chainId
          }
        },
      },
    });
  }

  async addSuggestChain(chainId: string): Promise<void> {
    const chain = this.getChainById(chainId);
    const chainInfo: ChainInfo = {
      chainId: chain.chainId,
      chainName: chain.prettyName,
      bip44: { coinType: chain.slip44 },
      bech32Config: {
        bech32PrefixAccAddr: chain.bech32Prefix
      },
    };

    return window.ethereum.request({
      method: 'wallet_invokeSnap',
      params: {
        snapId: this.snapId,
        request: {
          method: 'suggestChain',
          params: {
            chainInfo
          }
        }
      }
    });
  }
}