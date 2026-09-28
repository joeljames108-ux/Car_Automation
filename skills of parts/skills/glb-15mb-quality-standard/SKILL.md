---
name: glb-15mb-quality-standard
description: MANDATORY AUTOMOTIVE 3D STANDARD. Must be activated whenever creating, generating, upgrading, or exporting 3D models, vehicles, cars, or .glb files. Mandates 100% Blender procedural CAD generation (no Three.js mock boxes), autonomous multi-angle reference-comparison loop until perfection is reached, Grade A (≥90%) validation on validate_glb_quality.py --strict-a, and automated post-generation wiring into public/models and matrix_manifest.json. Includes full PBR Next extensions matrix, Class-A CAD topology, 11-subsystem allocations, and era-recompilation architecture.
---

# 15 MB Automotive GLB Quality Standard

This skill defines the **quantitative specification and industry standard** for producing high-fidelity automotive GLBs that consistently achieve AAA visual quality at approximately 15 MB file size. It synthesizes findings from the **Khronos Group Asset Creation Guidelines 2.0**, industry real-time automotive benchmarks (Sketchfab / Unreal / WebGL), and deep forensic reverse-engineering of the `Car_GT3_Supercar_Complete.glb` reference asset.

**MANDATORY ACTIVATION: This skill MUST be activated and strictly adhered to whenever ANY 3D asset, vehicle, or .glb file is generated, edited, or evaluated.**

---

## 0. MANDATORY CORE DIRECTIVES

> [!IMPORTANT]
> **THREE NON-NEGOTIABLE LAWS FOR ALL 3D VEHICLE WORK**:
> 1. **100% Blender CAD Generation**: All 3D vehicles and components MUST be generated via Blender (MCP / `bpy`). Never use Three.js boxes or synthetic code primitives.
> 2. **Multi-Angle Reference Comparison Loop**: Take screenshots from multiple angles, visually compare against reference DNA/images, and iterate in Blender again and again until perfection is reached before finalizing export.
> 3. **Mandatory Post-Generation Wiring**: Immediately wire generated GLBs into their designated application paths, synchronize `matrix_manifest.json`, and verify test suites.

### 0.1 Always Use Blender for 3D GLBs (Zero Three.js / Code Mock Primitives)
- **Blender is the exclusive 3D generation engine** for all vehicles, chassis, cockpits, suspensions, engines, and aerodynamics.
- **NEVER substitute with Three.js procedural boxes, cylinders, or mock meshes** in frontend TypeScript files. Frontends only ingest and render finished, Blender-baked GLBs.
- All models must use authentic Class-A CAD topology (quad control cages, Catmull-Clark subdivision, angle-limited bevels, Face-Weighted Normals).

### 0.2 Multi-Angle Reference-Comparison & Iterative Perfection Loop
- **Never export blind or without visual critique**:
  1. Capture screenshots across 5 standardized automotive angles (Front 3/4, Rear 3/4, Side, Front, Rear) plus interior/macro views.
  2. Compare each view side-by-side against reference vehicle photos, styling DNA, or blueprints.
  3. Critically score silhouette, stance, daylight opening (DLO), shutlines, optical lighting, and highlight rolloff.
  4. Perform targeted in-place bmesh edits in Blender and re-screenshot.
  5. **Repeat this loop again and again until visual perfection is reached**.

### 0.3 Mandatory Post-Generation Wiring & Synchronization
- Asset generation is **NOT complete** until the GLB is actively wired into the application:
  1. Complete vehicles copied to `public/models/vehicles/{architecture}/{era}/vehicle.glb` (and master models to `public/models/Car_*_Complete.glb` and `exports/Car_*_Complete.glb`).
  2. Zero-offset modular parts copied to `public/models/modular_parts/` and `exports/parts/`.
  3. Cell metadata in `public/models/vehicles/matrix_manifest.json` updated to status `"COMPLETE"` with verified file size, polycount, Grade A score, and timestamp.
  4. Ensure `src/sim/vehicleArchitecture/vehicleArchitectureMatrix.ts` and UI stores load the asset seamlessly.
  5. Verify 100% clean TypeScript build (`npx tsc --noEmit -p tsconfig.app.json`) and test suite pass (`npx tsx src/sim/modularVehicle/runTests.ts`).

### 0.4 Mandatory Grade A (≥ 90.0%) Standard
Every vehicle GLB **MUST achieve Grade A (≥ 90.0% score)** on `validate_glb_quality.py --strict-a`. Never accept Grade B, C, D, or F.

