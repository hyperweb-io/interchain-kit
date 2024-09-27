import { WalletState } from '@interchain-kit/core';
import { useInterchainWalletContext } from '../provider';
import { useActiveWallet } from './useActiveWallet';
import { useAccount } from './useAccount';
export const useConnect = () => {
    // const { walletManager } = useInterChainWalletContext()
    // const activeWallet = useCurrentWallet()
    // const account = useAccount()
    // return {
    //     connect: walletManager.connect,
    //     isConnected: activeWallet.walletState === WalletState.Connected,
    //     account
    // }
    return {}
}