import { UseChainReturnType } from '../types/chain';
import { useWalletManager } from './useWalletManager';
import { ChainNameNotExist, WalletState } from '@interchain-kit/core';
import { useSigningClient } from './useSigningClient';
import { useWalletModal } from './useWalletModal';

export const useChain = (chainName: string): UseChainReturnType => {

  const { assetLists, currentWalletName, disconnect, setCurrentChainName, getChainByName, getChainWalletState, getChainLogoUrl, connect, getSigningClient, getRpcEndpoint, getAccount, getChainWalletByName } = useWalletManager()

  const chain = getChainByName(chainName)

  if (!chain) {
    throw new ChainNameNotExist(chainName)
  }

  const assetList = assetLists.find(a => a.chainName === chainName)
  const wallet = getChainWalletByName(currentWalletName, chainName)

  const chainWalletStateToShow = getChainWalletState(currentWalletName, chainName)
  const { open, close } = useWalletModal()

  const { signingClient, isLoading: isSigningClientLoading, error: signingClientError } = useSigningClient(chainName, currentWalletName)

  return {
    //for migration cosmos kit
    connect: () => {
      setCurrentChainName(chainName)
      open()
    },
    disconnect: async () => disconnect(currentWalletName, chainName),
    openView: () => {
      setCurrentChainName(chainName)
      open()
    },
    closeView: close,
    getRpcEndpoint: () => getRpcEndpoint(currentWalletName, chainName),
    status: chainWalletStateToShow?.walletState || WalletState.Disconnected,
    username: chainWalletStateToShow?.account?.username,
    message: chainWalletStateToShow?.errorMessage,

    // new api
    logoUrl: getChainLogoUrl(chainName),
    chain,
    assetList,
    address: chainWalletStateToShow?.account?.address,
    wallet,

    getSigningClient: () => getSigningClient(currentWalletName, chainName),

    signingClient,
    isSigningClientLoading,
    signingClientError,

    rpcEndpoint: chainWalletStateToShow?.rpcEndpoint,

  }
}
