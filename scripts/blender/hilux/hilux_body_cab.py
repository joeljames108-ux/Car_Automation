"""
Hilux Cab Body Shell Assembly (Blender 5.2 LTS)
Part of 2025 Toyota HiLux SR5 Double-Cab Procedural Build
Constructs the hood with power bulges, front fenders, cab structure (A/B/C-pillars, roof with ribs),
4 doors with shoulder creases, rocker sills, and geometric fender flares.
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
    mat_scale,
    WHEELBASE,
    FRONT_AXLE_Y,
    REAR_AXLE_Y,
    HOOD_REAR_Y,
    HOOD_FRONT_Y,
    CAB_REAR_Y
)

def build_cab_body(materials):
    mat_bronze = materials.get("Mat_Hilux_OxideBronze")
    mat_trim = materials.get("Mat_DarkComposite_Trim")
    mat_satin = materials.get("Mat_SatinBlack_Trim")
    
    col_name = "02_Cab_Body"
    objects = []
    
    # -------------------------------------------------------------
    # 1. Hood with Twin Power Bulges & Stamped Character Lines
    # -------------------------------------------------------------
    bm_hood = bmesh.new()
    
    # Hood grid coordinates: 6 longitudinal stations x 7 lateral slices
    # Y goes from cowl (+0.95m) to grille header (+2.38m)
    # Z crowns upwards and slopes slightly forward: from 1.10m at cowl down to 1.03m at nose
    y_stations = [0.95, 1.24, 1.52, 1.80, 2.10, 2.38]
    # Lateral fractions from center (X=0) to fender cutline (X=±0.78m)
    x_fractions = [-0.78, -0.52, -0.26, 0.0, 0.26, 0.52, 0.78]
    
    grid_verts = []
    for y in y_stations:
        row = []
        t = (y - 0.95) / (2.38 - 0.95)
        base_z = 1.10 - 0.07 * t
        
        for x in x_fractions:
            # Crown curvature across width (center is slightly higher)
            x_norm = x / 0.78
            crown = 0.035 * (1.0 - x_norm**2)
            
            # Twin power bulge ridges at |X| around 0.26m to 0.40m
            bulge = 0.0
            abs_x = abs(x)
            if 0.18 <= abs_x <= 0.45:
                # Smooth bulge envelope
                bulge = 0.022 * math.sin(math.pi * (abs_x - 0.18) / 0.27) * (1.0 - 0.3 * t)
                
            vz = base_z + crown + bulge
            row.append(bm_hood.verts.new((x, y, vz)))
        grid_verts.append(row)
        
    # Build quad faces across hood grid
    for r in range(len(y_stations) - 1):
        for c in range(len(x_fractions) - 1):
            v1 = grid_verts[r][c]
            v2 = grid_verts[r][c+1]
            v3 = grid_verts[r+1][c+1]
            v4 = grid_verts[r+1][c]
            bm_hood.faces.new((v1, v2, v3, v4))
            
    # Extrude perimeter downward to give thickness & hemmed hood flange
    bmesh.ops.recalc_face_normals(bm_hood, faces=bm_hood.faces)
    
    obj_hood = create_bmesh_object("BODY_Hood", col_name, bm_hood)
    assign_material(obj_hood, mat_bronze)
    apply_bevel_and_weighted_normals(obj_hood, width=0.003, segments=2)
    objects.append(obj_hood)
    
    # -------------------------------------------------------------
    # 2. Front Fenders (Left & Right) with Wheel Arches
    # -------------------------------------------------------------
    # Extends from front bumper interface (Y=2.25) back to front door seam (Y=0.92)
    for side, mult, sfx in [("Left", 1.0, "_L"), ("Right", -1.0, "_R")]:
        bm_fender = bmesh.new()
        
        # Profile nodes along fender upper contour and wheel cutout
        # Axle center is at Y = +1.5425m, Wheel cutout radius ~ 0.48m
        fender_points = [
            # Upper contour along hood cutline
            (0.78 * mult, 2.22, 1.04),
            (0.80 * mult, 1.90, 1.06),
            (0.82 * mult, 1.54, 1.08),
            (0.81 * mult, 1.20, 1.09),
            (0.80 * mult, 0.92, 1.10),
            # Outer blister character line (widest point)
            (0.88 * mult, 0.92, 0.88),
            (0.89 * mult, 1.20, 0.88),
            (0.90 * mult, 1.54, 0.90),
            (0.89 * mult, 1.90, 0.86),
            (0.86 * mult, 2.22, 0.84),
            # Wheel arch opening contour
            (0.86 * mult, 2.05, 0.46),
            (0.89 * mult, 1.88, 0.72),
            (0.90 * mult, 1.54, 0.82),
            (0.89 * mult, 1.20, 0.72),
            (0.86 * mult, 1.02, 0.46),
        ]
        
        verts = [bm_fender.verts.new(p) for p in fender_points]
        
        # Upper fender skin faces
        bm_fender.faces.new((verts[0], verts[1], verts[8], verts[9]))
        bm_fender.faces.new((verts[1], verts[2], verts[7], verts[8]))
        bm_fender.faces.new((verts[2], verts[3], verts[6], verts[7]))
        bm_fender.faces.new((verts[3], verts[4], verts[5], verts[6]))
        
        # Lower fender / arch return faces
        bm_fender.faces.new((verts[9], verts[8], verts[11], verts[10]))
        bm_fender.faces.new((verts[8], verts[7], verts[12], verts[11]))
        bm_fender.faces.new((verts[7], verts[6], verts[13], verts[12]))
        bm_fender.faces.new((verts[6], verts[5], verts[14], verts[13]))
        
        # Front headlight bucket transition
        v_head_lower = bm_fender.verts.new((0.74 * mult, 2.25, 0.72))
        bm_fender.faces.new((verts[0], verts[9], verts[10], v_head_lower))
        
        # Rear fender / A-pillar transition
        v_rocker_front = bm_fender.verts.new((0.82 * mult, 0.92, 0.46))
        bm_fender.faces.new((verts[5], verts[14], v_rocker_front))
        
        bmesh.ops.recalc_face_normals(bm_fender, faces=bm_fender.faces)
        
        obj_fender = create_bmesh_object(f"BODY_FrontFender{sfx}", col_name, bm_fender)
        assign_material(obj_fender, mat_bronze)
        apply_bevel_and_weighted_normals(obj_fender, width=0.003, segments=2)
        objects.append(obj_fender)

    # -------------------------------------------------------------
    # 3. Cab Greenhouse & Roof Structure with Aero Ribs
    # -------------------------------------------------------------
    bm_cab = bmesh.new()
    
    # Key cab stations along Y:
    # Cowl/A-pillar base: Y = 0.92
    # Windshield header / Roof front: Y = 0.32, Z = 1.78
    # Roof center / B-pillar: Y = -0.35, Z = 1.815
    # Roof rear / C-pillar: Y = -1.18, Z = 1.80
    # Cab rear wall / Bed gap: Y = -1.22, Z = 0.92 to 1.78
    
    # Roof skin grid (5 longitudinal x 7 lateral)
    roof_y = [0.32, -0.05, -0.42, -0.80, -1.18]
    roof_x = [-0.64, -0.44, -0.22, 0.0, 0.22, 0.44, 0.64]
    
    roof_grid = []
    for y in roof_y:
        row = []
        for x in roof_x:
            x_norm = x / 0.64
            # Roof crown (slight dome)
            z_crown = 1.815 - 0.025 * (x_norm**2)
            # Taper toward front and rear
            if y > 0.0:
                z_crown -= 0.025 * (y / 0.32)
            else:
                z_crown -= 0.012 * (abs(y) / 1.18)
                
            # Dual longitudinal aerodynamic ribs/depressions at |X| = 0.33m
            abs_x = abs(x)
            if 0.22 <= abs_x <= 0.44:
                # Subtle recessed aerodynamic channel
                z_crown -= 0.014 * (1.0 - ((abs_x - 0.33) / 0.11)**2)
                
            row.append(bm_cab.verts.new((x, y, z_crown)))
        roof_grid.append(row)
        
    for r in range(len(roof_y) - 1):
        for c in range(len(roof_x) - 1):
            v1 = roof_grid[r][c]
            v2 = roof_grid[r][c+1]
            v3 = roof_grid[r+1][c+1]
            v4 = roof_grid[r+1][c]
            bm_cab.faces.new((v1, v2, v3, v4))
            
    # A-Pillars (Left & Right)
    for mult in [1.0, -1.0]:
        # Top header
        v_a_top_outer = bm_cab.verts.new((0.68 * mult, 0.30, 1.76))
        v_a_top_inner = bm_cab.verts.new((0.60 * mult, 0.32, 1.78))
        # Base at cowl
        v_a_bot_outer = bm_cab.verts.new((0.80 * mult, 0.92, 1.10))
        v_a_bot_inner = bm_cab.verts.new((0.66 * mult, 0.92, 1.12))
        bm_cab.faces.new((v_a_bot_outer, v_a_bot_inner, v_a_top_inner, v_a_top_outer))
        
    # B-Pillars (Vertical divide)
    for mult in [1.0, -1.0]:
        v_b_top = bm_cab.verts.new((0.68 * mult, -0.38, 1.77))
        v_b_bot = bm_cab.verts.new((0.78 * mult, -0.38, 0.94))
        v_b_top_post = bm_cab.verts.new((0.68 * mult, -0.46, 1.77))
        v_b_bot_post = bm_cab.verts.new((0.78 * mult, -0.46, 0.94))
        bm_cab.faces.new((v_b_bot, v_b_bot_post, v_b_top_post, v_b_top))
        
    # C-Pillars & Cab Rear Bulkhead Wall
    v_c_top_L = roof_grid[-1][0]
    v_c_top_R = roof_grid[-1][-1]
    
    # Cab rear wall bottom corners & window surround
    v_rear_bot_L = bm_cab.verts.new((-0.78, -1.22, 0.85))
    v_rear_bot_R = bm_cab.verts.new(( 0.78, -1.22, 0.85))
    v_rear_win_bot_L = bm_cab.verts.new((-0.58, -1.22, 1.25))
    v_rear_win_bot_R = bm_cab.verts.new(( 0.58, -1.22, 1.25))
    v_rear_win_top_L = bm_cab.verts.new((-0.54, -1.20, 1.72))
    v_rear_win_top_R = bm_cab.verts.new(( 0.54, -1.20, 1.72))
    
    # Rear cab wall panels around window
    bm_cab.faces.new((v_rear_bot_L, v_rear_bot_R, v_rear_win_bot_R, v_rear_win_bot_L))
    bm_cab.faces.new((v_rear_bot_L, v_rear_win_bot_L, v_rear_win_top_L, v_c_top_L))
    bm_cab.faces.new((v_rear_bot_R, v_c_top_R, v_rear_win_top_R, v_rear_win_bot_R))
    bm_cab.faces.new((v_rear_win_top_L, v_rear_win_top_R, v_c_top_R, v_c_top_L))
    
    bmesh.ops.recalc_face_normals(bm_cab, faces=bm_cab.faces)
    
    obj_cab = create_bmesh_object("BODY_CabGreenhouse", col_name, bm_cab)
    assign_material(obj_cab, mat_bronze)
    apply_bevel_and_weighted_normals(obj_cab, width=0.003, segments=2)
    objects.append(obj_cab)
    
    # -------------------------------------------------------------
    # 4. Four Doors (Front & Rear, Left & Right)
    # -------------------------------------------------------------
    # Front door: Y = 0.92 to -0.38
    # Rear door: Y = -0.46 to -1.18
    # Height: Z = 0.48 (rocker) to 0.94 (beltline), upper window frame up to 1.76
    doors_data = [
        ("FrontDoor", 0.90, -0.36, 1.0),
        ("FrontDoor", 0.90, -0.36, -1.0),
        ("RearDoor", -0.48, -1.16, 1.0),
        ("RearDoor", -0.48, -1.16, -1.0),
    ]
    
    for label, y_start, y_end, mult in doors_data:
        sfx = "_L" if mult > 0 else "_R"
        bm_door = bmesh.new()
        
        # Stamped lower door sheet metal with waistline crease
        # 4 corners of door skin + intermediate waistline node
        y_mid = (y_start + y_end) / 2.0
        
        # Lower door skin
        v_d_bot_f = bm_door.verts.new((0.80 * mult, y_start, 0.46))
        v_d_bot_r = bm_door.verts.new((0.80 * mult, y_end,   0.46))
        v_d_waist_f = bm_door.verts.new((0.84 * mult, y_start, 0.76))
        v_d_waist_r = bm_door.verts.new((0.84 * mult, y_end,   0.76))
        v_d_belt_f = bm_door.verts.new((0.81 * mult, y_start, 0.94))
        v_d_belt_r = bm_door.verts.new((0.81 * mult, y_end,   0.94))
        
        bm_door.faces.new((v_d_bot_f, v_d_bot_r, v_d_waist_r, v_d_waist_f))
        bm_door.faces.new((v_d_waist_f, v_d_waist_r, v_d_belt_r, v_d_belt_f))
        
        # Upper window frame sash (hollow perimeter frame following roofline and A/B/C pillars)
        z_roof = 1.76
        x_roof = 0.68 * mult
        
        v_f_bot = v_d_belt_f
        v_r_bot = v_d_belt_r
        
        if label == "FrontDoor":
            # Front door top slopes along A-pillar to header at Y = 0.30
            y_f_top = 0.30
            y_r_top = y_end
            
            v_f_top = bm_door.verts.new((x_roof, y_f_top, z_roof))
            v_r_top = bm_door.verts.new((x_roof, y_r_top, z_roof))
            
            v_f_bot_in = bm_door.verts.new((0.80 * mult, 0.83, 0.99))
            v_r_bot_in = bm_door.verts.new((0.80 * mult, y_end + 0.04, 0.99))
            v_f_top_in = bm_door.verts.new((x_roof, y_f_top + 0.02, z_roof - 0.04))
            v_r_top_in = bm_door.verts.new((x_roof, y_r_top + 0.04, z_roof - 0.04))
            
            # Frame faces
            bm_door.faces.new((v_f_bot, v_r_bot, v_r_bot_in, v_f_bot_in))
            bm_door.faces.new((v_r_bot, v_r_top, v_r_top_in, v_r_bot_in))
            bm_door.faces.new((v_r_top, v_f_top, v_f_top_in, v_r_top_in))
            bm_door.faces.new((v_f_top, v_f_bot, v_f_bot_in, v_f_top_in))
        else:
            # Rear door
            y_f_top = y_start
            y_r_top = y_end
            
            v_f_top = bm_door.verts.new((x_roof, y_f_top, z_roof))
            v_r_top = bm_door.verts.new((x_roof, y_r_top, z_roof))
            
            v_f_bot_in = bm_door.verts.new((0.80 * mult, y_start - 0.04, 0.99))
            v_r_bot_in = bm_door.verts.new((0.80 * mult, y_end + 0.04, 0.99))
            v_f_top_in = bm_door.verts.new((x_roof, y_f_top - 0.04, z_roof - 0.04))
            v_r_top_in = bm_door.verts.new((x_roof, y_r_top + 0.04, z_roof - 0.04))
            
            # Frame faces
            bm_door.faces.new((v_f_bot, v_r_bot, v_r_bot_in, v_f_bot_in))
            bm_door.faces.new((v_f_bot, v_f_bot_in, v_f_top_in, v_f_top))
            bm_door.faces.new((v_f_top, v_f_top_in, v_r_top_in, v_r_top))
            bm_door.faces.new((v_r_top, v_r_top_in, v_r_bot_in, v_r_bot))
        
        bmesh.ops.recalc_face_normals(bm_door, faces=bm_door.faces)
        
        obj_door = create_bmesh_object(f"BODY_{label}{sfx}", col_name, bm_door)
        assign_material(obj_door, mat_bronze)
        apply_bevel_and_weighted_normals(obj_door, width=0.003, segments=2)
        objects.append(obj_door)
        
    # Stamped Firewall & Cabin Floorpan with transmission tunnel
    bm_floor = bmesh.new()
    # Firewall at Y = 0.92
    bmesh_create_cube(
        bm_floor,
        size=0.04,
        matrix=mat_trans(0.0, 0.92, 0.78) @ mat_scale(38.0, 1.0, 16.0)
    )
    # Floorpan
    bmesh_create_cube(
        bm_floor,
        size=0.04,
        matrix=mat_trans(0.0, -0.15, 0.52) @ mat_scale(37.0, 52.0, 1.0)
    )
    # Cowl Plenum bar under windshield
    bmesh_create_cube(
        bm_floor,
        size=0.05,
        matrix=mat_trans(0.0, 0.92, 1.08) @ mat_scale(30.0, 1.8, 1.0)
    )
    obj_floor = create_bmesh_object("BODY_Floorpan_Firewall", col_name, bm_floor)
    assign_material(obj_floor, mat_trim)
    objects.append(obj_floor)
        
    # -------------------------------------------------------------
    # 5. Full-Length Rocker Sills (Left & Right)
    # -------------------------------------------------------------
    for mult, sfx in [(1.0, "_L"), (-1.0, "_R")]:
        bm_sill = bmesh.new()
        # Box running from front wheel well (Y=1.00) to rear wheel well (Y=-1.18)
        bmesh_create_cube(
            bm_sill,
            size=0.10,
            matrix=mat_trans(0.78 * mult, -0.09, 0.44) @ mat_scale(1.0, 21.8, 1.2)
        )
        obj_sill = create_bmesh_object(f"BODY_RockerSill{sfx}", col_name, bm_sill)
        assign_material(obj_sill, mat_bronze)
        apply_bevel_and_weighted_normals(obj_sill, width=0.004, segments=2)
        objects.append(obj_sill)
        
    # -------------------------------------------------------------
    # 6. Geometric Wheel Arch Fender Flares (Front & Rear, Left & Right)
    # Distinct dark composite chunky flares as seen in HiLux SR5 2025 blueprint
    # -------------------------------------------------------------
    flare_configs = [
        # (label, axle_y, inner_r, outer_r, z_center)
        ("FrontFlare", FRONT_AXLE_Y, 0.46, 0.54, 0.42),
        ("RearFlare",  REAR_AXLE_Y,  0.47, 0.55, 0.43),
    ]
    
    for label, axle_y, r_in, r_out, z_c in flare_configs:
        for mult, sfx in [(1.0, "_L"), (-1.0, "_R")]:
            bm_flare = bmesh.new()
            # Angular 7-segment chamfered arch profile
            num_angles = 8
            arc_verts_in = []
            arc_verts_out = []
            arc_verts_lip = []
            
            for i in range(num_angles):
                # Angle from 15 deg to 165 deg over top of wheel arch
                theta = math.radians(15.0 + i * (150.0 / (num_angles - 1)))
                cos_t = math.cos(theta)
                sin_t = math.sin(theta)
                
                # Y goes forward/backwards relative to axle
                y_pos = axle_y - r_in * cos_t
                z_pos_in = z_c + r_in * sin_t
                
                y_pos_out = axle_y - r_out * cos_t
                z_pos_out = z_c + r_out * sin_t
                
                # Outer flared bulge: X extends out to ±0.925m
                v_in  = bm_flare.verts.new((0.86 * mult, y_pos, z_pos_in))
                v_out = bm_flare.verts.new((0.925 * mult, y_pos_out, z_pos_out))
                v_lip = bm_flare.verts.new((0.905 * mult, y_pos_out, z_pos_out - 0.03))
                
                arc_verts_in.append(v_in)
                arc_verts_out.append(v_out)
                arc_verts_lip.append(v_lip)
                
            for i in range(num_angles - 1):
                # Flared top face
                bm_flare.faces.new((
                    arc_verts_in[i],
                    arc_verts_in[i+1],
                    arc_verts_out[i+1],
                    arc_verts_out[i]
                ))
                # Outer return lip face
                bm_flare.faces.new((
                    arc_verts_out[i],
                    arc_verts_out[i+1],
                    arc_verts_lip[i+1],
                    arc_verts_lip[i]
                ))
                
            bmesh.ops.recalc_face_normals(bm_flare, faces=bm_flare.faces)
            
            obj_flare = create_bmesh_object(f"BODY_{label}{sfx}", col_name, bm_flare)
            assign_material(obj_flare, mat_trim)
            apply_bevel_and_weighted_normals(obj_flare, width=0.003, segments=2)
            objects.append(obj_flare)
            
    print(f"[HILUX] Cab Body generated with {len(objects)} objects.")
    return objects
