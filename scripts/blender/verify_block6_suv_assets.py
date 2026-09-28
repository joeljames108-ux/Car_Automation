"""
Comprehensive Verification Script for Block 6: SUV Architecture (Phases 67-80, Vehicles 34-40)
"""

import os
import glob

VEHICLES = [
    {
        "id": 34,
        "era": "1970s",
        "name": "Range Rover Classic 3-Door",
        "phases": (67, 68),
        "code_p1": "scripts/blender/generators/generate_range_rover_classic_phase1.py",
        "code_p2": "scripts/blender/generators/generate_range_rover_classic_phase2.py",
        "glb_era": "public/models/vehicles/suv/1970s/vehicle.glb",
        "glb_comp": "public/models/Car_Range_Rover_Classic_1970s_Complete.glb",
        "glb_exp": "exports/Car_Range_Rover_Classic_1970s.glb",
        "render_prefix": "range_rover_classic"
    },
    {
        "id": 35,
        "era": "1980s",
        "name": "Jeep Grand Wagoneer SJ",
        "phases": (69, 70),
        "code_p1": "scripts/blender/generators/generate_jeep_grand_wagoneer_phase1.py",
        "code_p2": "scripts/blender/generators/generate_jeep_grand_wagoneer_phase2.py",
        "glb_era": "public/models/vehicles/suv/1980s/vehicle.glb",
        "glb_comp": "public/models/Car_Jeep_Grand_Wagoneer_1980s_Complete.glb",
        "glb_exp": "exports/Car_Jeep_Grand_Wagoneer_1980s.glb",
        "render_prefix": "jeep_grand_wagoneer"
    },
    {
        "id": 36,
        "era": "1990s",
        "name": "Ford Explorer 1st Gen",
        "phases": (71, 72),
        "code_p1": "scripts/blender/generators/generate_ford_explorer_phase1.py",
        "code_p2": "scripts/blender/generators/generate_ford_explorer_phase2.py",
        "glb_era": "public/models/vehicles/suv/1990s/vehicle.glb",
        "glb_comp": "public/models/Car_Ford_Explorer_1990s_Complete.glb",
        "glb_exp": "exports/Car_Ford_Explorer_1990s.glb",
        "render_prefix": "ford_explorer"
    },
    {
        "id": 37,
        "era": "2000s",
        "name": "BMW X5 E53 4.8is",
        "phases": (73, 74),
        "code_p1": "scripts/blender/generators/generate_bmw_x5_e53_phase1.py",
        "code_p2": "scripts/blender/generators/generate_bmw_x5_e53_phase2.py",
        "glb_era": "public/models/vehicles/suv/2000s/vehicle.glb",
        "glb_comp": "public/models/Car_BMW_X5_E53_2000s_Complete.glb",
        "glb_exp": "exports/Car_BMW_X5_E53_2000s.glb",
        "render_prefix": "bmw_x5_e53"
    },
    {
        "id": 38,
        "era": "2010s",
        "name": "Range Rover L405 Autobiography",
        "phases": (75, 76),
        "code_p1": "scripts/blender/generators/generate_range_rover_l405_phase1.py",
        "code_p2": "scripts/blender/generators/generate_range_rover_l405_phase2.py",
        "glb_era": "public/models/vehicles/suv/2010s/vehicle.glb",
        "glb_comp": "public/models/Car_Range_Rover_L405_2010s_Complete.glb",
        "glb_exp": "exports/Car_Range_Rover_L405_2010s.glb",
        "render_prefix": "range_rover_l405"
    },
    {
        "id": 39,
        "era": "2020s",
        "name": "BMW XM Label Red",
        "phases": (77, 78),
        "code_p1": "scripts/blender/generators/generate_bmw_xm_phase1.py",
        "code_p2": "scripts/blender/generators/generate_bmw_xm_phase2.py",
        "glb_era": "public/models/vehicles/suv/2020s/vehicle.glb",
        "glb_comp": "public/models/Car_BMW_XM_2020s_Complete.glb",
        "glb_exp": "exports/Car_BMW_XM_2020s.glb",
        "render_prefix": "bmw_xm"
    },
    {
        "id": 40,
        "era": "future",
        "name": "Rivian R1S Adventure Quad-Motor",
        "phases": (79, 80),
        "code_p1": "scripts/blender/generators/generate_rivian_r1s_phase1.py",
        "code_p2": "scripts/blender/generators/generate_rivian_r1s_phase2.py",
        "glb_era": "public/models/vehicles/suv/future/vehicle.glb",
        "glb_comp": "public/models/Car_Rivian_R1S_Future_Complete.glb",
        "glb_exp": "exports/Car_Rivian_R1S_Future.glb",
        "render_prefix": "rivian_r1s"
    },
]

brain_dir = r"C:\Users\acer\.gemini\antigravity-ide\brain\fd8f6cef-bcdc-4ccd-be00-38d826129553"
view_suffixes = [
    "front_three_quarter.png",
    "rear_three_quarter.png",
    "side_profile.png",
    "front_elevation.png",
    "rear_elevation.png"
]

print("=" * 110)
print(f"{'ID':2s} | {'Era':7s} | {'Name':32s} | {'P1 LOC':6s} | {'P2 LOC':6s} | {'GLB Era':10s} | {'GLB Comp':10s} | {'GLB Exp':10s} | {'Renders':7s}")
print("-" * 110)

all_passed = True
for v in VEHICLES:
    p1_loc = len(open(v["code_p1"], "r", encoding="utf-8").readlines())
    p2_loc = len(open(v["code_p2"], "r", encoding="utf-8").readlines())

    s_era = os.path.getsize(v["glb_era"]) if os.path.exists(v["glb_era"]) else 0
    s_comp = os.path.getsize(v["glb_comp"]) if os.path.exists(v["glb_comp"]) else 0
    s_exp = os.path.getsize(v["glb_exp"]) if os.path.exists(v["glb_exp"]) else 0

    renders_found = 0
    for sfx in view_suffixes:
        rpath = os.path.join(brain_dir, f"{v['render_prefix']}_{sfx}")
        if os.path.exists(rpath):
            renders_found += 1

    p1_ok = p1_loc >= 2500
    p2_ok = p2_loc >= 2500
    glb_ok = s_era > 200000 and s_comp > 200000 and s_exp > 200000
    rnd_ok = renders_found == 5

    status = "OK" if (p1_ok and p2_ok and glb_ok and rnd_ok) else "FAIL"
    if status == "FAIL":
        all_passed = False

    print(f"V{v['id']:02d} | {v['era']:7s} | {v['name']:32s} | {p1_loc:6d} | {p2_loc:6d} | {s_era/1024:7.1f} KB | {s_comp/1024:7.1f} KB | {s_exp/1024:7.1f} KB | {renders_found}/5 [{status}]")

print("=" * 110)
if all_passed:
    print("ALL 7 SUV VEHICLES (VEHICLES 34-40, PHASES 67-80) ARE 100% CERTIFIED AND COMPLIANT!")
else:
    print("WARNING: Some assets failed validation criteria!")
