"""
Honda S2000 AP1 (2000s) Phase 17: Part Extra
Subsystems 37 to 40:
37. Front Subframe Jack Point Gusset, Radiator Stiffeners & Front Tow Hook
38. Soft-Top Mechanical Folding Bows, Tension Cables & Header Latches
39. Rear Bumper Lower Aerodynamic Mesh Grilles & Vortex Generators
40. Exhaust Hanger Isolator Brackets & Heat Shield Baffles
"""

PART_S2K_EXTRA = '''
# ----------------------------------------------------------------------------
# 39. SUBSYSTEM 37: FRONT SUBFRAME GUSSETS & FRONT TOW HOOK
# ----------------------------------------------------------------------------

def build_s2000_front_subframe_gussets_and_tow_hook(parent_col, mats):
    """
    Constructs the heavy-duty front subframe reinforcement hardware and track tow hook:
    - Stamped high-strength steel triangulation gussets connecting subframe to frame rails.
    - Central front subframe reinforced hydraulic jacking plate (Y = +1.480m, Z = 0.160m).
    - Front screw-in / fixed track tow hook eyelet protruding through lower front grille (X = +0.320m, Y = +2.040m, Z = 0.280m).
    - Radiator lower core support tubular diagonal stiffening braces.
    """
    objs = []
    bm_gusset = bmesh.new()

    # 1. Front Subframe Triangular Gussets (Left & Right, X = +/- 0.380m, Y = 1.340m, Z = 0.220m)
    for gx_sign in [-1.0, 1.0]:
        mat_gus = Matrix.Translation(Vector((gx_sign * 0.380, 1.340, 0.220)))
        bmesh.ops.create_cube(bm_gusset, size=1.0, matrix=mat_gus @ Matrix.Diagonal(Vector((0.090, 0.160, 0.018, 1.0))))
        # Subframe Frame Rail High-Tensile Flange Bolts (2 per gusset)
        for bi in range(2):
            mat_fbolt = mat_gus @ Matrix.Translation(Vector((0, -0.050 + bi * 0.100, 0.015)))
            bmesh.ops.create_cylinder(bm_gusset, radius=0.007, depth=0.020, segments=8, matrix=mat_fbolt)

    # 2. Central Front Subframe Hydraulic Jacking Plate (Y = +1.480m, Z = 0.160m)
    mat_fjack = Matrix.Translation(Vector((0.0, 1.480, 0.160)))
    bmesh.ops.create_cylinder(bm_gusset, radius=0.065, depth=0.024, segments=18, matrix=mat_fjack)

    # 3. Front Emergency / Track Tow Hook Eyelet (X = +0.320m, Y = +2.040m, Z = 0.280m)
    mat_tow = Matrix.Translation(Vector((0.320, 2.040, 0.280)))
    # Outer Ring Eyelet
    bmesh.ops.create_cylinder(bm_gusset, radius=0.032, depth=0.014, segments=18, matrix=mat_tow @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())
    # Inner Mounting Shank extending back to frame horn
    mat_shank = Matrix.Translation(Vector((0.320, 1.940, 0.280)))
    bmesh.ops.create_cylinder(bm_gusset, radius=0.012, depth=0.200, segments=12, matrix=mat_shank @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 4. Radiator Lower Core Diagonal Stiffener Tubes (Left & Right)
    for rx_sign in [-1.0, 1.0]:
        mat_dtube = Matrix.Translation(Vector((rx_sign * 0.280, 1.680, 0.240))) @ Euler((0, rx_sign * math.radians(24), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_gusset, radius=0.010, depth=0.360, segments=10, matrix=mat_dtube @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_gusset = link_obj("GEO_S2K_Front_Subframe_Gussets_and_TowHook", bm_gusset, parent_col, mats["trim"], bevel=0.001)
    objs.append(obj_gusset)
    return objs

# ----------------------------------------------------------------------------
# 40. SUBSYSTEM 38: SOFT-TOP MECHANICAL FOLDING BOWS & LATCHES
# ----------------------------------------------------------------------------

def build_s2000_soft_top_frame_bows_and_latches(parent_col, mats):
    """
    Constructs the convertible soft-top mechanical skeleton and header latches:
    - Cast aluminum front header bow bar with dual over-center locking handle latches.
    - Tubular steel intermediate folding hoop bows (Main bow, secondary bow, rear tension bow).
    - Multi-link pantograph folding side scissor arms and brass pivot bushings.
    - Side window weatherstrip rubber channel carriers.
    """
    objs = []
    bm_bow = bmesh.new()

    # 1. Front Header Bow Casting (Folded into front lip of tonneau well, Y = -0.660m, Z = 0.832m)
    mat_hdr = Matrix.Translation(Vector((0.0, -0.660, 0.832)))
    bmesh.ops.create_cube(bm_bow, size=1.0, matrix=mat_hdr @ Matrix.Diagonal(Vector((1.020, 0.045, 0.018, 1.0))))

    # Dual Over-Center Locking Handle Latches (Left & Right, X = +/- 0.420m)
    for lx_sign in [-1.0, 1.0]:
        mat_latch = Matrix.Translation(Vector((lx_sign * 0.420, -0.660, 0.830)))
        bmesh.ops.create_cube(bm_bow, size=1.0, matrix=mat_latch @ Matrix.Diagonal(Vector((0.045, 0.045, 0.016, 1.0))))
        # Latch Pivot Handle Hook
        mat_lhook = mat_latch @ Matrix.Translation(Vector((0, 0.015, -0.008)))
        bmesh.ops.create_cylinder(bm_bow, radius=0.005, depth=0.030, segments=8, matrix=mat_lhook @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Intermediate Tubular Steel Folding Bows (Stacked neatly inside folded well)
    # Bow 1: Folded intermediate bow (Y = -0.695m, Z = 0.825m)
    mat_b1 = Matrix.Translation(Vector((0.0, -0.695, 0.825)))
    bmesh.ops.create_cylinder(bm_bow, radius=0.008, depth=1.040, segments=14, matrix=mat_b1 @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Bow 2: Main support hoop bow (Y = -0.730m, Z = 0.820m)
    mat_b2 = Matrix.Translation(Vector((0.0, -0.730, 0.820)))
    bmesh.ops.create_cylinder(bm_bow, radius=0.009, depth=1.060, segments=14, matrix=mat_b2 @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Bow 3: Rear glass tension bow (Y = -0.760m, Z = 0.815m)
    mat_b3 = Matrix.Translation(Vector((0.0, -0.760, 0.815)))
    bmesh.ops.create_cylinder(bm_bow, radius=0.008, depth=1.020, segments=14, matrix=mat_b3 @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # 3. Scissor Folding Side Linkage Arms (Folded horizontally along tonneau flanks, X = +/- 0.560m)
    for sx_sign in [-1.0, 1.0]:
        mat_side = Matrix.Translation(Vector((sx_sign * 0.560, -0.710, 0.820)))
        bmesh.ops.create_cube(bm_bow, size=1.0, matrix=mat_side @ Matrix.Diagonal(Vector((0.015, 0.140, 0.018, 1.0))))
        # Main B-Pillar Pivot Knuckle (Z = 0.790m, Y = -0.620m)
        mat_knuckle = Matrix.Translation(Vector((sx_sign * 0.580, -0.620, 0.790)))
        bmesh.ops.create_cylinder(bm_bow, radius=0.016, depth=0.025, segments=14, matrix=mat_knuckle @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_bow = link_obj("GEO_S2K_SoftTop_Mechanical_Frame_and_Latches", bm_bow, parent_col, mats["trim"], bevel=0.001)
    objs.append(obj_bow)
    return objs

# ----------------------------------------------------------------------------
# 41. SUBSYSTEM 39: REAR BUMPER LOWER AERO MESH & VORTEX GENERATORS
# ----------------------------------------------------------------------------

def build_s2000_rear_bumper_lower_aero_and_mesh(parent_col, mats):
    """
    Constructs the lower rear aerodynamic extraction panels and diffuser vortex guides:
    - Honeycomb / slotted dark aero extraction mesh flanking the dual exhaust cutouts (X = +/- 0.380m, Y = -1.980m, Z = 0.230m).
    - Lower bumper center aerodynamic vortex generator fin strakes.
    - Rear bumper license plate bracket pocket with dual white LED illumination pods.
    """
    objs = []
    bm_raero = bmesh.new()

    # 1. Rear Lower Mesh Extraction Inserts (Flanking exhaust pipes)
    for ex_sign in [-1.0, 1.0]:
        mat_mesh = Matrix.Translation(Vector((ex_sign * 0.400, -1.990, 0.235))) @ Euler((math.radians(-16), 0, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_raero, size=1.0, matrix=mat_mesh @ Matrix.Diagonal(Vector((0.180, 0.012, 0.080, 1.0))))

    # 2. Diffuser Center Aerodynamic Extraction Fins (4 Longitudinal fins under rear floor)
    for fi in range(4):
        x_fin = -0.180 + fi * 0.120
        mat_fin = Matrix.Translation(Vector((x_fin, -1.950, 0.190)))
        bmesh.ops.create_cube(bm_raero, size=1.0, matrix=mat_fin @ Matrix.Diagonal(Vector((0.008, 0.200, 0.045, 1.0))))

    # 3. Rear License Plate Recessed Pocket (Y = -2.030m, Z = 0.480m)
    mat_plate = Matrix.Translation(Vector((0.0, -2.030, 0.480))) @ Euler((math.radians(-14), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_raero, size=1.0, matrix=mat_plate @ Matrix.Diagonal(Vector((0.360, 0.035, 0.160, 1.0))))

    # Dual License Plate Lamps (Overhead lighting pods)
    for px_sign in [-1.0, 1.0]:
        mat_plamp = mat_plate @ Matrix.Translation(Vector((px_sign * 0.110, 0.015, 0.075)))
        bmesh.ops.create_cube(bm_raero, size=1.0, matrix=mat_plamp @ Matrix.Diagonal(Vector((0.045, 0.020, 0.015, 1.0))))

    obj_raero = link_obj("GEO_S2K_Rear_Bumper_Lower_Aero_and_Mesh", bm_raero, parent_col, mats["trim"], bevel=0.001)
    objs.append(obj_raero)
    return objs

# ----------------------------------------------------------------------------
# 42. SUBSYSTEM 40: EXHAUST HANGER ISOLATORS & HEAT SHIELD BAFFLES
# ----------------------------------------------------------------------------

def build_s2000_exhaust_hangers_and_heat_shields(parent_col, mats):
    """
    Constructs the exhaust system isolation mounts and underbody thermal shields:
    - High-temperature EPDM rubber exhaust hanger isolator doughnuts and welded steel prongs.
    - Stamped dimpled aluminum thermal heat shields isolating exhaust system from fuel tank and propshaft tunnel.
    - Rear muffler heat shields preventing bumper thermal discoloration.
    """
    objs = []
    bm_exh_mounts = bmesh.new()

    # 1. Exhaust Hanger Rubber Isolator Rings (6 Isolators across exhaust line)
    # Positions: 2 mid-pipe, 4 rear mufflers
    h_positions = [
        Vector((-0.060, 0.150, 0.285)),
        Vector((-0.060, -0.650, 0.285)),
        Vector((-0.460, -1.820, 0.285)),
        Vector((-0.580, -1.820, 0.285)),
        Vector((0.460, -1.820, 0.285)),
        Vector((0.580, -1.820, 0.285)),
    ]
    for h_pos in h_positions:
        mat_h = Matrix.Translation(h_pos)
        # Rubber Doughnut Isolator
        bmesh.ops.create_cylinder(bm_exh_mounts, radius=0.024, depth=0.020, segments=16, matrix=mat_h @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
        # Welded Steel Hanger Bar Pin
        bmesh.ops.create_cylinder(bm_exh_mounts, radius=0.0055, depth=0.055, segments=10, matrix=mat_h @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Dimpled Aluminum Exhaust Tunnel Heat Shield (Y = -0.300m to +0.400m, Z = 0.320m)
    mat_tshield = Matrix.Translation(Vector((-0.050, 0.050, 0.320)))
    bmesh.ops.create_cube(bm_exh_mounts, size=1.0, matrix=mat_tshield @ Matrix.Diagonal(Vector((0.260, 0.700, 0.005, 1.0))))

    # 3. Rear Muffler Thermal Deflector Heat Shields (Left & Right, X = +/- 0.520m, Y = -1.780m, Z = 0.330m)
    for mx_sign in [-1.0, 1.0]:
        mat_mshield = Matrix.Translation(Vector((mx_sign * 0.520, -1.780, 0.330)))
        bmesh.ops.create_cube(bm_exh_mounts, size=1.0, matrix=mat_mshield @ Matrix.Diagonal(Vector((0.360, 0.420, 0.005, 1.0))))

    obj_exh_mounts = link_obj("GEO_S2K_Exhaust_Hangers_and_HeatShields", bm_exh_mounts, parent_col, mats["alloy"], bevel=0.001)
    objs.append(obj_exh_mounts)
    return objs
'''
