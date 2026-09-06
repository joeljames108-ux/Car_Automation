import bpy
import os

SOURCE_FBX = os.path.abspath("public/models/extracted/2024-byd-atto-3/source/FINAL_MODEL/FINAL_MODEL.fbx")
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=SOURCE_FBX)

for o in bpy.data.objects:
    if o.type == 'MESH':
        print(f"Name: {o.name:30s} | Polys: {len(o.data.polygons):6d} | Mats: {[m.name for m in o.data.materials if m]}")
