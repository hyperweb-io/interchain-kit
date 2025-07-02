import { UniWallet, CosmosWallet, EthereumWallet } from '../../src/wallets';
import { Wallet } from '../../src/types';
import { Chain } from '@chain-registry/types';

describe('UniWallet (Aggregate Wallet)', () => {
    let aggregateWallet: UniWallet;
    let cosmosWallet: CosmosWallet;
    let ethereumWallet: EthereumWallet;

    const mockWalletInfo: Wallet = {
        name: 'test-aggregate-wallet',
        prettyName: 'Test Aggregate Wallet',
        mode: 'extension',
        cosmosKey: 'test-cosmos-key',
        ethereumKey: 'test-ethereum-key'
    };

    beforeEach(() => {
        aggregateWallet = new UniWallet(mockWalletInfo);
        cosmosWallet = new CosmosWallet({
            ...mockWalletInfo,
            cosmosKey: 'keplr-extension'
        });
        ethereumWallet = new EthereumWallet({
            ...mockWalletInfo,
            ethereumKey: 'metamask-extension'
        });
    });

    describe('Wallet Registration', () => {
        it('should register cosmos wallet', () => {
            aggregateWallet.registerWallet('cosmos', cosmosWallet);
            expect(aggregateWallet.getWalletByChainType('cosmos')).toBe(cosmosWallet);
        });

        it('should register ethereum wallet', () => {
            aggregateWallet.registerWallet('eip155', ethereumWallet);
            expect(aggregateWallet.getWalletByChainType('eip155')).toBe(ethereumWallet);
        });

        it('should support multiple wallet types', () => {
            aggregateWallet.registerWallet('cosmos', cosmosWallet);
            aggregateWallet.registerWallet('eip155', ethereumWallet);

            expect(aggregateWallet.supportsChainType('cosmos')).toBe(true);
            expect(aggregateWallet.supportsChainType('eip155')).toBe(true);
        });
    });

    describe('Wallet Selection', () => {
        beforeEach(() => {
            aggregateWallet.registerWallet('cosmos', cosmosWallet);
            aggregateWallet.registerWallet('eip155', ethereumWallet);
        });

        it('should get wallet by chain type', () => {
            expect(aggregateWallet.getWalletByChainType('cosmos')).toBe(cosmosWallet);
            expect(aggregateWallet.getWalletByChainType('eip155')).toBe(ethereumWallet);
        });

        it('should get wallet by method', () => {
            expect(aggregateWallet.getWalletByMethod('cosmos_amino')).toBe(cosmosWallet);
            expect(aggregateWallet.getWalletByMethod('ethereum_message')).toBe(ethereumWallet);
        });
    });

    describe('Utility Methods', () => {
        beforeEach(() => {
            aggregateWallet.registerWallet('cosmos', cosmosWallet);
            aggregateWallet.registerWallet('eip155', ethereumWallet);
        });

        it('should get supported chain types', () => {
            const supportedTypes = aggregateWallet.getSupportedChainTypes();
            expect(supportedTypes).toContain('cosmos');
            expect(supportedTypes).toContain('eip155');
        });

        it('should check chain type support', () => {
            expect(aggregateWallet.supportsChainType('cosmos')).toBe(true);
            expect(aggregateWallet.supportsChainType('eip155')).toBe(true);
        });
    });
}); 