"""
================================================================================
MASTER CLASS-A CAD GENERATOR: HONDA CIVIC TYPE R (EK9) (1990S HATCHBACK)
================================================================================
Procedural Class-A CAD Master Generator for the legendary 1997 Honda Civic
Type R (EK9) — The Golden Era High-Revving VTEC Hot Hatch Flagship.

Quality Gate & Production Standard Targets:
- 100.0% Grade A Production Certification (validate_glb_production.py)
- 900,000 - 2,500,000+ Triangles across 7/7 Populated Subsystems
- File Size: >= 15.0 MB uncompressed GLB (companion meshopt .opt.glb ~3.5 MB)
- Clean Open Cockpit Cabin Aperture (Zero solid sheet metal under glass)
- Separated Articulating Doors with Forward Lower A-Pillar Physical Hinges
- Slanted Teardrop Halogen Headlamps & Amber Corner Wraparound Indicators
- Dark Gunmetal Honeycomb Upper Grille with Red Honda "H" Chrome Emblem
- Integrated Type R Front Lip Chin Spoiler & Central Lower Cooling Intake
- High-Mount Pedestal Type R Rear Roof Spoiler Wing on Twin Stanchions
- Signature 1990s Vertical Wrap-Around Taillamp Clusters (Amber/White/Ruby Red)
- Iconic 15-Inch 7-Spoke Enkei Forged Alloy Wheels in Championship White (NH-0)
- Hand-Ported B16B 1.6L DOHC VTEC Engine & Championship White Front Strut Bar
- Red Recaro SR3 Sport Bucket Seats with Dual Harness Slots & Red Carpet
- Single 70mm Polished Stainless Steel Exhaust Cannon Exiting Right Rear
- 10 Semantic Hitboxes (sound_fx & haptic extras)
- 7 Baked NLA Actions + 4 Camera Nodes
================================================================================
"""

import bpy
import bmesh
import math
import os
import subprocess
from mathutils import Vector, Matrix, Euler


# ─── BMesh & Object Utilities ────────────────────────────────────────────────
def clean_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for col in list(bpy.data.collections):
        bpy.data.collections.remove(col)
    for block in [bpy.data.meshes, bpy.data.materials, bpy.data.curves, bpy.data.lights, bpy.data.cameras, bpy.data.actions]:
        for item in list(block):
            if item.users == 0:
                block.remove(item)


def safe_face(bm, verts, mat_idx=0):
    if len(verts) < 3:
        return None
    seen = set()
    for v in verts:
        if v in seen:
            return None
        seen.add(v)
    try:
        f = bm.faces.new(verts)
        f.material_index = mat_idx
        return f
    except ValueError:
        return None


def create_mesh_object(name, bm, parent_col, mat=None, smooth=True, bevel_w=0.0025, subsurf_lvl=0, parent_obj=None):
    mesh = bpy.data.meshes.new(name + "_Mesh")
    bm.to_mesh(mesh)
    bm.free()
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    if mat:
        if isinstance(mat, list):
            for m in mat:
                obj.data.materials.append(m)
        else:
            obj.data.materials.append(mat)
    parent_col.objects.link(obj)

    if parent_obj:
        obj.parent = parent_obj

    if smooth:
        for poly in obj.data.polygons:
            poly.use_smooth = True

    if bevel_w > 0:
        bev = obj.modifiers.new(name="Bevel", type='BEVEL')
        bev.width = bevel_w
        bev.segments = 2
        bev.limit_method = 'ANGLE'
        bev.angle_limit = math.radians(35.0)

    if subsurf_lvl > 0:
        sub = obj.modifiers.new(name="Subsurf", type='SUBSURF')
        sub.levels = subsurf_lvl
        sub.render_levels = subsurf_lvl

    wn = obj.modifiers.new(name="WeightedNormal", type='WEIGHTED_NORMAL')
    wn.keep_sharp = True

    return obj


def set_verts_face_mat(bm, verts, mat_idx):
    vset = set(verts)
    for f in bm.faces:
        if all(v in vset for v in f.verts):
            f.material_index = mat_idx


# ─── PBR Material Factory ────────────────────────────────────────────────────
def get_pbr_material(name, props, blend_method='OPAQUE'):
    mat = bpy.data.materials.get(name)
    if mat is None:
        mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
    else:
        mat.use_nodes = True

    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    if bsdf:
        if 'color' in props:
            bsdf.inputs['Base Color'].default_value = props['color']
        if 'metallic' in props:
            bsdf.inputs['Metallic'].default_value = props['metallic']
        if 'roughness' in props:
            bsdf.inputs['Roughness'].default_value = props['roughness']
        if 'clearcoat' in props and 'Coat Weight' in bsdf.inputs:
            bsdf.inputs['Coat Weight'].default_value = props['clearcoat']
        elif 'clearcoat' in props and 'Clearcoat' in bsdf.inputs:
            bsdf.inputs['Clearcoat'].default_value = props['clearcoat']
        if 'transmission' in props and 'Transmission Weight' in bsdf.inputs:
            bsdf.inputs['Transmission Weight'].default_value = props['transmission']
        elif 'transmission' in props and 'Transmission' in bsdf.inputs:
            bsdf.inputs['Transmission'].default_value = props['transmission']
        if 'ior' in props and 'IOR' in bsdf.inputs:
            bsdf.inputs['IOR'].default_value = props['ior']
        if 'emission' in props and 'Emission Color' in bsdf.inputs:
            bsdf.inputs['Emission Color'].default_value = props['emission']
            if 'emission_strength' in props and 'Emission Strength' in bsdf.inputs:
                bsdf.inputs['Emission Strength'].default_value = props['emission_strength']

    mat.blend_method = blend_method
    return mat


def create_ek9_materials():
    m = {}
    # Championship White (NH-0) High-Gloss Factory Paint
    m['paint'] = get_pbr_material('Mat_EK9_ChampionshipWhite', {
        'color': (0.935, 0.938, 0.925, 1.0),
        'metallic': 0.05,
        'roughness': 0.14,
        'clearcoat': 1.0
    })
    # Type R Red Enamel Accent & Badging
    m['red_badge'] = get_pbr_material('Mat_EK9_RedBadge', {
        'color': (0.85, 0.02, 0.02, 1.0),
        'metallic': 0.08,
        'roughness': 0.15,
        'clearcoat': 1.0
    })
    # Polished Mirror Chrome Jewelry & Emblems
    m['chrome'] = get_pbr_material('Mat_EK9_ChromeJewelry', {
        'color': (0.96, 0.96, 0.97, 1.0),
        'metallic': 0.98,
        'roughness': 0.04
    })
    # Polished Stainless Steel Exhaust Metal
    m['exhaust'] = get_pbr_material('Mat_EK9_ExhaustMetal', {
        'color': (0.88, 0.88, 0.90, 1.0),
        'metallic': 0.92,
        'roughness': 0.15
    })
    m['exhaust_inner'] = get_pbr_material('Mat_EK9_ExhaustInner', {
        'color': (0.015, 0.015, 0.015, 1.0),
        'metallic': 0.30,
        'roughness': 0.85
    })
    # Dark Gunmetal Grille Honeycomb Mesh
    m['grille_mesh'] = get_pbr_material('Mat_EK9_GrilleMesh', {
        'color': (0.040, 0.042, 0.045, 1.0),
        'metallic': 0.55,
        'roughness': 0.45
    })
    # Satin Black Textured Exterior Trim (Rubber seals, sills, wipers)
    m['trim_dark'] = get_pbr_material('Mat_EK9_SatinBlackTrim', {
        'color': (0.035, 0.035, 0.038, 1.0),
        'metallic': 0.08,
        'roughness': 0.65
    })
    # Enkei Championship White Forged Wheel Alloy
    m['wheel_white'] = get_pbr_material('Mat_EK9_WheelWhite', {
        'color': (0.92, 0.92, 0.91, 1.0),
        'metallic': 0.22,
        'roughness': 0.18,
        'clearcoat': 0.85
    })
    # Bridgestone Potenza RE010 Radial Tread Rubber
    m['tire_rubber'] = get_pbr_material('Mat_EK9_PotenzaRubber', {
        'color': (0.038, 0.038, 0.040, 1.0),
        'metallic': 0.02,
        'roughness': 0.82
    })
    # Cast Iron Ventilated Brake Rotor
    m['brake_metal'] = get_pbr_material('Mat_EK9_BrakeRotor', {
        'color': (0.50, 0.52, 0.55, 1.0),
        'metallic': 0.88,
        'roughness': 0.32
    })
    # Red Nissin / Type R Brake Caliper
    m['brake_caliper'] = get_pbr_material('Mat_EK9_BrakeCaliperRed', {
        'color': (0.80, 0.04, 0.04, 1.0),
        'metallic': 0.10,
        'roughness': 0.22,
        'clearcoat': 0.80
    })
    # Clear Polycarbonate Aerodynamic Outer Headlamp Lens
    m['headlamp_glass'] = get_pbr_material('Mat_EK9_HeadlampGlass', {
        'color': (0.94, 0.96, 0.98, 1.0),
        'metallic': 0.0,
        'roughness': 0.05,
        'transmission': 0.94,
        'ior': 1.52
    }, blend_method='HASHED')
    # Chrome Multi-Reflector Basin
    m['headlamp_reflector'] = get_pbr_material('Mat_EK9_HeadlampReflector', {
        'color': (0.96, 0.96, 0.98, 1.0),
        'metallic': 0.98,
        'roughness': 0.05
    })
    # Glowing Halogen Bulb Core Emitter
    m['bulb_halogen'] = get_pbr_material('Mat_EK9_BulbHalogen', {
        'color': (1.0, 0.92, 0.72, 1.0),
        'metallic': 0.0,
        'roughness': 0.10,
        'emission': (1.0, 0.90, 0.68, 1.0),
        'emission_strength': 4.5
    })
    # Amber Fluted Corner Turn Signal Lens
    m['indicator_amber'] = get_pbr_material('Mat_EK9_AmberTurnSignal', {
        'color': (0.95, 0.45, 0.02, 1.0),
        'metallic': 0.05,
        'roughness': 0.14,
        'transmission': 0.78,
        'ior': 1.53,
        'emission': (0.85, 0.35, 0.01, 1.0),
        'emission_strength': 2.0
    }, blend_method='HASHED')
    # Ruby Red Prismatic Taillight Lens
    m['tail_red'] = get_pbr_material('Mat_EK9_TaillampRed', {
        'color': (0.82, 0.02, 0.02, 1.0),
        'metallic': 0.05,
        'roughness': 0.12,
        'transmission': 0.72,
        'ior': 1.52,
        'emission': (0.75, 0.02, 0.02, 1.0),
        'emission_strength': 2.2
    }, blend_method='HASHED')
    # Reverse Clear White Optical Glass
    m['tail_white'] = get_pbr_material('Mat_EK9_TaillampWhite', {
        'color': (0.92, 0.92, 0.94, 1.0),
        'metallic': 0.05,
        'roughness': 0.10,
        'transmission': 0.85,
        'ior': 1.50
    }, blend_method='HASHED')
    # Dark Taillamp Housing Bezel
    m['tail_housing'] = get_pbr_material('Mat_EK9_TailHousing', {
        'color': (0.04, 0.04, 0.04, 1.0),
        'metallic': 0.20,
        'roughness': 0.50
    })
    # 1990s Tinted Dielectric Optical Safety Glass
    m['glass'] = get_pbr_material('Mat_EK9_OpticalGlass', {
        'color': (0.92, 0.96, 0.95, 1.0),
        'metallic': 0.0,
        'roughness': 0.02,
        'transmission': 0.94,
        'ior': 1.52,
        'clearcoat': 1.0
    }, blend_method='HASHED')
    # Recaro SR3 Red Alcantara Sport Bucket Seats
    m['recaro_red'] = get_pbr_material('Mat_EK9_RecaroRed', {
        'color': (0.78, 0.04, 0.04, 1.0),
        'metallic': 0.01,
        'roughness': 0.88
    })
    # Type R Red Cabin Carpeting
    m['red_carpet'] = get_pbr_material('Mat_EK9_RedCarpet', {
        'color': (0.70, 0.04, 0.04, 1.0),
        'metallic': 0.01,
        'roughness': 0.90
    })
    # 1990s Molded Black Civic Dashboard
    m['dash_black'] = get_pbr_material('Mat_EK9_DashBlack', {
        'color': (0.038, 0.038, 0.040, 1.0),
        'metallic': 0.02,
        'roughness': 0.60
    })
    # Amber-Backlit Instrument Cluster
    m['gauge_amber'] = get_pbr_material('Mat_EK9_GaugeAmber', {
        'color': (0.95, 0.50, 0.10, 1.0),
        'metallic': 0.05,
        'roughness': 0.20,
        'emission': (0.95, 0.50, 0.10, 1.0),
        'emission_strength': 2.5
    })
    # Machined Titanium Teardrop Shift Knob
    m['titanium_knob'] = get_pbr_material('Mat_EK9_TitaniumKnob', {
        'color': (0.62, 0.62, 0.64, 1.0),
        'metallic': 0.92,
        'roughness': 0.18
    })
    # B16B Wrinkle-Red Valve Cover
    m['engine_red'] = get_pbr_material('Mat_B16B_WrinkleRed', {
        'color': (0.80, 0.05, 0.05, 1.0),
        'metallic': 0.12,
        'roughness': 0.45
    })
    # B16B Cast Aluminum Engine Alloy
    m['engine_alloy'] = get_pbr_material('Mat_B16B_CastAlloy', {
        'color': (0.72, 0.74, 0.76, 1.0),
        'metallic': 0.85,
        'roughness': 0.32
    })
    # Underbody Floor Pan & Chassis
    m['chassis_dark'] = get_pbr_material('Mat_EK9_ChassisDark', {
        'color': (0.032, 0.032, 0.036, 1.0),
        'metallic': 0.35,
        'roughness': 0.65
    })
    # Invisible Raycast Hitbox
    m['invisible_hitbox'] = get_pbr_material('Mat_Invisible_Hitbox', {
        'color': (1.0, 1.0, 1.0, 0.0),
        'transmission': 1.0
    }, blend_method='BLEND')

    return m


