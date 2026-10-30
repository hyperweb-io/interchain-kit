import { Wallet } from '@interchain-kit/core';

import { ICON } from './constant';
import { ZUNIA_COSMOS_WC_EVENTS, ZUNIA_COSMOS_WC_METHODS, ZUNIA_WC_LINK } from './wc-link';

export const zuniaMobileInfo: Wallet = {
  name: 'zunia-mobile',
  prettyName: 'Zunia',
  logo: ICON,
  mode: 'wallet-connect',
  description: 'Zunia on a phone, over WalletConnect.',
  downloads: [
    {
      link: 'https://zunialab.com',
    },
  ],
  walletConnectLink: ZUNIA_WC_LINK,
  walletconnect: {
    name: 'Zunia',
    // Zunia is not listed in the WalletConnect Explorer, so there is no explorer project id.
    // Pairing uses the dApp project id from Interchain Kit. These links open the app directly.
    projectId: '',
    mobile: {
      native: {
        ios: 'zunia:',
        android: 'zunia:',
      },
      universal: 'https://zunialab.com/wc',
    },
    requiredNamespaces: {
      methods: [...ZUNIA_COSMOS_WC_METHODS],
      events: [...ZUNIA_COSMOS_WC_EVENTS],
    },
    formatNativeUrl: (_appUrl, wcUri, os) => {
      if (os === 'android') return ZUNIA_WC_LINK.android.replace('{wc-uri}', encodeURIComponent(wcUri));
      return ZUNIA_WC_LINK.ios.replace('{wc-uri}', encodeURIComponent(wcUri));
    },
  },
};
