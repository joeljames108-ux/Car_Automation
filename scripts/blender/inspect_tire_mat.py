import bpy
import os

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
glb_path = os.path.join(PROJECT_DIR, "exports", "Car_Sedan_Complete.glb")

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=glb_path)

for o in bpy.data.objects:
    if o.type == 'MESH' and any(k in o.name.lower() for k in ['tyre', 'tire', 'mudflap', 'plastic', 'uc', 'rim']):
        mats = [(m.name, m.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value[:]) for m in o.data.materials if m and m.node_tree]
        print(f"{o.name:<25} -> {mats}")
