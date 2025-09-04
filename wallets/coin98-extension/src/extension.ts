import { CosmosWallet, EthereumWallet, MultiChainWallet } from '@interchain-kit/core';


const coin98Wallet = new MultiChainWallet(Coin98ExtensionInfo);

coin98Wallet.setNetworkWallet('eip155', new EthereumWallet(Coin98ExtensionInfo));
coin98Wallet.setNetworkWallet('cosmos', new CosmosWallet(Coin98ExtensionInfo));

export {
  coin98Wallet
};