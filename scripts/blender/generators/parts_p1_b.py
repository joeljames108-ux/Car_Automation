# Subsystems 5 to 8 for Porsche 911 (993) Carrera Cabriolet Phase 1 (High-Density CAD)

PART_B = '''
# ----------------------------------------------------------------------------
# 8. SUBSYSTEM 5: POLYURETHANE BUMPERS & LIGHTING ENVELOPES
# ----------------------------------------------------------------------------

def build_993_polyurethane_bumpers_and_lighting_envelopes(parent_col, mats):
    """
    Constructs the smooth integrated polyurethane front and rear bumpers:
    - Front integrated bumper apron with lower radiator intake mouth
    - Laid-back polyellipsoid headlamp mounting recesses
    - Rear wrap-around bumper with recessed license plate bucket and exhaust reliefs
    - Continuous full-width rear reflector light strip connecting left and right clusters
    """
    objs = []
    bm_bumpers = bmesh.new()

    # Front Bumper Apron (Y: +1.800m to +2.130m)
    mat_fbumper = Matrix.Translation(Vector((0.0, 1.980, 0.360)))
    bmesh.ops.create_cube(bm_bumpers, size=1.0, matrix=mat_fbumper @ Matrix.Diagonal(Vector((1.620, 0.280, 0.340, 1.0))))

    # Lower Front Chin Air Dam Lip
    mat_chin = Matrix.Translation(Vector((0.0, 1.960, 0.165)))
    bmesh.ops.create_cube(bm_bumpers, size=1.0, matrix=mat_chin @ Matrix.Diagonal(Vector((1.580, 0.220, 0.035, 1.0))))

    # Front Center Radiator Air Intake Mouth Opening (Wide curved trapezoid)
    mat_intake = Matrix.Translation(Vector((0.0, 2.050, 0.240)))
    bmesh.ops.create_cube(bm_bumpers, size=1.0, matrix=mat_intake @ Matrix.Diagonal(Vector((0.720, 0.140, 0.110, 1.0))))

    # Dual Brake Cooling Inlets in Outer Front Bumper Corners
    for bx_sign in [-1.0, 1.0]:
        mat_duct = Matrix.Translation(Vector((bx_sign * 0.580, 2.020, 0.235)))
        bmesh.ops.create_cube(bm_bumpers, size=1.0, matrix=mat_duct @ Matrix.Diagonal(Vector((0.180, 0.120, 0.075, 1.0))))

    # Rear Bumper Apron (Y: -1.820m to -2.130m)
    mat_rbumper = Matrix.Translation(Vector((0.0, -1.980, 0.400)))
    bmesh.ops.create_cube(bm_bumpers, size=1.0, matrix=mat_rbumper @ Matrix.Diagonal(Vector((1.660, 0.280, 0.380, 1.0))))

    # Rear License Plate Recessed Tub (EU/US sized pocket)
    mat_plate_tub = Matrix.Translation(Vector((0.0, -2.125, 0.420)))
    bmesh.ops.create_cube(bm_bumpers, size=1.0, matrix=mat_plate_tub @ Matrix.Diagonal(Vector((0.520, 0.035, 0.160, 1.0))))

    # Rear Bumper Guard Pads (Left & Right of license plate)
    for bx_sign in [-1.0, 1.0]:
        mat_guard = Matrix.Translation(Vector((bx_sign * 0.280, -2.125, 0.440)))
        bmesh.ops.create_cube(bm_bumpers, size=1.0, matrix=mat_guard @ Matrix.Diagonal(Vector((0.075, 0.045, 0.180, 1.0))))

    # Dual Lower Exhaust Apron Heat Cutouts
    for bx_sign in [-1.0, 1.0]:
        mat_cutout = Matrix.Translation(Vector((bx_sign * 0.440, -2.060, 0.240)))
        bmesh.ops.create_cylinder(bm_bumpers, radius=0.065, depth=0.140, segments=16, matrix=mat_cutout @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_bumpers = link_obj("GEO_993_Polyurethane_Bumpers_Aprons", bm_bumpers, parent_col, mats["paint"], bevel=0.003)
    objs.append(obj_bumpers)

    # Base Optical Lamp Units
    bm_optics = bmesh.new()
    # Left Headlamp Shell (Laid back at 42 degrees)
    mat_hl_l = Matrix.Translation(Vector((-0.575, 1.720, 0.730))) @ Euler((math.radians(38), math.radians(-12), math.radians(-8)), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_optics, radius=0.105, depth=0.045, segments=24, matrix=mat_hl_l @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Right Headlamp Shell
    mat_hl_r = Matrix.Translation(Vector((0.575, 1.720, 0.730))) @ Euler((math.radians(38), math.radians(12), math.radians(8)), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_optics, radius=0.105, depth=0.045, segments=24, matrix=mat_hl_r @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Front Amber Turn Signal Indicators (Wrapping into bumper corners)
    for bx_sign in [-1.0, 1.0]:
        mat_sig = Matrix.Translation(Vector((bx_sign * 0.710, 1.880, 0.435))) @ Euler((0, bx_sign * math.radians(-24), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_optics, size=1.0, matrix=mat_sig @ Matrix.Diagonal(Vector((0.180, 0.040, 0.075, 1.0))))

    # Front Rectangular Fog Lamps (Integrated in lower bumper outer edge)
    for bx_sign in [-1.0, 1.0]:
        mat_fog = Matrix.Translation(Vector((bx_sign * 0.460, 2.010, 0.285)))
        bmesh.ops.create_cube(bm_optics, size=1.0, matrix=mat_fog @ Matrix.Diagonal(Vector((0.140, 0.035, 0.060, 1.0))))

    # Continuous Rear Reflector Light Strip
    mat_rear_bar = Matrix.Translation(Vector((0.0, -2.065, 0.620)))
    bmesh.ops.create_cube(bm_optics, size=1.0, matrix=mat_rear_bar @ Matrix.Diagonal(Vector((1.460, 0.035, 0.095, 1.0))))

    # Rear Left & Right Tri-Color Taillamp Assemblies
    for bx_sign in [-1.0, 1.0]:
        mat_rlamp = Matrix.Translation(Vector((bx_sign * 0.640, -2.050, 0.620))) @ Euler((0, bx_sign * math.radians(18), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_optics, size=1.0, matrix=mat_rlamp @ Matrix.Diagonal(Vector((0.260, 0.038, 0.092, 1.0))))

    obj_optics = link_obj("GEO_993_Primary_Lighting_Optics", bm_optics, parent_col, mats["reflector_ruby"], bevel=0.001)
    objs.append(obj_optics)

    return objs

# ----------------------------------------------------------------------------
# 9. SUBSYSTEM 6: FRONT MACPHERSON STRUTS & ZF STEERING ASSEMBLY
# ----------------------------------------------------------------------------

def build_993_front_macpherson_struts_and_steering_rack(parent_col, mats):
    """
    Constructs the front suspension kinematics and steering assembly:
    - Lower transverse forged aluminum A-arms with compliance bushings.
    - Bilstein inverted monotube MacPherson strut damper bodies with threaded height adjustment rings.
    - Progressive rate steel front coil springs (6 helical turns) and upper helper springs.
    - Upper strut mounting plates with 3 spherical ball studs.
    - ZF rack-and-pinion power steering rack with rubber bellows boots and hydraulic supply lines.
    - Front 22mm tubular anti-roll stabilizer bar with articulated drop links and ball joints.
    """
    objs = []
    bm_susp = bmesh.new()

    for x_sign, side in [(-1.0, "L"), (1.0, "R")]:
        # Lower Forged Aluminum Control A-Arm (Triangular wishbone geometry)
        mat_aarm = Matrix.Translation(Vector((x_sign * 0.460, 1.136, 0.220))) @ Euler((0, 0, x_sign * math.radians(12)), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_susp, size=1.0, matrix=mat_aarm @ Matrix.Diagonal(Vector((0.360, 0.085, 0.035, 1.0))))

        # Front A-Arm Compliance Bushing Housings (Forward & Rear mounting points)
        mat_bush_f = Matrix.Translation(Vector((x_sign * 0.320, 1.250, 0.225)))
        bmesh.ops.create_cylinder(bm_susp, radius=0.026, depth=0.065, segments=16, matrix=mat_bush_f @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
        mat_bush_r = Matrix.Translation(Vector((x_sign * 0.340, 1.020, 0.225)))
        bmesh.ops.create_cylinder(bm_susp, radius=0.028, depth=0.075, segments=16, matrix=mat_bush_r @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # Lower Ball Joint Stud connected to Wheel Hub Carrier
        mat_balljoint = Matrix.Translation(Vector((x_sign * 0.640, 1.136, 0.240)))
        bmesh.ops.create_cylinder(bm_susp, radius=0.016, depth=0.045, segments=12, matrix=mat_balljoint)

        # Bilstein Inverted Monotube MacPherson Damper Struts
        mat_strut = Matrix.Translation(Vector((x_sign * 0.620, 1.136, 0.450))) @ Euler((math.radians(8), x_sign * math.radians(-10), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_susp, radius=0.026, depth=0.360, segments=16, matrix=mat_strut)

        # Polished Chrome Piston Rod
        mat_piston = mat_strut @ Matrix.Translation(Vector((0, 0, 0.160)))
        bmesh.ops.create_cylinder(bm_susp, radius=0.013, depth=0.180, segments=12, matrix=mat_piston)

        # Lower Spring Perch Collar & Threaded Locking Ring
        mat_perch = mat_strut @ Matrix.Translation(Vector((0, 0, -0.040)))
        bmesh.ops.create_cylinder(bm_susp, radius=0.052, depth=0.022, segments=20, matrix=mat_perch)

        # Front Coil Spring (6 progressive helical turns)
        for coil in range(6):
            cz = 0.360 + coil * 0.034
            mat_coil = Matrix.Translation(Vector((x_sign * 0.620, 1.136, cz)))
            bmesh.ops.create_torus(bm_susp, major_radius=0.048, minor_radius=0.007, major_segments=16, minor_segments=8, matrix=mat_coil)

        # Upper Helper Spring Collar
        mat_helper = Matrix.Translation(Vector((x_sign * 0.620, 1.136, 0.585)))
        bmesh.ops.create_cylinder(bm_susp, radius=0.046, depth=0.016, segments=16, matrix=mat_helper)

        # Upper Strut Mount Plate with 3 Spherical Ball Studs
        mat_top_plate = Matrix.Translation(Vector((x_sign * 0.600, 1.136, 0.620)))
        bmesh.ops.create_cylinder(bm_susp, radius=0.065, depth=0.015, segments=20, matrix=mat_top_plate)
        for stud_i in range(3):
            stud_ang = 2.0 * math.pi * stud_i / 3.0
            sx = x_sign * 0.600 + 0.045 * math.cos(stud_ang)
            sy = 1.136 + 0.045 * math.sin(stud_ang)
            mat_stud = Matrix.Translation(Vector((sx, sy, 0.630)))
            bmesh.ops.create_cylinder(bm_susp, radius=0.005, depth=0.016, segments=8, matrix=mat_stud)

        # Front Steering Tie Rods & Articulated Ball Joints
        mat_tierod = Matrix.Translation(Vector((x_sign * 0.420, 1.190, 0.260))) @ Euler((0, x_sign * math.radians(6), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_susp, radius=0.012, depth=0.320, segments=12, matrix=mat_tierod)
        mat_rod_end = Matrix.Translation(Vector((x_sign * 0.600, 1.195, 0.265)))
        bmesh.ops.create_icosphere(bm_susp, subdivisions=1, radius=0.018, matrix=mat_rod_end)

        # Steering Rack Rubber Accordion Bellows Boots
        mat_bellows = Matrix.Translation(Vector((x_sign * 0.260, 1.185, 0.255))) @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_susp, radius=0.024, depth=0.110, segments=12, matrix=mat_bellows)

        # Sway Bar Drop Links with Spherical Ball Joints
        p_sway_top = Vector((x_sign * 0.520, 1.260, 0.360))
        p_sway_bot = Vector((x_sign * 0.480, 1.270, 0.245))
        create_cylinder_between(bm_susp, p_sway_top, p_sway_bot, radius=0.007, segments=8)
        bmesh.ops.create_icosphere(bm_susp, subdivisions=1, radius=0.014, matrix=Matrix.Translation(p_sway_top))
        bmesh.ops.create_icosphere(bm_susp, subdivisions=1, radius=0.014, matrix=Matrix.Translation(p_sway_bot))

    # Central ZF Power Steering Rack Housing
    mat_steer_rack = Matrix.Translation(Vector((0.0, 1.185, 0.255)))
    bmesh.ops.create_cylinder(bm_susp, radius=0.034, depth=0.420, segments=16, matrix=mat_steer_rack @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Steering Pinion Tower & Input Shaft Coupler (Leading to steering column)
    mat_pinion = Matrix.Translation(Vector((-0.180, 1.170, 0.310))) @ Euler((math.radians(-24), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_susp, radius=0.026, depth=0.140, segments=12, matrix=mat_pinion)

    # Front 22mm Tubular Anti-Roll Stabilizer Bar
    mat_sway_front = Matrix.Translation(Vector((0.0, 1.280, 0.240)))
    bmesh.ops.create_cylinder(bm_susp, radius=0.011, depth=0.920, segments=16, matrix=mat_sway_front @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Anti-Roll Bar Chassis Mounting Bushings & Saddles
    for bx_sign in [-1.0, 1.0]:
        mat_saddle = Matrix.Translation(Vector((bx_sign * 0.360, 1.280, 0.240)))
        bmesh.ops.create_cube(bm_susp, size=1.0, matrix=mat_saddle @ Matrix.Diagonal(Vector((0.045, 0.045, 0.035, 1.0))))

    obj_front_susp = link_obj("GEO_993_Front_MacPherson_Suspension", bm_susp, parent_col, mats["alloy"], bevel=0.002)
    objs.append(obj_front_susp)
    return objs

# ----------------------------------------------------------------------------
# 10. SUBSYSTEM 7: REAR LSA MULTI-LINK SUSPENSION & SUBFRAME
# ----------------------------------------------------------------------------

def build_993_lsa_multilink_rear_suspension_and_subframe(parent_col, mats):
    """
    Constructs Porsche's Lightweight, Stable, Agile (LSA) multi-link rear suspension:
    - Cast aluminum cradle subframe isolating road noise and vibration.
    - Upper transverse camber links, lower wishbones, forward trailing arms, toe links.
    - Rear coilover dampers with helper springs.
    - 21mm rear sway bar with articulated end links.
    - Drive halfshafts with flexible rubber CV boots.
    - Forged aluminum rear hub uprights (Radträger) with brake caliper brackets.
    """
    objs = []
    bm_rear_susp = bmesh.new()

    # Cast Aluminum Multi-Link Subframe Cradle (Left & Right longitudinal side rails)
    mat_cradle_l = Matrix.Translation(Vector((-0.420, -1.136, 0.250)))
    bmesh.ops.create_cube(bm_rear_susp, size=1.0, matrix=mat_cradle_l @ Matrix.Diagonal(Vector((0.180, 0.480, 0.080, 1.0))))
    mat_cradle_r = Matrix.Translation(Vector((0.420, -1.136, 0.250)))
    bmesh.ops.create_cube(bm_rear_susp, size=1.0, matrix=mat_cradle_r @ Matrix.Diagonal(Vector((0.180, 0.480, 0.080, 1.0))))

    # Heavy Crossmember Tubular Bridge
    mat_cradle_bridge = Matrix.Translation(Vector((0.0, -1.136, 0.280)))
    bmesh.ops.create_cylinder(bm_rear_susp, radius=0.035, depth=0.720, segments=16, matrix=mat_cradle_bridge @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Forward Subframe Isolator Bushings
    for bx_sign in [-1.0, 1.0]:
        mat_iso = Matrix.Translation(Vector((bx_sign * 0.420, -0.920, 0.260)))
        bmesh.ops.create_cylinder(bm_rear_susp, radius=0.038, depth=0.075, segments=16, matrix=mat_iso)

    for x_sign, side in [(-1.0, "L"), (1.0, "R")]:
        # Upper Camber Link (Cast aluminum arm)
        mat_camber = Matrix.Translation(Vector((x_sign * 0.540, -1.110, 0.380))) @ Euler((0, x_sign * math.radians(-14), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_rear_susp, size=1.0, matrix=mat_camber @ Matrix.Diagonal(Vector((0.260, 0.045, 0.025, 1.0))))

        # Lower Track Control Arm
        mat_track = Matrix.Translation(Vector((x_sign * 0.520, -1.160, 0.210))) @ Euler((0, x_sign * math.radians(10), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_rear_susp, size=1.0, matrix=mat_track @ Matrix.Diagonal(Vector((0.280, 0.060, 0.030, 1.0))))

        # Forward Trailing Thrust Arm (Absorbing acceleration & braking torque)
        p_trail_sub = Vector((x_sign * 0.380, -0.960, 0.230))
        p_trail_hub = Vector((x_sign * 0.620, -1.110, 0.280))
        create_cylinder_between(bm_rear_susp, p_trail_sub, p_trail_hub, radius=0.016, segments=12)

        # Toe-Control Tie Rod (Weissach passive rear-wheel steering under lateral load)
        mat_toe = Matrix.Translation(Vector((x_sign * 0.530, -1.220, 0.260))) @ Euler((0, x_sign * math.radians(8), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_rear_susp, radius=0.012, depth=0.240, segments=10, matrix=mat_toe)

        # Forged Aluminum Hub Upright (Radträger)
        mat_upright = Matrix.Translation(Vector((x_sign * 0.640, -1.136, 0.315)))
        bmesh.ops.create_cube(bm_rear_susp, size=1.0, matrix=mat_upright @ Matrix.Diagonal(Vector((0.085, 0.160, 0.240, 1.0))))

        # Rear Damper Strut & Spring
        mat_rdamper = Matrix.Translation(Vector((x_sign * 0.600, -1.136, 0.440))) @ Euler((math.radians(-6), x_sign * math.radians(-8), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_rear_susp, radius=0.022, depth=0.320, segments=16, matrix=mat_rdamper)
        for coil in range(6):
            cz = 0.360 + coil * 0.032
            mat_rcoil = Matrix.Translation(Vector((x_sign * 0.600, -1.136, cz)))
            bmesh.ops.create_torus(bm_rear_susp, major_radius=0.044, minor_radius=0.0065, major_segments=16, minor_segments=8, matrix=mat_rcoil)

        # Upper Helper Spring on Rear Coilover
        mat_rhelper = Matrix.Translation(Vector((x_sign * 0.600, -1.136, 0.565)))
        bmesh.ops.create_cylinder(bm_rear_susp, radius=0.042, depth=0.018, segments=16, matrix=mat_rhelper)

        # Drive Halfshafts with CV Boots
        mat_axle = Matrix.Translation(Vector((x_sign * 0.450, -1.136, 0.315))) @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_rear_susp, radius=0.016, depth=0.380, segments=12, matrix=mat_axle)
        mat_cv1 = Matrix.Translation(Vector((x_sign * 0.320, -1.136, 0.315))) @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_rear_susp, radius=0.032, depth=0.065, segments=12, matrix=mat_cv1)
        mat_cv2 = Matrix.Translation(Vector((x_sign * 0.580, -1.136, 0.315))) @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_rear_susp, radius=0.032, depth=0.065, segments=12, matrix=mat_cv2)

    # Rear 21mm Anti-Roll Sway Bar
    mat_sway_rear = Matrix.Translation(Vector((0.0, -1.280, 0.280)))
    bmesh.ops.create_cylinder(bm_rear_susp, radius=0.0105, depth=0.860, segments=16, matrix=mat_sway_rear @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_rear_susp = link_obj("GEO_993_LSA_Rear_MultiLink_Subframe", bm_rear_susp, parent_col, mats["alloy"], bevel=0.002)
    objs.append(obj_rear_susp)
    return objs

# ----------------------------------------------------------------------------
# 11. SUBSYSTEM 8: AIR-COOLED 3.6L FLAT-SIX BOXER POWERTRAIN
# ----------------------------------------------------------------------------

def build_993_air_cooled_36l_flat_six_boxer_powertrain(parent_col, mats):
    """
    Constructs the rear-hung air-cooled 3.6L Flat-Six boxer powertrain:
    - Finned aluminum crankcase suspended behind rear axle (Y: -1.350m to -1.820m).
    - Horizontally opposed cylinder banks (3 left, 3 right) with detailed cooling fins.
    - Cast aluminum chain-drive cam towers and dual-spark plug valve covers.
    - Getrag 6-speed manual transaxle casing ahead of rear axle with bellhousing.
    - VarioRam induction manifold system (6 curved aluminum intake runners).
    - Dual distributor caps and 12 high-tension spark plug ignition leads.
    - Spin-on oil filter canister and engine oil dipstick tube with red loop.
    """
    objs = []
    bm_boxer = bmesh.new()

    # Main Crankcase (Central Block)
    mat_crankcase = Matrix.Translation(Vector((0.0, -1.520, 0.340)))
    bmesh.ops.create_cube(bm_boxer, size=1.0, matrix=mat_crankcase @ Matrix.Diagonal(Vector((0.380, 0.420, 0.220, 1.0))))

    # Lower Finned Sump Oil Sump Plate
    mat_sump = Matrix.Translation(Vector((0.0, -1.520, 0.215)))
    bmesh.ops.create_cube(bm_boxer, size=1.0, matrix=mat_sump @ Matrix.Diagonal(Vector((0.340, 0.360, 0.035, 1.0))))

    # Longitudinal Sump Cooling Fins (8 aluminum fins along bottom of oil pan)
    for fin_i in range(8):
        fx = -0.140 + fin_i * 0.040
        mat_sfin = Matrix.Translation(Vector((fx, -1.520, 0.190)))
        bmesh.ops.create_cube(bm_boxer, size=1.0, matrix=mat_sfin @ Matrix.Diagonal(Vector((0.005, 0.320, 0.015, 1.0))))

    # Horizontally Opposed Finned Cylinder Banks (3 Left, 3 Right)
    for bank_sign, side in [(-1.0, "L"), (1.0, "R")]:
        bx = bank_sign * 0.340
        mat_vc = Matrix.Translation(Vector((bx, -1.520, 0.340)))
        bmesh.ops.create_cube(bm_boxer, size=1.0, matrix=mat_vc @ Matrix.Diagonal(Vector((0.180, 0.440, 0.140, 1.0))))

        # Dual-Spark Plug Holes & Wire Boots (2 plugs per cylinder = 6 per bank)
        cyl_y = [-1.380, -1.520, -1.660]
        for cy in cyl_y:
            mat_cyl = Matrix.Translation(Vector((bank_sign * 0.240, cy, 0.340))) @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()
            bmesh.ops.create_cylinder(bm_boxer, radius=0.062, depth=0.140, segments=16, matrix=mat_cyl)
            for fin in range(4):
                fx = bank_sign * (0.190 + fin * 0.028)
                mat_fin = Matrix.Translation(Vector((fx, cy, 0.340))) @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()
                bmesh.ops.create_cylinder(bm_boxer, radius=0.078, depth=0.004, segments=16, matrix=mat_fin)

            # Spark Plug Rubber Boot Caps (Upper & Lower plug per cylinder)
            for pz in [0.380, 0.300]:
                mat_spark = Matrix.Translation(Vector((bx, cy, pz)))
                bmesh.ops.create_cylinder(bm_boxer, radius=0.010, depth=0.024, segments=8, matrix=mat_spark)

        # Cam Chain Drive Housing (Forward end of cylinder bank)
        mat_chain = Matrix.Translation(Vector((bx, -1.280, 0.340)))
        bmesh.ops.create_cube(bm_boxer, size=1.0, matrix=mat_chain @ Matrix.Diagonal(Vector((0.150, 0.065, 0.160, 1.0))))

    # Transaxle Transmission (Forward of Engine, Y: -0.900m to -1.280m)
    mat_trans = Matrix.Translation(Vector((0.0, -1.080, 0.320)))
    bmesh.ops.create_cube(bm_boxer, size=1.0, matrix=mat_trans @ Matrix.Diagonal(Vector((0.280, 0.380, 0.240, 1.0))))
    mat_bell = Matrix.Translation(Vector((0.0, -1.280, 0.330)))
    bmesh.ops.create_cylinder(bm_boxer, radius=0.150, depth=0.080, segments=20, matrix=mat_bell @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # VarioRam Multi-Stage Induction Plenum (Top center of Flat-Six engine, Z: 0.500m to 0.650m)
    mat_plenum = Matrix.Translation(Vector((0.0, -1.500, 0.520)))
    bmesh.ops.create_cube(bm_boxer, size=1.0, matrix=mat_plenum @ Matrix.Diagonal(Vector((0.280, 0.340, 0.090, 1.0))))

    # 6 Curved Aluminum VarioRam Intake Runners
    for bank_sign in [-1.0, 1.0]:
        for ry in [-1.400, -1.500, -1.600]:
            p_start = Vector((bank_sign * 0.120, ry, 0.520))
            p_mid = Vector((bank_sign * 0.220, ry, 0.540))
            p_end = Vector((bank_sign * 0.280, ry, 0.420))
            create_curved_tube(bm_boxer, [p_start, p_mid, p_end], radius=0.016, segments=8)

    # Dual Bosch Ignition Distributor Caps (Belt-driven dual distributor)
    for dy in [-1.320, -1.370]:
        mat_dist = Matrix.Translation(Vector((-0.160, dy, 0.480)))
        bmesh.ops.create_cylinder(bm_boxer, radius=0.028, depth=0.045, segments=12, matrix=mat_dist)

    # Engine Oil Filter Canister (Right rear of engine bay)
    mat_filter = Matrix.Translation(Vector((0.260, -1.680, 0.420))) @ Euler((math.radians(20), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_boxer, radius=0.045, depth=0.120, segments=16, matrix=mat_filter)

    # Engine Oil Dipstick Tube with Red Pull Loop
    mat_dipstick = Matrix.Translation(Vector((0.240, -1.440, 0.480))) @ Euler((0, math.radians(12), 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_boxer, radius=0.005, depth=0.180, segments=8, matrix=mat_dipstick)
    mat_loop = mat_dipstick @ Matrix.Translation(Vector((0, 0, 0.100)))
    bmesh.ops.create_torus(bm_boxer, major_radius=0.014, minor_radius=0.0035, major_segments=12, minor_segments=6, matrix=mat_loop)

    obj_boxer = link_obj("GEO_993_AirCooled_FlatSix_Powertrain", bm_boxer, parent_col, mats["boxer"], bevel=0.002)
    objs.append(obj_boxer)
    return objs
'''
