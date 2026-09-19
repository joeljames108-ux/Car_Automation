---
name: skill-for-seats
description: Automotive interior seating engineering skill. Formulates Class-A CAD procedural modeling, 70k-90k triangle budget per seat (140k-180k pair), 5-modifier geometry amplification pipeline, anatomical ergonomics (H-point, lumbar lordosis), leather softness physics (5-flute parabolic lofting, negative pull-down seam gutters), non-inverting recline kinematics, carbon monocoque forward-wrapping cradle, headrest stanchions, power switchgear, PBR sheen/clearcoat shaders, baked NLA actions, morph keys, raycast hitboxes, and dual-mode GLB export.
---

# Skill for Seats: Automotive Seating Engineering, 90k+ Triangle CAD & Interactivity Standard

This skill establishes the **quantitative engineering standard, mathematical geometry algorithms, PBR material physics, and Blender MCP pipeline** for designing high-fidelity, Class-A luxury automotive seats. Every seat generated must strictly comply with the **650,000+ Triangle Vehicle Standard** (allocating **70,000 – 90,000 triangles per seat**, or **140,000 – 180,000 triangles** for the front pair) and provide fully interactive kinematics, morph targets, and raycast hitboxes.

---

## 1. Exterior vs. Interior Parts Separation

In automotive systems architecture, vehicle components are strictly bifurcated into two distinct design methodologies:

| Domain Criteria | **Exterior Body Parts** (`scripts/blender/generators/exterior/`) | **Interior Seating & Cabin Parts** (`skills of parts/skill for seats/`) |
|:---|:---|:---|
| **Primary Physics** | Aerodynamic drag ($C_d$), downforce ($C_l$), wake vorticity, cooling airflow | Ergonomic H-point, pressure distribution, spinal lordosis, vibration damping |
| **Tolerance Gaps** | Uniform $3.5\text{mm} – 4.0\text{mm}$ shutlines between stamped sheet panels | Negative $-8\text{mm}$ pull-down seam gutters with tensioned French stitching |
| **Material Behavior**| High-specular reflective paint, clearcoat, optical polycarbonate, tinted glass | Supple dielectric leather sheen, micro-perforations, soft Alcantara, foam compliance |
| **Kinematic Pivots**| Steering knuckles, suspension multi-link travel, aerodynamic active wings | Seat base sliders, recline angle pivot, 4-way pneumatic lumbar, telescoping headrest |
| **Snapping Hardpoints**| Platform subframe mounts, strut towers, wheel hubs, bumper crash beams | Seat floor slider rails (`SOCK_DRIVER_SEAT_TRACK_BASE`), seatbelt anchor points |

---

## 2. Quantitative Triangle & Mesh Budget (Per Seat)

Under the upgraded ultra-fidelity standard, the seating cabin suite is allocated **140,000 – 180,000 triangles** (**70,000 – 90,000 triangles per seat**):

```text
┌───────────────────────────────────────────────────────────┬──────────────┬────────────┐
│ Seat Component Mesh                                       │ Triangles    │ % of Seat  │
├───────────────────────────────────────────────────────────┼──────────────┼────────────┤
│ Cushion 5-Flute Insert (Parabolic arch + ischial dishing) │ 24,000       │ 26.7%      │
│ Backrest 5-Flute Insert (Spinal lordosis + French seams)  │ 26,000       │ 28.9%      │
│ Lateral Thigh & Torso Bolsters (Convex swell + cradles)   │ 14,000       │ 15.6%      │
│ Continuous Contrast Piping Bead & Stitching Accents       │  6,000       │  6.7%      │
│ Carbon Fiber Monocoque Shell (Forward wrap + shoulder)    │ 10,000       │ 11.1%      │
│ Telescoping Headrest (Chrome stanchions + cervical dome)  │  6,000       │  6.7%      │
│ Seat Riser Track, Valance Switchpack & Belt Buckle        │  4,000       │  4.4%      │
├───────────────────────────────────────────────────────────┼──────────────┼────────────┤
│ TOTAL (SINGLE SEAT)                                       │ ~90,000 tris │ 100%       │
│ PAIR (DRIVER + PASSENGER)                                 │ ~180,000 tris│ (Full Cabin│
└───────────────────────────────────────────────────────────┴──────────────┴────────────┘
```

---

## 3. Anatomical Ergonomics & Coordinate Space Standard

