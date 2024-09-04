
import { SignClientTypes } from "@walletconnect/types";
import { DappEnv, OS } from "./common";
import { EndpointOptions } from "./manager";
export interface Key {
  readonly name: string;
  readonly algo: string;
  readonly pubKey: Uint8Array;
  readonly address: Uint8Array;
  readonly bech32Address: string;
  readonly isNanoLedger: boolean;
  readonly isSmartContract?: boolean;
}

export interface DownloadInfo extends DappEnv {
  icon?: string;
  link: string;
}

export type WalletMode =
  | 'ledger'
  | 'extension'
  | 'wallet-connect'
  | 'social-login';

export interface AppUrl {
  native?:
  | string
  | {
    android?: string;
    ios?: string;
    macos?: string;
    windows?: string;
  };
  universal?: string;
}

export interface Wallet {
  windowKey?: string,
  name: string;
  mode: WalletMode;
  prettyName: string;
  description?: string;
  keystoreChange?: string;
  downloads?: DownloadInfo[];
  logo?: string | { major: string; minor: string };
  walletconnect?: {
    name: string;
    projectId: string;
    requiredNamespaces?: {
      methods: string[];
      events: string[];
    };
    encoding?: BufferEncoding; // encoding for bytes, default 'hex'
    mobile?: AppUrl; // redirect link on mobile
    formatNativeUrl?: (
      appUrl: string,
      wcUri: string,
      os: OS | undefined,
      name: string
    ) => string;
    formatUniversalUrl?: (
      appUrl: string,
      wcUri: string,
      name: string
    ) => string;
  };
  endpoints?: EndpointOptions['endpoints']
}

export interface DirectSignDoc {
  /** SignDoc bodyBytes */
  bodyBytes: Uint8Array | null;
  /** SignDoc authInfoBytes */
  authInfoBytes: Uint8Array | null;
  /** SignDoc chainId */
  chainId: string | null;
  /** SignDoc accountNumber */
  accountNumber: bigint | null;
}

export interface SignOptions {
  readonly preferNoSetFee?: boolean;
  readonly preferNoSetMemo?: boolean;
  readonly disableBalanceCheck?: boolean;
}

export type Algo = 'secp256k1' | 'ed25519' | 'sr25519';
export interface AccountData {
  /** A printable address (typically bech32 encoded) */
  address: string;
  algo: Algo;
  pubkey: Uint8Array;
}

export interface WalletAccount extends AccountData {
  username?: string;
  isNanoLedger?: boolean;
  isSmartContract?: boolean;
}

export declare enum BroadcastMode {
  /** Return after tx commit */
  Block = 'block',
  /** Return after CheckTx */
  Sync = 'sync',
  /** Return right away */
  Async = 'async',
}

export interface SimpleAccount {
  namespace: string;
  chainId: string;
  address: string;
  username?: string;
}


export const enum WalletState {
  Disconnected = "Disconnected",
  Connecting = "Connecting",
  Connected = "Connected",
}


export const WcProviderEventType = {
  chainChanged: (chainId: string) => { },
  accountsChanged: (accounts: string[]) => { },
};

export const WcEventTypes = {
  display_uri: (uri: string) => { },
  session_ping: (payload: SignClientTypes.EventArguments['session_ping']) => { },
  session_event: (
    payload: SignClientTypes.EventArguments['session_event'],
  ) => { },
  session_update: (
    payload: SignClientTypes.EventArguments['session_update'],
  ) => { },
  session_delete: (
    payload: SignClientTypes.EventArguments['session_delete'],
  ) => { },
  session_proposal: (
    payload: SignClientTypes.EventArguments['session_proposal'],
  ) => { },
  session_extend: (
    payload: SignClientTypes.EventArguments['session_extend'],
  ) => { },
  session_expire: (
    payload: SignClientTypes.EventArguments['session_expire'],
  ) => { },
  session_request: (
    payload: SignClientTypes.EventArguments['session_request'],
  ) => { },
  session_request_sent: (
    payload: SignClientTypes.EventArguments['session_request_sent'],
  ) => { },
  proposal_expire: (
    payload: SignClientTypes.EventArguments['proposal_expire'],
  ) => { },
} as const;
