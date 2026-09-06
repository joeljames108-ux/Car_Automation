import bpy
import os

PROJECT_DIR = r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project"

ASSET_PATHS = {
    "sedan_crossover": os.path.join(PROJECT_DIR, "public", "models", "extracted", "2024-byd-atto-3", "source", "FINAL_MODEL", "FINAL_MODEL.fbx"),
    "suv": os.path.join(PROJECT_DIR, "public", "models", "extracted", "32-mercedes-benz-gls-580-2020", "uploads_files_2787791_Mercedes+Benz+GLS+580.fbx"),
    "hatchback": os.path.join(PROJECT_DIR, "public", "models", "extracted", "ford-escort-rs-cosworth-cossie", "source", "Body_lodA", "Body_lodA", "fordEscortRSCosworth.glb"),
    "gt3_bmw": os.path.join(PROJECT_DIR, "public", "models", "extracted", "bmw-i8-xs-2015", "source", "2015-bmw-i8_xs_car.glb"),
    "gt3_silvia": os.path.join(PROJECT_DIR, "public", "models", "extracted", "2015-rocket-bunny-s15-nissan-silvia", "source", "FINAL_MODEL_RB", "FINAL_MODEL_02.fbx")
}

for name, path in ASSET_PATHS.items():
    exists = os.path.exists(path)
    size_mb = os.path.getsize(path) / (1024*1024) if exists else 0
    print(f"[{name}] Exists: {exists}, Size: {size_mb:.2f} MB, Path: {path}")
