import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath, URL } from "url";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

// Robust ESM dirname/paths: derive paths from import.meta.url using URL + fileURLToPath
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = fileURLToPath(new URL("./src", import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [
    TanStackRouterVite(),
    react(),
  ],
  resolve: {
    alias: {
      // Use a URL-derived path for the alias to avoid environments where __dirname may be undefined
      "@": srcDir,
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
