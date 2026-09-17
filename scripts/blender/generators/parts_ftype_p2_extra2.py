"""
Jaguar F-Type V8 R Convertible (2010s) Phase 20: Extra Part 2
Subsystems 20 to 23:
- Subsystem 20: Active Spoiler Retraction Seam Gaskets & Wickerbill Lip
- Subsystem 21: Shark-Mouth Front Grille Hexagonal Mesh Grid
- Subsystem 22: Lower Bumper Shark Gill Honeycomb Meshes
- Subsystem 23: Rear Diffuser Vertical Strakes & Tow Eye Hatch
"""

PART_FTYPE2_EXTRA2 = '''
# ----------------------------------------------------------------------------
# 22. SUBSYSTEM 20: ACTIVE SPOILER RETRACTION SEAMS & WICKERBILL LIP
# ----------------------------------------------------------------------------

def build_jaguar_ftype_spoiler_seam_and_wickerbill(parent_col, mats):
    """
    Constructs the detailed active spoiler shut line and aerodynamic edge:
    - Recessed 3mm perimeter shut line gap defining the active spoiler boundary in rear decklid.
    - Integrated carbon composite trailing wickerbill Gurney flap along spoiler rear edge.
    - Water drain channels in spoiler pocket preventing standing water when parked.
    """
    objs = []
    bm_sp_gap = bmesh.new()
    bm_wicker = bmesh.new()

    mat_sp_center = Matrix.Translation(Vector((0.0, -1.880, 0.812))) @ Euler((math.radians(-6), 0, 0), 'XYZ').to_matrix().to_4x4()

    # 1. Recessed Perimeter Gap Shadow Line (Width 1.185m, Depth 0.225m)
    bmesh.ops.create_cube(bm_sp_gap, size=1.0, matrix=mat_sp_center @ Matrix.Diagonal(Vector((1.190, 0.226, 0.006, 1.0))))

    # 2. Trailing Carbon Wickerbill Lip (3mm vertical aerodynamic trip-strip)
    mat_wlip = mat_sp_center @ Matrix.Translation(Vector((0.0, -0.112, 0.016)))
    bmesh.ops.create_cube(bm_wicker, size=1.0, matrix=mat_wlip @ Matrix.Diagonal(Vector((1.170, 0.008, 0.014, 1.0))))

    obj_sp_gap = link_obj("GEO_FTYPE_Spoiler_Shutline_Recess", bm_sp_gap, parent_col, mats["trim"], bevel=0.0003)
    obj_wicker = link_obj("GEO_FTYPE_Spoiler_Wickerbill_Lip", bm_wicker, parent_col, mats["piano_black"], bevel=0.0004)

    objs.extend([obj_sp_gap, obj_wicker])
    return objs


# ----------------------------------------------------------------------------
# 23. SUBSYSTEM 21: SHARK-MOUTH FRONT GRILLE HEXAGONAL MESH
# ----------------------------------------------------------------------------

def build_jaguar_ftype_grille_mesh_infill(parent_col, mats):
    """
    Constructs the high-density hexagonal wire mesh inside shark-mouth grille:
    - Dense procedural diamond/hexagonal pattern spanning upper and lower intake.
    - Chrome grille perimeter surround trim ring outlining the predatory mouth.
    - Horizontal bumper support crossbar dividing upper and lower air flows.
    """
    objs = []
    bm_mesh = bmesh.new()
    bm_surround = bmesh.new()

    mat_g = Matrix.Translation(Vector((0.0, 2.142, 0.490)))

    # 1. Chrome Grille Mouth Perimeter Trim Ring (Width 0.820m, Height 0.260m)
    bmesh.ops.create_cube(bm_surround, size=1.0, matrix=mat_g @ Matrix.Diagonal(Vector((0.835, 0.014, 0.275, 1.0))))

    # 2. Hexagonal Wire Mesh Grid (Grid of horizontal and vertical wire strands)
    for row_i in range(9):
        row_z = (row_i - 4) * 0.028
        mat_row = mat_g @ Matrix.Translation(Vector((0, 0.004, row_z)))
        bmesh.ops.create_cylinder(bm_mesh, radius=0.002, depth=0.800, segments=6, matrix=mat_row @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    for col_i in range(25):
        col_x = (col_i - 12) * 0.032
        mat_col = mat_g @ Matrix.Translation(Vector((col_x, 0.004, 0)))
        bmesh.ops.create_cylinder(bm_mesh, radius=0.002, depth=0.250, segments=6, matrix=mat_col)

    # 3. Horizontal Bumper Divider Bar (Crash beam front fascia)
    mat_bar = mat_g @ Matrix.Translation(Vector((0.0, 0.008, 0.015)))
    bmesh.ops.create_cube(bm_surround, size=1.0, matrix=mat_bar @ Matrix.Diagonal(Vector((0.810, 0.022, 0.035, 1.0))))

    obj_mesh = link_obj("GEO_FTYPE_Grille_Hex_Wire_Mesh", bm_mesh, parent_col, mats["piano_black"], bevel=0.0003)
    obj_surround = link_obj("GEO_FTYPE_Grille_Chrome_Surround", bm_surround, parent_col, mats["chrome"], bevel=0.0008)

    objs.extend([obj_mesh, obj_surround])
    return objs


# ----------------------------------------------------------------------------
# 24. SUBSYSTEM 22: LOWER SHARK GILL HONEYCOMB MESHES
# ----------------------------------------------------------------------------

def build_jaguar_ftype_shark_gill_meshes(parent_col, mats):
    """
    Constructs the outer brake cooling duct intake grilles:
    - Hexagonal mesh screens inside outer shark gill bumper scoops (X = +/- 0.680m, Y = +2.020m).
    - Integrated horizontal aerodynamic splitter vane inside each scoop.
    """
    objs = []
    bm_gill_mesh = bmesh.new()

    for gx_sign in [-1.0, 1.0]:
        mat_gill = Matrix.Translation(Vector((gx_sign * 0.680, 2.020, 0.380))) @ Euler((math.radians(8), gx_sign * math.radians(-14), 0), 'XYZ').to_matrix().to_4x4()

        # Hexagonal Infill Grid Strands
        for r_i in range(5):
            r_z = (r_i - 2) * 0.032
            mat_gr = mat_gill @ Matrix.Translation(Vector((0, 0.010, r_z)))
            bmesh.ops.create_cylinder(bm_gill_mesh, radius=0.002, depth=0.220, segments=6, matrix=mat_gr @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        for c_i in range(7):
            c_x = (c_i - 3) * 0.032
            mat_gc = mat_gill @ Matrix.Translation(Vector((c_x, 0.010, 0)))
            bmesh.ops.create_cylinder(bm_gill_mesh, radius=0.002, depth=0.160, segments=6, matrix=mat_gc)

        # Aerodynamic Horizontal Splitter Blade
        mat_bblade = mat_gill @ Matrix.Translation(Vector((0, 0.015, 0)))
        bmesh.ops.create_cube(bm_gill_mesh, size=1.0, matrix=mat_bblade @ Matrix.Diagonal(Vector((0.230, 0.020, 0.010, 1.0))))

    obj_gill_mesh = link_obj("GEO_FTYPE_Shark_Gill_Honeycomb_Meshes", bm_gill_mesh, parent_col, mats["piano_black"], bevel=0.0004)
    objs.append(obj_gill_mesh)
    return objs


# ----------------------------------------------------------------------------
# 25. SUBSYSTEM 23: REAR DIFFUSER STRAKES & TOW EYE HATCH
# ----------------------------------------------------------------------------

def build_jaguar_ftype_diffuser_jewelry(parent_col, mats):
    """
    Constructs the rear diffuser jewelry and aerodynamic details:
    - 4 razor-sharp gloss black vertical diffuser strakes with beveled leading edges.
    - Concealed rear emergency tow eye access cover cap and thumb release notch.
    """
    objs = []
    bm_diff_jewel = bmesh.new()

    mat_dcenter = Matrix.Translation(Vector((0.0, -2.060, 0.220)))

    # 1. 4 Vertical Aerodynamic Diffuser Strakes (X = +/- 0.160m and +/- 0.380m)
    for st_x in [-0.380, -0.160, 0.160, 0.380]:
        mat_fin = Matrix.Translation(Vector((st_x, -2.080, 0.210))) @ Euler((math.radians(-16), 0, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_diff_jewel, size=1.0, matrix=mat_fin @ Matrix.Diagonal(Vector((0.012, 0.340, 0.080, 1.0))))

    # 2. Removable Tow Eye Access Hatch (Offset right on rear bumper)
    mat_tow_cap = Matrix.Translation(Vector((0.360, -2.060, 0.440)))
    bmesh.ops.create_cylinder(bm_diff_jewel, radius=0.024, depth=0.006, segments=16, matrix=mat_tow_cap @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_diff_jewel = link_obj("GEO_FTYPE_Diffuser_Aero_Strakes_and_TowCap", bm_diff_jewel, parent_col, mats["piano_black"], bevel=0.0008)
    objs.append(obj_diff_jewel)
    return objs
'''
