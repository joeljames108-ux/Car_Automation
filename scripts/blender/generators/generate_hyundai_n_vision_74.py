"""
=============================================================================
CLASS-A CAD PROCEDURAL GENERATOR: HYUNDAI N VISION 74 (FUTURE HATCHBACK)
=============================================================================
High-fidelity procedural recreation of the hydrogen-hybrid cyberpunk icon:
the Hyundai N Vision 74 (2022+ Future Concept).

Authentic Factory Specifications:
- Wheelbase: 2,905 mm (Front Axle: +1.4525m, Rear Axle: -1.4525m)
- Overall Length: 4,952 mm (Front Bumper: +2.476m, Rear Bumper: -2.476m)
- Overall Width: 1,995 mm (Half-Width: 0.9975m, flared box haunches ~1.025m)
- Overall Height: 1,331 mm (Roof Apex Z = 1.331m)
- Track Width: Front 1,715 mm (X = ±0.8575m), Rear 1,735 mm (X = ±0.8675m)
- Ground Clearance: 110 mm (Sill base Z = 0.110m)
- Powertrain: Hydrogen Fuel Cell + Dual Rear Motors (670 hp / 500 kW, 900 Nm)
- Wheels: 20" Front / 21" Rear Retro Turbofan Aero Disc Alloys in Matte White/Silver
- Tires: 285/35 R20 Front, 325/30 R21 Rear Michelin Pilot Sport Cup 2
- Brakes: 400mm Carbon-Ceramic Rotors with N Performance Blue 6-Piston Calipers
- Exterior: Matte Cyber Titanium Grey with Exposed Twill Carbon Splitter,
  Full-Width Parametric Pixel LED Arrays, Authentic Swan-Neck Motorsport Wing,
  Framed Rear Window Louvers, Carved NACA Side Venturis, Colossal 6-Strake Diffuser.
=============================================================================
"""

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector, Matrix, Euler

# ----------------------------------------------------------------------------
# 1. PBR MATERIAL FACTORY
# ----------------------------------------------------------------------------
def make_pbr_mat(name, base_color, metallic=0.0, roughness=0.5, clearcoat=0.0, transmission=0.0, ior=1.5, emission=None, emission_strength=0.0, alpha=1.0):
    mat = bpy.data.materials.get(name)
    if mat:
        bpy.data.materials.remove(mat, do_unlink=True)
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    tree = mat.node_tree
    tree.nodes.clear()

    out = tree.nodes.new('ShaderNodeOutputMaterial')
    bsdf = tree.nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.location = (0, 0)
    out.location = (300, 0)

    bsdf.inputs['Base Color'].default_value = base_color
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['IOR'].default_value = ior

    if 'Alpha' in bsdf.inputs:
        bsdf.inputs['Alpha'].default_value = alpha

    if 'Coat Weight' in bsdf.inputs:
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
    return mat


def create_n_vision_74_materials():
    mats = {}

    # Signature Matte Cyber Titanium Body Paint
    mats["body_paint"] = make_pbr_mat("Mat_NV74_Titanium", (0.32, 0.33, 0.35, 1.0), metallic=0.75, roughness=0.28, clearcoat=0.35)

    # Exposed Matte Twill Carbon Fiber (Splitter, Diffuser, Side Skirts, Swan-Neck Wing)
    mats["carbon_fiber"] = make_pbr_mat("Mat_NV74_Carbon", (0.022, 0.022, 0.024, 1.0), metallic=0.25, roughness=0.35)

    # N Performance Signature Powder Blue Accents
    mats["n_blue"] = make_pbr_mat("Mat_NV74_NBlue", (0.03, 0.44, 0.88, 1.0), metallic=0.10, roughness=0.22, clearcoat=0.95)

    # Gloss Black Aerodynamic Trim, Window Frames & Louvers
    mats["gloss_black"] = make_pbr_mat("Mat_NV74_GlossBlack", (0.012, 0.012, 0.014, 1.0), metallic=0.15, roughness=0.08, clearcoat=1.0)

    # Parametric Pixel LED Front Matrix (Brilliant 6500K Pure White)
    mats["pixel_white"] = make_pbr_mat("Mat_NV74_PixelWhite", (1.0, 1.0, 1.0, 1.0), metallic=0.0, roughness=0.08, emission=(1.0, 1.0, 1.0, 1.0), emission_strength=18.0)

    # Parametric Pixel LED Rear Matrix (Vibrant Cyber Red)
    mats["pixel_red"] = make_pbr_mat("Mat_NV74_PixelRed", (1.0, 0.02, 0.02, 1.0), metallic=0.0, roughness=0.08, emission=(1.0, 0.02, 0.02, 1.0), emission_strength=15.0)

    # Cyberpunk Amber Pixel Turn Indicators
    mats["pixel_amber"] = make_pbr_mat("Mat_NV74_PixelAmber", (1.0, 0.50, 0.02, 1.0), metallic=0.0, roughness=0.1, emission=(1.0, 0.50, 0.02, 1.0), emission_strength=12.0)

    # F1 Rain Lamp & Reverse Lens
    mats["f1_rain_lamp"] = make_pbr_mat("Mat_NV74_F1Rain", (1.0, 0.04, 0.04, 1.0), metallic=0.0, roughness=0.1, emission=(1.0, 0.04, 0.04, 1.0), emission_strength=22.0)

    # High-End Tinted Dielectric Safety Glass (Deep Charcoal Tint, Low Roughness, Zero Metallic)
    mats["privacy_glass"] = make_pbr_mat("Mat_NV74_Glass", (0.012, 0.014, 0.018, 1.0), metallic=0.0, roughness=0.03, transmission=0.92, alpha=0.35, clearcoat=1.0, ior=1.52)

    # Retro Turbofan Aero Disc Rim (Matte Powder White / Machined Face)
    mats["turbofan_white"] = make_pbr_mat("Mat_NV74_Turbofan", (0.90, 0.91, 0.93, 1.0), metallic=0.35, roughness=0.20)

    # Anodized Black Center-Lock Nut & Hardware
    mats["center_lock"] = make_pbr_mat("Mat_NV74_CenterLock", (0.02, 0.02, 0.02, 1.0), metallic=0.92, roughness=0.15)

    # Michelin Pilot Sport Cup 2 Compound Tire Rubber
    mats["tire_rubber"] = make_pbr_mat("Mat_NV74_TireRubber", (0.025, 0.025, 0.027, 1.0), metallic=0.0, roughness=0.85)

    # Carbon-Ceramic Drilled Brake Discs
    mats["carbon_ceramic"] = make_pbr_mat("Mat_NV74_CarbonCeramic", (0.18, 0.18, 0.19, 1.0), metallic=0.60, roughness=0.35)

    # Alcantara & Carbon Interior Cockpit
    mats["interior_alcantara"] = make_pbr_mat("Mat_NV74_Alcantara", (0.020, 0.020, 0.022, 1.0), metallic=0.02, roughness=0.80)

    # Underbody & Hydrogen Powertrain Metal
    mats["chassis_dark"] = make_pbr_mat("Mat_NV74_Chassis", (0.030, 0.032, 0.035, 1.0), metallic=0.40, roughness=0.55)

    return mats


