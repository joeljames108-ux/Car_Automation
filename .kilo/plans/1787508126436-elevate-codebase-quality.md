# Comprehensive Codebase Quality Elevation Plan

## Goal
Elevate the overall quality, performance, type safety, test automation, and accessibility of the **apex-engineer** platform across all existing files.

---

## Targeted Improvement Areas

### Phase 1: Performance & Code Splitting
- **Lazy Load Heavy Decks (`src/App.tsx`)**:
  - Replace synchronous imports of heavy 3D engineering studio components (`HypercarConstructorMasterApp`, `VehicleAssemblyDeck`, `Exterior3DStudioDeck`, `InteriorStudioDeck`, `PowertrainStudioDeck`, `ChassisStudioDeck`, `RacingTelemetryDeck`, `VehicleManufacturingDeck`, `AutonomousAiDeck`) with `React.lazy()` dynamic imports.
  - Wrap workspace stage switching in `<Suspense fallback={<GlassLoadingSpinner />}>`.
- **Procedural Geometry Cache**:
  - Audit procedural 3D mesh generators in `src/exterior3d/generators/` and `src/engine3d/generators/` to cache geometry buffer allocations (e.g. `sedanChassisGeometry.ts`, `forgedWheelAssembly3D.ts`) instead of instantiating new `BufferGeometry` instances on every render tick.

### Phase 2: TypeScript Strictness & Type Safety
- **Strict Compiler Flags (`tsconfig.app.json`)**:
  - Enable `"noUnusedLocals": true` and `"noUnusedParameters": true`.
- **Eliminate Critical `any` Types**:
  - Replace `any` casts in `src/exterior3d/loaders/glbMaterialClassifier.ts` and `src/exterior3d/export/universalGlbExporter.ts` with explicit Three.js material interfaces and union types.
  - Strongly type domain agent parameters across `src/sim/agents/domainAgents/`.

### Phase 3: Automated Testing Infrastructure
- **Vitest Integration (`package.json`, `vitest.config.ts`)**:
  - Add `vitest` to `devDependencies`.
  - Add `"test": "vitest run"` script to `package.json`.
  - Create `vitest.config.ts` targeting `src/sim/**/__tests__/**/*.ts` and unit test files.
  - Ensure simulation benchmark tests run headlessly in CI/CD terminal environments.

### Phase 4: UI/UX Accessibility (a11y) & Focus Management
- **Accessibility Enhancements**:
  - Update `VisionGlassHeader.tsx` to include `aria-live="polite"` for thermal and simulation alert messages.
  - Enhance `VisionGlassDock.tsx` and `VisionGlassToolbar.tsx` with proper `aria-expanded`, keyboard focus trap/ring styles, and screen-reader button labels.
  - Add keyboard accessibility to custom control widgets like `GlassSlider.tsx`.

---

## Verification & Validation Plan
1. **Type Check**: Run `tsc --noEmit -p tsconfig.app.json` to verify 0 TypeScript errors under strict unused check flags.
2. **Build**: Run `npm run build` to verify Vite bundle code splitting and chunk generation.
3. **Test Suite**: Execute `npm run test` (via Vitest) to confirm all domain physics benchmark suites pass cleanly.
