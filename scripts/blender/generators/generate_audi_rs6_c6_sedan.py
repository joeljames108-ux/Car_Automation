"""
Procedural Class-A CAD Generator: Audi RS6 Sedan (C6) — 2000s Sedan Flagship
=============================================================================
Autonomously generates an authentic, production-grade 3D CAD mesh of the
flagship 2000s Audi RS6 Sedan (C6, 5.0L Twin-Turbo V10 widebody) in Blender 5.x LTS.

Factory Engineering Specifications:
- Wheelbase: 2,846 mm (Front Axle Y = +1.423 m, Rear Axle Y = -1.423 m)
- Overall Length: 4,928 mm (Y in [-2.464 m, +2.464 m])
- Overall Width: 1,889 mm (X = +/- 0.9445 m, Quattro blister widebody)
- Overall Height: 1,456 mm (Roof apex Z = 1.456 m)
- Track Width: Front 1,614 mm (X = +/- 0.807 m), Rear 1,637 mm (X = +/- 0.8185 m)
- Wheels & Tires: 20-inch 5-segment titanium-finish wheels + 275/35 ZR20 performance tires
- Aerodynamic Drag: Cd 0.31, frontal area 2.30 m^2

Key Styling Features:
- Hexagonal Singleframe front grille with brushed aluminum surround and dark honeycomb mesh
- Four interlocking rings Audi emblem + RS 6 badge with red rhombus
- Bi-xenon projector headlamps with pioneering 10-LED brilliant white Daytime Running Light (DRL) strip
- Quattro flared box-blister fenders housing 20-inch wheels with 390mm ceramic brakes
- Razor-sharp continuous Tornado shoulder line running from headlamp to taillamp
- Matte brushed aluminum aerodynamic RS side mirrors and satin aluminum window trim
- Front bumper massive twin intercooler air intakes with horizontal aero vanes
- Rear aerodynamic diffuser with signature giant dual oval RS exhaust tailpipes (140x95 mm)
- Integrated rear decklid ducktail lip spoiler
- Horizontal wrap-around LED taillamps with dark cherry housing & glowing red light ribbons
- Recaro RS sport cockpit with carbon fiber trim and 3-spoke flat-bottom steering wheel
- Full engine undertray and enclosed wheel tubs (zero see-through voids)

Exports:
- public/models/vehicles/sedan/2000s/vehicle.glb
- public/models/Car_Audi_RS6_C6_2000s.glb
- exports/Car_Audi_RS6_C6_2000s.glb
"""

import bpy
import bmesh
import math
import os
from mathutils import Vector, Matrix, Euler

try:
    CURRENT_FILE = __file__
except NameError:
    CURRENT_FILE = r"E:\Car_Automation\scripts\blender\generators\generate_audi_rs6_c6_sedan.py"

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(CURRENT_FILE), "..", "..", ".."))
PUBLIC_VEHICLE_GLB = os.path.join(ROOT_DIR, "public", "models", "vehicles", "sedan", "2000s", "vehicle.glb")
PUBLIC_CAR_GLB = os.path.join(ROOT_DIR, "public", "models", "Car_Audi_RS6_C6_2000s.glb")
EXPORTS_CAR_GLB = os.path.join(ROOT_DIR, "exports", "Car_Audi_RS6_C6_2000s.glb")

os.makedirs(os.path.dirname(PUBLIC_VEHICLE_GLB), exist_ok=True)
os.makedirs(os.path.dirname(PUBLIC_CAR_GLB), exist_ok=True)
os.makedirs(os.path.dirname(EXPORTS_CAR_GLB), exist_ok=True)

# ----------------------------------------------------------------------------
# 1. SCENE RESET & PBR MATERIAL FACTORY
# ----------------------------------------------------------------------------
def safe_reset():
    """Cleanly purge objects, meshes, and materials without tearing down blender session."""
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

def make_pbr_mat(name, base_color, metallic=0.0, roughness=0.5, coat=0.0, alpha=1.0, emission=(0,0,0,1), emission_strength=0.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    out = nodes.new('ShaderNodeOutputMaterial')
    bsdf = nodes.new('ShaderNodeBsdfPrincipled')
    links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])

    bsdf.inputs['Base Color'].default_value = base_color
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness

    if 'Coat Weight' in bsdf.inputs:
        bsdf.inputs['Coat Weight'].default_value = coat
    elif 'Clearcoat' in bsdf.inputs:
        bsdf.inputs['Clearcoat'].default_value = coat

    if alpha < 1.0:
        bsdf.inputs['Alpha'].default_value = alpha
        if 'Transmission Weight' in bsdf.inputs:
            bsdf.inputs['Transmission Weight'].default_value = 1.0 - alpha
        elif 'Transmission' in bsdf.inputs:
            bsdf.inputs['Transmission'].default_value = 1.0 - alpha

    if 'Emission Color' in bsdf.inputs:
        bsdf.inputs['Emission Color'].default_value = emission
        bsdf.inputs['Emission Strength'].default_value = emission_strength
    elif 'Emission' in bsdf.inputs:
        bsdf.inputs['Emission'].default_value = emission

    return mat

def create_rs6_materials():
    mats = {}
    # Daytona Grey Pearl Effect: Deep sophisticated metallic charcoal
    mats["paint"] = make_pbr_mat("M_RS6_DaytonaGrey", (0.13, 0.14, 0.15, 1.0), metallic=0.88, roughness=0.20, coat=1.0)
    # Matte Brushed Aluminum (RS Mirrors, Singleframe surround, window trim, intake blades)
    mats["aluminum"] = make_pbr_mat("M_RS6_MatteAluminum", (0.84, 0.85, 0.87, 1.0), metallic=0.92, roughness=0.26)
    # High-Gloss Anthracite Honeycomb Mesh
    mats["grille_mesh"] = make_pbr_mat("M_RS6_HoneycombMesh", (0.04, 0.04, 0.05, 1.0), metallic=0.35, roughness=0.30)
    # Mirror Polished Chrome (Audi Rings, Exhaust tips, Badges)
    mats["chrome"] = make_pbr_mat("M_RS6_Chrome", (0.95, 0.96, 0.98, 1.0), metallic=0.98, roughness=0.04, coat=1.0)
    # Titanium 20-inch 5-segment wheel alloy
    mats["titanium"] = make_pbr_mat("M_RS6_TitaniumAlloy", (0.34, 0.35, 0.37, 1.0), metallic=0.86, roughness=0.26, coat=0.5)
    # Performance 275/35 ZR20 Tire Rubber
    mats["rubber"] = make_pbr_mat("M_RS6_TireRubber", (0.035, 0.035, 0.038, 1.0), metallic=0.0, roughness=0.85)
    # Carbon Ceramic Cross-Drilled Brake Rotor
    mats["brake_rotor"] = make_pbr_mat("M_RS6_CeramicRotor", (0.24, 0.24, 0.25, 1.0), metallic=0.65, roughness=0.42)
    # Gloss Black 6-Piston RS Caliper
    mats["brake_caliper"] = make_pbr_mat("M_RS6_BrakeCaliper", (0.03, 0.03, 0.03, 1.0), metallic=0.4, roughness=0.18, coat=1.0)
    # Optical Glass (Green-Tinted Solar Acoustic Glass)
    mats["glass"] = make_pbr_mat("M_RS6_OpticalGlass", (0.08, 0.12, 0.10, 0.22), metallic=0.0, roughness=0.02, coat=1.0, alpha=0.22)
    # Polycarbonate Outer Headlamp Lens
    mats["headlamp_lens"] = make_pbr_mat("M_RS6_HeadlampLens", (0.94, 0.96, 0.98, 0.25), metallic=0.05, roughness=0.03, coat=1.0, alpha=0.25)
    # Pioneering Brilliant White 10-LED DRL Strip
    mats["led_drl"] = make_pbr_mat("M_RS6_LED_DRL", (1.0, 1.0, 1.0, 1.0), metallic=0.0, roughness=0.10, emission=(1.0, 1.0, 1.0, 1.0), emission_strength=24.0)
    # Bi-Xenon Projector Beam
    mats["xenon"] = make_pbr_mat("M_RS6_XenonProjector", (0.92, 0.96, 1.0, 1.0), metallic=0.90, roughness=0.05, emission=(0.92, 0.96, 1.0, 1.0), emission_strength=14.0)
    # Wrap-around Amber Indicator
    mats["amber"] = make_pbr_mat("M_RS6_IndicatorAmber", (0.98, 0.48, 0.02, 0.80), metallic=0.10, roughness=0.15, coat=0.8, alpha=0.80, emission=(0.98, 0.48, 0.02, 1.0), emission_strength=3.0)
    # Glowing Red LED Taillight Ribbons
    mats["tail_led"] = make_pbr_mat("M_RS6_TaillightLED", (0.96, 0.02, 0.03, 1.0), metallic=0.0, roughness=0.12, emission=(1.0, 0.02, 0.03, 1.0), emission_strength=18.0)
    # Dark Cherry Tail Housing
    mats["tail_housing"] = make_pbr_mat("M_RS6_TailDarkCherry", (0.32, 0.02, 0.03, 0.65), metallic=0.1, roughness=0.08, coat=1.0, alpha=0.65)
    # Carbon Fiber Interior Trim Inlays
    mats["carbon"] = make_pbr_mat("M_RS6_CarbonInlay", (0.06, 0.06, 0.07, 1.0), metallic=0.55, roughness=0.18, coat=1.0)
    # Valcona Black Leather Cockpit
    mats["leather"] = make_pbr_mat("M_RS6_ValconaLeather", (0.040, 0.040, 0.045, 1.0), metallic=0.03, roughness=0.72)
    # Dark Anthracite Aerodynamic Rear Diffuser & Underbody
    mats["diffuser"] = make_pbr_mat("M_RS6_DiffuserDark", (0.045, 0.045, 0.048, 1.0), metallic=0.30, roughness=0.65)
    # Red RS Badge Rhombus
    mats["rs_red"] = make_pbr_mat("M_RS6_BadgeRed", (0.88, 0.02, 0.02, 1.0), metallic=0.10, roughness=0.15, emission=(0.88, 0.02, 0.02, 1.0), emission_strength=4.0)
    return mats

