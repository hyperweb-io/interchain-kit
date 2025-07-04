import { BaseWallet } from '@interchain-kit/core';
import { WalletStore } from '@interchain-kit/store';
import { ConnectModalHead, ConnectModalStatus } from '@interchain-ui/react';

import { getWalletInfo } from '../../utils';
import { AstronautSvg } from './Astronaut';

export const ConnectedHeader = ({
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
      onClose={close}
      onBack={onBack}
      closeButtonProps={{ onClick: close }}
    />
  );
};

export const ConnectedContent = ({
  address,
  username,
  wallet,
  disconnect,
}: {
  address: string;
  username: string | null;
  wallet: BaseWallet;
  disconnect: () => void;
}) => {
  return (
    <ConnectModalStatus
      wallet={getWalletInfo(wallet)}
      status={'Connected'}
      connectedInfo={{
        name: username || 'Wallet',
        avatar: (
          <AstronautSvg
            style={{
              fontSize: 'inherit',
              width: '100%',
              height: '100%',
            }}
          />
        ),
        address: address,
      }}
      onDisconnect={disconnect}
    />
  );
};