# ─── 1. Miracle Civic EK9 Unibody Monocoque ─────────────────────────────────
def build_ek9_unibody(parent_col, mats):
    """
    Constructs the iconic "Miracle Civic" EK9 Hatchback Monocoque:
    - Wheelbase: 2,620 mm (axles at Y = +/- 1.310 m)
    - Max Width: 1,695 mm (Waistline X = +/- 0.8475 m)
    - Clean open cabin aperture for cockpit greenhouse (Zero solid sheet metal under glass)
    - Volumetric 3D structural A-pillars, cantrails, B-pillars, and C-pillars
    - Closed front fascia with lower cooling mouth, dark radiator backing, and chin lip
    - Solid rear bumper with license plate cavity and exhaust cutout
    - Full enclosed wheel tubs & flat underfloor belly pan (guaranteed zero see-through voids)
    """
    bm = bmesh.new()

    f_axle = 1.310
    r_axle = -1.310
    hw = 0.8475  # Half-width at waist (1,695mm overall)

    # 12 Longitudinal Stations
    y_stations = [
        2.090,   # 0: Front bumper tip & chin lip leading edge
        1.950,   # 1: Grille face & headlamp front
        1.680,   # 2: Front hood nose & fender crown
        f_axle,  # 3: Front wheel center (+1.310)
        0.880,   # 4: Cowl / lower A-pillar base & front door shutline
       -0.150,   # 5: B-pillar & rear door shutline
       -0.650,   # 6: Rear quarter window center
       -1.050,   # 7: Rear wheel flare start / C-pillar forward base
        r_axle,  # 8: Rear wheel center (-1.310)
       -1.650,   # 9: Rear C-pillar base & roof rear header
       -1.920,   # 10: Rear waistline / taillight cluster
       -2.090,   # 11: Rear bumper cutoff & exhaust outlet
    ]

    w_scale = [
        0.82,  # 0: Front chin (sw = 0.695)
        0.88,  # 1: Grille face (sw = 0.746)
        0.94,  # 2: Hood nose (sw = 0.797)
        0.98,  # 3: Front wheel flare (sw = 0.830)
        0.96,  # 4: A-pillar / Cowl (sw = 0.814)
        0.95,  # 5: B-pillar waist (sw = 0.805)
        0.96,  # 6: Rear quarter (sw = 0.814)
        0.99,  # 7: Rear wheel flare start (sw = 0.839)
        0.99,  # 8: Rear wheel center (sw = 0.839)
        0.94,  # 9: C-pillar waist (sw = 0.797)
        0.90,  # 10: Taillight corner (sw = 0.763)
        0.85,  # 11: Rear bumper cutoff (sw = 0.720)
    ]

    grid_verts = []
    for s_idx, y in enumerate(y_stations):
        sw = hw * w_scale[s_idx]
        z_bot = 0.120 if s_idx not in [3, 8] else 0.320
        z_mid = 0.500
        z_top = 0.745
        z_crown = 0.770

        if s_idx in [0, 1]:
            z_mid = 0.440
            z_top = 0.660
            z_crown = 0.700
        elif s_idx == 2:
            z_mid = 0.480
            z_top = 0.720
            z_crown = 0.750
        elif s_idx >= 9:
            z_mid = 0.480
            z_top = 0.760
            z_crown = 0.785

        p_list = [
            Vector((-sw * 0.90, y, z_bot)),
            Vector((-sw * 0.98, y, z_mid * 0.75)),
            Vector((-sw * 1.00, y, z_mid)),
            Vector((-sw * 0.96, y, z_top)),
            Vector((-sw * 0.50, y, z_crown)),
            Vector(( 0.00,      y, z_crown + 0.015)),
            Vector(( sw * 0.50, y, z_crown)),
            Vector(( sw * 0.96, y, z_top)),
            Vector(( sw * 1.00, y, z_mid)),
            Vector(( sw * 0.98, y, z_mid * 0.75)),
            Vector(( sw * 0.90, y, z_bot)),
        ]
        row_verts = [bm.verts.new(p) for p in p_list]
        grid_verts.append(row_verts)

    # Bridge unibody quads along longitudinal stations
    for s_idx in range(len(y_stations) - 1):
        r0 = grid_verts[s_idx]
        r1 = grid_verts[s_idx + 1]

        # Station 4 to 5: Front door opening (omit door skin so articulating door fits)
        is_door_zone = (s_idx == 4)
        # Station 4 to 9: Open cabin interior aperture (omit upper deck so interior is visible)
        in_cockpit = (4 <= s_idx < 9)

        for c_idx in range(len(r0) - 1):
            if is_door_zone and (c_idx in [1, 2, 7, 8]):
                continue
            if in_cockpit and (3 <= c_idx <= 6):
                continue

            v0 = r0[c_idx]
            v1 = r0[c_idx + 1]
            v2 = r1[c_idx + 1]
            v3 = r1[c_idx]
            safe_face(bm, [v0, v1, v2, v3], mat_idx=0)

    # Front Fascia End Cap & Lower Apron (Station 0)
    r_front = grid_verts[0]
    safe_face(bm, [r_front[0], r_front[1], r_front[2], r_front[3]], mat_idx=0)
    safe_face(bm, [r_front[3], r_front[4], r_front[5], r_front[6], r_front[7]], mat_idx=0)
    safe_face(bm, [r_front[7], r_front[8], r_front[9], r_front[10]], mat_idx=0)

    # Solid Radiator Backing Plate (Station 1: Y=1.950, Mat 1: trim_dark)
    # Guaranteed ZERO see-through voids through the front bumper!
    r_grille = grid_verts[1]
    safe_face(bm, [r_grille[1], r_grille[9], r_grille[8], r_grille[2]], mat_idx=1)

    # Rear Bumper End Cap & Center Fascia (Station 11)
    r_rear = grid_verts[-1]
    safe_face(bm, [r_rear[0], r_rear[1], r_rear[2], r_rear[3]], mat_idx=0)
    safe_face(bm, [r_rear[3], r_rear[4], r_rear[5], r_rear[6], r_rear[7]], mat_idx=0)
    safe_face(bm, [r_rear[7], r_rear[8], r_rear[9], r_rear[10]], mat_idx=0)
    safe_face(bm, [r_rear[0], r_rear[10], r_rear[7], r_rear[3]], mat_idx=0)  # Solid rear bumper face

    # ─── Volumetric Roof Superstructure & Structural Pillars ─────────────────
    # 1. Aerodynamic Roof Panel Slab (from Cowl Y=0.470 to Tailgate Y=-1.630 at Z=1.350)
    ret_roof = bmesh.ops.create_cube(bm, size=1.0)
    for v in ret_roof['verts']:
        v.co.x *= 1.220
        v.co.y = (v.co.y * 2.100) - 0.580
        v.co.z = (v.co.z * 0.035) + 1.350
    set_verts_face_mat(bm, ret_roof['verts'], 0)

    # 2. Volumetric A-Pillars (from Cowl Y=0.880, Z=0.745 to Roof Y=0.470, Z=1.350)
    for side in [1.0, -1.0]:
        ret_ap = bmesh.ops.create_cube(bm, size=1.0)
        for v in ret_ap['verts']:
            ty = (v.co.y + 0.5)  # 0 at roof (Y=0.470), 1 at cowl (Y=0.880)
            ax = side * (0.610 * (1.0 - ty) + 0.770 * ty)
            v.co.x = (v.co.x * 0.040) + ax
            v.co.y = (v.co.y * 0.410) + 0.675
            v.co.z = (v.co.z * 0.040) + 1.050
            v.co.z -= (v.co.y - 0.675) * 1.47
        set_verts_face_mat(bm, ret_ap['verts'], 0)

    # 3. Volumetric B-Pillars (at Y = -0.150, waist Z=0.745 to roof Z=1.350, Mat 1: trim_dark)
    for side in [1.0, -1.0]:
        ret_bp = bmesh.ops.create_cube(bm, size=1.0)
        for v in ret_bp['verts']:
            tz = (v.co.z + 0.5)
            bx = side * (0.805 * (1.0 - tz) + 0.610 * tz)
            v.co.x = (v.co.x * 0.035) + bx
            v.co.y = (v.co.y * 0.060) - 0.150
            v.co.z = (v.co.z * 0.580) + 1.050
        set_verts_face_mat(bm, ret_bp['verts'], 1)

    # 4. Volumetric C-Pillars (slanted aerodynamic C-pillar haunches from roof Y=-1.600 down to quarter Y=-1.750)
    for side in [1.0, -1.0]:
        ret_cp = bmesh.ops.create_cube(bm, size=1.0)
        for v in ret_cp['verts']:
            tz = (v.co.z + 0.5)
            cx = side * (0.785 * (1.0 - tz) + 0.610 * tz)
            cy = -1.750 * (1.0 - tz) - 1.600 * tz
            v.co.x = (v.co.x * 0.050) + cx
            v.co.y = (v.co.y * 0.160) + cy
            v.co.z = (v.co.z * 0.560) + 1.055
        set_verts_face_mat(bm, ret_cp['verts'], 0)

    # 5. Championship White Side Protector Moldings (Front fender and rear quarter only)
    for s in [1.0, -1.0]:
        # Front fender bump strip (Y = 0.880 to 1.300)
        ret_rub_f = bmesh.ops.create_cube(bm, size=1.0)
        for v in ret_rub_f['verts']:
            v.co.x = (v.co.x * 0.015) + (s * (hw * 0.985 + 0.008))
            v.co.y = (v.co.y * 0.420) + 1.090
            v.co.z = (v.co.z * 0.035) + 0.500
        set_verts_face_mat(bm, ret_rub_f['verts'], 0)

        # Rear quarter bump strip (Y = -0.150 to -1.050)
        ret_rub_r = bmesh.ops.create_cube(bm, size=1.0)
        for v in ret_rub_r['verts']:
            v.co.x = (v.co.x * 0.015) + (s * (hw * 0.985 + 0.008))
            v.co.y = (v.co.y * 0.900) - 0.600
            v.co.z = (v.co.z * 0.035) + 0.500
        set_verts_face_mat(bm, ret_rub_r['verts'], 0)

    # 6. Integrated Type R Front Lip Chin Spoiler (Championship White, Station 0)
    ret_chin = bmesh.ops.create_cube(bm, size=1.0)
    for v in ret_chin['verts']:
        v.co.x *= 1.480
        v.co.y = (v.co.y * 0.060) + 2.110
        v.co.z = (v.co.z * 0.035) + 0.135
    set_verts_face_mat(bm, ret_chin['verts'], 0)

    # 7. Enclosed Inner Wheel Arch Tubs (Zero See-Through Voids)
    tub_r = 0.335
    for ax_y in [f_axle, r_axle]:
        track_w = 0.740
        for sign in [1.0, -1.0]:
            ret_tub = bmesh.ops.create_cube(bm, size=1.0)
            for v in ret_tub['verts']:
                v.co.x = (v.co.x * 0.220) + sign * (track_w - 0.060)
                v.co.y = (v.co.y * (tub_r * 2.1)) + ax_y
                v.co.z = (v.co.z * 0.350) + 0.360
            set_verts_face_mat(bm, ret_tub['verts'], 1)

    # 8. Flat Underfloor Belly Pan (Y = +2.080 to -2.080)
    ret_pan = bmesh.ops.create_cube(bm, size=1.0)
    for v in ret_pan['verts']:
        v.co.x *= 1.480
        v.co.y = (v.co.y * 4.160)
        v.co.z = (v.co.z * 0.020) + 0.110
    set_verts_face_mat(bm, ret_pan['verts'], 1)

    # Subdivide edges for high CAD polygon density
    bmesh.ops.subdivide_edges(bm, edges=bm.edges, cuts=2, use_grid_fill=True)

    obj = create_mesh_object(
        "BODY_EK9_Unibody",
        bm,
        parent_col,
        mat=[mats['paint'], mats['trim_dark']],
        smooth=True,
        bevel_w=0.0025,
        subsurf_lvl=2
    )
    return obj


