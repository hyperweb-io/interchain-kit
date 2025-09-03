import { DownloadInfo, WalletState } from "@interchain-kit/core";
import {
  ConnectModal,
  ThemeProvider,
  ThemeProviderProps,
  Wallet as InterchainUIWalletType,
} from "@interchain-ui/react";
import { ReactElement, useMemo, useState } from "react";

import { useWalletManager } from "../hooks";
import { transferToWalletUISchema } from "../utils";
import {
  ConnectedContent,
  ConnectedHeader,
  ConnectingContent,
  ConnectingHeader,
  ErrorContent,
  ErrorHeader,
  NotExistContent,
  NotExistHeader,
  QRCodeContent,
  QRCodeHeader,
  RejectContent,
  RejectHeader,
  WalletListContent,
  WalletListHeader,
} from "./views";
import { ChainWalletState } from "@interchain-kit/store/types";
import { WalletStore } from "@interchain-kit/store/wallet-manager/wallet-store";

export type WalletModalProps = {
  isOpen: boolean;
  wallets: WalletStore[];
  currentWallet?: WalletStore;
  open: () => void;
  close: () => void;
};

export type InterchainWalletModalProps = {
  modalContainerClassName?: string;
  modalContentClassName?: string;
  modalChildrenClassName?: string;
  modalContentStyles?: React.CSSProperties;
  modalThemeProviderProps?: ThemeProviderProps;
};

export const InterchainWalletModal = ({
  // ==== Custom modal styles
  modalContainerClassName,
  modalContentClassName,
  modalChildrenClassName,
  modalContentStyles,
  modalThemeProviderProps,
}: InterchainWalletModalProps) => {
  const [shouldShowList, setShouldShowList] = useState(false);

  const {
    modalIsOpen: isOpen,
    walletConnectQRCodeUri,
    wallets: statefulWallets,
    getChainWalletState,
    currentWalletName,
    currentChainName,
    openModal: open,
    closeModal: close,
    chains,
    setCurrentWalletName,
    getDownloadLink,
    getEnv,
  } = useWalletManager();

  const [walletToConnect, setWalletToConnect] = useState<WalletStore | null>(
    null
  );

  const walletsForUI = statefulWallets.map((w) => transferToWalletUISchema(w));

  const chainNameToConnect = currentChainName || chains[0].chainName;

  const chainToConnect = chains.find(
    (chain) => chain.chainName === chainNameToConnect
  );

  const currentWallet = statefulWallets.find(
    (w) => w.info.name === currentWalletName
  );

  const walletToShow = walletToConnect || currentWallet;

  const { account, errorMessage } =
    getChainWalletState(
      walletToConnect?.info?.name || currentWalletName,
      currentChainName
    ) || ({} as ChainWalletState);

  const disconnect = () => {
    walletToShow.disconnect(chainToConnect.chainId);
  };

  const onSelectWallet = (wallet: WalletStore) => {
    setWalletToConnect(wallet);
    setShouldShowList(false);
    return wallet.connect(chainToConnect.chainId);
  };

  const onBack = () => setShouldShowList(true);

  const handleCloseModal = () => {
    close();
    setShouldShowList(false);
  };

  const onReconnect = () => {
    currentWallet.connect(chainToConnect.chainId);
  };
  return (
    <ThemeProvider {...modalThemeProviderProps}>
      <WalletModalElement
        shouldShowList={shouldShowList}
        username={account?.username}
        address={account?.address}
        disconnect={disconnect}
        isOpen={isOpen}
        open={open}
        close={handleCloseModal}
        wallets={walletsForUI}
        walletConnectQRCodeUri={walletConnectQRCodeUri}
        currentWallet={walletToShow}
        isConnecting={walletToShow?.walletState === WalletState.Connecting}
        isConnected={walletToShow?.walletState === WalletState.Connected}
        isRejected={walletToShow?.walletState === WalletState.Rejected}
        isDisconnected={walletToShow?.walletState === WalletState.Disconnected}
        isNotExist={walletToShow?.walletState === WalletState.NotExist}
        errorMessage={errorMessage}
        onSelectWallet={(w) => onSelectWallet(w)}
        onBack={() => setShouldShowList(true)} // Add other required props with appropriate default or mock values
        onReconnect={() => onSelectWallet(walletToShow)}
        getDownloadLink={() => getDownloadLink(walletToShow?.info.name)}
        getEnv={getEnv}
        modalContainerClassName={modalContainerClassName}
        modalContentClassName={modalContentClassName}
        modalChildrenClassName={modalChildrenClassName}
        modalContentStyles={modalContentStyles}
        modalThemeProviderProps={modalThemeProviderProps}
      />
    </ThemeProvider>
  );
};

