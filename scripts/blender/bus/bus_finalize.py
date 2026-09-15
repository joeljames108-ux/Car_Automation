"""
Bus Topology Finalization & Normal Hardening (Blender 4.x / 5.x)
High-Fidelity Heavy-Duty Electric Transit / Coach Bus Architecture
"""

import bpy
import bmesh
import math
import bus_common as c

def finalize_bus_topology():
    """Validates and hardens mesh topology, removes doubles, applies weighted normals, and organizes root empty."""
    print("[BUS_FINALIZE] Applying modifiers and hardening normals...")
    
    # 1. Create Master Root Empty
    root_name = "ROOT_BUS"
    root_obj = bpy.data.objects.get(root_name)
    if not root_obj:
        root_obj = bpy.data.objects.new(root_name, None)
        root_obj.empty_display_type = 'PLAIN_AXES'
        root_obj.empty_display_size = 2.0
        bpy.context.scene.collection.objects.link(root_obj)
        
    mesh_objects = [o for o in bpy.data.objects if o.type == 'MESH']
    
    total_verts = 0
    total_faces = 0
    
    for obj in mesh_objects:
        # Parent to root while preserving world transforms
        if obj.parent != root_obj and obj != root_obj:
            obj.parent = root_obj
            obj.matrix_parent_inverse = root_obj.matrix_world.inverted()
            
        # Clean vertices with bmesh remove_doubles
        try:
            bm = bmesh.new()
            bm.from_mesh(obj.data)
            bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.001)
            bm.to_mesh(obj.data)
            bm.free()
        except Exception:
            pass
            
        # Clear frozen custom split normals if present
        try:
            if hasattr(obj.data, "calc_normals_split"):
                obj.data.calc_normals_split()
        except Exception:
            pass
            
        # Ensure all polygons are smooth shaded
        for poly in obj.data.polygons:
            poly.use_smooth = True
            
        # Ensure WeightedNormal modifier is present
        has_wn = any(m.type == 'WEIGHTED_NORMAL' for m in obj.modifiers)
        if not has_wn:
            wn = obj.modifiers.new(name="WeightedNormal", type='WEIGHTED_NORMAL')
            wn.keep_sharp = True
            
        total_verts += len(obj.data.vertices)
        total_faces += len(obj.data.polygons)
        
    print(f"[BUS_FINALIZE] Completed Bus Topology: {len(mesh_objects)} mesh objects, {total_verts:,} vertices, {total_faces:,} polygons.")
    return root_obj
