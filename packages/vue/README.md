# @interchain-kit/vue

<p align="center" width="100%">
    <img height="90" src="https://user-images.githubusercontent.com/545047/190171432-5526db8f-9952-45ce-a745-bea4302f912b.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/hyperweb-io/cosmos-kit/actions/workflows/run-tests.yml">
    <img height="20" src="https://github.com/hyperweb-io/cosmos-kit/actions/workflows/run-tests.yml/badge.svg" />
  </a>
  <a href="https://github.com/hyperweb-io/lib-count">
    <img height="20" src="https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fhyperweb-io%2Flib-count%2Fmain%2Foutput%2Fbadges%2Fproducts%2Fcosmos-kit%2Ftotal.json"/>  
  </a>
  <a href="https://github.com/hyperweb-io/lib-count">
    <img height="20" src="https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fhyperweb-io%2Flib-count%2Fmain%2Foutput%2Fbadges%2Fproducts%2Fcosmos-kit%2Fmonthly.json"/>  
  </a>
  <br />
   <a href="https://github.com/hyperweb-io/cosmos-kit/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-BSD%203--Clause%20Clear-blue.svg"></a>
   <a href="https://www.npmjs.com/package/cosmos-kit"><img height="20" src="https://img.shields.io/github/package-json/v/hyperweb-io/cosmos-kit?filename=packages%2Fcosmos-kit%2Fpackage.json"></a>
</p>

## Install
Using npm:
```sh
npm install @interchain-kit/vue
```
Using yarn:
```sh
yarn add @interchain-kit/vue
```

## Usage
### Setup
#### import `@interchain-ui/vue` stylesheet.
`main.ts`
```ts
import "@interchain-ui/vue/style.css";
```
#### import chain registry info that you need
`App.ts`
```vue
<script setup lang="ts">
import { ChainProvider } from '@interchain-kit/vue'
import { keplrWallet } from '@interchain-kit/keplr-extension';
import { leapWallet } from '@interchain-kit/leap-extension';
import { RouterView } from 'vue-router';
import { chain as junoChain, assetList as junoAssetList } from "chain-registry/mainnet/juno";
import { chain as osmosisChain,assetList as osmosisAssetList } from "chain-registry/mainnet/osmosis";
import { chain as cosmoshubChain, assetList as cosmoshubAssetList } from "chain-registry/mainnet/cosmoshub";
import { chain as osmosisTestChain, assetList as osmosisTestAssetList } from "chain-registry/testnet/osmosistestnet"
</script>

<template>
  <ChainProvider
    :wallets="[keplrWallet, leapWallet]"
    :chains="[osmosisChain, junoChain, cosmoshubChain, osmosisTestChain]"
    :asset-lists="[osmosisAssetList, junoAssetList, cosmoshubAssetList, osmosisTestAssetList]"
    :signer-options="{}"
    :endpoint-options="{}"
  >
    <router-view />
  </ChainProvider>
</template>

<style scoped>
</style>
```

#### or import all chain registry
`App.ts`
```vue
<script setup lang="ts">
import { ChainProvider } from '@interchain-kit/vue';
import { keplrWallet } from '@interchain-kit/keplr-extension';
import { chains, assetLists } from 'chain-registry/mainnet';
import Show from './views/show.vue';
</script>

<template>
  <ChainProvider
    :wallets="[keplrWallet]"
    :chains="[chains]"
    :asset-lists="[assetLists]"
    :signer-options="{}"
    :endpoint-options="{}"
  >
    <show />
  </ChainProvider>
</template>

<style scoped>
</style>
```
`show.vue`
```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useChain } from '@interchain-kit/vue';

const chainName = ref('osmosis')
const { address } = useChain(chainName);
</script>

<template>
  <div>
    <div>address: {{ address }}</div>
  </div>
</template>

<style scoped>
</style>
```

### useChain
```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useChain } from '@interchain-kit/vue';

const chainName = ref('osmosistestnet')
const { chain, assetList, address, wallet, queryClient, signingClient } = useChain(chainName)
const balance = ref('0')

const getBalance = async() => {
  const {balance: bc} =  await queryClient.value.balance({
    address: address.value,
    denom: 'uosmo',
  })
  balance.value = bc?.amount || '0'
}
</script>

<template>
  <div>
    <div>chain: {{ chain.prettyName }}</div>
    <div>assetList: {{ assetList?.assets?.length }}</div>
    <div>address: {{ address }}</div>
    <div>wallet: {{ wallet?.option?.prettyName }}</div>
    <div>balance: {{ balance }}</div> <button @click="getBalance">getBalance</button>
  </div>
</template>

<style scoped>
</style>
```

### useChainWallet
`App.ts`
```vue
<script setup lang="ts">
import { ChainProvider } from '@interchain-kit/vue'
import { keplrWallet } from '@interchain-kit/keplr-extension';
import { leapWallet } from '@interchain-kit/leap-extension';
import Show from './views/show.vue';
import { chains, assetLists } from 'chain-registry/mainnet';

const chainNames = ['juno', 'stargaze']
</script>

<template>
  <ChainProvider
    :wallets="[keplrWallet, leapWallet]"
    :chains="chains.filter(c => chainNames.includes(c.chainName))"
    :asset-lists="assetLists.filter(c => chainNames.includes(c.chainName))"
    :signer-options="{}"
    :endpoint-options="{}"
  >
    <show />
  </ChainProvider>
</template>

<style scoped>
</style>

```
`show.vue`
```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useChainWallet, useWalletManager } from '@interchain-kit/vue';

const junoChainName = ref('juno')
const keplrWalletName = ref('keplr-extension')
const juno = useChainWallet(junoChainName, keplrWalletName);

const stargazeChainName = ref('stargaze')
const leapWalletName = ref('leap-extension')
const stargaze = useChainWallet(stargazeChainName, leapWalletName);

const walletManager = useWalletManager()
	
const connectKeplr = async() => {
  await walletManager.connect('keplr-extension')
}
const connectLeap = async() => {
  await walletManager.connect('leap-extension')
}
</script>

<template>
  <div>
    <button @click="connectKeplr">connect keplr</button>
    <button @click="connectLeap">connect leap</button>
    <div>juno address: {{ juno.address }}</div>
    <div>stargaze address: {{ stargaze.address }}</div>
  </div>
</template>

<style scoped>
</style>
```

### useChains

```ts
WIP
```

## Developing

When first cloning the repo, under project root directory run:
```bash
yarn
# build the prod packages. When devs would like to navigate to the source code, this will only navigate from references to their definitions (.d.ts files) between packages.
yarn build
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