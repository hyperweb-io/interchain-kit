import { Wallet } from "@interchain-kit/core";
import { ICON } from "./constant";

export const compassExtensionInfo: Wallet = {
  windowKey: 'compass',
  cosmosKey: 'compass',
  name: 'compass-extension',
  prettyName: 'Compass',
  mode: 'extension',
  logo: ICON,
  keystoreChange: 'compass_keystorechange',
  downloads: [
    {
      device: 'desktop',
      browser: 'chrome',
      link: 'https://chrome.google.com/webstore/detail/compass-wallet-for-sei/anokgmphncpekkhclmingpimjmcooifb?hl=en',
    },
    {
      device: 'desktop',
      browser: 'firefox',
      link: 'https://addons.mozilla.org/en-US/firefox/addon/keplr/',
    },
    {
      link: 'https://www.keplr.app/download',
    },
  ],
};
