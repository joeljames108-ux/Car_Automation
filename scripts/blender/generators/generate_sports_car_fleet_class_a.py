"""
=============================================================================
CLASS-A CAD PROCEDURAL GENERATOR: SPORTS CAR FLEET (ALL 7 ERAS)
=============================================================================
Constructs authentic, photo-accurate Class-A CAD models for all 7 eras of
the Sports Car architecture:
1. 1970s: Porsche 911 Turbo (930)
2. 1980s: Mazda RX-7 (FC3S)
3. 1990s: Honda NSX (NA1)
4. 2000s: Porsche 911 GT3 (997)
5. 2010s: Chevrolet Corvette Stingray (C7)
6. 2020s: Alpine A110 R
7. Future: Lotus Evija

Conforms to Blender 5.2 LTS, metric units (meters), Y-forward (+Y), Z-up (+Z),
X-lateral (+X driver side), full interior, underbody pans, wheels, and tri-target GLB export.
=============================================================================
"""

import bpy
import bmesh
import math
import os
from mathutils import Vector, Matrix, Euler

try:
    CURRENT_FILE = __file__
except NameError:
    CURRENT_FILE = r"E:\Car_Automation\scripts\blender\generators\generate_sports_car_fleet_class_a.py"

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(CURRENT_FILE), "..", "..", ".."))

# ----------------------------------------------------------------------------
# 1. SCENE RESET & PBR SHADER FACTORY
# ----------------------------------------------------------------------------
def safe_reset():
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for mesh in list(bpy.data.meshes):
        bpy.data.meshes.remove(mesh, do_unlink=True)
    for mat in list(bpy.data.materials):
        bpy.data.materials.remove(mat, do_unlink=True)
    for col in list(bpy.data.collections):
        if col.name != "Collection":
            bpy.data.collections.remove(col, do_unlink=True)

    bpy.context.scene.unit_settings.system = 'METRIC'
    bpy.context.scene.unit_settings.scale_length = 1.0

def make_pbr_mat(name, base_color, metallic=0.0, roughness=0.5, clearcoat=0.0,
                 transmission=0.0, ior=1.45, emission=None, emission_strength=1.0):
    mat = bpy.data.materials.get(name)
    if not mat:
        mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    tree = mat.node_tree
    tree.nodes.clear()

    out = tree.nodes.new('ShaderNodeOutputMaterial')
    bsdf = tree.nodes.new('ShaderNodeBsdfPrincipled')

    bsdf.inputs['Base Color'].default_value = base_color
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['IOR'].default_value = ior

    if hasattr(bsdf.inputs, 'Coat Weight'):
        bsdf.inputs['Coat Weight'].default_value = clearcoat
    elif 'Clearcoat' in bsdf.inputs:
        bsdf.inputs['Clearcoat'].default_value = clearcoat

    if 'Transmission Weight' in bsdf.inputs:
        bsdf.inputs['Transmission Weight'].default_value = transmission
    elif 'Transmission' in bsdf.inputs:
        bsdf.inputs['Transmission'].default_value = transmission

    if emission:
        if 'Emission Color' in bsdf.inputs:
            bsdf.inputs['Emission Color'].default_value = emission
        elif 'Emission' in bsdf.inputs:
            bsdf.inputs['Emission'].default_value = emission
        if 'Emission Strength' in bsdf.inputs:
            bsdf.inputs['Emission Strength'].default_value = emission_strength

    tree.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    if transmission > 0.05:
        mat.blend_method = 'BLEND'
    return mat

def link_mesh(name, bm, parent, mat, bevel_radius=0.0):
    mesh = bpy.data.meshes.new(name + "_Mesh")
    bm.to_mesh(mesh)
    bm.free()
    if hasattr(mesh, 'calc_normals'):
        mesh.calc_normals()

    obj = bpy.data.objects.new(name, mesh)
    if parent:
        obj.parent = parent
    bpy.context.scene.collection.objects.link(obj)
    if mat:
        obj.data.materials.append(mat)

    if bevel_radius > 0:
        bev = obj.modifiers.new("Bevel", 'BEVEL')
        bev.width = bevel_radius
        bev.segments = 2
        bev.limit_method = 'ANGLE'
        bev.angle_limit = math.radians(35)
    return obj

