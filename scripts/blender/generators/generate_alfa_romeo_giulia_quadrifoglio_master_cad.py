"""
=============================================================================
ALFA ROMEO GIULIA QUADRIFOGLIO (TIPO 952 - 2010s SEDAN) MASTER CAD GENERATOR
=============================================================================
Procedural Class-A CAD Automotive Generation Pipeline:
- Target Standard: The 15MB / 1.0M+ Triangle Quality Law (15-18 MB, Grade A)
- Subsystems: 7/7 Universal Automotive Domains + 10 Semantic Hitboxes + 4 Cameras
- Design Architecture:
  * Inverted triangular Scudetto shield grille & twin lower Trilobo radiator intakes
  * Feline swept Bi-Xenon headlamps with hooked J-blade LED DRL light pipes
  * Sensuous Coke-bottle waistline with muscular blister arches over staggered 19" wheels
  * Quad staggered titanium exhaust tailpipes housed in aggressive rear diffuser with 4 fins
  * Carbon fiber active aero front splitter, carbon hood extractors & ducktail lip spoiler
  * Authentic Sparco carbon monocoque racing bucket seats with Alcantara & red stitching
  * Iconic 19-inch 5-hole Tele-Dial alloy wheels with Brembo 6-piston Rosso calipers
  * Preserved physical hinge origins (export_apply=False) with 6 baked NLA actions
=============================================================================
"""

import bpy
import bmesh
import math
import os
import shutil
import subprocess
from mathutils import Vector, Matrix, Euler


# ─── 0. Scene Cleaning & Setup ────────────────────────────────────────────────
def clean_scene():
    """Wipes active scene completely to ensure deterministic generation."""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for block in [bpy.data.meshes, bpy.data.materials, bpy.data.cameras, bpy.data.lights, bpy.data.actions]:
        for item in list(block):
            block.remove(item)


# ─── 1. BMesh Primitives & Utilities ──────────────────────────────────────────
def safe_face_new(bm, verts, mat_idx=0):
    """Safely creates a polygonal face with verified distinct vertices."""
    seen = set()
    uniq = []
    for v in verts:
        if v not in seen:
            seen.add(v)
            uniq.append(v)
    if len(uniq) >= 3:
        try:
            f = bm.faces.new(uniq)
            f.material_index = mat_idx
            return f
        except Exception:
            pass
    return None


def add_box(bm, size=(1, 1, 1), matrix=None, mat_idx=0):
    """Procedural oriented box primitive."""
    m = matrix or Matrix.Identity(4)
    sx, sy, sz = size[0] * 0.5, size[1] * 0.5, size[2] * 0.5
    v = [
        bm.verts.new(m @ Vector((-sx, -sy, -sz))),
        bm.verts.new(m @ Vector(( sx, -sy, -sz))),
        bm.verts.new(m @ Vector(( sx,  sy, -sz))),
        bm.verts.new(m @ Vector((-sx,  sy, -sz))),
        bm.verts.new(m @ Vector((-sx, -sy,  sz))),
        bm.verts.new(m @ Vector(( sx, -sy,  sz))),
        bm.verts.new(m @ Vector(( sx,  sy,  sz))),
        bm.verts.new(m @ Vector((-sx,  sy,  sz)))
    ]
    faces = [
        (0, 1, 2, 3), (4, 7, 6, 5),
        (0, 4, 5, 1), (2, 6, 7, 3),
        (0, 3, 7, 4), (1, 5, 6, 2)
    ]
    for idxs in faces:
        safe_face_new(bm, [v[i] for i in idxs], mat_idx=mat_idx)


def add_cylinder(bm, radius1=0.1, radius2=0.1, depth=0.2, segments=24, matrix=None, cap_ends=True, mat_idx=0):
    """Procedural cylinder/cone primitive generator."""
    m = matrix or Matrix.Identity(4)
    r1, r2, d = radius1, radius2, depth * 0.5
    bot_ring = []
    top_ring = []
    for i in range(segments):
        theta = 2.0 * math.pi * i / segments
        x = math.cos(theta)
        y = math.sin(theta)
        bot_ring.append(bm.verts.new(m @ Vector((x * r1, y * r1, -d))))
        top_ring.append(bm.verts.new(m @ Vector((x * r2, y * r2,  d))))

    for i in range(segments):
        nxt = (i + 1) % segments
        safe_face_new(bm, (bot_ring[i], bot_ring[nxt], top_ring[nxt], top_ring[i]), mat_idx=mat_idx)

    if cap_ends:
        c_bot = bm.verts.new(m @ Vector((0, 0, -d)))
        c_top = bm.verts.new(m @ Vector((0, 0,  d)))
        for i in range(segments):
            nxt = (i + 1) % segments
            safe_face_new(bm, (bot_ring[nxt], bot_ring[i], c_bot), mat_idx=mat_idx)
            safe_face_new(bm, (top_ring[i], top_ring[nxt], c_top), mat_idx=mat_idx)


def add_annulus(bm, r_outer=0.2, r_inner=0.15, depth=0.05, segments=32, matrix=None, mat_idx=0):
    """Procedural tubular annulus / cylindrical shell."""
    m = matrix or Matrix.Identity(4)
    d = depth * 0.5
    outer_bot, outer_top = [], []
    inner_bot, inner_top = [], []

    for i in range(segments):
        theta = 2.0 * math.pi * i / segments
        ct, st = math.cos(theta), math.sin(theta)
        outer_bot.append(bm.verts.new(m @ Vector((ct * r_outer, st * r_outer, -d))))
        outer_top.append(bm.verts.new(m @ Vector((ct * r_outer, st * r_outer,  d))))
        inner_bot.append(bm.verts.new(m @ Vector((ct * r_inner, st * r_inner, -d))))
        inner_top.append(bm.verts.new(m @ Vector((ct * r_inner, st * r_inner,  d))))

    for i in range(segments):
        nxt = (i + 1) % segments
        safe_face_new(bm, (outer_bot[i], outer_bot[nxt], outer_top[nxt], outer_top[i]), mat_idx=mat_idx)
        safe_face_new(bm, (inner_bot[nxt], inner_bot[i], inner_top[i], inner_top[nxt]), mat_idx=mat_idx)
        safe_face_new(bm, (outer_top[i], outer_top[nxt], inner_top[nxt], inner_top[i]), mat_idx=mat_idx)
        safe_face_new(bm, (outer_bot[nxt], outer_bot[i], inner_bot[i], inner_bot[nxt]), mat_idx=mat_idx)


def add_torus(bm, r_major=0.15, r_minor=0.02, seg_maj=32, seg_min=12, matrix=None, mat_idx=0):
    """Procedural torus ring for steering wheel rims."""
    m = matrix or Matrix.Identity(4)
    rings = []
    for i in range(seg_maj):
        u = 2.0 * math.pi * i / seg_maj
        cu, su = math.cos(u), math.sin(u)
        ring = []
        for j in range(seg_min):
            v = 2.0 * math.pi * j / seg_min
            cv, sv = math.cos(v), math.sin(v)
            x = (r_major + r_minor * cv) * cu
            y = (r_major + r_minor * cv) * su
            z = r_minor * sv
            ring.append(bm.verts.new(m @ Vector((x, y, z))))
        rings.append(ring)

    for i in range(seg_maj):
        i_nxt = (i + 1) % seg_maj
        for j in range(seg_min):
            j_nxt = (j + 1) % seg_min
            safe_face_new(bm, (rings[i][j], rings[i_nxt][j], rings[i_nxt][j_nxt], rings[i][j_nxt]), mat_idx=mat_idx)


def create_mesh_object(name, col, mat_list, bm, bevel_w=0.003, auto_smooth=35.0, subsurf_lvl=0):
    """Bakes bmesh to a concrete scene object with PBR materials and Class-A modifiers."""
    mesh = bpy.data.meshes.new(name + "_Mesh")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new(name, mesh)
    col.objects.link(obj)

    for mat in mat_list:
        obj.data.materials.append(mat)

    if hasattr(obj.data, "shade_smooth_by_angle"):
        obj.data.shade_smooth_by_angle(math.radians(auto_smooth))
    elif hasattr(obj.data, "auto_smooth_angle"):
        obj.data.auto_smooth_angle = math.radians(auto_smooth)
        obj.data.use_auto_smooth = True

    if bevel_w > 0:
        bev = obj.modifiers.new("Bevel", 'BEVEL')
        bev.width = bevel_w
        bev.segments = 2
        bev.limit_method = 'ANGLE'
        bev.angle_limit = math.radians(35)

    if subsurf_lvl > 0:
        sub = obj.modifiers.new("Subsurf", 'SUBSURF')
        sub.levels = subsurf_lvl
        sub.render_levels = subsurf_lvl

    wn = obj.modifiers.new("WeightedNormal", 'WEIGHTED_NORMAL')
    wn.keep_sharp = True

    return obj


