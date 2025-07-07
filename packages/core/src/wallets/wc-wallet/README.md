# WalletConnect Wallet Implementation

This directory contains the WalletConnect (WC) wallet implementation using the UniWallet architecture. The implementation follows a singleton provider pattern with unified event handling and centralized connection management.

## Architecture Overview

### Main Components

1. **WCWallet** (extends UniWallet)
   - Manages the singleton UniversalProvider instance
   - Handles all WalletConnect connection/disconnection
   - Centralizes event handling (pairing URI, disconnect, session events)
   - Coordinates with child wallets for chain-specific logic
   - **Implements core wallet methods that delegate to child wallets**

2. **WCCosmosWallet** (extends BaseWallet)
   - Handles Cosmos-specific wallet operations
   - Manages Cosmos connect parameters
   - Focuses on Cosmos account and signing operations

3. **WCEthereumWallet** (extends BaseWallet)
   - Handles Ethereum-specific wallet operations
   - Manages Ethereum connect parameters
   - Focuses on Ethereum account and signing operations

## Key Features

### Singleton Provider Pattern
- Single UniversalProvider instance shared across all chain wallets
- Efficient resource usage
- Consistent connection state

### Unified Event Handling
- All WalletConnect events handled centrally in WCWallet
- No duplicate event listeners in child wallets
- Simplified pairing URI callback management

### Decentralized Connect Parameters
- Each child wallet manages its own connect parameters via `getConnectParams()`
- Easy to add new chain types
- Clear separation of chain-specific logic

### Centralized Connection Management
- Connect/disconnect handled only by main WCWallet
- Child wallets throw errors if connect/disconnect called directly
- Consistent user experience across all chains

### Core Wallet Methods Delegation
- WCWallet implements `getAccount()`, `getOfflineSigner()`, `sign()`, `addSuggestChain()`
- These methods automatically delegate to the appropriate child wallet based on chain type
- Provides unified interface for all chain operations

## Usage

### Basic Setup

```typescript
import { WCWallet, WCCosmosWallet, WCEthereumWallet } from './index';

// Create main wallet with configuration
const wcWallet = new WCWallet({
  name: 'wallet-connect-example',
  prettyName: 'Wallet Connect Example',
  mode: 'wallet-connect'
});

// Create child wallets with simplified constructors
// No longer need walletConnectOption parameter
const cosmosWallet = new WCCosmosWallet({
  name: 'WalletConnect Cosmos',
  prettyName: 'Wallet Connect Cosmos',
  mode: 'wallet-connect'
});

const ethereumWallet = new WCEthereumWallet({
  name: 'WalletConnect Ethereum',
  prettyName: 'Wallet Connect Ethereum',
  mode: 'wallet-connect'
});

// Register child wallets
wcWallet.setNetworkWallet('cosmos', cosmosWallet);
wcWallet.setNetworkWallet('eip155', ethereumWallet);
```

### Initialization and Connection

```typescript
// Initialize main wallet (creates UniversalProvider singleton)
await wcWallet.init();

// Set up pairing URI callback (centralized)
wcWallet.setOnPairingUriCreatedCallback((uri) => {
  console.log('Pairing URI:', uri);
  // Display QR code or deep link
});

// Connect to chains (handled by main wallet)
await wcWallet.connect('cosmoshub-4'); // Cosmos
await wcWallet.connect('1'); // Ethereum

// Get accounts (delegated to child wallets)
const cosmosAccount = await wcWallet.getAccount('cosmoshub-4');
const ethereumAccount = await wcWallet.getAccount('1');
```

### Core Wallet Methods

