import { AssetList, Chain } from '@chain-registry/types';
import { WalletState } from '@interchain-kit/core';
import { ChainWalletStore } from '@interchain-kit/store';
import { SigningClient } from '@interchainjs/cosmos';
import { HttpEndpoint } from '@interchainjs/types';

export type CosmosKitUseChainReturnType = {
  connect: () => void
  disconnect: () => void
  openView: () => void
  closeView: () => void
  getRpcEndpoint: () => Promise<string | HttpEndpoint>
  status: WalletState
  username: string
  message: string
}

export type UseChainReturnType = {
  logoUrl: string | undefined,
  chain: Chain,
  assetList: AssetList,
  address: string,
  wallet: ChainWalletStore,
  rpcEndpoint: string | HttpEndpoint | unknown
  getSigningClient: () => Promise<SigningClient>

  signingClient: SigningClient | null
  isSigningClientLoading: boolean
  signingClientError: Error | unknown | null

} & CosmosKitUseChainReturnType

export type UseChainWalletReturnType = Omit<UseChainReturnType, 'openView' | 'closeView'>

export type UseInterchainClientReturnType = {
  signingClient: SigningClient | null,
  error: string | unknown | null,
  isLoading: boolean
}