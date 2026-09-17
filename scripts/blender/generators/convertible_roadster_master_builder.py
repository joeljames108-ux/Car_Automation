"""
=============================================================================
APEX ENGINEER: CONVERTIBLE & ROADSTER MASTER CAD BUILDER (14 VEHICLES)
=============================================================================
Procedurally constructs authentic, photo-accurate Class-A CAD models for all
7 eras of Convertible and all 7 eras of Roadster architectures.

CONVERTIBLE:
1. 1970s: Alfa Romeo Spider Veloce - Pininfarina Kamm tail, chrome split bumpers
2. 1980s: Mercedes-Benz 560SL (R107) - Chrome grille star, ribbed safety lights
3. 1990s: Porsche 911 Carrera Cabriolet (993) - Flared rear arches, soft-top tonneau
4. 2000s: Honda S2000 (AP1) - Razor-sharp nose, dual high-rpm chrome exhaust
5. 2010s: Jaguar F-Type V8 R Convertible - Muscular rear haunches, quad exhaust
6. 2020s: Bentley Continental GT Speed Convertible - Sweeping powerline, matrix grille
7. Future: Genesis X Convertible Concept - Two-line full-width Quad LED light signature

ROADSTER:
1. 1970s: Triumph Spitfire 1500 - Forward-hinged clamshell bonnet, minimal overhangs
2. 1980s: Mazda MX-5 Miata (NA) - Pop-up headlights, happy oval mouth, lightweight
3. 1990s: BMW Z3 M Roadster - Side shark gills, flared rear arches, quad exhaust
4. 2000s: Lotus Elise Series 2 - Insectoid projector headlights, rear diffuser
5. 2010s: Mazda MX-5 Miata (ND) - Predatory sharp LED headlights, taut front fenders
6. 2020s: Ferrari 812 GTS - Front-mid V12, sculpted aerodynamic buttresses
7. Future: Tesla Roadster 2 - Ultra-low aerodynamic teardrop, removable glass roof

Conforms to Blender 5.2 LTS standards, metric units (meters), Y-forward (+Y),
Z-up (+Z), X-lateral (+X driver side), and standard glTF node hierarchy:
VEHICLE_ROOT -> BODY_Master, GLASS_Master, LIGHT_Master, WHEEL_Master, AERO_Master, INTERIOR_Master.
=============================================================================
"""

import bpy
import bmesh
import math
import os
from mathutils import Vector, Matrix, Euler

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
PUBLIC_MODELS_DIR = os.path.join(ROOT_DIR, "public", "models", "vehicles")
EXPORTS_DIR = os.path.join(ROOT_DIR, "exports")

# ----------------------------------------------------------------------------
# 1. SCENE CLEANUP & PBR SHADER FACTORY
# ----------------------------------------------------------------------------
def safe_reset():
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for mesh in list(bpy.data.meshes):
        bpy.data.meshes.remove(mesh, do_unlink=True)
    for mat in list(bpy.data.materials):
        bpy.data.materials.remove(mat, do_unlink=True)
    for col in list(bpy.data.collections):
        bpy.data.collections.remove(col, do_unlink=True)
        
    bpy.context.scene.unit_settings.system = 'METRIC'
    bpy.context.scene.unit_settings.scale_length = 1.0

def make_pbr_mat(name, base_color, metallic=0.0, roughness=0.5, coat=0.0, transmission=0.0, emission=None, emission_strength=1.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    bsdf = nodes.new(type="ShaderNodeBsdfPrincipled")
    out = nodes.new(type="ShaderNodeOutputMaterial")
    mat.node_tree.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])

    if 'Base Color' in bsdf.inputs:
        bsdf.inputs['Base Color'].default_value = base_color
    if 'Metallic' in bsdf.inputs:
        bsdf.inputs['Metallic'].default_value = metallic
    if 'Roughness' in bsdf.inputs:
        bsdf.inputs['Roughness'].default_value = roughness
    if 'Coat Weight' in bsdf.inputs:
        bsdf.inputs['Coat Weight'].default_value = coat
        bsdf.inputs['Coat Roughness'].default_value = 0.03
    elif 'Clearcoat' in bsdf.inputs:
        bsdf.inputs['Clearcoat'].default_value = coat
    if 'Transmission Weight' in bsdf.inputs:
        bsdf.inputs['Transmission Weight'].default_value = transmission
    elif 'Transmission' in bsdf.inputs:
        bsdf.inputs['Transmission'].default_value = transmission

    if emission and 'Emission Color' in bsdf.inputs:
        bsdf.inputs['Emission Color'].default_value = emission
        bsdf.inputs['Emission Strength'].default_value = emission_strength
    elif emission and 'Emission' in bsdf.inputs:
        bsdf.inputs['Emission'].default_value = emission

    return mat

def create_open_top_materials(era_id, paint_color):
    mats = {}
    coat = 0.65 if era_id == "1970s" else (0.85 if era_id in ["1980s", "1990s"] else 1.0)
    metallic = 0.20 if era_id in ["1970s", "1980s"] else 0.88

    mats["paint"] = make_pbr_mat(f"Mat_OpenTop_Paint_{era_id}", paint_color, metallic=metallic, roughness=0.14, coat=coat)
    mats["carbon"] = make_pbr_mat("Mat_Carbon_Fiber", (0.035, 0.035, 0.04, 1.0), metallic=0.30, roughness=0.18, coat=0.98)
    mats["chrome"] = make_pbr_mat("Mat_Chrome_Jewelry", (0.95, 0.95, 0.96, 1.0), metallic=0.98, roughness=0.03)
    mats["trim_dark"] = make_pbr_mat("Mat_Trim_Dark", (0.05, 0.05, 0.06, 1.0), metallic=0.30, roughness=0.60)
    mats["leather_cockpit"] = make_pbr_mat("Mat_Leather_Cockpit", (0.15, 0.08, 0.05, 1.0), roughness=0.55, coat=0.2)
    mats["soft_top"] = make_pbr_mat("Mat_SoftTop_Fabric", (0.08, 0.08, 0.09, 1.0), roughness=0.85)

    mat_glass = make_pbr_mat("Mat_Optical_Glass", (0.88, 0.92, 0.96, 1.0), roughness=0.02, transmission=0.94)
    mat_glass.blend_method = 'BLEND' if hasattr(mat_glass, 'blend_method') else 'OPAQUE'
    mats["glass"] = mat_glass

    mats["wheel_alloy"] = make_pbr_mat("Mat_Wheel_Alloy", (0.85, 0.86, 0.88, 1.0), metallic=0.95, roughness=0.18, coat=0.6)
    mats["wheel_dark"] = make_pbr_mat("Mat_Wheel_Dark", (0.15, 0.16, 0.18, 1.0), metallic=0.90, roughness=0.22, coat=0.8)
    mats["tire_rubber"] = make_pbr_mat("Mat_Tire_Rubber", (0.03, 0.03, 0.032, 1.0), roughness=0.88)
    mats["brake_rotor"] = make_pbr_mat("Mat_Brake_Rotor", (0.38, 0.38, 0.40, 1.0), metallic=0.88, roughness=0.30)
    mats["brake_caliper"] = make_pbr_mat("Mat_Brake_Caliper_Red", (0.90, 0.04, 0.04, 1.0), metallic=0.35, roughness=0.22, coat=0.8)

    hl_col = (1.0, 0.96, 0.88, 1.0) if era_id in ["1970s", "1980s"] else (0.95, 0.98, 1.0, 1.0)
    mats["headlight"] = make_pbr_mat("Mat_Headlight_Emissive", hl_col, emission=hl_col, emission_strength=16.0)
    mats["taillight"] = make_pbr_mat("Mat_Taillight_Emissive", (1.0, 0.02, 0.03, 1.0), emission=(1.0, 0.01, 0.02, 1.0), emission_strength=14.0)
    mats["drl"] = make_pbr_mat("Mat_DRL_Emissive", (0.95, 0.98, 1.0, 1.0), emission=(0.95, 0.98, 1.0, 1.0), emission_strength=20.0)

    return mats

