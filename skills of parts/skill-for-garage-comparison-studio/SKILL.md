---
name: skill-for-garage-comparison-studio
description: Operational skill for multi-vehicle garage management, side-by-side A/B engineering comparison deltas, custom livery PBR shaders, and turntable showroom staging in the Garage & Comparison Studio.
---

# Skill: Vehicle Garage & Engineering Comparison Studio Standard

This skill provides the operational workflows, comparison algorithms, and 3D showroom camera rigs for vehicle comparison and garage management.

---

## 1. Engineering Comparison Algorithms

1. **Normalized Performance Spider / Radar Scoring**:
   $$S_i = \min\left(100, \max\left(0, \frac{V_i - V_{i,\min}}{V_{i,\max} - V_{i,\min}} \times 100\right)\right)$$
   across 6 standard dimensions:
   - Power-to-Weight ($W/kg$)
   - Peak Lateral Acceleration ($g$)
   - Aerodynamic Efficiency ($L/D$)
   - Braking Deceleration ($g$)
   - Top Speed ($km/h$)
   - Price-to-Performance Ratio

2. **Sector Delta Calculation**:
   $$\Delta t_{\text{sector } k} = t_{A,k} - t_{B,k}$$
   Display green badge if Car A is faster, red if Car B is faster.

---

## 2. Showroom Presentation Standards

- **Ground Plane**: Glossy dark anthracite reflective floor with subtle Fresnel reflectivity ($R_0 = 0.04$, roughness $0.15$).
- **Turntable Rig**: Continuous slow azimuthal rotation ($0.05\,\text{rad/s}$) with auto-pause on user drag.
- **Three-Point Lighting**:
  - Key Light: 5600K high-intensity softbox directly above windshield.
  - Rim / Accent Light: Crisp 6500K strip light highlighting rear swage line and haunches.
  - Fill Light: 4000K warm diffuse ground bounce.
