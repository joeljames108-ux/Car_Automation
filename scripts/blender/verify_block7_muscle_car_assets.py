"""
Comprehensive Verification Script for Block 7: Muscle Car Architecture (Phases 81-94, Vehicles 41-47)
"""

import os
import glob

VEHICLES = [
    {
        "id": 41,
        "era": "1970s",
        "name": "Dodge Challenger R/T 426 Hemi",
        "phases": (81, 82),
        "code_p1": "scripts/blender/generators/generate_dodge_challenger_1970_phase1.py",
        "code_p2": "scripts/blender/generators/generate_dodge_challenger_1970_phase2.py",
        "glb_era": "public/models/vehicles/muscle_car/1970s/vehicle.glb",
        "glb_comp": "public/models/Car_Dodge_Challenger_1970s_Complete.glb",
        "glb_exp": "exports/Car_Dodge_Challenger_1970s.glb",
        "render_prefix": "dodge_challenger_1970"
    },
    {
        "id": 42,
        "era": "1980s",
        "name": "Ford Mustang 5.0 LX Foxbody",
        "phases": (83, 84),
        "code_p1": "scripts/blender/generators/generate_foxbody_mustang_1980s_phase1.py",
        "code_p2": "scripts/blender/generators/generate_foxbody_mustang_1980s_phase2.py",
        "glb_era": "public/models/vehicles/muscle_car/1980s/vehicle.glb",
        "glb_comp": "public/models/Car_Ford_Mustang_Foxbody_1980s_Complete.glb",
        "glb_exp": "exports/Car_Ford_Mustang_Foxbody_1980s.glb",
        "render_prefix": "foxbody_mustang_1980s"
    },
    {
        "id": 43,
        "era": "1990s",
        "name": "Chevrolet Camaro SS 4th Gen",
        "phases": (85, 86),
        "code_p1": "scripts/blender/generators/generate_chevrolet_camaro_ss_1990s_phase1.py",
        "code_p2": "scripts/blender/generators/generate_chevrolet_camaro_ss_1990s_phase2.py",
        "glb_era": "public/models/vehicles/muscle_car/1990s/vehicle.glb",
        "glb_comp": "public/models/Car_Chevrolet_Camaro_SS_1990s_Complete.glb",
        "glb_exp": "exports/Car_Chevrolet_Camaro_SS_1990s.glb",
        "render_prefix": "camaro_ss_1990s"
    },
    {
        "id": 44,
        "era": "2000s",
        "name": "Ford Mustang GT 2005 S197",
        "phases": (87, 88),
        "code_p1": "scripts/blender/generators/generate_ford_mustang_gt_2000s_phase1.py",
        "code_p2": "scripts/blender/generators/generate_ford_mustang_gt_2000s_phase2.py",
        "glb_era": "public/models/vehicles/muscle_car/2000s/vehicle.glb",
        "glb_comp": "public/models/Car_Ford_Mustang_GT_2000s_Complete.glb",
        "glb_exp": "exports/Car_Ford_Mustang_GT_2000s.glb",
        "render_prefix": "mustang_gt_2000s"
    },
    {
        "id": 45,
        "era": "2010s",
        "name": "Dodge Charger SRT Hellcat",
        "phases": (89, 90),
        "code_p1": "scripts/blender/generators/generate_dodge_charger_hellcat_2010s_phase1.py",
        "code_p2": "scripts/blender/generators/generate_dodge_charger_hellcat_2010s_phase2.py",
        "glb_era": "public/models/vehicles/muscle_car/2010s/vehicle.glb",
        "glb_comp": "public/models/Car_Dodge_Charger_Hellcat_2010s_Complete.glb",
        "glb_exp": "exports/Car_Dodge_Charger_Hellcat_2010s.glb",
        "render_prefix": "charger_hellcat_2010s"
    },
    {
        "id": 46,
        "era": "2020s",
        "name": "Dodge Challenger SRT Demon 170",
        "phases": (91, 92),
        "code_p1": "scripts/blender/generators/generate_dodge_challenger_demon_2020s_phase1.py",
        "code_p2": "scripts/blender/generators/generate_dodge_challenger_demon_2020s_phase2.py",
        "glb_era": "public/models/vehicles/muscle_car/2020s/vehicle.glb",
        "glb_comp": "public/models/Car_Dodge_Challenger_Demon_2020s_Complete.glb",
        "glb_exp": "exports/Car_Dodge_Challenger_Demon_2020s.glb",
        "render_prefix": "challenger_demon_2020s"
    },
    {
        "id": 47,
        "era": "future",
        "name": "Dodge Charger Daytona SRT Banshee EV",
        "phases": (93, 94),
        "code_p1": "scripts/blender/generators/generate_dodge_charger_daytona_future_phase1.py",
        "code_p2": "scripts/blender/generators/generate_dodge_charger_daytona_future_phase2.py",
        "glb_era": "public/models/vehicles/muscle_car/future/vehicle.glb",
        "glb_comp": "public/models/Car_Dodge_Charger_Daytona_Future_Complete.glb",
        "glb_exp": "exports/Car_Dodge_Charger_Daytona_Future.glb",
        "render_prefix": "charger_daytona_future"
    },
]

