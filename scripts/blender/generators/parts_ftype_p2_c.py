"""
Jaguar F-Type V8 R Convertible (2010s) Phase 20: Part C
Subsystems 8 to 11:
- Subsystem 8: Rear 3D Chrome Jaguar Leaper (Prowling Cat) Decklid Emblem
- Subsystem 9: Rear Chrome "F-TYPE" Script & Multi-Color Enamel "R" Performance Badges
- Subsystem 10: High-Mount 24-LED Center Third Brake Lamp (CHMSL)
- Subsystem 11: Dual Articulated Windshield Wiper Arms & Aerodynamic Airfoils
"""

PART_FTYPE2_C = '''
# ----------------------------------------------------------------------------
# 10. SUBSYSTEM 8: REAR 3D CHROME JAGUAR LEAPER EMBLEM
# ----------------------------------------------------------------------------

def build_jaguar_ftype_rear_leaper_emblem(parent_col, mats):
    """
    Constructs the iconic Jaguar Leaper (prowling/leaping cat) rear emblem:
    - 3D high-relief mirror-chrome sculpture centered on rear decklid (X = 0.0m, Y = -2.060m, Z = 0.815m).
    - Muscular leaping feline body silhouette with extended front claws and streaming tail.
    - Conforms to rear decklid curve with beveled edges.
    """
    objs = []
    bm_leaper = bmesh.new()

    mat_leap = Matrix.Translation(Vector((0.0, -2.062, 0.815))) @ Euler((math.radians(-14), 0, 0), 'XYZ').to_matrix().to_4x4()

    # 1. Main Leaping Feline Torso Body (Length 110mm, angled forward)
    mat_torso = mat_leap @ Euler((0, math.radians(12), 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_leaper, size=1.0, matrix=mat_torso @ Matrix.Diagonal(Vector((0.080, 0.006, 0.018, 1.0))))

    # 2. Arched Feline Neck & Head with Ears
    mat_head = mat_leap @ Matrix.Translation(Vector((0.048, 0, 0.012))) @ Euler((0, math.radians(24), 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_leaper, size=1.0, matrix=mat_head @ Matrix.Diagonal(Vector((0.024, 0.005, 0.014, 1.0))))

    # 3. Extended Front Forelegs (Reaching forward in mid-leap)
    mat_flegs = mat_leap @ Matrix.Translation(Vector((0.055, 0, -0.008))) @ Euler((0, math.radians(45), 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_leaper, radius=0.004, depth=0.035, segments=8, matrix=mat_flegs)

    # 4. Powerful Hindquarters & Rear Legs (Tucked back)
    mat_rlegs = mat_leap @ Matrix.Translation(Vector((-0.038, 0, -0.008))) @ Euler((0, math.radians(-35), 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_leaper, radius=0.005, depth=0.038, segments=8, matrix=mat_rlegs)

    # 5. Flowing Arched Tail
    mat_tail = mat_leap @ Matrix.Translation(Vector((-0.052, 0, 0.012))) @ Euler((0, math.radians(65), 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_leaper, radius=0.0025, depth=0.036, segments=6, matrix=mat_tail)

    obj_leaper = link_obj("GEO_FTYPE_Rear_Chrome_Leaper_Badge", bm_leaper, parent_col, mats["chrome"], bevel=0.0005)
    objs.append(obj_leaper)
    return objs


# ----------------------------------------------------------------------------
# 11. SUBSYSTEM 9: "F-TYPE" SCRIPT & "R" PERFORMANCE BADGES
# ----------------------------------------------------------------------------

def build_jaguar_ftype_rear_script_and_r_badges(parent_col, mats):
    """
    Constructs the rear decklid model designation and high-performance badges:
    - Left side: Polished chrome individual letter block script "F - T Y P E" (X = -0.320m, Y = -2.040m, Z = 0.745m).
    - Right side: Multi-color enamel "R" badge (X = +0.320m, Y = -2.040m, Z = 0.745m).
    - "R" badge features split green/white/red enamel field and raised chrome block 'R'.
    """
    objs = []
    bm_script = bmesh.new()
    bm_rbadge = bmesh.new()
    bm_renamel = bmesh.new()

    # 1. "F-TYPE" Chrome Script (Left rear decklid)
    mat_ftype = Matrix.Translation(Vector((-0.320, -2.045, 0.748))) @ Euler((math.radians(-16), 0, 0), 'XYZ').to_matrix().to_4x4()
    # Letter Block Silhouette
    bmesh.ops.create_cube(bm_script, size=1.0, matrix=mat_ftype @ Matrix.Diagonal(Vector((0.140, 0.005, 0.022, 1.0))))

    # Individual Raised Chrome Letter Studs ('F', '-', 'T', 'Y', 'P', 'E')
    for l_i, l_off in enumerate([-0.055, -0.035, -0.015, 0.010, 0.035, 0.055]):
        mat_l = mat_ftype @ Matrix.Translation(Vector((l_off, -0.003, 0)))
        bmesh.ops.create_cube(bm_script, size=1.0, matrix=mat_l @ Matrix.Diagonal(Vector((0.016, 0.003, 0.018, 1.0))))

    # 2. "R" Performance Badge (Right rear decklid)
    mat_r = Matrix.Translation(Vector((0.320, -2.045, 0.748))) @ Euler((math.radians(-16), 0, 0), 'XYZ').to_matrix().to_4x4()

    # Outer Chrome Frame Bezel for "R"
    bmesh.ops.create_cube(bm_rbadge, size=1.0, matrix=mat_r @ Matrix.Diagonal(Vector((0.065, 0.006, 0.040, 1.0))))

    # Split Multi-Color Cloisonné Enamel Field (Green top, Red bottom)
    mat_egreen = mat_r @ Matrix.Translation(Vector((-0.012, -0.002, 0.008)))
    bmesh.ops.create_cube(bm_renamel, size=1.0, matrix=mat_egreen @ Matrix.Diagonal(Vector((0.035, 0.004, 0.018, 1.0))))

    mat_ered = mat_r @ Matrix.Translation(Vector((-0.012, -0.002, -0.008)))
    bmesh.ops.create_cube(bm_renamel, size=1.0, matrix=mat_ered @ Matrix.Diagonal(Vector((0.035, 0.004, 0.018, 1.0))))

    # Raised 3D Chrome 'R' Typography
    mat_rchar = mat_r @ Matrix.Translation(Vector((0.015, -0.004, 0)))
    bmesh.ops.create_cube(bm_rbadge, size=1.0, matrix=mat_rchar @ Matrix.Diagonal(Vector((0.024, 0.004, 0.032, 1.0))))

    obj_script = link_obj("GEO_FTYPE_FType_Chrome_Script", bm_script, parent_col, mats["chrome"], bevel=0.0004)
    obj_rbadge = link_obj("GEO_FTYPE_R_Badge_Chrome_Bezel", bm_rbadge, parent_col, mats["chrome"], bevel=0.0004)
    obj_renamel = link_obj("GEO_FTYPE_R_Badge_Enamel_Field", bm_renamel, parent_col, mats["badge_green"], bevel=0.0003)

    objs.extend([obj_script, obj_rbadge, obj_renamel])
    return objs


# ----------------------------------------------------------------------------
# 12. SUBSYSTEM 10: HIGH-MOUNT 24-LED THIRD CENTER BRAKE LAMP (CHMSL)
# ----------------------------------------------------------------------------

def build_jaguar_ftype_center_high_brake_lamp(parent_col, mats):
    """
    Constructs the sleek Center High-Mounted Stop Lamp (CHMSL):
    - Thin continuous red LED light strip integrated into the active spoiler trailing edge (X = 0.0m, Y = -1.985m, Z = 0.812m).
    - Array of 24 microscopic high-intensity ruby red surface-mount diodes.
    - Optical diffusing prism cover flush with rear decklid.
    """
    objs = []
    bm_chmsl_housing = bmesh.new()
    bm_chmsl_led = bmesh.new()

    mat_chmsl = Matrix.Translation(Vector((0.0, -1.988, 0.812))) @ Euler((math.radians(-10), 0, 0), 'XYZ').to_matrix().to_4x4()

    # 1. Dark Bezel Housing Recess
    bmesh.ops.create_cube(bm_chmsl_housing, size=1.0, matrix=mat_chmsl @ Matrix.Diagonal(Vector((0.440, 0.022, 0.016, 1.0))))

    # 2. Outer Ruby Red Diffuser Lens Strip
    mat_lens = mat_chmsl @ Matrix.Translation(Vector((0, -0.006, 0)))
    bmesh.ops.create_cube(bm_chmsl_led, size=1.0, matrix=mat_lens @ Matrix.Diagonal(Vector((0.420, 0.010, 0.010, 1.0))))

    # 3. 24 Individual High-Intensity Ruby LED Emitter Beads
    for led_i in range(24):
        led_x = (led_i - 11.5) * 0.0165
        mat_bead = mat_chmsl @ Matrix.Translation(Vector((led_x, 0, 0)))
        bmesh.ops.create_cylinder(bm_chmsl_led, radius=0.003, depth=0.006, segments=8, matrix=mat_bead @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_chmsl_h = link_obj("GEO_FTYPE_CHMSL_Bezel_Housing", bm_chmsl_housing, parent_col, mats["piano_black"], bevel=0.0005)
    obj_chmsl_l = link_obj("GEO_FTYPE_CHMSL_Ruby_LED_Array", bm_chmsl_led, parent_col, mats["taillight_red"], bevel=0.0003)

    objs.extend([obj_chmsl_h, obj_chmsl_l])
    return objs


# ----------------------------------------------------------------------------
# 13. SUBSYSTEM 11: ARTICULATED WINDSHIELD WIPER ARMS & AERO FOILS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_aerodynamic_wipers(parent_col, mats):
    """
    Constructs the high-speed aerodynamic pantograph windshield wipers:
    - Left (driver) and right (passenger) articulated steel wiper arms seated in cowl trough (Y = +0.760m).
    - Integrated aerodynamic spoiler airfoils preventing wiper blade lift at 186 mph.
    - Flexible silicone rubber wiper squeegee blade refills conforming to windshield curvature.
    - Chrome spindle pivot nut covers and cowl drainage grille slots.
    """
    objs = []
    bm_wipers = bmesh.new()
    bm_blades = bmesh.new()

    wiper_configs = [
        # Arm,      Spindle_X, Spindle_Y, Spindle_Z, Angle,  Blade_L
        ("Driver",   -0.420,    0.755,     0.815,     -18.0,  0.580),
        ("Pass",      0.150,    0.765,     0.812,     -14.0,  0.520),
    ]

    for name, sx, sy, sz, ang, bl_len in wiper_configs:
        mat_spindle = Matrix.Translation(Vector((sx, sy, sz)))

        # 1. Spindle Pivot Nut Cap & Base Knuckle
        bmesh.ops.create_cylinder(bm_wipers, radius=0.016, depth=0.025, segments=14, matrix=mat_spindle)

        # 2. Articulated Spring-Loaded Primary Arm (Extending up toward glass)
        p1 = Vector((sx, sy, sz + 0.015))
        p2 = Vector((sx + math.cos(math.radians(ang)) * 0.220, sy - 0.080, sz + 0.090))
        mid_arm = (p1 + p2) * 0.5
        mat_arm = Matrix.Translation(mid_arm) @ Vector((0, 0, 1)).rotation_difference(p2 - p1).to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_wipers, size=1.0, matrix=mat_arm @ Matrix.Diagonal(Vector((0.018, 0.012, (p2 - p1).length, 1.0))))

        # 3. Aerodynamic Wind Deflector Foil (Mounted along wiper blade spine)
        mid_blade = Vector((sx + math.cos(math.radians(ang)) * 0.350, sy - 0.140, sz + 0.160))
        mat_bspine = Matrix.Translation(mid_blade) @ Euler((math.radians(35), 0, math.radians(ang)), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_wipers, size=1.0, matrix=mat_bspine @ Matrix.Diagonal(Vector((0.016, bl_len, 0.024, 1.0))))

        # 4. Flexible Silicone Squeegee Rubber Blade (In contact with windshield glass)
        mat_sq = mat_bspine @ Matrix.Translation(Vector((0, 0, -0.014)))
        bmesh.ops.create_cube(bm_blades, size=1.0, matrix=mat_sq @ Matrix.Diagonal(Vector((0.004, bl_len * 0.98, 0.010, 1.0))))

    obj_wipers = link_obj("GEO_FTYPE_Wiper_Arms_and_Foils", bm_wipers, parent_col, mats["trim"], bevel=0.0008)
    obj_blades = link_obj("GEO_FTYPE_Wiper_Rubber_Blades", bm_blades, parent_col, mats["trim"], bevel=0.0004)

    objs.extend([obj_wipers, obj_blades])
    return objs
'''
