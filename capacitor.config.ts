import type { CapacitorConfig } from "@capacitor/cli";

// الغلاف الأصلي يعرض نسخة الويب المنشورة للمتجر.
// عند نشر المتجر على رابط نهائي، حدّث server.url إلى الرابط النهائي.
const config: CapacitorConfig = {
  appId: "com.baitelhdaya.store",
  appName: "بيت الهدايا غاوي خسارة",
  webDir: "dist",
  android: { allowMixedContent: false },
};

export default config;
