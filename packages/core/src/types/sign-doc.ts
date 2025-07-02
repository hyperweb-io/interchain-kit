import { CosmosAminoDoc, CosmosDirectDoc } from '@interchainjs/cosmos';

//cosmos sign doc types
export type CosmosArbitraryDoc = string | Uint8Array;

export type CosmosSignDoc = CosmosAminoDoc | CosmosDirectDoc | CosmosArbitraryDoc;


//eth sign doc types
export type EthSignDoc = string | Uint8Array | Record<string, any>;


//multi-sign doc types
export type MultiSignDoc = CosmosSignDoc | EthSignDoc;

// 为了兼容性，添加一个更通用的类型
export type MultiSignRequest = string | Uint8Array | Record<string, any>;