# ----------------------------------------------------------------------------
# 2. GEOMETRY HELPERS & WELDING
# ----------------------------------------------------------------------------
def link_obj(name, bm, parent, mat=None, bevel=0.002, auto_smooth=35.0):
    mesh = bpy.data.meshes.new(name)
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
    if hasattr(obj.data, "shade_smooth_by_angle"):
        obj.data.shade_smooth_by_angle(math.radians(auto_smooth))
    elif hasattr(obj.data, "auto_smooth_angle"):
        obj.data.auto_smooth_angle = math.radians(auto_smooth)
        obj.data.use_auto_smooth = True

    if bevel > 0:
        mod = obj.modifiers.new("Bevel", 'BEVEL')
        mod.width = bevel
        mod.segments = 2
        mod.limit_method = 'ANGLE'
        mod.angle_limit = math.radians(32)

    wn = obj.modifiers.new("WeightedNormal", 'WEIGHTED_NORMAL')
    wn.keep_sharp = True
    return obj

def create_torus_bm(bm, major_r, minor_r, center, normal, major_segs=20, minor_segs=8):
    """Adds a 3D torus with 2D quad faces into the provided bmesh."""
    n = normal.normalized()
    if abs(n.z) < 0.99:
        u = n.cross(Vector((0, 0, 1))).normalized()
    else:
        u = n.cross(Vector((0, 1, 0))).normalized()
    v = n.cross(u).normalized()

    rings = []
    for i in range(major_segs):
        phi = 2.0 * math.pi * i / major_segs
        c_phi, s_phi = math.cos(phi), math.sin(phi)
        cen_ring = center + major_r * (c_phi * u + s_phi * v)
        rad_dir = (c_phi * u + s_phi * v).normalized()

        ring_verts = []
        for j in range(minor_segs):
            theta = 2.0 * math.pi * j / minor_segs
            c_th, s_th = math.cos(theta), math.sin(theta)
            pt = cen_ring + minor_r * (c_th * rad_dir + s_th * n)
            ring_verts.append(bm.verts.new(pt))
        rings.append(ring_verts)

    for i in range(major_segs):
        i_next = (i + 1) % major_segs
        for j in range(minor_segs):
            j_next = (j + 1) % minor_segs
            bm.faces.new((rings[i][j], rings[i_next][j], rings[i_next][j_next], rings[i][j_next]))

def make_quad_grid(bm, rows):
    grid_verts = []
    for row in rows:
        v_row = [bm.verts.new(p) for p in row]
        grid_verts.append(v_row)

    for i in range(len(grid_verts) - 1):
        for j in range(len(grid_verts[i]) - 1):
            bm.faces.new([
                grid_verts[i][j],
                grid_verts[i+1][j],
                grid_verts[i+1][j+1],
                grid_verts[i][j+1]
            ])
    return grid_verts

