---
name: skill-for-seats
description: Automotive interior seating engineering skill. Formulates Class-A CAD procedural modeling, anatomical ergonomics (H-point, lumbar lordosis), leather softness physics (tuck-and-roll fluting, negative pull-down seam gutters), non-inverting recline kinematics, carbon monocoque shell cradle, headrest stanchions, power switchgear, PBR leather shaders, and dual-mode GLB export.
---

# Skill for Seats: Automotive Seating Engineering & Procedural Blender Standard

This skill establishes the **quantitative engineering standard, mathematical geometry algorithms, PBR material physics, and Blender MCP pipeline** for designing high-fidelity, Class-A luxury automotive seats.

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

## 2. Anatomical Ergonomics & Coordinate Space Standard

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

## 3. Mathematical Geometry of Tactile Leather "Softness"

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

## 4. Structural Monocoque Back Shell & Cradle Geometry

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

## 5. Headrest Assembly & Studio Viewport Framing

### Headrest Construction
- **Root Node**: Childed to `SEAT_Backrest_Pivot` at $Z = H_{\text{backrest}}$ ($0.62\text{m}$).
- **Stanchions**: Dual polished chrome cylinders ($14\text{mm}$ diameter, $X = \pm 0.075\text{m}$, extending from $Z = -0.01\text{m}$ inside the seat up into the headrest) with $24\text{mm}$ collar escutcheon rings.
- **Cushion Pillow**: Centered at $Z = 0.09\text{m}$ above the seat top ($260\text{mm}$ width, $150\text{mm}$ height, $95\text{mm}$ depth) with a crowned convex front dome ($+26\text{mm}$) meeting the cervical neck curve.

### Camera Framing Parameters
Because an automotive seat has a vertical aspect ratio ($Z \in [0.00, 0.98\text{m}]$), the camera target must be placed at the **geometric midpoint**:
- **Target Position**: `(0.0, -0.05, 0.48)` (targeting $Z = 0.48\text{m}$).
- **Lens**: 60mm prime lens, 36mm sensor.
- **Hero Front 3/4**: Camera at `(-1.60, 2.05, 1.05)`.
- **Side Profile**: Camera at `(-2.45, -0.05, 0.48)`.
- **Rear 3/4**: Camera at `(1.60, -2.05, 1.05)`.
- **Macro Softness**: Camera at `(-0.45, 0.65, 0.42)`, target `(0.0, 0.04, 0.20)`.

---

## 6. PBR Automotive Interior Material Matrix

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

## 7. Dual-Tier Delivery & Application Wiring Checklist

Whenever designing or upgrading an automotive seat:
1. **Procedural Model Generation**: Execute generator script via Blender MCP / `bpy`.
2. **Visual Verification Loop**: Render all 4 standardized viewpoints (`exports/seat_renders/`).
3. **Master CAD Export**: Save zero-offset master to `public/models/interior/<seat_name>.glb` and `exports/<seat_name>.glb`.
4. **Fast-Stream Meshopt Compression**: Run `node scripts/optimize_glb_delivery.mjs -i public/models/interior/<seat_name>.glb` to generate `<seat_name>.opt.glb` (typically $>75\%$ reduction with zero polygon decimation).
5. **Register in Application Registries**:
   - Add definition to `src/exterior3d/geometry/car3dGlbAssetRegistry.ts` (e.g. `INTERIOR_SEAT_...`).
   - Add seating specification to `src/exterior3d/manifests/interiorStudioCatalog.ts` (`SEATING_CATALOG`).
6. **Automated CI Validation**:
   - Verify 0 TypeScript errors: `npx tsc --noEmit -p tsconfig.app.json`
   - Verify unit test suite pass: `npx tsx src/sim/modularVehicle/runTests.ts`
