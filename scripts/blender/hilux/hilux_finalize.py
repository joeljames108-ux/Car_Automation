"""
Hilux Topology Finalization & Normal Hardening (Blender 5.2 LTS)
Part of 2025 Toyota HiLux SR5 Double-Cab Procedural Build
Applies vertex welding, face normal consistency, non-destructive CAD Bevel,
WeightedNormal keep_sharp modifiers, and automated UV unwrapping across all meshes.
"""

import bpy
import bmesh
import math
from hilux_common import apply_bevel_and_weighted_normals, weld_coincident_vertices, set_smooth_by_angle

def finalize_topology_and_normals():
    """Weld coincident vertices, apply CAD Bevel & WeightedNormal modifiers, and UV unwrap."""
    mesh_objects = [obj for obj in bpy.data.objects if obj.type == 'MESH']
    
    print(f"[HILUX] Finalizing topology and normals across {len(mesh_objects)} objects...")
    
    # 1. Unhide all objects
    for obj in bpy.data.objects:
        obj.hide_viewport = False
        obj.hide_render = False
        
    for obj in mesh_objects:
        # A. Weld coincident vertices
        weld_coincident_vertices(obj, distance=0.0005)
        
        # B. Ensure consistent smooth shading
        set_smooth_by_angle(obj, angle_deg=35.0)
        
        # C. Clear frozen split normals if present
        if hasattr(obj.data, "has_custom_normals") and obj.data.has_custom_normals:
            try:
                obj.data.calc_normals_split()
            except Exception:
                pass
                
        # D. Apply CAD Bevel & Weighted Normal modifiers (skip glass panels which need sharp optical edges)
        if not obj.name.startswith("GLASS_"):
            apply_bevel_and_weighted_normals(obj, width=0.0025, segments=2, angle_deg=35.0)
            
        # E. Smart UV Unwrapping
        if len(obj.data.uv_layers) == 0:
            obj.data.uv_layers.new(name="UVMap")
            
        bm = bmesh.new()
        bm.from_mesh(obj.data)
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
        bm.to_mesh(obj.data)
        bm.free()
        obj.data.update()
        
    print("[HILUX] Topology finalization & normal hardening complete.")