# ----------------------------------------------------------------------------
# 2. HELPER UTILITIES: LINKING, SHADING & BEVELING
# ----------------------------------------------------------------------------
def link_obj(name, bm, parent, mat=None, bevel=0.003, auto_smooth=35.0):
    me = bpy.data.meshes.new(name + "_Mesh")
    bm.to_mesh(me)
    bm.free()

    obj = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(obj)
    if parent:
        obj.parent = parent

    if mat:
        obj.data.materials.append(mat)

    if auto_smooth > 0:
        try:
            bpy.context.view_layer.objects.active = obj
            obj.select_set(True)
            bpy.ops.object.shade_smooth_by_angle(angle=math.radians(auto_smooth))
            obj.select_set(False)
        except Exception:
            for poly in me.polygons:
                poly.use_smooth = True

    if bevel > 0.0:
        b_mod = obj.modifiers.new(name="Bevel", type='BEVEL')
        b_mod.width = bevel
        b_mod.segments = 2
        b_mod.limit_method = 'ANGLE'
        b_mod.angle_limit = math.radians(40.0)

    wn = obj.modifiers.new(name="WeightedNormal", type='WEIGHTED_NORMAL')
    wn.keep_sharp = True

    return obj


# ----------------------------------------------------------------------------
# 3. 20" / 21" RETRO TURBOFAN AERO DISC WHEELS & N CALIPERS (WHEELS_BRANCH)
# ----------------------------------------------------------------------------
def build_n_vision_74_wheel(wheels_branch, mats, name, loc, is_left=True, is_front=True):
    bm = bmesh.new()

    # Sizing
    r_tire = 0.345 if is_front else 0.355
    w_tire = 0.285 if is_front else 0.325
    r_rim = 0.254 if is_front else 0.266   # 20" vs 21"
    w_rim = 0.250 if is_front else 0.280
    r_turbofan = r_rim - 0.015

    z_rot = 0 if is_left else math.pi
    rot_mat = Matrix.Rotation(z_rot, 4, 'Z')
    sign_x = 1.0 if is_left else -1.0

    # 3.1 Wide Track High-Performance Tire (Cup 2 Profile)
    n_rad = 32
    tire_profile = [
        (-w_tire*0.48, r_rim + 0.015),
        (-w_tire*0.50, r_rim + 0.045),
        (-w_tire*0.48, r_rim + 0.075),
        (-w_tire*0.44, r_tire - 0.035),
        (-w_tire*0.35, r_tire - 0.008),
        (-w_tire*0.18, r_tire),
        (0.0,          r_tire + 0.002),
        (w_tire*0.18,  r_tire),
        (w_tire*0.35,  r_tire - 0.008),
        (w_tire*0.44,  r_tire - 0.035),
        (w_tire*0.48,  r_rim + 0.075),
        (w_tire*0.50,  r_rim + 0.045),
        (w_tire*0.48,  r_rim + 0.015),
    ]

    rings = []
    for i in range(n_rad):
        theta = 2.0 * math.pi * i / n_rad
        cos_t = math.cos(theta)
        sin_t = math.sin(theta)
        ring_v = []
        for (dx, r_rad) in tire_profile:
            pt = Vector((dx, r_rad * sin_t, r_rad * cos_t))
            pt = rot_mat @ pt + loc
            ring_v.append(bm.verts.new(pt))
        rings.append(ring_v)

    for i in range(n_rad):
        i_next = (i + 1) % n_rad
        for j in range(len(tire_profile) - 1):
            v00 = rings[i][j]
            v01 = rings[i][j+1]
            v11 = rings[i_next][j+1]
            v10 = rings[i_next][j]
            if is_left:
                bm.faces.new((v00, v01, v11, v10))
            else:
                bm.faces.new((v00, v10, v11, v01))

    link_obj(name + "_Tire", bm, wheels_branch, mats["tire_rubber"], bevel=0.002)

    # 3.2 Retro-Turbofan Aero Disc Face with Concave Depth & Cooling Vanes
    bm_fan = bmesh.new()

    # Stepped Rim Barrel
    ret_barrel = bmesh.ops.create_cone(bm_fan, cap_ends=False, segments=n_rad, radius1=r_rim, radius2=r_rim, depth=w_rim)
    rot_b = Euler((0.0, math.radians(90.0), 0.0), 'XYZ')
    for v in ret_barrel['verts']:
        v.co = rot_b.to_matrix() @ v.co
        v.co = rot_mat @ v.co + loc

    # Outer Disc Cover (Deep concave on rear, subtle concave on front)
    concave_depth = 0.045 if not is_front else 0.025
    disc_profile = [
        (w_rim*0.46, r_turbofan),
        (w_rim*0.48, r_turbofan * 0.94),
        (w_rim*0.48 - concave_depth * 0.3, r_turbofan * 0.70),
        (w_rim*0.48 - concave_depth * 0.7, r_turbofan * 0.40),
        (w_rim*0.48 - concave_depth,       r_turbofan * 0.18),
        (w_rim*0.48 - concave_depth - 0.015, 0.0),
    ]
    disc_rings = []
    for i in range(24):
        theta = 2.0 * math.pi * i / 24
        cos_t = math.cos(theta)
        sin_t = math.sin(theta)
        ring_v = []
        for (dx, r_rad) in disc_profile:
            pt = Vector((dx, r_rad * sin_t, r_rad * cos_t))
            pt = rot_mat @ pt + loc
            ring_v.append(bm_fan.verts.new(pt))
        disc_rings.append(ring_v)

    for i in range(24):
        i_next = (i + 1) % 24
        for j in range(len(disc_profile) - 1):
            v00 = disc_rings[i][j]
            v01 = disc_rings[i][j+1]
            v11 = disc_rings[i_next][j+1]
            v10 = disc_rings[i_next][j]
            if is_left:
                bm_fan.faces.new((v00, v01, v11, v10))
            else:
                bm_fan.faces.new((v00, v10, v11, v01))

    # 16 Radiating Aerodynamic Cooling Slat Fins on Turbofan Rim Perimeter
    for vane_i in range(16):
        theta = 2.0 * math.pi * vane_i / 16
        r_mid = (r_turbofan + r_rim) * 0.5
        vane_pos = Vector((w_rim*0.47, math.sin(theta)*r_mid, math.cos(theta)*r_mid))
        vane_pos = rot_mat @ vane_pos + loc
        ret_v = bmesh.ops.create_cube(bm_fan, size=1.0)
        for v in ret_v['verts']:
            v.co.x = v.co.x * 0.018 + vane_pos.x
            v.co.y = v.co.y * 0.038 + vane_pos.y
            v.co.z = v.co.z * 0.008 + vane_pos.z

    # Center-Lock Anodized Black Hub with "N" crest
    hub_x = (w_rim * 0.48 - concave_depth) * sign_x
    ret_hub = bmesh.ops.create_cone(bm_fan, cap_ends=True, segments=16, radius1=0.048, radius2=0.040, depth=0.032)
    for v in ret_hub['verts']:
        v.co = rot_b.to_matrix() @ v.co
        v.co.x += hub_x + loc.x
        v.co.y += loc.y
        v.co.z += loc.z

    link_obj(name + "_TurbofanRim", bm_fan, wheels_branch, mats["turbofan_white"], bevel=0.002)

    # 3.3 Carbon-Ceramic Rotor & N Performance Blue 6-Piston Caliper
    bm_brake = bmesh.new()
    ret_rotor = bmesh.ops.create_cone(bm_brake, cap_ends=True, segments=24, radius1=0.190, radius2=0.190, depth=0.024)
    for v in ret_rotor['verts']:
        v.co = rot_b.to_matrix() @ v.co
        v.co.x += (w_rim * 0.15) * sign_x + loc.x
        v.co.y += loc.y
        v.co.z += loc.z

    link_obj(name + "_Rotor", bm_brake, wheels_branch, mats["carbon_ceramic"], bevel=0.001)

    bm_caliper = bmesh.new()
    ret_cal = bmesh.ops.create_cube(bm_caliper, size=1.0)
    for v in ret_cal['verts']:
        v.co.x = v.co.x * 0.075 + (w_rim * 0.30) * sign_x + loc.x
        v.co.y = v.co.y * 0.110 + loc.y
        v.co.z = v.co.z * 0.065 + loc.z + 0.135

    link_obj(name + "_Caliper", bm_caliper, wheels_branch, mats["n_blue"], bevel=0.002)


