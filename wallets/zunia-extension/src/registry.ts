import { Wallet } from '@interchain-kit/core';

import { ICON } from './constant';

/**
 * Android application id and the custom scheme the Zunia app registers.
 * The app only treats a link as WalletConnect when the `uri` query is a `wc:` URI.
 * `zunia://wcV2?<wc-uri>` is ignored.
 */
export const ZUNIA_ANDROID_PACKAGE = 'com.zuniawallet.zunia_mobile';

export const ZUNIA_WC_LINK = {
  android: `intent://wc?uri={wc-uri}#Intent;package=${ZUNIA_ANDROID_PACKAGE};scheme=zunia;end;`,
  ios: 'zunia://wc?uri={wc-uri}',
};

export const zuniaExtensionInfo: Wallet = {
  name: 'zunia-extension',
  prettyName: 'Zunia',
  logo: ICON,
  mode: 'extension',
  windowKey: 'zunia',
  cosmosKey: 'zunia',
  keystoreChange: 'zunia_keystorechange',
  description: 'Non-custodial Cosmos wallet. One key, every chain.',
  downloads: [
    {
      device: 'desktop',
      browser: 'chrome',
      link: 'https://chromewebstore.google.com/detail/zunia/ngokakoekdogobjmokipglbcclelgajk',
    },
    {
      device: 'desktop',
      browser: 'firefox',
      link: 'https://addons.mozilla.org/en-US/firefox/addon/zunia-wallet/',
    },
    {
      link: 'https://zunialab.com',
    },
  ],
  walletConnectLink: ZUNIA_WC_LINK,
};
