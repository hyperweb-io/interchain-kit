import { Algo,WalletState } from '@interchain-kit/core';

import { InterchainStore } from '../src/store';
import { ChainWalletState } from '../src/types';

describe('InterchainStore', () => {
  let store: InterchainStore;

  beforeEach(() => {
    store = new InterchainStore();
  });

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const state = store.getState();

      expect(state).toEqual({
        currentWalletName: '',
        currentChainName: '',
        chainWalletStates: [],
        isReady: false,
        modalIsOpen: false,
        walletConnectQRCodeUri: '',
      });
    });
  });

  describe('State Management', () => {
    it('should update state with setState', () => {
      const newState = {
        currentWalletName: 'keplr',
        currentChainName: 'cosmoshub',
        isReady: true,
      };

      store.setState(newState);
      const state = store.getState();

      expect(state.currentWalletName).toBe('keplr');
      expect(state.currentChainName).toBe('cosmoshub');
      expect(state.isReady).toBe(true);
      expect(state.modalIsOpen).toBe(false); // Should preserve existing values
    });

    it('should update state with updateState', () => {
      store.setState({ currentWalletName: 'keplr' });

      store.updateState({ currentChainName: 'cosmoshub' });
      const state = store.getState();

      expect(state.currentWalletName).toBe('keplr');
      expect(state.currentChainName).toBe('cosmoshub');
    });

    it('should set current chain name', () => {
      store.setCurrentChainName('cosmoshub');
      const state = store.getState();

      expect(state.currentChainName).toBe('cosmoshub');
    });

    it('should set current wallet name', () => {
      store.setCurrentWalletName('keplr');
      const state = store.getState();

      expect(state.currentWalletName).toBe('keplr');
    });
  });

  describe('Subscription System', () => {
    it('should subscribe to state changes', () => {
      const listener = jest.fn();
      const unsubscribe = store.subscribe(listener);

      store.setState({ currentWalletName: 'keplr' });

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({ currentWalletName: 'keplr' })
      );

      unsubscribe();
    });

    it('should unsubscribe from state changes', () => {
      const listener = jest.fn();
      const unsubscribe = store.subscribe(listener);

      unsubscribe();
      store.setState({ currentWalletName: 'keplr' });

      expect(listener).not.toHaveBeenCalled();
    });

    it('should handle multiple subscribers', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      store.subscribe(listener1);
      store.subscribe(listener2);

      store.setState({ currentWalletName: 'keplr' });

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });

    it('should handle listener errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const errorListener = jest.fn().mockImplementation(() => {
        throw new Error('Listener error');
      });
      const normalListener = jest.fn();

      store.subscribe(errorListener);
      store.subscribe(normalListener);

      store.setState({ currentWalletName: 'keplr' });

      expect(consoleSpy).toHaveBeenCalledWith('Error in store listener:', expect.any(Error));
      expect(normalListener).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('Chain Wallet State Management', () => {
    const mockChainWalletState: Partial<ChainWalletState> = {
      walletState: WalletState.Connected,
      rpcEndpoint: 'https://rpc.cosmos.network',
      account: {
        address: 'cosmos1abc123',
        pubkey: new Uint8Array([1, 2, 3]),
        isNanoLedger: false,
        algo: 'secp256k1' as Algo,
      },
    };

    it('should add new chain wallet state', () => {
      store.addChainWalletState('keplr', 'cosmoshub', mockChainWalletState);
      const state = store.getState();

      expect(state.chainWalletStates).toHaveLength(1);
      expect(state.chainWalletStates[0]).toEqual({
        chainName: 'cosmoshub',
        walletName: 'keplr',
        walletState: WalletState.Connected,
        rpcEndpoint: 'https://rpc.cosmos.network',
        errorMessage: '',
        account: mockChainWalletState.account,
      });
    });

    it('should update existing chain wallet state', () => {
      store.addChainWalletState('keplr', 'cosmoshub', mockChainWalletState);

      store.updateChainWalletState('keplr', 'cosmoshub', {
        walletState: WalletState.Disconnected,
        errorMessage: 'Connection failed',
      });

      const state = store.getState();
      expect(state.chainWalletStates[0].walletState).toBe(WalletState.Disconnected);
      expect(state.chainWalletStates[0].errorMessage).toBe('Connection failed');
    });

    it('should add new chain wallet state when updating non-existent one', () => {
      store.updateChainWalletState('keplr', 'cosmoshub', mockChainWalletState);
      const state = store.getState();

      expect(state.chainWalletStates).toHaveLength(1);
      expect(state.chainWalletStates[0].walletName).toBe('keplr');
      expect(state.chainWalletStates[0].chainName).toBe('cosmoshub');
    });

    it('should remove chain wallet state', () => {
      store.addChainWalletState('keplr', 'cosmoshub', mockChainWalletState);
      store.addChainWalletState('keplr', 'osmosis', mockChainWalletState);

      store.removeChainWalletState('keplr', 'cosmoshub');
      const state = store.getState();

      expect(state.chainWalletStates).toHaveLength(1);
      expect(state.chainWalletStates[0].chainName).toBe('osmosis');
    });

    it('should get chain wallet state', () => {
      store.addChainWalletState('keplr', 'cosmoshub', mockChainWalletState);

      const chainWalletState = store.getChainWalletState('keplr', 'cosmoshub');
      expect(chainWalletState).toEqual({
        chainName: 'cosmoshub',
        walletName: 'keplr',
        walletState: WalletState.Connected,
        rpcEndpoint: 'https://rpc.cosmos.network',
        errorMessage: '',
        account: mockChainWalletState.account,
      });
    });

    it('should return undefined for non-existent chain wallet state', () => {
      const chainWalletState = store.getChainWalletState('keplr', 'cosmoshub');
      expect(chainWalletState).toBeUndefined();
    });

    it('should rebuild index map correctly', () => {
      store.addChainWalletState('keplr', 'cosmoshub', mockChainWalletState);
      store.addChainWalletState('keplr', 'osmosis', mockChainWalletState);

      // Manually clear the index map to simulate restoration from storage
      (store as any).chainWalletIndexMap.clear();
      store.buildIndexMap();

      const state1 = store.getChainWalletState('keplr', 'cosmoshub');
      const state2 = store.getChainWalletState('keplr', 'osmosis');

      expect(state1).toBeDefined();
      expect(state2).toBeDefined();
    });
  });

  describe('Index Map Performance', () => {
    it('should maintain correct index mapping after multiple operations', () => {
      // Add multiple chain wallet states
      store.addChainWalletState('keplr', 'cosmoshub', { walletState: WalletState.Connected });
      store.addChainWalletState('keplr', 'osmosis', { walletState: WalletState.Connected });
      store.addChainWalletState('leap', 'cosmoshub', { walletState: WalletState.Connected });

      // Remove middle item
      store.removeChainWalletState('keplr', 'osmosis');

      // Verify remaining states are accessible
      const cosmoshubKeplr = store.getChainWalletState('keplr', 'cosmoshub');
      const cosmoshubLeap = store.getChainWalletState('leap', 'cosmoshub');
      const osmosisKeplr = store.getChainWalletState('keplr', 'osmosis');

      expect(cosmoshubKeplr).toBeDefined();
      expect(cosmoshubLeap).toBeDefined();
      expect(osmosisKeplr).toBeUndefined();
    });
  });

  describe('Current Wallet/Chain Auto-Sync', () => {
    it('should set currentWalletName and currentChainName when connected', () => {
      store.updateChainWalletState('keplr', 'cosmoshub', {
        walletState: WalletState.Connected,
      });

      const state = store.getState();
      expect(state.currentWalletName).toBe('keplr');
      expect(state.currentChainName).toBe('cosmoshub');
    });

    it('should clear current when disconnecting the current wallet/chain', () => {
      store.updateChainWalletState('keplr', 'cosmoshub', {
        walletState: WalletState.Connected,
      });

      store.updateChainWalletState('keplr', 'cosmoshub', {
        walletState: WalletState.Disconnected,
      });

      const state = store.getState();
      expect(state.currentWalletName).toBe('');
      expect(state.currentChainName).toBe('');
    });
  });
});
