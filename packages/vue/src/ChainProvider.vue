<script setup lang="ts">
import { ref, provide, defineProps, shallowRef, triggerRef, onMounted, onUnmounted } from 'vue'
import { Modal } from './modal'
import { AssetList, Chain } from "@chain-registry/types";
import {
  BaseWallet,
  SignerOptions,
  EndpointOptions,
} from "@interchain-kit/core";
import { WalletManagerStore } from "@interchain-kit/store";
import { WALLET_MANAGER_KEY, OPEN_MODAL_KEY, CLOSE_MODAL_KEY } from './utils/index'

type InterchainWalletProviderProps = {
  chains: Chain[];
  assetLists: AssetList[];
  wallets: BaseWallet[];
  signerOptions: SignerOptions;
  endpointOptions: EndpointOptions;
};

const props = defineProps<InterchainWalletProviderProps>();

const modalRef = ref(null);
const openModal = () => {
  modalRef.value.open();
}
const closeModal = () => {
  modalRef.value.close()
};

// injected globally
provide(OPEN_MODAL_KEY, openModal);
provide(CLOSE_MODAL_KEY, closeModal);

const { chains, assetLists, wallets, signerOptions, endpointOptions } = props;

// State lives in the WalletManagerStore; every store update re-triggers the ref
// so computeds reading through it re-evaluate.
const walletManager = shallowRef(new WalletManagerStore(
  chains,
  assetLists,
  wallets,
  signerOptions,
  endpointOptions,
));
const unsubscribe = walletManager.value.subscribe(() => triggerRef(walletManager));

onMounted(() => {
  walletManager.value.init();
});
onUnmounted(unsubscribe);

// injected globally
provide(WALLET_MANAGER_KEY, walletManager)

</script>

<template>
  <div>
    <slot></slot>
    <Modal ref="modalRef" />
  </div>
</template>

<style scoped>

</style>
