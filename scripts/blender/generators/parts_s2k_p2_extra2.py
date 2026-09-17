"""
Honda S2000 AP1 (2000s) Phase 18: Part Extra 2
Subsystems 33 to 38:
33. Hazard Flasher Red Triangle Switch & Dashboard Digital Clock
34. Passenger Airbag Seam Perimeter & Secret Compartment Lock
35. Cockpit 12V Power Outlet & Weatherproof Spring Door
36. Soft-Top Internal Elastic Tension Straps & B-Pillar Flaps
37. Underbody Reinforced Jacking Pucks & Sill Drainage Scuppers
38. Front Fender Amber Oval Side Repeater Winkers (JDM Spec)
"""

PART_S2K2_EXTRA2 = '''
# ----------------------------------------------------------------------------
# 35. SUBSYSTEM 33: HAZARD FLASHER SWITCH & DIGITAL CLOCK
# ----------------------------------------------------------------------------

def build_s2000_hazard_switch_and_clock(parent_col, mats):
    """
    Constructs the cockpit center console auxiliary electrical controls:
    - High-visibility red triangle emergency hazard flasher push button (X = -0.110m, Y = +0.380m, Z = 0.720m).
    - Compact LCD digital clock display screen with reset and hour/min buttons.
    """
    objs = []
    bm_haz = bmesh.new()

    # 1. Hazard Warning Switch (To right of steering column)
    mat_haz = Matrix.Translation(Vector((-0.110, 0.380, 0.720))) @ Euler((math.radians(-20), 0, 0), 'XYZ').to_matrix().to_4x4()
    # Bezel
    bmesh.ops.create_cube(bm_haz, size=1.0, matrix=mat_haz @ Matrix.Diagonal(Vector((0.032, 0.016, 0.032, 1.0))))
    # Red Triangular Button
    mat_btn = mat_haz @ Matrix.Translation(Vector((0, -0.008, 0)))
    bmesh.ops.create_cylinder(bm_haz, radius=0.011, depth=0.008, segments=3, matrix=mat_btn @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Digital Clock Display Screen (X = -0.060m, Y = 0.380m, Z = 0.720m)
    mat_clk = Matrix.Translation(Vector((-0.060, 0.380, 0.720))) @ Euler((math.radians(-20), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_haz, size=1.0, matrix=mat_clk @ Matrix.Diagonal(Vector((0.045, 0.012, 0.024, 1.0))))

    obj_haz = link_obj("GEO_S2K_Hazard_Switch_and_Clock", bm_haz, parent_col, mats["badge_red"], bevel=0.0004)
    objs.append(obj_haz)
    return objs

# ----------------------------------------------------------------------------
# 36. SUBSYSTEM 34: PASSENGER AIRBAG SEAM & SECRET COMPARTMENT LOCK
# ----------------------------------------------------------------------------

def build_s2000_passenger_airbag_and_secret_compartment(parent_col, mats):
    """
    Constructs the passenger dashboard airbag deployment seam and secret glovebox lock:
    - Precision laser-scored passenger airbag deployment tear seam outline (X = +0.340m, Y = +0.410m, Z = 0.760m).
    - AP1 "secret compartment" upper rear console storage lock tumbler (X = 0.0m, Y = -0.560m, Z = 0.760m).
    """
    objs = []
    bm_dash = bmesh.new()

    # 1. Passenger Airbag Deployment Tear Seam (Scored rectangular groove in dash)
    mat_ab = Matrix.Translation(Vector((0.340, 0.410, 0.760))) @ Euler((math.radians(16), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_dash, size=1.0, matrix=mat_ab @ Matrix.Diagonal(Vector((0.320, 0.160, 0.003, 1.0))))

    # 2. Secret Storage Compartment Lock Tumbler (Between headrests)
    mat_slock = Matrix.Translation(Vector((0.0, -0.560, 0.760)))
    bmesh.ops.create_cylinder(bm_dash, radius=0.008, depth=0.012, segments=14, matrix=mat_slock)

    obj_dash = link_obj("GEO_S2K_Passenger_Airbag_and_Compartment", bm_dash, parent_col, mats["trim"], bevel=0.0004)
    objs.append(obj_dash)
    return objs

# ----------------------------------------------------------------------------
# 37. SUBSYSTEM 35: COCKPIT 12V AUXILIARY POWER SOCKET
# ----------------------------------------------------------------------------

def build_s2000_auxiliary_power_socket(parent_col, mats):
    """
    Constructs the cockpit 12V DC power accessory outlet:
    - Inset into transmission tunnel driver side footwell / center console (X = -0.080m, Y = +0.120m, Z = 0.520m).
    - Spring-loaded weatherproof protective rubber cap with embossed "12V 120W" text.
    - Anodized inner brass receptacle socket tube.
    """
    objs = []
    bm_12v = bmesh.new()

    mat_soc = Matrix.Translation(Vector((-0.080, 0.120, 0.520))) @ Euler((0, math.radians(-35), 0), 'XYZ').to_matrix().to_4x4()
    # Receptacle Bezel
    bmesh.ops.create_cylinder(bm_12v, radius=0.014, depth=0.015, segments=16, matrix=mat_soc @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())
    # Flip Cover Cap
    mat_cap = mat_soc @ Matrix.Translation(Vector((-0.008, 0, 0)))
    bmesh.ops.create_cylinder(bm_12v, radius=0.015, depth=0.006, segments=16, matrix=mat_cap @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_12v = link_obj("GEO_S2K_12V_Accessory_Socket", bm_12v, parent_col, mats["trim"], bevel=0.0004)
    objs.append(obj_12v)
    return objs

# ----------------------------------------------------------------------------
# 38. SUBSYSTEM 36: SOFT-TOP INTERNAL ELASTIC STRAPS & B-PILLAR FLAPS
# ----------------------------------------------------------------------------

def build_s2000_soft_top_internal_straps_and_flaps(parent_col, mats):
    """
    Constructs the convertible soft-top internal folding assist hardware:
    - Dual heavy-duty elastic tension straps connecting bow 1 and bow 2 assisting folding cycle.
    - Soft-top B-pillar corner rain gutter weatherstrip guide flaps.
    """
    objs = []
    bm_straps = bmesh.new()

    for sx_sign in [-1.0, 1.0]:
        # Elastic Tension Webbing Strap (Folded inside tonneau well, X = +/- 0.420m, Y = -0.710m, Z = 0.818m)
        mat_strap = Matrix.Translation(Vector((sx_sign * 0.420, -0.710, 0.818)))
        bmesh.ops.create_cube(bm_straps, size=1.0, matrix=mat_strap @ Matrix.Diagonal(Vector((0.035, 0.120, 0.004, 1.0))))

        # B-Pillar Corner Rubber Rain Gutter Flap (Folded at tonneau edge, Z = 0.810m)
        mat_flap = Matrix.Translation(Vector((sx_sign * 0.580, -0.640, 0.810)))
        bmesh.ops.create_cube(bm_straps, size=1.0, matrix=mat_flap @ Matrix.Diagonal(Vector((0.016, 0.060, 0.024, 1.0))))

    obj_straps = link_obj("GEO_S2K_SoftTop_Internal_Tension_Straps", bm_straps, parent_col, mats["trim"], bevel=0.0006)
    objs.append(obj_straps)
    return objs

# ----------------------------------------------------------------------------
# 39. SUBSYSTEM 37: UNDERBODY JACKING PUCKS & SILL DRAIN SCUPPERS
# ----------------------------------------------------------------------------

def build_s2000_jacking_pucks_and_sill_scuppers(parent_col, mats):
    """
    Constructs the underbody jacking pucks and body drain valves:
    - 4 Heavy-duty vulcanized rubber vehicle lift pads on chassis frame rails (X = +/- 0.580m, Y = +0.700m and -0.720m).
    - Rocker panel bottom weep holes allowing water evacuation from inner sills.
    """
    objs = []
    bm_pucks = bmesh.new()

    for jx_sign in [-1.0, 1.0]:
        for jy in [0.700, -0.720]:
            mat_puck = Matrix.Translation(Vector((jx_sign * 0.580, jy, 0.138)))
            # Rectangular Rubber Jacking Puck (80mm x 50mm x 25mm)
            bmesh.ops.create_cube(bm_pucks, size=1.0, matrix=mat_puck @ Matrix.Diagonal(Vector((0.080, 0.050, 0.025, 1.0))))

        # 3 Weep Hole Drain Scuppers along rocker panel
        for dy in [-0.400, 0.0, 0.400]:
            mat_drain = Matrix.Translation(Vector((jx_sign * 0.745, dy, 0.142)))
            bmesh.ops.create_cube(bm_pucks, size=1.0, matrix=mat_drain @ Matrix.Diagonal(Vector((0.008, 0.025, 0.006, 1.0))))

    obj_pucks = link_obj("GEO_S2K_Jacking_Pucks_and_Drain_Scuppers", bm_pucks, parent_col, mats["trim"], bevel=0.0008)
    objs.append(obj_pucks)
    return objs

# ----------------------------------------------------------------------------
# 40. SUBSYSTEM 38: FRONT FENDER AMBER OVAL SIDE WINKERS (JDM SPEC)
# ----------------------------------------------------------------------------

def build_s2000_jdm_fender_side_winkers(parent_col, mats):
    """
    Constructs the JDM/European-spec front fender side turn repeater winkers:
    - Mounted on front fender between wheel arch and door seam (X = +/- 0.865m, Y = +0.680m, Z = 0.710m).
    - Oval amber prismatic translucent lens.
    - Chrome backing reflector and black rubber perimeter sealing gasket.
    """
    objs = []
    bm_winker = bmesh.new()
    bm_wbezel = bmesh.new()

    for wx_sign in [-1.0, 1.0]:
        mat_winker = Matrix.Translation(Vector((wx_sign * 0.865, 0.680, 0.710))) @ Euler((0, 0, wx_sign * math.radians(-2)), 'XYZ').to_matrix().to_4x4()
        # Rubber Perimeter Base Gasket
        bmesh.ops.create_cylinder(bm_wbezel, radius=0.016, depth=0.008, segments=18, matrix=mat_winker @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())
        # Oval Prismatic Amber Lens
        mat_wlens = mat_winker @ Matrix.Translation(Vector((wx_sign * 0.005, 0, 0)))
        bmesh.ops.create_cylinder(bm_winker, radius=0.014, depth=0.010, segments=18, matrix=mat_wlens @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_wbezel = link_obj("GEO_S2K_Side_Winker_Gaskets", bm_wbezel, parent_col, mats["trim"], bevel=0.0004)
    obj_winker = link_obj("GEO_S2K_Side_Winker_Amber_Lenses", bm_winker, parent_col, mats["amber_lens"], bevel=0.0004)

    objs.extend([obj_wbezel, obj_winker])
    return objs
'''
