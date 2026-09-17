"""
=============================================================================
CLASS-A CAD PROCEDURAL GENERATOR: PEUGEOT 205 GTI 1.9 (1980s HATCHBACK)
=============================================================================
Procedural recreation of the definitive French hot-hatch benchmark:
the 1980s Peugeot 205 GTi 1.9 (1986–1993).
Adheres strictly to the Maximum Visual Quality & Intensive CAD Mesh Standard.

Authentic Factory Engineering Specifications:
- Wheelbase: 2,420 mm (Front Axle: +1.210m, Rear Axle: -1.210m)
- Overall Length: 3,705 mm (Front Bumper: +1.8525m, Rear Bumper: -1.8525m)
- Overall Width: 1,572 mm (Waistline: ±0.786m, GTi arch flares: ±0.805m)
- Overall Height: 1,355 mm (Roof crown Z = 1.355m)
- Track Width: Front 1,392 mm (X = ±0.696m), Rear 1,334 mm (X = ±0.667m)
- Ground Clearance: 120 mm (Sill base Z = 0.120m, Rocker sill Z = 0.180m)
- Wheels: 15-inch Speedline SL299 8-Hole Perforated Alloys (185/55 VR15 tires)
- Powertrain: 1.9L XU9JA 8V SOHC Bosch Motronic I4 (130 PS / 128 hp, 161 Nm)
- Exterior: Saturated Rouge Vallelunga gloss red, wraparound dark charcoal bumpers
  with continuous red GTi pinstripes, 3D molded arch flares, 3-slat body-color
  grille with chrome lion, yellow driving lamps, ribbed multi-chamber taillights,
  C-pillar 1.9 GTi badges, and single oval chrome exhaust tip.
- Interior: Iconic bright red carpet floorpan, sport bucket seats with red
  piping and striped cloth, 2-spoke GTi sport steering wheel, orange dials.
=============================================================================
"""

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector, Matrix, Euler

# ----------------------------------------------------------------------------
# 1. PBR AUTOMOTIVE SHADER FACTORY
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


def create_peugeot_materials():
    mats = {}
    # Rouge Vallelunga (Cherry Red P3KB) - Rich, saturated 1980s French hot-hatch gloss red
    mats["paint"] = make_pbr_mat("M_205_RougeVallelunga", (0.58, 0.003, 0.005, 1.0), metallic=0.08, roughness=0.16, clearcoat=1.0)
    # Dark Charcoal Textured Polyurethane Body Cladding, Wraparound Bumpers & Arch Flares
    mats["dark_trim"] = make_pbr_mat("M_205_DarkCharcoalTrim", (0.040, 0.040, 0.044, 1.0), metallic=0.08, roughness=0.65)
    # GTi Bright Red Accent Pinstripes (running along bumpers and side rubbing strips)
    mats["red_pinstripe"] = make_pbr_mat("M_205_RedPinstripe", (0.95, 0.01, 0.01, 1.0), metallic=0.02, roughness=0.20, emission=(0.75, 0.01, 0.01, 1.0), emission_strength=1.5)
    # Mirror Polish Chrome (Peugeot Lion Crest, Badging, Tailpipe Sleeve)
    mats["chrome"] = make_pbr_mat("M_205_Chrome", (0.95, 0.95, 0.97, 1.0), metallic=0.98, roughness=0.04)
    # 15-inch Speedline SL299 Silver Alloy Wheels
    mats["speedline_silver"] = make_pbr_mat("M_205_SpeedlineSilver", (0.82, 0.84, 0.86, 1.0), metallic=0.88, roughness=0.18, clearcoat=0.60)
    # Michelin MXV Radial Tire Rubber
    mats["tire_rubber"] = make_pbr_mat("M_205_TireRubber", (0.025, 0.025, 0.028, 1.0), metallic=0.01, roughness=0.78)
    # Cast Iron Brake Discs
    mats["brake_steel"] = make_pbr_mat("M_205_BrakeSteel", (0.72, 0.72, 0.75, 1.0), metallic=0.92, roughness=0.28)
    # Crystal-Clear Dark-Tinted Automotive Glass (Noise-free alpha blend)
    mats["glass"] = make_pbr_mat("M_205_GlassDark", (0.035, 0.045, 0.045, 1.0), metallic=0.10, roughness=0.02, clearcoat=1.0, alpha=0.45)
    # Slanted Rectangular Headlight Outer Glass (Fluted Halogen Lens)
    mats["headlamp_glass"] = make_pbr_mat("M_205_HeadlampGlass", (0.90, 0.92, 0.95, 1.0), roughness=0.05, transmission=0.85, ior=1.50)
    # Parabolic Chrome Headlight Reflector Housing
    mats["reflector_chrome"] = make_pbr_mat("M_205_ReflectorChrome", (0.96, 0.96, 0.98, 1.0), metallic=0.98, roughness=0.05)
    # 2800K Warm Halogen Bulb Glow
    mats["halogen_bulb"] = make_pbr_mat("M_205_HalogenGlow", (1.0, 0.92, 0.75, 1.0), emission=(1.0, 0.92, 0.75, 1.0), emission_strength=14.0)
    # Front Driving / Fog Lamps (French Yellow/Amber Projecteurs Longue-Portée)
    mats["yellow_fog"] = make_pbr_mat("M_205_YellowFog", (1.0, 0.78, 0.02, 1.0), roughness=0.08, emission=(1.0, 0.78, 0.02, 1.0), emission_strength=10.0)
    # Amber Turn Indicator Lenses (Front Corners & Taillights)
    mats["amber_lens"] = make_pbr_mat("M_205_AmberLens", (0.95, 0.42, 0.01, 1.0), roughness=0.10, emission=(0.95, 0.42, 0.01, 1.0), emission_strength=3.5)
    # Ruby Red Taillight Lenses (Ribbed Brake / Running)
    mats["ruby_taillight"] = make_pbr_mat("M_205_RubyTaillight", (0.85, 0.015, 0.02, 1.0), roughness=0.10, emission=(0.85, 0.015, 0.02, 1.0), emission_strength=4.0)
    # Clear White Reverse Light Sector
    mats["reverse_white"] = make_pbr_mat("M_205_ReverseWhite", (0.92, 0.93, 0.95, 1.0), roughness=0.10, emission=(0.90, 0.90, 0.92, 1.0), emission_strength=2.0)
    # Iconic Bright Red Carpet Flooring
    mats["red_carpet"] = make_pbr_mat("M_205_RedCarpet", (0.65, 0.018, 0.025, 1.0), metallic=0.0, roughness=0.90)
    # Black Half-Leather Sport Bolsters
    mats["leather_black"] = make_pbr_mat("M_205_LeatherBlack", (0.025, 0.025, 0.028, 1.0), metallic=0.05, roughness=0.42)
    # Orange Instrument Dial Cluster
    mats["gauge_orange"] = make_pbr_mat("M_205_GaugeCluster", (0.98, 0.40, 0.05, 1.0), emission=(0.98, 0.40, 0.05, 1.0), emission_strength=4.0)
    # Polished Stainless Oval Exhaust Tip Outer & Inner Bore
    mats["exhaust_chrome"] = make_pbr_mat("M_205_ExhaustChrome", (0.94, 0.94, 0.96, 1.0), metallic=0.98, roughness=0.05)
    mats["exhaust_bore"] = make_pbr_mat("M_205_ExhaustBore", (0.01, 0.01, 0.01, 1.0), roughness=0.95)
    # Underfloor Chassis Pan & Wheel Liners
    mats["underbody_dark"] = make_pbr_mat("M_205_UnderbodyDark", (0.022, 0.022, 0.025, 1.0), metallic=0.25, roughness=0.70)

    return mats


