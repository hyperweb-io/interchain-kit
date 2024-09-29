import { GalaxyStationExtension } from './extension';
import { galaxyStationExtensionInfo } from "./registry";

export * from './extension'
export * from './registry'

const galaxyStationWallet = new GalaxyStationExtension(galaxyStationExtensionInfo);

export { galaxyStationWallet }