import { AssetList, Chain } from '@chain-registry/types';
import {
  Config,
  EndpointOptions,
  SignerOptions,
  UniWallet,
} from '@interchain-kit/core';
import { WalletStoreManager } from '@interchain-kit/store';
import React, { ReactElement, useEffect, useRef } from 'react';
import { createContext, useContext } from 'react';

import { WalletModalProvider } from './contexts';
import { WalletModalProps } from './modal';

type InterchainWalletContextType = WalletStoreManager;

type InterchainWalletProviderProps = {
  chains: Chain[];
  assetLists: AssetList[];
  wallets: UniWallet[];
  signerOptions?: SignerOptions;
  endpointOptions?: EndpointOptions;
  children: React.ReactNode;
  walletModal?: (props: WalletModalProps) => ReactElement;
};

const InterchainWalletContext =
  createContext<InterchainWalletContextType | null>(null);

export const ChainProvider = ({
  chains,
  assetLists,
  wallets,
  signerOptions,
  endpointOptions,
  children,
  walletModal: ProviderWalletModal,
}: InterchainWalletProviderProps) => {
  const config: Config = {
    chains,
    assetLists,
    wallets,
    signerOptions,
    endpointOptions,
  };

  const store = useRef(null);

  if (!store.current) {
    store.current = new WalletStoreManager(config);
  }

  useEffect(() => {
    store.current.init();
  }, []);

  return (
    <InterchainWalletContext.Provider value={store.current}>
      <WalletModalProvider walletModal={ProviderWalletModal}>
        {children}
      </WalletModalProvider>
    </InterchainWalletContext.Provider>
  );
};

export const useInterchainWalletContext = () => {
  const context = useContext(InterchainWalletContext);
  if (!context) {
    throw new Error(
      'useInterChainWalletContext must be used within a InterChainProvider'
    );
  }
  return context;
};
