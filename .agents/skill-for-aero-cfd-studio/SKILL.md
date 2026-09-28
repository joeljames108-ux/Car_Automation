---
name: skill-for-aero-cfd-studio
description: Operational skill for designing, simulating, and balancing automotive aerodynamics, CFD wind tunnels, Venturi ground-effect floors, multi-element wings, active DRS, and downforce balance in the Aero Studio.
---

# Skill: Aero Studio & CFD Aerodynamics Architecture

This skill provides the mathematical models, 3D geometry parameters, and operational rules for vehicle aerodynamics and computational fluid dynamics (CFD).

---

## 1. Governing Aerodynamic Formulas

1. **Dynamic Pressure**:
   $$q = \frac{1}{2} \rho v^2$$
   where $\rho \approx 1.225\,\text{kg/m}^3$ (sea-level air density) and $v$ is velocity in $\text{m/s}$.

2. **Downforce and Drag**:
   $$F_{\text{downforce}} = C_l \cdot A \cdot q$$
   $$F_{\text{drag}} = C_d \cdot A \cdot q$$
   where $A$ is frontal area ($\sim 1.8 - 2.2\,\text{m}^2$).

3. **Aerodynamic Efficiency**:
   $$\text{Efficiency} = \frac{-C_l}{C_d} \quad (\text{or } L/D)$$
   - GT3 Supercars: $L/D \approx 2.4 - 2.8$
   - Formula 1: $L/D \approx 3.2 - 3.8$
   - Le Mans Hypercars (LMH/LMDh): Regulated BoP window of $C_L / C_D \approx 4.0:1 \pm 2\%$.

4. **Aero Balance & Center of Pressure (CoP)**:
   $$\text{Front Balance } \% = \frac{F_{\text{downforce, front}}}{F_{\text{downforce, front}} + F_{\text{downforce, rear}}} \times 100\%$$
   Target balance is typically $42\% - 46\%$ front to maintain high-speed stability without understeer.

---

## 2. Aerodynamic Subsystems CAD Standards

1. **Front Wing & Dive Planes**:
   - Multi-element slotted airfoils with cambered chord.
   - Variable incidence flaps ($0^\circ - 35^\circ$).
   - Endplate strakes and vortex fences to divert turbulent front wheel wake outboard.
2. **Underbody Ground Effect Venturi Tunnels**:
   - Expansion throat ratio: $1:3.5$ to $1:4.2$ area expansion.
   - Choked throat clearance: $25 - 60\,\text{mm}$ above ground.
   - Diffusion ramp angle: $10^\circ - 14^\circ$ upsweep to prevent boundary layer separation.
3. **Active Rear Wing & DRS**:
   - Mainplane with high-lift supercritical inverted profile.
   - DRS flap actuator: Solves high-speed flap shedding with $85\,\text{mm}$ slot clearance, reducing total rear drag by $25 - 35\%$.
   - Airbrake mode: Pivots to $+65^\circ - +70^\circ$, creating instant deceleration drag.
