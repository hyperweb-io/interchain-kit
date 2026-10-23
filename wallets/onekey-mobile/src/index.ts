import { WCMobileWebWallet } from '@interchain-kit/core';

import { OneKeyMobileInfo } from './registry';

export class OneKeyMobile extends WCMobileWebWallet {}

const onekeyMobile = new OneKeyMobile(OneKeyMobileInfo);

export { onekeyMobile };
