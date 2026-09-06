import bpy
import os

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
tex_dir = os.path.join(PROJECT_DIR, "public", "models", "extracted", "2024-byd-atto-3", "textures")

for fname in ["Interior.jpeg", "Interior_01.jpeg", "Map_A_ao.jpeg", "Map_B.jpeg", "Map_C1.jpeg"]:
    p = os.path.join(tex_dir, fname)
    if os.path.exists(p):
        img = bpy.data.images.load(p)
        print(f"{fname:20s}: {img.size[0]}x{img.size[1]}, channels={img.channels}")
