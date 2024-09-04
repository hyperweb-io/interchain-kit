import { WCWallet } from "@interchain-kit/core";
import { LeapMobileInfo } from "./registry";

export class LeapMobile extends WCWallet { }

const leapMobile = new LeapMobile(LeapMobileInfo);

export { leapMobile };
