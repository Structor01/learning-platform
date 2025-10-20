// vite.config.js

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// Importe as ferramentas corretas do Node.js para lidar com URLs
import { fileURLToPath, URL } from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      // <-- CORREÇÃO APLICADA AQUI
      // Usamos import.meta.url para obter o caminho do arquivo atual
      // e fileURLToPath para convertê-lo em um caminho de sistema de arquivos.
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      }
    },
    hmr: {
      clientPort: 5173,
    },
    headers: {
      'Cache-Control': 'no-store',
    }
  },
  preview: {
    host: "0.0.0.0",
    port: 5173,
  },
  css: {
    postcss: "./postcss.config.js",
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});
