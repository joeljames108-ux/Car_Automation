---
name: skill-for-manufacturing-factory-studio
description: Operational skill for automotive factory timeline planning, 12-stage robotic assembly sequencing, takt time calculation, and fastener torque standards in the Manufacturing Studio.
---

# Skill: Automotive Factory Assembly & Manufacturing Engineering

This skill provides the operational standards, station sequencing, and quality assurance formulas for automotive manufacturing facilities.

---

## 1. Manufacturing Metrics & Formulas

1. **Takt Time**:
   $$T_{\text{takt}} = \frac{T_{\text{available net work time}}}{D_{\text{customer demand}}}$$
   For high-volume series production ($100,000\,\text{units/yr}$): $T_{\text{takt}} \approx 60 - 90\,\text{seconds}$.
   For low-volume hypercars ($500\,\text{units/yr}$): $T_{\text{takt}} \approx 4 - 8\,\text{hours}$.

2. **Overall Equipment Effectiveness (OEE)**:
   $$\text{OEE} = \text{Availability} \times \text{Performance} \times \text{Quality}$$
   World-class benchmark is $\text{OEE} \ge 85\%$.

3. **Fastener Clamping Preload**:
   $$F_{\text{preload}} = \frac{T_{\text{tightening}}}{k \cdot d}$$
   where $T$ is applied torque, $d$ is nominal bolt diameter, and $k \approx 0.18 - 0.20$ is the nut friction coefficient.

---

## 2. The 12 Automotive Assembly Stages

1. **Stage 1: Stamping & Blanking**: Deep-draw hydraulic stamping of outer body panels (hood, roof, doors).
2. **Stage 2: Body-in-White (BIW)**: Robotic spot welding, structural laser braze, and adhesive bonding.
3. **Stage 3: Cathodic Electro-Dip (E-Coat)**: 360° immersion for complete anti-corrosion phosphate coating.
4. **Stage 4: Automated Paint Shop**: Robotic rotary atomizers applying primer, basecoat, and high-gloss clearcoat.
5. **Stage 5: High-Voltage / Powertrain Decking**: Assembly of engine, transmission, inverter, and battery pack onto subframes.
6. **Stage 6: Chassis Marriage (The "Wedding")**: Automated lifting of the rolling powertrain chassis into the painted body shell.
7. **Stage 7: Cockpit & Wiring Harness**: Robotic insertion of complete pre-assembled dashboard module and steering column.
8. **Stage 8: Glazing & Windshield**: Robotic urethane bead extrusion and precision vision-guided glass placement.
9. **Stage 9: Closures & Interior Trim**: Hang doors, fit seats, center console, and acoustic headliner.
10. **Stage 10: Fluid Evacuation & Fill**: Vacuum filling of engine oil, transmission fluid, DOT 4 brake fluid, and dual-loop coolants.
11. **Stage 11: End-of-Line Dyno & ADAS Calibration**: Roller dyno acceleration, ABS cycle, and radar/camera target calibration.
12. **Stage 12: Final QA Inspection & Monsoon Leak Test**: Laser shut-line gap audit and high-pressure water test chamber.