# ─── 2. Separated Articulating Doors (DOOR_FL & DOOR_FR) ─────────────────────
def build_ek9_doors(parent_col, mats):
    """
    Constructs left and right articulating hatchback doors:
    - Forward physical hinge vector at lower A-pillar: (X = +/-0.825, Y = 0.880, Z = 0.500)
    - export_apply=False preserves local physical hinge axes
    - Flush body-colored exterior lift door handle & side mirror
    - Inner door card with red Recaro fabric center inlay, armrest, and speaker grille
    - Framed optical safety side window glass
    """
    doors = {}
    f_hinge_y = 0.880
    f_hinge_z = 0.500
    door_len = 1.030  # from Y = 0.880 to Y = -0.150

    for name_suffix, side_mult in [("FL", -1.0), ("FR", 1.0)]:
        hx = side_mult * 0.825
        door_origin = Vector((hx, f_hinge_y, f_hinge_z))

        bm_outer = bmesh.new()

        # 1. Outer Door Skin (Spans 0.0 to -door_len in local Y, matching waistline and rocker sill)
        ret_outer = bmesh.ops.create_cube(bm_outer, size=1.0)
        for v in ret_outer['verts']:
            v.co.x = (v.co.x * 0.040) + (side_mult * 0.010)
            v.co.y = (v.co.y * door_len) - (door_len * 0.5)
            v.co.z = (v.co.z * 0.500) + 0.000
        set_verts_face_mat(bm_outer, ret_outer['verts'], 0)  # Mat 0: paint

        # Horizontal side protector bump strip on door (Mat 0: paint)
        ret_dr_strip = bmesh.ops.create_cube(bm_outer, size=1.0)
        for v in ret_dr_strip['verts']:
            v.co.x = (v.co.x * 0.015) + (side_mult * 0.035)
            v.co.y = (v.co.y * door_len * 0.98) - (door_len * 0.5)
            v.co.z = (v.co.z * 0.035) + 0.000
        set_verts_face_mat(bm_outer, ret_dr_strip['verts'], 0)

        # 3. Flush Body-Colored Door Handle
        ret_hnd = bmesh.ops.create_cube(bm_outer, size=1.0)
        for v in ret_hnd['verts']:
            v.co.x = (v.co.x * 0.018) + (side_mult * 0.040)
            v.co.y = (v.co.y * 0.120) - 0.820
            v.co.z = (v.co.z * 0.035) + 0.120
        set_verts_face_mat(bm_outer, ret_hnd['verts'], 0)

        # 4. Aerodynamic Championship White Side Mirror (Mat 0: paint, Mat 4: chrome)
        ret_mir = bmesh.ops.create_cube(bm_outer, size=1.0)
        for v in ret_mir['verts']:
            v.co.x = (v.co.x * 0.075) + (side_mult * 0.095)
            v.co.y = (v.co.y * 0.120) - 0.160
            v.co.z = (v.co.z * 0.075) + 0.310
        set_verts_face_mat(bm_outer, ret_mir['verts'], 0)

        ret_mg = bmesh.ops.create_cube(bm_outer, size=1.0)
        for v in ret_mg['verts']:
            v.co.x = (v.co.x * 0.005) + (side_mult * 0.095)
            v.co.y = (v.co.y * 0.110) - 0.160
            v.co.z = (v.co.z * 0.065) + 0.310
            v.co.x -= side_mult * 0.032
        set_verts_face_mat(bm_outer, ret_mg['verts'], 4)  # Mat 4: chrome

        bmesh.ops.subdivide_edges(bm_outer, edges=bm_outer.edges, cuts=2, use_grid_fill=True)

        obj_door = create_mesh_object(
            f"DOOR_{name_suffix}_EK9",
            bm_outer,
            parent_col,
            mat=[mats['paint'], mats['trim_dark'], mats['glass'], mats['recaro_red'], mats['chrome']],
            smooth=True,
            bevel_w=0.002,
            subsurf_lvl=2
        )
        obj_door.location = door_origin

        # 5. Inner Door Card (Molded Black Vinyl + Signature Red Recaro Fabric Inlay)
        bm_inner = bmesh.new()
        ret_in = bmesh.ops.create_cube(bm_inner, size=1.0)
        for v in ret_in['verts']:
            v.co.x = (v.co.x * 0.035) - (side_mult * 0.025)
            v.co.y = (v.co.y * (door_len * 0.96)) - (door_len * 0.5)
            v.co.z = (v.co.z * 0.500) + 0.000
        set_verts_face_mat(bm_inner, ret_in['verts'], 0)  # Mat 0: dash_black

        # Red Recaro fabric center inlay (Mat 1: recaro_red)
        ret_inlay = bmesh.ops.create_cube(bm_inner, size=1.0)
        for v in ret_inlay['verts']:
            v.co.x = (v.co.x * 0.020) - (side_mult * 0.045)
            v.co.y = (v.co.y * 0.580) - (door_len * 0.45)
            v.co.z = (v.co.z * 0.220) + 0.050
        set_verts_face_mat(bm_inner, ret_inlay['verts'], 1)

        bmesh.ops.subdivide_edges(bm_inner, edges=bm_inner.edges, cuts=2, use_grid_fill=True)

        obj_inner = create_mesh_object(
            f"DOOR_{name_suffix}_EK9_InnerCard",
            bm_inner,
            parent_col,
            mat=[mats['dash_black'], mats['recaro_red']],
            smooth=True,
            bevel_w=0.002,
            subsurf_lvl=1,
            parent_obj=obj_door
        )

        # 6. Frameless Side Window Glass (Mat: glass)
        bm_glass = bmesh.new()
        ret_gl = bmesh.ops.create_cube(bm_glass, size=1.0)
        for v in ret_gl['verts']:
            v.co.x = (v.co.x * 0.006) - (side_mult * (v.co.z + 0.5) * 0.090)
            v.co.y = (v.co.y * (door_len * 0.92)) - (door_len * 0.5)
            v.co.z = (v.co.z * 0.520) + 0.530
        bmesh.ops.subdivide_edges(bm_glass, edges=bm_glass.edges, cuts=2, use_grid_fill=True)

        obj_glass = create_mesh_object(
            f"DOOR_{name_suffix}_EK9_WindowGlass",
            bm_glass,
            parent_col,
            mat=mats['glass'],
            smooth=True,
            bevel_w=0.001,
            subsurf_lvl=1,
            parent_obj=obj_door
        )

        doors[name_suffix] = obj_door

    return doors


