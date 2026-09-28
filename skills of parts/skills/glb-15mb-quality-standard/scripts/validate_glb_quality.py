"""
===============================================================================
GLB QUALITY VALIDATOR — 15 MB Automotive GLB Quality Standard
===============================================================================
Standalone Python script (no Blender required) that parses any .glb file and
scores it against the "15 MB Quality Standard" specification reverse-engineered
from Car_GT3_Supercar_Complete.glb.

Usage:
    python validate_glb_quality.py <path_to_glb>
    python validate_glb_quality.py public/models/Car_GT3_Supercar_Complete.glb

Exit codes:
    0 = PASS (Grade A or B)
    1 = FAIL (Grade C or below)
    2 = Error (file not found, parse error)
===============================================================================
"""

import struct
import json
import os
import sys
import math

# Fix Windows console encoding for Unicode emoji
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# ─────────────────────────────────────────────────────────────────────────────
# QUALITY THRESHOLDS (derived from GT3 forensic analysis)
# ─────────────────────────────────────────────────────────────────────────────

THRESHOLDS = {
    # File size
    "file_size_min_mb": 10.0,
    "file_size_target_mb": 15.0,
    "file_size_max_mb": 22.0,

    # Geometry
    "triangles_min": 300_000,
    "triangles_target": 460_000,
    "triangles_max": 700_000,
    "vertices_min": 280_000,
    "vertices_target": 420_000,
    "vertices_max": 650_000,

    # Structure
    "meshes_min": 40,
    "meshes_max": 100,
    "materials_min": 12,
    "materials_max": 25,
    "textures_max": 0,  # Pure PBR = 0 textures

    # Mandatory VEHICLE_ROOT subsystem branches
    "mandatory_subsystems": [
        "BODY", "BRAKES", "CABIN", "CHASSIS", "ENGINE_BAY",
        "GLASS", "LIGHTING", "SUSPENSION", "TIRES", "UNDERBODY", "WHEELS",
        "AERO_MOUNTING_POINTS",
    ],

    # Subsystem triangle budget (minimum % of total to be considered "filled")
    "subsystem_min_pct": {
        "BODY": 20.0,
        "CABIN": 15.0,
        "WHEELS": 8.0,
        "BRAKES": 4.0,
        "ENGINE_BAY": 3.0,
        "CHASSIS": 2.0,
        "SUSPENSION": 1.5,
        "LIGHTING": 2.0,
        "GLASS": 1.0,
        "TIRES": 0.5,
        "UNDERBODY": 0.2,
    },

    # Required glTF extensions
    "required_extensions": [
        "KHR_materials_clearcoat",
    ],
    "recommended_extensions": [
        "KHR_materials_emissive_strength",
        "KHR_materials_transmission",
        "KHR_materials_ior",
    ],

    # Material quality checks
    "min_metallic_materials": 3,   # At least 3 materials should have metallic > 0.5
    "min_clearcoat_materials": 2,  # At least 2 materials should use clearcoat
}

# ─────────────────────────────────────────────────────────────────────────────
# GLB PARSER
# ─────────────────────────────────────────────────────────────────────────────

def parse_glb(filepath):
    """Parse a GLB file and return the glTF JSON and file stats."""
    file_size = os.path.getsize(filepath)

    with open(filepath, "rb") as f:
        magic = f.read(4)
        if magic != b"glTF":
            raise ValueError(f"Not a valid GLB file (magic: {magic})")

        version, length = struct.unpack("<II", f.read(8))

        # JSON chunk
        chunk_len, chunk_type = struct.unpack("<II", f.read(8))
        json_bytes = f.read(chunk_len)
        gltf = json.loads(json_bytes.decode("utf-8"))

    return gltf, file_size, len(json_bytes)


def analyze_geometry(gltf):
    """Extract mesh, vertex, triangle, and subsystem statistics."""
    accessors = gltf.get("accessors", [])
    meshes = gltf.get("meshes", [])
    nodes = gltf.get("nodes", [])

    total_tris = 0
    total_verts = 0
    mesh_stats = []

    for m in meshes:
        tri_count = 0
        vert_count = 0
        mat_indices = []
        for p in m.get("primitives", []):
            mat_indices.append(p.get("material"))
            if "indices" in p:
                acc = accessors[p["indices"]]
                tri_count += acc["count"] // 3
            if "POSITION" in p.get("attributes", {}):
                acc_v = accessors[p["attributes"]["POSITION"]]
                vert_count += acc_v["count"]
        total_tris += tri_count
        total_verts += vert_count
        mesh_stats.append({
            "name": m.get("name", "unnamed"),
            "tris": tri_count,
            "verts": vert_count,
            "materials": mat_indices,
        })

    return total_tris, total_verts, mesh_stats


