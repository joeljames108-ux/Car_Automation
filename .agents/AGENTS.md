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
- Use rich aesthetics with elegant **Light Theme** as the primary standard, enriched with harmonious soft light colors (warm cream/alabaster `#f6f4ee`, soft eucalyptus/sage `#eef3ec`, sky/ice blue `#edf4f9`, soft amber/champagne `#fef6e9`), crisp dark slate typography (`#0f172a`, `#1e293b`), dynamic SVG rendering, and real-time physics feedback. **NEVER use bleached, washed-out pure white everywhere, and NEVER force dark UI unless specifically requested.**

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

### 6. Modular Component Separation: Exterior vs. Interior Parts & Cockpit Architecture Standard
- **Strict Domain Separation**:
  - **Exterior Parts** (`scripts/blender/generators/exterior/`): Governed by aerodynamic drag ($C_d$), downforce ($C_l$), sheet-metal tolerances ($3.5\text{mm}$ shutlines), high-specular reflective paint, and high-speed airflow dynamics.
  - **Interior Cabin Parts** (`skills of parts/`): Governed by anatomical ergonomics, driver sightlines, H-point clearance, tactile compliance, multi-density viscoelastic foam lofting, negative French seam pull-down gutters, and switchgear haptics.
- **MANDATORY AUTO-ACTIVATION FOR SEATS**:
  - Whenever designing, upgrading, or generating automotive seats, the agent **MUST automatically activate and strictly adhere to `skills of parts/skill for seats/SKILL.md`** (indexed as `skill-for-seats`).
  - **Budget**: 70,000 – 90,000 triangles per seat (~140,000 – 180,000 triangles for front pair).
  - **Non-Inverting Recline Rule**: Always use positive rotation angles around the local $X$-axis (`+14.0°` to `+17.0°`) to recline rearward towards $-Y$. Negative rotation angles fold the seat forward over the cushion and are strictly prohibited.
  - **Tactile Leather Softness Standard**: All seats must feature anatomical ischial dishing, 5-flute parabolic lofting with negative pull-down seam gutters ($-8\text{mm}$), puffy convex lateral bolsters with solid floor plates, and continuous contrast piping beads ($4.5\text{mm}$).
  - **Carbon Monocoque Shell**: Must wrap forward around the side bolsters (positive cosine curvature) with downward-tapered shoulder caps to eliminate gaps and sharp CAD corners.
  - **Headrest & Viewport Framing**: Must include dual polished chrome telescoping stanchions with collar escutcheon rings and cervical pillows, centered at $Z=0.48\text{m}$ for camera capture.
- **MANDATORY AUTO-ACTIVATION FOR STEERING WHEEL & COLUMN**:
  - Whenever designing or generating steering wheels and steering columns, the agent **MUST activate and adhere to `skills of parts/skill for steering wheel/SKILL.md`** (indexed as `skill-for-steering-wheel`).
  - **Budget**: 35,000 – 50,000 triangles.
  - **Ergonomic Profile**: Flat-bottom D-cut outer rim ($\varnothing 365\text{mm}$, cross-section $34\text{mm} \times 29\text{mm}$ oval) with anatomical 10-and-2 thumb rests, perforated leather lateral grips, smooth Nappa top/bottom arcs, and red 12 o'clock center stripe.
  - **Switchgear & Controls**: 3-spoke titanium armature with recessed multifunction tactile switch pods, knurled thumb rollers, Manettino drive-mode rotary dial, and rear magnetic carbon-fiber paddle shifters with acoustic damping.
  - **Hardpoints**: Center hub at $(X=-0.380\text{m}, Y=0.440\text{m}, Z=0.680\text{m})$ tilted $22.5^\circ$ rearward on twin-stalk steering column shroud.
- **MANDATORY AUTO-ACTIVATION FOR DASHBOARD & CENTER CONSOLE**:
  - Whenever designing or generating dashboards and center bridge consoles, the agent **MUST activate and adhere to `skills of parts/skill for dashboard/SKILL.md`** (indexed as `skill-for-dashboard`).
  - **Budget**: 75,000 – 95,000 triangles.
  - **Driver-Oriented Ergonomics**: Asymmetric driver binnacle cowl peaked at $X=-0.380\text{m}$ enclosing a 12.3" curved anti-glare OLED instrument cluster tilted $14.0^\circ$ toward driver eye-line.
  - **Floating Infotainment & Climate Ribbon**: Cantilevered 14.5" ultra-wide OLED display angled $8.0^\circ$ yaw toward driver and $15.0^\circ$ pitch, floating above a full-width acoustic climate ribbon vent with knurled micro-louvers.
