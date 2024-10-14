import { OfflineSigner } from '@interchainjs/cosmos/types/wallet'
import { ref, watch, Ref } from 'vue'
import { useWalletManager } from './useWalletManager'

export function useOfflineSigner(chainName: Ref<string>, walletName: Ref<string>) {
  const walletManager = useWalletManager()
  const offlineSigner = ref<OfflineSigner | null>(null)

  watch([chainName, walletName], () => {
    const wallet = walletManager.wallets.find((w) => w.option.name === walletName.value)
    if (wallet && chainName.value) {
      offlineSigner.value = walletManager.getOfflineSigner(wallet, chainName.value)
    }
  }, { immediate: true })

  return {
    offlineSigner
  }
}
