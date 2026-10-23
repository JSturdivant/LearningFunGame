import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    // Service worker + manifest so the app works offline once it has been
    // opened (or added to the home screen). Updates install on the next
    // launch while online.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png'],
      manifest: {
        name: 'Princess Learning Fun',
        short_name: 'Learning Fun',
        description: 'Games to make learning fun!',
        display: 'standalone',
        start_url: '/',
        background_color: '#2d0a4e',
        theme_color: '#2d0a4e',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg}'],
      },
    }),
  ],
});
