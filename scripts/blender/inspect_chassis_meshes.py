import bpy
import os
from mathutils import Vector

p = os.path.abspath("public/models/chassis/ev_skateboard_chassis_01.glb")
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=p)

for o in bpy.data.objects:
    if o.type == 'MESH':
        corners = [o.matrix_world @ Vector(c) for c in o.bound_box]
        min_c = Vector((min(c.x for c in corners), min(c.y for c in corners), min(c.z for c in corners)))
        max_c = Vector((max(c.x for c in corners), max(c.y for c in corners), max(c.z for c in corners)))
        dims = max_c - min_c
        print(f"Chassis Mesh: {o.name:20s} | Polys: {len(o.data.polygons):5d} | X[{min_c.x:.2f}, {max_c.x:.2f}] Y[{min_c.y:.2f}, {max_c.y:.2f}] Z[{min_c.z:.2f}, {max_c.z:.2f}]")