#### Why Grade B is Rejected:
The benchmark vehicle (`Car_GT3_Supercar_Complete.glb`) achieved **Grade B (88.9%)**. While visually impressive on the surface, forensic analysis proved it has **critical flaws**:
1. **Empty Subsystems**: `ENGINE_BAY`, `CHASSIS`, and `SUSPENSION` branches exist in the hierarchy but contain **0 meshes and 0 triangles**.
2. **Under-Weight**: Because those 3 subsystems are empty, it stops at **12.4 MB** instead of the full 15 MB standard.
3. **Flat Tires**: Tires are low-poly smooth cylinders (~4,500 tris, 1.3%) with zero 3D tread siping.
4. **Missing Optical Extensions**: Lacks `KHR_materials_transmission` and `KHR_materials_ior` for realistic dielectric glass.

#### Grade A Requirements Checklist:
- [ ] **File Size**: 13.5 MB – 16.5 MB (nominal 15.0 MB).
- [ ] **Geometry**: 420,000 – 500,000 triangles across all 11 populated subsystems.
- [ ] **Zero Empty Subsystems**: Every subsystem must exceed its minimum fill percentage (Engine ≥ 3%, Chassis ≥ 2%, Suspension ≥ 1.5%).
- [ ] **Pure PBR**: 0 texture images (100% procedural Principled BSDF shaders).
- [ ] **glTF Extensions**: `KHR_materials_clearcoat`, `KHR_materials_emissive_strength`, `KHR_materials_transmission`, `KHR_materials_ior`.
- [ ] **Hierarchy**: `VEHICLE_ROOT` + 12 standardized subsystem branches.
- [ ] **Validator Gate**: Must pass `python validate_glb_quality.py <model.glb> --strict-a` with exit code 0.

### 0.5 Scale & Phased Execution Rule: Zero Quality Compromise
> [!CAUTION]
> **NEVER RUSH LARGE SCOPE**: Upgrading or producing an entire fleet of vehicles (e.g. the 168-cell matrix) to this standard involves generating over **75,000,000+ triangles** and gigabytes of Class-A CAD data.
> - **Full execution takes days/weeks of intensive engineering.**
> - **Zero compromises**: Under no circumstances should an agent ever rush, reduce triangle budgets, or generate low-poly cube placeholders to fake quick completion.
> - **Disciplined phases**: Split large scopes into rigorous, prioritized milestones where each delivered phase meets the 100% Grade A standard before the next phase begins.


---

## 1. Industry Benchmarks & Standards (Khronos 2.0 & Real-Time Automotive)

Research into production-grade automotive 3D assets on the web (Khronos glTF Sample Assets, Sketchfab Real-Time Automotive, Unreal Engine Automotive Configurator) establishes three critical technical pillars:

### 1.1 The Real-Time Cinematic Automotive Triangle Budget
Industry real-time 3D viewers categorize vehicles into distinct tiers:
- **Mobile / Background**: < 15,000 tris (< 0.5 MB) — low-poly background traffic only.
- **Mid-Poly / Performance**: 50,000 – 95,000 tris (2–4 MB) — exterior only, opaque glass.
- **Cinematic Hero Asset (Our Standard)**: **420,000 – 550,000 tris (13.5–16.5 MB)** — full Class-A exterior + complete 3D interior cabin + modeled multi-piece running gear + optical dielectric lighting.

### 1.2 Khronos glTF PBR Next Automotive Extension Suite
Modern web graphics (Three.js r150+, Babylon.js, Filament) support Khronos PBR Next extensions. A Grade A automotive GLB leverages these extensions to avoid heavy bitmap textures:

| Extension | Automotive Application | Parameter Values |
|---|---|---|
| **`KHR_materials_clearcoat`** | Two-layer automotive paint, lacquered carbon fiber, polished alloy lips | `clearcoat=1.0`, `clearcoatRoughness=0.05–0.10` |
| **`KHR_materials_transmission`** | Dielectric glass, headlamp polycarbonate covers, gauge cluster lenses | `transmission=0.92–0.96` |
| **`KHR_materials_ior`** | Physical index of refraction for optical accuracy | `ior=1.52` (soda-lime glass), `ior=1.58` (polycarbonate) |
| **`KHR_materials_volume`** | Volumetric light absorption (prevents WebGL alpha-sorting glitches) | `attenuationColor=(0.95, 0.98, 1.0)`, `attenuationDistance=0.05` |
| **`KHR_materials_anisotropy`** | Directional micro-groove reflections on brake rotors and turned alloy | `anisotropyStrength=0.85`, `anisotropyRotation=0.0` (radial) |
| **`KHR_materials_sheen`** | Soft micro-fiber light scatter for Alcantara headliners and seats | `sheenColor=(0.8, 0.8, 0.8)`, `sheenRoughness=0.5` |
| **`KHR_materials_emissive_strength`** | High dynamic range (HDR) LED projectors, DRL light-pipes, OLED tails | `emissiveStrength=15.0–25.0` |

