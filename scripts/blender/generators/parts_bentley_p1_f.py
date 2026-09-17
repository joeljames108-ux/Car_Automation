"""
Bentley Continental GT Speed Convertible (2020s) Phase 21: Part F
Subsystems 10 and 11:
- Subsystem 10: 3-Chamber Adaptive Air Suspension Struts & Aluminum Double Wishbone Links
- Subsystem 11: 48V Active Roll Control (Bentley Dynamic Ride) & All-Wheel Steering System
"""

PART_BENTLEY_F = '''
# ----------------------------------------------------------------------------
# 10. SUBSYSTEM 10: 3-CHAMBER ADAPTIVE AIR SUSPENSION & DOUBLE WISHBONES
# ----------------------------------------------------------------------------

def build_bentley_air_suspension(parent_col, mats):
    """
    Constructs the advanced chassis architecture featuring 3-chamber adaptive air suspension:
    - Lightweight cast aluminum high-mounted upper wishbones and split-lower control arms.
    - Massive pneumatic 3-chamber air springs with integrated continuous damping control (CDC) shocks.
    - Rear multi-link aluminum five-arm suspension assembly for supreme stability at 208 mph.
    - Front & rear aluminum steering knuckles and hub carrier uprights.
    """
    objs = []
    bm_links = bmesh.new()
    bm_airbags = bmesh.new()

    # Front Double Wishbone & Air Struts (Axle Y = +1.425m, Wheel Centers Z = 0.365m)
    for fx_sign in [-1.0, 1.0]:
        # 1. High-Mounted Aluminum Upper Wishbone (A-Arm)
        mat_f_upr = Matrix.Translation(Vector((fx_sign * 0.520, 1.425, 0.520)))
        # Forward & Rearward Inboard Pivot Bushings
        for y_arm in [-0.140, 0.140]:
            mat_pbush = mat_f_upr @ Matrix.Translation(Vector((-fx_sign * 0.120, y_arm, 0)))
            bmesh.ops.create_cylinder(bm_links, radius=0.024, depth=0.055, segments=14, matrix=mat_pbush @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
        # Upper A-Arm Triangular Tube Truss
        mat_u_truss = mat_f_upr @ Matrix.Translation(Vector((0.0, 0.0, 0.0)))
        bmesh.ops.create_cube(bm_links, size=1.0, matrix=mat_u_truss @ Matrix.Diagonal(Vector((0.260, 0.280, 0.032, 1.0))))

        # 2. Lower Wishbone Split-Arm Assembly (Inboard subframe mounts at Z = 0.210m)
        mat_f_lwr = Matrix.Translation(Vector((fx_sign * 0.480, 1.425, 0.220)))
        bmesh.ops.create_cube(bm_links, size=1.0, matrix=mat_f_lwr @ Matrix.Diagonal(Vector((0.340, 0.320, 0.038, 1.0))))

        # 3. 3-Chamber Adaptive Air Strut (Spring rate configurable from limo plush to track stiff)
        # Strut axis angled inward to top mount at X = +-0.500m, Y = 1.425m, Z = 0.640m
        mat_strut = Matrix.Translation(Vector((fx_sign * 0.560, 1.425, 0.440))) @ Euler((0, -fx_sign * math.radians(11), 0), 'XYZ').to_matrix().to_4x4()
        # Pneumatic 3-Chamber Air Bladder Canister
        bmesh.ops.create_cylinder(bm_airbags, radius=0.082, depth=0.240, segments=22, matrix=mat_strut @ Matrix.Translation(Vector((0, 0, 0.080))))
        # Billet Aluminum Strut Top Mount Bracket
        bmesh.ops.create_cylinder(bm_links, radius=0.090, depth=0.035, segments=20, matrix=mat_strut @ Matrix.Translation(Vector((0, 0, 0.210))))
        # Lower Damper Telescopic Hydraulic Rod
        bmesh.ops.create_cylinder(bm_links, radius=0.032, depth=0.180, segments=16, matrix=mat_strut @ Matrix.Translation(Vector((0, 0, -0.120))))

        # 4. Front Cast Aluminum Steering Upright / Wheel Carrier (X = +-0.760m)
        mat_f_knuckle = Matrix.Translation(Vector((fx_sign * 0.760, 1.425, 0.365)))
        bmesh.ops.create_cube(bm_links, size=1.0, matrix=mat_f_knuckle @ Matrix.Diagonal(Vector((0.075, 0.160, 0.320, 1.0))))

    # Rear Five-Link Multi-Link Suspension & Air Struts (Axle Y = -1.426m, Wheel Centers Z = 0.365m)
    for rx_sign in [-1.0, 1.0]:
        # 1. Rear Upper Camber & Tension Link Rods
        for link_i, l_y in enumerate([-0.120, 0.100]):
            mat_r_link = Matrix.Translation(Vector((rx_sign * 0.540, -1.426 + l_y, 0.480))) @ Euler((0, rx_sign * math.radians(5), 0), 'XYZ').to_matrix().to_4x4()
            bmesh.ops.create_cylinder(bm_links, radius=0.018, depth=0.340, segments=14, matrix=mat_r_link @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # 2. Massive Rear Lower Camber Bed / Spring Link (Carries air spring)
        mat_r_bed = Matrix.Translation(Vector((rx_sign * 0.520, -1.426, 0.220)))
        bmesh.ops.create_cube(bm_links, size=1.0, matrix=mat_r_bed @ Matrix.Diagonal(Vector((0.360, 0.180, 0.045, 1.0))))

        # 3. Rear 3-Chamber Adaptive Air Strut
        mat_r_strut = Matrix.Translation(Vector((rx_sign * 0.540, -1.426, 0.450))) @ Euler((0, -rx_sign * math.radians(8), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_airbags, radius=0.078, depth=0.230, segments=22, matrix=mat_r_strut @ Matrix.Translation(Vector((0, 0, 0.070))))
        bmesh.ops.create_cylinder(bm_links, radius=0.088, depth=0.035, segments=20, matrix=mat_r_strut @ Matrix.Translation(Vector((0, 0, 0.195))))
        bmesh.ops.create_cylinder(bm_links, radius=0.030, depth=0.170, segments=16, matrix=mat_r_strut @ Matrix.Translation(Vector((0, 0, -0.110))))

        # 4. Rear Cast Aluminum Wheel Hub Carrier Upright (X = +-0.755m)
        mat_r_knuckle = Matrix.Translation(Vector((rx_sign * 0.755, -1.426, 0.365)))
        bmesh.ops.create_cube(bm_links, size=1.0, matrix=mat_r_knuckle @ Matrix.Diagonal(Vector((0.080, 0.180, 0.310, 1.0))))

    obj_links = link_obj("GEO_BENTLEY_Aluminum_Suspension_Wishbones", bm_links, parent_col, mats["engine_alloy"], bevel=0.0015)
    obj_airbags = link_obj("GEO_BENTLEY_3Chamber_Air_Suspension_Struts", bm_airbags, parent_col, mats["trim_black"], bevel=0.002)

    objs.extend([obj_links, obj_airbags])
    return objs


# ----------------------------------------------------------------------------
# 11. SUBSYSTEM 11: 48V ACTIVE ROLL CONTROL & ALL-WHEEL STEERING SYSTEM
# ----------------------------------------------------------------------------

def build_bentley_active_roll_and_aws(parent_col, mats):
    """
    Constructs the 48-Volt Bentley Dynamic Ride active anti-roll system and all-wheel steering:
    - Front & Rear 48V electric rotary actuator motors mounted in the split anti-roll bars.
      Capable of applying 1,300 Nm of anti-roll torque in 0.3 seconds to keep body flat.
    - High-torsion spring steel stabilizer bar halves with articulating drop link tie-rods.
    - Electric Power Steering (EPAS) front rack & pinion unit with variable ratio.
    - Rear-Wheel Steering (AWS) electromechanical tie-rod actuators providing up to 2.8 degrees
      of rear wheel steer (counter-phase at low speed for agility, in-phase at high speed).
    """
    objs = []
    bm_48v = bmesh.new()
    bm_bars = bmesh.new()
    bm_steer = bmesh.new()

    # 1. Front 48V Bentley Dynamic Ride System (Y = +1.280m, Z = 0.240m)
    mat_f_48v = Matrix.Translation(Vector((0.0, 1.280, 0.240)))
    # Central 48V High-Torque Electric Rotary Actuator Motor
    bmesh.ops.create_cylinder(bm_48v, radius=0.065, depth=0.180, segments=20, matrix=mat_f_48v @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())
    # Front Stabilizer Bar Halves (Left & Right)
    for fx_sign in [-1.0, 1.0]:
        mat_f_bar = Matrix.Translation(Vector((fx_sign * 0.340, 1.280, 0.240)))
        bmesh.ops.create_cylinder(bm_bars, radius=0.019, depth=0.480, segments=14, matrix=mat_f_bar @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())
        # Drop Link Rod connecting to lower wishbone (Z: 0.240m to 0.220m, Y = 1.350m)
        mat_f_drop = Matrix.Translation(Vector((fx_sign * 0.580, 1.340, 0.230)))
        bmesh.ops.create_cylinder(bm_bars, radius=0.011, depth=0.140, segments=12, matrix=mat_f_drop @ Euler((math.radians(35), 0, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Front Variable-Ratio Electric Power Steering Rack (Y = +1.520m, Z = 0.250m)
    mat_steer_rack = Matrix.Translation(Vector((0.0, 1.520, 0.250)))
    bmesh.ops.create_cylinder(bm_steer, radius=0.036, depth=0.880, segments=16, matrix=mat_steer_rack @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())
    # EPAS Electric Drive Motor Unit (offset left side of rack)
    mat_epas = mat_steer_rack @ Matrix.Translation(Vector((-0.220, -0.060, 0.040)))
    bmesh.ops.create_cylinder(bm_48v, radius=0.052, depth=0.130, segments=16, matrix=mat_epas @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    # Front Steering Outer Tie-Rods with Ball Joints
    for tx_sign in [-1.0, 1.0]:
        mat_tie = Matrix.Translation(Vector((tx_sign * 0.600, 1.500, 0.260)))
        bmesh.ops.create_cylinder(bm_steer, radius=0.013, depth=0.320, segments=12, matrix=mat_tie @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # 3. Rear 48V Bentley Dynamic Ride System (Y = -1.240m, Z = 0.250m)
    mat_r_48v = Matrix.Translation(Vector((0.0, -1.240, 0.250)))
    bmesh.ops.create_cylinder(bm_48v, radius=0.062, depth=0.170, segments=20, matrix=mat_r_48v @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())
    # Rear Stabilizer Bar Halves
    for rx_sign in [-1.0, 1.0]:
        mat_r_bar = Matrix.Translation(Vector((rx_sign * 0.330, -1.240, 0.250)))
        bmesh.ops.create_cylinder(bm_bars, radius=0.018, depth=0.460, segments=14, matrix=mat_r_bar @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())
        # Rear Drop Link Rods
        mat_r_drop = Matrix.Translation(Vector((rx_sign * 0.560, -1.300, 0.240)))
        bmesh.ops.create_cylinder(bm_bars, radius=0.011, depth=0.130, segments=12, matrix=mat_r_drop @ Euler((-math.radians(30), 0, 0), 'XYZ').to_matrix().to_4x4())

    # 4. Rear-Wheel Steering (All-Wheel Steer) Electromechanical Actuator System (Y = -1.560m, Z = 0.310m)
    mat_aws = Matrix.Translation(Vector((0.0, -1.560, 0.310)))
    # High-Precision Dual Electric Actuator Central Box
    bmesh.ops.create_cube(bm_48v, size=1.0, matrix=mat_aws @ Matrix.Diagonal(Vector((0.360, 0.140, 0.110, 1.0))))
    # Active Rear Toe Control Link Rods (Left & Right to rear knuckles)
    for ax_sign in [-1.0, 1.0]:
        mat_r_toe = Matrix.Translation(Vector((ax_sign * 0.480, -1.540, 0.320)))
        bmesh.ops.create_cylinder(bm_steer, radius=0.014, depth=0.380, segments=12, matrix=mat_r_toe @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_48v = link_obj("GEO_BENTLEY_48V_Active_Roll_Actuators", bm_48v, parent_col, mats["trim_black"], bevel=0.0015)
    obj_bars = link_obj("GEO_BENTLEY_Stabilizer_AntiRoll_Bars", bm_bars, parent_col, mats["chrome"], bevel=0.0012)
    obj_steer = link_obj("GEO_BENTLEY_Front_EPAS_and_Rear_AWS_System", bm_steer, parent_col, mats["engine_alloy"], bevel=0.0015)

    objs.extend([obj_48v, obj_bars, obj_steer])
    return objs
'''
