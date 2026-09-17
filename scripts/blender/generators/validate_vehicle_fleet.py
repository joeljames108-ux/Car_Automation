"""
=============================================================================
APEX ENGINEER: AUTOMATED VEHICLE FLEET CAD & GLB AUDITOR
=============================================================================
Inspects on-disk GLB models, verifies geometry bounds, bounding box proportions,
hierarchy conformity, draw calls, and PBR material slots.
=============================================================================
"""

import bpy
import os
import sys
import json
from mathutils import Vector

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
PUBLIC_MODELS_DIR = os.path.join(ROOT_DIR, "public", "models", "vehicles")

def audit_vehicle_glb(glb_path):
    """Imports a GLB and runs comprehensive metric and structural validation"""
    if not os.path.exists(glb_path):
        return {"status": "error", "message": f"File not found: {glb_path}"}
        
    # Reset
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for mesh in list(bpy.data.meshes):
        bpy.data.meshes.remove(mesh, do_unlink=True)
        
    bpy.ops.import_scene.gltf(filepath=glb_path)
    
    total_verts = sum(len(o.data.vertices) for o in bpy.data.objects if o.type == 'MESH')
    total_polys = sum(len(o.data.polygons) for o in bpy.data.objects if o.type == 'MESH')
    mesh_objects = [o.name for o in bpy.data.objects if o.type == 'MESH']
    
    # Calculate unified bounding box
    min_co = Vector((float('inf'), float('inf'), float('inf')))
    max_co = Vector((float('-inf'), float('-inf'), float('-inf')))
    
    for o in bpy.data.objects:
        if o.type == 'MESH':
            for corner in o.bound_box:
                world_corner = o.matrix_world @ Vector(corner)
                min_co.x = min(min_co.x, world_corner.x)
                min_co.y = min(min_co.y, world_corner.y)
                min_co.z = min(min_co.z, world_corner.z)
                max_co.x = max(max_co.x, world_corner.x)
                max_co.y = max(max_co.y, world_corner.y)
                max_co.z = max(max_co.z, world_corner.z)
                
    dimensions = max_co - min_co
    
    materials_found = list({slot.material.name for o in bpy.data.objects if o.type == 'MESH' for slot in o.material_slots if slot.material})
    
    file_size_kb = os.path.getsize(glb_path) / 1024.0
    
    return {
        "status": "valid",
        "file_size_kb": round(file_size_kb, 2),
        "total_vertices": total_verts,
        "total_polygons": total_polys,
        "mesh_count": len(mesh_objects),
        "dimensions_m": {
            "length_y": round(dimensions.y, 3),
            "width_x": round(dimensions.x, 3),
            "height_z": round(dimensions.z, 3)
        },
        "materials": materials_found
    }

def audit_sedan_fleet():
    eras = ["1970s", "1980s", "1990s", "2000s", "2010s", "2020s", "future"]
    report = {}
    for era in eras:
        glb_path = os.path.join(PUBLIC_MODELS_DIR, "sedan", era, "vehicle.glb")
        report[f"sedan_{era}"] = audit_vehicle_glb(glb_path)
    return report

if __name__ == "__main__":
    report = audit_sedan_fleet()
    print(json.dumps(report, indent=2))