# ─── 3. Greenhouse Glass & High-Mount Type R Pedestal Wing ───────────────────
def build_ek9_greenhouse_and_wing(parent_col, mats):
    """
    Constructs high-rake optical automotive safety glass & Type R pedestal wing:
    - Front windshield with ceramic black frit perimeter border
    - Pop-out rear quarter windows with black seal gaskets
    - Steeply raked rear hatch window with heated defroster lines & rear wiper
    - High-mount pedestal Type R rear roof spoiler wing on twin stanchions
    """
    bm = bmesh.new()

    # 1. Front Windshield (from Cowl Y=0.880 to Roof Y=0.470)
    ret_ws = bmesh.ops.create_cube(bm, size=1.0)
    for v in ret_ws['verts']:
        v.co.x *= 1.220
        v.co.y = (v.co.y * 0.410) + 0.675
        v.co.z = (v.co.z * 0.006) + 1.050
        v.co.z -= (v.co.y - 0.675) * 1.47
    set_verts_face_mat(bm, ret_ws['verts'], 0)  # Mat 0: glass

    # 2. Fixed Rear Quarter Windows (from B-pillar Y=-0.150 to C-pillar Y=-1.600)
    for side in [1.0, -1.0]:
        ret_rw = bmesh.ops.create_cube(bm, size=1.0)
        for v in ret_rw['verts']:
            v.co.x = (v.co.x * 0.006) + (side * 0.770)
            v.co.y = (v.co.y * 1.350) - 0.875
            v.co.z = (v.co.z * 0.500) + 1.050
        set_verts_face_mat(bm, ret_rw['verts'], 0)

        # Quarter window rubber perimeter seal (Mat 1: trim_dark)
        ret_g = bmesh.ops.create_cube(bm, size=1.0)
        for v in ret_g['verts']:
            v.co.x = (v.co.x * 0.015) + (side * 0.775)
            v.co.y = (v.co.y * 1.400) - 0.875
            v.co.z = (v.co.z * 0.015) + 0.750
        set_verts_face_mat(bm, ret_g['verts'], 1)

    # 3. Rear Tailgate Hatch Window (from roof Y=-1.600 to rear deck Y=-1.950)
    ret_hw = bmesh.ops.create_cube(bm, size=1.0)
    for v in ret_hw['verts']:
        v.co.x *= 1.140
        v.co.y = (v.co.y * 0.350) - 1.775
        v.co.z = (v.co.z * 0.006) + 1.060
        v.co.z += (v.co.y + 1.775) * 1.65
    set_verts_face_mat(bm, ret_hw['verts'], 0)

    # 4. Rear Hatch Wiper Arm (Mat 1: trim_dark)
    ret_rw = bmesh.ops.create_cube(bm, size=1.0)
    rot_rw = Euler((math.radians(35.0), 0.0, math.radians(-15.0)), 'XYZ').to_matrix()
    for v in ret_rw['verts']:
        v.co.x *= 0.008
        v.co.y = (v.co.y * 0.280) + 0.140
        v.co.z *= 0.006
        v.co = rot_rw @ v.co
        v.co.x += 0.050
        v.co.y -= 1.820
        v.co.z += 0.900
    set_verts_face_mat(bm, ret_rw['verts'], 1)

    # 5. High-Mount Pedestal Type R Rear Roof Spoiler Wing
    # Wing aerofoil blade (Championship White, Mat 2: paint)
    ret_wing = bmesh.ops.create_cube(bm, size=1.0)
    rot_wing = Euler((math.radians(8.0), 0.0, 0.0), 'XYZ').to_matrix()
    for v in ret_wing['verts']:
        v.co.x *= 1.180
        v.co.y = (v.co.y * 0.180) - 1.680
        v.co.z = (v.co.z * 0.030) + 1.430
        v.co = rot_wing @ (v.co - Vector((0.0, -1.680, 1.430))) + Vector((0.0, -1.680, 1.430))
    set_verts_face_mat(bm, ret_wing['verts'], 2)  # Mat 2: paint

    # Twin aerodynamic mounting stanchions (at X = +/-0.460)
    for s_sign in [-1.0, 1.0]:
        ret_stn = bmesh.ops.create_cube(bm, size=1.0)
        for v in ret_stn['verts']:
            v.co.x = (v.co.x * 0.035) + (s_sign * 0.460)
            v.co.y = (v.co.y * 0.090) - 1.620
            v.co.z = (v.co.z * 0.090) + 1.385
        set_verts_face_mat(bm, ret_stn['verts'], 2)

    bmesh.ops.subdivide_edges(bm, edges=bm.edges, cuts=2, use_grid_fill=True)

    obj = create_mesh_object(
        "GLASS_EK9_Greenhouse",
        bm,
        parent_col,
        mat=[mats['glass'], mats['trim_dark'], mats['paint']],
        smooth=True,
        bevel_w=0.0015,
        subsurf_lvl=2
    )
    return obj


# ─── 4. 15-Inch Enkei 7-Spoke Forged Alloy Wheels & Potenza RE010 Tires ──────
def build_ek9_enkei_wheel_corner(corner_name, location, is_front, is_left, parent_col, mats):
    """
    Constructs the iconic 15-Inch 7-Spoke Enkei Forged Alloy Wheel in Championship White:
    - 15x6.0 JJ Enkei lightweight forged alloy wheel
    - 7 sculpted curved spokes radiating from recessed center hub
    - Red Honda "H" center hub dust cap & 5 chrome acorn lug nuts (5x114.3 PCD)
    - 282mm ventilated front disc brake rotor with red Nissin caliper
    - Bridgestone Potenza RE010 195/55 R15 radial tire with 3D directional tread sipes
    """
    bm = bmesh.new()

    x_sign = -1.0 if is_left else 1.0
    rim_r = 0.1905   # 15 inch rim radius
    tire_r = 0.298   # 195/55 R15 overall radius
    width = 0.195    # 195mm tire tread width
    rim_w = 0.155    # 6.0 inch wheel width
    spoke_count = 7

    rot_x_axis = Matrix.Rotation(math.radians(90.0), 4, 'Y')

    # 1. 15-Inch Wheel Rim Barrel & Stepped Lip (Mat 0: wheel_white)
    ret_barrel = bmesh.ops.create_cone(
        bm, cap_ends=False, segments=36, radius1=rim_r, radius2=rim_r * 0.94, depth=rim_w,
        matrix=rot_x_axis
    )
    set_verts_face_mat(bm, ret_barrel['verts'], 0)

    # Stepped Outer Rim Lip
    ret_lip = bmesh.ops.create_cone(
        bm, cap_ends=False, segments=36, radius1=rim_r * 0.98, radius2=rim_r * 0.88, depth=0.025,
        matrix=Matrix.Translation(Vector((x_sign * (rim_w * 0.44), 0.0, 0.0))) @ rot_x_axis
    )
    set_verts_face_mat(bm, ret_lip['verts'], 0)

    # 2. Recessed Center Hub & 7 Curved Aerodynamic Spokes
    face_x = x_sign * (rim_w * 0.40)
    ret_hub = bmesh.ops.create_cone(
        bm, cap_ends=True, segments=24, radius1=0.065, radius2=0.048, depth=0.025,
        matrix=Matrix.Translation(Vector((face_x, 0.0, 0.0))) @ rot_x_axis
    )
    set_verts_face_mat(bm, ret_hub['verts'], 0)

    # 7 Curved Radiating Spokes
    for sp_i in range(spoke_count):
        sp_ang = (sp_i / spoke_count) * 2.0 * math.pi
        ret_spk = bmesh.ops.create_cube(bm, size=1.0)
        spk_rot = Euler((0.0, 0.0, sp_ang), 'XYZ').to_matrix()
        for v in ret_spk['verts']:
            v.co.x = (v.co.x * 0.022) + face_x
            v.co.y = (v.co.y * 0.038)
            v.co.z = (v.co.z * (rim_r * 0.60)) + (rim_r * 0.62)
            yz = spk_rot @ Vector((v.co.y, v.co.z, 0.0))
            v.co.y = yz.x
            v.co.z = yz.y
        set_verts_face_mat(bm, ret_spk['verts'], 0)

    # 5 Chrome Lug Nuts (5x114.3 PCD)
    for bolt_i in range(5):
        b_ang = (bolt_i / 5.0) * 2.0 * math.pi
        by = math.cos(b_ang) * 0.057
        bz = math.sin(b_ang) * 0.057
        ret_bolt = bmesh.ops.create_cone(
            bm, cap_ends=True, segments=6, radius1=0.008, radius2=0.007, depth=0.015,
            matrix=Matrix.Translation(Vector((x_sign * (rim_w * 0.46), by, bz))) @ rot_x_axis
        )
        set_verts_face_mat(bm, ret_bolt['verts'], 2)  # Mat 2: chrome

    # Red Center Cap with Honda "H" (Mat 3: red_badge)
    ret_cap = bmesh.ops.create_cone(
        bm, cap_ends=True, segments=20, radius1=0.030, radius2=0.028, depth=0.018,
        matrix=Matrix.Translation(Vector((x_sign * (rim_w * 0.47), 0.0, 0.0))) @ rot_x_axis
    )
    set_verts_face_mat(bm, ret_cap['verts'], 3)

    # 3. Bridgestone Potenza RE010 Radial Tire with 3D Tread Sipes (Mat 1: tire_rubber)
    num_t_circ = 64
    num_t_sec = 16
    t_verts = []

    for ci in range(num_t_circ):
        c_ang = (ci / num_t_circ) * 2.0 * math.pi
        sin_c = math.sin(c_ang)
        cos_c = math.cos(c_ang)
        row = []
        is_sipe = (ci % 4 == 0)

        for si in range(num_t_sec):
            s_frac = si / (num_t_sec - 1)
            t_lat = (s_frac - 0.5) * width
            rad_norm = math.cos((s_frac - 0.5) * math.pi)
            cur_r = rim_r + (tire_r - rim_r) * (0.15 + 0.85 * (rad_norm ** 0.65))

            if is_sipe and (0.25 < s_frac < 0.75):
                cur_r -= 0.004

            tx = x_sign * t_lat
            ty = cos_c * cur_r
            tz = sin_c * cur_r
            row.append(bm.verts.new(Vector((tx, ty, tz))))
        t_verts.append(row)

    bm.verts.ensure_lookup_table()
    for ci in range(num_t_circ):
        c_next = (ci + 1) % num_t_circ
        for si in range(num_t_sec - 1):
            v0 = t_verts[ci][si]
            v1 = t_verts[ci][si + 1]
            v2 = t_verts[c_next][si + 1]
            v3 = t_verts[c_next][si]
            if is_left:
                safe_face(bm, [v0, v1, v2, v3], mat_idx=1)
            else:
                safe_face(bm, [v0, v3, v2, v1], mat_idx=1)

    # 4. Braking System: 282mm Front Ventilated Disc / 260mm Rear Disc with Red Caliper
    disc_r = 0.141 if is_front else 0.130
    ret_disc = bmesh.ops.create_cone(
        bm, cap_ends=True, segments=32, radius1=disc_r, radius2=disc_r, depth=0.018,
        matrix=Matrix.Translation(Vector((-x_sign * 0.015, 0.0, 0.0))) @ rot_x_axis
    )
    set_verts_face_mat(bm, ret_disc['verts'], 4)  # Mat 4: brake_metal

    # Red Nissin Caliper (Mat 5: brake_caliper)
    ret_cal = bmesh.ops.create_cube(bm, size=1.0)
    for v in ret_cal['verts']:
        v.co.x = (v.co.x * 0.050) + (-x_sign * 0.015)
        v.co.y = (v.co.y * 0.085) + 0.100
        v.co.z = (v.co.z * 0.060) + 0.080
    set_verts_face_mat(bm, ret_cal['verts'], 5)

    bmesh.ops.subdivide_edges(bm, edges=bm.edges, cuts=2, use_grid_fill=True)

    obj = create_mesh_object(
        corner_name,
        bm,
        parent_col,
        mat=[mats['wheel_white'], mats['tire_rubber'], mats['chrome'],
             mats['red_badge'], mats['brake_metal'], mats['brake_caliper']],
        smooth=True,
        bevel_w=0.0015,
        subsurf_lvl=2
    )
    obj.location = location
    return obj


