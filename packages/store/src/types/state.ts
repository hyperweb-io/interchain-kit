import { Chain } from '@chain-registry/types';
import { WalletAccount, WalletName, WalletState } from '@interchain-kit/core';
import { HttpEndpoint } from '@interchainjs/types';

// 基础状态类型
export type BaseChainWalletState = {
  chainName: Chain['chainName']
  walletName: string
  walletState: WalletState
  rpcEndpoint: string | HttpEndpoint
  account: WalletAccount
  errorMessage: string | null
}

// WalletConnect 特定的状态
export type WalletConnectChainWalletState = BaseChainWalletState & {
  qrCodeUri: string | null
}

// 通用状态类型（使用联合类型）
export type ChainWalletState = BaseChainWalletState | WalletConnectChainWalletState

// 类型守卫：检查是否是 WalletConnect 钱包状态
export function isWalletConnectState(state: ChainWalletState): state is WalletConnectChainWalletState {
  return 'qrCodeUri' in state;
}

export type WalletStoreState = {
  walletState: WalletState
}

export type WalletStoreManagerState = {
  isReady: boolean
  currentWalletName: WalletName
  currentChainName: Chain['chainName']
  chainWalletStates: ChainWalletState[]
}

// 专门用于 WalletConnect 的状态
export type WalletConnectState = {
  qrCodeUri: string | null
  isActive: boolean
}

