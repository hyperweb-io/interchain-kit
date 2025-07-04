
import { Wallet, WalletAccount } from '../../src/types';
import { GenericOfflineSigner } from '../../src/types';
import { GenericSignRequest } from '../../src/types/sign-request';
import { GenericSignResponse } from '../../src/types/sign-response';
import { BaseWallet } from '../../src/wallets/base-wallet';

type MockAccount = {
  chainId: string;
  walletName: string;
  account: WalletAccount
}

export const createMockAccount = (addressPrefix: string) => {
  const account: WalletAccount = {
    address: `${addressPrefix}xxxxxxx`,
    algo: 'secp256k1',
    pubkey: new Uint8Array(0)
  };
  return account;
};


export class MockBaseWallet extends BaseWallet<GenericSignRequest, GenericSignResponse, GenericOfflineSigner> {
  mockAccounts: MockAccount[] = [];

  init = jest.fn().mockResolvedValue(undefined);
  connect = jest.fn().mockResolvedValue(undefined);
  disconnect = jest.fn().mockResolvedValue(undefined);
  getAccount = jest.fn().mockImplementation((chainId: string) => {
    const account = this.mockAccounts.find(a => a.chainId === chainId)?.account;
    return account ? Promise.resolve(account) : Promise.reject(new Error('Account not found'));
  });
  getOfflineSigner = jest.fn().mockRejectedValue(new Error('Method not implemented.'));
  addSuggestChain = jest.fn();
  getProvider = jest.fn().mockResolvedValue({});
  sign = jest.fn().mockResolvedValue({
    success: true,
    method: 'cosmos_amino',
    result: {
      signed: {
        bodyBytes: new Uint8Array(),
        authInfoBytes: new Uint8Array(),
        chainId: 'test-chain',
        accountNumber: BigInt(0),
      },
      signature: {
        pub_key: { type: 'tendermint/PubKeySecp256k1', value: '' },
        signature: '',
      },
    },
  });
  setChainMap = jest.fn().mockImplementation((chains) => {
    super.setChainMap(chains);
  });
  addChain = jest.fn().mockImplementation((chain) => {
    super.addChain(chain);
  });
  setAssetLists = jest.fn().mockImplementation((assetLists) => {
    super.setAssetLists(assetLists);
  });
  addAssetList = jest.fn().mockImplementation((assetList) => {
    super.addAssetList(assetList);
  });
  events = {
    on: jest.fn(),
    emit: jest.fn(),
    removeAllListeners: jest.fn(),
  } as any;

  addMockAccount(chainId: string, walletName: string, account: WalletAccount): void {
    this.mockAccounts.push({ chainId, walletName, account });
  }


}

export const createMockWallet = (info: Wallet) => {
  const mockWallet = new MockBaseWallet(info);



  return mockWallet;
};