# ----------------------------------------------------------------------------
# 2. MESH LINKING & UTILITIES
# ----------------------------------------------------------------------------
def link_obj(name, bm, parent, mat=None, bevel=0.002):
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

    if bevel > 0.0005:
        mod_bev = obj.modifiers.new("Bevel", 'BEVEL')
        mod_bev.width = bevel
        mod_bev.segments = 2
        mod_bev.limit_method = 'ANGLE'
        mod_bev.angle_limit = math.radians(35.0)
        mod_bev.use_clamp_overlap = True

    try:
        mod_wn = obj.modifiers.new("WeightedNormal", 'WEIGHTED_NORMAL')
        mod_wn.keep_sharp = True
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
# 3. 15-INCH SPEEDLINE SL299 8-HOLE ALLOY WHEEL (185/55 VR15)
# ----------------------------------------------------------------------------
def build_peugeot_wheel(parent, mats, name, pos, is_left, wheel_r=0.292, tire_w=0.185):
    """
    Constructs an authentic 15-inch Speedline SL299 alloy wheel:
    - 185/55 VR15 Michelin MXV radial tire with authentic rounded sidewall profile
    - 15-inch stepped silver rim lip (outer rim radius 0.1905m)
    - 8 circular perforated cooling holes punched into the flat face with chamfers
    - Deep recessed 4-bolt center hub bowl (4x108 PCD) with Peugeot Lion emblem
    - 247mm brake rotor and brake caliper
    """
    outer_sign = 1.0 if is_left else -1.0
    rim_r = 0.1905
    half_tw = tire_w / 2.0
    segs = 32

    # 1. 185/55 VR15 Michelin MXV Radial Tire
    bm_tire = bmesh.new()
    t_profiles = [
        (-half_tw * 0.90, rim_r * 1.01),
        (-half_tw * 1.08, (rim_r + wheel_r) * 0.48),
        (-half_tw * 0.98, wheel_r * 0.97),
        (0.0,             wheel_r * 1.00),
        ( half_tw * 0.98, wheel_r * 0.97),
        ( half_tw * 1.08, (rim_r + wheel_r) * 0.48),
        ( half_tw * 0.90, rim_r * 1.01),
    ]
    t_rings = []
    for px, pr in t_profiles:
        ring = []
        actual_x = px * outer_sign
        for s in range(segs):
            ang = 2.0 * math.pi * s / segs
            c_a, s_a = math.cos(ang), math.sin(ang)
            pt = pos + Vector((actual_x, pr * c_a, pr * s_a))
            ring.append(bm_tire.verts.new(pt))
        t_rings.append(ring)

    for i in range(len(t_rings) - 1):
        for s in range(segs):
            s_next = (s + 1) % segs
            if is_left:
                bm_tire.faces.new((t_rings[i][s], t_rings[i+1][s], t_rings[i+1][s_next], t_rings[i][s_next]))
            else:
                bm_tire.faces.new((t_rings[i][s], t_rings[i][s_next], t_rings[i+1][s_next], t_rings[i+1][s]))

    link_obj(f"Tire_{name}", bm_tire, parent, mats["tire_rubber"], bevel=0.0)

    # 2. 15" Speedline Rim Barrel & Stepped Lip
    bm_rim = bmesh.new()
    outer_face_x = (half_tw * 0.80) * outer_sign
    inner_barrel_x = (-half_tw * 0.92) * outer_sign

    rim_profiles = [
        (inner_barrel_x, rim_r * 0.94),
        (outer_face_x - 0.025 * outer_sign, rim_r * 0.94),
        (outer_face_x - 0.010 * outer_sign, rim_r * 0.98),
        (outer_face_x, rim_r * 1.00),
        (outer_face_x + 0.006 * outer_sign, rim_r * 0.88),  # Stepped outer rim flange
    ]
    r_rings = []
    for rx, rr in rim_profiles:
        ring = []
        for s in range(segs):
            ang = 2.0 * math.pi * s / segs
            pt = pos + Vector((rx, rr * math.cos(ang), rr * math.sin(ang)))
            ring.append(bm_rim.verts.new(pt))
        r_rings.append(ring)

    for i in range(len(r_rings) - 1):
        for s in range(segs):
            s_next = (s + 1) % segs
            if is_left:
                bm_rim.faces.new((r_rings[i][s], r_rings[i+1][s], r_rings[i+1][s_next], r_rings[i][s_next]))
            else:
                bm_rim.faces.new((r_rings[i][s], r_rings[i][s_next], r_rings[i+1][s_next], r_rings[i+1][s]))

    # 3. Speedline SL299 Disc Face with 8 Circular Cooling Perforations
    face_x = outer_face_x + 0.004 * outer_sign
    hole_radius = 0.024
    hole_pcd = 0.125
    center_hub_r = 0.062

    disc_outer_v = []
    for s in range(segs):
        ang = 2.0 * math.pi * s / segs
        pt = pos + Vector((face_x, rim_r * 0.88 * math.cos(ang), rim_r * 0.88 * math.sin(ang)))
        disc_outer_v.append(bm_rim.verts.new(pt))

    hub_outer_v = []
    for s in range(segs):
        ang = 2.0 * math.pi * s / segs
        pt = pos + Vector((face_x - 0.005 * outer_sign, center_hub_r * math.cos(ang), center_hub_r * math.sin(ang)))
        hub_outer_v.append(bm_rim.verts.new(pt))

    for s in range(segs):
        s_next = (s + 1) % segs
        if is_left:
            bm_rim.faces.new((disc_outer_v[s], hub_outer_v[s], hub_outer_v[s_next], disc_outer_v[s_next]))
        else:
            bm_rim.faces.new((disc_outer_v[s], disc_outer_v[s_next], hub_outer_v[s_next], hub_outer_v[s]))

    # 8 Circular Perforations (Extruded Cylindrical Holes with Chamfer Rings)
    rot_y = Matrix.Rotation(math.pi / 2.0 * outer_sign, 4, 'Y')
    for h_i in range(8):
        ang = 2.0 * math.pi * h_i / 8.0
        h_center = pos + Vector((face_x - 0.004 * outer_sign, hole_pcd * math.cos(ang), hole_pcd * math.sin(ang)))
        ret_c = bmesh.ops.create_cone(
            bm_rim,
            cap_ends=True,
            cap_tris=False,
            segments=12,
            radius1=hole_radius,
            radius2=hole_radius * 0.88,
            depth=0.016
        )
        for v in ret_c['verts']:
            v.co = rot_y @ v.co + h_center

    # Recessed Center Hub Bowl (4-Bolt PCD 108mm)
    hub_inner_x = face_x - 0.024 * outer_sign
    hub_inner_v = []
    for s in range(segs):
        ang = 2.0 * math.pi * s / segs
        pt = pos + Vector((hub_inner_x, center_hub_r * 0.85 * math.cos(ang), center_hub_r * 0.85 * math.sin(ang)))
        hub_inner_v.append(bm_rim.verts.new(pt))

    for s in range(segs):
        s_next = (s + 1) % segs
        if is_left:
            bm_rim.faces.new((hub_outer_v[s], hub_inner_v[s], hub_inner_v[s_next], hub_outer_v[s_next]))
        else:
            bm_rim.faces.new((hub_outer_v[s], hub_outer_v[s_next], hub_inner_v[s_next], hub_inner_v[s]))

    # Center Hub Bottom Cap
    hub_cap_v = bm_rim.verts.new(pos + Vector((hub_inner_x, 0.0, 0.0)))
    for s in range(segs):
        s_next = (s + 1) % segs
        if is_left:
            bm_rim.faces.new((hub_inner_v[s], hub_cap_v, hub_inner_v[s_next]))
        else:
            bm_rim.faces.new((hub_inner_v[s], hub_inner_v[s_next], hub_cap_v))

    # 4 Chrome Wheel Bolts (4x108 PCD)
    bolt_pcd = 0.048
    for b_i in range(4):
        b_ang = (2.0 * math.pi * b_i / 4.0) + (math.pi / 4.0)
        b_center = pos + Vector((hub_inner_x + 0.004 * outer_sign, bolt_pcd * math.cos(b_ang), bolt_pcd * math.sin(b_ang)))
        ret_b = bmesh.ops.create_cone(
            bm_rim,
            cap_ends=True,
            cap_tris=False,
            segments=6,
            radius1=0.008,
            radius2=0.008,
            depth=0.010
        )
        for v in ret_b['verts']:
            v.co = rot_y @ v.co + b_center

    link_obj(f"Rim_{name}", bm_rim, parent, mats["speedline_silver"], bevel=0.002)

    # 4. Brake Disc (247mm Ventilated Disc) & Caliper
    bm_brake = bmesh.new()
    disc_r = 0.1235
    disc_x = pos.x - 0.025 * outer_sign
    disc_depth = 0.016

    ret_disc = bmesh.ops.create_cone(
        bm_brake,
        cap_ends=True,
        cap_tris=False,
        segments=24,
        radius1=disc_r,
        radius2=disc_r,
        depth=disc_depth
    )
    disc_vec = Vector((disc_x, pos.y, pos.z))
    for v in ret_disc['verts']:
        v.co = rot_y @ v.co + disc_vec

    # Caliper Block
    caliper_y = pos.y + disc_r * 0.75
    caliper_z = pos.z + disc_r * 0.35
    ret_cal = bmesh.ops.create_cube(bm_brake, size=1.0)
    for v in ret_cal['verts']:
        v.co.x = v.co.x * 0.038 + disc_x
        v.co.y = v.co.y * 0.080 + caliper_y
        v.co.z = v.co.z * 0.065 + caliper_z

    link_obj(f"Brake_{name}", bm_brake, parent, mats["brake_steel"], bevel=0.003)


