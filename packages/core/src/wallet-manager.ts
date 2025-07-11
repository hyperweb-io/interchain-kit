import { AssetList, Chain } from '@chain-registry/types';
import { SigningClient } from '@interchainjs/cosmos/signing-client';
import { SigningOptions as InterchainSigningOptions } from '@interchainjs/cosmos/types/signing-client';
import { ICosmosGenericOfflineSigner } from '@interchainjs/cosmos/types/wallet';
import { HttpEndpoint } from '@interchainjs/types';
import Bowser from 'bowser';

import { ChainName, DeviceType, DownloadInfo, EndpointOptions, Endpoints, OS, SignerOptions, SignType } from './types';
import { ChainNameNotExist, ChainNotExist, getValidRpcEndpoint, isInstanceOf, NoValidRpcEndpointFound, WalletNotExist } from './utils';
import { BaseWallet } from './wallets/base-wallet';
import { WCWallet } from './wallets/wc-wallet';

export class WalletManager {
  chains: Chain[] = [];
  assetLists: AssetList[] = [];
  wallets: BaseWallet[] = [];
  signerOptions: SignerOptions | undefined;
  endpointOptions: EndpointOptions | undefined;

  preferredSignTypeMap: Record<Chain['chainName'], SignType> = {};
  signerOptionMap: Record<Chain['chainName'], InterchainSigningOptions> = {};
  endpointOptionsMap: Record<Chain['chainName'], Endpoints> = {};

  constructor(
    chains: Chain[],
    assetLists: AssetList[],
    wallets: BaseWallet[],
    signerOptions?: SignerOptions,
    endpointOptions?: EndpointOptions,
  ) {
    this.chains = chains;
    this.assetLists = assetLists;
    this.wallets = wallets;

    this.signerOptions = signerOptions;
    this.endpointOptions = endpointOptions;

    this.chains.forEach(chain => {
      this.signerOptionMap[chain.chainName] = signerOptions?.signing?.(chain.chainName);
      this.preferredSignTypeMap[chain.chainName] = signerOptions?.preferredSignType?.(chain.chainName);
      this.endpointOptionsMap[chain.chainName] = endpointOptions?.endpoints?.[chain.chainName];
    });

    this.wallets.forEach(wallet => {
      wallet.setChainMap(this.chains);
      wallet.setAssetLists(this.assetLists);
    });
  }

  async init() {
    await Promise.all(this.wallets.map(async (wallet) => {
      try {
        await wallet.init();
      } catch (error) {
        console.log(wallet.info.name, 'init error', error);
      }
    }));
  }

  static async create(
    chain: Chain[],
    assetLists: AssetList[],
    wallets: BaseWallet[],
    signerOptions?: SignerOptions,
    endpointOptions?: EndpointOptions
  ) {
    const wm = new WalletManager(chain, assetLists, wallets, signerOptions, endpointOptions);
    await wm.init();

    return wm;
  }

  async addChains(newChains: Chain[], newAssetLists: AssetList[], signerOptions?: SignerOptions, newEndpointOptions?: EndpointOptions) {
    const existChains = this.chains;

    const rpcEndpointTable = new Map<Chain['chainId'], string | HttpEndpoint>();


    await Promise.all(newChains.map(async (newChain) => {


      const rpcEndpoint = await getValidRpcEndpoint(newChain.apis.rpc.map(url => ({ chainType: newChain.chainType, endpoint: url.address })));

      if (rpcEndpoint) {
        rpcEndpointTable.set(newChain.chainId, rpcEndpoint);
      }
    }));

    const existChainsTable = new Map(existChains.map(chain => [chain.chainId, chain]));
    const newAssetListsTable = new Map(newAssetLists.map(assetList => [assetList.chainName, assetList]));

    newChains.forEach(newChain => {

      if (!existChainsTable.has(newChain.chainId)) {
        const assetList = newAssetListsTable.get(newChain.chainName);

        this.chains.push(newChain);
        this.assetLists.push(assetList);

        this.wallets.forEach(wallet => {
          wallet.addChain(newChain);
          wallet.addAssetList(assetList);
        });
      }

      this.signerOptionMap[newChain.chainName] = signerOptions?.signing?.(newChain.chainName);

      this.endpointOptionsMap[newChain.chainName] = {
        rpc: [newEndpointOptions?.endpoints?.[newChain.chainName]?.rpc?.[0] || rpcEndpointTable.get(newChain.chainId)],
      };
    });

  }

  getChainLogoUrl(chainName: ChainName) {
    const assetList = this.assetLists.find(assetList => assetList.chainName === chainName);
    return assetList?.assets?.[0].logoURIs?.png || assetList?.assets?.[0].logoURIs?.svg || undefined;
  }

  getWalletByName(walletName: string): BaseWallet | undefined {
    return this.wallets.find(w => w.info.name === walletName);
  }

  getChainByName(chainName: string): Chain | undefined {
    const chain = this.chains.find(chain => chain.chainName === chainName);
    return chain;
  }

