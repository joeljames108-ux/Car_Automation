# Subsystems 17 to 20 and Master Build for Porsche 911 (993) Carrera Cabriolet Phase 1

PART_E = '''
# ----------------------------------------------------------------------------
# 20. SUBSYSTEM 17: REAR DECKLID HINGES, 12-BLADE COOLING FAN & ALTERNATOR
# ----------------------------------------------------------------------------

def build_993_rear_decklid_hinges_and_fan_shroud(parent_col, mats):
    """
    Constructs the rear engine decklid hinge mechanism and 12-blade cooling fan:
    - Dual rear engine decklid curved gooseneck hinges with torsion assist springs.
    - Decklid safety catch and electric release solenoid.
    - Massive 260mm 12-blade magnesium engine cooling fan shroud.
    - Central alternator hub with dual V-belt pulley drive.
    - Upper fiberglass engine tin air deflectors directing cooling air across cylinder banks.
    """
    objs = []
    bm_fan = bmesh.new()

    # Decklid Gooseneck Hinges (Left & Right at rear window cowl base)
    for hx_sign in [-1.0, 1.0]:
        hx = hx_sign * 0.420
        hy = -1.420
        hz = 0.760
        mat_gh = Matrix.Translation(Vector((hx, hy, hz))) @ Euler((math.radians(-24), 0, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_fan, size=1.0, matrix=mat_gh @ Matrix.Diagonal(Vector((0.028, 0.120, 0.045, 1.0))))

    # 12-Blade Magnesium Cooling Fan Shroud (Central top of Flat-Six, Y: -1.580m, Z: 0.620m)
    mat_fan_shroud = Matrix.Translation(Vector((0.0, -1.580, 0.580))) @ Euler((math.radians(16), 0, 0), 'XYZ').to_matrix().to_4x4()
    # Outer Shroud Ring
    bmesh.ops.create_cylinder(bm_fan, radius=0.130, depth=0.065, segments=24, matrix=mat_fan_shroud @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Central Alternator Hub
    mat_alt_hub = mat_fan_shroud @ Matrix.Translation(Vector((0, 0.020, 0)))
    bmesh.ops.create_cylinder(bm_fan, radius=0.052, depth=0.075, segments=16, matrix=mat_alt_hub @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 12 Curved Fan Blades
    for blade in range(12):
        b_angle = 2.0 * math.pi * blade / 12.0
        mat_blade = mat_fan_shroud @ Euler((0, 0, b_angle), 'XYZ').to_matrix().to_4x4() @ Matrix.Translation(Vector((0, 0.088, 0))) @ Euler((math.radians(35), 0, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_fan, size=1.0, matrix=mat_blade @ Matrix.Diagonal(Vector((0.032, 0.075, 0.004, 1.0))))

    # Dual V-Belt Pulleys & Belt Drive
    mat_pulley = mat_fan_shroud @ Matrix.Translation(Vector((0, 0.065, 0)))
    bmesh.ops.create_cylinder(bm_fan, radius=0.042, depth=0.022, segments=16, matrix=mat_pulley @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_fan = link_obj("GEO_993_Decklid_Hinges_Cooling_Fan", bm_fan, parent_col, mats["alloy"], bevel=0.001)
    objs.append(obj_fan)
    return objs

# ----------------------------------------------------------------------------
# 21. SUBSYSTEM 18: DUAL HYDRAULIC BRAKE HARDLINES & FRONT FUEL CELL
# ----------------------------------------------------------------------------

def build_993_hydraulic_brake_lines_and_fuel_tank(parent_col, mats):
    """
    Constructs the fuel tank and hydraulic brake plumbing:
    - Front-mounted 73.5-liter cross-linked polyethylene fuel cell ahead of cockpit.
    - Fuel filler neck and rubber spill catch basin routing to right front fender.
    - Dual diagonal hydraulic brake hard lines (copper-nickel) routed through center tunnel.
    - ABS hydraulic modulator valve block with 12 solenoid ports.
    """
    objs = []
    bm_fuel = bmesh.new()

    # 73.5L Polyethylene Fuel Cell (Nestled ahead of cockpit, Y: +0.650m to +1.050m)
    mat_tank = Matrix.Translation(Vector((0.0, 0.850, 0.380)))
    bmesh.ops.create_cube(bm_fuel, size=1.0, matrix=mat_tank @ Matrix.Diagonal(Vector((0.680, 0.420, 0.320, 1.0))))

    # Fuel Filler Neck Routing to Right Front Fender (X = +0.720m, Y = +0.880m, Z = 0.650m)
    mat_filler = Matrix.Translation(Vector((0.480, 0.880, 0.520))) @ Euler((0, math.radians(-38), 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_fuel, radius=0.024, depth=0.280, segments=12, matrix=mat_filler)

    # ABS Hydraulic Modulator Block (Right side of frunk)
    mat_abs = Matrix.Translation(Vector((0.320, 0.680, 0.550)))
    bmesh.ops.create_cube(bm_fuel, size=1.0, matrix=mat_abs @ Matrix.Diagonal(Vector((0.120, 0.140, 0.110, 1.0))))

    # Copper-Nickel Brake Lines (Dual runs along central tunnel)
    for bx_offset in [-0.015, 0.015]:
        mat_line = Matrix.Translation(Vector((bx_offset, 0.000, 0.210)))
        bmesh.ops.create_cylinder(bm_fuel, radius=0.004, depth=2.400, segments=8, matrix=mat_line @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_fuel = link_obj("GEO_993_Fuel_Cell_and_Brake_Plumbing", bm_fuel, parent_col, mats["trim"], bevel=0.002)
    objs.append(obj_fuel)
    return objs

# ----------------------------------------------------------------------------
# 22. SUBSYSTEM 19: CHASSIS STRUT TOWER STRESS BAR & TORSIONAL BRACING
# ----------------------------------------------------------------------------

def build_993_chassis_reinforcement_crossbraces(parent_col, mats):
    """
    Constructs chassis structural stiffening for the Cabriolet open-top body:
    - Polished aluminum front strut tower stress bar connecting left and right shock towers.
    - Lower front suspension crossmember reinforcing tie-bars.
    - Rear subframe triangular gusset reinforcement plates.
    - Door sill internal reinforcement box tubes for open-top torsional rigidity.
    """
    objs = []
    bm_brace = bmesh.new()

    # Front Strut Tower Stress Bar (Transverse at Y = +1.136m, Z = 0.620m)
    mat_strut_bar = Matrix.Translation(Vector((0.0, 1.136, 0.620)))
    bmesh.ops.create_cylinder(bm_brace, radius=0.016, depth=1.080, segments=16, matrix=mat_strut_bar @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Strut Tower Mounting Rings (Left & Right)
    for sx_sign in [-1.0, 1.0]:
        mat_ring = Matrix.Translation(Vector((sx_sign * 0.540, 1.136, 0.615)))
        bmesh.ops.create_cylinder(bm_brace, radius=0.075, depth=0.018, segments=16, matrix=mat_ring)

    # Lower Front Subframe Diagonal Reinforcement Tie-Bars
    for bx_sign in [-1.0, 1.0]:
        p1 = Vector((bx_sign * 0.380, 1.050, 0.180))
        p2 = Vector((bx_sign * 0.150, 1.350, 0.190))
        create_cylinder_between(bm_brace, p1, p2, radius=0.012, segments=10)

    # Rear Subframe Triangular Gusset Braces
    for rx_sign in [-1.0, 1.0]:
        mat_gusset = Matrix.Translation(Vector((rx_sign * 0.480, -1.136, 0.260)))
        bmesh.ops.create_cube(bm_brace, size=1.0, matrix=mat_gusset @ Matrix.Diagonal(Vector((0.120, 0.140, 0.012, 1.0))))

    obj_brace = link_obj("GEO_993_Chassis_Torsional_Stress_Braces", bm_brace, parent_col, mats["alloy"], bevel=0.001)
    objs.append(obj_brace)
    return objs

# ----------------------------------------------------------------------------
# 23. SUBSYSTEM 20: UNDERFLOOR AERO STRAKES & DIFFUSER SCOOP
# ----------------------------------------------------------------------------

def build_993_underfloor_aero_strakes_and_diffuser_tunnels(parent_col, mats):
    """
    Constructs aerodynamic underfloor channeling and transaxle cooling scoop:
    - Front lower chin aero strakes and tire air spats.
    - Underfloor longitudinal vortex generating ribs (4 ribs along floorpan).
    - Rear transaxle cooling air scoop (NACA duct geometry feeding air into bellhousing).
    - Rear lower engine undertray protection plate with drain plug cutouts.
    """
    objs = []
    bm_aero = bmesh.new()

    # 4 Longitudinal Underfloor Vortex Generating Ribs
    for rib_x in [-0.480, -0.160, 0.160, 0.480]:
        mat_rib = Matrix.Translation(Vector((rib_x, 0.000, 0.118)))
        bmesh.ops.create_cube(bm_aero, size=1.0, matrix=mat_rib @ Matrix.Diagonal(Vector((0.014, 1.600, 0.024, 1.0))))

    # Front Lower Tire Air Deflector Spats (Ahead of front wheels)
    for sx_sign in [-1.0, 1.0]:
        mat_spat = Matrix.Translation(Vector((sx_sign * 0.620, 1.480, 0.140)))
        bmesh.ops.create_cube(bm_aero, size=1.0, matrix=mat_spat @ Matrix.Diagonal(Vector((0.180, 0.035, 0.065, 1.0))))

    # Rear Transaxle Cooling Air Scoop (NACA Duct, Y = -0.780m)
    mat_scoop = Matrix.Translation(Vector((0.0, -0.780, 0.145)))
    bmesh.ops.create_cube(bm_aero, size=1.0, matrix=mat_scoop @ Matrix.Diagonal(Vector((0.260, 0.320, 0.045, 1.0))))

    # Rear Lower Engine Undertray Protection Plate (Y: -1.450m to -1.820m)
    mat_tray = Matrix.Translation(Vector((0.0, -1.635, 0.165)))
    bmesh.ops.create_cube(bm_aero, size=1.0, matrix=mat_tray @ Matrix.Diagonal(Vector((0.680, 0.420, 0.016, 1.0))))

    obj_aero = link_obj("GEO_993_Underfloor_Aerodynamic_Strakes", bm_aero, parent_col, mats["trim"], bevel=0.001)
    objs.append(obj_aero)
    return objs
'''