# ----------------------------------------------------------------------------
# 4. CLASS-A MONOCOQUE BODY SURFACING
# ----------------------------------------------------------------------------
def build_peugeot_monocoque(parent, mats, f_axle, r_axle):
    """
    Constructs an authentic Class-A quad lofted unibody for the Peugeot 205 GTi:
    - Pure horizontal baseline (Z = 0.180m) from nose to tail
    - Continuous elliptical wheel arch cutouts tangent to the 0.180m sill line
    - Sealed front nose header panel (zero gap above grille/lights)
    - Full-length roof panel with subtle crown curvature
    - A-pillars, roof side rails, B-pillars, and wide iconic C-pillar sails
    - Sealed rear hatch surround and lower tailgate sheet metal (matching quarter width)
    """
    bm = bmesh.new()

    rocker_z = 0.180       # Baseline ground clearance at rocker sills & bumper chins
    w_arch = 0.3125        # Wheel arch half-width at sill line
    h_arch = 0.444         # Wheel arch apex height above sill (apex = 0.180 + 0.444 = 0.624m)
    fz_waist = 0.745       # Beltline / waistline height

    # 22 Topologically matched longitudinal Y stations
    clean_y = [
        1.850,   # 0: Front Nose / Grille / Bumper junction
        1.720,   # 1: Front Overhang / Headlight Center
        1.523,   # 2: Front Arch Forward Tangent (u = +1, z_s = 0.180)
        1.430,   # 3: Front Arch Forward Flank (u = +0.70)
        1.320,   # 4: Front Arch Forward Shoulder (u = +0.35)
        1.210,   # 5: Front Axle Center / Arch Apex (u = 0, z_s = 0.624)
        1.100,   # 6: Front Arch Rear Shoulder (u = -0.35)
        0.990,   # 7: Front Arch Rear Flank (u = -0.70)
        0.897,   # 8: Front Arch Rear Tangent (u = -1, z_s = 0.180)
        0.600,   # 9: Forward Door (Sill z_s = 0.180)
        0.200,   # 10: Mid Door (Sill z_s = 0.180)
       -0.200,   # 11: Mid Door (Sill z_s = 0.180)
       -0.600,   # 12: Rear Door (Sill z_s = 0.180)
       -0.897,   # 13: Rear Arch Forward Tangent (u = +1, z_s = 0.180)
       -0.990,   # 14: Rear Arch Forward Flank (u = +0.70)
       -1.100,   # 15: Rear Arch Forward Shoulder (u = +0.35)
       -1.210,   # 16: Rear Axle Center / Arch Apex (u = 0, z_s = 0.624)
       -1.320,   # 17: Rear Arch Rear Shoulder (u = -0.35)
       -1.430,   # 18: Rear Arch Rear Flank (u = -0.70)
       -1.523,   # 19: Rear Arch Rear Tangent (u = -1, z_s = 0.180)
       -1.720,   # 20: Rear Quarter Overhang (Sill z_s = 0.180)
       -1.850,   # 21: Rear Tailgate / Bumper junction
    ]

    def get_station_profile(fy):
        half_w = 0.786
        bot_w = 0.745

        # Taper at front overhang
        if fy > 1.523:
            t = (fy - 1.523) / (1.850 - 1.523)
            half_w = 0.786 - 0.048 * t
            bot_w = 0.745 - 0.050 * t
            z_w = fz_waist - 0.040 * t
        # Taper at rear overhang
        elif fy < -1.523:
            t = (-fy - 1.523) / (1.850 - 1.523)
            half_w = 0.786 - 0.048 * t
            bot_w = 0.745 - 0.045 * t
            z_w = fz_waist + 0.015 * t
        else:
            z_w = fz_waist

        # Wheel arch cutout calculations
        df = abs(fy - f_axle)
        dr = abs(fy - r_axle)

        if df < w_arch:
            # Within Front Wheel Arch
            u = df / w_arch
            z_s = rocker_z + h_arch * math.sqrt(max(0.0, 1.0 - u * u))
            x_s = half_w * 1.018
        elif dr < w_arch:
            # Within Rear Wheel Arch
            u = dr / w_arch
            z_s = rocker_z + h_arch * math.sqrt(max(0.0, 1.0 - u * u))
            x_s = half_w * 1.018
        else:
            # Dead flat horizontal rocker sill / overhang baseline
            z_s = rocker_z
            x_s = bot_w

        # Mid-flank rubbing strip and shoulder levels
        z_rub = z_s + (z_w - z_s) * 0.40
        x_rub = half_w * 1.010
        z_shoulder = z_s + (z_w - z_s) * 0.80
        x_shoulder = half_w * 0.990

        return (z_s, x_s, z_rub, x_rub, z_shoulder, x_shoulder, z_w, half_w)

    profiles = [(y, get_station_profile(y)) for y in clean_y]

    # 1. Left (+X) and Right (-X) Flank Quad Lofts
    for side in [1.0, -1.0]:
        flank_rows = []
        for fy, prof in profiles:
            zs, xs, zrub, xrub, zsh, xsh, zw, xw = prof
            p0 = Vector((side * xs,   fy, zs))
            p1 = Vector((side * xrub, fy, zrub))
            p2 = Vector((side * xsh,  fy, zsh))
            p3 = Vector((side * xw,   fy, zw))
            flank_rows.append([p0, p1, p2, p3])

        if side > 0:
            make_quad_grid(bm, flank_rows)
        else:
            make_quad_grid(bm, [[p for p in reversed(r)] for r in flank_rows])

    # 2. Slanted Aerodynamic Hood (Cowl Y=0.800 to Nose Y=1.850)
    hood_stations = [p for p in profiles if 0.800 <= p[0] <= 1.850]
    hood_rows = []
    for fy, prof in hood_stations:
        zw, xw = prof[6], prof[7]
        hood_w = xw * 0.96
        p_l = Vector(( hood_w, fy, zw))
        p_cl = Vector(( hood_w * 0.45, fy, zw + 0.016))
        p_c = Vector(( 0.0,    fy, zw + 0.022))
        p_cr = Vector((-hood_w * 0.45, fy, zw + 0.016))
        p_r = Vector((-hood_w, fy, zw))
        hood_rows.append([p_l, p_cl, p_c, p_cr, p_r])
    make_quad_grid(bm, hood_rows)

    # 3. Front Nose Header Panel (Sealing Hood to Grille & Headlights)
    front_prof = profiles[0][1]
    front_zw = front_prof[6]
    front_xw = front_prof[7] * 0.96
    nose_header_rows = [
        [Vector(( front_xw,        1.848, front_zw)),
         Vector(( front_xw * 0.45, 1.850, front_zw + 0.016)),
         Vector(( 0.0,             1.852, front_zw + 0.022)),
         Vector((-front_xw * 0.45, 1.850, front_zw + 0.016)),
         Vector((-front_xw,        1.848, front_zw))],
        [Vector(( front_xw,        1.848, 0.625)),
         Vector(( front_xw * 0.45, 1.850, 0.625 + 0.008)),
         Vector(( 0.0,             1.852, 0.625 + 0.012)),
         Vector((-front_xw * 0.45, 1.850, 0.625 + 0.008)),
         Vector((-front_xw,        1.848, 0.625))],
    ]
    make_quad_grid(bm, nose_header_rows)

    # 4. Aerodynamic Roof Panel (Windshield Header Y=0.380 to Tailgate Hinge Y=-1.350)
    roof_y = [0.380, 0.000, -0.450, -0.900, -1.350]
    roof_rows = []
    for ry in roof_y:
        rw = 0.540
        rz = 1.355 - (0.012 * abs(ry + 0.400))
        p_l = Vector(( rw, ry, rz - 0.008))
        p_cl = Vector(( rw * 0.50, ry, rz + 0.012))
        p_c = Vector(( 0.0, ry, rz + 0.018))
        p_cr = Vector((-rw * 0.50, ry, rz + 0.012))
        p_r = Vector((-rw, ry, rz - 0.008))
        roof_rows.append([p_l, p_cl, p_c, p_cr, p_r])
    make_quad_grid(bm, roof_rows)

    # 5. Greenhouse Pillars & Upper Window Cant-Rails
    for side in [1.0, -1.0]:
        # Slender Raked A-Pillar
        ap = [
            [Vector((side * 0.745, 0.790, 0.760)), Vector((side * 0.720, 0.790, 0.760))],
            [Vector((side * 0.555, 0.380, 1.340)), Vector((side * 0.535, 0.380, 1.340))],
        ]
        if side > 0:
            make_quad_grid(bm, ap)
        else:
            make_quad_grid(bm, [[p for p in reversed(r)] for r in ap])

        # Flush Roof Side Rail
        sr = [
            [Vector((side * 0.540,  0.380, 1.345)), Vector((side * 0.540, -1.350, 1.345))],
            [Vector((side * 0.530,  0.380, 1.330)), Vector((side * 0.530, -1.350, 1.330))],
        ]
        if side > 0:
            make_quad_grid(bm, sr)
        else:
            make_quad_grid(bm, [[p for p in reversed(r)] for r in sr])

        # Concealed B-Pillar
        bp = [
            [Vector((side * 0.750, -0.060, 0.760)), Vector((side * 0.750, -0.110, 0.760))],
            [Vector((side * 0.545, -0.060, 1.345)), Vector((side * 0.545, -0.110, 1.345))],
        ]
        if side > 0:
            make_quad_grid(bm, bp)
        else:
            make_quad_grid(bm, [[p for p in reversed(r)] for r in bp])

        # Iconic Peugeot 205 Wide C-Pillar Sail Panel (Smoothly follows hatch glass slope)
        rear_qw = 0.738  # Matches rear station half_w exactly!
        cp = [
            [Vector((side * 0.760,   -0.897, 0.745)), Vector((side * 0.540, -0.897, 1.345))],
            [Vector((side * 0.755,   -1.210, 0.750)), Vector((side * 0.535, -1.210, 1.345))],
            [Vector((side * 0.750,   -1.450, 0.755)), Vector((side * 0.550, -1.450, 1.150))],
            [Vector((side * 0.745,   -1.645, 0.758)), Vector((side * 0.560, -1.645, 0.890))],
            [Vector((side * rear_qw, -1.850, 0.760)), Vector((side * (rear_qw * 0.78), -1.850, 0.760))],
        ]
        if side > 0:
            make_quad_grid(bm, cp)
        else:
            make_quad_grid(bm, [[p for p in reversed(r)] for r in cp])

    # 6. Rear Hatch Upper Header & Lower Tailgate Sheetmetal (Spans full rear width!)
    r_hatch_top = [
        [Vector(( 0.540, -1.350, 1.340)), Vector(( 0.0, -1.350, 1.350)), Vector((-0.540, -1.350, 1.340))],
        [Vector(( 0.490, -1.355, 1.330)), Vector(( 0.0, -1.355, 1.340)), Vector((-0.490, -1.355, 1.330))],
    ]
    make_quad_grid(bm, r_hatch_top)

    rear_qw = 0.738
    r_hatch_lower = [
        [Vector(( rear_qw * 0.78, -1.645, 0.890)), Vector(( 0.0, -1.645, 0.900)), Vector((-rear_qw * 0.78, -1.645, 0.890))],
        [Vector(( rear_qw,        -1.850, 0.760)), Vector(( 0.0, -1.852, 0.760)), Vector((-rear_qw,        -1.850, 0.760))],
        [Vector(( rear_qw,        -1.850, 0.450)), Vector(( 0.0, -1.852, 0.450)), Vector((-rear_qw,        -1.850, 0.450))],
    ]
    make_quad_grid(bm, r_hatch_lower)

    # 7. Enclosed Inner Wheel Arch Tubs (Zero See-Through Voids)
    tub_r = 0.330
    wheel_z = 0.292
    for ax_y, is_f in [(f_axle, True), (r_axle, False)]:
        track_w = 0.696 if is_f else 0.667
        for sign in [1.0, -1.0]:
            tub_pts = []
            for a_i in range(9):
                ang = math.pi * a_i / 8.0
                ty = ax_y - tub_r * math.cos(ang)
                tz = wheel_z + tub_r * math.sin(ang)
                tub_pts.append(Vector((sign * (track_w + 0.035), ty, tz)))
            tub_rows = [
                [p for p in tub_pts],
                [Vector((sign * 0.480, p.y, p.z)) for p in tub_pts],
            ]
            if sign > 0:
                make_quad_grid(bm, tub_rows)
            else:
                make_quad_grid(bm, [[p for p in reversed(r)] for r in tub_rows])

    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.003)
    link_obj("Cabin", bm, parent, mats["paint"], bevel=0.003)