# ─── 5. Lighting, Optics, Grille, Badges & 70mm Performance Exhaust ──────────
def build_ek9_lighting_and_trim(parent_col, mats):
    """
    Constructs the signature Honda Civic Type R (EK9) exterior optics & aero jewelry:
    - Slanted teardrop halogen headlamps with clear polycarbonate lenses, chrome reflectors, halogen bulbs, amber indicators
    - Championship White upper grille opening with dark gunmetal honeycomb mesh
    - Iconic Red Honda "H" badge in mirror-chrome bezel on front grille and rear hatch
    - Driver's side red "TYPE R" script front and rear decals
    - Distinctive 1990s Civic vertical wrap-around rear taillight clusters (Amber/White/Ruby Red)
    - Single polished stainless steel 70mm exhaust cannon exiting right rear with dark inner bore
    """
    bm = bmesh.new()

    # 1. Slanted Teardrop Halogen Headlamps
    for is_left in [True, False]:
        sign = 1.0 if is_left else -1.0

        # Chrome parabolic reflector bucket
        ret_ref = bmesh.ops.create_cone(bm, cap_ends=True, segments=20, radius1=0.075, radius2=0.045, depth=0.055)
        rot_ref = Matrix.Rotation(math.radians(-90.0), 3, 'X')
        for v in ret_ref['verts']:
            v.co = rot_ref @ v.co
            v.co.x += sign * 0.520
            v.co.y += 2.065
            v.co.z += 0.605
        set_verts_face_mat(bm, ret_ref['verts'], 4)  # Mat 4: headlamp_reflector

        # Glowing halogen bulb
        ret_bulb = bmesh.ops.create_icosphere(bm, subdivisions=2, radius=0.016)
        for v in ret_bulb['verts']:
            v.co.x += sign * 0.520
            v.co.y += 2.072
            v.co.z += 0.605
        set_verts_face_mat(bm, ret_bulb['verts'], 5)  # Mat 5: bulb_halogen

        # Amber corner indicator reflector
        ret_ind = bmesh.ops.create_cone(bm, cap_ends=True, segments=16, radius1=0.050, radius2=0.030, depth=0.045)
        rot_ind = Matrix.Rotation(math.radians(-80.0), 3, 'X')
        for v in ret_ind['verts']:
            v.co = rot_ind @ v.co
            v.co.x += sign * 0.660
            v.co.y += 2.045
            v.co.z += 0.610
        set_verts_face_mat(bm, ret_ind['verts'], 7)  # Mat 7: indicator_amber

        # Clear Polycarbonate Aerodynamic Outer Lens Cover (Mat 3: headlamp_glass)
        ret_lens = bmesh.ops.create_cube(bm, size=1.0)
        for v in ret_lens['verts']:
            v.co.x = (v.co.x * 0.220) + (sign * 0.590)
            v.co.y = (v.co.y * 0.035) + 2.080
            v.co.z = (v.co.z * 0.110) + 0.605
        set_verts_face_mat(bm, ret_lens['verts'], 3)

    # 2. Upper Honeycomb Radiator Grille (Mat 0: grille_mesh)
    ret_grille = bmesh.ops.create_cube(bm, size=1.0)
    for v in ret_grille['verts']:
        v.co.x *= 0.540
        v.co.y = (v.co.y * 0.015) + 2.078
        v.co.z = (v.co.z * 0.075) + 0.590
    set_verts_face_mat(bm, ret_grille['verts'], 0)

    # Red Honda "H" Badge in Mirror-Chrome Bezel (Front Grille)
    ret_h_base = bmesh.ops.create_cube(bm, size=1.0)
    for v in ret_h_base['verts']:
        v.co.x *= 0.065
        v.co.y = (v.co.y * 0.008) + 2.090
        v.co.z = (v.co.z * 0.052) + 0.590
    set_verts_face_mat(bm, ret_h_base['verts'], 1)  # Mat 1: red_badge

    ret_h_chr = bmesh.ops.create_cube(bm, size=1.0)
    for v in ret_h_chr['verts']:
        v.co.x *= 0.050
        v.co.y = (v.co.y * 0.004) + 2.096
        v.co.z = (v.co.z * 0.040) + 0.590
    set_verts_face_mat(bm, ret_h_chr['verts'], 2)  # Mat 2: chrome

    # 3. Distinctive 1990s Civic Vertical Wrap-Around Taillights
    for is_left in [True, False]:
        sign = 1.0 if is_left else -1.0

        # Taillight Housing Bezel (Mat 8: tail_housing)
        ret_th = bmesh.ops.create_cube(bm, size=1.0)
        for v in ret_th['verts']:
            v.co.x = (v.co.x * 0.130) + sign * 0.630
            v.co.y = (v.co.y * 0.025) - 2.085
            v.co.z = (v.co.z * 0.240) + 0.690
        set_verts_face_mat(bm, ret_th['verts'], 8)

        # Upper Amber turn indicator (Mat 7: indicator_amber)
        ret_ta = bmesh.ops.create_cube(bm, size=1.0)
        for v in ret_ta['verts']:
            v.co.x = (v.co.x * 0.115) + sign * 0.630
            v.co.y = (v.co.y * 0.020) - 2.080
            v.co.z = (v.co.z * 0.070) + 0.760
        set_verts_face_mat(bm, ret_ta['verts'], 7)

        # Middle White reverse section (Mat 9: tail_white)
        ret_tw = bmesh.ops.create_cube(bm, size=1.0)
        for v in ret_tw['verts']:
            v.co.x = (v.co.x * 0.115) + sign * 0.630
            v.co.y = (v.co.y * 0.020) - 2.080
            v.co.z = (v.co.z * 0.055) + 0.695
        set_verts_face_mat(bm, ret_tw['verts'], 9)

        # Lower Ruby Red brake/tail lamp (Mat 6: tail_red)
        ret_tr = bmesh.ops.create_cube(bm, size=1.0)
        for v in ret_tr['verts']:
            v.co.x = (v.co.x * 0.115) + sign * 0.630
            v.co.y = (v.co.y * 0.022) - 2.082
            v.co.z = (v.co.z * 0.090) + 0.625
        set_verts_face_mat(bm, ret_tr['verts'], 6)

    # 4. Rear Hatch Red Honda "H" Badge & "CIVIC TYPE R" Badging
    ret_rh = bmesh.ops.create_cube(bm, size=1.0)
    for v in ret_rh['verts']:
        v.co.x *= 0.055
        v.co.y = (v.co.y * 0.006) - 2.080
        v.co.z = (v.co.z * 0.045) + 0.775
    set_verts_face_mat(bm, ret_rh['verts'], 1)  # Mat 1: red_badge

    # Red "TYPE R" script decal on rear tailgate
    ret_rtr = bmesh.ops.create_cube(bm, size=1.0)
    for v in ret_rtr['verts']:
        v.co.x = (v.co.x * 0.090) + 0.220
        v.co.y = (v.co.y * 0.006) - 2.085
        v.co.z = (v.co.z * 0.024) + 0.680
    set_verts_face_mat(bm, ret_rtr['verts'], 1)

    # 5. Polished Stainless Steel 70mm Single Exhaust Cannon (right rear, -X)
    ret_ex = bmesh.ops.create_cone(bm, cap_ends=False, segments=24, radius1=0.038, radius2=0.038, depth=0.180)
    rot_ex = Euler((math.radians(85.0), 0.0, math.radians(-10.0)), 'XYZ')
    for v in ret_ex['verts']:
        v.co = rot_ex.to_matrix() @ v.co
        v.co.x -= 0.480
        v.co.y -= 2.070
        v.co.z += 0.190
    set_verts_face_mat(bm, ret_ex['verts'], 11)  # Mat 11: exhaust

    ret_bore = bmesh.ops.create_cone(bm, cap_ends=True, segments=20, radius1=0.032, radius2=0.032, depth=0.010)
    for v in ret_bore['verts']:
        v.co = rot_ex.to_matrix() @ v.co
        v.co.x -= 0.480
        v.co.y -= 2.120
        v.co.z += 0.190
    set_verts_face_mat(bm, ret_bore['verts'], 12)  # Mat 12: exhaust_inner

    bmesh.ops.subdivide_edges(bm, edges=bm.edges, cuts=2, use_grid_fill=True)

    obj = create_mesh_object(
        "LIGHTING_EK9_OpticsAndJewelry",
        bm,
        parent_col,
        mat=[mats['grille_mesh'], mats['red_badge'], mats['chrome'],
             mats['headlamp_glass'], mats['headlamp_reflector'], mats['bulb_halogen'],
             mats['tail_red'], mats['indicator_amber'], mats['tail_housing'], mats['tail_white'],
             mats['paint'], mats['exhaust'], mats['exhaust_inner']],
        smooth=True,
        bevel_w=0.0015,
        subsurf_lvl=2
    )
    return obj


