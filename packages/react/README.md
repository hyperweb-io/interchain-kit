# @interchain-kit/react

<p align="center" width="100%">
    <img height="90" src="https://user-images.githubusercontent.com/545047/190171432-5526db8f-9952-45ce-a745-bea4302f912b.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/hyperweb-io/interchain-kit/actions/workflows/unit-test.yaml">
    <img height="20" src="https://github.com/hyperweb-io/interchain-kit/actions/workflows/unit-test.yaml/badge.svg" />
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
Using pnpm:
```sh
pnpm add @interchain-kit/react
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
pnpm
# build the prod packages. When devs would like to navigate to the source code, this will only navigate from references to their definitions (.d.ts files) between packages.
pnpm build
```

Or if you want to make your dev process smoother, you can run:

```sh
pnpm
# build the dev packages with .map files, this enables navigation from references to their source code between packages.
pnpm watch:dev
```
