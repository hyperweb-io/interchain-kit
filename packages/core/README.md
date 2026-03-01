# @interchain-kit/core

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
npm install @interchain-kit/core
```

Using pnpm:
```
pnpm add @interchain-kit/core 
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
pnpm
pnpm dev
```
