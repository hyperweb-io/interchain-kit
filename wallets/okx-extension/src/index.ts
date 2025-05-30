import { OkxwalletExtensionInfo } from "./registry"
import { CosmosWallet, EthereumWallet, ExtensionWallet, PlatformWallet, selectWalletByPlatform, WCMobileWebWallet } from '@interchain-kit/core';

const web = new ExtensionWallet(OkxwalletExtensionInfo)

web.setNetworkWallet('cosmos', new CosmosWallet(OkxwalletExtensionInfo))
web.setNetworkWallet('eip155', new EthereumWallet(OkxwalletExtensionInfo))

const okxWallet = selectWalletByPlatform({
    mobileBrowser: new WCMobileWebWallet(OkxwalletExtensionInfo),
    inAppBrowser: web,
    desktopBrowser: web,
}, OkxwalletExtensionInfo)

export { okxWallet }