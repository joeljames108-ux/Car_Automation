import bpy
import os

def inspect_blend_or_model(filepath):
    print(f"\n=======================================================")
    print(f"INSPECTING: {os.path.basename(filepath)}")
    print(f"=======================================================")
    bpy.ops.wm.read_factory_settings(use_empty=True)
    
    ext = os.path.splitext(filepath)[1].lower()
    if ext == ".blend":
        bpy.ops.wm.open_mainfile(filepath=filepath)
    elif ext == ".fbx":
        bpy.ops.import_scene.fbx(filepath=filepath)
    elif ext in [".glb", ".gltf"]:
        bpy.ops.import_scene.gltf(filepath=filepath)
    elif ext == ".obj":
        try:
            bpy.ops.wm.obj_import(filepath=filepath)
        except Exception:
            bpy.ops.import_scene.obj(filepath=filepath)
            
    mesh_objs = [o for o in bpy.data.objects if o.type == 'MESH']
    total_verts = sum(len(o.data.vertices) for o in mesh_objs)
    total_faces = sum(len(o.data.polygons) for o in mesh_objs)
    print(f"Total Mesh Objects: {len(mesh_objs)}")
    print(f"Total Polygons: {total_faces:,}")
    print(f"Total Vertices: {total_verts:,}")
    
    # Sort top 10 densest objects
    sorted_objs = sorted(mesh_objs, key=lambda o: len(o.data.polygons), reverse=True)
    print("\nTop 10 High-Mesh Components:")
    for o in sorted_objs[:10]:
        print(f"  - {o.name}: {len(o.data.polygons):,} polys, {len(o.data.vertices):,} verts, dimensions: {o.dimensions.x:.2f}x{o.dimensions.y:.2f}x{o.dimensions.z:.2f}m")
        # Check modifiers
        if o.modifiers:
            mod_names = [m.type for m in o.modifiers]
            print(f"    Modifiers: {', '.join(mod_names)}")
            
    # Check materials count
    mats = bpy.data.materials
    print(f"\nTotal Materials: {len(mats)}")
    for m in list(mats)[:8]:
        print(f"  * Material: {m.name}")

if __name__ == "__main__":
    test_files = [
        r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\public\models\extracted\32-mercedes-benz-gls-580-2020\uploads_files_2787791_Mercedes+Benz+GLS+580.blend",
        r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\public\models\extracted\89-challenger\Challenger.blend",
        r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\public\models\extracted\2015-rocket-bunny-s15-nissan-silvia\source\FINAL_MODEL_RB\FINAL_MODEL_02.fbx"
    ]
    for tf in test_files:
        if os.path.exists(tf):
            try:
                inspect_blend_or_model(tf)
            except Exception as e:
                print(f"Error inspecting {tf}: {e}")
