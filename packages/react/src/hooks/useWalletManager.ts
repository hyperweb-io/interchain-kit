import { useEffect } from 'react';

import { useInterchainWalletContext } from '../provider';
import { useForceUpdate } from './useForceUpdate';

function bindAllMethods<T extends object>(obj: T): T {
  if (!obj) return obj;

  const boundObj = { ...obj };

  // 获取所有属性描述符（包括 getter/setter）
  const allPropertyNames = [
    ...Object.getOwnPropertyNames(obj),
    ...Object.getOwnPropertySymbols(obj)
  ];

  allPropertyNames.forEach((key) => {
    const descriptor = Object.getOwnPropertyDescriptor(obj, key);

    if (descriptor) {
      // 处理 getter
      if (descriptor.get) {
        Object.defineProperty(boundObj, key, {
          ...descriptor,
          get: descriptor.get.bind(obj)
        });
      }
      // 处理 setter
      else if (descriptor.set) {
        Object.defineProperty(boundObj, key, {
          ...descriptor,
          set: descriptor.set.bind(obj)
        });
      }
      // 处理普通函数
      else if (typeof descriptor.value === 'function') {
        (boundObj as any)[key] = descriptor.value.bind(obj);
      }
    }
  });

  // 处理原型链上的方法
  const prototype = Object.getPrototypeOf(obj);
  if (prototype && prototype !== Object.prototype) {
    const prototypePropertyNames = [
      ...Object.getOwnPropertyNames(prototype),
      ...Object.getOwnPropertySymbols(prototype)
    ];

    prototypePropertyNames.forEach((key) => {
      if (key === 'constructor') return;

      const descriptor = Object.getOwnPropertyDescriptor(prototype, key);

      if (descriptor) {
        // 处理原型上的 getter
        if (descriptor.get) {
          Object.defineProperty(boundObj, key, {
            ...descriptor,
            get: descriptor.get.bind(obj)
          });
        }
        // 处理原型上的 setter
        else if (descriptor.set) {
          Object.defineProperty(boundObj, key, {
            ...descriptor,
            set: descriptor.set.bind(obj)
          });
        }
        // 处理原型上的普通函数
        else if (typeof descriptor.value === 'function') {
          (boundObj as any)[key] = descriptor.value.bind(obj);
        }
      }
    });
  }

  return boundObj;
}

export const useWalletManager = () => {
  const walletManager = useInterchainWalletContext();
  const forceUpdate = useForceUpdate();
  useEffect(() => {
    const unsubscribeWM = walletManager.subscribe(() => forceUpdate());
    return () => unsubscribeWM();
  }, []);

  return bindAllMethods(walletManager);
};