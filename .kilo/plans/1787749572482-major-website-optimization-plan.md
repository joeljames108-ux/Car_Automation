# Major Website Optimization Plan

## Overview
This plan outlines a comprehensive, 4-pillar performance optimization strategy for the **Apex Engineer** platform. Based on an in-depth codebase audit, the goal is to resolve WebGL context exhaustion, eliminate GPU VRAM leaks, drastically reduce initial bundle size via true 2nd-tier code splitting, eliminate React re-render cascades, and enforce strict cleanup of timers, event listeners, and audio contexts.

---

## Targeted Architecture & Architecture Boundaries

### 1. Bundle Size & Code Splitting (Pillar 1)
- **Container Level Lazy Loading**:
  - Convert static sub-studio imports in `VehicleDesigner.tsx`, `EngineDesigner.tsx`, `InteriorsDesigner.tsx`, `ManufacturingDesigner.tsx`, and `GrandAutomotiveStudioHub.tsx` into dynamic `React.lazy()` calls wrapped in `<Suspense fallback={<StudioLoadingSpinner />}>`.
- **Vite Chunk Optimization (`vite.config.ts`)**:
  - Exclude `@gltf-transform/core` and `@gltf-transform/extensions` from the critical `vendor-three` bundle and move them into a separate `gltf-transform` chunk or async utility module.
- **Stage Alignment (`StageSwitcher.tsx`)**:
  - Prune or clean up unrendered stage branches in `StageSwitcher.tsx` to match the exact active 37 stages.

### 2. WebGL Lifecycle & GPU Memory Disposal (Pillar 2)
- **Shared GPU Resource Disposal Helper (`src/exterior3d/utils/threeDisposal.ts`)**:
  - Implement a recursive cleanup function `disposeThreeScene(scene: THREE.Scene, renderer?: THREE.WebGLRenderer, composer?: EffectComposer)` that:
    1. Traverses the scene hierarchy and disposes geometries (`geometry.dispose()`).
    2. Traverses and disposes materials, maps, normalMaps, roughnessMaps, envMaps (`material.dispose()`, `texture.dispose()`).
    3. Disposes renderer target buffers and webgl context (`renderer.dispose()`, `renderer.forceContextLoss()`).
- **3D Viewport Unmount Verification**:
  - Audit and update `useEffect` unmount returns in:
    - `ModularVehicle3DViewport.tsx`
    - `EngineAndCar3DGraphicsViewport.tsx`
    - `TrackRacing3DViewport.tsx`
    - `HypercarModularAssemblyViewport.tsx`
    - `F1Car3DViewport.tsx`
    - `WindTunnelAeroStudio.tsx`
    - `HolographicCarHUD.tsx`
    - `SpatialReferenceSuite.tsx`
- **Render Loop Throttling & Visibility Guards**:
  - Wrap `requestAnimationFrame` loops with `document.hidden` checks and `IntersectionObserver` visible-state checks to pause rendering when backgrounded or off-screen.
  - Enforce a 60 FPS cap on raw `requestAnimationFrame` loops.

### 3. React Render Efficiency & State Selector Isolation (Pillar 3)
- **Isometric SVG Component Memoization**:
  - Wrap heavy block casting renderers in `React.memo` and internal `useMemo`:
    - `VBankBlockCastingIso.tsx` (~1,322 LOC)
    - `I4BlockCastingIso.tsx`
    - `I6BlockCastingIso.tsx`
    - `W16BlockCastingIso.tsx`
    - `VR6BlockCastingIso.tsx`
- **Zustand Store Selector Refactoring**:
  - Replace full store subscriptions (`const store = useF1ConstructorStore()`) with atomic property selectors (`const activeTab = useF1ConstructorStore(s => s.activeTab)`):
    - `VehicleConstructionStudio.tsx`
    - `ModularGltfShowcaseStudio.tsx`
    - `HypercarComponentBrowser.tsx`
    - `F1ConstructorWorkshop.tsx`
- **Deferred Physics Recalculations (`DesignContext.tsx`)**:
  - Use `useDeferredValue` or `useTransition` for `simulate(design)` recalculations so UI slider drags remain fluid at 60 FPS without blocking the main thread.

