import bpy
import os
from mathutils import Vector

chassis_path = os.path.abspath("public/models/chassis/ev_skateboard_chassis_01.glb")
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=chassis_path)

print("\n=== EV SKATEBOARD CHASSIS 01 OBJECTS ===")
for obj in bpy.data.objects:
    if obj.type == 'MESH':
        bb = [obj.matrix_world @ Vector(c) for c in obj.bound_box]
        dx = max(c.x for c in bb) - min(c.x for c in bb)
        dy = max(c.y for c in bb) - min(c.y for c in bb)
        dz = max(c.z for c in bb) - min(c.z for c in bb)
        print(f"OBJ: {obj.name:30s} | Polys: {len(obj.data.polygons):5d} | Dims: {dx:.2f}m x {dy:.2f}m x {dz:.2f}m | Mats: {[m.name for m in obj.data.materials if m]}")
