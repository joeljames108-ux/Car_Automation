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

### 3. Procedural Automotive Blender Pipeline & 3D GLB Generation Standard (MANDATORY)
- **ALWAYS USE BLENDER TO GENERATE 3D GLBs**: All 3D vehicle models, chassis, engines, suspensions, aerodynamics, cockpits, and components must be generated, textured, and exported via Blender (`scripts/blender/` using Blender 5.x LTS / Blender MCP).
- **NEVER substitute with primitive Three.js procedural boxes, cylinders, or mock meshes** when 3D automotive assets are needed. Always use Blender's bmesh/procedural pipeline to produce authentic, Class-A CAD meshes with real PBR materials.
- **Follow operational parameters** defined in `.agents/skills/procedural-automotive-blender-mcp/SKILL.md`.
- **World coordinate alignment**: Y-Forward (+Y), Z-Up (+Z), X-Lateral (+X Driver LHD).
- **All modular components must maintain world-space relative transforms** for zero-offset snapping in Three.js and Unreal Engine.
- **Shaders**: Principled BSDF PBR material factory with clearcoat, satin trim, optical transmission glass, and high-intensity emissive lighting.
- **Dual-mode export**: Standalone zero-offset GLBs in `public/models/modular_parts/` / `exports/parts/` and complete vehicles in `public/models/Car_*_Complete.glb` / `exports/Car_*_Complete.glb`.

