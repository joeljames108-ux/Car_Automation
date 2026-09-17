"""
Jaguar F-Type V8 R Convertible (2010s) Phase 19: Extra Part 8
Subsystem 44: Convertible Roof Hydraulic Mechanism & Articulated Scissor Arms
Subsystem 45: Active Rear Spoiler Screw-Jack Mechanism & Support Hinges
Subsystem 46: Front Bumper Pedestrian Protection Foam Core & Honeycomb Carrier
Subsystem 47: Transmission Tunnel Structural Reinforcement Shear Plate
"""

PART_FTYPE_EXTRA8 = '''
# ----------------------------------------------------------------------------
# 44. SUBSYSTEM 44: CONVERTIBLE ROOF MECHANICAL SCISSOR ARMS & CYLINDERS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_roof_mechanism(parent_col, mats):
    """
    Constructs the compact Z-folding convertible soft-top mechanical mechanism:
    - Articulated magnesium/aluminum scissor arms linking main pivot to header.
    - Dual high-pressure hydraulic ram cylinders powering 12-second roof cycle.
    - Electronic roof latch lock mechanisms and tension cable guide pulleys.
    """
    objs = []
    bm_roof_mech = bmesh.new()

    for mx_sign in [-1.0, 1.0]:
        mx = mx_sign * 0.640
        my = -0.580
        mz = 0.780

        # Main Base Pivot Bracket (Anchored to B-pillar bulkhead)
        mat_pivot = Matrix.Translation(Vector((mx, my, mz)))
        bmesh.ops.create_cube(bm_roof_mech, size=1.0, matrix=mat_pivot @ Matrix.Diagonal(Vector((0.040, 0.080, 0.090, 1.0))))

        # Lower Scissor Control Arm
        p1 = Vector((mx, my, mz))
        p2 = Vector((mx - mx_sign * 0.040, my - 0.180, mz + 0.060))
        mid_sc1 = (p1 + p2) * 0.5
        mat_sc1 = Matrix.Translation(mid_sc1) @ Vector((0, 0, 1)).rotation_difference(p2 - p1).to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_roof_mech, radius=0.012, depth=(p2 - p1).length, segments=12, matrix=mat_sc1)

        # Upper Folding Linkage Arm
        p3 = Vector((mx - mx_sign * 0.020, my - 0.280, mz + 0.080))
        mid_sc2 = (p2 + p3) * 0.5
        mat_sc2 = Matrix.Translation(mid_sc2) @ Vector((0, 0, 1)).rotation_difference(p3 - p2).to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_roof_mech, radius=0.010, depth=(p3 - p2).length, segments=12, matrix=mat_sc2)

        # Hydraulic Lift Cylinder (Tucked into rear quarter cavity)
        p_cyl_base = Vector((mx, my + 0.050, mz - 0.120))
        mid_cyl = (p_cyl_base + p2) * 0.5
        mat_cyl = Matrix.Translation(mid_cyl) @ Vector((0, 0, 1)).rotation_difference(p2 - p_cyl_base).to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_roof_mech, radius=0.016, depth=(p2 - p_cyl_base).length, segments=12, matrix=mat_cyl)

    obj_roof_mech = link_obj("GEO_FTYPE_Roof_Folding_Linkages", bm_roof_mech, parent_col, mats["engine_metal"], bevel=0.001)
    objs.append(obj_roof_mech)
    return objs


# ----------------------------------------------------------------------------
# 45. SUBSYSTEM 45: ACTIVE REAR SPOILER SCREW-JACK DRIVE MECHANISM
# ----------------------------------------------------------------------------

def build_jaguar_ftype_spoiler_drive_unit(parent_col, mats):
    """
    Constructs the electric screw-jack actuator deploying active rear spoiler at 70 mph:
    - Dual motorized worm-screw linear actuators nestled inside trunk lid recess.
    - Scissor hinge deployment arms lifting and angling the aerodynamic blade.
    - Waterproof rubber concertina bellows seals shielding drive mechanism from rain.
    """
    objs = []
    bm_sp_drive = bmesh.new()

    for sx_sign in [-1.0, 1.0]:
        mat_sp_act = Matrix.Translation(Vector((sx_sign * 0.420, -1.860, 0.760)))

        # Electric Linear Screw Drive Motor Casing
        bmesh.ops.create_cylinder(bm_sp_drive, radius=0.024, depth=0.120, segments=14, matrix=mat_sp_act @ Euler((math.radians(14), 0, 0), 'XYZ').to_matrix().to_4x4())

        # Scissor Lifting Bracket
        bmesh.ops.create_cube(bm_sp_drive, size=1.0, matrix=mat_sp_act @ Matrix.Translation(Vector((0, 0, 0.035))) @ Matrix.Diagonal(Vector((0.035, 0.080, 0.040, 1.0))))

        # Flexible Accordion Weather Bellows (Shielding drive aperture)
        bmesh.ops.create_cube(bm_sp_drive, size=1.0, matrix=mat_sp_act @ Matrix.Translation(Vector((0, 0, 0.045))) @ Matrix.Diagonal(Vector((0.050, 0.095, 0.025, 1.0))))

    obj_sp_drive = link_obj("GEO_FTYPE_Spoiler_Drive_Actuators", bm_sp_drive, parent_col, mats["engine_metal"], bevel=0.001)
    objs.append(obj_sp_drive)
    return objs


# ----------------------------------------------------------------------------
# 46. SUBSYSTEM 46: FRONT BUMPER PEDESTRIAN IMPACT ABSORBER CORE
# ----------------------------------------------------------------------------

def build_jaguar_ftype_pedestrian_impact_absorber(parent_col, mats):
    """
    Constructs the front crash absorption and pedestrian safety structures:
    - Expanded polypropylene (EPP) energy-absorbing foam core behind bumper fascia.
    - Honeycomb crash absorber cells dampening low-speed parking impacts.
    - Lower pedestrian leg sweep spoiler bar preventing under-vehicle overrun.
    """
    objs = []
    bm_impact = bmesh.new()

    # EPP Foam Bumper Core (Mounted ahead of aluminum crash beam: Y = +2.180m, Z = 0.380m)
    mat_epp = Matrix.Translation(Vector((0.0, 2.190, 0.380)))
    bmesh.ops.create_cube(bm_impact, size=1.0, matrix=mat_epp @ Matrix.Diagonal(Vector((1.280, 0.065, 0.120, 1.0))))

    # Honeycomb Energy Absorption Cells
    for cell_i in range(8):
        cell_x = (cell_i - 3.5) * 0.150
        mat_cell = mat_epp @ Matrix.Translation(Vector((cell_x, -0.040, 0)))
        bmesh.ops.create_cube(bm_impact, size=1.0, matrix=mat_cell @ Matrix.Diagonal(Vector((0.080, 0.040, 0.090, 1.0))))

    # Lower Leg-Sweep Plastic Crossmember (Z = 0.180m)
    mat_sweep = Matrix.Translation(Vector((0.0, 2.220, 0.180)))
    bmesh.ops.create_cube(bm_impact, size=1.0, matrix=mat_sweep @ Matrix.Diagonal(Vector((1.320, 0.050, 0.040, 1.0))))

    obj_impact = link_obj("GEO_FTYPE_Pedestrian_Impact_Core", bm_impact, parent_col, mats["satin_black"], bevel=0.0015)
    objs.append(obj_impact)
    return objs


# ----------------------------------------------------------------------------
# 47. SUBSYSTEM 47: TRANSMISSION TUNNEL CARBON SHEAR CLOSURE PLATE
# ----------------------------------------------------------------------------

def build_jaguar_ftype_tunnel_shear_plate(parent_col, mats):
    """
    Constructs the lower transmission tunnel closure plate:
    - Aircraft-grade stamped aluminum / carbon composite tunnel shear plate.
    - Closes bottom of transmission tunnel, transforming open U-channel into closed torque tube.
    - Dual steel safety catch hoops preventing driveshaft ground-contact in case of joint failure.
    """
    objs = []
    bm_tunnel_plate = bmesh.new()

    # Tunnel Underbody Shear Plate (Y: -0.650m to +0.650m, Z = 0.145m)
    mat_tpl = Matrix.Translation(Vector((0.0, 0.000, 0.148)))
    bmesh.ops.create_cube(bm_tunnel_plate, size=1.0, matrix=mat_tpl @ Matrix.Diagonal(Vector((0.360, 1.300, 0.015, 1.0))))

    # Recessed Fastener Holes (10 heavy-duty M10 structural bolts)
    for bolt_i in range(5):
        bolt_y = (bolt_i - 2) * 0.280
        for bx_sign in [-1.0, 1.0]:
            mat_bolt = mat_tpl @ Matrix.Translation(Vector((bx_sign * 0.150, bolt_y, -0.005)))
            bmesh.ops.create_cylinder(bm_tunnel_plate, radius=0.010, depth=0.015, segments=10, matrix=mat_bolt)

    # Driveshaft Retaining Catch Loops (Front and Rear of propshaft)
    for loop_y in [0.250, -0.350]:
        mat_loop = Matrix.Translation(Vector((0.0, loop_y, 0.210)))
        bmesh.ops.create_cylinder(bm_tunnel_plate, radius=0.065, depth=0.035, segments=18, matrix=mat_loop @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_tpl = link_obj("GEO_FTYPE_Tunnel_Shear_Closure_Plate", bm_tunnel_plate, parent_col, mats["alloy"], bevel=0.001)
    objs.append(obj_tpl)
    return objs
'''
