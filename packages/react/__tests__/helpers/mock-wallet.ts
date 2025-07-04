import { BaseWallet } from '@interchain-kit/core';

export class MockWallet extends BaseWallet {
  init = jest.fn();
  connect = jest.fn();
  disconnect = jest.fn();
  getAccount = jest.fn();
  getOfflineSigner = jest.fn();
  addSuggestChain = jest.fn();
  getProvider = jest.fn();
  sign = jest.fn();
}

export class MockWalletConnect extends BaseWallet {
  session?: any;

  init = jest.fn();
  connect = jest.fn();
  disconnect = jest.fn();
  getAccount = jest.fn();
  getOfflineSigner = jest.fn();
  addSuggestChain = jest.fn();
  getProvider = jest.fn();
  sign = jest.fn();
}

export class MockStatefulWallet extends BaseWallet {
  init = jest.fn();
  connect = jest.fn();
  disconnect = jest.fn();
  getAccount = jest.fn();
  getOfflineSigner = jest.fn();
  addSuggestChain = jest.fn();
  getProvider = jest.fn();
  setState = jest.fn();
  sign = jest.fn();
}