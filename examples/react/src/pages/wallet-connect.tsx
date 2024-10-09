import { WCWallet } from "@interchain-kit/core";
import {
  useCurrentWallet,
  useChain,
  useWalletManager,
} from "@interchain-kit/react";
import { useEffect, useRef, useState } from "react";

const WalletConnect = () => {
  const walletManager = useWalletManager();

  const currentWallet = useCurrentWallet() as WCWallet;

  const { address } = useChain("cosmoshub");

  const [pairings, setPairings] = useState<any[]>([]);

  console.log(currentWallet?.session);

  console.log(pairings);

  const dbRef = useRef<any>(null);
  const readIndexedDb = () => {
    const request = window.indexedDB.open("WALLET_CONNECT_V2_INDEXED_DB", 1);
    request.onerror = (event) => {
      console.error("Why didn't you allow my web app to use IndexedDB?!");
    };
    request.onsuccess = (event) => {
      dbRef.current = event.target?.result;
      console.log("dbRef.current", dbRef.current);
    };
  };
  useEffect(() => {
    readIndexedDb();
  }, []);

  return (
    <div>
      <p>current wallet: {currentWallet?.option?.name}</p>
      <pre>{JSON.stringify(currentWallet?.session?.peer, null, 4)}</pre>
      <p>address: {address}</p>
      <p>topic: {currentWallet?.session?.topic}</p>
      <button
        onClick={() =>
          setPairings(currentWallet.signClient.core.pairing.getPairings())
        }
      >
        get pairings
      </button>
      <button
        onClick={() =>
          walletManager.disconnect(currentWallet?.option?.name as string)
        }
      >
        disconnect
      </button>

      <button
        onClick={() => {
          console.log(dbRef.current);
        }}
      >
        read db
      </button>
    </div>
  );
};

export default WalletConnect;
