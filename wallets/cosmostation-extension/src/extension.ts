import { ExtensionWallet, WalletAccount } from '@interchain-kit/core';

export class CosmostationExtension extends ExtensionWallet {
  async connect(chainId: string | string[]): Promise<void> {
    try {
      const account = await this.client.cosmos.request({
        method: 'cos_requestAccount',
        params: { chainName: Array.isArray(chainId) ? chainId[0] : chainId },
      });
    } catch (e) {
      console.error('CosmostationExtension connect error.', e);
    }
  }

  async getAccount(chainId: string): Promise<WalletAccount> {
    const account = await this.client.cosmos.request({
      method: 'cos_requestAccount',
      params: { chainName: chainId },
    });
    return {
      username: account.name,
      address: account.address,
      algo: null,
      pubkey: account.publicKey,
      isNanoLedger: account.isLedger,
    };
  }

  getOfflineSignerAmino(chainId: string) {
    return this.client.providers.keplr.getOfflineSignerOnlyAmino(chainId);
  }

  async disconnect(chainId: string | string[]): Promise<void> {
    await this.client.cosmos.request({
      method: 'cos_disconnect',
    });
  }
}
