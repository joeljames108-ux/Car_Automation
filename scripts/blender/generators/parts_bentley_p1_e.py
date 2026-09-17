"""
Bentley Continental GT Speed Convertible (2020s) Phase 21: Part E
Subsystems 8 and 9:
- Subsystem 8: 6.0L Twin-Turbo W12 TSI Engine & Twin Water-to-Air Charge Intercoolers
- Subsystem 9: 8-Speed Dual-Clutch Transmission, Center Torsen Active AWD & Rear eLSD
"""

PART_BENTLEY_E = '''
# ----------------------------------------------------------------------------
# 8. SUBSYSTEM 8: 6.0L TWIN-TURBO W12 TSI ENGINE & TWIN INTERCOOLERS
# ----------------------------------------------------------------------------

def build_bentley_w12_powertrain(parent_col, mats):
    """
    Constructs the legendary Crewe-built 6.0-liter twin-turbocharged W12 TSI engine:
    - Unique "W" cylinder configuration (two narrow-angle 15-degree VR6 cylinder blocks
      canted at 72 degrees on a single high-strength forged crankshaft).
    - Compact longitudinal layout packaged neatly between front shock towers (Y: +0.920m to +1.580m).
    - Twin water-cooled twin-scroll turbochargers hung low on each exhaust bank.
    - Symmetrical cast aluminum twin-plenum intake manifold with polished Bentley emblem plate.
    - Front auxiliary belt drive with accessory pulleys (alternator, 48V starter-generator, AC compressor).
    """
    objs = []
    bm_block = bmesh.new()
    bm_turbo = bmesh.new()
    bm_plenum = bmesh.new()

    # 1. Main Crankcase & Oil Sump (Y: +0.940m to +1.560m, Z: 0.180m to 0.380m)
    mat_sump = Matrix.Translation(Vector((0.0, 1.250, 0.280)))
    bmesh.ops.create_cube(bm_block, size=1.0, matrix=mat_sump @ Matrix.Diagonal(Vector((0.520, 0.620, 0.200, 1.0))))

    # 2. Twin VR6 Cylinder Banks canted at 72 degrees (Left Bank & Right Bank)
    for bank_sign in [-1.0, 1.0]:
        bank_rot = Euler((0, bank_sign * math.radians(36), 0), 'XYZ').to_matrix().to_4x4()
        mat_bank = Matrix.Translation(Vector((bank_sign * 0.190, 1.250, 0.440))) @ bank_rot
        bmesh.ops.create_cube(bm_block, size=1.0, matrix=mat_bank @ Matrix.Diagonal(Vector((0.280, 0.580, 0.220, 1.0))))

        # Cylinder Head Valve Covers with Oil Cap & Direct Injection Rails
        mat_cover = mat_bank @ Matrix.Translation(Vector((0.0, 0.0, 0.130)))
        bmesh.ops.create_cube(bm_plenum, size=1.0, matrix=mat_cover @ Matrix.Diagonal(Vector((0.240, 0.560, 0.060, 1.0))))

        # 6 Ignition Coil Pack Pods per Bank (12 total for W12)
        for coil_i in range(6):
            coil_y = -0.220 + coil_i * 0.088
            mat_coil = mat_cover @ Matrix.Translation(Vector((0.0, coil_y, 0.040)))
            bmesh.ops.create_cylinder(bm_block, radius=0.016, depth=0.024, segments=12, matrix=mat_coil)

    # 3. High-Plenum Symmetrical Dual-Runner Intake Manifold (Vee Center, Z: 0.540m to 0.650m)
    mat_manifold = Matrix.Translation(Vector((0.0, 1.240, 0.580)))
    bmesh.ops.create_cube(bm_plenum, size=1.0, matrix=mat_manifold @ Matrix.Diagonal(Vector((0.440, 0.480, 0.120, 1.0))))

    # Central Engine Acoustic Cover with Chrome Flying 'B' Plaque
    mat_plaque = Matrix.Translation(Vector((0.0, 1.250, 0.655)))
    bmesh.ops.create_cube(bm_plenum, size=1.0, matrix=mat_plaque @ Matrix.Diagonal(Vector((0.260, 0.420, 0.025, 1.0))))
    mat_ins = mat_plaque @ Matrix.Translation(Vector((0.0, 0.0, 0.014)))
    bmesh.ops.create_cube(bm_block, size=1.0, matrix=mat_ins @ Matrix.Diagonal(Vector((0.140, 0.220, 0.010, 1.0))))

    # 4. Twin-Scroll Water-Cooled Turbochargers (Left & Right Flanks, low mount)
    for turbo_sign in [-1.0, 1.0]:
        mat_turb = Matrix.Translation(Vector((turbo_sign * 0.360, 1.180, 0.350)))
        # Turbine Exhaust Housing (Cast Iron / Nickel Alloy)
        bmesh.ops.create_cylinder(bm_turbo, radius=0.075, depth=0.090, segments=18, matrix=mat_turb @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
        # Compressor Housing (Polished Aluminum)
        mat_comp = mat_turb @ Matrix.Translation(Vector((turbo_sign * 0.040, 0.090, 0.0)))
        bmesh.ops.create_cylinder(bm_plenum, radius=0.082, depth=0.080, segments=18, matrix=mat_comp @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
        # Wastegate Actuator Canister
        mat_wg = mat_turb @ Matrix.Translation(Vector((0.0, -0.070, 0.070)))
        bmesh.ops.create_cylinder(bm_block, radius=0.025, depth=0.060, segments=12, matrix=mat_wg)

    # 5. Twin Water-to-Air Charge Air Intercooler Boxes (Front Left & Front Right of Engine Bay)
    for ic_sign in [-1.0, 1.0]:
        mat_ic = Matrix.Translation(Vector((ic_sign * 0.420, 1.620, 0.460)))
        bmesh.ops.create_cube(bm_plenum, size=1.0, matrix=mat_ic @ Matrix.Diagonal(Vector((0.180, 0.220, 0.240, 1.0))))
        # Aluminum Charge Air Mandrel Piping connecting Intercoolers to Throttle Bodies
        mat_pipe = Matrix.Translation(Vector((ic_sign * 0.300, 1.480, 0.560)))
        bmesh.ops.create_cylinder(bm_plenum, radius=0.038, depth=0.280, segments=16, matrix=mat_pipe @ Euler((0, ic_sign * math.radians(45), 0), 'XYZ').to_matrix().to_4x4())

    # 6. Front Accessory Belt Pulley Array (Y = +1.580m)
    pulleys = [
        (0.000, 0.280, 0.075, "Crankshaft Damper"),
        (-0.180, 0.420, 0.055, "48V Belt Starter-Gen"),
        (0.180, 0.400, 0.050, "AC Compressor"),
        (-0.160, 0.240, 0.045, "Water Pump"),
        (0.000, 0.480, 0.038, "Idler Pulley"),
    ]
    for px, pz, pr, pname in pulleys:
        mat_pul = Matrix.Translation(Vector((px, 1.585, pz)))
        bmesh.ops.create_cylinder(bm_block, radius=pr, depth=0.030, segments=18, matrix=mat_pul @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_block = link_obj("GEO_BENTLEY_W12_Engine_Block_Core", bm_block, parent_col, mats["engine_alloy"], bevel=0.002)
    obj_plenum = link_obj("GEO_BENTLEY_W12_Intake_Plenum_Manifolds", bm_plenum, parent_col, mats["chrome"], bevel=0.0015)
    obj_turbo = link_obj("GEO_BENTLEY_W12_Twin_Turbochargers", bm_turbo, parent_col, mats["trim_black"], bevel=0.002)

    objs.extend([obj_block, obj_plenum, obj_turbo])
    return objs


# ----------------------------------------------------------------------------
# 9. SUBSYSTEM 9: 8-SPEED DUAL-CLUTCH TRANSMISSION & ACTIVE AWD DRIVELINE
# ----------------------------------------------------------------------------

def build_bentley_transmission_and_awd(parent_col, mats):
    """
    Constructs the rapid-shifting 8-speed dual-clutch transmission and active AWD driveline:
    - High-torque 8-speed wet dual-clutch transmission casing with ribbed structural bellhousing.
    - Integrated central Torsen active torque-split transfer unit routing up to 38% front / 62% rear.
    - Front propshaft passing offset alongside engine block to front differential.
    - Heavy-duty rear carbon-fiber composite propshaft to rear electronic limited-slip differential (eLSD).
    - Front & rear left/right high-tensile CV axle half-shafts.
    """
    objs = []
    bm_trans = bmesh.new()
    bm_driveline = bmesh.new()

    # 1. 8-Speed Dual-Clutch Gearbox Bellhousing & Main Casing (Y: +0.320m to +0.940m, Z: 0.220m to 0.420m)
    mat_gearbox = Matrix.Translation(Vector((0.0, 0.630, 0.320)))
    # Flared Bellhousing meeting W12 engine flywheel
    mat_bell = mat_gearbox @ Matrix.Translation(Vector((0, 0.240, 0)))
    bmesh.ops.create_cylinder(bm_trans, radius=0.240, depth=0.220, segments=22, matrix=mat_bell @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    # Main Dual-Clutch Transmission Casing with Ribbed Sump
    bmesh.ops.create_cube(bm_trans, size=1.0, matrix=mat_gearbox @ Matrix.Diagonal(Vector((0.340, 0.520, 0.260, 1.0))))

    # 2. Integrated Center Transfer Unit & Front Output Shaft (Y: +0.420m)
    mat_transfer = Matrix.Translation(Vector((0.140, 0.480, 0.280)))
    bmesh.ops.create_cube(bm_trans, size=1.0, matrix=mat_transfer @ Matrix.Diagonal(Vector((0.180, 0.240, 0.200, 1.0))))

    # Front Propshaft to Front Differential (Offset X = +0.140m, Y: +0.480m to +1.425m)
    mat_fprop = Matrix.Translation(Vector((0.140, 0.950, 0.280)))
    bmesh.ops.create_cylinder(bm_driveline, radius=0.032, depth=0.945, segments=16, matrix=mat_fprop @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Front Axle Differential Casing (Integrated into engine oil pan at Y = +1.425m)
    mat_fdiff = Matrix.Translation(Vector((0.080, 1.425, 0.310)))
    bmesh.ops.create_cube(bm_trans, size=1.0, matrix=mat_fdiff @ Matrix.Diagonal(Vector((0.260, 0.280, 0.240, 1.0))))

    # Front Left & Right Axle Half-Shafts (to front wheel hubs)
    for fx_sign in [-1.0, 1.0]:
        mat_fhalf = Matrix.Translation(Vector((fx_sign * 0.440, 1.425, 0.365)))
        bmesh.ops.create_cylinder(bm_driveline, radius=0.022, depth=0.680, segments=14, matrix=mat_fhalf @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())
        # Heavy-Duty CV Joint Rubber Boots
        for cv_off in [-0.260, 0.260]:
            mat_fboot = mat_fhalf @ Matrix.Translation(Vector((cv_off, 0, 0)))
            bmesh.ops.create_cylinder(bm_trans, radius=0.038, depth=0.065, segments=14, matrix=mat_fboot @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # 3. Main Rear Carbon-Fiber Propshaft (Y: -1.260m to +0.320m, Z = 0.280m)
    mat_rprop = Matrix.Translation(Vector((0.0, -0.470, 0.280)))
    bmesh.ops.create_cylinder(bm_driveline, radius=0.042, depth=1.580, segments=18, matrix=mat_rprop @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    # Propshaft Center Support Bearing & Vibration Damper Bracket (Y = -0.450m)
    mat_cb = Matrix.Translation(Vector((0.0, -0.450, 0.280)))
    bmesh.ops.create_cube(bm_trans, size=1.0, matrix=mat_cb @ Matrix.Diagonal(Vector((0.220, 0.080, 0.140, 1.0))))

    # 4. Rear Electronic Limited-Slip Differential (eLSD) Casing (Axle Y = -1.426m, Z = 0.340m)
    mat_rdiff = Matrix.Translation(Vector((0.0, -1.426, 0.340)))
    bmesh.ops.create_cube(bm_trans, size=1.0, matrix=mat_rdiff @ Matrix.Diagonal(Vector((0.380, 0.360, 0.300, 1.0))))
    # Rear eLSD Electric Torque Vectoring Actuator Motor (Mounted on left side of diff)
    mat_lact = mat_rdiff @ Matrix.Translation(Vector((-0.240, 0.040, 0.050)))
    bmesh.ops.create_cylinder(bm_trans, radius=0.048, depth=0.140, segments=16, matrix=mat_lact @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Rear Left & Right Heavy-Duty Axle Half-Shafts
    for rx_sign in [-1.0, 1.0]:
        mat_rhalf = Matrix.Translation(Vector((rx_sign * 0.440, -1.426, 0.365)))
        bmesh.ops.create_cylinder(bm_driveline, radius=0.024, depth=0.680, segments=14, matrix=mat_rhalf @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())
        # CV Joint Rubber Boots
        for cv_off in [-0.260, 0.260]:
            mat_rboot = mat_rhalf @ Matrix.Translation(Vector((cv_off, 0, 0)))
            bmesh.ops.create_cylinder(bm_trans, radius=0.040, depth=0.070, segments=14, matrix=mat_rboot @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_trans = link_obj("GEO_BENTLEY_8Speed_DualClutch_Transmission", bm_trans, parent_col, mats["engine_alloy"], bevel=0.002)
    obj_driveline = link_obj("GEO_BENTLEY_Active_AWD_Driveline_Propshafts", bm_driveline, parent_col, mats["trim_black"], bevel=0.0015)

    objs.extend([obj_trans, obj_driveline])
    return objs
'''
