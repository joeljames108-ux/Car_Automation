import bpy
import os

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
glb_path = os.path.join(PROJECT_DIR, "exports", "Car_Sedan_Complete.glb")

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=glb_path)

for o in bpy.data.objects:
    if o.type == 'MESH':
        mats = [m.name for m in o.data.materials if m]
        has_custom = getattr(o.data, "has_custom_normals", False)
        print(f"OBJECT: {o.name:<30} | MATS: {mats} | CUSTOM_NORMALS: {has_custom}")
