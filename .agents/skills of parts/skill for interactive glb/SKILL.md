---
name: skill-for-interactive-glb
description: Automotive interactive 3D GLB engineering standard. Establishes the synthesis of the 15MB / 400,000+ triangle Class-A CAD quality standard with isolated kinematic pivot hierarchies, baked glTF NLA animation actions, morph target shape keys, raycast collision hitboxes, glTF extras metadata schema, and KHR_materials_variants for fully interactive Three.js/WebGL car configurators.
---

# Skill for Interactive Automotive GLBs: Kinematic, Animation, 400k+ Triangle Quality & Options Standard

This skill establishes the **definitive engineering and procedural 3D standards for generating fully interactive automotive GLB/glTF assets**. Every vehicle model and modular interior/exterior component must be interactive out-of-the-box while strictly adhering to the **15 MB / 400,000+ Triangle Cinematic Hero Asset standard**, exposing real-time configuration options, baked kinematic animations, viscoelastic morph targets, raycast hitboxes, and self-describing metadata.

---

## 1. Architectural Principles of Interactive GLBs

A 3D automotive GLB is not merely a static display mesh; it is a **functional digital twin** of a mechanical system. To be fully interactive in Three.js, Babylon.js, Sketchfab, and Unreal Engine WebGL runtimes while maintaining cinematic visual quality, an asset must adhere to five mandatory pillars:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                      INTERACTIVE AUTOMOTIVE GLB PILLARS                                │
├────────────────────┬──────────────────┬─────────────────┬────────────────┬─────────────┤
│ 1. Isolated        │ 2. Baked NLA     │ 3. Deformation  │ 4. Semantic    │ 5. Class-A  │
│    Hinge Pivots    │    Actions       │    Morph Keys   │    Hitboxes    │    Density  │
│ (Kinematic Local   │ (Standardized    │ (Viscoelastic   │ (Raycast Hull  │ (400k+ Tris │
│  Coordinate Sys)   │  Timeline Clips) │  Soft Surface)  │  + glTF Extras)│  + 15MB PBR)│
└────────────────────┴──────────────────┴─────────────────┴────────────────┴─────────────┘
```

---

## 2. Quantitative Triangle & Byte Budget Allocation

High visual fidelity and responsive interactivity must coexist. The asset must satisfy both the **400,000+ Triangle Budget** and the **WebGL 60 FPS Performance Gate**:

| Subsystem Assembly | Target Triangles | % of Total | Interactive Kinematic Actions & Options |
|:---|---:|---:|:---|
| **CABIN (Interior Suite)** | **338,000 – 450,000** | 48.0% | Seats slide/recline, steering turn/tilt, paddle clicks, butterfly armrests, windows, pedals |
| ├── Front Luxury Seats (×2) | 140,000 – 180,000 | 20.0% | `Action_Seat_Slide`, `Action_Seat_Recline`, `Key_Bolster_Hug`, `Key_Lumbar` |
| ├── Dashboard & Center Console | 75,000 – 95,000 | 11.5% | `Action_Armrest_Open`, `Action_Shifter_PRND`, `Action_Start_Safety_Gate` |
| ├── Door Panels & Cassettes (×2) | 70,000 – 100,000 | 10.5% | `Action_Window_Lower_L/R`, `Action_Door_Latch_Pull_L/R`, acoustic speaker perfs |
| ├── Steering Wheel & Column | 35,000 – 50,000 | 5.0% | `Action_Steering_Turn`, `Action_Paddle_Shift_L/R`, `Action_Drive_Mode_Rotate`|
| └── Pedals & Footwell Interface | 18,000 – 25,000 | 2.5% | `Action_Throttle_Depress`, `Action_Brake_Depress`, organ throttle linkage |
| **BODY (Exterior Panels & Aero)** | **135,000 – 150,000** | 18.5% | Driver/Passenger doors open, hood unlatch, trunk lift, active DRS spoiler |
| **WHEELS & TIRES (×4)** | **65,000 – 75,000** | 9.5% | Wheel continuous spin rotation, front steering knuckle yaw, directional tread |
| **BRAKES & ROTORS (×4)** | **35,000 – 40,000** | 5.0% | Floating cross-drilled disc rotation, 6-piston monobloc calipers |
| **ENGINE_BAY & POWERTRAIN** | **35,000 – 45,000** | 5.5% | Removable carbon engine cover, vibrating intake plenum idle morph |
| **CHASSIS & SUSPENSION** | **35,000 – 40,000** | 5.0% | Double-wishbone suspension travel (compression/rebound bounce), pushrods |
| **LIGHTING OPTICS & GLASS** | **25,000 – 30,000** | 3.5% | Quartz projector lenses, 3D DRL light-pipes, full OLED tailbar |
| **UNDERBODY & DIFFUSER** | **8,000 – 12,000** | 1.5% | Flat floor undertray, twin Venturi expansion tunnels, active diffuser trim |
| **TOTAL COMPLETE MASTER VEHICLE** | **650,000 – 800,000+** | **100%** | **Nominal 14.5 – 17.5 MB Master GLB (Grade A Certified Standard)** |

---

## 3. Pillar 1: Kinematic Hierarchy & Isolated Local Pivots

### The Zero-World-Origin Anti-Pattern (STRICTLY PROHIBITED)
Applying transforms (`bpy.ops.object.transform_apply(location=True, rotation=True)`) to articulating components bakes vertex positions relative to $(0,0,0)$ world space. This destroys the local hinge axis, making rotation in Three.js distort or orbit around the car center.

### The Mandatory Relative Coordinate Rule
Articulating components MUST maintain their local object origin at the physical hinge axis or linear slide track:
1. **Never apply rotation or location transforms to child articulating parts** (`export_apply=False`).
2. Parent articulating parts to root frames or vehicle hardpoints (`parent_set(type='OBJECT', keep_transform=True)`).
3. The root object (`VEHICLE_ROOT` or `COMPONENT_MASTER`) holds world coordinates; child objects hold relative offsets.

### Mandatory Pivot Placement Registry

| Interactive Component | Hinge Type | Local Pivot Location | Motion Axis & Physical Bounds |
|:---|:---|:---|:---|
| **Seat Backrest Recline** | Rotational | Lower recliner bracket pin ($Z \approx 0.10\text{m}, Y \approx -0.08\text{m}$) | Local $+X$: $0^\circ$ to $+25.0^\circ$ (rearward recline) |
| **Seat Slider Track** | Linear Slide | Seat floor riser track center | Local $+Y$: $-0.16\text{m}$ to $+0.08\text{m}$ |
| **Headrest Extension** | Linear Slide | Stanchion collar escutcheon ($Z \approx 0.48\text{m}$) | Local $+Z$: $0.0\text{m}$ to $+0.06\text{m}$ lift |
| **Steering Wheel Rim** | Rotational | Steering column shaft center ($X = -0.380, Y = 0.440, Z = 0.680$) | Local $+Z$ (along column axis): $-90^\circ$ to $+90^\circ$ |
| **Paddle Shifter L/R** | Tactile Pull | Pivot pin at rear hub housing | Local Hinge: $-6.0^\circ$ pull towards driver |
| **Drive Mode Dial** | Indexed Rotary | Center of rotary potentiometer | Local $+Z$: 5 steps ($-40^\circ, -20^\circ, 0^\circ, +20^\circ, +40^\circ$) |
| **Butterfly Armrest Lids**| Dual Rotational | Left & Right outer longitudinal hinges | Local $\pm Y$: $0^\circ$ to $\pm 85^\circ$ butterfly open |
| **Cupholder Tambour Door**| Curvilinear Slide| Front edge of console recess | Local $-Y$: $0\text{mm}$ to $-120\text{mm}$ retracted |
| **Gear Selector Lever** | Stepped Rotational| Pivot bearing beneath console plate | Local $+X$: P ($+15^\circ$), R ($+7.5^\circ$), N ($0^\circ$), D ($-7.5^\circ$) |
| **Start/Stop Safety Gate** | Aircraft Hinge | Top horizontal hinge bar | Local $+X$: $0^\circ$ (down) to $+90^\circ$ (flipped vertical) |
| **Start/Stop Pushbutton** | Push Stroke | Button center | Local $-Z$: $0.0\text{mm}$ to $-3.5\text{mm}$ depression |
| **Glovebox Door** | Damped Hinge | Bottom pivot hinge | Local $-X$: $0^\circ$ to $-42.0^\circ$ drop |
| **Driver / Passenger Doors**| Compound Hinge | Front door pillar hinge pin | Local $+Z$: $0^\circ$ to $+65.0^\circ$ (or scissor/butterfly arc) |
| **Power Window Glass** | Linear Track | Inside door cassette channel | Local $-Z$: $0\text{mm}$ to $-460\text{mm}$ lowered |
| **Active Rear Spoiler / DRS**| Dual Strut Pivot| Rear trunk pedestal hinges | Local $+X$: $0^\circ$ (stowed) to $+38.0^\circ$ (high downforce / airbrake) |

---

## 4. Pillar 2: Baked glTF NLA Animation Actions

Every interactive option MUST be baked into Blender's NLA (Non-Linear Animation) tracks as an isolated named Action. When exported with `export_animations=True` and `export_animation_mode='ACTIONS'`, glTF creates discrete `AnimationClip` objects accessible via Three.js `AnimationMixer`:

### Universal Blender 4.x / 5.x Keyframing Standard
To avoid Blender 5.2 slotted action attribute errors (`AttributeError: 'Action' object has no attribute 'fcurves'`), use universal object-level keyframing:

```python
# 1. Clear any active animation
obj.animation_data_clear()

