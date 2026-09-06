import bpy
import os
from mathutils import Vector

PROJECT_DIR = r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project"

def inspect_file(tag, filepath, is_fbx=False):
    print(f"\n==================== INSPECTING {tag} ====================")
    bpy.ops.wm.read_factory_settings(use_empty=True)
    if is_fbx:
        bpy.ops.import_scene.fbx(filepath=filepath)
    else:
        bpy.ops.import_scene.gltf(filepath=filepath)
    
    mesh_objs = [o for o in bpy.data.objects if o.type == 'MESH']
    print(f"Total meshes: {len(mesh_objs)}, Polys: {sum(len(m.data.polygons) for m in mesh_objs):,}")
    sample = [o.name for o in mesh_objs[:25]]
    print("Sample mesh names:", sample)
    
    # Bounding box
    all_corners = [o.matrix_world @ Vector(o.bound_box[i]) for o in mesh_objs for i in range(8)]
    if all_corners:
        min_x = min(c[0] for c in all_corners)
        max_x = max(c[0] for c in all_corners)
        min_y = min(c[1] for c in all_corners)
        max_y = max(c[1] for c in all_corners)
        min_z = min(c[2] for c in all_corners)
        max_z = max(c[2] for c in all_corners)
        print(f"Bounds: X=[{min_x:.3f}, {max_x:.3f}] (size {max_x-min_x:.3f}m)")
        print(f"        Y=[{min_y:.3f}, {max_y:.3f}] (size {max_y-min_y:.3f}m)")
        print(f"        Z=[{min_z:.3f}, {max_z:.3f}] (size {max_z-min_z:.3f}m)")

inspect_file("SUV", os.path.join(PROJECT_DIR, "public", "models", "extracted", "32-mercedes-benz-gls-580-2020", "uploads_files_2787791_Mercedes+Benz+GLS+580.fbx"), is_fbx=True)
inspect_file("GT3_BMW", os.path.join(PROJECT_DIR, "public", "models", "extracted", "bmw-i8-xs-2015", "source", "2015-bmw-i8_xs_car.glb"), is_fbx=False)
