import { CosmosSignerConfig } from '@interchainjs/cosmos';

import { DirectSignDoc, WalletAccount } from './wallet';

export interface OfflineAminoSigner {
  getAccounts: () => Promise<readonly WalletAccount[]>;
  signAmino: (signer: string, signDoc: StdSignDoc) => Promise<AminoSignResponse>;
}

export interface OfflineDirectSigner {
  getAccounts: () => Promise<readonly WalletAccount[]>;
  signDirect: (signer: string, signDoc: DirectSignDoc) => Promise<DirectSignResponse>;
}

export interface CosmosSigningOptions {
  cosmosSignerConfig: Partial<CosmosSignerConfig>
}

export interface Pubkey {
  type: string;
  value: string;
}

export interface StdSignature {
  pub_key: Pubkey;
  signature: string;
}

export interface TxRaw {
  bodyBytes: Uint8Array;
  authInfoBytes: Uint8Array;
  signatures: Uint8Array[];
}
export interface SignDoc {
  bodyBytes: Uint8Array;
  authInfoBytes: Uint8Array;
  chainId: string;
  accountNumber: bigint;
}
export interface Coin {
  denom: string;
  amount: string;
}
export interface StdFee {
  amount: Coin[];
  gas: string;
  granter?: string;
  payer?: string;
}
export interface AminoMessage {
  type: string;
  value: any;
}
export interface StdSignDoc {
  chain_id: string;
  account_number: string;
  sequence: string;
  fee: StdFee;
  msgs: AminoMessage[];
  memo: string;
}
export type TypeName = string;

export interface DirectSignResponse {
  /**
   * The sign doc that was signed.
   * This may be different from the input signDoc when the signer modifies it as part of the signing process.
   */
  signed: SignDoc;
  /** Signature object with public key and signature */
  signature: StdSignature;
}
/**
* Response from amino signing
*/
export interface AminoSignResponse {
  /**
   * The sign doc that was signed.
   * This may be different from the input signDoc when the signer modifies it as part of the signing process.
   */
  signed: StdSignDoc;
  /** Signature object with public key and signature */
  signature: StdSignature;
}