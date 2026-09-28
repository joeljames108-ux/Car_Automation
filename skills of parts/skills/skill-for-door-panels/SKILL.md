---
name: skill-for-door-panels
description: Automotive interior door panel & window regulator engineering skill. Formulates ergonomic armrest contouring, 35k-50k triangle CAD budget per door card (70k-100k pair), 5-modifier geometry amplification pipeline, laser-drilled acoustic speaker grilles, tactile power window switchpacks, illuminated ambient lightguards, interior door latch release kinematics, power window glass descent actions, raycast hitboxes, PBR leather/satin shaders, and zero-offset GLB export.
---

# Skill for Door Panels & Regulators: Interior Architecture & 50k Triangle Standard

This skill establishes the **quantitative engineering standard, mathematical geometry algorithms, acoustic perforation patterns, and procedural Blender CAD pipeline** for designing luxury and sports automotive door cards, power window regulators, and ambient armrest assemblies. Every door card generated must strictly comply with the **650,000+ Triangle Vehicle Standard** (allocating **35,000 – 50,000 triangles per door card**, or **70,000 – 100,000 triangles** for the front pair) and provide fully interactive power window lowering, door latch actuation, and raycast hitboxes.

---

## 1. Master Coordinate System & Snapping Alignment

Door panel assemblies snap directly to the chassis door aperture hardpoints:

| Door Assembly | Longitudinal ($Y$) | Lateral ($X$) | Vertical ($Z$) | Snapping Hardpoint |
|:---|:---|:---|:---|:---|
| **Driver Door Card (LHD)** | $Y \in [-0.550\text{m}, +0.550\text{m}]$ | $X \in [-0.880\text{m}, -0.740\text{m}]$ | $Z \in [0.150\text{m}, 0.880\text{m}]$ | `SOCK_DOOR_INTERIOR_L` |
| **Passenger Door Card**   | $Y \in [-0.550\text{m}, +0.550\text{m}]$ | $X \in [+0.740\text{m}, +0.880\text{m}]$ | $Z \in [0.150\text{m}, 0.880\text{m}]$ | `SOCK_DOOR_INTERIOR_R` |

---

## 2. Quantitative Triangle & Mesh Budget (Per Door Card)

Under the upgraded ultra-fidelity standard, the door cards and window cassettes allocate **35,000 – 50,000 triangles per door** (70,000 – 100,000 triangles for front pair):

```text
┌───────────────────────────────────────────────────────────┬──────────────┬────────────┐
│ Door Panel Component Mesh (Single Door)                   │ Triangles    │ % of Total │
├───────────────────────────────────────────────────────────┼──────────────┼────────────┤
│ Main Ergonomic Door Card Body (Upper leather waistline)   │ 16,000       │ 32.0%      │
│ Padded Leather Armrest & Structural Pull Handle           │  8,000       │ 16.0%      │
│ Acoustic Aluminum Speaker Grille (Spiral micro-perfs)     │ 12,000       │ 24.0%      │
│ Tactile Power Window & Mirror Switchpack (4 toggles)      │  5,000       │ 10.0%      │
│ Interior Latch Release Lever & Lock Toggle                │  3,000       │  6.0%      │
│ Ambient Linear LED Lightguard Ribbon                      │  2,000       │  4.0%      │
│ Power Window Glass & Scissor Cassette Rail                │  4,000       │  8.0%      │
├───────────────────────────────────────────────────────────┼──────────────┼────────────┤
│ TOTAL (PER DOOR CARD ASSEMBLY)                            │ ~50,000 tris │ 100%       │
│ PAIR (DRIVER + PASSENGER DOORS)                           │ ~100,000 tris│            │
└───────────────────────────────────────────────────────────┴──────────────┴────────────┘
```

---

## 3. Ergonomic Architecture & Acoustic Styling

### A. Two-Tier Leather Armrest with Floating Pull Grip
- **Height Alignment:** Top armrest rest plane positioned at $Z = 0.520\text{m}$ ($40\text{mm}$ higher than seat cushion H-point for natural forearm relaxation).
- **Integrated Grab Handle:** Cantilevered structural billet handle bridging the lower storage bin ($X_{\text{grip}} = -0.760\text{m}$, clearance $32\text{mm}$).
- **Negative French Seam Gutter:** Horizontal split line separating the upper Nappa leather sill from the lower Alcantara insert.

### B. Acoustic Aluminum Speaker Grille
- **Burmester/Bowers & Wilkins High-End Sound System:**
- $\varnothing 140\text{mm}$ circular/organic aluminum speaker cover positioned at front lower quadrant ($Y \approx +0.320\text{m}, Z \approx 0.380\text{m}$).
- Concentric Archimedean spiral perforation pattern with 120 chamfered sound ports.

### C. Power Window Switchpack
- **Cantilevered Switch Valance:** Angled $22.0^\circ$ upward toward driver hand reach.
- **4 Tactile Window Toggles:** Electroplated satin chrome toggles with dual-detent up/down microswitches.

---

## 4. The 5-Modifier Class-A Amplification Pipeline (Door Panels)

