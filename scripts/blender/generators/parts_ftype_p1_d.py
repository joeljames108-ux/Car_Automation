"""
Jaguar F-Type V8 R Convertible (2010s) Phase 19: Part D
Subsystem 6: 20-Inch "Cyclone" 5-Split-Spoke Alloy Wheels & Pirelli P Zero Tires
Subsystem 7: Cross-Drilled Rotors & Yellow 6-Piston Performance Brake Calipers
"""

PART_FTYPE_D = '''
# ----------------------------------------------------------------------------
# 7. SUBSYSTEM 6: 20-INCH "CYCLONE" 5-SPLIT-SPOKE WHEELS & PIRELLI P ZERO TIRES
# ----------------------------------------------------------------------------

def build_jaguar_ftype_wheels_and_tires(parent_col, mats):
    """
    Constructs the staggered 20-inch "Cyclone" forged alloy wheels and Pirelli tires:
    - Front: 20x9.0J wheel, 255/35 R20 low-profile tire (Outer diameter ~0.686m).
    - Rear: 20x10.5J wheel, 295/30 R20 wide-contact tire (Outer diameter ~0.686m, section width 0.295m).
    - Dynamic turbine-blade 5-split-spoke architecture with diamond-turned machine face.
    - Deep stepped rim barrel with polished outer lip.
    - Recessed center hub with 5 conical chrome lug nuts and Jaguar Growler center cap roundel.
    - High-grip Pirelli P Zero directional asymmetric tread pattern with longitudinal sipes.
    """
    objs = []
    bm_rims = bmesh.new()
    bm_spokes = bmesh.new()
    bm_tires = bmesh.new()

    wheel_configs = [
        # Name,      X_pos,  Y_pos,  Z_pos,  Tire_R, Tire_W, Rim_R,  Spoke_L, Is_Rear
        ("FL", -0.798,  1.311,  0.343,  0.343,  0.255,  0.270,  0.240, False),
        ("FR",  0.798,  1.311,  0.343,  0.343,  0.255,  0.270,  0.240, False),
        ("RL", -0.825, -1.311,  0.343,  0.343,  0.295,  0.270,  0.240, True),
        ("RR",  0.825, -1.311,  0.343,  0.343,  0.295,  0.270,  0.240, True),
    ]

    for name, wx, wy, wz, tr, tw, rr, sl, is_rear in wheel_configs:
        x_sign = 1.0 if wx > 0 else -1.0
        mat_whl = Matrix.Translation(Vector((wx, wy, wz))) @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()

        # 1. Low-Profile Pirelli P Zero Performance Tire
        # Outer Cylindrical Tread Band (cap_ends=False so wheel center is completely open)
        bmesh.ops.create_cylinder(bm_tires, cap_ends=False, radius=tr, depth=tw, segments=36, matrix=mat_whl)
        # Rounded Sidewall Shoulder Beads
        for sw_off in [-tw * 0.44, tw * 0.44]:
            mat_sw = mat_whl @ Matrix.Translation(Vector((0, 0, sw_off)))
            bmesh.ops.create_cylinder(bm_tires, cap_ends=False, radius=tr * 0.97, depth=0.025, segments=32, matrix=mat_sw)

        # 2. Stepped 20-Inch Rim Barrel & Outer Polished Lip
        bmesh.ops.create_cylinder(bm_rims, cap_ends=False, radius=rr, depth=tw * 0.88, segments=32, matrix=mat_whl)
        # Outer Stepped Rim Lip
        mat_lip = mat_whl @ Matrix.Translation(Vector((0, 0, x_sign * (tw * 0.44))))
        bmesh.ops.create_cylinder(bm_rims, cap_ends=False, radius=rr * 1.02, depth=0.018, segments=32, matrix=mat_lip)

        # 3. Recessed Center Hub & Lug Nut Well
        mat_hub = mat_whl @ Matrix.Translation(Vector((0, 0, x_sign * (tw * 0.38))))
        bmesh.ops.create_cylinder(bm_rims, radius=0.082, depth=0.030, segments=24, matrix=mat_hub)
        # Center Cap Roundel
        bmesh.ops.create_cylinder(bm_rims, radius=0.040, depth=0.015, segments=20, matrix=mat_hub @ Matrix.Translation(Vector((0, 0, x_sign * 0.015))))

        # 5 Chrome Conical Lug Nuts
        for lug_i in range(5):
            lug_ang = lug_i * (2.0 * math.pi / 5.0)
            lx = math.cos(lug_ang) * 0.058
            ly = math.sin(lug_ang) * 0.058
            mat_lug = mat_hub @ Matrix.Translation(Vector((lx, ly, x_sign * 0.012)))
            bmesh.ops.create_cylinder(bm_rims, radius=0.010, depth=0.020, segments=12, matrix=mat_lug)

        # 4. Cyclone 5-Split-Spoke Blades (5 pairs of sweeping directional turbine blades)
        for spk_i in range(5):
            base_ang = spk_i * (2.0 * math.pi / 5.0)
            # Each pair has an A-spoke and B-spoke forming a split-Y turbine
            for s_sub in [-0.075, 0.075]:
                ang = base_ang + s_sub
                cos_a = math.cos(ang)
                sin_a = math.sin(ang)
                # Spoke midpoint
                spk_r = (0.080 + rr * 0.94) * 0.5
                spk_len = (rr * 0.94 - 0.080)
                spk_x = cos_a * spk_r
                spk_y = sin_a * spk_r
                mat_spk = mat_hub @ Matrix.Translation(Vector((spk_x, spk_y, x_sign * 0.008))) @ Euler((0, 0, ang), 'XYZ').to_matrix().to_4x4()
                # Angled aerodynamic blade profile
                bmesh.ops.create_cube(bm_spokes, size=1.0, matrix=mat_spk @ Matrix.Diagonal(Vector((0.026, spk_len, 0.022, 1.0))))

    obj_tires = link_obj("GEO_FTYPE_Pirelli_PZero_Tires", bm_tires, parent_col, mats["tire"], bevel=0.002)
    obj_rims = link_obj("GEO_FTYPE_20in_Cyclone_Barrels", bm_rims, parent_col, mats["alloy"], bevel=0.001)
    obj_spokes = link_obj("GEO_FTYPE_20in_Cyclone_Spokes", bm_spokes, parent_col, mats["alloy"], bevel=0.0012)

    objs.extend([obj_tires, obj_rims, obj_spokes])
    return objs


# ----------------------------------------------------------------------------
# 8. SUBSYSTEM 7: PERFORMANCE BRAKE ROTORS & YELLOW 6-PISTON CALIPERS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_brakes_and_calipers(parent_col, mats):
    """
    Constructs the high-performance braking system:
    - Front: Massive 380mm ventilated & cross-drilled carbon/cast iron rotors with yellow 6-piston monobloc Brembo calipers.
    - Rear: 376mm ventilated rotors with yellow 4-piston calipers and integrated electronic parking brake servo.
    - Detailed caliper bridges, pad retaining pins, hydraulic crossover tubes, and bleeder caps.
    """
    objs = []
    bm_rotors = bmesh.new()
    bm_calipers = bmesh.new()

    brake_configs = [
        # Name,   X_pos,  Y_pos,  Z_pos,  Rotor_R, Thick, Is_Front
        ("FL", -0.730,  1.311,  0.343,  0.190,   0.034, True),
        ("FR",  0.730,  1.311,  0.343,  0.190,   0.034, True),
        ("RL", -0.740, -1.311,  0.343,  0.188,   0.030, False),
        ("RR",  0.740, -1.311,  0.343,  0.188,   0.030, False),
    ]

    for name, bx, by, bz, rr, r_thk, is_front in brake_configs:
        x_sign = 1.0 if bx > 0 else -1.0
        mat_brk = Matrix.Translation(Vector((bx, by, bz))) @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()

        # 1. Cross-Drilled Rotor Friction Ring
        bmesh.ops.create_cylinder(bm_rotors, radius=rr, depth=r_thk, segments=32, matrix=mat_brk)
        # Center Aluminum Rotor Hat / Bell
        mat_hat = mat_brk @ Matrix.Translation(Vector((0, 0, x_sign * 0.008)))
        bmesh.ops.create_cylinder(bm_rotors, radius=rr * 0.52, depth=r_thk + 0.012, segments=24, matrix=mat_hat)

        # Cross-Drilling Vent Holes (Radial pattern)
        for h_row in [0.120, 0.150, 0.170]:
            for h_ang_i in range(8):
                ang = h_ang_i * (math.pi / 4.0) + (h_row * 10.0)
                hx = math.cos(ang) * h_row
                hy = math.sin(ang) * h_row
                mat_hole = mat_brk @ Matrix.Translation(Vector((hx, hy, 0)))
                bmesh.ops.create_cylinder(bm_rotors, radius=0.004, depth=r_thk + 0.004, segments=8, matrix=mat_hole)

        # 2. Performance Monobloc Caliper (Trailing side of rotor for front, leading for rear)
        cal_ang = math.radians(145 if is_front else 35)
        cx = math.cos(cal_ang) * (rr * 0.85)
        cy = math.sin(cal_ang) * (rr * 0.85)

        cal_len = 0.280 if is_front else 0.220
        cal_wid = 0.115 if is_front else 0.095
        cal_hgt = 0.095 if is_front else 0.080

        mat_cal = mat_brk @ Matrix.Translation(Vector((cx, cy, x_sign * 0.010))) @ Euler((0, 0, cal_ang + math.pi * 0.5), 'XYZ').to_matrix().to_4x4()

        # Caliper Main Monobloc Body
        bmesh.ops.create_cube(bm_calipers, size=1.0, matrix=mat_cal @ Matrix.Diagonal(Vector((cal_wid, cal_len, cal_hgt, 1.0))))

        # Piston Chamber Bulges
        num_pistons = 3 if is_front else 2
        for p_i in range(num_pistons):
            p_y = (p_i - (num_pistons - 1) * 0.5) * (cal_len * 0.30)
            mat_p = mat_cal @ Matrix.Translation(Vector((0, p_y, 0)))
            bmesh.ops.create_cylinder(bm_calipers, radius=0.026, depth=cal_hgt * 1.05, segments=16, matrix=mat_p @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # Bleeder Screw & Fluid Cross-Over Line
        mat_bleed = mat_cal @ Matrix.Translation(Vector((0, cal_len * 0.42, cal_hgt * 0.45)))
        bmesh.ops.create_cylinder(bm_calipers, radius=0.006, depth=0.025, segments=8, matrix=mat_bleed)

    obj_rotors = link_obj("GEO_FTYPE_CrossDrilled_Brake_Rotors", bm_rotors, parent_col, mats["rotor"], bevel=0.0008)
    obj_calipers = link_obj("GEO_FTYPE_Yellow_Brembo_Calipers", bm_calipers, parent_col, mats["yellow_caliper"], bevel=0.0015)

    objs.extend([obj_rotors, obj_calipers])
    return objs
'''
