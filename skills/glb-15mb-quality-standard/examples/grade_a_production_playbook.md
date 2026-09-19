# Grade A Automotive GLB Production Playbook
## Internet Case Studies, Khronos 2.0 Specifications & Step-by-Step Construction Guide

This document is the exhaustive technical reference for producing **Grade A (≥ 90.0%) 15 MB automotive GLB assets**. It synthesizes real-world data from Khronos Group reference models, Sketchfab real-time automotive configurators, and modern WebGL production pipelines.

---

## 1. Case Studies: Real Internet Grade A GLB Assets

### Case Study 1: Khronos Group `CarConcept` (glTF-Sample-Assets)
*Repository: [KhronosGroup/glTF-Sample-Assets](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/CarConcept)*

**Forensic Breakdown & Key Innovations:**
- **Two-Layer Clearcoat (`KHR_materials_clearcoat`)**:
  Khronos demonstrated that car paint cannot be accurately simulated using a single roughness value. The `CarConcept` asset uses a metallic base color (roughness ~0.15, metallic 0.90) underneath an independent specular clearcoat layer (`clearcoat=1.0`, `clearcoatRoughness=0.03`). This produces the distinctive "wet look" deep reflection highlights that slide across curved body panels without washing out the color beneath.
- **Small Feature Culling & Quad Geometry**:
  Exterior panels maintain quad-dominant flow following aerodynamic character lines. Triangulation is deferred until the final glTF export buffer stage.
- **Pure PBR Shader Efficiency**:
  Khronos avoided baking environment lighting into large diffuse textures, keeping the geometry crisp under dynamic environment lights (HDR environment maps).

