"""
Honda S2000 AP1 (2000s) Phase 18: Part D
Subsystems 13 to 16:
13. Windshield Header Interior Rearview Mirror & Sun Visors
14. Exterior Beltline Weatherstripping & Window Seals
15. Front Bumper Lower Chin Lip Spoiler & Side Spats
16. Rear Decklid Integrated Subtle Ducktail Lip Spoiler
"""

PART_S2K2_D = '''
# ----------------------------------------------------------------------------
# 15. SUBSYSTEM 13: INTERIOR REARVIEW MIRROR & SUN VISORS
# ----------------------------------------------------------------------------

def build_s2000_rearview_mirror_and_sun_visors(parent_col, mats):
    """
    Constructs the windshield header interior rearview mirror and sun visors:
    - Center interior rearview mirror mounted on windshield glass button (X = 0.0m, Y = +0.260m, Z = 1.180m).
    - Double ball-joint swivel arm with day/night anti-glare flip tab.
    - Driver and passenger folding vinyl sun visors with passenger vanity mirror.
    - Windshield header dual interior map reading lamps.
    """
    objs = []
    bm_rmirror = bmesh.new()
    bm_rglass = bmesh.new()
    bm_visors = bmesh.new()

    # 1. Interior Rearview Mirror (X = 0.0m, Y = 0.260m, Z = 1.180m)
    mat_rm = Matrix.Translation(Vector((0.0, 0.260, 1.180))) @ Euler((math.radians(12), 0, 0), 'XYZ').to_matrix().to_4x4()

    # Mirror Plastic Housing Bezel
    bmesh.ops.create_cube(bm_rmirror, size=1.0, matrix=mat_rm @ Matrix.Diagonal(Vector((0.210, 0.024, 0.065, 1.0))))

    # Optical Mirror Glass Face (Rearward facing)
    mat_face = mat_rm @ Matrix.Translation(Vector((0.0, -0.012, 0.0)))
    bmesh.ops.create_cube(bm_rglass, size=1.0, matrix=mat_face @ Matrix.Diagonal(Vector((0.200, 0.004, 0.058, 1.0))))

    # Day/Night Anti-Glare Toggle Tab (Bottom center of mirror)
    mat_tab = mat_rm @ Matrix.Translation(Vector((0.0, -0.005, -0.038)))
    bmesh.ops.create_cube(bm_rmirror, size=1.0, matrix=mat_tab @ Matrix.Diagonal(Vector((0.022, 0.016, 0.012, 1.0))))

    # Swivel Mounting Stalk to Windshield Glass
    mat_stalk = mat_rm @ Matrix.Translation(Vector((0.0, 0.035, 0.025))) @ Euler((math.radians(35), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_rmirror, radius=0.008, depth=0.065, segments=12, matrix=mat_stalk)

    # 2. Driver & Passenger Folding Sun Visors (X = +/- 0.320m, Y = +0.280m, Z = 1.220m)
    for vx_sign in [-1.0, 1.0]:
        mat_v = Matrix.Translation(Vector((vx_sign * 0.320, 0.280, 1.220))) @ Euler((math.radians(8), vx_sign * math.radians(-5), 0), 'XYZ').to_matrix().to_4x4()
        # Visor Body
        bmesh.ops.create_cube(bm_visors, size=1.0, matrix=mat_v @ Matrix.Diagonal(Vector((0.310, 0.115, 0.016, 1.0))))
        # Swivel Pivot Hinge Rod (Inboard end)
        mat_vrod = mat_v @ Matrix.Translation(Vector((vx_sign * 0.160, 0.050, 0.0)))
        bmesh.ops.create_cylinder(bm_visors, radius=0.005, depth=0.040, segments=10, matrix=mat_vrod)

    obj_rmirror = link_obj("GEO_S2K_Interior_Rearview_Mirror_Housing", bm_rmirror, parent_col, mats["trim"], bevel=0.0008)
    obj_rglass = link_obj("GEO_S2K_Interior_Rearview_Mirror_Glass", bm_rglass, parent_col, mats["mirror_glass"], bevel=0.0004)
    obj_visors = link_obj("GEO_S2K_Interior_Sun_Visors", bm_visors, parent_col, mats["trim"], bevel=0.001)

    objs.extend([obj_rmirror, obj_rglass, obj_visors])
    return objs

# ----------------------------------------------------------------------------
# 16. SUBSYSTEM 14: BELTLINE WEATHERSTRIPPING & WINDOW SEALS
# ----------------------------------------------------------------------------

def build_s2000_beltline_weatherstripping_and_seals(parent_col, mats):
    """
    Constructs the exterior rubber weatherstripping and door glass waistline seals:
    - Left and right horizontal door beltline window squeegee scraper strips (X = +/- 0.810m, Y: -0.620m to +0.380m, Z = 0.802m).
    - A-pillar windshield frame soft rubber weatherstrip channel running up to header.
    - Soft-top rear deck tonneau sealing bead gasket preventing water leak into trunk.
    """
    objs = []
    bm_seals = bmesh.new()

    for sx_sign in [-1.0, 1.0]:
        # 1. Door Waistline Horizontal Window Scraper Seal (Length = 1.000m)
        mat_wseal = Matrix.Translation(Vector((sx_sign * 0.810, -0.120, 0.802)))
        bmesh.ops.create_cube(bm_seals, size=1.0, matrix=mat_wseal @ Matrix.Diagonal(Vector((0.016, 1.020, 0.014, 1.0))))

        # 2. A-Pillar Weatherstrip Channel (Extending up along A-pillar to header)
        p_a_base = Vector((sx_sign * 0.740, 0.440, 0.810))
        p_a_top = Vector((sx_sign * 0.520, 0.220, 1.250))
        p_a_span = p_a_top - p_a_base
        mat_achannel = Matrix.Translation(p_a_base + p_a_span * 0.5)
        bmesh.ops.create_cube(bm_seals, size=1.0, matrix=mat_achannel @ Matrix.Diagonal(Vector((0.018, p_a_span.length, 0.018, 1.0))))

    # 3. Soft-Top Rear Tonneau Flange Arc Gasket (Transverse U-shape behind roll hoops)
    mat_tgasket = Matrix.Translation(Vector((0.0, -0.740, 0.825)))
    bmesh.ops.create_cylinder(bm_seals, radius=0.010, depth=1.360, segments=16, matrix=mat_tgasket @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_seals = link_obj("GEO_S2K_Weatherstripping_and_Rubber_Seals", bm_seals, parent_col, mats["trim"], bevel=0.0006)
    objs.append(obj_seals)
    return objs

# ----------------------------------------------------------------------------
# 17. SUBSYSTEM 15: FRONT BUMPER LOWER CHIN LIP SPOILER
# ----------------------------------------------------------------------------

def build_s2000_front_chin_spoiler_and_spats(parent_col, mats):
    """
    Constructs the aerodynamic front chin spoiler lip and corner spats:
    - Swept lower polyurethane front lip spoiler hugging the bottom bumper edge (Y = +1.920m to +2.050m, Z = 0.165m).
    - Left and right forward corner aerodynamic air splitters reducing front turbulence.
    - Factory black textured aerodynamic finish.
    """
    objs = []
    bm_clip = bmesh.new()

    # 1. Main Front Chin Spoiler Blade (Width = 1.480m, Z = 0.165m)
    mat_lip = Matrix.Translation(Vector((0.0, 1.980, 0.165))) @ Euler((math.radians(-6), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_clip, size=1.0, matrix=mat_lip @ Matrix.Diagonal(Vector((1.480, 0.120, 0.022, 1.0))))

    # 2. Left & Right Forward Corner Aerodynamic Winglet Spats
    for wx_sign in [-1.0, 1.0]:
        mat_wspat = Matrix.Translation(Vector((wx_sign * 0.740, 1.880, 0.175))) @ Euler((0, wx_sign * math.radians(-12), wx_sign * math.radians(18)), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_clip, size=1.0, matrix=mat_wspat @ Matrix.Diagonal(Vector((0.080, 0.160, 0.038, 1.0))))

    obj_clip = link_obj("GEO_S2K_Front_Chin_Spoiler_and_Spats", bm_clip, parent_col, mats["trim"], bevel=0.001)
    objs.append(obj_clip)
    return objs

# ----------------------------------------------------------------------------
# 18. SUBSYSTEM 16: REAR DECKLID INTEGRATED DUCKTAIL LIP SPOILER
# ----------------------------------------------------------------------------

def build_s2000_rear_decklid_ducktail_spoiler(parent_col, mats):
    """
    Constructs the subtle factory aerodynamic rear decklid lip spoiler:
    - Mounted along rear trunk trailing edge (X = 0.0m, Y = -1.980m, Z = 0.825m).
    - Upward-kicked aerodynamic ducktail trailing lip providing rear high-speed stability.
    - Contoured to seamlessly match trunk lid perimeter curvature.
    """
    objs = []
    bm_rspoiler = bmesh.new()

    mat_rsp = Matrix.Translation(Vector((0.0, -1.980, 0.825))) @ Euler((math.radians(18), 0, 0), 'XYZ').to_matrix().to_4x4()

    # 1. Main Spoiler Blade (Width = 1.180m, Depth = 0.095m, Thickness = 0.024m)
    bmesh.ops.create_cube(bm_rspoiler, size=1.0, matrix=mat_rsp @ Matrix.Diagonal(Vector((1.180, 0.095, 0.024, 1.0))))

    # 2. Left & Right Downward Tapered Wingtips
    for tx_sign in [-1.0, 1.0]:
        mat_wtip = mat_rsp @ Matrix.Translation(Vector((tx_sign * 0.580, 0.015, -0.012))) @ Euler((0, tx_sign * math.radians(14), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_rspoiler, size=1.0, matrix=mat_wtip @ Matrix.Diagonal(Vector((0.085, 0.085, 0.018, 1.0))))

    obj_rspoiler = link_obj("GEO_S2K_Rear_Decklid_Ducktail_Spoiler", bm_rspoiler, parent_col, mats["body"], bevel=0.0012)
    objs.append(obj_rspoiler)
    return objs
'''
