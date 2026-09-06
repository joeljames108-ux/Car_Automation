import bpy
import math
from mathutils import Vector

bpy.ops.wm.read_factory_settings(use_empty=True)

tire_r = 0.360
tire_w = 0.305
wx, wy, wz = 0.0, 0.0, 0.360
w_sign = -1

# Tire
bpy.ops.mesh.primitive_torus_add(
    major_radius=tire_r - 0.065,
    minor_radius=0.070,
    major_segments=48,
    minor_segments=24,
    location=(wx, wy, wz),
    rotation=(0, math.pi/2, 0)
)
obj_tire = bpy.context.active_object
obj_tire.scale = (1.0, 1.0, tire_w / 0.140)
bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)

# Stripe
stripe_out_x = wx + w_sign * (tire_w * 0.49)
bpy.ops.mesh.primitive_torus_add(
    major_radius=tire_r * 0.82,
    minor_radius=0.007,
    major_segments=48,
    minor_segments=10,
    location=(stripe_out_x, wy, wz),
    rotation=(0, math.pi/2, 0)
)
stripe_obj = bpy.context.active_object
stripe_obj.scale = (1.0, 1.0, 0.35)
bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)

bpy.context.view_layer.update()

def get_dims(o):
    bb = [o.matrix_world @ Vector(b) for b in o.bound_box]
    dx = max(b.x for b in bb) - min(b.x for b in bb)
    dy = max(b.y for b in bb) - min(b.y for b in bb)
    dz = max(b.z for b in bb) - min(b.z for b in bb)
    return dx, dy, dz

t_dx, t_dy, t_dz = get_dims(obj_tire)
s_dx, s_dy, s_dz = get_dims(stripe_obj)

print(f"Tire dimensions: dX={t_dx:.3f}, dY={t_dy:.3f}, dZ={t_dz:.3f}")
print(f"Stripe dimensions: dX={s_dx:.3f}, dY={s_dy:.3f}, dZ={s_dz:.3f}")
