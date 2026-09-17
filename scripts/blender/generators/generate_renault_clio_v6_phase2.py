"""
Procedural Class-A CAD Generator: Renault Clio V6 Phase 2 (2000s Hatchback)
=============================================================================
2000s Hatchback Flagship — The Ultimate Mid-Engine Widebody Hot-Hatch Phenomenon
Adheres strictly to the Maximum Visual Quality & Intensive CAD Mesh Standard.

Factory Engineering Specifications:
- Wheelbase: 2,510 mm (Front Axle Y = +1.255 m, Rear Axle Y = -1.255 m)
- Overall Length: 3,841 mm (Y from -1.9205 m to +1.9205 m)
- Overall Width: 1,830 mm (Waistline at blister flares X = +/- 0.915 m)
- Overall Height: 1,356 mm (Roof crown Z = 1.356 m)
- Track Width: Front 1,520 mm (X = +/- 0.760 m), Rear 1,550 mm (X = +/- 0.775 m)
- Ground Clearance: 105 mm (Sill base Z = 0.105 m)
- Staggered Wheels & Tires: 18-inch OZ Superturismo Multi-Spoke Alloys
  - Front: 205/40 R18 Michelin Pilot Sport (R=0.311m, W=0.205m)
  - Rear:  245/40 R18 Michelin Pilot Sport (R=0.327m, W=0.245m)
- Powertrain: Mid-Engine 3.0L 24V naturally aspirated V6 (L7X 727, 255 PS / 252 hp, 300 Nm)
  mounted transversely behind the driver's seats with visible aluminum plenum.
- Aerodynamics: Deep front chin splitter, massive side ram-air scoops, high-downforce
  roof wing, and rear aerodynamic diffuser with dual center-exit chrome exhaust tips.

Exports:
- public/models/vehicles/hatchback/2000s/vehicle.glb
- public/models/Car_Renault_Clio_V6_Phase2_2000s.glb
- exports/Car_Renault_Clio_V6_Phase2_2000s.glb
=============================================================================
"""

import bpy
import bmesh
import math
import os
import shutil
from mathutils import Vector, Matrix, Euler

try:
    CURRENT_FILE = __file__
except NameError:
    CURRENT_FILE = r"E:\Car_Automation\scripts\blender\generators\generate_renault_clio_v6_phase2.py"

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(CURRENT_FILE), "..", "..", ".."))
PUBLIC_TARGET = os.path.join(ROOT_DIR, "public", "models", "vehicles", "hatchback", "2000s", "vehicle.glb")
PUBLIC_CAR_TARGET = os.path.join(ROOT_DIR, "public", "models", "Car_Renault_Clio_V6_Phase2_2000s.glb")
EXPORTS_DIR = os.path.join(ROOT_DIR, "exports", "Car_Renault_Clio_V6_Phase2_2000s.glb")

os.makedirs(os.path.dirname(PUBLIC_TARGET), exist_ok=True)
os.makedirs(os.path.dirname(PUBLIC_CAR_TARGET), exist_ok=True)
os.makedirs(os.path.dirname(EXPORTS_DIR), exist_ok=True)

# ----------------------------------------------------------------------------
# 1. PBR AUTOMOTIVE SHADER FACTORY
# ----------------------------------------------------------------------------
def make_pbr_mat(name, base_color, metallic=0.0, roughness=0.5, clearcoat=0.0,
                 transmission=0.0, ior=1.45, emission=None, emission_strength=1.0):
    mat = bpy.data.materials.get(name)
    if not mat:
        mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    tree = mat.node_tree
    tree.nodes.clear()

    out = tree.nodes.new('ShaderNodeOutputMaterial')
    out.location = (400, 0)
    bsdf = tree.nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.location = (0, 0)

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

def create_clio_v6_materials():
    mats = {}
    # Bleu Iliade (Iliad Blue MV549) Electric Metallic Paint
    mats["paint"] = make_pbr_mat("M_Clio_BleuIliade", (0.024, 0.082, 0.540, 1.0), metallic=0.76, roughness=0.12, clearcoat=0.98)
    # Titanium Grey Side Intake Pods & Accents
    mats["titanium_pods"] = make_pbr_mat("M_Clio_TitaniumPods", (0.440, 0.460, 0.480, 1.0), metallic=0.70, roughness=0.24, clearcoat=0.45)
    # OZ Superturismo Radiant Silver Wheel Alloy
    mats["wheel_silver"] = make_pbr_mat("M_Clio_OZSilver", (0.86, 0.87, 0.89, 1.0), metallic=0.88, roughness=0.14, clearcoat=0.80)
    # Mirror Chrome Renault Diamond Badges & Exhaust Tips
    mats["chrome"] = make_pbr_mat("M_Clio_MirrorChrome", (0.95, 0.95, 0.96, 1.0), metallic=0.98, roughness=0.04)
    # Polished Stainless Steel Center Exhaust Tips
    mats["exhaust_metal"] = make_pbr_mat("M_Clio_ExhaustMetal", (0.88, 0.88, 0.90, 1.0), metallic=0.95, roughness=0.12)
    mats["exhaust_inner"] = make_pbr_mat("M_Clio_ExhaustInner", (0.015, 0.015, 0.015, 1.0), metallic=0.20, roughness=0.88)
    # Dark Honeycomb & Wire Intake Mesh
    mats["intake_mesh"] = make_pbr_mat("M_Clio_IntakeMesh", (0.035, 0.035, 0.038, 1.0), metallic=0.60, roughness=0.45)
    # Satin Black Aerodynamic Diffuser & Lower Splitters
    mats["trim_dark"] = make_pbr_mat("M_Clio_TrimDark", (0.024, 0.024, 0.026, 1.0), metallic=0.15, roughness=0.65)
    # Michelin Pilot Sport High-Performance Tire Rubber
    mats["tire_rubber"] = make_pbr_mat("M_Clio_PilotSportRubber", (0.022, 0.022, 0.024, 1.0), metallic=0.01, roughness=0.72)
    # 330mm Cross-Drilled Ventilated Brake Rotors
    mats["brake_metal"] = make_pbr_mat("M_Clio_BrakeIron", (0.45, 0.45, 0.47, 1.0), metallic=0.85, roughness=0.35)
    # AP Racing 4-Piston Silver/Grey Calipers
    mats["brake_caliper"] = make_pbr_mat("M_Clio_APRacingCaliper", (0.72, 0.74, 0.76, 1.0), metallic=0.75, roughness=0.25)
    # Mid-Mounted 3.0L V6 Cast Aluminum Intake Plenum (Brighter finish for crystal-clear window visibility)
    mats["engine_plenum"] = make_pbr_mat("M_Clio_EnginePlenum", (0.86, 0.87, 0.89, 1.0), metallic=0.85, roughness=0.22)
    mats["engine_accent"] = make_pbr_mat("M_Clio_EngineAccent", (0.85, 0.06, 0.06, 1.0), metallic=0.40, roughness=0.18)
    mats["strut_brace"] = make_pbr_mat("M_Clio_StrutBrace", (0.95, 0.95, 0.96, 1.0), metallic=0.96, roughness=0.08)
    # Clear Polycarbonate Aerodynamic Headlamp Covers
    mats["headlamp_glass"] = make_pbr_mat("M_Clio_HeadlampGlass", (0.96, 0.96, 0.98, 1.0), metallic=0.02, roughness=0.02, transmission=0.96, ior=1.52, clearcoat=1.0)
    # Chrome Multi-Reflector Headlamp Housing
    mats["headlamp_reflector"] = make_pbr_mat("M_Clio_HeadlampReflector", (0.97, 0.97, 0.98, 1.0), metallic=0.96, roughness=0.06)
    # Xenon Projector Core Beam
    mats["bulb_xenon"] = make_pbr_mat("M_Clio_BulbXenon", (0.90, 0.95, 1.0, 1.0), metallic=0.1, roughness=0.1, emission=(0.85, 0.94, 1.0, 1.0), emission_strength=25.0)
    # Amber Turn Indicator Glass
    mats["indicator_amber"] = make_pbr_mat("M_Clio_IndicatorAmber", (0.95, 0.50, 0.02, 1.0), metallic=0.05, roughness=0.12, transmission=0.70, ior=1.52)
    # Ruby Red Taillamp Optical Glass
    mats["tail_red"] = make_pbr_mat("M_Clio_TaillampRed", (0.85, 0.02, 0.02, 1.0), metallic=0.05, roughness=0.10, transmission=0.65, ior=1.52, emission=(0.85, 0.02, 0.02, 1.0), emission_strength=4.5)
    # Reverse Clear White Optical Glass
    mats["tail_white"] = make_pbr_mat("M_Clio_TaillampWhite", (0.92, 0.92, 0.94, 1.0), metallic=0.05, roughness=0.08, transmission=0.85, ior=1.50)
    # Fog Lamp Glass & Glow
    mats["fog_glass"] = make_pbr_mat("M_Clio_FogGlass", (0.95, 0.95, 0.95, 1.0), metallic=0.02, roughness=0.05, transmission=0.92, ior=1.50)
    mats["fog_bulb"] = make_pbr_mat("M_Clio_FogBulb", (1.0, 0.95, 0.85, 1.0), metallic=0.1, roughness=0.1, emission=(1.0, 0.95, 0.85, 1.0), emission_strength=18.0)
    # European White License Plate & Typography
    mats["license_plate"] = make_pbr_mat("M_Clio_LicensePlate", (0.95, 0.95, 0.95, 1.0), metallic=0.10, roughness=0.20)
    mats["plate_text"] = make_pbr_mat("M_Clio_PlateText", (0.02, 0.02, 0.02, 1.0), metallic=0.05, roughness=0.80)
    # Dark Charcoal / Alcantara Cockpit Fabric
    mats["interior_dark"] = make_pbr_mat("M_Clio_InteriorDark", (0.035, 0.035, 0.038, 1.0), metallic=0.02, roughness=0.85)
    mats["interior_blue"] = make_pbr_mat("M_Clio_InteriorBlue", (0.04, 0.12, 0.40, 1.0), metallic=0.02, roughness=0.80)
    mats["aluminum_shifter"] = make_pbr_mat("M_Clio_AluminumShifter", (0.88, 0.88, 0.90, 1.0), metallic=0.92, roughness=0.15)
    # High-Clarity Dielectric Optical Greenhouse Glass (Clean transparent view of mid-engine)
    mats["glass"] = make_pbr_mat("M_Clio_OpticalGlass", (0.92, 0.94, 0.96, 1.0), metallic=0.01, roughness=0.005, transmission=0.96, ior=1.52, clearcoat=1.0)
    # Chassis Underside Belly Pan & Enclosed Wheel Tubs
    mats["chassis_dark"] = make_pbr_mat("M_Clio_ChassisDark", (0.025, 0.025, 0.027, 1.0), metallic=0.20, roughness=0.85)

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

