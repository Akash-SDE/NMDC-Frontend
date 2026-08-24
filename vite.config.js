import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5184,
    strictPort: true,
    headers: {
      "Cache-Control": "no-store",
    },
  },
  preview: {
    port: 5184,
    strictPort: true,
    allowedHosts: ['nmdc-frontend.onrender.com'],
    headers: {
      "Cache-Control": "no-store",
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/tests/setup.js",
  },
});
