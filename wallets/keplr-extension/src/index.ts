import { KeplrWallet } from "./extension";
import { keplrExtensionInfo } from "./registry";

export * from './extension'
export * from './registry'

const keplrWallet = new KeplrWallet(keplrExtensionInfo);

export { keplrWallet }
