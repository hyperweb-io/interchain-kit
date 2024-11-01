import { computed } from 'vue'
import { useWalletManager } from './useWalletManager'
import { useAccount } from './useAccount'
import { useCurrentWallet } from './useCurrentWallet'
import { useInterchainClient } from './useInterchainClient'
import { useWalletModal } from '../modal'
import { ChainNameNotExist } from '@interchain-kit/core'
import { getChainLogoUrl } from '../utils'

export function useChain(chainName: string) {
  const walletManager = useWalletManager()
  const currentWallet = useCurrentWallet()
  const account = useAccount(chainName, computed(() => currentWallet.value?.option?.name))
  const interchainClient = useInterchainClient(chainName, computed(() => currentWallet.value?.option?.name))
  const { open, close } = useWalletModal()

  const chainToShow = computed(() => walletManager.chains.find(c => c.chainName === chainName))
  const assetList = computed(() => walletManager.assetLists.find(a => a.chainName === chainName))

  if (!chainToShow.value) {
    throw new ChainNameNotExist(chainName)
  }

  return {
    logoUrl: computed(() => getChainLogoUrl(assetList.value)),
    chain: chainToShow,
    assetList,
    address: computed(() => account.value?.address),
    wallet: currentWallet,
    connect: () => {
      if (currentWallet.value) {
        return
      }
      open()
    },
    openView: open,
    closeView: close,
    getRpcEndpoint: () => walletManager.getRpcEndpoint(currentWallet.value, chainName),
    status: computed(() => currentWallet.value?.walletState),
    username: computed(() => account.value?.username),
    message: computed(() => currentWallet.value?.errorMessage),
    getSigningCosmWasmClient: () => walletManager.getSigningCosmwasmClient(currentWallet.value?.option?.name || '', chainName),
    getSigningCosmosClient: () => walletManager.getSigningCosmosClient(currentWallet.value?.option?.name || '', chainName),
    ...interchainClient
  }
}