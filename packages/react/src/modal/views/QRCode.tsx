import { ConnectModalHead, ConnectModalQRCode } from "@interchain-ui/react";
import { WCWallet } from "@interchain-kit/core";
import { useActiveWallet, useWalletManager } from "../../hooks";
import { useWalletModal } from "../provider";

export const QRCodeHeader = () => {
  const activeWallet = useActiveWallet();
  const { close } = useWalletModal();
  return (
    <ConnectModalHead
      title={activeWallet?.option?.prettyName || ""}
      hasBackButton={true}
      onClose={() => void 0}
      onBack={() => void 0}
      closeButtonProps={{ onClick: close }}
    />
  );
};
export const QRCodeContent = () => {
  const activeWallet = useActiveWallet() as WCWallet;
  const walletManager = useWalletManager();
  const data = activeWallet.pairingUri;

  return (
    <ConnectModalQRCode
      status={data ? "Done" : "Pending"}
      link={data}
      description={"Open App to connect"}
      errorTitle={"errorTitle"}
      errorDesc={activeWallet.errorMessage || ""}
      onRefresh={() => walletManager.connect(activeWallet?.option?.name || "")}
    />
  );
};
