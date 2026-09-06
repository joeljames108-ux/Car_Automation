import bpy
import os

glb_path = os.path.abspath("exports/Car_Sedan_Complete.glb")
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=glb_path)

print("\n=== OBJECTS AND MATERIALS IN Car_Sedan_Complete.glb ===")
for obj in bpy.data.objects:
    if "interior" in obj.name.lower():
        print(f"Object: {obj.name}")
        for slot in obj.material_slots:
            if slot.material:
                mat = slot.material
                print(f"  Material: {mat.name}")
                if mat.node_tree:
                    for n in mat.node_tree.nodes:
                        if n.type == 'TEX_IMAGE' and n.image:
                            print(f"    Image node: {n.name}, image={n.image.name}, size={n.image.size[0]}x{n.image.size[1]}, filepath={n.image.filepath}")
                        elif n.type == 'BSDF_PRINCIPLED':
                            col = n.inputs['Base Color'].default_value
                            print(f"    Principled BSDF Base Color: {col[:]}")
