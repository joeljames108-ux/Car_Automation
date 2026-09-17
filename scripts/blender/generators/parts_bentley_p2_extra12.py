"""
Bentley Continental GT Speed Convertible (2020s) Phase 22: Part Extra 12
Subsystems 31 and 32:
- Subsystem 31: Wheel TPMS Valve Stems & Chrome Conical Lug Bolt Caps
- Subsystem 32: Center Console Dual Cup Holders with Chrome Claws & LED Halos
"""

PART_BENTLEY2_EXTRA12 = '''
# ----------------------------------------------------------------------------
# 32. SUBSYSTEM 31: WHEEL TPMS VALVE STEMS & CHROME LUG BOLT CAPS
# ----------------------------------------------------------------------------

def build_bentley_wheel_hardware_and_tpms(parent_col, mats):
    """
    Constructs the micro-machined running gear hardware:
    - 4 high-pressure anodized aluminum Schrader tire valve stems with diamond-knurled caps.
    - Integrated direct Tyre Pressure Monitoring System (TPMS) 433 MHz radio transponders.
    - 20 mirror-chrome conical wheel bolt caps recessed inside the deep 22-inch Speed wheel wells.
    """
    objs = []
    bm_valves = bmesh.new()
    bm_lugs = bmesh.new()

    wheel_locs = [
        ("FL", -0.836,  1.425, 0.365,  0.275, -1.0),
        ("FR",  0.836,  1.425, 0.365,  0.275,  1.0),
        ("RL", -0.832, -1.426, 0.365,  0.315, -1.0),
        ("RR",  0.832, -1.426, 0.365,  0.315,  1.0),
    ]

    for name, wx, wy, wz, tw, x_sign in wheel_locs:
        mat_whl = Matrix.Translation(Vector((wx, wy, wz)))

        # 1. TPMS High-Pressure Aluminum Tire Valve Stem (Angle = 45 deg, R = 0.230m)
        v_ang = math.radians(45)
        mat_valve = mat_whl @ Matrix.Translation(Vector((x_sign * (tw * 0.36), math.sin(v_ang) * 0.230, math.cos(v_ang) * 0.230)))
        # Valve Stem Tube
        bmesh.ops.create_cylinder(bm_valves, radius=0.004, depth=0.026, segments=12, matrix=mat_valve @ Euler((0, x_sign * math.radians(28), 0), 'XYZ').to_matrix().to_4x4())
        # Knurled Hex Valve Cap
        mat_vcap = mat_valve @ Matrix.Translation(Vector((x_sign * 0.010, 0, 0)))
        bmesh.ops.create_cylinder(bm_valves, radius=0.005, depth=0.010, segments=6, matrix=mat_vcap @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # 2. Five Mirror-Chrome Conical Lug Bolt Caps per Wheel (Lug radius = 0.065m)
        mat_hub = mat_whl @ Matrix.Translation(Vector((x_sign * (tw * 0.370), 0, 0)))
        for lug_i in range(5):
            lug_ang = lug_i * (2.0 * math.pi / 5.0)
            ly = math.sin(lug_ang) * 0.065
            lz = math.cos(lug_ang) * 0.065
            mat_lug = mat_hub @ Matrix.Translation(Vector((0.0, ly, lz)))
            # Chrome Hexagonal Bolt Head Cap
            bmesh.ops.create_cylinder(bm_lugs, radius=0.009, depth=0.018, segments=6, matrix=mat_lug @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_valves = link_obj("GEO_BENTLEY_Wheel_TPMS_Valve_Stems", bm_valves, parent_col, mats["knurled_metal"], bevel=0.0003)
    obj_lugs = link_obj("GEO_BENTLEY_Wheel_Chrome_Lug_Bolt_Caps", bm_lugs, parent_col, mats["chrome"], bevel=0.0003)

    objs.extend([obj_valves, obj_lugs])
    return objs


# ----------------------------------------------------------------------------
# 33. SUBSYSTEM 32: CONSOLE DUAL CUP HOLDERS & LED AMBIENT RINGS
# ----------------------------------------------------------------------------

def build_bentley_cup_holders(parent_col, mats):
    """
    Constructs the luxury center console beverage stowage:
    - Twin cylindrical cup holder wells embedded within the grand tourer center tunnel.
    - Polished chrome spring-loaded articulated centering grip fingers.
    - Soft-glow ambient illuminated circular edge rings.
    - Piano black console well trim floor.
    """
    objs = []
    bm_wells = bmesh.new()
    bm_halos = bmesh.new()
    bm_claws = bmesh.new()

    mat_tunnel = Matrix.Translation(Vector((0.0, 0.020, 0.490)))

    # Twin Cup Wells (Fore & Aft along center tunnel)
    for cup_i, cup_y in enumerate([-0.055, 0.055]):
        mat_cup = mat_tunnel @ Matrix.Translation(Vector((0.0, cup_y, 0.0)))

        # 1. Recessed Cylindrical Cup Holder Well (Radius = 0.042m, Depth = 0.065m)
        bmesh.ops.create_cylinder(bm_wells, radius=0.042, depth=0.065, segments=22, matrix=mat_cup)

        # 2. Illuminated Ambient LED Halo Edge Ring
        mat_halo = mat_cup @ Matrix.Translation(Vector((0, 0, 0.032)))
        bmesh.ops.create_torus(bm_halos, major_radius=0.042, minor_radius=0.002, major_segments=22, minor_segments=8, matrix=mat_halo)

        # 3. Spring-Loaded Centering Grip Claws (3 fingers per cup well)
        for claw_i in range(3):
            c_ang = claw_i * (2.0 * math.pi / 3.0)
            mat_claw = mat_cup @ Euler((0, 0, c_ang), 'XYZ').to_matrix().to_4x4() @ Matrix.Translation(Vector((0.034, 0.0, 0.010)))
            bmesh.ops.create_cube(bm_claws, size=1.0, matrix=mat_claw @ Matrix.Diagonal(Vector((0.012, 0.018, 0.008, 1.0))))

    obj_wells = link_obj("GEO_BENTLEY_Console_Cup_Holder_Wells", bm_wells, parent_col, mats["piano_black"], bevel=0.0005)
    obj_halos = link_obj("GEO_BENTLEY_Cup_Holder_Ambient_LED_Rings", bm_halos, parent_col, mats["led_drl"], bevel=0.0002)
    obj_claws = link_obj("GEO_BENTLEY_Cup_Holder_Chrome_Claws", bm_claws, parent_col, mats["chrome"], bevel=0.0003)

    objs.extend([obj_wells, obj_halos, obj_claws])
    return objs
'''
