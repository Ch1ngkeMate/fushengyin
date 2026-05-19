import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 8888,
    host: true,
    proxy: {
      '/api/ernie-image': {
        target: 'https://qianfan.baidubce.com/v2/ernie-image/images/generations',
        changeOrigin: true,
        rewrite: (path) => '',
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.removeHeader('origin');
            proxyReq.removeHeader('referer');
          });
        }
      }
    }
  },
  build: { outDir: 'dist' },
});
