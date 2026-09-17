"""
Jaguar F-Type V8 R Convertible (2010s) Phase 20: Extra Part 4
Subsystems 28 to 31:
- Subsystem 28: Engine Bay VIN Placard, Emissions Labels & High-Voltage Decals
- Subsystem 29: Machined Aluminum Engine Oil Filler Cap with Cast Jaguar Script
- Subsystem 30: Rear Decklid Aerodynamic Satellite Antenna Pod
- Subsystem 31: Instrument Cluster Chrono Dials & Ignis Orange Steering Paddle Shifters
"""

PART_FTYPE2_EXTRA4 = '''
# ----------------------------------------------------------------------------
# 30. SUBSYSTEM 28: ENGINE BAY VIN PLACARDS & CERTIFICATION DECALS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_engine_bay_placards(parent_col, mats):
    """
    Constructs engine bay identification and safety plaques:
    - Stamped aluminum 17-character VIN identification plate on passenger strut tower.
    - Emissions control and air conditioning specification stickers on radiator slam panel.
    - Supercharger belt routing schematic decal.
    """
    objs = []
    bm_decals = bmesh.new()

    # 1. Stamped Aluminum VIN Plate (Passenger shock tower: X = 0.560m, Y = 1.320m, Z = 0.740m)
    mat_vin = Matrix.Translation(Vector((0.560, 1.320, 0.740))) @ Euler((0, 0, math.radians(-25)), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_decals, size=1.0, matrix=mat_vin @ Matrix.Diagonal(Vector((0.085, 0.040, 0.003, 1.0))))

    # 2. Emissions & A/C Specification Decal (Front slam panel: X = -0.220m, Y = 2.080m, Z = 0.580m)
    mat_emis = Matrix.Translation(Vector((-0.220, 2.080, 0.580)))
    bmesh.ops.create_cube(bm_decals, size=1.0, matrix=mat_emis @ Matrix.Diagonal(Vector((0.110, 0.055, 0.002, 1.0))))

    # 3. Supercharger Belt Routing Decal (Center radiator cover)
    mat_belt_dec = Matrix.Translation(Vector((0.180, 2.080, 0.580)))
    bmesh.ops.create_cube(bm_decals, size=1.0, matrix=mat_belt_dec @ Matrix.Diagonal(Vector((0.090, 0.050, 0.002, 1.0))))

    obj_decals = link_obj("GEO_FTYPE_Engine_Bay_Placards_and_Decals", bm_decals, parent_col, mats["chrome"], bevel=0.0003)
    objs.append(obj_decals)
    return objs


# ----------------------------------------------------------------------------
# 31. SUBSYSTEM 29: MACHINED ALUMINUM OIL FILLER CAP
# ----------------------------------------------------------------------------

def build_jaguar_ftype_oil_filler_cap(parent_col, mats):
    """
    Constructs the jewel-like engine oil filler cap:
    - Billet machined aluminum oil filler cap on front of right cam cover (X = 0.220m, Y = 1.480m, Z = 0.680m).
    - Knurled tactile outer grip perimeter.
    - Cast relief Jaguar Growler / oil can icon engraved on cap crown.
    """
    objs = []
    bm_cap = bmesh.new()

    mat_oil_cap = Matrix.Translation(Vector((0.220, 1.480, 0.680))) @ Euler((0, math.radians(45), 0), 'XYZ').to_matrix().to_4x4()

    # Main Cap Cylindrical Body
    bmesh.ops.create_cylinder(bm_cap, radius=0.026, depth=0.018, segments=20, matrix=mat_oil_cap)

    # Knurled Grip Studs (8 radial knurl teeth)
    for k_i in range(8):
        k_ang = k_i * (math.pi / 4.0)
        kx = math.cos(k_ang) * 0.027
        ky = math.sin(k_ang) * 0.027
        mat_knurl = mat_oil_cap @ Matrix.Translation(Vector((kx, ky, 0)))
        bmesh.ops.create_cylinder(bm_cap, radius=0.004, depth=0.016, segments=6, matrix=mat_knurl)

    # Center Raised Icon Ridge
    mat_cridge = mat_oil_cap @ Matrix.Translation(Vector((0, 0, 0.010)))
    bmesh.ops.create_cube(bm_cap, size=1.0, matrix=mat_cridge @ Matrix.Diagonal(Vector((0.024, 0.012, 0.005, 1.0))))

    obj_cap = link_obj("GEO_FTYPE_Billet_Oil_Filler_Cap", bm_cap, parent_col, mats["alloy"], bevel=0.0004)
    objs.append(obj_cap)
    return objs


# ----------------------------------------------------------------------------
# 32. SUBSYSTEM 30: REAR DECKLID SATELLITE ANTENNA POD
# ----------------------------------------------------------------------------

def build_jaguar_ftype_satellite_antenna(parent_col, mats):
    """
    Constructs the compact GPS/cellular shark-fin satellite antenna pod:
    - Aerodynamic low-profile antenna pod centered on rear trunk decklid (X = 0.0m, Y = -1.720m, Z = 0.835m).
    - Body-colored / gloss black swept fin profile with rubber base gasket.
    """
    objs = []
    bm_ant = bmesh.new()

    mat_ant = Matrix.Translation(Vector((0.0, -1.720, 0.835))) @ Euler((math.radians(-6), 0, 0), 'XYZ').to_matrix().to_4x4()

    # Swept Aerodynamic Fin Blade
    bmesh.ops.create_cube(bm_ant, size=1.0, matrix=mat_ant @ Matrix.Diagonal(Vector((0.048, 0.110, 0.045, 1.0))))

    # Base Rubber Gasket Sealing Rim
    mat_gask = mat_ant @ Matrix.Translation(Vector((0, 0, -0.020)))
    bmesh.ops.create_cube(bm_ant, size=1.0, matrix=mat_gask @ Matrix.Diagonal(Vector((0.054, 0.120, 0.006, 1.0))))

    obj_ant = link_obj("GEO_FTYPE_Satellite_Antenna_Fin", bm_ant, parent_col, mats["piano_black"], bevel=0.0008)
    objs.append(obj_ant)
    return objs


# ----------------------------------------------------------------------------
# 33. SUBSYSTEM 31: INSTRUMENT CLUSTER CHRONO DIALS & PADDLE SHIFTERS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_instrument_cluster_and_paddles(parent_col, mats):
    """
    Constructs the driver's chronograph-inspired instrument cluster and paddle shifters:
    - Twin hooded chronograph circular dials (Speedometer and 8,000 RPM Tachometer) with chrome bezels.
    - Central color TFT driver information display screen.
    - Ignis orange anodized aluminum steering wheel paddle shifters (+ on right, - on left).
    """
    objs = []
    bm_dials = bmesh.new()
    bm_paddles = bmesh.new()

    mat_cluster = Matrix.Translation(Vector((-0.360, 0.460, 0.865))) @ Euler((math.radians(24), 0, 0), 'XYZ').to_matrix().to_4x4()

    # 1. Twin Chronograph Circular Dial Rings (Left: Speedometer, Right: Tachometer)
    for dx_sign in [-1.0, 1.0]:
        mat_dial = mat_cluster @ Matrix.Translation(Vector((dx_sign * 0.095, -0.010, 0)))
        # Chrome Outer Bezel Ring
        bmesh.ops.create_cylinder(bm_dials, radius=0.046, depth=0.016, segments=22, matrix=mat_dial @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
        # Dial Face Disc
        bmesh.ops.create_cylinder(bm_dials, radius=0.042, depth=0.008, segments=20, matrix=mat_dial @ Matrix.Translation(Vector((0, 0.004, 0))) @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Center TFT Information Display Screen (Between twin dial rings)
    mat_tft = mat_cluster @ Matrix.Translation(Vector((0, 0.005, 0)))
    bmesh.ops.create_cube(bm_dials, size=1.0, matrix=mat_tft @ Matrix.Diagonal(Vector((0.085, 0.006, 0.060, 1.0))))

    # 3. Steering Wheel Ignis Anodized Aluminum Paddle Shifters
    mat_wheel_hub = Matrix.Translation(Vector((-0.360, 0.320, 0.840))) @ Euler((math.radians(24), 0, 0), 'XYZ').to_matrix().to_4x4()
    for px_sign in [-1.0, 1.0]:
        mat_pad = mat_wheel_hub @ Matrix.Translation(Vector((px_sign * 0.160, 0.035, 0.040))) @ Euler((0, px_sign * math.radians(-12), 0), 'XYZ').to_matrix().to_4x4()
        # Extended Ergonomic Paddle Blade
        bmesh.ops.create_cube(bm_paddles, size=1.0, matrix=mat_pad @ Matrix.Diagonal(Vector((0.024, 0.008, 0.110, 1.0))))

    obj_dials = link_obj("GEO_FTYPE_Instrument_Cluster_Dials", bm_dials, parent_col, mats["chrome"], bevel=0.0005)
    obj_paddles = link_obj("GEO_FTYPE_Ignis_Orange_Paddle_Shifters", bm_paddles, parent_col, mats["body"], bevel=0.0006)

    objs.extend([obj_dials, obj_paddles])
    return objs
'''
