import { ExtensionWallet, selectWalletByPlatform, WCMobileWebWallet } from '@interchain-kit/core';

import { ZuniaCosmosWallet } from './cosmos';
import { zuniaExtensionInfo } from './registry';

export * from './registry';

const web = new ExtensionWallet(zuniaExtensionInfo);
web.setNetworkWallet('cosmos', new ZuniaCosmosWallet(zuniaExtensionInfo));

const zuniaWallet = selectWalletByPlatform(
  {
    mobileBrowser: new WCMobileWebWallet(zuniaExtensionInfo),
    inAppBrowser: web,
    desktopBrowser: web,
  },
  zuniaExtensionInfo
);

export { zuniaWallet };
