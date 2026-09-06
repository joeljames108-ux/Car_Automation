---
name: procedural-automotive-blender-mcp
description: Operational standard, structural schema, procedural topology generator, PBR automotive shading, and dual-mode GLB export pipeline for Blender 4.x+ via Model Context Protocol (MCP).
---

# Procedural Automotive Blender MCP Pipeline Standard

This skill establishes the role, architectural schema, procedural topology modeling, PBR material creation, and dual-mode GLB serialization pipeline for automotive vehicles in Blender 4.x+ and 5.x via the Model Context Protocol (MCP).

---

## 1. Master Agent Directive & Execution Parameters

- **Role**: Lead Automotive 3D Technical Artist & Systems Engineer
- **Tool**: Blender 4.x+ / 5.x via Model Context Protocol (MCP) / Python API (`bpy`)
- **Task**: Procedurally generate modular automotive components, assign physical PBR automotive shaders, generate production UVs, and export both individual component GLBs and a unified assembled vehicle GLB.

### Execution Parameters
1. **World Dimensions (Executive Sedan Example)**:
   - Length: ~4.85 m
   - Width: ~1.88 m (excluding mirrors)
   - Height: ~1.44 m
   - Wheelbase: ~2.88 m
2. **Coordinate Standard**:
   - Y-Forward (Vehicle front faces `+Y`)
   - Z-Up (Vertical axis is `+Z`)
   - X-Lateral (In LHD: Driver side is `+X`, Passenger side is `-X`)
3. **Transform Integrity**:
   - All modular subcomponents MUST retain their relative World Transformation matrix.
   - When imported into Three.js or Unreal Engine at coordinates `(0, 0, 0)`, every part must snap into its designated position without manual realignment or translation offsets.
4. **Topology Standard**:
   - Continuous quad-dominant topology
   - Auto-smoothed normals (35° threshold)
   - Solidify modifiers to give body panels real sheet-metal gauge thickness (1.5mm–2.0mm; 4.0mm for safety glass)
   - Weighted Normal modifiers (`keep_sharp=True`) to eliminate shading artifacts across panel seams
   - UV Smart Projection unwrapping (`angle_limit=66.0, island_margin=0.02`)
5. **Export Specification**:
   - Individual parts: `//exports/parts/<ObjectName>.glb` (with `export_apply=False` to preserve transforms)
   - Assembled vehicle: `//exports/Car_Sedan_Complete.glb` (with `export_apply=True` to bake evaluated modifiers)
   - Format: GLB binary (glTF 2.0), Y-Up conversion (`export_yup=True`), embedded PBR materials, active UV coordinates.

---

## 2. PBR Automotive Shading Matrix

```text
┌─────────────────────────┬──────────────────────┬───────────┬──────────┬──────────────┬───────┬──────────────────────────────┐
│ Material Name           │ Base Color           │ Roughness │ Metallic │ Transmission │ Alpha │ Emission                     │
├─────────────────────────┼──────────────────────┼───────────┼──────────┼──────────────┼───────┼──────────────────────────────┤
│ Mat_DeepBlue_Paint      │ (0.015, 0.045, 0.12) │ 0.18      │ 0.92     │ 0.00         │ 1.00  │ —                            │
│ Mat_SatinTrim           │ (0.020, 0.020, 0.02) │ 0.60      │ 0.20     │ 0.00         │ 1.00  │ —                            │
│ Mat_ChromeAccents       │ (0.950, 0.950, 0.95) │ 0.08      │ 1.00     │ 0.00         │ 1.00  │ —                            │
│ Mat_TintedGlass         │ (0.050, 0.080, 0.10) │ 0.02      │ 0.10     │ 0.92         │ 0.30  │ —                            │
│ Mat_PolycarbonateLens   │ (0.950, 0.950, 0.98) │ 0.05      │ 0.05     │ 0.96         │ 0.25  │ —                            │
│ Mat_LED_White           │ (1.000, 1.000, 1.00) │ 0.10      │ 0.00     │ 0.00         │ 1.00  │ White, Strength = 15.0       │
│ Mat_LED_Red             │ (1.000, 0.020, 0.02) │ 0.10      │ 0.00     │ 0.00         │ 1.00  │ Red, Strength = 12.0         │
│ Mat_DiamondCutAlloy     │ (0.850, 0.850, 0.87) │ 0.22      │ 0.98     │ 0.00         │ 1.00  │ —                            │
│ Mat_CastIronBrakes      │ (0.500, 0.500, 0.50) │ 0.35      │ 0.80     │ 0.00         │ 1.00  │ —                            │
│ Mat_TireRubber          │ (0.030, 0.030, 0.03) │ 0.88      │ 0.00     │ 0.00         │ 1.00  │ —                            │
└─────────────────────────┴──────────────────────┴───────────┴──────────┴──────────────┴───────┴──────────────────────────────┘
```

