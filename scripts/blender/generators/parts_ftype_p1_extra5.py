"""
Jaguar F-Type V8 R Convertible (2010s) Phase 19: Extra Part 5
Subsystem 33: Underbody Wiring Loom & Brake Hydraulic Lines
Subsystem 34: Wheel Arch Forward Aero Spoilers & Splash Deflectors
Subsystem 35: Rear Suspension Toe Control Rods & Eccentric Hardware
Subsystem 36: Engine Bay Fluid Reservoirs & Coolant Expansion Tank
"""

PART_FTYPE_EXTRA5 = '''
# ----------------------------------------------------------------------------
# 33. SUBSYSTEM 33: UNDERBODY WIRING LOOMS & BRAKE HYDRAULIC HARDLINES
# ----------------------------------------------------------------------------

def build_jaguar_ftype_underbody_conduits(parent_col, mats):
    """
    Constructs the underbody conduit channels and hydraulic piping:
    - Main high-amperage battery power cable bundle routed along central tunnel.
    - Dual stainless steel brake hydraulic hardlines leading from ABS unit to rear brakes.
    - Fuel vapor return lines and chassis ground strap braids.
    """
    objs = []
    bm_lines = bmesh.new()

    # 1. Main High-Current Battery Power Cable Conduit (Y: -1.200m to +0.800m, Z = 0.160m)
    mat_pwr = Matrix.Translation(Vector((0.120, -0.200, 0.165)))
    bmesh.ops.create_cylinder(bm_lines, radius=0.014, depth=2.000, segments=12, matrix=mat_pwr @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Dual Brake Hydraulic Lines (Left and Right tunnel sills)
    for bx_sign in [-1.0, 1.0]:
        mat_bline = Matrix.Translation(Vector((bx_sign * 0.180, -0.100, 0.160)))
        bmesh.ops.create_cylinder(bm_lines, radius=0.006, depth=2.200, segments=10, matrix=mat_bline @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Conduit Retaining Clips (6 pairs of chassis mounting brackets)
    for clip_i in range(6):
        clip_y = (clip_i - 2.5) * 0.380
        mat_clip = Matrix.Translation(Vector((0.150, clip_y, 0.165)))
        bmesh.ops.create_cube(bm_lines, size=1.0, matrix=mat_clip @ Matrix.Diagonal(Vector((0.045, 0.020, 0.025, 1.0))))

    obj_lines = link_obj("GEO_FTYPE_Underbody_Conduit_Bundle", bm_lines, parent_col, mats["satin_black"], bevel=0.0005)
    objs.append(obj_lines)
    return objs


# ----------------------------------------------------------------------------
# 34. SUBSYSTEM 34: WHEEL ARCH AERO SPOILERS & SPLASH DEFLECTORS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_wheel_arch_spoilers(parent_col, mats):
    """
    Constructs the small vertical aerodynamic tire spat spoilers ahead of each wheel:
    - Front wheel arch forward lower air deflectors diverting turbulence away from rotating tire faces.
    - Rear wheel arch forward stone guards protecting rear quarter paintwork.
    """
    objs = []
    bm_spats = bmesh.new()

    # 1. Front Tire Air Spats (Y = +1.650m, X = +/- 0.810m, Z = 0.140m)
    for fx_sign in [-1.0, 1.0]:
        mat_fspat = Matrix.Translation(Vector((fx_sign * 0.810, 1.650, 0.150)))
        bmesh.ops.create_cube(bm_spats, size=1.0, matrix=mat_fspat @ Matrix.Diagonal(Vector((0.015, 0.080, 0.065, 1.0))))

    # 2. Rear Tire Air Spats & Stone Guards (Y = -0.980m, X = +/- 0.840m, Z = 0.145m)
    for rx_sign in [-1.0, 1.0]:
        mat_rspat = Matrix.Translation(Vector((rx_sign * 0.840, -0.980, 0.155)))
        bmesh.ops.create_cube(bm_spats, size=1.0, matrix=mat_rspat @ Matrix.Diagonal(Vector((0.015, 0.090, 0.075, 1.0))))

    obj_spats = link_obj("GEO_FTYPE_Wheel_Arch_Aero_Spats", bm_spats, parent_col, mats["gloss_black"], bevel=0.0008)
    objs.append(obj_spats)
    return objs


# ----------------------------------------------------------------------------
# 35. SUBSYSTEM 35: REAR SUSPENSION TOE CONTROL RODS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_rear_toe_links(parent_col, mats):
    """
    Constructs the rear multi-link independent suspension toe control rods:
    - Forged aluminum toe control links with threaded turnbuckle adjusters.
    - Subframe eccentric alignment cam bolts for dynamic bump-steer suppression.
    """
    objs = []
    bm_toe = bmesh.new()

    for tx_sign in [-1.0, 1.0]:
        p_sub = Vector((tx_sign * 0.320, -1.450, 0.280))
        p_hub = Vector((tx_sign * 0.680, -1.410, 0.310))
        mid_toe = (p_sub + p_hub) * 0.5
        mat_toe = Matrix.Translation(mid_toe) @ Vector((0, 0, 1)).rotation_difference(p_hub - p_sub).to_matrix().to_4x4()

        # Tubular Rod Body
        bmesh.ops.create_cylinder(bm_toe, radius=0.014, depth=(p_hub - p_sub).length, segments=12, matrix=mat_toe)
        # Hex Turnbuckle Adjuster Collar
        bmesh.ops.create_cylinder(bm_toe, radius=0.020, depth=0.040, segments=6, matrix=mat_toe @ Matrix.Translation(Vector((0, 0, 0.020))))
        # Inner Eccentric Alignment Bolt Head
        mat_ecc = Matrix.Translation(p_sub)
        bmesh.ops.create_cylinder(bm_toe, radius=0.024, depth=0.035, segments=12, matrix=mat_ecc @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_toe = link_obj("GEO_FTYPE_Rear_Toe_Control_Links", bm_toe, parent_col, mats["alloy"], bevel=0.001)
    objs.append(obj_toe)
    return objs


# ----------------------------------------------------------------------------
# 36. SUBSYSTEM 36: ENGINE BAY FLUID RESERVOIRS & EXPANSION TANK
# ----------------------------------------------------------------------------

def build_jaguar_ftype_engine_bay_reservoirs(parent_col, mats):
    """
    Constructs the engine bay ancillary fluid containers:
    - Pressurized coolant expansion tank with pressure relief cap.
    - Dual-circuit brake master cylinder fluid reservoir and vacuum booster drum.
    - Windshield washer fluid reservoir neck with bright blue cap.
    """
    objs = []
    bm_res = bmesh.new()

    # 1. Coolant Pressurized Expansion Tank (Passenger side cowl corner: X = 0.520m, Y = 0.950m, Z = 0.720m)
    mat_exp = Matrix.Translation(Vector((0.520, 0.950, 0.720)))
    bmesh.ops.create_cube(bm_res, size=1.0, matrix=mat_exp @ Matrix.Diagonal(Vector((0.180, 0.220, 0.140, 1.0))))
    # Pressure Cap
    bmesh.ops.create_cylinder(bm_res, radius=0.030, depth=0.025, segments=16, matrix=mat_exp @ Matrix.Translation(Vector((0, 0, 0.080))))

    # 2. Brake Booster Drum & Master Cylinder Reservoir (Driver side cowl: X = -0.480m, Y = 0.920m, Z = 0.680m)
    mat_boost = Matrix.Translation(Vector((-0.480, 0.920, 0.680)))
    # Vacuum Booster Drum
    bmesh.ops.create_cylinder(bm_res, radius=0.110, depth=0.080, segments=20, matrix=mat_boost @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    # Translucent Fluid Reservoir
    mat_bres = mat_boost @ Matrix.Translation(Vector((0, 0.090, 0.060)))
    bmesh.ops.create_cube(bm_res, size=1.0, matrix=mat_bres @ Matrix.Diagonal(Vector((0.080, 0.140, 0.075, 1.0))))

    # 3. Windshield Washer Filler Neck & Cap (Forward corner: X = -0.650m, Y = 1.720m, Z = 0.640m)
    mat_wash = Matrix.Translation(Vector((-0.650, 1.720, 0.640)))
    bmesh.ops.create_cylinder(bm_res, radius=0.024, depth=0.080, segments=14, matrix=mat_wash)

    obj_res = link_obj("GEO_FTYPE_Engine_Bay_Reservoirs", bm_res, parent_col, mats["satin_black"], bevel=0.001)
    objs.append(obj_res)
    return objs
'''
