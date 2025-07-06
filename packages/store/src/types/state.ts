import { Chain } from '@chain-registry/types';
import { WalletAccount, WalletName, WalletState } from '@interchain-kit/core';
import { HttpEndpoint } from '@interchainjs/types';

// 基础状态类型
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
  currentWalletName: WalletName
  currentChainName: Chain['chainName']
  chainWalletStates: ChainWalletState[]
  walletConnectQRCodeUri: string
}

// 专门用于 WalletConnect 的状态
export type WalletConnectState = {
  qrCodeUri: string | null
  isActive: boolean
}

