import { ConnectModalHead, ConnectModalStatus } from "@interchain-ui/react";
import { useWalletModal } from "../provider";
import { useCurrentWallet, useWalletManager } from "../../hooks";
import { getWalletInfo } from "../../utils";

export const RejectHeader = ({ onBack }: { onBack: () => void }) => {
  const { close } = useWalletModal();
  const currentWallet = useCurrentWallet();
  return (
    <ConnectModalHead
      title={currentWallet.option.prettyName}
      hasBackButton={true}
      onClose={close}
      onBack={onBack}
      closeButtonProps={{ onClick: close }}
    />
  );
};

export const RejectContent = () => {
  const currentWallet = useCurrentWallet();

  const walletManager = useWalletManager();

  const { close } = useWalletModal();

  return (
    <ConnectModalStatus
      status="Rejected"
      wallet={getWalletInfo(currentWallet)}
      contentHeader={"Request Rejected"}
      contentDesc={
        currentWallet.errorMessage || "Connection permission is denied."
      }
      onConnect={() =>
        walletManager.connect(currentWallet.option.name).then(close)
      }
    />
  );
};