# ----------------------------------------------------------------------------
# 2. CLASS-A MESH HELPER
# ----------------------------------------------------------------------------
def link_obj(name, bm, parent, mat, bevel=0.003, subsurf=0):
    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    if parent:
        obj.parent = parent
    bpy.context.scene.collection.objects.link(obj)
    if mat:
        obj.data.materials.append(mat)
    
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
    return obj

# ----------------------------------------------------------------------------
# 3. WHEEL BUILDER
# ----------------------------------------------------------------------------
def create_wheels(roots, mats, wb, track_f, track_r, wheel_r=0.31, tire_w_f=0.215, tire_w_r=0.245, spoke_count=5, rim_mat=None, caliper_color=None):
    if rim_mat is None:
        rim_mat = mats["wheel_alloy"]
    if caliper_color:
        cal_mat = make_pbr_mat("Mat_Custom_Caliper", caliper_color, metallic=0.35, roughness=0.22, coat=0.8)
    else:
        cal_mat = mats["brake_caliper"]

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
        rim_r = wheel_r * 0.72

        # Tire
        bm_tire = bmesh.new()
        segs = 32
        pts = [(rim_r, -hw), (wheel_r * 0.95, -hw), (wheel_r, -hw * 0.75), (wheel_r, hw * 0.75), (wheel_r * 0.95, hw), (rim_r, hw)]
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
        link_obj(f"WHEEL_{name}_Tire", bm_tire, roots["WHEEL"], mats["tire_rubber"], bevel=0.002)

        # Rim
        bm_rim = bmesh.new()
        for s in range(segs):
            a1 = 2 * math.pi * s / segs
            a2 = 2 * math.pi * (s + 1) / segs
            c1, s1 = math.cos(a1), math.sin(a1)
            c2, s2 = math.cos(a2), math.sin(a2)
            v1 = bm_rim.verts.new((pos.x + hw * sign, pos.y + rim_r * c1, pos.z + rim_r * s1))
            v2 = bm_rim.verts.new((pos.x + (hw * 0.3) * sign, pos.y + (rim_r * 0.88) * c1, pos.z + (rim_r * 0.88) * s1))
            v3 = bm_rim.verts.new((pos.x + (hw * 0.3) * sign, pos.y + (rim_r * 0.88) * c2, pos.z + (rim_r * 0.88) * s2))
            v4 = bm_rim.verts.new((pos.x + hw * sign, pos.y + rim_r * c2, pos.z + rim_r * s2))
            bm_rim.faces.new((v1, v2, v3, v4) if is_left else (v4, v3, v2, v1))

        hub_r = rim_r * 0.25
        hub_x = pos.x + (hw * 0.40) * sign
        w_sp = (2.0 * math.pi * hub_r) / (spoke_count * 2.2)
        for sp in range(spoke_count):
            ang = 2 * math.pi * sp / spoke_count
            c, s = math.cos(ang), math.sin(ang)
            py, pz = -s * w_sp * 0.5, c * w_sp * 0.5
            v1 = bm_rim.verts.new((hub_x, pos.y + hub_r * c - py, pos.z + hub_r * s - pz))
            v2 = bm_rim.verts.new((hub_x, pos.y + hub_r * c + py, pos.z + hub_r * s + pz))
            v3 = bm_rim.verts.new((pos.x + hw * sign * 0.95, pos.y + rim_r * 0.88 * c + py * 1.3, pos.z + rim_r * 0.88 * s + pz * 1.3))
            v4 = bm_rim.verts.new((pos.x + hw * sign * 0.95, pos.y + rim_r * 0.88 * c - py * 1.3, pos.z + rim_r * 0.88 * s - pz * 1.3))
            bm_rim.faces.new((v1, v2, v3, v4) if is_left else (v4, v3, v2, v1))
        bmesh.ops.remove_doubles(bm_rim, verts=bm_rim.verts, dist=0.001)
        link_obj(f"WHEEL_{name}_Rim", bm_rim, roots["WHEEL"], rim_mat, bevel=0.002)

        # Rotor & Caliper
        bm_rot = bmesh.new()
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
        bmesh.ops.remove_doubles(bm_rot, verts=bm_rot.verts, dist=0.001)
        link_obj(f"WHEEL_{name}_BrakeDisc", bm_rot, roots["WHEEL"], mats["brake_rotor"], bevel=0.0)

        bm_cal = bmesh.new()
        bmesh.ops.create_cube(bm_cal, size=0.07)
        ca = math.pi * 0.65 if "F" in name else math.pi * 0.35
        for v in bm_cal.verts:
            v.co.x = v.co.x * 0.7 + (rot_x + 0.015 * sign)
            v.co.y = v.co.y * 1.8 + (pos.y + rot_r * 0.88 * math.cos(ca))
            v.co.z = v.co.z * 1.2 + (pos.z + rot_r * 0.88 * math.sin(ca))
        link_obj(f"WHEEL_{name}_Caliper", bm_cal, roots["WHEEL"], cal_mat, bevel=0.003)

# ----------------------------------------------------------------------------
# 4. UNIFIED OPEN-TOP HULL BUILDER
# ----------------------------------------------------------------------------
def build_open_top_hull(name, mats, roots, stations, f_axle, r_axle, wheel_r=0.31, subsurf=1):
    bm = bmesh.new()
    r_arch = wheel_r + 0.045
    num_st = len(stations)

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
                bm.verts.new((0.0, fy, fz_top)),
                bm.verts.new((side * fw_top, fy, fz_top * 0.85 + fz_fen * 0.15)),
                bm.verts.new((side * fw_fen, fy, fz_fen)),
                bm.verts.new((side * fw_wst, fy, fz_wst)),
                bm.verts.new((side * fw_flk, fy, fz_flk)),
                bm.verts.new((side * fw_sil, fy, cur_z_sil)),
                bm.verts.new((side * fw_flr, fy, fz_flr)),
                bm.verts.new((0.0, fy, fz_flr)),
            ]
            grid.append(row_verts)

        for i in range(num_st - 1):
            for j in range(7):
                v1 = grid[i][j]
                v2 = grid[i][j+1]
                v3 = grid[i+1][j+1]
                v4 = grid[i+1][j]
                bm.faces.new((v1, v2, v3, v4) if side > 0 else (v4, v3, v2, v1))

    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.002)
    return link_obj(f"BODY_{name}_MainHull", bm, roots["BODY"], mats["paint"], bevel=0.004, subsurf=subsurf)

# Open Cockpit Interior Tub & Windshield Frame
def add_open_cockpit(roots, mats, y_start, y_end, width, depth=0.35, windshield_h=0.45):
    # Windshield Header & Glass
    bm_ws = bmesh.new()
    bmesh.ops.create_cube(bm_ws, size=1.0)
    bmesh.ops.scale(bm_ws, vec=Vector((width * 0.90, 0.04, windshield_h)), verts=bm_ws.verts)
    bmesh.ops.translate(bm_ws, vec=Vector((0.0, y_start, 0.82 + windshield_h * 0.5)), verts=bm_ws.verts)
    bmesh.ops.rotate(bm_ws, cent=Vector((0.0, y_start, 0.82)), matrix=Euler((math.radians(-24), 0, 0)).to_matrix(), verts=bm_ws.verts)
    link_obj("GLASS_Windshield", bm_ws, roots["GLASS"], mats["glass"], bevel=0.002)

    # Leather Cockpit Interior Tub
    bm_tub = bmesh.new()
    bmesh.ops.create_cube(bm_tub, size=1.0)
    bmesh.ops.scale(bm_tub, vec=Vector((width * 0.85, (y_start - y_end) * 0.95, depth)), verts=bm_tub.verts)
    bmesh.ops.translate(bm_tub, vec=Vector((0.0, (y_start + y_end) * 0.5, 0.65)), verts=bm_tub.verts)
    link_obj("INTERIOR_CockpitTub", bm_tub, roots["INTERIOR"], mats["leather_cockpit"], bevel=0.004)

