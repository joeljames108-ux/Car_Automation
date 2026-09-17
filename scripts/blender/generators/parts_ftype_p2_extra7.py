"""
Jaguar F-Type V8 R Convertible (2010s) Phase 20: Extra Part 7
Subsystems 38 to 40:
- Subsystem 38: Reverse-Opening Clamshell Bonnet Dual Nitrogen Struts, Ball Studs & Billet Guide Pins
- Subsystem 39: Convertible Tonneau 4-Bar Mechanism, Hydraulic Lift Cylinders & Perimeter Water Scuppers
- Subsystem 40: Windshield Washer Fluid Reservoir Filler Neck & Engine Bay Bulkhead Firewall Grommets
"""

PART_FTYPE2_EXTRA7 = '''
# ----------------------------------------------------------------------------
# 40. SUBSYSTEM 38: CLAMSHELL BONNET GAS STRUTS & BILLET LOCATOR PINS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_bonnet_struts_and_latches(parent_col, mats):
    """
    Constructs the reverse-opening clamshell bonnet mechanical support and alignment hardware:
    - Twin pressurized nitrogen gas lift struts with satin black damper bodies and micro-polished chrome piston shafts.
    - Swiveling steel ball-joint end sockets attached to strut towers and bonnet mounting brackets.
    - Precision CNC machined billet aluminum conical guide alignment pins on outer fender edges with rubber receiving sockets.
    - Primary and secondary emergency safety latch catch hooks with coiled return springs.
    """
    objs = []
    bm_struts = bmesh.new()
    bm_pins = bmesh.new()

    for bx_sign in [-1.0, 1.0]:
        bx = bx_sign * 0.760
        # Lower ball-stud attachment point (on strut tower apron)
        p_lower = Vector((bx, 1.250, 0.620))
        # Upper ball-stud attachment point (on bonnet under-rib)
        p_upper = Vector((bx_sign * 0.720, 1.720, 0.760))

        strut_vec = p_upper - p_lower
        strut_len = strut_vec.length
        strut_dir = strut_vec.normalized()
        quat = Vector((0, 0, 1)).rotation_difference(strut_dir)

        # 1. Lower Damper Cylinder Body (Outer pressure tube)
        body_len = strut_len * 0.55
        p_body_mid = p_lower + strut_dir * (body_len * 0.5)
        mat_body = Matrix.Translation(p_body_mid) @ quat.to_matrix().to_4x4()
        bmesh.ops.create_cylinder(
            bm_struts,
            radius=0.012,
            depth=body_len,
            segments=16,
            matrix=mat_body
        )

        # 2. Chrome Piston Shaft (Extending to upper socket)
        shaft_len = strut_len * 0.48
        p_shaft_mid = p_upper - strut_dir * (shaft_len * 0.5)
        mat_shaft = Matrix.Translation(p_shaft_mid) @ quat.to_matrix().to_4x4()
        bmesh.ops.create_cylinder(
            bm_pins,
            radius=0.006,
            depth=shaft_len,
            segments=14,
            matrix=mat_shaft
        )

        # 3. Ball-Joint Socket Ends (Top & Bottom)
        for p_ball in [p_lower, p_upper]:
            mat_ball = Matrix.Translation(p_ball)
            bmesh.ops.create_cylinder(
                bm_struts,
                radius=0.011,
                depth=0.022,
                segments=12,
                matrix=mat_ball @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()
            )

        # 4. Billet Fender Guide Alignment Pin (Conical centering stud)
        mat_guide = Matrix.Translation(Vector((bx_sign * 0.840, 1.620, 0.740)))
        bmesh.ops.create_cylinder(
            bm_pins,
            radius=0.007,
            depth=0.025,
            segments=12,
            matrix=mat_guide
        )
        # Rubber Receiving Cup
        mat_cup = Matrix.Translation(Vector((bx_sign * 0.840, 1.620, 0.725)))
        bmesh.ops.create_cylinder(
            bm_struts,
            radius=0.012,
            depth=0.014,
            segments=12,
            matrix=mat_cup
        )

    # 5. Dual Front Safety Latch Catches (Mounted on radiator slam panel)
    for lx_sign in [-1.0, 1.0]:
        mat_latch = Matrix.Translation(Vector((lx_sign * 0.280, 2.080, 0.690)))
        bmesh.ops.create_cube(
            bm_pins,
            size=1.0,
            matrix=mat_latch @ Matrix.Diagonal(Vector((0.035, 0.045, 0.030, 1.0)))
        )
        # Coiled Return Spring
        mat_spr = mat_latch @ Matrix.Translation(Vector((0, 0.015, -0.012)))
        bmesh.ops.create_cylinder(
            bm_pins,
            radius=0.004,
            depth=0.028,
            segments=8,
            matrix=mat_spr
        )

    obj_struts = link_obj("GEO_FTYPE_Bonnet_Struts_and_Sockets", bm_struts, parent_col, mats["piano_black"], bevel=0.0006)
    obj_pins = link_obj("GEO_FTYPE_Bonnet_Pins_and_Latches", bm_pins, parent_col, mats["chrome"], bevel=0.0004)
    objs.extend([obj_struts, obj_pins])
    return objs


# ----------------------------------------------------------------------------
# 41. SUBSYSTEM 39: CONVERTIBLE TONNEAU HINGES & PERIMETER SCUPPER DRAINS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_tonneau_hinges_and_drainage(parent_col, mats):
    """
    Constructs the convertible soft-top tonneau cover articulation mechanism and perimeter water management:
    - 4-bar kinematic linkage hinge arms fabricated from cast aluminum, supporting the rear deck tonneau cover.
    - Hydraulic lift cylinders that actuate the tonneau cover during high-speed 12-second roof deployment.
    - Deep perimeter water drainage trough surrounding the soft-top storage well.
    - Flexible EPDM rubber scupper one-way duckbill drain tubes directing rain runoff down through wheel wells.
    """
    objs = []
    bm_hinges = bmesh.new()
    bm_gutters = bmesh.new()

    for hx_sign in [-1.0, 1.0]:
        hx = hx_sign * 0.680
        hy = -0.680
        hz = 0.860

        # Kinematic Linkage Pivot Bracket (Mounted to rear bulkhead)
        mat_base = Matrix.Translation(Vector((hx, hy, hz)))
        bmesh.ops.create_cube(
            bm_hinges,
            size=1.0,
            matrix=mat_base @ Matrix.Diagonal(Vector((0.038, 0.090, 0.045, 1.0)))
        )

        # Primary Cast Aluminum Articulated Arm
        p_arm_start = Vector((hx, hy - 0.030, hz + 0.015))
        p_arm_end = Vector((hx_sign * 0.640, hy + 0.120, hz + 0.140))
        arm_vec = p_arm_end - p_arm_start
        arm_len = arm_vec.length
        arm_dir = arm_vec.normalized()
        quat_arm = Vector((0, 0, 1)).rotation_difference(arm_dir)

        mat_arm = Matrix.Translation((p_arm_start + p_arm_end) * 0.5) @ quat_arm.to_matrix().to_4x4()
        bmesh.ops.create_cube(
            bm_hinges,
            size=1.0,
            matrix=mat_arm @ Matrix.Diagonal(Vector((0.016, 0.024, arm_len, 1.0)))
        )

        # Hydraulic Tonneau Actuator Cylinder
        p_cyl_base = Vector((hx, hy - 0.050, hz - 0.080))
        p_cyl_rod = (p_arm_start + p_arm_end) * 0.5
        cyl_vec = p_cyl_rod - p_cyl_base
        cyl_len = cyl_vec.length
        quat_cyl = Vector((0, 0, 1)).rotation_difference(cyl_vec.normalized())

        mat_cyl = Matrix.Translation((p_cyl_base + p_cyl_rod) * 0.5) @ quat_cyl.to_matrix().to_4x4()
        bmesh.ops.create_cylinder(
            bm_hinges,
            radius=0.014,
            depth=cyl_len,
            segments=14,
            matrix=mat_cyl
        )

        # Perimeter Water Drain Scupper Duckbill Tube (Drain funnel to rear wheelhouse)
        mat_scupper = Matrix.Translation(Vector((hx_sign * 0.720, -0.850, 0.740)))
        bmesh.ops.create_cylinder(
            bm_gutters,
            radius=0.010,
            depth=0.180,
            segments=10,
            matrix=mat_scupper @ Euler((0.15, 0, 0), 'XYZ').to_matrix().to_4x4()
        )

    # Perimeter U-Channel Water Drainage Gutter (Surrounding roof well perimeter)
    mat_gutter_rear = Matrix.Translation(Vector((0.0, -0.880, 0.875)))
    bmesh.ops.create_cube(
        bm_gutters,
        size=1.0,
        matrix=mat_gutter_rear @ Matrix.Diagonal(Vector((1.380, 0.045, 0.025, 1.0)))
    )
    for sx_sign in [-1.0, 1.0]:
        mat_gutter_side = Matrix.Translation(Vector((sx_sign * 0.690, -0.620, 0.880)))
        bmesh.ops.create_cube(
            bm_gutters,
            size=1.0,
            matrix=mat_gutter_side @ Matrix.Diagonal(Vector((0.045, 0.520, 0.025, 1.0)))
        )

    obj_hinges = link_obj("GEO_FTYPE_Tonneau_Hinges_and_Hydraulics", bm_hinges, parent_col, mats["chrome"], bevel=0.0006)
    obj_gutters = link_obj("GEO_FTYPE_Tonneau_Drainage_Gutters", bm_gutters, parent_col, mats["rubber"], bevel=0.0005)
    objs.extend([obj_hinges, obj_gutters])
    return objs


# ----------------------------------------------------------------------------
# 42. SUBSYSTEM 40: WASHER RESERVOIR & ENGINE BAY BULKHEAD GROMMETS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_washer_reservoir_and_grommets(parent_col, mats):
    """
    Constructs engine bay service hardware and acoustic firewall pass-through grommets:
    - High-capacity windshield washer fluid reservoir filler neck with textured ergonomic neck and
      anodized blue flip-top cap with embossed windshield spray icon.
    - Brake fluid master cylinder transparent reservoir with graduated minimum/maximum fluid level markings.
    - Molded neoprene multi-port firewall bulkhead wiring harness grommets sealing the passenger cell
      from heat and supercharger whine.
    """
    objs = []
    bm_res = bmesh.new()
    bm_grommets = bmesh.new()

    # Washer Fluid Reservoir Filler Neck (Located passenger side cowl shelf)
    mat_filler_neck = Matrix.Translation(Vector((0.740, 1.480, 0.745)))
    bmesh.ops.create_cylinder(
        bm_res,
        radius=0.022,
        depth=0.120,
        segments=18,
        matrix=mat_filler_neck
    )
    # Blue Flip-Top Cap
    mat_blue_cap = mat_filler_neck @ Matrix.Translation(Vector((0, 0, 0.062)))
    bmesh.ops.create_cylinder(
        bm_res,
        radius=0.025,
        depth=0.012,
        segments=20,
        matrix=mat_blue_cap
    )

    # Brake Fluid Master Cylinder Reservoir (Driver side cowl)
    mat_brake_res = Matrix.Translation(Vector((-0.620, 1.380, 0.760)))
    bmesh.ops.create_cube(
        bm_res,
        size=1.0,
        matrix=mat_brake_res @ Matrix.Diagonal(Vector((0.085, 0.110, 0.075, 1.0)))
    )
    # Yellow Screw-On Reservoir Cap
    mat_brake_cap = mat_brake_res @ Matrix.Translation(Vector((0, 0, 0.045)))
    bmesh.ops.create_cylinder(
        bm_res,
        radius=0.024,
        depth=0.015,
        segments=18,
        matrix=mat_brake_cap
    )

    # Neoprene Firewall Bulkhead Wire Harness Grommets (Multi-port through-dash seals)
    for gx_off, gz_off, g_rad in [(-0.350, 0.680, 0.028), (0.380, 0.660, 0.034), (0.0, 0.710, 0.022)]:
        mat_grommet = Matrix.Translation(Vector((gx_off, 1.280, gz_off)))
        bmesh.ops.create_cylinder(
            bm_grommets,
            radius=g_rad,
            depth=0.025,
            segments=16,
            matrix=mat_grommet @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4()
        )
        # Wire loom passing through center
        mat_loom = mat_grommet @ Matrix.Translation(Vector((0, 0.015, 0)))
        bmesh.ops.create_cylinder(
            bm_grommets,
            radius=g_rad * 0.65,
            depth=0.070,
            segments=12,
            matrix=mat_loom @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4()
        )

    obj_res = link_obj("GEO_FTYPE_Fluid_Reservoirs_and_Caps", bm_res, parent_col, mats["piano_black"], bevel=0.0006)
    obj_grommets = link_obj("GEO_FTYPE_Firewall_Bulkhead_Grommets", bm_grommets, parent_col, mats["rubber"], bevel=0.0004)
    objs.extend([obj_res, obj_grommets])
    return objs
'''
