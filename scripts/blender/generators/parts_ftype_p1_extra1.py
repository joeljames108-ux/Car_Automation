"""
Jaguar F-Type V8 R Convertible (2010s) Phase 19: Extra Part 1
Subsystem 21: High-Rigidity Side Sills & Internal Door Intrusion Beams
Subsystem 22: Clamshell Bonnet Underside Ribbing, Latches & Dual Gas Struts
Subsystem 23: Rear Trunk Well, Gutter Drain Channels & Dual Gas Struts
"""

PART_FTYPE_EXTRA1 = '''
# ----------------------------------------------------------------------------
# 21. SUBSYSTEM 21: SIDE SILLS & DOOR INTRUSION BEAMS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_sills_and_door_beams(parent_col, mats):
    """
    Constructs internal structural side sill box sections and door side-impact beams:
    - Multi-chamber hydroformed aluminum side rocker sills providing torsional stiffness.
    - Diagonal ultra-high-strength aluminum side intrusion tubular beams inside doors.
    - Lower door hinge pillar reinforcements and door latch striker plates.
    """
    objs = []
    bm_sills = bmesh.new()
    bm_beams = bmesh.new()

    for sx_sign in [-1.0, 1.0]:
        sx = sx_sign * 0.810
        # 1. Multi-Chamber Rocker Box Sill (Y: -1.050m to +1.050m, Z = 0.170m)
        mat_sill = Matrix.Translation(Vector((sx, 0.000, 0.175)))
        bmesh.ops.create_cube(bm_sills, size=1.0, matrix=mat_sill @ Matrix.Diagonal(Vector((0.110, 2.100, 0.080, 1.0))))

        # Internal Sill Reinforcing Bulkheads (5 transverse bulkheads per sill)
        for bh_i in range(5):
            bh_y = (bh_i - 2) * 0.450
            mat_bh = mat_sill @ Matrix.Translation(Vector((0, bh_y, 0)))
            bmesh.ops.create_cube(bm_sills, size=1.0, matrix=mat_bh @ Matrix.Diagonal(Vector((0.095, 0.015, 0.070, 1.0))))

        # 2. Door Diagonal Side Intrusion Tubular Beam (Internal within door structural cavity)
        p1 = Vector((sx_sign * 0.700, 0.480, 0.280))
        p2 = Vector((sx_sign * 0.720, -0.320, 0.520))
        mid_bm = (p1 + p2) * 0.5
        mat_dbeam = Matrix.Translation(mid_bm) @ Vector((0, 0, 1)).rotation_difference(p2 - p1).to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_beams, radius=0.020, depth=(p2 - p1).length, segments=12, matrix=mat_dbeam)

        # Upper Door Beltline Reinforcement Tube (Internal)
        mat_belt = Matrix.Translation(Vector((sx_sign * 0.720, 0.080, 0.740)))
        bmesh.ops.create_cylinder(bm_beams, radius=0.016, depth=0.820, segments=12, matrix=mat_belt @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # Door Hinge Brackets (Upper and Lower on A-pillar)
        for h_z in [0.380, 0.680]:
            mat_hg = Matrix.Translation(Vector((sx_sign * 0.790, 0.580, h_z)))
            bmesh.ops.create_cube(bm_sills, size=1.0, matrix=mat_hg @ Matrix.Diagonal(Vector((0.060, 0.080, 0.055, 1.0))))

    obj_sills = link_obj("GEO_FTYPE_Structural_Sills", bm_sills, parent_col, mats["alloy"], bevel=0.0015)
    obj_beams = link_obj("GEO_FTYPE_Door_Intrusion_Beams", bm_beams, parent_col, mats["engine_metal"], bevel=0.001)

    objs.extend([obj_sills, obj_beams])
    return objs


# ----------------------------------------------------------------------------
# 22. SUBSYSTEM 22: CLAMSHELL BONNET UNDERSIDE RIBBING & STRUTS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_bonnet_underside_and_struts(parent_col, mats):
    """
    Constructs the internal reinforcement frame of the clamshell bonnet:
    - Formed aluminum inner skin skeleton with hexagonal cutout weight-reduction pockets.
    - Forward bonnet hinge pivots at front bumper nose.
    - Dual gas-charged pneumatic lift struts and safety latch catches.
    """
    objs = []
    bm_ribs = bmesh.new()
    bm_struts = bmesh.new()

    # 1. Inner Bonnet Structural Framing Ribs (Y: +0.820m to +2.050m)
    mat_in = Matrix.Translation(Vector((0.0, 1.450, 0.740)))
    # Outer Perimeter Flange Frame
    bmesh.ops.create_cube(bm_ribs, size=1.0, matrix=mat_in @ Matrix.Diagonal(Vector((1.420, 1.220, 0.018, 1.0))))

    # Longitudinal Stiffener Beams (Left and Right)
    for lx_sign in [-1.0, 1.0]:
        mat_lrib = mat_in @ Matrix.Translation(Vector((lx_sign * 0.440, 0, -0.012)))
        bmesh.ops.create_cube(bm_ribs, size=1.0, matrix=mat_lrib @ Matrix.Diagonal(Vector((0.050, 1.150, 0.024, 1.0))))

    # Diagonal X-Brace Ribs across hood center
    for diag_sign in [-1.0, 1.0]:
        mat_diag = mat_in @ Euler((0, 0, diag_sign * math.radians(28)), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_ribs, size=1.0, matrix=mat_diag @ Matrix.Diagonal(Vector((0.040, 1.200, 0.020, 1.0))))

    # 2. Dual Gas Struts (Supporting forward-tilting clamshell hood)
    for gx_sign in [-1.0, 1.0]:
        p_base = Vector((gx_sign * 0.680, 1.850, 0.520))
        p_hood = Vector((gx_sign * 0.580, 1.350, 0.760))
        mid_s = (p_base + p_hood) * 0.5
        mat_strut = Matrix.Translation(mid_s) @ Vector((0, 0, 1)).rotation_difference(p_hood - p_base).to_matrix().to_4x4()

        # Outer Pressure Cylinder
        bmesh.ops.create_cylinder(bm_struts, radius=0.012, depth=(p_hood - p_base).length * 0.55, segments=12, matrix=mat_strut)
        # Polished Chrome Inner Rod
        bmesh.ops.create_cylinder(bm_struts, radius=0.006, depth=(p_hood - p_base).length * 0.50, segments=10, matrix=mat_strut @ Matrix.Translation(Vector((0, 0, 0.060))))

    obj_ribs = link_obj("GEO_FTYPE_Bonnet_Underside_Ribbing", bm_ribs, parent_col, mats["satin_black"], bevel=0.001)
    obj_struts = link_obj("GEO_FTYPE_Bonnet_Gas_Struts", bm_struts, parent_col, mats["chrome"], bevel=0.0008)

    objs.extend([obj_ribs, obj_struts])
    return objs


# ----------------------------------------------------------------------------
# 23. SUBSYSTEM 23: REAR TRUNK WELL & DRAINAGE GUTTER ARCHITECTURE
# ----------------------------------------------------------------------------

def build_jaguar_ftype_trunk_well_and_gutters(parent_col, mats):
    """
    Constructs the convertible rear trunk compartment and water management gutters:
    - Molded composite trunk floor well beneath rear decklid.
    - Gutter drain channels surrounding soft-top tonneau and trunk lid perimeter.
    - Trunk lid spring-loaded counterbalance hinges and dual gas dampers.
    """
    objs = []
    bm_trunk = bmesh.new()

    # 1. Molded Composite Trunk Well (Y: -1.550m to -1.980m, Z = 0.380m to 0.720m)
    mat_tw = Matrix.Translation(Vector((0.0, -1.780, 0.540)))
    # Trunk Well Bucket Body
    bmesh.ops.create_cube(bm_trunk, size=1.0, matrix=mat_tw @ Matrix.Diagonal(Vector((1.080, 0.420, 0.280, 1.0))))

    # 2. Water Drainage Gutter Channels (Around soft-top rim: Y = -0.520m to -0.980m)
    for gx_sign in [-1.0, 1.0]:
        mat_gut = Matrix.Translation(Vector((gx_sign * 0.680, -0.740, 0.810)))
        bmesh.ops.create_cube(bm_trunk, size=1.0, matrix=mat_gut @ Matrix.Diagonal(Vector((0.040, 0.440, 0.025, 1.0))))

    # Transverse Gutter Collector Trough
    mat_gtrough = Matrix.Translation(Vector((0.0, -0.950, 0.810)))
    bmesh.ops.create_cube(bm_trunk, size=1.0, matrix=mat_gtrough @ Matrix.Diagonal(Vector((1.220, 0.035, 0.025, 1.0))))

    # 3. Trunk Lid Gooseneck Hinges & Gas Lift Struts
    for hx_sign in [-1.0, 1.0]:
        mat_hinge = Matrix.Translation(Vector((hx_sign * 0.480, -1.580, 0.760)))
        bmesh.ops.create_cylinder(bm_trunk, radius=0.010, depth=0.180, segments=10, matrix=mat_hinge @ Euler((math.radians(45), 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_trunk = link_obj("GEO_FTYPE_Trunk_Well_and_Gutters", bm_trunk, parent_col, mats["satin_black"], bevel=0.001)
    objs.append(obj_trunk)
    return objs
'''