- **MANDATORY INTERACTIVE AUTOMOTIVE GLB STANDARD**:
  - Whenever generating or upgrading ANY automotive 3D GLB model or component, the agent **MUST activate and adhere to `skills of parts/skill for interactive glb/SKILL.md`** (indexed as `skill-for-interactive-glb`).
  - **The 15MB / 650,000+ Triangle Quality Law**: Total vehicles must reach **650,000 – 800,000+ triangles (~15–18 MB uncompressed, ~3.5–4.2 MB meshopt compressed)** across all 11 populated subsystems with intensive interior cabin allocation (338k–450k triangles). Every component must fulfill its respective triangle budget (Dashboard: 75k-95k, Seats: 70k-90k each / 140k-180k pair, Steering: 35k-50k, Doors: 35k-50k each / 70k-100k pair, Pedals: 18k-25k, Wheels & Brakes: 96k-105k, Exterior Body: 135k-150k).
  - **Kinematic Pivots**: Never apply world transforms to articulating components (`export_apply=False`). Always preserve local origins on physical hinge axes or linear slide vectors.
  - **Baked NLA Actions**: Pre-bake keyframed actions (`Action_<Component>_<Feature>`) for all interactive features (e.g. recline, slide, turn, paddle clicks, butterfly armrests, cupholder slides, shifter toggles, doors, wings, lights).
  - **Morph Targets**: Embed shape keys (`Key_Bolster_Hug`, `Key_Lumbar_Inflate`, `Key_Tire_Contact_Patch`) on viscoelastic soft surfaces.
  - **Semantic Hitboxes**: Include lightweight `HITBOX_*` collision hulls (12–36 tris) to preserve 60 FPS WebGL raycast performance.
  - **Self-Describing Extras**: Embed metadata dictionaries (`{"interactive": true, "option_id": "...", ...}`) for instant Three.js runtime discovery.
  - **Export Flags**: Always export with `export_extras=True`, `export_animations=True`, `export_animation_mode='ACTIONS'`, `export_morph=True`, and `export_apply=False`.
- **MANDATORY AUTO-ACTIVATION FOR WHEELS & BRAKES**:
  - Whenever designing or generating wheels, tires, and braking systems, the agent **MUST activate and adhere to `skills of parts/skill for wheels and brakes/SKILL.md`** (indexed as `skill-for-wheels-and-brakes`).
  - **Budget**: 96,000 – 105,000 triangles across 4 corners (~26k per corner).
  - **Features**: Stepped alloy rims, 3D carved directional tread sipes (never flat cylinders!), cross-drilled carbon-ceramic rotors with internal cooling vanes, 6-piston monobloc calipers, continuous spin and front steering knuckle yaw actions.
- **MANDATORY AUTO-ACTIVATION FOR DOOR PANELS & REGULATORS**:
  - Whenever designing or generating interior door cards and window regulators, the agent **MUST activate and adhere to `skills of parts/skill for door panels/SKILL.md`** (indexed as `skill-for-door-panels`).
  - **Budget**: 35,000 – 50,000 triangles per door (~70,000 – 100,000 for front pair).
  - **Features**: Laser-drilled acoustic speaker grilles, tactile window switchpacks, illuminated ambient lightguards, interior door latch pull trigger, and power window glass descent actions.
- **MANDATORY AUTO-ACTIVATION FOR EXTERIOR BODY & ACTIVE AERO**:
  - Whenever designing or generating exterior bodywork and aerodynamics, the agent **MUST activate and adhere to `skills of parts/skill for exterior body and doors/SKILL.md`** (indexed as `skill-for-exterior-body-and-doors`).
  - **Budget**: 135,000 – 150,000 triangles.
  - **Features**: 12-section lofted quad control cage, G2 curvature continuity, 3.5mm shutlines, articulating doors (conventional, scissor, butterfly), clamshell hood, rear decklid, and active DRS rear aerodynamic wing.
- **MANDATORY AUTO-ACTIVATION FOR LIGHTING OPTICS**:
  - Whenever designing or generating headlamps, taillamps, and optical elements, the agent **MUST activate and adhere to `skills of parts/skill for lighting optics/SKILL.md`** (indexed as `skill-for-lighting-optics`).
  - **Budget**: 16,000 – 25,000 triangles.
  - **Features**: Multi-part internal projector lenses, 3D extruded DRL light-pipes, full-width continuous 3D OLED tail lightbar, optical dielectric transmission lenses, and DRL/low/high/sequential indicator animation actions.
