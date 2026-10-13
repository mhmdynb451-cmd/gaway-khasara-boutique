import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath, URL } from "url";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

const srcDir = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
  base: "./",
  plugins: [TanStackRouterVite(), react()],
  resolve: {
    alias: {
      "@": srcDir,
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
