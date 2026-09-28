---
name: skill-for-automotive-curve-and-topology-engineering
description: Automotive Class-A CAD curvature engineering, quad station lofting, G2 continuity, and reverse-engineering skill. Formulates the 5 Cardinal Curves, 54% micro-fillet rule, pre-export modifier baking protocol, multi-piece wheels, 4-layer lighting optics, and archetype parameter profiles (Aston Martin Valhalla, Nissan GT-R R35, McLaren Senna, Audi R8).
---

# Skill for Automotive Curve, Topology & CAD Reverse-Engineering

This skill codifies the forensic reverse-engineering of 50 professional automotive 3D models (12.5M+ polygons analyzed across `development/`, including the Aston Martin Valhalla, Nissan GT-R R35 Nismo, McLaren Senna, Audi R8 V10, and Mercedes 560 SEL).

It establishes the **mathematical curve equations, topological quad-lofting rules, micro-fillet standards, and glTF modifier baking protocols** required to generate authentic Class-A automotive CAD GLB models in Blender 5.2 LTS.

---

## 1. The 4 Golden Rules of Automotive CAD Quality

### Rule 1: Curvature Continuity ($G^2$ Continuous Surfacing)
- **$G^0$ (Positional)**: Surfaces touch at an edge, but form an abrupt sharp angle.
- **$G^1$ (Tangential)**: Surfaces share a tangent, but curvature changes abruptly, causing visible light kinks in specular reflections.
- **$G^2$ (Curvature Continuous)**: Radius of curvature varies continuously with a smooth second derivative ($\frac{d^2z}{dy^2}$). Specular studio highlights glide across body panels without breaking or pinching.
- **Implementation**: Surfaces MUST be lofted using transverse quad stations with cubic/quintic Bezier interpolation, followed by Catmull-Clark Level 2 subdivision. Never stack primitive boxes.

### Rule 2: Microscopic Fillet Chamfers (The 54% Rule)
- Forensic edge analysis reveals that **54.0% of edges in professional CAD models (e.g. Nissan GT-R R35) are micro-edges between 1mm and 8mm**.
- Sharp 90° CAD corners reflect light as an aliased 1-pixel line.
- **Standard**: Apply a **2.5mm–4.0mm fillet bevel with 2–3 segments** and the `WeightedNormal` modifier with `keep_sharp=True`. This creates a radiant, continuous specular highlight bead along all panel boundaries.

### Rule 3: 4-Layer Lighting Optics Stack
Never use a flat emissive rectangle for headlamps:
1. **Layer 1 (Housing)**: Parabolic satin-black bucket contoured to the fender curve.
2. **Layer 2 (Projectors)**: Dual spherical projector cannon globes with chrome bezel rings.
3. **Layer 3 (DRL)**: 3D extruded LED light-pipe eyebrows (crisp white / golden amber emission).
4. **Layer 4 (Lens Cover)**: Flush dielectric polycarbonate lens cover ($T \approx 0.95$, IOR 1.52) with black ceramic frit border.

### Rule 4: Multi-Piece Wheel Architecture
Never use a 24-segment flat cylinder disc:
1. **Rim**: 64-segment profile lathe with stepped drop-center well and outer bead lip.
2. **Armature**: Radiating twin-fork Y-spokes with 3D fillet chamfers.
3. **Hub**: 5 hexagonal Grade 12.9 lug bolts placed at PCD 60mm + 3D brand logo cap.
4. **Tire**: Toroidal cross-section with 4 circumferential aquachannels and 72 directional tread sipes.
5. **Brakes**: Ventilated dual-disc 400mm carbon-ceramic rotor with 48 spiral vanes and rigid 6-piston monobloc caliper.

---

## 2. The 5 Cardinal Curves of Automotive Design

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

