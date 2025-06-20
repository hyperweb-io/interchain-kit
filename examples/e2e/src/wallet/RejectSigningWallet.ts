import { Wallet } from "@interchain-kit/core";
import { MockCosmosWallet, MockMultiChainWallet } from "./mock-cosmos-wallet";

class RejectSigningWallet extends MockCosmosWallet {
  signDirect(chainId: string, signer: string, signDoc: any, signOptions?: any): Promise<any> {
    throw new Error('reject')
  }

}

const rejectSigningWalletInfo: Wallet = {
  windowKey: "signingMock",
  cosmosKey: "signingMockCosmos",
  name: "signingMockWallet",
  prettyName: "Signing Mock Wallet",
  mode: "extension",
}
const rejectSigningCosmosWallet = new RejectSigningWallet(
  rejectSigningWalletInfo,
  "reject reject reject reject reject reject reject reject reject reject reject reject"
);




export const rejectSigningWallet = new MockMultiChainWallet(rejectSigningWalletInfo)
rejectSigningWallet.setNetworkWallet('cosmos', rejectSigningCosmosWallet)

