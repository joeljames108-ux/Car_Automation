---
name: skill-for-automotive-interior-and-gadgets
description: Comprehensive automotive interior architecture, SAE ergonomic standards, human factor layout rules across all market budget segments, and procedural CAD recipes for 12 modern automotive cabin gadgets in Blender 5.x / Three.js.
---

# Automotive Interior Architecture & Interior Gadgets Engineering Standard

This skill establishes the comprehensive engineering standard for designing, modeling, packaging, and procedurally generating automotive interiors, cabin subsystems, and cockpit gadgets across all vehicle budget tiers.

---

## 1. Ergonomic Framework & SAE Human Factors Packaging

All cabin components must be modeled relative to standardized automotive packaging hardpoints derived from the Society of Automotive Engineers (SAE) standards:

```
                  +Z (Roof / Headlining)
                   ^
                   |    [Eye Ellipse SAE J941] (Z=1.12m, Y=0.0m)
                   |       \
                   |        O  Driver Eye Line
                   |       / \
    Instrument     |      /   \  [Steering Wheel Hub] (X=-0.38m, Y=0.44m, Z=0.68m)
    Cluster OLED   |     /     \
    (Y=0.65m)      |    [H-Point SAE J826] (X=-0.38m, Y=0.0m, Z=0.28m)
          \        |     \
           \       |      \--- Torso Angle (22°-25°)
            \      |       \
             \     |        [Heel Rest Point] (Y=0.88m, Z=0.05m)
              v    |         \
===================+==========v=======================> +Y (Firewall / Engine Bay)
                  [Chassis Floorpan] (Z = 0.00m)
```

### Mandatory Hardpoints & Tolerances (SAE Standards)
1. **H-Point (Hip Joint Pivot, SAE J826 / J4002)**:
   - Location: $X = -0.380\,\text{m}$ (LHD driver centerline), $Y = 0.000\,\text{m}$ (B-pillar reference plane), $Z = 0.280\,\text{m}$ (cushion depression level).
   - Seat Travel: Longitudinal slider travel $\pm 120\,\text{mm}$ ($\Delta Y$), vertical height adjustment $\pm 35\,\text{mm}$ ($\Delta Z$).
2. **Eye Ellipse (Driver Vision Center, SAE J941)**:
   - Center: $X = -0.380\,\text{m}$, $Y = -0.050\,\text{m}$, $Z = 1.120\,\text{m}$.
   - Upward Sightline: Minimum $11.0^\circ$ unobstructed vision to traffic lights.
   - Downward Sightline: Minimum $8.0^\circ$ over the hood/cowl to ground obstacle reference.
3. **Driver Reach Envelope (SAE J287)**:
   - Primary Controls (Steering, Shifter, Turn Indicators): Within $350\,\text{mm}$ of relaxed hand rest position.
   - Secondary Controls (Infotainment Dial, Climate, Hazard Switch): Within $550\,\text{mm}$ without requiring forward torso pitch beyond $10^\circ$.
4. **Pedal Ergonomics (SAE J1100)**:
   - Accelerator: Floor-hinged organ pedal ($15^\circ$ forward rake, $45\,\text{mm}$ depression stroke).
   - Brake: Hanging double-shear pedal with balance bar, $30\,\text{mm}$ forward of accelerator to prevent simultaneous depression.
   - Heel Point ($A_{40}$): Firm floor contact at $Y = +0.880\,\text{m}, Z = 0.050\,\text{m}$.

---

## 2. Automotive Market Budget Segment Specifications

