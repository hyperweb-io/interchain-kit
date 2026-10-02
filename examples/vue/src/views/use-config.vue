<script setup lang="ts">
import { useConfig } from '@interchain-kit/vue';
import { chain as stargazeChain, assetList as stargazeAssetList } from "chain-registry/mainnet/stargaze";

const { addChains } = useConfig()

const handleUpdate = () => {
  addChains([stargazeChain], [stargazeAssetList])
}
</script>

<template>
  <div>
    <button @click="handleUpdate">update config</button>
  </div>
</template>

<style scoped>
</style>
