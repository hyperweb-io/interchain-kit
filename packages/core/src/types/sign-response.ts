import { AminoSignResponse, DirectSignResponse, StdSignature } from '@interchainjs/cosmos';

// 定义签名响应的基础接口
export interface BaseSignResponse {
    success: boolean;
    error?: string;
}

// Cosmos 签名响应类型
export interface CosmosSignResponse extends BaseSignResponse {
    method: 'cosmos_amino' | 'cosmos_direct' | 'cosmos_arbitrary';
    result?: AminoSignResponse | DirectSignResponse | StdSignature;
}

// 以太坊签名响应类型
export interface EthereumSignResponse extends BaseSignResponse {
    method: 'ethereum_message' | 'ethereum_transaction';
    result?: {
        signature?: string;
        transactionHash?: string;
    };
}

// 通用签名响应类型（用于多链钱包）
export type GenericSignResponse = CosmosSignResponse | EthereumSignResponse;