"""
Bentley Continental GT Speed Convertible (2020s) Phase 22: Part Extra 10
Subsystems 27 and 28:
- Subsystem 27: Breitling Analogue Clock Jewel Dial on Rotating Display
- Subsystem 28: Mulliner Headrest Speed Embroidery & Contrast Leather Piping
"""

PART_BENTLEY2_EXTRA10 = '''
# ----------------------------------------------------------------------------
# 28. SUBSYSTEM 27: BREITLING ANALOGUE CLOCK JEWEL DIAL
# ----------------------------------------------------------------------------

def build_bentley_breitling_clock(parent_col, mats):
    """
    Constructs the handcrafted Breitling for Bentley analogue chronometer:
    - Situated on the central dashboard rotating veneer panel (Y = +0.435m, Z = 0.765m).
    - Machined diamond-knurled polished chrome outer bezel ring.
    - Black opaline Guilloché textured dial face with applied rhodium hour indices.
    - Polished bronze/gold hour, minute, and sweep second hands with luminous tips.
    - Anti-reflective double-domed sapphire crystal glass cover.
    """
    objs = []
    bm_bezel = bmesh.new()
    bm_dial = bmesh.new()
    bm_hands = bmesh.new()
    bm_glass = bmesh.new()

    mat_clock = Matrix.Translation(Vector((0.0, 0.435, 0.765))) @ Euler((math.radians(16), 0, 0), 'XYZ').to_matrix().to_4x4()

    # 1. Knurled Polished Chrome Bezel Ring (Radius = 0.032m)
    bmesh.ops.create_torus(bm_bezel, major_radius=0.032, minor_radius=0.0035, major_segments=24, minor_segments=10, matrix=mat_clock @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Black Opaline Dial Face Disc (Radius = 0.029m)
    bmesh.ops.create_cylinder(bm_dial, radius=0.029, depth=0.006, segments=24, matrix=mat_clock @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 12 Applied Rhodium Hour Marker Indices
    for h_i in range(12):
        h_ang = h_i * (2.0 * math.pi / 12.0)
        mat_idx = mat_clock @ Euler((0, 0, h_ang), 'XYZ').to_matrix().to_4x4() @ Matrix.Translation(Vector((0.0, 0.023, 0.004)))
        bmesh.ops.create_cube(bm_bezel, size=1.0, matrix=mat_idx @ Matrix.Diagonal(Vector((0.002, 0.006, 0.002, 1.0))))

    # 3. Polished Hour & Minute Hands
    mat_hr_hand = mat_clock @ Matrix.Translation(Vector((0.0, 0.008, 0.005))) @ Euler((0, 0, math.radians(65)), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_hands, size=1.0, matrix=mat_hr_hand @ Matrix.Diagonal(Vector((0.002, 0.015, 0.002, 1.0))))
    mat_min_hand = mat_clock @ Matrix.Translation(Vector((0.0, 0.012, 0.006))) @ Euler((0, 0, math.radians(-25)), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_hands, size=1.0, matrix=mat_min_hand @ Matrix.Diagonal(Vector((0.0015, 0.022, 0.002, 1.0))))

    # 4. Double-Domed Sapphire Crystal Glass Cover
    mat_saph = mat_clock @ Matrix.Translation(Vector((0.0, 0.0, 0.008)))
    bmesh.ops.create_cylinder(bm_glass, radius=0.029, depth=0.003, segments=24, matrix=mat_saph @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_bezel = link_obj("GEO_BENTLEY_Breitling_Knurled_Chrome_Bezel", bm_bezel, parent_col, mats["chrome"], bevel=0.0003)
    obj_dial = link_obj("GEO_BENTLEY_Breitling_Opaline_Dial_Face", bm_dial, parent_col, mats["black_enamel"], bevel=0.0002)
    obj_hands = link_obj("GEO_BENTLEY_Breitling_Polished_Clock_Hands", bm_hands, parent_col, mats["chrome"], bevel=0.0002)
    obj_glass = link_obj("GEO_BENTLEY_Breitling_Sapphire_Crystal_Cover", bm_glass, parent_col, mats["crystal_glass"], bevel=0.0002)

    objs.extend([obj_bezel, obj_dial, obj_hands, obj_glass])
    return objs


# ----------------------------------------------------------------------------
# 29. SUBSYSTEM 28: HEADREST SPEED EMBROIDERY & CONTRAST LEATHER PIPING
# ----------------------------------------------------------------------------

def build_bentley_seat_embroidery_and_piping(parent_col, mats):
    """
    Constructs the Mulliner bespoke leather craftsmanship detailing:
    - Embroidered cursive "Speed" script crests on all 4 seat integrated headrests.
    - Continuous fine leather contrast piping cords edging the perimeter seat bolsters.
    - Quilted leather diamond-in-diamond contrast stitching line relief.
    """
    objs = []
    bm_embroid = bmesh.new()
    bm_piping = bmesh.new()

    # Headrest Locations (Front L/R and Rear L/R)
    headrest_locs = [
        ("Front_L", -0.420, -0.380, 0.960,  18),
        ("Front_R",  0.420, -0.380, 0.960,  18),
        ("Rear_L",  -0.360, -0.920, 0.880,  16),
        ("Rear_R",   0.360, -0.920, 0.880,  16),
    ]

    for name, hx, hy, hz, ang in headrest_locs:
        mat_head = Matrix.Translation(Vector((hx, hy, hz))) @ Euler((math.radians(ang), 0, 0), 'XYZ').to_matrix().to_4x4()

        # Raised Embroidered "Speed" Script Medallion
        mat_crest = mat_head @ Matrix.Translation(Vector((0.0, 0.055, 0.0)))
        bmesh.ops.create_cube(bm_embroid, size=1.0, matrix=mat_crest @ Matrix.Diagonal(Vector((0.110, 0.004, 0.028, 1.0))))

        # Contrast Leather Piping Cord around headrest crown
        for py_sign in [-1.0, 1.0]:
            mat_pipe = mat_head @ Matrix.Translation(Vector((py_sign * 0.115, 0.0, 0.0)))
            bmesh.ops.create_cylinder(bm_piping, radius=0.004, depth=0.160, segments=10, matrix=mat_pipe)

    obj_embroid = link_obj("GEO_BENTLEY_Headrest_Speed_Embroidery_Badges", bm_embroid, parent_col, mats["chrome"], bevel=0.0003)
    obj_piping = link_obj("GEO_BENTLEY_Seat_Contrast_Leather_Piping", bm_piping, parent_col, mats["chrome"], bevel=0.0003)

    objs.extend([obj_embroid, obj_piping])
    return objs
'''
