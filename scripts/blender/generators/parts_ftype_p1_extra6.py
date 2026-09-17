"""
Jaguar F-Type V8 R Convertible (2010s) Phase 19: Extra Part 6
Subsystem 37: Active Rising Center Air Vent Pod & Dashboard Touchscreen Console
Subsystem 38: Front Brake Cooling Aerodynamic NACA Ducts & Splash Deflectors
Subsystem 39: Aluminum Engine Skid Plate & Subframe Diagonal Shear Webbing
"""

PART_FTYPE_EXTRA6 = '''
# ----------------------------------------------------------------------------
# 37. SUBSYSTEM 37: ACTIVE RISING AIR VENT POD & DASHBOARD CONSOLE
# ----------------------------------------------------------------------------

def build_jaguar_ftype_dashboard_vents_and_screens(parent_col, mats):
    """
    Constructs Jaguar's theatrical rising center climate vent pod and cockpit display:
    - Motorized center air vent unit rising flush from top of dashboard when climate control activates.
    - Twin circular outboard turbine air vents flanking instrument binnacle.
    - InControl 8-inch high-resolution infotainment touchscreen display housing.
    - Lower dual rotary climate control dials with integrated digital temperature LCDs.
    """
    objs = []
    bm_vents = bmesh.new()

    # 1. Motorized Rising Center Air Vent Unit (Dashboard center top: Y = +0.540m, Z = 0.860m)
    mat_pod = Matrix.Translation(Vector((0.0, 0.540, 0.865))) @ Euler((math.radians(12), 0, 0), 'XYZ').to_matrix().to_4x4()
    # Rising Vent Housing Block
    bmesh.ops.create_cube(bm_vents, size=1.0, matrix=mat_pod @ Matrix.Diagonal(Vector((0.240, 0.120, 0.055, 1.0))))
    # Dual Louvered Outlet Nozzles
    for nx_sign in [-1.0, 1.0]:
        mat_nozzle = mat_pod @ Matrix.Translation(Vector((nx_sign * 0.065, 0.020, 0.005)))
        bmesh.ops.create_cube(bm_vents, size=1.0, matrix=mat_nozzle @ Matrix.Diagonal(Vector((0.085, 0.040, 0.035, 1.0))))

    # 2. Outboard Turbine Air Vents (Left and Right dashboard ends)
    for vx_sign in [-1.0, 1.0]:
        mat_turb = Matrix.Translation(Vector((vx_sign * 0.580, 0.490, 0.820))) @ Euler((0, vx_sign * math.radians(-15), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_vents, radius=0.038, depth=0.035, segments=18, matrix=mat_turb @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 3. InControl Touchscreen Center Display Bezel (Center console: Y = +0.420m, Z = 0.720m)
    mat_screen = Matrix.Translation(Vector((0.0, 0.420, 0.720))) @ Euler((math.radians(22), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_vents, size=1.0, matrix=mat_screen @ Matrix.Diagonal(Vector((0.220, 0.040, 0.140, 1.0))))

    # 4. Dual Rotary Climate Control Dials
    for dx_sign in [-1.0, 1.0]:
        mat_dial = mat_screen @ Matrix.Translation(Vector((dx_sign * 0.065, -0.015, -0.075)))
        bmesh.ops.create_cylinder(bm_vents, radius=0.026, depth=0.025, segments=18, matrix=mat_dial @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_vents = link_obj("GEO_FTYPE_Active_Vent_Pod_and_Screens", bm_vents, parent_col, mats["satin_black"], bevel=0.001)
    objs.append(obj_vents)
    return objs


# ----------------------------------------------------------------------------
# 38. SUBSYSTEM 38: FRONT BRAKE COOLING DUCTS & AERO STIFFENERS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_front_brake_cooling_ducts(parent_col, mats):
    """
    Constructs the high-velocity brake cooling airflow guides:
    - Left and right intake funnels behind front bumper shark gill intakes.
    - Sculpted composite ducts routing cool air directly onto 380mm brake rotors.
    - Aerodynamic wheel well exit louvers reducing high-pressure turbulence inside arches.
    """
    objs = []
    bm_ducts = bmesh.new()

    for dx_sign in [-1.0, 1.0]:
        p_grille = Vector((dx_sign * 0.680, 1.980, 0.360))
        p_rotor = Vector((dx_sign * 0.680, 1.340, 0.340))
        mid_d = (p_grille + p_rotor) * 0.5
        mat_duct = Matrix.Translation(mid_d) @ Vector((0, 0, 1)).rotation_difference(p_rotor - p_grille).to_matrix().to_4x4()

        # Hollow Airflow Tube
        bmesh.ops.create_cylinder(bm_ducts, radius=0.046, depth=(p_rotor - p_grille).length, segments=14, matrix=mat_duct)

        # Rotor Backing Air Diffuser Funnel
        mat_funnel = Matrix.Translation(p_rotor)
        bmesh.ops.create_cylinder(bm_ducts, radius=0.068, depth=0.050, segments=16, matrix=mat_funnel @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_ducts = link_obj("GEO_FTYPE_Front_Brake_Cooling_Ducts", bm_ducts, parent_col, mats["satin_black"], bevel=0.001)
    objs.append(obj_ducts)
    return objs


# ----------------------------------------------------------------------------
# 39. SUBSYSTEM 39: ALUMINUM ENGINE SKID PLATE & SHEAR WEBBING
# ----------------------------------------------------------------------------

def build_jaguar_ftype_engine_skid_plate_and_webbing(parent_col, mats):
    """
    Constructs high-durability underbody protection and shear reinforcement:
    - Formed stamped aluminum skid plate shielding engine oil pan and steering rack.
    - Diagonal laser-welded shear webbing plate tying subframe horns to main monocoque rails.
    - Flush countersunk fasteners and oil drain plug service hatch.
    """
    objs = []
    bm_skid = bmesh.new()

    # 1. Stamped Aluminum Skid Plate (Y: +1.050m to +1.680m, Z = 0.145m)
    mat_skid = Matrix.Translation(Vector((0.0, 1.365, 0.145)))
    bmesh.ops.create_cube(bm_skid, size=1.0, matrix=mat_skid @ Matrix.Diagonal(Vector((0.820, 0.620, 0.016, 1.0))))

    # Stamped Longitudinal Rib Stiffeners
    for s_i in range(5):
        s_x = (s_i - 2) * 0.140
        mat_srib = mat_skid @ Matrix.Translation(Vector((s_x, 0, -0.008)))
        bmesh.ops.create_cube(bm_skid, size=1.0, matrix=mat_srib @ Matrix.Diagonal(Vector((0.035, 0.580, 0.012, 1.0))))

    # 2. Diagonal Shear Webbing Triangles
    for wx_sign in [-1.0, 1.0]:
        mat_web = Matrix.Translation(Vector((wx_sign * 0.520, 1.080, 0.160))) @ Euler((0, 0, wx_sign * math.radians(32)), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_skid, size=1.0, matrix=mat_web @ Matrix.Diagonal(Vector((0.080, 0.440, 0.020, 1.0))))

    obj_skid = link_obj("GEO_FTYPE_Engine_Skid_Plate", bm_skid, parent_col, mats["alloy"], bevel=0.001)
    objs.append(obj_skid)
    return objs
'''
