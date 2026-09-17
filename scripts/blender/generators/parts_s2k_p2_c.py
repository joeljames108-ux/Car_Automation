"""
Honda S2000 AP1 (2000s) Phase 18: Part C
Subsystems 9 to 12:
9. Articulated Windshield Wiper Arms, Airfoils & Rubber Squeegees
10. Front Bumper Corner Amber Side Marker Lamps & Bezels
11. Soft-Top Rear Window Glass with Electric Defroster Heating Grid
12. Front & Rear Stamped License Plates, Chrome Frames & Fasteners
"""

PART_S2K2_C = '''
# ----------------------------------------------------------------------------
# 11. SUBSYSTEM 9: ARTICULATED WINDSHIELD WIPER ARMS & SQUEEGEES
# ----------------------------------------------------------------------------

def build_s2000_windshield_wiper_arms_and_blades(parent_col, mats):
    """
    Constructs the exterior windshield wiper mechanisms resting in park position:
    - Driver side articulated wiper arm with integrated aerodynamic wind deflector foil.
    - Passenger side curved wiper arm resting parallel along windshield cowl.
    - Steel multi-claw bridge wiper frames conforming to glass curvature.
    - Flexible EPDM synthetic rubber squeegee blades contacting windshield surface.
    """
    objs = []
    bm_arm = bmesh.new()
    bm_blade = bmesh.new()

    # Wiper Pivots: Driver X = -0.380m, Y = 0.770m; Passenger X = +0.120m, Y = 0.770m
    wipers = [
        # Driver Wiper (Longer 500mm blade, X: -0.380m to +0.100m)
        (Vector((-0.380, 0.770, 0.795)), Vector((0.440, -0.060, 0.080)), 0.500, True),
        # Passenger Wiper (450mm blade, X: +0.120m to +0.550m)
        (Vector((0.120, 0.770, 0.795)), Vector((0.410, -0.050, 0.075)), 0.450, False),
    ]

    for p_base, p_span, b_len, has_foil in wipers:
        # 1. Wiper Arm Shaft
        mat_base = Matrix.Translation(p_base)
        mat_arm_center = Matrix.Translation(p_base + p_span * 0.5)
        # Arm Main Shank
        bmesh.ops.create_cube(bm_arm, size=1.0, matrix=mat_arm_center @ Matrix.Diagonal(Vector((p_span.length, 0.014, 0.008, 1.0))))

        # Arm Base Spring Hinge Pivot Knuckle
        bmesh.ops.create_cylinder(bm_arm, radius=0.016, depth=0.024, segments=14, matrix=mat_base @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # Aerodynamic Wind Deflector Foil (Driver side high-speed anti-lift fin)
        if has_foil:
            mat_foil = mat_arm_center @ Matrix.Translation(Vector((0, -0.012, 0.008))) @ Euler((math.radians(-25), 0, 0), 'XYZ').to_matrix().to_4x4()
            bmesh.ops.create_cube(bm_arm, size=1.0, matrix=mat_foil @ Matrix.Diagonal(Vector((p_span.length * 0.75, 0.016, 0.004, 1.0))))

        # 2. Multi-Claw Wiper Blade Frame & Rubber Squeegee
        mat_blade_center = mat_arm_center @ Matrix.Translation(Vector((0, -0.018, -0.006)))
        # Metal Articulated Claw Backbone
        bmesh.ops.create_cube(bm_arm, size=1.0, matrix=mat_blade_center @ Matrix.Diagonal(Vector((b_len, 0.008, 0.012, 1.0))))

        # Flexible Rubber Squeegee Lip
        mat_rubber = mat_blade_center @ Matrix.Translation(Vector((0, 0, -0.008)))
        bmesh.ops.create_cube(bm_blade, size=1.0, matrix=mat_rubber @ Matrix.Diagonal(Vector((b_len, 0.004, 0.008, 1.0))))

    obj_arm = link_obj("GEO_S2K_Wiper_Articulated_Arms", bm_arm, parent_col, mats["trim"], bevel=0.0006)
    obj_blade = link_obj("GEO_S2K_Wiper_Rubber_Squeegees", bm_blade, parent_col, mats["trim"], bevel=0.0004)

    objs.extend([obj_arm, obj_blade])
    return objs

# ----------------------------------------------------------------------------
# 12. SUBSYSTEM 10: FRONT BUMPER CORNER AMBER SIDE MARKER LAMPS
# ----------------------------------------------------------------------------

def build_s2000_front_bumper_side_markers(parent_col, mats):
    """
    Constructs the front bumper corner side marker turn signal lamps:
    - Left and right front bumper lower lateral corners (X = +/- 0.810m, Y = +1.680m, Z = 0.440m).
    - Oval faceted amber prismatic reflective lenses.
    - Beveled black rubber mounting perimeter gaskets.
    - Chrome internal miniature reflector cups with amber incandescent bulbs.
    """
    objs = []
    bm_sm_amber = bmesh.new()
    bm_sm_bezel = bmesh.new()

    for sx_sign in [-1.0, 1.0]:
        x_sm = sx_sign * 0.810
        y_sm = 1.680
        z_sm = 0.440

        mat_sm = Matrix.Translation(Vector((x_sm, y_sm, z_sm))) @ Euler((0, sx_sign * math.radians(-15), sx_sign * math.radians(24)), 'XYZ').to_matrix().to_4x4()

        # 1. Rubber Mounting Perimeter Bezel Gasket
        bmesh.ops.create_cylinder(bm_sm_bezel, radius=0.024, depth=0.012, segments=20, matrix=mat_sm @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # 2. Prismatic Faceted Amber Lens
        mat_lens = mat_sm @ Matrix.Translation(Vector((sx_sign * 0.005, 0, 0)))
        bmesh.ops.create_cylinder(bm_sm_amber, radius=0.020, depth=0.014, segments=18, matrix=mat_lens @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_sm_bezel = link_obj("GEO_S2K_SideMarker_Bezel_Gaskets", bm_sm_bezel, parent_col, mats["trim"], bevel=0.0006)
    obj_sm_amber = link_obj("GEO_S2K_SideMarker_Amber_Lenses", bm_sm_amber, parent_col, mats["amber_lens"], bevel=0.0004)

    objs.extend([obj_sm_bezel, obj_sm_amber])
    return objs

# ----------------------------------------------------------------------------
# 13. SUBSYSTEM 11: REAR WINDOW DEFROSTER HEATING FILAMENT GRID
# ----------------------------------------------------------------------------

def build_s2000_rear_window_defroster_grid(parent_col, mats):
    """
    Constructs the convertible rear window glass and electric defroster lines:
    - Curved tempered optical glass window inset into soft-top tonneau boot (X = 0.0m, Y = -0.740m, Z = 0.960m).
    - 12 Horizontal copper/orange silk-screened ceramic conductive defroster grid heating lines.
    - Vertical copper bus bar conductor strips on left and right borders.
    - Polyurethane black ceramic frit perimeter blackout border mask.
    """
    objs = []
    bm_rglass = bmesh.new()
    bm_rgrid = bmesh.new()

    mat_rwin = Matrix.Translation(Vector((0.0, -0.740, 0.960))) @ Euler((math.radians(-32), 0, 0), 'XYZ').to_matrix().to_4x4()

    # 1. Rear Window Tempered Optical Glass Pane (Width = 0.780m, Height = 0.320m)
    bmesh.ops.create_cube(bm_rglass, size=1.0, matrix=mat_rwin @ Matrix.Diagonal(Vector((0.780, 0.006, 0.320, 1.0))))

    # 2. 12 Silk-Screened Horizontal Heating Defroster Lines
    for li in range(12):
        z_line = -0.120 + li * 0.022
        mat_line = mat_rwin @ Matrix.Translation(Vector((0.0, -0.004, z_line)))
        bmesh.ops.create_cube(bm_rgrid, size=1.0, matrix=mat_line @ Matrix.Diagonal(Vector((0.680, 0.002, 0.0015, 1.0))))

    # 3. Left & Right Vertical Conductor Bus Bars
    for bx_sign in [-1.0, 1.0]:
        mat_bus = mat_rwin @ Matrix.Translation(Vector((bx_sign * 0.340, -0.004, 0.0)))
        bmesh.ops.create_cube(bm_rgrid, size=1.0, matrix=mat_bus @ Matrix.Diagonal(Vector((0.008, 0.002, 0.260, 1.0))))

    obj_rglass = link_obj("GEO_S2K_Rear_Window_Tempered_Glass", bm_rglass, parent_col, mats["glass"], bevel=0.0004)
    obj_rgrid = link_obj("GEO_S2K_Rear_Window_Defroster_Filaments", bm_rgrid, parent_col, mats["defroster"], bevel=0.0)

    objs.extend([obj_rglass, obj_rgrid])
    return objs

# ----------------------------------------------------------------------------
# 14. SUBSYSTEM 12: FRONT & REAR LICENSE PLATES & MOUNTING HARDWARE
# ----------------------------------------------------------------------------

def build_s2000_license_plates_and_frames(parent_col, mats):
    """
    Constructs authentic front and rear license plate assemblies:
    - Front license plate mounted on front bumper center bracket (X = 0.0m, Y = +2.070m, Z = 0.380m).
    - Rear license plate centered in recessed rear bumper pocket (X = 0.0m, Y = -2.040m, Z = 0.480m).
    - Stamped aluminum plates with embossed green/black Japanese or US alphanumeric digits.
    - Chrome perimeter license plate frames.
    - Stainless steel hex mounting bolts with nylon anti-vibration washers.
    """
    objs = []
    bm_lplate = bmesh.new()
    bm_lframe = bmesh.new()

    plate_configs = [
        # Front Bumper Plate
        (Vector((0.0, 2.065, 0.380)), Euler((math.radians(8), 0, 0), 'XYZ')),
        # Rear Bumper Plate
        (Vector((0.0, -2.035, 0.480)), Euler((math.radians(-14), 0, 0), 'XYZ')),
    ]

    for p_pos, p_rot in plate_configs:
        mat_p = Matrix.Translation(p_pos) @ p_rot.to_matrix().to_4x4()

        # 1. White Stamped Aluminum License Plate (Standard JDM/US format: 330mm x 165mm)
        bmesh.ops.create_cube(bm_lplate, size=1.0, matrix=mat_p @ Matrix.Diagonal(Vector((0.330, 0.004, 0.165, 1.0))))

        # 2. Chrome License Plate Surround Frame
        mat_frm = mat_p @ Matrix.Translation(Vector((0, 0.002 if p_pos.y > 0 else -0.002, 0)))
        bmesh.ops.create_cube(bm_lframe, size=1.0, matrix=mat_frm @ Matrix.Diagonal(Vector((0.345, 0.008, 0.180, 1.0))))

        # 3. Two Upper Stainless Mounting Bolts (X = +/- 0.105m, Z = +0.060m)
        for bx_sign in [-1.0, 1.0]:
            mat_bolt = mat_p @ Matrix.Translation(Vector((bx_sign * 0.105, 0.006 if p_pos.y > 0 else -0.006, 0.060)))
            bmesh.ops.create_cylinder(bm_lframe, radius=0.007, depth=0.010, segments=12, matrix=mat_bolt @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_lplate = link_obj("GEO_S2K_License_Plates_White_Panels", bm_lplate, parent_col, mats["reverse_clear"], bevel=0.0004)
    obj_lframe = link_obj("GEO_S2K_License_Plate_Chrome_Frames", bm_lframe, parent_col, mats["chrome"], bevel=0.0004)

    objs.extend([obj_lplate, obj_lframe])
    return objs
'''
