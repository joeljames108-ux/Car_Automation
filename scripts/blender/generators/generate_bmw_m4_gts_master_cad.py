"""
generate_bmw_m4_gts_master_cad.py
================================================================================
CLASS-A PRODUCTION MASTER CAD GENERATOR: 2016 BMW M4 GTS (F82) COUPE (v4)
================================================================================
Architectural Standards & Rigorous Directives Applied:
- The 15MB+ / 650,000+ Triangle Quality Law (Target: 1,200,000 - 1,800,000+ tris).
- Minimum Grade A Production Certification (>= 90%, target 100.0%).
- 7/7 Populated Subsystems: BODY, DOORS, GLASS, AERO, LIGHTING, POWERTRAIN, CHASSIS, WHEELS, INTERIOR.
- World Coordinate Space: +Y Forward, +Z Up, +X Driver Right (LHD).
- Preserved Kinematic Pivots: Physical hinge origins on articulating doors with export_apply=False.
- 10 Semantic Audio-Haptic Hitboxes (hide_render=True) with sound_fx & haptic metadata.
- 7+ Baked NLA Actions (Action_Door_L_Open, Action_Door_R_Open, Action_Steering_Turn, 4 wheel spins).
- 4 Standardized CAMERA_* Nodes (Hero, Cockpit, Wheel, Engine).
- Principled BSDF PBR Shaders: Frozen Dark Grey Metallic, Acid Orange, Carbon Twill, OLED 3D illumination.
- Dual-mode export: Primary GLB (>=15MB) and companion Meshopt compressed asset (.opt.glb).
"""

import bpy
import bmesh
from mathutils import Vector, Euler, Matrix, Quaternion
import math
import os
import shutil
import subprocess


# ─── 1. Scene Sanitation & Geometry Helpers ───────────────────────────────────
def clean_scene():
    """Purge all existing objects, meshes, materials, and collections."""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

    for b in [bpy.data.meshes, bpy.data.materials, bpy.data.textures,
              bpy.data.images, bpy.data.cameras, bpy.data.lights,
              bpy.data.actions, bpy.data.collections]:
        for item in list(b):
            b.remove(item, do_unlink=True)


def safe_face(bm, verts, mat_idx=0):
    """Safely create face if valid and non-duplicate."""
    if len(verts) < 3 or len(set(verts)) < 3:
        return None
    try:
        f = bm.faces.new(verts)
        f.material_index = mat_idx
        return f
    except ValueError:
        return None


def add_box(bm, size=(1.0, 1.0, 1.0), matrix=None, mat_idx=0):
    """Robust procedural box generator without bmesh ops quirks."""
    if matrix is None:
        matrix = Matrix.Identity(4)
    hx = size[0] * 0.5
    hy = size[1] * 0.5
    hz = size[2] * 0.5
    corners = [
        Vector((-hx, -hy, -hz)), Vector((hx, -hy, -hz)),
        Vector((hx,  hy, -hz)), Vector((-hx, hy, -hz)),
        Vector((-hx, -hy,  hz)), Vector((hx, -hy,  hz)),
        Vector((hx,  hy,  hz)), Vector((-hx, hy,  hz)),
    ]
    verts = [bm.verts.new(matrix @ c) for c in corners]
    faces = [
        (0, 1, 2, 3), # bottom (-Z)
        (4, 7, 6, 5), # top (+Z)
        (0, 4, 5, 1), # front (-Y)
        (2, 6, 7, 3), # rear (+Y)
        (0, 3, 7, 4), # left (-X)
        (1, 5, 6, 2), # right (+X)
    ]
    created = []
    for f_idx in faces:
        f = safe_face(bm, (verts[f_idx[0]], verts[f_idx[1]], verts[f_idx[2]], verts[f_idx[3]]), mat_idx=mat_idx)
        if f:
            created.append(f)
    return verts


def add_cylinder(bm, radius1=0.1, radius2=0.1, depth=0.2, segments=24, matrix=None, cap_ends=True, mat_idx=0):
    """Robust procedural cylinder/cone generator with quad side faces."""
    if matrix is None:
        matrix = Matrix.Identity(4)
    half_d = depth * 0.5
    top_ring = []
    bot_ring = []
    for i in range(segments):
        ang = i * (2.0 * math.pi / segments)
        cos_a = math.cos(ang)
        sin_a = math.sin(ang)
        vt = bm.verts.new(matrix @ Vector((cos_a * radius1, sin_a * radius1, half_d)))
        vb = bm.verts.new(matrix @ Vector((cos_a * radius2, sin_a * radius2, -half_d)))
        top_ring.append(vt)
        bot_ring.append(vb)

    for i in range(segments):
        nxt = (i + 1) % segments
        safe_face(bm, (bot_ring[i], bot_ring[nxt], top_ring[nxt], top_ring[i]), mat_idx=mat_idx)

    if cap_ends:
        safe_face(bm, top_ring, mat_idx=mat_idx)
        safe_face(bm, bot_ring[::-1], mat_idx=mat_idx)

    return top_ring, bot_ring


def add_sphere(bm, radius=0.1, segments_u=16, segments_v=8, matrix=None, mat_idx=0):
    """Robust UV sphere generator."""
    if matrix is None:
        matrix = Matrix.Identity(4)
    rings = []
    for v in range(segments_v + 1):
        phi = -math.pi * 0.5 + math.pi * (v / segments_v)
        z = radius * math.sin(phi)
        r = radius * math.cos(phi)
        ring = []
        for u in range(segments_u):
            theta = 2.0 * math.pi * (u / segments_u)
            x = r * math.cos(theta)
            y = r * math.sin(theta)
            ring.append(bm.verts.new(matrix @ Vector((x, y, z))))
        rings.append(ring)

    for v in range(segments_v):
        for u in range(segments_u):
            nxt_u = (u + 1) % segments_u
            v0 = rings[v][u]
            v1 = rings[v][nxt_u]
            v2 = rings[v + 1][nxt_u]
            v3 = rings[v + 1][u]
            safe_face(bm, (v0, v1, v2, v3), mat_idx=mat_idx)


def add_rod(bm, p1, p2, radius=0.020, segments=16, mat_idx=0):
    """Construct a solid capped cylinder connecting point p1 exactly to point p2."""
    v1 = Vector(p1)
    v2 = Vector(p2)
    vec = v2 - v1
    length = vec.length
    if length < 1e-4:
        return
    center = (v1 + v2) * 0.5
    rot_quat = vec.to_track_quat('Z', 'Y')
    mat = Matrix.Translation(center) @ rot_quat.to_matrix().to_4x4()
    add_cylinder(bm, radius1=radius, radius2=radius, depth=length, segments=segments, matrix=mat, cap_ends=True, mat_idx=mat_idx)


def create_mesh_object(name, bm, parent_col, mat=None, parent_obj=None, smooth=True, bevel_w=0.002, subsurf_lvl=1):
    """Convert bmesh to Blender mesh object, apply materials and modifiers."""
    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new(name, mesh)

    if mat:
        if isinstance(mat, list):
            for m in mat:
                obj.data.materials.append(m)
        else:
            obj.data.materials.append(mat)

    parent_col.objects.link(obj)

    if parent_obj:
        obj.parent = parent_obj

    if smooth:
        for poly in obj.data.polygons:
            poly.use_smooth = True

    if bevel_w > 0:
        bev = obj.modifiers.new(name="Bevel", type='BEVEL')
        bev.width = bevel_w
        bev.segments = 2
        bev.limit_method = 'ANGLE'
        bev.angle_limit = math.radians(35.0)

    if subsurf_lvl > 0:
        sub = obj.modifiers.new(name="Subsurf", type='SUBSURF')
        sub.levels = subsurf_lvl
        sub.render_levels = subsurf_lvl

    wn = obj.modifiers.new(name="WeightedNormal", type='WEIGHTED_NORMAL')
    wn.keep_sharp = True

    return obj


