import bpy
import math
from mathutils import Vector

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.mesh.primitive_torus_add(
    major_radius=0.3,
    minor_radius=0.01,
    location=(0, 0, 0),
    rotation=(0, math.pi/2, 0)
)
obj = bpy.context.active_object
# Print bounds in world coordinates
bpy.context.view_layer.update()
bbox = [obj.matrix_world @ Vector(b) for b in obj.bound_box]
min_x = min(b.x for b in bbox)
max_x = max(b.x for b in bbox)
min_y = min(b.y for b in bbox)
max_y = max(b.y for b in bbox)
min_z = min(b.z for b in bbox)
max_z = max(b.z for b in bbox)
print(f"X range: {min_x:.3f} to {max_x:.3f}")
print(f"Y range: {min_y:.3f} to {max_y:.3f}")
print(f"Z range: {min_z:.3f} to {max_z:.3f}")
