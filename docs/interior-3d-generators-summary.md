# Interior 3D Generators — Technical Summary

Consolidated documentation for the procedural automotive interior CAD/generators subsystem located at `src/exterior3d/generators/interior/`.

## Scope

27 TypeScript files populate the `interior/` directory. Six core generators plus a GLB socket-snapper form the backbone of the procedural interior CAD suite. This document summarizes each generator's exports, component graph, materials usage, and CAD-engine integration.

---

## 1. `dashboard3DGenerator.ts` (427 lines)

**Dashboard3DGenerator** — Procedural dashboard with variants.

- Imports: `../../types/interiorStudioTypes`
- Variants: 5
- Builds a full dashboard assembly including:
  - Instrument cluster binnacle
  - Center stack + infotainment screen
  - HVAC vents and controls
  - Materials via the shared interior-studio types

---

## 2. `steeringWheel3DGenerator.ts` (395 lines)

**SteeringWheel3DGenerator** — Procedural steering column and wheel.

- Imports: `../../types/interiorStudioTypes`
- Typologies: 6 (sport/classic/luxury/etc.)
- Exports `buildSteeringColumnHelper()`
- Produces:
  - Steering wheel rim + spokes + hub
  - Column shroud and stalks
  - Airbag module placement

---

## 3. `seating3DGenerator.ts` (295 lines)

**Seating3DGenerator** — Procedural seating.

- Imports: `../../types/interiorStudioTypes`
- Front: executive + sport seat configurations
- Rear: rear bench
- Belt harness geometry
- Seat cushion/backrest/headrest + recline structures

---

## 4. `centerConsole3DGenerator.ts` (324 lines)

**CenterConsole3DGenerator** — Procedural center console.

- Imports: `../../types/interiorStudioTypes`
- Styles: 5
- Gear shifter, storage bin, cup holders, armrest, secondary controls

---

## 5. `doorCard3DGenerator.ts` (175 lines)

**DoorCard3DGenerator** — Procedural door cards.

- Imports: `../../types/interiorStudioTypes`
- Exports `buildDoorAssembly(side)` — left/right mirrored
- Door panel, armrest, switch module, handle, speaker grille

---

## 6. `hyperFidelityInteriorCadEngine.ts` (890 lines)

**HyperFidelityInteriorCadEngine** — High-fidelity CAD assembly engine.

Imports:
- `../../../sim/interior/masterInteriorTypes` (`MasterModularInteriorState`)
- `../../materials/interiorMaterialPbrSynthesizer` (`InteriorMaterialPbrSynthesizer`)

Key assembly builders (with representative masses):

| Assembly | Method | Mass (kg) |
|---|---|---|
| Monocoque tub | `buildMonocoqueTub` | — |
| Dashboard | `buildDashboardAssembly` | 28.0 |
| Steering | `buildSteeringAssembly` | 5.8 |
| Center console | `buildCenterConsoleAssembly` | 16.5 |
| Door cards | `buildDoorCardAssemblies` | 22.0 |
| Pedal box | `buildPedalBoxAssembly` | 4.2 |
| Safety & roof | `buildSafetyAndRoofAssembly` | 18.5 |

- Material helpers: lines 787–845 (PBR synthesis into CAD surfaces)
- `tagComponent()`: lines 846–889 — stamps `InteriorCadComponentMetadata` onto each built component (id, name, mass, material ref, parent).

Exports `InteriorCadComponentMetadata`.

---

## 7. `interiorGlbSocketSnapper.ts` (128 lines)

**InteriorGlbSocketSnapper** — socket-to-GLB alignment utilities.

Imports:
- `../../sockets/interiorMountingGraph` (`InteriorMountingGraph`, `InteriorSocketId`, `SocketTransform`)
- `../../../sim/interior/masterInteriorTypes`
- `../../loaders/universalGlbAssetLoader` (`UniversalGlbAssetLoader`)
- `./masterModularInterior3DAssembler`

Exports:
- `SocketSnappedGlbComponent`
- `alignGlbToSocket(...)`
- `buildFullySnappedGlbCabinAsync(...)` — loads assets, aligns to mounting sockets, composes a fully-snapped GLB cabin.

---

## 8. Supporting Modules

- `masterModularInterior3DAssembler.ts` (53991 bytes) — largest module; the modular assembler that consumes generator outputs and composes the complete interior scene graph.
- `../../export/universalGlbExporter.ts` (162 lines) — **UniversalGlbExporter**; uses `GLTFExporter` from `three/examples/jsm/exporters/GLTFExporter.js`; binary emits `.glb`, JSON emits `.gltf`; `exportInteriorCabinToGlb` forces `binary: true`.

---

## GLB Export & Active UI Callers

- `exportInteriorCabinToGlb` — `src/sim/interior/masterBespokeInteriorSuite.ts:105`
- `exportVehicleToGlb` — `src/components/vehicleAssembly/ModularGltfShowcaseStudio.tsx:47`, `triggerBrowserDownload` at line 51
- `src/components/interior/ModularInteriorComparisonStudio.tsx:51–52`

Export path is fully wired: generator assembly → socket snapping → `UniversalGlbExporter` → browser download handler.

---

## Testing — `interiorGlbPhase2Tests.test.ts` (68 lines)

- Node `FileReader` polyfill (lines 11–22)
- **Test 1:** socket snapping of a single component
- **Test 2:** cabin snapping — asserts `children.length >= 6`
- **Test 3:** export asserts `bespoke_gt3_cockpit.glb` exists with `byteLength > 1024`

---

## Key Shared Types & Materials

- `src/exterior3d/types/interiorStudioTypes.ts` — shared types for generators 1–5
- `src/exterior3d/materials/interiorMaterialPbrSynthesizer.ts` — `InteriorMaterialPbrSynthesizer` (used by CAD engine)
- `src/sim/interior/masterInteriorTypes.ts` — `MasterModularInteriorState`
- `src/exterior3d/sockets/interiorMountingGraph.ts` — `InteriorMountingGraph`, `InteriorSocketId`, `SocketTransform`
- `src/exterior3d/loaders/universalGlbAssetLoader.ts` — `UniversalGlbAssetLoader.loadAsset(path)`
