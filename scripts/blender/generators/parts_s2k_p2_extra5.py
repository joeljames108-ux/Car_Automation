"""
Honda S2000 AP1 (2000s) Phase 18: Part Extra 5
Subsystems 51 to 55:
51. Steering Column Ignition Key Cylinder & Transponder Ring
52. Floor Carpet Rubber Heel Pad & Driver Footwell Dead Pedal Mat
53. Hood Leveling Adjustable Rubber Cushion Bumpers
54. Windshield Lower Ceramic Frit Dot Matrix Blackout Border
55. Rear License Plate Overhead White LED Illumination Pods
"""

PART_S2K2_EXTRA5 = '''
# ----------------------------------------------------------------------------
# 53. SUBSYSTEM 51: STEERING COLUMN IGNITION LOCK & KEY CYLINDER
# ----------------------------------------------------------------------------

def build_s2000_ignition_cylinder_and_bezel(parent_col, mats):
    """
    Constructs the steering column ignition lock barrel and transponder ring:
    - Located on right side of steering column shroud (X = -0.310m, Y = +0.280m, Z = 0.650m).
    - Chrome ignition keyhole slot and illuminated green/white transponder ring.
    """
    objs = []
    bm_ign = bmesh.new()

    mat_ign = Matrix.Translation(Vector((-0.310, 0.280, 0.650))) @ Euler((0, math.radians(25), 0), 'XYZ').to_matrix().to_4x4()
    # Bezel Ring
    bmesh.ops.create_cylinder(bm_ign, radius=0.018, depth=0.012, segments=18, matrix=mat_ign @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())
    # Key Slot Slit
    mat_kslot = mat_ign @ Matrix.Translation(Vector((0.007, 0, 0)))
    bmesh.ops.create_cube(bm_ign, size=1.0, matrix=mat_kslot @ Matrix.Diagonal(Vector((0.003, 0.002, 0.014, 1.0))))

    obj_ign = link_obj("GEO_S2K_Ignition_Key_Cylinder", bm_ign, parent_col, mats["chrome"], bevel=0.0004)
    objs.append(obj_ign)
    return objs

# ----------------------------------------------------------------------------
# 54. SUBSYSTEM 52: DRIVER CARPET RUBBER HEEL PAD & FOOT MAT
# ----------------------------------------------------------------------------

def build_s2000_carpet_heel_pad(parent_col, mats):
    """
    Constructs the molded rubber heel pad in driver footwell:
    - Positioned beneath driver pedal box (X = -0.360m, Y = +0.320m, Z = 0.245m).
    - Ribbed black vulcanized rubber pad preventing carpet friction wear.
    """
    objs = []
    bm_hpad = bmesh.new()

    mat_hpad = Matrix.Translation(Vector((-0.360, 0.320, 0.245)))
    # Base Rubber Pad (Width = 0.320m, Length = 0.280m)
    bmesh.ops.create_cube(bm_hpad, size=1.0, matrix=mat_hpad @ Matrix.Diagonal(Vector((0.320, 0.280, 0.005, 1.0))))

    # 6 Longitudinal Anti-Slip Rubber Ribs
    for ri in range(6):
        x_r = -0.120 + ri * 0.048
        mat_rib = mat_hpad @ Matrix.Translation(Vector((x_r, 0, 0.004)))
        bmesh.ops.create_cube(bm_hpad, size=1.0, matrix=mat_rib @ Matrix.Diagonal(Vector((0.012, 0.240, 0.003, 1.0))))

    obj_hpad = link_obj("GEO_S2K_Driver_Carpet_Heel_Pad", bm_hpad, parent_col, mats["trim"], bevel=0.0006)
    objs.append(obj_hpad)
    return objs

# ----------------------------------------------------------------------------
# 55. SUBSYSTEM 53: ADJUSTABLE HOOD LEVELING RUBBER BUMPERS
# ----------------------------------------------------------------------------

def build_s2000_hood_leveling_cushions(parent_col, mats):
    """
    Constructs the threaded adjustable rubber hood height stops:
    - 4 Threaded rubber cushion stops along radiator core support and inner fenders (X = +/- 0.440m, +/- 0.620m).
    - Allows precise millimeter alignment of front hood flushness.
    """
    objs = []
    bm_hcush = bmesh.new()

    cush_coords = [
        Vector((-0.440, 1.760, 0.585)),
        Vector((0.440, 1.760, 0.585)),
        Vector((-0.620, 1.480, 0.640)),
        Vector((0.620, 1.480, 0.640)),
    ]

    for c_pos in cush_coords:
        mat_c = Matrix.Translation(c_pos)
        # Threaded Adjuster Post
        bmesh.ops.create_cylinder(bm_hcush, radius=0.005, depth=0.022, segments=10, matrix=mat_c)
        # Rubber Cushion Mushroom Head
        mat_head = mat_c @ Matrix.Translation(Vector((0, 0, 0.010)))
        bmesh.ops.create_cylinder(bm_hcush, radius=0.012, depth=0.010, segments=14, matrix=mat_head)

    obj_hcush = link_obj("GEO_S2K_Hood_Leveling_Cushions", bm_hcush, parent_col, mats["trim"], bevel=0.0004)
    objs.append(obj_hcush)
    return objs

# ----------------------------------------------------------------------------
# 56. SUBSYSTEM 54: WINDSHIELD CERAMIC FRIT BLACKOUT MASK
# ----------------------------------------------------------------------------

def build_s2000_windshield_ceramic_frit_mask(parent_col, mats):
    """
    Constructs the black ceramic enamel border frit around windshield:
    - Perimeter blackout band masking the windshield polyurethane adhesive bond line.
    - Dot-matrix gradient halftone pattern surrounding interior rearview mirror mounting button.
    """
    objs = []
    bm_frit = bmesh.new()

    mat_w = Matrix.Translation(Vector((0.0, 0.440, 0.980))) @ Euler((math.radians(35), 0, 0), 'XYZ').to_matrix().to_4x4()
    # Bottom Horizontal Frit Band (Width = 1.340m, Height = 0.065m)
    mat_bfrit = mat_w @ Matrix.Translation(Vector((0.0, 0.0, -0.280)))
    bmesh.ops.create_cube(bm_frit, size=1.0, matrix=mat_bfrit @ Matrix.Diagonal(Vector((1.340, 0.002, 0.065, 1.0))))

    # Top Mirror Button Shadow Blackout Mask
    mat_tfrit = mat_w @ Matrix.Translation(Vector((0.0, 0.0, 0.280)))
    bmesh.ops.create_cube(bm_frit, size=1.0, matrix=mat_tfrit @ Matrix.Diagonal(Vector((0.260, 0.002, 0.085, 1.0))))

    obj_frit = link_obj("GEO_S2K_Windshield_Ceramic_Frit_Mask", bm_frit, parent_col, mats["trim"], bevel=0.0002)
    objs.append(obj_frit)
    return objs

# ----------------------------------------------------------------------------
# 57. SUBSYSTEM 55: REAR LICENSE PLATE OVERHEAD ILLUMINATION PODS
# ----------------------------------------------------------------------------

def build_s2000_license_plate_lamps(parent_col, mats):
    """
    Constructs the twin overhead license plate illumination lamps:
    - Left and right miniature lamps concealed in upper lip of rear bumper recess (X = +/- 0.090m, Y = -2.030m, Z = 0.540m).
    - Clear frosted acrylic diffusion lenses angled downward at 45 degrees.
    """
    objs = []
    bm_llamps = bmesh.new()

    for lx_sign in [-1.0, 1.0]:
        mat_lamp = Matrix.Translation(Vector((lx_sign * 0.090, -2.030, 0.540))) @ Euler((math.radians(45), 0, 0), 'XYZ').to_matrix().to_4x4()
        # Housing
        bmesh.ops.create_cube(bm_llamps, size=1.0, matrix=mat_lamp @ Matrix.Diagonal(Vector((0.055, 0.024, 0.016, 1.0))))
        # Frosted Lens
        mat_lens = mat_lamp @ Matrix.Translation(Vector((0, 0, -0.008)))
        bmesh.ops.create_cube(bm_llamps, size=1.0, matrix=mat_lens @ Matrix.Diagonal(Vector((0.048, 0.018, 0.004, 1.0))))

    obj_llamps = link_obj("GEO_S2K_License_Plate_Overhead_Lamps", bm_llamps, parent_col, mats["reverse_clear"], bevel=0.0004)
    objs.append(obj_llamps)
    return objs

# ----------------------------------------------------------------------------
# 58. SUBSYSTEM 56: HOOD LEADING EDGE RUBBER SEALING GASKETS
# ----------------------------------------------------------------------------

def build_s2000_hood_sealing_gaskets(parent_col, mats):
    """
    Constructs the forward aerodynamic hood sealing gaskets:
    - Transverse EPDM hollow bulb rubber weatherstrip seal along core support top (Y = +1.860m, Z = 0.585m).
    - Left and right headlamp brow upper dust deflection rubber strips.
    """
    objs = []
    bm_hgasket = bmesh.new()

    # 1. Main Forward Transverse Core Support Bulb Seal (Width = 0.960m)
    mat_seal = Matrix.Translation(Vector((0.0, 1.860, 0.585)))
    bmesh.ops.create_cylinder(bm_hgasket, radius=0.007, depth=0.960, segments=12, matrix=mat_seal @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Headlamp Brow Dust Deflector Gaskets (Left & Right, X = +/- 0.560m)
    for hx_sign in [-1.0, 1.0]:
        mat_bgask = Matrix.Translation(Vector((hx_sign * 0.560, 1.840, 0.650))) @ Euler((math.radians(16), hx_sign * math.radians(-12), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_hgasket, size=1.0, matrix=mat_bgask @ Matrix.Diagonal(Vector((0.260, 0.012, 0.006, 1.0))))

    obj_hgasket = link_obj("GEO_S2K_Hood_Sealing_Gaskets", bm_hgasket, parent_col, mats["trim"], bevel=0.0004)
    objs.append(obj_hgasket)
    return objs

# ----------------------------------------------------------------------------
# 59. SUBSYSTEM 57: EXHAUST HEAT SHIELD STAMPED CORRUGATION EMBOSSING
# ----------------------------------------------------------------------------

def build_s2000_exhaust_heat_shield_embossing(parent_col, mats):
    """
    Constructs the detailed diamond/dimpled stamping patterns on underbody heat shields:
    - Embossed structural dimples across aluminum transmission tunnel heat shields.
    - Reinforcing swage beads along differential and rear fuel tank shields.
    """
    objs = []
    bm_hemboss = bmesh.new()

    # Dimpled Tunnel Shield Reinforcements (5 Swage beads)
    for bi in range(5):
        y_b = -0.200 + bi * 0.120
        mat_b = Matrix.Translation(Vector((-0.050, y_b, 0.323)))
        bmesh.ops.create_cube(bm_hemboss, size=1.0, matrix=mat_b @ Matrix.Diagonal(Vector((0.220, 0.024, 0.004, 1.0))))

    obj_hemboss = link_obj("GEO_S2K_Exhaust_HeatShield_Embossing", bm_hemboss, parent_col, mats["chrome"], bevel=0.0002)
    objs.append(obj_hemboss)
    return objs
'''
