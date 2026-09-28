#!/usr/bin/env python3
"""
============================================================================
Automotive GLB Production Quality Gate Validator
============================================================================
Implements all 7 Quality Gates from skill-for-automated-glb-quality-gate:

  Gate 1: File Size Budget
  Gate 2: Polygon Density (triangle count)
  Gate 3: Subsystem Hierarchy Completeness
  Gate 4: Semantic Hitboxes (HITBOX_*)
  Gate 5: Baked NLA Actions (Action_*)
  Gate 6: Metadata & Haptics (node.extras)
  Gate 7: PBR Material Quality

Uses pure Python stdlib (struct, json, os, sys) with ZERO dependencies.

Usage:
  python scripts/validate_glb_production.py <file_or_directory> [--component complete|seat|wheel|...] [--strict-a]
============================================================================
"""
import struct
import json
import os
import sys
import glob
import argparse

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')


# ─── GLB Binary Parser ──────────────────────────────────────────────────
def parse_glb(filepath):
    """Parse a GLB file and return the JSON chunk and binary chunk size."""
    with open(filepath, 'rb') as f:
        # GLB Header: magic(4) + version(4) + length(4)
        header = f.read(12)
        if len(header) < 12:
            return None, 0
        magic, version, total_length = struct.unpack('<III', header)
        if magic != 0x46546C67:  # 'glTF'
            return None, 0

        # Chunk 0 (JSON)
        chunk0_header = f.read(8)
        if len(chunk0_header) < 8:
            return None, 0
        chunk0_length, chunk0_type = struct.unpack('<II', chunk0_header)
        json_data = f.read(chunk0_length)

        # Chunk 1 (BIN) - just get size
        bin_size = 0
        remaining = f.read(8)
        if len(remaining) >= 8:
            bin_size, _ = struct.unpack('<II', remaining)

        try:
            gltf_json = json.loads(json_data)
        except json.JSONDecodeError:
            return None, 0

        return gltf_json, bin_size


def count_triangles(gltf_json):
    """Estimate triangle count from accessor element counts on mesh primitives."""
    total_tris = 0
    accessors = gltf_json.get('accessors', [])
    meshes = gltf_json.get('meshes', [])

    for mesh in meshes:
        for prim in mesh.get('primitives', []):
            indices_idx = prim.get('indices')
            if indices_idx is not None and indices_idx < len(accessors):
                count = accessors[indices_idx].get('count', 0)
                total_tris += count // 3
            else:
                # No index buffer; estimate from POSITION accessor
                attrs = prim.get('attributes', {})
                pos_idx = attrs.get('POSITION')
                if pos_idx is not None and pos_idx < len(accessors):
                    count = accessors[pos_idx].get('count', 0)
                    total_tris += count // 3
    return total_tris


def get_node_names(gltf_json):
    """Extract all node names from the glTF scene graph."""
    return [n.get('name', '') for n in gltf_json.get('nodes', [])]


def get_mesh_names(gltf_json):
    """Extract all mesh names."""
    return [m.get('name', '') for m in gltf_json.get('meshes', [])]


def get_material_names(gltf_json):
    """Extract all material names and their properties."""
    return gltf_json.get('materials', [])


def get_animations(gltf_json):
    """Extract animation names."""
    return [a.get('name', '') for a in gltf_json.get('animations', [])]


def get_extensions_used(gltf_json):
    """Get list of used extensions."""
    return gltf_json.get('extensionsUsed', [])


def get_node_extras(gltf_json):
    """Collect all nodes with extras metadata."""
    results = []
    for node in gltf_json.get('nodes', []):
        extras = node.get('extras')
        if extras:
            results.append((node.get('name', 'unnamed'), extras))
    return results


# ─── The 7 Quality Gates ────────────────────────────────────────────────