| Budget Segment | Typical Vehicle Archetype | Target Interior Triangles | Material Stack | Signature Cabin Gadgets |
| :--- | :--- | :--- | :--- | :--- |
| **Budget City / Economy** | B-Segment Hatchback / Compact | 120,000 – 160,000 | Injection-molded polypropylene, textured cloth, satin plastic trim | Monostable mechanical PRND lever, 8" floating LCD, manual rotating dials |
| **Mainstream Family / EV** | C/D Crossover / Compact EV | 220,000 – 280,000 | Soft-touch slush-molded TPO, bio-leatherette, brushed aluminum accents | 14.5" curved central touchscreen, shift-by-wire rocker, dual Qi 15W charging pads |
| **Executive Luxury** | Full-Size Sedan / Grand Tourer | 380,000 – 480,000 | Semi-aniline Nappa leather, open-pore laser-cut walnut, knurled billet aluminum | Dual 12.3" OLED displays, crystal MMI dial, turbine vents with micro-OLEDs, 64-color ambient lightguides |
| **Track Supercar** | Mid-Engine GT3 / Hypercar | 300,000 – 380,000 | Prepreg dry carbon fiber (2x2 twill), Alcantara/Dinamica, titanium switchgear | Manettino drive-mode rotary dial, magnetic paddle shifters, telemetry display, carbon bucket shell |
| **Bespoke Ultra-Luxury** | V12 Coachbuilt / Flagship | 500,000 – 650,000 | Unsplit Boxmark leather, book-matched hand-sanded veneers, mother-of-pearl inlays | Jewel rotary pucks, analog tourbillon chronometer clock, hidden fold-out champagne bar |
| **Commercial / Utility** | Light Truck / Fleet Van | 90,000 – 130,000 | High-durability cross-linked ABS, rubberized floor mats, heavy-duty vinyl | Oversized glove-compatible tactile rocker switches, 12V high-amp power sockets, rubberized phone dock |

---

## 3. The 12 Modern Interior Gadget Blueprints

### 1. Curved OLED Driver Cluster & Infotainment Display
- **Geometry**: Quad grid $(32 \times 12)$ warped along cylindrical parabola ($z = -x^2 / (2 \cdot R_{\text{curve}})$ with $R = 2.8\,\text{m}$).
- **Bezel**: 2.5mm continuous satin titanium surround with 1.2mm chamfer.
- **Glass**: 1.1mm optical Gorilla Glass with anti-reflective/anti-fingerprint coat ($n = 1.51$, roughness 0.04, clearcoat 1.0).

### 2. Augmented Reality Head-Up Display (AR-HUD) Well
- **Cavity**: Inverted trapezoidal cowl in dashboard upper decking ($220 \times 140 \times 65\,\text{mm}$).
- **Combiner Mirror**: Asymmetric cold-mirror plate tilted $42^\circ$ forward with multi-layer dielectric anti-glare coating.
- **Flocking**: High-roughness light-absorbent velvet black material (roughness 0.85, base color `(0.015, 0.015, 0.018)`).

### 3. Knurled Aluminum Jewel MMI Controller
- **Ring**: 72-point diamond knurl pattern around $\varnothing 64\,\text{mm}$ puck.
- **Crown**: Polished optical crystal glass disk with capacitive touch center touchpad.
- **Haptics**: Monostable 8-way directional nudge with magnetic detent click.

### 4. Shift-by-Wire Monostable Rocker Toggle
- **Action**: Spring-centered rocker toggle ($24 \times 42 \times 26\,\text{mm}$) with tactile detent grooves.
- **Illumination**: Backlit laser-etched P-R-N-D glyphs with dual-color LED indicators (amber active, white standby).

### 5. Multi-Vane Turbine Aerofoil Air Vents
- **Nozzle**: High-polish chrome outer bezel with 8 twisted aerofoil blades ($22^\circ$ helical pitch).
- **Core Display**: Central micro-OLED rotary dial indicating temperature ($16.0^\circ\text{C}$ to $28.0^\circ\text{C}$) and fan velocity.

### 6. Qi Fast Wireless Charging Bay
- **Pad**: Anti-slip silicone surface ($180 \times 95\,\text{mm}$) with 4 raised chevron airflow cooling ribs ($1.5\,\text{mm}$ relief).
- **Induction Coil Indicia**: Subtly embossed geometric charging crosshairs with emerald standby/active LED light pipe.

### 7. Steering-Wheel Mounted Manettino Drive-Mode Dial
- **Knob**: CNC-machined anodized aircraft aluminum dial ($\varnothing 30\,\text{mm}$, height $10\,\text{mm}$) with CNC scalloped finger grips.
- **Pointer**: Precision red anodized pointer indexed to WET, SPORT, RACE, ESC-OFF modes.

