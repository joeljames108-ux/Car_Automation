---
name: skill-for-pedals-and-footwell
description: Automotive pedal box and footwell driver interface engineering skill. Formulates Class-A CAD procedural modeling, 18k-25k triangle budget, floor-mounted organ-type throttle pedal (0-18 deg stroke), hanging dual-master-cylinder brake pedal (0-14 deg stroke, balance bias bar), clutch pedal, dead-pedal footrest, knurled non-slip rubber pad inlays, illuminated LED footwell puddle lighting, tactile pedal depression actions, raycast hitboxes, and zero-offset GLB export.
---

# Skill for Pedals & Footwell: Driver Foot Interface & 25k Triangle CAD Standard

This skill establishes the **quantitative engineering standard, biomechanical ergonomics (knee angle $120^\circ-135^\circ$ under braking), pedal ratio leverages ($4.8:1$ to $5.2:1$), and procedural Blender CAD pipeline** for designing high-performance pedal box assemblies, throttle linkages, brake balance bars, and footwell ambient illumination. Every pedal box generated must strictly comply with the **650,000+ Triangle Vehicle Standard** (allocating **18,000 – 25,000 triangles** to the footwell assembly) and provide interactive pedal stroke depressions, synchronized throttle butterfly linkages, and raycast hitboxes.

---

## 1. Master Coordinate System & Footwell Hardpoints

The pedal box is anchored to the lower firewall and driver floor plane in right-hand coordinate space:

| Pedal Component | Longitudinal ($Y$) | Lateral ($X$) | Vertical ($Z$) | Snapping Hardpoint |
|:---|:---|:---|:---|:---|
| **Floor-Mounted Throttle Pivot** | $Y = +0.720\text{m}$ | $X = -0.280\text{m}$ | $Z = +0.065\text{m}$ (Floor level) | `SOCK_PEDAL_THROTTLE` |
| **Hanging Brake Pedal Pivot**   | $Y = +0.740\text{m}$ | $X = -0.360\text{m}$ | $Z = +0.340\text{m}$ (Top bracket) | `SOCK_PEDAL_BRAKE` |
| **Hanging Clutch Pedal (MT)**   | $Y = +0.740\text{m}$ | $X = -0.440\text{m}$ | $Z = +0.340\text{m}$ (Top bracket) | `SOCK_PEDAL_CLUTCH` |
| **Dead Pedal Footrest Wedge**   | $Y \in [0.650\text{m}, 0.820\text{m}]$ | $X = -0.520\text{m}$ | $Z \in [0.065\text{m}, 0.220\text{m}]$ | `SOCK_DEAD_PEDAL` |

---

## 2. Quantitative Triangle & Mesh Budget (Pedal Box Assembly)

Under the upgraded ultra-fidelity standard, the pedal box assembly accounts for **18,000 – 25,000 triangles**:

```text
┌───────────────────────────────────────────────────────────┬──────────────┬────────────┐
│ Component Mesh                                            │ Triangles    │ % of Total │
├───────────────────────────────────────────────────────────┼──────────────┼────────────┤
│ Floor-Mounted Organ Throttle Blade & Non-Slip Grip Ribs   │  7,000       │ 28.0%      │
│ Hanging Brake Pedal Arm, Pad & Adjustable Balance Bar     │  8,000       │ 32.0%      │
│ Dead-Pedal Ergonomic Footrest Wedge & Rubber Grip Strips │  5,000       │ 20.0%      │
│ Hydraulic Master Cylinder Pushrod Linkage & Baseplate     │  5,000       │ 20.0%      │
├───────────────────────────────────────────────────────────┼──────────────┼────────────┤
│ TOTAL (PEDALS & FOOTWELL INTERFACE)                       │ ~25,000 tris │ 100%       │
└───────────────────────────────────────────────────────────┴──────────────┴────────────┘
```

---

## 3. Biomechanical Ergonomics & Kinematic Leverage

### A. Floor-Mounted ("Organ-Type") Throttle Dynamics
- **Natural Heel Pivot:** Hinge pin anchored at floor level ($Z = +0.065\text{m}$), allowing the driver's heel to rest securely on the floor while pivoting the ball of the foot.
- **Pedal Face Angle:** Rest angle at $22.0^\circ$ rearward from vertical.
- **Angular Travel:** $0^\circ$ to $+18.0^\circ$ stroke ($55\text{mm}$ arc travel at pedal top).
- **Progressive Spring Return:** Dual-rate torsion return springs for feather-light modulation at low throttle and firm resistance near wide-open throttle (WOT).

