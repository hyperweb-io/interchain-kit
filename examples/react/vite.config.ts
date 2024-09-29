import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis'
      },
      // Enable esbuild polyfill plugins
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true
        })
      ]
    }
  },
  resolve: {
    alias: {
      "node-fetch": "node-fetch/lib/index.js",
      "stream": "stream-browserify",
      '@interchain-kit/react': path.resolve(__dirname, '../../packages/react/src'),
      '@interchain-kit/core': path.resolve(__dirname, '../../packages/core/src'),
      '@interchain-kit/keplr-extension': path.resolve(__dirname, '../../wallets/keplr-extension/src'),
      '@interchain-kit/leap-extension': path.resolve(__dirname, '../../wallets/leap-extension/src'),
      '@interchain-kit/cosmostation-extension': path.resolve(__dirname, '../../wallets/cosmostation-extension/src'),
      '@interchain-kit/station-extension': path.resolve(__dirname, '../../wallets/station-extension/src'),
      '@interchain-kit/galaxy-station-extension': path.resolve(__dirname, '../../wallets/galaxy-station-extension/src'),
      '@interchain-kit/mock-wallet': path.resolve(__dirname, '../../wallets/mock-wallet/src'),
    }
  }
})