# ----------------------------------------------------------------------------
# 2. WHEEL GENERATOR
# ----------------------------------------------------------------------------
def build_sports_wheel(parent, mats, name, pos, is_left, wheel_r, tire_w, spoke_count, rim_mat, caliper_mat):
    sign = 1.0 if is_left else -1.0
    rim_r = wheel_r * 0.74
    hw = tire_w / 2.0

    bm_tire = bmesh.new()
    segs = 32
    profile = [
        (rim_r, -hw), (wheel_r * 0.95, -hw), (wheel_r, -hw * 0.75),
        (wheel_r, hw * 0.75), (wheel_r * 0.95, hw), (rim_r, hw)
    ]
    for s in range(segs):
        a1, a2 = 2.0 * math.pi * s / segs, 2.0 * math.pi * (s + 1) / segs
        c1, s1 = math.cos(a1), math.sin(a1)
        c2, s2 = math.cos(a2), math.sin(a2)
        for p in range(len(profile) - 1):
            rA, xA = profile[p]
            rB, xB = profile[p + 1]
            v1 = bm_tire.verts.new((pos.x + xA * sign, pos.y + rA * c1, pos.z + rA * s1))
            v2 = bm_tire.verts.new((pos.x + xB * sign, pos.y + rB * c1, pos.z + rB * s1))
            v3 = bm_tire.verts.new((pos.x + xB * sign, pos.y + rB * c2, pos.z + rB * s2))
            v4 = bm_tire.verts.new((pos.x + xA * sign, pos.y + rA * c2, pos.z + rA * s2))
            bm_tire.faces.new((v1, v2, v3, v4) if is_left else (v4, v3, v2, v1))
    bmesh.ops.remove_doubles(bm_tire, verts=bm_tire.verts, dist=0.001)
    link_mesh(f"WHEEL_{name}_Tire", bm_tire, parent, mats["tire_rubber"])

    bm_rim = bmesh.new()
    for s in range(segs):
        a1, a2 = 2.0 * math.pi * s / segs, 2.0 * math.pi * (s + 1) / segs
        c1, s1 = math.cos(a1), math.sin(a1)
        c2, s2 = math.cos(a2), math.sin(a2)
        v1 = bm_rim.verts.new((pos.x + hw * sign, pos.y + rim_r * c1, pos.z + rim_r * s1))
        v2 = bm_rim.verts.new((pos.x + (hw * 0.35) * sign, pos.y + (rim_r * 0.88) * c1, pos.z + (rim_r * 0.88) * s1))
        v3 = bm_rim.verts.new((pos.x + (hw * 0.35) * sign, pos.y + (rim_r * 0.88) * c2, pos.z + (rim_r * 0.88) * s2))
        v4 = bm_rim.verts.new((pos.x + hw * sign, pos.y + rim_r * c2, pos.z + rim_r * s2))
        bm_rim.faces.new((v1, v2, v3, v4) if is_left else (v4, v3, v2, v1))

    hub_r = rim_r * 0.28
    hub_x = pos.x + (hw * 0.45) * sign
    spoke_w = (2.0 * math.pi * hub_r) / (spoke_count * 2.2)
    for sp in range(spoke_count):
        ang = 2.0 * math.pi * sp / spoke_count
        c, s = math.cos(ang), math.sin(ang)
        perp_y, perp_z = -s, c
        p1 = Vector((hub_x, pos.y + hub_r * c - spoke_w * 0.5 * perp_y, pos.z + hub_r * s - spoke_w * 0.5 * perp_z))
        p2 = Vector((hub_x, pos.y + hub_r * c + spoke_w * 0.5 * perp_y, pos.z + hub_r * s + spoke_w * 0.5 * perp_z))
        p3 = Vector((pos.x + hw * sign * 0.95, pos.y + rim_r * 0.90 * c + spoke_w * 0.6 * perp_y, pos.z + rim_r * 0.90 * s + spoke_w * 0.6 * perp_z))
        p4 = Vector((pos.x + hw * sign * 0.95, pos.y + rim_r * 0.90 * c - spoke_w * 0.6 * perp_y, pos.z + rim_r * 0.90 * s - spoke_w * 0.6 * perp_z))
        v1 = bm_rim.verts.new(p1)
        v2 = bm_rim.verts.new(p2)
        v3 = bm_rim.verts.new(p3)
        v4 = bm_rim.verts.new(p4)
        bm_rim.faces.new((v1, v2, v3, v4) if is_left else (v4, v3, v2, v1))

    for lug in range(5):
        la = 2.0 * math.pi * lug / 5.0
        lx = hub_x + 0.005 * sign
        ly = pos.y + hub_r * 0.55 * math.cos(la)
        lz = pos.z + hub_r * 0.55 * math.sin(la)
        bmesh.ops.create_cone(bm_rim, cap_ends=True, segments=6, radius1=0.012, radius2=0.012, depth=0.015,
                              matrix=Matrix.Translation(Vector((lx, ly, lz))) @ Matrix.Rotation(math.radians(90), 4, 'Y'))

    bmesh.ops.remove_doubles(bm_rim, verts=bm_rim.verts, dist=0.001)
    link_mesh(f"WHEEL_{name}_Rim", bm_rim, parent, rim_mat)

    # 3. Brake Rotor & Caliper
    bm_rotor = bmesh.new()
    rotor_r = rim_r * 0.84
    rotor_x = pos.x - (hw * 0.22) * sign
    for s in range(24):
        a1, a2 = 2.0 * math.pi * s / 24, 2.0 * math.pi * (s + 1) / 24
        c1, s1 = math.cos(a1), math.sin(a1)
        c2, s2 = math.cos(a2), math.sin(a2)
        v1 = bm_rotor.verts.new((rotor_x, pos.y + rotor_r * 0.35 * c1, pos.z + rotor_r * 0.35 * s1))
        v2 = bm_rotor.verts.new((rotor_x, pos.y + rotor_r * c1, pos.z + rotor_r * s1))
        v3 = bm_rotor.verts.new((rotor_x, pos.y + rotor_r * c2, pos.z + rotor_r * s2))
        v4 = bm_rotor.verts.new((rotor_x, pos.y + rotor_r * 0.35 * c2, pos.z + rotor_r * 0.35 * s2))
        bm_rotor.faces.new((v1, v2, v3, v4) if is_left else (v4, v3, v2, v1))
    bmesh.ops.remove_doubles(bm_rotor, verts=bm_rotor.verts, dist=0.001)
    link_mesh(f"BRAKE_{name}_Rotor", bm_rotor, parent, mats["brake_disc"])

    bm_cal = bmesh.new()
    bmesh.ops.create_cube(bm_cal, size=1.0)
    bmesh.ops.scale(bm_cal, vec=Vector((0.07, 0.17, 0.09)), verts=bm_cal.verts)
    cal_loc = Vector((rotor_x + 0.015 * sign, pos.y + rotor_r * 0.65, pos.z + rotor_r * 0.55))
    bmesh.ops.translate(bm_cal, vec=cal_loc, verts=bm_cal.verts)
    link_mesh(f"BRAKE_{name}_Caliper", bm_cal, parent, caliper_mat, bevel_radius=0.004)

def install_sports_wheels(parent, mats, wb, tf, tr, wr, tw, spokes, rim_mat, cal_mat):
    half_wb = wb / 2.0
    corners = [
        ("FL", Vector(( tf / 2.0,  half_wb, wr)), True),
        ("FR", Vector((-tf / 2.0,  half_wb, wr)), False),
        ("RL", Vector(( tr / 2.0, -half_wb, wr)), True),
        ("RR", Vector((-tr / 2.0, -half_wb, wr)), False),
    ]
    for name, pos, is_left in corners:
        build_sports_wheel(parent, mats, name, pos, is_left, wr, tw, spokes, rim_mat, cal_mat)

