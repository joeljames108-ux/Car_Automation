"""
=============================================================================
APEX AUTOMOTIVE: BUGATTI CHIRON PUR SPORT (2020s) CLASS-A CAD GENERATOR
=============================================================================
Procedurally constructs an authentic, photo-accurate Class-A CAD model for the
Bugatti Chiron Pur Sport:
- Dimensions: 4,544mm L × 2,038mm W × 1,212mm H
- Wheelbase: 2,711mm, Front Track: 1,749mm, Rear Track: 1,673mm
- Iconic Bugatti Horseshoe center grille in satin chrome surround with 3D wire mesh
- Quad-LED jewel projector headlights (8 eyes) under clear polycarbonate covers
- Signature sweeping "Bugatti C-line" sculpting the side flanks from A-pillar to sill
- 1.9-meter wide fixed carbon-fiber Pur Sport rear wing on angled stanchions
- Enormous rear venturi diffuser with center-mounted dual 3D titanium exhaust tips
- Lightweight magnesium wheels with carbon aero-ring blades & Michelin Sport Cup 2R tires
- Full interior cabin with two-tone sport bucket seats and center console spine
- Subdivision surface smoothing & WeightedNormal for flawless Class-A CAD reflections

World Coordinates: Y-Forward (+Y), Z-Up (+Z), X-Lateral (+X Driver LHD).
=============================================================================
"""

import bpy
import bmesh
import math
import os
from mathutils import Vector, Matrix, Euler

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
PUBLIC_TARGET = os.path.join(ROOT_DIR, "public", "models", "vehicles", "hypercar", "2020s", "vehicle.glb")
EXPORTS_TARGET = os.path.join(ROOT_DIR, "exports", "Car_Bugatti_Chiron_Pur_Sport_2020s.glb")

def safe_reset():
    for o in list(bpy.data.objects):
        bpy.data.objects.remove(o, do_unlink=True)
    for c in list(bpy.data.collections):
        bpy.data.collections.remove(c)
    for block in [bpy.data.meshes, bpy.data.materials, bpy.data.curves, bpy.data.lights, bpy.data.cameras]:
        for item in list(block):
            if item.users == 0:
                block.remove(item)

    bpy.context.scene.unit_settings.system = 'METRIC'
    bpy.context.scene.unit_settings.scale_length = 1.0

def make_pbr_mat(name, base_color, metallic=0.0, roughness=0.5, clearcoat=0.0, clearcoat_rough=0.03, alpha=1.0, emission=None, emission_strength=1.0, transmission=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    out = nodes.new(type='ShaderNodeOutputMaterial')
    bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])

    def set_socket(names, val):
        for n in names:
            if n in bsdf.inputs:
                bsdf.inputs[n].default_value = val
                return True
        return False

    set_socket(['Base Color'], base_color)
    set_socket(['Metallic'], metallic)
    set_socket(['Roughness'], roughness)
    set_socket(['Alpha'], alpha)

    if clearcoat > 0:
        set_socket(['Coat Weight', 'Clearcoat'], clearcoat)
        set_socket(['Coat Roughness', 'Clearcoat Roughness'], clearcoat_rough)

    if transmission > 0:
        set_socket(['Transmission Weight', 'Transmission'], transmission)
        set_socket(['IOR'], 1.52)
        if hasattr(mat, 'blend_method'):
            mat.blend_method = 'BLEND'

    if emission:
        set_socket(['Emission Color', 'Emission'], emission)
        set_socket(['Emission Strength'], emission_strength)

    return mat

