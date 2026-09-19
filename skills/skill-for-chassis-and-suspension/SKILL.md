---
name: skill-for-chassis-and-suspension
description: Automotive carbon monocoque chassis and pushrod suspension engineering skill. Formulates Class-A CAD procedural modeling, 40k triangle budget, double-wishbone A-arms, bell crank rocker linkages (motion ratio MR 0.75-0.85, 80-120 deg force transmission), pushrod coilovers with anodized springs, anti-roll sway bars, tubular steel subframes, suspension bump/rebound travel kinematics, dynamic spring compression morph keys, raycast hitboxes, and zero-offset GLB export.
---

# Skill for Chassis & Suspension: Monocoque Structure & Pushrod Kinematics Standard

This skill establishes the **quantitative engineering standard, structural rigidity targets ($k_{\text{torsion}} \ge 45\text{ kNm/deg}$), kinematic linkage formulas, and procedural Blender CAD pipeline** for designing carbon fiber monocoque tubs, tubular subframes, and pushrod-actuated double-wishbone suspension systems. Every chassis and suspension assembly generated must strictly comply with the **15MB / 400,000+ Triangle Vehicle Standard** (allocating **35,000 – 40,000 triangles** across chassis and suspension) and provide fully interactive suspension travel, spring compression morphs, and raycast hitboxes.

---

## 1. Master Coordinate System & Suspension Geometry Hardpoints

Suspension hardpoints are anchored relative to the wheel centers in right-hand coordinate space:

| Suspension Hardpoint | Front Axle ($Y = +1.320\text{m}$) | Rear Axle ($Y = -1.380\text{m}$) | Mechanical Role |
|:---|:---|:---|:---|
| **Upper Wishbone Inboard (Front/Rear)** | $X = \pm 0.420\text{m}, Z = +0.440\text{m}$ | $X = \pm 0.440\text{m}, Z = +0.460\text{m}$ | Camber curve & anti-dive |
| **Upper Wishbone Outboard (Ball Joint)**| $X = \pm 0.880\text{m}, Z = +0.460\text{m}$ | $X = \pm 0.910\text{m}, Z = +0.480\text{m}$ | Kingpin inclination ($8.5^\circ$) |
| **Lower Wishbone Inboard (Front/Rear)** | $X = \pm 0.360\text{m}, Z = +0.180\text{m}$ | $X = \pm 0.380\text{m}, Z = +0.190\text{m}$ | Instant center & roll center ($65\text{mm}$) |
| **Lower Wishbone Outboard (Ball Joint)**| $X = \pm 0.910\text{m}, Z = +0.170\text{m}$ | $X = \pm 0.940\text{m}, Z = +0.180\text{m}$ | Lower scrub radius control |
| **Pushrod Outboard Knuckle Attachment** | $X = \pm 0.890\text{m}, Z = +0.220\text{m}$ | $X = \pm 0.920\text{m}, Z = +0.230\text{m}$ | Compressive load input strut |
| **Rocker Bell Crank Chassis Pivot**     | $X = \pm 0.380\text{m}, Z = +0.580\text{m}$ | $X = \pm 0.400\text{m}, Z = +0.600\text{m}$ | Tri-pivot motion ratio rocker |
| **Inboard Coilover Damper Mount**       | $X = \pm 0.120\text{m}, Z = +0.620\text{m}$ | $X = \pm 0.140\text{m}, Z = +0.640\text{m}$ | Inboard horizontal shock packaging |

---

## 2. Quantitative Triangle & Mesh Budget (Chassis & Suspension)

Under the **15MB / 400,000+ Triangle Standard**, chassis and suspension account for **~40,000 triangles**:

```text
┌───────────────────────────────────────────────────────────┬──────────────┬────────────┐
│ Component Mesh                                            │ Triangles    │ % of Total │
├───────────────────────────────────────────────────────────┼──────────────┼────────────┤
│ Carbon Monocoque Tub (Sills, passenger cell, firewall)    │ 16,000       │ 40.0%      │
│ Front & Rear Tubular Steel Subframes & Strut Towers       │  8,000       │ 20.0%      │
│ Upper & Lower Double-Wishbone A-Arms (Forged/Aerofoil ×4) │  6,000       │ 15.0%      │
│ Inboard Pushrods, CNC Rocker Bell Cranks & Anti-Roll Bars │  4,000       │ 10.0%      │
│ Inboard Coilovers (Threaded aluminum body, helper springs)│  4,000       │ 10.0%      │
│ Structural Roll Cage & Side-Impact Intrusion Beams        │  2,000       │  5.0%      │
├───────────────────────────────────────────────────────────┼──────────────┼────────────┤
│ TOTAL (CHASSIS & SUSPENSION SUBSYSTEMS)                   │ ~40,000 tris │ 100%       │
└───────────────────────────────────────────────────────────┴──────────────┴────────────┘
```

---

## 3. Kinematic Linkage Formulas & Structural Engineering

### A. Rocker Bell Crank & Motion Ratio (MR)
- **Motion Ratio Formula:**
  $$MR = \frac{\Delta z_{\text{damper}}}{\Delta z_{\text{wheel}}} \approx 0.78$$
- **Force Transmission Angle:** The angle between the compressive pushrod and the damper actuation arm is tuned between $90^\circ$ and $110^\circ$, maximizing force transmission while minimizing bending moments on the damper shaft.
- **Progressive Wheel Rate:** As wheel travels into bump ($+50\text{mm}$), the bell crank geometry increases the effective spring rate by $18\%$ to prevent bottoming out under high aero downforce loads.

