import bpy
import os
from mathutils import Vector

source = r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\public\models\exterior\sports_car_bmw_i8_raw.glb"
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=source)

wheel_objs = [o for o in bpy.data.objects if "wheel" in o.name.lower()]
print(f"Total wheel objects: {len(wheel_objs)}")

wheel_centers = []
for o in wheel_objs:
    corners = [o.matrix_world @ Vector(c) for c in o.bound_box]
    c = sum(corners, Vector((0,0,0))) / 8.0
    wheel_centers.append(c)

xs = [c.x for c in wheel_centers]
ys = [c.y for c in wheel_centers]
zs = [c.z for c in wheel_centers]

print(f"Wheel centers bounds:")
print(f"  X range: [{min(xs):.3f}, {max(xs):.3f}]")
print(f"  Y range: [{min(ys):.3f}, {max(ys):.3f}]")
print(f"  Z range: [{min(zs):.3f}, {max(zs):.3f}]")

# Let's cluster centers by k-means or threshold
# Look at unique rounded clusters (e.g. to 1 decimal place)
clusters = set()
for c in wheel_centers:
    clusters.add((round(c.x, 1), round(c.y, 1), round(c.z, 1)))
print("Approximate wheel cluster positions:")
for cl in sorted(list(clusters)):
    print(f"  Cluster: {cl}")