### Curve 1: The Centerline Silhouette Curve $Z_{\text{center}}(y)$
Controls the longitudinal profile along $Y$ at $X=0$:
$$Z_{\text{center}}(y) = \begin{cases}
Z_{\text{cowl}} - \Delta_{\text{hood}} \left(\frac{y - Y_{\text{cowl}}}{Y_{\text{nose}} - Y_{\text{cowl}}}\right)^{1.35} & y > Y_{\text{cowl}} \quad (\text{Front Hood}) \\[1ex]
Z_{\text{cowl}} + (Z_{\text{roof}} - Z_{\text{cowl}}) \sin\left(\frac{\pi}{2} \frac{Y_{\text{cowl}} - y}{Y_{\text{cowl}} - Y_{\text{roof}}}\right) & Y_{\text{roof}} \le y \le Y_{\text{cowl}} \quad (\text{Windshield}) \\[1ex]
Z_{\text{deck}} + (Z_{\text{roof}} - Z_{\text{deck}}) \cos\left(\frac{\pi}{2} \frac{Y_{\text{roof}} - y}{Y_{\text{roof}} - Y_{\text{deck}}}\right) & Y_{\text{deck}} \le y < Y_{\text{roof}} \quad (\text{Fastback Window}) \\[1ex]
Z_{\text{tail}} + (Z_{\text{deck}} - Z_{\text{tail}}) \left(\frac{y - Y_{\text{tail}}}{Y_{\text{deck}} - Y_{\text{tail}}}\right)^{0.85} & y < Y_{\text{deck}} \quad (\text{Rear Tail})
\end{cases}$$

### Curve 2: The Shoulder Swage & Coke-Bottle Waist Curve $X_{\text{shoulder}}(y)$
$$X_{\text{shoulder}}(y) = W_{\text{base}} + \Delta_{\text{fender}}(y) - \text{Tuck}_{\text{waist}} \cdot \sin^2\left(\pi \frac{y - Y_{\text{rear}}}{Y_{\text{front}} - Y_{\text{rear}}}\right)$$
- **Supercar / Hypercar**: $180\text{mm} - 320\text{mm}$ inward waist pinch ($16\% - 22\%$) feeding side radiators.
- **Track Sports Coupe**: $120\text{mm} - 160\text{mm}$ inward tuck ($10\% - 14\%$).
- **Luxury Sedan**: $60\text{mm} - 90\text{mm}$ inward tuck ($6\% - 9\%$).

### Curve 3: The Greenhouse Tumblehome Angle $\theta_{\text{tumble}}$
Inward slant of side glass toward roof centerline:
$$\theta_{\text{tumble}} = \arctan\left(\frac{X_{\text{shoulder}} - X_{\text{roof}}}{Z_{\text{roof}} - Z_{\text{shoulder}}}\right)$$
- **Supercar**: $20^\circ - 27^\circ$ (tight fighter-canopy).
- **Sedan**: $10^\circ - 14^\circ$ (upright for passenger ergonomics).

### Curve 4: Wheel Arch Cutouts & Rolled Return Flanges
Elliptical arch centered at wheel axle $(0, Y_{\text{axle}}, Z_{\text{axle}})$ with clearance $\Delta_{\text{clearance}} = 30\text{mm} - 40\text{mm}$:
$$Z_{\text{arch}}(d) = Z_{\text{sill}} + (R_{\text{tire}} + \Delta_{\text{clearance}} - Z_{\text{sill}}) \cdot \sqrt{\max\left(0, 1 - \left(\frac{d}{R_{\text{span}}}\right)^2\right)}$$
- **Mandatory**: Inner rolled hem flange extruded $15\text{mm} - 20\text{mm}$ inward along $X$ to eliminate paper-thin sheet-metal artifacts.

### Curve 5: Transverse Quad Station Spline $S_y(u)$
Lofted 11-point pure quad cross section:
$P_0$ (Rocker Flange) $\rightarrow$ $P_1$ (Flank Tuck) $\rightarrow$ $P_2$ (Swage Line) $\rightarrow$ $P_3$ (Fender Peak) $\rightarrow$ $P_4$ (A-Pillar Cowl) $\rightarrow$ $P_5$ (Centerline Ridge/Valley), mirrored symmetrically across $X=0$.

---

## 3. The Pre-Export Modifier Baking Protocol (Mandatory)