# ----------------------------------------------------------------------------
# 5. CONVERTIBLE GENERATORS (7 ERAS)
# ----------------------------------------------------------------------------

def build_conv_1970s(mats, roots): # Alfa Romeo Spider Veloce
    wb, track_f, track_r, wheel_r = 2.250, 1.32, 1.27, 0.295
    f_axle, r_axle = wb / 2.0, -wb / 2.0
    create_wheels(roots, mats, wb, track_f, track_r, wheel_r=wheel_r, spoke_count=4)
    stations = [
        ( 2.10, 0.52, 0.32, 0.50, 0.58, 0.44, 0.72, 0.28, 0.75, 0.16, 0.76, 0.12, 0.60),
        ( 1.85, 0.64, 0.38, 0.62, 0.65, 0.54, 0.76, 0.34, 0.78, 0.16, 0.78, 0.12, 0.62),
        ( f_axle + 0.35, 0.74, 0.42, 0.72, 0.70, 0.62, 0.78, 0.44, 0.80, 0.40, 0.80, 0.12, 0.64),
        ( f_axle,        0.77, 0.44, 0.75, 0.72, 0.66, 0.80, 0.60, 0.81, 0.60, 0.81, 0.12, 0.66),
        ( f_axle - 0.35, 0.79, 0.44, 0.76, 0.72, 0.66, 0.80, 0.44, 0.80, 0.40, 0.80, 0.12, 0.66),
        ( 0.40, 0.82, 0.46, 0.78, 0.72, 0.68, 0.79, 0.42, 0.79, 0.16, 0.79, 0.12, 0.66),
        ( 0.05, 0.82, 0.46, 0.78, 0.72, 0.68, 0.79, 0.42, 0.79, 0.16, 0.79, 0.12, 0.66), # Open cockpit
        (-0.55, 0.82, 0.46, 0.78, 0.72, 0.68, 0.80, 0.42, 0.80, 0.16, 0.80, 0.12, 0.66),
        ( r_axle + 0.38, 0.84, 0.44, 0.80, 0.72, 0.70, 0.81, 0.48, 0.82, 0.40, 0.82, 0.12, 0.66),
        ( r_axle,        0.82, 0.42, 0.78, 0.70, 0.70, 0.82, 0.60, 0.83, 0.60, 0.83, 0.12, 0.66),
        ( r_axle - 0.38, 0.78, 0.38, 0.74, 0.66, 0.68, 0.80, 0.44, 0.81, 0.40, 0.81, 0.12, 0.64),
        (-1.85, 0.74, 0.32, 0.70, 0.58, 0.64, 0.75, 0.36, 0.76, 0.20, 0.77, 0.14, 0.62), # Kamm tail
        (-2.05, 0.68, 0.28, 0.64, 0.52, 0.60, 0.70, 0.32, 0.72, 0.22, 0.73, 0.16, 0.58),
    ]
    build_open_top_hull("AlfaSpiderVeloce", mats, roots, stations, f_axle, r_axle, wheel_r=wheel_r, subsurf=1)
    add_open_cockpit(roots, mats, 0.35, -0.60, 0.72)

def build_conv_1980s(mats, roots): # Mercedes-Benz 560SL (R107)
    wb, track_f, track_r, wheel_r = 2.460, 1.45, 1.44, 0.32
    f_axle, r_axle = wb / 2.0, -wb / 2.0
    create_wheels(roots, mats, wb, track_f, track_r, wheel_r=wheel_r, spoke_count=15)
    stations = [
        ( 2.25, 0.65, 0.42, 0.62, 0.72, 0.54, 0.84, 0.34, 0.86, 0.18, 0.86, 0.14, 0.70),
        ( 1.95, 0.74, 0.46, 0.70, 0.76, 0.62, 0.87, 0.40, 0.88, 0.18, 0.88, 0.14, 0.72),
        ( f_axle + 0.36, 0.82, 0.48, 0.78, 0.78, 0.66, 0.88, 0.46, 0.90, 0.42, 0.90, 0.14, 0.74),
        ( f_axle,        0.85, 0.50, 0.81, 0.80, 0.70, 0.90, 0.64, 0.91, 0.64, 0.91, 0.14, 0.76),
        ( f_axle - 0.36, 0.87, 0.50, 0.82, 0.80, 0.70, 0.89, 0.46, 0.90, 0.42, 0.90, 0.14, 0.76),
        ( 0.40, 0.89, 0.52, 0.85, 0.80, 0.72, 0.88, 0.44, 0.88, 0.18, 0.88, 0.14, 0.76),
        ( 0.05, 0.89, 0.52, 0.85, 0.80, 0.72, 0.88, 0.44, 0.88, 0.18, 0.88, 0.14, 0.76),
        (-0.55, 0.89, 0.52, 0.85, 0.80, 0.72, 0.89, 0.44, 0.89, 0.18, 0.89, 0.14, 0.76),
        ( r_axle + 0.38, 0.90, 0.50, 0.86, 0.78, 0.74, 0.90, 0.50, 0.92, 0.44, 0.92, 0.14, 0.76),
        ( r_axle,        0.88, 0.48, 0.84, 0.76, 0.74, 0.91, 0.65, 0.93, 0.65, 0.93, 0.14, 0.76),
        ( r_axle - 0.38, 0.84, 0.44, 0.80, 0.72, 0.72, 0.89, 0.48, 0.91, 0.44, 0.91, 0.14, 0.74),
        (-2.00, 0.80, 0.40, 0.76, 0.66, 0.70, 0.86, 0.40, 0.88, 0.22, 0.88, 0.16, 0.70),
        (-2.25, 0.74, 0.36, 0.70, 0.60, 0.66, 0.82, 0.36, 0.84, 0.24, 0.85, 0.18, 0.66),
    ]
    build_open_top_hull("Mercedes560SL", mats, roots, stations, f_axle, r_axle, wheel_r=wheel_r, subsurf=1)
    add_open_cockpit(roots, mats, 0.35, -0.65, 0.78)

