/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';

import { ChainWalletState, WalletStore } from '@interchain-kit/store';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import {
  WalletModalElement,
  WalletModalElementProps,
} from '../../src/modal/modal';
import { transferToWalletUISchema } from '../../src/utils';
import { MockWallet } from '../helpers/mock-wallet';

describe('WalletModal', () => {
  const mockWallet = new MockWallet({
    name: 'Test Wallet',
    prettyName: 'Test Wallet',
    mode: 'extension',
  });

  const mockStoreManager = {
    state: {
      proxy: {
        chainWalletStates: [] as ChainWalletState[],
      },
    },
  } as any;

  const mockWalletStore = new WalletStore(
    mockWallet as any,
    [{ chainName: 'test-chain', chainType: 'cosmos' as const }],
    {} as any,
    mockStoreManager as any
  );

  const mockProps: WalletModalElementProps = {
    shouldShowList: false,
    isOpen: true,
    walletConnectQRCodeUri: null,
    wallets: [transferToWalletUISchema(mockWallet)] as any,
    username: 'test-user',
    address: 'test-address',
    currentWallet: mockWalletStore,
    isConnecting: false,
    isConnected: false,
    isRejected: false,
    isDisconnected: false,
    isNotExist: false,
    errorMessage: '',
    open: jest.fn(),
    close: jest.fn(),
    disconnect: jest.fn(),
    onSelectWallet: jest.fn(),
    onBack: jest.fn(),
    onReconnect: jest.fn(),
    getDownloadLink: jest.fn(),
    getEnv: jest.fn(),
    modalThemeProviderProps: {},
  };

  it('renders WalletList when shouldShowList is true', () => {
    render(<WalletModalElement {...mockProps} shouldShowList={true} />);
    expect(screen.getByText('Select your wallet')).toBeInTheDocument();
  });

  it('renders QRCodeContent when walletConnectQRCodeUri is provided', () => {
    render(
      <WalletModalElement
        {...mockProps}
        walletConnectQRCodeUri="wc:8a74e2cfb093524dbba0cbdd616909108c6cef30363f560b2853daeadbf345fb@2?relay-protocol=irn&symKey=5ea13e76bd30c736a5c5e33ee58c9f8e314036a0b7390ac18986bc2949d5c340&expiryTimestamp=1743361685"
        currentWallet={
          { name: 'Test Wallet', info: { name: 'WalletConnect' } } as any
        }
      />
    );
    expect(screen.getByText('Open App to connect')).toBeInTheDocument();
  });

  it('renders NotExistContent when isNotExist is true', () => {
    render(<WalletModalElement {...mockProps} isNotExist={true} />);
    expect(screen.getByText(`Test Wallet Not Installed`)).toBeInTheDocument();
  });

  it('renders RejectContent when isRejected is true', () => {
    render(<WalletModalElement {...mockProps} isRejected={true} />);
    expect(screen.getByText('Request Rejected')).toBeInTheDocument();
  });

  it('renders ConnectedContent when isConnected is true', () => {
    render(<WalletModalElement {...mockProps} isConnected={true} />);
    expect(screen.getByText('Test Wallet')).toBeInTheDocument();
  });

  it('renders ConnectingContent when isConnecting is true', () => {
    render(<WalletModalElement {...mockProps} isConnecting={true} />);
    expect(screen.getByText('Requesting Connection')).toBeInTheDocument();
  });

  // it("calls close function when modal is closed", () => {
  //   render(<WalletModalElement {...mockProps} isConnected={true} />);
  //   fireEvent.click(screen.getByRole("button", { name: /close/i }));
  //   expect(mockProps.close).toHaveBeenCalled();
  // });

  it('calls onSelectWallet when a wallet is selected', () => {
    render(
      <WalletModalElement
        {...mockProps}
        shouldShowList={true}
        currentWallet={undefined}
        wallets={[
          {
            name: 'Test Wallet',
            prettyName: 'Test Wallet',
            shape: 'list',
            originalWallet: {
              info: { name: 'Test Wallet', prettyName: 'Test Wallet' },
            },
          } as any,
        ]}
      />
    );
    fireEvent.click(screen.getByText('Test Wallet'));
    expect(mockProps.onSelectWallet).toHaveBeenCalled();
  });
});
