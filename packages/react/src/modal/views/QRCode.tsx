import { WalletStore } from '@interchain-kit/store';
import { ConnectModalHead, ConnectModalQRCode } from '@interchain-ui/react';

export const QRCodeHeader = ({
  wallet,
  close,
  onBack,
}: {
  wallet: WalletStore;
  close: () => void;
  onBack: () => void;
}) => {
  return (
    <ConnectModalHead
      title={wallet?.info?.prettyName || ''}
      hasBackButton={true}
      onClose={() => void 0}
      onBack={onBack}
      closeButtonProps={{ onClick: close }}
    />
  );
};
export const QRCodeContent = ({
  errorMessage,
  walletConnectQRCodeUri,
  onReconnect,
}: {
  errorMessage: string;
  walletConnectQRCodeUri: string;
  onReconnect: () => void;
}) => {
  return (
    <ConnectModalQRCode
      status={walletConnectQRCodeUri ? 'Done' : 'Pending'}
      link={walletConnectQRCodeUri}
      description={'Open App to connect'}
      errorTitle={'errorTitle'}
      errorDesc={errorMessage || ''}
      onRefresh={onReconnect}
    />
  );
};
