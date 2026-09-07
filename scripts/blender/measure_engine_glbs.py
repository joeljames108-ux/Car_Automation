import bpy
import os
from mathutils import Vector

v12_dir = os.path.abspath("public/models/engines/v12")
files = [f for f in os.listdir(v12_dir) if f.endswith(".glb")]

for fname in sorted(files):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    fpath = os.path.join(v12_dir, fname)
    bpy.ops.import_scene.gltf(filepath=fpath)
    
    all_verts = []
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            matrix = obj.matrix_world
            for v in obj.data.vertices:
                all_verts.append(matrix @ v.co)
                
    if all_verts:
        min_x = min(v.x for v in all_verts)
        max_x = max(v.x for v in all_verts)
        min_y = min(v.y for v in all_verts)
        max_y = max(v.y for v in all_verts)
        min_z = min(v.z for v in all_verts)
        max_z = max(v.z for v in all_verts)
        size_x = max_x - min_x
        size_y = max_y - min_y
        size_z = max_z - min_z
        center = Vector(((min_x + max_x)/2, (min_y + max_y)/2, (min_z + max_z)/2))
        print(f"[{fname}] Size: X={size_x:.3f}m, Y={size_y:.3f}m, Z={size_z:.3f}m | Min: ({min_x:.3f}, {min_y:.3f}, {min_z:.3f}) | Max: ({max_x:.3f}, {max_y:.3f}, {max_z:.3f}) | Center: {center}")