### 1.3 Class-A CAD Topology Rules
1. **Curvature Continuity (G2 Continuity)**:
   All exterior body panels must use quad-dominant control cages amplified by **Catmull-Clark subdivision** (render level 2 or 3). Triangle-grid boolean meshes are strictly forbidden on primary surfaces.
2. **Face-Weighted Normals (FWN)**:
   To prevent waviness across beveled panel gaps, every mesh must have frozen split normals cleared (`mesh.split_normals_clear()`) and evaluate a **`WeightedNormal`** modifier with `keep_sharp=True`.
3. **Automotive Fillet Radii**:
   All panel edges must have a **2.5mm – 4.0mm angle-limited chamfer bevel** (2–3 segments, 30° limit). Razor-sharp 90° digital corners destroy realism by eliminating highlight rolloff.
4. **Draw-Call Consolidation**:
   Never create hundreds of separate meshes or materials (e.g. `full_modular_car_assembly.glb` failed with 388 materials). Consolidate into **14–18 shared material slots** across **40–80 functional nodes**.

---

## 2. The Byte Budget Formula

GLB files store geometry as raw floating-point binary buffers. The file size is determined by vertex count, not code line count:

```
GLB Size ≈ total_vertices × 32 bytes + index_overhead + JSON_header

Where 32 bytes/vertex = 12 (POSITION vec3) + 12 (NORMAL vec3) + 8 (UV vec2)
Index overhead ≈ total_triangles × 6 bytes (UNSIGNED_SHORT)
JSON header ≈ 50–80 KB (negligible)
```

### Target Sizes

| Vehicle Class | Triangles | Vertices | Target GLB Size |
| :--- | ---: | ---: | ---: |
| Compact / Hatchback | 300,000 | 280,000 | ~10 MB |
| **Sedan / Coupe / Supercar** | **460,000** | **420,000** | **~15 MB** |
| Hypercar / F1 | 600,000 | 550,000 | ~20 MB |

---

## 3. Triangle Budget Per Subsystem

Every vehicle must allocate its triangle budget across 12 mandatory subsystem branches under `VEHICLE_ROOT`:

```text
┌──────────────────────┬───────────┬────────┬────────────────────────────────────────────┐
│ Subsystem            │ Tris      │ % of   │ Required Contents                          │
│                      │ Target    │ Total  │                                            │
├──────────────────────┼───────────┼────────┼────────────────────────────────────────────┤
│ BODY                 │ 140,000   │ 30.4%  │ Hood, doors, fenders, bumpers, mirrors,    │
│                      │           │        │ trim strips, carbon splitters, diffuser     │
│ CABIN                │ 120,000   │ 26.1%  │ Dashboard, seats ×2, steering wheel,       │
│                      │           │        │ paddle shifters, console, instruments       │
│ WHEELS (×4)          │  60,000   │ 13.0%  │ Multi-spoke rims, hub caps, 5 lug nuts     │
│ BRAKES (×4)          │  36,000   │  7.8%  │ Cross-drilled rotors, multi-piston calipers│
│ ENGINE_BAY           │  35,000   │  7.6%  │ Engine block, intake, cam covers, headers  │
│ CHASSIS              │  25,000   │  5.4%  │ Monocoque tub, subframes, roll cage, floor │
│ LIGHTING             │  16,000   │  3.5%  │ Projector LEDs, DRL brows, OLED tails      │
│ SUSPENSION           │  15,000   │  3.3%  │ Double-wishbone A-arms, coilovers, bars    │
│ GLASS                │  10,000   │  2.2%  │ Windshield, rear glass, side windows       │
│ TIRES                │   5,000   │  1.1%  │ Directional tread rubber ×4                │
│ UNDERBODY            │   3,000   │  0.7%  │ Flat undertray, belly pan, diffuser strakes│
│ AERO_MOUNTING_POINTS │ 0 (empty) │  0.0%  │ 20+ empty transform hardpoints             │
├──────────────────────┼───────────┼────────┤                                            │
│ TOTAL                │ ~460,000  │ 100%   │                                            │
└──────────────────────┴───────────┴────────┴────────────────────────────────────────────┘
```

**Critical Rule**: No subsystem may be left at 0 triangles (except AERO_MOUNTING_POINTS which is empties-only). The minimum fill percentages are enforced by the validator.

---

## 4. PBR Material Matrix (18 Materials)

All materials use **Principled BSDF** with zero image textures. Realism comes entirely from tuned metallic/roughness/clearcoat physics.

