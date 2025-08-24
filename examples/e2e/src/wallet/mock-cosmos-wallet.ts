import { Chain } from '@chain-registry/types';
import { CosmosWallet, Wallet, WalletAccount, DirectSignDoc, SignOptions, ExtensionWallet } from '@interchain-kit/core';
import { Secp256k1HDWallet } from '@interchainjs/cosmos/wallets/secp256k1hd';
import { DirectSignResponse } from '@interchainjs/cosmos';
import { HDPath } from '@interchainjs/types';


export class MockMultiChainWallet extends ExtensionWallet {
  async init() {
    await Promise.resolve()
  }
}


export class MockCosmosWallet extends CosmosWallet {

  directWalletMap: Record<Chain['chainName'], Secp256k1HDWallet> = {}
  cosmosHdPath: string = "m/44'/118'/0'/0/0";
  mnemonic: string

  constructor(info: Wallet, mnemonic: string) {
    super(info)
    this.mnemonic = mnemonic;
  }
  async init(): Promise<void> {
    return super.init()
  }
  async connect(chainId: string): Promise<void> {
    if (this.client) {
      return super.connect(chainId);
    }
    const chain = this.getChainById(chainId)


    //create mock address base on chainId
    const wallet = await Secp256k1HDWallet.fromMnemonic(this.mnemonic, {
      derivations: [{
        prefix: chain.bech32Prefix || 'osmosis',
        hdPath: this.cosmosHdPath
      }]
    });

    this.directWalletMap[chain.chainName] = wallet
  }
  async disconnect(chainId: string): Promise<void> {

  }

  async signDirect(chainId: string, signer: string, signDoc: DirectSignDoc, signOptions?: SignOptions): Promise<DirectSignResponse> {
    const chain = this.getChainById(chainId);
    const wallet = this.directWalletMap[chain.chainName];
    if (!wallet) {
      throw new Error(`Wallet not connected for chain: ${chainId}`);
    }
    const accounts = await wallet.getAccounts();
    const account = accounts.find(acc => acc.address === signer);
    if (!account) {
      throw new Error(`Signer address not found in wallet for chain: ${chainId}`);
    }
    return wallet.signDirect(signer, signDoc as SignDoc);
  }

  async getAccount(chainId: string): Promise<WalletAccount> {

    if (this.client) {
      return super.getAccount(chainId);
    }


    const chain = this.getChainById(chainId);
    const wallet = this.directWalletMap[chain.chainName];
    if (!wallet) {
      throw new Error(`Wallet not connected for chain: ${chainId}`);
    }
    const accounts = await (await wallet.toOfflineDirectSigner()).getAccounts()

    return {
      address: accounts[0].address || '',
      algo: 'secp256k1',
      pubkey: accounts[0].pubkey as Uint8Array,
      username: undefined,
      isNanoLedger: false,
      isSmartContract: false,
    }
  }
  async getOfflineSigner(chainId: string, preferredSignType?: unknown) {
    const chain = this.getChainById(chainId);

    const wallet = this.directWalletMap[chain.chainName];
    if (!wallet) {
      throw new Error(`Wallet not connected for chain: ${chainId}`);
    }
    return {
      getAccounts: async () => [await this.getAccount(chainId)],
      signDirect: async (signer, signDoc) => {
        return this.signDirect(chainId, signer, signDoc as DirectSignDoc);
      }
    }
  }




  addSuggestChain(chainId: string | undefined): Promise<void> {
    throw new Error('Method not implemented.');
  }
  getProvider(chainId: string | undefined): Promise<any> {
    throw new Error('Method not implemented.');
  }

}

