import bpy
import os
from mathutils import Vector

def inspect_susp():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    p = os.path.abspath("public/models/exterior/suspension_front.glb")
    bpy.ops.import_scene.gltf(filepath=p)
    objs = [o for o in bpy.data.objects if o.type == 'MESH']
    print(f"--- SUSPENSION FRONT: {len(objs)} objects ---")
    for o in objs:
        corners = [o.matrix_world @ Vector(c) for c in o.bound_box]
        mn = Vector((min(c.x for c in corners), min(c.y for c in corners), min(c.z for c in corners)))
        mx = Vector((max(c.x for c in corners), max(c.y for c in corners), max(c.z for c in corners)))
        print(f"  {o.name:25s} | X[{mn.x:.2f}, {mx.x:.2f}] Y[{mn.y:.2f}, {mx.y:.2f}] Z[{mn.z:.2f}, {mx.z:.2f}]")

inspect_susp()
