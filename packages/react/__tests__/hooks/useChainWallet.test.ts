/**
 * @jest-environment jsdom
 */

import { WalletState } from '@interchain-kit/core';
import { ChainWalletStore, WalletStore, WalletStoreManager } from '@interchain-kit/store';
import { renderHook, waitFor } from '@testing-library/react';

import { useChainWallet } from '../../src/hooks/useChainWallet';
import { useWalletManager } from '../../src/hooks/useWalletManager';
import { MockWallet } from '../helpers/mock-wallet';

// Mock the useWalletManager hook
jest.mock('../../src/hooks/useWalletManager', () => ({
  useWalletManager: jest.fn(),
}));

describe('useChainWallet', () => {

  const mockWallet = new MockWallet({ name: 'test-wallet', mode: 'extension', prettyName: 'Test Wallet' });

  const mockWalletStore = new WalletStore(
    mockWallet as any,
    [{ chainName: 'test-chain', chainType: 'cosmos' as const }],
    {} as any,
    {} as WalletStoreManager
  );

  const mockChainWallet = new ChainWalletStore(
    { chainName: 'test-chain', chainType: 'cosmos' as const },
    mockWallet,
    {} as any,
    {} as WalletStoreManager
  );

  const mockWalletManager: jest.Mocked<WalletStoreManager> = {
    walletManager: {} as any,
    WalletStores: new Map(),
    state: {} as any,
    config: {} as any,
    chains: [{ chainName: 'test-chain', chainType: 'cosmos' as const }],
    assetLists: [{ chainName: 'test-chain', assets: [] }],
    wallets: [mockWalletStore],
    currentWalletName: 'test-wallet',
    currentChainName: 'test-chain',
    init: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    addChains: jest.fn(),
    setCurrentChainName: jest.fn(),
    setCurrentWalletName: jest.fn(),
    getChainByName: jest.fn().mockReturnValue({ chainName: 'test-chain', chainType: 'cosmos' as const }),
    updateChainWalletState: jest.fn(),
    getAssetListByName: jest.fn(),
    getPreferSignType: jest.fn(),
    getSignerOptions: jest.fn(),
    getOfflineSigner: jest.fn(),
    getWalletByName: jest.fn(),
    getChainWalletState: jest.fn(),
    getChainLogoUrl: jest.fn(),
    getSigningClient: jest.fn(),
    getRpcEndpoint: jest.fn(),
    getAccount: jest.fn(),
    getEnv: jest.fn(),
    getDownloadLink: jest.fn(),
    isReady: true,
    subscribe: jest.fn(),
    subscribeWithSelector: jest.fn(),
    getChainWalletByName: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useWalletManager as jest.Mock).mockReturnValue(mockWalletManager);
  });

  it('should return the correct chain and wallet data', async () => {
    const chainName = 'test-chain';
    const walletName = 'test-wallet';

    const mockChain = { chainName: 'test-chain', chainType: 'cosmos' as const };

    const mockChainWalletState = {
      walletState: WalletState.Connected,
      account: { username: 'test-user', address: 'test-address', algo: 'secp256k1' as const, pubkey: new Uint8Array() },
      errorMessage: '',
      rpcEndpoint: 'http://localhost:26657',
      chainName: 'test-chain',
      walletName: 'test-wallet',
    };

    mockWalletManager.getChainByName.mockReturnValue(mockChain);
    mockWalletManager.getChainWalletByName.mockReturnValue(mockChainWallet);
    mockWalletManager.getChainWalletState.mockReturnValue(mockChainWalletState);
    mockWalletManager.getChainLogoUrl.mockReturnValue('http://logo.url');

    const { result } = renderHook(() => useChainWallet(chainName, walletName));

    await waitFor(() => {
      expect(result.current.chain).toEqual(mockChain);
      expect(result.current.wallet).toBeInstanceOf(ChainWalletStore);
      expect(result.current.assetList).toEqual(mockWalletManager.assetLists[0]);
      expect(result.current.status).toBe(WalletState.Connected);
      expect(result.current.username).toBe('test-user');
      expect(result.current.address).toBe('test-address');
      expect(result.current.message).toBe('');
      expect(result.current.rpcEndpoint).toBe('http://localhost:26657');
      expect(result.current.logoUrl).toBe('http://logo.url');
    });
  });

  it('should call disconnect when disconnect is invoked', async () => {
    const chainName = 'test-chain';
    const walletName = 'test-wallet';

    const { result } = renderHook(() => useChainWallet(chainName, walletName));

    result.current.disconnect();

    await waitFor(() => {
      expect(mockWalletManager.disconnect).toHaveBeenCalledWith(walletName, chainName);
    });


  });

  it('should return the correct RPC endpoint', async () => {
    const chainName = 'test-chain';
    const walletName = 'test-wallet';

    mockWalletManager.getRpcEndpoint.mockResolvedValue('http://localhost:26657');

    const { result } = renderHook(() => useChainWallet(chainName, walletName));

    const endpointResult = await result.current.getRpcEndpoint();

    await waitFor(() => {
      expect(endpointResult).toBe('http://localhost:26657');
    });
  });

  it('should return the signing client', async () => {
    const chainName = 'test-chain';
    const walletName = 'test-wallet';

    const mockSigningClient: any = {
    };

    mockWalletManager.getSigningClient.mockReturnValue(mockSigningClient);

    const { result } = renderHook(() => useChainWallet(chainName, walletName));

    await waitFor(() => {
      expect(result.current.getSigningClient()).toBe(mockSigningClient);
    });
  });
});