import { ZuniaWCCosmosWallet } from './cosmos';
import { zuniaMobileInfo } from './registry';
import { ZuniaMobileWallet } from './wallet';

export * from './registry';
export * from './wc-link';

const zuniaMobile = new ZuniaMobileWallet(zuniaMobileInfo);
zuniaMobile.setNetworkWallet('cosmos', new ZuniaWCCosmosWallet());

export { zuniaMobile };
