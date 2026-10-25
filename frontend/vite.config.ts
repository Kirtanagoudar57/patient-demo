import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// If VITE_API_BASE_URL is a relative path such as "/api", the Vite dev server
// forwards those requests to the FastAPI backend (VITE_PROXY_TARGET).
// The browser then only talks to its own origin, so the backend does not need
// CORS configured during development.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiBase = env.VITE_API_BASE_URL || "/api";
  const proxyTarget = env.VITE_PROXY_TARGET || "http://127.0.0.1:8000";

  const proxy = apiBase.startsWith("/")
    ? {
        [apiBase]: {
          target: proxyTarget,
          changeOrigin: true,
          rewrite: (path: string) => path.slice(apiBase.length) || "/",
        },
      }
    : undefined;

  return {
    plugins: [react(), tailwindcss()],
    server: { port: 5173, proxy },
    preview: { port: 4173, proxy },
  };
});
