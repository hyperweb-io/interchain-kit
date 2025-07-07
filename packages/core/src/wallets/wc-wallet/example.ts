
import { GenericSignRequest, Wallet } from '../../types';
import { WCCosmosWallet, WCEthereumWallet, WCWallet } from './index';

/**
 * Example usage of the refactored WC Wallet with UniWallet architecture
 * Now using singleton UniversalProvider pattern with unified event handling
 * Child wallets have simplified constructors - no longer need connection parameters
 * WCWallet implements core wallet methods that delegate to child wallets
 */

// Example wallet configuration
const walletInfo: Wallet = {
  name: 'wallet-connect-example',
  prettyName: 'Wallet Connect Example',
  mode: 'wallet-connect',
  description: 'Example wallet using WalletConnect with UniWallet',
  cosmosKey: 'wc-cosmos',
  ethereumKey: 'wc-ethereum'
};

// Create the main WC wallet (extends UniWallet) - this will manage the UniversalProvider singleton
const wcWallet = new WCWallet(walletInfo);

// Create specific chain type wallets with simplified constructors
// No longer need walletConnectOption parameter since connection is handled by main wallet
const cosmosWallet = new WCCosmosWallet({
  ...walletInfo,
  cosmosKey: 'wc-cosmos'
});

const ethereumWallet = new WCEthereumWallet({
  ...walletInfo,
  ethereumKey: 'wc-ethereum'
});

// Register the specific wallets with the main wallet
wcWallet.setNetworkWallet('cosmos', cosmosWallet as any);
wcWallet.setNetworkWallet('eip155', ethereumWallet as any);

// Example usage
async function exampleUsage() {
  try {
    // Initialize the main wallet - this will create the UniversalProvider singleton
    // and inject it into all child wallets
    await wcWallet.init();

    // Set up pairing URI callback - now handled centrally by main wallet
    wcWallet.setOnPairingUriCreatedCallback((uri) => {
      console.log('Pairing URI:', uri);
      // Display QR code or deep link to user
      // This callback is now unified for all chain types
    });

    // Connect to a Cosmos chain - WCWallet will automatically get connect params from WCCosmosWallet
    await wcWallet.connect('cosmoshub-4');

    // Get account for Cosmos chain - delegated to WCCosmosWallet
    const cosmosAccount = await wcWallet.getAccount('cosmoshub-4');
    console.log('Cosmos account:', cosmosAccount);

    // Get offline signer for Cosmos - delegated to WCCosmosWallet
    const cosmosSigner = await wcWallet.getOfflineSigner('cosmoshub-4');
    console.log('Cosmos signer:', cosmosSigner);

    // Sign with Cosmos - delegated to WCCosmosWallet
    const cosmosSignRequest: GenericSignRequest = {
      method: 'cosmos_amino',
      chainId: 'cosmoshub-4',
      data: {
        chain_id: 'cosmoshub-4',
        account_number: '1',
        sequence: '0',
        fee: {
          gas: '200000',
          amount: [{ denom: 'uatom', amount: '1000' }]
        },
        msgs: [{
          type: 'cosmos-sdk/MsgSend',
          value: {
            from_address: cosmosAccount.address,
            to_address: 'cosmos1...',
            amount: [{ denom: 'uatom', amount: '1000000' }]
          }
        }],
        memo: ''
      }
    };

    const cosmosSignResponse = await wcWallet.sign('cosmoshub-4', cosmosSignRequest);
    console.log('Cosmos sign response:', cosmosSignResponse);

    // Connect to an Ethereum chain - WCWallet will automatically get connect params from WCEthereumWallet
    await wcWallet.connect('1'); // Ethereum mainnet

    // Get account for Ethereum chain - delegated to WCEthereumWallet
    const ethereumAccount = await wcWallet.getAccount('1');
    console.log('Ethereum account:', ethereumAccount);

    // Get provider for Ethereum - delegated to WCEthereumWallet
    const ethereumProvider = await wcWallet.getProvider('1');
    console.log('Ethereum provider:', ethereumProvider);

    // Sign with Ethereum - delegated to WCEthereumWallet
    const ethereumSignRequest: GenericSignRequest = {
      method: 'ethereum_message',
      chainId: '1',
      data: 'Hello, Ethereum!'
    };

    const ethereumSignResponse = await wcWallet.sign('1', ethereumSignRequest);
    console.log('Ethereum sign response:', ethereumSignResponse);

    // Test ping functionality
    const pingResult = await wcWallet.ping();
    console.log('Ping result:', pingResult);

    // Disconnect - handled by main wallet
    await wcWallet.disconnect('cosmoshub-4');
    await wcWallet.disconnect('1');

  } catch (error) {
    console.error('Error:', error);
  }
}

