import { UniWallet, CosmosWallet, EthereumWallet } from '../wallets';
import { Wallet } from '../types';
import { Chain } from '@chain-registry/types';

// 钱包配置
const walletInfo: Wallet = {
    name: 'chain-type-wallet',
    prettyName: 'Chain Type Wallet',
    mode: 'extension',
    cosmosKey: 'keplr-extension',
    ethereumKey: 'metamask-extension'
};

// 创建聚合钱包
const aggregateWallet = new UniWallet(walletInfo);

// 注册不同链类型的钱包
const cosmosWallet = new CosmosWallet({
    ...walletInfo,
    cosmosKey: 'keplr-extension'
});

const ethereumWallet = new EthereumWallet({
    ...walletInfo,
    ethereumKey: 'metamask-extension'
});

// 使用 Chain['chainType'] 作为 key
aggregateWallet.registerWallet('cosmos', cosmosWallet);
aggregateWallet.registerWallet('eip155', ethereumWallet);

// 演示如何使用 Chain['chainType'] 自动选择钱包
export function demonstrateChainTypeUsage() {
    console.log('=== Chain Type 使用演示 ===');

    // 1. 获取支持的链类型
    const supportedTypes = aggregateWallet.getSupportedChainTypes();
    console.log('支持的链类型:', supportedTypes);

    // 2. 检查特定链类型是否支持
    const supportsCosmos = aggregateWallet.supportsChainType('cosmos');
    const supportsEthereum = aggregateWallet.supportsChainType('eip155');

    console.log('支持 Cosmos:', supportsCosmos);
    console.log('支持 Ethereum:', supportsEthereum);

    // 3. 根据链类型获取钱包
    const cosmosWalletInstance = aggregateWallet.getWalletByChainType('cosmos');
    const ethereumWalletInstance = aggregateWallet.getWalletByChainType('eip155');

    console.log('Cosmos 钱包实例:', cosmosWalletInstance ? '已注册' : '未注册');
    console.log('Ethereum 钱包实例:', ethereumWalletInstance ? '已注册' : '未注册');
}

// 导出聚合钱包实例
export { aggregateWallet };
