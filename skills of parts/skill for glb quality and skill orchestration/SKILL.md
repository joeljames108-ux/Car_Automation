---
name: skill-for-glb-quality-and-skill-orchestration
description: Repository-wide orchestration standard ensuring all 17 automotive engineering skills are automatically applied wherever relevant and all GLB assets maintain 15MB budget, 420k+ polygon density, and Grade A certification.
---

# Skill: Automotive GLB Quality Assurance & Skill Orchestration

## 1. Executive Objective & Mandate

To prevent fragmentation, low-poly regressions, and missing interactivity across 3D vehicle assets, this skill defines the **Automotive Skill Orchestration Framework**. 

Whenever any automotive 3D asset is generated, modified, reviewed, or exported, the agent **MUST identify which subsystem domains are present and systematically apply the corresponding skill from the 17-Skill Matrix**.

---

## 2. Automated Subsystem-to-Skill Dispatch Matrix

When modeling, upgrading, or auditing any vehicle assembly, the orchestrator inspects the mesh hierarchy and binds the corresponding specialized skill:

| Subsystem Domain | Mesh Indicators / Node Keywords | Mandatory Skill to Activate | Strict Geometric & Kinematic Contract |
|:---|:---|:---|:---|
| **Interior Seating** | `seat`, `cushion`, `backrest`, `headrest` | [`skill-for-seats`](file:///c:/Users/joelj/Downloads/project-bolt-sb1-a1kjcyhr%20(3)/project/skills%20of%20parts/skill%20for%20seats/SKILL.md) | 70k-90k tris/seat (140k-180k pair), 5-flute parabolic lofting, $-8\text{mm}$ gutters, $+14^\circ$ to $+17^\circ$ recline, `Action_Seat_Recline/Slide`, bolster morphs |
| **Steering & Column** | `steering`, `wheel_rim`, `paddle`, `column` | [`skill-for-steering-wheel`](file:///c:/Users/joelj/Downloads/project-bolt-sb1-a1kjcyhr%20(3)/project/skills%20of%20parts/skill%20for%20steering%20wheel/SKILL.md) | 35k-50k tris, D-cut rim, magnetic paddle shifters, Manettino drive mode dial, `Action_Steering_Turn`, column tilt |
| **Dashboard & Console** | `dashboard`, `binnacle`, `console`, `oled` | [`skill-for-dashboard`](file:///c:/Users/joelj/Downloads/project-bolt-sb1-a1kjcyhr%20(3)/project/skills%20of%20parts/skill%20for%20dashboard/SKILL.md) | 75k-95k tris, curved OLED binnacle, climate ribbon, cantilevered display, butterfly armrests, shifter actions |
| **Door Panels & Glass** | `door_panel`, `door_fl`, `window_regulator` | [`skill-for-door-panels`](file:///c:/Users/joelj/Downloads/project-bolt-sb1-a1kjcyhr%20(3)/project/skills%20of%20parts/skill%20for%20door%20panels/SKILL.md) | 35k-50k tris/door (70k-100k pair), laser speaker grilles, tactile switchpacks, `Action_Window_Lower`, `Action_Door_Latch_Pull` |
| **Wheels, Tires & Brakes** | `wheel`, `tire`, `caliper`, `rotor` | [`skill-for-wheels-and-brakes`](file:///c:/Users/joelj/Downloads/project-bolt-sb1-a1kjcyhr%20(3)/project/skills%20of%20parts/skill%20for%20wheels%20and%20brakes/SKILL.md) | 96k-105k tris across 4 corners, 3D carved directional tread sipes, cross-drilled ceramic vanes, `Action_Wheel_Spin` |
| **Exterior Body & Aero** | `body`, `fender`, `hood`, `trunk`, `roof` | [`skill-for-exterior-body-and-doors`](file:///c:/Users/joelj/Downloads/project-bolt-sb1-a1kjcyhr%20(3)/project/skills%20of%20parts/skill%20for%20exterior%20body%20and%20doors/SKILL.md) | 135k-150k tris, 12-section lofted cage, 3.5mm shutlines, articulating doors/hood/trunk, `Action_Aero_Wing_Deploy` |
| **Lighting Optics** | `headlamp`, `taillamp`, `drl`, `light_pipe` | [`skill-for-lighting-optics`](file:///c:/Users/joelj/Downloads/project-bolt-sb1-a1kjcyhr%20(3)/project/skills%20of%20parts/skill%20for%20lighting%20optics/SKILL.md) | 16k-25k tris, quartz projector lenses, 3D extruded DRL light-pipes, full-width OLED tailbar, DRL/turn indicator actions |
| **Powertrain & Engine** | `engine`, `v8`, `turbo`, `exhaust`, `plenum` | [`skill-for-powertrain-and-engine-bay`](file:///c:/Users/joelj/Downloads/project-bolt-sb1-a1kjcyhr%20(3)/project/skills%20of%20parts/skill%20for%20powertrain%20and%20engine%20bay/SKILL.md) | 35k-45k tris, Hot-V twin-turbo V8, carbon plenums, equal-length headers, removable cover, idle vibe morph |
| **Chassis & Suspension** | `chassis`, `subframe`, `suspension`, `pushrod` | [`skill-for-chassis-and-suspension`](file:///c:/Users/joelj/Downloads/project-bolt-sb1-a1kjcyhr%20(3)/project/skills%20of%20parts/skill%20for%20chassis%20and%20suspension/SKILL.md) | 35k-40k tris, carbon monocoque tub, tubular subframes, double-wishbone pushrods, bell cranks, suspension stroke action |
| **Pedals & Footwell** | `pedal`, `throttle`, `brake_pedal`, `dead_pedal`| [`skill-for-pedals-and-footwell`](file:///c:/Users/joelj/Downloads/project-bolt-sb1-a1kjcyhr%20(3)/project/skills%20of%20parts/skill%20for%20pedals%20and%20footwell/SKILL.md) | 18k-25k tris, organ throttle ($0-18^\circ$), hanging brake with balance bar, dead pedal, pedal stroke depression actions |
| **Underbody & Undertray** | `undertray`, `venturi`, `diffuser_floor` | [`skill-for-underbody-and-aero-undertray`](file:///c:/Users/joelj/Downloads/project-bolt-sb1-a1kjcyhr%20(3)/project/skills%20of%20parts/skill%20for%20underbody%20and%20aero%20undertray/SKILL.md) | 8k-12k tris, enclosed flat floor, twin Venturi expansion tunnels ($10-12^\circ$), vortex strakes, active diffuser trim |

---

## 3. Mandatory Cross-Cutting Skills Checklist

For every master asset or subsystem assembly, the orchestrator also verifies that all 6 cross-cutting standards are fulfilled:

1. **`skill-for-interactive-glb`**:
   - Local origins preserved on hinge/slide axes (`export_apply=False`).
   - Lightweight `HITBOX_*` collision hulls ($\le 64$ triangles) for 60 FPS WebGL raycasts.
2. **`skill-for-glb-materials-and-variants`**:
   - Exterior paints and interior leathers embedded via native `KHR_materials_variants`.
   - Single geometry buffer housing multiple vehicle liveries.
3. **`skill-for-glb-meshopt-compression`**:
   - Pre-compress high-density 15MB GLBs into `.opt.glb` companion stream files using `meshopt` (75-85% size reduction, 0 triangle loss).
4. **`skill-for-vehicle-camera-framing`**:
   - Bake standard glTF `CAMERA_*` nodes (Hero 3/4, Cockpit POV, Wheels, Engine, Cargo) with calibrated FOVs.
5. **`skill-for-audio-haptic-binding`**:
   - Populate `node.extras.sound_fx` and `node.extras.haptic` for Web Audio procedural synthesis and mobile touch haptics.
6. **`skill-for-automated-glb-quality-gate`**:
   - Run `python scripts/validate_glb_production.py <file>` and ensure minimum Grade A score ($\ge 90\%$).

---

## 4. CLI Execution & Orchestration Commands

The repository provides automated commands to audit, watch, and enforce quality across the entire asset fleet:

```bash
# Audit all models in public/models/ and update docs/GLB_QUALITY_AUDIT_MANIFEST.json
npm run glb:audit

# Start the continuous quality guardian file watcher
npm run glb:watch

# Strict CI/CD quality gate enforcement
npm run glb:enforce

# Audit a single asset directly
python scripts/glb_quality_orchestrator.py --single public/models/interior/seat_luxury_leather.glb
```
