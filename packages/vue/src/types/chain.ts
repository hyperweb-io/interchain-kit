import { AssetList, Chain } from '@chain-registry/types';
import { WalletState } from '@interchain-kit/core';
import { ChainWalletStore } from '@interchain-kit/store';
import { HttpEndpoint } from '@interchainjs/types';
import { ComputedRef, Ref } from 'vue';

import { SigningClient } from './sign-client';

export type CosmosKitUseChainReturnType = {
  connect: ComputedRef<() => void | Promise<void>>
  disconnect: ComputedRef<() => Promise<void>>
  openView: () => void
  closeView: () => void
  getRpcEndpoint: ComputedRef<() => Promise<string | HttpEndpoint>>
  status: ComputedRef<WalletState>
  username: ComputedRef<string | undefined>
  message: ComputedRef<string | undefined>
}

export type UseChainReturnType = {
  logoUrl: ComputedRef<string | undefined>
  chain: ComputedRef<Chain>
  assetList: ComputedRef<AssetList>
  address: ComputedRef<string | undefined>
  wallet: ComputedRef<ChainWalletStore | undefined>
  rpcEndpoint: Ref<string | HttpEndpoint>
  signingClient: Ref<SigningClient | undefined>
  isLoading: Ref<boolean>
  error: Ref<unknown>
} & CosmosKitUseChainReturnType

export type UseChainWalletReturnType = Omit<UseChainReturnType, 'openView' | 'closeView'>

export type UseInterchainClientReturnType = {
  rpcEndpoint: Ref<string | HttpEndpoint>,
  signingClient: Ref<SigningClient | undefined>,
  isLoading: Ref<boolean>,
  error: Ref<string | unknown | null>
}
