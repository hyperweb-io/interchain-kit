import { Chain } from '@chain-registry/types';
import { OfflineAminoSigner, Secp256k1HdWallet } from '@cosmjs/amino';
import { DirectSecp256k1HdWallet, OfflineDirectSigner } from '@cosmjs/proto-signing';
import { Algo, BaseWallet, BroadcastMode, SimpleAccount, Wallet, WalletAccount } from '@interchain-kit/core';

export class MockWallet extends BaseWallet {

  mnemonic: string | undefined;
  walletMap: { [chainId: string]: DirectSecp256k1HdWallet } = {};
  animoSignerMap: { [chainId: string]: Secp256k1HdWallet } = {};
  chains: Chain[];

  constructor(mnemonic: string, chains: Chain[], options: Wallet) {
    super(options);
    this.mnemonic = mnemonic;
    this.chains = chains;
  }

  setMnemonic(mnemonic: string) {
    this.mnemonic = mnemonic;
  }

  init(meta?: unknown): Promise<void> {
    this.client = {};
    return Promise.resolve(undefined);
  }

  async connect(chainId: string): Promise<void> {
    const chain = this.chains.find(c => c.chainId === chainId);
    if (this.mnemonic) {
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(this.mnemonic, { prefix: chain?.bech32Prefix });
      this.walletMap[chainId] = wallet;

      const animoWallet = await Secp256k1HdWallet.fromMnemonic(this.mnemonic, { prefix: chain?.bech32Prefix });
      this.animoSignerMap[chainId] = animoWallet;
    }
  }

  disconnect(chainId: string | string[]): Promise<void> {
    this.client = null;
    return Promise.resolve(undefined);
  }

  async getAccount(chainId: string): Promise<WalletAccount> {
    const wallet = this.animoSignerMap[chainId];
    const [firstAccount] = await wallet.getAccounts();
    return { ...firstAccount, algo: firstAccount.algo as Algo };
  }

  getAccounts(chainIds: string[]): Promise<WalletAccount[]> {
    throw new Error('Method not implemented.');
  }
  getSimpleAccount(chainId: string): Promise<SimpleAccount> {
    throw new Error('Method not implemented.');
  }
  verifyArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  sendTx(chainId: string, tx: Uint8Array, mode: BroadcastMode): Promise<Uint8Array> {
    throw new Error('Method not implemented.');
  }
  addSuggestChain(chainId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  getProvider(chainId: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
  getOfflineSignerAmino(chainId: string): OfflineAminoSigner {
    const wallet = this.animoSignerMap[chainId];
    return wallet;
  }
  getOfflineSignerDirect(chainId: string): OfflineDirectSigner {
    const wallet = this.walletMap[chainId];
    return wallet;
  }
  signAmino(chainId: string, signer: string, signDoc: any, signOptions?: any): Promise<any> {
    throw new Error('Method not implemented.');
  }
  signArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<any> {
    throw new Error('Method not implemented.');
  }
  signDirect(chainId: string, signer: string, signDoc: any, signOptions?: any): Promise<any> {
    throw new Error('Method not implemented.');
  }
  bindingEvent(): void {
    throw new Error('Method not implemented.');
  }
  unbindingEvent(): void {
    throw new Error('Method not implemented.');
  }
}