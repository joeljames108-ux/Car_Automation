"""
Bentley Continental GT Speed Convertible (2020s) Phase 22: Part C
Subsystems 5 and 6:
- Subsystem 5: Mulliner Jewel-Knurled Fuel Filler & Oil Reservoir Caps
- Subsystem 6: Sculpted Teardrop Door Mirrors with Sweeping LED Repeaters
"""

PART_BENTLEY2_C = '''
# ----------------------------------------------------------------------------
# 6. SUBSYSTEM 5: MULLINER JEWEL-KNURLED FUEL & OIL FILLER CAPS
# ----------------------------------------------------------------------------

def build_bentley_jewel_filler_caps(parent_col, mats):
    """
    Constructs the bespoke Mulliner "Jewel" filler caps:
    - Right rear haunch fuel filler cap (X = +0.945m, Y = -1.020m, Z = 0.835m).
    - Machined billet aluminum body with deep diamond knurling around the perimeter grip ring.
    - Mirror-polished center medallion featuring an engraved Bentley Winged 'B' monogram.
    - Precision circular fuel flap aperture cutline with silicone weatherstrip ring.
    - Matching under-bonnet W12 billet aluminum jewel oil filler cap.
    """
    objs = []
    bm_knurl = bmesh.new()
    bm_chrome = bmesh.new()

    # 1. Exterior Mulliner Jewel Fuel Cap (Right Rear Haunch, canted at 14 degrees)
    mat_fuel = Matrix.Translation(Vector((0.948, -1.020, 0.835))) @ Euler((0, math.radians(14), 0), 'XYZ').to_matrix().to_4x4()
    # Outer Circular Body Ring Cutline Gasket
    bmesh.ops.create_cylinder(bm_chrome, radius=0.062, depth=0.008, segments=28, matrix=mat_fuel @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Diamond-Knurled Perimeter Grip Ring
    mat_ring = mat_fuel @ Matrix.Translation(Vector((0.005, 0, 0)))
    bmesh.ops.create_cylinder(bm_knurl, radius=0.055, depth=0.016, segments=32, matrix=mat_ring @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Knurled Diamond Teeth Facets along circumference
    for t_i in range(24):
        t_ang = t_i * (2.0 * math.pi / 24.0)
        mat_tooth = mat_ring @ Euler((t_ang, 0, 0), 'XYZ').to_matrix().to_4x4() @ Matrix.Translation(Vector((0.0, 0.055, 0.0)))
        bmesh.ops.create_cube(bm_knurl, size=1.0, matrix=mat_tooth @ Matrix.Diagonal(Vector((0.012, 0.006, 0.006, 1.0))))

    # Polished Chrome Center Medallion with Raised 'B'
    mat_medallion = mat_fuel @ Matrix.Translation(Vector((0.012, 0, 0)))
    bmesh.ops.create_cylinder(bm_chrome, radius=0.038, depth=0.008, segments=24, matrix=mat_medallion @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())
    bmesh.ops.create_cube(bm_chrome, size=1.0, matrix=mat_medallion @ Matrix.Translation(Vector((0.004, 0, 0))) @ Matrix.Diagonal(Vector((0.004, 0.016, 0.024, 1.0))))

    # 2. Engine Bay Jewel Oil Filler Cap (Mounted on right cylinder bank, Y = +1.280m, Z = 0.680m)
    mat_oil = Matrix.Translation(Vector((0.240, 1.280, 0.685)))
    bmesh.ops.create_cylinder(bm_knurl, radius=0.040, depth=0.024, segments=24, matrix=mat_oil)
    # Knurled Grip Flange
    bmesh.ops.create_cylinder(bm_knurl, radius=0.045, depth=0.010, segments=24, matrix=mat_oil @ Matrix.Translation(Vector((0, 0, 0.008))))
    # Top Chrome Medallion with Oil Can Icon
    bmesh.ops.create_cylinder(bm_chrome, radius=0.032, depth=0.006, segments=20, matrix=mat_oil @ Matrix.Translation(Vector((0, 0, 0.014))))

    obj_knurl = link_obj("GEO_BENTLEY_Mulliner_Jewel_Knurled_Caps", bm_knurl, parent_col, mats["knurled_metal"], bevel=0.0006)
    obj_chrome = link_obj("GEO_BENTLEY_Jewel_Caps_Chrome_Medallions", bm_chrome, parent_col, mats["chrome"], bevel=0.0005)

    objs.extend([obj_knurl, obj_chrome])
    return objs


# ----------------------------------------------------------------------------
# 7. SUBSYSTEM 6: SCULPTED AERODYNAMIC TEARDROP SIDE VIEW MIRRORS
# ----------------------------------------------------------------------------

def build_bentley_door_mirrors(parent_col, mats):
    """
    Constructs the aerodynamically sculpted exterior rearview door mirrors:
    - High-efficiency teardrop housing finished in body-color Sequin Blue metallic.
    - Robust polished chrome lower mounting pedestal stalks emerging from front door waistlines.
    - Integrated razor-thin sweeping amber dynamic LED turn repeater light-pipe.
    - First-surface optical mirror glass with electrochromic auto-dimming blue hue and blind-spot indicator icon.
    - Low-drag aero separation lip along outboard housing trailing edge.
    """
    objs = []
    bm_housing = bmesh.new()
    bm_stalk = bmesh.new()
    bm_glass = bmesh.new()
    bm_turn = bmesh.new()

    for mx_sign in [-1.0, 1.0]:
        mat_base = Matrix.Translation(Vector((mx_sign * 0.865, 0.620, 0.840)))

        # 1. Polished Chrome Mounting Pedestal Stalk (Rising from door beltline)
        mat_stalk_p = mat_base @ Euler((0, -mx_sign * math.radians(22), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_stalk, radius=0.018, depth=0.110, segments=16, matrix=mat_stalk_p @ Matrix.Translation(Vector((mx_sign * 0.040, 0, 0.040))))

        # 2. Main Teardrop Sculpted Mirror Shell (X = +-0.940m, Y = 0.610m, Z = 0.900m)
        mat_shell = Matrix.Translation(Vector((mx_sign * 0.945, 0.610, 0.900))) @ Euler((0, -mx_sign * math.radians(6), mx_sign * math.radians(8)), 'XYZ').to_matrix().to_4x4()
        # Sculpted Teardrop Ellipsoid Shell
        bmesh.ops.create_cube(bm_housing, size=1.0, matrix=mat_shell @ Matrix.Diagonal(Vector((0.140, 0.220, 0.120, 1.0))))
        # Outboard Aerodynamic Separation Edge
        mat_aero_lip = mat_shell @ Matrix.Translation(Vector((mx_sign * 0.065, 0.0, 0.0)))
        bmesh.ops.create_cube(bm_housing, size=1.0, matrix=mat_aero_lip @ Matrix.Diagonal(Vector((0.016, 0.210, 0.110, 1.0))))

        # 3. Sweeping Amber Dynamic LED Turn Signal Repeater Ribbon
        mat_rep = mat_shell @ Matrix.Translation(Vector((0.0, 0.095, -0.010)))
        bmesh.ops.create_cube(bm_turn, size=1.0, matrix=mat_rep @ Matrix.Diagonal(Vector((0.130, 0.014, 0.012, 1.0))))

        # 4. First-Surface Optical Mirror Glass (Rearward-facing at Y = -0.095m)
        mat_m_glass = mat_shell @ Matrix.Translation(Vector((0.0, -0.095, 0.0)))
        bmesh.ops.create_cube(bm_glass, size=1.0, matrix=mat_m_glass @ Matrix.Diagonal(Vector((0.125, 0.008, 0.105, 1.0))))

        # Mirror Black Plastic Perimeter Bezel Gasket
        mat_gasket = mat_shell @ Matrix.Translation(Vector((0.0, -0.088, 0.0)))
        bmesh.ops.create_cube(bm_stalk, size=1.0, matrix=mat_gasket @ Matrix.Diagonal(Vector((0.134, 0.008, 0.114, 1.0))))

    obj_housing = link_obj("GEO_BENTLEY_Mirror_Painted_Housings", bm_housing, parent_col, mats["paint"], bevel=0.0015)
    obj_stalk = link_obj("GEO_BENTLEY_Mirror_Chrome_Mounting_Stalks", bm_stalk, parent_col, mats["chrome"], bevel=0.001)
    obj_glass = link_obj("GEO_BENTLEY_Mirror_Optical_Reflective_Glass", bm_glass, parent_col, mats["mirror_glass"], bevel=0.0004)
    obj_turn = link_obj("GEO_BENTLEY_Mirror_Amber_LED_Turn_Repeaters", bm_turn, parent_col, mats["amber_indicator"], bevel=0.0005)

    objs.extend([obj_housing, obj_stalk, obj_glass, obj_turn])
    return objs
'''
