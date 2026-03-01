import { CosmosWallet, ExtensionWallet } from '@interchain-kit/core';

import { stationExtensionInfo } from './registry';


export * from './registry';

const stationWallet = new ExtensionWallet(stationExtensionInfo);

class StationCosmosWallet extends CosmosWallet {
  async getOfflineSigner(chainId: string) {
    return this.client.getOfflineSigner(chainId);
  }
}


stationWallet.setNetworkWallet('cosmos', new StationCosmosWallet(stationExtensionInfo));

export { stationWallet };