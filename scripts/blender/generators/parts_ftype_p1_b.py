"""
Jaguar F-Type V8 R Convertible (2010s) Phase 19: Part B
Subsystem 2: Clamshell Bonnet with Twin Power Domes, Hood Louvers & Shark Grille
Subsystem 3: Front Lower Aero Splitter & Polyurethane Bumper Sculptures
"""

PART_FTYPE_B = '''
# ----------------------------------------------------------------------------
# 3. SUBSYSTEM 2: CLAMSHELL BONNET, POWER DOMES & SHARK-MOUTH CAVITY
# ----------------------------------------------------------------------------

def build_jaguar_ftype_clamshell_bonnet_and_grille(parent_col, mats):
    """
    Constructs the forward-hinged clamshell bonnet and shark-mouth grille aperture:
    - Long sculpted aluminum clamshell hood spanning from grille mouth to cowl (Y: +0.720m to +2.180m).
    - Twin raised longitudinal power domes flanking the center line (accommodating the 5.0L Supercharged V8).
    - Functional twin louvered heat extractor vents with gloss black trim frames.
    - Large trapezoidal shark-mouth main grille opening with recessed backing plate.
    - Front bumper outer brake cooling shark gill intakes.
    """
    objs = []
    bm_bonnet = bmesh.new()
    bm_vents = bmesh.new()
    bm_grille = bmesh.new()

    # 1. Clamshell Bonnet Panel (Contoured surface over engine bay)
    bonnet_stations = [
        # Y,       X_half, Z_cowl, Z_center
        ( 2.150,   0.520,  0.620,  0.640),
        ( 2.050,   0.620,  0.670,  0.695),
        ( 1.900,   0.720,  0.720,  0.750),
        ( 1.700,   0.770,  0.755,  0.785),
        ( 1.500,   0.800,  0.775,  0.805),
        ( 1.311,   0.810,  0.785,  0.815),
        ( 1.100,   0.800,  0.780,  0.810),
        ( 0.900,   0.780,  0.770,  0.805),
        ( 0.740,   0.750,  0.760,  0.800),
    ]

    bonnet_rings = []
    for y, xw, zw, zc in bonnet_stations:
        ring = []
        pts = [
            Vector((-xw, y, zw)),
            Vector((-xw * 0.65, y, zw + 0.025)), # Power dome outer brow
            Vector((-xw * 0.30, y, zc + 0.015)), # Power dome crest
            Vector((0.0, y, zc)),                # Center spine valley
            Vector((xw * 0.30, y, zc + 0.015)),  # Right power dome crest
            Vector((xw * 0.65, y, zw + 0.025)),  # Right power dome outer brow
            Vector((xw, y, zw)),
        ]
        for pt in pts:
            ring.append(bm_bonnet.verts.new(pt))
        bonnet_rings.append(ring)

    bm_bonnet.verts.ensure_lookup_table()
    for i in range(len(bonnet_rings) - 1):
        r1 = bonnet_rings[i]
        r2 = bonnet_rings[i + 1]
        for j in range(len(r1) - 1):
            bm_bonnet.faces.new((r1[j], r2[j], r2[j + 1], r1[j + 1]))

    # 2. Twin Bonnet Louvered Heat Extractor Vents (Y = +1.450m, X = +/- 0.340m, Z = 0.815m)
    for vx_sign in [-1.0, 1.0]:
        mat_vent = Matrix.Translation(Vector((vx_sign * 0.340, 1.450, 0.812))) @ Euler((math.radians(12), vx_sign * math.radians(-5), 0), 'XYZ').to_matrix().to_4x4()
        # Vent Outer Bezel Frame
        bmesh.ops.create_cube(bm_vents, size=1.0, matrix=mat_vent @ Matrix.Diagonal(Vector((0.085, 0.280, 0.015, 1.0))))
        # Louvered Angled Slats (5 longitudinal extractor vanes)
        for s_idx in range(5):
            y_off = (s_idx - 2) * 0.045
            mat_slat = mat_vent @ Matrix.Translation(Vector((0, y_off, 0.008))) @ Euler((math.radians(-25), 0, 0), 'XYZ').to_matrix().to_4x4()
            bmesh.ops.create_cube(bm_vents, size=1.0, matrix=mat_slat @ Matrix.Diagonal(Vector((0.075, 0.012, 0.006, 1.0))))

    # 3. Shark-Mouth Trapezoidal Grille Opening (Y = +2.140m, Z = 0.360m to 0.620m)
    mat_grille = Matrix.Translation(Vector((0.0, 2.140, 0.490)))
    # Grille Recessed Backing Plate & Shroud
    bmesh.ops.create_cube(bm_grille, size=1.0, matrix=mat_grille @ Matrix.Diagonal(Vector((0.820, 0.060, 0.260, 1.0))))

    # Outer Shark Gill Cooling Scoops (Flanking lower intake, X = +/- 0.680m, Y = +2.020m, Z = 0.380m)
    for gx_sign in [-1.0, 1.0]:
        mat_gill = Matrix.Translation(Vector((gx_sign * 0.680, 2.020, 0.380))) @ Euler((math.radians(8), gx_sign * math.radians(-14), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_grille, size=1.0, matrix=mat_gill @ Matrix.Diagonal(Vector((0.240, 0.050, 0.180, 1.0))))

    obj_bonnet = link_obj("GEO_FTYPE_Clamshell_Bonnet", bm_bonnet, parent_col, mats["body"], bevel=0.002)
    obj_vents = link_obj("GEO_FTYPE_Bonnet_Heat_Extractors", bm_vents, parent_col, mats["gloss_black"], bevel=0.001)
    obj_grille = link_obj("GEO_FTYPE_Shark_Mouth_Grille_Cavity", bm_grille, parent_col, mats["satin_black"], bevel=0.0015)

    objs.extend([obj_bonnet, obj_vents, obj_grille])
    return objs


# ----------------------------------------------------------------------------
# 4. SUBSYSTEM 3: FRONT LOWER AERO SPLITTER & BUMPER VALANCE
# ----------------------------------------------------------------------------

def build_jaguar_ftype_front_splitter_and_bumpers(parent_col, mats):
    """
    Constructs the track-inspired aerodynamic front splitter and bumper architecture:
    - Full-width front splitter tray extending forward from lower bumper chin.
    - Outer aerodynamic winglet strakes redirecting airflow around front tires.
    - Under-nose central air guide feeding the front radiator and oil coolers.
    - Front polyurethane bumper structural fascia with headlight wash recesses.
    """
    objs = []
    bm_splitter = bmesh.new()
    bm_bumper = bmesh.new()

    # 1. Full-Width Gloss Black Aerodynamic Front Splitter (Y: +2.060m to +2.280m, Z = 0.115m to 0.145m)
    splitter_pts = [
        Vector((-0.880, 1.850, 0.140)), # Outer left wheel arch flank
        Vector((-0.840, 2.050, 0.135)), # Left front bumper corner
        Vector((-0.680, 2.200, 0.130)), # Left chin curve
        Vector((-0.380, 2.260, 0.125)), # Left center prow
        Vector(( 0.000, 2.280, 0.125)), # Splitter center apex tip
        Vector(( 0.380, 2.260, 0.125)),
        Vector(( 0.680, 2.200, 0.130)),
        Vector(( 0.840, 2.050, 0.135)),
        Vector(( 0.880, 1.850, 0.140)),
    ]

    for i in range(len(splitter_pts) - 1):
        p1 = splitter_pts[i]
        p2 = splitter_pts[i + 1]
        mid = (p1 + p2) * 0.5
        seg_len = (p2 - p1).length
        mat_seg = Matrix.Translation(mid) @ Vector((0, 1, 0)).rotation_difference(p2 - p1).to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_splitter, size=1.0, matrix=mat_seg @ Matrix.Diagonal(Vector((0.140, seg_len, 0.024, 1.0))))

    # Outer Aerodynamic Endplate Winglets (X = +/- 0.880m, Y = +1.880m)
    for wx_sign in [-1.0, 1.0]:
        mat_winglet = Matrix.Translation(Vector((wx_sign * 0.885, 1.880, 0.180))) @ Euler((0, wx_sign * math.radians(-10), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_splitter, size=1.0, matrix=mat_winglet @ Matrix.Diagonal(Vector((0.020, 0.180, 0.090, 1.0))))

    # 2. Front Polyurethane Bumper Lower Valance Core
    mat_val = Matrix.Translation(Vector((0.0, 2.160, 0.240)))
    bmesh.ops.create_cube(bm_bumper, size=1.0, matrix=mat_val @ Matrix.Diagonal(Vector((1.380, 0.120, 0.160, 1.0))))

    # Bumper Corner Reinforcements
    for cx_sign in [-1.0, 1.0]:
        mat_corn = Matrix.Translation(Vector((cx_sign * 0.760, 2.060, 0.260))) @ Euler((0, 0, cx_sign * math.radians(24)), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_bumper, size=1.0, matrix=mat_corn @ Matrix.Diagonal(Vector((0.280, 0.140, 0.180, 1.0))))

    obj_splitter = link_obj("GEO_FTYPE_Front_Aerodynamic_Splitter", bm_splitter, parent_col, mats["gloss_black"], bevel=0.0015)
    obj_bumper = link_obj("GEO_FTYPE_Front_Bumper_Valance", bm_bumper, parent_col, mats["body"], bevel=0.002)

    objs.extend([obj_splitter, obj_bumper])
    return objs
'''
