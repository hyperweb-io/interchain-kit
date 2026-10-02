import {
  CosmosWallet,
  EthereumWallet,
  ExtensionWallet,
  selectWalletByPlatform,
  SolanaWallet,
  WCMobileWebWallet,
} from '@interchain-kit/core';

import { OneKeywalletExtensionInfo } from './registry';

export * from './registry';

const web = new ExtensionWallet(OneKeywalletExtensionInfo);

web.setNetworkWallet('cosmos', new CosmosWallet(OneKeywalletExtensionInfo));
web.setNetworkWallet('eip155', new EthereumWallet(OneKeywalletExtensionInfo));
web.setNetworkWallet('solana', new SolanaWallet(OneKeywalletExtensionInfo));

const onekeyWallet = selectWalletByPlatform(
  {
    mobileBrowser: new WCMobileWebWallet(OneKeywalletExtensionInfo),
    inAppBrowser: web,
    desktopBrowser: web,
  },
  OneKeywalletExtensionInfo
);

export { onekeyWallet };
