import { Chain } from '@chain-registry/v2-types';
import { WalletState } from '@interchain-kit/core';
import { InjSigningClient } from '@interchainjs/injective/signing-client';
import { HttpEndpoint } from '@interchainjs/types';
import { CosmosSigningClient } from 'interchainjs/cosmos';
import { CosmWasmSigningClient } from 'interchainjs/cosmwasm';
import { RpcQuery } from 'interchainjs/query/rpc';
import { SigningClient } from 'interchainjs/signing-client';
import { Ref, ref, watch } from 'vue';

import { useWalletManager } from './useWalletManager';

export function useInterchainClient(chainName: Ref<string>, walletName: Ref<string>) {
	const rpcEndpoint = ref<string | HttpEndpoint | undefined>();
	const queryClient = ref<RpcQuery | null>(null);
	const signingClient = ref<SigningClient | null>(null);
	const signingCosmosClient = ref<CosmosSigningClient | null>();
	const signingCosmWasmClient = ref<CosmWasmSigningClient | null>();
	const signingInjectiveClient = ref<InjSigningClient | null>();
	const error = ref<string | unknown | null>(null);
	const isLoading = ref(false);

	const walletManager = useWalletManager();
	// const account = useAccount(chainName, walletName)

	const initialize = async () => {
		const wallet = walletManager.wallets.find((w) => w.option.name === walletName.value);
		const chainToShow = walletManager.chains.find((c: Chain) => c.chainName === chainName.value);
		if (wallet && chainToShow && wallet?.walletState === WalletState.Connected) {
			try {
				isLoading.value = true;
				rpcEndpoint.value = await walletManager.getRpcEndpoint(chainName.value);
				queryClient.value = await walletManager.getQueryClient(walletName.value, chainName.value);
				signingClient.value = await walletManager.getSigningClient(walletName.value, chainName.value);
				signingCosmosClient.value = await walletManager.getSigningCosmosClient(walletName.value, chainName.value);
				signingCosmWasmClient.value = await walletManager.getSigningCosmwasmClient(walletName.value, chainName.value);
				signingInjectiveClient.value = await walletManager.getSigningInjectiveClient(walletName.value, chainName.value);

			} catch (err) {
				error.value = err;
				console.log('create client error', err);
			} finally {
				isLoading.value = false;
			}
		}
	};

	watch([chainName, walletName, walletManager], initialize);
	initialize();

	return {
		rpcEndpoint,
		queryClient,
		signingClient: chainName.value === 'injective' ? signingInjectiveClient : signingInjectiveClient,
		signingCosmosClient,
		signingCosmWasmClient,
		signingInjectiveClient,
		isLoading,
		error,
	};
}