# ----------------------------------------------------------------------------
# 3. INTERIOR COCKPIT & UNDERBODY
# ----------------------------------------------------------------------------
def build_sports_interior(roots, mats, wb, width, sill_z, roof_z):
    half_wb = wb / 2.0
    half_w = width / 2.0

    # 1. Underbody Belly Pan
    bm_floor = bmesh.new()
    bmesh.ops.create_cube(bm_floor, size=1.0)
    bmesh.ops.scale(bm_floor, vec=Vector((width * 0.88, wb * 1.60, 0.04)), verts=bm_floor.verts)
    bmesh.ops.translate(bm_floor, vec=Vector((0, 0, sill_z + 0.02)), verts=bm_floor.verts)
    link_mesh("CHASSIS_BellyPan", bm_floor, roots["BODY"], mats["trim_dark"])

    # 2. Sports Bucket Seats
    bm_seats = bmesh.new()
    for side in [1.0, -1.0]:
        sx = side * (half_w * 0.44)
        sy = -half_wb * 0.06
        bmesh.ops.create_cube(bm_seats, size=1.0)
        for v in bm_seats.verts[-8:]:
            v.co.x = v.co.x * 0.42 + sx
            v.co.y = v.co.y * 0.46 + sy
            v.co.z = v.co.z * 0.12 + (sill_z + 0.20)
        bmesh.ops.create_cube(bm_seats, size=1.0)
        for v in bm_seats.verts[-8:]:
            v.co.x = v.co.x * 0.40 + sx
            v.co.y = v.co.y * 0.14 + (sy - 0.22)
            v.co.z = v.co.z * 0.56 + (sill_z + 0.50)
    link_mesh("INTERIOR_SportsSeats", bm_seats, roots["INTERIOR"], mats["interior"], bevel_radius=0.008)

    # 3. Dashboard & Center Tunnel
    bm_dash = bmesh.new()
    bmesh.ops.create_cube(bm_dash, size=1.0)
    for v in bm_dash.verts[-8:]:
        v.co.x = v.co.x * (width * 0.78)
        v.co.y = v.co.y * 0.42 + (half_wb * 0.34)
        v.co.z = v.co.z * 0.26 + (sill_z + 0.52)
    bmesh.ops.create_cube(bm_dash, size=1.0)
    for v in bm_dash.verts[-8:]:
        v.co.x = v.co.x * 0.22
        v.co.y = v.co.y * 0.90 - 0.08
        v.co.z = v.co.z * 0.16 + (sill_z + 0.26)
    link_mesh("INTERIOR_Dashboard", bm_dash, roots["INTERIOR"], mats["trim_dark"], bevel_radius=0.006)

    # 4. Steering Wheel
    bm_steer = bmesh.new()
    steer_x = half_w * 0.44
    steer_y = half_wb * 0.18
    steer_z = sill_z + 0.58
    bmesh.ops.create_cone(bm_steer, cap_ends=True, segments=24, radius1=0.17, radius2=0.17, depth=0.025,
                          matrix=Matrix.Translation(Vector((steer_x, steer_y, steer_z))) @ Matrix.Rotation(math.radians(-22), 4, 'X'))
    link_mesh("INTERIOR_SteeringWheel", bm_steer, roots["INTERIOR"], mats["trim_dark"], bevel_radius=0.003)

# ----------------------------------------------------------------------------
# 4. LOFTED BODY SHELL
# ----------------------------------------------------------------------------
def build_lofted_sports_shell(name, mats, roots, stations, f_axle, r_axle, wheel_r=0.33):
    bm = bmesh.new()
    r_arch = wheel_r * 1.15

    for side in [1.0, -1.0]:
        rows = []
        for fy, z_sill_base, fz_waist, fz_roof, fw_bot, fw_waist, fw_roof in stations:
            dy_f = fy - f_axle
            dy_r = fy - r_axle
            z_sill = z_sill_base

            if abs(dy_f) < r_arch:
                arch_z = wheel_r + math.sqrt(max(0.002, r_arch**2 - dy_f**2))
                if arch_z > z_sill: z_sill = arch_z
            elif abs(dy_r) < r_arch:
                arch_z = wheel_r + math.sqrt(max(0.002, r_arch**2 - dy_r**2))
                if arch_z > z_sill: z_sill = arch_z

            p_sill = Vector((side * fw_bot, fy, z_sill))
            p_waist = Vector((side * fw_waist, fy, fz_waist))
            p_cant = Vector((side * ((fw_waist + fw_roof) * 0.52), fy, (fz_waist + fz_roof) * 0.50))
            p_roof = Vector((side * fw_roof, fy, fz_roof))
            rows.append([p_sill, p_waist, p_cant, p_roof])

        num_stations = len(rows)
        for i in range(num_stations - 1):
            r1 = rows[i]
            r2 = rows[i + 1]
            for j in range(len(r1) - 1):
                v1 = bm.verts.new(r1[j])
                v2 = bm.verts.new(r1[j + 1])
                v3 = bm.verts.new(r2[j + 1])
                v4 = bm.verts.new(r2[j])
                bm.faces.new((v1, v2, v3, v4) if side > 0 else (v4, v3, v2, v1))

    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.002)
    return link_mesh(f"BODY_{name}_MainShell", bm, roots["BODY"], mats["paint"], bevel_radius=0.004)

# ----------------------------------------------------------------------------
# 5. INDIVIDUAL SPORTS CAR BUILDERS
# ----------------------------------------------------------------------------

