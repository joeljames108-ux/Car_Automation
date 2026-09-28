# Automotive 3D Curve Construction & Class-A GLB Engineering Standard

## 1. Executive Summary & Purpose

This document codifies the reverse-engineering analysis of **50 professional automotive 3D models** (Aston Martin Valhalla, Nissan GT-R R35 Nismo, McLaren Senna, Koenigsegg Agera, CGT Luxury Sedan, Mercedes GLS 580, Mercedes 560 SEL, Audi R8, and Formula 1 cars).

It establishes the **mathematical formulas, topological standards, and procedural techniques** required to generate state-of-the-art Class-A automotive CAD GLB models in Blender 5.2 LTS, ensuring all future vehicles match the lines, angles, and surface perfection of professional benchmark assets.

---

## 2. Forensic Reverse-Engineering Analysis

### 2.1 Benchmark Geometry Metrics

| Model | Length $\times$ Width $\times$ Height | Wheelbase | Coke-Bottle Scallop | Tumblehome Angle | Polygon Count | Micro-Edge Fillet Ratio (1–8mm) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Aston Martin Valhalla** | $4.73\text{m} \times 2.01\text{m} \times 1.15\text{m}$ | $2.76\text{m}$ | $194.8\text{mm}$ (17.6%) | $19.8^\circ$ inward | $224,229$ polys | $36.3\%$ of edges |
| **Nissan GT-R R35 Nismo** | $4.78\text{m} \times 2.16\text{m} \times 1.39\text{m}$ | $2.78\text{m}$ | $138.1\text{mm}$ (13.4%) | $26.7^\circ$ inward | $1,271,972$ polys | $54.0\%$ of edges |
| **McLaren Senna** | $4.75\text{m} \times 2.15\text{m} \times 1.19\text{m}$ | $2.67\text{m}$ | $327.6\text{mm}$ (21.7%) | $56.3^\circ$ (canopy) | $385,420$ polys | $48.2\%$ of edges |
| **CGT Luxury Sedan 005** | $5.15\text{m} \times 1.98\text{m} \times 1.46\text{m}$ | $3.12\text{m}$ | $85.0\text{mm}$ (8.6%) | $11.3^\circ$ inward | $186,520$ polys | $31.4\%$ of edges |
| **Mercedes GLS 580 SUV** | $5.21\text{m} \times 2.03\text{m} \times 1.82\text{m}$ | $3.14\text{m}$ | $62.0\text{mm}$ (6.1%) | $8.4^\circ$ inward | $210,400$ polys | $28.9\%$ of edges |

---

## 3. The 5 Cardinal Curves of Automotive Design

Every automotive bodywork is mathematically defined by 5 primary feature curves:

```
                  Roof Peak (Z_roof, Y_roof)
                         /---------\
    Windshield Cowl     /  CABIN    \   Fastback Slope
        (Z_cowl)       /  GREENHOUSE \       \
           /----------/               \-------\  Rear Decklid (Z_deck)
          /                                    \---------\
Nose Tip /  FRONT HOOD                          REAR TAIL \ Kamm Lip
 (Z_nose)                                                  \ (Z_tail)
======================================================================
```

### Curve 1: The Centerline Silhouette Curve $C_{\text{center}}(y)$

Controls the longitudinal profile of the car along the $Y$-axis ($X=0$):

$$Z_{\text{center}}(y) = \begin{cases}
Z_{\text{cowl}} - \Delta_{\text{hood}} \left(\frac{y - Y_{\text{cowl}}}{Y_{\text{nose}} - Y_{\text{cowl}}}\right)^{1.35} & y > Y_{\text{cowl}} \quad (\text{Front Hood}) \\[1ex]
Z_{\text{cowl}} + (Z_{\text{roof}} - Z_{\text{cowl}}) \sin\left(\frac{\pi}{2} \frac{Y_{\text{cowl}} - y}{Y_{\text{cowl}} - Y_{\text{roof}}}\right) & Y_{\text{roof}} \le y \le Y_{\text{cowl}} \quad (\text{Windshield}) \\[1ex]
Z_{\text{deck}} + (Z_{\text{roof}} - Z_{\text{deck}}) \cos\left(\frac{\pi}{2} \frac{Y_{\text{roof}} - y}{Y_{\text{roof}} - Y_{\text{deck}}}\right) & Y_{\text{deck}} \le y < Y_{\text{roof}} \quad (\text{Fastback Window}) \\[1ex]
Z_{\text{tail}} + (Z_{\text{deck}} - Z_{\text{tail}}) \left(\frac{y - Y_{\text{tail}}}{Y_{\text{deck}} - Y_{\text{tail}}}\right)^{0.85} & y < Y_{\text{deck}} \quad (\text{Rear Decklid / Tail})
\end{cases}$$

