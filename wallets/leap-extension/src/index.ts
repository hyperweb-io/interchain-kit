
import { CosmosWallet, EthereumWallet, ExtensionWallet, PlatformWallet, selectWalletByPlatform, WCMobileWebWallet } from "@interchain-kit/core";
import { leapExtensionInfo } from "./registry";

class LeapCosmosWallet extends CosmosWallet {
  async connect(chainId: string | string[]): Promise<void> {
    await this.client.enable(chainId)
    const targetChain = Array.isArray(chainId) ? chainId : [chainId]
    const isConnected = await Promise.all(targetChain.map(async (chainId) => this.client.isConnected(chainId)))
    if (isConnected.every(c => c === true)) {
      return Promise.resolve()
    } else {
      throw (new Error('Failed to connect to Leap'))
    }
  }

  async disconnect(chainId: string | string[]): Promise<void> {
    const targetChain = Array.isArray(chainId) ? chainId : [chainId]
    await Promise.all(targetChain.map(async (chainId) => this.client.disconnect(chainId)))
  }
}




const web = new ExtensionWallet(leapExtensionInfo);
web.setNetworkWallet('cosmos', new CosmosWallet(leapExtensionInfo))
web.setNetworkWallet('eip155', new EthereumWallet(leapExtensionInfo))


const leapWallet = selectWalletByPlatform({
  mobileBrowser: new WCMobileWebWallet(leapExtensionInfo),
  inAppBrowser: web,
  desktopBrowser: web,
}, leapExtensionInfo)

export { leapWallet }