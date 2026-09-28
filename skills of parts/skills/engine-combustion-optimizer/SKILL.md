---
name: engine-combustion-optimizer
description: Step-by-step guidance for internal combustion engine tuning: AFR targets, turbocharger boost pressure maps, ignition timing advance, and knock margin safety limits.
---

# Engine Combustion Optimizer

A domain skill for ICE engine tuning and turbocharging optimization.

## Air-Fuel Ratio (AFR) Targets
- **Naturally Aspirated Peak Power**: 12.6 - 12.8 (Lambda 0.86)
- **Turbocharged Full Boost**: 11.5 - 11.8 (Lambda 0.78 - 0.80) to cool exhaust valves and prevent knock.
- **Cruising / Economy**: 14.7 - 15.4 (Stoichiometric / Lean)

## Knock Prevention & Safety Margins
- Knock Threshold: Keep Knock Index $< 0.45$.
- If Boost Pressure $> 2.0\text{ bar}$, retard ignition timing by $1.5^\circ$ per $0.2\text{ bar}$ increase.
