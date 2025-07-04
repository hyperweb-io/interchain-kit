import { ConnectModalHead, ConnectModalWalletList } from '@interchain-ui/react';
import { Wallet as InterchainUIWalletType } from '@interchain-ui/react';

export const WalletListHeader = ({ close }: { close: () => void }) => {
  return (
    <ConnectModalHead
      title="Select your wallet"
      hasBackButton={false}
      onClose={close}
      closeButtonProps={{ onClick: close }}
    />
  );
};

export const WalletListContent = ({
  wallets,
  onSelectWallet,
}: {
  wallets: InterchainUIWalletType[];
  onSelectWallet: (wallet: any) => void;
}) => {
  return (
    <ConnectModalWalletList
      wallets={wallets}
      onWalletItemClick={onSelectWallet}
    />
  );
};
