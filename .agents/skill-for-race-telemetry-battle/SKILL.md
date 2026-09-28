---
name: skill-for-race-telemetry-battle
description: Operational skill for calculating circuit lap times, Pacejka tire grip curves, dynamic weight transfer, and head-to-head track battle telemetry frames.
---

# Skill: Vehicle Dynamic Race Simulation & Telemetry Analysis

This skill provides the physics models, tire equations, and telemetry aggregation algorithms for circuit racing and track battles.

---

## 1. Dynamic Physics Models

1. **Pacejka Magic Formula**:
   $$F_y = D \sin\left( C \arctan\left( B\alpha - E(B\alpha - \arctan(B\alpha)) \right) \right)$$
   where:
   - $B$ is stiffness factor
   - $C$ is shape factor ($\sim 1.3 - 1.6$)
   - $D$ is peak friction value ($\mu \cdot F_z$)
   - $E$ is curvature factor

2. **Longitudinal Weight Transfer**:
   $$\Delta F_{z,\text{long}} = \frac{m \cdot a_x \cdot h_{\text{CoG}}}{\text{Wheelbase}}$$

3. **Lateral Weight Transfer**:
   $$\Delta F_{z,\text{lat}} = \frac{m \cdot a_y \cdot h_{\text{CoG}}}{\text{Track Width}}$$

4. **Lap Time Minimization**:
   $$T_{\text{lap}} = \int_0^{L_{\text{track}}} \frac{1}{v(s)} \, ds$$
   subject to:
   - Acceleration limit: $a_x \le \frac{F_{\text{traction}}(v) - F_{\text{drag}}(v)}{m}$
   - Braking limit: $a_x \ge -\frac{F_{\text{brake, max}} + F_{\text{drag}}(v)}{m}$
   - Cornering limit: $a_y \le \frac{F_{y,\text{tires}}(F_z, \mu)}{m}$
   - Friction circle coupling: $\left(\frac{a_x}{a_{x,\max}}\right)^2 + \left(\frac{a_y}{a_{y,\max}}\right)^2 \le 1$

---

## 2. Telemetry Comparison Protocol

When generating head-to-head track battle playback:
- Compute spatial synchronization: sample both vehicles at identical track distance offsets $s_k \in [0, L_{\text{track}}]$ in $10\,\text{m}$ increments.
- Calculate speed differential: $\Delta v(s) = v_A(s) - v_B(s)$.
- Calculate running delta time: $\Delta t(s) = t_A(s) - t_B(s)$.
- Identify winning sectors: award Sector 1, 2, and 3 trophies based on fastest split time.
