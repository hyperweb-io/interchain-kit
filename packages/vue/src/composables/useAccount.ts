import { ref, watch, onMounted, onUnmounted, Ref } from 'vue'
import { WalletAccount, WalletState } from "@interchain-kit/core"
import { useWalletManager } from './useWalletManager'

export function useAccount(chainName: Ref<string>, walletName: Ref<string>): Ref<WalletAccount | null> {
  const walletManager = useWalletManager()
  const account = ref<WalletAccount | null>(null)

  const getAccount = async () => {
    const wallet = walletManager.wallets.find(w => w.option.name === walletName.value)
    const chain = walletManager.chains.find(c => c.chainName === chainName.value)

    if (wallet && chain) {
      if (wallet.walletState === WalletState.Connected) {
        const newAccount = await wallet.getAccount(chain.chainId)
        account.value = newAccount
      }
      if (wallet.walletState === WalletState.Disconnected) {
        account.value = null
      }
    }
  }

  watch([chainName, walletName], getAccount)

  onMounted(() => {
    const wallet = walletManager.wallets.find(w => w.option.name === walletName.value)
    if (wallet) {
      wallet.events.on('keystoreChange', getAccount)
    }
    getAccount()
  })

  onUnmounted(() => {
    const wallet = walletManager.wallets.find(w => w.option.name === walletName.value)
    if (wallet) {
      wallet.events.off('keystoreChange', getAccount)
    }
  })

  return account
}