### Coordinate Alignment
- **$+Y$ Axis = FORWARD** (pointing towards vehicle front bumper, driver knees, and steering wheel).
- **$-Y$ Axis = REARWARD** (pointing towards vehicle rear bulkhead, trunk, and seat recline).
- **$+Z$ Axis = VERTICAL UP** (pointing towards headliner and roof).
- **$+X$ Axis = LATERAL RIGHT** (LHD vehicle: inboard/center console side; passenger side).
- **$-X$ Axis = LATERAL LEFT** (LHD vehicle: outboard/door valance switchpack side).

### CRITICAL LESSON: Non-Inverting Recline Kinematics
> [!CAUTION]
> **RECLINE ROTATION SIGN RULE (DO NOT INVERT)**:
> In Blender's right-hand coordinate system, rotating around the local $X$-axis rotates $+Z$ into $+Y$ for negative angles and into $-Y$ for positive angles.
> 
> $$\begin{pmatrix} Y_{\text{new}} \\ Z_{\text{new}} \end{pmatrix} = \begin{pmatrix} \cos\theta & -\sin\theta \\ \sin\theta & \cos\theta \end{pmatrix} \begin{pmatrix} 0 \\ Z \end{pmatrix} = \begin{pmatrix} -Z\sin\theta \\ Z\cos\theta \end{pmatrix}$$
>
> - **NEGATIVE ANGLE (`-15°`)**: $Y_{\text{new}} = -Z\sin(-15^\circ) > 0$ $\rightarrow$ **FOLDS FORWARD** over the seat cushion like a clamshell!
> - **POSITIVE ANGLE (`+15°`)**: $Y_{\text{new}} = -Z\sin(+15^\circ) < 0$ $\rightarrow$ **RECLINES REARWARD** towards the back of the car!
> - **MANDATORY**: Always use **positive rotation angles** (`math.radians(14.0)` to `math.radians(17.0)`) for seat backrest recline!

### Standard Physical Dimensions (Class-A Luxury Seat)
- **Total Seat Height**: $0.94\text{m} – 1.02\text{m}$ (from floor rail mounting surface to top of headrest).
- **Total Seat Width**: $0.52\text{m} – 0.58\text{m}$ (across outer bolster edges).
- **Cushion Length**: $0.46\text{m} – 0.54\text{m}$ (including front thigh extension).
- **Cushion Base Height**: $0.08\text{m} – 0.12\text{m}$ above floor rails.
- **Backrest Height**: $0.60\text{m} – 0.65\text{m}$ from pivot hinge to top shoulder line.
- **Headrest Height**: $0.14\text{m} – 0.18\text{m}$ with $0.05\text{m} – 0.08\text{m}$ telescoping post reveal.
- **Seat Recline Angle**: Nominal $14.0^\circ – 16.0^\circ$ rearward.

---

## 4. Mathematical Geometry of Tactile Leather "Softness"

True softness in automotive CAD is perceived through three geometric properties: **anatomical dishing**, **parabolic fluting**, and **negative French seam gutters**.

### 1. Parabolic Fluting & Negative Seam Gutters
Divide the center seat insert into 5 longitudinal flutes (cushion) or vertical flutes (backrest):
```python
# Flute width and parabolic arch formula
flute_w = width / flutes_count
t_x = i / 4.0  # Normalized position across flute (0.0 to 1.0)
x = x_start + t_x * flute_w

# Parabolic crown: +12mm at center, dipping to -3mm at the seams
arch = math.sin(t_x * math.pi) * 0.012
if i == 0 or i == 4:
    arch = -0.003  # Plunges into negative seam gutter
```

### 2. Anatomical Ischial Dishing (Cushion)
Emulates $45\text{mm}$ multi-density viscoelastic polyurethane foam under pelvic load:
```python
# j: segment along cushion length (0 at rear hinge, 1 at front thigh roll)
t_y = j / segs_y
dish_y = -math.sin(t_y * math.pi * 0.8) * 0.018 + (t_y - 0.3) * 0.016
z = height + arch + dish_y
```

### 3. Spinal Lordosis Bulge (Backrest)
Provides anatomical lumbar support peaking at $L3-L5$ vertebrae ($t_z \approx 0.35$):
```python
# Lumbar lordosis curve along backrest height
lumbar_bulge = math.sin(t_z * math.pi * 1.1) * 0.020 if t_z <= 0.90 else 0.0
y = 0.012 + lumbar_bulge + arch
```

