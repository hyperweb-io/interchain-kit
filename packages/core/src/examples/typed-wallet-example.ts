import { UniWallet, CosmosWallet, EthereumWallet } from '../wallets';
import { Wallet } from '../types';
import { Chain } from '@chain-registry/types';
import { WalletForChainType, SignRequestForChainType, SignResponseForChainType } from '../types/wallet-map';

// 钱包配置
const walletInfo: Wallet = {
    name: 'typed-aggregate-wallet',
    prettyName: 'Typed Aggregate Wallet',
    mode: 'extension',
    cosmosKey: 'keplr-extension',
    ethereumKey: 'metamask-extension'
};

// 创建聚合钱包
const aggregateWallet = new UniWallet(walletInfo);

// 创建特定类型的钱包
const cosmosWallet = new CosmosWallet({
    ...walletInfo,
    cosmosKey: 'keplr-extension'
});

const ethereumWallet = new EthereumWallet({
    ...walletInfo,
    ethereumKey: 'metamask-extension'
});

// 类型安全的钱包注册
aggregateWallet.registerWallet('cosmos', cosmosWallet);
aggregateWallet.registerWallet('eip155', ethereumWallet);

/**
 * 演示类型安全的钱包使用
 */
export function demonstrateTypedWalletUsage() {
    console.log('=== 类型安全的钱包使用演示 ===');

    // 1. 类型安全的钱包获取
    const cosmosWalletInstance = aggregateWallet.getWalletByChainType('cosmos');
    const ethereumWalletInstance = aggregateWallet.getWalletByChainType('eip155');

    console.log('Cosmos 钱包类型:', cosmosWalletInstance?.constructor.name);
    console.log('Ethereum 钱包类型:', ethereumWalletInstance?.constructor.name);

    // 2. 类型安全的签名请求示例
    const cosmosSignRequest: SignRequestForChainType<'cosmos'> = {
        chainId: 'cosmoshub-4',
        method: 'cosmos_amino',
        data: {
            chain_id: 'cosmoshub-4',
            account_number: '0',
            sequence: '0',
            fee: { gas: '200000', amount: [{ denom: 'uatom', amount: '5000' }] },
            msgs: [],
            memo: ''
        }
    };

    const ethereumSignRequest: SignRequestForChainType<'eip155'> = {
        chainId: '1',
        method: 'ethereum_message',
        data: 'Hello, Ethereum!'
    };

    console.log('Cosmos 签名请求类型:', typeof cosmosSignRequest);
    console.log('Ethereum 签名请求类型:', typeof ethereumSignRequest);

    // 3. 类型安全的签名响应示例
    const cosmosSignResponse: SignResponseForChainType<'cosmos'> = {
        success: true,
        method: 'cosmos_amino',
        result: {
            signed: {
                signature: 'test-signature'
            }
        }
    };

    const ethereumSignResponse: SignResponseForChainType<'eip155'> = {
        success: true,
        method: 'ethereum_message',
        result: {
            signature: 'test-signature'
        }
    };

    console.log('Cosmos 签名响应类型:', typeof cosmosSignResponse);
    console.log('Ethereum 签名响应类型:', typeof ethereumSignResponse);
}

/**
 * 演示类型安全的钱包注册
 */
export function demonstrateTypedRegistration() {
    console.log('\n=== 类型安全的钱包注册演示 ===');

    // 这些注册是类型安全的，TypeScript 会检查类型匹配
    try {
        // ✅ 正确的类型匹配
        aggregateWallet.registerWallet('cosmos', cosmosWallet);
        console.log('✅ Cosmos 钱包注册成功');

        aggregateWallet.registerWallet('eip155', ethereumWallet);
        console.log('✅ Ethereum 钱包注册成功');

        // ❌ 如果尝试错误的类型匹配，TypeScript 会报错
        // aggregateWallet.registerWallet('cosmos', ethereumWallet); // 类型错误
        // aggregateWallet.registerWallet('eip155', cosmosWallet); // 类型错误

    } catch (error) {
        console.error('❌ 钱包注册失败:', error);
    }
}

/**
 * 演示类型安全的钱包获取
 */
export function demonstrateTypedRetrieval() {
    console.log('\n=== 类型安全的钱包获取演示 ===');

    // 类型安全的钱包获取
    const cosmosWallet = aggregateWallet.getWalletByChainType('cosmos');
    const ethereumWallet = aggregateWallet.getWalletByChainType('eip155');

    if (cosmosWallet) {
        console.log('✅ 获取到 Cosmos 钱包:', cosmosWallet.info.name);
        // TypeScript 知道这是 CosmosWallet 类型
        console.log('   钱包模式:', cosmosWallet.info.mode);
    }

    if (ethereumWallet) {
        console.log('✅ 获取到 Ethereum 钱包:', ethereumWallet.info.name);
        // TypeScript 知道这是 EthereumWallet 类型
        console.log('   钱包模式:', ethereumWallet.info.mode);
    }
}

/**
 * 演示类型安全的签名操作
 */
export async function demonstrateTypedSigning() {
    console.log('\n=== 类型安全的签名操作演示 ===');

    try {
        // 创建类型安全的签名请求
        const cosmosRequest: SignRequestForChainType<'cosmos'> = {
            chainId: 'cosmoshub-4',
            method: 'cosmos_amino',
            data: {
                chain_id: 'cosmoshub-4',
                account_number: '0',
                sequence: '0',
                fee: { gas: '200000', amount: [{ denom: 'uatom', amount: '5000' }] },
                msgs: [],
                memo: ''
            }
        };

        const ethereumRequest: SignRequestForChainType<'eip155'> = {
            chainId: '1',
            method: 'ethereum_message',
            data: 'Hello, Ethereum!'
        };

        // 类型安全的签名操作
        console.log('🔄 执行 Cosmos 签名...');
        const cosmosResult = await aggregateWallet.sign('cosmoshub-4', cosmosRequest);
        console.log('✅ Cosmos 签名结果:', cosmosResult.success);

        console.log('🔄 执行 Ethereum 签名...');
        const ethereumResult = await aggregateWallet.sign('1', ethereumRequest);
        console.log('✅ Ethereum 签名结果:', ethereumResult.success);

    } catch (error) {
        console.error('❌ 签名操作失败:', error);
    }
}

// 导出聚合钱包实例
export { aggregateWallet }; 