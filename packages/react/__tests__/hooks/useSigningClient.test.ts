import { WalletState } from '@interchain-kit/core';
import { renderHook, waitFor } from '@testing-library/react';
import { useState } from 'react';

import { activeRequests, cache } from '../../src/hooks/useAsync';
import { useSigningClient } from '../../src/hooks/useSigningClient';
import { useWalletManager } from '../../src/hooks/useWalletManager';

jest.mock('../../src/hooks/useWalletManager', () => ({
  useWalletManager: jest.fn(),
}));

describe('useSigningClient chain type changes', () => {
  const signingClient = { sign: jest.fn() };
  const manager = {
    getChainByName: jest.fn((chainName: string) => ({
      chainType: chainName === 'cosmoshub' ? 'cosmos' : chainName,
    })),
    getChainWalletState: jest.fn(),
    getRpcEndpoint: jest.fn(),
    getSigningClient: jest.fn(),
    isReady: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    cache.clear();
    activeRequests.clear();
    manager.getChainWalletState.mockReturnValue({
      walletState: WalletState.Connected,
    });
    manager.getRpcEndpoint.mockResolvedValue('https://rpc.example.com');
    manager.getSigningClient.mockResolvedValue(signingClient);
    (useWalletManager as jest.Mock).mockReturnValue(manager);
  });

  const useClient = (chainName: string) => {
    const client = useSigningClient(chainName, 'test-wallet');
    // A consumer can call other hooks after useSigningClient.
    const [marker] = useState('unchanged');
    return { ...client, marker };
  };

  it.each(['ethereum', 'solana'])(
    'switches from %s to Cosmos and back',
    async (chainName) => {
      const { result, rerender } = renderHook(({ chain }) => useClient(chain), {
        initialProps: { chain: chainName },
      });
      expect(result.current).toEqual({
        signingClient: null,
        isLoading: false,
        error: null,
        marker: 'unchanged',
      });
      expect(manager.getRpcEndpoint).not.toHaveBeenCalled();
      expect(manager.getSigningClient).not.toHaveBeenCalled();

      rerender({ chain: 'cosmoshub' });
      await waitFor(() =>
        expect(result.current.signingClient).toBe(signingClient)
      );
      expect(manager.getSigningClient).toHaveBeenCalledWith(
        'test-wallet',
        'cosmoshub'
      );

      rerender({ chain: chainName });
      expect(result.current).toEqual({
        signingClient: null,
        isLoading: false,
        error: null,
        marker: 'unchanged',
      });
      expect(manager.getRpcEndpoint).toHaveBeenCalledTimes(1);
      expect(manager.getSigningClient).toHaveBeenCalledTimes(1);
    }
  );

  it('reports Cosmos query errors and clears them on a non-Cosmos chain', async () => {
    const error = new Error('RPC unavailable');
    manager.getRpcEndpoint.mockRejectedValue(error);
    const { result, rerender } = renderHook(({ chain }) => useClient(chain), {
      initialProps: { chain: 'cosmoshub' },
    });
    await waitFor(() => expect(result.current.error).toBe(error));
    expect(manager.getSigningClient).not.toHaveBeenCalled();
    rerender({ chain: 'ethereum' });
    expect(result.current).toEqual({
      signingClient: null,
      isLoading: false,
      error: null,
      marker: 'unchanged',
    });
  });
});
