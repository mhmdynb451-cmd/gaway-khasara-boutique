import type { CapacitorConfig } from "@capacitor/cli";

// الغلاف الأصلي يعرض نسخة الويب المنشورة للمتجر.
// عند نشر المتجر على رابط نهائي، حدّث server.url إلى الرابط النهائي.
const config: CapacitorConfig = {
  appId: "com.baitelhdaya.store",
  appName: "بيت الهدايا غاوي خسارة",
  webDir: "dist",
  server: {
    url: "https://id-preview--9e55d2bd-bda5-5de7-969f-b6e7ef1dcfe4.lovable.app",
    cleartext: false,
  },
  android: { allowMixedContent: false },
};

export default config;