def gate1_file_size(filepath, component='complete'):
    """Gate 1: File Size Budget."""
    file_size_bytes = os.path.getsize(filepath)
    file_size_kb = file_size_bytes / 1024
    file_size_mb = file_size_bytes / (1024 * 1024)
    is_opt = filepath.endswith('.opt.glb')

    # Thresholds differ by component type
    if component == 'complete':
        if is_opt:
            min_kb, max_kb = 1500, 8000
            ideal_min_kb, ideal_max_kb = 2500, 5000
        else:
            # 15MB+ uncompressed target for realistic exterior models
            min_kb, max_kb = 12000, 60000  # min 12MB, max 60MB
            ideal_min_kb, ideal_max_kb = 15000, 45000  # ideal >= 15MB
    elif component == 'seat':
        min_kb, max_kb = 100, 5120
        ideal_min_kb, ideal_max_kb = 1800, 5000
    elif component == 'wheel':
        min_kb, max_kb = 50, 3200
        ideal_min_kb, ideal_max_kb = 1000, 3200
    elif component == 'dashboard':
        min_kb, max_kb = 200, 5632
        ideal_min_kb, ideal_max_kb = 2500, 5500
    else:
        min_kb, max_kb = 50, 50000
        ideal_min_kb, ideal_max_kb = 150, 2500

    score = 100.0
    notes = []
    if file_size_kb < min_kb:
        ratio = max(file_size_kb / min_kb, 0.0)
        score = round(20.0 + ratio * 50.0, 1)
        notes.append(f"FAIL: File size {file_size_mb:.2f} MB is below the {min_kb/1024:.1f} MB minimum target (target ≥15 MB)")
    elif file_size_kb > max_kb:
        score = 60.0
        notes.append(f"WARN: File exceeds budget ({file_size_mb:.2f} MB > {max_kb/1024:.1f} MB)")
    elif ideal_min_kb <= file_size_kb <= ideal_max_kb:
        score = 100.0
        notes.append(f"PASS: File size {file_size_mb:.2f} MB meets target (≥{ideal_min_kb/1024:.1f} MB)")
    else:
        score = 85.0
        notes.append(f"ACCEPTABLE: File size {file_size_mb:.2f} MB (between {min_kb/1024:.1f} MB and {ideal_min_kb/1024:.1f} MB)")

    return score, file_size_kb, notes


def gate2_polygon_density(gltf_json, component='complete'):
    """Gate 2: Polygon Density (triangle count)."""
    tri_count = count_triangles(gltf_json)

    # Adaptive thresholds per component type
    thresholds = {
        'complete': {'ideal': 650000, 'min': 600000, 'warn': 620000},
        'seat': {'ideal': 65000, 'min': 5000, 'warn': 20000},
        'wheel': {'ideal': 22000, 'min': 2000, 'warn': 8000},
        'dashboard': {'ideal': 70000, 'min': 5000, 'warn': 20000},
    }
    t = thresholds.get(component, thresholds['complete'])

    score = 100.0
    notes = []
    if component == 'complete':
        if tri_count < 600000:
            score = round(max(20.0, (tri_count / 600000.0) * 65.0), 1)
            notes.append(f"FAIL: {tri_count:,} triangles is below the 600,000 floor (target 650k-800k)")
        elif tri_count < 650000:
            ratio = (tri_count - 600000.0) / 50000.0
            score = round(85.0 + ratio * 15.0, 1)
            notes.append(f"PASS: {tri_count:,} triangles meets 600k floor (target 650k-800k)")
        else:
            score = 100.0
            notes.append(f"PASS: {tri_count:,} triangles (≥650k ideal)")
    else:
        if tri_count < t['min']:
            score = 20.0
            notes.append(f"FAIL: Only {tri_count} triangles (minimum {t['min']})")
        elif tri_count < t['warn']:
            score = 65.0
            notes.append(f"WARN: {tri_count} triangles below recommended {t['warn']}")
        elif tri_count >= t['ideal']:
            score = 100.0
            notes.append(f"PASS: {tri_count} triangles (≥{t['ideal']} ideal)")
        else:
            ratio = (tri_count - t['warn']) / max(t['ideal'] - t['warn'], 1)
            score = 65.0 + ratio * 35.0
            notes.append(f"ACCEPTABLE: {tri_count} triangles (between {t['warn']} and {t['ideal']})")

    return score, tri_count, notes


