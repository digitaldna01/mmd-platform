import optimizeLocales from "@react-aria/optimize-locales-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // React Aria의 안내 문구는 화면 언어(shared/ui/UiProvider의 APP_LOCALE)만 남깁니다
  plugins: [react(), optimizeLocales.vite({ locales: ["ko-KR"] })],
  server: {
    proxy: {
      "/api": "http://localhost:8080",
    },
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["src/test-setup.ts"],
  },
});
