jest.mock('../src/utils/get-wallet-of-type', () => ({}));
jest.mock('../src/wallets/extension-wallet', () => ({
  ExtensionWallet: class {},
}));
jest.mock('@walletconnect/universal-provider');

import { WCCosmosWallet } from '../src/wallets/wc-wallets/wc-cosmos-wallet';
import { WCWallet } from '../src/wallets/wc-wallets/wc-wallet';

describe('WCWallet signingRequestExpiry', () => {
  const signDoc = {} as any;
  const expectedArgs = {
    method: 'cosmos_signAmino',
    params: { signerAddress: 'test-signer', signDoc },
  };

  it('passes the configured expiry to WCWallet sign requests', async () => {
    const request = jest.fn().mockResolvedValue({ signed: 'signed-doc' });
    const wallet = new WCWallet(undefined, undefined, { signingRequestExpiry: 3600 });
    wallet.provider = { request } as any;

    await wallet.signAmino('test-chain-id', 'test-signer', signDoc);

    expect(request).toHaveBeenCalledWith(expectedArgs, 'cosmos:test-chain-id', 3600);
  });

  it('passes the parent WCWallet expiry to WCCosmosWallet sign requests', async () => {
    const request = jest.fn().mockResolvedValue({ signed: 'signed-doc' });
    const cosmosWallet = new WCCosmosWallet();
    cosmosWallet.setWCProvider({ request } as any);
    cosmosWallet.setWCWallet(new WCWallet(undefined, undefined, { signingRequestExpiry: 600 }));

    await cosmosWallet.signAmino('test-chain-id', 'test-signer', signDoc);

    expect(request).toHaveBeenCalledWith(expectedArgs, 'cosmos:test-chain-id', 600);
  });

  it('leaves expiry undefined when not configured', async () => {
    const request = jest.fn().mockResolvedValue({ signed: 'signed-doc' });
    const wallet = new WCWallet();
    wallet.provider = { request } as any;

    await wallet.signAmino('test-chain-id', 'test-signer', signDoc);

    expect(request).toHaveBeenCalledWith(expectedArgs, 'cosmos:test-chain-id', undefined);
  });
});
