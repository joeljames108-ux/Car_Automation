---
name: skill-for-wheels-and-brakes
description: Automotive wheels, tires, and high-performance braking systems engineering skill. Formulates multi-piece forged alloy rims, 3D directional tire tread siping, 96k triangle CAD budget, 5-modifier geometry amplification pipeline, cross-drilled carbon-ceramic rotors with internal radial cooling vanes, 6-piston monobloc calipers, continuous spin and steering knuckle yaw kinematics, raycast hitboxes, PBR anisotropy/clearcoat shaders, and zero-offset GLB export.
---

# Skill for Wheels & Brakes: Automotive Running Gear & 96k Triangle CAD Standard

This skill establishes the **quantitative engineering standard, mathematical geometry algorithms, PBR material physics, and procedural Blender CAD pipeline** for designing high-performance automotive wheels, directional siped tires, and multi-piston carbon-ceramic braking assemblies. Every wheel and brake set generated must strictly comply with the **15MB / 400,000+ Triangle Vehicle Standard** (allocating **96,000 – 105,000 triangles** across 4 corners) and provide fully interactive wheel spin, steering knuckle yaw, and raycast hitboxes.

---

## 1. Master Coordinate System & Snapping Alignment

Wheel and brake assemblies are anchored to the 4 vehicle wheel-well hardpoints:

| Corner | Longitudinal ($Y$) | Lateral ($X$) | Vertical ($Z$) | Snapping Hardpoint |
|:---|:---|:---|:---|:---|
| **Front Left (FL)** | $+1.320\text{m}$ (Front Axle) | $-0.950\text{m}$ (Front Track Half) | $+0.340\text{m}$ (Wheel Center) | `FRONT_WHEEL_L` |
| **Front Right (FR)**| $+1.320\text{m}$ (Front Axle) | $+0.950\text{m}$ (Front Track Half) | $+0.340\text{m}$ (Wheel Center) | `FRONT_WHEEL_R` |
| **Rear Left (RL)**  | $-1.380\text{m}$ (Rear Axle)  | $-0.980\text{m}$ (Rear Track Half)  | $+0.355\text{m}$ (Wheel Center) | `REAR_WHEEL_L` |
| **Rear Right (RR)** | $-1.380\text{m}$ (Rear Axle)  | $+0.980\text{m}$ (Rear Track Half)  | $+0.355\text{m}$ (Wheel Center) | `REAR_WHEEL_R` |

---

## 2. Quantitative Triangle & Mesh Budget (Wheels, Tires & Brakes)

Under the **15MB / 400,000+ Triangle Standard**, the running gear accounts for **~96,000 – 105,000 triangles** (~24,000 – 26,000 triangles per corner):

```text
┌───────────────────────────────────────────────────────────┬──────────────┬────────────┐
│ Subsystem Component Mesh (Per Corner ×4)                  │ Tris (1 Whl) │ Total (×4) │
├───────────────────────────────────────────────────────────┼──────────────┼────────────┤
│ Multi-Piece Forged Alloy Rim (Stepped lip, 10-spoke mesh) │ 12,000       │ 48,000     │
│ 5 Recessed Lug Bolts & CNC Brand Logo Center Hubcap       │  3,000       │ 12,000     │
│ Directional 3D Tread Tire (Carved circumferential sipes)  │  2,500       │ 10,000     │
│ Cross-Drilled Carbon Ceramic Rotor (Internal radial vanes)│  5,000       │ 20,000     │
│ 6-Piston Monobloc Caliper (Bleeder valves & bridge tube)  │  4,000       │ 16,000     │
├───────────────────────────────────────────────────────────┼──────────────┼────────────┤
│ TOTAL (PER CORNER / TOTAL ACROSS 4 CORNERS)               │ ~26,500 tris │ ~106,000   │
└───────────────────────────────────────────────────────────┴──────────────┴────────────┘
```

> [!CAUTION]
> **NO FLAT CYLINDER TIRES**:
> Standard low-poly tires modeled as smooth 32-segment cylinders (~1,000 tris) fail the 15MB Grade A standard immediately. Tires must feature authentic curved shoulder sidewalls with radial tire markings and **3D carved circumferential water evacuation channels and lateral sipes**!

