# Engine Tab Performance Optimization & Polish Plan

## Problem Summary
The **Engine Tab** currently experiences noticeable loading delays and interaction stutter when switching tabs or adjusting parameters. This is caused by:
1. **Synchronous Heavy Component Mounting**: `EngineDesigner` mounts `UnifiedPowertrainStudio` (which initializes Three.js 3D WebGL scene graphs), `LineChart`, `ApexAgentConsole`, and `HybridTelemetrySuite` (21 sub-telemetry cards) all simultaneously on the main UI thread.
2. **Unmemoized Agent Diagnostics**: `ApexAgentConsole` runs multi-agent QA, lap time predictions, and diagnostic routines on every React render without `useMemo`.
3. **High-Frequency Slider & Solver Recalculations**: Dragging engine parameters triggers immediate single-source-of-truth updates to `MasterEngineStateEngine`, causing full dyno solver recalculations and Three.js 3D mesh updates on every mouse pixel drag.

## Optimization Strategy (100% Quality Preserved)

### 1. Deferred & Lazy Component Rendering
- **Task**: Split the Engine Tab into immediate critical path (Powertrain Studio & 3D Viewport) and deferred secondary panels (`ApexAgentConsole`, `HybridTelemetrySuite`, lower analytics deck).
- **Implementation**:
  - Use `React.lazy` or deferred rendering (`requestIdleCallback` / `setTimeout` / `useDeferredValue`) for `ApexAgentConsole` and `HybridTelemetrySuite`.
  - Allow the Engine tab shell and 3D Viewport to render instantly on tab click (< 50ms transition).

### 2. Memoize Heavy Agent & Dyno Computations
- **Task**: Prevent redundant diagnostic calculations during React render cycles.
- **Implementation**:
  - In `ApexAgentConsole.tsx`, wrap `ChiefPowertrainAgent.getTuningPreset(...)`, `ChiefPowertrainAgent.diagnose(...)`, `RoboticAssemblyQAAgent.inspectAssembly(...)`, and `RaceStrategyAgent.predictCircuits(...)` in `useMemo` dependent on `[engineConfig, installedComponents, activeComponentId, phase, powerHp, weightKg]`.
  - In `EngineDesigner.tsx`, ensure `warnings`, `suggestion`, and `powerSeries` stay strictly memoized with stable references.

### 3. Smooth Slider Interactions via React Transitions / Throttling
- **Task**: Maintain 60 FPS UI slider dragging without main-thread blocking.
- **Implementation**:
  - Use `useTransition` or debounced parameter commit for `MasterEngineStateEngine` updates when tweaking sliders in `ModularEngineStudioWorkbench` or `EngineBuilderFlow`.
  - Local slider state updates instantaneously for silky UI feel, while heavy multi-physics dyno re-solving and 3D mesh re-assembly run smoothly in low-priority state transitions.

### 4. 3D Scene Graph & WebGL Render Loop Polish
- **Task**: Ensure WebGL initialization and scene updates in `ModularEngine3DViewport` remain fast and smooth.
- **Implementation**:
  - Verify material & geometry caching in `MasterModularEngine3DAssembler`.
  - Maintain `AdaptiveRenderController` idle sleep when the canvas is non-interactive or tab is hidden.
  - Defer heavy shadow map matrix updates during continuous orbital rotation or slider dragging.

## Implementation Steps & Target Files

| Step | Action | File |
| shadow | --- | --- |
| 1 | Memoize agent routines in `ApexAgentConsole` | `src/components/agents/ApexAgentConsole.tsx` |
| 2 | Defer non-critical lower-deck analytics & telemetry loading | `src/components/EngineDesigner.tsx` |
| 3 | Optimize slider update state transitions in Workbench | `src/components/engineStudio/ModularEngineStudioWorkbench.tsx` |
| 4 | Fine-tune 3D assembler & viewport render controller | `src/components/engineStudio/ModularEngine3DViewport.tsx` |

## Validation & Verification Plan
1. **Tab Switch Latency**: Test tab switching to `Engine` tab — interface shell and 3D viewport should appear instantly without frame drop.
2. **Slider Drag Responsiveness**: Drag displacement, boost, and RPM sliders — controls should remain 60 FPS smooth.
3. **Quality & Functional Verification**: Verify Dyno curves, power/torque outputs, knock warnings, and AI recommendations remain 100% accurate and visually identical.
