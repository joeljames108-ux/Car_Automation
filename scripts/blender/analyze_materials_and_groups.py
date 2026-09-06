import bpy
import os
from mathutils import Vector

glb_path = r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project\public\models\exterior\sports_car_bmw_i8.glb"
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=glb_path)

materials = list(bpy.data.materials)
print(f"\n==========================================")
print(f"ANALYZING {len(materials)} MATERIALS & CORRESPONDING MESHES")
print(f"==========================================")

mat_to_objects = {}
for mat in materials:
    mat_to_objects[mat.name] = []

for obj in bpy.data.objects:
    if obj.type == 'MESH':
        for slot in obj.material_slots:
            if slot.material and slot.material.name in mat_to_objects:
                mat_to_objects[slot.material.name].append(obj)

for mat in materials:
    objs = mat_to_objects[mat.name]
    # Calculate bounding box for all objects using this material
    min_c = [float('inf')]*3
    max_c = [float('-inf')]*3
    total_verts = 0
    total_faces = 0
    for obj in objs:
        total_verts += len(obj.data.vertices)
        total_faces += len(obj.data.polygons)
        for corner in obj.bound_box:
            world_corner = obj.matrix_world @ Vector(corner)
            for i in range(3):
                min_c[i] = min(min_c[i], world_corner[i])
                max_c[i] = max(max_c[i], world_corner[i])
                
    # Inspect material node properties
    base_color = None
    roughness = None
    metallic = None
    transmission = None
    alpha = None
    
    if mat.use_nodes and mat.node_tree:
        for node in mat.node_tree.nodes:
            if node.type == 'BSDF_PRINCIPLED':
                for inp in node.inputs:
                    if inp.name in ["Base Color"]:
                        base_color = [round(x, 3) for x in inp.default_value[:4]]
                    elif inp.name in ["Roughness"]:
                        roughness = round(inp.default_value, 3)
                    elif inp.name in ["Metallic"]:
                        metallic = round(inp.default_value, 3)
                    elif inp.name in ["Transmission", "Transmission Weight"]:
                        transmission = round(inp.default_value, 3)
                    elif inp.name in ["Alpha"]:
                        alpha = round(inp.default_value, 3)
                        
    bbox_str = f"X:[{min_c[0]:.2f},{max_c[0]:.2f}] Y:[{min_c[1]:.2f},{max_c[1]:.2f}] Z:[{min_c[2]:.2f},{max_c[2]:.2f}]" if objs else "N/A"
    print(f"\nMaterial: '{mat.name}' ({len(objs)} objects, {total_verts} verts, {total_faces} faces)")
    print(f"  Bounds: {bbox_str}")
    print(f"  Props: BaseColor={base_color}, Metallic={metallic}, Rough={roughness}, Trans={transmission}, Alpha={alpha}")
    sample_objs = [o.name for o in objs[:5]]
    print(f"  Sample Objects: {sample_objs}{' ...' if len(objs)>5 else ''}")
