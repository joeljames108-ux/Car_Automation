"""
Jaguar F-Type V8 R Convertible (2010s) Phase 20: Extra Part 6
Subsystems 35 to 37:
- Subsystem 35: Front Active Aero Grille Shutters, Stepper Motor Actuator & Auxiliary Oil Cooler Radiator Stacks
- Subsystem 36: High-Performance Carbon-Ceramic Matrix (CCM) Caliper Guide Pins, Pad Springs & Wear Sensors
- Subsystem 37: Rear Underfloor Aerodynamic Venturi Tunnels, Air Strakes & Titanium Muffler Heat Deflectors
"""

PART_FTYPE2_EXTRA6 = '''
# ----------------------------------------------------------------------------
# 37. SUBSYSTEM 35: ACTIVE AERO GRILLE SHUTTERS & AUXILIARY COOLER RADIATORS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_active_aero_shutters(parent_col, mats):
    """
    Constructs the motorized front active aerodynamic grille shutter system and auxiliary radiator cores:
    - Motorized horizontal airfoil vanes mounted directly behind the main honeycomb grille.
      These vanes close at high speeds to streamline frontal airflow, reducing drag coefficient (Cd).
    - Center electric stepper motor actuator with mechanical tie-rod synchronization linkage.
    - Twin auxiliary oil cooler radiator cores mounted inside the lower outboard bumper air scoops,
      complete with fine horizontal cooling fin matrices and stone-guard protective mesh screens.
    """
    objs = []
    bm_shutters = bmesh.new()
    bm_rads = bmesh.new()

    # Main Grille Active Louver Vanes (7 articulated horizontal blades)
    for i in range(7):
        vy = 2.050 - (i * 0.008)
        vz = 0.380 + (i * 0.045)
        blade_width = 0.820 - (abs(i - 3) * 0.040)

        mat_vane = Matrix.Translation(Vector((0.0, vy, vz)))
        # Aerodynamic teardrop cross-section louver blade
        bmesh.ops.create_cube(
            bm_shutters,
            size=1.0,
            matrix=mat_vane @ Matrix.Diagonal(Vector((blade_width, 0.022, 0.005, 1.0)))
        )
        # End pivot trunnion pins for each blade
        for px_sign in [-1.0, 1.0]:
            px = px_sign * (blade_width * 0.5 + 0.008)
            mat_pin = Matrix.Translation(Vector((px, vy, vz)))
            bmesh.ops.create_cylinder(
                bm_shutters,
                radius=0.004,
                depth=0.016,
                segments=10,
                matrix=mat_pin @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()
            )

    # Vertical Tie-Rod Synchronization Linkage
    mat_tierod = Matrix.Translation(Vector((0.0, 2.040, 0.515)))
    bmesh.ops.create_cylinder(
        bm_shutters,
        radius=0.0035,
        depth=0.290,
        segments=8,
        matrix=mat_tierod
    )

    # Electric Stepper Motor Actuator Housing (Mounted on upper cross-member)
    mat_actuator = Matrix.Translation(Vector((0.0, 2.020, 0.670)))
    bmesh.ops.create_cube(
        bm_shutters,
        size=1.0,
        matrix=mat_actuator @ Matrix.Diagonal(Vector((0.065, 0.055, 0.045, 1.0)))
    )

    obj_shutters = link_obj("GEO_FTYPE_Active_Aero_Grille_Shutters", bm_shutters, parent_col, mats["piano_black"], bevel=0.0006)
    objs.append(obj_shutters)

    # Twin Auxiliary Outboard Oil Coolers (Inside lower shark gill scoops)
    for rx_sign in [-1.0, 1.0]:
        rx = rx_sign * 0.620
        ry = 1.940
        rz = 0.320

        mat_rad = Matrix.Translation(Vector((rx, ry, rz))) @ Euler((0, rx_sign * 0.12, 0), 'XYZ').to_matrix().to_4x4()
        # Radiator core body
        bmesh.ops.create_cube(
            bm_rads,
            size=1.0,
            matrix=mat_rad @ Matrix.Diagonal(Vector((0.240, 0.060, 0.160, 1.0)))
        )
        # Billet end tanks (Top & Bottom)
        for tz_off in [-0.088, 0.088]:
            mat_tank = mat_rad @ Matrix.Translation(Vector((0, 0, tz_off)))
            bmesh.ops.create_cube(
                bm_rads,
                size=1.0,
                matrix=mat_tank @ Matrix.Diagonal(Vector((0.245, 0.064, 0.016, 1.0)))
            )
        # Stainless steel braided cooling line hose fittings (AN-10 fittings)
        for hx_off in [-0.080, 0.080]:
            mat_an = mat_rad @ Matrix.Translation(Vector((hx_off, -0.038, 0.085)))
            bmesh.ops.create_cylinder(
                bm_rads,
                radius=0.012,
                depth=0.028,
                segments=12,
                matrix=mat_an @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4()
            )

    obj_rads = link_obj("GEO_FTYPE_Auxiliary_Oil_Coolers", bm_rads, parent_col, mats["inconel"], bevel=0.0008)
    objs.append(obj_rads)
    return objs


# ----------------------------------------------------------------------------
# 38. SUBSYSTEM 36: CARBON-CERAMIC BRAKE HARDWARE & WEAR SENSOR WIRING
# ----------------------------------------------------------------------------

def build_jaguar_ftype_ccm_brake_micro_hardware(parent_col, mats):
    """
    Constructs ultra-detailed high-performance Carbon-Ceramic Matrix (CCM) brake hardware:
    - Stainless steel pad retaining guide pins with split cotter locking clips on all 4 monobloc calipers.
    - Stamped titanium anti-rattle pad spring plates spanning across the caliper bridge window.
    - Electronic brake pad wear sensor wiring harnesses encased in corrugated flex conduit,
      clipped to the aluminum suspension uprights with nylon P-clips.
    - Machined bleed nipples with protective rubber dust seal caps and tether leashes.
    """
    objs = []
    bm_pins = bmesh.new()
    bm_wiring = bmesh.new()

    wheel_positions = [
        # (name, x_sign, is_front, center_x, center_y, center_z)
        ("FL", -1.0, True, -0.820, 1.320, 0.335),
        ("FR",  1.0, True,  0.820, 1.320, 0.335),
        ("RL", -1.0, False, -0.835, -1.300, 0.335),
        ("RR",  1.0, False,  0.835, -1.300, 0.335),
    ]

    for name, x_sign, is_front, cx, cy, cz in wheel_positions:
        # Caliper is positioned at top/forward quadrant
        ang = 0.65 if is_front else 2.50
        cal_r = 0.165 if is_front else 0.145
        cal_y = cy + math.sin(ang) * cal_r
        cal_z = cz + math.cos(ang) * cal_r
        cal_x = cx - (x_sign * 0.045)

        mat_cal = Matrix.Translation(Vector((cal_x, cal_y, cal_z)))

        # 1. Dual Stainless Pad Retaining Cross-Pins
        pin_spacing = 0.055 if is_front else 0.042
        for p_off in [-pin_spacing, pin_spacing]:
            mat_pin = mat_cal @ Matrix.Translation(Vector((0, p_off, 0.025)))
            # Stainless pin shaft
            bmesh.ops.create_cylinder(
                bm_pins,
                radius=0.0035,
                depth=0.065,
                segments=10,
                matrix=mat_pin @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()
            )
            # Cotter locking clip ring
            mat_cotter = mat_pin @ Matrix.Translation(Vector((x_sign * 0.034, 0, 0)))
            bmesh.ops.create_torus(
                bm_pins,
                major_radius=0.005,
                minor_radius=0.0015,
                major_segments=12,
                minor_segments=8,
                matrix=mat_cotter
            )

        # 2. Titanium Cross-Bridge Anti-Rattle Spring Plate
        mat_spring = mat_cal @ Matrix.Translation(Vector((0, 0, 0.032)))
        bmesh.ops.create_cube(
            bm_pins,
            size=1.0,
            matrix=mat_spring @ Matrix.Diagonal(Vector((0.042, pin_spacing * 2.2, 0.003, 1.0)))
        )

        # 3. Dual Hydraulic Bleeder Screws with Rubber Caps
        for b_off in [-0.035, 0.035]:
            mat_bleed = mat_cal @ Matrix.Translation(Vector((0, b_off, 0.048)))
            # Hex bleeder body
            bmesh.ops.create_cylinder(
                bm_pins,
                radius=0.005,
                depth=0.016,
                segments=6,
                matrix=mat_bleed
            )
            # Rubber cap on top
            mat_cap = mat_bleed @ Matrix.Translation(Vector((0, 0, 0.010)))
            bmesh.ops.create_cylinder(
                bm_wiring,
                radius=0.0055,
                depth=0.008,
                segments=10,
                matrix=mat_cap
            )

        # 4. Electronic Brake Pad Wear Sensor Loom & Conduit
        pts_wire = [
            Vector((cal_x, cal_y, cal_z + 0.020)),
            Vector((cal_x + (x_sign * 0.020), cal_y - 0.030, cal_z + 0.050)),
            Vector((cx - (x_sign * 0.080), cy - 0.020, cz + 0.120)),
            Vector((cx - (x_sign * 0.120), cy, cz + 0.180)),
        ]
        for w_idx in range(len(pts_wire) - 1):
            p_start = pts_wire[w_idx]
            p_end = pts_wire[w_idx + 1]
            seg_vec = p_end - p_start
            seg_len = seg_vec.length
            mid_pt = (p_start + p_end) * 0.5

            quat = Vector((0, 0, 1)).rotation_difference(seg_vec.normalized())
            mat_seg = Matrix.Translation(mid_pt) @ quat.to_matrix().to_4x4()
            bmesh.ops.create_cylinder(
                bm_wiring,
                radius=0.003,
                depth=seg_len,
                segments=8,
                matrix=mat_seg
            )

        # P-Clip bracket securing sensor harness to knuckle
        mat_pclip = Matrix.Translation(Vector((cx - (x_sign * 0.080), cy - 0.020, cz + 0.120)))
        bmesh.ops.create_cube(
            bm_pins,
            size=1.0,
            matrix=mat_pclip @ Matrix.Diagonal(Vector((0.012, 0.016, 0.008, 1.0)))
        )

    obj_pins = link_obj("GEO_FTYPE_CCM_Brake_Hardware_Pins", bm_pins, parent_col, mats["chrome"], bevel=0.0004)
    obj_wiring = link_obj("GEO_FTYPE_Brake_Sensor_Wiring_Loom", bm_wiring, parent_col, mats["rubber"], bevel=0.0003)
    objs.extend([obj_pins, obj_wiring])
    return objs


# ----------------------------------------------------------------------------
# 39. SUBSYSTEM 37: UNDERFLOOR VENTURI DIFFUSER TUNNELS & HEAT SHIELDING
# ----------------------------------------------------------------------------

def build_jaguar_ftype_underfloor_venturi_and_heatshields(parent_col, mats):
    """
    Constructs the high-speed underbody aerodynamic venturi tunnels and thermal management shielding:
    - Dual underfloor venturi expansion tunnels accelerating high-velocity boundary layer air into the rear diffuser.
    - 4 razor-sharp longitudinal aerodynamic fence strakes generating vortex boundaries between exhaust flow channels.
    - Stamped aircraft-grade embossed aluminum thermal heat deflection shields insulating rear suspension
      subframe and electronic active rear differential (E-Diff) from 575hp supercharged exhaust radiation.
    """
    objs = []
    bm_tunnels = bmesh.new()
    bm_shields = bmesh.new()

    # Dual Venturi Expansion Tunnels (Under rear axle spanning to diffuser)
    for tx_sign in [-1.0, 1.0]:
        tx = tx_sign * 0.420
        ty = -1.550
        tz = 0.200

        mat_tunnel = Matrix.Translation(Vector((tx, ty, tz))) @ Euler((0.06, 0, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(
            bm_tunnels,
            size=1.0,
            matrix=mat_tunnel @ Matrix.Diagonal(Vector((0.360, 0.850, 0.020, 1.0)))
        )

        # Longitudinal Vortex Generator Strakes (Sharply sculpted fins)
        for s_idx, sx_off in enumerate([-0.140, 0.0, 0.140]):
            mat_strake = mat_tunnel @ Matrix.Translation(Vector((sx_off, 0.0, -0.035)))
            bmesh.ops.create_cube(
                bm_tunnels,
                size=1.0,
                matrix=mat_strake @ Matrix.Diagonal(Vector((0.004, 0.820, 0.055, 1.0)))
            )

    obj_tunnels = link_obj("GEO_FTYPE_Underfloor_Venturi_Tunnels", bm_tunnels, parent_col, mats["piano_black"], bevel=0.0008)
    objs.append(obj_tunnels)

    # Embossed Aluminum Heat Shield Enclosure (Around rear differential and muffler)
    mat_diff_shield = Matrix.Translation(Vector((0.0, -1.350, 0.310)))
    bmesh.ops.create_cube(
        bm_shields,
        size=1.0,
        matrix=mat_diff_shield @ Matrix.Diagonal(Vector((0.680, 0.520, 0.015, 1.0)))
    )

    # Muffler Forward Thermal Deflection Bulkhead
    mat_muff_shield = Matrix.Translation(Vector((0.0, -1.820, 0.330))) @ Euler((-0.25, 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(
        bm_shields,
        size=1.0,
        matrix=mat_muff_shield @ Matrix.Diagonal(Vector((1.120, 0.220, 0.012, 1.0)))
    )

    # Heat Shield Structural Stamping Ribs (Hexagonal embossed stiffeners)
    for rib_y in [-1.200, -1.350, -1.500]:
        mat_rib = Matrix.Translation(Vector((0.0, rib_y, 0.318)))
        bmesh.ops.create_cylinder(
            bm_shields,
            radius=0.004,
            depth=0.550,
            segments=8,
            matrix=mat_rib @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()
        )

    obj_shields = link_obj("GEO_FTYPE_Underbody_Exhaust_Heat_Shields", bm_shields, parent_col, mats["inconel"], bevel=0.0005)
    objs.append(obj_shields)
    return objs
'''
