# Project Agents & Customization Guidelines

This repository contains the **Modular Vehicle Assembly System & Car Automation Simulator**.

## Core Guidelines & Architectural Principles

### 1. Modular Vehicle Assembly System Architecture
- **Master Coordinates**: All chassis hardpoints are defined in 3D mm relative coordinates (`masterChassisAnchors.ts`).
- **Coordinate Space Translator**: Standard conversion between 3D mm chassis space and SVG canvas pixel coordinates (`coordinateSpace.ts`).
- **Subsystem Registry**: Every vehicle component registers with mass, 3D CoM offset, structural rigidity, drag/lift coefficients, and explicit attachment anchors (`componentRegistry.ts`).
- **Validation Engine**: Rigorous verification of subsystem completeness, structural alignment, and mounting point compatibility (`validationEngine.ts`).

### 2. Code Quality & Verification Standards
- Maintain 100% clean TypeScript builds without type errors (`npx tsc --noEmit -p tsconfig.app.json`).
- Ensure all unit test suites pass (`npx tsx src/sim/modularVehicle/runTests.ts`).
- Use rich aesthetics with high-contrast Dark UI themes, glassmorphism, dynamic SVG rendering, and real-time physics feedback.

### 3. Procedural Automotive Blender MCP Pipeline Standard
- Follow the operational parameters defined in `.agents/skills/procedural-automotive-blender-mcp/SKILL.md`.
- World coordinate alignment: Y-Forward (+Y), Z-Up (+Z), X-Lateral (+X Driver LHD).
- All modular components must maintain world-space relative transforms for zero-offset snapping in Three.js and Unreal Engine.
- Shaders: Principled BSDF PBR material factory with clearcoat, satin trim, optical transmission glass, and high-intensity emissive lighting.
- Dual-mode export: Standalone zero-offset GLBs in `exports/parts/` and unified assembled vehicle in `exports/Car_Sedan_Complete.glb`.

