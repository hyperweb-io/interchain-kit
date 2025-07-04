import { WalletAccount, WalletState } from '@interchain-kit/core';

import { ChainWalletState } from '../src/types';
import { WalletStore } from '../src/wallet-store';

describe('WalletStore', () => {
  const mockChains = [
    { chainName: 'chain-1', chainId: 'chain-1' },
    { chainName: 'chain-2', chainId: 'chain-2' },
  ];
  const mockWallet = {
    info: { name: 'test-wallet' },
    getChainById: jest.fn((chainId) => mockChains.find(c => c.chainId === chainId)),
  };
  const mockWalletManager = {};
  const mockStoreManager = {
    state: {
      proxy: {
        chainWalletStates: [
          { walletName: 'test-wallet', chainName: 'chain-1', walletState: WalletState.Disconnected, account: null as WalletAccount | null, errorMessage: null as string | null, rpcEndpoint: '' },
          { walletName: 'test-wallet', chainName: 'chain-2', walletState: WalletState.NotExist, account: null as WalletAccount | null, errorMessage: null as string | null, rpcEndpoint: '' },
        ] as ChainWalletState[],
      },
    },
  };

  let walletStore: WalletStore;

  beforeEach(() => {
    jest.clearAllMocks();
    walletStore = new WalletStore(
      mockWallet as any,
      mockChains as any,
      mockWalletManager as any,
      mockStoreManager as any
    );
    // Mock chainWallets with spies
    for (const chain of mockChains) {
      const chainWallet = {
        connect: jest.fn(),
        disconnect: jest.fn(),
        getAccount: jest.fn().mockResolvedValue({ address: 'addr', algo: 'secp256k1', pubkey: new Uint8Array() }),
        sign: jest.fn(),
        getOfflineSigner: jest.fn(),
        addSuggestChain: jest.fn(),
        getProvider: jest.fn(),
      };
      walletStore.chainWallets.set(chain.chainName, chainWallet as any);
    }
  });

  it('calls init on all chain wallets', async () => {
    for (const chainWallet of walletStore.chainWallets.values()) {
      chainWallet.init = jest.fn();
    }
    await walletStore.init();
    for (const chainWallet of walletStore.chainWallets.values()) {
      expect(chainWallet.init).toHaveBeenCalled();
    }
  });

  it('returns correct walletState and errorMessage', () => {
    expect(walletStore.walletState).toBe(WalletState.NotExist);
    expect(walletStore.errorMessage).toBeUndefined();
  });

  it('gets chain wallet by chain name', () => {
    const chainWallet = walletStore.getChainWalletByChainName('chain-1');
    expect(chainWallet).toBeDefined();
  });

  it('calls connect on the correct chain wallet', async () => {
    await walletStore.connect('chain-1');
    expect(walletStore.chainWallets.get('chain-1')?.connect).toHaveBeenCalled();
  });

  it('calls disconnect on the correct chain wallet', async () => {
    await walletStore.disconnect('chain-1');
    expect(walletStore.chainWallets.get('chain-1')?.disconnect).toHaveBeenCalled();
  });

  it('calls getAccount on the correct chain wallet', async () => {
    await walletStore.getAccount('chain-1');
    expect(walletStore.chainWallets.get('chain-1')?.getAccount).toHaveBeenCalled();
  });

  it('calls sign on the correct chain wallet', async () => {
    const req = { method: 'cosmos_amino', data: {}, chainId: 'chain-1' };
    await walletStore.sign('chain-1', req as any);
    expect(walletStore.chainWallets.get('chain-1')?.sign).toHaveBeenCalledWith('chain-1', req);
  });

  it('calls getOfflineSigner on the correct chain wallet', async () => {
    await walletStore.getOfflineSigner('chain-1');
    expect(walletStore.chainWallets.get('chain-1')?.getOfflineSigner).toHaveBeenCalled();
  });

  it('calls addSuggestChain on the correct chain wallet', async () => {
    await walletStore.addSuggestChain('chain-1');
    expect(walletStore.chainWallets.get('chain-1')?.addSuggestChain).toHaveBeenCalled();
  });

  it('calls getProvider on the correct chain wallet', async () => {
    await walletStore.getProvider('chain-1');
    expect(walletStore.chainWallets.get('chain-1')?.getProvider).toHaveBeenCalled();
  });
}); 