"""
=============================================================================
CLASS-A CAD PROCEDURAL GENERATOR: DATSUN 240Z (1970S COUPE FLAGSHIP)
=============================================================================
High-fidelity procedural recreation of the defining Japanese sports car:
the Datsun 240Z (S30 / Fairlady Z, 1969–1978).

Authentic Factory Specifications:
- Wheelbase: 2,305 mm (Front Axle: +1.1525m, Rear Axle: -1.1525m)
- Overall Length: 4,140 mm (Front Bumper: +2.070m, Rear Bumper: -2.070m)
- Overall Width: 1,630 mm (Half-Width: 0.815m)
- Overall Height: 1,285 mm (Roof Apex Z = 1.285m)
- Track Width: Front 1,355 mm (X = ±0.6775m), Rear 1,345 mm (X = ±0.6725m)
- Ground Clearance: 140 mm (Sill base Z = 0.140m)
- Powertrain: L24 2.4L SOHC Inline-6, Twin Hitachi SU Carburetors, 151 hp
- Wheels: 14" x 5.5J Steel Wheels with Polished Stainless Hubcaps & "D" Emblem
- Tires: 175HR14 Vintage Radial Sport Tires
- Exterior: Grand Prix Orange (918) with Polished Chrome Bumpers & Bumperettes,
  Iconic Conical Sugar-Scoop Headlight Nacelles, Sweeping Fastback Hatch,
  Triangular Quarter Windows with C-Pillar "Z" Emblems, Truncated Kamm Tail,
  Twin Hood Extractors & Central Power Bulge, 3-Spoke Drilled Wood Steering Wheel.
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


def create_datsun_240z_materials():
    mats = {}

    # Iconic 1970s Datsun Grand Prix Orange (Paint Code 918)
    mats["body_paint"] = make_pbr_mat("Mat_240Z_GrandPrixOrange", (0.88, 0.24, 0.035, 1.0), metallic=0.15, roughness=0.12, clearcoat=1.0)
    
    # Mirror-Polished 1970s Automotive Chrome (Bumpers, Hubcaps, Bezels, Trim)
    mats["chrome"] = make_pbr_mat("Mat_240Z_Chrome", (0.95, 0.95, 0.96, 1.0), metallic=1.0, roughness=0.04, clearcoat=1.0)
    
    # Satin Black Rubber & Trim (Bumperettes, Seals, Wiper Arms, Grille Slats)
    mats["trim_black"] = make_pbr_mat("Mat_240Z_SatinBlack", (0.022, 0.022, 0.024, 1.0), metallic=0.05, roughness=0.55)
    
    # Classic Vintage Dielectric Glass (Greenish-grey optical safety glass)
    mats["glass"] = make_pbr_mat("Mat_240Z_Glass", (0.02, 0.03, 0.025, 1.0), metallic=0.0, roughness=0.04, transmission=0.92, alpha=0.35, ior=1.52)
    
    # Headlight Fluted Glass Lens
    mats["lens_clear"] = make_pbr_mat("Mat_240Z_HeadlightLens", (0.92, 0.94, 0.95, 1.0), metallic=0.05, roughness=0.08, transmission=0.88, alpha=0.25, ior=1.50)
    
    # 7-Inch Sealed-Beam Halogen Core (Warm 3200K incandescent filament glow)
    mats["sealed_beam_warm"] = make_pbr_mat("Mat_240Z_SealedBeam", (1.0, 0.92, 0.75, 1.0), metallic=0.85, roughness=0.15, emission=(1.0, 0.92, 0.75, 1.0), emission_strength=4.5)
    
    # Amber Turn Indicators (Front Round & Rear Upper)
    mats["amber_indicator"] = make_pbr_mat("Mat_240Z_AmberLens", (1.0, 0.45, 0.02, 1.0), metallic=0.0, roughness=0.12, transmission=0.60, alpha=0.80, emission=(1.0, 0.45, 0.02, 1.0), emission_strength=3.0)
    
    # Red Taillights (Rear Lower)
    mats["red_taillight"] = make_pbr_mat("Mat_240Z_RedLens", (0.85, 0.02, 0.02, 1.0), metallic=0.0, roughness=0.10, transmission=0.50, alpha=0.85, emission=(0.95, 0.02, 0.02, 1.0), emission_strength=3.5)
    
    # White Reverse Lamp
    mats["reverse_white"] = make_pbr_mat("Mat_240Z_ReverseWhite", (0.95, 0.95, 0.95, 1.0), metallic=0.1, roughness=0.15, emission=(1.0, 1.0, 1.0, 1.0), emission_strength=2.5)

    # Steel Wheel Rims (Semi-Gloss Silver)
    mats["steel_rim"] = make_pbr_mat("Mat_240Z_SteelWheel", (0.68, 0.70, 0.72, 1.0), metallic=0.85, roughness=0.28)
    
    # Vintage Radial Tire Rubber (Charcoal Black, matte with subtle aging)
    mats["tire_rubber"] = make_pbr_mat("Mat_240Z_TireRubber", (0.028, 0.028, 0.030, 1.0), metallic=0.0, roughness=0.85)

    # Cast Iron Brakes (Discs & Drums)
    mats["cast_iron"] = make_pbr_mat("Mat_240Z_CastIron", (0.25, 0.25, 0.26, 1.0), metallic=0.82, roughness=0.45)

    # Classic Sports Cockpit Vinyl (Matted black leatherette)
    mats["interior_vinyl"] = make_pbr_mat("Mat_240Z_InteriorVinyl", (0.025, 0.025, 0.028, 1.0), metallic=0.02, roughness=0.65)
    
    # Rich Polished Teak/Walnut Wood Rim (Steering Wheel & Shift Knob)
    mats["wood_grain"] = make_pbr_mat("Mat_240Z_WoodGrain", (0.28, 0.11, 0.035, 1.0), metallic=0.0, roughness=0.18, clearcoat=0.85)

    # Underbody & Mechanical Chassis Enamel (Dark chassis grey)
    mats["chassis_dark"] = make_pbr_mat("Mat_240Z_Chassis", (0.035, 0.036, 0.038, 1.0), metallic=0.35, roughness=0.60)

    # Polished Stainless Steel Exhaust
    mats["exhaust_metal"] = make_pbr_mat("Mat_240Z_Exhaust", (0.82, 0.82, 0.84, 1.0), metallic=0.92, roughness=0.18)

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

    # Shade smooth by angle
    if auto_smooth > 0:
        try:
            bpy.context.view_layer.objects.active = obj
            obj.select_set(True)
            bpy.ops.object.shade_smooth_by_angle(angle=math.radians(auto_smooth))
            obj.select_set(False)
        except Exception:
            for poly in me.polygons:
                poly.use_smooth = True

    # High-end CAD edge micro-bevel modifier
    if bevel > 0.0:
        b_mod = obj.modifiers.new(name="Bevel", type='BEVEL')
        b_mod.width = bevel
        b_mod.segments = 2
        b_mod.limit_method = 'ANGLE'
        b_mod.angle_limit = math.radians(40.0)

    # Weighted Normal modifier to preserve pristine Class-A surface specular highlights
    wn = obj.modifiers.new(name="WeightedNormal", type='WEIGHTED_NORMAL')
    wn.keep_sharp = True

    return obj


# ----------------------------------------------------------------------------
# 3. 14-INCH VINTAGE WHEEL ASSEMBLY (WHEELS_BRANCH)
# ----------------------------------------------------------------------------
def build_datsun_240z_wheel(wheels_branch, mats, name, loc, is_left=True):
    bm = bmesh.new()

    # Dimensions
    r_tire = 0.317       # 175HR14 total tire outer radius
    w_tire = 0.175       # 175mm section width
    r_rim = 0.190        # 14" rim outer diameter (approx 380mm rim bead)
    w_rim = 0.145        # Rim barrel width
    r_hubcap = 0.115     # Central polished chrome hubcap
    z_rot = 0 if is_left else math.pi
    rot_mat = Matrix.Rotation(z_rot, 4, 'Z')
    sign_x = 1.0 if is_left else -1.0

    # 3.1 Vintage Radial Tire with Rounded Shoulders & Tread Sipes
    n_rad = 32
    n_cross = 12
    tire_profile = [
        (-w_tire*0.48, r_rim + 0.010),
        (-w_tire*0.49, r_rim + 0.040),
        (-w_tire*0.47, r_rim + 0.080),
        (-w_tire*0.42, r_tire - 0.035),
        (-w_tire*0.32, r_tire - 0.010),
        (-w_tire*0.18, r_tire),
        (0.0,          r_tire + 0.002),
        (w_tire*0.18,  r_tire),
        (w_tire*0.32,  r_tire - 0.010),
        (w_tire*0.42,  r_tire - 0.035),
        (w_tire*0.47,  r_rim + 0.080),
        (w_tire*0.49,  r_rim + 0.040),
        (w_tire*0.48,  r_rim + 0.010),
    ]

    rings = []
    for i in range(n_rad):
        theta = 2.0 * math.pi * i / n_rad
        cos_t = math.cos(theta)
        sin_t = math.sin(theta)
        ring_verts = []
        for (dx, r_rad) in tire_profile:
            pt = Vector((dx, r_rad * sin_t, r_rad * cos_t))
            pt = rot_mat @ pt + loc
            ring_verts.append(bm.verts.new(pt))
        rings.append(ring_verts)

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

    obj_tire = link_obj(name + "_Tire", bm, wheels_branch, mats["tire_rubber"], bevel=0.002)

    # 3.2 Steel Wheel Rim & Barrel
    bm_rim = bmesh.new()
    rim_profile = [
        (-w_rim*0.50, r_rim - 0.030),
        (-w_rim*0.50, r_rim),
        (-w_rim*0.42, r_rim),
        (-w_rim*0.35, r_rim - 0.015),
        (w_rim*0.30,  r_rim - 0.018),
        (w_rim*0.45,  r_rim - 0.005),
        (w_rim*0.50,  r_rim + 0.006),
        (w_rim*0.50,  r_rim - 0.035),
    ]
    rim_rings = []
    for i in range(n_rad):
        theta = 2.0 * math.pi * i / n_rad
        cos_t = math.cos(theta)
        sin_t = math.sin(theta)
        ring_v = []
        for (dx, r_rad) in rim_profile:
            pt = Vector((dx, r_rad * sin_t, r_rad * cos_t))
            pt = rot_mat @ pt + loc
            ring_v.append(bm_rim.verts.new(pt))
        rim_rings.append(ring_v)

    for i in range(n_rad):
        i_next = (i + 1) % n_rad
        for j in range(len(rim_profile) - 1):
            v00 = rim_rings[i][j]
            v01 = rim_rings[i][j+1]
            v11 = rim_rings[i_next][j+1]
            v10 = rim_rings[i_next][j]
            if is_left:
                bm_rim.faces.new((v00, v01, v11, v10))
            else:
                bm_rim.faces.new((v00, v10, v11, v01))

    link_obj(name + "_SteelRim", bm_rim, wheels_branch, mats["steel_rim"], bevel=0.002)

    # 3.3 Polished Stainless Chrome Center Hubcap with Embossed Datsun "D" Emblem
    bm_cap = bmesh.new()
    cap_profile = [
        (w_rim*0.48,         r_rim - 0.035),
        (w_rim*0.50,         r_hubcap),
        (w_rim*0.54,         r_hubcap * 0.90),
        (w_rim*0.57,         r_hubcap * 0.65),
        (w_rim*0.585,        r_hubcap * 0.35),
        (w_rim*0.590,        0.0),
    ]
    cap_rings = []
    for i in range(24):
        theta = 2.0 * math.pi * i / 24
        cos_t = math.cos(theta)
        sin_t = math.sin(theta)
        ring_v = []
        for (dx, r_rad) in cap_profile:
            pt = Vector((dx, r_rad * sin_t, r_rad * cos_t))
            pt = rot_mat @ pt + loc
            ring_v.append(bm_cap.verts.new(pt))
        cap_rings.append(ring_v)

    for i in range(24):
        i_next = (i + 1) % 24
        for j in range(len(cap_profile) - 1):
            v00 = cap_rings[i][j]
            v01 = cap_rings[i][j+1]
            v11 = cap_rings[i_next][j+1]
            v10 = cap_rings[i_next][j]
            if is_left:
                bm_cap.faces.new((v00, v01, v11, v10))
            else:
                bm_cap.faces.new((v00, v10, v11, v01))

    # 4 Chrome Lug Nuts around hubcap
    for lug_i in range(4):
        lug_theta = (math.pi * 0.5 * lug_i) + math.pi * 0.25
        lug_pos = Vector((w_rim*0.49, math.sin(lug_theta)*0.075, math.cos(lug_theta)*0.075))
        lug_pos = rot_mat @ lug_pos + loc
        ret_nut = bmesh.ops.create_cone(bm_cap, cap_ends=True, cap_tris=False, segments=6, radius1=0.006, radius2=0.006, depth=0.015)
        for v in ret_nut['verts']:
            v.co = rot_mat @ v.co + lug_pos

    link_obj(name + "_Hubcap", bm_cap, wheels_branch, mats["chrome"], bevel=0.001)

    # 3.4 Brakes (Front Solid Discs with Calipers, Rear Finned Drums)
    bm_brake = bmesh.new()
    ret_disc = bmesh.ops.create_circle(bm_brake, cap_ends=True, segments=24, radius=0.135)
    for v in ret_disc['verts']:
        v.co = Vector((w_rim*0.15, v.co.y, v.co.x))
        v.co = rot_mat @ v.co + loc

    # Front caliper or rear drum housing
    caliper = bmesh.ops.create_cube(bm_brake, size=1.0)
    for v in caliper['verts']:
        v.co.x *= 0.050
        v.co.y = v.co.y * 0.065 + 0.100
        v.co.z = v.co.z * 0.045 + 0.080
        v.co = rot_mat @ v.co + loc

    link_obj(name + "_Brake", bm_brake, wheels_branch, mats["cast_iron"], bevel=0.002)


# ----------------------------------------------------------------------------
# 4. CLASS-A MONOCOQUE SHELL & FASTBACK GREENHOUSE (BODY_BRANCH)
# ----------------------------------------------------------------------------
def build_datsun_240z_monocoque(body_branch, mats, f_axle, r_axle):
    bm = bmesh.new()

    # Datsun 240Z Key Longitudinal Stations (Y from +2.07m to -2.07m)
    # Long hood occupies stations from Y = +2.05m back to cowl at Y = +0.38m!
    # Fastback sweeps from roof apex Y = -0.15m down to rear decklid cutoff Y = -1.95m.
    stations = [
        # (Y, Z_floor, Z_sill, Y_wheelcut, W_sill, W_shoulder, Z_shoulder, W_roof, Z_roof, is_hood, is_fastback)
        {"y":  2.06, "zf": 0.28, "zs": 0.42, "ws": 0.58, "wsh": 0.62, "zsh": 0.68, "wr": 0.40, "zr": 0.68, "type": "nose"},
        {"y":  1.92, "zf": 0.20, "zs": 0.38, "ws": 0.68, "wsh": 0.73, "zsh": 0.74, "wr": 0.52, "zr": 0.76, "type": "scoop_front"},
        {"y":  1.70, "zf": 0.17, "zs": 0.36, "ws": 0.74, "wsh": 0.77, "zsh": 0.78, "wr": 0.60, "zr": 0.80, "type": "scoop_rear"},
        {"y":  1.45, "zf": 0.16, "zs": 0.35, "ws": 0.78, "wsh": 0.79, "zsh": 0.81, "wr": 0.65, "zr": 0.83, "type": "hood_front"},
        {"y":  1.15, "zf": 0.15, "zs": 0.35, "ws": 0.80, "wsh": 0.81, "zsh": 0.83, "wr": 0.68, "zr": 0.85, "type": "f_axle"},
        {"y":  0.80, "zf": 0.15, "zs": 0.22, "ws": 0.79, "wsh": 0.80, "zsh": 0.84, "wr": 0.67, "zr": 0.86, "type": "hood_mid"},
        {"y":  0.40, "zf": 0.15, "zs": 0.20, "ws": 0.79, "wsh": 0.80, "zsh": 0.85, "wr": 0.66, "zr": 0.88, "type": "cowl"},
        {"y":  0.05, "zf": 0.15, "zs": 0.20, "ws": 0.80, "wsh": 0.81, "zsh": 0.86, "wr": 0.58, "zr": 1.26, "type": "a_pillar"},
        {"y": -0.20, "zf": 0.15, "zs": 0.20, "ws": 0.80, "wsh": 0.81, "zsh": 0.86, "wr": 0.57, "zr": 1.285,"type": "roof_apex"},
        {"y": -0.55, "zf": 0.15, "zs": 0.20, "ws": 0.80, "wsh": 0.81, "zsh": 0.86, "wr": 0.54, "zr": 1.25, "type": "b_pillar"},
        {"y": -0.85, "zf": 0.15, "zs": 0.20, "ws": 0.80, "wsh": 0.81, "zsh": 0.86, "wr": 0.50, "zr": 1.18, "type": "c_pillar"},
        {"y": -1.15, "zf": 0.15, "zs": 0.35, "ws": 0.80, "wsh": 0.815,"zsh": 0.86, "wr": 0.46, "zr": 1.08, "type": "r_axle"},
        {"y": -1.45, "zf": 0.16, "zs": 0.36, "ws": 0.78, "wsh": 0.80, "zsh": 0.85, "wr": 0.44, "zr": 0.98, "type": "hatch_slope"},
        {"y": -1.75, "zf": 0.18, "zs": 0.38, "ws": 0.75, "wsh": 0.78, "zsh": 0.84, "wr": 0.42, "zr": 0.88, "type": "kamm_lip"},
        {"y": -2.00, "zf": 0.24, "zs": 0.42, "ws": 0.68, "wsh": 0.73, "zsh": 0.82, "wr": 0.38, "zr": 0.82, "type": "kamm_tail"},
        {"y": -2.06, "zf": 0.28, "zs": 0.44, "ws": 0.62, "wsh": 0.68, "zsh": 0.80, "wr": 0.34, "zr": 0.80, "type": "rear_valance"},
    ]

    # Build Left & Right Symmetric Monocoque Panels
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

            # Wheel cutouts logic
            # Front wheel arch around f_axle (1.1525m)
            dist_f = abs(y - f_axle)
            if dist_f < 0.38:
                arch_lift = math.sqrt(max(0.0, 0.38**2 - dist_f**2)) * 0.75
                zs = max(zs, 0.317 + arch_lift)

            # Rear wheel arch around r_axle (-1.1525m)
            dist_r = abs(y - r_axle)
            if dist_r < 0.38:
                arch_lift_r = math.sqrt(max(0.0, 0.38**2 - dist_r**2)) * 0.75
                zs = max(zs, 0.317 + arch_lift_r)

            # 7 Vertical Rows per Cross-Section:
            # 0: Underbody Floor Centerline
            # 1: Lower Rocker Sill
            # 2: Mid Door / Lower Flare
            # 3: Waistline / Beltline Shoulder Crease
            # 4: Greenhouse Lower Beltline
            # 5: Roof Cant Rail / Fastback Shoulder
            # 6: Roof Centerline
            row = [
                bm.verts.new(Vector((0.0,                    y, zf))),
                bm.verts.new(Vector((ws * 0.80,             y, zf + (zs - zf) * 0.30))),
                bm.verts.new(Vector((ws,                    y, zs))),
                bm.verts.new(Vector((wsh * 1.02,            y, zs + (zsh - zs) * 0.55))),
                bm.verts.new(Vector((wsh,                   y, zsh))),
                bm.verts.new(Vector((wr,                    y, zsh + (zr - zsh) * 0.80))),
                bm.verts.new(Vector((0.0,                    y, zr))),
            ]
            grid.append(row)

        # Skin quad polygons across consecutive stations
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

    # Central Hood Longitudinal Power Bulge (Authentic 240Z Hood Ridge)
    # Extends from Y = 0.40m (cowl) forward to Y = 1.95m (nose tip)
    bm_bulge = bmesh.new()
    n_bulge_pts = 16
    for i in range(n_bulge_pts):
        t = i / (n_bulge_pts - 1)
        y_b = 0.40 + t * (1.95 - 0.40)
        z_base = 0.87 - t * 0.16
        z_peak = z_base + 0.022 * math.sin(t * math.pi)

        v_cl = bm_bulge.verts.new(Vector((0.0, y_b, z_peak)))
        v_l = bm_bulge.verts.new(Vector((0.14 * (1.0 - t * 0.3), y_b, z_base)))
        v_r = bm_bulge.verts.new(Vector((-0.14 * (1.0 - t * 0.3), y_b, z_base)))

    bm_bulge.verts.ensure_lookup_table()
    for i in range(n_bulge_pts - 1):
        idx0 = i * 3
        idx1 = (i + 1) * 3
        # Left face
        bm_bulge.faces.new((bm_bulge.verts[idx0], bm_bulge.verts[idx0+1], bm_bulge.verts[idx1+1], bm_bulge.verts[idx1]))
        # Right face
        bm_bulge.faces.new((bm_bulge.verts[idx0], bm_bulge.verts[idx1], bm_bulge.verts[idx1+2], bm_bulge.verts[idx0+2]))

    # Twin Hood Louver Vents (Left & Right rear hood vents, Y in [0.75m, 1.15m])
    for side in [1.0, -1.0]:
        ret_vent = bmesh.ops.create_cube(bm_bulge, size=1.0)
        for v in ret_vent['verts']:
            v.co.x = v.co.x * 0.110 + 0.320 * side
            v.co.y = v.co.y * 0.280 + 0.950
            v.co.z = v.co.z * 0.012 + 0.835

    link_obj("BODY_Hood_Details", bm_bulge, body_branch, mats["body_paint"], bevel=0.001)

    # Subsurf modifier on main body for organic vintage curvature
    obj_monocoque = link_obj("BODY_Monocoque", bm, body_branch, mats["body_paint"], bevel=0.002, auto_smooth=35.0)
    ss = obj_monocoque.modifiers.new("Subsurf", type='SUBSURF')
    ss.levels = 1
    ss.render_levels = 2


# ----------------------------------------------------------------------------
# 5. CONICAL SUGAR-SCOOP HEADLIGHTS & CHROME JEWELRY (LIGHT_BRANCH / BODY_BRANCH)
# ----------------------------------------------------------------------------
def build_datsun_240z_lighting(body_branch, mats):
    # The signature 240Z front end feature:
    # Deeply scooped parabolic "sugar-scoop" buckets in front fenders at X = ±0.58m, Y = 1.88m, Z = 0.68m
    bm_scoop = bmesh.new()
    bm_lens = bmesh.new()
    bm_chrome = bmesh.new()

    for side in [1.0, -1.0]:
        center = Vector((0.575 * side, 1.84, 0.675))
        r_outer = 0.145     # Outer scoop opening rim
        r_inner = 0.098     # Sealed-beam lamp rim
        depth = 0.165       # Recessed depth of the scoop

        n_seg = 24
        # 1. Parabolic scoop bucket walls
        rings = []
        n_steps = 6
        for step in range(n_steps):
            t = step / (n_steps - 1)
            r = r_outer * (1.0 - t * 0.32)
            y_offset = (1.0 - t**1.4) * depth
            ring = []
            for i in range(n_seg):
                theta = 2.0 * math.pi * i / n_seg
                x = center.x + r * math.cos(theta) * side
                y = center.y + y_offset
                z = center.z + r * math.sin(theta)
                ring.append(bm_scoop.verts.new(Vector((x, y, z))))
            rings.append(ring)

        for step in range(n_steps - 1):
            for i in range(n_seg):
                i_next = (i + 1) % n_seg
                v00 = rings[step][i]
                v01 = rings[step][i_next]
                v11 = rings[step+1][i_next]
                v10 = rings[step+1][i]
                if side > 0:
                    bm_scoop.faces.new((v00, v01, v11, v10))
                else:
                    bm_scoop.faces.new((v00, v10, v11, v01))

        # 2. Chrome Retaining Bezel Ring around the 7" headlamp
        ret_bezel = bmesh.ops.create_circle(bm_chrome, cap_ends=False, segments=24, radius=r_inner * 1.05)
        for v in ret_bezel['verts']:
            v.co = Vector((center.x + v.co.x * side, center.y + 0.008, center.z + v.co.y))

        # 3. Sealed-Beam Convex Glass Lens
        lens_center = Vector((center.x, center.y + 0.010, center.z))
        ret_lens = bmesh.ops.create_uvsphere(bm_lens, u_segments=16, v_segments=12, radius=r_inner)
        for v in ret_lens['verts']:
            # Flatten into convex headlamp lens
            v.co.y = math.copysign(abs(v.co.y)**0.5 * 0.035, v.co.y)
            v.co += lens_center

        # 4. Circular Amber Front Turn Signal Lamps (Below bumper, X = ±0.55m, Y = 2.02m, Z = 0.41m)
        ret_sig = bmesh.ops.create_uvsphere(bm_lens, u_segments=12, v_segments=8, radius=0.042)
        sig_pos = Vector((0.55 * side, 2.02, 0.41))
        for v in ret_sig['verts']:
            v.co.y *= 0.40
            v.co += sig_pos

        # Chrome bezel for turn signal
        ret_sig_ring = bmesh.ops.create_circle(bm_chrome, cap_ends=False, segments=16, radius=0.046)
        for v in ret_sig_ring['verts']:
            v.co = Vector((sig_pos.x + v.co.x, sig_pos.y - 0.005, sig_pos.z + v.co.y))

    link_obj("LIGHT_Headlamp_Scoops", bm_scoop, body_branch, mats["body_paint"], bevel=0.001)
    link_obj("LIGHT_Headlamp_ChromeRings", bm_chrome, body_branch, mats["chrome"], bevel=0.001)
    link_obj("LIGHT_Headlamp_Lenses", bm_lens, body_branch, mats["lens_clear"], bevel=0.0)

    # Rear Taillight Assemblies (Two-tier rectangular horizontal housings)
    # Left & Right at X = ±0.42m to ±0.68m, Y = -2.05m, Z = 0.68m
    bm_tail = bmesh.new()
    bm_tail_chrome = bmesh.new()

    for side in [1.0, -1.0]:
        x_c = 0.54 * side
        y_c = -2.045
        z_c = 0.680

        # Chrome perimeter bezel frame
        ret_f = bmesh.ops.create_cube(bm_tail_chrome, size=1.0)
        for v in ret_f['verts']:
            v.co.x = v.co.x * 0.320 + x_c
            v.co.y = v.co.y * 0.025 + y_c
            v.co.z = v.co.z * 0.130 + z_c

        # Chrome horizontal divider bar between tiers
        ret_div = bmesh.ops.create_cube(bm_tail_chrome, size=1.0)
        for v in ret_div['verts']:
            v.co.x = v.co.x * 0.310 + x_c
            v.co.y = v.co.y * 0.030 + y_c
            v.co.z = v.co.z * 0.012 + z_c

        # Top Tier: Amber Indicator Lens
        ret_amb = bmesh.ops.create_cube(bm_tail, size=1.0)
        for v in ret_amb['verts']:
            v.co.x = v.co.x * 0.290 + x_c
            v.co.y = v.co.y * 0.018 + y_c - 0.005
            v.co.z = v.co.z * 0.045 + (z_c + 0.035)

        # Bottom Tier: Red Brake/Tail Lens
        ret_red = bmesh.ops.create_cube(bm_tail, size=1.0)
        for v in ret_red['verts']:
            v.co.x = v.co.x * 0.290 + x_c
            v.co.y = v.co.y * 0.018 + y_c - 0.005
            v.co.z = v.co.z * 0.045 + (z_c - 0.035)

    link_obj("LIGHT_Taillight_Bezels", bm_tail_chrome, body_branch, mats["chrome"], bevel=0.001)
    link_obj("LIGHT_Taillight_Lenses", bm_tail, body_branch, mats["red_taillight"], bevel=0.001)


# ----------------------------------------------------------------------------
# 6. PERIOD CHROME BUMPERS, GRILLE & C-PILLAR "Z" EMBLEMS (BODY_BRANCH)
# ----------------------------------------------------------------------------
def build_datsun_240z_bumpers_and_grille(body_branch, mats):
    # Front Bumper: Slender curved chrome bar with twin vertical bumperettes (X = ±0.36m)
    bm_fbump = bmesh.new()
    bm_guards = bmesh.new()

    # Front chrome bar spanning Y = +2.07m, Z = 0.48m
    n_pts = 16
    fbump_pts = []
    for i in range(n_pts):
        t = i / (n_pts - 1)
        x = -0.74 + t * 1.48
        # Curved nose contour
        y = 2.065 - (abs(x) / 0.74)**2 * 0.11
        fbump_pts.append(Vector((x, y, 0.485)))

    for i in range(n_pts - 1):
        p0 = fbump_pts[i]
        p1 = fbump_pts[i+1]
        ret_b = bmesh.ops.create_cube(bm_fbump, size=1.0)
        dx = p1.x - p0.x
        dy = p1.y - p0.y
        mid = (p0 + p1) * 0.5
        for v in ret_b['verts']:
            v.co.x = v.co.x * abs(dx) + mid.x
            v.co.y = v.co.y * 0.045 + mid.y
            v.co.z = v.co.z * 0.065 + mid.z

    # Twin Front Rubber-Faced Bumperettes (Guards at X = ±0.36m)
    for side in [1.0, -1.0]:
        ret_g = bmesh.ops.create_cube(bm_guards, size=1.0)
        for v in ret_g['verts']:
            v.co.x = v.co.x * 0.045 + 0.36 * side
            v.co.y = v.co.y * 0.075 + 2.060
            v.co.z = v.co.z * 0.160 + 0.485

    link_obj("BODY_Front_Bumper", bm_fbump, body_branch, mats["chrome"], bevel=0.002)
    link_obj("BODY_Front_Bumper_Guards", bm_guards, body_branch, mats["trim_black"], bevel=0.002)

    # Front Radiator Grille (Horizontal black egg-crate slats between bumper and lower valance)
    bm_grille = bmesh.new()
    n_slats = 5
    for i in range(n_slats):
        z_slat = 0.34 + i * 0.024
        ret_s = bmesh.ops.create_cube(bm_grille, size=1.0)
        for v in ret_s['verts']:
            v.co.x *= 0.880
            v.co.y = v.co.y * 0.020 + 2.010
            v.co.z = v.co.z * 0.008 + z_slat

    link_obj("BODY_Front_Grille", bm_grille, body_branch, mats["trim_black"], bevel=0.001)

    # Rear Bumper: 3-piece chrome bar with vertical bumperettes and license plate cavity
    bm_rbump = bmesh.new()
    bm_rguards = bmesh.new()
    rbump_pts = []
    for i in range(n_pts):
        t = i / (n_pts - 1)
        x = -0.73 + t * 1.46
        y = -2.065 + (abs(x) / 0.73)**2 * 0.08
        rbump_pts.append(Vector((x, y, 0.540)))

    for i in range(n_pts - 1):
        p0 = rbump_pts[i]
        p1 = rbump_pts[i+1]
        ret_b = bmesh.ops.create_cube(bm_rbump, size=1.0)
        dx = p1.x - p0.x
        mid = (p0 + p1) * 0.5
        for v in ret_b['verts']:
            v.co.x = v.co.x * abs(dx) + mid.x
            v.co.y = v.co.y * 0.045 + mid.y
            v.co.z = v.co.z * 0.065 + mid.z

    for side in [1.0, -1.0]:
        ret_rg = bmesh.ops.create_cube(bm_rguards, size=1.0)
        for v in ret_rg['verts']:
            v.co.x = v.co.x * 0.045 + 0.38 * side
            v.co.y = v.co.y * 0.075 - 2.065
            v.co.z = v.co.z * 0.160 + 0.540

    link_obj("BODY_Rear_Bumper", bm_rbump, body_branch, mats["chrome"], bevel=0.002)
    link_obj("BODY_Rear_Bumper_Guards", bm_rguards, body_branch, mats["trim_black"], bevel=0.002)

    # Signature C-Pillar Circular Chrome "Z" Emblems
    # Mounted on each C-pillar sail panel: X = ±0.68m, Y = -0.92m, Z = 1.05m
    bm_emblem = bmesh.new()
    for side in [1.0, -1.0]:
        ret_emb = bmesh.ops.create_cone(bm_emblem, cap_ends=True, segments=20, radius1=0.038, radius2=0.038, depth=0.008)
        emb_pos = Vector((0.685 * side, -0.92, 1.05))
        rot_emb = Euler((0.0, math.radians(90.0 * side), 0.0), 'XYZ')
        for v in ret_emb['verts']:
            v.co = rot_emb.to_matrix() @ v.co + emb_pos

    # Vintage Chrome Door Handles & Fender Mirror Mounts
    for side in [1.0, -1.0]:
        # Door handle at X = ±0.81m, Y = -0.45m, Z = 0.86m
        ret_h = bmesh.ops.create_cube(bm_emblem, size=1.0)
        for v in ret_h['verts']:
            v.co.x = v.co.x * 0.015 + 0.812 * side
            v.co.y = v.co.y * 0.120 - 0.450
            v.co.z = v.co.z * 0.020 + 0.865

        # Chrome Fender Bullet Mirror at X = ±0.74m, Y = 1.25m, Z = 0.89m
        ret_m = bmesh.ops.create_cone(bm_emblem, cap_ends=True, segments=16, radius1=0.0275, radius2=0.0075, depth=0.090)
        for v in ret_m['verts']:
            v.co.x = v.co.x + 0.740 * side
            v.co.y = v.co.y + 1.250
            v.co.z = v.co.z + 0.890

    link_obj("BODY_Exterior_Jewelry", bm_emblem, body_branch, mats["chrome"], bevel=0.001)


# ----------------------------------------------------------------------------
# 7. FASTBACK GREENHOUSE & SAFETY GLASS (GLASS_BRANCH)
# ----------------------------------------------------------------------------
def build_datsun_240z_glass(glass_branch, mats):
    bm = bmesh.new()

    # 1. Front Windshield (Cowl Y = 0.38m to Roof Y = 0.02m)
    n_w_steps = 8
    ws_rings = []
    for step in range(n_w_steps):
        t = step / (n_w_steps - 1)
        y = 0.38 - t * 0.36
        z = 0.88 + t * 0.38
        w = 0.68 - t * 0.11
        ring = [
            bm.verts.new(Vector((-w, y, z))),
            bm.verts.new(Vector((-w * 0.5, y + 0.015 * math.sin(t*math.pi), z))),
            bm.verts.new(Vector((0.0, y + 0.025 * math.sin(t*math.pi), z + 0.005))),
            bm.verts.new(Vector((w * 0.5, y + 0.015 * math.sin(t*math.pi), z))),
            bm.verts.new(Vector((w, y, z))),
        ]
        ws_rings.append(ring)

    for step in range(n_w_steps - 1):
        for j in range(4):
            v00 = ws_rings[step][j]
            v01 = ws_rings[step][j+1]
            v11 = ws_rings[step+1][j+1]
            v10 = ws_rings[step+1][j]
            bm.faces.new((v00, v01, v11, v10))

    # 2. Side Door Glass & Triangular Rear Quarter Windows
    for side in [1.0, -1.0]:
        # Door Window (Frameless look with chrome sash)
        dw_verts = [
            bm.verts.new(Vector((0.66 * side,  0.00, 1.22))),
            bm.verts.new(Vector((0.72 * side,  0.08, 0.86))),
            bm.verts.new(Vector((0.74 * side, -0.45, 0.86))),
            bm.verts.new(Vector((0.65 * side, -0.45, 1.24))),
        ]
        if side > 0:
            bm.faces.new(dw_verts)
        else:
            bm.faces.new(dw_verts[::-1])

        # Triangular Quarter Glass behind B-Pillar
        qw_verts = [
            bm.verts.new(Vector((0.65 * side, -0.48, 1.24))),
            bm.verts.new(Vector((0.74 * side, -0.48, 0.86))),
            bm.verts.new(Vector((0.69 * side, -0.92, 0.87))),
            bm.verts.new(Vector((0.57 * side, -0.88, 1.15))),
        ]
        if side > 0:
            bm.faces.new(qw_verts)
        else:
            bm.faces.new(qw_verts[::-1])

    # 3. Sloping Fastback Rear Hatch Glass (Roof Y = -0.45m down to Hatch Cutoff Y = -1.68m)
    n_h_steps = 10
    h_rings = []
    for step in range(n_h_steps):
        t = step / (n_h_steps - 1)
        y = -0.45 - t * 1.23
        z = 1.24 - t * 0.38 - (t**2) * 0.05
        w = 0.54 - t * 0.12
        ring = [
            bm.verts.new(Vector((-w, y, z))),
            bm.verts.new(Vector((-w * 0.5, y - 0.010, z))),
            bm.verts.new(Vector((0.0, y - 0.018, z + 0.005))),
            bm.verts.new(Vector((w * 0.5, y - 0.010, z))),
            bm.verts.new(Vector((w, y, z))),
        ]
        h_rings.append(ring)

    for step in range(n_h_steps - 1):
        for j in range(4):
            v00 = h_rings[step][j]
            v01 = h_rings[step][j+1]
            v11 = h_rings[step+1][j+1]
            v10 = h_rings[step+1][j]
            bm.faces.new((v00, v01, v11, v10))

    link_obj("GLASS_Greenhouse", bm, glass_branch, mats["glass"], bevel=0.0)


# ----------------------------------------------------------------------------
# 8. VINTAGE SPORTS COCKPIT (INTERIOR_BRANCH)
# ----------------------------------------------------------------------------
def build_datsun_240z_interior(interior_branch, mats):
    bm_dash = bmesh.new()
    bm_wheel = bmesh.new()
    bm_seats = bmesh.new()

    # 8.1 Dashboard & Twin Hooded Instrument Binnacles
    # Dash span from Cowl (Y = 0.35m to Y = 0.05m, Z in [0.65m, 0.92m])
    dash_ret = bmesh.ops.create_cube(bm_dash, size=1.0)
    for v in dash_ret['verts']:
        v.co.x *= 1.300
        v.co.y = v.co.y * 0.300 + 0.180
        v.co.z = v.co.z * 0.220 + 0.780

    # Twin Deep Round Instrument Binnacles (Speedo & Tach in front of driver X = 0.34m)
    for side in [0.24, 0.44]:
        ret_bin = bmesh.ops.create_cone(bm_dash, cap_ends=True, segments=16, radius1=0.0425, radius2=0.0325, depth=0.080)
        for v in ret_bin['verts']:
            v.co.x += side
            v.co.y = v.co.y + 0.080
            v.co.z = v.co.z + 0.880

    # Trio of Angled Auxiliary Gauges atop center console (Clock, Oil/Temp, Fuel/Amp at X = 0.0, 0.08, -0.08)
    for g_x in [-0.09, 0.0, 0.09]:
        ret_g = bmesh.ops.create_cone(bm_dash, cap_ends=True, segments=12, radius1=0.032, radius2=0.032, depth=0.040)
        for v in ret_g['verts']:
            v.co.x += g_x
            v.co.y = v.co.y + 0.150
            v.co.z = v.co.z + 0.940

    # Center Transmission Console & Handbrake
    cons_ret = bmesh.ops.create_cube(bm_dash, size=1.0)
    for v in cons_ret['verts']:
        v.co.x *= 0.240
        v.co.y = v.co.y * 0.850 - 0.250
        v.co.z = v.co.z * 0.160 + 0.480

    link_obj("INTERIOR_Dashboard", bm_dash, interior_branch, mats["interior_vinyl"], bevel=0.002)

    # 8.2 Authentic 3-Spoke Drilled Wood-Rimmed Sports Steering Wheel
    # Wheel center: X = 0.34m (LHD), Y = -0.08m, Z = 0.82m, angled back 25 deg
    wh_pos = Vector((0.34, -0.08, 0.82))
    wh_rot = Euler((math.radians(-25.0), 0.0, 0.0), 'XYZ')

    # Wood rim (Torus with wood grain PBR)
    n_major = 24
    n_minor = 8
    r_maj = 0.175
    r_min = 0.012
    torus_rings = []
    for i in range(n_major):
        theta = 2.0 * math.pi * i / n_major
        cos_t = math.cos(theta)
        sin_t = math.sin(theta)
        ring_v = []
        for j in range(n_minor):
            phi = 2.0 * math.pi * j / n_minor
            cos_p = math.cos(phi)
            sin_p = math.sin(phi)
            r = r_maj + r_min * cos_p
            pt = Vector((r * cos_t, r_min * sin_p, r * sin_t))
            pt = wh_rot.to_matrix() @ pt + wh_pos
            ring_v.append(bm_wheel.verts.new(pt))
        torus_rings.append(ring_v)

    for i in range(n_major):
        i_next = (i + 1) % n_major
        for j in range(n_minor):
            j_next = (j + 1) % n_minor
            v00 = torus_rings[i][j]
            v01 = torus_rings[i][j_next]
            v11 = torus_rings[i_next][j_next]
            v10 = torus_rings[i_next][j]
            bm_wheel.faces.new((v00, v01, v11, v10))

    # 3 Drilled Chrome Metal Spokes (120 deg apart)
    for spk_i in range(3):
        theta = (2.0 * math.pi / 3.0) * spk_i - math.pi * 0.5
        ret_spk = bmesh.ops.create_cube(bm_wheel, size=1.0)
        for v in ret_spk['verts']:
            v.co.x = v.co.x * 0.024 + math.cos(theta) * 0.085
            v.co.y = v.co.y * 0.005 + math.sin(theta) * 0.085
            v.co.z = v.co.z * 0.006
            v.co = wh_rot.to_matrix() @ v.co + wh_pos

    # Center Horn Hub with Datsun "Z" crest
    ret_hub = bmesh.ops.create_cone(bm_wheel, cap_ends=True, segments=16, radius1=0.040, radius2=0.040, depth=0.025)
    for v in ret_hub['verts']:
        v.co = wh_rot.to_matrix() @ v.co + wh_pos

    # Tall Wooden Gear Shift Knob on Center Console
    ret_shifter = bmesh.ops.create_cone(bm_wheel, cap_ends=True, segments=12, radius1=0.008, radius2=0.008, depth=0.160)
    for v in ret_shifter['verts']:
        v.co.x += 0.0
        v.co.y = v.co.y - 0.120
        v.co.z = v.co.z + 0.620
    ret_knob = bmesh.ops.create_uvsphere(bm_wheel, u_segments=12, v_segments=8, radius=0.022)
    for v in ret_knob['verts']:
        v.co.x += 0.0
        v.co.y = v.co.y - 0.120
        v.co.z = v.co.z + 0.705

    link_obj("INTERIOR_SteeringWheel", bm_wheel, interior_branch, mats["wood_grain"], bevel=0.001)

    # 8.3 Contoured Low-Back Vintage Bucket Seats (Driver & Passenger)
    for side in [1.0, -1.0]:
        s_pos = Vector((0.34 * side, -0.42, 0.45))
        # Seat Cushion
        ret_cush = bmesh.ops.create_cube(bm_seats, size=1.0)
        for v in ret_cush['verts']:
            v.co.x = v.co.x * 0.440 + s_pos.x
            v.co.y = v.co.y * 0.460 + s_pos.y
            v.co.z = v.co.z * 0.120 + s_pos.z

        # Seat Backrest with Horizontal Fluted Pleats
        ret_back = bmesh.ops.create_cube(bm_seats, size=1.0)
        rot_b = Euler((math.radians(18.0), 0.0, 0.0), 'XYZ')
        for v in ret_back['verts']:
            v.co.x *= 0.420
            v.co.y *= 0.120
            v.co.z *= 0.500
            v.co = rot_b.to_matrix() @ v.co
            v.co.x += s_pos.x
            v.co.y += s_pos.y - 0.200
            v.co.z += s_pos.z + 0.320

    link_obj("INTERIOR_Seats", bm_seats, interior_branch, mats["interior_vinyl"], bevel=0.003)


# ----------------------------------------------------------------------------
# 9. UNDERBODY PLATFORM, L24 POWERTRAIN CRADLE & EXHAUST (PLATFORM_BRANCH)
# ----------------------------------------------------------------------------
def build_datsun_240z_platform(platform_branch, mats, f_axle, r_axle):
    bm = bmesh.new()

    # Flat aerodynamic underbody belly pan & chassis rails
    ret_floor = bmesh.ops.create_cube(bm, size=1.0)
    for v in ret_floor['verts']:
        v.co.x *= 1.300
        v.co.y = v.co.y * 3.600 + 0.000
        v.co.z = v.co.z * 0.040 + 0.145

    # Longitudinal Box-Section Frame Rails (Left & Right)
    for side in [1.0, -1.0]:
        ret_rail = bmesh.ops.create_cube(bm, size=1.0)
        for v in ret_rail['verts']:
            v.co.x = v.co.x * 0.075 + 0.48 * side
            v.co.y = v.co.y * 3.500
            v.co.z = v.co.z * 0.065 + 0.160

    # L24 2.4L Inline-6 Engine Sump Cradle (Front Bay)
    ret_sump = bmesh.ops.create_cube(bm, size=1.0)
    for v in ret_sump['verts']:
        v.co.x *= 0.360
        v.co.y = v.co.y * 0.720 + (f_axle - 0.15)
        v.co.z = v.co.z * 0.160 + 0.220

    # R180 Rear Differential Carrier (Rear Axle)
    ret_diff = bmesh.ops.create_uvsphere(bm, u_segments=12, v_segments=8, radius=0.120)
    for v in ret_diff['verts']:
        v.co.x *= 0.85
        v.co.y += r_axle
        v.co.z += 0.260

    # Half-shafts to rear wheels
    for side in [1.0, -1.0]:
        ret_ax = bmesh.ops.create_cone(bm, cap_ends=True, segments=8, radius1=0.020, radius2=0.020, depth=0.550)
        rot_ax = Euler((0.0, math.radians(90.0), 0.0), 'XYZ')
        for v in ret_ax['verts']:
            v.co = rot_ax.to_matrix() @ v.co
            v.co.x += 0.380 * side
            v.co.y += r_axle
            v.co.z += 0.260

    # 4 Enclosed Inner Wheel Arch Tubs (Guarantee zero see-through voids)
    for f_side in [1.0, -1.0]:
        ret_f_tub = bmesh.ops.create_cone(bm, cap_ends=True, segments=16, radius1=0.360, radius2=0.360, depth=0.220)
        rot_tub = Euler((0.0, math.radians(90.0), 0.0), 'XYZ')
        for v in ret_f_tub['verts']:
            v.co = rot_tub.to_matrix() @ v.co
            v.co.x += 0.620 * f_side
            v.co.y += f_axle
            v.co.z += 0.360

    for r_side in [1.0, -1.0]:
        ret_r_tub = bmesh.ops.create_cone(bm, cap_ends=True, segments=16, radius1=0.360, radius2=0.360, depth=0.220)
        rot_tub = Euler((0.0, math.radians(90.0), 0.0), 'XYZ')
        for v in ret_r_tub['verts']:
            v.co = rot_tub.to_matrix() @ v.co
            v.co.x += 0.620 * r_side
            v.co.y += r_axle
            v.co.z += 0.360

    link_obj("PLATFORM_Chassis", bm, platform_branch, mats["chassis_dark"], bevel=0.002)

    # Polished Stainless Steel Exhaust System with Angled Tailpipe Tip
    # Runs along passenger/driver transmission tunnel to rear
    bm_ex = bmesh.new()
    ex_pts = [
        Vector((0.24,  0.50, 0.22)),
        Vector((0.24, -0.60, 0.20)),
        Vector((0.30, -1.40, 0.22)),
        Vector((0.42, -1.90, 0.24)),
        Vector((0.46, -2.08, 0.24)),
    ]
    for i in range(len(ex_pts) - 1):
        p0 = ex_pts[i]
        p1 = ex_pts[i+1]
        mid = (p0 + p1) * 0.5
        v_len = (p1 - p0).length
        ret_pipe = bmesh.ops.create_cone(bm_ex, cap_ends=True, segments=12, radius1=0.028, radius2=0.028, depth=v_len)
        dir_vec = (p1 - p0).normalized()
        rot_q = Vector((0, 0, 1)).rotation_difference(dir_vec)
        for v in ret_pipe['verts']:
            v.co = rot_q.to_matrix() @ v.co + mid

    # Dual-walled polished chrome tip with dark inner bore
    ret_tip = bmesh.ops.create_cone(bm_ex, cap_ends=True, segments=16, radius1=0.0325, radius2=0.030, depth=0.140)
    rot_t = Euler((math.radians(90.0), 0.0, 0.0), 'XYZ')
    for v in ret_tip['verts']:
        v.co = rot_t.to_matrix() @ v.co
        v.co.x += 0.460
        v.co.y += -2.060
        v.co.z += 0.240

    link_obj("PLATFORM_Exhaust", bm_ex, platform_branch, mats["exhaust_metal"], bevel=0.001)


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


def build_datsun_240z_master():
    print("================================================================================")
    print("PURGING SCENE & BUILDING DATSUN 240Z (1970S COUPE) FROM FACTORY STATE")
    print("================================================================================")

    # 1. Complete scene purge to empty state
    purge_scene()

    # 2. Build root vehicle hierarchy
    root = bpy.data.objects.new("Datsun_240Z_Root", None)
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
    mats = create_datsun_240z_materials()

    # 4. Wheelbase & Tracks
    f_axle = 1.1525
    r_axle = -1.1525
    half_f_track = 0.6775
    half_r_track = 0.6725
    wheel_z = 0.317

    # 5. Build Wheels & Brakes
    print("[DATSUN_240Z] Constructing 14-inch Steel Wheels, Chrome Hubcaps & Vintage Radials...")
    build_datsun_240z_wheel(wheels_branch, mats, "WHEEL_FL", Vector(( half_f_track, f_axle, wheel_z)), is_left=True)
    build_datsun_240z_wheel(wheels_branch, mats, "WHEEL_FR", Vector((-half_f_track, f_axle, wheel_z)), is_left=False)
    build_datsun_240z_wheel(wheels_branch, mats, "WHEEL_RL", Vector(( half_r_track, r_axle, wheel_z)), is_left=True)
    build_datsun_240z_wheel(wheels_branch, mats, "WHEEL_RR", Vector((-half_r_track, r_axle, wheel_z)), is_left=False)

    # 6. Build Monocoque Body
    print("[DATSUN_240Z] Sculpting Long-Hood Short-Deck Monocoque & Central Power Bulge...")
    build_datsun_240z_monocoque(body_branch, mats, f_axle, r_axle)

    # 7. Build Conical Sugar-Scoop Headlights & Taillights
    print("[DATSUN_240Z] Assembling Iconic Sugar-Scoop Headlights & Two-Tier Taillights...")
    build_datsun_240z_lighting(body_branch, mats)

    # 8. Build Chrome Bumpers, Grille & Jewelry
    print("[DATSUN_240Z] Installing Polished Chrome Bumpers, Slatted Grille & C-Pillar Z Emblems...")
    build_datsun_240z_bumpers_and_grille(body_branch, mats)

    # 9. Build Fastback Greenhouse Glass
    print("[DATSUN_240Z] Installing Sloping Fastback Glass & Triangular Quarter Windows...")
    build_datsun_240z_glass(glass_branch, mats)

    # 10. Build Vintage Sports Cockpit
    print("[DATSUN_240Z] Installing Wood-Rimmed Wheel, Twin Binnacles & Fluted Bucket Seats...")
    build_datsun_240z_interior(interior_branch, mats)

    # 11. Build Underbody Platform & Exhaust
    print("[DATSUN_240Z] Assembling Platform Rails, L24 Cradle & Polished Stainless Exhaust...")
    build_datsun_240z_platform(platform_branch, mats, f_axle, r_axle)

    # 12. Export Dual-Mode GLBs
    export_paths = [
        r"E:\Car_Automation\public\models\vehicles\coupe\1970s\vehicle.glb",
        r"E:\Car_Automation\public\models\Car_Datsun_240Z_1970s.glb",
        r"E:\Car_Automation\exports\Car_Datsun_240Z_1970s.glb",
    ]
    for p in export_paths:
        os.makedirs(os.path.dirname(p), exist_ok=True)
        print(f"[DATSUN_240Z] Exporting GLB -> {p}...")
        bpy.ops.export_scene.gltf(
            filepath=p,
            export_format='GLB',
            use_selection=False,
            export_apply=True,
            export_yup=True
        )
        print(f"[DATSUN_240Z] Saved: {p} ({os.path.getsize(p) / 1024:.1f} KB)")

    print("================================================================================")
    print("DATSUN 240Z BUILD COMPLETE — GLBS EXPORTED SUCCESSFULLY")
    print("================================================================================")


if __name__ == "__main__":
    build_datsun_240z_master()
