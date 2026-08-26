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
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-three-core": ["three"],
          "vendor-three-fiber": ["@react-three/fiber", "@react-three/drei"],
          "vendor-gltf": ["@gltf-transform/core", "@gltf-transform/extensions"],
          "vendor-icons": ["lucide-react"],
          "vendor-motion": ["framer-motion"],
          "vendor-react": ["react", "react-dom"],
          "vendor-state": ["zustand"],
        },
      },
    },
    chunkSizeWarningLimit: 1200,
  },
});
