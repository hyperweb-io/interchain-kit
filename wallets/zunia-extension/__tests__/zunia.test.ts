import { zuniaWallet } from '../src';
import { ZuniaCosmosWallet } from '../src/cosmos';
import { ZUNIA_ANDROID_PACKAGE, ZUNIA_WC_LINK } from '../src/registry';

const WC_URI = 'wc:abc123@2?relay-protocol=irn&symKey=ff';

function uriParam(link: string): string | null {
  const withoutHash = link.split('#')[0];
  const query = withoutHash.slice(withoutHash.indexOf('?') + 1);
  return new URLSearchParams(query).get('uri');
}

describe('Zunia extension', () => {
  it('talks to window.zunia and not to an Ethereum provider', () => {
    expect(zuniaWallet.info.name).toBe('zunia-extension');
    expect(zuniaWallet.info.prettyName).toBe('Zunia');
    expect(zuniaWallet.info.mode).toBe('extension');
    expect(zuniaWallet.info.windowKey).toBe('zunia');
    expect(zuniaWallet.info.cosmosKey).toBe('zunia');
    expect(zuniaWallet.info.keystoreChange).toBe('zunia_keystorechange');
    expect(zuniaWallet.info.ethereumKey).toBeUndefined();
    expect(zuniaWallet.info.downloads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          browser: 'chrome',
          link: 'https://chromewebstore.google.com/detail/zunia/ngokakoekdogobjmokipglbcclelgajk',
        }),
        expect.objectContaining({
          link: 'https://zunialab.com',
        }),
      ])
    );
  });

  it('opens the phone with the uri query the app reads', () => {
    const encoded = encodeURIComponent(WC_URI);
    const ios = ZUNIA_WC_LINK.ios.replace('{wc-uri}', encoded);
    const android = ZUNIA_WC_LINK.android.replace('{wc-uri}', encoded);

    expect(ios.startsWith('zunia://wc?uri=')).toBe(true);
    expect(uriParam(ios)).toBe(WC_URI);
    expect(android).toContain(`package=${ZUNIA_ANDROID_PACKAGE}`);
    expect(android).toContain('scheme=zunia');
    expect(uriParam(android)).toBe(WC_URI);
  });

  it('asks again to connect after a chain suggestion', async () => {
    const wallet = new ZuniaCosmosWallet(zuniaWallet.info);
    const enable = jest
      .fn()
      .mockRejectedValueOnce(new Error('Zunia does not know the chain osmosis-1. Add it with experimentalSuggestChain first.'))
      .mockResolvedValueOnce(undefined);
    wallet.client = { enable };
    jest.spyOn(wallet, 'addSuggestChain').mockResolvedValue(undefined);

    await wallet.connect('osmosis-1');

    expect(wallet.addSuggestChain).toHaveBeenCalledWith('osmosis-1');
    expect(enable).toHaveBeenCalledTimes(2);
  });

  it('leaves a rejection alone', async () => {
    const wallet = new ZuniaCosmosWallet(zuniaWallet.info);
    wallet.client = { enable: jest.fn().mockRejectedValue(new Error('Request rejected')) };
    const suggest = jest.spyOn(wallet, 'addSuggestChain').mockResolvedValue(undefined);

    await expect(wallet.connect('cosmoshub-4')).rejects.toThrow('Request rejected');
    expect(suggest).not.toHaveBeenCalled();
  });

  it('does not broadcast a dApp transaction', async () => {
    const wallet = new ZuniaCosmosWallet(zuniaWallet.info);
    await expect(wallet.sendTx('cosmoshub-4', new Uint8Array(), 'sync' as never)).rejects.toThrow(
      'does not broadcast'
    );
  });
});
