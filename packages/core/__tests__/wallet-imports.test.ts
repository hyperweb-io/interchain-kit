describe('wallet module initialization', () => {
  it.each([
    ['../src/wallets/cosmos-wallet', 'CosmosWallet'],
    ['../src/wallets/ethereum-wallet', 'EthereumWallet'],
    ['../src/wallets/solana-wallet', 'SolanaWallet'],
    ['../src/wallets/extension-wallet', 'ExtensionWallet'],
  ])('can import %s before the wallet barrel', (path, exportName) => {
    jest.isolateModules(() => {
      const walletModule = require(path);
      expect(typeof walletModule[exportName]).toBe('function');
    });
  });
});
