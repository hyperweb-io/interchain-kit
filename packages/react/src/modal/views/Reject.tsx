import { WalletStore } from '@interchain-kit/store';
import { ConnectModalHead, ConnectModalStatus } from '@interchain-ui/react';

import { getWalletInfo } from '../../utils';

export const RejectHeader = ({
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
      title={wallet?.info?.prettyName}
      hasBackButton={true}
      onClose={close}
      onBack={onBack}
      closeButtonProps={{ onClick: close }}
    />
  );
};

export const RejectContent = ({
  wallet,
  onReconnect,
}: {
  wallet: WalletStore;
  onReconnect: () => void;
}) => {
  return (
    <ConnectModalStatus
      status="Rejected"
      wallet={getWalletInfo(wallet)}
      contentHeader={'Request Rejected'}
      contentDesc={wallet.errorMessage || 'Connection permission is denied.'}
      onConnect={onReconnect}
    />
  );
};
