import { AssetList, Chain } from '@chain-registry/types';
import { Algo, BaseWallet, WalletManager, WalletState } from '@interchain-kit/core';

import { InterchainStore } from '../src/store';
import { ChainWalletState } from '../src/types';
import { LocalStorage } from '../src/utils/local-storage';
import { WalletManagerStore } from '../src/wallet-manager/wallet-manager-store';

// Mock dependencies
jest.mock('../src/store');
jest.mock('../src/utils/local-storage');
jest.mock('../src/proxied-wallets', () => ({
  createProxiedWallet: jest.fn((wallet) => wallet), // Return the wallet as-is for testing
}));

// Mock the core WalletManager
jest.mock('@interchain-kit/core', () => ({
  ...jest.requireActual('@interchain-kit/core'),
  WalletManager: jest.fn().mockImplementation(() => ({
    init: jest.fn().mockResolvedValue(undefined),
    addChains: jest.fn().mockResolvedValue(undefined),
    getChainByName: jest.fn(),
    getChainById: jest.fn(),
    getAssetListByName: jest.fn(),
    getRpcEndpoint: jest.fn().mockResolvedValue('https://rpc.cosmos.network'),
    getPreferSignType: jest.fn().mockReturnValue('direct'),
    getSignerOptions: jest.fn().mockReturnValue({}),
    getEnv: jest.fn().mockReturnValue({ browser: 'chrome', device: 'desktop', os: 'macos' }),
    getDownloadLink: jest.fn().mockReturnValue({ browser: 'chrome', device: 'desktop', os: 'macos' }),
    signerOptions: {},
    endpointOptions: {},
    preferredSignTypeMap: {},
    signerOptionMap: {},
    endpointOptionsMap: {},
  })),
}));

