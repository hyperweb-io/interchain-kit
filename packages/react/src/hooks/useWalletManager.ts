import { useEffect } from 'react';
import { useInterchainWalletContext } from '../provider';
import { useForceUpdate } from './useForceUpdate';

function bindAllMethods<T extends object>(obj: T): T {
  if (!obj) return obj;

  const boundObj = { ...obj };

  Object.getOwnPropertyNames(Object.getPrototypeOf(obj)).forEach((key) => {
    const value = (obj as any)[key];
    if (typeof value === 'function' && key !== 'constructor') {
      (boundObj as any)[key] = value.bind(obj);
    }
  });

  Object.entries(obj).forEach(([key, value]) => {
    if (typeof value === 'function') {
      (boundObj as any)[key] = value.bind(obj);
    }
  });

  return boundObj;
}

export const useWalletManager = () => {
  const walletManager = useInterchainWalletContext();
  const forceUpdate = useForceUpdate();
  useEffect(() => {
    const unsubscribeWM = walletManager.subscribe(() => forceUpdate());

    const unsubscribeWalletControllers: (() => void)[] = [];
    const unsubscribeChainWalletControllers: (() => void)[] = [];

    walletManager.wallets.forEach((wallet) => {
      wallet.chainWallets.forEach((chainWallet) => {
        const chainUnsubscribe = chainWallet.subscribe(() => forceUpdate());
        unsubscribeChainWalletControllers.push(chainUnsubscribe);
      });
    });

    return () => {
      unsubscribeWM();
      unsubscribeWalletControllers.forEach((unsubscribe) => unsubscribe());
      unsubscribeChainWalletControllers.forEach((unsubscribe) => unsubscribe());
    };
  }, [])
  return bindAllMethods(walletManager);
};