| ## | Material | Base Color | Met | Rgh | Clearcoat | Extension |
| :--- | :--- | :--- | ---: | ---: | ---: | :--- |
| 01 | Paint_BodyColor_Metallic | (configurable) | 0.92 | 0.10 | 1.0 | KHR_materials_clearcoat |
| 02 | CarbonFiber_Twill_2x2 | (0.03, 0.03, 0.04) | 0.20 | 0.18 | 1.0 | KHR_materials_clearcoat |
| 03 | PolishedChrome | (0.92, 0.93, 0.95) | 0.98 | 0.08 | — | — |
| 04 | SatinDarkTrim | (0.06, 0.06, 0.07) | 0.40 | 0.45 | — | — |
| 05 | InteriorLeather_Nero | (0.04, 0.04, 0.04) | 0.05 | 0.78 | — | — |
| 06 | InteriorAlcantara | (0.08, 0.08, 0.09) | 0.02 | 0.92 | — | KHR_materials_sheen |
| 07 | Glass_Dielectric | (0.90, 0.95, 1.00) | 0.00 | 0.02 | 1.0 | KHR_materials_transmission + volume + ior |
| 08 | BrakeRotor_CarbonCeramic | (0.22, 0.23, 0.25) | 0.80 | 0.35 | — | KHR_materials_anisotropy |
| 09 | BremboCaliper_Rosso | (0.88, 0.03, 0.05) | 0.35 | 0.18 | 1.0 | KHR_materials_clearcoat |
| 10 | ForgedAlloy_DiamondCut | (0.88, 0.89, 0.92) | 0.98 | 0.16 | 1.0 | KHR_materials_clearcoat + anisotropy |
| 11 | TireRubber_SemiSlick | (0.03, 0.03, 0.03) | 0.00 | 0.88 | — | — |
| 12 | LED_White_Projector | (1.0, 1.0, 1.0) | 0.00 | 0.50 | — | emissive_strength=20 |
| 13 | LED_Red_OLED | (1.0, 0.02, 0.02) | 0.00 | 0.50 | — | emissive_strength=18 |
| 14 | TitaniumExhaust_Inconel | (0.65, 0.63, 0.60) | 0.96 | 0.22 | — | — |
| 15 | EngineBlock_CastAluminum | (0.78, 0.76, 0.74) | 0.85 | 0.32 | — | — |
| 16 | SuspensionArm_Forged | (0.15, 0.15, 0.16) | 0.90 | 0.40 | — | — |
| 17 | CoiloverSpring_Anodized | (0.02, 0.35, 0.80) | 0.70 | 0.25 | — | — |
| 18 | ApexBadge_Gold | (0.95, 0.78, 0.12) | 0.75 | 0.20 | 1.0 | KHR_materials_clearcoat |

### Required glTF Extensions
- `KHR_materials_clearcoat` — **Mandatory** (used on paint, carbon, alloy, caliper, badge)
- `KHR_materials_emissive_strength` — **Mandatory** (used on LED projectors and OLED tailbars)
- `KHR_materials_transmission` + `KHR_materials_ior` — **Mandatory** (dielectric glass, IOR 1.52)
- `KHR_materials_volume` — **Recommended** (dielectric absorption to prevent alpha sorting glitches)
- `KHR_materials_anisotropy` — **Recommended** (rotors and diamond-cut wheels)
- `KHR_materials_sheen` — **Recommended** (Alcantara cabin surfaces)

---

## 5. Mandatory Node Hierarchy Schema

```text
VEHICLE_ROOT (Empty)
├── AERO_MOUNTING_POINTS (Empty)
│   ├── FRONT_WHEEL_L / R          (Empty, world-positioned)
│   ├── REAR_WHEEL_L / R           (Empty, world-positioned)
│   ├── FRONT_SUSPENSION_L / R     (Empty)
│   ├── REAR_SUSPENSION_L / R      (Empty)
│   ├── ENGINE_MOUNT_MID           (Empty)
│   ├── TRANSMISSION_MOUNT         (Empty)
│   ├── EXHAUST_MOUNT              (Empty)
│   ├── FRONT_SPLITTER_MOUNT       (Empty)
│   ├── REAR_WING_MOUNT            (Empty)
│   ├── DIFFUSER_MOUNT             (Empty)
│   ├── SIDE_SKIRT_MOUNT_L / R     (Empty)
│   ├── RADIATOR_MOUNT_L / R       (Empty)
│   └── INTERCOOLER_MOUNT_L / R    (Empty)
├── BODY          (≥ 10 meshes: hood, doors, fenders, bumpers, mirrors, trim)
├── BRAKES        (≥ 5 meshes: 4 rotors + caliper assembly)
├── CABIN         (≥ 8 meshes: dashboard, seats, steering, console)
├── CHASSIS       (≥ 2 meshes: monocoque, subframes)
├── ENGINE_BAY    (≥ 3 meshes: block, intake, exhaust)
├── GLASS         (≥ 1 mesh: windshield/canopy)
├── LIGHTING      (≥ 3 meshes: headlamps, taillamps, DRL)
├── SUSPENSION    (≥ 4 meshes: wishbones, coilovers)
├── TIRES         (4 meshes: tire ×4)
├── UNDERBODY     (≥ 1 mesh: undertray)
└── WHEELS        (≥ 8 meshes: rims ×4, hubs, lug nuts)
```

