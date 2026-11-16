import { EthereumWallet, ExtensionWallet } from '@interchain-kit/core';

import { AriaCosmosWallet } from './extension';
import { ariaExtensionInfo } from './registry';

export * from './extension';
export * from './registry';

const ariaWallet = new ExtensionWallet(ariaExtensionInfo);

ariaWallet.setNetworkWallet('cosmos', new AriaCosmosWallet(ariaExtensionInfo));
ariaWallet.setNetworkWallet('eip155', new EthereumWallet(ariaExtensionInfo));

export { ariaWallet };
