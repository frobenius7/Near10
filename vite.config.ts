import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'
const reactSvgPlugin = require('vite-plugin-react-svg')

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), reactSvgPlugin({ defaultExport: 'component' })],
  resolve: {
    alias: {
      '@/': `${path.resolve(__dirname, 'src')}/`,
    },
  },
  define: {
    // not recommnded but this works
    global: {},
    'process.env': {},
  },
  base: '',
})