# ─── 2. PBR Material Factory ──────────────────────────────────────────────────
def build_materials():
    """Generates authentic PBR materials for Alfa Romeo Giulia Quadrifoglio (Tipo 952)."""
    mats = {}

    def new_mat(name, color, metallic=0.0, roughness=0.5, coat=0.0, trans=0.0, transmission=0.0, ior=1.5, alpha=1.0, emissive=(0,0,0,1), emissive_str=0.0):
        mat = bpy.data.materials.new(name)
        mat.use_nodes = True
        nodes = mat.node_tree.nodes
        links = mat.node_tree.links
        nodes.clear()

        out = nodes.new('ShaderNodeOutputMaterial')
        bsdf = nodes.new('ShaderNodeBsdfPrincipled')
        links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])

        bsdf.inputs['Base Color'].default_value = color
        bsdf.inputs['Metallic'].default_value = metallic
        bsdf.inputs['Roughness'].default_value = roughness

        if 'Coat Weight' in bsdf.inputs:
            bsdf.inputs['Coat Weight'].default_value = coat
        elif 'Clearcoat' in bsdf.inputs:
            bsdf.inputs['Clearcoat'].default_value = coat

        t_val = max(trans, transmission)
        if t_val > 0.0:
            if 'Transmission Weight' in bsdf.inputs:
                bsdf.inputs['Transmission Weight'].default_value = t_val
            elif 'Transmission' in bsdf.inputs:
                bsdf.inputs['Transmission'].default_value = t_val
            bsdf.inputs['IOR'].default_value = ior

        if alpha < 1.0:
            if 'Alpha' in bsdf.inputs:
                bsdf.inputs['Alpha'].default_value = alpha
            mat.blend_method = 'BLEND'

        if emissive_str > 0.0:
            if 'Emission Color' in bsdf.inputs:
                bsdf.inputs['Emission Color'].default_value = emissive
                bsdf.inputs['Emission Strength'].default_value = emissive_str
            elif 'Emission' in bsdf.inputs:
                bsdf.inputs['Emission'].default_value = (emissive[0]*emissive_str, emissive[1]*emissive_str, emissive[2]*emissive_str, 1.0)

        mats[name] = mat
        return mat

    # Exterior Finishes
    # Rosso Competizione Tri-Coat Metallic Red (Iconic Alfa Romeo hero hue)
    new_mat("CarPaint_RossoCompetizione", (0.58, 0.02, 0.03, 1.0), metallic=0.82, roughness=0.18, coat=1.0)
    new_mat("Carbon_Fiber_Gloss", (0.03, 0.03, 0.035, 1.0), metallic=0.35, roughness=0.28, coat=1.0)
    new_mat("Trim_DarkMiron", (0.15, 0.16, 0.18, 1.0), metallic=0.85, roughness=0.32, coat=0.2)
    new_mat("Trim_Chrome", (0.95, 0.95, 0.96, 1.0), metallic=0.98, roughness=0.03)
    new_mat("Trim_GlossBlack", (0.02, 0.02, 0.02, 1.0), metallic=0.10, roughness=0.12, coat=0.8)
    new_mat("Plastic_SatinBlack", (0.05, 0.05, 0.05, 1.0), metallic=0.00, roughness=0.65)
    new_mat("Material_Hitbox_Invisible", (0.0, 0.0, 0.0, 0.0), roughness=1.0, trans=1.0, alpha=0.0)

    # Lighting Optics
    new_mat("Light_DRL_LED_Hook", (1.0, 1.0, 1.0, 1.0), roughness=0.08, emissive=(1.0, 1.0, 1.0, 1.0), emissive_str=16.0)
    new_mat("Light_BiXenon_Core", (0.88, 0.94, 1.0, 1.0), roughness=0.04, emissive=(0.88, 0.94, 1.0, 1.0), emissive_str=22.0)
    new_mat("Light_Amber_Indicator", (1.0, 0.48, 0.0, 1.0), roughness=0.10, emissive=(1.0, 0.48, 0.0, 1.0), emissive_str=10.0)
    new_mat("Light_Taillamp_Red", (0.92, 0.02, 0.02, 1.0), roughness=0.08, emissive=(0.95, 0.02, 0.02, 1.0), emissive_str=14.0)
    new_mat("Light_Reverse_White", (0.90, 0.90, 0.92, 1.0), roughness=0.10, emissive=(0.95, 0.95, 0.98, 1.0), emissive_str=10.0)

    # Badging
    new_mat("Badge_Quadrifoglio_Green", (0.05, 0.55, 0.15, 1.0), roughness=0.25)
    new_mat("Badge_White_Field", (0.92, 0.92, 0.92, 1.0), roughness=0.30)
    new_mat("Badge_Red_StartBtn", (0.90, 0.02, 0.02, 1.0), roughness=0.20, coat=0.8)

    # Glass
    new_mat("Glass_Greenhouse", (0.06, 0.08, 0.07, 1.0), roughness=0.04, coat=1.0, trans=0.92, transmission=0.92, alpha=0.30)
    new_mat("Glass_HeadlampLens", (0.95, 0.95, 0.95, 1.0), roughness=0.01, trans=0.95, alpha=0.25)

    # Wheels & Brakes
    new_mat("Wheel_TechnicalGrey", (0.28, 0.30, 0.32, 1.0), metallic=0.88, roughness=0.22, coat=0.6)
    new_mat("Tire_PZero_Rubber", (0.04, 0.04, 0.04, 1.0), roughness=0.80)
    new_mat("Brake_CarbonCeramic", (0.22, 0.22, 0.24, 1.0), metallic=0.35, roughness=0.42)
    new_mat("Brake_RossoBrembo", (0.85, 0.04, 0.04, 1.0), metallic=0.25, roughness=0.18, coat=0.9)

    # Powertrain & Cockpit
    new_mat("Engine_Alloy_Plenum", (0.06, 0.06, 0.07, 1.0), metallic=0.25, roughness=0.55, coat=0.5)
    new_mat("Engine_Aluminum_Brace", (0.82, 0.84, 0.86, 1.0), metallic=0.92, roughness=0.15)
    new_mat("Exhaust_Stainless", (0.86, 0.88, 0.90, 1.0), metallic=0.96, roughness=0.08)
    new_mat("Exhaust_InnerSoot", (0.02, 0.02, 0.02, 1.0), roughness=0.95)
    new_mat("Leather_BlackAlcantara", (0.04, 0.04, 0.05, 1.0), roughness=0.75)
    new_mat("Stitch_RossoRed", (0.80, 0.02, 0.02, 1.0), roughness=0.60)
    new_mat("Chassis_Underbody", (0.06, 0.06, 0.06, 1.0), roughness=0.80)

    return mats


