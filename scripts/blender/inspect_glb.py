import bpy

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=r"public\models\Car_Sedan_Complete.glb")
print("\n=== GLB MESH INSPECTION ===")
for o in bpy.data.objects:
    if o.type == 'MESH':
        bb = [o.matrix_world @ v.co for v in o.data.vertices]
        if bb:
            min_x = min(v.x for v in bb)
            max_x = max(v.x for v in bb)
            min_y = min(v.y for v in bb)
            max_y = max(v.y for v in bb)
            min_z = min(v.z for v in bb)
            max_z = max(v.z for v in bb)
            print(f"{o.name:32} | verts={len(o.data.vertices):5} | polys={len(o.data.polygons):5} | X:[{min_x:5.2f},{max_x:5.2f}] Y:[{min_y:5.2f},{max_y:5.2f}] Z:[{min_z:5.2f},{max_z:5.2f}]")
