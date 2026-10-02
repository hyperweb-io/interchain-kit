<script setup lang="ts">
import { useAccount, useWalletManager } from '@interchain-kit/vue';
import VueQrcode from '@chenfengyuan/vue-qrcode';
import { ref, computed } from 'vue';

const walletManager = useWalletManager()
const chainName = ref('osmosis')
const walletName = ref('WalletConnect')
const pairingUri = computed(() => walletManager.value.walletConnectQRCodeUri)
const account = useAccount(chainName, walletName)
const connect = async() => {
  await walletManager.value.connect(walletName.value, chainName.value)
}

const disconnect = async() => {
  await walletManager.value.disconnect(walletName.value, chainName.value)
}
</script>

<template>
  <div>
    address: {{ account?.address }}
    <button @click="connect">connect</button>
    <button @click="disconnect">disconnect</button>
    <vue-qrcode v-if="pairingUri" :value="pairingUri" :options="{ width: 200 }"></vue-qrcode>
  </div>
</template>

<style scoped>
</style>