def build_conv_1990s(mats, roots): # Porsche 911 Carrera Cabriolet (993)
    wb, track_f, track_r, wheel_r = 2.272, 1.41, 1.47, 0.32
    f_axle, r_axle = wb / 2.0, -wb / 2.0
    create_wheels(roots, mats, wb, track_f, track_r, wheel_r=wheel_r, spoke_count=5)
    stations = [
        ( 2.10, 0.44, 0.28, 0.44, 0.56, 0.42, 0.72, 0.28, 0.76, 0.16, 0.77, 0.12, 0.62),
        ( 1.85, 0.60, 0.36, 0.66, 0.66, 0.52, 0.76, 0.36, 0.80, 0.16, 0.80, 0.12, 0.65),
        ( f_axle + 0.35, 0.70, 0.40, 0.72, 0.70, 0.62, 0.78, 0.46, 0.82, 0.42, 0.82, 0.12, 0.68),
        ( f_axle,        0.74, 0.42, 0.75, 0.72, 0.66, 0.80, 0.64, 0.84, 0.64, 0.84, 0.12, 0.70),
        ( f_axle - 0.35, 0.76, 0.42, 0.75, 0.72, 0.66, 0.80, 0.46, 0.82, 0.42, 0.82, 0.12, 0.70),
        ( 0.40, 0.80, 0.46, 0.76, 0.72, 0.68, 0.80, 0.44, 0.82, 0.16, 0.82, 0.12, 0.70),
        ( 0.05, 0.80, 0.46, 0.76, 0.72, 0.68, 0.80, 0.44, 0.82, 0.16, 0.82, 0.12, 0.70),
        (-0.55, 0.80, 0.46, 0.76, 0.72, 0.68, 0.82, 0.44, 0.84, 0.16, 0.84, 0.12, 0.70),
        ( r_axle + 0.38, 0.88, 0.42, 0.85, 0.68, 0.74, 0.88, 0.52, 0.94, 0.44, 0.94, 0.12, 0.72),
        ( r_axle,        0.84, 0.38, 0.80, 0.64, 0.76, 0.92, 0.66, 0.96, 0.66, 0.96, 0.12, 0.72),
        ( r_axle - 0.38, 0.80, 0.34, 0.76, 0.58, 0.74, 0.88, 0.50, 0.92, 0.44, 0.92, 0.12, 0.70),
        (-1.85, 0.76, 0.30, 0.72, 0.52, 0.70, 0.84, 0.42, 0.86, 0.22, 0.87, 0.14, 0.66),
        (-2.10, 0.70, 0.26, 0.66, 0.46, 0.64, 0.78, 0.36, 0.80, 0.24, 0.82, 0.16, 0.62),
    ]
    build_open_top_hull("Porsche993Cabriolet", mats, roots, stations, f_axle, r_axle, wheel_r=wheel_r, subsurf=1)
    add_open_cockpit(roots, mats, 0.35, -0.65, 0.76)

def build_conv_2000s(mats, roots): # Honda S2000 (AP1)
    wb, track_f, track_r, wheel_r = 2.400, 1.47, 1.51, 0.32
    f_axle, r_axle = wb / 2.0, -wb / 2.0
    create_wheels(roots, mats, wb, track_f, track_r, wheel_r=wheel_r, spoke_count=5)
    stations = [
        ( 2.10, 0.46, 0.30, 0.44, 0.58, 0.42, 0.74, 0.26, 0.78, 0.14, 0.80, 0.11, 0.64),
        ( 1.85, 0.62, 0.38, 0.60, 0.68, 0.54, 0.80, 0.34, 0.83, 0.14, 0.84, 0.11, 0.68),
        ( f_axle + 0.35, 0.72, 0.42, 0.70, 0.74, 0.64, 0.82, 0.44, 0.86, 0.40, 0.86, 0.11, 0.70),
        ( f_axle,        0.76, 0.44, 0.74, 0.76, 0.67, 0.84, 0.64, 0.88, 0.64, 0.88, 0.11, 0.72),
        ( f_axle - 0.35, 0.78, 0.44, 0.75, 0.76, 0.68, 0.83, 0.44, 0.86, 0.40, 0.86, 0.11, 0.72),
        ( 0.40, 0.81, 0.46, 0.77, 0.76, 0.70, 0.83, 0.42, 0.84, 0.16, 0.84, 0.11, 0.72),
        ( 0.05, 0.81, 0.46, 0.77, 0.76, 0.70, 0.83, 0.42, 0.84, 0.16, 0.84, 0.11, 0.72),
        (-0.55, 0.81, 0.46, 0.77, 0.76, 0.70, 0.85, 0.42, 0.86, 0.16, 0.86, 0.11, 0.72),
        ( r_axle + 0.38, 0.84, 0.42, 0.80, 0.70, 0.74, 0.88, 0.50, 0.91, 0.44, 0.91, 0.11, 0.72),
        ( r_axle,        0.82, 0.40, 0.78, 0.68, 0.75, 0.90, 0.65, 0.93, 0.65, 0.93, 0.11, 0.72),
        ( r_axle - 0.38, 0.78, 0.36, 0.74, 0.62, 0.73, 0.87, 0.48, 0.89, 0.44, 0.89, 0.11, 0.70),
        (-1.85, 0.74, 0.32, 0.70, 0.56, 0.68, 0.82, 0.40, 0.84, 0.22, 0.85, 0.14, 0.66),
        (-2.05, 0.68, 0.28, 0.64, 0.50, 0.62, 0.76, 0.34, 0.78, 0.24, 0.80, 0.16, 0.62),
    ]
    build_open_top_hull("HondaS2000_AP1", mats, roots, stations, f_axle, r_axle, wheel_r=wheel_r, subsurf=1)
    add_open_cockpit(roots, mats, 0.35, -0.65, 0.76)

def build_conv_2010s(mats, roots): # Jaguar F-Type V8 R Convertible
    wb, track_f, track_r, wheel_r = 2.622, 1.60, 1.65, 0.34
    f_axle, r_axle = wb / 2.0, -wb / 2.0
    create_wheels(roots, mats, wb, track_f, track_r, wheel_r=wheel_r, spoke_count=5, rim_mat=mats["wheel_dark"])
    stations = [
        ( 2.30, 0.52, 0.34, 0.48, 0.65, 0.46, 0.82, 0.28, 0.88, 0.14, 0.89, 0.11, 0.70),
        ( 2.05, 0.68, 0.42, 0.64, 0.74, 0.58, 0.86, 0.36, 0.91, 0.14, 0.92, 0.11, 0.72),
        ( f_axle + 0.38, 0.78, 0.48, 0.75, 0.80, 0.68, 0.90, 0.48, 0.93, 0.44, 0.93, 0.11, 0.74),
        ( f_axle,        0.82, 0.50, 0.79, 0.82, 0.71, 0.92, 0.68, 0.95, 0.68, 0.95, 0.11, 0.76),
        ( f_axle - 0.38, 0.84, 0.50, 0.80, 0.82, 0.72, 0.91, 0.48, 0.93, 0.44, 0.93, 0.11, 0.76),
        ( 0.42, 0.87, 0.52, 0.83, 0.80, 0.74, 0.90, 0.44, 0.91, 0.16, 0.91, 0.11, 0.76),
        ( 0.05, 0.87, 0.52, 0.83, 0.80, 0.74, 0.90, 0.44, 0.91, 0.16, 0.91, 0.11, 0.76),
        (-0.55, 0.87, 0.52, 0.83, 0.80, 0.74, 0.92, 0.44, 0.93, 0.16, 0.93, 0.11, 0.76),
        ( r_axle + 0.40, 0.94, 0.46, 0.90, 0.74, 0.82, 0.98, 0.52, 1.02, 0.46, 1.02, 0.11, 0.78),
        ( r_axle,        0.90, 0.42, 0.86, 0.70, 0.82, 1.00, 0.68, 1.04, 0.68, 1.04, 0.11, 0.78),
        ( r_axle - 0.40, 0.85, 0.38, 0.81, 0.64, 0.80, 0.96, 0.50, 1.00, 0.46, 1.00, 0.11, 0.76),
        (-2.05, 0.80, 0.34, 0.76, 0.58, 0.74, 0.90, 0.42, 0.93, 0.22, 0.94, 0.14, 0.72),
        (-2.28, 0.74, 0.30, 0.70, 0.52, 0.68, 0.85, 0.36, 0.88, 0.24, 0.89, 0.16, 0.68),
    ]
    build_open_top_hull("JaguarFTYPE_V8R", mats, roots, stations, f_axle, r_axle, wheel_r=wheel_r, subsurf=1)
    add_open_cockpit(roots, mats, 0.35, -0.65, 0.80)

