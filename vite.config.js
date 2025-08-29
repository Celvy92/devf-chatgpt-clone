// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy a tu backend Express (puerto 3000)
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        // Nota: NO reescribo /api porque tus rutas ya empiezan con /api (p.ej. /api/health)
        // rewrite: (path) => path.replace(/^\/api/, ""), // <-- déjalo comentado
      },
      // Proxy a Ollama (puerto 11434) si lo usas desde el front
      "/ollama": {
        target: "http://localhost:11434",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ollama/, ""), // tu fetch iría a /ollama/api/...
      },
    },
  },
});
