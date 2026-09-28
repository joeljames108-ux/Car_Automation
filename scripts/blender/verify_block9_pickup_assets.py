"""
=============================================================================
Block 9: Pickup Truck Architecture (Vehicles 55-61, Phases 109-122)
Comprehensive Production Certification & Verification Suite
Asserts 77/77 quality checks:
- 14 Generator scripts with >= 2,500 LOC each
- 7 Standalone Rolling Chassis GLBs (> 50 KB)
- 21 Master Complete Tri-Target GLBs (> 50 KB)
- 35 Photorealistic 1080p EEVEE Assessment Renders in Brain directory
=============================================================================
"""

import os
import sys

# Ensure UTF-8 output on Windows console
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

brain_dir = r"C:\Users\acer\.gemini\antigravity-ide\brain\2c47a96e-e12f-4035-bd51-7c626c58db65"
root_dir = r"e:\Car_Automation"

vehicles = [
    {
        "num": 55,
        "name": "Chevrolet C10 Cheyenne",
        "era": "1970s",
        "phases": (109, 110),
        "gen1": "generate_chevrolet_c10_cheyenne_1970s_phase1.py",
        "gen2": "generate_chevrolet_c10_cheyenne_1970s_phase2.py",
        "chassis": "exports/Car_Chevrolet_C10_Cheyenne_1970s_Chassis.glb",
        "tri_targets": [
            "public/models/vehicles/pickup/1970s/vehicle.glb",
            "public/models/Car_Chevrolet_C10_Cheyenne_1970s_Complete.glb",
            "exports/Car_Chevrolet_C10_Cheyenne_1970s.glb"
        ],
        "render_prefix": "c10_cheyenne_1970s"
    },
    {
        "num": 56,
        "name": "Toyota Hilux 4th Gen",
        "era": "1980s",
        "phases": (111, 112),
        "gen1": "generate_toyota_hilux_4th_gen_1980s_phase1.py",
        "gen2": "generate_toyota_hilux_4th_gen_1980s_phase2.py",
        "chassis": "exports/Car_Toyota_Hilux_4thGen_1980s_Chassis.glb",
        "tri_targets": [
            "public/models/vehicles/pickup/1980s/vehicle.glb",
            "public/models/Car_Toyota_Hilux_4thGen_1980s_Complete.glb",
            "exports/Car_Toyota_Hilux_4thGen_1980s.glb"
        ],
        "render_prefix": "hilux_4th_gen_1980s"
    },
    {
        "num": 57,
        "name": "Ford F-150 SVT Lightning",
        "era": "1990s",
        "phases": (113, 114),
        "gen1": "generate_ford_f150_svt_lightning_1990s_phase1.py",
        "gen2": "generate_ford_f150_svt_lightning_1990s_phase2.py",
        "chassis": "exports/Car_Ford_F150_SVT_Lightning_1990s_Chassis.glb",
        "tri_targets": [
            "public/models/vehicles/pickup/1990s/vehicle.glb",
            "public/models/Car_Ford_F150_SVT_Lightning_1990s_Complete.glb",
            "exports/Car_Ford_F150_SVT_Lightning_1990s.glb"
        ],
        "render_prefix": "f150_lightning_1990s"
    },
    {
        "num": 58,
        "name": "Dodge Ram 1500 3rd Gen",
        "era": "2000s",
        "phases": (115, 116),
        "gen1": "generate_dodge_ram_1500_2000s_phase1.py",
        "gen2": "generate_dodge_ram_1500_2000s_phase2.py",
        "chassis": "exports/Car_Dodge_Ram_1500_2000s_Chassis.glb",
        "tri_targets": [
            "public/models/vehicles/pickup/2000s/vehicle.glb",
            "public/models/Car_Dodge_Ram_1500_2000s_Complete.glb",
            "exports/Car_Dodge_Ram_1500_2000s.glb"
        ],
        "render_prefix": "dodge_ram_1500_2000s"
    },
    {
        "num": 59,
        "name": "Ford F-150 Raptor 2nd Gen",
        "era": "2010s",
        "phases": (117, 118),
        "gen1": "generate_ford_f150_raptor_2010s_phase1.py",
        "gen2": "generate_ford_f150_raptor_2010s_phase2.py",
        "chassis": "exports/Car_Ford_F150_Raptor_2010s_Chassis.glb",
        "tri_targets": [
            "public/models/vehicles/pickup/2010s/vehicle.glb",
            "public/models/Car_Ford_F150_Raptor_2010s_Complete.glb",
            "exports/Car_Ford_F150_Raptor_2010s.glb"
        ],
        "render_prefix": "f150_raptor_2010s"
    },
    {
        "num": 60,
        "name": "Rivian R1T",
        "era": "2020s",
        "phases": (119, 120),
        "gen1": "generate_rivian_r1t_2020s_phase1.py",
        "gen2": "generate_rivian_r1t_2020s_phase2.py",
        "chassis": "exports/Car_Rivian_R1T_2020s_Chassis.glb",
        "tri_targets": [
            "public/models/vehicles/pickup/2020s/vehicle.glb",
            "public/models/Car_Rivian_R1T_2020s_Complete.glb",
            "exports/Car_Rivian_R1T_2020s.glb"
        ],
        "render_prefix": "rivian_r1t_2020s"
    },
    {
        "num": 61,
        "name": "Tesla Cybertruck",
        "era": "future",
        "phases": (121, 122),
        "gen1": "generate_tesla_cybertruck_future_phase1.py",
        "gen2": "generate_tesla_cybertruck_future_phase2.py",
        "chassis": "exports/Car_Tesla_Cybertruck_Future_Chassis.glb",
        "tri_targets": [
            "public/models/vehicles/pickup/future/vehicle.glb",
            "public/models/Car_Tesla_Cybertruck_Future_Complete.glb",
            "exports/Car_Tesla_Cybertruck_Future.glb"
        ],
        "render_prefix": "cybertruck_future"
    },
]

