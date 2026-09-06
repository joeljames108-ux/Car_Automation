import bpy
import os
from mathutils import Vector

volvo_path = r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\public\models\extracted\volvo-p1800-restomod-widebody-edition\source\car5.fbx"

print("==================================================")
print(f"INSPECTING VOLVO P1800 RESTOMOD FBX: {volvo_path}")
print("==================================================")

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=volvo_path)

objects = list(bpy.data.objects)
mesh_objects = [o for o in objects if o.type == 'MESH']
empty_objects = [o for o in objects if o.type == 'EMPTY']
materials = list(bpy.data.materials)

total_verts = sum(len(o.data.vertices) for o in mesh_objects)
total_polys = sum(len(o.data.polygons) for o in mesh_objects)

print(f"Total Objects: {len(objects)}")
print(f"Mesh Objects: {len(mesh_objects)}")
print(f"Empty Objects: {len(empty_objects)}")
print(f"Materials: {len(materials)}")
print(f"TOTAL VERTICES: {total_verts:,}")
print(f"TOTAL POLYGONS (FACES): {total_polys:,}")

# Bounding box
min_c = [float('inf')]*3
max_c = [float('-inf')]*3
for obj in mesh_objects:
    for corner in obj.bound_box:
        pt = obj.matrix_world @ Vector(corner)
        for i in range(3):
            min_c[i] = min(min_c[i], pt[i])
            max_c[i] = max(max_c[i], pt[i])
            
print(f"Bounding Box: Width={max_c[0]-min_c[0]:.3f}m, Length={max_c[1]-min_c[1]:.3f}m, Height={max_c[2]-min_c[2]:.3f}m")
print(f"Lowest point Z={min_c[2]:.3f}m")

print("\n--- Top 40 Mesh Components by Polygon Count ---")
sorted_meshes = sorted(mesh_objects, key=lambda o: len(o.data.polygons), reverse=True)
for o in sorted_meshes[:40]:
    mat_names = [s.material.name if s.material else "None" for s in o.material_slots]
    print(f"  - {o.name:<35} | Polys: {len(o.data.polygons):>7,} | Verts: {len(o.data.vertices):>7,} | Mats: {mat_names[:2]}")

if len(sorted_meshes) > 40:
    print(f"  ... and {len(sorted_meshes)-40} more components.")
