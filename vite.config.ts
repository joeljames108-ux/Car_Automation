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
        "**/brain/**",
        "**/.git/**",
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
            if (id.includes("three") && !id.includes("@react-three")) return "vendor-three-core";
            if (id.includes("@react-three")) return "vendor-three-fiber";
            if (id.includes("@gltf-transform")) return "vendor-gltf";
            if (id.includes("lucide-react")) return "vendor-icons";
            if (id.includes("framer-motion")) return "vendor-motion";
            if (id.includes("react-dom")) return "vendor-react-dom";
            if (id.includes("react") && !id.includes("react-dom")) return "vendor-react";
            if (id.includes("zustand")) return "vendor-state";
            if (id.includes("@supabase")) return "vendor-supabase";
            return "vendor-misc";
          }
          // 3D exterior
          if (id.includes("/exterior3d/materials/") || id.includes("/exterior3d/loaders/") ||
              id.includes("/exterior3d/scene/") || id.includes("/exterior3d/geometry/") ||
              id.includes("/exterior3d/postprocessing/")) return "app-exterior3d";
          // Engine 3D
          if (id.includes("/engine3d/") || id.includes("/interior3d/")) return "app-engine3d";
          // F1 / Hypercar
          if (id.includes("/f1/") || id.includes("/hypercar/")) return "app-motorsport";
          // UI1 — split into sub-chunks for faster loading
          if (id.includes("/ui1/stages/")) return "app-ui1-stages";
          if (id.includes("/ui1/design/")) return "app-ui1-design";
          if (id.includes("/ui1/spatial/")) return "app-ui1-spatial";
          if (id.includes("/ui1/hud/")) return "app-ui1-hud";
          if (id.includes("/ui1/")) return "app-ui1-core";
          // Physics engine (chunked for rapid initial page load & Lighthouse performance)
          if (id.includes("/sim/physics/") || id.includes("/sim/tires/") ||
              id.includes("/sim/suspension/") || id.includes("/sim/aerodynamics/") ||
              id.includes("/sim/brakes/") || id.includes("/sim/weather/")) return "app-physics";
          // General Simulation
          if (id.includes("/sim/")) return "app-simulation";
        },
      },
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom", "zustand", "three", "@react-three/fiber", "@react-three/drei"],
    exclude: ["@supabase/supabase-js", "@gltf-transform/core", "@gltf-transform/extensions"],
  },
});
