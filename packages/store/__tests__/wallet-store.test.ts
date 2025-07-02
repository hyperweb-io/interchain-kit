import { WalletStore } from '../src/wallet-store';
import { WalletState } from '@interchain-kit/core';

// Mock dependencies
const mockWallet = {
    info: { name: 'test-wallet' },
    getChainById: jest.fn(),
    init: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    getAccount: jest.fn(),
};

const mockChains = [
    { chainName: 'test-chain-1', chainId: 'test-chain-1' },
    { chainName: 'test-chain-2', chainId: 'test-chain-2' },
];

const mockWalletManager = {
    getPreferSignType: jest.fn(),
    getRpcEndpoint: jest.fn(),
};

describe('WalletStore State Updates', () => {
    let walletStore: WalletStore;

    beforeEach(() => {
        jest.clearAllMocks();
        walletStore = new WalletStore(mockWallet as any, mockChains as any, mockWalletManager as any);
    });

    test('should update wallet state when chain wallet state changes', async () => {
        await walletStore.init();

        // Mock chain wallet state change
        const chainWallet = walletStore.getChainWalletByChainName('test-chain-1');

        // Simulate state change to Connected
        if (chainWallet) {
            chainWallet.state.proxy.walletState = WalletState.Connected;
        }

        // Check that wallet store state is updated
        expect(walletStore.walletState).toBe(WalletState.Connected);
    });

    test('should notify subscribers when wallet state changes', async () => {
        await walletStore.init();

        const mockListener = jest.fn();
        walletStore.subscribe(mockListener);

        // Simulate chain wallet state change
        const chainWallet = walletStore.getChainWalletByChainName('test-chain-1');
        if (chainWallet) {
            chainWallet.state.proxy.walletState = WalletState.Connected;
        }

        // Access the wallet state to trigger update
        const state = walletStore.walletState;

        // Check that listener was called
        expect(mockListener).toHaveBeenCalled();
    });
}); 