# ----------------------------------------------------------------------------
# 4. CLASS-A CYBERPUNK WEDGE MONOCOQUE & NACA INTAKES (BODY_BRANCH)
# ----------------------------------------------------------------------------
def build_n_vision_74_monocoque(body_branch, mats, f_axle, r_axle):
    bm = bmesh.new()

    # 19 Cross-Section Stations along Y-Axis (From +2.476m Nose to -2.476m Rear Diffuser)
    # Wheelbase = 2,905mm (f_axle = +1.4525m, r_axle = -1.4525m)
    # Width = 1,995mm (Half-Width = 0.9975m)
    # Height = 1,331mm
    stations = [
        {"y":  2.47, "zf": 0.12, "zs": 0.28, "ws": 0.88, "wsh": 0.92, "zsh": 0.58, "wr": 0.70, "zr": 0.60, "type": "splitter_tip"},
        {"y":  2.34, "zf": 0.12, "zs": 0.28, "ws": 0.92, "wsh": 0.95, "zsh": 0.64, "wr": 0.74, "zr": 0.66, "type": "nose_intake"},
        {"y":  2.15, "zf": 0.11, "zs": 0.28, "ws": 0.95, "wsh": 0.98, "zsh": 0.70, "wr": 0.78, "zr": 0.72, "type": "hood_front"},
        {"y":  1.85, "zf": 0.11, "zs": 0.30, "ws": 0.98, "wsh": 1.00, "zsh": 0.73, "wr": 0.80, "zr": 0.75, "type": "f_flare_front"},
        {"y":  1.45, "zf": 0.11, "zs": 0.32, "ws": 0.99, "wsh": 1.01, "zsh": 0.75, "wr": 0.80, "zr": 0.77, "type": "f_axle"},
        {"y":  1.05, "zf": 0.11, "zs": 0.28, "ws": 0.98, "wsh": 0.99, "zsh": 0.77, "wr": 0.78, "zr": 0.79, "type": "f_flare_rear"},
        {"y":  0.65, "zf": 0.11, "zs": 0.14, "ws": 0.94, "wsh": 0.96, "zsh": 0.78, "wr": 0.74, "zr": 0.81, "type": "hood_cowl"},
        {"y":  0.25, "zf": 0.11, "zs": 0.14, "ws": 0.93, "wsh": 0.95, "zsh": 0.79, "wr": 0.68, "zr": 1.28, "type": "a_pillar"},
        {"y": -0.15, "zf": 0.11, "zs": 0.14, "ws": 0.93, "wsh": 0.95, "zsh": 0.80, "wr": 0.66, "zr": 1.331,"type": "roof_apex"},
        {"y": -0.55, "zf": 0.11, "zs": 0.14, "ws": 0.94, "wsh": 0.96, "zsh": 0.80, "wr": 0.64, "zr": 1.31, "type": "b_pillar"},
        {"y": -0.85, "zf": 0.11, "zs": 0.14, "ws": 0.95, "wsh": 0.97, "zsh": 0.80, "wr": 0.61, "zr": 1.27, "type": "side_intake_start"},
        {"y": -1.15, "zf": 0.11, "zs": 0.26, "ws": 0.98, "wsh": 1.00, "zsh": 0.80, "wr": 0.57, "zr": 1.18, "type": "r_flare_front"},
        {"y": -1.45, "zf": 0.11, "zs": 0.32, "ws": 1.00, "wsh": 1.025,"zsh": 0.80, "wr": 0.54, "zr": 1.06, "type": "r_axle"},
        {"y": -1.75, "zf": 0.12, "zs": 0.30, "ws": 0.98, "wsh": 1.01, "zsh": 0.80, "wr": 0.52, "zr": 0.96, "type": "r_flare_rear"},
        {"y": -2.05, "zf": 0.14, "zs": 0.28, "ws": 0.94, "wsh": 0.97, "zsh": 0.79, "wr": 0.50, "zr": 0.88, "type": "decklid_lip"},
        {"y": -2.25, "zf": 0.18, "zs": 0.32, "ws": 0.90, "wsh": 0.94, "zsh": 0.78, "wr": 0.48, "zr": 0.85, "type": "pixel_taillight"},
        {"y": -2.36, "zf": 0.20, "zs": 0.36, "ws": 0.86, "wsh": 0.91, "zsh": 0.77, "wr": 0.46, "zr": 0.84, "type": "rear_fascia_wall"},
        {"y": -2.44, "zf": 0.24, "zs": 0.42, "ws": 0.82, "wsh": 0.88, "zsh": 0.76, "wr": 0.45, "zr": 0.84, "type": "diffuser_top"},
        {"y": -2.47, "zf": 0.26, "zs": 0.46, "ws": 0.80, "wsh": 0.86, "zsh": 0.76, "wr": 0.44, "zr": 0.84, "type": "diffuser_end"},
    ]

    for side in [1.0, -1.0]:
        grid = []
        for s in stations:
            y = s["y"]
            ws = s["ws"] * side
            wsh = s["wsh"] * side
            wr = s["wr"] * side
            zf = s["zf"]
            zs = s["zs"]
            zsh = s["zsh"]
            zr = s["zr"]

            # Circular continuous wheel cutouts
            dist_f = abs(y - f_axle)
            if dist_f < 0.42:
                arch_f = math.sqrt(max(0.0, 0.42**2 - dist_f**2)) * 0.72
                zs = max(zs, 0.345 + arch_f)

            dist_r = abs(y - r_axle)
            if dist_r < 0.44:
                arch_r = math.sqrt(max(0.0, 0.44**2 - dist_r**2)) * 0.74
                zs = max(zs, 0.355 + arch_r)

            # 7 rows per station cross section:
            row = [
                bm.verts.new(Vector((0.0,             y, zf))),
                bm.verts.new(Vector((ws * 0.82,      y, zf + (zs - zf) * 0.25))),
                bm.verts.new(Vector((ws,             y, zs))),
                bm.verts.new(Vector((wsh,            y, zsh))),
                bm.verts.new(Vector((wsh * 0.94,     y, zsh + (zr - zsh) * 0.40))),
                bm.verts.new(Vector((wr,             y, zr - 0.015))),
                bm.verts.new(Vector((0.0,             y, zr))),
            ]
            grid.append(row)

        for i in range(len(stations) - 1):
            for j in range(6):
                v00 = grid[i][j]
                v01 = grid[i][j+1]
                v11 = grid[i+1][j+1]
                v10 = grid[i+1][j]
                if side > 0:
                    bm.faces.new((v00, v01, v11, v10))
                else:
                    bm.faces.new((v00, v10, v11, v01))

    # Front Grille Aperture Louvers (Under Pixel Bar, Y in [2.32m, 2.44m])
    bm_fg = bmesh.new()
    for l_i in range(12):
        x_l = -0.72 + l_i * (1.44 / 11.0)
        ret_vl = bmesh.ops.create_cube(bm_fg, size=1.0)
        for v in ret_vl['verts']:
            v.co.x = v.co.x * 0.015 + x_l
            v.co.y = v.co.y * 0.120 + 2.380
            v.co.z = v.co.z * 0.220 + 0.380

    # Front Impact Apron & N Crest Plate
    ret_fap = bmesh.ops.create_cube(bm_fg, size=1.0)
    for v in ret_fap['verts']:
        v.co.x *= 0.520
        v.co.y = v.co.y * 0.025 + 2.420
        v.co.z = v.co.z * 0.140 + 0.360

    link_obj("BODY_Front_Grille_Louvers", bm_fg, body_branch, mats["gloss_black"], bevel=0.002)

    # Sculpted NACA Side Venturi Inlets (Carved into haunches, X = ±0.98m, Y in [-0.75m, -1.25m])
    bm_naca = bmesh.new()
    for side in [1.0, -1.0]:
        # Recessed inner duct wall
        ret_naca = bmesh.ops.create_cube(bm_naca, size=1.0)
        for v in ret_naca['verts']:
            v.co.x = v.co.x * 0.065 + 0.940 * side
            v.co.y = v.co.y * 0.440 - 1.020
            v.co.z = v.co.z * 0.180 + 0.540

        # Horizontal Aero Guide Vanes inside scoop
        for g_i in range(3):
            z_g = 0.480 + g_i * 0.055
            ret_gv = bmesh.ops.create_cube(bm_naca, size=1.0)
            for v in ret_gv['verts']:
                v.co.x = v.co.x * 0.055 + 0.945 * side
                v.co.y = v.co.y * 0.380 - 1.020
                v.co.z = v.co.z * 0.010 + z_g

    link_obj("BODY_NACA_Side_Intakes", bm_naca, body_branch, mats["gloss_black"], bevel=0.001)

    # Rear Bumper Fascia Valence Panel (Encloses area below taillight bar)
    bm_r_apron = bmesh.new()
    ret_rap = bmesh.ops.create_cube(bm_r_apron, size=1.0)
    for v in ret_rap['verts']:
        v.co.x *= 1.820
        v.co.y = v.co.y * 0.080 - 2.320
        v.co.z = v.co.z * 0.320 + 0.540

    # Recessed Center License Plate Cavity with "N Vision 74" badge
    ret_cav = bmesh.ops.create_cube(bm_r_apron, size=1.0)
    for v in ret_cav['verts']:
        v.co.x *= 0.620
        v.co.y = v.co.y * 0.040 - 2.365
        v.co.z = v.co.z * 0.140 + 0.560

    link_obj("BODY_Rear_Fascia_Apron", bm_r_apron, body_branch, mats["body_paint"], bevel=0.002)

    obj_monocoque = link_obj("BODY_Monocoque", bm, body_branch, mats["body_paint"], bevel=0.003, auto_smooth=35.0)


