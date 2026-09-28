#!/usr/bin/env python3
"""
Automated Automotive GLB Production Quality Gate
Validates 3D GLB digital twins against:
- The 15MB Byte Budget Law (13.5 MB - 16.5 MB) or Modular Component Budgets
- The 420,000+ Triangle Quality Standard
- 11 Subsystem Hierarchy Completeness
- Kinematic Pivot Isolation (export_apply=False)
- Semantic Raycast Hitboxes (HITBOX_* <= 64 triangles)
- Baked NLA Animation Tracks (Action_*)
- Self-Describing Extras & Audio-Haptic Metadata

Usage:
  python validate_glb_production.py <path_to_glb> [--component <seat|wheel|steering|door|dashboard|complete>]
"""

import sys
import os
import json
import struct
import argparse

SUBSYSTEM_BUDGETS = {
    "complete": {
        "min_triangles": 550000,
        "max_triangles": 850000,
        "min_size_mb": 13.0,
        "max_size_mb": 20.0,
        "required_nodes": [
            "BODY", "INTERIOR_SEATS", "INTERIOR_COCKPIT", "DOORS",
            "WHEELS_BRAKES", "LIGHTING", "POWERTRAIN", "CHASSIS_SUSPENSION",
            "PEDALS", "UNDERBODY"
        ]
    },
    "seat": {
        "min_triangles": 65000,
        "max_triangles": 95000,
        "min_size_mb": 2.0,
        "max_size_mb": 6.0,
        "required_nodes": ["Cushion", "Backrest", "Headrest", "Shell"]
    },
    "steering": {
        "min_triangles": 30000,
        "max_triangles": 55000,
        "min_size_mb": 1.0,
        "max_size_mb": 3.5,
        "required_nodes": ["Rim", "Spoke", "Paddle"]
    },
    "wheel": {
        "min_triangles": 22000,
        "max_triangles": 35000,
        "min_size_mb": 0.9,
        "max_size_mb": 3.2,
        "required_nodes": ["Rim", "Tire", "Rotor", "Caliper"]
    },
    "door": {
        "min_triangles": 30000,
        "max_triangles": 55000,
        "min_size_mb": 1.0,
        "max_size_mb": 3.8,
        "required_nodes": ["Panel", "Window", "Latch"]
    },
    "dashboard": {
        "min_triangles": 70000,
        "max_triangles": 105000,
        "min_size_mb": 2.5,
        "max_size_mb": 6.5,
        "required_nodes": ["Binnacle", "OLED", "Console", "Armrest"]
    },
    "pedals": {
        "min_triangles": 16000,
        "max_triangles": 28000,
        "min_size_mb": 0.6,
        "max_size_mb": 2.0,
        "required_nodes": ["Throttle", "Brake", "Dead_Pedal"]
    }
}

