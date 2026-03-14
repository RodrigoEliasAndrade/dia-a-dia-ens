import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/dia-a-dia-ens/',
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
})
