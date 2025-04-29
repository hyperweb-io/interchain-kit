import { SignOptions, WalletState } from "../types";
import { clientNotExistError, getClientFromExtension, isInstanceOf } from "../utils";
import { CosmosWallet } from "./cosmos-wallet";
import { MultiChainWallet } from "./multichain-wallet";

export class ExtensionWallet extends MultiChainWallet {
  async init() {
    try {
      const walletIdentify = await getClientFromExtension(this.info.walletIdentifyKey)

      this.client = await getClientFromExtension(this.info.windowKey)

      await super.init();

    } catch (error) {
      this.errorMessage = (error as any).message
      if (error instanceof Error && error.message === clientNotExistError.message) {
        this.walletState = WalletState.NotExist
      }
      throw error
    }


  }

  setSignOptions(options: SignOptions) {
    const wallet = this.getWalletByChainType('cosmos')
    if (isInstanceOf(wallet, CosmosWallet)) {
      wallet.setSignOptions(options)
    }
  }

}