def gate3_hierarchy_completeness(gltf_json, component='complete'):
    """Gate 3: Subsystem Hierarchy Completeness."""
    node_names = get_node_names(gltf_json)
    mesh_names = get_mesh_names(gltf_json)
    all_names = set(node_names + mesh_names)
    all_names_lower = {n.lower() for n in all_names}

    # Check for required subsystem prefixes
    subsystem_prefixes = {
        'BODY': ['body', 'shell', 'panel', 'fender', 'hood', 'trunk', 'roof'],
        'INTERIOR': ['interior', 'seat', 'dashboard', 'console', 'cabin', 'cockpit', 'driver'],
        'WHEELS': ['wheel', 'tire', 'rim'],
        'GLASS': ['glass', 'windshield', 'window'],
        'CHASSIS': ['chassis', 'frame', 'subframe', 'bellypan', 'belly_pan', 'underbody', 'floor'],
        'LIGHTING': ['light', 'headlamp', 'taillamp', 'headlight', 'taillight', 'drl', 'lamp'],
        'AERO': ['aero', 'spoiler', 'wing', 'diffuser', 'splitter', 'fairing', 'dam', 'airdam', 'skid', 'valance', 'undertray'],
    }

    found = {}
    missing = []
    for subsys, keywords in subsystem_prefixes.items():
        is_found = False
        for name in all_names_lower:
            for kw in keywords:
                if kw in name:
                    is_found = True
                    break
            if is_found:
                break
        found[subsys] = is_found
        if not is_found:
            missing.append(subsys)

    total = len(subsystem_prefixes)
    found_count = sum(1 for v in found.values() if v)
    score = (found_count / total) * 100.0

    notes = []
    if found_count == total:
        notes.append(f"PASS: All {total} subsystem domains populated")
    else:
        notes.append(f"PARTIAL: {found_count}/{total} subsystems found. Missing: {', '.join(missing)}")

    return score, found, notes


def gate4_semantic_hitboxes(gltf_json):
    """Gate 4: Semantic Hitboxes (HITBOX_*)."""
    node_names = get_node_names(gltf_json)
    hitboxes = [n for n in node_names if n.upper().startswith('HITBOX')]

    score = 100.0 if len(hitboxes) > 0 else 0.0
    notes = []
    if hitboxes:
        notes.append(f"PASS: {len(hitboxes)} hitbox nodes found: {', '.join(hitboxes[:5])}{'...' if len(hitboxes) > 5 else ''}")
    else:
        notes.append("MISSING: No HITBOX_* nodes found. Interactive raycasting requires lightweight collision hulls.")

    return score, hitboxes, notes


def gate5_baked_nla_actions(gltf_json):
    """Gate 5: Baked NLA Actions."""
    animations = get_animations(gltf_json)
    action_anims = [a for a in animations if a.startswith('Action_') or a.startswith('action_')]

    if len(action_anims) >= 6:
        score = 100.0
    elif len(action_anims) >= 3:
        score = 75.0
    elif len(action_anims) >= 1:
        score = 50.0
    elif len(animations) >= 1:
        score = 40.0
    else:
        score = 0.0

    notes = []
    if action_anims:
        notes.append(f"FOUND: {len(action_anims)} named Action_* clips: {', '.join(action_anims[:5])}{'...' if len(action_anims) > 5 else ''}")
    elif animations:
        notes.append(f"PARTIAL: {len(animations)} animations present but not using Action_* naming convention")
    else:
        notes.append("MISSING: No animation actions found. Interactive articulations require baked NLA keyframes.")

    return score, action_anims or animations, notes


def gate6_metadata_extras(gltf_json):
    """Gate 6: Metadata & Haptics (node.extras)."""
    node_extras = get_node_extras(gltf_json)
    interactive_nodes = [(name, extras) for name, extras in node_extras if extras.get('interactive')]
    sound_fx_nodes = [(name, extras) for name, extras in node_extras if extras.get('sound_fx')]
    haptic_nodes = [(name, extras) for name, extras in node_extras if extras.get('haptic')]

    total_score = 0.0
    if interactive_nodes:
        total_score += 40.0
    if sound_fx_nodes:
        total_score += 30.0
    if haptic_nodes:
        total_score += 30.0

    # Fallback: any extras at all is a partial pass
    if not interactive_nodes and node_extras:
        total_score = max(total_score, 25.0)

    notes = []
    notes.append(f"Interactive nodes: {len(interactive_nodes)}, Sound FX nodes: {len(sound_fx_nodes)}, Haptic nodes: {len(haptic_nodes)}")
    if total_score == 0:
        notes.append("MISSING: No interactive metadata found in node.extras")
    elif total_score < 100:
        notes.append("PARTIAL: Some interactive metadata present but incomplete")

    return total_score, {'interactive': len(interactive_nodes), 'sound_fx': len(sound_fx_nodes), 'haptic': len(haptic_nodes)}, notes


