import { CosmosWallet } from '@interchain-kit/core';

// Aria's enable connects the site without checking the chain, so a chain Aria doesn't know
// only fails at getKey ("Unknown chain"). Suggest it then, as enable failing does for Keplr.
export class AriaCosmosWallet extends CosmosWallet {
  async connect(chainId: string): Promise<void> {
    await super.connect(chainId);
    try {
      await this.client.getKey(chainId);
    } catch (error) {
      if (!(error as any)?.message?.includes('Unknown chain')) {
        throw error;
      }
      await this.addSuggestChain(chainId);
    }
  }
}
