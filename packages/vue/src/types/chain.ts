import { AssetList, Chain } from '@chain-registry/v2-types';
import { WalletState } from '@interchain-kit/core';
import { CosmosSigningClient } from 'interchainjs/cosmos';
import { CosmWasmSigningClient } from 'interchainjs/cosmwasm';
import { ComputedRef, Ref } from 'vue';
import { HttpEndpoint } from "@cosmjs/stargate"

export type CosmosKitUseChainReturnType = {
  connect: () => void
  disconnect: () => void
  openView: () => void
  closeView: () => void
  getRpcEndpoint: Ref<() => Promise<string | HttpEndpoint>>
  status: ComputedRef<WalletState>
  username: ComputedRef<string>
  message: ComputedRef<string>
  getSigningCosmWasmClient: Ref<() => Promise<CosmWasmSigningClient>>
  getSigningCosmosClient: Ref<() => Promise<CosmosSigningClient>>
}

export type UseChainReturnType = {
  logoUrl: Ref<string | undefined>
  chain: Ref<Chain>
  assetList: Ref<AssetList>
  rpcEndpoint: Ref<string | HttpEndpoint>
}