# ─── 2. Materials Factory ────────────────────────────────────────────────────
def build_materials():
    mats = {}

    def make_pbr(name, base_col, rough=0.2, metal=0.0, trans=0.0, ior=1.5, emission=None, emit_str=1.0, clearcoat=0.0, alpha=1.0):
        mat = bpy.data.materials.new(name)
        mat.use_nodes = True
        nodes = mat.node_tree.nodes
        links = mat.node_tree.links
        nodes.clear()

        node_out = nodes.new(type='ShaderNodeOutputMaterial')
        node_bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
        links.new(node_bsdf.outputs['BSDF'], node_out.inputs['Surface'])

        node_bsdf.inputs['Base Color'].default_value = base_col
        node_bsdf.inputs['Roughness'].default_value = rough
        node_bsdf.inputs['Metallic'].default_value = metal

        if 'Transmission Weight' in node_bsdf.inputs:
            node_bsdf.inputs['Transmission Weight'].default_value = trans
        elif 'Transmission' in node_bsdf.inputs:
            node_bsdf.inputs['Transmission'].default_value = trans

        if 'Coat Weight' in node_bsdf.inputs:
            node_bsdf.inputs['Coat Weight'].default_value = clearcoat
        elif 'Clearcoat' in node_bsdf.inputs:
            node_bsdf.inputs['Clearcoat'].default_value = clearcoat

        if 'IOR' in node_bsdf.inputs:
            node_bsdf.inputs['IOR'].default_value = ior

        if alpha < 1.0:
            if 'Alpha' in node_bsdf.inputs:
                node_bsdf.inputs['Alpha'].default_value = alpha
            mat.blend_method = 'BLEND'

        if emission:
            if 'Emission Color' in node_bsdf.inputs:
                node_bsdf.inputs['Emission Color'].default_value = emission
                if 'Emission Strength' in node_bsdf.inputs:
                    node_bsdf.inputs['Emission Strength'].default_value = emit_str
            elif 'Emission' in node_bsdf.inputs:
                node_bsdf.inputs['Emission'].default_value = emission

        return mat

    # 1. Signature Frozen Dark Grey Metallic (BMW Individual Matte Finish)
    mats['paint_frozen_grey'] = make_pbr('M_BodyPaint_FrozenDarkGrey', (0.24, 0.25, 0.27, 1.0), rough=0.45, metal=0.88, clearcoat=0.25)
    # 2. Iconic Acid Orange (Front Splitter Lip, 666M Wheels, Roll Cage)
    mats['acid_orange'] = make_pbr('M_Accent_AcidOrange', (0.98, 0.35, 0.02, 1.0), rough=0.22, metal=0.25, clearcoat=0.90)
    # 3. Twill Weave Carbon Fiber Composite (CFRP Roof, Hood Extractor, Rear Wing, Diffuser)
    mats['carbon_twill'] = make_pbr('M_Carbon_Twill', (0.04, 0.04, 0.045, 1.0), rough=0.30, metal=0.18, clearcoat=0.75)
    # 4. Gloss Shadowline Black (M Double-Slat Kidney Grilles, Window Trim, B-Pillars, Mirror Mounts)
    mats['gloss_black'] = make_pbr('M_Gloss_Black', (0.015, 0.015, 0.018, 1.0), rough=0.08, metal=0.20, clearcoat=1.0)
    # 5. Satin Black Polyurethane & Aero Undertray
    mats['trim_black'] = make_pbr('M_Trim_SatinBlack', (0.035, 0.035, 0.04, 1.0), rough=0.55, metal=0.08)
    # 6. Optical Windshield, Side & Rear Glass
    mats['glass_clear'] = make_pbr('M_Glass_Optical', (0.92, 0.95, 0.98, 0.20), rough=0.015, metal=0.0, trans=0.96, ior=1.52, clearcoat=1.0, alpha=0.30)
    # 7. Smoked Polycarbonate Headlight & Taillight Outer Lenses
    mats['glass_smoked'] = make_pbr('M_Glass_Smoked', (0.30, 0.31, 0.33, 0.30), rough=0.04, metal=0.05, trans=0.88, ior=1.52, clearcoat=1.0, alpha=0.42)
    # 8. Black Ceramic Frit Border
    mats['frit_black'] = make_pbr('M_CeramicFrit_Black', (0.012, 0.012, 0.014, 1.0), rough=0.82, metal=0.0)
    # 9. Polished Chrome M4 GTS Badges & Kidney Surround Trim
    mats['chrome'] = make_pbr('M_Chrome_Polished', (0.96, 0.96, 0.98, 1.0), rough=0.03, metal=0.98)
    # 10. Front Headlight Hexagonal "Iconic Lights" LED Halo Rings (White Emission)
    mats['drl_white'] = make_pbr('M_Light_DRL_White', (0.98, 0.98, 1.0, 1.0), rough=0.06, emission=(1.0, 1.0, 1.0, 1.0), emit_str=28.0)
    # 11. BMW Laserlight Blue Optical Accent
    mats['laser_blue'] = make_pbr('M_Light_Laser_Blue', (0.10, 0.45, 1.0, 1.0), rough=0.10, emission=(0.10, 0.45, 1.0, 1.0), emit_str=16.0)
    # 12. Revolutionary 3D OLED Wafer Taillight Blades (Ruby Emission)
    mats['oled_ruby'] = make_pbr('M_Light_OLED_Ruby', (0.98, 0.02, 0.03, 1.0), rough=0.05, emission=(0.98, 0.02, 0.03, 1.0), emit_str=34.0)
    # 13. Reverse Light White LED
    mats['white_reverse'] = make_pbr('M_Light_Reverse', (0.96, 0.96, 1.0, 1.0), rough=0.06, emission=(0.96, 0.96, 1.0, 1.0), emit_str=25.0)
    # 14. Amber Turn Indicator LED
    mats['amber_light'] = make_pbr('M_Light_Amber', (1.0, 0.52, 0.02, 1.0), rough=0.06, emission=(1.0, 0.52, 0.02, 1.0), emit_str=24.0)
    # 15. Style 666M Forged Alloy Wheel Face (Acid Orange Polished Milled Highlight)
    mats['alloy_666m_orange'] = make_pbr('M_Alloy_666M_Orange', (0.96, 0.36, 0.03, 1.0), rough=0.16, metal=0.92, clearcoat=0.90)
    # 16. Style 666M Forged Alloy Inner Spoke Recesses (Dark Ferric Grey)
    mats['alloy_666m_grey'] = make_pbr('M_Alloy_666M_Grey', (0.24, 0.25, 0.27, 1.0), rough=0.20, metal=0.90, clearcoat=0.80)
    # 17. High-Performance Michelin Pilot Sport Cup 2 Semi-Slick Tire Rubber
    mats['rubber_tire'] = make_pbr('M_Rubber_Tire', (0.035, 0.035, 0.038, 1.0), rough=0.82, metal=0.02)
    # 18. Carbon Ceramic Brake (CCB) Rotor Disc
    mats['rotor_ccb'] = make_pbr('M_Brake_Rotor_CCB', (0.42, 0.44, 0.46, 1.0), rough=0.35, metal=0.65)
    # 19. BMW M Carbon Ceramic Brake Caliper Gold Metallic
    mats['caliper_gold'] = make_pbr('M_Caliper_MGold', (0.85, 0.68, 0.20, 1.0), rough=0.18, metal=0.88, clearcoat=1.0)
    # 20. Interior Anthracite Alcantara
    mats['interior_alcantara'] = make_pbr('M_Interior_Alcantara', (0.06, 0.06, 0.065, 1.0), rough=0.92, metal=0.02)
    # 21. Interior Merino Black Leather
    mats['interior_leather'] = make_pbr('M_Interior_Leather', (0.04, 0.04, 0.045, 1.0), rough=0.62, metal=0.04)
    # 22. Acid Orange Painted Steel Half Roll Cage
    mats['roll_cage_orange'] = make_pbr('M_RollCage_AcidOrange', (0.98, 0.35, 0.02, 1.0), rough=0.18, metal=0.50, clearcoat=0.95)
    # 23. Polished Quad Titanium Exhaust Cannons
    mats['titanium_exhaust'] = make_pbr('M_Titanium_Exhaust', (0.70, 0.72, 0.76, 1.0), rough=0.14, metal=0.96)
    # 24. S55 Carbon Engine Cover & Plenums
    mats['engine_carbon'] = make_pbr('M_Engine_S55_Carbon', (0.05, 0.05, 0.055, 1.0), rough=0.28, metal=0.25, clearcoat=0.60)
    # 25. Curved OLED Digital Instrument Display
    mats['display_oled'] = make_pbr('M_Display_OLED', (0.05, 0.05, 0.05, 1.0), rough=0.20, emission=(0.95, 0.40, 0.05, 1.0), emit_str=16.0)

    return mats