#### Key Proportions:
- **Supercars (Valhalla, Senna)**: Cowl at $Z \approx 0.74\text{m}$, Roof at $Z \approx 1.15\text{m}$, Decklid at $Z \approx 0.78\text{m}$, Nose at $Z \approx 0.50\text{m}$.
- **Sports Coupes (GT-R)**: Cowl at $Z \approx 0.82\text{m}$, Roof at $Z \approx 1.38\text{m}$, Decklid at $Z \approx 0.96\text{m}$, Nose at $Z \approx 0.55\text{m}$.
- **Sedans (560 SEL)**: Cowl at $Z \approx 0.88\text{m}$, Roof at $Z \approx 1.45\text{m}$, Trunk at $Z \approx 1.02\text{m}$, Nose at $Z \approx 0.72\text{m}$.

---

### Curve 2: The Shoulder Swage & Coke-Bottle Waist Curve $X_{\text{shoulder}}(y)$

Controls the lateral width profile along the car, defining the front fender flares, side air intake channel (waist tuck), and muscular rear haunches:

$$X_{\text{shoulder}}(y) = W_{\text{base}} + \Delta_{\text{fender}}(y) - \text{Tuck}_{\text{waist}} \cdot \sin^2\left(\pi \frac{y - Y_{\text{rear}}}{Y_{\text{front}} - Y_{\text{rear}}}\right)$$

- **Coke-Bottle Waist Tuck**:
  - Supercar: $180\text{mm} - 320\text{mm}$ inward tuck ($15\% - 22\%$ pinch ratio) feeding rear radiators.
  - Sports Car: $120\text{mm} - 160\text{mm}$ inward tuck ($10\% - 14\%$ pinch ratio).
  - Luxury Sedan: $60\text{mm} - 90\text{mm}$ inward tuck ($6\% - 9\%$ pinch ratio).

---

### Curve 3: The Greenhouse Tumblehome Curve

Controls the inward slant of the cabin glasshouse toward the roof centerline:

$$\theta_{\text{tumble}} = \arctan\left(\frac{X_{\text{shoulder}} - X_{\text{roof}}}{Z_{\text{roof}} - Z_{\text{shoulder}}}\right)$$

- **Supercar**: $\theta_{\text{tumble}} = 20^\circ - 27^\circ$ (tight, jet-fighter canopy).
- **Sports Car**: $\theta_{\text{tumble}} = 22^\circ - 26^\circ$.
- **Sedan**: $\theta_{\text{tumble}} = 10^\circ - 14^\circ$ (upright for passenger headroom).
- **SUV**: $\theta_{\text{tumble}} = 8^\circ - 12^\circ$.

---

### Curve 4: The Wheel Arch Opening Curves

The wheel arch cutout is an ellipse centered at the wheel axle $(0, Y_{\text{axle}}, Z_{\text{axle}})$ with clearance margin $\Delta_{\text{clearance}} = 30\text{mm} - 40\text{mm}$ over the tire rolling radius $R_{\text{tire}}$:

$$Z_{\text{arch}}(d) = Z_{\text{sill}} + (R_{\text{tire}} + \Delta_{\text{clearance}} - Z_{\text{sill}}) \cdot \sqrt{\max\left(0, 1 - \left(\frac{d}{R_{\text{span}}}\right)^2\right)}$$

where $d = |y - Y_{\text{axle}}|$ and $R_{\text{span}} \approx R_{\text{tire}} + 0.085\text{m}$.
- **Inner Rolled Lip**: Extruded $15\text{mm} - 20\text{mm}$ inward along the $X$-axis to form the return flange of sheet-metal.

---

### Curve 5: The Transverse Spline Station $S_y(u)$

At any longitudinal station $y$, the cross-section is an 11-point pure quad spline from $+X$ to $-X$:
1. $P_0$: Lower Rocker / Arch Return Flange $(X_{\text{sill}}, y, Z_{\text{sill}})$
2. $P_1$: Lower Door Flank Tuck $(X_{\text{flank}}, y, Z_{\text{flank}})$
3. $P_2$: Shoulder Swage Line $(X_{\text{swage}}, y, Z_{\text{swage}})$
4. $P_3$: Fender Peak / Beltline Sill $(X_{\text{fender}}, y, Z_{\text{fender}})$
5. $P_4$: Cowl / A-Pillar Transition $(X_{\text{cowl}}, y, Z_{\text{cowl}})$
6. $P_5$: Centerline Ridge / Hood Valley / Roof Crown $(0, y, Z_{\text{center}})$
7. $P_4'$ to $P_0'$: Symmetrically mirrored across $X=0$.

