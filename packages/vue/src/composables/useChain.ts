import { AssetList, Chain } from '@chain-registry/v2-types';
import { ChainNameNotExist } from '@interchain-kit/core';
import { Ref, ref, watch } from 'vue';
import { HttpEndpoint } from "@cosmjs/stargate"
import { UseChainReturnType } from '../types/chain';
import { useWalletManager } from './useWalletManager';

export const useChain = (chainName: Ref<string>): UseChainReturnType => {
  const walletManager = useWalletManager();
  const chainToShow = ref();
  const assetList = ref();
  const logoUrl = ref('');
  const rpcEndpoint = ref<string | HttpEndpoint>('')
  const _setValuesByChainName = async () => {
    chainToShow.value = walletManager.chains.find((c: Chain) => c.chainName === chainName.value);
    if (!chainToShow.value) {
      throw new ChainNameNotExist(chainName.value);
    }
    assetList.value = walletManager.assetLists.find((a: AssetList) => a.chainName === chainName.value);
    logoUrl.value = walletManager.getChainLogoUrl(chainName.value);
    rpcEndpoint.value = await walletManager.getRpcEndpoint(chainName.value);
  };

  watch([chainName, walletManager], () => {
    _setValuesByChainName();
  });
  _setValuesByChainName();

  const useChainReturnType: UseChainReturnType = {
    logoUrl,
    chain: chainToShow,
    assetList,
    rpcEndpoint
  };

  return {
    ...useChainReturnType
  };
};