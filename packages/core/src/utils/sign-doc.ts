import { CosmosAminoDoc, CosmosDirectDoc } from '@interchainjs/cosmos/types';


export const isCosmosAminoDoc = (data: any): data is CosmosAminoDoc => {
  return data && typeof data === 'object' && 'sequence' in data && 'account_number' in data;
}

export const isCosmosDirectDoc = (data: any): data is CosmosDirectDoc => {
  return data && typeof data === 'object' && 'bodyBytes' in data && 'authInfoBytes' in data;
}

export const isCosmosArbitraryDoc = (data: any): data is string | Uint8Array => {
  return typeof data === 'string' || (data instanceof Uint8Array);
}