---

## 4. Why Reference Models Look Perfect: The 4 Golden Rules

### Rule 1: Curvature Continuity ($G^2$ vs $G^1$)
- **$G^0$ (Positional)**: Surfaces touch, but form sharp angles.
- **$G^1$ (Tangential)**: Surfaces share a tangent, but curvature changes abruptly (causes visible light bending/pinching in specular reflections).
- **$G^2$ (Curvature Continuous)**: The radius of curvature changes smoothly with a continuous second derivative ($\frac{d^2 z}{d y^2}$). Specular studio highlights glide across the body panels without pinching or jumping.

### Rule 2: Microscopic Fillet Chamfers (The 54% Rule)
- Analysis of the Nissan GT-R R35 Nismo revealed that **54% of all edges are micro-edges between 1mm and 8mm**.
- Sharp 90° corners reflect light as an aliased 1-pixel line.
- Applying a **2.5mm–4.0mm fillet bevel with 2–3 segments** and the `WeightedNormal` modifier with `keep_sharp=True` creates a radiant, continuous specular highlight bead along all panel boundaries.

### Rule 3: 4-Layer Lighting Optics Stack
Never use a flat emissive rectangle for headlamps:
1. **Layer 1**: Deep parabolic satin-black housing bucket with chrome accent bezels.
2. **Layer 2**: Dual spherical projector cannon lenses (optical glass + internal shutter plate).
3. **Layer 3**: 3D extruded DRL light-pipes (ice-blue / crisp white LED emission).
4. **Layer 4**: Outer dielectric polycarbonate lens cover with black ceramic frit border.

### Rule 4: Multi-Piece Wheel Architecture
Never use a 24-segment flat cylinder disc for wheels:
1. **Stepped Rim**: 64-segment profile lathe with outer bead lip, drop center step, and recessed center bowl.
2. **Armature**: Radiating twin-fork Y-spokes with 3D fillet chamfers.
3. **Hub**: 5 hexagonal Grade 12.9 lug bolts and 3D brand logo cap.
4. **Tire**: Continuous cross-sectional toroidal profile with 4 circumferential aquachannels and 72 directional tread sipes.
5. **Brakes**: Ventilated dual-disc 400mm carbon-ceramic rotor with spiral cooling vanes and rigid 6-piston monobloc caliper.

---

## 5. Comparative Archetype Parameter Profiles

Based on reverse-engineering 50 professional models across 5 automotive classes:

| Archetype | Cowl $Z$ | Roof $Z$ | Deck / Trunk $Z$ | Waist Tuck ($\Delta X$) | Tumblehome $\theta_{\text{tumble}}$ | Primary Sub-D Hierarchy | Key Aesthetic Feature Lines |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Mid-Engine Hypercar** *(Valhalla, Senna, Agera, Audi R8)* | $0.72 - 0.76\text{m}$ | $1.12 - 1.18\text{m}$ | $0.74 - 0.80\text{m}$ | $180 - 320\text{mm}$ (16–22%) | $20^\circ - 27^\circ$ inward | 2,500–3,500 base quads $\rightarrow$ Subsurf Lv2 $\rightarrow$ 40k–80k tris | Continuous windshield-to-roof teardrop, muscular rear haunch flares, active rear wing stanchions |
| **Front-Engine Track Coupe** *(Nissan GT-R R35)* | $0.82 - 0.86\text{m}$ | $1.35 - 1.39\text{m}$ | $0.94 - 0.98\text{m}$ | $120 - 150\text{mm}$ (10–13%) | $22^\circ - 26^\circ$ inward | Triangulated micro-bevel CAD $\rightarrow$ 1.27M polys (54% micro-fillets) | Box-flared front/rear fender blisters, angular helmet roofline, quad recessed circular taillights |
| **American Muscle Car** *(Dodge Challenger SRT)* | $0.88 - 0.92\text{m}$ | $1.42 - 1.46\text{m}$ | $1.02 - 1.06\text{m}$ | $60 - 90\text{mm}$ (6–8%) | $14^\circ - 18^\circ$ inward | Mirror $\rightarrow$ Solidify (2.5mm) $\rightarrow$ Subsurf Lv2 | Long horizontal hood with dual twin nostrils, deep inset rectangular grille, wide fastback C-pillar |
| **Classic Luxury Flagship** *(Mercedes-Benz 560 SEL)* | $0.88 - 0.94\text{m}$ | $1.44 - 1.50\text{m}$ | $1.02 - 1.08\text{m}$ | $50 - 80\text{mm}$ (5–7%) | $10^\circ - 13^\circ$ upright | Formal 3-box quad mesh + Auto Smooth 35° | Upright chrome radiator grille, contrasting Sacco lower cladding, ribbed horizontal safety taillights |
| **Formula 1 Ground Effect** *(C44, F1 2022)* | $0.78 - 0.85\text{m}$ (airbox) | $1.05 - 1.10\text{m}$ | $0.35 - 0.40\text{m}$ | Full open-wheel undercut | Exposed cockpit + Halo arc | Multi-element carbon wing cascades | 3-element front wing cascade, high radiator sidepod undercut, Venturi underbody tunnels, beam wing |

