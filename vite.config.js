import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/geocoding": {
        target: "https://geocoding-api.open-meteo.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/geocoding/, ""),
      },
      "/api/forecast": {
        target: "https://api.open-meteo.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/forecast/, ""),
      },
    },
    allowedHosts: true, // Allow ALL hosts in development
    host: true,
    port: 5174,
  },
});
