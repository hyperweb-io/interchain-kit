<script setup lang="ts">
import { ThemeProvider } from '@interchain-ui/vue'
import { ChainProvider } from '@interchain-kit/vue'
import { keplrWallet } from '@interchain-kit/keplr-extension';
import { leapWallet } from '@interchain-kit/leap-extension';
import { RouterView } from 'vue-router';
import { WCWallet } from "@interchain-kit/core";
import { chain as junoChain, assetList as junoAssetList } from "chain-registry/mainnet/juno";
import { chain as osmosisChain, assetList as osmosisAssetList } from "chain-registry/mainnet/osmosis";
import { chain as cosmoshubChain, assetList as cosmoshubAssetList } from "chain-registry/mainnet/cosmoshub";
import { chain as stargazeChain, assetList as stargazeAssetList } from "chain-registry/mainnet/stargaze";
// import { chain as osmosisTestChain, assetList as osmosisTestAssetList } from "chain-registry/testnet/osmosistestnet"
const walletConnect = new WCWallet();
</script>

<template>
  <ThemeProvider>
    <ChainProvider 
      :wallets="[keplrWallet, leapWallet, walletConnect]"
      :chains="[osmosisChain, junoChain, cosmoshubChain, stargazeChain]"
      :asset-lists="[osmosisAssetList, junoAssetList, cosmoshubAssetList, stargazeAssetList]"
      :signer-options="{}"
      :endpoint-options="{}">
      <router-view />
    </ChainProvider>
  </ThemeProvider>
</template>

<style scoped></style>
