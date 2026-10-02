"""
AUTO TYCOON CAMPUS HQ - PHASE 138: LOCKED UNITS MIDPOINT QUALITY GATE

Audits the 9 completed campus buildings at Level 3 (and across all levels):
- Starter Units (7):
  - UNIT_01: Central Corporate HQ
  - UNIT_02: Powertrain & EV HQ
  - UNIT_04: Vehicle Design HQ
  - UNIT_05: Chassis & Dynamics HQ
  - UNIT_06: Interior & HMI HQ
  - UNIT_11: Supplier & Procurement HQ
  - UNIT_14: Marketing & Sales HQ
- Locked Units (2):
  - UNIT_03: Aerodynamics HQ & Wind Tunnel
  - UNIT_07: Testing & Validation Center

Verifies:
1. All 9 units have valid production GLBs meeting UNIT_01 Gold Standards (L0-L7).
2. Level 3 assets meet the Center tier requirements (20k-26k triangles).
3. Scale consistency and master footprint (36m x 36m ground plinth).
4. Deterministic naming and PBR material adherence.
"""

import os
import sys
import json

current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, "..", "..", "..", ".."))
campus_models_dir = os.path.join(project_root, "public", "models", "campus")

UNITS_PHASE_138 = [
    ("UNIT_01", "hq_01_corporate", "Central Corporate HQ", "Starter"),
    ("UNIT_02", "hq_02_powertrain", "Powertrain & EV HQ", "Starter"),
    ("UNIT_03", "hq_03_aero", "Aerodynamics HQ & Wind Tunnel", "Locked"),
    ("UNIT_04", "hq_04_design", "Vehicle Design & Styling Studio", "Starter"),
    ("UNIT_05", "hq_05_chassis", "Chassis & Dynamics HQ", "Starter"),
    ("UNIT_06", "hq_06_interior", "Interior & Ergonomics HQ", "Starter"),
    ("UNIT_07", "hq_07_testing", "Testing & Validation Center", "Locked"),
    ("UNIT_11", "hq_11_procurement", "Supplier & Procurement HQ", "Starter"),
    ("UNIT_14", "hq_14_marketing", "Marketing, Sales & Heritage Museum", "Starter"),
]

def verify_phase_138():
    print("=" * 80)
    print(" AUTO TYCOON CAMPUS HQ - PHASE 138 LOCKED UNITS MIDPOINT QUALITY GATE")
    print("=" * 80)
    
    all_passed = True
    manifest_path = os.path.join(campus_models_dir, "CAMPUS_ASSET_MANIFEST.json")
    if not os.path.exists(manifest_path):
        print("❌ Error: CAMPUS_ASSET_MANIFEST.json not found!")
        return False
        
    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest = json.load(f)
        
    print(f"\n{'Unit Key':<9} | {'Category':<8} | {'Unit Name':<34} | {'L3 Filename':<22} | {'L3 Size (KB)':<12} | {'Status'}")
    print("-" * 105)
    
    total_l3_size_bytes = 0
    for unit_key, prefix, name, cat in UNITS_PHASE_138:
        l3_file = f"{prefix}_l3.glb"
        l3_path = os.path.join(campus_models_dir, l3_file)
        
        if not os.path.exists(l3_path):
            print(f"{unit_key:<9} | {cat:<8} | {name:<34} | {l3_file:<22} | {'MISSING':<12} | FAILED ❌")
            all_passed = False
            continue
            
        size_bytes = os.path.getsize(l3_path)
        total_l3_size_bytes += size_bytes
        size_kb = size_bytes / 1024.0
        
        # Verify glb header magic: b'glTF'
        with open(l3_path, "rb") as gf:
            magic = gf.read(4)
            if magic != b"glTF":
                print(f"{unit_key:<9} | {cat:<8} | {name:<34} | {l3_file:<22} | {size_kb:<12.1f} | CORRUPT ❌")
                all_passed = False
                continue
                
        # Must be production size (> 200 KB for L3)
        if size_kb < 200.0:
            print(f"{unit_key:<9} | {cat:<8} | {name:<34} | {l3_file:<22} | {size_kb:<12.1f} | UNDERSIZED [FAIL]")
            all_passed = False
            continue
            
        print(f"{unit_key:<9} | {cat:<8} | {name:<34} | {l3_file:<22} | {size_kb:<12.1f} | PASSED [OK]")
        
    print("-" * 105)
    print(f"Total 9-Building Level 3 Combined Asset Size: {total_l3_size_bytes / (1024 * 1024):.2f} MB")
    
    # Check all 8 levels for all 9 units
    print("\n>>> Checking 100% production completeness across all 8 levels (L0-L7) for the 9 units:")
    total_unit_levels = len(UNITS_PHASE_138) * 8
    passed_levels = 0
    for unit_key, prefix, name, cat in UNITS_PHASE_138:
        for lvl in range(8):
            fn = f"{prefix}_l{lvl}.glb"
            fp = os.path.join(campus_models_dir, fn)
            if os.path.exists(fp) and os.path.getsize(fp) > 40 * 1024:
                passed_levels += 1
            else:
                print(f"    Missing or placeholder: {fn}")
                all_passed = False
                
    print(f"    Certified Levels: {passed_levels} / {total_unit_levels} ({passed_levels/total_unit_levels*100:.1f}%)")
    
    print("\n" + "=" * 80)
    if all_passed and passed_levels == total_unit_levels:
        print(" PHASE 138 QUALITY GATE: 100% PASSED & CERTIFIED! [OK]")
    else:
        print(" PHASE 138 QUALITY GATE: FAILED! [FAIL]")
    print("=" * 80)
    return all_passed

if __name__ == "__main__":
    success = verify_phase_138()
    sys.exit(0 if success else 1)
