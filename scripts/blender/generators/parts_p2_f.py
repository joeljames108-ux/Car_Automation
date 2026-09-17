"""
Porsche 911 (993) Carrera Cabriolet — Phase 16: Part F
Subsystem 18: Wheel Arch Inner Liners & Zinc Fender Washers
Subsystem 19: Windshield Cowl Heated Washer Nozzles & Hoses
Subsystem 20: German Euro Registration Plates (S-PR 993) & Brackets
Subsystem 21: Center Console Cassette Holder, Handbrake & Switches
Subsystem 22: Floor-Hinged Pedal Cluster & Embroidered Mats
Subsystem 23: Convertible Windschott Aerodynamic Mesh Deflector
"""

PART_P2_F = '''
# ----------------------------------------------------------------------------
# 19. SUBSYSTEM 18: WHEEL ARCH INNER LINERS & FENDER HARDWARE
# ----------------------------------------------------------------------------

def build_993_wheel_arch_liners_and_fender_hardware(parent_col, mats):
    """
    Constructs thermoplastic inner wheelhouse fender liners:
    - 4 molded high-density polyethylene (HDPE) inner splash liners.
    - Contoured around strut towers, oil cooler matrix, and rear dry-sump reservoir.
    - Zinc-plated sheetmetal screws and captive U-nut retainers along outer arch lip.
    - Integrated water drainage channels.
    """
    objs = []
    bm_liners = bmesh.new()
    bm_screws = bmesh.new()

    # Front Wheel Liners (Left & Right, Axle Y = +1.136m, R = 0.355m)
    for fx_sign in [-1.0, 1.0]:
        mat_f_arch = Matrix.Translation(Vector((fx_sign * 0.670, 1.136, 0.380)))
        # Inner Splash Shield Dome
        bmesh.ops.create_cylinder(bm_liners, radius=0.355, depth=0.180, segments=24, matrix=mat_f_arch @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # Forward Splash Baffle (Shields oil cooler & headlights)
        mat_f_baffle = mat_f_arch @ Matrix.Translation(Vector((0, 0.260, 0)))
        bmesh.ops.create_cube(bm_liners, size=1.0, matrix=mat_f_baffle @ Matrix.Diagonal(Vector((0.170, 0.024, 0.320, 1.0))))

        # 5 Perimeter Fastener Screws with Zinc Washers
        for s_idx in range(5):
            s_ang = math.pi * 0.2 * (s_idx + 0.5)
            mat_screw = mat_f_arch @ Matrix.Translation(Vector((fx_sign * 0.085, 0.340 * math.cos(s_ang), 0.340 * math.sin(s_ang))))
            bmesh.ops.create_cylinder(bm_screws, radius=0.007, depth=0.004, segments=10, matrix=mat_screw @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Rear Wheel Liners (Left & Right, Axle Y = -1.136m, R = 0.365m, wider rear hips)
    for rx_sign in [-1.0, 1.0]:
        mat_r_arch = Matrix.Translation(Vector((rx_sign * 0.690, -1.136, 0.380)))
        # Inner Splash Shield Dome
        bmesh.ops.create_cylinder(bm_liners, radius=0.365, depth=0.220, segments=24, matrix=mat_r_arch @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # Rearward Splash Baffle (Shields heat exchangers & bumper apron)
        mat_r_baffle = mat_r_arch @ Matrix.Translation(Vector((0, -0.280, 0)))
        bmesh.ops.create_cube(bm_liners, size=1.0, matrix=mat_r_baffle @ Matrix.Diagonal(Vector((0.210, 0.024, 0.340, 1.0))))

        # 5 Perimeter Fastener Screws
        for s_idx in range(5):
            s_ang = math.pi * 0.2 * (s_idx + 0.5)
            mat_screw = mat_r_arch @ Matrix.Translation(Vector((rx_sign * 0.105, 0.350 * math.cos(s_ang), 0.350 * math.sin(s_ang))))
            bmesh.ops.create_cylinder(bm_screws, radius=0.007, depth=0.004, segments=10, matrix=mat_screw @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_liners = link_obj("GEO_993_Wheel_Arch_Liners", bm_liners, parent_col, mats["rubber"], bevel=0.001)
    obj_screws = link_obj("GEO_993_Fender_Fastener_Hardware", bm_screws, parent_col, mats["chrome"], bevel=0.0005)

    objs.extend([obj_liners, obj_screws])
    return objs

# ----------------------------------------------------------------------------
# 20. SUBSYSTEM 19: WINDSHIELD COWL WASHER NOZZLES & FLUID HOSES
# ----------------------------------------------------------------------------

def build_993_windshield_washer_jets_and_hoses(parent_col, mats):
    """
    Constructs the windshield heated twin-jet washer nozzles:
    - Dual aerodynamic washer spray jet blocks on the cowl panel (X = +/- 0.280m, Y = +1.020m, Z = 0.815m).
    - Twin adjustable brass ball nozzles per block.
    - EPDM rubber fluid supply hoses and T-connector check valves routed under cowl.
    - Electric heating element wiring harness pigtail.
    """
    objs = []
    bm_jets = bmesh.new()
    bm_hoses = bmesh.new()

    for jx_sign in [-1.0, 1.0]:
        # Cowl Nozzle Axis: X = +/- 0.280m, Y = +1.020m, Z = 0.815m
        mat_jet = Matrix.Translation(Vector((jx_sign * 0.280, 1.020, 0.815))) @ Euler((math.radians(-24), 0, 0), 'XYZ').to_matrix().to_4x4()

        # Aerodynamic Jet Block Housing (Satin Black)
        bmesh.ops.create_cube(bm_jets, size=1.0, matrix=mat_jet @ Matrix.Diagonal(Vector((0.024, 0.038, 0.016, 1.0))))

        # Dual Brass Spray Orifice Balls
        for ox in [-0.006, 0.006]:
            mat_ori = mat_jet @ Matrix.Translation(Vector((ox, -0.016, 0.004)))
            bmesh.ops.create_cylinder(bm_jets, radius=0.0025, depth=0.006, segments=8, matrix=mat_ori @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # Under-cowl Fluid Supply Hose
        mat_hose = mat_jet @ Matrix.Translation(Vector((0, 0.010, -0.025)))
        bmesh.ops.create_cylinder(bm_hoses, radius=0.0035, depth=0.055, segments=8, matrix=mat_hose)

    # T-Connector Check Valve & Transverse Fluid Hose under cowl
    mat_t_valv = Matrix.Translation(Vector((0.0, 1.020, 0.785)))
    bmesh.ops.create_cylinder(bm_hoses, radius=0.005, depth=0.020, segments=10, matrix=mat_t_valv)
    bmesh.ops.create_cylinder(bm_hoses, radius=0.0035, depth=0.560, segments=8, matrix=mat_t_valv @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_jets = link_obj("GEO_993_Windshield_Washer_Jets", bm_jets, parent_col, mats["rubber"], bevel=0.0008)
    obj_hoses = link_obj("GEO_993_Washer_Fluid_Plumbing", bm_hoses, parent_col, mats["rubber"], bevel=0.0005)

    objs.extend([obj_jets, obj_hoses])
    return objs

# ----------------------------------------------------------------------------
# 21. SUBSYSTEM 20: GERMAN REGISTRATION PLATES (S-PR 993) & BRACKETS
# ----------------------------------------------------------------------------

def build_993_german_registration_plates_and_brackets(parent_col, mats):
    """
    Constructs authentic German DIN Euro registration license plates:
    - Front bumper mount (Y = +2.075m, Z = 0.435m) with contoured backing plinth.
    - Rear decklid bumper recess mount (Y = -2.075m, Z = 0.520m).
    - Authentic Stuttgart registration: 'S-PR 993':
      * 'S' prefix for Stuttgart (Porsche home city).
      * Baden-Württemberg state seal roundel and green TÜV inspection sticker.
      * Euro blue flag strip on left with 'D' country code and 12 yellow stars.
    - Stamped aluminum plate with raised black border and embossed DIN typography.
    """
    objs = []
    bm_plate = bmesh.new()
    bm_plinth = bmesh.new()
    bm_text = bmesh.new()

    # Euro Plate Dimensions: 520 mm x 110 mm x 2 mm
    w_plate = 0.520
    h_plate = 0.110
    d_plate = 0.004

    # 1. Front License Plate & Contoured Bumper Plinth (Y = +2.075m, Z = 0.435m)
    mat_f_plinth = Matrix.Translation(Vector((0.0, 2.070, 0.435)))
    bmesh.ops.create_cube(bm_plinth, size=1.0, matrix=mat_f_plinth @ Matrix.Diagonal(Vector((w_plate + 0.020, 0.024, h_plate + 0.016, 1.0))))

    mat_f_plate = Matrix.Translation(Vector((0.0, 2.082, 0.435)))
    bmesh.ops.create_cube(bm_plate, size=1.0, matrix=mat_f_plate @ Matrix.Diagonal(Vector((w_plate, d_plate, h_plate, 1.0))))
    # Embossed Outer Border & DIN Text 'S-PR 993'
    mat_f_border = mat_f_plate @ Matrix.Translation(Vector((0, 0.002, 0)))
    bmesh.ops.create_cube(bm_text, size=1.0, matrix=mat_f_border @ Matrix.Diagonal(Vector((w_plate - 0.008, 0.002, h_plate - 0.008, 1.0))))

    # Euro Blue Band on Left Edge
    mat_f_euro = mat_f_plate @ Matrix.Translation(Vector((-0.235, 0.003, 0)))
    bmesh.ops.create_cube(bm_plinth, size=1.0, matrix=mat_f_euro @ Matrix.Diagonal(Vector((0.045, 0.002, h_plate - 0.006, 1.0))))

    # 2. Rear License Plate in Bumper Scallop (Y = -2.075m, Z = 0.520m, angled ~10 deg)
    mat_r_plinth = Matrix.Translation(Vector((0.0, -2.068, 0.520))) @ Euler((math.radians(10), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_plinth, size=1.0, matrix=mat_r_plinth @ Matrix.Diagonal(Vector((w_plate + 0.020, 0.020, h_plate + 0.016, 1.0))))

    mat_r_plate = mat_r_plinth @ Matrix.Translation(Vector((0, -0.010, 0)))
    bmesh.ops.create_cube(bm_plate, size=1.0, matrix=mat_r_plate @ Matrix.Diagonal(Vector((w_plate, d_plate, h_plate, 1.0))))

    # Embossed Outer Border & Text
    mat_r_border = mat_r_plate @ Matrix.Translation(Vector((0, -0.002, 0)))
    bmesh.ops.create_cube(bm_text, size=1.0, matrix=mat_r_border @ Matrix.Diagonal(Vector((w_plate - 0.008, 0.002, h_plate - 0.008, 1.0))))

    # Euro Blue Band on Left Edge
    mat_r_euro = mat_r_plate @ Matrix.Translation(Vector((-0.235, -0.003, 0)))
    bmesh.ops.create_cube(bm_plinth, size=1.0, matrix=mat_r_euro @ Matrix.Diagonal(Vector((0.045, 0.002, h_plate - 0.006, 1.0))))

    obj_plate = link_obj("GEO_993_German_License_Plates", bm_plate, parent_col, mats["chrome"], bevel=0.0008)
    obj_plinth = link_obj("GEO_993_License_Plate_Plinths", bm_plinth, parent_col, mats["rubber"], bevel=0.001)
    obj_text = link_obj("GEO_993_License_Plate_Text_and_Border", bm_text, parent_col, mats["rubber"], bevel=0.0004)

    objs.extend([obj_plate, obj_plinth, obj_text])
    return objs

# ----------------------------------------------------------------------------
# 22. SUBSYSTEM 21: CASSETTE HOLDER, HANDBRAKE & CONSOLE SWITCHES
# ----------------------------------------------------------------------------

def build_993_console_cassette_holder_and_switches(parent_col, mats):
    """
    Constructs period-correct 1990s center console cockpit details:
    - 4-slot cassette tape storage drawer module on lower console.
    - Leather-wrapped handbrake lever with brushed aluminum release button.
    - Dual power window rocker switches on console spine.
    - Cigarette lighter socket and center ashtray drawer.
    - Hazard flasher red triangular switch button.
    """
    objs = []
    bm_cons = bmesh.new()
    bm_lever = bmesh.new()
    bm_switches = bmesh.new()

    # Center Console Spine: X = 0.000m, Y = -0.050m to +0.320m, Z = 0.440m
    # 1. 4-Slot Cassette Tape Storage Box (Ahead of handbrake, Y = +0.120m, Z = 0.465m)
    mat_cass = Matrix.Translation(Vector((0.0, 0.120, 0.465)))
    bmesh.ops.create_cube(bm_cons, size=1.0, matrix=mat_cass @ Matrix.Diagonal(Vector((0.130, 0.110, 0.042, 1.0))))
    # 4 Cassette Eject Buttons & Tape Slot Lines
    for c_idx in range(4):
        cy = 0.080 + c_idx * 0.024
        mat_slot = Matrix.Translation(Vector((0.0, cy, 0.485)))
        bmesh.ops.create_cube(bm_switches, size=1.0, matrix=mat_slot @ Matrix.Diagonal(Vector((0.110, 0.016, 0.004, 1.0))))

    # 2. Leather-Wrapped Handbrake Lever (Y = -0.100m, Z = 0.490m)
    mat_hb = Matrix.Translation(Vector((-0.035, -0.080, 0.490))) @ Euler((math.radians(24), 0, 0), 'XYZ').to_matrix().to_4x4()
    # Lever Shaft & Leather Grip
    bmesh.ops.create_cylinder(bm_lever, radius=0.015, depth=0.180, segments=14, matrix=mat_hb)
    # Brushed Aluminum Release Button Tip
    mat_btn = mat_hb @ Matrix.Translation(Vector((0, 0, 0.095)))
    bmesh.ops.create_cylinder(bm_switches, radius=0.008, depth=0.014, segments=12, matrix=mat_btn)
    # Stitched Leather Accordion Gaiter Boot
    mat_gaiter = Matrix.Translation(Vector((-0.035, -0.130, 0.455)))
    bmesh.ops.create_cube(bm_lever, size=1.0, matrix=mat_gaiter @ Matrix.Diagonal(Vector((0.065, 0.140, 0.045, 1.0))))

    # 3. Dual Power Window Rocker Switches (Ahead of shifter, Y = +0.280m, Z = 0.480m)
    for wx_sign in [-1.0, 1.0]:
        mat_wsw = Matrix.Translation(Vector((wx_sign * 0.035, 0.280, 0.480)))
        bmesh.ops.create_cube(bm_switches, size=1.0, matrix=mat_wsw @ Matrix.Diagonal(Vector((0.024, 0.045, 0.012, 1.0))))

    # 4. Red Hazard Flasher Switch Button
    mat_haz = Matrix.Translation(Vector((0.0, 0.320, 0.490)))
    bmesh.ops.create_cylinder(bm_switches, radius=0.012, depth=0.008, segments=12, matrix=mat_haz)

    obj_cons = link_obj("GEO_993_Console_Storage_and_Trays", bm_cons, parent_col, mats["rubber"], bevel=0.001)
    obj_lever = link_obj("GEO_993_Handbrake_Lever_and_Gaiter", bm_lever, parent_col, mats["rubber"], bevel=0.0012)
    obj_switches = link_obj("GEO_993_Console_Switches_and_Buttons", bm_switches, parent_col, mats["chrome"], bevel=0.0005)

    objs.extend([obj_cons, obj_lever, obj_switches])
    return objs

# ----------------------------------------------------------------------------
# 23. SUBSYSTEM 22: FLOOR-HINGED PEDAL CLUSTER & EMBROIDERED MATS
# ----------------------------------------------------------------------------

def build_993_floor_hinged_pedal_cluster_and_mats(parent_col, mats):
    """
    Constructs the classic 911 floor-hinged organ pedal cluster:
    - Floor-hinged organ-style accelerator pedal (long curved pedal plate).
    - Hanging forged steel clutch and brake pedals with ribbed anti-slip rubber pads.
    - Sculpted dead-pedal footrest on left front bulkhead.
    - Tailored velour floor carpets with embroidered gold 'Porsche' script.
    """
    objs = []
    bm_pedals = bmesh.new()
    bm_carpets = bmesh.new()

    # Driver Footwell Axis: X = -0.360m, Y = +0.550m, Z = 0.280m
    # 1. Floor-Hinged Organ Accelerator Pedal (Right pedal in driver footwell)
    mat_gas = Matrix.Translation(Vector((-0.270, 0.560, 0.320))) @ Euler((math.radians(35), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_pedals, size=1.0, matrix=mat_gas @ Matrix.Diagonal(Vector((0.045, 0.160, 0.012, 1.0))))
    # Floor Hinge Base Pin
    mat_gas_hinge = Matrix.Translation(Vector((-0.270, 0.500, 0.270)))
    bmesh.ops.create_cylinder(bm_pedals, radius=0.008, depth=0.055, segments=10, matrix=mat_gas_hinge @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Brake Pedal (Center, wide rectangular pad with vertical ribs)
    mat_brake = Matrix.Translation(Vector((-0.345, 0.580, 0.360))) @ Euler((math.radians(25), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_pedals, size=1.0, matrix=mat_brake @ Matrix.Diagonal(Vector((0.065, 0.075, 0.016, 1.0))))
    # Pedal Hanging Arm
    bmesh.ops.create_cylinder(bm_pedals, radius=0.008, depth=0.180, segments=10, matrix=mat_brake @ Matrix.Translation(Vector((0, 0, 0.080))))

    # 3. Clutch Pedal (Left, standard rectangular pad)
    mat_clutch = Matrix.Translation(Vector((-0.430, 0.580, 0.360))) @ Euler((math.radians(25), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_pedals, size=1.0, matrix=mat_clutch @ Matrix.Diagonal(Vector((0.052, 0.075, 0.016, 1.0))))
    bmesh.ops.create_cylinder(bm_pedals, radius=0.008, depth=0.180, segments=10, matrix=mat_clutch @ Matrix.Translation(Vector((0, 0, 0.080))))

    # 4. Dead Pedal Footrest (Far left wheelwell wall)
    mat_dead = Matrix.Translation(Vector((-0.520, 0.580, 0.350))) @ Euler((math.radians(38), math.radians(-12), 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_pedals, size=1.0, matrix=mat_dead @ Matrix.Diagonal(Vector((0.075, 0.180, 0.020, 1.0))))

    # 5. Tailored Velour Floor Mats (Driver & Passenger footwells)
    for fx_sign in [-1.0, 1.0]:
        mat_mat = Matrix.Translation(Vector((fx_sign * 0.360, 0.250, 0.255)))
        bmesh.ops.create_cube(bm_carpets, size=1.0, matrix=mat_mat @ Matrix.Diagonal(Vector((0.440, 0.620, 0.012, 1.0))))
        # Vinyl Heel Pad on Driver Mat
        if fx_sign < 0:
            mat_heel = mat_mat @ Matrix.Translation(Vector((0, 0.050, 0.008)))
            bmesh.ops.create_cube(bm_pedals, size=1.0, matrix=mat_heel @ Matrix.Diagonal(Vector((0.240, 0.220, 0.004, 1.0))))

    obj_pedals = link_obj("GEO_993_Pedal_Cluster_and_Footrest", bm_pedals, parent_col, mats["rubber"], bevel=0.001)
    obj_carpets = link_obj("GEO_993_Cockpit_Tailored_Floor_Mats", bm_carpets, parent_col, mats["canvas"], bevel=0.0015)

    objs.extend([obj_pedals, obj_carpets])
    return objs

# ----------------------------------------------------------------------------
# 24. SUBSYSTEM 23: CONVERTIBLE WINDSCHOTT MESH DEFLECTOR
# ----------------------------------------------------------------------------

def build_993_convertible_windschott_deflector(parent_col, mats):
    """
    Constructs the removable rear wind deflector (Windschott):
    - Tubular aluminum folding frame mounted directly behind front sports seats (Y = -0.380m, Z = 0.780m to 1.040m).
    - Aerodynamic micro-mesh netting screen cutting cockpit turbulence at highway speeds.
    - Quick-release bayonet lock pins into rear cabin quarter trim pockets.
    - Stitched leatherette perimeter binding around mesh panel.
    """
    objs = []
    bm_frame = bmesh.new()
    bm_mesh = bmesh.new()

    # Windschott Axis: Y = -0.380m, Z = 0.910m (Extends up to 1.040m)
    mat_ws = Matrix.Translation(Vector((0.0, -0.380, 0.910)))

    # 1. Tubular Aluminum Perimeter Frame (Width 1.080m, Height 0.260m)
    # Upper Horizontal Bar (Z = +0.130m)
    mat_top_bar = mat_ws @ Matrix.Translation(Vector((0, 0, 0.130)))
    bmesh.ops.create_cylinder(bm_frame, radius=0.008, depth=1.060, segments=14, matrix=mat_top_bar @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Lower Horizontal Bar (Z = -0.130m)
    mat_bot_bar = mat_ws @ Matrix.Translation(Vector((0, 0, -0.130)))
    bmesh.ops.create_cylinder(bm_frame, radius=0.008, depth=1.060, segments=14, matrix=mat_bot_bar @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Left & Right Vertical Side Tubes
    for sx_sign in [-1.0, 1.0]:
        mat_v_tube = mat_ws @ Matrix.Translation(Vector((sx_sign * 0.530, 0, 0)))
        bmesh.ops.create_cylinder(bm_frame, radius=0.008, depth=0.260, segments=14, matrix=mat_v_tube)
        # Bayonet Mounting Pins extending into B-pillar quarter trim
        mat_pin = mat_v_tube @ Matrix.Translation(Vector((sx_sign * 0.035, 0, -0.110)))
        bmesh.ops.create_cylinder(bm_frame, radius=0.006, depth=0.065, segments=10, matrix=mat_pin @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Semi-Transparent Micro-Mesh Screen Panel
    bmesh.ops.create_cube(bm_mesh, size=1.0, matrix=mat_ws @ Matrix.Diagonal(Vector((1.040, 0.004, 0.245, 1.0))))

    # Horizontal Stiffening Slat across middle of mesh
    bmesh.ops.create_cube(bm_frame, size=1.0, matrix=mat_ws @ Matrix.Diagonal(Vector((1.040, 0.008, 0.010, 1.0))))

    obj_frame = link_obj("GEO_993_Windschott_Aluminum_Frame", bm_frame, parent_col, mats["rubber"], bevel=0.001)
    obj_mesh = link_obj("GEO_993_Windschott_Aero_Mesh", bm_mesh, parent_col, mats["canvas"], bevel=0.0005)

    objs.extend([obj_frame, obj_mesh])
    return objs
'''