# ----------------------------------------------------------------------------
# 3. 20-INCH 5-SEGMENT TITANIUM WHEELS, CERAMIC BRAKES & TIRES
# ----------------------------------------------------------------------------
def build_rs6_wheel(roots, mats, name, pos, is_left, wheel_r=0.350, tire_w=0.275):
    """
    Constructs an authentic Audi RS6 20-inch 5-segment rotor alloy wheel:
    - 275/35 ZR20 tire with curved rounded sidewall
    - 20" rim (radius 0.254m) with stepped titanium lip
    - 5 sculpted segment spokes in titanium finish
    - Recessed center lug bowl with Audi 4-ring emblem cap
    - 390mm cross-drilled carbon ceramic brake rotor
    - Gloss black 6-piston RS caliper
    """
    outer_sign = 1.0 if is_left else -1.0
    rim_r = 0.254       # 20" rim radius
    half_tw = tire_w / 2.0
    segs = 32

    # 1. 275/35 ZR20 Tire with Curvature Profile
    bm_tire = bmesh.new()
    profile = [
        (rim_r,           -half_tw * 0.90),
        (wheel_r * 0.88,  -half_tw * 1.04),
        (wheel_r * 0.98,  -half_tw * 0.96),
        (wheel_r,         -half_tw * 0.70),
        (wheel_r,          half_tw * 0.70),
        (wheel_r * 0.98,   half_tw * 0.96),
        (wheel_r * 0.88,   half_tw * 1.04),
        (rim_r,            half_tw * 0.90)
    ]
    rings = []
    for s in range(segs):
        ang = 2.0 * math.pi * s / segs
        c_a, s_a = math.cos(ang), math.sin(ang)
        ring_v = []
        for r_p, w_p in profile:
            pt = pos + Vector((w_p * outer_sign, r_p * c_a, r_p * s_a))
            ring_v.append(bm_tire.verts.new(pt))
        rings.append(ring_v)

    for s in range(segs):
        s_next = (s + 1) % segs
        for p in range(len(profile) - 1):
            if is_left:
                bm_tire.faces.new((rings[s][p], rings[s_next][p], rings[s_next][p+1], rings[s][p+1]))
            else:
                bm_tire.faces.new((rings[s][p], rings[s][p+1], rings[s_next][p+1], rings[s_next][p]))

    link_obj(f"TIRE_{name}", bm_tire, roots["TIRES"], mats["rubber"], bevel=0.0)

    # 2. 20-Inch Titanium Rim Lip & Center Dish
    bm_rim = bmesh.new()
    rim_profile = [
        (rim_r,          -half_tw * 0.88),
        (rim_r * 0.94,   -half_tw * 0.50),
        (rim_r * 0.92,    half_tw * 0.75),
        (rim_r * 0.98,    half_tw * 0.88),
        (rim_r,           half_tw * 0.92)
    ]
    rim_rings = []
    for s in range(segs):
        ang = 2.0 * math.pi * s / segs
        c_a, s_a = math.cos(ang), math.sin(ang)
        rv = []
        for r_p, w_p in rim_profile:
            pt = pos + Vector((w_p * outer_sign, r_p * c_a, r_p * s_a))
            rv.append(bm_rim.verts.new(pt))
        rim_rings.append(rv)

    for s in range(segs):
        s_next = (s + 1) % segs
        for p in range(len(rim_profile) - 1):
            if is_left:
                bm_rim.faces.new((rim_rings[s][p], rim_rings[s_next][p], rim_rings[s_next][p+1], rim_rings[s][p+1]))
            else:
                bm_rim.faces.new((rim_rings[s][p], rim_rings[s][p+1], rim_rings[s_next][p+1], rim_rings[s_next][p]))

    link_obj(f"WHEEL_Rim_{name}", bm_rim, roots["WHEELS"], mats["titanium"], bevel=0.002)

    # 3. 5 Sculpted Segment Spokes
    bm_spokes = bmesh.new()
    num_spokes = 5
    spoke_ang = 2.0 * math.pi / num_spokes
    hub_r = 0.085
    outer_spoke_r = rim_r * 0.92
    dish_x = (half_tw * 0.86) * outer_sign

    for sp in range(num_spokes):
        ang = sp * spoke_ang
        w_half = 0.038
        r_vec = Vector((0, math.cos(ang), math.sin(ang)))
        t_vec = Vector((0, -math.sin(ang), math.cos(ang)))

        p1 = pos + Vector((dish_x * 0.92, 0, 0)) + hub_r * r_vec - w_half * 0.7 * t_vec
        p2 = pos + Vector((dish_x * 0.92, 0, 0)) + hub_r * r_vec + w_half * 0.7 * t_vec
        p3 = pos + Vector((dish_x, 0, 0)) + outer_spoke_r * r_vec + w_half * 1.1 * t_vec
        p4 = pos + Vector((dish_x, 0, 0)) + outer_spoke_r * r_vec - w_half * 1.1 * t_vec

        thick_x = -0.022 * outer_sign
        v1 = bm_spokes.verts.new(p1)
        v2 = bm_spokes.verts.new(p2)
        v3 = bm_spokes.verts.new(p3)
        v4 = bm_spokes.verts.new(p4)

        v1_b = bm_spokes.verts.new(p1 + Vector((thick_x, 0, 0)))
        v2_b = bm_spokes.verts.new(p2 + Vector((thick_x, 0, 0)))
        v3_b = bm_spokes.verts.new(p3 + Vector((thick_x, 0, 0)))
        v4_b = bm_spokes.verts.new(p4 + Vector((thick_x, 0, 0)))

        if is_left:
            bm_spokes.faces.new((v1, v2, v3, v4))
            bm_spokes.faces.new((v4_b, v3_b, v2_b, v1_b))
        else:
            bm_spokes.faces.new((v4, v3, v2, v1))
            bm_spokes.faces.new((v1_b, v2_b, v3_b, v4_b))

        bm_spokes.faces.new((v1, v4, v4_b, v1_b))
        bm_spokes.faces.new((v2, v2_b, v3_b, v3))
        bm_spokes.faces.new((v3, v3_b, v4_b, v4))

    link_obj(f"WHEEL_Spokes_{name}", bm_spokes, roots["WHEELS"], mats["titanium"], bevel=0.003)

    # 4. Center Cap & Audi Rings Motif
    bm_cap = bmesh.new()
    cap_x = (half_tw * 0.90) * outer_sign
    cap_r = hub_r * 0.95
    cap_ring = []
    c_center = bm_cap.verts.new(pos + Vector((cap_x, 0, 0)))
    for s in range(20):
        ang = 2.0 * math.pi * s / 20
        pt = pos + Vector((cap_x, cap_r * math.cos(ang), cap_r * math.sin(ang)))
        cap_ring.append(bm_cap.verts.new(pt))

    for s in range(20):
        s_next = (s + 1) % 20
        if is_left:
            bm_cap.faces.new((c_center, cap_ring[s], cap_ring[s_next]))
        else:
            bm_cap.faces.new((c_center, cap_ring[s_next], cap_ring[s]))

    link_obj(f"WHEEL_CenterCap_{name}", bm_cap, roots["WHEELS"], mats["titanium"], bevel=0.001)

    # 5. Carbon Ceramic Brake Rotor
    is_front = pos.y > 0
    rotor_r = 0.195 if is_front else 0.178
    rotor_x = (half_tw * 0.20) * outer_sign
    bm_rotor = bmesh.new()
    r_hub = 0.080
    r_segs = 24
    r_outer_ring = []
    r_inner_ring = []
    for s in range(r_segs):
        ang = 2.0 * math.pi * s / r_segs
        c_a, s_a = math.cos(ang), math.sin(ang)
        p_out = pos + Vector((rotor_x, rotor_r * c_a, rotor_r * s_a))
        p_in = pos + Vector((rotor_x, r_hub * c_a, r_hub * s_a))
        r_outer_ring.append(bm_rotor.verts.new(p_out))
        r_inner_ring.append(bm_rotor.verts.new(p_in))

    for s in range(r_segs):
        s_next = (s + 1) % r_segs
        if is_left:
            bm_rotor.faces.new((r_inner_ring[s], r_outer_ring[s], r_outer_ring[s_next], r_inner_ring[s_next]))
        else:
            bm_rotor.faces.new((r_inner_ring[s], r_inner_ring[s_next], r_outer_ring[s_next], r_outer_ring[s]))

    link_obj(f"BRAKE_Rotor_{name}", bm_rotor, roots["BRAKES"], mats["brake_rotor"], bevel=0.0)

    # 6. Gloss Black 6-Piston RS Brake Caliper
    bm_caliper = bmesh.new()
    cal_len = 0.140 if is_front else 0.110
    cal_h = 0.075
    cal_w = 0.065
    cal_y = pos.y + (0.110 if is_front else -0.090)
    cal_z = pos.z + 0.110
    cal_cen = Vector((pos.x + 0.030 * outer_sign, cal_y, cal_z))

    dx, dy, dz = cal_w / 2.0, cal_len / 2.0, cal_h / 2.0
    c_pts = [
        cal_cen + Vector((-dx, -dy, -dz)),
        cal_cen + Vector(( dx, -dy, -dz)),
        cal_cen + Vector(( dx,  dy, -dz)),
        cal_cen + Vector((-dx,  dy, -dz)),
        cal_cen + Vector((-dx, -dy,  dz)),
        cal_cen + Vector(( dx, -dy,  dz)),
        cal_cen + Vector(( dx,  dy,  dz)),
        cal_cen + Vector((-dx,  dy,  dz)),
    ]
    cv = [bm_caliper.verts.new(p) for p in c_pts]
    faces_idx = [
        (0,1,2,3), (4,7,6,5), (0,4,5,1),
        (1,5,6,2), (2,6,7,3), (3,7,4,0)
    ]
    for f in faces_idx:
        bm_caliper.faces.new((cv[f[0]], cv[f[1]], cv[f[2]], cv[f[3]]))

    link_obj(f"BRAKE_Caliper_{name}", bm_caliper, roots["BRAKES"], mats["brake_caliper"], bevel=0.005)