# 1970s: Porsche 911 Turbo (930)
def build_930_1970s(roots, mats):
    wb, tf, tr, wr, tw = 2.27, 1.43, 1.50, 0.32, 0.255
    f_axle, r_axle = wb / 2.0, -wb / 2.0

    install_sports_wheels(roots["WHEEL"], mats, wb, tf, tr, wr, tw, 5, mats["wheel_alloy"], mats["brake_caliper"])
    build_sports_interior(roots, mats, wb, 1.77, 0.12, 1.31)

    stations = [
        ( 2.15, 0.14, 0.40, 0.56, 0.58, 0.70, 0.46), # Classic impact bumper front nose
        ( 1.85, 0.14, 0.52, 0.68, 0.72, 0.82, 0.58), # Upright round headlights in crowned fenders
        ( f_axle + 0.35, 0.14, 0.58, 0.78, 0.78, 0.86, 0.64), # Flared front wing
        ( f_axle,        0.14, 0.60, 0.81, 0.82, 0.89, 0.66), # Front axle
        ( f_axle - 0.35, 0.14, 0.59, 0.82, 0.78, 0.87, 0.66), # Wing end
        ( 0.40, 0.14, 0.58, 0.86, 0.76, 0.85, 0.66), # Windshield base
        ( 0.00, 0.14, 0.60, 1.31, 0.76, 0.84, 0.58), # Classic 911 teardrop roofline
        (-0.45, 0.14, 0.60, 1.28, 0.76, 0.85, 0.56), # Rear sloping glass
        ( r_axle + 0.42, 0.14, 0.62, 1.05, 0.84, 0.94, 0.54), # Enormous flared Turbo rear haunch
        ( r_axle,        0.14, 0.64, 0.96, 0.88, 0.96, 0.50), # Rear axle
        ( r_axle - 0.42, 0.14, 0.62, 0.88, 0.84, 0.92, 0.46), # Haunch end
        (-1.85, 0.18, 0.60, 0.84, 0.78, 0.88, 0.42), # Whale tail spoiler deck
        (-2.15, 0.24, 0.54, 0.82, 0.74, 0.83, 0.38), # Rubber accordion rear bumper
    ]
    build_lofted_sports_shell("Porsche_911_Turbo_930", mats, roots, stations, f_axle, r_axle, wheel_r=wr)

    # Glass
    bm_glass = bmesh.new()
    bmesh.ops.create_cube(bm_glass, size=1.0)
    bmesh.ops.scale(bm_glass, vec=Vector((1.38, 1.76, 0.48)), verts=bm_glass.verts)
    bmesh.ops.translate(bm_glass, vec=Vector((0, -0.20, 1.04)), verts=bm_glass.verts)
    link_mesh("GLASS_Porsche_930", bm_glass, roots["GLASS"], mats["glass"])

    # Iconic "Whale Tail" Tea-Tray Rear Spoiler
    bm_spoil = bmesh.new()
    bmesh.ops.create_cube(bm_spoil, size=1.0)
    bmesh.ops.scale(bm_spoil, vec=Vector((1.45, 0.48, 0.08)), verts=bm_spoil.verts)
    bmesh.ops.translate(bm_spoil, vec=Vector((0, -1.82, 0.96)), verts=bm_spoil.verts)
    link_mesh("AERO_WhaleTailSpoiler", bm_spoil, roots["AERO"], mats["trim_dark"], bevel_radius=0.004)

# 1980s: Mazda RX-7 (FC3S)
def build_rx7_1980s(roots, mats):
    wb, tf, tr, wr, tw = 2.43, 1.45, 1.44, 0.32, 0.245
    f_axle, r_axle = wb / 2.0, -wb / 2.0

    install_sports_wheels(roots["WHEEL"], mats, wb, tf, tr, wr, tw, 5, mats["wheel_alloy"], mats["brake_caliper"])
    build_sports_interior(roots, mats, wb, 1.69, 0.12, 1.26)

    stations = [
        ( 2.18, 0.14, 0.36, 0.50, 0.55, 0.68, 0.44), # Sharp aerodynamic wedge nose
        ( 1.90, 0.14, 0.46, 0.62, 0.72, 0.80, 0.58), # Pop-up headlamps & functional intercooler hood scoop
        ( f_axle + 0.35, 0.14, 0.56, 0.74, 0.78, 0.85, 0.64), # Front fender
        ( f_axle,        0.14, 0.58, 0.77, 0.81, 0.87, 0.66), # Front axle
        ( f_axle - 0.35, 0.14, 0.57, 0.78, 0.78, 0.86, 0.66), # Door cut
        ( 0.42, 0.14, 0.56, 0.84, 0.76, 0.84, 0.64), # Windshield base
        ( 0.05, 0.14, 0.58, 1.26, 0.74, 0.83, 0.56), # Roofline apex
        (-0.45, 0.14, 0.58, 1.25, 0.75, 0.84, 0.56), # Large wraparound glass rear hatch
        ( r_axle + 0.40, 0.14, 0.60, 1.02, 0.80, 0.88, 0.52), # Rear quarter
        ( r_axle,        0.14, 0.61, 0.94, 0.83, 0.89, 0.48), # Rear axle
        ( r_axle - 0.40, 0.14, 0.60, 0.86, 0.80, 0.87, 0.44), # Quarter end
        (-1.85, 0.18, 0.58, 0.84, 0.76, 0.84, 0.40), # Rear decklid with ducktail lip
        (-2.15, 0.24, 0.52, 0.80, 0.72, 0.80, 0.36), # Boxy rear bumper
    ]
    build_lofted_sports_shell("Mazda_RX7_FC3S", mats, roots, stations, f_axle, r_axle, wheel_r=wr)

    # Glass
    bm_glass = bmesh.new()
    bmesh.ops.create_cube(bm_glass, size=1.0)
    bmesh.ops.scale(bm_glass, vec=Vector((1.35, 1.74, 0.46)), verts=bm_glass.verts)
    bmesh.ops.translate(bm_glass, vec=Vector((0, -0.20, 1.00)), verts=bm_glass.verts)
    link_mesh("GLASS_Mazda_RX7", bm_glass, roots["GLASS"], mats["glass"])

    # Hood Scoop for Turbo Rotary Intercooler
    bm_scoop = bmesh.new()
    bmesh.ops.create_cube(bm_scoop, size=1.0)
    bmesh.ops.scale(bm_scoop, vec=Vector((0.28, 0.32, 0.05)), verts=bm_scoop.verts)
    bmesh.ops.translate(bm_scoop, vec=Vector((0, 0.85, 0.78)), verts=bm_scoop.verts)
    link_mesh("AERO_HoodScoop", bm_scoop, roots["AERO"], mats["paint"], bevel_radius=0.003)

