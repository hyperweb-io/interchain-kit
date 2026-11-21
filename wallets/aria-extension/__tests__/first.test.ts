import { CosmosWallet, EthereumWallet, SolanaWallet } from '@interchain-kit/core';

import { AriaCosmosWallet, ariaExtensionInfo, AriaSolanaWallet, ariaWallet, solanaCluster } from '../src';

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
    expect(ariaWallet.getWalletByChainType('solana')).toBeInstanceOf(AriaSolanaWallet);
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

describe('AriaSolanaWallet connect', () => {
  const solanaChain = (chainId: string | undefined, rpc?: string): any => ({
    chainName: `solana-${chainId}`,
    chainType: 'solana',
    chainId,
    ...(rpc ? { apis: { rpc: [{ address: rpc }] } } : {}),
  });
  const setup = (chains: any[], changeCluster = jest.fn().mockResolvedValue({})) => {
    const wallet = new AriaSolanaWallet(ariaExtensionInfo);
    wallet.setChainMap(chains);
    const connect = jest.fn().mockResolvedValue({ publicKey: 'So1' });
    wallet.solana = { changeCluster, connect };
    return { wallet, changeCluster, connect };
  };

  // A chain ID and RPC that disagree (testnet's genesis hash, devnet's RPC): the RPC names the cluster
  it("sets the chain's cluster in Aria before connecting", async () => {
    const chain = solanaChain('4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z', 'https://api.devnet.solana.com');
    const { wallet, changeCluster, connect } = setup([chain]);

    await wallet.connect(chain.chainId);

    expect(changeCluster).toHaveBeenCalledWith('devnet');
    expect(changeCluster.mock.invocationCallOrder[0]).toBeLessThan(connect.mock.invocationCallOrder[0]);
  });

  it('a chain Aria has no RPCs for is refused, and the site is not connected', async () => {
    const chain = solanaChain('local', 'http://localhost:8899');
    const refusal = Object.assign(new Error('Aria has no Solana cluster solana:localnet.'), { code: -32602 });
    const { wallet, connect } = setup([chain], jest.fn().mockRejectedValue(refusal));

    await expect(wallet.connect(chain.chainId)).rejects.toThrow('Aria has no Solana cluster solana:localnet.');
    expect(connect).not.toHaveBeenCalled();
  });

  it.each([
    ['the RPC names devnet', 'devnet', solanaChain('x', 'https://devnet.helius-rpc.com/?api-key=k')],
    ['the RPC names testnet', 'testnet', solanaChain('x', 'https://api.testnet.solana.com')],
    ['a local RPC', 'localnet', solanaChain('x', 'http://127.0.0.1:8899')],
    ['the devnet genesis hash', 'devnet', solanaChain('EtWTRABZaYq6iMfeYKouRu166VU2xqa1')],
    ['the testnet CAIP-2 ID', 'testnet', solanaChain('solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z')],
    ['the mainnet genesis hash', 'mainnet', solanaChain('5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp')],
    ["a mainnet provider's RPC", 'mainnet', solanaChain(undefined, 'https://mainnet.helius-rpc.com')],
    ['no chain at all', 'mainnet', undefined],
  ])('%s: %s', (_, cluster, chain) => {
    expect(solanaCluster(chain, chain?.chainId)).toBe(cluster);
  });
});
