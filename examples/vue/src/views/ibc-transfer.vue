<script setup lang="ts">
import { ref, computed } from 'vue'
import { useChain, useWalletManager } from '@interchain-kit/vue';
import { ibc } from 'osmojs'
import { SigningStargateClient } from '@cosmjs/stargate'

const chainName = ref("cosmoshub")
const { rpcEndpoint, chain } = useChain(chainName)
const wm = useWalletManager()
const signer = computed(() => {
  if (!chain.value.chainId) {
    return
  }
  return wm.value.getOfflineSigner(wm.value.currentWalletName, chainName.value) // cosmoshub-4
})

const transferMsg = ibc.applications.transfer.v1.MessageComposer.withTypeUrl.transfer({
  sourcePort: "transfer",
  sourceChannel: 'channel-141',
  token: {
      denom: "uatom",
      amount: '18000',
  },
  sender: 'cosmos18gttzdr3v5lwwda8kep9xeuxep7g78ywxzg35r',
  receiver: 'osmo18gttzdr3v5lwwda8kep9xeuxep7g78ywwempz3',
  // @ts-ignore
  timeoutTimestamp: (Date.now() + 5 * 60 * 1000) * 1e6, 
});

const fee = {
  amount: [{ denom: "uatom", amount: "5000" }],
  gas: "200000", // Gas limit
};

const connectKeplr = async(chainId:string) => {
  // @ts-ignore
  if (!window.keplr) {
      throw new Error("Keplr wallet not installed. Please install it from https://keplr.app/");
  }

  // @ts-ignore
  await window.keplr.enable(chainId);

  // @ts-ignore
  const offlineSigner = window.getOfflineSigner(chainId);

  // @ts-ignore
  const accounts = await offlineSigner.getAccounts();
  console.log("Connected account:", accounts[0].address);

  return { offlineSigner, accounts };
}


const handleTransfer = async() => {
  // const { offlineSigner } = await connectKeplr('cosmoshub-4')
  // console.log('offlineSigner>', offlineSigner)
  console.log('signer.value', signer.value)
  // @ts-ignore
  let client = await SigningStargateClient.connectWithSigner(rpcEndpoint.value, signer.value)
  const result = await client.signAndBroadcast('cosmos18gttzdr3v5lwwda8kep9xeuxep7g78ywxzg35r', [transferMsg], fee);
  console.log("Transaction result:", result);
}
</script>

<template>
  <div>
    {{ rpcEndpoint }}
    <button @click="handleTransfer">click to transfer</button>
  </div>
</template>

<style scoped>
</style>
