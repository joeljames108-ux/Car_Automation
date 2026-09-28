---
name: skill-for-exterior-body-and-doors
description: Automotive exterior Class-A surfacing, articulating doors, hood/trunk latches, and active aerodynamics engineering skill. Formulates 12-section lofted quad control cages, 140k triangle CAD budget, 5-modifier geometry amplification pipeline, 3.5mm precision shutlines, G2 curvature continuity, multi-hinge kinematic doors (conventional, scissor, butterfly), hydraulic strut kinematics, active DRS aero spoilers, raycast hitboxes, PBR clearcoat metallic paint, and zero-offset GLB export.
---

# Skill for Exterior Body, Doors & Active Aero: Class-A CAD & 140k Triangle Standard

This skill establishes the **quantitative engineering standard, mathematical lofting formulas, precision shutline tolerances, and procedural Blender CAD pipeline** for designing Class-A automotive exterior bodywork, articulating doors, front hoods, rear tailgates, and active aerodynamic elements. Every exterior body generated must strictly comply with the **15MB / 400,000+ Triangle Vehicle Standard** (allocating **135,000 – 150,000 triangles** to the exterior body and aero assembly) and provide fully interactive doors, hoods, and multi-position active aero wings.

---

## 1. Master Coordinate System & Vehicle Dimensions

Exterior bodywork is modeled symmetrically along the vehicle centerline in right-hand coordinate space:

| Coordinate Axis | Physical Orientation | Standard Supercar / GT Dimensions |
|:---|:---|:---|
| **$+Y$ Axis** | **FORWARD** (front splitter & nose cone) | Wheelbase: $2.700\text{m}$, Front overhang: $0.980\text{m}$ ($Y_{\text{nose}} \approx +2.300\text{m}$) |
| **$-Y$ Axis** | **REARWARD** (diffuser & tail decklid) | Rear overhang: $0.920\text{m}$ ($Y_{\text{tail}} \approx -2.300\text{m}$, Overall length: $4.600\text{m}$) |
| **$+Z$ Axis** | **VERTICAL UP** (roof crest & greenhouse) | Roof height: $1.220\text{m} – 1.340\text{m}$, Ground clearance: $0.110\text{m}$ |
| **$\pm X$ Axis** | **LATERAL WIDTH** (fender flares & mirrors) | Front track: $1.900\text{m}$, Rear track: $1.960\text{m}$, Total width: $2.020\text{m}$ |

---

## 2. Quantitative Triangle & Mesh Budget (Exterior Body & Aero)

Under the **15MB / 400,000+ Triangle Standard**, the exterior body and aero assembly accounts for **~140,000 – 150,000 triangles**:

```text
┌───────────────────────────────────────────────────────────┬──────────────┬────────────┐
│ Exterior Component Mesh                                   │ Triangles    │ % of Total │
├───────────────────────────────────────────────────────────┼──────────────┼────────────┤
│ Main Monocoque Body Shell (Fenders, quarter panels, roof) │ 50,000       │ 35.7%      │
│ Articulating Front Doors Left & Right (Outer skin + seal) │ 30,000       │ 21.4%      │
│ Front Clamshell Hood / Frunk (Heat extractors & badge)    │ 18,000       │ 12.9%      │
│ Front Bumper, Splitter & 3D Honeycomb Intake Grilles      │ 16,000       │ 11.4%      │
│ Rear Bumper, Diffuser Strakes & Polished Inconel Exhausts │ 14,000       │ 10.0%      │
│ Active DRS Rear Wing & Dual Hydraulic Actuator Struts     │  8,000       │  5.7%      │
│ Aerodynamic Wing Mirrors with Integrated Turn Indicators  │  4,000       │  2.9%      │
├───────────────────────────────────────────────────────────┼──────────────┼────────────┤
│ TOTAL (EXTERIOR BODY & ACTIVE AERODYNAMICS)               │ ~140,000 tris│ 100%       │
└───────────────────────────────────────────────────────────┴──────────────┴────────────┘
```

---

## 3. Mathematical Geometry & Surfacing Standards

