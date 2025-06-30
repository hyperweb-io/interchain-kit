import {
  createContext,
  useContext,
  useState,
  ReactNode,
  ReactElement,
} from "react";
import { WalletModalProps } from "../modal";
import { useWalletManager } from "../hooks";

interface WalletModalContextType {
  modalIsOpen: boolean;
  open: () => void;
  close: () => void;
}

const WalletModalContext = createContext<WalletModalContextType | undefined>(
  undefined
);

export function WalletModalProvider({
  children,
  walletModal: ProvidedWalletModal,
}: {
  children: ReactNode;
  walletModal: (props: WalletModalProps) => ReactElement;
}) {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = () => setModalIsOpen(true);
  const closeModal = () => setModalIsOpen(false);

  const { wallets, getWalletByName, currentWalletName, currentChainName } =
    useWalletManager();

  return (
    <WalletModalContext.Provider
      value={{ modalIsOpen, open: openModal, close: closeModal }}
    >
      {children}
      {ProvidedWalletModal && (
        <ProvidedWalletModal
          wallets={wallets}
          isOpen={modalIsOpen}
          open={openModal}
          close={closeModal}
          currentWallet={getWalletByName(
            currentWalletName
          )?.getChainWalletByChainName(currentChainName)}
        />
      )}
    </WalletModalContext.Provider>
  );
}

export function useWalletModal() {
  const context = useContext(WalletModalContext);
  if (context === undefined) {
    throw new Error("useWalletModal must be used within a WalletModalProvider");
  }
  return context;
}