---

## 6. Geometry Quality Pipeline

Every mesh object MUST pass through this quality pipeline during creation:

### Step 1: Vertex Welding & Normal Reset
```python
bpy.ops.mesh.remove_doubles(threshold=0.0005)  # 0.5mm weld threshold
mesh.split_normals_clear()                      # Clear frozen CAD split normals
```
Eliminates coincident duplicate vertices that cause crumpled/faceted reflections.

### Step 2: Shade Smooth by Angle
```python
# Blender 4.1+
mesh.shade_smooth_by_angle(math.radians(35))
# Blender 3.x/4.0 fallback
mesh.auto_smooth_angle = math.radians(35)
mesh.use_auto_smooth = True
```

### Step 3: Bevel Modifier (Soft CAD Edges)
```python
mod = obj.modifiers.new("Bevel", "BEVEL")
mod.width = 0.003          # 3mm bevel width
mod.segments = 2           # 2 subdivision segments
mod.limit_method = "ANGLE"
mod.angle_limit = math.radians(40)
mod.use_clamp_overlap = True
```

### Step 4: Weighted Normal Modifier
```python
mod = obj.modifiers.new("WeightedNormal", "WEIGHTED_NORMAL")
mod.keep_sharp = True
```
Prevents shading artifacts across panel seams and boolean cut edges.

### Step 5: UV Smart Projection
```python
bpy.ops.uv.smart_project(angle_limit=math.radians(66.0), island_margin=0.02)
```

---

## 7. Blender Template Script

A ready-to-fork Blender Python template is available at:

```
scripts/blender/generators/glb_15mb_vehicle_template.py
```

This 500+ line template provides:
- Phase 0: Safe scene reset (MCP-safe, no `read_factory_settings`)
- Phase 1: Complete 18-material PBR factory
- Phase 2: VEHICLE_ROOT hierarchy with 20+ hardpoints
- Phases 3–12: Overridable subsystem builder functions (one per subsystem)
- Phase 13: Global UV/quality pass
- Phase 14: Dual-mode GLB export with file size validation gate

**To use**: Fork the file, override the `build_*()` functions with actual bmesh geometry for your specific vehicle architecture.

---

## 8. GLB Quality Validator

A standalone validation script (no Blender required) scores any GLB against this standard:

```bash
# Standard assessment (shows score, breakdown, and grade)
python .agents/skills/glb-15mb-quality-standard/scripts/validate_glb_quality.py <path.glb>

# STRICT Grade A Gate (exits with code 1 if score < 90% or grade is not A)
python .agents/skills/glb-15mb-quality-standard/scripts/validate_glb_quality.py <path.glb> --strict-a
```

### Grading Scale & Production Gate

| Grade | Score % | Production Gate Status | Description |
| :--- | :--- | :--- | :--- |
| **A** | **≥ 90%** | **PASSED (Production Standard)** | All 11 subsystems filled, full PBR extensions (clearcoat + transmission + IOR), 13.5–16.5 MB. |
| **B** | ≥ 75% | **REJECTED** | High geometry but has empty subsystems or missing glass transmission (e.g. GT3 at 88.9%). |
| **C** | ≥ 60% | **REJECTED** | Under-weight, multiple empty subsystems, or poor material setup. |
| **D** | ≥ 40% | **REJECTED** | Substandard, major systems missing. |
| **F** | < 40% | **REJECTED** | Failing primitive / placeholder (e.g. 0.09 MB era cubes). |

---

## 9. Era Vehicle Upgrade & Recompilation Architecture

### Root Cause of Existing Era Vehicle Degradation
Forensic audit of `public/models/vehicles/{architecture}/{era}/vehicle.glb` revealed that 96% of files are **0.05–0.1 MB Grade F (8.9%)** primitives. This occurred because `batch_generate_all_vehicles.py` procedurally stamped out a single 6-sided cube (`bmesh.ops.create_cube`) with Subsurf level 1 (~48 triangles) with no interior, chassis, or running gear.

### The 4-Pillar Upgrade Pipeline