export type WalletModalElementProps = {
  shouldShowList: boolean;
  isOpen: boolean;
  walletConnectQRCodeUri: string | null;
  wallets: InterchainUIWalletType[];
  username: string;
  address: string;
  currentWallet?: WalletStore;
  isConnecting: boolean;
  isConnected: boolean;
  isRejected: boolean;
  isDisconnected: boolean;
  isNotExist: boolean;
  errorMessage: string;
  open: () => void;
  close: () => void;
  disconnect: () => void;
  onSelectWallet: (wallet: WalletStore) => void;
  onBack: () => void;
  onReconnect: () => void;
  getDownloadLink: (walletName: string) => DownloadInfo;
  getEnv: () => { browser?: string; device?: string; os?: string };

  modalThemeProviderProps?: ThemeProviderProps;
  modalContainerClassName?: string;
  modalContentClassName?: string;
  modalChildrenClassName?: string;
  modalContentStyles?: React.CSSProperties;
};

export const WalletModalElement = ({
  shouldShowList,
  isOpen,
  walletConnectQRCodeUri,
  wallets,
  username,
  address,
  currentWallet,
  isConnecting,
  isConnected,
  isRejected,
  isDisconnected,
  isNotExist,
  errorMessage,
  open,
  close,
  disconnect,
  onSelectWallet,
  onBack,
  onReconnect,
  getDownloadLink,
  getEnv,

  modalThemeProviderProps,
  modalContainerClassName,
  modalContentClassName,
  modalChildrenClassName,
  modalContentStyles,
}: WalletModalElementProps) => {
  const { header, content } = useMemo(() => {
    if (
      shouldShowList ||
      (isDisconnected && currentWallet.errorMessage === "")
    ) {
      return {
        header: <WalletListHeader close={close} />,
        content: (
          <WalletListContent
            onSelectWallet={onSelectWallet}
            wallets={wallets}
          />
        ),
      };
    }
    if (
      currentWallet &&
      walletConnectQRCodeUri &&
      currentWallet.info.name === "WalletConnect"
    ) {
      return {
        header: (
          <QRCodeHeader wallet={currentWallet} close={close} onBack={onBack} />
        ),
        content: (
          <QRCodeContent
            walletConnectQRCodeUri={walletConnectQRCodeUri}
            errorMessage={errorMessage}
            onReconnect={onReconnect}
          />
        ),
      };
    }
    if (currentWallet && isNotExist) {
      return {
        header: (
          <NotExistHeader
            wallet={currentWallet}
            close={close}
            onBack={onBack}
          />
        ),
        content: (
          <NotExistContent
            wallet={currentWallet}
            getDownloadLink={getDownloadLink}
            getEnv={getEnv}
          />
        ),
      };
    }
    if (currentWallet && isRejected) {
      return {
        header: (
          <RejectHeader wallet={currentWallet} close={close} onBack={onBack} />
        ),
        content: (
          <RejectContent wallet={currentWallet} onReconnect={onReconnect} />
        ),
      };
    }
    if (currentWallet && currentWallet.errorMessage) {
      return {
        header: (
          <ErrorHeader wallet={currentWallet} close={close} onBack={onBack} />
        ),
        content: <ErrorContent wallet={currentWallet} onBack={onBack} />,
      };
    }
    if (currentWallet && isConnected) {
      return {
        header: (
          <ConnectedHeader
            wallet={currentWallet}
            onBack={onBack}
            close={close}
          />
        ),
        content: (
          <ConnectedContent
            wallet={currentWallet}
            username={username}
            address={address}
            disconnect={disconnect}
          />
        ),
      };
    }
    if (currentWallet && isConnecting) {
      return {
        header: (
          <ConnectingHeader
            wallet={currentWallet}
            close={close}
            onBack={onBack}
          />
        ),
        content: <ConnectingContent wallet={currentWallet} />,
      };
    }
    return {
      header: <WalletListHeader close={close} />,
      content: (
        <WalletListContent onSelectWallet={onSelectWallet} wallets={wallets} />
      ),
    };
  }, [
    currentWallet?.info?.name,
    isConnected,
    isConnecting,
    address,
    shouldShowList,
    walletConnectQRCodeUri,
    wallets,
    isOpen,
  ]);

  return (
    <ConnectModal
      isOpen={isOpen}
      header={header}
      onOpen={open}
      onClose={close}
      modalContainerClassName={modalContainerClassName}
      modalContentClassName={modalContentClassName}
      modalChildrenClassName={modalChildrenClassName}
      modalContentStyles={modalContentStyles}
    >
      {content}
    </ConnectModal>
  );
};

export const ModalRenderer = ({
  walletModal: ProvidedWalletModal,
}: {
  walletModal: (props: WalletModalProps) => ReactElement;
}) => {
  if (!ProvidedWalletModal) {
    return null;
  }

  const { modalIsOpen, openModal, closeModal, wallets, currentWalletName } =
    useWalletManager();

  return (
    <ProvidedWalletModal
      wallets={wallets}
      isOpen={modalIsOpen}
      open={openModal}
      close={closeModal}
      currentWallet={wallets.find((w) => w.info.name === currentWalletName)}
    />
  );
};