- **MANDATORY AUTO-ACTIVATION FOR POWERTRAIN & ENGINE BAY**:
  - Whenever designing or generating powertrains, engines, or engine bays, the agent **MUST activate and adhere to `skills of parts/skill for powertrain and engine bay/SKILL.md`** (indexed as `skill-for-powertrain-and-engine-bay`).
  - **Budget**: 35,000 – 45,000 triangles.
  - **Features**: Hot-V twin-turbo V8, carbon plenums, equal-length exhaust headers, removable appearance cover, titanium strut braces, and idle engine vibration morph.
- **MANDATORY AUTO-ACTIVATION FOR CHASSIS & SUSPENSION**:
  - Whenever designing or generating vehicle frames, suspension, and dampening systems, the agent **MUST activate and adhere to `skills of parts/skill for chassis and suspension/SKILL.md`** (indexed as `skill-for-chassis-and-suspension`).
  - **Budget**: 35,000 – 40,000 triangles.
  - **Features**: Carbon monocoque tub, tubular subframes, double-wishbone pushrods, CNC bell crank rockers, remote coilovers, suspension stroke action, and spring compression morph.
- **MANDATORY AUTO-ACTIVATION FOR PEDALS & FOOTWELL**:
  - Whenever designing or generating driver footwells and pedal boxes, the agent **MUST activate and adhere to `skills of parts/skill for pedals and footwell/SKILL.md`** (indexed as `skill-for-pedals-and-footwell`).
  - **Budget**: 18,000 – 25,000 triangles.
  - **Features**: Floor-mounted organ throttle, hanging double-shear brake with balance bar, dead pedal, and independent pedal stroke depression actions.
- **MANDATORY AUTO-ACTIVATION FOR UNDERBODY & AERO UNDERTRAY**:
  - Whenever designing or generating underbody floors, splitters, or diffusers, the agent **MUST activate and adhere to `skills of parts/skill for underbody and aero undertray/SKILL.md`** (indexed as `skill-for-underbody-and-aero-undertray`).
  - **Budget**: 8,000 – 12,000 triangles.
  - **Features**: Enclosed underbody flat floor pan, twin Venturi expansion tunnels (10-12 deg), tire-squirt strakes, NACA ducting, and active diffuser trim actuation.
- **MANDATORY AUTO-ACTIVATION FOR GLB MATERIALS & VARIANTS**:
  - Whenever configuring multi-color paints, leather trims, or texture variants, the agent **MUST activate and adhere to `skills of parts/skill for glb materials and variants/SKILL.md`** (indexed as `skill-for-glb-materials-and-variants`).
  - **Standards**: Native KHR_materials_variants extension, single 15MB file housing multiple liveries, zero redundant mesh downloads, 0ms GPU material swapping.
- **MANDATORY AUTO-ACTIVATION FOR GLB MESHOPT COMPRESSION**:
  - Whenever delivering high-polygon assets over WebGL or mobile networks, the agent **MUST activate and adhere to `skills of parts/skill for glb meshopt compression/SKILL.md`** (indexed as `skill-for-glb-meshopt-compression`).
  - **Standards**: EXT_meshopt_compression pipeline, 75-85% size reduction (15MB to ~2.8MB) preserving 100% of triangles, normals, morphs, and animation tracks.
- **MANDATORY AUTO-ACTIVATION FOR VEHICLE CAMERA FRAMING**:
  - Whenever setting up 3D inspection views, configurator cameras, or cinematic framing, the agent **MUST activate and adhere to `skills of parts/skill for vehicle camera framing/SKILL.md`** (indexed as `skill-for-vehicle-camera-framing`).
  - **Standards**: Baked CAMERA_* glTF nodes, standardized spherical OrbitControls coordinates, GSAP smooth camera transitions, and isolated subsystem framing.
- **MANDATORY AUTO-ACTIVATION FOR AUDIO-HAPTIC BINDING**:
  - Whenever binding mechanical audio effects, clicks, or tactile touch feedback to interactive parts, the agent **MUST activate and adhere to `skills of parts/skill for audio-haptic binding/SKILL.md`** (indexed as `skill-for-audio-haptic-binding`).
  - **Standards**: Zero-dependency Web Audio API procedural synthesis, navigator.vibrate mobile haptics, THREE.PositionalAudio spatial binding, and node.extras.sound_fx schema.
