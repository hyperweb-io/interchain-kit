import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import '@interchain-kit/react/styles.css';

import { BrowserRouter } from 'react-router-dom';

import { ChainProvider, InterchainWalletModal } from '@interchain-kit/react';

import { assetLists, chains } from 'chain-registry';
import {
  BaseWallet,
  ExtensionWallet,
  isInstanceOf,
  WCWallet,
  walletConnect,
} from '@interchain-kit/core';
import { ninjiWallet } from '@interchain-kit/ninji-extension';
import { finWallet } from '@interchain-kit/fin-extension';
import { shellWallet } from '@interchain-kit/shell-extension';
import { keplrWallet } from '@interchain-kit/keplr-extension';
import { leapWallet } from '@interchain-kit/leap-extension';
import { cosmostationWallet } from '@interchain-kit/cosmostation-extension';
import { stationWallet } from '@interchain-kit/station-extension';
import { galaxyStationWallet } from '@interchain-kit/galaxy-station-extension';
import { okxWallet } from '@interchain-kit/okx-extension';
import { coin98Wallet } from '@interchain-kit/coin98-extension';
import { ledgerWallet } from '@interchain-kit/ledger';
import { cosmosExtensionMetaMask } from '@interchain-kit/cosmos-extension-metamask';
import { xdefiWallet } from '@interchain-kit/xdefi-extension';
import { compassWallet } from '@interchain-kit/compass-extension';
import { trustWallet } from '@interchain-kit/trust-extension';
import { leapCosmosExtensionMetaMask } from '@interchain-kit/leap-cosmos-extension-metamask';
import { xdefinWallet } from '@interchain-kit/xdefi-extension';
import { vultisigWallet } from '@interchain-kit/vultisig-extension';
// import { MockWallet } from "@interchain-kit/mock-wallet";
import { metaMaskWallet } from '@interchain-kit/metamask-extension';
import { exodusWallet } from '@interchain-kit/exodus-extension';
import { phantomWallet } from '@interchain-kit/phantom-extension';
import { backPackWallet } from '@interchain-kit/backpack-extension';
import { solflareWallet } from '@interchain-kit/solflare-extension';
import { starshipChain, starshipChain1 } from './utils/starship.ts';
import { ThemeProvider } from '@interchain-ui/react';
import { Chain } from '@chain-registry/types';
import {
  createAssetListFromEthereumChainInfo,
  createChainFromEthereumChainInfo,
} from './utils/eth-test-net.ts';
import {
  createStarshipChain,
  createStarshipAssetList,
} from './utils/osmo-test-net.ts';
import { create } from 'domain';
import {
  createSolanaAssetList,
  createSolanaChain,
} from './utils/solana-test-net.ts';

const chainNames: string[] = [
  // "injectivetestnet",
  // "osmosistestnet",
  'osmosis',
  "juno",
  'cosmoshub',
  // "stargaze",
  // "noble",
  // "seitestnet2",
  // "ethereum",
  // "cosmoshubtestnet",
  // "solana",
];
// const chainNames = ["osmosistestnet"];
// const chainNames = ["cosmoshub"];

// const walletConnect = new WCWallet(undefined, {
//   metadata: {
//     name: "Wallet Connect In React Example",
//     description: "test",
//     url: "#",
//     icons: ["https://walletconnect.com/walletconnect-logo.png"],
//   },
// });

const wallet1Mnemonic =
  'among machine material tide surround boy ramp nuclear body hover among address';
const wallet2Mnemonic =
  'angry tribe runway maze there alpha soft rate tell render fine pony';

// const _chains = chains.filter(c => chainNames.includes(c.chainName)).map(c => ({
//   ...c, apis: {
//     ...c.apis,
//     rpc: [{ address: 'http://localhost:26653' }],
//     rest: [{ address: 'http://localhost:1313' }]
//   }
// }))

const bscethertestnet = {
  chainId: '97',
  // chainId: "0x61",
  chainName: 'Binance Smart Chain Testnet',
  nativeCurrency: {
    name: 'BSC Testnet',
    symbol: 'tBNB', // Native currency symbol
    decimals: 18, // Native currency decimals
  },
  rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
  blockExplorerUrls: ['https://testnet.bscscan.com'],
};

