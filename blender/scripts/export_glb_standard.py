"""
==============================================================================
BLENDER 5.2 ASSET PIPELINE: STANDARDIZED GLB EXPORTER
==============================================================================
Provides a unified headless/interactive glTF 2.0 GLB export utility that enforces:
- Exact Three.js Y-Up coordinate space
- Strict pivot and local transformation preservation (export_apply=False)
- PBR material export with Principled BSDF compatibility
- Optional mesh cleanup and normal generation
==============================================================================
"""

import bpy
import os
import sys

def log(msg):
    print(f"[BLENDER_GLB_EXPORTER] {msg}")

def export_scene_to_glb(output_path, selected_only=False):
    """
    Exports the current Blender scene or selected objects to a standardized GLB.
    """
    output_path = os.path.abspath(output_path)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    log(f"Exporting GLB scene to: {output_path}")

    # Ensure in Object Mode
    if bpy.context.active_object and bpy.context.active_object.mode != 'OBJECT':
        bpy.ops.object.mode_set(mode='OBJECT')

    if not selected_only:
        bpy.ops.object.select_all(action='SELECT')

    bpy.ops.export_scene.gltf(
        filepath=output_path,
        export_format='GLB',
        use_selection=selected_only,
        export_apply=False,           # CRITICAL: Preserves local pivots and hierarchy
        export_yup=True,              # CRITICAL: Maps Blender Z-up to Three.js Y-up
        export_materials='EXPORT',     # PBR materials
        export_normals=True,          # Accurate vertex normals
        export_tangents=False,
        export_animations=True,
    )

    if os.path.exists(output_path):
        size_kb = round(os.path.getsize(output_path) / 1024, 2)
        log(f"Export SUCCESS: {output_path} ({size_kb} KB)")
        return True
    else:
        log(f"Export FAILED: File not found at {output_path}")
        return False

if __name__ == "__main__":
    # Check for CLI arguments passed after --
    args = sys.argv
    out_target = "exports/glb/exported_model.glb"

    if "--" in args:
        custom_args = args[args.index("--") + 1:]
        if len(custom_args) > 0:
            out_target = custom_args[0]
    elif len(args) > 1 and args[-1].endswith(".glb"):
        out_target = args[-1]

    export_scene_to_glb(out_target)
