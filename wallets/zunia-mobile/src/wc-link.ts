import { isAndroid, isIOS } from '@interchain-kit/core';

/** Android application id from the Zunia mobile manifest. */
export const ZUNIA_ANDROID_PACKAGE = 'com.zuniawallet.zunia_mobile';

/**
 * Methods the Zunia app registers for a Cosmos WalletConnect session.
 * Kept in this order so a dApp session matches the wallet.
 */
export const ZUNIA_COSMOS_WC_METHODS = [
  'cosmos_getAccounts',
  'cosmos_signAmino',
  'cosmos_signDirect',
  'cosmos_signArbitrary',
] as const;

export const ZUNIA_COSMOS_WC_EVENTS = ['accountsChanged', 'chainChanged'] as const;

/**
 * Same templates `WCMobileWebWallet` fills. `{wc-uri}` is replaced with an encoded `wc:` URI.
 * The app reads the `uri` query. A bare `zunia://wcV2?<wc-uri>` does not pair.
 */
export const ZUNIA_WC_LINK = {
  android: `intent://wc?uri={wc-uri}#Intent;package=${ZUNIA_ANDROID_PACKAGE};scheme=zunia;end;`,
  ios: 'zunia://wc?uri={wc-uri}',
};

export function zuniaWalletConnectUrlFor(os: 'android' | 'ios', wcUri: string): string {
  return ZUNIA_WC_LINK[os].replace('{wc-uri}', encodeURIComponent(wcUri));
}

/** Deep link for the current phone browser. Desktop keeps the QR code. */
export function zuniaWalletConnectUrl(wcUri: string): string | undefined {
  if (typeof window === 'undefined') return undefined;
  if (isAndroid()) return zuniaWalletConnectUrlFor('android', wcUri);
  if (isIOS()) return zuniaWalletConnectUrlFor('ios', wcUri);
  return undefined;
}
