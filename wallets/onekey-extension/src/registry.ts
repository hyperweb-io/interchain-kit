import { Wallet } from '@interchain-kit/core';

import { ICON } from './constant';

export const OneKeywalletExtensionInfo: Wallet = {
  windowKey: '$onekey.ethereum',
  cosmosKey: '$onekey.cosmos',
  ethereumKey: '$onekey.ethereum',
  solanaKey: '$onekey.solana',
  walletIdentifyKey: '$onekey.ethereum.isOneKey',
  name: 'onekeywallet-extension',
  prettyName: 'OneKey',
  logo: ICON,
  mode: 'extension',
  keystoreChange: 'onekey_keystorechange',
  downloads: [
    {
      device: 'desktop',
      browser: 'chrome',
      link: 'https://chrome.google.com/webstore/detail/onekey/jnmbobjmhlngoefaiojfljckilhhlhcj',
    },
    {
      link: 'https://onekey.so/download',
    },
  ],
  walletconnect: {
    name: 'OneKey',
    projectId:
      '1aedbcfc1f31aade56ca34c38b0a1607b41cccfa3de93c946ef3b4ba2dfab11c',
  },
  walletConnectLink: {
    android: `onekey-wallet://wc?uri={wc-uri}`,
    ios: `onekey-wallet://wc?uri={wc-uri}`,
  },
};
