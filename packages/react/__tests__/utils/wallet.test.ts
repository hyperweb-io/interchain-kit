import { BaseWallet } from '@interchain-kit/core';

import { getWalletInfo, transferToWalletUISchema } from '../../src/utils/wallet';
import { MockWalletConnect } from '../helpers/mock-wallet';

describe('getWalletInfo', () => {
  it('should return wallet info correctly', () => {
    const mockWallet: BaseWallet = {
      info: {
        name: 'Test Wallet',
        prettyName: 'Test Wallet Pretty',
        logo: 'test-logo.png',
      },
    } as BaseWallet;

    const result = getWalletInfo(mockWallet);

    expect(result).toEqual({
      name: 'Test Wallet',
      prettyName: 'Test Wallet Pretty',
      logo: 'test-logo.png',
      mobileDisabled: true,
    });
  });

  it('should handle undefined wallet info gracefully', () => {
    const mockWallet: BaseWallet = {} as BaseWallet;

    const result = getWalletInfo(mockWallet);

    expect(result).toEqual({
      name: undefined,
      prettyName: undefined,
      logo: undefined,
      mobileDisabled: true,
    });
  });
});

describe('transferToWalletUISchema', () => {
  it('should return schema for WCWallet with session', () => {
    const mockWCWallet: MockWalletConnect = {
      info: {
        name: 'WC Wallet',
        prettyName: 'WC Wallet Pretty',
        logo: 'wc-logo.png',
        mode: 'wallet-connect'
      },
      session: {
        peer: {
          metadata: {
            name: 'WC Peer',
            icons: ['wc-peer-icon.png'],
            description: 'WC Peer Description',
            url: 'https://wc-peer.com',
          },
          publicKey: 'wc-peer-public-key',
        },
      },
    } as MockWalletConnect;

    const result = transferToWalletUISchema(mockWCWallet);

    expect(result).toEqual({
      name: 'WC Peer',
      prettyName: 'WC Peer - Mobile',
      logo: 'wc-peer-icon.png',
      mobileDisabled: true,
      shape: 'list',
      originalWallet: { ...mockWCWallet, session: mockWCWallet.session },
      subLogo: 'wc-logo.png',
    });
  });

  it('should return schema for BaseWallet without session', () => {
    const mockWallet: BaseWallet = {
      info: {
        name: 'Base Wallet',
        prettyName: 'Base Wallet Pretty',
        logo: 'base-logo.png',
      },
    } as BaseWallet;

    const result = transferToWalletUISchema(mockWallet);

    expect(result).toEqual({
      name: 'Base Wallet',
      prettyName: 'Base Wallet Pretty',
      logo: 'base-logo.png',
      mobileDisabled: true,
      shape: 'list',
      originalWallet: mockWallet,
    });
  });
});