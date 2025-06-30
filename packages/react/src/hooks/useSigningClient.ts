import { useWalletManager } from "./useWalletManager"
import { useAsync } from "./useAsync"
import { WalletState } from "@interchain-kit/core"
import { UseSigningClientHookReturnType } from "../types"

export const useSigningClient = (chainName: string, walletName: string): UseSigningClientHookReturnType => {
  const { getSigningClient, getChainWalletState, getRpcEndpoint, isReady } = useWalletManager()

  const chainWalletState = getChainWalletState(walletName, chainName)

  const { data, isLoading, error } = useAsync({
    queryKey: `signing-client-${chainName}-${walletName}`,
    queryFn: async () => {
      await getRpcEndpoint(walletName, chainName)
      const currentWalletState = getChainWalletState(walletName, chainName)?.walletState
      if (currentWalletState === WalletState.Connected) {
        return getSigningClient(walletName, chainName)
      }
    },
    enabled: chainWalletState?.walletState === WalletState.Connected && isReady,
    disableCache: true,
  })

  return {
    signingClient: data,
    error,
    isLoading,
  }
}
