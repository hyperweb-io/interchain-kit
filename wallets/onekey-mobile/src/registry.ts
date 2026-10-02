import { OS, Wallet } from '@interchain-kit/core';

import { ICON } from './constant';

export const OneKeyMobileInfo: Wallet = {
  name: 'onekey-mobile',
  prettyName: 'OneKey Mobile',
  logo: ICON,
  mode: 'wallet-connect',
  downloads: [
    {
      device: 'mobile',
      os: 'android',
      link: 'https://play.google.com/store/apps/details?id=so.onekey.app.wallet',
    },
    {
      device: 'mobile',
      os: 'ios',
      link: 'https://apps.apple.com/app/onekey-secure-crypto-wallet/id1609559473',
    },
    {
      link: 'https://chrome.google.com/webstore/detail/onekey/jnmbobjmhlngoefaiojfljckilhhlhcj',
    },
  ],
  walletConnectLink: {
    android: `onekey-wallet://wc?uri={wc-uri}`,
    ios: `onekey-wallet://wc?uri={wc-uri}`,
  },
  walletconnect: {
    name: 'OneKey Wallet',
    projectId:
      '1aedbcfc1f31aade56ca34c38b0a1607b41cccfa3de93c946ef3b4ba2dfab11c',
    encoding: 'base64',
    mobile: {
      native: {
        ios: 'onekey-wallet:',
        android: 'onekey-wallet:',
      },
    },
    formatNativeUrl: (
      appUrl: string,
      wcUri: string,
      os: OS | undefined,
      _name: string
    ): string => {

      const plainAppUrl = appUrl.split(':')[0];
      const encodedWcUrl = encodeURIComponent(wcUri);
      switch (os) {
      case 'ios':
        return `${plainAppUrl}://wc?uri=${encodedWcUrl}`;
      case 'android':
        return `${plainAppUrl}://wc?uri=${encodedWcUrl}`;
      default:
        return `${plainAppUrl}://wc?uri=${encodedWcUrl}`;
      }
    },
  },
};