# 2. Insert rest keyframe at frame 0
obj.rotation_euler = (0.0, 0.0, 0.0)
obj.keyframe_insert(data_path="rotation_euler", frame=0)

# 3. Insert actuated keyframe at frame 30
obj.rotation_euler = (math.radians(25.0), 0.0, 0.0)
obj.keyframe_insert(data_path="rotation_euler", frame=30)

# 4. Name the resulting action and set interpolation
if obj.animation_data and obj.animation_data.action:
    action = obj.animation_data.action
    action.name = "Action_Seat_Recline"
    for fcurve in getattr(action, "fcurves", []):
        for kf in fcurve.keyframe_points:
            kf.interpolation = 'BEZIER'
            kf.easing = 'EASE_IN_OUT'
```

### Standard Action Naming Taxonomy
```text
Action_<Subsystem>_<Component>_<Movement>
Examples:
- Action_Seat_Driver_Recline
- Action_Seat_Driver_Slide
- Action_Steering_Wheel_Turn
- Action_Steering_Paddle_Shift_L
- Action_Console_Armrest_Open_L
- Action_Console_Shifter_PRND
- Action_Door_Driver_Open
- Action_Window_Driver_Lower
- Action_Spoiler_Aero_Airbrake
```

---

## 5. Pillar 3: Viscoelastic Soft Surface Deformation (Shape Keys / Morphs)

Mechanical hinges cannot represent viscoelastic leather squab compression, lateral bolster clamping, or tire contact patch squish. Morph targets (`shape_keys`) must be embedded:

```python
def add_soft_surface_morph(mesh_obj, key_name, vertex_displacement_fn):
    """Embeds a named morph target on a mesh without breaking topology."""
    if not mesh_obj.data.shape_keys:
        mesh_obj.shape_key_add(name="Basis")
    
    key = mesh_obj.shape_key_add(name=key_name)
    key.value = 0.0  # Default rest state
    
    # Apply parametric displacement
    for idx, vert in enumerate(mesh_obj.data.vertices):
        dx, dy, dz = vertex_displacement_fn(vert.co.x, vert.co.y, vert.co.z)
        key.data[idx].co = (vert.co.x + dx, vert.co.y + dy, vert.co.z + dz)
    return key
