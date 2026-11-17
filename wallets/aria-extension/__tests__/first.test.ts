import { CosmosWallet, EthereumWallet, SolanaWallet } from '@interchain-kit/core';

import { AriaCosmosWallet, ariaExtensionInfo, ariaWallet } from '../src';

describe('Aria extension', () => {
  it('exposes correct wallet metadata', () => {
    expect(ariaWallet.info.name).toBe('aria-extension');
    expect(ariaWallet.info.prettyName).toBe('Aria');
    expect(ariaWallet.info.mode).toBe('extension');
    expect(ariaWallet.info.windowKey).toBe('aria');
    expect(ariaWallet.info.cosmosKey).toBe('aria');
    expect(ariaWallet.info.ethereumKey).toBe('aria.ethereum');
    expect(ariaWallet.info.solanaKey).toBe('aria.solana');
    expect(ariaWallet.info.keystoreChange).toBe('aria_keystorechange');
    expect(ariaWallet.info.downloads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          browser: 'chrome',
          link: 'https://chromewebstore.google.com/detail/aria-wallet/cgghllcclkhfpkjhgomhehlebgphifbm',
        }),
      ]),
    );
  });

  it('uses Aria for Cosmos, EVM and Solana chains', () => {
    expect(ariaWallet.getWalletByChainType('cosmos')).toBeInstanceOf(AriaCosmosWallet);
    expect(ariaWallet.getWalletByChainType('cosmos')).toBeInstanceOf(CosmosWallet);
    expect(ariaWallet.getWalletByChainType('eip155')).toBeInstanceOf(EthereumWallet);
    expect(ariaWallet.getWalletByChainType('solana')).toBeInstanceOf(SolanaWallet);
  });
});

describe('AriaCosmosWallet connect', () => {
  const setup = (getKey: jest.Mock, enable = jest.fn().mockResolvedValue(undefined)) => {
    const wallet = new AriaCosmosWallet(ariaExtensionInfo);
    wallet.client = { enable, getKey };
    const addSuggestChain = jest.spyOn(wallet, 'addSuggestChain').mockResolvedValue(undefined);
    return { wallet, enable, addSuggestChain };
  };

  it('connects to a chain Aria knows without suggesting it', async () => {
    const { wallet, enable, addSuggestChain } = setup(jest.fn().mockResolvedValue({}));

    await wallet.connect('cosmoshub-4');

    expect(enable).toHaveBeenCalledWith('cosmoshub-4');
    expect(addSuggestChain).not.toHaveBeenCalled();
  });

  it('suggests a chain Aria does not know', async () => {
    const { wallet, addSuggestChain } = setup(
      jest
        .fn()
        .mockRejectedValue(new Error('Unknown chain: mychain-1. Add it via experimentalSuggestChain().')),
    );

    await wallet.connect('mychain-1');

    expect(addSuggestChain).toHaveBeenCalledWith('mychain-1');
  });

  it('passes other getKey errors through', async () => {
    const { wallet, addSuggestChain } = setup(jest.fn().mockRejectedValue(new Error('No accounts found in wallet')));

    await expect(wallet.connect('cosmoshub-4')).rejects.toThrow('No accounts found in wallet');
    expect(addSuggestChain).not.toHaveBeenCalled();
  });

  it('does not suggest a chain when the user rejects the connection', async () => {
    const getKey = jest.fn();
    const { wallet, addSuggestChain } = setup(
      getKey,
      jest.fn().mockRejectedValue(new Error('User rejected the connection request')),
    );

    await expect(wallet.connect('cosmoshub-4')).rejects.toThrow('User rejected the connection request');
    expect(getKey).not.toHaveBeenCalled();
    expect(addSuggestChain).not.toHaveBeenCalled();
  });
});
