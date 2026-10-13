import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from "url";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

// Fix for ESM: __dirname is not defined when using 'type: "module"' in package.json.
// Use fileURLToPath(import.meta.url) to derive a proper __dirname for path.resolve.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [
    TanStackRouterVite(),
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
