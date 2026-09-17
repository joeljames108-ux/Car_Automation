# Subsystems 13 to 16 for Porsche 911 (993) Carrera Cabriolet Phase 1 (High-Density CAD)

PART_D = '''
# ----------------------------------------------------------------------------
# 16. SUBSYSTEM 13: WINDSHIELD COWL LOUVERS & PANTOGRAPH WIPERS
# ----------------------------------------------------------------------------

def build_993_windshield_cowl_louvers_and_monoblade_wipers(parent_col, mats):
    """
    Constructs windshield cowl intake ventilation and wiper arms:
    - Stamped steel cowl intake plenum with 18 ventilation slots below windshield base.
    - Dual articulated pantograph windshield wiper arms with curved aerofoil spoilers.
    - Natural rubber squeegee wiper blades parked horizontally along right side.
    - Dual heated windshield washer fluid spray jet nozzles on hood.
    - A-pillar rain water drainage diverter channels.
    """
    objs = []
    bm_cowl = bmesh.new()

    # Cowl Plenum Base
    mat_cowl_base = Matrix.Translation(Vector((0.0, 0.540, 0.790)))
    bmesh.ops.create_cube(bm_cowl, size=1.0, matrix=mat_cowl_base @ Matrix.Diagonal(Vector((1.180, 0.080, 0.018, 1.0))))

    # 18 Air Intake Ventilation Slots
    for slot in range(18):
        sx = -0.510 + slot * 0.060
        mat_slot = Matrix.Translation(Vector((sx, 0.540, 0.795)))
        bmesh.ops.create_cube(bm_cowl, size=1.0, matrix=mat_slot @ Matrix.Diagonal(Vector((0.040, 0.045, 0.012, 1.0))))

    # Wiper Arm Pivots & Articulated Arms (Driver left, Passenger right)
    for wx, wy in [(-0.350, 0.500), (0.150, 0.480)]:
        mat_pivot = Matrix.Translation(Vector((wx, wy, 0.805)))
        bmesh.ops.create_cylinder(bm_cowl, radius=0.014, depth=0.024, segments=12, matrix=mat_pivot)

        # Wiper Arm Main Beam with Integrated Aerodynamic Deflector Foil
        mat_arm = Matrix.Translation(Vector((wx + 0.180, wy - 0.040, 0.835))) @ Euler((0, math.radians(-18), math.radians(24)), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_cowl, size=1.0, matrix=mat_arm @ Matrix.Diagonal(Vector((0.420, 0.012, 0.008, 1.0))))

        # Windshield Wiper Rubber Squeegee Blade
        mat_blade = mat_arm @ Matrix.Translation(Vector((0.080, -0.012, -0.010)))
        bmesh.ops.create_cube(bm_cowl, size=1.0, matrix=mat_blade @ Matrix.Diagonal(Vector((0.480, 0.006, 0.014, 1.0))))

        # Pressure Claw Clips (4 spring claws holding rubber insert)
        for claw_i in [-0.180, -0.060, 0.060, 0.180]:
            mat_claw = mat_blade @ Matrix.Translation(Vector((claw_i, 0, 0.008)))
            bmesh.ops.create_cube(bm_cowl, size=1.0, matrix=mat_claw @ Matrix.Diagonal(Vector((0.018, 0.010, 0.012, 1.0))))

    # Dual Heated Windshield Washer Fluid Spray Nozzles (Mounted on rear edge of frunk lid)
    for nx_sign in [-1.0, 1.0]:
        mat_nozzle = Matrix.Translation(Vector((nx_sign * 0.280, 0.580, 0.775)))
        bmesh.ops.create_cube(bm_cowl, size=1.0, matrix=mat_nozzle @ Matrix.Diagonal(Vector((0.024, 0.032, 0.014, 1.0))))
        # Twin Fluid Spray Orifice Holes
        for ox in [-0.005, 0.005]:
            mat_orifice = mat_nozzle @ Matrix.Translation(Vector((ox, -0.014, 0.004)))
            bmesh.ops.create_cylinder(bm_cowl, radius=0.002, depth=0.006, segments=6, matrix=mat_orifice)

    # A-Pillar Rain Deflector Mouldings (Running up windshield side frames)
    for ax_sign in [-1.0, 1.0]:
        mat_gutter = Matrix.Translation(Vector((ax_sign * 0.635, 0.280, 0.980))) @ Euler((math.radians(-32), ax_sign * math.radians(14), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_cowl, size=1.0, matrix=mat_gutter @ Matrix.Diagonal(Vector((0.008, 0.014, 0.640, 1.0))))

    obj_cowl = link_obj("GEO_993_Windshield_Cowl_Wipers", bm_cowl, parent_col, mats["trim"], bevel=0.001)
    objs.append(obj_cowl)
    return objs

# ----------------------------------------------------------------------------
# 17. SUBSYSTEM 14: REAR RETRACTABLE SPOILER MECHANISM & GRILLE
# ----------------------------------------------------------------------------

def build_993_rear_retractable_spoiler_mechanism_and_grille(parent_col, mats):
    """
    Constructs the speed-sensitive motorized rear decklid spoiler assembly:
    - Speed-sensitive motorized rear decklid spoiler assembly.
    - Dual horizontal air intake grilles with black anodized louvers feeding engine fan.
    - Flexible accordion rubber expansion bellows bridging spoiler frame and decklid.
    - Electric drive motor, reduction gearbox and screw jack actuation drive.
    - Emergency manual retraction screw socket with rubber weather cap.
    """
    objs = []
    bm_sp = bmesh.new()

    # Recessed Spoiler Well Frame (Retracted flush position)
    mat_well = Matrix.Translation(Vector((0.0, -1.680, 0.760))) @ Euler((math.radians(-14), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_sp, size=1.0, matrix=mat_well @ Matrix.Diagonal(Vector((0.920, 0.440, 0.035, 1.0))))

    # Retractable Spoiler Lid Upper Aerodynamic Blade
    mat_blade = Matrix.Translation(Vector((0.0, -1.680, 0.782))) @ Euler((math.radians(-14), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_sp, size=1.0, matrix=mat_blade @ Matrix.Diagonal(Vector((0.900, 0.420, 0.022, 1.0))))

    # Trailing Edge Aerodynamic Gurney Lip Flap
    mat_gurney = mat_blade @ Matrix.Translation(Vector((0.0, -0.205, 0.012)))
    bmesh.ops.create_cube(bm_sp, size=1.0, matrix=mat_gurney @ Matrix.Diagonal(Vector((0.880, 0.012, 0.016, 1.0))))

    # Horizontal Engine Cooling Grille Louvers (14 louvers feeding boxer top-mounted fan)
    for louver in range(14):
        ly = -1.500 - louver * 0.024
        mat_louver = Matrix.Translation(Vector((0.0, ly, 0.792 - louver * 0.006)))
        bmesh.ops.create_cube(bm_sp, size=1.0, matrix=mat_louver @ Matrix.Diagonal(Vector((0.780, 0.014, 0.008, 1.0))))

    # Flexible Rubber Expansion Accordion Bellows (Left & Right side skirts)
    for bx_sign in [-1.0, 1.0]:
        mat_bellows = Matrix.Translation(Vector((bx_sign * 0.440, -1.680, 0.750))) @ Euler((math.radians(-14), 0, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_sp, size=1.0, matrix=mat_bellows @ Matrix.Diagonal(Vector((0.024, 0.400, 0.045, 1.0))))

    # Electric Drive Actuator Motor & Reduction Worm Gearbox
    mat_motor = Matrix.Translation(Vector((-0.180, -1.620, 0.710)))
    bmesh.ops.create_cylinder(bm_sp, radius=0.028, depth=0.085, segments=16, matrix=mat_motor @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Dual Screw Jack Lift Rams (Left & Right extending lifting posts)
    for rx_sign in [-1.0, 1.0]:
        mat_jack_post = Matrix.Translation(Vector((rx_sign * 0.320, -1.700, 0.720)))
        bmesh.ops.create_cylinder(bm_sp, radius=0.012, depth=0.065, segments=12, matrix=mat_jack_post)

    # Emergency Manual Retraction Drive Socket & Cap
    mat_manual = Matrix.Translation(Vector((0.180, -1.620, 0.765)))
    bmesh.ops.create_cylinder(bm_sp, radius=0.009, depth=0.015, segments=8, matrix=mat_manual)

    obj_sp = link_obj("GEO_993_Retractable_Rear_Spoiler_Grille", bm_sp, parent_col, mats["trim"], bevel=0.001)
    objs.append(obj_sp)
    return objs

# ----------------------------------------------------------------------------
# 18. SUBSYSTEM 15: COCKPIT INTERIOR TUB, SPORTS SEATS & DASHBOARD
# ----------------------------------------------------------------------------

def build_993_cockpit_interior_tub_and_sports_seats(parent_col, mats):
    """
    Constructs the cockpit tub, ergonomic sports bucket seats and dashboard:
    - Floorpan carpet tub lining cockpit interior (X: -0.65 to +0.65, Y: +0.40 to -0.65).
    - Driver & passenger high-bolster sport bucket seats with contoured headrests.
    - Center console tunnel with 6-speed manual leather shift boot and handbrake lever.
    - 3-Spoke sport steering wheel with embossed Porsche crest horn pad.
    - 5 Classic overlapping VDO instrument binnacle dials (Tachometer centered).
    - Floor-hinged pedal box (Clutch, Brake, Throttle organ pedal).
    - Front 3-point inertia reel safety belts and red release receivers.
    - Rear folding +2 jump seats with leatherette retaining straps.
    """
    objs = []
    bm_cockpit = bmesh.new()

    # Cockpit Floor Carpet Tub
    mat_floor_tub = Matrix.Translation(Vector((0.0, -0.100, 0.280)))
    bmesh.ops.create_cube(bm_cockpit, size=1.0, matrix=mat_floor_tub @ Matrix.Diagonal(Vector((1.240, 1.050, 0.180, 1.0))))

    # Center Transmission Tunnel
    mat_tunnel = Matrix.Translation(Vector((0.0, -0.100, 0.380)))
    bmesh.ops.create_cube(bm_cockpit, size=1.0, matrix=mat_tunnel @ Matrix.Diagonal(Vector((0.220, 1.020, 0.120, 1.0))))

    # Gear Shifter & Leather Boot
    mat_shifter_base = Matrix.Translation(Vector((0.0, 0.120, 0.460)))
    bmesh.ops.create_cone(bm_cockpit, cap_ends=True, segments=12, radius1=0.045, radius2=0.018, depth=0.065, matrix=mat_shifter_base)
    mat_knob = Matrix.Translation(Vector((0.0, 0.120, 0.525)))
    bmesh.ops.create_icosphere(bm_cockpit, subdivisions=2, radius=0.022, matrix=mat_knob)

    # Handbrake Lever with Aluminum Release Button
    mat_hb = Matrix.Translation(Vector((-0.065, -0.160, 0.440))) @ Euler((math.radians(22), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_cockpit, radius=0.011, depth=0.180, segments=12, matrix=mat_hb)
    mat_hb_btn = mat_hb @ Matrix.Translation(Vector((0, 0, 0.095)))
    bmesh.ops.create_cylinder(bm_cockpit, radius=0.006, depth=0.015, segments=8, matrix=mat_hb_btn)

    # High-Bolster Sport Bucket Seats (Driver Left, Passenger Right)
    for seat_sign, side in [(-1.0, "L"), (1.0, "R")]:
        sx = seat_sign * 0.320
        sy = -0.120

        # Seat Cushion Bottom
        mat_cushion = Matrix.Translation(Vector((sx, sy, 0.380)))
        bmesh.ops.create_cube(bm_cockpit, size=1.0, matrix=mat_cushion @ Matrix.Diagonal(Vector((0.440, 0.480, 0.110, 1.0))))

        # Lateral Thigh Bolsters
        for bx_sign in [-1.0, 1.0]:
            mat_thigh = Matrix.Translation(Vector((sx + bx_sign * 0.190, sy, 0.420)))
            bmesh.ops.create_cube(bm_cockpit, size=1.0, matrix=mat_thigh @ Matrix.Diagonal(Vector((0.070, 0.460, 0.090, 1.0))))

        # Contoured Seat Backrest (Raked at 18 degrees)
        mat_back = Matrix.Translation(Vector((sx, sy - 0.220, 0.620))) @ Euler((math.radians(-18), 0, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_cockpit, size=1.0, matrix=mat_back @ Matrix.Diagonal(Vector((0.420, 0.110, 0.480, 1.0))))

        # Lateral Torso Bolsters
        for bx_sign in [-1.0, 1.0]:
            mat_torso = mat_back @ Matrix.Translation(Vector((bx_sign * 0.180, 0.040, 0)))
            bmesh.ops.create_cube(bm_cockpit, size=1.0, matrix=mat_torso @ Matrix.Diagonal(Vector((0.065, 0.090, 0.440, 1.0))))

        # Integrated Headrest
        mat_hr = mat_back @ Matrix.Translation(Vector((0, 0, 0.300)))
        bmesh.ops.create_cube(bm_cockpit, size=1.0, matrix=mat_hr @ Matrix.Diagonal(Vector((0.260, 0.090, 0.180, 1.0))))

        # Seatbelt Receiver with Red Push Release Button
        mat_receiver = Matrix.Translation(Vector((sx - seat_sign * 0.210, sy - 0.100, 0.420)))
        bmesh.ops.create_cube(bm_cockpit, size=1.0, matrix=mat_receiver @ Matrix.Diagonal(Vector((0.028, 0.045, 0.075, 1.0))))

        # Seat Adjustment Slider Rails
        for rx_sign in [-1.0, 1.0]:
            mat_rail = Matrix.Translation(Vector((sx + rx_sign * 0.180, sy, 0.310)))
            bmesh.ops.create_cube(bm_cockpit, size=1.0, matrix=mat_rail @ Matrix.Diagonal(Vector((0.024, 0.440, 0.016, 1.0))))

    # 3-Spoke Sport Steering Wheel (Driver LHD, X = -0.320m, Y = 0.180m, Z = 0.680m)
    mat_sw_center = Matrix.Translation(Vector((-0.320, 0.180, 0.680))) @ Euler((math.radians(-28), 0, 0), 'XYZ').to_matrix().to_4x4()
    # Outer Rim Ring
    bmesh.ops.create_torus(bm_cockpit, major_radius=0.180, minor_radius=0.016, major_segments=24, minor_segments=8, matrix=mat_sw_center)
    # Center Hub Horn Pad with Embossed Crest Recess
    bmesh.ops.create_cylinder(bm_cockpit, radius=0.055, depth=0.035, segments=16, matrix=mat_sw_center @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    # 3 Steering Spokes (Left 9 o'clock, Right 3 o'clock, Bottom 6 o'clock)
    for sp_ang in [0.0, math.pi, -math.pi * 0.5]:
        mat_spoke = mat_sw_center @ Euler((0, 0, sp_ang), 'XYZ').to_matrix().to_4x4() @ Matrix.Translation(Vector((0.105, 0, 0)))
        bmesh.ops.create_cube(bm_cockpit, size=1.0, matrix=mat_spoke @ Matrix.Diagonal(Vector((0.110, 0.038, 0.012, 1.0))))

    # Steering Column Shaft
    mat_col = Matrix.Translation(Vector((-0.320, 0.280, 0.630))) @ Euler((math.radians(-28), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_cockpit, radius=0.032, depth=0.220, segments=16, matrix=mat_col @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Dashboard Binnacle & 5 Classic VDO Gauges (X: -0.580 to -0.060, Y = 0.320m, Z = 0.720m)
    # Gauges: Oil Temp/Press, Fuel/Oil Level, Center Tachometer, Speedometer, Clock
    gauge_x_coords = [-0.520, -0.420, -0.320, -0.220, -0.120]
    gauge_radii = [0.040, 0.042, 0.052, 0.048, 0.038]  # Center tachometer is largest
    for gx, gr in zip(gauge_x_coords, gauge_radii):
        mat_gauge = Matrix.Translation(Vector((gx, 0.320, 0.720))) @ Euler((math.radians(-15), 0, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_cockpit, radius=gr, depth=0.018, segments=20, matrix=mat_gauge @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Floor-Mounted German Pedal Box (Clutch Left, Brake Center, Floor-Hinged Throttle Right)
    for px, p_name in [(-0.390, "Clutch"), (-0.320, "Brake")]:
        mat_pedal = Matrix.Translation(Vector((px, 0.380, 0.320))) @ Euler((math.radians(35), 0, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_cockpit, size=1.0, matrix=mat_pedal @ Matrix.Diagonal(Vector((0.055, 0.075, 0.012, 1.0))))
        # Hanging Lever Arm
        mat_pedal_arm = mat_pedal @ Matrix.Translation(Vector((0, 0, 0.080)))
        bmesh.ops.create_cylinder(bm_cockpit, radius=0.007, depth=0.160, segments=8, matrix=mat_pedal_arm)

    # Floor-Hinged Organ Throttle Pedal
    mat_gas = Matrix.Translation(Vector((-0.240, 0.360, 0.280))) @ Euler((math.radians(45), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_cockpit, size=1.0, matrix=mat_gas @ Matrix.Diagonal(Vector((0.045, 0.140, 0.014, 1.0))))

    # Rear Folding +2 Jump Seat Pads
    for rx_sign in [-1.0, 1.0]:
        mat_rear_seat = Matrix.Translation(Vector((rx_sign * 0.280, -0.480, 0.460)))
        bmesh.ops.create_cube(bm_cockpit, size=1.0, matrix=mat_rear_seat @ Matrix.Diagonal(Vector((0.360, 0.320, 0.080, 1.0))))

    # Dashboard Lower Crash Pad
    mat_dash = Matrix.Translation(Vector((0.0, 0.340, 0.660)))
    bmesh.ops.create_cube(bm_cockpit, size=1.0, matrix=mat_dash @ Matrix.Diagonal(Vector((1.180, 0.220, 0.140, 1.0))))

    obj_cockpit = link_obj("GEO_993_Cockpit_Interior_Sports_Seats", bm_cockpit, parent_col, mats["trim"], bevel=0.002)
    objs.append(obj_cockpit)
    return objs

# ----------------------------------------------------------------------------
# 19. SUBSYSTEM 16: FRONT LUGGAGE LID HINGES & GAS STRUTS
# ----------------------------------------------------------------------------

def build_993_front_luggage_lid_hinges_and_gas_struts(parent_col, mats):
    """
    Constructs the front luggage lid (frunk) support hardware:
    - Dual front luggage lid scissor hinges at cowl base.
    - Nitrogen gas pressurized lift support struts (cylinder + chrome piston rod).
    - Hood safety latch catch and release cable mechanism.
    - Molded trunk interior perimeter rubber weatherstrip gasket.
    """
    objs = []
    bm_hinges = bmesh.new()

    for hx_sign in [-1.0, 1.0]:
        hx = hx_sign * 0.480
        hy = 0.580
        hz = 0.720

        # Scissor Hinge Pivot Bracket
        mat_hinge = Matrix.Translation(Vector((hx, hy, hz)))
        bmesh.ops.create_cube(bm_hinges, size=1.0, matrix=mat_hinge @ Matrix.Diagonal(Vector((0.035, 0.080, 0.050, 1.0))))

        # Pressurized Gas Strut Body (Cylinder)
        mat_strut_body = Matrix.Translation(Vector((hx, hy - 0.120, hz - 0.080))) @ Euler((math.radians(34), 0, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_hinges, radius=0.010, depth=0.180, segments=12, matrix=mat_strut_body)

        # Polished Chrome Piston Rod
        mat_strut_rod = mat_strut_body @ Matrix.Translation(Vector((0, 0, 0.140)))
        bmesh.ops.create_cylinder(bm_hinges, radius=0.005, depth=0.140, segments=8, matrix=mat_strut_rod)

    # Frunk Safety Latch & Release Catch at front nose (+1.880m)
    mat_latch = Matrix.Translation(Vector((0.0, 1.880, 0.520)))
    bmesh.ops.create_cube(bm_hinges, size=1.0, matrix=mat_latch @ Matrix.Diagonal(Vector((0.090, 0.045, 0.060, 1.0))))

    # Molded Perimeter Rubber Weatherstrip Gasket
    mat_gasket = Matrix.Translation(Vector((0.0, 1.250, 0.680)))
    bmesh.ops.create_cube(bm_hinges, size=1.0, matrix=mat_gasket @ Matrix.Diagonal(Vector((0.840, 1.280, 0.012, 1.0))))

    obj_hinges = link_obj("GEO_993_Frunk_Lid_Hinges_Gas_Struts", bm_hinges, parent_col, mats["trim"], bevel=0.001)
    objs.append(obj_hinges)
    return objs
'''
