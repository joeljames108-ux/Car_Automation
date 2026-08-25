# ENGINE TAB — PERFORMANCE OPTIMIZATION WITHOUT REDUCING VISUAL QUALITY

## Executive Overview
This implementation plan establishes a zero-visual-compromise performance architecture for the **Engine Tab**. Currently, high-frequency state updates (e.g., slider drags) trigger full scene graph destructions and re-assemblies (`MasterModularEngine3DAssembler.assemble(state)`), causing high JS execution times, heavy React re-renders, draw-call inflation, and GPU/CPU jank.

This plan addresses performance through architectural refactoring, staged loading, asset caching, GPU instancing, scene-level state decoupling, and adaptive idle rendering, while keeping 100% of existing visual quality, PBR materials, geometry detail, and modular assembly functionality.

---

## 1. System Profiling & Bottleneck Diagnosis

### Key Performance Bottlenecks Identified
1. **Scene Graph Destruction on State Update**:
   - In `src/components/engineStudio/ModularEngine3DViewport.tsx`, `useEffect` re-runs on every `state` change, removing all 100+ child meshes, disposing materials, and rebuilding the 3D scene from scratch via `assembler.assemble(state)`.
2. **Eager Preloading Bottleneck**:
   - In `src/engine3d/ModularEngine3DViewport.tsx`, `globalAssetCache.preloadManifests(...)` loads all V12 GLB files simultaneously on initial mount, blocking initial UI responsiveness.
3. **Material Cloning Overhead**:
   - `glbAssetLoader.ts` deep-clones scenes by cloning every mesh's material individually (`mesh.material.clone()`), creating hundreds of unique material instances that prevent batching.
4. **Draw Call Inflation**:
   - Repeated components (12 pistons, 12 conrods, 12 cylinder liners, 24 valves, 12 counterweights, bolts, washers, spark plugs) are rendered as individual `THREE.Mesh` objects, driving draw calls over 150+.
5. **UI & 3D Coupling**:
   - `ModularEngineStudio.tsx` triggers top-level React re-renders on every slider `onChange` event via `engineInstance.subscribe`, re-rendering un-memoized UI panels alongside the 3D viewport wrapper.
6. **Continuous 60 FPS Render Loop**:
   - `requestAnimationFrame` runs constantly even when the user is idle, the camera is stationary, and no kinematics are playing.

---

## 2. Centralized Engine Scene Manager Architecture

Refactor the 3D Engine subsystem around a single `EngineSceneManager` pattern located in `src/engine3d/core/EngineSceneManager.ts`:

```
EngineSceneManager
├── AssetManager (GLTF / GLB async streaming & procedural fallback proxy)
├── GLTFCache (Reference-counted GLTF model memory store)
├── TextureManager (Texture pooling, GPU compressed textures, mipmaps)
├── MaterialManager (Shared PBR material library; zero per-instance cloning)
├── InstanceManager (GPU instancing via THREE.InstancedMesh for repeated parts)
├── AnimationManager (Kinematic 4-stroke animation ticker & rAF interpolation)
├── LightingManager (Baked contact shadows & shadow map freeze during orbit)
├── CameraManager (Smooth camera presets & orbit controls decoupled from React)
├── InteractionManager (Raycast picking, hover pulse, emissive uniforms)
└── PerformanceManager (Dev telemetry monitor: FPS, draw calls, memory, render count)
```

---

## 3. Detailed Implementation Plan & Phased Roadmap

### PHASE 1: Profiling & Dev Telemetry Monitor
- **Files**: `src/engine3d/ui/PerformanceMonitorHUD.tsx`, `src/engine3d/core/PerformanceManager.ts`
- Create a development-only floating HUD tracking:
  - FPS & Frame Time (ms)
  - Draw Calls count (`renderer.info.render.calls`)
  - Triangle / Geometry count (`renderer.info.render.triangles`)
  - Active Textures count
  - Estimated VRAM & Memory usage
  - React Component Render Count
- Add toggle for debug mode in development environments.

### PHASE 2: UI Decoupling & Selective 3D Scene Graph Updates
- **Files**:
  - `src/components/engineStudio/ModularEngineStudio.tsx`
  - `src/components/engineStudio/ModularEngine3DViewport.tsx`
  - `src/components/engineStudio/ModularEngineStudioWorkbench.tsx`
  - `src/exterior3d/generators/engine/masterModularEngine3DAssembler.ts`
- **Actions**:
  - Replace full scene tear-down in `ModularEngine3DViewport.tsx` with selective parameter updates:
    - `updateKinematics(delta)` for RPM / combustion changes.
    - `updateDimensions(bore, stroke, rodLength)` for geometric dimension tweaks.
    - `updateCosmetics(colors, finishes)` for material property updates.
  - Wrap workbench panels, sliders, and tab buttons in `React.memo` with stable callbacks (`useCallback`).
  - Introduce `requestAnimationFrame` batching / debouncing (50ms) for heavy physics calculation in `MasterEngineStateEngine`, while maintaining instant lightweight UI slider updates.

### PHASE 3: Centralized Asset & Material Cache with Zero Material Cloning
- **Files**:
  - `src/engine3d/assets/glbAssetLoader.ts`
  - `src/engine3d/materials/pbrMaterialSystem.ts`
- **Actions**:
  - Refactor `GlbAssetCache.deepCloneScene`: reuse shared material references from `globalMaterialLibrary` instead of cloning materials per mesh instance.
  - Implement material reference counting and variant resolution caching (`resolveMaterialForVariant`).
  - Modify selection/hover highlights to use `mesh.userData.originalMaterial` or instanced emissive color uniforms instead of instantiating new materials.

