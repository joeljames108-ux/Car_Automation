import bpy
import os
from mathutils import Vector

assets = [
    ("chassis", "public/models/chassis/ev_skateboard_chassis_01.glb"),
    ("susp_f", "public/models/exterior/suspension_front.glb"),
    ("susp_r", "public/models/exterior/suspension_rear.glb"),
    ("steer", "public/models/exterior/steering_system.glb"),
    ("seats", "public/models/interior/seat_executive_lounge.glb"),
]

for name, rel_path in assets:
    p = os.path.abspath(rel_path)
    if os.path.exists(p):
        bpy.ops.wm.read_factory_settings(use_empty=True)
        bpy.ops.import_scene.gltf(filepath=p)
        all_corners = [o.matrix_world @ Vector(c) for o in bpy.data.objects if o.type == 'MESH' for c in o.bound_box]
        min_c = Vector((min(c.x for c in all_corners), min(c.y for c in all_corners), min(c.z for c in all_corners)))
        max_c = Vector((max(c.x for c in all_corners), max(c.y for c in all_corners), max(c.z for c in all_corners)))
        print(f"{name:10s} bounds: X[{min_c.x:.2f}, {max_c.x:.2f}] Y[{min_c.y:.2f}, {max_c.y:.2f}] Z[{min_c.z:.2f}, {max_c.z:.2f}]")
