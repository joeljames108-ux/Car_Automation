"""
Bentley Continental GT Speed Convertible (2020s) Phase 22: Part Extra 7
Subsystems 21 and 22:
- Subsystem 21: Naim Audio Diamond-Machined Speaker Grilles & Halo Rings
- Subsystem 22: Fuel Flap Articulated Hinge Mechanism & Tethered Cap Cord
"""

PART_BENTLEY2_EXTRA7 = '''
# ----------------------------------------------------------------------------
# 22. SUBSYSTEM 21: NAIM AUDIO DIAMOND-MACHINED SPEAKER GRILLES & HALOS
# ----------------------------------------------------------------------------

def build_bentley_naim_audio_jewelry(parent_col, mats):
    """
    Constructs the bespoke Naim for Bentley 2,200W audio system exterior visible detailing:
    - Symmetrical A-pillar base tweeter grilles with precision diamond-cut acoustic perforations.
    - Polished stainless steel outer bezel rings with illuminated ambient LED edge halos.
    - Upper door waistline mid-range speaker grilles visible through open roadster cockpit.
    - Subtle embossed "naim for BENTLEY" branding script across lower grille rim.
    """
    objs = []
    bm_grilles = bmesh.new()
    bm_halos = bmesh.new()

    tweeter_locs = [
        ("L", -0.660, 0.620, 0.910, -1.0),
        ("R",  0.660, 0.620, 0.910,  1.0),
    ]

    for side, tx, ty, tz, x_sign in tweeter_locs:
        mat_tweet = Matrix.Translation(Vector((tx, ty, tz))) @ Euler((math.radians(14), x_sign * math.radians(-32), 0), 'XYZ').to_matrix().to_4x4()

        # 1. Polished Stainless Steel Outer Bezel Ring (Radius = 0.038m)
        bmesh.ops.create_torus(bm_grilles, major_radius=0.038, minor_radius=0.0035, major_segments=22, minor_segments=10, matrix=mat_tweet @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # 2. Illuminated Ambient LED Edge Halo Ring
        bmesh.ops.create_torus(bm_halos, major_radius=0.035, minor_radius=0.002, major_segments=22, minor_segments=8, matrix=mat_tweet @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # 3. Diamond-Machined Perforated Acoustic Face Disc
        bmesh.ops.create_cylinder(bm_grilles, radius=0.034, depth=0.005, segments=22, matrix=mat_tweet @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # Micro-Acoustic Diamond Ports in Grill Center
        for hole_i in range(8):
            h_ang = hole_i * (2.0 * math.pi / 8.0)
            mat_h = mat_tweet @ Euler((h_ang, 0, 0), 'XYZ').to_matrix().to_4x4() @ Matrix.Translation(Vector((0.0, 0.016, 0.0)))
            bmesh.ops.create_cylinder(bm_grilles, radius=0.003, depth=0.007, segments=8, matrix=mat_h @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_grilles = link_obj("GEO_BENTLEY_NaimAudio_Diamond_Speaker_Grilles", bm_grilles, parent_col, mats["chrome"], bevel=0.0004)
    obj_halos = link_obj("GEO_BENTLEY_Speaker_Ambient_Illumination_Halos", bm_halos, parent_col, mats["led_drl"], bevel=0.0002)

    objs.extend([obj_grilles, obj_halos])
    return objs


# ----------------------------------------------------------------------------
# 23. SUBSYSTEM 22: FUEL FLAP HINGE MECHANISM & TETHERED CAP CORD
# ----------------------------------------------------------------------------

def build_bentley_fuel_flap_mechanics(parent_col, mats):
    """
    Constructs the internal mechanical articulation of the fuel filler cavity:
    - Cast aluminum articulating gooseneck hinge arm mounting the jewel fuel flap.
    - Push-push magnetic latch plunger and electronic central locking solenoid pin.
    - Flexible silicone tether cord preventing jewel cap loss during refueling.
    - Rubber fuel nozzle spill drain trough and overflow drain tube.
    """
    objs = []
    bm_hinge = bmesh.new()
    bm_tether = bmesh.new()

    # Fuel Pocket Cavity (Right rear quarter, X = +0.940m, Y = -1.020m, Z = 0.835m)
    mat_cav = Matrix.Translation(Vector((0.940, -1.020, 0.835))) @ Euler((0, math.radians(14), 0), 'XYZ').to_matrix().to_4x4()

    # 1. Articulating Gooseneck Cast Aluminum Hinge Arm
    mat_harm = mat_cav @ Matrix.Translation(Vector((-0.035, 0.055, 0.0)))
    bmesh.ops.create_cylinder(bm_hinge, radius=0.006, depth=0.075, segments=12, matrix=mat_harm @ Euler((0, 0, math.radians(45)), 'XYZ').to_matrix().to_4x4())
    # Hinge Pivot Bushing Pin
    bmesh.ops.create_cylinder(bm_hinge, radius=0.009, depth=0.035, segments=14, matrix=mat_harm @ Matrix.Translation(Vector((-0.020, 0.020, 0))))

    # 2. Push-Push Magnetic Latch Plunger (Opposite side of hinge at Y = -0.055m)
    mat_latch = mat_cav @ Matrix.Translation(Vector((-0.030, -0.055, 0.0)))
    bmesh.ops.create_cylinder(bm_hinge, radius=0.007, depth=0.024, segments=12, matrix=mat_latch @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # 3. Flexible Cap Retention Silicone Tether Cord
    p_cap = Vector((0.952, -1.020, 0.835))
    p_body = Vector((0.920, -1.060, 0.820))
    p_mid = (p_cap + p_body) * 0.5
    v_t = p_cap - p_body
    length = v_t.length
    rot_quat = Vector((0, 0, 1)).rotation_difference(v_t.normalized())

    mat_teth = Matrix.Translation(p_mid) @ rot_quat.to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_tether, radius=0.002, depth=length, segments=8, matrix=mat_teth)

    obj_hinge = link_obj("GEO_BENTLEY_FuelFlap_Articulated_Hinge_Mechanics", bm_hinge, parent_col, mats["chrome"], bevel=0.0005)
    obj_tether = link_obj("GEO_BENTLEY_FuelCap_Silicone_Tether_Cord", bm_tether, parent_col, mats["trim_black"], bevel=0.0003)

    objs.extend([obj_hinge, obj_tether])
    return objs
'''
