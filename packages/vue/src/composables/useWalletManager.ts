import { inject } from 'vue'
import { WalletManager } from '@interchain-kit/core'
import { WALLET_MANAGER_KEY } from '../provider'

export function useWalletManager(): WalletManager {
  const walletManager = inject(WALLET_MANAGER_KEY)
  if (!walletManager) {
    throw new Error('useWalletManager must be used within a ChainProvider')
  }
  return walletManager
}