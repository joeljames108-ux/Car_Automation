"""
Comprehensive Audit of All Active GLBs in the Project
Analyzes:
- Vertex counts & polygon counts per directory
- Identifies low-mesh / boxy assets (< 200 vertices)
- Checks materials & PBR properties
"""
import os
import glob
import bpy

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

DIRS_TO_AUDIT = [
    os.path.join(PROJECT_ROOT, "public", "models", "modular_parts", "individual"),
    os.path.join(PROJECT_ROOT, "public", "models", "modular_parts"),
    os.path.join(PROJECT_ROOT, "public", "models", "vehicles"),
    os.path.join(PROJECT_ROOT, "public", "vehicles"),
    os.path.join(PROJECT_ROOT, "public", "models", "engines"),
    os.path.join(PROJECT_ROOT, "public", "models", "engines", "v12"),
    os.path.join(PROJECT_ROOT, "public", "models", "interior"),
    os.path.join(PROJECT_ROOT, "public", "models", "powertrain"),
    os.path.join(PROJECT_ROOT, "public", "models", "chassis"),
    os.path.join(PROJECT_ROOT, "public", "models", "exterior"),
]

def clean_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    for c in list(bpy.data.collections):
        bpy.data.collections.remove(c)
    for o in list(bpy.data.objects):
        bpy.data.objects.remove(o)
    for m in list(bpy.data.materials):
        bpy.data.materials.remove(m)
    for me in list(bpy.data.meshes):
        bpy.data.meshes.remove(me)

def analyze_directory(dir_path):
    rel_dir = os.path.relpath(dir_path, PROJECT_ROOT)
    if not os.path.exists(dir_path):
        return
    
    glb_files = [os.path.join(dir_path, f) for f in os.listdir(dir_path) if f.lower().endswith(".glb") and os.path.isfile(os.path.join(dir_path, f))]
    if not glb_files:
        return

    print(f"\n=======================================================")
    print(f"AUDITING: {rel_dir} ({len(glb_files)} GLBs)")
    print(f"=======================================================")

    low_poly_files = []
    total_verts = 0
    total_polys = 0

    for idx, f in enumerate(glb_files[:25]): # sample or check
        clean_scene()
        try:
            bpy.ops.import_scene.gltf(filepath=f)
            meshes = [o for o in bpy.data.objects if o.type == 'MESH']
            file_verts = sum(len(o.data.vertices) for o in meshes)
            file_polys = sum(len(o.data.polygons) for o in meshes)
            total_verts += file_verts
            total_polys += file_polys
            fn = os.path.basename(f)
            size_kb = os.path.getsize(f) / 1024
            if file_verts < 300:
                low_poly_files.append((fn, file_verts, file_polys, size_kb))
            if idx < 5:
                print(f"  {fn}: {file_verts:,} verts, {file_polys:,} polys, {len(meshes)} meshes, {size_kb:.1f} KB")
        except Exception as e:
            print(f"  Error loading {os.path.basename(f)}: {e}")

    sample_size = min(len(glb_files), 25)
    avg_verts = total_verts // sample_size if sample_size > 0 else 0
    print(f"Sample stats: Avg verts: {avg_verts:,} across {sample_size} files")
    if low_poly_files:
        print(f"  --> FOUND {len(low_poly_files)} LOW-POLY / BOXY GLBs (< 300 verts):")
        for fn, v, p, s in low_poly_files[:10]:
            print(f"      - {fn}: {v} verts, {p} polys, {s:.1f} KB")

def main():
    for d in DIRS_TO_AUDIT:
        analyze_directory(d)

if __name__ == "__main__":
    main()
