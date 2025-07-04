import { AssetList, Chain } from '@chain-registry/types';

import { GenericOfflineSigner, WalletAccount } from '../types';
import { GenericSignRequest } from '../types/sign-request';
import { GenericSignResponse } from '../types/sign-response';
import { isInstanceOf } from '../utils';
import { BaseWallet } from './base-wallet';

// 导入子钱包实现

// 定义通用钱包类型
export type GenericWallet = BaseWallet<GenericSignRequest, GenericSignResponse, GenericOfflineSigner>;

// 定义钱包映射类型 - 使用更具体的类型
export type WalletMap = Record<Chain['chainType'], GenericWallet>;

export class UniWallet<TWalletMap extends WalletMap = WalletMap> extends BaseWallet<GenericSignRequest, GenericSignResponse, GenericOfflineSigner> {
  networkWalletMap: Map<Chain['chainType'], GenericWallet> = new Map();




  /**
   * 注册特定链类型的钱包
   */
  setNetworkWallet<K extends Chain['chainType']>(chainType: K, wallet: TWalletMap[K]) {
    this.networkWalletMap.set(chainType, wallet);
  }

  /**
   * 根据链类型获取对应的钱包
   */
  getWalletByChainType<K extends Chain['chainType']>(chainType: K): TWalletMap[K] | undefined {
    const wallet = this.networkWalletMap.get(chainType);
    if (!wallet) throw new Error(`Unsupported chain type`);
    return wallet;
  }

  /**
   * 根据 Chain 对象获取对应的钱包
   */
  getWalletByChain(chain: Chain): BaseWallet<any, any, any> | undefined {
    return this.networkWalletMap.get(chain.chainType) as BaseWallet<any, any, any> | undefined;
  }

  /**
   * Override setChainMap to propagate to network wallets
   */
  setChainMap(chains: Chain[]) {
    super.setChainMap(chains);
    // Propagate to all network wallets
    for (const wallet of this.networkWalletMap.values()) {
      wallet.setChainMap(chains);
    }
  }

  setAssetLists(assetLists: AssetList[]) {
    super.setAssetLists(assetLists);
    for (const wallet of this.networkWalletMap.values()) {
      wallet.setAssetLists(assetLists);
    }
  }

  /**
   * Override addChain to propagate to network wallets
   */
  addChain(chain: Chain) {
    super.addChain(chain);
    // Propagate to all network wallets
    for (const wallet of this.networkWalletMap.values()) {
      wallet.addChain(chain);
    }
  }

  /**
   * 初始化所有注册的钱包
   */
  async init(): Promise<void> {
    for (const wallet of this.networkWalletMap.values()) {
      if (wallet) await wallet.init();
    }
  }

  /**
   * 连接到指定链 - 自动路由到对应的钱包
   */
  async connect(chainId: Chain['chainId']): Promise<void> {
    const chain = this.getChainById(chainId);
    const wallet = this.getWalletByChainType(chain.chainType);
    if (!wallet) throw new Error(`No wallet for chainType: ${chain.chainType}`);
    await wallet.connect(chainId);
  }

  /**
   * 断开与指定链的连接
   */
  async disconnect(chainId: Chain['chainId']): Promise<void> {
    const chain = this.getChainById(chainId);
    const wallet = this.getWalletByChainType(chain.chainType);
    if (wallet) await wallet.disconnect(chainId);
  }

  /**
   * 获取指定链的账户信息
   */
  async getAccount(chainId: Chain['chainId']): Promise<WalletAccount> {
    const chain = this.getChainById(chainId);
    const wallet = this.getWalletByChainType(chain.chainType);
    if (!wallet) throw new Error(`No wallet for chainType: ${chain.chainType}`);
    return wallet.getAccount(chainId);
  }

  /**
   * 获取指定链的离线签名器
   */
  async getOfflineSigner(chainId: Chain['chainId']): Promise<any> {
    const chain = this.getChainById(chainId);
    const wallet = this.getWalletByChainType(chain.chainType);
    if (!wallet) throw new Error(`No wallet for chainType: ${chain.chainType}`);
    return wallet.getOfflineSigner(chainId);
  }

  /**
   * 添加建议的链到钱包
   */
  async addSuggestChain(chainId: Chain['chainId']): Promise<void> {
    const chain = this.getChainById(chainId);
    const wallet = this.getWalletByChainType(chain.chainType);
    if (!wallet) throw new Error(`No wallet for chainType: ${chain.chainType}`);
    await wallet.addSuggestChain(chainId);
  }

  /**
   * 获取指定链的 provider
   */
  async getProvider(chainId: Chain['chainId']): Promise<any> {
    const chain = this.getChainById(chainId);
    const wallet = this.getWalletByChainType(chain.chainType);
    if (!wallet) throw new Error(`No wallet for chainType: ${chain.chainType}`);
    return wallet.getProvider(chainId);
  }

  /**
   * 签名操作 - 自动路由到对应的钱包
   */
  async sign(chainId: Chain['chainId'], data: GenericSignRequest): Promise<GenericSignResponse> {
    const chain = this.getChainById(chainId);
    const wallet = this.getWalletByChainType(chain.chainType);
    if (!wallet) throw new Error(`No wallet for chainType: ${chain.chainType}`);

    // 如果没有找到方法对应的钱包，使用链类型对应的钱包
    return wallet.sign(chainId, data);
  }

  /**
   * 根据参数 类型 获取钱包
   */
  getWalletOfType<T>(
    WalletClass: new (...args: any[]) => T
  ): T | undefined {
    for (const wallet of this.networkWalletMap.values()) {
      if (isInstanceOf(wallet, WalletClass)) {
        return wallet as T;
      }
    }
    return undefined;
  }
}

export const MultiChainWallet = UniWallet;