```text
 matrix_manifest.json (Design DNA)
               │
               ▼
 ┌────────────────────────────────────────────────────────┐
 │ 1. Parametric Exterior Shaping                         │
 │    - Reads wheelbase, track width, overhangs, hood     │
 │    - Generates 12-section lofted quad control cage     │
 └────────────────────────────────────────────────────────┘
               │
               ▼
 ┌────────────────────────────────────────────────────────┐
 │ 2. The 3-Modifier Amplification Pipeline               │
 │    - Subsurf Level 2–3 (1,000 quads → 64,000+ faces)   │
 │    - Angle-Limited Bevel 3.0mm (Eliminates CG edges)   │
 │    - Weighted Normal keep_sharp (Mirror reflections)   │
 └────────────────────────────────────────────────────────┘
               │
               ▼
 ┌────────────────────────────────────────────────────────┐
 │ 3. Modular Subsystem Library Injection (~310k Tris)     │
 │    - Snaps era-appropriate assemblies:                 │
 │      * 70s–80s Classic Pack: Analog cluster, MacPherson│
 │      * 90s–00s Analog Pack: Cowl gauges, double wish   │
 │      * 10s–20s Modern Pack: Dual-screen, ceramic pushrod│
 └────────────────────────────────────────────────────────┘
               │
               ▼
 ┌────────────────────────────────────────────────────────┐
 │ 4. Automated Grade A Quality Gate                      │
 │    python validate_glb_quality.py <out.glb> --strict-a │
 │    (Rejects export if Grade != A or size < 13.5 MB)    │
 └────────────────────────────────────────────────────────┘
```

### Era Modular Subsystem Packs

To scale across all 168 cells in `matrix_manifest.json` without modeling from scratch:

| Subsystem Assembly | 1970s–1980s Classic Pack | 1990s–2000s Analog Pack | 2010s–2020s Modern Pack | Target Tris |
|---|---|---|---|---|
| **CABIN** | Analog gauges, thin 3-spoke wheel, low-back leather buckets | Deep cowl cluster, airbag wheel, bolster sport seats | Dual panoramic screens, paddle shifters, carbon buckets | **~140k tris** |
| **WHEELS & TIRES** | 14–15" deep-dish BBS/Campagnolo + grooved rubber | 17–18" 5-spoke alloys + directional summer tread sipes | 19–21" center-lock forged + Michelin 3D siping | **~70k tris** |
| **BRAKES** | Solid/vented steel rotors + single-piston cast calipers | Slotted steel discs + 4-piston Brembo calipers | Cross-drilled carbon ceramics + 6-piston monoblocs | **~35k tris** |
| **POWERTRAIN** | Longitudinal inline-4 / V8 with carburetors & trumpets | DOHC twin-turbo V6/V8 with carbon plenum cover | Hybrid / Twin-turbo V8 with heat-shielded turbos | **~35k tris** |
| **SUSPENSION** | Front MacPherson struts + rear trailing arms & coils | Double wishbone front + rear multi-link subframe | Pushrod coilovers + remote damper reservoirs | **~30k tris** |

---

---

## 10. Multi-Angle Reference-Comparison & Iterative Perfection Protocol

> [!IMPORTANT]
> **NEVER EXPORT OR FINALIZE A 3D ASSET BLIND**:
> Generating a high-fidelity CAD mesh requires systematic, multi-perspective visual inspection against reference design DNA, blueprints, and photographic benchmarks. You must compare, critique, and iterate in Blender **again and again until perfection is reached**.

### 10.1 Programmatic Studio Camera Framing
Configure the active viewport in Blender via MCP to eliminate all UI distractions (`space.overlay.show_overlays = False`) and set material shading (`space.shading.type = 'MATERIAL'`). Capture 5 standardized automotive angles plus cockpit/macro views:

```python
import bpy, math
from mathutils import Euler, Vector

def set_automotive_viewport(pitch_deg, roll_deg, yaw_deg, distance=5.5, location=(0.0, 0.0, 0.65)):
    for area in bpy.context.screen.areas:
        if area.type == 'VIEW_3D':
            for space in area.spaces:
                if space.type == 'VIEW_3D':
                    r3d = space.region_3d
                    r3d.view_perspective = 'PERSP'
                    r3d.view_distance = distance
                    r3d.view_location = Vector(location)
                    r3d.view_rotation = Euler((
                        math.radians(pitch_deg),
                        math.radians(roll_deg),
                        math.radians(yaw_deg)
                    )).to_quaternion()
                    space.overlay.show_overlays = False
                    space.shading.type = 'MATERIAL'
                    if hasattr(r3d, "update"):
                        r3d.update()
                    return

# Standard Validation Cameras:
# 1. Front 3/4 Hero View: set_automotive_viewport(70, 0, 225, distance=5.5)
# 2. Rear 3/4 Hero View:  set_automotive_viewport(72, 0, 45,  distance=5.5)
# 3. True Side Elevation: set_automotive_viewport(88, 0, 270, distance=6.2)
# 4. Front Elevation:     set_automotive_viewport(88, 0, 180, distance=5.0)
# 5. Rear Elevation:      set_automotive_viewport(88, 0, 0,   distance=5.0)
# 6. Cockpit Macro View:  set_automotive_viewport(65, 0, 200, distance=2.2, location=(0.35, 0.2, 0.6))
```

