import bpy
import os

def check_file(path, is_glb=False, is_fbx=False):
    print(f"\n==========================================")
    print(f"INSPECTING: {path}")
    print(f"==========================================")
    bpy.ops.wm.read_factory_settings(use_empty=True)
    try:
        if is_glb:
            bpy.ops.import_scene.gltf(filepath=path)
        elif is_fbx:
            bpy.ops.import_scene.fbx(filepath=path)
        else:
            bpy.ops.wm.open_mainfile(filepath=path)
        
        matches = []
        for o in bpy.data.objects:
            if o.type == 'MESH':
                nl = o.name.lower()
                if any(k in nl for k in ['int', 'seat', 'steer', 'dash', 'pedal', 'console', 'door', 'speedo', 'gauge', 'mirror', 'carpet', 'gear', 'shifter', 'panel', 'cushion', 'wheel']):
                    matches.append((o.name, len(o.data.polygons)))
        print(f"Found {len(matches)} matching interior meshes (total objects: {len(bpy.data.objects)}):")
        for name, polys in sorted(matches, key=lambda x: x[1], reverse=True)[:30]:
            print(f"  {name}: {polys} polys")
    except Exception as e:
        print(f"Failed to load: {e}")

check_file("public/models/extracted/89-challenger/Challenger.blend")
check_file("public/models/extracted/bmw-i8-xs-2015/source/2015-bmw-i8_xs_car.glb", is_glb=True)
check_file("public/models/extracted/ford-escort-rs-cosworth-cossie/fordEscortRSCosworth.glb", is_glb=True)
