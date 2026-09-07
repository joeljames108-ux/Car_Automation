"""
Upgrades public/models/engines/v12_racing_engine_complete.glb and
public/models/v12_racing_engine.glb with photorealistic Blender PBR shaders,
smooth shading, and weighted normals while preserving all 537 kinematic named nodes.
"""

import bpy
import os
import shutil
import sys

# Ensure local script directory is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import engine_pbr_upgrade_lib as pbr_lib

def upgrade_complete_v12():
    target_path = os.path.abspath("public/models/engines/v12_racing_engine_complete.glb")
    legacy_path = os.path.abspath("public/models/v12_racing_engine.glb")
    exploded_path = os.path.abspath("public/models/engines/v12_racing_engine_exploded.glb")

    for path in [target_path, exploded_path]:
        if not os.path.exists(path):
            print(f"[SKIP] Not found: {path}")
            continue

        print(f"\n[BLENDER PBR UPGRADE] Processing {path}...")
        pbr_lib.reset_scene()
        bpy.ops.import_scene.gltf(filepath=path)
        mat_suite = pbr_lib.get_pbr_suite()

        mesh_count = 0
        for obj in bpy.data.objects:
            if obj.type == 'MESH':
                mesh_count += 1
                pbr_lib.apply_mesh_enhancements(obj, mat_suite)

        print(f"[BLENDER PBR UPGRADE] Applied PBR shaders to {mesh_count} meshes.")

        bpy.ops.object.select_all(action='SELECT')
        bpy.ops.export_scene.gltf(
            filepath=path,
            export_format='GLB',
            use_selection=False,
            export_apply=False,
            export_yup=True,
            export_materials='EXPORT',
        )
        print(f"[BLENDER PBR UPGRADE] Exported upgraded GLB: {path} ({os.path.getsize(path)/1024:.1f} KB)")

    # Copy complete engine to legacy path
    if os.path.exists(target_path):
        shutil.copyfile(target_path, legacy_path)
        print(f"[BLENDER PBR UPGRADE] Duplicated to {legacy_path} ({os.path.getsize(legacy_path)/1024:.1f} KB)")

if __name__ == "__main__":
    upgrade_complete_v12()