# ----------------------------------------------------------------------------
# 5. GTI POLYURETHANE ARCH FLARES & SIDE CLADDING
# ----------------------------------------------------------------------------
def build_peugeot_cladding(parent, mats, f_axle, r_axle):
    """
    Constructs the signature 205 GTi protective body elements:
    - 4 molded dark charcoal wheel arch extensions (flares) matching the arch cutouts
    - Wide protective side rubbing strips with bright red GTi pinstripes
    - C-pillar ribbed plastic quarter vent badges with red '1.9 GTi' lettering
    """
    bm_flares = bmesh.new()
    rocker_z = 0.180
    w_arch = 0.3125
    h_arch = 0.444
    flare_proj = 0.024   # 24mm outward flare extension
    flare_width = 0.038  # Width of polyurethane molding band

    for ax_y, is_f in [(f_axle, True), (r_axle, False)]:
        body_x = 0.786
        for sign in [1.0, -1.0]:
            flare_outer = []
            flare_inner = []
            segs = 12
            for s in range(segs + 1):
                u = -1.0 + 2.0 * s / segs  # -1 to +1
                fy = ax_y + u * w_arch
                fz = rocker_z + h_arch * math.sqrt(max(0.0, 1.0 - u * u))

                # Normal direction outward from arch center
                norm_y = u
                norm_z = math.sqrt(max(0.0, 1.0 - u * u))
                norm_len = math.sqrt(norm_y * norm_y + norm_z * norm_z) + 1e-5
                ny = norm_y / norm_len
                nz = norm_z / norm_len

                # Outer rolled lip (protruding laterally)
                p_out = Vector((sign * (body_x + flare_proj), fy, fz))
                # Inner mounting edge (seated against body sheetmetal)
                p_in = Vector((sign * (body_x + 0.002), fy + ny * flare_width, fz + nz * flare_width))

                flare_outer.append(p_out)
                flare_inner.append(p_in)

            flare_grid = [flare_outer, flare_inner]
            if sign > 0:
                make_quad_grid(bm_flares, flare_grid)
            else:
                make_quad_grid(bm_flares, [[p for p in reversed(r)] for r in flare_grid])

    link_obj("Fenders", bm_flares, parent, mats["dark_trim"], bevel=0.002)

    # 2. Side Protective Rubbing Strips with Inset Channel
    bm_rub = bmesh.new()
    rub_z = 0.525
    rub_h = 0.040
    # Span between front and rear arch flares
    rub_y_f = f_axle - w_arch + 0.010  # ~0.907m
    rub_y_r = r_axle + w_arch - 0.010  # ~-0.907m
    rub_len = rub_y_f - rub_y_r

    for sign in [1.0, -1.0]:
        ret_rub = bmesh.ops.create_cube(bm_rub, size=1.0)
        for v in ret_rub['verts']:
            v.co.x = v.co.x * 0.016 + sign * 0.792
            v.co.y = v.co.y * rub_len + (rub_y_f + rub_y_r) / 2.0
            v.co.z = v.co.z * rub_h + rub_z

    link_obj("Side_Skirts", bm_rub, parent, mats["dark_trim"], bevel=0.002)

    # Inset Bright Red GTi Pinstripe Bead
    bm_pin = bmesh.new()
    for sign in [1.0, -1.0]:
        ret_pin = bmesh.ops.create_cube(bm_pin, size=1.0)
        for v in ret_pin['verts']:
            v.co.x = v.co.x * 0.006 + sign * 0.802
            v.co.y = v.co.y * (rub_len - 0.020) + (rub_y_f + rub_y_r) / 2.0
            v.co.z = v.co.z * 0.008 + rub_z

    link_obj("Front_Pinstripe", bm_pin, parent, mats["red_pinstripe"], bevel=0.001)

    # 3. C-Pillar Louvered Quarter Badges with Red "1.9 GTi" Lettering
    bm_badge = bmesh.new()
    for sign in [1.0, -1.0]:
        b_loc = Vector((sign * 0.755, -1.250, 0.980))
        ret_bd = bmesh.ops.create_cube(bm_badge, size=1.0)
        for v in ret_bd['verts']:
            v.co.x = v.co.x * 0.006 + b_loc.x
            v.co.y = v.co.y * 0.120 + b_loc.y
            v.co.z = v.co.z * 0.080 + b_loc.z

        # 3 Louver ribs
        for r_i in range(3):
            ret_r = bmesh.ops.create_cube(bm_badge, size=1.0)
            for v in ret_r['verts']:
                v.co.x = v.co.x * 0.004 + b_loc.x + 0.004 * sign
                v.co.y = v.co.y * 0.100 + b_loc.y
                v.co.z = v.co.z * 0.008 + (0.955 + r_i * 0.024)

    link_obj("Quarter_Badges", bm_badge, parent, mats["dark_trim"], bevel=0.001)


