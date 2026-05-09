import { defineConfig, loadEnv } from "vite";
import uni from "@dcloudio/vite-plugin-uni";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [uni()],
    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ['legacy-js-api'],
        },
      },
    },
    define: {
      // 注入给 uni-app 运行时使用（兼容非 import.meta.env 访问场景）
      __API_BASE_URL__: JSON.stringify(env.VITE_API_BASE_URL || 'http://localhost:8080'),
    },
  };
});
