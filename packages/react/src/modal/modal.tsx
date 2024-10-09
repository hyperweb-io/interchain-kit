import { ConnectModal } from "@interchain-ui/react";
import {
  ConnectedContent,
  ConnectedHeader,
  ConnectingContent,
  ConnectingHeader,
  QRCodeContent,
  QRCodeHeader,
  RejectContent,
  RejectHeader,
  WalletListContent,
  WalletListHeader,
} from "./views";
import { useWalletModal } from "./provider";
import { useCurrentWallet } from "../hooks";
import { useEffect, useState } from "react";
import { WalletState, WCWallet } from "@interchain-kit/core";

const defaultModalView = {
  header: <WalletListHeader />,
  content: <WalletListContent />,
};

export const WalletModal = () => {
  const { modalIsOpen, open, close } = useWalletModal();

  const currentWallet = useCurrentWallet();

  const [modalView, setModalView] = useState(defaultModalView);

  const gotoWalletList = () => setModalView(defaultModalView);

  useEffect(() => {
    switch (true) {
      case currentWallet?.option?.mode === "wallet-connect":
        setModalView({
          header: <QRCodeHeader onBack={gotoWalletList} />,
          content: <QRCodeContent />,
        });
        break;
      case currentWallet?.walletState === WalletState.Connecting:
        setModalView({
          header: <ConnectingHeader onBack={gotoWalletList} />,
          content: <ConnectingContent />,
        });
        break;
      case currentWallet?.walletState === WalletState.Connected:
        setModalView({
          header: <ConnectedHeader onBack={gotoWalletList} />,
          content: <ConnectedContent />,
        });
        break;
      case currentWallet?.walletState === WalletState.Reject:
        setModalView({
          header: <RejectHeader onBack={gotoWalletList} />,
          content: <RejectContent />,
        });
        break;
      default:
        setModalView(defaultModalView);
    }
  }, [currentWallet, currentWallet?.walletState]);

  return (
    <ConnectModal
      isOpen={modalIsOpen}
      header={modalView.header}
      onOpen={open}
      onClose={close}
    >
      {modalView.content}
    </ConnectModal>
  );
};
