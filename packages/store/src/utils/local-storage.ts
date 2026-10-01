import { ChainWalletState, InterchainStoreType } from '../types';

const INTERCHAIN_KIT_STORAGE_KEY = 'interchain-kit-store';

const revivePubkey = (pubkey: object): Uint8Array => {
  if (pubkey instanceof Uint8Array) {
    return pubkey;
  }
  // JSON.parse turns Uint8Array into a plain {0: byte, 1: byte, ...} object.
  const keys = Object.keys(pubkey)
    .filter((key) => /^\d+$/.test(key))
    .sort((a, b) => Number(a) - Number(b));
  return Uint8Array.from(keys.map((key) => (pubkey as Record<string, number>)[key]));
};

const reviveAccount = (account: ChainWalletState['account']): ChainWalletState['account'] => {
  if (!account || account.pubkey == null || typeof account.pubkey !== 'object') {
    return account;
  }
  return { ...account, pubkey: revivePubkey(account.pubkey) };
};

const reviveChainWalletState = (state: ChainWalletState): ChainWalletState => ({
  ...state,
  account: reviveAccount(state.account),
});

export class LocalStorage {
  save(value: Partial<InterchainStoreType>) {
    localStorage.setItem(INTERCHAIN_KIT_STORAGE_KEY, JSON.stringify(value));
  }
  load(): Partial<InterchainStoreType> {
    const value = JSON.parse(localStorage.getItem(INTERCHAIN_KIT_STORAGE_KEY) || '{}') as Partial<InterchainStoreType>;
    if (!value.chainWalletStates) {
      return value;
    }
    return {
      ...value,
      chainWalletStates: value.chainWalletStates.map(reviveChainWalletState),
    };
  }
}
