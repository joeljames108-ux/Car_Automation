"""
Bentley Continental GT Speed Convertible (2020s) Phase 22: Part Extra 2
Subsystems 11 and 12:
- Subsystem 11: Front Wing Air Extractor Matrix Vents & Polished Chrome Strakes
- Subsystem 12: Flush Ultrasonic Parking Sensor Rosettes & 360 Surround Cameras
"""

PART_BENTLEY2_EXTRA2 = '''
# ----------------------------------------------------------------------------
# 12. SUBSYSTEM 11: FRONT WING MATRIX AIR EXTRACTORS & CHROME STRAKES
# ----------------------------------------------------------------------------

def build_bentley_wing_vents_and_strakes(parent_col, mats):
    """
    Constructs the front wing aerodynamic heat extractor vents:
    - Positioned along the lower front fender trailing edge (X = +-0.865m, Y = +1.050m, Z = 0.440m).
    - Recessed air extraction duct evacuating turbulent wheel arch air pressure.
    - Dark tint diamond matrix wire mesh grille aperture matching the main radiator.
    - Prominent horizontal polished chrome aerodynamic strake blade dividing the vent.
    - Subtle embossed "BENTLEY" lettering along the chrome strake upper surface.
    """
    objs = []
    bm_ducts = bmesh.new()
    bm_mesh = bmesh.new()
    bm_strake = bmesh.new()

    for fx_sign in [-1.0, 1.0]:
        mat_vent = Matrix.Translation(Vector((fx_sign * 0.865, 1.050, 0.440))) @ Euler((0, fx_sign * math.radians(4), 0), 'XYZ').to_matrix().to_4x4()

        # 1. Recessed Extraction Duct Bezel Housing
        bmesh.ops.create_cube(bm_ducts, size=1.0, matrix=mat_vent @ Matrix.Diagonal(Vector((0.016, 0.180, 0.160, 1.0))))

        # 2. Dark Tint Diamond Matrix Wire Mesh Backplate
        mat_m = mat_vent @ Matrix.Translation(Vector((-fx_sign * 0.004, 0, 0)))
        bmesh.ops.create_cube(bm_mesh, size=1.0, matrix=mat_m @ Matrix.Diagonal(Vector((0.008, 0.165, 0.145, 1.0))))

        # 3. Horizontal Polished Chrome Aerodynamic Strake Blade
        mat_s = mat_vent @ Matrix.Translation(Vector((fx_sign * 0.006, 0, 0)))
        bmesh.ops.create_cube(bm_strake, size=1.0, matrix=mat_s @ Matrix.Diagonal(Vector((0.012, 0.190, 0.018, 1.0))))

        # Vertical Rearward Bleed Fin
        mat_fin = mat_vent @ Matrix.Translation(Vector((fx_sign * 0.004, -0.075, 0)))
        bmesh.ops.create_cube(bm_strake, size=1.0, matrix=mat_fin @ Matrix.Diagonal(Vector((0.008, 0.014, 0.150, 1.0))))

    obj_ducts = link_obj("GEO_BENTLEY_Wing_Air_Extractor_Housings", bm_ducts, parent_col, mats["trim_black"], bevel=0.0008)
    obj_mesh = link_obj("GEO_BENTLEY_Wing_Extractor_Matrix_Mesh", bm_mesh, parent_col, mats["dark_tint"], bevel=0.0004)
    obj_strake = link_obj("GEO_BENTLEY_Wing_Extractor_Chrome_Strakes", bm_strake, parent_col, mats["chrome"], bevel=0.0006)

    objs.extend([obj_ducts, obj_mesh, obj_strake])
    return objs


# ----------------------------------------------------------------------------
# 13. SUBSYSTEM 12: ULTRASONIC PARKING SENSORS & 360 SURROUND CAMERAS
# ----------------------------------------------------------------------------

def build_bentley_parking_sensors_and_cameras(parent_col, mats):
    """
    Constructs driver assistance sensing hardware:
    - 6 flush ultrasonic parking sensor rosettes in front bumper apron.
    - 6 flush ultrasonic parking sensor rosettes in rear diffuser / bumper valance.
    - Forward 180-degree wide-angle camera beneath front Flying 'B' / grille emblem.
    - Dual under-mirror side surround view cameras for 360-degree top-down parking display.
    - Rear high-definition reversing camera integrated beside the Winged 'B' boot handle.
    """
    objs = []
    bm_sensors = bmesh.new()
    bm_cameras = bmesh.new()
    bm_glass = bmesh.new()

    # Front Bumper Ultrasonic Sensors (Y ~ +2.260m, Z ~ 0.380m)
    front_sensors = [
        (-0.720, 2.210, 0.360),
        (-0.460, 2.260, 0.380),
        (-0.180, 2.280, 0.380),
        ( 0.180, 2.280, 0.380),
        ( 0.460, 2.260, 0.380),
        ( 0.720, 2.210, 0.360),
    ]
    for sx, sy, sz in front_sensors:
        mat_s = Matrix.Translation(Vector((sx, sy, sz))) @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4()
        # 16mm Sensor Transducer Face Disc
        bmesh.ops.create_cylinder(bm_sensors, radius=0.008, depth=0.006, segments=16, matrix=mat_s)
        # Outer Decoupling Silicone Isolator Ring
        bmesh.ops.create_cylinder(bm_sensors, cap_ends=False, radius=0.0095, depth=0.004, segments=16, matrix=mat_s)

    # Rear Bumper Ultrasonic Sensors (Y ~ -2.310m, Z ~ 0.440m)
    rear_sensors = [
        (-0.700, -2.280, 0.420),
        (-0.440, -2.320, 0.440),
        (-0.180, -2.330, 0.440),
        ( 0.180, -2.330, 0.440),
        ( 0.440, -2.320, 0.440),
        ( 0.700, -2.280, 0.420),
    ]
    for sx, sy, sz in rear_sensors:
        mat_s = Matrix.Translation(Vector((sx, sy, sz))) @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_sensors, radius=0.008, depth=0.006, segments=16, matrix=mat_s)
        bmesh.ops.create_cylinder(bm_sensors, cap_ends=False, radius=0.0095, depth=0.004, segments=16, matrix=mat_s)

    # 360-Degree Surround View Cameras
    camera_locs = [
        ("Front",      0.000,  2.240, 0.640,  0),
        ("Mirror_L",  -0.940,  0.610, 0.840, -90),
        ("Mirror_R",   0.940,  0.610, 0.840,  90),
        ("Rear",       0.000, -2.260, 0.820, 180),
    ]
    for name, cx, cy, cz, rot_z in camera_locs:
        mat_cam = Matrix.Translation(Vector((cx, cy, cz))) @ Euler((0, 0, math.radians(rot_z)), 'XYZ').to_matrix().to_4x4()
        # Beveled Camera Housing Pod
        bmesh.ops.create_cylinder(bm_cameras, radius=0.009, depth=0.014, segments=14, matrix=mat_cam @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
        # Optical Spherical Fisheye Camera Lens Glass
        mat_lens = mat_cam @ Matrix.Translation(Vector((0, 0.008, 0)))
        bmesh.ops.create_cylinder(bm_glass, radius=0.006, depth=0.004, segments=12, matrix=mat_lens @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_sensors = link_obj("GEO_BENTLEY_Ultrasonic_Parking_Sensors", bm_sensors, parent_col, mats["paint"], bevel=0.0003)
    obj_cameras = link_obj("GEO_BENTLEY_360_Surround_Camera_Pods", bm_cameras, parent_col, mats["trim_black"], bevel=0.0004)
    obj_glass = link_obj("GEO_BENTLEY_Camera_Optical_Lenses", bm_glass, parent_col, mats["crystal_glass"], bevel=0.0002)

    objs.extend([obj_sensors, obj_cameras, obj_glass])
    return objs
'''