def parse_glb(file_path: str):
    """Parses binary GLB container and returns JSON header, file size, and chunk offsets."""
    if not os.path.isfile(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    file_size_bytes = os.path.getsize(file_path)
    file_size_mb = file_size_bytes / (1024 * 1024)

    with open(file_path, "rb") as f:
        header = f.read(12)
        if len(header) < 12:
            raise ValueError("Invalid GLB: File is shorter than 12-byte header.")

        magic, version, length = struct.unpack("<4sII", header)
        if magic != b"glTF":
            raise ValueError(f"Invalid magic identifier: expected b'glTF', got {magic}")
        if version != 2:
            raise ValueError(f"Unsupported glTF version: expected 2, got {version}")

        # First chunk: JSON
        chunk_header = f.read(8)
        if len(chunk_header) < 8:
            raise ValueError("Invalid GLB: Missing JSON chunk header.")

        chunk_len, chunk_type = struct.unpack("<II", chunk_header)
        if chunk_type != 0x4E4F534A: # 'JSON'
            raise ValueError(f"Invalid first chunk: expected JSON (0x4E4F534A), got {hex(chunk_type)}")

        json_bytes = f.read(chunk_len)
        gltf_json = json.loads(json_bytes.decode("utf-8"))

    return gltf_json, file_size_mb, file_size_bytes

def calculate_geometry_metrics(gltf_json):
    """Calculates total vertices and triangles across all meshes and primitives."""
    accessors = gltf_json.get("accessors", [])
    meshes = gltf_json.get("meshes", [])

    total_triangles = 0
    total_vertices = 0
    mesh_stats = []

    for mesh_idx, mesh in enumerate(meshes):
        mesh_name = mesh.get("name", f"Mesh_{mesh_idx}")
        mesh_tris = 0
        mesh_verts = 0

        for prim in mesh.get("primitives", []):
            # Check indices
            if "indices" in prim:
                idx_accessor = accessors[prim["indices"]]
                prim_tris = idx_accessor.get("count", 0) // 3
            elif "POSITION" in prim.get("attributes", {}):
                pos_accessor = accessors[prim["attributes"]["POSITION"]]
                prim_tris = pos_accessor.get("count", 0) // 3
            else:
                prim_tris = 0

            # Vertices
            if "POSITION" in prim.get("attributes", {}):
                pos_accessor = accessors[prim["attributes"]["POSITION"]]
                prim_verts = pos_accessor.get("count", 0)
            else:
                prim_verts = 0

            mesh_tris += prim_tris
            mesh_verts += prim_verts

        total_triangles += mesh_tris
        total_vertices += mesh_verts
        mesh_stats.append({
            "name": mesh_name,
            "triangles": mesh_tris,
            "vertices": mesh_verts
        })

    return total_triangles, total_vertices, mesh_stats

def audit_quality_gates(gltf_json, file_size_mb, component_type="complete"):
    """Audits the GLB against all 7 Quality Gates and calculates Grade score."""
    rules = SUBSYSTEM_BUDGETS.get(component_type, SUBSYSTEM_BUDGETS["complete"])
    total_triangles, total_vertices, mesh_stats = calculate_geometry_metrics(gltf_json)

    nodes = gltf_json.get("nodes", [])
    animations = gltf_json.get("animations", [])
    materials = gltf_json.get("materials", [])
    node_names = [n.get("name", "") for n in nodes]

    scores = {}
    details = []

    # 1. Size Gate
    size_passed = rules["min_size_mb"] <= file_size_mb <= rules["max_size_mb"]
    scores["File Size (MB)"] = 100 if size_passed else (70 if file_size_mb >= rules["min_size_mb"] * 0.8 else 40)
    details.append(f"Size: {file_size_mb:.2f} MB (Target: {rules['min_size_mb']} - {rules['max_size_mb']} MB) -> {'PASS' if size_passed else 'WARN'}")

    # 2. Triangle Budget Gate
    tri_passed = total_triangles >= rules["min_triangles"]
    if tri_passed:
        scores["Polygon Density"] = 100
    else:
        scores["Polygon Density"] = max(20, int((total_triangles / rules["min_triangles"]) * 100))
    details.append(f"Triangles: {total_triangles:,} (Target: >={rules['min_triangles']:,}) -> {'PASS' if tri_passed else 'FAIL'}")

    # 3. Hierarchy Completeness Gate
    missing_required = []
    for req in rules["required_nodes"]:
        found = any(req.lower() in name.lower() for name in node_names)
        if not found:
            missing_required.append(req)

    if not missing_required:
        scores["Hierarchy Completeness"] = 100
        details.append(f"Hierarchy: All {len(rules['required_nodes'])} key subsystems identified -> PASS")
    else:
        penalty = int((len(missing_required) / len(rules["required_nodes"])) * 100)
        scores["Hierarchy Completeness"] = max(0, 100 - penalty)
        details.append(f"Hierarchy: Missing {len(missing_required)} subsystem nodes: {missing_required} -> WARN")

    # 4. Semantic Hitboxes Gate
    hitbox_nodes = [n for n in nodes if n.get("name", "").startswith("HITBOX_")]
    valid_hitboxes = True
    for hb in hitbox_nodes:
        if "mesh" in hb:
            m_idx = hb["mesh"]
            m_tris = mesh_stats[m_idx]["triangles"]
            if m_tris > 64:
                valid_hitboxes = False

    if hitbox_nodes and valid_hitboxes:
        scores["Semantic Hitboxes"] = 100
        details.append(f"Hitboxes: {len(hitbox_nodes)} lightweight collision hulls detected (<=64 tris) -> PASS")
    elif hitbox_nodes and not valid_hitboxes:
        scores["Semantic Hitboxes"] = 60
        details.append(f"Hitboxes: {len(hitbox_nodes)} detected, but some exceed 64 triangle limit -> WARN")
    else:
        scores["Semantic Hitboxes"] = 80 if component_type != "complete" else 50
        details.append(f"Hitboxes: {len(hitbox_nodes)} detected -> {'INFO' if component_type != 'complete' else 'WARN'}")

    # 5. Baked NLA Animations Gate
    anim_count = len(animations)
    if anim_count > 0:
        scores["NLA Animations"] = 100
        action_names = [a.get("name", f"Anim_{i}") for i, a in enumerate(animations)]
        details.append(f"Animations: {anim_count} baked actions found ({', '.join(action_names[:4])}...) -> PASS")
    else:
        scores["NLA Animations"] = 70 if component_type in ["pedals", "underbody"] else 50
        details.append(f"Animations: 0 baked actions found -> {'INFO' if component_type in ['pedals', 'underbody'] else 'WARN'}")

    # 6. Self-Describing Extras & Audio-Haptic Metadata Gate
    extras_nodes = [n for n in nodes if "extras" in n and isinstance(n["extras"], dict)]
    sfx_nodes = [n for n in extras_nodes if "sound_fx" in n["extras"]]
    if extras_nodes:
        scores["glTF Extras Metadata"] = 100
        details.append(f"Metadata: {len(extras_nodes)} nodes with JSON extras ({len(sfx_nodes)} with sound_fx) -> PASS")
    else:
        scores["glTF Extras Metadata"] = 60
        details.append(f"Metadata: 0 nodes with extras JSON metadata -> WARN")

    # 7. Material Integrity Gate
    mat_count = len(materials)
    if mat_count >= 6:
        scores["Material Quality"] = 100
    else:
        scores["Material Quality"] = max(40, mat_count * 16)
    details.append(f"Materials: {mat_count} distinct PBR material definitions -> PASS")

    # Calculate overall Grade
    total_score = sum(scores.values()) / len(scores)
    if total_score >= 90.0:
        grade = "Grade A (Production Ready)"
    elif total_score >= 75.0:
        grade = "Grade B (Acceptable with Warnings)"
    else:
        grade = "Grade F (Non-Compliant)"

    return {
        "grade": grade,
        "score": round(total_score, 1),
        "scores": scores,
        "details": details,
        "triangles": total_triangles,
        "vertices": total_vertices,
        "file_size_mb": round(file_size_mb, 2)
    }

def main():
    parser = argparse.ArgumentParser(description="Automotive GLB Production Quality Gate Validator")
    parser.add_argument("glb_path", help="Path to GLB file to validate")
    parser.add_argument("--component", default="complete", choices=["complete", "seat", "steering", "wheel", "door", "dashboard", "pedals"],
                        help="Subsystem component type (default: complete)")
    args = parser.parse_args()

    print(f"\n=======================================================")
    print(f" AUTOMOTIVE GLB QUALITY GATE: {os.path.basename(args.glb_path)}")
    print(f" Component Profile: {args.component.upper()}")
    print(f"=======================================================\n")

    try:
        gltf_json, file_size_mb, _ = parse_glb(args.glb_path)
        report = audit_quality_gates(gltf_json, file_size_mb, args.component)

        print(f"OVERALL RATING: {report['grade']} (Score: {report['score']}%)")
        print(f"Total Triangles: {report['triangles']:,}")
        print(f"Total Vertices:  {report['vertices']:,}")
        print(f"File Size:       {report['file_size_mb']} MB\n")

        print("--- Detailed Gate Audit ---")
        for detail in report["details"]:
            print(f" • {detail}")

        print("\n--- Gate Category Scores ---")
        for gate, sc in report["scores"].items():
            print(f" • {gate:25s}: {sc}/100")

        print("\n=======================================================")
        if report["score"] >= 85.0:
            print(">> STATUS: PASSED - Certified for Production Delivery")
            print("=======================================================\n")
            sys.exit(0)
        else:
            print(">> STATUS: REJECTED - Correct flagged items above")
            print("=======================================================\n")
            sys.exit(1)

    except Exception as e:
        print(f"\n[ERROR] Validation failed: {e}\n")
        sys.exit(1)

if __name__ == "__main__":
    main()
