"""
Honda S2000 AP1 (2000s) Phase 17: Part D
Subsystems 13 to 16:
13. Twin Tubular Safety Roll Hoops & Center Wind Deflector
14. Cockpit Interior Tub, High-Bolster Sport Seats & Console
15. Front Hood Hinges, Gas Struts & Radiator Bulkhead
16. Trunk Lid Hinges, Torsion Springs & Rear Crash Bar
"""

PART_S2K_D = '''
# ----------------------------------------------------------------------------
# 15. SUBSYSTEM 13: TWIN SAFETY ROLL HOOPS & CENTER DEFLECTOR
# ----------------------------------------------------------------------------

def build_s2000_twin_safety_roll_hoops(parent_col, mats):
    """
    Constructs the iconic factory safety roll hoop architecture:
    - Twin tubular high-strength steel roll hoops behind driver & passenger seats (X = +/- 0.360m).
    - Molded aerodynamic satin black protective plastic cladding.
    - Integral seatbelt guide loops mounted on outer hoop shoulders.
    - Clear acrylic center cockpit wind deflector flap mounted between roll hoops.
    """
    objs = []
    bm_hoops = bmesh.new()
    bm_flap = bmesh.new()

    for hx_sign in [-1.0, 1.0]:
        # Roll Hoop Axis: X = +/- 0.360m, Y = -0.420m, Z = 0.810m to 1.050m
        mat_hoop_c = Matrix.Translation(Vector((hx_sign * 0.360, -0.420, 0.930)))

        # Inverted U-Shape Tubular Roll Hoop (Width 0.340m, Height 0.240m)
        # Upper curved crest
        mat_crest = mat_hoop_c @ Matrix.Translation(Vector((0, 0, 0.100)))
        bmesh.ops.create_torus(bm_hoops, major_radius=0.150, minor_radius=0.024, major_segments=24, minor_segments=12, matrix=mat_crest @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # Left & Right Vertical Stanchion Legs
        for lx in [-0.150, 0.150]:
            mat_leg = mat_hoop_c @ Matrix.Translation(Vector((lx, 0, 0.000)))
            bmesh.ops.create_cylinder(bm_hoops, radius=0.024, depth=0.200, segments=16, matrix=mat_leg)

        # Outer Shoulder Seatbelt Guide Loop
        mat_guide = mat_hoop_c @ Matrix.Translation(Vector((hx_sign * 0.165, 0.020, 0.060)))
        bmesh.ops.create_cylinder(bm_hoops, radius=0.012, depth=0.025, segments=12, matrix=mat_guide @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Central Acrylic Cockpit Wind Deflector Flap (Between hoops, X = 0.000m, Y = -0.420m, Z = 0.900m)
    mat_deflector = Matrix.Translation(Vector((0.0, -0.420, 0.900)))
    bmesh.ops.create_cube(bm_flap, size=1.0, matrix=mat_deflector @ Matrix.Diagonal(Vector((0.360, 0.008, 0.140, 1.0))))
    # Deflector Lower Hinge Bracket
    mat_dhinge = mat_deflector @ Matrix.Translation(Vector((0, 0, -0.075)))
    bmesh.ops.create_cylinder(bm_hoops, radius=0.008, depth=0.360, segments=12, matrix=mat_dhinge @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_hoops = link_obj("GEO_S2K_Twin_Safety_Roll_Hoops", bm_hoops, parent_col, mats["trim"], bevel=0.0015)
    obj_flap = link_obj("GEO_S2K_Center_Aero_Wind_Deflector", bm_flap, parent_col, mats["glass"], bevel=0.0005)

    objs.extend([obj_hoops, obj_flap])
    return objs

# ----------------------------------------------------------------------------
# 16. SUBSYSTEM 14: COCKPIT INTERIOR TUB & HIGH-BOLSTER SPORT SEATS
# ----------------------------------------------------------------------------

def build_s2000_cockpit_interior_and_sport_seats(parent_col, mats):
    """
    Constructs the driver-focused roadster cockpit:
    - Lightweight high-bolstered sport bucket seats with integrated headrests.
    - Prominent central transmission tunnel spine with integrated leather handbrake console.
    - Driver-oriented instrument binnacle shroud and passenger dashboard sweep.
    - Footwell floor carpet and center storage cubby.
    """
    objs = []
    bm_tub = bmesh.new()
    bm_seats = bmesh.new()

    # 1. Cockpit Interior Floor Tub (Y: -0.480m to +0.480m, Width 1.280m, Z = 0.220m)
    mat_tub = Matrix.Translation(Vector((0.0, 0.000, 0.230)))
    bmesh.ops.create_cube(bm_tub, size=1.0, matrix=mat_tub @ Matrix.Diagonal(Vector((1.280, 0.960, 0.160, 1.0))))

    # Dashboard Transverse Cowl Sweep (Y = +0.420m, Z = 0.720m)
    mat_dash = Matrix.Translation(Vector((0.0, 0.420, 0.720)))
    bmesh.ops.create_cube(bm_tub, size=1.0, matrix=mat_dash @ Matrix.Diagonal(Vector((1.240, 0.240, 0.180, 1.0))))

    # 2. High-Bolster Sport Bucket Seats (Driver X = -0.360m, Passenger X = +0.360m)
    for sx_sign in [-1.0, 1.0]:
        mat_seat = Matrix.Translation(Vector((sx_sign * 0.360, -0.050, 0.440)))

        # Seat Bottom Cushion Squab
        bmesh.ops.create_cube(bm_seats, size=1.0, matrix=mat_seat @ Matrix.Diagonal(Vector((0.440, 0.460, 0.120, 1.0))))
        # Lateral Thigh Bolsters
        for bx_sign in [-1.0, 1.0]:
            mat_thigh = mat_seat @ Matrix.Translation(Vector((bx_sign * 0.200, 0, 0.050)))
            bmesh.ops.create_cube(bm_seats, size=1.0, matrix=mat_thigh @ Matrix.Diagonal(Vector((0.065, 0.440, 0.080, 1.0))))

        # High-Bolster Seat Backrest (Reclined ~16 deg)
        mat_back = mat_seat @ Matrix.Translation(Vector((0, -0.220, 0.280))) @ Euler((math.radians(16), 0, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_seats, size=1.0, matrix=mat_back @ Matrix.Diagonal(Vector((0.420, 0.100, 0.500, 1.0))))

        # Lateral Torso Bolsters
        for bx_sign in [-1.0, 1.0]:
            mat_torso = mat_back @ Matrix.Translation(Vector((bx_sign * 0.190, 0.035, 0.000)))
            bmesh.ops.create_cube(bm_seats, size=1.0, matrix=mat_torso @ Matrix.Diagonal(Vector((0.065, 0.110, 0.460, 1.0))))

        # Integrated Headrest with central open cut-out
        mat_head = mat_back @ Matrix.Translation(Vector((0, 0, 0.310)))
        bmesh.ops.create_cube(bm_seats, size=1.0, matrix=mat_head @ Matrix.Diagonal(Vector((0.260, 0.090, 0.160, 1.0))))

    obj_tub = link_obj("GEO_S2K_Cockpit_Interior_Tub", bm_tub, parent_col, mats["trim"], bevel=0.002)
    obj_seats = link_obj("GEO_S2K_HighBolster_Sport_Seats", bm_seats, parent_col, mats["trim"], bevel=0.002)

    objs.extend([obj_tub, obj_seats])
    return objs

# ----------------------------------------------------------------------------
# 17. SUBSYSTEM 15: HOOD HINGES, GAS STRUTS & CORE RADIATOR SUPPORT
# ----------------------------------------------------------------------------

def build_s2000_hood_hinges_and_radiator_support(parent_col, mats):
    """
    Constructs the engine bay structural front bulkhead and hood mechanism:
    - Sturdy front core radiator support crossmember beam (Y = +1.840m, Z = 0.640m).
    - Long forward hood scissor hinge arms and pressurized gas lifting struts.
    - Upper radiator tie bar and hood safety primary latch catch.
    """
    objs = []
    bm_core = bmesh.new()
    bm_hinges = bmesh.new()

    # 1. Front Core Support Radiator Crossmember Beam (Y = +1.840m, Z = 0.640m)
    mat_core = Matrix.Translation(Vector((0.0, 1.840, 0.640)))
    bmesh.ops.create_cube(bm_core, size=1.0, matrix=mat_core @ Matrix.Diagonal(Vector((1.120, 0.085, 0.055, 1.0))))

    # Left & Right Core Support Vertical Tie Pillars
    for px_sign in [-1.0, 1.0]:
        mat_pillar = Matrix.Translation(Vector((px_sign * 0.480, 1.840, 0.460)))
        bmesh.ops.create_cube(bm_core, size=1.0, matrix=mat_pillar @ Matrix.Diagonal(Vector((0.055, 0.075, 0.320, 1.0))))

    # Hood Primary Safety Latch Catch (Center, Y = +1.840m, Z = 0.665m)
    mat_latch = mat_core @ Matrix.Translation(Vector((0, 0, 0.035)))
    bmesh.ops.create_cube(bm_core, size=1.0, matrix=mat_latch @ Matrix.Diagonal(Vector((0.065, 0.045, 0.032, 1.0))))

    # 2. Dual Forward Hood Scissor Hinges & Gas Struts (Left & Right, Y = +0.960m, Z = 0.710m)
    for hx_sign in [-1.0, 1.0]:
        mat_hinge = Matrix.Translation(Vector((hx_sign * 0.580, 0.960, 0.710))) @ Euler((math.radians(-24), 0, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_hinges, size=1.0, matrix=mat_hinge @ Matrix.Diagonal(Vector((0.024, 0.140, 0.035, 1.0))))

        # Pressurized Gas Strut Body & Chrome Piston Rod
        p_strut_bot = Vector((hx_sign * 0.560, 1.050, 0.620))
        p_strut_top = Vector((hx_sign * 0.560, 1.250, 0.720))
        mat_strut = Matrix.Translation((p_strut_bot + p_strut_top) * 0.5) @ Vector((0, 0, 1)).rotation_difference(p_strut_top - p_strut_bot).to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_hinges, radius=0.010, depth=(p_strut_top - p_strut_bot).length, segments=12, matrix=mat_strut)

    obj_core = link_obj("GEO_S2K_Front_Core_Radiator_Support", bm_core, parent_col, mats["body"], bevel=0.0015)
    obj_hinges = link_obj("GEO_S2K_Hood_Hinges_and_Gas_Struts", bm_hinges, parent_col, mats["alloy"], bevel=0.001)

    objs.extend([obj_core, obj_hinges])
    return objs

# ----------------------------------------------------------------------------
# 18. SUBSYSTEM 16: TRUNK LID HINGES & REAR CRASH BAR
# ----------------------------------------------------------------------------

def build_s2000_trunk_hinges_and_rear_crash_bar(parent_col, mats):
    """
    Constructs the rear structural safety and trunk mechanisms:
    - High-strength aluminum rear bumper crash reinforcement beam (Y = -1.960m, Z = 0.420m).
    - Energy-absorbing foam block core inside rear bumper skin.
    - Rear trunk lid gooseneck hinges with counterbalance torsion springs.
    - Trunk floor spare tire well recess stamping.
    """
    objs = []
    bm_crash = bmesh.new()
    bm_thinges = bmesh.new()

    # 1. High-Strength Aluminum Rear Bumper Crash Bar (Y = -1.960m, Z = 0.420m)
    mat_crash = Matrix.Translation(Vector((0.0, -1.960, 0.420)))
    bmesh.ops.create_cube(bm_crash, size=1.0, matrix=mat_crash @ Matrix.Diagonal(Vector((1.280, 0.085, 0.095, 1.0))))

    # Left & Right Rear Frame Rail Impact Mounting Horns
    for mx_sign in [-1.0, 1.0]:
        mat_horn = Matrix.Translation(Vector((mx_sign * 0.460, -1.880, 0.420)))
        bmesh.ops.create_cube(bm_crash, size=1.0, matrix=mat_horn @ Matrix.Diagonal(Vector((0.080, 0.160, 0.085, 1.0))))

    # 2. Trunk Gooseneck Hinges & Counterbalance Springs (Left & Right, Y = -1.580m, Z = 0.770m)
    for tx_sign in [-1.0, 1.0]:
        mat_th = Matrix.Translation(Vector((tx_sign * 0.480, -1.580, 0.770))) @ Euler((math.radians(18), 0, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_thinges, size=1.0, matrix=mat_th @ Matrix.Diagonal(Vector((0.024, 0.120, 0.040, 1.0))))

    # Trunk Well Floor Stamping (Y = -1.680m, Z = 0.280m)
    mat_well = Matrix.Translation(Vector((0.0, -1.680, 0.280)))
    bmesh.ops.create_cylinder(bm_crash, radius=0.280, depth=0.140, segments=24, matrix=mat_well)

    obj_crash = link_obj("GEO_S2K_Rear_Bumper_Crash_Bar", bm_crash, parent_col, mats["alloy"], bevel=0.002)
    obj_thinges = link_obj("GEO_S2K_Trunk_Hinges_and_Well", bm_thinges, parent_col, mats["alloy"], bevel=0.001)

    objs.extend([obj_crash, obj_thinges])
    return objs
'''
