import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [svgr(), react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'https://open-sci-datahub.zero2x.org',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Origin', 'https://open-sci-datahub.zero2x.org');
          });
        },
      },
    },
  },
  base: '/${APP_NAME}',
  build: {
    outDir: 'build',
    sourcemap: false,
  },
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console'] : undefined,
  },
});
