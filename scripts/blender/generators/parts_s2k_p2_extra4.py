"""
Honda S2000 AP1 (2000s) Phase 18: Part Extra 4
Subsystems 45 to 50:
45. Radiator Upper Core Support Bushing Stays & Anodized Brackets
46. Rear Bumper Towing Eyelet Cover Plug & Adapter Loop
47. Cockpit Map Reading Lamps & Sun Visor Retention Clips
48. Trunk Carpet Mat Paneling & Spare Wheel Retaining Spinner
49. Shifter Boot Billet Trim Ring Perimeter Hex Screws
50. Rear License Plate Lamp Waterproof Wiring Grommets
"""

PART_S2K2_EXTRA4 = '''
# ----------------------------------------------------------------------------
# 47. SUBSYSTEM 45: RADIATOR UPPER MOUNT BRACKETS & BUSHINGS
# ----------------------------------------------------------------------------

def build_s2000_radiator_upper_mounts(parent_col, mats):
    """
    Constructs the upper radiator core support retention stays:
    - Left and right aluminum radiator upper stay brackets (X = +/- 0.310m, Y = +1.740m, Z = 0.585m).
    - Heavy-duty EPDM rubber vibration-damping isolation bushings.
    - Flanged M6 chassis mounting bolts.
    """
    objs = []
    bm_stays = bmesh.new()

    for sx_sign in [-1.0, 1.0]:
        mat_stay = Matrix.Translation(Vector((sx_sign * 0.310, 1.740, 0.585)))
        # Aluminum Bracket Arm
        bmesh.ops.create_cube(bm_stays, size=1.0, matrix=mat_stay @ Matrix.Diagonal(Vector((0.042, 0.085, 0.008, 1.0))))
        # Rubber Doughnut Bushing
        mat_bush = mat_stay @ Matrix.Translation(Vector((0, 0.025, -0.010)))
        bmesh.ops.create_cylinder(bm_stays, radius=0.018, depth=0.022, segments=14, matrix=mat_bush)
        # Retaining M6 Flange Bolt
        mat_bolt = mat_stay @ Matrix.Translation(Vector((0, -0.025, 0.006)))
        bmesh.ops.create_cylinder(bm_stays, radius=0.006, depth=0.014, segments=8, matrix=mat_bolt)

    obj_stays = link_obj("GEO_S2K_Radiator_Upper_Mount_Stays", bm_stays, parent_col, mats["chrome"], bevel=0.0004)
    objs.append(obj_stays)
    return objs

# ----------------------------------------------------------------------------
# 48. SUBSYSTEM 46: REAR BUMPER TOWING EYELET COVER & LOOP
# ----------------------------------------------------------------------------

def build_s2000_rear_towing_cover_and_eyelet(parent_col, mats):
    """
    Constructs the rear bumper emergency towing hardware:
    - Removable square bumper access plug cover (X = +0.480m, Y = -2.030m, Z = 0.420m).
    - Internal threaded structural receiver welded to rear frame horn.
    - Steel emergency screw-in recovery towing loop eyelet.
    """
    objs = []
    bm_rtow = bmesh.new()

    mat_rcov = Matrix.Translation(Vector((0.480, -2.030, 0.420))) @ Euler((math.radians(-14), 0, 0), 'XYZ').to_matrix().to_4x4()
    # Square Flush Bumper Cover Cap (45mm x 45mm)
    bmesh.ops.create_cube(bm_rtow, size=1.0, matrix=mat_rcov @ Matrix.Diagonal(Vector((0.045, 0.006, 0.045, 1.0))))
    # Internal Threaded Receiver Tube
    mat_rtube = mat_rcov @ Matrix.Translation(Vector((0, 0.050, 0)))
    bmesh.ops.create_cylinder(bm_rtow, radius=0.014, depth=0.100, segments=14, matrix=mat_rtube @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_rtow = link_obj("GEO_S2K_Rear_Towing_Access_Port", bm_rtow, parent_col, mats["body"], bevel=0.0006)
    objs.append(obj_rtow)
    return objs

# ----------------------------------------------------------------------------
# 49. SUBSYSTEM 47: COCKPIT MAP READING LAMPS & VISOR CLIPS
# ----------------------------------------------------------------------------

def build_s2000_map_lamps_and_visor_clips(parent_col, mats):
    """
    Constructs the windshield header overhead lighting and visor clips:
    - Dual push-lens interior map reading spot lamps on header panel (X = +/- 0.075m, Y = +0.280m, Z = 1.240m).
    - Left and right sun visor retention receiver snap clips.
    """
    objs = []
    bm_map = bmesh.new()

    for lx_sign in [-1.0, 1.0]:
        # Map Lamp Lens (Push-button frosted acrylic lens)
        mat_lamp = Matrix.Translation(Vector((lx_sign * 0.075, 0.280, 1.240))) @ Euler((math.radians(16), 0, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_map, size=1.0, matrix=mat_lamp @ Matrix.Diagonal(Vector((0.045, 0.035, 0.012, 1.0))))

        # Sun Visor Outer Receiver Clip (X = +/- 0.160m)
        mat_clip = Matrix.Translation(Vector((lx_sign * 0.160, 0.280, 1.245)))
        bmesh.ops.create_cylinder(bm_map, radius=0.006, depth=0.015, segments=10, matrix=mat_clip)

    obj_map = link_obj("GEO_S2K_Overhead_Map_Lamps_and_Clips", bm_map, parent_col, mats["reverse_clear"], bevel=0.0004)
    objs.append(obj_map)
    return objs

# ----------------------------------------------------------------------------
# 50. SUBSYSTEM 48: TRUNK CARPET MAT & SPARE WHEEL SPINNER
# ----------------------------------------------------------------------------

def build_s2000_trunk_carpet_and_spare_spinner(parent_col, mats):
    """
    Constructs the trunk compartment fitted carpet panelling and spare tire tie-down:
    - Tailored charcoal needle-punch carpet floor lining trunk well (Y: -1.250m to -1.850m).
    - Die-cast aluminum threaded spare wheel hold-down spinner wingnut (X = 0.0m, Y = -1.450m, Z = 0.310m).
    """
    objs = []
    bm_tcarpet = bmesh.new()

    # 1. Trunk Floor Molded Carpet Panel
    mat_floor = Matrix.Translation(Vector((0.0, -1.550, 0.295)))
    bmesh.ops.create_cube(bm_tcarpet, size=1.0, matrix=mat_floor @ Matrix.Diagonal(Vector((0.780, 0.650, 0.008, 1.0))))

    # 2. Spare Wheel Hold-Down Wingnut Spinner
    mat_spin = Matrix.Translation(Vector((0.0, -1.450, 0.315)))
    bmesh.ops.create_cylinder(bm_tcarpet, radius=0.018, depth=0.016, segments=16, matrix=mat_spin)
    # Wingnut Wings
    bmesh.ops.create_cube(bm_tcarpet, size=1.0, matrix=mat_spin @ Matrix.Diagonal(Vector((0.075, 0.014, 0.024, 1.0))))

    obj_tcarpet = link_obj("GEO_S2K_Trunk_Carpet_and_Spare_Spinner", bm_tcarpet, parent_col, mats["trim"], bevel=0.0006)
    objs.append(obj_tcarpet)
    return objs

# ----------------------------------------------------------------------------
# 51. SUBSYSTEM 49: SHIFTER CONSOLE BILLET TRIM RING HEX SCREWS
# ----------------------------------------------------------------------------

def build_s2000_shifter_trim_ring_screws(parent_col, mats):
    """
    Constructs the iconic AP1 exposed Allen hex fasteners around the shifter bezel:
    - 6 Counter-sunk stainless Allen hex bolts securing the circular shifter ring (X = 0.0m, Y = +0.220m, Z = 0.588m).
    - Machined aluminum shift gate ring collar.
    """
    objs = []
    bm_sscrews = bmesh.new()

    mat_sring = Matrix.Translation(Vector((0.0, 0.220, 0.588)))
    r_ring = 0.052

    for bi in range(6):
        b_ang = bi * math.pi / 3.0
        bx = r_ring * math.cos(b_ang)
        by = r_ring * math.sin(b_ang)
        mat_sbolt = mat_sring @ Matrix.Translation(Vector((bx, by, 0.003)))
        # Bolt Head
        bmesh.ops.create_cylinder(bm_sscrews, radius=0.004, depth=0.004, segments=12, matrix=mat_sbolt)
        # Allen Hex Socket
        bmesh.ops.create_cylinder(bm_sscrews, radius=0.002, depth=0.003, segments=6, matrix=mat_sbolt @ Matrix.Translation(Vector((0, 0, 0.001))))

    obj_sscrews = link_obj("GEO_S2K_Shifter_Bezel_Hex_Screws", bm_sscrews, parent_col, mats["chrome"], bevel=0.0002)
    objs.append(obj_sscrews)
    return objs

# ----------------------------------------------------------------------------
# 52. SUBSYSTEM 50: LICENSE PLATE LAMP RUBBER WIRING GROMMETS
# ----------------------------------------------------------------------------

def build_s2000_license_lamp_wiring_grommets(parent_col, mats):
    """
    Constructs the rear bumper license lamp wiring conduits and rubber grommets:
    - Left and right EPDM rubber accordion sealing grommets passing into rear bumper valance (X = +/- 0.110m, Y = -2.020m, Z = 0.535m).
    - Twin insulated wiring sub-harnesses.
    """
    objs = []
    bm_grom = bmesh.new()

    for gx_sign in [-1.0, 1.0]:
        mat_gr = Matrix.Translation(Vector((gx_sign * 0.110, -2.020, 0.535)))
        bmesh.ops.create_cylinder(bm_grom, radius=0.012, depth=0.018, segments=12, matrix=mat_gr @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
        # Wire Conduit
        mat_w = mat_gr @ Matrix.Translation(Vector((0, 0.020, 0)))
        bmesh.ops.create_cylinder(bm_grom, radius=0.004, depth=0.045, segments=8, matrix=mat_w @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_grom = link_obj("GEO_S2K_License_Lamp_Wiring_Grommets", bm_grom, parent_col, mats["trim"], bevel=0.0004)
    objs.append(obj_grom)
    return objs
'''
