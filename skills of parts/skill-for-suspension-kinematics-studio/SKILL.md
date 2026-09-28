---
name: skill-for-suspension-kinematics-studio
description: Operational skill for calculating suspension Instant Centers, roll center heights, wheel rates, motion ratios, and camber gain curves in the 3D Suspension Studio.
---

# Skill: 3D Suspension Kinematics & Chassis Dynamics

This skill provides the mathematical models, geometry constraints, and tuning guidelines for vehicle suspension design.

---

## 1. Kinematic Formulas & Instant Centers

1. **Wheel Rate vs. Spring Rate**:
   $$K_{\text{wheel}} = K_{\text{spring}} \cdot MR^2 \cdot \cos(\theta_{\text{damper}})$$
   where $MR = \frac{\Delta x_{\text{spring}}}{\Delta z_{\text{wheel}}}$ is the suspension motion ratio.

2. **Instant Center Projection**:
   - The Instant Center ($IC$) of the wheel upright is located at the intersection of the upper and lower control arm projected lines in the front-view plane.
   - The Roll Center ($RC$) is the intersection of the line from the tire contact patch center to the $IC$ with the vehicle's centerline.

3. **Anti-Dive Percentage (Braking)**:
   $$\% \text{Anti-Dive} = \frac{\tan(\theta_{\text{side-view IC}})}{\frac{h_{\text{CoG}}}{\text{Wheelbase}}} \cdot \text{Front Brake Bias} \times 100\%$$
   Target: $25\% - 45\%$ to minimize nose dive without inducing harsh bump compliance over braking ripples.

4. **Critical Damping Ratio ($\zeta$)**:
   $$\zeta = \frac{C_{\text{damper}}}{2 \sqrt{K_{\text{wheel}} \cdot m_{\text{corner}}}}$$
   - Sports / Track setting: $\zeta \approx 0.65 - 0.75$
   - Luxury / Touring setting: $\zeta \approx 0.35 - 0.45$

---

## 2. Suspension Typologies

1. **Double Wishbone (SLA)**: Unequal-length upper and lower A-arms. Allows independent camber, caster, and roll center optimization. Standard for supercars and F1/Hypercar.
2. **Pushrod / Pullrod Inboard Actuation**: Torsion bars and dampers mounted horizontally atop the monocoque/gearbox, reducing unsprung mass and aerodynamic drag.
3. **Multi-Link (5-Link Rear)**: Decoupled longitudinal and lateral compliance, excellent ride isolation with sharp directional control.
