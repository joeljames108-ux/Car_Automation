# Subsystems 21 to 26 for Porsche 911 (993) Carrera Cabriolet Phase 1

PART_F = '''
# ----------------------------------------------------------------------------
# 24. SUBSYSTEM 21: FRONT SUBFRAME CROSSMEMBER & ANTI-ROLL BAR
# ----------------------------------------------------------------------------

def build_993_front_subframe_crossmember_and_anti_roll_bar(parent_col, mats):
    """
    Constructs the front aluminum structural crossmember and sway bar:
    - Cast aluminum lower front cradle carrier bolted to inner frame rails.
    - Steering rack rubber mounting bushings and steel U-clamps.
    - Steering column lower intermediate shaft and needle-bearing universal joints.
    - 22mm tubular front anti-roll bar traversing between front wheelwells.
    - Anti-roll bar drop links connecting to front MacPherson strut bodies.
    """
    objs = []
    bm_cross = bmesh.new()

    # Cast Aluminum Lower Front Crossmember Cradle (Y = +1.136m, Z = 0.220m)
    mat_cross = Matrix.Translation(Vector((0.0, 1.136, 0.220)))
    bmesh.ops.create_cube(bm_cross, size=1.0, matrix=mat_cross @ Matrix.Diagonal(Vector((0.880, 0.160, 0.055, 1.0))))

    # Left and Right Frame Mount Bushing Plates
    for mx_sign in [-1.0, 1.0]:
        mat_mount = Matrix.Translation(Vector((mx_sign * 0.410, 1.136, 0.245)))
        bmesh.ops.create_cylinder(bm_cross, radius=0.038, depth=0.040, segments=16, matrix=mat_mount)
        # Bushing Center Through-Bolt
        bmesh.ops.create_cylinder(bm_cross, radius=0.009, depth=0.060, segments=12, matrix=mat_mount)

    # Steering Column Lower Intermediate Shaft & Universal Joint (LHD: X = -0.280m)
    mat_u_joint = Matrix.Translation(Vector((-0.280, 0.950, 0.380))) @ Euler((math.radians(35), math.radians(-12), 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_cross, radius=0.016, depth=0.280, segments=12, matrix=mat_u_joint)
    bmesh.ops.create_cube(bm_cross, size=1.0, matrix=mat_u_joint @ Matrix.Translation(Vector((0, 0, 0.120))) @ Matrix.Diagonal(Vector((0.035, 0.035, 0.045, 1.0))))

    # 22mm Tubular Front Anti-Roll Sway Bar
    # Central Transverse Section
    mat_sway_c = Matrix.Translation(Vector((0.0, 1.220, 0.235)))
    bmesh.ops.create_cylinder(bm_cross, radius=0.011, depth=0.920, segments=16, matrix=mat_sway_c @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Left & Right Sway Bar Pivot Bushings & Clamps
    for sx_sign in [-1.0, 1.0]:
        mat_sb_bush = Matrix.Translation(Vector((sx_sign * 0.380, 1.220, 0.235)))
        bmesh.ops.create_cube(bm_cross, size=1.0, matrix=mat_sb_bush @ Matrix.Diagonal(Vector((0.045, 0.050, 0.042, 1.0))))

        # Angled Sway Bar Arm extending towards strut
        mat_sb_arm = Matrix.Translation(Vector((sx_sign * 0.460, 1.180, 0.245))) @ Euler((0, sx_sign * math.radians(18), math.radians(22)), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_cross, radius=0.011, depth=0.140, segments=12, matrix=mat_sb_arm)

        # Vertical Ball-Joint Drop Link to MacPherson Strut
        mat_dlink = Matrix.Translation(Vector((sx_sign * 0.520, 1.140, 0.300)))
        bmesh.ops.create_cylinder(bm_cross, radius=0.007, depth=0.130, segments=12, matrix=mat_dlink)
        # Upper & Lower Ball-Joint Sockets
        for ball_z in [0.235, 0.365]:
            mat_ball = Matrix.Translation(Vector((sx_sign * 0.520, 1.140, ball_z)))
            bmesh.ops.create_cylinder(bm_cross, radius=0.014, depth=0.020, segments=12, matrix=mat_ball)

    obj_cross = link_obj("GEO_993_Front_Crossmember_and_AntiRollBar", bm_cross, parent_col, mats["alloy"], bevel=0.002)
    objs.append(obj_cross)
    return objs

# ----------------------------------------------------------------------------
# 25. SUBSYSTEM 22: REAR SWAY BAR & LSA DROP LINKS
# ----------------------------------------------------------------------------

def build_993_rear_swaybar_and_lsa_drop_links(parent_col, mats):
    """
    Constructs the rear 21mm tubular anti-roll bar and LSA linkage:
    - Transverse sway bar routing beneath the G50 6-speed transmission housing.
    - Heavy-duty forged aluminum sway bar mounting saddles on the subframe.
    - Rear vertical drop links with spherical heim joints.
    - Attachment brackets to lower LSA cast aluminum control arms.
    """
    objs = []
    bm_rsway = bmesh.new()

    # Transverse Sway Bar Tube (Y = -1.020m, Z = 0.225m)
    mat_rsway_c = Matrix.Translation(Vector((0.0, -1.020, 0.225)))
    bmesh.ops.create_cylinder(bm_rsway, radius=0.0105, depth=0.960, segments=16, matrix=mat_rsway_c @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Subframe Mounting Bushings & Saddle Clamps
    for rx_sign in [-1.0, 1.0]:
        mat_saddle = Matrix.Translation(Vector((rx_sign * 0.390, -1.020, 0.225)))
        bmesh.ops.create_cube(bm_rsway, size=1.0, matrix=mat_saddle @ Matrix.Diagonal(Vector((0.048, 0.052, 0.040, 1.0))))

        # Trailing Rear Sway Bar Arm
        mat_rear_arm = Matrix.Translation(Vector((rx_sign * 0.480, -1.075, 0.230))) @ Euler((0, rx_sign * math.radians(-15), math.radians(-24)), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_rsway, radius=0.0105, depth=0.150, segments=12, matrix=mat_rear_arm)

        # Spherical Heim-Joint Drop Link to LSA Lower Control Arm
        mat_r_link = Matrix.Translation(Vector((rx_sign * 0.540, -1.130, 0.265)))
        bmesh.ops.create_cylinder(bm_rsway, radius=0.007, depth=0.110, segments=12, matrix=mat_r_link)

        # Upper & Lower Heim-Joint Spheres
        for hz in [0.210, 0.320]:
            mat_hball = Matrix.Translation(Vector((rx_sign * 0.540, -1.130, hz)))
            bmesh.ops.create_cylinder(bm_rsway, radius=0.015, depth=0.024, segments=12, matrix=mat_hball)

    obj_rsway = link_obj("GEO_993_Rear_SwayBar_and_DropLinks", bm_rsway, parent_col, mats["trim"], bevel=0.002)
    objs.append(obj_rsway)
    return objs

# ----------------------------------------------------------------------------
# 26. SUBSYSTEM 23: OIL THERMOSTAT & EXTERNAL SILL LINES
# ----------------------------------------------------------------------------

def build_993_oil_thermostat_and_external_sill_lines(parent_col, mats):
    """
    Constructs the authentic 993 external dry-sump oil cooling circuit:
    - Right rear fender brass oil thermostat regulator valve body.
    - Dual extruded brass/copper oil supply and return pipes running along the right passenger rocker sill.
    - Flexible braided stainless steel connector hoses with anodized AN-12 fittings.
    - Forward connection to the front right auxiliary oil cooler matrix.
    """
    objs = []
    bm_oil = bmesh.new()

    # Thermostat Regulator Valve Body (Right Rear Wheelhouse, X = +0.680m, Y = -1.100m, Z = 0.380m)
    mat_thermo = Matrix.Translation(Vector((0.680, -1.100, 0.380)))
    bmesh.ops.create_cube(bm_oil, size=1.0, matrix=mat_thermo @ Matrix.Diagonal(Vector((0.085, 0.110, 0.095, 1.0))))
    # Thermostatic Bimetallic Pressure Cap
    bmesh.ops.create_cylinder(bm_oil, radius=0.026, depth=0.030, segments=14, matrix=mat_thermo @ Matrix.Translation(Vector((0, 0, 0.055))))

    # Dual Sill Oil Hardlines (Running along right inner sill, X = +0.760m, Y from -1.050m to +1.050m, Z = 0.165m)
    # Line 1: Hot Oil Supply to Front Cooler
    mat_line1 = Matrix.Translation(Vector((0.755, 0.000, 0.165)))
    bmesh.ops.create_cylinder(bm_oil, radius=0.011, depth=2.100, segments=12, matrix=mat_line1 @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Line 2: Cooled Oil Return to Dry-Sump Tank
    mat_line2 = Matrix.Translation(Vector((0.782, 0.000, 0.165)))
    bmesh.ops.create_cylinder(bm_oil, radius=0.011, depth=2.100, segments=12, matrix=mat_line2 @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 4 Retaining Sill Clamps along the rocker channel
    for cy in [-0.700, -0.200, 0.300, 0.800]:
        mat_clamp = Matrix.Translation(Vector((0.768, cy, 0.165)))
        bmesh.ops.create_cube(bm_oil, size=1.0, matrix=mat_clamp @ Matrix.Diagonal(Vector((0.045, 0.024, 0.028, 1.0))))

    # Front Flexible Braided Stainless Hose Turn to Front Right Oil Cooler
    mat_front_turn = Matrix.Translation(Vector((0.740, 1.150, 0.220))) @ Euler((0, math.radians(-32), math.radians(40)), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_oil, radius=0.012, depth=0.240, segments=12, matrix=mat_front_turn)
    # Anodized AN Fitting Hex Nut
    bmesh.ops.create_cylinder(bm_oil, radius=0.018, depth=0.025, segments=6, matrix=mat_front_turn @ Matrix.Translation(Vector((0, 0, 0.100))))

    obj_oil = link_obj("GEO_993_External_Oil_Lines_and_Thermostat", bm_oil, parent_col, mats["chrome"], bevel=0.002)
    objs.append(obj_oil)
    return objs

# ----------------------------------------------------------------------------
# 27. SUBSYSTEM 24: DRY-SUMP OIL TANK & FILTER CONSOLE
# ----------------------------------------------------------------------------

def build_993_dry_sump_oil_tank_and_filter_console(parent_col, mats):
    """
    Constructs the 993-specific dry-sump oil reservoir in the right rear quarter:
    - 11.5-liter stamped aluminum dry sump oil reservoir tank.
    - Extended oil filler neck with screw-on knurled cap in engine bay.
    - Engine oil dipstick guide tube and plastic pull handle.
    - Crankcase vapor oil separator and breather recirculation hoses.
    - Dual spin-on primary and secondary oil filter canisters.
    """
    objs = []
    bm_tank = bmesh.new()

    # 11.5L Dry Sump Oil Reservoir (Right Rear Quarter, X = +0.660m, Y = -1.350m, Z = 0.520m)
    mat_tank = Matrix.Translation(Vector((0.660, -1.350, 0.520)))
    bmesh.ops.create_cube(bm_tank, size=1.0, matrix=mat_tank @ Matrix.Diagonal(Vector((0.240, 0.340, 0.380, 1.0))))

    # Oil Filler Neck Routing Upward into Engine Bay (X = +0.550m, Y = -1.480m, Z = 0.720m)
    mat_fill_neck = Matrix.Translation(Vector((0.550, -1.480, 0.720))) @ Euler((math.radians(18), math.radians(-14), 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_tank, radius=0.028, depth=0.180, segments=16, matrix=mat_fill_neck)
    # Knurled Yellow/Black Oil Cap
    bmesh.ops.create_cylinder(bm_tank, radius=0.036, depth=0.025, segments=16, matrix=mat_fill_neck @ Matrix.Translation(Vector((0, 0, 0.095))))

    # Oil Level Dipstick Guide Tube & Ring Handle
    mat_dip = Matrix.Translation(Vector((0.510, -1.440, 0.700)))
    bmesh.ops.create_cylinder(bm_tank, radius=0.006, depth=0.220, segments=10, matrix=mat_dip)
    # Dipstick Pull Loop
    bmesh.ops.create_cylinder(bm_tank, radius=0.016, depth=0.008, segments=12, matrix=mat_dip @ Matrix.Translation(Vector((0, 0, 0.115))) @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Spin-On Oil Filter Canister (Right Engine Console)
    mat_filter = Matrix.Translation(Vector((0.440, -1.380, 0.440))) @ Euler((math.radians(22), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_tank, radius=0.046, depth=0.140, segments=18, matrix=mat_filter)

    # Crankcase Breather Rubber Hose to Intake Airbox
    mat_breath = Matrix.Translation(Vector((0.580, -1.300, 0.650))) @ Euler((0, math.radians(45), math.radians(-30)), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_tank, radius=0.014, depth=0.220, segments=12, matrix=mat_breath)

    obj_tank = link_obj("GEO_993_DrySump_OilTank_and_Filters", bm_tank, parent_col, mats["trim"], bevel=0.002)
    objs.append(obj_tank)
    return objs

# ----------------------------------------------------------------------------
# 28. SUBSYSTEM 25: VARIORAM INDUCTION SYSTEM & PLENUM
# ----------------------------------------------------------------------------

def build_993_varioram_induction_system_and_plenum(parent_col, mats):
    """
    Constructs the 1995+ Type 993 VarioRam variable-length induction system:
    - Twin cast aluminum upper resonance plenum chambers sitting atop the flat-six.
    - Central cast aluminum throttle body housing with butterfly valve spindle.
    - Long and short variable intake runners feeding individual cylinder intake ports.
    - Vacuum-operated VarioRam flap control actuators with vacuum lines.
    - Large volume conical induction air filter housing and Mass Airflow (MAF) sensor body.
    """
    objs = []
    bm_vram = bmesh.new()

    # Central Cast Aluminum Throttle Body Housing (Y = -1.420m, Z = 0.710m)
    mat_tb = Matrix.Translation(Vector((0.0, -1.420, 0.710)))
    bmesh.ops.create_cylinder(bm_vram, radius=0.048, depth=0.085, segments=20, matrix=mat_tb @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    # Throttle Position Sensor (TPS) Side Casing
    mat_tps = mat_tb @ Matrix.Translation(Vector((0.055, 0, 0)))
    bmesh.ops.create_cube(bm_vram, size=1.0, matrix=mat_tps @ Matrix.Diagonal(Vector((0.035, 0.045, 0.038, 1.0))))

    # Twin Left & Right VarioRam Upper Intake Plenum Chambers
    for px_sign in [-1.0, 1.0]:
        mat_plenum = Matrix.Translation(Vector((px_sign * 0.220, -1.440, 0.690)))
        bmesh.ops.create_cube(bm_vram, size=1.0, matrix=mat_plenum @ Matrix.Diagonal(Vector((0.260, 0.180, 0.110, 1.0))))

        # Transverse Resonance Crossover Tube connecting left and right plenums
        mat_cross_tube = Matrix.Translation(Vector((px_sign * 0.110, -1.440, 0.710)))
        bmesh.ops.create_cylinder(bm_vram, radius=0.036, depth=0.180, segments=16, matrix=mat_cross_tube @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # Vacuum Diaphragm Actuator for VarioRam Flaps
        mat_vac_act = Matrix.Translation(Vector((px_sign * 0.320, -1.390, 0.720)))
        bmesh.ops.create_cylinder(bm_vram, radius=0.024, depth=0.035, segments=14, matrix=mat_vac_act)

        # 3 Individual Curved Intake Runners Per Cylinder Bank
        for cyl_idx, y_offset in enumerate([-0.060, 0.000, 0.060]):
            mat_runner = Matrix.Translation(Vector((px_sign * 0.260, -1.440 + y_offset, 0.630))) @ Euler((0, px_sign * math.radians(28), 0), 'XYZ').to_matrix().to_4x4()
            bmesh.ops.create_cylinder(bm_vram, radius=0.022, depth=0.130, segments=14, matrix=mat_runner)
            # Fuel Injector Rail Boss
            mat_inj = mat_runner @ Matrix.Translation(Vector((0, 0, -0.055)))
            bmesh.ops.create_cylinder(bm_vram, radius=0.010, depth=0.035, segments=10, matrix=mat_inj)

    # Air Induction Filter Airbox (Right side of engine bay, X = +0.420m, Y = -1.620m, Z = 0.660m)
    mat_airbox = Matrix.Translation(Vector((0.420, -1.620, 0.660)))
    bmesh.ops.create_cube(bm_vram, size=1.0, matrix=mat_airbox @ Matrix.Diagonal(Vector((0.220, 0.260, 0.200, 1.0))))

    # Mass Airflow (MAF) Cylindrical Tube between airbox and throttle body
    mat_maf = Matrix.Translation(Vector((0.210, -1.520, 0.690))) @ Euler((0, 0, math.radians(-42)), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_vram, radius=0.044, depth=0.200, segments=18, matrix=mat_maf @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_vram = link_obj("GEO_993_VarioRam_Induction_Plenum", bm_vram, parent_col, mats["alloy"], bevel=0.002)
    objs.append(obj_vram)
    return objs

# ----------------------------------------------------------------------------
# 29. SUBSYSTEM 26: TWIN-SPARK DUAL DISTRIBUTOR & IGNITION HARNESS
# ----------------------------------------------------------------------------

def build_993_twin_spark_dual_distributor_and_ignition_harness(parent_col, mats):
    """
    Constructs the 993 twin-spark (12-plug) ignition architecture:
    - Dual distributor assembly driven off the intermediate shaft by internal cogged belt.
    - Two high-output Bosch ignition coils mounted on the left engine bulkhead.
    - Molded composite ignition cable guides and wire looms.
    - 12 high-tension silicone spark plug leads routed to upper and lower cylinder plug wells.
    """
    objs = []
    bm_ign = bmesh.new()

    # Dual Distributor Body (Left rear of flat-six, X = -0.260m, Y = -1.480m, Z = 0.620m)
    # Primary Distributor Housing
    mat_dist1 = Matrix.Translation(Vector((-0.240, -1.480, 0.620)))
    bmesh.ops.create_cylinder(bm_ign, radius=0.038, depth=0.080, segments=16, matrix=mat_dist1)
    bmesh.ops.create_cylinder(bm_ign, radius=0.034, depth=0.040, segments=16, matrix=mat_dist1 @ Matrix.Translation(Vector((0, 0, 0.055))))

    # Secondary Belt-Driven Distributor Housing (Adjacent)
    mat_dist2 = Matrix.Translation(Vector((-0.315, -1.480, 0.620)))
    bmesh.ops.create_cylinder(bm_ign, radius=0.038, depth=0.080, segments=16, matrix=mat_dist2)
    bmesh.ops.create_cylinder(bm_ign, radius=0.034, depth=0.040, segments=16, matrix=mat_dist2 @ Matrix.Translation(Vector((0, 0, 0.055))))

    # Internal Distributor Drive Belt Housing
    mat_belt_casing = Matrix.Translation(Vector((-0.278, -1.480, 0.585)))
    bmesh.ops.create_cube(bm_ign, size=1.0, matrix=mat_belt_casing @ Matrix.Diagonal(Vector((0.095, 0.055, 0.030, 1.0))))

    # Dual Bosch High-Output Ignition Coils (Left Bulkhead Wall, X = -0.520m, Y = -1.420m, Z = 0.710m)
    for c_idx, cy in enumerate([-1.380, -1.460]):
        mat_coil = Matrix.Translation(Vector((-0.520, cy, 0.710)))
        bmesh.ops.create_cylinder(bm_ign, radius=0.024, depth=0.110, segments=14, matrix=mat_coil)
        bmesh.ops.create_cylinder(bm_ign, radius=0.010, depth=0.025, segments=10, matrix=mat_coil @ Matrix.Translation(Vector((0, 0, 0.065))))

    # Molded Ignition Wire Conduit Trays (Left & Right Valve Covers)
    for lx_sign in [-1.0, 1.0]:
        mat_loom = Matrix.Translation(Vector((lx_sign * 0.450, -1.510, 0.460)))
        bmesh.ops.create_cube(bm_ign, size=1.0, matrix=mat_loom @ Matrix.Diagonal(Vector((0.032, 0.280, 0.032, 1.0))))

        # 6 Spark Plug Leads Emerging Per Side (3 Upper, 3 Lower)
        for p_idx, py in enumerate([-1.600, -1.510, -1.420]):
            # Upper plug boot
            mat_boot_u = Matrix.Translation(Vector((lx_sign * 0.480, py, 0.490))) @ Euler((0, lx_sign * math.radians(45), 0), 'XYZ').to_matrix().to_4x4()
            bmesh.ops.create_cylinder(bm_ign, radius=0.007, depth=0.045, segments=8, matrix=mat_boot_u)
            # Lower plug boot
            mat_boot_l = Matrix.Translation(Vector((lx_sign * 0.480, py, 0.410))) @ Euler((0, lx_sign * math.radians(-45), 0), 'XYZ').to_matrix().to_4x4()
            bmesh.ops.create_cylinder(bm_ign, radius=0.007, depth=0.045, segments=8, matrix=mat_boot_l)

    obj_ign = link_obj("GEO_993_TwinSpark_Ignition_and_Distributors", bm_ign, parent_col, mats["trim"], bevel=0.001)
    objs.append(obj_ign)
    return objs
'''
