import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import compression from "vite-plugin-compression";

export default defineConfig({
  plugins: [
    react(),
    compression({ algorithm: "gzip", threshold: 10240 }),
    compression({ algorithm: "brotliCompress", threshold: 10240 }),
  ],
  server: {
    watch: {
      ignored: [
        "**/Telegram Desktop/**",
        "**/*.avi",
        "**/*.mp4",
        "**/*.mkv",
        "**/*.glb",
        "**/public/models/**",
        "**/public/assets/**",
        "**/brain/**",
        "**/.git/**",
        "**/dist/**",
      ],
    },
    hmr: { overlay: false },
  },
  build: {
    target: "es2022",
    cssCodeSplit: true,
    minify: "esbuild",
    assetsInlineLimit: 8192,
    cssMinify: "esbuild",
    reportCompressedSize: true,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-dom") || id.includes("react/") || id.includes("/react/") || id.includes("scheduler")) {
              return "vendor-react";
            }
            if (id.includes("@react-three/fiber") || id.includes("@react-three/drei") || id.includes("three-stdlib")) {
              return "vendor-r3f";
            }
            if (id.includes("three")) {
              return "vendor-three-core";
            }
            if (id.includes("framer-motion")) {
              return "vendor-motion";
            }
            if (id.includes("lucide-react")) {
              return "vendor-icons";
            }
            if (id.includes("@supabase")) {
              return "vendor-supabase";
            }
            if (id.includes("animejs")) {
              return "vendor-anime";
            }
            if (id.includes("zustand")) {
              return "vendor-state";
            }
            if (id.includes("@gltf-transform")) {
              return "vendor-gltf-transform";
            }
          }
        },
      },
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom", "zustand", "three", "@react-three/fiber", "@react-three/drei"],
    exclude: ["@supabase/supabase-js", "@gltf-transform/core", "@gltf-transform/extensions"],
  },
});
