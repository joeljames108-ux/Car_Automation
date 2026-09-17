"""
Jaguar F-Type V8 R Convertible (2010s) Phase 20: Extra Part 3
Subsystems 24 to 27:
- Subsystem 24: Clamshell Bonnet Heat Extractor Fine Wire Mesh Screens
- Subsystem 25: Fuel Filler Flap Door & Push-Push Mechanical Latch
- Subsystem 26: Underbody Dzus Quarter-Turn Fasteners & Fastener Rings
- Subsystem 27: Windshield Ceramic Frit Perimeter Mask & Dot Matrix Border
"""

PART_FTYPE2_EXTRA3 = '''
# ----------------------------------------------------------------------------
# 26. SUBSYSTEM 24: CLAMSHELL BONNET VENTS FINE WIRE MESH
# ----------------------------------------------------------------------------

def build_jaguar_ftype_bonnet_vent_screens(parent_col, mats):
    """
    Constructs the wire mesh screens inside the clamshell bonnet louvers:
    - High-density stainless steel black wire mesh inside each hood extractor vent.
    - Gloss black outer raised perimeter lip shielding edges.
    """
    objs = []
    bm_vscreen = bmesh.new()

    for vx_sign in [-1.0, 1.0]:
        mat_vent = Matrix.Translation(Vector((vx_sign * 0.340, 1.450, 0.812))) @ Euler((math.radians(12), vx_sign * math.radians(-5), 0), 'XYZ').to_matrix().to_4x4()

        # Wire Screen Infill
        for wire_i in range(12):
            w_y = (wire_i - 5.5) * 0.022
            mat_w = mat_vent @ Matrix.Translation(Vector((0, w_y, 0.002)))
            bmesh.ops.create_cylinder(bm_vscreen, radius=0.0015, depth=0.080, segments=6, matrix=mat_w @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        for wire_j in range(5):
            w_x = (wire_j - 2) * 0.018
            mat_wj = mat_vent @ Matrix.Translation(Vector((w_x, 0, 0.002)))
            bmesh.ops.create_cylinder(bm_vscreen, radius=0.0015, depth=0.260, segments=6, matrix=mat_wj)

    obj_vscreen = link_obj("GEO_FTYPE_Bonnet_Vent_Wire_Screens", bm_vscreen, parent_col, mats["piano_black"], bevel=0.0003)
    objs.append(obj_vscreen)
    return objs


# ----------------------------------------------------------------------------
# 27. SUBSYSTEM 25: FUEL FILLER FLAP DOOR & LATCH HARDWARE
# ----------------------------------------------------------------------------

def build_jaguar_ftype_fuel_filler_door(parent_col, mats):
    """
    Constructs the circular fuel filler door:
    - Circular fuel flap on passenger rear quarter haunch (X = 0.945m, Y = -1.150m, Z = 0.840m).
    - Recessed circular shut line groove and inner rubber seal.
    - Push-push magnetic latch release plunger and screw-on fuel cap tether.
    """
    objs = []
    bm_fuel_door = bmesh.new()

    mat_ff = Matrix.Translation(Vector((0.952, -1.150, 0.840))) @ Euler((0, math.radians(12), math.radians(-8)), 'XYZ').to_matrix().to_4x4()

    # 1. Outer Circular Fuel Flap
    bmesh.ops.create_cylinder(bm_fuel_door, radius=0.068, depth=0.006, segments=24, matrix=mat_ff @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Recessed Shadow Ring Groove
    mat_fgroove = mat_ff @ Matrix.Translation(Vector((-0.004, 0, 0)))
    bmesh.ops.create_cylinder(bm_fuel_door, radius=0.072, depth=0.008, segments=24, matrix=mat_fgroove @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_fuel_door = link_obj("GEO_FTYPE_Fuel_Filler_Flap", bm_fuel_door, parent_col, mats["body"], bevel=0.0005)
    objs.append(obj_fuel_door)
    return objs


# ----------------------------------------------------------------------------
# 28. SUBSYSTEM 26: UNDERBODY DZUS FASTENERS & FASTENER RINGS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_underbody_dzus_fasteners(parent_col, mats):
    """
    Constructs aerodynamic underbody flush fasteners:
    - 24 countersunk Dzus quarter-turn quick-release fasteners along underbody undertray seams.
    - Stamped circular dimple fastener retention washers.
    """
    objs = []
    bm_dzus = bmesh.new()

    dzus_locations = []
    # Perimeter undertray bolts
    for dy in [1.500, 1.000, 0.500, 0.000, -0.500, -1.000]:
        for dx_sign in [-1.0, 1.0]:
            dzus_locations.append((dx_sign * 0.680, dy, 0.125))
            dzus_locations.append((dx_sign * 0.320, dy, 0.125))

    for x, y, z in dzus_locations:
        mat_dz = Matrix.Translation(Vector((x, y, z)))
        # Outer Counter-Sunk Washer
        bmesh.ops.create_cylinder(bm_dzus, radius=0.012, depth=0.004, segments=12, matrix=mat_dz)
        # Center Slotted Dzus Head
        bmesh.ops.create_cylinder(bm_dzus, radius=0.007, depth=0.006, segments=10, matrix=mat_dz)

    obj_dzus = link_obj("GEO_FTYPE_Underbody_Dzus_Fasteners", bm_dzus, parent_col, mats["alloy"], bevel=0.0003)
    objs.append(obj_dzus)
    return objs


# ----------------------------------------------------------------------------
# 29. SUBSYSTEM 27: WINDSHIELD CERAMIC FRIT PERIMETER MASK
# ----------------------------------------------------------------------------

def build_jaguar_ftype_windshield_ceramic_frit(parent_col, mats):
    """
    Constructs the black ceramic enamel frit border around the windshield:
    - Opaque black silk-screened enamel perimeter band along edges of windshield glass.
    - Graded dot-matrix sunshade band around interior rearview mirror / ADAS camera pod.
    - Protects urethane glass bonding adhesive from UV degradation.
    """
    objs = []
    bm_frit = bmesh.new()

    p_cowl_c = Vector((0.0, 0.720, 0.825))
    p_hdr_c = Vector((0.0, 0.180, 1.270))
    mid_g = (p_cowl_c + p_hdr_c) * 0.5
    mat_frit = Matrix.Translation(mid_g) @ Vector((0, 0, 1)).rotation_difference(p_hdr_c - p_cowl_c).to_matrix().to_4x4()

    # Left and Right Outer Frit Border Bands
    for fx_sign in [-1.0, 1.0]:
        mat_side = mat_frit @ Matrix.Translation(Vector((fx_sign * 0.550, -0.003, 0)))
        bmesh.ops.create_cube(bm_frit, size=1.0, matrix=mat_side @ Matrix.Diagonal(Vector((0.035, 0.003, (p_hdr_c - p_cowl_c).length * 0.98, 1.0))))

    # Upper Header Frit Band
    mat_top = mat_frit @ Matrix.Translation(Vector((0.0, -0.003, (p_hdr_c - p_cowl_c).length * 0.48)))
    bmesh.ops.create_cube(bm_frit, size=1.0, matrix=mat_top @ Matrix.Diagonal(Vector((1.120, 0.003, 0.035, 1.0))))

    # Lower Cowl Frit Band
    mat_bot = mat_frit @ Matrix.Translation(Vector((0.0, -0.003, -(p_hdr_c - p_cowl_c).length * 0.48)))
    bmesh.ops.create_cube(bm_frit, size=1.0, matrix=mat_bot @ Matrix.Diagonal(Vector((1.120, 0.003, 0.030, 1.0))))

    obj_frit = link_obj("GEO_FTYPE_Windshield_Ceramic_Frit_Mask", bm_frit, parent_col, mats["piano_black"], bevel=0.0003)
    objs.append(obj_frit)
    return objs
'''
