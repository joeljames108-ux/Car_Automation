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

### 4. Autonomous Blender Visual Feedback Loop & Iterative Quality Assessment (MANDATORY)
- **NEVER EDIT 3D ASSETS BLIND**: Whenever working on vehicle models, chassis, cockpit interiors, lighting, materials, or aerodynamics in Blender, the agent MUST autonomously run the iterative screenshot feedback loop.
- **Autonomous Viewport Framing**: Programmatically configure the 3D viewport (`r3d.view_perspective = 'PERSP'`, `r3d.view_distance`, `r3d.view_location`, `r3d.view_rotation = Euler(...).to_quaternion()`, `r3d.update()`), hide overlays (`space.overlay.show_overlays = False`), and set material shading (`space.shading.type = 'MATERIAL'`).
- **Baseline Visual Capture**: Capture baseline screenshots across standard automotive validation angles (Front 3/4, Rear 3/4, Side, Front, Rear) via `get_viewport_screenshot` before making changes.
- **Visual Self-Critique & Assessment**: Critically evaluate the screenshots for:
  - Surface faceting & unmerged quad grid seams (weld coincident vertices via `remove_doubles`, clear frozen split normals, apply `shade_smooth_by_angle` 32°–35°).
  - Harsh CAD corners (apply angle-limited `Bevel` modifiers 2.5–4.0mm with 2–3 segments and `WeightedNormal` `keep_sharp=True`).
  - Headlamp & taillamp internal optics (never use flat emissive blocks; use multi-material housings, projector lenses, DRL brows, and polycarbonate covers).
  - Greenhouse transparency (optical dielectric glass with transmission ~0.94, IOR 1.52, low roughness, clearcoat 1.0, and privacy tint).
  - Exterior jewelry (door handles, chrome beltline trim, polished Inconel exhaust tips with dark inner bore, emblem badges).
- **Iterative In-Place Re-Screenshotting**: Re-capture viewport screenshots after each targeted modification to visually verify the upgrade before proceeding to the next step.
- **Dual-Mode Export & Verification**: Export unified master vehicles and modular zero-offset individual components, verify round-trip import, and ensure 100% clean TypeScript build (`npx tsc --noEmit -p tsconfig.app.json`) and passing tests (`npx tsx src/sim/modularVehicle/runTests.ts`).
- **Operational Cheatsheet**: Refer to `.agents/skills/blender-visual-feedback-loop/SKILL.md` for full implementation patterns.

### 5. Maximum Visual Quality & Intensive CAD Mesh Standard (ABSOLUTE DIRECTIVE)
- **Highest Possible Fidelity Standard**: In every 3D model generation, achieve state-of-the-art Class-A automotive CAD quality. Never compromise fidelity for brevity or file size.
- **No Line Count or File Size Limitations**: Disregard script length or GLB export file sizes. Do not compress or simplify geometry when higher fidelity, denser subdivision, or richer component hierarchy can be achieved. Work intensively and comprehensively on each individual model.
- **Micro-Detailed Automotive Subsystems**:
  - Complex multi-part lighting optics (individual projector lenses, separate internal reflector housings, 3D extruded LED light-pipes/diodes, fluted amber indicators, multi-layer outer polycarbonate lenses).
  - High-density multi-piece wheels (radiating curved spokes with fillet chamfers, 5 separate recessed lug nuts/bolts, 3D brand logo hub caps, stepped outer rim lips, curved sidewall tires with directional tread pattern sipes, cross-drilled/slotted brake rotors, and detailed multi-piston branded brake calipers).
  - Aerodynamic jewelry (fully modeled 3D honeycomb/slat grilles, front splitters with winglet strakes, active aero elements, hood heat extractors, rear diffusers with sharp aerodynamic fins, hollowed multi-walled exhaust tips).
  - Intricate cockpits (driver-oriented dashboards, center consoles with gear shifters and MMI dials, sport steering wheels with paddle shifters, contoured bucket seats with distinct bolsters, headrests, and package shelves).
  - Full underbody belly pans and enclosed wheel tubs to guarantee zero see-through voids from any viewing angle.
