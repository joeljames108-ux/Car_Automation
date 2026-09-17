"""
Porsche 911 (993) Carrera Cabriolet — Phase 16: Part C
Subsystem 6: Recessed Door Handles & Keylock Cylinders
Subsystem 7: Enamel Stuttgart Porsche Hood Crest Wappen Badge
Subsystem 8: Raised 3D Cursive "Carrera" Rear Decklid Badging
Subsystem 9: Retractable Spoiler Airflow Louvers & Accordion Bellows
"""

PART_P2_C = '''
# ----------------------------------------------------------------------------
# 6. SUBSYSTEM 6: RECESSED DOOR HANDLES & KEYLOCK CYLINDERS
# ----------------------------------------------------------------------------

def build_993_recessed_door_handles_and_keylocks(parent_col, mats):
    """
    Constructs the flush aerodynamic exterior door handles:
    - Recessed finger pocket depression scooped into door skin (X = +/- 0.865m, Y = +0.050m, Z = 0.770m).
    - Ergonomic pull-trigger paddle lever with satin black textured grip.
    - Perimeter black rubber sealing gasket.
    - Polished chrome micro keylock tumbler with spring-loaded dust shutter.
    """
    objs = []
    bm_handle = bmesh.new()
    bm_pocket = bmesh.new()
    bm_chrome = bmesh.new()

    for dx_sign in [-1.0, 1.0]:
        # Handle Position on Door Waist: X = +/- 0.865m, Y = +0.050m, Z = 0.770m
        mat_h = Matrix.Translation(Vector((dx_sign * 0.865, 0.050, 0.770))) @ Euler((0, dx_sign * math.radians(-6), 0), 'XYZ').to_matrix().to_4x4()

        # 1. Recessed Finger Pocket Depression
        bmesh.ops.create_cube(bm_pocket, size=1.0, matrix=mat_h @ Matrix.Diagonal(Vector((0.024, 0.165, 0.048, 1.0))))
        # Pocket Beveled Inner Floor
        mat_floor = mat_h @ Matrix.Translation(Vector((dx_sign * -0.008, 0, 0)))
        bmesh.ops.create_cube(bm_pocket, size=1.0, matrix=mat_floor @ Matrix.Diagonal(Vector((0.016, 0.150, 0.038, 1.0))))

        # 2. Ergonomic Pull-Paddle Trigger Lever (Pivots outward)
        mat_paddle = mat_h @ Matrix.Translation(Vector((dx_sign * 0.006, -0.012, 0.004)))
        bmesh.ops.create_cube(bm_handle, size=1.0, matrix=mat_paddle @ Matrix.Diagonal(Vector((0.018, 0.115, 0.032, 1.0))))

        # Paddle Finger Grip Undercut Lip
        mat_lip = mat_paddle @ Matrix.Translation(Vector((dx_sign * -0.004, 0, -0.012)))
        bmesh.ops.create_cube(bm_handle, size=1.0, matrix=mat_lip @ Matrix.Diagonal(Vector((0.010, 0.100, 0.010, 1.0))))

        # 3. Polished Chrome Keylock Tumbler (Driver side & Passenger side)
        mat_lock = mat_h @ Matrix.Translation(Vector((dx_sign * 0.008, 0.058, 0.000)))
        # Chrome Outer Bezel Ring
        bmesh.ops.create_cylinder(bm_chrome, radius=0.009, depth=0.012, segments=16, matrix=mat_lock @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())
        # Central Key Slot Shutter Recess
        bmesh.ops.create_cube(bm_chrome, size=1.0, matrix=mat_lock @ Matrix.Translation(Vector((dx_sign * 0.006, 0, 0))) @ Matrix.Diagonal(Vector((0.004, 0.008, 0.002, 1.0))))

    obj_handle = link_obj("GEO_993_Door_Handle_Paddles", bm_handle, parent_col, mats["body"], bevel=0.001)
    obj_pocket = link_obj("GEO_993_Door_Handle_Recessed_Pockets", bm_pocket, parent_col, mats["rubber"], bevel=0.0015)
    obj_chrome = link_obj("GEO_993_Door_Keylock_Cylinders", bm_chrome, parent_col, mats["chrome"], bevel=0.0005)

    objs.extend([obj_handle, obj_pocket, obj_chrome])
    return objs

# ----------------------------------------------------------------------------
# 7. SUBSYSTEM 7: ENAMEL STUTTGART PORSCHE HOOD CREST WAPPEN BADGE
# ----------------------------------------------------------------------------

def build_993_stuttgart_porsche_hood_crest(parent_col, mats):
    """
    Constructs the iconic Porsche Wappen (Coat of Arms) hood crest:
    - Centered on the front luggage compartment lid nose (X = 0.000m, Y = +1.720m, Z = 0.645m).
    - 24-Karat Gold Plated Shield Bezel with pointed lower tip.
    - Arched upper header embossed with 'PORSCHE' lettering bar.
    - Quartered Heraldic Shield:
      * Upper-left & Lower-right: Württemberg black deer antlers on gold ground.
      * Upper-right & Lower-left: Red and black horizontal heraldic stripes.
    - Central Inescutcheon: Stuttgart city crest with black prancing horse (Ross).
    - Neoprene rubber mounting gasket between crest and curved body sheetmetal.
    """
    objs = []
    bm_gold = bmesh.new()
    bm_red = bmesh.new()
    bm_black = bmesh.new()
    bm_gasket = bmesh.new()

    # Hood Crest Axis on Frunk Nose: Y = +1.720m, Z = 0.645m, angled along hood slope (~32 deg)
    mat_crest = Matrix.Translation(Vector((0.0, 1.720, 0.645))) @ Euler((math.radians(-32), 0, 0), 'XYZ').to_matrix().to_4x4()

    # 1. Base Rubber Mounting Gasket (Cushion against paint)
    bmesh.ops.create_cube(bm_gasket, size=1.0, matrix=mat_crest @ Matrix.Diagonal(Vector((0.038, 0.004, 0.052, 1.0))))

    # 2. 24K Gold Outer Shield Bezel Frame
    mat_gold_base = mat_crest @ Matrix.Translation(Vector((0, 0.002, 0)))
    bmesh.ops.create_cube(bm_gold, size=1.0, matrix=mat_gold_base @ Matrix.Diagonal(Vector((0.035, 0.004, 0.048, 1.0))))

    # Pointed Lower Triangular Tip of Shield
    mat_tip = mat_gold_base @ Matrix.Translation(Vector((0, 0, -0.024)))
    bmesh.ops.create_cone(bm_gold, radius1=0.0175, radius2=0.002, depth=0.014, segments=4, matrix=mat_tip @ Euler((math.pi * 0.25, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Arched Upper "PORSCHE" Header Bar
    mat_header = mat_gold_base @ Matrix.Translation(Vector((0, 0.002, 0.021)))
    bmesh.ops.create_cube(bm_gold, size=1.0, matrix=mat_header @ Matrix.Diagonal(Vector((0.034, 0.005, 0.009, 1.0))))

    # 3. Quartered Fields:
    # Upper-Right & Lower-Left: Red Enamel Heraldic Bars
    for rx_off, rz_off in [(0.009, 0.008), (-0.009, -0.008)]:
        mat_red_q = mat_gold_base @ Matrix.Translation(Vector((rx_off, 0.003, rz_off)))
        bmesh.ops.create_cube(bm_red, size=1.0, matrix=mat_red_q @ Matrix.Diagonal(Vector((0.014, 0.003, 0.014, 1.0))))
        # Red and Black Striped inlays
        mat_black_stripe = mat_red_q @ Matrix.Translation(Vector((0, 0.002, 0)))
        bmesh.ops.create_cube(bm_black, size=1.0, matrix=mat_black_stripe @ Matrix.Diagonal(Vector((0.014, 0.003, 0.005, 1.0))))

    # Upper-Left & Lower-Right: Black Württemberg Antlers on Gold ground
    for ax_off, az_off in [(-0.009, 0.008), (0.009, -0.008)]:
        # 3 stylized black antler tines
        for t_idx in [-0.003, 0.000, 0.003]:
            mat_antler = mat_gold_base @ Matrix.Translation(Vector((ax_off, 0.003, az_off + t_idx)))
            bmesh.ops.create_cube(bm_black, size=1.0, matrix=mat_antler @ Matrix.Diagonal(Vector((0.012, 0.002, 0.002, 1.0))))

    # 4. Central Inescutcheon: Stuttgart Prancing Horse (Ross)
    mat_horse_shield = mat_gold_base @ Matrix.Translation(Vector((0, 0.004, 0.000)))
    # Central Gold Inescutcheon Border
    bmesh.ops.create_cube(bm_gold, size=1.0, matrix=mat_horse_shield @ Matrix.Diagonal(Vector((0.012, 0.002, 0.016, 1.0))))
    # Black Prancing Horse Silhouette
    bmesh.ops.create_cube(bm_black, size=1.0, matrix=mat_horse_shield @ Matrix.Translation(Vector((0, 0.002, 0))) @ Matrix.Diagonal(Vector((0.008, 0.002, 0.012, 1.0))))

    obj_gold = link_obj("GEO_993_PorscheCrest_Gold_Bezel", bm_gold, parent_col, mats["gold"], bevel=0.0005)
    obj_red = link_obj("GEO_993_PorscheCrest_Red_Enamel", bm_red, parent_col, mats["enamel_red"], bevel=0.0003)
    obj_black = link_obj("GEO_993_PorscheCrest_Black_Enamel", bm_black, parent_col, mats["enamel_black"], bevel=0.0003)
    obj_gasket = link_obj("GEO_993_PorscheCrest_Mounting_Gasket", bm_gasket, parent_col, mats["rubber"], bevel=0.0005)

    objs.extend([obj_gold, obj_red, obj_black, obj_gasket])
    return objs

# ----------------------------------------------------------------------------
# 8. SUBSYSTEM 8: RAISED 3D CURSIVE "CARRERA" REAR DECKLID BADGING
# ----------------------------------------------------------------------------

def build_993_raised_carrera_rear_decklid_script(parent_col, mats):
    """
    Constructs the authentic 3D scripted "Carrera" decklid emblem:
    - Centered on the lower engine lid deck (X = 0.000m, Y = -1.880m, Z = 0.730m).
    - Authentic cursive script with connected strokes:
      * Capital 'C' with graceful top swoop and lower baseline curve.
      * Fluid lowercase 'a-r-r-e-r-a' script with authentic baseline ligature connections.
    - Extruded 3D profile with satin black anodized finish and subtle silver edge chamfer.
    """
    objs = []
    bm_script = bmesh.new()

    # Decklid Script Axis: Y = -1.880m, Z = 0.730m, angled along rear deck slope (~20 deg)
    mat_script = Matrix.Translation(Vector((0.0, -1.880, 0.730))) @ Euler((math.radians(20), 0, 0), 'XYZ').to_matrix().to_4x4()

    # Cursive Letter Segment Offsets (Total span ~220mm, X = -0.110m to +0.110m)
    # 1. Capital 'C'
    mat_c = mat_script @ Matrix.Translation(Vector((-0.085, 0.006, 0.005)))
    bmesh.ops.create_cylinder(bm_script, radius=0.024, depth=0.006, segments=20, matrix=mat_c @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    # Cutout inner loop of C
    mat_c_inner = mat_c @ Matrix.Translation(Vector((0.008, 0, 0)))
    bmesh.ops.create_cylinder(bm_script, radius=0.015, depth=0.008, segments=16, matrix=mat_c_inner @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Lowercase 'a' (First)
    mat_a1 = mat_script @ Matrix.Translation(Vector((-0.052, 0.006, -0.004)))
    bmesh.ops.create_cylinder(bm_script, radius=0.014, depth=0.006, segments=16, matrix=mat_a1 @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    bmesh.ops.create_cube(bm_script, size=1.0, matrix=mat_a1 @ Matrix.Translation(Vector((0.011, 0, -0.002))) @ Matrix.Diagonal(Vector((0.005, 0.006, 0.018, 1.0))))

    # 3. Lowercase 'r' (First)
    mat_r1 = mat_script @ Matrix.Translation(Vector((-0.025, 0.006, -0.002)))
    bmesh.ops.create_cube(bm_script, size=1.0, matrix=mat_r1 @ Matrix.Diagonal(Vector((0.005, 0.006, 0.022, 1.0))))
    bmesh.ops.create_cube(bm_script, size=1.0, matrix=mat_r1 @ Matrix.Translation(Vector((0.007, 0, 0.006))) @ Matrix.Diagonal(Vector((0.012, 0.006, 0.005, 1.0))))

    # 4. Lowercase 'r' (Second)
    mat_r2 = mat_script @ Matrix.Translation(Vector((0.000, 0.006, -0.002)))
    bmesh.ops.create_cube(bm_script, size=1.0, matrix=mat_r2 @ Matrix.Diagonal(Vector((0.005, 0.006, 0.022, 1.0))))
    bmesh.ops.create_cube(bm_script, size=1.0, matrix=mat_r2 @ Matrix.Translation(Vector((0.007, 0, 0.006))) @ Matrix.Diagonal(Vector((0.012, 0.006, 0.005, 1.0))))

    # 5. Lowercase 'e'
    mat_e = mat_script @ Matrix.Translation(Vector((0.028, 0.006, -0.003)))
    bmesh.ops.create_cylinder(bm_script, radius=0.013, depth=0.006, segments=16, matrix=mat_e @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    bmesh.ops.create_cube(bm_script, size=1.0, matrix=mat_e @ Matrix.Translation(Vector((0, 0, 0.002))) @ Matrix.Diagonal(Vector((0.018, 0.006, 0.004, 1.0))))

    # 6. Lowercase 'r' (Third)
    mat_r3 = mat_script @ Matrix.Translation(Vector((0.055, 0.006, -0.002)))
    bmesh.ops.create_cube(bm_script, size=1.0, matrix=mat_r3 @ Matrix.Diagonal(Vector((0.005, 0.006, 0.022, 1.0))))
    bmesh.ops.create_cube(bm_script, size=1.0, matrix=mat_r3 @ Matrix.Translation(Vector((0.007, 0, 0.006))) @ Matrix.Diagonal(Vector((0.012, 0.006, 0.005, 1.0))))

    # 7. Lowercase 'a' (Final with trailing flourish)
    mat_a2 = mat_script @ Matrix.Translation(Vector((0.082, 0.006, -0.004)))
    bmesh.ops.create_cylinder(bm_script, radius=0.014, depth=0.006, segments=16, matrix=mat_a2 @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    bmesh.ops.create_cube(bm_script, size=1.0, matrix=mat_a2 @ Matrix.Translation(Vector((0.011, 0, -0.002))) @ Matrix.Diagonal(Vector((0.005, 0.006, 0.018, 1.0))))
    # Trailing baseline flourish tail
    bmesh.ops.create_cube(bm_script, size=1.0, matrix=mat_a2 @ Matrix.Translation(Vector((0.018, 0, -0.010))) @ Euler((0, 0, math.radians(25)), 'XYZ').to_matrix().to_4x4() @ Matrix.Diagonal(Vector((0.016, 0.006, 0.004, 1.0))))

    # Baseline Script Connecting Ligatures
    mat_lig = mat_script @ Matrix.Translation(Vector((0.000, 0.005, -0.012)))
    bmesh.ops.create_cube(bm_script, size=1.0, matrix=mat_lig @ Matrix.Diagonal(Vector((0.180, 0.004, 0.003, 1.0))))

    obj_carrera = link_obj("GEO_993_Carrera_Rear_Decklid_Script", bm_script, parent_col, mats["rubber"], bevel=0.0006)
    objs.append(obj_carrera)
    return objs

# ----------------------------------------------------------------------------
# 9. SUBSYSTEM 9: RETRACTABLE SPOILER AIRFLOW LOUVERS & BELLOWS
# ----------------------------------------------------------------------------

def build_993_retractable_spoiler_louvers_and_bellows(parent_col, mats):
    """
    Constructs the speed-activated retractable rear spoiler louvers and bellows:
    - Integrated into the upper engine lid (Y: -1.650m to -1.860m, Z = 0.745m).
    - Spoiler Aerodynamic Upper Wing Flap with 8 horizontal airflow cooling louvers.
    - Accordion Pleated Side Bellows (Left & Right multi-fold black rubber boots).
    - Under-spoiler electric rack-and-pinion drive spindle and limit switch brackets.
    """
    objs = []
    bm_wing = bmesh.new()
    bm_louvers = bmesh.new()
    bm_bellows = bmesh.new()

    # Spoiler Axis: Y = -1.755m, Z = 0.745m, angled along deck slope (~16 deg)
    mat_sp = Matrix.Translation(Vector((0.0, -1.755, 0.745))) @ Euler((math.radians(16), 0, 0), 'XYZ').to_matrix().to_4x4()

    # 1. Movable Spoiler Aerodynamic Upper Wing Flap (Width 0.740m, Length 0.220m)
    bmesh.ops.create_cube(bm_wing, size=1.0, matrix=mat_sp @ Matrix.Diagonal(Vector((0.740, 0.220, 0.024, 1.0))))

    # Trailing Edge Aerodynamic Gurney/Lip Extension
    mat_lip = mat_sp @ Matrix.Translation(Vector((0, -0.105, 0.008)))
    bmesh.ops.create_cube(bm_wing, size=1.0, matrix=mat_lip @ Matrix.Diagonal(Vector((0.730, 0.016, 0.014, 1.0))))

    # 2. 8 Horizontal Engine Airflow Cooling Louver Slats (Spanning central 580mm)
    for l_idx in range(8):
        ly_off = -0.075 + l_idx * 0.022
        # Louver blade tilted 28 degrees for air induction
        mat_louver = mat_sp @ Matrix.Translation(Vector((0, ly_off, 0.005))) @ Euler((math.radians(28), 0, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_louvers, size=1.0, matrix=mat_louver @ Matrix.Diagonal(Vector((0.580, 0.018, 0.003, 1.0))))

    # Central Louver Reinforcing Spine
    mat_spine = mat_sp @ Matrix.Translation(Vector((0, 0.000, 0.004)))
    bmesh.ops.create_cube(bm_louvers, size=1.0, matrix=mat_spine @ Matrix.Diagonal(Vector((0.016, 0.180, 0.008, 1.0))))

    # 3. Accordion Pleated Side Bellows (Left & Right sides)
    for bx_sign in [-1.0, 1.0]:
        mat_bell_side = mat_sp @ Matrix.Translation(Vector((bx_sign * 0.355, 0.000, -0.025)))

        # 4 Pleated Accordion Rubber Folds
        for pleat in range(4):
            pl_z = -0.015 - pleat * 0.012
            pl_width = 0.020 + (pleat % 2) * 0.008
            mat_pleat = mat_bell_side @ Matrix.Translation(Vector((0, 0, pl_z)))
            bmesh.ops.create_cube(bm_bellows, size=1.0, matrix=mat_pleat @ Matrix.Diagonal(Vector((pl_width, 0.200, 0.008, 1.0))))

    obj_wing = link_obj("GEO_993_Retractable_Spoiler_Flap", bm_wing, parent_col, mats["body"], bevel=0.002)
    obj_louvers = link_obj("GEO_993_Spoiler_Cooling_Louvers", bm_louvers, parent_col, mats["rubber"], bevel=0.0008)
    obj_bellows = link_obj("GEO_993_Spoiler_Accordion_Bellows", bm_bellows, parent_col, mats["rubber"], bevel=0.001)

    objs.extend([obj_wing, obj_louvers, obj_bellows])
    return objs
'''
