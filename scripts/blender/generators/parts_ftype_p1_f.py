"""
Jaguar F-Type V8 R Convertible (2010s) Phase 19: Part F
Subsystem 10: Twin Rollover Hoops & Polycarbonate Wind Deflector Screen
Subsystem 11: Rear Bumper Fascia, Active Spoiler Cavity & Gloss Black Diffuser
"""

PART_FTYPE_F = '''
# ----------------------------------------------------------------------------
# 11. SUBSYSTEM 10: TWIN ROLLOVER HOOPS & POLYCARBONATE WIND DEFLECTOR
# ----------------------------------------------------------------------------

def build_jaguar_ftype_roll_hoops_and_cockpit_cowl(parent_col, mats):
    """
    Constructs the convertible safety roll hoops and cockpit aerodynamic silhouette:
    - Fixed satin chrome / body-colored twin aerodynamic rollover protection hoops.
    - Transparent tinted polycarbonate center wind deflector screen between hoops.
    - Cockpit rear bulkhead cross-brace with embossed Jaguar script panel.
    - Driver-focused cockpit cowl, asymmetrical passenger grab bar silhouette, and steering rim.
    """
    objs = []
    bm_hoops = bmesh.new()
    bm_screen = bmesh.new()
    bm_cockpit = bmesh.new()

    # 1. Twin Rollover Protection Hoops (Positioned behind driver and passenger headrests)
    # Coordinates: Y = -0.440m, X = +/- 0.360m, Z = 0.850m to 1.140m
    for hx_sign in [-1.0, 1.0]:
        hx = hx_sign * 0.360
        hy = -0.440
        hz = 0.860

        # Vertical Outer Leg
        mat_leg1 = Matrix.Translation(Vector((hx - hx_sign * 0.120, hy, hz + 0.140)))
        bmesh.ops.create_cylinder(bm_hoops, radius=0.026, depth=0.280, segments=16, matrix=mat_leg1)

        # Vertical Inner Leg
        mat_leg2 = Matrix.Translation(Vector((hx + hx_sign * 0.120, hy, hz + 0.140)))
        bmesh.ops.create_cylinder(bm_hoops, radius=0.026, depth=0.280, segments=16, matrix=mat_leg2)

        # Curved Top Arch (Semi-torus / arch arc)
        arch_steps = 10
        arch_r = 0.120
        for step in range(arch_steps):
            t1 = step / arch_steps * math.pi
            t2 = (step + 1) / arch_steps * math.pi
            p1 = Vector((hx + math.cos(t1) * arch_r, hy, hz + 0.280 + math.sin(t1) * 0.080))
            p2 = Vector((hx + math.cos(t2) * arch_r, hy, hz + 0.280 + math.sin(t2) * 0.080))
            mid_a = (p1 + p2) * 0.5
            mat_arch = Matrix.Translation(mid_a) @ Vector((0, 0, 1)).rotation_difference(p2 - p1).to_matrix().to_4x4()
            bmesh.ops.create_cylinder(bm_hoops, radius=0.026, depth=(p2 - p1).length, segments=12, matrix=mat_arch)

    # 2. Central Polycarbonate Wind Deflector Screen (Between rollover hoops: X: -0.220m to +0.220m)
    mat_wd = Matrix.Translation(Vector((0.0, -0.440, 1.020)))
    bmesh.ops.create_cube(bm_screen, size=1.0, matrix=mat_wd @ Matrix.Diagonal(Vector((0.440, 0.008, 0.200, 1.0))))
    # Wind Deflector Outer Frame
    bmesh.ops.create_cube(bm_hoops, size=1.0, matrix=mat_wd @ Matrix.Diagonal(Vector((0.455, 0.016, 0.215, 1.0))))

    # 3. Cockpit Dashboard Cowl & Asymmetrical Grab Bar Silhouette
    # Driver Instrument Binnacle Hood (X = -0.360m, Y = +0.480m, Z = 0.880m)
    mat_binnacle = Matrix.Translation(Vector((-0.360, 0.480, 0.880)))
    bmesh.ops.create_cube(bm_cockpit, size=1.0, matrix=mat_binnacle @ Matrix.Diagonal(Vector((0.360, 0.220, 0.120, 1.0))))

    # Dashboard Main Wing Crossbar (Y = +0.520m, Z = 0.780m)
    mat_dash = Matrix.Translation(Vector((0.0, 0.520, 0.780)))
    bmesh.ops.create_cube(bm_cockpit, size=1.0, matrix=mat_dash @ Matrix.Diagonal(Vector((1.240, 0.260, 0.180, 1.0))))

    # Iconic Asymmetrical Passenger Grab Handle (Rises from center console on passenger side)
    p_grab1 = Vector((0.080, 0.420, 0.620))
    p_grab2 = Vector((0.140, 0.180, 0.780))
    mid_grab = (p_grab1 + p_grab2) * 0.5
    mat_grab = Matrix.Translation(mid_grab) @ Vector((0, 0, 1)).rotation_difference(p_grab2 - p_grab1).to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_cockpit, radius=0.016, depth=(p_grab2 - p_grab1).length, segments=12, matrix=mat_grab)

    # 3-Spoke Sport Steering Wheel Rim
    mat_wheel = Matrix.Translation(Vector((-0.360, 0.320, 0.840))) @ Euler((math.radians(24), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_cockpit, radius=0.180, depth=0.028, segments=24, matrix=mat_wheel @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_hoops = link_obj("GEO_FTYPE_Rollover_Protection_Hoops", bm_hoops, parent_col, mats["chrome"], bevel=0.0015)
    obj_screen = link_obj("GEO_FTYPE_Wind_Deflector_Screen", bm_screen, parent_col, mats["glass"], bevel=0.0005)
    obj_cockpit = link_obj("GEO_FTYPE_Cockpit_Cowl_and_Dash", bm_cockpit, parent_col, mats["satin_black"], bevel=0.002)

    objs.extend([obj_hoops, obj_screen, obj_cockpit])
    return objs


# ----------------------------------------------------------------------------
# 12. SUBSYSTEM 11: REAR BUMPER, ACTIVE SPOILER & GLOSS BLACK DIFFUSER
# ----------------------------------------------------------------------------

def build_jaguar_ftype_rear_diffuser_and_spoiler(parent_col, mats):
    """
    Constructs the aggressive rear end aerodynamic sculpture:
    - Active deployable rear spoiler in retracted flush parking position (Y: -1.720m to -2.060m).
    - Rear license plate recess and center trunk release latch.
    - Massive gloss black rear underbody aerodynamic diffuser with twin vertical flow strakes.
    - Outboard exhaust cutouts accommodating the trademark twin dual exhaust tips.
    """
    objs = []
    bm_spoiler = bmesh.new()
    bm_diff = bmesh.new()

    # 1. Active Rear Deployable Aerodynamic Spoiler (Retracted flush into decklid)
    # Sits across Y = -1.880m, Z = 0.810m, Width 1.180m, Depth 0.220m
    mat_sp = Matrix.Translation(Vector((0.0, -1.880, 0.810))) @ Euler((math.radians(-6), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_spoiler, size=1.0, matrix=mat_sp @ Matrix.Diagonal(Vector((1.180, 0.220, 0.022, 1.0))))

    # Trailing Aero Lip on Spoiler
    mat_lip = mat_sp @ Matrix.Translation(Vector((0.0, -0.105, 0.012)))
    bmesh.ops.create_cube(bm_spoiler, size=1.0, matrix=mat_lip @ Matrix.Diagonal(Vector((1.160, 0.025, 0.014, 1.0))))

    # 2. Gloss Black Rear Aerodynamic Diffuser (Y: -1.850m to -2.235m, Z = 0.160m to 0.380m)
    mat_diff = Matrix.Translation(Vector((0.0, -2.040, 0.260)))
    bmesh.ops.create_cube(bm_diff, size=1.0, matrix=mat_diff @ Matrix.Diagonal(Vector((1.380, 0.360, 0.160, 1.0))))

    # Twin Center Aerodynamic Diffuser Strakes (Channeling underbody airflow)
    for st_x in [-0.220, 0.220]:
        mat_strake = Matrix.Translation(Vector((st_x, -2.080, 0.200))) @ Euler((math.radians(-14), 0, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_diff, size=1.0, matrix=mat_strake @ Matrix.Diagonal(Vector((0.018, 0.320, 0.090, 1.0))))

    # Outer Exhaust Flank Tunnels (Wrapping around the quad exhaust pipes)
    for ex_sign in [-1.0, 1.0]:
        mat_tunnel = Matrix.Translation(Vector((ex_sign * 0.620, -2.120, 0.280)))
        bmesh.ops.create_cube(bm_diff, size=1.0, matrix=mat_tunnel @ Matrix.Diagonal(Vector((0.320, 0.180, 0.120, 1.0))))

    obj_spoiler = link_obj("GEO_FTYPE_Active_Rear_Spoiler", bm_spoiler, parent_col, mats["body"], bevel=0.001)
    obj_diff = link_obj("GEO_FTYPE_Gloss_Black_Rear_Diffuser", bm_diff, parent_col, mats["gloss_black"], bevel=0.002)

    objs.extend([obj_spoiler, obj_diff])
    return objs
'''
