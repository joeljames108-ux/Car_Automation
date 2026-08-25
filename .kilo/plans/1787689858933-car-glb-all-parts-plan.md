# Modular Car GLB Asset & Part Pipeline Implementation Plan

## Goal
Implement a comprehensive, production-grade 3D GLB generator and asset pipeline for all 40+ modular vehicle components declared in `EXTERIOR_3D_MANIFEST`, along with a unified master modular car GLB assembly containing full part hierarchy, attachment sockets, and Khronos PBR materials.

---

## Scope & Components

### 1. 3D GLB Generator (`src/exterior3d/generators/carBodyGlbGenerator.ts`)
- **Component Submesh Generators**: Create procedural 3D geometries for all 40+ modular vehicle parts across 6 functional categories:
  1. **Chassis & Structure**: `chassis_frame`, `front_subframe`, `rear_subframe`, `floor_pan`, `firewall_bulkhead`, `a_pillar_assembly`, `b_pillar_assembly`, `c_pillar_assembly`, `rocker_panels`, `crash_boxes_front_rear`, `roll_cage_safety`
  2. **Suspension & Drivetrain**: `suspension_front_assembly`, `suspension_rear_assembly`, `brakes_front_rear`, `wheels_all_four`
  3. **Body Panels & Closures**: `hood_panel`, `front_fenders`, `doors_left_right`, `rear_quarter_panels`, `trunk_decklid`, `roof_panel`, `front_bumper`, `rear_bumper`
  4. **Aerodynamics & Trim**: `front_splitter`, `rear_diffuser`, `side_skirts`, `rear_wing`, `canards_vortex`, `cooling_vents`
  5. **Glazing & Optics**: `windshield_glass`, `side_glass_pair`, `rear_window_glass`, `headlights_pair`, `taillights_pair`, `fog_lights_pair`
  6. **Details & Accessories**: `side_mirrors_pair`, `front_grille`, `exhaust_tips`, `door_handles`, `windshield_wipers`, `emblem_badges`
- **Master Assembly Scene (`buildFullModularCarMasterScene`)**: Assemble all submeshes into a single master vehicle scene (`full_modular_car_assembly.glb`) with named node hierarchy and attachment socket anchors (`socket_*`).
- **Khronos PBR Enhancement**: Pass generated binary buffers through `enhanceGlbBuffer()` to inject PBR metallic-roughness, clearcoat, transmission, and emissive extensions.

### 2. Export Runner (`src/exterior3d/generators/runCarGlbExport.ts`)
- Execute GLTFExporter for each modular part GLB file into `public/models/exterior/` and `public/models/chassis/`.
- Export `full_modular_car_assembly.glb` to `public/models/exterior/`.

### 3. Registry & Manifest Synchronization
- **`src/exterior3d/manifests/exteriorManifest.ts`**: Verify all 40+ asset paths map directly to exported `.glb` files in `public/models/`.
- **`src/exterior3d/geometry/car3dGlbAssetRegistry.ts`**: Register `FULL_MODULAR_CAR_MASTER` asset definition with dimensional metadata (wheelbase, length, width, height) and material zone definitions.

### 4. 3D Viewport Asset Set (`src/exterior3d/scene/ExteriorComponentMesh3D.tsx`)
- Update `AVAILABLE_EXTERIOR_GLB_ASSETS` set to register all 40+ GLB asset paths so the 3D scene renders authored GLB binaries instead of fallback primitives.

### 5. Automated Verification & Asset Integrity Test
- **`src/exterior3d/__tests__/assetManifestIntegrity.test.ts`**:
  - Assert that all 40+ component GLB files exist on disk under `public/models/`.
  - Validate GLB file sizes (> 1 KB) and binary magic headers (`glTF`).
  - Verify `Car3DGlbAssetRegistry` and `EXTERIOR_3D_MANIFEST` consistency.

---

## Step-by-Step Execution Tasks

1. **Extend `carBodyGlbGenerator.ts`**:
   - Implement geometry generators for missing exterior/chassis parts.
   - Build `buildFullModularCarMasterScene()` containing all 40+ submesh nodes and attachment sockets.
   - Wire export logic to generate individual part `.glb` files and master `.glb` file.

2. **Execute Asset Export**:
   - Run GLB generation script to generate and enhance all 40+ `.glb` files in `public/models/exterior/` and `public/models/chassis/`.

3. **Update Registry & Manifests**:
   - Add `FULL_MODULAR_CAR_MASTER` definition to `car3dGlbAssetRegistry.ts`.
   - Update `AVAILABLE_EXTERIOR_GLB_ASSETS` in `ExteriorComponentMesh3D.tsx`.

4. **Add Asset Integrity Tests**:
   - Update `assetManifestIntegrity.test.ts` with the new component GLB family requirements.
   - Execute test suite to confirm zero dangling references and 100% valid GLB headers.

---

## Failure Modes & Recovery
- **Missing GLB File**: Render fallback procedural geometry in `ExteriorComponentMesh3D.tsx`.
- **Material Classification Mismatch**: Ensure submesh names adhere to `GLBMaterialClassifier` naming standards (`Body_*`, `Carbon_*`, `Glass_*`, `Light_*`, `Chrome_*`).
- **Exporter Node Compatibility**: Ensure `NodeFileReader` shim handles Node.js buffer conversion for GLTFExporter.

---

## Validation Criteria
- Every component path in `EXTERIOR_3D_MANIFEST` resolves to a valid `.glb` file (> 1KB with `glTF` magic header).
- `assetManifestIntegrity.test.ts` passes with 0 failures.
- `ExteriorComponentMesh3D` successfully loads and renders both individual GLB parts and master car GLB with real-time PBR material paint zones.
