"""
================================================================================
MASTER CLASS-A CAD GENERATOR: 2021 FERRARI SF90 STRADALE (SUPERCAR 2020S)
================================================================================
Procedural CAD generator for the 2021 Ferrari SF90 Stradale.
Fulfills all 7 Production Quality Gates:
  - Gate 1: File Size >= 15 MB
  - Gate 2: Polygons >= 600,000 (Target 750k - 900k)
  - Gate 3: Hierarchy (7/7 Subsystems: Body, Glass, Wheels, Lighting, Aero, Jewelry, Underbody)
  - Gate 4: Hitboxes (10 HITBOX_* nodes with Mat_Invisible_Hitbox)
  - Gate 5: NLA Actions (Pre-baked keyframed interactive animations)
  - Gate 6: Metadata (interactive, sound_fx, haptic)
  - Gate 7: PBR Materials (Rosso Corsa, Nero Roof, Giallo Modena Calipers, Carbon Fiber)
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
    # Iconic Ferrari Rosso Corsa Paint (Deep Multi-Stage Clearcoat)
    m['rosso_corsa'] = get_pbr_material('Mat_Ferrari_RossoCorsa', {
        'color': (0.86, 0.022, 0.028, 1.0),
        'metallic': 0.14,
        'roughness': 0.16,
        'clearcoat': 1.0,
        'clearcoat_roughness': 0.02
    })
    # Gloss Nero Two-Tone Roof & Canopy
    m['nero_roof'] = get_pbr_material('Mat_Ferrari_NeroRoof', {
        'color': (0.018, 0.018, 0.022, 1.0),
        'metallic': 0.35,
        'roughness': 0.18,
        'clearcoat': 1.0,
        'clearcoat_roughness': 0.03
    })
    # Dielectric Windshield Glass (Light optical tint)
    m['glass'] = get_pbr_material('Mat_Glass_Dielectric', {
        'color': (0.015, 0.025, 0.03, 1.0),
        'transmission': 0.92,
        'ior': 1.52,
        'roughness': 0.02,
        'clearcoat': 1.0,
        'alpha': 0.60
    }, blend_method='BLEND')
    # Clear Polycarbonate Headlamp Lens
    m['polycarbonate'] = get_pbr_material('Mat_Light_Polycarbonate', {
        'color': (0.95, 0.97, 0.99, 1.0),
        'transmission': 0.95,
        'ior': 1.54,
        'roughness': 0.01,
        'clearcoat': 1.0,
        'alpha': 0.35
    }, blend_method='BLEND')
    # Ferrari Gloss Carbon Fiber (Splitters, Diffuser, Active Wing)
    m['carbon_fiber'] = get_pbr_material('Mat_Ferrari_CarbonFiber', {
        'color': (0.038, 0.038, 0.042, 1.0),
        'metallic': 0.38,
        'roughness': 0.22,
        'clearcoat': 1.0,
        'clearcoat_roughness': 0.04
    })
    # Diamond-Cut Wheel Face (Polished Aluminum)
    m['diamond_cut_face'] = get_pbr_material('Mat_DiamondCut_Aluminum', {
        'color': (0.92, 0.93, 0.94, 1.0),
        'metallic': 0.96,
        'roughness': 0.08,
        'clearcoat': 0.8
    })
    # Anthracite Inner Spoke Pockets
    m['anthracite_pockets'] = get_pbr_material('Mat_Anthracite_Pockets', {
        'color': (0.16, 0.17, 0.18, 1.0),
        'metallic': 0.85,
        'roughness': 0.28
    })
    # Michelin Pilot Sport Cup 2 Tire Rubber
    m['tire_rubber'] = get_pbr_material('Mat_Tire_Rubber', {
        'color': (0.03, 0.03, 0.03, 1.0),
        'metallic': 0.0,
        'roughness': 0.84
    })
    # Brembo Carbon-Ceramic CCM Rotor
    m['ccm_rotor'] = get_pbr_material('Mat_Brembo_CCM_Rotor', {
        'color': (0.32, 0.33, 0.35, 1.0),
        'metallic': 0.80,
        'roughness': 0.32
    })
    # Iconic Ferrari Giallo Modena Calipers
    m['giallo_modena_caliper'] = get_pbr_material('Mat_Ferrari_GialloModena', {
        'color': (0.96, 0.78, 0.02, 1.0),
        'metallic': 0.15,
        'roughness': 0.18,
        'clearcoat': 1.0,
        'clearcoat_roughness': 0.02
    })
    # Ferrari Center Cap Yellow Emblem
    m['ferrari_yellow_cap'] = get_pbr_material('Mat_Ferrari_CenterCap', {
        'color': (0.96, 0.78, 0.02, 1.0),
        'metallic': 0.30,
        'roughness': 0.20,
        'clearcoat': 0.8
    })
    # Polished Inconel High-Mounted Exhaust Cannons
    m['exhaust_inconel'] = get_pbr_material('Mat_Exhaust_Inconel', {
        'color': (0.84, 0.82, 0.86, 1.0),
        'metallic': 0.96,
        'roughness': 0.12,
        'clearcoat': 0.9
    })
    # Dark Exhaust Bore Interior
    m['exhaust_bore'] = get_pbr_material('Mat_Exhaust_Bore', {
        'color': (0.06, 0.06, 0.07, 1.0),
        'metallic': 0.60,
        'roughness': 0.60
    })
    # Matrix LED Slit Headlights (Pure White)
    m['matrix_led'] = get_pbr_material('Mat_Matrix_LED', {
        'color': (0.95, 0.98, 1.0, 1.0),
        'emission': (0.95, 0.98, 1.0, 1.0),
        'emission_strength': 8.5,
        'roughness': 0.05
    })
    # C-Shaped DRL Lightguide Emitters
    m['c_drl_lightguide'] = get_pbr_material('Mat_C_DRL_Lightguide', {
        'color': (0.92, 0.96, 1.0, 1.0),
        'emission': (0.92, 0.96, 1.0, 1.0),
        'emission_strength': 6.5,
        'roughness': 0.08
    })
    # Squashed Horizontal Pill OLED Taillights
    m['oled_taillight'] = get_pbr_material('Mat_OLED_Taillight', {
        'color': (0.96, 0.02, 0.03, 1.0),
        'emission': (0.96, 0.02, 0.03, 1.0),
        'emission_strength': 6.0,
        'roughness': 0.10
    })
    m['taillight_amber'] = get_pbr_material('Mat_Taillight_Amber', {
        'color': (1.0, 0.52, 0.02, 1.0),
        'emission': (1.0, 0.52, 0.02, 1.0),
        'emission_strength': 4.5,
        'roughness': 0.15
    })
    # Satin Black Grilles, Radiator Ducts & Trim
    m['trim_black'] = get_pbr_material('Mat_Trim_SatinBlack', {
        'color': (0.04, 0.04, 0.045, 1.0),
        'metallic': 0.20,
        'roughness': 0.65
    })
    # Invisible Raycast Hitboxes
    m['hitbox'] = get_pbr_material('Mat_Invisible_Hitbox', {
        'color': (1.0, 1.0, 1.0, 0.0),
        'alpha': 0.0,
        'roughness': 1.0
    }, blend_method='BLEND')

    return m


# ─── 1. Ferrari SF90 Stradale Sculpted Hammerhead Body Shell ─────────────
def build_ferrari_sf90_chassis(mats):
    """
    Constructs the forward-arrowhead hammerhead Class-A body shell:
    Dimensions: Length 4.710m (half 2.355m), Width 1.972m (half 0.986m), Height 1.186m.
    Wheelbase 2.650m: Front axle at Y=+1.325m, Rear axle at Y=-1.325m.
    26 continuous station rings capturing:
    - Forward arrowhead hammerhead nose with central S-Duct dip
    - Slim horizontal matrix LED tunnels
    - Low-slung canopy cabin with Nero two-tone roof
    - Deep sculpted side air scoops feeding hybrid V8 intercoolers
    - High-mounted rear deck with shut-off Gurney active aero pocket
    """
    bm = bmesh.new()

    # (Y, hw_bot, hw_wai, hw_sho, hw_roo, z_bot, z_wai, z_sho, z_roo, is_cowl)
    stations = [
        # Front Hammerhead Nose Tip (+Y)
        ( 2.355,  0.34, 0.44, 0.38, 0.18, 0.14, 0.24, 0.28, 0.30, False),
        # Front Apron / S-Duct Intake Mouth
        ( 2.26,   0.66, 0.77, 0.68, 0.34, 0.14, 0.27, 0.35, 0.36, False),
        # Front Intake Headers / Brake Duct Inlets
        ( 2.10,   0.78, 0.88, 0.80, 0.46, 0.14, 0.33, 0.43, 0.46, False),
        # Matrix LED Slit Headlamp Station
        ( 1.90,   0.84, 0.92, 0.84, 0.54, 0.15, 0.39, 0.51, 0.54, False),
        # S-Duct Bonnet Outlet / Fender Peak Entry
        ( 1.66,   0.87, 0.95, 0.87, 0.58, 0.15, 0.47, 0.59, 0.62, False),
        # Front Wheel Arch Front Rise
        ( 1.48,   0.88, 0.96, 0.88, 0.60, 0.50, 0.59, 0.66, 0.66, False),
        # Front Axle Centerline (Peak of front arch Y=+1.325m)
        ( 1.325,  0.89, 0.97, 0.89, 0.61, 0.64, 0.67, 0.69, 0.69, False),
        # Front Arch Rear Fall
        ( 1.18,   0.88, 0.96, 0.88, 0.61, 0.50, 0.59, 0.67, 0.71, False),
        # Cowl / Windshield Base Header
        ( 0.92,   0.86, 0.94, 0.86, 0.62, 0.15, 0.55, 0.67, 0.74, True),
        # Lower A-Pillar Base / Nero Roof Transition
        ( 0.62,   0.84, 0.92, 0.82, 0.58, 0.15, 0.57, 0.71, 0.94, False),
        # Cockpit Center / Side Radiator Scoop Entry
        ( 0.28,   0.82, 0.90, 0.78, 0.54, 0.15, 0.59, 0.73, 1.14, False),
        # Cockpit Roof Peak (1.186m max height)
        ( 0.00,   0.81, 0.89, 0.76, 0.52, 0.15, 0.60, 0.74, 1.186, False),
        # Rear Glass / Engine Cover Transition
        (-0.25,   0.83, 0.91, 0.78, 0.50, 0.15, 0.62, 0.76, 1.16, False),
        # Mid V8 Clamshell Spine Midpoint
        (-0.52,   0.85, 0.93, 0.82, 0.48, 0.15, 0.64, 0.79, 1.08, False),
        # Deep Side Air Intake Peak Trench
        (-0.75,   0.87, 0.95, 0.86, 0.46, 0.15, 0.68, 0.82, 0.99, False),
        # Mid V8 Engine Glass Inspection Window
        (-1.00,   0.89, 0.97, 0.90, 0.44, 0.15, 0.72, 0.85, 0.93, False),
        # Rear Wheel Arch Entry
        (-1.18,   0.90, 0.98, 0.91, 0.42, 0.16, 0.81, 0.89, 0.89, False),
        # Rear Arch Front Rise
        (-1.24,   0.91, 0.986, 0.92, 0.41, 0.51, 0.84, 0.91, 0.88, False),
        # Rear Axle Centerline (Peak of rear haunches Y=-1.325m)
        (-1.325,  0.91, 0.986, 0.92, 0.40, 0.65, 0.87, 0.92, 0.87, False),
        # Rear Arch Rear Fall
        (-1.45,   0.90, 0.97, 0.91, 0.38, 0.51, 0.83, 0.90, 0.85, False),
        # Active Shut-off Gurney Wing Well
        (-1.75,   0.87, 0.94, 0.87, 0.35, 0.17, 0.75, 0.86, 0.82, False),
        # High Exhaust Header & Taillight Shelf
        (-2.05,   0.82, 0.89, 0.82, 0.32, 0.21, 0.66, 0.80, 0.79, False),
        # Rear Fascia Header (Central High Exhausts & Pill Taillights)
        (-2.25,   0.77, 0.84, 0.76, 0.28, 0.27, 0.56, 0.74, 0.78, False),
        # Rear Diffuser Trailing Edge (-Y)
        (-2.355,  0.72, 0.79, 0.70, 0.24, 0.31, 0.50, 0.70, 0.76, False),
    ]

    rings = []
    for (y, h_bot, h_wai, h_sho, h_roo, z_bot, z_wai, z_sho, z_roo, is_cowl) in stations:
        # S-Duct depression at center of hood
        center_z = z_roo
        if 1.50 <= y <= 2.10:
            center_z = z_roo - 0.045  # Center aerodynamic scoop channel

        co_list = [
            (-h_bot, y, z_bot),
            (-h_bot * 1.03, y, (z_bot + z_wai) * 0.48),
            (-h_wai, y, z_wai),
            (-h_sho, y, z_sho),
            (-h_roo, y, z_roo * 0.96),
            (-h_roo * 0.45, y, center_z),
            (0.0, y, center_z * 0.97 if 1.50 <= y <= 2.10 else center_z * 1.008 if y < 0.2 else center_z),
            (h_roo * 0.45, y, center_z),
            (h_roo, y, z_roo * 0.96),
            (h_sho, y, z_sho),
            (h_wai, y, z_wai),
            (h_bot * 1.03, y, (z_bot + z_wai) * 0.48),
            (h_bot, y, z_bot),
            (h_bot * 0.5, y, z_bot - 0.01),
            (-h_bot * 0.5, y, z_bot - 0.01),
        ]
        ring_v = [bm.verts.new(p) for p in co_list]
        rings.append(ring_v)

    # Bridge station rings
    for i in range(len(rings) - 1):
        r1, r2 = rings[i], rings[i+1]
        n = len(r1)
        for j in range(n):
            jn = (j + 1) % n
            bm.faces.new([r1[j], r1[jn], r2[jn], r2[j]])

    # Cap front nose
    r_f = rings[0]
    front_c = bm.verts.new((0.0, stations[0][0], (stations[0][5] + stations[0][8]) * 0.5))
    for j in range(len(r_f)):
        jn = (j + 1) % len(r_f)
        bm.faces.new([r_f[j], r_f[jn], front_c])

    # Cap rear tail
    r_b = rings[-1]
    back_c = bm.verts.new((0.0, stations[-1][0], (stations[-1][5] + stations[-1][8]) * 0.5))
    for j in range(len(r_b)):
        jn = (j + 1) % len(r_b)
        bm.faces.new([r_b[jn], r_b[j], back_c])

    mesh = bpy.data.meshes.new("BODY_MainShell_Mesh")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("BODY_MainShell", mesh)
    obj.data.materials.append(mats['rosso_corsa'])
    obj.data.materials.append(mats['nero_roof'])
    bpy.context.collection.objects.link(obj)

    # Assign Nero Roof material to canopy faces (-0.6m <= Y <= 0.65m and Z >= 0.85m)
    for poly in obj.data.polygons:
        poly.use_smooth = True
        cen = poly.center
        if -0.65 <= cen.y <= 0.65 and cen.z >= 0.85 and abs(cen.x) <= 0.60:
            poly.material_index = 1
        else:
            poly.material_index = 0

    sub = obj.modifiers.new(name="Subdivision", type='SUBSURF')
    sub.render_levels = 4
    sub.levels = 4

    return obj


# ─── 2. Front Hammerhead Apron, S-Duct Pylons & Carbon Splitter ──────────
def build_front_hammerhead_aero(mats):
    """
    Constructs the Ferrari SF90 front aerodynamic architecture:
    - Forward arrowhead lower bumper dam with twin central pylons
    - Functional central S-Duct channel
    - Carbon-fiber lower front splitter with lateral vortex generators
    """
    bm_bumper = bmesh.new()
    bm_splitter = bmesh.new()
    bm_vortex = bmesh.new()

    # Center Radiator Dam (Y=2.32, Z=0.22)
    bmesh.ops.create_cube(bm_bumper, size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 2.32, 0.22))) @
               Matrix.Scale(0.86, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.06, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.13, 4, Vector((0, 0, 1))))

    # Twin Central Aerodynamic Pylons
    for p_side in [-1.0, 1.0]:
        px = p_side * 0.18
        bmesh.ops.create_cube(bm_bumper, size=1.0,
            matrix=Matrix.Translation(Vector((px, 2.33, 0.22))) @
                   Matrix.Scale(0.035, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.08, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.14, 4, Vector((0, 0, 1))))

    # Outer Brake Cooling Intakes & Amber Reflectors
    for side in [-1.0, 1.0]:
        ox = side * 0.66
        bmesh.ops.create_cube(bm_bumper, size=1.0,
            matrix=Matrix.Translation(Vector((ox, 2.25, 0.24))) @
                   Matrix.Rotation(math.radians(-side * 14), 4, 'Z') @
                   Matrix.Scale(0.24, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.06, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.12, 4, Vector((0, 0, 1))))

        # Amber Side Marker
        bmesh.ops.create_cube(bm_bumper, size=1.0,
            matrix=Matrix.Translation(Vector((ox + side * 0.14, 2.18, 0.33))) @
                   Matrix.Rotation(math.radians(-side * 16), 4, 'Z') @
                   Matrix.Scale(0.015, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.10, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.024, 4, Vector((0, 0, 1))))

        # Lateral Front Carbon Vortex Generators
        bmesh.ops.create_cube(bm_vortex, size=1.0,
            matrix=Matrix.Translation(Vector((side * 0.90, 2.15, 0.22))) @
                   Matrix.Rotation(math.radians(-side * 18), 4, 'Z') @
                   Matrix.Scale(0.08, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.22, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.012, 4, Vector((0, 0, 1))))

    # Lower Carbon Front Splitter
    bmesh.ops.create_cube(bm_splitter, size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 2.34, 0.12))) @
               Matrix.Scale(1.48, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.18, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.018, 4, Vector((0, 0, 1))))

    # Bumper Inlets
    mesh_b = bpy.data.meshes.new("AERO_FrontIntakes_Mesh")
    bm_bumper.to_mesh(mesh_b)
    bm_bumper.free()
    obj_b = bpy.data.objects.new("AERO_FrontIntakes", mesh_b)
    obj_b.data.materials.append(mats['trim_black'])
    obj_b.data.materials.append(mats['taillight_amber'])
    bpy.context.collection.objects.link(obj_b)

    # Front Splitter
    mesh_s = bpy.data.meshes.new("AERO_FrontSplitter_Mesh")
    bm_splitter.to_mesh(mesh_s)
    bm_splitter.free()
    obj_s = bpy.data.objects.new("AERO_FrontSplitter", mesh_s)
    obj_s.data.materials.append(mats['carbon_fiber'])
    bpy.context.collection.objects.link(obj_s)

    # Vortex Generators
    mesh_v = bpy.data.meshes.new("AERO_VortexGenerators_Mesh")
    bm_vortex.to_mesh(mesh_v)
    bm_vortex.free()
    obj_v = bpy.data.objects.new("AERO_VortexGenerators", mesh_v)
    obj_v.data.materials.append(mats['carbon_fiber'])
    bpy.context.collection.objects.link(obj_v)

    return obj_b


# ─── 3. Ultra-Slim Matrix LED Headlights with C-Shape DRLs ────────────────
def build_ferrari_sf90_headlamps(mats):
    """
    Constructs the signature Ferrari SF90 matrix LED headlights:
    - Ultra-slim horizontal slit matrix LED headlights
    - Distinctive C-shaped daytime running light lightguides
    - Integrated lower brake air intakes
    - Aerodynamic clear polycarbonate lens fairings
    """
    bm_covers = bmesh.new()
    bm_slits = bmesh.new()
    bm_drl = bmesh.new()
    bm_housing = bmesh.new()

    for side in [-1.0, 1.0]:
        hx = side * 0.58
        hy = 1.90
        hz = 0.54

        # Clear Polycarbonate Fairing Lens
        bmesh.ops.create_cone(bm_covers, cap_ends=True, segments=32,
            radius1=0.088, radius2=0.048, depth=0.30,
            matrix=Matrix.Translation(Vector((hx, hy, hz))) @
                   Matrix.Rotation(math.radians(-14), 4, 'X') @
                   Matrix.Rotation(math.radians(-side * 8), 4, 'Z') @
                   Matrix.Scale(1.0, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(1.0, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.10, 4, Vector((0, 0, 1))))

        # Recessed Dark Housing Bucket
        bmesh.ops.create_cone(bm_housing, cap_ends=True, segments=32,
            radius1=0.082, radius2=0.042, depth=0.28,
            matrix=Matrix.Translation(Vector((hx, hy, hz - 0.010))) @
                   Matrix.Rotation(math.radians(-14), 4, 'X') @
                   Matrix.Rotation(math.radians(-side * 8), 4, 'Z') @
                   Matrix.Scale(1.0, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(1.0, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.09, 4, Vector((0, 0, 1))))

        # Horizontal Matrix LED Slit Emitters (3 segments)
        for s_i, sy_off in enumerate([-0.04, 0.0, 0.04]):
            bmesh.ops.create_cube(bm_slits, size=1.0,
                matrix=Matrix.Translation(Vector((hx + side * 0.01, hy + sy_off, hz - 0.008))) @
                       Matrix.Scale(0.038, 4, Vector((1, 0, 0))) @
                       Matrix.Scale(0.015, 4, Vector((0, 1, 0))) @
                       Matrix.Scale(0.010, 4, Vector((0, 0, 1))))

        # C-Shaped DRL Lower Lightguide (Underneath the matrix slit)
        bmesh.ops.create_cube(bm_drl, size=1.0,
            matrix=Matrix.Translation(Vector((hx - side * 0.02, hy - 0.02, hz - 0.022))) @
                   Matrix.Rotation(math.radians(-side * 12), 4, 'Z') @
                   Matrix.Scale(0.065, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.012, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.008, 4, Vector((0, 0, 1))))

    mesh_cov = bpy.data.meshes.new("LIGHTING_HeadlampCovers_Mesh")
    bm_covers.to_mesh(mesh_cov)
    bm_covers.free()
    obj_cov = bpy.data.objects.new("LIGHTING_HeadlampCovers", mesh_cov)
    obj_cov.data.materials.append(mats['polycarbonate'])
    bpy.context.collection.objects.link(obj_cov)

    mesh_sl = bpy.data.meshes.new("LIGHTING_Headlamps_Mesh")
    bm_slits.to_mesh(mesh_sl)
    bm_slits.free()
    obj_sl = bpy.data.objects.new("LIGHTING_Headlamps", mesh_sl)
    obj_sl.data.materials.append(mats['matrix_led'])
    bpy.context.collection.objects.link(obj_sl)

    mesh_drl = bpy.data.meshes.new("LIGHTING_CDRL_Mesh")
    bm_drl.to_mesh(mesh_drl)
    bm_drl.free()
    obj_drl = bpy.data.objects.new("LIGHTING_CDRL", mesh_drl)
    obj_drl.data.materials.append(mats['c_drl_lightguide'])
    bpy.context.collection.objects.link(obj_drl)

    mesh_hsg = bpy.data.meshes.new("LIGHTING_HeadlampHousing_Mesh")
    bm_housing.to_mesh(mesh_hsg)
    bm_housing.free()
    obj_hsg = bpy.data.objects.new("LIGHTING_HeadlampHousing", mesh_hsg)
    obj_hsg.data.materials.append(mats['trim_black'])
    bpy.context.collection.objects.link(obj_hsg)

    return obj_sl


# ─── 4. Cockpit Windshield & Center Wiper ────────────────────────────────
def build_ferrari_sf90_greenhouse(mats):
    """Constructs panoramic windshield and single pantograph center wiper."""
    bm_glass = bmesh.new()

    # Raked Windshield (Cowl Y=0.92 to Roof Header Y=0.00)
    w_bl = bm_glass.verts.new((-0.72, 0.92, 0.74))
    w_br = bm_glass.verts.new((0.72, 0.92, 0.74))
    w_tr = bm_glass.verts.new((0.52, 0.00, 1.18))
    w_tl = bm_glass.verts.new((-0.52, 0.00, 1.18))
    bm_glass.faces.new([w_bl, w_br, w_tr, w_tl])

    # Side Quarter Windows
    for sign in [-1.0, 1.0]:
        v1 = bm_glass.verts.new((0.52 * sign, 0.00, 1.18))
        v2 = bm_glass.verts.new((0.56 * sign, -0.25, 1.10))
        v3 = bm_glass.verts.new((0.76 * sign, -0.25, 0.76))
        v4 = bm_glass.verts.new((0.72 * sign, 0.00, 0.74))
        bm_glass.faces.new([v1, v2, v3, v4] if sign > 0 else [v1, v4, v3, v2])

    mesh = bpy.data.meshes.new("GLASS_CockpitWindshield_Mesh")
    bm_glass.to_mesh(mesh)
    bm_glass.free()

    obj = bpy.data.objects.new("GLASS_CockpitWindshield", mesh)
    obj.data.materials.append(mats['glass'])
    bpy.context.collection.objects.link(obj)

    sub = obj.modifiers.new(name="Subsurf", type='SUBSURF')
    sub.render_levels = 2
    sub.levels = 2

    # Center Pantograph Wiper
    bm_wiper = bmesh.new()
    bmesh.ops.create_cone(bm_wiper, cap_ends=True, segments=12,
        radius1=0.007, radius2=0.007, depth=0.58,
        matrix=Matrix.Translation(Vector((0.06, 0.54, 0.96))) @
               Matrix.Rotation(math.radians(-24), 4, 'X') @
               Matrix.Rotation(math.radians(14), 4, 'Z'))

    mesh_wip = bpy.data.meshes.new("JEWELRY_CenterWiper_Mesh")
    bm_wiper.to_mesh(mesh_wip)
    bm_wiper.free()
    obj_wip = bpy.data.objects.new("JEWELRY_CenterWiper", mesh_wip)
    obj_wip.data.materials.append(mats['trim_black'])
    bpy.context.collection.objects.link(obj_wip)

    return obj


# ─── 5. Articulating Doors & Deep Sculpted Side Radiator Scoops ──────────
def build_ferrari_sf90_doors_and_intakes(mats):
    """
    Constructs articulating doors, high-mounted aero mirrors, and large side scoops:
    - Deep side radiator air intakes behind the doors (Y = -0.15m to -0.85m)
    - Sculpted door waistline channels
    """
    door_objs = []

    door_stations = [
        ( 0.62, 0.92, 0.82, 0.57, 0.71),
        ( 0.28, 0.90, 0.78, 0.59, 0.73),
        ( 0.00, 0.89, 0.76, 0.60, 0.74),
        (-0.25, 0.91, 0.78, 0.62, 0.76),
        (-0.52, 0.93, 0.82, 0.64, 0.79),
    ]

    for side, dname in [(-1.0, "BODY_Door_FL"), (1.0, "BODY_Door_FR")]:
        bm = bmesh.new()

        rings = []
        for y, hw_w, hw_s, zw, zs in door_stations:
            pts = [
                (side * (hw_w * 0.985 + 0.002), y, 0.28),
                (side * (hw_w * 1.000 + 0.002), y, (0.28 + zw) * 0.5),
                (side * (hw_w * 1.000 + 0.002), y, zw),
                (side * (hw_s * 1.000 + 0.002), y, zs),
            ]
            rings.append([bm.verts.new(p) for p in pts])

        for i in range(len(rings) - 1):
            r1, r2 = rings[i], rings[i+1]
            for j in range(len(r1) - 1):
                bm.faces.new([r1[j], r1[j+1], r2[j+1], r2[j]])

        mesh = bpy.data.meshes.new(f"{dname}_Mesh")
        bm.to_mesh(mesh)
        bm.free()

        obj = bpy.data.objects.new(dname, mesh)
        obj.data.materials.append(mats['rosso_corsa'])
        bpy.context.collection.objects.link(obj)

        for p in obj.data.polygons:
            p.use_smooth = True

        sol = obj.modifiers.new(name="Solidify", type='SOLIDIFY')
        sol.thickness = 0.0035

        bev = obj.modifiers.new(name="Bevel", type='BEVEL')
        bev.width = 0.002
        bev.segments = 2

        # Physical hinge pivot on forward lower A-pillar
        obj.location = Vector((side * 0.84, 0.62, 0.40))
        for v in obj.data.vertices:
            v.co -= Vector((side * 0.84, 0.62, 0.40))

        door_objs.append(obj)

    # Side Radiator Intakes and Aero Mirrors
    bm_intakes = bmesh.new()
    bm_mirrors = bmesh.new()

    for side in [-1.0, 1.0]:
        # Sculpted Side Radiator Intake Scoops
        bmesh.ops.create_cube(bm_intakes, size=1.0,
            matrix=Matrix.Translation(Vector((side * 0.86, -0.65, 0.48))) @
                   Matrix.Rotation(math.radians(-side * 5), 4, 'Z') @
                   Matrix.Scale(0.12, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.55, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.26, 4, Vector((0, 0, 1))))

        # High-Mounted Aerodynamic Side Mirrors
        bmesh.ops.create_cone(bm_mirrors, cap_ends=True, segments=20,
            radius1=0.038, radius2=0.018, depth=0.16,
            matrix=Matrix.Translation(Vector((side * 0.89, 0.54, 0.83))) @
                   Matrix.Rotation(math.radians(side * 85), 4, 'Z') @
                   Matrix.Rotation(math.radians(-10), 4, 'X'))

    mesh_in = bpy.data.meshes.new("AERO_SideIntakes_Mesh")
    bm_intakes.to_mesh(mesh_in)
    bm_intakes.free()
    obj_in = bpy.data.objects.new("AERO_SideIntakes", mesh_in)
    obj_in.data.materials.append(mats['trim_black'])
    bpy.context.collection.objects.link(obj_in)

    mesh_mir = bpy.data.meshes.new("AERO_SideMirrors_Mesh")
    bm_mirrors.to_mesh(mesh_mir)
    bm_mirrors.free()
    obj_mir = bpy.data.objects.new("AERO_SideMirrors", mesh_mir)
    obj_mir.data.materials.append(mats['rosso_corsa'])
    bpy.context.collection.objects.link(obj_mir)

    return door_objs


# ─── 6. High-Mounted Center Exhaust & Active Shut-Off Gurney Wing ─────────
def build_ferrari_sf90_exhaust_and_active_wing(mats):
    """
    Constructs:
    - High-mounted dual circular polished Inconel exhaust pipes (center of rear fascia)
    - Ferrari patented active shut-off Gurney rear aerofoil system
    """
    bm_ex = bmesh.new()
    ex_y = -2.34
    ex_z = 0.65
    ex_spacing = 0.12  # Distance between twin exhaust centers

    for ex_side in [-1.0, 1.0]:
        ex_x = ex_side * ex_spacing
        # Polished Inconel outer sleeve
        bmesh.ops.create_cone(bm_ex, cap_ends=True, segments=36,
            radius1=0.048, radius2=0.048, depth=0.22,
            matrix=Matrix.Translation(Vector((ex_x, ex_y, ex_z))) @ Matrix.Rotation(math.radians(90), 4, 'X'))
        # Dark inner hollow bore
        bmesh.ops.create_cone(bm_ex, cap_ends=True, segments=36,
            radius1=0.042, radius2=0.042, depth=0.23,
            matrix=Matrix.Translation(Vector((ex_x, ex_y - 0.005, ex_z))) @ Matrix.Rotation(math.radians(90), 4, 'X'))

    mesh_ex = bpy.data.meshes.new("JEWELRY_HighCenterExhaust_Mesh")
    bm_ex.to_mesh(mesh_ex)
    bm_ex.free()
    obj_ex = bpy.data.objects.new("JEWELRY_HighCenterExhaust", mesh_ex)
    obj_ex.data.materials.append(mats['exhaust_inconel'])
    bpy.context.collection.objects.link(obj_ex)

    # Active Shut-off Gurney Aerofoil System
    bm_wing = bmesh.new()

    # Suspended central aerodynamic profile (Span 0.88m, chord 0.22m, thickness 0.020m)
    bmesh.ops.create_cube(bm_wing, size=1.0,
        matrix=Matrix.Translation(Vector((0.0, -1.82, 0.84))) @
               Matrix.Scale(0.88, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.22, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.020, 4, Vector((0, 0, 1))))

    # Fixed Lateral Wing Caps
    for side in [-1.0, 1.0]:
        wx = side * 0.62
        bmesh.ops.create_cube(bm_wing, size=1.0,
            matrix=Matrix.Translation(Vector((wx, -1.84, 0.84))) @
                   Matrix.Scale(0.34, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.24, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.022, 4, Vector((0, 0, 1))))

    mesh_wing = bpy.data.meshes.new("AERO_ActiveRearWing_Mesh")
    bm_wing.to_mesh(mesh_wing)
    bm_wing.free()

    obj_wing = bpy.data.objects.new("AERO_ActiveRearWing", mesh_wing)
    obj_wing.data.materials.append(mats['carbon_fiber'])
    bpy.context.collection.objects.link(obj_wing)

    bev = obj_wing.modifiers.new(name="Bevel", type='BEVEL')
    bev.width = 0.002
    bev.segments = 2
    sub = obj_wing.modifiers.new(name="Subsurf", type='SUBSURF')
    sub.render_levels = 2
    sub.levels = 2

    # Physical hinge/lift origin
    obj_wing.location = Vector((0.0, -1.82, 0.84))
    for v in obj_wing.data.vertices:
        v.co -= Vector((0.0, -1.82, 0.84))

    return obj_ex, obj_wing


# ─── 7. Horizontal Geometric OLED Taillight Rings ────────────────────────
def build_ferrari_sf90_taillamps(mats):
    """
    Constructs the signature squashed horizontal pill/ring OLED taillights:
    - 2 squashed rings per side (outer brake + inner indicator)
    - Positioned at Y = -2.35m, Z = 0.72m
    - Dark carbon rear valence panel surrounding high exhaust and taillights
    """
    bm_oled = bmesh.new()
    bm_amber = bmesh.new()
    tail_y = -2.352
    tail_z = 0.72

    # 2 Squashed Horizontal Pill Taillight Rings per side
    for side in [-1.0, 1.0]:
        # Outer Pill Ring
        ox = side * 0.54
        bmesh.ops.create_cube(bm_oled, size=1.0,
            matrix=Matrix.Translation(Vector((ox, tail_y, tail_z))) @
                   Matrix.Scale(0.18, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.022, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.042, 4, Vector((0, 0, 1))))

        # Inner Pill Ring
        ix = side * 0.34
        bmesh.ops.create_cube(bm_oled, size=1.0,
            matrix=Matrix.Translation(Vector((ix, tail_y, tail_z))) @
                   Matrix.Scale(0.16, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.022, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.040, 4, Vector((0, 0, 1))))

        # Amber Turn Signal Inside Outer Pill
        bmesh.ops.create_cube(bm_amber, size=1.0,
            matrix=Matrix.Translation(Vector((ox, tail_y - 0.002, tail_z))) @
                   Matrix.Scale(0.08, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.018, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.024, 4, Vector((0, 0, 1))))

    # Dark Carbon-Fiber Rear Valence Diffuser Panel
    bm_valence = bmesh.new()
    bmesh.ops.create_cube(bm_valence, size=1.0,
        matrix=Matrix.Translation(Vector((0.0, -2.350, 0.48))) @
               Matrix.Scale(1.42, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.016, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.46, 4, Vector((0, 0, 1))))

    mesh_val = bpy.data.meshes.new("AERO_RearValence_Mesh")
    bm_valence.to_mesh(mesh_val)
    bm_valence.free()
    obj_val = bpy.data.objects.new("AERO_RearValence", mesh_val)
    obj_val.data.materials.append(mats['carbon_fiber'])
    bpy.context.collection.objects.link(obj_val)

    mesh_r = bpy.data.meshes.new("LIGHTING_Taillamps_Mesh")
    bm_oled.to_mesh(mesh_r)
    bm_oled.free()
    obj_r = bpy.data.objects.new("LIGHTING_Taillamps", mesh_r)
    obj_r.data.materials.append(mats['oled_taillight'])
    bpy.context.collection.objects.link(obj_r)

    mesh_a = bpy.data.meshes.new("LIGHTING_Taillamps_Amber_Mesh")
    bm_amber.to_mesh(mesh_a)
    bm_amber.free()
    obj_a = bpy.data.objects.new("LIGHTING_Taillamps_Amber", mesh_a)
    obj_a.data.materials.append(mats['taillight_amber'])
    bpy.context.collection.objects.link(obj_a)

    return obj_r


# ─── 8. Flat Carbon Underbody & Aggressive 6-Strake Venturi Diffuser ──────
def build_underbody_and_diffusers(mats):
    """
    Constructs the flat carbon undertray floor with 6 vertical diffuser aero strakes.
    """
    bm = bmesh.new()

    # 1. Front Undertray (Tapered between front wheels)
    bmesh.ops.create_cube(bm, size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 1.82, 0.13))) @
               Matrix.Scale(1.24, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.75, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.016, 4, Vector((0, 0, 1))))

    # 2. Central Flat Floor (Between front and rear wheel arches)
    bmesh.ops.create_cube(bm, size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 0.0, 0.13))) @
               Matrix.Scale(1.60, 4, Vector((1, 0, 0))) @
               Matrix.Scale(2.35, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.016, 4, Vector((0, 0, 1))))

    # 3. Rear Venturi Diffuser Tunnels
    for side in [-1.0, 1.0]:
        dx = side * 0.42
        bmesh.ops.create_cube(bm, size=1.0,
            matrix=Matrix.Translation(Vector((dx, -2.00, 0.20))) @
                   Matrix.Rotation(math.radians(-16), 4, 'X') @
                   Matrix.Scale(0.40, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.65, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.06, 4, Vector((0, 0, 1))))

    # 6 Vertical Diffuser Strakes
    for sx in [-0.60, -0.36, -0.12, 0.12, 0.36, 0.60]:
        bmesh.ops.create_cube(bm, size=1.0,
            matrix=Matrix.Translation(Vector((sx, -2.04, 0.21))) @
                   Matrix.Rotation(math.radians(-16), 4, 'X') @
                   Matrix.Scale(0.012, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.62, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.10, 4, Vector((0, 0, 1))))

    mesh = bpy.data.meshes.new("UNDERBODY_FlatFloor_Mesh")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("UNDERBODY_FlatFloor", mesh)
    obj.data.materials.append(mats['carbon_fiber'])
    bpy.context.collection.objects.link(obj)

    bev_und = obj.modifiers.new(name="Bevel", type='BEVEL')
    bev_und.width = 0.003
    bev_und.segments = 2
    sub_und = obj.modifiers.new(name="Subsurf", type='SUBSURF')
    sub_und.render_levels = 3
    sub_und.levels = 3

    return obj


# ─── 9. Diamond-Cut Star Wheels & Giallo Modena Calipers ─────────────────
def build_sf90_wheel_corner(name, loc, is_front, is_left, mats):
    """
    Constructs high-density 5-spoke directional diamond-cut star forged wheels:
    - 20-inch wheels (radius 0.340m front, 0.345m rear)
    - Directional sculpted 5-star spokes with carbon aeroblade fillets
    - Stepped polished outer rim lip
    - Ferrari yellow center cap with Cavallino Rampante
    - Cross-drilled CCM carbon-ceramic rotor (398mm front, 360mm rear) with 36 internal cooling vanes
    - Ferrari Giallo Modena yellow 6-piston monobloc Brembo caliper
    Allocates high polygon density with Subsurf level 3 for >= 750k total car triangles.
    """
    bm = bmesh.new()

    wheel_r = 0.340 if is_front else 0.345
    rim_r = 0.254 if is_front else 0.258
    tire_w = 0.265 if is_front else 0.325
    dish_depth = 0.038 if is_front else 0.065
    side_dir = -1.0 if is_left else 1.0

    cx, cy, cz = loc.x, loc.y, loc.z

    # 1. Outer Stepped Rim Lip (Polished Aluminum)
    rim_start = len(bm.faces)
    bmesh.ops.create_cone(bm, cap_ends=False, segments=112,
        radius1=rim_r, radius2=rim_r, depth=tire_w * 0.95,
        matrix=Matrix.Translation(Vector((cx, cy, cz))) @ Matrix.Rotation(math.radians(90), 4, 'Y'))

    # Stepped Inner Lip Shelf 1
    bmesh.ops.create_cone(bm, cap_ends=False, segments=112,
        radius1=rim_r - 0.012, radius2=rim_r - 0.012, depth=dish_depth * 0.6,
        matrix=Matrix.Translation(Vector((cx + side_dir * (tire_w * 0.45 - dish_depth * 0.3), cy, cz))) @
               Matrix.Rotation(math.radians(90), 4, 'Y'))

    # Stepped Inner Lip Shelf 2
    bmesh.ops.create_cone(bm, cap_ends=False, segments=112,
        radius1=rim_r - 0.024, radius2=rim_r - 0.024, depth=dish_depth * 1.2,
        matrix=Matrix.Translation(Vector((cx + side_dir * (tire_w * 0.45 - dish_depth * 0.6), cy, cz))) @
               Matrix.Rotation(math.radians(90), 4, 'Y'))

    # 2. Central Hub & 5 Directional Diamond-Cut Star Spokes
    spoke_start = len(bm.faces)
    bmesh.ops.create_cone(bm, cap_ends=True, segments=10,
        radius1=0.080, radius2=0.080, depth=0.040,
        matrix=Matrix.Translation(Vector((cx + side_dir * (tire_w * 0.42 - dish_depth), cy, cz))) @
               Matrix.Rotation(math.radians(90), 4, 'Y'))

    for spoke_i in range(5):
        base_angle = spoke_i * (2.0 * math.pi / 5.0)
        spoke_rot = Matrix.Rotation(base_angle, 4, 'X')
        spoke_len = rim_r - 0.022
        spoke_mid = spoke_len * 0.52

        # Diamond-Cut Polished Star Spoke
        bmesh.ops.create_cube(bm, size=1.0,
            matrix=Matrix.Translation(Vector((cx + side_dir * (tire_w * 0.42 - dish_depth * 0.8), cy, cz))) @
                   spoke_rot @
                   Matrix.Translation(Vector((0, 0, spoke_mid))) @
                   Matrix.Scale(0.024, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.045, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(spoke_len * 0.86, 4, Vector((0, 0, 1))))

        # Carbon Aeroblade Spoke Winglet
        bmesh.ops.create_cube(bm, size=1.0,
            matrix=Matrix.Translation(Vector((cx + side_dir * (tire_w * 0.42 - dish_depth * 0.8 + 0.005), cy, cz))) @
                   spoke_rot @
                   Matrix.Translation(Vector((0, 0.022, spoke_mid))) @
                   Matrix.Scale(0.012, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.022, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(spoke_len * 0.70, 4, Vector((0, 0, 1))))

    # Ferrari Yellow Center Cap
    cap_start = len(bm.faces)
    bmesh.ops.create_cone(bm, cap_ends=True, segments=24,
        radius1=0.038, radius2=0.038, depth=0.030,
        matrix=Matrix.Translation(Vector((cx + side_dir * (tire_w * 0.45 - dish_depth + 0.014), cy, cz))) @
               Matrix.Rotation(math.radians(90), 4, 'Y'))

    # 3. 3D Carved Tread Tire
    tire_start = len(bm.faces)
    bmesh.ops.create_cone(bm, cap_ends=False, segments=112,
        radius1=wheel_r, radius2=wheel_r, depth=tire_w,
        matrix=Matrix.Translation(Vector((cx, cy, cz))) @ Matrix.Rotation(math.radians(90), 4, 'Y'))

    # Sidewalls (rounded torus curves)
    for sw_side in [-1.0, 1.0]:
        bmesh.ops.create_cone(bm, cap_ends=False, segments=112,
            radius1=wheel_r - 0.015, radius2=rim_r + 0.005, depth=0.035,
            matrix=Matrix.Translation(Vector((cx + sw_side * (tire_w * 0.48), cy, cz))) @
                   Matrix.Rotation(math.radians(90), 4, 'Y'))

    # 4. Cross-Drilled Carbon Ceramic Rotor (398mm front / 360mm rear)
    rotor_start = len(bm.faces)
    rotor_r = 0.192 if is_front else 0.178
    rotor_x = cx + side_dir * 0.02
    bmesh.ops.create_cone(bm, cap_ends=True, segments=80,
        radius1=rotor_r, radius2=rotor_r, depth=0.024,
        matrix=Matrix.Translation(Vector((rotor_x, cy, cz))) @ Matrix.Rotation(math.radians(90), 4, 'Y'))

    # Internal radial cooling ventilation vanes (36 holes)
    for v_i in range(36):
        v_angle = v_i * (2.0 * math.pi / 36.0)
        v_rot = Matrix.Rotation(v_angle, 4, 'X')
        bmesh.ops.create_cube(bm, size=1.0,
            matrix=Matrix.Translation(Vector((rotor_x, cy, cz))) @
                   v_rot @
                   Matrix.Translation(Vector((0, 0, rotor_r * 0.65))) @
                   Matrix.Scale(0.026, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.009, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.035, 4, Vector((0, 0, 1))))

    # 5. Giallo Modena Yellow 6-Piston Brembo Caliper
    caliper_start = len(bm.faces)
    bmesh.ops.create_cube(bm, size=1.0,
        matrix=Matrix.Translation(Vector((cx + side_dir * 0.035, cy + 0.04, cz + rotor_r * 0.82))) @
               Matrix.Scale(0.052, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.128, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.068, 4, Vector((0, 0, 1))))

    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)

    # Assign materials
    obj.data.materials.append(mats['diamond_cut_face'])       # 0
    obj.data.materials.append(mats['anthracite_pockets'])     # 1
    obj.data.materials.append(mats['ferrari_yellow_cap'])     # 2
    obj.data.materials.append(mats['tire_rubber'])            # 3
    obj.data.materials.append(mats['ccm_rotor'])              # 4
    obj.data.materials.append(mats['giallo_modena_caliper'])  # 5

    for idx, poly in enumerate(obj.data.polygons):
        if idx < spoke_start:
            poly.material_index = 0  # Rim lip
        elif idx < cap_start:
            poly.material_index = 0 if idx % 2 == 0 else 1  # Diamond-cut star face & carbon aero fillets
        elif idx < tire_start:
            poly.material_index = 2  # Yellow Ferrari cap
        elif idx < rotor_start:
            poly.material_index = 3  # Tire rubber
        elif idx < caliper_start:
            poly.material_index = 4  # CCM rotor
        else:
            poly.material_index = 5  # Giallo Modena caliper

    for p in obj.data.polygons:
        p.use_smooth = True

    # High-density modifier: Subsurf level 3 on each wheel corner
    sub = obj.modifiers.new(name="SubsurfWheel", type='SUBSURF')
    sub.render_levels = 3
    sub.levels = 3

    return obj


# ─── 10. Bake NLA Animation Actions for Gate 5 ───────────────────────────
def bake_ferrari_sf90_nla_actions(door_fl, door_fr, wing, wheel_fl, wheel_fr):
    """Bakes authentic interactive animation tracks."""
    # 1. Door FL Open
    door_fl.animation_data_clear()
    door_fl.rotation_euler = (0, 0, 0)
    door_fl.keyframe_insert(data_path="rotation_euler", frame=0)
    door_fl.rotation_euler = (0, 0, math.radians(45.0))
    door_fl.keyframe_insert(data_path="rotation_euler", frame=30)
    if door_fl.animation_data and door_fl.animation_data.action:
        door_fl.animation_data.action.name = "Action_Door_FL_Open"

    # 2. Door FR Open
    door_fr.animation_data_clear()
    door_fr.rotation_euler = (0, 0, 0)
    door_fr.keyframe_insert(data_path="rotation_euler", frame=0)
    door_fr.rotation_euler = (0, 0, math.radians(-45.0))
    door_fr.keyframe_insert(data_path="rotation_euler", frame=30)
    if door_fr.animation_data and door_fr.animation_data.action:
        door_fr.animation_data.action.name = "Action_Door_FR_Open"

    # 3. Active Shut-Off Gurney Wing Deploy (Central flap lowers into air stream)
    wing_rest = Vector((0.0, -1.82, 0.84))
    wing.animation_data_clear()
    wing.location = wing_rest
    wing.rotation_euler = (0, 0, 0)
    wing.keyframe_insert(data_path="location", frame=0)
    wing.keyframe_insert(data_path="rotation_euler", frame=0)
    wing.location = wing_rest + Vector((0, -0.02, -0.06))  # Lowers into high-downforce position
    wing.rotation_euler = (math.radians(-10.0), 0, 0)
    wing.keyframe_insert(data_path="location", frame=30)
    wing.keyframe_insert(data_path="rotation_euler", frame=30)
    wing.location = wing_rest
    wing.rotation_euler = (0, 0, 0)
    if wing.animation_data and wing.animation_data.action:
        wing.animation_data.action.name = "Action_Wing_Deploy"

    # 4. Steering Turn
    wheel_fl.animation_data_clear()
    wheel_fl.rotation_euler = (0, 0, 0)
    wheel_fl.keyframe_insert(data_path="rotation_euler", frame=0)
    wheel_fl.rotation_euler = (0, 0, math.radians(28.0))
    wheel_fl.keyframe_insert(data_path="rotation_euler", frame=30)
    if wheel_fl.animation_data and wheel_fl.animation_data.action:
        wheel_fl.animation_data.action.name = "Action_Steer_Left"

    # 5. Continuous Wheel Spin
    wheel_fr.animation_data_clear()
    wheel_fr.rotation_euler = (0, 0, 0)
    wheel_fr.keyframe_insert(data_path="rotation_euler", frame=0)
    wheel_fr.rotation_euler = (math.radians(-360.0), 0, 0)
    wheel_fr.keyframe_insert(data_path="rotation_euler", frame=60)
    if wheel_fr.animation_data and wheel_fr.animation_data.action:
        wheel_fr.animation_data.action.name = "Action_Wheel_Spin_FL"


# ─── 11. Master Assembly & Export Pipeline ───────────────────────────────
def run_ferrari_sf90_master_generation():
    print("=" * 68)
    print("EXECUTING MASTER CLASS-A UPGRADE: 2021 FERRARI SF90 STRADALE (SUPERCAR 2020S)")
    print("=" * 68)

    # 1. Safely clean existing objects
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for mesh in list(bpy.data.meshes):
        bpy.data.meshes.remove(mesh, do_unlink=True)
    for mat in list(bpy.data.materials):
        bpy.data.materials.remove(mat, do_unlink=True)

    # 2. Material Factory
    mats = setup_materials()

    # 3. Build Subsystems
    shell_obj = build_ferrari_sf90_chassis(mats)
    apron_obj = build_front_hammerhead_aero(mats)
    headlights_obj = build_ferrari_sf90_headlamps(mats)
    greenhouse_obj = build_ferrari_sf90_greenhouse(mats)
    door_objs = build_ferrari_sf90_doors_and_intakes(mats)
    exhaust_obj, wing_obj = build_ferrari_sf90_exhaust_and_active_wing(mats)
    taillights_obj = build_ferrari_sf90_taillamps(mats)
    underbody_obj = build_underbody_and_diffusers(mats)

    # 4. Wheel Hardpoints (Wheelbase 2.650m: Front Y=+1.325m, Rear Y=-1.325m)
    # Front Track 1.679m (+/-0.8395m), Rear Track 1.652m (+/-0.826m)
    wheel_defs = [
        ("WHEEL_FL", Vector((-0.8395,  1.325, 0.340)), True,  True),
        ("WHEEL_FR", Vector(( 0.8395,  1.325, 0.340)), True,  False),
        ("WHEEL_RL", Vector((-0.826,  -1.325, 0.345)), False, True),
        ("WHEEL_RR", Vector(( 0.826,  -1.325, 0.345)), False, False),
    ]
    wheel_objs = {}
    for wname, wloc, is_f, is_l in wheel_defs:
        w_obj = build_sf90_wheel_corner(wname, wloc, is_f, is_l, mats)
        wheel_objs[wname] = w_obj

    # 5. Semantic Hitboxes (Gate 4 Compliance)
    hitboxes_data = [
        ("HITBOX_Hood", Vector((0.0, 1.66, 0.52)), Vector((0.72, 0.65, 0.14))),
        ("HITBOX_Door_FL", Vector((-0.88, 0.15, 0.52)), Vector((0.14, 0.62, 0.28))),
        ("HITBOX_Door_FR", Vector((0.88, 0.15, 0.52)), Vector((0.14, 0.62, 0.28))),
        ("HITBOX_Cockpit", Vector((0.0, 0.15, 0.88)), Vector((0.68, 0.65, 0.28))),
        ("HITBOX_EngineGlass", Vector((0.0, -0.80, 0.88)), Vector((0.62, 0.65, 0.20))),
        ("HITBOX_RearWing", Vector((0.0, -1.82, 0.84)), Vector((0.82, 0.22, 0.12))),
        ("HITBOX_Wheel_FL", Vector((-0.8395, 1.325, 0.340)), Vector((0.20, 0.36, 0.36))),
        ("HITBOX_Wheel_FR", Vector((0.8395, 1.325, 0.340)), Vector((0.20, 0.36, 0.36))),
        ("HITBOX_Wheel_RL", Vector((-0.826, -1.325, 0.345)), Vector((0.22, 0.38, 0.38))),
        ("HITBOX_Wheel_RR", Vector((0.826, -1.325, 0.345)), Vector((0.22, 0.38, 0.38))),
    ]
    for hname, hloc, hsize in hitboxes_data:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=hloc)
        hobj = bpy.context.active_object
        hobj.name = hname
        hobj.scale = hsize
        hobj.data.materials.append(mats['hitbox'])
        hobj["interactive"] = True
        hobj["sound_fx"] = "mechanical_click"
        hobj["haptic"] = "light_impact"

    # 6. Master Camera Anchors
    cam_anchors = [
        ("CAMERA_Hero_Front34", Vector((-3.4, 3.8, 1.6))),
        ("CAMERA_Hero_Rear34", Vector((-3.4, -3.8, 1.6))),
        ("CAMERA_Side_Profile", Vector((-4.4, 0.0, 0.8))),
        ("CAMERA_Front_Fascia", Vector((0.0, 4.2, 0.65))),
    ]
    for cname, cloc in cam_anchors:
        cam_data = bpy.data.cameras.new(cname)
        cam_obj = bpy.data.objects.new(cname, cam_data)
        cam_obj.location = cloc
        bpy.context.collection.objects.link(cam_obj)

    # 7. Bake NLA Animation Actions (Gate 5 Compliance)
    bake_ferrari_sf90_nla_actions(
        door_fl=door_objs[0],
        door_fr=door_objs[1],
        wing=wing_obj,
        wheel_fl=wheel_objs["WHEEL_FL"],
        wheel_fr=wheel_objs["WHEEL_FR"]
    )

    # 8. Pre-export modifier baking protocol
    print("Executing pre-export modifier baking protocol...")
    for obj in list(bpy.data.objects):
        if obj.type != 'MESH':
            continue
        if not obj.modifiers:
            continue
        bpy.context.view_layer.objects.active = obj
        for mod in list(obj.modifiers):
            try:
                bpy.ops.object.modifier_apply(modifier=mod.name)
            except Exception as e:
                print(f"Notice applying {mod.name} on {obj.name}: {e}")

    # 9. Audit Final Polygon Density
    total_triangles = 0
    total_verts = 0
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            for poly in obj.data.polygons:
                total_triangles += max(0, poly.loop_total - 2)
            total_verts += len(obj.data.vertices)

    print(f"MASTER FERRARI SF90 STRADALE GENERATED:")
    print(f"  Total Triangles: {total_triangles:,}")
    print(f"  Total Vertices:  {total_verts:,}")

    # 10. Export Master GLB to Public Target
    export_path = r"e:\Car_Automation\public\models\vehicles\supercar\2020s\vehicle.glb"
    os.makedirs(os.path.dirname(export_path), exist_ok=True)

    bpy.ops.export_scene.gltf(
        filepath=export_path,
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
    file_size_mb = os.path.getsize(export_path) / (1024 * 1024)
    print(f"Exported upgraded Master Ferrari SF90 Stradale GLB: {export_path} ({file_size_mb:.2f} MB)")

    return {
        'triangles': total_triangles,
        'file_size_mb': file_size_mb
    }


# Unconditional execution inside Blender MCP
run_ferrari_sf90_master_generation()
