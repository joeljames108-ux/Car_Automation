"""
Honda S2000 AP1 (2000s) Phase 17: Part C
Subsystems 9 to 12:
9. Tuned Stainless Exhaust Header, Cat, Dual Mufflers & Pipes
10. Torsen Type-I Limited-Slip Differential & Finned Casing
11. Aluminum Crossflow Radiator, Dual Fans & A/C Condenser
12. Hydraulic Brake Hardlines, ABS Modulator & Fuel Tank
"""

PART_S2K_C = '''
# ----------------------------------------------------------------------------
# 11. SUBSYSTEM 9: EXHAUST SYSTEM, DUAL MUFFLERS & PIPING
# ----------------------------------------------------------------------------

def build_s2000_exhaust_system_and_dual_mufflers(parent_col, mats):
    """
    Constructs the tuned performance exhaust system:
    - 4-into-2-into-1 stainless steel tubular exhaust header on right engine bank.
    - Underfloor catalytic converter and central resonator tube.
    - Symmetrical Y-pipe split behind rear differential.
    - Dual transverse stainless steel rear mufflers with twin polished exit pipes.
    """
    objs = []
    bm_header = bmesh.new()
    bm_exhaust = bmesh.new()

    # 1. 4-into-2-into-1 Tubular Stainless Exhaust Header (Right side of F20C, X = +0.180m)
    for cyl_idx, cy in enumerate([0.940, 0.820, 0.700, 0.580]):
        mat_prim = Matrix.Translation(Vector((0.190, cy, 0.520))) @ Euler((0, math.radians(40), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_header, radius=0.019, depth=0.180, segments=12, matrix=mat_prim)

    # Secondary Collector (Y = +0.500m, Z = 0.320m)
    mat_coll = Matrix.Translation(Vector((0.210, 0.440, 0.280))) @ Euler((math.radians(28), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_header, radius=0.028, depth=0.220, segments=14, matrix=mat_coll)

    # 2. Catalytic Converter & Center Resonator (Y: +0.200m to -0.600m, Z = 0.200m)
    mat_cat = Matrix.Translation(Vector((0.140, 0.050, 0.210)))
    bmesh.ops.create_cylinder(bm_exhaust, radius=0.062, depth=0.340, segments=18, matrix=mat_cat @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Mid-Pipe Resonator
    mat_res = Matrix.Translation(Vector((0.080, -0.450, 0.215)))
    bmesh.ops.create_cylinder(bm_exhaust, radius=0.052, depth=0.380, segments=16, matrix=mat_res @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 3. Y-Pipe Split behind differential (Y = -1.450m, Z = 0.225m)
    mat_ypipe = Matrix.Translation(Vector((0.0, -1.450, 0.225)))
    bmesh.ops.create_cylinder(bm_exhaust, radius=0.026, depth=0.480, segments=12, matrix=mat_ypipe @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # 4. Dual Stainless Steel Mufflers (Left & Right rear corners, X = +/- 0.460m, Y = -1.780m, Z = 0.240m)
    for mx_sign in [-1.0, 1.0]:
        mat_muff = Matrix.Translation(Vector((mx_sign * 0.460, -1.780, 0.240)))
        bmesh.ops.create_cylinder(bm_exhaust, radius=0.085, depth=0.380, segments=20, matrix=mat_muff @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # Exit Tailpipe through bumper scallop (X = +/- 0.460m, Y = -2.040m, Z = 0.220m)
        mat_pipe = Matrix.Translation(Vector((mx_sign * 0.460, -2.000, 0.220)))
        bmesh.ops.create_cylinder(bm_exhaust, radius=0.038, depth=0.160, segments=18, matrix=mat_pipe @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_header = link_obj("GEO_S2K_Stainless_Exhaust_Header", bm_header, parent_col, mats["chrome"], bevel=0.001)
    obj_exhaust = link_obj("GEO_S2K_Exhaust_Mufflers_and_Piping", bm_exhaust, parent_col, mats["chrome"], bevel=0.0015)

    objs.extend([obj_header, obj_exhaust])
    return objs

# ----------------------------------------------------------------------------
# 12. SUBSYSTEM 10: TORSEN LIMITED-SLIP DIFFERENTIAL & FINNED CASING
# ----------------------------------------------------------------------------

def build_s2000_torsen_lsd_and_finned_casing(parent_col, mats):
    """
    Constructs the rear differential assembly:
    - Torsen Type-I torque-sensing helical limited-slip differential.
    - Cast aluminum differential carrier housing with horizontal cooling fins.
    - Driveshaft pinion input flange connected to transmission output shaft.
    - Left and right axle output drive stub flanges.
    - Rubber isolation mounting bushings to rear subframe.
    """
    objs = []
    bm_diff = bmesh.new()

    # Differential Center: X = 0.000m, Y = -1.200m, Z = 0.316m
    mat_diff = Matrix.Translation(Vector((0.0, -1.200, 0.316)))

    # 1. Cast Aluminum Main Differential Pumpkin Housing
    bmesh.ops.create_cylinder(bm_diff, radius=0.115, depth=0.190, segments=20, matrix=mat_diff @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Forward Pinion Snout Housing (Extending forward towards transmission)
    mat_snout = mat_diff @ Matrix.Translation(Vector((0, 0.140, 0)))
    bmesh.ops.create_cone(bm_diff, radius1=0.088, radius2=0.052, depth=0.180, segments=16, matrix=mat_snout @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Driveshaft Pinion Input Flange (Y = -0.970m)
    mat_flange = mat_diff @ Matrix.Translation(Vector((0, 0.230, 0)))
    bmesh.ops.create_cylinder(bm_diff, radius=0.048, depth=0.024, segments=16, matrix=mat_flange @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Longitudinal Driveshaft Tube (Spanning transmission tailshaft Y: -0.120m to diff Y: -0.970m)
    mat_dshaft = Matrix.Translation(Vector((0.0, -0.545, 0.320)))
    bmesh.ops.create_cylinder(bm_diff, radius=0.034, depth=0.850, segments=16, matrix=mat_dshaft @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 3. Horizontal Aluminum Cooling Fins on Rear Differential Cover (Z from 0.250m to 0.380m)
    for f_idx in range(6):
        fz_off = -0.060 + f_idx * 0.024
        mat_fin = mat_diff @ Matrix.Translation(Vector((0, -0.105, fz_off)))
        bmesh.ops.create_cube(bm_diff, size=1.0, matrix=mat_fin @ Matrix.Diagonal(Vector((0.180, 0.016, 0.003, 1.0))))

    # 4. Rubber Subframe Isolation Mounts (Left & Right mounting ears)
    for mx_sign in [-1.0, 1.0]:
        mat_mount = mat_diff @ Matrix.Translation(Vector((mx_sign * 0.160, -0.040, 0.050)))
        bmesh.ops.create_cylinder(bm_diff, radius=0.035, depth=0.045, segments=14, matrix=mat_mount)

    obj_diff = link_obj("GEO_S2K_Torsen_Differential_and_Driveshaft", bm_diff, parent_col, mats["alloy"], bevel=0.0015)
    objs.append(obj_diff)
    return objs

# ----------------------------------------------------------------------------
# 13. SUBSYSTEM 11: ALUMINUM RADIATOR, DUAL FANS & CONDENSER
# ----------------------------------------------------------------------------

def build_s2000_radiator_fans_and_condenser(parent_col, mats):
    """
    Constructs the front cooling pack:
    - Lightweight all-aluminum crossflow radiator (Y = +1.780m, Z = 0.380m).
    - Dual high-flow electric cooling fans with molded composite shrouds.
    - Air conditioning condenser matrix core mounted ahead of radiator.
    - Translucent coolant overflow bottle and radiator pressure cap.
    """
    objs = []
    bm_rad = bmesh.new()
    bm_fans = bmesh.new()

    # Cooling Pack Axis: Y = +1.780m, Z = 0.380m, tilted forward ~15 deg
    mat_rad = Matrix.Translation(Vector((0.0, 1.780, 0.380))) @ Euler((math.radians(15), 0, 0), 'XYZ').to_matrix().to_4x4()

    # 1. Aluminum Crossflow Radiator Core (Width 0.640m, Height 0.380m, Depth 0.035m)
    bmesh.ops.create_cube(bm_rad, size=1.0, matrix=mat_rad @ Matrix.Diagonal(Vector((0.640, 0.035, 0.380, 1.0))))

    # Radiator Top & Bottom End Tanks
    for tz_sign in [-1.0, 1.0]:
        mat_tank = mat_rad @ Matrix.Translation(Vector((0, 0, tz_sign * 0.190)))
        bmesh.ops.create_cylinder(bm_rad, radius=0.024, depth=0.640, segments=14, matrix=mat_tank @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Radiator Polished Chrome Pressure Cap (1.1 bar)
    mat_cap = mat_rad @ Matrix.Translation(Vector((0.240, 0, 0.215)))
    bmesh.ops.create_cylinder(bm_rad, radius=0.025, depth=0.016, segments=16, matrix=mat_cap)

    # 2. Dual Electric Cooling Fans & Shrouds (Behind radiator, facing engine)
    for fx_sign in [-1.0, 1.0]:
        mat_fan = mat_rad @ Matrix.Translation(Vector((fx_sign * 0.150, -0.035, 0.000)))
        # Outer Fan Shroud Ring
        bmesh.ops.create_cylinder(bm_fans, radius=0.135, depth=0.040, segments=24, matrix=mat_fan @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
        # Electric Motor Hub
        bmesh.ops.create_cylinder(bm_fans, radius=0.042, depth=0.055, segments=16, matrix=mat_fan @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 3. A/C Condenser Core (Mounted directly ahead of radiator, Y offset +0.035m)
    mat_cond = mat_rad @ Matrix.Translation(Vector((0, 0.035, -0.015)))
    bmesh.ops.create_cube(bm_rad, size=1.0, matrix=mat_cond @ Matrix.Diagonal(Vector((0.620, 0.018, 0.340, 1.0))))

    obj_rad = link_obj("GEO_S2K_Aluminum_Radiator_and_Condenser", bm_rad, parent_col, mats["alloy"], bevel=0.001)
    obj_fans = link_obj("GEO_S2K_Radiator_Dual_Electric_Fans", bm_fans, parent_col, mats["trim"], bevel=0.001)

    objs.extend([obj_rad, obj_fans])
    return objs

# ----------------------------------------------------------------------------
# 14. SUBSYSTEM 12: HYDRAULIC BRAKE HARDLINES & FUEL CELL
# ----------------------------------------------------------------------------

def build_s2000_brake_plumbing_and_fuel_tank(parent_col, mats):
    """
    Constructs hydraulic plumbing and fuel containment:
    - 50-liter cross-linked polyethylene fuel tank mounted ahead of rear axle over tunnel.
    - Fuel filler neck and rubber overflow boot routing to left rear quarter.
    - 4-channel ABS hydraulic modulator block with 12 solenoid ports on right inner wing.
    - Dual diagonal steel/nickel brake hardlines running through center tunnel.
    """
    objs = []
    bm_fuel = bmesh.new()
    bm_lines = bmesh.new()

    # 1. 50-Liter Polyethylene Fuel Tank (Y: -0.650m to -1.050m, Z = 0.340m)
    mat_tank = Matrix.Translation(Vector((0.0, -0.850, 0.340)))
    bmesh.ops.create_cube(bm_fuel, size=1.0, matrix=mat_tank @ Matrix.Diagonal(Vector((0.740, 0.400, 0.280, 1.0))))

    # Fuel Filler Neck Routing to Left Rear Fender (X = -0.740m, Y = -0.920m, Z = 0.650m)
    mat_filler = Matrix.Translation(Vector((-0.520, -0.880, 0.500))) @ Euler((0, math.radians(35), 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_fuel, radius=0.024, depth=0.280, segments=12, matrix=mat_filler)

    # 2. 4-Channel ABS Hydraulic Modulator Block (Right inner fender, X = +0.440m, Y = +0.920m, Z = 0.580m)
    mat_abs = Matrix.Translation(Vector((0.440, 0.920, 0.580)))
    bmesh.ops.create_cube(bm_lines, size=1.0, matrix=mat_abs @ Matrix.Diagonal(Vector((0.110, 0.130, 0.100, 1.0))))
    # Modulator Motor Cylindrical Accumulator
    bmesh.ops.create_cylinder(bm_lines, radius=0.028, depth=0.075, segments=14, matrix=mat_abs @ Matrix.Translation(Vector((0, 0, 0.065))))

    # 3. Dual Hydraulic Brake Hardlines running along tunnel floor
    for lx_off in [-0.015, 0.015]:
        mat_bline = Matrix.Translation(Vector((lx_off, 0.000, 0.190)))
        bmesh.ops.create_cylinder(bm_lines, radius=0.004, depth=2.200, segments=8, matrix=mat_bline @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_fuel = link_obj("GEO_S2K_Fuel_Tank_and_Filler", bm_fuel, parent_col, mats["trim"], bevel=0.002)
    obj_lines = link_obj("GEO_S2K_ABS_Modulator_and_BrakeLines", bm_lines, parent_col, mats["alloy"], bevel=0.001)

    objs.extend([obj_fuel, obj_lines])
    return objs
'''