---

## 3. Mathematical Geometry of Wheels & 3D Tires

### A. Stepped Lip Forged Alloy Rim
- **Diameter:** $20\text{ inch}$ ($508\text{mm}$, outer radius $R = 0.254\text{m}$) front, $21\text{ inch}$ ($533\text{mm}$) rear.
- **Stepped Outer Barrel:** $35\text{mm}$ deep polished outer lip stepping down to the spoke drop center ($R_{\text{barrel}} = 0.228\text{m}$).
- **Spoke Array (10 Y-Spokes or 5 Split-Spokes):**
  $$P(\theta_k, r) = \begin{pmatrix} r \cdot \cos\left(\frac{2\pi k}{N} + \delta(r)\right) \\ -w(r) \\ r \cdot \sin\left(\frac{2\pi k}{N} + \delta(r)\right) \end{pmatrix}$$
  Where $\delta(r)$ produces aerodynamic directional swirl and $w(r)$ creates deep concavity towards the center hub ($45\text{mm}$ deep drop).

### B. 3D Carved Directional Tire Tread
Constructed with 4 primary circumferential groove ribs and angled chevron lateral siping:
```python
# Tread cross-section with 4 water evacuation channels
for seg in range(tread_segs):
    theta = seg * 2.0 * math.pi / tread_segs
    # Groove depth Modulation (5mm tread depth)
    r_tread = r_tire
    for groove_x in [-0.08, -0.03, +0.03, +0.08]:
        if abs(x - groove_x) < 0.006:
            r_tread -= 0.006  # 6mm deep groove
```

### C. Cross-Drilled Carbon-Ceramic Brake Rotor
- **Diameter:** $420\text{mm}$ front ($R = 0.210\text{m}$), $380\text{mm}$ rear.
- **Two-Piece Floating Hat:** Central CNC black anodized aluminum bell with 10 titanium floating drive bobbins.
- **Internal Directional Cooling Vanes:** 48 curved internal air pumping vanes sandwiched between the outer friction discs ($12\text{mm}$ ventilation core).
- **Cross-Drilled Hole Matrix:** Spiral patterns of $\varnothing 4.5\text{mm}$ chamfered cooling holes across the disc face.

### D. 6-Piston Monobloc Brake Caliper
- **Asymmetric Monobloc Body:** High-rigidity forged aluminum bridge spanning the rotor crest.
- **Triple Staggered Pistons:** $\varnothing 30\text{mm}, \varnothing 34\text{mm}, \varnothing 38\text{mm}$ pistons providing progressive braking force distribution.
- **Hydraulic Bridge Tube & Dual Bleeder Valves:** Extruded stainless crossover line on the top bridge.

---

## 4. The 5-Modifier Class-A Amplification Pipeline (Running Gear)

```python
def apply_wheel_geometry_pipeline(obj, subsurf_levels=2):
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
    
    # Step 4: Angle-Limited Bevel Modifier (2.5mm chamfered spoke edges)
    bev = obj.modifiers.new("Bevel", "BEVEL")
    bev.width = 0.0025
    bev.segments = 2
    bev.limit_method = 'ANGLE'
    bev.angle_limit = math.radians(35.0)
    bev.use_clamp_overlap = True
    
    # Step 5: Weighted Normal Modifier (Mirror-like alloy highlights)
    wn = obj.modifiers.new("WeightedNormal", "WEIGHTED_NORMAL")
    wn.keep_sharp = True
```

---

## 5. PBR Automotive Shading Specifications

