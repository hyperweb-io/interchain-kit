import { CosmosWallet } from "@interchain-kit/core";
import { useChain } from "@interchain-kit/react";
import { useState } from "react";

const CosmosWalletPage: React.FC = () => {
  const { wallet, connect, address, disconnect, chain } =
    useChain("osmosistestnet");

  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState("");

  const handleConnect = async () => {
    connect();
  };

  const handleDisconnect = async () => {
    disconnect();
  };

  const handleSignArbitrary = async () => {
    const cosmosWallet = wallet.getWalletOfType(CosmosWallet);

    if (cosmosWallet) {
      const signed = await cosmosWallet.signArbitrary(
        chain.chainId as string,
        address,
        message
      );

      setSignature(signed.signature);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Cosmos Wallet</h1>
      {address ? (
        <div>
          <p>Connected Address: {address}</p>
          <button onClick={handleDisconnect}>Disconnect</button>
        </div>
      ) : (
        <button onClick={handleConnect}>Connect Wallet</button>
      )}

      <div style={{ marginTop: "20px" }}>
        <h2>Sign Arbitrary Message</h2>
        <textarea
          rows={4}
          cols={50}
          placeholder="Enter a message to sign"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <br />
        <button onClick={handleSignArbitrary} style={{ marginTop: "10px" }}>
          Sign Message
        </button>
        {signature && (
          <div style={{ marginTop: "20px" }}>
            <h3>Signature:</h3>
            <pre>{signature}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default CosmosWalletPage;
