import { BaseWallet } from "@interchain-kit/core"

export const getWalletInfo = (wallet: BaseWallet) => {
  return {
    name: wallet.option.name,
    prettyName: wallet.option.prettyName,
    logo: wallet.option.logo as string,
    mobileDisabled: true,
  }
}