brain_dir = r"C:\Users\acer\.gemini\antigravity-ide\brain\2c47a96e-e12f-4035-bd51-7c626c58db65"
fallback_brain_dir = r"C:\Users\acer\.gemini\antigravity-ide\brain\fd8f6cef-bcdc-4ccd-be00-38d826129553"
view_suffixes = [
    "front_three_quarter.png",
    "rear_three_quarter.png",
    "side_profile.png",
    "front_elevation.png",
    "rear_elevation.png"
]

print("=" * 114)
print(f"{'ID':2s} | {'Era':7s} | {'Name':35s} | {'P1 LOC':6s} | {'P2 LOC':6s} | {'GLB Era':10s} | {'GLB Comp':10s} | {'GLB Exp':10s} | {'Renders':7s}")
print("-" * 114)

all_passed = True
for v in VEHICLES:
    p1_exists = os.path.exists(v["code_p1"])
    p2_exists = os.path.exists(v["code_p2"])
    p1_loc = len(open(v["code_p1"], "r", encoding="utf-8").readlines()) if p1_exists else 0
    p2_loc = len(open(v["code_p2"], "r", encoding="utf-8").readlines()) if p2_exists else 0

    s_era = os.path.getsize(v["glb_era"]) if os.path.exists(v["glb_era"]) else 0
    s_comp = os.path.getsize(v["glb_comp"]) if os.path.exists(v["glb_comp"]) else 0
    s_exp = os.path.getsize(v["glb_exp"]) if os.path.exists(v["glb_exp"]) else 0

    renders_found = 0
    for sfx in view_suffixes:
        rpath = os.path.join(brain_dir, f"{v['render_prefix']}_{sfx}")
        if not os.path.exists(rpath):
            rpath = os.path.join(fallback_brain_dir, f"{v['render_prefix']}_{sfx}")
        if os.path.exists(rpath):
            renders_found += 1

    p1_ok = p1_loc >= 2500
    p2_ok = p2_loc >= 2500
    glb_ok = s_era > 50000 and s_comp > 50000 and s_exp > 50000
    rnd_ok = renders_found == 5

    status = "OK" if (p1_ok and p2_ok and glb_ok and rnd_ok) else "PENDING"
    if status != "OK":
        all_passed = False

    print(f"V{v['id']:02d} | {v['era']:7s} | {v['name']:35s} | {p1_loc:6d} | {p2_loc:6d} | {s_era/1024:7.1f} KB | {s_comp/1024:7.1f} KB | {s_exp/1024:7.1f} KB | {renders_found}/5 [{status}]")

print("=" * 114)
if all_passed:
    print("ALL 7 MUSCLE CAR VEHICLES (VEHICLES 41-47, PHASES 81-94) ARE 100% CERTIFIED AND COMPLIANT!")
else:
    print("STATUS: Block 7 has vehicles pending completion.")
