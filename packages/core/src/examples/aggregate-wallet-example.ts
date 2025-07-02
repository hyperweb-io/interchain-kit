import { Chain } from '@chain-registry/types';
import { UniWallet, CosmosWallet, EthereumWallet } from '../wallets';
import { Wallet } from '../types';

/**
 * 聚合钱包使用示例
 * 展示如何创建一个支持 Cosmos 和 Ethereum 的聚合钱包
 */

// 钱包配置信息
const walletInfo: Wallet = {
    name: 'aggregate-wallet',
    prettyName: 'Aggregate Wallet',
    mode: 'extension',
    description: 'A wallet that supports both Cosmos and Ethereum chains',
    cosmosKey: 'cosmos-wallet-key',
    ethereumKey: 'ethereum-wallet-key',
    downloads: [
        {
            browser: 'https://example.com/download',
            os: 'macos',
            link: 'https://example.com/download'
        }
    ]
};

// 创建聚合钱包实例
const aggregateWallet = new UniWallet(walletInfo);

// 注册 Cosmos 钱包
const cosmosWallet = new CosmosWallet({
    ...walletInfo,
    cosmosKey: 'keplr-extension'
});
aggregateWallet.registerWallet('cosmos', cosmosWallet);

// 注册 Ethereum 钱包
const ethereumWallet = new EthereumWallet({
    ...walletInfo,
    ethereumKey: 'metamask-extension'
});
aggregateWallet.registerWallet('eip155', ethereumWallet);

// 示例链配置
const cosmosChain: Chain = {
    chainName: 'cosmoshub',
    chainId: 'cosmoshub-4',
    chainType: 'cosmos',
    bech32Prefix: 'cosmos',
    apis: {
        rpc: [{ address: 'https://rpc.cosmos.network' }],
        rest: [{ address: 'https://api.cosmos.network' }]
    }
};

const ethereumChain: Chain = {
    chainName: 'ethereum',
    chainId: '1',
    chainType: 'eip155',
    apis: {
        rpc: [{ address: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID' }]
    }
};

/**
 * 使用聚合钱包的示例函数
 */
export async function useAggregateWallet() {
    try {
        // 1. 初始化钱包
        await aggregateWallet.init();
        console.log('Aggregate wallet initialized');

        // 2. 设置链信息
        aggregateWallet.addChain(cosmosChain);
        aggregateWallet.addChain(ethereumChain);

        // 3. 连接到 Cosmos 链
        console.log('Connecting to Cosmos chain...');
        await aggregateWallet.connect('cosmoshub-4');

        // 4. 获取 Cosmos 账户
        const cosmosAccount = await aggregateWallet.getAccount('cosmoshub-4');
        console.log('Cosmos account:', cosmosAccount);

        // 5. 连接到 Ethereum 链
        console.log('Connecting to Ethereum chain...');
        await aggregateWallet.connect('1');

        // 6. 获取 Ethereum 账户
        const ethereumAccount = await aggregateWallet.getAccount('1');
        console.log('Ethereum account:', ethereumAccount);

        // 7. 签名示例 - Cosmos
        const cosmosSignRequest = {
            chainId: 'cosmoshub-4',
            method: 'cosmos_amino' as const,
            signerAddress: cosmosAccount.address,
            data: {
                // Cosmos 签名数据
                chain_id: 'cosmoshub-4',
                account_number: '0',
                sequence: '0',
                fee: { gas: '200000', amount: [{ denom: 'uatom', amount: '5000' }] },
                msgs: [] as any[],
                memo: ''
            }
        };

        const cosmosSignResult = await aggregateWallet.sign('cosmoshub-4', cosmosSignRequest);
        console.log('Cosmos sign result:', cosmosSignResult);

        // 8. 签名示例 - Ethereum
        const ethereumSignRequest = {
            chainId: '1',
            method: 'ethereum_message' as const,
            data: 'Hello, Ethereum!'
        };

        const ethereumSignResult = await aggregateWallet.sign('1', ethereumSignRequest);
        console.log('Ethereum sign result:', ethereumSignResult);

        // 9. 获取支持的链类型
        const supportedTypes = aggregateWallet.getSupportedChainTypes();
        console.log('Supported chain types:', supportedTypes);

        // 10. 检查是否支持特定链类型
        const supportsCosmos = aggregateWallet.supportsChainType('cosmos');
        const supportsEthereum = aggregateWallet.supportsChainType('eip155');
        console.log('Supports Cosmos:', supportsCosmos);
        console.log('Supports Ethereum:', supportsEthereum);

    } catch (error) {
        console.error('Error using aggregate wallet:', error);
    }
}

/**
 * 根据链类型自动选择钱包的示例
 */
export async function autoSelectWalletByChainType(chain: Chain) {
    try {
        // 根据链类型自动选择对应的钱包
        const wallet = aggregateWallet.getWalletByChain(chain);

        if (!wallet) {
            throw new Error(`No wallet found for chain type: ${chain.chainType}`);
        }

        console.log(`Using wallet for chain type: ${chain.chainType}`);

        // 连接到链
        await aggregateWallet.connect(chain.chainId);

        // 获取账户
        const account = await aggregateWallet.getAccount(chain.chainId);
        console.log(`Account for ${chain.chainName}:`, account);

        return account;
    } catch (error) {
        console.error(`Error with chain ${chain.chainName}:`, error);
        throw error;
    }
}

/**
 * 批量处理多个链的示例
 */
export async function handleMultipleChains(chains: Chain[]) {
    const results = [];

    for (const chain of chains) {
        try {
            console.log(`Processing chain: ${chain.chainName} (${chain.chainType})`);

            const account = await autoSelectWalletByChainType(chain);
            results.push({
                chain: chain.chainName,
                chainType: chain.chainType,
                account,
                success: true
            });
        } catch (error) {
            results.push({
                chain: chain.chainName,
                chainType: chain.chainType,
                error: error instanceof Error ? error.message : String(error),
                success: false
            });
        }
    }

    return results;
}

// 导出聚合钱包实例供外部使用
export { aggregateWallet }; 