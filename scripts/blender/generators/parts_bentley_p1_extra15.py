"""
Bentley Continental GT Speed Convertible (2020s) Phase 21: Part Extra 15
Subsystems 34 and 35:
- Subsystem 34: 48V Dynamic Ride ECU Module & High-Amp Actuator Power Looms
- Subsystem 35: Deployable Wind Deflector Cartridge & Decklid Electric Latches
"""

PART_BENTLEY_EXTRA15 = '''
# ----------------------------------------------------------------------------
# 34. SUBSYSTEM 34: 48V DYNAMIC RIDE ECU & ACTUATOR POWER HARNESSES
# ----------------------------------------------------------------------------

def build_bentley_48v_dynamic_ride_ecu(parent_col, mats):
    """
    Constructs the high-speed computing hardware controlling the 48V active suspension:
    - Bentley Dynamic Ride dedicated multi-core electronic control computer module.
    - Thick braided high-amperage flexible power conduits feeding the 48V rotary actuators.
    - Integrated multi-axis inertial measurement unit (IMU) gyro sensor assembly.
    - Cast aluminum finned controller housing mounted on cockpit front sub-dash bulkhead.
    """
    objs = []
    bm_ecu = bmesh.new()
    bm_cables = bmesh.new()

    # 1. Bentley Dynamic Ride Dedicated Suspension Computer (Cockpit sub-bulkhead, X = 0.220m, Y = 0.580m, Z = 0.520m)
    mat_ecu = Matrix.Translation(Vector((0.220, 0.580, 0.520)))
    bmesh.ops.create_cube(bm_ecu, size=1.0, matrix=mat_ecu @ Matrix.Diagonal(Vector((0.180, 0.160, 0.065, 1.0))))

    # Multi-Pin Sealed Automotive Mil-Spec Wire Connectors
    for con_off in [-0.050, 0.050]:
        mat_con = mat_ecu @ Matrix.Translation(Vector((con_off, -0.090, 0.0)))
        bmesh.ops.create_cube(bm_ecu, size=1.0, matrix=mat_con @ Matrix.Diagonal(Vector((0.045, 0.030, 0.035, 1.0))))

    # 2. Heavy-Gauge Braided High-Amperage 48V Actuator Power Cables (to front and rear 48V motors)
    # Cable run forward to front 48V roll motor
    mat_fcable = Matrix.Translation(Vector((0.120, 0.950, 0.380)))
    bmesh.ops.create_cylinder(bm_cables, radius=0.010, depth=0.740, segments=12, matrix=mat_fcable @ Euler((math.radians(16), 0, 0), 'XYZ').to_matrix().to_4x4())

    # Cable run rearward to rear 48V roll motor
    mat_rcable = Matrix.Translation(Vector((0.120, -0.320, 0.320)))
    bmesh.ops.create_cylinder(bm_cables, radius=0.010, depth=1.800, segments=12, matrix=mat_rcable @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_ecu = link_obj("GEO_BENTLEY_48V_DynamicRide_Controller_ECU", bm_ecu, parent_col, mats["engine_alloy"], bevel=0.001)
    obj_cables = link_obj("GEO_BENTLEY_48V_HighAmp_Actuator_Cables", bm_cables, parent_col, mats["red_caliper"], bevel=0.0006)

    objs.extend([obj_ecu, obj_cables])
    return objs


# ----------------------------------------------------------------------------
# 35. SUBSYSTEM 35: WIND DEFLECTOR CARTRIDGE & DECKLID ELECTRIC LATCHES
# ----------------------------------------------------------------------------

def build_bentley_wind_deflector_and_latches(parent_col, mats):
    """
    Constructs the convertible cockpit acoustic aero management and tonneau locking hardware:
    - Removable folding mesh wind deflector cassette cartridge positioned over rear seats.
    - Fine acoustic perforated mesh deflector screen minimizing open-cockpit buffeting.
    - Motorized soft-close electric decklid pull-down latches and rotary claw strikers.
    - Tonneau cover hydraulic hinge pivot brackets anchoring into rear chassis uprights.
    """
    objs = []
    bm_deflector = bmesh.new()
    bm_latches = bmesh.new()

    # 1. Aerodynamic Wind Deflector Frame & Perforated Mesh (Above rear seats, Y = -0.580m, Z = 0.860m)
    mat_def = Matrix.Translation(Vector((0.0, -0.580, 0.860)))
    # Lightweight Anodized Aluminum Outer Perimeter Tubular Frame
    bmesh.ops.create_cube(bm_deflector, size=1.0, matrix=mat_def @ Matrix.Diagonal(Vector((1.080, 0.022, 0.240, 1.0))))

    # Horizontal Base Deflector Shield Panel (covers rear seat cushion wells)
    mat_dbase = mat_def @ Matrix.Translation(Vector((0.0, -0.160, -0.110)))
    bmesh.ops.create_cube(bm_deflector, size=1.0, matrix=mat_dbase @ Matrix.Diagonal(Vector((1.060, 0.320, 0.014, 1.0))))

    # 2. Tonneau Decklid Soft-Close Electric Rotary Latches (Left & Right rear quarters, Y = -1.520m, Z = 0.820m)
    for l_sign in [-1.0, 1.0]:
        mat_latch = Matrix.Translation(Vector((l_sign * 0.740, -1.520, 0.820)))
        # Latch Housing Body
        bmesh.ops.create_cube(bm_latches, size=1.0, matrix=mat_latch @ Matrix.Diagonal(Vector((0.065, 0.080, 0.055, 1.0))))
        # Motorized Pull-Down Rotary Claw Hook
        mat_claw = mat_latch @ Matrix.Translation(Vector((0, 0, 0.035)))
        bmesh.ops.create_cylinder(bm_latches, radius=0.016, depth=0.025, segments=14, matrix=mat_claw @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # Tonneau Multi-Link Hydraulic Hinge Gooseneck Bracket (Y = -1.220m)
        mat_hinge = Matrix.Translation(Vector((l_sign * 0.720, -1.220, 0.740)))
        bmesh.ops.create_cube(bm_latches, size=1.0, matrix=mat_hinge @ Matrix.Diagonal(Vector((0.045, 0.160, 0.080, 1.0))))

    obj_def = link_obj("GEO_BENTLEY_Cockpit_Aero_Wind_Deflector", bm_deflector, parent_col, mats["trim_black"], bevel=0.001)
    obj_latches = link_obj("GEO_BENTLEY_Tonneau_Electric_Latches_and_Hinges", bm_latches, parent_col, mats["chrome"], bevel=0.0008)

    objs.extend([obj_def, obj_latches])
    return objs
'''
