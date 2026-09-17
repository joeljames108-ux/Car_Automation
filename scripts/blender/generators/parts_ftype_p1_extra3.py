"""
Jaguar F-Type V8 R Convertible (2010s) Phase 19: Extra Part 3
Subsystem 27: V8 Quad-Cam Covers, Twin Air Cleaner Boxes & Carbon Intake Ducts
Subsystem 28: Finned Billet Oil Pan & High-Pressure Direct Injection Shields
Subsystem 29: EAD Multi-Plate Clutch Actuator & Dynamic Torque Vectoring Unit
"""

PART_FTYPE_EXTRA3 = '''
# ----------------------------------------------------------------------------
# 27. SUBSYSTEM 27: V8 VALVE COVERS & TWIN INDUCTION AIR BOXES
# ----------------------------------------------------------------------------

def build_jaguar_ftype_engine_induction_and_covers(parent_col, mats):
    """
    Constructs upper engine architecture and twin intake induction tracts:
    - Left and right contoured magnesium cam covers with ignition coil pack harness cover.
    - Symmetrical dual cold-air intake ducting leading to twin conical air filter boxes.
    - Forward intake ram air horns drawing cool atmospheric air from behind front grille.
    """
    objs = []
    bm_covers = bmesh.new()
    bm_air = bmesh.new()

    # 1. Magnesium Cam Covers (Left and Right Bank, canted at 45 degrees)
    for cx_sign in [-1.0, 1.0]:
        mat_cam = Matrix.Translation(Vector((cx_sign * 0.230, 1.250, 0.620))) @ Euler((0, cx_sign * math.radians(45), 0), 'XYZ').to_matrix().to_4x4()
        # Cam Cover Body
        bmesh.ops.create_cube(bm_covers, size=1.0, matrix=mat_cam @ Matrix.Diagonal(Vector((0.150, 0.540, 0.065, 1.0))))

        # 4 Spark Plug / Direct Ignition Coil Wells
        for plug_i in range(4):
            plug_y = (plug_i - 1.5) * 0.125
            mat_plug = mat_cam @ Matrix.Translation(Vector((0, plug_y, 0.035)))
            bmesh.ops.create_cylinder(bm_covers, radius=0.016, depth=0.025, segments=12, matrix=mat_plug)

        # 2. Dual Cold-Air Induction Boxes & Filter Housings (Ahead of suspension towers)
        mat_abox = Matrix.Translation(Vector((cx_sign * 0.440, 1.680, 0.620)))
        bmesh.ops.create_cube(bm_air, size=1.0, matrix=mat_abox @ Matrix.Diagonal(Vector((0.200, 0.240, 0.180, 1.0))))

        # Forward Air Snorkel Intake Horn (Reaching behind upper grille)
        p_box = Vector((cx_sign * 0.440, 1.800, 0.620))
        p_grille = Vector((cx_sign * 0.280, 2.100, 0.520))
        mid_snork = (p_box + p_grille) * 0.5
        mat_snork = Matrix.Translation(mid_snork) @ Vector((0, 0, 1)).rotation_difference(p_grille - p_box).to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_air, radius=0.045, depth=(p_grille - p_box).length, segments=14, matrix=mat_snork)

        # Intake Duct to Supercharger Throttle Body
        p_tb = Vector((0.0, 1.050, 0.680))
        mid_tb = (p_box + p_tb) * 0.5
        mat_tb = Matrix.Translation(mid_tb) @ Vector((0, 0, 1)).rotation_difference(p_tb - p_box).to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_air, radius=0.048, depth=(p_tb - p_box).length, segments=14, matrix=mat_tb)

    obj_covers = link_obj("GEO_FTYPE_Magnesium_Cam_Covers", bm_covers, parent_col, mats["engine_metal"], bevel=0.001)
    obj_air = link_obj("GEO_FTYPE_Twin_Induction_System", bm_air, parent_col, mats["satin_black"], bevel=0.0012)

    objs.extend([obj_covers, obj_air])
    return objs


# ----------------------------------------------------------------------------
# 28. SUBSYSTEM 28: FINNED OIL PAN & HIGH-PRESSURE DIRECT INJECTION SHIELDS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_oil_pan_and_fuel_rails(parent_col, mats):
    """
    Constructs lower engine architecture and fuel distribution:
    - Billet aluminum structural finned oil sump pan stiffening lower engine skirt.
    - High-pressure 200-bar direct injection stainless steel fuel distribution rails.
    - Acoustic damping composite engine beauty cover and sound deadener shields.
    """
    objs = []
    bm_pan = bmesh.new()
    bm_rails = bmesh.new()

    # 1. Structural Finned Oil Sump Pan (Y = +1.250m, Z = 0.160m to 0.260m)
    mat_pan = Matrix.Translation(Vector((0.0, 1.250, 0.210)))
    bmesh.ops.create_cube(bm_pan, size=1.0, matrix=mat_pan @ Matrix.Diagonal(Vector((0.440, 0.520, 0.100, 1.0))))

    # Transverse Cooling Fins on Sump
    for fin_i in range(8):
        fin_y = (fin_i - 3.5) * 0.055
        mat_fin = mat_pan @ Matrix.Translation(Vector((0, fin_y, -0.050)))
        bmesh.ops.create_cube(bm_pan, size=1.0, matrix=mat_fin @ Matrix.Diagonal(Vector((0.420, 0.008, 0.020, 1.0))))

    # 2. High-Pressure Direct Injection Fuel Rails (Flanking supercharger valley)
    for fx_sign in [-1.0, 1.0]:
        mat_rail = Matrix.Translation(Vector((fx_sign * 0.140, 1.250, 0.600)))
        bmesh.ops.create_cylinder(bm_rails, radius=0.012, depth=0.480, segments=12, matrix=mat_rail @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # 4 High-Pressure Fuel Injectors per Bank
        for inj_i in range(4):
            inj_y = (inj_i - 1.5) * 0.115
            mat_inj = mat_rail @ Matrix.Translation(Vector((0, inj_y, -0.035)))
            bmesh.ops.create_cylinder(bm_rails, radius=0.008, depth=0.050, segments=10, matrix=mat_inj)

    obj_pan = link_obj("GEO_FTYPE_Finned_Engine_Oil_Sump", bm_pan, parent_col, mats["engine_metal"], bevel=0.001)
    obj_rails = link_obj("GEO_FTYPE_Direct_Injection_Rails", bm_rails, parent_col, mats["chrome"], bevel=0.0008)

    objs.extend([obj_pan, obj_rails])
    return objs


# ----------------------------------------------------------------------------
# 29. SUBSYSTEM 29: EAD MULTI-PLATE CLUTCH & TORQUE VECTORING UNIT
# ----------------------------------------------------------------------------

def build_jaguar_ftype_ead_actuator_and_hydraulics(parent_col, mats):
    """
    Constructs the electronic active differential control unit:
    - High-speed electric motor actuator on side of differential carrier.
    - Internal multi-plate wet clutch pack housing varying locking torque from 0 to 100%.
    - Hydraulic pump module and accumulator for dynamic wheel-by-wheel torque vectoring.
    """
    objs = []
    bm_ead = bmesh.new()

    # EAD Electric Actuator Servo (Offset on left of differential)
    mat_ead_motor = Matrix.Translation(Vector((-0.240, -1.311, 0.380))) @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_ead, radius=0.048, depth=0.140, segments=16, matrix=mat_ead_motor)

    # Multi-Plate Clutch Pack Cylindrical Housing
    mat_clutch = Matrix.Translation(Vector((-0.120, -1.311, 0.320))) @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_ead, radius=0.088, depth=0.095, segments=20, matrix=mat_clutch)

    # Hydraulic Valve Block & Solenoid Stacks
    mat_vblock = Matrix.Translation(Vector((0.180, -1.240, 0.360)))
    bmesh.ops.create_cube(bm_ead, size=1.0, matrix=mat_vblock @ Matrix.Diagonal(Vector((0.090, 0.120, 0.100, 1.0))))

    # Pressure Accumulator Canister
    mat_accum = mat_vblock @ Matrix.Translation(Vector((0, -0.060, 0.040)))
    bmesh.ops.create_cylinder(bm_ead, radius=0.032, depth=0.110, segments=14, matrix=mat_accum @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_ead = link_obj("GEO_FTYPE_EAD_Torque_Vectoring_Actuator", bm_ead, parent_col, mats["engine_metal"], bevel=0.001)
    objs.append(obj_ead)
    return objs
'''