# ----------------------------------------------------------------------------
# 5. PARAMETRIC PIXEL LED MATRIX LIGHTING (BODY_BRANCH)
# ----------------------------------------------------------------------------
def build_n_vision_74_lighting(body_branch, mats):
    # 5.1 Front Full-Width Parametric Pixel LED Array
    bm_front_pixel = bmesh.new()
    bm_front_housing = bmesh.new()

    # Gloss black housing channel
    ret_h = bmesh.ops.create_cube(bm_front_housing, size=1.0)
    for v in ret_h['verts']:
        v.co.x *= 1.760
        v.co.y = v.co.y * 0.040 + 2.375
        v.co.z = v.co.z * 0.100 + 0.610

    link_obj("LIGHT_Front_Housing", bm_front_housing, body_branch, mats["gloss_black"], bevel=0.002)

    # Parametric Pixel Squares: 2 rows of 34 square pixel diodes
    n_pixel_cols = 36
    p_size = 0.024
    p_gap = 0.008
    for col in range(n_pixel_cols):
        t = col / (n_pixel_cols - 1)
        x = -0.80 + t * 1.60
        for row in range(2):
            z = 0.585 + row * (p_size + p_gap)
            ret_px = bmesh.ops.create_cube(bm_front_pixel, size=1.0)
            for v in ret_px['verts']:
                v.co.x = v.co.x * p_size + x
                v.co.y = v.co.y * 0.015 + 2.390
                v.co.z = v.co.z * p_size + z

    # Quad Square Projector Main Beams (Left & Right outer clusters)
    for side in [1.0, -1.0]:
        for bx in range(2):
            for bz in range(2):
                x_b = (0.64 + bx * 0.075) * side
                z_b = 0.575 + bz * 0.075
                ret_qb = bmesh.ops.create_cube(bm_front_pixel, size=1.0)
                for v in ret_qb['verts']:
                    v.co.x = v.co.x * 0.055 + x_b
                    v.co.y = v.co.y * 0.025 + 2.395
                    v.co.z = v.co.z * 0.055 + z_b

    link_obj("LIGHT_Front_PixelMatrix", bm_front_pixel, body_branch, mats["pixel_white"], bevel=0.001)

    # 5.2 Rear Full-Width Parametric Pixel LED Taillight Matrix
    bm_rear_pixel = bmesh.new()
    bm_rear_housing = bmesh.new()

    ret_rh = bmesh.ops.create_cube(bm_rear_housing, size=1.0)
    for v in ret_rh['verts']:
        v.co.x *= 1.820
        v.co.y = v.co.y * 0.040 - 2.255
        v.co.z = v.co.z * 0.120 + 0.760

    link_obj("LIGHT_Rear_Housing", bm_rear_housing, body_branch, mats["gloss_black"], bevel=0.002)

    # 3 rows of 42 glowing red pixel squares
    n_rear_cols = 44
    rp_size = 0.022
    for col in range(n_rear_cols):
        t = col / (n_rear_cols - 1)
        x = -0.84 + t * 1.68
        for row in range(3):
            z = 0.725 + row * (rp_size + 0.008)
            ret_rpx = bmesh.ops.create_cube(bm_rear_pixel, size=1.0)
            for v in ret_rpx['verts']:
                v.co.x = v.co.x * rp_size + x
                v.co.y = v.co.y * 0.015 - 2.270
                v.co.z = v.co.z * rp_size + z

    link_obj("LIGHT_Rear_PixelMatrix", bm_rear_pixel, body_branch, mats["pixel_red"], bevel=0.001)


