---
name: blender-visual-feedback-loop
description: Standard operating procedure for autonomous visual feedback, viewport framing, iterative screenshot assessment, geometry welding, PBR shading, and GLB export in Blender 4.x/5.x via MCP.
---

# Autonomous Blender Visual Feedback Loop & Quality Assessment Standard

This skill codifies the **autonomous visual iteration protocol** for 3D automotive modeling and asset refinement in Blender 4.x/5.x via Model Context Protocol (MCP). 

---

## 1. Master Operational Directive

**Never edit 3D assets blind.** 
Whenever working on 3D vehicle models, bodies, aerodynamic kits, chassis, or interior cockpits:
1. **Import & Inspect**: Load the existing geometry safely without resetting factory settings.
2. **Autonomous Viewport Framing**: Programmatically orient the 3D viewport to standard automotive angles.
3. **Capture Baseline Screenshots**: Take initial reference captures via `get_viewport_screenshot`.
4. **Visual Self-Critique**: Inspect the images to identify faceted body panels, pinched crease lines, missing optics, milky glass, or flat lighting.
5. **Targeted In-Place Refinement**: Apply geometry welding, normal re-smoothing, edge beveling, and PBR shader upgrades directly on the existing mesh hierarchy.
6. **Iterative Re-Screenshotting**: Capture fresh screenshots after each modification pass to visually verify the upgrade before proceeding.
7. **Dual-Mode Serialization**: Export both unified complete vehicles and zero-offset individual components.
8. **Automated Verification**: Ensure clean TypeScript builds and passing test suites.

```
┌─────────────────┐     ┌──────────────────────┐     ┌──────────────────────┐
│  Import Meshes  │ ──> │ Viewport Programmatic│ ──> │ Capture Baseline     │
│  (MCP Safe)     │     │ Camera Framing       │     │ Screenshots (5 Views)│
└─────────────────┘     └──────────────────────┘     └──────────┬───────────┘
                                                                │
┌─────────────────┐     ┌──────────────────────┐     ┌──────────▼───────────┐
│ Re-Screenshot & │ <── │ Targeted In-Place    │ <── │ Visual Assessment &  │
│ Verify Visuals  │     │ Mesh/PBR Polish      │     │ Defect Diagnosis     │
└────────┬────────┘     └──────────────────────┘     └──────────────────────┘
         │
┌────────▼────────┐     ┌──────────────────────┐
│ Dual-Mode GLB   │ ──> │ Quality Gates:       │
│ Serialization   │     │ tsc & 515 Unit Tests │
└─────────────────┘     └──────────────────────┘
```

---

## 2. Safe Scene Initialization (Zero Socket Disconnect)

Never invoke `bpy.ops.wm.read_factory_settings(use_empty=True)` inside Blender MCP, as it terminates the addon's background TCP socket listener. Always use safe non-destructive clearing:

```python
import bpy

# Safe clearing preserving MCP socket listener
for o in list(bpy.data.objects):
    bpy.data.objects.remove(o, do_unlink=True)
for c in list(bpy.data.collections):
    bpy.data.collections.remove(c)
for block in [bpy.data.meshes, bpy.data.materials, bpy.data.curves, bpy.data.lights, bpy.data.cameras]:
    for item in list(block):
        if item.users == 0:
            block.remove(item)

# Always use absolute raw Windows paths for imports
import_path = r"E:\Car_Automation\public\models\Car_Sedan_Complete.glb"
bpy.ops.import_scene.gltf(filepath=import_path)
```

---

## 3. Programmatic Viewport Camera Framing

`get_viewport_screenshot` in Blender MCP reads directly from the active 3D Viewport `region_3d.view_matrix`. To achieve full-frame, studio-quality captures from any angle without UI overlays:

```python
import bpy, math
from mathutils import Euler, Vector

def set_viewport_view(pitch_deg, roll_deg, yaw_deg, distance=5.5, location=(0.0, 0.0, 0.65)):
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
                    
                    # Clean studio presentation
                    space.overlay.show_overlays = False
                    space.shading.type = 'MATERIAL'
                    if hasattr(r3d, "update"):
                        r3d.update()
                    break

# Five Master Automotive Validation Angles:
# 1. Front 3/4 (Dynamic Hero View)
set_viewport_view(pitch_deg=70, roll_deg=0, yaw_deg=225, distance=5.5)

# 2. Rear 3/4 (Stance, Haunches, Exhaust & Taillights)
set_viewport_view(pitch_deg=70, roll_deg=0, yaw_deg=45, distance=5.5)

# 3. Side Profile (Proportions, Beltline, Wheel Fitment)
set_viewport_view(pitch_deg=85, roll_deg=0, yaw_deg=270, distance=5.6)

# 4. Front Fascia (Grille, Splitter, Headlamp Eyes)
set_viewport_view(pitch_deg=85, roll_deg=0, yaw_deg=180, distance=4.5, location=(0.0, 1.8, 0.65))

# 5. Rear Fascia (Diffuser, OLED Ruby Lightbars, Trunk Emblem)
set_viewport_view(pitch_deg=85, roll_deg=0, yaw_deg=0, distance=4.5, location=(0.0, -1.8, 0.65))
```

---

## 4. Visual Defect Diagnosis & Solution Guide