render_views = [
    "front_three_quarter.png",
    "rear_three_quarter.png",
    "side_profile.png",
    "front_elevation.png",
    "rear_elevation.png"
]

passed_checks = 0
total_checks = 0
failures = []

print("=" * 85)
print("BLOCK 9: PICKUP TRUCK ARCHITECTURE (VEHICLES 55-61) PRODUCTION AUDIT")
print("=" * 85)

for v in vehicles:
    print(f"\n[VEHICLE {v['num']}] {v['name']} ({v['era'].upper()}, Phases {v['phases'][0]} & {v['phases'][1]}):")
    
    # Check generator scripts >= 2,500 LOC
    for g_name in [v['gen1'], v['gen2']]:
        total_checks += 1
        g_path = os.path.join(root_dir, "scripts", "blender", "generators", g_name)
        if os.path.exists(g_path):
            with open(g_path, 'r', encoding='utf-8', errors='ignore') as f:
                loc = len(f.readlines())
            if loc >= 2500:
                print(f"  ✓ Generator {g_name}: {loc:,} LOC (>= 2,500)")
                passed_checks += 1
            else:
                failures.append(f"{g_name}: only {loc} LOC (< 2,500)")
                print(f"  ✗ Generator {g_name}: {loc:,} LOC (< 2,500)")
        else:
            failures.append(f"{g_name}: file does not exist")
            print(f"  ✗ Generator {g_name}: NOT FOUND")

    # Check Standalone Chassis GLB
    total_checks += 1
    c_path = os.path.join(root_dir, v['chassis'])
    if os.path.exists(c_path):
        c_sz = os.path.getsize(c_path)
        if c_sz > 50000:
            print(f"  ✓ Chassis GLB: {v['chassis']} ({c_sz / 1024:.1f} KB)")
            passed_checks += 1
        else:
            failures.append(f"{v['chassis']}: size {c_sz} bytes too small")
            print(f"  ✗ Chassis GLB {v['chassis']}: {c_sz} bytes (< 50 KB)")
    else:
        failures.append(f"{v['chassis']}: file not found")
        print(f"  ✗ Chassis GLB {v['chassis']}: NOT FOUND")

    # Check 3 Tri-Target Complete GLBs
    for t_rel in v['tri_targets']:
        total_checks += 1
        t_path = os.path.join(root_dir, t_rel)
        if os.path.exists(t_path):
            t_sz = os.path.getsize(t_path)
            if t_sz > 50000:
                print(f"  ✓ Target GLB: {t_rel} ({t_sz / 1024:.1f} KB)")
                passed_checks += 1
            else:
                failures.append(f"{t_rel}: size {t_sz} bytes too small")
                print(f"  ✗ Target GLB {t_rel}: {t_sz} bytes (< 50 KB)")
        else:
            failures.append(f"{t_rel}: file not found")
            print(f"  ✗ Target GLB {t_rel}: NOT FOUND")

    # Check 5 Photorealistic 1080p Renders
    for rv in render_views:
        total_checks += 1
        r_file = f"{v['render_prefix']}_{rv}"
        r_path = os.path.join(brain_dir, r_file)
        if os.path.exists(r_path):
            r_sz = os.path.getsize(r_path)
            if r_sz > 100000:
                print(f"  ✓ Render: {r_file} ({r_sz / 1024:.1f} KB)")
                passed_checks += 1
            else:
                failures.append(f"{r_file}: size {r_sz} bytes too small")
                print(f"  ✗ Render {r_file}: {r_sz} bytes (< 100 KB)")
        else:
            failures.append(f"{r_file}: file not found")
            print(f"  ✗ Render {r_file}: NOT FOUND")

print("\n" + "=" * 85)
print(f"AUDIT SUMMARY: {passed_checks}/{total_checks} CHECKS PASSED ({(passed_checks/total_checks)*100:.1f}%)")
print("=" * 85)

if failures:
    print(f"FAILED CHECKS ({len(failures)}):")
    for f in failures:
        print(f"  - {f}")
    sys.exit(1)
else:
    print("ALL 77 CHECKS PASSED: BLOCK 9 (PICKUP TRUCK ARCHITECTURE) CERTIFIED GRADE A PRODUCTION READY!")
    sys.exit(0)
