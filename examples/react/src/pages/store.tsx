import { useWalletManager } from "@interchain-kit/react";

const Store = () => {
  const walletManager = useWalletManager();
  console.log(
    "zz",
    walletManager
      .getWalletByName("keplr-extension")
      ?.getChainWalletByChainName("osmosistestnet")
  );

  return (
    <div>
      {walletManager.wallets.map((wallet) => {
        const chainWallets = Array.from(wallet.chainWallets.values());
        return chainWallets.map((chainWallet) => {
          return (
            <div>
              <h4>{wallet.info.name}</h4>
              <p>Chain Name: {chainWallet.chain.chainName}</p>
              <p>Address: {chainWallet.state.proxy.account?.address}</p>
              <button
                onClick={() => {
                  chainWallet.connect("");
                  chainWallet.getAccount("");
                }}
              >
                connect
              </button>
              <button
                onClick={() => {
                  chainWallet.disconnect("");
                  chainWallet.state.proxy.account = undefined;
                }}
              >
                disconnect
              </button>
            </div>
          );
        });
      })}
    </div>
  );
};

export default Store;
