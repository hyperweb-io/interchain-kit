import { Chain } from '@chain-registry/types';

import { WalletAccount } from '../../src/types';
import { MultiChainWallet } from '../../src/wallets/multichain-wallet';
import { createMockWallet, MockBaseWallet } from '../helpers/mock-wallet-factory';

describe('MultiChainWallet', () => {
  let multiChainWallet: InstanceType<typeof MultiChainWallet>;
  let mockBaseWallet: MockBaseWallet;

  beforeEach(() => {
    mockBaseWallet = createMockWallet({
      name: 'Test Wallet',
      prettyName: 'Test Wallet',
      mode: 'extension',
    });

    multiChainWallet = new MultiChainWallet({ name: 'Test Wallet', prettyName: 'Test Wallet', mode: 'extension' });
  });

  it('should set a network wallet', () => {
    const chainType = 'cosmos';
    multiChainWallet.setNetworkWallet(chainType, mockBaseWallet);

    expect(multiChainWallet.getWalletByChainType(chainType)).toBe(mockBaseWallet);
  });

  it('should set chain map and propagate to network wallets', () => {
    const chains: Chain[] = [
      { chainId: 'cosmoshub-4', chainType: 'cosmos', chainName: 'Cosmos Hub' },
      { chainId: 'ethereum-mainnet', chainType: 'eip155', chainName: 'Ethereum Mainnet' },
    ];

    multiChainWallet.setNetworkWallet('cosmos', mockBaseWallet);
    multiChainWallet.setChainMap(chains);

    expect(multiChainWallet.chainMap.size).toBe(2);
    expect(mockBaseWallet.setChainMap).toHaveBeenCalledWith(chains);
  });

  it('should add chain and propagate to network wallets', () => {
    const chain: Chain = { chainId: 'cosmoshub-4', chainType: 'cosmos', chainName: 'Cosmos Hub' };

    multiChainWallet.setNetworkWallet('cosmos', mockBaseWallet);
    multiChainWallet.addChain(chain);

    expect(multiChainWallet.chainMap.get(chain.chainId)).toBe(chain);
    expect(mockBaseWallet.addChain).toHaveBeenCalledWith(chain);
  });

  it('should initialize all network wallets', async () => {
    multiChainWallet.setNetworkWallet('cosmos', mockBaseWallet);

    await multiChainWallet.init();

    expect(mockBaseWallet.init).toHaveBeenCalled();
  });

  it('should throw an error if wallet for chain type is not found', () => {
    expect(() => multiChainWallet.getWalletByChainType('unknown')).toThrow('Unsupported chain type');
  });

  it('should connect to a chain', async () => {
    const chain: Chain = { chainId: 'cosmoshub-4', chainType: 'cosmos', chainName: 'Cosmos Hub' };
    jest.spyOn(multiChainWallet, 'getChainById').mockReturnValue(chain);
    multiChainWallet.setNetworkWallet('cosmos', mockBaseWallet);

    await multiChainWallet.connect(chain.chainId);

    expect(mockBaseWallet.connect).toHaveBeenCalledWith(chain.chainId);
  });

  it('should disconnect from a chain', async () => {
    const chain: Chain = { chainId: 'cosmoshub-4', chainType: 'cosmos', chainName: 'Cosmos Hub' };
    jest.spyOn(multiChainWallet, 'getChainById').mockReturnValue(chain);
    multiChainWallet.setNetworkWallet('cosmos', mockBaseWallet);

    await multiChainWallet.disconnect(chain.chainId);

    expect(mockBaseWallet.disconnect).toHaveBeenCalledWith(chain.chainId);
  });

  it('should get account for a chain', async () => {
    const chain: Chain = { chainId: 'cosmoshub-4', chainType: 'cosmos', chainName: 'Cosmos Hub' };
    const mockAccount: WalletAccount = { address: 'cosmos1...', algo: 'secp256k1', pubkey: new Uint8Array() };
    jest.spyOn(multiChainWallet, 'getChainById').mockReturnValue(chain);
    jest.spyOn(mockBaseWallet, 'getAccount').mockResolvedValue(mockAccount);
    multiChainWallet.setNetworkWallet('cosmos', mockBaseWallet);

    const account = await multiChainWallet.getAccount(chain.chainId);

    expect(account).toBe(mockAccount);
    expect(mockBaseWallet.getAccount).toHaveBeenCalledWith(chain.chainId);
  });

  it('should add a suggested chain', async () => {
    const chain: Chain = { chainId: 'cosmoshub-4', chainType: 'cosmos', chainName: 'Cosmos Hub' };
    jest.spyOn(multiChainWallet.chainMap, 'get').mockReturnValue(chain);
    multiChainWallet.setNetworkWallet('cosmos', mockBaseWallet);

    await multiChainWallet.addSuggestChain(chain.chainId as string);

    expect(mockBaseWallet.addSuggestChain).toHaveBeenCalledWith(chain.chainId);
  });

  it('should get provider for a chain', async () => {
    const chain: Chain = { chainId: 'cosmoshub-4', chainType: 'cosmos', chainName: 'Cosmos Hub' };
    jest.spyOn(multiChainWallet, 'getChainById').mockReturnValue(chain);
    jest.spyOn(mockBaseWallet, 'getProvider').mockResolvedValue('mockProvider');
    multiChainWallet.setNetworkWallet('cosmos', mockBaseWallet);

    const provider = await multiChainWallet.getProvider(chain.chainId as string);

    expect(provider).toBe('mockProvider');
    expect(mockBaseWallet.getProvider).toHaveBeenCalledWith(chain.chainId);
  });

});