"""
=============================================================================
CLASS-A CAD PROCEDURAL GENERATOR: TOYOTA GR YARIS (2020–PRESENT)
=============================================================================
High-fidelity procedural recreation of the modern WRC homologation rally special:
the Toyota GR Yaris (XP210, 2020+).

Authentic Factory Specifications:
- Wheelbase: 2,560 mm (Front Axle: +1.280m, Rear Axle: -1.280m)
- Overall Length: 3,995 mm (Front Bumper: +1.9975m, Rear Bumper: -1.9975m)
- Overall Width: 1,805 mm (Half-Width: 0.9025m, muscular blistered rear flares ~0.935m)
- Overall Height: 1,455 mm (Lowered aerodynamic roofline with -91mm rear slope)
- Track Width: Front 1,535 mm (X = ±0.7675m), Rear 1,565 mm (X = ±0.7825m)
- Ground Clearance: 124 mm (Sill base Z = 0.124m)
- Powertrain: G16E-GTS 1.6L Turbocharged 3-Cylinder + GR-FOUR Variable AWD
- Wheels: 18" x 8.0J Forged BBS 10-Spoke Alloy Wheels in Gloss Black (Circuit Pack)
- Brakes: 356mm 2-Piece Grooved Discs with High-Gloss Red GR 4-Piston Calipers
- Exterior: Gazoo Racing Pure White with Forged Carbon Roof, Massive Functional
  Intercooler Mouth, Triple-LED Projector Optics, Full-Width Rear LED Light-Bar,
  Rear Diffuser with Dual Chrome Exhaust Tips, Recaro Sport Cockpit.
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

    if alpha < 0.99:
        mat.blend_method = 'BLEND'
        if hasattr(mat, 'shadow_method'):
            mat.shadow_method = 'NONE'

    return mat


def create_gr_yaris_materials():
    mats = {}
    # Gazoo Racing Pure White (Hero WRC Homologation Color)
    mats["paint"] = make_pbr_mat("M_GR_PureWhite", (0.94, 0.95, 0.97, 1.0), metallic=0.06, roughness=0.08, clearcoat=1.0)
    # Lightweight Forged Carbon Fiber Roof (CFRP)
    mats["carbon_roof"] = make_pbr_mat("M_GR_CarbonRoof", (0.015, 0.015, 0.018, 1.0), metallic=0.75, roughness=0.12, clearcoat=1.0)
    # Gloss Black BBS 10-Spoke Forged Wheel Alloy & B-Pillars / Trim
    mats["wheel_black"] = make_pbr_mat("M_GR_BBSGlossBlack", (0.012, 0.012, 0.015, 1.0), metallic=0.70, roughness=0.06, clearcoat=1.0)
    # Satin Black Grille Frame, Front Splitter, Rear Diffuser & Aero Canards
    mats["trim_dark"] = make_pbr_mat("M_GR_TrimDark", (0.018, 0.018, 0.020, 1.0), metallic=0.18, roughness=0.55)
    # High-Flow Dark Intercooler Honeycomb Mesh
    mats["intake_mesh"] = make_pbr_mat("M_GR_IntakeMesh", (0.012, 0.012, 0.015, 1.0), metallic=0.75, roughness=0.25)
    # Front-Mounted High-Capacity Intercooler Radiator Core (Bright Polished Aluminum)
    mats["intercooler"] = make_pbr_mat("M_GR_Intercooler", (0.85, 0.87, 0.90, 1.0), metallic=0.96, roughness=0.12)
    # Michelin Pilot Sport 4S High-Performance Tire Rubber
    mats["tire_rubber"] = make_pbr_mat("M_GR_PilotSportRubber", (0.020, 0.020, 0.022, 1.0), metallic=0.01, roughness=0.75)
    # 356mm 2-Piece Grooved Brake Rotors
    mats["brake_metal"] = make_pbr_mat("M_GR_BrakeIron", (0.50, 0.50, 0.52, 1.0), metallic=0.88, roughness=0.30)
    # Gazoo Racing Red Monobloc Brake Calipers
    mats["caliper_red"] = make_pbr_mat("M_GR_CaliperRed", (0.90, 0.015, 0.015, 1.0), metallic=0.30, roughness=0.12, clearcoat=1.0)
    # Polished Stainless Steel Exhaust Tips (90mm diameter)
    mats["exhaust_metal"] = make_pbr_mat("M_GR_ExhaustMetal", (0.92, 0.92, 0.94, 1.0), metallic=0.98, roughness=0.06)
    mats["exhaust_inner"] = make_pbr_mat("M_GR_ExhaustInner", (0.010, 0.010, 0.012, 1.0), metallic=0.20, roughness=0.90)
    # Red "GR" Crest Badge
    mats["gr_red"] = make_pbr_mat("M_GR_BadgeRed", (0.92, 0.015, 0.015, 1.0), metallic=0.35, roughness=0.15, emission=(0.92, 0.015, 0.015, 1.0), emission_strength=4.0)
    # Toyota Chrome Oval Crest
    mats["chrome"] = make_pbr_mat("M_GR_MirrorChrome", (0.96, 0.96, 0.97, 1.0), metallic=0.98, roughness=0.03)
    # Triple-LED Headlamp Projectors & DRL Brows
    mats["headlamp_glass"] = make_pbr_mat("M_GR_HeadlampGlass", (0.96, 0.98, 1.0, 1.0), metallic=0.05, roughness=0.02, clearcoat=1.0, alpha=0.18)
    mats["headlamp_reflector"] = make_pbr_mat("M_GR_HeadlampReflector", (0.96, 0.96, 0.97, 1.0), metallic=0.96, roughness=0.06)
    mats["lamp_housing_dark"] = make_pbr_mat("M_GR_LampHousingDark", (0.012, 0.012, 0.015, 1.0), metallic=0.85, roughness=0.20)
    mats["bulb_led"] = make_pbr_mat("M_GR_BulbLED", (0.92, 0.97, 1.0, 1.0), metallic=0.1, roughness=0.1, emission=(0.92, 0.97, 1.0, 1.0), emission_strength=35.0)
    mats["drl_white"] = make_pbr_mat("M_GR_DRLWhite", (0.98, 0.99, 1.0, 1.0), metallic=0.1, roughness=0.1, emission=(0.98, 0.99, 1.0, 1.0), emission_strength=28.0)
    # Full-Width LED Taillight Bar Optics
    mats["tail_red"] = make_pbr_mat("M_GR_TaillampRed", (0.95, 0.01, 0.01, 1.0), metallic=0.05, roughness=0.08, emission=(0.95, 0.01, 0.01, 1.0), emission_strength=14.0)
    mats["tail_white"] = make_pbr_mat("M_GR_TaillampWhite", (0.94, 0.94, 0.96, 1.0), metallic=0.05, roughness=0.06, clearcoat=1.0, alpha=0.25)
    mats["f1_fog_red"] = make_pbr_mat("M_GR_F1FogRed", (0.98, 0.02, 0.02, 1.0), metallic=0.10, roughness=0.08, emission=(0.98, 0.02, 0.02, 1.0), emission_strength=25.0)
    # Projector Fog Lamps
    mats["fog_glass"] = make_pbr_mat("M_GR_FogGlass", (0.95, 0.95, 0.95, 1.0), metallic=0.02, roughness=0.04, clearcoat=1.0, alpha=0.22)
    mats["fog_bulb"] = make_pbr_mat("M_GR_FogBulb", (1.0, 0.96, 0.88, 1.0), metallic=0.1, roughness=0.1, emission=(1.0, 0.96, 0.88, 1.0), emission_strength=20.0)
    # License Plates
    mats["license_plate"] = make_pbr_mat("M_GR_LicensePlate", (0.95, 0.95, 0.95, 1.0), metallic=0.10, roughness=0.18)
    mats["plate_text"] = make_pbr_mat("M_GR_PlateText", (0.02, 0.02, 0.02, 1.0), metallic=0.05, roughness=0.80)
    # Deep Mirror Specular Tinted Glass (Dielectric, IOR 1.52, Clearcoat 1.0, Zero Chrome Blowout)
    mats["glass"] = make_pbr_mat("M_GR_OpticalGlass", (0.015, 0.018, 0.022, 1.0), metallic=0.0, roughness=0.04, ior=1.52, clearcoat=1.0)
    # Sport Cockpit & Alcantara Trim
    mats["interior_dark"] = make_pbr_mat("M_GR_InteriorDark", (0.035, 0.035, 0.038, 1.0), metallic=0.02, roughness=0.85)
    # Chassis Underside Belly Pan & Enclosed Wheel Tubs
    mats["chassis_dark"] = make_pbr_mat("M_GR_ChassisDark", (0.018, 0.018, 0.020, 1.0), metallic=0.20, roughness=0.85)

    return mats


# ----------------------------------------------------------------------------
# 2. GEOMETRY UTILITIES
# ----------------------------------------------------------------------------
def link_obj(name, bm, parent_obj, mat=None, bevel=0.003, auto_smooth=35.0):
    me = bpy.data.meshes.new(f"{name}_Mesh")
    bm.to_mesh(me)
    bm.free()
    obj = bpy.data.objects.new(name, me)
    if parent_obj:
        obj.parent = parent_obj
    bpy.context.scene.collection.objects.link(obj)

    if mat:
        obj.data.materials.append(mat)

    for poly in me.polygons:
        poly.use_smooth = True

    if hasattr(obj.data, "shade_smooth_by_angle"):
        obj.data.shade_smooth_by_angle(math.radians(auto_smooth))
    elif hasattr(obj.data, "auto_smooth_angle"):
        obj.data.auto_smooth_angle = math.radians(auto_smooth)
        obj.data.use_auto_smooth = True

    if bevel > 0.0005:
        bev = obj.modifiers.new("Bevel", 'BEVEL')
        bev.width = bevel
        bev.segments = 2
        bev.limit_method = 'ANGLE'
        bev.angle_limit = math.radians(35.0)
        bev.use_clamp_overlap = True

    try:
        wn = obj.modifiers.new("WeightedNormal", 'WEIGHTED_NORMAL')
        wn.keep_sharp = True
    except Exception:
        pass

    return obj


def make_quad_grid(bm, rows, invert_normals=False):
    grid_verts = []
    for r in rows:
        row_v = [bm.verts.new(pt) for pt in r]
        grid_verts.append(row_v)
    for i in range(len(grid_verts) - 1):
        for j in range(len(grid_verts[i]) - 1):
            v00 = grid_verts[i][j]
            v10 = grid_verts[i+1][j]
            v11 = grid_verts[i+1][j+1]
            v01 = grid_verts[i][j+1]
            if invert_normals:
                bm.faces.new((v00, v01, v11, v10))
            else:
                bm.faces.new((v00, v10, v11, v01))


# ----------------------------------------------------------------------------
# 3. 18-INCH BBS FORGED 10-SPOKE WHEELS & RED GR BRAKES
# ----------------------------------------------------------------------------
def build_gr_yaris_wheel(wheels_branch, mats, name, loc, is_left=True):
    outer_sign = 1.0 if is_left else -1.0
    rim_r = 0.2286  # 18 inches
    wheel_r = 0.318
    tire_w = 0.225
    half_tw = tire_w / 2.0
    segs = 32

    # 1. Michelin Pilot Sport 4S 225/40 R18 Radial Tire
    bm_tire = bmesh.new()
    t_profiles = [
        (-half_tw * 0.88, rim_r * 1.01),
        (-half_tw * 1.06, (rim_r + wheel_r) * 0.48),
        (-half_tw * 0.95, wheel_r * 0.98),
        (0.0,             wheel_r * 1.00),
        ( half_tw * 0.95, wheel_r * 0.98),
        ( half_tw * 1.06, (rim_r + wheel_r) * 0.48),
        ( half_tw * 0.88, rim_r * 1.01),
    ]
    t_rings = []
    for px, pr in t_profiles:
        ring = []
        actual_x = px * outer_sign
        for s in range(segs):
            ang = 2.0 * math.pi * s / segs
            c_a, s_a = math.cos(ang), math.sin(ang)
            pt = loc + Vector((actual_x, pr * c_a, pr * s_a))
            ring.append(bm_tire.verts.new(pt))
        t_rings.append(ring)

    for i in range(len(t_rings) - 1):
        for s in range(segs):
            s_next = (s + 1) % segs
            if is_left:
                bm_tire.faces.new((t_rings[i][s], t_rings[i+1][s], t_rings[i+1][s_next], t_rings[i][s_next]))
            else:
                bm_tire.faces.new((t_rings[i][s], t_rings[i][s_next], t_rings[i+1][s_next], t_rings[i+1][s]))

    link_obj(f"Tire_{name}", bm_tire, wheels_branch, mats["tire_rubber"], bevel=0.0)

    # 2. 18" BBS Gloss Black Rim Barrel & Stepped Lip
    bm_rim = bmesh.new()
    rim_edge_x = half_tw * 0.85 * outer_sign
    inner_edge_x = -half_tw * 0.92 * outer_sign
    r_profiles = [
        (inner_edge_x,                       rim_r * 0.98),
        (rim_edge_x - 0.022 * outer_sign,   rim_r * 0.98),
        (rim_edge_x - 0.010 * outer_sign,   rim_r * 0.94),
        (rim_edge_x,                         rim_r * 0.92),
    ]
    r_rings = []
    for rx, rr in r_profiles:
        ring = []
        for s in range(segs):
            ang = 2.0 * math.pi * s / segs
            pt = loc + Vector((rx, rr * math.cos(ang), rr * math.sin(ang)))
            ring.append(bm_rim.verts.new(pt))
        r_rings.append(ring)

    for i in range(len(r_rings) - 1):
        for s in range(segs):
            s_next = (s + 1) % segs
            if is_left:
                bm_rim.faces.new((r_rings[i][s], r_rings[i+1][s], r_rings[i+1][s_next], r_rings[i][s_next]))
            else:
                bm_rim.faces.new((r_rings[i][s], r_rings[i][s_next], r_rings[i+1][s_next], r_rings[i+1][s]))

    link_obj(f"Rim_Barrel_{name}", bm_rim, wheels_branch, mats["wheel_black"], bevel=0.002)

    # 3. 10 BBS Forged Radiating Curved Spokes & Recessed Center Hub
    bm_face = bmesh.new()
    face_x = rim_edge_x - 0.008 * outer_sign
    spoke_r_out = rim_r * 0.91
    spoke_r_in = 0.065
    hub_x = face_x - 0.022 * outer_sign
    spoke_count = 10

    for sp in range(spoke_count):
        ang = 2.0 * math.pi * sp / spoke_count
        cos_a, sin_a = math.cos(ang), math.sin(ang)
        p_y = -sin_a * 0.011
        p_z =  cos_a * 0.011

        v1 = bm_face.verts.new(loc + Vector((face_x, sin_a * spoke_r_out + p_y, cos_a * spoke_r_out + p_z)))
        v2 = bm_face.verts.new(loc + Vector((face_x, sin_a * spoke_r_out - p_y, cos_a * spoke_r_out - p_z)))
        v3 = bm_face.verts.new(loc + Vector((hub_x,  sin_a * spoke_r_in - p_y * 1.3, cos_a * spoke_r_in - p_z * 1.3)))
        v4 = bm_face.verts.new(loc + Vector((hub_x,  sin_a * spoke_r_in + p_y * 1.3, cos_a * spoke_r_in + p_z * 1.3)))

        depth_x = -0.018 * outer_sign
        v1_b = bm_face.verts.new(v1.co + Vector((depth_x, 0, 0)))
        v2_b = bm_face.verts.new(v2.co + Vector((depth_x, 0, 0)))
        v3_b = bm_face.verts.new(v3.co + Vector((depth_x, 0, 0)))
        v4_b = bm_face.verts.new(v4.co + Vector((depth_x, 0, 0)))

        if is_left:
            bm_face.faces.new((v1, v2, v3, v4))
            bm_face.faces.new((v1_b, v4_b, v3_b, v2_b))
            bm_face.faces.new((v1, v4, v4_b, v1_b))
            bm_face.faces.new((v2, v2_b, v3_b, v3))
        else:
            bm_face.faces.new((v1, v4, v3, v2))
            bm_face.faces.new((v1_b, v2_b, v3_b, v4_b))
            bm_face.faces.new((v1, v1_b, v4_b, v4))
            bm_face.faces.new((v2, v3, v3_b, v2_b))

    # Center Hub Cap & Lug Nuts
    hub_rings = []
    hub_profiles = [
        (spoke_r_in, hub_x),
        (0.045,      hub_x - 0.008 * outer_sign),
        (0.034,      hub_x - 0.004 * outer_sign),
        (0.000,      hub_x - 0.002 * outer_sign),
    ]
    for hr, hx in hub_profiles:
        ring = []
        for s in range(16):
            ang = 2.0 * math.pi * s / 16
            pt = loc + Vector((hx, hr * math.cos(ang), hr * math.sin(ang)))
            ring.append(bm_face.verts.new(pt))
        hub_rings.append(ring)

    for i in range(len(hub_rings) - 1):
        for s in range(16):
            s_next = (s + 1) % 16
            if is_left:
                bm_face.faces.new((hub_rings[i][s], hub_rings[i+1][s], hub_rings[i+1][s_next], hub_rings[i][s_next]))
            else:
                bm_face.faces.new((hub_rings[i][s], hub_rings[i][s_next], hub_rings[i+1][s_next], hub_rings[i+1][s]))

    # 5 Lug Nuts
    for ln in range(5):
        l_ang = 2.0 * math.pi * ln / 5.0
        lx = hub_x - 0.005 * outer_sign
        ly = 0.040 * math.sin(l_ang)
        lz = 0.040 * math.cos(l_ang)
        ret_nut = bmesh.ops.create_cone(
            bm_face, cap_ends=True, segments=6,
            radius1=0.007, radius2=0.006, depth=0.008,
            matrix=Matrix.Rotation(math.radians(90.0), 3, 'Y')
        )
        bmesh.ops.translate(bm_face, verts=ret_nut['verts'], vec=loc + Vector((lx, ly, lz)))

    link_obj(f"Wheel_Spokes_{name}", bm_face, wheels_branch, mats["wheel_black"], bevel=0.002)

    # 4. 356mm 2-Piece Grooved Brake Rotor
    bm_disc = bmesh.new()
    disc_r = 0.178
    disc_x = rim_edge_x - 0.045 * outer_sign
    ret_d = bmesh.ops.create_cone(
        bm_disc, cap_ends=True, segments=24,
        radius1=disc_r, radius2=disc_r, depth=0.024,
        matrix=Matrix.Rotation(math.radians(90.0), 3, 'Y')
    )
    bmesh.ops.translate(bm_disc, verts=ret_d['verts'], vec=loc + Vector((disc_x, 0, 0)))

    # Central Aluminum Bell / Hat
    ret_hat = bmesh.ops.create_cone(
        bm_disc, cap_ends=True, segments=20,
        radius1=0.082, radius2=0.080, depth=0.028,
        matrix=Matrix.Rotation(math.radians(90.0), 3, 'Y')
    )
    bmesh.ops.translate(bm_disc, verts=ret_hat['verts'], vec=loc + Vector((disc_x + 0.004 * outer_sign, 0, 0)))
    link_obj(f"BrakeDisc_{name}", bm_disc, wheels_branch, mats["brake_metal"], bevel=0.001)

    # 5. Gazoo Racing High-Gloss Red Caliper Assembly
    bm_cal = bmesh.new()
    ret_cal = bmesh.ops.create_cube(bm_cal, size=1.0)
    for v in ret_cal['verts']:
        v.co.x = v.co.x * 0.055 + disc_x + 0.018 * outer_sign
        v.co.y = v.co.y * 0.150 + loc.y + (0.130 if loc.y > 0 else -0.130)
        v.co.z = v.co.z * 0.075 + loc.z + 0.085

    # White GR Logo on Caliper
    ret_logo = bmesh.ops.create_cube(bm_cal, size=1.0)
    for v in ret_logo['verts']:
        v.co.x = v.co.x * 0.005 + disc_x + 0.046 * outer_sign
        v.co.y = v.co.y * 0.060 + loc.y + (0.130 if loc.y > 0 else -0.130)
        v.co.z = v.co.z * 0.016 + loc.z + 0.085
    link_obj(f"Caliper_{name}", bm_cal, wheels_branch, mats["caliper_red"], bevel=0.003)


# ----------------------------------------------------------------------------
# 4. CLASS-A MONOCOQUE: WRC WIDEBODY BLISTERS, CARBON ROOF & GREENHOUSE
# ----------------------------------------------------------------------------
def build_gr_yaris_monocoque(body_branch, aero_branch, mats, f_axle, r_axle):
    bm = bmesh.new()

    arch_span = 0.355
    z_arch_peak = 0.535
    base_sill = 0.124
    fz_waist = 0.835

    # 13-point circular arch sampling
    f_arch_pts = []
    for a in range(13):
        ang = math.pi * a / 12.0
        f_arch_pts.append(round(f_axle + arch_span * math.cos(ang), 4))

    r_arch_pts = []
    for a in range(13):
        ang = math.pi * a / 12.0
        r_arch_pts.append(round(r_axle + arch_span * math.cos(ang), 4))

    raw_y = (
        [1.9975, 1.950, 1.880, 1.780, 1.650]
        + f_arch_pts
        + [0.820, 0.550, 0.250, -0.050, -0.350, -0.650, -0.850]
        + r_arch_pts
        + [-1.650, -1.780, -1.880, -1.950, -1.9975]
    )
    clean_y = sorted(list(set(raw_y)), reverse=True)

    def get_station_profile(fy):
        fz_s = base_sill
        fz_w = fz_waist
        fw_bot = 0.790
        fw_w = 0.9025

        # Front nose taper
        if fy > 1.650:
            t = (fy - 1.650) / (1.9975 - 1.650)
            fw_w = 0.9025 - 0.145 * (t ** 1.15)
            fw_bot = 0.790 - 0.135 * (t ** 1.15)
            fz_w = fz_waist - 0.130 * t
            fz_s = base_sill + 0.020 * t
        # Rear tail taper
        elif fy < -1.650:
            t = (-fy - 1.650) / (1.9975 - 1.650)
            fw_w = 0.9025 - 0.120 * (t ** 1.15)
            fw_bot = 0.790 - 0.105 * (t ** 1.15)
            fz_w = fz_waist - 0.035 * t
            fz_s = base_sill + 0.030 * t

        # Door waistline sculpt (slight tuck-in between axles for Coke-bottle waist)
        if -0.850 <= fy <= 0.820:
            mid_t = math.cos(math.pi * (fy + 0.015) / 1.670)
            fw_w = 0.9025 - 0.022 * mid_t
            fw_bot = 0.790 - 0.018 * mid_t

        # Blistered widebody arches (Wider rear track for WRC stability)
        d_f = abs(fy - f_axle)
        d_r = abs(fy - r_axle)
        if d_f < arch_span:
            norm_d = d_f / arch_span
            arch_lift = math.sqrt(max(0.0, 1.0 - norm_d * norm_d))
            z_sill = base_sill + (z_arch_peak - base_sill) * arch_lift
            x_sill = fw_w * 1.018
            x_crease = fw_w * 1.014
            x_waist = fw_w * 0.990 + 0.020 * arch_lift
        elif d_r < arch_span:
            norm_d = d_r / arch_span
            arch_lift = math.sqrt(max(0.0, 1.0 - norm_d * norm_d))
            z_sill = base_sill + (z_arch_peak - base_sill) * arch_lift
            # Pronounced WRC rear blister flare (+X = 0.935m)
            x_sill = fw_w * 1.036
            x_crease = fw_w * 1.032
            x_waist = fw_w * 0.990 + 0.036 * arch_lift
        else:
            z_sill = fz_s
            x_sill = fw_bot
            x_crease = fw_w * 0.985
            x_waist = fw_w

        z_crease = z_sill + (fz_w - z_sill) * 0.48
        z_waist = fz_w

        return (z_sill, x_sill, z_crease, x_crease, z_waist, x_waist)

    station_data = [(fy, get_station_profile(fy)) for fy in clean_y]
    num_pts = len(station_data)

    # 1. Left (+X) and Right (-X) Lower Body Flanks
    for side in [1.0, -1.0]:
        rows = []
        for i in range(num_pts):
            fy, prof = station_data[i]
            z_sill, x_sill, z_crease, x_crease, z_waist, x_waist = prof
            p_sill = Vector((side * x_sill, fy, z_sill))
            p_crease = Vector((side * x_crease, fy, z_crease))
            p_waist = Vector((side * x_waist, fy, z_waist))
            rows.append([p_sill, p_crease, p_waist])
        make_quad_grid(bm, rows, invert_normals=(side < 0))

    # 2. Sloping Aluminum Aerodynamic Hood (Cowl Y=0.820 down to Nose Y=1.9975)
    hood_stations = [s for s in station_data if 0.820 <= s[0] <= 1.9975]
    hood_rows = []
    for fy, prof in hood_stations:
        z_waist = prof[4]
        x_waist = prof[5]
        hood_w = x_waist * 0.96
        if fy >= 1.980:
            z_edge = 0.705
            z_cl = 0.709
            z_c = 0.713
        else:
            z_edge = z_waist
            z_cl = z_waist + 0.016
            z_c = z_waist + 0.024
        p_l = Vector(( hood_w, fy, z_edge))
        p_cl = Vector(( hood_w * 0.48, fy, z_cl))
        p_c = Vector(( 0.0,    fy, z_c))
        p_cr = Vector((-hood_w * 0.48, fy, z_cl))
        p_r = Vector((-hood_w, fy, z_edge))
        hood_rows.append([p_l, p_cl, p_c, p_cr, p_r])
    make_quad_grid(bm, hood_rows)

    # 3. Forged Carbon Fiber Roof (CFRP) - Sloping down by 91mm at rear
    bm_carbon = bmesh.new()
    roof_rows = [
        [Vector(( 0.560,  0.380, 1.435)), Vector(( 0.0,  0.380, 1.450)), Vector((-0.560,  0.380, 1.435))],
        [Vector(( 0.570, -0.100, 1.442)), Vector(( 0.0, -0.100, 1.455)), Vector((-0.570, -0.100, 1.442))],
        [Vector(( 0.565, -0.650, 1.425)), Vector(( 0.0, -0.650, 1.438)), Vector((-0.565, -0.650, 1.425))],
        [Vector(( 0.540, -1.350, 1.350)), Vector(( 0.0, -1.350, 1.364)), Vector((-0.540, -1.350, 1.350))],
    ]
    make_quad_grid(bm_carbon, roof_rows)
    link_obj("Carbon_Roof", bm_carbon, body_branch, mats["carbon_roof"], bevel=0.002)

    # 4. Greenhouse A-Pillars, Cantrail Rails & Rear C-Pillars
    for side in [1.0, -1.0]:
        # A-Pillar (Diagonal from Cowl Y=0.820 up to Roof Y=0.380)
        ap = [
            [Vector((side * 0.760, 0.820, 0.835)), Vector((side * 0.700, 0.820, 0.835))],
            [Vector((side * 0.672, 0.600, 1.135)), Vector((side * 0.625, 0.600, 1.135))],
            [Vector((side * 0.585, 0.380, 1.435)), Vector((side * 0.550, 0.380, 1.435))],
        ]
        make_quad_grid(bm, ap, invert_normals=(side < 0))

        # Roof Rail Cantrail
        rail = [
            [Vector((side * 0.550,  0.380, 1.435)), Vector((side * 0.585,  0.380, 1.435))],
            [Vector((side * 0.560, -0.450, 1.435)), Vector((side * 0.595, -0.450, 1.435))],
            [Vector((side * 0.540, -1.350, 1.350)), Vector((side * 0.575, -1.350, 1.350))],
        ]
        make_quad_grid(bm, rail, invert_normals=(side < 0))

        # Rear C-Pillar Sail (Monotonic ordering: Bottom waistline -> Mid shoulder -> Roof rail)
        cp_sail = [
            [Vector((side * 0.760, -1.250, 0.850)), Vector((side * 0.640, -1.250, 1.120)), Vector((side * 0.530, -1.250, 1.345))],
            [Vector((side * 0.775, -1.550, 0.835)), Vector((side * 0.655, -1.550, 1.020)), Vector((side * 0.540, -1.550, 1.150))],
            [Vector((side * 0.765, -1.780, 0.815)), Vector((side * 0.660, -1.780, 0.860)), Vector((side * 0.560, -1.780, 0.905))],
        ]
        make_quad_grid(bm, cp_sail, invert_normals=(side < 0))

    # 5. Rear Tailgate Assembly (Watertight Hatch Interface)
    r_top = [
        [Vector(( 0.540, -1.350, 1.350)), Vector(( 0.0, -1.350, 1.364)), Vector((-0.540, -1.350, 1.350))],
        [Vector(( 0.500, -1.355, 1.340)), Vector(( 0.0, -1.355, 1.354)), Vector((-0.500, -1.355, 1.340))],
    ]
    make_quad_grid(bm, r_top)

    # Tailgate deck beneath glass down to bumper
    r_hatch = [
        [Vector(( 0.560, -1.780, 0.905)), Vector(( 0.0, -1.780, 0.915)), Vector((-0.560, -1.780, 0.905))],
        [Vector(( 0.765, -1.9975, 0.815)), Vector(( 0.0, -2.002, 0.820)), Vector((-0.765, -1.9975, 0.815))],
        [Vector(( 0.765, -1.9975, 0.560)), Vector(( 0.0, -2.002, 0.560)), Vector((-0.765, -1.9975, 0.560))],
    ]
    make_quad_grid(bm, r_hatch)

    # 6. Enclosed Inner Wheel Arch Tubs (Zero See-Through Voids)
    tub_r = 0.350
    for ax_y, is_f in [(f_axle, True), (r_axle, False)]:
        track_w = 0.7675 if is_f else 0.7825
        for sign in [1.0, -1.0]:
            tub_pts_out, tub_pts_in = [], []
            t_segs = 12
            for s in range(t_segs):
                ang = math.pi * s / (t_segs - 1)
                py = ax_y - tub_r * math.cos(ang)
                pz = base_sill + tub_r * math.sin(ang)
                tub_pts_out.append(Vector((sign * track_w * 1.05, py, pz)))
                tub_pts_in.append(Vector((sign * track_w * 0.72, py, pz)))
            tub_rows = [tub_pts_out, tub_pts_in]
            make_quad_grid(bm, tub_rows, invert_normals=(sign < 0))

    # 7. Smooth Underbody Floorpan
    belly_pan = [
        [Vector(( 0.760,  1.500, 0.125)), Vector(( 0.0,  1.500, 0.125)), Vector((-0.760,  1.500, 0.125))],
        [Vector(( 0.780,  0.000, 0.115)), Vector(( 0.0,  0.000, 0.115)), Vector((-0.780,  0.000, 0.115))],
        [Vector(( 0.770, -1.500, 0.125)), Vector(( 0.0, -1.500, 0.125)), Vector((-0.770, -1.500, 0.125))],
    ]
    make_quad_grid(bm, belly_pan)

    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.002)
    link_obj("Cabin", bm, body_branch, mats["paint"], bevel=0.003)

    # 8. Gloss Black B-Pillar Division Trim
    bm_bp = bmesh.new()
    for side in [1.0, -1.0]:
        bp = [
            [Vector((side * 0.762, -0.680, 0.850)), Vector((side * 0.762, -0.730, 0.850))],
            [Vector((side * 0.567, -0.680, 1.425)), Vector((side * 0.567, -0.730, 1.425))],
        ]
        make_quad_grid(bm_bp, bp, invert_normals=(side < 0))
    link_obj("B_Pillars", bm_bp, body_branch, mats["wheel_black"], bevel=0.001)


# ----------------------------------------------------------------------------
# 5. FRONT CLIP: HOLLOW GR INTERCOOLER MOUTH, CANARDS & TRIPLE-LED OPTICS
# ----------------------------------------------------------------------------
def build_gr_yaris_front_fascia(body_branch, aero_branch, mats):
    bm_front = bmesh.new()

    # 1. Front Bumper Upper Brow meeting hood with 0% gap
    brow_rows = [
        [Vector(( 0.750, 1.950, 0.705)), Vector(( 0.375, 1.9975, 0.705)), Vector(( 0.0, 2.005, 0.710)), Vector((-0.375, 1.9975, 0.705)), Vector((-0.750, 1.950, 0.705))],
        [Vector(( 0.752, 1.955, 0.675)), Vector(( 0.375, 2.002, 0.675)), Vector(( 0.0, 2.010, 0.680)), Vector((-0.375, 2.002, 0.675)), Vector((-0.752, 1.955, 0.675))],
    ]
    make_quad_grid(bm_front, brow_rows)

    # Outer Cheeks under Headlights (Left +X and Right -X)
    for sign in [1.0, -1.0]:
        cheek_rows = [
            [Vector((sign * 0.755, 1.955, 0.580)), Vector((sign * 0.565, 1.990, 0.580)), Vector((sign * 0.375, 2.002, 0.580))],
            [Vector((sign * 0.760, 1.965, 0.450)), Vector((sign * 0.570, 2.000, 0.450)), Vector((sign * 0.380, 2.012, 0.450))],
            [Vector((sign * 0.745, 1.955, 0.280)), Vector((sign * 0.560, 1.990, 0.280)), Vector((sign * 0.375, 2.004, 0.280))],
            [Vector((sign * 0.710, 1.945, 0.140)), Vector((sign * 0.530, 1.980, 0.140)), Vector((sign * 0.355, 1.998, 0.140))],
        ]
        make_quad_grid(bm_front, cheek_rows, invert_normals=(sign < 0))

        # Vertical transition face alongside inner headlight edge
        v1 = bm_front.verts.new(Vector((sign * 0.375, 2.002, 0.675)))
        v2 = bm_front.verts.new(Vector((sign * 0.375, 2.002, 0.580)))
        v3 = bm_front.verts.new(Vector((sign * 0.380, 2.012, 0.450)))
        v4 = bm_front.verts.new(Vector((sign * 0.385, 2.014, 0.675)))
        if sign > 0:
            bm_front.faces.new((v1, v2, v3, v4))
        else:
            bm_front.faces.new((v1, v4, v3, v2))

    bmesh.ops.remove_doubles(bm_front, verts=bm_front.verts, dist=0.002)
    link_obj("Front_Bumper_Shell", bm_front, body_branch, mats["paint"], bevel=0.003)

    # 2. Gazoo Racing Functional Perimeter Frame (HOLLOW MOUTH)
    bm_grille = bmesh.new()
    f_mouth_w_top = 0.370
    f_mouth_w_bot = 0.395
    mouth_frame = [
        # Top lip
        [Vector(( f_mouth_w_top, 2.002, 0.600)), Vector(( 0.0, 2.010, 0.600)), Vector((-f_mouth_w_top, 2.002, 0.600))],
        [Vector(( f_mouth_w_top, 1.990, 0.575)), Vector(( 0.0, 1.998, 0.575)), Vector((-f_mouth_w_top, 1.990, 0.575))],
    ]
    make_quad_grid(bm_grille, mouth_frame)

    # Bottom Lip
    bot_frame = [
        [Vector(( f_mouth_w_bot, 1.990, 0.165)), Vector(( 0.0, 1.998, 0.165)), Vector((-f_mouth_w_bot, 1.990, 0.165))],
        [Vector(( f_mouth_w_bot, 2.004, 0.140)), Vector(( 0.0, 2.012, 0.140)), Vector((-f_mouth_w_bot, 2.004, 0.140))],
    ]
    make_quad_grid(bm_grille, bot_frame)

    # Impact Crash Bar running horizontally across mid-grille
    ret_bar = bmesh.ops.create_cube(bm_grille, size=1.0)
    for v in ret_bar['verts']:
        v.co.x *= 0.740
        v.co.y = v.co.y * 0.035 + 2.005
        v.co.z = v.co.z * 0.090 + 0.460

    link_obj("GR_Grille_Housing", bm_grille, body_branch, mats["trim_dark"], bevel=0.002)

    # 3. High-Capacity Aluminum Intercooler Radiator Core with Visible Cooling Fins
    bm_ic = bmesh.new()
    ret_ic = bmesh.ops.create_cube(bm_ic, size=1.0)
    for v in ret_ic['verts']:
        v.co.x *= 0.680
        v.co.y = v.co.y * 0.025 + 1.975
        v.co.z = v.co.z * 0.380 + 0.360

    # 6 Horizontal Aluminum Cooling Tube Louvers across the Intercooler
    for fin_i in range(6):
        fz = 0.200 + fin_i * 0.055
        ret_fin = bmesh.ops.create_cube(bm_ic, size=1.0)
        for v in ret_fin['verts']:
            v.co.x *= 0.670
            v.co.y = v.co.y * 0.010 + 1.988
            v.co.z = v.co.z * 0.008 + fz
    link_obj("Intercooler_Core", bm_ic, body_branch, mats["intercooler"], bevel=0.001)

    # 4. Honeycomb Wire Intake Mesh Insert (Upper and Lower Grille Aperatures)
    bm_mesh = bmesh.new()
    # Lower Grille Mesh (Below Crash Bar: Z=0.170 to 0.410)
    mesh_low = [
        [Vector(( 0.380, 1.995, 0.410)), Vector(( 0.0, 2.002, 0.410)), Vector((-0.380, 1.995, 0.410))],
        [Vector(( 0.385, 1.995, 0.170)), Vector(( 0.0, 2.002, 0.170)), Vector((-0.385, 1.995, 0.170))],
    ]
    make_quad_grid(bm_mesh, mesh_low)

    # Upper Grille Mesh (Above Crash Bar: Z=0.510 to 0.575)
    mesh_up = [
        [Vector(( 0.365, 1.992, 0.575)), Vector(( 0.0, 2.000, 0.575)), Vector((-0.365, 1.992, 0.575))],
        [Vector(( 0.368, 1.992, 0.510)), Vector(( 0.0, 2.000, 0.510)), Vector((-0.368, 1.992, 0.510))],
    ]
    make_quad_grid(bm_mesh, mesh_up)
    link_obj("Intake_Mesh", bm_mesh, body_branch, mats["intake_mesh"], bevel=0.0)

    # 5. Outboard Vertical Brake Ducts, Side Canards & Fog Lamps
    bm_fog = bmesh.new()
    bm_fog_glass = bmesh.new()
    for sign in [1.0, -1.0]:
        # Piano Black Vertical Aero Duct Bezel
        ret_duct = bmesh.ops.create_cube(bm_fog, size=1.0)
        for v in ret_duct['verts']:
            v.co.x = v.co.x * 0.110 + sign * 0.600
            v.co.y = v.co.y * 0.040 + 1.975
            v.co.z = v.co.z * 0.260 + 0.340

        # Projector Fog Housing
        ret_fh = bmesh.ops.create_cone(
            bm_fog, cap_ends=True, segments=16,
            radius1=0.036, radius2=0.024, depth=0.028,
            matrix=Matrix.Rotation(math.radians(-90.0), 3, 'X')
        )
        bmesh.ops.translate(bm_fog, verts=ret_fh['verts'], vec=Vector((sign * 0.600, 1.985, 0.250)))

        # Glowing Bulb Core
        ret_fb = bmesh.ops.create_icosphere(bm_fog, subdivisions=2, radius=0.012)
        bmesh.ops.translate(bm_fog, verts=ret_fb['verts'], vec=Vector((sign * 0.600, 1.992, 0.250)))

        # Fog Lens
        ret_fl = bmesh.ops.create_cone(
            bm_fog_glass, cap_ends=True, segments=16,
            radius1=0.038, radius2=0.038, depth=0.008,
            matrix=Matrix.Rotation(math.radians(-90.0), 3, 'X')
        )
        bmesh.ops.translate(bm_fog_glass, verts=ret_fl['verts'], vec=Vector((sign * 0.600, 2.000, 0.250)))

    link_obj("Brake_Ducts_And_Fogs", bm_fog, body_branch, mats["trim_dark"], bevel=0.002)
    link_obj("Fog_Lenses", bm_fog_glass, body_branch, mats["fog_glass"], bevel=0.0)

    # 6. Front Aerodynamic Chin Splitter Lip & Winglet Endplates
    bm_splitter = bmesh.new()
    ret_lip = bmesh.ops.create_cube(bm_splitter, size=1.0)
    for v in ret_lip['verts']:
        v.co.x *= 1.520
        v.co.y = v.co.y * 0.070 + 2.015
        v.co.z = v.co.z * 0.026 + 0.125

    # Side Strakes
    for sign in [1.0, -1.0]:
        ret_wing = bmesh.ops.create_cube(bm_splitter, size=1.0)
        for v in ret_wing['verts']:
            v.co.x = v.co.x * 0.024 + sign * 0.760
            v.co.y = v.co.y * 0.090 + 1.995
            v.co.z = v.co.z * 0.065 + 0.155
    link_obj("Front_Splitter", bm_splitter, aero_branch, mats["trim_dark"], bevel=0.002)

    # 7. Front Emblems: Toyota Badge, Front Plate & Red "GR" Crest
    bm_emb = bmesh.new()
    # Front Toyota Chrome Crest (Dead center above grille mouth)
    ret_toy = bmesh.ops.create_cone(
        bm_emb, cap_ends=True, segments=18,
        radius1=0.035, radius2=0.035, depth=0.008,
        matrix=Matrix.Rotation(math.radians(-90.0), 3, 'X')
    )
    for v in ret_toy['verts']:
        v.co.x *= 1.55
    bmesh.ops.translate(bm_emb, verts=ret_toy['verts'], vec=Vector((0.0, 2.012, 0.675)))
    link_obj("Front_Emblems", bm_emb, body_branch, mats["chrome"], bevel=0.001)

    # Front License Plate (Mounted on impact bar)
    bm_fp = bmesh.new()
    ret_fp = bmesh.ops.create_cube(bm_fp, size=1.0)
    for v in ret_fp['verts']:
        v.co.x *= 0.440
        v.co.y = v.co.y * 0.006 + 2.022
        v.co.z = v.co.z * 0.088 + 0.460
    link_obj("Front_License_Plate", bm_fp, body_branch, mats["license_plate"], bevel=0.001)

    # Red & White "GR" Emblem on Front Grille Mesh
    bm_gr = bmesh.new()
    ret_gr = bmesh.ops.create_cube(bm_gr, size=1.0)
    for v in ret_gr['verts']:
        v.co.x = v.co.x * 0.065 + 0.240
        v.co.y = v.co.y * 0.008 + 1.998
        v.co.z = v.co.z * 0.030 + 0.320
    link_obj("Front_GR_Badge", bm_gr, body_branch, mats["gr_red"], bevel=0.001)


# ----------------------------------------------------------------------------
# 6. REAR CLIP: FULL-WIDTH LIGHT-BAR, REAR DIFFUSER & DUAL EXHAUST TIPS
# ----------------------------------------------------------------------------
def build_gr_yaris_rear_fascia(body_branch, aero_branch, mats):
    # 1. Sculpted Rear Bumper Outer Shell
    bm_rear = bmesh.new()
    rb_rows = [
        # Upper bumper shelf under tailgate (Z=0.815)
        [Vector(( 0.765, -1.9975, 0.815)), Vector(( 0.380, -2.005, 0.815)), Vector(( 0.0, -2.012, 0.815)), Vector((-0.380, -2.005, 0.815)), Vector((-0.765, -1.9975, 0.815))],
        # License plate deck & bumper impact ridge (Z=0.640)
        [Vector(( 0.762, -2.005, 0.640)), Vector(( 0.380, -2.015, 0.640)), Vector(( 0.0, -2.022, 0.640)), Vector((-0.380, -2.015, 0.640)), Vector((-0.762, -2.005, 0.640))],
        # Diffuser integration shelf (Z=0.380)
        [Vector(( 0.750, -1.995, 0.380)), Vector(( 0.375, -2.005, 0.380)), Vector(( 0.0, -2.010, 0.380)), Vector((-0.375, -2.005, 0.380)), Vector((-0.750, -1.995, 0.380))],
        # Lower corner apron (Z=0.180)
        [Vector(( 0.710, -1.985, 0.180)), Vector(( 0.530, -1.995, 0.180)), Vector(( 0.460, -1.998, 0.180)), Vector((-0.460, -1.998, 0.180)), Vector((-0.710, -1.985, 0.180))],
    ]
    make_quad_grid(bm_rear, rb_rows)

    # Recessed license plate pocket on hatch
    ret_lp = bmesh.ops.create_cube(bm_rear, size=1.0)
    for v in ret_lp['verts']:
        v.co.x *= 0.480
        v.co.y = v.co.y * 0.035 - 2.000
        v.co.z = v.co.z * 0.140 + 0.640

    bmesh.ops.remove_doubles(bm_rear, verts=bm_rear.verts, dist=0.002)
    link_obj("Rear_Bumper_Shell", bm_rear, body_branch, mats["paint"], bevel=0.003)

    # Rear White License Plate
    bm_plate = bmesh.new()
    ret_pl = bmesh.ops.create_cube(bm_plate, size=1.0)
    for v in ret_pl['verts']:
        v.co.x *= 0.460
        v.co.y = v.co.y * 0.005 - 2.014
        v.co.z = v.co.z * 0.110 + 0.640
    link_obj("Rear_License_Plate", bm_plate, body_branch, mats["license_plate"], bevel=0.001)

    # 2. Gloss Black Aerodynamic Rear Diffuser with Tunnel Tray and Airflow Fins
    bm_diff = bmesh.new()
    df_rows = [
        [Vector(( 0.640, -1.880, 0.130)), Vector(( 0.0, -1.880, 0.130)), Vector((-0.640, -1.880, 0.130))],
        [Vector(( 0.660, -1.960, 0.170)), Vector(( 0.0, -1.960, 0.170)), Vector((-0.660, -1.960, 0.170))],
        [Vector(( 0.650, -2.005, 0.280)), Vector(( 0.0, -2.010, 0.280)), Vector((-0.650, -2.005, 0.280))],
    ]
    make_quad_grid(bm_diff, df_rows)

    # 4 Vertical Diffuser Fins
    for dx in [0.160, -0.160, 0.320, -0.320]:
        ret_fin = bmesh.ops.create_cube(bm_diff, size=1.0)
        for v in ret_fin['verts']:
            v.co.x = v.co.x * 0.016 + dx
            v.co.y = v.co.y * 0.140 - 1.950
            v.co.z = v.co.z * 0.080 + 0.160

    link_obj("Diffuser", bm_diff, aero_branch, mats["trim_dark"], bevel=0.002)

    # Central F1 Red Rain / Fog Lamp
    bm_f1 = bmesh.new()
    ret_f1 = bmesh.ops.create_cube(bm_f1, size=1.0)
    for v in ret_f1['verts']:
        v.co.x *= 0.100
        v.co.y = v.co.y * 0.012 - 2.015
        v.co.z = v.co.z * 0.040 + 0.240
    link_obj("F1_Rain_Lamp", bm_f1, aero_branch, mats["f1_fog_red"], bevel=0.001)

    # 3. Dual 90mm Polished Stainless Steel Exhaust Tips
    bm_pipes = bmesh.new()
    for side in [0.460, -0.460]:
        ret_pipe = bmesh.ops.create_cone(
            bm_pipes, cap_ends=True, segments=22,
            radius1=0.046, radius2=0.046, depth=0.170,
            matrix=Matrix.Rotation(math.radians(90.0), 3, 'X')
        )
        bmesh.ops.translate(bm_pipes, verts=ret_pipe['verts'], vec=Vector((side, -2.025, 0.210)))

        ret_bore = bmesh.ops.create_cone(
            bm_pipes, cap_ends=True, segments=18,
            radius1=0.038, radius2=0.038, depth=0.028,
            matrix=Matrix.Rotation(math.radians(90.0), 3, 'X')
        )
        bmesh.ops.translate(bm_pipes, verts=ret_bore['verts'], vec=Vector((side, -2.038, 0.210)))

    link_obj("Exhaust_Tips", bm_pipes, aero_branch, mats["exhaust_metal"], bevel=0.001)

    # 4. Aerodynamic Rear Roof Extension Spoiler
    bm_spoil = bmesh.new()
    ret_sp = bmesh.ops.create_cube(bm_spoil, size=1.0)
    for v in ret_sp['verts']:
        v.co.x *= 1.280
        v.co.y = v.co.y * 0.240 - 1.440
        v.co.z = v.co.z * 0.045 + 1.385
        if v.co.y < -1.440:
            v.co.z += 0.020  # Upward kick lip
    link_obj("Rear_Spoiler", bm_spoil, aero_branch, mats["wheel_black"], bevel=0.002)

    # 5. Rear Emblems: Toyota Crest, GR Logo & GR-FOUR Badge
    bm_remb = bmesh.new()
    # Rear Toyota Crest (Dead center under glass)
    ret_rt = bmesh.ops.create_cone(
        bm_remb, cap_ends=True, segments=18,
        radius1=0.030, radius2=0.030, depth=0.008,
        matrix=Matrix.Rotation(math.radians(90.0), 3, 'X')
    )
    for v in ret_rt['verts']:
        v.co.x *= 1.55
    bmesh.ops.translate(bm_remb, verts=ret_rt['verts'], vec=Vector((0.0, -2.006, 0.815)))
    link_obj("Rear_Toyota_Emblem", bm_remb, body_branch, mats["chrome"], bevel=0.001)

    # GR Red Badge (Right side of tailgate)
    bm_rgr = bmesh.new()
    ret_rgr = bmesh.ops.create_cube(bm_rgr, size=1.0)
    for v in ret_rgr['verts']:
        v.co.x = v.co.x * 0.060 + 0.280
        v.co.y = v.co.y * 0.008 - 2.008
        v.co.z = v.co.z * 0.026 + 0.815
    link_obj("Rear_Badges", bm_rgr, body_branch, mats["gr_red"], bevel=0.001)


# ----------------------------------------------------------------------------
# 7. HIGH-CLARITY DIELECTRIC GREENHOUSE GLASS (GLASS_BRANCH)
# ----------------------------------------------------------------------------
def build_gr_yaris_glass(glass_branch, mats):
    # 1. Raked Windshield with Ceramic Frit Perimeter
    bm_wind = bmesh.new()
    ws_rows = [
        [Vector(( 0.560,  0.380, 1.435)), Vector(( 0.0,  0.380, 1.450)), Vector((-0.560,  0.380, 1.435))],
        [Vector(( 0.650,  0.600, 1.140)), Vector(( 0.0,  0.600, 1.150)), Vector((-0.650,  0.600, 1.140))],
        [Vector(( 0.730,  0.820, 0.840)), Vector(( 0.0,  0.820, 0.850)), Vector((-0.730,  0.820, 0.840))],
    ]
    make_quad_grid(bm_wind, ws_rows)
    link_obj("Windshield", bm_wind, glass_branch, mats["glass"], bevel=0.0)

    # 2. Slanted Rear Hatch Glass (Watertight to C-pillars and Roof)
    bm_rear_g = bmesh.new()
    rg_rows = [
        [Vector(( 0.530, -1.355, 1.340)), Vector(( 0.0, -1.355, 1.354)), Vector((-0.530, -1.355, 1.340))],
        [Vector(( 0.545, -1.580, 1.120)), Vector(( 0.0, -1.580, 1.130)), Vector((-0.545, -1.580, 1.120))],
        [Vector(( 0.560, -1.780, 0.905)), Vector(( 0.0, -1.780, 0.915)), Vector((-0.560, -1.780, 0.905))],
    ]
    make_quad_grid(bm_rear_g, rg_rows)
    link_obj("Rear_Glass", bm_rear_g, glass_branch, mats["glass"], bevel=0.0)

    # 3. Contiguous 3-Door Side Windows & Rear Quarter Glass (Zero Voids along A-pillar)
    bm_side = bmesh.new()
    for sign in [1.0, -1.0]:
        side_glass_rows = [
            # Top contour along roof rail (A-pillar apex Y=0.380 down to quarter apex Y=-1.250)
            [
                Vector((sign * 0.585,  0.380, 1.430)),
                Vector((sign * 0.590,  0.000, 1.440)),
                Vector((sign * 0.585, -0.400, 1.435)),
                Vector((sign * 0.565, -0.700, 1.420)),
                Vector((sign * 0.545, -1.050, 1.385)),
                Vector((sign * 0.530, -1.250, 1.345)),
            ],
            # Mid window glass (connecting slanted A-pillar at Y=0.600 to B-pillar and quarter glass)
            [
                Vector((sign * 0.672,  0.600, 1.135)),
                Vector((sign * 0.675,  0.000, 1.135)),
                Vector((sign * 0.670, -0.400, 1.135)),
                Vector((sign * 0.660, -0.700, 1.140)),
                Vector((sign * 0.640, -1.050, 1.145)),
                Vector((sign * 0.615, -1.250, 1.150)),
            ],
            # Bottom waistline beltline (from A-pillar base Y=0.820 back to swept-upward quarter corner Y=-1.250)
            [
                Vector((sign * 0.760,  0.820, 0.840)),
                Vector((sign * 0.770,  0.000, 0.840)),
                Vector((sign * 0.765, -0.400, 0.845)),
                Vector((sign * 0.760, -0.700, 0.850)),
                Vector((sign * 0.740, -1.050, 0.880)),
                Vector((sign * 0.705, -1.250, 0.940)),
            ],
        ]
        make_quad_grid(bm_side, side_glass_rows, invert_normals=(sign < 0))

    link_obj("Side_Greenhouse_Glass", bm_side, glass_branch, mats["glass"], bevel=0.0)


# ----------------------------------------------------------------------------
# 8. LIGHTING OPTICS: TRIPLE-LED HEADLAMPS & CONTINUOUS REAR LIGHT-BAR
# ----------------------------------------------------------------------------
def build_gr_yaris_lighting(body_branch, mats):
    # 1. Triple-LED Projector Headlamps with Aggressive L-Shaped DRL Brows
    for is_left in [True, False]:
        sign = 1.0 if is_left else -1.0
        side_tag = "L" if is_left else "R"

        bm_h_house = bmesh.new()
        # Dark Technical Internal Housing
        ret_bg = bmesh.ops.create_cube(bm_h_house, size=1.0)
        for v in ret_bg['verts']:
            v.co.x = v.co.x * 0.350 + sign * 0.540
            v.co.y = v.co.y * 0.160 + 1.860
            v.co.z = v.co.z * 0.095 + 0.635

        # Triple Projector LED Array
        for p_idx, (px, py, pz) in enumerate([(0.520, 1.940, 0.635), (0.430, 1.965, 0.640), (0.610, 1.915, 0.630)]):
            ret_proj = bmesh.ops.create_cone(bm_h_house, cap_ends=True, segments=16, radius1=0.038, radius2=0.024, depth=0.035)
            bmesh.ops.rotate(bm_h_house, verts=ret_proj['verts'], matrix=Matrix.Rotation(math.radians(-90.0), 3, 'X'))
            bmesh.ops.translate(bm_h_house, verts=ret_proj['verts'], vec=Vector((sign * px, py, pz)))

            ret_bulb = bmesh.ops.create_icosphere(bm_h_house, subdivisions=2, radius=0.014)
            bmesh.ops.translate(bm_h_house, verts=ret_bulb['verts'], vec=Vector((sign * px, py + 0.012, pz)))

        # Sharp White L-Shaped DRL Brow along Top and Outer Edge
        ret_drl = bmesh.ops.create_cube(bm_h_house, size=1.0)
        for v in ret_drl['verts']:
            v.co.x = v.co.x * 0.220 + sign * 0.530
            v.co.y = v.co.y * 0.080 + 1.920
            v.co.z = v.co.z * 0.012 + 0.670

        link_obj(f"Headlamp_Housing_{side_tag}", bm_h_house, body_branch, mats["headlamp_reflector"], bevel=0.001)

        # Polycarbonate Aerodynamic Outer Lens
        bm_lens = bmesh.new()
        hl_rows = [
            [Vector((sign * 0.375, 2.002, 0.675)), Vector((sign * 0.550, 1.970, 0.675)), Vector((sign * 0.730, 1.910, 0.670))],
            [Vector((sign * 0.375, 2.006, 0.635)), Vector((sign * 0.555, 1.975, 0.635)), Vector((sign * 0.735, 1.915, 0.630))],
            [Vector((sign * 0.375, 2.002, 0.580)), Vector((sign * 0.550, 1.970, 0.580)), Vector((sign * 0.730, 1.910, 0.580))],
        ]
        make_quad_grid(bm_lens, hl_rows, invert_normals=(sign < 0))
        link_obj(f"Headlamp_Lens_{side_tag}", bm_lens, body_branch, mats["headlamp_glass"], bevel=0.0)

    # 2. Modern Full-Width Continuous Rear LED Light-Bar
    bm_tail = bmesh.new()
    # Central Connecting LED Light-Bar bridging across the hatch
    ret_bar = bmesh.ops.create_cube(bm_tail, size=1.0)
    for v in ret_bar['verts']:
        v.co.x *= 1.480
        v.co.y = v.co.y * 0.020 - 1.998
        v.co.z = v.co.z * 0.038 + 0.815

    # Angular Outboard Wrap-Around C-Clusters (Left & Right)
    for sign in [1.0, -1.0]:
        tl_rows = [
            [Vector((sign * 0.560, -1.995, 0.840)), Vector((sign * 0.730, -1.990, 0.840)), Vector((sign * 0.765, -1.840, 0.835))],
            [Vector((sign * 0.540, -2.000, 0.815)), Vector((sign * 0.735, -1.995, 0.815)), Vector((sign * 0.770, -1.840, 0.815))],
            [Vector((sign * 0.560, -1.995, 0.790)), Vector((sign * 0.730, -1.990, 0.790)), Vector((sign * 0.765, -1.840, 0.790))],
        ]
        make_quad_grid(bm_tail, tl_rows, invert_normals=(sign < 0))

    link_obj("Full_Width_Taillights", bm_tail, body_branch, mats["tail_red"], bevel=0.002)


# ----------------------------------------------------------------------------
# 9. EXTERIOR JEWELRY: MIRRORS, HANDLES & FUEL FLAP
# ----------------------------------------------------------------------------
def build_gr_yaris_jewelry(body_branch, mats):
    bm_jewel = bmesh.new()
    for side in [1.0, -1.0]:
        # Gloss Black Aerodynamic Exterior Mirrors with Integrated LED Turn Repeaters
        ret_m = bmesh.ops.create_cube(bm_jewel, size=1.0)
        for v in ret_m['verts']:
            v.co.x = v.co.x * 0.130 + side * 0.860
            v.co.y = v.co.y * 0.150 + 0.580
            v.co.z = v.co.z * 0.075 + 0.930

        ret_stk = bmesh.ops.create_cube(bm_jewel, size=1.0)
        for v in ret_stk['verts']:
            v.co.x = v.co.x * 0.055 + side * 0.785
            v.co.y = v.co.y * 0.035 + 0.600
            v.co.z = v.co.z * 0.028 + 0.890

        # Frameless Door Handle
        ret_dh = bmesh.ops.create_cube(bm_jewel, size=1.0)
        for v in ret_dh['verts']:
            v.co.x = v.co.x * 0.022 + side * 0.905
            v.co.y = v.co.y * 0.130 + 0.050
            v.co.z = v.co.z * 0.028 + 0.820

    # Circular Fuel Filler Flap (Left Rear Blistered Flank)
    ret_flap = bmesh.ops.create_cone(
        bm_jewel, cap_ends=True, segments=18,
        radius1=0.048, radius2=0.048, depth=0.006,
        matrix=Matrix.Rotation(math.radians(90.0), 3, 'Y')
    )
    bmesh.ops.translate(bm_jewel, verts=ret_flap['verts'], vec=Vector((0.910, -1.350, 0.860)))

    link_obj("Exterior_Jewelry", bm_jewel, body_branch, mats["paint"], bevel=0.002)


# ----------------------------------------------------------------------------
# 10. RECARO SPORT COCKPIT & PERFORMANCE INTERIOR (INTERIOR_BRANCH)
# ----------------------------------------------------------------------------
def build_gr_yaris_interior(interior_branch, mats):
    # 1. GR High-Bolstered Motorsport Bucket Seats with Red Contrast Stitching
    bm_seat = bmesh.new()
    for sign in [0.380, -0.380]:
        ret_c = bmesh.ops.create_cube(bm_seat, size=1.0)
        for v in ret_c['verts']:
            v.co.x = v.co.x * 0.440 + sign
            v.co.y = v.co.y * 0.460 + 0.120
            v.co.z = v.co.z * 0.140 + 0.310

        ret_bk = bmesh.ops.create_cube(bm_seat, size=1.0)
        for v in ret_bk['verts']:
            v.co.x = v.co.x * 0.420 + sign
            v.co.y = v.co.y * 0.150 - 0.140
            v.co.z = v.co.z * 0.580 + 0.620
        bmesh.ops.rotate(bm_seat, verts=ret_bk['verts'], matrix=Matrix.Rotation(math.radians(-15.0), 3, 'X'))

        ret_hr = bmesh.ops.create_cube(bm_seat, size=1.0)
        for v in ret_hr['verts']:
            v.co.x = v.co.x * 0.220 + sign
            v.co.y = v.co.y * 0.110 - 0.220
            v.co.z = v.co.z * 0.170 + 1.000

    # Compact Rear Bench Seat
    ret_rb = bmesh.ops.create_cube(bm_seat, size=1.0)
    for v in ret_rb['verts']:
        v.co.x *= 1.280
        v.co.y = v.co.y * 0.440 - 0.750
        v.co.z = v.co.z * 0.480 + 0.560

    link_obj("Seats", bm_seat, interior_branch, mats["interior_dark"], bevel=0.004)

    # 2. Modern Dashboard, GR-FOUR Mode Dial & 6-Speed Shifter
    bm_dash = bmesh.new()
    ret_d = bmesh.ops.create_cube(bm_dash, size=1.0)
    for v in ret_d['verts']:
        v.co.x *= 1.380
        v.co.y = v.co.y * 0.360 + 0.560
        v.co.z = v.co.z * 0.240 + 0.740

    # Center 8-Inch Infotainment Screen
    ret_sc = bmesh.ops.create_cube(bm_dash, size=1.0)
    for v in ret_sc['verts']:
        v.co.x *= 0.240
        v.co.y = v.co.y * 0.040 + 0.540
        v.co.z = v.co.z * 0.120 + 0.900

    # GR Leather 3-Spoke Sport Steering Wheel
    ret_rim = bmesh.ops.create_cone(
        bm_dash, cap_ends=True, segments=20,
        radius1=0.170, radius2=0.154, depth=0.024
    )
    bmesh.ops.rotate(bm_dash, verts=ret_rim['verts'], matrix=Matrix.Rotation(math.radians(-25.0), 3, 'X'))
    bmesh.ops.translate(bm_dash, verts=ret_rim['verts'], vec=Vector((0.380, 0.340, 0.780)))

    # Raised 6-Speed Rally Manual Shift Lever with GR-FOUR Rotary Mode Selector
    ret_knob = bmesh.ops.create_icosphere(bm_dash, subdivisions=2, radius=0.024)
    bmesh.ops.translate(bm_dash, verts=ret_knob['verts'], vec=Vector((0.0, 0.160, 0.540)))

    link_obj("Dashboard", bm_dash, interior_branch, mats["interior_dark"], bevel=0.003)


# ----------------------------------------------------------------------------
# 11. UNDERBODY PLATFORM & GR-FOUR AWD POWERTRAIN (PLATFORM_BRANCH)
# ----------------------------------------------------------------------------
def build_gr_yaris_platform(platform_branch, mats, f_axle, r_axle):
    bm = bmesh.new()

    # Chassis Floor & Driveshaft Tunnel
    ret_fl = bmesh.ops.create_cube(bm, size=1.0)
    for v in ret_fl['verts']:
        v.co.x *= 1.380
        v.co.y = v.co.y * 3.400 + 0.000
        v.co.z = v.co.z * 0.045 + 0.130

    # Transverse G16E-GTS 1.6L Turbo 3-Cylinder Engine Cradle (Front)
    ret_f_sub = bmesh.ops.create_cube(bm, size=1.0)
    for v in ret_f_sub['verts']:
        v.co.x *= 1.340
        v.co.y = v.co.y * 0.520 + f_axle
        v.co.z = v.co.z * 0.120 + 0.180

    # GR-FOUR Multi-Plate Clutch AWD Rear Differential Unit (Rear)
    ret_rdu = bmesh.ops.create_cube(bm, size=1.0)
    for v in ret_rdu['verts']:
        v.co.x *= 0.580
        v.co.y = v.co.y * 0.360 + r_axle
        v.co.z = v.co.z * 0.140 + 0.220

    link_obj("Chassis", bm, platform_branch, mats["chassis_dark"], bevel=0.002)


# ----------------------------------------------------------------------------
# 12. MASTER BUILDER PIPELINE & GLB EXPORT
# ----------------------------------------------------------------------------
def build_toyota_gr_yaris_master():
    print("================================================================================")
    print("PURGING SCENE & BUILDING TOYOTA GR YARIS (2020+) FROM SCRATCH")
    print("================================================================================")

    # 1. Complete scene purge
    bpy.ops.wm.read_factory_settings(use_empty=True)

    # 2. Build root vehicle hierarchy
    root = bpy.data.objects.new("Toyota_GR_Yaris_Root", None)
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
    mats = create_gr_yaris_materials()

    # 4. Wheelbase & Tracks
    f_axle = 1.280
    r_axle = -1.280
    half_f_track = 0.7675
    half_r_track = 0.7825
    wheel_z = 0.318

    # 5. Build Wheels & Brakes
    print("[GR_YARIS_BUILDER] Constructing 18-inch Forged BBS Alloys & Red GR Calipers...")
    build_gr_yaris_wheel(wheels_branch, mats, "Wheel_FL", Vector(( half_f_track, f_axle, wheel_z)), is_left=True)
    build_gr_yaris_wheel(wheels_branch, mats, "Wheel_FR", Vector((-half_f_track, f_axle, wheel_z)), is_left=False)
    build_gr_yaris_wheel(wheels_branch, mats, "Wheel_RL", Vector(( half_r_track, r_axle, wheel_z)), is_left=True)
    build_gr_yaris_wheel(wheels_branch, mats, "Wheel_RR", Vector((-half_r_track, r_axle, wheel_z)), is_left=False)

    # 6. Build Monocoque Body
    print("[GR_YARIS_BUILDER] Sculpting Class-A Monocoque, WRC Blister Flares & Carbon Roof...")
    build_gr_yaris_monocoque(body_branch, aero_branch, mats, f_axle, r_axle)

    # 7. Build Front Fascia, Grille & Splitter
    print("[GR_YARIS_BUILDER] Assembling Massive GR Intercooler Mouth, Splitter & Canards...")
    build_gr_yaris_front_fascia(body_branch, aero_branch, mats)

    # 8. Build Rear Fascia, Diffuser & Exhausts
    print("[GR_YARIS_BUILDER] Assembling Rear Diffuser, Dual Exhausts & Roof Spoiler...")
    build_gr_yaris_rear_fascia(body_branch, aero_branch, mats)

    # 9. Build Greenhouse Glass
    print("[GR_YARIS_BUILDER] Installing Frameless Dielectric Safety Glass...")
    build_gr_yaris_glass(glass_branch, mats)

    # 10. Build Lighting Optics
    print("[GR_YARIS_BUILDER] Assembling Triple-LED Projectors & Continuous Light-Bar...")
    build_gr_yaris_lighting(body_branch, mats)

    # 11. Build Exterior Jewelry
    print("[GR_YARIS_BUILDER] Installing Exterior Mirrors, Door Handles & Fuel Flap...")
    build_gr_yaris_jewelry(body_branch, mats)

    # 12. Build Interior
    print("[GR_YARIS_BUILDER] Installing GR Sport Seats & Rally 6-Speed Cockpit...")
    build_gr_yaris_interior(interior_branch, mats)

    # 13. Build Underbody Platform
    print("[GR_YARIS_BUILDER] Assembling Platform, G16E-GTS Cradle & GR-FOUR RDU...")
    build_gr_yaris_platform(platform_branch, mats, f_axle, r_axle)

    # 14. Export Dual-Mode GLBs
    export_paths = [
        r"E:\Car_Automation\public\models\vehicles\hatchback\2020s\vehicle.glb",
        r"E:\Car_Automation\public\models\Car_Toyota_GR_Yaris_2020s.glb",
        r"E:\Car_Automation\exports\Car_Toyota_GR_Yaris_2020s.glb",
    ]
    for p in export_paths:
        os.makedirs(os.path.dirname(p), exist_ok=True)
        print(f"[GR_YARIS_BUILDER] Exporting GLB -> {p}...")
        bpy.ops.export_scene.gltf(
            filepath=p,
            export_format='GLB',
            use_selection=False,
            export_apply=True,
            export_yup=True
        )
        print(f"[GR_YARIS_BUILDER] Saved: {p} ({os.path.getsize(p) / 1024:.1f} KB)")

    print("================================================================================")
    print("TOYOTA GR YARIS BUILD COMPLETE — GLBS EXPORTED SUCCESSFULLY")
    print("================================================================================")


if __name__ == "__main__":
    build_toyota_gr_yaris_master()
