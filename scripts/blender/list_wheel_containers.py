import bpy
source = r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\public\models\exterior\sports_car_bmw_i8_raw.glb"
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=source)

for obj in bpy.data.objects:
    n = obj.name.lower()
    if "wheel" in n or (obj.parent and "wheel" in obj.parent.name.lower()):
        if obj.type == 'EMPTY' or len(obj.children) > 0 or '3dwheel' in n:
            print(f"Node: '{obj.name}' (type={obj.type}, parent={obj.parent.name if obj.parent else None}, children={len(obj.children)})")
