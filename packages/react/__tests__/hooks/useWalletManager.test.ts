import { renderHook } from '@testing-library/react';

import { useWalletManager } from '../../src/hooks/useWalletManager';
import { useInterchainWalletContext } from '../../src/provider';

jest.mock('../../src/provider', () => ({
  useInterchainWalletContext: jest.fn(),
}));

jest.mock('../../src/hooks/useForceUpdate', () => ({
  useForceUpdate: jest.fn(() => jest.fn()),
}));

describe('useWalletManager', () => {
  it('should return the result of bindAllMethods with the walletManager from useInterchainWalletContext', () => {
    const mockWalletManager = {
      subscribe: jest.fn(() => jest.fn()), // mock subscribe returns unsubscribe function
      getChainByName: jest.fn(),
    };

    (useInterchainWalletContext as jest.Mock).mockReturnValue(mockWalletManager);

    const { result } = renderHook(() => useWalletManager());

    expect(useInterchainWalletContext).toHaveBeenCalled();
    expect(mockWalletManager.subscribe).toHaveBeenCalled();
    expect(result.current).toBeDefined();
    expect(typeof result.current.getChainByName).toBe('function');
  });
});