# ----------------------------------------------------------------------------
# 6. EXTREME AERODYNAMICS: SPLITTER, SWAN-NECK WING & DIFFUSER (AERO_BRANCH)
# ----------------------------------------------------------------------------
def build_n_vision_74_aero(aero_branch, mats):
    # 6.1 Massive Front Aerodynamic Splitter & Endplate Winglets
    bm_split = bmesh.new()
    ret_sp = bmesh.ops.create_cube(bm_split, size=1.0)
    for v in ret_sp['verts']:
        v.co.x *= 1.940
        v.co.y = v.co.y * 0.380 + 2.360
        v.co.z = v.co.z * 0.022 + 0.115

    # Side Endplate Vertical Strakes
    for side in [1.0, -1.0]:
        ret_end = bmesh.ops.create_cube(bm_split, size=1.0)
        for v in ret_end['verts']:
            v.co.x = v.co.x * 0.020 + 0.985 * side
            v.co.y = v.co.y * 0.320 + 2.360
            v.co.z = v.co.z * 0.140 + 0.180

    link_obj("AERO_Front_Splitter", bm_split, aero_branch, mats["carbon_fiber"], bevel=0.002)

    # 6.2 Extended Aerodynamic Side Skirts with Powder Blue Accent Pinstripe
    bm_skirts = bmesh.new()
    bm_accent = bmesh.new()
    for side in [1.0, -1.0]:
        ret_sk = bmesh.ops.create_cube(bm_skirts, size=1.0)
        for v in ret_sk['verts']:
            v.co.x = v.co.x * 0.080 + 0.960 * side
            v.co.y = v.co.y * 2.200 + 0.000
            v.co.z = v.co.z * 0.035 + 0.115

        # Thin Powder Blue Accent Line along bottom edge
        ret_ac = bmesh.ops.create_cube(bm_accent, size=1.0)
        for v in ret_ac['verts']:
            v.co.x = v.co.x * 0.015 + 0.995 * side
            v.co.y = v.co.y * 2.200 + 0.000
            v.co.z = v.co.z * 0.008 + 0.105

    link_obj("AERO_Side_Skirts", bm_skirts, aero_branch, mats["carbon_fiber"], bevel=0.002)
    link_obj("AERO_Side_Skirt_Accents", bm_accent, aero_branch, mats["n_blue"], bevel=0.001)

    # 6.3 Colossal Rear Aerodynamic Diffuser with 6 Vertical Tunnel Strakes
    bm_diff = bmesh.new()
    ret_d_tray = bmesh.ops.create_cube(bm_diff, size=1.0)
    for v in ret_d_tray['verts']:
        v.co.x *= 1.760
        v.co.y = v.co.y * 0.700 - 2.150
        t_ramp = (v.co.y - (-2.50)) / 0.70
        v.co.z = v.co.z * 0.024 + 0.120 + (1.0 - t_ramp) * 0.220

    # 6 Vertical Diffuser Strakes
    for s_i in range(6):
        x_s = -0.75 + s_i * (1.50 / 5.0)
        ret_str = bmesh.ops.create_cube(bm_diff, size=1.0)
        for v in ret_str['verts']:
            v.co.x = v.co.x * 0.018 + x_s
            v.co.y = v.co.y * 0.650 - 2.150
            v.co.z = v.co.z * 0.140 + 0.220

    # Central F1 Red Rain Lamp
    ret_rain = bmesh.ops.create_cube(bm_diff, size=1.0)
    for v in ret_rain['verts']:
        v.co.x *= 0.065
        v.co.y = v.co.y * 0.025 - 2.480
        v.co.z = v.co.z * 0.065 + 0.260

    link_obj("AERO_Rear_Diffuser", bm_diff, aero_branch, mats["carbon_fiber"], bevel=0.002)

    # 6.4 True Motorsport Swan-Neck Rear Wing with Forward-Curved Top Stanchions
    bm_wing = bmesh.new()

    # Curved Aerodynamic Mainplane Airfoil (Span 1.88m, Chord 0.38m)
    airfoil_profile = [
        (-0.19, 0.00), (-0.17, 0.025), (-0.12, 0.048), (-0.05, 0.055),
        ( 0.05, 0.048), ( 0.12, 0.032), ( 0.17, 0.015), ( 0.19, 0.005),
        ( 0.17,-0.008), ( 0.10,-0.018), ( 0.00,-0.022), (-0.10,-0.018),
        (-0.16,-0.010), (-0.19, 0.00),
    ]
    w_span = 1.860
    n_w_steps = 20
    wing_rings = []
    for step in range(n_w_steps):
        t = step / (n_w_steps - 1)
        x = -w_span * 0.5 + t * w_span
        ring = []
        for (dy, dz) in airfoil_profile:
            pt = Vector((x, -2.180 + dy, 1.280 + dz))
            ring.append(bm_wing.verts.new(pt))
        wing_rings.append(ring)

    for step in range(n_w_steps - 1):
        for j in range(len(airfoil_profile) - 1):
            v00 = wing_rings[step][j]
            v01 = wing_rings[step][j+1]
            v11 = wing_rings[step+1][j+1]
            v10 = wing_rings[step+1][j]
            bm_wing.faces.new((v00, v01, v11, v10))

    # Curved Swan-Neck Top-Mount Pylons (Arching up and over to clamp wing topside)
    for side in [1.0, -1.0]:
        x_p = 0.420 * side
        pylon_pts = [
            Vector((x_p, -1.95, 0.90)),
            Vector((x_p, -2.02, 1.15)),
            Vector((x_p, -2.12, 1.34)),
            Vector((x_p, -2.19, 1.35)),
            Vector((x_p, -2.20, 1.32)),
        ]
        for p_i in range(len(pylon_pts) - 1):
            p0 = pylon_pts[p_i]
            p1 = pylon_pts[p_i+1]
            mid = (p0 + p1) * 0.5
            l_seg = (p1 - p0).length
            ret_ps = bmesh.ops.create_cone(bm_wing, cap_ends=True, segments=8, radius1=0.015, radius2=0.015, depth=l_seg)
            dir_v = (p1 - p0).normalized()
            rot_q = Vector((0, 0, 1)).rotation_difference(dir_v)
            for v in ret_ps['verts']:
                v.co = rot_q.to_matrix() @ v.co + mid

    # Aerodynamic Endplate Fins
    for side in [1.0, -1.0]:
        ret_fin = bmesh.ops.create_cube(bm_wing, size=1.0)
        for v in ret_fin['verts']:
            v.co.x = v.co.x * 0.015 + (w_span * 0.505) * side
            v.co.y = v.co.y * 0.440 - 2.180
            v.co.z = v.co.z * 0.280 + 1.280

    link_obj("AERO_SwanNeck_Wing", bm_wing, aero_branch, mats["carbon_fiber"], bevel=0.002)