### B. Hanging Brake Pedal & Balance Bar (Bias Control)
- **Top-Hinged Lever Arm:** Solid forged billet aluminum arm with a $5.0:1$ mechanical pedal ratio, converting $500\text{ N}$ of driver foot force into $2,500\text{ N}$ at the twin master cylinders.
- **Short, Firm Travel:** $0^\circ$ to $+13.5^\circ$ stroke ($38\text{mm}$ pad travel) with progressive elastomer bump stop replicating hydraulic pressure buildup.
- **Adjustable Balance Bias Bar:** Precision threaded cross-pin with knurled cable adjuster dividing brake hydraulic force front-to-rear (standard 62% front / 38% rear).

### C. Dead-Pedal Footrest Wedge
- Positioned at $42.0^\circ$ resting angle, matching the driver's left foot relaxed posture during long-distance cruising. Provides structural bracing against high lateral G-forces during cornering.

---

## 4. The 5-Modifier Class-A Amplification Pipeline (Pedals)

```python
def apply_pedal_geometry_pipeline(obj, subsurf_levels=2):
    """Applies the mandatory 5-modifier amplification pipeline to pedal components."""
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
    
    # Step 4: Angle-Limited Bevel Modifier (1.8mm chamfers on pedal pads)
    bev = obj.modifiers.new("Bevel", "BEVEL")
    bev.width = 0.0018
    bev.segments = 2
    bev.limit_method = 'ANGLE'
    bev.angle_limit = math.radians(35.0)
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
│ pedal_billet_aluminum     │ (0.85, 0.86, 0.88)   │ 0.18      │ 0.95     │ 0.00      │ Brushed satin CNC aluminum   │
│ pedal_rubber_tread_pads   │ (0.03, 0.03, 0.03)   │ 0.82      │ 0.00     │ 0.00      │ High-friction EPDM ribs      │
│ balance_bar_anodized_gold │ (0.88, 0.68, 0.15)   │ 0.22      │ 0.90     │ 0.00      │ Anodized adjuster sleeve     │
│ footwell_puddle_led       │ (0.95, 0.98, 1.00)   │ 0.10      │ 0.00     │ 0.00      │ Emissive strength 5.0 (warm) │
└───────────────────────────┴──────────────────────┴───────────┴──────────┴───────────┴──────────────────────────────┘
```

---

## 6. Interactive Kinematics, Baked NLA Actions & Options Architecture

Every pedal box GLB must be generated with isolated kinematic pivots, baked NLA animation actions, and self-describing glTF `extras`:

### A. Kinematic Pivots & Action Hierarchy
- **Throttle Pedal Depression (`PEDAL_Throttle_Blade`)**:
  - Hinge pivot centered on the floor mounting pin $(X = -0.280, Y = +0.720, Z = +0.065)$.
  - **`Action_Throttle_Press`**: Rotates $+18.0^\circ$ forward ($30\text{ fps}$, 15 frames, snappy response with spring rebound).
  - Custom Property: `{"interactive": true, "option_id": "pedal_throttle", "type": "slider", "min": 0.0, "max": 18.0, "action": "Action_Throttle_Press"}`.
- **Brake Pedal Depression (`PEDAL_Brake_Arm`)**:
  - Hinge pivot centered on the upper bracket pivot shaft $(X = -0.360, Y = +0.740, Z = +0.340)$.
  - **`Action_Brake_Press`**: Rotates $-13.5^\circ$ forward.
  - Linked to brake stoplight intensity increase!
  - Custom Property: `{"interactive": true, "option_id": "pedal_brake", "type": "slider", "min": 0.0, "max": -13.5, "action": "Action_Brake_Press"}`.
- **Clutch Pedal Depression (`PEDAL_Clutch_Arm`)**:
  - **`Action_Clutch_Press`**: Rotates $-16.0^\circ$ forward with progressive over-center clutch release snap.

### B. Raycast Collision Hitboxes
- `HITBOX_Pedal_Throttle`: Rectangular collision hull enclosing throttle blade for click-to-rev sound demonstrations.
- `HITBOX_Pedal_Brake`: Square collision hull over brake pad.
- `HITBOX_Pedal_Clutch`: Square collision hull over clutch pad.

---

## 7. Mandatory Blender glTF Export Invocation

```python
bpy.ops.export_scene.gltf(
    filepath=out_glb_path,
    export_format='GLB',
    export_extras=True,            # Exports interactive metadata dictionary
    export_animations=True,        # Exports throttle & brake stroke actions
    export_animation_mode='ACTIONS', # Exports discrete named action clips
    export_apply=False,            # CRITICAL: Preserves floor & top hinge pivots
    export_yup=True,
    export_materials='EXPORT',
    export_draco_mesh_compression_enable=False
)
```
