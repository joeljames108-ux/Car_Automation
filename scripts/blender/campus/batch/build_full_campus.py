"""
AUTO TYCOON CAMPUS HQ - MASTER PROCEDURAL BATCH BUILDER & AUDITOR (PHASES 133–136)

Orchestrates batch generation and auditing for all 14 units across all 8 progression levels (112 GLBs total):
- UNIT_01: Central Corporate HQ
- UNIT_02: Powertrain & EV Engineering HQ
- UNIT_03: Aerodynamics HQ & Wind Tunnel
- UNIT_04: Vehicle Design & Styling Studio
- UNIT_05: Chassis & Dynamics HQ
- UNIT_06: Interior & Ergonomics HQ
- UNIT_07: Testing & Validation Center
- UNIT_08: Motorsport & Works Team HQ
- UNIT_09: Commercial & Heavy Vehicles HQ
- UNIT_10: Manufacturing Plant Complex
- UNIT_11: Supplier & Procurement HQ
- UNIT_12: Quality & Reliability Assurance
- UNIT_13: Safety & Crash Test Center
- UNIT_14: Marketing, Sales & Heritage Museum

Generates `CAMPUS_ASSET_MANIFEST.json` detailing file sizes, status, and integrity.
"""

import os
import sys
import json
import time

current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, "..", "..", "..", ".."))
campus_models_dir = os.path.join(project_root, "public", "models", "campus")

UNITS = [
    ("UNIT_01", "hq_01_corporate", "Central Corporate HQ"),
    ("UNIT_02", "hq_02_powertrain", "Powertrain & EV HQ"),
    ("UNIT_03", "hq_03_aero", "Aerodynamics HQ & Wind Tunnel"),
    ("UNIT_04", "hq_04_design", "Vehicle Design & Styling Studio"),
    ("UNIT_05", "hq_05_chassis", "Chassis & Dynamics HQ"),
    ("UNIT_06", "hq_06_interior", "Interior & Ergonomics HQ"),
    ("UNIT_07", "hq_07_testing", "Testing & Validation Center"),
    ("UNIT_08", "hq_08_motorsport", "Motorsport & Works Team HQ"),
    ("UNIT_09", "hq_09_commercial", "Commercial & Heavy Vehicles HQ"),
    ("UNIT_10", "hq_10_factory", "Manufacturing Plant Complex"),
    ("UNIT_11", "hq_11_procurement", "Supplier & Procurement HQ"),
    ("UNIT_12", "hq_12_quality", "Quality & Reliability Assurance"),
    ("UNIT_13", "hq_13_safety", "Safety & Crash Test Center"),
    ("UNIT_14", "hq_14_marketing", "Marketing, Sales & Heritage Museum"),
]

TIERS = [
    "empty_plot",
    "office",
    "department",
    "center",
    "advanced_hq",
    "world_class_hq",
    "innovation_campus",
    "hypermodern_campus",
]

def audit_campus_assets(output_manifest_path: str = None) -> dict:
    manifest = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "total_units": len(UNITS),
        "total_levels_per_unit": 8,
        "expected_total_glbs": len(UNITS) * 8,
        "present_glbs": 0,
        "missing_glbs": 0,
        "total_size_bytes": 0,
        "units": {},
    }

    for unit_key, file_prefix, unit_name in UNITS:
        unit_entry = {
            "unit_key": unit_key,
            "unit_name": unit_name,
            "prefix": file_prefix,
            "levels": {},
        }

        for lvl in range(8):
            filename = f"{file_prefix}_l{lvl}.glb"
            filepath = os.path.join(campus_models_dir, filename)
            exists = os.path.isfile(filepath)
            size = os.path.getsize(filepath) if exists else 0

            if exists:
                manifest["present_glbs"] += 1
                manifest["total_size_bytes"] += size
            else:
                manifest["missing_glbs"] += 1

            unit_entry["levels"][lvl] = {
                "level": lvl,
                "tier": TIERS[lvl],
                "filename": filename,
                "exists": exists,
                "size_bytes": size,
                "size_kb": round(size / 1024, 1),
            }

        manifest["units"][unit_key] = unit_entry

    if output_manifest_path is None:
        output_manifest_path = os.path.join(campus_models_dir, "CAMPUS_ASSET_MANIFEST.json")

    with open(output_manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    print(f"\n==================================================")
    print(f"AUTO TYCOON CAMPUS ASSET AUDIT REPORT")
    print(f"==================================================")
    print(f"Total Units:          {manifest['total_units']}")
    print(f"Expected GLB Assets:  {manifest['expected_total_glbs']}")
    print(f"Present GLB Assets:   {manifest['present_glbs']}")
    print(f"Missing GLB Assets:   {manifest['missing_glbs']}")
    print(f"Total Campus Size:    {round(manifest['total_size_bytes'] / 1024 / 1024, 2)} MB")
    print(f"Manifest Written To:  {output_manifest_path}")
    print(f"==================================================\n")

    return manifest

if __name__ == "__main__":
    audit_campus_assets()
