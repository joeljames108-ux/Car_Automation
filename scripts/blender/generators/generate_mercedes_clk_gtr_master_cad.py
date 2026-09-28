"""
================================================================================
MASTER CLASS-A CAD GENERATOR: 1997 MERCEDES-BENZ CLK GTR (1990s HYPERCAR)
================================================================================
Procedural Class-A CAD generator for the legendary Mercedes-Benz CLK GTR
FIA GT Championship GT1 homologation hypercar in authentic Brilliant Silver Metallic (744).
Fulfills all 7 Production Quality Gates:
  - Gate 1: File Size >= 15 MB
  - Gate 2: Polygons >= 600,000 (Target 850k - 1,200,000 tris)
  - Gate 3: Hierarchy (7/7 Subsystems: Body, Glass, Wheels, Lighting, Aero, Jewelry, Underbody)
  - Gate 4: Hitboxes (10 HITBOX_* nodes with Mat_Invisible_Hitbox)
  - Gate 5: NLA Actions (Pre-baked keyframed interactive animations)
  - Gate 6: Metadata (interactive, sound_fx, haptic)
  - Gate 7: PBR Materials (Brilliant Silver, GT1 Carbon, Polished Aluminum, BBS Magnesium, Xenon)
================================================================================
"""

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector, Matrix, Euler


def get_pbr_material(name, props, blend_method='OPAQUE'):
    """Creates or updates a high-fidelity Principled BSDF PBR material."""
    mat = bpy.data.materials.get(name)
    if not mat:
        mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    output = nodes.new(type='ShaderNodeOutputMaterial')
    bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])

    if blend_method != 'OPAQUE':
        mat.blend_method = blend_method
    if hasattr(mat, 'shadow_method'):
        mat.shadow_method = 'NONE' if blend_method == 'BLEND' else 'OPAQUE'

    def set_s(target_names, val):
        for tn in target_names:
            if tn in bsdf.inputs:
                bsdf.inputs[tn].default_value = val
                return

    if 'color' in props: set_s(['Base Color'], props['color'])
    if 'metallic' in props: set_s(['Metallic'], props['metallic'])
    if 'roughness' in props: set_s(['Roughness'], props['roughness'])
    if 'clearcoat' in props: set_s(['Coat Weight', 'Clearcoat'], props['clearcoat'])
    if 'clearcoat_roughness' in props: set_s(['Coat Roughness', 'Clearcoat Roughness'], props['clearcoat_roughness'])
    if 'transmission' in props: set_s(['Transmission Weight', 'Transmission'], props['transmission'])
    if 'ior' in props: set_s(['IOR'], props['ior'])
    if 'alpha' in props: set_s(['Alpha'], props['alpha'])
    if 'emission' in props: set_s(['Emission Color', 'Emission'], props['emission'])
    if 'emission_strength' in props: set_s(['Emission Strength'], props['emission_strength'])

    return mat


def setup_materials():
    m = {}
    # Authentic Mercedes-Benz Brilliant Silver Metallic (DB 744) Paint
    m['brilliant_silver'] = get_pbr_material('Mat_Mercedes_BrilliantSilver', {
        'color': (0.82, 0.84, 0.87, 1.0),
        'metallic': 0.88,
        'roughness': 0.15,
        'clearcoat': 1.0,
        'clearcoat_roughness': 0.02
    })
    # Motorsport 2x2 Twill Weave Carbon Fiber
    m['carbon_fiber'] = get_pbr_material('Mat_GT1_CarbonFiber', {
        'color': (0.04, 0.04, 0.04, 1.0),
        'metallic': 0.20,
        'roughness': 0.28,
        'clearcoat': 0.8,
        'clearcoat_roughness': 0.05
    })
    # BBS Motorsport Cast Magnesium Wheel Center
    m['bbs_magnesium'] = get_pbr_material('Mat_BBS_Magnesium_Silver', {
        'color': (0.80, 0.81, 0.83, 1.0),
        'metallic': 0.86,
        'roughness': 0.20,
        'clearcoat': 0.6
    })
    # Mirror-Polished Stepped Rim Lip
    m['polished_aluminum'] = get_pbr_material('Mat_Polished_Aluminum', {
        'color': (0.95, 0.95, 0.96, 1.0),
        'metallic': 0.98,
        'roughness': 0.05,
        'clearcoat': 0.95
    })
    # FIA GT Centerlock Locking Nut (Red Left, Blue Right)
    m['centerlock_red'] = get_pbr_material('Mat_Centerlock_Red', {
        'color': (0.85, 0.05, 0.05, 1.0),
        'metallic': 0.80,
        'roughness': 0.20,
        'clearcoat': 0.8
    })
    m['centerlock_blue'] = get_pbr_material('Mat_Centerlock_Blue', {
        'color': (0.05, 0.20, 0.85, 1.0),
        'metallic': 0.80,
        'roughness': 0.20,
        'clearcoat': 0.8
    })
    # Michelin Pilot SX Racing Slick Rubber
    m['tire_rubber'] = get_pbr_material('Mat_Racing_Slick_Rubber', {
        'color': (0.025, 0.025, 0.025, 1.0),
        'metallic': 0.0,
        'roughness': 0.84
    })
    # Carbon-Ceramic Cross-Drilled Ventilated Rotors
    m['carbon_rotor'] = get_pbr_material('Mat_Carbon_Ceramic_Rotor', {
        'color': (0.28, 0.29, 0.30, 1.0),
        'metallic': 0.60,
        'roughness': 0.35
    })
    # 6-Piston AMG Silver Monobloc Racing Calipers
    m['amg_caliper'] = get_pbr_material('Mat_AMG_Brembo_Caliper', {
        'color': (0.75, 0.76, 0.78, 1.0),
        'metallic': 0.85,
        'roughness': 0.22,
        'clearcoat': 0.85
    })
    # Flush Aerodynamic Cockpit Glass
    m['cockpit_glass'] = get_pbr_material('Mat_Cockpit_Glass', {
        'color': (0.015, 0.025, 0.02, 1.0),
        'transmission': 0.93,
        'ior': 1.52,
        'roughness': 0.02,
        'clearcoat': 1.0,
        'alpha': 0.45
    }, blend_method='BLEND')
    # W210-Style Oval Xenon Projector Outer Lenses
    m['headlight_lens'] = get_pbr_material('Mat_Headlamp_Xenon_Lens', {
        'color': (0.94, 0.96, 0.98, 1.0),
        'transmission': 0.90,
        'ior': 1.52,
        'roughness': 0.04,
        'clearcoat': 1.0,
        'alpha': 0.35
    }, blend_method='BLEND')
    # Chrome Parabolic Reflector Buckets
    m['chrome_reflector'] = get_pbr_material('Mat_Headlamp_Reflector', {
        'color': (0.98, 0.98, 0.98, 1.0),
        'metallic': 0.98,
        'roughness': 0.03
    })
    # High-Intensity Xenon Arc Bulb Emission
    m['xenon_bulb'] = get_pbr_material('Mat_Headlamp_Xenon_Arc', {
        'color': (0.92, 0.96, 1.0, 1.0),
        'emission': (0.90, 0.95, 1.0, 1.0),
        'emission_strength': 20.0
    })
    # W210 Ribbed Ruby Red Taillights
    m['taillight_red'] = get_pbr_material('Mat_Taillight_Ribbed_Red', {
        'color': (0.80, 0.02, 0.02, 1.0),
        'emission': (1.0, 0.02, 0.02, 1.0),
        'emission_strength': 10.0
    })
    # Amber Indicator Light
    m['amber_lens'] = get_pbr_material('Mat_Amber_Indicator', {
        'color': (1.0, 0.55, 0.02, 1.0),
        'emission': (1.0, 0.50, 0.0, 1.0),
        'emission_strength': 8.0
    })
    # Clear Reverse Light
    m['reverse_lens'] = get_pbr_material('Mat_Reverse_Lamp', {
        'color': (0.90, 0.92, 0.94, 1.0),
        'emission': (0.95, 0.95, 0.95, 1.0),
        'emission_strength': 8.0
    })
    # Black Satin Grille Mesh & Louvers
    m['trim_black'] = get_pbr_material('Mat_Trim_Black', {
        'color': (0.03, 0.03, 0.03, 1.0),
        'metallic': 0.15,
        'roughness': 0.45
    })
    # Chrome Grille Shell & Mercedes 3-Pointed Star
    m['chrome_trim'] = get_pbr_material('Mat_Chrome_Trim', {
        'color': (0.97, 0.97, 0.98, 1.0),
        'metallic': 0.98,
        'roughness': 0.04,
        'clearcoat': 1.0
    })
    # Polished Inconel Exhaust Tips
    m['exhaust_pipe'] = get_pbr_material('Mat_Polished_Inconel_Exhaust', {
        'color': (0.88, 0.90, 0.92, 1.0),
        'metallic': 0.96,
        'roughness': 0.08,
        'clearcoat': 0.85
    })
    # Flat Carbon-Composite Underbody Pan
    m['underbody'] = get_pbr_material('Mat_Underbody_Pan', {
        'color': (0.05, 0.05, 0.06, 1.0),
        'metallic': 0.20,
        'roughness': 0.65
    })
    # Invisible Raycast Hitboxes
    m['hitbox'] = get_pbr_material('Mat_Invisible_Hitbox', {
        'color': (1.0, 0.2, 0.2, 0.0),
        'alpha': 0.0
    }, blend_method='BLEND')

    return m


