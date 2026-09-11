"""
Hilux Greenhouse Glazing Assembly (Blender 5.2 LTS)
Part of 2025 Toyota HiLux SR5 Double-Cab Procedural Build
Constructs the curved optical windshield with black ceramic frit band,
front door clear glass, rear door privacy tint glass, and rear cabin window with defroster grid.
"""

import bpy
import bmesh
import math
from mathutils import Vector, Matrix
from hilux_common import (
    create_bmesh_object,
    assign_material,
    apply_bevel_and_weighted_normals,
    create_box,
    bmesh_create_cube,
    mat_trans,
    mat_rot_x,
    mat_rot_y,
    mat_rot_z,
    mat_scale
)

def build_greenhouse_glazing(materials):
    mat_clear = materials.get("Mat_OpticalGlass_Clear")
    mat_privacy = materials.get("Mat_OpticalGlass_Privacy")
    mat_frit = materials.get("Mat_SatinBlack_Trim")
    mat_defrost = materials.get("Mat_Hardware_ZincBolt")
    
    col_name = "07_Greenhouse_Glazing"
    objects = []
    
    # -------------------------------------------------------------
    # 1. Curved Laminated Windshield with Ceramic Frit Perimeter
    # Sweeps from cowl (Y=0.90m, Z=1.10m) to header (Y=0.32m, Z=1.76m)
    # -------------------------------------------------------------
    bm_ws = bmesh.new()
    
    # Grid of 4 longitudinal rows x 7 lateral columns
    ws_y_z = [
        (0.90, 1.10),
        (0.72, 1.34),
        (0.52, 1.56),
        (0.32, 1.76),
    ]
    ws_x_ratios = [-0.68, -0.45, -0.22, 0.0, 0.22, 0.45, 0.68]
    
    grid = []
    for y_pos, z_pos in ws_y_z:
        row = []
        for xr in ws_x_ratios:
            # Taper inward slightly toward roof header
            t_h = (z_pos - 1.10) / (1.76 - 1.10)
            cur_x = xr * (1.0 - 0.12 * t_h)
            # Aerodynamic aerodynamic crown bulge (forward curvature in center)
            crown_y = 0.045 * (1.0 - (xr / 0.68)**2)
            row.append(bm_ws.verts.new((cur_x, y_pos + crown_y, z_pos)))
        grid.append(row)
        
    for r in range(len(ws_y_z) - 1):
        for c in range(len(ws_x_ratios) - 1):
            v1 = grid[r][c]
            v2 = grid[r][c+1]
            v3 = grid[r+1][c+1]
            v4 = grid[r+1][c]
            bm_ws.faces.new((v1, v2, v3, v4))
            
    bmesh.ops.recalc_face_normals(bm_ws, faces=bm_ws.faces)
    
    obj_ws = create_bmesh_object("GLASS_Windshield_Clear", col_name, bm_ws)
    assign_material(obj_ws, mat_clear)
    objects.append(obj_ws)
    
    # Ceramic Frit Perimeter Border Band (ADAS camera cutout at top center)
    bm_frit = bmesh.new()
    # Top frit border
    bmesh_create_cube(
        bm_frit,
        size=0.015,
        matrix=mat_trans(0.0, 0.34, 1.75) @ mat_rot_x(-35) @ mat_scale(76.0, 4.0, 0.4)
    )
    # ADAS Forward Sensing Camera Housing Trapezoid
    bmesh_create_cube(
        bm_frit,
        size=0.02,
        matrix=mat_trans(0.0, 0.38, 1.68) @ mat_rot_x(-35) @ mat_scale(8.0, 6.0, 0.8)
    )
    # Bottom cowl frit border
    bmesh_create_cube(
        bm_frit,
        size=0.015,
        matrix=mat_trans(0.0, 0.90, 1.12) @ mat_rot_x(-35) @ mat_scale(85.0, 4.0, 0.4)
    )
    obj_frit = create_bmesh_object("GLASS_Windshield_FritBand", col_name, bm_frit)
    assign_material(obj_frit, mat_frit)
    objects.append(obj_frit)

    # -------------------------------------------------------------
    # 2. Front Door Windows (Clear Optical Glass, Left & Right)
    # Form-fitted inside front door sash conforming to A-pillar slope
    # -------------------------------------------------------------
    for mult, sfx in [(1.0, "_L"), (-1.0, "_R")]:
        bm_fd_glass = bmesh.new()
        x_out = 0.715 * mult
        x_in  = 0.709 * mult
        
        # 4 vertices on outer face
        v0 = bm_fd_glass.verts.new((x_out,  0.82, 1.01))
        v1 = bm_fd_glass.verts.new((x_out,  0.31, 1.71))
        v2 = bm_fd_glass.verts.new((x_out, -0.34, 1.71))
        v3 = bm_fd_glass.verts.new((x_out, -0.34, 1.01))
        
        # 4 vertices on inner face
        v4 = bm_fd_glass.verts.new((x_in,  0.82, 1.01))
        v5 = bm_fd_glass.verts.new((x_in,  0.31, 1.71))
        v6 = bm_fd_glass.verts.new((x_in, -0.34, 1.71))
        v7 = bm_fd_glass.verts.new((x_in, -0.34, 1.01))
        
        if mult > 0:
            bm_fd_glass.faces.new((v0, v1, v2, v3)) # Outer
            bm_fd_glass.faces.new((v7, v6, v5, v4)) # Inner
            bm_fd_glass.faces.new((v0, v4, v5, v1)) # Front A-pillar edge
            bm_fd_glass.faces.new((v1, v5, v6, v2)) # Top roof edge
            bm_fd_glass.faces.new((v2, v6, v7, v3)) # Rear B-pillar edge
            bm_fd_glass.faces.new((v3, v7, v4, v0)) # Bottom beltline edge
        else:
            bm_fd_glass.faces.new((v3, v2, v1, v0))
            bm_fd_glass.faces.new((v4, v5, v6, v7))
            bm_fd_glass.faces.new((v1, v5, v4, v0))
            bm_fd_glass.faces.new((v2, v6, v5, v1))
            bm_fd_glass.faces.new((v3, v7, v6, v2))
            bm_fd_glass.faces.new((v0, v4, v7, v3))
            
        bmesh.ops.recalc_face_normals(bm_fd_glass, faces=bm_fd_glass.faces)
        obj_fd_glass = create_bmesh_object(f"GLASS_FrontDoor{sfx}", col_name, bm_fd_glass)
        assign_material(obj_fd_glass, mat_clear)
        objects.append(obj_fd_glass)

    # -------------------------------------------------------------
    # 3. Rear Door Windows (Deep Privacy Tint Glass, Left & Right)
    # Form-fitted inside rear door sash
    # -------------------------------------------------------------
    for mult, sfx in [(1.0, "_L"), (-1.0, "_R")]:
        bm_rd_glass = bmesh.new()
        x_out = 0.715 * mult
        x_in  = 0.709 * mult
        
        v0 = bm_rd_glass.verts.new((x_out, -0.50, 1.01))
        v1 = bm_rd_glass.verts.new((x_out, -0.50, 1.71))
        v2 = bm_rd_glass.verts.new((x_out, -1.13, 1.71))
        v3 = bm_rd_glass.verts.new((x_out, -1.13, 1.01))
        
        v4 = bm_rd_glass.verts.new((x_in, -0.50, 1.01))
        v5 = bm_rd_glass.verts.new((x_in, -0.50, 1.71))
        v6 = bm_rd_glass.verts.new((x_in, -1.13, 1.71))
        v7 = bm_rd_glass.verts.new((x_in, -1.13, 1.01))
        
        if mult > 0:
            bm_rd_glass.faces.new((v0, v1, v2, v3))
            bm_rd_glass.faces.new((v7, v6, v5, v4))
            bm_rd_glass.faces.new((v0, v4, v5, v1))
            bm_rd_glass.faces.new((v1, v5, v6, v2))
            bm_rd_glass.faces.new((v2, v6, v7, v3))
            bm_rd_glass.faces.new((v3, v7, v4, v0))
        else:
            bm_rd_glass.faces.new((v3, v2, v1, v0))
            bm_rd_glass.faces.new((v4, v5, v6, v7))
            bm_rd_glass.faces.new((v1, v5, v4, v0))
            bm_rd_glass.faces.new((v2, v6, v5, v1))
            bm_rd_glass.faces.new((v3, v7, v6, v2))
            bm_rd_glass.faces.new((v0, v4, v7, v3))
            
        bmesh.ops.recalc_face_normals(bm_rd_glass, faces=bm_rd_glass.faces)
        obj_rd_glass = create_bmesh_object(f"GLASS_RearDoor{sfx}", col_name, bm_rd_glass)
        assign_material(obj_rd_glass, mat_privacy)
        objects.append(obj_rd_glass)

    # -------------------------------------------------------------
    # 4. Rear Cabin Backlight Window with Electric Defroster Grid
    # Y = -1.21m, Z = 1.25m to 1.72m, X = -0.56m to +0.56m
    # -------------------------------------------------------------
    bm_rear_glass = bmesh.new()
    bmesh_create_cube(
        bm_rear_glass,
        size=0.006,
        matrix=mat_trans(0.0, -1.21, 1.48) @ mat_scale(175.0, 1.0, 75.0)
    )
    obj_rear_glass = create_bmesh_object("GLASS_RearCabin_Privacy", col_name, bm_rear_glass)
    assign_material(obj_rear_glass, mat_privacy)
    objects.append(obj_rear_glass)
    
    # Electric Defroster Grid Lines (Horizontal heated copper/silver wire traces)
    bm_defrost = bmesh.new()
    for line_z in [1.32, 1.38, 1.44, 1.50, 1.56, 1.62]:
        bmesh_create_cube(
            bm_defrost,
            size=0.002,
            matrix=mat_trans(0.0, -1.212, line_z) @ mat_scale(480.0, 0.4, 0.4)
        )
    obj_defrost = create_bmesh_object("GLASS_RearDefrosterGrid", col_name, bm_defrost)
    assign_material(obj_defrost, mat_defrost)
    objects.append(obj_defrost)

    print(f"[HILUX] Greenhouse Glazing generated with {len(objects)} objects.")
    return objects
