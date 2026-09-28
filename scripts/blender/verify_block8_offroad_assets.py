"""
=============================================================================
Automated Audit & Quality Certification Suite: Block 8 (Off-Road 4x4)
Validates all 7 vehicles across Phases 95 to 108 (Vehicles 48 to 54):
1. Code Quality Law: Every generator script has >= 2,500 LOC
2. Rolling Chassis GLB presence & valid size (> 50 KB)
3. Complete Vehicle Tri-Target GLBs presence & valid size (> 50 KB)
4. Visual Assessment 5/5 1080p Perspective Renders in brain directory
=============================================================================
"""

import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BRAIN_DIR = r"C:\Users\acer\.gemini\antigravity-ide\brain\2c47a96e-e12f-4035-bd51-7c626c58db65"
ROOT_DIR = r"e:\Car_Automation"

VEHICLES = [
    {
        "id": 48,
        "era": "1970s",
        "name": "Toyota Land Cruiser FJ40",
        "phases": (95, 96),
        "gen_phase1": "scripts/blender/generators/generate_toyota_land_cruiser_fj40_1970s_phase1.py",
        "gen_phase2": "scripts/blender/generators/generate_toyota_land_cruiser_fj40_1970s_phase2.py",
        "chassis_glb": "exports/Car_Toyota_Land_Cruiser_FJ40_1970s_Chassis.glb",
        "tri_targets": [
            "public/models/vehicles/offroad_4x4/1970s/vehicle.glb",
            "public/models/Car_Toyota_Land_Cruiser_FJ40_1970s_Complete.glb",
            "exports/Car_Toyota_Land_Cruiser_FJ40_1970s.glb"
        ],
        "render_prefix": "land_cruiser_fj40_1970s"
    },
    {
        "id": 49,
        "era": "1980s",
        "name": "Mercedes-Benz G-Class W460 280GE",
        "phases": (97, 98),
        "gen_phase1": "scripts/blender/generators/generate_mercedes_g_class_w460_1980s_phase1.py",
        "gen_phase2": "scripts/blender/generators/generate_mercedes_g_class_w460_1980s_phase2.py",
        "chassis_glb": "exports/Car_Mercedes_G_Class_W460_1980s_Chassis.glb",
        "tri_targets": [
            "public/models/vehicles/offroad_4x4/1980s/vehicle.glb",
            "public/models/Car_Mercedes_G_Class_W460_1980s_Complete.glb",
            "exports/Car_Mercedes_G_Class_W460_1980s.glb"
        ],
        "render_prefix": "g_class_w460_1980s"
    },
    {
        "id": 50,
        "era": "1990s",
        "name": "Land Rover Defender 90 300Tdi",
        "phases": (99, 100),
        "gen_phase1": "scripts/blender/generators/generate_land_rover_defender_90_1990s_phase1.py",
        "gen_phase2": "scripts/blender/generators/generate_land_rover_defender_90_1990s_phase2.py",
        "chassis_glb": "exports/Car_Land_Rover_Defender_90_1990s_Chassis.glb",
        "tri_targets": [
            "public/models/vehicles/offroad_4x4/1990s/vehicle.glb",
            "public/models/Car_Land_Rover_Defender_90_1990s_Complete.glb",
            "exports/Car_Land_Rover_Defender_90_1990s.glb"
        ],
        "render_prefix": "defender_90_1990s"
    },
    {
        "id": 51,
        "era": "2000s",
        "name": "Jeep Wrangler Rubicon TJ",
        "phases": (101, 102),
        "gen_phase1": "scripts/blender/generators/generate_jeep_wrangler_tj_2000s_phase1.py",
        "gen_phase2": "scripts/blender/generators/generate_jeep_wrangler_tj_2000s_phase2.py",
        "chassis_glb": "exports/Car_Jeep_Wrangler_TJ_2000s_Chassis.glb",
        "tri_targets": [
            "public/models/vehicles/offroad_4x4/2000s/vehicle.glb",
            "public/models/Car_Jeep_Wrangler_TJ_2000s_Complete.glb",
            "exports/Car_Jeep_Wrangler_TJ_2000s.glb"
        ],
        "render_prefix": "wrangler_tj_2000s"
    },
    {
        "id": 52,
        "era": "2010s",
        "name": "Toyota FJ Cruiser Trail Teams",
        "phases": (103, 104),
        "gen_phase1": "scripts/blender/generators/generate_toyota_fj_cruiser_2010s_phase1.py",
        "gen_phase2": "scripts/blender/generators/generate_toyota_fj_cruiser_2010s_phase2.py",
        "chassis_glb": "exports/Car_Toyota_FJ_Cruiser_2010s_Chassis.glb",
        "tri_targets": [
            "public/models/vehicles/offroad_4x4/2010s/vehicle.glb",
            "public/models/Car_Toyota_FJ_Cruiser_2010s_Complete.glb",
            "exports/Car_Toyota_FJ_Cruiser_2010s.glb"
        ],
        "render_prefix": "fj_cruiser_2010s"
    },
    {
        "id": 53,
        "era": "2020s",
        "name": "Ford Bronco Badlands Sasquatch",
        "phases": (105, 106),
        "gen_phase1": "scripts/blender/generators/generate_ford_bronco_badlands_2020s_phase1.py",
        "gen_phase2": "scripts/blender/generators/generate_ford_bronco_badlands_2020s_phase2.py",
        "chassis_glb": "exports/Car_Ford_Bronco_Badlands_2020s_Chassis.glb",
        "tri_targets": [
            "public/models/vehicles/offroad_4x4/2020s/vehicle.glb",
            "public/models/Car_Ford_Bronco_Badlands_2020s_Complete.glb",
            "exports/Car_Ford_Bronco_Badlands_2020s.glb"
        ],
        "render_prefix": "bronco_sasquatch_2020s"
    },
    {
        "id": 54,
        "era": "future",
        "name": "Mercedes-Benz Concept EQG",
        "phases": (107, 108),
        "gen_phase1": "scripts/blender/generators/generate_mercedes_concept_eqg_future_phase1.py",
        "gen_phase2": "scripts/blender/generators/generate_mercedes_concept_eqg_future_phase2.py",
        "chassis_glb": "exports/Car_Mercedes_Concept_EQG_Future_Chassis.glb",
        "tri_targets": [
            "public/models/vehicles/offroad_4x4/future/vehicle.glb",
            "public/models/Car_Mercedes_Concept_EQG_Future_Complete.glb",
            "exports/Car_Mercedes_Concept_EQG_Future.glb"
        ],
        "render_prefix": "concept_eqg_future"
    }
]

