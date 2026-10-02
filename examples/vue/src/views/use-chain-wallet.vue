<script setup lang="ts">
import { ref } from 'vue'
import { useChainWallet } from '@interchain-kit/vue';
const junoChainName = ref('juno')
const stargazeChainName = ref('stargaze')
const keplrWalletName = ref('keplr-extension')
const leapWalletName = ref('leap-extension')

const junoInKeplrWallet = useChainWallet(junoChainName, keplrWalletName);
const stargazeInKeplrWallet = useChainWallet(stargazeChainName, keplrWalletName);
const junoInLeapWallet = useChainWallet(junoChainName, leapWalletName);
console.log('junoInLeapWallet', junoInLeapWallet)
const stargazeInLeapWallet = useChainWallet(stargazeChainName, leapWalletName);
</script>

<template>
	<div>
		<table>
			<tbody>
				<tr>
					<td>keplr - juno</td>
					<td>{{ junoInKeplrWallet.address }}</td>
					<td>
						<button className="bg-green-300 px-1" @click="junoInKeplrWallet.connect.value()">
							connect
						</button>
					</td>
					<td>
						<button className="bg-red-300 px-1" @click="junoInKeplrWallet.disconnect.value()">
							disconnect
						</button>
					</td>
				</tr>
				<tr>
					<td>keplr - stargaze</td>
					<td>{{ stargazeInKeplrWallet.address }}</td>
					<td>
						<button className="bg-green-300 px-1" @click="stargazeInKeplrWallet.connect.value()">
							connect
						</button>
					</td>
					<td>
						<button className="bg-red-300 px-1" @click="stargazeInKeplrWallet.disconnect.value()">
							disconnect
						</button>
					</td>
				</tr>
				<tr>
					<td>leap - juno</td>
					<td>{{ junoInLeapWallet.address }}</td>
					<td>
						<button className="bg-green-300 px-1" @click="junoInLeapWallet.connect.value()">
							connect
						</button>
					</td>
					<td>
						<button className="bg-red-300 px-1" @click="junoInLeapWallet.disconnect.value()">
							disconnect
						</button>
					</td>
				</tr>
				<tr>
					<td>leap - stargaze</td>
					<td>{{ stargazeInLeapWallet.address }}</td>
					<td>
						<button className="bg-green-300 px-1" @click="stargazeInLeapWallet.connect.value()">
							connect
						</button>
					</td>
					<td>
						<button className="bg-red-300 px-1" @click="stargazeInLeapWallet.disconnect.value()">
							disconnect
						</button>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<style scoped></style>