```text
┌───────────────────────────┬──────────────────────┬───────────┬──────────┬───────────┬──────────────────────────────┐
│ Material Key              │ Base Color (sRGB)    │ Roughness │ Metallic │ Clearcoat │ PBR Notes                    │
├───────────────────────────┼──────────────────────┼───────────┼──────────┼───────────┼──────────────────────────────┤
│ alloy_diamond_cut         │ (0.88, 0.89, 0.92)   │ 0.16      │ 0.98     │ 1.00      │ Clearcoat + Anisotropy 0.70  │
│ tire_rubber_compound      │ (0.03, 0.03, 0.03)   │ 0.88      │ 0.00     │ 0.00      │ Matte vulcanized rubber      │
│ rotor_carbon_ceramic      │ (0.22, 0.23, 0.25)   │ 0.35      │ 0.80     │ 0.00      │ Radial brushed anisotropy    │
│ caliper_rosso_corsa       │ (0.88, 0.03, 0.05)   │ 0.18      │ 0.35     │ 1.00      │ Clearcoat gloss racing red   │
│ titanium_lug_bolts        │ (0.42, 0.42, 0.44)   │ 0.22      │ 0.92     │ 0.00      │ Torx/hexagonal hardware      │
└───────────────────────────┴──────────────────────┴───────────┴──────────┴───────────┴──────────────────────────────┘
```

---

## 6. Interactive Kinematics, Baked NLA Actions & Options Architecture

Every wheel and brake corner GLB must be generated with isolated kinematic pivots, baked NLA animation actions, and self-describing glTF `extras`:

### A. Kinematic Pivots & Action Hierarchy
- **Wheel & Tire Hub Spin (`WHEEL_Rotator_FL/FR/RL/RR`)**:
  - Hinge pivot centered on the axle centerline at $(X = \pm 0.950, Y = Y_{\text{axle}}, Z = Z_{\text{axle}})$.
  - **`Action_Wheel_Spin_FL`**: Continuous $360.0^\circ$ rotation around local axle $X$-axis ($30\text{ fps}$, 30 frames, `LINEAR` cyclic animation).
  - Custom Property: `{"interactive": true, "option_id": "wheel_spin_fl", "type": "rotational", "axis": "X", "action": "Action_Wheel_Spin_FL"}`.
- **Front Steering Knuckle Yaw (`KNUCKLE_Steer_FL/FR`)**:
  - Vertical kingpin axis centered at $(X = \pm 0.920, Y = +1.320, Z = +0.340)$ with $8.5^\circ$ caster tilt.
  - **`Action_Steering_Knuckle_Yaw_FL`**: Steers front wheel $-35.0^\circ$ (left lock) to $+35.0^\circ$ (right lock) around kingpin axis.
  - Synchronized with `Action_Steering_Turn` on the steering wheel!
  - Custom Property: `{"interactive": true, "option_id": "steering_knuckle_fl", "type": "rotational", "axis": "Z", "action": "Action_Steering_Knuckle_Yaw_FL"}`.
- **Fixed Brake Caliper Mount (`CALIPER_Mount_FL/FR/RL/RR`)**:
  - Child of the steering knuckle (moves with steering yaw), but **DOES NOT SPIN** with the wheel rotor.
- **Brake Rotor Glow Emission**:
  - Custom property slider controlling emissive intensity ($0.0$ cold to $20.0$ glowing orange-red $1100^\circ\text{C}$ under heavy braking).

### B. Deformation Morph Targets (Shape Keys)
- **`Key_Tire_Contact_Patch`**: Flattens bottom $14\text{mm}$ of tire rubber against the asphalt road surface under 1,650 kg vehicle curb weight.

### C. Raycast Collision Hitboxes
- `HITBOX_Wheel_FL`: Cylindrical collision hull enclosing outer wheel rim and tire sidewall for configurator clicking.
- `HITBOX_Caliper_FL`: Box hull enclosing brake caliper for brake pad/color inspection.

---

## 7. Mandatory Blender glTF Export Invocation

```python
bpy.ops.export_scene.gltf(
    filepath=out_glb_path,
    export_format='GLB',
    export_extras=True,            # Exports interactive metadata dictionary
    export_animations=True,        # Exports baked continuous spin & knuckle yaw
    export_animation_mode='ACTIONS', # Exports discrete named action clips
    export_morph=True,             # Exports contact patch shape keys
    export_apply=False,            # CRITICAL: Preserves wheel spin & knuckle hinge pivots
    export_yup=True,
    export_materials='EXPORT',
    export_draco_mesh_compression_enable=False
)
```
