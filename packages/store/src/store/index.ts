import { WalletState } from '@interchain-kit/core';

import { ChainWalletState, InterchainStoreType } from '../types';



export class InterchainStore {
  private state: InterchainStoreType;
  private listeners: Set<(state: InterchainStoreType) => void> = new Set();
  // 快速查找索引的 Map: walletName-chainName -> index
  private chainWalletIndexMap: Map<string, number> = new Map();

  constructor() {
    this.state = {
      currentWalletName: '',
      currentChainName: '',
      chainWalletStates: [],
      isReady: false,
      modalIsOpen: false,
      walletConnectQRCodeUri: '',
    };
  }

  // Get current state
  getState(): InterchainStoreType {
    return this.state;
  }

  // Subscribe to state changes
  subscribe(listener: (state: InterchainStoreType) => void): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Emit state changes to all listeners
  emit(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.state);
      } catch (error) {
        console.error('Error in store listener:', error);
      }
    });
  }

  // Update state and emit changes
  setState(newState: Partial<InterchainStoreType>): void {
    this.state = { ...this.state, ...newState };
    this.emit();
  }

  // Update partial state and emit changes
  updateState(partialState: Partial<InterchainStoreType>): void {
    this.state = { ...this.state, ...partialState };
    this.emit();
  }

  setCurrentChainName(chainName: string): void {
    this.setState({ ...this.state, currentChainName: chainName });
  }

  setCurrentWalletName(walletName: string): void {
    this.setState({ ...this.state, currentWalletName: walletName });
  }

  updateChainWalletState(walletName: string, chainName: string, state: Partial<ChainWalletState>): void {
    const key = `${walletName}-${chainName}`;
    const index = this.chainWalletIndexMap.get(key);
    if (index !== undefined) {
      // 直接通过索引更新，避免遍历
      const newChainWalletStates = [...this.state.chainWalletStates];
      newChainWalletStates[index] = { ...newChainWalletStates[index], ...state };
      this.setState({ ...this.state, chainWalletStates: newChainWalletStates });
    } else {
      this.addChainWalletState(walletName, chainName, state);
    }

    switch (state.walletState) {
      case WalletState.Connected:
        this.setCurrentWalletName(walletName);
        this.setCurrentChainName(chainName);
        break;
      case WalletState.Disconnected:
        if (this.state.currentWalletName === walletName && this.state.currentChainName === chainName) {
          // TODO: for supporting multiple wallet connections, 
          // we should set these to the previous instead of clearing
          this.setCurrentWalletName('');
          this.setCurrentChainName('');
        }
        break;
    }
  }

  // 添加新的 chain wallet state
  addChainWalletState(walletName: string, chainName: string, state: Partial<ChainWalletState>): void {
    const newChainWalletState = [...this.state.chainWalletStates];
    const newIndex = newChainWalletState.length;
    newChainWalletState.push({
      chainName,
      walletName,
      walletState: WalletState.Disconnected,
      rpcEndpoint: '', errorMessage: '', account: undefined, ...state
    });

    // 更新索引映射
    const key = `${walletName}-${chainName}`;
    this.chainWalletIndexMap.set(key, newIndex);

    this.setState({ ...this.state, chainWalletStates: newChainWalletState });
  }

  // 移除 chain wallet state
  removeChainWalletState(walletName: string, chainName: string): void {
    const key = `${walletName}-${chainName}`;
    const index = this.chainWalletIndexMap.get(key);
    if (index !== undefined) {
      const newChainWalletState = this.state.chainWalletStates.filter((_, i) => i !== index);

      // 重新构建索引映射
      this.chainWalletIndexMap.clear();
      newChainWalletState.forEach((item, i) => {
        const itemKey = `${item.walletName}-${item.chainName}`;
        this.chainWalletIndexMap.set(itemKey, i);
      });

      this.setState({ ...this.state, chainWalletStates: newChainWalletState });
    }
  }

  // 获取指定 chain 的 wallet state
  getChainWalletState(walletName: string, chainName: string): ChainWalletState | undefined {
    const key = `${walletName}-${chainName}`;
    const index = this.chainWalletIndexMap.get(key);
    return index !== undefined ? this.state.chainWalletStates[index] : undefined;
  }

  // 恢复索引映射（用于从localStorage恢复数据后重建索引）
  buildIndexMap(): void {
    this.chainWalletIndexMap.clear();
    this.state.chainWalletStates.forEach((item, index) => {
      const key = `${item.walletName}-${item.chainName}`;
      this.chainWalletIndexMap.set(key, index);
    });
  }

  updateWalletState(walletName: string, state: Partial<ChainWalletState>) {
    const newChainWalletStates = this.state.chainWalletStates.map(cws => {
      if (cws.walletName === walletName) {
        return { ...cws, ...state };
      }
      return cws;
    });
    this.setState({ chainWalletStates: newChainWalletStates });
  }

  isChainWalletStateExisted(walletName: string, chainName: string) {
    return this.chainWalletIndexMap.get(`${walletName}-${chainName}`) !== undefined;
  }
}



