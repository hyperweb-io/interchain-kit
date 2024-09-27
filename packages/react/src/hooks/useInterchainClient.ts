import { HttpEndpoint } from '@interchainjs/types';
import { CosmWasmSigningClient } from 'interchainjs/cosmwasm';
import { CosmosSigningClient } from 'interchainjs/cosmos';
import { SigningClient } from 'interchainjs/signing-client';
import { RpcQuery } from 'interchainjs/query/rpc';
import { useEffect, useState } from "react";
import { useWalletManager } from './useWalletManager';
import { Chain } from '@chain-registry/v2-types';
import { useAccount } from './useAccount';
import { WalletState } from '@interchain-kit/core';
import { InjSigningClient } from '@interchainjs/injective/signing-client';

export const useInterchainClient = (chainName: string, walletName: string) => {
  const [rpcEndpoint, setRpcEndpoint] = useState<string | HttpEndpoint | undefined>()
  //query
  const [queryClient, setQueryClient] = useState<RpcQuery | null>(null)
  //signing
  const [signingClient, setSigningClient] = useState<SigningClient | null>(null)
  const [signingCosmosClient, setSigningCosmosClient] = useState<CosmosSigningClient | null>(null)
  const [signingCosmWasmClient, setSigningCosmWasmClient] = useState<CosmWasmSigningClient | null>(null)
  const [signingInjectiveClient, setSigningInjectiveClient] = useState<InjSigningClient | null>(null)

  const [error, setError] = useState<string | unknown | null>(null);
  const [isLoading, setIsLoading] = useState(false)
  const walletManager = useWalletManager()
  const account = useAccount(chainName, walletName)
  const wallet = walletManager.wallets.find((w) => w.option.name === walletName)
  const chainToShow = walletManager.chains.find((c: Chain) => c.chainName === chainName)

  const initialize = async () => {
    if (wallet && chainToShow && wallet?.walletState === WalletState.Connected) {
      try {
        setIsLoading(true)

        const rpcEndpoint = await walletManager.getRpcEndpoint(wallet, chainName)
        setRpcEndpoint(rpcEndpoint)

        const queryClient = await walletManager.getQueryClient(walletName, chainName)
        setQueryClient(queryClient)

        const signingClient = await walletManager.getSigningClient(walletName, chainName)
        setSigningClient(signingClient)

        const signingStargateClient = await walletManager.getSigningCosmosClient(walletName, chainName)
        setSigningCosmosClient(signingStargateClient)

        const signingCosmwasmClient = await walletManager.getSigningCosmwasmClient(walletName, chainName)
        setSigningCosmWasmClient(signingCosmwasmClient)

        const signingInjectiveClient = await walletManager.getSigningInjectiveClient(walletName, chainName)
        setSigningInjectiveClient(signingInjectiveClient)

      } catch (error) {
        setError(error)
        console.log("create client error", error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    initialize()
  }, [chainName, walletName, account, wallet?.walletState])

  return {
    rpcEndpoint,
    signingClient: chainName === 'injective' ? signingInjectiveClient : signingClient,
    queryClient,
    signingCosmosClient,
    signingCosmWasmClient,
    signingInjectiveClient,
    error,
    isLoading
  }
}