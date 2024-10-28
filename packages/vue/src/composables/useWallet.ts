import { computed, Ref, ComputedRef } from 'vue'
import { useWalletManager } from './useWalletManager';
import { BaseWallet } from '@interchain-kit/core';

export const useWallet = (walletName: Ref<string>): ComputedRef<BaseWallet> => {
  const walletManager = useWalletManager();
  const wallet = computed(() => {
    return walletManager.wallets.find(w => w.option.name === walletName.value);
  })

  return wallet
}