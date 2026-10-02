import { WalletState } from '@interchain-kit/core';
import { OfflineSigner } from '@interchainjs/cosmos';
import { computed, Ref, ref, watch } from 'vue';

import { useWalletManager } from './useWalletManager';

export const useOfflineSigner = (chainName: Ref<string>, walletName: Ref<string>) => {
  const walletManager = useWalletManager();
  const offlineSigner = ref<OfflineSigner>();

  const walletState = computed(() => walletManager.value.getChainWalletState(walletName.value, chainName.value)?.walletState);

  const _setValues = async () => {
    if (walletState.value !== WalletState.Connected) {
      offlineSigner.value = undefined;
      return;
    }
    offlineSigner.value = await walletManager.value.getOfflineSigner(walletName.value, chainName.value);
  };
  watch([chainName, walletName, walletState], _setValues, { immediate: true });

  return offlineSigner;
};
