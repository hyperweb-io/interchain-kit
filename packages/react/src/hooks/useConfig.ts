import { AssetList, Chain } from "@chain-registry/v2-types"
import { useWalletManager } from "./useWalletManager"
import { EndpointOptions, SignerOptions } from "@interchain-kit/core"
export const useConfig = () => {
  const walletManager = useWalletManager()

  return {
    updateChains: (chains: Chain[]) => walletManager.chains = chains,
    updateAssetLists: (assetLists: AssetList[]) => walletManager.assetLists = assetLists,
    updateSignerOptions: (signerOptions: SignerOptions) => walletManager.signerOptions = signerOptions,
    updateEndpoints: (endpointOptions: EndpointOptions) => walletManager.endpointOptions = endpointOptions,
  }
}