import { UniWallet, CosmosWallet, EthereumWallet } from '../wallets';
import { Wallet } from '../types';
import { Chain } from '@chain-registry/types';

// 钱包配置
const walletInfo: Wallet = {
    name: 'simple-aggregate-wallet',
    prettyName: 'Simple Aggregate Wallet',
    mode: 'extension',
    cosmosKey: 'keplr-extension',
    ethereumKey: 'metamask-extension'
};

// 创建聚合钱包
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

// 可以注册更多链类型的钱包
// aggregateWallet.registerWallet('bip122', bitcoinWallet); // Bitcoin
// aggregateWallet.registerWallet('polkadot', polkadotWallet); // Polkadot
// aggregateWallet.registerWallet('solana', solanaWallet); // Solana

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

// 使用聚合钱包的示例
export async function useSimpleAggregateWallet() {
    try {
        console.log('初始化聚合钱包...');
        await aggregateWallet.init();

        console.log('添加链信息...');
        aggregateWallet.addChain(cosmosChain);
        aggregateWallet.addChain(ethereumChain);

        console.log('连接到 Cosmos 链...');
        await aggregateWallet.connect('cosmoshub-4');
        const cosmosAccount = await aggregateWallet.getAccount('cosmoshub-4');
        console.log('Cosmos 账户:', cosmosAccount.address);

        console.log('连接到 Ethereum 链...');
        await aggregateWallet.connect('1');
        const ethereumAccount = await aggregateWallet.getAccount('1');
        console.log('Ethereum 账户:', ethereumAccount.address);

        console.log('支持的链类型:', aggregateWallet.getSupportedChainTypes());
        console.log('聚合钱包使用成功!');

    } catch (error) {
        console.error('聚合钱包使用失败:', error);
    }
}

// 根据链类型自动选择钱包
export async function autoSelectWallet(chain: Chain) {
    try {
        console.log(`处理链: ${chain.chainName} (${chain.chainType})`);

        const wallet = aggregateWallet.getWalletByChain(chain);
        if (!wallet) {
            throw new Error(`不支持链类型: ${chain.chainType}`);
        }

        await aggregateWallet.connect(chain.chainId);
        const account = await aggregateWallet.getAccount(chain.chainId);

        console.log(`${chain.chainName} 账户: ${account.address}`);
        return account;
    } catch (error) {
        console.error(`${chain.chainName} 处理失败:`, error);
        throw error;
    }
}

// 导出聚合钱包实例
export { aggregateWallet }; 