- **MANDATORY AUTO-ACTIVATION FOR AUTOMATED GLB QUALITY GATE**:
  - Whenever completing, auditing, or certifying ANY automotive 3D asset or GLB model, the agent **MUST activate and adhere to `skills of parts/skill for automated glb quality gate/SKILL.md`** (indexed as `skill-for-automated-glb-quality-gate`).
  - **Standards**: Automated validate_glb_production.py execution across all 7 quality gates (Size, Polygons, Completeness, Pivots, Hitboxes, Actions, Extras), enforcing minimum Grade A (>=90%) production certification.
- **MANDATORY AUTOMOTIVE GLB QUALITY & SKILL ORCHESTRATION ENFORCEMENT**:
  - Whenever ANY 3D automotive vehicle or component is generated, modified, reviewed, or released, the agent **MUST invoke the Automotive GLB Quality & Skill Orchestration Agent (`automotive-glb-quality-agent`) and adhere to `skills of parts/skill for glb quality and skill orchestration/SKILL.md` (indexed as `skill-for-glb-quality-and-skill-orchestration`)**.
  - **Universal Subsystem Mapping**: The agent must inspect the mesh hierarchy, detect every applicable automotive domain, and guarantee that the specialized skill for each domain (Seats, Steering, Dashboard, Doors, Wheels/Brakes, Body, Lighting, Powertrain, Chassis/Suspension, Pedals, Underbody) is strictly applied.
  - **Universal Cross-Cutting Standard**: Every asset must fulfill isolated kinematic origins (`export_apply=False`), semantic hitboxes (`HITBOX_*` $\le 64$ tris), baked NLA actions, audio-haptics (`node.extras.sound_fx`), and lossless `meshopt` delivery (`.opt.glb`).
  - **Automated Verification**: Execute `python scripts/glb_quality_orchestrator.py --single <path>` to certify Grade A ($\ge 90\%$) compliance and update `docs/GLB_QUALITY_AUDIT_MANIFEST.json`.
- **MANDATORY AUTO-ACTIVATION FOR CABIN INTERIORS & AUTOMOTIVE GADGETS**:
  - Whenever designing, generating, upgrading, or reverse-engineering automotive interiors, cockpit electronics, or cabin gadgets across any market segment, the agent **MUST invoke the Automotive Interior & Cabin Gadgets Architecture Agent (`automotive-interior-agent`) and adhere to `.agents/skills/skill-for-automotive-interior-and-gadgets/SKILL.md`** (indexed as `skill-for-automotive-interior-and-gadgets`).
  - **SAE Human Factors Alignment**: Enforce SAE J1100, SAE J826/J4002 H-Point ($X=-0.380\text{m}, Y=0.000\text{m}, Z=0.280\text{m}$), SAE J941 Eye Ellipse, and SAE J287 Hand Reach Envelopes.
  - **12 Signature Gadgets**: Follow procedural CAD specifications for curved OLED displays, AR-HUD projection wells, knurled crystal MMI rotary pucks, monostable shift-by-wire toggles, multi-vane turbine vents, Qi wireless charging pads, Manettino drive-mode dials, steer-by-wire D-cut rims, fiber-optic lightguides, cantilevered bridge consoles, massage seats, and A-pillar digital mirror displays.
  - **Procedural BMesh Generation**: Execute `scripts/blender/generators/interior/build_complete_cockpit_cad.py` and `generate_interior_gadgets_cad.py` with zero-offset world snapping, 2-3 segment bevel chamfers ($0.6-1.8\text{mm}$), and PBR material definitions.
- **MANDATORY AUTOMOTIVE REVERSE-ENGINEERING & CURVE TOPOLOGY ENFORCEMENT**:
  - Whenever reverse-engineering reference models (`development/`) or generating authentic Class-A automotive bodies, the agent **MUST invoke the Automotive Reverse-Engineering & CAD Topology Agent (`automotive-reverse-engineering-agent`) and adhere to `skill-for-automotive-curve-and-topology-engineering/SKILL.md`**.
  - **The 4 Golden Rules**: Enforce $G^2$ curvature continuous lofting (never primitive box-stacking), 54% micro-edge fillet chamfers (2.5–4.0mm with `WeightedNormal` `keep_sharp=True`), 4-layer optical headlamps, and 64-segment stepped-lip multi-piece wheels.
  - **Pre-Export Modifier Baking Protocol**: Explicitly bake geometry modifiers (`Mirror`, `Solidify`, `Subsurf`, `WeightedNormal`) prior to `export_apply=False` glTF export to guarantee high-density Class-A CAD meshes while preserving 100% of kinematic pivot origins.
