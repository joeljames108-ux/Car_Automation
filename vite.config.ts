import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      ignored: ["**/dist/**"],
    },
  },
  build: {
    target: "es2022",
    cssCodeSplit: true,
    minify: "esbuild",
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("three")) {
              return "vendor-three-core";
            }
            if (id.includes("@react-three")) {
              return "vendor-three-fiber";
            }
            if (id.includes("@gltf-transform")) {
              return "vendor-gltf";
            }
            if (id.includes("lucide-react")) {
              return "vendor-icons";
            }
            if (id.includes("framer-motion")) {
              return "vendor-motion";
            }
            if (id.includes("react") || id.includes("react-dom") || id.includes("zustand")) {
              return "vendor-react-core";
            }
            if (id.includes("@supabase")) {
              return "vendor-supabase";
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 1200,
  },
});

