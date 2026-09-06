import bpy
import bmesh
import os
from mathutils import Vector

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SOURCE_FBX = os.path.join(PROJECT_DIR, "public", "models", "extracted", "2024-byd-atto-3", "source", "FINAL_MODEL", "FINAL_MODEL.fbx")

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=SOURCE_FBX)

obj = bpy.data.objects.get("Interior")
if obj:
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    uv_layer = bm.loops.layers.uv.verify()
    
    # Check UV bounding box
    u_vals = []
    v_vals = []
    for f in bm.faces:
        for l in f.loops:
            u_vals.append(l[uv_layer].uv.x)
            v_vals.append(l[uv_layer].uv.y)
    
    print(f"Interior UV range: U=[{min(u_vals):.3f}, {max(u_vals):.3f}], V=[{min(v_vals):.3f}, {max(v_vals):.3f}]")
    bm.free()
