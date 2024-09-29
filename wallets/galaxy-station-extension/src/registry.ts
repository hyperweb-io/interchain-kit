import { Wallet } from "@interchain-kit/core";
import { ICON } from "./constant";

export const galaxyStationExtensionInfo: Wallet = {
  windowKey: 'galaxyStation',
  name: 'galaxy-station-extension',
  prettyName: 'Galaxy Station',
  logo: ICON,
  mode: 'extension',
  keystoreChange: 'galaxy_station_keystorechange',
  downloads: [
    {
      device: 'desktop',
      browser: 'chrome',
      link: 'https://chromewebstore.google.com/detail/galaxy-station-wallet/akckefnapafjbpphkefbpkpcamkoaoai',
    },
  ],
};
