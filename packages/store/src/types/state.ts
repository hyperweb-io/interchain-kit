import { HttpEndpoint } from '@interchainjs/types';
import { Chain } from '@chain-registry/types';
import { WalletAccount, WalletName, WalletState } from "@interchain-kit/core"

export type ChainWalletState = {
  chainName: Chain['chainName']
  walletName: string
  walletState: WalletState
  rpcEndpoint: string | HttpEndpoint
  account: WalletAccount
  errorMessage: string | null
}

export type WalletControllerState = {
  walletState: WalletState
}

export type WalletStoreManagerState = {
  isReady: boolean
  currentWalletName: WalletName,
  currentChainName: Chain['chainName']
}