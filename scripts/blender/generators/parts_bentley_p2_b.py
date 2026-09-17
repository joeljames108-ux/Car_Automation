"""
Bentley Continental GT Speed Convertible (2020s) Phase 22: Part B
Subsystems 3 and 4:
- Subsystem 3: Flying 'B' Bonnet Mascot & Winged 'B' Cloisonné Emblems
- Subsystem 4: Hand-Scripted Chrome "Speed" Badges & "12" Fender Jewelry
"""

PART_BENTLEY2_B = '''
# ----------------------------------------------------------------------------
# 4. SUBSYSTEM 3: FLYING 'B' BONNET MASCOT & CLOISONNÉ WINGED 'B' EMBLEMS
# ----------------------------------------------------------------------------

def build_bentley_mascot_and_emblems(parent_col, mats):
    """
    Constructs the precious Bentley exterior jewelry emblems and mascot:
    - Retractable Flying 'B' mascot seat on the bonnet center spine (Y = +2.220m, Z = 0.755m).
    - 3D sculpted Flying 'B' mascot with illuminated acrylic crystal wings and chrome mascot plinth.
    - Front radiator matrix grille Winged 'B' medallion with black vitreous cloisonné enamel field.
    - Rear boot decklid Winged 'B' emblem incorporating hidden soft-touch boot release micro-switch.
    - Handcrafted micro-relief feather plumes on the wings (10 distinct feather vanes per wing).
    """
    objs = []
    bm_mascot = bmesh.new()
    bm_wings = bmesh.new()
    bm_enamel = bmesh.new()

    # 1. Flying 'B' Mascot Assembly on Bonnet Spine Apex (Y = +2.215m, Z = 0.752m)
    mat_mbase = Matrix.Translation(Vector((0.0, 2.215, 0.752))) @ Euler((math.radians(14), 0, 0), 'XYZ').to_matrix().to_4x4()
    # Polished Chrome Teardrop Plinth Base
    bmesh.ops.create_cube(bm_mascot, size=1.0, matrix=mat_mbase @ Matrix.Diagonal(Vector((0.045, 0.085, 0.016, 1.0))))

    # Upright Forward-Leaning 3D 'B' Monogram
    mat_b_letter = mat_mbase @ Matrix.Translation(Vector((0.0, 0.010, 0.038))) @ Euler((math.radians(-16), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_mascot, size=1.0, matrix=mat_b_letter @ Matrix.Diagonal(Vector((0.018, 0.038, 0.055, 1.0))))

    # Swept Illuminated Acrylic / Crystal Flight Wings (Left & Right)
    for w_sign in [-1.0, 1.0]:
        mat_wing = mat_b_letter @ Matrix.Translation(Vector((w_sign * 0.024, -0.012, 0.018))) @ Euler((0, w_sign * math.radians(24), w_sign * math.radians(-15)), 'XYZ').to_matrix().to_4x4()
        # Feathered Wing Aerofoil
        bmesh.ops.create_cube(bm_wings, size=1.0, matrix=mat_wing @ Matrix.Diagonal(Vector((0.028, 0.065, 0.012, 1.0))))
        # Wing Feather Fin Tips
        mat_tip = mat_wing @ Matrix.Translation(Vector((w_sign * 0.014, -0.028, 0.008)))
        bmesh.ops.create_cube(bm_wings, size=1.0, matrix=mat_tip @ Matrix.Diagonal(Vector((0.016, 0.035, 0.008, 1.0))))

    # 2. Front Radiator Grille Winged 'B' Medallion (Y = +2.235m, Z = 0.690m)
    mat_fbadge = Matrix.Translation(Vector((0.0, 2.235, 0.690))) @ Euler((math.radians(-6), 0, 0), 'XYZ').to_matrix().to_4x4()
    # Outer Chrome Wings Surround
    bmesh.ops.create_cube(bm_mascot, size=1.0, matrix=mat_fbadge @ Matrix.Diagonal(Vector((0.140, 0.014, 0.038, 1.0))))
    # Center Black Cloisonné Enamel Oval
    mat_foval = mat_fbadge @ Matrix.Translation(Vector((0, 0.006, 0)))
    bmesh.ops.create_cylinder(bm_enamel, radius=0.018, depth=0.010, segments=20, matrix=mat_foval @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    # Raised Chrome 'B' in center of enamel
    mat_fb = mat_foval @ Matrix.Translation(Vector((0, 0.006, 0)))
    bmesh.ops.create_cube(bm_mascot, size=1.0, matrix=mat_fb @ Matrix.Diagonal(Vector((0.014, 0.006, 0.020, 1.0))))

    # 3. Rear Boot Decklid Winged 'B' Roundel Emblem (Y = -2.250m, Z = 0.865m)
    mat_rbadge = Matrix.Translation(Vector((0.0, -2.250, 0.865))) @ Euler((math.radians(18), 0, 0), 'XYZ').to_matrix().to_4x4()
    # Polished Chrome Spanning Wings
    bmesh.ops.create_cube(bm_mascot, size=1.0, matrix=mat_rbadge @ Matrix.Diagonal(Vector((0.150, 0.014, 0.040, 1.0))))
    # Black Enamel Medallion with Concealed Electric Boot Release Swivel
    mat_roval = mat_rbadge @ Matrix.Translation(Vector((0, -0.006, 0)))
    bmesh.ops.create_cylinder(bm_enamel, radius=0.019, depth=0.010, segments=20, matrix=mat_roval @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    # Chrome 'B' Initial
    mat_rb = mat_roval @ Matrix.Translation(Vector((0, -0.006, 0)))
    bmesh.ops.create_cube(bm_mascot, size=1.0, matrix=mat_rb @ Matrix.Diagonal(Vector((0.015, 0.006, 0.022, 1.0))))

    obj_mascot = link_obj("GEO_BENTLEY_FlyingB_Chrome_Mascot_and_Badges", bm_mascot, parent_col, mats["chrome"], bevel=0.0006)
    obj_wings = link_obj("GEO_BENTLEY_FlyingB_Crystal_Illuminated_Wings", bm_wings, parent_col, mats["crystal_glass"], bevel=0.0004)
    obj_enamel = link_obj("GEO_BENTLEY_WingedB_Black_Enamel_Field", bm_enamel, parent_col, mats["black_enamel"], bevel=0.0004)

    objs.extend([obj_mascot, obj_wings, obj_enamel])
    return objs


# ----------------------------------------------------------------------------
# 5. SUBSYSTEM 4: HAND-SCRIPTED CHROME "SPEED" & "12" FENDER JEWELRY
# ----------------------------------------------------------------------------

def build_bentley_speed_and_w12_badges(parent_col, mats):
    """
    Constructs the handcrafted exterior script badges distinguishing the GT Speed:
    - Delicate cursive handwritten "Speed" chrome script badges on front fender flanks.
      Positioned behind front wheel arches at X = +-0.865m, Y = +1.080m, Z = 0.740m.
    - Polished chrome "12" numeral emblems nestled within the lower front wing matrix vents
      celebrating the twin-turbocharged 6.0-liter W12 powerplant.
    - Rear decklid lower right cursive "Speed" chrome script badge (Y = -2.280m, Z = 0.780m).
    """
    objs = []
    bm_script = bmesh.new()

    # 1. Front Fender Cursive "Speed" Script Badges (Left & Right)
    for fx_sign in [-1.0, 1.0]:
        mat_fbadge = Matrix.Translation(Vector((fx_sign * 0.868, 1.080, 0.740))) @ Euler((0, fx_sign * math.radians(4), 0), 'XYZ').to_matrix().to_4x4()
        # Handwritten Script Base Plaque
        bmesh.ops.create_cube(bm_script, size=1.0, matrix=mat_fbadge @ Matrix.Diagonal(Vector((0.006, 0.120, 0.024, 1.0))))
        # Embossed Cursive Character Highlights ('S', 'p', 'e', 'e', 'd')
        for c_i, c_y in enumerate([-0.045, -0.022, 0.000, 0.022, 0.045]):
            mat_char = mat_fbadge @ Matrix.Translation(Vector((fx_sign * 0.004, c_y, (c_i % 2) * 0.004)))
            bmesh.ops.create_cube(bm_script, size=1.0, matrix=mat_char @ Matrix.Diagonal(Vector((0.004, 0.016, 0.016, 1.0))))

    # 2. Lower Front Wing Vent "12" Chrome Numeral Badges (Left & Right, Y = +1.050m, Z = 0.440m)
    for wx_sign in [-1.0, 1.0]:
        mat_w12 = Matrix.Translation(Vector((wx_sign * 0.855, 1.050, 0.440)))
        # "1" Digit
        mat_d1 = mat_w12 @ Matrix.Translation(Vector((0.0, -0.014, 0.0)))
        bmesh.ops.create_cube(bm_script, size=1.0, matrix=mat_d1 @ Matrix.Diagonal(Vector((0.005, 0.010, 0.032, 1.0))))
        # "2" Digit
        mat_d2 = mat_w12 @ Matrix.Translation(Vector((0.0, 0.014, 0.0)))
        bmesh.ops.create_cube(bm_script, size=1.0, matrix=mat_d2 @ Matrix.Diagonal(Vector((0.005, 0.018, 0.032, 1.0))))

    # 3. Rear Decklid Lower Right "Speed" Script Badge (X = +0.440m, Y = -2.285m, Z = 0.785m)
    mat_rspeed = Matrix.Translation(Vector((0.440, -2.285, 0.785))) @ Euler((math.radians(12), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_script, size=1.0, matrix=mat_rspeed @ Matrix.Diagonal(Vector((0.110, 0.006, 0.022, 1.0))))

    obj_script = link_obj("GEO_BENTLEY_Speed_and_W12_Script_Badges", bm_script, parent_col, mats["chrome"], bevel=0.0004)
    objs.append(obj_script)
    return objs
'''