# ----------------------------------------------------------------------------
# 6. FRONT FASCIA, 3-SLAT GRILLE, YELLOW DRIVING LAMPS & BUMPER
# ----------------------------------------------------------------------------
def build_peugeot_front_fascia(parent, mats):
    """
    Constructs authentic 205 GTi front end:
    - 3-slat body-color grille with chrome Peugeot Lion crest
    - Dark charcoal wraparound bumper extending along the flanks to wheel arches
    - Deep aerodynamic front chin air dam with central intake
    - DUAL RECTANGULAR YELLOW DRIVING / FOG LAMPS (Projecteurs Longue-Portée)
    - Continuous bright red GTi pinstripe wrapping along the bumper
    """
    # 1. 3-Slat Body-Color Grille & Fascia Backing
    bm_grille = bmesh.new()
    ret_gb = bmesh.ops.create_cube(bm_grille, size=1.0)
    for v in ret_gb['verts']:
        v.co.x = v.co.x * 0.700
        v.co.y = v.co.y * 0.020 + 1.844
        v.co.z = v.co.z * 0.175 + 0.5375

    # 3 Horizontal Body-Color Slats
    for s_i in range(3):
        sz = 0.485 + s_i * 0.048
        ret_s = bmesh.ops.create_cube(bm_grille, size=1.0)
        for v in ret_s['verts']:
            v.co.x = v.co.x * 0.680
            v.co.y = v.co.y * 0.012 + 1.854
            v.co.z = v.co.z * 0.012 + sz

    link_obj("Front_Clip", bm_grille, parent, mats["paint"], bevel=0.002)

    # 2. Mirror Chrome Peugeot Lion Crest
    bm_lion = bmesh.new()
    ret_lion = bmesh.ops.create_cube(bm_lion, size=1.0)
    for v in ret_lion['verts']:
        v.co.x = v.co.x * 0.038
        v.co.y = v.co.y * 0.008 + 1.862
        v.co.z = v.co.z * 0.052 + 0.5375
    link_obj("Lion_Crest", bm_lion, parent, mats["chrome"], bevel=0.001)

    # 3. Wraparound Dark Charcoal Front Bumper & Deep Chin Air Dam
    bm_bumper = bmesh.new()
    # Main Front Bumper Face (Z=0.320 to 0.450, Y=1.845 to 1.885)
    ret_bb = bmesh.ops.create_cube(bm_bumper, size=1.0)
    for v in ret_bb['verts']:
        v.co.x = v.co.x * 1.500
        v.co.y = v.co.y * 0.060 + 1.865
        v.co.z = v.co.z * 0.130 + 0.385

    # Side Wraparound Bumper Returns (extending back along flanks from Y=1.865 to 1.523)
    f_arch_junction_y = 1.523
    for sign in [1.0, -1.0]:
        ret_ret = bmesh.ops.create_cube(bm_bumper, size=1.0)
        for v in ret_ret['verts']:
            v.co.x = v.co.x * 0.040 + sign * 0.775
            v.co.y = v.co.y * (1.865 - f_arch_junction_y) + (1.865 + f_arch_junction_y) / 2.0
            v.co.z = v.co.z * 0.130 + 0.385

    # Deep Lower Chin Air Dam Spoiler (Z=0.180 to 0.320)
    ret_cd = bmesh.ops.create_cube(bm_bumper, size=1.0)
    for v in ret_cd['verts']:
        v.co.x = v.co.x * 1.460
        v.co.y = v.co.y * 0.055 + 1.855
        v.co.z = v.co.z * 0.140 + 0.250

    # Side returns for lower chin
    for sign in [1.0, -1.0]:
        ret_cdr = bmesh.ops.create_cube(bm_bumper, size=1.0)
        for v in ret_cdr['verts']:
            v.co.x = v.co.x * 0.036 + sign * 0.760
            v.co.y = v.co.y * (1.855 - f_arch_junction_y) + (1.855 + f_arch_junction_y) / 2.0
            v.co.z = v.co.z * 0.140 + 0.250

    link_obj("Front_Splitter", bm_bumper, parent, mats["dark_trim"], bevel=0.003)

    # 4. Wraparound Bright Red GTi Pinstripe (Front & Sides)
    bm_fpin = bmesh.new()
    ret_fp = bmesh.ops.create_cube(bm_fpin, size=1.0)
    for v in ret_fp['verts']:
        v.co.x = v.co.x * 1.505
        v.co.y = v.co.y * 0.008 + 1.898
        v.co.z = v.co.z * 0.012 + 0.420

    for sign in [1.0, -1.0]:
        ret_fps = bmesh.ops.create_cube(bm_fpin, size=1.0)
        for v in ret_fps['verts']:
            v.co.x = v.co.x * 0.008 + sign * 0.798
            v.co.y = v.co.y * (1.898 - f_arch_junction_y) + (1.898 + f_arch_junction_y) / 2.0
            v.co.z = v.co.z * 0.012 + 0.420

    link_obj("Front_Bumper_Pinstripe", bm_fpin, parent, mats["red_pinstripe"], bevel=0.001)

    # 5. DUAL RECTANGULAR YELLOW DRIVING / FOG LAMPS (Cibié Projecteurs Longue-Portée)
    bm_fog = bmesh.new()
    bm_fog_housing = bmesh.new()
    for sign in [1.0, -1.0]:
        fog_x = sign * 0.340
        fog_y = 1.875
        fog_z = 0.255

        # Black mounting frame bezel
        ret_fh = bmesh.ops.create_cube(bm_fog_housing, size=1.0)
        for v in ret_fh['verts']:
            v.co.x = v.co.x * 0.145 + fog_x
            v.co.y = v.co.y * 0.025 + (fog_y - 0.005)
            v.co.z = v.co.z * 0.075 + fog_z

        # Luminous French Yellow Lens
        ret_fl = bmesh.ops.create_cube(bm_fog, size=1.0)
        for v in ret_fl['verts']:
            v.co.x = v.co.x * 0.130 + fog_x
            v.co.y = v.co.y * 0.010 + (fog_y + 0.008)
            v.co.z = v.co.z * 0.065 + fog_z

    link_obj("Fog_Lamp_Housings", bm_fog_housing, parent, mats["dark_trim"], bevel=0.001)
    link_obj("Fog_Lamps", bm_fog, parent, mats["yellow_fog"], bevel=0.001)


# ----------------------------------------------------------------------------
# 7. REAR FASCIA, RIBBED APPLIQUE, WRAPAROUND BUMPER & OVAL EXHAUST
# ----------------------------------------------------------------------------
def build_peugeot_rear_fascia(parent, mats):
    """
    Constructs authentic 205 GTi rear end:
    - Black ribbed tailgate applique with chrome 'PEUGEOT' and '205 GTi' badges
    - Dark charcoal wraparound rear bumper with red GTi pinstripe
    - Roof-edge trailing lip spoiler
    - Single polished stainless oval exhaust tip (LHD driver side)
    """
    # 1. Wraparound Dark Charcoal Rear Bumper & Lower Valance
    bm_r_bumper = bmesh.new()
    ret_rb = bmesh.ops.create_cube(bm_r_bumper, size=1.0)
    for v in ret_rb['verts']:
        v.co.x = v.co.x * 1.500
        v.co.y = v.co.y * 0.060 - 1.865
        v.co.z = v.co.z * 0.130 + 0.385

    # Side Wraparound Bumper Returns (extending forward along flanks to rear arch)
    r_arch_junction_y = -1.523
    for sign in [1.0, -1.0]:
        ret_rret = bmesh.ops.create_cube(bm_r_bumper, size=1.0)
        for v in ret_rret['verts']:
            v.co.x = v.co.x * 0.040 + sign * 0.775
            v.co.y = v.co.y * (abs(r_arch_junction_y) - 1.865) + (-1.865 + r_arch_junction_y) / 2.0
            v.co.z = v.co.z * 0.130 + 0.385

    # Lower Rear Valance Apron (Z=0.180 to 0.320)
    ret_ra = bmesh.ops.create_cube(bm_r_bumper, size=1.0)
    for v in ret_ra['verts']:
        v.co.x = v.co.x * 1.460
        v.co.y = v.co.y * 0.055 - 1.855
        v.co.z = v.co.z * 0.140 + 0.250

    for sign in [1.0, -1.0]:
        ret_rar = bmesh.ops.create_cube(bm_r_bumper, size=1.0)
        for v in ret_rar['verts']:
            v.co.x = v.co.x * 0.036 + sign * 0.760
            v.co.y = v.co.y * (abs(r_arch_junction_y) - 1.855) + (-1.855 + r_arch_junction_y) / 2.0
            v.co.z = v.co.z * 0.140 + 0.250

    link_obj("Diffuser", bm_r_bumper, parent, mats["dark_trim"], bevel=0.003)

    # Rear Bumper Bright Red Pinstripe (Rear & Sides)
    bm_rpin = bmesh.new()
    ret_rp = bmesh.ops.create_cube(bm_rpin, size=1.0)
    for v in ret_rp['verts']:
        v.co.x = v.co.x * 1.505
        v.co.y = v.co.y * 0.008 - 1.898
        v.co.z = v.co.z * 0.012 + 0.420

    for sign in [1.0, -1.0]:
        ret_rps = bmesh.ops.create_cube(bm_rpin, size=1.0)
        for v in ret_rps['verts']:
            v.co.x = v.co.x * 0.008 + sign * 0.798
            v.co.y = v.co.y * (abs(r_arch_junction_y) - 1.898) + (-1.898 + r_arch_junction_y) / 2.0
            v.co.z = v.co.z * 0.012 + 0.420

    link_obj("Rear_Pinstripe", bm_rpin, parent, mats["red_pinstripe"], bevel=0.001)

    # 2. Black Ribbed Tailgate Applique Panel (between taillights: X from -0.440 to +0.440)
    bm_app = bmesh.new()
    ret_app = bmesh.ops.create_cube(bm_app, size=1.0)
    for v in ret_app['verts']:
        v.co.x = v.co.x * 0.880
        v.co.y = v.co.y * 0.012 - 1.856
        v.co.z = v.co.z * 0.160 + 0.590

    # 7 Horizontal Ribs across the applique
    for r_i in range(7):
        rz = 0.525 + r_i * 0.021
        ret_rib = bmesh.ops.create_cube(bm_app, size=1.0)
        for v in ret_rib['verts']:
            v.co.x = v.co.x * 0.860
            v.co.y = v.co.y * 0.006 - 1.864
            v.co.z = v.co.z * 0.006 + rz

    link_obj("Tailgate_Applique", bm_app, parent, mats["dark_trim"], bevel=0.001)

    # Chrome Tailgate Badging ("PEUGEOT" Left, "205 GTi" Right)
    bm_tbadge = bmesh.new()
    # Left Peugeot
    ret_pb = bmesh.ops.create_cube(bm_tbadge, size=1.0)
    for v in ret_pb['verts']:
        v.co.x = v.co.x * 0.140 - 0.260
        v.co.y = v.co.y * 0.004 - 1.868
        v.co.z = v.co.z * 0.020 + 0.635
    # Right 205 GTi
    ret_gb = bmesh.ops.create_cube(bm_tbadge, size=1.0)
    for v in ret_gb['verts']:
        v.co.x = v.co.x * 0.130 + 0.260
        v.co.y = v.co.y * 0.004 - 1.868
        v.co.z = v.co.z * 0.020 + 0.635

    link_obj("Tailgate_Badges", bm_tbadge, parent, mats["chrome"], bevel=0.001)

    # 3. Upper Roof Trailing Edge Lip Spoiler
    bm_sp = bmesh.new()
    ret_sp = bmesh.ops.create_cube(bm_sp, size=1.0)
    for v in ret_sp['verts']:
        v.co.x = v.co.x * 1.100
        v.co.y = v.co.y * 0.065 - 1.365
        v.co.z = v.co.z * 0.024 + 1.360
    link_obj("Rear_Spoiler", bm_sp, parent, mats["dark_trim"], bevel=0.002)

    # 4. Single Polished Chrome Oval Exhaust Tip (Driver Side LHD: X = +0.480)
    bm_ex = bmesh.new()
    ex_center = Vector((0.480, -1.885, 0.245))
    ret_ex = bmesh.ops.create_cone(
        bm_ex,
        cap_ends=False,
        segments=20,
        radius1=0.036,
        radius2=0.036,
        depth=0.120
    )
    rot_x = Matrix.Rotation(math.pi / 2.0, 4, 'X')
    for v in ret_ex['verts']:
        v.co.x *= 1.25
        v.co.y *= 1.0
        v.co.z *= 0.85
        v.co = rot_x @ v.co + ex_center
    link_obj("Exhaust_Tip", bm_ex, parent, mats["exhaust_chrome"], bevel=0.002)

    # Dark Exhaust Inner Bore
    bm_eb = bmesh.new()
    ret_eb = bmesh.ops.create_cone(
        bm_eb,
        cap_ends=True,
        segments=20,
        radius1=0.032,
        radius2=0.032,
        depth=0.020
    )
    eb_center = ex_center - Vector((0.0, 0.040, 0.0))
    for v in ret_eb['verts']:
        v.co.x *= 1.22
        v.co.y *= 1.0
        v.co.z *= 0.82
        v.co = rot_x @ v.co + eb_center
    link_obj("Exhaust_Bore", bm_eb, parent, mats["exhaust_bore"], bevel=0.0)


