import { Wallet } from "@interchain-kit/core";
import { ICON } from "./constant";

export const Coin98ExtensionInfo: Wallet = {
  windowKey: 'coin98',
  cosmosKey: 'coin98.cosmos',
  ethereumKey: 'ethereum',
  walletIdentifyKey: 'ethereum.isCoin98',
  name: 'coin98-extension',
  prettyName: 'Coin98',
  logo: ICON,
  mode: 'extension',
  keystoreChange: 'keplr_keystorechange',
  downloads: [
    {
      device: 'desktop',
      browser: 'chrome',
      link:
        'https://chrome.google.com/webstore/detail/coin98-wallet-extension-c/aeachknmefphepccionboohckonoeemg',
    },
    {
      link: 'https://coin98.com/wallet',
    },
  ],
};
