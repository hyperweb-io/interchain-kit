import { CosmosDirectDoc, CosmosAminoDoc } from '@interchainjs/cosmos/types';

export type EthereumSignDoc = string

export type SignDocParams = CosmosDirectDoc | CosmosAminoDoc | EthereumSignDoc;

