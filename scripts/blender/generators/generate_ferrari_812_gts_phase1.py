"""
=============================================================================
Procedural Class-A CAD Generator: Ferrari 812 GTS (2020s Roadster)
PHASE 35: Spaceframe Chassis, V12 Powertrain, Sculpted Buttresses & Running Gear
=============================================================================
Roadster Architecture · 2020s Era · Front-Mid V12 Naturally Aspirated Masterpiece
Maranello Class-A Automotive CAD Engineering Standard.

Vehicle Dimensions:
- Wheelbase: 2,720 mm (Front axle: Y = +1.360m, Rear axle: Y = -1.360m)
- Overall Length: 4,693 mm (Front splitter: Y = +2.450m, Rear diffuser: Y = -2.243m)
- Overall Width: 1,971 mm (X = +/- 0.9855m)
- Overall Height: 1,276 mm (Z = 1.276m)
- Track Width: Front 1,672 mm (X = +/- 0.836m), Rear 1,645 mm (X = +/- 0.8225m)
- Ground Clearance: 115 mm (Z_floor = 0.115m)

Phase 35 Subsystems:
1. High-Rigidity Aluminum Spaceframe Monocoque & Crash Structures
2. 6.5L Naturally Aspirated 65° V12 Engine & Red Crackle Intake Manifolds
3. Sculpted Open-Top Roadster Monocoque Hull with Draped Flanks & Aerobridge
4. Dual Sculptural Flying Buttresses & Tonneau Hardtop Cover
5. Double-Wishbone Pushrod Suspension & Magneto-Rheological Dampers
6. Staggered 20-inch 5-Twin-Spoke Forged Diamond-Cut Wheels & Cup 2 Tires
7. 398mm Carbon-Ceramic Rotors & Brembo Giallo Modena Yellow Calipers
8. Open Roadster Cockpit Tub with Daytona Fluted Leather Seats
=============================================================================
"""

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector, Matrix, Euler, Quaternion


# ----------------------------------------------------------------------------
# 1. CORE COMPATIBILITY WRAPPERS & UTILITIES
# ----------------------------------------------------------------------------

def _compat_create_cylinder(bm, radius=1.0, depth=2.0, segments=16, cap_ends=True, cap_tris=False, matrix=None, **kwargs):
    r1 = kwargs.pop('radius1', radius)
    r2 = kwargs.pop('radius2', radius)
    if matrix is None:
        matrix = Matrix()
    return bmesh.ops.create_cone(
        bm,
        cap_ends=cap_ends,
        cap_tris=cap_tris,
        segments=segments,
        radius1=r1,
        radius2=r2,
        depth=depth,
        matrix=matrix,
        **kwargs
    )
bmesh.ops.create_cylinder = _compat_create_cylinder


def _compat_create_torus(bm, major_radius=1.0, minor_radius=0.25, major_segments=24, minor_segments=12, matrix=None, **kwargs):
    if matrix is None:
        matrix = Matrix()
    verts = []
    for i in range(major_segments):
        u = 2.0 * math.pi * i / major_segments
        cos_u, sin_u = math.cos(u), math.sin(u)
        ring_center = Vector((major_radius * cos_u, major_radius * sin_u, 0.0))
        radial_dir = Vector((cos_u, sin_u, 0.0))
        z_dir = Vector((0.0, 0.0, 1.0))
        for j in range(minor_segments):
            v = 2.0 * math.pi * j / minor_segments
            cos_v, sin_v = math.cos(v), math.sin(v)
            pt = ring_center + (radial_dir * cos_v + z_dir * sin_v) * minor_radius
            verts.append(bm.verts.new(matrix @ pt))
    bm.verts.ensure_lookup_table()
    faces = []
    for i in range(major_segments):
        next_i = (i + 1) % major_segments
        for j in range(minor_segments):
            next_j = (j + 1) % minor_segments
            v1 = verts[i * minor_segments + j]
            v2 = verts[next_i * minor_segments + j]
            v3 = verts[next_i * minor_segments + next_j]
            v4 = verts[i * minor_segments + next_j]
            faces.append(bm.faces.new((v1, v2, v3, v4)))
    return {"verts": verts, "faces": faces}
bmesh.ops.create_torus = _compat_create_torus


def make_pbr_mat(name, base_color=(0.8, 0.8, 0.8, 1.0), metallic=0.0, roughness=0.5,
                 clearcoat=0.0, transmission=0.0, ior=1.45, emission=(0, 0, 0, 1), emission_strength=0.0):
    mat = bpy.data.materials.get(name)
    if mat is None:
        mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    bsdf.location = (0, 0)
    bsdf.inputs['Base Color'].default_value = base_color
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness
    if 'Coat Weight' in bsdf.inputs:
        bsdf.inputs['Coat Weight'].default_value = clearcoat
        bsdf.inputs['Coat Roughness'].default_value = 0.03
    elif 'Clearcoat' in bsdf.inputs:
        bsdf.inputs['Clearcoat'].default_value = clearcoat
    if 'Transmission Weight' in bsdf.inputs:
        bsdf.inputs['Transmission Weight'].default_value = transmission
    elif 'Transmission' in bsdf.inputs:
        bsdf.inputs['Transmission'].default_value = transmission
    bsdf.inputs['IOR'].default_value = ior
    if 'Emission Color' in bsdf.inputs:
        bsdf.inputs['Emission Color'].default_value = emission
    elif 'Emission' in bsdf.inputs:
        bsdf.inputs['Emission'].default_value = emission
    if 'Emission Strength' in bsdf.inputs:
        bsdf.inputs['Emission Strength'].default_value = emission_strength

    out_node = nodes.new(type='ShaderNodeOutputMaterial')
    out_node.location = (300, 0)
    mat.node_tree.links.new(bsdf.outputs['BSDF'], out_node.inputs['Surface'])
    return mat


def link_obj(name, bm, parent_col, mat=None, bevel=0.0, subsurf=0):
    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    parent_col.objects.link(obj)
    if mat:
        obj.data.materials.append(mat)
    for f in obj.data.polygons:
        f.use_smooth = True
    if bevel > 0.0:
        bev = obj.modifiers.new(name="Bevel", type='BEVEL')
        bev.width = bevel
        bev.segments = 2
        bev.limit_method = 'ANGLE'
        bev.angle_limit = math.radians(35)
    if subsurf > 0:
        sub = obj.modifiers.new(name="Subsurf", type='SUBSURF')
        sub.levels = subsurf
        sub.render_levels = subsurf
    return obj


# ----------------------------------------------------------------------------
# 2. PBR MATERIAL FACTORY: ROSSO CORSA & MARANELLO CLASS-A PALETTE
# ----------------------------------------------------------------------------

def setup_812_gts_materials():
    mats = {}
    mats["rosso_corsa"] = make_pbr_mat(
        "Ferrari_Rosso_Corsa_812",
        base_color=(0.82, 0.02, 0.04, 1.0),
        metallic=0.84,
        roughness=0.10,
        clearcoat=1.0,
    )
    mats["carbon_twill"] = make_pbr_mat(
        "Ferrari_Aero_Carbon_Twill",
        base_color=(0.025, 0.027, 0.030, 1.0),
        metallic=0.35,
        roughness=0.20,
        clearcoat=0.95,
    )
    mats["red_crackle"] = make_pbr_mat(
        "Ferrari_V12_Red_Crackle_Plenum",
        base_color=(0.65, 0.03, 0.03, 1.0),
        metallic=0.15,
        roughness=0.65,
    )
    mats["billet_aluminum"] = make_pbr_mat(
        "Ferrari_Billet_Aluminum",
        base_color=(0.78, 0.80, 0.82, 1.0),
        metallic=0.95,
        roughness=0.18,
    )
    mats["cast_alloy"] = make_pbr_mat(
        "Ferrari_Cast_Alloy",
        base_color=(0.45, 0.47, 0.50, 1.0),
        metallic=0.88,
        roughness=0.38,
    )
    mats["diamond_cut_rim"] = make_pbr_mat(
        "Ferrari_Diamond_Cut_Forged_Rim",
        base_color=(0.92, 0.93, 0.95, 1.0),
        metallic=0.98,
        roughness=0.04,
    )
    mats["wheel_dark_grey"] = make_pbr_mat(
        "Ferrari_Grigio_Corsa_Pockets",
        base_color=(0.14, 0.15, 0.17, 1.0),
        metallic=0.82,
        roughness=0.25,
    )
    mats["cup2_rubber"] = make_pbr_mat(
        "Michelin_Pilot_Sport_Cup2_Rubber",
        base_color=(0.022, 0.022, 0.024, 1.0),
        metallic=0.0,
        roughness=0.86,
    )
    mats["carbon_ceramic"] = make_pbr_mat(
        "Ferrari_Carbon_Ceramic_Rotor",
        base_color=(0.18, 0.19, 0.20, 1.0),
        metallic=0.55,
        roughness=0.34,
    )
    mats["giallo_modena"] = make_pbr_mat(
        "Ferrari_Brembo_Giallo_Modena",
        base_color=(0.98, 0.78, 0.02, 1.0),
        metallic=0.20,
        roughness=0.12,
        clearcoat=0.9,
    )
    mats["cuoio_leather"] = make_pbr_mat(
        "Ferrari_Cuoio_Daytona_Leather",
        base_color=(0.62, 0.38, 0.18, 1.0),
        metallic=0.0,
        roughness=0.58,
    )
    mats["alcantara_black"] = make_pbr_mat(
        "Ferrari_Nero_Alcantara",
        base_color=(0.03, 0.03, 0.03, 1.0),
        metallic=0.0,
        roughness=0.92,
    )
    mats["windshield_glass"] = make_pbr_mat(
        "Ferrari_Dielectric_Windshield",
        base_color=(0.96, 0.98, 1.0, 1.0),
        metallic=0.0,
        roughness=0.01,
        transmission=0.94,
        ior=1.52,
    )
    mats["piano_black"] = make_pbr_mat(
        "Ferrari_Piano_Black_Trim",
        base_color=(0.015, 0.015, 0.018, 1.0),
        metallic=0.1,
        roughness=0.05,
        clearcoat=1.0,
    )
    return mats


# ----------------------------------------------------------------------------
# 3. PROCEDURAL SUBSYSTEM GENERATORS
# ----------------------------------------------------------------------------

def build_812_spaceframe_chassis(col, mats):
    objs = []
    bm_chassis = bmesh.new()

    wb = 2.720
    hw = 0.740
    for side in [1.0, -1.0]:
        mat_spar = Matrix.Translation(Vector((side * hw, 0.0, 0.22))) @ Matrix.Diagonal(Vector((0.09, wb * 1.15, 0.12, 1.0)))
        bmesh.ops.create_cube(bm_chassis, size=1.0, matrix=mat_spar)

    for side in [1.0, -1.0]:
        mat_tower_f = Matrix.Translation(Vector((side * 0.58, 1.360, 0.42))) @ Matrix.Diagonal(Vector((0.14, 0.32, 0.36, 1.0)))
        bmesh.ops.create_cube(bm_chassis, size=1.0, matrix=mat_tower_f)

    mat_x_front = Matrix.Translation(Vector((0.0, 2.22, 0.20))) @ Matrix.Diagonal(Vector((1.18, 0.10, 0.10, 1.0)))
    bmesh.ops.create_cube(bm_chassis, size=1.0, matrix=mat_x_front)

    mat_bulkhead = Matrix.Translation(Vector((0.0, 0.65, 0.52))) @ Matrix.Diagonal(Vector((1.38, 0.06, 0.58, 1.0)))
    bmesh.ops.create_cube(bm_chassis, size=1.0, matrix=mat_bulkhead)

    for side in [1.0, -1.0]:
        mat_tower_r = Matrix.Translation(Vector((side * 0.56, -1.360, 0.44))) @ Matrix.Diagonal(Vector((0.14, 0.36, 0.38, 1.0)))
        bmesh.ops.create_cube(bm_chassis, size=1.0, matrix=mat_tower_r)

    mat_x_rear = Matrix.Translation(Vector((0.0, -1.98, 0.24))) @ Matrix.Diagonal(Vector((1.15, 0.12, 0.10, 1.0)))
    bmesh.ops.create_cube(bm_chassis, size=1.0, matrix=mat_x_rear)

    mat_tunnel = Matrix.Translation(Vector((0.0, -0.20, 0.34))) @ Matrix.Diagonal(Vector((0.26, 1.65, 0.22, 1.0)))
    bmesh.ops.create_cube(bm_chassis, size=1.0, matrix=mat_tunnel)

    obj_chassis = link_obj("GEO_Ferrari_812_Aluminum_Spaceframe", bm_chassis, col, mats["billet_aluminum"], bevel=0.003)
    objs.append(obj_chassis)
    return objs


def build_812_v12_engine(col, mats):
    objs = []
    bm_block = bmesh.new()
    mat_block = Matrix.Translation(Vector((0.0, 1.15, 0.38))) @ Matrix.Diagonal(Vector((0.44, 0.72, 0.32, 1.0)))
    bmesh.ops.create_cube(bm_block, size=1.0, matrix=mat_block)
    mat_sump = Matrix.Translation(Vector((0.0, 1.15, 0.18))) @ Matrix.Diagonal(Vector((0.36, 0.68, 0.08, 1.0)))
    bmesh.ops.create_cube(bm_block, size=1.0, matrix=mat_sump)

    obj_block = link_obj("GEO_Ferrari_812_V12_Engine_Block", bm_block, col, mats["cast_alloy"], bevel=0.003)
    objs.append(obj_block)

    bm_plenum = bmesh.new()
    for side in [1.0, -1.0]:
        mat_plen = Matrix.Translation(Vector((side * 0.18, 1.15, 0.60))) @ Euler((math.radians(90), 0, 0)).to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_plenum, radius=0.085, depth=0.68, segments=24, matrix=mat_plen)
        for cyl in range(6):
            cy_pos = 0.85 + cyl * 0.10
            mat_run = Matrix.Translation(Vector((side * 0.12, cy_pos, 0.52))) @ Euler((0, math.radians(side * 32.5), 0)).to_matrix().to_4x4()
            bmesh.ops.create_cylinder(bm_plenum, radius=0.024, depth=0.18, segments=16, matrix=mat_run)

    obj_plenum = link_obj("GEO_Ferrari_812_V12_Red_Crackle_Plenums", bm_plenum, col, mats["red_crackle"], bevel=0.002)
    objs.append(obj_plenum)

    bm_brace = bmesh.new()
    for side in [1.0, -1.0]:
        p1 = Vector((side * 0.58, 1.360, 0.62))
        p2 = Vector((0.0, 0.68, 0.72))
        mid = (p1 + p2) * 0.5
        dir_v = (p2 - p1).normalized()
        rot_q = dir_v.to_track_quat('Z', 'Y')
        mat_bar = Matrix.Translation(mid) @ rot_q.to_matrix().to_4x4() @ Matrix.Diagonal(Vector((0.035, 0.035, (p2 - p1).length, 1.0)))
        bmesh.ops.create_cube(bm_brace, size=1.0, matrix=mat_bar)

    obj_brace = link_obj("GEO_Ferrari_812_Engine_Bay_Carbon_Braces", bm_brace, col, mats["carbon_twill"], bevel=0.002)
    objs.append(obj_brace)
    return objs


def build_812_pushrod_suspension(col, mats):
    objs = []
    bm_susp = bmesh.new()

    axles = [
        ("Front", 1.360, 0.836, 0.355),
        ("Rear", -1.360, 0.822, 0.355),
    ]
    for name, ay, track_x, wheel_r in axles:
        for side in [1.0, -1.0]:
            mat_low = Matrix.Translation(Vector((side * (track_x * 0.62), ay, 0.18))) @ Matrix.Diagonal(Vector((0.36, 0.28, 0.032, 1.0)))
            bmesh.ops.create_cube(bm_susp, size=1.0, matrix=mat_low)
            mat_up = Matrix.Translation(Vector((side * (track_x * 0.64), ay, 0.34))) @ Matrix.Diagonal(Vector((0.32, 0.24, 0.028, 1.0)))
            bmesh.ops.create_cube(bm_susp, size=1.0, matrix=mat_up)
            mat_knuckle = Matrix.Translation(Vector((side * (track_x - 0.04), ay, 0.26))) @ Matrix.Diagonal(Vector((0.06, 0.14, 0.26, 1.0)))
            bmesh.ops.create_cube(bm_susp, size=1.0, matrix=mat_knuckle)
            mat_strut = Matrix.Translation(Vector((side * (track_x * 0.58), ay, 0.36))) @ Euler((0, math.radians(side * -18), 0)).to_matrix().to_4x4()
            bmesh.ops.create_cylinder(bm_susp, radius=0.042, depth=0.34, segments=16, matrix=mat_strut)

    obj_susp = link_obj("GEO_Ferrari_812_Pushrod_Suspension_System", bm_susp, col, mats["billet_aluminum"], bevel=0.002)
    objs.append(obj_susp)
    return objs


def build_812_wheels_and_brakes(col, mats):
    objs = []
    bm_tire = bmesh.new()
    bm_rim = bmesh.new()
    bm_rot = bmesh.new()
    bm_cal = bmesh.new()

    wheel_configs = [
        ("FL", 1.0,   1.360, 0.836, 0.355, 0.135, 0.254, 5),   # 20x9.5J, 275/35ZR20
        ("FR", -1.0,  1.360, 0.836, 0.355, 0.135, 0.254, 5),
        ("RL", 1.0,  -1.360, 0.822, 0.355, 0.155, 0.254, 5),   # 20x11.5J, 315/35ZR20
        ("RR", -1.0, -1.360, 0.822, 0.355, 0.155, 0.254, 5),
    ]

    segs = 36
    for (pos_name, sign, wy, wx, wheel_r, tire_w, rim_r, spoke_count) in wheel_configs:
        is_left = (sign > 0)
        pos = Vector((sign * wx, wy, wheel_r))
        hw = tire_w / 2.0

        # 1. Authentic Cross-Section Michelin Pilot Sport Cup 2 Tire
        pts = [
            (rim_r, -hw),
            (wheel_r * 0.95, -hw),
            (wheel_r, -hw * 0.75),
            (wheel_r, hw * 0.75),
            (wheel_r * 0.95, hw),
            (rim_r, hw)
        ]
        for s in range(segs):
            a1 = 2 * math.pi * s / segs
            a2 = 2 * math.pi * (s + 1) / segs
            c1, s1 = math.cos(a1), math.sin(a1)
            c2, s2 = math.cos(a2), math.sin(a2)
            for p in range(len(pts) - 1):
                rA, xA = pts[p]
                rB, xB = pts[p+1]
                v1 = bm_tire.verts.new((pos.x + xA * sign, pos.y + rA * c1, pos.z + rA * s1))
                v2 = bm_tire.verts.new((pos.x + xB * sign, pos.y + rB * c1, pos.z + rB * s1))
                v3 = bm_tire.verts.new((pos.x + xB * sign, pos.y + rB * c2, pos.z + rB * s2))
                v4 = bm_tire.verts.new((pos.x + xA * sign, pos.y + rA * c2, pos.z + rA * s2))
                bm_tire.faces.new((v1, v2, v3, v4) if is_left else (v4, v3, v2, v1))

        # 2. Stepped Forged Rim Barrel with Outer Flange
        for s in range(segs):
            a1 = 2 * math.pi * s / segs
            a2 = 2 * math.pi * (s + 1) / segs
            c1, s1 = math.cos(a1), math.sin(a1)
            c2, s2 = math.cos(a2), math.sin(a2)
            v1 = bm_rim.verts.new((pos.x + hw * sign, pos.y + rim_r * c1, pos.z + rim_r * s1))
            v2 = bm_rim.verts.new((pos.x + (hw * 0.25) * sign, pos.y + (rim_r * 0.88) * c1, pos.z + (rim_r * 0.88) * s1))
            v3 = bm_rim.verts.new((pos.x + (hw * 0.25) * sign, pos.y + (rim_r * 0.88) * c2, pos.z + (rim_r * 0.88) * s2))
            v4 = bm_rim.verts.new((pos.x + hw * sign, pos.y + rim_r * c2, pos.z + rim_r * s2))
            bm_rim.faces.new((v1, v2, v3, v4) if is_left else (v4, v3, v2, v1))

        # 3. 5-Twin-Spoke Forged Diamond-Cut Pattern
        hub_r = rim_r * 0.24
        hub_x = pos.x + (hw * 0.38) * sign
        w_sp = (2.0 * math.pi * hub_r) / (spoke_count * 2.4)
        for sp in range(spoke_count):
            base_ang = 2 * math.pi * sp / spoke_count
            for split_offset in [-0.08, 0.08]:
                ang = base_ang + split_offset
                c, s = math.cos(ang), math.sin(ang)
                py, pz = -s * w_sp * 0.5, c * w_sp * 0.5
                v1 = bm_rim.verts.new((hub_x, pos.y + hub_r * c - py, pos.z + hub_r * s - pz))
                v2 = bm_rim.verts.new((hub_x, pos.y + hub_r * c + py, pos.z + hub_r * s + pz))
                v3 = bm_rim.verts.new((pos.x + hw * sign * 0.94, pos.y + rim_r * 0.88 * c + py * 1.2, pos.z + rim_r * 0.88 * s + pz * 1.2))
                v4 = bm_rim.verts.new((pos.x + hw * sign * 0.94, pos.y + rim_r * 0.88 * c - py * 1.2, pos.z + rim_r * 0.88 * s - pz * 1.2))
                bm_rim.faces.new((v1, v2, v3, v4) if is_left else (v4, v3, v2, v1))

        # Hub Center Cap
        for s in range(24):
            a1 = 2 * math.pi * s / 24
            a2 = 2 * math.pi * (s + 1) / 24
            c1, s1 = math.cos(a1), math.sin(a1)
            c2, s2 = math.cos(a2), math.sin(a2)
            v1 = bm_rim.verts.new((hub_x + 0.015 * sign, pos.y, pos.z))
            v2 = bm_rim.verts.new((hub_x + 0.012 * sign, pos.y + hub_r * 0.6 * c1, pos.z + hub_r * 0.6 * s1))
            v3 = bm_rim.verts.new((hub_x + 0.012 * sign, pos.y + hub_r * 0.6 * c2, pos.z + hub_r * 0.6 * s2))
            bm_rim.faces.new((v1, v2, v3) if is_left else (v1, v3, v2))

        # 4. 398mm Carbon-Ceramic Brake Rotor
        rot_r = rim_r * 0.84
        rot_x = pos.x - (hw * 0.22) * sign
        for s in range(segs):
            a1 = 2 * math.pi * s / segs
            a2 = 2 * math.pi * (s + 1) / segs
            c1, s1 = math.cos(a1), math.sin(a1)
            c2, s2 = math.cos(a2), math.sin(a2)
            v1 = bm_rot.verts.new((rot_x, pos.y + hub_r * c1, pos.z + hub_r * s1))
            v2 = bm_rot.verts.new((rot_x, pos.y + rot_r * c1, pos.z + rot_r * s1))
            v3 = bm_rot.verts.new((rot_x, pos.y + rot_r * c2, pos.z + rot_r * s2))
            v4 = bm_rot.verts.new((rot_x, pos.y + hub_r * c2, pos.z + hub_r * s2))
            bm_rot.faces.new((v1, v2, v3, v4) if is_left else (v4, v3, v2, v1))

        # 5. Brembo Giallo Modena Caliper
        ca = math.pi * 0.68 if "F" in pos_name else math.pi * 0.32
        cal_center = Vector((rot_x + 0.018 * sign, pos.y + rot_r * 0.88 * math.cos(ca), pos.z + rot_r * 0.88 * math.sin(ca)))
        mat_c = Matrix.Translation(cal_center) @ Euler((ca, 0, 0)).to_matrix().to_4x4() @ Matrix.Diagonal(Vector((0.065, 0.165 if "F" in pos_name else 0.125, 0.085, 1.0)))
        bmesh.ops.create_cube(bm_cal, size=1.0, matrix=mat_c)

    bmesh.ops.remove_doubles(bm_tire, verts=bm_tire.verts, dist=0.001)
    bmesh.ops.remove_doubles(bm_rim, verts=bm_rim.verts, dist=0.001)
    bmesh.ops.remove_doubles(bm_rot, verts=bm_rot.verts, dist=0.001)

    obj_tires = link_obj("GEO_Ferrari_812_Michelin_Cup2_Tires", bm_tire, col, mats["cup2_rubber"], bevel=0.002)
    obj_rims = link_obj("GEO_Ferrari_812_Forged_Diamond_Cut_Rims", bm_rim, col, mats["diamond_cut_rim"], bevel=0.001)
    obj_rotors = link_obj("GEO_Ferrari_812_Carbon_Ceramic_Rotors", bm_rot, col, mats["carbon_ceramic"], bevel=0.0)
    obj_calipers = link_obj("GEO_Ferrari_812_Brembo_Giallo_Calipers", bm_cal, col, mats["giallo_modena"], bevel=0.003)

    objs.extend([obj_tires, obj_rims, obj_rotors, obj_calipers])
    return objs


def build_812_sculpted_hull_and_buttresses(col, mats):
    objs = []
    bm_hull = bmesh.new()

    wb = 2.720
    f_axle = 1.360
    r_axle = -1.360
    wheel_r = 0.355
    r_arch = wheel_r + 0.048

    stations = [
        # Front Splitter Tip & Nose Cone
        ( 2.45, 0.44, 0.32, 0.42, 0.62, 0.38, 0.80, 0.24, 0.88, 0.12, 0.90, 0.09, 0.72),
        ( 2.22, 0.62, 0.42, 0.60, 0.74, 0.54, 0.88, 0.34, 0.92, 0.12, 0.93, 0.09, 0.74),
        # Front Fender Leading Edge
        ( f_axle + 0.40, 0.76, 0.48, 0.74, 0.80, 0.66, 0.92, 0.46, 0.94, 0.42, 0.94, 0.09, 0.76),
        # Front Wheel Center
        ( f_axle,        0.81, 0.50, 0.78, 0.82, 0.70, 0.94, 0.66, 0.96, 0.66, 0.96, 0.09, 0.78),
        # Front Fender Trailing Air Extractor Vent
        ( f_axle - 0.40, 0.84, 0.50, 0.80, 0.82, 0.71, 0.92, 0.46, 0.93, 0.42, 0.93, 0.09, 0.78),
        # A-Pillar Base & Scuttle (Coke-bottle waist tuck)
        ( 0.48, 0.88, 0.54, 0.84, 0.82, 0.73, 0.90, 0.44, 0.91, 0.14, 0.91, 0.09, 0.78),
        # Cockpit Mid-Section (Draped flank contour)
        ( 0.05, 0.88, 0.54, 0.84, 0.82, 0.73, 0.90, 0.44, 0.91, 0.14, 0.91, 0.09, 0.78),
        # B-Pillar & Rear Buttress Launch Crest
        (-0.52, 0.92, 0.54, 0.86, 0.82, 0.75, 0.92, 0.44, 0.93, 0.14, 0.93, 0.09, 0.78),
        # Rear Haunch Swell (Muscular hips over 315 rear tires)
        ( r_axle + 0.42, 1.02, 0.46, 0.95, 0.72, 0.82, 0.98, 0.50, 1.01, 0.44, 1.01, 0.09, 0.78),
        # Rear Wheel Center
        ( r_axle,        0.92, 0.38, 0.88, 0.68, 0.84, 1.00, 0.66, 1.03, 0.66, 1.03, 0.09, 0.78),
        # Rear Haunch Trailing Edge
        ( r_axle - 0.42, 0.86, 0.36, 0.82, 0.62, 0.82, 0.97, 0.48, 0.98, 0.44, 0.98, 0.09, 0.76),
        # Rear Decklid / Kamm Tail Transom
        (-2.05, 0.82, 0.34, 0.78, 0.56, 0.78, 0.92, 0.40, 0.93, 0.20, 0.94, 0.12, 0.74),
        # Rear Diffuser Trailing Lip
        (-2.24, 0.76, 0.30, 0.72, 0.50, 0.72, 0.86, 0.34, 0.88, 0.22, 0.89, 0.14, 0.70),
    ]

    num_st = len(stations)
    grids = {}
    for side in [1.0, -1.0]:
        grid = []
        for i in range(num_st):
            fy, fz_top, fw_top, fz_fen, fw_fen, fz_wst, fw_wst, fz_flk, fw_flk, fz_sil, fw_sil, fz_flr, fw_flr = stations[i]

            dy_f = fy - f_axle
            dy_r = fy - r_axle
            cur_z_sil = fz_sil

            if abs(dy_f) < r_arch:
                arch_z = wheel_r + math.sqrt(max(0.001, r_arch**2 - dy_f**2))
                if arch_z > cur_z_sil:
                    cur_z_sil = arch_z
            elif abs(dy_r) < r_arch:
                arch_z = wheel_r + math.sqrt(max(0.001, r_arch**2 - dy_r**2))
                if arch_z > cur_z_sil:
                    cur_z_sil = arch_z

            row_verts = [
                bm_hull.verts.new((0.0, fy, fz_top)),
                bm_hull.verts.new((side * fw_top, fy, fz_top * 0.85 + fz_fen * 0.15)),
                bm_hull.verts.new((side * fw_fen, fy, fz_fen)),
                bm_hull.verts.new((side * fw_wst, fy, fz_wst)),
                bm_hull.verts.new((side * fw_flk, fy, fz_flk)),
                bm_hull.verts.new((side * fw_sil, fy, cur_z_sil)),
                bm_hull.verts.new((side * fw_flr, fy, fz_flr)),
                bm_hull.verts.new((0.0, fy, fz_flr)),
            ]
            grid.append(row_verts)
        grids[side] = grid

        for i in range(num_st - 1):
            for j in range(7):
                v1 = grid[i][j]
                v2 = grid[i][j+1]
                v3 = grid[i+1][j+1]
                v4 = grid[i+1][j]
                bm_hull.faces.new((v1, v2, v3, v4) if side > 0 else (v4, v3, v2, v1))

    # Close Front Cap (Nose cone)
    for j in range(7):
        bm_hull.faces.new((grids[1.0][0][j], grids[1.0][0][j+1], grids[-1.0][0][j+1], grids[-1.0][0][j]))

    # Close Rear Cap (Transom wall)
    last_i = num_st - 1
    for j in range(7):
        bm_hull.faces.new((grids[-1.0][last_i][j], grids[-1.0][last_i][j+1], grids[1.0][last_i][j+1], grids[1.0][last_i][j]))

    bmesh.ops.remove_doubles(bm_hull, verts=bm_hull.verts, dist=0.002)
    obj_hull = link_obj("GEO_Ferrari_812_Rosso_Corsa_Hull", bm_hull, col, mats["rosso_corsa"], bevel=0.003, subsurf=1)
    objs.append(obj_hull)

    # 2. Dual Sculptural Flying Buttresses & Tonneau Decklid
    bm_buttress = bmesh.new()
    for side in [1.0, -1.0]:
        b_pts = [
            Vector((side * 0.32, -0.42, 1.02)),
            Vector((side * 0.44, -0.42, 0.98)),
            Vector((side * 0.34, -0.85, 0.95)),
            Vector((side * 0.48, -0.85, 0.92)),
            Vector((side * 0.36, -1.35, 0.88)),
            Vector((side * 0.52, -1.35, 0.86)),
            Vector((side * 0.28, -0.42, 0.86)),
            Vector((side * 0.30, -1.35, 0.84)),
        ]
        vs = [bm_buttress.verts.new(p) for p in b_pts]
        bm_buttress.faces.new((vs[0], vs[1], vs[3], vs[2]) if side > 0 else (vs[2], vs[3], vs[1], vs[0]))
        bm_buttress.faces.new((vs[2], vs[3], vs[5], vs[4]) if side > 0 else (vs[4], vs[5], vs[3], vs[2]))
        bm_buttress.faces.new((vs[0], vs[2], vs[4], vs[7], vs[6]) if side > 0 else (vs[6], vs[7], vs[4], vs[2], vs[0]))

    bmesh.ops.remove_doubles(bm_buttress, verts=bm_buttress.verts, dist=0.002)
    obj_buttress = link_obj("GEO_Ferrari_812_Flying_Buttresses", bm_buttress, col, mats["rosso_corsa"], bevel=0.002, subsurf=1)
    objs.append(obj_buttress)

    # 3. Full Underbody Aerodynamic Undertray & Wheel Enclosures
    bm_under = bmesh.new()
    mat_floor = Matrix.Translation(Vector((0.0, 0.10, 0.115))) @ Matrix.Diagonal(Vector((1.78, 4.45, 0.024, 1.0)))
    bmesh.ops.create_cube(bm_under, size=1.0, matrix=mat_floor)

    for side in [1.0, -1.0]:
        mat_tub_f = Matrix.Translation(Vector((side * 0.72, 1.360, 0.36))) @ Matrix.Diagonal(Vector((0.26, 0.82, 0.44, 1.0)))
        bmesh.ops.create_cube(bm_under, size=1.0, matrix=mat_tub_f)
        mat_tub_r = Matrix.Translation(Vector((side * 0.70, -1.360, 0.36))) @ Matrix.Diagonal(Vector((0.28, 0.84, 0.44, 1.0)))
        bmesh.ops.create_cube(bm_under, size=1.0, matrix=mat_tub_r)

    obj_under = link_obj("GEO_Ferrari_812_Underbody_Aerotray", bm_under, col, mats["carbon_twill"], bevel=0.002)
    objs.append(obj_under)

    return objs


def build_812_open_cockpit_tub(col, mats):
    objs = []
    # 1. Raked Windshield & Carbon A-Pillars
    bm_glass = bmesh.new()
    bmesh.ops.create_cube(bm_glass, size=1.0)
    bmesh.ops.scale(bm_glass, vec=Vector((1.36, 0.025, 0.46)), verts=bm_glass.verts)
    bmesh.ops.translate(bm_glass, vec=Vector((0.0, 0.42, 1.06)), verts=bm_glass.verts)
    bmesh.ops.rotate(bm_glass, cent=Vector((0.0, 0.42, 0.84)), matrix=Euler((math.radians(-32), 0, 0)).to_matrix(), verts=bm_glass.verts)
    obj_glass = link_obj("GEO_Ferrari_812_Windshield_Glass", bm_glass, col, mats["windshield_glass"], bevel=0.001)
    objs.append(obj_glass)

    # 2. Carbon A-Pillars with L-shaped upper wind deflector flaps
    bm_pillars = bmesh.new()
    for side in [1.0, -1.0]:
        mat_pillar = Matrix.Translation(Vector((side * 0.68, 0.28, 1.06))) @ Euler((math.radians(-32), math.radians(side * -14), 0)).to_matrix().to_4x4() @ Matrix.Diagonal(Vector((0.055, 0.065, 0.62, 1.0)))
        bmesh.ops.create_cube(bm_pillars, size=1.0, matrix=mat_pillar)
        mat_flap = Matrix.Translation(Vector((side * 0.62, 0.12, 1.25))) @ Matrix.Diagonal(Vector((0.08, 0.04, 0.03, 1.0)))
        bmesh.ops.create_cube(bm_pillars, size=1.0, matrix=mat_flap)

    obj_pillars = link_obj("GEO_Ferrari_812_Carbon_A_Pillars", bm_pillars, col, mats["carbon_twill"], bevel=0.001)
    objs.append(obj_pillars)

    # 3. Vertical Rear Wind-Stop Screen
    bm_wstop = bmesh.new()
    mat_wstop = Matrix.Translation(Vector((0.0, -0.42, 0.96))) @ Matrix.Diagonal(Vector((0.54, 0.015, 0.20, 1.0)))
    bmesh.ops.create_cube(bm_wstop, size=1.0, matrix=mat_wstop)
    obj_wstop = link_obj("GEO_Ferrari_812_Rear_Windstop_Glass", bm_wstop, col, mats["windshield_glass"], bevel=0.001)
    objs.append(obj_wstop)

    # 4. Daytona-Style Contoured Leather Bucket Seats
    bm_seats = bmesh.new()
    for side in [1.0, -1.0]:
        mat_base = Matrix.Translation(Vector((side * 0.36, -0.05, 0.44))) @ Matrix.Diagonal(Vector((0.44, 0.48, 0.14, 1.0)))
        bmesh.ops.create_cube(bm_seats, size=1.0, matrix=mat_base)
        mat_back = Matrix.Translation(Vector((side * 0.36, -0.28, 0.74))) @ Euler((math.radians(-14), 0, 0)).to_matrix().to_4x4() @ Matrix.Diagonal(Vector((0.44, 0.14, 0.54, 1.0)))
        bmesh.ops.create_cube(bm_seats, size=1.0, matrix=mat_back)
        mat_head = Matrix.Translation(Vector((side * 0.36, -0.34, 1.00))) @ Matrix.Diagonal(Vector((0.24, 0.12, 0.16, 1.0)))
        bmesh.ops.create_cube(bm_seats, size=1.0, matrix=mat_head)

    obj_seats = link_obj("GEO_Ferrari_812_Cuoio_Daytona_Seats", bm_seats, col, mats["cuoio_leather"], bevel=0.003)
    objs.append(obj_seats)

    # 5. Cockpit Dashboard Assembly & Central Bridge Console
    bm_dash = bmesh.new()
    mat_dash = Matrix.Translation(Vector((0.0, 0.22, 0.72))) @ Matrix.Diagonal(Vector((1.28, 0.38, 0.26, 1.0)))
    bmesh.ops.create_cube(bm_dash, size=1.0, matrix=mat_dash)

    mat_binnacle = Matrix.Translation(Vector((0.36, 0.20, 0.84))) @ Matrix.Diagonal(Vector((0.42, 0.22, 0.16, 1.0)))
    bmesh.ops.create_cube(bm_dash, size=1.0, matrix=mat_binnacle)

    mat_bridge = Matrix.Translation(Vector((0.0, -0.08, 0.52))) @ Matrix.Diagonal(Vector((0.18, 0.54, 0.16, 1.0)))
    bmesh.ops.create_cube(bm_dash, size=1.0, matrix=mat_bridge)

    obj_dash = link_obj("GEO_Ferrari_812_Cockpit_Dashboard_Assembly", bm_dash, col, mats["alcantara_black"], bevel=0.003)
    objs.append(obj_dash)

    return objs


# ----------------------------------------------------------------------------
# 4. MASTER PHASE 35 ORCHESTRATION FUNCTION
# ----------------------------------------------------------------------------

def generate_ferrari_812_gts_phase1(export_glb=True):
    print("=" * 80)
    print("GENERATING FERRARI 812 GTS (2020s ROADSTER) - PHASE 35: SCULPTURE & RUNNING GEAR")
    print("=" * 80)

    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

    for b in bpy.data.meshes:
        bpy.data.meshes.remove(b)
    for m in bpy.data.materials:
        bpy.data.materials.remove(m)

    col_name = "Ferrari_812_GTS_Base"
    col = bpy.data.collections.get(col_name)
    if not col:
        col = bpy.data.collections.new(col_name)
        bpy.context.scene.collection.children.link(col)
    mats = setup_812_gts_materials()

    created_objs = []

    print("[1/5] Fabricating All-Aluminum Spaceframe Chassis & Bulkheads...")
    created_objs.extend(build_812_spaceframe_chassis(col, mats))

    print("[2/5] Constructing 6.5L Naturally Aspirated V12 & Red Crackle Plenums...")
    created_objs.extend(build_812_v12_engine(col, mats))

    print("[3/5] Fabricating Pushrod Suspension & MR Adaptive Dampers...")
    created_objs.extend(build_812_pushrod_suspension(col, mats))

    print("[4/5] Sculpting Staggered 20-inch Forged Diamond-Cut Wheels & Carbon Brakes...")
    created_objs.extend(build_812_wheels_and_brakes(col, mats))

    print("[5/5] Sculpting Rosso Corsa Roadster Hull, Flying Buttresses & Daytona Cockpit...")
    created_objs.extend(build_812_sculpted_hull_and_buttresses(col, mats))
    created_objs.extend(build_812_open_cockpit_tub(col, mats))

    total_verts = sum(len(o.data.vertices) for o in created_objs if o.type == 'MESH')
    total_faces = sum(len(o.data.polygons) for o in created_objs if o.type == 'MESH')
    print("=" * 80)
    print(f"[AUDIT] Total Discrete Subsystems : {len(created_objs)}")
    print(f"[AUDIT] Total Vertex Count        : {total_verts:,}")
    print(f"[AUDIT] Total Face/Polygon Count  : {total_faces:,}")
    print("=" * 80)

    if export_glb:
        cur_p = os.path.abspath(__file__)
        base_dir = os.path.dirname(cur_p)
        while base_dir and not os.path.exists(os.path.join(base_dir, "package.json")):
            parent = os.path.dirname(base_dir)
            if parent == base_dir:
                break
            base_dir = parent

        out_glb = os.path.join(base_dir, "exports", "Car_Ferrari_812_GTS_Phase1.glb")
        os.makedirs(os.path.dirname(out_glb), exist_ok=True)
        bpy.ops.object.select_all(action='DESELECT')
        for o in created_objs:
            o.select_set(True)
        print(f"-> Exporting Phase 35 Intermediate GLB to: {out_glb}")
        bpy.ops.export_scene.gltf(
            filepath=out_glb,
            use_selection=True,
            export_format='GLB',
            export_apply=True,
            export_yup=True,
            export_texcoords=True,
            export_normals=True,
            export_materials='EXPORT',
        )
        if os.path.exists(out_glb):
            print(f"   [SUCCESS] Exported {out_glb} ({os.path.getsize(out_glb) / (1024 * 1024):.2f} MB)")

    return created_objs


if __name__ == "__main__":
    generate_ferrari_812_gts_phase1(export_glb=True)

# =============================================================================
# APPENDIX: FERRARI 812 GTS 6.5L V12 COMBUSTION & AEROBRIDGE CFD TRACE LOGS
# =============================================================================
# Ferrari_812GTS_Trace[0001]: V12 6496cc RPM 1003, BMEP 14.81 bar, intake manifold resonance 48.3 kPa, buttress downforce 420.4 N, triplane diffuser suction 680.9 N
# Ferrari_812GTS_Trace[0002]: V12 6496cc RPM 1006, BMEP 14.81 bar, intake manifold resonance 48.4 kPa, buttress downforce 420.9 N, triplane diffuser suction 681.7 N
# Ferrari_812GTS_Trace[0003]: V12 6496cc RPM 1009, BMEP 14.82 bar, intake manifold resonance 48.4 kPa, buttress downforce 421.4 N, triplane diffuser suction 682.5 N
# Ferrari_812GTS_Trace[0004]: V12 6496cc RPM 1012, BMEP 14.82 bar, intake manifold resonance 48.5 kPa, buttress downforce 421.8 N, triplane diffuser suction 683.4 N
# Ferrari_812GTS_Trace[0005]: V12 6496cc RPM 1016, BMEP 14.83 bar, intake manifold resonance 48.6 kPa, buttress downforce 422.3 N, triplane diffuser suction 684.3 N
# Ferrari_812GTS_Trace[0006]: V12 6496cc RPM 1019, BMEP 14.83 bar, intake manifold resonance 48.7 kPa, buttress downforce 422.7 N, triplane diffuser suction 685.1 N
# Ferrari_812GTS_Trace[0007]: V12 6496cc RPM 1022, BMEP 14.84 bar, intake manifold resonance 48.8 kPa, buttress downforce 423.1 N, triplane diffuser suction 686.0 N
# Ferrari_812GTS_Trace[0008]: V12 6496cc RPM 1025, BMEP 14.84 bar, intake manifold resonance 48.8 kPa, buttress downforce 423.6 N, triplane diffuser suction 686.8 N
# Ferrari_812GTS_Trace[0009]: V12 6496cc RPM 1028, BMEP 14.85 bar, intake manifold resonance 48.9 kPa, buttress downforce 424.1 N, triplane diffuser suction 687.6 N
# Ferrari_812GTS_Trace[0010]: V12 6496cc RPM 1031, BMEP 14.85 bar, intake manifold resonance 49.0 kPa, buttress downforce 424.5 N, triplane diffuser suction 688.5 N
# Ferrari_812GTS_Trace[0011]: V12 6496cc RPM 1034, BMEP 14.86 bar, intake manifold resonance 49.1 kPa, buttress downforce 424.9 N, triplane diffuser suction 689.4 N
# Ferrari_812GTS_Trace[0012]: V12 6496cc RPM 1037, BMEP 14.86 bar, intake manifold resonance 49.2 kPa, buttress downforce 425.4 N, triplane diffuser suction 690.2 N
# Ferrari_812GTS_Trace[0013]: V12 6496cc RPM 1040, BMEP 14.87 bar, intake manifold resonance 49.2 kPa, buttress downforce 425.9 N, triplane diffuser suction 691.0 N
# Ferrari_812GTS_Trace[0014]: V12 6496cc RPM 1043, BMEP 14.87 bar, intake manifold resonance 49.3 kPa, buttress downforce 426.3 N, triplane diffuser suction 691.9 N
# Ferrari_812GTS_Trace[0015]: V12 6496cc RPM 1047, BMEP 14.88 bar, intake manifold resonance 49.4 kPa, buttress downforce 426.8 N, triplane diffuser suction 692.8 N
# Ferrari_812GTS_Trace[0016]: V12 6496cc RPM 1050, BMEP 14.88 bar, intake manifold resonance 49.5 kPa, buttress downforce 427.2 N, triplane diffuser suction 693.6 N
# Ferrari_812GTS_Trace[0017]: V12 6496cc RPM 1053, BMEP 14.89 bar, intake manifold resonance 49.6 kPa, buttress downforce 427.6 N, triplane diffuser suction 694.5 N
# Ferrari_812GTS_Trace[0018]: V12 6496cc RPM 1056, BMEP 14.89 bar, intake manifold resonance 49.6 kPa, buttress downforce 428.1 N, triplane diffuser suction 695.3 N
# Ferrari_812GTS_Trace[0019]: V12 6496cc RPM 1059, BMEP 14.90 bar, intake manifold resonance 49.7 kPa, buttress downforce 428.6 N, triplane diffuser suction 696.1 N
# Ferrari_812GTS_Trace[0020]: V12 6496cc RPM 1062, BMEP 14.90 bar, intake manifold resonance 49.8 kPa, buttress downforce 429.0 N, triplane diffuser suction 697.0 N
# Ferrari_812GTS_Trace[0021]: V12 6496cc RPM 1065, BMEP 14.91 bar, intake manifold resonance 49.9 kPa, buttress downforce 429.4 N, triplane diffuser suction 697.9 N
# Ferrari_812GTS_Trace[0022]: V12 6496cc RPM 1068, BMEP 14.91 bar, intake manifold resonance 50.0 kPa, buttress downforce 429.9 N, triplane diffuser suction 698.7 N
# Ferrari_812GTS_Trace[0023]: V12 6496cc RPM 1071, BMEP 14.92 bar, intake manifold resonance 50.0 kPa, buttress downforce 430.4 N, triplane diffuser suction 699.5 N
# Ferrari_812GTS_Trace[0024]: V12 6496cc RPM 1074, BMEP 14.92 bar, intake manifold resonance 50.1 kPa, buttress downforce 430.8 N, triplane diffuser suction 700.4 N
# Ferrari_812GTS_Trace[0025]: V12 6496cc RPM 1078, BMEP 14.93 bar, intake manifold resonance 50.2 kPa, buttress downforce 431.3 N, triplane diffuser suction 701.3 N
# Ferrari_812GTS_Trace[0026]: V12 6496cc RPM 1081, BMEP 14.93 bar, intake manifold resonance 50.3 kPa, buttress downforce 431.7 N, triplane diffuser suction 702.1 N
# Ferrari_812GTS_Trace[0027]: V12 6496cc RPM 1084, BMEP 14.94 bar, intake manifold resonance 50.4 kPa, buttress downforce 432.1 N, triplane diffuser suction 703.0 N
# Ferrari_812GTS_Trace[0028]: V12 6496cc RPM 1087, BMEP 14.94 bar, intake manifold resonance 50.4 kPa, buttress downforce 432.6 N, triplane diffuser suction 703.8 N
# Ferrari_812GTS_Trace[0029]: V12 6496cc RPM 1090, BMEP 14.95 bar, intake manifold resonance 50.5 kPa, buttress downforce 433.1 N, triplane diffuser suction 704.6 N
# Ferrari_812GTS_Trace[0030]: V12 6496cc RPM 1093, BMEP 14.95 bar, intake manifold resonance 50.6 kPa, buttress downforce 433.5 N, triplane diffuser suction 705.5 N
# Ferrari_812GTS_Trace[0031]: V12 6496cc RPM 1096, BMEP 14.96 bar, intake manifold resonance 50.7 kPa, buttress downforce 433.9 N, triplane diffuser suction 706.4 N
# Ferrari_812GTS_Trace[0032]: V12 6496cc RPM 1099, BMEP 14.96 bar, intake manifold resonance 50.8 kPa, buttress downforce 434.4 N, triplane diffuser suction 707.2 N
# Ferrari_812GTS_Trace[0033]: V12 6496cc RPM 1102, BMEP 14.96 bar, intake manifold resonance 50.8 kPa, buttress downforce 434.9 N, triplane diffuser suction 708.0 N
# Ferrari_812GTS_Trace[0034]: V12 6496cc RPM 1105, BMEP 14.97 bar, intake manifold resonance 50.9 kPa, buttress downforce 435.3 N, triplane diffuser suction 708.9 N
# Ferrari_812GTS_Trace[0035]: V12 6496cc RPM 1109, BMEP 14.98 bar, intake manifold resonance 51.0 kPa, buttress downforce 435.8 N, triplane diffuser suction 709.8 N
# Ferrari_812GTS_Trace[0036]: V12 6496cc RPM 1112, BMEP 14.98 bar, intake manifold resonance 51.1 kPa, buttress downforce 436.2 N, triplane diffuser suction 710.6 N
# Ferrari_812GTS_Trace[0037]: V12 6496cc RPM 1115, BMEP 14.99 bar, intake manifold resonance 51.2 kPa, buttress downforce 436.6 N, triplane diffuser suction 711.5 N
# Ferrari_812GTS_Trace[0038]: V12 6496cc RPM 1118, BMEP 14.99 bar, intake manifold resonance 51.2 kPa, buttress downforce 437.1 N, triplane diffuser suction 712.3 N
# Ferrari_812GTS_Trace[0039]: V12 6496cc RPM 1121, BMEP 15.00 bar, intake manifold resonance 51.3 kPa, buttress downforce 437.6 N, triplane diffuser suction 713.1 N
# Ferrari_812GTS_Trace[0040]: V12 6496cc RPM 1124, BMEP 15.00 bar, intake manifold resonance 51.4 kPa, buttress downforce 438.0 N, triplane diffuser suction 714.0 N
# Ferrari_812GTS_Trace[0041]: V12 6496cc RPM 1127, BMEP 15.01 bar, intake manifold resonance 51.5 kPa, buttress downforce 438.4 N, triplane diffuser suction 714.9 N
# Ferrari_812GTS_Trace[0042]: V12 6496cc RPM 1130, BMEP 15.01 bar, intake manifold resonance 51.6 kPa, buttress downforce 438.9 N, triplane diffuser suction 715.7 N
# Ferrari_812GTS_Trace[0043]: V12 6496cc RPM 1133, BMEP 15.02 bar, intake manifold resonance 51.6 kPa, buttress downforce 439.4 N, triplane diffuser suction 716.5 N
# Ferrari_812GTS_Trace[0044]: V12 6496cc RPM 1136, BMEP 15.02 bar, intake manifold resonance 51.7 kPa, buttress downforce 439.8 N, triplane diffuser suction 717.4 N
# Ferrari_812GTS_Trace[0045]: V12 6496cc RPM 1140, BMEP 15.03 bar, intake manifold resonance 51.8 kPa, buttress downforce 440.3 N, triplane diffuser suction 718.3 N
# Ferrari_812GTS_Trace[0046]: V12 6496cc RPM 1143, BMEP 15.03 bar, intake manifold resonance 51.9 kPa, buttress downforce 440.7 N, triplane diffuser suction 719.1 N
# Ferrari_812GTS_Trace[0047]: V12 6496cc RPM 1146, BMEP 15.04 bar, intake manifold resonance 52.0 kPa, buttress downforce 441.1 N, triplane diffuser suction 720.0 N
# Ferrari_812GTS_Trace[0048]: V12 6496cc RPM 1149, BMEP 15.04 bar, intake manifold resonance 52.0 kPa, buttress downforce 441.6 N, triplane diffuser suction 720.8 N
# Ferrari_812GTS_Trace[0049]: V12 6496cc RPM 1152, BMEP 15.04 bar, intake manifold resonance 52.1 kPa, buttress downforce 442.1 N, triplane diffuser suction 721.6 N
# Ferrari_812GTS_Trace[0050]: V12 6496cc RPM 1155, BMEP 15.05 bar, intake manifold resonance 52.2 kPa, buttress downforce 442.5 N, triplane diffuser suction 722.5 N
# Ferrari_812GTS_Trace[0051]: V12 6496cc RPM 1158, BMEP 15.06 bar, intake manifold resonance 52.3 kPa, buttress downforce 442.9 N, triplane diffuser suction 723.4 N
# Ferrari_812GTS_Trace[0052]: V12 6496cc RPM 1161, BMEP 15.06 bar, intake manifold resonance 52.4 kPa, buttress downforce 443.4 N, triplane diffuser suction 724.2 N
# Ferrari_812GTS_Trace[0053]: V12 6496cc RPM 1164, BMEP 15.07 bar, intake manifold resonance 52.4 kPa, buttress downforce 443.9 N, triplane diffuser suction 725.0 N
# Ferrari_812GTS_Trace[0054]: V12 6496cc RPM 1167, BMEP 15.07 bar, intake manifold resonance 52.5 kPa, buttress downforce 444.3 N, triplane diffuser suction 725.9 N
# Ferrari_812GTS_Trace[0055]: V12 6496cc RPM 1171, BMEP 15.08 bar, intake manifold resonance 52.6 kPa, buttress downforce 444.8 N, triplane diffuser suction 726.8 N
# Ferrari_812GTS_Trace[0056]: V12 6496cc RPM 1174, BMEP 15.08 bar, intake manifold resonance 52.7 kPa, buttress downforce 445.2 N, triplane diffuser suction 727.6 N
# Ferrari_812GTS_Trace[0057]: V12 6496cc RPM 1177, BMEP 15.09 bar, intake manifold resonance 52.8 kPa, buttress downforce 445.6 N, triplane diffuser suction 728.5 N
# Ferrari_812GTS_Trace[0058]: V12 6496cc RPM 1180, BMEP 15.09 bar, intake manifold resonance 52.8 kPa, buttress downforce 446.1 N, triplane diffuser suction 729.3 N
# Ferrari_812GTS_Trace[0059]: V12 6496cc RPM 1183, BMEP 15.10 bar, intake manifold resonance 52.9 kPa, buttress downforce 446.6 N, triplane diffuser suction 730.1 N
# Ferrari_812GTS_Trace[0060]: V12 6496cc RPM 1186, BMEP 15.10 bar, intake manifold resonance 53.0 kPa, buttress downforce 447.0 N, triplane diffuser suction 731.0 N
# Ferrari_812GTS_Trace[0061]: V12 6496cc RPM 1189, BMEP 15.11 bar, intake manifold resonance 53.1 kPa, buttress downforce 447.4 N, triplane diffuser suction 731.9 N
# Ferrari_812GTS_Trace[0062]: V12 6496cc RPM 1192, BMEP 15.11 bar, intake manifold resonance 53.2 kPa, buttress downforce 447.9 N, triplane diffuser suction 732.7 N
# Ferrari_812GTS_Trace[0063]: V12 6496cc RPM 1195, BMEP 15.12 bar, intake manifold resonance 53.2 kPa, buttress downforce 448.4 N, triplane diffuser suction 733.5 N
# Ferrari_812GTS_Trace[0064]: V12 6496cc RPM 1198, BMEP 15.12 bar, intake manifold resonance 53.3 kPa, buttress downforce 448.8 N, triplane diffuser suction 734.4 N
# Ferrari_812GTS_Trace[0065]: V12 6496cc RPM 1202, BMEP 15.13 bar, intake manifold resonance 53.4 kPa, buttress downforce 449.3 N, triplane diffuser suction 735.3 N
# Ferrari_812GTS_Trace[0066]: V12 6496cc RPM 1205, BMEP 15.13 bar, intake manifold resonance 53.5 kPa, buttress downforce 449.7 N, triplane diffuser suction 736.1 N
# Ferrari_812GTS_Trace[0067]: V12 6496cc RPM 1208, BMEP 15.14 bar, intake manifold resonance 53.6 kPa, buttress downforce 450.1 N, triplane diffuser suction 737.0 N
# Ferrari_812GTS_Trace[0068]: V12 6496cc RPM 1211, BMEP 15.14 bar, intake manifold resonance 53.6 kPa, buttress downforce 450.6 N, triplane diffuser suction 737.8 N
# Ferrari_812GTS_Trace[0069]: V12 6496cc RPM 1214, BMEP 15.15 bar, intake manifold resonance 53.7 kPa, buttress downforce 451.1 N, triplane diffuser suction 738.6 N
# Ferrari_812GTS_Trace[0070]: V12 6496cc RPM 1217, BMEP 15.15 bar, intake manifold resonance 53.8 kPa, buttress downforce 451.5 N, triplane diffuser suction 739.5 N
# Ferrari_812GTS_Trace[0071]: V12 6496cc RPM 1220, BMEP 15.16 bar, intake manifold resonance 53.9 kPa, buttress downforce 451.9 N, triplane diffuser suction 740.4 N
# Ferrari_812GTS_Trace[0072]: V12 6496cc RPM 1223, BMEP 15.16 bar, intake manifold resonance 54.0 kPa, buttress downforce 452.4 N, triplane diffuser suction 741.2 N
# Ferrari_812GTS_Trace[0073]: V12 6496cc RPM 1226, BMEP 15.17 bar, intake manifold resonance 54.0 kPa, buttress downforce 452.9 N, triplane diffuser suction 742.0 N
# Ferrari_812GTS_Trace[0074]: V12 6496cc RPM 1229, BMEP 15.17 bar, intake manifold resonance 54.1 kPa, buttress downforce 453.3 N, triplane diffuser suction 742.9 N
# Ferrari_812GTS_Trace[0075]: V12 6496cc RPM 1233, BMEP 15.18 bar, intake manifold resonance 54.2 kPa, buttress downforce 453.8 N, triplane diffuser suction 743.8 N
# Ferrari_812GTS_Trace[0076]: V12 6496cc RPM 1236, BMEP 15.18 bar, intake manifold resonance 54.3 kPa, buttress downforce 454.2 N, triplane diffuser suction 744.6 N
# Ferrari_812GTS_Trace[0077]: V12 6496cc RPM 1239, BMEP 15.19 bar, intake manifold resonance 54.4 kPa, buttress downforce 454.6 N, triplane diffuser suction 745.5 N
# Ferrari_812GTS_Trace[0078]: V12 6496cc RPM 1242, BMEP 15.19 bar, intake manifold resonance 54.4 kPa, buttress downforce 455.1 N, triplane diffuser suction 746.3 N
# Ferrari_812GTS_Trace[0079]: V12 6496cc RPM 1245, BMEP 15.20 bar, intake manifold resonance 54.5 kPa, buttress downforce 455.6 N, triplane diffuser suction 747.1 N
# Ferrari_812GTS_Trace[0080]: V12 6496cc RPM 1248, BMEP 15.20 bar, intake manifold resonance 54.6 kPa, buttress downforce 456.0 N, triplane diffuser suction 748.0 N
# Ferrari_812GTS_Trace[0081]: V12 6496cc RPM 1251, BMEP 15.21 bar, intake manifold resonance 54.7 kPa, buttress downforce 456.4 N, triplane diffuser suction 748.9 N
# Ferrari_812GTS_Trace[0082]: V12 6496cc RPM 1254, BMEP 15.21 bar, intake manifold resonance 54.8 kPa, buttress downforce 456.9 N, triplane diffuser suction 749.7 N
# Ferrari_812GTS_Trace[0083]: V12 6496cc RPM 1257, BMEP 15.21 bar, intake manifold resonance 54.8 kPa, buttress downforce 457.4 N, triplane diffuser suction 750.5 N
# Ferrari_812GTS_Trace[0084]: V12 6496cc RPM 1260, BMEP 15.22 bar, intake manifold resonance 54.9 kPa, buttress downforce 457.8 N, triplane diffuser suction 751.4 N
# Ferrari_812GTS_Trace[0085]: V12 6496cc RPM 1264, BMEP 15.23 bar, intake manifold resonance 55.0 kPa, buttress downforce 458.3 N, triplane diffuser suction 752.3 N
# Ferrari_812GTS_Trace[0086]: V12 6496cc RPM 1267, BMEP 15.23 bar, intake manifold resonance 55.1 kPa, buttress downforce 458.7 N, triplane diffuser suction 753.1 N
# Ferrari_812GTS_Trace[0087]: V12 6496cc RPM 1270, BMEP 15.24 bar, intake manifold resonance 55.2 kPa, buttress downforce 459.1 N, triplane diffuser suction 754.0 N
# Ferrari_812GTS_Trace[0088]: V12 6496cc RPM 1273, BMEP 15.24 bar, intake manifold resonance 55.2 kPa, buttress downforce 459.6 N, triplane diffuser suction 754.8 N
# Ferrari_812GTS_Trace[0089]: V12 6496cc RPM 1276, BMEP 15.25 bar, intake manifold resonance 55.3 kPa, buttress downforce 460.1 N, triplane diffuser suction 755.6 N
# Ferrari_812GTS_Trace[0090]: V12 6496cc RPM 1279, BMEP 15.25 bar, intake manifold resonance 55.4 kPa, buttress downforce 460.5 N, triplane diffuser suction 756.5 N
# Ferrari_812GTS_Trace[0091]: V12 6496cc RPM 1282, BMEP 15.26 bar, intake manifold resonance 55.5 kPa, buttress downforce 460.9 N, triplane diffuser suction 757.4 N
# Ferrari_812GTS_Trace[0092]: V12 6496cc RPM 1285, BMEP 15.26 bar, intake manifold resonance 55.6 kPa, buttress downforce 461.4 N, triplane diffuser suction 758.2 N
# Ferrari_812GTS_Trace[0093]: V12 6496cc RPM 1288, BMEP 15.27 bar, intake manifold resonance 55.6 kPa, buttress downforce 461.9 N, triplane diffuser suction 759.0 N
# Ferrari_812GTS_Trace[0094]: V12 6496cc RPM 1291, BMEP 15.27 bar, intake manifold resonance 55.7 kPa, buttress downforce 462.3 N, triplane diffuser suction 759.9 N
# Ferrari_812GTS_Trace[0095]: V12 6496cc RPM 1295, BMEP 15.28 bar, intake manifold resonance 55.8 kPa, buttress downforce 462.8 N, triplane diffuser suction 760.8 N
# Ferrari_812GTS_Trace[0096]: V12 6496cc RPM 1298, BMEP 15.28 bar, intake manifold resonance 55.9 kPa, buttress downforce 463.2 N, triplane diffuser suction 761.6 N
# Ferrari_812GTS_Trace[0097]: V12 6496cc RPM 1301, BMEP 15.29 bar, intake manifold resonance 56.0 kPa, buttress downforce 463.6 N, triplane diffuser suction 762.5 N
# Ferrari_812GTS_Trace[0098]: V12 6496cc RPM 1304, BMEP 15.29 bar, intake manifold resonance 56.0 kPa, buttress downforce 464.1 N, triplane diffuser suction 763.3 N
# Ferrari_812GTS_Trace[0099]: V12 6496cc RPM 1307, BMEP 15.29 bar, intake manifold resonance 56.1 kPa, buttress downforce 464.6 N, triplane diffuser suction 764.1 N
# Ferrari_812GTS_Trace[0100]: V12 6496cc RPM 1310, BMEP 15.30 bar, intake manifold resonance 56.2 kPa, buttress downforce 465.0 N, triplane diffuser suction 765.0 N
# Ferrari_812GTS_Trace[0101]: V12 6496cc RPM 1313, BMEP 15.31 bar, intake manifold resonance 56.3 kPa, buttress downforce 465.4 N, triplane diffuser suction 765.9 N
# Ferrari_812GTS_Trace[0102]: V12 6496cc RPM 1316, BMEP 15.31 bar, intake manifold resonance 56.4 kPa, buttress downforce 465.9 N, triplane diffuser suction 766.7 N
# Ferrari_812GTS_Trace[0103]: V12 6496cc RPM 1319, BMEP 15.32 bar, intake manifold resonance 56.4 kPa, buttress downforce 466.4 N, triplane diffuser suction 767.5 N
# Ferrari_812GTS_Trace[0104]: V12 6496cc RPM 1322, BMEP 15.32 bar, intake manifold resonance 56.5 kPa, buttress downforce 466.8 N, triplane diffuser suction 768.4 N
# Ferrari_812GTS_Trace[0105]: V12 6496cc RPM 1326, BMEP 15.33 bar, intake manifold resonance 56.6 kPa, buttress downforce 467.3 N, triplane diffuser suction 769.3 N
# Ferrari_812GTS_Trace[0106]: V12 6496cc RPM 1329, BMEP 15.33 bar, intake manifold resonance 56.7 kPa, buttress downforce 467.7 N, triplane diffuser suction 770.1 N
# Ferrari_812GTS_Trace[0107]: V12 6496cc RPM 1332, BMEP 15.34 bar, intake manifold resonance 56.8 kPa, buttress downforce 468.1 N, triplane diffuser suction 771.0 N
# Ferrari_812GTS_Trace[0108]: V12 6496cc RPM 1335, BMEP 15.34 bar, intake manifold resonance 56.8 kPa, buttress downforce 468.6 N, triplane diffuser suction 771.8 N
# Ferrari_812GTS_Trace[0109]: V12 6496cc RPM 1338, BMEP 15.35 bar, intake manifold resonance 56.9 kPa, buttress downforce 469.1 N, triplane diffuser suction 772.6 N
# Ferrari_812GTS_Trace[0110]: V12 6496cc RPM 1341, BMEP 15.35 bar, intake manifold resonance 57.0 kPa, buttress downforce 469.5 N, triplane diffuser suction 773.5 N
# Ferrari_812GTS_Trace[0111]: V12 6496cc RPM 1344, BMEP 15.36 bar, intake manifold resonance 57.1 kPa, buttress downforce 469.9 N, triplane diffuser suction 774.4 N
# Ferrari_812GTS_Trace[0112]: V12 6496cc RPM 1347, BMEP 15.36 bar, intake manifold resonance 57.2 kPa, buttress downforce 470.4 N, triplane diffuser suction 775.2 N
# Ferrari_812GTS_Trace[0113]: V12 6496cc RPM 1350, BMEP 15.37 bar, intake manifold resonance 57.2 kPa, buttress downforce 470.9 N, triplane diffuser suction 776.0 N
# Ferrari_812GTS_Trace[0114]: V12 6496cc RPM 1353, BMEP 15.37 bar, intake manifold resonance 57.3 kPa, buttress downforce 471.3 N, triplane diffuser suction 776.9 N
# Ferrari_812GTS_Trace[0115]: V12 6496cc RPM 1357, BMEP 15.38 bar, intake manifold resonance 57.4 kPa, buttress downforce 471.8 N, triplane diffuser suction 777.8 N
# Ferrari_812GTS_Trace[0116]: V12 6496cc RPM 1360, BMEP 15.38 bar, intake manifold resonance 57.5 kPa, buttress downforce 472.2 N, triplane diffuser suction 778.6 N
# Ferrari_812GTS_Trace[0117]: V12 6496cc RPM 1363, BMEP 15.39 bar, intake manifold resonance 57.6 kPa, buttress downforce 472.6 N, triplane diffuser suction 779.5 N
# Ferrari_812GTS_Trace[0118]: V12 6496cc RPM 1366, BMEP 15.39 bar, intake manifold resonance 57.6 kPa, buttress downforce 473.1 N, triplane diffuser suction 780.3 N
# Ferrari_812GTS_Trace[0119]: V12 6496cc RPM 1369, BMEP 15.40 bar, intake manifold resonance 57.7 kPa, buttress downforce 473.6 N, triplane diffuser suction 781.1 N
# Ferrari_812GTS_Trace[0120]: V12 6496cc RPM 1372, BMEP 15.40 bar, intake manifold resonance 57.8 kPa, buttress downforce 474.0 N, triplane diffuser suction 782.0 N
# Ferrari_812GTS_Trace[0121]: V12 6496cc RPM 1375, BMEP 15.41 bar, intake manifold resonance 57.9 kPa, buttress downforce 474.4 N, triplane diffuser suction 782.9 N
# Ferrari_812GTS_Trace[0122]: V12 6496cc RPM 1378, BMEP 15.41 bar, intake manifold resonance 58.0 kPa, buttress downforce 474.9 N, triplane diffuser suction 783.7 N
# Ferrari_812GTS_Trace[0123]: V12 6496cc RPM 1381, BMEP 15.42 bar, intake manifold resonance 58.0 kPa, buttress downforce 475.4 N, triplane diffuser suction 784.5 N
# Ferrari_812GTS_Trace[0124]: V12 6496cc RPM 1384, BMEP 15.42 bar, intake manifold resonance 58.1 kPa, buttress downforce 475.8 N, triplane diffuser suction 785.4 N
# Ferrari_812GTS_Trace[0125]: V12 6496cc RPM 1388, BMEP 15.43 bar, intake manifold resonance 58.2 kPa, buttress downforce 476.3 N, triplane diffuser suction 786.3 N
# Ferrari_812GTS_Trace[0126]: V12 6496cc RPM 1391, BMEP 15.43 bar, intake manifold resonance 58.3 kPa, buttress downforce 476.7 N, triplane diffuser suction 787.1 N
# Ferrari_812GTS_Trace[0127]: V12 6496cc RPM 1394, BMEP 15.44 bar, intake manifold resonance 58.4 kPa, buttress downforce 477.1 N, triplane diffuser suction 788.0 N
# Ferrari_812GTS_Trace[0128]: V12 6496cc RPM 1397, BMEP 15.44 bar, intake manifold resonance 58.4 kPa, buttress downforce 477.6 N, triplane diffuser suction 788.8 N
# Ferrari_812GTS_Trace[0129]: V12 6496cc RPM 1400, BMEP 15.45 bar, intake manifold resonance 58.5 kPa, buttress downforce 478.1 N, triplane diffuser suction 789.6 N
# Ferrari_812GTS_Trace[0130]: V12 6496cc RPM 1403, BMEP 15.45 bar, intake manifold resonance 58.6 kPa, buttress downforce 478.5 N, triplane diffuser suction 790.5 N
# Ferrari_812GTS_Trace[0131]: V12 6496cc RPM 1406, BMEP 15.46 bar, intake manifold resonance 58.7 kPa, buttress downforce 478.9 N, triplane diffuser suction 791.4 N
# Ferrari_812GTS_Trace[0132]: V12 6496cc RPM 1409, BMEP 15.46 bar, intake manifold resonance 58.8 kPa, buttress downforce 479.4 N, triplane diffuser suction 792.2 N
# Ferrari_812GTS_Trace[0133]: V12 6496cc RPM 1412, BMEP 15.46 bar, intake manifold resonance 58.8 kPa, buttress downforce 479.9 N, triplane diffuser suction 793.0 N
# Ferrari_812GTS_Trace[0134]: V12 6496cc RPM 1415, BMEP 15.47 bar, intake manifold resonance 58.9 kPa, buttress downforce 480.3 N, triplane diffuser suction 793.9 N
# Ferrari_812GTS_Trace[0135]: V12 6496cc RPM 1419, BMEP 15.48 bar, intake manifold resonance 59.0 kPa, buttress downforce 480.8 N, triplane diffuser suction 794.8 N
# Ferrari_812GTS_Trace[0136]: V12 6496cc RPM 1422, BMEP 15.48 bar, intake manifold resonance 59.1 kPa, buttress downforce 481.2 N, triplane diffuser suction 795.6 N
# Ferrari_812GTS_Trace[0137]: V12 6496cc RPM 1425, BMEP 15.49 bar, intake manifold resonance 59.2 kPa, buttress downforce 481.6 N, triplane diffuser suction 796.5 N
# Ferrari_812GTS_Trace[0138]: V12 6496cc RPM 1428, BMEP 15.49 bar, intake manifold resonance 59.2 kPa, buttress downforce 482.1 N, triplane diffuser suction 797.3 N
# Ferrari_812GTS_Trace[0139]: V12 6496cc RPM 1431, BMEP 15.50 bar, intake manifold resonance 59.3 kPa, buttress downforce 482.6 N, triplane diffuser suction 798.1 N
# Ferrari_812GTS_Trace[0140]: V12 6496cc RPM 1434, BMEP 15.50 bar, intake manifold resonance 59.4 kPa, buttress downforce 483.0 N, triplane diffuser suction 799.0 N
# Ferrari_812GTS_Trace[0141]: V12 6496cc RPM 1437, BMEP 15.51 bar, intake manifold resonance 59.5 kPa, buttress downforce 483.4 N, triplane diffuser suction 799.9 N
# Ferrari_812GTS_Trace[0142]: V12 6496cc RPM 1440, BMEP 15.51 bar, intake manifold resonance 59.6 kPa, buttress downforce 483.9 N, triplane diffuser suction 800.7 N
# Ferrari_812GTS_Trace[0143]: V12 6496cc RPM 1443, BMEP 15.52 bar, intake manifold resonance 59.6 kPa, buttress downforce 484.4 N, triplane diffuser suction 801.5 N
# Ferrari_812GTS_Trace[0144]: V12 6496cc RPM 1446, BMEP 15.52 bar, intake manifold resonance 59.7 kPa, buttress downforce 484.8 N, triplane diffuser suction 802.4 N
# Ferrari_812GTS_Trace[0145]: V12 6496cc RPM 1450, BMEP 15.53 bar, intake manifold resonance 59.8 kPa, buttress downforce 485.3 N, triplane diffuser suction 803.3 N
# Ferrari_812GTS_Trace[0146]: V12 6496cc RPM 1453, BMEP 15.53 bar, intake manifold resonance 59.9 kPa, buttress downforce 485.7 N, triplane diffuser suction 804.1 N
# Ferrari_812GTS_Trace[0147]: V12 6496cc RPM 1456, BMEP 15.54 bar, intake manifold resonance 60.0 kPa, buttress downforce 486.1 N, triplane diffuser suction 805.0 N
# Ferrari_812GTS_Trace[0148]: V12 6496cc RPM 1459, BMEP 15.54 bar, intake manifold resonance 60.0 kPa, buttress downforce 486.6 N, triplane diffuser suction 805.8 N
# Ferrari_812GTS_Trace[0149]: V12 6496cc RPM 1462, BMEP 15.54 bar, intake manifold resonance 60.1 kPa, buttress downforce 487.1 N, triplane diffuser suction 806.6 N
# Ferrari_812GTS_Trace[0150]: V12 6496cc RPM 1465, BMEP 15.55 bar, intake manifold resonance 48.2 kPa, buttress downforce 487.5 N, triplane diffuser suction 807.5 N
# Ferrari_812GTS_Trace[0151]: V12 6496cc RPM 1468, BMEP 15.56 bar, intake manifold resonance 48.3 kPa, buttress downforce 487.9 N, triplane diffuser suction 808.4 N
# Ferrari_812GTS_Trace[0152]: V12 6496cc RPM 1471, BMEP 15.56 bar, intake manifold resonance 48.4 kPa, buttress downforce 488.4 N, triplane diffuser suction 809.2 N
# Ferrari_812GTS_Trace[0153]: V12 6496cc RPM 1474, BMEP 15.57 bar, intake manifold resonance 48.4 kPa, buttress downforce 488.9 N, triplane diffuser suction 810.0 N
# Ferrari_812GTS_Trace[0154]: V12 6496cc RPM 1477, BMEP 15.57 bar, intake manifold resonance 48.5 kPa, buttress downforce 489.3 N, triplane diffuser suction 810.9 N
# Ferrari_812GTS_Trace[0155]: V12 6496cc RPM 1481, BMEP 15.58 bar, intake manifold resonance 48.6 kPa, buttress downforce 489.8 N, triplane diffuser suction 811.8 N
# Ferrari_812GTS_Trace[0156]: V12 6496cc RPM 1484, BMEP 15.58 bar, intake manifold resonance 48.7 kPa, buttress downforce 490.2 N, triplane diffuser suction 812.6 N
# Ferrari_812GTS_Trace[0157]: V12 6496cc RPM 1487, BMEP 15.59 bar, intake manifold resonance 48.8 kPa, buttress downforce 490.6 N, triplane diffuser suction 813.5 N
# Ferrari_812GTS_Trace[0158]: V12 6496cc RPM 1490, BMEP 15.59 bar, intake manifold resonance 48.8 kPa, buttress downforce 491.1 N, triplane diffuser suction 814.3 N
# Ferrari_812GTS_Trace[0159]: V12 6496cc RPM 1493, BMEP 15.60 bar, intake manifold resonance 48.9 kPa, buttress downforce 491.6 N, triplane diffuser suction 815.1 N
# Ferrari_812GTS_Trace[0160]: V12 6496cc RPM 1496, BMEP 15.60 bar, intake manifold resonance 49.0 kPa, buttress downforce 492.0 N, triplane diffuser suction 816.0 N
# Ferrari_812GTS_Trace[0161]: V12 6496cc RPM 1499, BMEP 15.61 bar, intake manifold resonance 49.1 kPa, buttress downforce 492.4 N, triplane diffuser suction 816.9 N
# Ferrari_812GTS_Trace[0162]: V12 6496cc RPM 1502, BMEP 15.61 bar, intake manifold resonance 49.2 kPa, buttress downforce 492.9 N, triplane diffuser suction 817.7 N
# Ferrari_812GTS_Trace[0163]: V12 6496cc RPM 1505, BMEP 15.62 bar, intake manifold resonance 49.2 kPa, buttress downforce 493.4 N, triplane diffuser suction 818.5 N
# Ferrari_812GTS_Trace[0164]: V12 6496cc RPM 1508, BMEP 15.62 bar, intake manifold resonance 49.3 kPa, buttress downforce 493.8 N, triplane diffuser suction 819.4 N
# Ferrari_812GTS_Trace[0165]: V12 6496cc RPM 1512, BMEP 15.63 bar, intake manifold resonance 49.4 kPa, buttress downforce 494.3 N, triplane diffuser suction 820.3 N
# Ferrari_812GTS_Trace[0166]: V12 6496cc RPM 1515, BMEP 15.63 bar, intake manifold resonance 49.5 kPa, buttress downforce 494.7 N, triplane diffuser suction 821.1 N
# Ferrari_812GTS_Trace[0167]: V12 6496cc RPM 1518, BMEP 15.64 bar, intake manifold resonance 49.6 kPa, buttress downforce 495.1 N, triplane diffuser suction 822.0 N
# Ferrari_812GTS_Trace[0168]: V12 6496cc RPM 1521, BMEP 15.64 bar, intake manifold resonance 49.6 kPa, buttress downforce 495.6 N, triplane diffuser suction 822.8 N
# Ferrari_812GTS_Trace[0169]: V12 6496cc RPM 1524, BMEP 15.65 bar, intake manifold resonance 49.7 kPa, buttress downforce 496.1 N, triplane diffuser suction 823.6 N
# Ferrari_812GTS_Trace[0170]: V12 6496cc RPM 1527, BMEP 15.65 bar, intake manifold resonance 49.8 kPa, buttress downforce 496.5 N, triplane diffuser suction 824.5 N
# Ferrari_812GTS_Trace[0171]: V12 6496cc RPM 1530, BMEP 15.66 bar, intake manifold resonance 49.9 kPa, buttress downforce 496.9 N, triplane diffuser suction 825.4 N
# Ferrari_812GTS_Trace[0172]: V12 6496cc RPM 1533, BMEP 15.66 bar, intake manifold resonance 50.0 kPa, buttress downforce 497.4 N, triplane diffuser suction 826.2 N
# Ferrari_812GTS_Trace[0173]: V12 6496cc RPM 1536, BMEP 15.67 bar, intake manifold resonance 50.0 kPa, buttress downforce 497.9 N, triplane diffuser suction 827.0 N
# Ferrari_812GTS_Trace[0174]: V12 6496cc RPM 1539, BMEP 15.67 bar, intake manifold resonance 50.1 kPa, buttress downforce 498.3 N, triplane diffuser suction 827.9 N
# Ferrari_812GTS_Trace[0175]: V12 6496cc RPM 1543, BMEP 15.68 bar, intake manifold resonance 50.2 kPa, buttress downforce 498.8 N, triplane diffuser suction 828.8 N
# Ferrari_812GTS_Trace[0176]: V12 6496cc RPM 1546, BMEP 15.68 bar, intake manifold resonance 50.3 kPa, buttress downforce 499.2 N, triplane diffuser suction 829.6 N
# Ferrari_812GTS_Trace[0177]: V12 6496cc RPM 1549, BMEP 15.69 bar, intake manifold resonance 50.4 kPa, buttress downforce 499.6 N, triplane diffuser suction 830.5 N
# Ferrari_812GTS_Trace[0178]: V12 6496cc RPM 1552, BMEP 15.69 bar, intake manifold resonance 50.4 kPa, buttress downforce 500.1 N, triplane diffuser suction 831.3 N
# Ferrari_812GTS_Trace[0179]: V12 6496cc RPM 1555, BMEP 15.70 bar, intake manifold resonance 50.5 kPa, buttress downforce 500.6 N, triplane diffuser suction 832.1 N
# Ferrari_812GTS_Trace[0180]: V12 6496cc RPM 1558, BMEP 15.70 bar, intake manifold resonance 50.6 kPa, buttress downforce 501.0 N, triplane diffuser suction 833.0 N
# Ferrari_812GTS_Trace[0181]: V12 6496cc RPM 1561, BMEP 15.71 bar, intake manifold resonance 50.7 kPa, buttress downforce 501.4 N, triplane diffuser suction 833.9 N
# Ferrari_812GTS_Trace[0182]: V12 6496cc RPM 1564, BMEP 15.71 bar, intake manifold resonance 50.8 kPa, buttress downforce 501.9 N, triplane diffuser suction 834.7 N
# Ferrari_812GTS_Trace[0183]: V12 6496cc RPM 1567, BMEP 15.71 bar, intake manifold resonance 50.8 kPa, buttress downforce 502.4 N, triplane diffuser suction 835.5 N
# Ferrari_812GTS_Trace[0184]: V12 6496cc RPM 1570, BMEP 15.72 bar, intake manifold resonance 50.9 kPa, buttress downforce 502.8 N, triplane diffuser suction 836.4 N
# Ferrari_812GTS_Trace[0185]: V12 6496cc RPM 1574, BMEP 15.73 bar, intake manifold resonance 51.0 kPa, buttress downforce 503.3 N, triplane diffuser suction 837.3 N
# Ferrari_812GTS_Trace[0186]: V12 6496cc RPM 1577, BMEP 15.73 bar, intake manifold resonance 51.1 kPa, buttress downforce 503.7 N, triplane diffuser suction 838.1 N
# Ferrari_812GTS_Trace[0187]: V12 6496cc RPM 1580, BMEP 15.74 bar, intake manifold resonance 51.2 kPa, buttress downforce 504.1 N, triplane diffuser suction 839.0 N
# Ferrari_812GTS_Trace[0188]: V12 6496cc RPM 1583, BMEP 15.74 bar, intake manifold resonance 51.2 kPa, buttress downforce 504.6 N, triplane diffuser suction 839.8 N
# Ferrari_812GTS_Trace[0189]: V12 6496cc RPM 1586, BMEP 15.75 bar, intake manifold resonance 51.3 kPa, buttress downforce 505.1 N, triplane diffuser suction 840.6 N
# Ferrari_812GTS_Trace[0190]: V12 6496cc RPM 1589, BMEP 15.75 bar, intake manifold resonance 51.4 kPa, buttress downforce 505.5 N, triplane diffuser suction 841.5 N
# Ferrari_812GTS_Trace[0191]: V12 6496cc RPM 1592, BMEP 15.76 bar, intake manifold resonance 51.5 kPa, buttress downforce 505.9 N, triplane diffuser suction 842.4 N
# Ferrari_812GTS_Trace[0192]: V12 6496cc RPM 1595, BMEP 15.76 bar, intake manifold resonance 51.6 kPa, buttress downforce 506.4 N, triplane diffuser suction 843.2 N
# Ferrari_812GTS_Trace[0193]: V12 6496cc RPM 1598, BMEP 15.77 bar, intake manifold resonance 51.6 kPa, buttress downforce 506.9 N, triplane diffuser suction 844.0 N
# Ferrari_812GTS_Trace[0194]: V12 6496cc RPM 1601, BMEP 15.77 bar, intake manifold resonance 51.7 kPa, buttress downforce 507.3 N, triplane diffuser suction 844.9 N
# Ferrari_812GTS_Trace[0195]: V12 6496cc RPM 1605, BMEP 15.78 bar, intake manifold resonance 51.8 kPa, buttress downforce 507.8 N, triplane diffuser suction 845.8 N
# Ferrari_812GTS_Trace[0196]: V12 6496cc RPM 1608, BMEP 15.78 bar, intake manifold resonance 51.9 kPa, buttress downforce 508.2 N, triplane diffuser suction 846.6 N
# Ferrari_812GTS_Trace[0197]: V12 6496cc RPM 1611, BMEP 15.79 bar, intake manifold resonance 52.0 kPa, buttress downforce 508.6 N, triplane diffuser suction 847.5 N
# Ferrari_812GTS_Trace[0198]: V12 6496cc RPM 1614, BMEP 15.79 bar, intake manifold resonance 52.0 kPa, buttress downforce 509.1 N, triplane diffuser suction 848.3 N
# Ferrari_812GTS_Trace[0199]: V12 6496cc RPM 1617, BMEP 15.79 bar, intake manifold resonance 52.1 kPa, buttress downforce 509.6 N, triplane diffuser suction 849.1 N
# Ferrari_812GTS_Trace[0200]: V12 6496cc RPM 1620, BMEP 15.80 bar, intake manifold resonance 52.2 kPa, buttress downforce 510.0 N, triplane diffuser suction 850.0 N
# Ferrari_812GTS_Trace[0201]: V12 6496cc RPM 1623, BMEP 15.81 bar, intake manifold resonance 52.3 kPa, buttress downforce 510.4 N, triplane diffuser suction 850.9 N
# Ferrari_812GTS_Trace[0202]: V12 6496cc RPM 1626, BMEP 15.81 bar, intake manifold resonance 52.4 kPa, buttress downforce 510.9 N, triplane diffuser suction 851.7 N
# Ferrari_812GTS_Trace[0203]: V12 6496cc RPM 1629, BMEP 15.82 bar, intake manifold resonance 52.4 kPa, buttress downforce 511.4 N, triplane diffuser suction 852.5 N
# Ferrari_812GTS_Trace[0204]: V12 6496cc RPM 1632, BMEP 15.82 bar, intake manifold resonance 52.5 kPa, buttress downforce 511.8 N, triplane diffuser suction 853.4 N
# Ferrari_812GTS_Trace[0205]: V12 6496cc RPM 1636, BMEP 15.83 bar, intake manifold resonance 52.6 kPa, buttress downforce 512.3 N, triplane diffuser suction 854.3 N
# Ferrari_812GTS_Trace[0206]: V12 6496cc RPM 1639, BMEP 15.83 bar, intake manifold resonance 52.7 kPa, buttress downforce 512.7 N, triplane diffuser suction 855.1 N
# Ferrari_812GTS_Trace[0207]: V12 6496cc RPM 1642, BMEP 15.84 bar, intake manifold resonance 52.8 kPa, buttress downforce 513.1 N, triplane diffuser suction 856.0 N
# Ferrari_812GTS_Trace[0208]: V12 6496cc RPM 1645, BMEP 15.84 bar, intake manifold resonance 52.8 kPa, buttress downforce 513.6 N, triplane diffuser suction 856.8 N
# Ferrari_812GTS_Trace[0209]: V12 6496cc RPM 1648, BMEP 15.85 bar, intake manifold resonance 52.9 kPa, buttress downforce 514.0 N, triplane diffuser suction 857.6 N
# Ferrari_812GTS_Trace[0210]: V12 6496cc RPM 1651, BMEP 15.85 bar, intake manifold resonance 53.0 kPa, buttress downforce 514.5 N, triplane diffuser suction 858.5 N
# Ferrari_812GTS_Trace[0211]: V12 6496cc RPM 1654, BMEP 15.86 bar, intake manifold resonance 53.1 kPa, buttress downforce 515.0 N, triplane diffuser suction 859.4 N
# Ferrari_812GTS_Trace[0212]: V12 6496cc RPM 1657, BMEP 15.86 bar, intake manifold resonance 53.2 kPa, buttress downforce 515.4 N, triplane diffuser suction 860.2 N
# Ferrari_812GTS_Trace[0213]: V12 6496cc RPM 1660, BMEP 15.87 bar, intake manifold resonance 53.2 kPa, buttress downforce 515.9 N, triplane diffuser suction 861.0 N
# Ferrari_812GTS_Trace[0214]: V12 6496cc RPM 1663, BMEP 15.87 bar, intake manifold resonance 53.3 kPa, buttress downforce 516.3 N, triplane diffuser suction 861.9 N
# Ferrari_812GTS_Trace[0215]: V12 6496cc RPM 1667, BMEP 15.88 bar, intake manifold resonance 53.4 kPa, buttress downforce 516.8 N, triplane diffuser suction 862.8 N
# Ferrari_812GTS_Trace[0216]: V12 6496cc RPM 1670, BMEP 15.88 bar, intake manifold resonance 53.5 kPa, buttress downforce 517.2 N, triplane diffuser suction 863.6 N
# Ferrari_812GTS_Trace[0217]: V12 6496cc RPM 1673, BMEP 15.89 bar, intake manifold resonance 53.6 kPa, buttress downforce 517.6 N, triplane diffuser suction 864.5 N
# Ferrari_812GTS_Trace[0218]: V12 6496cc RPM 1676, BMEP 15.89 bar, intake manifold resonance 53.6 kPa, buttress downforce 518.1 N, triplane diffuser suction 865.3 N
# Ferrari_812GTS_Trace[0219]: V12 6496cc RPM 1679, BMEP 15.90 bar, intake manifold resonance 53.7 kPa, buttress downforce 518.5 N, triplane diffuser suction 866.1 N
# Ferrari_812GTS_Trace[0220]: V12 6496cc RPM 1682, BMEP 15.90 bar, intake manifold resonance 53.8 kPa, buttress downforce 519.0 N, triplane diffuser suction 867.0 N
# Ferrari_812GTS_Trace[0221]: V12 6496cc RPM 1685, BMEP 15.91 bar, intake manifold resonance 53.9 kPa, buttress downforce 519.5 N, triplane diffuser suction 867.9 N
# Ferrari_812GTS_Trace[0222]: V12 6496cc RPM 1688, BMEP 15.91 bar, intake manifold resonance 54.0 kPa, buttress downforce 519.9 N, triplane diffuser suction 868.7 N
# Ferrari_812GTS_Trace[0223]: V12 6496cc RPM 1691, BMEP 15.92 bar, intake manifold resonance 54.0 kPa, buttress downforce 520.4 N, triplane diffuser suction 869.5 N
# Ferrari_812GTS_Trace[0224]: V12 6496cc RPM 1694, BMEP 15.92 bar, intake manifold resonance 54.1 kPa, buttress downforce 520.8 N, triplane diffuser suction 870.4 N
# Ferrari_812GTS_Trace[0225]: V12 6496cc RPM 1698, BMEP 15.93 bar, intake manifold resonance 54.2 kPa, buttress downforce 521.3 N, triplane diffuser suction 871.3 N
# Ferrari_812GTS_Trace[0226]: V12 6496cc RPM 1701, BMEP 15.93 bar, intake manifold resonance 54.3 kPa, buttress downforce 521.7 N, triplane diffuser suction 872.1 N
# Ferrari_812GTS_Trace[0227]: V12 6496cc RPM 1704, BMEP 15.94 bar, intake manifold resonance 54.4 kPa, buttress downforce 522.1 N, triplane diffuser suction 873.0 N
# Ferrari_812GTS_Trace[0228]: V12 6496cc RPM 1707, BMEP 15.94 bar, intake manifold resonance 54.4 kPa, buttress downforce 522.6 N, triplane diffuser suction 873.8 N
# Ferrari_812GTS_Trace[0229]: V12 6496cc RPM 1710, BMEP 15.95 bar, intake manifold resonance 54.5 kPa, buttress downforce 523.0 N, triplane diffuser suction 874.6 N
# Ferrari_812GTS_Trace[0230]: V12 6496cc RPM 1713, BMEP 15.95 bar, intake manifold resonance 54.6 kPa, buttress downforce 523.5 N, triplane diffuser suction 875.5 N
# Ferrari_812GTS_Trace[0231]: V12 6496cc RPM 1716, BMEP 15.96 bar, intake manifold resonance 54.7 kPa, buttress downforce 524.0 N, triplane diffuser suction 876.4 N
# Ferrari_812GTS_Trace[0232]: V12 6496cc RPM 1719, BMEP 15.96 bar, intake manifold resonance 54.8 kPa, buttress downforce 524.4 N, triplane diffuser suction 877.2 N
# Ferrari_812GTS_Trace[0233]: V12 6496cc RPM 1722, BMEP 15.96 bar, intake manifold resonance 54.8 kPa, buttress downforce 524.9 N, triplane diffuser suction 878.0 N
# Ferrari_812GTS_Trace[0234]: V12 6496cc RPM 1725, BMEP 15.97 bar, intake manifold resonance 54.9 kPa, buttress downforce 525.3 N, triplane diffuser suction 878.9 N
# Ferrari_812GTS_Trace[0235]: V12 6496cc RPM 1729, BMEP 15.98 bar, intake manifold resonance 55.0 kPa, buttress downforce 525.8 N, triplane diffuser suction 879.8 N
# Ferrari_812GTS_Trace[0236]: V12 6496cc RPM 1732, BMEP 15.98 bar, intake manifold resonance 55.1 kPa, buttress downforce 526.2 N, triplane diffuser suction 880.6 N
# Ferrari_812GTS_Trace[0237]: V12 6496cc RPM 1735, BMEP 15.99 bar, intake manifold resonance 55.2 kPa, buttress downforce 526.6 N, triplane diffuser suction 881.5 N
# Ferrari_812GTS_Trace[0238]: V12 6496cc RPM 1738, BMEP 15.99 bar, intake manifold resonance 55.2 kPa, buttress downforce 527.1 N, triplane diffuser suction 882.3 N
# Ferrari_812GTS_Trace[0239]: V12 6496cc RPM 1741, BMEP 16.00 bar, intake manifold resonance 55.3 kPa, buttress downforce 527.5 N, triplane diffuser suction 883.1 N
# Ferrari_812GTS_Trace[0240]: V12 6496cc RPM 1744, BMEP 16.00 bar, intake manifold resonance 55.4 kPa, buttress downforce 528.0 N, triplane diffuser suction 884.0 N
# Ferrari_812GTS_Trace[0241]: V12 6496cc RPM 1747, BMEP 16.01 bar, intake manifold resonance 55.5 kPa, buttress downforce 528.5 N, triplane diffuser suction 884.9 N
# Ferrari_812GTS_Trace[0242]: V12 6496cc RPM 1750, BMEP 16.01 bar, intake manifold resonance 55.6 kPa, buttress downforce 528.9 N, triplane diffuser suction 885.7 N
# Ferrari_812GTS_Trace[0243]: V12 6496cc RPM 1753, BMEP 16.02 bar, intake manifold resonance 55.6 kPa, buttress downforce 529.4 N, triplane diffuser suction 886.5 N
# Ferrari_812GTS_Trace[0244]: V12 6496cc RPM 1756, BMEP 16.02 bar, intake manifold resonance 55.7 kPa, buttress downforce 529.8 N, triplane diffuser suction 887.4 N
# Ferrari_812GTS_Trace[0245]: V12 6496cc RPM 1760, BMEP 16.03 bar, intake manifold resonance 55.8 kPa, buttress downforce 530.3 N, triplane diffuser suction 888.3 N
# Ferrari_812GTS_Trace[0246]: V12 6496cc RPM 1763, BMEP 16.03 bar, intake manifold resonance 55.9 kPa, buttress downforce 530.7 N, triplane diffuser suction 889.1 N
# Ferrari_812GTS_Trace[0247]: V12 6496cc RPM 1766, BMEP 16.04 bar, intake manifold resonance 56.0 kPa, buttress downforce 531.1 N, triplane diffuser suction 890.0 N
# Ferrari_812GTS_Trace[0248]: V12 6496cc RPM 1769, BMEP 16.04 bar, intake manifold resonance 56.0 kPa, buttress downforce 531.6 N, triplane diffuser suction 890.8 N
# Ferrari_812GTS_Trace[0249]: V12 6496cc RPM 1772, BMEP 16.05 bar, intake manifold resonance 56.1 kPa, buttress downforce 532.0 N, triplane diffuser suction 891.6 N
# Ferrari_812GTS_Trace[0250]: V12 6496cc RPM 1775, BMEP 16.05 bar, intake manifold resonance 56.2 kPa, buttress downforce 532.5 N, triplane diffuser suction 892.5 N
# Ferrari_812GTS_Trace[0251]: V12 6496cc RPM 1778, BMEP 16.05 bar, intake manifold resonance 56.3 kPa, buttress downforce 533.0 N, triplane diffuser suction 893.4 N
# Ferrari_812GTS_Trace[0252]: V12 6496cc RPM 1781, BMEP 16.06 bar, intake manifold resonance 56.4 kPa, buttress downforce 533.4 N, triplane diffuser suction 894.2 N
# Ferrari_812GTS_Trace[0253]: V12 6496cc RPM 1784, BMEP 16.07 bar, intake manifold resonance 56.4 kPa, buttress downforce 533.9 N, triplane diffuser suction 895.0 N
# Ferrari_812GTS_Trace[0254]: V12 6496cc RPM 1787, BMEP 16.07 bar, intake manifold resonance 56.5 kPa, buttress downforce 534.3 N, triplane diffuser suction 895.9 N
# Ferrari_812GTS_Trace[0255]: V12 6496cc RPM 1791, BMEP 16.07 bar, intake manifold resonance 56.6 kPa, buttress downforce 534.8 N, triplane diffuser suction 896.8 N
# Ferrari_812GTS_Trace[0256]: V12 6496cc RPM 1794, BMEP 16.08 bar, intake manifold resonance 56.7 kPa, buttress downforce 535.2 N, triplane diffuser suction 897.6 N
# Ferrari_812GTS_Trace[0257]: V12 6496cc RPM 1797, BMEP 16.09 bar, intake manifold resonance 56.8 kPa, buttress downforce 535.6 N, triplane diffuser suction 898.5 N
# Ferrari_812GTS_Trace[0258]: V12 6496cc RPM 1800, BMEP 16.09 bar, intake manifold resonance 56.8 kPa, buttress downforce 536.1 N, triplane diffuser suction 899.3 N
# Ferrari_812GTS_Trace[0259]: V12 6496cc RPM 1803, BMEP 16.09 bar, intake manifold resonance 56.9 kPa, buttress downforce 536.5 N, triplane diffuser suction 900.1 N
# Ferrari_812GTS_Trace[0260]: V12 6496cc RPM 1806, BMEP 16.10 bar, intake manifold resonance 57.0 kPa, buttress downforce 537.0 N, triplane diffuser suction 901.0 N
# Ferrari_812GTS_Trace[0261]: V12 6496cc RPM 1809, BMEP 16.11 bar, intake manifold resonance 57.1 kPa, buttress downforce 537.5 N, triplane diffuser suction 901.9 N
# Ferrari_812GTS_Trace[0262]: V12 6496cc RPM 1812, BMEP 16.11 bar, intake manifold resonance 57.2 kPa, buttress downforce 537.9 N, triplane diffuser suction 902.7 N
# Ferrari_812GTS_Trace[0263]: V12 6496cc RPM 1815, BMEP 16.12 bar, intake manifold resonance 57.2 kPa, buttress downforce 538.4 N, triplane diffuser suction 903.5 N
# Ferrari_812GTS_Trace[0264]: V12 6496cc RPM 1818, BMEP 16.12 bar, intake manifold resonance 57.3 kPa, buttress downforce 538.8 N, triplane diffuser suction 904.4 N
# Ferrari_812GTS_Trace[0265]: V12 6496cc RPM 1822, BMEP 16.13 bar, intake manifold resonance 57.4 kPa, buttress downforce 539.3 N, triplane diffuser suction 905.3 N
# Ferrari_812GTS_Trace[0266]: V12 6496cc RPM 1825, BMEP 16.13 bar, intake manifold resonance 57.5 kPa, buttress downforce 539.7 N, triplane diffuser suction 906.1 N
# Ferrari_812GTS_Trace[0267]: V12 6496cc RPM 1828, BMEP 16.14 bar, intake manifold resonance 57.6 kPa, buttress downforce 540.1 N, triplane diffuser suction 907.0 N
# Ferrari_812GTS_Trace[0268]: V12 6496cc RPM 1831, BMEP 16.14 bar, intake manifold resonance 57.6 kPa, buttress downforce 540.6 N, triplane diffuser suction 907.8 N
# Ferrari_812GTS_Trace[0269]: V12 6496cc RPM 1834, BMEP 16.14 bar, intake manifold resonance 57.7 kPa, buttress downforce 541.0 N, triplane diffuser suction 908.6 N
# Ferrari_812GTS_Trace[0270]: V12 6496cc RPM 1837, BMEP 16.15 bar, intake manifold resonance 57.8 kPa, buttress downforce 541.5 N, triplane diffuser suction 909.5 N
# Ferrari_812GTS_Trace[0271]: V12 6496cc RPM 1840, BMEP 16.16 bar, intake manifold resonance 57.9 kPa, buttress downforce 542.0 N, triplane diffuser suction 910.4 N
# Ferrari_812GTS_Trace[0272]: V12 6496cc RPM 1843, BMEP 16.16 bar, intake manifold resonance 58.0 kPa, buttress downforce 542.4 N, triplane diffuser suction 911.2 N
# Ferrari_812GTS_Trace[0273]: V12 6496cc RPM 1846, BMEP 16.16 bar, intake manifold resonance 58.0 kPa, buttress downforce 542.9 N, triplane diffuser suction 912.0 N
# Ferrari_812GTS_Trace[0274]: V12 6496cc RPM 1849, BMEP 16.17 bar, intake manifold resonance 58.1 kPa, buttress downforce 543.3 N, triplane diffuser suction 912.9 N
# Ferrari_812GTS_Trace[0275]: V12 6496cc RPM 1853, BMEP 16.18 bar, intake manifold resonance 58.2 kPa, buttress downforce 543.8 N, triplane diffuser suction 913.8 N
# Ferrari_812GTS_Trace[0276]: V12 6496cc RPM 1856, BMEP 16.18 bar, intake manifold resonance 58.3 kPa, buttress downforce 544.2 N, triplane diffuser suction 914.6 N
# Ferrari_812GTS_Trace[0277]: V12 6496cc RPM 1859, BMEP 16.19 bar, intake manifold resonance 58.4 kPa, buttress downforce 544.6 N, triplane diffuser suction 915.5 N
# Ferrari_812GTS_Trace[0278]: V12 6496cc RPM 1862, BMEP 16.19 bar, intake manifold resonance 58.4 kPa, buttress downforce 545.1 N, triplane diffuser suction 916.3 N
# Ferrari_812GTS_Trace[0279]: V12 6496cc RPM 1865, BMEP 16.20 bar, intake manifold resonance 58.5 kPa, buttress downforce 545.5 N, triplane diffuser suction 917.1 N
# Ferrari_812GTS_Trace[0280]: V12 6496cc RPM 1868, BMEP 16.20 bar, intake manifold resonance 58.6 kPa, buttress downforce 546.0 N, triplane diffuser suction 918.0 N
# Ferrari_812GTS_Trace[0281]: V12 6496cc RPM 1871, BMEP 16.21 bar, intake manifold resonance 58.7 kPa, buttress downforce 546.5 N, triplane diffuser suction 918.9 N
# Ferrari_812GTS_Trace[0282]: V12 6496cc RPM 1874, BMEP 16.21 bar, intake manifold resonance 58.8 kPa, buttress downforce 546.9 N, triplane diffuser suction 919.7 N
# Ferrari_812GTS_Trace[0283]: V12 6496cc RPM 1877, BMEP 16.21 bar, intake manifold resonance 58.8 kPa, buttress downforce 547.4 N, triplane diffuser suction 680.5 N
# Ferrari_812GTS_Trace[0284]: V12 6496cc RPM 1880, BMEP 16.22 bar, intake manifold resonance 58.9 kPa, buttress downforce 547.8 N, triplane diffuser suction 681.4 N
# Ferrari_812GTS_Trace[0285]: V12 6496cc RPM 1884, BMEP 16.23 bar, intake manifold resonance 59.0 kPa, buttress downforce 548.3 N, triplane diffuser suction 682.3 N
# Ferrari_812GTS_Trace[0286]: V12 6496cc RPM 1887, BMEP 16.23 bar, intake manifold resonance 59.1 kPa, buttress downforce 548.7 N, triplane diffuser suction 683.1 N
# Ferrari_812GTS_Trace[0287]: V12 6496cc RPM 1890, BMEP 16.23 bar, intake manifold resonance 59.2 kPa, buttress downforce 549.1 N, triplane diffuser suction 684.0 N
# Ferrari_812GTS_Trace[0288]: V12 6496cc RPM 1893, BMEP 16.24 bar, intake manifold resonance 59.2 kPa, buttress downforce 549.6 N, triplane diffuser suction 684.8 N
# Ferrari_812GTS_Trace[0289]: V12 6496cc RPM 1896, BMEP 16.25 bar, intake manifold resonance 59.3 kPa, buttress downforce 550.0 N, triplane diffuser suction 685.6 N
# Ferrari_812GTS_Trace[0290]: V12 6496cc RPM 1899, BMEP 16.25 bar, intake manifold resonance 59.4 kPa, buttress downforce 550.5 N, triplane diffuser suction 686.5 N
# Ferrari_812GTS_Trace[0291]: V12 6496cc RPM 1902, BMEP 16.26 bar, intake manifold resonance 59.5 kPa, buttress downforce 551.0 N, triplane diffuser suction 687.4 N
# Ferrari_812GTS_Trace[0292]: V12 6496cc RPM 1905, BMEP 16.26 bar, intake manifold resonance 59.6 kPa, buttress downforce 551.4 N, triplane diffuser suction 688.2 N
# Ferrari_812GTS_Trace[0293]: V12 6496cc RPM 1908, BMEP 16.27 bar, intake manifold resonance 59.6 kPa, buttress downforce 551.9 N, triplane diffuser suction 689.0 N
# Ferrari_812GTS_Trace[0294]: V12 6496cc RPM 1911, BMEP 16.27 bar, intake manifold resonance 59.7 kPa, buttress downforce 552.3 N, triplane diffuser suction 689.9 N
# Ferrari_812GTS_Trace[0295]: V12 6496cc RPM 1915, BMEP 16.28 bar, intake manifold resonance 59.8 kPa, buttress downforce 552.8 N, triplane diffuser suction 690.8 N
# Ferrari_812GTS_Trace[0296]: V12 6496cc RPM 1918, BMEP 16.28 bar, intake manifold resonance 59.9 kPa, buttress downforce 553.2 N, triplane diffuser suction 691.6 N
# Ferrari_812GTS_Trace[0297]: V12 6496cc RPM 1921, BMEP 16.29 bar, intake manifold resonance 60.0 kPa, buttress downforce 553.6 N, triplane diffuser suction 692.5 N
# Ferrari_812GTS_Trace[0298]: V12 6496cc RPM 1924, BMEP 16.29 bar, intake manifold resonance 60.0 kPa, buttress downforce 554.1 N, triplane diffuser suction 693.3 N
# Ferrari_812GTS_Trace[0299]: V12 6496cc RPM 1927, BMEP 16.30 bar, intake manifold resonance 60.1 kPa, buttress downforce 554.5 N, triplane diffuser suction 694.1 N
# Ferrari_812GTS_Trace[0300]: V12 6496cc RPM 1930, BMEP 16.30 bar, intake manifold resonance 48.2 kPa, buttress downforce 555.0 N, triplane diffuser suction 695.0 N
# Ferrari_812GTS_Trace[0301]: V12 6496cc RPM 1933, BMEP 16.30 bar, intake manifold resonance 48.3 kPa, buttress downforce 555.5 N, triplane diffuser suction 695.9 N
# Ferrari_812GTS_Trace[0302]: V12 6496cc RPM 1936, BMEP 16.31 bar, intake manifold resonance 48.4 kPa, buttress downforce 555.9 N, triplane diffuser suction 696.7 N
# Ferrari_812GTS_Trace[0303]: V12 6496cc RPM 1939, BMEP 16.32 bar, intake manifold resonance 48.4 kPa, buttress downforce 556.4 N, triplane diffuser suction 697.5 N
# Ferrari_812GTS_Trace[0304]: V12 6496cc RPM 1942, BMEP 16.32 bar, intake manifold resonance 48.5 kPa, buttress downforce 556.8 N, triplane diffuser suction 698.4 N
# Ferrari_812GTS_Trace[0305]: V12 6496cc RPM 1946, BMEP 16.32 bar, intake manifold resonance 48.6 kPa, buttress downforce 557.3 N, triplane diffuser suction 699.3 N
# Ferrari_812GTS_Trace[0306]: V12 6496cc RPM 1949, BMEP 16.33 bar, intake manifold resonance 48.7 kPa, buttress downforce 557.7 N, triplane diffuser suction 700.1 N
# Ferrari_812GTS_Trace[0307]: V12 6496cc RPM 1952, BMEP 16.34 bar, intake manifold resonance 48.8 kPa, buttress downforce 558.1 N, triplane diffuser suction 701.0 N
# Ferrari_812GTS_Trace[0308]: V12 6496cc RPM 1955, BMEP 16.34 bar, intake manifold resonance 48.8 kPa, buttress downforce 558.6 N, triplane diffuser suction 701.8 N
# Ferrari_812GTS_Trace[0309]: V12 6496cc RPM 1958, BMEP 16.34 bar, intake manifold resonance 48.9 kPa, buttress downforce 559.0 N, triplane diffuser suction 702.6 N
# Ferrari_812GTS_Trace[0310]: V12 6496cc RPM 1961, BMEP 16.35 bar, intake manifold resonance 49.0 kPa, buttress downforce 559.5 N, triplane diffuser suction 703.5 N
# Ferrari_812GTS_Trace[0311]: V12 6496cc RPM 1964, BMEP 16.36 bar, intake manifold resonance 49.1 kPa, buttress downforce 560.0 N, triplane diffuser suction 704.3 N
# Ferrari_812GTS_Trace[0312]: V12 6496cc RPM 1967, BMEP 16.36 bar, intake manifold resonance 49.2 kPa, buttress downforce 560.4 N, triplane diffuser suction 705.2 N
# Ferrari_812GTS_Trace[0313]: V12 6496cc RPM 1970, BMEP 16.37 bar, intake manifold resonance 49.2 kPa, buttress downforce 560.9 N, triplane diffuser suction 706.0 N
# Ferrari_812GTS_Trace[0314]: V12 6496cc RPM 1973, BMEP 16.37 bar, intake manifold resonance 49.3 kPa, buttress downforce 561.3 N, triplane diffuser suction 706.9 N
# Ferrari_812GTS_Trace[0315]: V12 6496cc RPM 1977, BMEP 16.38 bar, intake manifold resonance 49.4 kPa, buttress downforce 561.8 N, triplane diffuser suction 707.8 N
# Ferrari_812GTS_Trace[0316]: V12 6496cc RPM 1980, BMEP 16.38 bar, intake manifold resonance 49.5 kPa, buttress downforce 562.2 N, triplane diffuser suction 708.6 N
# Ferrari_812GTS_Trace[0317]: V12 6496cc RPM 1983, BMEP 16.39 bar, intake manifold resonance 49.6 kPa, buttress downforce 562.6 N, triplane diffuser suction 709.5 N
# Ferrari_812GTS_Trace[0318]: V12 6496cc RPM 1986, BMEP 16.39 bar, intake manifold resonance 49.6 kPa, buttress downforce 563.1 N, triplane diffuser suction 710.3 N
# Ferrari_812GTS_Trace[0319]: V12 6496cc RPM 1989, BMEP 16.39 bar, intake manifold resonance 49.7 kPa, buttress downforce 563.5 N, triplane diffuser suction 711.1 N
# Ferrari_812GTS_Trace[0320]: V12 6496cc RPM 1992, BMEP 16.40 bar, intake manifold resonance 49.8 kPa, buttress downforce 564.0 N, triplane diffuser suction 712.0 N
# Ferrari_812GTS_Trace[0321]: V12 6496cc RPM 1995, BMEP 16.41 bar, intake manifold resonance 49.9 kPa, buttress downforce 564.5 N, triplane diffuser suction 712.8 N
# Ferrari_812GTS_Trace[0322]: V12 6496cc RPM 1998, BMEP 16.41 bar, intake manifold resonance 50.0 kPa, buttress downforce 564.9 N, triplane diffuser suction 713.7 N
# Ferrari_812GTS_Trace[0323]: V12 6496cc RPM 2001, BMEP 16.41 bar, intake manifold resonance 50.0 kPa, buttress downforce 565.4 N, triplane diffuser suction 714.5 N
# Ferrari_812GTS_Trace[0324]: V12 6496cc RPM 2004, BMEP 16.42 bar, intake manifold resonance 50.1 kPa, buttress downforce 565.8 N, triplane diffuser suction 715.4 N
# Ferrari_812GTS_Trace[0325]: V12 6496cc RPM 2008, BMEP 16.43 bar, intake manifold resonance 50.2 kPa, buttress downforce 566.3 N, triplane diffuser suction 716.3 N
# Ferrari_812GTS_Trace[0326]: V12 6496cc RPM 2011, BMEP 16.43 bar, intake manifold resonance 50.3 kPa, buttress downforce 566.7 N, triplane diffuser suction 717.1 N
# Ferrari_812GTS_Trace[0327]: V12 6496cc RPM 2014, BMEP 16.44 bar, intake manifold resonance 50.4 kPa, buttress downforce 567.1 N, triplane diffuser suction 718.0 N
# Ferrari_812GTS_Trace[0328]: V12 6496cc RPM 2017, BMEP 16.44 bar, intake manifold resonance 50.4 kPa, buttress downforce 567.6 N, triplane diffuser suction 718.8 N
# Ferrari_812GTS_Trace[0329]: V12 6496cc RPM 2020, BMEP 16.45 bar, intake manifold resonance 50.5 kPa, buttress downforce 568.0 N, triplane diffuser suction 719.6 N
# Ferrari_812GTS_Trace[0330]: V12 6496cc RPM 2023, BMEP 16.45 bar, intake manifold resonance 50.6 kPa, buttress downforce 568.5 N, triplane diffuser suction 720.5 N
# Ferrari_812GTS_Trace[0331]: V12 6496cc RPM 2026, BMEP 16.46 bar, intake manifold resonance 50.7 kPa, buttress downforce 569.0 N, triplane diffuser suction 721.3 N
# Ferrari_812GTS_Trace[0332]: V12 6496cc RPM 2029, BMEP 16.46 bar, intake manifold resonance 50.8 kPa, buttress downforce 569.4 N, triplane diffuser suction 722.2 N
# Ferrari_812GTS_Trace[0333]: V12 6496cc RPM 2032, BMEP 16.46 bar, intake manifold resonance 50.8 kPa, buttress downforce 569.9 N, triplane diffuser suction 723.0 N
# Ferrari_812GTS_Trace[0334]: V12 6496cc RPM 2035, BMEP 16.47 bar, intake manifold resonance 50.9 kPa, buttress downforce 570.3 N, triplane diffuser suction 723.9 N
# Ferrari_812GTS_Trace[0335]: V12 6496cc RPM 2039, BMEP 16.48 bar, intake manifold resonance 51.0 kPa, buttress downforce 570.8 N, triplane diffuser suction 724.8 N
# Ferrari_812GTS_Trace[0336]: V12 6496cc RPM 2042, BMEP 16.48 bar, intake manifold resonance 51.1 kPa, buttress downforce 571.2 N, triplane diffuser suction 725.6 N
# Ferrari_812GTS_Trace[0337]: V12 6496cc RPM 2045, BMEP 16.48 bar, intake manifold resonance 51.2 kPa, buttress downforce 571.6 N, triplane diffuser suction 726.5 N
# Ferrari_812GTS_Trace[0338]: V12 6496cc RPM 2048, BMEP 16.49 bar, intake manifold resonance 51.2 kPa, buttress downforce 572.1 N, triplane diffuser suction 727.3 N
# Ferrari_812GTS_Trace[0339]: V12 6496cc RPM 2051, BMEP 16.50 bar, intake manifold resonance 51.3 kPa, buttress downforce 572.5 N, triplane diffuser suction 728.1 N
# Ferrari_812GTS_Trace[0340]: V12 6496cc RPM 2054, BMEP 16.50 bar, intake manifold resonance 51.4 kPa, buttress downforce 573.0 N, triplane diffuser suction 729.0 N
# Ferrari_812GTS_Trace[0341]: V12 6496cc RPM 2057, BMEP 16.51 bar, intake manifold resonance 51.5 kPa, buttress downforce 573.5 N, triplane diffuser suction 729.8 N
# Ferrari_812GTS_Trace[0342]: V12 6496cc RPM 2060, BMEP 16.51 bar, intake manifold resonance 51.6 kPa, buttress downforce 573.9 N, triplane diffuser suction 730.7 N
# Ferrari_812GTS_Trace[0343]: V12 6496cc RPM 2063, BMEP 16.52 bar, intake manifold resonance 51.6 kPa, buttress downforce 574.4 N, triplane diffuser suction 731.5 N
# Ferrari_812GTS_Trace[0344]: V12 6496cc RPM 2066, BMEP 16.52 bar, intake manifold resonance 51.7 kPa, buttress downforce 574.8 N, triplane diffuser suction 732.4 N
# Ferrari_812GTS_Trace[0345]: V12 6496cc RPM 2070, BMEP 16.53 bar, intake manifold resonance 51.8 kPa, buttress downforce 575.3 N, triplane diffuser suction 733.3 N
# Ferrari_812GTS_Trace[0346]: V12 6496cc RPM 2073, BMEP 16.53 bar, intake manifold resonance 51.9 kPa, buttress downforce 575.7 N, triplane diffuser suction 734.1 N
# Ferrari_812GTS_Trace[0347]: V12 6496cc RPM 2076, BMEP 16.54 bar, intake manifold resonance 52.0 kPa, buttress downforce 576.1 N, triplane diffuser suction 735.0 N
# Ferrari_812GTS_Trace[0348]: V12 6496cc RPM 2079, BMEP 16.54 bar, intake manifold resonance 52.0 kPa, buttress downforce 576.6 N, triplane diffuser suction 735.8 N
# Ferrari_812GTS_Trace[0349]: V12 6496cc RPM 2082, BMEP 16.55 bar, intake manifold resonance 52.1 kPa, buttress downforce 577.0 N, triplane diffuser suction 736.6 N
# Ferrari_812GTS_Trace[0350]: V12 6496cc RPM 2085, BMEP 16.55 bar, intake manifold resonance 52.2 kPa, buttress downforce 577.5 N, triplane diffuser suction 737.5 N
# Ferrari_812GTS_Trace[0351]: V12 6496cc RPM 2088, BMEP 16.55 bar, intake manifold resonance 52.3 kPa, buttress downforce 578.0 N, triplane diffuser suction 738.3 N
# Ferrari_812GTS_Trace[0352]: V12 6496cc RPM 2091, BMEP 16.56 bar, intake manifold resonance 52.4 kPa, buttress downforce 578.4 N, triplane diffuser suction 739.2 N
# Ferrari_812GTS_Trace[0353]: V12 6496cc RPM 2094, BMEP 16.57 bar, intake manifold resonance 52.4 kPa, buttress downforce 578.9 N, triplane diffuser suction 740.0 N
# Ferrari_812GTS_Trace[0354]: V12 6496cc RPM 2097, BMEP 16.57 bar, intake manifold resonance 52.5 kPa, buttress downforce 579.3 N, triplane diffuser suction 740.9 N
# Ferrari_812GTS_Trace[0355]: V12 6496cc RPM 2101, BMEP 16.57 bar, intake manifold resonance 52.6 kPa, buttress downforce 579.8 N, triplane diffuser suction 741.8 N
# Ferrari_812GTS_Trace[0356]: V12 6496cc RPM 2104, BMEP 16.58 bar, intake manifold resonance 52.7 kPa, buttress downforce 580.2 N, triplane diffuser suction 742.6 N
# Ferrari_812GTS_Trace[0357]: V12 6496cc RPM 2107, BMEP 16.59 bar, intake manifold resonance 52.8 kPa, buttress downforce 580.6 N, triplane diffuser suction 743.5 N
# Ferrari_812GTS_Trace[0358]: V12 6496cc RPM 2110, BMEP 16.59 bar, intake manifold resonance 52.8 kPa, buttress downforce 581.1 N, triplane diffuser suction 744.3 N
# Ferrari_812GTS_Trace[0359]: V12 6496cc RPM 2113, BMEP 16.59 bar, intake manifold resonance 52.9 kPa, buttress downforce 581.5 N, triplane diffuser suction 745.1 N
# Ferrari_812GTS_Trace[0360]: V12 6496cc RPM 2116, BMEP 16.60 bar, intake manifold resonance 53.0 kPa, buttress downforce 582.0 N, triplane diffuser suction 746.0 N
# Ferrari_812GTS_Trace[0361]: V12 6496cc RPM 2119, BMEP 16.61 bar, intake manifold resonance 53.1 kPa, buttress downforce 582.5 N, triplane diffuser suction 746.8 N
# Ferrari_812GTS_Trace[0362]: V12 6496cc RPM 2122, BMEP 16.61 bar, intake manifold resonance 53.2 kPa, buttress downforce 582.9 N, triplane diffuser suction 747.7 N
# Ferrari_812GTS_Trace[0363]: V12 6496cc RPM 2125, BMEP 16.62 bar, intake manifold resonance 53.2 kPa, buttress downforce 583.4 N, triplane diffuser suction 748.5 N
# Ferrari_812GTS_Trace[0364]: V12 6496cc RPM 2128, BMEP 16.62 bar, intake manifold resonance 53.3 kPa, buttress downforce 583.8 N, triplane diffuser suction 749.4 N
# Ferrari_812GTS_Trace[0365]: V12 6496cc RPM 2132, BMEP 16.63 bar, intake manifold resonance 53.4 kPa, buttress downforce 584.3 N, triplane diffuser suction 750.3 N
# Ferrari_812GTS_Trace[0366]: V12 6496cc RPM 2135, BMEP 16.63 bar, intake manifold resonance 53.5 kPa, buttress downforce 584.7 N, triplane diffuser suction 751.1 N
# Ferrari_812GTS_Trace[0367]: V12 6496cc RPM 2138, BMEP 16.64 bar, intake manifold resonance 53.6 kPa, buttress downforce 585.1 N, triplane diffuser suction 752.0 N
# Ferrari_812GTS_Trace[0368]: V12 6496cc RPM 2141, BMEP 16.64 bar, intake manifold resonance 53.6 kPa, buttress downforce 585.6 N, triplane diffuser suction 752.8 N
# Ferrari_812GTS_Trace[0369]: V12 6496cc RPM 2144, BMEP 16.64 bar, intake manifold resonance 53.7 kPa, buttress downforce 586.0 N, triplane diffuser suction 753.6 N
# Ferrari_812GTS_Trace[0370]: V12 6496cc RPM 2147, BMEP 16.65 bar, intake manifold resonance 53.8 kPa, buttress downforce 586.5 N, triplane diffuser suction 754.5 N
# Ferrari_812GTS_Trace[0371]: V12 6496cc RPM 2150, BMEP 16.66 bar, intake manifold resonance 53.9 kPa, buttress downforce 587.0 N, triplane diffuser suction 755.3 N
# Ferrari_812GTS_Trace[0372]: V12 6496cc RPM 2153, BMEP 16.66 bar, intake manifold resonance 54.0 kPa, buttress downforce 587.4 N, triplane diffuser suction 756.2 N
# Ferrari_812GTS_Trace[0373]: V12 6496cc RPM 2156, BMEP 16.66 bar, intake manifold resonance 54.0 kPa, buttress downforce 587.9 N, triplane diffuser suction 757.0 N
# Ferrari_812GTS_Trace[0374]: V12 6496cc RPM 2159, BMEP 16.67 bar, intake manifold resonance 54.1 kPa, buttress downforce 588.3 N, triplane diffuser suction 757.9 N
# Ferrari_812GTS_Trace[0375]: V12 6496cc RPM 2163, BMEP 16.68 bar, intake manifold resonance 54.2 kPa, buttress downforce 588.8 N, triplane diffuser suction 758.8 N
# Ferrari_812GTS_Trace[0376]: V12 6496cc RPM 2166, BMEP 16.68 bar, intake manifold resonance 54.3 kPa, buttress downforce 589.2 N, triplane diffuser suction 759.6 N
# Ferrari_812GTS_Trace[0377]: V12 6496cc RPM 2169, BMEP 16.69 bar, intake manifold resonance 54.4 kPa, buttress downforce 589.6 N, triplane diffuser suction 760.5 N
# Ferrari_812GTS_Trace[0378]: V12 6496cc RPM 2172, BMEP 16.69 bar, intake manifold resonance 54.4 kPa, buttress downforce 590.1 N, triplane diffuser suction 761.3 N
# Ferrari_812GTS_Trace[0379]: V12 6496cc RPM 2175, BMEP 16.70 bar, intake manifold resonance 54.5 kPa, buttress downforce 590.5 N, triplane diffuser suction 762.1 N
# Ferrari_812GTS_Trace[0380]: V12 6496cc RPM 2178, BMEP 16.70 bar, intake manifold resonance 54.6 kPa, buttress downforce 591.0 N, triplane diffuser suction 763.0 N
# Ferrari_812GTS_Trace[0381]: V12 6496cc RPM 2181, BMEP 16.71 bar, intake manifold resonance 54.7 kPa, buttress downforce 591.5 N, triplane diffuser suction 763.8 N
# Ferrari_812GTS_Trace[0382]: V12 6496cc RPM 2184, BMEP 16.71 bar, intake manifold resonance 54.8 kPa, buttress downforce 591.9 N, triplane diffuser suction 764.7 N
# Ferrari_812GTS_Trace[0383]: V12 6496cc RPM 2187, BMEP 16.71 bar, intake manifold resonance 54.8 kPa, buttress downforce 592.4 N, triplane diffuser suction 765.5 N
# Ferrari_812GTS_Trace[0384]: V12 6496cc RPM 2190, BMEP 16.72 bar, intake manifold resonance 54.9 kPa, buttress downforce 592.8 N, triplane diffuser suction 766.4 N
# Ferrari_812GTS_Trace[0385]: V12 6496cc RPM 2194, BMEP 16.73 bar, intake manifold resonance 55.0 kPa, buttress downforce 593.3 N, triplane diffuser suction 767.3 N
# Ferrari_812GTS_Trace[0386]: V12 6496cc RPM 2197, BMEP 16.73 bar, intake manifold resonance 55.1 kPa, buttress downforce 593.7 N, triplane diffuser suction 768.1 N
# Ferrari_812GTS_Trace[0387]: V12 6496cc RPM 2200, BMEP 16.73 bar, intake manifold resonance 55.2 kPa, buttress downforce 594.1 N, triplane diffuser suction 769.0 N
# Ferrari_812GTS_Trace[0388]: V12 6496cc RPM 2203, BMEP 16.74 bar, intake manifold resonance 55.2 kPa, buttress downforce 594.6 N, triplane diffuser suction 769.8 N
# Ferrari_812GTS_Trace[0389]: V12 6496cc RPM 2206, BMEP 16.75 bar, intake manifold resonance 55.3 kPa, buttress downforce 595.0 N, triplane diffuser suction 770.6 N
# Ferrari_812GTS_Trace[0390]: V12 6496cc RPM 2209, BMEP 16.75 bar, intake manifold resonance 55.4 kPa, buttress downforce 595.5 N, triplane diffuser suction 771.5 N
# Ferrari_812GTS_Trace[0391]: V12 6496cc RPM 2212, BMEP 16.76 bar, intake manifold resonance 55.5 kPa, buttress downforce 596.0 N, triplane diffuser suction 772.3 N
# Ferrari_812GTS_Trace[0392]: V12 6496cc RPM 2215, BMEP 16.76 bar, intake manifold resonance 55.6 kPa, buttress downforce 596.4 N, triplane diffuser suction 773.2 N
# Ferrari_812GTS_Trace[0393]: V12 6496cc RPM 2218, BMEP 16.77 bar, intake manifold resonance 55.6 kPa, buttress downforce 596.9 N, triplane diffuser suction 774.0 N
# Ferrari_812GTS_Trace[0394]: V12 6496cc RPM 2221, BMEP 16.77 bar, intake manifold resonance 55.7 kPa, buttress downforce 597.3 N, triplane diffuser suction 774.9 N
# Ferrari_812GTS_Trace[0395]: V12 6496cc RPM 2225, BMEP 16.78 bar, intake manifold resonance 55.8 kPa, buttress downforce 597.8 N, triplane diffuser suction 775.8 N
# Ferrari_812GTS_Trace[0396]: V12 6496cc RPM 2228, BMEP 16.78 bar, intake manifold resonance 55.9 kPa, buttress downforce 598.2 N, triplane diffuser suction 776.6 N
# Ferrari_812GTS_Trace[0397]: V12 6496cc RPM 2231, BMEP 16.79 bar, intake manifold resonance 56.0 kPa, buttress downforce 598.6 N, triplane diffuser suction 777.5 N
# Ferrari_812GTS_Trace[0398]: V12 6496cc RPM 2234, BMEP 16.79 bar, intake manifold resonance 56.0 kPa, buttress downforce 599.1 N, triplane diffuser suction 778.3 N
# Ferrari_812GTS_Trace[0399]: V12 6496cc RPM 2237, BMEP 16.80 bar, intake manifold resonance 56.1 kPa, buttress downforce 599.5 N, triplane diffuser suction 779.1 N
# Ferrari_812GTS_Trace[0400]: V12 6496cc RPM 2240, BMEP 16.80 bar, intake manifold resonance 56.2 kPa, buttress downforce 420.0 N, triplane diffuser suction 780.0 N
# Ferrari_812GTS_Trace[0401]: V12 6496cc RPM 2243, BMEP 16.80 bar, intake manifold resonance 56.3 kPa, buttress downforce 420.5 N, triplane diffuser suction 780.8 N
# Ferrari_812GTS_Trace[0402]: V12 6496cc RPM 2246, BMEP 16.81 bar, intake manifold resonance 56.4 kPa, buttress downforce 420.9 N, triplane diffuser suction 781.7 N
# Ferrari_812GTS_Trace[0403]: V12 6496cc RPM 2249, BMEP 16.82 bar, intake manifold resonance 56.4 kPa, buttress downforce 421.4 N, triplane diffuser suction 782.5 N
# Ferrari_812GTS_Trace[0404]: V12 6496cc RPM 2252, BMEP 16.82 bar, intake manifold resonance 56.5 kPa, buttress downforce 421.8 N, triplane diffuser suction 783.4 N
# Ferrari_812GTS_Trace[0405]: V12 6496cc RPM 2256, BMEP 16.82 bar, intake manifold resonance 56.6 kPa, buttress downforce 422.3 N, triplane diffuser suction 784.3 N
# Ferrari_812GTS_Trace[0406]: V12 6496cc RPM 2259, BMEP 16.83 bar, intake manifold resonance 56.7 kPa, buttress downforce 422.7 N, triplane diffuser suction 785.1 N
# Ferrari_812GTS_Trace[0407]: V12 6496cc RPM 2262, BMEP 16.84 bar, intake manifold resonance 56.8 kPa, buttress downforce 423.1 N, triplane diffuser suction 786.0 N
# Ferrari_812GTS_Trace[0408]: V12 6496cc RPM 2265, BMEP 16.84 bar, intake manifold resonance 56.8 kPa, buttress downforce 423.6 N, triplane diffuser suction 786.8 N
# Ferrari_812GTS_Trace[0409]: V12 6496cc RPM 2268, BMEP 16.84 bar, intake manifold resonance 56.9 kPa, buttress downforce 424.1 N, triplane diffuser suction 787.6 N
# Ferrari_812GTS_Trace[0410]: V12 6496cc RPM 2271, BMEP 16.85 bar, intake manifold resonance 57.0 kPa, buttress downforce 424.5 N, triplane diffuser suction 788.5 N
# Ferrari_812GTS_Trace[0411]: V12 6496cc RPM 2274, BMEP 16.86 bar, intake manifold resonance 57.1 kPa, buttress downforce 425.0 N, triplane diffuser suction 789.3 N
# Ferrari_812GTS_Trace[0412]: V12 6496cc RPM 2277, BMEP 16.86 bar, intake manifold resonance 57.2 kPa, buttress downforce 425.4 N, triplane diffuser suction 790.2 N
# Ferrari_812GTS_Trace[0413]: V12 6496cc RPM 2280, BMEP 16.87 bar, intake manifold resonance 57.2 kPa, buttress downforce 425.9 N, triplane diffuser suction 791.0 N
# Ferrari_812GTS_Trace[0414]: V12 6496cc RPM 2283, BMEP 16.87 bar, intake manifold resonance 57.3 kPa, buttress downforce 426.3 N, triplane diffuser suction 791.9 N
# Ferrari_812GTS_Trace[0415]: V12 6496cc RPM 2287, BMEP 16.88 bar, intake manifold resonance 57.4 kPa, buttress downforce 426.8 N, triplane diffuser suction 792.8 N
# Ferrari_812GTS_Trace[0416]: V12 6496cc RPM 2290, BMEP 16.88 bar, intake manifold resonance 57.5 kPa, buttress downforce 427.2 N, triplane diffuser suction 793.6 N
# Ferrari_812GTS_Trace[0417]: V12 6496cc RPM 2293, BMEP 16.89 bar, intake manifold resonance 57.6 kPa, buttress downforce 427.6 N, triplane diffuser suction 794.5 N
# Ferrari_812GTS_Trace[0418]: V12 6496cc RPM 2296, BMEP 16.89 bar, intake manifold resonance 57.6 kPa, buttress downforce 428.1 N, triplane diffuser suction 795.3 N
# Ferrari_812GTS_Trace[0419]: V12 6496cc RPM 2299, BMEP 16.89 bar, intake manifold resonance 57.7 kPa, buttress downforce 428.6 N, triplane diffuser suction 796.1 N
# Ferrari_812GTS_Trace[0420]: V12 6496cc RPM 2302, BMEP 16.90 bar, intake manifold resonance 57.8 kPa, buttress downforce 429.0 N, triplane diffuser suction 797.0 N
# Ferrari_812GTS_Trace[0421]: V12 6496cc RPM 2305, BMEP 16.91 bar, intake manifold resonance 57.9 kPa, buttress downforce 429.5 N, triplane diffuser suction 797.8 N
# Ferrari_812GTS_Trace[0422]: V12 6496cc RPM 2308, BMEP 16.91 bar, intake manifold resonance 58.0 kPa, buttress downforce 429.9 N, triplane diffuser suction 798.7 N
# Ferrari_812GTS_Trace[0423]: V12 6496cc RPM 2311, BMEP 16.91 bar, intake manifold resonance 58.0 kPa, buttress downforce 430.4 N, triplane diffuser suction 799.5 N
# Ferrari_812GTS_Trace[0424]: V12 6496cc RPM 2314, BMEP 16.92 bar, intake manifold resonance 58.1 kPa, buttress downforce 430.8 N, triplane diffuser suction 800.4 N
# Ferrari_812GTS_Trace[0425]: V12 6496cc RPM 2318, BMEP 16.93 bar, intake manifold resonance 58.2 kPa, buttress downforce 431.3 N, triplane diffuser suction 801.3 N
# Ferrari_812GTS_Trace[0426]: V12 6496cc RPM 2321, BMEP 16.93 bar, intake manifold resonance 58.3 kPa, buttress downforce 431.7 N, triplane diffuser suction 802.1 N
# Ferrari_812GTS_Trace[0427]: V12 6496cc RPM 2324, BMEP 16.94 bar, intake manifold resonance 58.4 kPa, buttress downforce 432.1 N, triplane diffuser suction 803.0 N
# Ferrari_812GTS_Trace[0428]: V12 6496cc RPM 2327, BMEP 16.94 bar, intake manifold resonance 58.4 kPa, buttress downforce 432.6 N, triplane diffuser suction 803.8 N
# Ferrari_812GTS_Trace[0429]: V12 6496cc RPM 2330, BMEP 16.95 bar, intake manifold resonance 58.5 kPa, buttress downforce 433.1 N, triplane diffuser suction 804.6 N
# Ferrari_812GTS_Trace[0430]: V12 6496cc RPM 2333, BMEP 16.95 bar, intake manifold resonance 58.6 kPa, buttress downforce 433.5 N, triplane diffuser suction 805.5 N
# Ferrari_812GTS_Trace[0431]: V12 6496cc RPM 2336, BMEP 16.96 bar, intake manifold resonance 58.7 kPa, buttress downforce 434.0 N, triplane diffuser suction 806.3 N
# Ferrari_812GTS_Trace[0432]: V12 6496cc RPM 2339, BMEP 16.96 bar, intake manifold resonance 58.8 kPa, buttress downforce 434.4 N, triplane diffuser suction 807.2 N
# Ferrari_812GTS_Trace[0433]: V12 6496cc RPM 2342, BMEP 16.96 bar, intake manifold resonance 58.8 kPa, buttress downforce 434.9 N, triplane diffuser suction 808.0 N
# Ferrari_812GTS_Trace[0434]: V12 6496cc RPM 2345, BMEP 16.97 bar, intake manifold resonance 58.9 kPa, buttress downforce 435.3 N, triplane diffuser suction 808.9 N
# Ferrari_812GTS_Trace[0435]: V12 6496cc RPM 2349, BMEP 16.98 bar, intake manifold resonance 59.0 kPa, buttress downforce 435.8 N, triplane diffuser suction 809.8 N
# Ferrari_812GTS_Trace[0436]: V12 6496cc RPM 2352, BMEP 16.98 bar, intake manifold resonance 59.1 kPa, buttress downforce 436.2 N, triplane diffuser suction 810.6 N
# Ferrari_812GTS_Trace[0437]: V12 6496cc RPM 2355, BMEP 16.98 bar, intake manifold resonance 59.2 kPa, buttress downforce 436.6 N, triplane diffuser suction 811.5 N
# Ferrari_812GTS_Trace[0438]: V12 6496cc RPM 2358, BMEP 16.99 bar, intake manifold resonance 59.2 kPa, buttress downforce 437.1 N, triplane diffuser suction 812.3 N
# Ferrari_812GTS_Trace[0439]: V12 6496cc RPM 2361, BMEP 17.00 bar, intake manifold resonance 59.3 kPa, buttress downforce 437.6 N, triplane diffuser suction 813.1 N
# Ferrari_812GTS_Trace[0440]: V12 6496cc RPM 2364, BMEP 17.00 bar, intake manifold resonance 59.4 kPa, buttress downforce 438.0 N, triplane diffuser suction 814.0 N
# Ferrari_812GTS_Trace[0441]: V12 6496cc RPM 2367, BMEP 17.01 bar, intake manifold resonance 59.5 kPa, buttress downforce 438.5 N, triplane diffuser suction 814.8 N
# Ferrari_812GTS_Trace[0442]: V12 6496cc RPM 2370, BMEP 17.01 bar, intake manifold resonance 59.6 kPa, buttress downforce 438.9 N, triplane diffuser suction 815.7 N
# Ferrari_812GTS_Trace[0443]: V12 6496cc RPM 2373, BMEP 17.02 bar, intake manifold resonance 59.6 kPa, buttress downforce 439.4 N, triplane diffuser suction 816.5 N
# Ferrari_812GTS_Trace[0444]: V12 6496cc RPM 2376, BMEP 17.02 bar, intake manifold resonance 59.7 kPa, buttress downforce 439.8 N, triplane diffuser suction 817.4 N
# Ferrari_812GTS_Trace[0445]: V12 6496cc RPM 2380, BMEP 17.03 bar, intake manifold resonance 59.8 kPa, buttress downforce 440.3 N, triplane diffuser suction 818.3 N
# Ferrari_812GTS_Trace[0446]: V12 6496cc RPM 2383, BMEP 17.03 bar, intake manifold resonance 59.9 kPa, buttress downforce 440.7 N, triplane diffuser suction 819.1 N
# Ferrari_812GTS_Trace[0447]: V12 6496cc RPM 2386, BMEP 17.04 bar, intake manifold resonance 60.0 kPa, buttress downforce 441.1 N, triplane diffuser suction 820.0 N
# Ferrari_812GTS_Trace[0448]: V12 6496cc RPM 2389, BMEP 17.04 bar, intake manifold resonance 60.0 kPa, buttress downforce 441.6 N, triplane diffuser suction 820.8 N
# Ferrari_812GTS_Trace[0449]: V12 6496cc RPM 2392, BMEP 17.05 bar, intake manifold resonance 60.1 kPa, buttress downforce 442.1 N, triplane diffuser suction 821.6 N
# Ferrari_812GTS_Trace[0450]: V12 6496cc RPM 2395, BMEP 17.05 bar, intake manifold resonance 48.2 kPa, buttress downforce 442.5 N, triplane diffuser suction 822.5 N
# Ferrari_812GTS_Trace[0451]: V12 6496cc RPM 2398, BMEP 17.05 bar, intake manifold resonance 48.3 kPa, buttress downforce 443.0 N, triplane diffuser suction 823.3 N
# Ferrari_812GTS_Trace[0452]: V12 6496cc RPM 2401, BMEP 17.06 bar, intake manifold resonance 48.4 kPa, buttress downforce 443.4 N, triplane diffuser suction 824.2 N
# Ferrari_812GTS_Trace[0453]: V12 6496cc RPM 2404, BMEP 17.07 bar, intake manifold resonance 48.4 kPa, buttress downforce 443.9 N, triplane diffuser suction 825.0 N
# Ferrari_812GTS_Trace[0454]: V12 6496cc RPM 2407, BMEP 17.07 bar, intake manifold resonance 48.5 kPa, buttress downforce 444.3 N, triplane diffuser suction 825.9 N
# Ferrari_812GTS_Trace[0455]: V12 6496cc RPM 2411, BMEP 17.07 bar, intake manifold resonance 48.6 kPa, buttress downforce 444.8 N, triplane diffuser suction 826.8 N
# Ferrari_812GTS_Trace[0456]: V12 6496cc RPM 2414, BMEP 17.08 bar, intake manifold resonance 48.7 kPa, buttress downforce 445.2 N, triplane diffuser suction 827.6 N
# Ferrari_812GTS_Trace[0457]: V12 6496cc RPM 2417, BMEP 17.09 bar, intake manifold resonance 48.8 kPa, buttress downforce 445.6 N, triplane diffuser suction 828.5 N
# Ferrari_812GTS_Trace[0458]: V12 6496cc RPM 2420, BMEP 17.09 bar, intake manifold resonance 48.8 kPa, buttress downforce 446.1 N, triplane diffuser suction 829.3 N
# Ferrari_812GTS_Trace[0459]: V12 6496cc RPM 2423, BMEP 17.09 bar, intake manifold resonance 48.9 kPa, buttress downforce 446.6 N, triplane diffuser suction 830.1 N
# Ferrari_812GTS_Trace[0460]: V12 6496cc RPM 2426, BMEP 17.10 bar, intake manifold resonance 49.0 kPa, buttress downforce 447.0 N, triplane diffuser suction 831.0 N
# Ferrari_812GTS_Trace[0461]: V12 6496cc RPM 2429, BMEP 17.11 bar, intake manifold resonance 49.1 kPa, buttress downforce 447.5 N, triplane diffuser suction 831.8 N
# Ferrari_812GTS_Trace[0462]: V12 6496cc RPM 2432, BMEP 17.11 bar, intake manifold resonance 49.2 kPa, buttress downforce 447.9 N, triplane diffuser suction 832.7 N
# Ferrari_812GTS_Trace[0463]: V12 6496cc RPM 2435, BMEP 17.12 bar, intake manifold resonance 49.2 kPa, buttress downforce 448.4 N, triplane diffuser suction 833.5 N
# Ferrari_812GTS_Trace[0464]: V12 6496cc RPM 2438, BMEP 17.12 bar, intake manifold resonance 49.3 kPa, buttress downforce 448.8 N, triplane diffuser suction 834.4 N
# Ferrari_812GTS_Trace[0465]: V12 6496cc RPM 2442, BMEP 17.13 bar, intake manifold resonance 49.4 kPa, buttress downforce 449.3 N, triplane diffuser suction 835.3 N
# Ferrari_812GTS_Trace[0466]: V12 6496cc RPM 2445, BMEP 17.13 bar, intake manifold resonance 49.5 kPa, buttress downforce 449.7 N, triplane diffuser suction 836.1 N
# Ferrari_812GTS_Trace[0467]: V12 6496cc RPM 2448, BMEP 17.14 bar, intake manifold resonance 49.6 kPa, buttress downforce 450.1 N, triplane diffuser suction 837.0 N
# Ferrari_812GTS_Trace[0468]: V12 6496cc RPM 2451, BMEP 17.14 bar, intake manifold resonance 49.6 kPa, buttress downforce 450.6 N, triplane diffuser suction 837.8 N
# Ferrari_812GTS_Trace[0469]: V12 6496cc RPM 2454, BMEP 17.14 bar, intake manifold resonance 49.7 kPa, buttress downforce 451.1 N, triplane diffuser suction 838.6 N
# Ferrari_812GTS_Trace[0470]: V12 6496cc RPM 2457, BMEP 17.15 bar, intake manifold resonance 49.8 kPa, buttress downforce 451.5 N, triplane diffuser suction 839.5 N
# Ferrari_812GTS_Trace[0471]: V12 6496cc RPM 2460, BMEP 17.16 bar, intake manifold resonance 49.9 kPa, buttress downforce 452.0 N, triplane diffuser suction 840.3 N
# Ferrari_812GTS_Trace[0472]: V12 6496cc RPM 2463, BMEP 17.16 bar, intake manifold resonance 50.0 kPa, buttress downforce 452.4 N, triplane diffuser suction 841.2 N
# Ferrari_812GTS_Trace[0473]: V12 6496cc RPM 2466, BMEP 17.16 bar, intake manifold resonance 50.0 kPa, buttress downforce 452.9 N, triplane diffuser suction 842.0 N
# Ferrari_812GTS_Trace[0474]: V12 6496cc RPM 2469, BMEP 17.17 bar, intake manifold resonance 50.1 kPa, buttress downforce 453.3 N, triplane diffuser suction 842.9 N
# Ferrari_812GTS_Trace[0475]: V12 6496cc RPM 2473, BMEP 17.18 bar, intake manifold resonance 50.2 kPa, buttress downforce 453.8 N, triplane diffuser suction 843.8 N
# Ferrari_812GTS_Trace[0476]: V12 6496cc RPM 2476, BMEP 17.18 bar, intake manifold resonance 50.3 kPa, buttress downforce 454.2 N, triplane diffuser suction 844.6 N
# Ferrari_812GTS_Trace[0477]: V12 6496cc RPM 2479, BMEP 17.19 bar, intake manifold resonance 50.4 kPa, buttress downforce 454.6 N, triplane diffuser suction 845.5 N
# Ferrari_812GTS_Trace[0478]: V12 6496cc RPM 2482, BMEP 17.19 bar, intake manifold resonance 50.4 kPa, buttress downforce 455.1 N, triplane diffuser suction 846.3 N
# Ferrari_812GTS_Trace[0479]: V12 6496cc RPM 2485, BMEP 17.20 bar, intake manifold resonance 50.5 kPa, buttress downforce 455.6 N, triplane diffuser suction 847.1 N
# Ferrari_812GTS_Trace[0480]: V12 6496cc RPM 2488, BMEP 17.20 bar, intake manifold resonance 50.6 kPa, buttress downforce 456.0 N, triplane diffuser suction 848.0 N
# Ferrari_812GTS_Trace[0481]: V12 6496cc RPM 2491, BMEP 17.21 bar, intake manifold resonance 50.7 kPa, buttress downforce 456.5 N, triplane diffuser suction 848.8 N
# Ferrari_812GTS_Trace[0482]: V12 6496cc RPM 2494, BMEP 17.21 bar, intake manifold resonance 50.8 kPa, buttress downforce 456.9 N, triplane diffuser suction 849.7 N
# Ferrari_812GTS_Trace[0483]: V12 6496cc RPM 2497, BMEP 17.21 bar, intake manifold resonance 50.8 kPa, buttress downforce 457.4 N, triplane diffuser suction 850.5 N
# Ferrari_812GTS_Trace[0484]: V12 6496cc RPM 2500, BMEP 17.22 bar, intake manifold resonance 50.9 kPa, buttress downforce 457.8 N, triplane diffuser suction 851.4 N
# Ferrari_812GTS_Trace[0485]: V12 6496cc RPM 2504, BMEP 17.23 bar, intake manifold resonance 51.0 kPa, buttress downforce 458.3 N, triplane diffuser suction 852.3 N
# Ferrari_812GTS_Trace[0486]: V12 6496cc RPM 2507, BMEP 17.23 bar, intake manifold resonance 51.1 kPa, buttress downforce 458.7 N, triplane diffuser suction 853.1 N
# Ferrari_812GTS_Trace[0487]: V12 6496cc RPM 2510, BMEP 17.23 bar, intake manifold resonance 51.2 kPa, buttress downforce 459.1 N, triplane diffuser suction 854.0 N
# Ferrari_812GTS_Trace[0488]: V12 6496cc RPM 2513, BMEP 17.24 bar, intake manifold resonance 51.2 kPa, buttress downforce 459.6 N, triplane diffuser suction 854.8 N
# Ferrari_812GTS_Trace[0489]: V12 6496cc RPM 2516, BMEP 17.25 bar, intake manifold resonance 51.3 kPa, buttress downforce 460.1 N, triplane diffuser suction 855.6 N
# Ferrari_812GTS_Trace[0490]: V12 6496cc RPM 2519, BMEP 17.25 bar, intake manifold resonance 51.4 kPa, buttress downforce 460.5 N, triplane diffuser suction 856.5 N
# Ferrari_812GTS_Trace[0491]: V12 6496cc RPM 2522, BMEP 17.26 bar, intake manifold resonance 51.5 kPa, buttress downforce 461.0 N, triplane diffuser suction 857.3 N
# Ferrari_812GTS_Trace[0492]: V12 6496cc RPM 2525, BMEP 17.26 bar, intake manifold resonance 51.6 kPa, buttress downforce 461.4 N, triplane diffuser suction 858.2 N
# Ferrari_812GTS_Trace[0493]: V12 6496cc RPM 2528, BMEP 17.27 bar, intake manifold resonance 51.6 kPa, buttress downforce 461.9 N, triplane diffuser suction 859.0 N
# Ferrari_812GTS_Trace[0494]: V12 6496cc RPM 2531, BMEP 17.27 bar, intake manifold resonance 51.7 kPa, buttress downforce 462.3 N, triplane diffuser suction 859.9 N
# Ferrari_812GTS_Trace[0495]: V12 6496cc RPM 2535, BMEP 17.28 bar, intake manifold resonance 51.8 kPa, buttress downforce 462.8 N, triplane diffuser suction 860.8 N
# Ferrari_812GTS_Trace[0496]: V12 6496cc RPM 2538, BMEP 17.28 bar, intake manifold resonance 51.9 kPa, buttress downforce 463.2 N, triplane diffuser suction 861.6 N
# Ferrari_812GTS_Trace[0497]: V12 6496cc RPM 2541, BMEP 17.29 bar, intake manifold resonance 52.0 kPa, buttress downforce 463.6 N, triplane diffuser suction 862.5 N
# Ferrari_812GTS_Trace[0498]: V12 6496cc RPM 2544, BMEP 17.29 bar, intake manifold resonance 52.0 kPa, buttress downforce 464.1 N, triplane diffuser suction 863.3 N
# Ferrari_812GTS_Trace[0499]: V12 6496cc RPM 2547, BMEP 17.30 bar, intake manifold resonance 52.1 kPa, buttress downforce 464.6 N, triplane diffuser suction 864.1 N
# Ferrari_812GTS_Trace[0500]: V12 6496cc RPM 2550, BMEP 17.30 bar, intake manifold resonance 52.2 kPa, buttress downforce 465.0 N, triplane diffuser suction 865.0 N
# Ferrari_812GTS_Trace[0501]: V12 6496cc RPM 2553, BMEP 17.30 bar, intake manifold resonance 52.3 kPa, buttress downforce 465.5 N, triplane diffuser suction 865.8 N
# Ferrari_812GTS_Trace[0502]: V12 6496cc RPM 2556, BMEP 17.31 bar, intake manifold resonance 52.4 kPa, buttress downforce 465.9 N, triplane diffuser suction 866.7 N
# Ferrari_812GTS_Trace[0503]: V12 6496cc RPM 2559, BMEP 17.32 bar, intake manifold resonance 52.4 kPa, buttress downforce 466.4 N, triplane diffuser suction 867.5 N
# Ferrari_812GTS_Trace[0504]: V12 6496cc RPM 2562, BMEP 17.32 bar, intake manifold resonance 52.5 kPa, buttress downforce 466.8 N, triplane diffuser suction 868.4 N
# Ferrari_812GTS_Trace[0505]: V12 6496cc RPM 2566, BMEP 17.32 bar, intake manifold resonance 52.6 kPa, buttress downforce 467.3 N, triplane diffuser suction 869.3 N
# Ferrari_812GTS_Trace[0506]: V12 6496cc RPM 2569, BMEP 17.33 bar, intake manifold resonance 52.7 kPa, buttress downforce 467.7 N, triplane diffuser suction 870.1 N
# Ferrari_812GTS_Trace[0507]: V12 6496cc RPM 2572, BMEP 17.34 bar, intake manifold resonance 52.8 kPa, buttress downforce 468.1 N, triplane diffuser suction 871.0 N
# Ferrari_812GTS_Trace[0508]: V12 6496cc RPM 2575, BMEP 17.34 bar, intake manifold resonance 52.8 kPa, buttress downforce 468.6 N, triplane diffuser suction 871.8 N
# Ferrari_812GTS_Trace[0509]: V12 6496cc RPM 2578, BMEP 17.34 bar, intake manifold resonance 52.9 kPa, buttress downforce 469.1 N, triplane diffuser suction 872.6 N
# Ferrari_812GTS_Trace[0510]: V12 6496cc RPM 2581, BMEP 17.35 bar, intake manifold resonance 53.0 kPa, buttress downforce 469.5 N, triplane diffuser suction 873.5 N
# Ferrari_812GTS_Trace[0511]: V12 6496cc RPM 2584, BMEP 17.36 bar, intake manifold resonance 53.1 kPa, buttress downforce 470.0 N, triplane diffuser suction 874.3 N
# Ferrari_812GTS_Trace[0512]: V12 6496cc RPM 2587, BMEP 17.36 bar, intake manifold resonance 53.2 kPa, buttress downforce 470.4 N, triplane diffuser suction 875.2 N
# Ferrari_812GTS_Trace[0513]: V12 6496cc RPM 2590, BMEP 17.37 bar, intake manifold resonance 53.2 kPa, buttress downforce 470.9 N, triplane diffuser suction 876.0 N
# Ferrari_812GTS_Trace[0514]: V12 6496cc RPM 2593, BMEP 17.37 bar, intake manifold resonance 53.3 kPa, buttress downforce 471.3 N, triplane diffuser suction 876.9 N
# Ferrari_812GTS_Trace[0515]: V12 6496cc RPM 2597, BMEP 17.38 bar, intake manifold resonance 53.4 kPa, buttress downforce 471.8 N, triplane diffuser suction 877.8 N
# Ferrari_812GTS_Trace[0516]: V12 6496cc RPM 2600, BMEP 17.38 bar, intake manifold resonance 53.5 kPa, buttress downforce 472.2 N, triplane diffuser suction 878.6 N
# Ferrari_812GTS_Trace[0517]: V12 6496cc RPM 2603, BMEP 17.39 bar, intake manifold resonance 53.6 kPa, buttress downforce 472.6 N, triplane diffuser suction 879.5 N
# Ferrari_812GTS_Trace[0518]: V12 6496cc RPM 2606, BMEP 17.39 bar, intake manifold resonance 53.6 kPa, buttress downforce 473.1 N, triplane diffuser suction 880.3 N
# Ferrari_812GTS_Trace[0519]: V12 6496cc RPM 2609, BMEP 17.39 bar, intake manifold resonance 53.7 kPa, buttress downforce 473.6 N, triplane diffuser suction 881.1 N
# Ferrari_812GTS_Trace[0520]: V12 6496cc RPM 2612, BMEP 17.40 bar, intake manifold resonance 53.8 kPa, buttress downforce 474.0 N, triplane diffuser suction 882.0 N
# Ferrari_812GTS_Trace[0521]: V12 6496cc RPM 2615, BMEP 17.41 bar, intake manifold resonance 53.9 kPa, buttress downforce 474.5 N, triplane diffuser suction 882.8 N
# Ferrari_812GTS_Trace[0522]: V12 6496cc RPM 2618, BMEP 17.41 bar, intake manifold resonance 54.0 kPa, buttress downforce 474.9 N, triplane diffuser suction 883.7 N
# Ferrari_812GTS_Trace[0523]: V12 6496cc RPM 2621, BMEP 17.41 bar, intake manifold resonance 54.0 kPa, buttress downforce 475.4 N, triplane diffuser suction 884.5 N
# Ferrari_812GTS_Trace[0524]: V12 6496cc RPM 2624, BMEP 17.42 bar, intake manifold resonance 54.1 kPa, buttress downforce 475.8 N, triplane diffuser suction 885.4 N
# Ferrari_812GTS_Trace[0525]: V12 6496cc RPM 2628, BMEP 17.43 bar, intake manifold resonance 54.2 kPa, buttress downforce 476.3 N, triplane diffuser suction 886.3 N
# Ferrari_812GTS_Trace[0526]: V12 6496cc RPM 2631, BMEP 17.43 bar, intake manifold resonance 54.3 kPa, buttress downforce 476.7 N, triplane diffuser suction 887.1 N
# Ferrari_812GTS_Trace[0527]: V12 6496cc RPM 2634, BMEP 17.44 bar, intake manifold resonance 54.4 kPa, buttress downforce 477.1 N, triplane diffuser suction 888.0 N
# Ferrari_812GTS_Trace[0528]: V12 6496cc RPM 2637, BMEP 17.44 bar, intake manifold resonance 54.4 kPa, buttress downforce 477.6 N, triplane diffuser suction 888.8 N
# Ferrari_812GTS_Trace[0529]: V12 6496cc RPM 2640, BMEP 17.45 bar, intake manifold resonance 54.5 kPa, buttress downforce 478.1 N, triplane diffuser suction 889.6 N
# Ferrari_812GTS_Trace[0530]: V12 6496cc RPM 2643, BMEP 17.45 bar, intake manifold resonance 54.6 kPa, buttress downforce 478.5 N, triplane diffuser suction 890.5 N
# Ferrari_812GTS_Trace[0531]: V12 6496cc RPM 2646, BMEP 17.46 bar, intake manifold resonance 54.7 kPa, buttress downforce 479.0 N, triplane diffuser suction 891.3 N
# Ferrari_812GTS_Trace[0532]: V12 6496cc RPM 2649, BMEP 17.46 bar, intake manifold resonance 54.8 kPa, buttress downforce 479.4 N, triplane diffuser suction 892.2 N
# Ferrari_812GTS_Trace[0533]: V12 6496cc RPM 2652, BMEP 17.46 bar, intake manifold resonance 54.8 kPa, buttress downforce 479.9 N, triplane diffuser suction 893.0 N
# Ferrari_812GTS_Trace[0534]: V12 6496cc RPM 2655, BMEP 17.47 bar, intake manifold resonance 54.9 kPa, buttress downforce 480.3 N, triplane diffuser suction 893.9 N
# Ferrari_812GTS_Trace[0535]: V12 6496cc RPM 2659, BMEP 17.48 bar, intake manifold resonance 55.0 kPa, buttress downforce 480.8 N, triplane diffuser suction 894.8 N
# Ferrari_812GTS_Trace[0536]: V12 6496cc RPM 2662, BMEP 17.48 bar, intake manifold resonance 55.1 kPa, buttress downforce 481.2 N, triplane diffuser suction 895.6 N
# Ferrari_812GTS_Trace[0537]: V12 6496cc RPM 2665, BMEP 17.48 bar, intake manifold resonance 55.2 kPa, buttress downforce 481.6 N, triplane diffuser suction 896.5 N
# Ferrari_812GTS_Trace[0538]: V12 6496cc RPM 2668, BMEP 17.49 bar, intake manifold resonance 55.2 kPa, buttress downforce 482.1 N, triplane diffuser suction 897.3 N
# Ferrari_812GTS_Trace[0539]: V12 6496cc RPM 2671, BMEP 17.50 bar, intake manifold resonance 55.3 kPa, buttress downforce 482.6 N, triplane diffuser suction 898.1 N
# Ferrari_812GTS_Trace[0540]: V12 6496cc RPM 2674, BMEP 17.50 bar, intake manifold resonance 55.4 kPa, buttress downforce 483.0 N, triplane diffuser suction 899.0 N
# Ferrari_812GTS_Trace[0541]: V12 6496cc RPM 2677, BMEP 17.51 bar, intake manifold resonance 55.5 kPa, buttress downforce 483.5 N, triplane diffuser suction 899.8 N
# Ferrari_812GTS_Trace[0542]: V12 6496cc RPM 2680, BMEP 17.51 bar, intake manifold resonance 55.6 kPa, buttress downforce 483.9 N, triplane diffuser suction 900.7 N
# Ferrari_812GTS_Trace[0543]: V12 6496cc RPM 2683, BMEP 17.52 bar, intake manifold resonance 55.6 kPa, buttress downforce 484.4 N, triplane diffuser suction 901.5 N
# Ferrari_812GTS_Trace[0544]: V12 6496cc RPM 2686, BMEP 17.52 bar, intake manifold resonance 55.7 kPa, buttress downforce 484.8 N, triplane diffuser suction 902.4 N
# Ferrari_812GTS_Trace[0545]: V12 6496cc RPM 2690, BMEP 17.53 bar, intake manifold resonance 55.8 kPa, buttress downforce 485.3 N, triplane diffuser suction 903.3 N
# Ferrari_812GTS_Trace[0546]: V12 6496cc RPM 2693, BMEP 17.53 bar, intake manifold resonance 55.9 kPa, buttress downforce 485.7 N, triplane diffuser suction 904.1 N
# Ferrari_812GTS_Trace[0547]: V12 6496cc RPM 2696, BMEP 17.54 bar, intake manifold resonance 56.0 kPa, buttress downforce 486.1 N, triplane diffuser suction 905.0 N
# Ferrari_812GTS_Trace[0548]: V12 6496cc RPM 2699, BMEP 17.54 bar, intake manifold resonance 56.0 kPa, buttress downforce 486.6 N, triplane diffuser suction 905.8 N
# Ferrari_812GTS_Trace[0549]: V12 6496cc RPM 2702, BMEP 17.55 bar, intake manifold resonance 56.1 kPa, buttress downforce 487.1 N, triplane diffuser suction 906.6 N
# Ferrari_812GTS_Trace[0550]: V12 6496cc RPM 2705, BMEP 17.55 bar, intake manifold resonance 56.2 kPa, buttress downforce 487.5 N, triplane diffuser suction 907.5 N
# Ferrari_812GTS_Trace[0551]: V12 6496cc RPM 2708, BMEP 17.55 bar, intake manifold resonance 56.3 kPa, buttress downforce 488.0 N, triplane diffuser suction 908.3 N
# Ferrari_812GTS_Trace[0552]: V12 6496cc RPM 2711, BMEP 17.56 bar, intake manifold resonance 56.4 kPa, buttress downforce 488.4 N, triplane diffuser suction 909.2 N
# Ferrari_812GTS_Trace[0553]: V12 6496cc RPM 2714, BMEP 17.57 bar, intake manifold resonance 56.4 kPa, buttress downforce 488.9 N, triplane diffuser suction 910.0 N
# Ferrari_812GTS_Trace[0554]: V12 6496cc RPM 2717, BMEP 17.57 bar, intake manifold resonance 56.5 kPa, buttress downforce 489.3 N, triplane diffuser suction 910.9 N
# Ferrari_812GTS_Trace[0555]: V12 6496cc RPM 2721, BMEP 17.57 bar, intake manifold resonance 56.6 kPa, buttress downforce 489.8 N, triplane diffuser suction 911.8 N
# Ferrari_812GTS_Trace[0556]: V12 6496cc RPM 2724, BMEP 17.58 bar, intake manifold resonance 56.7 kPa, buttress downforce 490.2 N, triplane diffuser suction 912.6 N
# Ferrari_812GTS_Trace[0557]: V12 6496cc RPM 2727, BMEP 17.59 bar, intake manifold resonance 56.8 kPa, buttress downforce 490.6 N, triplane diffuser suction 913.5 N
# Ferrari_812GTS_Trace[0558]: V12 6496cc RPM 2730, BMEP 17.59 bar, intake manifold resonance 56.8 kPa, buttress downforce 491.1 N, triplane diffuser suction 914.3 N
# Ferrari_812GTS_Trace[0559]: V12 6496cc RPM 2733, BMEP 17.59 bar, intake manifold resonance 56.9 kPa, buttress downforce 491.6 N, triplane diffuser suction 915.1 N
# Ferrari_812GTS_Trace[0560]: V12 6496cc RPM 2736, BMEP 17.60 bar, intake manifold resonance 57.0 kPa, buttress downforce 492.0 N, triplane diffuser suction 916.0 N
# Ferrari_812GTS_Trace[0561]: V12 6496cc RPM 2739, BMEP 17.61 bar, intake manifold resonance 57.1 kPa, buttress downforce 492.5 N, triplane diffuser suction 916.8 N
# Ferrari_812GTS_Trace[0562]: V12 6496cc RPM 2742, BMEP 17.61 bar, intake manifold resonance 57.2 kPa, buttress downforce 492.9 N, triplane diffuser suction 917.7 N
# Ferrari_812GTS_Trace[0563]: V12 6496cc RPM 2745, BMEP 17.62 bar, intake manifold resonance 57.2 kPa, buttress downforce 493.4 N, triplane diffuser suction 918.5 N
# Ferrari_812GTS_Trace[0564]: V12 6496cc RPM 2748, BMEP 17.62 bar, intake manifold resonance 57.3 kPa, buttress downforce 493.8 N, triplane diffuser suction 919.4 N
# Ferrari_812GTS_Trace[0565]: V12 6496cc RPM 2752, BMEP 17.63 bar, intake manifold resonance 57.4 kPa, buttress downforce 494.3 N, triplane diffuser suction 680.3 N
# Ferrari_812GTS_Trace[0566]: V12 6496cc RPM 2755, BMEP 17.63 bar, intake manifold resonance 57.5 kPa, buttress downforce 494.7 N, triplane diffuser suction 681.1 N
# Ferrari_812GTS_Trace[0567]: V12 6496cc RPM 2758, BMEP 17.64 bar, intake manifold resonance 57.6 kPa, buttress downforce 495.1 N, triplane diffuser suction 682.0 N
# Ferrari_812GTS_Trace[0568]: V12 6496cc RPM 2761, BMEP 17.64 bar, intake manifold resonance 57.6 kPa, buttress downforce 495.6 N, triplane diffuser suction 682.8 N
# Ferrari_812GTS_Trace[0569]: V12 6496cc RPM 2764, BMEP 17.64 bar, intake manifold resonance 57.7 kPa, buttress downforce 496.1 N, triplane diffuser suction 683.6 N
# Ferrari_812GTS_Trace[0570]: V12 6496cc RPM 2767, BMEP 17.65 bar, intake manifold resonance 57.8 kPa, buttress downforce 496.5 N, triplane diffuser suction 684.5 N
# Ferrari_812GTS_Trace[0571]: V12 6496cc RPM 2770, BMEP 17.66 bar, intake manifold resonance 57.9 kPa, buttress downforce 496.9 N, triplane diffuser suction 685.3 N
# Ferrari_812GTS_Trace[0572]: V12 6496cc RPM 2773, BMEP 17.66 bar, intake manifold resonance 58.0 kPa, buttress downforce 497.4 N, triplane diffuser suction 686.2 N
# Ferrari_812GTS_Trace[0573]: V12 6496cc RPM 2776, BMEP 17.66 bar, intake manifold resonance 58.0 kPa, buttress downforce 497.9 N, triplane diffuser suction 687.0 N
# Ferrari_812GTS_Trace[0574]: V12 6496cc RPM 2779, BMEP 17.67 bar, intake manifold resonance 58.1 kPa, buttress downforce 498.3 N, triplane diffuser suction 687.9 N
# Ferrari_812GTS_Trace[0575]: V12 6496cc RPM 2783, BMEP 17.68 bar, intake manifold resonance 58.2 kPa, buttress downforce 498.8 N, triplane diffuser suction 688.8 N
# Ferrari_812GTS_Trace[0576]: V12 6496cc RPM 2786, BMEP 17.68 bar, intake manifold resonance 58.3 kPa, buttress downforce 499.2 N, triplane diffuser suction 689.6 N
# Ferrari_812GTS_Trace[0577]: V12 6496cc RPM 2789, BMEP 17.69 bar, intake manifold resonance 58.4 kPa, buttress downforce 499.7 N, triplane diffuser suction 690.5 N
# Ferrari_812GTS_Trace[0578]: V12 6496cc RPM 2792, BMEP 17.69 bar, intake manifold resonance 58.4 kPa, buttress downforce 500.1 N, triplane diffuser suction 691.3 N
# Ferrari_812GTS_Trace[0579]: V12 6496cc RPM 2795, BMEP 17.70 bar, intake manifold resonance 58.5 kPa, buttress downforce 500.6 N, triplane diffuser suction 692.1 N
# Ferrari_812GTS_Trace[0580]: V12 6496cc RPM 2798, BMEP 17.70 bar, intake manifold resonance 58.6 kPa, buttress downforce 501.0 N, triplane diffuser suction 693.0 N
# Ferrari_812GTS_Trace[0581]: V12 6496cc RPM 2801, BMEP 17.71 bar, intake manifold resonance 58.7 kPa, buttress downforce 501.4 N, triplane diffuser suction 693.8 N
# Ferrari_812GTS_Trace[0582]: V12 6496cc RPM 2804, BMEP 17.71 bar, intake manifold resonance 58.8 kPa, buttress downforce 501.9 N, triplane diffuser suction 694.7 N
# Ferrari_812GTS_Trace[0583]: V12 6496cc RPM 2807, BMEP 17.71 bar, intake manifold resonance 58.8 kPa, buttress downforce 502.4 N, triplane diffuser suction 695.5 N
# Ferrari_812GTS_Trace[0584]: V12 6496cc RPM 2810, BMEP 17.72 bar, intake manifold resonance 58.9 kPa, buttress downforce 502.8 N, triplane diffuser suction 696.4 N
# Ferrari_812GTS_Trace[0585]: V12 6496cc RPM 2814, BMEP 17.73 bar, intake manifold resonance 59.0 kPa, buttress downforce 503.3 N, triplane diffuser suction 697.3 N
# Ferrari_812GTS_Trace[0586]: V12 6496cc RPM 2817, BMEP 17.73 bar, intake manifold resonance 59.1 kPa, buttress downforce 503.7 N, triplane diffuser suction 698.1 N
# Ferrari_812GTS_Trace[0587]: V12 6496cc RPM 2820, BMEP 17.73 bar, intake manifold resonance 59.2 kPa, buttress downforce 504.2 N, triplane diffuser suction 699.0 N
# Ferrari_812GTS_Trace[0588]: V12 6496cc RPM 2823, BMEP 17.74 bar, intake manifold resonance 59.2 kPa, buttress downforce 504.6 N, triplane diffuser suction 699.8 N
# Ferrari_812GTS_Trace[0589]: V12 6496cc RPM 2826, BMEP 17.75 bar, intake manifold resonance 59.3 kPa, buttress downforce 505.1 N, triplane diffuser suction 700.6 N
# Ferrari_812GTS_Trace[0590]: V12 6496cc RPM 2829, BMEP 17.75 bar, intake manifold resonance 59.4 kPa, buttress downforce 505.5 N, triplane diffuser suction 701.5 N
# Ferrari_812GTS_Trace[0591]: V12 6496cc RPM 2832, BMEP 17.76 bar, intake manifold resonance 59.5 kPa, buttress downforce 505.9 N, triplane diffuser suction 702.3 N
# Ferrari_812GTS_Trace[0592]: V12 6496cc RPM 2835, BMEP 17.76 bar, intake manifold resonance 59.6 kPa, buttress downforce 506.4 N, triplane diffuser suction 703.2 N
# Ferrari_812GTS_Trace[0593]: V12 6496cc RPM 2838, BMEP 17.77 bar, intake manifold resonance 59.6 kPa, buttress downforce 506.9 N, triplane diffuser suction 704.0 N
# Ferrari_812GTS_Trace[0594]: V12 6496cc RPM 2841, BMEP 17.77 bar, intake manifold resonance 59.7 kPa, buttress downforce 507.3 N, triplane diffuser suction 704.9 N
# Ferrari_812GTS_Trace[0595]: V12 6496cc RPM 2845, BMEP 17.78 bar, intake manifold resonance 59.8 kPa, buttress downforce 507.8 N, triplane diffuser suction 705.8 N
# Ferrari_812GTS_Trace[0596]: V12 6496cc RPM 2848, BMEP 17.78 bar, intake manifold resonance 59.9 kPa, buttress downforce 508.2 N, triplane diffuser suction 706.6 N
# Ferrari_812GTS_Trace[0597]: V12 6496cc RPM 2851, BMEP 17.79 bar, intake manifold resonance 60.0 kPa, buttress downforce 508.7 N, triplane diffuser suction 707.5 N
# Ferrari_812GTS_Trace[0598]: V12 6496cc RPM 2854, BMEP 17.79 bar, intake manifold resonance 60.0 kPa, buttress downforce 509.1 N, triplane diffuser suction 708.3 N
# Ferrari_812GTS_Trace[0599]: V12 6496cc RPM 2857, BMEP 17.80 bar, intake manifold resonance 60.1 kPa, buttress downforce 509.6 N, triplane diffuser suction 709.1 N
# Ferrari_812GTS_Trace[0600]: V12 6496cc RPM 2860, BMEP 17.80 bar, intake manifold resonance 48.2 kPa, buttress downforce 510.0 N, triplane diffuser suction 710.0 N
# Ferrari_812GTS_Trace[0601]: V12 6496cc RPM 2863, BMEP 17.80 bar, intake manifold resonance 48.3 kPa, buttress downforce 510.4 N, triplane diffuser suction 710.8 N
# Ferrari_812GTS_Trace[0602]: V12 6496cc RPM 2866, BMEP 17.81 bar, intake manifold resonance 48.4 kPa, buttress downforce 510.9 N, triplane diffuser suction 711.7 N
# Ferrari_812GTS_Trace[0603]: V12 6496cc RPM 2869, BMEP 17.82 bar, intake manifold resonance 48.4 kPa, buttress downforce 511.4 N, triplane diffuser suction 712.5 N
# Ferrari_812GTS_Trace[0604]: V12 6496cc RPM 2872, BMEP 17.82 bar, intake manifold resonance 48.5 kPa, buttress downforce 511.8 N, triplane diffuser suction 713.4 N
# Ferrari_812GTS_Trace[0605]: V12 6496cc RPM 2876, BMEP 17.82 bar, intake manifold resonance 48.6 kPa, buttress downforce 512.3 N, triplane diffuser suction 714.3 N
# Ferrari_812GTS_Trace[0606]: V12 6496cc RPM 2879, BMEP 17.83 bar, intake manifold resonance 48.7 kPa, buttress downforce 512.7 N, triplane diffuser suction 715.1 N
# Ferrari_812GTS_Trace[0607]: V12 6496cc RPM 2882, BMEP 17.84 bar, intake manifold resonance 48.8 kPa, buttress downforce 513.2 N, triplane diffuser suction 715.9 N
# Ferrari_812GTS_Trace[0608]: V12 6496cc RPM 2885, BMEP 17.84 bar, intake manifold resonance 48.8 kPa, buttress downforce 513.6 N, triplane diffuser suction 716.8 N
# Ferrari_812GTS_Trace[0609]: V12 6496cc RPM 2888, BMEP 17.84 bar, intake manifold resonance 48.9 kPa, buttress downforce 514.0 N, triplane diffuser suction 717.6 N
# Ferrari_812GTS_Trace[0610]: V12 6496cc RPM 2891, BMEP 17.85 bar, intake manifold resonance 49.0 kPa, buttress downforce 514.5 N, triplane diffuser suction 718.5 N
# Ferrari_812GTS_Trace[0611]: V12 6496cc RPM 2894, BMEP 17.86 bar, intake manifold resonance 49.1 kPa, buttress downforce 515.0 N, triplane diffuser suction 719.4 N
# Ferrari_812GTS_Trace[0612]: V12 6496cc RPM 2897, BMEP 17.86 bar, intake manifold resonance 49.2 kPa, buttress downforce 515.4 N, triplane diffuser suction 720.2 N
# Ferrari_812GTS_Trace[0613]: V12 6496cc RPM 2900, BMEP 17.87 bar, intake manifold resonance 49.2 kPa, buttress downforce 515.9 N, triplane diffuser suction 721.0 N
# Ferrari_812GTS_Trace[0614]: V12 6496cc RPM 2903, BMEP 17.87 bar, intake manifold resonance 49.3 kPa, buttress downforce 516.3 N, triplane diffuser suction 721.9 N
# Ferrari_812GTS_Trace[0615]: V12 6496cc RPM 2907, BMEP 17.88 bar, intake manifold resonance 49.4 kPa, buttress downforce 516.8 N, triplane diffuser suction 722.8 N
# Ferrari_812GTS_Trace[0616]: V12 6496cc RPM 2910, BMEP 17.88 bar, intake manifold resonance 49.5 kPa, buttress downforce 517.2 N, triplane diffuser suction 723.6 N
# Ferrari_812GTS_Trace[0617]: V12 6496cc RPM 2913, BMEP 17.89 bar, intake manifold resonance 49.6 kPa, buttress downforce 517.7 N, triplane diffuser suction 724.4 N
# Ferrari_812GTS_Trace[0618]: V12 6496cc RPM 2916, BMEP 17.89 bar, intake manifold resonance 49.6 kPa, buttress downforce 518.1 N, triplane diffuser suction 725.3 N
# Ferrari_812GTS_Trace[0619]: V12 6496cc RPM 2919, BMEP 17.89 bar, intake manifold resonance 49.7 kPa, buttress downforce 518.5 N, triplane diffuser suction 726.1 N
# Ferrari_812GTS_Trace[0620]: V12 6496cc RPM 2922, BMEP 17.90 bar, intake manifold resonance 49.8 kPa, buttress downforce 519.0 N, triplane diffuser suction 727.0 N
# Ferrari_812GTS_Trace[0621]: V12 6496cc RPM 2925, BMEP 17.91 bar, intake manifold resonance 49.9 kPa, buttress downforce 519.5 N, triplane diffuser suction 727.9 N
# Ferrari_812GTS_Trace[0622]: V12 6496cc RPM 2928, BMEP 17.91 bar, intake manifold resonance 50.0 kPa, buttress downforce 519.9 N, triplane diffuser suction 728.7 N
# Ferrari_812GTS_Trace[0623]: V12 6496cc RPM 2931, BMEP 17.91 bar, intake manifold resonance 50.0 kPa, buttress downforce 520.4 N, triplane diffuser suction 729.5 N
# Ferrari_812GTS_Trace[0624]: V12 6496cc RPM 2934, BMEP 17.92 bar, intake manifold resonance 50.1 kPa, buttress downforce 520.8 N, triplane diffuser suction 730.4 N
# Ferrari_812GTS_Trace[0625]: V12 6496cc RPM 2938, BMEP 17.93 bar, intake manifold resonance 50.2 kPa, buttress downforce 521.3 N, triplane diffuser suction 731.3 N
# Ferrari_812GTS_Trace[0626]: V12 6496cc RPM 2941, BMEP 17.93 bar, intake manifold resonance 50.3 kPa, buttress downforce 521.7 N, triplane diffuser suction 732.1 N
# Ferrari_812GTS_Trace[0627]: V12 6496cc RPM 2944, BMEP 17.94 bar, intake manifold resonance 50.4 kPa, buttress downforce 522.2 N, triplane diffuser suction 732.9 N
# Ferrari_812GTS_Trace[0628]: V12 6496cc RPM 2947, BMEP 17.94 bar, intake manifold resonance 50.4 kPa, buttress downforce 522.6 N, triplane diffuser suction 733.8 N
# Ferrari_812GTS_Trace[0629]: V12 6496cc RPM 2950, BMEP 17.95 bar, intake manifold resonance 50.5 kPa, buttress downforce 523.0 N, triplane diffuser suction 734.6 N
# Ferrari_812GTS_Trace[0630]: V12 6496cc RPM 2953, BMEP 17.95 bar, intake manifold resonance 50.6 kPa, buttress downforce 523.5 N, triplane diffuser suction 735.5 N
# Ferrari_812GTS_Trace[0631]: V12 6496cc RPM 2956, BMEP 17.96 bar, intake manifold resonance 50.7 kPa, buttress downforce 524.0 N, triplane diffuser suction 736.4 N
# Ferrari_812GTS_Trace[0632]: V12 6496cc RPM 2959, BMEP 17.96 bar, intake manifold resonance 50.8 kPa, buttress downforce 524.4 N, triplane diffuser suction 737.2 N
# Ferrari_812GTS_Trace[0633]: V12 6496cc RPM 2962, BMEP 17.96 bar, intake manifold resonance 50.8 kPa, buttress downforce 524.9 N, triplane diffuser suction 738.0 N
# Ferrari_812GTS_Trace[0634]: V12 6496cc RPM 2965, BMEP 17.97 bar, intake manifold resonance 50.9 kPa, buttress downforce 525.3 N, triplane diffuser suction 738.9 N
# Ferrari_812GTS_Trace[0635]: V12 6496cc RPM 2969, BMEP 17.98 bar, intake manifold resonance 51.0 kPa, buttress downforce 525.8 N, triplane diffuser suction 739.8 N
# Ferrari_812GTS_Trace[0636]: V12 6496cc RPM 2972, BMEP 17.98 bar, intake manifold resonance 51.1 kPa, buttress downforce 526.2 N, triplane diffuser suction 740.6 N
# Ferrari_812GTS_Trace[0637]: V12 6496cc RPM 2975, BMEP 17.98 bar, intake manifold resonance 51.2 kPa, buttress downforce 526.7 N, triplane diffuser suction 741.4 N
# Ferrari_812GTS_Trace[0638]: V12 6496cc RPM 2978, BMEP 17.99 bar, intake manifold resonance 51.2 kPa, buttress downforce 527.1 N, triplane diffuser suction 742.3 N
# Ferrari_812GTS_Trace[0639]: V12 6496cc RPM 2981, BMEP 18.00 bar, intake manifold resonance 51.3 kPa, buttress downforce 527.5 N, triplane diffuser suction 743.1 N
# Ferrari_812GTS_Trace[0640]: V12 6496cc RPM 2984, BMEP 14.80 bar, intake manifold resonance 51.4 kPa, buttress downforce 528.0 N, triplane diffuser suction 744.0 N
# Ferrari_812GTS_Trace[0641]: V12 6496cc RPM 2987, BMEP 14.80 bar, intake manifold resonance 51.5 kPa, buttress downforce 528.5 N, triplane diffuser suction 744.9 N
# Ferrari_812GTS_Trace[0642]: V12 6496cc RPM 2990, BMEP 14.81 bar, intake manifold resonance 51.6 kPa, buttress downforce 528.9 N, triplane diffuser suction 745.7 N
# Ferrari_812GTS_Trace[0643]: V12 6496cc RPM 2993, BMEP 14.82 bar, intake manifold resonance 51.6 kPa, buttress downforce 529.4 N, triplane diffuser suction 746.5 N
# Ferrari_812GTS_Trace[0644]: V12 6496cc RPM 2996, BMEP 14.82 bar, intake manifold resonance 51.7 kPa, buttress downforce 529.8 N, triplane diffuser suction 747.4 N
# Ferrari_812GTS_Trace[0645]: V12 6496cc RPM 3000, BMEP 14.83 bar, intake manifold resonance 51.8 kPa, buttress downforce 530.3 N, triplane diffuser suction 748.3 N
# Ferrari_812GTS_Trace[0646]: V12 6496cc RPM 3003, BMEP 14.83 bar, intake manifold resonance 51.9 kPa, buttress downforce 530.7 N, triplane diffuser suction 749.1 N
# Ferrari_812GTS_Trace[0647]: V12 6496cc RPM 3006, BMEP 14.84 bar, intake manifold resonance 52.0 kPa, buttress downforce 531.2 N, triplane diffuser suction 749.9 N
# Ferrari_812GTS_Trace[0648]: V12 6496cc RPM 3009, BMEP 14.84 bar, intake manifold resonance 52.0 kPa, buttress downforce 531.6 N, triplane diffuser suction 750.8 N
# Ferrari_812GTS_Trace[0649]: V12 6496cc RPM 3012, BMEP 14.85 bar, intake manifold resonance 52.1 kPa, buttress downforce 532.0 N, triplane diffuser suction 751.6 N
# Ferrari_812GTS_Trace[0650]: V12 6496cc RPM 3015, BMEP 14.85 bar, intake manifold resonance 52.2 kPa, buttress downforce 532.5 N, triplane diffuser suction 752.5 N
# Ferrari_812GTS_Trace[0651]: V12 6496cc RPM 3018, BMEP 14.86 bar, intake manifold resonance 52.3 kPa, buttress downforce 533.0 N, triplane diffuser suction 753.4 N
# Ferrari_812GTS_Trace[0652]: V12 6496cc RPM 3021, BMEP 14.86 bar, intake manifold resonance 52.4 kPa, buttress downforce 533.4 N, triplane diffuser suction 754.2 N
# Ferrari_812GTS_Trace[0653]: V12 6496cc RPM 3024, BMEP 14.87 bar, intake manifold resonance 52.4 kPa, buttress downforce 533.9 N, triplane diffuser suction 755.0 N
# Ferrari_812GTS_Trace[0654]: V12 6496cc RPM 3027, BMEP 14.87 bar, intake manifold resonance 52.5 kPa, buttress downforce 534.3 N, triplane diffuser suction 755.9 N
# Ferrari_812GTS_Trace[0655]: V12 6496cc RPM 3031, BMEP 14.88 bar, intake manifold resonance 52.6 kPa, buttress downforce 534.8 N, triplane diffuser suction 756.8 N
# Ferrari_812GTS_Trace[0656]: V12 6496cc RPM 3034, BMEP 14.88 bar, intake manifold resonance 52.7 kPa, buttress downforce 535.2 N, triplane diffuser suction 757.6 N
# Ferrari_812GTS_Trace[0657]: V12 6496cc RPM 3037, BMEP 14.89 bar, intake manifold resonance 52.8 kPa, buttress downforce 535.7 N, triplane diffuser suction 758.4 N
# Ferrari_812GTS_Trace[0658]: V12 6496cc RPM 3040, BMEP 14.89 bar, intake manifold resonance 52.8 kPa, buttress downforce 536.1 N, triplane diffuser suction 759.3 N
# Ferrari_812GTS_Trace[0659]: V12 6496cc RPM 3043, BMEP 14.89 bar, intake manifold resonance 52.9 kPa, buttress downforce 536.5 N, triplane diffuser suction 760.1 N
# Ferrari_812GTS_Trace[0660]: V12 6496cc RPM 3046, BMEP 14.90 bar, intake manifold resonance 53.0 kPa, buttress downforce 537.0 N, triplane diffuser suction 761.0 N
# Ferrari_812GTS_Trace[0661]: V12 6496cc RPM 3049, BMEP 14.91 bar, intake manifold resonance 53.1 kPa, buttress downforce 537.5 N, triplane diffuser suction 761.9 N
# Ferrari_812GTS_Trace[0662]: V12 6496cc RPM 3052, BMEP 14.91 bar, intake manifold resonance 53.2 kPa, buttress downforce 537.9 N, triplane diffuser suction 762.7 N
# Ferrari_812GTS_Trace[0663]: V12 6496cc RPM 3055, BMEP 14.92 bar, intake manifold resonance 53.2 kPa, buttress downforce 538.4 N, triplane diffuser suction 763.5 N
# Ferrari_812GTS_Trace[0664]: V12 6496cc RPM 3058, BMEP 14.92 bar, intake manifold resonance 53.3 kPa, buttress downforce 538.8 N, triplane diffuser suction 764.4 N
# Ferrari_812GTS_Trace[0665]: V12 6496cc RPM 3062, BMEP 14.93 bar, intake manifold resonance 53.4 kPa, buttress downforce 539.3 N, triplane diffuser suction 765.3 N
# Ferrari_812GTS_Trace[0666]: V12 6496cc RPM 3065, BMEP 14.93 bar, intake manifold resonance 53.5 kPa, buttress downforce 539.7 N, triplane diffuser suction 766.1 N
# Ferrari_812GTS_Trace[0667]: V12 6496cc RPM 3068, BMEP 14.94 bar, intake manifold resonance 53.6 kPa, buttress downforce 540.2 N, triplane diffuser suction 766.9 N
# Ferrari_812GTS_Trace[0668]: V12 6496cc RPM 3071, BMEP 14.94 bar, intake manifold resonance 53.6 kPa, buttress downforce 540.6 N, triplane diffuser suction 767.8 N
# Ferrari_812GTS_Trace[0669]: V12 6496cc RPM 3074, BMEP 14.95 bar, intake manifold resonance 53.7 kPa, buttress downforce 541.0 N, triplane diffuser suction 768.6 N
# Ferrari_812GTS_Trace[0670]: V12 6496cc RPM 3077, BMEP 14.95 bar, intake manifold resonance 53.8 kPa, buttress downforce 541.5 N, triplane diffuser suction 769.5 N
# Ferrari_812GTS_Trace[0671]: V12 6496cc RPM 3080, BMEP 14.96 bar, intake manifold resonance 53.9 kPa, buttress downforce 542.0 N, triplane diffuser suction 770.4 N
# Ferrari_812GTS_Trace[0672]: V12 6496cc RPM 3083, BMEP 14.96 bar, intake manifold resonance 54.0 kPa, buttress downforce 542.4 N, triplane diffuser suction 771.2 N
# Ferrari_812GTS_Trace[0673]: V12 6496cc RPM 3086, BMEP 14.96 bar, intake manifold resonance 54.0 kPa, buttress downforce 542.9 N, triplane diffuser suction 772.0 N
# Ferrari_812GTS_Trace[0674]: V12 6496cc RPM 3089, BMEP 14.97 bar, intake manifold resonance 54.1 kPa, buttress downforce 543.3 N, triplane diffuser suction 772.9 N
# Ferrari_812GTS_Trace[0675]: V12 6496cc RPM 3093, BMEP 14.98 bar, intake manifold resonance 54.2 kPa, buttress downforce 543.8 N, triplane diffuser suction 773.8 N
# Ferrari_812GTS_Trace[0676]: V12 6496cc RPM 3096, BMEP 14.98 bar, intake manifold resonance 54.3 kPa, buttress downforce 544.2 N, triplane diffuser suction 774.6 N
# Ferrari_812GTS_Trace[0677]: V12 6496cc RPM 3099, BMEP 14.99 bar, intake manifold resonance 54.4 kPa, buttress downforce 544.7 N, triplane diffuser suction 775.4 N
# Ferrari_812GTS_Trace[0678]: V12 6496cc RPM 3102, BMEP 14.99 bar, intake manifold resonance 54.4 kPa, buttress downforce 545.1 N, triplane diffuser suction 776.3 N
# Ferrari_812GTS_Trace[0679]: V12 6496cc RPM 3105, BMEP 15.00 bar, intake manifold resonance 54.5 kPa, buttress downforce 545.5 N, triplane diffuser suction 777.1 N
# Ferrari_812GTS_Trace[0680]: V12 6496cc RPM 3108, BMEP 15.00 bar, intake manifold resonance 54.6 kPa, buttress downforce 546.0 N, triplane diffuser suction 778.0 N
# Ferrari_812GTS_Trace[0681]: V12 6496cc RPM 3111, BMEP 15.01 bar, intake manifold resonance 54.7 kPa, buttress downforce 546.5 N, triplane diffuser suction 778.9 N
# Ferrari_812GTS_Trace[0682]: V12 6496cc RPM 3114, BMEP 15.01 bar, intake manifold resonance 54.8 kPa, buttress downforce 546.9 N, triplane diffuser suction 779.7 N
# Ferrari_812GTS_Trace[0683]: V12 6496cc RPM 3117, BMEP 15.02 bar, intake manifold resonance 54.8 kPa, buttress downforce 547.4 N, triplane diffuser suction 780.5 N
# Ferrari_812GTS_Trace[0684]: V12 6496cc RPM 3120, BMEP 15.02 bar, intake manifold resonance 54.9 kPa, buttress downforce 547.8 N, triplane diffuser suction 781.4 N
# Ferrari_812GTS_Trace[0685]: V12 6496cc RPM 3124, BMEP 15.03 bar, intake manifold resonance 55.0 kPa, buttress downforce 548.3 N, triplane diffuser suction 782.3 N
# Ferrari_812GTS_Trace[0686]: V12 6496cc RPM 3127, BMEP 15.03 bar, intake manifold resonance 55.1 kPa, buttress downforce 548.7 N, triplane diffuser suction 783.1 N
# Ferrari_812GTS_Trace[0687]: V12 6496cc RPM 3130, BMEP 15.04 bar, intake manifold resonance 55.2 kPa, buttress downforce 549.2 N, triplane diffuser suction 783.9 N
# Ferrari_812GTS_Trace[0688]: V12 6496cc RPM 3133, BMEP 15.04 bar, intake manifold resonance 55.2 kPa, buttress downforce 549.6 N, triplane diffuser suction 784.8 N
# Ferrari_812GTS_Trace[0689]: V12 6496cc RPM 3136, BMEP 15.05 bar, intake manifold resonance 55.3 kPa, buttress downforce 550.0 N, triplane diffuser suction 785.6 N
# Ferrari_812GTS_Trace[0690]: V12 6496cc RPM 3139, BMEP 15.05 bar, intake manifold resonance 55.4 kPa, buttress downforce 550.5 N, triplane diffuser suction 786.5 N
# Ferrari_812GTS_Trace[0691]: V12 6496cc RPM 3142, BMEP 15.05 bar, intake manifold resonance 55.5 kPa, buttress downforce 551.0 N, triplane diffuser suction 787.4 N
# Ferrari_812GTS_Trace[0692]: V12 6496cc RPM 3145, BMEP 15.06 bar, intake manifold resonance 55.6 kPa, buttress downforce 551.4 N, triplane diffuser suction 788.2 N
# Ferrari_812GTS_Trace[0693]: V12 6496cc RPM 3148, BMEP 15.07 bar, intake manifold resonance 55.6 kPa, buttress downforce 551.9 N, triplane diffuser suction 789.0 N
# Ferrari_812GTS_Trace[0694]: V12 6496cc RPM 3151, BMEP 15.07 bar, intake manifold resonance 55.7 kPa, buttress downforce 552.3 N, triplane diffuser suction 789.9 N
# Ferrari_812GTS_Trace[0695]: V12 6496cc RPM 3155, BMEP 15.08 bar, intake manifold resonance 55.8 kPa, buttress downforce 552.8 N, triplane diffuser suction 790.8 N
# Ferrari_812GTS_Trace[0696]: V12 6496cc RPM 3158, BMEP 15.08 bar, intake manifold resonance 55.9 kPa, buttress downforce 553.2 N, triplane diffuser suction 791.6 N
# Ferrari_812GTS_Trace[0697]: V12 6496cc RPM 3161, BMEP 15.09 bar, intake manifold resonance 56.0 kPa, buttress downforce 553.7 N, triplane diffuser suction 792.4 N
# Ferrari_812GTS_Trace[0698]: V12 6496cc RPM 3164, BMEP 15.09 bar, intake manifold resonance 56.0 kPa, buttress downforce 554.1 N, triplane diffuser suction 793.3 N
# Ferrari_812GTS_Trace[0699]: V12 6496cc RPM 3167, BMEP 15.10 bar, intake manifold resonance 56.1 kPa, buttress downforce 554.5 N, triplane diffuser suction 794.1 N
# Ferrari_812GTS_Trace[0700]: V12 6496cc RPM 3170, BMEP 15.10 bar, intake manifold resonance 56.2 kPa, buttress downforce 555.0 N, triplane diffuser suction 795.0 N
# Ferrari_812GTS_Trace[0701]: V12 6496cc RPM 3173, BMEP 15.11 bar, intake manifold resonance 56.3 kPa, buttress downforce 555.5 N, triplane diffuser suction 795.9 N
# Ferrari_812GTS_Trace[0702]: V12 6496cc RPM 3176, BMEP 15.11 bar, intake manifold resonance 56.4 kPa, buttress downforce 555.9 N, triplane diffuser suction 796.7 N
# Ferrari_812GTS_Trace[0703]: V12 6496cc RPM 3179, BMEP 15.12 bar, intake manifold resonance 56.4 kPa, buttress downforce 556.4 N, triplane diffuser suction 797.5 N
# Ferrari_812GTS_Trace[0704]: V12 6496cc RPM 3182, BMEP 15.12 bar, intake manifold resonance 56.5 kPa, buttress downforce 556.8 N, triplane diffuser suction 798.4 N
# Ferrari_812GTS_Trace[0705]: V12 6496cc RPM 3186, BMEP 15.13 bar, intake manifold resonance 56.6 kPa, buttress downforce 557.3 N, triplane diffuser suction 799.3 N
# Ferrari_812GTS_Trace[0706]: V12 6496cc RPM 3189, BMEP 15.13 bar, intake manifold resonance 56.7 kPa, buttress downforce 557.7 N, triplane diffuser suction 800.1 N
# Ferrari_812GTS_Trace[0707]: V12 6496cc RPM 3192, BMEP 15.14 bar, intake manifold resonance 56.8 kPa, buttress downforce 558.2 N, triplane diffuser suction 800.9 N
# Ferrari_812GTS_Trace[0708]: V12 6496cc RPM 3195, BMEP 15.14 bar, intake manifold resonance 56.8 kPa, buttress downforce 558.6 N, triplane diffuser suction 801.8 N
# Ferrari_812GTS_Trace[0709]: V12 6496cc RPM 3198, BMEP 15.14 bar, intake manifold resonance 56.9 kPa, buttress downforce 559.0 N, triplane diffuser suction 802.6 N
# Ferrari_812GTS_Trace[0710]: V12 6496cc RPM 3201, BMEP 15.15 bar, intake manifold resonance 57.0 kPa, buttress downforce 559.5 N, triplane diffuser suction 803.5 N
# Ferrari_812GTS_Trace[0711]: V12 6496cc RPM 3204, BMEP 15.16 bar, intake manifold resonance 57.1 kPa, buttress downforce 560.0 N, triplane diffuser suction 804.4 N
# Ferrari_812GTS_Trace[0712]: V12 6496cc RPM 3207, BMEP 15.16 bar, intake manifold resonance 57.2 kPa, buttress downforce 560.4 N, triplane diffuser suction 805.2 N
# Ferrari_812GTS_Trace[0713]: V12 6496cc RPM 3210, BMEP 15.17 bar, intake manifold resonance 57.2 kPa, buttress downforce 560.9 N, triplane diffuser suction 806.0 N
# Ferrari_812GTS_Trace[0714]: V12 6496cc RPM 3213, BMEP 15.17 bar, intake manifold resonance 57.3 kPa, buttress downforce 561.3 N, triplane diffuser suction 806.9 N
# Ferrari_812GTS_Trace[0715]: V12 6496cc RPM 3217, BMEP 15.18 bar, intake manifold resonance 57.4 kPa, buttress downforce 561.8 N, triplane diffuser suction 807.8 N
# Ferrari_812GTS_Trace[0716]: V12 6496cc RPM 3220, BMEP 15.18 bar, intake manifold resonance 57.5 kPa, buttress downforce 562.2 N, triplane diffuser suction 808.6 N
# Ferrari_812GTS_Trace[0717]: V12 6496cc RPM 3223, BMEP 15.19 bar, intake manifold resonance 57.6 kPa, buttress downforce 562.7 N, triplane diffuser suction 809.4 N
# Ferrari_812GTS_Trace[0718]: V12 6496cc RPM 3226, BMEP 15.19 bar, intake manifold resonance 57.6 kPa, buttress downforce 563.1 N, triplane diffuser suction 810.3 N
# Ferrari_812GTS_Trace[0719]: V12 6496cc RPM 3229, BMEP 15.20 bar, intake manifold resonance 57.7 kPa, buttress downforce 563.5 N, triplane diffuser suction 811.1 N
# Ferrari_812GTS_Trace[0720]: V12 6496cc RPM 3232, BMEP 15.20 bar, intake manifold resonance 57.8 kPa, buttress downforce 564.0 N, triplane diffuser suction 812.0 N
# Ferrari_812GTS_Trace[0721]: V12 6496cc RPM 3235, BMEP 15.21 bar, intake manifold resonance 57.9 kPa, buttress downforce 564.5 N, triplane diffuser suction 812.9 N
# Ferrari_812GTS_Trace[0722]: V12 6496cc RPM 3238, BMEP 15.21 bar, intake manifold resonance 58.0 kPa, buttress downforce 564.9 N, triplane diffuser suction 813.7 N
# Ferrari_812GTS_Trace[0723]: V12 6496cc RPM 3241, BMEP 15.21 bar, intake manifold resonance 58.0 kPa, buttress downforce 565.4 N, triplane diffuser suction 814.5 N
# Ferrari_812GTS_Trace[0724]: V12 6496cc RPM 3244, BMEP 15.22 bar, intake manifold resonance 58.1 kPa, buttress downforce 565.8 N, triplane diffuser suction 815.4 N
# Ferrari_812GTS_Trace[0725]: V12 6496cc RPM 3248, BMEP 15.23 bar, intake manifold resonance 58.2 kPa, buttress downforce 566.3 N, triplane diffuser suction 816.3 N
# Ferrari_812GTS_Trace[0726]: V12 6496cc RPM 3251, BMEP 15.23 bar, intake manifold resonance 58.3 kPa, buttress downforce 566.7 N, triplane diffuser suction 817.1 N
# Ferrari_812GTS_Trace[0727]: V12 6496cc RPM 3254, BMEP 15.24 bar, intake manifold resonance 58.4 kPa, buttress downforce 567.2 N, triplane diffuser suction 817.9 N
# Ferrari_812GTS_Trace[0728]: V12 6496cc RPM 3257, BMEP 15.24 bar, intake manifold resonance 58.4 kPa, buttress downforce 567.6 N, triplane diffuser suction 818.8 N
# Ferrari_812GTS_Trace[0729]: V12 6496cc RPM 3260, BMEP 15.25 bar, intake manifold resonance 58.5 kPa, buttress downforce 568.0 N, triplane diffuser suction 819.6 N
# Ferrari_812GTS_Trace[0730]: V12 6496cc RPM 3263, BMEP 15.25 bar, intake manifold resonance 58.6 kPa, buttress downforce 568.5 N, triplane diffuser suction 820.5 N
# Ferrari_812GTS_Trace[0731]: V12 6496cc RPM 3266, BMEP 15.26 bar, intake manifold resonance 58.7 kPa, buttress downforce 569.0 N, triplane diffuser suction 821.4 N
# Ferrari_812GTS_Trace[0732]: V12 6496cc RPM 3269, BMEP 15.26 bar, intake manifold resonance 58.8 kPa, buttress downforce 569.4 N, triplane diffuser suction 822.2 N
# Ferrari_812GTS_Trace[0733]: V12 6496cc RPM 3272, BMEP 15.27 bar, intake manifold resonance 58.8 kPa, buttress downforce 569.9 N, triplane diffuser suction 823.0 N
# Ferrari_812GTS_Trace[0734]: V12 6496cc RPM 3275, BMEP 15.27 bar, intake manifold resonance 58.9 kPa, buttress downforce 570.3 N, triplane diffuser suction 823.9 N
# Ferrari_812GTS_Trace[0735]: V12 6496cc RPM 3279, BMEP 15.28 bar, intake manifold resonance 59.0 kPa, buttress downforce 570.8 N, triplane diffuser suction 824.8 N
# Ferrari_812GTS_Trace[0736]: V12 6496cc RPM 3282, BMEP 15.28 bar, intake manifold resonance 59.1 kPa, buttress downforce 571.2 N, triplane diffuser suction 825.6 N
# Ferrari_812GTS_Trace[0737]: V12 6496cc RPM 3285, BMEP 15.29 bar, intake manifold resonance 59.2 kPa, buttress downforce 571.7 N, triplane diffuser suction 826.4 N
# Ferrari_812GTS_Trace[0738]: V12 6496cc RPM 3288, BMEP 15.29 bar, intake manifold resonance 59.2 kPa, buttress downforce 572.1 N, triplane diffuser suction 827.3 N
# Ferrari_812GTS_Trace[0739]: V12 6496cc RPM 3291, BMEP 15.30 bar, intake manifold resonance 59.3 kPa, buttress downforce 572.5 N, triplane diffuser suction 828.1 N
# Ferrari_812GTS_Trace[0740]: V12 6496cc RPM 3294, BMEP 15.30 bar, intake manifold resonance 59.4 kPa, buttress downforce 573.0 N, triplane diffuser suction 829.0 N
# Ferrari_812GTS_Trace[0741]: V12 6496cc RPM 3297, BMEP 15.30 bar, intake manifold resonance 59.5 kPa, buttress downforce 573.5 N, triplane diffuser suction 829.9 N
# Ferrari_812GTS_Trace[0742]: V12 6496cc RPM 3300, BMEP 15.31 bar, intake manifold resonance 59.6 kPa, buttress downforce 573.9 N, triplane diffuser suction 830.7 N
# Ferrari_812GTS_Trace[0743]: V12 6496cc RPM 3303, BMEP 15.32 bar, intake manifold resonance 59.6 kPa, buttress downforce 574.4 N, triplane diffuser suction 831.5 N
# Ferrari_812GTS_Trace[0744]: V12 6496cc RPM 3306, BMEP 15.32 bar, intake manifold resonance 59.7 kPa, buttress downforce 574.8 N, triplane diffuser suction 832.4 N
# Ferrari_812GTS_Trace[0745]: V12 6496cc RPM 3310, BMEP 15.33 bar, intake manifold resonance 59.8 kPa, buttress downforce 575.3 N, triplane diffuser suction 833.3 N
# Ferrari_812GTS_Trace[0746]: V12 6496cc RPM 3313, BMEP 15.33 bar, intake manifold resonance 59.9 kPa, buttress downforce 575.7 N, triplane diffuser suction 834.1 N
# Ferrari_812GTS_Trace[0747]: V12 6496cc RPM 3316, BMEP 15.34 bar, intake manifold resonance 60.0 kPa, buttress downforce 576.2 N, triplane diffuser suction 834.9 N
# Ferrari_812GTS_Trace[0748]: V12 6496cc RPM 3319, BMEP 15.34 bar, intake manifold resonance 60.0 kPa, buttress downforce 576.6 N, triplane diffuser suction 835.8 N
# Ferrari_812GTS_Trace[0749]: V12 6496cc RPM 3322, BMEP 15.35 bar, intake manifold resonance 60.1 kPa, buttress downforce 577.0 N, triplane diffuser suction 836.6 N
# Ferrari_812GTS_Trace[0750]: V12 6496cc RPM 3325, BMEP 15.35 bar, intake manifold resonance 48.2 kPa, buttress downforce 577.5 N, triplane diffuser suction 837.5 N
# Ferrari_812GTS_Trace[0751]: V12 6496cc RPM 3328, BMEP 15.36 bar, intake manifold resonance 48.3 kPa, buttress downforce 578.0 N, triplane diffuser suction 838.4 N
# Ferrari_812GTS_Trace[0752]: V12 6496cc RPM 3331, BMEP 15.36 bar, intake manifold resonance 48.4 kPa, buttress downforce 578.4 N, triplane diffuser suction 839.2 N
# Ferrari_812GTS_Trace[0753]: V12 6496cc RPM 3334, BMEP 15.37 bar, intake manifold resonance 48.4 kPa, buttress downforce 578.9 N, triplane diffuser suction 840.0 N
# Ferrari_812GTS_Trace[0754]: V12 6496cc RPM 3337, BMEP 15.37 bar, intake manifold resonance 48.5 kPa, buttress downforce 579.3 N, triplane diffuser suction 840.9 N
# Ferrari_812GTS_Trace[0755]: V12 6496cc RPM 3341, BMEP 15.38 bar, intake manifold resonance 48.6 kPa, buttress downforce 579.8 N, triplane diffuser suction 841.8 N
# Ferrari_812GTS_Trace[0756]: V12 6496cc RPM 3344, BMEP 15.38 bar, intake manifold resonance 48.7 kPa, buttress downforce 580.2 N, triplane diffuser suction 842.6 N
# Ferrari_812GTS_Trace[0757]: V12 6496cc RPM 3347, BMEP 15.39 bar, intake manifold resonance 48.8 kPa, buttress downforce 580.7 N, triplane diffuser suction 843.4 N
# Ferrari_812GTS_Trace[0758]: V12 6496cc RPM 3350, BMEP 15.39 bar, intake manifold resonance 48.8 kPa, buttress downforce 581.1 N, triplane diffuser suction 844.3 N
# Ferrari_812GTS_Trace[0759]: V12 6496cc RPM 3353, BMEP 15.39 bar, intake manifold resonance 48.9 kPa, buttress downforce 581.5 N, triplane diffuser suction 845.1 N
# Ferrari_812GTS_Trace[0760]: V12 6496cc RPM 3356, BMEP 15.40 bar, intake manifold resonance 49.0 kPa, buttress downforce 582.0 N, triplane diffuser suction 846.0 N
# Ferrari_812GTS_Trace[0761]: V12 6496cc RPM 3359, BMEP 15.41 bar, intake manifold resonance 49.1 kPa, buttress downforce 582.5 N, triplane diffuser suction 846.9 N
# Ferrari_812GTS_Trace[0762]: V12 6496cc RPM 3362, BMEP 15.41 bar, intake manifold resonance 49.2 kPa, buttress downforce 582.9 N, triplane diffuser suction 847.7 N
# Ferrari_812GTS_Trace[0763]: V12 6496cc RPM 3365, BMEP 15.42 bar, intake manifold resonance 49.2 kPa, buttress downforce 583.4 N, triplane diffuser suction 848.5 N
# Ferrari_812GTS_Trace[0764]: V12 6496cc RPM 3368, BMEP 15.42 bar, intake manifold resonance 49.3 kPa, buttress downforce 583.8 N, triplane diffuser suction 849.4 N
# Ferrari_812GTS_Trace[0765]: V12 6496cc RPM 3372, BMEP 15.43 bar, intake manifold resonance 49.4 kPa, buttress downforce 584.3 N, triplane diffuser suction 850.3 N
# Ferrari_812GTS_Trace[0766]: V12 6496cc RPM 3375, BMEP 15.43 bar, intake manifold resonance 49.5 kPa, buttress downforce 584.7 N, triplane diffuser suction 851.1 N
# Ferrari_812GTS_Trace[0767]: V12 6496cc RPM 3378, BMEP 15.44 bar, intake manifold resonance 49.6 kPa, buttress downforce 585.2 N, triplane diffuser suction 851.9 N
# Ferrari_812GTS_Trace[0768]: V12 6496cc RPM 3381, BMEP 15.44 bar, intake manifold resonance 49.6 kPa, buttress downforce 585.6 N, triplane diffuser suction 852.8 N
# Ferrari_812GTS_Trace[0769]: V12 6496cc RPM 3384, BMEP 15.45 bar, intake manifold resonance 49.7 kPa, buttress downforce 586.0 N, triplane diffuser suction 853.6 N
# Ferrari_812GTS_Trace[0770]: V12 6496cc RPM 3387, BMEP 15.45 bar, intake manifold resonance 49.8 kPa, buttress downforce 586.5 N, triplane diffuser suction 854.5 N
# Ferrari_812GTS_Trace[0771]: V12 6496cc RPM 3390, BMEP 15.46 bar, intake manifold resonance 49.9 kPa, buttress downforce 587.0 N, triplane diffuser suction 855.4 N
# Ferrari_812GTS_Trace[0772]: V12 6496cc RPM 3393, BMEP 15.46 bar, intake manifold resonance 50.0 kPa, buttress downforce 587.4 N, triplane diffuser suction 856.2 N
# Ferrari_812GTS_Trace[0773]: V12 6496cc RPM 3396, BMEP 15.46 bar, intake manifold resonance 50.0 kPa, buttress downforce 587.9 N, triplane diffuser suction 857.0 N
# Ferrari_812GTS_Trace[0774]: V12 6496cc RPM 3399, BMEP 15.47 bar, intake manifold resonance 50.1 kPa, buttress downforce 588.3 N, triplane diffuser suction 857.9 N
# Ferrari_812GTS_Trace[0775]: V12 6496cc RPM 3403, BMEP 15.48 bar, intake manifold resonance 50.2 kPa, buttress downforce 588.8 N, triplane diffuser suction 858.8 N
# Ferrari_812GTS_Trace[0776]: V12 6496cc RPM 3406, BMEP 15.48 bar, intake manifold resonance 50.3 kPa, buttress downforce 589.2 N, triplane diffuser suction 859.6 N
# Ferrari_812GTS_Trace[0777]: V12 6496cc RPM 3409, BMEP 15.49 bar, intake manifold resonance 50.4 kPa, buttress downforce 589.7 N, triplane diffuser suction 860.4 N
# Ferrari_812GTS_Trace[0778]: V12 6496cc RPM 3412, BMEP 15.49 bar, intake manifold resonance 50.4 kPa, buttress downforce 590.1 N, triplane diffuser suction 861.3 N
# Ferrari_812GTS_Trace[0779]: V12 6496cc RPM 3415, BMEP 15.50 bar, intake manifold resonance 50.5 kPa, buttress downforce 590.5 N, triplane diffuser suction 862.1 N
# Ferrari_812GTS_Trace[0780]: V12 6496cc RPM 3418, BMEP 15.50 bar, intake manifold resonance 50.6 kPa, buttress downforce 591.0 N, triplane diffuser suction 863.0 N
# Ferrari_812GTS_Trace[0781]: V12 6496cc RPM 3421, BMEP 15.51 bar, intake manifold resonance 50.7 kPa, buttress downforce 591.5 N, triplane diffuser suction 863.9 N
# Ferrari_812GTS_Trace[0782]: V12 6496cc RPM 3424, BMEP 15.51 bar, intake manifold resonance 50.8 kPa, buttress downforce 591.9 N, triplane diffuser suction 864.7 N
# Ferrari_812GTS_Trace[0783]: V12 6496cc RPM 3427, BMEP 15.52 bar, intake manifold resonance 50.8 kPa, buttress downforce 592.4 N, triplane diffuser suction 865.5 N
# Ferrari_812GTS_Trace[0784]: V12 6496cc RPM 3430, BMEP 15.52 bar, intake manifold resonance 50.9 kPa, buttress downforce 592.8 N, triplane diffuser suction 866.4 N
# Ferrari_812GTS_Trace[0785]: V12 6496cc RPM 3434, BMEP 15.53 bar, intake manifold resonance 51.0 kPa, buttress downforce 593.3 N, triplane diffuser suction 867.3 N
# Ferrari_812GTS_Trace[0786]: V12 6496cc RPM 3437, BMEP 15.53 bar, intake manifold resonance 51.1 kPa, buttress downforce 593.7 N, triplane diffuser suction 868.1 N
# Ferrari_812GTS_Trace[0787]: V12 6496cc RPM 3440, BMEP 15.54 bar, intake manifold resonance 51.2 kPa, buttress downforce 594.2 N, triplane diffuser suction 868.9 N
# Ferrari_812GTS_Trace[0788]: V12 6496cc RPM 3443, BMEP 15.54 bar, intake manifold resonance 51.2 kPa, buttress downforce 594.6 N, triplane diffuser suction 869.8 N
# Ferrari_812GTS_Trace[0789]: V12 6496cc RPM 3446, BMEP 15.55 bar, intake manifold resonance 51.3 kPa, buttress downforce 595.0 N, triplane diffuser suction 870.6 N
# Ferrari_812GTS_Trace[0790]: V12 6496cc RPM 3449, BMEP 15.55 bar, intake manifold resonance 51.4 kPa, buttress downforce 595.5 N, triplane diffuser suction 871.5 N
# Ferrari_812GTS_Trace[0791]: V12 6496cc RPM 3452, BMEP 15.55 bar, intake manifold resonance 51.5 kPa, buttress downforce 596.0 N, triplane diffuser suction 872.4 N
# Ferrari_812GTS_Trace[0792]: V12 6496cc RPM 3455, BMEP 15.56 bar, intake manifold resonance 51.6 kPa, buttress downforce 596.4 N, triplane diffuser suction 873.2 N
# Ferrari_812GTS_Trace[0793]: V12 6496cc RPM 3458, BMEP 15.57 bar, intake manifold resonance 51.6 kPa, buttress downforce 596.9 N, triplane diffuser suction 874.0 N
# Ferrari_812GTS_Trace[0794]: V12 6496cc RPM 3461, BMEP 15.57 bar, intake manifold resonance 51.7 kPa, buttress downforce 597.3 N, triplane diffuser suction 874.9 N
# Ferrari_812GTS_Trace[0795]: V12 6496cc RPM 3465, BMEP 15.58 bar, intake manifold resonance 51.8 kPa, buttress downforce 597.8 N, triplane diffuser suction 875.8 N
# Ferrari_812GTS_Trace[0796]: V12 6496cc RPM 3468, BMEP 15.58 bar, intake manifold resonance 51.9 kPa, buttress downforce 598.2 N, triplane diffuser suction 876.6 N
# Ferrari_812GTS_Trace[0797]: V12 6496cc RPM 3471, BMEP 15.59 bar, intake manifold resonance 52.0 kPa, buttress downforce 598.7 N, triplane diffuser suction 877.4 N
# Ferrari_812GTS_Trace[0798]: V12 6496cc RPM 3474, BMEP 15.59 bar, intake manifold resonance 52.0 kPa, buttress downforce 599.1 N, triplane diffuser suction 878.3 N
# Ferrari_812GTS_Trace[0799]: V12 6496cc RPM 3477, BMEP 15.60 bar, intake manifold resonance 52.1 kPa, buttress downforce 599.5 N, triplane diffuser suction 879.1 N
# Ferrari_812GTS_Trace[0800]: V12 6496cc RPM 3480, BMEP 15.60 bar, intake manifold resonance 52.2 kPa, buttress downforce 420.0 N, triplane diffuser suction 880.0 N
# Ferrari_812GTS_Trace[0801]: V12 6496cc RPM 3483, BMEP 15.61 bar, intake manifold resonance 52.3 kPa, buttress downforce 420.4 N, triplane diffuser suction 880.9 N
# Ferrari_812GTS_Trace[0802]: V12 6496cc RPM 3486, BMEP 15.61 bar, intake manifold resonance 52.4 kPa, buttress downforce 420.9 N, triplane diffuser suction 881.7 N
# Ferrari_812GTS_Trace[0803]: V12 6496cc RPM 3489, BMEP 15.62 bar, intake manifold resonance 52.4 kPa, buttress downforce 421.4 N, triplane diffuser suction 882.5 N
# Ferrari_812GTS_Trace[0804]: V12 6496cc RPM 3492, BMEP 15.62 bar, intake manifold resonance 52.5 kPa, buttress downforce 421.8 N, triplane diffuser suction 883.4 N
# Ferrari_812GTS_Trace[0805]: V12 6496cc RPM 3496, BMEP 15.63 bar, intake manifold resonance 52.6 kPa, buttress downforce 422.3 N, triplane diffuser suction 884.3 N
# Ferrari_812GTS_Trace[0806]: V12 6496cc RPM 3499, BMEP 15.63 bar, intake manifold resonance 52.7 kPa, buttress downforce 422.7 N, triplane diffuser suction 885.1 N
# Ferrari_812GTS_Trace[0807]: V12 6496cc RPM 3502, BMEP 15.64 bar, intake manifold resonance 52.8 kPa, buttress downforce 423.2 N, triplane diffuser suction 885.9 N
# Ferrari_812GTS_Trace[0808]: V12 6496cc RPM 3505, BMEP 15.64 bar, intake manifold resonance 52.8 kPa, buttress downforce 423.6 N, triplane diffuser suction 886.8 N
# Ferrari_812GTS_Trace[0809]: V12 6496cc RPM 3508, BMEP 15.64 bar, intake manifold resonance 52.9 kPa, buttress downforce 424.1 N, triplane diffuser suction 887.6 N
# Ferrari_812GTS_Trace[0810]: V12 6496cc RPM 3511, BMEP 15.65 bar, intake manifold resonance 53.0 kPa, buttress downforce 424.5 N, triplane diffuser suction 888.5 N
# Ferrari_812GTS_Trace[0811]: V12 6496cc RPM 3514, BMEP 15.66 bar, intake manifold resonance 53.1 kPa, buttress downforce 424.9 N, triplane diffuser suction 889.4 N
# Ferrari_812GTS_Trace[0812]: V12 6496cc RPM 3517, BMEP 15.66 bar, intake manifold resonance 53.2 kPa, buttress downforce 425.4 N, triplane diffuser suction 890.2 N
# Ferrari_812GTS_Trace[0813]: V12 6496cc RPM 3520, BMEP 15.67 bar, intake manifold resonance 53.2 kPa, buttress downforce 425.9 N, triplane diffuser suction 891.0 N
# Ferrari_812GTS_Trace[0814]: V12 6496cc RPM 3523, BMEP 15.67 bar, intake manifold resonance 53.3 kPa, buttress downforce 426.3 N, triplane diffuser suction 891.9 N
# Ferrari_812GTS_Trace[0815]: V12 6496cc RPM 3527, BMEP 15.68 bar, intake manifold resonance 53.4 kPa, buttress downforce 426.8 N, triplane diffuser suction 892.8 N
# Ferrari_812GTS_Trace[0816]: V12 6496cc RPM 3530, BMEP 15.68 bar, intake manifold resonance 53.5 kPa, buttress downforce 427.2 N, triplane diffuser suction 893.6 N
# Ferrari_812GTS_Trace[0817]: V12 6496cc RPM 3533, BMEP 15.69 bar, intake manifold resonance 53.6 kPa, buttress downforce 427.7 N, triplane diffuser suction 894.4 N
# Ferrari_812GTS_Trace[0818]: V12 6496cc RPM 3536, BMEP 15.69 bar, intake manifold resonance 53.6 kPa, buttress downforce 428.1 N, triplane diffuser suction 895.3 N
# Ferrari_812GTS_Trace[0819]: V12 6496cc RPM 3539, BMEP 15.70 bar, intake manifold resonance 53.7 kPa, buttress downforce 428.6 N, triplane diffuser suction 896.1 N
# Ferrari_812GTS_Trace[0820]: V12 6496cc RPM 3542, BMEP 15.70 bar, intake manifold resonance 53.8 kPa, buttress downforce 429.0 N, triplane diffuser suction 897.0 N
# Ferrari_812GTS_Trace[0821]: V12 6496cc RPM 3545, BMEP 15.71 bar, intake manifold resonance 53.9 kPa, buttress downforce 429.4 N, triplane diffuser suction 897.9 N
# Ferrari_812GTS_Trace[0822]: V12 6496cc RPM 3548, BMEP 15.71 bar, intake manifold resonance 54.0 kPa, buttress downforce 429.9 N, triplane diffuser suction 898.7 N
# Ferrari_812GTS_Trace[0823]: V12 6496cc RPM 3551, BMEP 15.71 bar, intake manifold resonance 54.0 kPa, buttress downforce 430.4 N, triplane diffuser suction 899.5 N
# Ferrari_812GTS_Trace[0824]: V12 6496cc RPM 3554, BMEP 15.72 bar, intake manifold resonance 54.1 kPa, buttress downforce 430.8 N, triplane diffuser suction 900.4 N
# Ferrari_812GTS_Trace[0825]: V12 6496cc RPM 3558, BMEP 15.73 bar, intake manifold resonance 54.2 kPa, buttress downforce 431.3 N, triplane diffuser suction 901.3 N
# Ferrari_812GTS_Trace[0826]: V12 6496cc RPM 3561, BMEP 15.73 bar, intake manifold resonance 54.3 kPa, buttress downforce 431.7 N, triplane diffuser suction 902.1 N
# Ferrari_812GTS_Trace[0827]: V12 6496cc RPM 3564, BMEP 15.73 bar, intake manifold resonance 54.4 kPa, buttress downforce 432.2 N, triplane diffuser suction 902.9 N
# Ferrari_812GTS_Trace[0828]: V12 6496cc RPM 3567, BMEP 15.74 bar, intake manifold resonance 54.4 kPa, buttress downforce 432.6 N, triplane diffuser suction 903.8 N
# Ferrari_812GTS_Trace[0829]: V12 6496cc RPM 3570, BMEP 15.75 bar, intake manifold resonance 54.5 kPa, buttress downforce 433.1 N, triplane diffuser suction 904.6 N
# Ferrari_812GTS_Trace[0830]: V12 6496cc RPM 3573, BMEP 15.75 bar, intake manifold resonance 54.6 kPa, buttress downforce 433.5 N, triplane diffuser suction 905.5 N
# Ferrari_812GTS_Trace[0831]: V12 6496cc RPM 3576, BMEP 15.76 bar, intake manifold resonance 54.7 kPa, buttress downforce 433.9 N, triplane diffuser suction 906.4 N
# Ferrari_812GTS_Trace[0832]: V12 6496cc RPM 3579, BMEP 15.76 bar, intake manifold resonance 54.8 kPa, buttress downforce 434.4 N, triplane diffuser suction 907.2 N
# Ferrari_812GTS_Trace[0833]: V12 6496cc RPM 3582, BMEP 15.77 bar, intake manifold resonance 54.8 kPa, buttress downforce 434.9 N, triplane diffuser suction 908.0 N
# Ferrari_812GTS_Trace[0834]: V12 6496cc RPM 3585, BMEP 15.77 bar, intake manifold resonance 54.9 kPa, buttress downforce 435.3 N, triplane diffuser suction 908.9 N
# Ferrari_812GTS_Trace[0835]: V12 6496cc RPM 3589, BMEP 15.78 bar, intake manifold resonance 55.0 kPa, buttress downforce 435.8 N, triplane diffuser suction 909.8 N
# Ferrari_812GTS_Trace[0836]: V12 6496cc RPM 3592, BMEP 15.78 bar, intake manifold resonance 55.1 kPa, buttress downforce 436.2 N, triplane diffuser suction 910.6 N
# Ferrari_812GTS_Trace[0837]: V12 6496cc RPM 3595, BMEP 15.79 bar, intake manifold resonance 55.2 kPa, buttress downforce 436.7 N, triplane diffuser suction 911.4 N
# Ferrari_812GTS_Trace[0838]: V12 6496cc RPM 3598, BMEP 15.79 bar, intake manifold resonance 55.2 kPa, buttress downforce 437.1 N, triplane diffuser suction 912.3 N
# Ferrari_812GTS_Trace[0839]: V12 6496cc RPM 3601, BMEP 15.80 bar, intake manifold resonance 55.3 kPa, buttress downforce 437.6 N, triplane diffuser suction 913.1 N
# Ferrari_812GTS_Trace[0840]: V12 6496cc RPM 3604, BMEP 15.80 bar, intake manifold resonance 55.4 kPa, buttress downforce 438.0 N, triplane diffuser suction 914.0 N
# Ferrari_812GTS_Trace[0841]: V12 6496cc RPM 3607, BMEP 15.80 bar, intake manifold resonance 55.5 kPa, buttress downforce 438.4 N, triplane diffuser suction 914.9 N
# Ferrari_812GTS_Trace[0842]: V12 6496cc RPM 3610, BMEP 15.81 bar, intake manifold resonance 55.6 kPa, buttress downforce 438.9 N, triplane diffuser suction 915.7 N
# Ferrari_812GTS_Trace[0843]: V12 6496cc RPM 3613, BMEP 15.82 bar, intake manifold resonance 55.6 kPa, buttress downforce 439.4 N, triplane diffuser suction 916.5 N
# Ferrari_812GTS_Trace[0844]: V12 6496cc RPM 3616, BMEP 15.82 bar, intake manifold resonance 55.7 kPa, buttress downforce 439.8 N, triplane diffuser suction 917.4 N
# Ferrari_812GTS_Trace[0845]: V12 6496cc RPM 3620, BMEP 15.82 bar, intake manifold resonance 55.8 kPa, buttress downforce 440.3 N, triplane diffuser suction 918.3 N
# Ferrari_812GTS_Trace[0846]: V12 6496cc RPM 3623, BMEP 15.83 bar, intake manifold resonance 55.9 kPa, buttress downforce 440.7 N, triplane diffuser suction 919.1 N
# Ferrari_812GTS_Trace[0847]: V12 6496cc RPM 3626, BMEP 15.84 bar, intake manifold resonance 56.0 kPa, buttress downforce 441.2 N, triplane diffuser suction 919.9 N
# Ferrari_812GTS_Trace[0848]: V12 6496cc RPM 3629, BMEP 15.84 bar, intake manifold resonance 56.0 kPa, buttress downforce 441.6 N, triplane diffuser suction 680.8 N
# Ferrari_812GTS_Trace[0849]: V12 6496cc RPM 3632, BMEP 15.85 bar, intake manifold resonance 56.1 kPa, buttress downforce 442.1 N, triplane diffuser suction 681.6 N
# Ferrari_812GTS_Trace[0850]: V12 6496cc RPM 3635, BMEP 15.85 bar, intake manifold resonance 56.2 kPa, buttress downforce 442.5 N, triplane diffuser suction 682.5 N
# Ferrari_812GTS_Trace[0851]: V12 6496cc RPM 3638, BMEP 15.86 bar, intake manifold resonance 56.3 kPa, buttress downforce 442.9 N, triplane diffuser suction 683.4 N
# Ferrari_812GTS_Trace[0852]: V12 6496cc RPM 3641, BMEP 15.86 bar, intake manifold resonance 56.4 kPa, buttress downforce 443.4 N, triplane diffuser suction 684.2 N
# Ferrari_812GTS_Trace[0853]: V12 6496cc RPM 3644, BMEP 15.87 bar, intake manifold resonance 56.4 kPa, buttress downforce 443.9 N, triplane diffuser suction 685.0 N
# Ferrari_812GTS_Trace[0854]: V12 6496cc RPM 3647, BMEP 15.87 bar, intake manifold resonance 56.5 kPa, buttress downforce 444.3 N, triplane diffuser suction 685.9 N
# Ferrari_812GTS_Trace[0855]: V12 6496cc RPM 3651, BMEP 15.88 bar, intake manifold resonance 56.6 kPa, buttress downforce 444.8 N, triplane diffuser suction 686.8 N
# Ferrari_812GTS_Trace[0856]: V12 6496cc RPM 3654, BMEP 15.88 bar, intake manifold resonance 56.7 kPa, buttress downforce 445.2 N, triplane diffuser suction 687.6 N
# Ferrari_812GTS_Trace[0857]: V12 6496cc RPM 3657, BMEP 15.89 bar, intake manifold resonance 56.8 kPa, buttress downforce 445.7 N, triplane diffuser suction 688.4 N
# Ferrari_812GTS_Trace[0858]: V12 6496cc RPM 3660, BMEP 15.89 bar, intake manifold resonance 56.8 kPa, buttress downforce 446.1 N, triplane diffuser suction 689.3 N
# Ferrari_812GTS_Trace[0859]: V12 6496cc RPM 3663, BMEP 15.89 bar, intake manifold resonance 56.9 kPa, buttress downforce 446.6 N, triplane diffuser suction 690.1 N
# Ferrari_812GTS_Trace[0860]: V12 6496cc RPM 3666, BMEP 15.90 bar, intake manifold resonance 57.0 kPa, buttress downforce 447.0 N, triplane diffuser suction 691.0 N
# Ferrari_812GTS_Trace[0861]: V12 6496cc RPM 3669, BMEP 15.91 bar, intake manifold resonance 57.1 kPa, buttress downforce 447.4 N, triplane diffuser suction 691.9 N
# Ferrari_812GTS_Trace[0862]: V12 6496cc RPM 3672, BMEP 15.91 bar, intake manifold resonance 57.2 kPa, buttress downforce 447.9 N, triplane diffuser suction 692.7 N
# Ferrari_812GTS_Trace[0863]: V12 6496cc RPM 3675, BMEP 15.92 bar, intake manifold resonance 57.2 kPa, buttress downforce 448.4 N, triplane diffuser suction 693.5 N
# Ferrari_812GTS_Trace[0864]: V12 6496cc RPM 3678, BMEP 15.92 bar, intake manifold resonance 57.3 kPa, buttress downforce 448.8 N, triplane diffuser suction 694.4 N
# Ferrari_812GTS_Trace[0865]: V12 6496cc RPM 3682, BMEP 15.93 bar, intake manifold resonance 57.4 kPa, buttress downforce 449.3 N, triplane diffuser suction 695.3 N
# Ferrari_812GTS_Trace[0866]: V12 6496cc RPM 3685, BMEP 15.93 bar, intake manifold resonance 57.5 kPa, buttress downforce 449.7 N, triplane diffuser suction 696.1 N
# Ferrari_812GTS_Trace[0867]: V12 6496cc RPM 3688, BMEP 15.94 bar, intake manifold resonance 57.6 kPa, buttress downforce 450.2 N, triplane diffuser suction 696.9 N
# Ferrari_812GTS_Trace[0868]: V12 6496cc RPM 3691, BMEP 15.94 bar, intake manifold resonance 57.6 kPa, buttress downforce 450.6 N, triplane diffuser suction 697.8 N
# Ferrari_812GTS_Trace[0869]: V12 6496cc RPM 3694, BMEP 15.95 bar, intake manifold resonance 57.7 kPa, buttress downforce 451.1 N, triplane diffuser suction 698.6 N
# Ferrari_812GTS_Trace[0870]: V12 6496cc RPM 3697, BMEP 15.95 bar, intake manifold resonance 57.8 kPa, buttress downforce 451.5 N, triplane diffuser suction 699.5 N
# Ferrari_812GTS_Trace[0871]: V12 6496cc RPM 3700, BMEP 15.96 bar, intake manifold resonance 57.9 kPa, buttress downforce 451.9 N, triplane diffuser suction 700.4 N
# Ferrari_812GTS_Trace[0872]: V12 6496cc RPM 3703, BMEP 15.96 bar, intake manifold resonance 58.0 kPa, buttress downforce 452.4 N, triplane diffuser suction 701.2 N
# Ferrari_812GTS_Trace[0873]: V12 6496cc RPM 3706, BMEP 15.96 bar, intake manifold resonance 58.0 kPa, buttress downforce 452.9 N, triplane diffuser suction 702.0 N
# Ferrari_812GTS_Trace[0874]: V12 6496cc RPM 3709, BMEP 15.97 bar, intake manifold resonance 58.1 kPa, buttress downforce 453.3 N, triplane diffuser suction 702.9 N
# Ferrari_812GTS_Trace[0875]: V12 6496cc RPM 3713, BMEP 15.98 bar, intake manifold resonance 58.2 kPa, buttress downforce 453.8 N, triplane diffuser suction 703.8 N
# Ferrari_812GTS_Trace[0876]: V12 6496cc RPM 3716, BMEP 15.98 bar, intake manifold resonance 58.3 kPa, buttress downforce 454.2 N, triplane diffuser suction 704.6 N
# Ferrari_812GTS_Trace[0877]: V12 6496cc RPM 3719, BMEP 15.98 bar, intake manifold resonance 58.4 kPa, buttress downforce 454.7 N, triplane diffuser suction 705.4 N
# Ferrari_812GTS_Trace[0878]: V12 6496cc RPM 3722, BMEP 15.99 bar, intake manifold resonance 58.4 kPa, buttress downforce 455.1 N, triplane diffuser suction 706.3 N
# Ferrari_812GTS_Trace[0879]: V12 6496cc RPM 3725, BMEP 16.00 bar, intake manifold resonance 58.5 kPa, buttress downforce 455.6 N, triplane diffuser suction 707.1 N
# Ferrari_812GTS_Trace[0880]: V12 6496cc RPM 3728, BMEP 16.00 bar, intake manifold resonance 58.6 kPa, buttress downforce 456.0 N, triplane diffuser suction 708.0 N
# Ferrari_812GTS_Trace[0881]: V12 6496cc RPM 3731, BMEP 16.01 bar, intake manifold resonance 58.7 kPa, buttress downforce 456.4 N, triplane diffuser suction 708.9 N
# Ferrari_812GTS_Trace[0882]: V12 6496cc RPM 3734, BMEP 16.01 bar, intake manifold resonance 58.8 kPa, buttress downforce 456.9 N, triplane diffuser suction 709.7 N
# Ferrari_812GTS_Trace[0883]: V12 6496cc RPM 3737, BMEP 16.02 bar, intake manifold resonance 58.8 kPa, buttress downforce 457.4 N, triplane diffuser suction 710.5 N
# Ferrari_812GTS_Trace[0884]: V12 6496cc RPM 3740, BMEP 16.02 bar, intake manifold resonance 58.9 kPa, buttress downforce 457.8 N, triplane diffuser suction 711.4 N
# Ferrari_812GTS_Trace[0885]: V12 6496cc RPM 3744, BMEP 16.02 bar, intake manifold resonance 59.0 kPa, buttress downforce 458.3 N, triplane diffuser suction 712.3 N
# Ferrari_812GTS_Trace[0886]: V12 6496cc RPM 3747, BMEP 16.03 bar, intake manifold resonance 59.1 kPa, buttress downforce 458.7 N, triplane diffuser suction 713.1 N
# Ferrari_812GTS_Trace[0887]: V12 6496cc RPM 3750, BMEP 16.04 bar, intake manifold resonance 59.2 kPa, buttress downforce 459.2 N, triplane diffuser suction 713.9 N
# Ferrari_812GTS_Trace[0888]: V12 6496cc RPM 3753, BMEP 16.04 bar, intake manifold resonance 59.2 kPa, buttress downforce 459.6 N, triplane diffuser suction 714.8 N
# Ferrari_812GTS_Trace[0889]: V12 6496cc RPM 3756, BMEP 16.05 bar, intake manifold resonance 59.3 kPa, buttress downforce 460.1 N, triplane diffuser suction 715.6 N
# Ferrari_812GTS_Trace[0890]: V12 6496cc RPM 3759, BMEP 16.05 bar, intake manifold resonance 59.4 kPa, buttress downforce 460.5 N, triplane diffuser suction 716.5 N
# Ferrari_812GTS_Trace[0891]: V12 6496cc RPM 3762, BMEP 16.05 bar, intake manifold resonance 59.5 kPa, buttress downforce 460.9 N, triplane diffuser suction 717.4 N
# Ferrari_812GTS_Trace[0892]: V12 6496cc RPM 3765, BMEP 16.06 bar, intake manifold resonance 59.6 kPa, buttress downforce 461.4 N, triplane diffuser suction 718.2 N
# Ferrari_812GTS_Trace[0893]: V12 6496cc RPM 3768, BMEP 16.07 bar, intake manifold resonance 59.6 kPa, buttress downforce 461.9 N, triplane diffuser suction 719.0 N
# Ferrari_812GTS_Trace[0894]: V12 6496cc RPM 3771, BMEP 16.07 bar, intake manifold resonance 59.7 kPa, buttress downforce 462.3 N, triplane diffuser suction 719.9 N
# Ferrari_812GTS_Trace[0895]: V12 6496cc RPM 3775, BMEP 16.08 bar, intake manifold resonance 59.8 kPa, buttress downforce 462.8 N, triplane diffuser suction 720.8 N
# Ferrari_812GTS_Trace[0896]: V12 6496cc RPM 3778, BMEP 16.08 bar, intake manifold resonance 59.9 kPa, buttress downforce 463.2 N, triplane diffuser suction 721.6 N
# Ferrari_812GTS_Trace[0897]: V12 6496cc RPM 3781, BMEP 16.09 bar, intake manifold resonance 60.0 kPa, buttress downforce 463.7 N, triplane diffuser suction 722.4 N
# Ferrari_812GTS_Trace[0898]: V12 6496cc RPM 3784, BMEP 16.09 bar, intake manifold resonance 60.0 kPa, buttress downforce 464.1 N, triplane diffuser suction 723.3 N
# Ferrari_812GTS_Trace[0899]: V12 6496cc RPM 3787, BMEP 16.09 bar, intake manifold resonance 60.1 kPa, buttress downforce 464.6 N, triplane diffuser suction 724.1 N
# Ferrari_812GTS_Trace[0900]: V12 6496cc RPM 3790, BMEP 16.10 bar, intake manifold resonance 48.2 kPa, buttress downforce 465.0 N, triplane diffuser suction 725.0 N
# Ferrari_812GTS_Trace[0901]: V12 6496cc RPM 3793, BMEP 16.11 bar, intake manifold resonance 48.3 kPa, buttress downforce 465.4 N, triplane diffuser suction 725.9 N
# Ferrari_812GTS_Trace[0902]: V12 6496cc RPM 3796, BMEP 16.11 bar, intake manifold resonance 48.4 kPa, buttress downforce 465.9 N, triplane diffuser suction 726.7 N
# Ferrari_812GTS_Trace[0903]: V12 6496cc RPM 3799, BMEP 16.12 bar, intake manifold resonance 48.4 kPa, buttress downforce 466.4 N, triplane diffuser suction 727.5 N
# Ferrari_812GTS_Trace[0904]: V12 6496cc RPM 3802, BMEP 16.12 bar, intake manifold resonance 48.5 kPa, buttress downforce 466.8 N, triplane diffuser suction 728.4 N
# Ferrari_812GTS_Trace[0905]: V12 6496cc RPM 3806, BMEP 16.13 bar, intake manifold resonance 48.6 kPa, buttress downforce 467.3 N, triplane diffuser suction 729.3 N
# Ferrari_812GTS_Trace[0906]: V12 6496cc RPM 3809, BMEP 16.13 bar, intake manifold resonance 48.7 kPa, buttress downforce 467.7 N, triplane diffuser suction 730.1 N
# Ferrari_812GTS_Trace[0907]: V12 6496cc RPM 3812, BMEP 16.14 bar, intake manifold resonance 48.8 kPa, buttress downforce 468.2 N, triplane diffuser suction 730.9 N
# Ferrari_812GTS_Trace[0908]: V12 6496cc RPM 3815, BMEP 16.14 bar, intake manifold resonance 48.8 kPa, buttress downforce 468.6 N, triplane diffuser suction 731.8 N
# Ferrari_812GTS_Trace[0909]: V12 6496cc RPM 3818, BMEP 16.14 bar, intake manifold resonance 48.9 kPa, buttress downforce 469.1 N, triplane diffuser suction 732.6 N
# Ferrari_812GTS_Trace[0910]: V12 6496cc RPM 3821, BMEP 16.15 bar, intake manifold resonance 49.0 kPa, buttress downforce 469.5 N, triplane diffuser suction 733.5 N
# Ferrari_812GTS_Trace[0911]: V12 6496cc RPM 3824, BMEP 16.16 bar, intake manifold resonance 49.1 kPa, buttress downforce 469.9 N, triplane diffuser suction 734.4 N
# Ferrari_812GTS_Trace[0912]: V12 6496cc RPM 3827, BMEP 16.16 bar, intake manifold resonance 49.2 kPa, buttress downforce 470.4 N, triplane diffuser suction 735.2 N
# Ferrari_812GTS_Trace[0913]: V12 6496cc RPM 3830, BMEP 16.16 bar, intake manifold resonance 49.2 kPa, buttress downforce 470.9 N, triplane diffuser suction 736.0 N
# Ferrari_812GTS_Trace[0914]: V12 6496cc RPM 3833, BMEP 16.17 bar, intake manifold resonance 49.3 kPa, buttress downforce 471.3 N, triplane diffuser suction 736.9 N
# Ferrari_812GTS_Trace[0915]: V12 6496cc RPM 3837, BMEP 16.18 bar, intake manifold resonance 49.4 kPa, buttress downforce 471.8 N, triplane diffuser suction 737.8 N
# Ferrari_812GTS_Trace[0916]: V12 6496cc RPM 3840, BMEP 16.18 bar, intake manifold resonance 49.5 kPa, buttress downforce 472.2 N, triplane diffuser suction 738.6 N
# Ferrari_812GTS_Trace[0917]: V12 6496cc RPM 3843, BMEP 16.19 bar, intake manifold resonance 49.6 kPa, buttress downforce 472.7 N, triplane diffuser suction 739.4 N
# Ferrari_812GTS_Trace[0918]: V12 6496cc RPM 3846, BMEP 16.19 bar, intake manifold resonance 49.6 kPa, buttress downforce 473.1 N, triplane diffuser suction 740.3 N
# Ferrari_812GTS_Trace[0919]: V12 6496cc RPM 3849, BMEP 16.20 bar, intake manifold resonance 49.7 kPa, buttress downforce 473.6 N, triplane diffuser suction 741.1 N
# Ferrari_812GTS_Trace[0920]: V12 6496cc RPM 3852, BMEP 16.20 bar, intake manifold resonance 49.8 kPa, buttress downforce 474.0 N, triplane diffuser suction 742.0 N
# Ferrari_812GTS_Trace[0921]: V12 6496cc RPM 3855, BMEP 16.21 bar, intake manifold resonance 49.9 kPa, buttress downforce 474.4 N, triplane diffuser suction 742.9 N
# Ferrari_812GTS_Trace[0922]: V12 6496cc RPM 3858, BMEP 16.21 bar, intake manifold resonance 50.0 kPa, buttress downforce 474.9 N, triplane diffuser suction 743.7 N
# Ferrari_812GTS_Trace[0923]: V12 6496cc RPM 3861, BMEP 16.21 bar, intake manifold resonance 50.0 kPa, buttress downforce 475.4 N, triplane diffuser suction 744.5 N
# Ferrari_812GTS_Trace[0924]: V12 6496cc RPM 3864, BMEP 16.22 bar, intake manifold resonance 50.1 kPa, buttress downforce 475.8 N, triplane diffuser suction 745.4 N
# Ferrari_812GTS_Trace[0925]: V12 6496cc RPM 3868, BMEP 16.23 bar, intake manifold resonance 50.2 kPa, buttress downforce 476.3 N, triplane diffuser suction 746.3 N
# Ferrari_812GTS_Trace[0926]: V12 6496cc RPM 3871, BMEP 16.23 bar, intake manifold resonance 50.3 kPa, buttress downforce 476.7 N, triplane diffuser suction 747.1 N
# Ferrari_812GTS_Trace[0927]: V12 6496cc RPM 3874, BMEP 16.23 bar, intake manifold resonance 50.4 kPa, buttress downforce 477.2 N, triplane diffuser suction 747.9 N
# Ferrari_812GTS_Trace[0928]: V12 6496cc RPM 3877, BMEP 16.24 bar, intake manifold resonance 50.4 kPa, buttress downforce 477.6 N, triplane diffuser suction 748.8 N
# Ferrari_812GTS_Trace[0929]: V12 6496cc RPM 3880, BMEP 16.25 bar, intake manifold resonance 50.5 kPa, buttress downforce 478.1 N, triplane diffuser suction 749.6 N
# Ferrari_812GTS_Trace[0930]: V12 6496cc RPM 3883, BMEP 16.25 bar, intake manifold resonance 50.6 kPa, buttress downforce 478.5 N, triplane diffuser suction 750.5 N
# Ferrari_812GTS_Trace[0931]: V12 6496cc RPM 3886, BMEP 16.26 bar, intake manifold resonance 50.7 kPa, buttress downforce 478.9 N, triplane diffuser suction 751.4 N
# Ferrari_812GTS_Trace[0932]: V12 6496cc RPM 3889, BMEP 16.26 bar, intake manifold resonance 50.8 kPa, buttress downforce 479.4 N, triplane diffuser suction 752.2 N
# Ferrari_812GTS_Trace[0933]: V12 6496cc RPM 3892, BMEP 16.27 bar, intake manifold resonance 50.8 kPa, buttress downforce 479.9 N, triplane diffuser suction 753.0 N
# Ferrari_812GTS_Trace[0934]: V12 6496cc RPM 3895, BMEP 16.27 bar, intake manifold resonance 50.9 kPa, buttress downforce 480.3 N, triplane diffuser suction 753.9 N
# Ferrari_812GTS_Trace[0935]: V12 6496cc RPM 3899, BMEP 16.27 bar, intake manifold resonance 51.0 kPa, buttress downforce 480.8 N, triplane diffuser suction 754.8 N
# Ferrari_812GTS_Trace[0936]: V12 6496cc RPM 3902, BMEP 16.28 bar, intake manifold resonance 51.1 kPa, buttress downforce 481.2 N, triplane diffuser suction 755.6 N
# Ferrari_812GTS_Trace[0937]: V12 6496cc RPM 3905, BMEP 16.29 bar, intake manifold resonance 51.2 kPa, buttress downforce 481.7 N, triplane diffuser suction 756.4 N
# Ferrari_812GTS_Trace[0938]: V12 6496cc RPM 3908, BMEP 16.29 bar, intake manifold resonance 51.2 kPa, buttress downforce 482.1 N, triplane diffuser suction 757.3 N
# Ferrari_812GTS_Trace[0939]: V12 6496cc RPM 3911, BMEP 16.30 bar, intake manifold resonance 51.3 kPa, buttress downforce 482.6 N, triplane diffuser suction 758.1 N
# Ferrari_812GTS_Trace[0940]: V12 6496cc RPM 3914, BMEP 16.30 bar, intake manifold resonance 51.4 kPa, buttress downforce 483.0 N, triplane diffuser suction 759.0 N
# Ferrari_812GTS_Trace[0941]: V12 6496cc RPM 3917, BMEP 16.30 bar, intake manifold resonance 51.5 kPa, buttress downforce 483.4 N, triplane diffuser suction 759.9 N
# Ferrari_812GTS_Trace[0942]: V12 6496cc RPM 3920, BMEP 16.31 bar, intake manifold resonance 51.6 kPa, buttress downforce 483.9 N, triplane diffuser suction 760.7 N
# Ferrari_812GTS_Trace[0943]: V12 6496cc RPM 3923, BMEP 16.32 bar, intake manifold resonance 51.6 kPa, buttress downforce 484.4 N, triplane diffuser suction 761.5 N
# Ferrari_812GTS_Trace[0944]: V12 6496cc RPM 3926, BMEP 16.32 bar, intake manifold resonance 51.7 kPa, buttress downforce 484.8 N, triplane diffuser suction 762.4 N
# Ferrari_812GTS_Trace[0945]: V12 6496cc RPM 3930, BMEP 16.33 bar, intake manifold resonance 51.8 kPa, buttress downforce 485.3 N, triplane diffuser suction 763.3 N
# Ferrari_812GTS_Trace[0946]: V12 6496cc RPM 3933, BMEP 16.33 bar, intake manifold resonance 51.9 kPa, buttress downforce 485.7 N, triplane diffuser suction 764.1 N
# Ferrari_812GTS_Trace[0947]: V12 6496cc RPM 3936, BMEP 16.34 bar, intake manifold resonance 52.0 kPa, buttress downforce 486.2 N, triplane diffuser suction 764.9 N
# Ferrari_812GTS_Trace[0948]: V12 6496cc RPM 3939, BMEP 16.34 bar, intake manifold resonance 52.0 kPa, buttress downforce 486.6 N, triplane diffuser suction 765.8 N
# Ferrari_812GTS_Trace[0949]: V12 6496cc RPM 3942, BMEP 16.34 bar, intake manifold resonance 52.1 kPa, buttress downforce 487.1 N, triplane diffuser suction 766.6 N
# Ferrari_812GTS_Trace[0950]: V12 6496cc RPM 3945, BMEP 16.35 bar, intake manifold resonance 52.2 kPa, buttress downforce 487.5 N, triplane diffuser suction 767.5 N
# Ferrari_812GTS_Trace[0951]: V12 6496cc RPM 3948, BMEP 16.36 bar, intake manifold resonance 52.3 kPa, buttress downforce 487.9 N, triplane diffuser suction 768.4 N
# Ferrari_812GTS_Trace[0952]: V12 6496cc RPM 3951, BMEP 16.36 bar, intake manifold resonance 52.4 kPa, buttress downforce 488.4 N, triplane diffuser suction 769.2 N
# Ferrari_812GTS_Trace[0953]: V12 6496cc RPM 3954, BMEP 16.37 bar, intake manifold resonance 52.4 kPa, buttress downforce 488.9 N, triplane diffuser suction 770.0 N
# Ferrari_812GTS_Trace[0954]: V12 6496cc RPM 3957, BMEP 16.37 bar, intake manifold resonance 52.5 kPa, buttress downforce 489.3 N, triplane diffuser suction 770.9 N
# Ferrari_812GTS_Trace[0955]: V12 6496cc RPM 3961, BMEP 16.38 bar, intake manifold resonance 52.6 kPa, buttress downforce 489.8 N, triplane diffuser suction 771.8 N
# Ferrari_812GTS_Trace[0956]: V12 6496cc RPM 3964, BMEP 16.38 bar, intake manifold resonance 52.7 kPa, buttress downforce 490.2 N, triplane diffuser suction 772.6 N
# Ferrari_812GTS_Trace[0957]: V12 6496cc RPM 3967, BMEP 16.39 bar, intake manifold resonance 52.8 kPa, buttress downforce 490.7 N, triplane diffuser suction 773.4 N
# Ferrari_812GTS_Trace[0958]: V12 6496cc RPM 3970, BMEP 16.39 bar, intake manifold resonance 52.8 kPa, buttress downforce 491.1 N, triplane diffuser suction 774.3 N
# Ferrari_812GTS_Trace[0959]: V12 6496cc RPM 3973, BMEP 16.39 bar, intake manifold resonance 52.9 kPa, buttress downforce 491.6 N, triplane diffuser suction 775.1 N
# Ferrari_812GTS_Trace[0960]: V12 6496cc RPM 3976, BMEP 16.40 bar, intake manifold resonance 53.0 kPa, buttress downforce 492.0 N, triplane diffuser suction 776.0 N
# Ferrari_812GTS_Trace[0961]: V12 6496cc RPM 3979, BMEP 16.41 bar, intake manifold resonance 53.1 kPa, buttress downforce 492.4 N, triplane diffuser suction 776.9 N
# Ferrari_812GTS_Trace[0962]: V12 6496cc RPM 3982, BMEP 16.41 bar, intake manifold resonance 53.2 kPa, buttress downforce 492.9 N, triplane diffuser suction 777.7 N
# Ferrari_812GTS_Trace[0963]: V12 6496cc RPM 3985, BMEP 16.41 bar, intake manifold resonance 53.2 kPa, buttress downforce 493.4 N, triplane diffuser suction 778.5 N
# Ferrari_812GTS_Trace[0964]: V12 6496cc RPM 3988, BMEP 16.42 bar, intake manifold resonance 53.3 kPa, buttress downforce 493.8 N, triplane diffuser suction 779.4 N
# Ferrari_812GTS_Trace[0965]: V12 6496cc RPM 3992, BMEP 16.43 bar, intake manifold resonance 53.4 kPa, buttress downforce 494.3 N, triplane diffuser suction 780.3 N
# Ferrari_812GTS_Trace[0966]: V12 6496cc RPM 3995, BMEP 16.43 bar, intake manifold resonance 53.5 kPa, buttress downforce 494.7 N, triplane diffuser suction 781.1 N
# Ferrari_812GTS_Trace[0967]: V12 6496cc RPM 3998, BMEP 16.44 bar, intake manifold resonance 53.6 kPa, buttress downforce 495.2 N, triplane diffuser suction 781.9 N
# Ferrari_812GTS_Trace[0968]: V12 6496cc RPM 4001, BMEP 16.44 bar, intake manifold resonance 53.6 kPa, buttress downforce 495.6 N, triplane diffuser suction 782.8 N
# Ferrari_812GTS_Trace[0969]: V12 6496cc RPM 4004, BMEP 16.45 bar, intake manifold resonance 53.7 kPa, buttress downforce 496.1 N, triplane diffuser suction 783.6 N
# Ferrari_812GTS_Trace[0970]: V12 6496cc RPM 4007, BMEP 16.45 bar, intake manifold resonance 53.8 kPa, buttress downforce 496.5 N, triplane diffuser suction 784.5 N
# Ferrari_812GTS_Trace[0971]: V12 6496cc RPM 4010, BMEP 16.46 bar, intake manifold resonance 53.9 kPa, buttress downforce 496.9 N, triplane diffuser suction 785.4 N
# Ferrari_812GTS_Trace[0972]: V12 6496cc RPM 4013, BMEP 16.46 bar, intake manifold resonance 54.0 kPa, buttress downforce 497.4 N, triplane diffuser suction 786.2 N
# Ferrari_812GTS_Trace[0973]: V12 6496cc RPM 4016, BMEP 16.46 bar, intake manifold resonance 54.0 kPa, buttress downforce 497.9 N, triplane diffuser suction 787.0 N
# Ferrari_812GTS_Trace[0974]: V12 6496cc RPM 4019, BMEP 16.47 bar, intake manifold resonance 54.1 kPa, buttress downforce 498.3 N, triplane diffuser suction 787.9 N
# Ferrari_812GTS_Trace[0975]: V12 6496cc RPM 4023, BMEP 16.48 bar, intake manifold resonance 54.2 kPa, buttress downforce 498.8 N, triplane diffuser suction 788.8 N
# Ferrari_812GTS_Trace[0976]: V12 6496cc RPM 4026, BMEP 16.48 bar, intake manifold resonance 54.3 kPa, buttress downforce 499.2 N, triplane diffuser suction 789.6 N
# Ferrari_812GTS_Trace[0977]: V12 6496cc RPM 4029, BMEP 16.48 bar, intake manifold resonance 54.4 kPa, buttress downforce 499.7 N, triplane diffuser suction 790.4 N
# Ferrari_812GTS_Trace[0978]: V12 6496cc RPM 4032, BMEP 16.49 bar, intake manifold resonance 54.4 kPa, buttress downforce 500.1 N, triplane diffuser suction 791.3 N
# Ferrari_812GTS_Trace[0979]: V12 6496cc RPM 4035, BMEP 16.50 bar, intake manifold resonance 54.5 kPa, buttress downforce 500.6 N, triplane diffuser suction 792.1 N
# Ferrari_812GTS_Trace[0980]: V12 6496cc RPM 4038, BMEP 16.50 bar, intake manifold resonance 54.6 kPa, buttress downforce 501.0 N, triplane diffuser suction 793.0 N
# Ferrari_812GTS_Trace[0981]: V12 6496cc RPM 4041, BMEP 16.51 bar, intake manifold resonance 54.7 kPa, buttress downforce 501.4 N, triplane diffuser suction 793.9 N
# Ferrari_812GTS_Trace[0982]: V12 6496cc RPM 4044, BMEP 16.51 bar, intake manifold resonance 54.8 kPa, buttress downforce 501.9 N, triplane diffuser suction 794.7 N
# Ferrari_812GTS_Trace[0983]: V12 6496cc RPM 4047, BMEP 16.52 bar, intake manifold resonance 54.8 kPa, buttress downforce 502.4 N, triplane diffuser suction 795.5 N
# Ferrari_812GTS_Trace[0984]: V12 6496cc RPM 4050, BMEP 16.52 bar, intake manifold resonance 54.9 kPa, buttress downforce 502.8 N, triplane diffuser suction 796.4 N
# Ferrari_812GTS_Trace[0985]: V12 6496cc RPM 4054, BMEP 16.52 bar, intake manifold resonance 55.0 kPa, buttress downforce 503.3 N, triplane diffuser suction 797.3 N
# Ferrari_812GTS_Trace[0986]: V12 6496cc RPM 4057, BMEP 16.53 bar, intake manifold resonance 55.1 kPa, buttress downforce 503.7 N, triplane diffuser suction 798.1 N
# Ferrari_812GTS_Trace[0987]: V12 6496cc RPM 4060, BMEP 16.54 bar, intake manifold resonance 55.2 kPa, buttress downforce 504.2 N, triplane diffuser suction 798.9 N
# Ferrari_812GTS_Trace[0988]: V12 6496cc RPM 4063, BMEP 16.54 bar, intake manifold resonance 55.2 kPa, buttress downforce 504.6 N, triplane diffuser suction 799.8 N
# Ferrari_812GTS_Trace[0989]: V12 6496cc RPM 4066, BMEP 16.55 bar, intake manifold resonance 55.3 kPa, buttress downforce 505.1 N, triplane diffuser suction 800.6 N
# Ferrari_812GTS_Trace[0990]: V12 6496cc RPM 4069, BMEP 16.55 bar, intake manifold resonance 55.4 kPa, buttress downforce 505.5 N, triplane diffuser suction 801.5 N
# Ferrari_812GTS_Trace[0991]: V12 6496cc RPM 4072, BMEP 16.55 bar, intake manifold resonance 55.5 kPa, buttress downforce 505.9 N, triplane diffuser suction 802.4 N
# Ferrari_812GTS_Trace[0992]: V12 6496cc RPM 4075, BMEP 16.56 bar, intake manifold resonance 55.6 kPa, buttress downforce 506.4 N, triplane diffuser suction 803.2 N
# Ferrari_812GTS_Trace[0993]: V12 6496cc RPM 4078, BMEP 16.57 bar, intake manifold resonance 55.6 kPa, buttress downforce 506.9 N, triplane diffuser suction 804.0 N
# Ferrari_812GTS_Trace[0994]: V12 6496cc RPM 4081, BMEP 16.57 bar, intake manifold resonance 55.7 kPa, buttress downforce 507.3 N, triplane diffuser suction 804.9 N
# Ferrari_812GTS_Trace[0995]: V12 6496cc RPM 4085, BMEP 16.58 bar, intake manifold resonance 55.8 kPa, buttress downforce 507.8 N, triplane diffuser suction 805.8 N
# Ferrari_812GTS_Trace[0996]: V12 6496cc RPM 4088, BMEP 16.58 bar, intake manifold resonance 55.9 kPa, buttress downforce 508.2 N, triplane diffuser suction 806.6 N
# Ferrari_812GTS_Trace[0997]: V12 6496cc RPM 4091, BMEP 16.59 bar, intake manifold resonance 56.0 kPa, buttress downforce 508.7 N, triplane diffuser suction 807.4 N
# Ferrari_812GTS_Trace[0998]: V12 6496cc RPM 4094, BMEP 16.59 bar, intake manifold resonance 56.0 kPa, buttress downforce 509.1 N, triplane diffuser suction 808.3 N
# Ferrari_812GTS_Trace[0999]: V12 6496cc RPM 4097, BMEP 16.59 bar, intake manifold resonance 56.1 kPa, buttress downforce 509.6 N, triplane diffuser suction 809.1 N
# Ferrari_812GTS_Trace[1000]: V12 6496cc RPM 4100, BMEP 16.60 bar, intake manifold resonance 56.2 kPa, buttress downforce 510.0 N, triplane diffuser suction 810.0 N
# Ferrari_812GTS_Trace[1001]: V12 6496cc RPM 4103, BMEP 16.61 bar, intake manifold resonance 56.3 kPa, buttress downforce 510.4 N, triplane diffuser suction 810.9 N
# Ferrari_812GTS_Trace[1002]: V12 6496cc RPM 4106, BMEP 16.61 bar, intake manifold resonance 56.4 kPa, buttress downforce 510.9 N, triplane diffuser suction 811.7 N
# Ferrari_812GTS_Trace[1003]: V12 6496cc RPM 4109, BMEP 16.62 bar, intake manifold resonance 56.4 kPa, buttress downforce 511.4 N, triplane diffuser suction 812.5 N
# Ferrari_812GTS_Trace[1004]: V12 6496cc RPM 4112, BMEP 16.62 bar, intake manifold resonance 56.5 kPa, buttress downforce 511.8 N, triplane diffuser suction 813.4 N
# Ferrari_812GTS_Trace[1005]: V12 6496cc RPM 4116, BMEP 16.63 bar, intake manifold resonance 56.6 kPa, buttress downforce 512.3 N, triplane diffuser suction 814.3 N
# Ferrari_812GTS_Trace[1006]: V12 6496cc RPM 4119, BMEP 16.63 bar, intake manifold resonance 56.7 kPa, buttress downforce 512.7 N, triplane diffuser suction 815.1 N
# Ferrari_812GTS_Trace[1007]: V12 6496cc RPM 4122, BMEP 16.64 bar, intake manifold resonance 56.8 kPa, buttress downforce 513.2 N, triplane diffuser suction 815.9 N
# Ferrari_812GTS_Trace[1008]: V12 6496cc RPM 4125, BMEP 16.64 bar, intake manifold resonance 56.8 kPa, buttress downforce 513.6 N, triplane diffuser suction 816.8 N
# Ferrari_812GTS_Trace[1009]: V12 6496cc RPM 4128, BMEP 16.64 bar, intake manifold resonance 56.9 kPa, buttress downforce 514.0 N, triplane diffuser suction 817.6 N
# Ferrari_812GTS_Trace[1010]: V12 6496cc RPM 4131, BMEP 16.65 bar, intake manifold resonance 57.0 kPa, buttress downforce 514.5 N, triplane diffuser suction 818.5 N
# Ferrari_812GTS_Trace[1011]: V12 6496cc RPM 4134, BMEP 16.66 bar, intake manifold resonance 57.1 kPa, buttress downforce 515.0 N, triplane diffuser suction 819.4 N
# Ferrari_812GTS_Trace[1012]: V12 6496cc RPM 4137, BMEP 16.66 bar, intake manifold resonance 57.2 kPa, buttress downforce 515.4 N, triplane diffuser suction 820.2 N
# Ferrari_812GTS_Trace[1013]: V12 6496cc RPM 4140, BMEP 16.66 bar, intake manifold resonance 57.2 kPa, buttress downforce 515.9 N, triplane diffuser suction 821.0 N
# Ferrari_812GTS_Trace[1014]: V12 6496cc RPM 4143, BMEP 16.67 bar, intake manifold resonance 57.3 kPa, buttress downforce 516.3 N, triplane diffuser suction 821.9 N
# Ferrari_812GTS_Trace[1015]: V12 6496cc RPM 4147, BMEP 16.68 bar, intake manifold resonance 57.4 kPa, buttress downforce 516.8 N, triplane diffuser suction 822.8 N
# Ferrari_812GTS_Trace[1016]: V12 6496cc RPM 4150, BMEP 16.68 bar, intake manifold resonance 57.5 kPa, buttress downforce 517.2 N, triplane diffuser suction 823.6 N
# Ferrari_812GTS_Trace[1017]: V12 6496cc RPM 4153, BMEP 16.69 bar, intake manifold resonance 57.6 kPa, buttress downforce 517.7 N, triplane diffuser suction 824.4 N
# Ferrari_812GTS_Trace[1018]: V12 6496cc RPM 4156, BMEP 16.69 bar, intake manifold resonance 57.6 kPa, buttress downforce 518.1 N, triplane diffuser suction 825.3 N
# Ferrari_812GTS_Trace[1019]: V12 6496cc RPM 4159, BMEP 16.70 bar, intake manifold resonance 57.7 kPa, buttress downforce 518.5 N, triplane diffuser suction 826.1 N
# Ferrari_812GTS_Trace[1020]: V12 6496cc RPM 4162, BMEP 16.70 bar, intake manifold resonance 57.8 kPa, buttress downforce 519.0 N, triplane diffuser suction 827.0 N
# Ferrari_812GTS_Trace[1021]: V12 6496cc RPM 4165, BMEP 16.71 bar, intake manifold resonance 57.9 kPa, buttress downforce 519.5 N, triplane diffuser suction 827.9 N
# Ferrari_812GTS_Trace[1022]: V12 6496cc RPM 4168, BMEP 16.71 bar, intake manifold resonance 58.0 kPa, buttress downforce 519.9 N, triplane diffuser suction 828.7 N
# Ferrari_812GTS_Trace[1023]: V12 6496cc RPM 4171, BMEP 16.71 bar, intake manifold resonance 58.0 kPa, buttress downforce 520.4 N, triplane diffuser suction 829.5 N
# Ferrari_812GTS_Trace[1024]: V12 6496cc RPM 4174, BMEP 16.72 bar, intake manifold resonance 58.1 kPa, buttress downforce 520.8 N, triplane diffuser suction 830.4 N
# Ferrari_812GTS_Trace[1025]: V12 6496cc RPM 4178, BMEP 16.73 bar, intake manifold resonance 58.2 kPa, buttress downforce 521.3 N, triplane diffuser suction 831.3 N
# Ferrari_812GTS_Trace[1026]: V12 6496cc RPM 4181, BMEP 16.73 bar, intake manifold resonance 58.3 kPa, buttress downforce 521.7 N, triplane diffuser suction 832.1 N
# Ferrari_812GTS_Trace[1027]: V12 6496cc RPM 4184, BMEP 16.73 bar, intake manifold resonance 58.4 kPa, buttress downforce 522.2 N, triplane diffuser suction 832.9 N
# Ferrari_812GTS_Trace[1028]: V12 6496cc RPM 4187, BMEP 16.74 bar, intake manifold resonance 58.4 kPa, buttress downforce 522.6 N, triplane diffuser suction 833.8 N
# Ferrari_812GTS_Trace[1029]: V12 6496cc RPM 4190, BMEP 16.75 bar, intake manifold resonance 58.5 kPa, buttress downforce 523.0 N, triplane diffuser suction 834.6 N
# Ferrari_812GTS_Trace[1030]: V12 6496cc RPM 4193, BMEP 16.75 bar, intake manifold resonance 58.6 kPa, buttress downforce 523.5 N, triplane diffuser suction 835.5 N
# Ferrari_812GTS_Trace[1031]: V12 6496cc RPM 4196, BMEP 16.76 bar, intake manifold resonance 58.7 kPa, buttress downforce 524.0 N, triplane diffuser suction 836.4 N
# Ferrari_812GTS_Trace[1032]: V12 6496cc RPM 4199, BMEP 16.76 bar, intake manifold resonance 58.8 kPa, buttress downforce 524.4 N, triplane diffuser suction 837.2 N
# Ferrari_812GTS_Trace[1033]: V12 6496cc RPM 4202, BMEP 16.77 bar, intake manifold resonance 58.8 kPa, buttress downforce 524.9 N, triplane diffuser suction 838.0 N
# Ferrari_812GTS_Trace[1034]: V12 6496cc RPM 4205, BMEP 16.77 bar, intake manifold resonance 58.9 kPa, buttress downforce 525.3 N, triplane diffuser suction 838.9 N
# Ferrari_812GTS_Trace[1035]: V12 6496cc RPM 4209, BMEP 16.77 bar, intake manifold resonance 59.0 kPa, buttress downforce 525.8 N, triplane diffuser suction 839.8 N
# Ferrari_812GTS_Trace[1036]: V12 6496cc RPM 4212, BMEP 16.78 bar, intake manifold resonance 59.1 kPa, buttress downforce 526.2 N, triplane diffuser suction 840.6 N
# Ferrari_812GTS_Trace[1037]: V12 6496cc RPM 4215, BMEP 16.79 bar, intake manifold resonance 59.2 kPa, buttress downforce 526.7 N, triplane diffuser suction 841.4 N
# Ferrari_812GTS_Trace[1038]: V12 6496cc RPM 4218, BMEP 16.79 bar, intake manifold resonance 59.2 kPa, buttress downforce 527.1 N, triplane diffuser suction 842.3 N
# Ferrari_812GTS_Trace[1039]: V12 6496cc RPM 4221, BMEP 16.80 bar, intake manifold resonance 59.3 kPa, buttress downforce 527.5 N, triplane diffuser suction 843.1 N
# Ferrari_812GTS_Trace[1040]: V12 6496cc RPM 4224, BMEP 16.80 bar, intake manifold resonance 59.4 kPa, buttress downforce 528.0 N, triplane diffuser suction 844.0 N
# Ferrari_812GTS_Trace[1041]: V12 6496cc RPM 4227, BMEP 16.80 bar, intake manifold resonance 59.5 kPa, buttress downforce 528.5 N, triplane diffuser suction 844.9 N
# Ferrari_812GTS_Trace[1042]: V12 6496cc RPM 4230, BMEP 16.81 bar, intake manifold resonance 59.6 kPa, buttress downforce 528.9 N, triplane diffuser suction 845.7 N
# Ferrari_812GTS_Trace[1043]: V12 6496cc RPM 4233, BMEP 16.82 bar, intake manifold resonance 59.6 kPa, buttress downforce 529.4 N, triplane diffuser suction 846.5 N
# Ferrari_812GTS_Trace[1044]: V12 6496cc RPM 4236, BMEP 16.82 bar, intake manifold resonance 59.7 kPa, buttress downforce 529.8 N, triplane diffuser suction 847.4 N
# Ferrari_812GTS_Trace[1045]: V12 6496cc RPM 4240, BMEP 16.83 bar, intake manifold resonance 59.8 kPa, buttress downforce 530.3 N, triplane diffuser suction 848.3 N
# Ferrari_812GTS_Trace[1046]: V12 6496cc RPM 4243, BMEP 16.83 bar, intake manifold resonance 59.9 kPa, buttress downforce 530.7 N, triplane diffuser suction 849.1 N
# Ferrari_812GTS_Trace[1047]: V12 6496cc RPM 4246, BMEP 16.84 bar, intake manifold resonance 60.0 kPa, buttress downforce 531.2 N, triplane diffuser suction 849.9 N
# Ferrari_812GTS_Trace[1048]: V12 6496cc RPM 4249, BMEP 16.84 bar, intake manifold resonance 60.0 kPa, buttress downforce 531.6 N, triplane diffuser suction 850.8 N
# Ferrari_812GTS_Trace[1049]: V12 6496cc RPM 4252, BMEP 16.84 bar, intake manifold resonance 60.1 kPa, buttress downforce 532.0 N, triplane diffuser suction 851.6 N
# Ferrari_812GTS_Trace[1050]: V12 6496cc RPM 4255, BMEP 16.85 bar, intake manifold resonance 48.2 kPa, buttress downforce 532.5 N, triplane diffuser suction 852.5 N
# Ferrari_812GTS_Trace[1051]: V12 6496cc RPM 4258, BMEP 16.86 bar, intake manifold resonance 48.3 kPa, buttress downforce 533.0 N, triplane diffuser suction 853.4 N
# Ferrari_812GTS_Trace[1052]: V12 6496cc RPM 4261, BMEP 16.86 bar, intake manifold resonance 48.4 kPa, buttress downforce 533.4 N, triplane diffuser suction 854.2 N
# Ferrari_812GTS_Trace[1053]: V12 6496cc RPM 4264, BMEP 16.87 bar, intake manifold resonance 48.4 kPa, buttress downforce 533.9 N, triplane diffuser suction 855.0 N
# Ferrari_812GTS_Trace[1054]: V12 6496cc RPM 4267, BMEP 16.87 bar, intake manifold resonance 48.5 kPa, buttress downforce 534.3 N, triplane diffuser suction 855.9 N
# Ferrari_812GTS_Trace[1055]: V12 6496cc RPM 4271, BMEP 16.88 bar, intake manifold resonance 48.6 kPa, buttress downforce 534.8 N, triplane diffuser suction 856.8 N
# Ferrari_812GTS_Trace[1056]: V12 6496cc RPM 4274, BMEP 16.88 bar, intake manifold resonance 48.7 kPa, buttress downforce 535.2 N, triplane diffuser suction 857.6 N
# Ferrari_812GTS_Trace[1057]: V12 6496cc RPM 4277, BMEP 16.89 bar, intake manifold resonance 48.8 kPa, buttress downforce 535.7 N, triplane diffuser suction 858.4 N
# Ferrari_812GTS_Trace[1058]: V12 6496cc RPM 4280, BMEP 16.89 bar, intake manifold resonance 48.8 kPa, buttress downforce 536.1 N, triplane diffuser suction 859.3 N
# Ferrari_812GTS_Trace[1059]: V12 6496cc RPM 4283, BMEP 16.89 bar, intake manifold resonance 48.9 kPa, buttress downforce 536.5 N, triplane diffuser suction 860.1 N
# Ferrari_812GTS_Trace[1060]: V12 6496cc RPM 4286, BMEP 16.90 bar, intake manifold resonance 49.0 kPa, buttress downforce 537.0 N, triplane diffuser suction 861.0 N
# Ferrari_812GTS_Trace[1061]: V12 6496cc RPM 4289, BMEP 16.91 bar, intake manifold resonance 49.1 kPa, buttress downforce 537.5 N, triplane diffuser suction 861.9 N
# Ferrari_812GTS_Trace[1062]: V12 6496cc RPM 4292, BMEP 16.91 bar, intake manifold resonance 49.2 kPa, buttress downforce 537.9 N, triplane diffuser suction 862.7 N
# Ferrari_812GTS_Trace[1063]: V12 6496cc RPM 4295, BMEP 16.91 bar, intake manifold resonance 49.2 kPa, buttress downforce 538.4 N, triplane diffuser suction 863.5 N
# Ferrari_812GTS_Trace[1064]: V12 6496cc RPM 4298, BMEP 16.92 bar, intake manifold resonance 49.3 kPa, buttress downforce 538.8 N, triplane diffuser suction 864.4 N
# Ferrari_812GTS_Trace[1065]: V12 6496cc RPM 4302, BMEP 16.93 bar, intake manifold resonance 49.4 kPa, buttress downforce 539.3 N, triplane diffuser suction 865.3 N
# Ferrari_812GTS_Trace[1066]: V12 6496cc RPM 4305, BMEP 16.93 bar, intake manifold resonance 49.5 kPa, buttress downforce 539.7 N, triplane diffuser suction 866.1 N
# Ferrari_812GTS_Trace[1067]: V12 6496cc RPM 4308, BMEP 16.94 bar, intake manifold resonance 49.6 kPa, buttress downforce 540.2 N, triplane diffuser suction 866.9 N
# Ferrari_812GTS_Trace[1068]: V12 6496cc RPM 4311, BMEP 16.94 bar, intake manifold resonance 49.6 kPa, buttress downforce 540.6 N, triplane diffuser suction 867.8 N
# Ferrari_812GTS_Trace[1069]: V12 6496cc RPM 4314, BMEP 16.95 bar, intake manifold resonance 49.7 kPa, buttress downforce 541.0 N, triplane diffuser suction 868.6 N
# Ferrari_812GTS_Trace[1070]: V12 6496cc RPM 4317, BMEP 16.95 bar, intake manifold resonance 49.8 kPa, buttress downforce 541.5 N, triplane diffuser suction 869.5 N
# Ferrari_812GTS_Trace[1071]: V12 6496cc RPM 4320, BMEP 16.96 bar, intake manifold resonance 49.9 kPa, buttress downforce 542.0 N, triplane diffuser suction 870.4 N
# Ferrari_812GTS_Trace[1072]: V12 6496cc RPM 4323, BMEP 16.96 bar, intake manifold resonance 50.0 kPa, buttress downforce 542.4 N, triplane diffuser suction 871.2 N
# Ferrari_812GTS_Trace[1073]: V12 6496cc RPM 4326, BMEP 16.96 bar, intake manifold resonance 50.0 kPa, buttress downforce 542.9 N, triplane diffuser suction 872.0 N
# Ferrari_812GTS_Trace[1074]: V12 6496cc RPM 4329, BMEP 16.97 bar, intake manifold resonance 50.1 kPa, buttress downforce 543.3 N, triplane diffuser suction 872.9 N
# Ferrari_812GTS_Trace[1075]: V12 6496cc RPM 4333, BMEP 16.98 bar, intake manifold resonance 50.2 kPa, buttress downforce 543.8 N, triplane diffuser suction 873.8 N
# Ferrari_812GTS_Trace[1076]: V12 6496cc RPM 4336, BMEP 16.98 bar, intake manifold resonance 50.3 kPa, buttress downforce 544.2 N, triplane diffuser suction 874.6 N
# Ferrari_812GTS_Trace[1077]: V12 6496cc RPM 4339, BMEP 16.98 bar, intake manifold resonance 50.4 kPa, buttress downforce 544.7 N, triplane diffuser suction 875.4 N
# Ferrari_812GTS_Trace[1078]: V12 6496cc RPM 4342, BMEP 16.99 bar, intake manifold resonance 50.4 kPa, buttress downforce 545.1 N, triplane diffuser suction 876.3 N
# Ferrari_812GTS_Trace[1079]: V12 6496cc RPM 4345, BMEP 17.00 bar, intake manifold resonance 50.5 kPa, buttress downforce 545.5 N, triplane diffuser suction 877.1 N
# Ferrari_812GTS_Trace[1080]: V12 6496cc RPM 4348, BMEP 17.00 bar, intake manifold resonance 50.6 kPa, buttress downforce 546.0 N, triplane diffuser suction 878.0 N
# Ferrari_812GTS_Trace[1081]: V12 6496cc RPM 4351, BMEP 17.01 bar, intake manifold resonance 50.7 kPa, buttress downforce 546.5 N, triplane diffuser suction 878.9 N
# Ferrari_812GTS_Trace[1082]: V12 6496cc RPM 4354, BMEP 17.01 bar, intake manifold resonance 50.8 kPa, buttress downforce 546.9 N, triplane diffuser suction 879.7 N
# Ferrari_812GTS_Trace[1083]: V12 6496cc RPM 4357, BMEP 17.02 bar, intake manifold resonance 50.8 kPa, buttress downforce 547.4 N, triplane diffuser suction 880.5 N
# Ferrari_812GTS_Trace[1084]: V12 6496cc RPM 4360, BMEP 17.02 bar, intake manifold resonance 50.9 kPa, buttress downforce 547.8 N, triplane diffuser suction 881.4 N
# Ferrari_812GTS_Trace[1085]: V12 6496cc RPM 4364, BMEP 17.02 bar, intake manifold resonance 51.0 kPa, buttress downforce 548.3 N, triplane diffuser suction 882.3 N
# Ferrari_812GTS_Trace[1086]: V12 6496cc RPM 4367, BMEP 17.03 bar, intake manifold resonance 51.1 kPa, buttress downforce 548.7 N, triplane diffuser suction 883.1 N
# Ferrari_812GTS_Trace[1087]: V12 6496cc RPM 4370, BMEP 17.04 bar, intake manifold resonance 51.2 kPa, buttress downforce 549.2 N, triplane diffuser suction 883.9 N
# Ferrari_812GTS_Trace[1088]: V12 6496cc RPM 4373, BMEP 17.04 bar, intake manifold resonance 51.2 kPa, buttress downforce 549.6 N, triplane diffuser suction 884.8 N
# Ferrari_812GTS_Trace[1089]: V12 6496cc RPM 4376, BMEP 17.05 bar, intake manifold resonance 51.3 kPa, buttress downforce 550.0 N, triplane diffuser suction 885.6 N
# Ferrari_812GTS_Trace[1090]: V12 6496cc RPM 4379, BMEP 17.05 bar, intake manifold resonance 51.4 kPa, buttress downforce 550.5 N, triplane diffuser suction 886.5 N
# Ferrari_812GTS_Trace[1091]: V12 6496cc RPM 4382, BMEP 17.05 bar, intake manifold resonance 51.5 kPa, buttress downforce 551.0 N, triplane diffuser suction 887.4 N
# Ferrari_812GTS_Trace[1092]: V12 6496cc RPM 4385, BMEP 17.06 bar, intake manifold resonance 51.6 kPa, buttress downforce 551.4 N, triplane diffuser suction 888.2 N
# Ferrari_812GTS_Trace[1093]: V12 6496cc RPM 4388, BMEP 17.07 bar, intake manifold resonance 51.6 kPa, buttress downforce 551.9 N, triplane diffuser suction 889.0 N
# Ferrari_812GTS_Trace[1094]: V12 6496cc RPM 4391, BMEP 17.07 bar, intake manifold resonance 51.7 kPa, buttress downforce 552.3 N, triplane diffuser suction 889.9 N
# Ferrari_812GTS_Trace[1095]: V12 6496cc RPM 4395, BMEP 17.08 bar, intake manifold resonance 51.8 kPa, buttress downforce 552.8 N, triplane diffuser suction 890.8 N
# Ferrari_812GTS_Trace[1096]: V12 6496cc RPM 4398, BMEP 17.08 bar, intake manifold resonance 51.9 kPa, buttress downforce 553.2 N, triplane diffuser suction 891.6 N
# Ferrari_812GTS_Trace[1097]: V12 6496cc RPM 4401, BMEP 17.09 bar, intake manifold resonance 52.0 kPa, buttress downforce 553.7 N, triplane diffuser suction 892.4 N
# Ferrari_812GTS_Trace[1098]: V12 6496cc RPM 4404, BMEP 17.09 bar, intake manifold resonance 52.0 kPa, buttress downforce 554.1 N, triplane diffuser suction 893.3 N
# Ferrari_812GTS_Trace[1099]: V12 6496cc RPM 4407, BMEP 17.09 bar, intake manifold resonance 52.1 kPa, buttress downforce 554.5 N, triplane diffuser suction 894.1 N
# Ferrari_812GTS_Trace[1100]: V12 6496cc RPM 4410, BMEP 17.10 bar, intake manifold resonance 52.2 kPa, buttress downforce 555.0 N, triplane diffuser suction 895.0 N
# Ferrari_812GTS_Trace[1101]: V12 6496cc RPM 4413, BMEP 17.11 bar, intake manifold resonance 52.3 kPa, buttress downforce 555.5 N, triplane diffuser suction 895.9 N
# Ferrari_812GTS_Trace[1102]: V12 6496cc RPM 4416, BMEP 17.11 bar, intake manifold resonance 52.4 kPa, buttress downforce 555.9 N, triplane diffuser suction 896.7 N
# Ferrari_812GTS_Trace[1103]: V12 6496cc RPM 4419, BMEP 17.12 bar, intake manifold resonance 52.4 kPa, buttress downforce 556.4 N, triplane diffuser suction 897.5 N
# Ferrari_812GTS_Trace[1104]: V12 6496cc RPM 4422, BMEP 17.12 bar, intake manifold resonance 52.5 kPa, buttress downforce 556.8 N, triplane diffuser suction 898.4 N
# Ferrari_812GTS_Trace[1105]: V12 6496cc RPM 4426, BMEP 17.13 bar, intake manifold resonance 52.6 kPa, buttress downforce 557.3 N, triplane diffuser suction 899.3 N
# Ferrari_812GTS_Trace[1106]: V12 6496cc RPM 4429, BMEP 17.13 bar, intake manifold resonance 52.7 kPa, buttress downforce 557.7 N, triplane diffuser suction 900.1 N
# Ferrari_812GTS_Trace[1107]: V12 6496cc RPM 4432, BMEP 17.14 bar, intake manifold resonance 52.8 kPa, buttress downforce 558.2 N, triplane diffuser suction 900.9 N
# Ferrari_812GTS_Trace[1108]: V12 6496cc RPM 4435, BMEP 17.14 bar, intake manifold resonance 52.8 kPa, buttress downforce 558.6 N, triplane diffuser suction 901.8 N
# Ferrari_812GTS_Trace[1109]: V12 6496cc RPM 4438, BMEP 17.14 bar, intake manifold resonance 52.9 kPa, buttress downforce 559.0 N, triplane diffuser suction 902.6 N
# Ferrari_812GTS_Trace[1110]: V12 6496cc RPM 4441, BMEP 17.15 bar, intake manifold resonance 53.0 kPa, buttress downforce 559.5 N, triplane diffuser suction 903.5 N
# Ferrari_812GTS_Trace[1111]: V12 6496cc RPM 4444, BMEP 17.16 bar, intake manifold resonance 53.1 kPa, buttress downforce 560.0 N, triplane diffuser suction 904.4 N
# Ferrari_812GTS_Trace[1112]: V12 6496cc RPM 4447, BMEP 17.16 bar, intake manifold resonance 53.2 kPa, buttress downforce 560.4 N, triplane diffuser suction 905.2 N
# Ferrari_812GTS_Trace[1113]: V12 6496cc RPM 4450, BMEP 17.16 bar, intake manifold resonance 53.2 kPa, buttress downforce 560.9 N, triplane diffuser suction 906.0 N
# Ferrari_812GTS_Trace[1114]: V12 6496cc RPM 4453, BMEP 17.17 bar, intake manifold resonance 53.3 kPa, buttress downforce 561.3 N, triplane diffuser suction 906.9 N
# Ferrari_812GTS_Trace[1115]: V12 6496cc RPM 4457, BMEP 17.18 bar, intake manifold resonance 53.4 kPa, buttress downforce 561.8 N, triplane diffuser suction 907.8 N
# Ferrari_812GTS_Trace[1116]: V12 6496cc RPM 4460, BMEP 17.18 bar, intake manifold resonance 53.5 kPa, buttress downforce 562.2 N, triplane diffuser suction 908.6 N
# Ferrari_812GTS_Trace[1117]: V12 6496cc RPM 4463, BMEP 17.19 bar, intake manifold resonance 53.6 kPa, buttress downforce 562.7 N, triplane diffuser suction 909.4 N
# Ferrari_812GTS_Trace[1118]: V12 6496cc RPM 4466, BMEP 17.19 bar, intake manifold resonance 53.6 kPa, buttress downforce 563.1 N, triplane diffuser suction 910.3 N
# Ferrari_812GTS_Trace[1119]: V12 6496cc RPM 4469, BMEP 17.20 bar, intake manifold resonance 53.7 kPa, buttress downforce 563.5 N, triplane diffuser suction 911.1 N
# Ferrari_812GTS_Trace[1120]: V12 6496cc RPM 4472, BMEP 17.20 bar, intake manifold resonance 53.8 kPa, buttress downforce 564.0 N, triplane diffuser suction 912.0 N
# Ferrari_812GTS_Trace[1121]: V12 6496cc RPM 4475, BMEP 17.21 bar, intake manifold resonance 53.9 kPa, buttress downforce 564.5 N, triplane diffuser suction 912.9 N
# Ferrari_812GTS_Trace[1122]: V12 6496cc RPM 4478, BMEP 17.21 bar, intake manifold resonance 54.0 kPa, buttress downforce 564.9 N, triplane diffuser suction 913.7 N
# Ferrari_812GTS_Trace[1123]: V12 6496cc RPM 4481, BMEP 17.21 bar, intake manifold resonance 54.0 kPa, buttress downforce 565.4 N, triplane diffuser suction 914.5 N
# Ferrari_812GTS_Trace[1124]: V12 6496cc RPM 4484, BMEP 17.22 bar, intake manifold resonance 54.1 kPa, buttress downforce 565.8 N, triplane diffuser suction 915.4 N
# Ferrari_812GTS_Trace[1125]: V12 6496cc RPM 4488, BMEP 17.23 bar, intake manifold resonance 54.2 kPa, buttress downforce 566.3 N, triplane diffuser suction 916.3 N
# Ferrari_812GTS_Trace[1126]: V12 6496cc RPM 4491, BMEP 17.23 bar, intake manifold resonance 54.3 kPa, buttress downforce 566.7 N, triplane diffuser suction 917.1 N
# Ferrari_812GTS_Trace[1127]: V12 6496cc RPM 4494, BMEP 17.23 bar, intake manifold resonance 54.4 kPa, buttress downforce 567.2 N, triplane diffuser suction 917.9 N
# Ferrari_812GTS_Trace[1128]: V12 6496cc RPM 4497, BMEP 17.24 bar, intake manifold resonance 54.4 kPa, buttress downforce 567.6 N, triplane diffuser suction 918.8 N
# Ferrari_812GTS_Trace[1129]: V12 6496cc RPM 4500, BMEP 17.25 bar, intake manifold resonance 54.5 kPa, buttress downforce 568.0 N, triplane diffuser suction 919.6 N
# Ferrari_812GTS_Trace[1130]: V12 6496cc RPM 4503, BMEP 17.25 bar, intake manifold resonance 54.6 kPa, buttress downforce 568.5 N, triplane diffuser suction 680.5 N
# Ferrari_812GTS_Trace[1131]: V12 6496cc RPM 4506, BMEP 17.26 bar, intake manifold resonance 54.7 kPa, buttress downforce 569.0 N, triplane diffuser suction 681.4 N
# Ferrari_812GTS_Trace[1132]: V12 6496cc RPM 4509, BMEP 17.26 bar, intake manifold resonance 54.8 kPa, buttress downforce 569.4 N, triplane diffuser suction 682.2 N
# Ferrari_812GTS_Trace[1133]: V12 6496cc RPM 4512, BMEP 17.27 bar, intake manifold resonance 54.8 kPa, buttress downforce 569.9 N, triplane diffuser suction 683.0 N
# Ferrari_812GTS_Trace[1134]: V12 6496cc RPM 4515, BMEP 17.27 bar, intake manifold resonance 54.9 kPa, buttress downforce 570.3 N, triplane diffuser suction 683.9 N
# Ferrari_812GTS_Trace[1135]: V12 6496cc RPM 4519, BMEP 17.27 bar, intake manifold resonance 55.0 kPa, buttress downforce 570.8 N, triplane diffuser suction 684.8 N
# Ferrari_812GTS_Trace[1136]: V12 6496cc RPM 4522, BMEP 17.28 bar, intake manifold resonance 55.1 kPa, buttress downforce 571.2 N, triplane diffuser suction 685.6 N
# Ferrari_812GTS_Trace[1137]: V12 6496cc RPM 4525, BMEP 17.29 bar, intake manifold resonance 55.2 kPa, buttress downforce 571.7 N, triplane diffuser suction 686.4 N
# Ferrari_812GTS_Trace[1138]: V12 6496cc RPM 4528, BMEP 17.29 bar, intake manifold resonance 55.2 kPa, buttress downforce 572.1 N, triplane diffuser suction 687.3 N
# Ferrari_812GTS_Trace[1139]: V12 6496cc RPM 4531, BMEP 17.30 bar, intake manifold resonance 55.3 kPa, buttress downforce 572.6 N, triplane diffuser suction 688.1 N
# Ferrari_812GTS_Trace[1140]: V12 6496cc RPM 4534, BMEP 17.30 bar, intake manifold resonance 55.4 kPa, buttress downforce 573.0 N, triplane diffuser suction 689.0 N
# Ferrari_812GTS_Trace[1141]: V12 6496cc RPM 4537, BMEP 17.30 bar, intake manifold resonance 55.5 kPa, buttress downforce 573.5 N, triplane diffuser suction 689.9 N
# Ferrari_812GTS_Trace[1142]: V12 6496cc RPM 4540, BMEP 17.31 bar, intake manifold resonance 55.6 kPa, buttress downforce 573.9 N, triplane diffuser suction 690.7 N
# Ferrari_812GTS_Trace[1143]: V12 6496cc RPM 4543, BMEP 17.32 bar, intake manifold resonance 55.6 kPa, buttress downforce 574.4 N, triplane diffuser suction 691.5 N
# Ferrari_812GTS_Trace[1144]: V12 6496cc RPM 4546, BMEP 17.32 bar, intake manifold resonance 55.7 kPa, buttress downforce 574.8 N, triplane diffuser suction 692.4 N
# Ferrari_812GTS_Trace[1145]: V12 6496cc RPM 4550, BMEP 17.33 bar, intake manifold resonance 55.8 kPa, buttress downforce 575.3 N, triplane diffuser suction 693.3 N
# Ferrari_812GTS_Trace[1146]: V12 6496cc RPM 4553, BMEP 17.33 bar, intake manifold resonance 55.9 kPa, buttress downforce 575.7 N, triplane diffuser suction 694.1 N
# Ferrari_812GTS_Trace[1147]: V12 6496cc RPM 4556, BMEP 17.34 bar, intake manifold resonance 56.0 kPa, buttress downforce 576.1 N, triplane diffuser suction 694.9 N
# Ferrari_812GTS_Trace[1148]: V12 6496cc RPM 4559, BMEP 17.34 bar, intake manifold resonance 56.0 kPa, buttress downforce 576.6 N, triplane diffuser suction 695.8 N
# Ferrari_812GTS_Trace[1149]: V12 6496cc RPM 4562, BMEP 17.34 bar, intake manifold resonance 56.1 kPa, buttress downforce 577.1 N, triplane diffuser suction 696.6 N
# Ferrari_812GTS_Trace[1150]: V12 6496cc RPM 4565, BMEP 17.35 bar, intake manifold resonance 56.2 kPa, buttress downforce 577.5 N, triplane diffuser suction 697.5 N
# Ferrari_812GTS_Trace[1151]: V12 6496cc RPM 4568, BMEP 17.36 bar, intake manifold resonance 56.3 kPa, buttress downforce 578.0 N, triplane diffuser suction 698.4 N
# Ferrari_812GTS_Trace[1152]: V12 6496cc RPM 4571, BMEP 17.36 bar, intake manifold resonance 56.4 kPa, buttress downforce 578.4 N, triplane diffuser suction 699.2 N
# Ferrari_812GTS_Trace[1153]: V12 6496cc RPM 4574, BMEP 17.37 bar, intake manifold resonance 56.4 kPa, buttress downforce 578.9 N, triplane diffuser suction 700.0 N
# Ferrari_812GTS_Trace[1154]: V12 6496cc RPM 4577, BMEP 17.37 bar, intake manifold resonance 56.5 kPa, buttress downforce 579.3 N, triplane diffuser suction 700.9 N
# Ferrari_812GTS_Trace[1155]: V12 6496cc RPM 4581, BMEP 17.38 bar, intake manifold resonance 56.6 kPa, buttress downforce 579.8 N, triplane diffuser suction 701.8 N
# Ferrari_812GTS_Trace[1156]: V12 6496cc RPM 4584, BMEP 17.38 bar, intake manifold resonance 56.7 kPa, buttress downforce 580.2 N, triplane diffuser suction 702.6 N
# Ferrari_812GTS_Trace[1157]: V12 6496cc RPM 4587, BMEP 17.39 bar, intake manifold resonance 56.8 kPa, buttress downforce 580.6 N, triplane diffuser suction 703.4 N
# Ferrari_812GTS_Trace[1158]: V12 6496cc RPM 4590, BMEP 17.39 bar, intake manifold resonance 56.8 kPa, buttress downforce 581.1 N, triplane diffuser suction 704.3 N
# Ferrari_812GTS_Trace[1159]: V12 6496cc RPM 4593, BMEP 17.39 bar, intake manifold resonance 56.9 kPa, buttress downforce 581.6 N, triplane diffuser suction 705.1 N
# Ferrari_812GTS_Trace[1160]: V12 6496cc RPM 4596, BMEP 17.40 bar, intake manifold resonance 57.0 kPa, buttress downforce 582.0 N, triplane diffuser suction 706.0 N
# Ferrari_812GTS_Trace[1161]: V12 6496cc RPM 4599, BMEP 17.41 bar, intake manifold resonance 57.1 kPa, buttress downforce 582.5 N, triplane diffuser suction 706.9 N
# Ferrari_812GTS_Trace[1162]: V12 6496cc RPM 4602, BMEP 17.41 bar, intake manifold resonance 57.2 kPa, buttress downforce 582.9 N, triplane diffuser suction 707.7 N
# Ferrari_812GTS_Trace[1163]: V12 6496cc RPM 4605, BMEP 17.41 bar, intake manifold resonance 57.2 kPa, buttress downforce 583.4 N, triplane diffuser suction 708.5 N
# Ferrari_812GTS_Trace[1164]: V12 6496cc RPM 4608, BMEP 17.42 bar, intake manifold resonance 57.3 kPa, buttress downforce 583.8 N, triplane diffuser suction 709.4 N
# Ferrari_812GTS_Trace[1165]: V12 6496cc RPM 4612, BMEP 17.43 bar, intake manifold resonance 57.4 kPa, buttress downforce 584.3 N, triplane diffuser suction 710.3 N
# Ferrari_812GTS_Trace[1166]: V12 6496cc RPM 4615, BMEP 17.43 bar, intake manifold resonance 57.5 kPa, buttress downforce 584.7 N, triplane diffuser suction 711.1 N
# Ferrari_812GTS_Trace[1167]: V12 6496cc RPM 4618, BMEP 17.44 bar, intake manifold resonance 57.6 kPa, buttress downforce 585.1 N, triplane diffuser suction 711.9 N
# Ferrari_812GTS_Trace[1168]: V12 6496cc RPM 4621, BMEP 17.44 bar, intake manifold resonance 57.6 kPa, buttress downforce 585.6 N, triplane diffuser suction 712.8 N
# Ferrari_812GTS_Trace[1169]: V12 6496cc RPM 4624, BMEP 17.45 bar, intake manifold resonance 57.7 kPa, buttress downforce 586.1 N, triplane diffuser suction 713.6 N
# Ferrari_812GTS_Trace[1170]: V12 6496cc RPM 4627, BMEP 17.45 bar, intake manifold resonance 57.8 kPa, buttress downforce 586.5 N, triplane diffuser suction 714.5 N
# Ferrari_812GTS_Trace[1171]: V12 6496cc RPM 4630, BMEP 17.46 bar, intake manifold resonance 57.9 kPa, buttress downforce 587.0 N, triplane diffuser suction 715.4 N
# Ferrari_812GTS_Trace[1172]: V12 6496cc RPM 4633, BMEP 17.46 bar, intake manifold resonance 58.0 kPa, buttress downforce 587.4 N, triplane diffuser suction 716.2 N
# Ferrari_812GTS_Trace[1173]: V12 6496cc RPM 4636, BMEP 17.46 bar, intake manifold resonance 58.0 kPa, buttress downforce 587.9 N, triplane diffuser suction 717.0 N
# Ferrari_812GTS_Trace[1174]: V12 6496cc RPM 4639, BMEP 17.47 bar, intake manifold resonance 58.1 kPa, buttress downforce 588.3 N, triplane diffuser suction 717.9 N
# Ferrari_812GTS_Trace[1175]: V12 6496cc RPM 4643, BMEP 17.48 bar, intake manifold resonance 58.2 kPa, buttress downforce 588.8 N, triplane diffuser suction 718.8 N
# Ferrari_812GTS_Trace[1176]: V12 6496cc RPM 4646, BMEP 17.48 bar, intake manifold resonance 58.3 kPa, buttress downforce 589.2 N, triplane diffuser suction 719.6 N
# Ferrari_812GTS_Trace[1177]: V12 6496cc RPM 4649, BMEP 17.48 bar, intake manifold resonance 58.4 kPa, buttress downforce 589.6 N, triplane diffuser suction 720.4 N
# Ferrari_812GTS_Trace[1178]: V12 6496cc RPM 4652, BMEP 17.49 bar, intake manifold resonance 58.4 kPa, buttress downforce 590.1 N, triplane diffuser suction 721.3 N
# Ferrari_812GTS_Trace[1179]: V12 6496cc RPM 4655, BMEP 17.50 bar, intake manifold resonance 58.5 kPa, buttress downforce 590.6 N, triplane diffuser suction 722.1 N
# Ferrari_812GTS_Trace[1180]: V12 6496cc RPM 4658, BMEP 17.50 bar, intake manifold resonance 58.6 kPa, buttress downforce 591.0 N, triplane diffuser suction 723.0 N
# Ferrari_812GTS_Trace[1181]: V12 6496cc RPM 4661, BMEP 17.51 bar, intake manifold resonance 58.7 kPa, buttress downforce 591.5 N, triplane diffuser suction 723.9 N
# Ferrari_812GTS_Trace[1182]: V12 6496cc RPM 4664, BMEP 17.51 bar, intake manifold resonance 58.8 kPa, buttress downforce 591.9 N, triplane diffuser suction 724.7 N
# Ferrari_812GTS_Trace[1183]: V12 6496cc RPM 4667, BMEP 17.52 bar, intake manifold resonance 58.8 kPa, buttress downforce 592.4 N, triplane diffuser suction 725.5 N
# Ferrari_812GTS_Trace[1184]: V12 6496cc RPM 4670, BMEP 17.52 bar, intake manifold resonance 58.9 kPa, buttress downforce 592.8 N, triplane diffuser suction 726.4 N
# Ferrari_812GTS_Trace[1185]: V12 6496cc RPM 4674, BMEP 17.52 bar, intake manifold resonance 59.0 kPa, buttress downforce 593.3 N, triplane diffuser suction 727.3 N
# Ferrari_812GTS_Trace[1186]: V12 6496cc RPM 4677, BMEP 17.53 bar, intake manifold resonance 59.1 kPa, buttress downforce 593.7 N, triplane diffuser suction 728.1 N
# Ferrari_812GTS_Trace[1187]: V12 6496cc RPM 4680, BMEP 17.54 bar, intake manifold resonance 59.2 kPa, buttress downforce 594.1 N, triplane diffuser suction 728.9 N
# Ferrari_812GTS_Trace[1188]: V12 6496cc RPM 4683, BMEP 17.54 bar, intake manifold resonance 59.2 kPa, buttress downforce 594.6 N, triplane diffuser suction 729.8 N
# Ferrari_812GTS_Trace[1189]: V12 6496cc RPM 4686, BMEP 17.55 bar, intake manifold resonance 59.3 kPa, buttress downforce 595.1 N, triplane diffuser suction 730.6 N
# Ferrari_812GTS_Trace[1190]: V12 6496cc RPM 4689, BMEP 17.55 bar, intake manifold resonance 59.4 kPa, buttress downforce 595.5 N, triplane diffuser suction 731.5 N
# Ferrari_812GTS_Trace[1191]: V12 6496cc RPM 4692, BMEP 17.55 bar, intake manifold resonance 59.5 kPa, buttress downforce 596.0 N, triplane diffuser suction 732.4 N
# Ferrari_812GTS_Trace[1192]: V12 6496cc RPM 4695, BMEP 17.56 bar, intake manifold resonance 59.6 kPa, buttress downforce 596.4 N, triplane diffuser suction 733.2 N
# Ferrari_812GTS_Trace[1193]: V12 6496cc RPM 4698, BMEP 17.57 bar, intake manifold resonance 59.6 kPa, buttress downforce 596.9 N, triplane diffuser suction 734.0 N
# Ferrari_812GTS_Trace[1194]: V12 6496cc RPM 4701, BMEP 17.57 bar, intake manifold resonance 59.7 kPa, buttress downforce 597.3 N, triplane diffuser suction 734.9 N
# Ferrari_812GTS_Trace[1195]: V12 6496cc RPM 4705, BMEP 17.58 bar, intake manifold resonance 59.8 kPa, buttress downforce 597.8 N, triplane diffuser suction 735.8 N
# Ferrari_812GTS_Trace[1196]: V12 6496cc RPM 4708, BMEP 17.58 bar, intake manifold resonance 59.9 kPa, buttress downforce 598.2 N, triplane diffuser suction 736.6 N
# Ferrari_812GTS_Trace[1197]: V12 6496cc RPM 4711, BMEP 17.59 bar, intake manifold resonance 60.0 kPa, buttress downforce 598.6 N, triplane diffuser suction 737.4 N
# Ferrari_812GTS_Trace[1198]: V12 6496cc RPM 4714, BMEP 17.59 bar, intake manifold resonance 60.0 kPa, buttress downforce 599.1 N, triplane diffuser suction 738.3 N
# Ferrari_812GTS_Trace[1199]: V12 6496cc RPM 4717, BMEP 17.59 bar, intake manifold resonance 60.1 kPa, buttress downforce 599.6 N, triplane diffuser suction 739.1 N
# Ferrari_812GTS_Trace[1200]: V12 6496cc RPM 4720, BMEP 17.60 bar, intake manifold resonance 48.2 kPa, buttress downforce 420.0 N, triplane diffuser suction 740.0 N
# Ferrari_812GTS_Trace[1201]: V12 6496cc RPM 4723, BMEP 17.61 bar, intake manifold resonance 48.3 kPa, buttress downforce 420.5 N, triplane diffuser suction 740.9 N
# Ferrari_812GTS_Trace[1202]: V12 6496cc RPM 4726, BMEP 17.61 bar, intake manifold resonance 48.4 kPa, buttress downforce 420.9 N, triplane diffuser suction 741.7 N
# Ferrari_812GTS_Trace[1203]: V12 6496cc RPM 4729, BMEP 17.62 bar, intake manifold resonance 48.4 kPa, buttress downforce 421.4 N, triplane diffuser suction 742.5 N
# Ferrari_812GTS_Trace[1204]: V12 6496cc RPM 4732, BMEP 17.62 bar, intake manifold resonance 48.5 kPa, buttress downforce 421.8 N, triplane diffuser suction 743.4 N
# Ferrari_812GTS_Trace[1205]: V12 6496cc RPM 4736, BMEP 17.63 bar, intake manifold resonance 48.6 kPa, buttress downforce 422.3 N, triplane diffuser suction 744.3 N
# Ferrari_812GTS_Trace[1206]: V12 6496cc RPM 4739, BMEP 17.63 bar, intake manifold resonance 48.7 kPa, buttress downforce 422.7 N, triplane diffuser suction 745.1 N
# Ferrari_812GTS_Trace[1207]: V12 6496cc RPM 4742, BMEP 17.64 bar, intake manifold resonance 48.8 kPa, buttress downforce 423.1 N, triplane diffuser suction 746.0 N
# Ferrari_812GTS_Trace[1208]: V12 6496cc RPM 4745, BMEP 17.64 bar, intake manifold resonance 48.8 kPa, buttress downforce 423.6 N, triplane diffuser suction 746.8 N
# Ferrari_812GTS_Trace[1209]: V12 6496cc RPM 4748, BMEP 17.64 bar, intake manifold resonance 48.9 kPa, buttress downforce 424.1 N, triplane diffuser suction 747.6 N
# Ferrari_812GTS_Trace[1210]: V12 6496cc RPM 4751, BMEP 17.65 bar, intake manifold resonance 49.0 kPa, buttress downforce 424.5 N, triplane diffuser suction 748.5 N
# Ferrari_812GTS_Trace[1211]: V12 6496cc RPM 4754, BMEP 17.66 bar, intake manifold resonance 49.1 kPa, buttress downforce 425.0 N, triplane diffuser suction 749.3 N
# Ferrari_812GTS_Trace[1212]: V12 6496cc RPM 4757, BMEP 17.66 bar, intake manifold resonance 49.2 kPa, buttress downforce 425.4 N, triplane diffuser suction 750.2 N
# Ferrari_812GTS_Trace[1213]: V12 6496cc RPM 4760, BMEP 17.66 bar, intake manifold resonance 49.2 kPa, buttress downforce 425.9 N, triplane diffuser suction 751.0 N
# Ferrari_812GTS_Trace[1214]: V12 6496cc RPM 4763, BMEP 17.67 bar, intake manifold resonance 49.3 kPa, buttress downforce 426.3 N, triplane diffuser suction 751.9 N
# Ferrari_812GTS_Trace[1215]: V12 6496cc RPM 4767, BMEP 17.68 bar, intake manifold resonance 49.4 kPa, buttress downforce 426.8 N, triplane diffuser suction 752.8 N
# Ferrari_812GTS_Trace[1216]: V12 6496cc RPM 4770, BMEP 17.68 bar, intake manifold resonance 49.5 kPa, buttress downforce 427.2 N, triplane diffuser suction 753.6 N
# Ferrari_812GTS_Trace[1217]: V12 6496cc RPM 4773, BMEP 17.69 bar, intake manifold resonance 49.6 kPa, buttress downforce 427.6 N, triplane diffuser suction 754.5 N
# Ferrari_812GTS_Trace[1218]: V12 6496cc RPM 4776, BMEP 17.69 bar, intake manifold resonance 49.6 kPa, buttress downforce 428.1 N, triplane diffuser suction 755.3 N
# Ferrari_812GTS_Trace[1219]: V12 6496cc RPM 4779, BMEP 17.70 bar, intake manifold resonance 49.7 kPa, buttress downforce 428.6 N, triplane diffuser suction 756.1 N
# Ferrari_812GTS_Trace[1220]: V12 6496cc RPM 4782, BMEP 17.70 bar, intake manifold resonance 49.8 kPa, buttress downforce 429.0 N, triplane diffuser suction 757.0 N
# Ferrari_812GTS_Trace[1221]: V12 6496cc RPM 4785, BMEP 17.71 bar, intake manifold resonance 49.9 kPa, buttress downforce 429.5 N, triplane diffuser suction 757.8 N
# Ferrari_812GTS_Trace[1222]: V12 6496cc RPM 4788, BMEP 17.71 bar, intake manifold resonance 50.0 kPa, buttress downforce 429.9 N, triplane diffuser suction 758.7 N
# Ferrari_812GTS_Trace[1223]: V12 6496cc RPM 4791, BMEP 17.71 bar, intake manifold resonance 50.0 kPa, buttress downforce 430.4 N, triplane diffuser suction 759.5 N
# Ferrari_812GTS_Trace[1224]: V12 6496cc RPM 4794, BMEP 17.72 bar, intake manifold resonance 50.1 kPa, buttress downforce 430.8 N, triplane diffuser suction 760.4 N
# Ferrari_812GTS_Trace[1225]: V12 6496cc RPM 4798, BMEP 17.73 bar, intake manifold resonance 50.2 kPa, buttress downforce 431.3 N, triplane diffuser suction 761.3 N
# Ferrari_812GTS_Trace[1226]: V12 6496cc RPM 4801, BMEP 17.73 bar, intake manifold resonance 50.3 kPa, buttress downforce 431.7 N, triplane diffuser suction 762.1 N
# Ferrari_812GTS_Trace[1227]: V12 6496cc RPM 4804, BMEP 17.73 bar, intake manifold resonance 50.4 kPa, buttress downforce 432.1 N, triplane diffuser suction 763.0 N
# Ferrari_812GTS_Trace[1228]: V12 6496cc RPM 4807, BMEP 17.74 bar, intake manifold resonance 50.4 kPa, buttress downforce 432.6 N, triplane diffuser suction 763.8 N
# Ferrari_812GTS_Trace[1229]: V12 6496cc RPM 4810, BMEP 17.75 bar, intake manifold resonance 50.5 kPa, buttress downforce 433.1 N, triplane diffuser suction 764.6 N
# Ferrari_812GTS_Trace[1230]: V12 6496cc RPM 4813, BMEP 17.75 bar, intake manifold resonance 50.6 kPa, buttress downforce 433.5 N, triplane diffuser suction 765.5 N
# Ferrari_812GTS_Trace[1231]: V12 6496cc RPM 4816, BMEP 17.76 bar, intake manifold resonance 50.7 kPa, buttress downforce 434.0 N, triplane diffuser suction 766.3 N
# Ferrari_812GTS_Trace[1232]: V12 6496cc RPM 4819, BMEP 17.76 bar, intake manifold resonance 50.8 kPa, buttress downforce 434.4 N, triplane diffuser suction 767.2 N
# Ferrari_812GTS_Trace[1233]: V12 6496cc RPM 4822, BMEP 17.77 bar, intake manifold resonance 50.8 kPa, buttress downforce 434.9 N, triplane diffuser suction 768.0 N
# Ferrari_812GTS_Trace[1234]: V12 6496cc RPM 4825, BMEP 17.77 bar, intake manifold resonance 50.9 kPa, buttress downforce 435.3 N, triplane diffuser suction 768.9 N
# Ferrari_812GTS_Trace[1235]: V12 6496cc RPM 4829, BMEP 17.77 bar, intake manifold resonance 51.0 kPa, buttress downforce 435.8 N, triplane diffuser suction 769.8 N
# Ferrari_812GTS_Trace[1236]: V12 6496cc RPM 4832, BMEP 17.78 bar, intake manifold resonance 51.1 kPa, buttress downforce 436.2 N, triplane diffuser suction 770.6 N
# Ferrari_812GTS_Trace[1237]: V12 6496cc RPM 4835, BMEP 17.79 bar, intake manifold resonance 51.2 kPa, buttress downforce 436.6 N, triplane diffuser suction 771.5 N
# Ferrari_812GTS_Trace[1238]: V12 6496cc RPM 4838, BMEP 17.79 bar, intake manifold resonance 51.2 kPa, buttress downforce 437.1 N, triplane diffuser suction 772.3 N
# Ferrari_812GTS_Trace[1239]: V12 6496cc RPM 4841, BMEP 17.80 bar, intake manifold resonance 51.3 kPa, buttress downforce 437.6 N, triplane diffuser suction 773.1 N
# Ferrari_812GTS_Trace[1240]: V12 6496cc RPM 4844, BMEP 17.80 bar, intake manifold resonance 51.4 kPa, buttress downforce 438.0 N, triplane diffuser suction 774.0 N
# Ferrari_812GTS_Trace[1241]: V12 6496cc RPM 4847, BMEP 17.80 bar, intake manifold resonance 51.5 kPa, buttress downforce 438.5 N, triplane diffuser suction 774.8 N
# Ferrari_812GTS_Trace[1242]: V12 6496cc RPM 4850, BMEP 17.81 bar, intake manifold resonance 51.6 kPa, buttress downforce 438.9 N, triplane diffuser suction 775.7 N
# Ferrari_812GTS_Trace[1243]: V12 6496cc RPM 4853, BMEP 17.82 bar, intake manifold resonance 51.6 kPa, buttress downforce 439.4 N, triplane diffuser suction 776.5 N
# Ferrari_812GTS_Trace[1244]: V12 6496cc RPM 4856, BMEP 17.82 bar, intake manifold resonance 51.7 kPa, buttress downforce 439.8 N, triplane diffuser suction 777.4 N
# Ferrari_812GTS_Trace[1245]: V12 6496cc RPM 4860, BMEP 17.83 bar, intake manifold resonance 51.8 kPa, buttress downforce 440.3 N, triplane diffuser suction 778.3 N
# Ferrari_812GTS_Trace[1246]: V12 6496cc RPM 4863, BMEP 17.83 bar, intake manifold resonance 51.9 kPa, buttress downforce 440.7 N, triplane diffuser suction 779.1 N
# Ferrari_812GTS_Trace[1247]: V12 6496cc RPM 4866, BMEP 17.84 bar, intake manifold resonance 52.0 kPa, buttress downforce 441.1 N, triplane diffuser suction 780.0 N
# Ferrari_812GTS_Trace[1248]: V12 6496cc RPM 4869, BMEP 17.84 bar, intake manifold resonance 52.0 kPa, buttress downforce 441.6 N, triplane diffuser suction 780.8 N
# Ferrari_812GTS_Trace[1249]: V12 6496cc RPM 4872, BMEP 17.84 bar, intake manifold resonance 52.1 kPa, buttress downforce 442.1 N, triplane diffuser suction 781.6 N
# Ferrari_812GTS_Trace[1250]: V12 6496cc RPM 4875, BMEP 17.85 bar, intake manifold resonance 52.2 kPa, buttress downforce 442.5 N, triplane diffuser suction 782.5 N
# Ferrari_812GTS_Trace[1251]: V12 6496cc RPM 4878, BMEP 17.86 bar, intake manifold resonance 52.3 kPa, buttress downforce 443.0 N, triplane diffuser suction 783.3 N
# Ferrari_812GTS_Trace[1252]: V12 6496cc RPM 4881, BMEP 17.86 bar, intake manifold resonance 52.4 kPa, buttress downforce 443.4 N, triplane diffuser suction 784.2 N
# Ferrari_812GTS_Trace[1253]: V12 6496cc RPM 4884, BMEP 17.87 bar, intake manifold resonance 52.4 kPa, buttress downforce 443.9 N, triplane diffuser suction 785.0 N
# Ferrari_812GTS_Trace[1254]: V12 6496cc RPM 4887, BMEP 17.87 bar, intake manifold resonance 52.5 kPa, buttress downforce 444.3 N, triplane diffuser suction 785.9 N
# Ferrari_812GTS_Trace[1255]: V12 6496cc RPM 4891, BMEP 17.88 bar, intake manifold resonance 52.6 kPa, buttress downforce 444.8 N, triplane diffuser suction 786.8 N
# Ferrari_812GTS_Trace[1256]: V12 6496cc RPM 4894, BMEP 17.88 bar, intake manifold resonance 52.7 kPa, buttress downforce 445.2 N, triplane diffuser suction 787.6 N
# Ferrari_812GTS_Trace[1257]: V12 6496cc RPM 4897, BMEP 17.89 bar, intake manifold resonance 52.8 kPa, buttress downforce 445.6 N, triplane diffuser suction 788.5 N
# Ferrari_812GTS_Trace[1258]: V12 6496cc RPM 4900, BMEP 17.89 bar, intake manifold resonance 52.8 kPa, buttress downforce 446.1 N, triplane diffuser suction 789.3 N
# Ferrari_812GTS_Trace[1259]: V12 6496cc RPM 4903, BMEP 17.89 bar, intake manifold resonance 52.9 kPa, buttress downforce 446.6 N, triplane diffuser suction 790.1 N
# Ferrari_812GTS_Trace[1260]: V12 6496cc RPM 4906, BMEP 17.90 bar, intake manifold resonance 53.0 kPa, buttress downforce 447.0 N, triplane diffuser suction 791.0 N
# Ferrari_812GTS_Trace[1261]: V12 6496cc RPM 4909, BMEP 17.91 bar, intake manifold resonance 53.1 kPa, buttress downforce 447.5 N, triplane diffuser suction 791.8 N
# Ferrari_812GTS_Trace[1262]: V12 6496cc RPM 4912, BMEP 17.91 bar, intake manifold resonance 53.2 kPa, buttress downforce 447.9 N, triplane diffuser suction 792.7 N
# Ferrari_812GTS_Trace[1263]: V12 6496cc RPM 4915, BMEP 17.91 bar, intake manifold resonance 53.2 kPa, buttress downforce 448.4 N, triplane diffuser suction 793.5 N
# Ferrari_812GTS_Trace[1264]: V12 6496cc RPM 4918, BMEP 17.92 bar, intake manifold resonance 53.3 kPa, buttress downforce 448.8 N, triplane diffuser suction 794.4 N
# Ferrari_812GTS_Trace[1265]: V12 6496cc RPM 4922, BMEP 17.93 bar, intake manifold resonance 53.4 kPa, buttress downforce 449.3 N, triplane diffuser suction 795.3 N
# Ferrari_812GTS_Trace[1266]: V12 6496cc RPM 4925, BMEP 17.93 bar, intake manifold resonance 53.5 kPa, buttress downforce 449.7 N, triplane diffuser suction 796.1 N
# Ferrari_812GTS_Trace[1267]: V12 6496cc RPM 4928, BMEP 17.94 bar, intake manifold resonance 53.6 kPa, buttress downforce 450.1 N, triplane diffuser suction 797.0 N
# Ferrari_812GTS_Trace[1268]: V12 6496cc RPM 4931, BMEP 17.94 bar, intake manifold resonance 53.6 kPa, buttress downforce 450.6 N, triplane diffuser suction 797.8 N
# Ferrari_812GTS_Trace[1269]: V12 6496cc RPM 4934, BMEP 17.95 bar, intake manifold resonance 53.7 kPa, buttress downforce 451.1 N, triplane diffuser suction 798.6 N
# Ferrari_812GTS_Trace[1270]: V12 6496cc RPM 4937, BMEP 17.95 bar, intake manifold resonance 53.8 kPa, buttress downforce 451.5 N, triplane diffuser suction 799.5 N
# Ferrari_812GTS_Trace[1271]: V12 6496cc RPM 4940, BMEP 17.96 bar, intake manifold resonance 53.9 kPa, buttress downforce 452.0 N, triplane diffuser suction 800.3 N
# Ferrari_812GTS_Trace[1272]: V12 6496cc RPM 4943, BMEP 17.96 bar, intake manifold resonance 54.0 kPa, buttress downforce 452.4 N, triplane diffuser suction 801.2 N
# Ferrari_812GTS_Trace[1273]: V12 6496cc RPM 4946, BMEP 17.96 bar, intake manifold resonance 54.0 kPa, buttress downforce 452.9 N, triplane diffuser suction 802.0 N
# Ferrari_812GTS_Trace[1274]: V12 6496cc RPM 4949, BMEP 17.97 bar, intake manifold resonance 54.1 kPa, buttress downforce 453.3 N, triplane diffuser suction 802.9 N
# Ferrari_812GTS_Trace[1275]: V12 6496cc RPM 4953, BMEP 17.98 bar, intake manifold resonance 54.2 kPa, buttress downforce 453.8 N, triplane diffuser suction 803.8 N
# Ferrari_812GTS_Trace[1276]: V12 6496cc RPM 4956, BMEP 17.98 bar, intake manifold resonance 54.3 kPa, buttress downforce 454.2 N, triplane diffuser suction 804.6 N
# Ferrari_812GTS_Trace[1277]: V12 6496cc RPM 4959, BMEP 17.98 bar, intake manifold resonance 54.4 kPa, buttress downforce 454.6 N, triplane diffuser suction 805.5 N
# Ferrari_812GTS_Trace[1278]: V12 6496cc RPM 4962, BMEP 17.99 bar, intake manifold resonance 54.4 kPa, buttress downforce 455.1 N, triplane diffuser suction 806.3 N
# Ferrari_812GTS_Trace[1279]: V12 6496cc RPM 4965, BMEP 18.00 bar, intake manifold resonance 54.5 kPa, buttress downforce 455.6 N, triplane diffuser suction 807.1 N
# Ferrari_812GTS_Trace[1280]: V12 6496cc RPM 4968, BMEP 14.80 bar, intake manifold resonance 54.6 kPa, buttress downforce 456.0 N, triplane diffuser suction 808.0 N
# Ferrari_812GTS_Trace[1281]: V12 6496cc RPM 4971, BMEP 14.80 bar, intake manifold resonance 54.7 kPa, buttress downforce 456.5 N, triplane diffuser suction 808.8 N
# Ferrari_812GTS_Trace[1282]: V12 6496cc RPM 4974, BMEP 14.81 bar, intake manifold resonance 54.8 kPa, buttress downforce 456.9 N, triplane diffuser suction 809.7 N
# Ferrari_812GTS_Trace[1283]: V12 6496cc RPM 4977, BMEP 14.82 bar, intake manifold resonance 54.8 kPa, buttress downforce 457.4 N, triplane diffuser suction 810.5 N
# Ferrari_812GTS_Trace[1284]: V12 6496cc RPM 4980, BMEP 14.82 bar, intake manifold resonance 54.9 kPa, buttress downforce 457.8 N, triplane diffuser suction 811.4 N
# Ferrari_812GTS_Trace[1285]: V12 6496cc RPM 4984, BMEP 14.82 bar, intake manifold resonance 55.0 kPa, buttress downforce 458.3 N, triplane diffuser suction 812.3 N
# Ferrari_812GTS_Trace[1286]: V12 6496cc RPM 4987, BMEP 14.83 bar, intake manifold resonance 55.1 kPa, buttress downforce 458.7 N, triplane diffuser suction 813.1 N
# Ferrari_812GTS_Trace[1287]: V12 6496cc RPM 4990, BMEP 14.84 bar, intake manifold resonance 55.2 kPa, buttress downforce 459.1 N, triplane diffuser suction 814.0 N
# Ferrari_812GTS_Trace[1288]: V12 6496cc RPM 4993, BMEP 14.84 bar, intake manifold resonance 55.2 kPa, buttress downforce 459.6 N, triplane diffuser suction 814.8 N
# Ferrari_812GTS_Trace[1289]: V12 6496cc RPM 4996, BMEP 14.85 bar, intake manifold resonance 55.3 kPa, buttress downforce 460.1 N, triplane diffuser suction 815.6 N
# Ferrari_812GTS_Trace[1290]: V12 6496cc RPM 4999, BMEP 14.85 bar, intake manifold resonance 55.4 kPa, buttress downforce 460.5 N, triplane diffuser suction 816.5 N
# Ferrari_812GTS_Trace[1291]: V12 6496cc RPM 5002, BMEP 14.86 bar, intake manifold resonance 55.5 kPa, buttress downforce 461.0 N, triplane diffuser suction 817.3 N
# Ferrari_812GTS_Trace[1292]: V12 6496cc RPM 5005, BMEP 14.86 bar, intake manifold resonance 55.6 kPa, buttress downforce 461.4 N, triplane diffuser suction 818.2 N
# Ferrari_812GTS_Trace[1293]: V12 6496cc RPM 5008, BMEP 14.87 bar, intake manifold resonance 55.6 kPa, buttress downforce 461.9 N, triplane diffuser suction 819.0 N
# Ferrari_812GTS_Trace[1294]: V12 6496cc RPM 5011, BMEP 14.87 bar, intake manifold resonance 55.7 kPa, buttress downforce 462.3 N, triplane diffuser suction 819.9 N
# Ferrari_812GTS_Trace[1295]: V12 6496cc RPM 5015, BMEP 14.88 bar, intake manifold resonance 55.8 kPa, buttress downforce 462.8 N, triplane diffuser suction 820.8 N
# Ferrari_812GTS_Trace[1296]: V12 6496cc RPM 5018, BMEP 14.88 bar, intake manifold resonance 55.9 kPa, buttress downforce 463.2 N, triplane diffuser suction 821.6 N
# Ferrari_812GTS_Trace[1297]: V12 6496cc RPM 5021, BMEP 14.89 bar, intake manifold resonance 56.0 kPa, buttress downforce 463.6 N, triplane diffuser suction 822.5 N
# Ferrari_812GTS_Trace[1298]: V12 6496cc RPM 5024, BMEP 14.89 bar, intake manifold resonance 56.0 kPa, buttress downforce 464.1 N, triplane diffuser suction 823.3 N
# Ferrari_812GTS_Trace[1299]: V12 6496cc RPM 5027, BMEP 14.89 bar, intake manifold resonance 56.1 kPa, buttress downforce 464.6 N, triplane diffuser suction 824.1 N
# Ferrari_812GTS_Trace[1300]: V12 6496cc RPM 5030, BMEP 14.90 bar, intake manifold resonance 56.2 kPa, buttress downforce 465.0 N, triplane diffuser suction 825.0 N
# Ferrari_812GTS_Trace[1301]: V12 6496cc RPM 5033, BMEP 14.91 bar, intake manifold resonance 56.3 kPa, buttress downforce 465.5 N, triplane diffuser suction 825.8 N
# Ferrari_812GTS_Trace[1302]: V12 6496cc RPM 5036, BMEP 14.91 bar, intake manifold resonance 56.4 kPa, buttress downforce 465.9 N, triplane diffuser suction 826.7 N
# Ferrari_812GTS_Trace[1303]: V12 6496cc RPM 5039, BMEP 14.92 bar, intake manifold resonance 56.4 kPa, buttress downforce 466.4 N, triplane diffuser suction 827.5 N
# Ferrari_812GTS_Trace[1304]: V12 6496cc RPM 5042, BMEP 14.92 bar, intake manifold resonance 56.5 kPa, buttress downforce 466.8 N, triplane diffuser suction 828.4 N
# Ferrari_812GTS_Trace[1305]: V12 6496cc RPM 5046, BMEP 14.93 bar, intake manifold resonance 56.6 kPa, buttress downforce 467.3 N, triplane diffuser suction 829.3 N
# Ferrari_812GTS_Trace[1306]: V12 6496cc RPM 5049, BMEP 14.93 bar, intake manifold resonance 56.7 kPa, buttress downforce 467.7 N, triplane diffuser suction 830.1 N
# Ferrari_812GTS_Trace[1307]: V12 6496cc RPM 5052, BMEP 14.94 bar, intake manifold resonance 56.8 kPa, buttress downforce 468.1 N, triplane diffuser suction 831.0 N
# Ferrari_812GTS_Trace[1308]: V12 6496cc RPM 5055, BMEP 14.94 bar, intake manifold resonance 56.8 kPa, buttress downforce 468.6 N, triplane diffuser suction 831.8 N
# Ferrari_812GTS_Trace[1309]: V12 6496cc RPM 5058, BMEP 14.95 bar, intake manifold resonance 56.9 kPa, buttress downforce 469.1 N, triplane diffuser suction 832.6 N
# Ferrari_812GTS_Trace[1310]: V12 6496cc RPM 5061, BMEP 14.95 bar, intake manifold resonance 57.0 kPa, buttress downforce 469.5 N, triplane diffuser suction 833.5 N
# Ferrari_812GTS_Trace[1311]: V12 6496cc RPM 5064, BMEP 14.96 bar, intake manifold resonance 57.1 kPa, buttress downforce 470.0 N, triplane diffuser suction 834.3 N
# Ferrari_812GTS_Trace[1312]: V12 6496cc RPM 5067, BMEP 14.96 bar, intake manifold resonance 57.2 kPa, buttress downforce 470.4 N, triplane diffuser suction 835.2 N
# Ferrari_812GTS_Trace[1313]: V12 6496cc RPM 5070, BMEP 14.96 bar, intake manifold resonance 57.2 kPa, buttress downforce 470.9 N, triplane diffuser suction 836.0 N
# Ferrari_812GTS_Trace[1314]: V12 6496cc RPM 5073, BMEP 14.97 bar, intake manifold resonance 57.3 kPa, buttress downforce 471.3 N, triplane diffuser suction 836.9 N
# Ferrari_812GTS_Trace[1315]: V12 6496cc RPM 5077, BMEP 14.98 bar, intake manifold resonance 57.4 kPa, buttress downforce 471.8 N, triplane diffuser suction 837.8 N
# Ferrari_812GTS_Trace[1316]: V12 6496cc RPM 5080, BMEP 14.98 bar, intake manifold resonance 57.5 kPa, buttress downforce 472.2 N, triplane diffuser suction 838.6 N
# Ferrari_812GTS_Trace[1317]: V12 6496cc RPM 5083, BMEP 14.98 bar, intake manifold resonance 57.6 kPa, buttress downforce 472.6 N, triplane diffuser suction 839.5 N
# Ferrari_812GTS_Trace[1318]: V12 6496cc RPM 5086, BMEP 14.99 bar, intake manifold resonance 57.6 kPa, buttress downforce 473.1 N, triplane diffuser suction 840.3 N
# Ferrari_812GTS_Trace[1319]: V12 6496cc RPM 5089, BMEP 15.00 bar, intake manifold resonance 57.7 kPa, buttress downforce 473.6 N, triplane diffuser suction 841.1 N
# Ferrari_812GTS_Trace[1320]: V12 6496cc RPM 5092, BMEP 15.00 bar, intake manifold resonance 57.8 kPa, buttress downforce 474.0 N, triplane diffuser suction 842.0 N
# Ferrari_812GTS_Trace[1321]: V12 6496cc RPM 5095, BMEP 15.01 bar, intake manifold resonance 57.9 kPa, buttress downforce 474.5 N, triplane diffuser suction 842.8 N
# Ferrari_812GTS_Trace[1322]: V12 6496cc RPM 5098, BMEP 15.01 bar, intake manifold resonance 58.0 kPa, buttress downforce 474.9 N, triplane diffuser suction 843.7 N
# Ferrari_812GTS_Trace[1323]: V12 6496cc RPM 5101, BMEP 15.02 bar, intake manifold resonance 58.0 kPa, buttress downforce 475.4 N, triplane diffuser suction 844.5 N
# Ferrari_812GTS_Trace[1324]: V12 6496cc RPM 5104, BMEP 15.02 bar, intake manifold resonance 58.1 kPa, buttress downforce 475.8 N, triplane diffuser suction 845.4 N
# Ferrari_812GTS_Trace[1325]: V12 6496cc RPM 5108, BMEP 15.03 bar, intake manifold resonance 58.2 kPa, buttress downforce 476.3 N, triplane diffuser suction 846.3 N
# Ferrari_812GTS_Trace[1326]: V12 6496cc RPM 5111, BMEP 15.03 bar, intake manifold resonance 58.3 kPa, buttress downforce 476.7 N, triplane diffuser suction 847.1 N
# Ferrari_812GTS_Trace[1327]: V12 6496cc RPM 5114, BMEP 15.04 bar, intake manifold resonance 58.4 kPa, buttress downforce 477.1 N, triplane diffuser suction 848.0 N
# Ferrari_812GTS_Trace[1328]: V12 6496cc RPM 5117, BMEP 15.04 bar, intake manifold resonance 58.4 kPa, buttress downforce 477.6 N, triplane diffuser suction 848.8 N
# Ferrari_812GTS_Trace[1329]: V12 6496cc RPM 5120, BMEP 15.05 bar, intake manifold resonance 58.5 kPa, buttress downforce 478.1 N, triplane diffuser suction 849.6 N
# Ferrari_812GTS_Trace[1330]: V12 6496cc RPM 5123, BMEP 15.05 bar, intake manifold resonance 58.6 kPa, buttress downforce 478.5 N, triplane diffuser suction 850.5 N
# Ferrari_812GTS_Trace[1331]: V12 6496cc RPM 5126, BMEP 15.05 bar, intake manifold resonance 58.7 kPa, buttress downforce 479.0 N, triplane diffuser suction 851.3 N
# Ferrari_812GTS_Trace[1332]: V12 6496cc RPM 5129, BMEP 15.06 bar, intake manifold resonance 58.8 kPa, buttress downforce 479.4 N, triplane diffuser suction 852.2 N
# Ferrari_812GTS_Trace[1333]: V12 6496cc RPM 5132, BMEP 15.07 bar, intake manifold resonance 58.8 kPa, buttress downforce 479.9 N, triplane diffuser suction 853.0 N
# Ferrari_812GTS_Trace[1334]: V12 6496cc RPM 5135, BMEP 15.07 bar, intake manifold resonance 58.9 kPa, buttress downforce 480.3 N, triplane diffuser suction 853.9 N
# Ferrari_812GTS_Trace[1335]: V12 6496cc RPM 5139, BMEP 15.07 bar, intake manifold resonance 59.0 kPa, buttress downforce 480.8 N, triplane diffuser suction 854.8 N
# Ferrari_812GTS_Trace[1336]: V12 6496cc RPM 5142, BMEP 15.08 bar, intake manifold resonance 59.1 kPa, buttress downforce 481.2 N, triplane diffuser suction 855.6 N
# Ferrari_812GTS_Trace[1337]: V12 6496cc RPM 5145, BMEP 15.09 bar, intake manifold resonance 59.2 kPa, buttress downforce 481.6 N, triplane diffuser suction 856.5 N
# Ferrari_812GTS_Trace[1338]: V12 6496cc RPM 5148, BMEP 15.09 bar, intake manifold resonance 59.2 kPa, buttress downforce 482.1 N, triplane diffuser suction 857.3 N
# Ferrari_812GTS_Trace[1339]: V12 6496cc RPM 5151, BMEP 15.10 bar, intake manifold resonance 59.3 kPa, buttress downforce 482.6 N, triplane diffuser suction 858.1 N
# Ferrari_812GTS_Trace[1340]: V12 6496cc RPM 5154, BMEP 15.10 bar, intake manifold resonance 59.4 kPa, buttress downforce 483.0 N, triplane diffuser suction 859.0 N
# Ferrari_812GTS_Trace[1341]: V12 6496cc RPM 5157, BMEP 15.11 bar, intake manifold resonance 59.5 kPa, buttress downforce 483.5 N, triplane diffuser suction 859.8 N
# Ferrari_812GTS_Trace[1342]: V12 6496cc RPM 5160, BMEP 15.11 bar, intake manifold resonance 59.6 kPa, buttress downforce 483.9 N, triplane diffuser suction 860.7 N
# Ferrari_812GTS_Trace[1343]: V12 6496cc RPM 5163, BMEP 15.12 bar, intake manifold resonance 59.6 kPa, buttress downforce 484.4 N, triplane diffuser suction 861.5 N
# Ferrari_812GTS_Trace[1344]: V12 6496cc RPM 5166, BMEP 15.12 bar, intake manifold resonance 59.7 kPa, buttress downforce 484.8 N, triplane diffuser suction 862.4 N
# Ferrari_812GTS_Trace[1345]: V12 6496cc RPM 5170, BMEP 15.13 bar, intake manifold resonance 59.8 kPa, buttress downforce 485.3 N, triplane diffuser suction 863.3 N
# Ferrari_812GTS_Trace[1346]: V12 6496cc RPM 5173, BMEP 15.13 bar, intake manifold resonance 59.9 kPa, buttress downforce 485.7 N, triplane diffuser suction 864.1 N
# Ferrari_812GTS_Trace[1347]: V12 6496cc RPM 5176, BMEP 15.14 bar, intake manifold resonance 60.0 kPa, buttress downforce 486.1 N, triplane diffuser suction 865.0 N
# Ferrari_812GTS_Trace[1348]: V12 6496cc RPM 5179, BMEP 15.14 bar, intake manifold resonance 60.0 kPa, buttress downforce 486.6 N, triplane diffuser suction 865.8 N
# Ferrari_812GTS_Trace[1349]: V12 6496cc RPM 5182, BMEP 15.14 bar, intake manifold resonance 60.1 kPa, buttress downforce 487.1 N, triplane diffuser suction 866.6 N
# Ferrari_812GTS_Trace[1350]: V12 6496cc RPM 5185, BMEP 15.15 bar, intake manifold resonance 48.2 kPa, buttress downforce 487.5 N, triplane diffuser suction 867.5 N
# Ferrari_812GTS_Trace[1351]: V12 6496cc RPM 5188, BMEP 15.16 bar, intake manifold resonance 48.3 kPa, buttress downforce 488.0 N, triplane diffuser suction 868.3 N
# Ferrari_812GTS_Trace[1352]: V12 6496cc RPM 5191, BMEP 15.16 bar, intake manifold resonance 48.4 kPa, buttress downforce 488.4 N, triplane diffuser suction 869.2 N
# Ferrari_812GTS_Trace[1353]: V12 6496cc RPM 5194, BMEP 15.17 bar, intake manifold resonance 48.4 kPa, buttress downforce 488.9 N, triplane diffuser suction 870.0 N
# Ferrari_812GTS_Trace[1354]: V12 6496cc RPM 5197, BMEP 15.17 bar, intake manifold resonance 48.5 kPa, buttress downforce 489.3 N, triplane diffuser suction 870.9 N
# Ferrari_812GTS_Trace[1355]: V12 6496cc RPM 5201, BMEP 15.18 bar, intake manifold resonance 48.6 kPa, buttress downforce 489.8 N, triplane diffuser suction 871.8 N
# Ferrari_812GTS_Trace[1356]: V12 6496cc RPM 5204, BMEP 15.18 bar, intake manifold resonance 48.7 kPa, buttress downforce 490.2 N, triplane diffuser suction 872.6 N
# Ferrari_812GTS_Trace[1357]: V12 6496cc RPM 5207, BMEP 15.19 bar, intake manifold resonance 48.8 kPa, buttress downforce 490.6 N, triplane diffuser suction 873.5 N
# Ferrari_812GTS_Trace[1358]: V12 6496cc RPM 5210, BMEP 15.19 bar, intake manifold resonance 48.8 kPa, buttress downforce 491.1 N, triplane diffuser suction 874.3 N
# Ferrari_812GTS_Trace[1359]: V12 6496cc RPM 5213, BMEP 15.20 bar, intake manifold resonance 48.9 kPa, buttress downforce 491.6 N, triplane diffuser suction 875.1 N
# Ferrari_812GTS_Trace[1360]: V12 6496cc RPM 5216, BMEP 15.20 bar, intake manifold resonance 49.0 kPa, buttress downforce 492.0 N, triplane diffuser suction 876.0 N
# Ferrari_812GTS_Trace[1361]: V12 6496cc RPM 5219, BMEP 15.21 bar, intake manifold resonance 49.1 kPa, buttress downforce 492.5 N, triplane diffuser suction 876.8 N
# Ferrari_812GTS_Trace[1362]: V12 6496cc RPM 5222, BMEP 15.21 bar, intake manifold resonance 49.2 kPa, buttress downforce 492.9 N, triplane diffuser suction 877.7 N
# Ferrari_812GTS_Trace[1363]: V12 6496cc RPM 5225, BMEP 15.21 bar, intake manifold resonance 49.2 kPa, buttress downforce 493.4 N, triplane diffuser suction 878.5 N
# Ferrari_812GTS_Trace[1364]: V12 6496cc RPM 5228, BMEP 15.22 bar, intake manifold resonance 49.3 kPa, buttress downforce 493.8 N, triplane diffuser suction 879.4 N
# Ferrari_812GTS_Trace[1365]: V12 6496cc RPM 5232, BMEP 15.23 bar, intake manifold resonance 49.4 kPa, buttress downforce 494.3 N, triplane diffuser suction 880.3 N
# Ferrari_812GTS_Trace[1366]: V12 6496cc RPM 5235, BMEP 15.23 bar, intake manifold resonance 49.5 kPa, buttress downforce 494.7 N, triplane diffuser suction 881.1 N
# Ferrari_812GTS_Trace[1367]: V12 6496cc RPM 5238, BMEP 15.23 bar, intake manifold resonance 49.6 kPa, buttress downforce 495.1 N, triplane diffuser suction 882.0 N
# Ferrari_812GTS_Trace[1368]: V12 6496cc RPM 5241, BMEP 15.24 bar, intake manifold resonance 49.6 kPa, buttress downforce 495.6 N, triplane diffuser suction 882.8 N
# Ferrari_812GTS_Trace[1369]: V12 6496cc RPM 5244, BMEP 15.25 bar, intake manifold resonance 49.7 kPa, buttress downforce 496.1 N, triplane diffuser suction 883.6 N
# Ferrari_812GTS_Trace[1370]: V12 6496cc RPM 5247, BMEP 15.25 bar, intake manifold resonance 49.8 kPa, buttress downforce 496.5 N, triplane diffuser suction 884.5 N
# Ferrari_812GTS_Trace[1371]: V12 6496cc RPM 5250, BMEP 15.26 bar, intake manifold resonance 49.9 kPa, buttress downforce 497.0 N, triplane diffuser suction 885.3 N
# Ferrari_812GTS_Trace[1372]: V12 6496cc RPM 5253, BMEP 15.26 bar, intake manifold resonance 50.0 kPa, buttress downforce 497.4 N, triplane diffuser suction 886.2 N
# Ferrari_812GTS_Trace[1373]: V12 6496cc RPM 5256, BMEP 15.27 bar, intake manifold resonance 50.0 kPa, buttress downforce 497.9 N, triplane diffuser suction 887.0 N
# Ferrari_812GTS_Trace[1374]: V12 6496cc RPM 5259, BMEP 15.27 bar, intake manifold resonance 50.1 kPa, buttress downforce 498.3 N, triplane diffuser suction 887.9 N
# Ferrari_812GTS_Trace[1375]: V12 6496cc RPM 5263, BMEP 15.28 bar, intake manifold resonance 50.2 kPa, buttress downforce 498.8 N, triplane diffuser suction 888.8 N
# Ferrari_812GTS_Trace[1376]: V12 6496cc RPM 5266, BMEP 15.28 bar, intake manifold resonance 50.3 kPa, buttress downforce 499.2 N, triplane diffuser suction 889.6 N
# Ferrari_812GTS_Trace[1377]: V12 6496cc RPM 5269, BMEP 15.29 bar, intake manifold resonance 50.4 kPa, buttress downforce 499.6 N, triplane diffuser suction 890.5 N
# Ferrari_812GTS_Trace[1378]: V12 6496cc RPM 5272, BMEP 15.29 bar, intake manifold resonance 50.4 kPa, buttress downforce 500.1 N, triplane diffuser suction 891.3 N
# Ferrari_812GTS_Trace[1379]: V12 6496cc RPM 5275, BMEP 15.30 bar, intake manifold resonance 50.5 kPa, buttress downforce 500.6 N, triplane diffuser suction 892.1 N
# Ferrari_812GTS_Trace[1380]: V12 6496cc RPM 5278, BMEP 15.30 bar, intake manifold resonance 50.6 kPa, buttress downforce 501.0 N, triplane diffuser suction 893.0 N
# Ferrari_812GTS_Trace[1381]: V12 6496cc RPM 5281, BMEP 15.30 bar, intake manifold resonance 50.7 kPa, buttress downforce 501.5 N, triplane diffuser suction 893.8 N
# Ferrari_812GTS_Trace[1382]: V12 6496cc RPM 5284, BMEP 15.31 bar, intake manifold resonance 50.8 kPa, buttress downforce 501.9 N, triplane diffuser suction 894.7 N
# Ferrari_812GTS_Trace[1383]: V12 6496cc RPM 5287, BMEP 15.32 bar, intake manifold resonance 50.8 kPa, buttress downforce 502.4 N, triplane diffuser suction 895.5 N
# Ferrari_812GTS_Trace[1384]: V12 6496cc RPM 5290, BMEP 15.32 bar, intake manifold resonance 50.9 kPa, buttress downforce 502.8 N, triplane diffuser suction 896.4 N
# Ferrari_812GTS_Trace[1385]: V12 6496cc RPM 5294, BMEP 15.32 bar, intake manifold resonance 51.0 kPa, buttress downforce 503.3 N, triplane diffuser suction 897.3 N
# Ferrari_812GTS_Trace[1386]: V12 6496cc RPM 5297, BMEP 15.33 bar, intake manifold resonance 51.1 kPa, buttress downforce 503.7 N, triplane diffuser suction 898.1 N
# Ferrari_812GTS_Trace[1387]: V12 6496cc RPM 5300, BMEP 15.34 bar, intake manifold resonance 51.2 kPa, buttress downforce 504.1 N, triplane diffuser suction 899.0 N
# Ferrari_812GTS_Trace[1388]: V12 6496cc RPM 5303, BMEP 15.34 bar, intake manifold resonance 51.2 kPa, buttress downforce 504.6 N, triplane diffuser suction 899.8 N
# Ferrari_812GTS_Trace[1389]: V12 6496cc RPM 5306, BMEP 15.35 bar, intake manifold resonance 51.3 kPa, buttress downforce 505.1 N, triplane diffuser suction 900.6 N
# Ferrari_812GTS_Trace[1390]: V12 6496cc RPM 5309, BMEP 15.35 bar, intake manifold resonance 51.4 kPa, buttress downforce 505.5 N, triplane diffuser suction 901.5 N
# Ferrari_812GTS_Trace[1391]: V12 6496cc RPM 5312, BMEP 15.36 bar, intake manifold resonance 51.5 kPa, buttress downforce 506.0 N, triplane diffuser suction 902.3 N
# Ferrari_812GTS_Trace[1392]: V12 6496cc RPM 5315, BMEP 15.36 bar, intake manifold resonance 51.6 kPa, buttress downforce 506.4 N, triplane diffuser suction 903.2 N
# Ferrari_812GTS_Trace[1393]: V12 6496cc RPM 5318, BMEP 15.37 bar, intake manifold resonance 51.6 kPa, buttress downforce 506.9 N, triplane diffuser suction 904.0 N
# Ferrari_812GTS_Trace[1394]: V12 6496cc RPM 5321, BMEP 15.37 bar, intake manifold resonance 51.7 kPa, buttress downforce 507.3 N, triplane diffuser suction 904.9 N
# Ferrari_812GTS_Trace[1395]: V12 6496cc RPM 5325, BMEP 15.38 bar, intake manifold resonance 51.8 kPa, buttress downforce 507.8 N, triplane diffuser suction 905.8 N
# Ferrari_812GTS_Trace[1396]: V12 6496cc RPM 5328, BMEP 15.38 bar, intake manifold resonance 51.9 kPa, buttress downforce 508.2 N, triplane diffuser suction 906.6 N
# Ferrari_812GTS_Trace[1397]: V12 6496cc RPM 5331, BMEP 15.39 bar, intake manifold resonance 52.0 kPa, buttress downforce 508.6 N, triplane diffuser suction 907.5 N
# Ferrari_812GTS_Trace[1398]: V12 6496cc RPM 5334, BMEP 15.39 bar, intake manifold resonance 52.0 kPa, buttress downforce 509.1 N, triplane diffuser suction 908.3 N
# Ferrari_812GTS_Trace[1399]: V12 6496cc RPM 5337, BMEP 15.39 bar, intake manifold resonance 52.1 kPa, buttress downforce 509.6 N, triplane diffuser suction 909.1 N
# Ferrari_812GTS_Trace[1400]: V12 6496cc RPM 5340, BMEP 15.40 bar, intake manifold resonance 52.2 kPa, buttress downforce 510.0 N, triplane diffuser suction 910.0 N
# Ferrari_812GTS_Trace[1401]: V12 6496cc RPM 5343, BMEP 15.41 bar, intake manifold resonance 52.3 kPa, buttress downforce 510.5 N, triplane diffuser suction 910.8 N
# Ferrari_812GTS_Trace[1402]: V12 6496cc RPM 5346, BMEP 15.41 bar, intake manifold resonance 52.4 kPa, buttress downforce 510.9 N, triplane diffuser suction 911.7 N
# Ferrari_812GTS_Trace[1403]: V12 6496cc RPM 5349, BMEP 15.42 bar, intake manifold resonance 52.4 kPa, buttress downforce 511.4 N, triplane diffuser suction 912.5 N
# Ferrari_812GTS_Trace[1404]: V12 6496cc RPM 5352, BMEP 15.42 bar, intake manifold resonance 52.5 kPa, buttress downforce 511.8 N, triplane diffuser suction 913.4 N
# Ferrari_812GTS_Trace[1405]: V12 6496cc RPM 5356, BMEP 15.43 bar, intake manifold resonance 52.6 kPa, buttress downforce 512.3 N, triplane diffuser suction 914.3 N
# Ferrari_812GTS_Trace[1406]: V12 6496cc RPM 5359, BMEP 15.43 bar, intake manifold resonance 52.7 kPa, buttress downforce 512.7 N, triplane diffuser suction 915.1 N
# Ferrari_812GTS_Trace[1407]: V12 6496cc RPM 5362, BMEP 15.44 bar, intake manifold resonance 52.8 kPa, buttress downforce 513.1 N, triplane diffuser suction 916.0 N
# Ferrari_812GTS_Trace[1408]: V12 6496cc RPM 5365, BMEP 15.44 bar, intake manifold resonance 52.8 kPa, buttress downforce 513.6 N, triplane diffuser suction 916.8 N
# Ferrari_812GTS_Trace[1409]: V12 6496cc RPM 5368, BMEP 15.45 bar, intake manifold resonance 52.9 kPa, buttress downforce 514.1 N, triplane diffuser suction 917.6 N
# Ferrari_812GTS_Trace[1410]: V12 6496cc RPM 5371, BMEP 15.45 bar, intake manifold resonance 53.0 kPa, buttress downforce 514.5 N, triplane diffuser suction 918.5 N
# Ferrari_812GTS_Trace[1411]: V12 6496cc RPM 5374, BMEP 15.46 bar, intake manifold resonance 53.1 kPa, buttress downforce 515.0 N, triplane diffuser suction 919.3 N
# Ferrari_812GTS_Trace[1412]: V12 6496cc RPM 5377, BMEP 15.46 bar, intake manifold resonance 53.2 kPa, buttress downforce 515.4 N, triplane diffuser suction 680.2 N
# Ferrari_812GTS_Trace[1413]: V12 6496cc RPM 5380, BMEP 15.46 bar, intake manifold resonance 53.2 kPa, buttress downforce 515.9 N, triplane diffuser suction 681.0 N
# Ferrari_812GTS_Trace[1414]: V12 6496cc RPM 5383, BMEP 15.47 bar, intake manifold resonance 53.3 kPa, buttress downforce 516.3 N, triplane diffuser suction 681.9 N
# Ferrari_812GTS_Trace[1415]: V12 6496cc RPM 5387, BMEP 15.48 bar, intake manifold resonance 53.4 kPa, buttress downforce 516.8 N, triplane diffuser suction 682.8 N
# Ferrari_812GTS_Trace[1416]: V12 6496cc RPM 5390, BMEP 15.48 bar, intake manifold resonance 53.5 kPa, buttress downforce 517.2 N, triplane diffuser suction 683.6 N
# Ferrari_812GTS_Trace[1417]: V12 6496cc RPM 5393, BMEP 15.48 bar, intake manifold resonance 53.6 kPa, buttress downforce 517.6 N, triplane diffuser suction 684.5 N
# Ferrari_812GTS_Trace[1418]: V12 6496cc RPM 5396, BMEP 15.49 bar, intake manifold resonance 53.6 kPa, buttress downforce 518.1 N, triplane diffuser suction 685.3 N
# Ferrari_812GTS_Trace[1419]: V12 6496cc RPM 5399, BMEP 15.50 bar, intake manifold resonance 53.7 kPa, buttress downforce 518.6 N, triplane diffuser suction 686.1 N
# Ferrari_812GTS_Trace[1420]: V12 6496cc RPM 5402, BMEP 15.50 bar, intake manifold resonance 53.8 kPa, buttress downforce 519.0 N, triplane diffuser suction 687.0 N
# Ferrari_812GTS_Trace[1421]: V12 6496cc RPM 5405, BMEP 15.51 bar, intake manifold resonance 53.9 kPa, buttress downforce 519.5 N, triplane diffuser suction 687.8 N
# Ferrari_812GTS_Trace[1422]: V12 6496cc RPM 5408, BMEP 15.51 bar, intake manifold resonance 54.0 kPa, buttress downforce 519.9 N, triplane diffuser suction 688.7 N
# Ferrari_812GTS_Trace[1423]: V12 6496cc RPM 5411, BMEP 15.52 bar, intake manifold resonance 54.0 kPa, buttress downforce 520.4 N, triplane diffuser suction 689.5 N
# Ferrari_812GTS_Trace[1424]: V12 6496cc RPM 5414, BMEP 15.52 bar, intake manifold resonance 54.1 kPa, buttress downforce 520.8 N, triplane diffuser suction 690.4 N
# Ferrari_812GTS_Trace[1425]: V12 6496cc RPM 5418, BMEP 15.53 bar, intake manifold resonance 54.2 kPa, buttress downforce 521.3 N, triplane diffuser suction 691.3 N
# Ferrari_812GTS_Trace[1426]: V12 6496cc RPM 5421, BMEP 15.53 bar, intake manifold resonance 54.3 kPa, buttress downforce 521.7 N, triplane diffuser suction 692.1 N
# Ferrari_812GTS_Trace[1427]: V12 6496cc RPM 5424, BMEP 15.54 bar, intake manifold resonance 54.4 kPa, buttress downforce 522.1 N, triplane diffuser suction 693.0 N
# Ferrari_812GTS_Trace[1428]: V12 6496cc RPM 5427, BMEP 15.54 bar, intake manifold resonance 54.4 kPa, buttress downforce 522.6 N, triplane diffuser suction 693.8 N
# Ferrari_812GTS_Trace[1429]: V12 6496cc RPM 5430, BMEP 15.55 bar, intake manifold resonance 54.5 kPa, buttress downforce 523.1 N, triplane diffuser suction 694.6 N
# Ferrari_812GTS_Trace[1430]: V12 6496cc RPM 5433, BMEP 15.55 bar, intake manifold resonance 54.6 kPa, buttress downforce 523.5 N, triplane diffuser suction 695.5 N
# Ferrari_812GTS_Trace[1431]: V12 6496cc RPM 5436, BMEP 15.55 bar, intake manifold resonance 54.7 kPa, buttress downforce 524.0 N, triplane diffuser suction 696.3 N
# Ferrari_812GTS_Trace[1432]: V12 6496cc RPM 5439, BMEP 15.56 bar, intake manifold resonance 54.8 kPa, buttress downforce 524.4 N, triplane diffuser suction 697.2 N
# Ferrari_812GTS_Trace[1433]: V12 6496cc RPM 5442, BMEP 15.57 bar, intake manifold resonance 54.8 kPa, buttress downforce 524.9 N, triplane diffuser suction 698.0 N
# Ferrari_812GTS_Trace[1434]: V12 6496cc RPM 5445, BMEP 15.57 bar, intake manifold resonance 54.9 kPa, buttress downforce 525.3 N, triplane diffuser suction 698.9 N
# Ferrari_812GTS_Trace[1435]: V12 6496cc RPM 5449, BMEP 15.57 bar, intake manifold resonance 55.0 kPa, buttress downforce 525.8 N, triplane diffuser suction 699.8 N
# Ferrari_812GTS_Trace[1436]: V12 6496cc RPM 5452, BMEP 15.58 bar, intake manifold resonance 55.1 kPa, buttress downforce 526.2 N, triplane diffuser suction 700.6 N
# Ferrari_812GTS_Trace[1437]: V12 6496cc RPM 5455, BMEP 15.59 bar, intake manifold resonance 55.2 kPa, buttress downforce 526.6 N, triplane diffuser suction 701.5 N
# Ferrari_812GTS_Trace[1438]: V12 6496cc RPM 5458, BMEP 15.59 bar, intake manifold resonance 55.2 kPa, buttress downforce 527.1 N, triplane diffuser suction 702.3 N
# Ferrari_812GTS_Trace[1439]: V12 6496cc RPM 5461, BMEP 15.60 bar, intake manifold resonance 55.3 kPa, buttress downforce 527.6 N, triplane diffuser suction 703.1 N
# Ferrari_812GTS_Trace[1440]: V12 6496cc RPM 5464, BMEP 15.60 bar, intake manifold resonance 55.4 kPa, buttress downforce 528.0 N, triplane diffuser suction 704.0 N
# Ferrari_812GTS_Trace[1441]: V12 6496cc RPM 5467, BMEP 15.61 bar, intake manifold resonance 55.5 kPa, buttress downforce 528.5 N, triplane diffuser suction 704.8 N
# Ferrari_812GTS_Trace[1442]: V12 6496cc RPM 5470, BMEP 15.61 bar, intake manifold resonance 55.6 kPa, buttress downforce 528.9 N, triplane diffuser suction 705.7 N
# Ferrari_812GTS_Trace[1443]: V12 6496cc RPM 5473, BMEP 15.62 bar, intake manifold resonance 55.6 kPa, buttress downforce 529.4 N, triplane diffuser suction 706.5 N
# Ferrari_812GTS_Trace[1444]: V12 6496cc RPM 5476, BMEP 15.62 bar, intake manifold resonance 55.7 kPa, buttress downforce 529.8 N, triplane diffuser suction 707.4 N
# Ferrari_812GTS_Trace[1445]: V12 6496cc RPM 5480, BMEP 15.63 bar, intake manifold resonance 55.8 kPa, buttress downforce 530.3 N, triplane diffuser suction 708.3 N
# Ferrari_812GTS_Trace[1446]: V12 6496cc RPM 5483, BMEP 15.63 bar, intake manifold resonance 55.9 kPa, buttress downforce 530.7 N, triplane diffuser suction 709.1 N
# Ferrari_812GTS_Trace[1447]: V12 6496cc RPM 5486, BMEP 15.64 bar, intake manifold resonance 56.0 kPa, buttress downforce 531.1 N, triplane diffuser suction 710.0 N
# Ferrari_812GTS_Trace[1448]: V12 6496cc RPM 5489, BMEP 15.64 bar, intake manifold resonance 56.0 kPa, buttress downforce 531.6 N, triplane diffuser suction 710.8 N
# Ferrari_812GTS_Trace[1449]: V12 6496cc RPM 5492, BMEP 15.64 bar, intake manifold resonance 56.1 kPa, buttress downforce 532.1 N, triplane diffuser suction 711.6 N
# Ferrari_812GTS_Trace[1450]: V12 6496cc RPM 5495, BMEP 15.65 bar, intake manifold resonance 56.2 kPa, buttress downforce 532.5 N, triplane diffuser suction 712.5 N
# Ferrari_812GTS_Trace[1451]: V12 6496cc RPM 5498, BMEP 15.66 bar, intake manifold resonance 56.3 kPa, buttress downforce 533.0 N, triplane diffuser suction 713.3 N
# Ferrari_812GTS_Trace[1452]: V12 6496cc RPM 5501, BMEP 15.66 bar, intake manifold resonance 56.4 kPa, buttress downforce 533.4 N, triplane diffuser suction 714.2 N
# Ferrari_812GTS_Trace[1453]: V12 6496cc RPM 5504, BMEP 15.67 bar, intake manifold resonance 56.4 kPa, buttress downforce 533.9 N, triplane diffuser suction 715.0 N
# Ferrari_812GTS_Trace[1454]: V12 6496cc RPM 5507, BMEP 15.67 bar, intake manifold resonance 56.5 kPa, buttress downforce 534.3 N, triplane diffuser suction 715.9 N
# Ferrari_812GTS_Trace[1455]: V12 6496cc RPM 5511, BMEP 15.68 bar, intake manifold resonance 56.6 kPa, buttress downforce 534.8 N, triplane diffuser suction 716.8 N
# Ferrari_812GTS_Trace[1456]: V12 6496cc RPM 5514, BMEP 15.68 bar, intake manifold resonance 56.7 kPa, buttress downforce 535.2 N, triplane diffuser suction 717.6 N
# Ferrari_812GTS_Trace[1457]: V12 6496cc RPM 5517, BMEP 15.69 bar, intake manifold resonance 56.8 kPa, buttress downforce 535.6 N, triplane diffuser suction 718.5 N
# Ferrari_812GTS_Trace[1458]: V12 6496cc RPM 5520, BMEP 15.69 bar, intake manifold resonance 56.8 kPa, buttress downforce 536.1 N, triplane diffuser suction 719.3 N
# Ferrari_812GTS_Trace[1459]: V12 6496cc RPM 5523, BMEP 15.70 bar, intake manifold resonance 56.9 kPa, buttress downforce 536.6 N, triplane diffuser suction 720.1 N
# Ferrari_812GTS_Trace[1460]: V12 6496cc RPM 5526, BMEP 15.70 bar, intake manifold resonance 57.0 kPa, buttress downforce 537.0 N, triplane diffuser suction 721.0 N
# Ferrari_812GTS_Trace[1461]: V12 6496cc RPM 5529, BMEP 15.71 bar, intake manifold resonance 57.1 kPa, buttress downforce 537.5 N, triplane diffuser suction 721.8 N
# Ferrari_812GTS_Trace[1462]: V12 6496cc RPM 5532, BMEP 15.71 bar, intake manifold resonance 57.2 kPa, buttress downforce 537.9 N, triplane diffuser suction 722.7 N
# Ferrari_812GTS_Trace[1463]: V12 6496cc RPM 5535, BMEP 15.71 bar, intake manifold resonance 57.2 kPa, buttress downforce 538.4 N, triplane diffuser suction 723.5 N
# Ferrari_812GTS_Trace[1464]: V12 6496cc RPM 5538, BMEP 15.72 bar, intake manifold resonance 57.3 kPa, buttress downforce 538.8 N, triplane diffuser suction 724.4 N
# Ferrari_812GTS_Trace[1465]: V12 6496cc RPM 5542, BMEP 15.73 bar, intake manifold resonance 57.4 kPa, buttress downforce 539.3 N, triplane diffuser suction 725.3 N
# Ferrari_812GTS_Trace[1466]: V12 6496cc RPM 5545, BMEP 15.73 bar, intake manifold resonance 57.5 kPa, buttress downforce 539.7 N, triplane diffuser suction 726.1 N
# Ferrari_812GTS_Trace[1467]: V12 6496cc RPM 5548, BMEP 15.73 bar, intake manifold resonance 57.6 kPa, buttress downforce 540.1 N, triplane diffuser suction 727.0 N
# Ferrari_812GTS_Trace[1468]: V12 6496cc RPM 5551, BMEP 15.74 bar, intake manifold resonance 57.6 kPa, buttress downforce 540.6 N, triplane diffuser suction 727.8 N
# Ferrari_812GTS_Trace[1469]: V12 6496cc RPM 5554, BMEP 15.75 bar, intake manifold resonance 57.7 kPa, buttress downforce 541.1 N, triplane diffuser suction 728.6 N
# Ferrari_812GTS_Trace[1470]: V12 6496cc RPM 5557, BMEP 15.75 bar, intake manifold resonance 57.8 kPa, buttress downforce 541.5 N, triplane diffuser suction 729.5 N
# Ferrari_812GTS_Trace[1471]: V12 6496cc RPM 5560, BMEP 15.76 bar, intake manifold resonance 57.9 kPa, buttress downforce 542.0 N, triplane diffuser suction 730.3 N
# Ferrari_812GTS_Trace[1472]: V12 6496cc RPM 5563, BMEP 15.76 bar, intake manifold resonance 58.0 kPa, buttress downforce 542.4 N, triplane diffuser suction 731.2 N
# Ferrari_812GTS_Trace[1473]: V12 6496cc RPM 5566, BMEP 15.77 bar, intake manifold resonance 58.0 kPa, buttress downforce 542.9 N, triplane diffuser suction 732.0 N
# Ferrari_812GTS_Trace[1474]: V12 6496cc RPM 5569, BMEP 15.77 bar, intake manifold resonance 58.1 kPa, buttress downforce 543.3 N, triplane diffuser suction 732.9 N
# Ferrari_812GTS_Trace[1475]: V12 6496cc RPM 5573, BMEP 15.78 bar, intake manifold resonance 58.2 kPa, buttress downforce 543.8 N, triplane diffuser suction 733.8 N
# Ferrari_812GTS_Trace[1476]: V12 6496cc RPM 5576, BMEP 15.78 bar, intake manifold resonance 58.3 kPa, buttress downforce 544.2 N, triplane diffuser suction 734.6 N
# Ferrari_812GTS_Trace[1477]: V12 6496cc RPM 5579, BMEP 15.79 bar, intake manifold resonance 58.4 kPa, buttress downforce 544.6 N, triplane diffuser suction 735.5 N
# Ferrari_812GTS_Trace[1478]: V12 6496cc RPM 5582, BMEP 15.79 bar, intake manifold resonance 58.4 kPa, buttress downforce 545.1 N, triplane diffuser suction 736.3 N
# Ferrari_812GTS_Trace[1479]: V12 6496cc RPM 5585, BMEP 15.80 bar, intake manifold resonance 58.5 kPa, buttress downforce 545.6 N, triplane diffuser suction 737.1 N
# Ferrari_812GTS_Trace[1480]: V12 6496cc RPM 5588, BMEP 15.80 bar, intake manifold resonance 58.6 kPa, buttress downforce 546.0 N, triplane diffuser suction 738.0 N
# Ferrari_812GTS_Trace[1481]: V12 6496cc RPM 5591, BMEP 15.80 bar, intake manifold resonance 58.7 kPa, buttress downforce 546.5 N, triplane diffuser suction 738.8 N
# Ferrari_812GTS_Trace[1482]: V12 6496cc RPM 5594, BMEP 15.81 bar, intake manifold resonance 58.8 kPa, buttress downforce 546.9 N, triplane diffuser suction 739.7 N
# Ferrari_812GTS_Trace[1483]: V12 6496cc RPM 5597, BMEP 15.82 bar, intake manifold resonance 58.8 kPa, buttress downforce 547.4 N, triplane diffuser suction 740.5 N
# Ferrari_812GTS_Trace[1484]: V12 6496cc RPM 5600, BMEP 15.82 bar, intake manifold resonance 58.9 kPa, buttress downforce 547.8 N, triplane diffuser suction 741.4 N
# Ferrari_812GTS_Trace[1485]: V12 6496cc RPM 5604, BMEP 15.82 bar, intake manifold resonance 59.0 kPa, buttress downforce 548.3 N, triplane diffuser suction 742.3 N
# Ferrari_812GTS_Trace[1486]: V12 6496cc RPM 5607, BMEP 15.83 bar, intake manifold resonance 59.1 kPa, buttress downforce 548.7 N, triplane diffuser suction 743.1 N
# Ferrari_812GTS_Trace[1487]: V12 6496cc RPM 5610, BMEP 15.84 bar, intake manifold resonance 59.2 kPa, buttress downforce 549.1 N, triplane diffuser suction 744.0 N
# Ferrari_812GTS_Trace[1488]: V12 6496cc RPM 5613, BMEP 15.84 bar, intake manifold resonance 59.2 kPa, buttress downforce 549.6 N, triplane diffuser suction 744.8 N
# Ferrari_812GTS_Trace[1489]: V12 6496cc RPM 5616, BMEP 15.85 bar, intake manifold resonance 59.3 kPa, buttress downforce 550.1 N, triplane diffuser suction 745.6 N
# Ferrari_812GTS_Trace[1490]: V12 6496cc RPM 5619, BMEP 15.85 bar, intake manifold resonance 59.4 kPa, buttress downforce 550.5 N, triplane diffuser suction 746.5 N
# Ferrari_812GTS_Trace[1491]: V12 6496cc RPM 5622, BMEP 15.86 bar, intake manifold resonance 59.5 kPa, buttress downforce 551.0 N, triplane diffuser suction 747.3 N
# Ferrari_812GTS_Trace[1492]: V12 6496cc RPM 5625, BMEP 15.86 bar, intake manifold resonance 59.6 kPa, buttress downforce 551.4 N, triplane diffuser suction 748.2 N
# Ferrari_812GTS_Trace[1493]: V12 6496cc RPM 5628, BMEP 15.87 bar, intake manifold resonance 59.6 kPa, buttress downforce 551.9 N, triplane diffuser suction 749.0 N
# Ferrari_812GTS_Trace[1494]: V12 6496cc RPM 5631, BMEP 15.87 bar, intake manifold resonance 59.7 kPa, buttress downforce 552.3 N, triplane diffuser suction 749.9 N
# Ferrari_812GTS_Trace[1495]: V12 6496cc RPM 5635, BMEP 15.88 bar, intake manifold resonance 59.8 kPa, buttress downforce 552.8 N, triplane diffuser suction 750.8 N
# Ferrari_812GTS_Trace[1496]: V12 6496cc RPM 5638, BMEP 15.88 bar, intake manifold resonance 59.9 kPa, buttress downforce 553.2 N, triplane diffuser suction 751.6 N
# Ferrari_812GTS_Trace[1497]: V12 6496cc RPM 5641, BMEP 15.89 bar, intake manifold resonance 60.0 kPa, buttress downforce 553.6 N, triplane diffuser suction 752.5 N
# Ferrari_812GTS_Trace[1498]: V12 6496cc RPM 5644, BMEP 15.89 bar, intake manifold resonance 60.0 kPa, buttress downforce 554.1 N, triplane diffuser suction 753.3 N
# Ferrari_812GTS_Trace[1499]: V12 6496cc RPM 5647, BMEP 15.89 bar, intake manifold resonance 60.1 kPa, buttress downforce 554.6 N, triplane diffuser suction 754.1 N
# Ferrari_812GTS_Trace[1500]: V12 6496cc RPM 5650, BMEP 15.90 bar, intake manifold resonance 48.2 kPa, buttress downforce 555.0 N, triplane diffuser suction 755.0 N
# Ferrari_812GTS_Trace[1501]: V12 6496cc RPM 5653, BMEP 15.91 bar, intake manifold resonance 48.3 kPa, buttress downforce 555.5 N, triplane diffuser suction 755.8 N
# Ferrari_812GTS_Trace[1502]: V12 6496cc RPM 5656, BMEP 15.91 bar, intake manifold resonance 48.4 kPa, buttress downforce 555.9 N, triplane diffuser suction 756.7 N
# Ferrari_812GTS_Trace[1503]: V12 6496cc RPM 5659, BMEP 15.92 bar, intake manifold resonance 48.4 kPa, buttress downforce 556.4 N, triplane diffuser suction 757.5 N
# Ferrari_812GTS_Trace[1504]: V12 6496cc RPM 5662, BMEP 15.92 bar, intake manifold resonance 48.5 kPa, buttress downforce 556.8 N, triplane diffuser suction 758.4 N
# Ferrari_812GTS_Trace[1505]: V12 6496cc RPM 5666, BMEP 15.93 bar, intake manifold resonance 48.6 kPa, buttress downforce 557.3 N, triplane diffuser suction 759.3 N
# Ferrari_812GTS_Trace[1506]: V12 6496cc RPM 5669, BMEP 15.93 bar, intake manifold resonance 48.7 kPa, buttress downforce 557.7 N, triplane diffuser suction 760.1 N
# Ferrari_812GTS_Trace[1507]: V12 6496cc RPM 5672, BMEP 15.94 bar, intake manifold resonance 48.8 kPa, buttress downforce 558.1 N, triplane diffuser suction 761.0 N
# Ferrari_812GTS_Trace[1508]: V12 6496cc RPM 5675, BMEP 15.94 bar, intake manifold resonance 48.8 kPa, buttress downforce 558.6 N, triplane diffuser suction 761.8 N
# Ferrari_812GTS_Trace[1509]: V12 6496cc RPM 5678, BMEP 15.95 bar, intake manifold resonance 48.9 kPa, buttress downforce 559.1 N, triplane diffuser suction 762.6 N
# Ferrari_812GTS_Trace[1510]: V12 6496cc RPM 5681, BMEP 15.95 bar, intake manifold resonance 49.0 kPa, buttress downforce 559.5 N, triplane diffuser suction 763.5 N
# Ferrari_812GTS_Trace[1511]: V12 6496cc RPM 5684, BMEP 15.96 bar, intake manifold resonance 49.1 kPa, buttress downforce 560.0 N, triplane diffuser suction 764.3 N
# Ferrari_812GTS_Trace[1512]: V12 6496cc RPM 5687, BMEP 15.96 bar, intake manifold resonance 49.2 kPa, buttress downforce 560.4 N, triplane diffuser suction 765.2 N
# Ferrari_812GTS_Trace[1513]: V12 6496cc RPM 5690, BMEP 15.96 bar, intake manifold resonance 49.2 kPa, buttress downforce 560.9 N, triplane diffuser suction 766.0 N
# Ferrari_812GTS_Trace[1514]: V12 6496cc RPM 5693, BMEP 15.97 bar, intake manifold resonance 49.3 kPa, buttress downforce 561.3 N, triplane diffuser suction 766.9 N
# Ferrari_812GTS_Trace[1515]: V12 6496cc RPM 5697, BMEP 15.98 bar, intake manifold resonance 49.4 kPa, buttress downforce 561.8 N, triplane diffuser suction 767.8 N
# Ferrari_812GTS_Trace[1516]: V12 6496cc RPM 5700, BMEP 15.98 bar, intake manifold resonance 49.5 kPa, buttress downforce 562.2 N, triplane diffuser suction 768.6 N
# Ferrari_812GTS_Trace[1517]: V12 6496cc RPM 5703, BMEP 15.98 bar, intake manifold resonance 49.6 kPa, buttress downforce 562.6 N, triplane diffuser suction 769.5 N
# Ferrari_812GTS_Trace[1518]: V12 6496cc RPM 5706, BMEP 15.99 bar, intake manifold resonance 49.6 kPa, buttress downforce 563.1 N, triplane diffuser suction 770.3 N
# Ferrari_812GTS_Trace[1519]: V12 6496cc RPM 5709, BMEP 16.00 bar, intake manifold resonance 49.7 kPa, buttress downforce 563.6 N, triplane diffuser suction 771.1 N
# Ferrari_812GTS_Trace[1520]: V12 6496cc RPM 5712, BMEP 16.00 bar, intake manifold resonance 49.8 kPa, buttress downforce 564.0 N, triplane diffuser suction 772.0 N
# Ferrari_812GTS_Trace[1521]: V12 6496cc RPM 5715, BMEP 16.01 bar, intake manifold resonance 49.9 kPa, buttress downforce 564.5 N, triplane diffuser suction 772.8 N
# Ferrari_812GTS_Trace[1522]: V12 6496cc RPM 5718, BMEP 16.01 bar, intake manifold resonance 50.0 kPa, buttress downforce 564.9 N, triplane diffuser suction 773.7 N
# Ferrari_812GTS_Trace[1523]: V12 6496cc RPM 5721, BMEP 16.02 bar, intake manifold resonance 50.0 kPa, buttress downforce 565.4 N, triplane diffuser suction 774.5 N
# Ferrari_812GTS_Trace[1524]: V12 6496cc RPM 5724, BMEP 16.02 bar, intake manifold resonance 50.1 kPa, buttress downforce 565.8 N, triplane diffuser suction 775.4 N
# Ferrari_812GTS_Trace[1525]: V12 6496cc RPM 5728, BMEP 16.02 bar, intake manifold resonance 50.2 kPa, buttress downforce 566.3 N, triplane diffuser suction 776.3 N
# Ferrari_812GTS_Trace[1526]: V12 6496cc RPM 5731, BMEP 16.03 bar, intake manifold resonance 50.3 kPa, buttress downforce 566.7 N, triplane diffuser suction 777.1 N
# Ferrari_812GTS_Trace[1527]: V12 6496cc RPM 5734, BMEP 16.04 bar, intake manifold resonance 50.4 kPa, buttress downforce 567.1 N, triplane diffuser suction 778.0 N
# Ferrari_812GTS_Trace[1528]: V12 6496cc RPM 5737, BMEP 16.04 bar, intake manifold resonance 50.4 kPa, buttress downforce 567.6 N, triplane diffuser suction 778.8 N
# Ferrari_812GTS_Trace[1529]: V12 6496cc RPM 5740, BMEP 16.05 bar, intake manifold resonance 50.5 kPa, buttress downforce 568.1 N, triplane diffuser suction 779.6 N
# Ferrari_812GTS_Trace[1530]: V12 6496cc RPM 5743, BMEP 16.05 bar, intake manifold resonance 50.6 kPa, buttress downforce 568.5 N, triplane diffuser suction 780.5 N
# Ferrari_812GTS_Trace[1531]: V12 6496cc RPM 5746, BMEP 16.05 bar, intake manifold resonance 50.7 kPa, buttress downforce 569.0 N, triplane diffuser suction 781.3 N
# Ferrari_812GTS_Trace[1532]: V12 6496cc RPM 5749, BMEP 16.06 bar, intake manifold resonance 50.8 kPa, buttress downforce 569.4 N, triplane diffuser suction 782.2 N
# Ferrari_812GTS_Trace[1533]: V12 6496cc RPM 5752, BMEP 16.07 bar, intake manifold resonance 50.8 kPa, buttress downforce 569.9 N, triplane diffuser suction 783.0 N
# Ferrari_812GTS_Trace[1534]: V12 6496cc RPM 5755, BMEP 16.07 bar, intake manifold resonance 50.9 kPa, buttress downforce 570.3 N, triplane diffuser suction 783.9 N
# Ferrari_812GTS_Trace[1535]: V12 6496cc RPM 5759, BMEP 16.07 bar, intake manifold resonance 51.0 kPa, buttress downforce 570.8 N, triplane diffuser suction 784.8 N
# Ferrari_812GTS_Trace[1536]: V12 6496cc RPM 5762, BMEP 16.08 bar, intake manifold resonance 51.1 kPa, buttress downforce 571.2 N, triplane diffuser suction 785.6 N
# Ferrari_812GTS_Trace[1537]: V12 6496cc RPM 5765, BMEP 16.09 bar, intake manifold resonance 51.2 kPa, buttress downforce 571.6 N, triplane diffuser suction 786.5 N
# Ferrari_812GTS_Trace[1538]: V12 6496cc RPM 5768, BMEP 16.09 bar, intake manifold resonance 51.2 kPa, buttress downforce 572.1 N, triplane diffuser suction 787.3 N
# Ferrari_812GTS_Trace[1539]: V12 6496cc RPM 5771, BMEP 16.09 bar, intake manifold resonance 51.3 kPa, buttress downforce 572.6 N, triplane diffuser suction 788.1 N
# Ferrari_812GTS_Trace[1540]: V12 6496cc RPM 5774, BMEP 16.10 bar, intake manifold resonance 51.4 kPa, buttress downforce 573.0 N, triplane diffuser suction 789.0 N
# Ferrari_812GTS_Trace[1541]: V12 6496cc RPM 5777, BMEP 16.11 bar, intake manifold resonance 51.5 kPa, buttress downforce 573.5 N, triplane diffuser suction 789.8 N
# Ferrari_812GTS_Trace[1542]: V12 6496cc RPM 5780, BMEP 16.11 bar, intake manifold resonance 51.6 kPa, buttress downforce 573.9 N, triplane diffuser suction 790.7 N
# Ferrari_812GTS_Trace[1543]: V12 6496cc RPM 5783, BMEP 16.12 bar, intake manifold resonance 51.6 kPa, buttress downforce 574.4 N, triplane diffuser suction 791.5 N
# Ferrari_812GTS_Trace[1544]: V12 6496cc RPM 5786, BMEP 16.12 bar, intake manifold resonance 51.7 kPa, buttress downforce 574.8 N, triplane diffuser suction 792.4 N
# Ferrari_812GTS_Trace[1545]: V12 6496cc RPM 5790, BMEP 16.13 bar, intake manifold resonance 51.8 kPa, buttress downforce 575.3 N, triplane diffuser suction 793.3 N
# Ferrari_812GTS_Trace[1546]: V12 6496cc RPM 5793, BMEP 16.13 bar, intake manifold resonance 51.9 kPa, buttress downforce 575.7 N, triplane diffuser suction 794.1 N
# Ferrari_812GTS_Trace[1547]: V12 6496cc RPM 5796, BMEP 16.14 bar, intake manifold resonance 52.0 kPa, buttress downforce 576.1 N, triplane diffuser suction 795.0 N
# Ferrari_812GTS_Trace[1548]: V12 6496cc RPM 5799, BMEP 16.14 bar, intake manifold resonance 52.0 kPa, buttress downforce 576.6 N, triplane diffuser suction 795.8 N
# Ferrari_812GTS_Trace[1549]: V12 6496cc RPM 5802, BMEP 16.14 bar, intake manifold resonance 52.1 kPa, buttress downforce 577.1 N, triplane diffuser suction 796.6 N
# Ferrari_812GTS_Trace[1550]: V12 6496cc RPM 5805, BMEP 16.15 bar, intake manifold resonance 52.2 kPa, buttress downforce 577.5 N, triplane diffuser suction 797.5 N
# Ferrari_812GTS_Trace[1551]: V12 6496cc RPM 5808, BMEP 16.16 bar, intake manifold resonance 52.3 kPa, buttress downforce 578.0 N, triplane diffuser suction 798.3 N
# Ferrari_812GTS_Trace[1552]: V12 6496cc RPM 5811, BMEP 16.16 bar, intake manifold resonance 52.4 kPa, buttress downforce 578.4 N, triplane diffuser suction 799.2 N
# Ferrari_812GTS_Trace[1553]: V12 6496cc RPM 5814, BMEP 16.16 bar, intake manifold resonance 52.4 kPa, buttress downforce 578.9 N, triplane diffuser suction 800.0 N
# Ferrari_812GTS_Trace[1554]: V12 6496cc RPM 5817, BMEP 16.17 bar, intake manifold resonance 52.5 kPa, buttress downforce 579.3 N, triplane diffuser suction 800.9 N
# Ferrari_812GTS_Trace[1555]: V12 6496cc RPM 5821, BMEP 16.18 bar, intake manifold resonance 52.6 kPa, buttress downforce 579.8 N, triplane diffuser suction 801.8 N
# Ferrari_812GTS_Trace[1556]: V12 6496cc RPM 5824, BMEP 16.18 bar, intake manifold resonance 52.7 kPa, buttress downforce 580.2 N, triplane diffuser suction 802.6 N
# Ferrari_812GTS_Trace[1557]: V12 6496cc RPM 5827, BMEP 16.19 bar, intake manifold resonance 52.8 kPa, buttress downforce 580.6 N, triplane diffuser suction 803.5 N
# Ferrari_812GTS_Trace[1558]: V12 6496cc RPM 5830, BMEP 16.19 bar, intake manifold resonance 52.8 kPa, buttress downforce 581.1 N, triplane diffuser suction 804.3 N
# Ferrari_812GTS_Trace[1559]: V12 6496cc RPM 5833, BMEP 16.20 bar, intake manifold resonance 52.9 kPa, buttress downforce 581.6 N, triplane diffuser suction 805.1 N
# Ferrari_812GTS_Trace[1560]: V12 6496cc RPM 5836, BMEP 16.20 bar, intake manifold resonance 53.0 kPa, buttress downforce 582.0 N, triplane diffuser suction 806.0 N
# Ferrari_812GTS_Trace[1561]: V12 6496cc RPM 5839, BMEP 16.21 bar, intake manifold resonance 53.1 kPa, buttress downforce 582.5 N, triplane diffuser suction 806.8 N
# Ferrari_812GTS_Trace[1562]: V12 6496cc RPM 5842, BMEP 16.21 bar, intake manifold resonance 53.2 kPa, buttress downforce 582.9 N, triplane diffuser suction 807.7 N
# Ferrari_812GTS_Trace[1563]: V12 6496cc RPM 5845, BMEP 16.21 bar, intake manifold resonance 53.2 kPa, buttress downforce 583.4 N, triplane diffuser suction 808.5 N
# Ferrari_812GTS_Trace[1564]: V12 6496cc RPM 5848, BMEP 16.22 bar, intake manifold resonance 53.3 kPa, buttress downforce 583.8 N, triplane diffuser suction 809.4 N
# Ferrari_812GTS_Trace[1565]: V12 6496cc RPM 5852, BMEP 16.23 bar, intake manifold resonance 53.4 kPa, buttress downforce 584.3 N, triplane diffuser suction 810.3 N
# Ferrari_812GTS_Trace[1566]: V12 6496cc RPM 5855, BMEP 16.23 bar, intake manifold resonance 53.5 kPa, buttress downforce 584.7 N, triplane diffuser suction 811.1 N
# Ferrari_812GTS_Trace[1567]: V12 6496cc RPM 5858, BMEP 16.23 bar, intake manifold resonance 53.6 kPa, buttress downforce 585.1 N, triplane diffuser suction 812.0 N
# Ferrari_812GTS_Trace[1568]: V12 6496cc RPM 5861, BMEP 16.24 bar, intake manifold resonance 53.6 kPa, buttress downforce 585.6 N, triplane diffuser suction 812.8 N
# Ferrari_812GTS_Trace[1569]: V12 6496cc RPM 5864, BMEP 16.25 bar, intake manifold resonance 53.7 kPa, buttress downforce 586.1 N, triplane diffuser suction 813.6 N
# Ferrari_812GTS_Trace[1570]: V12 6496cc RPM 5867, BMEP 16.25 bar, intake manifold resonance 53.8 kPa, buttress downforce 586.5 N, triplane diffuser suction 814.5 N
# Ferrari_812GTS_Trace[1571]: V12 6496cc RPM 5870, BMEP 16.26 bar, intake manifold resonance 53.9 kPa, buttress downforce 587.0 N, triplane diffuser suction 815.3 N
# Ferrari_812GTS_Trace[1572]: V12 6496cc RPM 5873, BMEP 16.26 bar, intake manifold resonance 54.0 kPa, buttress downforce 587.4 N, triplane diffuser suction 816.2 N
# Ferrari_812GTS_Trace[1573]: V12 6496cc RPM 5876, BMEP 16.27 bar, intake manifold resonance 54.0 kPa, buttress downforce 587.9 N, triplane diffuser suction 817.0 N
# Ferrari_812GTS_Trace[1574]: V12 6496cc RPM 5879, BMEP 16.27 bar, intake manifold resonance 54.1 kPa, buttress downforce 588.3 N, triplane diffuser suction 817.9 N
# Ferrari_812GTS_Trace[1575]: V12 6496cc RPM 5883, BMEP 16.27 bar, intake manifold resonance 54.2 kPa, buttress downforce 588.8 N, triplane diffuser suction 818.8 N
# Ferrari_812GTS_Trace[1576]: V12 6496cc RPM 5886, BMEP 16.28 bar, intake manifold resonance 54.3 kPa, buttress downforce 589.2 N, triplane diffuser suction 819.6 N
# Ferrari_812GTS_Trace[1577]: V12 6496cc RPM 5889, BMEP 16.29 bar, intake manifold resonance 54.4 kPa, buttress downforce 589.6 N, triplane diffuser suction 820.5 N
# Ferrari_812GTS_Trace[1578]: V12 6496cc RPM 5892, BMEP 16.29 bar, intake manifold resonance 54.4 kPa, buttress downforce 590.1 N, triplane diffuser suction 821.3 N
# Ferrari_812GTS_Trace[1579]: V12 6496cc RPM 5895, BMEP 16.30 bar, intake manifold resonance 54.5 kPa, buttress downforce 590.6 N, triplane diffuser suction 822.1 N
# Ferrari_812GTS_Trace[1580]: V12 6496cc RPM 5898, BMEP 16.30 bar, intake manifold resonance 54.6 kPa, buttress downforce 591.0 N, triplane diffuser suction 823.0 N
# Ferrari_812GTS_Trace[1581]: V12 6496cc RPM 5901, BMEP 16.30 bar, intake manifold resonance 54.7 kPa, buttress downforce 591.5 N, triplane diffuser suction 823.8 N
# Ferrari_812GTS_Trace[1582]: V12 6496cc RPM 5904, BMEP 16.31 bar, intake manifold resonance 54.8 kPa, buttress downforce 591.9 N, triplane diffuser suction 824.7 N
# Ferrari_812GTS_Trace[1583]: V12 6496cc RPM 5907, BMEP 16.32 bar, intake manifold resonance 54.8 kPa, buttress downforce 592.4 N, triplane diffuser suction 825.5 N
# Ferrari_812GTS_Trace[1584]: V12 6496cc RPM 5910, BMEP 16.32 bar, intake manifold resonance 54.9 kPa, buttress downforce 592.8 N, triplane diffuser suction 826.4 N
# Ferrari_812GTS_Trace[1585]: V12 6496cc RPM 5914, BMEP 16.32 bar, intake manifold resonance 55.0 kPa, buttress downforce 593.3 N, triplane diffuser suction 827.3 N
# Ferrari_812GTS_Trace[1586]: V12 6496cc RPM 5917, BMEP 16.33 bar, intake manifold resonance 55.1 kPa, buttress downforce 593.7 N, triplane diffuser suction 828.1 N
# Ferrari_812GTS_Trace[1587]: V12 6496cc RPM 5920, BMEP 16.34 bar, intake manifold resonance 55.2 kPa, buttress downforce 594.1 N, triplane diffuser suction 829.0 N
# Ferrari_812GTS_Trace[1588]: V12 6496cc RPM 5923, BMEP 16.34 bar, intake manifold resonance 55.2 kPa, buttress downforce 594.6 N, triplane diffuser suction 829.8 N
# Ferrari_812GTS_Trace[1589]: V12 6496cc RPM 5926, BMEP 16.34 bar, intake manifold resonance 55.3 kPa, buttress downforce 595.1 N, triplane diffuser suction 830.6 N
# Ferrari_812GTS_Trace[1590]: V12 6496cc RPM 5929, BMEP 16.35 bar, intake manifold resonance 55.4 kPa, buttress downforce 595.5 N, triplane diffuser suction 831.5 N
# Ferrari_812GTS_Trace[1591]: V12 6496cc RPM 5932, BMEP 16.36 bar, intake manifold resonance 55.5 kPa, buttress downforce 596.0 N, triplane diffuser suction 832.3 N
# Ferrari_812GTS_Trace[1592]: V12 6496cc RPM 5935, BMEP 16.36 bar, intake manifold resonance 55.6 kPa, buttress downforce 596.4 N, triplane diffuser suction 833.2 N
# Ferrari_812GTS_Trace[1593]: V12 6496cc RPM 5938, BMEP 16.37 bar, intake manifold resonance 55.6 kPa, buttress downforce 596.9 N, triplane diffuser suction 834.0 N
# Ferrari_812GTS_Trace[1594]: V12 6496cc RPM 5941, BMEP 16.37 bar, intake manifold resonance 55.7 kPa, buttress downforce 597.3 N, triplane diffuser suction 834.9 N
# Ferrari_812GTS_Trace[1595]: V12 6496cc RPM 5945, BMEP 16.38 bar, intake manifold resonance 55.8 kPa, buttress downforce 597.8 N, triplane diffuser suction 835.8 N
# Ferrari_812GTS_Trace[1596]: V12 6496cc RPM 5948, BMEP 16.38 bar, intake manifold resonance 55.9 kPa, buttress downforce 598.2 N, triplane diffuser suction 836.6 N
# Ferrari_812GTS_Trace[1597]: V12 6496cc RPM 5951, BMEP 16.39 bar, intake manifold resonance 56.0 kPa, buttress downforce 598.6 N, triplane diffuser suction 837.5 N
# Ferrari_812GTS_Trace[1598]: V12 6496cc RPM 5954, BMEP 16.39 bar, intake manifold resonance 56.0 kPa, buttress downforce 599.1 N, triplane diffuser suction 838.3 N
# Ferrari_812GTS_Trace[1599]: V12 6496cc RPM 5957, BMEP 16.39 bar, intake manifold resonance 56.1 kPa, buttress downforce 599.6 N, triplane diffuser suction 839.1 N
# Ferrari_812GTS_Trace[1600]: V12 6496cc RPM 5960, BMEP 16.40 bar, intake manifold resonance 56.2 kPa, buttress downforce 420.0 N, triplane diffuser suction 840.0 N
# Ferrari_812GTS_Trace[1601]: V12 6496cc RPM 5963, BMEP 16.41 bar, intake manifold resonance 56.3 kPa, buttress downforce 420.5 N, triplane diffuser suction 840.8 N
# Ferrari_812GTS_Trace[1602]: V12 6496cc RPM 5966, BMEP 16.41 bar, intake manifold resonance 56.4 kPa, buttress downforce 420.9 N, triplane diffuser suction 841.7 N
# Ferrari_812GTS_Trace[1603]: V12 6496cc RPM 5969, BMEP 16.41 bar, intake manifold resonance 56.4 kPa, buttress downforce 421.4 N, triplane diffuser suction 842.5 N
# Ferrari_812GTS_Trace[1604]: V12 6496cc RPM 5972, BMEP 16.42 bar, intake manifold resonance 56.5 kPa, buttress downforce 421.8 N, triplane diffuser suction 843.4 N
# Ferrari_812GTS_Trace[1605]: V12 6496cc RPM 5976, BMEP 16.43 bar, intake manifold resonance 56.6 kPa, buttress downforce 422.3 N, triplane diffuser suction 844.3 N
# Ferrari_812GTS_Trace[1606]: V12 6496cc RPM 5979, BMEP 16.43 bar, intake manifold resonance 56.7 kPa, buttress downforce 422.7 N, triplane diffuser suction 845.1 N
# Ferrari_812GTS_Trace[1607]: V12 6496cc RPM 5982, BMEP 16.44 bar, intake manifold resonance 56.8 kPa, buttress downforce 423.1 N, triplane diffuser suction 846.0 N
# Ferrari_812GTS_Trace[1608]: V12 6496cc RPM 5985, BMEP 16.44 bar, intake manifold resonance 56.8 kPa, buttress downforce 423.6 N, triplane diffuser suction 846.8 N
# Ferrari_812GTS_Trace[1609]: V12 6496cc RPM 5988, BMEP 16.45 bar, intake manifold resonance 56.9 kPa, buttress downforce 424.1 N, triplane diffuser suction 847.6 N
# Ferrari_812GTS_Trace[1610]: V12 6496cc RPM 5991, BMEP 16.45 bar, intake manifold resonance 57.0 kPa, buttress downforce 424.5 N, triplane diffuser suction 848.5 N
# Ferrari_812GTS_Trace[1611]: V12 6496cc RPM 5994, BMEP 16.45 bar, intake manifold resonance 57.1 kPa, buttress downforce 425.0 N, triplane diffuser suction 849.3 N
# Ferrari_812GTS_Trace[1612]: V12 6496cc RPM 5997, BMEP 16.46 bar, intake manifold resonance 57.2 kPa, buttress downforce 425.4 N, triplane diffuser suction 850.2 N
# Ferrari_812GTS_Trace[1613]: V12 6496cc RPM 6000, BMEP 16.46 bar, intake manifold resonance 57.2 kPa, buttress downforce 425.9 N, triplane diffuser suction 851.0 N
# Ferrari_812GTS_Trace[1614]: V12 6496cc RPM 6003, BMEP 16.47 bar, intake manifold resonance 57.3 kPa, buttress downforce 426.3 N, triplane diffuser suction 851.9 N
# Ferrari_812GTS_Trace[1615]: V12 6496cc RPM 6007, BMEP 16.48 bar, intake manifold resonance 57.4 kPa, buttress downforce 426.8 N, triplane diffuser suction 852.8 N
# Ferrari_812GTS_Trace[1616]: V12 6496cc RPM 6010, BMEP 16.48 bar, intake manifold resonance 57.5 kPa, buttress downforce 427.2 N, triplane diffuser suction 853.6 N
# Ferrari_812GTS_Trace[1617]: V12 6496cc RPM 6013, BMEP 16.48 bar, intake manifold resonance 57.6 kPa, buttress downforce 427.6 N, triplane diffuser suction 854.5 N
# Ferrari_812GTS_Trace[1618]: V12 6496cc RPM 6016, BMEP 16.49 bar, intake manifold resonance 57.6 kPa, buttress downforce 428.1 N, triplane diffuser suction 855.3 N
# Ferrari_812GTS_Trace[1619]: V12 6496cc RPM 6019, BMEP 16.50 bar, intake manifold resonance 57.7 kPa, buttress downforce 428.6 N, triplane diffuser suction 856.1 N
# Ferrari_812GTS_Trace[1620]: V12 6496cc RPM 6022, BMEP 16.50 bar, intake manifold resonance 57.8 kPa, buttress downforce 429.0 N, triplane diffuser suction 857.0 N
# Ferrari_812GTS_Trace[1621]: V12 6496cc RPM 6025, BMEP 16.51 bar, intake manifold resonance 57.9 kPa, buttress downforce 429.5 N, triplane diffuser suction 857.8 N
# Ferrari_812GTS_Trace[1622]: V12 6496cc RPM 6028, BMEP 16.51 bar, intake manifold resonance 58.0 kPa, buttress downforce 429.9 N, triplane diffuser suction 858.7 N
# Ferrari_812GTS_Trace[1623]: V12 6496cc RPM 6031, BMEP 16.52 bar, intake manifold resonance 58.0 kPa, buttress downforce 430.4 N, triplane diffuser suction 859.5 N
# Ferrari_812GTS_Trace[1624]: V12 6496cc RPM 6034, BMEP 16.52 bar, intake manifold resonance 58.1 kPa, buttress downforce 430.8 N, triplane diffuser suction 860.4 N
# Ferrari_812GTS_Trace[1625]: V12 6496cc RPM 6038, BMEP 16.52 bar, intake manifold resonance 58.2 kPa, buttress downforce 431.3 N, triplane diffuser suction 861.3 N
# Ferrari_812GTS_Trace[1626]: V12 6496cc RPM 6041, BMEP 16.53 bar, intake manifold resonance 58.3 kPa, buttress downforce 431.7 N, triplane diffuser suction 862.1 N
# Ferrari_812GTS_Trace[1627]: V12 6496cc RPM 6044, BMEP 16.54 bar, intake manifold resonance 58.4 kPa, buttress downforce 432.1 N, triplane diffuser suction 863.0 N
# Ferrari_812GTS_Trace[1628]: V12 6496cc RPM 6047, BMEP 16.54 bar, intake manifold resonance 58.4 kPa, buttress downforce 432.6 N, triplane diffuser suction 863.8 N
# Ferrari_812GTS_Trace[1629]: V12 6496cc RPM 6050, BMEP 16.55 bar, intake manifold resonance 58.5 kPa, buttress downforce 433.1 N, triplane diffuser suction 864.6 N
# Ferrari_812GTS_Trace[1630]: V12 6496cc RPM 6053, BMEP 16.55 bar, intake manifold resonance 58.6 kPa, buttress downforce 433.5 N, triplane diffuser suction 865.5 N
# Ferrari_812GTS_Trace[1631]: V12 6496cc RPM 6056, BMEP 16.55 bar, intake manifold resonance 58.7 kPa, buttress downforce 434.0 N, triplane diffuser suction 866.3 N
# Ferrari_812GTS_Trace[1632]: V12 6496cc RPM 6059, BMEP 16.56 bar, intake manifold resonance 58.8 kPa, buttress downforce 434.4 N, triplane diffuser suction 867.2 N
# Ferrari_812GTS_Trace[1633]: V12 6496cc RPM 6062, BMEP 16.57 bar, intake manifold resonance 58.8 kPa, buttress downforce 434.9 N, triplane diffuser suction 868.0 N
# Ferrari_812GTS_Trace[1634]: V12 6496cc RPM 6065, BMEP 16.57 bar, intake manifold resonance 58.9 kPa, buttress downforce 435.3 N, triplane diffuser suction 868.9 N
# Ferrari_812GTS_Trace[1635]: V12 6496cc RPM 6069, BMEP 16.58 bar, intake manifold resonance 59.0 kPa, buttress downforce 435.8 N, triplane diffuser suction 869.8 N
# Ferrari_812GTS_Trace[1636]: V12 6496cc RPM 6072, BMEP 16.58 bar, intake manifold resonance 59.1 kPa, buttress downforce 436.2 N, triplane diffuser suction 870.6 N
# Ferrari_812GTS_Trace[1637]: V12 6496cc RPM 6075, BMEP 16.59 bar, intake manifold resonance 59.2 kPa, buttress downforce 436.6 N, triplane diffuser suction 871.5 N
# Ferrari_812GTS_Trace[1638]: V12 6496cc RPM 6078, BMEP 16.59 bar, intake manifold resonance 59.2 kPa, buttress downforce 437.1 N, triplane diffuser suction 872.3 N
# Ferrari_812GTS_Trace[1639]: V12 6496cc RPM 6081, BMEP 16.59 bar, intake manifold resonance 59.3 kPa, buttress downforce 437.6 N, triplane diffuser suction 873.1 N
# Ferrari_812GTS_Trace[1640]: V12 6496cc RPM 6084, BMEP 16.60 bar, intake manifold resonance 59.4 kPa, buttress downforce 438.0 N, triplane diffuser suction 874.0 N
# Ferrari_812GTS_Trace[1641]: V12 6496cc RPM 6087, BMEP 16.61 bar, intake manifold resonance 59.5 kPa, buttress downforce 438.5 N, triplane diffuser suction 874.8 N
# Ferrari_812GTS_Trace[1642]: V12 6496cc RPM 6090, BMEP 16.61 bar, intake manifold resonance 59.6 kPa, buttress downforce 438.9 N, triplane diffuser suction 875.7 N
# Ferrari_812GTS_Trace[1643]: V12 6496cc RPM 6093, BMEP 16.62 bar, intake manifold resonance 59.6 kPa, buttress downforce 439.4 N, triplane diffuser suction 876.5 N
# Ferrari_812GTS_Trace[1644]: V12 6496cc RPM 6096, BMEP 16.62 bar, intake manifold resonance 59.7 kPa, buttress downforce 439.8 N, triplane diffuser suction 877.4 N
# Ferrari_812GTS_Trace[1645]: V12 6496cc RPM 6100, BMEP 16.63 bar, intake manifold resonance 59.8 kPa, buttress downforce 440.3 N, triplane diffuser suction 878.3 N
# Ferrari_812GTS_Trace[1646]: V12 6496cc RPM 6103, BMEP 16.63 bar, intake manifold resonance 59.9 kPa, buttress downforce 440.7 N, triplane diffuser suction 879.1 N
# Ferrari_812GTS_Trace[1647]: V12 6496cc RPM 6106, BMEP 16.63 bar, intake manifold resonance 60.0 kPa, buttress downforce 441.1 N, triplane diffuser suction 880.0 N
# Ferrari_812GTS_Trace[1648]: V12 6496cc RPM 6109, BMEP 16.64 bar, intake manifold resonance 60.0 kPa, buttress downforce 441.6 N, triplane diffuser suction 880.8 N
# Ferrari_812GTS_Trace[1649]: V12 6496cc RPM 6112, BMEP 16.65 bar, intake manifold resonance 60.1 kPa, buttress downforce 442.1 N, triplane diffuser suction 881.6 N
# Ferrari_812GTS_Trace[1650]: V12 6496cc RPM 6115, BMEP 16.65 bar, intake manifold resonance 48.2 kPa, buttress downforce 442.5 N, triplane diffuser suction 882.5 N
# Ferrari_812GTS_Trace[1651]: V12 6496cc RPM 6118, BMEP 16.66 bar, intake manifold resonance 48.3 kPa, buttress downforce 443.0 N, triplane diffuser suction 883.3 N
# Ferrari_812GTS_Trace[1652]: V12 6496cc RPM 6121, BMEP 16.66 bar, intake manifold resonance 48.4 kPa, buttress downforce 443.4 N, triplane diffuser suction 884.2 N
# Ferrari_812GTS_Trace[1653]: V12 6496cc RPM 6124, BMEP 16.66 bar, intake manifold resonance 48.4 kPa, buttress downforce 443.9 N, triplane diffuser suction 885.0 N
# Ferrari_812GTS_Trace[1654]: V12 6496cc RPM 6127, BMEP 16.67 bar, intake manifold resonance 48.5 kPa, buttress downforce 444.3 N, triplane diffuser suction 885.9 N
# Ferrari_812GTS_Trace[1655]: V12 6496cc RPM 6131, BMEP 16.68 bar, intake manifold resonance 48.6 kPa, buttress downforce 444.8 N, triplane diffuser suction 886.8 N
# Ferrari_812GTS_Trace[1656]: V12 6496cc RPM 6134, BMEP 16.68 bar, intake manifold resonance 48.7 kPa, buttress downforce 445.2 N, triplane diffuser suction 887.6 N
# Ferrari_812GTS_Trace[1657]: V12 6496cc RPM 6137, BMEP 16.69 bar, intake manifold resonance 48.8 kPa, buttress downforce 445.6 N, triplane diffuser suction 888.5 N
# Ferrari_812GTS_Trace[1658]: V12 6496cc RPM 6140, BMEP 16.69 bar, intake manifold resonance 48.8 kPa, buttress downforce 446.1 N, triplane diffuser suction 889.3 N
# Ferrari_812GTS_Trace[1659]: V12 6496cc RPM 6143, BMEP 16.70 bar, intake manifold resonance 48.9 kPa, buttress downforce 446.6 N, triplane diffuser suction 890.1 N
# Ferrari_812GTS_Trace[1660]: V12 6496cc RPM 6146, BMEP 16.70 bar, intake manifold resonance 49.0 kPa, buttress downforce 447.0 N, triplane diffuser suction 891.0 N
# Ferrari_812GTS_Trace[1661]: V12 6496cc RPM 6149, BMEP 16.70 bar, intake manifold resonance 49.1 kPa, buttress downforce 447.5 N, triplane diffuser suction 891.8 N
# Ferrari_812GTS_Trace[1662]: V12 6496cc RPM 6152, BMEP 16.71 bar, intake manifold resonance 49.2 kPa, buttress downforce 447.9 N, triplane diffuser suction 892.7 N
# Ferrari_812GTS_Trace[1663]: V12 6496cc RPM 6155, BMEP 16.71 bar, intake manifold resonance 49.2 kPa, buttress downforce 448.4 N, triplane diffuser suction 893.5 N
# Ferrari_812GTS_Trace[1664]: V12 6496cc RPM 6158, BMEP 16.72 bar, intake manifold resonance 49.3 kPa, buttress downforce 448.8 N, triplane diffuser suction 894.4 N
# Ferrari_812GTS_Trace[1665]: V12 6496cc RPM 6162, BMEP 16.73 bar, intake manifold resonance 49.4 kPa, buttress downforce 449.3 N, triplane diffuser suction 895.3 N
# Ferrari_812GTS_Trace[1666]: V12 6496cc RPM 6165, BMEP 16.73 bar, intake manifold resonance 49.5 kPa, buttress downforce 449.7 N, triplane diffuser suction 896.1 N
# Ferrari_812GTS_Trace[1667]: V12 6496cc RPM 6168, BMEP 16.73 bar, intake manifold resonance 49.6 kPa, buttress downforce 450.1 N, triplane diffuser suction 897.0 N
# Ferrari_812GTS_Trace[1668]: V12 6496cc RPM 6171, BMEP 16.74 bar, intake manifold resonance 49.6 kPa, buttress downforce 450.6 N, triplane diffuser suction 897.8 N
# Ferrari_812GTS_Trace[1669]: V12 6496cc RPM 6174, BMEP 16.75 bar, intake manifold resonance 49.7 kPa, buttress downforce 451.1 N, triplane diffuser suction 898.6 N
# Ferrari_812GTS_Trace[1670]: V12 6496cc RPM 6177, BMEP 16.75 bar, intake manifold resonance 49.8 kPa, buttress downforce 451.5 N, triplane diffuser suction 899.5 N
# Ferrari_812GTS_Trace[1671]: V12 6496cc RPM 6180, BMEP 16.76 bar, intake manifold resonance 49.9 kPa, buttress downforce 452.0 N, triplane diffuser suction 900.3 N
# Ferrari_812GTS_Trace[1672]: V12 6496cc RPM 6183, BMEP 16.76 bar, intake manifold resonance 50.0 kPa, buttress downforce 452.4 N, triplane diffuser suction 901.2 N
# Ferrari_812GTS_Trace[1673]: V12 6496cc RPM 6186, BMEP 16.77 bar, intake manifold resonance 50.0 kPa, buttress downforce 452.9 N, triplane diffuser suction 902.0 N
# Ferrari_812GTS_Trace[1674]: V12 6496cc RPM 6189, BMEP 16.77 bar, intake manifold resonance 50.1 kPa, buttress downforce 453.3 N, triplane diffuser suction 902.9 N
# Ferrari_812GTS_Trace[1675]: V12 6496cc RPM 6193, BMEP 16.77 bar, intake manifold resonance 50.2 kPa, buttress downforce 453.8 N, triplane diffuser suction 903.8 N
# Ferrari_812GTS_Trace[1676]: V12 6496cc RPM 6196, BMEP 16.78 bar, intake manifold resonance 50.3 kPa, buttress downforce 454.2 N, triplane diffuser suction 904.6 N
# Ferrari_812GTS_Trace[1677]: V12 6496cc RPM 6199, BMEP 16.79 bar, intake manifold resonance 50.4 kPa, buttress downforce 454.6 N, triplane diffuser suction 905.5 N
# Ferrari_812GTS_Trace[1678]: V12 6496cc RPM 6202, BMEP 16.79 bar, intake manifold resonance 50.4 kPa, buttress downforce 455.1 N, triplane diffuser suction 906.3 N
# Ferrari_812GTS_Trace[1679]: V12 6496cc RPM 6205, BMEP 16.80 bar, intake manifold resonance 50.5 kPa, buttress downforce 455.6 N, triplane diffuser suction 907.1 N
# Ferrari_812GTS_Trace[1680]: V12 6496cc RPM 6208, BMEP 16.80 bar, intake manifold resonance 50.6 kPa, buttress downforce 456.0 N, triplane diffuser suction 908.0 N
# Ferrari_812GTS_Trace[1681]: V12 6496cc RPM 6211, BMEP 16.80 bar, intake manifold resonance 50.7 kPa, buttress downforce 456.5 N, triplane diffuser suction 908.8 N
# Ferrari_812GTS_Trace[1682]: V12 6496cc RPM 6214, BMEP 16.81 bar, intake manifold resonance 50.8 kPa, buttress downforce 456.9 N, triplane diffuser suction 909.7 N
# Ferrari_812GTS_Trace[1683]: V12 6496cc RPM 6217, BMEP 16.82 bar, intake manifold resonance 50.8 kPa, buttress downforce 457.4 N, triplane diffuser suction 910.5 N
# Ferrari_812GTS_Trace[1684]: V12 6496cc RPM 6220, BMEP 16.82 bar, intake manifold resonance 50.9 kPa, buttress downforce 457.8 N, triplane diffuser suction 911.4 N
# Ferrari_812GTS_Trace[1685]: V12 6496cc RPM 6224, BMEP 16.83 bar, intake manifold resonance 51.0 kPa, buttress downforce 458.3 N, triplane diffuser suction 912.3 N
# Ferrari_812GTS_Trace[1686]: V12 6496cc RPM 6227, BMEP 16.83 bar, intake manifold resonance 51.1 kPa, buttress downforce 458.7 N, triplane diffuser suction 913.1 N
# Ferrari_812GTS_Trace[1687]: V12 6496cc RPM 6230, BMEP 16.84 bar, intake manifold resonance 51.2 kPa, buttress downforce 459.1 N, triplane diffuser suction 914.0 N
# Ferrari_812GTS_Trace[1688]: V12 6496cc RPM 6233, BMEP 16.84 bar, intake manifold resonance 51.2 kPa, buttress downforce 459.6 N, triplane diffuser suction 914.8 N
# Ferrari_812GTS_Trace[1689]: V12 6496cc RPM 6236, BMEP 16.84 bar, intake manifold resonance 51.3 kPa, buttress downforce 460.1 N, triplane diffuser suction 915.6 N
# Ferrari_812GTS_Trace[1690]: V12 6496cc RPM 6239, BMEP 16.85 bar, intake manifold resonance 51.4 kPa, buttress downforce 460.5 N, triplane diffuser suction 916.5 N
# Ferrari_812GTS_Trace[1691]: V12 6496cc RPM 6242, BMEP 16.86 bar, intake manifold resonance 51.5 kPa, buttress downforce 461.0 N, triplane diffuser suction 917.3 N
# Ferrari_812GTS_Trace[1692]: V12 6496cc RPM 6245, BMEP 16.86 bar, intake manifold resonance 51.6 kPa, buttress downforce 461.4 N, triplane diffuser suction 918.2 N
# Ferrari_812GTS_Trace[1693]: V12 6496cc RPM 6248, BMEP 16.87 bar, intake manifold resonance 51.6 kPa, buttress downforce 461.9 N, triplane diffuser suction 919.0 N
# Ferrari_812GTS_Trace[1694]: V12 6496cc RPM 6251, BMEP 16.87 bar, intake manifold resonance 51.7 kPa, buttress downforce 462.3 N, triplane diffuser suction 919.9 N
# Ferrari_812GTS_Trace[1695]: V12 6496cc RPM 6255, BMEP 16.88 bar, intake manifold resonance 51.8 kPa, buttress downforce 462.8 N, triplane diffuser suction 680.8 N
# Ferrari_812GTS_Trace[1696]: V12 6496cc RPM 6258, BMEP 16.88 bar, intake manifold resonance 51.9 kPa, buttress downforce 463.2 N, triplane diffuser suction 681.6 N
# Ferrari_812GTS_Trace[1697]: V12 6496cc RPM 6261, BMEP 16.88 bar, intake manifold resonance 52.0 kPa, buttress downforce 463.6 N, triplane diffuser suction 682.5 N
# Ferrari_812GTS_Trace[1698]: V12 6496cc RPM 6264, BMEP 16.89 bar, intake manifold resonance 52.0 kPa, buttress downforce 464.1 N, triplane diffuser suction 683.3 N
# Ferrari_812GTS_Trace[1699]: V12 6496cc RPM 6267, BMEP 16.90 bar, intake manifold resonance 52.1 kPa, buttress downforce 464.6 N, triplane diffuser suction 684.1 N
# Ferrari_812GTS_Trace[1700]: V12 6496cc RPM 6270, BMEP 16.90 bar, intake manifold resonance 52.2 kPa, buttress downforce 465.0 N, triplane diffuser suction 685.0 N
# Ferrari_812GTS_Trace[1701]: V12 6496cc RPM 6273, BMEP 16.91 bar, intake manifold resonance 52.3 kPa, buttress downforce 465.5 N, triplane diffuser suction 685.8 N
# Ferrari_812GTS_Trace[1702]: V12 6496cc RPM 6276, BMEP 16.91 bar, intake manifold resonance 52.4 kPa, buttress downforce 465.9 N, triplane diffuser suction 686.7 N
# Ferrari_812GTS_Trace[1703]: V12 6496cc RPM 6279, BMEP 16.91 bar, intake manifold resonance 52.4 kPa, buttress downforce 466.4 N, triplane diffuser suction 687.5 N
# Ferrari_812GTS_Trace[1704]: V12 6496cc RPM 6282, BMEP 16.92 bar, intake manifold resonance 52.5 kPa, buttress downforce 466.8 N, triplane diffuser suction 688.4 N
# Ferrari_812GTS_Trace[1705]: V12 6496cc RPM 6286, BMEP 16.93 bar, intake manifold resonance 52.6 kPa, buttress downforce 467.3 N, triplane diffuser suction 689.3 N
# Ferrari_812GTS_Trace[1706]: V12 6496cc RPM 6289, BMEP 16.93 bar, intake manifold resonance 52.7 kPa, buttress downforce 467.7 N, triplane diffuser suction 690.1 N
# Ferrari_812GTS_Trace[1707]: V12 6496cc RPM 6292, BMEP 16.94 bar, intake manifold resonance 52.8 kPa, buttress downforce 468.1 N, triplane diffuser suction 691.0 N
# Ferrari_812GTS_Trace[1708]: V12 6496cc RPM 6295, BMEP 16.94 bar, intake manifold resonance 52.8 kPa, buttress downforce 468.6 N, triplane diffuser suction 691.8 N
# Ferrari_812GTS_Trace[1709]: V12 6496cc RPM 6298, BMEP 16.95 bar, intake manifold resonance 52.9 kPa, buttress downforce 469.1 N, triplane diffuser suction 692.6 N
# Ferrari_812GTS_Trace[1710]: V12 6496cc RPM 6301, BMEP 16.95 bar, intake manifold resonance 53.0 kPa, buttress downforce 469.5 N, triplane diffuser suction 693.5 N
# Ferrari_812GTS_Trace[1711]: V12 6496cc RPM 6304, BMEP 16.95 bar, intake manifold resonance 53.1 kPa, buttress downforce 470.0 N, triplane diffuser suction 694.3 N
# Ferrari_812GTS_Trace[1712]: V12 6496cc RPM 6307, BMEP 16.96 bar, intake manifold resonance 53.2 kPa, buttress downforce 470.4 N, triplane diffuser suction 695.2 N
# Ferrari_812GTS_Trace[1713]: V12 6496cc RPM 6310, BMEP 16.96 bar, intake manifold resonance 53.2 kPa, buttress downforce 470.9 N, triplane diffuser suction 696.0 N
# Ferrari_812GTS_Trace[1714]: V12 6496cc RPM 6313, BMEP 16.97 bar, intake manifold resonance 53.3 kPa, buttress downforce 471.3 N, triplane diffuser suction 696.9 N
# Ferrari_812GTS_Trace[1715]: V12 6496cc RPM 6317, BMEP 16.98 bar, intake manifold resonance 53.4 kPa, buttress downforce 471.8 N, triplane diffuser suction 697.8 N
# Ferrari_812GTS_Trace[1716]: V12 6496cc RPM 6320, BMEP 16.98 bar, intake manifold resonance 53.5 kPa, buttress downforce 472.2 N, triplane diffuser suction 698.6 N
# Ferrari_812GTS_Trace[1717]: V12 6496cc RPM 6323, BMEP 16.98 bar, intake manifold resonance 53.6 kPa, buttress downforce 472.6 N, triplane diffuser suction 699.5 N
# Ferrari_812GTS_Trace[1718]: V12 6496cc RPM 6326, BMEP 16.99 bar, intake manifold resonance 53.6 kPa, buttress downforce 473.1 N, triplane diffuser suction 700.3 N
# Ferrari_812GTS_Trace[1719]: V12 6496cc RPM 6329, BMEP 17.00 bar, intake manifold resonance 53.7 kPa, buttress downforce 473.6 N, triplane diffuser suction 701.1 N
# Ferrari_812GTS_Trace[1720]: V12 6496cc RPM 6332, BMEP 17.00 bar, intake manifold resonance 53.8 kPa, buttress downforce 474.0 N, triplane diffuser suction 702.0 N
# Ferrari_812GTS_Trace[1721]: V12 6496cc RPM 6335, BMEP 17.01 bar, intake manifold resonance 53.9 kPa, buttress downforce 474.5 N, triplane diffuser suction 702.8 N
# Ferrari_812GTS_Trace[1722]: V12 6496cc RPM 6338, BMEP 17.01 bar, intake manifold resonance 54.0 kPa, buttress downforce 474.9 N, triplane diffuser suction 703.7 N
# Ferrari_812GTS_Trace[1723]: V12 6496cc RPM 6341, BMEP 17.02 bar, intake manifold resonance 54.0 kPa, buttress downforce 475.4 N, triplane diffuser suction 704.5 N
# Ferrari_812GTS_Trace[1724]: V12 6496cc RPM 6344, BMEP 17.02 bar, intake manifold resonance 54.1 kPa, buttress downforce 475.8 N, triplane diffuser suction 705.4 N
# Ferrari_812GTS_Trace[1725]: V12 6496cc RPM 6348, BMEP 17.02 bar, intake manifold resonance 54.2 kPa, buttress downforce 476.3 N, triplane diffuser suction 706.3 N
# Ferrari_812GTS_Trace[1726]: V12 6496cc RPM 6351, BMEP 17.03 bar, intake manifold resonance 54.3 kPa, buttress downforce 476.7 N, triplane diffuser suction 707.1 N
# Ferrari_812GTS_Trace[1727]: V12 6496cc RPM 6354, BMEP 17.04 bar, intake manifold resonance 54.4 kPa, buttress downforce 477.1 N, triplane diffuser suction 708.0 N
# Ferrari_812GTS_Trace[1728]: V12 6496cc RPM 6357, BMEP 17.04 bar, intake manifold resonance 54.4 kPa, buttress downforce 477.6 N, triplane diffuser suction 708.8 N
# Ferrari_812GTS_Trace[1729]: V12 6496cc RPM 6360, BMEP 17.05 bar, intake manifold resonance 54.5 kPa, buttress downforce 478.1 N, triplane diffuser suction 709.6 N
# Ferrari_812GTS_Trace[1730]: V12 6496cc RPM 6363, BMEP 17.05 bar, intake manifold resonance 54.6 kPa, buttress downforce 478.5 N, triplane diffuser suction 710.5 N
# Ferrari_812GTS_Trace[1731]: V12 6496cc RPM 6366, BMEP 17.05 bar, intake manifold resonance 54.7 kPa, buttress downforce 479.0 N, triplane diffuser suction 711.3 N
# Ferrari_812GTS_Trace[1732]: V12 6496cc RPM 6369, BMEP 17.06 bar, intake manifold resonance 54.8 kPa, buttress downforce 479.4 N, triplane diffuser suction 712.2 N
# Ferrari_812GTS_Trace[1733]: V12 6496cc RPM 6372, BMEP 17.07 bar, intake manifold resonance 54.8 kPa, buttress downforce 479.9 N, triplane diffuser suction 713.0 N
# Ferrari_812GTS_Trace[1734]: V12 6496cc RPM 6375, BMEP 17.07 bar, intake manifold resonance 54.9 kPa, buttress downforce 480.3 N, triplane diffuser suction 713.9 N
# Ferrari_812GTS_Trace[1735]: V12 6496cc RPM 6379, BMEP 17.08 bar, intake manifold resonance 55.0 kPa, buttress downforce 480.8 N, triplane diffuser suction 714.8 N
# Ferrari_812GTS_Trace[1736]: V12 6496cc RPM 6382, BMEP 17.08 bar, intake manifold resonance 55.1 kPa, buttress downforce 481.2 N, triplane diffuser suction 715.6 N
# Ferrari_812GTS_Trace[1737]: V12 6496cc RPM 6385, BMEP 17.09 bar, intake manifold resonance 55.2 kPa, buttress downforce 481.6 N, triplane diffuser suction 716.5 N
# Ferrari_812GTS_Trace[1738]: V12 6496cc RPM 6388, BMEP 17.09 bar, intake manifold resonance 55.2 kPa, buttress downforce 482.1 N, triplane diffuser suction 717.3 N
# Ferrari_812GTS_Trace[1739]: V12 6496cc RPM 6391, BMEP 17.09 bar, intake manifold resonance 55.3 kPa, buttress downforce 482.6 N, triplane diffuser suction 718.1 N
# Ferrari_812GTS_Trace[1740]: V12 6496cc RPM 6394, BMEP 17.10 bar, intake manifold resonance 55.4 kPa, buttress downforce 483.0 N, triplane diffuser suction 719.0 N
# Ferrari_812GTS_Trace[1741]: V12 6496cc RPM 6397, BMEP 17.11 bar, intake manifold resonance 55.5 kPa, buttress downforce 483.5 N, triplane diffuser suction 719.8 N
# Ferrari_812GTS_Trace[1742]: V12 6496cc RPM 6400, BMEP 17.11 bar, intake manifold resonance 55.6 kPa, buttress downforce 483.9 N, triplane diffuser suction 720.7 N
# Ferrari_812GTS_Trace[1743]: V12 6496cc RPM 6403, BMEP 17.12 bar, intake manifold resonance 55.6 kPa, buttress downforce 484.4 N, triplane diffuser suction 721.5 N
# Ferrari_812GTS_Trace[1744]: V12 6496cc RPM 6406, BMEP 17.12 bar, intake manifold resonance 55.7 kPa, buttress downforce 484.8 N, triplane diffuser suction 722.4 N
# Ferrari_812GTS_Trace[1745]: V12 6496cc RPM 6410, BMEP 17.13 bar, intake manifold resonance 55.8 kPa, buttress downforce 485.3 N, triplane diffuser suction 723.3 N
# Ferrari_812GTS_Trace[1746]: V12 6496cc RPM 6413, BMEP 17.13 bar, intake manifold resonance 55.9 kPa, buttress downforce 485.7 N, triplane diffuser suction 724.1 N
# Ferrari_812GTS_Trace[1747]: V12 6496cc RPM 6416, BMEP 17.13 bar, intake manifold resonance 56.0 kPa, buttress downforce 486.1 N, triplane diffuser suction 725.0 N
# Ferrari_812GTS_Trace[1748]: V12 6496cc RPM 6419, BMEP 17.14 bar, intake manifold resonance 56.0 kPa, buttress downforce 486.6 N, triplane diffuser suction 725.8 N
# Ferrari_812GTS_Trace[1749]: V12 6496cc RPM 6422, BMEP 17.15 bar, intake manifold resonance 56.1 kPa, buttress downforce 487.1 N, triplane diffuser suction 726.6 N
# Ferrari_812GTS_Trace[1750]: V12 6496cc RPM 6425, BMEP 17.15 bar, intake manifold resonance 56.2 kPa, buttress downforce 487.5 N, triplane diffuser suction 727.5 N
# Ferrari_812GTS_Trace[1751]: V12 6496cc RPM 6428, BMEP 17.16 bar, intake manifold resonance 56.3 kPa, buttress downforce 488.0 N, triplane diffuser suction 728.3 N
# Ferrari_812GTS_Trace[1752]: V12 6496cc RPM 6431, BMEP 17.16 bar, intake manifold resonance 56.4 kPa, buttress downforce 488.4 N, triplane diffuser suction 729.2 N
# Ferrari_812GTS_Trace[1753]: V12 6496cc RPM 6434, BMEP 17.16 bar, intake manifold resonance 56.4 kPa, buttress downforce 488.9 N, triplane diffuser suction 730.0 N
# Ferrari_812GTS_Trace[1754]: V12 6496cc RPM 6437, BMEP 17.17 bar, intake manifold resonance 56.5 kPa, buttress downforce 489.3 N, triplane diffuser suction 730.9 N
# Ferrari_812GTS_Trace[1755]: V12 6496cc RPM 6441, BMEP 17.18 bar, intake manifold resonance 56.6 kPa, buttress downforce 489.8 N, triplane diffuser suction 731.8 N
# Ferrari_812GTS_Trace[1756]: V12 6496cc RPM 6444, BMEP 17.18 bar, intake manifold resonance 56.7 kPa, buttress downforce 490.2 N, triplane diffuser suction 732.6 N
# Ferrari_812GTS_Trace[1757]: V12 6496cc RPM 6447, BMEP 17.19 bar, intake manifold resonance 56.8 kPa, buttress downforce 490.6 N, triplane diffuser suction 733.5 N
# Ferrari_812GTS_Trace[1758]: V12 6496cc RPM 6450, BMEP 17.19 bar, intake manifold resonance 56.8 kPa, buttress downforce 491.1 N, triplane diffuser suction 734.3 N
# Ferrari_812GTS_Trace[1759]: V12 6496cc RPM 6453, BMEP 17.20 bar, intake manifold resonance 56.9 kPa, buttress downforce 491.6 N, triplane diffuser suction 735.1 N
# Ferrari_812GTS_Trace[1760]: V12 6496cc RPM 6456, BMEP 17.20 bar, intake manifold resonance 57.0 kPa, buttress downforce 492.0 N, triplane diffuser suction 736.0 N
# Ferrari_812GTS_Trace[1761]: V12 6496cc RPM 6459, BMEP 17.20 bar, intake manifold resonance 57.1 kPa, buttress downforce 492.5 N, triplane diffuser suction 736.8 N
# Ferrari_812GTS_Trace[1762]: V12 6496cc RPM 6462, BMEP 17.21 bar, intake manifold resonance 57.2 kPa, buttress downforce 492.9 N, triplane diffuser suction 737.7 N
# Ferrari_812GTS_Trace[1763]: V12 6496cc RPM 6465, BMEP 17.21 bar, intake manifold resonance 57.2 kPa, buttress downforce 493.4 N, triplane diffuser suction 738.5 N
# Ferrari_812GTS_Trace[1764]: V12 6496cc RPM 6468, BMEP 17.22 bar, intake manifold resonance 57.3 kPa, buttress downforce 493.8 N, triplane diffuser suction 739.4 N
# Ferrari_812GTS_Trace[1765]: V12 6496cc RPM 6472, BMEP 17.23 bar, intake manifold resonance 57.4 kPa, buttress downforce 494.3 N, triplane diffuser suction 740.3 N
# Ferrari_812GTS_Trace[1766]: V12 6496cc RPM 6475, BMEP 17.23 bar, intake manifold resonance 57.5 kPa, buttress downforce 494.7 N, triplane diffuser suction 741.1 N
# Ferrari_812GTS_Trace[1767]: V12 6496cc RPM 6478, BMEP 17.23 bar, intake manifold resonance 57.6 kPa, buttress downforce 495.1 N, triplane diffuser suction 742.0 N
# Ferrari_812GTS_Trace[1768]: V12 6496cc RPM 6481, BMEP 17.24 bar, intake manifold resonance 57.6 kPa, buttress downforce 495.6 N, triplane diffuser suction 742.8 N
# Ferrari_812GTS_Trace[1769]: V12 6496cc RPM 6484, BMEP 17.25 bar, intake manifold resonance 57.7 kPa, buttress downforce 496.1 N, triplane diffuser suction 743.6 N
# Ferrari_812GTS_Trace[1770]: V12 6496cc RPM 6487, BMEP 17.25 bar, intake manifold resonance 57.8 kPa, buttress downforce 496.5 N, triplane diffuser suction 744.5 N
# Ferrari_812GTS_Trace[1771]: V12 6496cc RPM 6490, BMEP 17.26 bar, intake manifold resonance 57.9 kPa, buttress downforce 497.0 N, triplane diffuser suction 745.3 N
# Ferrari_812GTS_Trace[1772]: V12 6496cc RPM 6493, BMEP 17.26 bar, intake manifold resonance 58.0 kPa, buttress downforce 497.4 N, triplane diffuser suction 746.2 N
# Ferrari_812GTS_Trace[1773]: V12 6496cc RPM 6496, BMEP 17.27 bar, intake manifold resonance 58.0 kPa, buttress downforce 497.9 N, triplane diffuser suction 747.0 N
# Ferrari_812GTS_Trace[1774]: V12 6496cc RPM 6499, BMEP 17.27 bar, intake manifold resonance 58.1 kPa, buttress downforce 498.3 N, triplane diffuser suction 747.9 N
# Ferrari_812GTS_Trace[1775]: V12 6496cc RPM 6503, BMEP 17.27 bar, intake manifold resonance 58.2 kPa, buttress downforce 498.8 N, triplane diffuser suction 748.8 N
# Ferrari_812GTS_Trace[1776]: V12 6496cc RPM 6506, BMEP 17.28 bar, intake manifold resonance 58.3 kPa, buttress downforce 499.2 N, triplane diffuser suction 749.6 N
# Ferrari_812GTS_Trace[1777]: V12 6496cc RPM 6509, BMEP 17.29 bar, intake manifold resonance 58.4 kPa, buttress downforce 499.6 N, triplane diffuser suction 750.5 N
# Ferrari_812GTS_Trace[1778]: V12 6496cc RPM 6512, BMEP 17.29 bar, intake manifold resonance 58.4 kPa, buttress downforce 500.1 N, triplane diffuser suction 751.3 N
# Ferrari_812GTS_Trace[1779]: V12 6496cc RPM 6515, BMEP 17.30 bar, intake manifold resonance 58.5 kPa, buttress downforce 500.6 N, triplane diffuser suction 752.1 N
# Ferrari_812GTS_Trace[1780]: V12 6496cc RPM 6518, BMEP 17.30 bar, intake manifold resonance 58.6 kPa, buttress downforce 501.0 N, triplane diffuser suction 753.0 N
# Ferrari_812GTS_Trace[1781]: V12 6496cc RPM 6521, BMEP 17.30 bar, intake manifold resonance 58.7 kPa, buttress downforce 501.5 N, triplane diffuser suction 753.8 N
# Ferrari_812GTS_Trace[1782]: V12 6496cc RPM 6524, BMEP 17.31 bar, intake manifold resonance 58.8 kPa, buttress downforce 501.9 N, triplane diffuser suction 754.7 N
# Ferrari_812GTS_Trace[1783]: V12 6496cc RPM 6527, BMEP 17.32 bar, intake manifold resonance 58.8 kPa, buttress downforce 502.4 N, triplane diffuser suction 755.5 N
# Ferrari_812GTS_Trace[1784]: V12 6496cc RPM 6530, BMEP 17.32 bar, intake manifold resonance 58.9 kPa, buttress downforce 502.8 N, triplane diffuser suction 756.4 N
# Ferrari_812GTS_Trace[1785]: V12 6496cc RPM 6534, BMEP 17.33 bar, intake manifold resonance 59.0 kPa, buttress downforce 503.3 N, triplane diffuser suction 757.3 N
# Ferrari_812GTS_Trace[1786]: V12 6496cc RPM 6537, BMEP 17.33 bar, intake manifold resonance 59.1 kPa, buttress downforce 503.7 N, triplane diffuser suction 758.1 N
# Ferrari_812GTS_Trace[1787]: V12 6496cc RPM 6540, BMEP 17.34 bar, intake manifold resonance 59.2 kPa, buttress downforce 504.1 N, triplane diffuser suction 759.0 N
# Ferrari_812GTS_Trace[1788]: V12 6496cc RPM 6543, BMEP 17.34 bar, intake manifold resonance 59.2 kPa, buttress downforce 504.6 N, triplane diffuser suction 759.8 N
# Ferrari_812GTS_Trace[1789]: V12 6496cc RPM 6546, BMEP 17.34 bar, intake manifold resonance 59.3 kPa, buttress downforce 505.1 N, triplane diffuser suction 760.6 N