const goerliethereumtestnet = {
  chainId: '0x5', // Goerli Testnet
  chainName: 'Goerli Testnet',
  rpcUrls: ['https://rpc.goerli.mudit.blog/'],
  nativeCurrency: {
    name: 'Goerli ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  blockExplorerUrls: ['https://goerli.etherscan.io'],
};

const sepoliaEthereumTestNet = {
  chainId: '0xaa36a7', // Sepolia Testnet
  chainName: 'Sepolia Testnet',
  rpcUrls: ['https://gateway.tenderly.co/public/sepolia'],
  nativeCurrency: {
    name: 'Sepolia ETH',
    symbol: 'USDC',
    decimals: 18,
  },
  blockExplorerUrls: ['https://goerli.etherscan.io'],
};

const HOLESKY_TESTNET = {
  chainId: '17000', // 17000 | 0x4268
  chainName: 'HoleskyTestNet',
  rpcUrls: ['https://ethereum-holesky.publicnode.com'],
  nativeCurrency: {
    name: 'HoleskyETH',
    symbol: 'ETH',
    decimals: 18,
  },
  blockExplorerUrls: ['https://holesky.etherscan.io'],
};

const _chains = [
  ...chains.filter((c) => chainNames.includes(c.chainName)),
  // createChainFromEthereumChainInfo(bscethertestnet),
  // createChainFromEthereumChainInfo(goerliethereumtestnet),
  createChainFromEthereumChainInfo(sepoliaEthereumTestNet),
  // createChainFromEthereumChainInfo(HOLESKY_TESTNET),
  // createStarshipChain(
  //   "test-osmosis-1",
  //   "osmosis",
  //   "http://localhost:26657",
  //   "http://localhost:1317"
  // ),
  createSolanaChain('devnet'),
  // createSolanaChain('testnet'),
  // createSolanaChain('mainnet-beta'),
];
// const _chains = [starshipChain1]
const _assetLists = [
  ...assetLists.filter((a) => chainNames.includes(a.chainName)),
  // createAssetListFromEthereumChainInfo(bscethertestnet),
  // createAssetListFromEthereumChainInfo(goerliethereumtestnet),
  createAssetListFromEthereumChainInfo(sepoliaEthereumTestNet),
  // createAssetListFromEthereumChainInfo(HOLESKY_TESTNET),
  // createStarshipAssetList("osmosis"),
  createSolanaAssetList('devnet'),
  // createSolanaAssetList('testnet'),
  // createSolanaAssetList('mainnet-beta'),
];

// const mock1Wallet = new MockWallet(wallet1Mnemonic, _chains, {
//   mode: "extension",
//   prettyName: "Mock1",
//   name: "mock1",
// });
// const mock2Wallet = new MockWallet(wallet2Mnemonic, _chains, {
//   mode: "extension",
//   prettyName: "Mock2",
//   name: "mock2",
// });

if (isInstanceOf(keplrWallet, ExtensionWallet)) {
  keplrWallet.setSignOptions({
    preferNoSetFee: false,
  });
}
// console.log(_chains);
const _wallets: BaseWallet[] = [
  // mock1Wallet,
  // mock2Wallet,
  keplrWallet,
  leapWallet,
  // cosmostationWallet,
  // stationWallet,
  // galaxyStationWallet,
  // walletConnect,
  // ledgerWallet,
  // cosmosExtensionMetaMask,
  // walletConnect,
  // ledgerWallet,
  // leapCosmosExtensionMetaMask,
  // compassWallet,
  // trustWallet,
  // metaMaskWallet,
  // okxWallet,
  // xdefiWallet,
  // exodusWallet,
  // coin98Wallet,
  // finWallet,
  // shellWallet,
  // ninjiWallet,
  // phantomWallet,
  // backPackWallet,
  // solflareWallet,
  // vultisigWallet,
];

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChainProvider
      chains={_chains}
      wallets={_wallets}
      assetLists={_assetLists}
      walletModal={() => (
        <InterchainWalletModal
          modalThemeProviderProps={{ defaultTheme: 'light' }}
        />
      )}
      signerOptions={{
        signing: (chainName) => {
          return {
            broadcast: {
              checkTx: chainName === 'osmosistestnet',
              deliverTx: chainName === 'osmosistestnet',
              timeoutMs: chainName === 'osmosistestnet' ? 20000 : 10000,
            },
            gasPrice:
              chainName === 'osmosistestnet' ? '0.025uosmo' : '0.025uatom',
          };
        },
        preferredSignType: (chainName) => {
          return chainName === 'osmosistestnet' ? 'amino' : 'direct';
        },
      }}
      endpointOptions={{
        endpoints: {
          // 'osmosis': {
          //   rpc: ['http://localhost:26657'],
          //   rest: ['http://localhost:1317']
          // },
          // 'cosmoshub': {
          //   rpc: ['http://localhost:26653'],
          //   rest: ['http://localhost:1313']
          // }
          // 'osmosistestnet': {
          //   rpc: ['https://rpc.testnet.osmosis.zone'],
          //   rest: ['https://lcd.testnet.osmosis.zone']
          // }
          // injectivetestnet: {
          //   rpc: ["https://testnet.explorer.injective.network/"],
          // },
          solana: {
            rpc: ['https://api.devnet.solana.com'],
          },
        },
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ChainProvider>
  </React.StrictMode>
);
