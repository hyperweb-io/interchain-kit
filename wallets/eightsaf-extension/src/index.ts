import { CosmosWallet, ExtensionWallet } from '@interchain-kit/core';

import { eightsafExtensionInfo } from './registry';

export * from './registry';

const eightsafWallet = new ExtensionWallet(eightsafExtensionInfo);

eightsafWallet.setNetworkWallet('cosmos', new CosmosWallet(eightsafExtensionInfo));

export { eightsafWallet };
