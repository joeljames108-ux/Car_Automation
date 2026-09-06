import bpy
import os
from mathutils import Vector

for fname in ["suspension_front.glb", "suspension_rear.glb", "steering_system.glb"]:
    p = os.path.abspath(os.path.join("public/models/exterior", fname))
    if os.path.exists(p):
        bpy.ops.wm.read_factory_settings(use_empty=True)
        bpy.ops.import_scene.gltf(filepath=p)
        print(f"\n=== {fname} ===")
        for obj in bpy.data.objects:
            if obj.type == 'MESH':
                bb = [obj.matrix_world @ Vector(c) for c in obj.bound_box]
                dx = max(c.x for c in bb) - min(c.x for c in bb)
                dy = max(c.y for c in bb) - min(c.y for c in bb)
                dz = max(c.z for c in bb) - min(c.z for c in bb)
                print(f"  OBJ: {obj.name:30s} | Polys: {len(obj.data.polygons):5d} | Dims: {dx:.2f}x{dy:.2f}x{dz:.2f}m | Mats: {[m.name for m in obj.data.materials if m]}")