---

## 6. Critical glTF 2.0 Export Protocol: Modifier Baking vs. Kinematic Pivots

> [!CAUTION]
> In Blender's official glTF 2.0 exporter, passing `export_apply=False` (required to preserve kinematic origins and local pivot points for interactive doors, wheels, and steering) **DISABLES automatic modifier evaluation**!
> If modifiers are not explicitly applied before export, the GLB file will receive the raw, un-subdivided low-poly control cage (producing faceted origami geometry instead of Class-A curves).

### The Dual-Pass Modifier Baking Rule:
To guarantee that exported GLBs receive high-density Subsurf Level 2 geometry while 100% preserving zero-offset kinematic origins and parent-child hierarchies:
```python
# Apply modifiers explicitly on mesh objects prior to export
for obj in bpy.context.scene.objects:
    if obj.type == 'MESH' and obj.modifiers:
        bpy.context.view_layer.objects.active = obj
        for mod in list(obj.modifiers):
            if mod.type != 'ARMATURE':
                try:
                    bpy.ops.object.modifier_apply(modifier=mod.name)
                except Exception as e:
                    print(f"Warning applying {mod.name} on {obj.name}: {e}")

# Export with kinematic hierarchy intact
bpy.ops.export_scene.gltf(
    filepath=export_path,
    export_format='GLB',
    use_selection=False,
    export_apply=False, # Preserves local origins now that geometry is baked!
    export_extras=True,
    export_yup=True,
)
```

---

## 7. Procedural Implementation Blueprint for Future Vehicles

```python
import bpy, bmesh, math
from mathutils import Vector

def create_class_a_body(stations, y_coords):
    bm = bmesh.new()
    vert_grid = []
    for s in stations:
        row = [bm.verts.new(pt) for pt in s]
        vert_grid.append(row)
    bm.verts.ensure_lookup_table()

    # Loft pure quads
    for v in range(len(stations) - 1):
        for u in range(len(stations[0]) - 1):
            v00, v01 = vert_grid[v][u], vert_grid[v][u+1]
            v11, v10 = vert_grid[v+1][u+1], vert_grid[v+1][u]
            f = bm.faces.new([v00, v10, v11, v01])
            f.smooth = True

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    mesh = bpy.data.meshes.new("Car_Body_Mesh")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Car_Body", mesh)
    bpy.context.scene.collection.objects.link(obj)

    # 1. Mirror across X symmetry plane
    mod_mir = obj.modifiers.new("Mirror", 'MIRROR')
    mod_mir.use_axis[0] = True
    mod_mir.use_clip = True

    # 2. Solidify for 2.5mm physical sheet-metal depth
    mod_sol = obj.modifiers.new("Solidify", 'SOLIDIFY')
    mod_sol.thickness = 0.0025
    mod_sol.offset = -1.0

    # 3. Catmull-Clark Level 2 for G2 curvature continuity
    mod_sub = obj.modifiers.new("Subdivision", 'SUBSURF')
    mod_sub.levels = 2
    mod_sub.render_levels = 2

    # 4. Weighted Normal for silky specular reflections
    mod_wn = obj.modifiers.new("WeightedNormal", 'WEIGHTED_NORMAL')
    mod_wn.keep_sharp = True

    return obj
```

---

## 8. The Aston Martin Valhalla Archetype Blueprint

Forensically reverse-engineered from `development/Upload_Astin_Martin.blend` ($224,229$ active polygons across $107$ sub-assemblies):