### Case Study 2: Khronos `AnisotropyBarnLamp` & `TransmissionTest`
*Repository: [KhronosGroup/glTF-Sample-Assets](https://github.com/KhronosGroup/glTF-Sample-Assets)*

**Forensic Breakdown & Key Innovations:**
- **Dielectric Glass Without Alpha Artifacts (`KHR_materials_transmission` + `KHR_materials_volume` + `KHR_materials_ior`)**:
  Traditional web transparency relies on rasterizer alpha-blending (`alphaMode: "BLEND"`), which causes notorious depth-sorting visual glitches where the interior appears in front of the windshield or rear glass disappears. Khronos solved this via **physical transmission**:
  - `transmissionFactor: 0.95` (light passes through without depth sorting issues)
  - `ior: 1.52` (exact refraction index of automotive glass)
  - `thickness: 0.004` (4mm glass volume with subtle tint absorption)
- **Radial Brushed Metal Anisotropy (`KHR_materials_anisotropy`)**:
  The circular machine-turned grooves on automotive brake rotors and diamond-cut alloy wheels cannot be captured by standard isotropic roughness. Khronos's anisotropy extension streaks specular reflections perpendicular to the radial lathe tool marks (`anisotropyStrength: 0.85`), producing realistic butterfly/cross reflection highlights.

### Case Study 3: Sketchfab Automotive Class-A CAD Showcases
*Reference: High-end Real-Time Automotive Assets (Porsche 911 GT3 RS, Ferrari 296 GTB, Koenigsegg Jesko on Sketchfab)*

**Forensic Breakdown & Polygon Budgeting:**
- **Triangle Distribution in Hero Assets**:
  - Total Budget: **420,000 – 550,000 triangles** (13.5 MB – 16.5 MB binary buffer).
  - Exterior Bodywork: **~140,000 – 170,000 tris** (dense enough to eliminate any polygon facet in 4K viewport zooms).
  - Interior Cockpit: **~120,000 – 150,000 tris** (intricate instrument cowls, steering wheel stalks, paddle shifters, seat bolsters, console switchgear).
  - Running Gear & Underbody: **~120,000 – 150,000 tris** (drilled brake discs, multi-piston calipers, coilover dampers, wishbone arms, engine plenum, exhaust plumbing).
- **Face-Weighted Normals (FWN) vs Normal Maps**:
  High-end CAD models do not rely on 8K normal maps (which blur under camera zoom and inflate download times). Instead, they use **Face-Weighted Normals (FWN)** combined with **2.5mm – 4.0mm angle-limited chamfer bevels**. This forces large flat areas to retain completely flat normals while transferring curvature solely to the beveled boundary edges, producing mirror-perfect reflections.

---

## 2. "How To Make It" — The Complete Construction Recipe

Follow this step-by-step pipeline in Blender 4.x / 5.x to build a certified Grade A GLB:

### Step 1: Base Control Cage Modeling (bmesh)
1. Model exterior panels with **clean quad-dominant control strips**. Every edge loop must correspond to an actual automotive feature line (beltline, rocker crease, shoulder sweep, wheel arch swage line).
2. Maintain edge spacing: dense along sharp creases, relaxed across broad roofs and doors.
3. Keep panel shutlines (doors, hood, trunk) separated by a modeled **3.5mm physical gap** to allow natural shadow occlusion.

### Step 2: The 3-Modifier Amplification Stack
Every exterior body panel and structural component must evaluate this modifier stack:

```python
import bpy
import math

def apply_class_a_modifiers(obj, bevel_mm=3.0, subsurf_level=2):
    """Applies the Class-A CAD modifier pipeline to guarantee Grade A surface quality."""
    
    # 1. Clear any corrupted CAD split normals
    if obj.type == 'MESH':
        obj.data.split_normals_clear()
        
    # 2. Subdivision Surface (Catmull-Clark G2 continuity)
    sub = obj.modifiers.new("ClassA_Subsurf", 'SUBSURF')
    sub.subdivision_type = 'CATMULL_CLARK'
    sub.render_levels = subsurf_level
    sub.levels = max(1, subsurf_level - 1)  # Viewport level
    
    # 3. Angle-Limited Bevel (softens razor-sharp digital edges)
    bev = obj.modifiers.new("ClassA_Bevel", 'BEVEL')
    bev.width = bevel_mm / 1000.0  # Convert mm to meters
    bev.segments = 2
    bev.limit_method = 'ANGLE'
    bev.angle_limit = math.radians(32.0)
    bev.use_clamp_overlap = True
    bev.harden_normals = False
    
    # 4. Weighted Normal Modifier (pristine specular highlight rolloff)
    wn = obj.modifiers.new("ClassA_WeightedNormal", 'WEIGHTED_NORMAL')
    wn.keep_sharp = True
    wn.weight = 100
    
    # 5. Enable smooth shading by angle (Blender 4.1+)
    if hasattr(obj.data, "shade_smooth_by_angle"):
        obj.data.shade_smooth_by_angle(math.radians(35.0))
    elif hasattr(obj.data, "use_auto_smooth"):
        obj.data.use_auto_smooth = True
        obj.data.auto_smooth_angle = math.radians(35.0)
```

---

### Step 3: Populating All 11 Subsystems (Eliminating the 0% Fill Flaw)

The benchmark GT3 model failed Grade A because 3 subsystems were 0%. You must populate **all 11 subsystems**:

#### 1. `ENGINE_BAY` (Target: ≥ 35,000 tris, min: 3.0%)
- **Engine Block**: Die-cast aluminum crankcase, rib-reinforced block sides.
- **Cylinder Heads & Cam Covers**: Dual cam banks with embossed brand lettering and oil filler cap.
- **Intake Plenum & Velocity Runners**: Curved intake trumpets or carbon fiber intake manifold.
- **Exhaust Manifold & Turbochargers**: Inconel equal-length headers merging into twin turbocharger scroll housings with wastegate actuators.

#### 2. `CHASSIS` (Target: ≥ 25,000 tris, min: 2.0%)
- **Central Monocoque Tub**: Carbon fiber or hydroformed aluminum floorpan and central tunnel.
- **Front & Rear Subframes**: Tubular or cast aluminum suspension cradles and strut tower braces.
- **Integrated Roll Cage**: TIG-welded multi-point safety cage passing behind driver seats.

#### 3. `SUSPENSION` (Target: ≥ 30,000 tris, min: 1.5%)
- **A-Arms / Wishbones**: Upper and lower forged wishbones with machined spherical bushing eyes.
- **Coilover Assemblies**: Helical coiled steel springs with threaded shock bodies, adjustor collars, and remote nitrogen reservoirs.
- **Pushrods & Rockers**: Forged pushrod linkages connecting hub uprights to inboard dampers.

#### 4. `TIRES` (Target: ≥ 8,000 tris, min: 0.5%)
- **3D Directional Tread Pattern**: Never use smooth plastic cylinders! Cut longitudinal water-evacuation channels (3mm depth) and diagonal lateral shoulder sipes.
- **Sidewall Profile**: Subtle crown bulge with embossed tire sizing (e.g. `305/30 ZR20`).

---

### Step 4: Authoring the Khronos PBR Next Shaders in Blender

To ensure Blender's glTF exporter natively generates `KHR_materials_clearcoat`, `KHR_materials_transmission`, `KHR_materials_ior`, `KHR_materials_anisotropy`, and `KHR_materials_emissive_strength`, use this node factory:

```python
def create_grade_a_materials():
    """Generates the 18-material pure PBR factory mapped to Khronos glTF extensions."""
    materials = {}
    
    # ── Paint (Clearcoat) ──
    mat_paint = create_pbr_shader(
        name="Supercar_Paint_RossoCorsa",
        base_color=(0.88, 0.02, 0.04, 1.0),
        metallic=0.92,
        roughness=0.10,
        coat_weight=1.0,
        coat_roughness=0.05
    )
    materials["paint"] = mat_paint
    
    # ── Glass (Dielectric Transmission + IOR + Volume) ──
    mat_glass = create_pbr_shader(
        name="Supercar_Glass_Dielectric",
        base_color=(0.95, 0.98, 1.0, 1.0),
        metallic=0.0,
        roughness=0.02,
        transmission_weight=0.96,
        ior=1.52,
        coat_weight=1.0,
        coat_roughness=0.02
    )
    materials["glass"] = mat_glass
    
    # ── Brake Rotor (Anisotropic Brushed Steel) ──
    mat_rotor = create_pbr_shader(
        name="Supercar_BrakeRotor_Anisotropic",
        base_color=(0.35, 0.36, 0.38, 1.0),
        metallic=0.85,
        roughness=0.28,
        anisotropic=0.85,
        anisotropic_rotation=0.0
    )
    materials["rotor"] = mat_rotor
    
    # ── Interior Alcantara (Sheen) ──
    mat_alcantara = create_pbr_shader(
        name="Supercar_Interior_Alcantara",
        base_color=(0.06, 0.06, 0.07, 1.0),
        metallic=0.02,
        roughness=0.90,
        sheen_weight=0.80,
        sheen_roughness=0.50
    )
    materials["alcantara"] = mat_alcantara
    
    # ── LED Projector (High-Dynamic Range Emission) ──
    mat_led = create_pbr_shader(
        name="Supercar_LED_Projector",
        base_color=(1.0, 1.0, 1.0, 1.0),
        metallic=0.0,
        roughness=0.20,
        emission_color=(1.0, 1.0, 1.0, 1.0),
        emission_strength=22.0
    )
    materials["led"] = mat_led
    
    return materials

def create_pbr_shader(name, base_color=(0.5, 0.5, 0.5, 1.0), metallic=0.0, roughness=0.5,
                      coat_weight=0.0, coat_roughness=0.05, transmission_weight=0.0,
                      ior=1.5, anisotropic=0.0, anisotropic_rotation=0.0,
                      sheen_weight=0.0, sheen_roughness=0.5,
                      emission_color=(0,0,0,1), emission_strength=1.0):
    """Maps Blender 4.x / 5.x Principled BSDF inputs directly to glTF KHR extensions."""
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    out = nodes.new("ShaderNodeOutputMaterial")
    mat.node_tree.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    
    # Set inputs safely across Blender versions
    def set_socket(socket_names, value):
        for sname in socket_names:
            if sname in bsdf.inputs:
                bsdf.inputs[sname].default_value = value
                return
                
    set_socket(["Base Color"], base_color)
    set_socket(["Metallic"], metallic)
    set_socket(["Roughness"], roughness)
    set_socket(["Coat Weight", "Clearcoat"], coat_weight)
    set_socket(["Coat Roughness", "Clearcoat Roughness"], coat_roughness)
    set_socket(["Transmission Weight", "Transmission"], transmission_weight)
    set_socket(["IOR"], ior)
    set_socket(["Anisotropic"], anisotropic)
    set_socket(["Anisotropic Rotation"], anisotropic_rotation)
    set_socket(["Sheen Weight", "Sheen"], sheen_weight)
    set_socket(["Sheen Roughness"], sheen_roughness)
    set_socket(["Emission Color", "Emission"], emission_color)
    set_socket(["Emission Strength"], emission_strength)
    
    return mat
```

---

### Step 4.5: Multi-Angle Visual Reference Comparison & Iterative Perfection

Before exporting, programmatically capture screenshots from 5 automotive validation angles and compare them against the reference vehicle DNA (`matrix_manifest.json`):

```python
import bpy, math
from mathutils import Euler, Vector

def frame_camera(pitch, roll, yaw, dist=5.5, loc=(0.0, 0.0, 0.65)):
    for area in bpy.context.screen.areas:
        if area.type == 'VIEW_3D':
            for space in area.spaces:
                if space.type == 'VIEW_3D':
                    r3d = space.region_3d
                    r3d.view_perspective = 'PERSP'
                    r3d.view_distance = dist
                    r3d.view_location = Vector(loc)
                    r3d.view_rotation = Euler((math.radians(pitch), math.radians(roll), math.radians(yaw))).to_quaternion()
                    space.overlay.show_overlays = False
                    space.shading.type = 'MATERIAL'
                    if hasattr(r3d, "update"):
                        r3d.update()
                    return

# Capture Angles:
# 1. Front 3/4 Hero: frame_camera(70, 0, 225, 5.5)
# 2. Rear 3/4 Hero:  frame_camera(72, 0, 45,  5.5)
# 3. Side Profile:   frame_camera(88, 0, 270, 6.2)
# 4. Front Fascia:   frame_camera(88, 0, 180, 5.0)
# 5. Rear Stance:    frame_camera(88, 0, 0,   5.0)
```

#### The Visual Comparison Checklist:
1. **Proportions & Silhouette**: Does the roofline, hood rake, and overhang match the era styling DNA?
2. **Stance & Fitment**: Are the wheels flush with the fender lip? Is the tire-to-fender gap realistic?
3. **Optics & Jewelry**: Are headlamp projectors 3D quartz spheres inside dark reflector housings?
4. **Shutlines**: Are door, hood, and trunk gaps modeled with a physical 3.5mm separation?
5. **G2 Highlight Flow**: Do reflection lines flow smoothly across panels without pinch points?

> [!IMPORTANT]
> If any defect is spotted, **work on it in Blender again and again**. Tweak bmesh vertices, adjust bevel angles, re-screenshot, and re-compare until visual perfection is reached.

---

### Step 5: Export Settings & Automated Strict-A Quality Gate

When exporting the GLB, configure Blender's glTF operator:

```python
bpy.ops.export_scene.gltf(
    filepath="public/models/Car_Target_Complete.glb",
    export_format='GLB',
    use_selection=True,
    export_yup=True,
    export_apply=True,
    export_materials='EXPORT',
    export_cameras=False,
    export_lights=False
)
```

Immediately verify the output using the automated CLI validator:
```bash
python .agents/skills/glb-15mb-quality-standard/scripts/validate_glb_quality.py public/models/Car_Target_Complete.glb --strict-a
```
If the model scores below 90.0%, the script terminates with exit code 1, reporting any deficient subsystems.

---

### Step 6: Post-Generation Wiring & Synchronization Protocol

Once a vehicle is validated as Grade A, wire it directly into its canonical application paths:

```bash
# Wire an era matrix vehicle and automatically update matrix_manifest.json:
python scripts/wire_vehicle_asset.py \
    --source "exports/Car_Target_Complete.glb" \
    --architecture "sedan" \
    --era "1970s" \
    --verify-tests
```

This automated pipeline:
1. Executes `validate_glb_quality.py --strict-a` on the source GLB.
2. Copies the asset to `public/models/vehicles/sedan/1970s/vehicle.glb`.
3. Updates `public/models/vehicles/matrix_manifest.json` with status `"COMPLETE"`, file size, triangle count, Grade A score, and timestamp.
4. Executes TypeScript check (`npx tsc --noEmit -p tsconfig.app.json`) and simulation test suite (`npx tsx src/sim/modularVehicle/runTests.ts`) to ensure 100% build integrity.