# ----------------------------------------------------------------------------
# 4. LOWER MONOCOQUE BODY SHELL WITH QUATTRO BOX-BLISTER FLARES
# ----------------------------------------------------------------------------
def build_rs6_shell(roots, mats, f_axle, r_axle):
    """
    Constructs the widebody lower monocoque with Quattro blistered wheel arches:
    - Overall length: 4928mm (Y: -2.464m to +2.464m)
    - Wheelbase: 2846mm (axles at Y = +/- 1.423m)
    - Flared Quattro blisters: reaching X = +/- 0.9445m
    - Razor-sharp Tornado crease at Z = 0.910m
    - Seamless horizontal hood panel, trunk decklid, front and rear aprons
    """
    bm = bmesh.new()
    arch_span = 0.380
    z_arch_peak = 0.700
    base_sill = 0.160
    fz_waist = 0.910

    y_coords = [
        2.464, 2.380, 2.150, 1.850,
        f_axle + arch_span, f_axle + 0.260, f_axle + 0.130, f_axle,
        f_axle - 0.130, f_axle - 0.260, f_axle - arch_span,
        0.800, 0.400, 0.000, -0.400, -0.800, -1.050,
        r_axle + arch_span, r_axle + 0.260, r_axle + 0.130, r_axle,
        r_axle - 0.130, r_axle - 0.260, r_axle - arch_span,
        -1.950, -2.250, -2.464
    ]

    clean_y = []
    for y in y_coords:
        if not clean_y or abs(y - clean_y[-1]) > 0.005:
            clean_y.append(y)

    def get_station_profile(fy):
        fz_s = base_sill
        fz_w = fz_waist
        fw_bot = 0.880
        fw_w = 0.9445  # Quattro widebody width

        # Front taper
        if fy > 1.850:
            t = (fy - 1.850) / (2.464 - 1.850)
            fw_w = 0.9445 - 0.095 * t
            fw_bot = 0.880 - 0.110 * t
            fz_s = base_sill + 0.035 * t
            fz_w = fz_waist - 0.060 * t
        # Rear taper
        elif fy < -1.950:
            t = (-fy - 1.950) / (2.464 - 1.950)
            fw_w = 0.9445 - 0.085 * t
            fw_bot = 0.880 - 0.095 * t
            fz_s = base_sill + 0.040 * t
            fz_w = fz_waist - 0.030 * t

        # Wheel arch cutouts
        d_f = abs(fy - f_axle)
        d_r = abs(fy - r_axle)
        if d_f < arch_span:
            norm_d = d_f / arch_span
            arch_lift = math.sqrt(max(0.0, 1.0 - norm_d * norm_d))
            z_sill = base_sill + (z_arch_peak - base_sill) * arch_lift
            x_sill = fw_w * 0.99
        elif d_r < arch_span:
            norm_d = d_r / arch_span
            arch_lift = math.sqrt(max(0.0, 1.0 - norm_d * norm_d))
            z_sill = base_sill + (z_arch_peak - base_sill) * arch_lift
            x_sill = fw_w * 0.99
        else:
            z_sill = fz_s
            x_sill = fw_bot

        z_crease = z_sill + (fz_w - z_sill) * 0.45
        x_crease = fw_w * 0.97
        z_shoulder = z_sill + (fz_w - z_sill) * 0.82
        x_shoulder = fw_w * 0.995
        z_waist = fz_w
        x_waist = fw_w

        return (z_sill, x_sill, z_crease, x_crease, z_shoulder, x_shoulder, z_waist, x_waist)

    station_data = [(fy, get_station_profile(fy)) for fy in clean_y]
    num_pts = len(station_data)

    # 1. Left (+X) and Right (-X) Outer Body Flanks
    for side in [1.0, -1.0]:
        rows = []
        for i in range(num_pts):
            fy, prof = station_data[i]
            z_sill, x_sill, z_crease, x_crease, z_shoulder, x_shoulder, z_waist, x_waist = prof
            p_sill = Vector((side * x_sill, fy, z_sill))
            p_crease = Vector((side * x_crease, fy, z_crease))
            p_shoulder = Vector((side * x_shoulder, fy, z_shoulder))
            p_waist = Vector((side * x_waist, fy, z_waist))
            rows.append([p_sill, p_crease, p_shoulder, p_waist])

        make_quad_grid(bm, rows if side > 0 else [[p for p in r] for r in rows])

    # 2. Horizontal Hood Panel (Cowl Y=0.70 forward to Nose Y=2.464)
    hood_stations = [s for s in station_data if 0.70 <= s[0] <= 2.464]
    hood_rows = []
    for fy, prof in hood_stations:
        z_waist = prof[6]
        x_waist = prof[7]
        hood_w = x_waist * 0.95
        # Audi dual power dome creases flanking the center
        p_l = Vector(( hood_w, fy, z_waist - 0.005))
        p_lc = Vector(( hood_w * 0.40, fy, z_waist + 0.015))
        p_c  = Vector(( 0.0, fy, z_waist + 0.022))
        p_rc = Vector((-hood_w * 0.40, fy, z_waist + 0.015))
        p_r = Vector((-hood_w, fy, z_waist - 0.005))
        hood_rows.append([p_l, p_lc, p_c, p_rc, p_r])
    make_quad_grid(bm, hood_rows)

    # 3. Horizontal Trunk Decklid (Backlight Y=-1.40 back to Tail Y=-2.464)
    deck_stations = [s for s in station_data if -2.464 <= s[0] <= -1.40]
    deck_rows = []
    for fy, prof in deck_stations:
        z_waist = prof[6]
        x_waist = prof[7]
        deck_w = x_waist * 0.95
        p_l = Vector(( deck_w, fy, z_waist - 0.005))
        p_lc = Vector(( deck_w * 0.40, fy, z_waist + 0.012))
        p_c  = Vector(( 0.0, fy, z_waist + 0.018))
        p_rc = Vector((-deck_w * 0.40, fy, z_waist + 0.012))
        p_r = Vector((-deck_w, fy, z_waist - 0.005))
        deck_rows.append([p_l, p_lc, p_c, p_rc, p_r])
    make_quad_grid(bm, deck_rows)

    # 4. Front Apron & Lower Fascia (surrounding Singleframe grille)
    for s in [1.0, -1.0]:
        f_apron_side = [
            [Vector((s * 0.38, 2.45, 0.18)), Vector((s * 0.76, 2.44, 0.18))],
            [Vector((s * 0.38, 2.45, 0.48)), Vector((s * 0.80, 2.44, 0.48))],
            [Vector((s * 0.38, 2.44, 0.72)), Vector((s * 0.82, 2.43, 0.72))],
        ]
        make_quad_grid(bm, f_apron_side if s > 0 else [[p for p in r] for r in f_apron_side])

    # Front Header Strip above Grille and Lights
    f_header = [
        [Vector(( 0.82, 2.44, 0.82)), Vector(( 0.38, 2.45, 0.83)), Vector(( 0.0, 2.455, 0.84)), Vector((-0.38, 2.45, 0.83)), Vector((-0.82, 2.44, 0.82))],
        [Vector(( 0.82, 2.44, 0.85)), Vector(( 0.38, 2.45, 0.86)), Vector(( 0.0, 2.455, 0.87)), Vector((-0.38, 2.45, 0.86)), Vector((-0.82, 2.44, 0.85))],
    ]
    make_quad_grid(bm, f_header)

    # 5. Rear Apron & Solid Vertical Trunk Panel (Eliminates see-through holes)
    r_apron = [
        [Vector((-0.78, -2.45, 0.22)), Vector(( 0.0, -2.46, 0.22)), Vector(( 0.78, -2.45, 0.22))],
        [Vector((-0.80, -2.46, 0.48)), Vector(( 0.0, -2.465, 0.48)), Vector(( 0.80, -2.46, 0.48))],
        [Vector((-0.82, -2.46, 0.72)), Vector(( 0.0, -2.465, 0.72)), Vector(( 0.82, -2.46, 0.72))],
    ]
    make_quad_grid(bm, r_apron)

    # Rear Deck Vertical Face (between taillights: Z=0.72 to 0.90, Y=-2.46)
    r_deck_face = [
        [Vector((-0.42, -2.46, 0.72)), Vector(( 0.0, -2.465, 0.72)), Vector(( 0.42, -2.46, 0.72))],
        [Vector((-0.42, -2.46, 0.82)), Vector(( 0.0, -2.465, 0.82)), Vector(( 0.42, -2.46, 0.82))],
        [Vector((-0.42, -2.46, 0.90)), Vector(( 0.0, -2.465, 0.90)), Vector(( 0.42, -2.46, 0.90))],
    ]
    make_quad_grid(bm, r_deck_face)

    # Rear Panels under & above taillights
    for s in [1.0, -1.0]:
        r_under_tl = [
            [Vector((s * 0.42, -2.46, 0.72)), Vector((s * 0.82, -2.45, 0.72))],
            [Vector((s * 0.42, -2.46, 0.76)), Vector((s * 0.82, -2.45, 0.76))],
        ]
        make_quad_grid(bm, r_under_tl if s > 0 else [[p for p in r] for r in r_under_tl])

        r_above_tl = [
            [Vector((s * 0.42, -2.46, 0.86)), Vector((s * 0.82, -2.45, 0.86))],
            [Vector((s * 0.42, -2.46, 0.90)), Vector((s * 0.82, -2.45, 0.90))],
        ]
        make_quad_grid(bm, r_above_tl if s > 0 else [[p for p in r] for r in r_above_tl])

    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.002)
    link_obj("BODY_Monocoque_Shell", bm, roots["BODY"], mats["paint"], bevel=0.003)

    # Core Radiator & Trunk Bulkheads (Zero See-Through Voids)
    bm_bulk = bmesh.new()
    bmesh.ops.create_cube(bm_bulk, size=1.0)
    for v in bm_bulk.verts[-8:]:
        v.co.x *= 1.62
        v.co.y = v.co.y * 0.03 + 2.30
        v.co.z = v.co.z * 0.60 + 0.52

    bmesh.ops.create_cube(bm_bulk, size=1.0)
    for v in bm_bulk.verts[-8:]:
        v.co.x *= 1.58
        v.co.y = v.co.y * 0.03 - 1.35
        v.co.z = v.co.z * 0.60 + 0.54

    link_obj("PLATFORM_Core_Bulkheads", bm_bulk, roots["PLATFORM"], mats["diffuser"], bevel=0.0)