def make_quad_grid(bm, rows):
    grid_verts = []
    for r in rows:
        row_v = [bm.verts.new(pt) for pt in r]
        grid_verts.append(row_v)
    for i in range(len(grid_verts) - 1):
        for j in range(len(grid_verts[i]) - 1):
            bm.faces.new((grid_verts[i][j], grid_verts[i+1][j], grid_verts[i+1][j+1], grid_verts[i][j+1]))


# ----------------------------------------------------------------------------
# 3. 18-INCH OZ SUPERTURISMO MULTI-SPOKE WHEELS & AP RACING BRAKES
# ----------------------------------------------------------------------------
def build_clio_v6_wheel(wheels_branch, mats, name, loc, is_left=True, is_rear=False):
    outer_sign = 1.0 if is_left else -1.0
    rim_r = 0.2286
    wheel_r = 0.327 if is_rear else 0.311
    tire_w = 0.245 if is_rear else 0.205
    half_tw = tire_w / 2.0
    segs = 32

    # 1. Michelin Pilot Sport Radial Tire with Realistic Curved Sidewalls
    bm_tire = bmesh.new()
    t_profiles = [
        (-half_tw * 0.88, rim_r * 1.01),
        (-half_tw * 1.08, (rim_r + wheel_r) * 0.48),
        (-half_tw * 0.95, wheel_r * 0.98),
        (0.0,             wheel_r * 1.00),
        ( half_tw * 0.95, wheel_r * 0.98),
        ( half_tw * 1.08, (rim_r + wheel_r) * 0.48),
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

    # 2. 18" OZ Superturismo Rim Barrel & Stepped Lip
    bm_rim = bmesh.new()
    rim_edge_x = half_tw * 0.84 * outer_sign
    inner_edge_x = -half_tw * 0.92 * outer_sign
    r_profiles = [
        (inner_edge_x,                       rim_r * 0.98),
        (rim_edge_x - 0.024 * outer_sign,   rim_r * 0.98),
        (rim_edge_x - 0.012 * outer_sign,   rim_r * 0.94),
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

    link_obj(f"Rim_Barrel_{name}", bm_rim, wheels_branch, mats["wheel_silver"], bevel=0.002)

    # 3. 16 Radiant Radial Spokes & Recessed Center Hub
    bm_face = bmesh.new()
    face_x = rim_edge_x - 0.010 * outer_sign
    spoke_r_out = rim_r * 0.91
    spoke_r_in = 0.068
    hub_x = face_x - 0.020 * outer_sign
    spoke_count = 16

    for sp in range(spoke_count):
        ang = 2.0 * math.pi * sp / spoke_count
        cos_a, sin_a = math.cos(ang), math.sin(ang)
        p_y = -sin_a * 0.008
        p_z =  cos_a * 0.008

        v1 = bm_face.verts.new(loc + Vector((face_x, sin_a * spoke_r_out + p_y, cos_a * spoke_r_out + p_z)))
        v2 = bm_face.verts.new(loc + Vector((face_x, sin_a * spoke_r_out - p_y, cos_a * spoke_r_out - p_z)))
        v3 = bm_face.verts.new(loc + Vector((hub_x,  sin_a * spoke_r_in - p_y * 1.2, cos_a * spoke_r_in - p_z * 1.2)))
        v4 = bm_face.verts.new(loc + Vector((hub_x,  sin_a * spoke_r_in + p_y * 1.2, cos_a * spoke_r_in + p_z * 1.2)))

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

    hub_rings = []
    hub_profiles = [
        (spoke_r_in, hub_x),
        (0.048,      hub_x - 0.012 * outer_sign),
        (0.038,      hub_x - 0.006 * outer_sign),
        (0.000,      hub_x - 0.004 * outer_sign),
    ]
    for hr, hx in hub_profiles:
        ring = []
        for s in range(16):
            ang = 2.0 * math.pi * s / 16
            pt = loc + Vector((hx, hr * math.sin(ang), hr * math.cos(ang)))
            ring.append(bm_face.verts.new(pt))
        hub_rings.append(ring)

    for i in range(len(hub_rings) - 1):
        for s in range(16):
            s_n = (s + 1) % 16
            if is_left:
                bm_face.faces.new((hub_rings[i][s], hub_rings[i+1][s], hub_rings[i+1][s_n], hub_rings[i][s_n]))
            else:
                bm_face.faces.new((hub_rings[i][s], hub_rings[i][s_n], hub_rings[i+1][s_n], hub_rings[i+1][s]))

    # Lug Bolts
    for b in range(5):
        b_ang = 2.0 * math.pi * b / 5
        by = math.sin(b_ang) * 0.054
        bz = math.cos(b_ang) * 0.054
        b_pos = loc + Vector((hub_x - 0.004 * outer_sign, by, bz))
        ret_bolt = bmesh.ops.create_cone(
            bm_face, cap_ends=True, segments=6,
            radius1=0.007, radius2=0.007, depth=0.016,
            matrix=Matrix.Rotation(math.radians(90.0), 3, 'Y')
        )
        bmesh.ops.translate(bm_face, verts=ret_bolt['verts'], vec=b_pos)

    link_obj(f"Wheel_Spokes_{name}", bm_face, wheels_branch, mats["wheel_silver"], bevel=0.002)

    # 4. Ventilated Disc & AP Racing Caliper
    bm_disc = bmesh.new()
    disc_r = 0.165 if not is_rear else 0.150
    disc_x = (half_tw * 0.22) * outer_sign
    d_segs = 24
    d_out = []
    d_in = []
    for s in range(d_segs):
        ang = 2.0 * math.pi * s / d_segs
        p_o = loc + Vector((disc_x, disc_r * math.cos(ang), disc_r * math.sin(ang)))
        p_i = loc + Vector((disc_x, 0.055 * math.cos(ang), 0.055 * math.sin(ang)))
        d_out.append(bm_disc.verts.new(p_o))
        d_in.append(bm_disc.verts.new(p_i))
    for s in range(d_segs):
        s_next = (s + 1) % d_segs
        if is_left:
            bm_disc.faces.new((d_in[s], d_out[s], d_out[s_next], d_in[s_next]))
        else:
            bm_disc.faces.new((d_in[s], d_in[s_next], d_out[s_next], d_out[s]))
    link_obj(f"BrakeDisc_{name}", bm_disc, wheels_branch, mats["brake_metal"], bevel=0.0)

    bm_cal = bmesh.new()
    ret_cal = bmesh.ops.create_cube(bm_cal, size=1.0)
    cal_center = loc + Vector((disc_x + 0.024 * outer_sign, 0.075, disc_r * 0.82))
    for v in ret_cal['verts']:
        v.co.x = v.co.x * 0.055 + cal_center.x
        v.co.y = v.co.y * 0.165 + cal_center.y
        v.co.z = v.co.z * 0.078 + cal_center.z
    link_obj(f"Caliper_{name}", bm_cal, wheels_branch, mats["brake_caliper"], bevel=0.003)


# ----------------------------------------------------------------------------
# 4. CLASS-A MONOCOQUE: WIDEBODY BLISTER FENDERS & AERO CABIN
# ----------------------------------------------------------------------------
def build_clio_v6_monocoque(body_branch, aero_branch, mats, f_axle, r_axle):
    bm = bmesh.new()

    arch_span_f = 0.355
    arch_span_r = 0.370
    z_arch_peak_f = 0.535
    z_arch_peak_r = 0.550
    base_sill = 0.105
    fz_waist = 0.770

    # Build clean dense longitudinal stations with smooth circular arch intervals
    f_arch_pts = []
    for a in range(11):
        ang = math.pi * a / 10.0
        f_arch_pts.append(round(f_axle + arch_span_f * math.cos(ang), 4))

    r_arch_pts = []
    for a in range(11):
        ang = math.pi * a / 10.0
        r_arch_pts.append(round(r_axle + arch_span_r * math.cos(ang), 4))

    raw_y = (
        [1.9205, 1.880, 1.820, 1.740, 1.660]
        + f_arch_pts
        + [0.820, 0.550, 0.250, -0.050, -0.350, -0.650, -0.850]
        + r_arch_pts
        + [-1.680, -1.780, -1.860, -1.9205]
    )
    clean_y = sorted(list(set(raw_y)), reverse=True)

    def get_station_profile(fy):
        fz_s = base_sill
        fz_w = fz_waist
        fw_bot = 0.760
        fw_w = 0.785

        # Front nose curvature
        if fy > 1.620:
            t = (fy - 1.620) / (1.9205 - 1.620)
            fw_w = 0.785 - 0.145 * (t ** 1.05)
            fw_bot = 0.760 - 0.170 * (t ** 1.05)
            fz_w = fz_waist - 0.135 * t
            fz_s = base_sill + 0.020 * t
        # Rear tail curvature
        elif fy < -1.620:
            t = (-fy - 1.620) / (1.9205 - 1.620)
            fw_w = 0.785 - 0.115 * (t ** 1.05)
            fw_bot = 0.760 - 0.135 * (t ** 1.05)
            fz_w = fz_waist - 0.035 * t
            fz_s = base_sill + 0.035 * t

        # Blistered widebody fender arches (1,830mm => half-width X = +/- 0.915m)
        d_f = abs(fy - f_axle)
        d_r = abs(fy - r_axle)
        if d_f < arch_span_f:
            norm_d = d_f / arch_span_f
            arch_lift = math.sqrt(max(0.0, 1.0 - norm_d * norm_d))
            z_sill = base_sill + (z_arch_peak_f - base_sill) * arch_lift
            x_sill = 0.900
            x_crease = 0.905
            x_waist = 0.880 + 0.025 * arch_lift
        elif d_r < arch_span_r:
            norm_d = d_r / arch_span_r
            arch_lift = math.sqrt(max(0.0, 1.0 - norm_d * norm_d))
            z_sill = base_sill + (z_arch_peak_r - base_sill) * arch_lift
            x_sill = 0.915
            x_crease = 0.915
            x_waist = 0.885 + 0.030 * arch_lift
        elif -0.880 <= fy <= -0.150:
            t_hip = (fy - (-0.880)) / (-0.150 - (-0.880))
            hip_swell = 0.820 + 0.090 * (1.0 - t_hip)
            z_sill = fz_s
            x_sill = fw_bot
            x_crease = hip_swell
            x_waist = hip_swell * 0.98
        else:
            z_sill = fz_s
            x_sill = fw_bot
            x_crease = fw_w * 0.97
            x_waist = fw_w

        z_crease = z_sill + (fz_w - z_sill) * 0.50
        z_waist = fz_w

        return (z_sill, x_sill, z_crease, x_crease, z_waist, x_waist)

    station_data = [(fy, get_station_profile(fy)) for fy in clean_y]
    num_pts = len(station_data)

    # 1. Left (+X) and Right (-X) Lower Body Flanks & Blister Fender Arches
    for side in [1.0, -1.0]:
        rows = []
        for i in range(num_pts):
            fy, prof = station_data[i]
            z_sill, x_sill, z_crease, x_crease, z_waist, x_waist = prof
            p_sill = Vector((side * x_sill, fy, z_sill))
            p_crease = Vector((side * x_crease, fy, z_crease))
            p_waist = Vector((side * x_waist, fy, z_waist))
            rows.append([p_sill, p_crease, p_waist])
        make_quad_grid(bm, rows if side > 0 else [[p for p in r] for r in rows])

    # 2. Sloping Aerodynamic Hood (Cowl Y=0.820 down to Nose Y=1.9205)
    hood_stations = [s for s in station_data if 0.820 <= s[0] <= 1.9205]
    hood_rows = []
    for fy, prof in hood_stations:
        z_waist = prof[4]
        x_waist = prof[5]
        hood_w = x_waist * 0.96
        # At the frontmost station (Y=1.9205), coordinate with bumper brow at Z=0.635
        if fy >= 1.910:
            z_edge = 0.635
            z_cl = 0.638
            z_c = 0.640
        else:
            z_edge = z_waist
            z_cl = z_waist + 0.012
            z_c = z_waist + 0.020
        p_l = Vector(( hood_w, fy, z_edge))
        p_cl = Vector(( hood_w * 0.48, fy, z_cl))
        p_c = Vector(( 0.0,    fy, z_c))
        p_cr = Vector((-hood_w * 0.48, fy, z_cl))
        p_r = Vector((-hood_w, fy, z_edge))
        hood_rows.append([p_l, p_cl, p_c, p_cr, p_r])
    make_quad_grid(bm, hood_rows)

    # 3. Aerodynamic Roof Panel
    roof_rows = [
        [Vector(( 0.550,  0.380, 1.340)), Vector(( 0.0,  0.380, 1.350)), Vector((-0.550,  0.380, 1.340))],
        [Vector(( 0.565,  0.050, 1.352)), Vector(( 0.0,  0.050, 1.356)), Vector((-0.565,  0.050, 1.352))],
        [Vector(( 0.565, -0.650, 1.348)), Vector(( 0.0, -0.650, 1.354)), Vector((-0.565, -0.650, 1.348))],
        [Vector(( 0.545, -1.320, 1.332)), Vector(( 0.0, -1.320, 1.338)), Vector((-0.545, -1.320, 1.332))],
    ]
    make_quad_grid(bm, roof_rows)

    # 4. Watertight Structural Greenhouse Pillars & Roof Rails
    for side in [1.0, -1.0]:
        ap = [
            [Vector((side * 0.740, 0.820, 0.770)), Vector((side * 0.680, 0.820, 0.770))],
            [Vector((side * 0.585, 0.380, 1.340)), Vector((side * 0.550, 0.380, 1.340))],
        ]
        make_quad_grid(bm, ap if side > 0 else [[p for p in r] for r in ap])

        rail = [
            [Vector((side * 0.550,  0.380, 1.340)), Vector((side * 0.590,  0.380, 1.340))],
            [Vector((side * 0.565, -0.450, 1.348)), Vector((side * 0.605, -0.450, 1.348))],
            [Vector((side * 0.545, -1.320, 1.332)), Vector((side * 0.585, -1.320, 1.332))],
        ]
        make_quad_grid(bm, rail if side > 0 else [[p for p in r] for r in rail])

        bp = [
            [Vector((side * 0.780, 0.050, 0.770)), Vector((side * 0.780, 0.000, 0.770))],
            [Vector((side * 0.580, 0.050, 1.350)), Vector((side * 0.580, 0.000, 1.350))],
        ]
        make_quad_grid(bm, bp if side > 0 else [[p for p in r] for r in bp])

        cp_sail = [
            [Vector((side * 0.790, -0.650, 0.770)), Vector((side * 0.585, -0.650, 1.348))],
            [Vector((side * 0.810, -1.050, 0.770)), Vector((side * 0.575, -1.050, 1.340))],
            [Vector((side * 0.785, -1.450, 0.760)), Vector((side * 0.565, -1.320, 1.250))],
            [Vector((side * 0.680, -1.920, 0.730)), Vector((side * 0.600, -1.920, 0.730))],
        ]
        make_quad_grid(bm, cp_sail if side > 0 else [[p for p in r] for r in cp_sail])

    # 5. Rear Tailgate Hatch Lid
    r_top = [
        [Vector(( 0.545, -1.320, 1.332)), Vector(( 0.0, -1.320, 1.338)), Vector((-0.545, -1.320, 1.332))],
        [Vector(( 0.510, -1.330, 1.325)), Vector(( 0.0, -1.330, 1.330)), Vector((-0.510, -1.330, 1.325))],
    ]
    make_quad_grid(bm, r_top)

    r_hatch = [
        [Vector(( 0.560, -1.680, 0.880)), Vector(( 0.0, -1.680, 0.890)), Vector((-0.560, -1.680, 0.880))],
        [Vector(( 0.640, -1.860, 0.740)), Vector(( 0.0, -1.860, 0.745)), Vector((-0.640, -1.860, 0.740))],
        [Vector(( 0.675, -1.920, 0.730)), Vector(( 0.0, -1.925, 0.735)), Vector((-0.675, -1.920, 0.730))],
    ]
    make_quad_grid(bm, r_hatch)

    # 6. Enclosed Inner Wheel Arch Tubs (Zero See-Through Voids)
    tub_r_f = 0.335
    tub_r_r = 0.350
    for ax_y, is_f, t_r in [(f_axle, True, tub_r_f), (r_axle, False, tub_r_r)]:
        track_w = 0.760 if is_f else 0.775
        for sign in [1.0, -1.0]:
            tub_pts = []
            for a_i in range(11):
                ang = math.pi * a_i / 10.0
                ty = ax_y - t_r * math.cos(ang)
                tz = 0.110 + t_r * math.sin(ang)
                tub_pts.append(Vector((sign * (track_w + 0.045), ty, tz)))
            tub_rows = [
                [p for p in tub_pts],
                [Vector((sign * 0.520, p.y, p.z)) for p in tub_pts],
            ]
            make_quad_grid(bm, tub_rows if sign > 0 else [[p for p in r] for r in tub_rows])

    # 7. Flat Underbody Belly Pan
    belly_pan = [
        [Vector(( 0.64,  1.92, 0.105)), Vector(( 0.0,  1.92, 0.105)), Vector((-0.64,  1.92, 0.105))],
        [Vector(( 0.76,  1.25, 0.105)), Vector(( 0.0,  1.25, 0.105)), Vector((-0.76,  1.25, 0.105))],
        [Vector(( 0.78,  0.00, 0.105)), Vector(( 0.0,  0.00, 0.105)), Vector((-0.78,  0.00, 0.105))],
        [Vector(( 0.77, -1.25, 0.105)), Vector(( 0.0, -1.25, 0.105)), Vector((-0.77, -1.25, 0.105))],
        [Vector(( 0.67, -1.92, 0.105)), Vector(( 0.0, -1.92, 0.105)), Vector((-0.67, -1.92, 0.105))],
    ]
    make_quad_grid(bm, belly_pan)

    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.002)
    link_obj("Cabin", bm, body_branch, mats["paint"], bevel=0.003)

    # -------------------------------------------------------------------------
    # 4.2 FRONT BUMPER & SCULPTED FASCIA (Front_Clip_Mesh)
    # Open headlight cradles (Z=0.540) and central raised beak (Z=0.640)
    # -------------------------------------------------------------------------
    bm_front = bmesh.new()

    # Center Nose Section (X = -0.320 to +0.320)
    center_fb = [
        # Upper brow meeting hood center flush
        [Vector(( 0.320, 1.9205, 0.635)), Vector(( 0.160, 1.924, 0.638)), Vector(( 0.0, 1.928, 0.640)), Vector((-0.160, 1.924, 0.638)), Vector((-0.320, 1.9205, 0.635))],
        # Twin grille shelf & diamond beak
        [Vector(( 0.325, 1.928,  0.550)), Vector(( 0.160, 1.933, 0.550)), Vector(( 0.0, 1.938, 0.550)), Vector((-0.160, 1.933, 0.550)), Vector((-0.325, 1.928,  0.550))],
        # Mid bumper impact ridge
        [Vector(( 0.335, 1.936,  0.440)), Vector(( 0.165, 1.940, 0.440)), Vector(( 0.0, 1.944, 0.440)), Vector((-0.165, 1.940, 0.440)), Vector((-0.335, 1.936,  0.440))],
        # Radiator mouth upper lip
        [Vector(( 0.330, 1.928,  0.320)), Vector(( 0.165, 1.932, 0.320)), Vector(( 0.0, 1.936, 0.320)), Vector((-0.165, 1.932, 0.320)), Vector((-0.330, 1.928,  0.320))],
        # Lower chin splitter base
        [Vector(( 0.315, 1.920,  0.135)), Vector(( 0.155, 1.922, 0.135)), Vector(( 0.0, 1.925, 0.135)), Vector((-0.155, 1.922, 0.135)), Vector((-0.315, 1.920,  0.135))],
    ]
    make_quad_grid(bm_front, center_fb)

    # Outer Bumper Flanks under Headlights (Left +X and Right -X)
    for sign in [1.0, -1.0]:
        outer_fb = [
            # Headlight cradle sill (Z=0.540)
            [Vector((sign * 0.640, 1.885, 0.540)), Vector((sign * 0.480, 1.910, 0.540)), Vector((sign * 0.320, 1.9205, 0.540))],
            # Bumper impact ridge
            [Vector((sign * 0.648, 1.890, 0.440)), Vector((sign * 0.490, 1.925, 0.440)), Vector((sign * 0.335, 1.936,  0.440))],
            # Fog lamp shelf
            [Vector((sign * 0.640, 1.885, 0.320)), Vector((sign * 0.485, 1.915, 0.320)), Vector((sign * 0.330, 1.928,  0.320))],
            # Lower chin base
            [Vector((sign * 0.620, 1.880, 0.135)), Vector((sign * 0.470, 1.910, 0.135)), Vector((sign * 0.315, 1.920,  0.135))],
        ]
        make_quad_grid(bm_front, outer_fb if sign > 0 else [list(reversed(r)) for r in outer_fb])

        # Vertical transition face between central beak (Z=0.635) and headlight cradle (Z=0.540)
        v_top = bm_front.verts.new(Vector((sign * 0.320, 1.9205, 0.635)))
        v_mid = bm_front.verts.new(Vector((sign * 0.325, 1.928,  0.550)))
        v_bot = bm_front.verts.new(Vector((sign * 0.320, 1.9205, 0.540)))
        if sign > 0:
            bm_front.faces.new((v_top, v_mid, v_bot))
        else:
            bm_front.faces.new((v_top, v_bot, v_mid))

    # Recessed black trapezoidal radiator intake mouth
    ret_in = bmesh.ops.create_cube(bm_front, size=1.0)
    for v in ret_in['verts']:
        v.co.x *= 0.640
        v.co.y = v.co.y * 0.035 + 1.915
        v.co.z = v.co.z * 0.120 + 0.225

    # Twin Upper Grille Recesses flanking central beak
    for sign in [1.0, -1.0]:
        ret_ug = bmesh.ops.create_cube(bm_front, size=1.0)
        for v in ret_ug['verts']:
            v.co.x = v.co.x * 0.110 + sign * 0.165
            v.co.y = v.co.y * 0.025 + 1.920
            v.co.z = v.co.z * 0.045 + 0.585

    bmesh.ops.remove_doubles(bm_front, verts=bm_front.verts, dist=0.002)
    link_obj("Front_Clip", bm_front, body_branch, mats["paint"], bevel=0.003)

    # Upper Grille Honeycomb Mesh Inserts
    bm_ug_mesh = bmesh.new()
    for sign in [1.0, -1.0]:
        ret_gm = bmesh.ops.create_cube(bm_ug_mesh, size=1.0)
        for v in ret_gm['verts']:
            v.co.x = v.co.x * 0.105 + sign * 0.165
            v.co.y = v.co.y * 0.012 + 1.924
            v.co.z = v.co.z * 0.040 + 0.585
    link_obj("Upper_Grille_Mesh", bm_ug_mesh, body_branch, mats["intake_mesh"], bevel=0.001)

    # Front Aerodynamic Chin Splitter Lip with End Winglets (Trim Dark)
    bm_splitter = bmesh.new()
    ret_lip = bmesh.ops.create_cube(bm_splitter, size=1.0)
    for v in ret_lip['verts']:
        v.co.x *= 1.480
        v.co.y = v.co.y * 0.050 + 1.928
        v.co.z = v.co.z * 0.028 + 0.120

    # Side Aero Winglets on Splitter
    for sign in [1.0, -1.0]:
        ret_wing = bmesh.ops.create_cube(bm_splitter, size=1.0)
        for v in ret_wing['verts']:
            v.co.x = v.co.x * 0.025 + sign * 0.740
            v.co.y = v.co.y * 0.080 + 1.915
            v.co.z = v.co.z * 0.060 + 0.150

    link_obj("Front_Splitter", bm_splitter, aero_branch, mats["trim_dark"], bevel=0.002)

    # Round Projector Fog Lamps in Bumper Recesses
    bm_fog = bmesh.new()
    bm_fog_glass = bmesh.new()
    for sign in [1.0, -1.0]:
        # Fog Lamp Recessed Housing
        ret_fh = bmesh.ops.create_cone(
            bm_fog, cap_ends=True, segments=16,
            radius1=0.040, radius2=0.032, depth=0.030,
            matrix=Matrix.Rotation(math.radians(-90.0), 3, 'X')
        )
        bmesh.ops.translate(bm_fog, verts=ret_fh['verts'], vec=Vector((sign * 0.520, 1.905, 0.260)))

        # Fog Lamp Glowing Bulb Core
        ret_fb = bmesh.ops.create_icosphere(bm_fog, subdivisions=2, radius=0.012)
        bmesh.ops.translate(bm_fog, verts=ret_fb['verts'], vec=Vector((sign * 0.520, 1.912, 0.260)))

        # Outer Protective Glass Lens
        ret_fl = bmesh.ops.create_cone(
            bm_fog_glass, cap_ends=True, segments=16,
            radius1=0.041, radius2=0.041, depth=0.008,
            matrix=Matrix.Rotation(math.radians(-90.0), 3, 'X')
        )
        bmesh.ops.translate(bm_fog_glass, verts=ret_fl['verts'], vec=Vector((sign * 0.520, 1.922, 0.260)))

    link_obj("Fog_Lamps", bm_fog, body_branch, mats["fog_bulb"], bevel=0.001)
    link_obj("Fog_Lenses", bm_fog_glass, body_branch, mats["fog_glass"], bevel=0.0)

    # Renault Chrome Diamond (Front Beak) - Centered at X=0.0
    bm_dia = bmesh.new()
    ret_dia = bmesh.ops.create_cube(bm_dia, size=1.0)
    for v in ret_dia['verts']:
        v.co.x *= 0.045
        v.co.y *= 0.012
        v.co.z *= 0.065
    bmesh.ops.rotate(bm_dia, verts=ret_dia['verts'], matrix=Matrix.Rotation(math.radians(45.0), 3, 'Y'))
    bmesh.ops.translate(bm_dia, verts=ret_dia['verts'], vec=Vector((0.0, 1.936, 0.585)))
    link_obj("Front_Renault_Diamond", bm_dia, body_branch, mats["chrome"], bevel=0.001)

    # -------------------------------------------------------------------------
    # 4.3 REAR BUMPER & DIFFUSER (Rear_Clip_Mesh)
    # Wraps seamlessly from corner to corner (X=±0.675, Y=-1.9205)
    # -------------------------------------------------------------------------
    bm_rear = bmesh.new()
    rb_rows = [
        # Upper Bumper Shelf directly under tailgate hatch (Z=0.730)
        [Vector(( 0.675, -1.9205, 0.730)), Vector(( 0.340, -1.928, 0.730)), Vector(( 0.0, -1.932, 0.730)), Vector((-0.340, -1.928, 0.730)), Vector((-0.675, -1.9205, 0.730))],
        # Mid Bumper Impact Ridge / License Plate Deck (Z=0.540)
        [Vector(( 0.670, -1.922, 0.540)), Vector(( 0.340, -1.930, 0.540)), Vector(( 0.0, -1.935, 0.540)), Vector((-0.340, -1.930, 0.540)), Vector((-0.670, -1.922, 0.540))],
        # Lower Diffuser Upper Shelf (Z=0.340)
        [Vector(( 0.660, -1.918, 0.340)), Vector(( 0.330, -1.925, 0.340)), Vector(( 0.0, -1.930, 0.340)), Vector((-0.330, -1.925, 0.340)), Vector((-0.660, -1.918, 0.340))],
        # Diffuser Base Edge (Z=0.105)
        [Vector(( 0.640, -1.915, 0.105)), Vector(( 0.320, -1.922, 0.105)), Vector(( 0.0, -1.925, 0.105)), Vector((-0.320, -1.922, 0.105)), Vector((-0.640, -1.915, 0.105))],
    ]
    make_quad_grid(bm_rear, rb_rows)

    # Recessed license plate pocket
    ret_lp = bmesh.ops.create_cube(bm_rear, size=1.0)
    for v in ret_lp['verts']:
        v.co.x *= 0.440
        v.co.y = v.co.y * 0.030 - 1.915
        v.co.z = v.co.z * 0.140 + 0.520

    bmesh.ops.remove_doubles(bm_rear, verts=bm_rear.verts, dist=0.002)
    link_obj("Rear_Clip", bm_rear, body_branch, mats["paint"], bevel=0.003)

    # European White License Plate & Text
    bm_plate = bmesh.new()
    ret_pl = bmesh.ops.create_cube(bm_plate, size=1.0)
    for v in ret_pl['verts']:
        v.co.x *= 0.420
        v.co.y = v.co.y * 0.004 - 1.924
        v.co.z = v.co.z * 0.110 + 0.525
    link_obj("Rear_License_Plate", bm_plate, body_branch, mats["license_plate"], bevel=0.001)

    # Rear License Plate White Illumination Lamps
    bm_pl_lights = bmesh.new()
    for sign in [0.120, -0.120]:
        ret_pll = bmesh.ops.create_cube(bm_pl_lights, size=1.0)
        for v in ret_pll['verts']:
            v.co.x = v.co.x * 0.040 + sign
            v.co.y = v.co.y * 0.010 - 1.922
            v.co.z = v.co.z * 0.015 + 0.595
    link_obj("License_Plate_Lights", bm_pl_lights, body_branch, mats["tail_white"], bevel=0.001)

    # Rear Aerodynamic Diffuser & Dual Center Exhausts
    bm_diff = bmesh.new()
    ret_df = bmesh.ops.create_cube(bm_diff, size=1.0)
    for v in ret_df['verts']:
        v.co.x *= 1.280
        v.co.y = v.co.y * 0.080 - 1.905
        v.co.z = v.co.z * 0.080 + 0.180

    for dx in [0.220, -0.220, 0.440, -0.440]:
        ret_st = bmesh.ops.create_cube(bm_diff, size=1.0)
        for v in ret_st['verts']:
            v.co.x = v.co.x * 0.018 + dx
            v.co.y = v.co.y * 0.120 - 1.905
            v.co.z = v.co.z * 0.070 + 0.170

    # Dual Center-Exit Polished Chrome Exhaust Tips
    for side in [0.065, -0.065]:
        ret_pipe = bmesh.ops.create_cone(
            bm_diff, cap_ends=True, segments=20,
            radius1=0.040, radius2=0.040, depth=0.180,
            matrix=Matrix.Rotation(math.radians(90.0), 3, 'X')
        )
        bmesh.ops.translate(bm_diff, verts=ret_pipe['verts'], vec=Vector((side, -1.935, 0.220)))

        ret_bore = bmesh.ops.create_cone(
            bm_diff, cap_ends=True, segments=16,
            radius1=0.033, radius2=0.033, depth=0.020,
            matrix=Matrix.Rotation(math.radians(90.0), 3, 'X')
        )
        bmesh.ops.translate(bm_diff, verts=ret_bore['verts'], vec=Vector((side, -1.942, 0.220)))

    link_obj("Diffuser", bm_diff, aero_branch, mats["exhaust_metal"], bevel=0.001)

    # -------------------------------------------------------------------------
    # 4.4 TITANIUM SIDE RAM-AIR INTAKE PODS (Organic Sculpted Air Scoops)
    # -------------------------------------------------------------------------
    bm_pods = bmesh.new()
    bm_mesh_intake = bmesh.new()

    for side in [1.0, -1.0]:
        pod_rings = []
        pod_stations = [
            (-0.180, 0.075, 0.440, side * 0.810, 0.510),
            (-0.280, 0.095, 0.450, side * 0.850, 0.515),
            (-0.450, 0.110, 0.460, side * 0.890, 0.520),
            (-0.620, 0.095, 0.450, side * 0.910, 0.525),
            (-0.780, 0.060, 0.420, side * 0.905, 0.525),
        ]
        for fy, pw, ph, cx, cz in pod_stations:
            p_top_in  = Vector((cx - side * pw * 0.4, fy, cz + ph * 0.5))
            p_top_out = Vector((cx + side * pw * 0.6, fy, cz + ph * 0.45))
            p_mid_out = Vector((cx + side * pw * 0.65, fy, cz))
            p_bot_out = Vector((cx + side * pw * 0.6, fy, cz - ph * 0.45))
            p_bot_in  = Vector((cx - side * pw * 0.4, fy, cz - ph * 0.5))
            pod_rings.append([p_top_in, p_top_out, p_mid_out, p_bot_out, p_bot_in])

        make_quad_grid(bm_pods, pod_rings if side > 0 else [list(reversed(r)) for r in pod_rings])

        # Horizontal titanium aerodynamic splitter strake in scoop mouth
        ret_vane = bmesh.ops.create_cube(bm_pods, size=1.0)
        for v in ret_vane['verts']:
            v.co.x = v.co.x * 0.080 + side * 0.840
            v.co.y = v.co.y * 0.280 - 0.320
            v.co.z = v.co.z * 0.016 + 0.515

        # Recessed dark honeycomb mesh screen inside intake cavity
        ret_im = bmesh.ops.create_cube(bm_mesh_intake, size=1.0)
        for v in ret_im['verts']:
            v.co.x = v.co.x * 0.015 + side * 0.805
            v.co.y = v.co.y * 0.160 - 0.280
            v.co.z = v.co.z * 0.400 + 0.515

    bmesh.ops.remove_doubles(bm_pods, verts=bm_pods.verts, dist=0.002)
    link_obj("Side_Ram_Air_Pods", bm_pods, body_branch, mats["titanium_pods"], bevel=0.003)
    link_obj("Side_Intake_Mesh", bm_mesh_intake, body_branch, mats["intake_mesh"], bevel=0.001)

    # High-Downforce Rear Roof Spoiler Wing
    bm_spoil = bmesh.new()
    ret_w = bmesh.ops.create_cube(bm_spoil, size=1.0)
    for v in ret_w['verts']:
        v.co.x *= 1.220
        v.co.y = v.co.y * 0.160 - 1.440
        v.co.z = v.co.z * 0.030 + 1.350
    bmesh.ops.rotate(bm_spoil, verts=ret_w['verts'], matrix=Matrix.Rotation(math.radians(8.0), 3, 'X'))
    link_obj("Rear_Spoiler", bm_spoil, aero_branch, mats["paint"], bevel=0.003)

    # Exterior Mirrors & Door Handles
    bm_doors = bmesh.new()
    for side in [1.0, -1.0]:
        ret_m = bmesh.ops.create_cube(bm_doors, size=1.0)
        for v in ret_m['verts']:
            v.co.x = v.co.x * 0.140 + side * 0.860
            v.co.y = v.co.y * 0.150 + 0.620
            v.co.z = v.co.z * 0.080 + 0.860

        ret_stk = bmesh.ops.create_cube(bm_doors, size=1.0)
        for v in ret_stk['verts']:
            v.co.x = v.co.x * 0.060 + side * 0.780
            v.co.y = v.co.y * 0.040 + 0.640
            v.co.z = v.co.z * 0.030 + 0.820

        ret_dh = bmesh.ops.create_cube(bm_doors, size=1.0)
        for v in ret_dh['verts']:
            v.co.x = v.co.x * 0.022 + side * 0.785
            v.co.y = v.co.y * 0.130 + 0.220
            v.co.z = v.co.z * 0.032 + 0.750

    link_obj("Doors", bm_doors, body_branch, mats["paint"], bevel=0.002)

    # Rear Renault Diamond Badge - Centered at X=0.0
    bm_rbad = bmesh.new()
    ret_rb = bmesh.ops.create_cube(bm_rbad, size=1.0)
    for v in ret_rb['verts']:
        v.co.x *= 0.038
        v.co.y *= 0.010
        v.co.z *= 0.055
    bmesh.ops.rotate(bm_rbad, verts=ret_rb['verts'], matrix=Matrix.Rotation(math.radians(45.0), 3, 'Y'))
    bmesh.ops.translate(bm_rbad, verts=ret_rb['verts'], vec=Vector((0.0, -1.932, 0.740)))

    # "Clio V6" Script Badge
    ret_sc = bmesh.ops.create_cube(bm_rbad, size=1.0)
    for v in ret_sc['verts']:
        v.co.x = v.co.x * 0.140 + 0.220
        v.co.y = v.co.y * 0.008 - 1.931
        v.co.z = v.co.z * 0.016 + 0.720
    link_obj("Trunk_Hatch", bm_rbad, body_branch, mats["chrome"], bevel=0.001)


# ----------------------------------------------------------------------------
# 5. DIELECTRIC GREEN-TINT SAFETY GLASS (GLASS_BRANCH)
# ----------------------------------------------------------------------------
def build_clio_v6_glass(glass_branch, mats):
    # 1. Windshield
    bm_wind = bmesh.new()
    ws_rows = [
        [Vector(( 0.550,  0.380, 1.340)), Vector(( 0.0,  0.380, 1.348)), Vector((-0.550,  0.380, 1.340))],
        [Vector(( 0.630,  0.580, 1.060)), Vector(( 0.0,  0.580, 1.070)), Vector((-0.630,  0.580, 1.060))],
        [Vector(( 0.700,  0.800, 0.770)), Vector(( 0.0,  0.800, 0.780)), Vector((-0.700,  0.800, 0.770))],
    ]
    make_quad_grid(bm_wind, ws_rows)
    link_obj("Windshield", bm_wind, glass_branch, mats["glass"], bevel=0.0)

    # 2. Rear Hatch Glass (Panoramic window providing clear view of mid-engine V6)
    bm_rear_g = bmesh.new()
    rg_rows = [
        [Vector(( 0.510, -1.330, 1.325)), Vector(( 0.0, -1.330, 1.330)), Vector((-0.510, -1.330, 1.325))],
        [Vector(( 0.540, -1.500, 1.100)), Vector(( 0.0, -1.500, 1.105)), Vector((-0.540, -1.500, 1.100))],
        [Vector(( 0.560, -1.680, 0.885)), Vector(( 0.0, -1.680, 0.890)), Vector((-0.560, -1.680, 0.885))],
    ]
    make_quad_grid(bm_rear_g, rg_rows)
    link_obj("Rear_Glass", bm_rear_g, glass_branch, mats["glass"], bevel=0.0)

    # 3. Front Side Windows (Doors)
    bm_side_f = bmesh.new()
    for sign in [1.0, -1.0]:
        fsg_rows = [
            [Vector((sign * 0.555,  0.380, 1.335)), Vector((sign * 0.565,  0.050, 1.345))],
            [Vector((sign * 0.660,  0.380, 1.050)), Vector((sign * 0.670,  0.050, 1.050))],
            [Vector((sign * 0.750,  0.380, 0.775)), Vector((sign * 0.760,  0.050, 0.775))],
        ]
        make_quad_grid(bm_side_f, fsg_rows if sign > 0 else [[p for p in r] for r in fsg_rows])
    link_obj("Front_Side", bm_side_f, glass_branch, mats["glass"], bevel=0.0)

    # 4. Rear Quarter Windows
    bm_side_r = bmesh.new()
    for sign in [1.0, -1.0]:
        rsg_rows = [
            [Vector((sign * 0.565,  0.000, 1.345)), Vector((sign * 0.560, -0.640, 1.340))],
            [Vector((sign * 0.670,  0.000, 1.050)), Vector((sign * 0.670, -0.640, 1.050))],
            [Vector((sign * 0.760,  0.000, 0.775)), Vector((sign * 0.770, -0.640, 0.775))],
        ]
        make_quad_grid(bm_side_r, rsg_rows if sign > 0 else [[p for p in r] for r in rsg_rows])
    link_obj("Rear_Side", bm_side_r, glass_branch, mats["glass"], bevel=0.0)


# ----------------------------------------------------------------------------
# 6. LIGHTING OPTICS: PHASE 2 TRIANGULAR PROJECTOR HEADLAMPS & TAILLAMPS
# ----------------------------------------------------------------------------
def build_clio_v6_lighting(body_branch, mats):
    # Phase 2 Triangular Projector Headlights (Open inside cradle Z=0.540 to Z=0.635)
    for is_left in [True, False]:
        sign = 1.0 if is_left else -1.0
        side_tag = "L" if is_left else "R"

        # Chrome Headlamp Parabolic Reflector Housing
        bm_h_house = bmesh.new()
        ret_ref = bmesh.ops.create_cone(bm_h_house, cap_ends=True, segments=16, radius1=0.045, radius2=0.030, depth=0.040)
        bmesh.ops.rotate(bm_h_house, verts=ret_ref['verts'], matrix=Matrix.Rotation(math.radians(-90.0), 3, 'X'))
        bmesh.ops.translate(bm_h_house, verts=ret_ref['verts'], vec=Vector((sign * 0.480, 1.895, 0.585)))

        # Xenon Projector Core Beam
        ret_bulb = bmesh.ops.create_icosphere(bm_h_house, subdivisions=2, radius=0.015)
        bmesh.ops.translate(bm_h_house, verts=ret_bulb['verts'], vec=Vector((sign * 0.480, 1.905, 0.585)))

        # High Beam Inner Reflector Bowl
        ret_hb = bmesh.ops.create_cone(bm_h_house, cap_ends=True, segments=14, radius1=0.038, radius2=0.022, depth=0.035)
        bmesh.ops.rotate(bm_h_house, verts=ret_hb['verts'], matrix=Matrix.Rotation(math.radians(-90.0), 3, 'X'))
        bmesh.ops.translate(bm_h_house, verts=ret_hb['verts'], vec=Vector((sign * 0.380, 1.905, 0.585)))

        # Amber Outboard Corner Turn Indicator
        ret_ind = bmesh.ops.create_cone(bm_h_house, cap_ends=True, segments=12, radius1=0.032, radius2=0.018, depth=0.035)
        bmesh.ops.rotate(bm_h_house, verts=ret_ind['verts'], matrix=Matrix.Rotation(math.radians(-80.0), 3, 'X'))
        bmesh.ops.translate(bm_h_house, verts=ret_ind['verts'], vec=Vector((sign * 0.585, 1.880, 0.585)))

        link_obj(f"Headlamp_Housing_{side_tag}", bm_h_house, body_branch, mats["headlamp_reflector"], bevel=0.001)

        # Clear Polycarbonate Triangular Aerodynamic Outer Lens
        bm_lens = bmesh.new()
        hl_rows = [
            [Vector((sign * 0.320, 1.9205, 0.635)), Vector((sign * 0.480, 1.905, 0.635)), Vector((sign * 0.640, 1.885, 0.635))],
            [Vector((sign * 0.320, 1.925,  0.585)), Vector((sign * 0.485, 1.912, 0.585)), Vector((sign * 0.645, 1.890, 0.585))],
            [Vector((sign * 0.320, 1.9205, 0.540)), Vector((sign * 0.480, 1.905, 0.540)), Vector((sign * 0.640, 1.885, 0.540))],
        ]
        make_quad_grid(bm_lens, hl_rows if is_left else [list(reversed(r)) for r in hl_rows])
        link_obj(f"Headlamp_{side_tag}", bm_lens, body_branch, mats["headlamp_glass"], bevel=0.0)

    # Phase 2 Triangular Wrap-Around Taillights (Sitting proudly above bumper shelf Z=0.730)
    for is_left in [True, False]:
        sign = 1.0 if is_left else -1.0
        side_tag = "L" if is_left else "R"

        bm_tail = bmesh.new()
        # Lower Ruby Red Optical Brake / Tail Light Cluster (Z=0.735 to 0.845)
        ret_tr = bmesh.ops.create_cube(bm_tail, size=1.0)
        for v in ret_tr['verts']:
            v.co.x = v.co.x * 0.080 + sign * 0.620
            v.co.y = v.co.y * 0.020 - 1.918
            v.co.z = v.co.z * 0.110 + 0.790

        # Upper Reversing & Amber Turn Indicator Cluster (Z=0.845 to 0.945, raking inwards following C-pillar)
        ret_tu = bmesh.ops.create_cube(bm_tail, size=1.0)
        for v in ret_tu['verts']:
            v.co.x = v.co.x * 0.070 + sign * 0.605
            v.co.y = v.co.y * 0.018 - 1.916
            v.co.z = v.co.z * 0.100 + 0.895

        link_obj(f"Taillight_{side_tag}", bm_tail, body_branch, mats["tail_red"], bevel=0.002)


# ----------------------------------------------------------------------------
# 7. MID-ENGINE 3.0L 24V V6 & SPORT COCKPIT (INTERIOR_BRANCH)
# ----------------------------------------------------------------------------
def build_clio_v6_interior_and_engine(interior_branch, mats):
    # 1. Mid-Engine 3.0L 24V V6 Bay (Positioned directly under rear glass)
    bm_eng = bmesh.new()
    eng_y = -0.820
    eng_z = 0.540

    # Engine Block / Sump / Transmission
    ret_blk = bmesh.ops.create_cube(bm_eng, size=1.0)
    for v in ret_blk['verts']:
        v.co.x *= 0.680
        v.co.y = v.co.y * 0.520 + eng_y
        v.co.z = v.co.z * 0.300 + eng_z - 0.120

    # Cast Aluminum Intake Plenum (Main Airbox with Renault Sport embossing)
    ret_plen = bmesh.ops.create_cube(bm_eng, size=1.0)
    for v in ret_plen['verts']:
        v.co.x *= 0.560
        v.co.y = v.co.y * 0.260 + eng_y
        v.co.z = v.co.z * 0.100 + eng_z + 0.120

    # 6 Tuned Intake Runner Pipes
    for r_idx in range(6):
        rx = (r_idx - 2.5) * 0.088
        ry = eng_y + (0.075 if r_idx % 2 == 0 else -0.075)
        ret_pipe = bmesh.ops.create_cone(
            bm_eng, cap_ends=True, segments=14,
            radius1=0.024, radius2=0.024, depth=0.150
        )
        bmesh.ops.translate(bm_eng, verts=ret_pipe['verts'], vec=Vector((rx, ry, eng_z + 0.030)))

    # Red V6 Ignition Coil Covers
    for sign in [0.150, -0.150]:
        ret_cv = bmesh.ops.create_cube(bm_eng, size=1.0)
        for v in ret_cv['verts']:
            v.co.x *= 0.540
            v.co.y = v.co.y * 0.095 + eng_y + sign
            v.co.z = v.co.z * 0.045 + eng_z + 0.050

    link_obj("Mid_Engine_3L_V6", bm_eng, interior_branch, mats["engine_plenum"], bevel=0.002)

    # Cross-Chassis Rear Strut Brace (Tubular Aluminum spanning rear shock towers)
    bm_brace = bmesh.new()
    ret_br = bmesh.ops.create_cone(
        bm_brace, cap_ends=True, segments=18,
        radius1=0.026, radius2=0.026, depth=1.380,
        matrix=Matrix.Rotation(math.radians(90.0), 3, 'Y')
    )
    bmesh.ops.translate(bm_brace, verts=ret_br['verts'], vec=Vector((0.0, -1.120, 0.780)))

    # Diagonal Bracing Struts
    for sign in [0.450, -0.450]:
        ret_diag = bmesh.ops.create_cone(
            bm_brace, cap_ends=True, segments=14,
            radius1=0.018, radius2=0.018, depth=0.380,
            matrix=Matrix.Rotation(math.radians(45.0 * (1.0 if sign > 0 else -1.0)), 3, 'Y')
        )
        bmesh.ops.translate(bm_brace, verts=ret_diag['verts'], vec=Vector((sign, -1.120, 0.680)))

    link_obj("Rear_Strut_Brace", bm_brace, interior_branch, mats["strut_brace"], bevel=0.002)

    # 2. Renault Sport Contoured Bucket Seats
    bm_seat = bmesh.new()
    for sign in [0.380, -0.380]:
        ret_c = bmesh.ops.create_cube(bm_seat, size=1.0)
        for v in ret_c['verts']:
            v.co.x = v.co.x * 0.440 + sign
            v.co.y = v.co.y * 0.460 + 0.120
            v.co.z = v.co.z * 0.140 + 0.280

        ret_bk = bmesh.ops.create_cube(bm_seat, size=1.0)
        for v in ret_bk['verts']:
            v.co.x = v.co.x * 0.420 + sign
            v.co.y = v.co.y * 0.160 - 0.120
            v.co.z = v.co.z * 0.560 + 0.580
        bmesh.ops.rotate(bm_seat, verts=ret_bk['verts'], matrix=Matrix.Rotation(math.radians(-15.0), 3, 'X'))

        ret_hr = bmesh.ops.create_cube(bm_seat, size=1.0)
        for v in ret_hr['verts']:
            v.co.x = v.co.x * 0.220 + sign
            v.co.y = v.co.y * 0.120 - 0.200
            v.co.z = v.co.z * 0.160 + 0.940

    link_obj("Seats", bm_seat, interior_branch, mats["interior_dark"], bevel=0.004)

    # 3. Dashboard, 3-Spoke Sport Steering Wheel & Aluminum Shifter
    bm_dash = bmesh.new()
    ret_d = bmesh.ops.create_cube(bm_dash, size=1.0)
    for v in ret_d['verts']:
        v.co.x *= 1.340
        v.co.y = v.co.y * 0.350 + 0.560
        v.co.z = v.co.z * 0.240 + 0.680

    ret_rim = bmesh.ops.create_cone(
        bm_dash, cap_ends=True, segments=20,
        radius1=0.170, radius2=0.155, depth=0.024
    )
    bmesh.ops.rotate(bm_dash, verts=ret_rim['verts'], matrix=Matrix.Rotation(math.radians(-25.0), 3, 'X'))
    bmesh.ops.translate(bm_dash, verts=ret_rim['verts'], vec=Vector((0.380, 0.360, 0.720)))

    # Machined Aluminum Ball Shifter
    ret_knob = bmesh.ops.create_icosphere(bm_dash, subdivisions=2, radius=0.022)
    bmesh.ops.translate(bm_dash, verts=ret_knob['verts'], vec=Vector((0.0, 0.160, 0.480)))

    ret_shaft = bmesh.ops.create_cone(bm_dash, cap_ends=True, segments=10, radius1=0.008, radius2=0.008, depth=0.100)
    bmesh.ops.translate(bm_dash, verts=ret_shaft['verts'], vec=Vector((0.0, 0.160, 0.420)))

    link_obj("Dashboard", bm_dash, interior_branch, mats["interior_dark"], bevel=0.003)


# ----------------------------------------------------------------------------
# 8. UNDERBODY PLATFORM & SUSPENSION (PLATFORM_BRANCH)
# ----------------------------------------------------------------------------
def build_clio_v6_platform(platform_branch, mats, f_axle, r_axle):
    bm = bmesh.new()

    # Chassis Floor & Mid-Engine Cradle
    ret_cr = bmesh.ops.create_cube(bm, size=1.0)
    for v in ret_cr['verts']:
        v.co.x *= 1.360
        v.co.y = v.co.y * 3.400 + 0.000
        v.co.z = v.co.z * 0.045 + 0.120
    link_obj("Chassis", bm, platform_branch, mats["chassis_dark"], bevel=0.0)

    bm_fs = bmesh.new()
    ret_f = bmesh.ops.create_cube(bm_fs, size=1.0)
    for v in ret_f['verts']:
        v.co.x *= 1.340
        v.co.y = v.co.y * 0.480 + f_axle
        v.co.z = v.co.z * 0.110 + 0.180
    link_obj("Front_Subframe", bm_fs, platform_branch, mats["chassis_dark"], bevel=0.0)

    bm_rs = bmesh.new()
    ret_r = bmesh.ops.create_cube(bm_rs, size=1.0)
    for v in ret_r['verts']:
        v.co.x *= 1.380
        v.co.y = v.co.y * 0.750 + r_axle + 0.150
        v.co.z = v.co.z * 0.140 + 0.190
    link_obj("Rear_Subframe", bm_rs, platform_branch, mats["chassis_dark"], bevel=0.0)


# ----------------------------------------------------------------------------
# 9. MASTER BUILD ORCHESTRATION & DUAL-MODE GLB EXPORT
# ----------------------------------------------------------------------------
def build_renault_clio_v6_phase2_master():
    print("=" * 80)
    print("LAUNCHING RENAULT CLIO V6 PHASE 2 (2000S HATCHBACK) PROCEDURAL CAD BUILD")
    print("=" * 80)

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

    mats = create_clio_v6_materials()

    car_root = bpy.data.objects.new("VEHICLE_ROOT", None)
    bpy.context.scene.collection.objects.link(car_root)

    body_branch = bpy.data.objects.new("BODY", None)
    body_branch.parent = car_root
    bpy.context.scene.collection.objects.link(body_branch)

    aero_branch = bpy.data.objects.new("AERO", None)
    aero_branch.parent = car_root
    bpy.context.scene.collection.objects.link(aero_branch)

    glass_branch = bpy.data.objects.new("GLASS", None)
    glass_branch.parent = car_root
    bpy.context.scene.collection.objects.link(glass_branch)

    interior_branch = bpy.data.objects.new("INTERIOR", None)
    interior_branch.parent = car_root
    bpy.context.scene.collection.objects.link(interior_branch)

    platform_branch = bpy.data.objects.new("PLATFORM", None)
    platform_branch.parent = car_root
    bpy.context.scene.collection.objects.link(platform_branch)

    wheels_branch = bpy.data.objects.new("WHEELS", None)
    wheels_branch.parent = car_root
    bpy.context.scene.collection.objects.link(wheels_branch)

    f_axle =  1.255
    r_axle = -1.255
    f_tw = 0.760
    r_tw = 0.775

    print("[CLIO_V6_BUILDER] Constructing Staggered 18-inch OZ Superturismo Wheels & AP Racing Calipers...")
    build_clio_v6_wheel(wheels_branch, mats, "Wheel_FL", Vector(( f_tw, f_axle, 0.311)), is_left=True,  is_rear=False)
    build_clio_v6_wheel(wheels_branch, mats, "Wheel_FR", Vector((-f_tw, f_axle, 0.311)), is_left=False, is_rear=False)
    build_clio_v6_wheel(wheels_branch, mats, "Wheel_RL", Vector(( r_tw, r_axle, 0.327)), is_left=True,  is_rear=True)
    build_clio_v6_wheel(wheels_branch, mats, "Wheel_RR", Vector((-r_tw, r_axle, 0.327)), is_left=False, is_rear=True)

    print("[CLIO_V6_BUILDER] Sculpting Widebody Muscular Monocoque, Massive Side Scoops & Aero...")
    build_clio_v6_monocoque(body_branch, aero_branch, mats, f_axle, r_axle)

    print("[CLIO_V6_BUILDER] Assembling Dielectric Optical Glass Greenhouse...")
    build_clio_v6_glass(glass_branch, mats)

    print("[CLIO_V6_BUILDER] Assembling Phase 2 Triangular Projector Headlamps & Taillights...")
    build_clio_v6_lighting(body_branch, mats)

    print("[CLIO_V6_BUILDER] Installing Mid-Engine 3.0L V6, Strut Brace & Renault Sport Cockpit...")
    build_clio_v6_interior_and_engine(interior_branch, mats)

    print("[CLIO_V6_BUILDER] Assembling Platform, Engine Cradle & Zero-Void Enclosed Tubs...")
    build_clio_v6_platform(platform_branch, mats, f_axle, r_axle)

    print(f"[CLIO_V6_BUILDER] Exporting GLB -> {PUBLIC_TARGET}...")
    bpy.ops.export_scene.gltf(
        filepath=PUBLIC_TARGET,
        export_format='GLB',
        use_selection=False,
        export_apply=False
    )

    shutil.copyfile(PUBLIC_TARGET, PUBLIC_CAR_TARGET)
    shutil.copyfile(PUBLIC_TARGET, EXPORTS_DIR)
    print(f"[CLIO_V6_BUILDER] Saved: {EXPORTS_DIR} ({round(os.path.getsize(EXPORTS_DIR)/1024, 1)} KB)")
    print("=" * 80)
    print("RENAULT CLIO V6 PHASE 2 BUILD COMPLETE — GLBS EXPORTED SUCCESSFULLY")
    print("=" * 80)


if __name__ == "__main__":
    build_renault_clio_v6_phase2_master()
