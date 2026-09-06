import bpy
import os
from mathutils import Vector

source = r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\public\models\exterior\sports_car_bmw_i8_raw.glb"
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=source)

wheel_objs = [o for o in bpy.data.objects if "wheel" in o.name.lower()]
sample = wheel_objs[0]
print(f"Sample wheel object: {sample.name}")
print(f"  Parent: {sample.parent.name if sample.parent else 'None'}")
print(f"  Location: {sample.location}")
print(f"  Scale: {sample.scale}")
print(f"  Matrix World translation: {sample.matrix_world.translation}")
if sample.parent:
    p = sample.parent
    print(f"Parent {p.name}:")
    print(f"  Parent location: {p.location}")
    print(f"  Parent scale: {p.scale}")
    print(f"  Parent matrix world translation: {p.matrix_world.translation}")
    if p.parent:
        gp = p.parent
        print(f"Grandparent {gp.name}:")
        print(f"  location: {gp.location}")
        print(f"  scale: {gp.scale}")
        print(f"  matrix world translation: {gp.matrix_world.translation}")
