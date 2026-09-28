---
name: skill-for-digital-twin-orchestration
description: Operational skill for orchestrating 108-phase multi-physics vehicle telemetry, CAN bus 8-byte frame encoding, and real-time state synchronization in the Digital Twin Studio.
---

# Skill: Automotive Digital Twin & Multi-Physics Telemetry

This skill provides the communication protocols, state vector schemas, and synchronization rules for vehicle digital twins.

---

## 1. Digital Twin Architecture & Telemetry Frames

1. **CAN Bus 2.0B Frame Standard**:
   - Standard 11-bit Identifier (or 29-bit Extended ID).
   - DLC: 8 Bytes payload.
   - CRC-15 polynomial: $x^{15} + x^{14} + x^{10} + x^8 + x^7 + x^4 + x^3 + 1$.

2. **Standard OBD-II Parameter IDs (PIDs)**:
   - `0x0C`: Engine RPM ($\text{Scale} = 0.25\,\text{RPM/bit}$).
   - `0x0D`: Vehicle Speed ($\text{Scale} = 1\,\text{km/h/bit}$).
   - `0x05`: Engine Coolant Temp ($\text{Scale} = 1^\circ\text{C/bit}, \text{Offset} = -40^\circ\text{C}$).
   - `0x11`: Throttle Position ($\text{Scale} = \frac{100}{255}\,\%/\text{bit}$).

3. **108-Phase Synchronized State Loop**:
   - Executes deterministically at $60 - 100\,\text{Hz}$.
   - Solves coupled domains in topological order:
     $$\text{Driver Input} \to \text{Powertrain/Dyno} \to \text{Transmission} \to \text{Chassis Kinematics} \to \text{Aero CFD} \to \text{Tire Pacejka} \to \text{Thermal} \to \text{Audio NVH}$$
   - Guarantees energy and momentum conservation across interfaces.
