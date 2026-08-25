import { configDefaults, defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, "dist/**"],
    setupFiles: ["./vitest.setup.ts"],
    environment: "jsdom",
    globals: true,
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      manifest: {
        name: "MenuNook",
        short_name: "MenuNook",
        description: "Create and manage a mobile-friendly menu.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#fffefb",
        theme_color: "#fffefb",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["index.html", "assets/*.{js,css,woff2}"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [
          /^\/api\//,
          /^\/trpc\//,
          /^\/auth\/callback/,
        ],
      },
    }),
  ],
  server: {
    proxy: {
      "/trpc": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/auth/callback": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
