import bpy
from mathutils import Vector

# Import Phase 56
import sys, os
gen_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.join(gen_dir, "generators"))
import generate_lincoln_town_car_limo_phase2

generate_lincoln_town_car_limo_phase2.generate_lincoln_town_car_limo_phase2()

print("\n=== SCENE OBJECTS & BOUNDING BOXES ===")
for obj in bpy.data.objects:
    if obj.type == 'MESH':
        bb = [obj.matrix_world @ Vector(corner) for corner in obj.bound_box]
        min_x = min(v.x for v in bb)
        max_x = max(v.x for v in bb)
        min_y = min(v.y for v in bb)
        max_y = max(v.y for v in bb)
        min_z = min(v.z for v in bb)
        max_z = max(v.z for v in bb)
        print(f"Object: {obj.name:45s} | X: [{min_x:+.2f}, {max_x:+.2f}] | Y: [{min_y:+.2f}, {max_y:+.2f}] | Z: [{min_z:+.2f}, {max_z:+.2f}] | Polys: {len(obj.data.polygons)}")
