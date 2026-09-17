"""
Bentley Continental GT Speed Convertible (2020s) Phase 21: Part Extra 4
Subsystem 17:
- Subsystem 17: Rear Active Deployable Spoiler Cavity & Articulated Scissor Actuators
"""

PART_BENTLEY_EXTRA4 = '''
# ----------------------------------------------------------------------------
# 17. SUBSYSTEM 17: ACTIVE DEPLOYABLE SPOILER CAVITY & SCISSOR ACTUATORS
# ----------------------------------------------------------------------------

def build_bentley_active_rear_spoiler(parent_col, mats):
    """
    Constructs the active deployable rear aerodynamic spoiler and motorized mechanism:
    - Recessed spoiler well cavity integrated into rear decklid trailing edge.
    - Active aerofoil wing blade contoured precisely to rear lip profile.
    - Dual electromechanical scissor lift jacks and linear hydraulic dampers.
    - Weatherstrip perimeter gasket sealing the cavity when spoiler is retracted.
    """
    objs = []
    bm_cavity = bmesh.new()
    bm_wing = bmesh.new()
    bm_mech = bmesh.new()

    # 1. Decklid Trailing Edge Spoiler Recess Cavity (Y: -2.080m to -2.310m, Z = 0.865m, Width: 1.180m)
    mat_cav = Matrix.Translation(Vector((0.0, -2.190, 0.865)))
    bmesh.ops.create_cube(bm_cavity, size=1.0, matrix=mat_cav @ Matrix.Diagonal(Vector((1.180, 0.220, 0.045, 1.0))))

    # Perimeter Rubber Sealing Weatherstrip Gasket
    bmesh.ops.create_cube(bm_cavity, size=1.0, matrix=mat_cav @ Matrix.Diagonal(Vector((1.200, 0.235, 0.012, 1.0))))

    # 2. Active Aerofoil Spoiler Wing Blade (Positioned flush in cavity, Y = -2.190m, Z = 0.885m)
    mat_blade = Matrix.Translation(Vector((0.0, -2.190, 0.885))) @ Euler((math.radians(3.5), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_wing, size=1.0, matrix=mat_blade @ Matrix.Diagonal(Vector((1.160, 0.200, 0.032, 1.0))))

    # Subtle Aerodynamic Gurney Flap on trailing lip
    mat_gurney = mat_blade @ Matrix.Translation(Vector((0.0, -0.095, 0.014)))
    bmesh.ops.create_cube(bm_wing, size=1.0, matrix=mat_gurney @ Matrix.Diagonal(Vector((1.140, 0.010, 0.012, 1.0))))

    # 3. Dual Articulated Motorized Scissor Lift Jacks (Left & Right inside cavity)
    for jack_sign in [-1.0, 1.0]:
        mat_jack = mat_cav @ Matrix.Translation(Vector((jack_sign * 0.380, 0.000, -0.010)))
        # Scissor Lower Base Pivot Bracket
        bmesh.ops.create_cube(bm_mech, size=1.0, matrix=mat_jack @ Matrix.Diagonal(Vector((0.055, 0.120, 0.020, 1.0))))
        # Articulating Diagonal Scissor Arms
        for arm_ang in [-28, 28]:
            mat_arm = mat_jack @ Euler((math.radians(arm_ang), 0, 0), 'XYZ').to_matrix().to_4x4()
            bmesh.ops.create_cylinder(bm_mech, radius=0.007, depth=0.085, segments=10, matrix=mat_arm)
        # Linear Hydraulic Stabilizer Damper
        bmesh.ops.create_cylinder(bm_mech, radius=0.012, depth=0.075, segments=12, matrix=mat_jack @ Matrix.Translation(Vector((0.025, 0, 0))))

    obj_cavity = link_obj("GEO_BENTLEY_Active_Spoiler_Recess_Cavity", bm_cavity, parent_col, mats["trim_black"], bevel=0.001)
    obj_wing = link_obj("GEO_BENTLEY_Active_Deployable_Spoiler_Blade", bm_wing, parent_col, mats["paint"], bevel=0.0015)
    obj_mech = link_obj("GEO_BENTLEY_Active_Spoiler_Scissor_Actuators", bm_mech, parent_col, mats["engine_alloy"], bevel=0.0008)

    objs.extend([obj_cavity, obj_wing, obj_mech])
    return objs
'''
