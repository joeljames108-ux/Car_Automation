"""
Honda S2000 AP1 (2000s) Phase 17: Part B
Subsystems 5 to 8:
5. Front & Rear Polyurethane Bumpers & Primary Optics
6. Front In-Wheel Double Wishbone Suspension & EPS Rack
7. Rear Multi-Link Double Wishbone Suspension & Subframe
8. F20C 2.0L DOHC VTEC Inline-Four Powertrain & 6-Speed
"""

PART_S2K_B = '''
# ----------------------------------------------------------------------------
# 7. SUBSYSTEM 5: POLYURETHANE BUMPERS & VALANCES
# ----------------------------------------------------------------------------

def build_s2000_polyurethane_bumpers_and_valances(parent_col, mats):
    """
    Constructs the aerodynamic front and rear bumpers:
    - Front bumper fascia with signature five-sided center grille intake mouth (Y = +1.980m).
    - Lower chin spoiler lip and twin corner brake cooling air pocket recesses.
    - Rear bumper fascia with dual round exhaust cutouts (X = +/- 0.460m, Y = -2.020m).
    - Recessed rear license plate mounting pocket.
    """
    objs = []
    bm_bump = bmesh.new()
    bm_grille = bmesh.new()

    # 1. Front Aerodynamic Lower Bumper Valance & Chin (Y = +1.980m to +2.050m, Z = 0.180m to 0.340m)
    mat_f_valance = Matrix.Translation(Vector((0.0, 2.020, 0.240))) @ Euler((math.radians(-6), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_bump, size=1.0, matrix=mat_f_valance @ Matrix.Diagonal(Vector((1.580, 0.065, 0.120, 1.0))))

    # Front Valance Side Wrap-Around Corners (Left & Right to front wheel arch)
    for fx_sign in [-1.0, 1.0]:
        mat_f_wrap = Matrix.Translation(Vector((fx_sign * 0.740, 1.880, 0.250))) @ Euler((0, fx_sign * math.radians(-15), fx_sign * math.radians(18)), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_bump, size=1.0, matrix=mat_f_wrap @ Matrix.Diagonal(Vector((0.080, 0.260, 0.130, 1.0))))

    # Five-Sided Central Grille Air Intake (Width 0.680m, Height 0.120m, Z = 0.290m)
    mat_intake = Matrix.Translation(Vector((0.0, 2.035, 0.290)))
    bmesh.ops.create_cube(bm_grille, size=1.0, matrix=mat_intake @ Matrix.Diagonal(Vector((0.680, 0.040, 0.120, 1.0))))

    # Black Slat Grille Blades inside mouth
    for s_idx in [-0.030, 0.000, 0.030]:
        mat_slat = mat_intake @ Matrix.Translation(Vector((0, 0.010, s_idx)))
        bmesh.ops.create_cube(bm_grille, size=1.0, matrix=mat_slat @ Matrix.Diagonal(Vector((0.660, 0.010, 0.006, 1.0))))

    # Left & Right Corner Brake Duct Inlets (X = +/- 0.580m, Y = +2.000m, Z = 0.250m)
    for cx_sign in [-1.0, 1.0]:
        mat_duct = Matrix.Translation(Vector((cx_sign * 0.580, 2.005, 0.250))) @ Euler((0, 0, cx_sign * math.radians(-16)), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_grille, size=1.0, matrix=mat_duct @ Matrix.Diagonal(Vector((0.140, 0.040, 0.075, 1.0))))

    # 2. Rear Lower Bumper Valance & Diffuser Apron (Y = -2.000m to -2.050m, Z = 0.180m to 0.350m)
    mat_r_valance = Matrix.Translation(Vector((0.0, -2.015, 0.265))) @ Euler((math.radians(8), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_bump, size=1.0, matrix=mat_r_valance @ Matrix.Diagonal(Vector((1.600, 0.065, 0.140, 1.0))))

    # Rear Valance Wrap-Around Corners (Left & Right to rear wheel arch)
    for rx_sign in [-1.0, 1.0]:
        mat_r_wrap = Matrix.Translation(Vector((rx_sign * 0.740, -1.860, 0.270))) @ Euler((0, rx_sign * math.radians(14), rx_sign * math.radians(-18)), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_bump, size=1.0, matrix=mat_r_wrap @ Matrix.Diagonal(Vector((0.080, 0.280, 0.140, 1.0))))

    # Dual Symmetrical Round Exhaust Cutouts (X = +/- 0.520m, Z = 0.222m)
    for ex_sign in [-1.0, 1.0]:
        mat_ex_cut = Matrix.Translation(Vector((ex_sign * 0.520, -2.015, 0.222)))
        bmesh.ops.create_cylinder(bm_grille, radius=0.052, depth=0.080, segments=20, matrix=mat_ex_cut @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Rear License Plate Recessed Pocket (Center, Y = -2.025m, Z = 0.480m)
    mat_lp_pocket = Matrix.Translation(Vector((0.0, -2.025, 0.480))) @ Euler((math.radians(-14), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_grille, size=1.0, matrix=mat_lp_pocket @ Matrix.Diagonal(Vector((0.440, 0.035, 0.160, 1.0))))

    obj_bump = link_obj("GEO_S2K_Polyurethane_Bumpers", bm_bump, parent_col, mats["body"], bevel=0.002)
    obj_grille = link_obj("GEO_S2K_Bumper_Grilles_and_Cutouts", bm_grille, parent_col, mats["trim"], bevel=0.001)

    objs.extend([obj_bump, obj_grille])
    return objs

# ----------------------------------------------------------------------------
# 8. SUBSYSTEM 6: FRONT IN-WHEEL DOUBLE WISHBONE SUSPENSION & EPS
# ----------------------------------------------------------------------------

def build_s2000_front_double_wishbone_and_eps(parent_col, mats):
    """
    Constructs Honda's race-bred in-wheel double wishbone front suspension:
    - Upper forged aluminum A-arm wishbone bolted to inner fender shock tower.
    - Lower wide-base steel control arm mounted to front subframe cradle.
    - Coilover spring and monotube damper assembly.
    - Front steering knuckle upright with sealed hub bearing.
    - Electric Power Steering (EPS) rack-and-pinion unit and tie rods.
    """
    objs = []
    bm_susp = bmesh.new()
    bm_eps = bmesh.new()

    for fx_sign in [-1.0, 1.0]:
        # Front Wheel Center: X = +/- 0.735m, Y = +1.200m, Z = 0.316m
        mat_hub = Matrix.Translation(Vector((fx_sign * 0.735, 1.200, 0.316)))

        # 1. Cast Aluminum Steering Knuckle Upright
        mat_knuckle = Matrix.Translation(Vector((fx_sign * 0.650, 1.200, 0.320)))
        bmesh.ops.create_cube(bm_susp, size=1.0, matrix=mat_knuckle @ Matrix.Diagonal(Vector((0.045, 0.085, 0.220, 1.0))))

        # 2. Upper Forged A-Arm Wishbone (Z = 0.420m, spanning from inner rail X = +/- 0.440m to knuckle X = +/- 0.650m)
        mat_u_arm = Matrix.Translation(Vector((fx_sign * 0.545, 1.200, 0.420)))
        bmesh.ops.create_cube(bm_susp, size=1.0, matrix=mat_u_arm @ Matrix.Diagonal(Vector((0.220, 0.240, 0.024, 1.0))))
        # Inner Wishbone Pivot Bushing Sleeves
        for py in [1.080, 1.320]:
            mat_pbush = Matrix.Translation(Vector((fx_sign * 0.440, py, 0.420)))
            bmesh.ops.create_cylinder(bm_susp, radius=0.016, depth=0.045, segments=12, matrix=mat_pbush @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # 3. Lower Wide-Base Control Arm (Z = 0.210m, spanning from subframe X = +/- 0.380m to knuckle X = +/- 0.640m)
        mat_l_arm = Matrix.Translation(Vector((fx_sign * 0.510, 1.200, 0.210)))
        bmesh.ops.create_cube(bm_susp, size=1.0, matrix=mat_l_arm @ Matrix.Diagonal(Vector((0.260, 0.280, 0.028, 1.0))))
        # Inner Pivot Bushings
        for lpy in [1.060, 1.340]:
            mat_lpbush = Matrix.Translation(Vector((fx_sign * 0.380, lpy, 0.210)))
            bmesh.ops.create_cylinder(bm_susp, radius=0.018, depth=0.050, segments=12, matrix=mat_lpbush @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # 4. Front Coilover Spring & Monotube Damper Unit (Angled inward ~12 deg)
        p_damper_bot = Vector((fx_sign * 0.580, 1.200, 0.220))
        p_damper_top = Vector((fx_sign * 0.480, 1.200, 0.580))
        mat_damper = Matrix.Translation((p_damper_bot + p_damper_top) * 0.5) @ Vector((0, 0, 1)).rotation_difference(p_damper_top - p_damper_bot).to_matrix().to_4x4()
        # Damper Body Tube
        bmesh.ops.create_cylinder(bm_susp, radius=0.024, depth=0.360, segments=16, matrix=mat_damper)
        # Helical Coil Spring
        bmesh.ops.create_cylinder(bm_susp, radius=0.042, depth=0.240, segments=16, matrix=mat_damper @ Matrix.Translation(Vector((0, 0, 0.030))))

        # 5. Steering Tie-Rod extending from EPS rack to steering knuckle
        p_tierod_in = Vector((fx_sign * 0.280, 1.120, 0.240))
        p_tierod_out = Vector((fx_sign * 0.640, 1.130, 0.245))
        mat_trod = Matrix.Translation((p_tierod_in + p_tierod_out) * 0.5) @ Vector((0, 0, 1)).rotation_difference(p_tierod_out - p_tierod_in).to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_eps, radius=0.009, depth=(p_tierod_out - p_tierod_in).length, segments=10, matrix=mat_trod)
        # Accordion Rubber Steering Boot
        bmesh.ops.create_cylinder(bm_eps, radius=0.024, depth=0.080, segments=12, matrix=Matrix.Translation(Vector((fx_sign * 0.320, 1.120, 0.240))) @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # 6. Central Electric Power Steering (EPS) Motor & Rack Casing (Y = +1.120m, Z = 0.240m)
    mat_rack = Matrix.Translation(Vector((0.0, 1.120, 0.240)))
    bmesh.ops.create_cylinder(bm_eps, radius=0.032, depth=0.560, segments=16, matrix=mat_rack @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())
    # Electric Assist Motor Housing on Rack
    mat_eps_motor = mat_rack @ Matrix.Translation(Vector((-0.120, -0.045, 0.030)))
    bmesh.ops.create_cylinder(bm_eps, radius=0.048, depth=0.120, segments=18, matrix=mat_eps_motor)

    obj_susp = link_obj("GEO_S2K_Front_DoubleWishbone_Suspension", bm_susp, parent_col, mats["alloy"], bevel=0.0015)
    obj_eps = link_obj("GEO_S2K_EPS_Steering_Rack_and_Rods", bm_eps, parent_col, mats["trim"], bevel=0.001)

    objs.extend([obj_susp, obj_eps])
    return objs

# ----------------------------------------------------------------------------
# 9. SUBSYSTEM 7: REAR DOUBLE WISHBONE SUSPENSION & SUBFRAME
# ----------------------------------------------------------------------------

def build_s2000_rear_double_wishbone_and_subframe(parent_col, mats):
    """
    Constructs the high-rigidity rear multi-link double wishbone suspension:
    - Cast aluminum rear structural subframe cradle isolating differential and suspension.
    - Upper forged aluminum A-arm wishbone.
    - Lower control arm and independent toe control link for bump-steer suppression.
    - Rear coilover monotube spring/strut assembly.
    - Forged rear hub knuckle uprights with ABS wheel speed tone rings.
    """
    objs = []
    bm_subframe = bmesh.new()
    bm_rsusp = bmesh.new()

    # 1. Cast Aluminum Rear Subframe Cradle (Y = -1.200m, Z = 0.220m)
    mat_rf = Matrix.Translation(Vector((0.0, -1.200, 0.220)))
    # Subframe Main Transverse Member
    bmesh.ops.create_cube(bm_subframe, size=1.0, matrix=mat_rf @ Matrix.Diagonal(Vector((0.840, 0.220, 0.065, 1.0))))
    # Subframe Forward Longitudinal Cradle Legs
    for lx_sign in [-1.0, 1.0]:
        mat_leg = Matrix.Translation(Vector((lx_sign * 0.380, -1.050, 0.240)))
        bmesh.ops.create_cube(bm_subframe, size=1.0, matrix=mat_leg @ Matrix.Diagonal(Vector((0.065, 0.320, 0.055, 1.0))))
        # Chassis Mounting Bushing Plates
        bmesh.ops.create_cylinder(bm_subframe, radius=0.035, depth=0.040, segments=14, matrix=Matrix.Translation(Vector((lx_sign * 0.380, -0.900, 0.250))))

    # 2. Rear Wishbones & Hub Knuckles (Left & Right)
    for rx_sign in [-1.0, 1.0]:
        # Hub Carrier Knuckle
        mat_rknuckle = Matrix.Translation(Vector((rx_sign * 0.660, -1.200, 0.320)))
        bmesh.ops.create_cube(bm_rsusp, size=1.0, matrix=mat_rknuckle @ Matrix.Diagonal(Vector((0.050, 0.095, 0.220, 1.0))))

        # Upper Wishbone A-Arm (Z = 0.420m)
        mat_ru_arm = Matrix.Translation(Vector((rx_sign * 0.540, -1.200, 0.420)))
        bmesh.ops.create_cube(bm_rsusp, size=1.0, matrix=mat_ru_arm @ Matrix.Diagonal(Vector((0.220, 0.240, 0.024, 1.0))))

        # Lower Control Arm (Z = 0.210m)
        mat_rl_arm = Matrix.Translation(Vector((rx_sign * 0.520, -1.200, 0.210)))
        bmesh.ops.create_cube(bm_rsusp, size=1.0, matrix=mat_rl_arm @ Matrix.Diagonal(Vector((0.260, 0.260, 0.026, 1.0))))

        # Independent Toe Control Link (Trailing behind lower arm, Y = -1.320m)
        p_toe_in = Vector((rx_sign * 0.360, -1.320, 0.220))
        p_toe_out = Vector((rx_sign * 0.650, -1.260, 0.225))
        mat_toe = Matrix.Translation((p_toe_in + p_toe_out) * 0.5) @ Vector((0, 0, 1)).rotation_difference(p_toe_out - p_toe_in).to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_rsusp, radius=0.009, depth=(p_toe_out - p_toe_in).length, segments=10, matrix=mat_toe)

        # Rear Coilover Assembly
        p_rdamp_bot = Vector((rx_sign * 0.590, -1.200, 0.220))
        p_rdamp_top = Vector((rx_sign * 0.490, -1.200, 0.580))
        mat_rdamp = Matrix.Translation((p_rdamp_bot + p_rdamp_top) * 0.5) @ Vector((0, 0, 1)).rotation_difference(p_rdamp_top - p_rdamp_bot).to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_rsusp, radius=0.024, depth=0.360, segments=16, matrix=mat_rdamp)
        bmesh.ops.create_cylinder(bm_rsusp, radius=0.042, depth=0.240, segments=16, matrix=mat_rdamp @ Matrix.Translation(Vector((0, 0, 0.030))))

    obj_subframe = link_obj("GEO_S2K_Rear_Aluminum_Subframe", bm_subframe, parent_col, mats["alloy"], bevel=0.002)
    obj_rsusp = link_obj("GEO_S2K_Rear_DoubleWishbone_Suspension", bm_rsusp, parent_col, mats["alloy"], bevel=0.0015)

    objs.extend([obj_subframe, obj_rsusp])
    return objs

# ----------------------------------------------------------------------------
# 10. SUBSYSTEM 8: F20C 2.0L DOHC VTEC POWERTRAIN & 6-SPEED TRANSMISSION
# ----------------------------------------------------------------------------

def build_s2000_f20c_powertrain_and_transmission(parent_col, mats):
    """
    Constructs the legendary high-revving F20C Front Mid-Ship powertrain:
    - Longitudinally mounted F20C 2.0L inline-four engine block completely behind front axle (Y: +0.480m to +1.020m).
    - Signature Red Powder-Coated VTEC Aluminum Cam Valve Cover.
    - Deep cast aluminum finned oil sump pan.
    - Alternator, water pump, and serpentine belt drive pulleys on engine front face.
    - Longitudinal 6-speed manual short-throw transmission extending back through center tunnel.
    """
    objs = []
    bm_block = bmesh.new()
    bm_vtec = bmesh.new()
    bm_trans = bmesh.new()
    bm_pulley = bmesh.new()

    # Engine Center Coordinate: X = 0.000m, Y = +0.760m, Z = 0.440m
    # 1. Cast Aluminum Cylinder Block & Crankcase
    mat_block = Matrix.Translation(Vector((0.0, 0.760, 0.440)))
    bmesh.ops.create_cube(bm_block, size=1.0, matrix=mat_block @ Matrix.Diagonal(Vector((0.340, 0.480, 0.280, 1.0))))

    # Deep Finned Aluminum Oil Pan (Underside of block, Z = 0.220m)
    mat_pan = Matrix.Translation(Vector((0.0, 0.760, 0.230)))
    bmesh.ops.create_cube(bm_block, size=1.0, matrix=mat_pan @ Matrix.Diagonal(Vector((0.320, 0.440, 0.120, 1.0))))

    # 2. Signature Wrinkle-Red VTEC Dual-Overhead Cam Valve Cover (Z = 0.620m)
    mat_vc = Matrix.Translation(Vector((0.0, 0.760, 0.615)))
    bmesh.ops.create_cube(bm_vtec, size=1.0, matrix=mat_vc @ Matrix.Diagonal(Vector((0.260, 0.480, 0.075, 1.0))))
    # Dual Camshaft Humps
    for cx in [-0.070, 0.070]:
        mat_chump = mat_vc @ Matrix.Translation(Vector((cx, 0, 0.038)))
        bmesh.ops.create_cylinder(bm_vtec, radius=0.038, depth=0.460, segments=16, matrix=mat_chump @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Central Spark Plug Wire Cover Plate (Black composite plate atop valve cover)
    mat_wire_cov = mat_vc @ Matrix.Translation(Vector((0, 0, 0.040)))
    bmesh.ops.create_cube(bm_trans, size=1.0, matrix=mat_wire_cov @ Matrix.Diagonal(Vector((0.080, 0.420, 0.012, 1.0))))

    # 3. Front Accessory Drive Pulleys (Front engine face, Y = +1.020m)
    # Crankshaft Harmonic Balancer Pulley
    mat_crank_p = Matrix.Translation(Vector((0.0, 1.020, 0.320)))
    bmesh.ops.create_cylinder(bm_pulley, radius=0.065, depth=0.035, segments=20, matrix=mat_crank_p @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    # Alternator Pulley (Left side)
    mat_alt_p = Matrix.Translation(Vector((-0.180, 1.000, 0.480)))
    bmesh.ops.create_cylinder(bm_pulley, radius=0.035, depth=0.030, segments=16, matrix=mat_alt_p @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    # Serpentine Belt
    mat_belt = Matrix.Translation(Vector((0.0, 1.015, 0.400)))
    bmesh.ops.create_cube(bm_trans, size=1.0, matrix=mat_belt @ Matrix.Diagonal(Vector((0.360, 0.015, 0.220, 1.0))))

    # 4. 6-Speed Manual Transmission Casing (Extending from Y = +0.520m to Y = -0.220m)
    # Clutch Bellhousing (Bolted to rear of block)
    mat_bell = Matrix.Translation(Vector((0.0, 0.440, 0.380)))
    bmesh.ops.create_cone(bm_trans, radius1=0.180, radius2=0.120, depth=0.160, segments=20, matrix=mat_bell @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Main 6-Speed Gearbox Body
    mat_gb = Matrix.Translation(Vector((0.0, 0.180, 0.350)))
    bmesh.ops.create_cylinder(bm_trans, radius=0.110, depth=0.380, segments=18, matrix=mat_gb @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Transmission Rear Extension Housing / Output Tailshaft
    mat_tail = Matrix.Translation(Vector((0.0, -0.120, 0.330)))
    bmesh.ops.create_cone(bm_trans, radius1=0.095, radius2=0.055, depth=0.240, segments=16, matrix=mat_tail @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_block = link_obj("GEO_S2K_F20C_Engine_Block", bm_block, parent_col, mats["alloy"], bevel=0.002)
    obj_vtec = link_obj("GEO_S2K_VTEC_WrinkleRed_ValveCover", bm_vtec, parent_col, mats["vtec_red"], bevel=0.0015)
    obj_trans = link_obj("GEO_S2K_6Speed_Transmission_Casing", bm_trans, parent_col, mats["alloy"], bevel=0.002)
    obj_pulley = link_obj("GEO_S2K_Engine_Accessory_Pulleys", bm_pulley, parent_col, mats["chrome"], bevel=0.0008)

    objs.extend([obj_block, obj_vtec, obj_trans, obj_pulley])
    return objs
'''