### B. Pushrod Buckling Safety (Euler Column Formula)
- Pushrods are modeled as high-modulus carbon-fiber aerodynamic tubes ($\varnothing 28\text{mm}$, wall thickness $3.5\text{mm}$) with CNC titanium rod ends:
  $$P_{\text{cr}} = \frac{\pi^2 E I}{L^2} \ge 28\text{ kN} \quad (\text{Factor of Safety } > 2.5)$$

### C. Carbon Monocoque Structural Cell
- Carbon sandwich construction with $20\text{mm}$ aluminum honeycomb core, providing $>45\text{ kNm/deg}$ torsional stiffness.
- Integrated front crash box (sacrificial carbon crush cones) and rear engine cradle mounting spigots.

---

## 4. The 5-Modifier Class-A Amplification Pipeline (Suspension)

```python
def apply_suspension_geometry_pipeline(obj, subsurf_levels=2):
    """Applies the mandatory 5-modifier amplification pipeline to suspension arms."""
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
    
    # Step 4: Angle-Limited Bevel Modifier (2.0mm aerodynamic leading-edge fillets)
    bev = obj.modifiers.new("Bevel", "BEVEL")
    bev.width = 0.002
    bev.segments = 2
    bev.limit_method = 'ANGLE'
    bev.angle_limit = math.radians(35.0)
    bev.use_clamp_overlap = True
    
    # Step 5: Weighted Normal Modifier
    wn = obj.modifiers.new("WeightedNormal", "WEIGHTED_NORMAL")
    wn.keep_sharp = True
```

---

## 5. PBR Material Physics & Shader Recipes

```text
┌───────────────────────────┬──────────────────────┬───────────┬──────────┬───────────┬──────────────────────────────┐
│ Material Key              │ Base Color (sRGB)    │ Roughness │ Metallic │ Clearcoat │ PBR Notes                    │
├───────────────────────────┼──────────────────────┼───────────┼──────────┼───────────┼──────────────────────────────┤
│ monocoque_carbon_matte    │ (0.04, 0.04, 0.045)  │ 0.45      │ 0.10     │ 0.00      │ Structural raw carbon weave  │
│ suspension_arm_forged     │ (0.15, 0.15, 0.16)   │ 0.35      │ 0.90     │ 0.00      │ Anodized satin black alloy   │
│ coilover_spring_azure     │ (0.02, 0.35, 0.85)   │ 0.22      │ 0.75     │ 0.00      │ Gloss powdercoat blue spring │
│ damper_body_kashima_gold  │ (0.68, 0.52, 0.22)   │ 0.18      │ 0.92     │ 0.00      │ Kashima low-friction coating │
│ spherical_bearing_chrome  │ (0.92, 0.93, 0.95)   │ 0.05      │ 1.00     │ 0.00      │ Mirror chrome uniball joints │
└───────────────────────────┴──────────────────────┴───────────┴──────────┴───────────┴──────────────────────────────┘
```

---

## 6. Interactive Kinematics, Baked NLA Actions & Options Architecture

Every chassis and suspension GLB must be generated with isolated kinematic pivots, baked NLA animation actions, and self-describing glTF `extras`:

### A. Kinematic Pivots & Action Hierarchy
- **Suspension Corner Travel (`SUSP_Upright_FL/FR/RL/RR`)**:
  - Hinge pivot centered on the wheel knuckle kingpin.
  - **`Action_Suspension_Travel_FL`**: Articulates wishbones, pushrods, and bell cranks through $-45\text{mm}$ (rebound drop) to $+55\text{mm}$ (bump compression) ($30\text{ fps}$, 30 frames, `BEZIER` ease-in-out).
  - Custom Property: `{"interactive": true, "option_id": "suspension_bump_fl", "type": "linear", "min": -0.045, "max": 0.055, "action": "Action_Suspension_Travel_FL"}`.
- **Rocker Bell Crank Rotation (`SUSP_Rocker_FL/FR`)**:
  - Rotates $+18.5^\circ$ around chassis pivot pin, compressing the coilover damper.
- **Hydraulic Nose-Lift System**:
  - **`Action_Nose_Lift_Deploy`**: Raises front ride height $+40\text{mm}$ ($Z = +0.040\text{m}$) for speed bump clearance.
  - Custom Property: `{"interactive": true, "option_id": "nose_lift", "type": "toggle", "action": "Action_Nose_Lift_Deploy"}`.

### B. Deformation Morph Targets (Shape Keys)
- **`Key_Spring_Compress`**: Linearly compresses the helical coilover spring coils by $35\text{mm}$ pitch during suspension compression travel.

### C. Raycast Collision Hitboxes
- `HITBOX_Damper_FL`: Cylindrical collision hull over front-left coilover for damper stiffness adjustment.
- `HITBOX_Rocker_FL`: Box hull over bell crank assembly.
- `HITBOX_Nose_Lift`: Hit-target over front suspension hydraulic actuator cup.

---

## 7. Mandatory Blender glTF Export Invocation

```python
bpy.ops.export_scene.gltf(
    filepath=out_glb_path,
    export_format='GLB',
    export_extras=True,            # Exports interactive metadata dictionary
    export_animations=True,        # Exports suspension bump/rebound & nose lift
    export_animation_mode='ACTIONS', # Exports discrete named action clips
    export_morph=True,             # Exports helical spring compression morph
    export_apply=False,            # CRITICAL: Preserves wishbone & rocker hinge pivots
    export_yup=True,
    export_materials='EXPORT',
    export_draco_mesh_compression_enable=False
)
```