// Example of direct usage of child wallets (if needed)
async function directChildWalletUsage() {
  try {
    // Initialize main wallet first
    await wcWallet.init();

    // Now child wallets have access to the shared provider
    await cosmosWallet.init(); // This will use the injected provider
    await ethereumWallet.init(); // This will use the injected provider

    // Use child wallets for business logic only
    // Note: Child wallets no longer handle connect/disconnect directly
    const cosmosAccount = await cosmosWallet.getAccount('cosmoshub-4');
    console.log('Direct Cosmos account:', cosmosAccount);

    // Check connect params for Cosmos
    const cosmosParams = await cosmosWallet.getConnectParams('cosmoshub-4');
    console.log('Cosmos connect params:', cosmosParams);

    // Check connect params for Ethereum
    const ethereumParams = await ethereumWallet.getConnectParams('1');
    console.log('Ethereum connect params:', ethereumParams);

    // Try to connect directly on child wallet (will throw error)
    try {
      await cosmosWallet.connect('cosmoshub-4'); // This will throw an error
    } catch (error) {
      console.log('Expected error:', (error as Error).message);
    }

  } catch (error) {
    console.error('Direct usage error:', error);
  }
}

// Example showing unified event handling
async function unifiedEventHandling() {
  try {
    await wcWallet.init();

    // All WalletConnect events are now handled centrally
    // No need to set up callbacks on individual child wallets

    // The main wallet handles:
    // - display_uri (pairing URI)
    // - disconnect
    // - session_delete
    // - session_event
    // - session_request

    await wcWallet.connect('cosmoshub-4');
    console.log('Connected to Cosmos with unified event handling');

  } catch (error) {
    console.error('Unified event handling error:', error);
  }
}

// Example showing core wallet methods delegation
async function coreMethodsDelegation() {
  try {
    await wcWallet.init();
    await wcWallet.connect('cosmoshub-4');

    // WCWallet delegates these core methods to child wallets:

    // 1. getAccount - delegates to WCCosmosWallet.getAccount()
    const account = await wcWallet.getAccount('cosmoshub-4');
    console.log('Account via WCWallet:', account);

    // 2. getOfflineSigner - delegates to WCCosmosWallet.getOfflineSigner()
    const signer = await wcWallet.getOfflineSigner('cosmoshub-4');
    console.log('Signer via WCWallet:', signer);

    // 3. sign - delegates to WCCosmosWallet.sign()
    const signRequest: GenericSignRequest = {
      method: 'cosmos_amino',
      chainId: 'cosmoshub-4',
      data: {
        chain_id: 'cosmoshub-4',
        account_number: '1',
        sequence: '0',
        fee: {
          gas: '200000',
          amount: [{ denom: 'uatom', amount: '1000' }]
        },
        msgs: [{
          type: 'cosmos-sdk/MsgSend',
          value: {
            from_address: account.address,
            to_address: 'cosmos1...',
            amount: [{ denom: 'uatom', amount: '1000000' }]
          }
        }],
        memo: ''
      }
    };
    const signResponse = await wcWallet.sign('cosmoshub-4', signRequest);
    console.log('Sign response via WCWallet:', signResponse);

    // 4. addSuggestChain - delegates to WCCosmosWallet.addSuggestChain()
    try {
      await wcWallet.addSuggestChain('cosmoshub-4');
    } catch (error) {
      console.log('addSuggestChain not implemented in child wallet');
    }

  } catch (error) {
    console.error('Core methods delegation error:', error);
  }
}

// Example showing how to add a new chain type
async function addNewChainType() {
  // This shows how easy it is to add new chain types
  // Each chain wallet manages its own connect parameters
  // No need to handle pairing URI callbacks in child wallets
  // No need to implement connect/disconnect in child wallets
  // Simplified constructor - no connection parameters needed

  // Example: Adding Solana support
  // class WCSolanaWallet extends BaseWallet {
  //   constructor(option?: any) {
  //     // Simplified constructor - no walletConnectOption needed
  //     const defaultOption = {
  //       name: 'WalletConnect Solana',
  //       prettyName: 'Wallet Connect Solana',
  //       mode: 'wallet-connect',
  //       logo: WalletConnectIcon
  //     };
  //     super({ ...defaultOption, ...option });
  //   }
  //   
  //   async getConnectParams(chainId: Chain['chainId']) {
  //     return {
  //       solana: {
  //         methods: ['solana_signTransaction', 'solana_signMessage'],
  //         chains: [`solana:${chainId}`],
  //         events: ['accountsChanged']
  //       }
  //     };
  //   }
  //   
  //   // Implement core wallet methods
  //   async getAccount(chainId: Chain['chainId']): Promise<WalletAccount> {
  //     // Solana-specific account retrieval
  //   }
  //   
  //   async getOfflineSigner(chainId: Chain['chainId']): Promise<GenericOfflineSigner> {
  //     // Solana-specific signer
  //   }
  //   
  //   async sign(chainId: Chain['chainId'], data: GenericSignRequest): Promise<GenericSignResponse> {
  //     // Solana-specific signing
  //   }
  //   
  //   // No need for connect/disconnect - handled by main wallet
  //   // No need for event handling - centralized in main wallet
  //   // No need for walletConnectOption in constructor
  // }

  // const solanaWallet = new WCSolanaWallet(walletInfo);
  // wcWallet.setNetworkWallet('solana', solanaWallet);
  // await wcWallet.connect('mainnet-beta');
  // const solanaAccount = await wcWallet.getAccount('mainnet-beta');
  // const solanaSigner = await wcWallet.getOfflineSigner('mainnet-beta');
}

export { addNewChainType, coreMethodsDelegation, cosmosWallet, directChildWalletUsage, ethereumWallet, exampleUsage, unifiedEventHandling, wcWallet };
