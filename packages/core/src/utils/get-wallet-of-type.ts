import { BaseWallet } from '../wallets/base-wallet';
import { MultiChainWallet } from '../wallets/multichain-wallet';
import { isInstanceOf } from './helpers';

export const getWalletByType = <T>(
  wallet: BaseWallet,
  WalletClass: new (...args: any[]) => T
) => {
  if (isInstanceOf(wallet, WalletClass)) {
    return wallet as T;
  }
  if (isInstanceOf(wallet, MultiChainWallet)) {
    const wallets = Array.from(wallet.networkWalletMap.values());
    for (const w of wallets) {
      if (isInstanceOf(w, WalletClass)) {
        return w as T;
      }
    }
  }
  return undefined;
};
