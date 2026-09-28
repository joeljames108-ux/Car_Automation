---
name: ev-battery-pack-architect
description: Architectural guidelines for 800V EV architectures, cell chemistry trade-offs (LFP vs NMC vs Solid-State), and cooling plate thermal management.
---

# EV Battery Pack Architect

A domain skill for electric powertrain and battery thermal engineering.

## Cell Chemistries
- **LFP (Lithium Iron Phosphate)**: High thermal stability, 3000+ cycle life, low cost, lower energy density (~160 Wh/kg).
- **NMC 811 (Nickel Manganese Cobalt)**: High energy density (~260 Wh/kg), performance EVs, requires aggressive liquid chilling.
- **Solid-State**: Next-gen ultra-high density (> 400 Wh/kg), zero thermal runaway risk, high cost.

## Voltage Architecture
- **800V System**: Allows 350kW ultra-fast charging, thinner wiring harnesses (-25% copper weight), lower $I^2R$ resistive heating losses.
