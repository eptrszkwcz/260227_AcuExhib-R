import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'inline',
      scope: '/',
      workbox: {
        globPatterns: [
          '**/*.js',
          '**/*.css',
          '**/*.html',
          '**/*.ico',
          '**/*.png',
          '**/*.svg',
          '**/*.jpg',
          '**/*.jpeg',
          '**/*.webp',
          '**/*.gif',
          '**/*.woff2',
        ],
      },
    }),
  ],
  base: '/',
  server: {
    port: 4321,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
