import { createRouter, createWebHistory } from 'vue-router'
import UseChain from './views/use-chain.vue'
import UseChain1 from './views/use-chain-1.vue'
import UseOfflineSigner from './views/useOfflineSigner.vue'
import UseConfig from './views/use-config.vue'

const routes = [
	{ path: '/', name: 'index', component: UseChain },
	{ path: '/use-chain', name: 'useChain', component: UseChain },
	{ path: '/use-chain-1', name: 'useChain1', component: UseChain1 },
	{ path: '/use-offline-signer', name: 'useOfflineSigner', component: UseOfflineSigner },
	{ path: '/use-config', name: 'useConfig', component: UseConfig }
]

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes
})

export default router