import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "@interchain-ui/react/styles";
import { BrowserRouter } from "react-router-dom";

import { ChainProvider } from "@interchain-kit/react";

import { assetLists, chains } from "@chain-registry/v2";
import { BaseWallet, WCWallet } from "@interchain-kit/core";
import { keplrWallet } from "@interchain-kit/keplr-extension";
import { leapWallet } from "@interchain-kit/leap-extension";
import { cosmostationWallet } from "@interchain-kit/cosmostation-extension";
import { stationWallet } from "@interchain-kit/station-extension"
import { galaxyStationWallet } from "@interchain-kit/galaxy-station-extension"
import { okxWallet } from "@interchain-kit/okx-extension";
import { coin98Wallet } from "@interchain-kit/coin98-extension";
import { ledgerWallet } from "@interchain-kit/ledger";

import { MockWallet } from "@interchain-kit/mock-wallet";
import { starshipChain, starshipChain1 } from "./utils/starship.ts";
import { ThemeProvider } from "@interchain-ui/react";

const chainNames = ["osmosis", "juno", "cosmoshub", "stargaze", "noble"];
// const chainNames = ["osmosistestnet"];
// const chainNames = ["cosmoshub"];

const walletConnect = new WCWallet();

const wallet1Mnemonic =
  "among machine material tide surround boy ramp nuclear body hover among address";
const wallet2Mnemonic =
  "angry tribe runway maze there alpha soft rate tell render fine pony";

// const _chains = chains.filter(c => chainNames.includes(c.chainName)).map(c => ({
//   ...c, apis: {
//     ...c.apis,
//     rpc: [{ address: 'http://localhost:26653' }],
//     rest: [{ address: 'http://localhost:1313' }]
//   }
// }))
const _chains = chains.filter((c) => chainNames.includes(c.chainName));
// const _chains = [starshipChain1]
const _assetLists = assetLists.filter((a) => chainNames.includes(a.chainName));

const mock1Wallet = new MockWallet(wallet1Mnemonic, _chains, {
  mode: "extension",
  prettyName: "Mock1",
  name: "mock1",
});
const mock2Wallet = new MockWallet(wallet2Mnemonic, _chains, {
  mode: "extension",
  prettyName: "Mock2",
  name: "mock2",
});

const _wallets: BaseWallet[] = [
  mock1Wallet,
  mock2Wallet,
  keplrWallet,
  leapWallet,
  cosmostationWallet,
  stationWallet,
  galaxyStationWallet,
  walletConnect,
];

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <ChainProvider
        chains={_chains}
        wallets={_wallets}
        assetLists={_assetLists}
        signerOptions={{}}
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
          },
        }}
      >
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ChainProvider>
    </ThemeProvider>
  </React.StrictMode>
);
