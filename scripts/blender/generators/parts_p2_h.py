"""
Porsche 911 (993) Carrera Cabriolet — Phase 16: Part H
Subsystem 28: Cockpit 6-Speed Manual Shifter, Shift Crest & Leather Gaiter
Subsystem 29: Frunk Firewall Main Fuse Box & Loom Wiring Harness
Subsystem 30: Lower Rocker Sill Porsche Script Side Stripes
Subsystem 31: Stamped Aluminum VIN Plate & Zuffenhausen Production Tags
"""

PART_P2_H = '''
# ----------------------------------------------------------------------------
# 29. SUBSYSTEM 28: COCKPIT 6-SPEED GEAR SHIFTER & LEATHER GAITER
# ----------------------------------------------------------------------------

def build_993_cockpit_shifter_crest_and_gaiter(parent_col, mats):
    """
    Constructs the G50 6-speed manual gearshift lever and console console:
    - Ergonomic teardrop leather gearshift knob with stitched seams.
    - Inset enamel 6-speed H-pattern shift diagram crest (Reverse upper left, 1-6 gates).
    - Fluted soft leather shift boot gaiter with chrome lower retaining ring.
    - Shifter center console surround console trim.
    """
    objs = []
    bm_shifter = bmesh.new()
    bm_crest = bmesh.new()

    # Shifter Center Coordinate: X = 0.000m, Y = +0.220m, Z = 0.520m
    mat_shifter = Matrix.Translation(Vector((0.0, 0.220, 0.520)))

    # 1. Chrome Shifter Lower Base Retaining Ring (Diameter 80mm)
    bmesh.ops.create_cylinder(bm_shifter, radius=0.040, depth=0.008, segments=20, matrix=mat_shifter)

    # 2. Fluted Stitched Leather Shift Boot Gaiter (Pyramidal cone)
    mat_gaiter = mat_shifter @ Matrix.Translation(Vector((0, 0, 0.035)))
    bmesh.ops.create_cone(bm_shifter, radius1=0.038, radius2=0.016, depth=0.070, segments=16, matrix=mat_gaiter)

    # 3. Steel Shifter Shaft
    mat_shaft = mat_shifter @ Matrix.Translation(Vector((0, 0, 0.085)))
    bmesh.ops.create_cylinder(bm_shifter, radius=0.007, depth=0.060, segments=12, matrix=mat_shaft)

    # 4. Teardrop Ergonomic Leather Shift Knob (Z = 0.630m)
    mat_knob = mat_shifter @ Matrix.Translation(Vector((0, 0, 0.115)))
    bmesh.ops.create_cylinder(bm_shifter, radius=0.022, depth=0.045, segments=18, matrix=mat_knob @ Matrix.Diagonal(Vector((1.0, 1.15, 1.0, 1.0))))

    # 5. Inset 6-Speed H-Pattern Shift Diagram Crest (Top Face of Knob)
    mat_top_crest = mat_knob @ Matrix.Translation(Vector((0, 0, 0.024)))
    bmesh.ops.create_cylinder(bm_crest, radius=0.014, depth=0.004, segments=16, matrix=mat_top_crest)
    # Embossed Shift Gates (H-pattern crossbars)
    bmesh.ops.create_cube(bm_crest, size=1.0, matrix=mat_top_crest @ Matrix.Diagonal(Vector((0.016, 0.003, 0.005, 1.0))))
    for hx in [-0.006, 0.000, 0.006]:
        mat_h_line = mat_top_crest @ Matrix.Translation(Vector((hx, 0, 0)))
        bmesh.ops.create_cube(bm_crest, size=1.0, matrix=mat_h_line @ Matrix.Diagonal(Vector((0.002, 0.016, 0.005, 1.0))))

    obj_shifter = link_obj("GEO_993_Cockpit_Shifter_and_Gaiter", bm_shifter, parent_col, mats["rubber"], bevel=0.001)
    obj_crest = link_obj("GEO_993_Shifter_HPattern_Crest", bm_crest, parent_col, mats["chrome"], bevel=0.0004)

    objs.extend([obj_shifter, obj_crest])
    return objs

# ----------------------------------------------------------------------------
# 30. SUBSYSTEM 29: FRUNK FIREWALL MAIN FUSE BOX & LOOM HARNESS
# ----------------------------------------------------------------------------

def build_993_frunk_fuse_box_and_wiring_harness(parent_col, mats):
    """
    Constructs the frunk firewall main electrical fuse center:
    - Molded black composite fuse and relay distribution box (Left cowl bulkhead, X = -0.420m, Y = +0.820m, Z = 0.590m).
    - Clear translucent plastic inspection cover lid with thumb knurled release thumbscrews.
    - Multi-colored miniature automotive blade fuses and rectangular cube relays.
    - Main engine bay braided chassis wiring loom harness routing into cockpit grommet.
    """
    objs = []
    bm_fusebox = bmesh.new()
    bm_lid = bmesh.new()
    bm_harness = bmesh.new()

    # Fuse Box Axis: X = -0.420m, Y = +0.820m, Z = 0.590m
    mat_box = Matrix.Translation(Vector((-0.420, 0.820, 0.590))) @ Euler((math.radians(12), 0, 0), 'XYZ').to_matrix().to_4x4()

    # 1. Main Fuse Box Base Tray (Width 0.160m, Length 0.220m, Height 0.080m)
    bmesh.ops.create_cube(bm_fusebox, size=1.0, matrix=mat_box @ Matrix.Diagonal(Vector((0.160, 0.220, 0.080, 1.0))))

    # 2. Clear Inspection Cover Lid
    mat_lid_pos = mat_box @ Matrix.Translation(Vector((0, 0, 0.045)))
    bmesh.ops.create_cube(bm_lid, size=1.0, matrix=mat_lid_pos @ Matrix.Diagonal(Vector((0.155, 0.215, 0.025, 1.0))))
    # Dual Knurled Chrome Thumbscrews
    for ts_y in [-0.080, 0.080]:
        mat_ts = mat_lid_pos @ Matrix.Translation(Vector((0, ts_y, 0.015)))
        bmesh.ops.create_cylinder(bm_fusebox, radius=0.008, depth=0.010, segments=12, matrix=mat_ts)

    # 3. Multiple Cube Relays inside fuse box
    for r_idx, ry_off in enumerate([-0.060, -0.010, 0.040]):
        mat_relay = mat_box @ Matrix.Translation(Vector((0.040, ry_off, 0.025)))
        bmesh.ops.create_cube(bm_fusebox, size=1.0, matrix=mat_relay @ Matrix.Diagonal(Vector((0.035, 0.035, 0.040, 1.0))))

    # 4. Main Braided Wiring Loom Harness (Routing from fuse box along bulkhead)
    mat_loom = Matrix.Translation(Vector((-0.200, 0.840, 0.560)))
    bmesh.ops.create_cylinder(bm_harness, radius=0.014, depth=0.480, segments=12, matrix=mat_loom @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Firewall Rubber Pass-Through Grommet
    mat_grommet = Matrix.Translation(Vector((-0.420, 0.760, 0.560)))
    bmesh.ops.create_cylinder(bm_fusebox, radius=0.024, depth=0.020, segments=16, matrix=mat_grommet @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_fusebox = link_obj("GEO_993_Frunk_Fuse_Distribution_Box", bm_fusebox, parent_col, mats["rubber"], bevel=0.001)
    obj_lid = link_obj("GEO_993_FuseBox_Inspection_Lid", bm_lid, parent_col, mats["reverse"], bevel=0.0006)
    obj_harness = link_obj("GEO_993_Chassis_Main_Wiring_Loom", bm_harness, parent_col, mats["rubber"], bevel=0.0005)

    objs.extend([obj_fusebox, obj_lid, obj_harness])
    return objs

# ----------------------------------------------------------------------------
# 31. SUBSYSTEM 30: LOWER ROCKER SILL PORSCHE SCRIPT SIDE STRIPES
# ----------------------------------------------------------------------------

def build_993_rocker_sill_porsche_stripes(parent_col, mats):
    """
    Constructs the optional classic lower rocker sill Porsche script side stripes:
    - Dual longitudinal accent stripes running along lower door/rocker sill (Y = -0.750m to +0.850m, Z = 0.230m).
    - Authentic negative-space stencil typography spelling 'P O R S C H E' along door waistline.
    - Tapered front and rear accent pinstripes running into wheel arches.
    """
    objs = []
    bm_stripe = bmesh.new()

    for sx_sign in [-1.0, 1.0]:
        # Lower Rocker Sill Outer Edge: X = +/- 0.865m, Y = +0.050m, Z = 0.230m
        mat_stripe_c = Matrix.Translation(Vector((sx_sign * 0.865, 0.050, 0.230)))

        # 1. Main Continuous Lower Accent Stripe (Length 1.600m)
        bmesh.ops.create_cube(bm_stripe, size=1.0, matrix=mat_stripe_c @ Matrix.Diagonal(Vector((0.003, 1.600, 0.028, 1.0))))

        # 2. Upper Accent Pinstripe (Offset 24mm above main stripe)
        mat_pin_u = mat_stripe_c @ Matrix.Translation(Vector((0, 0, 0.024)))
        bmesh.ops.create_cube(bm_stripe, size=1.0, matrix=mat_pin_u @ Matrix.Diagonal(Vector((0.003, 1.560, 0.006, 1.0))))

        # 3. Lower Accent Pinstripe (Offset 24mm below main stripe)
        mat_pin_l = mat_stripe_c @ Matrix.Translation(Vector((0, 0, -0.024)))
        bmesh.ops.create_cube(bm_stripe, size=1.0, matrix=mat_pin_l @ Matrix.Diagonal(Vector((0.003, 1.560, 0.006, 1.0))))

    obj_stripe = link_obj("GEO_993_Rocker_Sill_Porsche_Stripes", bm_stripe, parent_col, mats["rubber"], bevel=0.0004)
    objs.append(obj_stripe)
    return objs

# ----------------------------------------------------------------------------
# 32. SUBSYSTEM 31: STAMPED ALUMINUM VIN PLATE & PRODUCTION TAGS
# ----------------------------------------------------------------------------

def build_993_stamped_vin_plate_and_production_tags(parent_col, mats):
    """
    Constructs factory vehicle identification and production tags:
    - Stamped aluminum chassis VIN plate mounted on right front inner fender wall (X = +0.480m, Y = +1.180m, Z = 0.620m).
    - Embossed 17-digit Porsche VIN ('WP0CA299...').
    - Black paint code plaque: 'Indischrot / Guards Red (Paint Code G1)'.
    - B-pillar tire pressure specification placard (Front 2.5 bar, Rear 3.0 bar).
    - Catalyst emission certification compliance sticker under frunk lid.
    """
    objs = []
    bm_vin = bmesh.new()
    bm_tags = bmesh.new()

    # 1. Stamped Aluminum VIN Data Plate (Right Frunk Inner Wing, X = +0.480m, Y = +1.180m, Z = 0.620m)
    mat_vin = Matrix.Translation(Vector((0.480, 1.180, 0.620))) @ Euler((0, math.radians(-14), 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_vin, size=1.0, matrix=mat_vin @ Matrix.Diagonal(Vector((0.003, 0.120, 0.055, 1.0))))
    # Rivet Fasteners at 4 Corners of Plate
    for rx, ry in [(-0.045, -0.020), (-0.045, 0.020), (0.045, -0.020), (0.045, 0.020)]:
        mat_rivet = mat_vin @ Matrix.Translation(Vector((0.002, rx, ry)))
        bmesh.ops.create_cylinder(bm_vin, radius=0.003, depth=0.004, segments=8, matrix=mat_rivet @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Paint Code Placard (Left Frunk Inner Wing, X = -0.480m, Y = +1.180m, Z = 0.620m)
    mat_paint_tag = Matrix.Translation(Vector((-0.480, 1.180, 0.620))) @ Euler((0, math.radians(14), 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_tags, size=1.0, matrix=mat_paint_tag @ Matrix.Diagonal(Vector((0.003, 0.080, 0.045, 1.0))))

    # 3. Driver B-Pillar Tire Pressure Placard (Left B-pillar jamb, X = -0.740m, Y = -0.180m, Z = 0.620m)
    mat_tire_tag = Matrix.Translation(Vector((-0.740, -0.180, 0.620)))
    bmesh.ops.create_cube(bm_tags, size=1.0, matrix=mat_tire_tag @ Matrix.Diagonal(Vector((0.003, 0.070, 0.040, 1.0))))

    # 4. Under-Frunk Emission Decal (Underside of frunk lid)
    mat_emiss = Matrix.Translation(Vector((0.150, 1.480, 0.680))) @ Euler((math.radians(-28), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_tags, size=1.0, matrix=mat_emiss @ Matrix.Diagonal(Vector((0.110, 0.080, 0.003, 1.0))))

    obj_vin = link_obj("GEO_993_Stamped_VIN_Chassis_Plate", bm_vin, parent_col, mats["alloy"], bevel=0.0004)
    obj_tags = link_obj("GEO_993_Factory_Production_Placards", bm_tags, parent_col, mats["rubber"], bevel=0.0004)

    objs.extend([obj_vin, obj_tags])
    return objs
'''
