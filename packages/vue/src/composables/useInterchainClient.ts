import { WalletState } from '@interchain-kit/core';
import { HttpEndpoint } from '@interchainjs/types';
import { computed, Ref, ref, watch } from 'vue';

import { SigningClient } from '../types';
import { UseInterchainClientReturnType } from '../types/chain';
import { useWalletManager } from './useWalletManager';

export function useInterchainClient(chainName: Ref<string>, walletName: Ref<string>): UseInterchainClientReturnType {
  const rpcEndpoint = ref<string | HttpEndpoint>('');
  const signingClient = ref<SigningClient>();
  const error = ref<string | unknown | null>(null);
  const isLoading = ref<boolean>(false);

  const walletManager = useWalletManager();

  const chainWalletState = computed(() => walletManager.value.getChainWalletState(walletName.value, chainName.value));

  const initialize = async () => {
    const chain = walletManager.value.getChainByName(chainName.value);
    if (chainWalletState.value?.walletState !== WalletState.Connected || chain?.chainType !== 'cosmos') {
      signingClient.value = undefined;
      return;
    }
    try {
      isLoading.value = true;
      error.value = null;
      rpcEndpoint.value = await walletManager.value.getRpcEndpoint(walletName.value, chainName.value);
      signingClient.value = await walletManager.value.getSigningClient(walletName.value, chainName.value);
    } catch (err) {
      error.value = err;
      console.log('create client error', err);
    } finally {
      isLoading.value = false;
    }
  };

  watch(
    () => [chainName.value, walletName.value, chainWalletState.value?.walletState, chainWalletState.value?.account?.address],
    initialize,
    { immediate: true }
  );

  return {
    rpcEndpoint,
    signingClient,
    isLoading,
    error,
  };
}