- **MANDATORY AUTO-ACTIVATION FOR MODULAR F1 & HYPERCAR PART-BY-PART ASSEMBLY**:
  - Whenever designing, generating, configuring, or assembling Formula 1 single-seaters (20 sockets) or Le Mans / Road Hypercars (25 sockets) part-by-part, the agent **MUST invoke the Modular F1 & Hypercar Assembly Specialist Agent (`f1-hypercar-assembly-agent`) and adhere to `skill-for-modular-f1-and-hypercar-assembly/SKILL.md`**.
  - **Socket Hierarchy & Zero-Offset GLBs**: Enforce the universal front axle ground origin $(0, 0, 0)$ across all 20 F1 sockets and 25 Hypercar sockets. Guarantee zero-offset GLB snapping with zero runtime translation math.
  - **Regulatory Enforcement**: Enforce FIA F1 Technical Regulations (Article 3 Aero, Article 5 1.6L V6 Turbo Hybrid & 2026+ 50/50, Article 12 Survival Cell, Article 13 Crash structures) and WEC/ACO LMH/LMDh BoP aerodynamic windows ($C_L / C_D \approx 4.0:1 \pm 2\%$) and hybrid deployment lockouts ($190\,\text{km/h}$).
  - **Multi-Configuration Variants**: Every socket must support interchangeable race-trim configurations (low-drag, high-downforce, balanced, powertrain variants) mapping to dedicated individual GLB files in `public/models/modular_parts/`.
- **MANDATORY ENFORCEMENT OF THE GAME MODULAR SKILLS & AGENTS ECOSYSTEM**:
  - Whenever working on, extending, debugging, or generating assets for ANY specific tab, studio, or subsystem of the game, the agent **MUST automatically consult the master taxonomy in `docs/GAME_MODULAR_SKILLS_AND_AGENTS_ECOSYSTEM.md` and activate the corresponding dedicated Specialist Agent and Operational Skill**:
    1. **Engine Studio**: `powertrain-engine-studio-agent` & `skill-for-powertrain-engine-studio`
    2. **Vehicle Studio**: `modular-chassis-vehicle-agent` & `skill-for-modular-chassis-vehicle`
    3. **Aero Studio & CFD**: `aero-cfd-studio-agent` & `skill-for-aero-cfd-studio`
    4. **Interior Studio & Cockpit**: `automotive-interior-agent` & `skill-for-automotive-interior-and-gadgets`
    5. **Safety & Crash Center**: `safety-crash-center-agent` & `skill-for-safety-crash-center`
    6. **Robotic Manufacturing**: `manufacturing-factory-studio-agent` & `skill-for-manufacturing-factory-studio`
    7. **3D Transmission**: `transmission-drivetrain-studio-agent` & `skill-for-transmission-drivetrain-studio`
    8. **3D Suspension**: `suspension-kinematics-studio-agent` & `skill-for-suspension-kinematics-studio`
    9. **Track Layouts & Circuits**: `track-layout-circuit-agent` & `skill-for-track-layout-circuit`
    10. **Race Track & Battles**: `race-telemetry-battle-agent` & `skill-for-race-telemetry-battle`
    11. **NVH Audio Lab**: `nvh-audio-lab-agent` & `skill-for-nvh-audio-lab`
    12. **Supply Chain & Economy**: `supply-chain-economy-studio-agent` & `skill-for-supply-chain-economy-studio`
    13. **Digital Twin Orchestration**: `digital-twin-orchestration-agent` & `skill-for-digital-twin-orchestration`
    14. **F1 & Hypercar Constructors**: `f1-hypercar-assembly-agent` & `skill-for-modular-f1-and-hypercar-assembly`
    15. **Garage & Comparisons**: `garage-comparison-studio-agent` & `skill-for-garage-comparison-studio`
