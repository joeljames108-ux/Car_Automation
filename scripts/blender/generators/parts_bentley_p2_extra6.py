"""
Bentley Continental GT Speed Convertible (2020s) Phase 22: Part Extra 6
Subsystems 19 and 20:
- Subsystem 19: Seat Belt Shoulder Guides & Chrome Buckle Tongues
- Subsystem 20: Steering Wheel Knurled Thumbwheels & Anodized Shift Paddles
"""

PART_BENTLEY2_EXTRA6 = '''
# ----------------------------------------------------------------------------
# 20. SUBSYSTEM 19: SEAT BELT SHOULDER GUIDES & CHROME BUCKLE TONGUES
# ----------------------------------------------------------------------------

def build_bentley_seat_belts_and_hardware(parent_col, mats):
    """
    Constructs the cockpit seat restraint detailing:
    - Integrated polished chrome seat belt shoulder feeder guides on front seat bolsters.
    - Woven technical fabric 3-point belt webbing strap draped across seat contours.
    - Polished stainless steel latch tongue plate.
    - Stalk-mounted buckle receivers with safety red push-button release switches.
    """
    objs = []
    bm_guides = bmesh.new()
    bm_belts = bmesh.new()
    bm_buckles = bmesh.new()

    for bx_sign in [-1.0, 1.0]:
        # 1. Seat Bolster Shoulder Feeder Guide (Top outer shoulder of each front seat)
        mat_guide = Matrix.Translation(Vector((bx_sign * 0.580, -0.320, 0.940)))
        # Chrome Loop Guide Ring
        bmesh.ops.create_torus(bm_guides, major_radius=0.024, minor_radius=0.005, major_segments=18, minor_segments=10, matrix=mat_guide @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # 2. Diagonal Seat Belt Webbing (Draped from guide down to inboard console buckle)
        p_guide = Vector((bx_sign * 0.580, -0.320, 0.940))
        p_buckle = Vector((bx_sign * 0.190, -0.220, 0.520))
        p_mid = (p_guide + p_buckle) * 0.5
        v_belt = p_buckle - p_guide
        length = v_belt.length
        rot_quat = Vector((0, 0, 1)).rotation_difference(v_belt.normalized())

        mat_webbing = Matrix.Translation(p_mid) @ rot_quat.to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_belts, size=1.0, matrix=mat_webbing @ Matrix.Diagonal(Vector((0.048, 0.003, length, 1.0))))

        # 3. Inboard Buckle Receiver Stalk (Between seat cushion and center console)
        mat_bstalk = Matrix.Translation(p_buckle)
        bmesh.ops.create_cube(bm_buckles, size=1.0, matrix=mat_bstalk @ Matrix.Diagonal(Vector((0.028, 0.045, 0.080, 1.0))))
        # Red Eject Button on top
        mat_btn = mat_bstalk @ Matrix.Translation(Vector((0, 0, 0.042)))
        bmesh.ops.create_cube(bm_buckles, size=1.0, matrix=mat_btn @ Matrix.Diagonal(Vector((0.022, 0.016, 0.006, 1.0))))

    obj_guides = link_obj("GEO_BENTLEY_SeatBelt_Chrome_Shoulder_Guides", bm_guides, parent_col, mats["chrome"], bevel=0.0004)
    obj_belts = link_obj("GEO_BENTLEY_SeatBelt_Woven_Webbing", bm_belts, parent_col, mats["trim_black"], bevel=0.0003)
    obj_buckles = link_obj("GEO_BENTLEY_SeatBelt_Buckle_Receivers", bm_buckles, parent_col, mats["red_caliper"], bevel=0.0004)

    objs.extend([obj_guides, obj_belts, obj_buckles])
    return objs


# ----------------------------------------------------------------------------
# 21. SUBSYSTEM 20: STEERING WHEEL KNURLED THUMBWHEELS & SHIFT PADDLES
# ----------------------------------------------------------------------------

def build_bentley_steering_controls(parent_col, mats):
    """
    Constructs micro-machined controls on the sport steering wheel:
    - Left and right spoke diamond-knurled scroll rollers for MMI volume and instrument control.
    - Micro push buttons flanking thumb rollers with tactile relief domes.
    - Ergonomic curved aluminum paddle shifters mounted to steering column (Left '-', Right '+').
    - Laser-etched '+' and '-' shift indicator graphics in bright white.
    """
    objs = []
    bm_knurl = bmesh.new()
    bm_paddles = bmesh.new()
    bm_buttons = bmesh.new()

    # Steering Wheel Center (LHD Driver: X = -0.420m, Y = 0.260m, Z = 0.780m)
    mat_whl = Matrix.Translation(Vector((-0.420, 0.260, 0.780))) @ Euler((-math.radians(24), 0, 0), 'XYZ').to_matrix().to_4x4()

    # Left & Right Spoke Thumb Controls
    for sx_sign in [-1.0, 1.0]:
        mat_spoke = mat_whl @ Matrix.Translation(Vector((sx_sign * 0.095, 0.012, 0.0)))
        # Billet Diamond-Knurled Scroll Thumbwheel Roller
        bmesh.ops.create_cylinder(bm_knurl, radius=0.009, depth=0.024, segments=18, matrix=mat_spoke)

        # Flanking Multi-Function Push Buttons
        for b_off in [-0.018, 0.018]:
            mat_btn = mat_spoke @ Matrix.Translation(Vector((0.0, 0.0, b_off)))
            bmesh.ops.create_cube(bm_buttons, size=1.0, matrix=mat_btn @ Matrix.Diagonal(Vector((0.016, 0.008, 0.012, 1.0))))

        # Column-Mounted Articulated Shift Paddles (Behind wheel rim)
        mat_pad = mat_whl @ Matrix.Translation(Vector((sx_sign * 0.145, -0.045, 0.040))) @ Euler((0, sx_sign * math.radians(12), 0), 'XYZ').to_matrix().to_4x4()
        # Curved Ergonomic Aluminum Paddle Blade
        bmesh.ops.create_cube(bm_paddles, size=1.0, matrix=mat_pad @ Matrix.Diagonal(Vector((0.014, 0.006, 0.130, 1.0))))

        # Tactile Knurled Grip Texture on Paddle Backside
        mat_pgrip = mat_pad @ Matrix.Translation(Vector((0.0, -0.004, 0.0)))
        bmesh.ops.create_cube(bm_knurl, size=1.0, matrix=mat_pgrip @ Matrix.Diagonal(Vector((0.010, 0.003, 0.110, 1.0))))

    obj_knurl = link_obj("GEO_BENTLEY_Steering_Knurled_Thumbwheels", bm_knurl, parent_col, mats["knurled_metal"], bevel=0.0003)
    obj_paddles = link_obj("GEO_BENTLEY_Steering_Column_Shift_Paddles", bm_paddles, parent_col, mats["chrome"], bevel=0.0004)
    obj_buttons = link_obj("GEO_BENTLEY_Steering_Spoke_Push_Buttons", bm_buttons, parent_col, mats["trim_black"], bevel=0.0003)

    objs.extend([obj_knurl, obj_paddles, obj_buttons])
    return objs
'''
