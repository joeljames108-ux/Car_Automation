import bpy
import os

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
tex_dir = os.path.join(PROJECT_DIR, "public", "models", "extracted", "2024-byd-atto-3", "textures")

for name in ["Web GL Tyre Texture_02_diffuse.jpeg", "Map_B.jpeg", "uc.jpeg", "UC_tex.jpeg"]:
    p = os.path.join(tex_dir, name)
    img = bpy.data.images.load(p)
    px = list(img.pixels[:20])
    avg_r = sum(img.pixels[0::4]) / (len(img.pixels)/4)
    avg_g = sum(img.pixels[1::4]) / (len(img.pixels)/4)
    avg_b = sum(img.pixels[2::4]) / (len(img.pixels)/4)
    print(f"{name:35s}: avg_rgb=({avg_r:.3f}, {avg_g:.3f}, {avg_b:.3f})")
