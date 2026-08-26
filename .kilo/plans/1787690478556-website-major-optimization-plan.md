# Website-Wide Major Performance Optimization Plan

## Problem Statement & Objective
The website contains an expansive multi-studio ecosystem comprising 50+ workspaces, 3D WebGL scenes, high-precision physics simulation solvers, and interactive tuning suites. To achieve liquid-smooth 60–120 FPS performance across the ENTIRE website:
1. **Simulation Solver Overhead**: Top-level `DesignContext` runs full multi-physics vehicle simulations (`simulate(design)`) synchronously on every state patch (including high-frequency UI slider dragging).
2. **React Re-render Cascades**: Top-level context state updates can propagate re-renders through unmemoized workspace containers.
3. **WebGL Render Loop Idle Management**: 3D viewports without adaptive sleep continue rendering 60 FPS loops even when tabbed out or off-screen.
4. **Heavy List & Data Rendering**: Lists, telemetry grids, and 3D preview cards require deferred rendering and memoized row items.

## Comprehensive Architectural Optimization Strategy

### 1. Simulation & State Solver Optimization (`src/state/DesignContext.tsx`)
- **Action**: Wrap `simulate(design)` in `GlobalPerformanceOptimizer.getInstance().memoize()` using a fast signature hash of the design configuration.
- **Benefit**: Retains calculation results when non-physics properties (e.g. styling, colors, names, UI preferences) change.
- **Deferred Sim Updates**: Use `useDeferredValue` for heavy secondary simulation results (`sim`) so UI inputs update instantaneously while complex aero & vehicle dynamic simulations resolve in low-priority transitions.

### 2. Global Component Memoization & React Barrier
- **Action**: Wrap major workspace stage containers in `React.memo`:
  - `CommandCenter.tsx`
  - `VehicleDesigner.tsx`
  - `InteriorsDesigner.tsx`
  - `ManufacturingDesigner.tsx`
  - `InfotainmentDesigner.tsx`
  - `SafetyCenter.tsx`
  - `SimulationDashboard.tsx`
  - `TestingLab.tsx`
  - `RaceSimulator.tsx`
  - `DetailedStats.tsx`
  - `PressReviews.tsx`
  - `VehicleGarage.tsx`
  - `EngineeringComparison.tsx`
  - `DynamicEconomy.tsx`
  - `MotorsportDivision.tsx`
  - `DigitalTwin.tsx`
  - `SalesLaunch.tsx`
  - `Competitors.tsx`
  - `SupplyChainWorkshop.tsx`
  - `NvhSoundLab.tsx`
- **Benefit**: Ensures that updating state in one workspace tab zero-impacts or zero-renders non-active workspace tabs.

### 3. Adaptive WebGL Render Loops & Asset Disposal
- **Action**: Standardize `AdaptiveRenderController` across all 3D viewports:
  - `EngineAndCar3DGraphicsViewport.tsx`
  - `Transmission3DStudio.tsx`
  - `SuspensionMasterStudio.tsx`
  - `Interior3DViewport.tsx`
  - `WindTunnelAeroStudio.tsx`
- **Behavior**:
  - Automatically pause WebGL rendering loop when OrbitControls are idle and no kinematics animation is playing.
  - Call `geometry.dispose()` and `material.dispose()` when viewports unmount to prevent VRAM memory leaks.

### 4. Idle Pre-fetching & Code Splitting (`src/components/StageSwitcher.tsx`)
- **Action**: Use `requestIdleCallback` to pre-fetch neighbor stage bundles (e.g., pre-importing `VehicleDesigner`, `InteriorsDesigner`, `SimulationDashboard`) after the initial app mount.
- **Benefit**: Stage switching between core tabs achieves 0ms latency.

### 5. High-Frequency UI Slider & Input Smoothness
- **Action**: Audit `GlassSlider`, `Controls.tsx` (Sliders, Selects, Toggles), and `CFDView.tsx` to ensure high-frequency mouse drag events use local transient state or refs, committing to top-level context with smooth debouncing/transitions.

## Actionable Execution Plan

| Phase | Target Area | Implementation Details |
| --- | --- | --- |
| **Phase 1** | Simulation & Context | Memoize `simulate(design)` in `DesignContext.tsx` via `GlobalPerformanceOptimizer`. Add `useDeferredValue` for `sim`. |
| **Phase 2** | WebGL & 3D Viewports | Enforce `AdaptiveRenderController` idle sleep and buffer disposal across all 3D viewports. |
| **Phase 3** | Workspace Components | Wrap 20+ stage container components in `React.memo` with stable prop handlers. |
| **Phase 4** | Stage Pre-fetching | Implement `requestIdleCallback` bundle warming in `StageSwitcher.tsx`. |
| **Phase 5** | Validation & Verification | Execute `npx tsc --noEmit` and `npx vitest run` to ensure 100% test pass rate and clean build. |

## Verification Plan
1. **TypeScript Build**: Verify `npx tsc --noEmit` returns zero errors.
2. **Unit Test Integrity**: Run `npx vitest run` — all 58+ unit test assertions must pass.
3. **Runtime Performance**: Verify 60–120 FPS slider interactions, < 50ms stage switches, and 0 VRAM leaks.
