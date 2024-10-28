import { Ref, computed } from 'vue'
import { useWallet } from './useWallet'
import { useWalletManager } from './useWalletManager';

export const useConnect = (walletName: Ref<string>) => {
  const walletManager = useWalletManager();

  const connect = computed(() => {
    return () => walletManager.connect(walletName.value)
  })

  const disconnect = computed(() => {
    return () => walletManager.disconnect(walletName.value)
  })

  return {
    connect,
    disconnect
  }
}