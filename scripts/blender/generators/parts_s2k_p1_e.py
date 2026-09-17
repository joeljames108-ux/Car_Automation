"""
Honda S2000 AP1 (2000s) Phase 17: Part E
Subsystems 17 to 20:
17. Front Strut Tower X-Brace & Torsional Tie Bars
18. Front & Rear Tubular Anti-Roll Sway Bars & Links
19. Front Brake Ram-Air Cooling Ducts & Deflectors
20. Underfloor Longitudinal Aero Tray & Rear Diffuser
"""

PART_S2K_E = '''
# ----------------------------------------------------------------------------
# 19. SUBSYSTEM 17: FRONT STRUT TOWER BRACE & TORSIONAL TIES
# ----------------------------------------------------------------------------

def build_s2000_strut_brace_and_torsional_ties(parent_col, mats):
    """
    Constructs chassis structural stiffening for high open-top torsional rigidity:
    - Polished aluminum front upper strut tower stress bar traversing the engine bay (Y = +1.180m, Z = 0.680m).
    - Left and right shock tower multi-bolt mounting rings.
    - Lower front subframe reinforcement tie-bar cradle.
    - Rear subframe triangular gusset reinforcement plates.
    """
    objs = []
    bm_brace = bmesh.new()

    # 1. Front Strut Tower Stress Bar (Traversing from Left X = -0.480m to Right X = +0.480m)
    mat_bar = Matrix.Translation(Vector((0.0, 1.180, 0.680)))
    bmesh.ops.create_cylinder(bm_brace, radius=0.016, depth=0.960, segments=16, matrix=mat_bar @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Left & Right Strut Tower Multi-Bolt Mounting Rings (X = +/- 0.480m)
    for bx_sign in [-1.0, 1.0]:
        mat_ring = Matrix.Translation(Vector((bx_sign * 0.480, 1.180, 0.640)))
        bmesh.ops.create_cylinder(bm_brace, radius=0.065, depth=0.016, segments=20, matrix=mat_ring)
        # Tower Stud Through-Bolts
        for bolt_idx in range(3):
            b_ang = bolt_idx * 2.0 * math.pi / 3.0
            mat_bolt = mat_ring @ Matrix.Translation(Vector((0.045 * math.cos(b_ang), 0.045 * math.sin(b_ang), 0.015)))
            bmesh.ops.create_cylinder(bm_brace, radius=0.006, depth=0.020, segments=8, matrix=mat_bolt)

    # 2. Lower Front Subframe Reinforcement Tie-Bar Cradle (Z = 0.175m)
    mat_tie = Matrix.Translation(Vector((0.0, 1.050, 0.175)))
    bmesh.ops.create_cube(bm_brace, size=1.0, matrix=mat_tie @ Matrix.Diagonal(Vector((0.740, 0.065, 0.024, 1.0))))

    # 3. Rear Subframe Triangular Gusset Reinforcement Plates (X = +/- 0.380m, Y = -1.150m)
    for rx_sign in [-1.0, 1.0]:
        mat_gusset = Matrix.Translation(Vector((rx_sign * 0.380, -1.150, 0.260)))
        bmesh.ops.create_cube(bm_brace, size=1.0, matrix=mat_gusset @ Matrix.Diagonal(Vector((0.080, 0.140, 0.015, 1.0))))

    obj_brace = link_obj("GEO_S2K_Chassis_Torsional_Braces", bm_brace, parent_col, mats["alloy"], bevel=0.0015)
    objs.append(obj_brace)
    return objs

# ----------------------------------------------------------------------------
# 20. SUBSYSTEM 18: FRONT & REAR ANTI-ROLL SWAY BARS
# ----------------------------------------------------------------------------

def build_s2000_front_and_rear_sway_bars(parent_col, mats):
    """
    Constructs the high-rate front and rear anti-roll sway bars:
    - Front 28.2mm tubular sway bar traversing beneath radiator support (Y = +1.320m, Z = 0.225m).
    - Front vertical ball-joint drop links connected to lower control arms.
    - Rear 27.2mm solid anti-roll bar routed beneath differential housing (Y = -1.060m, Z = 0.230m).
    - Rear drop links connecting to rear lower wishbones.
    """
    objs = []
    bm_sway = bmesh.new()

    # 1. Front Anti-Roll Sway Bar (Y = +1.320m, Z = 0.225m)
    mat_f_sway = Matrix.Translation(Vector((0.0, 1.320, 0.225)))
    bmesh.ops.create_cylinder(bm_sway, radius=0.014, depth=0.880, segments=16, matrix=mat_f_sway @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Front Pivot Bushing Saddles & Drop Links
    for fx_sign in [-1.0, 1.0]:
        mat_fbush = Matrix.Translation(Vector((fx_sign * 0.360, 1.320, 0.225)))
        bmesh.ops.create_cube(bm_sway, size=1.0, matrix=mat_fbush @ Matrix.Diagonal(Vector((0.045, 0.052, 0.042, 1.0))))

        # Front Vertical Drop Link to Lower Arm
        mat_flink = Matrix.Translation(Vector((fx_sign * 0.480, 1.280, 0.230)))
        bmesh.ops.create_cylinder(bm_sway, radius=0.007, depth=0.110, segments=10, matrix=mat_flink)

    # 2. Rear Anti-Roll Sway Bar (Y = -1.060m, Z = 0.230m)
    mat_r_sway = Matrix.Translation(Vector((0.0, -1.060, 0.230)))
    bmesh.ops.create_cylinder(bm_sway, radius=0.0135, depth=0.860, segments=16, matrix=mat_r_sway @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Rear Pivot Saddles & Drop Links
    for rx_sign in [-1.0, 1.0]:
        mat_rbush = Matrix.Translation(Vector((rx_sign * 0.350, -1.060, 0.230)))
        bmesh.ops.create_cube(bm_sway, size=1.0, matrix=mat_rbush @ Matrix.Diagonal(Vector((0.045, 0.052, 0.040, 1.0))))

        # Rear Drop Link
        mat_rlink = Matrix.Translation(Vector((rx_sign * 0.460, -1.120, 0.235)))
        bmesh.ops.create_cylinder(bm_sway, radius=0.007, depth=0.110, segments=10, matrix=mat_rlink)

    obj_sway = link_obj("GEO_S2K_AntiRoll_Sway_Bars", bm_sway, parent_col, mats["trim"], bevel=0.001)
    objs.append(obj_sway)
    return objs

# ----------------------------------------------------------------------------
# 21. SUBSYSTEM 19: FRONT BRAKE COOLING DUCTS & DEFLECTORS
# ----------------------------------------------------------------------------

def build_s2000_front_brake_cooling_ducts(parent_col, mats):
    """
    Constructs the aerodynamic front brake cooling ductwork:
    - Ram-air intake scoops in lower front bumper valance (X = +/- 0.480m, Y = +1.980m, Z = 0.240m).
    - Flexible corrugated ducting routed through inner fender liners.
    - Brake rotor dust shield directional air deflector nozzles.
    """
    objs = []
    bm_duct = bmesh.new()

    for bx_sign in [-1.0, 1.0]:
        # Intake Funnel
        mat_funnel = Matrix.Translation(Vector((bx_sign * 0.480, 1.980, 0.240)))
        bmesh.ops.create_cube(bm_duct, size=1.0, matrix=mat_funnel @ Matrix.Diagonal(Vector((0.110, 0.075, 0.065, 1.0))))

        # Corrugated Flexible Duct Hose
        mat_hose = Matrix.Translation(Vector((bx_sign * 0.550, 1.650, 0.280))) @ Euler((math.radians(-14), bx_sign * math.radians(10), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_duct, radius=0.028, depth=0.580, segments=14, matrix=mat_hose @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # Rotor Backing Plate Air Deflector Scoop
        mat_scoop = Matrix.Translation(Vector((bx_sign * 0.650, 1.240, 0.316)))
        bmesh.ops.create_cube(bm_duct, size=1.0, matrix=mat_scoop @ Matrix.Diagonal(Vector((0.035, 0.120, 0.140, 1.0))))

    obj_duct = link_obj("GEO_S2K_Front_Brake_Cooling_Ducts", bm_duct, parent_col, mats["trim"], bevel=0.001)
    objs.append(obj_duct)
    return objs

# ----------------------------------------------------------------------------
# 22. SUBSYSTEM 20: UNDERFLOOR AERO PAN & REAR DIFFUSER
# ----------------------------------------------------------------------------

def build_s2000_underfloor_aero_pan_and_diffuser(parent_col, mats):
    """
    Constructs the underbody aerodynamics and rear diffuser tunnels:
    - Front under-engine composite aerodynamic splash tray with oil filter service hatch.
    - Rear differential air guide scoop tunnel.
    - Rear lower bumper aerodynamic strakes reducing wake turbulence.
    """
    objs = []
    bm_aero = bmesh.new()

    # 1. Front Engine Underbody Splash Tray (Y: +1.100m to +1.800m, Z = 0.155m)
    mat_tray = Matrix.Translation(Vector((0.0, 1.450, 0.155)))
    bmesh.ops.create_cube(bm_aero, size=1.0, matrix=mat_tray @ Matrix.Diagonal(Vector((0.820, 0.700, 0.014, 1.0))))

    # 2. Rear Differential Cooling Scoop & Aero Guide (Y = -1.050m, Z = 0.165m)
    mat_scoop = Matrix.Translation(Vector((0.0, -1.050, 0.165)))
    bmesh.ops.create_cube(bm_aero, size=1.0, matrix=mat_scoop @ Matrix.Diagonal(Vector((0.360, 0.400, 0.024, 1.0))))

    # 3. Rear Diffuser Longitudinal Aero Strakes (Y = -1.850m to -2.040m, Z = 0.180m)
    for sx in [-0.260, 0.260]:
        mat_strake = Matrix.Translation(Vector((sx, -1.945, 0.180)))
        bmesh.ops.create_cube(bm_aero, size=1.0, matrix=mat_strake @ Matrix.Diagonal(Vector((0.012, 0.220, 0.055, 1.0))))

    obj_aero = link_obj("GEO_S2K_Underfloor_Aero_Strakes", bm_aero, parent_col, mats["trim"], bevel=0.001)
    objs.append(obj_aero)
    return objs
'''
