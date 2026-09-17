"""
Bentley Continental GT Speed Convertible (2020s) Phase 21: Part Extra 16
Subsystem 36:
- Subsystem 36: Forged Emergency Tow Hooks & Chassis Tie-Down Lashing Transport Eyes
"""

PART_BENTLEY_EXTRA16 = '''
# ----------------------------------------------------------------------------
# 36. SUBSYSTEM 36: FORGED TOW HOOKS & CHASSIS LASHING TRANSPORT EYES
# ----------------------------------------------------------------------------

def build_bentley_tow_hardware_and_lashing(parent_col, mats):
    """
    Constructs track-day emergency recovery and international transport tie-down hardware:
    - High-strength forged steel screw-in front emergency towing eye receptor socket.
    - Rear chassis integrated recovery loop socket threaded into rear bumper structure.
    - 4 under-chassis forged transport tie-down lashing eyes for logistics anchoring.
    - Removable front bumper circular access cap plug.
    """
    objs = []
    bm_tow = bmesh.new()

    # 1. Front Screw-In Tow Hook Receptor Socket (Front bumper right flank, X = +0.480m, Y = +2.280m, Z = 0.440m)
    mat_ftow = Matrix.Translation(Vector((0.480, 2.280, 0.440)))
    bmesh.ops.create_cylinder(bm_tow, radius=0.022, depth=0.075, segments=16, matrix=mat_ftow @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Removable Circular Bumper Access Plug Cap
    mat_fplug = mat_ftow @ Matrix.Translation(Vector((0, 0.038, 0)))
    bmesh.ops.create_cylinder(bm_tow, radius=0.026, depth=0.008, segments=18, matrix=mat_fplug @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Rear Towing Socket Receptor (Rear bumper left flank, X = -0.520m, Y = -2.320m, Z = 0.420m)
    mat_rtow = Matrix.Translation(Vector((-0.520, -2.320, 0.420)))
    bmesh.ops.create_cylinder(bm_tow, radius=0.022, depth=0.075, segments=16, matrix=mat_rtow @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 3. Four Under-Chassis Forged Transport Tie-Down Lashing Rings (X = +-0.620m, Front Y = +1.150m, Rear Y = -1.150m)
    lash_pts = [
        (-0.620,  1.150, 0.185),
        ( 0.620,  1.150, 0.185),
        (-0.620, -1.150, 0.185),
        ( 0.620, -1.150, 0.185),
    ]
    for lx, ly, lz in lash_pts:
        mat_lash = Matrix.Translation(Vector((lx, ly, lz)))
        bmesh.ops.create_torus(bm_tow, major_radius=0.035, minor_radius=0.007, major_segments=16, minor_segments=8, matrix=mat_lash @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_tow = link_obj("GEO_BENTLEY_Chassis_Towing_and_Lashing_Hardware", bm_tow, parent_col, mats["chrome"], bevel=0.001)
    objs.append(obj_tow)
    return objs
'''
