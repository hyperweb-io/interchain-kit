# @interchain-kit/eightsaf-extension

EightSaf browser extension wallet adapter for [Interchain Kit](https://github.com/hyperweb-io/interchain-kit).

EightSaf is a non-custodial wallet for [Safrochain](https://safrochain.com). This package connects dApps to `window.eightsaf` using the standard Interchain Kit wallet interface (connect, sign, broadcast).

## Install

```sh
npm install @interchain-kit/eightsaf-extension @interchain-kit/react
```

## Usage

Import Safrochain from `chain-registry` when your installed version includes it (see [chain-registry safrochain](https://github.com/hyperweb-io/chain-registry/blob/main/v2/packages/chain-registry/src/mainnet/safrochain/chain.ts)). Otherwise provide chain and asset metadata that matches the network selected in the user's EightSaf extension.

```tsx
import { ChainProvider } from '@interchain-kit/react';
import { eightsafWallet } from '@interchain-kit/eightsaf-extension';
import { chain as safrochainChain, assetList as safrochainAssetList } from 'chain-registry/mainnet/safrochain';

export function App() {
  return (
    <ChainProvider
      chains={[safrochainChain]}
      assetLists={[safrochainAssetList]}
      wallets={[eightsafWallet]}
    >
      {/* your app */}
    </ChainProvider>
  );
}
```

### Testnet

Use `safrochain-testnet-1` when the extension is set to Safrochain Testnet. Import testnet chain data from `chain-registry` when available, or define it manually to match your extension network.

## Requirements

- [EightSaf extension](https://chromewebstore.google.com/detail/eightsaf-wallet/hpemogcffkhcoegjbphljmbjepibnpjj) installed (Chrome or [Firefox](https://addons.mozilla.org/en-US/firefox/addon/eightsaf-wallet/))
- Chain ID in your dApp config must match the network active in the extension (`safrochain-1` or `safrochain-testnet-1`)

## How it works

The adapter detects EightSaf via `window.eightsaf` and delegates to the standard `CosmosWallet` implementation (`enable`, `getKey`, `signAmino`, `signDirect`, `sendTx`, etc.).
