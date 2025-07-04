import { WalletState } from '@interchain-kit/core';

import { ChainWalletState } from '../types/state';

// 工具函数：查找链钱包状态
export const findChainWalletState = (chainWalletStates: ChainWalletState[], walletName: string, chainName: string): ChainWalletState | undefined => {
  return chainWalletStates.find(cw => cw.walletName === walletName && cw.chainName === chainName);
};

// 工具函数：查找链钱包状态的索引
export const findChainWalletStateIndex = (chainWalletStates: ChainWalletState[], walletName: string, chainName: string): number => {
  return chainWalletStates.findIndex(cw => cw.walletName === walletName && cw.chainName === chainName);
};

// 工具函数：更新链钱包状态
export const updateChainWalletState = (chainWalletStates: ChainWalletState[], walletName: string, chainName: string, updates: Partial<ChainWalletState>): ChainWalletState[] => {
  const index = findChainWalletStateIndex(chainWalletStates, walletName, chainName);
  if (index === -1) return chainWalletStates;

  return [
    ...chainWalletStates.slice(0, index),
    { ...chainWalletStates[index], ...updates },
    ...chainWalletStates.slice(index + 1)
  ];
};

// 工具函数：添加链钱包状态
export const addChainWalletState = (chainWalletStates: ChainWalletState[], chainWalletState: ChainWalletState): ChainWalletState[] => {
  const existingIndex = findChainWalletStateIndex(chainWalletStates, chainWalletState.walletName, chainWalletState.chainName);
  if (existingIndex !== -1) {
    // 如果已存在，更新它
    return updateChainWalletState(chainWalletStates, chainWalletState.walletName, chainWalletState.chainName, chainWalletState);
  }
  // 如果不存在，添加它
  return [...chainWalletStates, chainWalletState];
};

// 工具函数：删除链钱包状态
export const removeChainWalletState = (chainWalletStates: ChainWalletState[], walletName: string, chainName: string): ChainWalletState[] => {
  const index = findChainWalletStateIndex(chainWalletStates, walletName, chainName);
  if (index === -1) return chainWalletStates;

  return [
    ...chainWalletStates.slice(0, index),
    ...chainWalletStates.slice(index + 1)
  ];
};

// 工具函数：获取钱包的所有链状态
export const getWalletChainStates = (chainWalletStates: ChainWalletState[], walletName: string): ChainWalletState[] => {
  return chainWalletStates.filter(cw => cw.walletName === walletName);
};

// 工具函数：获取链的所有钱包状态
export const getChainWalletStates = (chainWalletStates: ChainWalletState[], chainName: string): ChainWalletState[] => {
  return chainWalletStates.filter(cw => cw.chainName === chainName);
};

// 工具函数：计算钱包状态（基于所有链钱包状态）
export const calculateWalletState = (chainWalletStates: ChainWalletState[], walletName: string): WalletState => {
  const walletChainStates = getWalletChainStates(chainWalletStates, walletName);
  const walletStates = walletChainStates.map(chain => chain.walletState);

  let state: WalletState = WalletState.NotExist;

  // Check for Connecting state first - if any chain is connecting, return Connecting
  if (walletStates.some(state => state === WalletState.Connecting)) {
    state = WalletState.Connecting;
  }
  // Then check for Connected state - if any chain is connected, return Connected
  else if (walletStates.some(state => state === WalletState.Connected)) {
    state = WalletState.Connected;
  }
  // Then check if all chains are disconnected
  else if (walletStates.every(state => state === WalletState.Disconnected)) {
    state = WalletState.Disconnected;
  }

  return state;
};

// 工具函数：获取钱包的错误信息
export const getWalletErrorMessage = (chainWalletStates: ChainWalletState[], walletName: string): string | undefined => {
  const walletChainStates = getWalletChainStates(chainWalletStates, walletName);
  const errorMessages = walletChainStates
    .map(chain => chain.errorMessage)
    .filter(message => message !== undefined && message !== null);

  // 如果有任何链钱包有错误信息，返回第一个
  return errorMessages.length > 0 ? errorMessages[0] : undefined;
}; 