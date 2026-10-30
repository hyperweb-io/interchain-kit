# @interchain-kit/zunia-extension

Zunia browser extension adapter for [Interchain Kit](https://github.com/hyperweb-io/interchain-kit).

Zunia is a non-custodial Cosmos wallet. This package connects a dApp to `window.zunia`. On a phone browser, where the extension is not injected, it opens the Zunia app over WalletConnect.

## Install

```sh
npm install @interchain-kit/zunia-extension @interchain-kit/react
```

## Usage

```tsx
import { ChainProvider } from '@interchain-kit/react';
import { zuniaWallet } from '@interchain-kit/zunia-extension';
import { assetList as cosmoshubAssetList, chain as cosmoshubChain } from 'chain-registry/mainnet/cosmoshub';

export function App() {
  return (
    <ChainProvider chains={[cosmoshubChain]} assetLists={[cosmoshubAssetList]} wallets={[zuniaWallet]}>
      {/* your app */}
    </ChainProvider>
  );
}
```

Use the same chain id the extension has. Pass every chain the dApp should connect to in `chains`.

## What it calls

| | |
|---|---|
| Window | `window.zunia` |
| Account change | `zunia_keystorechange` |
| Connect | `enable`, then `experimentalSuggestChain` when the chain is unknown, then `enable` again |
| Sign | `signAmino`, `signDirect`, `signArbitrary` |
| Broadcast | The dApp broadcasts. `sendTx` is refused. |

Chrome 0.1.2: [Chrome Web Store](https://chromewebstore.google.com/detail/zunia/ngokakoekdogobjmokipglbcclelgajk). Install page: [zunialab.com](https://zunialab.com).

There is no Ethereum provider. Do not set an `eip155` chain on this wallet.

## Phone browser

The mobile link is `zunia://wc?uri=<wc-uri>` (Android intent package `com.zuniawallet.zunia_mobile`). That is the URI the Zunia app pairs. For a desktop or in-app WalletConnect session, use `@interchain-kit/zunia-mobile`.