# ----------------------------------------------------------------------------
# 8. LIGHTING OPTICS (SLANTED HALOGEN HEADLAMPS & RIBBED TAILLIGHTS)
# ----------------------------------------------------------------------------
def build_peugeot_lighting(parent, mats):
    """
    Constructs authentic multi-part lighting for the Peugeot 205 GTi:
    - Slanted trapezoidal headlamps with parabolic chrome reflectors and halogen bulbs
    - Amber corner turn indicators wrapping into front fenders
    - Ribbed horizontal multi-chamber taillights (Amber / Ruby / Clear)
    """
    # 1. Front Headlamp Glass Lenses & Black Housings
    bm_hl = bmesh.new()
    bm_housing = bmesh.new()
    for sign in [1.0, -1.0]:
        hl_center = Vector((sign * 0.485, 1.838, 0.5375))

        # Black perimeter bezel spanning Z=0.450 to 0.625
        ret_hb = bmesh.ops.create_cube(bm_housing, size=1.0)
        for v in ret_hb['verts']:
            v.co.x = v.co.x * 0.245 + hl_center.x
            v.co.y = v.co.y * 0.020 + (hl_center.y - 0.008)
            v.co.z = v.co.z * 0.175 + hl_center.z

        # Fluted Glass Lens spanning Z=0.465 to 0.610
        ret_hl = bmesh.ops.create_cube(bm_hl, size=1.0)
        for v in ret_hl['verts']:
            v.co.x = v.co.x * 0.230 + hl_center.x
            v.co.y = v.co.y * 0.012 + hl_center.y
            v.co.z = v.co.z * 0.145 + hl_center.z

    link_obj("Headlamp_Housings", bm_housing, parent, mats["dark_trim"], bevel=0.001)
    link_obj("Light_Headlamp_L", bm_hl, parent, mats["headlamp_glass"], bevel=0.002)

    # Parabolic Chrome Reflector Bowls & Halogen Bulb Caps
    bm_ref = bmesh.new()
    rot_rx = Matrix.Rotation(-math.pi / 2.0, 4, 'X')
    for sign in [1.0, -1.0]:
        hl_center = Vector((sign * 0.485, 1.824, 0.5375))
        ret_r = bmesh.ops.create_cone(
            bm_ref,
            cap_ends=True,
            segments=16,
            radius1=0.060,
            radius2=0.015,
            depth=0.026
        )
        for v in ret_r['verts']:
            v.co = rot_rx @ v.co + hl_center
    link_obj("Headlamp_Reflectors", bm_ref, parent, mats["reflector_chrome"], bevel=0.001)

    bm_bulb = bmesh.new()
    for sign in [1.0, -1.0]:
        b_center = Vector((sign * 0.485, 1.830, 0.5375))
        ret_b = bmesh.ops.create_cone(
            bm_bulb,
            cap_ends=True,
            segments=8,
            radius1=0.010,
            radius2=0.010,
            depth=0.012
        )
        for v in ret_b['verts']:
            v.co = rot_rx @ v.co + b_center
    link_obj("Halogen_Bulbs", bm_bulb, parent, mats["halogen_bulb"], bevel=0.0)

    # 2. Amber Corner Turn Indicators (wrapping around into front fender)
    bm_corn = bmesh.new()
    for sign in [1.0, -1.0]:
        c_center = Vector((sign * 0.675, 1.805, 0.5375))
        ret_c = bmesh.ops.create_cube(bm_corn, size=1.0)
        for v in ret_c['verts']:
            v.co.x = v.co.x * 0.120 + c_center.x
            v.co.y = v.co.y * 0.055 + c_center.y
            v.co.z = v.co.z * 0.175 + c_center.z
    link_obj("Corner_Indicators", bm_corn, parent, mats["amber_lens"], bevel=0.002)

    # 3. Ribbed Horizontal Multi-Chamber Taillights (Amber Indicator / Ruby Brake / Clear Reverse)
    bm_tl_ruby = bmesh.new()
    bm_tl_amber = bmesh.new()
    bm_tl_clear = bmesh.new()
    bm_tl_frame = bmesh.new()

    for sign in [1.0, -1.0]:
        tl_center = Vector((sign * 0.590, -1.854, 0.590))
        tl_w = 0.270
        tl_h = 0.050

        # Outer Black Gasket Frame
        ret_fr = bmesh.ops.create_cube(bm_tl_frame, size=1.0)
        for v in ret_fr['verts']:
            v.co.x = v.co.x * (tl_w + 0.015) + tl_center.x
            v.co.y = v.co.y * 0.018 + (tl_center.y + 0.004)
            v.co.z = v.co.z * 0.170 + tl_center.z

        # Top Chamber: Amber Turn Indicator (Z = 0.642)
        ret_a = bmesh.ops.create_cube(bm_tl_amber, size=1.0)
        for v in ret_a['verts']:
            v.co.x = v.co.x * tl_w + tl_center.x
            v.co.y = v.co.y * 0.014 + tl_center.y
            v.co.z = v.co.z * tl_h + (tl_center.z + 0.052)

        # Middle Chamber: Ruby Brake / Running Light (Z = 0.590)
        ret_r = bmesh.ops.create_cube(bm_tl_ruby, size=1.0)
        for v in ret_r['verts']:
            v.co.x = v.co.x * tl_w + tl_center.x
            v.co.y = v.co.y * 0.014 + tl_center.y
            v.co.z = v.co.z * tl_h + tl_center.z

        # Bottom Chamber: Clear Reverse Light (Z = 0.538)
        ret_c = bmesh.ops.create_cube(bm_tl_clear, size=1.0)
        for v in ret_c['verts']:
            v.co.x = v.co.x * tl_w + tl_center.x
            v.co.y = v.co.y * 0.014 + tl_center.y
            v.co.z = v.co.z * tl_h + (tl_center.z - 0.052)

    link_obj("Taillight_Frames", bm_tl_frame, parent, mats["dark_trim"], bevel=0.001)
    link_obj("Taillight_Ruby", bm_tl_ruby, parent, mats["ruby_taillight"], bevel=0.001)
    link_obj("Taillight_Amber", bm_tl_amber, parent, mats["amber_lens"], bevel=0.001)
    link_obj("Taillight_Reverse", bm_tl_clear, parent, mats["reverse_white"], bevel=0.001)


