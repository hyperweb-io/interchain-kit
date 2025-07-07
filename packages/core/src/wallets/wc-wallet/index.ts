import { WCCosmosWallet } from './wc-cosmos-wallet';
import { WCEthereumWallet } from './wc-ethereum-wallet';
import { WCWallet } from './wc-wallet';


export * from './wc-cosmos-wallet';
export * from './wc-ethereum-wallet';
export * from './wc-wallet';


export const walletConnect = new WCWallet();


walletConnect.setNetworkWallet('cosmos', new WCCosmosWallet());
walletConnect.setNetworkWallet('eip155', new WCEthereumWallet());

