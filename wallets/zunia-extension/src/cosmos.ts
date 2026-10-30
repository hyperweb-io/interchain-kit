import { BroadcastMode, CosmosWallet } from '@interchain-kit/core';

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return '';
}

/**
 * Zunia's `experimentalSuggestChain` saves the chain and does not grant the site.
 * The stock connector returns after the suggestion, so the next `getKey` is unauthorized.
 * Connect again once the chain is known.
 *
 * `sendTx` is refused in the extension. The dApp signs, then broadcasts.
 */
export class ZuniaCosmosWallet extends CosmosWallet {
  async connect(chainId: string): Promise<void> {
    try {
      await this.client.enable(chainId);
    } catch (error) {
      if (errorMessage(error).includes('rejected')) throw error;
      await this.addSuggestChain(chainId);
      await this.client.enable(chainId);
    }
  }

  async sendTx(_chainId: string, _tx: Uint8Array, _mode: BroadcastMode): Promise<Uint8Array> {
    throw new Error(
      'Zunia does not broadcast dApp transactions. Sign with signAmino or signDirect and broadcast from the dApp.'
    );
  }
}
