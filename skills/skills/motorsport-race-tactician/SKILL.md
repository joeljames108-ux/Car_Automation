---
name: motorsport-race-tactician
description: Multi-circuit race strategy workflows: tyre compound stint planning, undercut/overcut tactics, fuel burn optimization, and rain transition windows.
---

# Motorsport Race Tactician

A domain skill for motorsport race engineering and pit strategy modeling.

## Pit Strategy Rules
- **Undercut**: Pit 1-2 laps early when fresh compound delta $> 1.8\text{s/lap}$.
- **Overcut**: Stay out when rival is stuck in traffic or warm-up phase is long ($> 2\text{ laps}$).
- **Tyre Thermal Window**:
  - Soft Compound: $85^\circ\text{C} - 105^\circ\text{C}$ (High grip, fast degradation)
  - Hard Compound: $100^\circ\text{C} - 120^\circ\text{C}$ (High durability)