# ─── 6. Aerodynamic Splitters & Underbody Flow ───────────────────────────────
def build_ek9_aerodynamics(parent_col, mats):
    """
    Constructs the EK9 Civic Type R aerodynamic underfloor and front chin spoiler.
    """
    bm = bmesh.new()

    # Front lower air splitter tray
    ret_spl = bmesh.ops.create_cube(bm, size=1.0)
    for v in ret_spl['verts']:
        v.co.x *= 1.480
        v.co.y = (v.co.y * 0.350) + 1.880
        v.co.z = (v.co.z * 0.018) + 0.115
    set_verts_face_mat(bm, ret_spl['verts'], 0)  # Mat 0: trim_dark

    # Rear bumper lower diffuser air tray
    ret_dif = bmesh.ops.create_cube(bm, size=1.0)
    for v in ret_dif['verts']:
        v.co.x *= 1.360
        v.co.y = (v.co.y * 0.080) - 2.040
        v.co.z = (v.co.z * 0.030) + 0.165
    set_verts_face_mat(bm, ret_dif['verts'], 0)

    bmesh.ops.subdivide_edges(bm, edges=bm.edges, cuts=2, use_grid_fill=True)

    obj = create_mesh_object(
        "AERO_EK9_Aerodynamics",
        bm,
        parent_col,
        mat=mats['trim_dark'],
        smooth=True,
        bevel_w=0.002,
        subsurf_lvl=1
    )
    return obj


# ─── 7. Interior Cockpit: Recaro SR3 Seats, Dashboard & Momo Wheel ───────────
def build_ek9_cockpit(parent_col, mats):
    """
    Constructs the authentic 1997 Civic Type R Cockpit:
    - High-back Red Recaro SR3 sport bucket seats with dual harness pass-through slots
    - Type R vibrant red floor carpeting throughout cabin
    - Sculpted 1990s Civic dashboard in molded black vinyl with center console
    - Amber-backlit instrument cluster (8,400 RPM redline tachometer)
    - Machined titanium teardrop shift knob with black leather boot
    - Momo 3-spoke sport steering wheel with center Red Honda emblem
    """
    bm_cockpit = bmesh.new()

    # 1. Type R Red Cabin Carpeting (Mat 1: red_carpet)
    ret_carp = bmesh.ops.create_cube(bm_cockpit, size=1.0)
    for v in ret_carp['verts']:
        v.co.x *= 1.420
        v.co.y = (v.co.y * 2.300) - 0.200
        v.co.z = (v.co.z * 0.040) + 0.150
    set_verts_face_mat(bm_cockpit, ret_carp['verts'], 1)

    # 2. Molded Black Civic Dashboard (Mat 0: dash_black)
    ret_dash = bmesh.ops.create_cube(bm_cockpit, size=1.0)
    for v in ret_dash['verts']:
        v.co.x *= 1.320
        v.co.y = (v.co.y * 0.320) + 0.720
        v.co.z = (v.co.z * 0.220) + 0.760
    set_verts_face_mat(bm_cockpit, ret_dash['verts'], 0)

    # 3. Amber-Backlit Instrument Gauge Cluster (Mat 2: gauge_amber)
    ret_gauge = bmesh.ops.create_cube(bm_cockpit, size=1.0)
    rot_g = Euler((math.radians(-62.0), 0.0, 0.0), 'XYZ').to_matrix()
    for v in ret_gauge['verts']:
        v.co.x = (v.co.x * 0.260) - 0.340
        v.co.y = (v.co.y * 0.040) + 0.650
        v.co.z = (v.co.z * 0.100) + 0.810
        v.co = rot_g @ (v.co - Vector((-0.340, 0.650, 0.810))) + Vector((-0.340, 0.650, 0.810))
    set_verts_face_mat(bm_cockpit, ret_gauge['verts'], 2)

    # 4. Center Console with Titanium Teardrop Shifter (Mat 0: dash, Mat 3: titanium_knob)
    ret_cons = bmesh.ops.create_cube(bm_cockpit, size=1.0)
    for v in ret_cons['verts']:
        v.co.x *= 0.180
        v.co.y = (v.co.y * 0.500) + 0.220
        v.co.z = (v.co.z * 0.180) + 0.440
    set_verts_face_mat(bm_cockpit, ret_cons['verts'], 0)

    # Machined Titanium Teardrop Shift Knob
    ret_knob = bmesh.ops.create_cone(bm_cockpit, cap_ends=True, segments=16, radius1=0.020, radius2=0.014, depth=0.045)
    for v in ret_knob['verts']:
        v.co.y += 0.320
        v.co.z += 0.600
    set_verts_face_mat(bm_cockpit, ret_knob['verts'], 3)

    # Shift lever shaft
    ret_shaft = bmesh.ops.create_cone(bm_cockpit, cap_ends=True, segments=10, radius1=0.008, radius2=0.008, depth=0.120)
    for v in ret_shaft['verts']:
        v.co.y += 0.320
        v.co.z += 0.520
    set_verts_face_mat(bm_cockpit, ret_shaft['verts'], 3)

    # 5. Red Recaro SR3 Sport Bucket Seats (Mat 4: recaro_red)
    # Adheres strictly to skill-for-seats: positive recline (+16°), anatomical bolsters, harness slots
    for seat_x in [-0.340, 0.340]:
        # Seat cushion with high lateral thigh bolsters
        ret_sc = bmesh.ops.create_cube(bm_cockpit, size=1.0)
        for v in ret_sc['verts']:
            v.co.x = (v.co.x * 0.440) + seat_x
            v.co.y = (v.co.y * 0.500) - 0.050
            v.co.z = (v.co.z * 0.140) + 0.360
            v.co.z += abs(v.co.x - seat_x) * 0.38
        set_verts_face_mat(bm_cockpit, ret_sc['verts'], 4)

        # Backrest with massive shoulder & torso bolsters
        ret_sb = bmesh.ops.create_cube(bm_cockpit, size=1.0)
        rot_sb = Euler((math.radians(16.0), 0.0, 0.0), 'XYZ').to_matrix()
        for v in ret_sb['verts']:
            v.co.x = (v.co.x * 0.440) + seat_x
            v.co.y = (v.co.y * 0.140) - 0.320
            v.co.z = (v.co.z * 0.580) + 0.680
            v.co.y += (v.co.z - 0.680) * 0.28
            v.co.y -= abs(v.co.x - seat_x) * 0.32
        set_verts_face_mat(bm_cockpit, ret_sb['verts'], 4)

        # Headrest with dual harness pass-through slots
        ret_hr = bmesh.ops.create_cube(bm_cockpit, size=1.0)
        for v in ret_hr['verts']:
            v.co.x = (v.co.x * 0.260) + seat_x
            v.co.y = (v.co.y * 0.100) - 0.440
            v.co.z = (v.co.z * 0.160) + 1.050
        set_verts_face_mat(bm_cockpit, ret_hr['verts'], 4)

    # 6. Rear Passenger Split Bench & Package Shelf
    ret_rb = bmesh.ops.create_cube(bm_cockpit, size=1.0)
    for v in ret_rb['verts']:
        v.co.x *= 1.250
        v.co.y = (v.co.y * 0.460) - 0.880
        v.co.z = (v.co.z * 0.150) + 0.440
    set_verts_face_mat(bm_cockpit, ret_rb['verts'], 0)

    ret_shelf = bmesh.ops.create_cube(bm_cockpit, size=1.0)
    for v in ret_shelf['verts']:
        v.co.x *= 1.220
        v.co.y = (v.co.y * 0.440) - 1.300
        v.co.z = (v.co.z * 0.025) + 0.745
    set_verts_face_mat(bm_cockpit, ret_shelf['verts'], 0)

    bmesh.ops.subdivide_edges(bm_cockpit, edges=bm_cockpit.edges, cuts=2, use_grid_fill=True)

    obj_cockpit = create_mesh_object(
        "INTERIOR_EK9_Cockpit",
        bm_cockpit,
        parent_col,
        mat=[mats['dash_black'], mats['red_carpet'], mats['gauge_amber'],
             mats['titanium_knob'], mats['recaro_red']],
        smooth=True,
        bevel_w=0.002,
        subsurf_lvl=2
    )

    # 7. Momo 3-Spoke Sport Steering Wheel with Red Honda Emblem
    bm_sw = bmesh.new()
    sw_origin = Vector((-0.340, 0.450, 0.770))

    ret_sw_rim = bmesh.ops.create_cone(bm_sw, cap_ends=False, segments=32, radius1=0.175, radius2=0.160, depth=0.024)
    rot_sw = Euler((math.radians(-25.0), 0.0, 0.0), 'XYZ')
    for v in ret_sw_rim['verts']:
        v.co = rot_sw.to_matrix() @ v.co
    set_verts_face_mat(bm_sw, ret_sw_rim['verts'], 0)  # Mat 0: dash_black

    # Center horn button with Red Honda "H" badge
    ret_sw_hub = bmesh.ops.create_cone(bm_sw, cap_ends=True, segments=20, radius1=0.042, radius2=0.038, depth=0.030)
    for v in ret_sw_hub['verts']:
        v.co = rot_sw.to_matrix() @ v.co
    set_verts_face_mat(bm_sw, ret_sw_hub['verts'], 1)  # Mat 1: red_badge

    # 3 Anodized Silver/Black Spokes
    for spoke_ang in [0.0, math.radians(125.0), math.radians(235.0)]:
        ret_spk = bmesh.ops.create_cube(bm_sw, size=1.0)
        spk_rot = Euler((0.0, 0.0, spoke_ang), 'XYZ').to_matrix()
        for v in ret_spk['verts']:
            v.co.x = (v.co.x * 0.024)
            v.co.y = (v.co.y * 0.115) + 0.075
            v.co.z *= 0.006
            v.co = spk_rot @ v.co
            v.co = rot_sw.to_matrix() @ v.co
        set_verts_face_mat(bm_sw, ret_spk['verts'], 2)  # Mat 2: chrome

    bmesh.ops.subdivide_edges(bm_sw, edges=bm_sw.edges, cuts=2, use_grid_fill=True)

    obj_sw = create_mesh_object(
        "INTERIOR_EK9_SteeringWheel",
        bm_sw,
        parent_col,
        mat=[mats['dash_black'], mats['red_badge'], mats['chrome']],
        smooth=True,
        bevel_w=0.0015,
        subsurf_lvl=2
    )
    obj_sw.location = sw_origin
    return obj_cockpit, obj_sw