def analyze_hierarchy(gltf):
    """Analyze node hierarchy for VEHICLE_ROOT and subsystem branches."""
    nodes = gltf.get("nodes", [])
    meshes = gltf.get("meshes", [])
    accessors = gltf.get("accessors", [])
    scenes = gltf.get("scenes", [])

    # Find VEHICLE_ROOT
    vehicle_root_idx = None
    for i, n in enumerate(nodes):
        if n.get("name") == "VEHICLE_ROOT":
            vehicle_root_idx = i
            break

    if vehicle_root_idx is None:
        # Check scene root nodes
        for s in scenes:
            for ri in s.get("nodes", []):
                if nodes[ri].get("name") == "VEHICLE_ROOT":
                    vehicle_root_idx = ri
                    break

    def count_subtree_tris(node_idx):
        node = nodes[node_idx]
        tri_count = 0
        vert_count = 0
        mesh_count = 0
        if "mesh" in node:
            m = meshes[node["mesh"]]
            mesh_count += 1
            for p in m.get("primitives", []):
                if "indices" in p:
                    tri_count += accessors[p["indices"]]["count"] // 3
                if "POSITION" in p.get("attributes", {}):
                    vert_count += accessors[p["attributes"]["POSITION"]]["count"]
        for ch in node.get("children", []):
            ct, cv, cm = count_subtree_tris(ch)
            tri_count += ct
            vert_count += cv
            mesh_count += cm
        return tri_count, vert_count, mesh_count

    subsystems = {}
    found_subsystem_names = []

    if vehicle_root_idx is not None:
        root_node = nodes[vehicle_root_idx]
        for ch_idx in root_node.get("children", []):
            child = nodes[ch_idx]
            name = child.get("name", f"node_{ch_idx}")
            tris, verts, mc = count_subtree_tris(ch_idx)
            subsystems[name] = {
                "tris": tris,
                "verts": verts,
                "meshes": mc,
            }
            found_subsystem_names.append(name)

    return vehicle_root_idx is not None, subsystems, found_subsystem_names


def analyze_materials(gltf):
    """Extract material quality metrics."""
    materials = gltf.get("materials", [])
    mat_stats = []
    all_extensions = set()
    metallic_count = 0
    clearcoat_count = 0

    for mat in materials:
        pbr = mat.get("pbrMetallicRoughness", {})
        base_col = pbr.get("baseColorFactor", [1, 1, 1, 1])[:3]
        metallic = pbr.get("metallicFactor", 0)
        roughness = pbr.get("roughnessFactor", 0)
        extensions = list(mat.get("extensions", {}).keys())
        all_extensions.update(extensions)

        if metallic > 0.5:
            metallic_count += 1
        if "KHR_materials_clearcoat" in extensions:
            clearcoat_count += 1

        mat_stats.append({
            "name": mat.get("name", "unnamed"),
            "base_color": base_col,
            "metallic": metallic,
            "roughness": roughness,
            "extensions": extensions,
        })

    return mat_stats, list(all_extensions), metallic_count, clearcoat_count


# ─────────────────────────────────────────────────────────────────────────────
# SCORING ENGINE
# ─────────────────────────────────────────────────────────────────────────────

