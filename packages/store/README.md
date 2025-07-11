# @interchain-kit/store

<p align="center">
  <img src="https://user-images.githubusercontent.com/545047/188804067-28e67e5e-0214-4449-ab04-2e0c564a6885.svg" width="80"><br />
  <strong>Interchain Kit Wallet State Manager</strong><br />
  <em>A powerful state management solution for multi-wallet, multi-chain applications</em>
</p>

## 📦 Installation

```sh
npm install @interchain-kit/store
```

## 🎯 Overview

`@interchain-kit/store` is a comprehensive state management library designed specifically for managing wallet connections across multiple blockchain networks in the Interchain ecosystem. It provides a unified interface for handling wallet states, connections, and operations across different chains and wallet types.

## ✨ Key Features

- **🔄 Multi-Wallet Support**: Manage multiple wallet types (Keplr, Metamask, WalletConnect, etc.)
- **⛓️ Multi-Chain Support**: Handle wallet connections across different blockchain networks
- **💾 State Persistence**: Automatic state saving and restoration from localStorage
- **📡 Reactive State Management**: Observable state system with automatic change notifications
- **🎯 Flat State Architecture**: Efficient state management using flattened state structure
- **🎯 Error Handling**: Comprehensive error handling and state recovery

## ️ Architecture

### Three-Layer Architecture

```
WalletStoreManager (Global Manager)
├── WalletStore (Wallet Level Manager)
    └── ChainWalletStore (Chain Wallet Implementation)
```

### Core Components

- **`WalletStoreManager`**: Central manager handling global state and persistence
- **`WalletStore`**: Individual wallet manager for cross-chain operations
- **`ChainWalletStore`**: Specific chain wallet implementation for connections and signing
- **`ObservableState`**: Reactive state management engine
- **`Flat State Utils`**: Utilities for efficient state management

## 🚀 Quick Start

### Basic Setup

```typescript
import { WalletStoreManager } from '@interchain-kit/store';
import { Config } from '@interchain-kit/core';

// Configuration
const config: Config = {
  chains: [cosmosChain, ethereumChain],
  assetLists: [cosmosAssets, ethereumAssets],
  wallets: [keplrWallet, metamaskWallet],
  signerOptions: {
    preferredSignType: (chainName) => 'amino',
    signing: (chainName) => ({})
  },
  endpointOptions: {
    endpoints: {
      cosmoshub: {
        rpc: ['https://rpc.cosmos.network'],
        rest: ['https://api.cosmos.network']
      }
    }
  }
};

// Create store manager
const storeManager = new WalletStoreManager(config);

// Initialize
await storeManager.init();
```

### Connecting to Wallets

```typescript
// Connect to a specific wallet and chain
await storeManager.connect('keplr-extension', 'cosmoshub');

// Get account information
const account = await storeManager.getAccount('keplr-extension', 'cosmoshub');

// Get offline signer
const signer = await storeManager.getOfflineSigner('keplr-extension', 'cosmoshub');
```

### State Subscription

```typescript
// Subscribe to state changes
const unsubscribe = storeManager.subscribe((state) => {
  console.log('State changed:', state);
});

// Subscribe to specific state changes
const unsubscribeSelector = storeManager.subscribeWithSelector(
  (state) => state.currentWalletName,
  (walletName) => {
    console.log('Current wallet changed:', walletName);
  }
);
```

##  State Management

### State Structure

```typescript
interface WalletStoreManagerState {
  isReady: boolean;
  currentWalletName: string;
  currentChainName: string;
  chainWalletStates: ChainWalletState[];
  walletConnectQRCodeUri: string;
}

interface ChainWalletState {
  walletName: string;
  chainName: string;
  walletState: WalletState;
  account: WalletAccount | null;
  errorMessage: string | null;
  rpcEndpoint: string;
}
```

### Wallet States

```typescript
enum WalletState {
  Disconnected = 'Disconnected',
  Connecting = 'Connecting',
  Connected = 'Connected',
  Rejected = 'Rejected',
  NotExist = 'NotExist',
}
```

##  API Reference

### WalletStoreManager

#### Core Methods

- `init()`: Initialize the store manager
- `connect(walletName, chainName)`: Connect to a specific wallet and chain
- `disconnect(walletName, chainName)`: Disconnect from a wallet and chain
- `getAccount(walletName, chainName)`: Get account information
- `getOfflineSigner(walletName, chainName)`: Get offline signer
- `getSigningClient(walletName, chainName)`: Get signing client

#### State Management

- `subscribe(listener)`: Subscribe to state changes
- `subscribeWithSelector(selector, listener)`: Subscribe to specific state changes
- `setCurrentWalletName(name)`: Set current wallet
- `setCurrentChainName(chainName)`: Set current chain

#### Utility Methods

- `getWalletByName(name)`: Get wallet by name
- `getChainWalletByName(walletName, chainName)`: Get chain wallet by name
- `getChainLogoUrl(chainName)`: Get chain logo URL
- `getDownloadLink(walletName)`: Get wallet download link

## 🛠️ Development

### Building

```sh
# Install dependencies
yarn

# Build production packages
yarn build

# Build development packages with source maps
yarn build:dev
```

### Testing

```sh
# Run tests
yarn test

# Run tests in watch mode
yarn test:watch
```

### Development Workflow

```sh
# Watch for changes during development
yarn watch:dev
```

##  Dependencies

- `@interchain-kit/core`: Core functionality and types
- `chain-registry`: Chain registry for blockchain information
- `interchainjs`: Interchain JavaScript SDK for signing operations

## 🤝 Contributing

We welcome contributions! Please see our [contributing guidelines](https://github.com/hyperweb-io/interchain-kit/blob/main/CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏗️ Interchain JavaScript Stack

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

## 🏆 Credits

🛠 Built by Hyperweb (formerly Cosmology) — if you like our tools, please checkout and contribute to [our github ⚛️](https://github.com/hyperweb-io)

## ⚠️ Disclaimer

AS DESCRIBED IN THE LICENSES, THE SOFTWARE IS PROVIDED "AS IS", AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND.

No developer or entity involved in creating this software will be liable for any claims or damages whatsoever associated with your use, inability to use, or your interaction with other users of the code, including any direct, indirect, incidental, special, exemplary, punitive or consequential damages, or loss of profits, cryptocurrencies, tokens, or anything else of value.
