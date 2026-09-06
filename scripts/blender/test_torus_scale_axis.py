import bpy
import math
from mathutils import Vector

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.mesh.primitive_torus_add(
    major_radius=0.30,
    minor_radius=0.07,
    location=(0, 0, 0),
    rotation=(0, math.pi/2, 0)
)
obj = bpy.context.active_object
# To make it wider along World X, scale local Z!
obj.scale = (1.0, 1.0, 0.305 * 2.7)
bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)

bpy.context.view_layer.update()
bbox = [obj.matrix_world @ Vector(b) for b in obj.bound_box]
dx = max(b.x for b in bbox) - min(b.x for b in bbox)
dy = max(b.y for b in bbox) - min(b.y for b in bbox)
dz = max(b.z for b in bbox) - min(b.z for b in bbox)
print(f"Dimensions: dX (width)={dx:.3f}, dY (diameter)={dy:.3f}, dZ (diameter)={dz:.3f}")
