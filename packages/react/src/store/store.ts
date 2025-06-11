import { SigningClient } from '@interchainjs/cosmos/signing-client';
import { AssetList, Chain } from "@chain-registry/types"
import { BaseWallet, clientNotExistError, CosmosWallet, EndpointOptions, Endpoints, SignerOptions, SignType, WalletAccount, WalletManager, WalletState } from "@interchain-kit/core"
import { SigningOptions as InterchainSigningOptions } from '@interchainjs/cosmos/types/signing-client';
import { HttpEndpoint, IGenericOfflineSigner } from '@interchainjs/types';
import { createStore } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist, createJSONStorage } from 'zustand/middleware'
import { dedupeAsync, restoreAccountFromLocalStorage } from '../utils';
import { StatefulWallet } from './stateful-wallet';
import { AminoGenericOfflineSigner, DirectGenericOfflineSigner, ICosmosGenericOfflineSigner } from '@interchainjs/cosmos/types/wallet';

const immerSyncUp = (newWalletManager: WalletManager) => {
  return (draft: { chains: Chain[]; assetLists: AssetList[]; wallets: BaseWallet[]; signerOptions: SignerOptions; endpointOptions: EndpointOptions; signerOptionMap: Record<string, InterchainSigningOptions>; endpointOptionsMap: Record<string, Endpoints>; preferredSignTypeMap: Record<string, SignType>; }) => {
    draft.chains = newWalletManager.chains
    draft.assetLists = newWalletManager.assetLists
    draft.wallets = newWalletManager.wallets
    draft.signerOptions = newWalletManager.signerOptions
    draft.endpointOptions = newWalletManager.endpointOptions
    draft.signerOptionMap = newWalletManager.signerOptionMap
    draft.endpointOptionsMap = newWalletManager.endpointOptionsMap
    draft.preferredSignTypeMap = newWalletManager.preferredSignTypeMap
  }
}

export type ChainWalletState = {
  chainName: string,
  walletName: string,
  walletState: WalletState,
  rpcEndpoint: string | HttpEndpoint
  errorMessage: string
  account: WalletAccount
}

export interface InterchainStore extends WalletManager {
  chainWalletState: ChainWalletState[]
  currentWalletName: string
  currentChainName: string
  walletConnectQRCodeUri: string
  isReady: boolean,
  wallets: StatefulWallet[],
  modalIsOpen: boolean,
  openModal: () => void,
  closeModal: () => void,
  setCurrentChainName: (chainName: string) => void
  setCurrentWalletName: (walletName: string) => void
  getDraftChainWalletState: (state: InterchainStore, walletName: string, chainName: string) => ChainWalletState
  getChainWalletState: (walletName: string, chainName: string) => ChainWalletState | undefined
  updateChainWalletState: (walletName: string, chainName: string, data: Partial<ChainWalletState>) => void
  getStatefulWalletByName: (walletName: string) => StatefulWallet | undefined
  setWalletConnectQRCodeUri: (uri: string) => void
}

export type InterchainStoreData = {
  chains: Chain[]
  assetLists: AssetList[]
  wallets: StatefulWallet[]
  signerOptions: SignerOptions
  endpointOptions: EndpointOptions
}

