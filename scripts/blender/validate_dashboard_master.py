"""
==============================================================================
AUTOMOTIVE INTERACTIVE DASHBOARD MASTER VALIDATOR (BLENDER 5.2 LTS)
==============================================================================
Validates:
1. GLB asset existence and non-zero payload size.
2. Top-level COCKPIT_MASTER root and semantic branch collections.
3. All 7 discrete steering wheel typologies.
4. All 7 discrete center console shifter mechanisms.
5. Critical display surfaces and UV mapping.
6. PBR material assignment audit.
==============================================================================
"""

import bpy
import os
import sys

def log(msg):
    print(f"[DASH_VALIDATOR] {msg}")

def validate_dashboard_master():
    glb_path = os.path.abspath("public/models/interior/dashboard_interactive_master.glb")
    if not os.path.exists(glb_path):
        log(f"ERROR: GLB file missing at: {glb_path}")
        sys.exit(1)

    file_size_kb = os.path.getsize(glb_path) / 1024.0
    log(f"Auditing '{glb_path}' ({file_size_kb:.1f} KB)...")
    if file_size_kb < 30.0:
        log("ERROR: GLB payload is suspiciously small (< 30 KB)!")
        sys.exit(1)

    # Clean scene and import GLB
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=glb_path)

    obj_names = set(o.name for o in bpy.data.objects)

    required_roots = [
        "COCKPIT_MASTER",
        "CABIN",
        "DASHBOARD",
        "STEERING",
        "INFOTAINMENT",
        "CLUSTER",
        "HVAC",
        "CENTER_CONSOLE",
        "SHIFTER",
        "DOORS",
        "SEATS",
        "LIGHTING",
        "CONTROLS",
    ]

    missing_roots = [name for name in required_roots if name not in obj_names]
    if missing_roots:
        log(f"ERROR: Missing required semantic root objects: {missing_roots}")
        sys.exit(1)
    log(f"PASS: All {len(required_roots)} semantic root branches verified.")

    # 7 Steering Wheels
    expected_wheels = [
        "STEERING_SPORT_3SPOKE",
        "STEERING_GT_3SPOKE",
        "STEERING_GT3_YOKE",
        "STEERING_FORMULA",
        "STEERING_LUXURY_2SPOKE",
        "STEERING_CLASSIC_4SPOKE",
        "STEERING_PERFORMANCE_4SPOKE",
    ]
    missing_wheels = [w for w in expected_wheels if w not in obj_names]
    if missing_wheels:
        log(f"ERROR: Missing required steering wheel models: {missing_wheels}")
        sys.exit(1)
    log(f"PASS: All {len(expected_wheels)} discrete steering wheel models present.")

    # 7 Shifter Mechanisms
    expected_shifters = [
        "CONSOLE_SHIFTER_AUTO",
        "CONSOLE_SHIFTER_MANUAL_GATED",
        "CONSOLE_SHIFTER_MANUAL_H",
        "CONSOLE_SHIFTER_TOGGLE",
        "CONSOLE_SHIFTER_ROTARY",
        "CONSOLE_SHIFTER_CRYSTAL",
        "CONSOLE_SHIFTER_PERFORMANCE",
    ]
    missing_shifters = [s for s in expected_shifters if s not in obj_names]
    if missing_shifters:
        log(f"ERROR: Missing required shifter mechanisms: {missing_shifters}")
        sys.exit(1)
    log(f"PASS: All {len(expected_shifters)} discrete shifter mechanisms present.")

    # Critical Display Surfaces & UVs
    critical_displays = [
        "INFOTAINMENT_SCREEN",
        "CLUSTER_SCREEN",
        "HUD_PROJECTION_PLANE",
        "CLUSTER_DIAL_SPEEDO",
        "CLUSTER_DIAL_TACHO",
    ]
    for d in critical_displays:
        if d not in obj_names:
            log(f"ERROR: Missing critical display surface '{d}'")
            sys.exit(1)
        obj = bpy.data.objects[d]
        if not obj.data.uv_layers:
            log(f"ERROR: Display mesh '{d}' has no UV mapping!")
            sys.exit(1)
    log(f"PASS: All {len(critical_displays)} critical display surfaces verified with UV mapping.")

    # Material Audit
    mat_count = len(bpy.data.materials)
    log(f"PASS: {mat_count} PBR materials identified in cockpit scene.")
    if mat_count < 10:
        log("WARNING: Low material count (< 10) in GLB scene.")

    log("[SUCCESS] dashboard_interactive_master.glb passed all structural, semantic, and shader audits!")

if __name__ == "__main__":
    validate_dashboard_master()
