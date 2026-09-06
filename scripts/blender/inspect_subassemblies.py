import bpy
import os
from mathutils import Vector

def inspect(name, path):
    p = os.path.abspath(path)
    if not os.path.exists(p):
        print(f"[{name}] NOT FOUND: {p}")
        return
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=p)
    meshes = [o for o in bpy.data.objects if o.type == 'MESH']
    poly_count = sum(len(m.data.polygons) for m in meshes)
    all_corners = [o.matrix_world @ Vector(c) for o in meshes for c in o.bound_box]
    if all_corners:
        min_c = Vector((min(c.x for c in all_corners), min(c.y for c in all_corners), min(c.z for c in all_corners)))
        max_c = Vector((max(c.x for c in all_corners), max(c.y for c in all_corners), max(c.z for c in all_corners)))
        dims = max_c - min_c
        print(f"[{name:25s}] {len(meshes):3d} meshes, {poly_count:7,d} polys | dims: X={dims.x:.2f} Y={dims.y:.2f} Z={dims.z:.2f} | bounds: X[{min_c.x:.2f}, {max_c.x:.2f}] Y[{min_c.y:.2f}, {max_c.y:.2f}] Z[{min_c.z:.2f}, {max_c.z:.2f}]")
        # List first 10 mesh names
        sample_names = [m.name for m in meshes[:8]]
        print(f"   Sample objects: {sample_names}")

targets = [
    ("cockpit_luxury_exec", "public/models/interior/cockpit_luxury_executive.glb"),
    ("vip_salon", "public/models/interior/cockpit_coachbuilt_vip_salon.glb"),
    ("door_cards_exec", "public/models/interior/door_cards_executive.glb"),
    ("seat_massage", "public/models/interior/seat_luxury_massage.glb"),
    ("steering_luxury", "public/models/interior/steering_luxury_3spoke.glb"),
    ("center_console_exec", "public/models/interior/center_console_executive.glb"),
    ("roof_starlight", "public/models/interior/roof_starlight.glb"),
    ("mirrors", "public/models/exterior/mirrors.glb"),
    ("wipers", "public/models/exterior/wipers.glb"),
    ("door_handles", "public/models/exterior/door_handles.glb"),
    ("brakes", "public/models/exterior/brakes.glb"),
]

for name, rel in targets:
    inspect(name, rel)
