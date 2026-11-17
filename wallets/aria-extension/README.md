# @interchain-kit/aria-extension

Aria browser extension wallet adapter for [Interchain Kit](https://github.com/hyperweb-io/interchain-kit).

[Aria](https://aria.orchestralabs.org) is a multi-chain wallet by Orchestra Labs. This package connects dApps to `window.aria`, Aria's Keplr-compatible provider, for Cosmos chains, to `window.aria.ethereum` for EVM chains, and to `window.aria.solana` for Solana.

## Install

```sh
npm install @interchain-kit/aria-extension @interchain-kit/react
```

## Usage

```tsx
import { ChainProvider } from '@interchain-kit/react';
import { ariaWallet } from '@interchain-kit/aria-extension';
import { chain as cosmoshubChain, assetList as cosmoshubAssetList } from 'chain-registry/mainnet/cosmoshub';

export function App() {
  return (
    <ChainProvider
      chains={[cosmoshubChain]}
      assetLists={[cosmoshubAssetList]}
      wallets={[ariaWallet]}
    >
      {/* your app */}
    </ChainProvider>
  );
}
```

## Requirements

- [Aria extension](https://chromewebstore.google.com/detail/aria-wallet/cgghllcclkhfpkjhgomhehlebgphifbm) installed (Chrome)

## How it works

The adapter detects Aria via `window.aria` and uses the standard `CosmosWallet` implementation (`enable`, `getKey`, `signAmino`, `signDirect`, `signArbitrary`, `sendTx`, etc.) `EthereumWallet` for EVM chains, and `SolanaWallet` for Solana.

Aria's `enable` connects the site without checking the chain, so on connect the adapter asks Aria for the account key and, if Aria reports the chain as unknown, suggests it through `experimentalSuggestChain` with the chain's registry data.