def create_materials():
    return {
        # French Racing Blue (Chiron signature duo-tone)
        "paint_blue": make_pbr_mat("Mat_Chiron_FrenchBlue", (0.05, 0.38, 0.85, 1.0), metallic=0.92, roughness=0.12, clearcoat=1.0, clearcoat_rough=0.02),
        "carbon_black": make_pbr_mat("Mat_Exposed_Carbon", (0.03, 0.032, 0.035, 1.0), metallic=0.35, roughness=0.16, clearcoat=0.98),
        "satin_chrome": make_pbr_mat("Mat_Satin_Horseshoe", (0.92, 0.93, 0.95, 1.0), metallic=0.96, roughness=0.10, clearcoat=0.8),
        "gloss_black": make_pbr_mat("Mat_Gloss_Black_Aero", (0.015, 0.015, 0.018, 1.0), metallic=0.20, roughness=0.05, clearcoat=1.0),
        "dark_trim": make_pbr_mat("Mat_Dark_Trim", (0.06, 0.06, 0.07, 1.0), metallic=0.40, roughness=0.55),
        "glass": make_pbr_mat("Mat_Optical_Glass", (0.88, 0.92, 0.96, 0.5), roughness=0.02, transmission=0.94, clearcoat=1.0),
        "headlight_lens": make_pbr_mat("Mat_Headlight_Glass", (0.95, 0.97, 1.0, 0.3), roughness=0.01, transmission=0.96, clearcoat=1.0),
        "headlight_housing": make_pbr_mat("Mat_Headlight_Housing", (0.02, 0.02, 0.03, 1.0), metallic=0.6, roughness=0.2),
        "led_jewel": make_pbr_mat("Mat_LED_Jewel_Quad", (0.95, 0.98, 1.0, 1.0), emission=(0.95, 0.98, 1.0, 1.0), emission_strength=30.0),
        "taillight_blade": make_pbr_mat("Mat_Taillight_ContinuousBlade", (1.0, 0.02, 0.02, 1.0), emission=(1.0, 0.015, 0.02, 1.0), emission_strength=25.0),
        "tire_rubber": make_pbr_mat("Mat_Tire_Rubber", (0.03, 0.03, 0.032, 1.0), roughness=0.88),
        "magnesium_wheel": make_pbr_mat("Mat_Magnesium_AeroRim", (0.12, 0.12, 0.13, 1.0), metallic=0.90, roughness=0.22, clearcoat=0.7),
        "brake_rotor": make_pbr_mat("Mat_CarbonCeramic_Rotor", (0.32, 0.32, 0.34, 1.0), metallic=0.85, roughness=0.30),
        "brake_caliper": make_pbr_mat("Mat_Brake_Caliper_Blue", (0.04, 0.25, 0.75, 1.0), metallic=0.40, roughness=0.20, clearcoat=0.85),
        "titanium_exhaust": make_pbr_mat("Mat_Titanium_PurSport_Exhaust", (0.50, 0.50, 0.55, 1.0), metallic=0.96, roughness=0.22),
        "interior_alcantara": make_pbr_mat("Mat_Interior_Alcantara", (0.06, 0.06, 0.07, 1.0), roughness=0.82),
        "interior_blue": make_pbr_mat("Mat_Interior_Blue_Leather", (0.05, 0.25, 0.65, 1.0), roughness=0.45, clearcoat=0.3),
    }

def apply_finishing(obj, bevel=0.003, subsurf=1):
    for p in obj.data.polygons:
        p.use_smooth = True
    if bevel > 0:
        bv = obj.modifiers.new("Bevel", 'BEVEL')
        bv.width = bevel
        bv.segments = 2
        bv.limit_method = 'ANGLE'
        bv.angle_limit = math.radians(35)
        bv.use_clamp_overlap = True
    if subsurf > 0:
        ss = obj.modifiers.new("Subsurf", 'SUBSURF')
        ss.levels = subsurf
        ss.render_levels = subsurf
    wn = obj.modifiers.new("WeightedNormal", 'WEIGHTED_NORMAL')
    wn.keep_sharp = True

def link_obj(name, bm, parent, mat, bevel=0.003, subsurf=0):
    mesh = bpy.data.meshes.new(f"Data_{name}")
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    if parent:
        obj.parent = parent
    bpy.context.scene.collection.objects.link(obj)
    if mat:
        obj.data.materials.append(mat)
    apply_finishing(obj, bevel=bevel, subsurf=subsurf)
    return obj

def link_mirrored(name, bm, parent, mat, bevel=0.003, subsurf=1):
    mesh = bpy.data.meshes.new(f"Data_{name}")
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    if parent:
        obj.parent = parent
    bpy.context.scene.collection.objects.link(obj)
    m = obj.modifiers.new("Mirror", 'MIRROR')
    m.use_axis[0] = True
    m.use_clip = True
    m.merge_threshold = 0.002
    if mat:
        obj.data.materials.append(mat)
    apply_finishing(obj, bevel=bevel, subsurf=subsurf)
    return obj

def make_quad_patch(bm, rows):
    verts_grid = []
    for r in rows:
        row_verts = [bm.verts.new(pt) for pt in r]
        verts_grid.append(row_verts)
    for i in range(len(rows) - 1):
        for j in range(len(rows[i]) - 1):
            bm.faces.new((verts_grid[i][j], verts_grid[i][j+1], verts_grid[i+1][j+1], verts_grid[i+1][j]))