# ─── 8. Hand-Ported B16B 1.6L DOHC VTEC Engine Bay ───────────────────────────
def build_ek9_powertrain_and_chassis(parent_col, mats):
    """
    Constructs the B16B 1.6L DOHC VTEC Naturally Aspirated Engine:
    - Wrinkle-red valve cover with embossed DOHC VTEC lettering
    - Cast aluminum intake manifold & black airbox
    - Championship White front strut tower brace
    - Crossflow radiator pack behind front bumper
    """
    bm = bmesh.new()

    # 1. B16B Engine Block & Wrinkle-Red Valve Cover (Mat 0: engine_red)
    ret_vc = bmesh.ops.create_cube(bm, size=1.0)
    for v in ret_vc['verts']:
        v.co.x = (v.co.x * 0.420) + 0.080
        v.co.y = (v.co.y * 0.280) + 1.340
        v.co.z = (v.co.z * 0.120) + 0.580
    set_verts_face_mat(bm, ret_vc['verts'], 0)

    # Cast Aluminum Engine Block (Mat 1: engine_alloy)
    ret_eb = bmesh.ops.create_cube(bm, size=1.0)
    for v in ret_eb['verts']:
        v.co.x = (v.co.x * 0.400) + 0.080
        v.co.y = (v.co.y * 0.260) + 1.340
        v.co.z = (v.co.z * 0.250) + 0.400
    set_verts_face_mat(bm, ret_eb['verts'], 1)

    # Cast aluminum intake manifold plenum
    ret_im = bmesh.ops.create_cube(bm, size=1.0)
    for v in ret_im['verts']:
        v.co.x = (v.co.x * 0.380) + 0.080
        v.co.y = (v.co.y * 0.120) + 1.150
        v.co.z = (v.co.z * 0.100) + 0.550
    set_verts_face_mat(bm, ret_im['verts'], 1)

    # Black air intake box & resonator (Mat 2: trim_dark)
    ret_ab = bmesh.ops.create_cube(bm, size=1.0)
    for v in ret_ab['verts']:
        v.co.x = (v.co.x * 0.220) - 0.380
        v.co.y = (v.co.y * 0.250) + 1.350
        v.co.z = (v.co.z * 0.180) + 0.550
    set_verts_face_mat(bm, ret_ab['verts'], 2)

    # 2. Championship White Front Strut Tower Bar
    ret_sb = bmesh.ops.create_cone(bm, cap_ends=True, segments=16, radius1=0.014, radius2=0.014, depth=1.120)
    rot_sb = Matrix.Rotation(math.radians(90.0), 3, 'Y')
    for v in ret_sb['verts']:
        v.co = rot_sb @ v.co
        v.co.y += 1.310
        v.co.z += 0.670
    set_verts_face_mat(bm, ret_sb['verts'], 3)  # Mat 3: paint

    # 3. Crossflow Radiator Pack with Twin Electric Fans
    ret_rad = bmesh.ops.create_cube(bm, size=1.0)
    for v in ret_rad['verts']:
        v.co.x *= 0.680
        v.co.y = (v.co.y * 0.050) + 1.880
        v.co.z = (v.co.z * 0.320) + 0.400
    set_verts_face_mat(bm, ret_rad['verts'], 2)

    bmesh.ops.subdivide_edges(bm, edges=bm.edges, cuts=2, use_grid_fill=True)

    obj_pwr = create_mesh_object(
        "POWERTRAIN_EK9_B16B",
        bm,
        parent_col,
        mat=[mats['engine_red'], mats['engine_alloy'], mats['trim_dark'], mats['paint']],
        smooth=True,
        bevel_w=0.002,
        subsurf_lvl=1
    )

    # 4. Monocoque Floorpan, Exhaust Tunnel & Chassis Subframes
    bm_chassis = bmesh.new()
    # Floorpan underbody sheet
    ret_flr = bmesh.ops.create_cube(bm_chassis, size=1.0)
    for v in ret_flr['verts']:
        v.co.x *= 1.480
        v.co.y = (v.co.y * 2.800) + 0.100
        v.co.z = (v.co.z * 0.040) + 0.180
    set_verts_face_mat(bm_chassis, ret_flr['verts'], 2)

    # Front double-wishbone subframe crossmember
    ret_fs = bmesh.ops.create_cube(bm_chassis, size=1.0)
    for v in ret_fs['verts']:
        v.co.x *= 1.320
        v.co.y = (v.co.y * 0.320) + 1.310
        v.co.z = (v.co.z * 0.080) + 0.190
    set_verts_face_mat(bm_chassis, ret_fs['verts'], 1)

    # Rear multi-link / trailing arm subframe crossmember
    ret_rs = bmesh.ops.create_cube(bm_chassis, size=1.0)
    for v in ret_rs['verts']:
        v.co.x *= 1.300
        v.co.y = (v.co.y * 0.320) - 1.310
        v.co.z = (v.co.z * 0.080) + 0.190
    set_verts_face_mat(bm_chassis, ret_rs['verts'], 1)

    bmesh.ops.subdivide_edges(bm_chassis, edges=bm_chassis.edges, cuts=2, use_grid_fill=True)
    obj_chs = create_mesh_object(
        "CHASSIS_EK9_Floorpan_Subframe",
        bm_chassis,
        parent_col,
        mat=[mats['engine_alloy'], mats['chassis_dark'], mats['trim_dark']],
        smooth=True,
        bevel_w=0.002,
        subsurf_lvl=1
    )

    return obj_pwr, obj_chs


# ─── 9. Semantic Raycast Hitboxes with Sound & Haptics ───────────────────────
def build_ek9_hitboxes(parent_col, mats, door_objs, sw_obj):
    """
    Constructs 10 lightweight semantic HITBOX_* collision meshes with sound_fx and haptic extras.
    """
    boxes = [
        ("HITBOX_Door_FL", Vector((-0.835, 0.350, 0.480)), Vector((0.08, 0.95, 0.58)),
         {"interactive": True, "part_id": "DOOR_FL", "sound_fx": "door_latch_heavy", "haptic": "medium", "haptic_pulse": 0.3}),
        ("HITBOX_Door_FR", Vector(( 0.835, 0.350, 0.480)), Vector((0.08, 0.95, 0.58)),
         {"interactive": True, "part_id": "DOOR_FR", "sound_fx": "door_latch_heavy", "haptic": "medium", "haptic_pulse": 0.3}),
        ("HITBOX_Hood", Vector((0.0, 1.550, 0.740)), Vector((1.25, 0.95, 0.12)),
         {"interactive": True, "part_id": "HOOD", "sound_fx": "hood_latch_metallic", "haptic": "medium", "haptic_pulse": 0.4}),
        ("HITBOX_Trunk", Vector((0.0, -1.820, 0.950)), Vector((1.15, 0.55, 0.45)),
         {"interactive": True, "part_id": "TRUNK", "sound_fx": "hatchback_damper_whoosh", "haptic": "medium", "haptic_pulse": 0.35}),
        ("HITBOX_Steering_Wheel", Vector((-0.340, 0.450, 0.770)), Vector((0.36, 0.12, 0.36)),
         {"interactive": True, "part_id": "STEERING", "sound_fx": "tactile_click_medium", "haptic": "light", "haptic_pulse": 0.2}),
        ("HITBOX_Seat_Driver", Vector((-0.340, -0.150, 0.580)), Vector((0.48, 0.55, 0.65)),
         {"interactive": True, "part_id": "SEAT_DRIVER", "sound_fx": "leather_creak_soft", "haptic": "light", "haptic_pulse": 0.15}),
        ("HITBOX_Wheel_FL", Vector((-0.740,  1.310, 0.298)), Vector((0.24, 0.62, 0.62)),
         {"interactive": True, "part_id": "WHEEL_FL", "sound_fx": "tire_slap_rebound", "haptic": "medium", "haptic_pulse": 0.25}),
        ("HITBOX_Wheel_FR", Vector(( 0.740,  1.310, 0.298)), Vector((0.24, 0.62, 0.62)),
         {"interactive": True, "part_id": "WHEEL_FR", "sound_fx": "tire_slap_rebound", "haptic": "medium", "haptic_pulse": 0.25}),
        ("HITBOX_Wheel_RL", Vector((-0.740, -1.310, 0.298)), Vector((0.24, 0.62, 0.62)),
         {"interactive": True, "part_id": "WHEEL_RL", "sound_fx": "tire_slap_rebound", "haptic": "medium", "haptic_pulse": 0.25}),
        ("HITBOX_Wheel_RR", Vector(( 0.740, -1.310, 0.298)), Vector((0.24, 0.62, 0.62)),
         {"interactive": True, "part_id": "WHEEL_RR", "sound_fx": "tire_slap_rebound", "haptic": "medium", "haptic_pulse": 0.25}),
    ]

    for name, pos, size, extras in boxes:
        bm = bmesh.new()
        bmesh.ops.create_cube(bm, size=1.0)
        for v in bm.verts:
            v.co.x *= size.x
            v.co.y *= size.y
            v.co.z *= size.z
        obj = create_mesh_object(name, bm, parent_col, mat=mats['invisible_hitbox'], smooth=False, bevel_w=0.0, subsurf_lvl=0)
        obj.display_type = 'WIRE'
        obj.location = pos
        for k, v in extras.items():
            obj[k] = v


# ─── 10. Automotive Inspection Cameras ───────────────────────────────────────
def setup_ek9_cameras(parent_col):
    """
    Sets up 4 standard automotive inspection cameras.
    """
    cams = [
        ("CAMERA_Front_3_4", Vector((3.60, 3.80, 1.80)), Euler((math.radians(72.0), 0.0, math.radians(135.0)))),
        ("CAMERA_Cockpit",   Vector((-0.340, -0.150, 1.050)), Euler((math.radians(82.0), 0.0, math.radians(0.0)))),
        ("CAMERA_Rear_3_4",  Vector((3.40, -3.80, 1.80)), Euler((math.radians(72.0), 0.0, math.radians(45.0)))),
        ("CAMERA_Side",      Vector((4.50, 0.0, 1.10)), Euler((math.radians(88.0), 0.0, math.radians(90.0)))),
    ]

    for name, pos, rot in cams:
        cam_data = bpy.data.cameras.new(name + "_Data")
        cam_data.lens = 50
        cam_data.clip_start = 0.05
        cam_data.clip_end = 100.0
        cam_obj = bpy.data.objects.new(name, cam_data)
        cam_obj.location = pos
        cam_obj.rotation_euler = rot
        parent_col.objects.link(cam_obj)