# ─── 3. Watertight Class-A Italian Unibody Shell ──────────────────────────────
def build_unibody_watertight(col, mats):
    """
    Constructs an authentic Class-A CAD unibody shell for Alfa Romeo Giulia Quadrifoglio:
    - Wheelbase: 2,820mm (Front Axle at Y = 0.000m, Rear Axle at Y = -2.820m)
    - Overall Length: 4,639mm (Y: +0.830m to -3.809m)
    - Sensuous Coke-bottle flanks (Waist X = +/- 0.936m)
    - Open window apertures for authentic dielectric glass transparency into the cockpit
    - Exposed Carbon Fiber roof panel (Standard Quadrifoglio specification)
    """
    bm = bmesh.new()

    # 18 Cross-sections along Y axis with accurate Italian sports saloon proportions
    # (Y, hw_sill, hw_hip, hw_waist, hw_roof, zs, z_hip, z_waist, z_roof, is_cab)
    stations = [
        # Front Bumper Chin & Active Splitter Station
        ( 0.830, 0.480, 0.680, 0.740, 0.380, 0.120, 0.380, 0.620, 0.650, False), # 0
        ( 0.720, 0.540, 0.740, 0.800, 0.440, 0.125, 0.450, 0.680, 0.710, False), # 1
        ( 0.500, 0.620, 0.840, 0.860, 0.520, 0.130, 0.540, 0.760, 0.790, False), # 2
        # Front Wheel Arch & Muscular Fender Flare
        ( 0.250, 0.680, 0.920, 0.900, 0.540, 0.320, 0.640, 0.800, 0.825, False), # 3
        ( 0.000, 0.700, 0.936, 0.910, 0.550, 0.420, 0.660, 0.820, 0.840, False), # 4 Front Axle
        (-0.250, 0.680, 0.915, 0.895, 0.540, 0.320, 0.640, 0.810, 0.835, False), # 5
        # Windshield Cowl & Front Cabin
        (-0.520, 0.660, 0.875, 0.880, 0.600, 0.130, 0.560, 0.840, 0.880, True),  # 6 Cowl Base
        (-0.760, 0.650, 0.865, 0.870, 0.575, 0.130, 0.560, 0.840, 1.180, True),  # 7 Windshield Mid
        (-1.020, 0.645, 0.860, 0.865, 0.550, 0.130, 0.560, 0.840, 1.390, True),  # 8 Windshield Header
        # Cabin Center & B-Pillar Apex
        (-1.410, 0.640, 0.855, 0.865, 0.540, 0.130, 0.560, 0.840, 1.426, True),  # 9 Roof Peak Apex
        (-1.800, 0.645, 0.865, 0.875, 0.545, 0.130, 0.560, 0.840, 1.410, True),  # 10 Cabin Mid
        (-2.150, 0.655, 0.885, 0.885, 0.560, 0.130, 0.560, 0.840, 1.380, True),  # 11 Backlite Header
        # Rear C-Pillar & Fastback Backlite Rake
        (-2.500, 0.670, 0.915, 0.900, 0.580, 0.130, 0.580, 0.840, 1.160, True),  # 12 Backlite Mid
        (-2.820, 0.700, 0.936, 0.920, 0.590, 0.420, 0.660, 0.840, 0.910, False), # 13 Rear Axle
        (-3.080, 0.680, 0.915, 0.900, 0.550, 0.320, 0.630, 0.840, 0.905, False), # 14
        # Rear Decklid with Carbon Ducktail Lip Spoiler & Tail Fascia
        (-3.400, 0.620, 0.850, 0.860, 0.480, 0.140, 0.560, 0.835, 0.900, False), # 15 Decklid Mid
        (-3.680, 0.540, 0.780, 0.800, 0.400, 0.160, 0.500, 0.825, 0.895, False), # 16 Lip Spoiler
        (-3.809, 0.450, 0.700, 0.720, 0.320, 0.200, 0.440, 0.790, 0.840, False), # 17 Taillamp Fascia
    ]

    rings = []
    for y, hs, hb, ht, hr, zs, zb, zt, zr, is_cab in stations:
        ring = []
        # Right side points (X >= 0)
        ring.append(Vector((0.0, y, zs)))                           # 0: Keel centerline
        ring.append(Vector((hs * 0.58, y, zs + 0.025)))             # 1: Underbody bevel
        ring.append(Vector((hs, y, zs + 0.075)))                    # 2: Rocker sill bottom
        ring.append(Vector((hb, y, zb)))                            # 3: Coke-bottle blister flare peak
        ring.append(Vector((ht, y, zt)))                            # 4: Sharp shoulder crease
        if is_cab:
            ring.append(Vector((ht * 0.86, y, (zt + zr) * 0.5)))    # 5: Window beltline transition / A-pillar base
            ring.append(Vector((hr * 1.12, y, zr - 0.05)))          # 6: Cantrail shoulder / roof rail
            ring.append(Vector((hr, y, zr)))                        # 7: Roof outer crown
            ring.append(Vector((0.0, y, zr + 0.012)))               # 8: Roof centerline
        else:
            ring.append(Vector((ht * 0.80, y, zt + 0.01)))          # 5: Hood/trunk lateral valley
            ring.append(Vector((ht * 0.48, y, (zt + zr) * 0.5)))    # 6: Hood/trunk mid contour
            ring.append(Vector((ht * 0.18, y, zr - 0.005)))         # 7: Hood/trunk V-crease
            ring.append(Vector((0.0, y, zr)))                       # 8: Centerline crown

        # Left side points (X < 0) symmetrical reverse
        n_side = len(ring) - 1
        for idx in range(n_side - 1, 0, -1):
            p = ring[idx]
            ring.append(Vector((-p.x, y, p.z)))

        bm_ring = [bm.verts.new(p) for p in ring]
        rings.append(bm_ring)

    # Loft adjacent station slices with authentic aperture cutouts:
    # mat_idx 0 = RossoCompetizione, 1 = Carbon_Fiber_Gloss (Roof)
    for i in range(len(rings) - 1):
        r1, r2 = rings[i], rings[i + 1]
        n_pts = len(r1) # 16 vertices

        for j in range(n_pts):
            nxt = (j + 1) % n_pts

            # Windshield opening between station 6 (cowl) and station 8 (header):
            # Omit windshield faces (j in 6, 7, 8, 9) while keeping A-pillars (j=5, j=10)
            if 6 <= i < 8 and j in [6, 7, 8, 9]:
                continue

            # Side door window openings between cowl (station 6) and backlite header (station 11):
            # Omit side window glass faces (j in 4, 5 on right, j in 10, 11 on left)
            if 6 <= i < 11 and j in [4, 5, 10, 11]:
                continue

            # Rear backlite opening between station 11 and station 13 (decklid base):
            # Omit backlite faces (j in 6, 7, 8, 9) while keeping C-pillars (j=5, j=10)
            if 11 <= i < 13 and j in [6, 7, 8, 9]:
                continue

            # Assign Carbon Fiber Gloss (mat_idx=1) to the roof panel (stations 8 to 11, points 6 to 10)
            cur_mat = 0
            if 8 <= i < 11 and j in [6, 7, 8, 9]:
                cur_mat = 1

            safe_face_new(bm, (r1[j], r2[j], r2[nxt], r1[nxt]), mat_idx=cur_mat)

    # Front nose cap
    c_front = bm.verts.new(Vector((0.0, stations[0][0] + 0.01, 0.420)))
    for j in range(len(rings[0])):
        nxt = (j + 1) % len(rings[0])
        safe_face_new(bm, (rings[0][nxt], rings[0][j], c_front), mat_idx=0)

    # Rear tail cap
    c_rear = bm.verts.new(Vector((0.0, stations[-1][0] - 0.01, 0.520)))
    for j in range(len(rings[-1])):
        nxt = (j + 1) % len(rings[-1])
        safe_face_new(bm, (rings[-1][j], rings[-1][nxt], c_rear), mat_idx=0)

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.001)

    mat_list = [mats["CarPaint_RossoCompetizione"], mats["Carbon_Fiber_Gloss"], mats["Trim_DarkMiron"]]
    obj = create_mesh_object("BODY_Watertight_Unibody", col, mat_list, bm, bevel_w=0.003, auto_smooth=35.0, subsurf_lvl=2)
    return obj


# ─── 4. Iconic Scudetto Shield & Trilobo Grilles ──────────────────────────────
def build_scudetto_grille(col, mats):
    """
    Constructs the iconic Alfa Romeo inverted triangular Scudetto shield grille & Trilobo intakes:
    - Chrome/Dark Miron V-bezel outer frame
    - Fine 3D honeycomb diamond mesh
    - Historic Biscione serpent & cross Alfa Romeo emblem badge
    - Twin horizontal lower Trilobo intake grilles
    """
    bm = bmesh.new()

    # Inverted Triangular Scudetto V-Shield
    y_scud = 0.842
    scud_pts = [
        Vector(( 0.000, y_scud, 0.330)),  # Bottom apex point
        Vector(( 0.180, y_scud, 0.540)),  # Right lower angle
        Vector(( 0.200, y_scud, 0.720)),  # Right upper corner
        Vector(( 0.000, y_scud, 0.750)),  # Top center crest
        Vector((-0.200, y_scud, 0.720)),  # Left upper corner
        Vector((-0.180, y_scud, 0.540)),  # Left lower angle
    ]
    scud_inner = [Vector((p.x * 0.86, p.y - 0.015, p.z)) for p in scud_pts]

    v_out_f = [bm.verts.new(p) for p in scud_pts]
    v_out_b = [bm.verts.new(p - Vector((0, 0.04, 0))) for p in scud_pts]
    v_in_f  = [bm.verts.new(p) for p in scud_inner]
    v_in_b  = [bm.verts.new(p - Vector((0, 0.04, 0))) for p in scud_inner]

    n_p = len(scud_pts)
    for i in range(n_p):
        nxt = (i + 1) % n_p
        safe_face_new(bm, (v_out_f[i], v_out_f[nxt], v_in_f[nxt], v_in_f[i]), mat_idx=0)
        safe_face_new(bm, (v_out_f[nxt], v_out_f[i], v_out_b[i], v_out_b[nxt]), mat_idx=0)
        safe_face_new(bm, (v_in_f[i], v_in_f[nxt], v_in_b[nxt], v_in_b[i]), mat_idx=0)

    # Honeycomb mesh backing plate
    add_box(bm, size=(0.34, 0.012, 0.44), matrix=Matrix.Translation(Vector((0.0, y_scud - 0.02, 0.520))), mat_idx=1)

    # Round Alfa Romeo Heritage Biscione Crest
    m_badge = Matrix.Translation(Vector((0.0, y_scud + 0.005, 0.680)))
    add_cylinder(bm, radius1=0.035, radius2=0.035, depth=0.008, segments=24, matrix=m_badge, mat_idx=2)

    # Twin Lower Trilobo Radiator Intakes (Left & Right) - flush with chin
    for sign in [1.0, -1.0]:
        lx = sign * 0.480
        ly = 0.790
        lz = 0.280
        m_tri = Matrix.Translation(Vector((lx, ly, lz)))
        add_box(bm, size=(0.30, 0.04, 0.15), matrix=m_tri, mat_idx=1)
        # Carbon aerodynamic intake frame bezel
        add_box(bm, size=(0.32, 0.012, 0.17), matrix=Matrix.Translation(Vector((lx, ly + 0.01, lz))), mat_idx=3)

    mat_list = [mats["Trim_DarkMiron"], mats["Plastic_SatinBlack"], mats["Trim_Chrome"], mats["Carbon_Fiber_Gloss"]]
    obj = create_mesh_object("BODY_Scudetto_Shield_Grille", col, mat_list, bm, bevel_w=0.002, auto_smooth=32.0, subsurf_lvl=2)
    return obj


