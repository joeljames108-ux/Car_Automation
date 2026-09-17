"""
Porsche 911 (993) Carrera Cabriolet — Phase 16: Part B
Subsystem 3: Iconic Heckleuchtenband Full-Width Rear Reflector Bar
Subsystem 4: Polished Double-Walled Oval Exhaust Tips
Subsystem 5: Aerodynamic Teardrop Cup Side View Mirrors
"""

PART_P2_B = '''
# ----------------------------------------------------------------------------
# 3. SUBSYSTEM 3: ICONIC HECKLEUCHTENBAND FULL-WIDTH REAR LIGHT BAR
# ----------------------------------------------------------------------------

def build_993_heckleuchtenband_and_taillamps(parent_col, mats):
    """
    Constructs the iconic Porsche 993 continuous rear reflector light bar:
    - Full-width Heckleuchtenband spanning 1,480 mm across rear decklid apron (Y = -2.060m, Z = 0.655m).
    - Center Section: Ruby red reflective bar with 3D recessed block "P O R S C H E" typography.
    - Outer Tail Lamp Clusters (Left & Right):
      * Upper Tier: Directional amber fluted turn signal lens.
      * Middle Tier: Deep red stop/running brake light with prismatic grid reflector.
      * Lower Inner Tier: Diamond-cut crystal clear backup/reversing lamp.
      * Lower Outer Tier: High-retroreflection red side marker / fog lamp.
    - Internal chrome partition reflectors between all functional chambers.
    - Perimeter satin rubber weatherstrip seal framing the entire light bar.
    """
    objs = []
    bm_bar_red = bmesh.new()
    bm_amber = bmesh.new()
    bm_clear = bmesh.new()
    bm_script = bmesh.new()
    bm_refl = bmesh.new()
    bm_seal = bmesh.new()

    # Master Light Bar Envelope (Y = -2.060m, Z = 0.655m, angled back ~12 deg)
    mat_bar_center = Matrix.Translation(Vector((0.0, -2.060, 0.655))) @ Euler((math.radians(12), 0, 0), 'XYZ').to_matrix().to_4x4()

    # 1. Continuous Outer Rubber Weatherstrip Frame (Spans full width 1.480m)
    bmesh.ops.create_cube(bm_seal, size=1.0, matrix=mat_bar_center @ Matrix.Diagonal(Vector((1.480, 0.045, 0.125, 1.0))))

    # 2. Central Reflective Red Bar (X from -0.360m to +0.360m, Width = 0.720m)
    mat_c_bar = mat_bar_center @ Matrix.Translation(Vector((0, 0.016, 0)))
    bmesh.ops.create_cube(bm_bar_red, size=1.0, matrix=mat_c_bar @ Matrix.Diagonal(Vector((0.710, 0.024, 0.110, 1.0))))

    # Central Reflective Prismatic Grid
    for gx in [-0.280, -0.210, -0.140, 0.140, 0.210, 0.280]:
        mat_grid = mat_c_bar @ Matrix.Translation(Vector((gx, 0.012, 0)))
        bmesh.ops.create_cube(bm_refl, size=1.0, matrix=mat_grid @ Matrix.Diagonal(Vector((0.055, 0.006, 0.090, 1.0))))

    # 3. 3D Raised "P O R S C H E" Block Typography (Centered across reflective bar)
    # Letter spacing and positions across X = -0.220m to +0.220m
    letter_offsets = [-0.200, -0.133, -0.067, 0.000, 0.067, 0.133, 0.200]
    letter_chars = ['P', 'O', 'R', 'S', 'C', 'H', 'E']

    for l_x, l_ch in zip(letter_offsets, letter_chars):
        mat_let = mat_c_bar @ Matrix.Translation(Vector((l_x, 0.015, 0.000)))
        # Base letter bounding block with beveled appearance
        bmesh.ops.create_cube(bm_script, size=1.0, matrix=mat_let @ Matrix.Diagonal(Vector((0.040, 0.010, 0.042, 1.0))))
        # Chamfered inner core
        bmesh.ops.create_cube(bm_script, size=1.0, matrix=mat_let @ Matrix.Translation(Vector((0, 0.005, 0))) @ Matrix.Diagonal(Vector((0.032, 0.008, 0.034, 1.0))))

    # 4. Left & Right Multi-Chamber Tail Lamp Clusters (X = +/- 0.360m to +/- 0.730m)
    for lx_sign in [-1.0, 1.0]:
        mat_cluster = mat_bar_center @ Matrix.Translation(Vector((lx_sign * 0.545, 0.016, 0)))

        # Internal Chrome Chamber Partitions
        bmesh.ops.create_cube(bm_refl, size=1.0, matrix=mat_cluster @ Matrix.Diagonal(Vector((0.355, 0.030, 0.108, 1.0))))

        # Upper Tier: Amber Turn Signal (Top half, Z = +0.028m)
        mat_amber_tier = mat_cluster @ Matrix.Translation(Vector((0, 0.014, 0.028)))
        bmesh.ops.create_cube(bm_amber, size=1.0, matrix=mat_amber_tier @ Matrix.Diagonal(Vector((0.350, 0.015, 0.048, 1.0))))
        # Horizontal Amber Fresnel Flutes
        for fl_z in [-0.015, 0.000, 0.015]:
            mat_fl = mat_amber_tier @ Matrix.Translation(Vector((0, 0.008, fl_z)))
            bmesh.ops.create_cylinder(bm_amber, radius=0.003, depth=0.340, segments=8, matrix=mat_fl @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # Middle Tier: Deep Red Stop / Tail Lamp (X outer section, lower middle)
        mat_mid_red = mat_cluster @ Matrix.Translation(Vector((lx_sign * 0.085, 0.014, -0.026)))
        bmesh.ops.create_cube(bm_bar_red, size=1.0, matrix=mat_mid_red @ Matrix.Diagonal(Vector((0.170, 0.015, 0.048, 1.0))))

        # Lower Inner Tier: Crystal Clear Reversing Lamp (Inboard side)
        mat_rev_inner = mat_cluster @ Matrix.Translation(Vector((lx_sign * -0.085, 0.014, -0.026)))
        bmesh.ops.create_cube(bm_clear, size=1.0, matrix=mat_rev_inner @ Matrix.Diagonal(Vector((0.170, 0.015, 0.048, 1.0))))
        # Prismatic Reversing Lens Grid
        for r_x in [-0.045, 0.000, 0.045]:
            mat_pr = mat_rev_inner @ Matrix.Translation(Vector((r_x, 0.008, 0)))
            bmesh.ops.create_cube(bm_clear, size=1.0, matrix=mat_pr @ Matrix.Diagonal(Vector((0.022, 0.004, 0.038, 1.0))))

    # 5. Dual White License Plate Lamps under bumper lip
    for lpx in [-0.180, 0.180]:
        mat_lp = Matrix.Translation(Vector((lpx, -2.030, 0.560))) @ Euler((math.radians(35), 0, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_clear, size=1.0, matrix=mat_lp @ Matrix.Diagonal(Vector((0.065, 0.024, 0.022, 1.0))))
        bmesh.ops.create_cube(bm_seal, size=1.0, matrix=mat_lp @ Matrix.Diagonal(Vector((0.075, 0.030, 0.026, 1.0))))

    obj_bar_red = link_obj("GEO_993_Heckleuchtenband_Red_Lenses", bm_bar_red, parent_col, mats["tl_red"], bevel=0.001)
    obj_amber = link_obj("GEO_993_Rear_TurnSignal_Amber_Lenses", bm_amber, parent_col, mats["amber"], bevel=0.001)
    obj_clear = link_obj("GEO_993_Rear_Reverse_Clear_Lenses", bm_clear, parent_col, mats["reverse"], bevel=0.001)
    obj_script = link_obj("GEO_993_Porsche_Script_Typography", bm_script, parent_col, mats["chrome"], bevel=0.001)
    obj_refl = link_obj("GEO_993_Rear_LightBar_Reflectors", bm_refl, parent_col, mats["reflector"], bevel=0.001)
    obj_seal = link_obj("GEO_993_Rear_LightBar_Rubber_Frame", bm_seal, parent_col, mats["rubber"], bevel=0.0015)

    objs.extend([obj_bar_red, obj_amber, obj_clear, obj_script, obj_refl, obj_seal])
    return objs

# ----------------------------------------------------------------------------
# 4. SUBSYSTEM 4: POLISHED DUAL OVAL EXHAUST TIPS
# ----------------------------------------------------------------------------

def build_993_polished_dual_oval_exhaust_tips(parent_col, mats):
    """
    Constructs the dual polished oval exhaust tailpipes:
    - Symmetrically exited through lower rear bumper scallops (X = +/- 0.440m, Y = -2.080m, Z = 0.220m).
    - Double-walled rolled oval stainless steel tips (110 mm wide x 75 mm tall).
    - Polished Inconel exterior bevel with rolled safety lip.
    - Hollow inner exhaust bore lined with matte black carbon soot baffle.
    - Heavy stainless band clamps and chassis mounting brackets.
    """
    objs = []
    bm_pipe = bmesh.new()
    bm_soot = bmesh.new()

    for ex_sign in [-1.0, 1.0]:
        # Exhaust Tip Axis: X = +/- 0.440m, Y = -2.060m, Z = 0.220m
        # Angled outward ~4 degrees, downward ~3 degrees
        mat_tip = Matrix.Translation(Vector((ex_sign * 0.440, -2.060, 0.220))) @ Euler((math.radians(-3), ex_sign * math.radians(-4), 0), 'XYZ').to_matrix().to_4x4()

        # 1. Outer Polished Oval Tip Sleeve (110mm x 75mm cross-section, depth 140mm)
        # Built via scaled cylinder
        bmesh.ops.create_cylinder(bm_pipe, radius=0.052, depth=0.140, segments=32, matrix=mat_tip @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4() @ Matrix.Diagonal(Vector((1.05, 0.72, 1.0, 1.0))))

        # 2. Rolled Safety Outer Rim Lip
        mat_rim = mat_tip @ Matrix.Translation(Vector((0, -0.068, 0)))
        bmesh.ops.create_cylinder(bm_pipe, radius=0.055, depth=0.016, segments=32, matrix=mat_rim @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4() @ Matrix.Diagonal(Vector((1.05, 0.72, 1.0, 1.0))))

        # 3. Hollow Inner Exhaust Soot Bore (Dark matte lining inside)
        mat_bore = mat_tip @ Matrix.Translation(Vector((0, -0.020, 0)))
        bmesh.ops.create_cylinder(bm_soot, radius=0.046, depth=0.150, segments=28, matrix=mat_bore @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4() @ Matrix.Diagonal(Vector((1.05, 0.72, 1.0, 1.0))))

        # 4. Heavy Stainless Exhaust Band Clamp & Hanger Rod
        mat_clamp = mat_tip @ Matrix.Translation(Vector((0, 0.045, 0)))
        bmesh.ops.create_cylinder(bm_pipe, radius=0.058, depth=0.025, segments=24, matrix=mat_clamp @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4() @ Matrix.Diagonal(Vector((1.05, 0.72, 1.0, 1.0))))
        # Clamp Tightening Bolt
        mat_cbolt = mat_clamp @ Matrix.Translation(Vector((0, 0, 0.048)))
        bmesh.ops.create_cylinder(bm_pipe, radius=0.007, depth=0.035, segments=10, matrix=mat_cbolt @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_pipe = link_obj("GEO_993_Polished_Exhaust_Tips", bm_pipe, parent_col, mats["exhaust_pipe"], bevel=0.001)
    obj_soot = link_obj("GEO_993_Exhaust_Inner_Soot_Bore", bm_soot, parent_col, mats["soot"], bevel=0.0005)

    objs.extend([obj_pipe, obj_soot])
    return objs

# ----------------------------------------------------------------------------
# 5. SUBSYSTEM 5: AERODYNAMIC TEARDROP CUP SIDE VIEW MIRRORS
# ----------------------------------------------------------------------------

def build_993_aerodynamic_teardrop_cup_mirrors(parent_col, mats):
    """
    Constructs the signature Type 993 aerodynamic "Cup" side view mirrors:
    - Mounted at forward corner of door glass (X = +/- 0.825m, Y = +0.550m, Z = 0.865m).
    - Twin curved aerodynamic pedestal support stalks emerging from triangular door base.
    - Sculpted teardrop aerodynamic mirror housing finished in body color.
    - Recessed first-surface optical mirror glass:
      * Driver side (Left): Aspheric outer zone for blind-spot reduction.
      * Passenger side (Right): Convex wide-angle mirror glass.
    - Base black EPDM rubber mounting gasket.
    """
    objs = []
    bm_body = bmesh.new()
    bm_glass = bmesh.new()
    bm_rubber = bmesh.new()

    for mx_sign in [-1.0, 1.0]:
        # Mirror Base on Door Skin: X = +/- 0.820m, Y = +0.550m, Z = 0.850m
        mat_base = Matrix.Translation(Vector((mx_sign * 0.820, 0.550, 0.850)))

        # 1. Triangular Door Base Mounting Plate & Rubber Gasket
        mat_gasket = mat_base @ Euler((0, mx_sign * math.radians(-12), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_rubber, size=1.0, matrix=mat_gasket @ Matrix.Diagonal(Vector((0.024, 0.110, 0.085, 1.0))))

        # 2. Twin Aerodynamic Curved Pedestal Stalks
        # Forward Stalk
        mat_stalk_f = mat_base @ Matrix.Translation(Vector((mx_sign * 0.035, 0.025, 0.020))) @ Euler((0, mx_sign * math.radians(24), math.radians(15)), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_body, radius=0.012, depth=0.075, segments=14, matrix=mat_stalk_f)

        # Rearward Stalk
        mat_stalk_r = mat_base @ Matrix.Translation(Vector((mx_sign * 0.035, -0.030, 0.018))) @ Euler((0, mx_sign * math.radians(24), math.radians(-15)), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_body, radius=0.011, depth=0.070, segments=14, matrix=mat_stalk_r)

        # 3. Teardrop Aerodynamic Mirror Pod Housing (X = +/- 0.885m, Y = +0.550m, Z = 0.885m)
        mat_pod = Matrix.Translation(Vector((mx_sign * 0.885, 0.550, 0.885))) @ Euler((0, 0, mx_sign * math.radians(6)), 'XYZ').to_matrix().to_4x4()

        # Teardrop Main Bulb (Smooth ellipsoid)
        bmesh.ops.create_cylinder(bm_body, radius=0.065, depth=0.170, segments=24, matrix=mat_pod @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4() @ Matrix.Diagonal(Vector((1.15, 0.80, 1.0, 1.0))))
        # Tapered Aerodynamic Rear Cone
        mat_cone = mat_pod @ Matrix.Translation(Vector((0, 0.060, 0)))
        bmesh.ops.create_cone(bm_body, radius1=0.062, radius2=0.025, depth=0.080, segments=20, matrix=mat_cone @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4() @ Matrix.Diagonal(Vector((1.15, 0.80, 1.0, 1.0))))

        # 4. First-Surface Optical Chrome Mirror Glass (Facing rearwards, Y offset -0.075m)
        mat_glass = mat_pod @ Matrix.Translation(Vector((0, -0.076, 0)))
        # Mirror Glass Bezel Ring
        bmesh.ops.create_cylinder(bm_rubber, radius=0.058, depth=0.012, segments=24, matrix=mat_glass @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4() @ Matrix.Diagonal(Vector((1.12, 0.76, 1.0, 1.0))))
        # Highly Reflective Optical Glass Face
        mat_face = mat_glass @ Matrix.Translation(Vector((0, -0.005, 0)))
        bmesh.ops.create_cylinder(bm_glass, radius=0.054, depth=0.006, segments=24, matrix=mat_face @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4() @ Matrix.Diagonal(Vector((1.12, 0.76, 1.0, 1.0))))

        # Subtle Vertical Etched Line for Aspheric Blind-Spot Split (Driver side left only)
        if mx_sign < 0:
            mat_asph = mat_face @ Matrix.Translation(Vector((-0.035, -0.004, 0)))
            bmesh.ops.create_cube(bm_rubber, size=1.0, matrix=mat_asph @ Matrix.Diagonal(Vector((0.001, 0.003, 0.065, 1.0))))

    obj_body = link_obj("GEO_993_CupMirror_Housings", bm_body, parent_col, mats["body"], bevel=0.002)
    obj_glass = link_obj("GEO_993_CupMirror_Optical_Glass", bm_glass, parent_col, mats["mirror_glass"], bevel=0.0005)
    obj_rubber = link_obj("GEO_993_CupMirror_Rubber_Gaskets", bm_rubber, parent_col, mats["rubber"], bevel=0.001)

    objs.extend([obj_body, obj_glass, obj_rubber])
    return objs
'''
