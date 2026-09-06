import bpy
import os

p = os.path.abspath("public/models/exterior/sports_coupe_gt.glb")
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=p)
meshes = [o for o in bpy.data.objects if o.type == 'MESH']
print(f"Total objects: {len(meshes)}")
for m in meshes:
    print(f"  {m.name:35s} | {len(m.data.polygons):6d} polys | mats: {[mat.name for mat in m.data.materials if mat]}")
