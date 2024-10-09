import { TrustExtension } from './extension';
import { trustExtensionInfo } from "./registry";

export * from './extension'
export * from './registry'

const trustWallet = new TrustExtension(trustExtensionInfo);

export { trustWallet }