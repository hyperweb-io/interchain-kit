# @interchain-kit/react

<p align="center" width="100%">
    <img height="90" src="https://user-images.githubusercontent.com/545047/190171432-5526db8f-9952-45ce-a745-bea4302f912b.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/hyperweb-io/interchain-kit/actions/workflows/unit-test.yaml">
    <img height="20" src="https://github.com/hyperweb-io/interchain-kit/actions/workflows/unit-test.yaml/badge.svg" />
  </a>
  <a href="https://github.com/constructive-io/lib-count">
    <img height="20" src="https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fconstructive-io%2Flib-count%2Fmain%2Foutput%2Fbadges%2Fproducts%2Fcosmos-kit%2Ftotal.json"/>  
  </a>
  <a href="https://github.com/constructive-io/lib-count">
    <img height="20" src="https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fconstructive-io%2Flib-count%2Fmain%2Foutput%2Fbadges%2Fproducts%2Fcosmos-kit%2Fmonthly.json"/>  
  </a>
  <br />
   <a href="https://github.com/hyperweb-io/cosmos-kit/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-BSD%203--Clause%20Clear-blue.svg"></a>
   <a href="https://www.npmjs.com/package/cosmos-kit"><img height="20" src="https://img.shields.io/github/package-json/v/hyperweb-io/cosmos-kit?filename=packages%2Fcosmos-kit%2Fpackage.json"></a>
</p>

## Install
Using npm:
```sh
npm install @interchain-kit/react
```
Using yarn:
```sh
yarn add @interchain-kit/react
```

## Usage
### Setup
#### import chain registry info that you need
```js
import { ChainProvider, useChain } from "@interchain-kit/react";
import { keplrWallet } from "@interchain-kit/keplr-extension";
import { ThemeProvider } from "@interchain-ui/react";
import "@interchain-ui/react/styles";

import { chain as junoChain, assetList as junoAssetList } from "chain-registry/mainnet/juno";
import { chain as osmosisChain,assetList as osmosisAssetList } from "chain-registry/mainnet/osmosis";
import { chain as cosmoshubChain, assetList as cosmoshubAssetList } from "chain-registry/mainnet/cosmoshub";

const Show = () => {
  const {address} = useChain('osmosis');
  // will show cosmoshub address from what you selected wallet in modal
  return <div>{address}</div>;
};

function App() {
  return (
    <ThemeProvider>
      <ChainProvider
        chains={[osmosisChain, junoChain, cosmoshubChain]}
        assetLists={[osmosisAssetList, junoAssetList, cosmoshubAssetList]}
        wallets={[keplrWallet]}
        signerOptions={{}}
        endpointOptions={{}}
      >
        <Show />
      </ChainProvider>
    </ThemeProvider>
  );
}

export default App;
```

#### or import all chain registry
```js
import { ChainProvider, useChain } from "@interchain-kit/react";
import { keplrWallet } from "@interchain-kit/keplr-extension";
import { ThemeProvider } from "@interchain-ui/react";
import "@interchain-ui/react/styles";
import { chains, assetLists } from 'chain-registry/mainnet'
 

const Show = () => {
  const {address} = useChain('osmosis');
  // will show cosmoshub address from what you selected wallet in modal
  return <div>{address}</div>;
};

function App() {
  return (
    <ThemeProvider>
      <ChainProvider
        chains={chains}
        assetLists={assetLists}
        wallets={[keplrWallet]}
        signerOptions={{}}
        endpointOptions={{}}
      >
        <Show />
      </ChainProvider>
    </ThemeProvider>
  );
}

export default App;
```

### useChain
```js

const chainName = 'cosmoshub'
const { chain, assetList, address, wallet } = useChain(chainName)

console.log(wallet) //keprl extension wallet info
console.log(chain) // chain info for cosmoshub
console.log(assetList) // assets info for cosmoshub
console.log(address) // address for cosmoshub in keplr-extension wallet

```

