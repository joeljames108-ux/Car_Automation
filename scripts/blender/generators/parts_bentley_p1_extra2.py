"""
Bentley Continental GT Speed Convertible (2020s) Phase 21: Part Extra 2
Subsystem 15:
- Subsystem 15: Front Lower Matrix Intercooler Scoops, Chrome Blades & Active Shutter Matrix
"""

PART_BENTLEY_EXTRA2 = '''
# ----------------------------------------------------------------------------
# 15. SUBSYSTEM 15: FRONT LOWER MATRIX SCOOPS, BLADES & ACTIVE SHUTTERS
# ----------------------------------------------------------------------------

def build_bentley_front_lower_aero_scoops(parent_col, mats):
    """
    Constructs high-performance front bumper lower intake architecture:
    - Left and right outer intercooler cooling scoops with dark tint matrix diamond mesh.
    - Sculpted horizontal aerodynamic chrome blades flanking the lower bumper apron.
    - Central lower intake matrix channel feeding transmission oil cooler and condenser.
    - Motorized active radiator grille shutter vane matrix reducing aerodynamic drag at speed.
    """
    objs = []
    bm_scoops = bmesh.new()
    bm_blades = bmesh.new()
    bm_shutters = bmesh.new()

    # 1. Left & Right Outer Intercooler Scoops (X = +-0.640m, Y = +2.220m, Z = 0.310m)
    for sc_sign in [-1.0, 1.0]:
        mat_scoop = Matrix.Translation(Vector((sc_sign * 0.640, 2.220, 0.310)))
        # Angled Scoop Outer Bezel Housing
        mat_rot = mat_scoop @ Euler((0, -sc_sign * math.radians(12), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_scoops, size=1.0, matrix=mat_rot @ Matrix.Diagonal(Vector((0.320, 0.120, 0.160, 1.0))))

        # High-Speed Chrome Aerodynamic Splitter Winglet Blade (Speed signature trim)
        mat_blade = mat_rot @ Matrix.Translation(Vector((0.0, 0.040, -0.010)))
        bmesh.ops.create_cube(bm_blades, size=1.0, matrix=mat_blade @ Matrix.Diagonal(Vector((0.340, 0.025, 0.018, 1.0))))

        # Inner Matrix Diamond Mesh Insert Screen
        mat_mesh = mat_rot @ Matrix.Translation(Vector((0.0, -0.020, 0.0)))
        bmesh.ops.create_cube(bm_scoops, size=1.0, matrix=mat_mesh @ Matrix.Diagonal(Vector((0.290, 0.010, 0.130, 1.0))))

    # 2. Central Lower Air Dam Intake Aperture (X: -0.360m to +0.360m, Y = +2.280m, Z = 0.280m)
    mat_ctr = Matrix.Translation(Vector((0.0, 2.280, 0.280)))
    bmesh.ops.create_cube(bm_scoops, size=1.0, matrix=mat_ctr @ Matrix.Diagonal(Vector((0.740, 0.140, 0.110, 1.0))))

    # Lower Apron Chrome Lip Stiffener
    mat_clip = mat_ctr @ Matrix.Translation(Vector((0.0, 0.060, -0.050)))
    bmesh.ops.create_cube(bm_blades, size=1.0, matrix=mat_clip @ Matrix.Diagonal(Vector((0.780, 0.025, 0.016, 1.0))))

    # 3. Active Aerodynamic Radiator Shutter Matrix (Behind Main Grille, Y = +2.180m, Z: 0.440m to 0.760m)
    for v_i in range(8):
        v_z = 0.440 + v_i * 0.042
        mat_vane = Matrix.Translation(Vector((0.0, 2.180, v_z)))
        # Horizontal Shutter Slats (motorized variable angle)
        bmesh.ops.create_cube(bm_shutters, size=1.0, matrix=mat_vane @ Matrix.Diagonal(Vector((0.680, 0.018, 0.022, 1.0))))

    obj_scoops = link_obj("GEO_BENTLEY_Front_Lower_Matrix_Scoops", bm_scoops, parent_col, mats["dark_tint"], bevel=0.001)
    obj_blades = link_obj("GEO_BENTLEY_Speed_Chrome_Bumper_Blades", bm_blades, parent_col, mats["chrome"], bevel=0.0008)
    obj_shutters = link_obj("GEO_BENTLEY_Active_Radiator_Shutter_Matrix", bm_shutters, parent_col, mats["trim_black"], bevel=0.001)

    objs.extend([obj_scoops, obj_blades, obj_shutters])
    return objs
'''
