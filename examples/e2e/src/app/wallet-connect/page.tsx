'use client';

import { mockWallet } from '@/wallet/MockWallet';
import { useChain, useChainWallet } from '@interchain-kit/react';
import { chain } from 'chain-registry/mainnet/osmosis';

export default function WalletConnect() {
  const { connect, disconnect, status } = useChainWallet(
    chain.chainName,
    mockWallet.info.name
  );
  const { openView } = useChain(chain.chainName);
  return (
    <div>
      <span id="wallet-state">walletState:{status}</span>

      <button data-testid="connect-wallet-btn" onClick={connect}>
        Connect Wallet
      </button>
      <button data-testid="disconnect-wallet-btn" onClick={disconnect}>
        Disconnect Wallet
      </button>
      <button data-testid="open-modal-btn" onClick={openView}>
        Open Modal
      </button>
    </div>
  );
}
