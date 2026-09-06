import bpy
import os

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SOURCE_FBX = os.path.join(PROJECT_DIR, "public", "models", "extracted", "2024-byd-atto-3", "source", "FINAL_MODEL", "FINAL_MODEL.fbx")

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=SOURCE_FBX)

for o in bpy.data.objects:
    if o.name == "bodypaint_A":
        print(f"bodypaint_A: Polys={len(o.data.polygons)}, Verts={len(o.data.vertices)}")
        print(f"Custom normals: {o.data.has_custom_normals}")
        print(f"First 5 polygon use_smooth: {[p.use_smooth for p in o.data.polygons[:5]]}")
