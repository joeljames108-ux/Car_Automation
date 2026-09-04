# Blender 3D Asset Pipeline Workspace

This directory is the dedicated home for source `.blend` projects, Python automation generators, and export staging for the **Car Automation & Simulator** platform.

## Directory Structure

```text
blender/
├── engines/     # Master source .blend files for engine assemblies (V12, V8, I4, Boxer, EV)
├── chassis/     # Chassis frames (Monocoque, Spaceframe, Ladder, EV Skateboard)
├── body/        # Vehicle body shells (GT3, Coupe, Sedan, Hypercar, Hatchback)
├── aero/        # Aerodynamic packages (Front splitters, diffusers, active wings, canards)
├── interior/    # Cockpits, dashboards, steering wheels, race buckets, center consoles
├── scripts/     # Python bpy scripts for procedural generation, node tagging, and export
└── templates/   # Reference rigs, scale cubes, and camera/lighting templates
```

## Production Flow

$$\text{Blender (.blend or Python bpy)} \longrightarrow \text{GLB Export (Y-Up, Preserved Pivots)} \longrightarrow \text{exports/glb/} \longrightarrow \text{public/models/} \longrightarrow \text{Three.js Viewport}$$

### Key Technical Guidelines
1. **Coordinate System:** Always export with `export_yup=True` to align with Three.js.
2. **Component Pivots:** Keep pivots at the mechanical rotation/articulation center (e.g. wrist pin for pistons, crank centerline for crankshaft, hinge vector for doors/bonnet).
3. **Naming Contract:** Ensure object names match the mechanical node contracts specified in `EngineGlbAnimator.ts` and `ModularAssemblySceneGraph.ts`.