### 4. Audio, Timer & Event Listener Cleanup (Pillar 4)
- **Audio Context & Interval Teardown**:
  - Ensure `engineAudioEngine.ts` and `assemblyAudioEngine.ts` stop active `setInterval` loops and close/suspend Web `AudioContext` instances on unmount.
- **Event Listener Teardown**:
  - Audit `window.addEventListener("resize")` and `pointermove` across studio HUDs (`VisionGlassHeader`, `TrackLayoutMasterStudio`, `ModernAnalogClock`, `HolographicCarHUD`) to guarantee symmetric `removeEventListener` cleanup.
- **Bounded Telemetry History**:
  - Cap streaming arrays in `RaceEngineeringDashboard`, `F1LiveRaceSimulator`, and `HypercarLiveRaceSimulator` to max 50–200 entries to prevent memory growth over long simulation sessions.

---

## Step-by-Step Execution Checklist

### Phase 1: Shared Disposal Helper & WebGL Resource Management
- [ ] Create `src/exterior3d/utils/threeDisposal.ts` with deep recursive scene/geometry/material/texture/renderer disposal logic.
- [ ] Update `useEffect` cleanup in `EngineAndCar3DGraphicsViewport.tsx`, `TrackRacing3DViewport.tsx`, `HypercarModularAssemblyViewport.tsx`, `F1Car3DViewport.tsx`, and `WindTunnelAeroStudio.tsx` to invoke `disposeThreeScene()`.
- [ ] Add `document.hidden` and 60 FPS delta-time clamping to 3D `requestAnimationFrame` loops.

### Phase 2: Code Splitting & Dynamic Sub-Studio Loading
- [ ] Refactor `VehicleDesigner.tsx` to dynamically import `ExteriorDesignerIntegration`, `VehicleComparisonStudio`, `AerodynamicsStudio`, `WindTunnelAeroStudio`, `CFDView`, and `ModularLinearAssemblyStudio` with `<Suspense>`.
- [ ] Refactor `EngineDesigner.tsx`, `InteriorsDesigner.tsx`, and `ManufacturingDesigner.tsx` to dynamically import sub-studios.
- [ ] Update `vite.config.ts` manualChunks to split `@gltf-transform` out of critical Three.js bundle.

### Phase 3: React Memoization & Zustand Atomic Selectors
- [ ] Wrap `VBankBlockCastingIso.tsx`, `I4BlockCastingIso.tsx`, `I6BlockCastingIso.tsx`, `W16BlockCastingIso.tsx`, and `VR6BlockCastingIso.tsx` with `React.memo`.
- [ ] Refactor full-store Zustand hooks in `HypercarComponentBrowser.tsx`, `F1ConstructorWorkshop.tsx`, and `VehicleConstructionStudio.tsx` to use atomic selectors.
- [ ] Wrap synchronous simulation triggers in `DesignContext.tsx` using `useDeferredValue`.

### Phase 4: Audio, Timers & Memory Leak Cleanup
- [ ] Add explicit `clearInterval` and `AudioContext.close()` teardown in `engineAudioEngine.ts` and `hmiSoundSynth.ts`.
- [ ] Cap streaming history arrays to 50 items in `RaceEngineeringDashboard.tsx`, `F1LiveRaceSimulator.tsx`, and `HypercarLiveRaceSimulator.tsx`.
- [ ] Audit global window event listeners for complete cleanup.

### Phase 5: Verification & Quality Assurance
- [ ] Run `npx tsc --noEmit` to verify type safety across all modified files.
- [ ] Run `npx vitest run` to verify all 73 unit tests pass.
- [ ] Run `npm run build` to verify production bundle generation and confirm reduced critical chunk sizes.

---

## Validation & Verification Criteria

1. **Type Safety**: `npx tsc --noEmit` must pass with zero errors.
2. **Unit Tests**: `npx vitest run` must pass 100% of tests.
3. **Build Health**: `npm run build` must complete without errors.
4. **WebGL Stability**: No browser WebGL context loss warnings when switching across 3D stages.
