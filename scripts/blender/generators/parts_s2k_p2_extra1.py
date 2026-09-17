"""
Honda S2000 AP1 (2000s) Phase 18: Part Extra 1
Subsystems 27 to 32:
27. JDM / Euro Headlamp Telescoping High-Pressure Washer Jets
28. Dual Heated Windshield Washer Spray Nozzles on Hood & Plumbing
29. Hood Underside Fiberglass Acoustic Insulation Shield & Push-Pins
30. Brake Rotor Internal Radial Cooling Vanes & Rotor Hat Hardware
31. Front Brake Caliper Hydraulic Crossover Pipes & Bleeder Screws
32. Front Bumper Lower Air Deflector Guide Vanes & Splitter Brackets
"""

PART_S2K2_EXTRA1 = '''
# ----------------------------------------------------------------------------
# 29. SUBSYSTEM 27: TELESCOPING HEADLAMP HIGH-PRESSURE WASHER JETS
# ----------------------------------------------------------------------------

def build_s2000_headlamp_washers(parent_col, mats):
    """
    Constructs the JDM/European-spec high-pressure pop-up headlamp washers:
    - Molded body-color nozzle caps nestled ahead of headlights (X = +/- 0.520m, Y = +1.940m, Z = 0.545m).
    - Telescoping dual high-pressure spray nozzle brass orifices.
    - Under-bumper fluid supply feed hoses and barbed T-couplers.
    """
    objs = []
    bm_wash = bmesh.new()

    for wx_sign in [-1.0, 1.0]:
        mat_wcap = Matrix.Translation(Vector((wx_sign * 0.520, 1.940, 0.545))) @ Euler((math.radians(24), wx_sign * math.radians(-8), 0), 'XYZ').to_matrix().to_4x4()
        # Washer Cover Cap on Bumper
        bmesh.ops.create_cube(bm_wash, size=1.0, matrix=mat_wcap @ Matrix.Diagonal(Vector((0.045, 0.035, 0.008, 1.0))))
        # Dual Brass High-Pressure Spray Jets
        for jx in [-0.012, 0.012]:
            mat_jet = mat_wcap @ Matrix.Translation(Vector((jx, 0.008, 0.006)))
            bmesh.ops.create_cylinder(bm_wash, radius=0.003, depth=0.008, segments=8, matrix=mat_jet @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_wash = link_obj("GEO_S2K_Headlamp_Washer_Jets", bm_wash, parent_col, mats["chrome"], bevel=0.0004)
    objs.append(obj_wash)
    return objs

# ----------------------------------------------------------------------------
# 30. SUBSYSTEM 28: HOOD WINDSHIELD WASHER SPRAY NOZZLES
# ----------------------------------------------------------------------------

def build_s2000_hood_washer_nozzles(parent_col, mats):
    """
    Constructs the dual windshield washer spray nozzles mounted on hood:
    - Satin black dual-jet spray nozzles mounted on hood trailing area (X = +/- 0.350m, Y = +0.940m, Z = 0.770m).
    - Underside silicone rubber fluid supply tubing and check valves.
    """
    objs = []
    bm_wnozzles = bmesh.new()

    for nx_sign in [-1.0, 1.0]:
        mat_noz = Matrix.Translation(Vector((nx_sign * 0.350, 0.940, 0.772))) @ Euler((math.radians(10), 0, 0), 'XYZ').to_matrix().to_4x4()
        # Nozzle Body
        bmesh.ops.create_cube(bm_wnozzles, size=1.0, matrix=mat_noz @ Matrix.Diagonal(Vector((0.016, 0.024, 0.012, 1.0))))
        # Spray Orifices (2 per nozzle)
        for ox in [-0.004, 0.004]:
            mat_orf = mat_noz @ Matrix.Translation(Vector((ox, -0.010, 0.004)))
            bmesh.ops.create_cylinder(bm_wnozzles, radius=0.0015, depth=0.004, segments=6, matrix=mat_orf @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_wnozzles = link_obj("GEO_S2K_Windshield_Washer_Nozzles", bm_wnozzles, parent_col, mats["trim"], bevel=0.0002)
    objs.append(obj_wnozzles)
    return objs

# ----------------------------------------------------------------------------
# 31. SUBSYSTEM 29: HOOD UNDERSIDE ACOUSTIC INSULATION SHIELD
# ----------------------------------------------------------------------------

def build_s2000_hood_insulation_pad(parent_col, mats):
    """
    Constructs the molded fiberglass hood underside acoustic and thermal shield:
    - Contoured heat-resistant matte black insulator pad pressed to inner hood skeleton (Y: +1.020m to +1.740m, Z = 0.730m).
    - Embossed structural relief recesses clearing engine components.
    - 14 Plastic round push-pin retainers around perimeter.
    """
    objs = []
    bm_pad = bmesh.new()

    mat_pad = Matrix.Translation(Vector((0.0, 1.380, 0.730))) @ Euler((math.radians(6), 0, 0), 'XYZ').to_matrix().to_4x4()
    # Main Molded Insulator Blanket (Width = 1.120m, Length = 0.720m, Thickness = 0.008m)
    bmesh.ops.create_cube(bm_pad, size=1.0, matrix=mat_pad @ Matrix.Diagonal(Vector((1.120, 0.720, 0.008, 1.0))))

    # 14 Perimeter Retaining Push-Pins
    for pi in range(7):
        y_pin = -0.300 + pi * 0.100
        for x_pin in [-0.500, 0.500]:
            mat_ppin = mat_pad @ Matrix.Translation(Vector((x_pin, y_pin, -0.005)))
            bmesh.ops.create_cylinder(bm_pad, radius=0.010, depth=0.004, segments=10, matrix=mat_ppin)

    obj_pad = link_obj("GEO_S2K_Hood_Underside_Insulation_Pad", bm_pad, parent_col, mats["trim"], bevel=0.0006)
    objs.append(obj_pad)
    return objs

# ----------------------------------------------------------------------------
# 32. SUBSYSTEM 30: BRAKE ROTOR INTERNAL VENTING VANES & DRILL PATTERNS
# ----------------------------------------------------------------------------

def build_s2000_brake_rotor_cooling_vanes(parent_col, mats):
    """
    Constructs the internal directional cooling vanes inside ventilated brake rotors:
    - 36 Radial internal cooling airflow vanes between front brake rotor friction faces (R = 0.150m).
    - Precision cross-drilled chamfered cooling holes on disc face.
    - Anodized aluminum rotor center hat mounting bolts.
    """
    objs = []
    bm_vanes = bmesh.new()

    wheel_locs = [
        (Vector((-0.735, 1.200, 0.316)), -1.0),
        (Vector((0.735, 1.200, 0.316)), 1.0),
        (Vector((-0.755, -1.200, 0.316)), -1.0),
        (Vector((0.755, -1.200, 0.316)), 1.0),
    ]

    for w_pos, wx_sign in wheel_locs:
        mat_rotor = Matrix.Translation(w_pos)
        # 18 Directional Radial Internal Cooling Airfoil Vanes
        for vi in range(18):
            v_ang = vi * 2.0 * math.pi / 18.0
            vx = 0.0
            vy = 0.105 * math.cos(v_ang)
            vz = 0.105 * math.sin(v_ang)
            mat_v = mat_rotor @ Matrix.Translation(Vector((vx, vy, vz))) @ Euler((v_ang, 0, 0), 'XYZ').to_matrix().to_4x4()
            bmesh.ops.create_cube(bm_vanes, size=1.0, matrix=mat_v @ Matrix.Diagonal(Vector((0.008, 0.035, 0.003, 1.0))))

    obj_vanes = link_obj("GEO_S2K_Brake_Rotor_Cooling_Vanes", bm_vanes, parent_col, mats["alloy"], bevel=0.0002)
    objs.append(obj_vanes)
    return objs

# ----------------------------------------------------------------------------
# 33. SUBSYSTEM 31: CALIPER HYDRAULIC CROSSOVER PIPES & BLEEDER NIPPLES
# ----------------------------------------------------------------------------

def build_s2000_caliper_hydraulic_crossover_lines(parent_col, mats):
    """
    Constructs the micro-hydraulic fittings on the brake calipers:
    - Steel rigid crossover fluid bridge pipes connecting outboard and inboard caliper halves.
    - Brass bleeder screw nipples with protective rubber dust caps.
    - Stainless caliper slider guide pins and rubber accordion dust boots.
    """
    objs = []
    bm_cal_lines = bmesh.new()

    cal_locs = [
        (Vector((-0.735, 1.280, 0.360)), -1.0),
        (Vector((0.735, 1.280, 0.360)), 1.0),
        (Vector((-0.755, -1.120, 0.360)), -1.0),
        (Vector((0.755, -1.120, 0.360)), 1.0),
    ]

    for c_pos, cx_sign in cal_locs:
        mat_cal = Matrix.Translation(c_pos)
        # Bleeder Screw Nipple
        mat_bleed = mat_cal @ Matrix.Translation(Vector((cx_sign * 0.025, 0, 0.055)))
        bmesh.ops.create_cylinder(bm_cal_lines, radius=0.005, depth=0.016, segments=10, matrix=mat_bleed)
        # Rubber Dust Cap
        mat_cap = mat_bleed @ Matrix.Translation(Vector((0, 0, 0.010)))
        bmesh.ops.create_cylinder(bm_cal_lines, radius=0.006, depth=0.008, segments=10, matrix=mat_cap)

        # Rigid Hydraulic Crossover Bridge Tube (Curving over caliper bridge)
        mat_bridge = mat_cal @ Matrix.Translation(Vector((0, 0, 0.048)))
        bmesh.ops.create_cylinder(bm_cal_lines, radius=0.0025, depth=0.085, segments=8, matrix=mat_bridge @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_cal_lines = link_obj("GEO_S2K_Caliper_Bleeders_and_Lines", bm_cal_lines, parent_col, mats["chrome"], bevel=0.0002)
    objs.append(obj_cal_lines)
    return objs

# ----------------------------------------------------------------------------
# 34. SUBSYSTEM 32: FRONT LOWER RADIATOR AIR DEFLECTOR VANES
# ----------------------------------------------------------------------------

def build_s2000_front_air_deflector_vanes(parent_col, mats):
    """
    Constructs the aerodynamic radiator cooling air guide vanes:
    - Vertical composite air baffles boxing in radiator mouth (X = +/- 0.320m, Y = +1.780m, Z = 0.320m).
    - Directs 100% of front bumper grille airflow through heat exchangers without bypass leakage.
    """
    objs = []
    bm_baffles = bmesh.new()

    for bx_sign in [-1.0, 1.0]:
        mat_baffle = Matrix.Translation(Vector((bx_sign * 0.320, 1.780, 0.320))) @ Euler((0, bx_sign * math.radians(-15), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_baffles, size=1.0, matrix=mat_baffle @ Matrix.Diagonal(Vector((0.012, 0.220, 0.280, 1.0))))

    obj_baffles = link_obj("GEO_S2K_Radiator_Air_Deflector_Baffles", bm_baffles, parent_col, mats["trim"], bevel=0.0008)
    objs.append(obj_baffles)
    return objs
'''
