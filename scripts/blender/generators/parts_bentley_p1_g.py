"""
Bentley Continental GT Speed Convertible (2020s) Phase 21: Part G
Subsystems 12 and 13:
- Subsystem 12: Dual Elliptical Speed Exhaust Plumbing & Acoustically Valved Muffler
- Subsystem 13: Aerodynamic Underbody Belly Pan, Venturi Floor Strakes & Rear Diffuser
"""

PART_BENTLEY_G = '''
# ----------------------------------------------------------------------------
# 12. SUBSYSTEM 12: DUAL ELLIPTICAL SPEED EXHAUST PLUMBING & VALVED MUFFLER
# ----------------------------------------------------------------------------

def build_bentley_speed_exhaust_system(parent_col, mats):
    """
    Constructs the tuned quad-bore elliptical sports exhaust system of the Continental GT Speed:
    - Twin stainless steel downpipes from twin turbochargers through close-coupled catalytic converters.
    - Central X-pipe acoustic crossover balancing W12 exhaust pulses and harmonics.
    - Massive transverse rear silencer box with dual high-speed electric acoustic bypass butterfly valves.
    - Signature Speed dual large elliptical exhaust tailpipes with knurled inner rifling bores
      housed seamlessly within the rear bumper lower valance apertures (X = +-0.620m, Y = -2.360m).
    """
    objs = []
    bm_pipes = bmesh.new()
    bm_muffler = bmesh.new()
    bm_tips = bmesh.new()

    # 1. Twin Turbo Downpipes & Catalytic Converters (Y: +0.650m to +1.150m, Z = 0.280m to 0.350m)
    for cat_sign in [-1.0, 1.0]:
        # Catalytic Converter Canister
        mat_cat = Matrix.Translation(Vector((cat_sign * 0.280, 0.920, 0.310)))
        bmesh.ops.create_cylinder(bm_pipes, radius=0.065, depth=0.280, segments=16, matrix=mat_cat @ Euler((math.radians(20), 0, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Dual Mid-Pipes & Central X-Crossover Balancing Section (Y: -0.850m to +0.650m)
    for pipe_sign in [-1.0, 1.0]:
        mat_mid = Matrix.Translation(Vector((pipe_sign * 0.160, -0.100, 0.240)))
        bmesh.ops.create_cylinder(bm_pipes, radius=0.035, depth=1.500, segments=16, matrix=mat_mid @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Center Acoustic Balance Resonator Box (Y = -0.200m)
    mat_res = Matrix.Translation(Vector((0.0, -0.200, 0.240)))
    bmesh.ops.create_cube(bm_muffler, size=1.0, matrix=mat_res @ Matrix.Diagonal(Vector((0.420, 0.380, 0.140, 1.0))))

    # 3. Transverse Rear Acoustically Valved Muffler (Under trunk floor, Y = -1.880m, Z = 0.280m)
    mat_muff = Matrix.Translation(Vector((0.0, -1.880, 0.290)))
    bmesh.ops.create_cube(bm_muffler, size=1.0, matrix=mat_muff @ Matrix.Diagonal(Vector((1.050, 0.420, 0.220, 1.0))))

    # Electric Active Acoustic Flap Valve Actuator Motors (Left & Right)
    for v_sign in [-1.0, 1.0]:
        mat_valv = mat_muff @ Matrix.Translation(Vector((v_sign * 0.480, -0.200, 0.050)))
        bmesh.ops.create_cylinder(bm_muffler, radius=0.032, depth=0.060, segments=14, matrix=mat_valv)

    # 4. Continental GT Speed Signature Elliptical Dual Exhaust Tips (Y = -2.360m, Z = 0.285m)
    # The Continental GT Speed W12 features large elliptical exhaust tips with a fluted rifled inner divider
    for tip_sign in [-1.0, 1.0]:
        mat_tip = Matrix.Translation(Vector((tip_sign * 0.620, -2.340, 0.285)))
        # Outer Elliptical Chrome Bezel Trim
        mat_ellip = mat_tip @ Euler((math.radians(6), 0, 0), 'XYZ').to_matrix().to_4x4() @ Matrix.Diagonal(Vector((1.35, 1.0, 0.82, 1.0)))
        bmesh.ops.create_cylinder(bm_tips, cap_ends=False, radius=0.088, depth=0.150, segments=28, matrix=mat_ellip @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # Internal Rifled Dual Gas Bores (Speed signature internal twin ports inside the outer ellipse)
        for bore_off in [-0.045, 0.045]:
            mat_bore = mat_tip @ Matrix.Translation(Vector((bore_off, -0.015, 0.0)))
            bmesh.ops.create_cylinder(bm_pipes, cap_ends=False, radius=0.038, depth=0.130, segments=20, matrix=mat_bore @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_pipes = link_obj("GEO_BENTLEY_Exhaust_Downpipes_and_Midpipes", bm_pipes, parent_col, mats["inconel"], bevel=0.0015)
    obj_muffler = link_obj("GEO_BENTLEY_Transverse_Rear_Silencer_Muffler", bm_muffler, parent_col, mats["engine_alloy"], bevel=0.002)
    obj_tips = link_obj("GEO_BENTLEY_Speed_Elliptical_Exhaust_Tips", bm_tips, parent_col, mats["chrome"], bevel=0.001)

    objs.extend([obj_pipes, obj_muffler, obj_tips])
    return objs


# ----------------------------------------------------------------------------
# 13. SUBSYSTEM 13: UNDERBODY BELLY PAN, VENTURI DIFFUSERS & STRAKES
# ----------------------------------------------------------------------------

def build_bentley_underbody_aero(parent_col, mats):
    """
    Constructs high-speed aerodynamic underfloor undertray and rear diffuser:
    - Continuous flush underbody undertray (Cd ~0.29 high-speed drag reduction).
    - Front engine splash belly shield with cooling air extraction louvers.
    - Central transmission tunnel aerodynamic shear closure panel.
    - Rear axle smooth under-tray bridging to high-downforce rear diffuser.
    - 4 vertical aerodynamic venturi diffuser channel strakes under the rear bumper.
    """
    objs = []
    bm_belly = bmesh.new()
    bm_diff = bmesh.new()

    # 1. Full-Length Flat Floor Composite Undertray (Y: -1.750m to +1.150m, Z = 0.175m, Width: 1.480m)
    mat_floor = Matrix.Translation(Vector((0.0, -0.300, 0.175)))
    bmesh.ops.create_cube(bm_belly, size=1.0, matrix=mat_floor @ Matrix.Diagonal(Vector((1.480, 2.900, 0.015, 1.0))))

    # Longitudinal Stiffening Ribs & Aerodynamic Guide Channels
    for rib_x in [-0.550, -0.280, 0.280, 0.550]:
        mat_rib = Matrix.Translation(Vector((rib_x, -0.300, 0.165)))
        bmesh.ops.create_cube(bm_belly, size=1.0, matrix=mat_rib @ Matrix.Diagonal(Vector((0.022, 2.850, 0.016, 1.0))))

    # 2. Front Engine Bay Aero Shield & Sump Guard (Y: +1.150m to +2.050m, Z = 0.180m)
    mat_fguard = Matrix.Translation(Vector((0.0, 1.600, 0.180)))
    bmesh.ops.create_cube(bm_belly, size=1.0, matrix=mat_fguard @ Matrix.Diagonal(Vector((1.360, 0.900, 0.018, 1.0))))

    # 3. Rear High-Downforce Aerodynamic Diffuser Section (Y: -1.750m to -2.320m, Upsweep Z: 0.175m to 0.320m)
    mat_rdiff = Matrix.Translation(Vector((0.0, -2.035, 0.245))) @ Euler((-math.radians(11.5), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_diff, size=1.0, matrix=mat_rdiff @ Matrix.Diagonal(Vector((1.240, 0.580, 0.018, 1.0))))

    # 4 Vertical Aerodynamic Diffuser Channel Strakes
    for strake_x in [-0.420, -0.140, 0.140, 0.420]:
        mat_strake = mat_rdiff @ Matrix.Translation(Vector((strake_x, 0.0, -0.040)))
        bmesh.ops.create_cube(bm_diff, size=1.0, matrix=mat_strake @ Matrix.Diagonal(Vector((0.012, 0.560, 0.075, 1.0))))

    obj_belly = link_obj("GEO_BENTLEY_Underbody_Aerodynamic_BellyPan", bm_belly, parent_col, mats["trim_black"], bevel=0.002)
    obj_diff = link_obj("GEO_BENTLEY_Rear_Venturi_Diffuser_Strakes", bm_diff, parent_col, mats["piano_black"], bevel=0.0015)

    objs.extend([obj_belly, obj_diff])
    return objs
'''
