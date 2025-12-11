# @interchain-kit/core

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
npm install @interchain-kit/core
```

Using yarn:
```
yarn add @interchain-kit/core 
```
## Usage
#### Connect
```js
import { chain as cosmoshubChain, assetList as cosmoshubAssetList } from 'chain-registry/mainnet/cosmoshub'
import { chain as junoChain, assetList as junoAssetList } from 'chain-registry/mainnet/juno'
import { WalletManager } from '@interchain-kit/core'
import { keplrWallet } from '@interchain-kit/keplr-extension'


const walletManager = await WalletManager.create(
  [cosmoshubChain, junoChain],
  [cosmoshubAssetList, junoAssetList],
  [keplrWallet]
)

// pop up keplr extension wallet connect window to connect cosmoshub chain
await walletManager.connect(keplrWallet.info?.name as string, cosmoshubChain.chainName)

// pop up keplr extension wallet connect window to connect juno chain
await walletManager.connect(keplrWallet.info?.name as string, junoChain.chainName)


// disconnect cosmoshub chain from keplr wallet extension
await walletManager.disconnect(keplrWallet.info?.name as string, cosmoshubChain.chainName)

// disconnect juno chain from keplr wallet extension
await walletManager.disconnect(keplrWallet.info?.name as string, junoChain.chainName)


```
#### Account
```js

import osmosis from 'chain-registry/mainnet/osmosis';
import cosmoshub from 'chain-registry/mainnet/cosmoshub'
import { WalletManager } from '@interchain-kit/core';
import { keplrWallet } from '@interchain-kit/keplr-extension';

const walletManager = await WalletManager.create(
    [osmosis.chain, cosmoshub.chain],
    [osmosis.assetList, cosmoshub.assetList],
    [keplrWallet])

// return account of osmosis chain from keplr wallet extension
const account = await walletManager.getAccount(keplrWallet.info?.name as string, osmosis.chain.chainName)
console.log(account)
// return account of cosmoshub chain from keplr wallet extension
const account2 = await walletManager.getAccount(keplrWallet.info?.name as string, cosmoshub.chain.chainName)
console.log(account2)

```
#### Query (balance)
```ts

import { chain as osmosisChain, assetList as osmosisAssetList } from 'chain-registry/mainnet/osmosis';
import { WalletManager } from '@interchain-kit/core';
import { keplrWallet } from '@interchain-kit/keplr-extension';
import { createGetBalance } from "interchainjs/cosmos/bank/v1beta1/query.rpc.func";

const walletManager = await WalletManager.create(
    [osmosisChain],
    [osmosisAssetList],
    [keplrWallet])

const account = await walletManager.getAccount(keplrWallet.info?.name as string, osmosisChain.chainName)
const osmosisRpcEndpoint = await walletManager.getRpcEndpoint(keplrWallet.info?.name as string, osmosisChain.chainName)

const balanceQuery = createGetBalance(osmosisRpcEndpoint as string);
const { balance } = await balanceQuery({
    address: account.address,
    denom: osmosisChain.staking?.stakingTokens[0].denom as string,
});

console.log(balance)

/**
 * { amount: '26589633', denom: 'uosmo' }
 */
```
#### Signing (send tx)
```ts

import { chain as osmosisChain, assetList as osmosisAssetList } from 'chain-registry/mainnet/osmosis';
import { WalletManager } from '@interchain-kit/core';
import { keplrWallet } from '@interchain-kit/keplr-extension';
import { createSend } from "interchainjs/cosmos/bank/v1beta1/tx.rpc.func";

const walletManager = await WalletManager.create(
  [osmosisChain],
  [osmosisAssetList],
  [keplrWallet])

const signingClient = await walletManager.getSigningClient(keplrWallet.info?.name as string, osmosisChain.chainName)
const account = await walletManager.getAccount(keplrWallet.info?.name as string, osmosisChain.chainName)
const txSend = createSend(signingClient);

const denom = osmosisChain.staking?.stakingTokens[0].denom as string

const fromAddress = account.address

const fee = {
  amount: [{
    denom,
    amount: '25000'
  }],
  gas: "1000000",
};

const message = {
  fromAddress: fromAddress,
  toAddress: 'osmo10m5gpakfe95t5k86q5fhqe03wuev7g3ac2lvcu',
  amount: [
    {
      denom,
      amount: '1'
    },
  ],
}

const memo = "test"

await txSend(
  fromAddress,
  message,
  fee,
  memo
)

// pop up confirm modal from wallet to start signing process
```

## Developing

When first cloning the repo:

```
yarn
yarn dev
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

