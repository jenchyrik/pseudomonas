import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: './index.html',
        client: './src/entry-client.jsx',
        server: './src/entry-server.jsx'
      },
      output: {
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  },
  ssr: {
    // SSR specific options
    noExternal: ['react-router-dom']
  }
})