# ─── 3. Unibody & Structural Shell ───────────────────────────────────────────
def build_unibody(parent_col, mats):
    """
    Class-A Procedural CAD Lofting of BMW M4 GTS (F82) Unibody:
    - Length 4.698m (Y: +2.349m to -2.349m), Width 1.870m (X: +/-0.935m), Height 1.383m.
    - Wheelbase 2.812m (Front Axle Y = +1.406m, Rear Axle Y = -1.406m).
    - Muscular front M bumper with central intake and flared outer cooling air curtains.
    - Power-dome hood with functional carbon heat extraction louver recess.
    - Open door cabin apertures with structural rocker sills (Y: +0.720m to -0.680m).
    - Flared front & rear M fenders accommodating wide track.
    - Double-bubble CFRP contoured roof with A-pillars and Hofmeister C-pillar kink.
    - Sculpted rear fascia with license plate recess and carbon diffuser integration.
    """
    bm = bmesh.new()

    # 1. Front Nose, Hood & Fenders (Y = +2.349m to +0.720m)
    # Stations: Y, z_floor, z_sill, z_belt, z_hood, x_sill, x_belt
    front_stations = [
        {"y": 2.349, "zf": 0.125, "zs": 0.280, "zb": 0.580, "zr": 0.650, "xs": 0.640, "xb": 0.740}, # Nose Tip / Kidney Base
        {"y": 2.200, "zf": 0.125, "zs": 0.300, "zb": 0.630, "zr": 0.685, "xs": 0.720, "xb": 0.820}, # Headlamp Leading Edge
        {"y": 1.950, "zf": 0.130, "zs": 0.320, "zb": 0.670, "zr": 0.720, "xs": 0.780, "xb": 0.880}, # Headlamp Trailing / Fender Apex
        {"y": 1.650, "zf": 0.135, "zs": 0.330, "zb": 0.700, "zr": 0.745, "xs": 0.820, "xb": 0.925}, # Front Wheelarch Crest
        {"y": 1.406, "zf": 0.135, "zs": 0.335, "zb": 0.710, "zr": 0.760, "xs": 0.835, "xb": 0.935}, # Front Axle Centerline
        {"y": 1.150, "zf": 0.135, "zs": 0.320, "zb": 0.715, "zr": 0.770, "xs": 0.825, "xb": 0.925}, # Front Wheelarch Rear
        {"y": 0.900, "zf": 0.135, "zs": 0.270, "zb": 0.720, "zr": 0.780, "xs": 0.810, "xb": 0.905}, # Fender Gills / Side Badges
        {"y": 0.720, "zf": 0.135, "zs": 0.220, "zb": 0.725, "zr": 0.800, "xs": 0.800, "xb": 0.890}, # A-Pillar Base / Front Cowl
    ]

    rings_front = []
    for st in front_stations:
        y = st["y"]
        zf = st["zf"]
        zs = st["zs"]
        zb = st["zb"]
        zr = st["zr"]
        xs = st["xs"]
        xb = st["xb"]

        pts = [
            Vector((-xb, y, zb)),           # 0: Left Beltline / Fender Crown
            Vector((-xs, y, zs)),           # 1: Left Rocker Sill
            Vector((-xs * 0.7, y, zf)),     # 2: Left Underbody Edge
            Vector((-xs * 0.3, y, zf)),     # 3: Left Underbody Mid
            Vector((0.0, y, zf)),           # 4: Center Underbody Floor
            Vector((xs * 0.3, y, zf)),      # 5: Right Underbody Mid
            Vector((xs * 0.7, y, zf)),      # 6: Right Underbody Edge
            Vector((xs, y, zs)),            # 7: Right Rocker Sill
            Vector((xb, y, zb)),            # 8: Right Beltline / Fender Crown
            Vector((xb * 0.65, y, zr)),     # 9: Right Hood Ridge
            Vector((xb * 0.28, y, zr + 0.025)), # 10: Right Power Dome Crest
            Vector((0.0, y, zr + 0.030)),       # 11: Center Hood Power Dome Apex
            Vector((-xb * 0.28, y, zr + 0.025)),# 12: Left Power Dome Crest
            Vector((-xb * 0.65, y, zr)),    # 13: Left Hood Ridge
        ]
        ring = [bm.verts.new(p) for p in pts]
        rings_front.append(ring)

    for i in range(len(front_stations) - 1):
        r1 = rings_front[i]
        r2 = rings_front[i + 1]
        n_pts = len(r1)
        for j in range(n_pts):
            nxt = (j + 1) % n_pts
            safe_face(bm, (r1[j], r2[j], r2[nxt], r1[nxt]), mat_idx=0)

    # Front Bumper Sculpted Fascia Cap (Y = 2.349m)
    r_front = rings_front[0]
    safe_face(bm, (r_front[0], r_front[13], r_front[12], r_front[11], r_front[10], r_front[9], r_front[8]), mat_idx=0)
    safe_face(bm, (r_front[0], r_front[8], r_front[7], r_front[1]), mat_idx=0)
    safe_face(bm, (r_front[1], r_front[7], r_front[6], r_front[5], r_front[4], r_front[3], r_front[2]), mat_idx=0)

    # 2. Cabin Structure: Structural Rocker Sills & Roof Cantrails (Y = +0.720m to -0.680m)
    cabin_stations = [
        {"y": 0.720, "yc": 0.720, "zr": 0.800, "zroof": 1.340, "xroof": 0.580}, # A-Pillar Base
        {"y": 0.400, "yc": 0.400, "zr": 0.805, "zroof": 1.378, "xroof": 0.595}, # Front Door Opening
        {"y": 0.000, "yc": 0.000, "zr": 0.800, "zroof": 1.383, "xroof": 0.605}, # B-Pillar Meridian
        {"y": -0.380, "yc": -0.380, "zr": 0.790, "zroof": 1.365, "xroof": 0.595}, # Rear Door Opening
        {"y": -0.680, "yc": -0.680, "zr": 0.780, "zroof": 1.320, "xroof": 0.575}, # C-Pillar Base / Hofmeister
    ]

    rings_cabin_left_sill = []
    rings_cabin_right_sill = []
    rings_roof = []

    for st in cabin_stations:
        y = st["y"]
        zr_c = st["zroof"]
        xr_c = st["xroof"]

        v_l_floor = bm.verts.new(Vector((-0.780, y, 0.135)))
        v_l_sill_b = bm.verts.new(Vector((-0.800, y, 0.220)))
        v_l_sill_t = bm.verts.new(Vector((-0.780, y, 0.320)))
        rings_cabin_left_sill.append((v_l_floor, v_l_sill_b, v_l_sill_t))

        v_r_floor = bm.verts.new(Vector((0.780, y, 0.135)))
        v_r_sill_b = bm.verts.new(Vector((0.800, y, 0.220)))
        v_r_sill_t = bm.verts.new(Vector((0.780, y, 0.320)))
        rings_cabin_right_sill.append((v_r_floor, v_r_sill_b, v_r_sill_t))

        # CFRP Double-Bubble Roof Profile (mat_idx 2 = carbon_twill)
        v_rf_l_rail = bm.verts.new(Vector((-xr_c, y, zr_c)))
        v_rf_l_bubble = bm.verts.new(Vector((-xr_c * 0.50, y, zr_c + 0.022)))
        v_rf_center = bm.verts.new(Vector((0.0, y, zr_c + 0.005))) # Central Aero Channel
        v_rf_r_bubble = bm.verts.new(Vector((xr_c * 0.50, y, zr_c + 0.022)))
        v_rf_r_rail = bm.verts.new(Vector((xr_c, y, zr_c)))
        rings_roof.append((v_rf_l_rail, v_rf_l_bubble, v_rf_center, v_rf_r_bubble, v_rf_r_rail))

    for i in range(len(cabin_stations) - 1):
        # Left Sill
        s1 = rings_cabin_left_sill[i]
        s2 = rings_cabin_left_sill[i + 1]
        safe_face(bm, (s1[0], s2[0], s2[1], s1[1]), mat_idx=0)
        safe_face(bm, (s1[1], s2[1], s2[2], s1[2]), mat_idx=0)

        # Right Sill
        s1 = rings_cabin_right_sill[i]
        s2 = rings_cabin_right_sill[i + 1]
        safe_face(bm, (s1[0], s1[1], s2[1], s2[0]), mat_idx=0)
        safe_face(bm, (s1[1], s1[2], s2[2], s2[1]), mat_idx=0)

        # Carbon Roof Panels (mat_idx 2)
        rf1 = rings_roof[i]
        rf2 = rings_roof[i + 1]
        safe_face(bm, (rf1[0], rf2[0], rf2[1], rf1[1]), mat_idx=2)
        safe_face(bm, (rf1[1], rf2[1], rf2[2], rf1[2]), mat_idx=2)
        safe_face(bm, (rf1[2], rf2[2], rf2[3], rf1[3]), mat_idx=2)
        safe_face(bm, (rf1[3], rf2[3], rf2[4], rf1[4]), mat_idx=2)

    # 3. Rear Muscular Haunches & Decklid (Y = -0.680m to -2.349m)
    rear_stations = [
        {"y": -0.680, "zf": 0.135, "zs": 0.220, "zb": 0.780, "zr": 0.815, "xs": 0.810, "xb": 0.900}, # C-Pillar Root
        {"y": -0.950, "zf": 0.135, "zs": 0.260, "zb": 0.775, "zr": 0.825, "xs": 0.825, "xb": 0.925}, # Rear Haunch Start
        {"y": -1.180, "zf": 0.135, "zs": 0.320, "zb": 0.770, "zr": 0.835, "xs": 0.835, "xb": 0.938}, # Rear Wheelarch Crest
        {"y": -1.406, "zf": 0.135, "zs": 0.335, "zb": 0.765, "zr": 0.840, "xs": 0.840, "xb": 0.940}, # Rear Axle Centerline
        {"y": -1.650, "zf": 0.135, "zs": 0.325, "zb": 0.755, "zr": 0.842, "xs": 0.830, "xb": 0.930}, # Rear Wheelarch Rear
        {"y": -1.950, "zf": 0.130, "zs": 0.310, "zb": 0.745, "zr": 0.845, "xs": 0.800, "xb": 0.905}, # Taillamp Leading Edge
        {"y": -2.200, "zf": 0.125, "zs": 0.290, "zb": 0.730, "zr": 0.848, "xs": 0.740, "xb": 0.850}, # Rear Fascia Curve
        {"y": -2.349, "zf": 0.125, "zs": 0.280, "zb": 0.710, "zr": 0.850, "xs": 0.650, "xb": 0.760}, # Rear Bumper Trailing Edge
    ]

    rings_rear = []
    for st in rear_stations:
        y = st["y"]
        zf = st["zf"]
        zs = st["zs"]
        zb = st["zb"]
        zr = st["zr"]
        xs = st["xs"]
        xb = st["xb"]

        pts = [
            Vector((-xb, y, zb)),           # 0: Left Beltline / Muscular Haunch
            Vector((-xs, y, zs)),           # 1: Left Rocker Sill
            Vector((-xs * 0.7, y, zf)),     # 2: Left Underbody Edge
            Vector((-xs * 0.3, y, zf)),     # 3: Left Underbody Mid
            Vector((0.0, y, zf)),           # 4: Center Underbody Floor
            Vector((xs * 0.3, y, zf)),      # 5: Right Underbody Mid
            Vector((xs * 0.7, y, zf)),      # 6: Right Underbody Edge
            Vector((xs, y, zs)),            # 7: Right Rocker Sill
            Vector((xb, y, zb)),            # 8: Right Beltline / Muscular Haunch
            Vector((xb * 0.68, y, zr)),     # 9: Right Decklid Crown
            Vector((xb * 0.30, y, zr + 0.015)), # 10: Right Decklid Lip
            Vector((0.0, y, zr + 0.020)),       # 11: Center Decklid Lip
            Vector((-xb * 0.30, y, zr + 0.015)),# 12: Left Decklid Lip
            Vector((-xb * 0.68, y, zr)),    # 13: Left Decklid Crown
        ]
        ring = [bm.verts.new(p) for p in pts]
        rings_rear.append(ring)

    for i in range(len(rear_stations) - 1):
        r1 = rings_rear[i]
        r2 = rings_rear[i + 1]
        n_pts = len(r1)
        for j in range(n_pts):
            nxt = (j + 1) % n_pts
            safe_face(bm, (r1[j], r2[j], r2[nxt], r1[nxt]), mat_idx=0)

    # Rear Bumper Fascia Cap (Y = -2.349m)
    r_rear = rings_rear[-1]
    safe_face(bm, (r_rear[0], r_rear[8], r_rear[9], r_rear[10], r_rear[11], r_rear[12], r_rear[13]), mat_idx=0)
    safe_face(bm, (r_rear[0], r_rear[1], r_rear[7], r_rear[8]), mat_idx=0)
    safe_face(bm, (r_rear[1], r_rear[2], r_rear[3], r_rear[4], r_rear[5], r_rear[6], r_rear[7]), mat_idx=0)

    rf_back = rings_roof[-1]
    r_rear_start = rings_rear[0]
    safe_face(bm, (rf_back[0], r_rear_start[0], r_rear_start[13], rf_back[1]), mat_idx=0)
    safe_face(bm, (rf_back[3], r_rear_start[9], r_rear_start[8], rf_back[4]), mat_idx=0)
    safe_face(bm, (rf_back[1], r_rear_start[13], r_rear_start[12], rf_back[2]), mat_idx=0)
    safe_face(bm, (rf_back[2], r_rear_start[12], r_rear_start[11], rf_back[2]), mat_idx=0)
    safe_face(bm, (rf_back[2], r_rear_start[10], r_rear_start[9], rf_back[3]), mat_idx=0)

    # 4. Authentic BMW M Double-Kidney Grilles (Recessed Angled Bezels & Double Slats)
    for sign in [-1.0, 1.0]:
        x_k = sign * 0.165
        y_k = 2.345
        z_k = 0.585
        # Kidney Grille Outer Surround Frame (mat_idx 3 = gloss_black)
        add_box(bm, size=(0.19, 0.025, 0.135),
                matrix=Matrix.Translation((x_k, y_k, z_k)) @ Matrix.Rotation(math.radians(-sign * 6.0), 3, 'Z').to_4x4(),
                mat_idx=3)
        # Recessed Inner Radiator Core Cavity
        add_box(bm, size=(0.17, 0.020, 0.115),
                matrix=Matrix.Translation((x_k, y_k - 0.015, z_k)) @ Matrix.Rotation(math.radians(-sign * 6.0), 3, 'Z').to_4x4(),
                mat_idx=3)
        # 6 Vertical Double-Slats per Kidney
        for s in range(6):
            dx_s = (s - 2.5) * 0.024
            add_box(bm, size=(0.005, 0.022, 0.105),
                    matrix=Matrix.Translation((x_k + dx_s, y_k, z_k)) @ Matrix.Rotation(math.radians(-sign * 6.0), 3, 'Z').to_4x4(),
                    mat_idx=3)

    # 5. Front Bumper Central Air Intake & Flanked Brake Cooling Ducts
    # Central Lower Air Intake (Honeycomb Mesh Backing)
    add_box(bm, size=(0.82, 0.045, 0.19), matrix=Matrix.Translation((0.0, 2.330, 0.320)), mat_idx=3)
    # Side Air Curtain Scoops (Left & Right)
    for sign in [-1.0, 1.0]:
        x_scoop = sign * 0.580
        add_box(bm, size=(0.22, 0.045, 0.16),
                matrix=Matrix.Translation((x_scoop, 2.310, 0.320)) @ Matrix.Rotation(math.radians(-sign * 14.0), 3, 'Z').to_4x4(),
                mat_idx=3)
        # Vertical Aero Deflector Fin
        add_box(bm, size=(0.015, 0.065, 0.14),
                matrix=Matrix.Translation((x_scoop + sign * 0.09, 2.330, 0.320)),
                mat_idx=2)

    # 6. Hood Heat Extractor Louver (CFRP Vent on Power Dome)
    add_box(bm, size=(0.58, 0.42, 0.025), matrix=Matrix.Translation((0.0, 1.50, 0.775)), mat_idx=2)
    for v in range(5):
        y_v = 1.34 + v * 0.075
        add_box(bm, size=(0.52, 0.015, 0.018),
                matrix=Matrix.Translation((0.0, y_v, 0.785)) @ Matrix.Rotation(math.radians(-25.0), 3, 'X').to_4x4(),
                mat_idx=3)

    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.001)
    bmesh.ops.subdivide_edges(bm, edges=bm.edges, cuts=1, use_grid_fill=True)

    obj = create_mesh_object("BODY_Unibody", bm, parent_col,
                             mat=[mats['paint_frozen_grey'], mats['acid_orange'], mats['carbon_twill'], mats['gloss_black']],
                             smooth=True, bevel_w=0.0025, subsurf_lvl=2)
    obj["subsystem"] = "BODY"
    return obj


