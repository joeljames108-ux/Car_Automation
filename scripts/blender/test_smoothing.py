import bpy
import os

SOURCE_FBX = os.path.abspath("public/models/extracted/2024-byd-atto-3/source/FINAL_MODEL/FINAL_MODEL.fbx")
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=SOURCE_FBX)

bp = bpy.data.objects.get("bodypaint_A")
if bp:
    print(f"bodypaint_A modifiers: {[m.name for m in bp.modifiers]}")
    print(f"has_custom_normals: {getattr(bp.data, 'has_custom_normals', False)}")
    # Add Subdivision Surface
    sub = bp.modifiers.new(name="Subsurf", type='SUBSURF')
    sub.levels = 1
    sub.render_levels = 1
    print(f"Subsurf added successfully. Polys before: {len(bp.data.polygons)}")
