import { EthereumWallet, Wallet, WalletAccount } from '@interchain-kit/core';
import { ethers, HDNodeWallet } from 'ethers';

export interface MockEthereumNetwork {
  chainId: number;
  name: string;
  rpcUrl: string;
  blockExplorer?: string;
  currencySymbol: string;
  currencyDecimals: number;
}

export interface MockEthereumWalletOptions extends Wallet {
  mnemonic?: string;
  derivationPaths?: string[];
}

export class MockEthereumWallet extends EthereumWallet {
  private accounts: HDNodeWallet[] = [];
  private currentAccountIndex: number = 0;
  private currentChainId: string = '1'; // Default to Ethereum mainnet


  private mnemonic: string;
  private derivationPaths: string[];
  private walletMap: {
    [chainId: string]: {
      [accountIndex: string]: {
        wallet: HDNodeWallet,
        provider: ethers.JsonRpcProvider,
        signer: ethers.Wallet
      }
    }
  } = {};

  constructor(options: Wallet, mnemonic: string) {
    super(options);

    // 设置默认值
    this.mnemonic = mnemonic;
    this.derivationPaths = [
      `44'/60'/0'/0/0`,  // 第一个钱包
      `44'/60'/0'/0/1`   // 第二个钱包
    ];


  }


  async init(): Promise<void> {
    const chains = Array.from(this.chainMap.values());

    this.currentChainId = chains[0].chainId;

    for (const chain of chains) {

      const hdNode = ethers.HDNodeWallet.fromPhrase(this.mnemonic);

      const wallet0 = hdNode.derivePath("44'/60'/0'/0/0");

      const wallet1 = hdNode.derivePath("44'/60'/0'/0/1");

      const rpc = chain.apis?.rpc[0].address || '';

      const provider = new ethers.JsonRpcProvider(rpc);

      this.walletMap[chain.chainId] = {
        0: {
          wallet: wallet0,
          provider,
          signer: new ethers.Wallet(wallet0.privateKey, provider)
        },
        1: {
          wallet: wallet1,
          provider,
          signer: new ethers.Wallet(wallet1.privateKey, provider)
        }
      };

    }

    return Promise.resolve();
  }

  async connect(chainId: string): Promise<void> {
    await this.switchChain(chainId);
    return Promise.resolve();
  }

  async disconnect(): Promise<void> {


    return Promise.resolve();
  }

  async switchChain(chainId: string): Promise<void> {

    this.currentChainId = chainId;

  }

  async switchAccount(): Promise<void> {

    this.currentAccountIndex = this.currentAccountIndex === 0 ? 1 : 0;
    this.events.emit('accountChanged', () => { });
  }

  async getAccount(): Promise<WalletAccount> {
    const account = this.walletMap[this.currentChainId][this.currentAccountIndex].wallet;

    return {
      address: account.address,
      pubkey: new Uint8Array(), // Ethereum doesn't use pubkey in the same way
      algo: 'eth_secp256k1',
      isNanoLedger: false,
      isSmartContract: false,
      username: `Account ${this.currentAccountIndex + 1}`
    };
  }

  async getAccounts(): Promise<HDNodeWallet[]> {
    return this.accounts;
  }

  async getCurrentAccount(): Promise<HDNodeWallet> {
    return this.accounts[this.currentAccountIndex];
  }




  async getBalance(): Promise<string> {

    const { provider, wallet } = this.walletMap[this.currentChainId][this.currentAccountIndex];

    const balance = await provider.getBalance(wallet.address);


    return ethers.formatEther(balance);
  }

  async sendTransaction(transaction: {
    from: string;
    to: string;
    value: string;
    data?: string;
    gasLimit?: string;
    gasPrice?: string;
  }): Promise<string> {
    const { signer } = this.walletMap[this.currentChainId][this.currentAccountIndex];

    const tx = await signer.sendTransaction({
      from: transaction.from,
      to: transaction.to,
      value: transaction.value,
      // data: transaction.data || '0x',
      // gasLimit: transaction.gasLimit ? BigInt(transaction.gasLimit) : undefined,
      // gasPrice: transaction.gasPrice ? ethers.parseUnits(transaction.gasPrice, 'gwei') : undefined
    });

    console.log(`Transaction sent: ${tx.hash}`);
    return tx.hash;
  }

  async signMessage(message: string): Promise<string> {

    const { signer } = this.walletMap[this.currentChainId][this.currentAccountIndex];
    const signature = await signer.signMessage(message);
    console.log(`Message signed: ${signature}`);
    return signature;
  }

  async signTypedData(domain: any, types: any, value: any): Promise<string> {
    const { signer } = this.walletMap[this.currentChainId][this.currentAccountIndex];

    const signature = await signer.signTypedData(domain, types, value);
    console.log(`Typed data signed: ${signature}`);
    return signature;
  }

  async getProvider(): Promise<ethers.JsonRpcProvider> {
    return this.walletMap[this.currentChainId][this.currentAccountIndex].provider;
  }




  getWalletInfo(): {
    mnemonic: string;
    derivationPaths: string[];
    accountCount: number;
    currentAccountIndex: number;
    } {
    return {
      mnemonic: this.mnemonic,
      derivationPaths: [...this.derivationPaths],
      accountCount: this.accounts.length,
      currentAccountIndex: this.currentAccountIndex
    };
  }
}