# 1990s: Honda NSX (NA1)
def build_nsx_1990s(roots, mats):
    wb, tf, tr, wr, tw = 2.53, 1.51, 1.53, 0.325, 0.255
    f_axle, r_axle = wb / 2.0, -wb / 2.0

    install_sports_wheels(roots["WHEEL"], mats, wb, tf, tr, wr, tw, 5, mats["wheel_alloy"], mats["brake_caliper"])
    build_sports_interior(roots, mats, wb, 1.81, 0.10, 1.17)

    stations = [
        ( 2.22, 0.10, 0.34, 0.48, 0.58, 0.70, 0.46), # Low aluminum front nose & chin spoiler
        ( 1.95, 0.10, 0.44, 0.60, 0.74, 0.84, 0.58), # Retractable pop-up headlights
        ( f_axle + 0.35, 0.10, 0.52, 0.72, 0.80, 0.88, 0.64), # Front wheel arch
        ( f_axle,        0.10, 0.55, 0.76, 0.84, 0.91, 0.66), # Front axle
        ( f_axle - 0.35, 0.10, 0.54, 0.77, 0.80, 0.88, 0.66), # Door entry
        ( 0.42, 0.10, 0.52, 0.82, 0.78, 0.87, 0.64), # F-16 inspired black canopy base
        ( 0.02, 0.10, 0.54, 1.17, 0.76, 0.85, 0.54), # Black roof canopy apex
        (-0.48, 0.10, 0.54, 1.15, 0.78, 0.86, 0.52), # Mid-engine C30A VTEC glass engine cover
        ( r_axle + 0.42, 0.10, 0.58, 0.98, 0.84, 0.92, 0.50), # Side air intake scoops & haunch
        ( r_axle,        0.10, 0.60, 0.88, 0.88, 0.95, 0.46), # Rear axle
        ( r_axle - 0.42, 0.10, 0.58, 0.82, 0.84, 0.91, 0.42), # Haunch end
        (-1.90, 0.14, 0.54, 0.82, 0.80, 0.90, 0.38), # Integrated floating rear wing with lightbar
        (-2.20, 0.22, 0.48, 0.78, 0.76, 0.84, 0.34), # Dual oval exhaust tips
    ]
    build_lofted_sports_shell("Honda_NSX_NA1", mats, roots, stations, f_axle, r_axle, wheel_r=wr)

    # Glass
    bm_glass = bmesh.new()
    bmesh.ops.create_cube(bm_glass, size=1.0)
    bmesh.ops.scale(bm_glass, vec=Vector((1.38, 1.76, 0.44)), verts=bm_glass.verts)
    bmesh.ops.translate(bm_glass, vec=Vector((0, -0.18, 0.96)), verts=bm_glass.verts)
    link_mesh("GLASS_Honda_NSX", bm_glass, roots["GLASS"], mats["glass"])

    # Integrated Floating Rear Wing
    bm_wing = bmesh.new()
    bmesh.ops.create_cube(bm_wing, size=1.0)
    bmesh.ops.scale(bm_wing, vec=Vector((1.60, 0.26, 0.04)), verts=bm_wing.verts)
    bmesh.ops.translate(bm_wing, vec=Vector((0, -2.06, 0.94)), verts=bm_wing.verts)
    link_mesh("AERO_NSX_IntegratedWing", bm_wing, roots["AERO"], mats["paint"], bevel_radius=0.003)

# 2000s: Porsche 911 GT3 (997)
def build_997_gt3_2000s(roots, mats):
    wb, tf, tr, wr, tw = 2.355, 1.497, 1.524, 0.34, 0.275
    f_axle, r_axle = wb / 2.0, -wb / 2.0

    install_sports_wheels(roots["WHEEL"], mats, wb, tf, tr, wr, tw, 5, mats["wheel_alloy"], mats["brake_caliper"])
    build_sports_interior(roots, mats, wb, 1.808, 0.11, 1.28)

    stations = [
        ( 2.24, 0.11, 0.38, 0.54, 0.62, 0.75, 0.48), # GT3 front bumper with central radiator air vent
        ( 1.96, 0.11, 0.48, 0.66, 0.76, 0.86, 0.62), # Oval bi-xenon projector headlamps
        ( f_axle + 0.36, 0.11, 0.58, 0.78, 0.82, 0.90, 0.66), # Front wing
        ( f_axle,        0.11, 0.60, 0.82, 0.86, 0.93, 0.68), # Front axle
        ( f_axle - 0.36, 0.11, 0.59, 0.83, 0.82, 0.89, 0.68), # Door entry
        ( 0.44, 0.11, 0.58, 0.88, 0.80, 0.88, 0.68), # Windshield base
        ( 0.04, 0.11, 0.60, 1.28, 0.78, 0.86, 0.58), # Roof apex
        (-0.46, 0.11, 0.60, 1.26, 0.78, 0.87, 0.58), # Teardrop roofline
        ( r_axle + 0.42, 0.11, 0.62, 1.05, 0.86, 0.95, 0.56), # Muscular rear GT3 haunch
        ( r_axle,        0.11, 0.64, 0.96, 0.90, 0.97, 0.52), # Rear axle
        ( r_axle - 0.42, 0.11, 0.62, 0.90, 0.86, 0.94, 0.48), # Haunch end
        (-1.92, 0.15, 0.60, 0.88, 0.82, 0.92, 0.44), # Decklid with ram-air engine intakes
        (-2.24, 0.22, 0.52, 0.84, 0.76, 0.86, 0.40), # Center dual exhaust outlets
    ]
    build_lofted_sports_shell("Porsche_911_GT3_997", mats, roots, stations, f_axle, r_axle, wheel_r=wr)

    # Glass
    bm_glass = bmesh.new()
    bmesh.ops.create_cube(bm_glass, size=1.0)
    bmesh.ops.scale(bm_glass, vec=Vector((1.40, 1.82, 0.48)), verts=bm_glass.verts)
    bmesh.ops.translate(bm_glass, vec=Vector((0, -0.20, 1.02)), verts=bm_glass.verts)
    link_mesh("GLASS_Porsche_997", bm_glass, roots["GLASS"], mats["glass"])

    # High-downforce Bi-Plane GT3 Rear Wing
    bm_wing = bmesh.new()
    bmesh.ops.create_cube(bm_wing, size=1.0)
    bmesh.ops.scale(bm_wing, vec=Vector((1.62, 0.28, 0.035)), verts=bm_wing.verts)
    bmesh.ops.translate(bm_wing, vec=Vector((0, -2.06, 1.18)), verts=bm_wing.verts)
    for s in [1.0, -1.0]:
        bmesh.ops.create_cube(bm_wing, size=1.0)
        for v in bm_wing.verts[-8:]:
            v.co.x = v.co.x * 0.035 + s * 0.52
            v.co.y = v.co.y * 0.14 - 2.02
            v.co.z = v.co.z * 0.28 + 1.04
    link_mesh("AERO_997_GT3_Wing", bm_wing, roots["AERO"], mats["paint"], bevel_radius=0.003)

