import { HttpEndpoint } from '@interchainjs/types';
import { AssetList, Chain } from "@chain-registry/types";
import { ChainName } from './chain'
import { SignType } from "./common";
import { SigningOptions as InterchainSigningOptions } from '@interchainjs/cosmos/types/signing-client'
import { BaseWallet } from '../wallets';

export interface SignerOptions {
  signing?: (chain: Chain | ChainName) => InterchainSigningOptions | undefined;
  preferredSignType?: (chain: Chain | ChainName) => SignType | undefined; // using `amino` if undefined
}

export interface Endpoints {
  rpc?: (string | HttpEndpoint)[];
  rest?: (string | HttpEndpoint)[];
}

export interface EndpointOptions {
  endpoints?: Record<ChainName, Endpoints>;
}

export enum WalletManagerState {
  Initializing = 'Initializing',
  Initialized = 'Initialized',
}


export interface Config {
  chains: Chain[],
  assetLists: AssetList[],
  wallets: BaseWallet[],
  signerOptions?: SignerOptions,
  endpointOptions?: EndpointOptions,
}