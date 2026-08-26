# Implementation Plan: Interior Studio GLB Phase 2 — Socket Snapping, Draco Optimization & WebXR VR Inspection

## Executive Summary
This plan details the Phase 2 expansion for the Automotive Interior Studio GLB system. Building upon the 3D CAD mesh generators, PBR material synthesizers, acoustic/thermal physics engines, and SAE J1100 ergonomics solvers created in Phase 1, Phase 2 introduces:
1. **Dynamic GLB Part Swapping & Socket Alignment**: Automatic 3D transform alignment of individual `.glb` sub-assemblies onto interior mounting sockets (`DRIVER_SEAT_MOUNT`, `STEERING_MOUNT`, `DASHBOARD_MOUNT`, `CENTER_CONSOLE_MOUNT`, `DOOR_PANEL_LEFT`, `DOOR_PANEL_RIGHT`).
2. **Draco & WebP GLB Compression Pipeline**: Opt-in mesh quantization and Draco geometry compression for exported interior `.glb` binary assets to reduce file sizes by up to 70%.
3. **Multi-Variant 3D Comparison Studio**: Dual-canvas side-by-side GLB interior comparison studio with interactive parameter diffing (mass, acoustics, ergonomics, cost).
4. **WebXR First-Person Spatial VR Cockpit Inspection**: Immersive WebXR VR mode allowing users to inspect the 3D interior cabin using VR spatial headsets (Meta Quest, Apple Vision Pro via WebXR).

---

## Proposed Architecture & Component Scope

### 1. Dynamic GLB Socket Snapping Engine
- **Target File**: `src/exterior3d/generators/interior/interiorGlbSocketSnapper.ts`
- **Responsibilities**:
  - Load sub-GLB models via `UniversalGlbAssetLoader.loadAsset(uri)`.
  - Align GLB origin/bounding box to socket transformations defined in `InteriorMountingGraph`.
  - Handle smooth interpolated part swapping animations when changing seat, steering, or console typologies.

### 2. Draco & Texture Compression for Universal GLB Exporter
- **Target File**: `src/exterior3d/export/universalGlbExporter.ts` (Enhancement)
- **Responsibilities**:
  - Integrate Draco exporter extensions (`KHR_draco_mesh_compression`).
  - Max texture size clamping and KHR_texture_basisu / WebP texture compression options.

### 3. Dual GLB Multi-Variant Comparison Studio
- **Target File**: `src/components/interior/ModularInteriorComparisonStudio.tsx` (Enhancement)
- **Responsibilities**:
  - Render dual 3D R3F/Three.js viewports side-by-side (Variant A vs Variant B).
  - Synchronize camera OrbitControls target and rotation across both viewports.
  - Display comparative delta metrics (Mass Delta $\Delta m$, SPL Delta $\Delta \text{dBA}$, Ergonomics Delta $\Delta S_{SAE}$, Cost Delta $\Delta \$`).

### 4. WebXR Spatial Cockpit Inspection
- **Target File**: `src/components/interior/WebXrCockpitInspector.tsx`
- **Responsibilities**:
  - Enable WebXR `immersive-vr` session manager.
  - Position user VR camera target at Driver Eye H-Point coordinates $(-0.68, 0.88, -0.34)$.
  - Handle controller trigger interactions for door opening and part inspection.

---

## Actionable Execution Plan

### Task 1: Create GLB Socket Snapper (`src/exterior3d/generators/interior/interiorGlbSocketSnapper.ts`)
- Implement `InteriorGlbSocketSnapper.alignGlbToSocket(glbGroup, socketId, halfTrackM, explodedFactor)`.
- Support position, orientation, and bounding box auto-centering for seats, steering wheels, center consoles, and door cards.

### Task 2: Enhance `UniversalGlbExporter` with Compression Options
- Add `dracoCompression` and `textureCompression` parameters to `GlbExportOptions`.
- Ensure output binary `.glb` files pass validation and reduce size.

### Task 3: Upgrade `ModularInteriorComparisonStudio.tsx`
- Connect Variant A and Variant B configurations to `HyperFidelityInteriorCadEngine` and `InteriorAcousticThermalSimulator`.
- Wire synchronized camera OrbitControls using shared refs.

### Task 4: Add WebXR VR Cockpit Inspector (`src/components/interior/WebXrCockpitInspector.tsx`)
- Implement `WebXRManager` check and VR Enter button.
- Bind WebXR controller rays to raycast inspector metadata.

### Task 5: Build Comprehensive Test Suite (`src/sim/interior/__tests__/interiorGlbPhase2Tests.test.ts`)
- Write unit tests for socket snapping alignments, Draco exporter flags, and comparison delta calculations.
- Validate that all 3D CAD hierarchies compile without TypeScript or runtime errors.

---

## Validation Strategy
1. **Automated Unit Tests**: Execute `npx vitest run` to ensure 100% pass rate across all tests.
2. **Type Check**: Execute `npx tsc --noEmit` to confirm zero compilation errors.
3. **Asset Verification**: Re-run `npx tsx scripts/generate-interior-glb.ts` and verify binary magic headers and output sizes.
