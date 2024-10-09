import { ExtensionWallet } from '@interchain-kit/core';

export class TrustExtension extends ExtensionWallet {
  async getAccount(chainId: string) {
    console.log('chian', chainId)
    const key = await this.client.cosmos.getKey(chainId);
    return {
      username: key.name,
      address: key.bech32Address,
      algo: key.algo,
      pubkey: key.pubKey,
    };
  }


  getOfflineSignerAmino(chainId: string) {
    console.log('this.client.cosmos', this.client.cosmos)
    return this.client.cosmos.getOfflineSigner(chainId)
  }

  // async disconnect() {
  //   return;
  // }
}
