"""
Jaguar F-Type V8 R Convertible (2010s) Phase 20: Part D
Subsystems 12 to 15:
- Subsystem 12: High-Pressure Headlamp Washer Jets & Hood Spray Nozzles
- Subsystem 13: Front & Rear Stamped License Plates & LED Illuminators
- Subsystem 14: Rear Bumper Red Corner Reflex Reflectors
- Subsystem 15: Interior Auto-Dimming Rearview Mirror & ADAS Camera
"""

PART_FTYPE2_D = '''
# ----------------------------------------------------------------------------
# 14. SUBSYSTEM 12: HEADLAMP WASHER JETS & HOOD SPRAY NOZZLES
# ----------------------------------------------------------------------------

def build_jaguar_ftype_washer_nozzles(parent_col, mats):
    """
    Constructs high-pressure fluid washer hardware:
    - Left and right pop-up telescopic headlamp washer jet covers on front bumper (X = +/- 0.650m, Y = +2.050m, Z = 0.520m).
    - Clamshell hood fluid spray jets with twin fluid misting nozzles.
    """
    objs = []
    bm_jets = bmesh.new()

    # 1. Front Bumper Pop-Up Headlamp Washer Jet Caps
    for wx_sign in [-1.0, 1.0]:
        mat_wcap = Matrix.Translation(Vector((wx_sign * 0.650, 2.050, 0.520))) @ Euler((math.radians(16), wx_sign * math.radians(-10), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_jets, size=1.0, matrix=mat_wcap @ Matrix.Diagonal(Vector((0.045, 0.035, 0.008, 1.0))))

    # 2. Clamshell Hood Windshield Washer Spray Nozzles (Tucked near cowl: Y = +0.820m, Z = 0.810m)
    for hx_sign in [-1.0, 1.0]:
        mat_jet = Matrix.Translation(Vector((hx_sign * 0.380, 0.820, 0.810)))
        bmesh.ops.create_cylinder(bm_jets, radius=0.008, depth=0.012, segments=10, matrix=mat_jet)

    obj_jets = link_obj("GEO_FTYPE_Washer_Nozzles_and_Caps", bm_jets, parent_col, mats["body"], bevel=0.0005)
    objs.append(obj_jets)
    return objs


# ----------------------------------------------------------------------------
# 15. SUBSYSTEM 13: STAMPED LICENSE PLATES & LED ILLUMINATORS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_license_plates(parent_col, mats):
    """
    Constructs front and rear stamped license plates and illumination:
    - Front license plate plinth centered below main grille crossbar (X = 0.0m, Y = +2.185m, Z = 0.390m).
    - Rear license plate recess between dual exhaust outlets (X = 0.0m, Y = -2.085m, Z = 0.440m).
    - Stamped aluminum plates with embossed typography, chrome mounting frame, and white LED illuminator pods.
    """
    objs = []
    bm_plates = bmesh.new()
    bm_frames = bmesh.new()
    bm_leds = bmesh.new()

    # 1. Front European/UK License Plate (Width 520mm, Height 111mm)
    mat_fplate = Matrix.Translation(Vector((0.0, 2.185, 0.390))) @ Euler((math.radians(8), 0, 0), 'XYZ').to_matrix().to_4x4()
    # Stamped Metal Plate
    bmesh.ops.create_cube(bm_plates, size=1.0, matrix=mat_fplate @ Matrix.Diagonal(Vector((0.520, 0.004, 0.111, 1.0))))
    # Chrome Outer Mounting Frame
    bmesh.ops.create_cube(bm_frames, size=1.0, matrix=mat_fplate @ Matrix.Diagonal(Vector((0.535, 0.008, 0.125, 1.0))))

    # 2. Rear Stamped License Plate (Between quad exhaust pairs)
    mat_rplate = Matrix.Translation(Vector((0.0, -2.085, 0.440))) @ Euler((math.radians(-14), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_plates, size=1.0, matrix=mat_rplate @ Matrix.Diagonal(Vector((0.520, 0.004, 0.111, 1.0))))
    bmesh.ops.create_cube(bm_frames, size=1.0, matrix=mat_rplate @ Matrix.Diagonal(Vector((0.535, 0.008, 0.125, 1.0))))

    # Dual White LED License Plate Illuminator Pods (Above rear plate)
    for lx_sign in [-1.0, 1.0]:
        mat_led = mat_rplate @ Matrix.Translation(Vector((lx_sign * 0.160, -0.015, 0.075)))
        bmesh.ops.create_cube(bm_leds, size=1.0, matrix=mat_led @ Matrix.Diagonal(Vector((0.045, 0.015, 0.012, 1.0))))

    obj_plates = link_obj("GEO_FTYPE_Stamped_License_Plates", bm_plates, parent_col, mats["chrome"], bevel=0.0005)
    obj_frames = link_obj("GEO_FTYPE_License_Plate_Frames", bm_frames, parent_col, mats["piano_black"], bevel=0.0005)
    obj_leds = link_obj("GEO_FTYPE_License_Plate_LED_Lamps", bm_leds, parent_col, mats["drl_white"], bevel=0.0003)

    objs.extend([obj_plates, obj_frames, obj_leds])
    return objs


# ----------------------------------------------------------------------------
# 16. SUBSYSTEM 14: REAR BUMPER RED CORNER REFLEX REFLECTORS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_rear_reflex_reflectors(parent_col, mats):
    """
    Constructs the rear bumper aerodynamic corner reflex reflectors:
    - Left and right slim vertical ruby red prismatic reflectors mounted in rear bumper corners.
    - Faceted internal micro-prisms reflecting trailing headlights.
    """
    objs = []
    bm_refl = bmesh.new()

    for rx_sign in [-1.0, 1.0]:
        mat_ref = Matrix.Translation(Vector((rx_sign * 0.760, -2.010, 0.420))) @ Euler((math.radians(-12), rx_sign * math.radians(15), 0), 'XYZ').to_matrix().to_4x4()
        # Slim Vertical Ruby Reflector
        bmesh.ops.create_cube(bm_refl, size=1.0, matrix=mat_ref @ Matrix.Diagonal(Vector((0.018, 0.008, 0.095, 1.0))))

    obj_refl = link_obj("GEO_FTYPE_Rear_Corner_Reflectors", bm_refl, parent_col, mats["taillight_red"], bevel=0.0004)
    objs.append(obj_refl)
    return objs


# ----------------------------------------------------------------------------
# 17. SUBSYSTEM 15: INTERIOR REARVIEW MIRROR & ADAS CAMERA
# ----------------------------------------------------------------------------

def build_jaguar_ftype_interior_mirror_and_adas(parent_col, mats):
    """
    Constructs the windshield-mounted interior rearview mirror and ADAS safety pod:
    - Frameless auto-dimming electrochromic interior rearview mirror with ambient light sensor.
    - Windshield header triangular housing enclosing forward-facing stereoscopic driver-assist camera.
    - Ball-and-socket articulated mounting arm anchored to windshield glass header.
    """
    objs = []
    bm_int_mir = bmesh.new()
    bm_int_glass = bmesh.new()

    mat_mir_base = Matrix.Translation(Vector((0.0, 0.240, 1.220))) @ Euler((math.radians(20), 0, 0), 'XYZ').to_matrix().to_4x4()

    # 1. Forward-Facing ADAS Camera / Rain Sensor Pod (Adhered to windshield ceramic frit)
    mat_adas = mat_mir_base @ Matrix.Translation(Vector((0, 0.040, 0.025)))
    bmesh.ops.create_cube(bm_int_mir, size=1.0, matrix=mat_adas @ Matrix.Diagonal(Vector((0.140, 0.040, 0.075, 1.0))))

    # 2. Articulated Swivel Stem
    bmesh.ops.create_cylinder(bm_int_mir, radius=0.008, depth=0.045, segments=12, matrix=mat_mir_base @ Matrix.Translation(Vector((0, -0.015, -0.020))))

    # 3. Frameless Electrochromic Mirror Casing
    mat_case = mat_mir_base @ Matrix.Translation(Vector((0, -0.035, -0.045)))
    bmesh.ops.create_cube(bm_int_mir, size=1.0, matrix=mat_case @ Matrix.Diagonal(Vector((0.240, 0.015, 0.065, 1.0))))

    # Optical Mirror Glass (Rear-facing)
    mat_mface = mat_case @ Matrix.Translation(Vector((0, -0.008, 0)))
    bmesh.ops.create_cube(bm_int_glass, size=1.0, matrix=mat_mface @ Matrix.Diagonal(Vector((0.232, 0.004, 0.058, 1.0))))

    obj_int_mir = link_obj("GEO_FTYPE_Interior_Mirror_and_ADAS", bm_int_mir, parent_col, mats["piano_black"], bevel=0.0008)
    obj_int_glass = link_obj("GEO_FTYPE_Interior_Mirror_Glass", bm_int_glass, parent_col, mats["mirror_glass"], bevel=0.0003)

    objs.extend([obj_int_mir, obj_int_glass])
    return objs
'''
