"""
Bentley Continental GT Speed Convertible (2020s) Phase 21: Part Extra 14
Subsystems 32 and 33:
- Subsystem 32: EVAP Carbon Canister System, Purge Valves & Vapor Lines
- Subsystem 33: Twin Induction Air Filter Boxes & Ram-Air Intake Snorkels
"""

PART_BENTLEY_EXTRA14 = '''
# ----------------------------------------------------------------------------
# 32. SUBSYSTEM 32: EVAP CARBON CANISTER, PURGE VALVES & VAPOR LINES
# ----------------------------------------------------------------------------

def build_bentley_evap_canister_system(parent_col, mats):
    """
    Constructs the evaporative emissions control system:
    - Activated charcoal vapor absorption canister mounted above rear right wheelhouse.
    - Electronic EVAP purge solenoid valve module controlling manifold vacuum draw.
    - Nylon fuel vapor return conduits running parallel to fuel delivery lines.
    - Fuel tank pressure differential sensor and roll-over vapor vent valve.
    """
    objs = []
    bm_can = bmesh.new()
    bm_tubes = bmesh.new()

    # 1. Activated Charcoal EVAP Canister (Above right rear wheelhouse, X = +0.680m, Y = -1.280m, Z = 0.580m)
    mat_can = Matrix.Translation(Vector((0.680, -1.280, 0.580)))
    bmesh.ops.create_cube(bm_can, size=1.0, matrix=mat_can @ Matrix.Diagonal(Vector((0.180, 0.280, 0.160, 1.0))))

    # Canister Vacuum Port Nipples
    for nip_off in [-0.045, 0.045]:
        mat_nip = mat_can @ Matrix.Translation(Vector((0, 0.150, nip_off)))
        bmesh.ops.create_cylinder(bm_can, radius=0.012, depth=0.040, segments=12, matrix=mat_nip @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Electronic Purge Solenoid Valve (Engine bay right flank, Y = +1.120m, Z = 0.620m)
    mat_purge = Matrix.Translation(Vector((0.440, 1.120, 0.620)))
    bmesh.ops.create_cylinder(bm_can, radius=0.024, depth=0.075, segments=14, matrix=mat_purge)

    # 3. Longitudinal Nylon Vapor Return Conduit (Right sill, running from canister to engine bay)
    mat_tube = Matrix.Translation(Vector((0.680, -0.100, 0.320)))
    bmesh.ops.create_cylinder(bm_tubes, radius=0.006, depth=2.400, segments=10, matrix=mat_tube @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_can = link_obj("GEO_BENTLEY_EVAP_Charcoal_Canister_Module", bm_can, parent_col, mats["trim_black"], bevel=0.0012)
    obj_tubes = link_obj("GEO_BENTLEY_EVAP_Vapor_Return_Conduits", bm_tubes, parent_col, mats["trim_black"], bevel=0.0006)

    objs.extend([obj_can, obj_tubes])
    return objs


# ----------------------------------------------------------------------------
# 33. SUBSYSTEM 33: TWIN INDUCTION AIRBOXES & RAM-AIR INTAKE SNORKELS
# ----------------------------------------------------------------------------

def build_bentley_air_intake_boxes_and_snorkels(parent_col, mats):
    """
    Constructs high-flow twin induction air filter enclosures and intake snorkels:
    - Twin high-volume composite air filter boxes positioned behind front grille header.
    - Ram-air intake snorkel ducts capturing clean ambient air behind matrix grille mesh.
    - Carbon composite induction intake pipes feeding twin-scroll turbocharger inlets.
    - Dual Mass Airflow (MAF) sensor housings with electronic connector terminals.
    """
    objs = []
    bm_airbox = bmesh.new()
    bm_pipes = bmesh.new()

    # Twin Symmetrical Induction Filter Airboxes (Left & Right, Y = +1.880m, Z = 0.620m)
    for ab_sign in [-1.0, 1.0]:
        mat_box = Matrix.Translation(Vector((ab_sign * 0.380, 1.880, 0.620)))
        # Filter Housing Upper & Lower Shells
        bmesh.ops.create_cube(bm_airbox, size=1.0, matrix=mat_box @ Matrix.Diagonal(Vector((0.240, 0.280, 0.160, 1.0))))

        # Ram-Air Front Intake Snorkel Horn (reaching forward to grille header at Y = +2.160m)
        p_snork_start = Vector((ab_sign * 0.380, 1.980, 0.640))
        p_snork_end = Vector((ab_sign * 0.240, 2.180, 0.670))
        p_mid = (p_snork_start + p_snork_end) * 0.5
        v_snork = p_snork_end - p_snork_start
        length = v_snork.length
        rot_quat = Vector((0, 0, 1)).rotation_difference(v_snork.normalized())

        mat_snork = Matrix.Translation(p_mid) @ rot_quat.to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_pipes, radius=0.045, depth=length, segments=16, matrix=mat_snork)

        # Flared Snorkel Ambient Air Inlet Bellmouth behind matrix grille
        mat_bell = Matrix.Translation(p_snork_end) @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_pipes, cap_ends=False, radius=0.065, depth=0.035, segments=18, matrix=mat_bell)

        # Clean Air Duct to Turbocharger Compressor Inlets (Y: +1.880m back to +1.280m)
        p_turb = Vector((ab_sign * 0.360, 1.280, 0.440))
        p_box_out = Vector((ab_sign * 0.380, 1.740, 0.600))
        p_pipe_mid = (p_turb + p_box_out) * 0.5
        v_pipe = p_turb - p_box_out
        pipe_len = v_pipe.length
        pipe_rot = Vector((0, 0, 1)).rotation_difference(v_pipe.normalized())

        mat_tpipe = Matrix.Translation(p_pipe_mid) @ pipe_rot.to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_pipes, radius=0.042, depth=pipe_len, segments=16, matrix=mat_tpipe)

        # Cylindrical Mass Air Flow (MAF) Sensor Housing
        mat_maf = Matrix.Translation((p_box_out + p_turb) * 0.7)
        bmesh.ops.create_cylinder(bm_airbox, radius=0.048, depth=0.065, segments=14, matrix=mat_maf)

    obj_airbox = link_obj("GEO_BENTLEY_Induction_Twin_Air_Filter_Boxes", bm_airbox, parent_col, mats["trim_black"], bevel=0.0015)
    obj_pipes = link_obj("GEO_BENTLEY_RamAir_Intake_Snorkels_and_Piping", bm_pipes, parent_col, mats["piano_black"], bevel=0.001)

    objs.extend([obj_airbox, obj_pipes])
    return objs
'''
