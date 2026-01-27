import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: '/kairos-study-tool/',
  plugins: [react()],
  resolve: {
    alias: {
      '@studyos/core': path.resolve(__dirname, '../../packages/core/src'),
      '@studyos/storage': path.resolve(__dirname, '../../packages/storage/src'),
      '@studyos/crypto': path.resolve(__dirname, '../../packages/crypto/src'),
    }
  }
})
