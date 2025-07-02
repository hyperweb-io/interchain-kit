import { Chain } from '@chain-registry/types';
import { WalletAccount, WalletName, WalletState } from '@interchain-kit/core';
import { HttpEndpoint } from '@interchainjs/types';

export type ChainWalletState = {
  chainName: Chain['chainName']
  walletName: string
  walletState: WalletState
  rpcEndpoint: string | HttpEndpoint
  account: WalletAccount
  errorMessage: string | null
}

export type WalletStoreState = {
  walletState: WalletState
}

export type WalletStoreManagerState = {
  isReady: boolean
  currentWalletName: WalletName,
  currentChainName: Chain['chainName'],
  wallets: {
    [walletName: string]: {
      walletState: WalletState,
      errorMessage?: string | null,
      chains: {
        [chainName: string]: {
          walletState: WalletState,
          account: WalletAccount | null,
          errorMessage?: string | null,
          rpcEndpoint?: string | HttpEndpoint
        }
      }
    }
  }
}