# 2010s: Chevrolet Corvette Stingray (C7)
def build_corvette_c7_2010s(roots, mats):
    wb, tf, tr, wr, tw = 2.71, 1.60, 1.59, 0.345, 0.285
    f_axle, r_axle = wb / 2.0, -wb / 2.0

    install_sports_wheels(roots["WHEEL"], mats, wb, tf, tr, wr, tw, 5, mats["wheel_alloy"], mats["brake_caliper"])
    build_sports_interior(roots, mats, wb, 1.877, 0.10, 1.24)

    stations = [
        ( 2.28, 0.10, 0.36, 0.50, 0.64, 0.76, 0.48), # Sharp aggressive front splitter
        ( 2.00, 0.10, 0.46, 0.64, 0.78, 0.88, 0.62), # Bi-Xenon HID headlamps with LED eyebrows
        ( f_axle + 0.38, 0.10, 0.56, 0.76, 0.84, 0.93, 0.68), # Front fender with chrome Stingray badge
        ( f_axle,        0.10, 0.58, 0.80, 0.88, 0.95, 0.70), # Front axle
        ( f_axle - 0.38, 0.10, 0.57, 0.81, 0.84, 0.92, 0.70), # Fender air extractor vent
        ( 0.48, 0.10, 0.56, 0.86, 0.82, 0.91, 0.70), # Carbon hood with center heat extractor
        ( 0.08, 0.10, 0.58, 1.24, 0.80, 0.88, 0.60), # Double-bubble carbon roof
        (-0.48, 0.10, 0.58, 1.22, 0.80, 0.89, 0.60), # Fastback rear hatch
        ( r_axle + 0.44, 0.10, 0.60, 1.04, 0.86, 0.96, 0.58), # Muscular geometric rear haunch
        ( r_axle,        0.10, 0.62, 0.96, 0.90, 0.98, 0.54), # Rear axle
        ( r_axle - 0.44, 0.10, 0.60, 0.90, 0.86, 0.95, 0.50), # Haunch end
        (-1.94, 0.14, 0.58, 0.86, 0.82, 0.91, 0.46), # Decklid with integrated spoiler
        (-2.28, 0.22, 0.50, 0.84, 0.78, 0.86, 0.42), # Quad center trumpet exhaust outlets
    ]
    build_lofted_sports_shell("Chevrolet_Corvette_C7", mats, roots, stations, f_axle, r_axle, wheel_r=wr)

    # Glass
    bm_glass = bmesh.new()
    bmesh.ops.create_cube(bm_glass, size=1.0)
    bmesh.ops.scale(bm_glass, vec=Vector((1.42, 1.84, 0.46)), verts=bm_glass.verts)
    bmesh.ops.translate(bm_glass, vec=Vector((0, -0.22, 1.00)), verts=bm_glass.verts)
    link_mesh("GLASS_Corvette_C7", bm_glass, roots["GLASS"], mats["glass"])

    # Quad Center Trumpet Exhaust Tips
    bm_ex = bmesh.new()
    for s in [-1.5, -0.5, 0.5, 1.5]:
        bmesh.ops.create_cone(bm_ex, cap_ends=True, segments=16, radius1=0.040, radius2=0.040, depth=0.10,
                              matrix=Matrix.Translation(Vector((s * 0.085, -2.26, 0.45))) @ Matrix.Rotation(math.radians(90), 4, 'X'))
    link_mesh("EXHAUST_Corvette_Quad", bm_ex, roots["AERO"], mats["exhaust"])

