import { Wallet } from "@interchain-kit/core";
import { ICON } from "./constant";

export const trustExtensionInfo: Wallet = {
  windowKey: 'trustWallet',
  name: 'trust-extension',
  prettyName: 'Trust',
  logo: ICON,
  mode: 'extension',
  keystoreChange: 'trust_keystorechange',
  downloads: [
    {
      device: 'mobile',
      os: 'android',
      link:
        'https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp&referrer=utm_source%3Dwebsite',
    },
    {
      device: 'mobile',
      os: 'ios',
      link: 'https://apps.apple.com/app/apple-store/id1288339409?mt=8',
    },
  ],
};