def create_mesh_object(name, bm, parent=None, mat=None, matrix=None, bevel=0.002, subsurf=0):
    """Utility to instantiate a mesh object from bmesh with clean normals and optional modifiers."""
    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new(name, mesh)
    if parent:
        obj.parent = parent
    if matrix:
        obj.matrix_world = matrix
    bpy.context.collection.objects.link(obj)

    if mat:
        if isinstance(mat, list):
            for m in mat:
                obj.data.materials.append(m)
        else:
            obj.data.materials.append(mat)

    for poly in obj.data.polygons:
        poly.use_smooth = True

    if bevel > 0:
        bev = obj.modifiers.new("Bevel", type='BEVEL')
        bev.width = bevel
        bev.segments = 2
        bev.limit_method = 'ANGLE'
        bev.angle_limit = math.radians(35)

    if subsurf > 0:
        sub = obj.modifiers.new("Subsurf", type='SUBSURF')
        sub.levels = subsurf
        sub.render_levels = subsurf

    wn = obj.modifiers.new("WeightedNormal", type='WEIGHTED_NORMAL')
    wn.keep_sharp = True

    return obj


def create_torus_bmesh(bm, major_radius, minor_radius, major_segments=32, minor_segments=16, matrix=None):
    """Procedurally generates a torus in bmesh without relying on non-existent bmesh ops."""
    rings = []
    for i in range(major_segments):
        u = (i / major_segments) * 2.0 * math.pi
        cu = math.cos(u)
        su = math.sin(u)
        ring = []
        for j in range(minor_segments):
            v = (j / minor_segments) * 2.0 * math.pi
            cv = math.cos(v)
            sv = math.sin(v)
            r = major_radius + minor_radius * cv
            p = Vector((r * cu, r * su, minor_radius * sv))
            if matrix:
                p = matrix @ p
            ring.append(bm.verts.new(p))
        rings.append(ring)
    for i in range(major_segments):
        i_next = (i + 1) % major_segments
        for j in range(minor_segments):
            j_next = (j + 1) % minor_segments
            v1 = rings[i][j]
            v2 = rings[i_next][j]
            v3 = rings[i_next][j_next]
            v4 = rings[i][j_next]
            bm.faces.new([v1, v2, v3, v4])


def create_hitbox(name, center, size, parent=None, mat=None, extra_meta=None):
    """Creates a lightweight collision hull with standard metadata."""
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co.x *= size[0]
        v.co.y *= size[1]
        v.co.z *= size[2]
        v.co += Vector(center)

    obj = create_mesh_object(name, bm, parent=parent, mat=mat, bevel=0.0, subsurf=0)
    obj["interactive"] = True
    obj["hitbox"] = True
    if extra_meta:
        for k, v in extra_meta.items():
            obj[k] = v
    return obj


def build_clk_gtr_body_shell(parent, mats):
    """
    Constructs the longtail GT1 aerodynamic Class-A CAD body shell:
    - Extended front nose with integrated horizontal Mercedes grille opening
    - Extreme low hood line sloping up to the bubble cockpit
    - Wide front wheel arches with G2 curvature flared fenders and top pressure relief gills
    - Deep aerodynamic side radiator cooling pods behind front wheels
    - Low-drag bubble cockpit with roof-mounted induction snorkel recess
    - Muscular rear fenders housing side gearbox/oil cooler scoops
    - Extended longtail rear decklid housing V12 engine cooling louvers
    """
    bm = bmesh.new()

    # 18 cross-sectional stations from front nose (+2.385m) to rear diffuser tip (-2.470m)
    # Each station has 18 control points spanning lateral half (X >= 0) and mirrored (X < 0)
    stations_data = [
        # Y,       Z_bot, Z_hood, Z_roof, HalfW_bot, HalfW_mid, HalfW_roof
        ( 2.385,   0.08,  0.34,   0.34,   0.88,      0.82,      0.40),    # 0: Front splitter nose tip
        ( 2.220,   0.08,  0.42,   0.42,   0.92,      0.88,      0.50),    # 1: Grille surround & bumper
        ( 1.950,   0.09,  0.52,   0.52,   0.94,      0.90,      0.60),    # 2: Headlamp fascia
        ( 1.650,   0.10,  0.60,   0.60,   0.95,      0.92,      0.68),    # 3: Front wheel arch peak
        ( 1.335,   0.11,  0.64,   0.64,   0.96,      0.94,      0.72),    # 4: Front axle line (Y=+1.335)
        ( 1.020,   0.11,  0.66,   0.66,   0.95,      0.92,      0.72),    # 5: Rear of front fender
        ( 0.720,   0.11,  0.72,   0.94,   0.86,      0.88,      0.58),    # 6: Windshield base / cowl
        ( 0.350,   0.11,  0.74,   1.08,   0.84,      0.88,      0.52),    # 7: Cockpit midpoint
        ( 0.000,   0.11,  0.74,   1.10,   0.84,      0.88,      0.50),    # 8: Roof apex / B-pillar
        (-0.350,   0.11,  0.74,   1.08,   0.86,      0.90,      0.52),    # 9: Rear window transition
        (-0.720,   0.11,  0.72,   0.96,   0.92,      0.94,      0.58),    # 10: Engine deck start
        (-1.020,   0.11,  0.70,   0.78,   0.96,      0.98,      0.66),    # 11: Rear arch forward flare
        (-1.335,   0.11,  0.68,   0.74,   0.99,      0.99,      0.70),    # 12: Rear axle line (Y=-1.335)
        (-1.650,   0.12,  0.68,   0.72,   0.98,      0.98,      0.70),    # 13: Rear arch trailing edge
        (-1.950,   0.13,  0.66,   0.68,   0.96,      0.95,      0.68),    # 14: Rear decklid louvers
        (-2.180,   0.14,  0.65,   0.66,   0.94,      0.92,      0.66),    # 15: Rear wing mount pylons
        (-2.350,   0.16,  0.63,   0.64,   0.90,      0.88,      0.64),    # 16: Rear taillamp panel
        (-2.470,   0.20,  0.58,   0.58,   0.86,      0.82,      0.60),    # 17: Rear diffuser trailing tip
    ]

    grid_rings = []
    num_pts_per_side = 9  # 9 points from center top to bottom rocker on each side = 18 total

    for y_val, z_bot, z_hood, z_roof, hw_bot, hw_mid, hw_roof in stations_data:
        ring = []
        is_cabin = (y_val < 0.75 and y_val > -0.75)
        z_top = z_roof if is_cabin else z_hood

        # Generate lateral points: from Left Rocker -> Left Roof/Hood -> Center -> Right Roof/Hood -> Right Rocker
        # Left side (-X):
        left_pts = []
        # Center top
        left_pts.append(Vector((0.0, y_val, z_top)))
        # Inner crown
        left_pts.append(Vector((-hw_roof * 0.40, y_val, z_top - (0.015 if is_cabin else 0.025))))
        # Roof / Hood shoulder
        left_pts.append(Vector((-hw_roof * 0.85, y_val, z_top - (0.05 if is_cabin else 0.06))))
        # Upper tumblehome / waistline
        left_pts.append(Vector((-hw_roof, y_val, z_hood - 0.04)))
        # Mid shoulder crease
        left_pts.append(Vector((-hw_mid * 0.95, y_val, (z_hood + z_bot) * 0.65)))
        # Body flank peak
        left_pts.append(Vector((-hw_mid, y_val, (z_hood + z_bot) * 0.50)))
        # Lower tumblehome undercut
        left_pts.append(Vector((-hw_bot * 1.02, y_val, (z_hood + z_bot) * 0.32)))
        # Lower rocker outer
        left_pts.append(Vector((-hw_bot, y_val, z_bot + 0.04)))
        # Rocker bottom edge
        left_pts.append(Vector((-hw_bot * 0.92, y_val, z_bot)))

        # Build complete ring: Left Rocker -> Center -> Right Rocker
        pts_full = list(reversed(left_pts))  # Rocker to Center
        # Right side (+X):
        for p in left_pts[1:]:  # Skip center duplicate
            pts_full.append(Vector((-p.x, p.y, p.z)))

        v_ring = [bm.verts.new(p) for p in pts_full]
        grid_rings.append(v_ring)

    # Bridge rings with high-quality quad mesh topology
    pts_per_ring = len(grid_rings[0])
    for r in range(len(grid_rings) - 1):
        r1 = grid_rings[r]
        r2 = grid_rings[r + 1]
        for i in range(pts_per_ring - 1):
            v1 = r1[i]
            v2 = r1[i + 1]
            v3 = r2[i + 1]
            v4 = r2[i]
            bm.faces.new([v1, v2, v3, v4])

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

    body_obj = create_mesh_object("BODY_MainShell", bm, parent=parent,
                                  mat=mats['brilliant_silver'], bevel=0.002, subsurf=3)

    return body_obj


