---
name: skill-for-powertrain-and-engine-bay
description: Automotive powertrain and engine bay engineering skill. Formulates Class-A CAD procedural modeling, 35k-45k triangle budget, Hot-V and flat-plane V8/V10/V12 architectures, equal-length exhaust headers into central valley turbos, carbon fiber intake plenums, individual throttle bodies (ITBs), thermal shielding, removable engine appearance cover action, vibrating idle morph key, raycast hitboxes, PBR cast aluminum/Inconel shaders, and zero-offset GLB export.
---

# Skill for Powertrain & Engine Bay: High-Performance Engine CAD & 40k Triangle Standard

This skill establishes the **quantitative engineering standard, mechanical packaging rules, thermodynamic heat shielding layout, and procedural Blender CAD pipeline** for designing high-performance internal combustion engines (ICE), twin-turbo systems, hybrid transaxles, and engine bay enclosures. Every powertrain generated must strictly comply with the **15MB / 400,000+ Triangle Vehicle Standard** (allocating **35,000 – 45,000 triangles** to the engine bay subsystem) and provide removable engine covers, vibrating idle morph targets, and raycast hitboxes.

---

## 1. Master Coordinate System & Mounting Alignment

The engine bay assembly is anchored to the vehicle chassis powertrain hardpoints:

| Powertrain Layout | Longitudinal ($Y$) Center | Lateral ($X$) | Vertical ($Z$) Center | Snapping Hardpoint |
|:---|:---|:---|:---|:---|
| **Mid-Engine Supercar (Rear-Mid)** | $Y \in [-1.150\text{m}, -0.150\text{m}]$ | Centered at $X = 0.0$ | $Z \in [0.180\text{m}, 0.680\text{m}]$ | `ENGINE_MOUNT_MID` |
| **Front-Engine Longitudinal (FR/GT)**| $Y \in [+0.520\text{m}, +1.520\text{m}]$ | Centered at $X = 0.0$ | $Z \in [0.220\text{m}, 0.720\text{m}]$ | `ENGINE_MOUNT_FRONT` |
| **Transaxle & Dual-Clutch Gearbox**  | $Y \in [-1.680\text{m}, -1.150\text{m}]$ | Centered at $X = 0.0$ | $Z \in [0.200\text{m}, 0.480\text{m}]$ | `TRANSMISSION_MOUNT` |

---

## 2. Quantitative Triangle & Mesh Budget (Engine Bay Subsystem)

Under the **15MB / 400,000+ Triangle Standard**, the engine bay accounts for **35,000 – 45,000 triangles**:

```text
┌───────────────────────────────────────────────────────────┬──────────────┬────────────┐
│ Engine Bay Component Mesh                                 │ Triangles    │ % of Total │
├───────────────────────────────────────────────────────────┼──────────────┼────────────┤
│ Engine Cylinder Block, Sump & Camshaft Covers (V8/V10)    │ 12,000       │ 30.0%      │
│ Twin Carbon Fiber Intake Plenums & Aluminum Velocity Horns│  8,000       │ 20.0%      │
│ Twin-Turbo Hot-V Center Valley Turbos & Wastegates        │  6,000       │ 15.0%      │
│ Equal-Length Tuned Exhaust Headers & Inconel Heat Shields │  6,000       │ 15.0%      │
│ Removable Carbon Fiber Engine Appearance Cover & Badging  │  4,000       │ 10.0%      │
│ Fluid Reservoirs, High-Pressure Fuel Rails & Strut Braces │  4,000       │ 10.0%      │
├───────────────────────────────────────────────────────────┼──────────────┼────────────┤
│ TOTAL (POWERTRAIN & ENGINE BAY SUBSYSTEM)                 │ ~40,000 tris │ 100%       │
└───────────────────────────────────────────────────────────┴──────────────┴────────────┘
```

> [!CAUTION]
> **ZERO EMPTY SUBSYSTEM LAW**:
> Under the strict 15MB Grade A standard, leaving the engine bay with 0 triangles (as was done on the legacy GT3 model) causes immediate production gate rejection. The engine bay must be fully populated with visible mechanical depth.

---

## 3. Engineering Architecture & Packaging Guidelines

### A. The "Hot-V" Twin-Turbo Packaging Advantage
- In modern high-performance architectures (Ferrari 296, McLaren 750S, Porsche 911 GT2 RS, AMG 4.0L), exhaust ports exit **inward into the center V-valley** ($90^\circ$ or $120^\circ$ bank angle).
- **Extremely Short Exhaust Run:** Exhaust headers travel only $120\text{mm} – 160\text{mm}$ directly into the twin mirror-symmetrical turbocharger turbine housings, nearly eliminating turbo lag.
- **Outboard Intake Feed:** Dual carbon intake plenums are mounted on the **outside flanks** of the cylinder heads, drawing chilled air directly from the vehicle's side quarter-panel NACA scoops.

### B. Equal-Length Exhaust Headers & Thermal Heat Shielding
- Modeled as smooth 16-segment curved tubular sweeps ($\varnothing 45\text{mm}$ primary runners) converging into twin 4-into-1 merge collectors.
- **Dimpled Inconel Heat Shields:** Modeled with an offset shell ($+4\text{mm}$ clearance) with golden/titanium heat foil shaders protecting the carbon intake runners from the $1,050^\circ\text{C}$ turbine glow.

### C. Structural Carbon Fiber Engine Bay X-Brace
- Rigid cross-car diagonal truss bridging the rear suspension strut towers across the top of the intake plenum, resisting torsional chassis twist ($k_{\text{torsion}} \ge 45\text{ kNm/deg}$).

---

## 4. The 5-Modifier Class-A Amplification Pipeline (Powertrain)

