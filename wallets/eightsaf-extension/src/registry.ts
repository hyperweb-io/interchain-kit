import { Wallet } from '@interchain-kit/core';

import { ICON } from './constant';

export const eightsafExtensionInfo: Wallet = {
  name: 'eightsaf-extension',
  prettyName: 'EightSaf',
  logo: ICON,
  mode: 'extension',
  windowKey: 'eightsaf',
  cosmosKey: 'eightsaf',
  walletIdentifyKey: 'eightsaf.isEightSaf',
  keystoreChange: 'eightsaf_keystorechange',
  description: 'Non-custodial browser extension wallet for Safrochain',
  downloads: [
    {
      device: 'desktop',
      browser: 'chrome',
      link: 'https://chromewebstore.google.com/detail/eightsaf-wallet/hpemogcffkhcoegjbphljmbjepibnpjj',
    },
    {
      device: 'desktop',
      browser: 'firefox',
      link: 'https://addons.mozilla.org/en-US/firefox/addon/eightsaf-wallet/',
    },
    {
      link: 'https://eightsaf.io',
    },
  ],
};