### 4. Lateral Bolster Cupping & Contrast Piping
- **Thigh Bolsters**: Swell outward with a $+22\text{mm}$ to $+35\text{mm}$ convex radius, enclosing the sides of the cushion flutes. Must include a floor plate to guarantee a solid, non-see-through mesh.
- **Torso & Kidney Wings**: Swell forward by $+35\text{mm} – +45\text{mm}$ from the center flutes to cradle the ribcage during cornering.
- **Contrast Leather Piping**: Modeled as an extruded 8-segment circular bead ($4.5\text{mm} – 5.0\text{mm}$ diameter) running continuously along every bolster crest seam.

### 5. Solid Front Thigh Roll with End Caps
The front thigh extension must be modeled as a continuous semicircular roll with closed planar or rounded end caps to prevent hollow mesh artifacts:
```python
# Solid end caps on left and right sides
bm.faces.new([verts_grid[0][i] for i in range(segs_arc + 1)])
bm.faces.new([verts_grid[segs_x][i] for i in reversed(range(segs_arc + 1))])
```

---

## 5. Structural Monocoque Back Shell & Cradle Geometry

The rear of the seat features a rigid pre-preg carbon fiber or composite shell.

### CRITICAL LESSON: Forward Wrap Direction
> [!IMPORTANT]
> The carbon shell must **wrap FORWARD around the sides of the bolsters** ($+Y$ at the outer edges) to cradle the padding:
> ```python
> # Positive cosine curvature wraps forward around the bolsters (+Y)
> wrap_forward = (1.0 - math.cos((t_x - 0.5) * math.pi)) * 0.038
> wrap_y = -0.024 + lumbar_sh + wrap_forward
> ```
> Never subtract the cosine offset, which flares the shell rearward and creates an unsightly $200\text{mm}$ gap.

### Shoulder Rounding Contour
To prevent rectangular CAD corners from protruding above the leather wings, taper the outer top corners of the carbon shell downward:
```python
# Outer shoulder corners drop 25mm to match the contour of the leather wings
shoulder_taper = (1.0 - math.cos((t_x - 0.5) * math.pi)) * 0.025 * (t_z ** 1.5)
z = -0.02 + t_z * (h + 0.01) - shoulder_taper
```

---

## 6. The 5-Modifier Class-A Amplification Pipeline (Seats)

To achieve **~70,000 triangles per seat** with mirror-like specular highlights:

```python
def apply_seat_geometry_pipeline(obj, subsurf_levels=2):
    """Applies the mandatory 5-modifier amplification pipeline to seat components."""
    # Step 1: Vertex Welding (Eliminates coincident split vertices)
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
        
    # Step 3: Catmull-Clark Subdivision Surface
    sub = obj.modifiers.new("Subsurf", "SUBSURF")
    sub.levels = subsurf_levels
    sub.render_levels = subsurf_levels
    sub.subdivision_type = 'CATMULL_CLARK'
    
    # Step 4: Angle-Limited Bevel Modifier (3.0mm fillet chamfers)
    bev = obj.modifiers.new("Bevel", "BEVEL")
    bev.width = 0.003
    bev.segments = 2
    bev.limit_method = 'ANGLE'
    bev.angle_limit = math.radians(38.0)
    bev.use_clamp_overlap = True
    
    # Step 5: Weighted Normal Modifier (Preserves highlights across pull-down seams)
    wn = obj.modifiers.new("WeightedNormal", "WEIGHTED_NORMAL")
    wn.keep_sharp = True
```

---

## 7. PBR Automotive Interior Material Matrix

