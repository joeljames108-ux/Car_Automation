---
name: skill-for-automated-glb-quality-gate
description: Automated CI/CD verification script and architectural quality gate standard for validating 15MB file sizes, 420k+ polygon density, 11-subsystem hierarchy completeness, isolated kinematic pivots, semantic hitboxes, baked NLA actions, and glTF metadata compliance.
---

# Skill: Automated Automotive GLB Production Quality Gate

## 1. Quality Assurance Objective & CI/CD Directive

To guarantee that every 3D automotive digital twin deployed across the web simulator, configurator, and visualization suite satisfies the **15MB / 400,000+ Triangle Quality Standard** and the **5 Pillars of Interactive Automotive GLBs**, assets must pass an automated Python verification gate before being merged, wired, or released.

Assets that fail the gate cannot be committed to production.

---

## 2. The 7 Production Quality Gates

Every GLB model is audited across seven non-negotiable quality metrics:

```
                  ┌─────────────────────────────────────────┐
                  │       Automotive GLB Quality Gate       │
                  └────────────────────┬────────────────────┘
                                       │
        ┌───────────────┬──────────────┼───────────────┬───────────────┐
        ▼               ▼              ▼               ▼               ▼
 ┌──────────────┐┌──────────────┐┌──────────────┐┌──────────────┐┌──────────────┐
 │ 1. File Size ││  2. Polygon  ││ 3. Subsystem ││ 4. Semantic  ││ 5. Baked NLA │
 │ 13.5-16.5 MB ││ Density >=420k││ Hierarchy 11 ││ Hitboxes <=64││ Actions >=6  │
 └──────────────┘└──────────────┘└──────────────┘└──────────────┘└──────────────┘
                                       │
                                ┌──────┴──────┐
                                ▼             ▼
                         ┌──────────────┐┌──────────────┐
                         │ 6. Audio /   ││ 7. Material  │
                         │ glTF Extras  ││ PBR BSDF     │
                         └──────────────┘└──────────────┘
```

| Gate # | Metric | Target Specification (Master Vehicle) | Modular Subsystem Component Target | Pass Threshold |
|:---|:---|:---|:---|:---|
| **Gate 1** | **File Size Budget** | $14.0\text{MB} - 18.5\text{MB}$ uncompressed (~3.5MB meshopt) | Seats: $1.8-5.0\text{MB}$, Wheels: $1.0-3.2\text{MB}$, Dash: $2.5-5.5\text{MB}$, Doors: $1.5-3.5\text{MB}$ | $100\%$ score if within bounds |
| **Gate 2** | **Polygon Density** | $\ge 650,000$ triangles across all nodes | Seats: $\ge 65\text{k}$/seat, Wheels: $\ge 22\text{k}$/corner, Dash: $\ge 70\text{k}$, Doors: $\ge 30\text{k}$/door, Pedals: $\ge 16\text{k}$ | Strict numeric floor; scaled penalty below target |
| **Gate 3** | **Hierarchy Completeness** | All 11 master nodes populated (`BODY`, `INTERIOR_SEATS`, `INTERIOR_COCKPIT`, `DOORS`, `WHEELS_BRAKES`, `LIGHTING`, `POWERTRAIN`, `CHASSIS_SUSPENSION`, `PEDALS`, `UNDERBODY`, `CAMERAS`) | Minimum expected sub-assemblies present | Zero empty branches permitted |
| **Gate 4** | **Semantic Hitboxes** | Low-poly collision hulls prefixed `HITBOX_*` | Every interactive part must have a hitbox | $\le 64$ triangles per hitbox hull |
| **Gate 5** | **Baked NLA Actions** | Keyframed actions present (`Action_*`) with valid channel samplers | Minimum 1 action per articulating feature | Zero broken animation channels |
| **Gate 6** | **Metadata & Haptics** | Valid JSON in `node.extras` with `interactive: true`, `option_id`, and `sound_fx` | Audio-haptic parameters specified | Required on all user-interactive nodes |
| **Gate 7** | **PBR Material Quality** | Distinct Principled BSDF materials with metallic/roughness and normal maps | Minimum 6 distinct PBR materials | Clearcoat, transmission, or carbon sheen present |

---

## 3. Grade Scoring & Certification Standard

The quality gate outputs a unified score from $0\%$ to $100\%$:
- **Grade A (Production Ready)**: $\ge 90.0\%$ — Approved for immediate deployment to `public/models/`.
- **Grade B (Acceptable with Warnings)**: $75.0\% - 89.9\%$ — Conditional pass for development previews; requires geometry subdivision or hierarchy completion before final production.
- **Grade F (Non-Compliant)**: $< 75.0\%$ — **Hard rejection**; CI build fails with exit code `1`.

---

## 4. Standalone Python Inspector Implementation (`validate_glb_production.py`)

The validator uses pure Python standard library (`struct`, `json`, `os`, `sys`) with **zero third-party dependencies**, ensuring it runs instantly on any development rig, CI/CD runner, or headless container:

```bash
# Validate complete vehicle
python scripts/validate_glb_production.py public/models/Car_GT3_Complete.glb --component complete

# Validate modular seat subsystem
python scripts/validate_glb_production.py public/models/interior/seat_luxury_leather.glb --component seat

# Validate modular wheel subsystem
python scripts/validate_glb_production.py public/models/modular_parts/wheel_forged_monoblock.glb --component wheel
```

---

## 5. Automated CI/CD GitHub Actions Workflow Integration

Embed the quality gate in continuous integration pipelines (`.github/workflows/validate-3d-assets.yml`):

```yaml
name: Validate 3D Automotive GLB Assets
on: [push, pull_request]

jobs:
  validate-assets:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Run Automotive GLB Quality Gate
        run: |
          python scripts/validate_glb_production.py public/models/Car_GT3_Complete.glb --component complete
```

---

## 6. Pre-Commit Checklist Before Running the Gate
- [ ] Blender export executed with `export_apply=False` (pivots intact).
- [ ] Blender export executed with `export_extras=True` (metadata intact).
- [ ] Blender export executed with `export_animations=True` and `export_animation_mode='ACTIONS'`.
- [ ] Subsurf modifiers enabled for render and viewport export.
- [ ] Run `python scripts/validate_glb_production.py <file>` to verify $\ge 90\%$ Grade A certification.