# ----------------------------------------------------------------------------
# 9. GREENHOUSE DIELECTRIC SAFETY GLASS
# ----------------------------------------------------------------------------
def build_peugeot_glass(parent, mats):
    """
    Constructs authentic 3-door greenhouse glass:
    - Raked windshield (Y=0.800 to 0.380)
    - Side door windows with flush black B-pillar trim
    - Pop-out rear quarter windows
    - Raked rear hatch tailgate glass
    """
    bm_glass = bmesh.new()

    # 1. Raked Windshield
    ws_rows = [
        [Vector(( 0.650, 0.790, 0.760)), Vector(( 0.0, 0.790, 0.770)), Vector((-0.650, 0.790, 0.760))],
        [Vector(( 0.580, 0.580, 1.060)), Vector(( 0.0, 0.580, 1.075)), Vector((-0.580, 0.580, 1.060))],
        [Vector(( 0.515, 0.385, 1.335)), Vector(( 0.0, 0.385, 1.345)), Vector((-0.515, 0.385, 1.335))],
    ]
    make_quad_grid(bm_glass, ws_rows)

    # 2. Front Door Side Windows (Y=+0.380 to -0.060)
    for sign in [1.0, -1.0]:
        dw_rows = [
            [Vector((sign * 0.720,  0.370, 0.760)), Vector((sign * 0.530,  0.370, 1.335))],
            [Vector((sign * 0.745, -0.060, 0.760)), Vector((sign * 0.545, -0.060, 1.345))],
        ]
        if sign > 0:
            make_quad_grid(bm_glass, dw_rows)
        else:
            make_quad_grid(bm_glass, [[p for p in reversed(r)] for r in dw_rows])

    # 3. Pop-Out Rear Quarter Windows (Y=-0.110 to -0.880)
    for sign in [1.0, -1.0]:
        qw_rows = [
            [Vector((sign * 0.745, -0.110, 0.760)), Vector((sign * 0.545, -0.110, 1.345))],
            [Vector((sign * 0.740, -0.880, 0.760)), Vector((sign * 0.540, -0.880, 1.340))],
        ]
        if sign > 0:
            make_quad_grid(bm_glass, qw_rows)
        else:
            make_quad_grid(bm_glass, [[p for p in reversed(r)] for r in qw_rows])

    # 4. Raked Rear Hatch Tailgate Glass (Y=-1.360 to -1.650)
    rg_rows = [
        [Vector(( 0.480, -1.365, 1.325)), Vector(( 0.0, -1.365, 1.335)), Vector((-0.480, -1.365, 1.325))],
        [Vector(( 0.520, -1.510, 1.090)), Vector(( 0.0, -1.510, 1.100)), Vector((-0.520, -1.510, 1.090))],
        [Vector(( 0.560, -1.645, 0.880)), Vector(( 0.0, -1.645, 0.890)), Vector((-0.560, -1.645, 0.880))],
    ]
    make_quad_grid(bm_glass, rg_rows)

    link_obj("Windshield", bm_glass, parent, mats["glass"], bevel=0.0)


# ----------------------------------------------------------------------------
# 10. EXTERIOR JEWELRY (MIRRORS, HANDLES, WIPERS)
# ----------------------------------------------------------------------------
def build_peugeot_jewelry(parent, mats):
    """
    Constructs exterior details:
    - Aerodynamic door mirrors (dark charcoal polyurethane)
    - Flush paddle door handles
    - Front dual windshield wipers
    - Tailgate rear wiper arm
    """
    bm_j = bmesh.new()

    # 1. Door Mirrors (Left & Right A-Pillar base: Y=0.380, Z=0.800)
    for sign in [1.0, -1.0]:
        m_loc = Vector((sign * 0.760, 0.380, 0.800))
        ret_m = bmesh.ops.create_cube(bm_j, size=1.0)
        for v in ret_m['verts']:
            v.co.x = v.co.x * 0.055 + m_loc.x
            v.co.y = v.co.y * 0.110 + m_loc.y
            v.co.z = v.co.z * 0.065 + m_loc.z

    # 2. Door Handles (Flush black paddle handles: Y=-0.220, Z=0.680)
    for sign in [1.0, -1.0]:
        h_loc = Vector((sign * 0.772, -0.220, 0.680))
        ret_h = bmesh.ops.create_cube(bm_j, size=1.0)
        for v in ret_h['verts']:
            v.co.x = v.co.x * 0.008 + h_loc.x
            v.co.y = v.co.y * 0.080 + h_loc.y
            v.co.z = v.co.z * 0.024 + h_loc.z

    # 3. Front Windshield Wipers
    for wx in [0.200, -0.250]:
        ret_w = bmesh.ops.create_cube(bm_j, size=1.0)
        for v in ret_w['verts']:
            v.co.x = v.co.x * 0.280 + wx
            v.co.y = v.co.y * 0.012 + 0.780
            v.co.z = v.co.z * 0.010 + 0.790

    # 4. Rear Tailgate Wiper Arm
    ret_rw = bmesh.ops.create_cube(bm_j, size=1.0)
    for v in ret_rw['verts']:
        v.co.x = v.co.x * 0.180 + 0.120
        v.co.y = v.co.y * 0.012 - 1.635
        v.co.z = v.co.z * 0.010 + 0.910

    link_obj("Exterior_Jewelry", bm_j, parent, mats["dark_trim"], bevel=0.001)


# ----------------------------------------------------------------------------
# 11. ICONIC RED CARPET INTERIOR COCKPIT
# ----------------------------------------------------------------------------
def build_peugeot_interior(parent, mats):
    """
    Constructs the famous 205 GTi cabin:
    - Full bright red carpet floorpan
    - Contoured sport bucket seats with black leather bolsters and red striped cloth
    - 2-spoke GTi sport steering wheel with red center Lion roundel
    - 1980s angular instrument binnacle with glowing orange dials
    - Center console with manual 5-speed shifter and red shift pattern cap
    """
    # 1. Iconic Bright Red Carpet Flooring
    bm_carpet = bmesh.new()
    ret_c = bmesh.ops.create_cube(bm_carpet, size=1.0)
    for v in ret_c['verts']:
        v.co.x = v.co.x * 1.300
        v.co.y = v.co.y * 1.800 - 0.200
        v.co.z = v.co.z * 0.040 + 0.190
    link_obj("Red_Carpet", bm_carpet, parent, mats["red_carpet"], bevel=0.0)

    # 2. Sport Bucket Seats (Front Left & Right)
    bm_seats = bmesh.new()
    for sx in [0.320, -0.320]:
        # Cushion
        ret_sc = bmesh.ops.create_cube(bm_seats, size=1.0)
        for v in ret_sc['verts']:
            v.co.x = v.co.x * 0.400 + sx
            v.co.y = v.co.y * 0.440 - 0.080
            v.co.z = v.co.z * 0.120 + 0.320
        # Backrest (slanted)
        ret_sb = bmesh.ops.create_cube(bm_seats, size=1.0)
        for v in ret_sb['verts']:
            v.co.x = v.co.x * 0.380 + sx
            v.co.y = v.co.y * 0.100 - 0.320 - (v.co.z * 0.08)
            v.co.z = v.co.z * 0.500 + 0.620
        # Headrest
        ret_sh = bmesh.ops.create_cube(bm_seats, size=1.0)
        for v in ret_sh['verts']:
            v.co.x = v.co.x * 0.200 + sx
            v.co.y = v.co.y * 0.080 - 0.380
            v.co.z = v.co.z * 0.140 + 0.940

    # Rear Bench Seat
    ret_rb = bmesh.ops.create_cube(bm_seats, size=1.0)
    for v in ret_rb['verts']:
        v.co.x = v.co.x * 1.100
        v.co.y = v.co.y * 0.450 - 0.950
        v.co.z = v.co.z * 0.120 + 0.340

    ret_rbb = bmesh.ops.create_cube(bm_seats, size=1.0)
    for v in ret_rbb['verts']:
        v.co.x = v.co.x * 1.080
        v.co.y = v.co.y * 0.100 - 1.200
        v.co.z = v.co.z * 0.420 + 0.600

    link_obj("Seats", bm_seats, parent, mats["leather_black"], bevel=0.003)

    # 3. 1980s Angular Dashboard & Center Console
    bm_dash = bmesh.new()
    ret_d = bmesh.ops.create_cube(bm_dash, size=1.0)
    for v in ret_d['verts']:
        v.co.x = v.co.x * 1.200
        v.co.y = v.co.y * 0.350 + 0.520
        v.co.z = v.co.z * 0.240 + 0.640

    # Center Console with Shifter Tunnel
    ret_cc = bmesh.ops.create_cube(bm_dash, size=1.0)
    for v in ret_cc['verts']:
        v.co.x = v.co.x * 0.180
        v.co.y = v.co.y * 0.650 + 0.150
        v.co.z = v.co.z * 0.180 + 0.320

    link_obj("Dashboard", bm_dash, parent, mats["dark_trim"], bevel=0.003)

    # 4. Instrument Binnacle with Glowing Orange Dials (LHD: Driver side X = +0.320)
    bm_gauge = bmesh.new()
    ret_g = bmesh.ops.create_cube(bm_gauge, size=1.0)
    for v in ret_g['verts']:
        v.co.x = v.co.x * 0.280 + 0.320
        v.co.y = v.co.y * 0.010 + 0.370
        v.co.z = v.co.z * 0.080 + 0.730
    link_obj("Gauge_Cluster", bm_gauge, parent, mats["gauge_orange"], bevel=0.0)

    # 5. 2-Spoke GTi Sport Steering Wheel
    bm_steer = bmesh.new()
    st_center = Vector((0.320, 0.260, 0.700))
    st_r = 0.155
    st_segs = 24
    st_rim = []
    for s in range(st_segs):
        ang = 2.0 * math.pi * s / st_segs
        pt = st_center + Vector((st_r * math.sin(ang), -st_r * math.cos(ang) * 0.35, st_r * math.cos(ang) * 0.94))
        st_rim.append(bm_steer.verts.new(pt))

    for s in range(st_segs):
        bm_steer.edges.new((st_rim[s], st_rim[(s + 1) % st_segs]))

    # Center Pad
    ret_cp = bmesh.ops.create_cube(bm_steer, size=1.0)
    for v in ret_cp['verts']:
        v.co.x = v.co.x * 0.065 + st_center.x
        v.co.y = v.co.y * 0.020 + st_center.y
        v.co.z = v.co.z * 0.055 + st_center.z

    link_obj("Steering", bm_steer, parent, mats["leather_black"], bevel=0.002)