# ─── 4. Front Splitter with Adjustable Acid Orange Lip ────────────────────────
def build_front_splitter(parent_col, mats):
    """
    BMW M4 GTS Signature Front Splitter:
    - Main full-width carbon fiber undertray base.
    - Protruding manually-adjustable front aerodynamic blade finished in Acid Orange!
    - Two CNC machined aluminum tie-rod retention struts linking to front lower bumper.
    """
    bm = bmesh.new()

    # 1. Main CFRP Splitter Tray (mat_idx 0 = carbon_twill)
    add_box(bm, size=(1.68, 0.35, 0.025), matrix=Matrix.Translation((0.0, 2.24, 0.135)), mat_idx=0)

    # 2. Acid Orange Adjustable Front Extension Blade (mat_idx 1 = acid_orange)
    add_box(bm, size=(1.62, 0.16, 0.020), matrix=Matrix.Translation((0.0, 2.41, 0.130)), mat_idx=1)

    # Left & Right Aerodynamic Winglet Strakes (Acid Orange)
    for sign in [-1.0, 1.0]:
        x_w = sign * 0.81
        add_box(bm, size=(0.025, 0.22, 0.090), matrix=Matrix.Translation((x_w, 2.38, 0.170)), mat_idx=1)

    # 3. CNC Aluminum Support Tie-Rods using exact add_rod
    for sign in [-1.0, 1.0]:
        x_tr = sign * 0.320
        add_rod(bm, (x_tr, 2.42, 0.145), (x_tr, 2.34, 0.320), radius=0.006, segments=12, mat_idx=2)

    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.001)
    bmesh.ops.subdivide_edges(bm, edges=bm.edges, cuts=1, use_grid_fill=True)

    obj = create_mesh_object("AERO_Front_Splitter", bm, parent_col,
                             mat=[mats['carbon_twill'], mats['acid_orange'], mats['chrome']],
                             smooth=True, bevel_w=0.002, subsurf_lvl=2)
    obj["subsystem"] = "AERO"
    return obj


# ─── 5. Rear Carbon Diffuser & Titanium Quad Exhaust ──────────────────────────
def build_rear_diffuser_exhaust(parent_col, mats):
    """
    BMW M4 GTS Carbon Fiber Rear Diffuser & Titanium Quad Exhaust:
    - 4 vertical aerodynamic diffuser tunnel fins.
    - Signature M quad 80mm exhaust tailpipes in dual center-staggered layout.
    """
    bm = bmesh.new()

    # 1. Carbon Fiber Diffuser Undersleeve (mat_idx 0 = carbon_twill)
    add_box(bm, size=(1.45, 0.45, 0.035), matrix=Matrix.Translation((0.0, -2.25, 0.205)), mat_idx=0)

    # 4 Vertical Diffuser Strakes
    for x_s in [-0.48, -0.20, 0.20, 0.48]:
        add_box(bm, size=(0.015, 0.38, 0.085), matrix=Matrix.Translation((x_s, -2.25, 0.175)), mat_idx=0)

    # 2. Quad Titanium Exhaust Cannons (mat_idx 1 = titanium_exhaust)
    tailpipe_x = [-0.24, -0.14, 0.14, 0.24]
    for x_p in tailpipe_x:
        add_cylinder(bm, radius1=0.044, radius2=0.044, depth=0.18, segments=28,
                     matrix=Matrix.Translation((x_p, -2.36, 0.255)) @ Matrix.Rotation(math.radians(90.0), 3, 'X').to_4x4(),
                     cap_ends=False, mat_idx=1)
        add_cylinder(bm, radius1=0.036, radius2=0.036, depth=0.16, segments=24,
                     matrix=Matrix.Translation((x_p, -2.35, 0.255)) @ Matrix.Rotation(math.radians(90.0), 3, 'X').to_4x4(),
                     cap_ends=False, mat_idx=2)

    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.001)
    bmesh.ops.subdivide_edges(bm, edges=bm.edges, cuts=1, use_grid_fill=True)

    obj = create_mesh_object("AERO_Rear_Diffuser", bm, parent_col,
                             mat=[mats['carbon_twill'], mats['titanium_exhaust'], mats['trim_black']],
                             smooth=True, bevel_w=0.002, subsurf_lvl=2)
    obj["subsystem"] = "AERO"
    return obj


# ─── 6. High-Downforce Adjustable Carbon Rear Wing ────────────────────────────
def build_rear_wing(parent_col, mats):
    """
    BMW M4 GTS Adjustable Carbon Fiber Rear Wing:
    - Aerodynamic aerofoil blade spanning 1.42m with gurney flap.
    - Dual CNC machined lightweight aluminum pylons with 3-position angle adjustment holes.
    - Carbon fiber endplates with M tricolor accents.
    """
    bm = bmesh.new()

    z_wing = 1.080
    y_wing = -2.180

    # 1. Main Aerofoil Wing Blade (mat_idx 0 = carbon_twill)
    add_box(bm, size=(1.42, 0.24, 0.024),
            matrix=Matrix.Translation((0.0, y_wing, z_wing)) @ Matrix.Rotation(math.radians(6.5), 3, 'X').to_4x4(),
            mat_idx=0)

    # Trailing Gurney Flap
    add_box(bm, size=(1.40, 0.012, 0.018),
            matrix=Matrix.Translation((0.0, y_wing - 0.115, z_wing + 0.012)),
            mat_idx=0)

    # Carbon Endplates
    for sign in [-1.0, 1.0]:
        x_ep = sign * 0.710
        add_box(bm, size=(0.012, 0.32, 0.14), matrix=Matrix.Translation((x_ep, y_wing, z_wing)), mat_idx=0)

    # 2. CNC Billet Aluminum Pylons (mat_idx 1 = chrome)
    for sign in [-1.0, 1.0]:
        x_py = sign * 0.380
        add_box(bm, size=(0.024, 0.075, 0.26),
                matrix=Matrix.Translation((x_py, y_wing + 0.035, z_wing - 0.125)) @ Matrix.Rotation(math.radians(-12.0), 3, 'X').to_4x4(),
                mat_idx=1)
        add_box(bm, size=(0.045, 0.110, 0.018), matrix=Matrix.Translation((x_py, y_wing + 0.065, 0.830)), mat_idx=1)

    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.001)
    bmesh.ops.subdivide_edges(bm, edges=bm.edges, cuts=1, use_grid_fill=True)

    obj = create_mesh_object("AERO_Rear_Wing", bm, parent_col,
                             mat=[mats['carbon_twill'], mats['chrome']],
                             smooth=True, bevel_w=0.002, subsurf_lvl=2)
    obj["subsystem"] = "AERO"
    obj["interactive"] = True
    obj["sound_fx"] = "carbon_click"
    obj["haptic"] = "light"
    return obj


# ─── 7. Separated Articulating Doors & Frameless Optical Glass ────────────────
def build_doors(parent_col, mats):
    """
    BMW M4 GTS Separated Articulating Doors:
    - Kinematic physical hinge origins at lower A-pillar base (export_apply=False).
    - Modeled outer skin with 3.5mm perimeter shutline offset.
    - Frameless optical dielectric glass child meshes (DOOR_FL_Glass, DOOR_FR_Glass).
    - Lightweight interior door cards with M fabric pull loop (orange/tricolor) and Alcantara armrests.
    - Carbon mirror housings mounted on door cantrails.
    """
    hinge_y = 0.680
    hinge_z = 0.440
    door_len = 1.340

    doors = {}

    for side, sign in [('L', -1.0), ('R', 1.0)]:
        hinge_x = sign * 0.810
        hinge_pos = Vector((hinge_x, hinge_y, hinge_z))

        bm_door = bmesh.new()

        pts_door = [
            Vector((0.0, 0.0, -0.220)),
            Vector((-sign * 0.065, -door_len, -0.220)),
            Vector((-sign * 0.080, -door_len, 0.360)),
            Vector((0.0, 0.0, 0.360)),
        ]
        verts_outer = [bm_door.verts.new(p) for p in pts_door]
        safe_face(bm_door, verts_outer, mat_idx=0)

        inner_offset = sign * 0.095
        pts_inner = [
            Vector((inner_offset, 0.0, -0.210)),
            Vector((inner_offset - sign * 0.065, -door_len, -0.210)),
            Vector((inner_offset - sign * 0.080, -door_len, 0.350)),
            Vector((inner_offset, 0.0, 0.350)),
        ]
        verts_inner = [bm_door.verts.new(p) for p in pts_inner]
        safe_face(bm_door, verts_inner[::-1], mat_idx=1)

        safe_face(bm_door, (verts_outer[0], verts_outer[1], verts_inner[1], verts_inner[0]), mat_idx=2)
        safe_face(bm_door, (verts_outer[1], verts_outer[2], verts_inner[2], verts_inner[1]), mat_idx=2)
        safe_face(bm_door, (verts_outer[2], verts_outer[3], verts_inner[3], verts_inner[2]), mat_idx=2)
        safe_face(bm_door, (verts_outer[3], verts_outer[0], verts_inner[0], verts_inner[3]), mat_idx=2)

        # Interior Lightweight Door Pull Loop (Acid Orange M fabric strap)
        add_box(bm_door, size=(0.015, 0.16, 0.035),
                matrix=Matrix.Translation((inner_offset * 0.85, -door_len * 0.45, 0.120)),
                mat_idx=3)

        # Exterior Flush Door Handle
        add_box(bm_door, size=(0.022, 0.15, 0.032),
                matrix=Matrix.Translation((-sign * 0.045, -door_len * 0.72, 0.310)),
                mat_idx=0)

        # Exterior M Twin-Stalk Aero Mirror
        m_x = -sign * 0.085
        m_y = -0.120
        m_z = 0.400
        add_box(bm_door, size=(0.085, 0.22, 0.12),
                matrix=Matrix.Translation((m_x, m_y, m_z)) @ Matrix.Rotation(math.radians(-sign * 15.0), 3, 'Z').to_4x4(),
                mat_idx=4)
        add_box(bm_door, size=(0.018, 0.09, 0.025),
                matrix=Matrix.Translation((m_x * 0.6, m_y + 0.02, m_z + 0.045)),
                mat_idx=2)

        bmesh.ops.remove_doubles(bm_door, verts=bm_door.verts, dist=0.001)
        bmesh.ops.subdivide_edges(bm_door, edges=bm_door.edges, cuts=1, use_grid_fill=True)

        obj_door = create_mesh_object(f"DOOR_F{side}", bm_door, parent_col,
                                      mat=[mats['paint_frozen_grey'], mats['interior_alcantara'], mats['gloss_black'], mats['acid_orange'], mats['carbon_twill']],
                                      smooth=True, bevel_w=0.002, subsurf_lvl=2)
        obj_door.location = hinge_pos
        obj_door["subsystem"] = "DOORS"
        obj_door["interactive"] = True
        obj_door["sound_fx"] = "door_heavy_click"
        obj_door["haptic"] = "medium"

        # Frameless Door Glass Child Mesh
        bm_glass = bmesh.new()
        pts_glass = [
            Vector((-sign * 0.010, -0.050, 0.360)),
            Vector((-sign * 0.085, -door_len + 0.040, 0.360)),
            Vector((-sign * 0.180, -door_len + 0.040, 0.760)),
            Vector((-sign * 0.120, -0.050, 0.680)),
        ]
        verts_g = [bm_glass.verts.new(p) for p in pts_glass]
        safe_face(bm_glass, verts_g, mat_idx=0)
        safe_face(bm_glass, verts_g[::-1], mat_idx=0)

        bmesh.ops.remove_doubles(bm_glass, verts=bm_glass.verts, dist=0.001)
        obj_glass = create_mesh_object(f"DOOR_F{side}_Glass", bm_glass, parent_col,
                                       mat=[mats['glass_clear'], mats['frit_black']],
                                       parent_obj=obj_door, smooth=True, bevel_w=0.0, subsurf_lvl=0)
        obj_glass["subsystem"] = "GLASS"

        doors[side] = obj_door

    return doors['L'], doors['R']


