import { Wallet } from '@interchain-kit/core';

import { ICON } from './constant';

export const ariaExtensionInfo: Wallet = {
  name: 'aria-extension',
  prettyName: 'Aria',
  logo: ICON,
  mode: 'extension',
  windowKey: 'aria',
  cosmosKey: 'aria',
  ethereumKey: 'aria.ethereum',
  walletIdentifyKey: 'aria.ethereum.isAria',
  keystoreChange: 'aria_keystorechange',
  downloads: [
    {
      device: 'desktop',
      browser: 'chrome',
      link: 'https://chromewebstore.google.com/detail/aria-wallet/cgghllcclkhfpkjhgomhehlebgphifbm',
    },
    {
      link: 'https://aria.orchestralabs.org',
    },
  ],
};
