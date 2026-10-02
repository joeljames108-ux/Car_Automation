"""
AUTO TYCOON CAMPUS HQ - CAMPUS EXPORT UTILITIES (PHASE 63)

Standardized GLB exporter for campus buildings, plots, and infrastructure assets.
Ensures correct glTF 2.0 flags, preserves kinematic pivots (export_apply=False),
embeds custom extras metadata, and applies meshopt/PBR rules.
"""

import os
import bpy

def export_campus_glb(filepath: str, objects_to_export=None, extras_metadata=None):
    """
    Exports selected or given objects to a standard GLB file.
    Ensures parent directories exist and uses optimal automotive game engine export flags.
    """
    target_dir = os.path.dirname(filepath)
    if target_dir and not os.path.exists(target_dir):
        os.makedirs(target_dir, exist_ok=True)

    # If specific objects are requested, isolate selection
    if objects_to_export:
        bpy.ops.object.select_all(action='DESELECT')
        for obj in objects_to_export:
            obj.select_set(True)
            if extras_metadata and isinstance(extras_metadata, dict):
                for k, v in extras_metadata.items():
                    obj[k] = v

    # Export using Blender 4.x / 5.x glTF operator
    bpy.ops.export_scene.gltf(
        filepath=filepath,
        export_format='GLB',
        use_selection=bool(objects_to_export),
        export_apply=False, # MANDATORY: Preserve local origins for interactive elements
        export_extras=True, # MANDATORY: Embed metadata dictionaries
        export_materials='EXPORT',
        export_cameras=False,
        export_lights=False,
    )

    if os.path.exists(filepath):
        size_kb = os.path.getsize(filepath) / 1024
        print(f"[CampusExport] Successfully exported GLB ({size_kb:.1f} KB) -> {filepath}")
        return True
    else:
        print(f"[CampusExport] ERROR: Failed to export GLB to {filepath}")
        return False
