import { Chain } from '@chain-registry/types';
import { SessionTypes } from '@walletconnect/types';
import { UniversalProvider } from '@walletconnect/universal-provider';

// Mock modules that cause import chain issues (extension-wallet → getClientFromExtension)
jest.mock('../src/utils/get-wallet-of-type', () => ({}));
jest.mock('../src/wallets/extension-wallet', () => ({
  ExtensionWallet: class {},
}));
jest.mock('@walletconnect/universal-provider');

import { WCWallet } from '../src/wallets/wc-wallets/wc-wallet';

const localStorageMock: Storage = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string): string | null => store[key] || null,
    setItem: (key: string, value: string): void => {
      store[key] = value;
    },
    removeItem: (key: string): void => {
      delete store[key];
    },
    clear: (): void => {
      store = {};
    },
    key: (index: number): string | null => Object.keys(store)[index] || null,
    length: 0,
  };
})();

Object.defineProperties(global, {
  localStorage: {
    value: localStorageMock,
    writable: true,
  },
});

const makeChain = (
  chainId: string,
  chainType: 'cosmos' | 'eip155' | 'solana'
): Chain => ({
  chainName: chainId,
  chainType,
  chainId,
  bech32Config: {
    bech32PrefixAccAddr: 'test',
    bech32PrefixAccPub: 'testpub',
    bech32PrefixValAddr: 'testval',
    bech32PrefixValPub: 'testvalpub',
    bech32PrefixConsAddr: 'testcons',
    bech32PrefixConsPub: 'testconspub',
  },
});

/**
 * Build a minimal SessionTypes.Struct for testing.
 * Only `namespaces` varies per test; the rest are stub values
 * so we cast once here instead of `as any` in every test.
 */
function makeSession(
  namespaces: Record<string, Partial<SessionTypes.BaseNamespace>>
): SessionTypes.Struct {
  const full: Record<string, SessionTypes.BaseNamespace> = {};
  for (const [ns, val] of Object.entries(namespaces)) {
    full[ns] = {
      accounts: [],
      methods: [],
      events: [],
      ...val,
    };
  }
  return {
    topic: 'test-topic',
    pairingTopic: 'test-pairing',
    relay: { protocol: 'irn' },
    expiry: Date.now() + 600_000,
    acknowledged: true,
    controller: 'test-controller',
    namespaces: full,
    requiredNamespaces: {},
    optionalNamespaces: {},
    self: {
      publicKey: '',
      metadata: { name: '', description: '', url: '', icons: [] },
    },
    peer: {
      publicKey: '',
      metadata: { name: '', description: '', url: '', icons: [] },
    },
  };
}