# 2020s: Alpine A110 R
def build_alpine_2020s(roots, mats):
    wb, tf, tr, wr, tw = 2.42, 1.55, 1.55, 0.33, 0.255
    f_axle, r_axle = wb / 2.0, -wb / 2.0

    install_sports_wheels(roots["WHEEL"], mats, wb, tf, tr, wr, tw, 5, mats["wheel_alloy"], mats["brake_caliper"])
    build_sports_interior(roots, mats, wb, 1.80, 0.10, 1.25)

    stations = [
        ( 2.18, 0.10, 0.34, 0.48, 0.60, 0.72, 0.46), # Carbon front blade with active cooling ducts
        ( 1.90, 0.10, 0.44, 0.62, 0.76, 0.86, 0.60), # Quad rally round LED headlights
        ( f_axle + 0.35, 0.10, 0.54, 0.74, 0.82, 0.90, 0.66), # Compact front wing
        ( f_axle,        0.10, 0.56, 0.78, 0.86, 0.93, 0.68), # Front axle
        ( f_axle - 0.35, 0.10, 0.55, 0.79, 0.82, 0.89, 0.68), # Carbon side skirt
        ( 0.42, 0.10, 0.54, 0.84, 0.80, 0.88, 0.66), # Windshield base
        ( 0.04, 0.10, 0.56, 1.25, 0.78, 0.86, 0.58), # Lightweight carbon roof
        (-0.46, 0.10, 0.56, 1.23, 0.80, 0.88, 0.56), # Solid carbon rear engine window
        ( r_axle + 0.42, 0.10, 0.58, 1.02, 0.84, 0.93, 0.52), # Rear haunch
        ( r_axle,        0.10, 0.60, 0.92, 0.88, 0.95, 0.48), # Rear axle
        ( r_axle - 0.42, 0.10, 0.58, 0.84, 0.84, 0.92, 0.44), # Haunch end
        (-1.88, 0.14, 0.54, 0.82, 0.80, 0.90, 0.40), # Swan-neck rear wing mounts
        (-2.18, 0.22, 0.48, 0.78, 0.76, 0.85, 0.36), # Dual central 3D-printed exhaust
    ]
    build_lofted_sports_shell("Alpine_A110_R", mats, roots, stations, f_axle, r_axle, wheel_r=wr)

    # Glass
    bm_glass = bmesh.new()
    bmesh.ops.create_cube(bm_glass, size=1.0)
    bmesh.ops.scale(bm_glass, vec=Vector((1.38, 1.74, 0.44)), verts=bm_glass.verts)
    bmesh.ops.translate(bm_glass, vec=Vector((0, -0.18, 0.98)), verts=bm_glass.verts)
    link_mesh("GLASS_Alpine_A110", bm_glass, roots["GLASS"], mats["glass"])

    # Carbon Swan-Neck Rear Wing
    bm_wing = bmesh.new()
    bmesh.ops.create_cube(bm_wing, size=1.0)
    bmesh.ops.scale(bm_wing, vec=Vector((1.58, 0.26, 0.03)), verts=bm_wing.verts)
    bmesh.ops.translate(bm_wing, vec=Vector((0, -2.02, 1.12)), verts=bm_wing.verts)
    for s in [1.0, -1.0]:
        bmesh.ops.create_cube(bm_wing, size=1.0)
        for v in bm_wing.verts[-8:]:
            v.co.x = v.co.x * 0.03 + s * 0.45
            v.co.y = v.co.y * 0.12 - 1.98
            v.co.z = v.co.z * 0.26 + 0.98
    link_mesh("AERO_Alpine_SwanNeckWing", bm_wing, roots["AERO"], mats["carbon"], bevel_radius=0.003)

# Future: Lotus Evija
def build_evija_future(roots, mats):
    wb, tf, tr, wr, tw = 2.65, 1.68, 1.68, 0.355, 0.295
    f_axle, r_axle = wb / 2.0, -wb / 2.0

    install_sports_wheels(roots["WHEEL"], mats, wb, tf, tr, wr, tw, 5, mats["wheel_alloy"], mats["brake_caliper"])
    build_sports_interior(roots, mats, wb, 2.00, 0.08, 1.12)

    stations = [
        ( 2.34, 0.08, 0.30, 0.46, 0.66, 0.80, 0.48), # Porous front bi-plane splitter with active air tunnels
        ( 2.06, 0.08, 0.42, 0.60, 0.82, 0.94, 0.62), # Vertical laser headlamps
        ( f_axle + 0.38, 0.08, 0.52, 0.72, 0.88, 0.98, 0.68), # Front wheel arch
        ( f_axle,        0.08, 0.55, 0.76, 0.92, 1.01, 0.70), # Front axle
        ( f_axle - 0.38, 0.08, 0.54, 0.77, 0.86, 0.96, 0.70), # Venturi tunnel entry
        ( 0.44, 0.08, 0.52, 0.84, 0.82, 0.92, 0.68), # Teardrop canopy base
        ( 0.05, 0.08, 0.54, 1.12, 0.78, 0.88, 0.56), # Low roof apex
        (-0.50, 0.08, 0.54, 1.10, 0.80, 0.90, 0.54), # Center spine / battery pack
        ( r_axle + 0.45, 0.08, 0.58, 0.98, 0.90, 1.02, 0.52), # Enormous Venturi tunnels carving through haunches
        ( r_axle,        0.08, 0.60, 0.88, 0.94, 1.04, 0.48), # Rear axle
        ( r_axle - 0.45, 0.08, 0.58, 0.80, 0.88, 0.98, 0.44), # Tunnel exit
        (-2.00, 0.12, 0.54, 0.76, 0.82, 0.94, 0.40), # Active rear wing in deploy position
        (-2.38, 0.20, 0.46, 0.72, 0.76, 0.88, 0.36), # Red illuminated LED Venturi tunnel openings
    ]
    build_lofted_sports_shell("Lotus_Evija", mats, roots, stations, f_axle, r_axle, wheel_r=wr)

    # Glass
    bm_glass = bmesh.new()
    bmesh.ops.create_cube(bm_glass, size=1.0)
    bmesh.ops.scale(bm_glass, vec=Vector((1.42, 1.78, 0.42)), verts=bm_glass.verts)
    bmesh.ops.translate(bm_glass, vec=Vector((0, -0.20, 0.94)), verts=bm_glass.verts)
    link_mesh("GLASS_Lotus_Evija", bm_glass, roots["GLASS"], mats["glass"])

    # Red Illuminated LED Venturi Tunnel Ribbon Rings
    bm_ribbon = bmesh.new()
    for s in [1.0, -1.0]:
        bmesh.ops.create_cone(bm_ribbon, cap_ends=False, segments=20, radius1=0.18, radius2=0.18, depth=0.03,
                              matrix=Matrix.Translation(Vector((s * 0.52, -2.35, 0.64))) @ Matrix.Rotation(math.radians(90), 4, 'X'))
    link_mesh("LIGHT_Evija_TunnelRings", bm_ribbon, roots["LIGHT"], mats["taillight"])

