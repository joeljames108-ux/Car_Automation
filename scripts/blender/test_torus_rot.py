import bpy
import math

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.mesh.primitive_torus_add(
    major_radius=0.3,
    minor_radius=0.01,
    location=(0, 0, 0),
    rotation=(0, math.pi/2, 0)
)
obj = bpy.context.active_object
print(f"obj rotation_euler: {obj.rotation_euler[:]}")
for v in obj.data.vertices[:4]:
    print(f"vertex: {v.co[:]}")
