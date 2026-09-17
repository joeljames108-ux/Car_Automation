"""
Bentley Continental GT Speed Convertible (2020s) Phase 21: Part Extra 3
Subsystem 16:
- Subsystem 16: High-Rigidity Aluminum Sills, Door Anti-Intrusion Beams & Crash Boxes
"""

PART_BENTLEY_EXTRA3 = '''
# ----------------------------------------------------------------------------
# 16. SUBSYSTEM 16: STRUCTURAL SILLS, DOOR INTRUSION BEAMS & CRASH BOXES
# ----------------------------------------------------------------------------

def build_bentley_structural_safety_elements(parent_col, mats):
    """
    Constructs high-rigidity structural aluminum safety and reinforcement framework:
    - Multi-cell extruded aluminum side sills running between front and rear wheel arches.
    - High-strength door internal anti-intrusion beams (recessed strictly inside door cavity).
    - Front extruded aluminum crash boxes with hex-corrugated energy absorption ribs.
    - Rear bumper collision cross-beam and longitudinal crush cans.
    """
    objs = []
    bm_sills = bmesh.new()
    bm_crash = bmesh.new()

    # 1. Multi-Chamber Structural Aluminum Side Sills (Y: -0.950m to +0.950m, X = +-0.835m, Z = 0.220m)
    for sill_sign in [-1.0, 1.0]:
        mat_sill = Matrix.Translation(Vector((sill_sign * 0.835, 0.000, 0.220)))
        bmesh.ops.create_cube(bm_sills, size=1.0, matrix=mat_sill @ Matrix.Diagonal(Vector((0.140, 1.950, 0.120, 1.0))))

        # Internal Door Anti-Intrusion Diagonal Reinforcement Beam (Safe X = +-0.820m, inside door shell)
        mat_beam = Matrix.Translation(Vector((sill_sign * 0.820, 0.080, 0.440))) @ Euler((sill_sign * math.radians(6), math.radians(7), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_sills, radius=0.024, depth=1.150, segments=14, matrix=mat_beam @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Front Extruded Aluminum Crash Boxes & Impact Beam (Y = +2.150m to +2.320m)
    for f_cb_sign in [-1.0, 1.0]:
        mat_fcbox = Matrix.Translation(Vector((f_cb_sign * 0.440, 2.180, 0.380)))
        bmesh.ops.create_cube(bm_crash, size=1.0, matrix=mat_fcbox @ Matrix.Diagonal(Vector((0.130, 0.220, 0.140, 1.0))))

    # Front Transverse High-Tensile Aluminum Bumper Beam (Y = +2.300m, Z = 0.380m)
    mat_fbeam = Matrix.Translation(Vector((0.0, 2.300, 0.380)))
    bmesh.ops.create_cube(bm_crash, size=1.0, matrix=mat_fbeam @ Matrix.Diagonal(Vector((1.380, 0.090, 0.120, 1.0))))

    # 3. Rear Crash Protection Beam & Hexagonal Crush Cans (Y = -2.260m)
    for r_cb_sign in [-1.0, 1.0]:
        mat_rcbox = Matrix.Translation(Vector((r_cb_sign * 0.460, -2.220, 0.360)))
        bmesh.ops.create_cube(bm_crash, size=1.0, matrix=mat_rcbox @ Matrix.Diagonal(Vector((0.120, 0.180, 0.130, 1.0))))

    # Rear Transverse Aluminum Cross-Beam (Y = -2.310m, Z = 0.360m)
    mat_rbeam = Matrix.Translation(Vector((0.0, -2.310, 0.360)))
    bmesh.ops.create_cube(bm_crash, size=1.0, matrix=mat_rbeam @ Matrix.Diagonal(Vector((1.320, 0.080, 0.110, 1.0))))

    obj_sills = link_obj("GEO_BENTLEY_Reinforced_Aluminum_Side_Sills", bm_sills, parent_col, mats["engine_alloy"], bevel=0.002)
    obj_crash = link_obj("GEO_BENTLEY_Front_Rear_Collision_Crash_Beams", bm_crash, parent_col, mats["trim_black"], bevel=0.0015)

    objs.extend([obj_sills, obj_crash])
    return objs
'''
