import { Wallet } from "@interchain-kit/core";
import { ICON } from "./constant";

export const cosmostationExtensionInfo: Wallet = {
  windowKey: 'cosmostation',
  name: 'cosmostation-extension',
  prettyName: 'Cosmostation',
  logo: ICON,
  mode: 'extension',
  keystoreChange: 'cosmostation_keystorechange',
  downloads: [
    {
      device: 'desktop',
      browser: 'chrome',
      link: 'https://chrome.google.com/webstore/detail/cosmostation/fpkhgmpbidmiogeglndfbkegfdlnajnf?hl=en',
    },
    {
      link: 'https://cosmostation.io/wallet/#extension',
    },
  ],
};
