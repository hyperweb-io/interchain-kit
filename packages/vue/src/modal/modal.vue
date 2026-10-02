<!-- Modal.vue -->
<template>
  <Modal :is-open="visible" :header="null" @close="close">
    <ConnectModalHead :title="title" :hasCloseButton="true" :hasBackButton="hasBack" @back="isList = true"
      :closeButtonProps="closeButtonProps" @close="close" />
    <ConnectModalWalletList v-if="isList" :wallets="wallets" @wallet-item-click="walletClick" />
    <ConnectModalQrcode 
      v-else-if="currentWallet?.info?.mode === 'wallet-connect' && pairingUri"
      status="Done" 
      :link="pairingUri"
      description="Open App to connect" 
      @onRefresh="onRefresh" 
      :qrCodeSize="230" 
    />
    <!-- Connecting, Connected, Rejected -->
    <ConnectModalStatus 
      v-else 
      :wallet="{
        name: currentWallet?.info?.name,
        prettyName: currentWallet?.info?.prettyName,
        logo: currentWallet?.info?.logo as string,
        mobileDisabled: true
      }" 
      :connected-info="connectedInfo" 
      :status="walletState" 
      :content-header="contentHeader"
      :content-desc="contentDesc" 
      @connect="walletClick(currentWallet)" 
      @disconnect="disconnect(currentWallet)" 
    />
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCurrentWallet, useWalletManager, useAccount } from '../composables'
import { WalletState } from '@interchain-kit/core';
import {
  Modal,
  ConnectModalQrcode,
  ConnectModalHead,
  ConnectModalWalletList,
  ConnectModalStatus
} from "@interchain-ui/vue";

const visible = ref(false);
const isList = ref(true)
// Rejected
const errorMessage = ref('')
const walletManager = useWalletManager();
const currentWallet = useCurrentWallet();
const chainName = computed(() => {
  return walletManager.value.currentChainName || walletManager.value.chains[0].chainName
})
const walletName = computed(() => {
  return currentWallet.value?.info?.name
})
const account = useAccount(chainName, walletName)
const walletState = computed(() => {
  return walletManager.value.getChainWalletState(walletName.value, chainName.value)?.walletState
})
const pairingUri = computed(() => walletManager.value.walletConnectQRCodeUri)
const onRefresh = () => walletClick({ name: walletName.value })

const wallets = computed(() => walletManager.value.wallets.map((w) => ({
  name: w.info.name,
  prettyName: w.info.prettyName,
  logo: w.info.logo as string,
  mobileDisabled: true,
  shape: 'list' as 'list',
  originalWallet: w
})))

const title = computed(() => {
  if (!currentWallet.value) {
    return 'Select your wallet'
  } else if (
    [WalletState.Connecting, WalletState.Rejected, WalletState.Connected, WalletState.Disconnected].includes(walletState.value)) {
    return currentWallet.value?.info?.prettyName
  }
})
const contentHeader = computed(() => {
  if (walletState.value === WalletState.Connecting) {
    return 'Requesting Connection'
  } else if (walletState.value === WalletState.Rejected) {
    return 'Request Rejected'
  }
})
const contentDesc = computed(() => {
  if (walletState.value === WalletState.Connecting) {
    return `Open the ${currentWallet.value?.info?.prettyName} browser extension to connect your wallet.`
  } else if (walletState.value === WalletState.Rejected) {
    return errorMessage.value || 'Connection permission is denied.'
  }
})
const connectedInfo = computed(() => {
  return {
    name: account.value?.username || 'Wallet',
    avatar: "https://picsum.photos/500", // TO_BE_FIXED
    address: account.value?.address
  }
})
const hasBack = computed(() => {
  return !isList.value
})

const open = () => {
  visible.value = true;
};

const close = () => {
  visible.value = false;
  // reset
  isList.value = true
  errorMessage.value = ''
};

const closeButtonProps = {
  onClick: close
}

const getName = (wallet: { name?: string, info?: { name: string } }) => wallet?.name ?? wallet?.info?.name

const walletClick = async (wallet: { name?: string, info?: { name: string } }) => {
  const name = getName(wallet)
  isList.value = false
  try {
    walletManager.value.setCurrentWalletName(name)
    walletManager.value.setCurrentChainName(chainName.value)
    await walletManager.value.connect(name, chainName.value)
    errorMessage.value = ''
  } catch (e: any) {
    errorMessage.value = e.message
    console.error('[wallet connecting error]', e.message)
  }
}

const disconnect = async (wallet: { name?: string, info?: { name: string } }) => {
  try {
    await walletManager.value.disconnect(getName(wallet), chainName.value);
    close()
  } catch (e: any) {
    console.log('[wallet disconnecting error]', e.message)
  }
}

defineExpose({
  open,
  close
})
</script>

<style></style>
