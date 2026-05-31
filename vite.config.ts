import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/dia-a-dia-ens/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'ENS Dia a Dia',
        short_name: 'ENS',
        description: 'Companheiro digital de oração para casais ENS',
        start_url: '/dia-a-dia-ens/',
        scope: '/dia-a-dia-ens/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#f5f5f0',
        theme_color: '#2c3e6b',
        lang: 'pt-BR',
        categories: ['lifestyle', 'spirituality', 'productivity'],
        icons: [
          {
            src: '/dia-a-dia-ens/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/dia-a-dia-ens/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/dia-a-dia-ens/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // App shell + assets are cached automatically.
        // Supabase REST/Realtime go to network (NetworkOnly via no caching).
        navigateFallback: '/dia-a-dia-ens/index.html',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/[^/]+\.supabase\.co\/.*$/i,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/liturgia\.up\.railway\.app\/.*$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'liturgy-cache',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 7,
                maxAgeSeconds: 60 * 60 * 24, // 1 day
              },
            },
          },
        ],
      },
    }),
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-router')) return 'react-vendor';
            if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('scheduler')) {
              return 'react-vendor';
            }
            if (id.includes('@supabase')) return 'supabase';
            if (id.includes('date-fns')) return 'date';
            if (id.includes('lucide-react')) return 'icons';
          }
          return undefined;
        },
      },
    },
  },
})
