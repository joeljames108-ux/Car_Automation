"""
Honda S2000 AP1 (2000s) Phase 17: Part G
Subsystems 27 to 32:
27. Hydraulic Clutch Master Cylinder, Slave Cylinder & Braided Line
28. 12V Compact Battery Box, Hold-Down Bracket & Ground Straps
29. Front Cowl Air Induction Grille & Wiper Pivot Spindles
30. Front Underbody Aluminum Skid Plate & Lower Radiator Air Dam
31. Quarter Panel Fuel Filler Neck & Stainless Flange Ring
32. Engine Bay Auxiliary Relay/Fuse Box & Harness Looms
"""

PART_S2K_G = '''
# ----------------------------------------------------------------------------
# 29. SUBSYSTEM 27: CLUTCH HYDRAULIC SYSTEM & SLAVE CYLINDER
# ----------------------------------------------------------------------------

def build_s2000_clutch_hydraulic_system(parent_col, mats):
    """
    Constructs the precision manual clutch actuation hydraulic hardware:
    - Compact clutch master cylinder mounted on firewall (Left X = -0.380m, Y = +0.860m, Z = 0.620m).
    - Remote translucent fluid reservoir with threaded cap.
    - Steel hardline running down firewall to transmission bellhousing.
    - Hydraulic slave cylinder and release fork boot on bellhousing (X = -0.110m, Y = +0.520m, Z = 0.320m).
    """
    objs = []
    bm_clutch = bmesh.new()

    # 1. Clutch Master Cylinder (Firewall Left, X = -0.380m, Y = 0.860m, Z = 0.620m)
    mat_cmc = Matrix.Translation(Vector((-0.380, 0.860, 0.620))) @ Euler((math.radians(-15), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_clutch, radius=0.018, depth=0.085, segments=14, matrix=mat_cmc @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Reservoir Fluid Cup (Mounted atop CMC)
    mat_res = mat_cmc @ Matrix.Translation(Vector((0, 0.020, 0.055)))
    bmesh.ops.create_cylinder(bm_clutch, radius=0.025, depth=0.055, segments=16, matrix=mat_res)
    # Reservoir Cap
    mat_cap = mat_res @ Matrix.Translation(Vector((0, 0, 0.030)))
    bmesh.ops.create_cylinder(bm_clutch, radius=0.027, depth=0.012, segments=16, matrix=mat_cap)

    # 2. Hydraulic Hardline routed down bellhousing
    mat_line = Matrix.Translation(Vector((-0.260, 0.680, 0.460))) @ Euler((math.radians(35), math.radians(-18), 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_clutch, radius=0.0035, depth=0.380, segments=8, matrix=mat_line)

    # 3. Clutch Slave Cylinder on Bellhousing (X = -0.110m, Y = 0.520m, Z = 0.320m)
    mat_slave = Matrix.Translation(Vector((-0.110, 0.520, 0.320))) @ Euler((0, math.radians(12), 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_clutch, radius=0.022, depth=0.095, segments=14, matrix=mat_slave @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    # Rubber Pushrod Dust Boot
    mat_boot = mat_slave @ Matrix.Translation(Vector((0, -0.055, 0)))
    bmesh.ops.create_cylinder(bm_clutch, radius=0.016, depth=0.035, segments=12, matrix=mat_boot @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_clutch = link_obj("GEO_S2K_Clutch_Hydraulic_System", bm_clutch, parent_col, mats["trim"], bevel=0.001)
    objs.append(obj_clutch)
    return objs

# ----------------------------------------------------------------------------
# 30. SUBSYSTEM 28: 12V LIGHTWEIGHT BATTERY & GROUND STRAPS
# ----------------------------------------------------------------------------

def build_s2000_battery_and_chassis_grounds(parent_col, mats):
    """
    Constructs the factory lightweight Group 51R battery and hold-down hardware:
    - Molded polypropylene battery casing nestled in engine bay right side (X = +0.440m, Y = +0.920m, Z = 0.540m).
    - Cast aluminum hold-down crossbar with threaded J-hooks.
    - Positive and negative lead battery terminals with red/black insulating rubber boots.
    - Braided copper chassis grounding straps bonded to inner apron.
    """
    objs = []
    bm_bat = bmesh.new()

    # 1. 12V Battery Case (X = +0.440m, Y = +0.920m, Z = 0.540m)
    mat_case = Matrix.Translation(Vector((0.440, 0.920, 0.540)))
    bmesh.ops.create_cube(bm_bat, size=1.0, matrix=mat_case @ Matrix.Diagonal(Vector((0.135, 0.220, 0.175, 1.0))))

    # Battery Top Cell Caps (6 Vent caps)
    for ci in range(6):
        y_cap = 0.840 + ci * 0.032
        mat_ccap = Matrix.Translation(Vector((0.440, y_cap, 0.630)))
        bmesh.ops.create_cylinder(bm_bat, radius=0.010, depth=0.008, segments=10, matrix=mat_ccap)

    # 2. Battery Hold-Down Crossbar & J-Hooks
    mat_bar = Matrix.Translation(Vector((0.440, 0.920, 0.632)))
    bmesh.ops.create_cube(bm_bat, size=1.0, matrix=mat_bar @ Matrix.Diagonal(Vector((0.145, 0.028, 0.012, 1.0))))
    for hx in [0.365, 0.515]:
        mat_hook = Matrix.Translation(Vector((hx, 0.920, 0.550)))
        bmesh.ops.create_cylinder(bm_bat, radius=0.004, depth=0.170, segments=8, matrix=mat_hook)

    # 3. Terminals: Positive (Red Boot) & Negative (Black Boot)
    mat_pos = Matrix.Translation(Vector((0.410, 0.850, 0.635)))
    bmesh.ops.create_cylinder(bm_bat, radius=0.012, depth=0.022, segments=12, matrix=mat_pos)
    mat_neg = Matrix.Translation(Vector((0.470, 0.990, 0.635)))
    bmesh.ops.create_cylinder(bm_bat, radius=0.011, depth=0.020, segments=12, matrix=mat_neg)

    # 4. Braided Ground Strap to Right Inner Apron (X = +0.470m to +0.580m)
    mat_strap = Matrix.Translation(Vector((0.525, 1.000, 0.620))) @ Euler((0, math.radians(25), 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_bat, size=1.0, matrix=mat_strap @ Matrix.Diagonal(Vector((0.110, 0.016, 0.004, 1.0))))

    obj_bat = link_obj("GEO_S2K_Battery_and_Chassis_Grounds", bm_bat, parent_col, mats["trim"], bevel=0.001)
    objs.append(obj_bat)
    return objs

# ----------------------------------------------------------------------------
# 31. SUBSYSTEM 29: COWL VENTILATION INDUCTION GRILLE & WIPER SPINDLES
# ----------------------------------------------------------------------------

def build_s2000_windshield_cowl_and_wiper_spindles(parent_col, mats):
    """
    Constructs the aerodynamic windshield cowl panel beneath windshield glass:
    - Molded satin black ABS cowl grille spanning base of windshield (Y = +0.720m to +0.860m, Z = 0.770m).
    - Transverse air intake ventilation louvers providing cabin fresh air induction.
    - Driver and passenger recessed dual windshield wiper pivot spindle hubs and knurled drive nuts.
    - Cowl rainwater drain scuppers and rubber sealing cowl edge gasket.
    """
    objs = []
    bm_cowl = bmesh.new()

    # 1. Main Cowl Leaf Screen Panel (Spanning Width X: -0.680m to +0.680m, Y = +0.790m, Z = 0.772m)
    mat_cowl = Matrix.Translation(Vector((0.0, 0.790, 0.772))) @ Euler((math.radians(12), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_cowl, size=1.0, matrix=mat_cowl @ Matrix.Diagonal(Vector((1.360, 0.140, 0.018, 1.0))))

    # 2. Transverse Intake Louvers (24 Procedural Slits)
    for li in range(12):
        x_l = -0.550 + li * 0.100
        mat_slit = mat_cowl @ Matrix.Translation(Vector((x_l, 0.0, 0.010)))
        bmesh.ops.create_cube(bm_cowl, size=1.0, matrix=mat_slit @ Matrix.Diagonal(Vector((0.075, 0.060, 0.006, 1.0))))

    # 3. Dual Windshield Wiper Pivot Spindles (Driver X = -0.380m, Passenger X = +0.120m)
    for wx in [-0.380, 0.120]:
        mat_spindle = Matrix.Translation(Vector((wx, 0.770, 0.785))) @ Euler((math.radians(18), 0, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_cowl, radius=0.016, depth=0.035, segments=16, matrix=mat_spindle)
        # Wiper Arm Pivot Hex Nut
        mat_nut = mat_spindle @ Matrix.Translation(Vector((0, 0, 0.020)))
        bmesh.ops.create_cylinder(bm_cowl, radius=0.012, depth=0.014, segments=6, matrix=mat_nut)

    # 4. Rubber Hood-to-Cowl Weatherstrip Bulb Seal
    mat_seal = Matrix.Translation(Vector((0.0, 0.720, 0.765)))
    bmesh.ops.create_cylinder(bm_cowl, radius=0.008, depth=1.340, segments=12, matrix=mat_seal @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_cowl = link_obj("GEO_S2K_Windshield_Cowl_and_Wipers", bm_cowl, parent_col, mats["trim"], bevel=0.001)
    objs.append(obj_cowl)
    return objs

# ----------------------------------------------------------------------------
# 32. SUBSYSTEM 30: FRONT UNDERBODY SKID PLATE & RADIATOR AIR DAM
# ----------------------------------------------------------------------------

def build_s2000_front_skid_plate_and_air_dam(parent_col, mats):
    """
    Constructs the front underbody aluminum aerodynamic skid plate and lower radiator air dam:
    - 2.0mm stamped aluminum cross-bracing skid plate bridging lower frame rails (Y = +1.280m to +1.820m).
    - Lower radiator flexible rubber vertical air dam strip preventing aerodynamic high-pressure spillover.
    - Recessed oil drain plug access port and oil filter service cutouts.
    - Quick-release Dzus fastener mounting bosses along front bumper perimeter.
    """
    objs = []
    bm_skid = bmesh.new()

    # 1. Main Aluminum Under-Engine Stiffening Shield (Y = +1.520m, Z = 0.145m, Width = 0.780m)
    mat_plate = Matrix.Translation(Vector((0.0, 1.520, 0.145)))
    bmesh.ops.create_cube(bm_skid, size=1.0, matrix=mat_plate @ Matrix.Diagonal(Vector((0.780, 0.540, 0.008, 1.0))))

    # Longitudinal Stiffening Ribs in Aluminum Sheet (3 parallel stampings)
    for rx in [-0.220, 0.0, 0.220]:
        mat_srib = Matrix.Translation(Vector((rx, 1.520, 0.142)))
        bmesh.ops.create_cube(bm_skid, size=1.0, matrix=mat_srib @ Matrix.Diagonal(Vector((0.035, 0.480, 0.012, 1.0))))

    # 2. Lower Radiator Rubber Air Dam Deflector (Vertical Rubber Flap, Y = +1.780m, Z = 0.105m)
    mat_dam = Matrix.Translation(Vector((0.0, 1.780, 0.105)))
    bmesh.ops.create_cube(bm_skid, size=1.0, matrix=mat_dam @ Matrix.Diagonal(Vector((0.840, 0.008, 0.065, 1.0))))

    # 3. Service Access Hole Rings (Oil drain inspection cutout, X = +0.080m, Y = 1.340m)
    mat_hole = Matrix.Translation(Vector((0.080, 1.340, 0.145)))
    bmesh.ops.create_cylinder(bm_skid, radius=0.048, depth=0.014, segments=18, matrix=mat_hole)

    obj_skid = link_obj("GEO_S2K_Front_Skid_Plate_and_Air_Dam", bm_skid, parent_col, mats["alloy"], bevel=0.001)
    objs.append(obj_skid)
    return objs

# ----------------------------------------------------------------------------
# 33. SUBSYSTEM 31: FUEL FILLER NECK & QUARTER PANEL FLANGE
# ----------------------------------------------------------------------------

def build_s2000_fuel_filler_neck_and_housing(parent_col, mats):
    """
    Constructs the left rear quarter panel fuel filler assembly:
    - Recessed filler pocket housing inside left rear quarter panel (X = -0.745m, Y = -1.180m, Z = 0.740m).
    - Threaded fuel filler neck with tethered fuel cap.
    - Rubber overflow drain apron and fuel splash scupper hole.
    - Cable-actuated fuel door spring latch release plunger mechanism.
    - Steel fuel filler pipe routing down inside left inner wheel tub into fuel tank.
    """
    objs = []
    bm_fuel = bmesh.new()

    # Left Quarter Panel Filler Pocket (X = -0.745m, Y = -1.180m, Z = 0.740m)
    mat_pocket = Matrix.Translation(Vector((-0.745, -1.180, 0.740))) @ Euler((0, math.radians(-14), 0), 'XYZ').to_matrix().to_4x4()
    # Recessed Pocket Cup
    bmesh.ops.create_cylinder(bm_fuel, radius=0.068, depth=0.045, segments=20, matrix=mat_pocket @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Threaded Filler Neck (Angled 45 deg)
    mat_neck = mat_pocket @ Matrix.Translation(Vector((0.015, 0, 0))) @ Euler((0, math.radians(25), 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_fuel, radius=0.024, depth=0.048, segments=18, matrix=mat_neck @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Tethered Plastic Gas Cap with Ratcheting Outer Flange
    mat_gcap = mat_neck @ Matrix.Translation(Vector((-0.025, 0, 0)))
    bmesh.ops.create_cylinder(bm_fuel, radius=0.028, depth=0.020, segments=18, matrix=mat_gcap @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Filler Pipe Running down to Fuel Tank (Passes through inner wheel arch, X = -0.700m to -0.420m, Z = 0.720m to 0.380m)
    mat_pipe = Matrix.Translation(Vector((-0.560, -1.180, 0.540))) @ Euler((0, math.radians(48), 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_fuel, radius=0.018, depth=0.420, segments=14, matrix=mat_pipe)

    # Spring-loaded Door Release Catch Pin (Y = -1.130m)
    mat_pin = mat_pocket @ Matrix.Translation(Vector((0, 0.052, 0)))
    bmesh.ops.create_cylinder(bm_fuel, radius=0.005, depth=0.018, segments=8, matrix=mat_pin @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_fuel = link_obj("GEO_S2K_Fuel_Filler_Neck_Assembly", bm_fuel, parent_col, mats["trim"], bevel=0.001)
    objs.append(obj_fuel)
    return objs

# ----------------------------------------------------------------------------
# 34. SUBSYSTEM 32: ENGINE BAY RELAY/FUSE BOX & WIRING LOOMS
# ----------------------------------------------------------------------------

def build_s2000_fuse_box_and_engine_bay_harnesses(parent_col, mats):
    """
    Constructs the engine bay electrical distribution infrastructure:
    - Main under-hood fuse and relay box mounted on left wheel tower apron (X = -0.520m, Y = +1.020m, Z = 0.620m).
    - High-amperage fusible link clear acrylic viewing window.
    - Corrugated split-loom main engine wiring harness traversing firewall and shock towers.
    - Secondary auxiliary relay box adjacent to radiator support.
    - Anodized brass chassis ground studs with multi-ring wire terminals.
    """
    objs = []
    bm_elec = bmesh.new()

    # 1. Main Under-Hood Fuse Box (Left Apron, X = -0.520m, Y = +1.020m, Z = 0.620m)
    mat_fuse = Matrix.Translation(Vector((-0.520, 1.020, 0.620)))
    bmesh.ops.create_cube(bm_elec, size=1.0, matrix=mat_fuse @ Matrix.Diagonal(Vector((0.115, 0.210, 0.095, 1.0))))
    # Snap-on Lid Rim
    mat_flid = mat_fuse @ Matrix.Translation(Vector((0, 0, 0.050)))
    bmesh.ops.create_cube(bm_elec, size=1.0, matrix=mat_flid @ Matrix.Diagonal(Vector((0.125, 0.220, 0.014, 1.0))))

    # 2. Main Firewall Harness Loom (Corrugated Conduit traversing from Left to Right, Y = 0.880m, Z = 0.640m)
    mat_harn = Matrix.Translation(Vector((0.0, 0.880, 0.640)))
    bmesh.ops.create_cylinder(bm_elec, radius=0.016, depth=1.050, segments=14, matrix=mat_harn @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Branch Conduit down to Engine Intake Manifold (X = -0.220m)
    mat_branch = Matrix.Translation(Vector((-0.220, 0.840, 0.580))) @ Euler((math.radians(35), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_elec, radius=0.011, depth=0.180, segments=10, matrix=mat_branch)

    # 3. Auxiliary Relay Box (Front Left by Radiator, X = -0.420m, Y = 1.620m, Z = 0.520m)
    mat_aux = Matrix.Translation(Vector((-0.420, 1.620, 0.520)))
    bmesh.ops.create_cube(bm_elec, size=1.0, matrix=mat_aux @ Matrix.Diagonal(Vector((0.075, 0.110, 0.065, 1.0))))

    # 4. Engine Bay Chassis Ground Terminals (Left and Right Aprons)
    for gx_sign in [-1.0, 1.0]:
        mat_gnd = Matrix.Translation(Vector((gx_sign * 0.480, 1.350, 0.580)))
        bmesh.ops.create_cylinder(bm_elec, radius=0.006, depth=0.015, segments=8, matrix=mat_gnd)
        # Eyelet Ring Terminal
        bmesh.ops.create_cylinder(bm_elec, radius=0.012, depth=0.004, segments=12, matrix=mat_gnd @ Matrix.Translation(Vector((0, 0, 0.005))))

    obj_elec = link_obj("GEO_S2K_Engine_Bay_FuseBox_and_Harnesses", bm_elec, parent_col, mats["trim"], bevel=0.001)
    objs.append(obj_elec)
    return objs
'''
