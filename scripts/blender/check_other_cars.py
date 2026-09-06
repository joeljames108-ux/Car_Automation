import bpy
import os
from mathutils import Vector

def check_model(name, rel_path):
    p = os.path.abspath(rel_path)
    if not os.path.exists(p):
        print(f"[{name}] Not found")
        return
    bpy.ops.wm.read_factory_settings(use_empty=True)
    if p.endswith('.glb') or p.endswith('.gltf'):
        bpy.ops.import_scene.gltf(filepath=p)
    elif p.endswith('.fbx'):
        bpy.ops.import_scene.fbx(filepath=p)
    elif p.endswith('.obj'):
        bpy.ops.wm.obj_import(filepath=p)
    
    meshes = [o for o in bpy.data.objects if o.type == 'MESH']
    poly_count = sum(len(m.data.polygons) for m in meshes)
    all_corners = [o.matrix_world @ Vector(c) for o in meshes for c in o.bound_box]
    if all_corners:
        min_c = Vector((min(c.x for c in all_corners), min(c.y for c in all_corners), min(c.z for c in all_corners)))
        max_c = Vector((max(c.x for c in all_corners), max(c.y for c in all_corners), max(c.z for c in all_corners)))
        dims = max_c - min_c
        print(f"[{name:25s}] {len(meshes):3d} meshes, {poly_count:7,d} polys | dims: X={dims.x:.2f} Y={dims.y:.2f} Z={dims.z:.2f} | bounds: X[{min_c.x:.2f}, {max_c.x:.2f}] Y[{min_c.y:.2f}, {max_c.y:.2f}] Z[{min_c.z:.2f}, {max_c.z:.2f}]")
        print(f"   First 6 objects: {[m.name for m in meshes[:6]]}")

models = [
    ("full_modular_assembly", "public/models/exterior/full_modular_car_assembly.glb"),
    ("sports_coupe_gt", "public/models/exterior/sports_coupe_gt.glb"),
    ("gt_coupe", "public/models/exterior/vehicle_grand_tourer_coupe.glb"),
    ("dodge_challenger", "public/models/exterior/dodge_challenger_srt.glb"),
    ("bmw_i8", "public/models/exterior/sports_car_bmw_i8.glb"),
    ("sedan_chassis", "public/models/vehicles/sedan/chassis.glb"),
    ("sedan_body", "public/models/vehicles/sedan/body-framework.glb"),
]

for name, p in models:
    check_model(name, p)
