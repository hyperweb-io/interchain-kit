'use client';

import { ChainProvider, InterchainWalletModal } from '@interchain-kit/react';
import {
  chain as osmosisChain,
  assetList as osmosisAssetList,
} from 'chain-registry/mainnet/osmosis';
import {
  chain as cosmoshubChain,
  assetList as cosmoshubAssetList,
} from 'chain-registry/mainnet/cosmoshub';

import { useChain as useStarshipChain } from '@/starship/hook';
import { useEffect, useState } from 'react';
import { receiverWallet, senderWallet } from '@/wallet';
import { notInstalledWallet } from '@/wallet/NotInstalledWallet';
import { mockWallet } from '@/wallet/MockWallet';
import { rejectSigningWallet } from '@/wallet/RejectSigningWallet';
import { multipleAccountWallet } from '@/wallet/MultipleAccountWallet';

export const InterchainKit = ({ children }: { children: React.ReactNode }) => {
  const [isRpcReady, setRpcReady] = useState(false);

  const [endpoint, setEndpoint] = useState({
    osmosis: '',
    cosmoshub: '',
  });
  const osmosis = useStarshipChain('osmosis');
  const cosmoshub = useStarshipChain('cosmoshub');

  const initStarship = async () => {
    await Promise.all([
      osmosis.getRpcEndpoint(),
      cosmoshub.getRpcEndpoint(),
    ]).then((result) => {
      setEndpoint({
        osmosis: result[0],
        cosmoshub: result[1],
      });
    });

    setRpcReady(true);
  };

  useEffect(() => {
    initStarship();
  }, []);

  if (!isRpcReady) {
    return <div>Loading...</div>;
  }

  return (
    <ChainProvider
      chains={[osmosisChain, cosmoshubChain]}
      assetLists={[osmosisAssetList, cosmoshubAssetList]}
      wallets={[
        mockWallet,
        senderWallet,
        receiverWallet,
        notInstalledWallet,
        rejectSigningWallet,
        multipleAccountWallet,
      ]}
      walletModal={() => <InterchainWalletModal />}
      signerOptions={{
        signing: (chainName) => {
          return {
            broadcast: {
              deliverTx: true,
            },
          };
        },
      }}
      endpointOptions={{
        endpoints: {
          osmosis: {
            rpc: [endpoint.osmosis],
          },
          cosmoshub: {
            rpc: [endpoint.cosmoshub],
          },
        },
      }}
    >
      {children}
    </ChainProvider>
  );
};