# ─── 8. Fixed Optical Glass (Windshield, Backlite, Hofmeister Kink) ───────────
def build_fixed_greenhouse_glass(parent_col, mats):
    """BMW M4 GTS Optical Dielectric Glass: Windshield, Backlite, Hofmeister Kink Quarter Windows."""
    bm = bmesh.new()

    # Windshield
    w_pts = [
        Vector((-0.680, 0.720, 0.800)),
        Vector((0.680, 0.720, 0.800)),
        Vector((0.540, 0.400, 1.335)),
        Vector((-0.540, 0.400, 1.335)),
    ]
    w_verts = [bm.verts.new(p) for p in w_pts]
    safe_face(bm, w_verts, mat_idx=0)
    safe_face(bm, w_verts[::-1], mat_idx=0)

    add_box(bm, size=(1.30, 0.08, 0.008),
            matrix=Matrix.Translation((0.0, 0.700, 0.815)) @ Matrix.Rotation(math.radians(-54.0), 3, 'X').to_4x4(),
            mat_idx=1)
    add_box(bm, size=(1.05, 0.07, 0.008),
            matrix=Matrix.Translation((0.0, 0.420, 1.320)) @ Matrix.Rotation(math.radians(-54.0), 3, 'X').to_4x4(),
            mat_idx=1)

    # Rear Backlite Window
    b_pts = [
        Vector((-0.540, -0.680, 1.315)),
        Vector((0.540, -0.680, 1.315)),
        Vector((0.680, -1.350, 0.835)),
        Vector((-0.680, -1.350, 0.835)),
    ]
    b_verts = [bm.verts.new(p) for p in b_pts]
    safe_face(bm, b_verts, mat_idx=0)
    safe_face(bm, b_verts[::-1], mat_idx=0)

    add_box(bm, size=(1.25, 0.08, 0.008),
            matrix=Matrix.Translation((0.0, -1.320, 0.845)) @ Matrix.Rotation(math.radians(34.0), 3, 'X').to_4x4(),
            mat_idx=1)

    # Hofmeister Kink Quarter Windows
    for sign in [-1.0, 1.0]:
        x_q = sign * 0.740
        q_pts = [
            Vector((x_q, -0.660, 0.780)),
            Vector((x_q - sign * 0.040, -0.960, 0.800)),
            Vector((x_q - sign * 0.160, -0.680, 1.280)),
        ]
        q_verts = [bm.verts.new(p) for p in q_pts]
        safe_face(bm, q_verts, mat_idx=0)
        safe_face(bm, q_verts[::-1], mat_idx=0)

        add_box(bm, size=(0.015, 0.32, 0.022),
                matrix=Matrix.Translation((x_q - sign * 0.025, -0.820, 0.795)),
                mat_idx=2)

    obj = create_mesh_object("GLASS_Greenhouse", bm, parent_col,
                             mat=[mats['glass_clear'], mats['frit_black'], mats['gloss_black']],
                             smooth=True, bevel_w=0.0, subsurf_lvl=0)
    obj["subsystem"] = "GLASS"
    return obj


# ─── 9. Lighting Optics: Adaptive LED Headlamps & 3D OLED Taillamps ───────────
def build_lighting_optics(parent_col, mats):
    """
    BMW M4 GTS Lighting Subsystem:
    - Adaptive LED Headlamps with twin hexagonal DRL halos ("Iconic Lights") and Laserlight blue optics,
      recessed seamlessly into front fascia cavities with flush outer polycarbonate covers.
    - World-First Production 3D OLED Wafer Taillamps (12 tiered ruby wafer blades per side).
    """
    bm = bmesh.new()

    # Front Headlamps (Recessed into body contours)
    for sign in [-1.0, 1.0]:
        x_hl = sign * 0.600
        y_hl = 2.180
        z_hl = 0.635

        # Recessed Satin Black Internal Housing
        add_box(bm, size=(0.22, 0.15, 0.080),
                matrix=Matrix.Translation((x_hl, y_hl, z_hl)) @ Matrix.Rotation(math.radians(-sign * 14.0), 3, 'Z').to_4x4(),
                mat_idx=0)

        # Dual Hexagonal LED Halo Rings ("BMW Iconic Lights")
        for offset_x in [-0.050, 0.045]:
            x_ring = x_hl + sign * offset_x
            # Inner Hexagonal DRL Ring (Emissive White)
            add_cylinder(bm, radius1=0.036, radius2=0.036, depth=0.015, segments=12,
                         matrix=Matrix.Translation((x_ring, y_hl + 0.04, z_hl)) @ Matrix.Rotation(math.radians(90.0), 3, 'X').to_4x4(),
                         cap_ends=False, mat_idx=1)
            # Central Projector Lens Core (Dielectric Clear)
            add_sphere(bm, radius=0.020, segments_u=16, segments_v=8,
                       matrix=Matrix.Translation((x_ring, y_hl + 0.035, z_hl)), mat_idx=2)

        # Upper Eyebrow Laserlight Accent Strip (Laser Blue)
        add_box(bm, size=(0.18, 0.015, 0.008),
                matrix=Matrix.Translation((x_hl, y_hl + 0.045, z_hl + 0.028)) @ Matrix.Rotation(math.radians(-sign * 12.0), 3, 'Z').to_4x4(),
                mat_idx=3)

        # Flush Aerodynamic Smoked Polycarbonate Lens Outer Surface
        add_box(bm, size=(0.23, 0.015, 0.085),
                matrix=Matrix.Translation((x_hl, y_hl + 0.065, z_hl)) @ Matrix.Rotation(math.radians(-sign * 14.0), 3, 'Z').to_4x4(),
                mat_idx=4)

    # 3D OLED Taillamps (12 tiered wafer blades per side)
    for sign in [-1.0, 1.0]:
        x_tl = sign * 0.660
        y_tl = -2.260
        z_tl = 0.760

        # Taillight Housing Recess
        add_box(bm, size=(0.22, 0.12, 0.080),
                matrix=Matrix.Translation((x_tl, y_tl, z_tl)) @ Matrix.Rotation(math.radians(sign * 10.0), 3, 'Z').to_4x4(),
                mat_idx=0)

        # 12 Floating OLED Ruby Wafer Blades
        for tile in range(12):
            dx = (tile - 5.5) * 0.016
            dz = math.sin(tile * 0.35) * 0.014
            add_box(bm, size=(0.012, 0.040, 0.028),
                    matrix=Matrix.Translation((x_tl + sign * dx, y_tl - 0.030, z_tl + dz)) @ Matrix.Rotation(math.radians(sign * 20.0), 3, 'Y').to_4x4(),
                    mat_idx=5)

        # White Reverse LED Strip
        add_box(bm, size=(0.09, 0.015, 0.010),
                matrix=Matrix.Translation((x_tl - sign * 0.04, y_tl - 0.050, z_tl - 0.028)),
                mat_idx=6)

        # Amber Turn Indicator LED Strip
        add_box(bm, size=(0.14, 0.015, 0.010),
                matrix=Matrix.Translation((x_tl, y_tl - 0.050, z_tl + 0.030)),
                mat_idx=7)

        # Flush Outer Smoked Lens Surface
        add_box(bm, size=(0.23, 0.015, 0.085),
                matrix=Matrix.Translation((x_tl, y_tl - 0.058, z_tl)) @ Matrix.Rotation(math.radians(sign * 10.0), 3, 'Z').to_4x4(),
                mat_idx=4)

    # Center High-Mount Stop Lamp (CHMSL)
    add_box(bm, size=(0.42, 0.025, 0.014), matrix=Matrix.Translation((0.0, -1.380, 0.840)), mat_idx=5)

    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.001)
    bmesh.ops.subdivide_edges(bm, edges=bm.edges, cuts=1, use_grid_fill=True)

    obj = create_mesh_object("LIGHT_Optics_Subsystem", bm, parent_col,
                             mat=[mats['trim_black'], mats['drl_white'], mats['glass_clear'], mats['laser_blue'],
                                  mats['glass_smoked'], mats['oled_ruby'], mats['white_reverse'], mats['amber_light']],
                             smooth=True, bevel_w=0.002, subsurf_lvl=1)
    obj["subsystem"] = "LIGHTING"
    return obj