def score_glb(filepath):
    """Score a GLB file against the 15 MB Quality Standard."""
    gltf, file_size, json_size = parse_glb(filepath)

    file_size_mb = file_size / (1024 * 1024)
    total_tris, total_verts, mesh_stats = analyze_geometry(gltf)
    has_vehicle_root, subsystems, found_names = analyze_hierarchy(gltf)
    mat_stats, all_extensions, metallic_count, clearcoat_count = analyze_materials(gltf)

    num_meshes = len(gltf.get("meshes", []))
    num_materials = len(gltf.get("materials", []))
    num_textures = len(gltf.get("textures", []))
    num_images = len(gltf.get("images", []))

    results = []
    score = 0
    max_score = 0

    def check(name, passed, weight=1, detail=""):
        nonlocal score, max_score
        max_score += weight
        if passed:
            score += weight
        icon = "✅" if passed else "❌"
        results.append((icon, name, detail, weight))

    # ── File Size ──
    check(
        "File Size",
        THRESHOLDS["file_size_min_mb"] <= file_size_mb <= THRESHOLDS["file_size_max_mb"],
        weight=3,
        detail=f"{file_size_mb:.2f} MB (target: {THRESHOLDS['file_size_target_mb']} MB, range: {THRESHOLDS['file_size_min_mb']}–{THRESHOLDS['file_size_max_mb']} MB)"
    )

    # ── Triangle Count ──
    check(
        "Triangle Count",
        THRESHOLDS["triangles_min"] <= total_tris <= THRESHOLDS["triangles_max"],
        weight=3,
        detail=f"{total_tris:,} (target: {THRESHOLDS['triangles_target']:,}, range: {THRESHOLDS['triangles_min']:,}–{THRESHOLDS['triangles_max']:,})"
    )

    # ── Vertex Count ──
    check(
        "Vertex Count",
        THRESHOLDS["vertices_min"] <= total_verts <= THRESHOLDS["vertices_max"],
        weight=2,
        detail=f"{total_verts:,} (target: {THRESHOLDS['vertices_target']:,})"
    )

    # ── Mesh Count ──
    check(
        "Mesh Count",
        THRESHOLDS["meshes_min"] <= num_meshes <= THRESHOLDS["meshes_max"],
        weight=1,
        detail=f"{num_meshes} (range: {THRESHOLDS['meshes_min']}–{THRESHOLDS['meshes_max']})"
    )

    # ── Material Count ──
    check(
        "Material Count",
        THRESHOLDS["materials_min"] <= num_materials <= THRESHOLDS["materials_max"],
        weight=1,
        detail=f"{num_materials} (range: {THRESHOLDS['materials_min']}–{THRESHOLDS['materials_max']})"
    )

    # ── Pure PBR (No Textures) ──
    check(
        "Pure PBR (Zero Textures)",
        num_textures <= THRESHOLDS["textures_max"],
        weight=2,
        detail=f"Textures: {num_textures}, Images: {num_images}"
    )

    # ── VEHICLE_ROOT Hierarchy ──
    check(
        "VEHICLE_ROOT Present",
        has_vehicle_root,
        weight=3,
        detail="Root node found" if has_vehicle_root else "MISSING — no VEHICLE_ROOT node detected"
    )

    # ── Subsystem Branches ──
    for subsys in THRESHOLDS["mandatory_subsystems"]:
        present = subsys in found_names
        check(
            f"Subsystem: {subsys}",
            present,
            weight=1,
            detail=f"Present ({subsystems[subsys]['tris']:,} tris, {subsystems[subsys]['meshes']} meshes)" if present else "MISSING"
        )

    # ── Subsystem Fill Level ──
    if total_tris > 0:
        for subsys, min_pct in THRESHOLDS["subsystem_min_pct"].items():
            if subsys in subsystems:
                actual_pct = (subsystems[subsys]["tris"] / total_tris) * 100
                filled = actual_pct >= min_pct
                check(
                    f"Fill Level: {subsys}",
                    filled,
                    weight=1,
                    detail=f"{actual_pct:.1f}% (min: {min_pct}%)"
                )
            else:
                check(
                    f"Fill Level: {subsys}",
                    False,
                    weight=1,
                    detail=f"Subsystem not found (min: {min_pct}%)"
                )

    # ── Required Extensions ──
    for ext in THRESHOLDS["required_extensions"]:
        check(
            f"Extension: {ext}",
            ext in all_extensions,
            weight=2,
            detail="Present" if ext in all_extensions else "MISSING"
        )

    # ── Recommended Extensions ──
    for ext in THRESHOLDS["recommended_extensions"]:
        check(
            f"Extension (recommended): {ext}",
            ext in all_extensions,
            weight=1,
            detail="Present" if ext in all_extensions else "Not found (recommended)"
        )

    # ── Material Quality ──
    check(
        "Metallic Materials (≥3 with metallic > 0.5)",
        metallic_count >= THRESHOLDS["min_metallic_materials"],
        weight=1,
        detail=f"{metallic_count} materials with metallic > 0.5"
    )
    check(
        "Clearcoat Materials (≥2 with clearcoat)",
        clearcoat_count >= THRESHOLDS["min_clearcoat_materials"],
        weight=1,
        detail=f"{clearcoat_count} materials with clearcoat extension"
    )

    # ── Calculate Grade ──
    pct = (score / max_score * 100) if max_score > 0 else 0
    if pct >= 90:
        grade = "A"
    elif pct >= 75:
        grade = "B"
    elif pct >= 60:
        grade = "C"
    elif pct >= 40:
        grade = "D"
    else:
        grade = "F"

    return {
        "filepath": filepath,
        "file_size_mb": file_size_mb,
        "total_tris": total_tris,
        "total_verts": total_verts,
        "num_meshes": num_meshes,
        "num_materials": num_materials,
        "num_textures": num_textures,
        "has_vehicle_root": has_vehicle_root,
        "subsystems": subsystems,
        "materials": mat_stats,
        "extensions": all_extensions,
        "results": results,
        "score": score,
        "max_score": max_score,
        "pct": pct,
        "grade": grade,
    }


