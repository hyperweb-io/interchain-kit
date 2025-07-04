import { WalletState } from '@interchain-kit/core';

import { ChainWalletState } from '../../src/types/state';
import * as utils from '../../src/utils/flat-state-utils';

describe('flat-state-utils', () => {
  const baseState: ChainWalletState[] = [
    { walletName: 'w1', chainName: 'c1', walletState: WalletState.NotExist, account: null as any, errorMessage: null, rpcEndpoint: '' },
    { walletName: 'w1', chainName: 'c2', walletState: WalletState.Disconnected, account: null as any, errorMessage: null, rpcEndpoint: '' },
    { walletName: 'w2', chainName: 'c1', walletState: WalletState.Connected, account: null as any, errorMessage: 'err', rpcEndpoint: '' },
  ];
  it('findChainWalletState returns correct state', () => {
    expect(utils.findChainWalletState(baseState as any, 'w1', 'c1')).toEqual(baseState[0]);
    expect(utils.findChainWalletState(baseState as any, 'w2', 'c2')).toBeUndefined();
  });

  it('findChainWalletStateIndex returns correct index', () => {
    expect(utils.findChainWalletStateIndex(baseState as any, 'w1', 'c2')).toBe(1);
    expect(utils.findChainWalletStateIndex(baseState as any, 'w2', 'c2')).toBe(-1);
  });

  it('updateChainWalletState updates state', () => {
    const updated = utils.updateChainWalletState(baseState, 'w1', 'c2', { walletState: WalletState.Connected });
    expect(updated[1].walletState).toBe(WalletState.Connected);
    expect(updated[0].walletState).toBe(WalletState.NotExist);
  });

  it('addChainWalletState adds or updates', () => {
    // Use 'null as any' for account to match ChainWalletState type
    const newState: ChainWalletState = { walletName: 'w3', chainName: 'c3', walletState: WalletState.Connected, account: null as any, errorMessage: undefined, rpcEndpoint: '' };
    const added = utils.addChainWalletState(baseState, newState);
    expect(added.length).toBe(4);
    const updated = utils.addChainWalletState(baseState, { ...baseState[0], walletState: WalletState.Connected });
    expect(updated[0].walletState).toBe(WalletState.Connected);
  });

  it('removeChainWalletState removes state', () => {
    const removed = utils.removeChainWalletState(baseState, 'w1', 'c2');
    expect(removed.length).toBe(2);
    expect(removed.find(s => s.chainName === 'c2')).toBeUndefined();
  });

  it('getWalletChainStates filters by wallet', () => {
    expect(utils.getWalletChainStates(baseState, 'w1').length).toBe(2);
  });

  it('getChainWalletStates filters by chain', () => {
    expect(utils.getChainWalletStates(baseState, 'c1').length).toBe(2);
  });

  it('calculateWalletState returns correct aggregate', () => {
    expect(utils.calculateWalletState(baseState, 'w1')).toBe(WalletState.NotExist);
    const connecting = utils.calculateWalletState([
      { ...baseState[0], walletState: WalletState.Connecting },
      { ...baseState[1], walletState: WalletState.Disconnected },
    ], 'w1');
    expect(connecting).toBe(WalletState.Connecting);
    const connected = utils.calculateWalletState([
      { ...baseState[0], walletState: WalletState.Connected },
      { ...baseState[1], walletState: WalletState.Disconnected },
    ], 'w1');
    expect(connected).toBe(WalletState.Connected);
  });

  it('getWalletErrorMessage returns first error', () => {
    expect(utils.getWalletErrorMessage(baseState, 'w2')).toBe('err');
    expect(utils.getWalletErrorMessage(baseState, 'w1')).toBeUndefined();
  });
}); 