import React, { ReactElement, useEffect, useRef } from "react";
import { createContext, useContext } from "react";
import {
  BaseWallet,
  SignerOptions,
  EndpointOptions,
  Config,
} from "@interchain-kit/core";
import { AssetList, Chain } from "@chain-registry/types";
import { WalletModalProps } from "./modal";
import { WalletStoreManager } from "@interchain-kit/store";
import { WalletModalProvider } from "./contexts";

type InterchainWalletContextType = WalletStoreManager;

type InterchainWalletProviderProps = {
  chains: Chain[];
  assetLists: AssetList[];
  wallets: BaseWallet[];
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
  // const [_, forceRender] = useState({});

  const config: Config = {
    chains,
    assetLists,
    wallets,
    signerOptions,
    endpointOptions,
  };

  const walletManager = new WalletStoreManager(config);

  const store = useRef(walletManager);

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
      "useInterChainWalletContext must be used within a InterChainProvider"
    );
  }
  return context;
};
