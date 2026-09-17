"""
Bentley Continental GT Speed Convertible (2020s) Phase 22: Part Extra 1
Subsystems 9 and 10:
- Subsystem 9: Dual Pantograph Aero Windshield Wipers & Heated Spray Jets
- Subsystem 10: 22-Inch Speed Floating Self-Leveling Bentley 'B' Wheel Center Caps
"""

PART_BENTLEY2_EXTRA1 = '''
# ----------------------------------------------------------------------------
# 10. SUBSYSTEM 9: DUAL PANTOGRAPH WIPERS & HEATED WASHER JETS
# ----------------------------------------------------------------------------

def build_bentley_wipers_and_washers(parent_col, mats):
    """
    Constructs the high-speed aerodynamic windshield wiper assembly:
    - Opposing articulated pantograph wiper arms concealed neatly below the rear bonnet shutline.
    - Integrated aerodynamic downforce airfoils along driver blade preventing wiper lift at 208 mph.
    - Flexible silicone beam wiper blades contoured to complex windshield curvature.
    - 4 high-pressure heated washer fan nozzles with fluid supply lines.
    """
    objs = []
    bm_arms = bmesh.new()
    bm_blades = bmesh.new()
    bm_nozzles = bmesh.new()

    # Wiper Pivot Bases (Left Driver and Right Passenger in cowl trough, Y = +0.700m, Z = 0.835m)
    wiper_configs = [
        # Side, X_pivot, Blade_Len, Angle
        ("Driver",    -0.380, 0.620,  16),
        ("Passenger",  0.280, 0.580,  12),
    ]

    for name, px, blen, ang in wiper_configs:
        mat_pivot = Matrix.Translation(Vector((px, 0.700, 0.835)))
        # Billet Aluminum Pivot Knuckle Bushing
        bmesh.ops.create_cylinder(bm_arms, radius=0.016, depth=0.035, segments=16, matrix=mat_pivot)

        # Articulated Primary Wiper Arm Rod
        mat_arm = mat_pivot @ Euler((-math.radians(ang), 0, math.radians(ang * 0.8)), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_arms, radius=0.007, depth=0.280, segments=12, matrix=mat_arm @ Matrix.Translation(Vector((0, -0.140, 0.050))))

        # Aerodynamic Downforce Airfoil Foil along Wiper Arm
        mat_foil = mat_arm @ Matrix.Translation(Vector((0, -0.220, 0.065)))
        bmesh.ops.create_cube(bm_arms, size=1.0, matrix=mat_foil @ Matrix.Diagonal(Vector((0.022, 0.220, 0.008, 1.0))))

        # Flexible Silicone Rubber Beam Wiper Blade
        mat_b = mat_arm @ Matrix.Translation(Vector((0, -0.320, 0.080)))
        bmesh.ops.create_cube(bm_blades, size=1.0, matrix=mat_b @ Matrix.Diagonal(Vector((0.010, blen, 0.014, 1.0))))

    # 4 Heated Washer Jet Nozzles (Mounted along underside of bonnet trailing lip)
    for nx in [-0.520, -0.180, 0.180, 0.520]:
        mat_noz = Matrix.Translation(Vector((nx, 0.725, 0.830)))
        bmesh.ops.create_cube(bm_nozzles, size=1.0, matrix=mat_noz @ Matrix.Diagonal(Vector((0.024, 0.018, 0.014, 1.0))))
        # Twin Fan Jet Orifice Holes
        mat_ori = mat_noz @ Matrix.Translation(Vector((0, -0.009, 0.004)))
        bmesh.ops.create_cylinder(bm_nozzles, radius=0.0025, depth=0.006, segments=8, matrix=mat_ori @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_arms = link_obj("GEO_BENTLEY_Windshield_Wiper_Articulated_Arms", bm_arms, parent_col, mats["trim_black"], bevel=0.0008)
    obj_blades = link_obj("GEO_BENTLEY_Silicone_Beam_Wiper_Blades", bm_blades, parent_col, mats["trim_black"], bevel=0.0005)
    obj_nozzles = link_obj("GEO_BENTLEY_Heated_Washer_Jet_Nozzles", bm_nozzles, parent_col, mats["trim_black"], bevel=0.0005)

    objs.extend([obj_arms, obj_blades, obj_nozzles])
    return objs


# ----------------------------------------------------------------------------
# 11. SUBSYSTEM 10: 22-INCH SPEED FLOATING SELF-LEVELING 'B' CENTER CAPS
# ----------------------------------------------------------------------------

def build_bentley_floating_wheel_center_caps(parent_col, mats):
    """
    Constructs the iconic self-leveling floating wheel center cap emblems:
    - 4 wheel center caps with internal counterweighted ball-bearing spindles.
    - Ensures the Bentley Winged 'B' emblem always remains upright even at 208 mph.
    - Polished Mulliner chrome outer retaining bezel ring with micro-notched removal slot.
    - Vitreous black cloisonné enamel emblem face with raised chrome 3D 'B' monogram.
    """
    objs = []
    bm_caps = bmesh.new()
    bm_b = bmesh.new()
    bm_enamel = bmesh.new()

    wheel_hubs = [
        ("FL", -0.836,  1.425, 0.365,  0.275, -1.0),
        ("FR",  0.836,  1.425, 0.365,  0.275,  1.0),
        ("RL", -0.832, -1.426, 0.365,  0.315, -1.0),
        ("RR",  0.832, -1.426, 0.365,  0.315,  1.0),
    ]

    for name, wx, wy, wz, tw, x_sign in wheel_hubs:
        # Hub outboard face center
        mat_hub = Matrix.Translation(Vector((wx, wy, wz))) @ Matrix.Translation(Vector((x_sign * (tw * 0.375), 0, 0)))

        # 1. Polished Chrome Outer Bezel Ring (Radius = 0.046m)
        bmesh.ops.create_torus(bm_caps, major_radius=0.046, minor_radius=0.004, major_segments=24, minor_segments=12, matrix=mat_hub @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # 2. Black Enamel Circular Medallion Face (Radius = 0.043m)
        bmesh.ops.create_cylinder(bm_enamel, radius=0.043, depth=0.008, segments=24, matrix=mat_hub @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # 3. Always-Upright Raised Chrome Bentley 'B' Monogram (Z-Up aligned)
        mat_b_face = mat_hub @ Matrix.Translation(Vector((x_sign * 0.006, 0, 0)))
        bmesh.ops.create_cube(bm_b, size=1.0, matrix=mat_b_face @ Matrix.Diagonal(Vector((0.004, 0.024, 0.034, 1.0))))
        # Top and Bottom Loops of 'B'
        for loop_z in [-0.008, 0.008]:
            mat_loop = mat_b_face @ Matrix.Translation(Vector((0, 0.008, loop_z)))
            bmesh.ops.create_cube(bm_b, size=1.0, matrix=mat_loop @ Matrix.Diagonal(Vector((0.004, 0.014, 0.012, 1.0))))

    obj_caps = link_obj("GEO_BENTLEY_Wheel_CenterCap_Chrome_Bezel", bm_caps, parent_col, mats["chrome"], bevel=0.0004)
    obj_enamel = link_obj("GEO_BENTLEY_Wheel_CenterCap_Black_Enamel", bm_enamel, parent_col, mats["black_enamel"], bevel=0.0003)
    obj_b = link_obj("GEO_BENTLEY_Wheel_CenterCap_Upright_B_Letter", bm_b, parent_col, mats["chrome"], bevel=0.0004)

    objs.extend([obj_caps, obj_enamel, obj_b])
    return objs
'''
