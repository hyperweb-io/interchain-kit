export const InterchainStorage = {
  set(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  get(key: string) {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  },
};

export const INTERCHAIN_STORAGE_KEY = 'interchain-kit-store';