### 10.2 Systematic Reference Comparison Matrix
For each viewport angle, take a screenshot via `get_viewport_screenshot` and compare against the vehicle's `referenceVehicle` or `designDNA` in `matrix_manifest.json`:

| Validation Criterion | Reference Target | Defect Symptom | In-Place Blender Rework Action |
| :--- | :--- | :--- | :--- |
| **Silhouette & Proportions** | Exact match to wheelbase, cowl height, overhangs, and roof rake | Stretched cabin, nose too blunt, disproportionate decklid | Scale control cage edge loops along Y/Z axes; adjust hood slope in bmesh |
| **Stance & Fitment** | Aggressive track width, flush wheel-to-fender fitment, tight tire gap | Wheels tucked too far inside or sunken into wheel wells | Offset wheel/hub empties on X-axis; adjust suspension ride height hardpoints |
| **Surfacing & Reflections** | Curvature continuity (G2); smooth specular highlight flow | Faceted polygons, pinched normals, wavy reflections | Weld vertices (`remove_doubles`), clear split normals, apply `WeightedNormal` |
| **Daylight Opening (DLO)** | Thin aerodynamic pillars, correct tumblehome taper, optical glass | Milky opaque windows, missing interior visibility | Apply `KHR_materials_transmission` + `ior=1.52`, decrease glass roughness to 0.02 |
| **Lighting Optics** | Multi-part internal projectors, light-pipes, amber turn lenses | Flat solid emissive colored rectangles | Split into dark reflector housing + quartz projector sphere + outer polycarbonate cover |
| **Shutlines & Seams** | Uniform 2.5mm–3.5mm gaps between hood, doors, and bumpers | Fused monolithic blob look, no panel separation | Extrude inner flanges with Solidify modifier; add negative panel gap clearances |
| **Exterior Jewelry** | Polished exhaust tips with dark inner bore, badges, aero strakes | Floating blocks, solid cylinder exhaust tips | Extrude hollow cylinders for exhaust tips; assign titanium material with dark bore |

### 10.3 The Iterative Perfection Rework Loop
```text
  ┌────────────────────────────────────────────────────────┐
  │ 1. Frame Viewport to Validation Angle (e.g. Front 3/4) │
  └──────────────────────────┬─────────────────────────────┘
                             │
  ┌──────────────────────────▼─────────────────────────────┐
  │ 2. Capture Screenshot via get_viewport_screenshot      │
  └──────────────────────────┬─────────────────────────────┘
                             │
  ┌──────────────────────────▼─────────────────────────────┐
  │ 3. Visually Compare Against Reference DNA & Blueprint  │
  └──────────────────────────┬─────────────────────────────┘
                             │
           Is Visual Perfection Reached?
               ├── NO ──> [ Execute Targeted In-Place Rework ]
               │            - Tweak bmesh vertices
               │            - Refine bevel segments & FWN
               │            - Calibrate PBR shader values
               │            - Return to Step 1 & Re-Screenshot
               │
               └── YES ─> [ Repeat for Remaining 4+ Angles ]
                            - Once all angles pass, proceed to export
```

---

## 11. Post-Generation Wiring & Synchronization Protocol

> [!IMPORTANT]
> **GENERATION IS NOT COMPLETE UNTIL THE ASSET IS WIRED**:
> Exporting a GLB file to a temporary location does not fulfill the production contract. The agent **MUST wire every generated GLB directly into its canonical application path**, synchronize database manifests, and verify frontend compilation and test suites.

### 11.1 Canonical File Placement Directory Map

Every asset must be moved/saved directly to its designated location:

| Asset Type | Canonical Project Destination | Secondary / Backup Export |
| :--- | :--- | :--- |
| **Era Matrix Vehicle** | `public/models/vehicles/{architecture}/{era}/vehicle.glb` | `exports/vehicles/{architecture}_{era}.glb` |
| **Master Flagship Car** | `public/models/Car_{Name}_Complete.glb` | `exports/Car_{Name}_Complete.glb` |
| **Zero-Offset Modular Parts** | `public/models/modular_parts/{part_name}.glb` | `exports/parts/{part_name}.glb` |

