<p align="center">
  <img src="https://user-images.githubusercontent.com/545047/188804067-28e67e5e-0214-4449-ab04-2e0c564a6885.svg" width="80"><br />
    @interchain-kit/react
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

import { chain as junoChain, assetList as junoAssetList } from "@chain-registry/v2/mainnet/juno";
import { chain as osmosisChain,assetList as osmosisAssetList } from "@chain-registry/v2/mainnet/osmosis";
import { chain as cosmoshubChain, assetList as cosmoshubAssetList } from "@chain-registry/v2/mainnet/cosmoshub";

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
import { chains, assetLists } from '@chain-registry/v2/mainnet'
 

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
const { chain, assetList, address, wallet, queryClient, signingClient } = useChain(chainName)

console.log(wallet) //keprl extension wallet info
console.log(chain) // chain info for cosmoshub
console.log(assetList) // assets info for cosmoshub
console.log(address) // address for cosmoshub in keplr-extension wallet

//query
const { balance } = await queryClient.balance({
  address,
  denom: 'uosmo'
})
console.log(balance)
// { amount: 23423, denom: 'uosmos' }

```

## useChainWallet
```js
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
        chains={chains.filter((c) => c.chainName === chainName)}
        assetLists={assetLists.filter((c) => c.chainName === chainName)}
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

### useCurrentWallet
```js
const wallet = useCurrentWallet()

console.log(wallet) // current connected wallet

```

### useAccount
```js
const account = useAccount('cosmoshub', 'keplr-extension')

console.log(account.address) // cosmoshub address in keplr-extension wallet

```

### useOfflineSigner
```js
const offlineSigner = useOfflineSigner('cosmoshub', 'keplr-extension')

console.log(offlineSigner) // cosmoshub offlineSigner in keplr-extension wallet 
```

### useChains

```js
WIP
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
yarn build:dev
```

## Related

Checkout these related projects:

* [@cosmology/telescope](https://github.com/cosmology-tech/telescope) Your Frontend Companion for Building with TypeScript with Cosmos SDK Modules.
* [@cosmwasm/ts-codegen](https://github.com/CosmWasm/ts-codegen) Convert your CosmWasm smart contracts into dev-friendly TypeScript classes.
* [chain-registry](https://github.com/cosmology-tech/chain-registry) Everything from token symbols, logos, and IBC denominations for all assets you want to support in your application.
* [cosmos-kit](https://github.com/cosmology-tech/cosmos-kit) Experience the convenience of connecting with a variety of web3 wallets through a single, streamlined interface.
* [create-cosmos-app](https://github.com/cosmology-tech/create-cosmos-app) Set up a modern Cosmos app by running one command.
* [interchain-ui](https://github.com/cosmology-tech/interchain-ui) The Interchain Design System, empowering developers with a flexible, easy-to-use UI kit.
* [starship](https://github.com/cosmology-tech/starship) Unified Testing and Development for the Interchain.

## Credits

🛠 Built by Cosmology — if you like our tools, please consider delegating to [our validator ⚛️](https://cosmology.zone/validator)


## Disclaimer

AS DESCRIBED IN THE LICENSES, THE SOFTWARE IS PROVIDED “AS IS”, AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND.

No developer or entity involved in creating this software will be liable for any claims or damages whatsoever associated with your use, inability to use, or your interaction with other users of the code, including any direct, indirect, incidental, special, exemplary, punitive or consequential damages, or loss of profits, cryptocurrencies, tokens, or anything else of value.
