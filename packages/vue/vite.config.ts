// vite.config.ts
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: '@interchain-kit/vue',
      fileName: (format) => `index.${format}.js`,
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      external: ['vue', '@interchain-kit/core', '@interchain-kit/store'],
    },
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
});
