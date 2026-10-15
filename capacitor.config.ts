import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.gaway.khasara",
  appName: "بيت الهدايا",
  webDir: "dist",
  android: { allowMixedContent: false },
  server: {
    url: "https://project-066482.lovable.app",
    cleartext: true,
  },
};

export default config;