### 8. Steer-by-Wire Ergonomic D-Cut Rim & Column
- **Anatomy**: Flat-bottom D-cut outer rim ($\varnothing 365\,\text{mm}$, oval cross-section $34 \times 29\,\text{mm}$).
- **Grips**: 10-and-2 anatomical thumb swells with laser-perforated Nappa leather and contrast French stitching.
- **Armature**: 3-spoke brushed magnesium-aluminum skeleton with integrated thumb rollers and haptic buttons.

### 9. Dynamic Ambient Fiber-Optic Lightguides
- **Optics**: Extruded PMMA light-pipe ($1.8\,\text{mm}$ diameter) tucked into negative door and dash reveals.
- **Diffusion**: Matte frost core providing smooth continuous gradient lighting with no visible LED hot-spots.

### 10. Cantilevered Bridge Center Console
- **Structure**: High-strength aluminum load-bearing spar extending from lower dash to rear armrest.
- **Lower Void**: $140\,\text{mm}$ high pass-through storage tunnel with hidden USB-C 100W PD ports and ambient footwell lighting.

### 11. Active Micro-Perforated Pneumatic Massage Bucket Seat
- **Cushion**: 5-flute parabolic lofting with negative pull-down French seam gutters ($-8\,\text{mm}$).
- **Bolsters**: Anatomical lateral thorax bolsters with embedded 4-chamber pneumatic bladder displacement shape keys (`Key_Bolster_Hug`).
- **Headrest**: Twin polished chrome stanchions with articulating cervical support cushion.

### 12. A-Pillar Digital Camera Mirror OLED Screens
- **Positioning**: Mounted directly on interior A-pillar root angled $35^\circ$ toward driver eye ellipse.
- **Display**: High-brightness anti-glare 7" OLED with integrated blind-spot alert warning halo.

---

## 4. Procedural CAD Generation in Blender (BMesh Pipeline)

Always use the procedural generator script located at `scripts/generate_interior_gadgets_cad.py` or invoke procedural bmesh routines directly:

```bash
& "C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" -b -P .agents/skills/skill-for-automotive-interior-and-gadgets/scripts/generate_interior_gadgets_cad.py
```

### Critical Procedural Topology Rules:
1. **Never use non-existent BMesh functions**: `bmesh.ops.create_cylinder` is not in the Blender bmesh API. Cylinders and rotational surfaces must be lofted via mathematical trigonometry (`cos`/`sin` loops with face rings).
2. **CAD Fillet Standard**: Every interior component edge within reach of the driver must have a minimum $0.6\,\text{mm} - 1.8\,\text{mm}$ chamfer/bevel modifier (`segments=2-3`, `WeightedNormal keep_sharp=True`). In the real world, injection molding and CNC machining cannot produce knife-sharp zero-radius corners.
3. **PBR Material Stacks**:
   - Polished Chrome: Metallic 1.0, Roughness 0.08–0.12.
   - Knurled Titanium: Metallic 0.90, Roughness 0.22–0.28.
   - Screen Glass: Base color `(0.008, 0.010, 0.012)`, Metallic 0.0, Roughness 0.04, Clearcoat 1.0.
   - Soft-Touch Silicone: Metallic 0.0, Roughness 0.70–0.80.
   - Anodized Red Accent: Base color `(0.80, 0.05, 0.05)`, Metallic 0.85, Roughness 0.28.
4. **Pre-Export Modifier Baking**:
   All Solidify and Bevel modifiers must be explicitly baked (`modifier_apply`) prior to glTF export with `export_apply=False` to preserve local origins for animation and kinematic movement.

---

## 5. Automated Verification Checklist

Before releasing any interior model or GLB component:
- [ ] **Hardpoint Alignment**: H-point, eye ellipse, steering hub, and pedal box match SAE J1100 coordinates.
- [ ] **Zero-Offset Snapping**: Origin is preserved at $(0,0,0)$ chassis coordinates or local pivot axis.
- [ ] **No Naked Edges**: Every surface has thickness (Solidify $\ge 1.2\,\text{mm}$) and beveled corners.
- [ ] **Triangle Budget Verified**: Component sits within segment budget limits.
- [ ] **Production Quality Gate**: Model meets Grade A ($\ge 90\%$) in `validate_glb_production.py`.
