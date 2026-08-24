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
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-three": ["three", "@react-three/fiber", "@react-three/drei", "@gltf-transform/core", "@gltf-transform/extensions"],
          "vendor-icons": ["lucide-react"],
          "vendor-motion": ["framer-motion"],
          "vendor-react": ["react", "react-dom"],
          "vendor-state": ["zustand"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