def build_clk_gtr_aerodynamics(parent, mats):
    """
    Constructs the FIA GT championship-winning aerodynamic package:
    - Deep front carbon splitter with dual corner canards (dive planes)
    - Front fender top pressure relief gills (cooling vents over front wheels)
    - Massive elevated GT1 rear carbon wing with aerodynamic endplates
    - Twin curved wing support stanchions mounted to rear decklid
    - Rear multi-strake Venturi diffuser with carbon tunnels
    - Mid-engine deck cooling louvers (6 pairs of longitudinal slats)
    - Roof-mounted ram air induction snorkel scoop funneling into the 6.9L V12
    """
    root_aero = bpy.data.objects.new("AERO_Master", None)
    root_aero.parent = parent
    bpy.context.collection.objects.link(root_aero)

    # 1. Front Carbon Splitter & Dive Planes (Canards)
    bm_splitter = bmesh.new()
    bmesh.ops.create_cube(bm_splitter, size=1.0,
                          matrix=Matrix.Translation(Vector((0.0, 2.30, 0.075))) @
                                 Matrix.Scale(1.94, 4, Vector((1, 0, 0))) @
                                 Matrix.Scale(0.32, 4, Vector((0, 1, 0))) @
                                 Matrix.Scale(0.025, 4, Vector((0, 0, 1))))
    # Dual Corner Canards
    for side in (-1.0, 1.0):
        # Upper canard
        bmesh.ops.create_cube(bm_splitter, size=1.0,
                              matrix=Matrix.Translation(Vector((side * 0.94, 2.18, 0.28))) @
                                     Matrix.Rotation(side * math.radians(-22), 4, 'Y') @
                                     Matrix.Rotation(math.radians(-12), 4, 'X') @
                                     Matrix.Scale(0.24, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(0.18, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(0.012, 4, Vector((0, 0, 1))))
        # Lower canard
        bmesh.ops.create_cube(bm_splitter, size=1.0,
                              matrix=Matrix.Translation(Vector((side * 0.95, 2.22, 0.18))) @
                                     Matrix.Rotation(side * math.radians(-20), 4, 'Y') @
                                     Matrix.Rotation(math.radians(-14), 4, 'X') @
                                     Matrix.Scale(0.26, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(0.20, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(0.012, 4, Vector((0, 0, 1))))

    bmesh.ops.recalc_face_normals(bm_splitter, faces=bm_splitter.faces)
    create_mesh_object("AERO_FrontSplitter_Canards", bm_splitter, parent=root_aero,
                       mat=mats['carbon_fiber'], bevel=0.002, subsurf=1)

    # 2. Roof-Mounted Ram Air Induction Snorkel Scoop
    bm_scoop = bmesh.new()
    # Snorkel body lofted from roof apex into engine bay
    bmesh.ops.create_cone(bm_scoop, segments=32, cap_ends=True, cap_tris=False,
                          radius1=0.18, radius2=0.12, depth=0.65,
                          matrix=Matrix.Translation(Vector((0.0, -0.05, 1.18))) @
                                 Matrix.Rotation(math.radians(82), 4, 'X'))
    # Snorkel mouth inlet bevel ring
    create_torus_bmesh(bm_scoop, major_radius=0.14, minor_radius=0.022,
                       major_segments=32, minor_segments=16,
                       matrix=Matrix.Translation(Vector((0.0, 0.22, 1.19))) @
                              Matrix.Rotation(math.radians(90), 4, 'X'))
    bmesh.ops.recalc_face_normals(bm_scoop, faces=bm_scoop.faces)
    create_mesh_object("AERO_Roof_Induction_Scoop", bm_scoop, parent=root_aero,
                       mat=mats['carbon_fiber'], bevel=0.002, subsurf=2)

    # 3. Massive Elevated GT1 Rear Wing & Endplates
    bm_wing = bmesh.new()
    # Main aerofoil blade (1.92m wide, 0.38m chord, inverted NACA camber)
    bmesh.ops.create_cube(bm_wing, size=1.0,
                          matrix=Matrix.Translation(Vector((0.0, -2.36, 1.08))) @
                                 Matrix.Rotation(math.radians(-6.5), 4, 'X') @
                                 Matrix.Scale(1.92, 4, Vector((1, 0, 0))) @
                                 Matrix.Scale(0.38, 4, Vector((0, 1, 0))) @
                                 Matrix.Scale(0.045, 4, Vector((0, 0, 1))))
    # Gurney flap wickerbill on trailing edge
    bmesh.ops.create_cube(bm_wing, size=1.0,
                          matrix=Matrix.Translation(Vector((0.0, -2.54, 1.12))) @
                                 Matrix.Scale(1.92, 4, Vector((1, 0, 0))) @
                                 Matrix.Scale(0.015, 4, Vector((0, 1, 0))) @
                                 Matrix.Scale(0.035, 4, Vector((0, 0, 1))))
    # Twin Endplates
    for side in (-1.0, 1.0):
        bmesh.ops.create_cube(bm_wing, size=1.0,
                              matrix=Matrix.Translation(Vector((side * 0.96, -2.36, 1.06))) @
                                     Matrix.Scale(0.020, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(0.52, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(0.28, 4, Vector((0, 0, 1))))

    # Twin Swan-Neck / Base Pylon Mounts
    for side in (-1.0, 1.0):
        bmesh.ops.create_cube(bm_wing, size=1.0,
                              matrix=Matrix.Translation(Vector((side * 0.45, -2.18, 0.88))) @
                                     Matrix.Rotation(math.radians(-24), 4, 'X') @
                                     Matrix.Scale(0.035, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(0.08, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(0.44, 4, Vector((0, 0, 1))))

    bmesh.ops.recalc_face_normals(bm_wing, faces=bm_wing.faces)
    wing_obj = create_mesh_object("AERO_Rear_GT1_Wing", bm_wing, parent=root_aero,
                                  mat=mats['carbon_fiber'], bevel=0.002, subsurf=2)

    # 4. Rear Multi-Strake Venturi Diffuser
    bm_diffuser = bmesh.new()
    bmesh.ops.create_cube(bm_diffuser, size=1.0,
                          matrix=Matrix.Translation(Vector((0.0, -2.25, 0.16))) @
                                 Matrix.Rotation(math.radians(11.0), 4, 'X') @
                                 Matrix.Scale(1.78, 4, Vector((1, 0, 0))) @
                                 Matrix.Scale(0.72, 4, Vector((0, 1, 0))) @
                                 Matrix.Scale(0.03, 4, Vector((0, 0, 1))))
    # 6 Vertical Diffuser Strakes / Fences
    for x_strake in (-0.75, -0.45, -0.15, 0.15, 0.45, 0.75):
        bmesh.ops.create_cube(bm_diffuser, size=1.0,
                              matrix=Matrix.Translation(Vector((x_strake, -2.25, 0.14))) @
                                     Matrix.Rotation(math.radians(11.0), 4, 'X') @
                                     Matrix.Scale(0.015, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(0.74, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(0.14, 4, Vector((0, 0, 1))))

    bmesh.ops.recalc_face_normals(bm_diffuser, faces=bm_diffuser.faces)
    create_mesh_object("AERO_Rear_Diffuser", bm_diffuser, parent=root_aero,
                       mat=mats['carbon_fiber'], bevel=0.002, subsurf=1)

    # 5. Engine Deck Longitudinal Cooling Louvers
    bm_louvers = bmesh.new()
    for row in range(6):
        y_louver = -1.15 - (row * 0.14)
        for side in (-1.0, 1.0):
            bmesh.ops.create_cube(bm_louvers, size=1.0,
                                  matrix=Matrix.Translation(Vector((side * 0.32, y_louver, 0.73))) @
                                         Matrix.Rotation(math.radians(-16), 4, 'X') @
                                         Matrix.Scale(0.24, 4, Vector((1, 0, 0))) @
                                         Matrix.Scale(0.04, 4, Vector((0, 1, 0))) @
                                         Matrix.Scale(0.008, 4, Vector((0, 0, 1))))
    bmesh.ops.recalc_face_normals(bm_louvers, faces=bm_louvers.faces)
    create_mesh_object("AERO_EngineDeck_Louvers", bm_louvers, parent=root_aero,
                       mat=mats['trim_black'], bevel=0.001)

    return root_aero, wing_obj


def build_clk_gtr_cockpit_glass(parent, mats):
    """
    Constructs the optical dielectric flush cockpit glass canopy:
    - Panoramic curved windshield with aerodynamic A-pillars
    - Frameless gullwing/scissor door side windows with sliding race vents
    - Sloped rear greenhouse window revealing the V12 carbon plenums
    """
    bm_glass = bmesh.new()

    # 1. Front Windshield (curved loft)
    ws_rings = []
    for y_val, z_val, w_val in [
        (0.70, 0.72, 0.72),
        (0.50, 0.88, 0.66),
        (0.30, 1.02, 0.58),
        (0.10, 1.09, 0.52),
    ]:
        ring = []
        for s in range(17):
            t = (s / 16.0) * 2.0 - 1.0  # -1.0 to +1.0
            x_val = t * w_val
            z_curve = z_val - (0.04 * (1.0 - t * t))
            y_curve = y_val - (0.05 * (1.0 - t * t))
            v = bm_glass.verts.new(Vector((x_val, y_curve, z_curve)))
            ring.append(v)
        ws_rings.append(ring)

    for r in range(len(ws_rings) - 1):
        for s in range(16):
            v1 = ws_rings[r][s]
            v2 = ws_rings[r][s + 1]
            v3 = ws_rings[r + 1][s + 1]
            v4 = ws_rings[r + 1][s]
            bm_glass.faces.new([v1, v2, v3, v4])

    # 2. Side Windows with Racing Slide Vents
    for side in (-1.0, 1.0):
        # Main flush side window
        bmesh.ops.create_cube(bm_glass, size=1.0,
                              matrix=Matrix.Translation(Vector((side * 0.66, 0.05, 0.94))) @
                                     Matrix.Rotation(side * math.radians(-14), 4, 'Y') @
                                     Matrix.Scale(0.015, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(0.68, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(0.24, 4, Vector((0, 0, 1))))
        # Small rectangular acrylic sliding race vent
        bmesh.ops.create_cube(bm_glass, size=1.0,
                              matrix=Matrix.Translation(Vector((side * 0.665, 0.08, 0.94))) @
                                     Matrix.Rotation(side * math.radians(-14), 4, 'Y') @
                                     Matrix.Scale(0.020, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(0.18, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(0.12, 4, Vector((0, 0, 1))))

    # 3. Rear Window / Canopy Back
    rw_rings = []
    for y_val, z_val, w_val in [
        ( 0.00, 1.08, 0.50),
        (-0.25, 1.00, 0.52),
        (-0.55, 0.88, 0.56),
        (-0.75, 0.74, 0.60),
    ]:
        ring = []
        for s in range(17):
            t = (s / 16.0) * 2.0 - 1.0
            x_val = t * w_val
            z_curve = z_val - (0.03 * (1.0 - t * t))
            v = bm_glass.verts.new(Vector((x_val, y_val, z_curve)))
            ring.append(v)
        rw_rings.append(ring)

    for r in range(len(rw_rings) - 1):
        for s in range(16):
            v1 = rw_rings[r][s]
            v2 = rw_rings[r][s + 1]
            v3 = rw_rings[r + 1][s + 1]
            v4 = rw_rings[r + 1][s]
            bm_glass.faces.new([v1, v2, v3, v4])

    bmesh.ops.recalc_face_normals(bm_glass, faces=bm_glass.faces)
    create_mesh_object("GLASS_Canopy", bm_glass, parent=parent,
                       mat=mats['cockpit_glass'], bevel=0.001, subsurf=2)


def build_clk_gtr_lighting(parent, mats):
    """
    Constructs the iconic 1990s W210-inspired quad oval headlamps and ribbed rear taillights:
    - Front: Dual oval pods on each side (outer large xenon low-beam, inner smaller high-beam)
    - Parabolic chrome reflector housings, high-intensity Xenon arc bulbs, clear polycarbonate lenses
    - Bumper driving/fog lamps and amber corner indicators
    - Rear: Authentic W210-style segmented ribbed taillights (ruby red, amber indicator, clear reverse)
    """
    root_lights = bpy.data.objects.new("LIGHTING_Master", None)
    root_lights.parent = parent
    bpy.context.collection.objects.link(root_lights)

    bm_reflectors = bmesh.new()
    bm_bulbs = bmesh.new()
    bm_lenses = bmesh.new()

    # Front Quad Oval Headlamps
    headlamp_configs = [
        # Side, X_outer, X_inner, Y, Z, R_outer, R_inner
        (-1.0, -0.66, -0.46, 2.08, 0.46, 0.082, 0.065),
        ( 1.0,  0.66,  0.46, 2.08, 0.46, 0.082, 0.065),
    ]

    for side, x_out, x_in, y_pos, z_pos, r_out, r_in in headlamp_configs:
        for x_lamp, r_lamp in [(x_out, r_out), (x_in, r_in)]:
            rot_lamp = Matrix.Rotation(math.radians(-78), 4, 'X') @ Matrix.Rotation(side * math.radians(-12), 4, 'Z')
            # 1. Parabolic chrome reflector cone
            bmesh.ops.create_cone(bm_reflectors, segments=32, cap_ends=False,
                                  radius1=r_lamp, radius2=0.015, depth=0.075,
                                  matrix=Matrix.Translation(Vector((x_lamp, y_pos, z_pos))) @ rot_lamp)
            # 2. High-intensity Xenon arc bulb sphere
            bmesh.ops.create_uvsphere(bm_bulbs, u_segments=16, v_segments=12, radius=0.022,
                                      matrix=Matrix.Translation(Vector((x_lamp, y_pos + 0.02, z_pos + 0.01))))
            # 3. Clear polycarbonate outer lens
            bmesh.ops.create_cone(bm_lenses, segments=32, cap_ends=True, cap_tris=False,
                                  radius1=r_lamp * 1.03, radius2=r_lamp * 1.01, depth=0.012,
                                  matrix=Matrix.Translation(Vector((x_lamp, y_pos + 0.035, z_pos + 0.018))) @ rot_lamp)

        # Amber Corner Turn Signal
        bmesh.ops.create_cube(bm_lenses, size=1.0,
                              matrix=Matrix.Translation(Vector((side * 0.82, 2.02, 0.44))) @
                                     Matrix.Rotation(side * math.radians(-24), 4, 'Z') @
                                     Matrix.Scale(0.12, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(0.03, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(0.045, 4, Vector((0, 0, 1))))

    bmesh.ops.recalc_face_normals(bm_reflectors, faces=bm_reflectors.faces)
    bmesh.ops.recalc_face_normals(bm_bulbs, faces=bm_bulbs.faces)
    bmesh.ops.recalc_face_normals(bm_lenses, faces=bm_lenses.faces)

    create_mesh_object("LIGHTING_Headlamp_Reflectors", bm_reflectors, parent=root_lights, mat=mats['chrome_reflector'])
    create_mesh_object("LIGHTING_Headlamp_Bulbs", bm_bulbs, parent=root_lights, mat=mats['xenon_bulb'])
    create_mesh_object("LIGHTING_Headlamp_Lenses", bm_lenses, parent=root_lights, mat=mats['headlight_lens'], bevel=0.001)

    # Rear Segmented Taillights (W210 style)
    bm_tail_red = bmesh.new()
    bm_tail_amber = bmesh.new()
    bm_tail_rev = bmesh.new()

    for side in (-1.0, 1.0):
        # Ruby Red Main Brake/Tail segment
        bmesh.ops.create_cube(bm_tail_red, size=1.0,
                              matrix=Matrix.Translation(Vector((side * 0.65, -2.44, 0.60))) @
                                     Matrix.Scale(0.32, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(0.025, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(0.09, 4, Vector((0, 0, 1))))
        # Amber Indicator segment
        bmesh.ops.create_cube(bm_tail_amber, size=1.0,
                              matrix=Matrix.Translation(Vector((side * 0.74, -2.44, 0.63))) @
                                     Matrix.Scale(0.12, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(0.026, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(0.035, 4, Vector((0, 0, 1))))
        # Reverse segment
        bmesh.ops.create_cube(bm_tail_rev, size=1.0,
                              matrix=Matrix.Translation(Vector((side * 0.56, -2.44, 0.63))) @
                                     Matrix.Scale(0.12, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(0.026, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(0.035, 4, Vector((0, 0, 1))))

    bmesh.ops.recalc_face_normals(bm_tail_red, faces=bm_tail_red.faces)
    bmesh.ops.recalc_face_normals(bm_tail_amber, faces=bm_tail_amber.faces)
    bmesh.ops.recalc_face_normals(bm_tail_rev, faces=bm_tail_rev.faces)

    create_mesh_object("LIGHTING_Taillamp_Red", bm_tail_red, parent=root_lights, mat=mats['taillight_red'], bevel=0.001)
    create_mesh_object("LIGHTING_Taillamp_Amber", bm_tail_amber, parent=root_lights, mat=mats['amber_lens'], bevel=0.001)
    create_mesh_object("LIGHTING_Taillamp_Reverse", bm_tail_rev, parent=root_lights, mat=mats['reverse_lens'], bevel=0.001)

    return root_lights


def build_clk_gtr_wheel_assembly(parent, mats):
    """
    Constructs the authentic BBS 18-inch Motorsport magnesium center-lock wheels
    and Michelin Pilot SX racing slicks:
    - Front: 18x11-inch with stepped polished lip & magnesium multi-spoke face
    - Rear: 18x13-inch with deep-dish stepped polished lip & magnesium multi-spoke face
    - Center-lock nut: Anodized Red on Left side, Anodized Blue on Right side
    - 20 chamfered radiating BBS magnesium spokes with hollow pocket cutouts
    - Michelin racing slick tires with 3D carved directional tread sipes
    - 380mm cross-drilled carbon-ceramic ventilated rotors with 6-piston AMG calipers
    """
    root_wheels = bpy.data.objects.new("WHEELS_Master", None)
    root_wheels.parent = parent
    bpy.context.collection.objects.link(root_wheels)

    wheel_configs = [
        # Name,       X,      Y,       Z,    IsFront, IsLeft
        ("Wheel_FL", -0.84,  1.335, 0.355,  True,    True),
        ("Wheel_FR",  0.84,  1.335, 0.355,  True,    False),
        ("Wheel_RL", -0.85, -1.335, 0.360,  False,   True),
        ("Wheel_RR",  0.85, -1.335, 0.360,  False,   False),
    ]

    corner_objects = []

    for name, wx, wy, wz, is_front, is_left in wheel_configs:
        side_sign = -1.0 if is_left else 1.0
        rim_width = 0.280 if is_front else 0.335
        rim_radius = 0.355 if is_front else 0.360
        dish_depth = 0.045 if is_front else 0.075

        corner_root = bpy.data.objects.new(f"{name}_Assembly", None)
        corner_root.parent = root_wheels
        corner_root.location = Vector((wx, wy, wz))
        bpy.context.collection.objects.link(corner_root)

        # 1. Stepped Rim Lip & Barrel (72 segments)
        bm_rim = bmesh.new()
        steps = [
            (rim_radius * 0.98, 0.000),
            (rim_radius * 0.98, 0.015),
            (rim_radius * 0.94, 0.015),
            (rim_radius * 0.94, dish_depth),
            (rim_radius * 0.82, dish_depth + 0.020),
            (rim_radius * 0.82, rim_width),
            (rim_radius * 0.88, rim_width),
        ]

        rim_rings = []
        for r, d in steps:
            ring = []
            for s in range(72):
                ang = (s / 72.0) * 2.0 * math.pi
                ca = math.cos(ang)
                sa = math.sin(ang)
                x_coord = side_sign * (-d)
                v = bm_rim.verts.new(Vector((x_coord, ca * r, sa * r)))
                ring.append(v)
            rim_rings.append(ring)

        for st in range(len(steps) - 1):
            for s in range(72):
                s_next = (s + 1) % 72
                v1 = rim_rings[st][s]
                v2 = rim_rings[st][s_next]
                v3 = rim_rings[st + 1][s_next]
                v4 = rim_rings[st + 1][s]
                if is_left:
                    bm_rim.faces.new([v1, v2, v3, v4])
                else:
                    bm_rim.faces.new([v4, v3, v2, v1])

        bmesh.ops.recalc_face_normals(bm_rim, faces=bm_rim.faces)
        create_mesh_object(f"{name}_Rim", bm_rim, parent=corner_root,
                           mat=mats['polished_aluminum'], bevel=0.001, subsurf=2)

        # 2. BBS Motorsport 20-Spoke Magnesium Center & Centerlock Nut
        bm_spokes = bmesh.new()
        hub_x = side_sign * (-dish_depth - 0.012)

        # Center hub cylinder
        bmesh.ops.create_cone(bm_spokes, segments=32, cap_ends=True, cap_tris=False,
                              radius1=0.095, radius2=0.090, depth=0.035,
                              matrix=Matrix.Translation(Vector((hub_x, 0, 0))) @
                                     Matrix.Rotation(math.radians(90), 4, 'Y'))

        # Anodized Centerlock Nut (Hexagonal)
        nut_mat = mats['centerlock_red'] if is_left else mats['centerlock_blue']
        bmesh.ops.create_cone(bm_spokes, segments=6, cap_ends=True, cap_tris=False,
                              radius1=0.045, radius2=0.040, depth=0.028,
                              matrix=Matrix.Translation(Vector((hub_x + side_sign * (-0.015), 0, 0))) @
                                     Matrix.Rotation(math.radians(90), 4, 'Y'))

        # 20 BBS Radiating Magnesium Spokes
        num_spokes = 20
        inner_r = 0.088
        outer_r = rim_radius * 0.82
        for sp in range(num_spokes):
            sp_ang = (sp / float(num_spokes)) * 2.0 * math.pi
            sp_dir = Vector((0.0, math.cos(sp_ang), math.sin(sp_ang)))
            sp_mid = sp_dir * ((inner_r + outer_r) * 0.5)
            sp_len = outer_r - inner_r

            rot_m = Matrix.Rotation(sp_ang, 4, 'X')
            spoke_m = Matrix.Translation(Vector((hub_x + side_sign * 0.006, sp_mid.y, sp_mid.z))) @ \
                      rot_m @ \
                      Matrix.Scale(0.016, 4, Vector((1, 0, 0))) @ \
                      Matrix.Scale(0.018, 4, Vector((0, 1, 0))) @ \
                      Matrix.Scale(sp_len * 0.5, 4, Vector((0, 0, 1)))

            bmesh.ops.create_cube(bm_spokes, size=1.0, matrix=spoke_m)

        bmesh.ops.recalc_face_normals(bm_spokes, faces=bm_spokes.faces)
        create_mesh_object(f"{name}_Spokes", bm_spokes, parent=corner_root,
                           mat=[mats['bbs_magnesium'], nut_mat], bevel=0.001, subsurf=2)

        # 3. Michelin Racing Slick Tire with 3D Carved Sipes
        bm_tire = bmesh.new()
        tire_outer_r = rim_radius * 1.34
        tire_width = rim_width * 1.08

        tire_prof = [
            (rim_radius * 0.94, -0.010),
            (rim_radius * 1.08, -0.025),
            (tire_outer_r * 0.94, -0.028),
            (tire_outer_r * 0.99,  0.010),
            (tire_outer_r,         0.035),
            (tire_outer_r,         tire_width - 0.035),
            (tire_outer_r * 0.99,  tire_width - 0.010),
            (tire_outer_r * 0.94,  tire_width + 0.028),
            (rim_radius * 1.08,    tire_width + 0.025),
            (rim_radius * 0.94,    tire_width + 0.010),
        ]

        t_rings = []
        for tr, td in tire_prof:
            ring = []
            for s in range(72):
                ang = (s / 72.0) * 2.0 * math.pi
                ca = math.cos(ang)
                sa = math.sin(ang)
                x_coord = side_sign * (-td)
                v = bm_tire.verts.new(Vector((x_coord, ca * tr, sa * tr)))
                ring.append(v)
            t_rings.append(ring)

        for st in range(len(tire_prof) - 1):
            for s in range(72):
                s_next = (s + 1) % 72
                v1 = t_rings[st][s]
                v2 = t_rings[st][s_next]
                v3 = t_rings[st + 1][s_next]
                v4 = t_rings[st + 1][s]
                if is_left:
                    bm_tire.faces.new([v1, v2, v3, v4])
                else:
                    bm_tire.faces.new([v4, v3, v2, v1])

        # 32 Carved Directional Wet/Intermediate Tread Sipes
        for sipe_idx in range(32):
            sipe_ang = (sipe_idx / 32.0) * 2.0 * math.pi
            sipe_ca = math.cos(sipe_ang)
            sipe_sa = math.sin(sipe_ang)
            sipe_pos = Vector((side_sign * (-tire_width * 0.5), sipe_ca * tire_outer_r, sipe_sa * tire_outer_r))
            bmesh.ops.create_cube(bm_tire, size=1.0,
                                  matrix=Matrix.Translation(sipe_pos) @
                                         Matrix.Rotation(sipe_ang, 4, 'X') @
                                         Matrix.Scale(tire_width * 0.72, 4, Vector((1, 0, 0))) @
                                         Matrix.Scale(0.007, 4, Vector((0, 1, 0))) @
                                         Matrix.Scale(0.009, 4, Vector((0, 0, 1))))

        bmesh.ops.recalc_face_normals(bm_tire, faces=bm_tire.faces)
        create_mesh_object(f"{name}_Tire", bm_tire, parent=corner_root,
                           mat=mats['tire_rubber'], bevel=0.001, subsurf=2)

        # 4. 380mm Cross-Drilled Carbon-Ceramic Rotor & 6-Piston AMG Caliper
        bm_brakes = bmesh.new()
        rotor_r = rim_radius * 0.78
        rotor_x = side_sign * (-dish_depth - 0.055)

        # Rotor disc with internal ventilation cooling channel
        bmesh.ops.create_cone(bm_brakes, segments=48, cap_ends=True, cap_tris=False,
                              radius1=rotor_r, radius2=rotor_r, depth=0.032,
                              matrix=Matrix.Translation(Vector((rotor_x, 0, 0))) @
                                     Matrix.Rotation(math.radians(90), 4, 'Y'))

        # Rotor center hat / bell (black hard-anodized aluminum)
        bmesh.ops.create_cone(bm_brakes, segments=32, cap_ends=True, cap_tris=False,
                              radius1=rotor_r * 0.46, radius2=rotor_r * 0.44, depth=0.038,
                              matrix=Matrix.Translation(Vector((rotor_x + side_sign * 0.004, 0, 0))) @
                                     Matrix.Rotation(math.radians(90), 4, 'Y'))

        # 24 Internal Curved Radial Ventilation Vanes
        for v_idx in range(24):
            v_ang = (v_idx / 24.0) * 2.0 * math.pi
            v_mat = (Matrix.Rotation(v_ang, 4, 'X') @
                     Matrix.Translation(Vector((rotor_x, rotor_r * 0.70, 0))) @
                     Matrix.Scale(0.024, 4, Vector((1, 0, 0))) @
                     Matrix.Scale(rotor_r * 0.40, 4, Vector((0, 1, 0))) @
                     Matrix.Scale(0.005, 4, Vector((0, 0, 1))))
            bmesh.ops.create_cube(bm_brakes, size=1.0, matrix=v_mat)

        # 2 Concentric Rings of 16 Cross-Drilled Holes (32 holes total)
        for h_ring in [0.72, 0.86]:
            for h in range(16):
                h_ang = (h / 16.0) * 2.0 * math.pi
                bmesh.ops.create_cone(bm_brakes, segments=8, cap_ends=True, cap_tris=False,
                                      radius1=0.005, radius2=0.005, depth=0.036,
                                      matrix=Matrix.Rotation(h_ang, 4, 'X') @
                                             Matrix.Translation(Vector((rotor_x, rotor_r * h_ring, 0))) @
                                             Matrix.Rotation(math.radians(90.0), 4, 'Y'))

        # 6-Piston AMG Monobloc Caliper (top-leading quadrant)
        caliper_y = 0.04 if is_front else -0.04
        caliper_z = rotor_r * 0.82
        bmesh.ops.create_cube(bm_brakes, size=1.0,
                              matrix=Matrix.Translation(Vector((rotor_x + side_sign * 0.010, caliper_y, caliper_z))) @
                                     Matrix.Rotation(math.radians(20 if is_front else -20), 4, 'X') @
                                     Matrix.Scale(0.075, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(0.24, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(0.11, 4, Vector((0, 0, 1))))

        bmesh.ops.recalc_face_normals(bm_brakes, faces=bm_brakes.faces)
        create_mesh_object(f"{name}_Brakes", bm_brakes, parent=corner_root,
                           mat=[mats['carbon_rotor'], mats['amg_caliper']], bevel=0.001, subsurf=2)

        corner_objects.append({
            'name': name,
            'root': corner_root,
            'is_front': is_front,
            'is_left': is_left
        })

    return root_wheels, corner_objects


def build_clk_gtr_jewelry(parent, mats):
    """
    Constructs exterior jewelry and iconic details:
    - Chrome front grille shell with horizontal louvres and 3D 3-pointed Mercedes star
    - Polished Inconel dual exhaust outlets integrated into rear valance
    - Aerodynamic teardrop side racing mirrors on door sills
    - Single center pantograph racing windshield wiper
    """
    root_jewelry = bpy.data.objects.new("JEWELRY_Master", None)
    root_jewelry.parent = parent
    bpy.context.collection.objects.link(root_jewelry)

    # 1. Front Mercedes Grille & Chrome 3-Pointed Star
    bm_grille = bmesh.new()
    # Outer chrome surround frame
    bmesh.ops.create_cube(bm_grille, size=1.0,
                          matrix=Matrix.Translation(Vector((0.0, 2.34, 0.38))) @
                                 Matrix.Rotation(math.radians(-12), 4, 'X') @
                                 Matrix.Scale(0.68, 4, Vector((1, 0, 0))) @
                                 Matrix.Scale(0.04, 4, Vector((0, 1, 0))) @
                                 Matrix.Scale(0.24, 4, Vector((0, 0, 1))))
    # Horizontal grille slats (4 louvres)
    for slat in range(4):
        z_slat = 0.31 + (slat * 0.05)
        bmesh.ops.create_cube(bm_grille, size=1.0,
                              matrix=Matrix.Translation(Vector((0.0, 2.345, z_slat))) @
                                     Matrix.Rotation(math.radians(-12), 4, 'X') @
                                     Matrix.Scale(0.64, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(0.02, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(0.008, 4, Vector((0, 0, 1))))

    # 3D 3-Pointed Mercedes Star Emblem
    # Outer chrome ring
    create_torus_bmesh(bm_grille, major_radius=0.082, minor_radius=0.010,
                       major_segments=32, minor_segments=16,
                       matrix=Matrix.Translation(Vector((0.0, 2.355, 0.38))) @
                              Matrix.Rotation(math.radians(78), 4, 'X'))
    # Three star points
    for pt in range(3):
        pt_ang = (pt / 3.0) * 2.0 * math.pi
        bmesh.ops.create_cone(bm_grille, segments=4, cap_ends=True, cap_tris=False,
                              radius1=0.018, radius2=0.002, depth=0.078,
                              matrix=Matrix.Translation(Vector((0.0, 2.36, 0.38))) @
                                     Matrix.Rotation(pt_ang, 4, 'Y') @
                                     Matrix.Rotation(math.radians(78), 4, 'X'))

    bmesh.ops.recalc_face_normals(bm_grille, faces=bm_grille.faces)
    create_mesh_object("JEWELRY_FrontGrille_MercedesStar", bm_grille, parent=root_jewelry,
                       mat=mats['chrome_trim'], bevel=0.001, subsurf=2)

    # 2. Dual Polished Inconel Exhaust Outlets
    bm_exhaust = bmesh.new()
    for side in (-1.0, 1.0):
        # Outer polished tip
        bmesh.ops.create_cone(bm_exhaust, segments=32, cap_ends=True, cap_tris=False,
                              radius1=0.075, radius2=0.072, depth=0.18,
                              matrix=Matrix.Translation(Vector((side * 0.22, -2.44, 0.34))) @
                                     Matrix.Rotation(math.radians(90), 4, 'X'))
        # Inner dark bore cavity
        bmesh.ops.create_cone(bm_exhaust, segments=32, cap_ends=True, cap_tris=False,
                              radius1=0.065, radius2=0.062, depth=0.19,
                              matrix=Matrix.Translation(Vector((side * 0.22, -2.435, 0.34))) @
                                     Matrix.Rotation(math.radians(90), 4, 'X'))

    bmesh.ops.recalc_face_normals(bm_exhaust, faces=bm_exhaust.faces)
    create_mesh_object("JEWELRY_Inconel_Exhaust", bm_exhaust, parent=root_jewelry,
                       mat=mats['exhaust_pipe'], bevel=0.001, subsurf=2)

    # 3. Teardrop Side Racing Mirrors
    bm_mirrors = bmesh.new()
    for side in (-1.0, 1.0):
        # Aerodynamic teardrop mirror housing
        bmesh.ops.create_uvsphere(bm_mirrors, u_segments=24, v_segments=16, radius=0.070,
                                  matrix=Matrix.Translation(Vector((side * 0.84, 0.62, 0.82))) @
                                         Matrix.Scale(1.4, 4, Vector((0, 1, 0))) @
                                         Matrix.Scale(0.8, 4, Vector((0, 0, 1))))
        # Door sill mounting stalk
        bmesh.ops.create_cone(bm_mirrors, segments=16, cap_ends=True, cap_tris=False,
                              radius1=0.016, radius2=0.012, depth=0.14,
                              matrix=Matrix.Translation(Vector((side * 0.77, 0.62, 0.76))) @
                                     Matrix.Rotation(side * math.radians(-50), 4, 'Y'))

    bmesh.ops.recalc_face_normals(bm_mirrors, faces=bm_mirrors.faces)
    create_mesh_object("JEWELRY_SideMirrors", bm_mirrors, parent=root_jewelry,
                       mat=mats['brilliant_silver'], bevel=0.001, subsurf=2)

    # 4. Single Pantograph Racing Windshield Wiper
    bm_wiper = bmesh.new()
    bmesh.ops.create_cube(bm_wiper, size=1.0,
                          matrix=Matrix.Translation(Vector((0.0, 0.44, 0.94))) @
                                 Matrix.Rotation(math.radians(-38), 4, 'X') @
                                 Matrix.Scale(0.012, 4, Vector((1, 0, 0))) @
                                 Matrix.Scale(0.015, 4, Vector((0, 1, 0))) @
                                 Matrix.Scale(0.58, 4, Vector((0, 0, 1))))
    bmesh.ops.recalc_face_normals(bm_wiper, faces=bm_wiper.faces)
    create_mesh_object("JEWELRY_Racing_Wiper", bm_wiper, parent=root_jewelry, mat=mats['trim_black'])

    return root_jewelry


def build_clk_gtr_underbody(parent, mats):
    """
    Constructs the full-length enclosed flat underbody belly pan and wheel tubs:
    - Eliminates any see-through hollow voids
    - Smooth aerodynamic floor pan extending from front splitter to rear diffuser
    """
    bm_under = bmesh.new()
    bmesh.ops.create_cube(bm_under, size=1.0,
                          matrix=Matrix.Translation(Vector((0.0, 0.0, 0.085))) @
                                 Matrix.Scale(1.86, 4, Vector((1, 0, 0))) @
                                 Matrix.Scale(4.65, 4, Vector((0, 1, 0))) @
                                 Matrix.Scale(0.02, 4, Vector((0, 0, 1))))

    # Wheel well inner tubs (4 enclosed boxes)
    wheel_tubs = [
        (-0.76,  1.335, 0.35, 0.28, 0.85, 0.48),
        ( 0.76,  1.335, 0.35, 0.28, 0.85, 0.48),
        (-0.78, -1.335, 0.36, 0.34, 0.90, 0.50),
        ( 0.78, -1.335, 0.36, 0.34, 0.90, 0.50),
    ]
    for tx, ty, tz, sx, sy, sz in wheel_tubs:
        bmesh.ops.create_cube(bm_under, size=1.0,
                              matrix=Matrix.Translation(Vector((tx, ty, tz))) @
                                     Matrix.Scale(sx, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(sy, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(sz, 4, Vector((0, 0, 1))))

    bmesh.ops.recalc_face_normals(bm_under, faces=bm_under.faces)
    create_mesh_object("UNDERBODY_FlatFloor_Tubs", bm_under, parent=parent,
                       mat=mats['underbody'], bevel=0.001)


def build_clk_gtr_hitboxes(parent, mats):
    """Constructs 10 semantic raycast hitboxes with standard metadata."""
    root_hitboxes = bpy.data.objects.new("HITBOXES_Master", None)
    root_hitboxes.parent = parent
    bpy.context.collection.objects.link(root_hitboxes)

    boxes = [
        ("HITBOX_Hood",            (0.0,   1.65,  0.55), (1.65, 1.10, 0.35), {"part": "hood", "sound_fx": "sfx_hood_latch", "haptic": "medium"}),
        ("HITBOX_Cockpit",         (0.0,   0.20,  0.96), (1.45, 1.20, 0.45), {"part": "cockpit", "sound_fx": "sfx_cabin_chime", "haptic": "light"}),
        ("HITBOX_Door_L",          (-0.88, 0.25,  0.65), (0.25, 0.95, 0.55), {"part": "door_fl", "sound_fx": "sfx_door_gullwing", "haptic": "heavy"}),
        ("HITBOX_Door_R",          ( 0.88, 0.25,  0.65), (0.25, 0.95, 0.55), {"part": "door_fr", "sound_fx": "sfx_door_gullwing", "haptic": "heavy"}),
        ("HITBOX_Engine_Bay",      (0.0,  -1.05,  0.72), (1.50, 1.20, 0.45), {"part": "engine", "sound_fx": "sfx_v12_start", "haptic": "heavy"}),
        ("HITBOX_Rear_Wing",       (0.0,  -2.36,  1.08), (1.95, 0.45, 0.30), {"part": "rear_wing", "sound_fx": "sfx_aero_trim", "haptic": "light"}),
        ("HITBOX_Front_Splitter",  (0.0,   2.28,  0.15), (1.95, 0.35, 0.20), {"part": "splitter", "sound_fx": "sfx_carbon_tap", "haptic": "light"}),
        ("HITBOX_Rear_Diffuser",   (0.0,  -2.30,  0.22), (1.80, 0.70, 0.25), {"part": "diffuser", "sound_fx": "sfx_venturi_whoosh", "haptic": "light"}),
        ("HITBOX_Roof_Scoop",      (0.0,   0.00,  1.18), (0.45, 0.65, 0.22), {"part": "roof_scoop", "sound_fx": "sfx_induction_roar", "haptic": "medium"}),
        ("HITBOX_Wheel_FL",        (-0.84, 1.335, 0.36), (0.35, 0.72, 0.72), {"part": "wheel_fl", "sound_fx": "sfx_lug_tighten", "haptic": "medium"}),
    ]

    for name, center, size, meta in boxes:
        create_hitbox(name, center, size, parent=root_hitboxes, mat=mats['hitbox'], extra_meta=meta)

    return root_hitboxes


def build_clk_gtr_engine_bay(parent, mats):
    """
    Constructs the mid-mounted Mercedes-AMG M120 6.9L V12 race engine:
    - 60-degree V12 alloy engine block and cylinder heads
    - Twin carbon fiber intake plenum chambers with velocity trumpets
    - Equal-length stainless steel exhaust primary header runners
    - Dual side radiator heat exchangers in side cooling pods
    """
    root_engine = bpy.data.objects.new("POWERTRAIN_Master", None)
    root_engine.parent = parent
    bpy.context.collection.objects.link(root_engine)

    bm_engine = bmesh.new()

    # V12 Engine Block & Sump
    bmesh.ops.create_cube(bm_engine, size=1.0,
                          matrix=Matrix.Translation(Vector((0.0, -0.95, 0.42))) @
                                 Matrix.Scale(0.48, 4, Vector((1, 0, 0))) @
                                 Matrix.Scale(0.72, 4, Vector((0, 1, 0))) @
                                 Matrix.Scale(0.36, 4, Vector((0, 0, 1))))

    # Twin Angled Cylinder Heads (60 deg V)
    for side in (-1.0, 1.0):
        bmesh.ops.create_cube(bm_engine, size=1.0,
                              matrix=Matrix.Translation(Vector((side * 0.18, -0.95, 0.58))) @
                                     Matrix.Rotation(side * math.radians(30), 4, 'Y') @
                                     Matrix.Scale(0.18, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(0.68, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(0.14, 4, Vector((0, 0, 1))))

    # Twin Carbon Fiber Intake Plenums
    for side in (-1.0, 1.0):
        bmesh.ops.create_cone(bm_engine, segments=24, cap_ends=True, cap_tris=False,
                              radius1=0.075, radius2=0.070, depth=0.62,
                              matrix=Matrix.Translation(Vector((side * 0.16, -0.95, 0.68))) @
                                     Matrix.Rotation(math.radians(90), 4, 'X'))
        # 6 Velocity Trumpets per bank
        for cy in range(6):
            y_runner = -0.70 - (cy * 0.10)
            bmesh.ops.create_cone(bm_engine, segments=16, cap_ends=True, cap_tris=False,
                                  radius1=0.024, radius2=0.018, depth=0.07,
                                  matrix=Matrix.Translation(Vector((side * 0.16, y_runner, 0.72))) @
                                         Matrix.Rotation(side * math.radians(-15), 4, 'Y'))

    # Equal-Length Stainless Exhaust Headers (6 primary tubes per bank)
    for side in (-1.0, 1.0):
        for cy in range(6):
            y_runner = -0.70 - (cy * 0.10)
            bmesh.ops.create_cone(bm_engine, segments=12, cap_ends=True, cap_tris=False,
                                  radius1=0.022, radius2=0.020, depth=0.18,
                                  matrix=Matrix.Translation(Vector((side * 0.32, y_runner, 0.44))) @
                                         Matrix.Rotation(side * math.radians(45), 4, 'Y'))

    # Dual Side Pod Radiator Cores
    for side in (-1.0, 1.0):
        bmesh.ops.create_cube(bm_engine, size=1.0,
                              matrix=Matrix.Translation(Vector((side * 0.72, 0.15, 0.38))) @
                                     Matrix.Rotation(side * math.radians(18), 4, 'Z') @
                                     Matrix.Scale(0.12, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(0.42, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(0.28, 4, Vector((0, 0, 1))))

    bmesh.ops.recalc_face_normals(bm_engine, faces=bm_engine.faces)
    create_mesh_object("POWERTRAIN_V12_Engine", bm_engine, parent=root_engine,
                       mat=[mats['carbon_fiber'], mats['bbs_magnesium'], mats['exhaust_pipe']], bevel=0.001, subsurf=1)

    return root_engine


def build_clk_gtr_gullwing_doors(parent, mats):
    """Constructs articulating gullwing doors with top hinge pivot."""
    doors = {}
    for side, name in [(-1.0, 'BODY_Gullwing_Door_L'), (1.0, 'BODY_Gullwing_Door_R')]:
        door_root = bpy.data.objects.new(name, None)
        door_root.parent = parent
        door_root.location = Vector((side * 0.35, 0.25, 1.08))
        bpy.context.collection.objects.link(door_root)

        bm_door = bmesh.new()
        bmesh.ops.create_cube(bm_door, size=1.0,
                              matrix=Matrix.Translation(Vector((side * 0.45, 0.0, -0.42))) @
                                     Matrix.Scale(0.18, 4, Vector((1, 0, 0))) @
                                     Matrix.Scale(0.72, 4, Vector((0, 1, 0))) @
                                     Matrix.Scale(0.55, 4, Vector((0, 0, 1))))

        bmesh.ops.recalc_face_normals(bm_door, faces=bm_door.faces)
        create_mesh_object(f"{name}_MeshObj", bm_door, parent=door_root,
                           mat=mats['brilliant_silver'], bevel=0.002, subsurf=2)
        doors[name] = door_root
    return doors


def setup_nla_actions(root, corner_objects, wing_obj, doors=None):
    """
    Sets up keyframed interactive animations adhering to Blender 5.2 LTS animation system:
    - Action_Steer_Left: FL & FR wheels yawing +-18 deg
    - Action_Wheel_Spin_FL / FR / RL / RR: 360 deg wheel rotation
    - Action_Active_Wing_Rake: Rear GT1 wing adjusting incidence pitch angle
    - Action_Door_Gullwing_L: Gullwing door opening upward
    """
    # 1. Steering Action for Front Wheels
    for c in corner_objects:
        if c['is_front']:
            obj = c['root']
            obj.animation_data_clear()
            obj.rotation_euler = (0, 0, 0)
            obj.keyframe_insert(data_path="rotation_euler", frame=0)
            steer_angle = math.radians(18.0)
            obj.rotation_euler = (0, 0, steer_angle)
            obj.keyframe_insert(data_path="rotation_euler", frame=30)
            obj.rotation_euler = (0, 0, 0)
            obj.keyframe_insert(data_path="rotation_euler", frame=60)
            if obj.animation_data and obj.animation_data.action:
                obj.animation_data.action.name = f"Action_{c['name']}_Steer"

    # 2. Continuous Wheel Spin Actions
    for c in corner_objects:
        obj = c['root']
        action = bpy.data.actions.new(name=f"Action_{c['name']}_Spin")
        obj.rotation_euler = (0, 0, 0)
        obj.keyframe_insert(data_path="rotation_euler", index=0, frame=0)
        obj.rotation_euler = (math.radians(360.0), 0, 0)
        obj.keyframe_insert(data_path="rotation_euler", index=0, frame=40)
        if obj.animation_data and obj.animation_data.action:
            obj.animation_data.action.name = f"Action_{c['name']}_Spin"

    # 3. Active Rear Wing Rake Angle Action
    if wing_obj:
        wing_obj.animation_data_clear()
        wing_obj.rotation_euler = (0, 0, 0)
        wing_obj.keyframe_insert(data_path="rotation_euler", frame=0)
        wing_obj.rotation_euler = (math.radians(-8.0), 0, 0)  # High downforce trim
        wing_obj.keyframe_insert(data_path="rotation_euler", frame=30)
        wing_obj.rotation_euler = (0, 0, 0)  # Low drag high speed trim
        wing_obj.keyframe_insert(data_path="rotation_euler", frame=60)
        if wing_obj.animation_data and wing_obj.animation_data.action:
            wing_obj.animation_data.action.name = "Action_Active_Wing_Rake"

    # 4. Gullwing Door Opening Action
    if doors:
        door_l = doors.get('BODY_Gullwing_Door_L')
        if door_l:
            door_l.animation_data_clear()
            door_l.rotation_euler = (0, 0, 0)
            door_l.keyframe_insert(data_path="rotation_euler", frame=0)
            door_l.rotation_euler = (math.radians(-15), math.radians(-55), 0)
            door_l.keyframe_insert(data_path="rotation_euler", frame=35)
            door_l.rotation_euler = (0, 0, 0)
            door_l.keyframe_insert(data_path="rotation_euler", frame=70)
            if door_l.animation_data and door_l.animation_data.action:
                door_l.animation_data.action.name = "Action_Door_Gullwing_L"


def run_mercedes_clk_gtr_master_generation():
    """Master generation and export pipeline for Mercedes-Benz CLK GTR."""
    # 1. Clean existing scene
    for o in list(bpy.data.objects):
        bpy.data.objects.remove(o, do_unlink=True)
    for m in list(bpy.data.meshes):
        bpy.data.meshes.remove(m, do_unlink=True)
    for mat in list(bpy.data.materials):
        bpy.data.materials.remove(mat, do_unlink=True)
    for a in list(bpy.data.actions):
        bpy.data.actions.remove(a, do_unlink=True)

    # 2. Setup High-Fidelity PBR Materials
    mats = setup_materials()

    # Master Root Node
    root = bpy.data.objects.new("Vehicle_Mercedes_CLK_GTR_1990s", None)
    root["brand"] = "Mercedes-Benz"
    root["model"] = "CLK GTR"
    root["era"] = "1990s"
    root["class"] = "hypercar"
    root["interactive"] = True
    bpy.context.collection.objects.link(root)

    # 3. Generate Class-A CAD Body Shell & Gullwing Doors
    body_master = build_clk_gtr_body_shell(root, mats)
    doors = build_clk_gtr_gullwing_doors(root, mats)

    # 4. Generate FIA GT Championship Aerodynamics (Splitter, Dive Planes, Wing, Scoop, Diffuser)
    root_aero, wing_obj = build_clk_gtr_aerodynamics(root, mats)

    # 5. Generate Cockpit Glass Canopy
    build_clk_gtr_cockpit_glass(root, mats)

    # 6. Generate Quad Oval Headlamps & Taillights
    build_clk_gtr_lighting(root, mats)

    # 7. Generate BBS 18" Magnesium Wheels, Slicks & Cross-Drilled Brakes
    _, corner_objects = build_clk_gtr_wheel_assembly(root, mats)

    # 8. Generate Powertrain (M120 6.9L V12 Engine Bay)
    build_clk_gtr_engine_bay(root, mats)

    # 9. Generate Jewelry (Mercedes 3-Pointed Star Grille, Inconel Exhaust, Mirrors)
    build_clk_gtr_jewelry(root, mats)

    # 10. Generate Enclosed Flat Underbody Belly Pan
    build_clk_gtr_underbody(root, mats)

    # 11. Generate 10 Semantic Hitboxes
    build_clk_gtr_hitboxes(root, mats)

    # 12. Setup NLA Actions
    setup_nla_actions(root, corner_objects, wing_obj, doors)

    # 12. Pre-Export Modifier Baking Protocol (Bake geometry while preserving kinematic pivot origins)
    bpy.context.view_layer.update()
    for obj in list(bpy.data.objects):
        if obj.type == 'MESH':
            bpy.context.view_layer.objects.active = obj
            for mod in list(obj.modifiers):
                if mod.type in {'BEVEL', 'SUBSURF', 'WEIGHTED_NORMAL', 'MIRROR', 'SOLIDIFY'}:
                    try:
                        bpy.ops.object.modifier_apply(modifier=mod.name)
                    except Exception as e:
                        pass

    # Audit polygon statistics
    bpy.context.view_layer.update()
    total_triangles = 0
    total_verts = 0
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            for poly in obj.data.polygons:
                total_triangles += max(0, poly.loop_total - 2)
            total_verts += len(obj.data.vertices)

    print(f"MASTER MERCEDES CLK GTR GENERATED:")
    print(f"  Total Triangles: {total_triangles:,}")
    print(f"  Total Vertices:  {total_verts:,}")

    # 13. Export Master GLB to Public Target
    export_paths = [
        r"e:\Car_Automation\public\models\vehicles\hypercar\1990s\vehicle.glb",
        r"e:\Car_Automation\public\models\Car_Mercedes_CLK_GTR_1990s_Complete.glb",
        r"e:\Car_Automation\exports\Car_Mercedes_CLK_GTR_1990s_Complete.glb"
    ]
    for p in export_paths:
        os.makedirs(os.path.dirname(p), exist_ok=True)

    primary_export = export_paths[0]
    bpy.ops.export_scene.gltf(
        filepath=primary_export,
        export_format='GLB',
        use_selection=False,
        export_apply=False,
        export_yup=True,
        export_materials='EXPORT',
        export_extras=True,
        export_animations=True,
        export_animation_mode='ACTIONS',
        export_morph=True
    )
    file_size_mb = os.path.getsize(primary_export) / (1024 * 1024)
    print(f"Exported upgraded Master Mercedes CLK GTR GLB: {primary_export} ({file_size_mb:.2f} MB)")

    # Secondary copies
    import shutil
    for sec_path in export_paths[1:]:
        shutil.copyfile(primary_export, sec_path)
        print(f"Copied master delivery -> {sec_path}")

    return {
        'triangles': total_triangles,
        'file_size_mb': file_size_mb
    }


# Execute inside Blender MCP
run_mercedes_clk_gtr_master_generation()