# ----------------------------------------------------------------------------
# 5. STRUCTURAL GREENHOUSE (ROOF & SOLID PILLARS)
# ----------------------------------------------------------------------------
def build_greenhouse_structure(roots, mats):
    """
    Constructs the Audi RS6 solid greenhouse structure:
    - Crowned aerodynamic roof panel (Z=1.456m apex)
    - Structural A-pillars sweeping up from cowl (32° rake)
    - C-pillar sail panels sloping down to rear waistline
    - Door top sill shelves seamlessly bridging the waistline to the glass
    """
    bm = bmesh.new()
    roof_w = 0.620
    roof_rows = [
        [Vector(( roof_w,  0.15, 1.445)), Vector(( 0.0,  0.15, 1.456)), Vector((-roof_w,  0.15, 1.445))],
        [Vector(( roof_w, -0.40, 1.446)), Vector(( 0.0, -0.40, 1.458)), Vector((-roof_w, -0.40, 1.446))],
        [Vector(( roof_w, -0.90, 1.442)), Vector(( 0.0, -0.90, 1.454)), Vector((-roof_w, -0.90, 1.442))],
    ]
    make_quad_grid(bm, roof_rows)

    for side in [1.0, -1.0]:
        # Solid A-Pillars (from Cowl Y=0.70, Z=0.91 to Roof Front Y=0.15, Z=1.445)
        ap = [
            [Vector((side * 0.84, 0.70, 0.91)), Vector((side * 0.76, 0.70, 0.91))],
            [Vector((side * 0.66, 0.15, 1.445)), Vector((side * 0.60, 0.15, 1.445))],
        ]
        make_quad_grid(bm, ap if side > 0 else [[p for p in r] for r in ap])

        # Solid C-Pillar Sail Panels (from Roof Rear Y=-0.90, Z=1.442 down to Decklid Y=-1.40, Z=0.91)
        cp = [
            [Vector((side * 0.62, -0.90, 1.442)), Vector((side * 0.64, -1.02, 1.430))],
            [Vector((side * 0.75, -1.18, 1.160)), Vector((side * 0.78, -1.28, 1.140))],
            [Vector((side * 0.86, -1.30, 0.910)), Vector((side * 0.88, -1.45, 0.910))],
        ]
        make_quad_grid(bm, cp if side > 0 else [[p for p in r] for r in cp])

        # C-Pillar Inner Return to Backlight
        cp_ret = [
            [Vector((side * 0.64, -1.02, 1.430)), Vector((side * 0.58, -0.94, 1.435))],
            [Vector((side * 0.78, -1.28, 1.140)), Vector((side * 0.65, -1.22, 1.150))],
            [Vector((side * 0.88, -1.45, 0.910)), Vector((side * 0.70, -1.40, 0.915))],
        ]
        make_quad_grid(bm, cp_ret if side > 0 else [[p for p in r] for r in cp_ret])

        # Door Top Sill Shelf (connects waistline flank to glass base)
        door_shelf = [
            [Vector((side * 0.9445,  0.70, 0.91)), Vector((side * 0.800,  0.70, 0.91))],
            [Vector((side * 0.9445, -0.40, 0.91)), Vector((side * 0.800, -0.40, 0.91))],
            [Vector((side * 0.9445, -1.15, 0.91)), Vector((side * 0.800, -1.15, 0.91))],
        ]
        make_quad_grid(bm, door_shelf if side > 0 else [[p for p in r] for r in door_shelf])

    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.002)
    link_obj("BODY_Greenhouse_Structure", bm, roots["BODY"], mats["paint"], bevel=0.003)

    # Slim Satin-Dark B-Pillars
    bm_bp = bmesh.new()
    for s in [1.0, -1.0]:
        bmesh.ops.create_cube(bm_bp, size=1.0)
        for v in bm_bp.verts[-8:]:
            v.co.x = v.co.x * 0.028 + s * 0.795
            v.co.y = v.co.y * 0.060 - 0.400
            v.co.z = v.co.z * 0.520 + 1.180
    link_obj("BODY_B_Pillars", bm_bp, roots["BODY"], mats["diffuser"], bevel=0.002)

    # Satin Aluminum Window Surround Trim (Curved greenhouse upper arch)
    bm_trim = bmesh.new()
    for s in [1.0, -1.0]:
        # Upper Arch Trim
        bmesh.ops.create_cube(bm_trim, size=1.0)
        for v in bm_trim.verts[-8:]:
            v.co.x = v.co.x * 0.020 + s * 0.720
            v.co.y = v.co.y * 1.550 - 0.350
            v.co.z = v.co.z * 0.020 + 1.435
        # Lower Waistline Window Trim
        bmesh.ops.create_cube(bm_trim, size=1.0)
        for v in bm_trim.verts[-8:]:
            v.co.x = v.co.x * 0.020 + s * 0.805
            v.co.y = v.co.y * 1.550 - 0.350
            v.co.z = v.co.z * 0.015 + 0.915
    link_obj("TRIM_Window_Surround_Aluminum", bm_trim, roots["BODY"], mats["aluminum"], bevel=0.002)

# ----------------------------------------------------------------------------
# 6. GREENHOUSE OPTICAL GLASS
# ----------------------------------------------------------------------------
def build_greenhouse_glass(roots, mats):
    """
    Constructs the aerodynamic optical glass panels:
    - Raked windshield (cowl Y=0.68 to roof Y=0.15)
    - Side door windows seated directly on the door sill shelf (Z=0.915)
    - Sloping rear window (roof Y=-0.90 to decklid Y=-1.40)
    """
    bm = bmesh.new()
    # 1. Windshield
    ws_rows = [
        [Vector(( 0.75, 0.68, 0.920)), Vector(( 0.0, 0.69, 0.930)), Vector((-0.75, 0.68, 0.920))],
        [Vector(( 0.62, 0.15, 1.435)), Vector(( 0.0, 0.15, 1.448)), Vector((-0.62, 0.15, 1.435))],
    ]
    make_quad_grid(bm, ws_rows)

    # 2. Side Windows (Seated flush on the door shelf at Z=0.915)
    for s in [1.0, -1.0]:
        # Front Door Window
        f_side = [
            [Vector((s * 0.80,  0.66, 0.920)), Vector((s * 0.80, -0.38, 0.920))],
            [Vector((s * 0.64,  0.15, 1.435)), Vector((s * 0.64, -0.38, 1.435))],
        ]
        make_quad_grid(bm, f_side if s > 0 else [[p for p in r] for r in f_side])

        # Rear Door Window & Quarter Glass
        r_side = [
            [Vector((s * 0.80, -0.42, 0.920)), Vector((s * 0.80, -1.15, 0.920)), Vector((s * 0.76, -1.25, 0.920))],
            [Vector((s * 0.64, -0.42, 1.435)), Vector((s * 0.64, -0.92, 1.435)), Vector((s * 0.67, -1.08, 1.340))],
        ]
        make_quad_grid(bm, r_side if s > 0 else [[p for p in r] for r in r_side])

    # 3. Rear Window
    rw_rows = [
        [Vector(( 0.60, -0.92, 1.435)), Vector(( 0.0, -0.92, 1.448)), Vector((-0.60, -0.92, 1.435))],
        [Vector(( 0.72, -1.40, 0.920)), Vector(( 0.0, -1.41, 0.930)), Vector((-0.72, -1.40, 0.920))],
    ]
    make_quad_grid(bm, rw_rows)

    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.002)
    link_obj("GLASS_Greenhouse_Optical", bm, roots["GLASS"], mats["glass"], bevel=0.0)

# ----------------------------------------------------------------------------
# 7. AUDI SINGLEFRAME TRAPEZOIDAL GRILLE & 4 RINGS
# ----------------------------------------------------------------------------
def build_singleframe_grille(roots, mats):
    """
    Constructs the iconic C6 RS6 Singleframe full-height trapezoidal grille:
    - High-gloss dark anthracite honeycomb mesh
    - Matte brushed aluminum surround frame
    - Four interlocking chrome rings emblem centered at the top
    - RS 6 badge (chrome text + red rhombus)
    """
    # 1. Honeycomb Mesh Center Plate
    bm_mesh = bmesh.new()
    grille_grid = [
        [Vector(( 0.35, 2.45, 0.22)), Vector(( 0.0, 2.46, 0.22)), Vector((-0.35, 2.45, 0.22))],
        [Vector(( 0.37, 2.44, 0.52)), Vector(( 0.0, 2.45, 0.52)), Vector((-0.37, 2.44, 0.52))],
        [Vector(( 0.38, 2.43, 0.82)), Vector(( 0.0, 2.44, 0.82)), Vector((-0.38, 2.43, 0.82))],
    ]
    make_quad_grid(bm_mesh, grille_grid)
    link_obj("GRILLE_Singleframe_Mesh", bm_mesh, roots["BODY"], mats["grille_mesh"], bevel=0.002)

    # 2. Brushed Aluminum Outer Surround Frame
    bm_frame = bmesh.new()
    # Top border
    bmesh.ops.create_cube(bm_frame, size=1.0)
    for v in bm_frame.verts[-8:]:
        v.co.x = v.co.x * 0.78 + 0.0
        v.co.y = v.co.y * 0.03 + 2.44
        v.co.z = v.co.z * 0.025 + 0.825
    # Bottom border
    bmesh.ops.create_cube(bm_frame, size=1.0)
    for v in bm_frame.verts[-8:]:
        v.co.x = v.co.x * 0.72 + 0.0
        v.co.y = v.co.y * 0.03 + 2.46
        v.co.z = v.co.z * 0.025 + 0.220
    # Left & Right sides
    for side, x in [("L", 0.375), ("R", -0.375)]:
        bmesh.ops.create_cube(bm_frame, size=1.0)
        for v in bm_frame.verts[-8:]:
            v.co.x = v.co.x * 0.025 + x
            v.co.y = v.co.y * 0.03 + 2.445
            v.co.z = v.co.z * 0.620 + 0.520
    link_obj("GRILLE_Frame_Aluminum", bm_frame, roots["BODY"], mats["aluminum"], bevel=0.003)

    # 3. Four Interlocking Rings Audi Emblem (Centered at top of grille)
    bm_rings = bmesh.new()
    ring_radius = 0.040
    ring_thickness = 0.006
    ring_centers = [-0.080, -0.027, 0.027, 0.080]
    for cx in ring_centers:
        create_torus_bm(bm_rings, ring_radius, ring_thickness, Vector((cx, 2.465, 0.720)), Vector((0, 1, 0.12)), major_segs=20, minor_segs=8)
    link_obj("EMBLEM_Audi_Rings_Front", bm_rings, roots["BODY"], mats["chrome"], bevel=0.0)

    # 4. RS 6 Grille Badge (Silver RS + Red Rhombus)
    bm_rs = bmesh.new()
    bmesh.ops.create_cube(bm_rs, size=1.0)
    for v in bm_rs.verts[-8:]:
        v.co.x = v.co.x * 0.040 + 0.210
        v.co.y = v.co.y * 0.010 + 2.460
        v.co.z = v.co.z * 0.025 + 0.650
    link_obj("EMBLEM_RS_Text_Front", bm_rs, roots["BODY"], mats["chrome"], bevel=0.001)

    bm_rhombus = bmesh.new()
    bmesh.ops.create_cube(bm_rhombus, size=1.0)
    for v in bm_rhombus.verts[-8:]:
        v.co.x = v.co.x * 0.016 + 0.178
        v.co.y = v.co.y * 0.012 + 2.460
        v.co.z = v.co.z * 0.030 + 0.650
    link_obj("EMBLEM_RS_Rhombus_Front", bm_rhombus, roots["BODY"], mats["rs_red"], bevel=0.001)

