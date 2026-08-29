import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      ignored: ["**/dist/**"],
    },
    // Reduce HMR overhead
    hmr: {
      overlay: false,
    },
  },
  build: {
    target: "es2022",
    cssCodeSplit: true,
    minify: "esbuild",
    // Inline small assets to reduce HTTP requests
    assetsInlineLimit: 8192,
    // Enable CSS minification
    cssMinify: "esbuild",
    // Report compression size
    reportCompressedSize: true,
    // Increase chunk warning limit since we split aggressively
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        // Better chunk naming for long-term caching
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // --- Three.js ecosystem (largest dependency) ---
            if (id.includes("three") && !id.includes("@react-three")) {
              return "vendor-three-core";
            }
            if (id.includes("@react-three")) {
              return "vendor-three-fiber";
            }
            // --- glTF transform ---
            if (id.includes("@gltf-transform")) {
              return "vendor-gltf";
            }
            // --- UI libraries ---
            if (id.includes("lucide-react")) {
              return "vendor-icons";
            }
            if (id.includes("framer-motion")) {
              return "vendor-motion";
            }
            // --- React core (smallest, most cached) ---
            if (id.includes("react-dom")) {
              return "vendor-react-dom";
            }
            if (id.includes("react") && !id.includes("react-dom")) {
              return "vendor-react";
            }
            if (id.includes("zustand")) {
              return "vendor-state";
            }
            // --- Backend ---
            if (id.includes("@supabase")) {
              return "vendor-supabase";
            }
            // --- Everything else in node_modules ---
            return "vendor-misc";
          }

          // --- App code splitting by feature area ---
          // Three.js / 3D material systems (heavy, only loaded when 3D viewports active)
          if (
            id.includes("/exterior3d/materials/") ||
            id.includes("/exterior3d/loaders/") ||
            id.includes("/exterior3d/scene/") ||
            id.includes("/exterior3d/geometry/") ||
            id.includes("/exterior3d/postprocessing/")
          ) {
            return "app-exterior3d";
          }

          // Engine 3D subsystems
          if (
            id.includes("/engine3d/") ||
            id.includes("/interior3d/")
          ) {
            return "app-engine3d";
          }

          // F1 / Hypercar constructor (large, rarely visited)
          if (id.includes("/f1/") || id.includes("/hypercar/")) {
            return "app-motorsport";
          }

          // UI1 / Neon Horizon (separate UI theme)
          if (id.includes("/ui1/")) {
            return "app-ui1";
          }

          // Simulation / telemetry
          if (
            id.includes("/sim/") ||
            id.includes("SimulationDashboard") ||
            id.includes("RaceSimulator") ||
            id.includes("TrackBattles")
          ) {
            return "app-simulation";
          }
        },
      },
    },
  },
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "zustand",
      "three",
      "@react-three/fiber",
      "@react-three/drei",
    ],
    exclude: [
      // Don't pre-bundle these — they're huge and lazy-loaded
      "@supabase/supabase-js",
      "@gltf-transform/core",
      "@gltf-transform/extensions",
    ],
  },
});
