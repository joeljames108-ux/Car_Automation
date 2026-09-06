import bpy
import os
from mathutils import Vector

def check_car_bounds(filepath, file_type):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    if file_type == 'blend':
        bpy.ops.wm.open_mainfile(filepath=filepath)
    elif file_type == 'fbx':
        bpy.ops.import_scene.fbx(filepath=filepath)
    elif file_type == 'glb':
        bpy.ops.import_scene.gltf(filepath=filepath)
        
    mesh_objs = [o for o in bpy.data.objects if o.type == 'MESH']
    if not mesh_objs:
        print(f"[{os.path.basename(filepath)}] No meshes found!")
        return
        
    all_corners = [obj.matrix_world @ Vector(c) for obj in mesh_objs for c in obj.bound_box]
    min_x = min(c.x for c in all_corners)
    max_x = max(c.x for c in all_corners)
    min_y = min(c.y for c in all_corners)
    max_y = max(c.y for c in all_corners)
    min_z = min(c.z for c in all_corners)
    max_z = max(c.z for c in all_corners)
    
    dim_x = max_x - min_x
    dim_y = max_y - min_y
    dim_z = max_z - min_z
    
    total_polys = sum(len(o.data.polygons) for o in mesh_objs)
    print(f"[{os.path.basename(filepath)}]")
    print(f"  Meshes: {len(mesh_objs)}, Polygons: {total_polys:,}")
    print(f"  Bounds (X, Y, Z): {dim_x:.4f} x {dim_y:.4f} x {dim_z:.4f} m")
    print(f"  Min Z: {min_z:.4f}m, Max Z: {max_z:.4f}m")

if __name__ == "__main__":
    targets = [
        (r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\public\models\extracted\2015-rocket-bunny-s15-nissan-silvia\source\FINAL_MODEL_RB\FINAL_MODEL_02.fbx", "fbx"),
        (r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\public\models\extracted\32-mercedes-benz-gls-580-2020\uploads_files_2787791_Mercedes+Benz+GLS+580.blend", "blend"),
        (r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\public\models\extracted\89-challenger\Challenger.blend", "blend"),
        (r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\public\models\exterior\vehicle_hypercar_apex_gt3.glb", "glb"),
        (r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\public\models\exterior\volvo_p1800_restomod.glb", "glb")
    ]
    for p, t in targets:
        if os.path.exists(p):
            check_car_bounds(p, t)
