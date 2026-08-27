# Comprehensive Site-Wide Performance Optimization Plan

## Objective
Perform a major, site-wide performance optimization across the entire application to eliminate WebGL context loss errors, isolate React re-render cascades, reduce main bundle parse times, unify Web Audio instances, and prevent GPU memory leaks—all while preserving 100% of existing features, visual quality, and simulation fidelity.

---

## 1. Key Optimization Pillars

### Pillar 1: WebGL Context & 3D Scene Management
- **Problem**: Over 30 separate components instantiate independent `new THREE.WebGLRenderer()` contexts in `useEffect` hooks, exceeding the browser limit of 8–16 active contexts. This triggers WebGL context loss warnings (`Too many active WebGL contexts`) and memory leaks.
- **Solution**:
  - Implement a centralized `SharedWebGLViewportManager` / `EngineSceneManager` that reuses active WebGL renderer instances or safely unmounts/disposes WebGL contexts when switching tabs.
  - Enforce strict recursive object disposal (`geometry.dispose()`, `material.dispose()`, `texture.dispose()`) on component unmount across all 3D viewports.
  - Cap renderer pixel ratio at `Math.min(window.devicePixelRatio, 1.5)` to optimize GPU fill rates on high-DPI displays.
  - Apply `THREE.InstancedMesh` or geometry merging (`BufferGeometryUtils.mergeGeometries`) for repeated sub-elements (bolts, spokes, fasteners, valves).

### Pillar 2: React UI & State Re-render Isolation
- **Problem**: Monolithic `DesignContext` and `CompanyContext` wrap large nested objects (`design`, `sim`, `company`). Updating a single slider (e.g. wing angle or boost pressure) triggers full-tree re-renders of headers, docks, dials, telemetry panels, and un-affected sub-studios.
- **Solution**:
  - Refactor monolithic state subscriptions to targeted Zustand selectors (or split `DesignContext` into modular domain contexts: `EngineStateContext`, `AeroStateContext`, `SimResultContext`).
  - Memoize major sub-tab views (`BlockTabPanel`, `HeadsTabPanel`, `TurboTabPanel`, `CosmeticsTabPanel`, `DrivetrainTabPanel`, `CFDView`, `SpatialReferenceSuite`) using `React.memo` with custom prop comparison to isolate slider updates to active sub-panels.

### Pillar 3: Sub-Studio Code-Splitting & Lazy Loading
- **Problem**: Multi-tab containers (`VehicleDesigner.tsx`, `EngineDesigner.tsx`, `GrandAutomotiveStudioHub.tsx`, `SuspensionMasterStudio.tsx`, `AeroLab.tsx`) statically import dozens of heavy child viewports and 3D sub-assemblies, inflating main chunk sizes and initial parse times.
- **Solution**:
  - Convert heavy sub-tab viewports and modal components (`VehicleCompletionModal`, `AssemblyCompletionModal`, `SaveLoadDialog`, `CommandPalette`) to `React.lazy()` with `<Suspense>` fallback loaders.

### Pillar 4: Unified Web Audio Architecture
- **Problem**: 7+ disconnected audio files/synthesizers (`hmiSoundSynth.ts`, `masterEngineAudioSynthesizer.ts`, `assemblyAudioEngine.ts`, `cabinAcousticSynthesizer.ts`, `engineAudioEngine.ts`, `NeonHorizonSoundEngine.ts`) create multiple `AudioContext` instances, hitting browser limits and leaking background audio loops.
- **Solution**:
  - Consolidate all Web Audio operations into a single `MasterAudioEngine` singleton sharing one `AudioContext`.
  - Add `document.addEventListener("visibilitychange")` listeners to suspend audio when the tab is hidden and resume on active focus.

### Pillar 5: Heavy Dataset & Asset Pipeline Optimization
- **Problem**: Large static datasets (`circuitDatabase.ts` track profiles, `masterComponentCatalog.ts` 500+ component specs, `v12Manifest.ts`, fastener standards) are statically bundled in main JS chunks.
- **Solution**:
  - Externalize heavy static datasets into dynamic `import()` modules loaded on demand.
  - Standardize GLB model caching across `GlbAssetCache` and `vehicleGlbAssetLoader` with 4-stage progressive preloading.

---

## 2. Implementation Execution Order

1. **Step 1: WebGL Context Manager & Disposal Rules**
   - Refactor 3D viewports (`ModularEngine3DViewport.tsx`, `Transmission3DStudio.tsx`, `ModularInterior3DStudioViewport.tsx`, `Suspension3DStudioViewport.tsx`, `AerodynamicsStudio.tsx`) to dispose of WebGL contexts and Three.js resources on unmount.
2. **Step 2: React Sub-Studio Code-Splitting**
   - Introduce `React.lazy()` and `<Suspense>` for sub-tab viewports and heavy dialog modals across `VehicleDesigner`, `EngineDesigner`, `GrandAutomotiveStudioHub`, and `StageSwitcher`.
3. **Step 3: State Re-Render Optimization**
   - Optimize state subscriber callbacks and sub-panel memoization (`React.memo`) to isolate parameter updates.
4. **Step 4: Centralized Web Audio Master Manager**
   - Refactor Web Audio synthesizers to share a unified master `AudioContext` with auto-suspend on tab backgrounding.
5. **Step 5: Dataset & Asset Pipeline Code-Splitting**
   - Code-split static catalog datasets and enforce GLB cache reuse.

---

## 3. Verification & Validation Plan

- **TypeScript Compilation**: Run `npx tsc --noEmit` to ensure zero type errors across the codebase.
- **Test Suite Verification**: Run `npx tsx src/sim/modularVehicle/runTests.ts` to ensure 100% of all 189 multi-physics simulation tests pass.
- **WebGL Context Audit**: Ensure active WebGL contexts do not exceed 4 at any given time during navigation across all studios.
- **Zero Regression Guarantee**: Confirm all 3D visuals, 4-stroke engine kinematics, dyno curves, vehicle dynamics, and user controls operate with full fidelity.
