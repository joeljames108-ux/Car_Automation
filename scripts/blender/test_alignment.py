import bpy
import os
from mathutils import Vector

def test_integration():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    
    # 1. Load current vehicle
    veh_path = os.path.abspath("exports/Car_Sedan_Complete.glb")
    bpy.ops.import_scene.gltf(filepath=veh_path)
    veh_meshes = [o for o in bpy.data.objects if o.type == 'MESH']
    all_corners = [o.matrix_world @ Vector(c) for o in veh_meshes for c in o.bound_box]
    v_min = Vector((min(c.x for c in all_corners), min(c.y for c in all_corners), min(c.z for c in all_corners)))
    v_max = Vector((max(c.x for c in all_corners), max(c.y for c in all_corners), max(c.z for c in all_corners)))
    print(f"Vehicle bounds: X[{v_min.x:.2f}, {v_max.x:.2f}] Y[{v_min.y:.2f}, {v_max.y:.2f}] Z[{v_min.z:.2f}, {v_max.z:.2f}]")
    
    # Check wheel positions
    tyres = [o for o in veh_meshes if 'tyre' in o.name.lower()]
    print(f"Found {len(tyres)} tyre objects")
    
    # 2. Check chassis
    chassis_path = os.path.abspath("public/models/chassis/ev_skateboard_chassis_01.glb")
    bpy.ops.import_scene.gltf(filepath=chassis_path)
    chassis_objs = [o for o in bpy.context.selected_objects if o.type == 'MESH']
    c_corners = [o.matrix_world @ Vector(c) for o in chassis_objs for c in o.bound_box]
    c_min = Vector((min(c.x for c in c_corners), min(c.y for c in c_corners), min(c.z for c in c_corners)))
    c_max = Vector((max(c.x for c in c_corners), max(c.y for c in c_corners), max(c.z for c in c_corners)))
    print(f"Chassis bounds: X[{c_min.x:.2f}, {c_max.x:.2f}] Y[{c_min.y:.2f}, {c_max.y:.2f}] Z[{c_min.z:.2f}, {c_max.z:.2f}]")
    
    # 3. Check steering
    steer_path = os.path.abspath("public/models/exterior/steering_system.glb")
    bpy.ops.import_scene.gltf(filepath=steer_path)
    steer_objs = [o for o in bpy.context.selected_objects if o.type == 'MESH']
    s_corners = [o.matrix_world @ Vector(c) for o in steer_objs for c in o.bound_box]
    s_min = Vector((min(c.x for c in s_corners), min(c.y for c in s_corners), min(c.z for c in s_corners)))
    s_max = Vector((max(c.x for c in s_corners), max(c.y for c in s_corners), max(c.z for c in s_corners)))
    print(f"Steering bounds: X[{s_min.x:.2f}, {s_max.x:.2f}] Y[{s_min.y:.2f}, {s_max.y:.2f}] Z[{s_min.z:.2f}, {s_max.z:.2f}]")

test_integration()