# ----------------------------------------------------------------------------
# 8. BI-XENON HEADLAMPS & 10-LED BRILLIANT WHITE DRL STRIPS
# ----------------------------------------------------------------------------
def build_headlamps_and_drls(roots, mats):
    """
    Constructs the bi-xenon headlights with pioneering 10-LED DRL bars:
    - Dark composite housing
    - High-transmission polycarbonate outer cover
    - Chrome bi-xenon projector lens
    - Amber turn indicator corner block
    - 10-LED brilliant white Daytime Running Light (DRL) strip along lower edge
    """
    bm_housing = bmesh.new()
    bm_covers = bmesh.new()
    bm_projectors = bmesh.new()
    bm_indicators = bmesh.new()
    bm_drls = bmesh.new()

    for side, x_base, sign in [("L", 0.610, 1.0), ("R", -0.610, -1.0)]:
        # Dark Housing
        bmesh.ops.create_cube(bm_housing, size=1.0)
        for v in bm_housing.verts[-8:]:
            v.co.x = v.co.x * 0.380 + x_base
            v.co.y = v.co.y * 0.100 + 2.360
            v.co.z = v.co.z * 0.120 + 0.720

        # Polycarbonate Aerodynamic Outer Cover
        bmesh.ops.create_cube(bm_covers, size=1.0)
        for v in bm_covers.verts[-8:]:
            v.co.x = v.co.x * 0.385 + x_base
            v.co.y = v.co.y * 0.020 + 2.405
            v.co.z = v.co.z * 0.125 + 0.720

        # Bi-Xenon Projector Barrel
        bmesh.ops.create_cone(bm_projectors, cap_ends=True, cap_tris=False, segments=16, radius1=0.045, radius2=0.045, depth=0.050)
        sub_p = bm_projectors.verts[-32:]
        bmesh.ops.rotate(bm_projectors, verts=sub_p, matrix=Matrix.Rotation(math.radians(82.0), 3, 'X'))
        bmesh.ops.translate(bm_projectors, verts=sub_p, vec=Vector((x_base - 0.080 * sign, 2.390, 0.730)))

        # Amber Turn Indicator
        bmesh.ops.create_cube(bm_indicators, size=1.0)
        for v in bm_indicators.verts[-8:]:
            v.co.x = v.co.x * 0.055 + (x_base + 0.145 * sign)
            v.co.y = v.co.y * 0.035 + 2.370
            v.co.z = v.co.z * 0.100 + 0.720

        # Pioneering 10-LED Brilliant White Daytime Running Light (DRL) Strip
        # Distinct horizontal glowing line along lower contour of headlamp housing
        drl_length = 0.300
        num_leds = 10
        for led_idx in range(num_leds):
            t = (led_idx - (num_leds - 1) / 2.0) / ((num_leds - 1) / 2.0)
            dx = t * (drl_length / 2.0) * sign
            dy = -abs(t) * 0.015
            dz = 0.005 * (1.0 - t*t)
            bmesh.ops.create_cube(bm_drls, size=1.0)
            for v in bm_drls.verts[-8:]:
                v.co.x = v.co.x * 0.020 + (x_base + dx)
                v.co.y = v.co.y * 0.015 + (2.410 + dy)
                v.co.z = v.co.z * 0.015 + (0.665 + dz)

    link_obj("LIGHT_Headlamp_Housings", bm_housing, roots["LIGHTS"], mats["diffuser"], bevel=0.002)
    link_obj("LIGHT_Headlamp_Covers", bm_covers, roots["LIGHTS"], mats["headlamp_lens"], bevel=0.0)
    link_obj("LIGHT_Xenon_Projectors", bm_projectors, roots["LIGHTS"], mats["xenon"], bevel=0.0)
    link_obj("LIGHT_Indicators_Front", bm_indicators, roots["LIGHTS"], mats["amber"], bevel=0.001)
    link_obj("LIGHT_LED_DRL_Strips", bm_drls, roots["LIGHTS"], mats["led_drl"], bevel=0.0)

# ----------------------------------------------------------------------------
# 9. FRONT BUMPER, INTERCOOLER SCOOPS & CHIN SPLITTER LIP
# ----------------------------------------------------------------------------
def build_front_bumper_and_aero(roots, mats):
    # Center Lower Splitter Lip (Matte Aluminum)
    bm_split = bmesh.new()
    bmesh.ops.create_cube(bm_split, size=1.0)
    for v in bm_split.verts:
        v.co.x *= 1.620
        v.co.y = v.co.y * 0.090 + 2.470
        v.co.z = v.co.z * 0.025 + 0.160
    link_obj("AERO_Front_Splitter_Lip", bm_split, roots["AERO"], mats["aluminum"], bevel=0.002)

    # Massive Intercooler Intake Scoops with Horizontal Aluminum Vanes
    bm_scoop = bmesh.new()
    bm_vanes = bmesh.new()
    for side, x in [("L", 0.610), ("R", -0.610)]:
        bmesh.ops.create_cube(bm_scoop, size=1.0)
        for v in bm_scoop.verts[-8:]:
            v.co.x = v.co.x * 0.320 + x
            v.co.y = v.co.y * 0.050 + 2.410
            v.co.z = v.co.z * 0.220 + 0.350

        for vz in [0.410, 0.290]:
            bmesh.ops.create_cube(bm_vanes, size=1.0)
            for v in bm_vanes.verts[-8:]:
                v.co.x = v.co.x * 0.320 + x
                v.co.y = v.co.y * 0.030 + 2.430
                v.co.z = v.co.z * 0.016 + vz

    link_obj("AERO_Intercooler_Scoops", bm_scoop, roots["AERO"], mats["grille_mesh"], bevel=0.002)
    link_obj("AERO_Intercooler_Vanes", bm_vanes, roots["AERO"], mats["aluminum"], bevel=0.002)

