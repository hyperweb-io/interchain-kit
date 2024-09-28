import { ExtensionWallet, WalletAccount } from '@interchain-kit/core';

export class StationExtension extends ExtensionWallet {
  async connect(chainId: string | string[]): Promise<void> {
    try {
      this.client.connect(chainId)
    } catch (e) {
      console.error('StationExtension connect error.', e);
    }
  }

  async getAccount(chainId: string): Promise<WalletAccount> {
    const info = (await this.client.info())[chainId];
    if (!info)
      throw new Error(
        `The requested chainID (${chainId}) is not available, try to switch network on the Station extension.`
      );

    let { name, addresses, pubkey: pubkeys } = await this.client.connect();
    if (!pubkeys) {
      pubkeys = (await this.client.getPublicKey()).pubkey;
    }
    const pubkey = pubkeys?.[info.coinType];
    const address = addresses[chainId];

    if (!address || !pubkey)
      throw new Error(
        'The requested account is not available, try to use a different wallet on the Station extension or to import it again.'
      );
    
    return {
      address,
      // pubkey: Buffer.from(pubkey, 'base64'),
      pubkey,
      username: name,
      isNanoLedger: true,
      algo: 'secp256k1',
    };
  }

  getOfflineSignerAmino(chainId: string) {
    return this.client.keplr.getOfflineSignerOnlyAmino(chainId);
    // return this.client.getOfflineSigner(chainId)
  }

  async disconnect() {
    return;
  }
}
