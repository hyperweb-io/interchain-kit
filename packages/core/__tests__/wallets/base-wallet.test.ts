import { Chain } from '@chain-registry/types';

import { BaseSignRequest } from '../../src/types/sign-request';
import { BaseSignResponse } from '../../src/types/sign-response';
import { BaseWallet } from '../../src/wallets/base-wallet';

class TestWallet extends BaseWallet {
  async init(): Promise<void> {

  }
  async connect(chainId: Chain['chainId']): Promise<void> {

  }
  async disconnect(chainId: Chain['chainId']): Promise<void> {

  }
  async getAccount(chainId: Chain['chainId']): Promise<any> {
    return { address: 'test-address' };
  }
  async getOfflineSigner(chainId: Chain['chainId']): Promise<any> {
    return {};
  }
  async addSuggestChain(chainId: Chain['chainId']): Promise<void> { }
  async getProvider(chainId: Chain['chainId']): Promise<any> {
    return {};
  }
  async sign(chainId: Chain['chainId'], data: BaseSignRequest): Promise<BaseSignResponse> {
    return { success: true };
  }
}

describe('BaseWallet', () => {
  let wallet: TestWallet;

  beforeEach(() => {
    wallet = new TestWallet({ name: 'Test Wallet', prettyName: 'Test Wallet', mode: 'extension' });
  });

  it('should set and retrieve chain map', () => {
    const chains: Chain[] = [{ chainId: 'test-chain-id', chainName: 'Test Chain' } as Chain];
    wallet.setChainMap(chains);
    const chain = wallet.getChainById('test-chain-id');
    expect(chain.chainName).toBe('Test Chain');
  });

  it('should set and retrieve asset lists', () => {
    const assetLists = [{ assets: [] }] as any;
    wallet.setAssetLists(assetLists);
    expect(wallet.assetLists).toEqual(assetLists);
  });

  it('should get account', async () => {
    const account = await wallet.getAccount('test-chain-id');
    expect(account.address).toBe('test-address');
  });

  it('should set chain map', () => {
    const chains: Chain[] = [
      { chainId: 'chain-1', chainName: 'Chain 1' } as Chain,
      { chainId: 'chain-2', chainName: 'Chain 2' } as Chain,
    ];
    wallet.setChainMap(chains);
    expect(wallet.chainMap.size).toBe(2);
    expect(wallet.chainMap.get('chain-1')?.chainName).toBe('Chain 1');
  });

  it('should addChain', () => {
    const chain: Chain = { chainId: 'chain-3', chainName: 'Chain 3' } as Chain;
    wallet.addChain(chain);
    expect(wallet.chainMap.size).toBe(1);
    expect(wallet.chainMap.get('chain-3')?.chainName).toBe('Chain 3');
  });




});