"""
Honda S2000 AP1 (2000s) Phase 17: Part F
Subsystems 21 to 26:
21. F20C Red Crackle Valve Cover, Spark Plug Coil Covers & Oil Cap
22. High-Flow Cast Aluminum Intake Manifold & 62mm Throttle Body
23. Rear Axle Drive Half-Shafts & Accordion CV Boots
24. Coaxial Electronic Power Steering (EPS) Gearbox & Articulated Column
25. Floorpan Longitudinal Stiffening Ribs & Sill Pinchwelds
26. Driver Cockpit Digital LED Instrument Binnacle & 3-Spoke Sport Wheel
"""

PART_S2K_F = '''
# ----------------------------------------------------------------------------
# 23. SUBSYSTEM 21: F20C RED CRACKLE VALVE COVER & IGNITION COILS
# ----------------------------------------------------------------------------

def build_s2000_f20c_valve_cover_and_ignition_coils(parent_col, mats):
    """
    Constructs the iconic Honda high-revving red crackle finish valve cover:
    - Longitudinally oriented DOHC valve cover atop F20C cylinder head (Y = +0.780m, Z = 0.585m).
    - Longitudinal spark plug valley cover plate with cast brushed aluminum finish.
    - 4 Individual direct-ignition coil-on-plug modules with retaining hex bolts.
    - Anodized aluminum oil filler cap on front left boss.
    - VTEC variable valve timing spool valve solenoid casing on cylinder head rear.
    """
    objs = []
    bm_vc = bmesh.new()

    # 1. Main Camshaft Valve Cover Body (Y = +0.650m to +0.960m, Z = 0.585m, Width = 0.280m)
    mat_vc = Matrix.Translation(Vector((0.0, 0.805, 0.585)))
    bmesh.ops.create_cube(bm_vc, size=1.0, matrix=mat_vc @ Matrix.Diagonal(Vector((0.270, 0.360, 0.085, 1.0))))

    # Twin Camshaft Longitudinal Humps (Intake & Exhaust cam lobes, X = +/- 0.085m)
    for cx_sign in [-1.0, 1.0]:
        mat_hump = Matrix.Translation(Vector((cx_sign * 0.082, 0.805, 0.628)))
        bmesh.ops.create_cylinder(bm_vc, radius=0.048, depth=0.355, segments=18, matrix=mat_hump @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Valve Cover Perimeter Flange Acorn Retaining Nuts (10 Fasteners)
    for vi in range(5):
        y_nut = 0.640 + vi * 0.080
        for x_nut in [-0.130, 0.130]:
            mat_nut = Matrix.Translation(Vector((x_nut, y_nut, 0.590)))
            bmesh.ops.create_cylinder(bm_vc, radius=0.007, depth=0.018, segments=8, matrix=mat_nut)

    # 2. Central Spark Plug Well Access Valley Cover (Cast Aluminum Finish)
    mat_val = Matrix.Translation(Vector((0.0, 0.805, 0.632)))
    bmesh.ops.create_cube(bm_vc, size=1.0, matrix=mat_val @ Matrix.Diagonal(Vector((0.076, 0.320, 0.016, 1.0))))

    # 4 Direct-Ignition Coil-on-Plug Packs (Y = +0.680m, +0.760m, +0.840m, +0.920m)
    for cyl in range(4):
        y_coil = 0.685 + cyl * 0.080
        mat_coil = Matrix.Translation(Vector((0.0, y_coil, 0.642)))
        bmesh.ops.create_cube(bm_vc, size=1.0, matrix=mat_coil @ Matrix.Diagonal(Vector((0.042, 0.042, 0.018, 1.0))))
        # Coil Hold-Down M6 Bolt
        mat_cbolt = Matrix.Translation(Vector((0.024, y_coil, 0.644)))
        bmesh.ops.create_cylinder(bm_vc, radius=0.0045, depth=0.012, segments=8, matrix=mat_cbolt)

    # 3. Billet Anodized Oil Filler Cap (Front-Left, X = -0.085m, Y = 0.665m, Z = 0.655m)
    mat_oilcap = Matrix.Translation(Vector((-0.085, 0.665, 0.655)))
    bmesh.ops.create_cylinder(bm_vc, radius=0.025, depth=0.022, segments=18, matrix=mat_oilcap)
    # Cap Gripping Flutes
    for flute in range(6):
        f_ang = flute * math.pi / 3.0
        mat_flute = mat_oilcap @ Matrix.Translation(Vector((0.022 * math.cos(f_ang), 0.022 * math.sin(f_ang), 0.008)))
        bmesh.ops.create_cube(bm_vc, size=1.0, matrix=mat_flute @ Matrix.Diagonal(Vector((0.008, 0.008, 0.016, 1.0))))

    # 4. VTEC Spool Valve Solenoid Housing (Rear Right of Cylinder Head, X = +0.115m, Y = 0.965m, Z = 0.540m)
    mat_vtec = Matrix.Translation(Vector((0.115, 0.965, 0.540)))
    bmesh.ops.create_cylinder(bm_vc, radius=0.022, depth=0.065, segments=14, matrix=mat_vtec)
    bmesh.ops.create_cube(bm_vc, size=1.0, matrix=mat_vtec @ Matrix.Translation(Vector((0, -0.020, -0.015))) @ Matrix.Diagonal(Vector((0.048, 0.040, 0.045, 1.0))))

    obj_vc = link_obj("GEO_S2K_F20C_Valve_Cover_and_Ignition", bm_vc, parent_col, mats["red_caliper"], bevel=0.0012)
    objs.append(obj_vc)
    return objs

# ----------------------------------------------------------------------------
# 24. SUBSYSTEM 22: HIGH-FLOW CAST ALUMINUM INTAKE MANIFOLD
# ----------------------------------------------------------------------------

def build_s2000_intake_manifold_and_throttle_body(parent_col, mats):
    """
    Constructs the F20C tuned-length intake manifold and throttle body assembly:
    - Cast aluminum surge tank / plenum located on intake side (Left X = -0.220m, Y = +0.800m, Z = 0.490m).
    - 4 Equal-length curved intake runners transitioning into cylinder head intake ports.
    - Large-bore single 62mm throttle body housing with throttle cable drum bracket.
    - Idle Air Control Valve (IACV) and Manifold Absolute Pressure (MAP) sensor bosses.
    - Fuel rail with 4 multi-hole fuel injector bodies mounted in runner bosses.
    """
    objs = []
    bm_im = bmesh.new()

    # 1. Main Intake Plenum / Surge Tank (Left side of engine bay, X = -0.210m, Y = +0.800m, Z = 0.490m)
    mat_plenum = Matrix.Translation(Vector((-0.210, 0.800, 0.490)))
    bmesh.ops.create_cylinder(bm_im, radius=0.054, depth=0.340, segments=18, matrix=mat_plenum @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 2. 4 Tuned Curved Intake Runners (From Plenum X = -0.190m into Cylinder Head X = -0.080m)
    for ri in range(4):
        y_r = 0.685 + ri * 0.080
        mat_runner = Matrix.Translation(Vector((-0.145, y_r, 0.490)))
        bmesh.ops.create_cylinder(bm_im, radius=0.024, depth=0.125, segments=14, matrix=mat_runner @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # Fuel Injector Boss & Injector Body (X = -0.095m, Z = 0.525m)
        mat_inj = Matrix.Translation(Vector((-0.095, y_r, 0.525))) @ Euler((0, math.radians(-25), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_im, radius=0.010, depth=0.045, segments=10, matrix=mat_inj)

    # 3. High-Pressure Aluminum Fuel Delivery Rail (X = -0.105m, Y: +0.660m to +0.940m, Z = 0.545m)
    mat_frail = Matrix.Translation(Vector((-0.105, 0.800, 0.545)))
    bmesh.ops.create_cube(bm_im, size=1.0, matrix=mat_frail @ Matrix.Diagonal(Vector((0.018, 0.320, 0.018, 1.0))))
    # Fuel Pressure Pulsation Damper (Front end of fuel rail, Y = 0.650m)
    mat_damper = Matrix.Translation(Vector((-0.105, 0.645, 0.545)))
    bmesh.ops.create_cylinder(bm_im, radius=0.016, depth=0.025, segments=14, matrix=mat_damper)

    # 4. 62mm Throttle Body Housing (Front of Plenum, Y = 0.610m, X = -0.210m, Z = 0.490m)
    mat_tb = Matrix.Translation(Vector((-0.210, 0.610, 0.490)))
    bmesh.ops.create_cylinder(bm_im, radius=0.042, depth=0.075, segments=18, matrix=mat_tb @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    # Throttle Cable Pulley Drum (Outboard side of TB, X = -0.255m)
    mat_drum = Matrix.Translation(Vector((-0.255, 0.610, 0.490)))
    bmesh.ops.create_cylinder(bm_im, radius=0.032, depth=0.012, segments=16, matrix=mat_drum @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # 5. Idle Air Control Valve (IACV) & MAP Sensor Housing (Underneath Plenum)
    mat_iacv = Matrix.Translation(Vector((-0.210, 0.840, 0.425)))
    bmesh.ops.create_cube(bm_im, size=1.0, matrix=mat_iacv @ Matrix.Diagonal(Vector((0.048, 0.085, 0.045, 1.0))))

    obj_im = link_obj("GEO_S2K_F20C_Intake_Manifold_Assembly", bm_im, parent_col, mats["alloy"], bevel=0.0015)
    objs.append(obj_im)
    return objs

# ----------------------------------------------------------------------------
# 25. SUBSYSTEM 23: REAR AXLE HALF-SHAFTS & CONSTANT VELOCITY (CV) JOINTS
# ----------------------------------------------------------------------------

def build_s2000_rear_axle_halfshafts_and_cv_joints(parent_col, mats):
    """
    Constructs the heavy-duty rear drive half-shaft assemblies:
    - Inboard tripod constant-velocity joint flanges bolted to Torsen differential output stubs.
    - Solid forged spring-steel drive axles transmitting power across rear track (X = +/- 0.220m to +/- 0.680m).
    - Multi-pleat accordion synthetic neoprene CV boots with stainless crimp bands.
    - Outboard Rzeppa constant-velocity joints press-fit into rear wheel hubs.
    - ABS tone rings with inductive wheel speed sensor brackets.
    """
    objs = []
    bm_axle = bmesh.new()

    for ax_sign in [-1.0, 1.0]:
        y_ax = -1.200
        z_ax = 0.316

        # 1. Inboard CV Joint Flange Housing (Bolted to Diff Output, X = +/- 0.190m)
        mat_inboard = Matrix.Translation(Vector((ax_sign * 0.190, y_ax, z_ax)))
        bmesh.ops.create_cylinder(bm_axle, radius=0.048, depth=0.052, segments=18, matrix=mat_inboard @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())
        # 6 Differential Output Stub Flange Bolts (M10 Allen fasteners)
        for b_idx in range(6):
            b_ang = b_idx * math.pi / 3.0
            mat_bolt = mat_inboard @ Matrix.Translation(Vector((0, 0.036 * math.cos(b_ang), 0.036 * math.sin(b_ang))))
            bmesh.ops.create_cylinder(bm_axle, radius=0.005, depth=0.014, segments=8, matrix=mat_bolt @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # 2. Inboard Neoprene Accordion Boot (X = +/- 0.245m)
        for pleat in range(3):
            p_rad = 0.040 - pleat * 0.006
            p_x = ax_sign * (0.225 + pleat * 0.020)
            mat_p = Matrix.Translation(Vector((p_x, y_ax, z_ax)))
            bmesh.ops.create_cylinder(bm_axle, radius=p_rad, depth=0.015, segments=14, matrix=mat_p @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # 3. Solid Forged Steel Half-Shaft Bar (Span from X = +/- 0.285m to +/- 0.605m)
        mat_bar = Matrix.Translation(Vector((ax_sign * 0.445, y_ax, z_ax)))
        bmesh.ops.create_cylinder(bm_axle, radius=0.0145, depth=0.320, segments=16, matrix=mat_bar @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # 4. Outboard Neoprene Accordion Boot (X = +/- 0.625m)
        for pleat in range(3):
            p_rad = 0.028 + pleat * 0.006
            p_x = ax_sign * (0.605 + pleat * 0.020)
            mat_p = Matrix.Translation(Vector((p_x, y_ax, z_ax)))
            bmesh.ops.create_cylinder(bm_axle, radius=p_rad, depth=0.015, segments=14, matrix=mat_p @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # 5. Outboard Rzeppa CV Joint & Hub Spindle Spline (X = +/- 0.680m)
        mat_outboard = Matrix.Translation(Vector((ax_sign * 0.680, y_ax, z_ax)))
        bmesh.ops.create_cylinder(bm_axle, radius=0.046, depth=0.048, segments=18, matrix=mat_outboard @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # 6. 50-Tooth ABS Reluctor Tone Ring (X = +/- 0.655m)
        mat_abs = Matrix.Translation(Vector((ax_sign * 0.655, y_ax, z_ax)))
        bmesh.ops.create_cylinder(bm_axle, radius=0.049, depth=0.012, segments=24, matrix=mat_abs @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_axle = link_obj("GEO_S2K_Rear_Axle_Halfshafts_and_CVs", bm_axle, parent_col, mats["trim"], bevel=0.001)
    objs.append(obj_axle)
    return objs

# ----------------------------------------------------------------------------
# 26. SUBSYSTEM 24: ELECTRONIC POWER STEERING (EPS) GEARBOX & COLUMN
# ----------------------------------------------------------------------------

def build_s2000_electronic_power_steering_system(parent_col, mats):
    """
    Constructs the pioneering Honda S2000 coaxial Electronic Power Steering (EPS) system:
    - High-output coaxial electric assist motor integrated onto steering rack housing (Y = +1.170m, Z = 0.285m).
    - Aluminum rack and pinion gearbox body with internal helical gearing.
    - Tie-rod inner ball joints encased in rubber bellows boots.
    - Articulated lower steering column shaft with universal needle-bearing U-joints passing through firewall.
    - EPS torque sensor module encased in die-cast aluminum housing.
    """
    objs = []
    bm_eps = bmesh.new()

    # 1. Main Rack and Pinion Steering Housing (Y = +1.170m, Z = 0.285m, Width = 0.720m)
    mat_rack = Matrix.Translation(Vector((0.0, 1.170, 0.285)))
    bmesh.ops.create_cylinder(bm_eps, radius=0.026, depth=0.680, segments=16, matrix=mat_rack @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Coaxial EPS Electric Assist Motor (Mounted coaxial with rack on left side, X = -0.160m)
    mat_motor = Matrix.Translation(Vector((-0.160, 1.170, 0.285)))
    bmesh.ops.create_cylinder(bm_eps, radius=0.052, depth=0.150, segments=20, matrix=mat_motor @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())
    # Motor Connector Housing & Wiring Harness Lead
    mat_conn = Matrix.Translation(Vector((-0.160, 1.140, 0.335)))
    bmesh.ops.create_cube(bm_eps, size=1.0, matrix=mat_conn @ Matrix.Diagonal(Vector((0.045, 0.035, 0.030, 1.0))))

    # 3. Pinion Gearbox Tower & Torque Sensor Housing (Driver Side LHD, X = -0.280m)
    mat_pinion = Matrix.Translation(Vector((-0.280, 1.170, 0.330))) @ Euler((math.radians(24), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_eps, radius=0.038, depth=0.110, segments=16, matrix=mat_pinion)

    # 4. Articulated Steering Intermediate Shaft & Universal Joint
    mat_ujoint = Matrix.Translation(Vector((-0.280, 1.130, 0.380)))
    bmesh.ops.create_cube(bm_eps, size=1.0, matrix=mat_ujoint @ Matrix.Diagonal(Vector((0.035, 0.045, 0.035, 1.0))))
    # Column Shaft Angle passing into Footwell (Y = +1.130m to +0.860m, Z = 0.380m to 0.560m)
    mat_col = Matrix.Translation(Vector((-0.280, 0.995, 0.470))) @ Euler((math.radians(-34), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_eps, radius=0.012, depth=0.340, segments=12, matrix=mat_col)

    # 5. Inner Tie-Rod Accordion Rubber Bellows (Left & Right, X = +/- 0.360m)
    for bx_sign in [-1.0, 1.0]:
        for pleat in range(4):
            p_rad = 0.024 + (0.005 if pleat % 2 == 0 else -0.002)
            p_x = bx_sign * (0.340 + pleat * 0.018)
            mat_bellow = Matrix.Translation(Vector((p_x, 1.170, 0.285)))
            bmesh.ops.create_cylinder(bm_eps, radius=p_rad, depth=0.014, segments=14, matrix=mat_bellow @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_eps = link_obj("GEO_S2K_Electronic_Power_Steering_Rack", bm_eps, parent_col, mats["trim"], bevel=0.001)
    objs.append(obj_eps)
    return objs

# ----------------------------------------------------------------------------
# 27. SUBSYSTEM 25: FLOORPAN STIFFENING RIBS & SILL PINCHWELDS
# ----------------------------------------------------------------------------

def build_s2000_floorpan_ribs_and_sill_pinchwelds(parent_col, mats):
    """
    Constructs the underfloor structural stampings and outer sill pinchwelds:
    - Continuous vertical pinchweld seams along left and right rocker panels (X = +/- 0.745m, Y: -0.850m to +0.850m).
    - Front and rear factory jacking point tabs with reinforced pad brackets.
    - Corrugated longitudinal floorpan floor stiffener ribs pressed into cabin sheetmetal.
    - Floorpan rubber drainage body plugs (grommets) sealed against water ingress.
    """
    objs = []
    bm_ribs = bmesh.new()

    for sx_sign in [-1.0, 1.0]:
        # 1. Continuous Rocker Panel Lower Pinchweld Flange (Z = 0.138m)
        mat_pinch = Matrix.Translation(Vector((sx_sign * 0.745, 0.0, 0.138)))
        bmesh.ops.create_cube(bm_ribs, size=1.0, matrix=mat_pinch @ Matrix.Diagonal(Vector((0.006, 1.760, 0.028, 1.0))))

        # 2. Jacking Point Support Pads (Front Y = +0.720m, Rear Y = -0.740m)
        for y_jack in [0.720, -0.740]:
            mat_jack = Matrix.Translation(Vector((sx_sign * 0.745, y_jack, 0.128)))
            bmesh.ops.create_cube(bm_ribs, size=1.0, matrix=mat_jack @ Matrix.Diagonal(Vector((0.025, 0.110, 0.022, 1.0))))

        # 3. Longitudinal Floorpan Stiffening Ribs (Pressed corrugations in underfloor floorpan, X = +/- 0.320m, +/- 0.480m)
        for rx_off in [0.320, 0.480]:
            mat_rib = Matrix.Translation(Vector((sx_sign * rx_off, -0.050, 0.180)))
            bmesh.ops.create_cube(bm_ribs, size=1.0, matrix=mat_rib @ Matrix.Diagonal(Vector((0.038, 1.250, 0.016, 1.0))))

        # 4. Rubber Body Drainage Grommet Plugs (2 per side)
        for y_plug in [-0.420, 0.350]:
            mat_plug = Matrix.Translation(Vector((sx_sign * 0.400, y_plug, 0.170)))
            bmesh.ops.create_cylinder(bm_ribs, radius=0.020, depth=0.008, segments=14, matrix=mat_plug)

    obj_ribs = link_obj("GEO_S2K_Floorpan_Pinchwelds_and_Ribs", bm_ribs, parent_col, mats["chassis_dark"], bevel=0.001)
    objs.append(obj_ribs)
    return objs

# ----------------------------------------------------------------------------
# 28. SUBSYSTEM 26: DIGITAL LED INSTRUMENT BINNACLE & SPORT WHEEL
# ----------------------------------------------------------------------------

def build_s2000_digital_instrument_binnacle_and_steering_wheel(parent_col, mats):
    """
    Constructs the driver-centric cockpit cockpit command pod and controls:
    - Sweeping digital bar-graph LED tachometer curved binnacle (9,000 RPM scale).
    - Large digital speed readout center lens and auxiliary oil/coolant temp displays.
    - Driver-oriented instrument cowl hood with left/right satellite control pods (Audio & Climate buttons).
    - AP1 3-spoke leather-wrapped sports steering wheel with central Honda "H" horn pad.
    - Dual steering column stalks (turn signal indicator and wiper controls).
    - Red engine start button pod situated immediately to driver's left.
    """
    objs = []
    bm_cockpit = bmesh.new()

    # Driver seating center: X = -0.360m (LHD specification), Y = +0.220m, Z = 0.720m
    x_drv = -0.360

    # 1. Curved Instrument Cluster Cowl Hood
    mat_cowl = Matrix.Translation(Vector((x_drv, 0.420, 0.775)))
    bmesh.ops.create_cube(bm_cockpit, size=1.0, matrix=mat_cowl @ Matrix.Diagonal(Vector((0.340, 0.160, 0.090, 1.0))))

    # 2. Digital LED Tachometer Curved Arc Arc Screen (Emissive display lens)
    mat_screen = Matrix.Translation(Vector((x_drv, 0.380, 0.760))) @ Euler((math.radians(-20), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_cockpit, size=1.0, matrix=mat_screen @ Matrix.Diagonal(Vector((0.260, 0.012, 0.065, 1.0))))

    # 3. Satellite Audio & HVAC Control Pods Flanking Binnacle
    # Left Pod: Audio & Volume Mute Buttons (X = -0.520m, Y = 0.360m, Z = 0.730m)
    mat_lpod = Matrix.Translation(Vector((-0.520, 0.360, 0.730)))
    bmesh.ops.create_cube(bm_cockpit, size=1.0, matrix=mat_lpod @ Matrix.Diagonal(Vector((0.065, 0.095, 0.080, 1.0))))
    # Red Engine Start Button (Left pod face)
    mat_start = Matrix.Translation(Vector((-0.510, 0.320, 0.745))) @ Euler((math.radians(-20), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_cockpit, radius=0.012, depth=0.010, segments=14, matrix=mat_start @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Right Pod: Ventilation Fan Speed & Temperature Knob (X = -0.200m, Y = 0.360m, Z = 0.730m)
    mat_rpod = Matrix.Translation(Vector((-0.200, 0.360, 0.730)))
    bmesh.ops.create_cube(bm_cockpit, size=1.0, matrix=mat_rpod @ Matrix.Diagonal(Vector((0.065, 0.095, 0.080, 1.0))))

    # 4. Steering Column & Shroud (Angle: -22 degrees)
    mat_shroud = Matrix.Translation(Vector((x_drv, 0.280, 0.650))) @ Euler((math.radians(-22), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_cockpit, radius=0.046, depth=0.220, segments=16, matrix=mat_shroud @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Turn Signal & Wiper Control Stalks
    for sx_s, sy_s in [(-0.075, 0.0), (0.075, 0.0)]:
        mat_stalk = mat_shroud @ Matrix.Translation(Vector((sx_s, 0.050, 0.0))) @ Euler((0, math.pi * 0.5 if sx_s > 0 else -math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_cockpit, radius=0.006, depth=0.105, segments=10, matrix=mat_stalk)

    # 5. 3-Spoke AP1 Sport Steering Wheel (Rim Radius = 0.170m, Hub Center: X = -0.360m, Y = 0.175m, Z = 0.690m)
    mat_whub = Matrix.Translation(Vector((x_drv, 0.175, 0.690))) @ Euler((math.radians(-22), 0, 0), 'XYZ').to_matrix().to_4x4()
    # Central Airbag / Horn Boss
    bmesh.ops.create_cylinder(bm_cockpit, radius=0.052, depth=0.038, segments=20, matrix=mat_whub @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Steering Wheel Outer Torus Rim (Segmented procedural torus)
    r_rim = 0.170
    n_rim_segs = 28
    for ri in range(n_rim_segs):
        ang1 = ri * 2.0 * math.pi / n_rim_segs
        ang2 = (ri + 1) * 2.0 * math.pi / n_rim_segs
        mid_ang = 0.5 * (ang1 + ang2)
        rx = r_rim * math.cos(mid_ang)
        rz = r_rim * math.sin(mid_ang)
        seg_len = 2.0 * r_rim * math.sin(math.pi / n_rim_segs)
        mat_seg = mat_whub @ Matrix.Translation(Vector((rx, 0.0, rz))) @ Euler((0, 0, mid_ang + math.pi * 0.5), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_cockpit, radius=0.015, depth=seg_len * 1.05, segments=10, matrix=mat_seg)

    # 3 Spokes: Left (-90 deg), Right (+90 deg), Lower Bottom (-90 deg from horizontal, i.e. 270 deg)
    for spk_ang in [-math.pi * 0.12, math.pi + math.pi * 0.12, -math.pi * 0.5]:
        mid_r = 0.100
        sx = mid_r * math.cos(spk_ang)
        sz = mid_r * math.sin(spk_ang)
        mat_spoke = mat_whub @ Matrix.Translation(Vector((sx, 0.008, sz))) @ Euler((0, 0, spk_ang + math.pi * 0.5), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_cockpit, size=1.0, matrix=mat_spoke @ Matrix.Diagonal(Vector((0.026, 0.014, 0.090, 1.0))))

    obj_cockpit = link_obj("GEO_S2K_Driver_Cockpit_Controls_and_Wheel", bm_cockpit, parent_col, mats["interior_dark"], bevel=0.001)
    objs.append(obj_cockpit)
    return objs
'''
