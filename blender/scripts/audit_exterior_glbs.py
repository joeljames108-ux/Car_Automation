# pyright: reportMissingImports=false
import bpy
import sys
import os
import json

# Paths to inspect
project_root = r"c:\Users\joelj\Downloads\project-bolt-sb1-a1kjcyhr (3)\project"
models = [
    os.path.join(project_root, "public", "models", "exterior", "modular_gt3_apex.glb"),
    os.path.join(project_root, "public", "models", "exterior", "vehicle_hypercar_apex_gt3.glb"),
    os.path.join(project_root, "public", "models", "exterior", "sports_car_bmw_i8.glb")
]

results = {}

for glb_path in models:
    if not os.path.exists(glb_path):
        results[os.path.basename(glb_path)] = {"error": "File not found"}
        continue
    
    # Reset blender
    bpy.ops.wm.read_factory_settings(use_empty=True)
    
    # Import GLB
    bpy.ops.import_scene.gltf(filepath=glb_path)
    
    objs = bpy.data.objects
    meshes = [o for o in objs if o.type == 'MESH']
    
    total_verts = sum(len(m.data.vertices) for m in meshes)
    total_polys = sum(len(m.data.polygons) for m in meshes)
    
    materials = list(bpy.data.materials)
    
    # Check hierarchy
    root_objs = [o for o in objs if o.parent is None]
    
    mesh_details = []
    for m in meshes[:25]: # sample first 25
        mat_names = [slot.material.name for slot in m.material_slots if slot.material]
        mesh_details.append({
            "name": m.name,
            "parent": m.parent.name if m.parent else None,
            "verts": len(m.data.vertices),
            "polys": len(m.data.polygons),
            "materials": mat_names,
            "location": [round(v, 4) for v in m.location],
            "dimensions": [round(v, 4) for v in m.dimensions]
        })
        
    results[os.path.basename(glb_path)] = {
        "file_size_bytes": os.path.getsize(glb_path),
        "total_objects": len(objs),
        "mesh_objects_count": len(meshes),
        "total_vertices": total_verts,
        "total_polygons": total_polys,
        "total_materials": len(materials),
        "material_names": [mat.name for mat in materials],
        "root_objects": [o.name for o in root_objs],
        "sample_meshes": mesh_details
    }

print("=== AUDIT_RESULTS_START ===")
print(json.dumps(results, indent=2))
print("=== AUDIT_RESULTS_END ===")
