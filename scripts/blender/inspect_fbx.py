import bpy
import os

def check_fbx(path):
    print(f"\n==========================================")
    print(f"INSPECTING FBX: {path}")
    print(f"==========================================")
    bpy.ops.wm.read_factory_settings(use_empty=True)
    try:
        bpy.ops.import_scene.fbx(filepath=path)
        matches = []
        for o in bpy.data.objects:
            if o.type == 'MESH':
                nl = o.name.lower()
                matches.append((o.name, len(o.data.polygons)))
        print(f"Total objects: {len(bpy.data.objects)}")
        for name, polys in sorted(matches, key=lambda x: x[1], reverse=True)[:35]:
            print(f"  {name}: {polys} polys")
    except Exception as e:
        print(f"Failed to load: {e}")

check_fbx("public/models/extracted/volvo-p1800-restomod-widebody-edition/car5.fbx")
check_fbx("public/models/extracted/2015-rocket-bunny-s15-nissan-silvia/FINAL_MODEL_02.fbx")
