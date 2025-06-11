
import { AssetList, Chain } from "@chain-registry/types";
import osmosisChain from 'chain-registry/mainnet/osmosis/chain'
import osmosisAssetList from 'chain-registry/mainnet/osmosis/asset-list'

export const createStarshipChain = (chainId: string, chainName: string, rpc: string, rest: string): Chain => {
  return {
    ...osmosisChain,
    chainId,
    chainName,
    apis: {
      rpc: [
        { address: rpc }
      ],
      rest: [{
        address: rest
      }]
    },
  }
}

export const createStarshipAssetList = (chainName: string): AssetList => {
  return {
    ...osmosisAssetList,
    chainName,
    assets: [osmosisAssetList.assets[0]],
  }
}