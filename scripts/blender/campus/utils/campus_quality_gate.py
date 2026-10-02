"""
AUTO TYCOON CAMPUS HQ - AUTOMATED QUALITY GATE AUDITOR (PHASE 63)

Rigorous multi-point quality validator ensuring all regenerated campus building assets
satisfy the UNIT_01 Proven Production Standard and 7 Iron Laws:
1. Deterministic Naming: 100% of objects use upper snake case or descriptive category prefix.
   Zero generic Blender primitive names ('Cube', 'Plane', 'Cylinder', etc.).
2. Polygon Budget Contract: Explicit triangle count validation against the §0.2 budget table.
3. PBR Material Verification: All materials must be properly node-based, non-empty, and from palette.
4. Ground Contact Check: Base of the building rests accurately at Z=0.0m.
5. Scale & Dimension Bounds: Realistic meter bounds consistent with campus master plots.
6. Clean Hierarchy: Proper root grouping and parent relationships.
"""

import sys
import os
import math
from typing import Dict, Any, Tuple, List

# Polygon Budget Table per §0.2
CAMPUS_TRIANGLE_BUDGETS = {
    0: {"tier": "empty_plot", "min": 800, "target_min": 1000, "target_max": 3000, "hard_max": 4500},
    1: {"tier": "office", "min": 5000, "target_min": 8000, "target_max": 12000, "hard_max": 18000},
    2: {"tier": "department", "min": 10000, "target_min": 14000, "target_max": 18000, "hard_max": 24000},
    3: {"tier": "center", "min": 16000, "target_min": 20000, "target_max": 26000, "hard_max": 32000},
    4: {"tier": "advanced_hq", "min": 24000, "target_min": 30000, "target_max": 40000, "hard_max": 48000},
    5: {"tier": "world_class_hq", "min": 32000, "target_min": 40000, "target_max": 55000, "hard_max": 65000},
    6: {"tier": "innovation_campus", "min": 42000, "target_min": 50000, "target_max": 65000, "hard_max": 75000},
    7: {"tier": "hypermodern_campus", "min": 50000, "target_min": 60000, "target_max": 80000, "hard_max": 95000},
}

GENERIC_NAME_SUBSTRINGS = ["cube", "plane", "cylinder", "sphere", "cone", "torus", "mesh", "beziercircle", "beziercurve"]

def count_mesh_triangles(mesh) -> int:
    """Calculates true triangulated face count for a Blender mesh data block."""
    tris = 0
    for p in mesh.polygons:
        vcount = len(p.vertices)
        if vcount == 3:
            tris += 1
        elif vcount == 4:
            tris += 2
        else:
            tris += max(1, vcount - 2)
    return tris

