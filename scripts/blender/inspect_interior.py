import bpy
import os

fbx_path = os.path.abspath("public/models/extracted/2024-byd-atto-3/source/FINAL_MODEL/FINAL_MODEL.fbx")
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=fbx_path)

interior = bpy.data.objects.get("Interior")
if interior:
    print(f"Interior mesh found! Polys: {len(interior.data.polygons)}, Verts: {len(interior.data.vertices)}")
    print(f"UV Layers: {[uv.name for uv in interior.data.uv_layers]}")
    print(f"Materials on Interior: {[m.name if m else 'None' for m in interior.data.materials]}")
    if interior.data.materials:
        mat = interior.data.materials[0]
        print(f"Material {mat.name} nodes:")
        for n in mat.node_tree.nodes:
            print(f"  Node: {n.type} ({n.name})")
            if n.type == 'TEX_IMAGE' and n.image:
                print(f"    Image: {n.image.name}, Filepath: {n.image.filepath}")