# ─── 10. High-Density Multi-Piece Wheels: BMW M Star-Spoke 666M ───────────────
def build_wheels_and_brakes(parent_col, mats):
    """
    BMW M4 GTS Signature Style 666M Forged Alloy Wheels & Carbon Ceramic Brakes:
    - Staggered: 19-inch front (R_rim = 0.241m, R_tire = 0.340m), 20-inch rear (R_rim = 0.254m, R_tire = 0.350m).
    - Star-Spoke 666M architecture: 14 radiating curved spokes with polished Acid Orange face edges
      and contrasting Dark Ferric Grey inner pocket recesses.
    - Michelin Pilot Sport Cup 2 tires with authentic 32-segment revolved open-bead torus profile.
    - Decoupled stationary BRAKE_* assemblies with cross-drilled carbon-ceramic rotors and gold calipers.
    """
    wheel_objs = []
    brake_objs = []

    corners = [
        ('FL', -0.835,  1.406, 0.340, 0.241, 0.340, 0.250, True),
        ('FR',  0.835,  1.406, 0.340, 0.241, 0.340, 0.250, True),
        ('RL', -0.840, -1.406, 0.350, 0.254, 0.350, 0.275, False),
        ('RR',  0.840, -1.406, 0.350, 0.254, 0.350, 0.275, False),
    ]

    for name_suffix, wx, wy, wz, r_rim, r_tire, tire_w, is_front in corners:
        bm = bmesh.new()
        sign = 1.0 if wx > 0 else -1.0

        rot_y = math.radians(90.0) if sign > 0 else math.radians(-90.0)
        m_wheel = Matrix.Rotation(rot_y, 3, 'Y').to_4x4()

        # 1. Open-Bead Torus Tire (mat_idx 0 = rubber_tire)
        segments_circ = 32
        segments_cross = 14
        r_tube = (r_tire - r_rim) * 0.5
        r_mid = (r_tire + r_rim) * 0.5

        torus_rings = []
        for i in range(segments_circ):
            theta = i * (2.0 * math.pi / segments_circ)
            ring = []
            for j in range(segments_cross):
                phi = j * (2.0 * math.pi / segments_cross)
                x_local = math.sin(phi) * (tire_w * 0.40)
                rad_local = r_mid + math.cos(phi) * r_tube
                y_local = rad_local * math.cos(theta)
                z_local = rad_local * math.sin(theta)
                ring.append(bm.verts.new(Vector((x_local, y_local, z_local))))
            torus_rings.append(ring)

        for i in range(segments_circ):
            nxt_i = (i + 1) % segments_circ
            for j in range(segments_cross):
                nxt_j = (j + 1) % segments_cross
                safe_face(bm, (torus_rings[i][j], torus_rings[nxt_i][j], torus_rings[nxt_i][nxt_j], torus_rings[i][nxt_j]), mat_idx=0)

        # 2. Stepped Outer Rim Lip (mat_idx 1 = alloy_666m_orange)
        lip_x = -0.090 if sign > 0 else 0.090
        add_cylinder(bm, radius1=r_rim, radius2=r_rim * 0.94, depth=0.035, segments=36,
                     matrix=Matrix.Translation((lip_x, 0.0, 0.0)) @ m_wheel,
                     cap_ends=False, mat_idx=1)

        # 3. 666M Multi-Spoke Star Architecture (14 radiating spokes)
        hub_x = lip_x + (0.025 if sign > 0 else -0.025)
        # Center Hub
        add_cylinder(bm, radius1=0.075, radius2=0.075, depth=0.025, segments=28,
                     matrix=Matrix.Translation((hub_x, 0.0, 0.0)) @ m_wheel,
                     cap_ends=True, mat_idx=1)

        # 14 Slender Radiating Spokes
        for s in range(14):
            ang = s * (2.0 * math.pi / 14.0)
            m_spoke = Matrix.Rotation(ang, 3, 'X').to_4x4()
            spoke_len = r_rim * 0.88
            # Slender spoke arm (Acid Orange highlighted face)
            add_box(bm, size=(0.016, 0.014, spoke_len),
                    matrix=Matrix.Translation((hub_x, 0.0, spoke_len * 0.5)) @ m_spoke @ m_wheel,
                    mat_idx=1)
            # Inner pocket recess (Dark Ferric Grey)
            add_box(bm, size=(0.012, 0.010, spoke_len * 0.70),
                    matrix=Matrix.Translation((hub_x + (0.006 if sign > 0 else -0.006), 0.0, spoke_len * 0.5)) @ m_spoke @ m_wheel,
                    mat_idx=2)

        # 4. 5 Recessed Chrome Lug Bolts & BMW M Center Roundel
        add_cylinder(bm, radius1=0.032, radius2=0.032, depth=0.012, segments=20,
                     matrix=Matrix.Translation((hub_x - (0.012 if sign > 0 else -0.012), 0.0, 0.0)) @ m_wheel,
                     cap_ends=True, mat_idx=3)
        for lb in range(5):
            ang_lb = lb * (2.0 * math.pi / 5.0)
            lb_y = math.cos(ang_lb) * 0.048
            lb_z = math.sin(ang_lb) * 0.048
            add_cylinder(bm, radius1=0.007, radius2=0.007, depth=0.014, segments=12,
                         matrix=Matrix.Translation((hub_x - (0.006 if sign > 0 else -0.006), lb_y, lb_z)) @ m_wheel,
                         cap_ends=True, mat_idx=3)

        bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.001)
        bmesh.ops.subdivide_edges(bm, edges=bm.edges, cuts=1, use_grid_fill=True)

        obj_wheel = create_mesh_object(f"WHEEL_{name_suffix}", bm, parent_col,
                                       mat=[mats['rubber_tire'], mats['alloy_666m_orange'], mats['alloy_666m_grey'], mats['chrome']],
                                       smooth=True, bevel_w=0.002, subsurf_lvl=2)
        obj_wheel.location = Vector((wx, wy, wz))
        obj_wheel["subsystem"] = "WHEELS"
        obj_wheel["interactive"] = True
        obj_wheel["sound_fx"] = "tire_tap"
        obj_wheel["haptic"] = "light"
        wheel_objs.append(obj_wheel)

        # ── 5. Stationary Brake Assembly (BRAKE_*) ──
        bm_brk = bmesh.new()
        rotor_r = 0.200 if is_front else 0.190
        rotor_x = wx - (0.045 if sign > 0 else -0.045)
        # Cross-drilled rotor disc
        add_cylinder(bm_brk, radius1=rotor_r, radius2=rotor_r, depth=0.032, segments=36,
                     matrix=Matrix.Translation((rotor_x, wy, wz)) @ m_wheel,
                     cap_ends=True, mat_idx=0)

        # Ventilated core
        add_cylinder(bm_brk, radius1=rotor_r * 0.96, radius2=rotor_r * 0.96, depth=0.012, segments=28,
                     matrix=Matrix.Translation((rotor_x, wy, wz)) @ m_wheel,
                     cap_ends=False, mat_idx=1)

        # Monobloc Gold Brake Caliper
        cal_len = 0.24 if is_front else 0.19
        cal_height = 0.095 if is_front else 0.080
        add_box(bm_brk, size=(0.075, cal_len, cal_height),
                matrix=Matrix.Translation((rotor_x - (0.015 if sign > 0 else -0.015), wy + 0.125, wz + 0.130)) @ Matrix.Rotation(math.radians(-35.0), 3, 'X').to_4x4(),
                mat_idx=2)

        bmesh.ops.remove_doubles(bm_brk, verts=bm_brk.verts, dist=0.001)
        bmesh.ops.subdivide_edges(bm_brk, edges=bm_brk.edges, cuts=1, use_grid_fill=True)

        obj_brake = create_mesh_object(f"BRAKE_{name_suffix}", bm_brk, parent_col,
                                       mat=[mats['rotor_ccb'], mats['trim_black'], mats['caliper_gold']],
                                       smooth=True, bevel_w=0.002, subsurf_lvl=2)
        obj_brake["subsystem"] = "WHEELS"
        brake_objs.append(obj_brake)

    return wheel_objs


# ─── 11. S55 3.0L M TwinPower Turbo Engine & Horseshoe Strut Brace ───────────
def build_powertrain_s55(parent_col, mats):
    """BMW M4 GTS S55 3.0L TwinPower Turbo Engine & Water Injection Bay."""
    bm = bmesh.new()

    # Engine Block (Z = 0.380m)
    add_box(bm, size=(0.42, 0.72, 0.32), matrix=Matrix.Translation((0.0, 1.48, 0.380)), mat_idx=0)

    # S55 Carbon Engine Cover
    add_box(bm, size=(0.38, 0.64, 0.065), matrix=Matrix.Translation((0.0, 1.48, 0.540)), mat_idx=1)

    # M Power Accent Plaque
    add_box(bm, size=(0.14, 0.32, 0.012), matrix=Matrix.Translation((0.0, 1.48, 0.575)), mat_idx=2)

    # Water-Injection Intake Plenum
    add_cylinder(bm, radius1=0.055, radius2=0.055, depth=0.52, segments=24,
                 matrix=Matrix.Translation((-0.18, 1.48, 0.510)) @ Matrix.Rotation(math.radians(90.0), 3, 'X').to_4x4(),
                 cap_ends=True, mat_idx=3)

    # Water Injection Supply Lines (Acid Orange)
    for h in range(4):
        y_h = 1.30 + h * 0.11
        add_cylinder(bm, radius1=0.008, radius2=0.008, depth=0.18, segments=12,
                     matrix=Matrix.Translation((-0.12, y_h, 0.530)) @ Matrix.Rotation(math.radians(90.0), 3, 'Y').to_4x4(),
                     cap_ends=True, mat_idx=2)

    # Carbon Fiber Horseshoe Strut Tower Brace (Z = 0.585m, comfortably below hood at Z=0.76m)
    add_cylinder(bm, radius1=0.024, radius2=0.024, depth=1.34, segments=20,
                 matrix=Matrix.Translation((0.0, 1.32, 0.585)) @ Matrix.Rotation(math.radians(90.0), 3, 'Y').to_4x4(),
                 cap_ends=True, mat_idx=1)
    for sign in [-1.0, 1.0]:
        x_st = sign * 0.64
        add_cylinder(bm, radius1=0.075, radius2=0.075, depth=0.025, segments=20,
                     matrix=Matrix.Translation((x_st, 1.25, 0.560)), cap_ends=True, mat_idx=3)

    # Aluminum Radiator & Intercooler
    add_box(bm, size=(0.76, 0.08, 0.36), matrix=Matrix.Translation((0.0, 2.12, 0.380)), mat_idx=3)

    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.001)
    bmesh.ops.subdivide_edges(bm, edges=bm.edges, cuts=1, use_grid_fill=True)

    obj = create_mesh_object("POWERTRAIN_S55_Turbo", bm, parent_col,
                             mat=[mats['trim_black'], mats['engine_carbon'], mats['acid_orange'], mats['chrome']],
                             smooth=True, bevel_w=0.002, subsurf_lvl=2)
    obj["subsystem"] = "POWERTRAIN"
    return obj


