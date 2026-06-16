// Nama file: vite.config.js
// Deskripsi: Konfigurasi bundler Vite 5 dengan plugin React dan proxy dev-server ke backend Express

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Mengarahkan request /api ke port backend Express (3000) saat development
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
