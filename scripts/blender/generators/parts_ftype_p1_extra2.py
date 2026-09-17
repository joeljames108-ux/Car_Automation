"""
Jaguar F-Type V8 R Convertible (2010s) Phase 19: Extra Part 2
Subsystem 24: EPAS Steering Rack, Tie Rods & Steering Column
Subsystem 25: Forged Aluminum Steering Knuckles & Wheel Bearings
Subsystem 26: Underbody High-Downforce Diffuser Tunnels & Strakes
"""

PART_FTYPE_EXTRA2 = '''
# ----------------------------------------------------------------------------
# 24. SUBSYSTEM 24: EPAS ELECTRIC STEERING RACK & TIE RODS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_steering_rack(parent_col, mats):
    """
    Constructs the rapid-ratio electric power-assisted steering gear:
    - Cast aluminum steering rack housing mounted low ahead of front axle.
    - Electric servo drive motor and recirculating ball transfer case.
    - Left and right articulated steering tie rods with threaded adjusters and ball joints.
    - Intermediate steering column shaft with universal joints connecting to firewall.
    """
    objs = []
    bm_steer = bmesh.new()

    # 1. Main Steering Rack Housing (Axle Y = +1.311m, Z = 0.220m)
    mat_rack = Matrix.Translation(Vector((0.0, 1.380, 0.225)))
    bmesh.ops.create_cylinder(bm_steer, radius=0.034, depth=0.780, segments=16, matrix=mat_rack @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Electric Power Steering Servo Motor (Offset on driver side)
    mat_motor = mat_rack @ Matrix.Translation(Vector((-0.180, -0.060, 0.040)))
    bmesh.ops.create_cylinder(bm_steer, radius=0.055, depth=0.180, segments=18, matrix=mat_motor @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Pinion Gearbox Housing
    mat_pinion = mat_rack @ Matrix.Translation(Vector((-0.240, 0.020, 0.050)))
    bmesh.ops.create_cube(bm_steer, size=1.0, matrix=mat_pinion @ Matrix.Diagonal(Vector((0.090, 0.090, 0.120, 1.0))))

    # 2. Left & Right Articulated Tie Rods (Connecting rack to steering knuckles)
    for tx_sign in [-1.0, 1.0]:
        p_in = Vector((tx_sign * 0.390, 1.380, 0.225))
        p_out = Vector((tx_sign * 0.720, 1.330, 0.240))
        mid_t = (p_in + p_out) * 0.5
        mat_tie = Matrix.Translation(mid_t) @ Vector((0, 0, 1)).rotation_difference(p_out - p_in).to_matrix().to_4x4()

        # Inner Accordion Rubber Bellows Boot
        bmesh.ops.create_cylinder(bm_steer, radius=0.032, depth=0.120, segments=14, matrix=mat_tie @ Matrix.Translation(Vector((0, 0, -0.100))))
        # Steel Tie Rod Shaft
        bmesh.ops.create_cylinder(bm_steer, radius=0.012, depth=(p_out - p_in).length, segments=12, matrix=mat_tie)
        # Outer Ball Joint Socket
        mat_ball = Matrix.Translation(p_out)
        bmesh.ops.create_cylinder(bm_steer, radius=0.022, depth=0.040, segments=12, matrix=mat_ball)

    # 3. Intermediate Steering Column Shaft (To firewall)
    p_rack = Vector((-0.240, 1.380, 0.280))
    p_cowl = Vector((-0.340, 0.850, 0.620))
    mid_col = (p_rack + p_cowl) * 0.5
    mat_col = Matrix.Translation(mid_col) @ Vector((0, 0, 1)).rotation_difference(p_cowl - p_rack).to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_steer, radius=0.016, depth=(p_cowl - p_rack).length, segments=12, matrix=mat_col)

    obj_steer = link_obj("GEO_FTYPE_EPAS_Steering_Assembly", bm_steer, parent_col, mats["engine_metal"], bevel=0.001)
    objs.append(obj_steer)
    return objs


# ----------------------------------------------------------------------------
# 25. SUBSYSTEM 25: FORGED ALUMINUM STEERING KNUCKLES & WHEEL HUBS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_uprights_and_hubs(parent_col, mats):
    """
    Constructs high-strength hollow cast aluminum suspension uprights / knuckles:
    - Front steering knuckles with integral brake caliper mounting bosses.
    - Rear wheel hub carriers supporting dual wishbone pivots and integral toe link ear.
    - Sealed dual-row angular contact wheel bearing cartridges with 5-lug drive flanges.
    """
    objs = []
    bm_knuckles = bmesh.new()

    knuckle_locations = [
        ("Front", 1.311, 0.720, True),
        ("Rear", -1.311, 0.740, False),
    ]

    for kn_name, ky, kx, is_front in knuckle_locations:
        for kx_sign in [-1.0, 1.0]:
            x_pos = kx_sign * kx
            mat_kn = Matrix.Translation(Vector((x_pos, ky, 0.343)))

            # 1. Main Upright Vertical Backbone (Connecting upper and lower ball joints)
            bmesh.ops.create_cube(bm_knuckles, size=1.0, matrix=mat_kn @ Matrix.Diagonal(Vector((0.075, 0.080, 0.280, 1.0))))

            # 2. Wheel Hub Spindle & Bearing Housing
            mat_hub = mat_kn @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()
            bmesh.ops.create_cylinder(bm_knuckles, radius=0.062, depth=0.090, segments=18, matrix=mat_hub)

            # 3. Brake Caliper Radial Mounting Bosses (Rigid bracket ears)
            mat_cboss1 = mat_kn @ Matrix.Translation(Vector((0, 0.110, 0.080)))
            bmesh.ops.create_cube(bm_knuckles, size=1.0, matrix=mat_cboss1 @ Matrix.Diagonal(Vector((0.040, 0.045, 0.045, 1.0))))
            mat_cboss2 = mat_kn @ Matrix.Translation(Vector((0, 0.110, -0.080)))
            bmesh.ops.create_cube(bm_knuckles, size=1.0, matrix=mat_cboss2 @ Matrix.Diagonal(Vector((0.040, 0.045, 0.045, 1.0))))

            # 4. Wheel Hub Drive Flange Face (Mating against brake rotor hat)
            mat_flange = mat_hub @ Matrix.Translation(Vector((0, 0, kx_sign * 0.042)))
            bmesh.ops.create_cylinder(bm_knuckles, radius=0.076, depth=0.012, segments=20, matrix=mat_flange)

    obj_knuckles = link_obj("GEO_FTYPE_Suspension_Uprights_and_Hubs", bm_knuckles, parent_col, mats["alloy"], bevel=0.0012)
    objs.append(obj_knuckles)
    return objs


# ----------------------------------------------------------------------------
# 26. SUBSYSTEM 26: REAR HIGH-DOWNFORCE DIFFUSER TUNNELS & STRAKES
# ----------------------------------------------------------------------------

def build_jaguar_ftype_underfloor_aero_tunnels(parent_col, mats):
    """
    Constructs the underbody high-downforce aerodynamic ground effect channels:
    - Expanding Venturi diffuser tunnels starting at rear axle centerline and expanding upward.
    - 4 longitudinal aerodynamic flow-straightening vertical strakes.
    - Differential cooling air scoop diverting high-speed underbody air to rear axle finning.
    """
    objs = []
    bm_tunnels = bmesh.new()

    # 1. Venturi Expansion Ramps (Y: -1.311m to -2.180m, expanding upward from Z = 0.140m to 0.280m)
    mat_vent = Matrix.Translation(Vector((0.0, -1.750, 0.210))) @ Euler((math.radians(8), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_tunnels, size=1.0, matrix=mat_vent @ Matrix.Diagonal(Vector((1.120, 0.860, 0.018, 1.0))))

    # 2. 4 Longitudinal Flow Separation Strakes
    for st_x in [-0.420, -0.150, 0.150, 0.420]:
        mat_strake = mat_vent @ Matrix.Translation(Vector((st_x, 0, -0.045)))
        bmesh.ops.create_cube(bm_tunnels, size=1.0, matrix=mat_strake @ Matrix.Diagonal(Vector((0.014, 0.840, 0.080, 1.0))))

    # 3. Differential Cooling NACA Inflow Duct
    mat_naca = Matrix.Translation(Vector((0.0, -1.150, 0.135)))
    bmesh.ops.create_cube(bm_tunnels, size=1.0, matrix=mat_naca @ Matrix.Diagonal(Vector((0.180, 0.260, 0.025, 1.0))))

    obj_tunnels = link_obj("GEO_FTYPE_Underbody_Diffuser_Tunnels", bm_tunnels, parent_col, mats["gloss_black"], bevel=0.001)
    objs.append(obj_tunnels)
    return objs
'''