# ─────────────────────────────────────────────────────────────────────────────
# REPORT PRINTER
# ─────────────────────────────────────────────────────────────────────────────

def print_report(report):
    """Print a formatted quality report."""
    filename = os.path.basename(report["filepath"])
    line = "=" * 60

    print(f"\n{line}")
    print(f"  GLB QUALITY REPORT: {filename}")
    print(f"{line}")
    print(f"  File Size:     {report['file_size_mb']:.2f} MB")
    print(f"  Triangles:     {report['total_tris']:,}")
    print(f"  Vertices:      {report['total_verts']:,}")
    print(f"  Meshes:        {report['num_meshes']}")
    print(f"  Materials:     {report['num_materials']}")
    print(f"  Textures:      {report['num_textures']}")
    print(f"  VEHICLE_ROOT:  {'Present' if report['has_vehicle_root'] else 'MISSING'}")
    print(f"{line}")

    print(f"\n  --- DETAILED CHECKS ({report['score']}/{report['max_score']}) ---\n")

    for icon, name, detail, weight in report["results"]:
        w_str = f"[×{weight}]" if weight > 1 else ""
        print(f"  {icon} {name:<45} {w_str}")
        if detail:
            print(f"      {detail}")

    print(f"\n{line}")
    grade_icon = "✅" if report["grade"] in ("A", "B") else "❌"
    print(f"  {grade_icon} OVERALL GRADE: {report['grade']} ({report['pct']:.1f}%)")
    print(f"     Score: {report['score']} / {report['max_score']}")
    print(f"{line}\n")

    # Subsystem summary table
    if report["subsystems"]:
        print("  --- SUBSYSTEM BREAKDOWN ---\n")
        total_t = report["total_tris"] or 1
        for name, info in sorted(report["subsystems"].items(), key=lambda x: x[1]["tris"], reverse=True):
            pct = info["tris"] / total_t * 100
            bar_len = int(pct / 2)
            bar = "█" * bar_len + "░" * (20 - bar_len)
            status = "✅" if info["tris"] > 0 else "⚠️"
            print(f"  {status} {name:<25} {bar} {info['tris']:>8,} tris ({pct:>5.1f}%) | {info['meshes']} meshes")
        print()

    # Material summary
    if report["materials"]:
        print("  --- MATERIAL SUMMARY ---\n")
        for mat in report["materials"][:20]:
            col = mat["base_color"]
            ext_str = ", ".join(mat["extensions"]) if mat["extensions"] else "—"
            print(f"    {mat['name']:<30} Met={mat['metallic']:.2f} Rgh={mat['roughness']:.2f} | {ext_str}")
        print()


# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────

def main():
    if len(sys.argv) < 2:
        print("Usage: python validate_glb_quality.py <path_to_glb> [--strict-a]")
        print("       python validate_glb_quality.py public/models/Car_GT3_Supercar_Complete.glb")
        print("       python validate_glb_quality.py public/models/Car_GT3_Supercar_Complete.glb --strict-a")
        sys.exit(2)

    strict_a = "--strict-a" in sys.argv or "--strict" in sys.argv
    args = [a for a in sys.argv[1:] if not a.startswith("--")]

    if not args:
        print("ERROR: No GLB filepath specified.")
        sys.exit(2)

    filepath = args[0]
    if not os.path.exists(filepath):
        print(f"ERROR: File not found: {filepath}")
        sys.exit(2)

    try:
        report = score_glb(filepath)
        print_report(report)

        # Exit code: 0 for pass, 1 for fail
        allowed_grades = ("A",) if strict_a else ("A", "B")
        passed = report["grade"] in allowed_grades
        if strict_a and not passed:
            print(f"FAILED --strict-a check: Model received Grade {report['grade']} ({report['pct']:.1f}%). Must achieve Grade A (≥90.0%).")
        sys.exit(0 if passed else 1)

    except Exception as e:
        print(f"ERROR: Failed to parse GLB: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(2)


if __name__ == "__main__":
    main()
