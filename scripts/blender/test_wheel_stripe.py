import bpy
import bmesh
import math
import os
from mathutils import Vector, Matrix

print("[TEST] Testing advanced wheel with tire compound stripe...")

bpy.ops.wm.read_factory_settings(use_empty=True)
for o in list(bpy.data.objects):
    bpy.data.objects.remove(o, do_unlink=True)

# 1. Torus tire
bpy.ops.mesh.primitive_torus_add(
    major_radius=0.360 - 0.065,
    minor_radius=0.070,
    major_segments=48,
    minor_segments=24,
    location=(0, 0, 0),
    rotation=(0, math.pi/2, 0)
)
tire = bpy.context.active_object
tire.scale = (0.305 * 2.7, 1.0, 1.0)
bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)

# 2. Tire sidewall compound stripe (Torus ring on outer face)
bpy.ops.mesh.primitive_torus_add(
    major_radius=0.315,
    minor_radius=0.008,
    major_segments=48,
    minor_segments=12,
    location=(-0.305 * 0.46, 0, 0),
    rotation=(0, math.pi/2, 0)
)
stripe = bpy.context.active_object
stripe.scale = (0.2, 1.0, 1.0)
bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)

print(f"[TEST] Tire + stripe created: tire={len(tire.data.polygons)}, stripe={len(stripe.data.polygons)}")
print("[TEST] Wheel test passed.")
