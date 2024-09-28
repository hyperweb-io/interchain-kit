import { StationExtension } from './extension';
import { stationExtensionInfo } from "./registry";

export * from './extension'
export * from './registry'

const stationWallet = new StationExtension(stationExtensionInfo);

export { stationWallet }