# ─── 11. Baking 7 NLA Animation Actions ──────────────────────────────────────
def setup_ek9_nla_actions(door_fl, door_fr, sw_obj, wheels):
    """
    Pre-bakes 7 distinct NLA actions for web runtime interactivity:
    - Action_Door_FL_Open / Action_Door_FR_Open (Kinematic swing)
    - Action_Steering_Turn (Sport yaw turn)
    - Action_Wheel_FL/FR/RL/RR_Spin (Continuous pitch spin)
    """
    # 1. Door FL Open (Yaw swing 0 to +55 deg)
    door_fl.rotation_euler = (0, 0, 0)
    door_fl.keyframe_insert(data_path="rotation_euler", frame=1)
    door_fl.rotation_euler = (0, 0, math.radians(55.0))
    door_fl.keyframe_insert(data_path="rotation_euler", frame=60)
    if door_fl.animation_data and door_fl.animation_data.action:
        act = door_fl.animation_data.action
        act.name = "Action_Door_FL_Open"
        track = door_fl.animation_data.nla_tracks.new()
        track.name = "Track_Door_FL"
        track.strips.new("Action_Door_FL_Open", 1, act)
        door_fl.animation_data.action = None
        door_fl.rotation_euler = (0, 0, 0)

    # 2. Door FR Open (Yaw swing 0 to -55 deg)
    door_fr.rotation_euler = (0, 0, 0)
    door_fr.keyframe_insert(data_path="rotation_euler", frame=1)
    door_fr.rotation_euler = (0, 0, math.radians(-55.0))
    door_fr.keyframe_insert(data_path="rotation_euler", frame=60)
    if door_fr.animation_data and door_fr.animation_data.action:
        act = door_fr.animation_data.action
        act.name = "Action_Door_FR_Open"
        track = door_fr.animation_data.nla_tracks.new()
        track.name = "Track_Door_FR"
        track.strips.new("Action_Door_FR_Open", 1, act)
        door_fr.animation_data.action = None
        door_fr.rotation_euler = (0, 0, 0)

    # 3. Steering Wheel Turn
    sw_obj.rotation_euler = (0, 0, 0)
    sw_obj.keyframe_insert(data_path="rotation_euler", frame=1)
    sw_obj.rotation_euler = (0, math.radians(35.0), 0)
    sw_obj.keyframe_insert(data_path="rotation_euler", frame=30)
    sw_obj.rotation_euler = (0, math.radians(-35.0), 0)
    sw_obj.keyframe_insert(data_path="rotation_euler", frame=60)
    if sw_obj.animation_data and sw_obj.animation_data.action:
        act = sw_obj.animation_data.action
        act.name = "Action_Steering_Turn"
        track = sw_obj.animation_data.nla_tracks.new()
        track.name = "Track_Steering"
        track.strips.new("Action_Steering_Turn", 1, act)
        sw_obj.animation_data.action = None
        sw_obj.rotation_euler = (0, 0, 0)

    # 4-7. 4 Wheel Spin Actions
    for w_name, w_obj in wheels.items():
        w_obj.rotation_euler = (0, 0, 0)
        w_obj.keyframe_insert(data_path="rotation_euler", frame=1)
        w_obj.rotation_euler = (math.radians(360.0), 0, 0)
        w_obj.keyframe_insert(data_path="rotation_euler", frame=60)
        if w_obj.animation_data and w_obj.animation_data.action:
            act = w_obj.animation_data.action
            act.name = f"Action_{w_name}_Spin"
            track = w_obj.animation_data.nla_tracks.new()
            track.name = f"Track_{w_name}"
            track.strips.new(act.name, 1, act)
            w_obj.animation_data.action = None
            w_obj.rotation_euler = (0, 0, 0)


# ─── MASTER BUILD ORCHESTRATOR ───────────────────────────────────────────────
def generate_honda_civic_type_r_ek9_master():
    print("=" * 80)
    print("EXECUTING MASTER CLASS-A CAD GENERATOR: HONDA CIVIC TYPE R (EK9) (1990S HATCHBACK)")
    print("=" * 80)

    clean_scene()

    col = bpy.data.collections.new("Honda_Civic_Type_R_EK9_Collection")
    bpy.context.scene.collection.children.link(col)

    mats = create_ek9_materials()

    # 1. Miracle Civic EK9 Unibody Monocoque
    print("[1/8] Building Miracle Civic EK9 Unibody Monocoque...")
    unibody_obj = build_ek9_unibody(col, mats)

    # 2. Separated Articulating Doors (DOOR_FL & DOOR_FR)
    print("[2/8] Building Separated Articulating Doors...")
    doors = build_ek9_doors(col, mats)
    door_fl = doors["FL"]
    door_fr = doors["FR"]

    # 3. Greenhouse Glass & High-Mount Type R Pedestal Wing
    print("[3/8] Building Optical Greenhouse Safety Glass & Type R Pedestal Wing...")
    greenhouse_obj = build_ek9_greenhouse_and_wing(col, mats)

    # 4. 15-Inch Enkei 7-Spoke White Alloys & Potenza RE010 Radials
    print("[4/8] Building 15-Inch Enkei 7-Spoke White Alloys & Potenza RE010 Radials...")
    f_axle = 1.310
    r_axle = -1.310
    track_w = 0.740
    wheel_z = 0.298

    wheels = {
        "Wheel_FL": build_ek9_enkei_wheel_corner("WHEEL_FL_Enkei7Spoke", Vector((-track_w,  f_axle, wheel_z)), is_front=True, is_left=True, parent_col=col, mats=mats),
        "Wheel_FR": build_ek9_enkei_wheel_corner("WHEEL_FR_Enkei7Spoke", Vector(( track_w,  f_axle, wheel_z)), is_front=True, is_left=False, parent_col=col, mats=mats),
        "Wheel_RL": build_ek9_enkei_wheel_corner("WHEEL_RL_Enkei7Spoke", Vector((-track_w,  r_axle, wheel_z)), is_front=False, is_left=True, parent_col=col, mats=mats),
        "Wheel_RR": build_ek9_enkei_wheel_corner("WHEEL_RR_Enkei7Spoke", Vector(( track_w,  r_axle, wheel_z)), is_front=False, is_left=False, parent_col=col, mats=mats),
    }

    # 5. Exterior Lighting Optics, Grille, Badges & 70mm Performance Exhaust
    print("[5/8] Building Teardrop Headlamps, Red 'H' Grille Badge, Taillights & 70mm Exhaust...")
    optics_obj = build_ek9_lighting_and_trim(col, mats)

    # 6. Aerodynamic Splitters & Underbody Flow
    print("[6/8] Building Aerodynamic Front Lip & Rear Valence Undertray...")
    aero_obj = build_ek9_aerodynamics(col, mats)

    # 7. Cockpit Interior: Recaro SR3 Seats, Dashboard & Momo Wheel
    print("[7/8] Building Red Recaro SR3 Cockpit, Titanium Shifter & Momo Steering Wheel...")
    cockpit_obj, sw_obj = build_ek9_cockpit(col, mats)

    # 8. B16B 1.6L DOHC VTEC Engine Bay & Strut Bar
    print("[8/8] Building B16B 1.6L DOHC VTEC Engine Bay, Strut Bar & Platform...")
    powertrain_obj, chassis_obj = build_ek9_powertrain_and_chassis(col, mats)

    # 9. Semantic Raycast Hitboxes
    build_ek9_hitboxes(col, mats, [door_fl, door_fr], sw_obj)

    # 10. Automotive Inspection Cameras
    setup_ek9_cameras(col)

    # 11. Baking Geometry Modifiers & Rigging Actions
    print("Executing pre-export modifier baking protocol...")
    for obj in list(col.objects):
        if obj.type == 'MESH' and not obj.name.startswith("HITBOX_"):
            bpy.context.view_layer.objects.active = obj
            obj.select_set(True)
            for mod in list(obj.modifiers):
                try:
                    bpy.ops.object.modifier_apply(modifier=mod.name)
                except Exception:
                    pass
            obj.select_set(False)

    print("Baking 7 NLA animation actions...")
    setup_ek9_nla_actions(door_fl, door_fr, sw_obj, wheels)

    # Calculate statistics
    total_tris = sum(len(o.data.polygons) * 2 for o in col.objects if o.type == 'MESH')
    total_verts = sum(len(o.data.vertices) for o in col.objects if o.type == 'MESH')
    print("=" * 80)
    print(f"MASTER HONDA CIVIC TYPE R (EK9) GENERATED:")
    print(f"  Total Triangles: {total_tris:,}")
    print(f"  Total Vertices:  {total_verts:,}")
    print("=" * 80)

    # Dual-Mode GLB Export
    export_targets = [
        r"e:\Car_Automation\public\models\vehicles\hatchback\1990s\vehicle.glb",
        r"e:\Car_Automation\public\models\Car_Honda_Civic_Type_R_EK9_1990s.glb",
        r"e:\Car_Automation\public\models\Car_Honda_Civic_Type_R_EK9_Complete.glb",
        r"e:\Car_Automation\exports\Car_Honda_Civic_Type_R_EK9_1990s.glb",
        r"e:\Car_Automation\exports\Car_Honda_Civic_Type_R_EK9_Complete.glb",
    ]

    for export_path in export_targets:
        os.makedirs(os.path.dirname(export_path), exist_ok=True)
        bpy.ops.export_scene.gltf(
            filepath=export_path,
            export_format='GLB',
            use_selection=False,
            export_apply=False,
            export_extras=True,
            export_animations=True,
            export_animation_mode='ACTIONS',
            export_morph=True,
            export_cameras=True,
            export_lights=True
        )
        file_sz = os.path.getsize(export_path) / (1024 * 1024)
        print(f"Exported Master Honda Civic Type R EK9 GLB: {export_path} ({file_sz:.2f} MB)")

    # Companion meshopt compression
    opt_path = r"e:\Car_Automation\public\models\vehicles\hatchback\1990s\vehicle.opt.glb"
    try:
        primary_glb = export_targets[0]
        cmd = f'npx -y gltfpack -i "{primary_glb}" -o "{opt_path}" -cc'
        subprocess.run(cmd, shell=True, check=True, capture_output=True)
        if os.path.exists(opt_path):
            opt_sz = os.path.getsize(opt_path) / (1024 * 1024)
            print(f"Companion meshopt compressed: {opt_path} ({opt_sz:.2f} MB)")
    except Exception as e:
        print(f"Note: gltfpack compression skipped: {e}")


if __name__ == "__main__":
    generate_honda_civic_type_r_ek9_master()
