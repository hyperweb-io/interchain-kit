import { Chain } from '@chain-registry/types';
import { CosmosAminoDoc, CosmosDirectDoc } from '@interchainjs/cosmos';

// 定义签名请求的基础接口
export interface BaseSignRequest {
  chainId: Chain['chainId'];
  signerAddress?: string;
}

// 定义签名选项接口
export interface SignOptions {
  disableBalanceCheck?: boolean;
  disableAllBalanceCheck?: boolean;
  preferNoSetFee?: boolean;
  disableGasCheck?: boolean;
  feeGranter?: string;
  feePayer?: string;
}

// Cosmos 签名请求类型
export interface CosmosAminoSignRequest extends BaseSignRequest {
  method: 'cosmos_amino';
  data: CosmosAminoDoc;
  signOptions?: SignOptions;
}

export interface CosmosDirectSignRequest extends BaseSignRequest {
  method: 'cosmos_direct';
  data: CosmosDirectDoc;
  signOptions?: SignOptions;
}

export interface CosmosArbitrarySignRequest extends BaseSignRequest {
  method: 'cosmos_arbitrary';
  data: string | Uint8Array;
  signOptions?: SignOptions;
}

// 以太坊签名请求类型
export interface EthereumMessageSignRequest extends BaseSignRequest {
  method: 'ethereum_message';
  data: string;
}

export interface EthereumTransactionSignRequest extends BaseSignRequest {
  method: 'ethereum_transaction';
  data: {
    to?: string;
    from?: string;
    value?: string;
    gas?: string;
    gasPrice?: string;
    data?: string;
    nonce?: string;
  };
}

// 类型守卫函数
export function isCosmosAminoSignRequest(request: any): request is CosmosAminoSignRequest {
  return request.method === 'cosmos_amino';
}

export function isCosmosDirectSignRequest(request: any): request is CosmosDirectSignRequest {
  return request.method === 'cosmos_direct';
}

export function isCosmosArbitrarySignRequest(request: any): request is CosmosArbitrarySignRequest {
  return request.method === 'cosmos_arbitrary';
}

export function isEthereumMessageSignRequest(request: any): request is EthereumMessageSignRequest {
  return request.method === 'ethereum_message';
}

export function isEthereumTransactionSignRequest(request: any): request is EthereumTransactionSignRequest {
  return request.method === 'ethereum_transaction';
}

export function isCosmosSignRequest(request: any): request is CosmosAminoSignRequest | CosmosDirectSignRequest | CosmosArbitrarySignRequest {
  return ['cosmos_amino', 'cosmos_direct', 'cosmos_arbitrary'].includes(request.method);
}

export function isEthereumSignRequest(request: any): request is EthereumMessageSignRequest | EthereumTransactionSignRequest {
  return ['ethereum_message', 'ethereum_transaction'].includes(request.method);
}

// 通用签名请求类型（用于多链钱包）
export type GenericSignRequest = CosmosAminoSignRequest | CosmosDirectSignRequest | CosmosArbitrarySignRequest | EthereumMessageSignRequest | EthereumTransactionSignRequest;