VIEW_SUFFIXES = [
    "front_three_quarter.png",
    "rear_three_quarter.png",
    "side_profile.png",
    "front_elevation.png",
    "rear_elevation.png"
]


def audit_block8():
    print("=" * 80)
    print("BLOCK 8 AUDIT: OFF-ROAD 4x4 ARCHITECTURE (VEHICLES 48-54, PHASES 95-108)")
    print("=" * 80)

    total_checks = 0
    passed_checks = 0
    failures = []

    for v in VEHICLES:
        print(f"\n--- Vehicle {v['id']} ({v['era'].upper()}): {v['name']} [Phases {v['phases'][0]} & {v['phases'][1]}] ---")
        
        # 1. Code Quality Law (LOC >= 2500)
        for gen_path in (v["gen_phase1"], v["gen_phase2"]):
            total_checks += 1
            full_gen = os.path.join(ROOT_DIR, gen_path)
            if not os.path.exists(full_gen):
                failures.append(f"Missing generator file: {gen_path}")
                print(f"  ❌ Missing generator: {gen_path}")
            else:
                with open(full_gen, "r", encoding="utf-8") as f:
                    loc = sum(1 for _ in f)
                if loc >= 2500:
                    passed_checks += 1
                    print(f"  ✓ Generator LOC: {os.path.basename(gen_path)} ({loc:,} lines >= 2,500)")
                else:
                    failures.append(f"{gen_path} has {loc} lines (< 2,500)")
                    print(f"  ❌ LOC too low: {os.path.basename(gen_path)} ({loc:,} < 2,500)")

        # 2. Rolling Chassis GLB Check
        total_checks += 1
        chassis_full = os.path.join(ROOT_DIR, v["chassis_glb"])
        if os.path.exists(chassis_full) and os.path.getsize(chassis_full) > 50000:
            passed_checks += 1
            print(f"  ✓ Rolling Chassis GLB: {v['chassis_glb']} ({os.path.getsize(chassis_full):,} bytes)")
        else:
            failures.append(f"Missing or invalid chassis GLB: {v['chassis_glb']}")
            print(f"  ❌ Chassis GLB issue: {v['chassis_glb']}")

        # 3. Tri-Target Complete GLBs Check
        for target in v["tri_targets"]:
            total_checks += 1
            full_target = os.path.join(ROOT_DIR, target)
            if os.path.exists(full_target) and os.path.getsize(full_target) > 50000:
                passed_checks += 1
                print(f"  ✓ Tri-Target GLB: {target} ({os.path.getsize(full_target):,} bytes)")
            else:
                failures.append(f"Missing or invalid tri-target GLB: {target}")
                print(f"  ❌ Tri-Target GLB issue: {target}")

        # 4. 5 Assessment Renders Check
        for sfx in VIEW_SUFFIXES:
            total_checks += 1
            render_filename = f"{v['render_prefix']}_{sfx}"
            render_full = os.path.join(BRAIN_DIR, render_filename)
            if os.path.exists(render_full) and os.path.getsize(render_full) > 100000:
                passed_checks += 1
                print(f"  ✓ Render: {render_filename} ({os.path.getsize(render_full):,} bytes)")
            else:
                failures.append(f"Missing or invalid render: {render_filename}")
                print(f"  ❌ Render missing: {render_filename}")

    print("\n" + "=" * 80)
    print(f"AUDIT SUMMARY: {passed_checks}/{total_checks} CHECKS PASSED ({(passed_checks/total_checks)*100:.1f}%)")
    if failures:
        print(f"FAILED CHECKS ({len(failures)}):")
        for f in failures:
            print(f"  - {f}")
        print("=" * 80)
        return False
    else:
        print("✓ 100% PRODUCTION COMPLIANCE CERTIFIED ACROSS ALL BLOCK 8 VEHICLES & PHASES!")
        print("=" * 80)
        return True


if __name__ == "__main__":
    success = audit_block8()
    sys.exit(0 if success else 1)
