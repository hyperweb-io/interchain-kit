import { Chain, AssetList } from '@chain-registry/types';
import { chain, assetList } from '@chain-registry/v2/mainnet/solana'


/**
 * 主网：solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp（或简化为 solana:mainnet）
 * 测试网：solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z（或 solana:testnet）
 * 开发网：solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1（或 solana:devnet）
 */

export const createSolanaChain = (networkType: 'mainnet-beta' | 'devnet' | 'testnet' = 'devnet'): Chain => {
  const newChain = { ...chain }
  if (networkType === 'mainnet-beta') {

    newChain.chainName = 'solanamainnet';
    newChain.chainId = '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp';
    newChain.apis = {
      rpc: [
        {
          // address: 'https://api.mainnet-beta.solana.com',
          address: 'https://api.devnet.solana.com',
        }
      ]
    }


  }
  if (networkType === 'testnet') {

    newChain.chainName = 'solanatestnet';
    newChain.chainId = '4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z';
    newChain.apis = {
      rpc: [
        {
          address: 'https://api.testnet.solana.com',
        }
      ]
    }

  }
  if (networkType === 'devnet') {

    newChain.chainName = 'solanadevnet';
    newChain.chainId = 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1';
    newChain.apis = {
      rpc: [
        {
          address: 'https://api.devnet.solana.com',
        }
      ]
    }
  }
  return newChain

};

export const createSolanaAssetList = (networkType: 'mainnet-beta' | 'devnet' | 'testnet' = 'devnet'): AssetList => {
  const a = { ...assetList }
  if (networkType === 'mainnet-beta') {
    a.chainName = 'solanamainnet'
  }
  if (networkType === 'testnet') {
    a.chainName = 'solanatestnet'
  }
  if (networkType === 'devnet') {
    a.chainName = 'solanadevnet'
  }
  return a
}