def gate7_pbr_materials(gltf_json):
    """Gate 7: PBR Material Quality."""
    materials = get_material_names(gltf_json)
    mat_count = len(materials)

    has_clearcoat = False
    has_transmission = False
    has_metallic = False
    distinct_names = set()

    for mat in materials:
        name = mat.get('name', '')
        distinct_names.add(name)

        pbr = mat.get('pbrMetallicRoughness', {})
        if pbr.get('metallicFactor', 0) > 0.5:
            has_metallic = True

        exts = mat.get('extensions', {})
        if 'KHR_materials_clearcoat' in exts:
            has_clearcoat = True
        if 'KHR_materials_transmission' in exts:
            has_transmission = True

    # Also check extensions used at top level
    ext_used = get_extensions_used(gltf_json)
    if 'KHR_materials_clearcoat' in ext_used:
        has_clearcoat = True
    if 'KHR_materials_transmission' in ext_used:
        has_transmission = True
    if 'KHR_materials_variants' in ext_used:
        pass  # bonus

    score = 0.0
    if mat_count >= 6:
        score += 50.0
    elif mat_count >= 3:
        score += 30.0
    elif mat_count >= 1:
        score += 15.0

    if has_metallic:
        score += 20.0
    if has_clearcoat:
        score += 15.0
    if has_transmission:
        score += 15.0

    notes = []
    notes.append(f"{mat_count} materials ({len(distinct_names)} distinct names)")
    features = []
    if has_metallic: features.append("Metallic")
    if has_clearcoat: features.append("Clearcoat")
    if has_transmission: features.append("Transmission")
    if features:
        notes.append(f"PBR features: {', '.join(features)}")
    else:
        notes.append("No advanced PBR features (clearcoat/transmission) detected")

    if 'KHR_materials_variants' in ext_used:
        score = min(score + 10, 100)
        notes.append("KHR_materials_variants extension present ✓")

    return min(score, 100.0), {'count': mat_count, 'metallic': has_metallic, 'clearcoat': has_clearcoat, 'transmission': has_transmission}, notes


# ─── Cross-Cutting Checks ────────────────────────────────────────────────

def check_camera_anchors(gltf_json):
    """Check for baked CAMERA_* anchor nodes (skill-for-vehicle-camera-framing)."""
    node_names = get_node_names(gltf_json)
    cameras = [n for n in node_names if n.startswith('CAMERA_')]
    return cameras


def check_khr_materials_variants(gltf_json):
    """Check for KHR_materials_variants (skill-for-glb-materials-and-variants)."""
    ext_used = get_extensions_used(gltf_json)
    return 'KHR_materials_variants' in ext_used


def check_meshopt_compression(gltf_json):
    """Check for EXT_meshopt_compression (skill-for-glb-meshopt-compression)."""
    ext_used = get_extensions_used(gltf_json)
    return 'EXT_meshopt_compression' in ext_used


def check_kinematic_pivots(gltf_json):
    """Check for isolated kinematic pivot nodes (skill-for-interactive-glb)."""
    nodes = gltf_json.get('nodes', [])
    articulating = []
    for node in nodes:
        name = node.get('name', '')
        # Detect pivot-bearing nodes by naming convention
        if any(kw in name.upper() for kw in ['HINGE', 'PIVOT', 'SWING', 'SLIDER', 'DOOR_', 'HOOD_', 'TRUNK_']):
            has_rotation = 'rotation' in node
            has_translation = 'translation' in node
            if has_rotation or has_translation:
                articulating.append(name)
    return articulating


# ─── Grading ──────────────────────────────────────────────────────────────