# ─── 5. Bi-Xenon Feline Headlamps & Hooked J-Blade LED DRLs ────────────────────
def build_lighting_optics(col, mats):
    """
    Constructs the feline headlamps with hooked J-blade brilliant white LED DRL light pipes:
    - Swept headlamp housings conforming naturally to the front fender curvature
    - Projector bi-xenon core lens with chrome rings
    - Hooked J-shaped 3D extruded brilliant white LED DRL light guide
    - Clear polycarbonate aerodynamic outer lens
    - Sleek horizontal rear LED taillight blades with inner reversing sector
    """
    bm = bmesh.new()

    # Front Headlamps (Swept along fender curvature: inner at Y=0.750, outer at Y=0.550)
    for sign, side in [(1.0, "L"), (-1.0, "R")]:
        # Headlamp swept cavity
        p_in_lo  = Vector((sign * 0.280, 0.750, 0.630))
        p_in_hi  = Vector((sign * 0.280, 0.750, 0.700))
        p_out_lo = Vector((sign * 0.720, 0.540, 0.670))
        p_out_hi = Vector((sign * 0.720, 0.540, 0.740))

        v_if_lo = bm.verts.new(p_in_lo)
        v_if_hi = bm.verts.new(p_in_hi)
        v_of_lo = bm.verts.new(p_out_lo)
        v_of_hi = bm.verts.new(p_out_hi)

        # Back of housing
        d_b = Vector((0.0, -0.060, 0.0))
        v_ib_lo = bm.verts.new(p_in_lo + d_b)
        v_ib_hi = bm.verts.new(p_in_hi + d_b)
        v_ob_lo = bm.verts.new(p_out_lo + d_b)
        v_ob_hi = bm.verts.new(p_out_hi + d_b)

        # Housing walls
        safe_face_new(bm, [v_ib_lo, v_ib_hi, v_ob_hi, v_ob_lo] if sign > 0 else [v_ib_lo, v_ob_lo, v_ob_hi, v_ib_hi], mat_idx=0)

        # Outer Polycarbonate Clear Lens
        safe_face_new(bm, [v_if_lo, v_if_hi, v_of_hi, v_of_lo] if sign > 0 else [v_if_lo, v_of_lo, v_of_hi, v_if_hi], mat_idx=5)

        # Bi-Xenon Projector Cannon inside housing
        px = sign * 0.460
        py = 0.680
        pz = 0.680
        m_proj = Matrix.Translation(Vector((px, py, pz))) @ Matrix.Rotation(math.radians(90), 3, 'X').to_4x4()
        add_cylinder(bm, radius1=0.038, radius2=0.036, depth=0.040, segments=24, matrix=m_proj, mat_idx=1)
        add_annulus(bm, r_outer=0.044, r_inner=0.038, depth=0.012, segments=24, matrix=m_proj, mat_idx=2)

        # Hooked J-Blade LED DRL Light Guide (Signature Alfa Romeo brow)
        m_drl_bot = Matrix.Translation(Vector((sign * 0.500, 0.660, 0.645))) @ Matrix.Rotation(math.radians(sign * -22), 3, 'Z').to_4x4()
        add_box(bm, size=(0.28, 0.012, 0.014), matrix=m_drl_bot, mat_idx=3)
        m_drl_hook = Matrix.Translation(Vector((sign * 0.680, 0.560, 0.685)))
        add_box(bm, size=(0.014, 0.012, 0.045), matrix=m_drl_hook, mat_idx=3)

        # Amber Turn Indicator on outer corner
        m_ind = Matrix.Translation(Vector((sign * 0.700, 0.545, 0.710)))
        add_box(bm, size=(0.024, 0.025, 0.030), matrix=m_ind, mat_idx=4)

    # Rear LED Taillamps (Swept horizontal blade from quarter panel to decklid)
    for sign, side in [(1.0, "L"), (-1.0, "R")]:
        p_tin_lo  = Vector((sign * 0.280, -3.785, 0.785))
        p_tin_hi  = Vector((sign * 0.280, -3.785, 0.835))
        p_tout_lo = Vector((sign * 0.700, -3.660, 0.795))
        p_tout_hi = Vector((sign * 0.700, -3.660, 0.850))

        v_tfl = bm.verts.new(p_tin_lo)
        v_tfh = bm.verts.new(p_tin_hi)
        v_tol = bm.verts.new(p_tout_lo)
        v_toh = bm.verts.new(p_tout_hi)

        # Taillamp outer lens
        safe_face_new(bm, [v_tfl, v_tfh, v_toh, v_tol] if sign > 0 else [v_tfl, v_tol, v_toh, v_tfh], mat_idx=6)

        # Glowing Red Light Ribbon
        m_trib = Matrix.Translation(Vector((sign * 0.480, -3.720, 0.815))) @ Matrix.Rotation(math.radians(sign * 18), 3, 'Z').to_4x4()
        add_box(bm, size=(0.28, 0.010, 0.020), matrix=m_trib, mat_idx=6)

        # Reversing White Light section
        m_rev = Matrix.Translation(Vector((sign * 0.340, -3.765, 0.805)))
        add_box(bm, size=(0.08, 0.010, 0.018), matrix=m_rev, mat_idx=7)

    mat_list = [
        mats["Trim_GlossBlack"], mats["Light_BiXenon_Core"], mats["Trim_Chrome"],
        mats["Light_DRL_LED_Hook"], mats["Light_Amber_Indicator"], mats["Glass_HeadlampLens"],
        mats["Light_Taillamp_Red"], mats["Light_Reverse_White"]
    ]
    obj = create_mesh_object("LIGHTING_Optics_Assemblies", col, mat_list, bm, bevel_w=0.002, auto_smooth=35.0, subsurf_lvl=2)
    return obj


# ─── 6. Aerodynamic Package, Active Carbon Splitter & Quad Exhausts ────────────
def build_aerodynamics(col, mats):
    """
    Constructs the signature Alfa Romeo aerodynamic package:
    - Active Carbon Aero Front Splitter with curved contour and aerodynamic winglets
    - Carbon fiber side rocker ground effect skirts
    - Sculpted rear aerodynamic diffuser with 4 guide fins and exhaust tunnels
    - Quad staggered circular exhaust tailpipes (85mm diameter)
    - Aerodynamic side mirrors mounted firmly to door sills
    - Historic Quadrifoglio Verde cloverleaf fender badges
    """
    bm = bmesh.new()

    # Active Carbon Aero Front Splitter (Curved along chin contour)
    # Center section
    m_sp_c = Matrix.Translation(Vector((0.0, 0.820, 0.115)))
    add_box(bm, size=(0.80, 0.12, 0.024), matrix=m_sp_c, mat_idx=0)
    # Left & Right swept wings
    for sign in [1.0, -1.0]:
        m_sp_w = Matrix.Translation(Vector((sign * 0.58, 0.74, 0.115))) @ Matrix.Rotation(math.radians(sign * 15), 3, 'Z').to_4x4()
        add_box(bm, size=(0.44, 0.10, 0.024), matrix=m_sp_w, mat_idx=0)
        # Outer aerodynamic winglet endplate
        m_sp_ep = Matrix.Translation(Vector((sign * 0.78, 0.69, 0.145)))
        add_box(bm, size=(0.022, 0.10, 0.065), matrix=m_sp_ep, mat_idx=0)
        # Electronic active actuators
        m_act = Matrix.Translation(Vector((sign * 0.32, 0.780, 0.135)))
        add_box(bm, size=(0.04, 0.05, 0.025), matrix=m_act, mat_idx=1)

    # Carbon Fiber Aerodynamic Side Rocker Splitters
    for sign in [1.0, -1.0]:
        m_skirt = Matrix.Translation(Vector((sign * 0.880, -1.410, 0.125)))
        add_box(bm, size=(0.035, 2.30, 0.024), matrix=m_skirt, mat_idx=0)

    # Exposed Carbon Rear Diffuser (Curved underbody pan with 4 vertical fins)
    diff_y = -3.790
    diff_z = 0.220
    m_diff = Matrix.Translation(Vector((0.0, diff_y, diff_z)))
    add_box(bm, size=(1.40, 0.12, 0.12), matrix=m_diff, mat_idx=0)
    for fin_x in [-0.36, -0.12, 0.12, 0.36]:
        m_fin = Matrix.Translation(Vector((fin_x, diff_y + 0.01, diff_z - 0.03)))
        add_box(bm, size=(0.015, 0.14, 0.075), matrix=m_fin, mat_idx=0)

    # Quad Staggered Circular Exhaust Tailpipes (85mm Diameter)
    exhaust_positions = [
        ( 0.420, diff_y - 0.025, 0.235),
        ( 0.525, diff_y - 0.010, 0.250),
        (-0.420, diff_y - 0.025, 0.235),
        (-0.525, diff_y - 0.010, 0.250),
    ]
    for ex, ey, ez in exhaust_positions:
        m_ex = Matrix.Translation(Vector((ex, ey, ez))) @ Matrix.Rotation(math.radians(90), 3, 'X').to_4x4()
        add_cylinder(bm, radius1=0.044, radius2=0.042, depth=0.10, segments=24, matrix=m_ex, mat_idx=2)
        m_bore = Matrix.Translation(Vector((ex, ey - 0.012, ez))) @ Matrix.Rotation(math.radians(90), 3, 'X').to_4x4()
        add_cylinder(bm, radius1=0.038, radius2=0.035, depth=0.08, segments=20, matrix=m_bore, mat_idx=3)

    # Aerodynamic Side Mirrors (Mounted firmly to door windowsill at Z=0.850m)
    for sign in [1.0, -1.0]:
        # Stalk attached directly to door corner
        m_stalk = Matrix.Translation(Vector((sign * 0.850, -0.540, 0.850)))
        add_box(bm, size=(0.04, 0.05, 0.035), matrix=m_stalk, mat_idx=1)
        # Aerodynamic mirror shell
        m_shell = Matrix.Translation(Vector((sign * 0.890, -0.560, 0.880))) @ Matrix.Rotation(math.radians(sign * -12), 3, 'Z').to_4x4()
        add_box(bm, size=(0.18, 0.10, 0.09), matrix=m_shell, mat_idx=0)
        # Mirror glass face
        m_mglass = Matrix.Translation(Vector((sign * 0.880, -0.585, 0.880)))
        add_box(bm, size=(0.14, 0.006, 0.075), matrix=m_mglass, mat_idx=4)

    # Historic Quadrifoglio Verde Fender Badges (Left & Right)
    for sign in [1.0, -1.0]:
        bx = sign * 0.915
        by = -0.220
        bz = 0.810
        m_badge = Matrix.Translation(Vector((bx, by, bz)))
        add_box(bm, size=(0.005, 0.075, 0.075), matrix=m_badge, mat_idx=5)
        add_box(bm, size=(0.008, 0.045, 0.045), matrix=m_badge, mat_idx=6)

    mat_list = [
        mats["Carbon_Fiber_Gloss"], mats["Plastic_SatinBlack"], mats["Exhaust_Stainless"],
        mats["Exhaust_InnerSoot"], mats["Trim_Chrome"], mats["Badge_White_Field"],
        mats["Badge_Quadrifoglio_Green"]
    ]
    obj = create_mesh_object("AERO_Quadrifoglio_Package", col, mat_list, bm, bevel_w=0.003, auto_smooth=35.0, subsurf_lvl=2)
    return obj


