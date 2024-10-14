import { HttpEndpoint } from '@interchainjs/types'
import { CosmWasmSigningClient } from 'interchainjs/cosmwasm'
import { CosmosSigningClient } from 'interchainjs/cosmos'
import { SigningClient } from 'interchainjs/signing-client'
import { RpcQuery } from 'interchainjs/query/rpc'
import { ref, watch, Ref } from 'vue'
import { useWalletManager } from './useWalletManager'
import { Chain } from '@chain-registry/v2-types'
import { useAccount } from './useAccount'
import { WalletState } from '@interchain-kit/core'
import { InjSigningClient } from '@interchainjs/injective/signing-client'

export function useInterchainClient(chainName: Ref<string>, walletName: Ref<string>) {
  const rpcEndpoint = ref<string | HttpEndpoint | undefined>()
  const queryClient = ref<RpcQuery | null>(null)
  const signingClient = ref<SigningClient | null>(null)
  const signingCosmosClient = ref<CosmosSigningClient | null>(null)
  const signingCosmWasmClient = ref<CosmWasmSigningClient | null>(null)
  const signingInjectiveClient = ref<InjSigningClient | null>(null)
  const error = ref<string | unknown | null>(null)
  const isLoading = ref(false)

  const walletManager = useWalletManager()
  const account = useAccount(chainName, walletName)

  const initialize = async () => {
    const wallet = walletManager.wallets.find((w) => w.option.name === walletName.value)
    const chainToShow = walletManager.chains.find((c: Chain) => c.chainName === chainName.value)

    if (wallet && chainToShow && wallet?.walletState === WalletState.Connected) {
      try {
        isLoading.value = true

        rpcEndpoint.value = await walletManager.getRpcEndpoint(wallet, chainName.value)
        queryClient.value = await walletManager.getQueryClient(walletName.value, chainName.value)
        signingClient.value = await walletManager.getSigningClient(walletName.value, chainName.value)
        signingCosmosClient.value = await walletManager.getSigningCosmosClient(walletName.value, chainName.value)
        signingCosmWasmClient.value = await walletManager.getSigningCosmwasmClient(walletName.value, chainName.value)
        signingInjectiveClient.value = await walletManager.getSigningInjectiveClient(walletName.value, chainName.value)

      } catch (err) {
        error.value = err
        console.log("create client error", err)
      } finally {
        isLoading.value = false
      }
    }
  }

  watch([chainName, walletName, account], initialize)

  return {
    rpcEndpoint,
    signingClient: computed(() => chainName.value === 'injective' ? signingInjectiveClient.value : signingClient.value),
    queryClient,
    signingCosmosClient,
    signingCosmWasmClient,
    signingInjectiveClient,
    error,
    isLoading
  }
}