# ----------------------------------------------------------------------------
# 10. LED TAILLIGHTS, DUCKTAIL SPOILER & REAR DIFFUSER
# ----------------------------------------------------------------------------
def build_taillights_and_diffuser(roots, mats):
    bm_th = bmesh.new()
    bm_tr = bmesh.new()
    bm_rev = bmesh.new()

    for side, x_base, sign in [("L", 0.620, 1.0), ("R", -0.620, -1.0)]:
        bmesh.ops.create_cube(bm_th, size=1.0)
        for v in bm_th.verts[-8:]:
            v.co.x = v.co.x * 0.400 + x_base
            v.co.y = v.co.y * 0.080 - 2.440
            v.co.z = v.co.z * 0.120 + 0.830

        for idx, z_off in enumerate([-0.035, 0.000, 0.035]):
            bmesh.ops.create_cube(bm_tr, size=1.0)
            for v in bm_tr.verts[-8:]:
                v.co.x = v.co.x * 0.380 + x_base
                v.co.y = v.co.y * 0.020 - 2.470
                v.co.z = v.co.z * 0.015 + (0.830 + z_off)

        bmesh.ops.create_cube(bm_rev, size=1.0)
        for v in bm_rev.verts[-8:]:
            v.co.x = v.co.x * 0.110 + (x_base - 0.100 * sign)
            v.co.y = v.co.y * 0.025 - 2.465
            v.co.z = v.co.z * 0.035 + 0.830

    link_obj("LIGHT_Taillight_Housings", bm_th, roots["LIGHTS"], mats["tail_housing"], bevel=0.002)
    link_obj("LIGHT_Taillight_LED_Ribbons", bm_tr, roots["LIGHTS"], mats["tail_led"], bevel=0.0)
    link_obj("LIGHT_Reverse_Lights", bm_rev, roots["LIGHTS"], mats["amber"], bevel=0.001)

    # Integrated Ducktail Decklid Lip Spoiler
    bm_duck = bmesh.new()
    bmesh.ops.create_cube(bm_duck, size=1.0)
    for v in bm_duck.verts:
        v.co.x *= 1.250
        v.co.y = v.co.y * 0.060 - 2.450
        v.co.z = v.co.z * 0.025 + 0.925
    link_obj("AERO_Rear_Ducktail_Lip", bm_duck, roots["AERO"], mats["paint"], bevel=0.003)

    # Rear Four Audi Rings on Trunk Lid
    bm_rear_rings = bmesh.new()
    ring_centers = [-0.075, -0.025, 0.025, 0.075]
    for cx in ring_centers:
        create_torus_bm(bm_rear_rings, 0.032, 0.0045, Vector((cx, -2.475, 0.840)), Vector((0, -1, 0.10)), major_segs=18, minor_segs=8)
    link_obj("EMBLEM_Audi_Rings_Rear", bm_rear_rings, roots["BODY"], mats["chrome"], bevel=0.0)

    # Rear RS 6 Badge on Trunk Lid
    bm_rear_rs = bmesh.new()
    bmesh.ops.create_cube(bm_rear_rs, size=1.0)
    for v in bm_rear_rs.verts[-8:]:
        v.co.x = v.co.x * 0.035 + 0.280
        v.co.y = v.co.y * 0.008 - 2.470
        v.co.z = v.co.z * 0.022 + 0.820
    link_obj("EMBLEM_RS_Text_Rear", bm_rear_rs, roots["BODY"], mats["chrome"], bevel=0.001)

    bm_rear_rh = bmesh.new()
    bmesh.ops.create_cube(bm_rear_rh, size=1.0)
    for v in bm_rear_rh.verts[-8:]:
        v.co.x = v.co.x * 0.014 + 0.250
        v.co.y = v.co.y * 0.008 - 2.470
        v.co.z = v.co.z * 0.026 + 0.820
    link_obj("EMBLEM_RS_Rhombus_Rear", bm_rear_rh, roots["BODY"], mats["rs_red"], bevel=0.001)

    # Rear Aerodynamic Diffuser (Dark Anthracite with center fins)
    bm_diff = bmesh.new()
    bmesh.ops.create_cube(bm_diff, size=1.0)
    for v in bm_diff.verts:
        v.co.x *= 1.620
        v.co.y = v.co.y * 0.120 - 2.440
        v.co.z = v.co.z * 0.160 + 0.260
    link_obj("AERO_Rear_Diffuser", bm_diff, roots["AERO"], mats["diffuser"], bevel=0.005)

# ----------------------------------------------------------------------------
# 11. SIGNATURE GIANT DUAL OVAL RS EXHAUST TAILPIPES
# ----------------------------------------------------------------------------
def build_oval_rs_exhausts(roots, mats):
    """Constructs the signature massive dual oval RS exhaust pipes."""
    bm_outer = bmesh.new()
    bm_inner = bmesh.new()

    for x in [0.620, -0.620]:
        # Polished Chrome Oval Sleeve (140mm x 95mm)
        bmesh.ops.create_cone(bm_outer, cap_ends=True, cap_tris=False, segments=24, radius1=0.065, radius2=0.065, depth=0.140)
        sub_o = bm_outer.verts[-48:]
        for v in sub_o:
            v.co.x *= 1.25
            v.co.z *= 0.75
        bmesh.ops.rotate(bm_outer, verts=sub_o, matrix=Matrix.Rotation(math.radians(90.0), 3, 'X'))
        bmesh.ops.translate(bm_outer, verts=sub_o, vec=Vector((x, -2.480, 0.240)))

        # Dark Inner Exhaust Bore
        bmesh.ops.create_cone(bm_inner, cap_ends=True, cap_tris=False, segments=24, radius1=0.055, radius2=0.055, depth=0.150)
        sub_i = bm_inner.verts[-48:]
        for v in sub_i:
            v.co.x *= 1.25
            v.co.z *= 0.75
        bmesh.ops.rotate(bm_inner, verts=sub_i, matrix=Matrix.Rotation(math.radians(90.0), 3, 'X'))
        bmesh.ops.translate(bm_inner, verts=sub_i, vec=Vector((x, -2.485, 0.240)))

    link_obj("EXHAUST_Oval_Chrome_Tips", bm_outer, roots["AERO"], mats["chrome"], bevel=0.002)
    link_obj("EXHAUST_Oval_Inner_Bores", bm_inner, roots["AERO"], mats["diffuser"], bevel=0.0)

# ----------------------------------------------------------------------------
# 12. RS EXTERIOR JEWELRY (Mirrors, Antenna, Door Handles)
# ----------------------------------------------------------------------------
def build_exterior_jewelry(roots, mats):
    bm_mirrors = bmesh.new()
    for side, x, sign in [("L", 0.940, 1.0), ("R", -0.940, -1.0)]:
        # Stalk
        bmesh.ops.create_cube(bm_mirrors, size=1.0)
        for v in bm_mirrors.verts[-8:]:
            v.co.x = v.co.x * 0.070 + x * 0.92
            v.co.y = v.co.y * 0.035 + 0.520
            v.co.z = v.co.z * 0.025 + 0.970
        # Housing
        bmesh.ops.create_cube(bm_mirrors, size=1.0)
        for v in bm_mirrors.verts[-8:]:
            v.co.x = v.co.x * 0.160 + x
            v.co.y = v.co.y * 0.100 + 0.500
            v.co.z = v.co.z * 0.080 + 0.990
    link_obj("BODY_RS_Mirrors_Aluminum", bm_mirrors, roots["BODY"], mats["aluminum"], bevel=0.004)

    # Roof Shark-Fin Antenna
    bm_ant = bmesh.new()
    bmesh.ops.create_cube(bm_ant, size=1.0)
    for v in bm_ant.verts:
        v.co.x *= 0.035
        v.co.y = v.co.y * 0.120 - 0.650
        v.co.z = v.co.z * 0.050 + 1.485
    link_obj("BODY_Shark_Fin_Antenna", bm_ant, roots["BODY"], mats["paint"], bevel=0.002)

    # Flush Door Handles
    bm_dh = bmesh.new()
    for x in [0.935, -0.935]:
        for y_pos in [0.250, -0.450]:
            bmesh.ops.create_cube(bm_dh, size=1.0)
            for v in bm_dh.verts[-8:]:
                v.co.x = v.co.x * 0.020 + x
                v.co.y = v.co.y * 0.120 + y_pos
                v.co.z = v.co.z * 0.030 + 0.900
    link_obj("BODY_Door_Handles", bm_dh, roots["BODY"], mats["paint"], bevel=0.002)