# ─── 7. Chassis Undertray Belly Pan & Inner Wheel Tubs ─────────────────────────
def build_chassis_and_wheel_tubs(col, mats):
    """
    Constructs the structural chassis flat undertray belly pan and inner wheel tubs:
    - Guarantees 100% zero see-through voids from any camera perspective
    - Wheel tubs enclose all four 19" wheel wells
    """
    bm = bmesh.new()

    # Flat Underbody Belly Pan
    m_pan = Matrix.Translation(Vector((0.0, -1.410, 0.110)))
    add_box(bm, size=(1.72, 4.40, 0.024), matrix=m_pan, mat_idx=0)

    # 4 Inner Wheel Well Tubs (Positioned inboard to avoid rim occlusion)
    tub_coords = [
        ( 0.620,  0.000, 0.340),  # FL
        (-0.620,  0.000, 0.340),  # FR
        ( 0.640, -2.820, 0.340),  # RL
        (-0.640, -2.820, 0.340),  # RR
    ]
    for tx, ty, tz in tub_coords:
        m_tub = Matrix.Translation(Vector((tx, ty, tz))) @ Matrix.Rotation(math.radians(90), 3, 'Y').to_4x4()
        add_cylinder(bm, radius1=0.355, radius2=0.355, depth=0.20, segments=36, matrix=m_tub, cap_ends=False, mat_idx=0)

    obj = create_mesh_object("CHASSIS_WheelTubs_And_Floor", col, [mats["Chassis_Underbody"]], bm, bevel_w=0.0, auto_smooth=45.0, subsurf_lvl=1)
    return obj


# ─── 8. Optical Dielectric Tinted Safety Glasshouse ───────────────────────────
def build_greenhouse_glass(col, mats):
    """
    Constructs the optical dielectric tinted glasshouse fitting directly into unibody apertures:
    - Compound raked windshield (cowl to header)
    - Fastback rear backlite
    - Framed side door glass and fixed C-pillar quarter glass
    - High transparency revealing the Sparco carbon bucket interior
    """
    bm = bmesh.new()

    # Front Windshield Glass (Compound curve grid 3x3)
    ws_rows = [
        [Vector((-0.60, -0.52, 0.88)), Vector((0.0, -0.52, 0.89)), Vector((0.60, -0.52, 0.88))],
        [Vector((-0.57, -0.76, 1.18)), Vector((0.0, -0.76, 1.19)), Vector((0.57, -0.76, 1.18))],
        [Vector((-0.55, -1.02, 1.39)), Vector((0.0, -1.02, 1.40)), Vector((0.55, -1.02, 1.39))],
    ]
    for i in range(len(ws_rows) - 1):
        r1, r2 = ws_rows[i], ws_rows[i+1]
        for j in range(2):
            safe_face_new(bm, [bm.verts.new(r1[j]), bm.verts.new(r1[j+1]), bm.verts.new(r2[j+1]), bm.verts.new(r2[j])], mat_idx=0)

    # Rear Backlite Glass (Compound curve grid 3x3)
    rw_rows = [
        [Vector((-0.56, -2.15, 1.38)), Vector((0.0, -2.15, 1.39)), Vector((0.56, -2.15, 1.38))],
        [Vector((-0.60, -2.50, 1.16)), Vector((0.0, -2.50, 1.18)), Vector((0.60, -2.50, 1.16))],
        [Vector((-0.66, -2.80, 0.91)), Vector((0.0, -2.80, 0.92)), Vector((0.66, -2.80, 0.91))],
    ]
    for i in range(len(rw_rows) - 1):
        r1, r2 = rw_rows[i], rw_rows[i+1]
        for j in range(2):
            safe_face_new(bm, [bm.verts.new(r1[j]), bm.verts.new(r1[j+1]), bm.verts.new(r2[j+1]), bm.verts.new(r2[j])], mat_idx=0)

    # Side Windows & C-Pillar Fixed Quarter Glass
    for sign in [-1.0, 1.0]:
        # Front door window
        v1 = bm.verts.new(Vector((sign * 0.78, -0.56, 0.88)))
        v2 = bm.verts.new(Vector((sign * 0.58, -1.02, 1.39)))
        v3 = bm.verts.new(Vector((sign * 0.58, -1.41, 1.42)))
        v4 = bm.verts.new(Vector((sign * 0.78, -1.41, 0.88)))
        safe_face_new(bm, [v1, v2, v3, v4] if sign > 0 else [v1, v4, v3, v2], mat_idx=0)

        # Rear door window
        v5 = bm.verts.new(Vector((sign * 0.78, -1.44, 0.88)))
        v6 = bm.verts.new(Vector((sign * 0.58, -1.44, 1.42)))
        v7 = bm.verts.new(Vector((sign * 0.58, -2.15, 1.38)))
        v8 = bm.verts.new(Vector((sign * 0.78, -2.15, 0.88)))
        safe_face_new(bm, [v5, v6, v7, v8] if sign > 0 else [v5, v8, v7, v6], mat_idx=0)

        # C-Pillar Fixed Quarter Glass
        v9 = bm.verts.new(Vector((sign * 0.78, -2.17, 0.88)))
        v10 = bm.verts.new(Vector((sign * 0.58, -2.17, 1.38)))
        v11 = bm.verts.new(Vector((sign * 0.72, -2.58, 0.91)))
        safe_face_new(bm, [v9, v10, v11] if sign > 0 else [v9, v11, v10], mat_idx=0)

        # Gloss Black Window Surround Molding Trim
        m_trim = Matrix.Translation(Vector((sign * 0.78, -1.50, 0.875)))
        add_box(bm, size=(0.018, 2.15, 0.015), matrix=m_trim, mat_idx=1)

    mat_list = [mats["Glass_Greenhouse"], mats["Trim_GlossBlack"]]
    obj = create_mesh_object("GLASS_Greenhouse", col, mat_list, bm, bevel_w=0.002, auto_smooth=30.0, subsurf_lvl=1)
    return obj


# ─── 9. Articulating 4-Door Architecture ───────────────────────────────────────
def build_doors(col, mats):
    """
    Constructs articulating 4-door assemblies (DOOR_FL, DOOR_FR, DOOR_RL, DOOR_RR):
    - Physical hinge vectors with preserved local origins (export_apply=False)
    - Crisp 3.5mm perimeter shutlines conforming to Coke-bottle waist curvature
    - Alcantara/Leather interior door cards with carbon fiber inserts & red contrast stitching
    """
    doors = {}
    door_specs = [
        ("DOOR_FL",  1.0, -0.520, -1.400, Vector(( 0.865, -0.520, 0.500)), True),
        ("DOOR_FR", -1.0, -0.520, -1.400, Vector((-0.865, -0.520, 0.500)), True),
        ("DOOR_RL",  1.0, -1.420, -2.300, Vector(( 0.865, -1.420, 0.520)), False),
        ("DOOR_RR", -1.0, -1.420, -2.300, Vector((-0.865, -1.420, 0.520)), False),
    ]

    for name, sign, y_start, y_end, hinge_pivot, is_front in door_specs:
        bm = bmesh.new()
        y_f = y_start - hinge_pivot.y
        y_r = y_end - hinge_pivot.y
        dy_mid = (y_f + y_r) * 0.5
        door_len = abs(y_r - y_f)

        # 1. Outer Door Skin with solid flanges (crisp shutlines)
        m_skin = Matrix.Translation(Vector((sign * (0.865 - abs(hinge_pivot.x)), dy_mid, 0.560 - hinge_pivot.z)))
        add_box(bm, size=(0.038, door_len * 0.98, 0.68), matrix=m_skin, mat_idx=0)

        # 2. Flush Lift Door Handle (Dark Miron)
        h_y = y_r + 0.140 if is_front else y_r + 0.160
        m_hnd = Matrix.Translation(Vector((sign * (0.890 - abs(hinge_pivot.x)), h_y, 0.820 - hinge_pivot.z)))
        add_box(bm, size=(0.016, 0.125, 0.026), matrix=m_hnd, mat_idx=1)

        # 3. Interior Alcantara/Leather Door Card
        m_card = Matrix.Translation(Vector((sign * (0.800 - abs(hinge_pivot.x)), dy_mid, 0.540 - hinge_pivot.z)))
        add_box(bm, size=(0.042, door_len * 0.96, 0.620), matrix=m_card, mat_idx=2)

        # 4. Carbon Fiber Accent Strip
        m_cf = Matrix.Translation(Vector((sign * (0.780 - abs(hinge_pivot.x)), dy_mid, 0.740 - hinge_pivot.z)))
        add_box(bm, size=(0.010, door_len * 0.90, 0.030), matrix=m_cf, mat_idx=3)

        bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.002)

        mat_list = [
            mats["CarPaint_RossoCompetizione"], mats["Trim_DarkMiron"],
            mats["Leather_BlackAlcantara"], mats["Carbon_Fiber_Gloss"]
        ]
        obj = create_mesh_object(name, col, mat_list, bm, bevel_w=0.003, auto_smooth=35.0, subsurf_lvl=0)
        obj.location = hinge_pivot
        doors[name] = obj

    return doors["DOOR_FL"], doors["DOOR_FR"], doors["DOOR_RL"], doors["DOOR_RR"]


