import { useWalletManager } from "./useWalletManager"
import { CosmosKitUseChainReturnType, UseChainReturnType } from '../types/chain';
import { useAccount } from "./useAccount";
import { AssetList, Chain } from "@chain-registry/v2-types";
import { useCurrentWallet } from './useCurrentWallet';
import { useInterchainClient } from './useInterchainClient';
import { useWalletModal } from "../modal";
import { ChainNameNotExist } from "@interchain-kit/core";
import { getChainLogoUrl } from "../utils";
import { useCallback, useMemo } from "react";

export const useChain = (chainName: string): UseChainReturnType & CosmosKitUseChainReturnType => {
  const walletManager = useWalletManager()
  const chainToShow = walletManager.chains.find((c: Chain) => c.chainName === chainName)
  const assetList = walletManager.assetLists.find((a: AssetList) => a.chainName === chainName)

  const currentWallet = useCurrentWallet()
  const account = useAccount(chainName, currentWallet?.option?.name)
  const interchainClient = useInterchainClient(chainName, currentWallet?.option?.name)

  if (!chainToShow) {
    throw new ChainNameNotExist(chainName)
  }

  const { open, close } = useWalletModal()

  const getRpcEndpoint = useCallback(async() => {
    return await walletManager.getRpcEndpoint(currentWallet, chainName)
  }, [currentWallet, chainName])

  const cosmosKitUserChainReturnType: CosmosKitUseChainReturnType = {
    connect: () => {
      if (currentWallet) {
        return
      }
      open()
    },
    openView: open,
    closeView: close,
    getRpcEndpoint,
    status: currentWallet?.walletState,
    username: account?.username,
    message: currentWallet?.errorMessage,
    getSigningCosmWasmClient: () => walletManager.getSigningCosmwasmClient(currentWallet.option.name, chainName),
    getSigningCosmosClient: () => walletManager.getSigningCosmosClient(currentWallet.option.name, chainName),
  }

  return {
    logoUrl: getChainLogoUrl(assetList),
    chain: chainToShow,
    assetList,
    address: account?.address,
    wallet: currentWallet,
    ...cosmosKitUserChainReturnType, //for migration cosmos kit
    ...interchainClient
  }
}