import bpy
import mathutils

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath="public/models/interior/dashboard_interactive_master.glb")

print("=== CLUSTER / DASHBOARD / SCREEN OBJECTS ===")
for obj in bpy.data.objects:
    if obj.type == 'MESH':
        name = obj.name.upper()
        if any(k in name for k in ["CLUSTER", "DASH", "SCREEN", "GAUGE", "DIAL", "SPEEDO", "TACHO", "HOOD", "COWL", "DISP"]):
            bbox = [obj.matrix_world @ mathutils.Vector(corner) for corner in obj.bound_box]
            min_x = min(p.x for p in bbox)
            max_x = max(p.x for p in bbox)
            min_y = min(p.y for p in bbox)
            max_y = max(p.y for p in bbox)
            min_z = min(p.z for p in bbox)
            max_z = max(p.z for p in bbox)
            print(f"{obj.name:32} X:[{min_x:+.3f},{max_x:+.3f}] Y:[{min_y:+.3f},{max_y:+.3f}] Z:[{min_z:+.3f},{max_z:+.3f}]")
