import bpy
import sys
import os
from mathutils import Vector

def inspect_glb(glb_path):
    print(f"\n==========================================")
    print(f"INSPECTING GLB: {glb_path}")
    print(f"==========================================")
    
    if not os.path.exists(glb_path):
        print(f"Error: File does not exist: {glb_path}")
        return
        
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=glb_path)
    
    objects = list(bpy.data.objects)
    print(f"Total objects imported: {len(objects)}")
    
    min_z = float('inf')
    max_z = float('-inf')
    min_x = float('inf')
    max_x = float('-inf')
    min_y = float('inf')
    max_y = float('-inf')
    
    mesh_objects = []
    
    for obj in objects:
        if obj.type == 'MESH':
            mesh_objects.append(obj)
            bbox_corners = [obj.matrix_world @ Vector(corner) for corner in obj.bound_box]
            for c in bbox_corners:
                min_x = min(min_x, c.x)
                max_x = max(max_x, c.x)
                min_y = min(min_y, c.y)
                max_y = max(max_y, c.y)
                min_z = min(min_z, c.z)
                max_z = max(max_z, c.z)
                
    print(f"Mesh objects count: {len(mesh_objects)}")
    print(f"Bounding Box: X=[{min_x:.3f}, {max_x:.3f}] (width={max_x-min_x:.3f}m)")
    print(f"              Y=[{min_y:.3f}, {max_y:.3f}] (length={max_y-min_y:.3f}m)")
    print(f"              Z=[{min_z:.3f}, {max_z:.3f}] (height={max_z-min_z:.3f}m)")
    
    print("\nTop 30 Object Names & Material Slots:")
    for obj in mesh_objects[:30]:
        mats = [slot.material.name if slot.material else "None" for slot in obj.material_slots]
        print(f"  - {obj.name} | Verts: {len(obj.data.vertices)} | Mats: {mats}")
        
    if len(mesh_objects) > 30:
        print(f"  ... and {len(mesh_objects) - 30} more meshes.")

if __name__ == "__main__":
    for path in [
        r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\public\models\exterior\sports_car_bmw_i8.glb",
        r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\public\models\exterior\vehicle_hypercar_apex_gt3.glb"
    ]:
        inspect_glb(path)
