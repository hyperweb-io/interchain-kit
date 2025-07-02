import { SignOptions } from '../types';
import { clientNotExistError, getClientFromExtension, isInstanceOf } from '../utils';
import { CosmosWallet } from './cosmos-wallet';
import { MultiChainWallet, WalletMap } from './multichain-wallet';

export class ExtensionWallet extends MultiChainWallet<WalletMap> {
  constructor(info: any) {
    super(info);
  }

  async init() {
    const walletIdentify = await getClientFromExtension(this.info.windowKey);
    if (!walletIdentify) {
      throw clientNotExistError;
    }
    await super.init();
  }

  setSignOptions(options: SignOptions) {
    const wallet = this.getWalletByChainType('cosmos');
    if (isInstanceOf(wallet, CosmosWallet)) {
      wallet.setSignOptions();
    }
  }

}