"""
Bugatti Divo Panoramic Glazing & W16 Glass Engine Bay (Blender 4.x / 5.x)
High-Fidelity Track-Focused Hypercar Procedural Architecture
"""

import bpy
import bmesh
import math
from mathutils import Vector
import divo_common as c

def build_divo_glazing(mat_registry):
    """Constructs panoramic hypercar windshield, side canopy glazing, and W16 engine view bay."""
    created_objects = []

    # 1. Panoramic Curved Hypercar Windshield
    ws_mesh = bpy.data.meshes.new("GLASS_Hypercar_Windshield_Mesh")
    ws_obj = bpy.data.objects.new("GLASS_Hypercar_Windshield", ws_mesh)
    
    bm = bmesh.new()
    ws_w = 1.480
    ws_h = 0.920
    ws_y = 0.850
    ws_z = c.COWL_Z + 0.180
    
    # 16x8 Curved Quad Grid
    u_segs = 16
    v_segs = 8
    
    for v in range(v_segs + 1):
        v_fac = v / v_segs
        z_curr = -ws_h/2.0 + v_fac * ws_h
        y_tilt = -0.580 * (v_fac ** 1.2) # Raked back towards driver
        
        for u in range(u_segs + 1):
            u_fac = u / u_segs
            x_curr = -ws_w/2.0 + u_fac * ws_w
            corner_wrap = -0.160 * (1.0 - math.cos(math.pi * (u_fac - 0.5)))
            
            bm.verts.new(Vector((x_curr, ws_y + y_tilt + corner_wrap, ws_z + z_curr)))
            
    bm.verts.ensure_lookup_table()
    for v in range(v_segs):
        for u in range(u_segs):
            v1 = bm.verts[v * (u_segs + 1) + u]
            v2 = bm.verts[v * (u_segs + 1) + u + 1]
            v3 = bm.verts[(v + 1) * (u_segs + 1) + u + 1]
            v4 = bm.verts[(v + 1) * (u_segs + 1) + u]
            bm.faces.new((v1, v2, v3, v4))
            
    bm.to_mesh(ws_mesh)
    bm.free()
    
    c.link_to_collection(ws_obj, "05_Divo_Greenhouse_Glazing")
    ws_obj.data.materials.append(mat_registry.canopy_glass)
    c.apply_finishing(ws_obj, bevel=0.002)
    created_objects.append(ws_obj)

    # 2. Side Door Canopy Glazing (Butterfly Windows)
    for side, sign in [("L", 1.0), ("R", -1.0)]:
        side_glass = c.create_box(
            f"GLASS_Side_Door_Window_{side}",
            location=(sign * 0.760, 0.280, c.BELTLINE_Z + 0.140),
            size=(0.020, 0.920, 0.320),
            col_name="05_Divo_Greenhouse_Glazing",
            mat=mat_registry.canopy_glass
        )
        created_objects.append(side_glass)

    # 3. Transparent W16 Engine Showcase Bay Cover (Borosilicate Glass)
    engine_glass = c.create_box(
        "GLASS_W16_Engine_Cover_Showcase",
        location=(0.0, -0.680, c.ROOF_CROWN_Z - 0.080),
        size=(0.780, 1.150, 0.020),
        col_name="05_Divo_Greenhouse_Glazing",
        mat=mat_registry.engine_bay_glass
    )
    created_objects.append(engine_glass)

    print(f"[DIVO_GLAZING] Created {len(created_objects)} panoramic hypercar glass objects.")
    return created_objects