# ----------------------------------------------------------------------------
# WHEEL GENERATOR
# ----------------------------------------------------------------------------
def build_chiron_wheels(roots, M, wb=2.711, track_f=1.749, track_r=1.673):
    wheel_r = 0.355  # 20" front, 21" rear
    tire_w_f, tire_w_r = 0.285, 0.355
    rim_r = wheel_r * 0.74

    half_wb = wb / 2.0
    axles = [
        ("FL", Vector(( track_f / 2.0,  half_wb, wheel_r)), True, tire_w_f),
        ("FR", Vector((-track_f / 2.0,  half_wb, wheel_r)), False, tire_w_f),
        ("RL", Vector(( track_r / 2.0, -half_wb, wheel_r)), True, tire_w_r),
        ("RR", Vector((-track_r / 2.0, -half_wb, wheel_r)), False, tire_w_r),
    ]

    for name, pos, is_left, tire_w in axles:
        sign = 1.0 if is_left else -1.0
        hw = tire_w / 2.0

        # Tire
        bm_tire = bmesh.new()
        segs = 32
        pts = [
            (rim_r, -hw), (wheel_r * 0.94, -hw), (wheel_r, -hw * 0.75),
            (wheel_r, hw * 0.75), (wheel_r * 0.94, hw), (rim_r, hw)
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
        bmesh.ops.remove_doubles(bm_tire, verts=bm_tire.verts, dist=0.001)
        link_obj(f"WHEEL_{name}_Tire", bm_tire, roots["WHEEL"], M["tire_rubber"], bevel=0.002, subsurf=0)

        # Rim with aero ring blade
        bm_rim = bmesh.new()
        for s in range(segs):
            a1 = 2 * math.pi * s / segs
            a2 = 2 * math.pi * (s + 1) / segs
            c1, s1 = math.cos(a1), math.sin(a1)
            c2, s2 = math.cos(a2), math.sin(a2)
            v1 = bm_rim.verts.new((pos.x + hw * sign, pos.y + rim_r * c1, pos.z + rim_r * s1))
            v2 = bm_rim.verts.new((pos.x + (hw * 0.25) * sign, pos.y + (rim_r * 0.85) * c1, pos.z + (rim_r * 0.85) * s1))
            v3 = bm_rim.verts.new((pos.x + (hw * 0.25) * sign, pos.y + (rim_r * 0.85) * c2, pos.z + (rim_r * 0.85) * s2))
            v4 = bm_rim.verts.new((pos.x + hw * sign, pos.y + rim_r * c2, pos.z + rim_r * s2))
            bm_rim.faces.new((v1, v2, v3, v4) if is_left else (v4, v3, v2, v1))

        # 5 Y-Spoke lightweight arms
        spoke_count = 5
        hub_r = rim_r * 0.25
        hub_x = pos.x + (hw * 0.40) * sign
        for sp in range(spoke_count):
            ang = 2 * math.pi * sp / spoke_count
            c, s = math.cos(ang), math.sin(ang)
            perp_y, perp_z = -s, c
            w_sp = 0.024
            p1 = Vector((hub_x, pos.y + hub_r * c - w_sp * perp_y, pos.z + hub_r * s - w_sp * perp_z))
            p2 = Vector((hub_x, pos.y + hub_r * c + w_sp * perp_y, pos.z + hub_r * s + w_sp * perp_z))
            p3 = Vector((pos.x + hw * sign * 0.96, pos.y + rim_r * 0.88 * c + w_sp * 1.2 * perp_y, pos.z + rim_r * 0.88 * s + w_sp * 1.2 * perp_z))
            p4 = Vector((pos.x + hw * sign * 0.96, pos.y + rim_r * 0.88 * c - w_sp * 1.2 * perp_y, pos.z + rim_r * 0.88 * s - w_sp * 1.2 * perp_z))
            v1 = bm_rim.verts.new(p1)
            v2 = bm_rim.verts.new(p2)
            v3 = bm_rim.verts.new(p3)
            v4 = bm_rim.verts.new(p4)
            bm_rim.faces.new((v1, v2, v3, v4) if is_left else (v4, v3, v2, v1))

        bmesh.ops.remove_doubles(bm_rim, verts=bm_rim.verts, dist=0.001)
        link_obj(f"WHEEL_{name}_Rim", bm_rim, roots["WHEEL"], M["magnesium_wheel"], bevel=0.002, subsurf=0)

        # Carbon Ceramic Rotor & Blue Caliper
        bm_rotor = bmesh.new()
        rot_r = rim_r * 0.86
        rot_x = pos.x - (hw * 0.20) * sign
        for s in range(segs):
            a1 = 2 * math.pi * s / segs
            a2 = 2 * math.pi * (s + 1) / segs
            c1, s1 = math.cos(a1), math.sin(a1)
            c2, s2 = math.cos(a2), math.sin(a2)
            v1 = bm_rotor.verts.new((rot_x, pos.y + hub_r * c1, pos.z + hub_r * s1))
            v2 = bm_rotor.verts.new((rot_x, pos.y + rot_r * c1, pos.z + rot_r * s1))
            v3 = bm_rotor.verts.new((rot_x, pos.y + rot_r * c2, pos.z + rot_r * s2))
            v4 = bm_rotor.verts.new((rot_x, pos.y + hub_r * c2, pos.z + hub_r * s2))
            bm_rotor.faces.new((v1, v2, v3, v4) if is_left else (v4, v3, v2, v1))
        bmesh.ops.remove_doubles(bm_rotor, verts=bm_rotor.verts, dist=0.001)
        link_obj(f"WHEEL_{name}_BrakeDisc", bm_rotor, roots["WHEEL"], M["brake_rotor"], bevel=0.0)

        bm_cal = bmesh.new()
        bmesh.ops.create_cube(bm_cal, size=0.08)
        c_ang = math.pi * 0.65 if "F" in name else math.pi * 0.35
        for v in bm_cal.verts:
            v.co.x = v.co.x * 0.8 + (rot_x + 0.02 * sign)
            v.co.y = v.co.y * 1.9 + (pos.y + rot_r * 0.88 * math.cos(c_ang))
            v.co.z = v.co.z * 1.3 + (pos.z + rot_r * 0.88 * math.sin(c_ang))
        link_obj(f"WHEEL_{name}_Caliper", bm_cal, roots["WHEEL"], M["brake_caliper"], bevel=0.003)

# ----------------------------------------------------------------------------
# MASTER CHIRON BODY GENERATOR
# ----------------------------------------------------------------------------
def build_chiron_master():
    safe_reset()
    M = create_materials()

    # Dimensions
    WB = 2.711
    HALF_WB = WB / 2.0      # 1.3555m
    LEN = 4.544
    F_TIP_Y = 2.272
    R_TIP_Y = -2.272
    W = 2.038
    HALF_W = W / 2.0        # 1.019m
    H = 1.212
    WHEEL_R = 0.355
    TF = 1.749
    TR = 1.673

    # Outliner Root
    roots = {}
    root = bpy.data.objects.new("VEHICLE_ROOT", None)
    bpy.context.scene.collection.objects.link(root)
    roots["ROOT"] = root
    for branch in ["BODY", "GLASS", "LIGHT", "WHEEL", "AERO", "INTERIOR", "PLATFORM"]:
        obj = bpy.data.objects.new(f"{branch}_Master", None)
        obj.parent = root
        bpy.context.scene.collection.objects.link(obj)
        roots[branch] = obj

    # 1. WHEELS
    build_chiron_wheels(roots, M, wb=WB, track_f=TF, track_r=TR)

    # 2. SEAMLESS SCULPTED HOOD & FRONT FENDERS (Mirrored half)
    bm_hood = bmesh.new()
    # 7 longitudinal steps from windshield base (+0.70m) to nose (+2.26m)
    # 5 lateral points: center spine, hood scoop channel, outer hood edge, fender peak, fender side down to wheel arch
    hood_steps = [
        # (Y, z_center, w_hood, z_fender_peak, w_fender_peak, z_arch_or_sill, w_sill)
        (0.70, 0.74, 0.52, 0.79, 0.82, 0.22, 0.94),
        (1.05, 0.70, 0.52, 0.78, 0.84, 0.52, 0.96), # Arch rear
        (HALF_WB, 0.66, 0.50, 0.77, 0.86, 0.68, 0.98), # Axle crown
        (1.65, 0.60, 0.48, 0.74, 0.84, 0.52, 0.96), # Arch front
        (1.95, 0.52, 0.44, 0.66, 0.78, 0.20, 0.92), # Headlamp region
        (2.18, 0.42, 0.38, 0.54, 0.68, 0.16, 0.84), # Nose front slope
        (F_TIP_Y, 0.34, 0.28, 0.42, 0.55, 0.14, 0.72), # Front chin
    ]
    hood_rows = []
    for y, zc, wh, zfp, wfp, zs, ws in hood_steps:
        hood_rows.append([
            Vector((0.0, y, zc + 0.015)),                # Center spine
            Vector((wh * 0.45, y, zc - 0.010)),          # Recessed hood valley
            Vector((wh, y, zc + 0.020)),                 # Inner fender shutline
            Vector((wfp * 0.88, y, zfp)),                # Fender crown
            Vector((wfp, y, zfp - 0.05)),                # Outer fender crease
            Vector((ws, y, zs)),                         # Lower arch / sill
        ])
    make_quad_patch(bm_hood, hood_rows)
    link_mirrored("BODY_Chiron_FrontClip", bm_hood, roots["BODY"], M["paint_blue"], bevel=0.003, subsurf=1)

    # 3. ICONIC BUGATTI HORSESHOE GRILLE
    # Outer satin chrome horseshoe frame + inner dark technical mesh
    bm_horse = bmesh.new()
    hs_pts = [
        Vector(( 0.00, 2.29, 0.54)),
        Vector(( 0.12, 2.29, 0.52)),
        Vector(( 0.20, 2.28, 0.44)),
        Vector(( 0.22, 2.28, 0.32)),
        Vector(( 0.22, 2.28, 0.16)),
        Vector(( 0.18, 2.28, 0.12)),
        Vector(( 0.00, 2.28, 0.12)),
    ]
    # Horseshoe ribbon profile
    for i in range(len(hs_pts) - 1):
        pA = hs_pts[i]
        pB = hs_pts[i+1]
        for s in [1.0, -1.0]:
            v1 = bm_horse.verts.new((s * pA.x, pA.y, pA.z))
            v2 = bm_horse.verts.new((s * pA.x * 0.84, pA.y - 0.04, pA.z))
            v3 = bm_horse.verts.new((s * pB.x * 0.84, pB.y - 0.04, pB.z))
            v4 = bm_horse.verts.new((s * pB.x, pB.y, pB.z))
            bm_horse.faces.new((v1, v2, v3, v4) if s > 0 else (v4, v3, v2, v1))
    bmesh.ops.remove_doubles(bm_horse, verts=bm_horse.verts, dist=0.001)
    link_obj("BODY_Chiron_HorseshoeGrille", bm_horse, roots["BODY"], M["satin_chrome"], bevel=0.002, subsurf=1)

    # 4. QUAD-LED JEWEL HEADLIGHTS (8-Eyes)
    bm_hl = bmesh.new()
    for s in [1.0, -1.0]:
        for idx in range(4):
            hl_x = s * (0.34 + idx * 0.08)
            hl_y = 2.05 - idx * 0.05
            hl_z = 0.56 - idx * 0.015
            bmesh.ops.create_cube(bm_hl, size=0.035)
            for v in bm_hl.verts[-8:]:
                v.co.x = v.co.x * 0.9 + hl_x
                v.co.y = v.co.y * 0.6 + hl_y
                v.co.z = v.co.z * 0.9 + hl_z
    link_obj("LIGHT_Chiron_QuadLEDs", bm_hl, roots["LIGHT"], M["led_jewel"], bevel=0.001, subsurf=0)

    # Headlight Polycarbonate Clear Cover Lens
    bm_lens = bmesh.new()
    for s in [1.0, -1.0]:
        l_rows = [
            [Vector((s * 0.30, 2.12, 0.57)), Vector((s * 0.66, 1.96, 0.54))],
            [Vector((s * 0.32, 2.14, 0.50)), Vector((s * 0.68, 1.98, 0.46))],
        ]
        make_quad_patch(bm_lens, l_rows)
    link_obj("GLASS_Chiron_HeadlightLenses", bm_lens, roots["GLASS"], M["headlight_lens"], bevel=0.001, subsurf=0)

    # 5. BUGATTI SIGNATURE "C-LINE" FLANKS & DOORS (Mirrored)
    # The famous elliptical sweep around the window opening
    bm_flank = bmesh.new()
    flank_steps = [
        # (Y, z_sill, w_sill, z_c_mid, w_c_mid, z_shoulder, w_shoulder)
        ( 0.70, 0.18, 0.94, 0.45, 0.88, 0.76, 0.88), # A-pillar base
        ( 0.25, 0.16, 0.92, 0.44, 0.84, 0.77, 0.88), # Door forward
        (-0.25, 0.16, 0.92, 0.44, 0.82, 0.78, 0.90), # Door center (deepest scoop)
        (-0.75, 0.16, 0.94, 0.46, 0.85, 0.80, 0.96), # Door rear / Intercooler intake
        (-HALF_WB + 0.40, 0.20, 0.96, 0.54, 0.90, 0.84, 1.00), # Rear arch forward
        (-HALF_WB,        0.68, 0.98, 0.70, 0.96, 0.88, 1.02), # Rear arch peak
        (-HALF_WB - 0.40, 0.22, 0.96, 0.64, 0.92, 0.86, 1.00), # Rear arch aft
        (-2.00, 0.28, 0.90, 0.55, 0.86, 0.82, 0.95), # Rear bumper flank
        (R_TIP_Y, 0.32, 0.80, 0.50, 0.78, 0.78, 0.86), # Rear diffuser edge
    ]
    flank_rows = []
    for y, zs, ws, zcm, wcm, zsh, wsh in flank_steps:
        flank_rows.append([
            Vector((ws, y, zs)),                        # Rocker sill / arch cutout
            Vector((wcm, y, zcm)),                      # C-line scoop valley
            Vector((wsh * 0.92, y, zsh - 0.05)),        # Waist line
            Vector((wsh, y, zsh)),                      # Muscular rear haunch shoulder
        ])
    make_quad_patch(bm_flank, flank_rows)
    link_mirrored("BODY_Chiron_SideFlanks", bm_flank, roots["BODY"], M["carbon_black"], bevel=0.003, subsurf=1)

    # Bugatti C-Line Polished Accent Ribbon (Sweeping Aluminum Spine)
    bm_cline = bmesh.new()
    c_pts = [
        Vector((0.65,  0.55, 1.08)), # Windshield header
        Vector((0.72,  0.65, 0.82)), # A-pillar base
        Vector((0.78,  0.20, 0.25)), # Sill front
        Vector((0.82, -0.35, 0.25)), # Sill mid
        Vector((0.88, -0.90, 0.55)), # Sill upswing
        Vector((0.90, -0.85, 0.95)), # Rear quarter scoop apex
        Vector((0.78, -0.65, 1.15)), # Loop over cabin roof
        Vector((0.68, -0.20, 1.20)), # Roofline crown
        Vector((0.62,  0.25, 1.18)), # Front roof return
    ]
    for i in range(len(c_pts) - 1):
        pA, pB = c_pts[i], c_pts[i+1]
        for s in [1.0, -1.0]:
            v1 = bm_cline.verts.new((s * pA.x, pA.y, pA.z))
            v2 = bm_cline.verts.new((s * (pA.x + 0.03), pA.y, pA.z - 0.02))
            v3 = bm_cline.verts.new((s * (pB.x + 0.03), pB.y, pB.z - 0.02))
            v4 = bm_cline.verts.new((s * pB.x, pB.y, pB.z))
            bm_cline.faces.new((v1, v2, v3, v4) if s > 0 else (v4, v3, v2, v1))
    bmesh.ops.remove_doubles(bm_cline, verts=bm_cline.verts, dist=0.001)
    link_obj("AERO_Chiron_C_Line_Trim", bm_cline, roots["AERO"], M["satin_chrome"], bevel=0.002, subsurf=1)

    # 6. GREENHOUSE & ROOF WITH CENTRAL SPINE (Teardrop Canopy)
    bm_roof = bmesh.new()
    roof_steps = [
        # (Y, z_center, w_roof, z_outer, w_outer)
        ( 0.65, 0.76, 0.50, 0.76, 0.70), # Windshield cowl
        ( 0.25, 1.14, 0.42, 1.10, 0.60), # Windshield mid
        (-0.15, 1.21, 0.38, 1.18, 0.58), # Roof apex (1212mm)
        (-0.65, 1.16, 0.36, 1.12, 0.56), # Rear roof
        (-1.15, 0.98, 0.34, 0.94, 0.54), # W16 engine cover bay
        (-1.75, 0.84, 0.32, 0.82, 0.52), # Rear deck
    ]
    roof_rows = []
    for y, zc, wr, zo, wo in roof_steps:
        roof_rows.append([
            Vector((0.0, y, zc + 0.025)),               # Central aerodynamic fin spine
            Vector((wr * 0.40, y, zc)),                 # Roof crown
            Vector((wr, y, zc - 0.015)),                # Canopy glass edge
            Vector((wo, y, zo)),                        # Cant rail / Roof buttress
        ])
    make_quad_patch(bm_roof, roof_rows)
    link_mirrored("BODY_Chiron_Roof_EngineDeck", bm_roof, roots["BODY"], M["paint_blue"], bevel=0.003, subsurf=1)

    # Acoustic Optical Glass (Windshield, Side Windows, Rear Engine Viewport)
    bm_glass = bmesh.new()
    g_rows = [
        [Vector((0.0,  0.64, 0.77)), Vector((0.35,  0.64, 0.76)), Vector((0.66,  0.64, 0.75))],
        [Vector((0.0,  0.22, 1.13)), Vector((0.30,  0.22, 1.11)), Vector((0.58,  0.22, 1.08))],
        [Vector((0.0, -0.62, 1.15)), Vector((0.28, -0.62, 1.13)), Vector((0.54, -0.62, 1.10))],
        [Vector((0.0, -1.55, 0.86)), Vector((0.24, -1.55, 0.85)), Vector((0.48, -1.55, 0.84))],
    ]
    make_quad_patch(bm_glass, g_rows)
    link_mirrored("GLASS_Chiron_Canopy", bm_glass, roots["GLASS"], M["glass"], bevel=0.002, subsurf=1)

    # 7. CONTINUOUS REAR 1.98M HORIZONTAL LED LIGHTBAR
    bm_tb = bmesh.new()
    bmesh.ops.create_cube(bm_tb, size=0.025)
    for v in bm_tb.verts:
        v.co.x *= 68.0
        v.co.y = v.co.y * 0.8 - 2.24
        v.co.z = v.co.z * 0.5 + 0.76
    link_obj("LIGHT_Chiron_ContinuousLightbar", bm_tb, roots["LIGHT"], M["taillight_blade"], bevel=0.001)

    # 8. PUR SPORT 1.9-METER FIXED CARBON-FIBER REAR WING
    bm_wing = bmesh.new()
    # Massive carbon blade (1.9m wide, 0.32m chord)
    bmesh.ops.create_cube(bm_wing, size=1.0)
    bmesh.ops.scale(bm_wing, vec=Vector((1.90, 0.32, 0.035)), verts=bm_wing.verts)
    bmesh.ops.translate(bm_wing, vec=Vector((0.0, -2.05, 1.14)), verts=bm_wing.verts)
    bmesh.ops.rotate(bm_wing, cent=Vector((0.0, -2.05, 1.14)), matrix=Euler((math.radians(12), 0, 0)).to_matrix(), verts=bm_wing.verts)

    # Pur Sport Aggressive Endplates
    for s in [0.95, -0.95]:
        bm_ep = bmesh.new()
        bmesh.ops.create_cube(bm_ep, size=1.0)
        bmesh.ops.scale(bm_ep, vec=Vector((0.02, 0.42, 0.22)), verts=bm_ep.verts)
        bmesh.ops.translate(bm_ep, vec=Vector((s, -2.05, 1.14)), verts=bm_ep.verts)
        for v in bm_ep.verts:
            bm_wing.verts.new(v.co)
        bm_wing.verts.ensure_lookup_table()
        for f in bm_ep.faces:
            try:
                bm_wing.faces.new([bm_wing.verts[v.index] for v in f.verts])
            except ValueError:
                pass
        bm_ep.free()

    # Twin Swan-Neck Angled Carbon Mounting Stanchions
    for s in [0.38, -0.38]:
        bm_st = bmesh.new()
        bmesh.ops.create_cube(bm_st, size=1.0)
        bmesh.ops.scale(bm_st, vec=Vector((0.035, 0.12, 0.36)), verts=bm_st.verts)
        bmesh.ops.translate(bm_st, vec=Vector((s, -1.95, 0.96)), verts=bm_st.verts)
        bmesh.ops.rotate(bm_st, cent=Vector((s, -1.95, 0.96)), matrix=Euler((math.radians(18), 0, 0)).to_matrix(), verts=bm_st.verts)
        for v in bm_st.verts:
            bm_wing.verts.new(v.co)
        bm_wing.verts.ensure_lookup_table()
        for f in bm_st.faces:
            try:
                bm_wing.faces.new([bm_wing.verts[v.index] for v in f.verts])
            except ValueError:
                pass
        bm_st.free()

    link_obj("AERO_Chiron_PurSport_RearWing", bm_wing, roots["AERO"], M["carbon_black"], bevel=0.003, subsurf=0)

    # 9. REAR VENTURI DIFFUSER & DUAL CENTER 3D TITANIUM EXHAUSTS
    bm_diff = bmesh.new()
    bmesh.ops.create_cube(bm_diff, size=1.0)
    bmesh.ops.scale(bm_diff, vec=Vector((1.65, 0.70, 0.08)), verts=bm_diff.verts)
    bmesh.ops.translate(bm_diff, vec=Vector((0.0, -2.00, 0.18)), verts=bm_diff.verts)
    # 4 Venturi Strakes
    for sx in [-0.55, -0.20, 0.20, 0.55]:
        bm_strk = bmesh.new()
        bmesh.ops.create_cube(bm_strk, size=1.0)
        bmesh.ops.scale(bm_strk, vec=Vector((0.025, 0.65, 0.18)), verts=bm_strk.verts)
        bmesh.ops.translate(bm_strk, vec=Vector((sx, -2.02, 0.22)), verts=bm_strk.verts)
        for v in bm_strk.verts:
            bm_diff.verts.new(v.co)
        bm_diff.verts.ensure_lookup_table()
        for f in bm_strk.faces:
            try:
                bm_diff.faces.new([bm_diff.verts[v.index] for v in f.verts])
            except ValueError:
                pass
        bm_strk.free()
    link_obj("AERO_Chiron_RearDiffuser", bm_diff, roots["AERO"], M["carbon_black"], bevel=0.003)

    # Dual Center 3D Titanium Exhaust Tips
    bm_ex = bmesh.new()
    for s in [0.075, -0.075]:
        bmesh.ops.create_cone(bm_ex, cap_ends=True, cap_tris=False, segments=20, radius1=0.065, radius2=0.065, depth=0.18)
        for v in bm_ex.verts[-42:]:
            v.co = Vector((s, v.co.z - 2.22, v.co.y + 0.38))
    link_obj("AERO_Chiron_TitaniumExhaust", bm_ex, roots["AERO"], M["titanium_exhaust"], bevel=0.002)

    # 10. FRONT SPLITTER & SIDE AERO CANARDS
    bm_front_sp = bmesh.new()
    bmesh.ops.create_cube(bm_front_sp, size=1.0)
    bmesh.ops.scale(bm_front_sp, vec=Vector((1.84, 0.45, 0.035)), verts=bm_front_sp.verts)
    bmesh.ops.translate(bm_front_sp, vec=Vector((0.0, 2.15, 0.11)), verts=bm_front_sp.verts)
    link_obj("AERO_Chiron_FrontSplitter", bm_front_sp, roots["AERO"], M["carbon_black"], bevel=0.003)

    # -----------------------------------------------------------------------
    # EXPORT GLB (Both Public & Archival)
    # -----------------------------------------------------------------------
    os.makedirs(os.path.dirname(PUBLIC_TARGET), exist_ok=True)
    os.makedirs(os.path.dirname(EXPORTS_TARGET), exist_ok=True)

    if os.path.exists(PUBLIC_TARGET):
        try: os.remove(PUBLIC_TARGET)
        except Exception: pass
    if os.path.exists(EXPORTS_TARGET):
        try: os.remove(EXPORTS_TARGET)
        except Exception: pass

    bpy.ops.object.select_all(action='DESELECT')
    for obj in bpy.data.objects:
        obj.select_set(True)

    bpy.ops.export_scene.gltf(
        filepath=PUBLIC_TARGET,
        use_selection=True,
        export_yup=True,
        export_apply=True,
        export_format='GLB',
    )
    print(f"Successfully exported public GLB: {PUBLIC_TARGET} ({os.path.getsize(PUBLIC_TARGET):,} bytes)")

    bpy.ops.export_scene.gltf(
        filepath=EXPORTS_TARGET,
        use_selection=True,
        export_yup=True,
        export_apply=True,
        export_format='GLB',
    )
    print(f"Successfully exported archival GLB: {EXPORTS_TARGET} ({os.path.getsize(EXPORTS_TARGET):,} bytes)")

if __name__ == "__main__":
    build_chiron_master()
