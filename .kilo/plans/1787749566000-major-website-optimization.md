# Comprehensive Website Optimization Plan

## Objective
Execute a major end-to-end performance, rendering, asset delivery, and code quality optimization across the entire Apex Engineer web application.

---

## 1. Bundle & Build Optimization (`vite.config.ts` & Module Boundaries)
- **Refine `manualChunks` strategy in `vite.config.ts`**:
  - Separate `three` and `@react-three` into modular chunks (`vendor-three`, `vendor-three-drei`).
  - Isolate state libraries (`zustand`), UI libraries (`framer-motion`, `lucide-react`), and simulator engines.
  - Set optimal chunk thresholds and ensure clean tree-shaking of unused exports.
- **Dynamic Lazy Loading**:
  - Audit `StageSwitcher` and studio modals for any synchronous dependencies that can be converted to dynamic `React.lazy` imports.

---

## 2. WebGL & 3D Rendering Performance (Three.js / React Three Fiber)
- **Pixel Ratio & GPU Throttling Prevention**:
  - Cap canvas device pixel ratio (`dpr={[1, 1.5]}`) in `ModularVehicle3DViewport.tsx`, `F1Car3DViewport.tsx`, and `EngineAndCar3DGraphicsViewport.tsx` to prevent thermal throttling on 4K/Retina displays.
- **Resource Lifecycle & Memory Leak Prevention**:
  - Add explicit disposal hooks (`geometry.dispose()`, `material.dispose()`, `texture.dispose()`) on 3D component unmounts.
- **Lighting & Shadow Pass Optimization**:
  - Right-size shadow map resolutions and limit real-time light count in WebGL viewports.

---

## 3. React Component Rendering & State Selector Optimization
- **Zustand Selector Fine-Tuning**:
  - Audit `useF1ConstructorStore`, `useAssemblyStore`, `useVehicleConstructionStore`, and `useDesign` hooks to ensure components subscribe strictly to minimal state primitives rather than whole store objects.
- **Component Memoization**:
  - Wrap high-frequency UI components (`StatRail`, `VisionGlassHeader`, `VisionGlassDock`, `VisionGlassToolbar`, `EngineeringLog`, `StageSwitcher`) with `React.memo` and memoize handlers using `useCallback` and `useMemo`.
- **CSS & Layout Hardware Acceleration**:
  - Ensure parallax scroll engines and glassmorphism elements use `translate3d(0, y, 0)` and `will-change: transform` to run at 60–120 FPS without layout thrashing.

---

## 4. Physics & Simulation Engine Optimization
- **Solver Memoization & Single-Pass Computations**:
  - Optimize signature generation and scrutineering loops in `F1PhysicsEngine`, `F1AttachmentGraph`, `HypercarPhysicsEngine`, `EngineAudioEngine`, and `AeroLab`.
  - Replace redundant `Array.filter` passes with single-pass counting loops.

---

## 5. Validation & Quality Gates
- **TypeScript Typecheck**:
  - Run `npm run typecheck` (`tsc --noEmit -p tsconfig.app.json`) to confirm 0 errors.
- **Unit & Simulation Test Suite**:
  - Run `npm test` (`vitest run`) to confirm 100% pass rate across all test suites.
- **Production Build Check**:
  - Run `npm run build` (`vite build`) to verify clean bundle compilation without chunk warnings or syntax errors.