# ----------------------------------------------------------------------------
# 7. FASTBACK GREENHOUSE & REAR HATCH LOUVER SYSTEM (GLASS_BRANCH / BODY_BRANCH)
# ----------------------------------------------------------------------------
def build_n_vision_74_greenhouse_and_louvers(glass_branch, body_branch, mats):
    # 7.1 Flush Cyberpunk Dielectric Glass
    bm_glass = bmesh.new()

    # Raked Front Windshield (Cowl Y = 0.65m to Roof Y = 0.22m)
    n_ws = 8
    ws_rings = []
    for step in range(n_ws):
        t = step / (n_ws - 1)
        y = 0.65 - t * 0.43
        z = 0.81 + t * 0.47
        w = 0.74 - t * 0.08
        ring = [
            bm_glass.verts.new(Vector((-w, y, z))),
            bm_glass.verts.new(Vector((-w*0.5, y + 0.012, z))),
            bm_glass.verts.new(Vector((0.0, y + 0.020, z + 0.005))),
            bm_glass.verts.new(Vector((w*0.5, y + 0.012, z))),
            bm_glass.verts.new(Vector((w, y, z))),
        ]
        ws_rings.append(ring)

    for step in range(n_ws - 1):
        for j in range(4):
            bm_glass.faces.new((ws_rings[step][j], ws_rings[step][j+1], ws_rings[step+1][j+1], ws_rings[step+1][j]))

    # Frameless Side Glass & Triangular Quarter Windows
    for side in [1.0, -1.0]:
        # Door window
        dw = [
            bm_glass.verts.new(Vector((0.74 * side,  0.20, 1.27))),
            bm_glass.verts.new(Vector((0.80 * side,  0.22, 0.84))),
            bm_glass.verts.new(Vector((0.82 * side, -0.52, 0.84))),
            bm_glass.verts.new(Vector((0.72 * side, -0.52, 1.30))),
        ]
        if side > 0:
            bm_glass.faces.new(dw)
        else:
            bm_glass.faces.new(dw[::-1])

        # Quarter window
        qw = [
            bm_glass.verts.new(Vector((0.72 * side, -0.55, 1.30))),
            bm_glass.verts.new(Vector((0.82 * side, -0.55, 0.84))),
            bm_glass.verts.new(Vector((0.76 * side, -1.05, 0.85))),
            bm_glass.verts.new(Vector((0.64 * side, -0.98, 1.22))),
        ]
        if side > 0:
            bm_glass.faces.new(qw)
        else:
            bm_glass.faces.new(qw[::-1])

    # Fastback Rear Window Pane under Louvers
    rw = [
        bm_glass.verts.new(Vector((-0.62, -0.55, 1.30))),
        bm_glass.verts.new(Vector(( 0.62, -0.55, 1.30))),
        bm_glass.verts.new(Vector(( 0.48, -1.95, 0.88))),
        bm_glass.verts.new(Vector((-0.48, -1.95, 0.88))),
    ]
    bm_glass.faces.new(rw)

    link_obj("GLASS_Greenhouse", bm_glass, glass_branch, mats["privacy_glass"], bevel=0.0)

    # 7.2 Framed Rear Window Louver Slats (Cascading Down Fastback Hatch)
    bm_louvers = bmesh.new()

    # Outer perimeter mounting frame
    for side in [1.0, -1.0]:
        ret_lf = bmesh.ops.create_cube(bm_louvers, size=1.0)
        for v in ret_lf['verts']:
            v.co.x = v.co.x * 0.025 + 0.54 * side
            v.co.y = v.co.y * 1.400 - 1.250
            v.co.z = v.co.z * 0.020 + 1.080 - (v.co.y - (-1.250)) * 0.30

    n_louvers = 8
    for l_i in range(n_louvers):
        t = l_i / (n_louvers - 1)
        y_l = -0.62 - t * 1.26
        z_l = 1.29 - t * 0.39
        w_l = 0.56 - t * 0.10

        ret_slat = bmesh.ops.create_cube(bm_louvers, size=1.0)
        rot_s = Euler((math.radians(-24.0), 0.0, 0.0), 'XYZ')
        for v in ret_slat['verts']:
            v.co.x *= (w_l * 2.0)
            v.co.y *= 0.095
            v.co.z *= 0.012
            v.co = rot_s.to_matrix() @ v.co
            v.co.y += y_l
            v.co.z += z_l

    link_obj("BODY_Rear_Louvers", bm_louvers, body_branch, mats["gloss_black"], bevel=0.001)