| Visual Symptom | Root Cause | Mandatory Fix |
|---|---|---|
| **Crumpled / Faceted body reflections** | Disconnected quad patches with coincident duplicate vertices (~75%+ duplicates). | `bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.001)` + `bpy.ops.mesh.customdata_custom_splitnormals_clear()`. |
| **Razor-sharp pinched center crease** | Seam vertices on symmetry plane unmerged or offset by ~3–4mm. | `remove_doubles(dist=0.004)` + `smooth_vert(verts=center_verts, factor=0.45)`. Enforce `v.co.x = 0.0`. |
| **Sharp blocky CAD corners on bumpers/diffusers** | Unbeveled 90° edges without normal bias. | Add `Bevel` modifier (`width=0.003–0.004m`, `segments=2–3`, `angle_limit=35°`) + `WeightedNormal` (`keep_sharp=True`). |
| **Headlights as solid white blobs** | Single material slot with pure white emission assigned to whole housing. | Split mesh into separate islands: Slot 0 = dark housing (`Mat_Trim_Piano_Gloss_Black`), Slot 1 = projector LED cores, Slot 2 = DRL brow (`Mat_DRL_Ice_Blue`), Slot 3 = clear outer lens cover (`Mat_PolycarbonateLens`). |
| **Taillights as pale washed-out bars** | Low-saturation pink emission without optical acrylic cover. | Slot 0 = ruby OLED emission `(1.0, 0.015, 0.02)` strength 18.0, Slot 1 = dark housing border, Slot 2 = smoked ruby acrylic outer cover lens (`transmission=0.88`, `alpha=0.45`). |
| **Greenhouse as milky gray holes** | Standard alpha blend without dielectric physical transmission. | Principled BSDF with `Transmission Weight=0.94`, `IOR=1.52`, `Roughness=0.02`, `Coat Weight=1.0`, `Coat Roughness=0.01`, subtle solar tint. |
| **Exhaust tips look like dull plastic** | Assigned matte carbon or chassis gray. | Upgrade barrels to `Mat_Inconel_Exhaust` (`metallic=0.98`, `roughness=0.06`, `coat=1.0`) with dark recessed inner bores (`Mat_Trim_Piano_Gloss_Black`). |
| **Missing jewelry & door lines** | Flat door sheets with no handles or beltline. | Add flush door handles parented to door meshes (`GEO_Door_Front_Left/Right`, `GEO_Door_Rear_Left/Right`) and chrome window sill beltline moldings. |

---

## 5. Master Automotive PBR Material Setup (Blender 4.x / 5.x)

Blender 4.x and 5.x use the unified **Principled BSDF v2** shader. Configure sockets programmatically:

```python
def set_pbr_socket(bsdf, names, value):
    for n in names:
        if n in bsdf.inputs:
            bsdf.inputs[n].default_value = value
            return True
    return False

# Paint: Midnight Sapphire High-Gloss Metallic
set_pbr_socket(bsdf, ['Base Color'], (0.012, 0.038, 0.115, 1.0))
set_pbr_socket(bsdf, ['Metallic'], 0.88)
set_pbr_socket(bsdf, ['Roughness'], 0.18) # Prevents crumpled tin-foil reflections
set_pbr_socket(bsdf, ['Coat Weight', 'Clearcoat'], 1.0)
set_pbr_socket(bsdf, ['Coat Roughness', 'Clearcoat Roughness'], 0.025)

# Glass: Dielectric Automotive Optical Transmission
set_pbr_socket(bsdf, ['Base Color'], (0.04, 0.07, 0.10, 1.0))
set_pbr_socket(bsdf, ['Roughness'], 0.02)
set_pbr_socket(bsdf, ['Transmission Weight', 'Transmission'], 0.94)
set_pbr_socket(bsdf, ['IOR'], 1.52)
set_pbr_socket(bsdf, ['Coat Weight', 'Clearcoat'], 1.0)
set_pbr_socket(bsdf, ['Alpha'], 0.25)
mat.blend_method = 'BLEND'

# OLED Ruby Taillight:
set_pbr_socket(bsdf, ['Base Color'], (0.85, 0.01, 0.02, 1.0))
set_pbr_socket(bsdf, ['Roughness'], 0.06)
set_pbr_socket(bsdf, ['Emission Color', 'Emission'], (1.0, 0.015, 0.02, 1.0))
set_pbr_socket(bsdf, ['Emission Strength'], 18.0)
```

---

## 6. Dual-Mode GLB Export & Testing Protocol

Always serialize both the complete vehicle and individual components, preserving zero-offset relative world coordinates:

```python
import bpy, os

PROJECT_DIR = r"E:\Car_Automation"

# 1. Complete Assembled Vehicle (Select MESH only, apply modifiers)
bpy.ops.object.select_all(action='DESELECT')
for o in [obj for obj in bpy.data.objects if obj.type == 'MESH']:
    o.select_set(True)
bpy.context.view_layer.objects.active = [obj for obj in bpy.data.objects if obj.type == 'MESH'][0]

for target in [
    os.path.join(PROJECT_DIR, "public", "models", "Car_Sedan_Complete.glb"),
    os.path.join(PROJECT_DIR, "exports", "Car_Sedan_Complete.glb"),
    os.path.join(PROJECT_DIR, "public", "models", "Car_Complete.glb")
]:
    bpy.ops.export_scene.gltf(
        filepath=target,
        use_selection=True,
        export_format='GLB',
        export_apply=True,
        export_yup=True,
        export_materials='EXPORT'
    )

# 2. Individual Zero-Offset Components
# Export each exterior part (and child accessories) to public/models/modular_parts/individual/<name>.glb
# and exports/parts/GEO_<Name>.glb with use_selection=True.
```

### Quality Gate Commands
```bash
# 1. Verify TypeScript compiles without errors
npx tsc --noEmit -p tsconfig.app.json

# 2. Verify all 515 simulation unit tests pass
npx tsx src/sim/modularVehicle/runTests.ts

# 3. Verify HTTP endpoint serves newly exported GLB
curl -I http://localhost:5173/models/Car_Sedan_Complete.glb
```