> [!CAUTION]
> In Blender's glTF 2.0 exporter, passing `export_apply=False` (required to preserve kinematic pivot points for doors, steering, and wheels) **DISABLES automatic modifier evaluation**!
> Unbaked modifiers result in raw low-poly control cages (0.36 MB) instead of Class-A subdivided CAD geometry (6.6+ MB).

### Standard Baking Sequence:
Prior to glTF export, explicitly evaluate and bake geometry modifiers on mesh objects while preserving armature rigs and local matrices:

```python
import bpy

# 1. Bake modifiers explicitly on all mesh objects
for obj in list(bpy.context.scene.objects):
    if obj.type == 'MESH' and obj.modifiers:
        bpy.context.view_layer.objects.active = obj
        for mod in list(obj.modifiers):
            # Keep armatures unbaked for interactive rigs
            if mod.type != 'ARMATURE':
                try:
                    bpy.ops.object.modifier_apply(modifier=mod.name)
                except Exception as e:
                    print(f"Warning baking {mod.name} on {obj.name}: {e}")

# 2. Export with kinematic local transforms preserved
bpy.ops.export_scene.gltf(
    filepath=export_path,
    export_format='GLB',
    use_selection=False,
    export_apply=False, # Preserves kinematic origins with baked high-poly geometry!
    export_extras=True,
    export_yup=True,
)
```

---

## 4. The Aston Martin Valhalla Archetype Blueprint

Extracted directly from forensic analysis of `development/Upload_Astin_Martin.blend`:

### 4.1 Master Parameters
- **Dimensions**: Length $4.692\text{m}$, Width $2.210\text{m}$, Height $1.150\text{m}$ (roof) / $2.294\text{m}$ (open doors).
- **Tire Setup**: Front $\varnothing 680\text{mm} \times 310\text{mm}$ (20"), Rear $\varnothing 740\text{mm} \times 370\text{mm}$ (21").

### 4.2 The 100mm Front Hood Aero-Valley
The front hood centerline plunges **$95.5\text{mm}$ below the fender crests**:
$$Z_{\text{center}}(y) = Z_{\text{fender\_crest}}(y) - 0.096 \cdot \sin^2\left(\pi \frac{y - 1.4}{0.8}\right) \quad \text{for } y \in [1.4\text{m}, 2.2\text{m}]$$
Channels incoming air between front wheel fenders, across cowl heat extractors, and over the canopy.

### 4.3 The 2.21m Coke-Bottle Haunch Flare
- Nose Splitter: $1.682\text{m}$ ($X = \pm 0.841\text{m}$)
- Front Fender Peak: $2.043\text{m}$ ($X = \pm 1.021\text{m}$)
- Waist Pinch & Radiator Inlet: $1.983\text{m}$ ($X = \pm 0.991\text{m}$)
- Rear Haunch Flare: **$2.210\text{m}$ ($X = \pm 1.105\text{m}$)**
- Diffuser Taper: $1.071\text{m}$ ($X = \pm 0.536\text{m}$)

### 4.4 Top-Exit Inconel Exhausts & Dorsal Central Spine
- Dual exhaust ports exit on top rear engine deck at $Y = -1.47\text{m}, Z = 0.78\text{m}, X = \pm 0.22\text{m}$, tilted $15^\circ$ upward for blown-diffuser aerodynamic scavenging.
- Continuous central dorsal spine extends from roof air scoop down the rear glass deck.

### 4.5 Master PBR Paint & Trim Palette
- **British Racing Green Metallic**: `RGB=[0.001, 0.027, 0.021]`, `Metallic=0.65`, `Roughness=0.26`, `Clearcoat=1.0`.
- **AMR Racing Lime Accents**: `RGB=[0.429, 0.708, 0.0]`, `Roughness=0.45` (Brake calipers, seat piping, diffuser pinstripe).
- **2x2 Twill Carbon**: `Roughness=0.50`, `Clearcoat=0.8`, `IOR=1.58` (Splitter, sills, diffuser, rear wing).
