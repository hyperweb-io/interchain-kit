import { Algo } from '@interchain-kit/core';

import { InterchainStoreType } from '../src/types';
import { LocalStorage } from '../src/utils/local-storage';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('LocalStorage', () => {
  let localStorage: LocalStorage;

  beforeEach(() => {
    localStorage = new LocalStorage();
    localStorageMock.clear();
  });

  describe('save', () => {
    it('should save data to localStorage', () => {
      const data: Partial<InterchainStoreType> = {
        currentWalletName: 'keplr',
        currentChainName: 'cosmoshub',
        isReady: true,
        chainWalletStates: [
          {
            chainName: 'cosmoshub',
            walletName: 'keplr',
            walletState: 'Connected' as any,
            rpcEndpoint: 'https://rpc.cosmos.network',
            errorMessage: '',
            account: {
              address: 'cosmos1abc123',
              pubkey: new Uint8Array([1, 2, 3]),
              isNanoLedger: false,
              algo: 'secp256k1' as Algo,
            },
          },
        ],
      };

      localStorage.save(data);

      const savedData = localStorageMock.getItem('interchain-kit-store');
      expect(savedData).toBe(JSON.stringify(data));
    });

    it('should overwrite existing data', () => {
      const initialData: Partial<InterchainStoreType> = {
        currentWalletName: 'keplr',
        currentChainName: 'cosmoshub',
      };

      const updatedData: Partial<InterchainStoreType> = {
        currentWalletName: 'leap',
        currentChainName: 'osmosis',
        isReady: true,
      };

      localStorage.save(initialData);
      localStorage.save(updatedData);

      const savedData = localStorageMock.getItem('interchain-kit-store');
      expect(savedData).toBe(JSON.stringify(updatedData));
    });

    it('should handle empty data', () => {
      localStorage.save({});

      const savedData = localStorageMock.getItem('interchain-kit-store');
      expect(savedData).toBe('{}');
    });

    it('should handle partial data', () => {
      const partialData: Partial<InterchainStoreType> = {
        currentWalletName: 'keplr',
      };

      localStorage.save(partialData);

      const savedData = localStorageMock.getItem('interchain-kit-store');
      expect(savedData).toBe(JSON.stringify(partialData));
    });
  });

  describe('load', () => {
    it('should load data from localStorage', () => {
      const data: Partial<InterchainStoreType> = {
        currentWalletName: 'keplr',
        currentChainName: 'cosmoshub',
        isReady: true,
        chainWalletStates: [
          {
            chainName: 'cosmoshub',
            walletName: 'keplr',
            walletState: 'Connected' as any,
            rpcEndpoint: 'https://rpc.cosmos.network',
            errorMessage: '',
            account: {
              address: 'cosmos1abc123',
              pubkey: new Uint8Array([1, 2, 3]),
              isNanoLedger: false,
              algo: 'secp256k1' as Algo,
            },
          },
        ],
      };

      localStorageMock.setItem('interchain-kit-store', JSON.stringify(data));

      const loadedData = localStorage.load();
      const expectedData = {
        ...data,
        chainWalletStates: data.chainWalletStates?.map(state => ({
          ...state,
          account: state.account ? {
            ...state.account,
            pubkey: new Uint8Array([1, 2, 3])
          } : undefined
        }))
      };
      expect(loadedData).toEqual(expectedData);
      expect(loadedData.chainWalletStates?.[0]?.account?.pubkey).toBeInstanceOf(Uint8Array);
    });

    it('should return empty object when no data exists', () => {
      const loadedData = localStorage.load();
      expect(loadedData).toEqual({});
    });

    it('should return empty object when localStorage returns null', () => {
      localStorageMock.setItem('interchain-kit-store', '');
      const loadedData = localStorage.load();
      expect(loadedData).toEqual({});
    });

    it('should handle malformed JSON gracefully', () => {
      localStorageMock.setItem('interchain-kit-store', 'invalid json');

      expect(() => {
        localStorage.load();
      }).toThrow();
    });

    it('should handle complex nested data', () => {
      const complexData: Partial<InterchainStoreType> = {
        currentWalletName: 'keplr',
        currentChainName: 'cosmoshub',
        isReady: true,
        modalIsOpen: false,
        walletConnectQRCodeUri: 'wc:abc123',
        chainWalletStates: [
          {
            chainName: 'cosmoshub',
            walletName: 'keplr',
            walletState: 'Connected' as any,
            rpcEndpoint: 'https://rpc.cosmos.network',
            errorMessage: '',
            account: {
              address: 'cosmos1abc123',
              pubkey: new Uint8Array([1, 2, 3]),
              isNanoLedger: false,
              algo: 'secp256k1' as Algo,
            },
          },
          {
            chainName: 'osmosis',
            walletName: 'keplr',
            walletState: 'Disconnected' as any,
            rpcEndpoint: 'https://rpc.osmosis.zone',
            errorMessage: 'Connection failed',
            account: {
              address: 'cosmos1abc123',
              pubkey: new Uint8Array([1, 2, 3]),
              isNanoLedger: false,
              algo: 'secp256k1' as Algo,
            },
          },
        ],
      };

      localStorage.save(complexData);
      const loadedData = localStorage.load();

      const expectedData = {
        ...complexData,
        chainWalletStates: complexData.chainWalletStates?.map(state => ({
          ...state,
          account: state.account ? {
            ...state.account,
            pubkey: new Uint8Array([1, 2, 3])
          } : undefined
        }))
      };
      expect(loadedData).toEqual(expectedData);
      expect(loadedData.chainWalletStates?.[0]?.account?.pubkey).toBeInstanceOf(Uint8Array);
      expect(loadedData.chainWalletStates?.[1]?.account?.pubkey).toBeInstanceOf(Uint8Array);
    });
  });

  describe('Integration', () => {
    it('should save and load data correctly', () => {
      const originalData: Partial<InterchainStoreType> = {
        currentWalletName: 'keplr',
        currentChainName: 'cosmoshub',
        isReady: true,
        chainWalletStates: [
          {
            chainName: 'cosmoshub',
            walletName: 'keplr',
            walletState: 'Connected' as any,
            rpcEndpoint: 'https://rpc.cosmos.network',
            errorMessage: '',
            account: {
              address: 'cosmos1abc123',
              pubkey: new Uint8Array([1, 2, 3]),
              isNanoLedger: false,
              algo: 'secp256k1' as Algo,
            },
          },
        ],
      };

      localStorage.save(originalData);
      const loadedData = localStorage.load();

      const expectedData = {
        ...originalData,
        chainWalletStates: originalData.chainWalletStates?.map(state => ({
          ...state,
          account: state.account ? {
            ...state.account,
            pubkey: new Uint8Array([1, 2, 3])
          } : undefined
        }))
      };
      expect(loadedData).toEqual(expectedData);
      expect(loadedData.chainWalletStates?.[0]?.account?.pubkey).toBeInstanceOf(Uint8Array);
    });

    it('should handle multiple save/load cycles', () => {
      const data1: Partial<InterchainStoreType> = {
        currentWalletName: 'keplr',
        currentChainName: 'cosmoshub',
      };

      const data2: Partial<InterchainStoreType> = {
        currentWalletName: 'leap',
        currentChainName: 'osmosis',
        isReady: true,
      };

      localStorage.save(data1);
      expect(localStorage.load()).toEqual(data1);

      localStorage.save(data2);
      expect(localStorage.load()).toEqual(data2);
    });

    it('should revive Uint8Array pubkeys after save/load round-trip', () => {
      const originalData: Partial<InterchainStoreType> = {
        currentWalletName: 'keplr',
        currentChainName: 'cosmoshub',
        isReady: true,
        chainWalletStates: [
          {
            chainName: 'cosmoshub',
            walletName: 'keplr',
            walletState: 'Connected' as any,
            rpcEndpoint: 'https://rpc.cosmos.network',
            errorMessage: '',
            account: {
              address: 'cosmos1abc123',
              pubkey: new Uint8Array([1, 2, 3]),
              isNanoLedger: false,
              algo: 'secp256k1' as Algo,
            },
          },
        ],
      };

      localStorage.save(originalData);
      const loadedData = localStorage.load();
      const pubkey = loadedData.chainWalletStates?.[0]?.account?.pubkey;

      expect(pubkey).toBeInstanceOf(Uint8Array);
      expect(Array.from(pubkey as Uint8Array)).toEqual([1, 2, 3]);
    });
  });
});
