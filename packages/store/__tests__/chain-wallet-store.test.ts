import { Chain } from '@chain-registry/types';
import { Algo, BaseWallet, CosmosWallet, WalletAccount, WalletManager, WalletState } from '@interchain-kit/core';

import { InterchainStore } from '../src/store';
import { ChainWalletStore } from '../src/wallet-manager/chain-wallet-store';

// Mock dependencies
jest.mock('@interchain-kit/core', () => ({
  ...jest.requireActual('@interchain-kit/core'),
  isInstanceOf: jest.fn(),
  getWalletByType: jest.fn(),
}));

describe('ChainWalletStore', () => {
  let chainWalletStore: ChainWalletStore;
  let mockWallet: BaseWallet;
  let mockChain: Chain;
  let mockInterchainStore: jest.Mocked<InterchainStore>;
  let mockWalletManager: jest.Mocked<WalletManager>;
  let mockCosmosWallet: jest.Mocked<CosmosWallet>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock chain
    mockChain = {
      chainName: 'cosmoshub',
      chainId: 'cosmoshub-4',
      bech32Prefix: 'cosmos',
      chainType: 'cosmos',
      prettyName: 'Cosmos Hub',
      status: 'live',
      networkType: 'mainnet',
      slip44: 118,
      apis: {
        rpc: [{ address: 'https://rpc.cosmos.network' }],
        rest: [{ address: 'https://lcd.cosmos.network' }],
      },
    };

    // Mock wallet
    mockWallet = {
      info: { name: 'keplr', prettyName: 'Keplr' },
      connect: jest.fn(),
      disconnect: jest.fn(),
      getAccount: jest.fn(),
      addSuggestChain: jest.fn(),
      getProvider: jest.fn(),
      events: {
        on: jest.fn(),
      },
    } as any;

    // Mock CosmosWallet
    mockCosmosWallet = {
      signAmino: jest.fn(),
      signDirect: jest.fn(),
    } as any;

    // Mock InterchainStore
    mockInterchainStore = {
      getState: jest.fn().mockReturnValue({
        currentWalletName: '',
        currentChainName: '',
        chainWalletStates: [],
        isReady: false,
        modalIsOpen: false,
        walletConnectQRCodeUri: '',
      }),
      setState: jest.fn(),
      subscribe: jest.fn().mockReturnValue(() => { }),
      setCurrentWalletName: jest.fn(),
      setCurrentChainName: jest.fn(),
      getChainWalletState: jest.fn(),
      updateChainWalletState: jest.fn(),
      buildIndexMap: jest.fn(),
    } as any;

    // Mock WalletManager
    mockWalletManager = {
      getChainById: jest.fn(),
      getChainByName: jest.fn(),
      getAssetListByName: jest.fn(),
      getRpcEndpoint: jest.fn(),
      getPreferSignType: jest.fn().mockReturnValue('direct'),
      getSignerOptions: jest.fn(),
      getEnv: jest.fn(),
      getDownloadLink: jest.fn(),
      signerOptions: {},
      endpointOptions: {},
      preferredSignTypeMap: {},
      signerOptionMap: {},
      endpointOptionsMap: {},
    } as any;

    chainWalletStore = new ChainWalletStore(mockWallet, mockChain, mockInterchainStore, mockWalletManager);
  });

  describe('Constructor', () => {
    it('should initialize with correct parameters', () => {
      expect(chainWalletStore.info).toEqual(mockWallet.info);
      expect(chainWalletStore.wallet).toBe(mockWallet);
      expect(chainWalletStore.chain).toBe(mockChain);
      expect(chainWalletStore.store).toBe(mockInterchainStore);
      expect(chainWalletStore.walletManager).toBe(mockWalletManager);
    });
  });

  describe('Wallet State', () => {
    it('should return wallet state from store', () => {
      const mockChainWalletState = {
        chainName: 'cosmoshub',
        walletName: 'keplr',
        walletState: WalletState.Connected,
        rpcEndpoint: 'https://rpc.cosmos.network',
        errorMessage: '',
        account: {
          address: 'cosmos1abc123',
          pubkey: new Uint8Array([1, 2, 3]),
          isNanoLedger: false,
          algo: 'secp256k1' as Algo,
        },
      };

      mockInterchainStore.getChainWalletState.mockReturnValue(mockChainWalletState);

      const walletState = chainWalletStore.walletState;

      expect(walletState).toBe(WalletState.Connected);
      expect(mockInterchainStore.getChainWalletState).toHaveBeenCalledWith('cosmoshub', 'keplr');
    });

    it('should return NotExist when no state exists', () => {
      mockInterchainStore.getChainWalletState.mockReturnValue(undefined);

      const walletState = chainWalletStore.walletState;

      expect(walletState).toBe(WalletState.NotExist);
    });
  });

  describe('Error Message', () => {
    it('should return error message from store', () => {
      const mockChainWalletState = {
        chainName: 'cosmoshub',
        walletName: 'keplr',
        walletState: WalletState.Disconnected,
        rpcEndpoint: '',
        errorMessage: 'Connection failed',
        account: {
          address: 'cosmos1abc123',
          pubkey: new Uint8Array([1, 2, 3]),
          isNanoLedger: false,
          algo: 'secp256k1' as Algo,
        },
      };

      mockInterchainStore.getChainWalletState.mockReturnValue(mockChainWalletState);

      const errorMessage = chainWalletStore.errorMessage;

      expect(errorMessage).toBe('Connection failed');
    });

    it('should return empty string when no state exists', () => {
      mockInterchainStore.getChainWalletState.mockReturnValue(undefined);

      const errorMessage = chainWalletStore.errorMessage;

      expect(errorMessage).toBe('');
    });
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      await chainWalletStore.init();

      expect(mockWallet.events.on).toHaveBeenCalledWith('accountChanged', expect.any(Function));
    });
  });

  describe('Connection', () => {
    it('should connect successfully', async () => {
      const mockAccount: WalletAccount = {
        address: 'cosmos1abc123',
        pubkey: new Uint8Array([1, 2, 3]),
        isNanoLedger: false,
        algo: 'secp256k1' as Algo,
      };

      (mockWallet.connect as jest.Mock).mockResolvedValue(undefined);
      (mockWallet.getAccount as jest.Mock).mockResolvedValue(mockAccount);

      await chainWalletStore.connect();

      expect(mockInterchainStore.updateChainWalletState).toHaveBeenCalledWith(
        'keplr',
        'cosmoshub',
        { walletState: WalletState.Connecting, errorMessage: '' }
      );
      expect(mockWallet.connect).toHaveBeenCalledWith('cosmoshub-4');
      expect(mockWallet.getAccount).toHaveBeenCalledWith('cosmoshub-4');
      expect(mockInterchainStore.updateChainWalletState).toHaveBeenCalledWith(
        'keplr',
        'cosmoshub',
        { walletState: WalletState.Connected, account: mockAccount }
      );
    });

    it('should handle connection errors', async () => {
      const error = new Error('Connection failed');
      (mockWallet.connect as jest.Mock).mockRejectedValue(error);

      await chainWalletStore.connect();

      expect(mockInterchainStore.updateChainWalletState).toHaveBeenCalledWith(
        'keplr',
        'cosmoshub',
        { walletState: WalletState.Connecting, errorMessage: '' }
      );
      expect(mockInterchainStore.updateChainWalletState).toHaveBeenCalledWith(
        'keplr',
        'cosmoshub',
        { walletState: WalletState.Disconnected, errorMessage: 'Connection failed' }
      );
    });

    it('should handle WalletConnect wallets', async () => {
      const mockWCWallet = {
        info: { name: 'walletconnect', prettyName: 'WalletConnect' },
        setOnPairingUriCreatedCallback: jest.fn(),
        connect: jest.fn().mockResolvedValue(undefined),
        getAccount: jest.fn().mockResolvedValue({
          address: 'cosmos1abc123',
          pubkey: new Uint8Array([1, 2, 3]),
          isNanoLedger: false,
          algo: 'secp256k1' as Algo,
        }),
      } as any;

      const { isInstanceOf } = require('@interchain-kit/core');
      isInstanceOf.mockReturnValue(true);

      chainWalletStore = new ChainWalletStore(mockWCWallet, mockChain, mockInterchainStore, mockWalletManager);

      await chainWalletStore.connect();

      expect(mockWCWallet.setOnPairingUriCreatedCallback).toHaveBeenCalled();
    });
  });

  describe('Disconnection', () => {
    it('should disconnect successfully', async () => {
      (mockWallet.disconnect as jest.Mock).mockResolvedValue(undefined);

      await chainWalletStore.disconnect();

      expect(mockWallet.disconnect).toHaveBeenCalledWith('cosmoshub-4');
      expect(mockInterchainStore.updateChainWalletState).toHaveBeenCalledWith(
        'keplr',
        'cosmoshub',
        { walletState: WalletState.Disconnected, account: undefined, errorMessage: '' }
      );
    });

    it('should handle disconnection errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Disconnection failed');
      (mockWallet.disconnect as jest.Mock).mockRejectedValue(error);

      await chainWalletStore.disconnect();

      expect(consoleSpy).toHaveBeenCalledWith(error);
      consoleSpy.mockRestore();
    });

    it('should handle WalletConnect wallet disconnection events', async () => {
      const mockWCWallet = {
        info: { name: 'walletconnect', prettyName: 'WalletConnect' },
        events: {
          on: jest.fn(),
        },
        disconnect: jest.fn().mockResolvedValue(undefined),
      } as any;

      const { isInstanceOf } = require('@interchain-kit/core');
      isInstanceOf.mockReturnValue(true);

      chainWalletStore = new ChainWalletStore(mockWCWallet, mockChain, mockInterchainStore, mockWalletManager);

      await chainWalletStore.disconnect();

      expect(mockWCWallet.events.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    });
  });

  describe('Account Management', () => {
    it('should get existing account from store', async () => {
      const mockAccount: WalletAccount = {
        address: 'cosmos1abc123',
        pubkey: new Uint8Array([1, 2, 3]),
        isNanoLedger: false,
        algo: 'secp256k1' as Algo,
      };

      const mockChainWalletState = {
        chainName: 'cosmoshub',
        walletName: 'keplr',
        walletState: WalletState.Connected,
        rpcEndpoint: '',
        errorMessage: '',
        account: mockAccount,
      };

      mockInterchainStore.getChainWalletState.mockReturnValue(mockChainWalletState);

      const account = await chainWalletStore.getAccount();

      expect(account).toBe(mockAccount);
      expect(mockWallet.getAccount).not.toHaveBeenCalled();
    });

    it('should fetch account from wallet when not in store', async () => {
      const mockAccount: WalletAccount = {
        address: 'cosmos1abc123',
        pubkey: new Uint8Array([1, 2, 3]),
        isNanoLedger: false,
        algo: 'secp256k1' as Algo,
      };

      mockInterchainStore.getChainWalletState.mockReturnValue(undefined);
      (mockWallet.getAccount as jest.Mock).mockResolvedValue(mockAccount);

      const account = await chainWalletStore.getAccount();

      expect(account).toBe(mockAccount);
      expect(mockWallet.getAccount).toHaveBeenCalledWith('cosmoshub-4');
      expect(mockInterchainStore.updateChainWalletState).toHaveBeenCalledWith(
        'keplr',
        'cosmoshub',
        { account: mockAccount }
      );
    });

    it('should refresh account', async () => {
      const mockAccount: WalletAccount = {
        address: 'cosmos1abc123',
        pubkey: new Uint8Array([1, 2, 3]),
        isNanoLedger: false,
        algo: 'secp256k1' as Algo,
      };

      (mockWallet.getAccount as jest.Mock).mockResolvedValue(mockAccount);

      await chainWalletStore.refreshAccount();

      expect(mockWallet.getAccount).toHaveBeenCalledWith('cosmoshub-4');
      expect(mockInterchainStore.updateChainWalletState).toHaveBeenCalledWith(
        'keplr',
        'cosmoshub',
        { account: mockAccount }
      );
    });
  });

  describe('Chain Operations', () => {
    it('should add suggest chain', async () => {
      await chainWalletStore.addSuggestChain();

      expect(mockWallet.addSuggestChain).toHaveBeenCalledWith('cosmoshub-4');
    });

    it('should get provider', async () => {
      const mockProvider = { provider: 'test' };
      (mockWallet.getProvider as jest.Mock).mockResolvedValue(mockProvider);

      const provider = await chainWalletStore.getProvider();

      expect(provider).toBe(mockProvider);
      expect(mockWallet.getProvider).toHaveBeenCalledWith('cosmoshub-4');
    });
  });

  describe('Offline Signer', () => {
    beforeEach(() => {
      const { getWalletByType } = require('@interchain-kit/core');
      getWalletByType.mockReturnValue(mockCosmosWallet);
    });

    it('should create amino offline signer', async () => {
      const mockAccount: WalletAccount = {
        address: 'cosmos1abc123',
        pubkey: new Uint8Array([1, 2, 3]),
        isNanoLedger: false,
        algo: 'secp256k1' as Algo,
      };

      mockInterchainStore.getChainWalletState.mockReturnValue({
        account: mockAccount,
      } as any);

      mockWalletManager.getPreferSignType.mockReturnValue('amino');

      const signer = await chainWalletStore.getOfflineSigner();

      expect(signer.getAccounts).toBeDefined();
      expect((signer as any).signAmino).toBeDefined();
      expect((signer as any).signDirect).toBeUndefined();
    });

    it('should create direct offline signer', async () => {
      const mockAccount: WalletAccount = {
        address: 'cosmos1abc123',
        pubkey: new Uint8Array([1, 2, 3]),
        isNanoLedger: false,
        algo: 'secp256k1' as Algo,
      };

      mockInterchainStore.getChainWalletState.mockReturnValue({
        account: mockAccount,
      } as any);

      mockWalletManager.getPreferSignType.mockReturnValue('direct');

      const signer = await chainWalletStore.getOfflineSigner();

      expect(signer.getAccounts).toBeDefined();
      expect((signer as any).signDirect).toBeDefined();
      expect((signer as any).signAmino).toBeUndefined();
    });

    it('should use amino signer for NanoLedger accounts', async () => {
      const mockAccount: WalletAccount = {
        address: 'cosmos1abc123',
        pubkey: new Uint8Array([1, 2, 3]),
        isNanoLedger: true,
        algo: 'secp256k1' as Algo,
      };

      mockInterchainStore.getChainWalletState.mockReturnValue({
        account: mockAccount,
      } as any);

      mockWalletManager.getPreferSignType.mockReturnValue('direct');

      const signer = await chainWalletStore.getOfflineSigner();

      expect(signer.getAccounts).toBeDefined();
      expect((signer as any).signAmino).toBeDefined();
      expect((signer as any).signDirect).toBeUndefined();
    });

    it('should use provided sign type preference', async () => {
      const mockAccount: WalletAccount = {
        address: 'cosmos1abc123',
        pubkey: new Uint8Array([1, 2, 3]),
        isNanoLedger: false,
        algo: 'secp256k1' as Algo,
      };

      mockInterchainStore.getChainWalletState.mockReturnValue({
        account: mockAccount,
      } as any);

      const signer = await chainWalletStore.getOfflineSigner('amino');

      expect(signer.getAccounts).toBeDefined();
      expect((signer as any).signAmino).toBeDefined();
      expect((signer as any).signDirect).toBeUndefined();
    });

    it('should handle signAmino calls', async () => {
      const mockAccount: WalletAccount = {
        address: 'cosmos1abc123',
        pubkey: new Uint8Array([1, 2, 3]),
        isNanoLedger: false,
        algo: 'secp256k1' as Algo,
      };

      mockInterchainStore.getChainWalletState.mockReturnValue({
        account: mockAccount,
      } as any);

      const mockSignDoc = {
        chain_id: 'cosmoshub-4',
        account_number: '1',
        sequence: '0',
        fee: { amount: [] as any[], gas: '200000' },
        msgs: [] as any[],
        memo: ''
      };
      const mockSignResponse = {
        signature: 'test',
        signed: mockSignDoc
      };

      (mockCosmosWallet.signAmino as jest.Mock).mockResolvedValue(mockSignResponse);

      const signer = await chainWalletStore.getOfflineSigner('amino');
      const accounts = await signer.getAccounts();
      const result = await (signer as any).signAmino('cosmos1abc123', mockSignDoc);

      expect(accounts).toEqual([mockAccount]);
      expect(result).toBe(mockSignResponse);
      expect(mockCosmosWallet.signAmino).toHaveBeenCalledWith(
        'cosmoshub-4',
        'cosmos1abc123',
        mockSignDoc,
        {}
      );
    });

    it('should handle signDirect calls', async () => {
      const mockAccount: WalletAccount = {
        address: 'cosmos1abc123',
        pubkey: new Uint8Array([1, 2, 3]),
        isNanoLedger: false,
        algo: 'secp256k1' as Algo,
      };

      mockInterchainStore.getChainWalletState.mockReturnValue({
        account: mockAccount,
      } as any);

      const mockSignDoc = {
        chainId: 'cosmoshub-4',
        bodyBytes: new Uint8Array([1, 2, 3]),
        authInfoBytes: new Uint8Array([4, 5, 6]),
        accountNumber: BigInt(1)
      };
      const mockSignResponse = {
        signature: 'test',
        signed: mockSignDoc
      };

      (mockCosmosWallet.signDirect as jest.Mock).mockResolvedValue(mockSignResponse);

      const signer = await chainWalletStore.getOfflineSigner('direct');
      const accounts = await signer.getAccounts();
      const result = await (signer as any).signDirect('cosmos1abc123', mockSignDoc);

      expect(accounts).toEqual([mockAccount]);
      expect(result).toBe(mockSignResponse);
      expect(mockCosmosWallet.signDirect).toHaveBeenCalledWith(
        'cosmoshub-4',
        'cosmos1abc123',
        mockSignDoc,
        {}
      );
    });
  });

  describe('Wallet Type Utilities', () => {
    it('should get wallet of specific type', () => {
      const { getWalletByType } = require('@interchain-kit/core');
      getWalletByType.mockReturnValue(mockCosmosWallet);

      const result = chainWalletStore.getWalletOfType(CosmosWallet);

      expect(result).toBe(mockCosmosWallet);
      expect(getWalletByType).toHaveBeenCalledWith(mockWallet, CosmosWallet);
    });
  });
});