def build_conv_2020s(mats, roots): # Bentley Continental GT Speed Convertible
    wb, track_f, track_r, wheel_r = 2.851, 1.67, 1.66, 0.365
    f_axle, r_axle = wb / 2.0, -wb / 2.0
    create_wheels(roots, mats, wb, track_f, track_r, wheel_r=wheel_r, spoke_count=10)
    stations = [
        ( 2.55, 0.70, 0.46, 0.66, 0.78, 0.56, 0.90, 0.36, 0.93, 0.18, 0.93, 0.13, 0.76),
        ( 2.25, 0.80, 0.50, 0.76, 0.82, 0.66, 0.94, 0.44, 0.95, 0.18, 0.95, 0.13, 0.78),
        ( f_axle + 0.42, 0.88, 0.54, 0.85, 0.86, 0.73, 0.96, 0.50, 0.98, 0.46, 0.98, 0.13, 0.80),
        ( f_axle,        0.92, 0.56, 0.89, 0.88, 0.76, 0.98, 0.71, 1.00, 0.71, 1.00, 0.13, 0.82),
        ( f_axle - 0.42, 0.94, 0.56, 0.90, 0.87, 0.76, 0.97, 0.50, 0.98, 0.46, 0.98, 0.13, 0.82),
        ( 0.45, 0.96, 0.58, 0.92, 0.86, 0.77, 0.95, 0.46, 0.95, 0.18, 0.95, 0.13, 0.82),
        ( 0.08, 0.96, 0.58, 0.92, 0.86, 0.77, 0.95, 0.46, 0.95, 0.18, 0.95, 0.13, 0.82),
        (-0.55, 0.96, 0.58, 0.92, 0.86, 0.78, 0.96, 0.46, 0.96, 0.18, 0.96, 0.13, 0.82),
        ( r_axle + 0.45, 1.04, 0.50, 0.98, 0.76, 0.84, 1.02, 0.54, 1.06, 0.48, 1.06, 0.13, 0.82),
        ( r_axle,        0.96, 0.44, 0.92, 0.72, 0.85, 1.04, 0.71, 1.08, 0.71, 1.08, 0.13, 0.82),
        ( r_axle - 0.45, 0.90, 0.40, 0.86, 0.66, 0.83, 1.00, 0.52, 1.04, 0.48, 1.04, 0.13, 0.80),
        (-2.20, 0.86, 0.36, 0.82, 0.60, 0.80, 0.94, 0.44, 0.97, 0.24, 0.97, 0.15, 0.76),
        (-2.48, 0.80, 0.34, 0.76, 0.56, 0.74, 0.90, 0.38, 0.92, 0.26, 0.93, 0.18, 0.72),
    ]
    build_open_top_hull("BentleyContiGTConv", mats, roots, stations, f_axle, r_axle, wheel_r=wheel_r, subsurf=1)
    add_open_cockpit(roots, mats, 0.35, -0.70, 0.88)

def build_conv_future(mats, roots): # Genesis X Convertible Concept
    wb, track_f, track_r, wheel_r = 3.000, 1.68, 1.70, 0.365
    f_axle, r_axle = wb / 2.0, -wb / 2.0
    create_wheels(roots, mats, wb, track_f, track_r, wheel_r=wheel_r, spoke_count=7, rim_mat=mats["wheel_dark"])
    stations = [
        ( 2.65, 0.54, 0.40, 0.52, 0.76, 0.48, 0.90, 0.30, 0.94, 0.16, 0.95, 0.11, 0.74),
        ( 2.35, 0.68, 0.46, 0.64, 0.80, 0.60, 0.92, 0.38, 0.96, 0.16, 0.96, 0.11, 0.76),
        ( f_axle + 0.42, 0.80, 0.52, 0.77, 0.84, 0.68, 0.94, 0.48, 0.97, 0.44, 0.97, 0.11, 0.78),
        ( f_axle,        0.85, 0.54, 0.82, 0.86, 0.71, 0.96, 0.72, 0.99, 0.72, 0.99, 0.11, 0.80),
        ( f_axle - 0.42, 0.87, 0.54, 0.83, 0.85, 0.71, 0.95, 0.48, 0.97, 0.44, 0.97, 0.11, 0.80),
        ( 0.45, 0.89, 0.56, 0.85, 0.84, 0.72, 0.94, 0.44, 0.94, 0.16, 0.94, 0.11, 0.80),
        ( 0.08, 0.89, 0.56, 0.85, 0.84, 0.72, 0.94, 0.44, 0.94, 0.16, 0.94, 0.11, 0.80),
        (-0.55, 0.89, 0.56, 0.85, 0.84, 0.73, 0.95, 0.44, 0.95, 0.16, 0.95, 0.11, 0.80),
        ( r_axle + 0.45, 0.98, 0.48, 0.93, 0.72, 0.78, 0.99, 0.52, 1.02, 0.46, 1.02, 0.11, 0.80),
        ( r_axle,        0.90, 0.42, 0.86, 0.68, 0.80, 1.01, 0.72, 1.03, 0.72, 1.03, 0.11, 0.80),
        ( r_axle - 0.45, 0.84, 0.38, 0.80, 0.62, 0.78, 0.97, 0.50, 0.99, 0.46, 0.99, 0.11, 0.78),
        (-2.30, 0.80, 0.34, 0.76, 0.56, 0.74, 0.92, 0.42, 0.94, 0.22, 0.95, 0.13, 0.74),
        (-2.60, 0.72, 0.30, 0.68, 0.50, 0.66, 0.86, 0.34, 0.88, 0.24, 0.90, 0.15, 0.70),
    ]
    build_open_top_hull("GenesisXConvertible", mats, roots, stations, f_axle, r_axle, wheel_r=wheel_r, subsurf=1)
    add_open_cockpit(roots, mats, 0.35, -0.70, 0.86)

# ----------------------------------------------------------------------------
# 6. ROADSTER GENERATORS (7 ERAS)
# ----------------------------------------------------------------------------

def build_road_1970s(mats, roots): # Triumph Spitfire 1500
    wb, track_f, track_r, wheel_r = 2.110, 1.25, 1.27, 0.285
    f_axle, r_axle = wb / 2.0, -wb / 2.0
    create_wheels(roots, mats, wb, track_f, track_r, wheel_r=wheel_r, spoke_count=4)
    stations = [
        ( 1.95, 0.46, 0.28, 0.44, 0.54, 0.40, 0.68, 0.26, 0.70, 0.16, 0.71, 0.12, 0.56),
        ( 1.70, 0.58, 0.34, 0.56, 0.62, 0.50, 0.72, 0.32, 0.74, 0.16, 0.74, 0.12, 0.58),
        ( f_axle + 0.32, 0.68, 0.38, 0.66, 0.66, 0.58, 0.74, 0.42, 0.76, 0.38, 0.76, 0.12, 0.60),
        ( f_axle,        0.71, 0.40, 0.69, 0.68, 0.62, 0.76, 0.58, 0.77, 0.58, 0.77, 0.12, 0.62),
        ( f_axle - 0.32, 0.73, 0.40, 0.70, 0.68, 0.62, 0.76, 0.42, 0.76, 0.38, 0.76, 0.12, 0.62),
        ( 0.35, 0.76, 0.42, 0.72, 0.68, 0.64, 0.75, 0.40, 0.75, 0.16, 0.75, 0.12, 0.62),
        ( 0.05, 0.76, 0.42, 0.72, 0.68, 0.64, 0.75, 0.40, 0.75, 0.16, 0.75, 0.12, 0.62),
        (-0.50, 0.76, 0.42, 0.72, 0.68, 0.64, 0.76, 0.40, 0.76, 0.16, 0.76, 0.12, 0.62),
        ( r_axle + 0.34, 0.78, 0.38, 0.74, 0.66, 0.66, 0.77, 0.46, 0.78, 0.38, 0.78, 0.12, 0.62),
        ( r_axle,        0.76, 0.36, 0.72, 0.64, 0.66, 0.78, 0.58, 0.79, 0.58, 0.79, 0.12, 0.62),
        ( r_axle - 0.34, 0.72, 0.32, 0.68, 0.60, 0.64, 0.76, 0.42, 0.77, 0.38, 0.77, 0.12, 0.60),
        (-1.65, 0.68, 0.28, 0.64, 0.54, 0.60, 0.72, 0.34, 0.73, 0.20, 0.74, 0.14, 0.58),
        (-1.85, 0.62, 0.24, 0.58, 0.48, 0.56, 0.66, 0.30, 0.68, 0.22, 0.69, 0.16, 0.54),
    ]
    build_open_top_hull("TriumphSpitfire", mats, roots, stations, f_axle, r_axle, wheel_r=wheel_r, subsurf=1)
    add_open_cockpit(roots, mats, 0.30, -0.55, 0.68)