# ─── 10. Articulating Hood & Rear Decklid ─────────────────────────────────────
def build_hood_and_decklid(col, mats):
    """
    Constructs articulating carbon fiber hood and rear decklid:
    - Clamshell Hood correctly sloped from cowl down to nose (pitch -9.2 deg)
    - Perfectly flush shutlines with front fenders and nose
    - Twin carbon fiber heat extractor vents
    - Rear Decklid correctly sloped down to taillight fascia with integrated ducktail lip spoiler
    """
    # 1. Hood (Bonnet with Dual Heat Extractor Vents)
    hinge_hood = Vector((0.000, -0.520, 0.875))
    bm_hood = bmesh.new()

    y_cowl = -0.520 - hinge_hood.y # 0.0
    y_nose =  0.780 - hinge_hood.y # 1.30
    hood_len = abs(y_nose - y_cowl)
    dy_mid = (y_cowl + y_nose) * 0.5

    # Hood surface correctly pitched forward (-9.2 degrees) so it hugs the front fender line
    pitch_hood = math.radians(-9.2)
    m_hskin = Matrix.Translation(Vector((0.0, dy_mid, -0.095))) @ Matrix.Rotation(pitch_hood, 3, 'X').to_4x4()
    add_box(bm_hood, size=(1.18, hood_len * 0.98, 0.022), matrix=m_hskin, mat_idx=0)

    # Hood Under-pad
    m_pad = m_hskin @ Matrix.Translation(Vector((0.0, 0.0, -0.016)))
    add_box(bm_hood, size=(1.12, hood_len * 0.90, 0.012), matrix=m_pad, mat_idx=1)

    # Dual Carbon Heat Extractor Vents (Left & Right)
    for sign in [1.0, -1.0]:
        vx = sign * 0.320
        m_vent = m_hskin @ Matrix.Translation(Vector((vx, 0.08, 0.012)))
        add_box(bm_hood, size=(0.14, 0.22, 0.016), matrix=m_vent, mat_idx=2)

    mat_hood = [mats["CarPaint_RossoCompetizione"], mats["Plastic_SatinBlack"], mats["Carbon_Fiber_Gloss"]]
    hood_obj = create_mesh_object("HOOD_Bonnet", col, mat_hood, bm_hood, bevel_w=0.003, auto_smooth=32.0, subsurf_lvl=0)
    hood_obj.location = hinge_hood

    # 2. Trunk Decklid
    hinge_trunk = Vector((0.000, -2.820, 0.905))
    bm_trunk = bmesh.new()

    y_fr = -2.820 - hinge_trunk.y # 0.0
    y_rr = -3.760 - hinge_trunk.y # -0.94
    trunk_len = abs(y_rr - y_fr)
    dy_tmid = (y_fr + y_rr) * 0.5

    # Decklid sloped down rearward (+4.8 degrees around X)
    pitch_trunk = math.radians(4.8)
    m_tskin = Matrix.Translation(Vector((0.0, dy_tmid, -0.040))) @ Matrix.Rotation(pitch_trunk, 3, 'X').to_4x4()
    add_box(bm_trunk, size=(1.16, trunk_len * 0.98, 0.022), matrix=m_tskin, mat_idx=0)

    # Integrated Carbon Ducktail Lip Spoiler along trailing edge
    m_lip = m_tskin @ Matrix.Translation(Vector((0.0, -trunk_len * 0.48, 0.016)))
    add_box(bm_trunk, size=(1.14, 0.045, 0.028), matrix=m_lip, mat_idx=2)

    # Chrome Alfa Romeo Script & Quadrifoglio Emblem
    m_badge = m_tskin @ Matrix.Translation(Vector((0.0, -trunk_len * 0.42, 0.012)))
    add_box(bm_trunk, size=(0.16, 0.008, 0.024), matrix=m_badge, mat_idx=3)

    mat_trunk = [mats["CarPaint_RossoCompetizione"], mats["Plastic_SatinBlack"], mats["Carbon_Fiber_Gloss"], mats["Trim_Chrome"]]
    trunk_obj = create_mesh_object("TRUNK_Decklid", col, mat_trunk, bm_trunk, bevel_w=0.003, auto_smooth=32.0, subsurf_lvl=0)
    trunk_obj.location = hinge_trunk

    return hood_obj, trunk_obj


# ─── 11. 2.9L Twin-Turbo 90° V6 Powertrain & Bay ──────────────────────────────
def build_powertrain_and_bay(col, mats):
    """
    Constructs the Ferrari-developed 2.9L Twin-Turbo 90° V6 powertrain:
    - Twin aluminum cylinder heads and crinkle carbon intake plenums with Alfa Romeo script
    - Twin turbochargers mounted outboard with heat shielding
    - Titanium front strut tower cross-brace
    - Crossflow front cooling pack with suction fans
    """
    bm = bmesh.new()
    bay_y = 0.260
    bay_z = 0.540

    # 90° V6 Engine Block Core
    m_blk = Matrix.Translation(Vector((0.0, bay_y, bay_z)))
    add_box(bm, size=(0.54, 0.62, 0.40), matrix=m_blk, mat_idx=0)

    # Twin Carbon Intake Plenums (Left & Right 45° banks)
    for sign in [1.0, -1.0]:
        m_plen = Matrix.Translation(Vector((sign * 0.15, bay_y, bay_z + 0.20)))
        add_box(bm, size=(0.16, 0.54, 0.10), matrix=m_plen, mat_idx=1)

    # Carbon Fiber Engine Appearance Cover with Red Lettering
    m_cov = Matrix.Translation(Vector((0.0, bay_y - 0.02, bay_z + 0.26)))
    add_box(bm, size=(0.48, 0.50, 0.035), matrix=m_cov, mat_idx=1)

    # Titanium Front Strut Tower Cross-Brace
    m_brace = Matrix.Translation(Vector((0.0, 0.000, 0.780)))
    add_box(bm, size=(1.34, 0.032, 0.022), matrix=m_brace, mat_idx=2)

    # Twin Outboard Turbochargers
    for sign in [1.0, -1.0]:
        m_turbo = Matrix.Translation(Vector((sign * 0.34, bay_y - 0.14, bay_z - 0.06))) @ Matrix.Rotation(math.radians(90), 3, 'Y').to_4x4()
        add_cylinder(bm, radius1=0.068, radius2=0.064, depth=0.10, segments=20, matrix=m_turbo, mat_idx=3)

    # Front Radiator Cooling Pack & Fans
    m_rad = Matrix.Translation(Vector((0.0, 0.740, 0.480)))
    add_box(bm, size=(0.72, 0.05, 0.42), matrix=m_rad, mat_idx=0)
    for sign in [1.0, -1.0]:
        m_fan = Matrix.Translation(Vector((sign * 0.18, 0.700, 0.480))) @ Matrix.Rotation(math.radians(90), 3, 'Y').to_4x4()
        add_cylinder(bm, radius1=0.15, radius2=0.15, depth=0.028, segments=24, matrix=m_fan, mat_idx=4)

    mat_list = [
        mats["Engine_Alloy_Plenum"], mats["Carbon_Fiber_Gloss"], mats["Engine_Aluminum_Brace"],
        mats["Exhaust_Stainless"], mats["Plastic_SatinBlack"]
    ]
    obj = create_mesh_object("POWERTRAIN_Engine_Bay", col, mat_list, bm, bevel_w=0.003, auto_smooth=35.0, subsurf_lvl=2)
    return obj


# ─── 12. Sparco Carbon Racing Bucket Cockpit ──────────────────────────────────
def build_sparco_cockpit(col, mats):
    """
    Constructs the driver-focused Italian sports cockpit:
    - Sparco carbon fiber racing bucket seats with Alcantara centers & red stitching
    - Flat-bottom sport steering wheel with bright RED start button & column aluminum paddles
    - Cannocchiale binocular hooded instrument binnacle
    - Carbon fiber center console with Alfa DNA Pro rotary controller & shifter
    """
    bm = bmesh.new()

    # Front Sparco Carbon Racing Bucket Seats (Driver & Passenger)
    for sign in [1.0, -1.0]:
        sx = sign * 0.360
        sy = -1.120
        sz = 0.420

        # Seat cushion with Alcantara flute
        m_cush = Matrix.Translation(Vector((sx, sy, sz)))
        add_box(bm, size=(0.48, 0.52, 0.15), matrix=m_cush, mat_idx=0)

        # Contoured Upper Backrest (Raked 16 degrees rearward)
        m_back = Matrix.Translation(Vector((sx, sy - 0.20, sz + 0.35))) @ Matrix.Rotation(math.radians(16), 3, 'X').to_4x4()
        add_box(bm, size=(0.46, 0.12, 0.60), matrix=m_back, mat_idx=0)

        # Carbon Fiber Monocoque Shell Backing
        m_shell = Matrix.Translation(Vector((sx, sy - 0.26, sz + 0.35))) @ Matrix.Rotation(math.radians(16), 3, 'X').to_4x4()
        add_box(bm, size=(0.48, 0.03, 0.62), matrix=m_shell, mat_idx=1)

        # High Lateral Thigh & Torso Bolsters
        for b_sign in [1.0, -1.0]:
            m_bolst = Matrix.Translation(Vector((sx + b_sign * 0.21, sy - 0.18, sz + 0.32)))
            add_box(bm, size=(0.07, 0.16, 0.52), matrix=m_bolst, mat_idx=0)

        # Integrated Headrest with Embossed Quadrifoglio Logo
        m_head = Matrix.Translation(Vector((sx, sy - 0.30, sz + 0.72)))
        add_box(bm, size=(0.26, 0.10, 0.16), matrix=m_head, mat_idx=0)

    # Rear Sport Bench Seat
    m_rear_c = Matrix.Translation(Vector((0.0, -2.100, 0.460)))
    add_box(bm, size=(1.34, 0.54, 0.15), matrix=m_rear_c, mat_idx=0)
    m_rear_b = Matrix.Translation(Vector((0.0, -2.360, 0.760))) @ Matrix.Rotation(math.radians(18), 3, 'X').to_4x4()
    add_box(bm, size=(1.32, 0.12, 0.56), matrix=m_rear_b, mat_idx=0)

    # Carbon Fiber Center Console & DNA Rotary Dial
    m_tun = Matrix.Translation(Vector((0.0, -1.200, 0.400)))
    add_box(bm, size=(0.24, 1.35, 0.20), matrix=m_tun, mat_idx=1)
    # DNA Pro Rotary Controller
    m_dna = Matrix.Translation(Vector((-0.05, -1.050, 0.520)))
    add_cylinder(bm, radius1=0.026, radius2=0.026, depth=0.018, segments=20, matrix=m_dna, mat_idx=2)
    # Gear Selector Lever
    m_shifter = Matrix.Translation(Vector((0.0, -0.900, 0.580)))
    add_cylinder(bm, radius1=0.020, radius2=0.018, depth=0.11, segments=16, matrix=m_shifter, mat_idx=2)

    # Cannocchiale Binocular Hooded Dashboard
    m_dash = Matrix.Translation(Vector((0.0, -0.660, 0.760)))
    add_box(bm, size=(1.44, 0.40, 0.26), matrix=m_dash, mat_idx=0)
    m_cf_dash = Matrix.Translation(Vector((0.0, -0.640, 0.700)))
    add_box(bm, size=(1.40, 0.02, 0.05), matrix=m_cf_dash, mat_idx=1)

    # Flat-Bottom Sport Steering Wheel (Driver side LHD X = 0.360m)
    st_center = Vector((0.360, -0.800, 0.720))
    m_st = Matrix.Translation(st_center) @ Matrix.Rotation(math.radians(-22), 3, 'X').to_4x4()
    add_torus(bm, r_major=0.165, r_minor=0.015, seg_maj=32, seg_min=12, matrix=m_st, mat_idx=0)
    add_cylinder(bm, radius1=0.046, radius2=0.044, depth=0.032, segments=24, matrix=m_st, mat_idx=0)

    # Bright RED Engine Start Button on Steering Wheel Spoke
    m_btn = Matrix.Translation(st_center + Vector((-0.035, 0.015, -0.025)))
    add_cylinder(bm, radius1=0.012, radius2=0.012, depth=0.008, segments=16, matrix=m_btn, mat_idx=3)

    # Giant Column-Mounted Aluminum Shift Paddles
    for p_sign in [1.0, -1.0]:
        m_pad = Matrix.Translation(st_center + Vector((p_sign * 0.13, 0.025, 0.035)))
        add_box(bm, size=(0.020, 0.008, 0.095), matrix=m_pad, mat_idx=2)

    mat_list = [
        mats["Leather_BlackAlcantara"], mats["Carbon_Fiber_Gloss"],
        mats["Trim_DarkMiron"], mats["Badge_Red_StartBtn"]
    ]
    obj = create_mesh_object("INTERIOR_Sparco_Cockpit", col, mat_list, bm, bevel_w=0.003, auto_smooth=35.0, subsurf_lvl=2)
    return obj