### A. 12-Section Lofted Quad Control Cage (G2 Curvature Continuity)
Exterior surfaces are lofted along 12 longitudinal master cross-sections ($Y \in [+2.30\text{m}, -2.30\text{m}]$):
- **G2 Curvature Continuity:** Second derivative of surface curvature is continuous across panel crowns ($\frac{d^2z}{dx^2}$ is continuous), eliminating sharp reflection breaks.
- **Tumblehome Taper:** Greenhouse side pillars taper inward by $14.5^\circ$ toward the roof centerline:
  $$X_{\text{greenhouse}}(z) = X_{\text{waist}} - (z - Z_{\text{belt}}) \cdot \tan(14.5^\circ)$$

### B. Precision Automotive Shutlines ($3.5\text{mm}$)
- Cut lines between hood, doors, fenders, and bumpers are modeled with physical negative clearances:
  - Width: Uniform $3.5\text{mm} \pm 0.2\text{mm}$.
  - Flange Depth: Inward returned hem flanges ($12\text{mm}$ deep) with black rubber EPDM weatherseals to prevent see-through voids into the cabin or engine bay.

### C. Active Dual-Element Rear Aerodynamic Wing
- **Main Airfoil Plane:** High-camber NACA 6412 cross-section spanning $1.650\text{m}$ width ($X \in [-0.825\text{m}, +0.825\text{m}]$).
- **Secondary DRS Flap:** Trailing edge flap articulating independently to dump aerodynamic drag on high-speed straights.
- **Twin Swan-Neck Pylon Struts:** CNC billet aluminum pylons mounting to the rear chassis subframe.

---

## 4. The 5-Modifier Class-A Amplification Pipeline (Exterior)

```python
def apply_exterior_geometry_pipeline(obj, subsurf_levels=3):
    """Applies the mandatory 5-modifier amplification pipeline for exterior body panels."""
    # Step 1: Vertex Welding (Eliminates coincident CAD export seams)
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
        
    # Step 3: Catmull-Clark Subdivision Surface (Level 2 or 3 for mirror reflections)
    sub = obj.modifiers.new("Subsurf", "SUBSURF")
    sub.levels = subsurf_levels
    sub.render_levels = subsurf_levels
    sub.subdivision_type = 'CATMULL_CLARK'
    
    # Step 4: Angle-Limited Bevel Modifier (3.0mm soft panel edge highlight rolloff)
    bev = obj.modifiers.new("Bevel", "BEVEL")
    bev.width = 0.003
    bev.segments = 2
    bev.limit_method = 'ANGLE'
    bev.angle_limit = math.radians(38.0)
    bev.use_clamp_overlap = True
    
    # Step 5: Weighted Normal Modifier (Preserves highlights across door shutlines)
    wn = obj.modifiers.new("WeightedNormal", "WEIGHTED_NORMAL")
    wn.keep_sharp = True
```

---

## 5. PBR Automotive Shading Specifications

```text
┌───────────────────────────┬──────────────────────┬───────────┬──────────┬───────────┬──────────────────────────────┐
│ Material Key              │ Base Color (sRGB)    │ Roughness │ Metallic │ Clearcoat │ PBR Notes                    │
├───────────────────────────┼──────────────────────┼───────────┼──────────┼───────────┼──────────────────────────────┤
│ paint_metallic_specular   │ (0.02, 0.28, 0.72)   │ 0.10      │ 0.92     │ 1.00      │ Clearcoat rough 0.04         │
│ carbon_twill_gloss_aero   │ (0.03, 0.03, 0.04)   │ 0.18      │ 0.20     │ 1.00      │ Lacquered exposed weave      │
│ satin_black_aero_trim     │ (0.06, 0.06, 0.07)   │ 0.45      │ 0.40     │ 0.00      │ Splitters & diffuser strakes │
│ titanium_inconel_exhaust  │ (0.65, 0.63, 0.60)   │ 0.22      │ 0.96     │ 0.00      │ Heat-stained hollow tips     │
│ epdm_rubber_shutline_seal │ (0.02, 0.02, 0.02)   │ 0.75      │ 0.00     │ 0.00      │ Matte weatherstripping       │
└───────────────────────────┴──────────────────────┴───────────┴──────────┴───────────┴──────────────────────────────┘
```

