#!/usr/bin/env python3
"""
============================================================================
Automotive GLB Quality Assurance & Skill Orchestrator
============================================================================
Implements repository-wide orchestration from:
  - skills of parts/skill for glb quality and skill orchestration/SKILL.md
  - AGENTS.md (Mandatory Automotive GLB Quality & Skill Orchestration Enforcement)

Dispatches assets against the 11 Specialized Domain Skills + 6 Cross-Cutting Skills:
  Domains:
    1.  Interior Seating       -> skill-for-seats
    2.  Steering & Column      -> skill-for-steering-wheel
    3.  Dashboard & Console    -> skill-for-dashboard
    4.  Door Panels & Glass    -> skill-for-door-panels
    5.  Wheels, Tires & Brakes -> skill-for-wheels-and-brakes
    6.  Exterior Body & Aero   -> skill-for-exterior-body-and-doors
    7.  Lighting Optics        -> skill-for-lighting-optics
    8.  Powertrain & Engine    -> skill-for-powertrain-and-engine-bay
    9.  Chassis & Suspension   -> skill-for-chassis-and-suspension
    10. Pedals & Footwell      -> skill-for-pedals-and-footwell
    11. Underbody & Undertray  -> skill-for-underbody-and-aero-undertray

  Cross-Cutting Standards:
    - skill-for-interactive-glb (Kinematic Pivots & Hitboxes)
    - skill-for-audio-haptic-binding (Web Audio & Mobile Touch Haptics)
    - skill-for-vehicle-camera-framing (CAMERA_* glTF Anchor Nodes)
    - skill-for-glb-materials-and-variants (KHR_materials_variants)
    - skill-for-glb-meshopt-compression (EXT_meshopt_compression)
    - skill-for-automated-glb-quality-gate (7 Quality Gates & Grade A Certification)

Usage:
  python scripts/glb_quality_orchestrator.py --single public/models/vehicles/sports_car/2020s/vehicle.glb
  python scripts/glb_quality_orchestrator.py --all
  python scripts/glb_quality_orchestrator.py --enforce
============================================================================
"""
import os
import sys
import json
import argparse
import subprocess

# Ensure scripts dir is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from validate_glb_production import validate_single_glb, audit_fleet, parse_glb, get_node_names, get_mesh_names


