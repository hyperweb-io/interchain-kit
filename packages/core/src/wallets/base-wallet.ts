
import { AssetList, Chain } from "@chain-registry/types";
import { Wallet, WalletAccount, WalletEvents } from "../types";
import EventEmitter from "events";


export abstract class BaseWallet<TSignData, TSignResponse, IGenericOfflineSigner> {
  info: Wallet

  events: EventEmitter<WalletEvents> = new EventEmitter()
  chainMap: Map<Chain['chainId'], Chain> = new Map()
  assetLists: AssetList[] = []
  client: any
  constructor(info: Wallet) {
    this.info = info
  }
  setChainMap(chains: Chain[]) {
    this.chainMap = new Map(chains.map(chain => [chain.chainId, chain]))
  }
  addChain(chain: Chain) {
    this.chainMap.set(chain.chainId, chain)
  }
  setAssetLists(assetLists: AssetList[]) {
    this.assetLists = assetLists
  }
  addAssetList(assetList: AssetList) {
    this.assetLists.push(assetList)
  }
  getChainById(chainId: Chain['chainId']): Chain {
    const chain = this.chainMap.get(chainId);
    if (!chain) {
      throw new Error(`Chain Registry with id ${chainId} not found!`);
    }
    return chain
  }

  getAssetListByChainId(chainId: Chain['chainId']): AssetList {
    const chain = this.getChainById(chainId);
    const assetList = this.assetLists.find(assetList => assetList.chainName === chain.chainName);
    if (!assetList) {
      throw new Error(`Asset List with id ${chainId} not found!`);
    }
    return assetList
  }

  abstract init(): Promise<void>

  abstract connect(chainId: Chain['chainId']): Promise<void>

  abstract disconnect(chainId: Chain['chainId']): Promise<void>

  abstract getAccount(chainId: Chain['chainId']): Promise<WalletAccount>

  abstract getOfflineSigner(chainId: Chain['chainId']): Promise<IGenericOfflineSigner>

  abstract sign(chainId: Chain['chainId'], data: TSignData): Promise<TSignResponse>

  abstract addSuggestChain(chainId: Chain['chainId']): Promise<void>

  abstract getProvider(chainId: Chain['chainId']): Promise<any>
}