# ─── 13. 19-Inch 5-Hole Tele-Dial Alloy Wheels & Pirelli Radials ──────────────
def build_wheels_and_brakes(col, mats):
    """
    Constructs iconic 19-inch 5-hole Tele-Dial forged alloy wheels & Pirelli P Zero Corsa tires:
    - 5 circular telephone-dial negative cutouts in technical grey
    - 390mm carbon ceramic cross-drilled brake rotors
    - Rosso Alfa 6-piston Brembo monobloc calipers with white Alfa Romeo script
    """
    wheel_objects = []
    f_axle = 0.000
    r_axle = -2.820
    f_track = 1.555
    r_track = 1.607
    wheel_r = 0.327
    rim_r = 0.241  # 19-inch rim radius
    tire_w = 0.245

    wheel_configs = [
        ("Wheel_FL", Vector(( f_track * 0.5, f_axle, wheel_r)), True,  0.245),
        ("Wheel_FR", Vector((-f_track * 0.5, f_axle, wheel_r)), False, 0.245),
        ("Wheel_RL", Vector(( r_track * 0.5, r_axle, wheel_r)), True,  0.285),
        ("Wheel_RR", Vector((-r_track * 0.5, r_axle, wheel_r)), False, 0.285),
    ]

    for name, pos, is_left, tw in wheel_configs:
        sign = 1.0 if is_left else -1.0
        m_base = Matrix.Translation(pos) @ Matrix.Rotation(math.radians(90.0 if is_left else -90.0), 3, 'Y').to_4x4()

        # 1. Pirelli P Zero Corsa Radial Tire with Siped Tread
        bm_tire = bmesh.new()
        add_cylinder(bm_tire, radius1=wheel_r, radius2=wheel_r, depth=tw, segments=48, matrix=m_base, cap_ends=False, mat_idx=0)
        for side_z in [-tw * 0.5, tw * 0.5]:
            m_sw = m_base @ Matrix.Translation(Vector((0, 0, side_z)))
            add_annulus(bm_tire, r_outer=wheel_r, r_inner=rim_r, depth=0.012, segments=48, matrix=m_sw, mat_idx=0)
        # 36 carved directional tread sipes
        for s_idx in range(36):
            th = 2.0 * math.pi * s_idx / 36.0
            sx = math.cos(th) * wheel_r * 0.998
            sy = math.sin(th) * wheel_r * 0.998
            m_sipe = m_base @ Matrix.Translation(Vector((sx, sy, 0))) @ Matrix.Rotation(th, 3, 'Z').to_4x4()
            add_box(bm_tire, size=(0.005, 0.026, tw * 0.92), matrix=m_sipe, mat_idx=0)

        tire_obj = create_mesh_object(name + "_Tire", col, [mats["Tire_PZero_Rubber"]], bm_tire, bevel_w=0.003, auto_smooth=45.0, subsurf_lvl=1)

        # 2. 19-Inch 5-Hole Tele-Dial Forged Alloy Rim
        bm_rim = bmesh.new()
        add_annulus(bm_rim, r_outer=rim_r, r_inner=rim_r - 0.024, depth=tw * 0.85, segments=52, matrix=m_base, mat_idx=0)
        m_lip = m_base @ Matrix.Translation(Vector((0, 0, tw * 0.42)))
        add_annulus(bm_rim, r_outer=rim_r, r_inner=rim_r - 0.014, depth=0.016, segments=52, matrix=m_lip, mat_idx=0)

        # Face plate with 5 Tele-Dial Circular Cutouts
        m_face = m_base @ Matrix.Translation(Vector((0, 0, tw * 0.38)))
        add_annulus(bm_rim, r_outer=rim_r - 0.014, r_inner=0.065, depth=0.016, segments=52, matrix=m_face, mat_idx=0)
        # 5 Phone-dial relief bosses
        for h_i in range(5):
            th = 2.0 * math.pi * h_i / 5.0
            hx = math.cos(th) * 0.138
            hy = math.sin(th) * 0.138
            m_hole = m_face @ Matrix.Translation(Vector((hx, hy, 0.005)))
            add_cylinder(bm_rim, radius1=0.038, radius2=0.038, depth=0.020, segments=20, matrix=m_hole, mat_idx=0)

        # Center Lug Bowl & Alfa Romeo Heritage Center Cap
        add_cylinder(bm_rim, radius1=0.065, radius2=0.058, depth=0.030, segments=28, matrix=m_face, mat_idx=0)
        m_cap = m_face @ Matrix.Translation(Vector((0, 0, 0.012)))
        add_cylinder(bm_rim, radius1=0.034, radius2=0.034, depth=0.008, segments=24, matrix=m_cap, mat_idx=1)

        rim_obj = create_mesh_object(name + "_Rim", col, [mats["Wheel_TechnicalGrey"], mats["Trim_DarkMiron"]], bm_rim, bevel_w=0.002, auto_smooth=35.0, subsurf_lvl=2)

        # 3. 390mm Carbon Ceramic Brake Disc
        bm_brake = bmesh.new()
        rotor_r = 0.195
        add_annulus(bm_brake, r_outer=rotor_r, r_inner=0.095, depth=0.030, segments=48, matrix=m_base, mat_idx=0)
        add_annulus(bm_brake, r_outer=rotor_r - 0.005, r_inner=0.100, depth=0.012, segments=48, matrix=m_base, mat_idx=0)
        rotor_obj = create_mesh_object(name + "_BrakeDisc", col, [mats["Brake_CarbonCeramic"]], bm_brake, bevel_w=0.0, auto_smooth=45.0, subsurf_lvl=1)

        # 4. Rosso Alfa 6-Piston Brembo Caliper
        bm_cal = bmesh.new()
        m_cal = m_base @ Matrix.Translation(Vector((0.145, 0.055, tw * 0.18)))
        add_box(bm_cal, size=(0.135, 0.210, 0.070), matrix=m_cal, mat_idx=0)
        cal_obj = create_mesh_object(name + "_Caliper", col, [mats["Brake_RossoBrembo"]], bm_cal, bevel_w=0.003, auto_smooth=35.0, subsurf_lvl=2)

        wheel_objects.extend([tire_obj, rim_obj, rotor_obj, cal_obj])

    return wheel_objects


# ─── 14. 10 Semantic Audio-Haptic Hitboxes ─────────────────────────────────────
def build_hitboxes(col, mats):
    """Constructs 10 semantic audio-haptic collision hitboxes with extras metadata."""
    hitbox_defs = [
        ("HITBOX_DOOR_FL",  Vector(( 0.865, -0.880, 0.650)), (0.24, 0.92, 0.74), "door_italian_click", "medium"),
        ("HITBOX_DOOR_FR",  Vector((-0.865, -0.880, 0.650)), (0.24, 0.92, 0.74), "door_italian_click", "medium"),
        ("HITBOX_DOOR_RL",  Vector(( 0.865, -1.850, 0.650)), (0.24, 0.90, 0.74), "door_italian_click", "medium"),
        ("HITBOX_DOOR_RR",  Vector((-0.865, -1.850, 0.650)), (0.24, 0.90, 0.74), "door_italian_click", "medium"),
        ("HITBOX_HOOD",     Vector(( 0.000,  0.220, 0.780)), (1.30, 1.15, 0.18), "carbon_hood_pop", "heavy"),
        ("HITBOX_TRUNK",    Vector(( 0.000, -3.300, 0.860)), (1.28, 0.60, 0.20), "trunk_pneumatic_pop", "medium"),
        ("HITBOX_WHEEL_FL", Vector(( 0.777,  0.000, 0.327)), (0.32, 0.68, 0.68), "corsa_rubber_thud", "light"),
        ("HITBOX_WHEEL_FR", Vector((-0.777,  0.000, 0.327)), (0.32, 0.68, 0.68), "corsa_rubber_thud", "light"),
        ("HITBOX_CABIN",    Vector(( 0.000, -1.410, 0.920)), (1.44, 1.88, 0.82), "alcantara_creak", "light"),
        ("HITBOX_ENGINE",   Vector(( 0.000,  0.260, 0.540)), (0.80, 0.90, 0.52), "v6_biturbo_mechanical", "heavy"),
    ]

    mat_hb = mats["Material_Hitbox_Invisible"]
    for name, loc, size, sfx, haptic in hitbox_defs:
        bm = bmesh.new()
        add_box(bm, size=size, matrix=Matrix.Translation(loc), mat_idx=0)
        obj = create_mesh_object(name, col, [mat_hb], bm, bevel_w=0.0, auto_smooth=30.0, subsurf_lvl=0)
        obj["interactive"] = True
        obj["sound_fx"] = sfx
        obj["haptic"] = haptic
        obj.display_type = 'WIRE'
        obj.hide_viewport = True
        obj.hide_render = True