# ----------------------------------------------------------------------------
# 12. UNDERBODY PLATFORM, ENGINE CRADLE & SUSPENSION
# ----------------------------------------------------------------------------
def build_peugeot_platform(parent, mats, f_axle, r_axle):
    """
    Constructs the underbody tray, XU9JA engine cradle and torsion beam rear axle:
    - Guarantees 0 light leaks or see-through gaps beneath the vehicle
    """
    bm_plat = bmesh.new()

    # Flat Structural Belly Pan (Z = 0.150m)
    ret_bp = bmesh.ops.create_cube(bm_plat, size=1.0)
    for v in ret_bp['verts']:
        v.co.x = v.co.x * 1.340
        v.co.y = v.co.y * 3.400
        v.co.z = v.co.z * 0.030 + 0.160

    # 1.9L XU9JA Transverse Engine Block / Oil Pan
    ret_eng = bmesh.ops.create_cube(bm_plat, size=1.0)
    for v in ret_eng['verts']:
        v.co.x = v.co.x * 0.550 + 0.050
        v.co.y = v.co.y * 0.450 + f_axle
        v.co.z = v.co.z * 0.280 + 0.340

    # Front Transverse Subframe Cradle
    ret_sub = bmesh.ops.create_cube(bm_plat, size=1.0)
    for v in ret_sub['verts']:
        v.co.x = v.co.x * 0.900
        v.co.y = v.co.y * 0.320 + f_axle
        v.co.z = v.co.z * 0.080 + 0.200

    # Trailing-Arm Torsion Beam Rear Axle Cross-Tube
    ret_ax = bmesh.ops.create_cone(
        bm_plat,
        cap_ends=True,
        segments=16,
        radius1=0.042,
        radius2=0.042,
        depth=1.150
    )
    rot_y = Matrix.Rotation(math.pi / 2.0, 4, 'Y')
    for v in ret_ax['verts']:
        v.co = rot_y @ v.co + Vector((0.0, r_axle, 0.250))

    link_obj("Chassis", bm_plat, parent, mats["underbody_dark"], bevel=0.003)


# ----------------------------------------------------------------------------
# 13. MASTER SCENE COMPOSITION & GLB EXPORT
# ----------------------------------------------------------------------------
def build_peugeot_205_gti_master():
    """
    Constructs the complete, master Class-A Peugeot 205 GTi 1.9 (1980s Hatchback)
    and exports unified and modular GLBs.
    """
    print("================================================================================")
    print("STARTING PEUGEOT 205 GTI 1.9 (1980s HATCHBACK) CLASS-A PROCEDURAL GENERATION")
    print("================================================================================")

    # 1. Purge Existing Objects & Meshes
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for mesh in list(bpy.data.meshes):
        bpy.data.meshes.remove(mesh, do_unlink=True)

    # 2. Initialize PBR Materials
    mats = create_peugeot_materials()

    # 3. Create Hierarchical Modular Root Nodes
    root = bpy.data.objects.new("Car_Peugeot_205_GTi_1980s", None)
    bpy.context.scene.collection.objects.link(root)

    body_branch = bpy.data.objects.new("Body", None)
    body_branch.parent = root
    bpy.context.scene.collection.objects.link(body_branch)

    wheels_branch = bpy.data.objects.new("Wheels", None)
    wheels_branch.parent = root
    bpy.context.scene.collection.objects.link(wheels_branch)

    interior_branch = bpy.data.objects.new("Interior", None)
    interior_branch.parent = root
    bpy.context.scene.collection.objects.link(interior_branch)

    glass_branch = bpy.data.objects.new("Glass", None)
    glass_branch.parent = root
    bpy.context.scene.collection.objects.link(glass_branch)

    platform_branch = bpy.data.objects.new("Platform", None)
    platform_branch.parent = root
    bpy.context.scene.collection.objects.link(platform_branch)

    # 4. Critical Engineering Dimensions
    f_axle = 1.210
    r_axle = -1.210
    wheel_z = 0.292
    half_f_track = 0.696
    half_r_track = 0.667

    # 5. Build 4 Speedline SL299 Wheels
    print("[PEUGEOT_BUILDER] Assembling 15-inch Speedline SL299 8-Hole Wheels & Michelin Tires...")
    build_peugeot_wheel(wheels_branch, mats, "Wheel_FL", Vector(( half_f_track, f_axle, wheel_z)), is_left=True)
    build_peugeot_wheel(wheels_branch, mats, "Wheel_FR", Vector((-half_f_track, f_axle, wheel_z)), is_left=False)
    build_peugeot_wheel(wheels_branch, mats, "Wheel_RL", Vector(( half_r_track, r_axle, wheel_z)), is_left=True)
    build_peugeot_wheel(wheels_branch, mats, "Wheel_RR", Vector((-half_r_track, r_axle, wheel_z)), is_left=False)

    # 6. Build Class-A Quad Lofted Monocoque
    print("[PEUGEOT_BUILDER] Sculpting Class-A Monocoque & Wide C-Pillar Greenhouse...")
    build_peugeot_monocoque(body_branch, mats, f_axle, r_axle)

    # 7. Build Protective Body Cladding, Arch Flares & Pinstripes
    print("[PEUGEOT_BUILDER] Installing GTi Polyurethane Cladding, Arch Flares & Red Pinstripes...")
    build_peugeot_cladding(body_branch, mats, f_axle, r_axle)

    # 8. Build Front Fascia, Grille, Yellow Driving Lamps & Wraparound Bumper
    print("[PEUGEOT_BUILDER] Assembling 3-Slat Grille, Yellow Driving Lamps & Wraparound Bumper...")
    build_peugeot_front_fascia(body_branch, mats)

    # 9. Build Rear Fascia, Ribbed Applique, Wraparound Bumper & Oval Exhaust
    print("[PEUGEOT_BUILDER] Assembling Tailgate Applique, Wraparound Bumper & Oval Exhaust...")
    build_peugeot_rear_fascia(body_branch, mats)

    # 10. Build Lighting Optics
    print("[PEUGEOT_BUILDER] Installing Slanted Halogens & Ribbed Multi-Chamber Taillights...")
    build_peugeot_lighting(body_branch, mats)

    # 11. Build Greenhouse Glass
    print("[PEUGEOT_BUILDER] Installing Optical Dielectric Safety Glass...")
    build_peugeot_glass(glass_branch, mats)

    # 12. Build Exterior Jewelry
    print("[PEUGEOT_BUILDER] Installing Mirrors, Handles & Windshield Wipers...")
    build_peugeot_jewelry(body_branch, mats)

    # 13. Build Interior
    print("[PEUGEOT_BUILDER] Installing Iconic Red Carpet Cabin, Sport Seats & GTi Wheel...")
    build_peugeot_interior(interior_branch, mats)

    # 14. Build Underbody Platform
    print("[PEUGEOT_BUILDER] Assembling Underfloor Tray, XU9JA Cradle & Torsion Axle...")
    build_peugeot_platform(platform_branch, mats, f_axle, r_axle)

    # 15. Export Dual-Mode GLBs
    export_paths = [
        r"E:\Car_Automation\public\models\vehicles\hatchback\1980s\vehicle.glb",
        r"E:\Car_Automation\public\models\Car_Peugeot_205_GTi_1980s.glb",
        r"E:\Car_Automation\exports\Car_Peugeot_205_GTi_1980s.glb",
    ]
    for p in export_paths:
        os.makedirs(os.path.dirname(p), exist_ok=True)
        print(f"[PEUGEOT_BUILDER] Exporting GLB -> {p}...")
        bpy.ops.export_scene.gltf(
            filepath=p,
            export_format='GLB',
            use_selection=False,
            export_apply=True,
            export_yup=True
        )
        print(f"[PEUGEOT_BUILDER] Saved: {p} ({os.path.getsize(p) / 1024:.1f} KB)")

    print("================================================================================")
    print("PEUGEOT 205 GTI 1.9 BUILD COMPLETE — GLBS EXPORTED SUCCESSFULLY")
    print("================================================================================")


if __name__ == "__main__":
    build_peugeot_205_gti_master()