def compute_grade(scores, weights=None):
    """Compute weighted composite score across all 7 gates."""
    if weights is None:
        weights = {
            'gate1': 0.10,  # File Size
            'gate2': 0.20,  # Polygon Density
            'gate3': 0.25,  # Hierarchy
            'gate4': 0.10,  # Hitboxes
            'gate5': 0.10,  # NLA Actions
            'gate6': 0.10,  # Metadata
            'gate7': 0.15,  # PBR Materials
        }
    total = sum(scores[k] * weights[k] for k in weights if k in scores)
    if total >= 90.0:
        letter = 'A'
    elif total >= 75.0:
        letter = 'B'
    else:
        letter = 'F'
    return total, letter


# ─── Single File Validator ────────────────────────────────────────────────

def validate_single_glb(filepath, component='complete', verbose=True):
    """Run all 7 gates on a single GLB file."""
    gltf_json, bin_size = parse_glb(filepath)
    if gltf_json is None:
        return {'file': filepath, 'error': 'Failed to parse GLB', 'grade': 'F', 'score': 0.0}

    results = {}

    # Gate 1: File Size
    score1, size_kb, notes1 = gate1_file_size(filepath, component)
    results['gate1'] = score1
    results['size_kb'] = size_kb

    # Gate 2: Polygon Density
    score2, tri_count, notes2 = gate2_polygon_density(gltf_json, component)
    results['gate2'] = score2
    results['triangles'] = tri_count

    # Gate 3: Hierarchy Completeness
    score3, subsys_found, notes3 = gate3_hierarchy_completeness(gltf_json, component)
    results['gate3'] = score3
    results['subsystems'] = subsys_found

    # Gate 4: Hitboxes
    score4, hitboxes, notes4 = gate4_semantic_hitboxes(gltf_json)
    results['gate4'] = score4
    results['hitboxes'] = hitboxes

    # Gate 5: NLA Actions
    score5, actions, notes5 = gate5_baked_nla_actions(gltf_json)
    results['gate5'] = score5
    results['actions'] = actions

    # Gate 6: Metadata
    score6, extras_info, notes6 = gate6_metadata_extras(gltf_json)
    results['gate6'] = score6
    results['extras'] = extras_info

    # Gate 7: PBR Materials
    score7, mat_info, notes7 = gate7_pbr_materials(gltf_json)
    results['gate7'] = score7
    results['materials'] = mat_info

    # Cross-cutting checks
    cameras = check_camera_anchors(gltf_json)
    has_variants = check_khr_materials_variants(gltf_json)
    has_meshopt = check_meshopt_compression(gltf_json)

    results['cameras'] = cameras
    results['khr_materials_variants'] = has_variants
    results['ext_meshopt'] = has_meshopt

    # Composite Grade
    total_score, letter_grade = compute_grade(results)
    results['score'] = round(total_score, 1)
    results['grade'] = letter_grade
    results['file'] = filepath

    if verbose:
        basename = os.path.basename(filepath)
        print(f"\n{'='*80}")
        print(f"  GLB Quality Gate Report: {basename}")
        print(f"{'='*80}")
        print(f"  Gate 1 — File Size:    {score1:5.1f}%  ({size_kb:.1f} KB)")
        print(f"  Gate 2 — Polygons:     {score2:5.1f}%  ({tri_count:,} triangles)")
        print(f"  Gate 3 — Hierarchy:    {score3:5.1f}%  ({sum(1 for v in subsys_found.values() if v)}/{len(subsys_found)} subsystems)")
        print(f"  Gate 4 — Hitboxes:     {score4:5.1f}%  ({len(hitboxes)} HITBOX_* nodes)")
        print(f"  Gate 5 — NLA Actions:  {score5:5.1f}%  ({len(actions)} actions)")
        print(f"  Gate 6 — Metadata:     {score6:5.1f}%  (interactive:{extras_info['interactive']}, sfx:{extras_info['sound_fx']}, haptic:{extras_info['haptic']})")
        print(f"  Gate 7 — PBR Mats:     {score7:5.1f}%  ({mat_info['count']} materials)")
        print(f"{'─'*80}")
        print(f"  Cross-cutting: Cameras={len(cameras)}, KHR_variants={'✓' if has_variants else '✗'}, Meshopt={'✓' if has_meshopt else '✗'}")
        print(f"{'─'*80}")
        for n in notes1 + notes2 + notes3: print(f"    {n}")
        print(f"{'═'*80}")
        print(f"  ▸ COMPOSITE SCORE: {total_score:.1f}%  |  GRADE: {letter_grade}")
        if letter_grade == 'A':
            print(f"  ▸ STATUS: ✅ PRODUCTION READY")
        elif letter_grade == 'B':
            print(f"  ▸ STATUS: ⚠️  ACCEPTABLE (needs improvement for Grade A)")
        else:
            print(f"  ▸ STATUS: ❌ NON-COMPLIANT (hard rejection)")
        print(f"{'='*80}")

    return results