```

### Standard Morph Keys
1. **`Key_Bolster_Hug`**: Inward lateral squeeze ($25\text{mm}$) of seat side bolsters when sport/track mode is engaged.
2. **`Key_Lumbar_Inflate`**: Forward swell ($20\text{mm}$) of lower lumbar pad for ergonomic adjustment.
3. **`Key_Cushion_Occupant_Load`**: Downward indentation ($-18\text{mm}$) simulating driver seating mass.
4. **`Key_Tire_Contact_Patch`**: Bottom contact flattening ($12\text{mm}$) under vehicle curb weight load.

---

## 6. Pillar 4: Raycast Collision Hitboxes (`HITBOX_*`)

### The 400,000 Polygon Raycasting Problem
Raycasting directly against a 460,000-triangle Class-A CAD mesh on every mouse move or touch event drops framerates to single digits. 

### The Solution: Ultra-Low-Poly Semantic Hitboxes
Every articulating or clickable component MUST include a dedicated invisible or wireframe collision hull prefixed with `HITBOX_`:
- Box or cylindrical primitive (**12 to 36 triangles total**).
- Scaled slightly larger than the visual component ($+5\text{mm}$ offset) for easy targeting on mobile screens.
- Assigned an invisible material (`Alpha = 0.0` or `transmission = 1.0, roughness = 1.0`).
- Exported as child of the articulating node so it moves synchronously with the visual geometry.

```python
def create_raycast_hitbox(parent_obj, name, dimensions, location_offset):
    """Creates a lightweight collision hull for microsecond raycasting."""
    bpy.ops.mesh.primitive_cube_add(size=1.0)
    hitbox = bpy.context.active_object
    hitbox.name = f"HITBOX_{name}"
    hitbox.dimensions = dimensions
    hitbox.location = location_offset
    hitbox.parent = parent_obj
    
    # Custom property tagging for WebGL engine
    hitbox["is_hitbox"] = True
    hitbox["target_parent"] = parent_obj.name
    return hitbox
