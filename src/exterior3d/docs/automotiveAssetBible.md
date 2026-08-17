# Master Automotive 3D Asset Bible & Production Standard

## 1. Executive Summary & Quality Benchmark

This specification establishes the production guidelines for all modular automotive 3D assets in the **Modular Vehicle Assembly System**. The benchmark quality standards are derived from real-world high-fidelity reference packages (Volvo P1800 Restomod Widebody, 2024 BYD Atto 3, and Rocket Bunny Nissan Silvia S15).

All vehicle assets must be original designs adhering to the strict architectural, geometric, material, texturing, and modular socket requirements detailed below.

---

## 2. Global Coordinate System & Scale Conventions

All 3D models and procedural geometry must share an identical coordinate frame:

| Parameter | Specification |
|---|---|
| **Unit System** | Metric (1.0 Three.js unit = 1.0 meter; sub-millimeter precision in internal solvers) |
| **Origin $(0,0,0)$** | Vehicle Centerline ($X=0$), Ground Plane ($Y=0$), Mid-Wheelbase ($Z=0$) or Front Axle Reference ($Z=0$) |
| **Lateral Axis ($X$)** | $+X$ = Vehicle Right / Starboard, $-X$ = Vehicle Left / Port, $X=0$ = Longitudinal Centerline |
| **Vertical Axis ($Y$)** | $+Y$ = Upwards (Roof), $0.0$ = Ground Contact Patch, $-Y$ = Sub-ground Clearance |
| **Longitudinal Axis ($Z$)** | $+Z$ = Forward (Front Bumper), $-Z$ = Aft / Rearward (Rear Bumper) |
| **Symmetry Plane** | $YZ$-plane ($X=0$) is the mirror plane for bilateral components (arms, lights, fenders, doors) |

---

## 3. Hierarchical Level of Detail (LOD 1–6)

Assets must adhere to a strict detail hierarchy so that visual fidelity is concentrated where it matters most:

```
LEVEL 1: Major Silhouette & Aerodynamic Proportions
LEVEL 2: Primary Component Geometry & Panel Gaps (3.5 mm - 4.5 mm shut lines)
LEVEL 3: Mechanical Assembly & Structural Subframes (Tubular rails, shock towers, control arms)
LEVEL 4: Secondary Functional Details (Brake calipers, rotor vents, bolt flanges, exhaust tips)
LEVEL 5: PBR Material Layering (Clearcoat, roughness variation, metallic flaking, transmission)
LEVEL 6: Micro-Surface Relief (Normal maps: carbon weave, tire tread, leather grain, brushed metal)
```

---

## 4. Component Classification & Polygon Budgets

| Detail Class | Typical Components | Target Triangle Budget | Texture / Normal Priority |
|---|---|---|---|
| **HERO DETAIL** | Outer Body Panels, Wheels, Brakes, Engine Bay, Steering Wheel, Headlights, Dash | $40,000 - 120,000$ | $2048 \times 2048$ (Normal + AO + Roughness) |
| **FUNCTIONAL DETAIL** | Chassis Box Rails, Subframes, Suspension Arms, Transmission, Radiators, Exhaust | $15,000 - 45,000$ | $1024 \times 1024$ (Normal + Metal/Roughness) |
| **BACKGROUND DETAIL** | Floor Structure, Underbody Trays, Internal Wiring, Firewall Backing | $3,000 - 12,000$ | $512 \times 512$ or Procedural Shader |

---

## 5. Geometric Integrity & Automotive Engineering Realism

1. **No Primitive Placeholders**: Chassis members must not be simple elongated boxes; they must feature hydroformed contours, stamped reinforcement beads, crumple notches, and weld flanges.
2. **Believable Mechanical Packaging**:
   - Suspension wishbones must have realistic ball joints, bushings, and upright spindle geometry.
   - Brake calipers must show multi-piston cylinders, bridge bolts, fluid crossover pipes, and bleed nipples.
   - Brake rotors must include directional cooling vanes and chamfered cross-drilled holes.
   - Engine components must include valve covers, ignition coil packs, intake runners, fuel rails, and exhaust headers.
3. **No Mesh Artifacts**:
   - Clean topology with no non-manifold edges, T-junctions, inverted face normals, or zero-area triangles.
   - Consistent wall thickness on structural stamped sheet metal ($1.2 - 2.5\text{ mm}$ scaled).

---

## 6. Physical Material (PBR) Standards

Every vehicle component must use a physically valid PBR material:

- **Automotive Paint**: Multi-layer shader with Base Color, Metallic ($0.2 - 0.95$), Roughness ($0.05 - 0.45$), Clearcoat ($0.8 - 1.0$), Clearcoat Roughness ($0.02 - 0.08$), and Iridescence / Pearl flakes.
- **Dry / Wet Carbon Fiber**: Twill weave normal map, anisotropic highlight, Clearcoat ($0.0$ for dry, $0.9$ for wet gloss).
- **Cast Iron Brake Rotors**: Radial friction ring machining grooves, metallic ($0.85$), roughness ($0.35$), heat discoloration banding.
- **Anodized Calipers**: Billet aluminum metalness ($0.9$), low roughness ($0.15$), high saturation anodize tint.
- **Tire Rubber Compound**: Ultra-low metalness ($0.0$), high roughness ($0.82$), directional sidewall embossing normal map.
- **Optical Glass**: Transmission ($0.96$), IOR ($1.52$), roughness ($0.02$), attenuation color with green/blue UV tint.
- **Interior Nappa Leather**: Perforated center bolster normal map, satin sheen roughness ($0.68$), micro-wrinkle relief.

---

## 7. Master Socket & Attachment Protocol

All modular components must declare strict attachment metadata:

- **Parent Attachment Socket**: Target socket ID on the chassis or parent assembly (e.g. `ENGINE_MOUNT_FL`, `FRONT_SUSPENSION_L`, `DOOR_HINGE_FL`).
- **Local Transform Offset**: Position $[x,y,z]$ in meters and quaternion orientation $[x,y,z,w]$.
- **Fastener Specifications**: Fastener type (`M10_GRADE_10_9`, `M12_TITANIUM`, `CENTERLOCK_NUT`), quantity, and torque rating in $\text{N}\cdot\text{m}$.
- **Snapping Determinism**: Component must return to the exact same position across assemble/disassemble cycles.

---

## 8. Quality Gate Acceptance Criteria

Every asset must pass the automated 8-stage Quality Gate before being homologated into the production library:

$$\text{Asset Valid} \iff \sum_{i=1}^{8} \text{Gate}_i(\text{Asset}) = 8 \times \text{PASS}$$