# ─── Fleet Auditor ────────────────────────────────────────────────────────

def audit_fleet(base_dir, component='complete', verbose=False):
    """Audit all GLBs across all 24 architectures × 7 eras."""
    vehicles_dir = os.path.join(base_dir, 'public', 'models', 'vehicles')
    if not os.path.isdir(vehicles_dir):
        print(f"ERROR: Vehicles directory not found: {vehicles_dir}")
        return []

    results = []
    eras = ['1970s', '1980s', '1990s', '2000s', '2010s', '2020s', 'future']

    architectures = sorted([d for d in os.listdir(vehicles_dir)
                            if os.path.isdir(os.path.join(vehicles_dir, d))])

    grade_counts = {'A': 0, 'B': 0, 'F': 0}
    total_triangles = 0
    total_size_kb = 0

    for arch in architectures:
        arch_dir = os.path.join(vehicles_dir, arch)
        for era in eras:
            glb_path = os.path.join(arch_dir, era, 'vehicle.glb')
            if os.path.isfile(glb_path):
                r = validate_single_glb(glb_path, component, verbose=verbose)
                r['architecture'] = arch
                r['era'] = era
                results.append(r)
                grade_counts[r.get('grade', 'F')] += 1
                total_triangles += r.get('triangles', 0)
                total_size_kb += r.get('size_kb', 0)

    # Summary
    print(f"\n{'='*100}")
    print(f"  FLEET-WIDE GLB QUALITY AUDIT SUMMARY")
    print(f"{'='*100}")
    print(f"  Total GLBs Audited:   {len(results)}")
    print(f"  Total Triangles:      {total_triangles:,}")
    print(f"  Total Size:           {total_size_kb/1024:.1f} MB ({total_size_kb:.0f} KB)")
    print(f"{'─'*100}")
    print(f"  Grade A (≥90%):       {grade_counts['A']} vehicles  ✅ Production Ready")
    print(f"  Grade B (75-89%):     {grade_counts['B']} vehicles  ⚠️  Acceptable")
    print(f"  Grade F (<75%):       {grade_counts['F']} vehicles  ❌ Non-Compliant")
    print(f"{'─'*100}")

    # Per-gate average scores
    if results:
        avg_scores = {}
        for gate in ['gate1','gate2','gate3','gate4','gate5','gate6','gate7']:
            avg_scores[gate] = sum(r.get(gate, 0) for r in results) / len(results)

        print(f"  AVERAGE GATE SCORES ACROSS FLEET:")
        print(f"    Gate 1 — File Size Budget:      {avg_scores['gate1']:5.1f}%")
        print(f"    Gate 2 — Polygon Density:        {avg_scores['gate2']:5.1f}%")
        print(f"    Gate 3 — Hierarchy Completeness: {avg_scores['gate3']:5.1f}%")
        print(f"    Gate 4 — Semantic Hitboxes:       {avg_scores['gate4']:5.1f}%")
        print(f"    Gate 5 — Baked NLA Actions:       {avg_scores['gate5']:5.1f}%")
        print(f"    Gate 6 — Metadata & Haptics:      {avg_scores['gate6']:5.1f}%")
        print(f"    Gate 7 — PBR Material Quality:    {avg_scores['gate7']:5.1f}%")
        print(f"{'─'*100}")

        # Cross-cutting feature coverage
        has_cameras = sum(1 for r in results if r.get('cameras'))
        has_variants = sum(1 for r in results if r.get('khr_materials_variants'))
        has_meshopt = sum(1 for r in results if r.get('ext_meshopt'))
        has_hitboxes = sum(1 for r in results if r.get('hitboxes'))
        has_actions = sum(1 for r in results if r.get('actions'))
        has_extras_int = sum(1 for r in results if r.get('extras', {}).get('interactive', 0) > 0)

        print(f"  CROSS-CUTTING SKILL COMPLIANCE:")
        print(f"    Camera Anchors (CAMERA_*):        {has_cameras}/{len(results)} vehicles")
        print(f"    KHR_materials_variants:            {has_variants}/{len(results)} vehicles")
        print(f"    EXT_meshopt_compression:           {has_meshopt}/{len(results)} vehicles")
        print(f"    Semantic Hitboxes (HITBOX_*):       {has_hitboxes}/{len(results)} vehicles")
        print(f"    Baked NLA Actions (Action_*):       {has_actions}/{len(results)} vehicles")
        print(f"    Interactive Metadata (extras):      {has_extras_int}/{len(results)} vehicles")
        print(f"    Audio-Haptic Binding (sound_fx):    {sum(1 for r in results if r.get('extras', {}).get('sound_fx', 0) > 0)}/{len(results)} vehicles")

    print(f"{'='*100}")

    # Per-architecture breakdown table
    print(f"\n{'='*130}")
    print(f"  {'Architecture':<20} | {'Era':<8} | {'Size KB':>8} | {'Tris':>10} | {'G1':>5} | {'G2':>5} | {'G3':>5} | {'G4':>5} | {'G5':>5} | {'G6':>5} | {'G7':>5} | {'Score':>6} | Grade")
    print(f"{'─'*130}")
    for r in results:
        print(f"  {r.get('architecture','?'):<20} | {r.get('era','?'):<8} | {r.get('size_kb',0):>7.0f}K | {r.get('triangles',0):>10,} | {r.get('gate1',0):>5.1f} | {r.get('gate2',0):>5.1f} | {r.get('gate3',0):>5.1f} | {r.get('gate4',0):>5.1f} | {r.get('gate5',0):>5.1f} | {r.get('gate6',0):>5.1f} | {r.get('gate7',0):>5.1f} | {r.get('score',0):>5.1f}% | {r.get('grade','?')}")
    print(f"{'='*130}")

    return results


