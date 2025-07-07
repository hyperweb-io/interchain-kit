import { SignOptions } from '../types';
import { clientNotExistError, getClientFromExtension } from '../utils';
import { CosmosWallet } from './cosmos-wallet';
import { MultiChainWallet } from './multichain-wallet';

export class ExtensionWallet extends MultiChainWallet {
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
    const wallet = this.getWalletOfType(CosmosWallet);
    wallet.setSignOptions(options);
  }

}