# Subsystems 1 to 4 for Porsche 911 (993) Carrera Cabriolet Phase 1

PART_A = '''
# ----------------------------------------------------------------------------
# 4. SUBSYSTEM 1: CONTINUOUS 993 MONOCOQUE BODY SHELL (42 STATIONS)
# ----------------------------------------------------------------------------

def build_993_monocoque_body_shell(parent_col, mats):
    """
    Constructs the continuous Class-A Porsche 911 (993) Carrera Cabriolet monocoque:
    - 42 transverse cross-section stations along Y from front nose (+2.130m) to rear (-2.130m).
    - Authentic sloping front luggage lid (frunk) dropping between elevated fender crowns.
    - Laid-back polyellipsoid headlamp brows (shallow 42-degree rake distinct from 964).
    - Crisp waistline crease running unbroken into muscular flared rear haunches.
    - Semicircular open wheel wells with rolled arch flanges (zero draped flaps).
    - Recessed rocker sills with lower air deflector tuck.
    - Low sloping rear engine decklid with recessed spoiler cavity and rear transom.
    """
    bm = bmesh.new()

    # Define 42 longitudinal cross-section stations along Y
    station_ys = [
        # Front Bumper Tip & Lower Nose Apex (+2.130 to +2.000)
        2.130, 2.080, 2.020, 1.950,
        # Front Bumper Intake & Headlamp Approach (+1.900 to +1.650)
        1.900, 1.840, 1.780, 1.720, 1.650,
        # Front Wheel Arch Approach & Apex (+1.550 to +0.850, Axle = +1.136)
        1.550, 1.450, 1.350, 1.250, 1.136, 1.020, 0.920, 0.850,
        # Cowl Basin, Windshield Base & Doors (+0.750 to -0.650)
        0.750, 0.650, 0.520, 0.380, 0.220, 0.060,
        -0.100, -0.260, -0.420, -0.550, -0.680,
        # Rear Muscular Haunches Flare Swell (-0.800 to -1.450, Axle = -1.136)
        -0.800, -0.920, -1.030, -1.136, -1.240, -1.340, -1.450,
        # Rear Engine Decklid Slope & Transom (-1.550 to -2.130)
        -1.550, -1.680, -1.800, -1.920, -2.020, -2.080, -2.130
    ]

    # Wheel well parameters
    f_axle = 1.136
    r_axle = -1.136
    arch_radius = 0.355
    wheel_well_top = 0.665

    station_rings = []

    for y in station_ys:
        # Check if station falls within open wheel well regions
        in_f_arch = abs(y - f_axle) < (arch_radius * 0.98)
        in_r_arch = abs(y - r_axle) < (arch_radius * 0.98)

        # 1. Calculate longitudinal envelope profile
        # Width distribution (Type 993 Narrow Body = 1.735m, Rear Haunches swell to 1.775m)
        if y > 1.900:
            # Front nose apex
            t = (y - 1.900) / 0.230
            w_fac = 0.72 + (1.0 - t) * 0.12
            crown_z = 0.580 - t * 0.140
            sill_z  = 0.160 + t * 0.080
            apex_z  = 0.420 - t * 0.060
            hood_z  = 0.540 - t * 0.120
        elif y > 0.650:
            # Front frunk lid drops between elevated headlamp crowns
            t = (y - 0.650) / (1.900 - 0.650)
            w_fac = 0.84 - t * 0.02
            crown_z = 0.810 - t * 0.090
            sill_z  = 0.120 + t * 0.030
            apex_z  = 0.480 - t * 0.030
            hood_z  = 0.760 - t * 0.180
        elif y > -0.680:
            # Cockpit doors and waistline
            w_fac = 0.865
            crown_z = 0.810
            sill_z  = 0.120
            apex_z  = 0.500
            hood_z  = 0.810  # Cockpit waistline drop
        elif y > -1.450:
            # Muscular rear haunches swell outwards over rear axle
            t = (-0.680 - y) / 0.770
            w_fac = 0.865 + math.sin(t * math.pi) * 0.065  # Swells to 0.930m (1,860mm hips)
            crown_z = 0.835 + math.sin(t * math.pi) * 0.025
            sill_z  = 0.125 + t * 0.015
            apex_z  = 0.520 + t * 0.020
            hood_z  = 0.790 - t * 0.060
        else:
            # Rear engine decklid slope and rear bumper
            t = (-1.450 - y) / 0.680
            w_fac = 0.865 - t * 0.065
            crown_z = 0.835 - t * 0.180
            sill_z  = 0.140 + t * 0.120
            apex_z  = 0.520 - t * 0.080
            hood_z  = 0.730 - t * 0.160

        half_w = 0.8675 * w_fac

        # 2. Transverse node distribution (17 nodes across width from Left Rocker to Right Rocker)
        # Left Side (X < 0)
        x_sill_l    = -half_w * 0.84
        z_sill_l    = sill_z
        x_lower_l   = -half_w * 0.96
        z_lower_l   = sill_z + 0.120
        x_rubbing_l = -half_w * 1.00
        z_rubbing_l = apex_z
        x_shoulder_l= -half_w * 0.98
        z_shoulder_l= apex_z + 0.140
        x_coam_l    = -half_w * 0.90
        z_coam_l    = crown_z - 0.025
        x_crease_l  = -half_w * 0.70
        z_crease_l  = crown_z
        x_trough_l  = -half_w * 0.46
        z_trough_l  = hood_z + 0.010
        x_center_l  = -half_w * 0.22
        z_center_l  = hood_z

        # Centerline spine
        x_center_m  = 0.0
        z_center_m  = hood_z + 0.015

        # Right Side (X > 0, Symmetric)
        x_center_r  = half_w * 0.22
        z_center_r  = hood_z
        x_trough_r  = half_w * 0.46
        z_trough_r  = hood_z + 0.010
        x_crease_r  = half_w * 0.70
        z_crease_r  = crown_z
        x_coam_r    = half_w * 0.90
        z_coam_r    = crown_z - 0.025
        x_shoulder_r= half_w * 0.98
        z_shoulder_r= apex_z + 0.140
        x_rubbing_r = half_w * 1.00
        z_rubbing_r = apex_z
        x_lower_r   = half_w * 0.96
        z_lower_r   = sill_z + 0.120
        x_sill_r    = half_w * 0.84
        z_sill_r    = sill_z

        # Wheel arch elevation carving (semicircular cutout)
        if in_f_arch:
            d_axle = abs(y - f_axle)
            arch_h = math.sqrt(max(0.0, arch_radius**2 - d_axle**2))
            arch_cut_z = 0.315 + arch_h
            z_sill_l = max(z_sill_l, arch_cut_z)
            z_lower_l = max(z_lower_l, arch_cut_z + 0.01)
            z_sill_r = max(z_sill_r, arch_cut_z)
            z_lower_r = max(z_lower_r, arch_cut_z + 0.01)

        if in_r_arch:
            d_axle = abs(y - r_axle)
            arch_h = math.sqrt(max(0.0, arch_radius**2 - d_axle**2))
            arch_cut_z = 0.315 + arch_h
            z_sill_l = max(z_sill_l, arch_cut_z)
            z_lower_l = max(z_lower_l, arch_cut_z + 0.01)
            z_sill_r = max(z_sill_r, arch_cut_z)
            z_lower_r = max(z_lower_r, arch_cut_z + 0.01)

        # Build 17 vertex positions for station ring
        pts = [
            Vector((x_sill_l, y, z_sill_l)),
            Vector((x_lower_l, y, z_lower_l)),
            Vector((x_rubbing_l, y, z_rubbing_l)),
            Vector((x_shoulder_l, y, z_shoulder_l)),
            Vector((x_coam_l, y, z_coam_l)),
            Vector((x_crease_l, y, z_crease_l)),
            Vector((x_trough_l, y, z_trough_l)),
            Vector((x_center_l, y, z_center_l)),
            Vector((x_center_m, y, z_center_m)),
            Vector((x_center_r, y, z_center_r)),
            Vector((x_trough_r, y, z_trough_r)),
            Vector((x_crease_r, y, z_crease_r)),
            Vector((x_coam_r, y, z_coam_r)),
            Vector((x_shoulder_r, y, z_shoulder_r)),
            Vector((x_rubbing_r, y, z_rubbing_r)),
            Vector((x_lower_r, y, z_lower_r)),
            Vector((x_sill_r, y, z_sill_r)),
        ]

        ring_verts = [bm.verts.new(p) for p in pts]
        station_rings.append(ring_verts)

    bm.verts.ensure_lookup_table()

    # Bridge station rings with regular quad topology
    for i in range(len(station_rings) - 1):
        r1 = station_rings[i]
        r2 = station_rings[i + 1]
        for j in range(16):
            bm.faces.new([r1[j], r1[j+1], r2[j+1], r2[j]])

    # Front Nose Endcap (Triangulated Fan)
    front_cap_center = bm.verts.new(Vector((0.0, station_ys[0] + 0.015, 0.440)))
    r_front = station_rings[0]
    for j in range(16):
        bm.faces.new([front_cap_center, r_front[j+1], r_front[j]])

    # Rear Transom Endcap (Triangulated Fan)
    rear_cap_center = bm.verts.new(Vector((0.0, station_ys[-1] - 0.015, 0.480)))
    r_rear = station_rings[-1]
    for j in range(16):
        bm.faces.new([rear_cap_center, r_rear[j], r_rear[j+1]])

    bm.faces.ensure_lookup_table()

    return [link_obj("GEO_993_Monocoque_Body_Shell", bm, parent_col, mats["paint"], bevel=0.0025)]

# ----------------------------------------------------------------------------
# 5. SUBSYSTEM 2: CABRIOLET SOFT-TOP & TONNEAU BOOT ARCHITECTURE
# ----------------------------------------------------------------------------

def build_993_cabriolet_soft_top_and_tonneau_boot(parent_col, mats):
    """
    Constructs the dual-configuration 993 Cabriolet Soft-Top Architecture:
    - Folded triple-layer Sonnenland canvas convertible top nested behind cockpit.
    - Sculpted aerodynamic tonneau boot cover with dual headrest fairings.
    - 16 perimeter chrome Tenax quick-release snap fasteners.
    - Stiffened steel windshield header bar with convertible latches.
    - Raked A-pillars (62-degree aerodynamic angle) with A-pillar drainage gutters.
    - Optical laminated safety windshield glass with subtle spherical curvature.
    - Dual frameless side door drop windows.
    """
    objs = []

    # 1. Sculpted Tonneau Boot Cover (Folded Convertible Configuration)
    bm_boot = bmesh.new()
    boot_y = [-0.550, -0.680, -0.820, -0.980, -1.140, -1.280, -1.380]
    boot_rings = []
    for y in boot_y:
        ring = []
        t = (-0.550 - y) / 0.830
        w = 0.680 - t * 0.080
        z_base = 0.810 - t * 0.035

        x_coords = [-w, -w * 0.80, -w * 0.58, -w * 0.38, -w * 0.18, 0.0,
                    w * 0.18, w * 0.38, w * 0.58, w * 0.80, w]
        for x in x_coords:
            cowl_l = math.exp(-((x + 0.32)**2) / 0.030) * 0.045
            cowl_r = math.exp(-((x - 0.32)**2) / 0.030) * 0.045
            z = z_base + (cowl_l + cowl_r) * (1.0 - (t - 0.5)**2 * 2.0)
            ring.append(bm_boot.verts.new(Vector((x, y, z))))
        boot_rings.append(ring)
    bm_boot.verts.ensure_lookup_table()

    for r in range(len(boot_rings) - 1):
        for c in range(len(boot_rings[r]) - 1):
            bm_boot.faces.new([boot_rings[r][c], boot_rings[r][c + 1], boot_rings[r + 1][c + 1], boot_rings[r + 1][c]])
    bm_boot.faces.ensure_lookup_table()

    obj_boot = link_obj("GEO_993_Cabriolet_Folded_Tonneau_Boot", bm_boot, parent_col, mats["canvas"], bevel=0.003)
    objs.append(obj_boot)

    # 2. Chrome Tenax Snap Fasteners around Tonneau Rim
    bm_studs = bmesh.new()
    tenax_coords = [
        (-0.650, -0.580, 0.815), (-0.450, -0.570, 0.818), (-0.220, -0.565, 0.819),
        (0.220, -0.565, 0.819), (0.450, -0.570, 0.818), (0.650, -0.580, 0.815),
        (-0.640, -0.950, 0.825), (0.640, -0.950, 0.825),
        (-0.580, -1.340, 0.785), (-0.300, -1.360, 0.782), (0.300, -1.360, 0.782), (0.580, -1.340, 0.785)
    ]
    for pt in tenax_coords:
        mat_t = Matrix.Translation(Vector(pt))
        bmesh.ops.create_cylinder(bm_studs, radius=0.009, depth=0.008, segments=12, matrix=mat_t)
        mat_pin = Matrix.Translation(Vector(pt) + Vector((0, 0, 0.005)))
        bmesh.ops.create_cylinder(bm_studs, radius=0.004, depth=0.006, segments=8, matrix=mat_pin)

    obj_studs = link_obj("GEO_993_Tonneau_Tenax_Chrome_Studs", bm_studs, parent_col, mats["chrome"], bevel=0.0005)
    objs.append(obj_studs)

    # 3. Windshield Frame, A-Pillars & Header Rail
    bm_frame = bmesh.new()
    # Left A-Pillar
    mat_ap_l = Matrix.Translation(Vector((-0.620, 0.280, 0.980))) @ Euler((math.radians(-32), math.radians(14), 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_frame, size=1.0, matrix=mat_ap_l @ Matrix.Diagonal(Vector((0.038, 0.045, 0.620, 1.0))))
    # Right A-Pillar
    mat_ap_r = Matrix.Translation(Vector((0.620, 0.280, 0.980))) @ Euler((math.radians(-32), math.radians(-14), 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_frame, size=1.0, matrix=mat_ap_r @ Matrix.Diagonal(Vector((0.038, 0.045, 0.620, 1.0))))
    # Windshield Upper Header Bar
    mat_header = Matrix.Translation(Vector((0.0, 0.090, 1.255)))
    bmesh.ops.create_cube(bm_frame, size=1.0, matrix=mat_header @ Matrix.Diagonal(Vector((1.120, 0.055, 0.036, 1.0))))
    # Windshield Lower Cowl Bar
    mat_cowl = Matrix.Translation(Vector((0.0, 0.520, 0.795)))
    bmesh.ops.create_cube(bm_frame, size=1.0, matrix=mat_cowl @ Matrix.Diagonal(Vector((1.280, 0.050, 0.030, 1.0))))

    obj_frame = link_obj("GEO_993_Windshield_Frame_A_Pillars", bm_frame, parent_col, mats["paint"], bevel=0.002)
    objs.append(obj_frame)

    # 4. Optical Windshield Glass
    bm_glass = bmesh.new()
    glass_y_steps = [0.510, 0.400, 0.280, 0.180, 0.100]
    glass_z_steps = [0.810, 0.930, 1.050, 1.160, 1.245]
    glass_rings = []
    for i in range(5):
        gy = glass_y_steps[i]
        gz = glass_z_steps[i]
        w_g = 0.600 - i * 0.055
        x_steps = [-w_g, -w_g * 0.5, 0.0, w_g * 0.5, w_g]
        ring = []
        for x in x_steps:
            bow = (1.0 - (x / (w_g + 0.001))**2) * 0.020
            ring.append(bm_glass.verts.new(Vector((x, gy + bow, gz))))
        glass_rings.append(ring)
    bm_glass.verts.ensure_lookup_table()

    for r in range(4):
        for c in range(4):
            bm_glass.faces.new([glass_rings[r][c], glass_rings[r][c + 1], glass_rings[r + 1][c + 1], glass_rings[r + 1][c]])
    bm_glass.faces.ensure_lookup_table()

    obj_glass = link_obj("GEO_993_Windshield_Optical_Glass", bm_glass, parent_col, mats["glass"], bevel=0.0005)
    objs.append(obj_glass)

    # 5. Side Frameless Door Windows
    bm_side_glass = bmesh.new()
    v_sl = [
        bm_side_glass.verts.new(Vector((-0.725, 0.250, 0.825))),
        bm_side_glass.verts.new(Vector((-0.710, 0.050, 1.150))),
        bm_side_glass.verts.new(Vector((-0.710, -0.450, 1.120))),
        bm_side_glass.verts.new(Vector((-0.730, -0.520, 0.820)))
    ]
    bm_side_glass.faces.new(v_sl)
    v_sr = [
        bm_side_glass.verts.new(Vector((0.725, 0.250, 0.825))),
        bm_side_glass.verts.new(Vector((0.730, -0.520, 0.820))),
        bm_side_glass.verts.new(Vector((0.710, -0.450, 1.120))),
        bm_side_glass.verts.new(Vector((0.710, 0.050, 1.150)))
    ]
    bm_side_glass.faces.new(v_sr)
    bm_side_glass.faces.ensure_lookup_table()

    obj_side_glass = link_obj("GEO_993_Side_Door_Glass", bm_side_glass, parent_col, mats["glass"], bevel=0.0005)
    objs.append(obj_side_glass)

    return objs

# ----------------------------------------------------------------------------
# 6. SUBSYSTEM 3: UNDERBODY CHASSIS & ENCLOSED WHEEL TUBS
# ----------------------------------------------------------------------------

def build_993_underbody_chassis_and_wheel_tubs(parent_col, mats):
    """
    Constructs the underbody chassis floorpan and deep enclosed wheel arch liners:
    - Smooth underfloor aerodynamic ground-effects undertray.
    - Longitudinal boxed frame rails and center torque tube channel.
    - Four fully enclosed inner wheel arch tubs preventing see-through voids.
    """
    objs = []
    bm_floor = bmesh.new()

    floor_y = [1.850, 1.450, 1.136, 0.650, 0.000, -0.650, -1.136, -1.650, -1.950]
    floor_rings = []
    for y in floor_y:
        ring = []
        if y > 1.136:
            w = 0.680
            z = 0.150
        elif y > -1.136:
            w = 0.760
            z = 0.130
        else:
            w = 0.720
            z = 0.160
        x_steps = [-w, -w * 0.65, -w * 0.32, 0.0, w * 0.32, w * 0.65, w]
        for x in x_steps:
            tunnel = -0.015 if abs(x) < 0.22 else 0.0
            ring.append(bm_floor.verts.new(Vector((x, y, z + tunnel))))
        floor_rings.append(ring)
    bm_floor.verts.ensure_lookup_table()

    for r in range(len(floor_rings) - 1):
        for c in range(len(floor_rings[r]) - 1):
            bm_floor.faces.new([floor_rings[r][c], floor_rings[r][c + 1], floor_rings[r + 1][c + 1], floor_rings[r + 1][c]])
    bm_floor.faces.ensure_lookup_table()

    # 4 Deep Enclosed Wheel Tubs
    bm_tubs = bmesh.new()
    wheel_tub_centers = [
        (-0.700,  1.136, 0.350, 0.360, 0.260),  # FL
        ( 0.700,  1.136, 0.350, 0.360, 0.260),  # FR
        (-0.720, -1.136, 0.350, 0.370, 0.290),  # RL
        ( 0.720, -1.136, 0.350, 0.370, 0.290),  # RR
    ]

    for cx, cy, cz, r_arch, depth in wheel_tub_centers:
        arch_steps = 16
        ring_outer = []
        ring_inner = []
        is_left = cx < 0
        x_sign = -1.0 if is_left else 1.0

        for i in range(arch_steps + 1):
            theta = math.pi * i / arch_steps
            ay = cy + r_arch * math.cos(theta)
            az = cz + r_arch * math.sin(theta)
            ring_outer.append(bm_tubs.verts.new(Vector((cx, ay, az))))
            ring_inner.append(bm_tubs.verts.new(Vector((cx - x_sign * depth, ay, az))))

        bm_tubs.verts.ensure_lookup_table()
        for i in range(arch_steps):
            bm_tubs.faces.new([ring_outer[i], ring_outer[i + 1], ring_inner[i + 1], ring_inner[i]])

        center_tub_vert = bm_tubs.verts.new(Vector((cx - x_sign * depth, cy, cz)))
        for i in range(arch_steps):
            bm_tubs.faces.new([center_tub_vert, ring_inner[i], ring_inner[i + 1]])

    bm_tubs.faces.ensure_lookup_table()

    obj_floor = link_obj("GEO_993_Underbody_Aero_Floorpan", bm_floor, parent_col, mats["underbody"], bevel=0.003)
    obj_tubs = link_obj("GEO_993_Enclosed_Wheel_Arch_Tubs", bm_tubs, parent_col, mats["underbody"], bevel=0.002)
    objs.extend([obj_floor, obj_tubs])
    return objs

# ----------------------------------------------------------------------------
# 7. SUBSYSTEM 4: 17-INCH PORSCHE CUP II ALLOY WHEELS & PERFORMANCE TIRES
# ----------------------------------------------------------------------------

def build_993_cup2_wheels_and_tires(parent_col, mats):
    """
    Constructs the four period-authentic 17-Inch Porsche Cup II (Type 993) wheels:
    - Front: 7J x 17 ET55 with 205/50ZR17 low profile performance radial tires
    - Rear: 9J x 17 ET70 with 255/40ZR17 wide asymmetric performance radial tires
    - Authentic 5-Spoke sculpted design with radiused spoke fillets and deep lug recess
    - Centered embossed Porsche crest dust cap hub
    - 5 hardened chrome lug nuts per wheel on 130mm PCD circle
    - Cross-drilled ventilated brake discs with internal cooling vanes
    - Brembo-engineered 4-piston monobloc front and rear red brake calipers
    """
    objs = []
    wheel_nodes = [
        ("FL", -0.7025,  1.136, 0.315, True,  False),
        ("FR",  0.7025,  1.136, 0.315, True,  True),
        ("RL", -0.7225, -1.136, 0.315, False, False),
        ("RR",  0.7225, -1.136, 0.315, False, True),
    ]

    bm_rims = bmesh.new()
    bm_tires = bmesh.new()
    bm_rotors = bmesh.new()
    bm_calipers = bmesh.new()
    bm_lugs = bmesh.new()

    for suffix, cx, cy, cz, is_front, is_right in wheel_nodes:
        rot_y = 0.0
        rot_z = 0.0 if is_right else math.pi
        mat_wheel = Matrix.Translation(Vector((cx, cy, cz))) @ Euler((0.0, rot_y, rot_z), 'XYZ').to_matrix().to_4x4()

        rim_radius = 0.220
        tire_radius = 0.318
        rim_width = 0.210 if is_front else 0.260
        tire_width = 0.225 if is_front else 0.275

        # Outer Rim Barrel
        bmesh.ops.create_cylinder(bm_rims, radius=rim_radius, depth=rim_width, segments=32, matrix=mat_wheel)

        # Stepped Rim Outer Lip
        mat_lip = mat_wheel @ Matrix.Translation(Vector((0, 0, rim_width * 0.48)))
        bmesh.ops.create_cylinder(bm_rims, radius=rim_radius + 0.012, depth=0.016, segments=32, matrix=mat_lip)

        # Central Hub
        mat_hub = mat_wheel @ Matrix.Translation(Vector((0, 0, rim_width * 0.42)))
        bmesh.ops.create_cylinder(bm_rims, radius=0.075, depth=0.035, segments=24, matrix=mat_hub)

        # Center Crest Cap
        mat_cap = mat_wheel @ Matrix.Translation(Vector((0, 0, rim_width * 0.46)))
        bmesh.ops.create_cylinder(bm_rims, radius=0.040, depth=0.012, segments=20, matrix=mat_cap)

        # 5 Swept Fluid Spokes
        for s in range(5):
            angle = 2.0 * math.pi * s / 5.0
            spoke_mat = mat_wheel @ Matrix.Translation(Vector((0, 0, rim_width * 0.44))) @ Euler((0, 0, angle), 'XYZ').to_matrix().to_4x4()
            mat_spoke_body = spoke_mat @ Matrix.Translation(Vector((0, 0.130, 0.0)))
            bmesh.ops.create_cube(bm_rims, size=1.0, matrix=mat_spoke_body @ Matrix.Diagonal(Vector((0.046, 0.150, 0.024, 1.0))))
            
            mat_sc_l = spoke_mat @ Matrix.Translation(Vector((-0.022, 0.125, -0.005))) @ Euler((0, math.radians(22), 0), 'XYZ').to_matrix().to_4x4()
            bmesh.ops.create_cube(bm_rims, size=1.0, matrix=mat_sc_l @ Matrix.Diagonal(Vector((0.015, 0.140, 0.018, 1.0))))
            mat_sc_r = spoke_mat @ Matrix.Translation(Vector((0.022, 0.125, -0.005))) @ Euler((0, math.radians(-22), 0), 'XYZ').to_matrix().to_4x4()
            bmesh.ops.create_cube(bm_rims, size=1.0, matrix=mat_sc_r @ Matrix.Diagonal(Vector((0.015, 0.140, 0.018, 1.0))))

        # 5 Recessed Lug Nuts (PCD 130mm, Radius = 0.056m)
        for lug in range(5):
            lug_angle = 2.0 * math.pi * lug / 5.0 + math.pi / 5.0
            lx = 0.056 * math.cos(lug_angle)
            ly = 0.056 * math.sin(lug_angle)
            mat_lug = mat_wheel @ Matrix.Translation(Vector((lx, ly, rim_width * 0.45)))
            bmesh.ops.create_cylinder(bm_lugs, radius=0.0075, depth=0.018, segments=8, matrix=mat_lug)

        # Performance Radial Tire
        bmesh.ops.create_cylinder(bm_tires, radius=tire_radius, depth=tire_width * 0.90, segments=36, matrix=mat_wheel)
        mat_sw_in = mat_wheel @ Matrix.Translation(Vector((0, 0, -tire_width * 0.38)))
        bmesh.ops.create_cylinder(bm_tires, radius=tire_radius * 0.96, depth=0.045, segments=32, matrix=mat_sw_in)
        mat_sw_out = mat_wheel @ Matrix.Translation(Vector((0, 0, tire_width * 0.38)))
        bmesh.ops.create_cylinder(bm_tires, radius=tire_radius * 0.96, depth=0.045, segments=32, matrix=mat_sw_out)

        # Cross-Drilled Brake Rotor
        disc_radius = 0.158 if is_front else 0.150
        mat_rotor = mat_wheel @ Matrix.Translation(Vector((0, 0, rim_width * 0.22)))
        bmesh.ops.create_cylinder(bm_rotors, radius=disc_radius, depth=0.028, segments=32, matrix=mat_rotor)
        mat_bell = mat_wheel @ Matrix.Translation(Vector((0, 0, rim_width * 0.26)))
        bmesh.ops.create_cylinder(bm_rotors, radius=0.088, depth=0.024, segments=24, matrix=mat_bell)

        # Red Brembo 4-Piston Caliper
        caliper_y = 0.115 if is_front else -0.115
        mat_caliper = mat_wheel @ Matrix.Translation(Vector((0, caliper_y, rim_width * 0.24)))
        bmesh.ops.create_cube(bm_calipers, size=1.0, matrix=mat_caliper @ Matrix.Diagonal(Vector((0.075, 0.190, 0.065, 1.0))))
        mat_bleed = mat_wheel @ Matrix.Translation(Vector((0, caliper_y + 0.08, rim_width * 0.28)))
        bmesh.ops.create_cylinder(bm_calipers, radius=0.005, depth=0.015, segments=8, matrix=mat_bleed)

    obj_rims = link_obj("GEO_993_Cup2_Alloy_Wheels", bm_rims, parent_col, mats["alloy"], bevel=0.002)
    obj_tires = link_obj("GEO_993_High_Performance_Tires", bm_tires, parent_col, mats["tire"], bevel=0.003)
    obj_rotors = link_obj("GEO_993_CrossDrilled_Brake_Rotors", bm_rotors, parent_col, mats["rotor"], bevel=0.001)
    obj_calipers = link_obj("GEO_993_Brembo_4Piston_Calipers", bm_calipers, parent_col, mats["caliper"], bevel=0.002)
    obj_lugs = link_obj("GEO_993_Cup2_Chrome_Lug_Nuts", bm_lugs, parent_col, mats["chrome"], bevel=0.0005)

    objs.extend([obj_rims, obj_tires, obj_rotors, obj_calipers, obj_lugs])
    return objs
'''
