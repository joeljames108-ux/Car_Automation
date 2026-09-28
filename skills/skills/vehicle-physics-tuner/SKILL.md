---
name: vehicle-physics-tuner
description: Workflow and formulas for vehicle dynamics tuning: roll gradient calculations, downforce balance, camber gain curves, anti-roll bar sizing, and shock absorber damper tuning.
---

# Vehicle Physics Tuner

A domain skill for vehicle dynamics and suspension tuning in the simulator.

## Key Formulas & Targets

### 1. Roll Gradient Target
- **Street / Comfort**: 3.5° - 4.5° per g of lateral acceleration
- **Sport / GT**: 2.0° - 3.0° per g
- **Track / Downforce Race**: 0.5° - 1.5° per g

### 2. Aero Balance
$$\text{Front Aero Ratio} = \frac{\text{Front Downforce}}{\text{Front Downforce} + \text{Rear Downforce}}$$
- Target: 42% - 48% Front for neutral balance; > 52% causes high-speed snap oversteer.

### 3. Damper Damping Ratios ($\zeta$)
- **Rebound Damping**: $\zeta_{reb} \approx 0.65 - 0.75$ (Critically damped)
- **Bump Damping**: $\zeta_{bump} \approx 0.35 - 0.45$ (Allows tire compliance over bumps)