### useChainWallet
```js
import { chain as junoChain, assetList as junoAssetList } from "chain-registry/mainnet/juno";
import { chain as stargazeChain,assetList as stargazeAssetList } from "chain-registry/mainnet/stargaze";
import { keplrWallet } from "@interchain-kit/keplr-extension";
import { leapWallet } from "@interchain-kit/leap-extension";

const Show = () => {
  const juno = useChainWallet('juno', 'keplr-extension')
  const stargaze = useChainWallet('stargaze', 'leap-extension')
  console.log(juno.address) // juno1xxxxxxx in keplr extension wallet
  console.log(stargaze.addresss) // stargaze1xxxxxx in leap extension wallet
};

const chainNames 

function App() {
  return (
    <ThemeProvider>
      <ChainProvider
        chains={[junoChain, stargazeChain]}
        assetLists={[junoAssetList, stargazeAssetList]}
        wallets={[keplrWallet, leapWallet]}
        signerOptions={{}}
        endpointOptions={{}}
      >
        <Show />
      </ChainProvider>
    </ThemeProvider>
  );
}

export default App;
```

### useChains

```js
WIP
```
### use wallet methods
```js
const { wallet } = useChain('osmosis')

//use method from wallet that you select
await wallet.signAmino(chainId, signAddress, stdDoc)
await wallet.verifyArbitrary(chainId, signAddress, stdDoc)

```

## Developing

When first cloning the repo:

```sh
yarn
# build the prod packages. When devs would like to navigate to the source code, this will only navigate from references to their definitions (.d.ts files) between packages.
yarn build
```

Or if you want to make your dev process smoother, you can run:

```sh
yarn
# build the dev packages with .map files, this enables navigation from references to their source code between packages.
yarn watch:dev
```

## Interchain JavaScript Stack 

A unified toolkit for building applications and smart contracts in the Interchain ecosystem ⚛️

| Category              | Tools                                                                                                                  | Description                                                                                           |
|----------------------|------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------|
| **Chain Information**   | [**Chain Registry**](https://github.com/hyperweb-io/chain-registry), [**Utils**](https://www.npmjs.com/package/@chain-registry/utils), [**Client**](https://www.npmjs.com/package/@chain-registry/client) | Everything from token symbols, logos, and IBC denominations for all assets you want to support in your application. |
| **Wallet Connectors**| [**Interchain Kit**](https://github.com/hyperweb-io/interchain-kit)<sup>beta</sup>, [**Cosmos Kit**](https://github.com/hyperweb-io/cosmos-kit) | Experience the convenience of connecting with a variety of web3 wallets through a single, streamlined interface. |
| **Signing Clients**          | [**InterchainJS**](https://github.com/hyperweb-io/interchainjs)<sup>beta</sup>, [**CosmJS**](https://github.com/cosmos/cosmjs) | A single, universal signing interface for any network |
| **SDK Clients**              | [**Telescope**](https://github.com/hyperweb-io/telescope)                                                          | Your Frontend Companion for Building with TypeScript with Cosmos SDK Modules. |
| **Starter Kits**     | [**Create Interchain App**](https://github.com/hyperweb-io/create-interchain-app)<sup>beta</sup>, [**Create Cosmos App**](https://github.com/hyperweb-io/create-cosmos-app) | Set up a modern Interchain app by running one command. |
| **UI Kits**          | [**Interchain UI**](https://github.com/hyperweb-io/interchain-ui)                                                   | The Interchain Design System, empowering developers with a flexible, easy-to-use UI kit. |
| **Testing Frameworks**          | [**Starship**](https://github.com/hyperweb-io/starship)                                                             | Unified Testing and Development for the Interchain. |
| **TypeScript Smart Contracts** | [**Create Hyperweb App**](https://github.com/hyperweb-io/create-hyperweb-app)                              | Build and deploy full-stack blockchain applications with TypeScript |
| **CosmWasm Contracts** | [**CosmWasm TS Codegen**](https://github.com/CosmWasm/ts-codegen)                                                   | Convert your CosmWasm smart contracts into dev-friendly TypeScript classes. |

## Credits

🛠 Built by the [Constructive](https://constructive.io) team — makers of [Hyperweb](https://hyperweb.io)

## Disclaimer

AS DESCRIBED IN THE LICENSES, THE SOFTWARE IS PROVIDED “AS IS”, AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND.

No developer or entity involved in creating this software will be liable for any claims or damages whatsoever associated with your use, inability to use, or your interaction with other users of the code, including any direct, indirect, incidental, special, exemplary, punitive or consequential damages, or loss of profits, cryptocurrencies, tokens, or anything else of value.
