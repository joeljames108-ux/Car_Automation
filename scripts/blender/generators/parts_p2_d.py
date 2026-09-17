"""
Porsche 911 (993) Carrera Cabriolet — Phase 16: Part D
Subsystem 10: Cabriolet Tenax Chrome Fasteners, Welt Cords & Canvas Stitching
Subsystem 11: Windshield Header Reveal Molding & Articulated Pantograph Wipers
Subsystem 12: Front Bumper Chin Spoiler Lip & Tire Deflection Spats
Subsystem 13: Flared Rear Hip Stone Guards & Carrera Door Sill Plates
"""

PART_P2_D = '''
# ----------------------------------------------------------------------------
# 10. SUBSYSTEM 10: CABRIOLET TENAX FASTENERS & CANVAS WELTS
# ----------------------------------------------------------------------------

def build_993_cabriolet_tenax_fasteners_and_canvas_welts(parent_col, mats):
    """
    Constructs the convertible soft-top detailing and tonneau boot jewelry:
    - 16 German Tenax quick-release spring locking chrome snap studs around tonneau perimeter.
    - Hexagonal chrome base collar with mushroom-head pull button.
    - Twin longitudinal canvas welt piping cords outlining the folded roof envelope.
    - Leather hold-down tie straps with miniature polished chrome roller buckles.
    - Rear tonneau cover perimeter beading cord.
    """
    objs = []
    bm_tenax = bmesh.new()
    bm_welts = bmesh.new()
    bm_straps = bmesh.new()

    # 16 Tenax Snap Stud Positions along tonneau perimeter beltline
    tenax_coords = [
        # Rear cross bar (Y = -1.340m, Z = 0.805m)
        (-0.580, -1.340, 0.805), (-0.380, -1.345, 0.810), (-0.180, -1.348, 0.812),
        (0.180, -1.348, 0.812), (0.380, -1.345, 0.810), (0.580, -1.340, 0.805),
        # Left side curved rim (X = -0.740m to -0.660m, Y = -1.220m to -0.780m)
        (-0.680, -1.220, 0.808), (-0.720, -1.080, 0.810), (-0.745, -0.940, 0.812), (-0.740, -0.800, 0.815),
        # Right side curved rim (X = +0.740m to +0.660m, Y = -1.220m to -0.780m)
        (0.680, -1.220, 0.808), (0.720, -1.080, 0.810), (0.745, -0.940, 0.812), (0.740, -0.800, 0.815),
        # Forward corner snaps
        (-0.700, -0.680, 0.818), (0.700, -0.680, 0.818),
    ]

    for tx, ty, tz in tenax_coords:
        mat_tenax = Matrix.Translation(Vector((tx, ty, tz)))
        # Hexagonal Chrome Base Collar
        bmesh.ops.create_cylinder(bm_tenax, radius=0.007, depth=0.004, segments=6, matrix=mat_tenax)
        # Mushroom Head Spring Release Pull Stud
        bmesh.ops.create_cylinder(bm_tenax, radius=0.005, depth=0.008, segments=12, matrix=mat_tenax @ Matrix.Translation(Vector((0, 0, 0.004))))
        bmesh.ops.create_cylinder(bm_tenax, radius=0.003, depth=0.005, segments=10, matrix=mat_tenax @ Matrix.Translation(Vector((0, 0, 0.008))))

    # Twin Longitudinal Canvas Welt Piping Cords (Along folded roof side ridges)
    for wx_sign in [-1.0, 1.0]:
        mat_welt = Matrix.Translation(Vector((wx_sign * 0.540, -0.980, 0.865)))
        bmesh.ops.create_cylinder(bm_welts, radius=0.004, depth=0.640, segments=10, matrix=mat_welt @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Transverse Rear Welt Piping
    mat_r_welt = Matrix.Translation(Vector((0.0, -1.310, 0.825)))
    bmesh.ops.create_cylinder(bm_welts, radius=0.004, depth=1.120, segments=12, matrix=mat_r_welt @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Leather Hold-Down Tie Straps & Miniature Chrome Buckles (Left & Right rear cockpit)
    for sx_sign in [-1.0, 1.0]:
        mat_strap = Matrix.Translation(Vector((sx_sign * 0.420, -0.720, 0.800))) @ Euler((math.radians(24), 0, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_straps, size=1.0, matrix=mat_strap @ Matrix.Diagonal(Vector((0.024, 0.120, 0.004, 1.0))))
        # Miniature Chrome Roller Buckle
        mat_buckle = mat_strap @ Matrix.Translation(Vector((0, -0.045, 0.003)))
        bmesh.ops.create_cube(bm_tenax, size=1.0, matrix=mat_buckle @ Matrix.Diagonal(Vector((0.028, 0.016, 0.008, 1.0))))

    obj_tenax = link_obj("GEO_993_Tonneau_Tenax_Fasteners", bm_tenax, parent_col, mats["chrome"], bevel=0.0005)
    obj_welts = link_obj("GEO_993_Cabriolet_Canvas_Welts", bm_welts, parent_col, mats["canvas"], bevel=0.0005)
    obj_straps = link_obj("GEO_993_Tonneau_Leather_Straps", bm_straps, parent_col, mats["rubber"], bevel=0.0008)

    objs.extend([obj_tenax, obj_welts, obj_straps])
    return objs

# ----------------------------------------------------------------------------
# 11. SUBSYSTEM 11: WINDSHIELD REVEAL MOLDING & PANTOGRAPH WIPERS
# ----------------------------------------------------------------------------

def build_993_windshield_reveal_molding_and_pantograph_wipers(parent_col, mats):
    """
    Constructs the windshield reveal molding and high-speed pantograph wipers:
    - Satin black aluminum windshield outer surround trim framing glass perimeter.
    - Articulated dual-blade pantograph wiper arm assembly:
      * Driver Wiper: Articulated dual-link arm with high-speed aerodynamic airfoil spoiler.
      * Passenger Wiper: Curved articulated arm following windshield lower contour.
    - Fine multi-segment flexible rubber wiper squeegee blades.
    - Dual pivot drive spindles protruding through cowl intake louver panel.
    """
    objs = []
    bm_trim = bmesh.new()
    bm_wipers = bmesh.new()
    bm_blades = bmesh.new()

    # 1. Windshield Outer Reveal Molding Surround (Satin Black Aluminum)
    # Upper Header Trim (Z = 1.285m, Y = +0.720m)
    mat_hdr = Matrix.Translation(Vector((0.0, 0.720, 1.285)))
    bmesh.ops.create_cube(bm_trim, size=1.0, matrix=mat_hdr @ Matrix.Diagonal(Vector((1.120, 0.018, 0.012, 1.0))))

    # Left & Right A-Pillar Reveal Trim
    for ax_sign in [-1.0, 1.0]:
        mat_ap = Matrix.Translation(Vector((ax_sign * 0.610, 0.840, 1.060))) @ Euler((math.radians(-42), ax_sign * math.radians(-14), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_trim, radius=0.008, depth=0.680, segments=12, matrix=mat_ap)

    # 2. Dual Wiper Pivot Spindles on Cowl (Y = +0.940m, Z = 0.835m)
    # Driver Pivot (Left, X = -0.320m)
    mat_dpiv = Matrix.Translation(Vector((-0.320, 0.940, 0.835)))
    bmesh.ops.create_cylinder(bm_trim, radius=0.014, depth=0.024, segments=14, matrix=mat_dpiv)

    # Passenger Pivot (Right, X = +0.160m)
    mat_ppiv = Matrix.Translation(Vector((0.160, 0.940, 0.835)))
    bmesh.ops.create_cylinder(bm_trim, radius=0.014, depth=0.024, segments=14, matrix=mat_ppiv)

    # 3. Driver Wiper Arm with Aerodynamic Airfoil Spoiler (Angled across glass)
    mat_d_arm = Matrix.Translation(Vector((-0.240, 0.900, 0.880))) @ Euler((math.radians(-38), 0, math.radians(22)), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_wipers, size=1.0, matrix=mat_d_arm @ Matrix.Diagonal(Vector((0.014, 0.380, 0.008, 1.0))))
    # Aerodynamic Wind Deflector Airfoil Winglet on Driver Arm
    mat_spoiler = mat_d_arm @ Matrix.Translation(Vector((0.006, 0.050, 0.006))) @ Euler((0, math.radians(25), 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_wipers, size=1.0, matrix=mat_spoiler @ Matrix.Diagonal(Vector((0.022, 0.220, 0.003, 1.0))))

    # Driver Wiper Blade (450mm curved rubber squeegee)
    mat_d_blade = mat_d_arm @ Matrix.Translation(Vector((0.000, 0.120, -0.008)))
    bmesh.ops.create_cube(bm_blades, size=1.0, matrix=mat_d_blade @ Matrix.Diagonal(Vector((0.008, 0.450, 0.012, 1.0))))

    # 4. Passenger Wiper Arm & Blade
    mat_p_arm = Matrix.Translation(Vector((0.260, 0.900, 0.880))) @ Euler((math.radians(-38), 0, math.radians(18)), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_wipers, size=1.0, matrix=mat_p_arm @ Matrix.Diagonal(Vector((0.012, 0.360, 0.007, 1.0))))

    # Passenger Wiper Blade (450mm curved rubber squeegee)
    mat_p_blade = mat_p_arm @ Matrix.Translation(Vector((0.000, 0.110, -0.008)))
    bmesh.ops.create_cube(bm_blades, size=1.0, matrix=mat_p_blade @ Matrix.Diagonal(Vector((0.008, 0.450, 0.012, 1.0))))

    obj_trim = link_obj("GEO_993_Windshield_Reveal_Molding", bm_trim, parent_col, mats["rubber"], bevel=0.001)
    obj_wipers = link_obj("GEO_993_Pantograph_Wiper_Arms", bm_wipers, parent_col, mats["rubber"], bevel=0.0008)
    obj_blades = link_obj("GEO_993_Wiper_Rubber_Blades", bm_blades, parent_col, mats["rubber"], bevel=0.0005)

    objs.extend([obj_trim, obj_wipers, obj_blades])
    return objs

# ----------------------------------------------------------------------------
# 12. SUBSYSTEM 12: FRONT CHIN SPOILER LIP & TIRE DEFLECTION SPATS
# ----------------------------------------------------------------------------

def build_993_front_chin_spoiler_and_tire_spats(parent_col, mats):
    """
    Constructs the aerodynamic front lower chin splitter and wheel spats:
    - Two-piece flexible polyurethane lower chin spoiler lip attached to front bumper bottom.
    - Swept aerodynamic front tire air-deflection spats directing airflow around 205/50ZR17 tires.
    - Front bumper tow hook access cap on the right-hand corner.
    """
    objs = []
    bm_lip = bmesh.new()

    # Front Lower Chin Spoiler Lip (Y = +2.020m to +1.860m, Z = 0.165m)
    # Center Section (Y = +2.010m)
    mat_c_lip = Matrix.Translation(Vector((0.0, 2.010, 0.165)))
    bmesh.ops.create_cube(bm_lip, size=1.0, matrix=mat_c_lip @ Matrix.Diagonal(Vector((0.740, 0.045, 0.024, 1.0))))

    # Left & Right Curved Corner Extensions
    for cx_sign in [-1.0, 1.0]:
        mat_corner = Matrix.Translation(Vector((cx_sign * 0.520, 1.940, 0.170))) @ Euler((0, 0, cx_sign * math.radians(-24)), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_lip, size=1.0, matrix=mat_corner @ Matrix.Diagonal(Vector((0.360, 0.040, 0.026, 1.0))))

        # Front Tire Aerodynamic Air Deflection Spat (Ahead of front tire, Y = +1.340m, Z = 0.185m)
        mat_spat = Matrix.Translation(Vector((cx_sign * 0.705, 1.340, 0.185)))
        bmesh.ops.create_cube(bm_lip, size=1.0, matrix=mat_spat @ Matrix.Diagonal(Vector((0.035, 0.065, 0.055, 1.0))))

    # Front Bumper Tow Hook Access Cover Cap (Right side, X = +0.480m, Y = +1.970m, Z = 0.380m)
    mat_tow = Matrix.Translation(Vector((0.480, 1.970, 0.380)))
    bmesh.ops.create_cylinder(bm_lip, radius=0.016, depth=0.008, segments=16, matrix=mat_tow @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_lip = link_obj("GEO_993_Front_Chin_Spoiler_and_Spats", bm_lip, parent_col, mats["rubber"], bevel=0.0015)
    objs.append(obj_lip)
    return objs

# ----------------------------------------------------------------------------
# 13. SUBSYSTEM 13: FLARED HIP STONE GUARDS & SILL SCUFF PLATES
# ----------------------------------------------------------------------------

def build_993_flared_hip_stone_guards_and_sill_plates(parent_col, mats):
    """
    Constructs the iconic flared rear hip stone guards and interior door sill plates:
    - Type 993 shark-fin transparent vinyl stone guard decals on flared rear quarters.
    - Polished brushed aluminum inner door sill scuff plates stamped with 'Carrera' script.
    - Door threshold weatherstrip seals.
    """
    objs = []
    bm_guard = bmesh.new()
    bm_sill = bmesh.new()

    for gx_sign in [-1.0, 1.0]:
        # Flared Hip Stone Guard Decal (X = +/- 0.880m, Y = -0.780m, Z = 0.480m)
        # Follows wide rear hip flare curvature
        mat_guard = Matrix.Translation(Vector((gx_sign * 0.880, -0.780, 0.480))) @ Euler((0, gx_sign * math.radians(-14), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_guard, size=1.0, matrix=mat_guard @ Matrix.Diagonal(Vector((0.004, 0.280, 0.220, 1.0))))

        # Polished Aluminum Door Sill Scuff Plate (Inner door aperture floor, X = +/- 0.730m, Y = +0.050m, Z = 0.300m)
        mat_sill = Matrix.Translation(Vector((gx_sign * 0.730, 0.050, 0.300)))
        bmesh.ops.create_cube(bm_sill, size=1.0, matrix=mat_sill @ Matrix.Diagonal(Vector((0.075, 0.580, 0.006, 1.0))))

        # Stamped 'Carrera' Script Inlay on Sill Plate
        mat_s_script = mat_sill @ Matrix.Translation(Vector((0, 0, 0.004)))
        bmesh.ops.create_cube(bm_sill, size=1.0, matrix=mat_s_script @ Matrix.Diagonal(Vector((0.035, 0.220, 0.003, 1.0))))

        # Rubber Perimeter Sill Seal
        mat_seal = mat_sill @ Matrix.Translation(Vector((gx_sign * -0.045, 0, 0.008)))
        bmesh.ops.create_cylinder(bm_guard, radius=0.006, depth=0.620, segments=10, matrix=mat_seal @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_guard = link_obj("GEO_993_Rear_Hip_Stone_Guards", bm_guard, parent_col, mats["rubber"], bevel=0.0005)
    obj_sill = link_obj("GEO_993_Door_Sill_Scuff_Plates", bm_sill, parent_col, mats["alloy"], bevel=0.0008)

    objs.extend([obj_guard, obj_sill])
    return objs
'''
