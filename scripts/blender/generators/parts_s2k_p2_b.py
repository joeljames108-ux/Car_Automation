"""
Honda S2000 AP1 (2000s) Phase 18: Part B
Subsystems 5 to 8:
5. Recessed Exterior Door Handles & Chrome Keylock Tumbler Barrels
6. Red Enamel Honda Front & Rear "H" Badges with Raised Chrome Framing
7. Raised Script "S2000" Front Fender Side Badges
8. High-Mount Third LED Center Brake Lamp with 16 Ruby Diodes
"""

PART_S2K2_B = '''
# ----------------------------------------------------------------------------
# 7. SUBSYSTEM 5: RECESSED EXTERIOR DOOR HANDLES & KEYLOCK BARRELS
# ----------------------------------------------------------------------------

def build_s2000_door_handles_and_key_cylinders(parent_col, mats):
    """
    Constructs the flushed aerodynamic exterior door handles:
    - Recessed finger pocket cup molded into door skin (X = +/- 0.865m, Y = -0.220m, Z = 0.775m).
    - Flushed pull-handle trigger paddle styled flush with door waistline.
    - Driver-side (and passenger-side) miniature chrome mechanical keyhole tumbler cylinder.
    - Handle perimeter rubber weather-seal gasket.
    """
    objs = []
    bm_cup = bmesh.new()
    bm_pull = bmesh.new()
    bm_key = bmesh.new()

    for dx_sign in [-1.0, 1.0]:
        x_d = dx_sign * 0.865
        y_d = -0.220
        z_d = 0.775

        mat_d = Matrix.Translation(Vector((x_d, y_d, z_d))) @ Euler((0, 0, dx_sign * math.radians(-4)), 'XYZ').to_matrix().to_4x4()

        # 1. Recessed Finger Pocket Cup (Concave depression into door skin)
        bmesh.ops.create_cube(bm_cup, size=1.0, matrix=mat_d @ Matrix.Diagonal(Vector((0.024, 0.160, 0.055, 1.0))))

        # 2. Flushed Exterior Pull Handle Paddle
        mat_paddle = mat_d @ Matrix.Translation(Vector((dx_sign * 0.008, 0, 0)))
        bmesh.ops.create_cube(bm_pull, size=1.0, matrix=mat_paddle @ Matrix.Diagonal(Vector((0.016, 0.145, 0.038, 1.0))))

        # 3. Mechanical Lock Tumbler Keyhole Cylinder (Forward of pull handle)
        mat_key = mat_d @ Matrix.Translation(Vector((dx_sign * 0.006, 0.095, 0)))
        bmesh.ops.create_cylinder(bm_key, radius=0.009, depth=0.016, segments=16, matrix=mat_key @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())
        # Miniature Keyway Slit
        mat_slit = mat_key @ Matrix.Translation(Vector((dx_sign * 0.009, 0, 0)))
        bmesh.ops.create_cube(bm_key, size=1.0, matrix=mat_slit @ Matrix.Diagonal(Vector((0.003, 0.002, 0.008, 1.0))))

    obj_cup = link_obj("GEO_S2K_DoorHandle_Recessed_Cups", bm_cup, parent_col, mats["trim"], bevel=0.001)
    obj_pull = link_obj("GEO_S2K_DoorHandle_Pull_Paddles", bm_pull, parent_col, mats["body"], bevel=0.001)
    obj_key = link_obj("GEO_S2K_DoorHandle_Keylock_Tumblers", bm_key, parent_col, mats["chrome"], bevel=0.0004)

    objs.extend([obj_cup, obj_pull, obj_key])
    return objs

# ----------------------------------------------------------------------------
# 8. SUBSYSTEM 6: AUTHENTIC HONDA FRONT & REAR "H" BADGES
# ----------------------------------------------------------------------------

def build_s2000_honda_front_and_rear_h_badges(parent_col, mats):
    """
    Constructs the iconic Honda "H" insignia badges with authentic racing red cloisonné:
    - Front Hood/Bumper Emblem: Mounted above front bumper air intake (X = 0.0m, Y = +2.020m, Z = 0.590m, angled 35 deg).
    - Rear Trunk Lid Emblem: Centered on rear deck vertical drop (X = 0.0m, Y = -2.030m, Z = 0.745m).
    - Red enamel background plaque with chrome outer bezel ring.
    - Precision extruded chrome 3D "H" emblem logo standing proud of background.
    """
    objs = []
    bm_field = bmesh.new()
    bm_hlogo = bmesh.new()

    # Badge Configurations: [Position, Euler, Scale]
    badges = [
        # Front Bumper/Hood Badge
        (Vector((0.0, 2.015, 0.590)), Euler((math.radians(38), 0, 0), 'XYZ'), 0.056),
        # Rear Trunk Lid Badge
        (Vector((0.0, -2.032, 0.745)), Euler((math.radians(-12), 0, 0), 'XYZ'), 0.052),
    ]

    for b_pos, b_rot, b_scale in badges:
        mat_b = Matrix.Translation(b_pos) @ b_rot.to_matrix().to_4x4()

        # 1. Outer Beveled Chrome Frame & Red Cloisonné Backing Plaque
        bmesh.ops.create_cube(bm_field, size=1.0, matrix=mat_b @ Matrix.Diagonal(Vector((b_scale * 1.15, 0.008, b_scale * 0.95, 1.0))))
        # Chrome Perimeter Bezel
        mat_bezel = mat_b @ Matrix.Translation(Vector((0, 0.002, 0)))
        bmesh.ops.create_cube(bm_hlogo, size=1.0, matrix=mat_bezel @ Matrix.Diagonal(Vector((b_scale * 1.20, 0.006, b_scale * 1.00, 1.0))))

        # 2. Raised 3D Chrome "H" Emblem Geometry
        # Central Crossbar
        mat_cbar = mat_b @ Matrix.Translation(Vector((0.0, 0.005, 0.0)))
        bmesh.ops.create_cube(bm_hlogo, size=1.0, matrix=mat_cbar @ Matrix.Diagonal(Vector((b_scale * 0.45, 0.008, b_scale * 0.14, 1.0))))

        # Left Vertical Upright (Tapered outward at top)
        mat_left = mat_b @ Matrix.Translation(Vector((-b_scale * 0.32, 0.005, 0.0))) @ Euler((0, math.radians(-10), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_hlogo, size=1.0, matrix=mat_left @ Matrix.Diagonal(Vector((b_scale * 0.14, 0.008, b_scale * 0.75, 1.0))))

        # Right Vertical Upright (Tapered outward at top)
        mat_right = mat_b @ Matrix.Translation(Vector((b_scale * 0.32, 0.005, 0.0))) @ Euler((0, math.radians(10), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_hlogo, size=1.0, matrix=mat_right @ Matrix.Diagonal(Vector((b_scale * 0.14, 0.008, b_scale * 0.75, 1.0))))

        # Top Crossbar Flares
        for fx in [-b_scale * 0.38, b_scale * 0.38]:
            mat_flare = mat_b @ Matrix.Translation(Vector((fx, 0.005, b_scale * 0.35)))
            bmesh.ops.create_cube(bm_hlogo, size=1.0, matrix=mat_flare @ Matrix.Diagonal(Vector((b_scale * 0.18, 0.008, b_scale * 0.10, 1.0))))

    obj_field = link_obj("GEO_S2K_Emblem_Red_Enamel_Fields", bm_field, parent_col, mats["badge_red"], bevel=0.0006)
    obj_hlogo = link_obj("GEO_S2K_Emblem_Raised_Chrome_H_Logos", bm_hlogo, parent_col, mats["chrome"], bevel=0.0004)

    objs.extend([obj_field, obj_hlogo])
    return objs

# ----------------------------------------------------------------------------
# 9. SUBSYSTEM 7: SCRIPTED CHROME "S2000" FRONT FENDER BADGES
# ----------------------------------------------------------------------------

def build_s2000_fender_script_badges(parent_col, mats):
    """
    Constructs the iconic chrome "S2000" model script badges on front fenders:
    - Left and right front quarter panels immediately behind wheel arches (X = +/- 0.865m, Y = +0.820m, Z = 0.680m).
    - Individual extruded chrome characters: 'S', '2', '0', '0', '0'.
    - Factory automotive adhesive mounting backing film.
    """
    objs = []
    bm_script = bmesh.new()

    for fx_sign in [-1.0, 1.0]:
        x_f = fx_sign * 0.865
        y_f = 0.820
        z_f = 0.680

        mat_f = Matrix.Translation(Vector((x_f, y_f, z_f))) @ Euler((0, 0, fx_sign * math.radians(-2)), 'XYZ').to_matrix().to_4x4()

        # Character Spacing along fender (Y from +0.870m to +0.760m)
        # Letter 'S' (Y = +0.050m)
        mat_s = mat_f @ Matrix.Translation(Vector((fx_sign * 0.003, 0.050, 0)))
        bmesh.ops.create_cube(bm_script, size=1.0, matrix=mat_s @ Matrix.Diagonal(Vector((0.004, 0.024, 0.026, 1.0))))

        # Numeral '2' (Y = +0.024m)
        mat_2 = mat_f @ Matrix.Translation(Vector((fx_sign * 0.003, 0.024, 0)))
        bmesh.ops.create_cube(bm_script, size=1.0, matrix=mat_2 @ Matrix.Diagonal(Vector((0.004, 0.022, 0.026, 1.0))))

        # Numeral '0' (First zero, Y = -0.002m)
        mat_0a = mat_f @ Matrix.Translation(Vector((fx_sign * 0.003, -0.002, 0)))
        bmesh.ops.create_cylinder(bm_script, radius=0.012, depth=0.004, segments=16, matrix=mat_0a @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # Numeral '0' (Second zero, Y = -0.026m)
        mat_0b = mat_f @ Matrix.Translation(Vector((fx_sign * 0.003, -0.026, 0)))
        bmesh.ops.create_cylinder(bm_script, radius=0.012, depth=0.004, segments=16, matrix=mat_0b @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # Numeral '0' (Third zero, Y = -0.050m)
        mat_0c = mat_f @ Matrix.Translation(Vector((fx_sign * 0.003, -0.050, 0)))
        bmesh.ops.create_cylinder(bm_script, radius=0.012, depth=0.004, segments=16, matrix=mat_0c @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_script = link_obj("GEO_S2K_Fender_S2000_Script_Badges", bm_script, parent_col, mats["chrome"], bevel=0.0004)
    objs.append(obj_script)
    return objs

# ----------------------------------------------------------------------------
# 10. SUBSYSTEM 8: HIGH-MOUNT THIRD LED CENTER BRAKE LAMP
# ----------------------------------------------------------------------------

def build_s2000_high_mount_third_brake_lamp(parent_col, mats):
    """
    Constructs the slim center high-mount stop lamp integrated into rear trunk lid:
    - Located along upper trailing edge of trunk lid (X = 0.0m, Y = -1.960m, Z = 0.815m).
    - Slim elongated dark polycarbonate housing (Width = 0.320m, Height = 0.022m).
    - 16 Individual high-intensity red LED diodes behind faceted ruby reflector optics.
    - Aerodynamic flush-mounted dark ruby red outer protective lens.
    """
    objs = []
    bm_chmsl_housing = bmesh.new()
    bm_chmsl_leds = bmesh.new()
    bm_chmsl_lens = bmesh.new()

    mat_chmsl = Matrix.Translation(Vector((0.0, -1.960, 0.815))) @ Euler((math.radians(14), 0, 0), 'XYZ').to_matrix().to_4x4()

    # 1. Beveled Housing Bezel in Trunk Deck
    bmesh.ops.create_cube(bm_chmsl_housing, size=1.0, matrix=mat_chmsl @ Matrix.Diagonal(Vector((0.340, 0.035, 0.028, 1.0))))

    # 2. 16 Red LED Emitter Diodes
    for ledi in range(16):
        x_led = -0.140 + ledi * 0.0186
        mat_led = mat_chmsl @ Matrix.Translation(Vector((x_led, -0.008, 0.0)))
        bmesh.ops.create_cylinder(bm_chmsl_leds, radius=0.004, depth=0.008, segments=10, matrix=mat_led @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 3. Outer Ruby Red Polycarbonate Protective Strip Lens
    mat_clens = mat_chmsl @ Matrix.Translation(Vector((0.0, -0.014, 0.0)))
    bmesh.ops.create_cube(bm_chmsl_lens, size=1.0, matrix=mat_clens @ Matrix.Diagonal(Vector((0.330, 0.010, 0.022, 1.0))))

    obj_chous = link_obj("GEO_S2K_CHMSL_ThirdBrake_Housing", bm_chmsl_housing, parent_col, mats["trim"], bevel=0.0006)
    obj_cleds = link_obj("GEO_S2K_CHMSL_LED_Diodes", bm_chmsl_leds, parent_col, mats["taillight_red"], bevel=0.0002)
    obj_clens = link_obj("GEO_S2K_CHMSL_Ruby_Lens", bm_chmsl_lens, parent_col, mats["taillight_red"], bevel=0.0004)

    objs.extend([obj_chous, obj_cleds, obj_clens])
    return objs
'''
