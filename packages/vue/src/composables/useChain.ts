import { ChainNameNotExist, WalletState } from '@interchain-kit/core';
import { computed, inject, Ref } from 'vue';

import { CosmosKitUseChainReturnType, UseChainReturnType } from '../types/chain';
import { CLOSE_MODAL_KEY, OPEN_MODAL_KEY } from '../utils';
import { useInterchainClient } from './useInterchainClient';
import { useWalletManager } from './useWalletManager';

export const useChain = (chainName: Ref<string>): UseChainReturnType => {
  const walletManager = useWalletManager();
  const walletName = computed<string>(() => walletManager.value.currentWalletName);
  const interchainClient = useInterchainClient(chainName, walletName);

  const chain = computed(() => {
    const c = walletManager.value.getChainByName(chainName.value);
    if (!c) {
      throw new ChainNameNotExist(chainName.value);
    }
    return c;
  });
  const chainWalletState = computed(() => walletManager.value.getChainWalletState(walletName.value, chainName.value));

  const open = inject<() => void>(OPEN_MODAL_KEY);
  const close = inject<() => void>(CLOSE_MODAL_KEY);

  const openView = () => {
    walletManager.value.setCurrentChainName(chainName.value);
    open();
  };

  const cosmosKitUseChainReturnType: CosmosKitUseChainReturnType = {
    connect: computed(() => openView),
    disconnect: computed(() => () => walletManager.value.disconnect(walletName.value, chainName.value)),
    openView,
    closeView: close,
    getRpcEndpoint: computed(() => () => walletManager.value.getRpcEndpoint(walletName.value, chainName.value)),
    status: computed(() => chainWalletState.value?.walletState || WalletState.Disconnected),
    username: computed(() => chainWalletState.value?.account?.username),
    message: computed(() => chainWalletState.value?.errorMessage),
  };

  return {
    logoUrl: computed(() => walletManager.value.getChainLogoUrl(chainName.value)),
    chain,
    assetList: computed(() => walletManager.value.getAssetListByName(chainName.value)),
    address: computed(() => chainWalletState.value?.account?.address),
    wallet: computed(() => walletManager.value.getChainWalletByName(walletName.value, chainName.value)),
    ...interchainClient,
    ...cosmosKitUseChainReturnType,
  };
};
