import { AminoSignResponse, DirectSignResponse, StdSignature } from '@interchainjs/cosmos';

// 1. 定义签名响应的基础接口
export interface BaseSignResponse {
  success: boolean;
  error?: string;
}

// 2. 分别定义 Cosmos 的不同签名响应接口
export interface CosmosAminoSignResponse extends BaseSignResponse {
  method: 'cosmos_amino';
  result?: AminoSignResponse;
}

export interface CosmosDirectSignResponse extends BaseSignResponse {
  method: 'cosmos_direct';
  result?: DirectSignResponse;
}

export interface CosmosArbitrarySignResponse extends BaseSignResponse {
  method: 'cosmos_arbitrary';
  result?: StdSignature;
}

// 3. 分别定义 Ethereum 的不同签名响应接口
export interface EthereumMessageSignResponse extends BaseSignResponse {
  method: 'ethereum_message';
  result?: {
    signature: string;
  };
}

export interface EthereumTransactionSignResponse extends BaseSignResponse {
  method: 'ethereum_transaction';
  result?: {
    transactionHash: string;
  };
}

// 4. 类型守卫函数
export function isCosmosAminoSignResponse(response: any): response is CosmosAminoSignResponse {
  return response.method === 'cosmos_amino';
}

export function isCosmosDirectSignResponse(response: any): response is CosmosDirectSignResponse {
  return response.method === 'cosmos_direct';
}

export function isCosmosArbitrarySignResponse(response: any): response is CosmosArbitrarySignResponse {
  return response.method === 'cosmos_arbitrary';
}

export function isEthereumMessageSignResponse(response: any): response is EthereumMessageSignResponse {
  return response.method === 'ethereum_message';
}

export function isEthereumTransactionSignResponse(response: any): response is EthereumTransactionSignResponse {
  return response.method === 'ethereum_transaction';
}

export function isCosmosSignResponse(response: any): response is CosmosAminoSignResponse | CosmosDirectSignResponse | CosmosArbitrarySignResponse {
  return ['cosmos_amino', 'cosmos_direct', 'cosmos_arbitrary'].includes(response.method);
}

export function isEthereumSignResponse(response: any): response is EthereumMessageSignResponse | EthereumTransactionSignResponse {
  return ['ethereum_message', 'ethereum_transaction'].includes(response.method);
}

export type GenericSignResponse = CosmosAminoSignResponse | CosmosDirectSignResponse | CosmosArbitrarySignResponse | EthereumMessageSignResponse | EthereumTransactionSignResponse;