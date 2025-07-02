import { Chain } from '@chain-registry/types';

// 定义签名请求的基础接口
export interface BaseSignRequest {
    chainId: Chain['chainId'];
    signerAddress?: string;
}

import { CosmosAminoDoc, CosmosDirectDoc } from '@interchainjs/cosmos';

// Cosmos 签名请求类型
export interface CosmosSignRequest extends BaseSignRequest {
    method: 'cosmos_amino' | 'cosmos_direct' | 'cosmos_arbitrary';
    data: CosmosAminoDoc | CosmosDirectDoc | string | Uint8Array;
    signOptions?: {
        disableBalanceCheck?: boolean;
        disableAllBalanceCheck?: boolean;
        preferNoSetFee?: boolean;
        disableGasCheck?: boolean;
        feeGranter?: string;
        feePayer?: string;
    };
}

// 以太坊签名请求类型
export interface EthereumSignRequest extends BaseSignRequest {
    method: 'ethereum_message' | 'ethereum_transaction';
    data: string | {
        to?: string;
        from?: string;
        value?: string;
        gas?: string;
        gasPrice?: string;
        data?: string;
        nonce?: string;
    };
}

// 通用签名请求类型（用于多链钱包）
export type GenericSignRequest = CosmosSignRequest | EthereumSignRequest; 