import { computed, Ref } from 'vue';

import { UseChainWalletReturnType } from '../types/chain';
import { useInterchainClient } from './useInterchainClient';
import { useWalletManager } from './useWalletManager';

export const useChainWallet = (chainName: Ref<string>, walletName: Ref<string>): UseChainWalletReturnType => {
  const walletManager = useWalletManager();
  const interchainClient = useInterchainClient(chainName, walletName);

  const chainWalletState = computed(() => walletManager.value.getChainWalletState(walletName.value, chainName.value));

  return {
    connect: computed(() => async () => {
      walletManager.value.setCurrentWalletName(walletName.value);
      walletManager.value.setCurrentChainName(chainName.value);
      await walletManager.value.connect(walletName.value, chainName.value);
    }),
    disconnect: computed(() => () => walletManager.value.disconnect(walletName.value, chainName.value)),
    getRpcEndpoint: computed(() => () => walletManager.value.getRpcEndpoint(walletName.value, chainName.value)),
    status: computed(() => chainWalletState.value?.walletState),
    username: computed(() => chainWalletState.value?.account?.username),
    message: computed(() => chainWalletState.value?.errorMessage),
    logoUrl: computed(() => walletManager.value.getChainLogoUrl(chainName.value)),
    chain: computed(() => walletManager.value.getChainByName(chainName.value)),
    assetList: computed(() => walletManager.value.getAssetListByName(chainName.value)),
    address: computed(() => chainWalletState.value?.account?.address),
    wallet: computed(() => walletManager.value.getChainWalletByName(walletName.value, chainName.value)),
    ...interchainClient,
  };
};
