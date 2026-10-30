import { zuniaMobile } from '../src';
import { ZuniaWCCosmosWallet } from '../src/cosmos';
import { ZuniaMobileWallet } from '../src/wallet';
import { ZUNIA_COSMOS_WC_METHODS, zuniaWalletConnectUrlFor } from '../src/wc-link';

const WC_URI = 'wc:abc123@2?relay-protocol=irn&symKey=ff';

function uriParam(link: string): string | null {
  const withoutHash = link.split('#')[0];
  const query = withoutHash.slice(withoutHash.indexOf('?') + 1);
  return new URLSearchParams(query).get('uri');
}

describe('Zunia mobile', () => {
  it('is a WalletConnect wallet for Cosmos', () => {
    expect(zuniaMobile.info.name).toBe('zunia-mobile');
    expect(zuniaMobile.info.prettyName).toBe('Zunia');
    expect(zuniaMobile.info.mode).toBe('wallet-connect');
    expect(zuniaMobile.info.ethereumKey).toBeUndefined();
    expect(zuniaMobile.info.walletconnect?.requiredNamespaces?.methods).toEqual([
      ...ZUNIA_COSMOS_WC_METHODS,
    ]);
  });

  it('builds a link the app can pair', () => {
    for (const os of ['ios', 'android'] as const) {
      expect(uriParam(zuniaWalletConnectUrlFor(os, WC_URI))).toBe(WC_URI);
    }
    expect(zuniaWalletConnectUrlFor('android', WC_URI)).toContain('package=com.zuniawallet.zunia_mobile');
    expect(zuniaWalletConnectUrlFor('ios', WC_URI).startsWith('zunia://wc?uri=')).toBe(true);
  });

  it('asks the session for the methods the app registers', async () => {
    const memory = new Map<string, string>();
    Object.defineProperty(global, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => memory.get(key) ?? null,
        setItem: (key: string, value: string) => memory.set(key, value),
        removeItem: (key: string) => memory.delete(key),
      },
    });

    const wallet = new ZuniaMobileWallet(zuniaMobile.info);
    wallet.setChainMap([
      { chainId: 'cosmoshub-4', chainType: 'cosmos', chainName: 'cosmoshub' } as never,
    ]);
    const connect = jest.fn().mockResolvedValue({ namespaces: { cosmos: { accounts: [], chains: ['cosmos:cosmoshub-4'], methods: [], events: [] } } });
    wallet.provider = { session: null, connect } as never;

    await wallet.connect('cosmoshub-4');

    expect(connect).toHaveBeenCalledWith({
      namespaces: {
        cosmos: {
          methods: [...ZUNIA_COSMOS_WC_METHODS],
          chains: ['cosmos:cosmoshub-4'],
          events: ['accountsChanged', 'chainChanged'],
        },
      },
    });
  });

  it('refuses a non-Cosmos chain', async () => {
    const wallet = new ZuniaMobileWallet(zuniaMobile.info);
    wallet.setChainMap([{ chainId: '1', chainType: 'eip155', chainName: 'ethereum' } as never]);
    wallet.provider = { session: null, connect: jest.fn() } as never;

    await expect(wallet.connect('1')).rejects.toThrow('Cosmos chains');
  });

  it('keeps the algo the wallet reports', async () => {
    const cosmos = new ZuniaWCCosmosWallet();
    cosmos.provider = {
      request: jest.fn().mockResolvedValue([
        {
          address: 'inj1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqe2hm49',
          algo: 'eth_secp256k1',
          pubkey: btoa('pubkey-bytes'),
        },
      ]),
    } as never;

    const account = await cosmos.getAccount('injective-1');
    expect(account.algo).toBe('eth_secp256k1');
    expect(account.pubkey).toEqual(Uint8Array.from(Buffer.from('pubkey-bytes')));
  });

  it('sends cosmos_signArbitrary as base64', async () => {
    const cosmos = new ZuniaWCCosmosWallet();
    const request = jest.fn().mockResolvedValue({ pub_key: { type: 'tendermint/PubKeySecp256k1', value: 'AA==' }, signature: 'BB==' });
    cosmos.provider = { request } as never;

    await cosmos.signArbitrary('cosmoshub-4', 'cosmos1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq', 'hello');

    expect(request).toHaveBeenCalledWith(
      {
        method: 'cosmos_signArbitrary',
        params: {
          signerAddress: 'cosmos1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
          data: btoa('hello'),
        },
      },
      'cosmos:cosmoshub-4',
      undefined
    );
  });
});