# ─── 12. Chassis Floorpan, Suspension & Subframes ─────────────────────────────
def build_chassis_subframe(parent_col, mats):
    """BMW M4 GTS Lightweight Chassis Subframe & Flat Aero Floor."""
    bm = bmesh.new()

    add_box(bm, size=(1.62, 4.35, 0.035), matrix=Matrix.Translation((0.0, 0.0, 0.125)), mat_idx=0)
    add_box(bm, size=(1.10, 0.28, 0.08), matrix=Matrix.Translation((0.0, 1.406, 0.180)), mat_idx=1)
    add_box(bm, size=(1.10, 0.28, 0.08), matrix=Matrix.Translation((0.0, -1.406, 0.180)), mat_idx=1)

    for sign in [-1.0, 1.0]:
        add_box(bm, size=(0.28, 0.06, 0.025), matrix=Matrix.Translation((sign * 0.62, 1.406, 0.220)), mat_idx=1)
        add_box(bm, size=(0.28, 0.06, 0.025), matrix=Matrix.Translation((sign * 0.62, -1.406, 0.220)), mat_idx=1)

    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.001)
    bmesh.ops.subdivide_edges(bm, edges=bm.edges, cuts=1, use_grid_fill=True)

    obj = create_mesh_object("CHASSIS_Subframe_Undertray", bm, parent_col,
                             mat=[mats['trim_black'], mats['chrome']],
                             smooth=True, bevel_w=0.002, subsurf_lvl=1)
    obj["subsystem"] = "CHASSIS"
    return obj


# ─── 13. Track-Pack Cockpit, Acid Orange Roll Cage & Steering Wheel ───────────
def build_cockpit(parent_col, mats):
    """
    BMW M4 GTS Track-Focused Cockpit:
    - Acid Orange half roll cage properly scaled with add_rod:
      Main hoop height Z = 0.98m (roof peak is Z = 1.38m, ensuring >40cm clearance).
      Rear stays slope down from Z = 0.95m at Y = -0.18m to Z = 0.42m at Y = -0.68m,
      completely under the backlite window (which is at Z = 1.31m to 0.84m). Zero puncture!
    - Dual carbon fiber M bucket racing shell seats.
    - Dashboard with curved OLED displays.
    - Center console with M DCT gear selector.
    """
    bm = bmesh.new()

    # 1. Acid Orange Painted Steel Half Roll Cage (Strictly inside cabin: Z = 0.28m to 0.98m)
    r_cage = 0.019
    mat_cage = 0 # mats['roll_cage_orange']

    # B-Pillar Main Roll Hoop Vertical Legs
    add_rod(bm, (-0.380, -0.150, 0.280), (-0.380, -0.150, 0.980), radius=r_cage, segments=20, mat_idx=mat_cage)
    add_rod(bm, ( 0.380, -0.150, 0.280), ( 0.380, -0.150, 0.980), radius=r_cage, segments=20, mat_idx=mat_cage)

    # Top Crossbar
    add_rod(bm, (-0.380, -0.150, 0.980), ( 0.380, -0.150, 0.980), radius=r_cage, segments=20, mat_idx=mat_cage)

    # Horizontal Harness Bar
    add_rod(bm, (-0.380, -0.150, 0.620), ( 0.380, -0.150, 0.620), radius=r_cage * 0.90, segments=16, mat_idx=mat_cage)

    # Diagonal X-Brace inside the main hoop
    add_rod(bm, (-0.360, -0.150, 0.320), ( 0.360, -0.150, 0.960), radius=r_cage * 0.80, segments=16, mat_idx=mat_cage)
    add_rod(bm, ( 0.360, -0.150, 0.320), (-0.360, -0.150, 0.960), radius=r_cage * 0.80, segments=16, mat_idx=mat_cage)

    # Rearward Stays Sloping Downward to Rear Strut Towers (Stay strictly below glass!)
    # Top anchor: (-0.36, -0.18, 0.95), Bottom anchor: (-0.36, -0.68, 0.42)
    for sign in [-1.0, 1.0]:
        x_st = sign * 0.360
        add_rod(bm, (x_st, -0.180, 0.950), (x_st, -0.680, 0.420), radius=r_cage, segments=20, mat_idx=mat_cage)

    # 2. Dual Carbon Fiber M Bucket Racing Shell Seats
    for sign in [-1.0, 1.0]:
        x_seat = sign * 0.350
        y_seat = -0.120
        # Lower Cushion
        add_box(bm, size=(0.46, 0.52, 0.14), matrix=Matrix.Translation((x_seat, y_seat, 0.280)), mat_idx=1)
        # Deep Ergonomic Backrest
        add_box(bm, size=(0.44, 0.14, 0.64),
                matrix=Matrix.Translation((x_seat, y_seat - 0.22, 0.580)) @ Matrix.Rotation(math.radians(14.0), 3, 'X').to_4x4(),
                mat_idx=1)
        # Carbon Shell Rear Backing
        add_box(bm, size=(0.46, 0.025, 0.66),
                matrix=Matrix.Translation((x_seat, y_seat - 0.29, 0.580)) @ Matrix.Rotation(math.radians(14.0), 3, 'X').to_4x4(),
                mat_idx=2)
        # Harness Pass-Through Slots
        for hx in [-0.09, 0.09]:
            add_box(bm, size=(0.065, 0.035, 0.035),
                    matrix=Matrix.Translation((x_seat + hx, y_seat - 0.20, 0.740)),
                    mat_idx=3)

    # 3. Dashboard & Curved Displays
    add_box(bm, size=(1.38, 0.44, 0.28), matrix=Matrix.Translation((0.0, 0.480, 0.680)), mat_idx=1)
    add_box(bm, size=(0.32, 0.020, 0.12), matrix=Matrix.Translation((-0.350, 0.340, 0.720)), mat_idx=4)
    add_box(bm, size=(0.28, 0.020, 0.11), matrix=Matrix.Translation((0.080, 0.360, 0.740)), mat_idx=4)
    add_box(bm, size=(1.25, 0.025, 0.035), matrix=Matrix.Translation((0.0, 0.335, 0.650)), mat_idx=2)

    # 4. Center Console
    add_box(bm, size=(0.26, 0.85, 0.24), matrix=Matrix.Translation((0.0, 0.050, 0.340)), mat_idx=2)
    add_cylinder(bm, radius1=0.022, radius2=0.015, depth=0.085, segments=16,
                 matrix=Matrix.Translation((0.0, 0.220, 0.500)), cap_ends=True, mat_idx=3)

    # 5. Pedals
    for px, pz in [(-0.41, 0.20), (-0.35, 0.23), (-0.29, 0.22)]:
        add_box(bm, size=(0.045, 0.015, 0.085), matrix=Matrix.Translation((px, 0.820, pz)), mat_idx=3)

    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.001)
    bmesh.ops.subdivide_edges(bm, edges=bm.edges, cuts=1, use_grid_fill=True)

    obj_cockpit = create_mesh_object("INTERIOR_Cockpit", bm, parent_col,
                                     mat=[mats['roll_cage_orange'], mats['interior_alcantara'], mats['carbon_twill'],
                                          mats['chrome'], mats['display_oled']],
                                     smooth=True, bevel_w=0.002, subsurf_lvl=2)
    obj_cockpit["subsystem"] = "INTERIOR"

    # 6. Articulating M Sport Steering Wheel
    bm_sw = bmesh.new()
    sw_center = Vector((-0.350, 0.240, 0.680))
    add_cylinder(bm_sw, radius1=0.180, radius2=0.180, depth=0.024, segments=32,
                 matrix=Matrix.Rotation(math.radians(-22.0), 3, 'X').to_4x4(),
                 cap_ends=False, mat_idx=0)
    add_box(bm_sw, size=(0.018, 0.026, 0.028),
            matrix=Matrix.Translation((0.0, -0.065, 0.175)) @ Matrix.Rotation(math.radians(-22.0), 3, 'X').to_4x4(),
            mat_idx=1)
    add_cylinder(bm_sw, radius1=0.052, radius2=0.052, depth=0.028, segments=24,
                 matrix=Matrix.Rotation(math.radians(-22.0), 3, 'X').to_4x4(),
                 cap_ends=True, mat_idx=2)
    for sign in [-1.0, 1.0]:
        add_box(bm_sw, size=(0.022, 0.012, 0.12),
                matrix=Matrix.Translation((sign * 0.14, 0.035, 0.020)) @ Matrix.Rotation(math.radians(-22.0), 3, 'X').to_4x4(),
                mat_idx=2)

    bmesh.ops.remove_doubles(bm_sw, verts=bm_sw.verts, dist=0.001)
    bmesh.ops.subdivide_edges(bm_sw, edges=bm_sw.edges, cuts=1, use_grid_fill=True)

    obj_sw = create_mesh_object("INTERIOR_Steering_Wheel", bm_sw, parent_col,
                                mat=[mats['interior_alcantara'], mats['acid_orange'], mats['carbon_twill']],
                                smooth=True, bevel_w=0.002, subsurf_lvl=1)
    obj_sw.location = sw_center
    obj_sw["subsystem"] = "INTERIOR"
    obj_sw["interactive"] = True
    obj_sw["sound_fx"] = "paddle_click"
    obj_sw["haptic"] = "light"

    return obj_cockpit, obj_sw


# ─── 14. 10 Semantic Audio-Haptic Hitboxes ────────────────────────────────────
def build_semantic_hitboxes(parent_col):
    """10 Lightweight Semantic Hitboxes (<= 36 tris each) with audio-haptic extras."""
    hitbox_defs = [
        ("HITBOX_Door_L", (-0.88, 0.01, 0.52), (0.18, 1.34, 0.65), {"interactive": True, "part": "door_fl", "sound_fx": "door_heavy_click", "haptic": "medium"}),
        ("HITBOX_Door_R", ( 0.88, 0.01, 0.52), (0.18, 1.34, 0.65), {"interactive": True, "part": "door_fr", "sound_fx": "door_heavy_click", "haptic": "medium"}),
        ("HITBOX_Hood",   ( 0.00, 1.55, 0.72), (1.45, 1.50, 0.22), {"interactive": True, "part": "hood", "sound_fx": "hood_latch_click", "haptic": "heavy"}),
        ("HITBOX_Trunk",  ( 0.00,-1.85, 0.78), (1.30, 0.95, 0.22), {"interactive": True, "part": "trunk", "sound_fx": "trunk_pop_click", "haptic": "medium"}),
        ("HITBOX_Wheel_FL", (-0.835, 1.406, 0.340), (0.28, 0.70, 0.70), {"interactive": True, "part": "wheel_fl", "sound_fx": "tire_tap", "haptic": "light"}),
        ("HITBOX_Wheel_FR", ( 0.835, 1.406, 0.340), (0.28, 0.70, 0.70), {"interactive": True, "part": "wheel_fr", "sound_fx": "tire_tap", "haptic": "light"}),
        ("HITBOX_Wheel_RL", (-0.840,-1.406, 0.350), (0.30, 0.72, 0.72), {"interactive": True, "part": "wheel_rl", "sound_fx": "tire_tap", "haptic": "light"}),
        ("HITBOX_Wheel_RR", ( 0.840,-1.406, 0.350), (0.30, 0.72, 0.72), {"interactive": True, "part": "wheel_rr", "sound_fx": "tire_tap", "haptic": "light"}),
        ("HITBOX_Steering", (-0.350, 0.240, 0.680), (0.38, 0.20, 0.38), {"interactive": True, "part": "steering_wheel", "sound_fx": "paddle_click", "haptic": "light"}),
        ("HITBOX_Wing",     ( 0.00,-2.180, 1.080), (1.48, 0.30, 0.25), {"interactive": True, "part": "rear_wing", "sound_fx": "carbon_click", "haptic": "light"}),
    ]

    hitbox_objs = []
    for name, pos, size, extras in hitbox_defs:
        bm = bmesh.new()
        add_box(bm, size=size)
        obj = create_mesh_object(name, bm, parent_col, mat=None, smooth=False, bevel_w=0.0)
        obj.location = Vector(pos)
        obj.hide_render = True
        for k, v in extras.items():
            obj[k] = v
        hitbox_objs.append(obj)

    return hitbox_objs


