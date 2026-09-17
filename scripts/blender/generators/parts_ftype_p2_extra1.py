"""
Jaguar F-Type V8 R Convertible (2010s) Phase 20: Extra Part 1
Subsystems 16 to 19:
- Subsystem 16: Cyclone Wheel Center Caps with Red Growler Roundels
- Subsystem 17: Wheel Tire Valve Stems & Chrome Conical Lug Nuts
- Subsystem 18: Front Brake Caliper "JAGUAR" Relief Script & Anti-Rattle Clips
- Subsystem 19: Cockpit Beltline Flocked Weatherstripping & A-Pillar Seals
"""

PART_FTYPE2_EXTRA1 = '''
# ----------------------------------------------------------------------------
# 18. SUBSYSTEM 16: WHEEL CENTER CAPS & RED GROWLER ROUNDELS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_wheel_center_caps(parent_col, mats):
    """
    Constructs the four authentic Jaguar Growler center wheel caps:
    - 65mm circular center caps snapped into the hub of each 20-inch Cyclone wheel.
    - Deep red cloisonné background disc with raised chrome snarling Jaguar cat face.
    - Outer chrome retaining bezel ring flush with wheel hub face.
    """
    objs = []
    bm_caps_red = bmesh.new()
    bm_caps_cat = bmesh.new()

    wheel_hubs = [
        (-0.798,  1.311,  0.343, -1.0, 0.255),
        ( 0.798,  1.311,  0.343,  1.0, 0.255),
        (-0.825, -1.311,  0.343, -1.0, 0.295),
        ( 0.825, -1.311,  0.343,  1.0, 0.295),
    ]

    for wx, wy, wz, x_sign, tw in wheel_hubs:
        mat_cap = Matrix.Translation(Vector((wx + x_sign * (tw * 0.40), wy, wz))) @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()

        # 1. Outer Chrome Bezel Ring
        bmesh.ops.create_cylinder(bm_caps_cat, radius=0.034, depth=0.008, segments=24, matrix=mat_cap)

        # 2. Red Cloisonné Enamel Disc
        mat_field = mat_cap @ Matrix.Translation(Vector((0, 0, x_sign * 0.002)))
        bmesh.ops.create_cylinder(bm_caps_red, radius=0.031, depth=0.006, segments=24, matrix=mat_field)

        # 3. Micro 3D Chrome Jaguar Cat Face
        mat_cat = mat_field @ Matrix.Translation(Vector((0, 0, x_sign * 0.003)))
        bmesh.ops.create_cube(bm_caps_cat, size=1.0, matrix=mat_cat @ Matrix.Diagonal(Vector((0.020, 0.018, 0.004, 1.0))))

    obj_caps_red = link_obj("GEO_FTYPE_Wheel_Center_Cap_Red_Discs", bm_caps_red, parent_col, mats["growler_red"], bevel=0.0003)
    obj_caps_cat = link_obj("GEO_FTYPE_Wheel_Center_Cap_Chrome_Cats", bm_caps_cat, parent_col, mats["chrome"], bevel=0.0003)

    objs.extend([obj_caps_red, obj_caps_cat])
    return objs


# ----------------------------------------------------------------------------
# 19. SUBSYSTEM 17: WHEEL VALVE STEMS & CHROME LUG NUTS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_wheel_fasteners_and_valves(parent_col, mats):
    """
    Constructs high-fidelity wheel jewelry details:
    - 4 angled rubber tire valve stems with knurled aluminum valve caps (TPMS sensors).
    - 20 conical mirror-chrome wheel lug nuts seated into wheel hub wells.
    """
    objs = []
    bm_valves = bmesh.new()
    bm_lugs = bmesh.new()

    wheel_hubs = [
        (-0.798,  1.311,  0.343, -1.0, 0.255),
        ( 0.798,  1.311,  0.343,  1.0, 0.255),
        (-0.825, -1.311,  0.343, -1.0, 0.295),
        ( 0.825, -1.311,  0.343,  1.0, 0.295),
    ]

    for wx, wy, wz, x_sign, tw in wheel_hubs:
        mat_whl = Matrix.Translation(Vector((wx, wy, wz))) @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()

        # 1. Tire Valve Stem (R = 0.220m from axle center, angled 18 degrees outward)
        v_ang = math.radians(45)
        vx = math.cos(v_ang) * 0.220
        vy = math.sin(v_ang) * 0.220
        mat_vstem = mat_whl @ Matrix.Translation(Vector((vx, vy, x_sign * (tw * 0.36))))
        # Rubber Stem
        bmesh.ops.create_cylinder(bm_valves, radius=0.0045, depth=0.024, segments=8, matrix=mat_vstem)
        # Knurled Aluminum Cap
        mat_vcap = mat_vstem @ Matrix.Translation(Vector((0, 0, x_sign * 0.014)))
        bmesh.ops.create_cylinder(bm_valves, radius=0.0055, depth=0.010, segments=10, matrix=mat_vcap)

        # 2. 5 Mirror-Chrome Conical Lug Nuts
        for lug_i in range(5):
            lug_a = lug_i * (2.0 * math.pi / 5.0)
            lx = math.cos(lug_a) * 0.058
            ly = math.sin(lug_a) * 0.058
            mat_lug = mat_whl @ Matrix.Translation(Vector((lx, ly, x_sign * (tw * 0.37))))
            bmesh.ops.create_cylinder(bm_lugs, radius=0.009, depth=0.018, segments=12, matrix=mat_lug)

    obj_valves = link_obj("GEO_FTYPE_Wheel_Tire_Valve_Stems", bm_valves, parent_col, mats["chrome"], bevel=0.0003)
    obj_lugs = link_obj("GEO_FTYPE_Wheel_Chrome_LugNuts", bm_lugs, parent_col, mats["chrome"], bevel=0.0004)

    objs.extend([obj_valves, obj_lugs])
    return objs


# ----------------------------------------------------------------------------
# 20. SUBSYSTEM 18: BRAKE CALIPER "JAGUAR" RELIEF SCRIPT & SPRINGS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_caliper_script_and_hardware(parent_col, mats):
    """
    Constructs high-contrast "JAGUAR" branding and hardware on the yellow brake calipers:
    - High-temperature gloss black raised relief "JAGUAR" lettering along outer caliper face.
    - Stainless steel anti-rattle pad retaining spring clips and guide pins.
    """
    objs = []
    bm_cscript = bmesh.new()
    bm_cspring = bmesh.new()

    caliper_coords = [
        (-0.730,  1.311, 0.343, -1.0, True),
        ( 0.730,  1.311, 0.343,  1.0, True),
        (-0.740, -1.311, 0.343, -1.0, False),
        ( 0.740, -1.311, 0.343,  1.0, False),
    ]

    for cx, cy, cz, x_sign, is_front in caliper_coords:
        cal_ang = math.radians(145 if is_front else 35)
        rr = 0.190 if is_front else 0.188
        c_x = math.cos(cal_ang) * (rr * 0.85)
        c_y = math.sin(cal_ang) * (rr * 0.85)

        mat_cal = Matrix.Translation(Vector((cx, cy, cz))) @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()
        mat_face = mat_cal @ Matrix.Translation(Vector((c_x, c_y, x_sign * 0.065))) @ Euler((0, 0, cal_ang + math.pi * 0.5), 'XYZ').to_matrix().to_4x4()

        # 1. "JAGUAR" Script Bar Silhouette on Caliper Face
        bmesh.ops.create_cube(bm_cscript, size=1.0, matrix=mat_face @ Matrix.Diagonal(Vector((0.022, 0.140, 0.004, 1.0))))

        # 2. Stainless Steel Anti-Rattle Retention Spring Clip
        mat_spring = mat_face @ Matrix.Translation(Vector((0, 0, -0.015)))
        bmesh.ops.create_cube(bm_cspring, size=1.0, matrix=mat_spring @ Matrix.Diagonal(Vector((0.035, 0.080, 0.005, 1.0))))

    obj_cscript = link_obj("GEO_FTYPE_Caliper_Jaguar_Relief_Script", bm_cscript, parent_col, mats["piano_black"], bevel=0.0003)
    obj_cspring = link_obj("GEO_FTYPE_Caliper_AntiRattle_Springs", bm_cspring, parent_col, mats["chrome"], bevel=0.0004)

    objs.extend([obj_cscript, obj_cspring])
    return objs


# ----------------------------------------------------------------------------
# 21. SUBSYSTEM 19: FLOCKED WEATHERSTRIPPING & A-PILLAR GASKETS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_weatherstripping_seals(parent_col, mats):
    """
    Constructs the exterior rubber weatherstripping and sealing gaskets:
    - Flocked black EPDM horizontal beltline window wipe squeegees along door top edges.
    - Windshield A-pillar channel seals diverting rain runoff over the roadster greenhouse.
    - Soft-top tonneau perimeter compression sealing bead.
    """
    objs = []
    bm_seals = bmesh.new()

    # 1. Door Beltline Rubber Squeegee Seals (Left and Right doors: Y: -0.350m to +0.550m, Z = 0.840m)
    for sx_sign in [-1.0, 1.0]:
        mat_seal = Matrix.Translation(Vector((sx_sign * 0.760, 0.100, 0.842)))
        bmesh.ops.create_cube(bm_seals, size=1.0, matrix=mat_seal @ Matrix.Diagonal(Vector((0.014, 0.900, 0.012, 1.0))))

        # A-Pillar Water Runoff Deflector Channel (Spanning cowl to header)
        p_cowl = Vector((sx_sign * 0.740, 0.720, 0.810))
        p_hdr = Vector((sx_sign * 0.575, 0.180, 1.280))
        mid_ch = (p_cowl + p_hdr) * 0.5
        mat_ch = Matrix.Translation(mid_ch) @ Vector((0, 0, 1)).rotation_difference(p_hdr - p_cowl).to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_seals, radius=0.006, depth=(p_hdr - p_cowl).length, segments=8, matrix=mat_ch)

    # 2. Soft-Top Tonneau Perimeter Compression Bead (Around cockpit rear well)
    mat_tseal = Matrix.Translation(Vector((0.0, -0.720, 0.865)))
    bmesh.ops.create_cube(bm_seals, size=1.0, matrix=mat_tseal @ Matrix.Diagonal(Vector((1.280, 0.420, 0.010, 1.0))))

    obj_seals = link_obj("GEO_FTYPE_Weatherstripping_and_Gaskets", bm_seals, parent_col, mats["trim"], bevel=0.0005)
    objs.append(obj_seals)
    return objs
'''