```python
def apply_door_panel_geometry_pipeline(obj, subsurf_levels=2):
    """Applies the mandatory 5-modifier amplification pipeline."""
    # Step 1: Vertex Welding
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.remove_doubles(threshold=0.0005)
    bpy.ops.object.mode_set(mode='OBJECT')
    
    # Step 2: Smooth Shading
    if hasattr(obj.data, "shade_smooth_by_angle"):
        obj.data.shade_smooth_by_angle(math.radians(35))
    else:
        obj.data.use_auto_smooth = True
        obj.data.auto_smooth_angle = math.radians(35)
        
    # Step 3: Catmull-Clark Subdivision
    sub = obj.modifiers.new("Subsurf", "SUBSURF")
    sub.levels = subsurf_levels
    sub.render_levels = subsurf_levels
    sub.subdivision_type = 'CATMULL_CLARK'
    
    # Step 4: Angle-Limited Bevel Modifier (2.5mm soft edge fillets)
    bev = obj.modifiers.new("Bevel", "BEVEL")
    bev.width = 0.0025
    bev.segments = 2
    bev.limit_method = 'ANGLE'
    bev.angle_limit = math.radians(36.0)
    bev.use_clamp_overlap = True
    
    # Step 5: Weighted Normal Modifier
    wn = obj.modifiers.new("WeightedNormal", "WEIGHTED_NORMAL")
    wn.keep_sharp = True
```

---

## 5. PBR Automotive Shading Specifications

```text
┌───────────────────────────┬──────────────────────┬───────────┬──────────┬───────────┬──────────────────────────────┐
│ Material Key              │ Base Color (sRGB)    │ Roughness │ Metallic │ Clearcoat │ PBR Notes                    │
├───────────────────────────┼──────────────────────┼───────────┼──────────┼───────────┼──────────────────────────────┤
│ leather_nappa_door        │ (0.02, 0.022, 0.024) │ 0.36      │ 0.02     │ 0.18      │ Upper waistline leather      │
│ alcantara_door_insert     │ (0.05, 0.05, 0.055)  │ 0.88      │ 0.00     │ 0.00      │ Sheen 0.65, acoustic insert  │
│ speaker_grille_aluminum   │ (0.85, 0.86, 0.88)   │ 0.18      │ 0.95     │ 0.00      │ Laser-drilled brushed finish │
│ electroplate_chrome_trim  │ (0.95, 0.95, 0.95)   │ 0.05      │ 1.00     │ 0.00      │ Latch handle & window switches│
│ window_tempered_glass     │ (0.88, 0.92, 0.95)   │ 0.02      │ 0.00     │ 1.00      │ Transmission 0.94, IOR 1.52  │
│ ambient_lightguard_led    │ (0.10, 0.75, 1.00)   │ 0.10      │ 0.00     │ 0.00      │ Emissive strength 8.0        │
└───────────────────────────┴──────────────────────┴───────────┴──────────┴───────────┴──────────────────────────────┘
```

---

## 6. Interactive Kinematics, Baked NLA Actions & Options Architecture

Every door panel GLB must be generated with isolated kinematic pivots, baked NLA animation actions, and self-describing glTF `extras`:

### A. Kinematic Pivots & Action Hierarchy
- **Power Window Glass Regulator (`WINDOW_Glass_L/R`)**:
  - Hinge pivot aligned with the door cassette track vector.
  - **`Action_Window_Lower_L`**: Keyframed linear slide lowering the tempered glass $-0.460\text{m}$ down into the door cassette ($30\text{ fps}$, 30 frames, `BEZIER` ease-in-out).
  - Custom Property: `{"interactive": true, "option_id": "window_driver", "type": "linear", "min": 0.0, "max": -0.460, "action": "Action_Window_Lower_L"}`.
- **Interior Door Latch Release Lever (`DOOR_Latch_Lever_L/R`)**:
  - Vertical hinge pin at $Y \approx +0.180\text{m}, Z \approx 0.580\text{m}$.
  - **`Action_Door_Latch_Pull_L`**: Tactile inward pull $+24.0^\circ$ toward cabin ($30\text{ fps}$, 8 frames, fast tactile return).
  - Custom Property: `{"interactive": true, "option_id": "door_latch_driver", "type": "trigger", "action": "Action_Door_Latch_Pull_L"}`.
- **Ambient Lightguard Color Selector**:
  - `KHR_materials_variants` or custom property controlling color palette (Ice Blue, Amber Gold, Cyber Magenta, Pure White).

### B. Raycast Collision Hitboxes
- `HITBOX_Window_Switch_Driver`: Collision box over front-left window switch rocker.
- `HITBOX_Door_Latch_Driver`: Collision box over chrome door release handle.
- `HITBOX_Speaker_Grille`: Circular hit-target over speaker cover for audio sound-demo toggle.

---

## 7. Mandatory Blender glTF Export Invocation

```python
bpy.ops.export_scene.gltf(
    filepath=out_glb_path,
    export_format='GLB',
    export_extras=True,            # Exports interactive metadata dictionary
    export_animations=True,        # Exports window descent & latch pull actions
    export_animation_mode='ACTIONS', # Exports discrete named action clips
    export_apply=False,            # CRITICAL: Preserves window slide & latch hinge pivots
    export_yup=True,
    export_materials='EXPORT',
    export_draco_mesh_compression_enable=False
)
```
