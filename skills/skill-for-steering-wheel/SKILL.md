---
name: skill-for-steering-wheel
description: Automotive steering wheel and column engineering skill. Formulates anatomical grip ergonomics (10-and-2 thumb rests, D-cut flat bottom), 35k-50k triangle CAD budget, 5-modifier geometry amplification pipeline, dual-material lofting (perforated leather, Nappa, 12 o'clock stripe), 3-spoke forged titanium armature, magnetic paddle shifters, multifunction tactile switchgear, Manettino drive-mode dial, column stalks, PBR shaders, baked NLA actions, raycast hitboxes, and zero-offset GLB export.
---

# Skill for Steering Wheel & Column: Automotive Cockpit Interface & 50k Triangle Standard

This skill establishes the **quantitative engineering standard, mathematical geometry algorithms, ergonomic clearances, and procedural Blender CAD pipeline** for designing high-performance sports and luxury automotive steering wheels and column assemblies. Every steering wheel generated must strictly comply with the **650,000+ Triangle Vehicle Standard** (allocating **35,000 – 50,000 triangles** to the steering assembly) and provide fully interactive turning, paddle shifting, drive-mode rotation, and raycast hitboxes.

---

## 1. Master Coordinate System & Snapping Alignment

The steering wheel and column interface is anchored to the vehicle's master coordinate system relative to the driver's H-point:

| Coordinate Axis | Physical Alignment | Driver Steering Wheel Hardpoint |
|:---|:---|:---|
| **$+Y$ Axis** | **FORWARD** (pointing towards engine bay & front bumper) | Center hub: $Y = 0.440\text{m}$ ($440\text{mm}$ forward of chassis datum) |
| **$-Y$ Axis** | **REARWARD** (pointing towards driver chest & seat backrest) | Rim rim face inclined rearward at $\theta_{\text{column}} = 22.5^\circ$ |
| **$+Z$ Axis** | **VERTICAL UP** (pointing towards headliner & roof) | Center hub: $Z = 0.680\text{m}$ ($680\text{mm}$ above floor plane) |
| **$-X$ Axis** | **LATERAL LEFT** (LHD Driver centerline) | Center hub: $X = -0.380\text{m}$ (aligned with driver H-point) |

### Kinematic Transformation Matrix
The wheel face normal $\vec{N}$ points rearward and upward toward the driver's chest:
$$\vec{N} = \begin{pmatrix} 0 \\ -\cos(22.5^\circ) \\ \sin(22.5^\circ) \end{pmatrix} \approx \begin{pmatrix} 0 \\ -0.9239 \\ 0.3827 \end{pmatrix}, \quad \vec{U} = \begin{pmatrix} 0 \\ \sin(22.5^\circ) \\ \cos(22.5^\circ) \end{pmatrix} \approx \begin{pmatrix} 0 \\ 0.3827 \\ 0.9239 \end{pmatrix}$$

Any local point $P_{\text{wheel}} = (x, y_{\text{axis}}, z_{\text{face}})$ transforms to vehicle world space via:
$$\mathbf{T}_{\text{world}} = \begin{pmatrix} 1 & 0 & 0 & -0.380 \\ 0 & \cos(22.5^\circ) & -\sin(22.5^\circ) & 0.440 \\ 0 & \sin(22.5^\circ) & \cos(22.5^\circ) & 0.680 \\ 0 & 0 & 0 & 1 \end{pmatrix}$$

---

## 2. Quantitative Triangle & Mesh Budget (Steering Assembly)

Under the upgraded ultra-fidelity standard, the steering wheel and column is allocated **35,000 – 50,000 triangles**:

```text
┌───────────────────────────────────────────────────────────┬──────────────┬────────────┐
│ Steering Component Mesh                                   │ Triangles    │ % of Total │
├───────────────────────────────────────────────────────────┼──────────────┼────────────┤
│ D-Cut Sports Rim (10-and-2 thumb rests + palm contouring) │ 18,000       │ 36.0%      │
│ 3-Spoke Forged Titanium Armature & Center Hub Escutcheon  │ 10,000       │ 20.0%      │
│ Multifunction Switch Pods, Thumb Rollers & Manettino Dial │  6,000       │ 12.0%      │
│ CNC Billet Magnetic Paddle Shifters (Left & Right Pair)   │  8,000       │ 16.0%      │
│ Column Shroud, Leather Boot & Twin Multifunction Stalks   │  8,000       │ 16.0%      │
├───────────────────────────────────────────────────────────┼──────────────┼────────────┤
│ TOTAL (STEERING WHEEL & COLUMN ASSEMBLY)                  │ ~50,000 tris │ 100%       │
└───────────────────────────────────────────────────────────┴──────────────┴────────────┘
```

---

## 3. Anatomical Grip Geometry & Ergonomics

### A. Flat-Bottom D-Cut Sports Rim
- **Outer Diameter ($OD$):** $365\text{mm}$ (sports agility standard; provides $45\text{mm}$ additional thigh clearance over traditional circular wheels).
- **Flat Bottom Chord:** Truncates lower rim between $\alpha \in [135^\circ, 225^\circ]$ at $Z_{\text{local}} = -140\text{mm}$ with smooth tangential fillet blends.
- **Oval Grip Cross-Section:** Width $32\text{mm}$, depth $28\text{mm}$ (conforms to hand palm arching).
- **10-and-2 Thumb Notches ($\alpha \approx \pm 60^\circ$):** Ergonomic swell widening radial distance by $+9\text{mm}$ with palm rest pockets:
  $$r(\theta) = r_0 + \Delta r_{\text{thumb}} \cdot \left( e^{-\frac{(\theta - 60^\circ)^2}{220}} + e^{-\frac{(\theta - 300^\circ)^2}{220}} \right)$$

### B. Dual-Material Lofting & Track Stripe
- **Flank Grips ($\alpha \in [35^\circ, 125^\circ]$ and $[235^\circ, 325^\circ]$):** Breathable micro-perforated dark charcoal leather ($R = 0.45$, high grip).
- **Upper & Lower Arcs:** Smooth semi-gloss Nappa leather ($R = 0.35$, clearcoat $0.20$).
- **12 o'clock Racing Stripe:** $8\text{mm}$ wide high-contrast anodized red leather band centered at $\alpha = 0^\circ$ for peripheral steering angle feedback.

---

## 4. Armature, Controls & Paddle Shifters

### A. 3-Spoke Forged Titanium Armature
- **Center Boss:** Octagonal/circular CNC aluminum hub ($\varnothing 110\text{mm}$, depth $32\text{mm}$).
- **Horizontal Spokes:** Support left and right multifunction switchgear pods ($X \in [\pm 0.055\text{m}, \pm 0.165\text{m}]$).
- **Vertical Spoke:** Twin skeletonized vertical rails ($X = \pm 0.022\text{m}$, extending down to $Z_{\text{local}} = -0.138\text{m}$) with center negative weight-reduction cutout.

### B. Tactile Control Pods & Manettino Dial
- **Dual Knurled Rotary Scroll Wheels:** Vertical micro-cylinders ($\varnothing 16\text{mm} \times 10\text{mm}$) with diamond-pattern knurling for volume and cluster navigation.
- **Manettino Rotary Drive-Mode Dial:** Positioned at 4 o'clock on lower right spoke collar ($X = +0.048\text{m}, Z_{\text{local}} = -0.052\text{m}$), CNC red anodized knurled ring with pointer detents.
- **Leather Airbag Pad & Crest:** Convex domed hexagonal cap with perimeter stitching gutter and brushed titanium brand crest.

### C. Magnetic CNC Billet Aluminum Paddle Shifters
- **Blade Geometry:** Ergonomic curved blades extending $130\text{mm}$ along wheel circumference ($22^\circ$ to $110^\circ$).
- **Positioning:** Offset $+28\text{mm}$ rearward along the column axis ($Y_{\text{local}} = +0.028\text{m}$) with $18\text{mm}$ finger clearance behind the rim.
- **Tactile Actuation:** Laser-etched '+' (right upshift) and '-' (left downshift) symbols.

---

## 5. The 5-Modifier Class-A Amplification Pipeline (Steering Wheel)

To achieve **~30,000 triangles** with zero faceting:

```python
def apply_steering_geometry_pipeline(obj, subsurf_levels=2):
    """Applies the mandatory 5-modifier amplification pipeline."""
    # Step 1: Vertex Welding
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.remove_doubles(threshold=0.0005)
    bpy.ops.object.mode_set(mode='OBJECT')
    
    # Step 2: Smooth Shading by Angle
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
    
    # Step 4: Angle-Limited Bevel Modifier (2.5mm soft chamfers)
    bev = obj.modifiers.new("Bevel", "BEVEL")
    bev.width = 0.0025
    bev.segments = 2
    bev.limit_method = 'ANGLE'
    bev.angle_limit = math.radians(35.0)
    bev.use_clamp_overlap = True
    
    # Step 5: Weighted Normal Modifier
    wn = obj.modifiers.new("WeightedNormal", "WEIGHTED_NORMAL")
    wn.keep_sharp = True
```

---

## 6. PBR Automotive Shading Specifications

```text
┌───────────────────────────┬──────────────────────┬───────────┬──────────┬───────────┬──────────────────────────────┐
│ Material Key              │ Base Color (sRGB)    │ Roughness │ Metallic │ Clearcoat │ PBR Notes                    │
├───────────────────────────┼──────────────────────┼───────────┼──────────┼───────────┼──────────────────────────────┤
│ leather_nappa_rim         │ (0.02, 0.022, 0.024) │ 0.35      │ 0.02     │ 0.20      │ Smooth top & bottom arcs     │
│ leather_perf_grips        │ (0.018, 0.019, 0.021)│ 0.45      │ 0.02     │ 0.08      │ Perforated lateral 10-and-2  │
│ titanium_armature         │ (0.28, 0.29, 0.31)   │ 0.22      │ 0.92     │ 0.00      │ Brushed satin titanium spokes│
│ track_red_anodized        │ (0.75, 0.04, 0.06)   │ 0.18      │ 0.88     │ 0.00      │ 12 o'clock stripe & Manettino│
│ billet_paddle_aluminum    │ (0.35, 0.36, 0.38)   │ 0.16      │ 0.95     │ 0.00      │ CNC magnetic paddle blades   │
└───────────────────────────┴──────────────────────┴───────────┴──────────┴───────────┴──────────────────────────────┘
```

---

## 7. Interactive Kinematics, Baked NLA Actions & Options Architecture

Every steering wheel & column GLB must be generated with isolated kinematic pivots, baked NLA animation actions, and self-describing glTF `extras`:

### A. Kinematic Pivots & Action Hierarchy
- **Steering Wheel Rim & Armature (`STEERING_Wheel_Rotator`)**:
  - Hinge pivot centered on the steering column shaft at $(X = -0.380, Y = 0.440, Z = 0.680)$ with $22.5^\circ$ tilt.
  - **`Action_Steering_Turn`**: Keyframed continuous steering rotation from $-90.0^\circ$ (left lock) to $+90.0^\circ$ (right lock) along local column axis.
  - Custom Property: `{"interactive": true, "option_id": "steering_turn", "type": "rotational", "min": -90.0, "max": 90.0, "action": "Action_Steering_Turn"}`.
- **Left Paddle Shifter (`PADDLE_Shift_L`)**:
  - Outboard hinge pin at rear hub housing.
  - **`Action_Paddle_Shift_L`**: Tactile pull click $-6.0^\circ$ toward driver rim with fast mechanical spring rebound (6 frames).
  - Custom Property: `{"interactive": true, "option_id": "paddle_shift_down", "type": "trigger", "action": "Action_Paddle_Shift_L"}`.
- **Right Paddle Shifter (`PADDLE_Shift_R`)**:
  - Outboard hinge pin at rear hub housing.
  - **`Action_Paddle_Shift_R`**: Tactile pull click $-6.0^\circ$ toward driver rim with fast mechanical spring rebound (6 frames).
  - Custom Property: `{"interactive": true, "option_id": "paddle_shift_up", "type": "trigger", "action": "Action_Paddle_Shift_R"}`.
- **Manettino Rotary Drive-Mode Dial (`STEERING_DriveMode_Dial`)**:
  - Center of lower-right spoke collar.
  - **`Action_Drive_Mode_Rotate`**: 5 discrete stepped index rotations (Wet: $-40^\circ$, Comfort: $-20^\circ$, Sport: $0^\circ$, Sport+: $+20^\circ$, Race: $+40^\circ$).
  - Custom Property: `{"interactive": true, "option_id": "drive_mode", "type": "stepped", "steps": ["WET", "COMFORT", "SPORT", "SPORT_PLUS", "RACE"], "action": "Action_Drive_Mode_Rotate"}`.
- **Steering Column Rake & Reach (`STEERING_Column_Rake`)**:
  - **`Action_Column_Tilt`**: Tilt angle adjustment $\pm 8.0^\circ$ up/down.
  - **`Action_Column_Telescope`**: Reach extension in/out $0\text{mm}$ to $50\text{mm}$.

### B. Raycast Collision Hitboxes
- `HITBOX_Steering_Rim`: Non-rendered simplified torus hull covering the outer grip perimeter for rotational drag steering.
- `HITBOX_Paddle_L`: Convex box enclosing left paddle blade.
- `HITBOX_Paddle_R`: Convex box enclosing right paddle blade.
- `HITBOX_Drive_Mode`: Cylindrical hitbox over Manettino dial.
- `HITBOX_Horn_Boss`: Domed hexagonal hitbox over center airbag pad.

---

## 8. Mandatory Blender glTF Export Invocation

When exporting any steering wheel asset:
```python
bpy.ops.export_scene.gltf(
    filepath=out_glb_path,
    export_format='GLB',
    export_extras=True,            # Exports interactive metadata dictionary
    export_animations=True,        # Exports baked kinematic NLA actions
    export_animation_mode='ACTIONS', # Exports discrete named action clips
    export_apply=False,            # CRITICAL: Preserves local hinge pivot positions
    export_yup=True,
    export_materials='EXPORT',
    export_draco_mesh_compression_enable=False
)
```