---

## 6. Interactive Kinematics, Baked NLA Actions & Options Architecture

Every exterior body GLB must be generated with isolated kinematic pivots, baked NLA animation actions, and self-describing glTF `extras`:

### A. Kinematic Pivots & Action Hierarchy
- **Driver Door Articulation (`DOOR_Assembly_L`)**:
  - Hinge pivot centered on the A-pillar door hinge pin at $(X = -0.880, Y = +0.520, Z = +0.480)$.
  - **`Action_Door_Open_L`**: Conventional swing $+65.0^\circ$ outward (or $+75.0^\circ$ scissor pitch upward) ($30\text{ fps}$, 30 frames, `BEZIER` ease-in-out).
  - Custom Property: `{"interactive": true, "option_id": "door_driver", "type": "toggle", "min": 0.0, "max": 65.0, "action": "Action_Door_Open_L"}`.
- **Passenger Door Articulation (`DOOR_Assembly_R`)**:
  - Hinge pivot on right A-pillar at $(X = +0.880, Y = +0.520, Z = +0.480)$.
  - **`Action_Door_Open_R`**: Swing $-65.0^\circ$ outward.
  - Custom Property: `{"interactive": true, "option_id": "door_passenger", "type": "toggle", "min": 0.0, "max": -65.0, "action": "Action_Door_Open_R"}`.
- **Front Clamshell Hood / Frunk (`HOOD_Clamshell_Pivot`)**:
  - Transverse horizontal hinge axis at cowl line $(Y = +0.580\text{m}, Z = +0.720\text{m})$.
  - **`Action_Hood_Open`**: Lifts $+48.0^\circ$ upward with dual gas strut elongation.
  - Custom Property: `{"interactive": true, "option_id": "hood_frunk", "type": "toggle", "min": 0.0, "max": 48.0, "action": "Action_Hood_Open"}`.
- **Rear Engine Decklid / Trunk (`TRUNK_Decklid_Pivot`)**:
  - Transverse horizontal hinge axis at $(Y = -0.420\text{m}, Z = +0.880\text{m})$.
  - **`Action_Trunk_Open`**: Lifts $+55.0^\circ$ upward.
  - Custom Property: `{"interactive": true, "option_id": "trunk_decklid", "type": "toggle", "action": "Action_Trunk_Open"}`.
- **Active DRS Aerodynamic Wing (`AERO_Wing_Active_Flap`)**:
  - Transverse pivot axis along wing mounting pylons at $(Y = -2.150\text{m}, Z = +1.120\text{m})$.
  - **`Action_Aero_Wing_Deploy`**: Keyframed multi-position pitch:
    - Rest/Stowed: $0^\circ$
    - Cruise Downforce: $+12.0^\circ$
    - Track Attack: $+24.0^\circ$
    - Airbrake/Emergency Brake: $+55.0^\circ$ vertical pitch.
  - Custom Property: `{"interactive": true, "option_id": "active_rear_wing", "type": "stepped", "steps": ["STOWED", "CRUISE", "TRACK", "AIRBRAKE"], "action": "Action_Aero_Wing_Deploy"}`.

### B. Raycast Collision Hitboxes
- `HITBOX_Door_Handle_L/R`: Flush aerodynamic touch sensors on the door waistline.
- `HITBOX_Hood_Latch`: Front nose badge emblem for frunk opening.
- `HITBOX_Trunk_Release`: Rear license plate recess touch pad.
- `HITBOX_Rear_Wing`: Upper wing surface for aerodynamic mode testing.

---

## 7. Mandatory Blender glTF Export Invocation

```python
bpy.ops.export_scene.gltf(
    filepath=out_glb_path,
    export_format='GLB',
    export_extras=True,            # Exports interactive metadata dictionary
    export_animations=True,        # Exports door, hood, trunk, and wing actions
    export_animation_mode='ACTIONS', # Exports discrete named action clips
    export_apply=False,            # CRITICAL: Preserves door & wing hinge pivots
    export_yup=True,
    export_materials='EXPORT',
    export_draco_mesh_compression_enable=False
)
```