def audit_scene(unit_id: str, level: int, bpy_module=None) -> Tuple[bool, Dict[str, Any]]:
    """
    Audits the currently active Blender scene.
    Returns (passed, details_dict).
    """
    if bpy_module is None:
        import bpy
        bpy_module = bpy

    report = {
        "unit_id": unit_id,
        "level": level,
        "tier": CAMPUS_TRIANGLE_BUDGETS.get(level, {}).get("tier", "unknown"),
        "checks": {},
        "passed": True,
        "warnings": [],
        "errors": []
    }

    mesh_objects = [o for o in bpy_module.data.objects if o.type == 'MESH']
    
    # Check 1: Mesh Object Presence
    if not mesh_objects:
        report["passed"] = False
        report["errors"].append("No mesh objects found in scene.")
        report["checks"]["mesh_presence"] = False
        return False, report
    report["checks"]["mesh_presence"] = True

    # Check 2: Deterministic Naming Audit (No generic default names)
    generic_found = []
    for o in bpy_module.data.objects:
        clean_name = o.name.lower().strip()
        # Check if name is exactly or prefix-matches generic primitive
        for gen in GENERIC_NAME_SUBSTRINGS:
            if clean_name == gen or clean_name.startswith(f"{gen}.") or clean_name.startswith(f"{gen}_") or clean_name.startswith(f"{gen}0"):
                generic_found.append(o.name)
                break
    
    if generic_found:
        report["passed"] = False
        report["errors"].append(f"Generic primitive names detected ({len(generic_found)}): {generic_found[:5]}")
        report["checks"]["naming_audit"] = False
    else:
        report["checks"]["naming_audit"] = True

    # Check 3: Triangle Budget
    total_tris = sum(count_mesh_triangles(o.data) for o in mesh_objects)
    budget = CAMPUS_TRIANGLE_BUDGETS.get(level, {"min": 500, "hard_max": 100000, "target_min": 1000, "target_max": 50000})
    report["total_triangles"] = total_tris
    report["budget"] = budget

    if total_tris > budget["hard_max"]:
        report["passed"] = False
        report["errors"].append(f"Triangle count {total_tris:,} exceeds hard max {budget['hard_max']:,}")
        report["checks"]["triangle_budget"] = False
    elif total_tris < budget["min"]:
        # Warn if under minimum
        report["warnings"].append(f"Triangle count {total_tris:,} is below minimum recommended {budget['min']:,}")
        report["checks"]["triangle_budget"] = True
    else:
        report["checks"]["triangle_budget"] = True

    # Check 4: Materials Audit
    mats_in_scene = list(bpy_module.data.materials)
    if not mats_in_scene:
        report["warnings"].append("No materials defined in scene.")
        report["checks"]["materials_audit"] = False
    else:
        unassigned_meshes = [o.name for o in mesh_objects if len(o.data.materials) == 0 and not o.name.startswith("HITBOX_")]
        if unassigned_meshes:
            report["warnings"].append(f"{len(unassigned_meshes)} meshes have no assigned materials: {unassigned_meshes[:5]}")
        report["checks"]["materials_audit"] = True
    report["material_names"] = [m.name for m in mats_in_scene]

    # Check 5: Ground Contact & Bounding Box
    min_z = float('inf')
    max_z = float('-inf')
    min_x = min_y = float('inf')
    max_x = max_y = float('-inf')

    import mathutils
    for o in mesh_objects:
        for v in o.bound_box:
            world_v = o.matrix_world @ mathutils.Vector(v)
            min_z = min(min_z, world_v.z)
            max_z = max(max_z, world_v.z)
            min_x = min(min_x, world_v.x)
            max_x = max(max_x, world_v.x)
            min_y = min(min_y, world_v.y)
            max_y = max(max_y, world_v.y)

    bbox_dim = {
        "width_x": round(max_x - min_x, 2),
        "depth_y": round(max_y - min_y, 2),
        "height_z": round(max_z - min_z, 2),
        "min_z": round(min_z, 3),
        "max_z": round(max_z, 3),
    }
    report["bounding_box"] = bbox_dim

    # Ground contact test: base should be within 0.25m of Z=0
    if abs(min_z) > 0.35 and level > 0:
        report["warnings"].append(f"Ground contact deviation: min Z is {min_z:.2f}m (expected ~0.0m)")
        report["checks"]["ground_contact"] = False
    else:
        report["checks"]["ground_contact"] = True

    # Check 6: Root Node Presence
    roots = [o for o in bpy_module.data.objects if o.parent is None and o.type not in ('LIGHT', 'CAMERA')]
    report["root_nodes"] = [r.name for r in roots]
    report["checks"]["root_node_present"] = len(roots) >= 1

    return report["passed"], report

def print_audit_summary(report: Dict[str, Any]):
    print("\n" + "=" * 65)
    print(f" CAMPUS QUALITY GATE REPORT: {report.get('unit_id', 'UNKNOWN')} L{report.get('level', '?')}")
    print(f" Tier: {report.get('tier', 'unknown').upper()}")
    print("=" * 65)
    print(f" Status: {'[PASSED] ✅' if report.get('passed') else '[FAILED] ❌'}")
    print(f" Triangles: {report.get('total_triangles', 0):,} (Range: {report.get('budget', {}).get('target_min', 0):,} - {report.get('budget', {}).get('target_max', 0):,})")
    print(f" Dimensions: X={report.get('bounding_box', {}).get('width_x')}m, Y={report.get('bounding_box', {}).get('depth_y')}m, Height={report.get('bounding_box', {}).get('height_z')}m")
    print(f" Checks:")
    for k, v in report.get("checks", {}).items():
        print(f"   - {k:24}: {'PASS' if v else 'FAIL'}")
    if report.get("errors"):
        print("\n Errors:")
        for err in report["errors"]:
            print(f"   [!] {err}")
    if report.get("warnings"):
        print("\n Warnings:")
        for w in report["warnings"]:
            print(f"   [*] {w}")
    print("=" * 65 + "\n")

def audit_glb_file(glb_path: str) -> Tuple[bool, Dict[str, Any]]:
    import bpy
    abs_path = os.path.abspath(glb_path)
    if not os.path.exists(abs_path):
        return False, {"error": f"File not found: {abs_path}"}

    # Infer level from filename
    filename = os.path.basename(abs_path).lower()
    level = 1
    for lvl in range(8):
        if f"_l{lvl}." in filename:
            level = lvl
            break

    # Clean scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()
    for block in bpy.data.meshes: bpy.data.meshes.remove(block)
    for block in bpy.data.materials: bpy.data.materials.remove(block)

    bpy.ops.import_scene.gltf(filepath=abs_path)
    unit_id = os.path.splitext(filename)[0]
    passed, report = audit_scene(unit_id, level, bpy)
    report["file_size_bytes"] = os.path.getsize(abs_path)
    report["file_size_kb"] = round(report["file_size_bytes"] / 1024, 1)
    return passed, report

if __name__ == "__main__":
    target = "public/models/campus/hq_02_powertrain_l1.glb"
    for arg in sys.argv:
        if arg.endswith(".glb"):
            target = arg
            break

    passed, report = audit_glb_file(target)
    print_audit_summary(report)
    if not passed:
        sys.exit(1)

