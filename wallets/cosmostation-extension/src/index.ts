import { CosmostationExtension } from './extension';
import { cosmostationExtensionInfo } from "./registry";

export * from './extension'
export * from './registry'

const cosmostationWallet = new CosmostationExtension(cosmostationExtensionInfo);

export { cosmostationWallet }