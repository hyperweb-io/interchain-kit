import { CosmosWallet, SolanaWallet } from '@interchain-kit/core';

type Chain = ReturnType<SolanaWallet['getChainById']>;

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

// Solana's clusters by genesis hash, the reference in their CAIP-2 chain IDs
const GENESIS_CLUSTERS: Record<string, string> = {
  '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp': 'mainnet',
  EtWTRABZaYq6iMfeYKouRu166VU2xqa1: 'devnet',
  '4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z': 'testnet',
};

/** The cluster a Solana chain transacts on: its RPC's, read as Solana's wallet adapter reads an
 * endpoint, else its genesis hash, else mainnet. */
export function solanaCluster(chain: Chain | undefined, chainId: string | undefined): string {
  const rpc = chain?.apis?.rpc?.[0]?.address ?? '';
  if (/\bdevnet\b/.test(rpc)) return 'devnet';
  if (/\btestnet\b/.test(rpc)) return 'testnet';
  if (/\/\/(localhost|127\.0\.0\.1)\b/.test(rpc)) return 'localnet';
  return GENESIS_CLUSTERS[(chainId ?? '').replace(/^solana:/, '').slice(0, 32)] ?? 'mainnet';
}

// Aria sends each window.aria.solana request on the cluster changeCluster set. SolanaWallet's sign
// methods name no chain, so connect sets the chain's cluster for the requests after it.
export class AriaSolanaWallet extends SolanaWallet {
  async connect(chainId: Chain['chainId']): Promise<void> {
    await this.solana.changeCluster(solanaCluster(this.chainMap.get(chainId), chainId));
    await super.connect(chainId);
  }
}
