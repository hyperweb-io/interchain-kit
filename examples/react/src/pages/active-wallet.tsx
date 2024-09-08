import { useChain, useWalletModal } from "@interchain-kit/react"

export default function ActiveWallet() {
  const { address } = useChain('osmosistestnet')
  const { open } = useWalletModal()
  return (
    <>
      <button onClick={open}>open wallets modal</button>
      <div>{address}</div>
    </>
  )
}