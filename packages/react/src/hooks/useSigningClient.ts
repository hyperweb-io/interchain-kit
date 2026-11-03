import { WalletState } from '@interchain-kit/core';

import { useAsync } from './useAsync';
import { useWalletManager } from './useWalletManager';

export const useSigningClient = (chainName: string, walletName: string) => {
  const {
    getSigningClient,
    getChainWalletState,
    getRpcEndpoint,
    isReady,
    getChainByName,
  } = useWalletManager();

  const chain = getChainByName(chainName);

  const isCosmosChain = chain.chainType === 'cosmos';
  const chainWalletState = isCosmosChain
    ? getChainWalletState(walletName, chainName)
    : undefined;

  const { data, isLoading, error } = useAsync({
    queryKey: `signing-client-${chainName}-${walletName}`,
    queryFn: async () => {
      await getRpcEndpoint(walletName, chainName);
      const currentWalletState = getChainWalletState(
        walletName,
        chainName
      )?.walletState;
      if (currentWalletState === WalletState.Connected) {
        return getSigningClient(walletName, chainName);
      }
    },
    enabled:
      isCosmosChain &&
      chainWalletState?.walletState === WalletState.Connected &&
      isReady,
    disableCache: true,
  });

  // Keep hook order stable when the selected chain changes type.
  if (!isCosmosChain) {
    return {
      signingClient: null,
      isLoading: false,
      error: null,
    };
  }

  return {
    signingClient: data,
    error,
    isLoading,
  };
};