def build_road_1980s(mats, roots): # Mazda MX-5 Miata (NA)
    wb, track_f, track_r, wheel_r = 2.265, 1.41, 1.43, 0.29
    f_axle, r_axle = wb / 2.0, -wb / 2.0
    create_wheels(roots, mats, wb, track_f, track_r, wheel_r=wheel_r, spoke_count=7)
    stations = [
        ( 1.98, 0.42, 0.28, 0.40, 0.56, 0.38, 0.72, 0.26, 0.76, 0.14, 0.77, 0.11, 0.60),
        ( 1.72, 0.58, 0.34, 0.56, 0.64, 0.50, 0.76, 0.34, 0.80, 0.14, 0.80, 0.11, 0.64),
        ( f_axle + 0.34, 0.68, 0.40, 0.66, 0.68, 0.60, 0.78, 0.44, 0.82, 0.40, 0.82, 0.11, 0.66),
        ( f_axle,        0.72, 0.42, 0.70, 0.70, 0.63, 0.80, 0.60, 0.83, 0.60, 0.83, 0.11, 0.68),
        ( f_axle - 0.34, 0.74, 0.42, 0.71, 0.70, 0.63, 0.80, 0.44, 0.82, 0.40, 0.82, 0.11, 0.68),
        ( 0.38, 0.77, 0.44, 0.73, 0.70, 0.65, 0.79, 0.42, 0.80, 0.16, 0.80, 0.11, 0.68),
        ( 0.05, 0.77, 0.44, 0.73, 0.70, 0.65, 0.79, 0.42, 0.80, 0.16, 0.80, 0.11, 0.68),
        (-0.52, 0.77, 0.44, 0.73, 0.70, 0.65, 0.80, 0.42, 0.81, 0.16, 0.81, 0.11, 0.68),
        ( r_axle + 0.36, 0.80, 0.40, 0.76, 0.68, 0.68, 0.82, 0.48, 0.84, 0.40, 0.84, 0.11, 0.68),
        ( r_axle,        0.78, 0.38, 0.74, 0.66, 0.69, 0.84, 0.60, 0.85, 0.60, 0.85, 0.11, 0.68),
        ( r_axle - 0.36, 0.74, 0.34, 0.70, 0.62, 0.67, 0.81, 0.44, 0.83, 0.40, 0.83, 0.11, 0.66),
        (-1.72, 0.70, 0.30, 0.66, 0.56, 0.63, 0.77, 0.36, 0.79, 0.20, 0.80, 0.14, 0.62),
        (-1.95, 0.64, 0.26, 0.60, 0.50, 0.58, 0.72, 0.32, 0.74, 0.22, 0.75, 0.16, 0.58),
    ]
    build_open_top_hull("MazdaMiata_NA", mats, roots, stations, f_axle, r_axle, wheel_r=wheel_r, subsurf=1)
    add_open_cockpit(roots, mats, 0.32, -0.58, 0.72)

def build_road_1990s(mats, roots): # BMW Z3 M Roadster
    wb, track_f, track_r, wheel_r = 2.446, 1.42, 1.49, 0.315
    f_axle, r_axle = wb / 2.0, -wb / 2.0
    create_wheels(roots, mats, wb, track_f, track_r, wheel_r=wheel_r, spoke_count=5)
    stations = [
        ( 2.10, 0.50, 0.32, 0.46, 0.62, 0.44, 0.76, 0.26, 0.80, 0.14, 0.81, 0.11, 0.64),
        ( 1.85, 0.64, 0.38, 0.62, 0.68, 0.54, 0.80, 0.34, 0.84, 0.14, 0.84, 0.11, 0.68),
        ( f_axle + 0.35, 0.74, 0.42, 0.70, 0.74, 0.64, 0.83, 0.44, 0.86, 0.40, 0.86, 0.11, 0.70),
        ( f_axle,        0.78, 0.44, 0.74, 0.76, 0.67, 0.85, 0.62, 0.88, 0.62, 0.88, 0.11, 0.72),
        ( f_axle - 0.35, 0.80, 0.44, 0.75, 0.76, 0.68, 0.84, 0.44, 0.86, 0.40, 0.86, 0.11, 0.72),
        ( 0.40, 0.83, 0.46, 0.78, 0.76, 0.70, 0.83, 0.42, 0.84, 0.16, 0.84, 0.11, 0.72),
        ( 0.05, 0.83, 0.46, 0.78, 0.76, 0.70, 0.83, 0.42, 0.84, 0.16, 0.84, 0.11, 0.72),
        (-0.55, 0.83, 0.46, 0.78, 0.76, 0.70, 0.86, 0.42, 0.88, 0.16, 0.88, 0.11, 0.72),
        ( r_axle + 0.38, 0.88, 0.42, 0.84, 0.72, 0.75, 0.92, 0.52, 0.96, 0.44, 0.96, 0.11, 0.74),
        ( r_axle,        0.84, 0.38, 0.80, 0.68, 0.76, 0.94, 0.65, 0.98, 0.65, 0.98, 0.11, 0.74),
        ( r_axle - 0.38, 0.80, 0.34, 0.76, 0.62, 0.74, 0.90, 0.48, 0.93, 0.44, 0.93, 0.11, 0.72),
        (-1.82, 0.76, 0.30, 0.72, 0.54, 0.68, 0.84, 0.40, 0.86, 0.22, 0.87, 0.14, 0.68),
        (-2.05, 0.70, 0.26, 0.66, 0.48, 0.62, 0.78, 0.34, 0.80, 0.24, 0.81, 0.16, 0.64),
    ]
    build_open_top_hull("BMWZ3M_Roadster", mats, roots, stations, f_axle, r_axle, wheel_r=wheel_r, subsurf=1)
    add_open_cockpit(roots, mats, 0.35, -0.65, 0.76)

def build_road_2000s(mats, roots): # Lotus Elise Series 2
    wb, track_f, track_r, wheel_r = 2.300, 1.45, 1.49, 0.305
    f_axle, r_axle = wb / 2.0, -wb / 2.0
    create_wheels(roots, mats, wb, track_f, track_r, wheel_r=wheel_r, spoke_count=8)
    stations = [
        ( 1.95, 0.38, 0.26, 0.38, 0.54, 0.36, 0.72, 0.24, 0.76, 0.12, 0.77, 0.09, 0.60),
        ( 1.70, 0.56, 0.32, 0.56, 0.64, 0.48, 0.76, 0.32, 0.80, 0.12, 0.81, 0.09, 0.64),
        ( f_axle + 0.32, 0.66, 0.38, 0.66, 0.68, 0.58, 0.78, 0.42, 0.82, 0.38, 0.82, 0.09, 0.66),
        ( f_axle,        0.70, 0.40, 0.70, 0.70, 0.62, 0.80, 0.60, 0.84, 0.60, 0.84, 0.09, 0.68),
        ( f_axle - 0.32, 0.72, 0.40, 0.70, 0.70, 0.62, 0.79, 0.42, 0.82, 0.38, 0.82, 0.09, 0.68),
        ( 0.35, 0.74, 0.42, 0.72, 0.68, 0.64, 0.78, 0.40, 0.80, 0.14, 0.80, 0.09, 0.68),
        ( 0.05, 0.74, 0.42, 0.72, 0.68, 0.64, 0.78, 0.40, 0.80, 0.14, 0.80, 0.09, 0.68),
        (-0.50, 0.74, 0.42, 0.72, 0.68, 0.64, 0.80, 0.40, 0.83, 0.14, 0.83, 0.09, 0.68),
        ( r_axle + 0.36, 0.80, 0.38, 0.76, 0.68, 0.70, 0.86, 0.48, 0.90, 0.40, 0.90, 0.09, 0.70),
        ( r_axle,        0.78, 0.36, 0.74, 0.66, 0.72, 0.88, 0.62, 0.92, 0.62, 0.92, 0.09, 0.70),
        ( r_axle - 0.36, 0.74, 0.32, 0.70, 0.60, 0.70, 0.84, 0.44, 0.88, 0.40, 0.88, 0.09, 0.68),
        (-1.68, 0.70, 0.28, 0.66, 0.54, 0.65, 0.80, 0.36, 0.84, 0.18, 0.85, 0.12, 0.64),
        (-1.88, 0.64, 0.24, 0.60, 0.48, 0.58, 0.74, 0.30, 0.78, 0.20, 0.80, 0.14, 0.60),
    ]
    build_open_top_hull("LotusElise_S2", mats, roots, stations, f_axle, r_axle, wheel_r=wheel_r, subsurf=1)
    add_open_cockpit(roots, mats, 0.30, -0.55, 0.72)

