"""
Bentley Continental GT Speed Convertible (2020s) Phase 22: Part Extra 3
Subsystems 13 and 14:
- Subsystem 13: Stamped British Registration Number Plates & LED Illuminators
- Subsystem 14: Interior Frameless Rearview Mirror, ADAS Cameras & HUD Well
"""

PART_BENTLEY2_EXTRA3 = '''
# ----------------------------------------------------------------------------
# 14. SUBSYSTEM 13: STAMPED BRITISH NUMBER PLATES & LED ILLUMINATORS
# ----------------------------------------------------------------------------

def build_bentley_license_plates(parent_col, mats):
    """
    Constructs the legal British registration number plates and illumination:
    - Front 520x111mm white reflective acrylic plate mounted on bumper plinth (Y = +2.285m, Z = 0.380m).
    - Rear 520x111mm yellow reflective acrylic plate recessed in trunk lid apron (Y = -2.335m, Z = 0.540m).
    - High-gloss black perimeter mounting plinth frames with anti-vibration rubber backings.
    - Dual white LED number plate downlighters integrated into rear license plate pocket overhang.
    """
    objs = []
    bm_fplate = bmesh.new()
    bm_rplate = bmesh.new()
    bm_plinth = bmesh.new()
    bm_leds = bmesh.new()

    # 1. Front Registration Plate (White Reflective Acrylic, Y = +2.285m, Z = 0.380m)
    mat_fplate = Matrix.Translation(Vector((0.0, 2.285, 0.380)))
    # Black Mounting Plinth Frame
    bmesh.ops.create_cube(bm_plinth, size=1.0, matrix=mat_fplate @ Matrix.Diagonal(Vector((0.530, 0.016, 0.120, 1.0))))
    # White Reflective Plate Face
    mat_f_face = mat_fplate @ Matrix.Translation(Vector((0, 0.008, 0)))
    bmesh.ops.create_cube(bm_fplate, size=1.0, matrix=mat_f_face @ Matrix.Diagonal(Vector((0.520, 0.006, 0.111, 1.0))))

    # 2. Rear Registration Plate (Yellow Reflective Acrylic, Y = -2.335m, Z = 0.540m)
    mat_rplate = Matrix.Translation(Vector((0.0, -2.335, 0.540))) @ Euler((math.radians(8), 0, 0), 'XYZ').to_matrix().to_4x4()
    # Black Mounting Escutcheon Plinth
    bmesh.ops.create_cube(bm_plinth, size=1.0, matrix=mat_rplate @ Matrix.Diagonal(Vector((0.535, 0.016, 0.124, 1.0))))
    # Yellow Reflective Plate Face
    mat_r_face = mat_rplate @ Matrix.Translation(Vector((0, -0.008, 0)))
    bmesh.ops.create_cube(bm_rplate, size=1.0, matrix=mat_r_face @ Matrix.Diagonal(Vector((0.520, 0.006, 0.111, 1.0))))

    # 3. Dual White LED Number Plate Downlighters (Overhang above rear plate, Y = -2.320m, Z = 0.615m)
    for lx_sign in [-1.0, 1.0]:
        mat_led = Matrix.Translation(Vector((lx_sign * 0.140, -2.320, 0.615)))
        bmesh.ops.create_cube(bm_leds, size=1.0, matrix=mat_led @ Matrix.Diagonal(Vector((0.035, 0.018, 0.010, 1.0))))

    obj_fplate = link_obj("GEO_BENTLEY_Front_License_Plate", bm_fplate, parent_col, mats["plate_white"], bevel=0.0004)
    obj_rplate = link_obj("GEO_BENTLEY_Rear_License_Plate", bm_rplate, parent_col, mats["plate_yellow"], bevel=0.0004)
    obj_plinth = link_obj("GEO_BENTLEY_License_Plate_Plinths", bm_plinth, parent_col, mats["trim_black"], bevel=0.0005)
    obj_leds = link_obj("GEO_BENTLEY_NumberPlate_LED_Downlighters", bm_leds, parent_col, mats["led_drl"], bevel=0.0003)

    objs.extend([obj_fplate, obj_rplate, obj_plinth, obj_leds])
    return objs


# ----------------------------------------------------------------------------
# 15. SUBSYSTEM 14: INTERIOR FRAMELESS MIRROR, ADAS CAMERAS & HUD WELL
# ----------------------------------------------------------------------------

def build_bentley_interior_mirror_and_adas(parent_col, mats):
    """
    Constructs interior windshield optical sensors and heads-up display:
    - Frameless electrochromic interior rearview mirror suspended from windshield top.
    - Dual forward-facing ADAS stereo vision optical cameras inside the windshield frit mask.
    - Rain and ambient sunlight optical sensor prism module adhered to glass.
    - Dashboard upper cowl Heads-Up Display (HUD) projection aperture well.
    """
    objs = []
    bm_mirror = bmesh.new()
    bm_glass = bmesh.new()
    bm_adas = bmesh.new()
    bm_hud = bmesh.new()

    # 1. Frameless Interior Rearview Mirror (Windshield top center, Y = +0.220m, Z = 1.340m)
    mat_mbase = Matrix.Translation(Vector((0.0, 0.220, 1.340)))
    # Polished Aluminum Mounting Stalk to Windshield Header
    mat_mstalk = mat_mbase @ Matrix.Translation(Vector((0, 0.025, 0.025)))
    bmesh.ops.create_cylinder(bm_mirror, radius=0.010, depth=0.055, segments=12, matrix=mat_mstalk @ Euler((math.radians(35), 0, 0), 'XYZ').to_matrix().to_4x4())

    # Frameless Mirror Glass Bevel Body (220mm x 65mm)
    mat_mbody = mat_mbase @ Euler((math.radians(-12), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_mirror, size=1.0, matrix=mat_mbody @ Matrix.Diagonal(Vector((0.220, 0.012, 0.065, 1.0))))
    # Electrochromic First-Surface Reflective Glass Face
    mat_mface = mat_mbody @ Matrix.Translation(Vector((0, -0.006, 0)))
    bmesh.ops.create_cube(bm_glass, size=1.0, matrix=mat_mface @ Matrix.Diagonal(Vector((0.215, 0.004, 0.060, 1.0))))

    # 2. ADAS Stereo Vision Camera Housing Pod (Black frit zone on glass, Y = +0.280m, Z = 1.350m)
    mat_adas = Matrix.Translation(Vector((0.0, 0.280, 1.350)))
    bmesh.ops.create_cube(bm_adas, size=1.0, matrix=mat_adas @ Matrix.Diagonal(Vector((0.180, 0.060, 0.045, 1.0))))

    # Dual Stereo Optical Camera Lenses (Left & Right)
    for cam_sign in [-1.0, 1.0]:
        mat_cam = mat_adas @ Matrix.Translation(Vector((cam_sign * 0.055, 0.032, -0.005)))
        bmesh.ops.create_cylinder(bm_glass, radius=0.008, depth=0.008, segments=12, matrix=mat_cam @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 3. Dashboard Heads-Up Display (HUD) Optical Well (Driver side dash top, X = -0.420m, Y = +0.480m, Z = 0.820m)
    mat_hud = Matrix.Translation(Vector((-0.420, 0.480, 0.820)))
    # Recessed Projection Well
    bmesh.ops.create_cube(bm_hud, size=1.0, matrix=mat_hud @ Matrix.Diagonal(Vector((0.180, 0.130, 0.035, 1.0))))
    # Anti-Reflective Angled Combiner Glass Cover
    mat_hglass = mat_hud @ Matrix.Translation(Vector((0, 0, 0.012))) @ Euler((math.radians(-14), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_glass, size=1.0, matrix=mat_hglass @ Matrix.Diagonal(Vector((0.170, 0.120, 0.004, 1.0))))

    obj_mirror = link_obj("GEO_BENTLEY_Interior_Frameless_Mirror_Body", bm_mirror, parent_col, mats["trim_black"], bevel=0.0006)
    obj_glass = link_obj("GEO_BENTLEY_Interior_Mirror_Optical_Glass", bm_glass, parent_col, mats["mirror_glass"], bevel=0.0003)
    obj_adas = link_obj("GEO_BENTLEY_ADAS_Stereo_Camera_Pod", bm_adas, parent_col, mats["trim_black"], bevel=0.0005)
    obj_hud = link_obj("GEO_BENTLEY_Dashboard_HUD_Projection_Well", bm_hud, parent_col, mats["piano_black"], bevel=0.0005)

    objs.extend([obj_mirror, obj_glass, obj_adas, obj_hud])
    return objs
'''
