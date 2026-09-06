import bpy
import os

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TEX_DIR = os.path.join(PROJECT_DIR, "public", "models", "extracted", "2024-byd-atto-3", "textures")
SOURCE_FBX = os.path.join(PROJECT_DIR, "public", "models", "extracted", "2024-byd-atto-3", "source", "FINAL_MODEL", "FINAL_MODEL.fbx")

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=SOURCE_FBX)

for o in bpy.data.objects:
    if o.type == 'MESH' and o.name in ['Interior', 'tyre', 'rim', 'Windshield', 'defogger', 'HL_gls', 'TL_inside_gls']:
        uvs = [uv.name for uv in o.data.uv_layers]
        print(f"{o.name:<15}: UVs={uvs}, Mats={[m.name for m in o.data.materials if m]}")