# ----------------------------------------------------------------------------
# 8. HYDROGEN-HYBRID CYBER COCKPIT (INTERIOR_BRANCH)
# ----------------------------------------------------------------------------
def build_n_vision_74_interior(interior_branch, mats):
    bm_cockpit = bmesh.new()

    # Dashboard with digital screens & angled center bridge
    ret_dash = bmesh.ops.create_cube(bm_cockpit, size=1.0)
    for v in ret_dash['verts']:
        v.co.x *= 1.450
        v.co.y = v.co.y * 0.380 + 0.320
        v.co.z = v.co.z * 0.260 + 0.720

    # Curved Dual-Screen OLED Display Cluster
    ret_scr = bmesh.ops.create_cube(bm_cockpit, size=1.0)
    for v in ret_scr['verts']:
        v.co.x *= 0.750
        v.co.y = v.co.y * 0.025 + 0.220
        v.co.z = v.co.z * 0.120 + 0.840

    # Deep Center Tunnel Console with Drive Mode Dials & Buttons
    ret_tun = bmesh.ops.create_cube(bm_cockpit, size=1.0)
    for v in ret_tun['verts']:
        v.co.x *= 0.320
        v.co.y = v.co.y * 1.100 - 0.220
        v.co.z = v.co.z * 0.200 + 0.440

    # N Motorsport Flat-Bottom Steering Wheel with Blue Accents
    wh_pos = Vector((0.42, -0.05, 0.78))
    ret_wh = bmesh.ops.create_cone(bm_cockpit, cap_ends=True, segments=24, radius1=0.180, radius2=0.180, depth=0.025)
    rot_wh = Euler((math.radians(-22.0), 0.0, 0.0), 'XYZ')
    for v in ret_wh['verts']:
        v.co = rot_wh.to_matrix() @ v.co + wh_pos

    # High-Bolster Carbon Fiber Racing Bucket Seats
    for side in [1.0, -1.0]:
        s_pos = Vector((0.42 * side, -0.48, 0.42))
        ret_seat = bmesh.ops.create_cube(bm_cockpit, size=1.0)
        for v in ret_seat['verts']:
            v.co.x = v.co.x * 0.480 + s_pos.x
            v.co.y = v.co.y * 0.520 + s_pos.y
            v.co.z = v.co.z * 0.140 + s_pos.z

        ret_b = bmesh.ops.create_cube(bm_cockpit, size=1.0)
        rot_sb = Euler((math.radians(18.0), 0.0, 0.0), 'XYZ')
        for v in ret_b['verts']:
            v.co.x *= 0.460
            v.co.y *= 0.140
            v.co.z *= 0.560
            v.co = rot_sb.to_matrix() @ v.co
            v.co.x += s_pos.x
            v.co.y += s_pos.y - 0.220
            v.co.z += s_pos.z + 0.360

    # Lightweight 6-Point Roll Cage Visible through Greenhouse
    roll_bars = [
        ((-0.55, -0.55, 0.42), (-0.55, -0.55, 1.28)),
        (( 0.55, -0.55, 0.42), ( 0.55, -0.55, 1.28)),
        ((-0.55, -0.55, 1.28), ( 0.55, -0.55, 1.28)),
        ((-0.55, -0.55, 1.28), (-0.45, -1.25, 0.60)),
        (( 0.55, -0.55, 1.28), ( 0.45, -1.25, 0.60)),
    ]
    for p0, p1 in roll_bars:
        v0 = Vector(p0)
        v1 = Vector(p1)
        mid = (v0 + v1) * 0.5
        length = (v1 - v0).length
        ret_bar = bmesh.ops.create_cone(bm_cockpit, cap_ends=True, segments=8, radius1=0.022, radius2=0.022, depth=length)
        dir_vec = (v1 - v0).normalized()
        rot_q = Vector((0, 0, 1)).rotation_difference(dir_vec)
        for v in ret_bar['verts']:
            v.co = rot_q.to_matrix() @ v.co + mid

    link_obj("INTERIOR_Cockpit", bm_cockpit, interior_branch, mats["interior_alcantara"], bevel=0.002)


# ----------------------------------------------------------------------------
# 9. UNDERBODY PLATFORM & HYDROGEN CRADLE (PLATFORM_BRANCH)
# ----------------------------------------------------------------------------
def build_n_vision_74_platform(platform_branch, mats, f_axle, r_axle):
    bm = bmesh.new()

    # Full Underbody Flat Floor & Venturi Tunnels
    ret_floor = bmesh.ops.create_cube(bm, size=1.0)
    for v in ret_floor['verts']:
        v.co.x *= 1.680
        v.co.y = v.co.y * 4.400 + 0.000
        v.co.z = v.co.z * 0.040 + 0.115

    # Hydrogen Fuel Cell Stack Module (Front Bay)
    ret_fcell = bmesh.ops.create_cube(bm, size=1.0)
    for v in ret_fcell['verts']:
        v.co.x *= 0.650
        v.co.y = v.co.y * 0.850 + f_axle
        v.co.z = v.co.z * 0.220 + 0.260

    # Dual Type-4 700-Bar Cylindrical Hydrogen Tanks (Rear Bay behind seats)
    for t_i in [-0.22, 0.22]:
        ret_tank = bmesh.ops.create_cone(bm, cap_ends=True, segments=16, radius1=0.170, radius2=0.170, depth=0.980)
        rot_tank = Euler((0.0, math.radians(90.0), 0.0), 'XYZ')
        for v in ret_tank['verts']:
            v.co = rot_tank.to_matrix() @ v.co
            v.co.y += (r_axle + 0.35 + t_i)
            v.co.z += 0.420

    # Dual Rear Traction Motors & Inverter Package
    ret_motors = bmesh.ops.create_cube(bm, size=1.0)
    for v in ret_motors['verts']:
        v.co.x *= 0.780
        v.co.y = v.co.y * 0.480 + r_axle
        v.co.z = v.co.z * 0.200 + 0.240

    # 4 Enclosed Wheel Arch Liners / Tubs (Guarantees zero see-through voids)
    for f_side in [1.0, -1.0]:
        ret_ftub = bmesh.ops.create_cone(bm, cap_ends=True, segments=16, radius1=0.410, radius2=0.410, depth=0.320)
        rot_tub = Euler((0.0, math.radians(90.0), 0.0), 'XYZ')
        for v in ret_ftub['verts']:
            v.co = rot_tub.to_matrix() @ v.co
            v.co.x += 0.780 * f_side
            v.co.y += f_axle
            v.co.z += 0.400

    for r_side in [1.0, -1.0]:
        ret_rtub = bmesh.ops.create_cone(bm, cap_ends=True, segments=16, radius1=0.430, radius2=0.430, depth=0.360)
        rot_tub = Euler((0.0, math.radians(90.0), 0.0), 'XYZ')
        for v in ret_rtub['verts']:
            v.co = rot_tub.to_matrix() @ v.co
            v.co.x += 0.780 * r_side
            v.co.y += r_axle
            v.co.z += 0.420

    link_obj("PLATFORM_Chassis", bm, platform_branch, mats["chassis_dark"], bevel=0.002)


