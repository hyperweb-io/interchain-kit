<script setup lang="ts">
import { computed, ref, inject } from 'vue'
import { useChain, useInterchainClient, useCurrentWallet, useAccount, useConnect, OPEN_MODAL_KEY} from '@interchain-kit/vue';
import { coins } from "@cosmjs/amino";

const open = inject<() => void>(OPEN_MODAL_KEY);
const chainName = ref('osmosistestnet')
const { 
  logoUrl, 
  chain,
  rpcEndpoint
} = useChain(chainName);
const currentWallet = useCurrentWallet()

const walletName = computed(() => {
  return currentWallet.value?.option?.name;
})
const { queryClient, signingCosmosClient } = useInterchainClient(chainName, walletName)
const account = useAccount(chainName, walletName)
const { connect, disconnect } = useConnect(walletName)

const recipientAddress = ref('')
const amount = ref('')
const isSending = ref(false)
const balance = ref('0')
const handleConnect = () => {
  if (!currentWallet.value) {
    typeof open === 'function' && open()
    return
  }
  connect.value()
}

const getBalance = async() => {
  if (queryClient.value && account.value?.address) {
    const {balance: bc} =  await queryClient.value.balance({
      address: account.value?.address,
      denom: chain.value.staking?.stakingTokens[0].denom as string,
    })
    if (bc?.amount) {
      balance.value = bc.amount
    } else {
      balance.value = '0'
    }
  }
}

const handleSendToken = async() => {
  const denom = chain.value.staking?.stakingTokens[0].denom as string;

  const fee = {
    amount: coins(25000, denom),
    gas: "1000000",
  };

  try {
    isSending.value = true
    const tx = await signingCosmosClient.value.helpers.send(
      account.value?.address || '',
      {
        fromAddress: account.value?.address || '',
        toAddress: recipientAddress.value,
        amount: [
          { denom, amount: amount.value },
        ],
      },
      fee,
      "test"
    );
    console.log('tx', tx);
    alert('Transaction was successful!')
    amount.value = ''
  } catch (error) {
    console.error(error);
  } finally {
    isSending.value = false
  }
}
</script>

<template>
  <div>
    <select
      v-model="chainName"
      className="h-9 px-3 mr-4 border rounded-md shadow-sm"
    >
      <option value="osmosistestnet">Osmosis Testnet</option>
      <option value="juno">Juno</option>
      <option value="osmosis">Osmosis</option>
      <option value="stargaze">Stargaze</option>
      <option value="cosmoshub">Cosmos Hub</option>
    </select>
    logo: <img :src="logoUrl" alt="" style="width: 30px;" />
    <div>rpcEndpoint: {{ rpcEndpoint }}</div>
    <div>address: {{ account?.address }}</div>
    <div>balance: {{ balance }} <button @click="getBalance">getBalance</button></div>
    <div>walletStatus: {{ currentWallet?.walletState  }}</div>
    <div>username: {{ account?.username }}</div>
    <div>message: {{ currentWallet?.message }}</div>
    <!-- <button @click="openView">openView</button> -->
    <button v-if="currentWallet?.status !== 'Connected'" @click="handleConnect">connect</button>
    <button v-if="currentWallet?.status === 'Connected'" @click="disconnect">disconnect</button>
    <div>
      <div>amount: <input v-model="amount" type="text" /></div>
      <div>recipient address: <input v-model="recipientAddress" type="text" style="width: 400px;" /></div>
      <button @click="handleSendToken" :disabled="!recipientAddress && !amount">send</button>
    </div>
  </div>
</template>

<style scoped>

</style>