```typescript
// All core methods are delegated to child wallets automatically

// 1. getAccount - delegates to appropriate child wallet
const cosmosAccount = await wcWallet.getAccount('cosmoshub-4'); // WCCosmosWallet
const ethereumAccount = await wcWallet.getAccount('1'); // WCEthereumWallet

// 2. getOfflineSigner - delegates to appropriate child wallet
const cosmosSigner = await wcWallet.getOfflineSigner('cosmoshub-4'); // WCCosmosWallet
const ethereumSigner = await wcWallet.getOfflineSigner('1'); // WCEthereumWallet

// 3. sign - delegates to appropriate child wallet
const cosmosSignRequest: GenericSignRequest = {
  method: 'cosmos_amino',
  chainId: 'cosmoshub-4',
  data: { /* Cosmos sign data */ }
};
const cosmosSignResponse = await wcWallet.sign('cosmoshub-4', cosmosSignRequest);

const ethereumSignRequest: GenericSignRequest = {
  method: 'ethereum_message',
  chainId: '1',
  data: 'Hello, Ethereum!'
};
const ethereumSignResponse = await wcWallet.sign('1', ethereumSignRequest);

// 4. addSuggestChain - delegates to appropriate child wallet
await wcWallet.addSuggestChain('cosmoshub-4'); // WCCosmosWallet
```

### Child Wallet Usage

```typescript
// Child wallets focus on business logic only
const cosmosAccount = await cosmosWallet.getAccount('cosmoshub-4');
const cosmosSigner = await cosmosWallet.getOfflineSigner('cosmoshub-4');

// Check connect parameters
const cosmosParams = await cosmosWallet.getConnectParams('cosmoshub-4');
const ethereumParams = await ethereumWallet.getConnectParams('1');

// Direct connect/disconnect will throw errors
try {
  await cosmosWallet.connect('cosmoshub-4'); // Throws error
} catch (error) {
  console.log('Use WCWallet.connect() instead');
}
```

## Adding New Chain Types

To add support for a new chain type (e.g., Solana):

1. Create a new wallet class extending BaseWallet
2. Implement simplified constructor (no connection parameters needed)
3. Implement `getConnectParams()` method
4. Implement core wallet methods (`getAccount`, `getOfflineSigner`, `sign`)
5. Focus on chain-specific business logic
6. No need to handle connect/disconnect or events

```typescript
class WCSolanaWallet extends BaseWallet {
  constructor(option?: any) {
    // Simplified constructor - no walletConnectOption needed
    const defaultOption = {
      name: 'WalletConnect Solana',
      prettyName: 'Wallet Connect Solana',
      mode: 'wallet-connect',
      logo: WalletConnectIcon
    };
    super({ ...defaultOption, ...option });
  }
  
  async getConnectParams(chainId: Chain['chainId']) {
    return {
      solana: {
        methods: ['solana_signTransaction', 'solana_signMessage'],
        chains: [`solana:${chainId}`],
        events: ['accountsChanged']
      }
    };
  }
  
  // Implement core wallet methods
  async getAccount(chainId: Chain['chainId']): Promise<WalletAccount> {
    // Solana-specific account retrieval
  }
  
  async getOfflineSigner(chainId: Chain['chainId']): Promise<GenericOfflineSigner> {
    // Solana-specific signer
  }
  
  async sign(chainId: Chain['chainId'], data: GenericSignRequest): Promise<GenericSignResponse> {
    // Solana-specific signing
  }
  
  // No need for connect/disconnect - handled by main wallet
  // No need for event handling - centralized in main wallet
}
```

## Benefits

### Modularity
- Clear separation between connection logic and business logic
- Easy to add new chain types
- Focused responsibilities for each component

### Resource Efficiency
- Single UniversalProvider instance
- No duplicate event listeners
- Reduced memory usage

### Consistent User Experience
- Unified connection flow across all chains
- Centralized pairing URI handling
- Consistent error handling

### Maintainability
- Simplified child wallet constructors
- Centralized event management
- Clear architecture patterns

### Unified Interface
- Single entry point for all wallet operations
- Automatic delegation to appropriate child wallets
- Consistent method signatures across all chain types

## Migration from Previous Version

If migrating from the previous implementation:

1. Remove `walletConnectOption` parameter from child wallet constructors
2. Use main wallet's `connect()` and `disconnect()` methods
3. Set up pairing URI callback on main wallet only
4. Remove event handling from child wallets
5. Use `getConnectParams()` for chain-specific connection parameters
6. Use main wallet's core methods (`getAccount`, `getOfflineSigner`, `sign`) instead of child wallet methods

The new architecture provides better separation of concerns, improved resource efficiency, and easier extensibility for new chain types. 