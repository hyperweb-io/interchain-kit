import { eightsafWallet } from '../src';

describe('EightSaf extension', () => {
  it('exposes correct wallet metadata', () => {
    expect(eightsafWallet.info.name).toBe('eightsaf-extension');
    expect(eightsafWallet.info.prettyName).toBe('EightSaf');
    expect(eightsafWallet.info.mode).toBe('extension');
    expect(eightsafWallet.info.windowKey).toBe('eightsaf');
    expect(eightsafWallet.info.cosmosKey).toBe('eightsaf');
    expect(eightsafWallet.info.keystoreChange).toBe('eightsaf_keystorechange');
    expect(eightsafWallet.info.walletIdentifyKey).toBe('eightsaf.isEightSaf');
    expect(eightsafWallet.info.downloads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          browser: 'chrome',
          link: 'https://chromewebstore.google.com/detail/eightsaf-wallet/hpemogcffkhcoegjbphljmbjepibnpjj',
        }),
        expect.objectContaining({
          browser: 'firefox',
          link: 'https://addons.mozilla.org/en-US/firefox/addon/eightsaf-wallet/',
        }),
      ]),
    );
  });
});
