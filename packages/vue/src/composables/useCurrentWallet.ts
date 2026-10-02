import { WalletStore } from '@interchain-kit/store';
import { computed, ComputedRef } from 'vue';

import { useWalletManager } from './useWalletManager';

export const useCurrentWallet = (): ComputedRef<WalletStore | undefined> => {
  const walletManager = useWalletManager();
  return computed(() => walletManager.value.getWalletByName(walletManager.value.currentWalletName));
};