# ─── Domain Skill Dispatch Matrix ──────────────────────────────────────────
SUBSYSTEM_DISPATCH_MATRIX = {
    'Interior Seating': {
        'keywords': ['seat', 'cushion', 'backrest', 'headrest', 'bolster', 'isofix'],
        'skill': 'skill-for-seats',
        'contract': '70k-90k tris/seat, 5-flute parabolic lofting, -8mm gutters, +14° to +17° recline, Action_Seat_Recline/Slide, bolster morphs',
        'target_triangles': (70000, 180000)
    },
    'Steering & Column': {
        'keywords': ['steering', 'wheel_rim', 'paddle', 'column', 'shifter_paddle', 'airbag_cover', 'manettino'],
        'skill': 'skill-for-steering-wheel',
        'contract': '35k-50k tris, D-cut rim, magnetic paddle shifters, Manettino drive mode dial, Action_Steering_Turn, column tilt',
        'target_triangles': (35000, 50000)
    },
    'Dashboard & Console': {
        'keywords': ['dashboard', 'binnacle', 'console', 'oled', 'infotainment', 'instrument_cluster', 'glovebox', 'cupholder', 'armrest'],
        'skill': 'skill-for-dashboard',
        'contract': '75k-95k tris, curved OLED binnacle, climate ribbon, cantilevered display, butterfly armrests, shifter actions',
        'target_triangles': (75000, 95000)
    },
    'Door Panels & Glass': {
        'keywords': ['door_panel', 'door_card', 'window_regulator', 'door_fl', 'door_fr', 'door_rl', 'door_rr', 'latch', 'speaker_grille'],
        'skill': 'skill-for-door-panels',
        'contract': '35k-50k tris/door (70k-100k pair), laser speaker grilles, tactile switchpacks, Action_Window_Lower, Action_Door_Latch_Pull',
        'target_triangles': (70000, 100000)
    },
    'Wheels, Tires & Brakes': {
        'keywords': ['wheel', 'tire', 'tyre', 'caliper', 'rotor', 'brake_disc', 'rim', 'lug_nut', 'hubcap'],
        'skill': 'skill-for-wheels-and-brakes',
        'contract': '96k-105k tris across 4 corners, 3D carved directional tread sipes, cross-drilled ceramic vanes, Action_Wheel_Spin',
        'target_triangles': (96000, 105000)
    },
    'Exterior Body & Aero': {
        'keywords': ['body', 'fender', 'hood', 'bonnet', 'trunk', 'decklid', 'roof', 'spoiler', 'wing', 'splitter', 'quarter_panel'],
        'skill': 'skill-for-exterior-body-and-doors',
        'contract': '135k-150k tris, 12-section lofted cage, 3.5mm shutlines, articulating doors/hood/trunk, Action_Aero_Wing_Deploy',
        'target_triangles': (135000, 150000)
    },
    'Lighting Optics': {
        'keywords': ['headlamp', 'taillamp', 'headlight', 'taillight', 'drl', 'light_pipe', 'projector_lens', 'indicator', 'tailbar'],
        'skill': 'skill-for-lighting-optics',
        'contract': '16k-25k tris, quartz projector lenses, 3D extruded DRL light-pipes, full-width OLED tailbar, DRL/turn indicator actions',
        'target_triangles': (16000, 25000)
    },
    'Powertrain & Engine': {
        'keywords': ['engine', 'motor', 'v8', 'v6', 'v10', 'v12', 'turbo', 'supercharger', 'exhaust', 'plenum', 'intake', 'strut_brace'],
        'skill': 'skill-for-powertrain-and-engine-bay',
        'contract': '35k-45k tris, Hot-V twin-turbo V8, carbon plenums, equal-length headers, removable cover, idle vibe morph',
        'target_triangles': (35000, 45000)
    },
    'Chassis & Suspension': {
        'keywords': ['chassis', 'subframe', 'suspension', 'wishbone', 'pushrod', 'bell_crank', 'damper', 'coilover', 'anti_roll'],
        'skill': 'skill-for-chassis-and-suspension',
        'contract': '35k-40k tris, carbon monocoque tub, tubular subframes, double-wishbone pushrods, bell cranks, suspension stroke action',
        'target_triangles': (35000, 40000)
    },
    'Pedals & Footwell': {
        'keywords': ['pedal', 'throttle', 'accelerator', 'brake_pedal', 'clutch_pedal', 'dead_pedal', 'footwell'],
        'skill': 'skill-for-pedals-and-footwell',
        'contract': '18k-25k tris, organ throttle (0-18°), hanging brake with balance bar, dead pedal, pedal stroke depression actions',
        'target_triangles': (18000, 25000)
    },
    'Underbody & Undertray': {
        'keywords': ['undertray', 'venturi', 'diffuser_floor', 'belly_pan', 'naca_duct', 'flat_floor', 'skid_plate'],
        'skill': 'skill-for-underbody-and-aero-undertray',
        'contract': '8k-12k tris, enclosed flat floor, twin Venturi expansion tunnels (10-12°), vortex strakes, active diffuser trim',
        'target_triangles': (8000, 12000)
    }
}


def detect_domains(gltf_json):
    """Detect which automotive subsystem domains are present in the GLB scene graph."""
    node_names = [n.lower() for n in get_node_names(gltf_json)]
    mesh_names = [m.lower() for m in get_mesh_names(gltf_json)]
    all_names = node_names + mesh_names

    detected = {}
    for domain, info in SUBSYSTEM_DISPATCH_MATRIX.items():
        matches = []
        for kw in info['keywords']:
            matching_elements = [name for name in all_names if kw in name]
            if matching_elements:
                matches.extend(matching_elements[:3])
        if matches:
            detected[domain] = {
                'skill': info['skill'],
                'contract': info['contract'],
                'matches': list(set(matches))[:5],
                'target_triangles': info['target_triangles']
            }
    return detected


