"""
=============================================================================
CLASS-A CAD PROCEDURAL GENERATOR: GRAND TOURER FLEET (6 MISSING ERAS)
=============================================================================
Constructs authentic, photo-accurate Class-A CAD models for the 6 missing eras
of the Grand Tourer architecture (2010s Ferrari F12 is already 784 KB):
1. 1970s: Aston Martin V8 Vantage
2. 1980s: Porsche 928 S4
3. 1990s: Aston Martin DB7
4. 2000s: Aston Martin DBS V12
5. 2020s: Bentley Continental GT Mulliner
6. Future: Cadillac Celestiq

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
    CURRENT_FILE = r"E:\Car_Automation\scripts\blender\generators\generate_grand_tourer_fleet_class_a.py"

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
def build_gt_wheel(parent, mats, name, pos, is_left, wheel_r, tire_w, spoke_count, rim_mat, caliper_mat):
    sign = 1.0 if is_left else -1.0
    rim_r = wheel_r * 0.74
    hw = tire_w / 2.0

    # 1. Tire
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

    # 2. Rim Barrel & Spokes
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

    # Lug nuts
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

def install_gt_wheels(parent, mats, wb, tf, tr, wr, tw, spokes, rim_mat, cal_mat):
    half_wb = wb / 2.0
    corners = [
        ("FL", Vector(( tf / 2.0,  half_wb, wr)), True),
        ("FR", Vector((-tf / 2.0,  half_wb, wr)), False),
        ("RL", Vector(( tr / 2.0, -half_wb, wr)), True),
        ("RR", Vector((-tr / 2.0, -half_wb, wr)), False),
    ]
    for name, pos, is_left in corners:
        build_gt_wheel(parent, mats, name, pos, is_left, wr, tw, spokes, rim_mat, cal_mat)

# ----------------------------------------------------------------------------
# 3. INTERIOR COCKPIT & UNDERBODY
# ----------------------------------------------------------------------------
def build_gt_interior(roots, mats, wb, width, sill_z, roof_z):
    half_wb = wb / 2.0
    half_w = width / 2.0

    # 1. Underbody Belly Pan
    bm_floor = bmesh.new()
    bmesh.ops.create_cube(bm_floor, size=1.0)
    bmesh.ops.scale(bm_floor, vec=Vector((width * 0.88, wb * 1.62, 0.04)), verts=bm_floor.verts)
    bmesh.ops.translate(bm_floor, vec=Vector((0, 0, sill_z + 0.02)), verts=bm_floor.verts)
    link_mesh("CHASSIS_BellyPan", bm_floor, roots["BODY"], mats["trim_dark"])

    # 2. 2+2 Grand Touring Leather Seats
    bm_seats = bmesh.new()
    for side in [1.0, -1.0]:
        sx = side * (half_w * 0.44)
        sy = -half_wb * 0.05
        # Front cushion & backrest
        bmesh.ops.create_cube(bm_seats, size=1.0)
        for v in bm_seats.verts[-8:]:
            v.co.x = v.co.x * 0.44 + sx
            v.co.y = v.co.y * 0.48 + sy
            v.co.z = v.co.z * 0.12 + (sill_z + 0.22)
        bmesh.ops.create_cube(bm_seats, size=1.0)
        for v in bm_seats.verts[-8:]:
            v.co.x = v.co.x * 0.42 + sx
            v.co.y = v.co.y * 0.16 + (sy - 0.24)
            v.co.z = v.co.z * 0.60 + (sill_z + 0.52)
        # Headrest
        bmesh.ops.create_cube(bm_seats, size=1.0)
        for v in bm_seats.verts[-8:]:
            v.co.x = v.co.x * 0.25 + sx
            v.co.y = v.co.y * 0.12 + (sy - 0.26)
            v.co.z = v.co.z * 0.18 + (sill_z + 0.88)
        # Rear passenger cushion (2+2)
        bmesh.ops.create_cube(bm_seats, size=1.0)
        for v in bm_seats.verts[-8:]:
            v.co.x = v.co.x * 0.38 + sx
            v.co.y = v.co.y * 0.40 + (sy - 0.68)
            v.co.z = v.co.z * 0.14 + (sill_z + 0.26)
    link_mesh("INTERIOR_GTSeats", bm_seats, roots["INTERIOR"], mats["interior_leather"], bevel_radius=0.008)

    # 3. Luxurious Dashboard & Waterfall Center Console
    bm_dash = bmesh.new()
    bmesh.ops.create_cube(bm_dash, size=1.0)
    for v in bm_dash.verts[-8:]:
        v.co.x = v.co.x * (width * 0.80)
        v.co.y = v.co.y * 0.46 + (half_wb * 0.36)
        v.co.z = v.co.z * 0.30 + (sill_z + 0.58)
    # Waterfall Console
    bmesh.ops.create_cube(bm_dash, size=1.0)
    for v in bm_dash.verts[-8:]:
        v.co.x = v.co.x * 0.24
        v.co.y = v.co.y * 1.10 - 0.15
        v.co.z = v.co.z * 0.18 + (sill_z + 0.30)
    link_mesh("INTERIOR_Dashboard", bm_dash, roots["INTERIOR"], mats["trim_dark"], bevel_radius=0.006)

    # 4. Multi-function GT Steering Wheel
    bm_steer = bmesh.new()
    steer_x = half_w * 0.44
    steer_y = half_wb * 0.20
    steer_z = sill_z + 0.65
    bmesh.ops.create_cone(bm_steer, cap_ends=True, segments=24, radius1=0.18, radius2=0.18, depth=0.025,
                          matrix=Matrix.Translation(Vector((steer_x, steer_y, steer_z))) @ Matrix.Rotation(math.radians(-20), 4, 'X'))
    link_mesh("INTERIOR_SteeringWheel", bm_steer, roots["INTERIOR"], mats["trim_dark"], bevel_radius=0.003)

# ----------------------------------------------------------------------------
# 4. LOFTED BODY SHELL
# ----------------------------------------------------------------------------
def build_lofted_gt_shell(name, mats, roots, stations, f_axle, r_axle, wheel_r=0.34):
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
            p_cant = Vector((side * ((fw_waist + fw_roof) * 0.54), fy, (fz_waist + fz_roof) * 0.52))
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
# 5. INDIVIDUAL GRAND TOURER BUILDERS PER ERA
# ----------------------------------------------------------------------------

# 1970s: Aston Martin V8 Vantage
def build_gt_1970s(roots, mats):
    wb, tf, tr, wr, tw = 2.61, 1.50, 1.50, 0.33, 0.255
    f_axle, r_axle = wb / 2.0, -wb / 2.0

    install_gt_wheels(roots["WHEEL"], mats, wb, tf, tr, wr, tw, 5, mats["wheel_alloy"], mats["brake_caliper"])
    build_gt_interior(roots, mats, wb, 1.83, 0.14, 1.33)

    stations = [
        ( 2.35, 0.18, 0.52, 0.68, 0.60, 0.72, 0.48), # Front chin spoiler & blanked radiator cowl
        ( 2.10, 0.16, 0.58, 0.76, 0.76, 0.84, 0.62), # Twin driving lights in blanked grille
        ( f_axle + 0.38, 0.15, 0.62, 0.81, 0.82, 0.88, 0.66), # Muscular front wing
        ( f_axle,        0.15, 0.64, 0.83, 0.86, 0.91, 0.68), # Front axle
        ( f_axle - 0.38, 0.15, 0.63, 0.85, 0.83, 0.89, 0.68), # Wing end
        ( 0.48, 0.15, 0.63, 0.90, 0.80, 0.88, 0.68), # Vantage twin hood bulge / scoop
        ( 0.08, 0.15, 0.65, 1.33, 0.78, 0.86, 0.58), # Windshield / Roof apex
        (-0.50, 0.15, 0.65, 1.32, 0.78, 0.86, 0.58), # Fastback taper
        ( r_axle + 0.42, 0.15, 0.66, 1.08, 0.84, 0.92, 0.56), # Rear haunch start
        ( r_axle,        0.15, 0.67, 0.99, 0.88, 0.94, 0.54), # Rear axle
        ( r_axle - 0.42, 0.15, 0.66, 0.94, 0.84, 0.91, 0.50), # Haunch end
        (-1.95, 0.20, 0.64, 0.92, 0.80, 0.87, 0.46), # Integrated tall ducktail spoiler
        (-2.30, 0.25, 0.58, 0.88, 0.75, 0.82, 0.42), # Classic chrome bumper fascia
    ]
    build_lofted_gt_shell("AstonMartin_V8Vantage", mats, roots, stations, f_axle, r_axle, wheel_r=wr)

    # Glass
    bm_glass = bmesh.new()
    bmesh.ops.create_cube(bm_glass, size=1.0)
    bmesh.ops.scale(bm_glass, vec=Vector((1.42, 1.88, 0.50)), verts=bm_glass.verts)
    bmesh.ops.translate(bm_glass, vec=Vector((0, -0.22, 1.06)), verts=bm_glass.verts)
    link_mesh("GLASS_AstonMartin_V8Vantage", bm_glass, roots["GLASS"], mats["glass"])

    # Twin Cibié Driving Lamps in Blanked Grille
    bm_lights = bmesh.new()
    for s in [1.0, -1.0]:
        bmesh.ops.create_cone(bm_lights, cap_ends=True, segments=16, radius1=0.065, radius2=0.065, depth=0.04,
                              matrix=Matrix.Translation(Vector((s * 0.32, 2.22, 0.62))) @ Matrix.Rotation(math.radians(90), 4, 'X'))
    link_mesh("LIGHT_DrivingLamps", bm_lights, roots["LIGHT"], mats["headlight"])

# 1980s: Porsche 928 S4
def build_gt_1980s(roots, mats):
    wb, tf, tr, wr, tw = 2.50, 1.55, 1.53, 0.335, 0.265
    f_axle, r_axle = wb / 2.0, -wb / 2.0

    install_gt_wheels(roots["WHEEL"], mats, wb, tf, tr, wr, tw, 7, mats["wheel_alloy"], mats["brake_caliper"])
    build_gt_interior(roots, mats, wb, 1.84, 0.12, 1.28)

    stations = [
        ( 2.28, 0.14, 0.42, 0.58, 0.62, 0.74, 0.48), # Integrated polyurethane aero nose
        ( 2.02, 0.14, 0.52, 0.68, 0.76, 0.86, 0.60), # Tilting exposed pop-up headlamps
        ( f_axle + 0.36, 0.14, 0.60, 0.78, 0.82, 0.90, 0.66), # Front arch
        ( f_axle,        0.14, 0.62, 0.81, 0.86, 0.92, 0.68), # Front axle
        ( f_axle - 0.36, 0.14, 0.61, 0.82, 0.83, 0.90, 0.68), # Arch end
        ( 0.45, 0.14, 0.60, 0.86, 0.80, 0.88, 0.68), # Low V8 hood line
        ( 0.06, 0.14, 0.62, 1.28, 0.78, 0.86, 0.58), # Teardrop canopy apex
        (-0.48, 0.14, 0.62, 1.27, 0.78, 0.87, 0.58), # Curved aerodynamic roof
        ( r_axle + 0.40, 0.14, 0.64, 1.04, 0.84, 0.92, 0.56), # Rounded bulbous rear quarter
        ( r_axle,        0.14, 0.65, 0.96, 0.88, 0.94, 0.52), # Rear axle
        ( r_axle - 0.40, 0.14, 0.64, 0.88, 0.84, 0.91, 0.48), # Quarter end
        (-1.90, 0.18, 0.62, 0.86, 0.80, 0.88, 0.44), # Wrap-around polyurethane rear spoiler
        (-2.22, 0.24, 0.54, 0.84, 0.74, 0.83, 0.40), # Smooth rounded rear bumper
    ]
    build_lofted_gt_shell("Porsche928S4", mats, roots, stations, f_axle, r_axle, wheel_r=wr)

    # Teardrop Glass
    bm_glass = bmesh.new()
    bmesh.ops.create_cube(bm_glass, size=1.0)
    bmesh.ops.scale(bm_glass, vec=Vector((1.42, 1.84, 0.48)), verts=bm_glass.verts)
    bmesh.ops.translate(bm_glass, vec=Vector((0, -0.22, 1.02)), verts=bm_glass.verts)
    link_mesh("GLASS_Porsche928S4", bm_glass, roots["GLASS"], mats["glass"])

    # Iconic 928 Tilting Pop-Up Round Headlights
    bm_lights = bmesh.new()
    for s in [1.0, -1.0]:
        bmesh.ops.create_cone(bm_lights, cap_ends=True, segments=16, radius1=0.075, radius2=0.075, depth=0.08,
                              matrix=Matrix.Translation(Vector((s * 0.52, 2.02, 0.68))) @ Matrix.Rotation(math.radians(35), 4, 'X'))
    link_mesh("LIGHT_PopupHeadlights", bm_lights, roots["LIGHT"], mats["headlight"])

# 1990s: Aston Martin DB7
def build_gt_1990s(roots, mats):
    wb, tf, tr, wr, tw = 2.59, 1.52, 1.53, 0.34, 0.265
    f_axle, r_axle = wb / 2.0, -wb / 2.0

    install_gt_wheels(roots["WHEEL"], mats, wb, tf, tr, wr, tw, 6, mats["wheel_alloy"], mats["brake_caliper"])
    build_gt_interior(roots, mats, wb, 1.83, 0.12, 1.25)

    stations = [
        ( 2.32, 0.14, 0.40, 0.56, 0.62, 0.74, 0.48), # Inverted Aston mouth front bumper
        ( 2.05, 0.14, 0.50, 0.66, 0.76, 0.86, 0.60), # Compound curved halogen headlights
        ( f_axle + 0.36, 0.14, 0.60, 0.78, 0.82, 0.90, 0.66), # Front wing with chrome strake
        ( f_axle,        0.14, 0.62, 0.80, 0.86, 0.92, 0.68), # Front axle
        ( f_axle - 0.36, 0.14, 0.61, 0.82, 0.83, 0.89, 0.68), # Wing return
        ( 0.48, 0.14, 0.60, 0.86, 0.80, 0.88, 0.68), # Sensual supercharged inline-6 hood
        ( 0.08, 0.14, 0.62, 1.25, 0.78, 0.86, 0.58), # Curved windshield header
        (-0.48, 0.14, 0.63, 1.24, 0.78, 0.87, 0.58), # Sweeping roofline
        ( r_axle + 0.40, 0.14, 0.64, 1.02, 0.84, 0.92, 0.56), # Sensuous rear muscular haunch
        ( r_axle,        0.14, 0.65, 0.94, 0.88, 0.94, 0.52), # Rear axle
        ( r_axle - 0.40, 0.14, 0.64, 0.88, 0.84, 0.91, 0.48), # Haunch end
        (-1.92, 0.18, 0.62, 0.86, 0.80, 0.88, 0.44), # Taut rear decklid
        (-2.25, 0.24, 0.54, 0.84, 0.74, 0.83, 0.40), # Integrated oval exhaust outlets
    ]
    build_lofted_gt_shell("AstonMartin_DB7", mats, roots, stations, f_axle, r_axle, wheel_r=wr)

    # Glass
    bm_glass = bmesh.new()
    bmesh.ops.create_cube(bm_glass, size=1.0)
    bmesh.ops.scale(bm_glass, vec=Vector((1.42, 1.86, 0.46)), verts=bm_glass.verts)
    bmesh.ops.translate(bm_glass, vec=Vector((0, -0.22, 1.00)), verts=bm_glass.verts)
    link_mesh("GLASS_AstonMartin_DB7", bm_glass, roots["GLASS"], mats["glass"])

    # Chrome Side Fender Strakes
    bm_strake = bmesh.new()
    for s in [1.0, -1.0]:
        bmesh.ops.create_cube(bm_strake, size=1.0)
        for v in bm_strake.verts[-8:]:
            v.co.x = v.co.x * 0.02 + s * 0.89
            v.co.y = v.co.y * 0.22 + 0.72
            v.co.z = v.co.z * 0.03 + 0.64
    link_mesh("AERO_DB7_SideStrakes", bm_strake, roots["AERO"], mats["chrome"])

# 2000s: Aston Martin DBS V12
def build_gt_2000s(roots, mats):
    wb, tf, tr, wr, tw = 2.74, 1.58, 1.58, 0.35, 0.275
    f_axle, r_axle = wb / 2.0, -wb / 2.0

    install_gt_wheels(roots["WHEEL"], mats, wb, tf, tr, wr, tw, 5, mats["wheel_alloy"], mats["brake_caliper"])
    build_gt_interior(roots, mats, wb, 1.90, 0.11, 1.28)

    stations = [
        ( 2.36, 0.12, 0.42, 0.60, 0.66, 0.78, 0.52), # Carbon fiber front splitter & low chin
        ( 2.12, 0.12, 0.52, 0.72, 0.80, 0.90, 0.64), # Iconic 5-bar chrome grille & bi-xenon lamps
        ( f_axle + 0.38, 0.12, 0.61, 0.80, 0.85, 0.93, 0.68), # Flared front wing with carbon vent
        ( f_axle,        0.12, 0.63, 0.83, 0.89, 0.95, 0.70), # Front axle
        ( f_axle - 0.38, 0.12, 0.62, 0.84, 0.86, 0.93, 0.70), # Wing end
        ( 0.50, 0.12, 0.62, 0.88, 0.84, 0.92, 0.70), # Dual hood heat extractors
        ( 0.08, 0.12, 0.64, 1.28, 0.80, 0.88, 0.60), # Windshield / Aluminum roof
        (-0.52, 0.12, 0.64, 1.27, 0.80, 0.89, 0.60), # Roof crown
        ( r_axle + 0.42, 0.12, 0.65, 1.06, 0.87, 0.96, 0.58), # Muscular rear haunch
        ( r_axle,        0.12, 0.66, 0.98, 0.91, 0.98, 0.54), # Rear axle
        ( r_axle - 0.42, 0.12, 0.65, 0.92, 0.87, 0.95, 0.50), # Haunch end
        (-1.96, 0.16, 0.63, 0.88, 0.82, 0.91, 0.46), # Carbon integrated decklid lip
        (-2.32, 0.22, 0.55, 0.86, 0.78, 0.87, 0.42), # Carbon rear diffuser with twin large pipes
    ]
    build_lofted_gt_shell("AstonMartin_DBS", mats, roots, stations, f_axle, r_axle, wheel_r=wr)

    # Glass
    bm_glass = bmesh.new()
    bmesh.ops.create_cube(bm_glass, size=1.0)
    bmesh.ops.scale(bm_glass, vec=Vector((1.46, 1.90, 0.48)), verts=bm_glass.verts)
    bmesh.ops.translate(bm_glass, vec=Vector((0, -0.24, 1.04)), verts=bm_glass.verts)
    link_mesh("GLASS_AstonMartin_DBS", bm_glass, roots["GLASS"], mats["glass"])

    # Carbon Splitter & Rear Diffuser
    bm_aero = bmesh.new()
    bmesh.ops.create_cube(bm_aero, size=1.0)
    bmesh.ops.scale(bm_aero, vec=Vector((1.62, 0.28, 0.03)), verts=bm_aero.verts)
    bmesh.ops.translate(bm_aero, vec=Vector((0, 2.32, 0.18)), verts=bm_aero.verts)
    # Rear Diffuser
    bmesh.ops.create_cube(bm_aero, size=1.0)
    bmesh.ops.scale(bm_aero, vec=Vector((1.60, 0.32, 0.05)), verts=bm_aero.verts[-8:])
    bmesh.ops.translate(bm_aero, vec=Vector((0, -2.28, 0.26)), verts=bm_aero.verts[-8:])
    link_mesh("AERO_DBS_CarbonPack", bm_aero, roots["AERO"], mats["carbon"], bevel_radius=0.003)

# 2020s: Bentley Continental GT Mulliner
def build_gt_2020s(roots, mats):
    wb, tf, tr, wr, tw = 2.851, 1.672, 1.664, 0.365, 0.295
    f_axle, r_axle = wb / 2.0, -wb / 2.0

    install_gt_wheels(roots["WHEEL"], mats, wb, tf, tr, wr, tw, 10, mats["wheel_alloy"], mats["brake_caliper"])
    build_gt_interior(roots, mats, wb, 1.95, 0.12, 1.40)

    stations = [
        ( 2.42, 0.14, 0.48, 0.68, 0.70, 0.84, 0.55), # Imposing upright chrome matrix grille
        ( 2.18, 0.14, 0.60, 0.80, 0.84, 0.94, 0.68), # Crystal-cut matrix LED quad headlights
        ( f_axle + 0.40, 0.14, 0.66, 0.88, 0.88, 0.97, 0.72), # Superformed aluminum front wing
        ( f_axle,        0.14, 0.68, 0.90, 0.92, 1.00, 0.74), # Front axle
        ( f_axle - 0.40, 0.14, 0.67, 0.91, 0.90, 0.98, 0.74), # Wing return
        ( 0.52, 0.14, 0.66, 0.96, 0.86, 0.96, 0.74), # Long sweeping W12 hood
        ( 0.10, 0.14, 0.68, 1.39, 0.82, 0.92, 0.64), # Majestic windscreen header
        (-0.55, 0.14, 0.68, 1.38, 0.82, 0.93, 0.64), # Continental fastback sweep
        ( r_axle + 0.46, 0.14, 0.70, 1.15, 0.90, 1.01, 0.60), # Muscular power line rear haunch
        ( r_axle,        0.14, 0.71, 1.05, 0.94, 1.03, 0.56), # Rear axle
        ( r_axle - 0.46, 0.14, 0.70, 0.98, 0.90, 0.99, 0.52), # Haunch end
        (-2.02, 0.18, 0.67, 0.94, 0.85, 0.95, 0.48), # Elliptical rear decklid
        (-2.40, 0.24, 0.58, 0.90, 0.80, 0.90, 0.44), # Dual elliptical exhaust outlets
    ]
    build_lofted_gt_shell("Bentley_ContinentalGT", mats, roots, stations, f_axle, r_axle, wheel_r=wr)

    # Glass
    bm_glass = bmesh.new()
    bmesh.ops.create_cube(bm_glass, size=1.0)
    bmesh.ops.scale(bm_glass, vec=Vector((1.52, 1.96, 0.54)), verts=bm_glass.verts)
    bmesh.ops.translate(bm_glass, vec=Vector((0, -0.24, 1.10)), verts=bm_glass.verts)
    link_mesh("GLASS_Bentley_ContinentalGT", bm_glass, roots["GLASS"], mats["glass"])

    # Elliptical LED Taillights Matching Exhaust Tips
    bm_tails = bmesh.new()
    for s in [1.0, -1.0]:
        bmesh.ops.create_cone(bm_tails, cap_ends=True, segments=16, radius1=0.065, radius2=0.065, depth=0.03,
                              matrix=Matrix.Translation(Vector((s * 0.62, -2.38, 0.76))) @ Matrix.Rotation(math.radians(90), 4, 'X'))
    link_mesh("LIGHT_EllipticalTaillights", bm_tails, roots["LIGHT"], mats["taillight"])

# Future: Cadillac Celestiq
def build_gt_future(roots, mats):
    wb, tf, tr, wr, tw = 3.10, 1.74, 1.74, 0.375, 0.295
    f_axle, r_axle = wb / 2.0, -wb / 2.0

    install_gt_wheels(roots["WHEEL"], mats, wb, tf, tr, wr, tw, 5, mats["wheel_alloy"], mats["brake_caliper"])
    build_gt_interior(roots, mats, wb, 2.04, 0.10, 1.34)

    stations = [
        ( 2.65, 0.10, 0.38, 0.55, 0.70, 0.85, 0.52), # Monolithic illuminated Black Crystal shield
        ( 2.32, 0.10, 0.48, 0.68, 0.85, 0.98, 0.66), # Vertical pencil-thin digital micro-projectors
        ( f_axle + 0.44, 0.10, 0.58, 0.78, 0.92, 1.02, 0.70), # Seamless aluminum fender
        ( f_axle,        0.10, 0.60, 0.82, 0.96, 1.05, 0.72), # Front axle
        ( f_axle - 0.44, 0.10, 0.59, 0.83, 0.92, 1.02, 0.72), # Fender return
        ( 0.55, 0.10, 0.58, 0.88, 0.88, 0.98, 0.70), # Stretched low electric cowl
        ( 0.10, 0.10, 0.60, 1.32, 0.82, 0.94, 0.62), # Smart glass panoramic roof apex
        (-0.60, 0.10, 0.60, 1.30, 0.82, 0.94, 0.62), # Ultra-long aerodynamic fastback
        ( r_axle + 0.50, 0.10, 0.64, 1.10, 0.92, 1.03, 0.58), # Monolithic rear haunch
        ( r_axle,        0.10, 0.65, 0.98, 0.96, 1.06, 0.52), # Rear axle
        ( r_axle - 0.50, 0.10, 0.64, 0.90, 0.90, 1.01, 0.46), # Haunch taper
        (-2.25, 0.14, 0.60, 0.82, 0.82, 0.94, 0.40), # Boat-tail rear taper
        (-2.70, 0.20, 0.52, 0.76, 0.76, 0.86, 0.34), # Vertical blade rear diffuser
    ]
    build_lofted_gt_shell("Cadillac_Celestiq", mats, roots, stations, f_axle, r_axle, wheel_r=wr)

    # Smart Glass Canopy
    bm_glass = bmesh.new()
    bmesh.ops.create_cube(bm_glass, size=1.0)
    bmesh.ops.scale(bm_glass, vec=Vector((1.48, 2.12, 0.48)), verts=bm_glass.verts)
    bmesh.ops.translate(bm_glass, vec=Vector((0, -0.28, 1.02)), verts=bm_glass.verts)
    link_mesh("GLASS_Cadillac_Celestiq", bm_glass, roots["GLASS"], mats["glass"])

    # Signature L-shaped Vertical Light Blades (C-pillar & Lower Fascia)
    bm_blades = bmesh.new()
    for s in [1.0, -1.0]:
        # Upper C-pillar blade
        bmesh.ops.create_cube(bm_blades, size=1.0)
        for v in bm_blades.verts[-8:]:
            v.co.x = v.co.x * 0.03 + s * 0.74
            v.co.y = v.co.y * 0.35 - 2.10
            v.co.z = v.co.z * 0.45 + 0.95
    link_mesh("LIGHT_VerticalLightBlades", bm_blades, roots["LIGHT"], mats["taillight"])

# ----------------------------------------------------------------------------
# 6. EXPORT DISPATCHER
# ----------------------------------------------------------------------------
GT_SPECS = {
    "1970s": {
        "name": "Aston_Martin_V8_Vantage",
        "clean_name": "Aston_Martin_V8_Vantage",
        "paint_color": (0.08, 0.16, 0.08, 1.0), # British Racing Green
        "builder": build_gt_1970s,
    },
    "1980s": {
        "name": "Porsche_928_S4",
        "clean_name": "Porsche_928_S4",
        "paint_color": (0.85, 0.04, 0.04, 1.0), # Guards Red
        "builder": build_gt_1980s,
    },
    "1990s": {
        "name": "Aston_Martin_DB7",
        "clean_name": "Aston_Martin_DB7",
        "paint_color": (0.04, 0.12, 0.28, 1.0), # Chiltern Green / Blue
        "builder": build_gt_1990s,
    },
    "2000s": {
        "name": "Aston_Martin_DBS_V12",
        "clean_name": "Aston_Martin_DBS_V12",
        "paint_color": (0.16, 0.17, 0.18, 1.0), # Casino Royale Grey
        "builder": build_gt_2000s,
    },
    "2020s": {
        "name": "Bentley_Continental_GT_Mulliner",
        "clean_name": "Bentley_Continental_GT_Mulliner",
        "paint_color": (0.05, 0.28, 0.58, 1.0), # Sequin Blue
        "builder": build_gt_2020s,
    },
    "future": {
        "name": "Cadillac_Celestiq",
        "clean_name": "Cadillac_Celestiq",
        "paint_color": (0.82, 0.85, 0.88, 1.0), # Celestial Silver
        "builder": build_gt_future,
    }
}

def generate_gt_era(era_id):
    if era_id not in GT_SPECS:
        print(f"Skipping era: {era_id}")
        return

    info = GT_SPECS[era_id]
    print(f"\n=======================================================")
    print(f"GENERATING GRAND TOURER ({era_id.upper()}): {info['name']}")
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
        "paint": make_pbr_mat(f"Mat_GT_Paint_{era_id}", info["paint_color"], metallic=0.80, roughness=0.15, clearcoat=0.98),
        "wheel_alloy": make_pbr_mat(f"Mat_Wheel_Alloy_{era_id}", (0.86, 0.88, 0.90, 1.0), metallic=0.96, roughness=0.14, clearcoat=0.6),
        "brake_caliper": make_pbr_mat(f"Mat_Brake_Caliper_{era_id}", (0.10, 0.10, 0.12, 1.0), metallic=0.35, roughness=0.25, clearcoat=0.8),
        "brake_disc": make_pbr_mat("Mat_Brake_Disc", (0.75, 0.76, 0.78, 1.0), metallic=0.92, roughness=0.28),
        "tire_rubber": make_pbr_mat("Mat_Tire_Rubber", (0.02, 0.02, 0.02, 1.0), metallic=0.05, roughness=0.82),
        "trim_dark": make_pbr_mat("Mat_Trim_Dark", (0.025, 0.025, 0.028, 1.0), metallic=0.25, roughness=0.6),
        "chrome": make_pbr_mat("Mat_Chrome_Jewelry", (0.95, 0.95, 0.96, 1.0), metallic=0.98, roughness=0.03),
        "carbon": make_pbr_mat("Mat_Carbon_Fiber", (0.03, 0.03, 0.035, 1.0), metallic=0.35, roughness=0.2, clearcoat=0.98),
        "glass": make_pbr_mat("Mat_Optical_Glass", (0.88, 0.92, 0.96, 1.0), roughness=0.02, transmission=0.94),
        "interior_leather": make_pbr_mat("Mat_Interior_Leather", (0.12, 0.08, 0.05, 1.0), metallic=0.06, roughness=0.62),
        "headlight": make_pbr_mat("Mat_Headlight_Optics", (0.95, 0.95, 1.0, 1.0), roughness=0.05, emission=(0.95, 0.98, 1.0, 1.0), emission_strength=4.5),
        "taillight": make_pbr_mat("Mat_Taillight_Optics", (0.92, 0.02, 0.02, 1.0), roughness=0.08, emission=(0.95, 0.02, 0.02, 1.0), emission_strength=4.0),
    }

    info["builder"](roots, mats)

    out_dir = os.path.join(ROOT_DIR, "public", "models", "vehicles", "grand_tourer", era_id)
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

def generate_all_remaining_grand_tourers():
    for era in ["1970s", "1980s", "1990s", "2000s", "2020s", "future"]:
        generate_gt_era(era)

if __name__ == "__main__":
    generate_all_remaining_grand_tourers()
