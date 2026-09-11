import bpy
import mathutils

glb_path = "public/models/interior/dashboard_interactive_master.glb"
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=glb_path)

print("=== CHECKING OBJECTS NEAR X=-0.38, Y=[-0.20, -0.05], Z=[0.70, 0.78] ===")
for obj in bpy.data.objects:
    if obj.type == 'MESH':
        bbox = [obj.matrix_world @ mathutils.Vector(corner) for corner in obj.bound_box]
        min_x = min(p.x for p in bbox)
        max_x = max(p.x for p in bbox)
        min_y = min(p.y for p in bbox)
        max_y = max(p.y for p in bbox)
        min_z = min(p.z for p in bbox)
        max_z = max(p.z for p in bbox)
        
        # Check if bounding box covers X=-0.38, Y between -0.20 and -0.05, Z between 0.70 and 0.78
        if min_x <= -0.38 <= max_x and max_y >= -0.20 and min_y <= -0.05 and max_z >= 0.70 and min_z <= 0.78:
            print(f"FOUND: {obj.name:32} X:[{min_x:+.3f},{max_x:+.3f}] Y:[{min_y:+.3f},{max_y:+.3f}] Z:[{min_z:+.3f},{max_z:+.3f}]")
