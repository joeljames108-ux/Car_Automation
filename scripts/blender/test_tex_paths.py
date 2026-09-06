import bpy
import os

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TEX_DIR = os.path.join(PROJECT_DIR, "public", "models", "extracted", "2024-byd-atto-3", "textures")

textures = [
    "Web GL Tyre Texture_02_diffuse.jpeg",
    "Web GL Tyre Texture_02_normal.jpeg",
    "Interior.jpeg",
    "Interior_01.jpeg",
    "Rim.jpeg",
    "caliper.jpeg",
    "HL1.jpeg",
    "HL_alpha.jpeg",
    "TL.jpeg",
    "TL_alpha.jpeg",
    "defogger_2.jpeg",
    "uc.jpeg",
    "UC_tex.jpeg"
]

for t in textures:
    p = os.path.join(TEX_DIR, t)
    print(f"{t:<35}: exists={os.path.exists(p)} ({os.path.getsize(p):,} bytes)")