# ─── Main Entry Point ─────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description='Automotive GLB Production Quality Gate Validator')
    parser.add_argument('target', help='GLB file or project root directory to audit')
    parser.add_argument('--component', default='complete', choices=['complete', 'seat', 'wheel', 'dashboard', 'door', 'modular'],
                        help='Component type for threshold selection')
    parser.add_argument('--strict-a', action='store_true', help='Exit with code 1 if any asset fails Grade A')
    parser.add_argument('--verbose', '-v', action='store_true', help='Show detailed per-file reports')
    parser.add_argument('--json-out', help='Write JSON audit manifest to file')
    args = parser.parse_args()

    if os.path.isfile(args.target):
        # Single file validation
        result = validate_single_glb(args.target, args.component, verbose=True)
        if args.strict_a and result.get('grade') != 'A':
            sys.exit(1)
    elif os.path.isdir(args.target):
        # Fleet-wide audit
        results = audit_fleet(args.target, args.component, verbose=args.verbose)
        if args.json_out:
            # Sanitize for JSON serialization
            for r in results:
                for k, v in r.items():
                    if isinstance(v, dict):
                        for dk, dv in v.items():
                            if isinstance(dv, bool):
                                r[k][dk] = dv
            with open(args.json_out, 'w') as f:
                json.dump(results, f, indent=2, default=str)
            print(f"\nAudit manifest written to: {args.json_out}")

        if args.strict_a:
            fails = [r for r in results if r.get('grade') != 'A']
            if fails:
                print(f"\n⚠️  {len(fails)} vehicles did not achieve Grade A")
                sys.exit(1)
    else:
        print(f"ERROR: Target not found: {args.target}")
        sys.exit(1)


if __name__ == '__main__':
    main()
