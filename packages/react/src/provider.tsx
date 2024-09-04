import React, { useEffect, useMemo, useState } from 'react';
import { createContext, useContext } from 'react';
import {
  BaseWallet,
  SignerOptions,
  WalletManager,
  EndpointOptions,
} from '@interChain-kit/core';
import { AssetList, Chain } from '@chain-registry/v2-types';
import { WalletModalProvider } from './modal';

type InterchainWalletContextType = {
  walletManager: WalletManager;
};

type InterchianWalletProviderProps = {
  chains: Chain[];
  assetLists: AssetList[];
  wallets: BaseWallet[];
  signerOptions: SignerOptions;
  endpointOptions: EndpointOptions;
  children: React.ReactNode;
};

const InterChainWalletContext =
  createContext<InterchainWalletContextType | null>(null);

export const ChainProvider = ({
  chains,
  assetLists,
  wallets,
  signerOptions,
  endpointOptions,
  children,
}: InterchianWalletProviderProps) => {
  const [_, forceRender] = useState({});

  const walletManager = useMemo(() => {
    return new WalletManager(
      chains,
      assetLists,
      wallets,
      signerOptions,
      endpointOptions,
      () => forceRender({})
    );
  }, []);

  useEffect(() => {
    walletManager.init();
  }, []);

  return (
    <InterChainWalletContext.Provider value={{ walletManager }}>
      <WalletModalProvider>{children}</WalletModalProvider>
    </InterChainWalletContext.Provider>
  );
};

export const useInterChainWalletContext = () => {
  const context = useContext(InterChainWalletContext);
  if (!context) {
    throw new Error(
      'useInterChainWalletContext must be used within a InterChainProvider'
    );
  }
  return context;
};