def orchestrate_single(filepath, verbose=True):
    """Run full orchestration and quality gate check on a single GLB."""
    gltf_json, _ = parse_glb(filepath)
    if gltf_json is None:
        print(f"ERROR: Cannot parse GLB: {filepath}")
        return None

    # Step 1: Subsystem Domain Detection
    domains = detect_domains(gltf_json)

    # Step 2: 7 Quality Gates Audit
    result = validate_single_glb(filepath, verbose=False)
    result['detected_domains'] = domains

    if verbose:
        print("=" * 90)
        print("  AUTOMOTIVE GLB QUALITY ORCHESTRATOR REPORT")
        print(f"  Target Asset: {filepath}")
        print("=" * 90)
        print(f"  Overall Score: {result['score']:.1f}%  |  Certification Grade: {result['grade']}")
        status_str = "✅ PRODUCTION READY" if result['grade'] == 'A' else ("⚠️  ACCEPTABLE (Needs refinement)" if result['grade'] == 'B' else "❌ NON-COMPLIANT (Rejected)")
        print(f"  Certification Status: {status_str}")
        print("-" * 90)

        # Domain Dispatch
        print(f"  DETECTED SUBSYSTEM DOMAINS ({len(domains)}/11 Active):")
        for domain, d_info in domains.items():
            print(f"    • {domain:<25} -> Activated Skill: [{d_info['skill']}]")
            print(f"      Contract: {d_info['contract']}")
            print(f"      Sample Nodes/Meshes: {', '.join(d_info['matches'][:3])}")
        print("-" * 90)

        # Quality Gates Breakdown
        print("  THE 7 QUALITY GATES:")
        print(f"    Gate 1: File Size Budget:       {result['gate1']:5.1f}%  ({result['size_kb']:.1f} KB)")
        print(f"    Gate 2: Polygon Density:         {result['gate2']:5.1f}%  ({result['triangles']:,} triangles)")
        print(f"    Gate 3: Subsystem Completeness:  {result['gate3']:5.1f}%")
        print(f"    Gate 4: Semantic Hitboxes:       {result['gate4']:5.1f}%  ({len(result['hitboxes'])} HITBOX_* nodes)")
        print(f"    Gate 5: Baked NLA Actions:       {result['gate5']:5.1f}%  ({len(result['actions'])} Action_* clips)")
        print(f"    Gate 6: Metadata & Haptics:      {result['gate6']:5.1f}%  (extras: {result['extras']})")
        print(f"    Gate 7: PBR Material Quality:    {result['gate7']:5.1f}%  ({result['materials']['count']} materials)")
        print("-" * 90)

        # Cross-Cutting Standards
        print("  CROSS-CUTTING STANDARDS COMPLIANCE:")
        print(f"    • Camera Anchors (CAMERA_*):      {len(result['cameras'])} nodes present")
        print(f"    • KHR_materials_variants:         {'✓ Present' if result['khr_materials_variants'] else '✗ Missing'}")
        print(f"    • EXT_meshopt_compression:        {'✓ Present' if result['ext_meshopt'] else '✗ Missing'}")
        print("=" * 90)

        # Recommendations
        missing_recs = []
        if result['gate4'] < 50:
            missing_recs.append("Add lightweight HITBOX_* collision meshes (≤64 tris) for raycast click detection.")
        if result['gate5'] < 50:
            missing_recs.append("Bake NLA keyframed Action_* clips for kinematic components (wheels, doors, steering).")
        if result['gate6'] < 50:
            missing_recs.append("Populate node.extras with 'interactive': true, 'sound_fx': '...', and 'haptic' schemas.")
        if not result['cameras']:
            missing_recs.append("Bake CAMERA_* anchor nodes (CAMERA_HERO, CAMERA_COCKPIT, CAMERA_POWERTRAIN).")

        if missing_recs:
            print("  RECOMMENDED ORCHESTRATION ACTIONS FOR GRADE A CERTIFICATION:")
            for i, rec in enumerate(missing_recs, 1):
                print(f"    {i}. {rec}")
            print("=" * 90)

    return result


def main():
    parser = argparse.ArgumentParser(description="Automotive GLB Quality Assurance & Skill Orchestrator")
    parser.add_argument('--single', help='Path to single GLB asset to orchestrate')
    parser.add_argument('--all', action='store_true', help='Orchestrate and audit all models across the entire repository')
    parser.add_argument('--dir', default='e:/Car_Automation', help='Base repository directory (default: e:/Car_Automation)')
    parser.add_argument('--enforce', action='store_true', help='Strict mode for CI/CD: exits with 1 if any asset fails Grade A')
    parser.add_argument('--manifest', default='docs/GLB_QUALITY_AUDIT_MANIFEST.json', help='Audit manifest output path')
    args = parser.parse_args()

    if args.single:
        res = orchestrate_single(args.single, verbose=True)
        if args.enforce and (res is None or res.get('grade') != 'A'):
            sys.exit(1)
    elif args.all or args.enforce:
        print("Starting repository-wide GLB Quality Orchestration Audit...")
        results = audit_fleet(args.dir, verbose=False)
        manifest_path = os.path.join(args.dir, args.manifest) if not os.path.isabs(args.manifest) else args.manifest
        os.makedirs(os.path.dirname(manifest_path), exist_ok=True)
        with open(manifest_path, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, default=str)
        print(f"\nManifest successfully updated at: {manifest_path}")

        grade_a = sum(1 for r in results if r.get('grade') == 'A')
        total = len(results)
        print(f"\nOrchestrator Fleet Grade A Compliance: {grade_a}/{total} ({grade_a/total*100:.1f}%)")
        if args.enforce and grade_a < total:
            print("ERROR: CI/CD Enforcement failed. Not all assets achieved Grade A.")
            sys.exit(1)
    else:
        parser.print_help()


if __name__ == '__main__':
    main()
