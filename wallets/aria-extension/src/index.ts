import { EthereumWallet, ExtensionWallet } from '@interchain-kit/core';

import { AriaCosmosWallet, AriaSolanaWallet } from './extension';
import { ariaExtensionInfo } from './registry';

export * from './extension';
export * from './registry';

const ariaWallet = new ExtensionWallet(ariaExtensionInfo);

ariaWallet.setNetworkWallet('cosmos', new AriaCosmosWallet(ariaExtensionInfo));
ariaWallet.setNetworkWallet('eip155', new EthereumWallet(ariaExtensionInfo));
ariaWallet.setNetworkWallet('solana', new AriaSolanaWallet(ariaExtensionInfo));

export { ariaWallet };