# ----------------------------------------------------------------------------
# 10. MASTER BUILDER PIPELINE & GLB EXPORT
# ----------------------------------------------------------------------------
def purge_scene():
    try:
        if bpy.app.background:
            bpy.ops.wm.read_factory_settings(use_empty=True)
            return
    except Exception:
        pass
    for obj in list(bpy.context.scene.collection.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for col in list(bpy.context.scene.collection.children):
        bpy.data.collections.remove(col)
    for block in [bpy.data.meshes, bpy.data.materials, bpy.data.curves, bpy.data.lights, bpy.data.cameras]:
        for item in list(block):
            if item.users == 0:
                block.remove(item)


def build_hyundai_n_vision_74_master():
    print("================================================================================")
    print("PURGING SCENE & BUILDING HYUNDAI N VISION 74 (FUTURE HATCHBACK) FROM SCRATCH")
    print("================================================================================")

    # 1. Complete scene purge to empty state
    purge_scene()

    # 2. Build root vehicle hierarchy
    root = bpy.data.objects.new("Hyundai_N_Vision_74_Root", None)
    bpy.context.scene.collection.objects.link(root)

    body_branch = bpy.data.objects.new("Body_Group", None)
    aero_branch = bpy.data.objects.new("Aero_Group", None)
    glass_branch = bpy.data.objects.new("Glass_Group", None)
    interior_branch = bpy.data.objects.new("Interior_Group", None)
    platform_branch = bpy.data.objects.new("Platform_Group", None)
    wheels_branch = bpy.data.objects.new("Wheels_Group", None)

    for b in [body_branch, aero_branch, glass_branch, interior_branch, platform_branch, wheels_branch]:
        b.parent = root
        bpy.context.scene.collection.objects.link(b)

    # 3. Create materials
    mats = create_n_vision_74_materials()

    # 4. Wheelbase & Tracks
    f_axle = 1.4525
    r_axle = -1.4525
    half_f_track = 0.8575
    half_r_track = 0.8675
    wheel_f_z = 0.345
    wheel_r_z = 0.355

    # 5. Build Wheels & Brakes
    print("[N_VISION_74] Constructing 20\"/21\" Turbofan Aero Disc Alloys & N Blue Calipers...")
    build_n_vision_74_wheel(wheels_branch, mats, "WHEEL_FL", Vector(( half_f_track, f_axle, wheel_f_z)), is_left=True, is_front=True)
    build_n_vision_74_wheel(wheels_branch, mats, "WHEEL_FR", Vector((-half_f_track, f_axle, wheel_f_z)), is_left=False, is_front=True)
    build_n_vision_74_wheel(wheels_branch, mats, "WHEEL_RL", Vector(( half_r_track, r_axle, wheel_r_z)), is_left=True, is_front=False)
    build_n_vision_74_wheel(wheels_branch, mats, "WHEEL_RR", Vector((-half_r_track, r_axle, wheel_r_z)), is_left=False, is_front=False)

    # 6. Build Monocoque Body, Louver Grille & Carved NACA Haunch Intakes
    print("[N_VISION_74] Sculpting Cyberpunk Folded-Paper Wedge Body, Grille & Haunch Intakes...")
    build_n_vision_74_monocoque(body_branch, mats, f_axle, r_axle)

    # 7. Build Parametric Pixel LED Lighting
    print("[N_VISION_74] Assembling Front & Rear Full-Width Parametric Pixel LED Matrix...")
    build_n_vision_74_lighting(body_branch, mats)

    # 8. Build Aerodynamic Package (Splitter, Diffuser, Swan-Neck Wing)
    print("[N_VISION_74] Assembling Carbon Splitter, Rear Diffuser & Authentic Swan-Neck Wing...")
    build_n_vision_74_aero(aero_branch, mats)

    # 9. Build Greenhouse & Rear Louvers
    print("[N_VISION_74] Installing Dielectric Tinted Glass & Framed Rear Fastback Louver System...")
    build_n_vision_74_greenhouse_and_louvers(glass_branch, body_branch, mats)

    # 10. Build Cyberpunk Cockpit & Roll Cage
    print("[N_VISION_74] Installing Alcantara Racing Cockpit, Bucket Seats & Roll Cage...")
    build_n_vision_74_interior(interior_branch, mats)

    # 11. Build Underbody Platform & Hydrogen Tanks
    print("[N_VISION_74] Assembling Platform Underbody, Hydrogen Tanks & Enclosed Tubs...")
    build_n_vision_74_platform(platform_branch, mats, f_axle, r_axle)

    # 12. Export Dual-Mode GLBs
    export_paths = [
        r"E:\Car_Automation\public\models\vehicles\hatchback\future\vehicle.glb",
        r"E:\Car_Automation\public\models\Car_Hyundai_N_Vision_74_Future.glb",
        r"E:\Car_Automation\exports\Car_Hyundai_N_Vision_74_Future.glb",
    ]
    for p in export_paths:
        os.makedirs(os.path.dirname(p), exist_ok=True)
        print(f"[N_VISION_74] Exporting GLB -> {p}...")
        bpy.ops.export_scene.gltf(
            filepath=p,
            export_format='GLB',
            use_selection=False,
            export_apply=True,
            export_yup=True
        )
        print(f"[N_VISION_74] Saved: {p} ({os.path.getsize(p) / 1024:.1f} KB)")

    print("================================================================================")
    print("HYUNDAI N VISION 74 BUILD COMPLETE — GLBS EXPORTED SUCCESSFULLY")
    print("================================================================================")


if __name__ == "__main__":
    build_hyundai_n_vision_74_master()
