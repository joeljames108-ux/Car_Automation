import bpy

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath="public/models/extracted/bmw-i8-xs-2015/source/2015-bmw-i8_xs_car.glb")
for o in bpy.data.objects:
    nl = o.name.lower()
    if any(k in nl for k in ["interior", "seat", "steer", "dash", "console"]):
        polys = len(o.data.polygons) if o.type == "MESH" else 0
        dims = [round(v, 3) for v in o.dimensions]
        print(f"{o.name} -> {polys} polys, dims={dims}")