export const createInterchainStore = (walletManager: WalletManager) => {

  return createStore(persist(immer<InterchainStore>((set, get) => ({
    chainWalletState: [],
    currentWalletName: '',
    currentChainName: '',
    chains: [...walletManager.chains],
    assetLists: [...walletManager.assetLists],
    wallets: walletManager.wallets.map(wallet => new StatefulWallet(wallet, get)),
    signerOptions: walletManager.signerOptions,
    endpointOptions: walletManager.endpointOptions,

    preferredSignTypeMap: { ...walletManager.preferredSignTypeMap },
    signerOptionMap: { ...walletManager.signerOptionMap },
    endpointOptionsMap: { ...walletManager.endpointOptionsMap },

    walletConnectQRCodeUri: '',

    isReady: false,

    modalIsOpen: false,
    openModal: () => {
      set(draft => {
        draft.modalIsOpen = true
      })
    },
    closeModal: () => {
      set(draft => {
        draft.modalIsOpen = false
        draft.walletConnectQRCodeUri = '' // reset the QR code uri when modal is closed
      })
    },

    updateChainWalletState: (walletName: string, chainName: string, data: Partial<ChainWalletState>) => {
      set(draft => {
        let targetIndex = draft.chainWalletState.findIndex(cws => cws.walletName === walletName && cws.chainName === chainName)
        draft.chainWalletState[targetIndex] = { ...draft.chainWalletState[targetIndex], ...data }
      })
    },



    init: async () => {
      const oldChainWalletStatesMap = new Map(get().chainWalletState.map(cws => [cws.walletName + cws.chainName, cws]))
      // get().createStatefulWallet()

      // should remove wallet that already disconnected ,for hydrain back from localstorage
      // const oldChainWalletStateMap = new Map()
      // get().chainWalletState.forEach(cws => {
      //   if(cws.walletState === WalletState.Connected) {
      //     oldChainWalletStateMap.set(cws.walletName + cws.chainName, cws)
      //   }
      // })

      get().wallets.forEach(wallet => {
        get().chains.forEach(chain => {
          set(draft => {
            if (!oldChainWalletStatesMap.has(wallet.info.name + chain.chainName)) {
              draft.chainWalletState.push({
                chainName: chain.chainName,
                walletName: wallet.info.name,
                walletState: WalletState.Disconnected,
                rpcEndpoint: "",
                errorMessage: "",
                account: undefined
              })
            }
          })
        })
      })


      await Promise.all(get().wallets.map(async wallet => wallet.init()))
      set(draft => {
        draft.isReady = true
      })
    },

    setCurrentChainName: (chainName: string) => {
      set(draft => { draft.currentChainName = chainName })
    },

    setCurrentWalletName: (walletName: string) => {
      set(draft => { draft.currentWalletName = walletName })
    },

    setWalletConnectQRCodeUri: (uri: string) => {
      set(draft => { draft.walletConnectQRCodeUri = uri })
    },

    getDraftChainWalletState: (state: InterchainStore, walletName: string, chainName: string) => {
      const targetIndex = state.chainWalletState.findIndex(cws => cws.walletName === walletName && cws.chainName === chainName)
      return state.chainWalletState[targetIndex]
    },

    getChainWalletState: (walletName: string, chainName: string) => {
      return get().chainWalletState.find(cws => cws.walletName === walletName && cws.chainName === chainName)
    },

    addChains: async (newChains: Chain[], newAssetLists: AssetList[], newSignerOptions?: SignerOptions, newEndpointOptions?: EndpointOptions) => {
      await walletManager.addChains(newChains, newAssetLists, newSignerOptions, newEndpointOptions)
      // console.log(walletManager.chains, walletManager.assetLists)
      // set(immerSyncUp(walletManager))
      // set(draft => {
      //   draft.chains = walletManager.chains
      // })


      set(draft => {

        const existedChainMap = new Map(get().chains.map(chain => [chain.chainName, chain]))

        const newAssetListMap = new Map(newAssetLists.map(assetList => [assetList.chainName, assetList]))

        newChains.forEach(newChain => {
          if (!existedChainMap.has(newChain.chainName)) {
            draft.chains.push(newChain)
            draft.assetLists.push(newAssetListMap.get(newChain.chainName)!)
          }
          draft.signerOptionMap[newChain.chainName] = newSignerOptions?.signing(newChain.chainName)
          draft.endpointOptionsMap[newChain.chainName] = newEndpointOptions?.endpoints?.[newChain.chainName]
        })

        get().chains.forEach(chain => {

          draft.signerOptionMap[chain.chainName] = {
            ...get().signerOptionMap[chain.chainName],
            ...newSignerOptions?.signing(chain.chainName)
          }

          draft.endpointOptionsMap[chain.chainName] = {
            ...get().endpointOptionsMap[chain.chainName],
            ...newEndpointOptions?.endpoints?.[chain.chainName]
          }
        })

        const existedChainWalletStatesMap = new Map(get().chainWalletState.map(cws => [cws.walletName + cws.chainName, cws]))

        get().wallets.forEach(wallet => {
          newChains.forEach(newChain => {
            if (!existedChainWalletStatesMap.has(wallet.info.name + newChain.chainName)) {
              draft.chainWalletState.push({
                chainName: newChain.chainName,
                walletName: wallet.info.name,
                walletState: WalletState.Disconnected,
                rpcEndpoint: "",
                errorMessage: "",
                account: undefined
              })
            }
          })
        })

        draft.chainWalletState = draft.chainWalletState.map(cws => {
          return { ...cws, rpcEndpoint: newEndpointOptions?.endpoints?.[cws.chainName]?.rpc?.[0] || cws.rpcEndpoint }
        })
      })
    },

    connect: async (walletName: string, chainName: string) => {
      const wallet = get().wallets.find(w => w.info.name === walletName)
      const chain = get().chains.find(c => c.chainName === chainName)

      if (!wallet) {
        throw new Error(`Wallet ${walletName} not found`)
      }
      if (!chain) {
        throw new Error(`Chain ${chainName} not found`)
      }

      return wallet.connect(chain.chainId)
    },

    disconnect: async (walletName: string, chainName: string) => {
      const wallet = get().wallets.find(w => w.info.name === walletName)
      const chain = get().chains.find(c => c.chainName === chainName)

      if (!wallet) {
        throw new Error(`Wallet ${walletName} not found`)
      }
      if (!chain) {
        throw new Error(`Chain ${chainName} not found`)
      }

      return wallet.disconnect(chain.chainId)
    },
    getAccount: async (walletName: string, chainName: string) => {
      const wallet = get().wallets.find(w => w.info.name === walletName)
      const chain = get().chains.find(c => c.chainName === chainName)

      if (!wallet) {
        throw new Error(`Wallet ${walletName} not found`)
      }
      if (!chain) {
        throw new Error(`Chain ${chainName} not found`)
      }

      const existedAccount = get().chainWalletState.find(cws => cws.walletName === walletName && cws.chainName === chainName)?.account

      if (existedAccount) {

        return existedAccount
      }

      return wallet.getAccount(chain.chainId)
    },
    getRpcEndpoint: async (walletName: string, chainName: string): Promise<string | HttpEndpoint> => {
      return dedupeAsync(`${chainName}-rpcEndpoint`, async () => {
        const rpcEndpoint = await walletManager.getRpcEndpoint(walletName, chainName)
        get().wallets.map(wallet => {
          get().updateChainWalletState(wallet.info.name, chainName, { rpcEndpoint })
        })
        return rpcEndpoint
      })
    },
    getChainLogoUrl(chainName) {
      return walletManager.getChainLogoUrl(chainName)
    },
    getChainByName(chainName) {
      return walletManager.getChainByName(chainName)
    },
    getAssetListByName(chainName) {
      return walletManager.getAssetListByName(chainName)
    },
    getDownloadLink(walletName) {
      return walletManager.getDownloadLink(walletName)
    },
    async getOfflineSigner(walletName, chainName) {
      return walletManager.getOfflineSigner(walletName, chainName)
    },
    getPreferSignType(chainName) {
      const result = walletManager.getPreferSignType(chainName)
      // set(immerSyncUp(walletManager))
      return result
    },
    getSignerOptions(chainName) {
      const result = walletManager.getSignerOptions(chainName)
      // set(immerSyncUp(walletManager))
      return result
    },
    getWalletByName(walletName) {
      return walletManager.getWalletByName(walletName)
    },
    getStatefulWalletByName(walletName: string) {
      return get().wallets.find(w => w.info.name === walletName)
    },
    async getSigningClient(walletName, chainName): Promise<SigningClient> {
      return walletManager.getSigningClient(walletName, chainName)
    },
    getEnv() {
      return walletManager.getEnv()
    },
  })), {
    name: 'interchain-kit-store',
    storage: createJSONStorage(() => localStorage),
    partialize: state => ({
      chainWalletState: state.chainWalletState.map(cws => ({
        chainName: cws.chainName,
        walletName: cws.walletName,
        account: cws.account,
        walletState: cws.walletState,
      })),
      currentWalletName: state.currentWalletName,
      currentChainName: state.currentChainName
    }),
    onRehydrateStorage: (state) => {
      // console.log('interchain-kit store hydration starts')

      // optional
      return (state, error) => {
        if (error) {
          console.log('an error happened during hydration', error)
        } else {
          // console.log('interchain-kit store hydration finished')
          state.chainWalletState = state.chainWalletState.map(cws => {
            return {
              ...cws,
              account: cws.account ? restoreAccountFromLocalStorage(cws.account) : null
            }
          })
        }
      }
    },
  }))

}