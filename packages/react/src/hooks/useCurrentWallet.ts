import { useEffect } from "react"
import { useWalletManager } from "./useWalletManager"
import { useWalletModal } from "../modal"

export const useCurrentWallet = () => {
  const walletManager = useWalletManager()
  const { open } = useWalletModal()

  useEffect(() => {
    if (!walletManager.currentWalletName) {
      open()
    }
  }, [walletManager.currentWalletName])


  return walletManager.getCurrentWallet()
}