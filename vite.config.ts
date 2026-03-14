import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/ens-dia-a-dia/',
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
})
