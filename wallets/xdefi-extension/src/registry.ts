import { Wallet } from '@interchain-kit/core';
import { ICON } from './constant';

export const xdefiExtensionInfo: Wallet = {
  name: 'xdefi-extension',
  prettyName: 'XDEFI',
  windowKey: 'xfi',
  cosmosKey: 'xfi.keplr',
  walletIdentifyKey: 'xfi.keplr.isXDEFI',
  ethereumKey: 'xfi.ethereum',
  logo: ICON,
  mode: 'extension',
  downloads: [
    {
      device: 'desktop',
      browser: 'chrome',
      link: 'https://chrome.google.com/webstore/detail/ctrl-wallet/hmeobnfnfcmdkdcmlblgagmfpfboieaf',
    },
    {
      link: 'https://chrome.google.com/webstore/detail/ctrl-wallet/hmeobnfnfcmdkdcmlblgagmfpfboieaf',
    },
  ],
};
