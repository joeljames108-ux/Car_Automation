import bpy
import os
import sys

v12_dir = os.path.abspath("public/models/engines/v12")
files = [f for f in os.listdir(v12_dir) if f.endswith(".glb")]

print(f"--- FOUND {len(files)} GLBs IN {v12_dir} ---")
for fname in sorted(files):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    fpath = os.path.join(v12_dir, fname)
    bpy.ops.import_scene.gltf(filepath=fpath)
    objs = [o for o in bpy.data.objects if o.type == 'MESH']
    mats = list(bpy.data.materials)
    vert_count = sum(len(o.data.vertices) for o in objs)
    poly_count = sum(len(o.data.polygons) for o in objs)
    print(f"[{fname}] Objs: {len(objs)}, Verts: {vert_count}, Polys: {poly_count}, Mats: {[m.name for m in mats]}")