### PHASE 4: Staged Lazy Loading & Progressive Visual Initialization
- **Files**:
  - `src/engine3d/ModularEngine3DViewport.tsx`
  - `src/engine3d/assets/glbAssetLoader.ts`
  - `src/engine3d/ui/EngineInitializationHUD.tsx`
- **Loading Pipeline**:
  - **Stage 1 (0–200ms)**: Render engine workspace UI frame, studio environment, camera, and lighting.
  - **Stage 2 (200–500ms)**: Stream primary engine block shell & cylinder liners. User can immediately orbit around the engine shell.
  - **Stage 3 (500–1000ms)**: Asynchronously stream visible mechanical assemblies (cylinder heads, valve covers, crankshaft).
  - **Stage 4 (Background)**: Load secondary internal/accessory components on demand (pistons, conrods, intake, exhaust, turbos, supercharger, dry sump, radiator, transaxle).
  - Render a non-blocking HUD indicator (`ENGINE INITIALIZATION [████████░░] 82%`) showing loading progress without blocking user interaction.

### PHASE 5: GPU Instancing & Draw Call Reduction
- **Files**:
  - `src/engine3d/scene/InstancedPistons3D.tsx`
  - `src/engine3d/scene/InstancedValves3D.tsx`
  - `src/engine3d/scene/InstancedFasteners3D.tsx`
  - `src/exterior3d/generators/engine/masterModularEngine3DAssembler.ts`
- **Actions**:
  - Replace individual `THREE.Mesh` allocations for repeated items (pistons, connecting rods, cylinder liners, valves, counterweights, spark plugs, fasteners, pie-cut header welds) with `THREE.InstancedMesh`.
  - Update instance matrix transform matrices (`setMatrixAt`) dynamically during kinematic rotation without re-allocating geometries.
  - Group static non-animated components into optimized render groups (`EngineBlockGroup`, `CylinderHeadGroup`, `AccessoryGroup`, `FastenerGroup`).
  - Target draw call reduction: from 150+ calls down to 15–25 calls.

### PHASE 6: Animation & Slider Interaction Optimization
- **Files**:
  - `src/exterior3d/animation/engineKinematicsAnimator.ts`
  - `src/engine3d/animations/snapAnimationEngine.ts`
  - `src/engine3d/animations/useSnapAnimation.ts`
- **Actions**:
  - Pre-allocate kinematic mathematical vectors and rotation matrices in `EngineKinematicsAnimator` to eliminate per-frame object instantiation (`new THREE.Vector3()`, `new THREE.Matrix4()`).
  - Perform piston/conrod positioning via direct instanced matrix array updates (`instanceMatrix.needsUpdate = true`).
  - Cache animation clips and reuse animation controllers during exploded-view transitions and part snapping.

### PHASE 7: Lighting, Shadow & Camera Control Optimization
- **Files**:
  - `src/engine3d/lighting/SceneLighting.tsx`
  - `src/engine3d/scene/Engine3DScene.tsx`
- **Actions**:
  - Freeze directional light shadow map rendering when the camera and engine geometry are static (`light.shadow.autoUpdate = false`, trigger manual `light.shadow.needsUpdate = true` only when geometry/layout changes).
  - Retain static baked contact shadows (`ContactShadows` with `frames={1}`).
  - Maintain PBR lighting rig (Key, Fill, Rim, Top Downlight, Bottom Bounce) with tuned shadow map camera bounds to eliminate shadow map thrashing.

### PHASE 8: Adaptive Idle Sleeping / Demand-Driven Rendering
- **Files**:
  - `src/engine3d/scene/Engine3DScene.tsx`
  - `src/engine3d/core/PerformanceManager.ts`
- **Actions**:
  - Track user interaction (orbiting camera, playing animation, adjusting sliders, hover/click).
  - When idle for > 2 seconds with engine paused (`isRunning === false`), pause continuous `requestAnimationFrame` loop.
  - Resume full frame rate immediately upon pointer interaction or slider change.

### PHASE 9: Resource Lifecycle & Memory Leak Prevention
- **Files**:
  - `src/engine3d/assets/glbAssetLoader.ts`
  - `src/engine3d/core/EngineSceneManager.ts`
- **Actions**:
  - Implement reference counting in `GlbAssetCache`.
  - When components are removed or unmounted, dispose geometries, textures, materials, and WebGL render targets (`geometry.dispose()`, `material.dispose()`, `texture.dispose()`).
  - Preserve cached resources when navigating between main tabs (Engine, Vehicle, Interior, Aero, Garage) to allow instant restoration without re-downloading or re-parsing assets.

---

## 4. Verification Plan & Performance Benchmarks

### Automated & Manual Verification Steps
1. **Initial Load Benchmark**:
   - Verify engine block shell appears within < 500ms.
   - Verify initial JS load time is reduced by > 50%.
2. **Slider Interaction Smoothness**:
   - Drag RPM, Bore, Stroke, and Turbo Boost sliders continuously.
   - Confirm 60 FPS frame rate with zero full scene graph rebuilds.
3. **Draw Call Audit**:
   - Verify draw calls drop from >150 down to <25 using dev performance HUD.
4. **Memory Leak Check**:
   - Perform 20 component additions/removals and tab switches.
   - Check Heap & VRAM usage in Chrome DevTools to confirm memory returns to baseline.
5. **Visual Quality Parity Audit**:
   - Side-by-side visual check: ensure PBR metalness, roughness, reflections, 4-stroke combustion glow, carbon fiber textures, and geometry detail remain 100% identical to target.