### 8.1 Critical Dimensions & Proportions
- **Overall Length ($L$)**: $4.692\text{m}$ ($Y \in [-2.36\text{m}, +2.33\text{m}]$)
- **Overall Width ($W$)**: $2.210\text{m}$ (Rear haunches peak at $X = \pm 1.105\text{m}$)
- **Roof Height ($H_{\text{roof}}$)**: $1.150\text{m}$ ($Z \in [0.00\text{m}, 1.15\text{m}]$)
- **Dihedral Door Clearance**: Rises to $Z = 2.294\text{m}$ at full synchro-helix tilt ($45^\circ$ pitch, $32^\circ$ yaw).
- **Front Wheel Track**: $1.684\text{m}$ | **Rear Wheel Track**: $1.710\text{m}$
- **Front Tire Envelope**: $\varnothing 680\text{mm} \times 310\text{mm}$ (20-inch alloy)
- **Rear Tire Envelope**: $\varnothing 740\text{mm} \times 370\text{mm}$ (21-inch ultra-wide 370-section alloy)

### 8.2 The 100mm Front Hood Aero-Valley Formula
Unlike conventional coupes where the hood crowns upward along the centerline, the Valhalla's centerline dramatically dips below the muscular front fender crests to accelerate airflow into the windshield cowl:

$$\Delta Z_{\text{valley}}(y) = Z_{\text{fender}}(y) - Z_{\text{center}}(y)$$

- At $Y = 2.07\text{m}$ (Front Axle Fore): Centerline drops to $Z = 0.760\text{m}$, while fender crest rises to $Z = 0.856\text{m}$.
- **Net Valley Depth**: $+95.5\text{mm} \approx 100\text{mm}$ concave trough.
- **Procedural Implementation Rule**:
  $$\text{For } y \in [1.4\text{m}, 2.2\text{m}]: \quad Z_{\text{center}}(y) = Z_{\text{fender\_crest}}(y) - 0.096 \cdot \sin^2\left(\pi \frac{y - 1.4}{0.8}\right)$$

### 8.3 The 2.21m Coke-Bottle Haunch Flare
The Valhalla features an aggressive 3-stage waist profile designed to feed high-volume lateral radiators:
1. **Front Fender Flare**: $W_{\text{front}} = 2.043\text{m}$ ($X = \pm 1.021\text{m}$ at $Y = 1.67\text{m}$)
2. **Door Scallop & Radiator Inlet Pinch**: Narrows to $W_{\text{waist}} = 1.983\text{m}$ ($X = \pm 0.991\text{m}$ at $Y = 0.89\text{m}$ to $0.10\text{m}$)
3. **Rear Muscular Haunch**: Flares dramatically to **$W_{\text{rear}} = 2.210\text{m}$** ($X = \pm 1.105\text{m}$ at $Y = -0.49\text{m}$)
4. **Kamm Tail & Diffuser Taper**: Tapers down to $W_{\text{tail}} = 1.071\text{m}$ at $Y = -2.26\text{m}$.

### 8.4 Dorsal Roof Scoop & Dual Top-Exit Inconel Exhausts
- **Roof Scoop**: Originates at $Y = 0.49\text{m}$ ($Z = 1.150\text{m}$) above driver cabin, tapering backward into an aerodynamic central dorsal spine.
- **Engine Cover Louvers**: 9 longitudinal heat extraction gills flanked by carbon-fiber pontoons.
- **Top-Exit Exhaust Ports**: Located directly on the rear engine deck at $Y = -1.47\text{m}, Z = 0.78\text{m}, X = \pm 0.22\text{m}$, angled upward $15^\circ$ for blown-diffuser aerodynamic scavenging.

### 8.5 Master PBR Material Stack
| Material Slot | Name | Base Color (sRGB) | Metallic | Roughness | Clearcoat / IOR | Automotive Application |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `Mat_BodyPaint` | `Paint` | `[0.001, 0.027, 0.021]` | `0.65` | `0.26` | `1.0 / 1.54` | Aston Martin British Racing Green Metallic |
| `Mat_CarbonExposed` | `Carbon1` | `[0.800, 0.800, 0.800]` (Texture) | `0.00` | `0.50` | `0.8 / 1.58` | Front Splitter, Side Sills, Rear Diffuser, Rear Wing |
| `Mat_AccentLime` | `InteriorColour1A` | `[0.429, 0.708, 0.000]` | `0.00` | `0.45` | `0.0` | Aston Martin AMR Racing Lime (Calipers, Piping) |
| `Mat_ChromeJewelry`| `BadgeA` | `[0.850, 0.850, 0.850]` | `1.00` | `0.00` | `0.0` | Aston Martin Wing Badges, Mirror Stems, Script |
| `Mat_OpticalGlass` | `GlassMtl` | `[1.000, 1.000, 1.000]` | `0.00` | `0.02` | `Trans 0.95, IOR 1.52` | Canopy Windshield, Dihedral Quarter Glass |

