import { assetLists, chains } from 'chain-registry';
import { BaseWallet, isMobile, WCWallet } from '@interchain-kit/core';
import {
  SigningClient,
  useChainWallet,
  useWalletManager,
  useWalletModal,
} from '@interchain-kit/react';
import { useRef, useState } from 'react';
import { makeKeplrChainInfo } from '../utils';
import { Chain, Asset, AssetList } from '@chain-registry/types';
import { coins } from '@cosmjs/amino';
import { ChainInfo } from '@keplr-wallet/types';
import { getBalance } from 'interchainjs/cosmos/bank/v1beta1/query.rpc.func';
import QRCode from 'react-qr-code';
import { send } from 'interchainjs/cosmos/bank/v1beta1/tx.rpc.func';
import { ethers } from 'ethers';
import { StatefulWallet } from '@interchain-kit/react/store/stateful-wallet';

type BalanceProps = {
  address: string;
  wallet: StatefulWallet;
  chainName: string;
  chainId: string;
  chain: Chain;
  assetList: AssetList;
};

const BalanceTd = ({ address, wallet, chain, assetList }: BalanceProps) => {
  const { rpcEndpoint } = useChainWallet(
    chain.chainName,
    wallet.info?.name as string
  );

  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState<any>();

  const handleBalanceQuery = async () => {
    let balance;

    setIsLoading(true);

    if (chain.chainType === 'cosmos') {
      balance = await getBalance(rpcEndpoint as string, {
        address,
        denom:
          (chain.staking?.stakingTokens[0].denom as string) ||
          assetList.assets[0].base,
      });
    }
    if (chain.chainType === 'eip155') {
      const provider = await wallet.getProvider(chain.chainId as string);
      // provider = new ethers.providers.JsonRpcProvider(rpcEndpoint as string);

      const ethProvider = new ethers.providers.Web3Provider(provider);
      const result = await ethProvider.getBalance(address);

      balance = { balance: { amount: result.toString() } };
    }

    setBalance(balance);
    setIsLoading(false);
  };

  return (
    <td>
      <div>
        <button className="bg-blue-100 p-1 m-1" onClick={handleBalanceQuery}>
          refresh balance
        </button>
      </div>
      <div>
        <span>balance: </span>
        <span>{balance?.balance?.amount}</span>
      </div>
    </td>
  );
};