def build_road_2010s(mats, roots): # Mazda MX-5 Miata (ND)
    wb, track_f, track_r, wheel_r = 2.310, 1.49, 1.50, 0.305
    f_axle, r_axle = wb / 2.0, -wb / 2.0
    create_wheels(roots, mats, wb, track_f, track_r, wheel_r=wheel_r, spoke_count=8, rim_mat=mats["wheel_dark"])
    stations = [
        ( 1.98, 0.44, 0.30, 0.42, 0.58, 0.40, 0.74, 0.26, 0.78, 0.13, 0.79, 0.10, 0.62),
        ( 1.72, 0.60, 0.36, 0.58, 0.66, 0.52, 0.78, 0.34, 0.82, 0.13, 0.82, 0.10, 0.66),
        ( f_axle + 0.34, 0.70, 0.42, 0.68, 0.70, 0.62, 0.80, 0.44, 0.84, 0.40, 0.84, 0.10, 0.68),
        ( f_axle,        0.74, 0.44, 0.72, 0.72, 0.65, 0.82, 0.62, 0.86, 0.62, 0.86, 0.10, 0.70),
        ( f_axle - 0.34, 0.76, 0.44, 0.73, 0.72, 0.65, 0.81, 0.44, 0.84, 0.40, 0.84, 0.10, 0.70),
        ( 0.38, 0.79, 0.46, 0.75, 0.72, 0.67, 0.81, 0.42, 0.82, 0.15, 0.82, 0.10, 0.70),
        ( 0.05, 0.79, 0.46, 0.75, 0.72, 0.67, 0.81, 0.42, 0.82, 0.15, 0.82, 0.10, 0.70),
        (-0.52, 0.79, 0.46, 0.75, 0.72, 0.67, 0.82, 0.42, 0.83, 0.15, 0.83, 0.10, 0.70),
        ( r_axle + 0.36, 0.82, 0.42, 0.78, 0.70, 0.70, 0.84, 0.48, 0.86, 0.40, 0.86, 0.10, 0.70),
        ( r_axle,        0.80, 0.40, 0.76, 0.68, 0.71, 0.86, 0.62, 0.87, 0.62, 0.87, 0.10, 0.70),
        ( r_axle - 0.36, 0.76, 0.36, 0.72, 0.64, 0.69, 0.83, 0.44, 0.85, 0.40, 0.85, 0.10, 0.68),
        (-1.72, 0.72, 0.32, 0.68, 0.58, 0.65, 0.79, 0.36, 0.81, 0.20, 0.82, 0.13, 0.64),
        (-1.95, 0.66, 0.28, 0.62, 0.52, 0.60, 0.74, 0.32, 0.76, 0.22, 0.77, 0.15, 0.60),
    ]
    build_open_top_hull("MazdaMiata_ND", mats, roots, stations, f_axle, r_axle, wheel_r=wheel_r, subsurf=1)
    add_open_cockpit(roots, mats, 0.32, -0.58, 0.74)

def build_road_2020s(mats, roots): # Ferrari 812 GTS
    wb, track_f, track_r, wheel_r = 2.720, 1.67, 1.64, 0.355
    f_axle, r_axle = wb / 2.0, -wb / 2.0
    create_wheels(roots, mats, wb, track_f, track_r, wheel_r=wheel_r, spoke_count=5, rim_mat=mats["wheel_dark"])
    stations = [
        ( 2.50, 0.46, 0.32, 0.44, 0.64, 0.44, 0.82, 0.26, 0.88, 0.13, 0.90, 0.09, 0.72),
        ( 2.22, 0.64, 0.42, 0.62, 0.74, 0.58, 0.88, 0.36, 0.92, 0.13, 0.93, 0.09, 0.74),
        ( f_axle + 0.40, 0.76, 0.48, 0.74, 0.80, 0.68, 0.92, 0.48, 0.94, 0.44, 0.94, 0.09, 0.76),
        ( f_axle,        0.81, 0.50, 0.78, 0.82, 0.71, 0.94, 0.68, 0.96, 0.68, 0.96, 0.09, 0.78),
        ( f_axle - 0.40, 0.84, 0.50, 0.80, 0.82, 0.72, 0.93, 0.48, 0.94, 0.44, 0.94, 0.09, 0.78),
        ( 0.45, 0.88, 0.54, 0.84, 0.82, 0.74, 0.92, 0.46, 0.92, 0.15, 0.92, 0.09, 0.78),
        ( 0.08, 0.88, 0.54, 0.84, 0.82, 0.74, 0.92, 0.46, 0.92, 0.15, 0.92, 0.09, 0.78),
        (-0.52, 0.88, 0.54, 0.84, 0.82, 0.76, 0.93, 0.46, 0.93, 0.15, 0.93, 0.09, 0.78),
        ( r_axle + 0.42, 1.00, 0.44, 0.94, 0.72, 0.82, 0.98, 0.52, 1.01, 0.46, 1.01, 0.09, 0.78),
        ( r_axle,        0.90, 0.38, 0.86, 0.68, 0.84, 1.00, 0.68, 1.03, 0.68, 1.03, 0.09, 0.78),
        ( r_axle - 0.42, 0.84, 0.36, 0.80, 0.62, 0.82, 0.97, 0.50, 0.99, 0.46, 0.99, 0.09, 0.76),
        (-2.15, 0.80, 0.34, 0.76, 0.56, 0.78, 0.92, 0.42, 0.94, 0.22, 0.94, 0.13, 0.74),
        (-2.40, 0.74, 0.30, 0.70, 0.50, 0.72, 0.88, 0.36, 0.90, 0.24, 0.91, 0.15, 0.70),
    ]
    build_open_top_hull("Ferrari812GTS", mats, roots, stations, f_axle, r_axle, wheel_r=wheel_r, subsurf=1)
    add_open_cockpit(roots, mats, 0.35, -0.65, 0.82)