---

## 3. Five-Phase Phased Prompting Sequence

When issuing incremental commands to the Blender MCP server:

### Phase 1: Environment & Materials
```text
Initialize a clean metric scene in Blender via MCP. Set up a PBR material dictionary containing: deep blue metallic body paint (92% metallic, 18% roughness), automotive glass (92% transmission, 30% alpha), satin carbon trim, chrome, cast iron brake metal, rubber, and high-intensity LED emissive materials.
```

### Phase 2: Core Body Shell Construction
```text
Procedurally model the hood, roof, rear backlight, windshield, and front/rear quarter panels matching a 4.85m executive sedan profile. Add automatic smart UV projection, a Mirror modifier on the X-axis, and a Solidify modifier with a thickness of 2mm. Assign Mat_DeepBlue_Paint to the panels and Mat_TintedGlass to the greenhouse components.
```

### Phase 3: Aerodynamics, Lighting & Trim
```text
Generate the front bumper fascia with lower air dam openings, the rear bumper with dual exhaust cutouts, and side mirror caps. Construct front headlight housings with embedded emissive daytime running lights (Mat_LED_White) beneath a polycarbonate transparent lens. Build taillights with red emissive striping.
```

### Phase 4: Running Gear & Corners
```text
Place 4 wheel assemblies at the suspension stations (+/-0.84m, +/-1.44m, 0.35m). Each assembly must contain an outer rubber tire (radius 0.34m), an alloy rim (radius 0.26m), and an inner cast iron brake disc. Ensure each component retains its precise world matrix.
```

### Phase 5: Dual-Mode GLB Serialization
```text
Run an export batch: Iterate through every mesh in the scene, saving each individual part as a .glb in //exports/parts/[ObjectName].glb without zeroing its coordinate space. Once all individual parts are written, select all objects and export the final unified model to //exports/Car_Sedan_Complete.glb with export_apply=True.
```

---

## 4. MCP Runtime Execution Safety Guidelines

1. **Avoid `bpy.ops.wm.read_factory_settings(use_empty=True)`**:
   - Calling factory reset in Blender closes the active addon socket listener for the MCP server.
   - Use safe non-destructive scene cleaning:
     ```python
     for obj in list(bpy.context.scene.collection.objects):
         bpy.data.objects.remove(obj, do_unlink=True)
     for col in list(bpy.context.scene.collection.children):
         bpy.data.collections.remove(col)
     for block in [bpy.data.meshes, bpy.data.materials, bpy.data.curves]:
         for item in list(block):
             if item.users == 0:
                 block.remove(item)
     ```

2. **Absolute Export Paths**:
   - When running against an unsaved `.blend` file (`bpy.data.is_saved == False`), `bpy.path.abspath("//exports")` does not resolve to the project root.
   - Always resolve paths against the workspace project directory:
     ```python
     PROJECT_DIR = r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project"
     base_dir = os.path.join(PROJECT_DIR, "exports")
     parts_dir = os.path.join(base_dir, "parts")
     ```

3. **Blender 4.1+ / 5.x Auto-Smooth API**:
   - In Blender 4.1+, `mesh.auto_smooth_angle` is no longer a direct mesh property.
   - Wrap safely:
     ```python
     if hasattr(mesh, "auto_smooth_angle"):
         mesh.auto_smooth_angle = math.radians(35.0)
     ```
