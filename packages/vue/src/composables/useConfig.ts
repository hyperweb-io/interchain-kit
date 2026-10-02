import { AssetList, Chain } from '@chain-registry/types';
import { EndpointOptions, SignerOptions } from '@interchain-kit/core';

import { useWalletManager } from './useWalletManager';

export const useConfig = () => {
  const walletManager = useWalletManager();

  return {
    addChains: (chains: Chain[], assetLists: AssetList[], signerOptions?: SignerOptions, endpointOptions?: EndpointOptions) =>
      walletManager.value.addChains(chains, assetLists, signerOptions, endpointOptions),
  };
};
