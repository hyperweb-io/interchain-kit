import { AminoSignResponse, DirectSignResponse, StdSignature } from "@interchainjs/cosmos";

//cosmos sign response types
export type ArbitrarySignResponse = StdSignature

export type CosmosSignResponse = AminoSignResponse | DirectSignResponse | ArbitrarySignResponse;


//eth sign response types
export type EthSignResponse = string | Uint8Array | Record<string, any>;

//multi-sign response types
export type MultiSignResponse = CosmosSignResponse | EthSignResponse;