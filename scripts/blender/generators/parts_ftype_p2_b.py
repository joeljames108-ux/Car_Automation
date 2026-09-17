"""
Jaguar F-Type V8 R Convertible (2010s) Phase 20: Part B
Subsystems 5 to 7:
- Subsystem 5: Flush Motorized Pop-Out Door Handles & Keyhole Barrels
- Subsystem 6: Front Fender Louvered Air Extractors & Chrome "JAGUAR" Vane
- Subsystem 7: Front Grille Red Cloisonné Jaguar Growler Emblem with 3D Cat Face
"""

PART_FTYPE2_B = '''
# ----------------------------------------------------------------------------
# 7. SUBSYSTEM 5: FLUSH MOTORIZED DOOR HANDLES & SENSORS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_flush_door_handles(parent_col, mats):
    """
    Constructs the motorized pop-out flush exterior door handles:
    - Retracted flush with door skin sheetmetal when parked / in motion (X = +/- 0.875m, Y = +0.280m, Z = 0.810m).
    - Subtle capacitive touch sensor thumb indentation for keyless entry unlocking.
    - Concealed emergency mechanical lock keyhole barrel beneath driver handle flap.
    - Satin black perimeter sealing gasket preventing water ingress.
    """
    objs = []
    bm_handles = bmesh.new()
    bm_gaskets = bmesh.new()

    for hx_sign in [-1.0, 1.0]:
        hx = hx_sign * 0.878
        hy = 0.280
        hz = 0.810

        mat_h = Matrix.Translation(Vector((hx, hy, hz))) @ Euler((0, hx_sign * math.radians(-4), 0), 'XYZ').to_matrix().to_4x4()

        # 1. Recessed Perimeter Escutcheon Gasket Pocket
        bmesh.ops.create_cube(bm_gaskets, size=1.0, matrix=mat_h @ Matrix.Diagonal(Vector((0.015, 0.210, 0.052, 1.0))))

        # 2. Body-Colored Flush Pull Handle Flap
        bmesh.ops.create_cube(bm_handles, size=1.0, matrix=mat_h @ Matrix.Diagonal(Vector((0.012, 0.198, 0.042, 1.0))))

        # 3. Capacitive Touch Sensor Indent (Forward edge of handle)
        mat_sensor = mat_h @ Matrix.Translation(Vector((hx_sign * 0.005, 0.070, 0.0)))
        bmesh.ops.create_cylinder(bm_gaskets, radius=0.008, depth=0.005, segments=12, matrix=mat_sensor @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # 4. Emergency Mechanical Keyhole Barrel (Driver side only)
        if hx_sign > 0.0: # LHD Driver side (+X)
            mat_key = mat_h @ Matrix.Translation(Vector((hx_sign * 0.005, -0.075, 0.0)))
            bmesh.ops.create_cylinder(bm_gaskets, radius=0.006, depth=0.006, segments=10, matrix=mat_key @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_handles = link_obj("GEO_FTYPE_Flush_Door_Handles", bm_handles, parent_col, mats["body"], bevel=0.001)
    obj_gaskets = link_obj("GEO_FTYPE_Door_Handle_Gaskets", bm_gaskets, parent_col, mats["trim"], bevel=0.0005)

    objs.extend([obj_handles, obj_gaskets])
    return objs


# ----------------------------------------------------------------------------
# 8. SUBSYSTEM 6: FRONT FENDER LOUVERED EXTRACTORS & "JAGUAR" VANE
# ----------------------------------------------------------------------------

def build_jaguar_ftype_fender_side_vents(parent_col, mats):
    """
    Constructs the functional front fender air extractors:
    - Left and right recessed vertical air extractor slots behind front wheel arches (X = +/- 0.885m, Y = +0.980m, Z = 0.745m).
    - Horizontal chrome aerodynamic spear vane bearing embossed "JAGUAR" relief typography.
    - Dark graphite honeycomb mesh backing venting high-pressure wheelhouse turbulence.
    """
    objs = []
    bm_vents = bmesh.new()
    bm_vane = bmesh.new()

    for vx_sign in [-1.0, 1.0]:
        vx = vx_sign * 0.885
        vy = 0.980
        vz = 0.745

        mat_v = Matrix.Translation(Vector((vx, vy, vz))) @ Euler((0, vx_sign * math.radians(-6), 0), 'XYZ').to_matrix().to_4x4()

        # 1. Recessed Scallop Air Pocket Cavity
        bmesh.ops.create_cube(bm_vents, size=1.0, matrix=mat_v @ Matrix.Diagonal(Vector((0.025, 0.160, 0.140, 1.0))))

        # 2. Horizontal Polished Chrome Spear Vane (Dividing the vent)
        mat_spear = mat_v @ Matrix.Translation(Vector((vx_sign * 0.008, 0, 0)))
        bmesh.ops.create_cube(bm_vane, size=1.0, matrix=mat_spear @ Matrix.Diagonal(Vector((0.015, 0.175, 0.032, 1.0))))

        # 3. Embossed "JAGUAR" Center Lettering Block
        mat_text = mat_spear @ Matrix.Translation(Vector((vx_sign * 0.006, 0, 0)))
        bmesh.ops.create_cube(bm_vane, size=1.0, matrix=mat_text @ Matrix.Diagonal(Vector((0.004, 0.110, 0.016, 1.0))))

    obj_vents = link_obj("GEO_FTYPE_Fender_Vent_Pockets", bm_vents, parent_col, mats["piano_black"], bevel=0.001)
    obj_vane = link_obj("GEO_FTYPE_Fender_Chrome_Spear_Vanes", bm_vane, parent_col, mats["chrome"], bevel=0.0008)

    objs.extend([obj_vents, obj_vane])
    return objs


# ----------------------------------------------------------------------------
# 9. SUBSYSTEM 7: FRONT GRILLE RED CLOISONNÉ GROWLER EMBLEM
# ----------------------------------------------------------------------------

def build_jaguar_ftype_grille_growler_emblem(parent_col, mats):
    """
    Constructs the iconic Jaguar Growler radiator grille centerpiece:
    - Circular 85mm roundel anchored at center of shark-mouth grille (X = 0.0m, Y = +2.145m, Z = 0.520m).
    - Deep red cloisonné enamel background disc.
    - 3D high-relief snarling Jaguar feline face sculpture in mirror chrome.
    - Outer polished chrome retaining bezel ring.
    """
    objs = []
    bm_growler_red = bmesh.new()
    bm_growler_cat = bmesh.new()

    mat_growler = Matrix.Translation(Vector((0.0, 2.148, 0.520))) @ Euler((math.radians(10), 0, 0), 'XYZ').to_matrix().to_4x4()

    # 1. Outer Polished Chrome Bezel Ring
    bmesh.ops.create_cylinder(bm_growler_cat, radius=0.044, depth=0.016, segments=32, matrix=mat_growler @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Red Cloisonné Enamel Field Disc
    mat_field = mat_growler @ Matrix.Translation(Vector((0, 0.004, 0)))
    bmesh.ops.create_cylinder(bm_growler_red, radius=0.041, depth=0.012, segments=32, matrix=mat_field @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 3. 3D High-Relief Snarling Jaguar Cat Face Sculpture (Central emblem)
    mat_cat = mat_field @ Matrix.Translation(Vector((0, 0.007, 0)))
    # Cat Snout / Muzzle Block
    bmesh.ops.create_cube(bm_growler_cat, size=1.0, matrix=mat_cat @ Matrix.Diagonal(Vector((0.028, 0.008, 0.024, 1.0))))
    # Cat Forehead & Whisker Brow
    bmesh.ops.create_cube(bm_growler_cat, size=1.0, matrix=mat_cat @ Matrix.Translation(Vector((0, 0, 0.015))) @ Matrix.Diagonal(Vector((0.038, 0.006, 0.014, 1.0))))
    # Cat Ears (Left and Right triangular crests)
    for ear_sign in [-1.0, 1.0]:
        mat_ear = mat_cat @ Matrix.Translation(Vector((ear_sign * 0.022, 0, 0.026))) @ Euler((0, 0, ear_sign * math.radians(-25)), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_growler_cat, size=1.0, matrix=mat_ear @ Matrix.Diagonal(Vector((0.012, 0.005, 0.012, 1.0))))

    # Open Fanged Jaw (Lower mouth cavity)
    mat_jaw = mat_cat @ Matrix.Translation(Vector((0, 0, -0.016)))
    bmesh.ops.create_cube(bm_growler_cat, size=1.0, matrix=mat_jaw @ Matrix.Diagonal(Vector((0.020, 0.006, 0.010, 1.0))))

    obj_growler_red = link_obj("GEO_FTYPE_Growler_Red_Enamel_Disc", bm_growler_red, parent_col, mats["growler_red"], bevel=0.0005)
    obj_growler_cat = link_obj("GEO_FTYPE_Growler_Chrome_Cat_Face", bm_growler_cat, parent_col, mats["chrome"], bevel=0.0005)

    objs.extend([obj_growler_red, obj_growler_cat])
    return objs
'''
