import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Patrimo — Découverte patrimoniale',
        short_name: 'Patrimo',
        description:
          "Saisie de la situation patrimoniale et des objectifs d'un prospect en rendez-vous, 100 % hors-ligne.",
        lang: 'fr',
        display: 'standalone',
        orientation: 'any',
        theme_color: '#1d3557',
        background_color: '#f4f6f9',
        icons: [
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}']
      }
    })
  ]
})
