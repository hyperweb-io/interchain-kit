import { WalletManagerStore } from '@interchain-kit/store';
import { inject, ShallowRef } from 'vue';

import { WALLET_MANAGER_KEY } from '../utils';

export const useWalletManager = (): ShallowRef<WalletManagerStore> => {
  const wm = inject<ShallowRef<WalletManagerStore>>(WALLET_MANAGER_KEY);
  if (!wm) {
    throw new Error(`walletManager is undefined, did you forget to set ChainProvider?
    <ChainProvider
      :wallets="[keplrWallet, leapWallet, ...]"
      :chains="[osmosisChain, junoChain, ...]"
      :asset-lists="[osmosisAssetList, junoAssetList, ...]"
      :signer-options="{}"
      :endpoint-options="{}"
    >
      <router-view>
    </ChainProvider>`);
  }
  return wm;
};
