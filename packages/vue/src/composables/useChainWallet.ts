import { computed, Ref } from 'vue'
import { AssetList, Chain } from "@chain-registry/v2-types"
import { useWalletManager } from "./useWalletManager"
import { useAccount } from "./useAccount"
import { BaseWallet } from "@interchain-kit/core"
import { UseChainReturnType } from "../types/chain"
import { useInterchainClient } from "./useInterchainClient"
import { getChainLogoUrl } from "../utils"

export function useChainWallet(chainName: Ref<string>, walletName: Ref<string>): UseChainReturnType {
  const walletManager = useWalletManager()
  
  const chainToShow = computed(() => walletManager.chains.find((c: Chain) => c.chainName === chainName.value))
  const assetList = computed(() => walletManager.assetLists.find((a: AssetList) => a.chainName === chainName.value))
  const wallet = computed(() => walletManager.wallets.find((w: BaseWallet) => w.option.name === walletName.value))

  const account = useAccount(chainName, walletName)
  const interchainClient = useInterchainClient(chainName, walletName)

  return {
    logoUrl: computed(() => getChainLogoUrl(assetList.value)),
    chain: chainToShow,
    assetList,
    address: computed(() => account.value?.address),
    wallet,
    ...interchainClient
  }
}
