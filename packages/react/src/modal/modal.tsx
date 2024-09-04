import { useWalletManager } from '../hooks';
import { useWalletModal } from './provider';

const style: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%,-50%)',
  width: '500px',
  backgroundColor: 'white',
};

export const WalletModal = () => {
  const walletManager = useWalletManager();
  const { close } = useWalletModal();
  return (
    <ul style={style}>
      {walletManager.wallets.map((wallet) => {
        return (
          <li key={wallet.option.name}>
            <span>{wallet.option.prettyName}</span>
            <button
              onClick={() =>
                walletManager.connect(wallet.option.name).then(close)
              }
            >
              connect
            </button>
          </li>
        );
      })}
    </ul>
  );
};