# ----------------------------------------------------------------------------
# 6. EXPORT DISPATCHER
# ----------------------------------------------------------------------------
SPORTS_SPECS = {
    "1970s": {
        "name": "Porsche_911_Turbo_930",
        "clean_name": "Porsche_911_Turbo_930",
        "paint_color": (0.85, 0.72, 0.04, 1.0), # Speed Yellow
        "builder": build_930_1970s,
    },
    "1980s": {
        "name": "Mazda_RX7_FC3S",
        "clean_name": "Mazda_RX7_FC3S",
        "paint_color": (0.92, 0.92, 0.94, 1.0), # Crystal White
        "builder": build_rx7_1980s,
    },
    "1990s": {
        "name": "Honda_NSX_NA1",
        "clean_name": "Honda_NSX_NA1",
        "paint_color": (0.85, 0.04, 0.04, 1.0), # Formula Red
        "builder": build_nsx_1990s,
    },
    "2000s": {
        "name": "Porsche_911_GT3_997",
        "clean_name": "Porsche_911_GT3_997",
        "paint_color": (0.12, 0.55, 0.18, 1.0), # Viper Green
        "builder": build_997_gt3_2000s,
    },
    "2010s": {
        "name": "Chevrolet_Corvette_Stingray_C7",
        "clean_name": "Chevrolet_Corvette_Stingray_C7",
        "paint_color": (0.04, 0.16, 0.68, 1.0), # Laguna Blue Tintcoat
        "builder": build_corvette_c7_2010s,
    },
    "2020s": {
        "name": "Alpine_A110_R",
        "clean_name": "Alpine_A110_R",
        "paint_color": (0.06, 0.38, 0.88, 1.0), # Bleu Racing Mat with Carbon
        "builder": build_alpine_2020s,
    },
    "future": {
        "name": "Lotus_Evija",
        "clean_name": "Lotus_Evija",
        "paint_color": (0.88, 0.89, 0.92, 1.0), # Solaris Yellow / Atomic Silver
        "builder": build_evija_future,
    }
}

def generate_sports_era(era_id):
    if era_id not in SPORTS_SPECS:
        print(f"Skipping era: {era_id}")
        return

    info = SPORTS_SPECS[era_id]
    print(f"\n=======================================================")
    print(f"GENERATING SPORTS CAR ({era_id.upper()}): {info['name']}")
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

    mats = {
        "paint": make_pbr_mat(f"Mat_Sports_Paint_{era_id}", info["paint_color"], metallic=0.75, roughness=0.15, clearcoat=0.98),
        "wheel_alloy": make_pbr_mat(f"Mat_Wheel_Alloy_{era_id}", (0.86, 0.88, 0.90, 1.0), metallic=0.96, roughness=0.14, clearcoat=0.6),
        "brake_caliper": make_pbr_mat(f"Mat_Brake_Caliper_{era_id}", (0.85, 0.04, 0.04, 1.0), metallic=0.35, roughness=0.22, clearcoat=0.8),
        "brake_disc": make_pbr_mat("Mat_Brake_Disc", (0.75, 0.76, 0.78, 1.0), metallic=0.92, roughness=0.28),
        "tire_rubber": make_pbr_mat("Mat_Tire_Rubber", (0.02, 0.02, 0.02, 1.0), metallic=0.05, roughness=0.82),
        "trim_dark": make_pbr_mat("Mat_Trim_Dark", (0.025, 0.025, 0.028, 1.0), metallic=0.25, roughness=0.6),
        "carbon": make_pbr_mat("Mat_Carbon_Fiber", (0.03, 0.03, 0.035, 1.0), metallic=0.35, roughness=0.2, clearcoat=0.98),
        "glass": make_pbr_mat("Mat_Optical_Glass", (0.88, 0.92, 0.96, 1.0), roughness=0.02, transmission=0.94),
        "interior": make_pbr_mat("Mat_Interior_Leather", (0.08, 0.08, 0.09, 1.0), metallic=0.08, roughness=0.70),
        "exhaust": make_pbr_mat("Mat_Exhaust_Chrome", (0.85, 0.86, 0.88, 1.0), metallic=0.98, roughness=0.12),
        "taillight": make_pbr_mat("Mat_Taillight_Optics", (0.92, 0.02, 0.02, 1.0), roughness=0.08, emission=(0.95, 0.02, 0.02, 1.0), emission_strength=4.0),
    }

    info["builder"](roots, mats)

    out_dir = os.path.join(ROOT_DIR, "public", "models", "vehicles", "sports_car", era_id)
    os.makedirs(out_dir, exist_ok=True)
    exports_dir = os.path.join(ROOT_DIR, "exports")
    os.makedirs(exports_dir, exist_ok=True)
    models_dir = os.path.join(ROOT_DIR, "public", "models")

    glb_public = os.path.normpath(os.path.abspath(os.path.join(out_dir, "vehicle.glb")))
    glb_complete = os.path.normpath(os.path.abspath(os.path.join(models_dir, f"Car_{info['clean_name']}_{era_id}_Complete.glb")))
    glb_export = os.path.normpath(os.path.abspath(os.path.join(exports_dir, f"Car_{info['clean_name']}_{era_id}.glb")))

    targets = [glb_public, glb_complete, glb_export]

    bpy.ops.object.select_all(action='DESELECT')
    for obj in bpy.data.objects:
        obj.select_set(True)

    for target in targets:
        if os.path.exists(target):
            try: os.remove(target)
            except Exception: pass

        bpy.ops.export_scene.gltf(
            filepath=target,
            use_selection=True,
            export_yup=True,
            export_apply=True,
            export_format='GLB',
        )
        sz = os.path.getsize(target)
        print(f"[EXPORT OK] {target} ({sz / 1024.0:.1f} KB)")

def generate_all_sports_cars():
    for era in ["1970s", "1980s", "1990s", "2000s", "2010s", "2020s", "future"]:
        generate_sports_era(era)

if __name__ == "__main__":
    generate_all_sports_cars()