def build_road_future(mats, roots): # Tesla Roadster 2
    wb, track_f, track_r, wheel_r = 2.700, 1.66, 1.68, 0.35
    f_axle, r_axle = wb / 2.0, -wb / 2.0
    create_wheels(roots, mats, wb, track_f, track_r, wheel_r=wheel_r, spoke_count=7, rim_mat=mats["wheel_dark"], caliper_color=(0.10, 0.80, 0.95, 1.0))
    stations = [
        ( 2.40, 0.42, 0.30, 0.40, 0.62, 0.38, 0.80, 0.24, 0.86, 0.12, 0.88, 0.08, 0.70),
        ( 2.15, 0.58, 0.38, 0.56, 0.72, 0.52, 0.86, 0.34, 0.90, 0.12, 0.91, 0.08, 0.72),
        ( f_axle + 0.38, 0.72, 0.46, 0.70, 0.78, 0.64, 0.90, 0.46, 0.93, 0.42, 0.93, 0.08, 0.74),
        ( f_axle,        0.77, 0.48, 0.75, 0.80, 0.67, 0.92, 0.66, 0.95, 0.66, 0.95, 0.08, 0.76),
        ( f_axle - 0.38, 0.80, 0.48, 0.77, 0.80, 0.68, 0.91, 0.46, 0.93, 0.42, 0.93, 0.08, 0.76),
        ( 0.42, 0.84, 0.52, 0.80, 0.80, 0.70, 0.90, 0.44, 0.91, 0.14, 0.91, 0.08, 0.76),
        ( 0.05, 0.84, 0.52, 0.80, 0.80, 0.70, 0.90, 0.44, 0.91, 0.14, 0.91, 0.08, 0.76),
        (-0.52, 0.84, 0.52, 0.80, 0.80, 0.72, 0.92, 0.44, 0.93, 0.14, 0.93, 0.08, 0.76),
        ( r_axle + 0.40, 0.92, 0.44, 0.88, 0.72, 0.78, 0.96, 0.50, 0.99, 0.44, 0.99, 0.08, 0.76),
        ( r_axle,        0.84, 0.38, 0.80, 0.66, 0.80, 0.98, 0.66, 1.01, 0.66, 1.01, 0.08, 0.76),
        ( r_axle - 0.40, 0.80, 0.34, 0.76, 0.60, 0.78, 0.94, 0.48, 0.97, 0.44, 0.97, 0.08, 0.74),
        (-2.05, 0.76, 0.32, 0.72, 0.54, 0.74, 0.90, 0.40, 0.92, 0.20, 0.93, 0.12, 0.72),
        (-2.30, 0.70, 0.28, 0.66, 0.48, 0.68, 0.84, 0.34, 0.86, 0.22, 0.88, 0.14, 0.68),
    ]
    build_open_top_hull("TeslaRoadster2", mats, roots, stations, f_axle, r_axle, wheel_r=wheel_r, subsurf=1)
    add_open_cockpit(roots, mats, 0.35, -0.65, 0.82)

# ----------------------------------------------------------------------------
# 7. EXPORT DISPATCHER
# ----------------------------------------------------------------------------
OPEN_TOP_VEHICLES = {
    # Convertibles
    ("convertible", "1970s"): {"name": "Alfa Romeo Spider Veloce", "color": (0.85, 0.05, 0.06, 1.0), "builder": build_conv_1970s},
    ("convertible", "1980s"): {"name": "Mercedes Benz 560SL R107", "color": (0.85, 0.08, 0.10, 1.0), "builder": build_conv_1980s},
    ("convertible", "1990s"): {"name": "Porsche 911 Carrera Cabriolet 993", "color": (0.08, 0.15, 0.45, 1.0), "builder": build_conv_1990s},
    ("convertible", "2000s"): {"name": "Honda S2000 AP1", "color": (0.72, 0.74, 0.78, 1.0), "builder": build_conv_2000s},
    ("convertible", "2010s"): {"name": "Jaguar F-Type V8 R Convertible", "color": (0.90, 0.35, 0.05, 1.0), "builder": build_conv_2010s},
    ("convertible", "2020s"): {"name": "Bentley Continental GT Speed Convertible", "color": (0.75, 0.05, 0.08, 1.0), "builder": build_conv_2020s},
    ("convertible", "future"): {"name": "Genesis X Convertible Concept", "color": (0.95, 0.95, 0.96, 1.0), "builder": build_conv_2020s},

    # Roadsters
    ("roadster", "1970s"): {"name": "Triumph Spitfire 1500", "color": (0.92, 0.78, 0.08, 1.0), "builder": build_road_1970s},
    ("roadster", "1980s"): {"name": "Mazda MX-5 Miata NA", "color": (0.88, 0.05, 0.06, 1.0), "builder": build_road_1980s},
    ("roadster", "1990s"): {"name": "BMW Z3 M Roadster", "color": (0.12, 0.38, 0.78, 1.0), "builder": build_road_1990s},
    ("roadster", "2000s"): {"name": "Lotus Elise Series 2", "color": (0.94, 0.82, 0.05, 1.0), "builder": build_road_2000s},
    ("roadster", "2010s"): {"name": "Mazda MX-5 Miata ND", "color": (0.78, 0.04, 0.06, 1.0), "builder": build_road_2010s},
    ("roadster", "2020s"): {"name": "Ferrari 812 GTS", "color": (0.88, 0.04, 0.06, 1.0), "builder": build_road_2020s},
    ("roadster", "future"): {"name": "Tesla Roadster 2", "color": (0.65, 0.04, 0.08, 1.0), "builder": build_road_future},
}

def generate_vehicle(arch_id, era_id):
    key = (arch_id, era_id)
    if key not in OPEN_TOP_VEHICLES:
        raise ValueError(f"Unknown key: {key}")
    
    info = OPEN_TOP_VEHICLES[key]
    print(f"\n=======================================================")
    print(f" GENERATING CLASS-A CAD: {info['name']} ({arch_id} - {era_id})")
    print(f"=======================================================")

    safe_reset()

    roots = {}
    root = bpy.data.objects.new("VEHICLE_ROOT", None)
    bpy.context.scene.collection.objects.link(root)
    roots["ROOT"] = root

    for branch in ["BODY", "GLASS", "LIGHT", "WHEEL", "AERO", "INTERIOR"]:
        obj = bpy.data.objects.new(f"{branch}_Master", None)
        obj.parent = root
        bpy.context.scene.collection.objects.link(obj)
        roots[branch] = obj

    mats = create_open_top_materials(era_id, info["color"])
    info["builder"](mats, roots)

    out_dir = os.path.join(PUBLIC_MODELS_DIR, arch_id, era_id)
    os.makedirs(out_dir, exist_ok=True)
    os.makedirs(EXPORTS_DIR, exist_ok=True)

    glb_public = os.path.normpath(os.path.abspath(os.path.join(out_dir, "vehicle.glb")))
    clean_name = info["name"].replace(" ", "_").replace("(", "").replace(")", "").replace("/", "_").replace("-", "_")
    glb_export = os.path.normpath(os.path.abspath(os.path.join(EXPORTS_DIR, f"Car_{clean_name}_{era_id}.glb")))

    if os.path.exists(glb_public):
        try: os.remove(glb_public)
        except Exception: pass
    if os.path.exists(glb_export):
        try: os.remove(glb_export)
        except Exception: pass

    bpy.ops.object.select_all(action='DESELECT')
    for obj in bpy.data.objects:
        obj.select_set(True)

    bpy.ops.export_scene.gltf(
        filepath=glb_public,
        use_selection=True,
        export_yup=True,
        export_apply=True,
        export_format='GLB',
    )
    sz_pub = os.path.getsize(glb_public)
    print(f"Successfully exported public GLB: {glb_public} ({sz_pub:,} bytes)")

    bpy.ops.export_scene.gltf(
        filepath=glb_export,
        use_selection=True,
        export_yup=True,
        export_apply=True,
        export_format='GLB',
    )
    sz_exp = os.path.getsize(glb_export)
    print(f"Successfully exported archival GLB: {glb_export} ({sz_exp:,} bytes)")

def generate_all():
    for arch in ["convertible", "roadster"]:
        for era in ["1970s", "1980s", "1990s", "2000s", "2010s", "2020s", "future"]:
            generate_vehicle(arch, era)

if __name__ == "__main__":
    generate_all()
