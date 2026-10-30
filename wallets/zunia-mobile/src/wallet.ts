import { WCWallet } from '@interchain-kit/core';

import { ZUNIA_COSMOS_WC_EVENTS, ZUNIA_COSMOS_WC_METHODS, zuniaWalletConnectUrl } from './wc-link';

/**
 * WalletConnect session for Zunia.
 * Only Cosmos chains are proposed. The session includes `cosmos_signArbitrary`, which the app registers.
 * On a phone, the pairing URI is opened with `zunia://wc?uri=`.
 */
export class ZuniaMobileWallet extends WCWallet {
  async init(): Promise<void> {
    await super.init();
    this.provider.on('display_uri', (uri: string) => {
      const url = zuniaWalletConnectUrl(uri);
      if (!url || typeof window === 'undefined') return;
      window.open(url, '_blank', 'noopener,noreferrer');
    });
  }

  async connect(_chainIds: string): Promise<void> {
    const chainIds = Array.from(this.chainMap.keys());
    const cosmosChainNS: string[] = [];

    for (const chainId of chainIds) {
      const chain = this.getChainById(chainId);
      if (chain.chainType !== 'cosmos') {
        throw new Error(`Zunia WalletConnect supports Cosmos chains. ${chainId} is ${chain.chainType}.`);
      }
      cosmosChainNS.push(`cosmos:${chainId}`);
    }

    if (this.provider?.session) {
      const sessionChains = Object.values(this.provider.session.namespaces).flatMap((ns) => ns.chains ?? []);
      const allIncluded = cosmosChainNS.every((chain) => sessionChains.includes(chain));
      if (allIncluded && cosmosChainNS.length > 0) return;
      await this.disconnect();
    }

    if (cosmosChainNS.length === 0) {
      throw new Error('Zunia WalletConnect needs at least one Cosmos chain.');
    }

    try {
      const session = await this.provider.connect({
        namespaces: {
          cosmos: {
            methods: [...ZUNIA_COSMOS_WC_METHODS],
            chains: cosmosChainNS,
            events: [...ZUNIA_COSMOS_WC_EVENTS],
          },
        },
      });
      this.session = session;
      this.pairingUri = null;
      this.onPairingUriCreated && this.onPairingUriCreated(null);
      localStorage.setItem('wc-session', JSON.stringify(this.session));
    } catch (error) {
      console.log('wc connect error', error);
      throw error;
    }
  }
}
