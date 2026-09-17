"""
=============================================================================
APEX ENGINEER: COUPE MASTER CAD BUILDER (ALL 7 ERAS)
=============================================================================
Procedurally constructs authentic, photo-accurate Class-A CAD models for all
7 eras of the Coupe architecture:
1. 1970s: Datsun 240Z (Fairlady Z)
2. 1980s: Audi Quattro (Ur-Quattro)
3. 1990s: Toyota Supra A80 (MK4)
4. 2000s: Nissan Skyline GT-R (R34) / GT-R (R35)
5. 2010s: BMW M4 GTS (F82)
6. 2020s: Maserati MC20
7. Future: Polestar Synergy Concept

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
PUBLIC_MODELS_DIR = os.path.join(ROOT_DIR, "public", "models", "vehicles", "coupe")
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

def create_coupe_materials(era_id, paint_color, accent_color=None):
    mats = {}
    coat = 0.6 if era_id == "1970s" else (0.85 if era_id in ["1980s", "1990s"] else 1.0)
    metallic = 0.15 if era_id in ["1970s", "1980s"] else 0.88

    mats["paint"] = make_pbr_mat(f"Mat_Coupe_Paint_{era_id}", paint_color, metallic=metallic, roughness=0.12, coat=coat)
    if accent_color:
        mats["accent"] = make_pbr_mat(f"Mat_Coupe_Accent_{era_id}", accent_color, metallic=metallic, roughness=0.15, coat=coat)
    else:
        mats["accent"] = mats["paint"]

    mats["carbon"] = make_pbr_mat("Mat_Carbon_Fiber", (0.035, 0.035, 0.04, 1.0), metallic=0.30, roughness=0.18, coat=0.98)
    mats["chrome"] = make_pbr_mat("Mat_Chrome_Jewelry", (0.95, 0.95, 0.96, 1.0), metallic=0.98, roughness=0.03)
    mats["trim_dark"] = make_pbr_mat("Mat_Trim_Dark", (0.05, 0.05, 0.06, 1.0), metallic=0.35, roughness=0.55)
    mats["exhaust"] = make_pbr_mat("Mat_Titanium_Exhaust", (0.55, 0.53, 0.50, 1.0), metallic=0.96, roughness=0.22)

    mat_glass = make_pbr_mat("Mat_Optical_Glass", (0.88, 0.92, 0.96, 1.0), roughness=0.02, transmission=0.94)
    mat_glass.blend_method = 'BLEND' if hasattr(mat_glass, 'blend_method') else 'OPAQUE'
    mats["glass"] = mat_glass

    mats["wheel_alloy"] = make_pbr_mat("Mat_Wheel_Alloy", (0.85, 0.86, 0.88, 1.0), metallic=0.95, roughness=0.18, coat=0.6)
    mats["wheel_bronze"] = make_pbr_mat("Mat_Wheel_Bronze", (0.50, 0.38, 0.18, 1.0), metallic=0.92, roughness=0.25, coat=0.7)
    mats["wheel_gold"] = make_pbr_mat("Mat_Wheel_Gold", (0.85, 0.65, 0.15, 1.0), metallic=0.92, roughness=0.22, coat=0.7)
    mats["wheel_dark"] = make_pbr_mat("Mat_Wheel_Dark", (0.10, 0.10, 0.11, 1.0), metallic=0.90, roughness=0.20, coat=0.8)
    mats["tire_rubber"] = make_pbr_mat("Mat_Tire_Rubber", (0.03, 0.03, 0.032, 1.0), roughness=0.88)
    mats["brake_rotor"] = make_pbr_mat("Mat_Brake_Rotor", (0.38, 0.38, 0.40, 1.0), metallic=0.88, roughness=0.30)
    mats["brake_caliper"] = make_pbr_mat("Mat_Brake_Caliper", (0.90, 0.04, 0.04, 1.0), metallic=0.35, roughness=0.22, coat=0.8)
    mats["interior"] = make_pbr_mat("Mat_Interior_Trim", (0.08, 0.08, 0.09, 1.0), roughness=0.85)

    hl_col = (1.0, 0.96, 0.88, 1.0) if era_id in ["1970s", "1980s"] else (0.95, 0.98, 1.0, 1.0)
    mats["headlight"] = make_pbr_mat("Mat_Headlight_Emissive", hl_col, emission=hl_col, emission_strength=15.0)
    mats["taillight"] = make_pbr_mat("Mat_Taillight_Emissive", (1.0, 0.02, 0.03, 1.0), emission=(1.0, 0.01, 0.02, 1.0), emission_strength=12.0)
    mats["drl"] = make_pbr_mat("Mat_DRL_Emissive", (0.95, 0.98, 1.0, 1.0), emission=(0.95, 0.98, 1.0, 1.0), emission_strength=18.0)
    mats["orange_accent"] = make_pbr_mat("Mat_Acid_Orange", (0.95, 0.35, 0.02, 1.0), metallic=0.4, roughness=0.25, coat=0.9)

    return mats

# ----------------------------------------------------------------------------
# 2. CLASS-A QUAD PATCH & MESH HELPERS
# ----------------------------------------------------------------------------
def make_quad_grid(bm, rows):
    grid = []
    for r in rows:
        row_verts = [bm.verts.new(pt) for pt in r]
        grid.append(row_verts)
    for i in range(len(rows) - 1):
        for j in range(len(rows[i]) - 1):
            bm.faces.new((grid[i][j], grid[i][j+1], grid[i+1][j+1], grid[i+1][j]))

def link_obj(name, bm, parent, mat, bevel=0.003):
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
    return obj

# ----------------------------------------------------------------------------
# 3. PROCEDURAL WHEELS WITH ARCH CUTOUT CLEARANCE
# ----------------------------------------------------------------------------
def create_wheels(roots, mats, wb, track_f, track_r, wheel_r=0.33, tire_w=0.245, spoke_count=5, rim_mat=None, caliper_color=None):
    if rim_mat is None:
        rim_mat = mats["wheel_alloy"]
    if caliper_color:
        cal_mat = make_pbr_mat("Mat_Custom_Caliper", caliper_color, metallic=0.35, roughness=0.22, coat=0.8)
    else:
        cal_mat = mats["brake_caliper"]

    half_wb = wb / 2.0
    axles = [
        ("FL", Vector(( track_f / 2.0,  half_wb, wheel_r)), True),
        ("FR", Vector((-track_f / 2.0,  half_wb, wheel_r)), False),
        ("RL", Vector(( track_r / 2.0, -half_wb, wheel_r)), True),
        ("RR", Vector((-track_r / 2.0, -half_wb, wheel_r)), False),
    ]

    for name, pos, is_left in axles:
        build_wheel_unit(roots["WHEEL"], mats, name, pos, is_left, wheel_r, tire_w, spoke_count, rim_mat, cal_mat)

def build_wheel_unit(parent, mats, name, pos, is_left, wheel_r, tire_w, spoke_count, rim_mat, cal_mat):
    outer_sign = 1.0 if is_left else -1.0
    rim_r = wheel_r * 0.72

    # 1. Tire
    bm_tire = bmesh.new()
    segs = 32
    r_inner = rim_r
    r_outer = wheel_r
    hw = tire_w / 2.0

    circle_pts = [
        (r_inner, -hw), (r_outer * 0.96, -hw), (r_outer, -hw * 0.78),
        (r_outer,  hw * 0.78), (r_outer * 0.96,  hw), (r_inner,  hw)
    ]
    for s in range(segs):
        ang1 = 2.0 * math.pi * s / segs
        ang2 = 2.0 * math.pi * (s + 1) / segs
        c1, s1 = math.cos(ang1), math.sin(ang1)
        c2, s2 = math.cos(ang2), math.sin(ang2)

        for p in range(len(circle_pts) - 1):
            rA, xA = circle_pts[p]
            rB, xB = circle_pts[p+1]
            v1 = bm_tire.verts.new((pos.x + xA * outer_sign, pos.y + rA * c1, pos.z + rA * s1))
            v2 = bm_tire.verts.new((pos.x + xB * outer_sign, pos.y + rB * c1, pos.z + rB * s1))
            v3 = bm_tire.verts.new((pos.x + xB * outer_sign, pos.y + rB * c2, pos.z + rB * s2))
            v4 = bm_tire.verts.new((pos.x + xA * outer_sign, pos.y + rA * c2, pos.z + rA * s2))
            bm_tire.faces.new((v1, v2, v3, v4) if is_left else (v4, v3, v2, v1))

    bmesh.ops.remove_doubles(bm_tire, verts=bm_tire.verts, dist=0.001)
    link_obj(f"WHEEL_{name}_Tire", bm_tire, parent, mats["tire_rubber"], bevel=0.002)

    # 2. Rim Barrel & Hub
    bm_rim = bmesh.new()
    for s in range(segs):
        ang1 = 2.0 * math.pi * s / segs
        ang2 = 2.0 * math.pi * (s + 1) / segs
        c1, s1 = math.cos(ang1), math.sin(ang1)
        c2, s2 = math.cos(ang2), math.sin(ang2)

        # Outer lip to deep drop center
        v1 = bm_rim.verts.new((pos.x + hw * outer_sign, pos.y + rim_r * c1, pos.z + rim_r * s1))
        v2 = bm_rim.verts.new((pos.x + (hw * 0.3) * outer_sign, pos.y + (rim_r * 0.88) * c1, pos.z + (rim_r * 0.88) * s1))
        v3 = bm_rim.verts.new((pos.x + (hw * 0.3) * outer_sign, pos.y + (rim_r * 0.88) * c2, pos.z + (rim_r * 0.88) * s2))
        v4 = bm_rim.verts.new((pos.x + hw * outer_sign, pos.y + rim_r * c2, pos.z + rim_r * s2))
        bm_rim.faces.new((v1, v2, v3, v4) if is_left else (v4, v3, v2, v1))

    # Spokes
    hub_r = rim_r * 0.26
    hub_x = pos.x + (hw * 0.45) * outer_sign
    spoke_w = (2.0 * math.pi * hub_r) / (spoke_count * 2.2)

    for sp in range(spoke_count):
        ang = 2.0 * math.pi * sp / spoke_count
        c, s = math.cos(ang), math.sin(ang)
        perp_y, perp_z = -s, c

        p1 = Vector((hub_x, pos.y + hub_r * c - spoke_w * 0.5 * perp_y, pos.z + hub_r * s - spoke_w * 0.5 * perp_z))
        p2 = Vector((hub_x, pos.y + hub_r * c + spoke_w * 0.5 * perp_y, pos.z + hub_r * s + spoke_w * 0.5 * perp_z))
        p3 = Vector((pos.x + hw * outer_sign * 0.95, pos.y + rim_r * 0.90 * c + spoke_w * 0.6 * perp_y, pos.z + rim_r * 0.90 * s + spoke_w * 0.6 * perp_z))
        p4 = Vector((pos.x + hw * outer_sign * 0.95, pos.y + rim_r * 0.90 * c - spoke_w * 0.6 * perp_y, pos.z + rim_r * 0.90 * s - spoke_w * 0.6 * perp_z))

        v1 = bm_rim.verts.new(p1)
        v2 = bm_rim.verts.new(p2)
        v3 = bm_rim.verts.new(p3)
        v4 = bm_rim.verts.new(p4)
        bm_rim.faces.new((v1, v2, v3, v4) if is_left else (v4, v3, v2, v1))

    bmesh.ops.remove_doubles(bm_rim, verts=bm_rim.verts, dist=0.001)
    link_obj(f"WHEEL_{name}_Rim", bm_rim, parent, rim_mat, bevel=0.002)

    # 3. Brake Disc (Rotor)
    bm_rotor = bmesh.new()
    rotor_r = rim_r * 0.84
    rotor_x = pos.x - (hw * 0.25) * outer_sign
    for s in range(segs):
        ang1 = 2.0 * math.pi * s / segs
        ang2 = 2.0 * math.pi * (s + 1) / segs
        c1, s1 = math.cos(ang1), math.sin(ang1)
        c2, s2 = math.cos(ang2), math.sin(ang2)

        v1 = bm_rotor.verts.new((rotor_x, pos.y + hub_r * c1, pos.z + hub_r * s1))
        v2 = bm_rotor.verts.new((rotor_x, pos.y + rotor_r * c1, pos.z + rotor_r * s1))
        v3 = bm_rotor.verts.new((rotor_x, pos.y + rotor_r * c2, pos.z + rotor_r * s2))
        v4 = bm_rotor.verts.new((rotor_x, pos.y + hub_r * c2, pos.z + hub_r * s2))
        bm_rotor.faces.new((v1, v2, v3, v4) if is_left else (v4, v3, v2, v1))

    bmesh.ops.remove_doubles(bm_rotor, verts=bm_rotor.verts, dist=0.001)
    link_obj(f"WHEEL_{name}_BrakeDisc", bm_rotor, parent, mats["brake_rotor"], bevel=0.0)

    # 4. Brake Caliper
    bm_cal = bmesh.new()
    cal_ang = math.pi * 0.65 if "F" in name else math.pi * 0.35
    ca_c, ca_s = math.cos(cal_ang), math.sin(cal_ang)
    cal_center = Vector((rotor_x + 0.015 * outer_sign, pos.y + rotor_r * 0.90 * ca_c, pos.z + rotor_r * 0.90 * ca_s))
    bmesh.ops.create_cube(bm_cal, size=0.07)
    for v in bm_cal.verts:
        v.co.x *= 0.7
        v.co.y *= 1.8
        v.co.z *= 1.2
        v.co += cal_center
    link_obj(f"WHEEL_{name}_Caliper", bm_cal, parent, cal_mat, bevel=0.003)

# ----------------------------------------------------------------------------
# 4. COUPE BODY SHELL GENERATOR WITH PRECISE CIRCULAR ARCH CUTOUTS
# ----------------------------------------------------------------------------
def build_coupe_shell(name, mats, roots, stations, f_axle, r_axle, wheel_r=0.33, flared_box=False):
    bm_body = bmesh.new()
    r_arch = wheel_r + 0.045
    num_pts = len(stations)

    # Left and right side symmetric generation
    for side in [1.0, -1.0]:
        rows = []
        for i in range(num_pts):
            fy, fz_sill, fz_waist, fz_roof, fw_bot, fw_waist, fw_roof = stations[i]
            
            # Check wheel arch cutout
            dy_f = fy - f_axle
            dy_r = fy - r_axle
            z_sill = fz_sill

            if abs(dy_f) < r_arch:
                arch_z = wheel_r + math.sqrt(max(0.002, r_arch**2 - dy_f**2))
                if arch_z > z_sill:
                    z_sill = arch_z
            elif abs(dy_r) < r_arch:
                arch_z = wheel_r + math.sqrt(max(0.002, r_arch**2 - dy_r**2))
                if arch_z > z_sill:
                    z_sill = arch_z

            # Box flare option (e.g. Audi Quattro)
            w_bot = fw_bot
            w_waist = fw_waist
            if flared_box and (abs(dy_f) < 0.55 or abs(dy_r) < 0.55):
                w_bot += 0.065
                w_waist += 0.060

            # 4 cross-section vertices per station
            p_sill = Vector((side * w_bot, fy, z_sill))
            p_waist = Vector((side * w_waist, fy, fz_waist))
            p_cant = Vector((side * ((w_waist + fw_roof) * 0.55), fy, (fz_waist + fz_roof) * 0.52))
            p_center = Vector((side * fw_roof, fy, fz_roof))
            
            rows.append([p_sill, p_waist, p_cant, p_center])

        make_quad_grid(bm_body, rows)

    bmesh.ops.remove_doubles(bm_body, verts=bm_body.verts, dist=0.002)
    return link_obj(f"BODY_{name}_MainShell", bm_body, roots["BODY"], mats["paint"], bevel=0.004)

# ----------------------------------------------------------------------------
# 5. AUTHENTIC COUPE BUILDERS PER ERA
# ----------------------------------------------------------------------------

# ----------------------------------------------------------------------------
# 1970s: Datsun 240Z (Fairlady Z)
# ----------------------------------------------------------------------------
def build_coupe_1970s(mats, roots):
    wb = 2.305
    track_f, track_r = 1.355, 1.345
    wheel_r = 0.31
    f_axle = wb / 2.0
    r_axle = -wb / 2.0

    create_wheels(roots, mats, wb, track_f, track_r, wheel_r=wheel_r, spoke_count=4, rim_mat=mats["wheel_alloy"])

    # Stations: (Y, z_sill, z_waist, z_roof, w_bot, w_waist, w_roof)
    # Long hood, sugar-scoop conical nose, sweeping fastback tail
    stations = [
        # Nose cone (Sugar scoop front)
        ( 2.12, 0.22, 0.48, 0.62, 0.40, 0.55, 0.30),
        ( 1.95, 0.20, 0.54, 0.68, 0.68, 0.72, 0.45),
        ( 1.55, 0.18, 0.58, 0.75, 0.76, 0.79, 0.55), # Front fender
        ( f_axle + 0.35, 0.16, 0.61, 0.78, 0.78, 0.81, 0.58), # Arch start
        ( f_axle,        0.16, 0.62, 0.80, 0.78, 0.81, 0.60), # Front axle
        ( f_axle - 0.35, 0.16, 0.61, 0.82, 0.78, 0.81, 0.62), # Arch end
        ( 0.45, 0.17, 0.62, 0.90, 0.77, 0.80, 0.64), # Base of windshield
        ( 0.10, 0.17, 0.63, 1.25, 0.76, 0.80, 0.52), # A-pillar top / Roof
        (-0.35, 0.17, 0.63, 1.26, 0.76, 0.80, 0.53), # Mid roof
        (-0.75, 0.17, 0.63, 1.15, 0.77, 0.81, 0.50), # Fastback taper
        ( r_axle + 0.35, 0.16, 0.64, 0.98, 0.78, 0.82, 0.46), # Rear arch start
        ( r_axle,        0.16, 0.65, 0.92, 0.78, 0.82, 0.42), # Rear axle
        ( r_axle - 0.35, 0.17, 0.65, 0.85, 0.77, 0.80, 0.38), # Rear arch end
        (-1.75, 0.22, 0.62, 0.78, 0.72, 0.75, 0.35), # Ducktail rear deck
        (-1.95, 0.28, 0.56, 0.72, 0.65, 0.70, 0.30), # Rear bumper fascia
    ]
    build_coupe_shell("Datsun240Z", mats, roots, stations, f_axle, r_axle, wheel_r=wheel_r)

    # Fastback Glass & Windshield
    bm_glass = bmesh.new()
    g_rows = [
        [Vector(( 0.0,  0.42, 0.88)), Vector(( 0.55,  0.42, 0.87))],
        [Vector(( 0.0,  0.08, 1.24)), Vector(( 0.50,  0.08, 1.22))],
        [Vector(( 0.0, -0.72, 1.14)), Vector(( 0.48, -0.72, 1.10))],
        [Vector(( 0.0, -1.68, 0.80)), Vector(( 0.40, -1.68, 0.78))],
    ]
    # Symmetrize
    full_g_rows = []
    for r in g_rows:
        full_g_rows.append([Vector((-r[1].x, r[1].y, r[1].z)), r[0], r[1]])
    make_quad_grid(bm_glass, full_g_rows)
    link_obj("GLASS_Datsun240Z", bm_glass, roots["GLASS"], mats["glass"], bevel=0.002)

    # Sugar Scoop Headlamps (Recessed Cones)
    bm_lights = bmesh.new()
    for s in [1.0, -1.0]:
        bmesh.ops.create_cone(bm_lights, cap_ends=True, cap_tris=False, segments=16, radius1=0.085, radius2=0.065, depth=0.12)
        for v in bm_lights.verts[-34:]:
            v.co.y += 1.96
            v.co.x += s * 0.52
            v.co.z += 0.58
    link_obj("LIGHT_Headlights_Datsun240Z", bm_lights, roots["LIGHT"], mats["headlight"], bevel=0.002)

    # Torpedo Chrome Fender Mirrors
    bm_aero = bmesh.new()
    for s in [1.0, -1.0]:
        bmesh.ops.create_cone(bm_aero, cap_ends=True, cap_tris=False, segments=12, radius1=0.035, radius2=0.015, depth=0.08)
        for v in bm_aero.verts[-26:]:
            v.co.y += 1.30
            v.co.x += s * 0.72
            v.co.z += 0.76
    # Thin chrome bumper bars
    bmesh.ops.create_cube(bm_aero, size=0.05)
    for v in bm_aero.verts[-8:]:
        v.co.x *= 26.0
        v.co.y = v.co.y * 1.0 + 2.06
        v.co.z = v.co.z * 1.0 + 0.38
    link_obj("AERO_Datsun240Z_Jewelry", bm_aero, roots["AERO"], mats["chrome"], bevel=0.002)

# ----------------------------------------------------------------------------
# 1980s: Audi Quattro (Ur-Quattro)
# ----------------------------------------------------------------------------
def build_coupe_1980s(mats, roots):
    wb = 2.524
    track_f, track_r = 1.42, 1.45
    wheel_r = 0.32
    f_axle = wb / 2.0
    r_axle = -wb / 2.0

    create_wheels(roots, mats, wb, track_f, track_r, wheel_r=wheel_r, spoke_count=10, rim_mat=mats["wheel_alloy"])

    stations = [
        ( 2.22, 0.22, 0.52, 0.68, 0.55, 0.68, 0.45), # Boxy vertical nose
        ( 2.05, 0.19, 0.58, 0.74, 0.74, 0.78, 0.58), # Grille / quad lights
        ( f_axle + 0.40, 0.17, 0.62, 0.80, 0.82, 0.85, 0.65), # Flare start
        ( f_axle,        0.17, 0.64, 0.82, 0.85, 0.88, 0.66), # Front axle (Box flare peak)
        ( f_axle - 0.40, 0.17, 0.63, 0.83, 0.82, 0.85, 0.66), # Flare return
        ( 0.45, 0.18, 0.64, 0.86, 0.76, 0.80, 0.65), # Base of A-pillar
        ( 0.05, 0.18, 0.65, 1.32, 0.76, 0.80, 0.58), # Angular windshield top
        (-0.55, 0.18, 0.65, 1.31, 0.76, 0.80, 0.58), # Flat roofline
        ( r_axle + 0.45, 0.17, 0.65, 1.05, 0.82, 0.86, 0.56), # Rear box flare start
        ( r_axle,        0.17, 0.66, 0.98, 0.86, 0.89, 0.54), # Rear axle (Box flare peak)
        ( r_axle - 0.45, 0.17, 0.65, 0.92, 0.82, 0.86, 0.52), # Flare end
        (-1.85, 0.22, 0.64, 0.90, 0.78, 0.82, 0.50), # Sloping rear glass base / trunk
        (-2.15, 0.26, 0.58, 0.86, 0.74, 0.78, 0.45), # Box rear fascia
    ]
    build_coupe_shell("AudiQuattro", mats, roots, stations, f_axle, r_axle, wheel_r=wheel_r, flared_box=True)

    # Glass
    bm_glass = bmesh.new()
    g_rows = [
        [Vector(( 0.0,  0.42, 0.88)), Vector(( 0.58,  0.42, 0.87))],
        [Vector(( 0.0,  0.03, 1.30)), Vector(( 0.54,  0.03, 1.28))],
        [Vector(( 0.0, -0.58, 1.29)), Vector(( 0.54, -0.58, 1.27))],
        [Vector(( 0.0, -1.82, 0.91)), Vector(( 0.48, -1.82, 0.90))],
    ]
    full_g_rows = [[Vector((-r[1].x, r[1].y, r[1].z)), r[0], r[1]] for r in g_rows]
    make_quad_grid(bm_glass, full_g_rows)
    link_obj("GLASS_AudiQuattro", bm_glass, roots["GLASS"], mats["glass"], bevel=0.002)

    # Rectangular Rally Headlights
    bm_lights = bmesh.new()
    for s in [1.0, -1.0]:
        bmesh.ops.create_cube(bm_lights, size=0.08)
        for v in bm_lights.verts[-8:]:
            v.co.x = v.co.x * 1.8 + s * 0.48
            v.co.y = v.co.y * 0.3 + 2.12
            v.co.z = v.co.z * 0.9 + 0.60
    link_obj("LIGHT_Headlights_AudiQuattro", bm_lights, roots["LIGHT"], mats["headlight"], bevel=0.002)

    # Quattro Polyurethane Rear Lip Spoiler
    bm_aero = bmesh.new()
    bmesh.ops.create_cube(bm_aero, size=0.06)
    for v in bm_aero.verts:
        v.co.x *= 23.0
        v.co.y = v.co.y * 1.2 - 1.85
        v.co.z = v.co.z * 0.8 + 0.94
    link_obj("AERO_AudiQuattro_Spoiler", bm_aero, roots["AERO"], mats["trim_dark"], bevel=0.003)

# ----------------------------------------------------------------------------
# 1990s: Toyota Supra A80 (MK4)
# ----------------------------------------------------------------------------
def build_coupe_1990s(mats, roots):
    wb = 2.55
    track_f, track_r = 1.52, 1.525
    wheel_r = 0.33
    f_axle = wb / 2.0
    r_axle = -wb / 2.0

    create_wheels(roots, mats, wb, track_f, track_r, wheel_r=wheel_r, spoke_count=5, rim_mat=mats["wheel_alloy"])

    stations = [
        ( 2.25, 0.16, 0.42, 0.58, 0.60, 0.72, 0.48), # Low rounded nose & central air dam
        ( 2.00, 0.16, 0.52, 0.68, 0.78, 0.84, 0.62), # Internal jewel headlight region
        ( f_axle + 0.35, 0.16, 0.60, 0.76, 0.82, 0.88, 0.68), # Arch start
        ( f_axle,        0.16, 0.62, 0.79, 0.85, 0.90, 0.70), # Front axle
        ( f_axle - 0.35, 0.16, 0.61, 0.82, 0.83, 0.89, 0.71), # Arch end
        ( 0.50, 0.16, 0.60, 0.86, 0.80, 0.87, 0.72), # 2JZ powerdome hood cowl
        ( 0.10, 0.16, 0.62, 1.26, 0.78, 0.86, 0.60), # Windshield / Roof apex
        (-0.45, 0.16, 0.63, 1.25, 0.78, 0.87, 0.61), # Roof crown
        ( r_axle + 0.40, 0.16, 0.65, 1.05, 0.84, 0.92, 0.58), # Muscular rear haunch start
        ( r_axle,        0.16, 0.66, 0.95, 0.86, 0.94, 0.54), # Rear axle
        ( r_axle - 0.40, 0.16, 0.65, 0.88, 0.84, 0.92, 0.50), # Haunch end
        (-1.90, 0.22, 0.62, 0.86, 0.78, 0.88, 0.46), # Rear deck lid
        (-2.22, 0.28, 0.55, 0.84, 0.72, 0.84, 0.42), # Rounded bumper with diffuser
    ]
    build_coupe_shell("ToyotaSupraA80", mats, roots, stations, f_axle, r_axle, wheel_r=wheel_r)

    # Greenhouse Glass
    bm_glass = bmesh.new()
    g_rows = [
        [Vector(( 0.0,  0.46, 0.88)), Vector(( 0.62,  0.46, 0.86))],
        [Vector(( 0.0,  0.08, 1.25)), Vector(( 0.56,  0.08, 1.23))],
        [Vector(( 0.0, -0.48, 1.24)), Vector(( 0.56, -0.48, 1.22))],
        [Vector(( 0.0, -1.82, 0.88)), Vector(( 0.48, -1.82, 0.86))],
    ]
    full_g_rows = [[Vector((-r[1].x, r[1].y, r[1].z)), r[0], r[1]] for r in g_rows]
    make_quad_grid(bm_glass, full_g_rows)
    link_obj("GLASS_ToyotaSupraA80", bm_glass, roots["GLASS"], mats["glass"], bevel=0.002)

    # Signature Tall Curved Hoop Rear Wing
    bm_wing = bmesh.new()
    # Stanchions & high curved wing blade
    wing_pts = [
        Vector((-0.72, -1.95, 0.86)),
        Vector((-0.70, -2.02, 1.20)),
        Vector((-0.45, -2.04, 1.25)),
        Vector(( 0.00, -2.05, 1.26)),
        Vector(( 0.45, -2.04, 1.25)),
        Vector(( 0.70, -2.02, 1.20)),
        Vector(( 0.72, -1.95, 0.86)),
    ]
    for p in range(len(wing_pts) - 1):
        pA = wing_pts[p]
        pB = wing_pts[p+1]
        v1 = bm_wing.verts.new((pA.x, pA.y + 0.08, pA.z))
        v2 = bm_wing.verts.new((pA.x, pA.y - 0.08, pA.z + 0.01))
        v3 = bm_wing.verts.new((pB.x, pB.y - 0.08, pB.z + 0.01))
        v4 = bm_wing.verts.new((pB.x, pB.y + 0.08, pB.z))
        bm_wing.faces.new((v1, v2, v3, v4))
    bmesh.ops.remove_doubles(bm_wing, verts=bm_wing.verts, dist=0.002)
    link_obj("AERO_ToyotaSupraA80_HoopWing", bm_wing, roots["AERO"], mats["paint"], bevel=0.004)

    # Quad Round Projector Headlights
    bm_lights = bmesh.new()
    for s in [1.0, -1.0]:
        for idx in range(3):
            proj_y = 2.08 - idx * 0.06
            proj_x = s * (0.50 + idx * 0.07)
            bmesh.ops.create_circle(bm_lights, cap_ends=True, segments=12, radius=0.032)
            for v in bm_lights.verts[-13:]:
                v.co = Vector((proj_x, proj_y, 0.65 - idx * 0.02))
    link_obj("LIGHT_Headlights_ToyotaSupraA80", bm_lights, roots["LIGHT"], mats["headlight"], bevel=0.001)

    # 4-Round Taillight Clusters
    bm_tails = bmesh.new()
    for s in [1.0, -1.0]:
        for idx in range(4):
            tl_x = s * (0.38 + idx * 0.08)
            bmesh.ops.create_circle(bm_tails, cap_ends=True, segments=12, radius=0.030)
            for v in bm_tails.verts[-13:]:
                v.co = Vector((tl_x, -2.18, 0.72))
    link_obj("LIGHT_Taillights_ToyotaSupraA80", bm_tails, roots["LIGHT"], mats["taillight"], bevel=0.001)

# ----------------------------------------------------------------------------
# 2000s: Nissan Skyline GT-R (R34) / GT-R (R35)
# ----------------------------------------------------------------------------
def build_coupe_2000s(mats, roots):
    wb = 2.665
    track_f, track_r = 1.48, 1.49
    wheel_r = 0.335
    f_axle = wb / 2.0
    r_axle = -wb / 2.0

    create_wheels(roots, mats, wb, track_f, track_r, wheel_r=wheel_r, spoke_count=6, rim_mat=mats["wheel_dark"], caliper_color=(0.85, 0.65, 0.15, 1.0))

    stations = [
        ( 2.28, 0.14, 0.44, 0.64, 0.65, 0.76, 0.52), # Aggressive carbon splitter / lower nose
        ( 2.08, 0.15, 0.55, 0.72, 0.78, 0.84, 0.64), # Twin nostril grille & headlights
        ( f_axle + 0.38, 0.15, 0.62, 0.79, 0.82, 0.88, 0.68), # Arch start
        ( f_axle,        0.15, 0.64, 0.81, 0.85, 0.90, 0.70), # Front axle
        ( f_axle - 0.38, 0.15, 0.62, 0.82, 0.83, 0.88, 0.70), # Arch end
        ( 0.50, 0.15, 0.62, 0.88, 0.80, 0.86, 0.70), # Vented hood with NACA duct
        ( 0.10, 0.15, 0.64, 1.34, 0.79, 0.86, 0.60), # A-pillar / High roofline
        (-0.55, 0.15, 0.65, 1.32, 0.79, 0.86, 0.60), # Roof crown
        ( r_axle + 0.42, 0.15, 0.66, 1.08, 0.84, 0.90, 0.58), # Muscular rear fender
        ( r_axle,        0.15, 0.67, 0.98, 0.86, 0.92, 0.56), # Rear axle
        ( r_axle - 0.42, 0.15, 0.66, 0.92, 0.84, 0.90, 0.54), # Fender end
        (-1.95, 0.20, 0.64, 0.91, 0.80, 0.88, 0.50), # Flat trunk deck
        (-2.28, 0.25, 0.56, 0.88, 0.74, 0.85, 0.45), # Rear bumper with rear diffuser
    ]
    build_coupe_shell("SkylineGTR_R34", mats, roots, stations, f_axle, r_axle, wheel_r=wheel_r)

    # Greenhouse Glass
    bm_glass = bmesh.new()
    g_rows = [
        [Vector(( 0.0,  0.48, 0.90)), Vector(( 0.64,  0.48, 0.88))],
        [Vector(( 0.0,  0.08, 1.33)), Vector(( 0.58,  0.08, 1.31))],
        [Vector(( 0.0, -0.56, 1.31)), Vector(( 0.58, -0.56, 1.29))],
        [Vector(( 0.0, -1.90, 0.93)), Vector(( 0.50, -1.90, 0.91))],
    ]
    full_g_rows = [[Vector((-r[1].x, r[1].y, r[1].z)), r[0], r[1]] for r in g_rows]
    make_quad_grid(bm_glass, full_g_rows)
    link_obj("GLASS_SkylineGTR_R34", bm_glass, roots["GLASS"], mats["glass"], bevel=0.002)

    # Iconic Unequal Dual Round Afterburner Taillights
    bm_tails = bmesh.new()
    for s in [1.0, -1.0]:
        # Outer larger ring
        bmesh.ops.create_circle(bm_tails, cap_ends=True, segments=16, radius=0.048)
        for v in bm_tails.verts[-17:]:
            v.co = Vector((s * 0.64, -2.25, 0.74))
        # Inner smaller ring
        bmesh.ops.create_circle(bm_tails, cap_ends=True, segments=16, radius=0.038)
        for v in bm_tails.verts[-17:]:
            v.co = Vector((s * 0.48, -2.25, 0.74))
    link_obj("LIGHT_Taillights_SkylineGTR_R34", bm_tails, roots["LIGHT"], mats["taillight"], bevel=0.001)

    # R34 GT-R Rear Wing on Aluminum Stanchions
    bm_wing = bmesh.new()
    # Left & Right Stanchions
    for s in [0.42, -0.42]:
        bmesh.ops.create_cube(bm_wing, size=0.04)
        for v in bm_wing.verts[-8:]:
            v.co.x = v.co.x * 0.4 + s
            v.co.y = v.co.y * 1.5 - 2.02
            v.co.z = v.co.z * 5.0 + 1.04
    # Wing blade
    bmesh.ops.create_cube(bm_wing, size=0.06)
    for v in bm_wing.verts[-8:]:
        v.co.x *= 24.0
        v.co.y = v.co.y * 3.2 - 2.05
        v.co.z = v.co.z * 0.4 + 1.18
    link_obj("AERO_SkylineGTR_R34_RearWing", bm_wing, roots["AERO"], mats["carbon"], bevel=0.003)

    # Massive 4.5-inch Cannon Exhaust Tip
    bm_ex = bmesh.new()
    bmesh.ops.create_cone(bm_ex, cap_ends=True, cap_tris=False, segments=16, radius1=0.055, radius2=0.055, depth=0.22)
    for v in bm_ex.verts:
        v.co = Vector((0.55, v.co.z - 2.22, v.co.y + 0.28))
    link_obj("AERO_SkylineGTR_R34_Exhaust", bm_ex, roots["AERO"], mats["exhaust"], bevel=0.002)

# ----------------------------------------------------------------------------
# 2010s: BMW M4 GTS (F82)
# ----------------------------------------------------------------------------
def build_coupe_2010s(mats, roots):
    wb = 2.812
    track_f, track_r = 1.58, 1.60
    wheel_r = 0.34
    f_axle = wb / 2.0
    r_axle = -wb / 2.0

    create_wheels(roots, mats, wb, track_f, track_r, wheel_r=wheel_r, spoke_count=7, rim_mat=mats["wheel_dark"], caliper_color=(0.95, 0.35, 0.02, 1.0))

    stations = [
        ( 2.34, 0.12, 0.42, 0.65, 0.68, 0.80, 0.54), # Low front apron / Kidney grilles
        ( 2.14, 0.13, 0.56, 0.74, 0.82, 0.88, 0.66), # Angel Eye headlights
        ( f_axle + 0.40, 0.14, 0.64, 0.82, 0.86, 0.92, 0.70), # Front fender flare
        ( f_axle,        0.14, 0.65, 0.84, 0.88, 0.94, 0.72), # Front axle
        ( f_axle - 0.40, 0.14, 0.63, 0.85, 0.86, 0.92, 0.72), # Fender end
        ( 0.55, 0.14, 0.63, 0.90, 0.84, 0.90, 0.72), # Powerdome hood cowl
        ( 0.15, 0.14, 0.65, 1.36, 0.82, 0.89, 0.62), # Carbon roof with central aero groove
        (-0.60, 0.14, 0.66, 1.34, 0.82, 0.90, 0.62), # Roof crown
        ( r_axle + 0.45, 0.14, 0.67, 1.10, 0.87, 0.95, 0.60), # Wide track rear quarter
        ( r_axle,        0.14, 0.68, 1.00, 0.89, 0.96, 0.58), # Rear axle
        ( r_axle - 0.45, 0.14, 0.67, 0.94, 0.87, 0.94, 0.56), # Rear quarter end
        (-2.05, 0.20, 0.65, 0.93, 0.82, 0.90, 0.52), # Boot lid with ducktail edge
        (-2.34, 0.24, 0.56, 0.90, 0.76, 0.86, 0.46), # Diffuser with quad exhaust
    ]
    build_coupe_shell("BMWM4GTS", mats, roots, stations, f_axle, r_axle, wheel_r=wheel_r)

    # Greenhouse Glass
    bm_glass = bmesh.new()
    g_rows = [
        [Vector(( 0.0,  0.52, 0.92)), Vector(( 0.66,  0.52, 0.90))],
        [Vector(( 0.0,  0.12, 1.35)), Vector(( 0.60,  0.12, 1.33))],
        [Vector(( 0.0, -0.62, 1.33)), Vector(( 0.60, -0.62, 1.31))],
        [Vector(( 0.0, -2.00, 0.95)), Vector(( 0.52, -2.00, 0.93))],
    ]
    full_g_rows = [[Vector((-r[1].x, r[1].y, r[1].z)), r[0], r[1]] for r in g_rows]
    make_quad_grid(bm_glass, full_g_rows)
    link_obj("GLASS_BMWM4GTS", bm_glass, roots["GLASS"], mats["glass"], bevel=0.002)

    # Acid Orange Adjustable Front Splitter Blade
    bm_split = bmesh.new()
    bmesh.ops.create_cube(bm_split, size=0.04)
    for v in bm_split.verts:
        v.co.x *= 20.0
        v.co.y = v.co.y * 3.5 + 2.38
        v.co.z = v.co.z * 0.4 + 0.13
    link_obj("AERO_M4GTS_AcidOrangeSplitter", bm_split, roots["AERO"], mats["orange_accent"], bevel=0.002)

    # M4 GTS CNC Aluminum Stanchion Rear Wing
    bm_wing = bmesh.new()
    for s in [0.45, -0.45]:
        bmesh.ops.create_cube(bm_wing, size=0.03)
        for v in bm_wing.verts[-8:]:
            v.co.x = v.co.x * 0.4 + s
            v.co.y = v.co.y * 1.8 - 2.12
            v.co.z = v.co.z * 6.0 + 1.08
    # Carbon wing blade
    bmesh.ops.create_cube(bm_wing, size=0.05)
    for v in bm_wing.verts[-8:]:
        v.co.x *= 23.0
        v.co.y = v.co.y * 3.4 - 2.15
        v.co.z = v.co.z * 0.4 + 1.25
    link_obj("AERO_M4GTS_CarbonWing", bm_wing, roots["AERO"], mats["carbon"], bevel=0.003)

# ----------------------------------------------------------------------------
# 2020s: Maserati MC20
# ----------------------------------------------------------------------------
def build_coupe_2020s(mats, roots):
    wb = 2.70
    track_f, track_r = 1.68, 1.65
    wheel_r = 0.34
    f_axle = wb / 2.0
    r_axle = -wb / 2.0

    create_wheels(roots, mats, wb, track_f, track_r, wheel_r=wheel_r, spoke_count=5, rim_mat=mats["wheel_alloy"], caliper_color=(0.10, 0.25, 0.85, 1.0))

    stations = [
        ( 2.32, 0.12, 0.38, 0.58, 0.65, 0.78, 0.50), # Low shark grille with Trident
        ( 2.10, 0.12, 0.48, 0.68, 0.82, 0.90, 0.65), # Sculpted nose ducts
        ( f_axle + 0.38, 0.13, 0.58, 0.76, 0.88, 0.96, 0.70), # Front pontoon fender
        ( f_axle,        0.13, 0.60, 0.78, 0.90, 0.98, 0.72), # Front axle
        ( f_axle - 0.38, 0.13, 0.58, 0.79, 0.88, 0.96, 0.70), # Fender rear
        ( 0.45, 0.13, 0.56, 0.82, 0.82, 0.90, 0.68), # Butterfly door waist cutout
        ( 0.05, 0.13, 0.58, 1.20, 0.80, 0.88, 0.56), # Teardrop canopy top
        (-0.55, 0.13, 0.59, 1.18, 0.80, 0.88, 0.56), # Mid roof
        ( r_axle + 0.42, 0.13, 0.62, 0.96, 0.88, 0.96, 0.58), # Rear engine air channels
        ( r_axle,        0.13, 0.64, 0.88, 0.90, 0.98, 0.54), # Rear axle
        ( r_axle - 0.42, 0.14, 0.63, 0.82, 0.86, 0.94, 0.50), # Rear quarter
        (-1.98, 0.22, 0.60, 0.80, 0.80, 0.88, 0.44), # Rear deck with Trident louvers
        (-2.32, 0.26, 0.52, 0.78, 0.74, 0.82, 0.38), # Diffuser & center exhaust
    ]
    build_coupe_shell("MaseratiMC20", mats, roots, stations, f_axle, r_axle, wheel_r=wheel_r)

    # Glass Teardrop Canopy
    bm_glass = bmesh.new()
    g_rows = [
        [Vector(( 0.0,  0.42, 0.84)), Vector(( 0.62,  0.42, 0.82))],
        [Vector(( 0.0,  0.03, 1.19)), Vector(( 0.54,  0.03, 1.17))],
        [Vector(( 0.0, -0.58, 1.17)), Vector(( 0.54, -0.58, 1.15))],
        [Vector(( 0.0, -1.72, 0.82)), Vector(( 0.42, -1.72, 0.80))],
    ]
    full_g_rows = [[Vector((-r[1].x, r[1].y, r[1].z)), r[0], r[1]] for r in g_rows]
    make_quad_grid(bm_glass, full_g_rows)
    link_obj("GLASS_MaseratiMC20", bm_glass, roots["GLASS"], mats["glass"], bevel=0.002)

    # Trident Cooling Louvers on Rear Engine Cover
    bm_aero = bmesh.new()
    for ly in [-0.85, -1.05, -1.25]:
        bmesh.ops.create_cube(bm_aero, size=0.02)
        for v in bm_aero.verts[-8:]:
            v.co.x *= 14.0
            v.co.y = v.co.y * 1.5 + ly
            v.co.z = v.co.z * 0.5 + 0.98
    link_obj("AERO_MaseratiMC20_Louvers", bm_aero, roots["AERO"], mats["trim_dark"], bevel=0.002)

    # Dual Center-High Exhaust Outlets
    bm_ex = bmesh.new()
    for s in [0.18, -0.18]:
        bmesh.ops.create_cone(bm_ex, cap_ends=True, cap_tris=False, segments=16, radius1=0.045, radius2=0.045, depth=0.15)
        for v in bm_ex.verts[-34:]:
            v.co = Vector((s, v.co.z - 2.30, v.co.y + 0.58))
    link_obj("AERO_MaseratiMC20_Exhaust", bm_ex, roots["AERO"], mats["exhaust"], bevel=0.002)

# ----------------------------------------------------------------------------
# Future: Polestar Synergy Concept
# ----------------------------------------------------------------------------
def build_coupe_future(mats, roots):
    wb = 2.80
    track_f, track_r = 1.72, 1.74
    wheel_r = 0.35
    f_axle = wb / 2.0
    r_axle = -wb / 2.0

    create_wheels(roots, mats, wb, track_f, track_r, wheel_r=wheel_r, spoke_count=3, rim_mat=mats["wheel_dark"], caliper_color=(0.95, 0.75, 0.15, 1.0))

    stations = [
        ( 2.28, 0.08, 0.32, 0.52, 0.70, 0.82, 0.52), # Razor sharp front aero nose
        ( 2.05, 0.09, 0.44, 0.62, 0.86, 0.94, 0.68), # Floating front fender pontoon
        ( f_axle + 0.38, 0.10, 0.54, 0.72, 0.92, 0.98, 0.72), # Pontoon arch start
        ( f_axle,        0.10, 0.56, 0.74, 0.94, 1.02, 0.74), # Front axle
        ( f_axle - 0.38, 0.10, 0.54, 0.74, 0.92, 0.98, 0.72), # Pontoon air bypass
        ( 0.45, 0.10, 0.50, 0.76, 0.80, 0.88, 0.66), # Extreme waist pinch
        ( 0.05, 0.10, 0.52, 1.05, 0.78, 0.86, 0.54), # Single-piece fighter canopy
        (-0.60, 0.10, 0.53, 1.04, 0.78, 0.86, 0.54), # Canopy crown
        ( r_axle + 0.42, 0.10, 0.58, 0.88, 0.92, 1.02, 0.58), # Rear pontoon arch start
        ( r_axle,        0.10, 0.60, 0.82, 0.94, 1.04, 0.54), # Rear axle
        ( r_axle - 0.42, 0.10, 0.58, 0.76, 0.92, 1.00, 0.50), # Rear arch end
        (-1.95, 0.18, 0.54, 0.72, 0.84, 0.92, 0.44), # Rear aero bridge
        (-2.28, 0.24, 0.46, 0.70, 0.78, 0.86, 0.38), # Continuous lightblade spoiler
    ]
    build_coupe_shell("PolestarSynergy", mats, roots, stations, f_axle, r_axle, wheel_r=wheel_r)

    # Continuous Monolithic Jet Canopy
    bm_glass = bmesh.new()
    g_rows = [
        [Vector(( 0.0,  0.42, 0.78)), Vector(( 0.58,  0.42, 0.76))],
        [Vector(( 0.0,  0.03, 1.04)), Vector(( 0.52,  0.03, 1.02))],
        [Vector(( 0.0, -0.62, 1.03)), Vector(( 0.52, -0.62, 1.01))],
        [Vector(( 0.0, -1.68, 0.74)), Vector(( 0.40, -1.68, 0.72))],
    ]
    full_g_rows = [[Vector((-r[1].x, r[1].y, r[1].z)), r[0], r[1]] for r in g_rows]
    make_quad_grid(bm_glass, full_g_rows)
    link_obj("GLASS_PolestarSynergy", bm_glass, roots["GLASS"], mats["glass"], bevel=0.002)

    # Dual-Blade Full-Width Front Laser Light Bar
    bm_lights = bmesh.new()
    for s in [1.0, -1.0]:
        bmesh.ops.create_cube(bm_lights, size=0.02)
        for v in bm_lights.verts[-8:]:
            v.co.x = v.co.x * 24.0 + s * 0.45
            v.co.y = v.co.y * 0.8 + 2.25
            v.co.z = v.co.z * 0.3 + 0.48
    link_obj("LIGHT_Headlights_PolestarSynergy", bm_lights, roots["LIGHT"], mats["drl"], bevel=0.001)

    # Full-Width Aerodynamic Rear Lightblade
    bm_tail = bmesh.new()
    bmesh.ops.create_cube(bm_tail, size=0.025)
    for v in bm_tail.verts:
        v.co.x *= 36.0
        v.co.y = v.co.y * 1.5 - 2.28
        v.co.z = v.co.z * 0.4 + 0.71
    link_obj("LIGHT_Taillights_PolestarSynergy", bm_tail, roots["LIGHT"], mats["taillight"], bevel=0.001)

# ----------------------------------------------------------------------------
# 6. MASTER DISPATCHER & GLB EXPORTER
# ----------------------------------------------------------------------------
COUPE_FLEET = {
    "1970s": {
        "name": "Datsun 240Z",
        "color": (0.88, 0.45, 0.05, 1.0), # Safari Gold
        "builder": build_coupe_1970s,
    },
    "1980s": {
        "name": "Audi Quattro",
        "color": (0.92, 0.92, 0.93, 1.0), # Alpine White
        "builder": build_coupe_1980s,
    },
    "1990s": {
        "name": "Toyota Supra A80",
        "color": (0.85, 0.05, 0.05, 1.0), # Renaissance Red
        "builder": build_coupe_1990s,
    },
    "2000s": {
        "name": "Nissan Skyline GT-R (R34)",
        "color": (0.04, 0.12, 0.65, 1.0), # Bayside Blue TV2
        "builder": build_coupe_2000s,
    },
    "2010s": {
        "name": "BMW M4 GTS (F82)",
        "color": (0.16, 0.17, 0.18, 1.0), # Frozen Dark Grey Metallic
        "accent": (0.95, 0.35, 0.02, 1.0), # Acid Orange
        "builder": build_coupe_2010s,
    },
    "2020s": {
        "name": "Maserati MC20",
        "color": (0.92, 0.93, 0.95, 1.0), # Bianco Audace Matte White
        "builder": build_coupe_2020s,
    },
    "future": {
        "name": "Polestar Synergy Concept",
        "color": (0.95, 0.95, 0.97, 1.0), # Stark Ceramic White
        "accent": (0.95, 0.75, 0.15, 1.0), # Swedish Gold
        "builder": build_coupe_future,
    },
}

def generate_coupe(era_id):
    if era_id not in COUPE_FLEET:
        raise ValueError(f"Unknown era: {era_id}")

    info = COUPE_FLEET[era_id]
    print(f"\n=======================================================")
    print(f"GENERATING COUPE ({era_id.upper()}): {info['name']}")
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

    mats = create_coupe_materials(era_id, info["color"], info.get("accent"))
    info["builder"](mats, roots)

    out_dir = os.path.join(PUBLIC_MODELS_DIR, era_id)
    os.makedirs(out_dir, exist_ok=True)
    os.makedirs(EXPORTS_DIR, exist_ok=True)

    glb_public = os.path.normpath(os.path.abspath(os.path.join(out_dir, "vehicle.glb")))
    clean_name = info["name"].replace(" ", "_").replace("(", "").replace(")", "").replace("/", "_").replace("-", "_")
    glb_export = os.path.normpath(os.path.abspath(os.path.join(EXPORTS_DIR, f"Car_{clean_name}_{era_id}.glb")))

    if os.path.exists(glb_public):
        try:
            os.remove(glb_public)
        except Exception:
            pass
    if os.path.exists(glb_export):
        try:
            os.remove(glb_export)
        except Exception:
            pass

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

def generate_all_coupes():
    for era_id in ["1970s", "1980s", "1990s", "2000s", "2010s", "2020s", "future"]:
        generate_coupe(era_id)

if __name__ == "__main__":
    generate_all_coupes()
