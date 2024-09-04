
import { WCWallet } from "@interchain-kit/core";
import { keplrMobileInfo } from "./registry";


export class KeplrMobile extends WCWallet { }

const keplrMobile = new KeplrMobile(keplrMobileInfo);

export { keplrMobile };
