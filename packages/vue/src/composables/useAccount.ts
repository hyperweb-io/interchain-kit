import { WalletAccount } from '@interchain-kit/core';
import { computed, ComputedRef, Ref } from 'vue';

import { useWalletManager } from './useWalletManager';

export const useAccount = (chainName: Ref<string>, walletName: Ref<string>): ComputedRef<WalletAccount | null> => {
  const walletManager = useWalletManager();
  return computed(() => walletManager.value.getChainWalletState(walletName.value, chainName.value)?.account ?? null);
};
