import os
import glob
import json

EXTRACTED_DIR = r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\public\models\extracted"

def scan_extracted():
    results = {}
    for root, dirs, files in os.walk(EXTRACTED_DIR):
        for f in files:
            ext = os.path.splitext(f)[1].lower()
            if ext in [".gltf", ".glb", ".fbx", ".obj", ".blend", ".dae"]:
                full_path = os.path.join(root, f)
                rel_path = os.path.relpath(full_path, EXTRACTED_DIR)
                size_mb = os.path.getsize(full_path) / (1024 * 1024)
                folder = rel_path.split(os.sep)[0]
                if folder not in results:
                    results[folder] = []
                results[folder].append({
                    "rel_path": rel_path,
                    "filename": f,
                    "ext": ext,
                    "size_mb": round(size_mb, 2)
                })
                
    print(f"Discovered 3D models across {len(results)} folders:")
    for folder, models in results.items():
        print(f"\n--- {folder} ---")
        for m in models:
            print(f"  [{m['ext']}] {m['filename']} ({m['size_mb']} MB) -> {m['rel_path']}")
            
    with open(r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\assets\glb\reference_models_survey.json", "w") as fp:
        json.dump(results, fp, indent=2)
    print("\nSaved survey to assets/glb/reference_models_survey.json")

if __name__ == "__main__":
    scan_extracted()
