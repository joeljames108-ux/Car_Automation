---
name: skill-for-safety-crash-center
description: Operational skill for calculating crash pulse energy dissipation, Head Injury Criterion (HIC15), Specific Energy Absorption (SEA), and NCAP safety ratings in the Safety Center.
---

# Skill: Automotive Crashworthiness & Safety Engineering

This skill provides the mathematical models, plastic deformation formulas, and biomechanical injury thresholds for vehicle crashworthiness.

---

## 1. Crash Mechanics & Biomechanics

1. **Total Kinetic Energy Dissipation**:
   $$E_{\text{kinetic}} = \frac{1}{2} m v^2$$
   For a $1,500\,\text{kg}$ vehicle at $64\,\text{km/h}$ ($17.78\,\text{m/s}$):
   $$E_{\text{kinetic}} \approx 237\,\text{kJ}$$

2. **Specific Energy Absorption ($SEA$)**:
   $$SEA = \frac{E_{\text{absorbed}}}{m_{\text{crush}}}$$
   - High-strength steel: $SEA \approx 20 - 30\,\text{kJ/kg}$
   - 6000-series Aluminum extrusions: $SEA \approx 35 - 55\,\text{kJ/kg}$
   - Carbon fiber composite tubes: $SEA \approx 70 - 110\,\text{kJ/kg}$

3. **Head Injury Criterion ($HIC_{15}$)**:
   $$HIC_{15} = \max_{t_1, t_2} \left[ (t_2 - t_1) \left( \frac{1}{t_2 - t_1} \int_{t_1}^{t_2} a(t)\,dt \right)^{2.5} \right]$$
   where $(t_2 - t_1) \le 15\,\text{ms}$. NCAP 5-star threshold requires $HIC_{15} \le 650$.

---

## 2. Structural Crash Zones

1. **Zone 1: Front Attenuator & Bumper Beam**: Sacrificial low-speed crush boxes (absorbs up to 15 km/h with zero chassis rail damage).
2. **Zone 2: Longitudinal Front Rails**: S-rails or conical aluminum extrusions engineered with progressive trigger indents to initiate sequential folding.
3. **Zone 3: Passenger Safety Cell**: Ultra-high-strength hot-stamped boron steel (1500 MPa) or autoclave carbon-fiber tub designed for zero intrusion.