  getAssetListByName(chainName: string) {
    return this.assetLists.find(assetList => assetList.chainName === chainName);
  }

  async connect(walletName: string, chainName: string, wcQRcodeUriCallback?: (uri: string) => void) {
    const wallet = this.getWalletByName(walletName);
    const chain = this.getChainByName(chainName);

    if (!wallet) {
      throw new WalletNotExist(walletName);
    }

    if (!chain) {
      throw new ChainNameNotExist(chainName);
    }

    if (isInstanceOf(wallet, WCWallet)) {
      wallet.setOnPairingUriCreatedCallback(wcQRcodeUriCallback);
    }

    await wallet.connect(chain.chainId);
  }

  async disconnect(walletName: string, chainName: string) {
    const wallet = this.getWalletByName(walletName);
    const chain = this.getChainByName(chainName);

    if (!wallet) {
      throw new WalletNotExist(walletName);
    }

    if (!chain) {
      throw new ChainNameNotExist(chainName);
    }
    return wallet.disconnect(chain.chainId);
  }

  getAccount(walletName: string, chainName: string) {
    const wallet = this.getWalletByName(walletName);
    const chain = this.getChainByName(chainName);
    if (!wallet) {
      throw new WalletNotExist(walletName);
    }

    if (!chain) {
      throw new ChainNameNotExist(chainName);
    }
    return wallet.getAccount(chain.chainId);
  }

  getRpcEndpoint = async (walletName: string, chainName: string) => {
    const existRpcEndpoint = this.endpointOptionsMap?.[chainName]?.rpc?.[0];
    if (existRpcEndpoint) {
      return existRpcEndpoint;
    }

    const chain = this.getChainByName(chainName);

    let rpcEndpoint: string | HttpEndpoint = '';

    const providerRpcEndpoints = this.endpointOptions?.endpoints[chain.chainName]?.rpc || [];
    // const walletRpcEndpoints = wallet?.info?.endpoints?.[chain.chainName]?.rpc || []
    const chainRpcEndpoints = chain.apis.rpc.map(url => url.address);

    if (providerRpcEndpoints?.[0]) {
      rpcEndpoint = providerRpcEndpoints[0];
      this.endpointOptionsMap?.[chainName]?.rpc.push(rpcEndpoint);
      return rpcEndpoint;
    }

    const rpcInfos = [...providerRpcEndpoints, ...chainRpcEndpoints].map(endpoint => ({ chainType: chain.chainType, endpoint }));

    const validRpcEndpoint = await getValidRpcEndpoint(rpcInfos);

    if (validRpcEndpoint === '') {
      throw new NoValidRpcEndpointFound();
    }

    rpcEndpoint = validRpcEndpoint;
    this.endpointOptionsMap = { ...this.endpointOptionsMap, [chainName]: { rpc: [rpcEndpoint] } };
    return rpcEndpoint;
  };

  getPreferSignType(chainName: string) {
    return this.preferredSignTypeMap[chainName] || 'direct';
  }

  getSignerOptions(chainName: string): InterchainSigningOptions {
    const chain = this.getChainByName(chainName);
    const signingOptions = this.signerOptionMap[chainName];

    const options: InterchainSigningOptions = {
      broadcast: {
        checkTx: true,
        deliverTx: true,
      },
      ...signingOptions,
      signerOptions: {
        prefix: chain.bech32Prefix,
        ...signingOptions?.signerOptions,
      }
    };
    return options;
  }

  async getOfflineSigner(walletName: string, chainName: string) {
    const preferredSignType = this.getPreferSignType(chainName);

    const wallet = this.getWalletByName(walletName);
    const chain = this.getChainByName(chainName);
    if (!wallet) {
      throw new WalletNotExist(walletName);
    }
    if (!chain) {
      throw new ChainNotExist(chainName);
    }

    return wallet.getOfflineSigner(chain.chainId);
  }

  async getSigningClient(walletName: string, chainName: ChainName): Promise<SigningClient> {
    const rpcEndpoint = await this.getRpcEndpoint(walletName, chainName);
    const offlineSigner = await this.getOfflineSigner(walletName, chainName) as ICosmosGenericOfflineSigner;
    const signerOptions = await this.getSignerOptions(chainName);
    const signingClient = await SigningClient.connectWithSigner(rpcEndpoint, offlineSigner, signerOptions);
    return signingClient;
  }

  getEnv() {
    const parser = Bowser.getParser(window.navigator.userAgent);
    const env = {
      browser: parser.getBrowserName(true),
      device: (parser.getPlatform().type || 'desktop') as DeviceType,
      os: parser.getOSName(true) as OS,
    };
    return env;
  }

  getDownloadLink(walletName: string) {
    const env = this.getEnv();
    const wallet = this.getWalletByName(walletName);
    return wallet.info.downloads.find((d: DownloadInfo) => {
      if (d.device === 'desktop') {
        return d.browser === env.browser;
      } else if (d.device === 'mobile') {
        return d.os === env.os;
      } else {
        return null;
      }
    });
  }

}