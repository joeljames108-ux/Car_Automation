"""
Jaguar F-Type V8 R Convertible (2010s) Phase 19: Part C
Subsystem 4: Raked Windshield Frame, Ceramic Frit Glass, Roadster Tonneau
Subsystem 5: Enclosed Wheelhouse Tubs & Aerodynamic Aluminum Undertray
"""

PART_FTYPE_C = '''
# ----------------------------------------------------------------------------
# 5. SUBSYSTEM 4: RAKED WINDSHIELD FRAME, GLASS & CONVERTIBLE TONNEAU
# ----------------------------------------------------------------------------

def build_jaguar_ftype_windshield_and_tonneau(parent_col, mats):
    """
    Constructs the convertible roadster cockpit enclosure:
    - High-rake aluminum A-pillars and header rail (Rake angle ~62 degrees).
    - Optical tinted safety windshield glass with silk-screened black ceramic frit border.
    - Open roadster cockpit aperture with clean interior door shut faces.
    - Folded multi-layer mohair fabric convertible soft-top tonneau cover recessed behind headrests.
    - Frameless side door glass windows in partially lowered roadster presentation stance.
    """
    objs = []
    bm_frame = bmesh.new()
    bm_glass = bmesh.new()
    bm_tonneau = bmesh.new()

    # 1. Raked A-Pillars & Header Rail (Cowl: Y = +0.720m, Z = 0.810m to Header: Y = +0.180m, Z = 1.280m)
    for ax_sign in [-1.0, 1.0]:
        p_cowl = Vector((ax_sign * 0.745, 0.720, 0.810))
        p_hdr = Vector((ax_sign * 0.580, 0.180, 1.280))
        mid_p = (p_cowl + p_hdr) * 0.5
        mat_ap = Matrix.Translation(mid_p) @ Vector((0, 0, 1)).rotation_difference(p_hdr - p_cowl).to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_frame, radius=0.030, depth=(p_hdr - p_cowl).length, segments=16, matrix=mat_ap)

    # Upper Windshield Header Rail (Y = +0.180m, Z = 1.280m)
    mat_hdr = Matrix.Translation(Vector((0.0, 0.180, 1.280)))
    bmesh.ops.create_cube(bm_frame, size=1.0, matrix=mat_hdr @ Matrix.Diagonal(Vector((1.160, 0.050, 0.040, 1.0))))

    # 2. Optical Windshield Safety Glass with Aerodynamic Curvature
    p_cowl_c = Vector((0.0, 0.720, 0.825))
    p_hdr_c = Vector((0.0, 0.180, 1.270))
    mid_g = (p_cowl_c + p_hdr_c) * 0.5
    mat_glass = Matrix.Translation(mid_g) @ Vector((0, 0, 1)).rotation_difference(p_hdr_c - p_cowl_c).to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_glass, size=1.0, matrix=mat_glass @ Matrix.Diagonal(Vector((1.140, 0.014, (p_hdr_c - p_cowl_c).length, 1.0))))

    # 3. Frameless Side Door Glass (Partially lowered 30mm for roadster display)
    for gx_sign in [-1.0, 1.0]:
        mat_sideglass = Matrix.Translation(Vector((gx_sign * 0.770, 0.120, 0.890))) @ Euler((0, gx_sign * math.radians(-5), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_glass, size=1.0, matrix=mat_sideglass @ Matrix.Diagonal(Vector((0.010, 0.720, 0.150, 1.0))))

    # 4. Folded Mohair Soft-Top Tonneau Boot (Recessed well behind rollover hoops: Y: -0.520m to -0.920m)
    mat_tb = Matrix.Translation(Vector((0.0, -0.720, 0.825)))
    bmesh.ops.create_cube(bm_tonneau, size=1.0, matrix=mat_tb @ Matrix.Diagonal(Vector((1.260, 0.380, 0.080, 1.0))))

    # Transverse Fabric Folding Ribs
    for rib_y in [-0.820, -0.720, -0.620]:
        mat_frib = Matrix.Translation(Vector((0.0, rib_y, 0.865)))
        bmesh.ops.create_cylinder(bm_tonneau, radius=0.018, depth=1.200, segments=14, matrix=mat_frib @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_frame = link_obj("GEO_FTYPE_Windshield_Header_Frame", bm_frame, parent_col, mats["gloss_black"], bevel=0.002)
    obj_glass = link_obj("GEO_FTYPE_Windshield_Optical_Glass", bm_glass, parent_col, mats["glass"], bevel=0.0005)
    obj_tonneau = link_obj("GEO_FTYPE_Folded_SoftTop_Tonneau", bm_tonneau, parent_col, mats["soft_top"], bevel=0.002)

    objs.extend([obj_frame, obj_glass, obj_tonneau])
    return objs


# ----------------------------------------------------------------------------
# 6. SUBSYSTEM 5: WHEELHOUSE TUBS & UNDERBODY ALUMINUM UNDERTRAY
# ----------------------------------------------------------------------------

def build_jaguar_ftype_wheel_tubs_and_undertray(parent_col, mats):
    """
    Constructs fully enclosed wheelhouse tubs and high-downforce aerodynamic undertray:
    - Front and rear inner wheel well linings preventing see-through voids from any camera angle.
    - Flat aluminum aerodynamic belly pan running between axles.
    - High-velocity rear underbody diffuser tunnels channel air beneath the rear subframe.
    - Front wheel arch stone deflectors and NACA brake cooling air guides.
    """
    objs = []
    bm_tubs = bmesh.new()
    bm_tray = bmesh.new()

    # 1. Enclosed Front Wheel Tubs (Axle: Y = +1.311m, Radius = 0.375m)
    for fx_sign in [-1.0, 1.0]:
        mat_ftub = Matrix.Translation(Vector((fx_sign * 0.700, 1.311, 0.380)))
        bmesh.ops.create_cylinder(bm_tubs, radius=0.375, depth=0.240, segments=24, matrix=mat_ftub @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # Front Splash Shield Inner Plate
        mat_fshield = Matrix.Translation(Vector((fx_sign * 0.590, 1.311, 0.380)))
        bmesh.ops.create_cube(bm_tubs, size=1.0, matrix=mat_fshield @ Matrix.Diagonal(Vector((0.020, 0.720, 0.720, 1.0))))

    # 2. Enclosed Rear Wheel Tubs (Axle: Y = -1.311m, Radius = 0.385m)
    for rx_sign in [-1.0, 1.0]:
        mat_rtub = Matrix.Translation(Vector((rx_sign * 0.720, -1.311, 0.380)))
        bmesh.ops.create_cylinder(bm_tubs, radius=0.385, depth=0.260, segments=24, matrix=mat_rtub @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # Rear Splash Shield Inner Plate
        mat_rshield = Matrix.Translation(Vector((rx_sign * 0.600, -1.311, 0.380)))
        bmesh.ops.create_cube(bm_tubs, size=1.0, matrix=mat_rshield @ Matrix.Diagonal(Vector((0.020, 0.740, 0.740, 1.0))))

    # 3. Continuous Underbody Aerodynamic Undertray (Y: -1.750m to +1.850m, Z = 0.135m)
    mat_floor = Matrix.Translation(Vector((0.0, 0.050, 0.135)))
    bmesh.ops.create_cube(bm_tray, size=1.0, matrix=mat_floor @ Matrix.Diagonal(Vector((1.520, 3.600, 0.025, 1.0))))

    # Longitudinal Stiffening Ribs
    for rib_x in [-0.550, -0.280, 0.280, 0.550]:
        mat_lrib = Matrix.Translation(Vector((rib_x, 0.050, 0.120)))
        bmesh.ops.create_cube(bm_tray, size=1.0, matrix=mat_lrib @ Matrix.Diagonal(Vector((0.040, 3.500, 0.020, 1.0))))

    obj_tubs = link_obj("GEO_FTYPE_Enclosed_Wheelhouse_Tubs", bm_tubs, parent_col, mats["satin_black"], bevel=0.001)
    obj_tray = link_obj("GEO_FTYPE_Aerodynamic_Underbody_Tray", bm_tray, parent_col, mats["satin_black"], bevel=0.002)

    objs.extend([obj_tubs, obj_tray])
    return objs
'''