```python
def apply_powertrain_geometry_pipeline(obj, subsurf_levels=2):
    """Applies the mandatory 5-modifier amplification pipeline to engine components."""
    # Step 1: Vertex Welding
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.remove_doubles(threshold=0.0005)
    bpy.ops.object.mode_set(mode='OBJECT')
    
    # Step 2: Smooth Shading by Angle (35 degrees)
    if hasattr(obj.data, "shade_smooth_by_angle"):
        obj.data.shade_smooth_by_angle(math.radians(35))
    else:
        obj.data.use_auto_smooth = True
        obj.data.auto_smooth_angle = math.radians(35)
        
    # Step 3: Catmull-Clark Subdivision Surface
    sub = obj.modifiers.new("Subsurf", "SUBSURF")
    sub.levels = subsurf_levels
    sub.render_levels = subsurf_levels
    sub.subdivision_type = 'CATMULL_CLARK'
    
    # Step 4: Angle-Limited Bevel Modifier (2.0mm casting fillet edges)
    bev = obj.modifiers.new("Bevel", "BEVEL")
    bev.width = 0.002
    bev.segments = 2
    bev.limit_method = 'ANGLE'
    bev.angle_limit = math.radians(35.0)
    bev.use_clamp_overlap = True
    
    # Step 5: Weighted Normal Modifier (Preserves highlights across cast surfaces)
    wn = obj.modifiers.new("WeightedNormal", "WEIGHTED_NORMAL")
    wn.keep_sharp = True
```

---

## 5. PBR Automotive Shading Specifications

```text
┌───────────────────────────┬──────────────────────┬───────────┬──────────┬───────────┬──────────────────────────────┐
│ Material Key              │ Base Color (sRGB)    │ Roughness │ Metallic │ Clearcoat │ PBR Notes                    │
├───────────────────────────┼──────────────────────┼───────────┼──────────┼───────────┼──────────────────────────────┤
│ cast_aluminum_block       │ (0.78, 0.76, 0.74)   │ 0.32      │ 0.85     │ 0.00      │ Micro-rough cast texture     │
│ carbon_intake_plenum      │ (0.03, 0.03, 0.04)   │ 0.12      │ 0.10     │ 1.00      │ Gloss lacquered twill weave  │
│ cam_cover_rosso_corsa     │ (0.85, 0.05, 0.06)   │ 0.24      │ 0.20     │ 0.80      │ Crinkle/powdercoat red       │
│ titanium_turbo_exhaust    │ (0.62, 0.60, 0.58)   │ 0.25      │ 0.95     │ 0.00      │ Heat-stained turbine housings│
│ gold_inconel_heatshield   │ (0.95, 0.78, 0.22)   │ 0.18      │ 0.90     │ 0.00      │ Embossed reflective foil     │
│ silicone_coolant_hose     │ (0.05, 0.25, 0.85)   │ 0.40      │ 0.00     │ 0.00      │ Reinforced blue silicone     │
└───────────────────────────┴──────────────────────┴───────────┴──────────┴───────────┴──────────────────────────────┘
```

---

## 6. Interactive Kinematics, Baked NLA Actions & Options Architecture

Every powertrain GLB must be generated with isolated kinematic pivots, baked NLA animation actions, and self-describing glTF `extras`:

### A. Kinematic Pivots & Action Hierarchy
- **Removable Carbon Appearance Cover (`ENGINE_Appearance_Cover`)**:
  - Hinge pivot at rear ball-stud mounts.
  - **`Action_Engine_Cover_Remove`**: Lifts $+0.320\text{m}$ upward and tilts $+45.0^\circ$ to expose the V-valley turbos and velocity stacks ($30\text{ fps}$, 30 frames, `BEZIER` ease-in-out).
  - Custom Property: `{"interactive": true, "option_id": "engine_cover", "type": "toggle", "action": "Action_Engine_Cover_Remove"}`.
- **Throttle Body Linkage (`THROTTLE_Linkage_Array`)**:
  - Rotates butterfly throttle plates $0^\circ$ (idle closed) to $+88.0^\circ$ (wide open throttle).
  - Synchronized with accelerator pedal depression!
  - **`Action_Throttle_Actuate`**: Keyframed rotation linked to throttle input.
- **Oil Filler Billet Cap (`ENGINE_Oil_Cap`)**:
  - **`Action_Oil_Cap_Unscrew`**: $720.0^\circ$ unscrew rotation combined with $+0.025\text{m}$ vertical lift.

### B. Deformation Morph Targets (Shape Keys)
- **`Key_Engine_Idle_Vibe`**: Subtle $\pm 1.8\text{mm}$ micro-displacement simulating high-compression idling combustion harmonics on rubber motor mounts.

### C. Raycast Collision Hitboxes
- `HITBOX_Engine_Cover`: Bounding hull over the top carbon shroud for click-to-remove in configurators.
- `HITBOX_Oil_Cap`: Cylindrical hit-target over oil filler cap.
- `HITBOX_Turbo_L/R`: Collision hulls over turbo compressor housings for technical specification inspection.

---

## 7. Mandatory Blender glTF Export Invocation

```python
bpy.ops.export_scene.gltf(
    filepath=out_glb_path,
    export_format='GLB',
    export_extras=True,            # Exports interactive metadata dictionary
    export_animations=True,        # Exports cover lift & throttle actions
    export_animation_mode='ACTIONS', # Exports discrete named action clips
    export_morph=True,             # Exports idle vibration shape keys
    export_apply=False,            # CRITICAL: Preserves local pivot origins
    export_yup=True,
    export_materials='EXPORT',
    export_draco_mesh_compression_enable=False
)
```