### 11.2 Manifest Synchronization (`public/models/vehicles/matrix_manifest.json`)
For any era matrix vehicle generated or upgraded, update its cell entry in `public/models/vehicles/matrix_manifest.json`:

```json
{
  "architecture": "sedan",
  "era": "1970s",
  "referenceVehicle": "BMW 2002 Turbo (E10)",
  "inspirationOnly": true,
  "glb": "/models/vehicles/sedan/1970s/vehicle.glb",
  "status": "COMPLETE",
  "fileSizeMb": 15.18,
  "triangleCount": 458240,
  "grade": "A",
  "scorePercent": 94.8,
  "lastVerified": "2026-09-18T12:00:00.000Z",
  "designDNA": { ... }
}
```

### 11.3 Application Store & Matrix Verification
Verify that the application's runtime vehicle registry can load the newly placed asset:
1. Confirm `src/sim/vehicleArchitecture/vehicleArchitectureMatrix.ts` references the exact `glbPath` (`/models/vehicles/{arch}/{era}/vehicle.glb`).
2. Verify `src/state/useVehicleArchitectureStore.ts` detects `isGlbAvailable = true` when resolving the asset.
3. If modular parts were exported, confirm that `src/state/modularVehicleBuilderStore.ts` references the corresponding `glbFilename`.

### 11.4 Automated CI Gates & Verification Sequence
Always execute this 3-step verification sequence after wiring any asset:

```bash
# Step 1: Enforce Strict Grade A Quality Standard
python .agents/skills/glb-15mb-quality-standard/scripts/validate_glb_quality.py public/models/vehicles/{architecture}/{era}/vehicle.glb --strict-a

# Step 2: Verify TypeScript Compilation (Zero Type Errors)
npx tsc --noEmit -p tsconfig.app.json

# Step 3: Run Full Modular Vehicle Simulation Test Suite
npx tsx src/sim/modularVehicle/runTests.ts
```

All three checks must pass with exit code 0 before marking the task complete.

---

## 12. Anti-Patterns (What NOT To Do)

| Anti-Pattern | Why It Fails | Correct Approach |
| :--- | :--- | :--- |
| **Accepting Grade B as "good enough"** | Leaves Engine, Chassis, or Suspension at 0 triangles (~12 MB) | **Mandatory Grade A**: Populate all 11 subsystems to reach 15 MB |
| **Creating 3D models using Three.js / procedural code primitives** | Produces < 15k triangles, looks like cardboard origami | **Always use Blender**: Model via bmesh with subdivision and FWN |
| **Exporting blind without reference screenshot comparison** | Misses proportion errors, stance tuck, faceted seams, or milky glass | Frame 5 angles, capture screenshots, compare against reference, iterate |
| **Leaving generated GLBs in scratch folders** | Asset remains invisible to simulator, store, and user | Wire immediately into `public/models/` and sync `matrix_manifest.json` |
| **Creating single scaled cubes with Subsurf 1** | Results in 0.09 MB Grade F placeholder boxes | Build multi-section lofted control cages with real openings |
| **Baking lighting into PNG texture maps** | Blurry at close zoom, inflates file size with image data | Use pure PBR metallic/roughness/clearcoat physics |
| **One single mesh for entire car body + glass + lights** | Broken transparent depth sorting, can't animate parts | Separate meshes per functional part and material |
| **Flat emissive blocks for headlights** | Looks like glowing rectangles | Multi-part housings: dark shell + projector core + DRL brow + outer lens |
| **Missing dielectric glass transmission** | Windows look like flat tinted plastic | Use `KHR_materials_transmission` + `KHR_materials_ior` (IOR 1.52) |
| **Skipping vertex welding** | Crumpled tin-foil reflections from split vertices | `remove_doubles(threshold=0.0005)` on every mesh |
| **Using `read_factory_settings()` in MCP scripts** | Kills the MCP socket listener | Use safe scene clearing loop |

---

## 13. Reference Material & Tools

- **Asset Wiring Script**: `scripts/wire_vehicle_asset.py` — Automated Grade A validation, canonical file movement, and matrix manifest synchronization
- **Grade A Production Playbook**: `examples/grade_a_production_playbook.md` — Internet case studies, Khronos 2.0 specifications & step-by-step construction recipe
- **GT3 Forensic Report**: `examples/gt3_forensic_report.md` — Complete byte-level analysis of the reference asset
- **Existing Skills**: `procedural-automotive-blender-mcp`, `blender-visual-feedback-loop`
- **Matrix Manifest**: `public/models/vehicles/matrix_manifest.json` — 168-cell architectural styling DNA
- **Reference Scripts**: `scripts/blender/generators/generate_flagship_supercar.py`, `scripts/blender/generators/glb_15mb_vehicle_template.py`

