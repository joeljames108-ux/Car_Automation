import bpy
import os

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
tex_path = os.path.join(PROJECT_DIR, "public", "models", "extracted", "2024-byd-atto-3", "textures", "Interior_01.jpeg")
img = bpy.data.images.load(tex_path)

# Sample some pixels
pixels = list(img.pixels[:400])
print(f"Loaded {tex_path}, size {img.size[0]}x{img.size[1]}")
print(f"Sample pixel values: {pixels[:16]}")
