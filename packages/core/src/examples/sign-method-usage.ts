import { CosmosWallet } from '../wallets/cosmos-wallet';
import { CosmosSignRequest, CosmosSignResponse } from '../types/sign-request';
import { Chain } from '@chain-registry/types';

// 示例：如何使用新的签名方法设计

export class SignMethodExample {

    // 示例 1: Cosmos Amino 签名
    async signAminoExample(wallet: CosmosWallet, chainId: string) {
        const signRequest: CosmosSignRequest = {
            chainId,
            method: 'amino',
            data: {
                chain_id: chainId,
                account_number: '0',
                sequence: '0',
                fee: {
                    gas: '200000',
                    amount: [{ denom: 'uatom', amount: '5000' }]
                },
                msgs: [],
                memo: ''
            },
            signOptions: {
                disableBalanceCheck: false
            }
        };

        const response: CosmosSignResponse = await wallet.sign(chainId, signRequest);

        if (response.success) {
            console.log('Amino signature:', response.result);
        } else {
            console.error('Sign failed:', response.error);
        }
    }

    // 示例 2: Cosmos Direct 签名
    async signDirectExample(wallet: CosmosWallet, chainId: string) {
        const signRequest: CosmosSignRequest = {
            chainId,
            method: 'direct',
            data: {
                chainId,
                bodyBytes: new Uint8Array([1, 2, 3, 4]),
                authInfoBytes: new Uint8Array([5, 6, 7, 8]),
                accountNumber: BigInt(0)
            }
        };

        const response: CosmosSignResponse = await wallet.sign(chainId, signRequest);

        if (response.success) {
            console.log('Direct signature:', response.result);
        } else {
            console.error('Sign failed:', response.error);
        }
    }

    // 示例 3: Cosmos Arbitrary 签名
    async signArbitraryExample(wallet: CosmosWallet, chainId: string) {
        const signRequest: CosmosSignRequest = {
            chainId,
            method: 'arbitrary',
            data: 'Hello, Cosmos!'
        };

        const response: CosmosSignResponse = await wallet.sign(chainId, signRequest);

        if (response.success) {
            console.log('Arbitrary signature:', response.result);
        } else {
            console.error('Sign failed:', response.error);
        }
    }

    // 示例 4: 检查钱包支持的签名方法
    checkSupportedMethods(wallet: CosmosWallet) {
        const methods = wallet.getSupportedSignMethods();
        console.log('Supported sign methods:', methods);

        // 检查是否支持特定方法
        if (methods.includes('amino')) {
            console.log('Wallet supports Amino signing');
        }
        if (methods.includes('direct')) {
            console.log('Wallet supports Direct signing');
        }
    }

    // 示例 5: 验证签名请求
    validateRequestExample(wallet: CosmosWallet, request: CosmosSignRequest) {
        const isValid = wallet.validateSignRequest(request);
        console.log('Request is valid:', isValid);
        return isValid;
    }

    // 示例 6: 使用默认签名者地址
    async signWithDefaultSigner(wallet: CosmosWallet, chainId: string, data: any) {
        const signRequest: CosmosSignRequest = {
            chainId,
            method: 'amino',
            data
            // 不指定 signerAddress，将使用默认地址
        };

        const response = await wallet.sign(chainId, signRequest);
        return response;
    }
}

// 使用示例
export async function demonstrateSignMethods() {
    const example = new SignMethodExample();

    // 假设我们有一个已初始化的钱包
    // const wallet = new CosmosWallet(walletInfo);
    // await wallet.init();

    // 检查支持的签名方法
    // example.checkSupportedMethods(wallet);

    // 执行不同类型的签名
    // await example.signAminoExample(wallet, 'cosmoshub-4');
    // await example.signDirectExample(wallet, 'cosmoshub-4');
    // await example.signArbitraryExample(wallet, 'cosmoshub-4');
} 