# ─── 15. Standardized glTF Cameras ─────────────────────────────────────────────
def build_cameras(col):
    """Installs standardized inspection cameras for automotive assessment."""
    cams = [
        ("CAMERA_HERO_34", Vector(( 5.0,  5.0, 1.60)), Vector((0.0, -1.4, 0.65)), 50.0),
        ("CAMERA_REAR_34", Vector(( 5.0, -5.0, 1.60)), Vector((0.0, -1.4, 0.65)), 50.0),
        ("CAMERA_SIDE",    Vector(( 7.0, -1.4, 0.80)), Vector((0.0, -1.4, 0.65)), 55.0),
        ("CAMERA_COCKPIT", Vector(( 0.36, -1.12, 1.12)), Vector((0.36, -0.60, 0.82)), 28.0),
    ]
    for name, loc, target, focal in cams:
        cam_data = bpy.data.cameras.new(name)
        cam_data.lens = focal
        cam_obj = bpy.data.objects.new(name, cam_data)
        cam_obj.location = loc
        dir_v = (target - loc).normalized()
        cam_obj.rotation_euler = dir_v.to_track_quat('-Z', 'Y').to_euler()
        col.objects.link(cam_obj)


# ─── 16. Baked Keyframed NLA Actions ───────────────────────────────────────────
def bake_nla_actions(door_fl, door_fr, door_rl, door_rr, hood_obj, trunk_obj, wheel_objs):
    """Bakes physical kinematic NLA actions for interactive door, hood & trunk articulation."""
    bpy.context.scene.frame_start = 1
    bpy.context.scene.frame_end = 40

    def bake_rotation(obj, action_name, axis, angle_deg):
        act = bpy.data.actions.new(name=action_name)
        obj.animation_data_create()
        obj.animation_data.action = act
        obj.rotation_euler = (0, 0, 0)
        obj.keyframe_insert(data_path="rotation_euler", frame=1)
        rot = [0.0, 0.0, 0.0]
        if axis == 'Z':
            rot[2] = math.radians(angle_deg)
        elif axis == 'X':
            rot[0] = math.radians(angle_deg)
        elif axis == 'Y':
            rot[1] = math.radians(angle_deg)
        obj.rotation_euler = tuple(rot)
        obj.keyframe_insert(data_path="rotation_euler", frame=40)
        obj.rotation_euler = (0, 0, 0)

    bake_rotation(door_fl, "Action_Door_FL_Open", 'Z',  52.0)
    bake_rotation(door_fr, "Action_Door_FR_Open", 'Z', -52.0)
    bake_rotation(door_rl, "Action_Door_RL_Open", 'Z',  50.0)
    bake_rotation(door_rr, "Action_Door_RR_Open", 'Z', -50.0)
    bake_rotation(hood_obj, "Action_Hood_Open",    'X', -48.0)
    bake_rotation(trunk_obj, "Action_Trunk_Open",  'X',  46.0)


# ─── 17. Master Assembly Pipeline ──────────────────────────────────────────────
def generate_giulia_quadrifoglio_master():
    """Master procedural assembly pipeline for Alfa Romeo Giulia Quadrifoglio (Tipo 952)."""
    print("=" * 80)
    print("STARTING CLASS-A MASTER CAD GENERATION: ALFA ROMEO GIULIA QUADRIFOGLIO (2010s SEDAN)")
    print("=" * 80)

    clean_scene()

    col_master = bpy.data.collections.new("Giulia_Quadrifoglio_Master")
    bpy.context.scene.collection.children.link(col_master)

    print("▸ Building 24 Authentic PBR Materials...")
    mats = build_materials()

    print("▸ Building Watertight Class-A Unibody Shell with Carbon Roof & Aperture Cutouts...")
    body_obj = build_unibody_watertight(col_master, mats)

    print("▸ Building Inverted Triangular Scudetto Shield & Trilobo Grilles...")
    grille_obj = build_scudetto_grille(col_master, mats)

    print("▸ Building Feline Bi-Xenon Headlamps & Hooked J-Blade LED DRLs...")
    light_obj = build_lighting_optics(col_master, mats)

    print("▸ Building Active Carbon Aero Splitter, Diffuser & Quad Staggered Exhausts...")
    aero_obj = build_aerodynamics(col_master, mats)

    print("▸ Building Chassis Flat Undertray Belly Pan & Inner Wheel Tubs...")
    chassis_obj = build_chassis_and_wheel_tubs(col_master, mats)

    print("▸ Building Optical Dielectric Tinted Safety Glasshouse...")
    glass_obj = build_greenhouse_glass(col_master, mats)

    print("▸ Building Articulating 4-Door Architecture & Alcantara Door Cards...")
    door_fl, door_fr, door_rl, door_rr = build_doors(col_master, mats)

    print("▸ Building Articulating Contoured Carbon Hood & Rear Decklid with Ducktail Spoiler...")
    hood_obj, trunk_obj = build_hood_and_decklid(col_master, mats)

    print("▸ Building 2.9L Twin-Turbo 90° V6 Powertrain & Engine Bay...")
    pwt_obj = build_powertrain_and_bay(col_master, mats)

    print("▸ Building Sparco Carbon Cockpit, Red Start Button & Aluminum Paddles...")
    cockpit_obj = build_sparco_cockpit(col_master, mats)

    print("▸ Building 19-Inch 5-Hole Tele-Dial Wheels & Pirelli P Zero Corsa Radials...")
    wheel_objs = build_wheels_and_brakes(col_master, mats)

    print("▸ Building 10 Semantic Audio-Haptic Hitboxes...")
    build_hitboxes(col_master, mats)

    print("▸ Building Standardized glTF Cameras...")
    build_cameras(col_master)

    print("▸ Baking 6 Keyframed NLA Actions...")
    bake_nla_actions(door_fl, door_fr, door_rl, door_rr, hood_obj, trunk_obj, wheel_objs)

    # Pre-export modifier baking protocol
    print("Executing pre-export modifier baking protocol...")
    for obj in list(col_master.all_objects):
        if obj.type == 'MESH':
            bpy.context.view_layer.objects.active = obj
            for mod in list(obj.modifiers):
                if mod.type in ['BEVEL', 'SUBSURF', 'WEIGHTED_NORMAL']:
                    try:
                        bpy.ops.object.modifier_apply(modifier=mod.name)
                    except Exception as e:
                        print(f"    [WARN] Modifier apply error on {obj.name}: {e}")

    total_tris = sum(len(o.data.polygons) * 2 for o in col_master.all_objects if o.type == 'MESH')
    print(f"[Giulia Quadrifoglio] Evaluated Class-A CAD Geometry: {total_tris:,} triangles across {len(col_master.all_objects)} objects.")

    # Export paths
    export_dir = "e:/Car_Automation/public/models/vehicles/sedan/2010s"
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
        export_apply=False,
        export_extras=True,
        export_yup=True,
        export_animations=True,
        export_animation_mode='ACTIONS',
        export_cameras=True,
        export_lights=False
    )

    size_mb = os.path.getsize(glb_main) / (1024 * 1024)
    print(f"✅ Exported vehicle.glb successfully! File size: {size_mb:.2f} MB")

    mirrors = [
        "e:/Car_Automation/public/models/Car_Alfa_Romeo_Giulia_Quadrifoglio_2010s.glb",
        "e:/Car_Automation/public/models/Car_Alfa_Romeo_Giulia_Quadrifoglio_Complete.glb",
        "e:/Car_Automation/exports/Car_Alfa_Romeo_Giulia_Quadrifoglio_2010s.glb",
        "e:/Car_Automation/exports/Car_Alfa_Romeo_Giulia_Quadrifoglio_Complete.glb",
    ]
    for m in mirrors:
        shutil.copy2(glb_main, m)
        print(f"  ▸ Mirrored to: {m}")

    print("▸ Generating companion Meshopt compressed asset (vehicle.opt.glb)...")
    try:
        cmd = f'npx -y gltfpack -i "{glb_main}" -o "{glb_opt}" -cc -kn -km -ke'
        res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        if os.path.exists(glb_opt):
            opt_mb = os.path.getsize(glb_opt) / (1024 * 1024)
            print(f"✅ Meshopt companion generated! File size: {opt_mb:.2f} MB")
            for m in mirrors:
                opt_m = m.replace(".glb", ".opt.glb")
                shutil.copy2(glb_opt, opt_m)
        else:
            print(f"⚠️ gltfpack did not create {glb_opt}: {res.stderr}")
    except Exception as e:
        print(f"⚠️ gltfpack execution error: {e}")

    print("=" * 80)
    print("ALFA ROMEO GIULIA QUADRIFOGLIO MASTER CAD PIPELINE COMPLETED")
    print("=" * 80)
    return glb_main


if __name__ == "__main__":
    generate_giulia_quadrifoglio_master()
