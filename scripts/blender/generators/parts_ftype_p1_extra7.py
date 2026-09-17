"""
Jaguar F-Type V8 R Convertible (2010s) Phase 19: Extra Part 7
Subsystem 40: Rear Trunk Bulkhead Torsional Cross-Brace Bar
Subsystem 41: Active Exhaust Bypass Flap Valves & Vacuum Solenoid Actuators
Subsystem 42: Electronic Differential Auxiliary Oil Cooler Pump
Subsystem 43: Rear Battery Carrier & High-Voltage Terminals
"""

PART_FTYPE_EXTRA7 = '''
# ----------------------------------------------------------------------------
# 40. SUBSYSTEM 40: REAR BULKHEAD TORSIONAL CROSS-BRACE
# ----------------------------------------------------------------------------

def build_jaguar_ftype_rear_bulkhead_cross_brace(parent_col, mats):
    """
    Constructs the convertible rear torsional stiffening cross-brace:
    - Massive extruded aluminum diagonal cross-brace spanning between rear suspension turrets.
    - Reinforces rear chassis rigidity against torsional flex when roof is lowered.
    - Billet machined mounting feet anchored directly to unibody shock towers.
    """
    objs = []
    bm_rbrace = bmesh.new()

    # Diagonal X-Brace between rear shock towers (X = +/- 0.580m, Y = -1.311m, Z = 0.680m to floor)
    for bx_sign in [-1.0, 1.0]:
        p_tower = Vector((bx_sign * 0.580, -1.311, 0.680))
        p_center = Vector((0.0, -1.150, 0.380))
        mid_b = (p_tower + p_center) * 0.5
        mat_x = Matrix.Translation(mid_b) @ Vector((0, 0, 1)).rotation_difference(p_center - p_tower).to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_rbrace, radius=0.022, depth=(p_center - p_tower).length, segments=14, matrix=mat_x)

    # Transverse Upper Turret Bar
    mat_rbar = Matrix.Translation(Vector((0.0, -1.311, 0.680)))
    bmesh.ops.create_cylinder(bm_rbrace, radius=0.018, depth=1.160, segments=14, matrix=mat_rbar @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_rbrace = link_obj("GEO_FTYPE_Rear_Torsional_Cross_Brace", bm_rbrace, parent_col, mats["alloy"], bevel=0.001)
    objs.append(obj_rbrace)
    return objs


# ----------------------------------------------------------------------------
# 41. SUBSYSTEM 41: ACTIVE EXHAUST BYPASS FLAPS & ACTUATORS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_active_exhaust_valves(parent_col, mats):
    """
    Constructs the electronically/pneumatically actuated exhaust valves:
    - 4 butterfly throttle valves integrated into outboard exhaust pipes.
    - Vacuum diaphragm actuator canisters mounted on top of tailpipe housings.
    - Connecting mechanical linkages opening valves under wide-open throttle or in Dynamic mode.
    """
    objs = []
    bm_valves = bmesh.new()

    for qx_sign in [-1.0, 1.0]:
        for q_sub in [-0.045, 0.045]:
            p_val = Vector((qx_sign * 0.620 + q_sub, -1.950, 0.250))
            # Butterfly Valve Pivot Shaft
            mat_shaft = Matrix.Translation(p_val) @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()
            bmesh.ops.create_cylinder(bm_valves, radius=0.005, depth=0.080, segments=8, matrix=mat_shaft)

            # Vacuum Actuator Canister (Mounted above pipe)
            mat_can = Matrix.Translation(p_val + Vector((0, 0, 0.055)))
            bmesh.ops.create_cylinder(bm_valves, radius=0.022, depth=0.045, segments=14, matrix=mat_can)

            # Actuator Linkage Rod
            mat_link = Matrix.Translation(p_val + Vector((0, 0, 0.025)))
            bmesh.ops.create_cylinder(bm_valves, radius=0.003, depth=0.035, segments=6, matrix=mat_link)

    obj_valves = link_obj("GEO_FTYPE_Active_Exhaust_Valves", bm_valves, parent_col, mats["engine_metal"], bevel=0.0008)
    objs.append(obj_valves)
    return objs


# ----------------------------------------------------------------------------
# 42. SUBSYSTEM 42: EAD ELECTRONIC DIFFERENTIAL COOLER PUMP
# ----------------------------------------------------------------------------

def build_jaguar_ftype_differential_cooler_system(parent_col, mats):
    """
    Constructs the auxiliary cooling circuit for the rear electronic differential:
    - External 12V electric gear-driven oil circulation pump mounted on rear subframe.
    - Stainless steel braided high-pressure oil lines connecting diff casing to cooler.
    - Compact 4-row oil heat exchanger mounted adjacent to rear bumper airflow.
    """
    objs = []
    bm_dcool = bmesh.new()

    # Electric Pump Motor (Y = -1.450m, Z = 0.320m)
    mat_dpump = Matrix.Translation(Vector((0.260, -1.450, 0.320)))
    bmesh.ops.create_cylinder(bm_dcool, radius=0.032, depth=0.090, segments=14, matrix=mat_dpump @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Mini Oil Heat Exchanger Core (Mounted in rear aerodynamic tunnel)
    mat_dcore = Matrix.Translation(Vector((0.320, -1.820, 0.220)))
    bmesh.ops.create_cube(bm_dcool, size=1.0, matrix=mat_dcore @ Matrix.Diagonal(Vector((0.160, 0.040, 0.100, 1.0))))

    # Braided Stainless Steel Return Line
    p_pump = Vector((0.260, -1.450, 0.320))
    p_core = Vector((0.320, -1.820, 0.220))
    mid_line = (p_pump + p_core) * 0.5
    mat_line = Matrix.Translation(mid_line) @ Vector((0, 0, 1)).rotation_difference(p_core - p_pump).to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_dcool, radius=0.008, depth=(p_core - p_pump).length, segments=10, matrix=mat_line)

    obj_dcool = link_obj("GEO_FTYPE_Differential_Cooler_Pump", bm_dcool, parent_col, mats["engine_metal"], bevel=0.001)
    objs.append(obj_dcool)
    return objs


# ----------------------------------------------------------------------------
# 43. SUBSYSTEM 43: REAR BATTERY CARRIER & POWER TERMINALS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_battery_carrier(parent_col, mats):
    """
    Constructs the rear-mounted 12V AGM battery installation (50:50 weight distribution):
    - Molded polypropylene battery tray sunken into rear trunk floor.
    - Heavy-duty 95Ah AGM automotive battery case with carrying strap.
    - Positive and negative clamp terminals with red insulating safety cover.
    """
    objs = []
    bm_bat = bmesh.new()

    # Battery Location (Center right trunk floor: X = 0.240m, Y = -1.680m, Z = 0.440m)
    mat_bat = Matrix.Translation(Vector((0.240, -1.680, 0.440)))
    # Battery Main Casing
    bmesh.ops.create_cube(bm_bat, size=1.0, matrix=mat_bat @ Matrix.Diagonal(Vector((0.180, 0.320, 0.190, 1.0))))

    # Battery Hold-Down Bracket Cross-Strap
    mat_strap = mat_bat @ Matrix.Translation(Vector((0, 0, 0.100)))
    bmesh.ops.create_cube(bm_bat, size=1.0, matrix=mat_strap @ Matrix.Diagonal(Vector((0.200, 0.040, 0.015, 1.0))))

    # Positive & Negative Terminals
    mat_pos = mat_bat @ Matrix.Translation(Vector((-0.060, 0.120, 0.105)))
    bmesh.ops.create_cylinder(bm_bat, radius=0.012, depth=0.020, segments=12, matrix=mat_pos)
    mat_neg = mat_bat @ Matrix.Translation(Vector((-0.060, -0.120, 0.105)))
    bmesh.ops.create_cylinder(bm_bat, radius=0.012, depth=0.020, segments=12, matrix=mat_neg)

    obj_bat = link_obj("GEO_FTYPE_Battery_Carrier", bm_bat, parent_col, mats["satin_black"], bevel=0.001)
    objs.append(obj_bat)
    return objs
'''
