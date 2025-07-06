import { Chain } from '@chain-registry/types';
import { UniWallet, WalletAccount, WalletManager, WalletState } from '@interchain-kit/core';
import { AminoGenericOfflineSigner, DirectGenericOfflineSigner } from '@interchainjs/cosmos/types/wallet';

import { ChainWalletStore } from '../src/chain-wallet-store.';
import { WalletStoreManager } from '../src/wallet-store-manager';

describe('ChainWalletStore', () => {
  let chainWalletStore: ChainWalletStore;
  let mockWallet: UniWallet;
  let mockChain: Chain;
  let mockWalletManager: WalletManager;
  let mockStoreManager: WalletStoreManager;

  const mockWalletAccount: WalletAccount = {
    address: 'cosmos1testaddress',
    algo: 'secp256k1',
    pubkey: new Uint8Array([1, 2, 3, 4])
  };

  const mockChainData: Chain = {
    chainName: 'cosmoshub',
    chainId: 'cosmoshub-4',
    chainType: 'cosmos',
    apis: {
      rpc: [{ address: 'https://rpc.cosmos.network' }],
      rest: [{ address: 'https://api.cosmos.network' }]
    },
    bech32Prefix: 'cosmos'
  };

  beforeEach(() => {
    // Mock wallet
    mockWallet = {
      info: { name: 'keplr-extension' },
      init: jest.fn().mockResolvedValue(undefined),
      connect: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn().mockResolvedValue(undefined),
      sign: jest.fn().mockResolvedValue({ result: { signature: 'test-signature' } }),
      getAccount: jest.fn().mockResolvedValue(mockWalletAccount),
      addSuggestChain: jest.fn().mockResolvedValue(undefined),
      getProvider: jest.fn().mockResolvedValue({}),
    } as any;

    // Mock chain
    mockChain = mockChainData;

    // Mock wallet manager
    mockWalletManager = {
      getPreferSignType: jest.fn().mockReturnValue('amino'),
      getRpcEndpoint: jest.fn().mockResolvedValue('https://rpc.cosmos.network'),
    } as any;

    // Mock store manager
    mockStoreManager = {
      updateChainWalletState: jest.fn(),
      getChainWalletState: jest.fn().mockReturnValue({}),
    } as any;

    chainWalletStore = new ChainWalletStore(
      mockWallet,
      mockChain,
      mockWalletManager,
      mockStoreManager
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with correct properties', () => {
      expect(chainWalletStore.wallet).toBe(mockWallet);
      expect(chainWalletStore.chain).toBe(mockChain);
      expect(chainWalletStore.walletManager).toBe(mockWalletManager);
      expect(chainWalletStore.storeManager).toBe(mockStoreManager);
      expect(chainWalletStore.info).toBe(mockWallet.info);
    });
  });

  describe('init', () => {
    it('should initialize wallet successfully', async () => {
      await chainWalletStore.init();

      expect(mockWallet.init).toHaveBeenCalled();
      expect(mockStoreManager.updateChainWalletState).toHaveBeenCalledWith(
        mockWallet.info.name,
        mockChain.chainName,
        { walletState: WalletState.Disconnected }
      );
    });

    it('should handle initialization error', async () => {
      const error = new Error('Initialization failed');
      mockWallet.init = jest.fn().mockRejectedValue(error);

      await chainWalletStore.init();

      expect(mockStoreManager.updateChainWalletState).toHaveBeenCalledWith(
        mockWallet.info.name,
        mockChain.chainName,
        { errorMessage: 'Initialization failed' }
      );
    });
  });

  describe('connect', () => {
    it('should connect wallet successfully', async () => {
      await chainWalletStore.connect();

      expect(mockStoreManager.updateChainWalletState).toHaveBeenCalledWith(
        mockWallet.info.name,
        mockChain.chainName,
        { walletState: WalletState.Connecting }
      );
      expect(mockWallet.connect).toHaveBeenCalledWith(mockChain.chainId);
      expect(mockStoreManager.updateChainWalletState).toHaveBeenCalledWith(
        mockWallet.info.name,
        mockChain.chainName,
        { walletState: WalletState.Connected }
      );
    });

    it('should handle connection error', async () => {
      const error = new Error('Connection failed');
      mockWallet.connect = jest.fn().mockRejectedValue(error);

      await chainWalletStore.connect();

      expect(mockStoreManager.updateChainWalletState).toHaveBeenCalledWith(
        mockWallet.info.name,
        mockChain.chainName,
        { walletState: WalletState.Disconnected }
      );
    });
  });

  describe('disconnect', () => {
    it('should disconnect wallet successfully', async () => {
      await chainWalletStore.disconnect();

      expect(mockWallet.disconnect).toHaveBeenCalledWith(mockChain.chainId);
      expect(mockStoreManager.updateChainWalletState).toHaveBeenCalledWith(
        mockWallet.info.name,
        mockChain.chainName,
        { walletState: WalletState.Disconnected }
      );
    });

    it('should handle disconnect error', async () => {
      const error = new Error('Disconnect failed');
      mockWallet.disconnect = jest.fn().mockRejectedValue(error);

      await chainWalletStore.disconnect();

      // Should not throw error, just log it
      expect(mockWallet.disconnect).toHaveBeenCalled();
    });
  });

  describe('sign', () => {
    it('should sign data successfully', async () => {
      const signRequest = {
        method: 'cosmos_amino' as const,
        data: 'test-data',
        chainId: mockChain.chainId!,
        signerAddress: 'cosmos1testaddress'
      };

      const result = await chainWalletStore.sign(mockChain.chainId!, signRequest);

      expect(mockWallet.sign).toHaveBeenCalledWith(mockChain.chainId, signRequest);
      expect(result).toEqual({ signature: 'test-signature' });
    });

    it('should handle sign error', async () => {
      const error = new Error('Sign failed');
      mockWallet.sign = jest.fn().mockRejectedValue(error);

      const signRequest = {
        method: 'cosmos_amino' as const,
        data: 'test-data',
        chainId: mockChain.chainId!,
        signerAddress: 'cosmos1testaddress'
      };

      await expect(chainWalletStore.sign(mockChain.chainId!, signRequest)).rejects.toThrow('Sign failed');

      expect(mockStoreManager.updateChainWalletState).toHaveBeenCalledWith(
        mockWallet.info.name,
        mockChain.chainName,
        { errorMessage: 'Sign failed' }
      );
    });
  });

  describe('getAccount', () => {
    it('should return existing account from store', async () => {
      const existingAccount = { ...mockWalletAccount, address: 'existing-address' };
      mockStoreManager.getChainWalletState = jest.fn().mockReturnValue({
        account: existingAccount
      });

      const result = await chainWalletStore.getAccount();

      expect(result).toEqual(existingAccount);
      expect(mockWallet.getAccount).not.toHaveBeenCalled();
    });

    it('should fetch and store new account', async () => {
      mockStoreManager.getChainWalletState = jest.fn().mockReturnValue({});

      const result = await chainWalletStore.getAccount();

      expect(result).toEqual(mockWalletAccount);
      expect(mockWallet.getAccount).toHaveBeenCalledWith(mockChain.chainId);
      expect(mockStoreManager.updateChainWalletState).toHaveBeenCalledWith(
        mockWallet.info.name,
        mockChain.chainName,
        { account: mockWalletAccount }
      );
    });
  });

  describe('getOfflineSigner', () => {
    it('should return AminoGenericOfflineSigner for cosmos chain with amino sign type', async () => {
      mockWalletManager.getPreferSignType = jest.fn().mockReturnValue('amino');

      const result = await chainWalletStore.getOfflineSigner();

      expect(result).toBeInstanceOf(AminoGenericOfflineSigner);
    });

    it('should return DirectGenericOfflineSigner for cosmos chain with direct sign type', async () => {
      mockWalletManager.getPreferSignType = jest.fn().mockReturnValue('direct');

      const result = await chainWalletStore.getOfflineSigner();

      expect(result).toBeInstanceOf(DirectGenericOfflineSigner);
    });

    it('should return undefined for non-cosmos chain', async () => {
      const nonCosmosChain = { ...mockChain, chainType: 'eip155' as const };
      chainWalletStore = new ChainWalletStore(
        mockWallet,
        nonCosmosChain,
        mockWalletManager,
        mockStoreManager
      );

      const result = await chainWalletStore.getOfflineSigner();

      expect(result).toBeUndefined();
    });
  });

  describe('addSuggestChain', () => {
    it('should call wallet addSuggestChain', async () => {
      await chainWalletStore.addSuggestChain();

      expect(mockWallet.addSuggestChain).toHaveBeenCalledWith(mockChain.chainId);
    });
  });

  describe('getProvider', () => {
    it('should call wallet getProvider', async () => {
      const mockProvider = { test: 'provider' };
      mockWallet.getProvider = jest.fn().mockResolvedValue(mockProvider);

      const result = await chainWalletStore.getProvider();

      expect(mockWallet.getProvider).toHaveBeenCalledWith(mockChain.chainId);
      expect(result).toEqual(mockProvider);
    });
  });

  describe('getRpcEndpoint', () => {
    it('should return existing rpc endpoint from store', async () => {
      const existingEndpoint = 'https://existing-rpc.com';
      mockStoreManager.getChainWalletState = jest.fn().mockReturnValue({
        rpcEndpoint: existingEndpoint
      });

      const result = await chainWalletStore.getRpcEndpoint();

      expect(result).toEqual(existingEndpoint);
      expect(mockWalletManager.getRpcEndpoint).not.toHaveBeenCalled();
    });

    it('should fetch and store new rpc endpoint', async () => {
      const newEndpoint = 'https://new-rpc.com';
      mockStoreManager.getChainWalletState = jest.fn().mockReturnValue({});
      mockWalletManager.getRpcEndpoint = jest.fn().mockResolvedValue(newEndpoint);

      const result = await chainWalletStore.getRpcEndpoint();

      expect(result).toEqual(newEndpoint);
      expect(mockWalletManager.getRpcEndpoint).toHaveBeenCalledWith(
        mockWallet.info.name,
        mockChain.chainName
      );
      expect(mockStoreManager.updateChainWalletState).toHaveBeenCalledWith(
        mockWallet.info.name,
        mockChain.chainName,
        { rpcEndpoint: newEndpoint }
      );
    });
  });

  describe('offline signer integration', () => {
    it('should create amino signer with correct methods', async () => {
      mockWalletManager.getPreferSignType = jest.fn().mockReturnValue('amino');

      const signer = await chainWalletStore.getOfflineSigner() as AminoGenericOfflineSigner;

      expect(signer).toBeInstanceOf(AminoGenericOfflineSigner);

      // Test getAccounts method
      const accounts = await signer.getAccounts();
      expect(accounts).toEqual([mockWalletAccount]);
    });

    it('should create direct signer with correct methods', async () => {
      mockWalletManager.getPreferSignType = jest.fn().mockReturnValue('direct');

      const signer = await chainWalletStore.getOfflineSigner() as DirectGenericOfflineSigner;

      expect(signer).toBeInstanceOf(DirectGenericOfflineSigner);

      // Test getAccounts method
      const accounts = await signer.getAccounts();
      expect(accounts).toEqual([mockWalletAccount]);
    });
  });
});
