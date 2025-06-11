import { AssetList, Chain } from "@chain-registry/types";
import { IGenericOfflineSigner } from "@interchainjs/types";
import { WalletAccount, SignType, Wallet } from "../types";
import { BaseWallet } from "./base-wallet";
import { isMobile } from "../utils";

type PlatformWalletType = "mobile-web" | "web";

export class PlatformWallet extends BaseWallet {

  currentPlatformWallet: BaseWallet | undefined;

  platformWalletMap: Map<PlatformWalletType, BaseWallet> = new Map();

  setPlatformWallet(platform: PlatformWalletType, wallet: BaseWallet) {
    this.platformWalletMap.set(platform, wallet);
  }

  setChainMap(chains: Chain[]): void {
    this.platformWalletMap.forEach((wallet) => {
      wallet.setChainMap(chains);
    });
  }

  setAssetLists(assetLists: AssetList[]): void {
    this.platformWalletMap.forEach((wallet) => {
      wallet.setAssetLists(assetLists);
    });
  }

  addAssetList(assetList: AssetList): void {
    this.platformWalletMap.forEach((wallet) => {
      wallet.addAssetList(assetList);
    });
  }

  addChain(chain: Chain): void {
    this.platformWalletMap.forEach((wallet) => {
      wallet.addChain(chain);
    });
  }

  async init(): Promise<void> {
    if (isMobile()) {
      this.currentPlatformWallet = this.platformWalletMap.get("mobile-web");
    } else {
      this.currentPlatformWallet = this.platformWalletMap.get("web");
    }
    if (!this.currentPlatformWallet) {
      throw new Error("No platform wallet set");
    }
    await this.currentPlatformWallet.init()
  }
  connect(chainId: Chain["chainId"]): Promise<void> {
    return this.currentPlatformWallet?.connect(chainId);
  }
  disconnect(chainId: Chain["chainId"]): Promise<void> {
    return this.currentPlatformWallet.disconnect(chainId);
  }
  getAccount(chainId: Chain["chainId"]): Promise<WalletAccount> {
    return this.currentPlatformWallet?.getAccount(chainId);
  }
  getOfflineSigner(chainId: Chain["chainId"], preferredSignType?: SignType): Promise<IGenericOfflineSigner> {
    return this.currentPlatformWallet.getOfflineSigner(chainId, preferredSignType);
  }
  addSuggestChain(chainId: Chain["chainId"]): Promise<void> {
    return this.currentPlatformWallet?.addSuggestChain(chainId);
  }
  getProvider(chainId: Chain["chainId"]): Promise<unknown> {
    return this.currentPlatformWallet.getProvider(chainId);
  }

}