- **MANDATORY 1-HOUR MINIMUM & 20-SET VISUAL COMPARISON LAW (REALISTIC EXTERIOR UPGRADE PROTOCOL)**:
  - **Minimum 1 Hour Intensive Work per Vehicle**: Each vehicle GLB must receive at least 60 minutes of intensive procedural CAD engineering, topology sculpting, materials configuration, and kinematic rigging. Rushing to export draft assets is strictly prohibited.
  - **The 5-Angle Validation Set Standard (1 Set = 5 Photos)**: Every visual inspection set consists of 5 high-resolution viewport captures from canonical automotive angles:
    1. Front 3/4 Dynamic Perspective (`CAMERA_FRONT_34`)
    2. Rear 3/4 Dynamic Perspective (`CAMERA_REAR_34`)
    3. Direct Side Profile (`CAMERA_SIDE`)
    4. Direct Front Fascia (`CAMERA_FRONT`)
    5. Direct Rear Fascia (`CAMERA_REAR`)
    Every angle must be compared directly against authentic high-resolution reference photographs of the real vehicle.
  - **Iterative Comparison Volume (Minimum 10 to 20 Sets per Vehicle)**: The agent must execute at least 10 to 20 cycles of: Capture 5 angles -> Compare against real reference photos -> Identify flaws (shutlines, door gaps, glass curvature, pillar thickness, reflections, wheel fitment) -> Refine CAD geometry & materials in Blender -> Re-capture and re-compare. Time consumption is explicitly NOT a concern; highest visual fidelity and authentic Class-A CAD quality is paramount.
  - **Mandatory Authentic Glass & Windows**:
    - Real window cutouts in the body shell (NEVER leave solid unibody sheet metal underneath glass).
    - Double-curved 3D glass geometry (windshield, rear backlite, door side windows, quarter glass) with optical dielectric transmission ($\ge 0.92$, IOR 1.52, roughness $\le 0.02$, clearcoat 1.0).
    - Black ceramic frit (serigraphy) border with gradient dot-matrix transitions around all glass perimeters.
    - Structural A/B/C-pillars, roof rails, and rubber weatherstripping seals.
    - Full interior cockpit visibility through the glass (cockpit interior tub, bucket seats, and steering wheel must be visible).
  - **Mandatory Interactive Articulating Doors**:
    - Fully cut out and separated door assemblies (`DOOR_FL`, `DOOR_FR` / `Door_L`, `Door_R`) with uniform 3.5mm shutlines.
    - Structural inner door cards and door jambs (no hollow voids or see-through holes when doors open).
    - Physical hinge pivot origins positioned exactly on the actual vehicle hinge axis (`export_apply=False`).
    - Door side windows and exterior mirrors mounted to the door assembly so they articulate together.
    - Baked NLA opening actions (`Action_Door_L_Open`, `Action_Door_R_Open`).
  - **Scope Exclusion**:
    - Historical eras of Formula 1 and Hypercars are explicitly REMOVED from the exterior upgrade plan. Focus squarely on the core production fleet (Supercars, Sports Cars, Sedans, Coupes, Grand Tourers, GT3, etc.).

### 7. Mandatory UI Theme Directive: Light Theme Preference with Soft Light Colors (ABSOLUTE DIRECTIVE)
- **Primary Design Law**: The user strictly prefers a **Light Theme** as the default and permanent UI visual language.
- **NEVER use bleached, washed-out, or plain pure `#ffffff` everywhere**: A sterile white hospital-ward aesthetic with low-contrast gray lines is strictly forbidden.
- **Always use curated, harmonious soft light colors**:
  - **Base Canvas & Panels**: Soft warm alabaster, linen, and warm cream (`#f6f4ee`, `#f8f6f0`, `#f1eee5`, `#efece2`).
  - **Subsystem & Focus Cards**: Soft eucalyptus and sage greens (`#eef4ec`, `#e3ede0`, `#d8e6d4`).
  - **Metric Tiles & Badges**: Soft ice/sky blues (`#e8f1f8`, `#dcebf5`), soft amber/champagne (`#fcf4e8`, `#f7e8ce`), soft lavender/periwinkle (`#eeeff8`, `#dfdff2`), and soft mint (`#e7f5eb`).
  - **Borders & Dividers**: Distinct warm taupe, sage, and sand borders (`#ccd8c8`, `#d9d3c5`, `#cbd5e2`) with subtle depth and 1px crisp separation so nested tiles never bleed into one another.
  - **Typography Contrast**: Deep, legible, sharp charcoal and slate typography (`#0f172a`, `#1e293b`, `#334155`), with bold font weights on headers, metric figures, and labels.
  - **Progress & Stat Indicators**: High-contrast, vibrant saturated indicator fills (emerald, sky/cyan, amber/gold, violet) resting on distinctly tinted, clearly visible tracks (`#dbe5d8`, `#d8e2eb`, `#ebdcc4`).
  - **Interactive Elements & Docks**: Luminous pearl-titanium frosted glass (`bg-[#f4f3ee]/95`, border `#d2cec3`) with vibrant, colored hover states.