```

---

## 7. Pillar 5: glTF `extras` Self-Describing Metadata Schema

Every interactive node in Blender must have custom properties assigned. When exported with `export_extras=True`, these properties appear in `node.extras` (Three.js `node.userData`):

```json
{
  "interactive": true,
  "component_id": "seat_driver",
  "option_id": "seat_recline",
  "label": "Seat Recline Angle",
  "category": "interior_ergonomics",
  "control_type": "slider",
  "unit": "deg",
  "min": 0.0,
  "max": 25.0,
  "default": 0.0,
  "action_name": "Action_Seat_Recline",
  "hitbox": "HITBOX_Seat_Recline_Switch",
  "sound_fx": "servo_seat_motor_whir",
  "morph_key": null
}
```

### Supported Control Types
- `"slider"`: Continuous scalar adjustment (seat track, steering tilt, window height).
- `"toggle"`: Two-state binary toggle (door open/close, armrest open/close, safety flip gate).
- `"stepped"`: Multi-position discrete detents (gear selector P-R-N-D, Manettino drive mode dial).
- `"trigger"`: Momentary tactile click (paddle shifter up/down, start button press, horn).
- `"color_variant"`: `KHR_materials_variants` leather/paint selection.

---

## 8. The 5-Modifier Class-A Geometry Amplification Pipeline

To generate **420,000 – 500,000 triangles** of authentic Class-A CAD surfacing with zero faceting and razor-sharp highlights:

```python
def apply_automotive_geometry_pipeline(obj, subsurf_levels=2, bevel_width=0.003):
    """Applies the mandatory 5-modifier amplification pipeline."""
    # Step 1: Vertex Welding (Eliminates coincident CAD export seams)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.remove_doubles(threshold=0.0005)
    bpy.ops.object.mode_set(mode='OBJECT')
    
    # Step 2: Shade Smooth by Angle (Blender 4.1+)
    if hasattr(obj.data, "shade_smooth_by_angle"):
        obj.data.shade_smooth_by_angle(math.radians(35))
    else:
        obj.data.use_auto_smooth = True
        obj.data.auto_smooth_angle = math.radians(35)
        
    # Step 3: Catmull-Clark Subdivision (Quad control cage amplification)
    if subsurf_levels > 0:
        sub = obj.modifiers.new("Subsurf", "SUBSURF")
        sub.levels = subsurf_levels
        sub.render_levels = subsurf_levels
        sub.subdivision_type = 'CATMULL_CLARK'
        
    # Step 4: Angle-Limited Bevel Modifier (3.0mm highlight rolloff)
    bev = obj.modifiers.new("Bevel", "BEVEL")
    bev.width = bevel_width
    bev.segments = 2
    bev.limit_method = 'ANGLE'
    bev.angle_limit = math.radians(38.0)
    bev.use_clamp_overlap = True
    
    # Step 5: Weighted Normal Modifier (Prevents specular distortion across seams)
    wn = obj.modifiers.new("WeightedNormal", "WEIGHTED_NORMAL")
    wn.keep_sharp = True
```

---

## 9. Mandatory Blender glTF Export Settings

When exporting any interactive automotive asset, ALWAYS invoke `bpy.ops.export_scene.gltf` with these precise flags:

```python
bpy.ops.export_scene.gltf(
    filepath=out_glb_path,
    export_format='GLB',
    export_extras=True,                      # MANDATORY: Exports interactive metadata dictionary
    export_animations=True,                  # MANDATORY: Exports baked kinematic NLA actions
    export_animation_mode='ACTIONS',         # MANDATORY: Exports discrete named action clips
    export_morph=True,                       # MANDATORY: Exports shape keys for soft surfaces
    export_morph_normal=True,                # Preserves lighting on deformed surfaces
    export_morph_animation=True,
    export_apply=False,                      # CRITICAL MANDATORY: Preserves local hinge pivot positions
    export_yup=True,                         # Three.js coordinate alignment
    export_materials='EXPORT',               # Exports PBR shaders and extensions
    export_draco_mesh_compression_enable=False # Preserves interactive vertex access
)
```

---

## 10. Automated Grade A Verification Sequence

Every generated GLB must pass the strict production gate:

```bash
# 1. Verify strict Grade A (≥90% score, 13.5MB - 16.5MB, 420k - 500k triangles)
python .agents/skills/glb-15mb-quality-standard/scripts/validate_glb_quality.py <model.glb> --strict-a

# 2. Verify TypeScript Compilation (Zero Type Errors)
npx tsc --noEmit -p tsconfig.app.json

# 3. Verify Modular Vehicle Simulation Test Suite
npx tsx src/sim/modularVehicle/runTests.ts
```
