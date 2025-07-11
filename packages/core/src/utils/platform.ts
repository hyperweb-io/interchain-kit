import { Wallet } from "../types";
import { BaseWallet, ExtensionWallet, WCMobileWebWallet } from "../wallets";

export const isServer = () => typeof window === 'undefined';

export const isMobile = () => {
  if (isServer()) return false; // Avoid checking user agent on server-side
  const userAgent = navigator.userAgent || navigator.vendor
  return (
    /android/i.test(userAgent) ||
    /iPad|iPhone|iPod/.test(userAgent)
  );
}

export const isAndroid = () => {
  if (isServer()) return false; // Avoid checking user agent on server-side
  const userAgent = navigator.userAgent || navigator.vendor
  return /android/i.test(userAgent);
}

export const isIOS = () => {
  if (isServer()) return false; // Avoid checking user agent on server-side
  const userAgent = navigator.userAgent || navigator.vendor
  return /iPad|iPhone|iPod/.test(userAgent);
}

export type PlatformTypes = 'inAppBrowser' | 'mobileBrowser' | 'desktopBrowser'


export type PlatformWallet = WCMobileWebWallet | ExtensionWallet

export type PlatformWalletMap = Record<PlatformTypes, PlatformWallet>

export const selectWalletByPlatform = (
  walletPlatformMap: PlatformWalletMap, walletInfo: Wallet
): BaseWallet => {
  if (isMobile()) {
    if ((window as any)[walletInfo.windowKey]) {
      return walletPlatformMap['inAppBrowser']
    } else {
      return walletPlatformMap['mobileBrowser']
    }
  }
  return walletPlatformMap['desktopBrowser']
};