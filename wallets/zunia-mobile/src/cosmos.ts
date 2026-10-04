import { WalletAccount, WCCosmosWallet } from '@interchain-kit/core';
import { StdSignature } from '@interchainjs/amino';

function messageBytes(data: string | Uint8Array): Uint8Array {
  if (typeof data === 'string') return new TextEncoder().encode(data);
  return data;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/**
 * Cosmos WalletConnect peer for Zunia.
 * Account algo is taken from the wallet: `secp256k1`, or `eth_secp256k1` on Injective-style chains.
 * `cosmos_signArbitrary` is one of the methods the app registers. The stock connector does not send it.
 */
export class ZuniaWCCosmosWallet extends WCCosmosWallet {
  async getAccount(chainId: string): Promise<WalletAccount> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    const accounts = await this.provider.request(
      {
        method: 'cosmos_getAccounts',
        params: [],
      },
      `cosmos:${chainId}`
    ) as Array<{ address?: string; algo?: string; pubkey?: string }>;

    const account = accounts[0];
    if (!account?.address || !account.pubkey) {
      throw new Error('Zunia did not return a Cosmos account');
    }

    const algo = account.algo === 'eth_secp256k1' ? 'eth_secp256k1' : 'secp256k1';

    return {
      address: account.address,
      algo,
      pubkey: base64ToBytes(account.pubkey),
      username: '',
      isNanoLedger: false,
      isSmartContract: false,
    };
  }

  async signArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<StdSignature> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    return await this.provider.request(
      {
        method: 'cosmos_signArbitrary',
        params: {
          signerAddress: signer,
          data: bytesToBase64(messageBytes(data)),
        },
      },
      `cosmos:${chainId}`,
      this.wcWallet?.options?.signingRequestExpiry
    ) as StdSignature;
  }
}
