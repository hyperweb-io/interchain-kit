import { LeapWallet } from "./extension";
import { leapExtensionInfo } from "./registry";


const leapWallet = new LeapWallet(leapExtensionInfo);

export { leapWallet }