describe('WCWallet multichain connect', () => {
  let wallet: WCWallet;
  let mockConnect: jest.Mock;
  let mockDisconnect: jest.Mock;

  beforeEach(async () => {
    localStorageMock.clear();
    jest.clearAllMocks();

    mockConnect = jest.fn().mockResolvedValue({
      namespaces: {
        cosmos: { chains: ['cosmos:cosmoshub-4'], accounts: [] },
      },
    });
    mockDisconnect = jest.fn().mockResolvedValue(undefined);

    (UniversalProvider.init as jest.Mock).mockResolvedValue({
      connect: mockConnect,
      disconnect: mockDisconnect,
      on: jest.fn(),
    });

    wallet = new WCWallet();
    wallet.setChainMap([makeChain('cosmoshub-4', 'cosmos')]);
    await wallet.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should connect normally when no existing session', async () => {
    await wallet.connect('cosmoshub-4');

    expect(mockConnect).toHaveBeenCalledTimes(1);
    expect(mockConnect).toHaveBeenCalledWith(
      expect.objectContaining({
        namespaces: expect.objectContaining({
          cosmos: expect.objectContaining({
            chains: ['cosmos:cosmoshub-4'],
          }),
        }),
      })
    );
  });

  it('should reuse session when all required chains are covered', async () => {
    wallet.provider.session = makeSession({
      cosmos: { chains: ['cosmos:cosmoshub-4'] },
    });

    await wallet.connect('cosmoshub-4');

    expect(mockConnect).not.toHaveBeenCalled();
    expect(mockDisconnect).not.toHaveBeenCalled();
  });

  it('should disconnect stale session and reconnect when a chain is missing', async () => {
    wallet.setChainMap([
      makeChain('cosmoshub-4', 'cosmos'),
      makeChain('osmosis-1', 'cosmos'),
    ]);

    // Existing session only covers cosmoshub-4
    wallet.provider.session = makeSession({
      cosmos: { chains: ['cosmos:cosmoshub-4'] },
    });

    await wallet.connect('cosmoshub-4');

    expect(mockDisconnect).toHaveBeenCalledTimes(1);
    expect(mockConnect).toHaveBeenCalledTimes(1);
    expect(mockConnect).toHaveBeenCalledWith(
      expect.objectContaining({
        namespaces: expect.objectContaining({
          cosmos: expect.objectContaining({
            chains: expect.arrayContaining([
              'cosmos:cosmoshub-4',
              'cosmos:osmosis-1',
            ]),
          }),
        }),
      })
    );
  });

  it('should handle multichain with mixed chain types', async () => {
    wallet.setChainMap([
      makeChain('cosmoshub-4', 'cosmos'),
      makeChain('1', 'eip155'),
    ]);

    // Session only has cosmos, missing eip155
    wallet.provider.session = makeSession({
      cosmos: { chains: ['cosmos:cosmoshub-4'] },
    });

    await wallet.connect('cosmoshub-4');

    expect(mockDisconnect).toHaveBeenCalledTimes(1);
    expect(mockConnect).toHaveBeenCalledTimes(1);
    expect(mockConnect).toHaveBeenCalledWith(
      expect.objectContaining({
        namespaces: expect.objectContaining({
          cosmos: expect.objectContaining({
            chains: ['cosmos:cosmoshub-4'],
          }),
          eip155: expect.objectContaining({
            chains: ['eip155:1'],
          }),
        }),
      })
    );
  });

  it('should reuse session when all mixed chain types are covered', async () => {
    wallet.setChainMap([
      makeChain('cosmoshub-4', 'cosmos'),
      makeChain('1', 'eip155'),
    ]);

    wallet.provider.session = makeSession({
      cosmos: { chains: ['cosmos:cosmoshub-4'] },
      eip155: { chains: ['eip155:1'] },
    });

    await wallet.connect('cosmoshub-4');

    expect(mockConnect).not.toHaveBeenCalled();
    expect(mockDisconnect).not.toHaveBeenCalled();
  });

  it('should handle session with missing namespace chains gracefully', async () => {
    // no chains field — exercises the `ns.chains ?? []` fallback
    wallet.provider.session = makeSession({
      cosmos: {},
    });

    await wallet.connect('cosmoshub-4');

    expect(mockDisconnect).toHaveBeenCalledTimes(1);
    expect(mockConnect).toHaveBeenCalledTimes(1);
  });

  it('should save session to localStorage after connect', async () => {
    const sessionData = makeSession({
      cosmos: { chains: ['cosmos:cosmoshub-4'] },
    });
    mockConnect.mockResolvedValue(sessionData);

    await wallet.connect('cosmoshub-4');

    expect(localStorage.getItem('wc-session')).toBe(
      JSON.stringify(sessionData)
    );
  });

  it('should include solana namespace when solana chains are present', async () => {
    wallet.setChainMap([
      makeChain('cosmoshub-4', 'cosmos'),
      makeChain('5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp', 'solana'),
    ]);

    // Session missing solana
    wallet.provider.session = makeSession({
      cosmos: { chains: ['cosmos:cosmoshub-4'] },
    });

    await wallet.connect('cosmoshub-4');

    expect(mockDisconnect).toHaveBeenCalledTimes(1);
    expect(mockConnect).toHaveBeenCalledWith(
      expect.objectContaining({
        namespaces: expect.objectContaining({
          solana: expect.objectContaining({
            chains: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
          }),
        }),
      })
    );
  });
});