# ----------------------------------------------------------------------------
# 13. RECARO RS INTERIOR COCKPIT & CARBON FIBER INLAYS
# ----------------------------------------------------------------------------
def build_recaro_interior(roots, mats):
    bm_dash = bmesh.new()
    # Dashboard
    bmesh.ops.create_cube(bm_dash, size=1.0)
    for v in bm_dash.verts:
        v.co.x *= 1.420
        v.co.y = v.co.y * 0.420 + 0.520
        v.co.z = v.co.z * 0.220 + 0.880
    # Center Console
    bmesh.ops.create_cube(bm_dash, size=1.0)
    for v in bm_dash.verts[-8:]:
        v.co.x *= 0.340
        v.co.y = v.co.y * 0.850 - 0.050
        v.co.z = v.co.z * 0.320 + 0.620
    # Recaro RS Front Bucket Seats
    for sx in [0.420, -0.420]:
        # Cushion
        bmesh.ops.create_cube(bm_dash, size=1.0)
        for v in bm_dash.verts[-8:]:
            v.co.x = v.co.x * 0.480 + sx
            v.co.y = v.co.y * 0.500 - 0.050
            v.co.z = v.co.z * 0.160 + 0.480
        # Bolstered Backrest
        bmesh.ops.create_cube(bm_dash, size=1.0)
        sub_b = bm_dash.verts[-8:]
        for v in sub_b:
            v.co.x *= 0.460
            v.co.y *= 0.180
            v.co.z *= 0.580
        bmesh.ops.rotate(bm_dash, verts=sub_b, matrix=Matrix.Rotation(math.radians(-14.0), 3, 'X'))
        bmesh.ops.translate(bm_dash, verts=sub_b, vec=Vector((sx, -0.320, 0.820)))
        # Headrest
        bmesh.ops.create_cube(bm_dash, size=1.0)
        for v in bm_dash.verts[-8:]:
            v.co.x = v.co.x * 0.240 + sx
            v.co.y = v.co.y * 0.120 - 0.420
            v.co.z = v.co.z * 0.160 + 1.150
    # Rear Bench & Package Shelf
    bmesh.ops.create_cube(bm_dash, size=1.0)
    for v in bm_dash.verts[-8:]:
        v.co.x *= 1.380
        v.co.y = v.co.y * 0.550 - 1.050
        v.co.z = v.co.z * 0.220 + 0.520
    bmesh.ops.create_cube(bm_dash, size=1.0)
    for v in bm_dash.verts[-8:]:
        v.co.x *= 1.380
        v.co.y = v.co.y * 0.600 - 1.750
        v.co.z = v.co.z * 0.040 + 0.950

    link_obj("CABIN_Leather_Interior", bm_dash, roots["CABIN"], mats["leather"], bevel=0.004)

    # Carbon Fiber Dashboard & Console Inlays
    bm_carbon = bmesh.new()
    bmesh.ops.create_cube(bm_carbon, size=1.0)
    for v in bm_carbon.verts:
        v.co.x *= 1.400
        v.co.y = v.co.y * 0.020 + 0.480
        v.co.z = v.co.z * 0.045 + 0.870
    bmesh.ops.create_cube(bm_carbon, size=1.0)
    for v in bm_carbon.verts[-8:]:
        v.co.x *= 0.280
        v.co.y = v.co.y * 0.800 - 0.050
        v.co.z = v.co.z * 0.015 + 0.785
    link_obj("CABIN_Carbon_Inlays", bm_carbon, roots["CABIN"], mats["carbon"], bevel=0.001)

    # 3-Spoke Flat-Bottom RS Sport Steering Wheel
    bm_sw = bmesh.new()
    create_torus_bm(bm_sw, 0.175, 0.016, Vector((0.420, 0.280, 0.910)), Vector((0, 0.92, 0.38)), major_segs=24, minor_segs=8)
    link_obj("CABIN_Steering_Wheel", bm_sw, roots["CABIN"], mats["leather"], bevel=0.0)

# ----------------------------------------------------------------------------
# 14. SEALED UNDERBODY & INNER WHEEL WELL TUBS
# ----------------------------------------------------------------------------
def build_underbody(roots, mats, f_axle, r_axle, wheel_r):
    bm_pan = bmesh.new()
    bmesh.ops.create_cube(bm_pan, size=1.0)
    for v in bm_pan.verts:
        v.co.x *= 1.700
        v.co.y *= 4.800
        v.co.z = v.co.z * 0.030 + 0.140
    link_obj("CHASSIS_Underbody_Pan", bm_pan, roots["UNDERBODY"], mats["diffuser"], bevel=0.0)

    # 4 Enclosed Inner Wheel Well Tubs
    bm_tubs = bmesh.new()
    for wx, wy in [(0.807, f_axle), (-0.807, f_axle), (0.8185, r_axle), (-0.8185, r_axle)]:
        bmesh.ops.create_cone(bm_tubs, cap_ends=True, cap_tris=False, segments=16, radius1=0.385, radius2=0.385, depth=0.280)
        sub_t = bm_tubs.verts[-32:]
        bmesh.ops.rotate(bm_tubs, verts=sub_t, matrix=Matrix.Rotation(math.radians(90.0), 3, 'Y'))
        bmesh.ops.translate(bm_tubs, verts=sub_t, vec=Vector((wx * 0.90, wy, 0.360)))
    link_obj("CHASSIS_Wheel_Tubs", bm_tubs, roots["UNDERBODY"], mats["diffuser"], bevel=0.0)

# ----------------------------------------------------------------------------
# 15. MASTER BUILD ORCHESTRATOR & GLTF EXPORT
# ----------------------------------------------------------------------------
def build_audi_rs6_c6():
    print("=" * 80)
    print("STARTING PROCEDURAL BUILD: AUDI RS6 SEDAN (C6) 2000s FLAGSHIP SEDAN")
    print("=" * 80)

    safe_reset()
    mats = create_rs6_materials()

    WB = 2.846
    f_axle = 1.423
    r_axle = -1.423
    f_track = 1.614
    r_track = 1.637
    wheel_r = 0.350
    tire_w = 0.275

    root = bpy.data.objects.new("VEHICLE_ROOT", None)
    bpy.context.scene.collection.objects.link(root)

    def make_group(name):
        obj = bpy.data.objects.new(name, None)
        obj.parent = root
        bpy.context.scene.collection.objects.link(obj)
        return obj

    roots = {
        "ROOT": root,
        "PLATFORM": make_group("PLATFORM"),
        "BODY": make_group("BODY"),
        "AERO": make_group("AERO"),
        "WHEELS": make_group("WHEELS"),
        "TIRES": make_group("TIRES"),
        "BRAKES": make_group("BRAKES"),
        "GLASS": make_group("GLASS"),
        "LIGHTS": make_group("LIGHTS"),
        "CABIN": make_group("CABIN"),
        "UNDERBODY": make_group("UNDERBODY"),
    }

    # 1. Wheels & Tires
    wheel_positions = [
        ("WHEEL_FL", Vector(( f_track * 0.5,  f_axle, wheel_r)), True),
        ("WHEEL_FR", Vector((-f_track * 0.5,  f_axle, wheel_r)), False),
        ("WHEEL_RL", Vector(( r_track * 0.5,  r_axle, wheel_r)), True),
        ("WHEEL_RR", Vector((-r_track * 0.5,  r_axle, wheel_r)), False),
    ]
    for name, pos, is_left in wheel_positions:
        build_rs6_wheel(roots, mats, name, pos, is_left, wheel_r, tire_w)

    # 2. Body Shell, Greenhouse & Underbody
    build_rs6_shell(roots, mats, f_axle, r_axle)
    build_greenhouse_structure(roots, mats)
    build_greenhouse_glass(roots, mats)
    build_underbody(roots, mats, f_axle, r_axle, wheel_r)

    # 3. Grille, Lighting & Aero
    build_singleframe_grille(roots, mats)
    build_headlamps_and_drls(roots, mats)
    build_front_bumper_and_aero(roots, mats)
    build_taillights_and_diffuser(roots, mats)
    build_oval_rs_exhausts(roots, mats)
    build_exterior_jewelry(roots, mats)
    build_recaro_interior(roots, mats)

    # 4. Canonical CAD Hardpoints
    hardpoints = [
        ("FRONT_SUSPENSION_L",    Vector(( f_track * 0.5,  f_axle, wheel_r))),
        ("FRONT_SUSPENSION_R",    Vector((-f_track * 0.5,  f_axle, wheel_r))),
        ("REAR_SUSPENSION_L",     Vector(( r_track * 0.5,  r_axle, wheel_r))),
        ("REAR_SUSPENSION_R",     Vector((-r_track * 0.5,  r_axle, wheel_r))),
        ("ENGINE_MOUNT_FRONT",    Vector(( 0.000,   1.480, 0.520))),
        ("TRANSMISSION_MOUNT",    Vector(( 0.000,   0.650, 0.420))),
        ("EXHAUST_MOUNT",         Vector(( 0.320,  -2.050, 0.240))),
        ("FRONT_SPLITTER_MOUNT",  Vector(( 0.000,   2.450, 0.150))),
        ("RADIATOR_MOUNT",        Vector(( 0.000,   2.250, 0.480))),
    ]
    for hp_name, pos in hardpoints:
        emp = bpy.data.objects.new(hp_name, None)
        emp.empty_display_type = 'ARROWS'
        emp.empty_display_size = 0.12
        emp.location = pos
        emp.parent = roots["AERO"]
        bpy.context.scene.collection.objects.link(emp)

    # 5. Dual-Mode GLB Export
    export_targets = [
        PUBLIC_VEHICLE_GLB,
        PUBLIC_CAR_GLB,
        EXPORTS_CAR_GLB,
    ]

    bpy.ops.object.select_all(action='DESELECT')
    for o in bpy.data.objects:
        o.select_set(True)
    bpy.context.view_layer.objects.active = root

    for target in export_targets:
        print(f"[RS6_BUILDER] Exporting GLB -> {target}...")
        bpy.ops.export_scene.gltf(
            filepath=target,
            export_format='GLB',
            use_selection=True,
            export_apply=True,
            export_yup=True,
            export_materials='EXPORT',
        )
        print(f"[RS6_BUILDER] Saved: {target} ({os.path.getsize(target)} bytes)")

    print("=" * 80)
    print("AUDI RS6 SEDAN (C6) BUILD & EXPORT COMPLETED SUCCESSFULLY!")
    print("=" * 80)
    return True

if __name__ == "__main__" or __name__ == "<string>" or "bpy" in globals():
    build_audi_rs6_c6()