type SendTokenProps = {
  wallet: StatefulWallet;
  address: string;
  chain: Chain;
};
const SendTokenTd = ({ wallet, address, chain }: SendTokenProps) => {
  const toAddressRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);

  const { assetList, signingClient, isSigningClientLoading, rpcEndpoint } =
    useChainWallet(chain.chainName, wallet.info?.name as string);

  if (
    chain.chainType === 'cosmos' &&
    (isSigningClientLoading || !signingClient)
  ) {
    return <td>loading...</td>;
  }

  const handleSendToken = async () => {
    if (!toAddressRef.current || !amountRef.current) {
      return;
    }

    if (chain.chainType === 'cosmos') {
      const recipientAddress = toAddressRef.current.value;
      const denom =
        (chain.staking?.stakingTokens[0].denom as string) ||
        assetList.assets[0].base;

      const fee = {
        amount: coins(25000, denom),
        gas: '100000',
      };

      try {
        const tx = await send(
          signingClient as SigningClient,
          address,
          {
            fromAddress: address,
            toAddress: recipientAddress,
            amount: [
              { denom: denom, amount: amountRef.current?.value as string },
            ],
          },
          fee,
          'test'
        );
        console.log(tx);
      } catch (error) {
        console.error(error);
      }
    }

    if (chain.chainType === 'eip155') {
      const transaction = {
        from: address,
        to: toAddressRef.current.value,
        value: `0x${parseInt(amountRef.current.value).toString(16)}`,
        // data: "0x",
      };

      let provider = await wallet.getProvider(chain.chainId as string);
      // provider = new ethers.providers.JsonRpcProvider(rpcEndpoint as string);
      const ethProvider = new ethers.providers.Web3Provider(provider);
      const signer = await ethProvider.getSigner();
      try {
        console.log(transaction);
        // await wallet.switchChain(chain.chainId as string);
        const tx = await signer.sendTransaction(transaction);
        console.log(tx);
        const txReceipt = await tx.wait();
        console.log('Transaction hash:', txReceipt?.hash);
        console.log(txResponse);
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <td>
      <div>
        <button className="bg-blue-100 p-1 m-1" onClick={handleSendToken}>
          Send Token to:
        </button>
        <input
          className="border-red-300 border-2 rounded-sm"
          ref={toAddressRef}
        />
      </div>
      <div>
        amount:{' '}
        <input className="border-red-300 border-2 rounded-sm" ref={amountRef} />
      </div>
    </td>
  );
};

const RpcTd = ({ wallet, address, chain }: SendTokenProps) => {
  const { rpcEndpoint, getRpcEndpoint } = useChainWallet(
    chain.chainName,
    wallet.info?.name as string
  );

  return (
    <td>
      <p>{rpcEndpoint as string}</p>
      <button onClick={getRpcEndpoint}>get rpc</button>
    </td>
  );
};

const AddressTd = ({ wallet, chain }: SendTokenProps) => {
  const { address, wallet: walletHandler } = useChainWallet(
    chain.chainName,
    wallet.info?.name as string
  );
  return (
    <td>
      <p>{address}</p>
      <button onClick={() => walletHandler.getAccount(chain.chainId as string)}>
        get account
      </button>
    </td>
  );
};

const ChainRow = ({
  chain,
  wallet,
}: {
  chain: Chain;
  wallet: StatefulWallet;
}) => {
  const {
    address,
    rpcEndpoint,
    connect,
    disconnect,
    status,
    assetList,
    message,
  } = useChainWallet(chain.chainName, wallet.info?.name as string);
  return (
    <tr>
      <td>
        <button onClick={connect}>connect by chain</button>
        <button onClick={disconnect}>disconnect by chain</button>
      </td>
      <td>{chain.chainName}</td>
      <td>{chain.chainId}</td>
      <td>
        {status}:{message}
      </td>
      <RpcTd address={address} wallet={wallet} chain={chain}></RpcTd>
      <AddressTd address={address} wallet={wallet} chain={chain}></AddressTd>
      <BalanceTd
        address={address}
        chainId={chain.chainId as string}
        chainName={chain.chainName}
        wallet={wallet}
        chain={chain}
        assetList={assetList}
      />
      <SendTokenTd address={address} wallet={wallet} chain={chain} />
    </tr>
  );
};

const WalletConnectTd = ({ wallet }: { wallet: StatefulWallet }) => {
  const walletManager = useWalletManager();

  const chainIds = walletManager.chains.map((c) => c.chainId);

  const currentWallet = walletManager.wallets.find(
    (w: BaseWallet) => w.info?.name === wallet.info?.name
  );

  const connect = () => {
    walletManager.connect(wallet.info?.name as string, 'osmosis');
  };

  const disconnect = () => {
    walletManager.disconnect(wallet.info?.name as string, 'osmosis');
  };

  const uri = walletManager.walletConnectQRCodeUri;

  return (
    <td>
      <button className="bg-blue-100 p-1 m-1" onClick={connect}>
        connect
      </button>
      <button className="bg-blue-100 p-1 m-1" onClick={disconnect}>
        disconnect
      </button>
      {currentWallet instanceof WCWallet && uri && <QRCode value={uri} />}
      {wallet.errorMessage}
    </td>
  );
};

const E2ETest = () => {
  const walletManager = useWalletManager();
  const { open } = useWalletModal();

  // console.log(walletManager.wallets);

  // useEffect(() => {
  //   if (walletManager.isReady) {
  //     walletManager.wallets.forEach((wallet) => {
  //       console.log({ name: wallet.walletName, state: wallet.walletState });
  //     });
  //   }
  // }, [walletManager.isReady]);

  // walletManager.wallets.forEach((wallet) => {
  //   console.log({ name: wallet.walletName, state: wallet.walletState });
  // });

  const addChain = async () => {
    const keplrExtension = walletManager.wallets.find(
      (w) => w.info?.name === 'keplr-extension'
    );

    const chain = chains.find((c) => c.chainName === 'cosmoshub');
    const assetList = assetLists.find((a) => a.chainName === 'cosmoshub');

    const chainInfo: ChainInfo = makeKeplrChainInfo(
      chain as Chain,
      assetList?.assets[0] as Asset,
      'http://localhost:26653',
      'http://localhost:1313',
      'test-cosmoshub-4',
      'cosmoshub'
    );

    keplrExtension?.addSuggestChain(chainInfo);
  };

  const chainNameToAdd = 'cosmoshubtestnet';

  return (
    <div>
      <table style={{ width: '1000px' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Pretty Name</th>
            <th>Connect</th>
            <th>State</th>
            <th>Chain</th>
          </tr>
        </thead>
        <tbody>
          {walletManager.wallets.map((wallet) => {
            return (
              <tr key={wallet.info?.name}>
                <td>{wallet.info?.name}</td>
                <td>{wallet.info?.prettyName}</td>
                <WalletConnectTd wallet={wallet} />
                <td>{wallet.walletState}</td>
                <td>
                  <table>
                    <thead>
                      <tr>
                        <th>connect</th>
                        <th>name</th>
                        <th>chainId</th>
                        <th>state</th>
                        <th>rpc</th>
                        <th>address</th>
                        <th>faucet</th>
                        <th>send token</th>
                      </tr>
                    </thead>
                    <tbody>
                      {walletManager.chains.map((chain) => {
                        return (
                          <ChainRow
                            chain={chain}
                            wallet={wallet}
                            key={chain.chainId}
                          />
                        );
                      })}
                    </tbody>
                  </table>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <button className="bg-blue-100 p-1 m-1" onClick={addChain}>
        add suggest chain
      </button>
      <button className="bg-blue-100 p-1 m-1" onClick={open}>
        open modal
      </button>
      <button
        className="bg-blue-100 p-1 m-1"
        onClick={() => {
          walletManager.addChains(
            chains.filter((c) => c.chainName === chainNameToAdd),
            assetLists.filter((a) => a.chainName === chainNameToAdd),
            undefined,
            {
              endpoints: {
                [chainNameToAdd]: {
                  rpc: ['http://localhost:26657'],
                },
              },
            }
          );
        }}
      >
        change rpc: {chainNameToAdd}
      </button>
      {JSON.stringify(isMobile())}
      {navigator.userAgent}
    </div>
  );
};

export default E2ETest;
