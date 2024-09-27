import { useWalletManager } from "./useWalletManager"
import { CosmosKitUseChainReturnType, UseChainReturnType } from '../types/chain';
import { useAccount } from "./useAccount";
import { AssetList, Chain } from "@chain-registry/v2-types";
import { useActiveWallet } from './useActiveWallet';
import { useInterchainClient } from './useInterchainClient';
import { useWalletModal } from "../modal";
import { ChainNameNotExist } from "@interchain-kit/core";
import { getChainLogoUrl } from "../utils";

export const useChain = (chainName: string): UseChainReturnType & CosmosKitUseChainReturnType => {
  const walletManager = useWalletManager()
  const chainToShow = walletManager.chains.find((c: Chain) => c.chainName === chainName)
  const assetList = walletManager.assetLists.find((a: AssetList) => a.chainName === chainName)

  const activeWallet = useActiveWallet()
  const account = useAccount(chainName, activeWallet?.option?.name)
  const interchainClient = useInterchainClient(chainName, activeWallet?.option?.name)

  if (!chainToShow) {
    throw new ChainNameNotExist(chainName)
  }

  const { open, close } = useWalletModal()

  const cosmosKitUserChainReturnType: CosmosKitUseChainReturnType = {
    connect: () => {
      if (activeWallet) {
        return
      }
      open()
    },
    openView: open,
    closeView: close,
    getRpcEndpoint: () => walletManager.getRpcEndpoint(activeWallet, chainName),
    status: activeWallet?.walletState,
    username: account?.username,
    message: activeWallet?.errorMessage,
    getSigningCosmWasmClient: () => walletManager.getSigningCosmwasmClient(activeWallet.option.name, chainName),
    getSigningCosmosClient: () => walletManager.getSigningCosmosClient(activeWallet.option.name, chainName),
  }

  return {
    logoUrl: getChainLogoUrl(assetList),
    chain: chainToShow,
    assetList,
    address: account?.address,
    wallet: activeWallet,
    ...cosmosKitUserChainReturnType, //for migration cosmos kit
    ...interchainClient
  }
}