# ─── 15. Standardized Camera Setup ───────────────────────────────────────────
def build_cameras(parent_col):
    """Bake 4 canonical automotive camera views into the glTF scene."""
    cam_defs = [
        ("CAMERA_ORBIT_HERO",       Vector((-3.8,  3.8, 1.9)), Vector((-0.35, 0.6, 0.70))),
        ("CAMERA_INTERIOR_DRIVER",  Vector((-0.35, -0.15, 0.98)), Vector((-0.35, 0.5, 0.68))),
        ("CAMERA_WHEEL_DETAIL",     Vector((-1.85,  1.406, 0.35)), Vector((-0.835, 1.406, 0.34))),
        ("CAMERA_REAR_AERO",        Vector(( 0.00, -4.20, 1.35)), Vector((0.00, -2.00, 0.85))),
    ]
    cameras = []
    for name, pos, target in cam_defs:
        cam_data = bpy.data.cameras.new(name)
        cam_data.lens = 45.0
        cam_data.clip_start = 0.1
        cam_data.clip_end = 100.0
        cam_obj = bpy.data.objects.new(name, cam_data)
        cam_obj.location = pos
        dir_vec = target - pos
        rot_quat = dir_vec.to_track_quat('-Z', 'Y')
        cam_obj.rotation_euler = rot_quat.to_euler()
        parent_col.objects.link(cam_obj)
        cameras.append(cam_obj)
    return cameras


# ─── 16. Bake 7+ Keyframed NLA Actions ────────────────────────────────────────
def bake_vehicle_actions(door_fl, door_fr, sw_obj, wheel_objs):
    """Bake continuous keyframed animations for interactive WebGL runtime."""
    # 1. Left Door Opening Action
    act_dl = bpy.data.actions.new(name="Action_Door_L_Open")
    door_fl.animation_data_create()
    door_fl.animation_data.action = act_dl
    door_fl.rotation_euler = (0, 0, 0)
    door_fl.keyframe_insert(data_path="rotation_euler", frame=0)
    door_fl.rotation_euler = (0, 0, math.radians(-55.0))
    door_fl.keyframe_insert(data_path="rotation_euler", frame=60)

    # 2. Right Door Opening Action
    act_dr = bpy.data.actions.new(name="Action_Door_R_Open")
    door_fr.animation_data_create()
    door_fr.animation_data.action = act_dr
    door_fr.rotation_euler = (0, 0, 0)
    door_fr.keyframe_insert(data_path="rotation_euler", frame=0)
    door_fr.rotation_euler = (0, 0, math.radians(55.0))
    door_fr.keyframe_insert(data_path="rotation_euler", frame=60)

    # 3. Steering Wheel Turn Action
    act_sw = bpy.data.actions.new(name="Action_Steering_Turn")
    sw_obj.animation_data_create()
    sw_obj.animation_data.action = act_sw
    sw_obj.rotation_euler = (0, 0, 0)
    sw_obj.keyframe_insert(data_path="rotation_euler", frame=0)
    sw_obj.rotation_euler = (0, 0, math.radians(90.0))
    sw_obj.keyframe_insert(data_path="rotation_euler", frame=30)
    sw_obj.rotation_euler = (0, 0, math.radians(-90.0))
    sw_obj.keyframe_insert(data_path="rotation_euler", frame=60)

    # 4. Wheel Continuous Spin Actions
    for w_obj in wheel_objs:
        act_w = bpy.data.actions.new(name=f"Action_{w_obj.name}_Spin")
        w_obj.animation_data_create()
        w_obj.animation_data.action = act_w
        w_obj.rotation_euler = (0, 0, 0)
        w_obj.keyframe_insert(data_path="rotation_euler", frame=0)
        w_obj.rotation_euler = (math.radians(360.0), 0, 0)
        w_obj.keyframe_insert(data_path="rotation_euler", frame=60)


# ─── 17. Master Assembly Pipeline & Production GLB Export ─────────────────────
def generate_bmw_m4_gts_master():
    print("=" * 80)
    print("APEX ENGINEER: CLASS-A PRODUCTION MASTER CAD PIPELINE")
    print("GENERATING 2016 BMW M4 GTS (F82) COUPE")
    print("=" * 80)

    clean_scene()

    col_master = bpy.data.collections.new("BMW_M4_GTS_F82")
    bpy.context.scene.collection.children.link(col_master)

    print("▸ Building PBR Material Factory...")
    mats = build_materials()

    print("▸ Building Class-A Unibody Shell & M Power Dome...")
    unibody = build_unibody(col_master, mats)

    print("▸ Building Front Splitter with Adjustable Acid Orange Blade...")
    splitter = build_front_splitter(col_master, mats)

    print("▸ Building Rear Carbon Diffuser & Titanium Quad Exhaust...")
    diffuser = build_rear_diffuser_exhaust(col_master, mats)

    print("▸ Building High-Downforce Adjustable Rear Wing...")
    wing = build_rear_wing(col_master, mats)

    print("▸ Building Separated Articulating Doors & Frameless Glass...")
    door_fl, door_fr = build_doors(col_master, mats)

    print("▸ Building Optical Glass (Windshield, Backlite, Hofmeister Kink)...")
    glass = build_fixed_greenhouse_glass(col_master, mats)

    print("▸ Building Adaptive LED Headlamps & 3D OLED Taillamps...")
    optics = build_lighting_optics(col_master, mats)

    print("▸ Building 666M Forged Alloy Wheels & Carbon Ceramic Brakes...")
    wheel_objs = build_wheels_and_brakes(col_master, mats)

    print("▸ Building S55 TwinPower Turbo Engine & Horseshoe Strut Brace...")
    powertrain = build_powertrain_s55(col_master, mats)

    print("▸ Building Chassis Subframe & Undertray...")
    chassis = build_chassis_subframe(col_master, mats)

    print("▸ Building Track-Pack Cockpit, Acid Orange Roll Cage & Steering...")
    cockpit, sw_obj = build_cockpit(col_master, mats)

    print("▸ Building 10 Semantic Audio-Haptic Hitboxes...")
    hitboxes = build_semantic_hitboxes(col_master)

    print("▸ Building Standardized Cameras...")
    cameras = build_cameras(col_master)

    print("▸ Baking 7+ NLA Actions...")
    bake_vehicle_actions(door_fl, door_fr, sw_obj, wheel_objs)

    # Pre-Export Modifier Baking Protocol (Preserving Kinematic Pivot Origins!)
    print("Executing pre-export modifier baking protocol...")
    for obj in list(col_master.objects):
        if obj.type == 'MESH':
            bpy.ops.object.select_all(action='DESELECT')
            obj.select_set(True)
            bpy.context.view_layer.objects.active = obj
            for mod in list(obj.modifiers):
                if mod.type in ['BEVEL', 'SUBSURF', 'WEIGHTED_NORMAL']:
                    try:
                        bpy.ops.object.modifier_apply(modifier=mod.name)
                    except Exception as e:
                        print(f"    [WARN] Modifier apply error on {obj.name}: {e}")

    total_tris = sum(len(o.data.polygons) * 2 for o in col_master.objects if o.type == 'MESH')
    print(f"[BMW M4 GTS] Evaluated Class-A CAD Geometry: {total_tris:,} triangles across {len(col_master.objects)} objects.")

    # Export Paths
    export_dir = "e:/Car_Automation/public/models/vehicles/coupe/2010s"
    os.makedirs(export_dir, exist_ok=True)
    os.makedirs("e:/Car_Automation/public/models", exist_ok=True)
    os.makedirs("e:/Car_Automation/exports", exist_ok=True)

    glb_main = os.path.join(export_dir, "vehicle.glb")
    glb_opt = os.path.join(export_dir, "vehicle.opt.glb")

    print(f"▸ Exporting Primary Production GLB to: {glb_main}")
    bpy.ops.export_scene.gltf(
        filepath=glb_main,
        export_format='GLB',
        use_selection=False,
        export_apply=False, # Essential for preserved kinematic hinge origins
        export_extras=True, # Essential for sound_fx & haptic metadata
        export_yup=True,
        export_animations=True,
        export_animation_mode='ACTIONS',
        export_cameras=True,
        export_lights=False
    )

    size_mb = os.path.getsize(glb_main) / (1024 * 1024)
    print(f"✅ Exported vehicle.glb successfully! File size: {size_mb:.2f} MB")

    # Mirror to top-level model locations
    mirrors = [
        "e:/Car_Automation/public/models/Car_BMW_M4_GTS.glb",
        "e:/Car_Automation/public/models/Car_BMW_M4_Complete.glb",
        "e:/Car_Automation/exports/Car_BMW_M4_GTS.glb",
        "e:/Car_Automation/exports/Car_BMW_M4_Complete.glb",
    ]
    for m in mirrors:
        shutil.copy2(glb_main, m)
        print(f"  ▸ Mirrored to: {m}")

    # Generate companion .opt.glb using gltfpack
    print("▸ Generating companion Meshopt compressed asset (vehicle.opt.glb)...")
    try:
        cmd = f'npx -y gltfpack -i "{glb_main}" -o "{glb_opt}" -cc -kn -km -ke'
        res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        if os.path.exists(glb_opt):
            opt_mb = os.path.getsize(glb_opt) / (1024 * 1024)
            print(f"✅ Meshopt companion generated! File size: {opt_mb:.2f} MB")
        else:
            print(f"⚠️ gltfpack did not create {glb_opt}: {res.stderr}")
    except Exception as e:
        print(f"⚠️ gltfpack execution error: {e}")

    print("=" * 80)
    print("BMW M4 GTS MASTER CAD PIPELINE COMPLETED")
    print("=" * 80)
    return glb_main


if __name__ == "__main__":
    generate_bmw_m4_gts_master()
