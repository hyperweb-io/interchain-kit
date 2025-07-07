import { CosmosWallet, EthereumWallet, ExtensionWallet, selectWalletByPlatform, WCMobileWebWallet } from '@interchain-kit/core';

import { keplrExtensionInfo } from './registry';

export * from './registry';

const web = new ExtensionWallet(keplrExtensionInfo);
web.setNetworkWallet('cosmos', new CosmosWallet(keplrExtensionInfo));
web.setNetworkWallet('eip155', new EthereumWallet(keplrExtensionInfo));

const keplrWallet = selectWalletByPlatform({
  mobileBrowser: new WCMobileWebWallet(keplrExtensionInfo),
  inAppBrowser: web,
  desktopBrowser: web,
}, keplrExtensionInfo);

export { keplrWallet };