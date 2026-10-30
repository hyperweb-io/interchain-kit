# @interchain-kit/zunia-mobile

Zunia WalletConnect adapter for [Interchain Kit](https://github.com/hyperweb-io/interchain-kit).

Use this when the dApp should pair the Zunia phone app. The browser extension is `@interchain-kit/zunia-extension`.

## Install

```sh
npm install @interchain-kit/zunia-mobile @interchain-kit/react
```

## Usage

```tsx
import { ChainProvider } from '@interchain-kit/react';
import { zuniaMobile } from '@interchain-kit/zunia-mobile';
import { assetList as cosmoshubAssetList, chain as cosmoshubChain } from 'chain-registry/mainnet/cosmoshub';

export function App() {
  return (
    <ChainProvider chains={[cosmoshubChain]} assetLists={[cosmoshubAssetList]} wallets={[zuniaMobile]}>
      {/* your app */}
    </ChainProvider>
  );
}
```

Pass Cosmos chains only. An `eip155` or Solana chain is refused.

## Session

The proposal asks for the methods the app registers:

- `cosmos_getAccounts`
- `cosmos_signAmino`
- `cosmos_signDirect`
- `cosmos_signArbitrary`

Events: `accountsChanged`, `chainChanged`.

On a phone, the pairing URI opens `zunia://wc?uri=<wc-uri>`. Android uses an intent for `com.zuniawallet.zunia_mobile`. On a desktop browser the same URI is the QR code.

`cosmos_getAccounts` keeps the algo the wallet returns, including `eth_secp256k1`.

Zunia is not in the WalletConnect Explorer, so this package does not invent an explorer project id. Pairing uses the dApp project id already configured by Interchain Kit, and the app is opened with its own link.

Suggesting a new chain is not part of WalletConnect. Add the chain in the extension, or with `@interchain-kit/zunia-extension`.

## App

The Zunia app pairs this URI and can approve the session. Returning `cosmos_getAccounts` and the sign methods from that session is still being finished in the app. Until that response is sent, a signature waits. The link and the method list already match the app.
