"""
Bentley Continental GT Speed Convertible (2020s) Phase 21: Part D
Subsystems 6 and 7:
- Subsystem 6: 22-Inch "Speed" 10-Spoke Directional Forged Alloy Wheels & Pirelli Tires
- Subsystem 7: 440mm Carbon-Silicon-Carbide (CSiC) Rotors & 10-Piston Red Monobloc Calipers
"""

PART_BENTLEY_D = '''
# ----------------------------------------------------------------------------
# 7. SUBSYSTEM 6: 22-INCH "SPEED" FORGED ALLOY WHEELS & PIRELLI TIRES
# ----------------------------------------------------------------------------

def build_bentley_speed_wheels_and_tires(parent_col, mats):
    """
    Constructs the majestic 22-inch "Speed" staggered forged alloy wheels:
    - Front: 22x9.5J wheel, 275/35 ZR22 Pirelli P Zero Elect tire (Radius ~0.365m, width 0.275m).
    - Rear: 22x11.0J wheel, 315/30 ZR22 wide-track tire (Radius ~0.365m, width 0.315m).
    - 10 sweeping directional spokes with dark tint diamond-turned face and polished rim flange.
    - Deep stepped rim barrel with open cylindrical architecture (cap_ends=False).
    - Recessed central hub with floating self-leveling 'B' emblem roundel and 5 chrome lug bolts.
    """
    objs = []
    bm_rims = bmesh.new()
    bm_spokes = bmesh.new()
    bm_tires = bmesh.new()

    wheel_configs = [
        # Name,      X_pos,  Y_pos,  Z_pos,  Tire_R, Tire_W, Rim_R,  Spoke_L, Is_Rear
        ("FL", -0.836,  1.425,  0.365,  0.365,  0.275,  0.292,  0.260, False),
        ("FR",  0.836,  1.425,  0.365,  0.365,  0.275,  0.292,  0.260, False),
        ("RL", -0.832, -1.426,  0.365,  0.365,  0.315,  0.292,  0.260, True),
        ("RR",  0.832, -1.426,  0.365,  0.365,  0.315,  0.292,  0.260, True),
    ]

    for name, wx, wy, wz, tr, tw, rr, sl, is_rear in wheel_configs:
        x_sign = 1.0 if wx > 0 else -1.0
        mat_whl = Matrix.Translation(Vector((wx, wy, wz))) @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()

        # 1. Pirelli P Zero Elect Ultra-Low-Profile Performance Tire
        # Outer Cylindrical Tread Band (cap_ends=False so wheel center is completely open)
        bmesh.ops.create_cylinder(bm_tires, cap_ends=False, radius=tr, depth=tw, segments=36, matrix=mat_whl)
        # Rounded Sidewall Shoulder Beads
        for sw_off in [-tw * 0.44, tw * 0.44]:
            mat_sw = mat_whl @ Matrix.Translation(Vector((0, 0, sw_off)))
            bmesh.ops.create_cylinder(bm_tires, cap_ends=False, radius=tr * 0.97, depth=0.025, segments=32, matrix=mat_sw)

        # 2. Stepped 22-Inch Rim Barrel & Outer Polished Lip
        bmesh.ops.create_cylinder(bm_rims, cap_ends=False, radius=rr, depth=tw * 0.88, segments=32, matrix=mat_whl)
        # Outer Stepped Rim Flange Lip
        mat_lip = mat_whl @ Matrix.Translation(Vector((0, 0, x_sign * (tw * 0.44))))
        bmesh.ops.create_cylinder(bm_rims, cap_ends=False, radius=rr * 1.02, depth=0.018, segments=32, matrix=mat_lip)

        # 3. Recessed Center Hub & Lug Nut Well
        mat_hub = mat_whl @ Matrix.Translation(Vector((0, 0, x_sign * (tw * 0.36))))
        bmesh.ops.create_cylinder(bm_rims, radius=0.090, depth=0.035, segments=24, matrix=mat_hub)
        # Self-Leveling Bentley 'B' Roundel Boss
        bmesh.ops.create_cylinder(bm_rims, radius=0.044, depth=0.016, segments=22, matrix=mat_hub @ Matrix.Translation(Vector((0, 0, x_sign * 0.016))))

        # 5 Chrome Conical Wheel Bolts
        for lug_i in range(5):
            lug_ang = lug_i * (2.0 * math.pi / 5.0)
            lx = math.cos(lug_ang) * 0.064
            ly = math.sin(lug_ang) * 0.064
            mat_lug = mat_hub @ Matrix.Translation(Vector((lx, ly, x_sign * 0.012)))
            bmesh.ops.create_cylinder(bm_rims, radius=0.011, depth=0.022, segments=12, matrix=mat_lug)

        # 4. "Speed" 10-Spoke Directional Forged Blades
        for spk_i in range(10):
            ang = spk_i * (2.0 * math.pi / 10.0)
            cos_a = math.cos(ang)
            sin_a = math.sin(ang)
            spk_r = (0.088 + rr * 0.95) * 0.5
            spk_len = (rr * 0.95 - 0.088)
            spk_x = cos_a * spk_r
            spk_y = sin_a * spk_r
            mat_spk = mat_hub @ Matrix.Translation(Vector((spk_x, spk_y, x_sign * 0.008))) @ Euler((0, 0, ang), 'XYZ').to_matrix().to_4x4()
            bmesh.ops.create_cube(bm_spokes, size=1.0, matrix=mat_spk @ Matrix.Diagonal(Vector((0.024, spk_len, 0.024, 1.0))))

    obj_tires = link_obj("GEO_BENTLEY_Pirelli_PZero_Tires", bm_tires, parent_col, mats["tire"], bevel=0.002)
    obj_rims = link_obj("GEO_BENTLEY_22in_Speed_Barrels", bm_rims, parent_col, mats["speed_alloy"], bevel=0.001)
    obj_spokes = link_obj("GEO_BENTLEY_22in_Speed_10_Spokes", bm_spokes, parent_col, mats["speed_alloy"], bevel=0.0012)

    objs.extend([obj_tires, obj_rims, obj_spokes])
    return objs


# ----------------------------------------------------------------------------
# 8. SUBSYSTEM 7: 440MM CSIC BRAKES & 10-PISTON RED MONOBLOC CALIPERS
# ----------------------------------------------------------------------------

def build_bentley_csic_brakes_and_calipers(parent_col, mats):
    """
    Constructs the world's largest passenger car production brakes:
    - Front: Massive 440mm x 40mm Carbon-Silicon-Carbide (CSiC) cross-drilled ceramic rotors.
    - Front Calipers: Gigantic 10-piston aluminum monobloc calipers finished in high-gloss Speed Red.
    - Rear: 380mm x 30mm CSiC rotors with 4-piston monobloc calipers and integrated electric parking brake actuators.
    - Highly visible through the 22-inch open Speed spoke architecture.
    """
    objs = []
    bm_rotors = bmesh.new()
    bm_calipers = bmesh.new()
    bm_epb = bmesh.new()

    brakes = [
        # Name,      X_pos,  Y_pos,  Z_pos,  Rotor_R, Thick, Is_Front
        ("FL", -0.795,  1.425,  0.365,  0.220,  0.040, True),
        ("FR",  0.795,  1.425,  0.365,  0.220,  0.040, True),
        ("RL", -0.785, -1.426,  0.365,  0.190,  0.030, False),
        ("RR",  0.785, -1.426,  0.365,  0.190,  0.030, False),
    ]

    for name, bx, by, bz, rr, r_thick, is_front in brakes:
        x_sign = 1.0 if bx > 0 else -1.0
        mat_axle = Matrix.Translation(Vector((bx, by, bz))) @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()

        # 1. CSiC Carbon-Silicon-Carbide Rotor Friction Disk
        bmesh.ops.create_cylinder(bm_rotors, radius=rr, depth=r_thick, segments=32, matrix=mat_axle)
        # Billet Aluminum Rotor Center Hat
        mat_hat = mat_axle @ Matrix.Translation(Vector((0, 0, x_sign * (r_thick * 0.5 + 0.008))))
        bmesh.ops.create_cylinder(bm_rotors, radius=rr * 0.48, depth=0.024, segments=24, matrix=mat_hat)

        # 2. Huge Speed Red Monobloc Brake Caliper (Front 10-piston / Rear 4-piston)
        cal_ang = 0.55 if is_front else 2.65
        cal_r = rr * 0.88
        cal_y = math.sin(cal_ang) * cal_r
        cal_z = math.cos(cal_ang) * cal_r
        mat_cal = mat_axle @ Matrix.Translation(Vector((cal_y, cal_z, x_sign * 0.018))) @ Euler((0, 0, cal_ang), 'XYZ').to_matrix().to_4x4()

        cal_len = 0.360 if is_front else 0.250
        cal_w = 0.120 if is_front else 0.095
        cal_h = 0.110 if is_front else 0.085

        # Caliper Main Body Monobloc
        bmesh.ops.create_cube(bm_calipers, size=1.0, matrix=mat_cal @ Matrix.Diagonal(Vector((cal_w, cal_len, cal_h, 1.0))))
        # Top Fluid Crossover Bridge Pipe
        mat_bridge = mat_cal @ Matrix.Translation(Vector((0, 0, cal_h * 0.5 + 0.008)))
        bmesh.ops.create_cylinder(bm_calipers, radius=0.005, depth=cal_len * 0.65, segments=8, matrix=mat_bridge @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # 3. Rear Electronic Parking Brake (EPB) Motor Actuator (Rear only)
        if not is_front:
            mat_act = mat_cal @ Matrix.Translation(Vector((0.045, -0.040, 0)))
            bmesh.ops.create_cylinder(bm_epb, radius=0.028, depth=0.065, segments=16, matrix=mat_act @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_rotors = link_obj("GEO_BENTLEY_440mm_CSiC_Brake_Rotors", bm_rotors, parent_col, mats["csic_rotor"], bevel=0.001)
    obj_calipers = link_obj("GEO_BENTLEY_Speed_Red_10Piston_Calipers", bm_calipers, parent_col, mats["red_caliper"], bevel=0.0015)
    obj_epb = link_obj("GEO_BENTLEY_Rear_EPB_Motor_Actuators", bm_epb, parent_col, mats["trim_black"], bevel=0.0008)

    objs.extend([obj_rotors, obj_calipers, obj_epb])
    return objs
'''