describe('WalletManagerStore', () => {
  let walletManagerStore: WalletManagerStore;
  let mockChains: Chain[];
  let mockAssetLists: AssetList[];
  let mockWallets: BaseWallet[];
  let mockInterchainStore: jest.Mocked<InterchainStore>;
  let mockLocalStorage: jest.Mocked<LocalStorage>;
  let mockWalletManager: jest.Mocked<WalletManager>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock data
    mockChains = [
      {
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
      },
    ];

    mockAssetLists = [
      {
        chainName: 'cosmoshub',
        assets: [
          {
            name: 'Cosmos',
            base: 'uatom',
            display: 'atom',
            symbol: 'ATOM',
            typeAsset: 'sdk.coin',
            denomUnits: [
              { denom: 'uatom', exponent: 0 },
              { denom: 'atom', exponent: 6 },
            ],
          },
        ],
      },
    ];

    mockWallets = [
      {
        info: { name: 'keplr', prettyName: 'Keplr' },
        setChainMap: jest.fn(),
        setAssetLists: jest.fn(),
      } as any,
    ];

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
      isChainWalletStateExisted: jest.fn().mockReturnValue(false),
      updateWalletState: jest.fn(),
    } as any;

    // Mock LocalStorage
    mockLocalStorage = {
      save: jest.fn(),
      load: jest.fn().mockReturnValue({}),
    } as any;

    // Mock WalletManager
    mockWalletManager = {
      init: jest.fn().mockResolvedValue(undefined),
      addChains: jest.fn().mockResolvedValue(undefined),
      getChainByName: jest.fn(),
      getChainById: jest.fn(),
      getAssetListByName: jest.fn(),
      getRpcEndpoint: jest.fn().mockResolvedValue('https://rpc.cosmos.network'),
      getPreferSignType: jest.fn().mockReturnValue('direct'),
      getSignerOptions: jest.fn().mockReturnValue({}),
      getEnv: jest.fn().mockReturnValue({ browser: 'chrome', device: 'desktop', os: 'macos' }),
      getDownloadLink: jest.fn().mockReturnValue({ browser: 'chrome', device: 'desktop', os: 'macos' }),
      signerOptions: {},
      endpointOptions: {},
      preferredSignTypeMap: {},
      signerOptionMap: {},
      endpointOptionsMap: {},
    } as any;

    // Mock the constructors
    (InterchainStore as jest.Mock).mockImplementation(() => mockInterchainStore);
    (LocalStorage as jest.Mock).mockImplementation(() => mockLocalStorage);
    (WalletManager as any).mockImplementation(() => mockWalletManager);

    walletManagerStore = new WalletManagerStore(mockChains, mockAssetLists, mockWallets);
  });

  describe('Constructor', () => {
    it('should initialize with correct parameters', () => {
      expect(InterchainStore).toHaveBeenCalled();
      expect(LocalStorage).toHaveBeenCalled();
      expect(WalletManager).toHaveBeenCalledWith(
        mockChains,
        mockAssetLists,
        expect.any(Array), // proxied wallets
        undefined, // signerOptions
        undefined  // endpointOptions
      );
    });

    it('should set chain map and asset lists on wallets', () => {
      expect(mockWallets[0].setChainMap).toHaveBeenCalledWith(mockChains);
      expect(mockWallets[0].setAssetLists).toHaveBeenCalledWith(mockAssetLists);
    });

    it('should create wallet stores for each proxied wallet', () => {
      expect(walletManagerStore.wallets).toHaveLength(1);
      expect(walletManagerStore.wallets[0]).toBeDefined();
    });
  });

  describe('Initialization', () => {
    it('should initialize correctly', async () => {
      await walletManagerStore.init();

      expect(mockLocalStorage.load).toHaveBeenCalled();
      expect(mockInterchainStore.setState).toHaveBeenCalledWith({
        chainWalletStates: expect.any(Array),
        currentWalletName: '',
        currentChainName: '',
      });
      expect(mockInterchainStore.buildIndexMap).toHaveBeenCalledTimes(2);
      expect(mockInterchainStore.subscribe).toHaveBeenCalled();
      expect(mockInterchainStore.setState).toHaveBeenCalledWith({ isReady: true });
    });

    it('should restore state from localStorage', async () => {
      const savedState = {
        chainWalletStates: [
          {
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
          },
        ],
        currentWalletName: 'keplr',
        currentChainName: 'cosmoshub',
      };

      mockLocalStorage.load.mockReturnValue(savedState);

      await walletManagerStore.init();

      expect(mockInterchainStore.setState).toHaveBeenCalledWith({
        chainWalletStates: savedState.chainWalletStates,
        currentWalletName: savedState.currentWalletName,
        currentChainName: savedState.currentChainName,
      });
    });
    it('should restore a saved NotExist state as Disconnected', async () => {
      const savedState: { chainWalletStates: ChainWalletState[]; currentWalletName: string; currentChainName: string } = {
        chainWalletStates: [
          {
            chainName: 'cosmoshub',
            walletName: 'keplr',
            walletState: WalletState.NotExist,
            rpcEndpoint: '',
            errorMessage: 'Client not exist',
            account: undefined,
          },
        ],
        currentWalletName: '',
        currentChainName: '',
      };

      mockLocalStorage.load.mockReturnValue(savedState);

      await walletManagerStore.init();

      // restore() writes the saved state first; later calls only add or drop entries.
      expect(mockInterchainStore.setState).toHaveBeenNthCalledWith(1, {
        chainWalletStates: [
          {
            ...savedState.chainWalletStates[0],
            walletState: WalletState.Disconnected,
            errorMessage: '',
          },
        ],
        currentWalletName: '',
        currentChainName: '',
      });
    });
  });

  describe('State Management', () => {
    it('should subscribe to state changes', () => {
      const callback = jest.fn();
      walletManagerStore.subscribe(callback);

      expect(mockInterchainStore.subscribe).toHaveBeenCalledWith(callback);
    });

    it('should get current state', () => {
      const state = walletManagerStore.getState();

      expect(mockInterchainStore.getState).toHaveBeenCalled();
      expect(state).toBeDefined();
    });

    it('should get walletConnectQRCodeUri', () => {
      mockInterchainStore.getState.mockReturnValue({
        walletConnectQRCodeUri: 'wc:abc123',
      } as any);

      const uri = walletManagerStore.walletConnectQRCodeUri;

      expect(uri).toBe('wc:abc123');
    });

    it('should get isReady status', () => {
      mockInterchainStore.getState.mockReturnValue({
        isReady: true,
      } as any);

      const isReady = walletManagerStore.isReady;

      expect(isReady).toBe(true);
    });

    it('should get current wallet name', () => {
      mockInterchainStore.getState.mockReturnValue({
        currentWalletName: 'keplr',
      } as any);

      const walletName = walletManagerStore.currentWalletName;

      expect(walletName).toBe('keplr');
    });

    it('should get current chain name', () => {
      mockInterchainStore.getState.mockReturnValue({
        currentChainName: 'cosmoshub',
      } as any);

      const chainName = walletManagerStore.currentChainName;

      expect(chainName).toBe('cosmoshub');
    });

    it('should set current wallet name', () => {
      walletManagerStore.setCurrentWalletName('keplr');

      expect(mockInterchainStore.setCurrentWalletName).toHaveBeenCalledWith('keplr');
    });

    it('should set current chain name', () => {
      walletManagerStore.setCurrentChainName('cosmoshub');

      expect(mockInterchainStore.setCurrentChainName).toHaveBeenCalledWith('cosmoshub');
    });
  });

  describe('Chain Operations', () => {
    it('should get chain by ID', () => {
      mockWalletManager.getChainById.mockReturnValue(mockChains[0]);

      const chain = walletManagerStore.getChainById('cosmoshub-4');

      expect(chain).toBe(mockChains[0]);
      expect(mockWalletManager.getChainById).toHaveBeenCalledWith('cosmoshub-4');
    });

    it('should get chain by name', () => {
      mockWalletManager.getChainByName.mockReturnValue(mockChains[0]);

      const chain = walletManagerStore.getChainByName('cosmoshub');

      expect(chain).toBe(mockChains[0]);
      expect(mockWalletManager.getChainByName).toHaveBeenCalledWith('cosmoshub');
    });

    it('should get asset list by name', () => {
      mockWalletManager.getAssetListByName.mockReturnValue(mockAssetLists[0]);

      const assetList = walletManagerStore.getAssetListByName('cosmoshub');

      expect(assetList).toBe(mockAssetLists[0]);
      expect(mockWalletManager.getAssetListByName).toHaveBeenCalledWith('cosmoshub');
    });

    it('should add chains', async () => {
      const newChains = [mockChains[0]];
      const newAssetLists = [mockAssetLists[0]];

      await walletManagerStore.addChains(newChains, newAssetLists);

      expect(mockWalletManager.addChains).toHaveBeenCalledWith(
        newChains,
        newAssetLists,
        undefined,
        undefined
      );
    });
  });

  describe('Wallet Operations', () => {
    it('should get wallet by name', () => {
      const wallet = walletManagerStore.getWalletByName('keplr');

      expect(wallet).toBeDefined();
      expect(wallet?.info.name).toBe('keplr');
    });

    it('should return undefined for non-existent wallet', () => {
      const wallet = walletManagerStore.getWalletByName('non-existent');

      expect(wallet).toBeUndefined();
    });

    it('should get chain wallet by name', () => {
      const chainWallet = walletManagerStore.getChainWalletByName('keplr', 'cosmoshub');

      expect(chainWallet).toBeDefined();
    });

    it('should return undefined for non-existent chain wallet', () => {
      const chainWallet = walletManagerStore.getChainWalletByName('non-existent', 'cosmoshub');

      expect(chainWallet).toBeUndefined();
    });
  });

  describe('Chain Wallet State Management', () => {
    it('should get chain wallet state', () => {
      const mockState: ChainWalletState = {
        chainName: 'cosmoshub',
        walletName: 'keplr',
        walletState: WalletState.Connected,
        rpcEndpoint: 'https://rpc.cosmos.network',
        errorMessage: '',
        account: undefined,
      };

      mockInterchainStore.getChainWalletState.mockReturnValue(mockState);

      const state = walletManagerStore.getChainWalletState('keplr', 'cosmoshub');

      expect(state).toBe(mockState);
      expect(mockInterchainStore.getChainWalletState).toHaveBeenCalledWith('keplr', 'cosmoshub');
    });

    it('should update chain wallet state', () => {
      const updateData = { walletState: WalletState.Connected };

      walletManagerStore.updateChainWalletState('keplr', 'cosmoshub', updateData);

      expect(mockInterchainStore.updateChainWalletState).toHaveBeenCalledWith(
        'keplr',
        'cosmoshub',
        updateData
      );
    });
  });

  describe('Modal Management', () => {
    it('should get modal is open status', () => {
      mockInterchainStore.getState.mockReturnValue({
        modalIsOpen: true,
      } as any);

      const isOpen = walletManagerStore.modalIsOpen;

      expect(isOpen).toBe(true);
    });

    it('should open modal', () => {
      walletManagerStore.openModal();

      expect(mockInterchainStore.setState).toHaveBeenCalledWith({ modalIsOpen: true });
    });

    it('should close modal', () => {
      walletManagerStore.closeModal();

      expect(mockInterchainStore.setState).toHaveBeenCalledWith({ modalIsOpen: false });
    });
  });

  describe('Signer and Endpoint Operations', () => {
    it('should get signer options', () => {
      const signerOptions = walletManagerStore.signerOptions;

      expect(signerOptions).toBe(mockWalletManager.signerOptions);
    });

    it('should get endpoint options', () => {
      const endpointOptions = walletManagerStore.endpointOptions;

      expect(endpointOptions).toBe(mockWalletManager.endpointOptions);
    });

    it('should get preferred sign type map', () => {
      const preferredSignTypeMap = walletManagerStore.preferredSignTypeMap;

      expect(preferredSignTypeMap).toBe(mockWalletManager.preferredSignTypeMap);
    });

    it('should get signer option map', () => {
      const signerOptionMap = walletManagerStore.signerOptionMap;

      expect(signerOptionMap).toBe(mockWalletManager.signerOptionMap);
    });

    it('should get endpoint options map', () => {
      const endpointOptionsMap = walletManagerStore.endpointOptionsMap;

      expect(endpointOptionsMap).toBe(mockWalletManager.endpointOptionsMap);
    });

    it('should get prefer sign type', () => {
      walletManagerStore.getPreferSignType('cosmoshub');

      expect(mockWalletManager.getPreferSignType).toHaveBeenCalledWith('cosmoshub');
    });

    it('should get signer options for chain', () => {
      walletManagerStore.getSignerOptions('cosmoshub');

      expect(mockWalletManager.getSignerOptions).toHaveBeenCalledWith('cosmoshub');
    });
  });

  describe('RPC Endpoint Management', () => {
    it('should get existing RPC endpoint from state', async () => {
      const existingEndpoint = 'https://existing-rpc.cosmos.network';
      mockInterchainStore.getChainWalletState.mockReturnValue({
        rpcEndpoint: existingEndpoint,
      } as any);

      const endpoint = await walletManagerStore.getRpcEndpoint('keplr', 'cosmoshub');

      expect(endpoint).toBe(existingEndpoint);
      expect(mockWalletManager.getRpcEndpoint).not.toHaveBeenCalled();
    });

    it('should get RPC endpoint from wallet manager when not in state', async () => {
      mockInterchainStore.getChainWalletState.mockReturnValue(undefined);
      mockWalletManager.getRpcEndpoint.mockResolvedValue('https://rpc.cosmos.network');

      const endpoint = await walletManagerStore.getRpcEndpoint('keplr', 'cosmoshub');

      expect(endpoint).toBe('https://rpc.cosmos.network');
      expect(mockWalletManager.getRpcEndpoint).toHaveBeenCalledWith('keplr', 'cosmoshub');
      expect(mockInterchainStore.updateChainWalletState).toHaveBeenCalledWith(
        'keplr',
        'cosmoshub',
        { rpcEndpoint: 'https://rpc.cosmos.network' }
      );
    });
  });

  describe('Environment and Download Info', () => {
    it('should get environment info', () => {
      const env = walletManagerStore.getEnv();

      expect(env).toEqual({ browser: 'chrome', device: 'desktop', os: 'macos' });
      expect(mockWalletManager.getEnv).toHaveBeenCalled();
    });

    it('should get download link', () => {
      const downloadInfo = walletManagerStore.getDownloadLink('keplr');

      expect(downloadInfo).toEqual({ browser: 'chrome', device: 'desktop', os: 'macos' });
      expect(mockWalletManager.getDownloadLink).toHaveBeenCalledWith('keplr');
    });
  });
});
