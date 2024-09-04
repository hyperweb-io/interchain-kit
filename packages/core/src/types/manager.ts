import { HttpEndpoint } from '@interchainjs/types';
import { AssetList, Chain } from "@chain-registry/v2-types";
import { ChainName } from './chain'
import { SignType } from "./common";
import { BaseWallet } from "../base-wallet";
import { SignerOptions as InterchainSignerOptions } from 'interchainjs/types';

export interface SignerOptions {
  signing?: (chain: Chain | ChainName) => InterchainSignerOptions | undefined;
  preferredSignType?: (chain: Chain | ChainName) => SignType | undefined; // using `amino` if undefined
}

export interface Endpoints {
  rpc?: (string | HttpEndpoint)[];
  rest?: (string | HttpEndpoint)[];
}

export interface EndpointOptions {
  endpoints?: Record<ChainName, Endpoints>;
}

export interface Config {
  wallets: BaseWallet[];
  chains: Chain[];
  assetLists: AssetList[];
  signerOptions: SignerOptions;
  endpointOptions: EndpointOptions
}
