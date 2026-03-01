import { CosmosWallet, EthereumWallet, ExtensionWallet } from '@interchain-kit/core';

import { cosmostationExtensionInfo } from './registry';

export * from './registry';

const cosmostationWallet = new ExtensionWallet(cosmostationExtensionInfo);

cosmostationWallet.setNetworkWallet('cosmos', new CosmosWallet(cosmostationExtensionInfo));
cosmostationWallet.setNetworkWallet('eip155', new EthereumWallet(cosmostationExtensionInfo));

export { cosmostationWallet };