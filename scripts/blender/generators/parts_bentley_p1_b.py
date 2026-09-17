"""
Bentley Continental GT Speed Convertible (2020s) Phase 21: Part B
Subsystems 2 and 3:
- Subsystem 2: Continental Sculpted Long Bonnet with Flying "B" Center Spine
- Subsystem 3: Imposing Matrix Radiator Grille Aperture & Aerodynamic Front Bumper Valance
"""

PART_BENTLEY_B = '''
# ----------------------------------------------------------------------------
# 3. SUBSYSTEM 2: CONTINENTAL SCULPTED LONG BONNET & CENTER SPINE
# ----------------------------------------------------------------------------

def build_bentley_bonnet_and_power_creases(parent_col, mats):
    """
    Constructs the long superformed aluminum bonnet panel:
    - Spans from the majestic vertical radiator grille shell to cowl (Y: +0.720m to +2.240m).
    - Distinctive razor-sharp centerline spine running along the vehicle axis to the Flying 'B' mascot seat.
    - Twin fluted power creases sweeping from A-pillars down to the inner matrix grille corners.
    - Deeply scalloped front wing recesses accommodating the cut-crystal matrix headlamp housings.
    """
    objs = []
    bm_hood = bmesh.new()

    hood_stations = [
        # Y,       X_half, Z_side, Z_spine
        ( 2.220,   0.420,  0.720,  0.745), # Grille top header shutline
        ( 2.100,   0.580,  0.745,  0.772), # Headlamp inner margin
        ( 1.950,   0.700,  0.775,  0.805), # Forward power crease sweep
        ( 1.750,   0.770,  0.805,  0.835), # Mid-hood power dome
        ( 1.500,   0.810,  0.825,  0.855), # Engine bay apex (W12 clearance)
        ( 1.250,   0.825,  0.835,  0.862), # Mid-hood plateau
        ( 1.000,   0.815,  0.830,  0.855), # Cowl approach
        ( 0.740,   0.790,  0.818,  0.842), # Windshield wiper cowl shutline
    ]

    hood_rings = []
    for y, xw, zs, z_spine in hood_stations:
        ring = []
        pts = [
            Vector((-xw, y, zs)),                    # Left fender shutline
            Vector((-xw * 0.72, y, zs + 0.022)),     # Left fluted crease valley
            Vector((-xw * 0.38, y, z_spine + 0.012)),# Left power dome brow
            Vector((0.0, y, z_spine)),               # Center Flying 'B' spine
            Vector((xw * 0.38, y, z_spine + 0.012)), # Right power dome brow
            Vector((xw * 0.72, y, zs + 0.022)),      # Right fluted crease valley
            Vector((xw, y, zs)),                     # Right fender shutline
        ]
        for pt in pts:
            ring.append(bm_hood.verts.new(pt))
        hood_rings.append(ring)

    bm_hood.verts.ensure_lookup_table()
    for i in range(len(hood_rings) - 1):
        r1 = hood_rings[i]
        r2 = hood_rings[i + 1]
        for j in range(len(r1) - 1):
            bm_hood.faces.new((r1[j], r2[j], r2[j + 1], r1[j + 1]))

    # Centerline B-Spine Stamped Fin (Razor crease along hood center)
    bm_spine = bmesh.new()
    p_spine_start = Vector((0.0, 0.760, 0.844))
    p_spine_end = Vector((0.0, 2.210, 0.746))
    mat_spine = Matrix.Translation((p_spine_start + p_spine_end) * 0.5) @ Vector((0, 0, 1)).rotation_difference(p_spine_end - p_spine_start).to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_spine, radius=0.0035, depth=(p_spine_end - p_spine_start).length, segments=8, matrix=mat_spine)

    obj_hood = link_obj("GEO_BENTLEY_Bonnet_Sculpture", bm_hood, parent_col, mats["paint"], bevel=0.0012, subsurf=1)
    obj_spine = link_obj("GEO_BENTLEY_Bonnet_Center_Spine_Crease", bm_spine, parent_col, mats["paint"], bevel=0.0005)

    objs.extend([obj_hood, obj_spine])
    return objs


# ----------------------------------------------------------------------------
# 4. SUBSYSTEM 3: MATRIX RADIATOR GRILLE & FRONT BUMPER VALANCE
# ----------------------------------------------------------------------------

def build_bentley_matrix_grille_and_bumper(parent_col, mats):
    """
    Constructs the imposing Bentley Matrix Grille and lower aerodynamic valance:
    - Large upright rectangular/trapezoidal matrix radiator grille frame finished in polished Mulliner chrome.
    - Recessed dark tint diamond-in-diamond mesh backing core with vertical center chrome divider vane.
    - Front lower polyurethane bumper with lower central matrix air dam.
    - Outboard lower air scoops channeling direct airflow to twin massive intercoolers.
    - Integrated lower aerodynamic gloss piano black front splitter lip.
    """
    objs = []
    bm_grille_frame = bmesh.new()
    bm_matrix = bmesh.new()
    bm_bumper = bmesh.new()
    bm_splitter = bmesh.new()

    # 1. Main Matrix Grille Polished Outer Surround Shell (Y = 2.220m, Z = 0.520m)
    mat_gframe = Matrix.Translation(Vector((0.0, 2.220, 0.520))) @ Euler((math.radians(-6), 0, 0), 'XYZ').to_matrix().to_4x4()
    # Outer Chrome Radiator Shell
    bmesh.ops.create_cube(bm_grille_frame, size=1.0, matrix=mat_gframe @ Matrix.Diagonal(Vector((0.780, 0.055, 0.390, 1.0))))
    # Recessed Inner Grille Aperture Cavity (Dark mesh backplate)
    mat_gcore = mat_gframe @ Matrix.Translation(Vector((0.0, -0.018, 0.0)))
    bmesh.ops.create_cube(bm_matrix, size=1.0, matrix=mat_gcore @ Matrix.Diagonal(Vector((0.730, 0.025, 0.340, 1.0))))

    # Vertical Center Chrome Divider Vane (Echoing Flying 'B' spine alignment)
    mat_vane = mat_gframe @ Matrix.Translation(Vector((0.0, 0.015, 0.0)))
    bmesh.ops.create_cube(bm_grille_frame, size=1.0, matrix=mat_vane @ Matrix.Diagonal(Vector((0.012, 0.035, 0.380, 1.0))))

    # 2. Lower Bumper Central Matrix Air Dam & Outer Intercooler Scoops
    mat_bump = Matrix.Translation(Vector((0.0, 2.210, 0.280)))
    bmesh.ops.create_cube(bm_bumper, size=1.0, matrix=mat_bump @ Matrix.Diagonal(Vector((1.780, 0.160, 0.220, 1.0))))

    # Lower Center Matrix Air Intake (Recessed)
    mat_lower_dam = Matrix.Translation(Vector((0.0, 2.235, 0.260)))
    bmesh.ops.create_cube(bm_matrix, size=1.0, matrix=mat_lower_dam @ Matrix.Diagonal(Vector((0.840, 0.040, 0.140, 1.0))))

    # Twin Outboard Intercooler Cooling Scoops (Left & Right)
    for bx_sign in [-1.0, 1.0]:
        mat_scoop = Matrix.Translation(Vector((bx_sign * 0.680, 2.200, 0.270))) @ Euler((0, bx_sign * math.radians(-12), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_matrix, size=1.0, matrix=mat_scoop @ Matrix.Diagonal(Vector((0.340, 0.045, 0.150, 1.0))))
        # Polished Chrome Scoop Surround Bezel
        bmesh.ops.create_cube(bm_grille_frame, size=1.0, matrix=mat_scoop @ Matrix.Translation(Vector((0, 0.012, 0))) @ Matrix.Diagonal(Vector((0.365, 0.025, 0.170, 1.0))))

    # 3. Aerodynamic Carbon / Gloss Piano Black Front Splitter
    mat_spl = Matrix.Translation(Vector((0.0, 2.245, 0.165)))
    bmesh.ops.create_cube(bm_splitter, size=1.0, matrix=mat_spl @ Matrix.Diagonal(Vector((1.840, 0.120, 0.024, 1.0))))
    # Splitter Outboard Aerodynamic Winglet Strakes
    for wx_sign in [-1.0, 1.0]:
        mat_wlet = Matrix.Translation(Vector((wx_sign * 0.910, 2.200, 0.190)))
        bmesh.ops.create_cube(bm_splitter, size=1.0, matrix=mat_wlet @ Matrix.Diagonal(Vector((0.020, 0.160, 0.075, 1.0))))

    obj_frame = link_obj("GEO_BENTLEY_Matrix_Grille_Chrome_Frame", bm_grille_frame, parent_col, mats["chrome"], bevel=0.0015)
    obj_matrix = link_obj("GEO_BENTLEY_Matrix_Dark_Tint_Wire_Mesh", bm_matrix, parent_col, mats["dark_tint"], bevel=0.0008)
    obj_bumper = link_obj("GEO_BENTLEY_Front_Bumper_Valance", bm_bumper, parent_col, mats["paint"], bevel=0.002)
    obj_splitter = link_obj("GEO_BENTLEY_Front_Aero_Splitter_and_Winglets", bm_splitter, parent_col, mats["piano_black"], bevel=0.001)

    objs.extend([obj_frame, obj_matrix, obj_bumper, obj_splitter])
    return objs
'''