```text
┌───────────────────────────┬──────────────────────┬───────────┬──────────┬───────────┬──────────────────────────────┐
│ Material Key              │ Base Color (sRGB)    │ Roughness │ Metallic │ Clearcoat │ Sheen / Optical Notes        │
├───────────────────────────┼──────────────────────┼───────────┼──────────┼───────────┼──────────────────────────────┤
│ leather_cognac_primary    │ (0.48, 0.23, 0.08)   │ 0.44      │ 0.00     │ 0.00      │ Sheen 0.70, Sheen Tint 0.38  │
│ leather_cognac_perf       │ (0.42, 0.20, 0.07)   │ 0.48      │ 0.00     │ 0.00      │ Sheen 0.60, Perforated core  │
│ leather_piping_cream      │ (0.85, 0.80, 0.72)   │ 0.40      │ 0.00     │ 0.15      │ Highlight contrast bead      │
│ carbon_twill_gloss        │ (0.04, 0.04, 0.04)   │ 0.10      │ 0.00     │ 1.00      │ Clearcoat Rough 0.04, IOR 1.52│
│ billet_titanium           │ (0.40, 0.40, 0.42)   │ 0.28      │ 0.90     │ 0.00      │ Anisotropic brushed 0.35     │
│ mirror_chrome             │ (0.95, 0.95, 0.95)   │ 0.05      │ 1.00     │ 0.00      │ Specular 1.00                │
│ valance_satin_black       │ (0.08, 0.08, 0.09)   │ 0.55      │ 0.00     │ 0.00      │ Molded automotive composite  │
│ seatbelt_button_red       │ (0.92, 0.04, 0.06)   │ 0.28      │ 0.00     │ 0.00      │ High-vis safety red          │
│ seatbelt_webbing          │ (0.02, 0.02, 0.025)  │ 0.68      │ 0.00     │ 0.00      │ Sheen 0.35, Woven nylon      │
└───────────────────────────┴──────────────────────┴───────────┴──────────┴───────────┴──────────────────────────────┘
```

---

## 8. Interactive Kinematics, Baked NLA Actions & Options Architecture

Every seat GLB must be generated with isolated kinematic pivots, baked NLA animation actions, morph keys, and self-describing glTF `extras`:

### A. Kinematic Pivots & Action Hierarchy
- **Recline Backrest (`SEAT_Backrest_Pivot`)**:
  - Hinge pivot centered at $(0.0, -0.08\text{m}, 0.10\text{m})$.
  - **`Action_Seat_Recline`**: Keyframed from $0^\circ$ (design recline) to $+25.0^\circ$ rearward recline ($30\text{ fps}$, 30 frames, `BEZIER` ease-in-out).
  - Custom Property: `{"interactive": true, "option_id": "seat_recline", "type": "rotational", "min": 0.0, "max": 25.0, "action": "Action_Seat_Recline"}`.
- **Seat Cushion Slider (`SEAT_Cushion_Assembly`)**:
  - Longitudinal slider along floor rail incline ($Y$-axis).
  - **`Action_Seat_Slide`**: Keyframed from $-0.16\text{m}$ (rearward track limit) to $+0.08\text{m}$ (forward track limit).
  - Custom Property: `{"interactive": true, "option_id": "seat_slide", "type": "linear", "min": -0.16, "max": 0.08, "action": "Action_Seat_Slide"}`.
- **Telescoping Headrest (`HEADREST_Assembly`)**:
  - Vertical extension along twin chrome stanchions ($Z$-axis).
  - **`Action_Headrest_Adjust`**: Keyframed from $0.0\text{m}$ to $+0.06\text{m}$ lift.
  - Custom Property: `{"interactive": true, "option_id": "headrest_adjust", "type": "linear", "min": 0.0, "max": 0.06, "action": "Action_Headrest_Adjust"}`.

### B. Deformation Morph Targets (Shape Keys)
- **`Key_Bolster_Hug`**: Clamps lateral thigh and torso wings inward by $25\text{mm}$ (Sport/Track mode dynamic bolster clamping).
- **`Key_Lumbar_Inflate`**: Expands lower lumbar support forward by $20\text{mm}$ (Ergonomic pneumatic comfort adjustment).

### C. Raycast Collision Hitboxes
- `HITBOX_Seat_Switch_Cushion`: Low-poly box over horizontal cushion adjuster switch.
- `HITBOX_Seat_Switch_Backrest`: Low-poly box over vertical recline adjuster switch.
- `HITBOX_Seat_Switch_Lumbar`: Low-poly cylinder over 4-way circular lumbar disc.
- `HITBOX_Seatbelt_Buckle`: Low-poly box over seatbelt receiver and red release button.

---

## 9. Mandatory Blender glTF Export Invocation

When exporting any seat asset:
```python
bpy.ops.export_scene.gltf(
    filepath=out_glb_path,
    export_format='GLB',
    export_extras=True,            # Exports interactive metadata dictionary
    export_animations=True,        # Exports baked kinematic NLA actions
    export_animation_mode='ACTIONS', # Exports discrete named action clips
    export_morph=True,             # Exports shape keys for soft surfaces
    export_morph_normal=True,
    export_apply=False,            # CRITICAL: Preserves local hinge pivot positions
    export_yup=True,
    export_materials='EXPORT',
    export_draco_mesh_compression_enable=False
)
```
