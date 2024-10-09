import { useChain, useWalletModal } from "@interchain-kit/react";

export default function ActiveWallet() {
  const { address, wallet, logoUrl } = useChain("juno");
  const { open } = useWalletModal();
  return (
    <>
      <button onClick={open}>open wallets modal</button>
      <p>{wallet?.walletState}</p>
      <p>{wallet?.option?.prettyName}</p>

      <p>{address}</p>
      <img src={wallet?.option?.logo?.toString()} style={{ width: "100px" }} />
      <img src={logoUrl} style={{ width: "100px" }}></img>
    </>
  );
}
