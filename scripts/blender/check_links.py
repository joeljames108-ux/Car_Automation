import bpy
import os

glb_path = os.path.abspath("exports/Car_Sedan_Complete.glb")
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=glb_path)

interior = bpy.data.objects.get("Interior")
if interior and interior.data.materials:
    mat = interior.data.materials[0]
    print(f"MATERIAL: {mat.name}")
    print("LINKS:")
    for l in mat.node_tree.links:
        print(f"  {l.from_node.name} [{l.from_socket.name}] -> {l.to_node.name} [{l.to_socket.name}]")
