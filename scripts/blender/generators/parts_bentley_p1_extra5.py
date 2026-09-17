"""
Bentley Continental GT Speed Convertible (2020s) Phase 21: Part Extra 5
Subsystem 18:
- Subsystem 18: Engine Bay Strut Tower V-Brace & High-Tension Structural Firewall
"""

PART_BENTLEY_EXTRA5 = '''
# ----------------------------------------------------------------------------
# 18. SUBSYSTEM 18: STRUT TOWER V-BRACE & STRUCTURAL FIREWALL BULKHEAD
# ----------------------------------------------------------------------------

def build_bentley_strut_bracing_and_firewall(parent_col, mats):
    """
    Constructs high-torsion front engine bay reinforcement architecture:
    - Polished extruded aluminum V-brace triangulating front strut towers to cowl.
    - High-strength multi-gauge steel/aluminum structural firewall bulkhead.
    - Front radiator core support upper cross-tie bar locking front frame horns.
    - Engine bay side apron inner fender reinforcement panels.
    """
    objs = []
    bm_brace = bmesh.new()
    bm_firewall = bmesh.new()

    # 1. Aluminum Structural V-Brace Triangulation (Struts at X = +-0.540m, Y = 1.425m to Cowl Center X = 0, Y = 0.880m)
    for v_sign in [-1.0, 1.0]:
        p_strut = Vector((v_sign * 0.520, 1.425, 0.650))
        p_cowl = Vector((0.0, 0.880, 0.680))
        p_mid = (p_strut + p_cowl) * 0.5
        v_diff = p_cowl - p_strut
        length = v_diff.length
        rot_quat = Vector((0, 0, 1)).rotation_difference(v_diff.normalized())

        mat_vbar = Matrix.Translation(p_mid) @ rot_quat.to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_brace, radius=0.016, depth=length, segments=14, matrix=mat_vbar)

        # Billet Strut Tower Attachment Cleat
        mat_cleat = Matrix.Translation(p_strut)
        bmesh.ops.create_cylinder(bm_brace, radius=0.045, depth=0.025, segments=16, matrix=mat_cleat)

    # Center Cowl Anchor Bracket (X = 0, Y = 0.880m)
    mat_cowl_cleat = Matrix.Translation(Vector((0.0, 0.880, 0.680)))
    bmesh.ops.create_cube(bm_brace, size=1.0, matrix=mat_cowl_cleat @ Matrix.Diagonal(Vector((0.140, 0.080, 0.035, 1.0))))

    # 2. Structural Firewall Bulkhead (Y = +0.860m, Z: 0.220m to 0.760m, Width: 1.440m)
    mat_fw = Matrix.Translation(Vector((0.0, 0.860, 0.490)))
    bmesh.ops.create_cube(bm_firewall, size=1.0, matrix=mat_fw @ Matrix.Diagonal(Vector((1.440, 0.040, 0.540, 1.0))))

    # Acoustic Composite Insulation Mat on Cockpit Side of Firewall
    mat_insul = mat_fw @ Matrix.Translation(Vector((0.0, -0.025, 0.0)))
    bmesh.ops.create_cube(bm_firewall, size=1.0, matrix=mat_insul @ Matrix.Diagonal(Vector((1.420, 0.015, 0.520, 1.0))))

    # 3. Radiator Core Support Upper Cross-Tie Bar (Y = +2.180m, Z = 0.710m)
    mat_rad_bar = Matrix.Translation(Vector((0.0, 2.180, 0.710)))
    bmesh.ops.create_cube(bm_brace, size=1.0, matrix=mat_rad_bar @ Matrix.Diagonal(Vector((1.220, 0.060, 0.040, 1.0))))

    # Hood Latch Catch Mechanism & Radiator Upper Isolators
    mat_latch = mat_rad_bar @ Matrix.Translation(Vector((0.0, 0.020, 0.020)))
    bmesh.ops.create_cube(bm_brace, size=1.0, matrix=mat_latch @ Matrix.Diagonal(Vector((0.120, 0.045, 0.030, 1.0))))

    obj_brace = link_obj("GEO_BENTLEY_EngineBay_Strut_VBracing", bm_brace, parent_col, mats["chrome"], bevel=0.001)
    obj_firewall = link_obj("GEO_BENTLEY_Structural_Firewall_Bulkhead", bm_firewall, parent_col, mats["trim_black"], bevel=0.0015)

    objs.extend([obj_brace, obj_firewall])
    return objs
'''
