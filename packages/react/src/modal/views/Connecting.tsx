import { BaseWallet } from '@interchain-kit/core';
import { WalletStore } from '@interchain-kit/store';
import { ConnectModalHead, ConnectModalStatus } from '@interchain-ui/react';

export const ConnectingHeader = ({
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
      closeButtonProps={{
        onClick: close,
      }}
    />
  );
};

export const ConnectingContent = ({ wallet }: { wallet: BaseWallet }) => {
  const {
    info: { prettyName, mode },
  } = wallet;

  let title = 'Requesting Connection';
  let desc: string =
    mode === 'wallet-connect'
      ? `Approve ${prettyName} connection request on your mobile.`
      : `Open the ${prettyName} browser extension to connect your wallet.`;

  if (!wallet) return null;

  return (
    <ConnectModalStatus
      wallet={{
        name: wallet.info.name,
        prettyName: wallet.info.prettyName,
        logo: wallet.info.logo as string,
        mobileDisabled: true,
      }}
      status="Connecting"
      contentHeader={title}
      contentDesc={desc}
    />
  );
};
