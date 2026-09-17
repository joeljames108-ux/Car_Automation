"""
Bentley Continental GT Speed Convertible (2020s) Phase 22: Part Extra 5
Subsystems 17 and 18:
- Subsystem 17: Front Radar Transceiver Dome & Heated ACC Grid
- Subsystem 18: Secondary Radiator Stone Guard Protection Screens
"""

PART_BENTLEY2_EXTRA5 = '''
# ----------------------------------------------------------------------------
# 18. SUBSYSTEM 17: FRONT RADAR TRANSCEIVER DOME & HEATED ACC GRID
# ----------------------------------------------------------------------------

def build_bentley_radar_and_acc_system(parent_col, mats):
    """
    Constructs long-range radar sensing hardware for Adaptive Cruise Control:
    - 77 GHz millimeter-wave radar sensor transceiver mounted behind main grille center.
    - Flat dielectric polycarb radome shield with printed micro-wire de-icing heating grid.
    - Rigid cast aluminum mounting bracket triangulating to front bumper crossbeam.
    - Ambient air temperature sensor probe exposed in lower grille airflow.
    """
    objs = []
    bm_radar = bmesh.new()
    bm_radome = bmesh.new()

    # 1. ACC Radar Transceiver Unit (Behind central matrix grille, Y = +2.190m, Z = 0.520m)
    mat_rad = Matrix.Translation(Vector((0.0, 2.190, 0.520)))
    bmesh.ops.create_cube(bm_radar, size=1.0, matrix=mat_rad @ Matrix.Diagonal(Vector((0.130, 0.080, 0.110, 1.0))))

    # Front Dielectric Radome Cover with Heated Wire Grid
    mat_dome = mat_rad @ Matrix.Translation(Vector((0, 0.045, 0)))
    bmesh.ops.create_cube(bm_radome, size=1.0, matrix=mat_dome @ Matrix.Diagonal(Vector((0.120, 0.008, 0.100, 1.0))))

    # Printed Heating Element Wire Traces
    for wire_i in range(5):
        w_z = -0.035 + wire_i * 0.018
        mat_w = mat_dome @ Matrix.Translation(Vector((0, 0.005, w_z)))
        bmesh.ops.create_cube(bm_radome, size=1.0, matrix=mat_w @ Matrix.Diagonal(Vector((0.110, 0.002, 0.002, 1.0))))

    # 2. Ambient External Air Temperature Sensor Probe (Lower grille corner, X = -0.280m, Y = +2.220m, Z = 0.280m)
    mat_temp = Matrix.Translation(Vector((-0.280, 2.220, 0.280)))
    bmesh.ops.create_cylinder(bm_radar, radius=0.007, depth=0.035, segments=12, matrix=mat_temp @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_radar = link_obj("GEO_BENTLEY_ACC_Radar_Transceiver", bm_radar, parent_col, mats["trim_black"], bevel=0.0008)
    obj_radome = link_obj("GEO_BENTLEY_Radar_Radome_and_HeaterGrid", bm_radome, parent_col, mats["dark_tint"], bevel=0.0004)

    objs.extend([obj_radar, obj_radome])
    return objs


# ----------------------------------------------------------------------------
# 19. SUBSYSTEM 18: SECONDARY STONE GUARD PROTECTION SCREENS
# ----------------------------------------------------------------------------

def build_bentley_stone_guard_screens(parent_col, mats):
    """
    Constructs high-speed secondary stone guard mesh screens:
    - Ultra-fine secondary protective wire mesh directly forward of radiators and intercoolers.
    - Prevents gravel and stone damage during 208 mph autobahn cruising.
    - Main center radiator stone guard screen (Y = +2.170m, Z = 0.520m).
    - Left and right intercooler auxiliary stone guard screens (Y = +2.120m, Z = 0.290m).
    """
    objs = []
    bm_guards = bmesh.new()

    # 1. Main Radiator Stone Guard Screen (Behind main matrix grille)
    mat_mguard = Matrix.Translation(Vector((0.0, 2.170, 0.520)))
    bmesh.ops.create_cube(bm_guards, size=1.0, matrix=mat_mguard @ Matrix.Diagonal(Vector((0.740, 0.008, 0.360, 1.0))))

    # 2. Lower Central Air Dam Stone Guard (Y = +2.210m, Z = 0.270m)
    mat_lguard = Matrix.Translation(Vector((0.0, 2.210, 0.270)))
    bmesh.ops.create_cube(bm_guards, size=1.0, matrix=mat_lguard @ Matrix.Diagonal(Vector((0.800, 0.008, 0.120, 1.0))))

    # 3. Outer Intercooler Stone Guard Screens (Left & Right)
    for gx_sign in [-1.0, 1.0]:
        mat_icguard = Matrix.Translation(Vector((gx_sign * 0.650, 2.150, 0.290))) @ Euler((0, gx_sign * math.radians(-12), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_guards, size=1.0, matrix=mat_icguard @ Matrix.Diagonal(Vector((0.310, 0.008, 0.140, 1.0))))

    obj_guards = link_obj("GEO_BENTLEY_Secondary_Radiator_Stone_Guards", bm_guards, parent_col, mats["dark_tint"], bevel=0.0004)
    objs.append(obj_guards)
    return objs
'''
