import { WalletStore } from '@interchain-kit/store';
import { ConnectModalHead, ConnectModalStatus } from '@interchain-ui/react';

import { getWalletInfo } from '../../utils';

export const ErrorHeader = ({
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
      title={wallet.info.prettyName}
      hasBackButton={true}
      onClose={close}
      onBack={onBack}
      closeButtonProps={{ onClick: close }}
    />
  );
};

export const ErrorContent = ({
  wallet,
  onBack,
}: {
  wallet: WalletStore;
  onBack: () => void;
}) => {
  return (
    <ConnectModalStatus
      status="Error"
      wallet={getWalletInfo(wallet)}
      contentHeader={'Oops! Something wrong...'}
      contentDesc={wallet.errorMessage}
      onChangeWallet={onBack}
    />
  );
};
