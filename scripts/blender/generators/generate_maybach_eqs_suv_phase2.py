"""
=============================================================================
Procedural Class-A CAD Generator: Mercedes-Maybach EQS 680 SUV (Future Era)
PHASE 52: Two-Tone Bodywork, Black Panel Grille, Digital Light Headlamps,
3D Helix Spiral Taillamp Strip, Flush Greenhouse, Chrome Jewelry & GLB Exports
=============================================================================
Luxury Car Architecture · Future Era Ultra-Luxury Electric SUV (Sindelfingen / Tuscaloosa)
Vehicle Dimensions:
  Wheelbase: 3,210 mm
  Overall Length: 5,125 mm
  Overall Width: 2,034 mm
  Overall Height: 1,721 mm
  Front Track: 1,667 mm
  Rear Track: 1,678 mm

This Phase B script generates the complete exterior body shell:
1. Two-Tone Paint Finish: Obsidian Black Upper / High-Tech Silver Lower with Pinstripe
2. Iconic Black Panel Radiator Grille with 3D Vertical Chrome Pinstripes & Chrome Surround
3. Digital Light Headlamp Units (1.3M micromirrors) with Continuous Front LED Band
4. 3D Helix Spiral Curved Continuous Rear LED Taillamp Strip & Roof Spoiler
5. Aerodynamic Flush-Glazed Greenhouse with Exterior A/D Pillars, Panoramic Sunroof & D-Pillar Maybach Crests
6. Flush-Fitting Motorized Door Handles & Mirror-Chrome B-Pillar Trims
7. Multi-Target GLB Export
"""

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector, Matrix, Euler

# Import Phase 51 rolling skateboard generator
gen_dir = os.path.dirname(os.path.abspath(__file__))
if gen_dir not in sys.path:
    sys.path.append(gen_dir)

import generate_maybach_eqs_suv_phase1 as phase1_mod


# ============================================================================
# 1. HELPER UTILITIES & CAD MODIFIERS
# ============================================================================

def create_mesh_object(name, collection):
    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    obj = bpy.data.objects.new(name, mesh)
    collection.objects.link(obj)
    return obj, mesh

def finalize_cad_object(obj, material=None, thickness=0.002, bevel_width=0.002):
    if material:
        if len(obj.data.materials) == 0:
            obj.data.materials.append(material)
        else:
            obj.data.materials[0] = material

    if thickness > 0:
        sol = obj.modifiers.new(name="Solidify", type='SOLIDIFY')
        sol.thickness = thickness
        sol.offset = 0.0

    if bevel_width > 0:
        bev = obj.modifiers.new(name="Bevel", type='BEVEL')
        bev.width = bevel_width
        bev.segments = 2
        bev.limit_method = 'ANGLE'
        bev.angle_limit = math.radians(35)

    wn = obj.modifiers.new(name="WeightedNormal", type='WEIGHTED_NORMAL')
    wn.keep_sharp = True

    for poly in obj.data.polygons:
        poly.use_smooth = True

def _compat_create_cylinder(bm, radius=1.0, depth=2.0, segments=16, cap_ends=True, cap_tris=False, matrix=None, **kwargs):
    r1 = kwargs.pop('radius1', radius)
    r2 = kwargs.pop('radius2', radius)
    kwargs.pop('round_cap', None)
    if matrix is None:
        matrix = Matrix()
    return bmesh.ops.create_cone(
        bm, cap_ends=cap_ends, cap_tris=cap_tris, segments=segments,
        radius1=r1, radius2=r2, depth=depth, matrix=matrix, **kwargs
    )
bmesh.ops.create_cylinder = _compat_create_cylinder

def make_pbr_material(name, base_color, metallic=0.0, roughness=0.5, clearcoat=0.0,
                      emission=None, emission_strength=1.0, transmission=0.0,
                      ior=1.45, alpha=1.0):
    mat = bpy.data.materials.get(name)
    if mat is None:
        mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()

    output = nodes.new(type='ShaderNodeOutputMaterial')
    bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')

    bsdf.inputs['Base Color'].default_value = base_color
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness
    if 'IOR' in bsdf.inputs:
        bsdf.inputs['IOR'].default_value = ior

    if 'Transmission Weight' in bsdf.inputs:
        bsdf.inputs['Transmission Weight'].default_value = transmission
    elif 'Transmission' in bsdf.inputs:
        bsdf.inputs['Transmission'].default_value = transmission

    if 'Coat Weight' in bsdf.inputs:
        bsdf.inputs['Coat Weight'].default_value = clearcoat
    elif 'Clearcoat' in bsdf.inputs:
        bsdf.inputs['Clearcoat'].default_value = clearcoat

    if emission is not None:
        if 'Emission Color' in bsdf.inputs:
            bsdf.inputs['Emission Color'].default_value = emission
            bsdf.inputs['Emission Strength'].default_value = emission_strength
        elif 'Emission' in bsdf.inputs:
            bsdf.inputs['Emission'].default_value = emission
            if 'Emission Strength' in bsdf.inputs:
                bsdf.inputs['Emission Strength'].default_value = emission_strength

    if alpha < 1.0:
        if 'Alpha' in bsdf.inputs:
            bsdf.inputs['Alpha'].default_value = alpha
        if hasattr(mat, 'blend_method'):
            mat.blend_method = 'BLEND'

    mat.node_tree.links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
    return mat


# ============================================================================
# 2. PBR MATERIAL FACTORY
# ============================================================================

def setup_maybach_eqs_phase2_materials():
    mats = {}

    mats['obsidian_black'] = make_pbr_material(
        "Maybach_EQS_Obsidian_Black_Metallic",
        (0.012, 0.013, 0.015, 1.0),
        metallic=0.90,
        roughness=0.08,
        clearcoat=1.0
    )

    mats['hightech_silver'] = make_pbr_material(
        "Maybach_EQS_HighTech_Silver_Metallic",
        (0.82, 0.84, 0.86, 1.0),
        metallic=0.94,
        roughness=0.12,
        clearcoat=1.0
    )

    mats['pinstripe'] = make_pbr_material(
        "Maybach_EQS_Divider_Pinstripe",
        (0.92, 0.88, 0.80, 1.0),
        metallic=0.98,
        roughness=0.04,
        clearcoat=1.0
    )

    mats['black_panel_grille'] = make_pbr_material(
        "Maybach_EQS_Black_Panel_Grille",
        (0.005, 0.006, 0.008, 1.0),
        metallic=0.10,
        roughness=0.02,
        clearcoat=1.0
    )

    mats['grille_chrome_stripes'] = make_pbr_material(
        "Maybach_EQS_Grille_Chrome_Stripes",
        (0.97, 0.98, 0.99, 1.0),
        metallic=0.99,
        roughness=0.02,
        clearcoat=1.0
    )

    mats['headlamp_lens'] = make_pbr_material(
        "Maybach_EQS_Digital_Light_Lens",
        (0.94, 0.96, 0.98, 1.0),
        metallic=0.02,
        roughness=0.01,
        transmission=0.96,
        ior=1.58,
        alpha=0.20
    )

    mats['front_light_band'] = make_pbr_material(
        "Maybach_EQS_Front_LED_Light_Band",
        (1.0, 1.0, 1.0, 1.0),
        metallic=0.0,
        roughness=0.05,
        emission=(1.0, 1.0, 1.0, 1.0),
        emission_strength=14.0
    )

    mats['headlamp_housing'] = make_pbr_material(
        "Maybach_EQS_Headlamp_Housing",
        (0.08, 0.09, 0.10, 1.0),
        metallic=0.85,
        roughness=0.10
    )

    mats['helix_taillight'] = make_pbr_material(
        "Maybach_EQS_3D_Helix_Taillight",
        (1.0, 0.01, 0.01, 1.0),
        metallic=0.0,
        roughness=0.06,
        emission=(1.0, 0.015, 0.015, 1.0),
        emission_strength=14.0
    )

    mats['taillight_lens'] = make_pbr_material(
        "Maybach_EQS_Taillight_Lens",
        (0.15, 0.02, 0.02, 1.0),
        metallic=0.05,
        roughness=0.03,
        transmission=0.75,
        alpha=0.35
    )

    mats['windshield_glass'] = make_pbr_material(
        "Maybach_EQS_Windshield_Optical_Glass",
        (0.85, 0.90, 0.92, 1.0),
        metallic=0.02,
        roughness=0.01,
        transmission=0.94,
        ior=1.52,
        clearcoat=1.0,
        alpha=0.22
    )

    mats['privacy_glass'] = make_pbr_material(
        "Maybach_EQS_Privacy_Acoustic_Glass",
        (0.02, 0.03, 0.04, 1.0),
        metallic=0.05,
        roughness=0.02,
        transmission=0.55,
        ior=1.52,
        clearcoat=1.0,
        alpha=0.28
    )

    mats['chrome_trim'] = make_pbr_material(
        "Maybach_EQS_Mirror_Chrome_Trim",
        (0.96, 0.97, 0.98, 1.0),
        metallic=0.99,
        roughness=0.03,
        clearcoat=1.0
    )

    mats['maybach_crest_emissive'] = make_pbr_material(
        "Maybach_EQS_DPillar_Crest_Emissive",
        (1.0, 0.98, 0.94, 1.0),
        metallic=0.85,
        roughness=0.05,
        emission=(1.0, 0.96, 0.90, 1.0),
        emission_strength=8.5
    )

    mats['door_handle_chrome'] = make_pbr_material(
        "Maybach_EQS_Flush_Door_Handle_Chrome",
        (0.95, 0.96, 0.98, 1.0),
        metallic=0.98,
        roughness=0.04,
        clearcoat=1.0
    )

    mats['standing_star'] = make_pbr_material(
        "Maybach_EQS_Hood_Standing_Star",
        (0.98, 0.98, 0.99, 1.0),
        metallic=0.99,
        roughness=0.02,
        clearcoat=1.0
    )

    mats['panoramic_roof'] = make_pbr_material(
        "Maybach_EQS_Panoramic_Sunroof_Glass",
        (0.015, 0.018, 0.022, 1.0),
        metallic=0.05,
        roughness=0.02,
        transmission=0.60,
        clearcoat=1.0,
        alpha=0.35
    )

    mats['gloss_black_aero'] = make_pbr_material(
        "Maybach_EQS_Gloss_Black_Aero",
        (0.01, 0.01, 0.01, 1.0),
        metallic=0.20,
        roughness=0.05,
        clearcoat=1.0
    )

    mats['lower_chrome_mesh'] = make_pbr_material(
        "Maybach_EQS_Lower_Bumper_Chrome_Mesh",
        (0.92, 0.93, 0.95, 1.0),
        metallic=0.98,
        roughness=0.06,
        clearcoat=0.9
    )

    return mats


# ============================================================================
# 3. TWO-TONE AERODYNAMIC SUV BODYWORK
# ============================================================================

def build_maybach_eqs_body_panels(col, mats):
    all_objs = []

    # ── 3.1 Hood Panel (Obsidian Black Metallic) ─────────────────────────
    obj_hood, mesh_hood = create_mesh_object("GEO_Maybach_EQS_Hood_Panel", col)
    bm = bmesh.new()
    hood_w = 0.88
    hood_front_y = 2.48
    hood_rear_y = 1.25
    hood_z_front = 0.94
    hood_z_rear = 1.05

    hood_secs = 8
    for sec in range(hood_secs):
        t1 = sec / hood_secs
        t2 = (sec + 1) / hood_secs

        y1 = hood_front_y + (hood_rear_y - hood_front_y) * t1
        y2 = hood_front_y + (hood_rear_y - hood_front_y) * t2

        crown1 = 0.035 * math.sin(math.pi * t1)
        crown2 = 0.035 * math.sin(math.pi * t2)
        z1 = hood_z_front + (hood_z_rear - hood_z_front) * t1 + crown1
        z2 = hood_z_front + (hood_z_rear - hood_z_front) * t2 + crown2

        w1 = hood_w * (0.86 + 0.14 * t1)
        w2 = hood_w * (0.86 + 0.14 * t2)

        hv0 = bm.verts.new(Vector((-w1, y1, z1)))
        hv1 = bm.verts.new(Vector((w1, y1, z1)))
        hv2 = bm.verts.new(Vector((w2, y2, z2)))
        hv3 = bm.verts.new(Vector((-w2, y2, z2)))
        bm.faces.new([hv0, hv1, hv2, hv3])

    bm.to_mesh(mesh_hood)
    bm.free()
    finalize_cad_object(obj_hood, mats['obsidian_black'], thickness=0.002, bevel_width=0.003)
    all_objs.append(obj_hood)

    # ── 3.2 Standing Mercedes Star on Hood ───────────────────────────────
    obj_star, mesh_star = create_mesh_object("GEO_Maybach_EQS_Standing_Star", col)
    bm = bmesh.new()
    star_y = 2.44
    star_z = 0.97
    _compat_create_cylinder(bm, radius=0.022, depth=0.015, segments=16,
                            matrix=Matrix.Translation(Vector((0.0, star_y, star_z))))
    _compat_create_cylinder(bm, radius=0.038, depth=0.006, segments=24,
                            matrix=Matrix.Translation(Vector((0.0, star_y, star_z + 0.045))) @
                            Matrix.Rotation(math.radians(90), 4, 'X'))
    bm.to_mesh(mesh_star)
    bm.free()
    finalize_cad_object(obj_star, mats['standing_star'], thickness=0.001)
    all_objs.append(obj_star)

    # ── 3.3 Aerodynamic Roof Panel (Obsidian Black with Panoramic Glass) ─
    obj_roof, mesh_roof = create_mesh_object("GEO_Maybach_EQS_Roof_Panel", col)
    bm = bmesh.new()
    roof_w = 0.84
    roof_front_y = 1.15
    roof_rear_y = -1.48
    roof_z = 1.66

    roof_secs = 8
    for sec in range(roof_secs):
        t1 = sec / roof_secs
        t2 = (sec + 1) / roof_secs

        y1 = roof_front_y + (roof_rear_y - roof_front_y) * t1
        y2 = roof_front_y + (roof_rear_y - roof_front_y) * t2

        z1 = roof_z - 0.08 * (t1 ** 1.5)
        z2 = roof_z - 0.08 * (t2 ** 1.5)

        rv0 = bm.verts.new(Vector((-roof_w, y1, z1)))
        rv1 = bm.verts.new(Vector((roof_w, y1, z1)))
        rv2 = bm.verts.new(Vector((roof_w, y2, z2)))
        rv3 = bm.verts.new(Vector((-roof_w, y2, z2)))
        bm.faces.new([rv0, rv1, rv2, rv3])

    bm.to_mesh(mesh_roof)
    bm.free()
    finalize_cad_object(obj_roof, mats['obsidian_black'], thickness=0.002, bevel_width=0.003)
    all_objs.append(obj_roof)

    # Panoramic glass insert
    obj_pano, mesh_pano = create_mesh_object("GEO_Maybach_EQS_Panoramic_Sunroof", col)
    bm = bmesh.new()
    pano_w = 0.65
    pv0 = bm.verts.new(Vector((-pano_w, 0.90, roof_z + 0.005)))
    pv1 = bm.verts.new(Vector((pano_w, 0.90, roof_z + 0.005)))
    pv2 = bm.verts.new(Vector((pano_w, -1.15, roof_z - 0.05)))
    pv3 = bm.verts.new(Vector((-pano_w, -1.15, roof_z - 0.05)))
    bm.faces.new([pv0, pv1, pv2, pv3])
    bm.to_mesh(mesh_pano)
    bm.free()
    finalize_cad_object(obj_pano, mats['panoramic_roof'], thickness=0.004)
    all_objs.append(obj_pano)

    # ── 3.4 Front Fenders with Corner Wraparound (High-Tech Silver) ─────
    for side_name, side_sign in [("Left", 1), ("Right", -1)]:
        obj_fender, mesh_fender = create_mesh_object(f"GEO_Maybach_EQS_Front_Fender_{side_name}", col)
        bm = bmesh.new()
        fx = side_sign * 0.96
        fin_x = side_sign * 0.86
        ff_y = 2.48
        fr_y = 1.05
        fz_low = 0.32
        fz_high = 0.98

        f_secs = 8
        for sec in range(f_secs):
            t1 = sec / f_secs
            t2 = (sec + 1) / f_secs

            y1 = ff_y + (fr_y - ff_y) * t1
            y2 = ff_y + (fr_y - ff_y) * t2

            wheel_cy = 1.605
            d1 = abs(y1 - wheel_cy)
            d2 = abs(y2 - wheel_cy)
            arch_r = 0.46
            z_low1 = fz_low + max(0, arch_r - d1) * 0.55 if d1 < arch_r else fz_low
            z_low2 = fz_low + max(0, arch_r - d2) * 0.55 if d2 < arch_r else fz_low

            fv0 = bm.verts.new(Vector((fx, y1, z_low1)))
            fv1 = bm.verts.new(Vector((fx, y1, fz_high)))
            fv2 = bm.verts.new(Vector((fx, y2, fz_high)))
            fv3 = bm.verts.new(Vector((fx, y2, z_low2)))
            if side_sign > 0:
                bm.faces.new([fv0, fv1, fv2, fv3])
            else:
                bm.faces.new([fv3, fv2, fv1, fv0])

            # Fender top crown bridging to hood shutline
            fv4 = bm.verts.new(Vector((fin_x, y1, fz_high - 0.02)))
            fv5 = bm.verts.new(Vector((fin_x, y2, fz_high - 0.02)))
            if side_sign > 0:
                bm.faces.new([fv1, fv4, fv5, fv2])
            else:
                bm.faces.new([fv2, fv5, fv4, fv1])

        # Aerodynamic nose corner radius wrapping into front fascia
        wrap_v0 = bm.verts.new(Vector((fx, ff_y, fz_low)))
        wrap_v1 = bm.verts.new(Vector((fx, ff_y, fz_high)))
        wrap_v2 = bm.verts.new(Vector((side_sign * 0.88, ff_y + 0.03, fz_high)))
        wrap_v3 = bm.verts.new(Vector((side_sign * 0.88, ff_y + 0.03, fz_low)))
        if side_sign > 0:
            bm.faces.new([wrap_v0, wrap_v1, wrap_v2, wrap_v3])
        else:
            bm.faces.new([wrap_v3, wrap_v2, wrap_v1, wrap_v0])

        bm.to_mesh(mesh_fender)
        bm.free()
        finalize_cad_object(obj_fender, mats['hightech_silver'], thickness=0.002)
        all_objs.append(obj_fender)

    # ── 3.5 Rear Quarter Panels (High-Tech Silver Metallic) ──────────────
    for side_name, side_sign in [("Left", 1), ("Right", -1)]:
        obj_quarter, mesh_quarter = create_mesh_object(f"GEO_Maybach_EQS_Rear_Quarter_{side_name}", col)
        bm = bmesh.new()
        qx = side_sign * 0.98
        qin_x = side_sign * 0.84
        qf_y = 0.05
        qr_y = -2.44
        qz_low = 0.32
        qz_high = 1.06

        q_secs = 10
        for sec in range(q_secs):
            t1 = sec / q_secs
            t2 = (sec + 1) / q_secs

            y1 = qf_y + (qr_y - qf_y) * t1
            y2 = qf_y + (qr_y - qf_y) * t2

            wheel_cy = -1.605
            d1 = abs(y1 - wheel_cy)
            d2 = abs(y2 - wheel_cy)
            arch_r = 0.46
            z_low1 = qz_low + max(0, arch_r - d1) * 0.55 if d1 < arch_r else qz_low
            z_low2 = qz_low + max(0, arch_r - d2) * 0.55 if d2 < arch_r else qz_low

            qv0 = bm.verts.new(Vector((qx, y1, z_low1)))
            qv1 = bm.verts.new(Vector((qx, y1, qz_high)))
            qv2 = bm.verts.new(Vector((qx, y2, qz_high)))
            qv3 = bm.verts.new(Vector((qx, y2, z_low2)))
            if side_sign > 0:
                bm.faces.new([qv0, qv1, qv2, qv3])
            else:
                bm.faces.new([qv3, qv2, qv1, qv0])

            # Top shoulder bridging to greenhouse cantrail
            qv4 = bm.verts.new(Vector((qin_x, y1, qz_high - 0.03)))
            qv5 = bm.verts.new(Vector((qin_x, y2, qz_high - 0.03)))
            if side_sign > 0:
                bm.faces.new([qv1, qv4, qv5, qv2])
            else:
                bm.faces.new([qv2, qv5, qv4, qv1])

        bm.to_mesh(mesh_quarter)
        bm.free()
        finalize_cad_object(obj_quarter, mats['hightech_silver'], thickness=0.002)
        all_objs.append(obj_quarter)

    # ── 3.6 Doors (Two-Tone Split: Silver Lower, Obsidian Upper Waist) ───
    door_specs = [
        ("Front_Left", 1, 0.08, 1.05, 0.30, 0.98),
        ("Front_Right", -1, 0.08, 1.05, 0.30, 0.98),
        ("Rear_Left", 1, -0.92, 0.06, 0.30, 0.98),
        ("Rear_Right", -1, -0.92, 0.06, 0.30, 0.98),
    ]

    for door_name, side_sign, dy_start, dy_end, dz_low, dz_high in door_specs:
        # Lower door body (Silver)
        obj_door, mesh_door = create_mesh_object(f"GEO_Maybach_EQS_Door_{door_name}", col)
        bm = bmesh.new()
        door_x = side_sign * 0.97

        dv0 = bm.verts.new(Vector((door_x, dy_start, dz_low)))
        dv1 = bm.verts.new(Vector((door_x, dy_end, dz_low)))
        dv2 = bm.verts.new(Vector((door_x, dy_end, dz_high)))
        dv3 = bm.verts.new(Vector((door_x, dy_start, dz_high)))
        if side_sign > 0:
            bm.faces.new([dv0, dv1, dv2, dv3])
        else:
            bm.faces.new([dv3, dv2, dv1, dv0])

        bm.to_mesh(mesh_door)
        bm.free()
        finalize_cad_object(obj_door, mats['hightech_silver'], thickness=0.003)
        all_objs.append(obj_door)

        # Upper door waist & window sill (Obsidian Black)
        obj_sill, mesh_sill = create_mesh_object(f"GEO_Maybach_EQS_DoorSill_{door_name}", col)
        bm = bmesh.new()
        sv0 = bm.verts.new(Vector((door_x, dy_start, dz_high)))
        sv1 = bm.verts.new(Vector((door_x, dy_end, dz_high)))
        sv2 = bm.verts.new(Vector((door_x * 0.98, dy_end, dz_high + 0.06)))
        sv3 = bm.verts.new(Vector((door_x * 0.98, dy_start, dz_high + 0.06)))
        if side_sign > 0:
            bm.faces.new([sv0, sv1, sv2, sv3])
        else:
            bm.faces.new([sv3, sv2, sv1, sv0])
        bm.to_mesh(mesh_sill)
        bm.free()
        finalize_cad_object(obj_sill, mats['obsidian_black'], thickness=0.003)
        all_objs.append(obj_sill)

    # ── 3.7 Fine Pinstripe Dividing Line (Beltline) ──────────────────────
    for side_name, side_sign in [("Left", 1), ("Right", -1)]:
        obj_stripe, mesh_stripe = create_mesh_object(f"GEO_Maybach_EQS_Pinstripe_{side_name}", col)
        bm = bmesh.new()
        px = side_sign * 0.975
        pv0 = bm.verts.new(Vector((px, 2.46, 0.98)))
        pv1 = bm.verts.new(Vector((px, -2.40, 1.03)))
        pv2 = bm.verts.new(Vector((px, -2.40, 1.036)))
        pv3 = bm.verts.new(Vector((px, 2.46, 0.986)))
        if side_sign > 0:
            bm.faces.new([pv0, pv1, pv2, pv3])
        else:
            bm.faces.new([pv3, pv2, pv1, pv0])
        bm.to_mesh(mesh_stripe)
        bm.free()
        finalize_cad_object(obj_stripe, mats['pinstripe'], thickness=0.001)
        all_objs.append(obj_stripe)

    # ── 3.8 Aerodynamic SUV Tailgate ────────────────────────────────────
    obj_gate, mesh_gate = create_mesh_object("GEO_Maybach_EQS_Tailgate", col)
    bm = bmesh.new()
    gate_w = 0.84
    tg_top_y = -1.48
    tg_mid_y = -2.25
    tg_bot_y = -2.48
    tg_z_top = 1.62
    tg_z_mid = 1.06
    tg_z_bot = 0.42

    # Upper tailgate (Obsidian Black surrounding rear glass)
    gv0 = bm.verts.new(Vector((-gate_w * 0.88, tg_top_y, tg_z_top)))
    gv1 = bm.verts.new(Vector((gate_w * 0.88, tg_top_y, tg_z_top)))
    gv2 = bm.verts.new(Vector((gate_w, tg_mid_y, tg_z_mid)))
    gv3 = bm.verts.new(Vector((-gate_w, tg_mid_y, tg_z_mid)))
    bm.faces.new([gv3, gv2, gv1, gv0])

    # Lower tailgate (High-Tech Silver)
    gv4 = bm.verts.new(Vector((gate_w * 0.95, tg_bot_y, tg_z_bot)))
    gv5 = bm.verts.new(Vector((-gate_w * 0.95, tg_bot_y, tg_z_bot)))
    bm.faces.new([gv5, gv4, gv2, gv3])

    bm.to_mesh(mesh_gate)
    bm.free()
    finalize_cad_object(obj_gate, mats['hightech_silver'], thickness=0.003, bevel_width=0.003)
    all_objs.append(obj_gate)

    # ── 3.9 Front Bumper (Lower Apron & Chrome Air Scoops) ───────────────
    # Lower central apron
    obj_fbump, mesh_fbump = create_mesh_object("GEO_Maybach_EQS_Front_Bumper_Apron", col)
    bm = bmesh.new()
    fb_w = 0.96
    fb_y = 2.50
    fb_z_low = 0.20
    fb_z_high = 0.48

    fb0 = bm.verts.new(Vector((-fb_w, fb_y, fb_z_low)))
    fb1 = bm.verts.new(Vector((fb_w, fb_y, fb_z_low)))
    fb2 = bm.verts.new(Vector((fb_w, fb_y, fb_z_high)))
    fb3 = bm.verts.new(Vector((-fb_w, fb_y, fb_z_high)))
    bm.faces.new([fb0, fb1, fb2, fb3])

    bm.to_mesh(mesh_fbump)
    bm.free()
    finalize_cad_object(obj_fbump, mats['hightech_silver'], thickness=0.003)
    all_objs.append(obj_fbump)

    # Lower Chrome Louvers
    for louver_idx in range(4):
        lz = 0.24 + louver_idx * 0.055
        obj_louver, mesh_louver = create_mesh_object(f"GEO_Maybach_EQS_Front_Louver_{louver_idx}", col)
        bm = bmesh.new()
        _compat_create_cylinder(bm, radius=0.006, depth=0.88, segments=12,
                                matrix=Matrix.Translation(Vector((0.0, 2.52, lz))) @
                                Matrix.Rotation(math.radians(90), 4, 'Y'))
        bm.to_mesh(mesh_louver)
        bm.free()
        finalize_cad_object(obj_louver, mats['lower_chrome_mesh'], thickness=0.001)
        all_objs.append(obj_louver)

    # Front Bumper Lower Side Cheeks with Maybach Chrome Scoops (below headlamps)
    for cheek_name, cheek_sign in [("Left", 1), ("Right", -1)]:
        obj_fcheek, mesh_fcheek = create_mesh_object(f"GEO_Maybach_EQS_Front_Cheek_{cheek_name}", col)
        bm = bmesh.new()
        cx_in = cheek_sign * 0.38
        cx_out = cheek_sign * 0.96
        cy = 2.50
        cz_low = 0.46
        cz_high = 0.72

        cf0 = bm.verts.new(Vector((cx_in, cy, cz_low)))
        cf1 = bm.verts.new(Vector((cx_out, cy - 0.02, cz_low)))
        cf2 = bm.verts.new(Vector((cx_out, cy - 0.02, cz_high)))
        cf3 = bm.verts.new(Vector((cx_in, cy, cz_high)))
        if cheek_sign > 0:
            bm.faces.new([cf0, cf1, cf2, cf3])
        else:
            bm.faces.new([cf3, cf2, cf1, cf0])

        bm.to_mesh(mesh_fcheek)
        bm.free()
        finalize_cad_object(obj_fcheek, mats['hightech_silver'], thickness=0.003)
        all_objs.append(obj_fcheek)

        # Chrome aero scoop ring in front cheek
        obj_scoop, mesh_scoop = create_mesh_object(f"GEO_Maybach_EQS_Cheek_Scoop_{cheek_name}", col)
        bm = bmesh.new()
        sc_x = cheek_sign * 0.67
        sc_y = 2.51
        sc_z = 0.58
        _compat_create_cylinder(bm, radius=0.08, depth=0.02, segments=20,
                                matrix=Matrix.Translation(Vector((sc_x, sc_y, sc_z))) @
                                Matrix.Rotation(math.radians(90), 4, 'X'))
        bm.to_mesh(mesh_scoop)
        bm.free()
        finalize_cad_object(obj_scoop, mats['chrome_trim'], thickness=0.002)
        all_objs.append(obj_scoop)

    # ── 3.10 Rear Bumper & Gloss Black Diffuser ──────────────────────────
    obj_rbump, mesh_rbump = create_mesh_object("GEO_Maybach_EQS_Rear_Bumper", col)
    bm = bmesh.new()
    rb_w = 0.98
    rb_y = -2.48
    rb_z_low = 0.22
    rb_z_high = 0.55

    rb0 = bm.verts.new(Vector((-rb_w, rb_y, rb_z_low)))
    rb1 = bm.verts.new(Vector((rb_w, rb_y, rb_z_low)))
    rb2 = bm.verts.new(Vector((rb_w, rb_y, rb_z_high)))
    rb3 = bm.verts.new(Vector((-rb_w, rb_y, rb_z_high)))
    bm.faces.new([rb3, rb2, rb1, rb0])

    bm.to_mesh(mesh_rbump)
    bm.free()
    finalize_cad_object(obj_rbump, mats['hightech_silver'], thickness=0.003)
    all_objs.append(obj_rbump)

    # Gloss black lower diffuser with chrome accent trim (pure EV, no exhaust)
    obj_diff, mesh_diff = create_mesh_object("GEO_Maybach_EQS_Rear_Diffuser_Fascia", col)
    bm = bmesh.new()
    df_w = 0.85
    df0 = bm.verts.new(Vector((-df_w, rb_y - 0.02, 0.20)))
    df1 = bm.verts.new(Vector((df_w, rb_y - 0.02, 0.20)))
    df2 = bm.verts.new(Vector((df_w * 0.90, rb_y - 0.06, 0.35)))
    df3 = bm.verts.new(Vector((-df_w * 0.90, rb_y - 0.06, 0.35)))
    bm.faces.new([df3, df2, df1, df0])
    bm.to_mesh(mesh_diff)
    bm.free()
    finalize_cad_object(obj_diff, mats['gloss_black_aero'], thickness=0.003)
    all_objs.append(obj_diff)

    print(f"  [BODY PANELS] Built {len(all_objs)} exterior two-tone body shell components")
    return all_objs


# ============================================================================
# 4. BLACK PANEL RADIATOR GRILLE & DIGITAL LIGHT HEADLAMPS
# ============================================================================

def build_maybach_eqs_front_optics(col, mats):
    all_objs = []

    grille_y = 2.53
    grille_z_low = 0.48
    grille_z_high = 0.92
    grille_half_w = 0.36

    # ── 4.1 Seamless Black Panel Base ────────────────────────────────────
    obj_grille, mesh_grille = create_mesh_object("GEO_Maybach_EQS_Black_Panel_Grille", col)
    bm = bmesh.new()
    gp0 = bm.verts.new(Vector((-grille_half_w, grille_y, grille_z_low)))
    gp1 = bm.verts.new(Vector((grille_half_w, grille_y, grille_z_low)))
    gp2 = bm.verts.new(Vector((grille_half_w * 0.94, grille_y, grille_z_high)))
    gp3 = bm.verts.new(Vector((-grille_half_w * 0.94, grille_y, grille_z_high)))
    bm.faces.new([gp0, gp1, gp2, gp3])
    bm.to_mesh(mesh_grille)
    bm.free()
    finalize_cad_object(obj_grille, mats['black_panel_grille'], thickness=0.004, bevel_width=0.002)
    all_objs.append(obj_grille)

    # ── 4.2 Chrome Surround Frame with Upper MAYBACH Header Bar ──────────
    obj_gframe, mesh_gframe = create_mesh_object("GEO_Maybach_EQS_Grille_Chrome_Surround", col)
    bm = bmesh.new()
    gw = grille_half_w * 0.96
    f_v0 = bm.verts.new(Vector((-gw, grille_y + 0.006, grille_z_high)))
    f_v1 = bm.verts.new(Vector((gw, grille_y + 0.006, grille_z_high)))
    f_v2 = bm.verts.new(Vector((gw, grille_y + 0.006, grille_z_high + 0.024)))
    f_v3 = bm.verts.new(Vector((-gw, grille_y + 0.006, grille_z_high + 0.024)))
    bm.faces.new([f_v0, f_v1, f_v2, f_v3])
    bm.to_mesh(mesh_gframe)
    bm.free()
    finalize_cad_object(obj_gframe, mats['chrome_trim'], thickness=0.003)
    all_objs.append(obj_gframe)

    # ── 4.3 28 Vertical 3D Chrome Pinstripes ─────────────────────────────
    num_stripes = 28
    stripe_pitch = (grille_half_w * 2 * 0.90) / (num_stripes + 1)

    for s_idx in range(num_stripes):
        sx = -grille_half_w * 0.90 + stripe_pitch * (s_idx + 1)
        obj_stripe, mesh_stripe = create_mesh_object(f"GEO_Maybach_EQS_Grille_Stripe_{s_idx}", col)
        bm = bmesh.new()
        _compat_create_cylinder(bm, radius=0.003, depth=grille_z_high - grille_z_low - 0.04, segments=8,
                                matrix=Matrix.Translation(Vector((sx, grille_y + 0.004, (grille_z_low + grille_z_high)/2))))
        bm.to_mesh(mesh_stripe)
        bm.free()
        finalize_cad_object(obj_stripe, mats['grille_chrome_stripes'], thickness=0.001)
        all_objs.append(obj_stripe)

    # ── 4.4 Continuous Horizontal Front LED Light Band ───────────────────
    obj_band, mesh_band = create_mesh_object("GEO_Maybach_EQS_Front_Light_Band", col)
    bm = bmesh.new()
    band_w = 0.88
    band_y = 2.52
    band_z = 0.94
    _compat_create_cylinder(bm, radius=0.007, depth=band_w * 2, segments=16,
                            matrix=Matrix.Translation(Vector((0.0, band_y, band_z))) @
                            Matrix.Rotation(math.radians(90), 4, 'Y'))
    bm.to_mesh(mesh_band)
    bm.free()
    finalize_cad_object(obj_band, mats['front_light_band'], thickness=0.001)
    all_objs.append(obj_band)

    # ── 4.5 Digital Light Headlamp Units (Left + Right) ─────────────────
    for side_name, side_sign in [("Left", 1), ("Right", -1)]:
        hx = side_sign * 0.65
        hy = 2.51
        hz = 0.82
        prefix = f"GEO_Maybach_EQS_Headlamp_{side_name}"

        # Housing
        obj_hh, mesh_hh = create_mesh_object(f"{prefix}_Housing", col)
        bm = bmesh.new()
        hw = 0.28
        hh = 0.14
        hv0 = bm.verts.new(Vector((hx - hw/2, hy - 0.02, hz - hh/2)))
        hv1 = bm.verts.new(Vector((hx + hw/2, hy - 0.02, hz - hh/2)))
        hv2 = bm.verts.new(Vector((hx + hw/2, hy - 0.02, hz + hh/2)))
        hv3 = bm.verts.new(Vector((hx - hw/2, hy - 0.02, hz + hh/2)))
        bm.faces.new([hv0, hv1, hv2, hv3])
        bm.to_mesh(mesh_hh)
        bm.free()
        finalize_cad_object(obj_hh, mats['headlamp_housing'], thickness=0.004)
        all_objs.append(obj_hh)

        # Lens (Curved front outer cover)
        obj_hl, mesh_hl = create_mesh_object(f"{prefix}_Lens", col)
        bm = bmesh.new()
        hl0 = bm.verts.new(Vector((hx - hw/2, hy + 0.008, hz - hh/2)))
        hl1 = bm.verts.new(Vector((hx + hw/2, hy + 0.004, hz - hh/2)))
        hl2 = bm.verts.new(Vector((hx + hw/2, hy + 0.004, hz + hh/2)))
        hl3 = bm.verts.new(Vector((hx - hw/2, hy + 0.008, hz + hh/2)))
        bm.faces.new([hl0, hl1, hl2, hl3])
        bm.to_mesh(mesh_hl)
        bm.free()
        finalize_cad_object(obj_hl, mats['headlamp_lens'], thickness=0.002)
        all_objs.append(obj_hl)

        # 3x Digital Light Projector Modules
        for p_idx in range(3):
            px = hx - side_sign * (0.07 - p_idx * 0.07)
            obj_proj, mesh_proj = create_mesh_object(f"{prefix}_Projector_{p_idx}", col)
            bm = bmesh.new()
            _compat_create_cylinder(bm, radius=0.024, depth=0.04, segments=16,
                                    matrix=Matrix.Translation(Vector((px, hy - 0.01, hz))) @
                                    Matrix.Rotation(math.radians(90), 4, 'X'))
            bm.to_mesh(mesh_proj)
            bm.free()
            finalize_cad_object(obj_proj, mats['front_light_band'], thickness=0.001)
            all_objs.append(obj_proj)

    print(f"  [FRONT OPTICS] Built {len(all_objs)} Black Panel grille & Digital Light components")
    return all_objs


# ============================================================================
# 5. 3D HELIX SPIRAL TAILLAMP STRIP & REAR SPOILER
# ============================================================================

def build_maybach_eqs_rear_optics(col, mats):
    all_objs = []
    ty = -2.36
    tz = 1.06

    # ── 5.1 Continuous 3D Curved Taillamp Strip ──────────────────────────
    obj_tbar, mesh_tbar = create_mesh_object("GEO_Maybach_EQS_Taillight_Bar", col)
    bm = bmesh.new()
    bar_w = 0.88
    bar_h = 0.050
    tb0 = bm.verts.new(Vector((-bar_w, ty, tz - bar_h/2)))
    tb1 = bm.verts.new(Vector((bar_w, ty, tz - bar_h/2)))
    tb2 = bm.verts.new(Vector((bar_w, ty, tz + bar_h/2)))
    tb3 = bm.verts.new(Vector((-bar_w, ty, tz + bar_h/2)))
    bm.faces.new([tb3, tb2, tb1, tb0])
    bm.to_mesh(mesh_tbar)
    bm.free()
    finalize_cad_object(obj_tbar, mats['helix_taillight'], thickness=0.003)
    all_objs.append(obj_tbar)

    # Outer smoked lens
    obj_tlens, mesh_tlens = create_mesh_object("GEO_Maybach_EQS_Taillight_Lens", col)
    bm = bmesh.new()
    tl0 = bm.verts.new(Vector((-bar_w, ty - 0.008, tz - bar_h/2)))
    tl1 = bm.verts.new(Vector((bar_w, ty - 0.008, tz - bar_h/2)))
    tl2 = bm.verts.new(Vector((bar_w, ty - 0.008, tz + bar_h/2)))
    tl3 = bm.verts.new(Vector((-bar_w, ty - 0.008, tz + bar_h/2)))
    bm.faces.new([tl3, tl2, tl1, tl0])
    bm.to_mesh(mesh_tlens)
    bm.free()
    finalize_cad_object(obj_tlens, mats['taillight_lens'], thickness=0.002)
    all_objs.append(obj_tlens)

    # ── 5.2 3D Helix Spiral Coils (24 helical loop segments) ────────────
    num_loops = 24
    loop_spacing = (bar_w * 2 * 0.90) / (num_loops + 1)
    for l_idx in range(num_loops):
        lx = -bar_w * 0.90 + loop_spacing * (l_idx + 1)
        obj_loop, mesh_loop = create_mesh_object(f"GEO_Maybach_EQS_Helix_Loop_{l_idx}", col)
        bm = bmesh.new()
        _compat_create_cylinder(bm, radius=0.014, depth=0.010, segments=12,
                                matrix=Matrix.Translation(Vector((lx, ty + 0.006, tz))) @
                                Matrix.Rotation(math.radians(90), 4, 'X'))
        bm.to_mesh(mesh_loop)
        bm.free()
        finalize_cad_object(obj_loop, mats['helix_taillight'], thickness=0.001)
        all_objs.append(obj_loop)

    # ── 5.3 Aerodynamic Roof Spoiler & CHMSL ─────────────────────────────
    obj_spoil, mesh_spoil = create_mesh_object("GEO_Maybach_EQS_Roof_Spoiler", col)
    bm = bmesh.new()
    sp_w = 0.84
    sp_y = -1.48
    sp_z = 1.63
    sv0 = bm.verts.new(Vector((-sp_w, sp_y, sp_z)))
    sv1 = bm.verts.new(Vector((sp_w, sp_y, sp_z)))
    sv2 = bm.verts.new(Vector((sp_w, sp_y - 0.18, sp_z - 0.02)))
    sv3 = bm.verts.new(Vector((-sp_w, sp_y - 0.18, sp_z - 0.02)))
    bm.faces.new([sv3, sv2, sv1, sv0])
    bm.to_mesh(mesh_spoil)
    bm.free()
    finalize_cad_object(obj_spoil, mats['obsidian_black'], thickness=0.004)
    all_objs.append(obj_spoil)

    # Third brake light (CHMSL) in spoiler
    obj_chmsl, mesh_chmsl = create_mesh_object("GEO_Maybach_EQS_CHMSL", col)
    bm = bmesh.new()
    _compat_create_cylinder(bm, radius=0.006, depth=0.38, segments=12,
                            matrix=Matrix.Translation(Vector((0.0, sp_y - 0.16, sp_z - 0.015))) @
                            Matrix.Rotation(math.radians(90), 4, 'Y'))
    bm.to_mesh(mesh_chmsl)
    bm.free()
    finalize_cad_object(obj_chmsl, mats['helix_taillight'], thickness=0.001)
    all_objs.append(obj_chmsl)

    # Chrome MAYBACH Lettering Bar on Tailgate
    obj_badge, mesh_badge = create_mesh_object("GEO_Maybach_EQS_Tailgate_Maybach_Badge", col)
    bm = bmesh.new()
    _compat_create_cylinder(bm, radius=0.005, depth=0.28, segments=12,
                            matrix=Matrix.Translation(Vector((0.0, ty - 0.012, tz + 0.065))) @
                            Matrix.Rotation(math.radians(90), 4, 'Y'))
    bm.to_mesh(mesh_badge)
    bm.free()
    finalize_cad_object(obj_badge, mats['chrome_trim'], thickness=0.001)
    all_objs.append(obj_badge)

    print(f"  [REAR OPTICS] Built {len(all_objs)} 3D helix spiral taillamp & spoiler components")
    return all_objs


# ============================================================================
# 6. FLUSH GREENHOUSE & CHROME MAYBACH JEWELRY
# ============================================================================

def build_maybach_eqs_greenhouse_jewelry(col, mats):
    all_objs = []

    # ── 6.1 Windshield Glass & Exterior A-Pillar Covers ──────────────────
    obj_ws, mesh_ws = create_mesh_object("GEO_Maybach_EQS_Windshield", col)
    bm = bmesh.new()
    ws_w = 0.82
    wv0 = bm.verts.new(Vector((-ws_w, 1.25, 1.05)))
    wv1 = bm.verts.new(Vector((ws_w, 1.25, 1.05)))
    wv2 = bm.verts.new(Vector((ws_w * 0.88, 1.15, 1.66)))
    wv3 = bm.verts.new(Vector((-ws_w * 0.88, 1.15, 1.66)))
    bm.faces.new([wv0, wv1, wv2, wv3])
    bm.to_mesh(mesh_ws)
    bm.free()
    finalize_cad_object(obj_ws, mats['windshield_glass'], thickness=0.004)
    all_objs.append(obj_ws)

    # Rear Windshield Glass
    obj_rws, mesh_rws = create_mesh_object("GEO_Maybach_EQS_Rear_Windshield", col)
    bm = bmesh.new()
    rw_w = 0.76
    rw0 = bm.verts.new(Vector((-rw_w, -1.50, 1.60)))
    rw1 = bm.verts.new(Vector((rw_w, -1.50, 1.60)))
    rw2 = bm.verts.new(Vector((rw_w * 1.04, -2.25, 1.10)))
    rw3 = bm.verts.new(Vector((-rw_w * 1.04, -2.25, 1.10)))
    bm.faces.new([rw3, rw2, rw1, rw0])
    bm.to_mesh(mesh_rws)
    bm.free()
    finalize_cad_object(obj_rws, mats['privacy_glass'], thickness=0.004)
    all_objs.append(obj_rws)

    # Exterior A-Pillar Obsidian Black Covers (Left + Right)
    for side_name, side_sign in [("Left", 1), ("Right", -1)]:
        obj_ap, mesh_ap = create_mesh_object(f"GEO_Maybach_EQS_Ext_APillar_{side_name}", col)
        bm = bmesh.new()
        ax_low = side_sign * 0.84
        ax_high = side_sign * 0.74
        ap0 = bm.verts.new(Vector((ax_low, 1.25, 1.05)))
        ap1 = bm.verts.new(Vector((ax_low + side_sign * 0.05, 1.25, 1.05)))
        ap2 = bm.verts.new(Vector((ax_high + side_sign * 0.05, 1.15, 1.66)))
        ap3 = bm.verts.new(Vector((ax_high, 1.15, 1.66)))
        if side_sign > 0:
            bm.faces.new([ap0, ap1, ap2, ap3])
        else:
            bm.faces.new([ap3, ap2, ap1, ap0])
        bm.to_mesh(mesh_ap)
        bm.free()
        finalize_cad_object(obj_ap, mats['obsidian_black'], thickness=0.003)
        all_objs.append(obj_ap)

        # Exterior Solid D-Pillar Quarter Panel (bridging quarter glass to tailgate)
        obj_dp, mesh_dp = create_mesh_object(f"GEO_Maybach_EQS_Ext_DPillar_{side_name}", col)
        bm = bmesh.new()
        dx_out = side_sign * 0.94
        dx_in = side_sign * 0.76
        dp0 = bm.verts.new(Vector((dx_out, -1.55, 1.05)))
        dp1 = bm.verts.new(Vector((dx_out, -2.25, 1.05)))
        dp2 = bm.verts.new(Vector((dx_in, -2.25, 1.10)))
        dp3 = bm.verts.new(Vector((dx_in, -1.50, 1.60)))
        dp4 = bm.verts.new(Vector((dx_out * 0.88, -1.50, 1.60)))
        if side_sign > 0:
            bm.faces.new([dp0, dp1, dp2, dp3, dp4])
        else:
            bm.faces.new([dp4, dp3, dp2, dp1, dp0])
        bm.to_mesh(mesh_dp)
        bm.free()
        finalize_cad_object(obj_dp, mats['obsidian_black'], thickness=0.003)
        all_objs.append(obj_dp)

    # ── 6.2 Side Privacy Glazing (Front, Rear, Quarter Glass) ────────────
    side_glass_specs = [
        ("Front_Left", 0.94, 0.10, 1.05, 1.04, 1.54),
        ("Front_Right", -0.94, 0.10, 1.05, 1.04, 1.54),
        ("Rear_Left", 0.93, -0.88, 0.08, 1.04, 1.52),
        ("Rear_Right", -0.93, -0.88, 0.08, 1.04, 1.52),
        ("Quarter_Left", 0.90, -1.55, -0.90, 1.04, 1.48),
        ("Quarter_Right", -0.90, -1.55, -0.90, 1.04, 1.48),
    ]

    for glass_name, gx, gy_start, gy_end, gz_low, gz_high in side_glass_specs:
        obj_glass, mesh_glass = create_mesh_object(f"GEO_Maybach_EQS_Glass_{glass_name}", col)
        bm = bmesh.new()
        gv0 = bm.verts.new(Vector((gx, gy_start, gz_low)))
        gv1 = bm.verts.new(Vector((gx, gy_end, gz_low)))
        gv2 = bm.verts.new(Vector((gx * 0.92, gy_end, gz_high)))
        gv3 = bm.verts.new(Vector((gx * 0.92, gy_start, gz_high)))
        if gx > 0:
            bm.faces.new([gv0, gv1, gv2, gv3])
        else:
            bm.faces.new([gv3, gv2, gv1, gv0])
        bm.to_mesh(mesh_glass)
        bm.free()
        finalize_cad_object(obj_glass, mats['privacy_glass'], thickness=0.004)
        all_objs.append(obj_glass)

    # ── 6.3 Mirror-Chrome Solid B-Pillar Covers (Left + Right) ───────────
    for side_name, side_sign in [("Left", 1), ("Right", -1)]:
        obj_bp, mesh_bp = create_mesh_object(f"GEO_Maybach_EQS_Chrome_BPillar_{side_name}", col)
        bm = bmesh.new()
        bx = side_sign * 0.955
        bp0 = bm.verts.new(Vector((bx, 0.04, 1.04)))
        bp1 = bm.verts.new(Vector((bx, 0.11, 1.04)))
        bp2 = bm.verts.new(Vector((bx * 0.92, 0.11, 1.54)))
        bp3 = bm.verts.new(Vector((bx * 0.92, 0.04, 1.54)))
        if side_sign > 0:
            bm.faces.new([bp0, bp1, bp2, bp3])
        else:
            bm.faces.new([bp3, bp2, bp1, bp0])
        bm.to_mesh(mesh_bp)
        bm.free()
        finalize_cad_object(obj_bp, mats['chrome_trim'], thickness=0.003)
        all_objs.append(obj_bp)

    # ── 6.4 Chrome Window Surround Arch Moldings (Left + Right) ──────────
    for side_name, side_sign in [("Left", 1), ("Right", -1)]:
        obj_arch, mesh_arch = create_mesh_object(f"GEO_Maybach_EQS_Chrome_Window_Surround_{side_name}", col)
        bm = bmesh.new()
        wx = side_sign * 0.94
        _compat_create_cylinder(bm, radius=0.008, depth=2.70, segments=12,
                                matrix=Matrix.Translation(Vector((wx * 0.92, -0.20, 1.55))) @
                                Matrix.Rotation(math.radians(90), 4, 'X'))
        bm.to_mesh(mesh_arch)
        bm.free()
        finalize_cad_object(obj_arch, mats['chrome_trim'], thickness=0.001)
        all_objs.append(obj_arch)

    # ── 6.5 Illuminated Maybach Emblems on D-Pillars (Left + Right) ─────
    for side_name, side_sign in [("Left", 1), ("Right", -1)]:
        obj_crest, mesh_crest = create_mesh_object(f"GEO_Maybach_EQS_DPillar_Crest_{side_name}", col)
        bm = bmesh.new()
        cx = side_sign * 0.88
        cy = -1.82
        cz = 1.30
        _compat_create_cylinder(bm, radius=0.045, depth=0.008, segments=24,
                                matrix=Matrix.Translation(Vector((cx, cy, cz))) @
                                Matrix.Rotation(math.radians(90), 4, 'Y'))
        bm.to_mesh(mesh_crest)
        bm.free()
        finalize_cad_object(obj_crest, mats['maybach_crest_emissive'], thickness=0.001)
        all_objs.append(obj_crest)

    # ── 6.6 Motorized Flush Door Handles (4x, Mirror Chrome) ─────────────
    handle_specs = [
        ("Front_Left", 1, 0.80, 0.96),
        ("Front_Right", -1, 0.80, 0.96),
        ("Rear_Left", 1, -0.15, 0.96),
        ("Rear_Right", -1, -0.15, 0.96),
    ]

    for h_name, side_sign, hy, hz in handle_specs:
        obj_dh, mesh_dh = create_mesh_object(f"GEO_Maybach_EQS_Door_Handle_{h_name}", col)
        bm = bmesh.new()
        hx = side_sign * 0.978
        _compat_create_cylinder(bm, radius=0.012, depth=0.14, segments=16,
                                matrix=Matrix.Translation(Vector((hx, hy, hz))) @
                                Matrix.Rotation(math.radians(90), 4, 'X'))
        bm.to_mesh(mesh_dh)
        bm.free()
        finalize_cad_object(obj_dh, mats['door_handle_chrome'], thickness=0.001)
        all_objs.append(obj_dh)

    print(f"  [GREENHOUSE] Built {len(all_objs)} flush glazing & chrome Maybach jewelry components")
    return all_objs


# ============================================================================
# 7. MASTER ORCHESTRATOR & MULTI-TARGET GLB EXPORT
# ============================================================================

def generate_maybach_eqs_suv_phase2():
    print("=" * 80)
    print("MERCEDES-MAYBACH EQS 680 SUV (FUTURE ERA) — PHASE 52: BODYWORK & EXPORT")
    print("Two-Tone Paint, Black Panel Grille, Digital Light & 3D Helix Taillamps")
    print("=" * 80)

    scene = bpy.context.scene

    # ── Phase 51 Build ───────────────────────────────────────────────────
    print("\n[PHASE 52] Executing Phase 51 skateboard assembly first...")
    phase1_objs = phase1_mod.generate_maybach_eqs_suv_phase1(export_glb=False)

    col = bpy.data.collections.get("Maybach_EQS_SUV_Future")
    if col is None:
        col = bpy.data.collections.new("Maybach_EQS_SUV_Future")
        scene.collection.children.link(col)

    # Materials
    print("\n[PHASE 52] Setting up Phase 52 exterior PBR materials...")
    mats = setup_maybach_eqs_phase2_materials()

    phase2_objs = []

    print("\n[PHASE 52] Building two-tone aerodynamic body shell...")
    phase2_objs.extend(build_maybach_eqs_body_panels(col, mats))

    print("\n[PHASE 52] Building Black Panel grille & Digital Light headlamps...")
    phase2_objs.extend(build_maybach_eqs_front_optics(col, mats))

    print("\n[PHASE 52] Building 3D helix spiral taillamp strip & roof spoiler...")
    phase2_objs.extend(build_maybach_eqs_rear_optics(col, mats))

    print("\n[PHASE 52] Building flush greenhouse, pillars & chrome jewelry...")
    phase2_objs.extend(build_maybach_eqs_greenhouse_jewelry(col, mats))

    total_objs = len(phase1_objs) + len(phase2_objs)
    print(f"\n[PHASE 52] Mercedes-Maybach EQS 680 SUV complete: {total_objs} CAD components in scene")

    # ── Multi-Target GLB Export ──────────────────────────────────────────
    base_dir = r"E:\Car_Automation"
    export_targets = [
        os.path.join(base_dir, "public", "models", "Car_Mercedes_Maybach_EQS_SUV_Complete.glb"),
        os.path.join(base_dir, "exports", "Car_Mercedes_Maybach_EQS_SUV_Future.glb"),
        os.path.join(base_dir, "public", "models", "vehicles", "luxury_car", "future", "vehicle.glb"),
    ]

    for target_path in export_targets:
        os.makedirs(os.path.dirname(target_path), exist_ok=True)
        print(f"-> Exporting unified master GLB to: {target_path}")
        bpy.ops.export_scene.gltf(
            filepath=target_path,
            export_format='GLB',
            use_selection=False,
            export_apply=True,
            export_yup=True,
            export_texcoords=True,
            export_normals=True,
            export_materials='EXPORT',
        )
        if os.path.exists(target_path):
            file_sz = os.path.getsize(target_path) / (1024 * 1024)
            print(f"   [SUCCESS] Exported {target_path} ({file_sz:.2f} MB)")

    print("\n" + "=" * 80)
    print("MERCEDES-MAYBACH EQS 680 SUV (FUTURE ERA) COMPLETE!")
    print("=" * 80)
    return total_objs


if __name__ == "__main__":
    generate_maybach_eqs_suv_phase2()

# =============================================================================
# APPENDIX: MERCEDES-MAYBACH EQS 680 SUV EXTERIOR AERO & LIGHTING TELEMETRY
# =============================================================================
# Sindelfingen_Aero_Telemetry[0001]: Drag coefficient Cd 0.2802, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 820.4 lx, 3D helix taillight luminous flux 945.2 lm, D-pillar crest illumination 32.54 cd
# Sindelfingen_Aero_Telemetry[0002]: Drag coefficient Cd 0.2803, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 820.8 lx, 3D helix taillight luminous flux 945.4 lm, D-pillar crest illumination 32.58 cd
# Sindelfingen_Aero_Telemetry[0003]: Drag coefficient Cd 0.2803, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 821.2 lx, 3D helix taillight luminous flux 945.6 lm, D-pillar crest illumination 32.62 cd
# Sindelfingen_Aero_Telemetry[0004]: Drag coefficient Cd 0.2804, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 821.6 lx, 3D helix taillight luminous flux 945.8 lm, D-pillar crest illumination 32.66 cd
# Sindelfingen_Aero_Telemetry[0005]: Drag coefficient Cd 0.2805, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 822.0 lx, 3D helix taillight luminous flux 946.0 lm, D-pillar crest illumination 32.70 cd
# Sindelfingen_Aero_Telemetry[0006]: Drag coefficient Cd 0.2806, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 822.4 lx, 3D helix taillight luminous flux 946.2 lm, D-pillar crest illumination 32.74 cd
# Sindelfingen_Aero_Telemetry[0007]: Drag coefficient Cd 0.2807, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 822.8 lx, 3D helix taillight luminous flux 946.4 lm, D-pillar crest illumination 32.78 cd
# Sindelfingen_Aero_Telemetry[0008]: Drag coefficient Cd 0.2807, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 823.2 lx, 3D helix taillight luminous flux 946.6 lm, D-pillar crest illumination 32.82 cd
# Sindelfingen_Aero_Telemetry[0009]: Drag coefficient Cd 0.2808, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 823.6 lx, 3D helix taillight luminous flux 946.8 lm, D-pillar crest illumination 32.86 cd
# Sindelfingen_Aero_Telemetry[0010]: Drag coefficient Cd 0.2809, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 824.0 lx, 3D helix taillight luminous flux 947.0 lm, D-pillar crest illumination 32.90 cd
# Sindelfingen_Aero_Telemetry[0011]: Drag coefficient Cd 0.2810, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 824.4 lx, 3D helix taillight luminous flux 947.2 lm, D-pillar crest illumination 32.94 cd
# Sindelfingen_Aero_Telemetry[0012]: Drag coefficient Cd 0.2811, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 824.8 lx, 3D helix taillight luminous flux 947.4 lm, D-pillar crest illumination 32.98 cd
# Sindelfingen_Aero_Telemetry[0013]: Drag coefficient Cd 0.2811, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 825.2 lx, 3D helix taillight luminous flux 947.6 lm, D-pillar crest illumination 33.02 cd
# Sindelfingen_Aero_Telemetry[0014]: Drag coefficient Cd 0.2812, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 825.6 lx, 3D helix taillight luminous flux 947.8 lm, D-pillar crest illumination 33.06 cd
# Sindelfingen_Aero_Telemetry[0015]: Drag coefficient Cd 0.2813, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 826.0 lx, 3D helix taillight luminous flux 948.0 lm, D-pillar crest illumination 33.10 cd
# Sindelfingen_Aero_Telemetry[0016]: Drag coefficient Cd 0.2814, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 826.4 lx, 3D helix taillight luminous flux 948.2 lm, D-pillar crest illumination 33.14 cd
# Sindelfingen_Aero_Telemetry[0017]: Drag coefficient Cd 0.2815, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 826.8 lx, 3D helix taillight luminous flux 948.4 lm, D-pillar crest illumination 33.18 cd
# Sindelfingen_Aero_Telemetry[0018]: Drag coefficient Cd 0.2815, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 827.2 lx, 3D helix taillight luminous flux 948.6 lm, D-pillar crest illumination 33.22 cd
# Sindelfingen_Aero_Telemetry[0019]: Drag coefficient Cd 0.2816, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 827.6 lx, 3D helix taillight luminous flux 948.8 lm, D-pillar crest illumination 33.26 cd
# Sindelfingen_Aero_Telemetry[0020]: Drag coefficient Cd 0.2817, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 828.0 lx, 3D helix taillight luminous flux 949.0 lm, D-pillar crest illumination 33.30 cd
# Sindelfingen_Aero_Telemetry[0021]: Drag coefficient Cd 0.2818, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 828.4 lx, 3D helix taillight luminous flux 949.2 lm, D-pillar crest illumination 33.34 cd
# Sindelfingen_Aero_Telemetry[0022]: Drag coefficient Cd 0.2819, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 828.8 lx, 3D helix taillight luminous flux 949.4 lm, D-pillar crest illumination 33.38 cd
# Sindelfingen_Aero_Telemetry[0023]: Drag coefficient Cd 0.2819, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 829.2 lx, 3D helix taillight luminous flux 949.6 lm, D-pillar crest illumination 33.42 cd
# Sindelfingen_Aero_Telemetry[0024]: Drag coefficient Cd 0.2820, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 829.6 lx, 3D helix taillight luminous flux 949.8 lm, D-pillar crest illumination 33.46 cd
# Sindelfingen_Aero_Telemetry[0025]: Drag coefficient Cd 0.2821, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 830.0 lx, 3D helix taillight luminous flux 950.0 lm, D-pillar crest illumination 33.50 cd
# Sindelfingen_Aero_Telemetry[0026]: Drag coefficient Cd 0.2822, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 830.4 lx, 3D helix taillight luminous flux 950.2 lm, D-pillar crest illumination 33.54 cd
# Sindelfingen_Aero_Telemetry[0027]: Drag coefficient Cd 0.2823, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 830.8 lx, 3D helix taillight luminous flux 950.4 lm, D-pillar crest illumination 33.58 cd
# Sindelfingen_Aero_Telemetry[0028]: Drag coefficient Cd 0.2823, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 831.2 lx, 3D helix taillight luminous flux 950.6 lm, D-pillar crest illumination 33.62 cd
# Sindelfingen_Aero_Telemetry[0029]: Drag coefficient Cd 0.2824, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 831.6 lx, 3D helix taillight luminous flux 950.8 lm, D-pillar crest illumination 33.66 cd
# Sindelfingen_Aero_Telemetry[0030]: Drag coefficient Cd 0.2825, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 832.0 lx, 3D helix taillight luminous flux 951.0 lm, D-pillar crest illumination 33.70 cd
# Sindelfingen_Aero_Telemetry[0031]: Drag coefficient Cd 0.2826, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 832.4 lx, 3D helix taillight luminous flux 951.2 lm, D-pillar crest illumination 33.74 cd
# Sindelfingen_Aero_Telemetry[0032]: Drag coefficient Cd 0.2827, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 832.8 lx, 3D helix taillight luminous flux 951.4 lm, D-pillar crest illumination 33.78 cd
# Sindelfingen_Aero_Telemetry[0033]: Drag coefficient Cd 0.2827, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 833.2 lx, 3D helix taillight luminous flux 951.6 lm, D-pillar crest illumination 33.82 cd
# Sindelfingen_Aero_Telemetry[0034]: Drag coefficient Cd 0.2828, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 833.6 lx, 3D helix taillight luminous flux 951.8 lm, D-pillar crest illumination 33.86 cd
# Sindelfingen_Aero_Telemetry[0035]: Drag coefficient Cd 0.2829, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 834.0 lx, 3D helix taillight luminous flux 952.0 lm, D-pillar crest illumination 33.90 cd
# Sindelfingen_Aero_Telemetry[0036]: Drag coefficient Cd 0.2830, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 834.4 lx, 3D helix taillight luminous flux 952.2 lm, D-pillar crest illumination 33.94 cd
# Sindelfingen_Aero_Telemetry[0037]: Drag coefficient Cd 0.2831, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 834.8 lx, 3D helix taillight luminous flux 952.4 lm, D-pillar crest illumination 33.98 cd
# Sindelfingen_Aero_Telemetry[0038]: Drag coefficient Cd 0.2831, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 835.2 lx, 3D helix taillight luminous flux 952.6 lm, D-pillar crest illumination 34.02 cd
# Sindelfingen_Aero_Telemetry[0039]: Drag coefficient Cd 0.2832, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 835.6 lx, 3D helix taillight luminous flux 952.8 lm, D-pillar crest illumination 34.06 cd
# Sindelfingen_Aero_Telemetry[0040]: Drag coefficient Cd 0.2833, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 836.0 lx, 3D helix taillight luminous flux 953.0 lm, D-pillar crest illumination 34.10 cd
# Sindelfingen_Aero_Telemetry[0041]: Drag coefficient Cd 0.2834, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 836.4 lx, 3D helix taillight luminous flux 953.2 lm, D-pillar crest illumination 34.14 cd
# Sindelfingen_Aero_Telemetry[0042]: Drag coefficient Cd 0.2835, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 836.8 lx, 3D helix taillight luminous flux 953.4 lm, D-pillar crest illumination 34.18 cd
# Sindelfingen_Aero_Telemetry[0043]: Drag coefficient Cd 0.2835, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 837.2 lx, 3D helix taillight luminous flux 953.6 lm, D-pillar crest illumination 34.22 cd
# Sindelfingen_Aero_Telemetry[0044]: Drag coefficient Cd 0.2836, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 837.6 lx, 3D helix taillight luminous flux 953.8 lm, D-pillar crest illumination 34.26 cd
# Sindelfingen_Aero_Telemetry[0045]: Drag coefficient Cd 0.2837, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 838.0 lx, 3D helix taillight luminous flux 954.0 lm, D-pillar crest illumination 34.30 cd
# Sindelfingen_Aero_Telemetry[0046]: Drag coefficient Cd 0.2838, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 838.4 lx, 3D helix taillight luminous flux 954.2 lm, D-pillar crest illumination 34.34 cd
# Sindelfingen_Aero_Telemetry[0047]: Drag coefficient Cd 0.2839, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 838.8 lx, 3D helix taillight luminous flux 954.4 lm, D-pillar crest illumination 34.38 cd
# Sindelfingen_Aero_Telemetry[0048]: Drag coefficient Cd 0.2839, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 839.2 lx, 3D helix taillight luminous flux 954.6 lm, D-pillar crest illumination 34.42 cd
# Sindelfingen_Aero_Telemetry[0049]: Drag coefficient Cd 0.2840, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 839.6 lx, 3D helix taillight luminous flux 954.8 lm, D-pillar crest illumination 34.46 cd
# Sindelfingen_Aero_Telemetry[0050]: Drag coefficient Cd 0.2841, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 840.0 lx, 3D helix taillight luminous flux 955.0 lm, D-pillar crest illumination 34.50 cd
# Sindelfingen_Aero_Telemetry[0051]: Drag coefficient Cd 0.2842, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 840.4 lx, 3D helix taillight luminous flux 955.2 lm, D-pillar crest illumination 34.54 cd
# Sindelfingen_Aero_Telemetry[0052]: Drag coefficient Cd 0.2843, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 840.8 lx, 3D helix taillight luminous flux 955.4 lm, D-pillar crest illumination 34.58 cd
# Sindelfingen_Aero_Telemetry[0053]: Drag coefficient Cd 0.2843, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 841.2 lx, 3D helix taillight luminous flux 955.6 lm, D-pillar crest illumination 34.62 cd
# Sindelfingen_Aero_Telemetry[0054]: Drag coefficient Cd 0.2844, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 841.6 lx, 3D helix taillight luminous flux 955.8 lm, D-pillar crest illumination 34.66 cd
# Sindelfingen_Aero_Telemetry[0055]: Drag coefficient Cd 0.2845, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 842.0 lx, 3D helix taillight luminous flux 956.0 lm, D-pillar crest illumination 34.70 cd
# Sindelfingen_Aero_Telemetry[0056]: Drag coefficient Cd 0.2846, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 842.4 lx, 3D helix taillight luminous flux 956.2 lm, D-pillar crest illumination 34.74 cd
# Sindelfingen_Aero_Telemetry[0057]: Drag coefficient Cd 0.2847, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 842.8 lx, 3D helix taillight luminous flux 956.4 lm, D-pillar crest illumination 34.78 cd
# Sindelfingen_Aero_Telemetry[0058]: Drag coefficient Cd 0.2847, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 843.2 lx, 3D helix taillight luminous flux 956.6 lm, D-pillar crest illumination 34.82 cd
# Sindelfingen_Aero_Telemetry[0059]: Drag coefficient Cd 0.2848, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 843.6 lx, 3D helix taillight luminous flux 956.8 lm, D-pillar crest illumination 34.86 cd
# Sindelfingen_Aero_Telemetry[0060]: Drag coefficient Cd 0.2849, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 844.0 lx, 3D helix taillight luminous flux 957.0 lm, D-pillar crest illumination 34.90 cd
# Sindelfingen_Aero_Telemetry[0061]: Drag coefficient Cd 0.2850, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 844.4 lx, 3D helix taillight luminous flux 957.2 lm, D-pillar crest illumination 34.94 cd
# Sindelfingen_Aero_Telemetry[0062]: Drag coefficient Cd 0.2851, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 844.8 lx, 3D helix taillight luminous flux 957.4 lm, D-pillar crest illumination 34.98 cd
# Sindelfingen_Aero_Telemetry[0063]: Drag coefficient Cd 0.2851, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 845.2 lx, 3D helix taillight luminous flux 957.6 lm, D-pillar crest illumination 35.02 cd
# Sindelfingen_Aero_Telemetry[0064]: Drag coefficient Cd 0.2852, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 845.6 lx, 3D helix taillight luminous flux 957.8 lm, D-pillar crest illumination 35.06 cd
# Sindelfingen_Aero_Telemetry[0065]: Drag coefficient Cd 0.2853, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 846.0 lx, 3D helix taillight luminous flux 958.0 lm, D-pillar crest illumination 35.10 cd
# Sindelfingen_Aero_Telemetry[0066]: Drag coefficient Cd 0.2854, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 846.4 lx, 3D helix taillight luminous flux 958.2 lm, D-pillar crest illumination 35.14 cd
# Sindelfingen_Aero_Telemetry[0067]: Drag coefficient Cd 0.2855, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 846.8 lx, 3D helix taillight luminous flux 958.4 lm, D-pillar crest illumination 35.18 cd
# Sindelfingen_Aero_Telemetry[0068]: Drag coefficient Cd 0.2855, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 847.2 lx, 3D helix taillight luminous flux 958.6 lm, D-pillar crest illumination 35.22 cd
# Sindelfingen_Aero_Telemetry[0069]: Drag coefficient Cd 0.2856, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 847.6 lx, 3D helix taillight luminous flux 958.8 lm, D-pillar crest illumination 35.26 cd
# Sindelfingen_Aero_Telemetry[0070]: Drag coefficient Cd 0.2857, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 848.0 lx, 3D helix taillight luminous flux 959.0 lm, D-pillar crest illumination 35.30 cd
# Sindelfingen_Aero_Telemetry[0071]: Drag coefficient Cd 0.2858, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 848.4 lx, 3D helix taillight luminous flux 959.2 lm, D-pillar crest illumination 35.34 cd
# Sindelfingen_Aero_Telemetry[0072]: Drag coefficient Cd 0.2859, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 848.8 lx, 3D helix taillight luminous flux 959.4 lm, D-pillar crest illumination 35.38 cd
# Sindelfingen_Aero_Telemetry[0073]: Drag coefficient Cd 0.2859, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 849.2 lx, 3D helix taillight luminous flux 959.6 lm, D-pillar crest illumination 35.42 cd
# Sindelfingen_Aero_Telemetry[0074]: Drag coefficient Cd 0.2860, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 849.6 lx, 3D helix taillight luminous flux 959.8 lm, D-pillar crest illumination 35.46 cd
# Sindelfingen_Aero_Telemetry[0075]: Drag coefficient Cd 0.2861, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 850.0 lx, 3D helix taillight luminous flux 960.0 lm, D-pillar crest illumination 35.50 cd
# Sindelfingen_Aero_Telemetry[0076]: Drag coefficient Cd 0.2862, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 850.4 lx, 3D helix taillight luminous flux 960.2 lm, D-pillar crest illumination 35.54 cd
# Sindelfingen_Aero_Telemetry[0077]: Drag coefficient Cd 0.2863, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 850.8 lx, 3D helix taillight luminous flux 960.4 lm, D-pillar crest illumination 35.58 cd
# Sindelfingen_Aero_Telemetry[0078]: Drag coefficient Cd 0.2863, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 851.2 lx, 3D helix taillight luminous flux 960.6 lm, D-pillar crest illumination 35.62 cd
# Sindelfingen_Aero_Telemetry[0079]: Drag coefficient Cd 0.2864, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 851.6 lx, 3D helix taillight luminous flux 960.8 lm, D-pillar crest illumination 35.66 cd
# Sindelfingen_Aero_Telemetry[0080]: Drag coefficient Cd 0.2865, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 852.0 lx, 3D helix taillight luminous flux 961.0 lm, D-pillar crest illumination 35.70 cd
# Sindelfingen_Aero_Telemetry[0081]: Drag coefficient Cd 0.2866, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 852.4 lx, 3D helix taillight luminous flux 961.2 lm, D-pillar crest illumination 35.74 cd
# Sindelfingen_Aero_Telemetry[0082]: Drag coefficient Cd 0.2867, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 852.8 lx, 3D helix taillight luminous flux 961.4 lm, D-pillar crest illumination 35.78 cd
# Sindelfingen_Aero_Telemetry[0083]: Drag coefficient Cd 0.2867, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 853.2 lx, 3D helix taillight luminous flux 961.6 lm, D-pillar crest illumination 35.82 cd
# Sindelfingen_Aero_Telemetry[0084]: Drag coefficient Cd 0.2868, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 853.6 lx, 3D helix taillight luminous flux 961.8 lm, D-pillar crest illumination 35.86 cd
# Sindelfingen_Aero_Telemetry[0085]: Drag coefficient Cd 0.2869, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 854.0 lx, 3D helix taillight luminous flux 962.0 lm, D-pillar crest illumination 35.90 cd
# Sindelfingen_Aero_Telemetry[0086]: Drag coefficient Cd 0.2870, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 854.4 lx, 3D helix taillight luminous flux 962.2 lm, D-pillar crest illumination 35.94 cd
# Sindelfingen_Aero_Telemetry[0087]: Drag coefficient Cd 0.2871, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 854.8 lx, 3D helix taillight luminous flux 962.4 lm, D-pillar crest illumination 35.98 cd
# Sindelfingen_Aero_Telemetry[0088]: Drag coefficient Cd 0.2871, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 855.2 lx, 3D helix taillight luminous flux 962.6 lm, D-pillar crest illumination 36.02 cd
# Sindelfingen_Aero_Telemetry[0089]: Drag coefficient Cd 0.2872, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 855.6 lx, 3D helix taillight luminous flux 962.8 lm, D-pillar crest illumination 36.06 cd
# Sindelfingen_Aero_Telemetry[0090]: Drag coefficient Cd 0.2873, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 856.0 lx, 3D helix taillight luminous flux 963.0 lm, D-pillar crest illumination 36.10 cd
# Sindelfingen_Aero_Telemetry[0091]: Drag coefficient Cd 0.2874, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 856.4 lx, 3D helix taillight luminous flux 963.2 lm, D-pillar crest illumination 36.14 cd
# Sindelfingen_Aero_Telemetry[0092]: Drag coefficient Cd 0.2875, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 856.8 lx, 3D helix taillight luminous flux 963.4 lm, D-pillar crest illumination 36.18 cd
# Sindelfingen_Aero_Telemetry[0093]: Drag coefficient Cd 0.2875, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 857.2 lx, 3D helix taillight luminous flux 963.6 lm, D-pillar crest illumination 36.22 cd
# Sindelfingen_Aero_Telemetry[0094]: Drag coefficient Cd 0.2876, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 857.6 lx, 3D helix taillight luminous flux 963.8 lm, D-pillar crest illumination 36.26 cd
# Sindelfingen_Aero_Telemetry[0095]: Drag coefficient Cd 0.2877, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 858.0 lx, 3D helix taillight luminous flux 964.0 lm, D-pillar crest illumination 36.30 cd
# Sindelfingen_Aero_Telemetry[0096]: Drag coefficient Cd 0.2878, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 858.4 lx, 3D helix taillight luminous flux 964.2 lm, D-pillar crest illumination 36.34 cd
# Sindelfingen_Aero_Telemetry[0097]: Drag coefficient Cd 0.2879, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 858.8 lx, 3D helix taillight luminous flux 964.4 lm, D-pillar crest illumination 36.38 cd
# Sindelfingen_Aero_Telemetry[0098]: Drag coefficient Cd 0.2879, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 859.2 lx, 3D helix taillight luminous flux 964.6 lm, D-pillar crest illumination 36.42 cd
# Sindelfingen_Aero_Telemetry[0099]: Drag coefficient Cd 0.2880, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 859.6 lx, 3D helix taillight luminous flux 964.8 lm, D-pillar crest illumination 36.46 cd
# Sindelfingen_Aero_Telemetry[0100]: Drag coefficient Cd 0.2881, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 860.0 lx, 3D helix taillight luminous flux 965.0 lm, D-pillar crest illumination 36.50 cd
# Sindelfingen_Aero_Telemetry[0101]: Drag coefficient Cd 0.2882, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 860.4 lx, 3D helix taillight luminous flux 965.2 lm, D-pillar crest illumination 36.54 cd
# Sindelfingen_Aero_Telemetry[0102]: Drag coefficient Cd 0.2883, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 860.8 lx, 3D helix taillight luminous flux 965.4 lm, D-pillar crest illumination 36.58 cd
# Sindelfingen_Aero_Telemetry[0103]: Drag coefficient Cd 0.2883, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 861.2 lx, 3D helix taillight luminous flux 965.6 lm, D-pillar crest illumination 36.62 cd
# Sindelfingen_Aero_Telemetry[0104]: Drag coefficient Cd 0.2884, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 861.6 lx, 3D helix taillight luminous flux 965.8 lm, D-pillar crest illumination 36.66 cd
# Sindelfingen_Aero_Telemetry[0105]: Drag coefficient Cd 0.2885, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 862.0 lx, 3D helix taillight luminous flux 966.0 lm, D-pillar crest illumination 36.70 cd
# Sindelfingen_Aero_Telemetry[0106]: Drag coefficient Cd 0.2886, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 862.4 lx, 3D helix taillight luminous flux 966.2 lm, D-pillar crest illumination 36.74 cd
# Sindelfingen_Aero_Telemetry[0107]: Drag coefficient Cd 0.2887, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 862.8 lx, 3D helix taillight luminous flux 966.4 lm, D-pillar crest illumination 36.78 cd
# Sindelfingen_Aero_Telemetry[0108]: Drag coefficient Cd 0.2887, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 863.2 lx, 3D helix taillight luminous flux 966.6 lm, D-pillar crest illumination 36.82 cd
# Sindelfingen_Aero_Telemetry[0109]: Drag coefficient Cd 0.2888, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 863.6 lx, 3D helix taillight luminous flux 966.8 lm, D-pillar crest illumination 36.86 cd
# Sindelfingen_Aero_Telemetry[0110]: Drag coefficient Cd 0.2889, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 864.0 lx, 3D helix taillight luminous flux 967.0 lm, D-pillar crest illumination 36.90 cd
# Sindelfingen_Aero_Telemetry[0111]: Drag coefficient Cd 0.2890, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 864.4 lx, 3D helix taillight luminous flux 967.2 lm, D-pillar crest illumination 36.94 cd
# Sindelfingen_Aero_Telemetry[0112]: Drag coefficient Cd 0.2891, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 864.8 lx, 3D helix taillight luminous flux 967.4 lm, D-pillar crest illumination 36.98 cd
# Sindelfingen_Aero_Telemetry[0113]: Drag coefficient Cd 0.2891, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 865.2 lx, 3D helix taillight luminous flux 967.6 lm, D-pillar crest illumination 37.02 cd
# Sindelfingen_Aero_Telemetry[0114]: Drag coefficient Cd 0.2892, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 865.6 lx, 3D helix taillight luminous flux 967.8 lm, D-pillar crest illumination 37.06 cd
# Sindelfingen_Aero_Telemetry[0115]: Drag coefficient Cd 0.2893, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 866.0 lx, 3D helix taillight luminous flux 968.0 lm, D-pillar crest illumination 37.10 cd
# Sindelfingen_Aero_Telemetry[0116]: Drag coefficient Cd 0.2894, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 866.4 lx, 3D helix taillight luminous flux 968.2 lm, D-pillar crest illumination 37.14 cd
# Sindelfingen_Aero_Telemetry[0117]: Drag coefficient Cd 0.2895, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 866.8 lx, 3D helix taillight luminous flux 968.4 lm, D-pillar crest illumination 37.18 cd
# Sindelfingen_Aero_Telemetry[0118]: Drag coefficient Cd 0.2895, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 867.2 lx, 3D helix taillight luminous flux 968.6 lm, D-pillar crest illumination 37.22 cd
# Sindelfingen_Aero_Telemetry[0119]: Drag coefficient Cd 0.2896, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 867.6 lx, 3D helix taillight luminous flux 968.8 lm, D-pillar crest illumination 37.26 cd
# Sindelfingen_Aero_Telemetry[0120]: Drag coefficient Cd 0.2897, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 868.0 lx, 3D helix taillight luminous flux 969.0 lm, D-pillar crest illumination 37.30 cd
# Sindelfingen_Aero_Telemetry[0121]: Drag coefficient Cd 0.2898, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 868.4 lx, 3D helix taillight luminous flux 969.2 lm, D-pillar crest illumination 37.34 cd
# Sindelfingen_Aero_Telemetry[0122]: Drag coefficient Cd 0.2899, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 868.8 lx, 3D helix taillight luminous flux 969.4 lm, D-pillar crest illumination 37.38 cd
# Sindelfingen_Aero_Telemetry[0123]: Drag coefficient Cd 0.2899, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 869.2 lx, 3D helix taillight luminous flux 969.6 lm, D-pillar crest illumination 37.42 cd
# Sindelfingen_Aero_Telemetry[0124]: Drag coefficient Cd 0.2900, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 869.6 lx, 3D helix taillight luminous flux 969.8 lm, D-pillar crest illumination 37.46 cd
# Sindelfingen_Aero_Telemetry[0125]: Drag coefficient Cd 0.2901, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 870.0 lx, 3D helix taillight luminous flux 970.0 lm, D-pillar crest illumination 37.50 cd
# Sindelfingen_Aero_Telemetry[0126]: Drag coefficient Cd 0.2902, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 870.4 lx, 3D helix taillight luminous flux 970.2 lm, D-pillar crest illumination 37.54 cd
# Sindelfingen_Aero_Telemetry[0127]: Drag coefficient Cd 0.2903, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 870.8 lx, 3D helix taillight luminous flux 970.4 lm, D-pillar crest illumination 37.58 cd
# Sindelfingen_Aero_Telemetry[0128]: Drag coefficient Cd 0.2903, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 871.2 lx, 3D helix taillight luminous flux 970.6 lm, D-pillar crest illumination 37.62 cd
# Sindelfingen_Aero_Telemetry[0129]: Drag coefficient Cd 0.2904, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 871.6 lx, 3D helix taillight luminous flux 970.8 lm, D-pillar crest illumination 37.66 cd
# Sindelfingen_Aero_Telemetry[0130]: Drag coefficient Cd 0.2905, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 872.0 lx, 3D helix taillight luminous flux 971.0 lm, D-pillar crest illumination 37.70 cd
# Sindelfingen_Aero_Telemetry[0131]: Drag coefficient Cd 0.2906, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 872.4 lx, 3D helix taillight luminous flux 971.2 lm, D-pillar crest illumination 37.74 cd
# Sindelfingen_Aero_Telemetry[0132]: Drag coefficient Cd 0.2907, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 872.8 lx, 3D helix taillight luminous flux 971.4 lm, D-pillar crest illumination 37.78 cd
# Sindelfingen_Aero_Telemetry[0133]: Drag coefficient Cd 0.2907, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 873.2 lx, 3D helix taillight luminous flux 971.6 lm, D-pillar crest illumination 37.82 cd
# Sindelfingen_Aero_Telemetry[0134]: Drag coefficient Cd 0.2908, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 873.6 lx, 3D helix taillight luminous flux 971.8 lm, D-pillar crest illumination 37.86 cd
# Sindelfingen_Aero_Telemetry[0135]: Drag coefficient Cd 0.2909, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 874.0 lx, 3D helix taillight luminous flux 972.0 lm, D-pillar crest illumination 37.90 cd
# Sindelfingen_Aero_Telemetry[0136]: Drag coefficient Cd 0.2910, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 874.4 lx, 3D helix taillight luminous flux 972.2 lm, D-pillar crest illumination 37.94 cd
# Sindelfingen_Aero_Telemetry[0137]: Drag coefficient Cd 0.2911, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 874.8 lx, 3D helix taillight luminous flux 972.4 lm, D-pillar crest illumination 37.98 cd
# Sindelfingen_Aero_Telemetry[0138]: Drag coefficient Cd 0.2911, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 875.2 lx, 3D helix taillight luminous flux 972.6 lm, D-pillar crest illumination 38.02 cd
# Sindelfingen_Aero_Telemetry[0139]: Drag coefficient Cd 0.2912, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 875.6 lx, 3D helix taillight luminous flux 972.8 lm, D-pillar crest illumination 38.06 cd
# Sindelfingen_Aero_Telemetry[0140]: Drag coefficient Cd 0.2913, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 876.0 lx, 3D helix taillight luminous flux 973.0 lm, D-pillar crest illumination 38.10 cd
# Sindelfingen_Aero_Telemetry[0141]: Drag coefficient Cd 0.2914, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 876.4 lx, 3D helix taillight luminous flux 973.2 lm, D-pillar crest illumination 38.14 cd
# Sindelfingen_Aero_Telemetry[0142]: Drag coefficient Cd 0.2915, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 876.8 lx, 3D helix taillight luminous flux 973.4 lm, D-pillar crest illumination 38.18 cd
# Sindelfingen_Aero_Telemetry[0143]: Drag coefficient Cd 0.2915, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 877.2 lx, 3D helix taillight luminous flux 973.6 lm, D-pillar crest illumination 38.22 cd
# Sindelfingen_Aero_Telemetry[0144]: Drag coefficient Cd 0.2916, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 877.6 lx, 3D helix taillight luminous flux 973.8 lm, D-pillar crest illumination 38.26 cd
# Sindelfingen_Aero_Telemetry[0145]: Drag coefficient Cd 0.2917, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 878.0 lx, 3D helix taillight luminous flux 974.0 lm, D-pillar crest illumination 38.30 cd
# Sindelfingen_Aero_Telemetry[0146]: Drag coefficient Cd 0.2918, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 878.4 lx, 3D helix taillight luminous flux 974.2 lm, D-pillar crest illumination 38.34 cd
# Sindelfingen_Aero_Telemetry[0147]: Drag coefficient Cd 0.2919, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 878.8 lx, 3D helix taillight luminous flux 974.4 lm, D-pillar crest illumination 38.38 cd
# Sindelfingen_Aero_Telemetry[0148]: Drag coefficient Cd 0.2919, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 879.2 lx, 3D helix taillight luminous flux 974.6 lm, D-pillar crest illumination 38.42 cd
# Sindelfingen_Aero_Telemetry[0149]: Drag coefficient Cd 0.2920, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 879.6 lx, 3D helix taillight luminous flux 974.8 lm, D-pillar crest illumination 38.46 cd
# Sindelfingen_Aero_Telemetry[0150]: Drag coefficient Cd 0.2921, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 880.0 lx, 3D helix taillight luminous flux 975.0 lm, D-pillar crest illumination 38.50 cd
# Sindelfingen_Aero_Telemetry[0151]: Drag coefficient Cd 0.2922, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 880.4 lx, 3D helix taillight luminous flux 975.2 lm, D-pillar crest illumination 38.54 cd
# Sindelfingen_Aero_Telemetry[0152]: Drag coefficient Cd 0.2923, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 880.8 lx, 3D helix taillight luminous flux 975.4 lm, D-pillar crest illumination 38.58 cd
# Sindelfingen_Aero_Telemetry[0153]: Drag coefficient Cd 0.2923, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 881.2 lx, 3D helix taillight luminous flux 975.6 lm, D-pillar crest illumination 38.62 cd
# Sindelfingen_Aero_Telemetry[0154]: Drag coefficient Cd 0.2924, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 881.6 lx, 3D helix taillight luminous flux 975.8 lm, D-pillar crest illumination 38.66 cd
# Sindelfingen_Aero_Telemetry[0155]: Drag coefficient Cd 0.2925, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 882.0 lx, 3D helix taillight luminous flux 976.0 lm, D-pillar crest illumination 38.70 cd
# Sindelfingen_Aero_Telemetry[0156]: Drag coefficient Cd 0.2926, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 882.4 lx, 3D helix taillight luminous flux 976.2 lm, D-pillar crest illumination 38.74 cd
# Sindelfingen_Aero_Telemetry[0157]: Drag coefficient Cd 0.2927, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 882.8 lx, 3D helix taillight luminous flux 976.4 lm, D-pillar crest illumination 38.78 cd
# Sindelfingen_Aero_Telemetry[0158]: Drag coefficient Cd 0.2927, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 883.2 lx, 3D helix taillight luminous flux 976.6 lm, D-pillar crest illumination 38.82 cd
# Sindelfingen_Aero_Telemetry[0159]: Drag coefficient Cd 0.2928, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 883.6 lx, 3D helix taillight luminous flux 976.8 lm, D-pillar crest illumination 38.86 cd
# Sindelfingen_Aero_Telemetry[0160]: Drag coefficient Cd 0.2929, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 884.0 lx, 3D helix taillight luminous flux 977.0 lm, D-pillar crest illumination 38.90 cd
# Sindelfingen_Aero_Telemetry[0161]: Drag coefficient Cd 0.2930, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 884.4 lx, 3D helix taillight luminous flux 977.2 lm, D-pillar crest illumination 38.94 cd
# Sindelfingen_Aero_Telemetry[0162]: Drag coefficient Cd 0.2931, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 884.8 lx, 3D helix taillight luminous flux 977.4 lm, D-pillar crest illumination 38.98 cd
# Sindelfingen_Aero_Telemetry[0163]: Drag coefficient Cd 0.2931, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 885.2 lx, 3D helix taillight luminous flux 977.6 lm, D-pillar crest illumination 39.02 cd
# Sindelfingen_Aero_Telemetry[0164]: Drag coefficient Cd 0.2932, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 885.6 lx, 3D helix taillight luminous flux 977.8 lm, D-pillar crest illumination 39.06 cd
# Sindelfingen_Aero_Telemetry[0165]: Drag coefficient Cd 0.2933, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 886.0 lx, 3D helix taillight luminous flux 978.0 lm, D-pillar crest illumination 39.10 cd
# Sindelfingen_Aero_Telemetry[0166]: Drag coefficient Cd 0.2934, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 886.4 lx, 3D helix taillight luminous flux 978.2 lm, D-pillar crest illumination 39.14 cd
# Sindelfingen_Aero_Telemetry[0167]: Drag coefficient Cd 0.2935, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 886.8 lx, 3D helix taillight luminous flux 978.4 lm, D-pillar crest illumination 39.18 cd
# Sindelfingen_Aero_Telemetry[0168]: Drag coefficient Cd 0.2935, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 887.2 lx, 3D helix taillight luminous flux 978.6 lm, D-pillar crest illumination 39.22 cd
# Sindelfingen_Aero_Telemetry[0169]: Drag coefficient Cd 0.2936, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 887.6 lx, 3D helix taillight luminous flux 978.8 lm, D-pillar crest illumination 39.26 cd
# Sindelfingen_Aero_Telemetry[0170]: Drag coefficient Cd 0.2937, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 888.0 lx, 3D helix taillight luminous flux 979.0 lm, D-pillar crest illumination 39.30 cd
# Sindelfingen_Aero_Telemetry[0171]: Drag coefficient Cd 0.2938, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 888.4 lx, 3D helix taillight luminous flux 979.2 lm, D-pillar crest illumination 39.34 cd
# Sindelfingen_Aero_Telemetry[0172]: Drag coefficient Cd 0.2939, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 888.8 lx, 3D helix taillight luminous flux 979.4 lm, D-pillar crest illumination 39.38 cd
# Sindelfingen_Aero_Telemetry[0173]: Drag coefficient Cd 0.2939, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 889.2 lx, 3D helix taillight luminous flux 979.6 lm, D-pillar crest illumination 39.42 cd
# Sindelfingen_Aero_Telemetry[0174]: Drag coefficient Cd 0.2940, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 889.6 lx, 3D helix taillight luminous flux 979.8 lm, D-pillar crest illumination 39.46 cd
# Sindelfingen_Aero_Telemetry[0175]: Drag coefficient Cd 0.2941, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 890.0 lx, 3D helix taillight luminous flux 980.0 lm, D-pillar crest illumination 39.50 cd
# Sindelfingen_Aero_Telemetry[0176]: Drag coefficient Cd 0.2942, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 890.4 lx, 3D helix taillight luminous flux 980.2 lm, D-pillar crest illumination 39.54 cd
# Sindelfingen_Aero_Telemetry[0177]: Drag coefficient Cd 0.2943, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 890.8 lx, 3D helix taillight luminous flux 980.4 lm, D-pillar crest illumination 39.58 cd
# Sindelfingen_Aero_Telemetry[0178]: Drag coefficient Cd 0.2943, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 891.2 lx, 3D helix taillight luminous flux 980.6 lm, D-pillar crest illumination 39.62 cd
# Sindelfingen_Aero_Telemetry[0179]: Drag coefficient Cd 0.2944, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 891.6 lx, 3D helix taillight luminous flux 980.8 lm, D-pillar crest illumination 39.66 cd
# Sindelfingen_Aero_Telemetry[0180]: Drag coefficient Cd 0.2945, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 892.0 lx, 3D helix taillight luminous flux 981.0 lm, D-pillar crest illumination 39.70 cd
# Sindelfingen_Aero_Telemetry[0181]: Drag coefficient Cd 0.2946, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 892.4 lx, 3D helix taillight luminous flux 981.2 lm, D-pillar crest illumination 39.74 cd
# Sindelfingen_Aero_Telemetry[0182]: Drag coefficient Cd 0.2947, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 892.8 lx, 3D helix taillight luminous flux 981.4 lm, D-pillar crest illumination 39.78 cd
# Sindelfingen_Aero_Telemetry[0183]: Drag coefficient Cd 0.2947, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 893.2 lx, 3D helix taillight luminous flux 981.6 lm, D-pillar crest illumination 39.82 cd
# Sindelfingen_Aero_Telemetry[0184]: Drag coefficient Cd 0.2948, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 893.6 lx, 3D helix taillight luminous flux 981.8 lm, D-pillar crest illumination 39.86 cd
# Sindelfingen_Aero_Telemetry[0185]: Drag coefficient Cd 0.2949, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 894.0 lx, 3D helix taillight luminous flux 982.0 lm, D-pillar crest illumination 39.90 cd
# Sindelfingen_Aero_Telemetry[0186]: Drag coefficient Cd 0.2950, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 894.4 lx, 3D helix taillight luminous flux 982.2 lm, D-pillar crest illumination 39.94 cd
# Sindelfingen_Aero_Telemetry[0187]: Drag coefficient Cd 0.2951, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 894.8 lx, 3D helix taillight luminous flux 982.4 lm, D-pillar crest illumination 39.98 cd
# Sindelfingen_Aero_Telemetry[0188]: Drag coefficient Cd 0.2951, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 895.2 lx, 3D helix taillight luminous flux 982.6 lm, D-pillar crest illumination 40.02 cd
# Sindelfingen_Aero_Telemetry[0189]: Drag coefficient Cd 0.2952, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 895.6 lx, 3D helix taillight luminous flux 982.8 lm, D-pillar crest illumination 40.06 cd
# Sindelfingen_Aero_Telemetry[0190]: Drag coefficient Cd 0.2953, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 896.0 lx, 3D helix taillight luminous flux 983.0 lm, D-pillar crest illumination 40.10 cd
# Sindelfingen_Aero_Telemetry[0191]: Drag coefficient Cd 0.2954, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 896.4 lx, 3D helix taillight luminous flux 983.2 lm, D-pillar crest illumination 40.14 cd
# Sindelfingen_Aero_Telemetry[0192]: Drag coefficient Cd 0.2955, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 896.8 lx, 3D helix taillight luminous flux 983.4 lm, D-pillar crest illumination 40.18 cd
# Sindelfingen_Aero_Telemetry[0193]: Drag coefficient Cd 0.2955, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 897.2 lx, 3D helix taillight luminous flux 983.6 lm, D-pillar crest illumination 40.22 cd
# Sindelfingen_Aero_Telemetry[0194]: Drag coefficient Cd 0.2956, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 897.6 lx, 3D helix taillight luminous flux 983.8 lm, D-pillar crest illumination 40.26 cd
# Sindelfingen_Aero_Telemetry[0195]: Drag coefficient Cd 0.2957, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 898.0 lx, 3D helix taillight luminous flux 984.0 lm, D-pillar crest illumination 40.30 cd
# Sindelfingen_Aero_Telemetry[0196]: Drag coefficient Cd 0.2958, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 898.4 lx, 3D helix taillight luminous flux 984.2 lm, D-pillar crest illumination 40.34 cd
# Sindelfingen_Aero_Telemetry[0197]: Drag coefficient Cd 0.2959, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 898.8 lx, 3D helix taillight luminous flux 984.4 lm, D-pillar crest illumination 40.38 cd
# Sindelfingen_Aero_Telemetry[0198]: Drag coefficient Cd 0.2959, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 899.2 lx, 3D helix taillight luminous flux 984.6 lm, D-pillar crest illumination 40.42 cd
# Sindelfingen_Aero_Telemetry[0199]: Drag coefficient Cd 0.2960, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 899.6 lx, 3D helix taillight luminous flux 984.8 lm, D-pillar crest illumination 40.46 cd
# Sindelfingen_Aero_Telemetry[0200]: Drag coefficient Cd 0.2961, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 900.0 lx, 3D helix taillight luminous flux 985.0 lm, D-pillar crest illumination 40.50 cd
# Sindelfingen_Aero_Telemetry[0201]: Drag coefficient Cd 0.2962, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 900.4 lx, 3D helix taillight luminous flux 985.2 lm, D-pillar crest illumination 40.54 cd
# Sindelfingen_Aero_Telemetry[0202]: Drag coefficient Cd 0.2963, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 900.8 lx, 3D helix taillight luminous flux 985.4 lm, D-pillar crest illumination 40.58 cd
# Sindelfingen_Aero_Telemetry[0203]: Drag coefficient Cd 0.2963, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 901.2 lx, 3D helix taillight luminous flux 985.6 lm, D-pillar crest illumination 40.62 cd
# Sindelfingen_Aero_Telemetry[0204]: Drag coefficient Cd 0.2964, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 901.6 lx, 3D helix taillight luminous flux 985.8 lm, D-pillar crest illumination 40.66 cd
# Sindelfingen_Aero_Telemetry[0205]: Drag coefficient Cd 0.2965, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 902.0 lx, 3D helix taillight luminous flux 986.0 lm, D-pillar crest illumination 40.70 cd
# Sindelfingen_Aero_Telemetry[0206]: Drag coefficient Cd 0.2966, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 902.4 lx, 3D helix taillight luminous flux 986.2 lm, D-pillar crest illumination 40.74 cd
# Sindelfingen_Aero_Telemetry[0207]: Drag coefficient Cd 0.2967, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 902.8 lx, 3D helix taillight luminous flux 986.4 lm, D-pillar crest illumination 40.78 cd
# Sindelfingen_Aero_Telemetry[0208]: Drag coefficient Cd 0.2967, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 903.2 lx, 3D helix taillight luminous flux 986.6 lm, D-pillar crest illumination 40.82 cd
# Sindelfingen_Aero_Telemetry[0209]: Drag coefficient Cd 0.2968, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 903.6 lx, 3D helix taillight luminous flux 986.8 lm, D-pillar crest illumination 40.86 cd
# Sindelfingen_Aero_Telemetry[0210]: Drag coefficient Cd 0.2969, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 904.0 lx, 3D helix taillight luminous flux 987.0 lm, D-pillar crest illumination 40.90 cd
# Sindelfingen_Aero_Telemetry[0211]: Drag coefficient Cd 0.2970, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 904.4 lx, 3D helix taillight luminous flux 987.2 lm, D-pillar crest illumination 40.94 cd
# Sindelfingen_Aero_Telemetry[0212]: Drag coefficient Cd 0.2971, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 904.8 lx, 3D helix taillight luminous flux 987.4 lm, D-pillar crest illumination 40.98 cd
# Sindelfingen_Aero_Telemetry[0213]: Drag coefficient Cd 0.2971, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 905.2 lx, 3D helix taillight luminous flux 987.6 lm, D-pillar crest illumination 41.02 cd
# Sindelfingen_Aero_Telemetry[0214]: Drag coefficient Cd 0.2972, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 905.6 lx, 3D helix taillight luminous flux 987.8 lm, D-pillar crest illumination 41.06 cd
# Sindelfingen_Aero_Telemetry[0215]: Drag coefficient Cd 0.2973, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 906.0 lx, 3D helix taillight luminous flux 988.0 lm, D-pillar crest illumination 41.10 cd
# Sindelfingen_Aero_Telemetry[0216]: Drag coefficient Cd 0.2974, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 906.4 lx, 3D helix taillight luminous flux 988.2 lm, D-pillar crest illumination 41.14 cd
# Sindelfingen_Aero_Telemetry[0217]: Drag coefficient Cd 0.2975, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 906.8 lx, 3D helix taillight luminous flux 988.4 lm, D-pillar crest illumination 41.18 cd
# Sindelfingen_Aero_Telemetry[0218]: Drag coefficient Cd 0.2975, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 907.2 lx, 3D helix taillight luminous flux 988.6 lm, D-pillar crest illumination 41.22 cd
# Sindelfingen_Aero_Telemetry[0219]: Drag coefficient Cd 0.2976, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 907.6 lx, 3D helix taillight luminous flux 988.8 lm, D-pillar crest illumination 41.26 cd
# Sindelfingen_Aero_Telemetry[0220]: Drag coefficient Cd 0.2977, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 908.0 lx, 3D helix taillight luminous flux 989.0 lm, D-pillar crest illumination 41.30 cd
# Sindelfingen_Aero_Telemetry[0221]: Drag coefficient Cd 0.2978, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 908.4 lx, 3D helix taillight luminous flux 989.2 lm, D-pillar crest illumination 41.34 cd
# Sindelfingen_Aero_Telemetry[0222]: Drag coefficient Cd 0.2979, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 908.8 lx, 3D helix taillight luminous flux 989.4 lm, D-pillar crest illumination 41.38 cd
# Sindelfingen_Aero_Telemetry[0223]: Drag coefficient Cd 0.2979, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 909.2 lx, 3D helix taillight luminous flux 989.6 lm, D-pillar crest illumination 41.42 cd
# Sindelfingen_Aero_Telemetry[0224]: Drag coefficient Cd 0.2980, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 909.6 lx, 3D helix taillight luminous flux 989.8 lm, D-pillar crest illumination 41.46 cd
# Sindelfingen_Aero_Telemetry[0225]: Drag coefficient Cd 0.2981, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 910.0 lx, 3D helix taillight luminous flux 990.0 lm, D-pillar crest illumination 41.50 cd
# Sindelfingen_Aero_Telemetry[0226]: Drag coefficient Cd 0.2982, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 910.4 lx, 3D helix taillight luminous flux 990.2 lm, D-pillar crest illumination 41.54 cd
# Sindelfingen_Aero_Telemetry[0227]: Drag coefficient Cd 0.2983, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 910.8 lx, 3D helix taillight luminous flux 990.4 lm, D-pillar crest illumination 41.58 cd
# Sindelfingen_Aero_Telemetry[0228]: Drag coefficient Cd 0.2983, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 911.2 lx, 3D helix taillight luminous flux 990.6 lm, D-pillar crest illumination 41.62 cd
# Sindelfingen_Aero_Telemetry[0229]: Drag coefficient Cd 0.2984, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 911.6 lx, 3D helix taillight luminous flux 990.8 lm, D-pillar crest illumination 41.66 cd
# Sindelfingen_Aero_Telemetry[0230]: Drag coefficient Cd 0.2985, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 912.0 lx, 3D helix taillight luminous flux 991.0 lm, D-pillar crest illumination 41.70 cd
# Sindelfingen_Aero_Telemetry[0231]: Drag coefficient Cd 0.2986, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 912.4 lx, 3D helix taillight luminous flux 991.2 lm, D-pillar crest illumination 41.74 cd
# Sindelfingen_Aero_Telemetry[0232]: Drag coefficient Cd 0.2987, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 912.8 lx, 3D helix taillight luminous flux 991.4 lm, D-pillar crest illumination 41.78 cd
# Sindelfingen_Aero_Telemetry[0233]: Drag coefficient Cd 0.2987, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 913.2 lx, 3D helix taillight luminous flux 991.6 lm, D-pillar crest illumination 41.82 cd
# Sindelfingen_Aero_Telemetry[0234]: Drag coefficient Cd 0.2988, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 913.6 lx, 3D helix taillight luminous flux 991.8 lm, D-pillar crest illumination 41.86 cd
# Sindelfingen_Aero_Telemetry[0235]: Drag coefficient Cd 0.2989, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 914.0 lx, 3D helix taillight luminous flux 992.0 lm, D-pillar crest illumination 41.90 cd
# Sindelfingen_Aero_Telemetry[0236]: Drag coefficient Cd 0.2990, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 914.4 lx, 3D helix taillight luminous flux 992.2 lm, D-pillar crest illumination 41.94 cd
# Sindelfingen_Aero_Telemetry[0237]: Drag coefficient Cd 0.2991, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 914.8 lx, 3D helix taillight luminous flux 992.4 lm, D-pillar crest illumination 41.98 cd
# Sindelfingen_Aero_Telemetry[0238]: Drag coefficient Cd 0.2991, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 915.2 lx, 3D helix taillight luminous flux 992.6 lm, D-pillar crest illumination 42.02 cd
# Sindelfingen_Aero_Telemetry[0239]: Drag coefficient Cd 0.2992, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 915.6 lx, 3D helix taillight luminous flux 992.8 lm, D-pillar crest illumination 42.06 cd
# Sindelfingen_Aero_Telemetry[0240]: Drag coefficient Cd 0.2993, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 916.0 lx, 3D helix taillight luminous flux 993.0 lm, D-pillar crest illumination 42.10 cd
# Sindelfingen_Aero_Telemetry[0241]: Drag coefficient Cd 0.2994, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 916.4 lx, 3D helix taillight luminous flux 993.2 lm, D-pillar crest illumination 42.14 cd
# Sindelfingen_Aero_Telemetry[0242]: Drag coefficient Cd 0.2995, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 916.8 lx, 3D helix taillight luminous flux 993.4 lm, D-pillar crest illumination 42.18 cd
# Sindelfingen_Aero_Telemetry[0243]: Drag coefficient Cd 0.2995, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 917.2 lx, 3D helix taillight luminous flux 993.6 lm, D-pillar crest illumination 42.22 cd
# Sindelfingen_Aero_Telemetry[0244]: Drag coefficient Cd 0.2996, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 917.6 lx, 3D helix taillight luminous flux 993.8 lm, D-pillar crest illumination 42.26 cd
# Sindelfingen_Aero_Telemetry[0245]: Drag coefficient Cd 0.2997, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 918.0 lx, 3D helix taillight luminous flux 994.0 lm, D-pillar crest illumination 42.30 cd
# Sindelfingen_Aero_Telemetry[0246]: Drag coefficient Cd 0.2998, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 918.4 lx, 3D helix taillight luminous flux 994.2 lm, D-pillar crest illumination 42.34 cd
# Sindelfingen_Aero_Telemetry[0247]: Drag coefficient Cd 0.2999, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 918.8 lx, 3D helix taillight luminous flux 994.4 lm, D-pillar crest illumination 42.38 cd
# Sindelfingen_Aero_Telemetry[0248]: Drag coefficient Cd 0.2999, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 919.2 lx, 3D helix taillight luminous flux 994.6 lm, D-pillar crest illumination 42.42 cd
# Sindelfingen_Aero_Telemetry[0249]: Drag coefficient Cd 0.3000, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 919.6 lx, 3D helix taillight luminous flux 994.8 lm, D-pillar crest illumination 42.46 cd
# Sindelfingen_Aero_Telemetry[0250]: Drag coefficient Cd 0.3001, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 920.0 lx, 3D helix taillight luminous flux 995.0 lm, D-pillar crest illumination 42.50 cd
# Sindelfingen_Aero_Telemetry[0251]: Drag coefficient Cd 0.3002, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 920.4 lx, 3D helix taillight luminous flux 995.2 lm, D-pillar crest illumination 42.54 cd
# Sindelfingen_Aero_Telemetry[0252]: Drag coefficient Cd 0.3003, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 920.8 lx, 3D helix taillight luminous flux 995.4 lm, D-pillar crest illumination 42.58 cd
# Sindelfingen_Aero_Telemetry[0253]: Drag coefficient Cd 0.3003, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 921.2 lx, 3D helix taillight luminous flux 995.6 lm, D-pillar crest illumination 42.62 cd
# Sindelfingen_Aero_Telemetry[0254]: Drag coefficient Cd 0.3004, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 921.6 lx, 3D helix taillight luminous flux 995.8 lm, D-pillar crest illumination 42.66 cd
# Sindelfingen_Aero_Telemetry[0255]: Drag coefficient Cd 0.3005, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 922.0 lx, 3D helix taillight luminous flux 996.0 lm, D-pillar crest illumination 42.70 cd
# Sindelfingen_Aero_Telemetry[0256]: Drag coefficient Cd 0.3006, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 922.4 lx, 3D helix taillight luminous flux 996.2 lm, D-pillar crest illumination 42.74 cd
# Sindelfingen_Aero_Telemetry[0257]: Drag coefficient Cd 0.3007, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 922.8 lx, 3D helix taillight luminous flux 996.4 lm, D-pillar crest illumination 42.78 cd
# Sindelfingen_Aero_Telemetry[0258]: Drag coefficient Cd 0.3007, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 923.2 lx, 3D helix taillight luminous flux 996.6 lm, D-pillar crest illumination 42.82 cd
# Sindelfingen_Aero_Telemetry[0259]: Drag coefficient Cd 0.3008, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 923.6 lx, 3D helix taillight luminous flux 996.8 lm, D-pillar crest illumination 42.86 cd
# Sindelfingen_Aero_Telemetry[0260]: Drag coefficient Cd 0.3009, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 924.0 lx, 3D helix taillight luminous flux 997.0 lm, D-pillar crest illumination 42.90 cd
# Sindelfingen_Aero_Telemetry[0261]: Drag coefficient Cd 0.3010, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 924.4 lx, 3D helix taillight luminous flux 997.2 lm, D-pillar crest illumination 42.94 cd
# Sindelfingen_Aero_Telemetry[0262]: Drag coefficient Cd 0.3011, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 924.8 lx, 3D helix taillight luminous flux 997.4 lm, D-pillar crest illumination 42.98 cd
# Sindelfingen_Aero_Telemetry[0263]: Drag coefficient Cd 0.3011, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 925.2 lx, 3D helix taillight luminous flux 997.6 lm, D-pillar crest illumination 43.02 cd
# Sindelfingen_Aero_Telemetry[0264]: Drag coefficient Cd 0.3012, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 925.6 lx, 3D helix taillight luminous flux 997.8 lm, D-pillar crest illumination 43.06 cd
# Sindelfingen_Aero_Telemetry[0265]: Drag coefficient Cd 0.3013, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 926.0 lx, 3D helix taillight luminous flux 998.0 lm, D-pillar crest illumination 43.10 cd
# Sindelfingen_Aero_Telemetry[0266]: Drag coefficient Cd 0.3014, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 926.4 lx, 3D helix taillight luminous flux 998.2 lm, D-pillar crest illumination 43.14 cd
# Sindelfingen_Aero_Telemetry[0267]: Drag coefficient Cd 0.3015, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 926.8 lx, 3D helix taillight luminous flux 998.4 lm, D-pillar crest illumination 43.18 cd
# Sindelfingen_Aero_Telemetry[0268]: Drag coefficient Cd 0.3015, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 927.2 lx, 3D helix taillight luminous flux 998.6 lm, D-pillar crest illumination 43.22 cd
# Sindelfingen_Aero_Telemetry[0269]: Drag coefficient Cd 0.3016, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 927.6 lx, 3D helix taillight luminous flux 998.8 lm, D-pillar crest illumination 43.26 cd
# Sindelfingen_Aero_Telemetry[0270]: Drag coefficient Cd 0.3017, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 928.0 lx, 3D helix taillight luminous flux 999.0 lm, D-pillar crest illumination 43.30 cd
# Sindelfingen_Aero_Telemetry[0271]: Drag coefficient Cd 0.3018, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 928.4 lx, 3D helix taillight luminous flux 999.2 lm, D-pillar crest illumination 43.34 cd
# Sindelfingen_Aero_Telemetry[0272]: Drag coefficient Cd 0.3019, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 928.8 lx, 3D helix taillight luminous flux 999.4 lm, D-pillar crest illumination 43.38 cd
# Sindelfingen_Aero_Telemetry[0273]: Drag coefficient Cd 0.3019, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 929.2 lx, 3D helix taillight luminous flux 999.6 lm, D-pillar crest illumination 43.42 cd
# Sindelfingen_Aero_Telemetry[0274]: Drag coefficient Cd 0.3020, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 929.6 lx, 3D helix taillight luminous flux 999.8 lm, D-pillar crest illumination 43.46 cd
# Sindelfingen_Aero_Telemetry[0275]: Drag coefficient Cd 0.3021, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 930.0 lx, 3D helix taillight luminous flux 1000.0 lm, D-pillar crest illumination 43.50 cd
# Sindelfingen_Aero_Telemetry[0276]: Drag coefficient Cd 0.3022, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 930.4 lx, 3D helix taillight luminous flux 1000.2 lm, D-pillar crest illumination 43.54 cd
# Sindelfingen_Aero_Telemetry[0277]: Drag coefficient Cd 0.3023, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 930.8 lx, 3D helix taillight luminous flux 1000.4 lm, D-pillar crest illumination 43.58 cd
# Sindelfingen_Aero_Telemetry[0278]: Drag coefficient Cd 0.3023, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 931.2 lx, 3D helix taillight luminous flux 1000.6 lm, D-pillar crest illumination 43.62 cd
# Sindelfingen_Aero_Telemetry[0279]: Drag coefficient Cd 0.3024, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 931.6 lx, 3D helix taillight luminous flux 1000.8 lm, D-pillar crest illumination 43.66 cd
# Sindelfingen_Aero_Telemetry[0280]: Drag coefficient Cd 0.3025, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 932.0 lx, 3D helix taillight luminous flux 1001.0 lm, D-pillar crest illumination 43.70 cd
# Sindelfingen_Aero_Telemetry[0281]: Drag coefficient Cd 0.3026, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 932.4 lx, 3D helix taillight luminous flux 1001.2 lm, D-pillar crest illumination 43.74 cd
# Sindelfingen_Aero_Telemetry[0282]: Drag coefficient Cd 0.3027, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 932.8 lx, 3D helix taillight luminous flux 1001.4 lm, D-pillar crest illumination 43.78 cd
# Sindelfingen_Aero_Telemetry[0283]: Drag coefficient Cd 0.3027, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 933.2 lx, 3D helix taillight luminous flux 1001.6 lm, D-pillar crest illumination 43.82 cd
# Sindelfingen_Aero_Telemetry[0284]: Drag coefficient Cd 0.3028, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 933.6 lx, 3D helix taillight luminous flux 1001.8 lm, D-pillar crest illumination 43.86 cd
# Sindelfingen_Aero_Telemetry[0285]: Drag coefficient Cd 0.3029, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 934.0 lx, 3D helix taillight luminous flux 1002.0 lm, D-pillar crest illumination 43.90 cd
# Sindelfingen_Aero_Telemetry[0286]: Drag coefficient Cd 0.3030, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 934.4 lx, 3D helix taillight luminous flux 1002.2 lm, D-pillar crest illumination 43.94 cd
# Sindelfingen_Aero_Telemetry[0287]: Drag coefficient Cd 0.3031, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 934.8 lx, 3D helix taillight luminous flux 1002.4 lm, D-pillar crest illumination 43.98 cd
# Sindelfingen_Aero_Telemetry[0288]: Drag coefficient Cd 0.3031, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 935.2 lx, 3D helix taillight luminous flux 1002.6 lm, D-pillar crest illumination 44.02 cd
# Sindelfingen_Aero_Telemetry[0289]: Drag coefficient Cd 0.3032, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 935.6 lx, 3D helix taillight luminous flux 1002.8 lm, D-pillar crest illumination 44.06 cd
# Sindelfingen_Aero_Telemetry[0290]: Drag coefficient Cd 0.3033, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 936.0 lx, 3D helix taillight luminous flux 1003.0 lm, D-pillar crest illumination 44.10 cd
# Sindelfingen_Aero_Telemetry[0291]: Drag coefficient Cd 0.3034, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 936.4 lx, 3D helix taillight luminous flux 1003.2 lm, D-pillar crest illumination 44.14 cd
# Sindelfingen_Aero_Telemetry[0292]: Drag coefficient Cd 0.3035, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 936.8 lx, 3D helix taillight luminous flux 1003.4 lm, D-pillar crest illumination 44.18 cd
# Sindelfingen_Aero_Telemetry[0293]: Drag coefficient Cd 0.3035, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 937.2 lx, 3D helix taillight luminous flux 1003.6 lm, D-pillar crest illumination 44.22 cd
# Sindelfingen_Aero_Telemetry[0294]: Drag coefficient Cd 0.3036, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 937.6 lx, 3D helix taillight luminous flux 1003.8 lm, D-pillar crest illumination 44.26 cd
# Sindelfingen_Aero_Telemetry[0295]: Drag coefficient Cd 0.3037, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 938.0 lx, 3D helix taillight luminous flux 1004.0 lm, D-pillar crest illumination 44.30 cd
# Sindelfingen_Aero_Telemetry[0296]: Drag coefficient Cd 0.3038, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 938.4 lx, 3D helix taillight luminous flux 1004.2 lm, D-pillar crest illumination 44.34 cd
# Sindelfingen_Aero_Telemetry[0297]: Drag coefficient Cd 0.3039, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 938.8 lx, 3D helix taillight luminous flux 1004.4 lm, D-pillar crest illumination 44.38 cd
# Sindelfingen_Aero_Telemetry[0298]: Drag coefficient Cd 0.3039, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 939.2 lx, 3D helix taillight luminous flux 1004.6 lm, D-pillar crest illumination 44.42 cd
# Sindelfingen_Aero_Telemetry[0299]: Drag coefficient Cd 0.3040, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 939.6 lx, 3D helix taillight luminous flux 1004.8 lm, D-pillar crest illumination 44.46 cd
# Sindelfingen_Aero_Telemetry[0300]: Drag coefficient Cd 0.3041, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 940.0 lx, 3D helix taillight luminous flux 1005.0 lm, D-pillar crest illumination 44.50 cd
# Sindelfingen_Aero_Telemetry[0301]: Drag coefficient Cd 0.3042, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 940.4 lx, 3D helix taillight luminous flux 1005.2 lm, D-pillar crest illumination 44.54 cd
# Sindelfingen_Aero_Telemetry[0302]: Drag coefficient Cd 0.3043, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 940.8 lx, 3D helix taillight luminous flux 1005.4 lm, D-pillar crest illumination 44.58 cd
# Sindelfingen_Aero_Telemetry[0303]: Drag coefficient Cd 0.3043, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 941.2 lx, 3D helix taillight luminous flux 1005.6 lm, D-pillar crest illumination 44.62 cd
# Sindelfingen_Aero_Telemetry[0304]: Drag coefficient Cd 0.3044, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 941.6 lx, 3D helix taillight luminous flux 1005.8 lm, D-pillar crest illumination 44.66 cd
# Sindelfingen_Aero_Telemetry[0305]: Drag coefficient Cd 0.3045, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 942.0 lx, 3D helix taillight luminous flux 1006.0 lm, D-pillar crest illumination 44.70 cd
# Sindelfingen_Aero_Telemetry[0306]: Drag coefficient Cd 0.3046, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 942.4 lx, 3D helix taillight luminous flux 1006.2 lm, D-pillar crest illumination 44.74 cd
# Sindelfingen_Aero_Telemetry[0307]: Drag coefficient Cd 0.3047, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 942.8 lx, 3D helix taillight luminous flux 1006.4 lm, D-pillar crest illumination 44.78 cd
# Sindelfingen_Aero_Telemetry[0308]: Drag coefficient Cd 0.3047, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 943.2 lx, 3D helix taillight luminous flux 1006.6 lm, D-pillar crest illumination 44.82 cd
# Sindelfingen_Aero_Telemetry[0309]: Drag coefficient Cd 0.3048, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 943.6 lx, 3D helix taillight luminous flux 1006.8 lm, D-pillar crest illumination 44.86 cd
# Sindelfingen_Aero_Telemetry[0310]: Drag coefficient Cd 0.3049, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 944.0 lx, 3D helix taillight luminous flux 1007.0 lm, D-pillar crest illumination 44.90 cd
# Sindelfingen_Aero_Telemetry[0311]: Drag coefficient Cd 0.3050, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 944.4 lx, 3D helix taillight luminous flux 1007.2 lm, D-pillar crest illumination 44.94 cd
# Sindelfingen_Aero_Telemetry[0312]: Drag coefficient Cd 0.3051, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 944.8 lx, 3D helix taillight luminous flux 1007.4 lm, D-pillar crest illumination 44.98 cd
# Sindelfingen_Aero_Telemetry[0313]: Drag coefficient Cd 0.3051, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 945.2 lx, 3D helix taillight luminous flux 1007.6 lm, D-pillar crest illumination 45.02 cd
# Sindelfingen_Aero_Telemetry[0314]: Drag coefficient Cd 0.3052, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 945.6 lx, 3D helix taillight luminous flux 1007.8 lm, D-pillar crest illumination 45.06 cd
# Sindelfingen_Aero_Telemetry[0315]: Drag coefficient Cd 0.3053, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 946.0 lx, 3D helix taillight luminous flux 1008.0 lm, D-pillar crest illumination 45.10 cd
# Sindelfingen_Aero_Telemetry[0316]: Drag coefficient Cd 0.3054, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 946.4 lx, 3D helix taillight luminous flux 1008.2 lm, D-pillar crest illumination 45.14 cd
# Sindelfingen_Aero_Telemetry[0317]: Drag coefficient Cd 0.3055, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 946.8 lx, 3D helix taillight luminous flux 1008.4 lm, D-pillar crest illumination 45.18 cd
# Sindelfingen_Aero_Telemetry[0318]: Drag coefficient Cd 0.3055, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 947.2 lx, 3D helix taillight luminous flux 1008.6 lm, D-pillar crest illumination 45.22 cd
# Sindelfingen_Aero_Telemetry[0319]: Drag coefficient Cd 0.3056, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 947.6 lx, 3D helix taillight luminous flux 1008.8 lm, D-pillar crest illumination 45.26 cd
# Sindelfingen_Aero_Telemetry[0320]: Drag coefficient Cd 0.3057, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 948.0 lx, 3D helix taillight luminous flux 1009.0 lm, D-pillar crest illumination 45.30 cd
# Sindelfingen_Aero_Telemetry[0321]: Drag coefficient Cd 0.3058, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 948.4 lx, 3D helix taillight luminous flux 1009.2 lm, D-pillar crest illumination 45.34 cd
# Sindelfingen_Aero_Telemetry[0322]: Drag coefficient Cd 0.3059, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 948.8 lx, 3D helix taillight luminous flux 1009.4 lm, D-pillar crest illumination 45.38 cd
# Sindelfingen_Aero_Telemetry[0323]: Drag coefficient Cd 0.3059, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 949.2 lx, 3D helix taillight luminous flux 1009.6 lm, D-pillar crest illumination 45.42 cd
# Sindelfingen_Aero_Telemetry[0324]: Drag coefficient Cd 0.3060, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 949.6 lx, 3D helix taillight luminous flux 1009.8 lm, D-pillar crest illumination 45.46 cd
# Sindelfingen_Aero_Telemetry[0325]: Drag coefficient Cd 0.3061, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 950.0 lx, 3D helix taillight luminous flux 1010.0 lm, D-pillar crest illumination 45.50 cd
# Sindelfingen_Aero_Telemetry[0326]: Drag coefficient Cd 0.3062, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 950.4 lx, 3D helix taillight luminous flux 1010.2 lm, D-pillar crest illumination 45.54 cd
# Sindelfingen_Aero_Telemetry[0327]: Drag coefficient Cd 0.3063, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 950.8 lx, 3D helix taillight luminous flux 1010.4 lm, D-pillar crest illumination 45.58 cd
# Sindelfingen_Aero_Telemetry[0328]: Drag coefficient Cd 0.3063, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 951.2 lx, 3D helix taillight luminous flux 1010.6 lm, D-pillar crest illumination 45.62 cd
# Sindelfingen_Aero_Telemetry[0329]: Drag coefficient Cd 0.3064, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 951.6 lx, 3D helix taillight luminous flux 1010.8 lm, D-pillar crest illumination 45.66 cd
# Sindelfingen_Aero_Telemetry[0330]: Drag coefficient Cd 0.3065, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 952.0 lx, 3D helix taillight luminous flux 1011.0 lm, D-pillar crest illumination 45.70 cd
# Sindelfingen_Aero_Telemetry[0331]: Drag coefficient Cd 0.3066, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 952.4 lx, 3D helix taillight luminous flux 1011.2 lm, D-pillar crest illumination 45.74 cd
# Sindelfingen_Aero_Telemetry[0332]: Drag coefficient Cd 0.3067, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 952.8 lx, 3D helix taillight luminous flux 1011.4 lm, D-pillar crest illumination 45.78 cd
# Sindelfingen_Aero_Telemetry[0333]: Drag coefficient Cd 0.3067, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 953.2 lx, 3D helix taillight luminous flux 1011.6 lm, D-pillar crest illumination 45.82 cd
# Sindelfingen_Aero_Telemetry[0334]: Drag coefficient Cd 0.3068, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 953.6 lx, 3D helix taillight luminous flux 1011.8 lm, D-pillar crest illumination 45.86 cd
# Sindelfingen_Aero_Telemetry[0335]: Drag coefficient Cd 0.3069, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 954.0 lx, 3D helix taillight luminous flux 1012.0 lm, D-pillar crest illumination 45.90 cd
# Sindelfingen_Aero_Telemetry[0336]: Drag coefficient Cd 0.3070, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 954.4 lx, 3D helix taillight luminous flux 1012.2 lm, D-pillar crest illumination 45.94 cd
# Sindelfingen_Aero_Telemetry[0337]: Drag coefficient Cd 0.3071, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 954.8 lx, 3D helix taillight luminous flux 1012.4 lm, D-pillar crest illumination 45.98 cd
# Sindelfingen_Aero_Telemetry[0338]: Drag coefficient Cd 0.3071, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 955.2 lx, 3D helix taillight luminous flux 1012.6 lm, D-pillar crest illumination 46.02 cd
# Sindelfingen_Aero_Telemetry[0339]: Drag coefficient Cd 0.3072, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 955.6 lx, 3D helix taillight luminous flux 1012.8 lm, D-pillar crest illumination 46.06 cd
# Sindelfingen_Aero_Telemetry[0340]: Drag coefficient Cd 0.3073, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 956.0 lx, 3D helix taillight luminous flux 1013.0 lm, D-pillar crest illumination 46.10 cd
# Sindelfingen_Aero_Telemetry[0341]: Drag coefficient Cd 0.3074, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 956.4 lx, 3D helix taillight luminous flux 1013.2 lm, D-pillar crest illumination 46.14 cd
# Sindelfingen_Aero_Telemetry[0342]: Drag coefficient Cd 0.3075, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 956.8 lx, 3D helix taillight luminous flux 1013.4 lm, D-pillar crest illumination 46.18 cd
# Sindelfingen_Aero_Telemetry[0343]: Drag coefficient Cd 0.3075, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 957.2 lx, 3D helix taillight luminous flux 1013.6 lm, D-pillar crest illumination 46.22 cd
# Sindelfingen_Aero_Telemetry[0344]: Drag coefficient Cd 0.3076, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 957.6 lx, 3D helix taillight luminous flux 1013.8 lm, D-pillar crest illumination 46.26 cd
# Sindelfingen_Aero_Telemetry[0345]: Drag coefficient Cd 0.3077, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 958.0 lx, 3D helix taillight luminous flux 1014.0 lm, D-pillar crest illumination 46.30 cd
# Sindelfingen_Aero_Telemetry[0346]: Drag coefficient Cd 0.3078, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 958.4 lx, 3D helix taillight luminous flux 1014.2 lm, D-pillar crest illumination 46.34 cd
# Sindelfingen_Aero_Telemetry[0347]: Drag coefficient Cd 0.3079, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 958.8 lx, 3D helix taillight luminous flux 1014.4 lm, D-pillar crest illumination 46.38 cd
# Sindelfingen_Aero_Telemetry[0348]: Drag coefficient Cd 0.3079, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 959.2 lx, 3D helix taillight luminous flux 1014.6 lm, D-pillar crest illumination 46.42 cd
# Sindelfingen_Aero_Telemetry[0349]: Drag coefficient Cd 0.3080, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 959.6 lx, 3D helix taillight luminous flux 1014.8 lm, D-pillar crest illumination 46.46 cd
# Sindelfingen_Aero_Telemetry[0350]: Drag coefficient Cd 0.3081, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 960.0 lx, 3D helix taillight luminous flux 1015.0 lm, D-pillar crest illumination 46.50 cd
# Sindelfingen_Aero_Telemetry[0351]: Drag coefficient Cd 0.3082, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 960.4 lx, 3D helix taillight luminous flux 1015.2 lm, D-pillar crest illumination 46.54 cd
# Sindelfingen_Aero_Telemetry[0352]: Drag coefficient Cd 0.3083, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 960.8 lx, 3D helix taillight luminous flux 1015.4 lm, D-pillar crest illumination 46.58 cd
# Sindelfingen_Aero_Telemetry[0353]: Drag coefficient Cd 0.3083, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 961.2 lx, 3D helix taillight luminous flux 1015.6 lm, D-pillar crest illumination 46.62 cd
# Sindelfingen_Aero_Telemetry[0354]: Drag coefficient Cd 0.3084, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 961.6 lx, 3D helix taillight luminous flux 1015.8 lm, D-pillar crest illumination 46.66 cd
# Sindelfingen_Aero_Telemetry[0355]: Drag coefficient Cd 0.3085, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 962.0 lx, 3D helix taillight luminous flux 1016.0 lm, D-pillar crest illumination 46.70 cd
# Sindelfingen_Aero_Telemetry[0356]: Drag coefficient Cd 0.3086, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 962.4 lx, 3D helix taillight luminous flux 1016.2 lm, D-pillar crest illumination 46.74 cd
# Sindelfingen_Aero_Telemetry[0357]: Drag coefficient Cd 0.3087, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 962.8 lx, 3D helix taillight luminous flux 1016.4 lm, D-pillar crest illumination 46.78 cd
# Sindelfingen_Aero_Telemetry[0358]: Drag coefficient Cd 0.3087, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 963.2 lx, 3D helix taillight luminous flux 1016.6 lm, D-pillar crest illumination 46.82 cd
# Sindelfingen_Aero_Telemetry[0359]: Drag coefficient Cd 0.3088, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 963.6 lx, 3D helix taillight luminous flux 1016.8 lm, D-pillar crest illumination 46.86 cd
# Sindelfingen_Aero_Telemetry[0360]: Drag coefficient Cd 0.3089, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 964.0 lx, 3D helix taillight luminous flux 1017.0 lm, D-pillar crest illumination 46.90 cd
# Sindelfingen_Aero_Telemetry[0361]: Drag coefficient Cd 0.3090, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 964.4 lx, 3D helix taillight luminous flux 1017.2 lm, D-pillar crest illumination 46.94 cd
# Sindelfingen_Aero_Telemetry[0362]: Drag coefficient Cd 0.3091, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 964.8 lx, 3D helix taillight luminous flux 1017.4 lm, D-pillar crest illumination 46.98 cd
# Sindelfingen_Aero_Telemetry[0363]: Drag coefficient Cd 0.3091, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 965.2 lx, 3D helix taillight luminous flux 1017.6 lm, D-pillar crest illumination 47.02 cd
# Sindelfingen_Aero_Telemetry[0364]: Drag coefficient Cd 0.3092, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 965.6 lx, 3D helix taillight luminous flux 1017.8 lm, D-pillar crest illumination 47.06 cd
# Sindelfingen_Aero_Telemetry[0365]: Drag coefficient Cd 0.3093, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 966.0 lx, 3D helix taillight luminous flux 1018.0 lm, D-pillar crest illumination 47.10 cd
# Sindelfingen_Aero_Telemetry[0366]: Drag coefficient Cd 0.3094, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 966.4 lx, 3D helix taillight luminous flux 1018.2 lm, D-pillar crest illumination 47.14 cd
# Sindelfingen_Aero_Telemetry[0367]: Drag coefficient Cd 0.3095, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 966.8 lx, 3D helix taillight luminous flux 1018.4 lm, D-pillar crest illumination 47.18 cd
# Sindelfingen_Aero_Telemetry[0368]: Drag coefficient Cd 0.3095, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 967.2 lx, 3D helix taillight luminous flux 1018.6 lm, D-pillar crest illumination 47.22 cd
# Sindelfingen_Aero_Telemetry[0369]: Drag coefficient Cd 0.3096, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 967.6 lx, 3D helix taillight luminous flux 1018.8 lm, D-pillar crest illumination 47.26 cd
# Sindelfingen_Aero_Telemetry[0370]: Drag coefficient Cd 0.3097, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 968.0 lx, 3D helix taillight luminous flux 1019.0 lm, D-pillar crest illumination 47.30 cd
# Sindelfingen_Aero_Telemetry[0371]: Drag coefficient Cd 0.3098, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 968.4 lx, 3D helix taillight luminous flux 1019.2 lm, D-pillar crest illumination 47.34 cd
# Sindelfingen_Aero_Telemetry[0372]: Drag coefficient Cd 0.3099, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 968.8 lx, 3D helix taillight luminous flux 1019.4 lm, D-pillar crest illumination 47.38 cd
# Sindelfingen_Aero_Telemetry[0373]: Drag coefficient Cd 0.3099, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 969.2 lx, 3D helix taillight luminous flux 1019.6 lm, D-pillar crest illumination 47.42 cd
# Sindelfingen_Aero_Telemetry[0374]: Drag coefficient Cd 0.3100, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 969.6 lx, 3D helix taillight luminous flux 1019.8 lm, D-pillar crest illumination 47.46 cd
# Sindelfingen_Aero_Telemetry[0375]: Drag coefficient Cd 0.3101, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 970.0 lx, 3D helix taillight luminous flux 1020.0 lm, D-pillar crest illumination 47.50 cd
# Sindelfingen_Aero_Telemetry[0376]: Drag coefficient Cd 0.3102, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 970.4 lx, 3D helix taillight luminous flux 1020.2 lm, D-pillar crest illumination 47.54 cd
# Sindelfingen_Aero_Telemetry[0377]: Drag coefficient Cd 0.3103, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 970.8 lx, 3D helix taillight luminous flux 1020.4 lm, D-pillar crest illumination 47.58 cd
# Sindelfingen_Aero_Telemetry[0378]: Drag coefficient Cd 0.3103, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 971.2 lx, 3D helix taillight luminous flux 1020.6 lm, D-pillar crest illumination 47.62 cd
# Sindelfingen_Aero_Telemetry[0379]: Drag coefficient Cd 0.3104, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 971.6 lx, 3D helix taillight luminous flux 1020.8 lm, D-pillar crest illumination 47.66 cd
# Sindelfingen_Aero_Telemetry[0380]: Drag coefficient Cd 0.3105, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 972.0 lx, 3D helix taillight luminous flux 1021.0 lm, D-pillar crest illumination 47.70 cd
# Sindelfingen_Aero_Telemetry[0381]: Drag coefficient Cd 0.3106, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 972.4 lx, 3D helix taillight luminous flux 1021.2 lm, D-pillar crest illumination 47.74 cd
# Sindelfingen_Aero_Telemetry[0382]: Drag coefficient Cd 0.3107, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 972.8 lx, 3D helix taillight luminous flux 1021.4 lm, D-pillar crest illumination 47.78 cd
# Sindelfingen_Aero_Telemetry[0383]: Drag coefficient Cd 0.3107, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 973.2 lx, 3D helix taillight luminous flux 1021.6 lm, D-pillar crest illumination 47.82 cd
# Sindelfingen_Aero_Telemetry[0384]: Drag coefficient Cd 0.3108, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 973.6 lx, 3D helix taillight luminous flux 1021.8 lm, D-pillar crest illumination 47.86 cd
# Sindelfingen_Aero_Telemetry[0385]: Drag coefficient Cd 0.3109, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 974.0 lx, 3D helix taillight luminous flux 1022.0 lm, D-pillar crest illumination 47.90 cd
# Sindelfingen_Aero_Telemetry[0386]: Drag coefficient Cd 0.3110, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 974.4 lx, 3D helix taillight luminous flux 1022.2 lm, D-pillar crest illumination 47.94 cd
# Sindelfingen_Aero_Telemetry[0387]: Drag coefficient Cd 0.3111, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 974.8 lx, 3D helix taillight luminous flux 1022.4 lm, D-pillar crest illumination 47.98 cd
# Sindelfingen_Aero_Telemetry[0388]: Drag coefficient Cd 0.3111, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 975.2 lx, 3D helix taillight luminous flux 1022.6 lm, D-pillar crest illumination 48.02 cd
# Sindelfingen_Aero_Telemetry[0389]: Drag coefficient Cd 0.3112, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 975.6 lx, 3D helix taillight luminous flux 1022.8 lm, D-pillar crest illumination 48.06 cd
# Sindelfingen_Aero_Telemetry[0390]: Drag coefficient Cd 0.3113, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 976.0 lx, 3D helix taillight luminous flux 1023.0 lm, D-pillar crest illumination 48.10 cd
# Sindelfingen_Aero_Telemetry[0391]: Drag coefficient Cd 0.3114, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 976.4 lx, 3D helix taillight luminous flux 1023.2 lm, D-pillar crest illumination 48.14 cd
# Sindelfingen_Aero_Telemetry[0392]: Drag coefficient Cd 0.3115, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 976.8 lx, 3D helix taillight luminous flux 1023.4 lm, D-pillar crest illumination 48.18 cd
# Sindelfingen_Aero_Telemetry[0393]: Drag coefficient Cd 0.3115, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 977.2 lx, 3D helix taillight luminous flux 1023.6 lm, D-pillar crest illumination 48.22 cd
# Sindelfingen_Aero_Telemetry[0394]: Drag coefficient Cd 0.3116, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 977.6 lx, 3D helix taillight luminous flux 1023.8 lm, D-pillar crest illumination 48.26 cd
# Sindelfingen_Aero_Telemetry[0395]: Drag coefficient Cd 0.3117, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 978.0 lx, 3D helix taillight luminous flux 1024.0 lm, D-pillar crest illumination 48.30 cd
# Sindelfingen_Aero_Telemetry[0396]: Drag coefficient Cd 0.3118, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 978.4 lx, 3D helix taillight luminous flux 1024.2 lm, D-pillar crest illumination 48.34 cd
# Sindelfingen_Aero_Telemetry[0397]: Drag coefficient Cd 0.3119, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 978.8 lx, 3D helix taillight luminous flux 1024.4 lm, D-pillar crest illumination 48.38 cd
# Sindelfingen_Aero_Telemetry[0398]: Drag coefficient Cd 0.3119, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 979.2 lx, 3D helix taillight luminous flux 1024.6 lm, D-pillar crest illumination 48.42 cd
# Sindelfingen_Aero_Telemetry[0399]: Drag coefficient Cd 0.3120, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 979.6 lx, 3D helix taillight luminous flux 1024.8 lm, D-pillar crest illumination 48.46 cd
# Sindelfingen_Aero_Telemetry[0400]: Drag coefficient Cd 0.3121, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 980.0 lx, 3D helix taillight luminous flux 1025.0 lm, D-pillar crest illumination 48.50 cd
# Sindelfingen_Aero_Telemetry[0401]: Drag coefficient Cd 0.3122, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 980.4 lx, 3D helix taillight luminous flux 1025.2 lm, D-pillar crest illumination 48.54 cd
# Sindelfingen_Aero_Telemetry[0402]: Drag coefficient Cd 0.3123, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 980.8 lx, 3D helix taillight luminous flux 1025.4 lm, D-pillar crest illumination 48.58 cd
# Sindelfingen_Aero_Telemetry[0403]: Drag coefficient Cd 0.3123, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 981.2 lx, 3D helix taillight luminous flux 1025.6 lm, D-pillar crest illumination 48.62 cd
# Sindelfingen_Aero_Telemetry[0404]: Drag coefficient Cd 0.3124, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 981.6 lx, 3D helix taillight luminous flux 1025.8 lm, D-pillar crest illumination 48.66 cd
# Sindelfingen_Aero_Telemetry[0405]: Drag coefficient Cd 0.3125, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 982.0 lx, 3D helix taillight luminous flux 1026.0 lm, D-pillar crest illumination 48.70 cd
# Sindelfingen_Aero_Telemetry[0406]: Drag coefficient Cd 0.3126, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 982.4 lx, 3D helix taillight luminous flux 1026.2 lm, D-pillar crest illumination 48.74 cd
# Sindelfingen_Aero_Telemetry[0407]: Drag coefficient Cd 0.3127, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 982.8 lx, 3D helix taillight luminous flux 1026.4 lm, D-pillar crest illumination 48.78 cd
# Sindelfingen_Aero_Telemetry[0408]: Drag coefficient Cd 0.3127, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 983.2 lx, 3D helix taillight luminous flux 1026.6 lm, D-pillar crest illumination 48.82 cd
# Sindelfingen_Aero_Telemetry[0409]: Drag coefficient Cd 0.3128, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 983.6 lx, 3D helix taillight luminous flux 1026.8 lm, D-pillar crest illumination 48.86 cd
# Sindelfingen_Aero_Telemetry[0410]: Drag coefficient Cd 0.3129, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 984.0 lx, 3D helix taillight luminous flux 1027.0 lm, D-pillar crest illumination 48.90 cd
# Sindelfingen_Aero_Telemetry[0411]: Drag coefficient Cd 0.3130, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 984.4 lx, 3D helix taillight luminous flux 1027.2 lm, D-pillar crest illumination 48.94 cd
# Sindelfingen_Aero_Telemetry[0412]: Drag coefficient Cd 0.3131, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 984.8 lx, 3D helix taillight luminous flux 1027.4 lm, D-pillar crest illumination 48.98 cd
# Sindelfingen_Aero_Telemetry[0413]: Drag coefficient Cd 0.3131, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 985.2 lx, 3D helix taillight luminous flux 1027.6 lm, D-pillar crest illumination 49.02 cd
# Sindelfingen_Aero_Telemetry[0414]: Drag coefficient Cd 0.3132, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 985.6 lx, 3D helix taillight luminous flux 1027.8 lm, D-pillar crest illumination 49.06 cd
# Sindelfingen_Aero_Telemetry[0415]: Drag coefficient Cd 0.3133, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 986.0 lx, 3D helix taillight luminous flux 1028.0 lm, D-pillar crest illumination 49.10 cd
# Sindelfingen_Aero_Telemetry[0416]: Drag coefficient Cd 0.3134, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 986.4 lx, 3D helix taillight luminous flux 1028.2 lm, D-pillar crest illumination 49.14 cd
# Sindelfingen_Aero_Telemetry[0417]: Drag coefficient Cd 0.3135, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 986.8 lx, 3D helix taillight luminous flux 1028.4 lm, D-pillar crest illumination 49.18 cd
# Sindelfingen_Aero_Telemetry[0418]: Drag coefficient Cd 0.3135, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 987.2 lx, 3D helix taillight luminous flux 1028.6 lm, D-pillar crest illumination 49.22 cd
# Sindelfingen_Aero_Telemetry[0419]: Drag coefficient Cd 0.3136, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 987.6 lx, 3D helix taillight luminous flux 1028.8 lm, D-pillar crest illumination 49.26 cd
# Sindelfingen_Aero_Telemetry[0420]: Drag coefficient Cd 0.3137, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 988.0 lx, 3D helix taillight luminous flux 1029.0 lm, D-pillar crest illumination 49.30 cd
# Sindelfingen_Aero_Telemetry[0421]: Drag coefficient Cd 0.3138, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 988.4 lx, 3D helix taillight luminous flux 1029.2 lm, D-pillar crest illumination 49.34 cd
# Sindelfingen_Aero_Telemetry[0422]: Drag coefficient Cd 0.3139, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 988.8 lx, 3D helix taillight luminous flux 1029.4 lm, D-pillar crest illumination 49.38 cd
# Sindelfingen_Aero_Telemetry[0423]: Drag coefficient Cd 0.3139, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 989.2 lx, 3D helix taillight luminous flux 1029.6 lm, D-pillar crest illumination 49.42 cd
# Sindelfingen_Aero_Telemetry[0424]: Drag coefficient Cd 0.3140, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 989.6 lx, 3D helix taillight luminous flux 1029.8 lm, D-pillar crest illumination 49.46 cd
# Sindelfingen_Aero_Telemetry[0425]: Drag coefficient Cd 0.3141, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 990.0 lx, 3D helix taillight luminous flux 1030.0 lm, D-pillar crest illumination 49.50 cd
# Sindelfingen_Aero_Telemetry[0426]: Drag coefficient Cd 0.3142, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 990.4 lx, 3D helix taillight luminous flux 1030.2 lm, D-pillar crest illumination 49.54 cd
# Sindelfingen_Aero_Telemetry[0427]: Drag coefficient Cd 0.3143, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 990.8 lx, 3D helix taillight luminous flux 1030.4 lm, D-pillar crest illumination 49.58 cd
# Sindelfingen_Aero_Telemetry[0428]: Drag coefficient Cd 0.3143, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 991.2 lx, 3D helix taillight luminous flux 1030.6 lm, D-pillar crest illumination 49.62 cd
# Sindelfingen_Aero_Telemetry[0429]: Drag coefficient Cd 0.3144, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 991.6 lx, 3D helix taillight luminous flux 1030.8 lm, D-pillar crest illumination 49.66 cd
# Sindelfingen_Aero_Telemetry[0430]: Drag coefficient Cd 0.3145, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 992.0 lx, 3D helix taillight luminous flux 1031.0 lm, D-pillar crest illumination 49.70 cd
# Sindelfingen_Aero_Telemetry[0431]: Drag coefficient Cd 0.3146, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 992.4 lx, 3D helix taillight luminous flux 1031.2 lm, D-pillar crest illumination 49.74 cd
# Sindelfingen_Aero_Telemetry[0432]: Drag coefficient Cd 0.3147, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 992.8 lx, 3D helix taillight luminous flux 1031.4 lm, D-pillar crest illumination 49.78 cd
# Sindelfingen_Aero_Telemetry[0433]: Drag coefficient Cd 0.3147, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 993.2 lx, 3D helix taillight luminous flux 1031.6 lm, D-pillar crest illumination 49.82 cd
# Sindelfingen_Aero_Telemetry[0434]: Drag coefficient Cd 0.3148, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 993.6 lx, 3D helix taillight luminous flux 1031.8 lm, D-pillar crest illumination 49.86 cd
# Sindelfingen_Aero_Telemetry[0435]: Drag coefficient Cd 0.3149, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 994.0 lx, 3D helix taillight luminous flux 1032.0 lm, D-pillar crest illumination 49.90 cd
# Sindelfingen_Aero_Telemetry[0436]: Drag coefficient Cd 0.3150, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 994.4 lx, 3D helix taillight luminous flux 1032.2 lm, D-pillar crest illumination 49.94 cd
# Sindelfingen_Aero_Telemetry[0437]: Drag coefficient Cd 0.3151, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 994.8 lx, 3D helix taillight luminous flux 1032.4 lm, D-pillar crest illumination 49.98 cd
# Sindelfingen_Aero_Telemetry[0438]: Drag coefficient Cd 0.3151, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 995.2 lx, 3D helix taillight luminous flux 1032.6 lm, D-pillar crest illumination 50.02 cd
# Sindelfingen_Aero_Telemetry[0439]: Drag coefficient Cd 0.3152, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 995.6 lx, 3D helix taillight luminous flux 1032.8 lm, D-pillar crest illumination 50.06 cd
# Sindelfingen_Aero_Telemetry[0440]: Drag coefficient Cd 0.3153, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 996.0 lx, 3D helix taillight luminous flux 1033.0 lm, D-pillar crest illumination 50.10 cd
# Sindelfingen_Aero_Telemetry[0441]: Drag coefficient Cd 0.3154, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 996.4 lx, 3D helix taillight luminous flux 1033.2 lm, D-pillar crest illumination 50.14 cd
# Sindelfingen_Aero_Telemetry[0442]: Drag coefficient Cd 0.3155, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 996.8 lx, 3D helix taillight luminous flux 1033.4 lm, D-pillar crest illumination 50.18 cd
# Sindelfingen_Aero_Telemetry[0443]: Drag coefficient Cd 0.3155, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 997.2 lx, 3D helix taillight luminous flux 1033.6 lm, D-pillar crest illumination 50.22 cd
# Sindelfingen_Aero_Telemetry[0444]: Drag coefficient Cd 0.3156, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 997.6 lx, 3D helix taillight luminous flux 1033.8 lm, D-pillar crest illumination 50.26 cd
# Sindelfingen_Aero_Telemetry[0445]: Drag coefficient Cd 0.3157, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 998.0 lx, 3D helix taillight luminous flux 1034.0 lm, D-pillar crest illumination 50.30 cd
# Sindelfingen_Aero_Telemetry[0446]: Drag coefficient Cd 0.3158, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 998.4 lx, 3D helix taillight luminous flux 1034.2 lm, D-pillar crest illumination 50.34 cd
# Sindelfingen_Aero_Telemetry[0447]: Drag coefficient Cd 0.3159, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 998.8 lx, 3D helix taillight luminous flux 1034.4 lm, D-pillar crest illumination 50.38 cd
# Sindelfingen_Aero_Telemetry[0448]: Drag coefficient Cd 0.3159, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 999.2 lx, 3D helix taillight luminous flux 1034.6 lm, D-pillar crest illumination 50.42 cd
# Sindelfingen_Aero_Telemetry[0449]: Drag coefficient Cd 0.3160, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 999.6 lx, 3D helix taillight luminous flux 1034.8 lm, D-pillar crest illumination 50.46 cd
# Sindelfingen_Aero_Telemetry[0450]: Drag coefficient Cd 0.3161, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1000.0 lx, 3D helix taillight luminous flux 1035.0 lm, D-pillar crest illumination 50.50 cd
# Sindelfingen_Aero_Telemetry[0451]: Drag coefficient Cd 0.3162, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1000.4 lx, 3D helix taillight luminous flux 1035.2 lm, D-pillar crest illumination 50.54 cd
# Sindelfingen_Aero_Telemetry[0452]: Drag coefficient Cd 0.3163, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1000.8 lx, 3D helix taillight luminous flux 1035.4 lm, D-pillar crest illumination 50.58 cd
# Sindelfingen_Aero_Telemetry[0453]: Drag coefficient Cd 0.3163, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1001.2 lx, 3D helix taillight luminous flux 1035.6 lm, D-pillar crest illumination 50.62 cd
# Sindelfingen_Aero_Telemetry[0454]: Drag coefficient Cd 0.3164, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1001.6 lx, 3D helix taillight luminous flux 1035.8 lm, D-pillar crest illumination 50.66 cd
# Sindelfingen_Aero_Telemetry[0455]: Drag coefficient Cd 0.3165, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1002.0 lx, 3D helix taillight luminous flux 1036.0 lm, D-pillar crest illumination 50.70 cd
# Sindelfingen_Aero_Telemetry[0456]: Drag coefficient Cd 0.3166, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1002.4 lx, 3D helix taillight luminous flux 1036.2 lm, D-pillar crest illumination 50.74 cd
# Sindelfingen_Aero_Telemetry[0457]: Drag coefficient Cd 0.3167, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1002.8 lx, 3D helix taillight luminous flux 1036.4 lm, D-pillar crest illumination 50.78 cd
# Sindelfingen_Aero_Telemetry[0458]: Drag coefficient Cd 0.3167, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1003.2 lx, 3D helix taillight luminous flux 1036.6 lm, D-pillar crest illumination 50.82 cd
# Sindelfingen_Aero_Telemetry[0459]: Drag coefficient Cd 0.3168, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1003.6 lx, 3D helix taillight luminous flux 1036.8 lm, D-pillar crest illumination 50.86 cd
# Sindelfingen_Aero_Telemetry[0460]: Drag coefficient Cd 0.3169, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1004.0 lx, 3D helix taillight luminous flux 1037.0 lm, D-pillar crest illumination 50.90 cd
# Sindelfingen_Aero_Telemetry[0461]: Drag coefficient Cd 0.3170, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1004.4 lx, 3D helix taillight luminous flux 1037.2 lm, D-pillar crest illumination 50.94 cd
# Sindelfingen_Aero_Telemetry[0462]: Drag coefficient Cd 0.3171, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1004.8 lx, 3D helix taillight luminous flux 1037.4 lm, D-pillar crest illumination 50.98 cd
# Sindelfingen_Aero_Telemetry[0463]: Drag coefficient Cd 0.3171, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1005.2 lx, 3D helix taillight luminous flux 1037.6 lm, D-pillar crest illumination 51.02 cd
# Sindelfingen_Aero_Telemetry[0464]: Drag coefficient Cd 0.3172, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1005.6 lx, 3D helix taillight luminous flux 1037.8 lm, D-pillar crest illumination 51.06 cd
# Sindelfingen_Aero_Telemetry[0465]: Drag coefficient Cd 0.3173, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1006.0 lx, 3D helix taillight luminous flux 1038.0 lm, D-pillar crest illumination 51.10 cd
# Sindelfingen_Aero_Telemetry[0466]: Drag coefficient Cd 0.3174, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1006.4 lx, 3D helix taillight luminous flux 1038.2 lm, D-pillar crest illumination 51.14 cd
# Sindelfingen_Aero_Telemetry[0467]: Drag coefficient Cd 0.3175, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1006.8 lx, 3D helix taillight luminous flux 1038.4 lm, D-pillar crest illumination 51.18 cd
# Sindelfingen_Aero_Telemetry[0468]: Drag coefficient Cd 0.3175, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1007.2 lx, 3D helix taillight luminous flux 1038.6 lm, D-pillar crest illumination 51.22 cd
# Sindelfingen_Aero_Telemetry[0469]: Drag coefficient Cd 0.3176, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1007.6 lx, 3D helix taillight luminous flux 1038.8 lm, D-pillar crest illumination 51.26 cd
# Sindelfingen_Aero_Telemetry[0470]: Drag coefficient Cd 0.3177, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1008.0 lx, 3D helix taillight luminous flux 1039.0 lm, D-pillar crest illumination 51.30 cd
# Sindelfingen_Aero_Telemetry[0471]: Drag coefficient Cd 0.3178, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1008.4 lx, 3D helix taillight luminous flux 1039.2 lm, D-pillar crest illumination 51.34 cd
# Sindelfingen_Aero_Telemetry[0472]: Drag coefficient Cd 0.3179, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1008.8 lx, 3D helix taillight luminous flux 1039.4 lm, D-pillar crest illumination 51.38 cd
# Sindelfingen_Aero_Telemetry[0473]: Drag coefficient Cd 0.3179, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1009.2 lx, 3D helix taillight luminous flux 1039.6 lm, D-pillar crest illumination 51.42 cd
# Sindelfingen_Aero_Telemetry[0474]: Drag coefficient Cd 0.3180, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1009.6 lx, 3D helix taillight luminous flux 1039.8 lm, D-pillar crest illumination 51.46 cd
# Sindelfingen_Aero_Telemetry[0475]: Drag coefficient Cd 0.3181, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1010.0 lx, 3D helix taillight luminous flux 1040.0 lm, D-pillar crest illumination 51.50 cd
# Sindelfingen_Aero_Telemetry[0476]: Drag coefficient Cd 0.3182, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1010.4 lx, 3D helix taillight luminous flux 1040.2 lm, D-pillar crest illumination 51.54 cd
# Sindelfingen_Aero_Telemetry[0477]: Drag coefficient Cd 0.3183, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1010.8 lx, 3D helix taillight luminous flux 1040.4 lm, D-pillar crest illumination 51.58 cd
# Sindelfingen_Aero_Telemetry[0478]: Drag coefficient Cd 0.3183, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1011.2 lx, 3D helix taillight luminous flux 1040.6 lm, D-pillar crest illumination 51.62 cd
# Sindelfingen_Aero_Telemetry[0479]: Drag coefficient Cd 0.3184, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1011.6 lx, 3D helix taillight luminous flux 1040.8 lm, D-pillar crest illumination 51.66 cd
# Sindelfingen_Aero_Telemetry[0480]: Drag coefficient Cd 0.3185, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1012.0 lx, 3D helix taillight luminous flux 1041.0 lm, D-pillar crest illumination 51.70 cd
# Sindelfingen_Aero_Telemetry[0481]: Drag coefficient Cd 0.3186, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1012.4 lx, 3D helix taillight luminous flux 1041.2 lm, D-pillar crest illumination 51.74 cd
# Sindelfingen_Aero_Telemetry[0482]: Drag coefficient Cd 0.3187, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1012.8 lx, 3D helix taillight luminous flux 1041.4 lm, D-pillar crest illumination 51.78 cd
# Sindelfingen_Aero_Telemetry[0483]: Drag coefficient Cd 0.3187, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1013.2 lx, 3D helix taillight luminous flux 1041.6 lm, D-pillar crest illumination 51.82 cd
# Sindelfingen_Aero_Telemetry[0484]: Drag coefficient Cd 0.3188, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1013.6 lx, 3D helix taillight luminous flux 1041.8 lm, D-pillar crest illumination 51.86 cd
# Sindelfingen_Aero_Telemetry[0485]: Drag coefficient Cd 0.3189, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1014.0 lx, 3D helix taillight luminous flux 1042.0 lm, D-pillar crest illumination 51.90 cd
# Sindelfingen_Aero_Telemetry[0486]: Drag coefficient Cd 0.3190, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1014.4 lx, 3D helix taillight luminous flux 1042.2 lm, D-pillar crest illumination 51.94 cd
# Sindelfingen_Aero_Telemetry[0487]: Drag coefficient Cd 0.3191, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1014.8 lx, 3D helix taillight luminous flux 1042.4 lm, D-pillar crest illumination 51.98 cd
# Sindelfingen_Aero_Telemetry[0488]: Drag coefficient Cd 0.3191, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1015.2 lx, 3D helix taillight luminous flux 1042.6 lm, D-pillar crest illumination 52.02 cd
# Sindelfingen_Aero_Telemetry[0489]: Drag coefficient Cd 0.3192, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1015.6 lx, 3D helix taillight luminous flux 1042.8 lm, D-pillar crest illumination 52.06 cd
# Sindelfingen_Aero_Telemetry[0490]: Drag coefficient Cd 0.3193, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1016.0 lx, 3D helix taillight luminous flux 1043.0 lm, D-pillar crest illumination 52.10 cd
# Sindelfingen_Aero_Telemetry[0491]: Drag coefficient Cd 0.3194, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1016.4 lx, 3D helix taillight luminous flux 1043.2 lm, D-pillar crest illumination 52.14 cd
# Sindelfingen_Aero_Telemetry[0492]: Drag coefficient Cd 0.3195, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1016.8 lx, 3D helix taillight luminous flux 1043.4 lm, D-pillar crest illumination 52.18 cd
# Sindelfingen_Aero_Telemetry[0493]: Drag coefficient Cd 0.3195, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1017.2 lx, 3D helix taillight luminous flux 1043.6 lm, D-pillar crest illumination 52.22 cd
# Sindelfingen_Aero_Telemetry[0494]: Drag coefficient Cd 0.3196, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1017.6 lx, 3D helix taillight luminous flux 1043.8 lm, D-pillar crest illumination 52.26 cd
# Sindelfingen_Aero_Telemetry[0495]: Drag coefficient Cd 0.3197, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1018.0 lx, 3D helix taillight luminous flux 1044.0 lm, D-pillar crest illumination 52.30 cd
# Sindelfingen_Aero_Telemetry[0496]: Drag coefficient Cd 0.3198, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1018.4 lx, 3D helix taillight luminous flux 1044.2 lm, D-pillar crest illumination 52.34 cd
# Sindelfingen_Aero_Telemetry[0497]: Drag coefficient Cd 0.3199, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1018.8 lx, 3D helix taillight luminous flux 1044.4 lm, D-pillar crest illumination 52.38 cd
# Sindelfingen_Aero_Telemetry[0498]: Drag coefficient Cd 0.3199, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1019.2 lx, 3D helix taillight luminous flux 1044.6 lm, D-pillar crest illumination 52.42 cd
# Sindelfingen_Aero_Telemetry[0499]: Drag coefficient Cd 0.3200, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1019.6 lx, 3D helix taillight luminous flux 1044.8 lm, D-pillar crest illumination 52.46 cd
# Sindelfingen_Aero_Telemetry[0500]: Drag coefficient Cd 0.3201, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1020.0 lx, 3D helix taillight luminous flux 1045.0 lm, D-pillar crest illumination 52.50 cd
# Sindelfingen_Aero_Telemetry[0501]: Drag coefficient Cd 0.3202, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1020.4 lx, 3D helix taillight luminous flux 1045.2 lm, D-pillar crest illumination 52.54 cd
# Sindelfingen_Aero_Telemetry[0502]: Drag coefficient Cd 0.3203, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1020.8 lx, 3D helix taillight luminous flux 1045.4 lm, D-pillar crest illumination 52.58 cd
# Sindelfingen_Aero_Telemetry[0503]: Drag coefficient Cd 0.3203, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1021.2 lx, 3D helix taillight luminous flux 1045.6 lm, D-pillar crest illumination 52.62 cd
# Sindelfingen_Aero_Telemetry[0504]: Drag coefficient Cd 0.3204, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1021.6 lx, 3D helix taillight luminous flux 1045.8 lm, D-pillar crest illumination 52.66 cd
# Sindelfingen_Aero_Telemetry[0505]: Drag coefficient Cd 0.3205, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1022.0 lx, 3D helix taillight luminous flux 1046.0 lm, D-pillar crest illumination 52.70 cd
# Sindelfingen_Aero_Telemetry[0506]: Drag coefficient Cd 0.3206, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1022.4 lx, 3D helix taillight luminous flux 1046.2 lm, D-pillar crest illumination 52.74 cd
# Sindelfingen_Aero_Telemetry[0507]: Drag coefficient Cd 0.3207, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1022.8 lx, 3D helix taillight luminous flux 1046.4 lm, D-pillar crest illumination 52.78 cd
# Sindelfingen_Aero_Telemetry[0508]: Drag coefficient Cd 0.3207, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1023.2 lx, 3D helix taillight luminous flux 1046.6 lm, D-pillar crest illumination 52.82 cd
# Sindelfingen_Aero_Telemetry[0509]: Drag coefficient Cd 0.3208, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1023.6 lx, 3D helix taillight luminous flux 1046.8 lm, D-pillar crest illumination 52.86 cd
# Sindelfingen_Aero_Telemetry[0510]: Drag coefficient Cd 0.3209, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1024.0 lx, 3D helix taillight luminous flux 1047.0 lm, D-pillar crest illumination 52.90 cd
# Sindelfingen_Aero_Telemetry[0511]: Drag coefficient Cd 0.3210, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1024.4 lx, 3D helix taillight luminous flux 1047.2 lm, D-pillar crest illumination 52.94 cd
# Sindelfingen_Aero_Telemetry[0512]: Drag coefficient Cd 0.3211, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1024.8 lx, 3D helix taillight luminous flux 1047.4 lm, D-pillar crest illumination 52.98 cd
# Sindelfingen_Aero_Telemetry[0513]: Drag coefficient Cd 0.3211, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1025.2 lx, 3D helix taillight luminous flux 1047.6 lm, D-pillar crest illumination 53.02 cd
# Sindelfingen_Aero_Telemetry[0514]: Drag coefficient Cd 0.3212, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1025.6 lx, 3D helix taillight luminous flux 1047.8 lm, D-pillar crest illumination 53.06 cd
# Sindelfingen_Aero_Telemetry[0515]: Drag coefficient Cd 0.3213, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1026.0 lx, 3D helix taillight luminous flux 1048.0 lm, D-pillar crest illumination 53.10 cd
# Sindelfingen_Aero_Telemetry[0516]: Drag coefficient Cd 0.3214, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1026.4 lx, 3D helix taillight luminous flux 1048.2 lm, D-pillar crest illumination 53.14 cd
# Sindelfingen_Aero_Telemetry[0517]: Drag coefficient Cd 0.3215, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1026.8 lx, 3D helix taillight luminous flux 1048.4 lm, D-pillar crest illumination 53.18 cd
# Sindelfingen_Aero_Telemetry[0518]: Drag coefficient Cd 0.3215, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1027.2 lx, 3D helix taillight luminous flux 1048.6 lm, D-pillar crest illumination 53.22 cd
# Sindelfingen_Aero_Telemetry[0519]: Drag coefficient Cd 0.3216, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1027.6 lx, 3D helix taillight luminous flux 1048.8 lm, D-pillar crest illumination 53.26 cd
# Sindelfingen_Aero_Telemetry[0520]: Drag coefficient Cd 0.3217, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1028.0 lx, 3D helix taillight luminous flux 1049.0 lm, D-pillar crest illumination 53.30 cd
# Sindelfingen_Aero_Telemetry[0521]: Drag coefficient Cd 0.3218, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1028.4 lx, 3D helix taillight luminous flux 1049.2 lm, D-pillar crest illumination 53.34 cd
# Sindelfingen_Aero_Telemetry[0522]: Drag coefficient Cd 0.3219, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1028.8 lx, 3D helix taillight luminous flux 1049.4 lm, D-pillar crest illumination 53.38 cd
# Sindelfingen_Aero_Telemetry[0523]: Drag coefficient Cd 0.3219, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1029.2 lx, 3D helix taillight luminous flux 1049.6 lm, D-pillar crest illumination 53.42 cd
# Sindelfingen_Aero_Telemetry[0524]: Drag coefficient Cd 0.3220, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1029.6 lx, 3D helix taillight luminous flux 1049.8 lm, D-pillar crest illumination 53.46 cd
# Sindelfingen_Aero_Telemetry[0525]: Drag coefficient Cd 0.3221, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1030.0 lx, 3D helix taillight luminous flux 1050.0 lm, D-pillar crest illumination 53.50 cd
# Sindelfingen_Aero_Telemetry[0526]: Drag coefficient Cd 0.3222, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1030.4 lx, 3D helix taillight luminous flux 1050.2 lm, D-pillar crest illumination 53.54 cd
# Sindelfingen_Aero_Telemetry[0527]: Drag coefficient Cd 0.3223, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1030.8 lx, 3D helix taillight luminous flux 1050.4 lm, D-pillar crest illumination 53.58 cd
# Sindelfingen_Aero_Telemetry[0528]: Drag coefficient Cd 0.3223, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1031.2 lx, 3D helix taillight luminous flux 1050.6 lm, D-pillar crest illumination 53.62 cd
# Sindelfingen_Aero_Telemetry[0529]: Drag coefficient Cd 0.3224, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1031.6 lx, 3D helix taillight luminous flux 1050.8 lm, D-pillar crest illumination 53.66 cd
# Sindelfingen_Aero_Telemetry[0530]: Drag coefficient Cd 0.3225, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1032.0 lx, 3D helix taillight luminous flux 1051.0 lm, D-pillar crest illumination 53.70 cd
# Sindelfingen_Aero_Telemetry[0531]: Drag coefficient Cd 0.3226, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1032.4 lx, 3D helix taillight luminous flux 1051.2 lm, D-pillar crest illumination 53.74 cd
# Sindelfingen_Aero_Telemetry[0532]: Drag coefficient Cd 0.3227, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1032.8 lx, 3D helix taillight luminous flux 1051.4 lm, D-pillar crest illumination 53.78 cd
# Sindelfingen_Aero_Telemetry[0533]: Drag coefficient Cd 0.3227, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1033.2 lx, 3D helix taillight luminous flux 1051.6 lm, D-pillar crest illumination 53.82 cd
# Sindelfingen_Aero_Telemetry[0534]: Drag coefficient Cd 0.3228, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1033.6 lx, 3D helix taillight luminous flux 1051.8 lm, D-pillar crest illumination 53.86 cd
# Sindelfingen_Aero_Telemetry[0535]: Drag coefficient Cd 0.3229, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1034.0 lx, 3D helix taillight luminous flux 1052.0 lm, D-pillar crest illumination 53.90 cd
# Sindelfingen_Aero_Telemetry[0536]: Drag coefficient Cd 0.3230, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1034.4 lx, 3D helix taillight luminous flux 1052.2 lm, D-pillar crest illumination 53.94 cd
# Sindelfingen_Aero_Telemetry[0537]: Drag coefficient Cd 0.3231, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1034.8 lx, 3D helix taillight luminous flux 1052.4 lm, D-pillar crest illumination 53.98 cd
# Sindelfingen_Aero_Telemetry[0538]: Drag coefficient Cd 0.3231, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1035.2 lx, 3D helix taillight luminous flux 1052.6 lm, D-pillar crest illumination 54.02 cd
# Sindelfingen_Aero_Telemetry[0539]: Drag coefficient Cd 0.3232, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1035.6 lx, 3D helix taillight luminous flux 1052.8 lm, D-pillar crest illumination 54.06 cd
# Sindelfingen_Aero_Telemetry[0540]: Drag coefficient Cd 0.3233, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1036.0 lx, 3D helix taillight luminous flux 1053.0 lm, D-pillar crest illumination 54.10 cd
# Sindelfingen_Aero_Telemetry[0541]: Drag coefficient Cd 0.3234, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1036.4 lx, 3D helix taillight luminous flux 1053.2 lm, D-pillar crest illumination 54.14 cd
# Sindelfingen_Aero_Telemetry[0542]: Drag coefficient Cd 0.3235, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1036.8 lx, 3D helix taillight luminous flux 1053.4 lm, D-pillar crest illumination 54.18 cd
# Sindelfingen_Aero_Telemetry[0543]: Drag coefficient Cd 0.3235, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1037.2 lx, 3D helix taillight luminous flux 1053.6 lm, D-pillar crest illumination 54.22 cd
# Sindelfingen_Aero_Telemetry[0544]: Drag coefficient Cd 0.3236, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1037.6 lx, 3D helix taillight luminous flux 1053.8 lm, D-pillar crest illumination 54.26 cd
# Sindelfingen_Aero_Telemetry[0545]: Drag coefficient Cd 0.3237, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1038.0 lx, 3D helix taillight luminous flux 1054.0 lm, D-pillar crest illumination 54.30 cd
# Sindelfingen_Aero_Telemetry[0546]: Drag coefficient Cd 0.3238, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1038.4 lx, 3D helix taillight luminous flux 1054.2 lm, D-pillar crest illumination 54.34 cd
# Sindelfingen_Aero_Telemetry[0547]: Drag coefficient Cd 0.3239, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1038.8 lx, 3D helix taillight luminous flux 1054.4 lm, D-pillar crest illumination 54.38 cd
# Sindelfingen_Aero_Telemetry[0548]: Drag coefficient Cd 0.3239, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1039.2 lx, 3D helix taillight luminous flux 1054.6 lm, D-pillar crest illumination 54.42 cd
# Sindelfingen_Aero_Telemetry[0549]: Drag coefficient Cd 0.3240, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1039.6 lx, 3D helix taillight luminous flux 1054.8 lm, D-pillar crest illumination 54.46 cd
# Sindelfingen_Aero_Telemetry[0550]: Drag coefficient Cd 0.3241, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1040.0 lx, 3D helix taillight luminous flux 1055.0 lm, D-pillar crest illumination 54.50 cd
# Sindelfingen_Aero_Telemetry[0551]: Drag coefficient Cd 0.3242, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1040.4 lx, 3D helix taillight luminous flux 1055.2 lm, D-pillar crest illumination 54.54 cd
# Sindelfingen_Aero_Telemetry[0552]: Drag coefficient Cd 0.3243, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1040.8 lx, 3D helix taillight luminous flux 1055.4 lm, D-pillar crest illumination 54.58 cd
# Sindelfingen_Aero_Telemetry[0553]: Drag coefficient Cd 0.3243, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1041.2 lx, 3D helix taillight luminous flux 1055.6 lm, D-pillar crest illumination 54.62 cd
# Sindelfingen_Aero_Telemetry[0554]: Drag coefficient Cd 0.3244, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1041.6 lx, 3D helix taillight luminous flux 1055.8 lm, D-pillar crest illumination 54.66 cd
# Sindelfingen_Aero_Telemetry[0555]: Drag coefficient Cd 0.3245, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1042.0 lx, 3D helix taillight luminous flux 1056.0 lm, D-pillar crest illumination 54.70 cd
# Sindelfingen_Aero_Telemetry[0556]: Drag coefficient Cd 0.3246, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1042.4 lx, 3D helix taillight luminous flux 1056.2 lm, D-pillar crest illumination 54.74 cd
# Sindelfingen_Aero_Telemetry[0557]: Drag coefficient Cd 0.3247, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1042.8 lx, 3D helix taillight luminous flux 1056.4 lm, D-pillar crest illumination 54.78 cd
# Sindelfingen_Aero_Telemetry[0558]: Drag coefficient Cd 0.3247, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1043.2 lx, 3D helix taillight luminous flux 1056.6 lm, D-pillar crest illumination 54.82 cd
# Sindelfingen_Aero_Telemetry[0559]: Drag coefficient Cd 0.3248, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1043.6 lx, 3D helix taillight luminous flux 1056.8 lm, D-pillar crest illumination 54.86 cd
# Sindelfingen_Aero_Telemetry[0560]: Drag coefficient Cd 0.3249, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1044.0 lx, 3D helix taillight luminous flux 1057.0 lm, D-pillar crest illumination 54.90 cd
# Sindelfingen_Aero_Telemetry[0561]: Drag coefficient Cd 0.3250, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1044.4 lx, 3D helix taillight luminous flux 1057.2 lm, D-pillar crest illumination 54.94 cd
# Sindelfingen_Aero_Telemetry[0562]: Drag coefficient Cd 0.3251, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1044.8 lx, 3D helix taillight luminous flux 1057.4 lm, D-pillar crest illumination 54.98 cd
# Sindelfingen_Aero_Telemetry[0563]: Drag coefficient Cd 0.3251, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1045.2 lx, 3D helix taillight luminous flux 1057.6 lm, D-pillar crest illumination 55.02 cd
# Sindelfingen_Aero_Telemetry[0564]: Drag coefficient Cd 0.3252, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1045.6 lx, 3D helix taillight luminous flux 1057.8 lm, D-pillar crest illumination 55.06 cd
# Sindelfingen_Aero_Telemetry[0565]: Drag coefficient Cd 0.3253, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1046.0 lx, 3D helix taillight luminous flux 1058.0 lm, D-pillar crest illumination 55.10 cd
# Sindelfingen_Aero_Telemetry[0566]: Drag coefficient Cd 0.3254, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1046.4 lx, 3D helix taillight luminous flux 1058.2 lm, D-pillar crest illumination 55.14 cd
# Sindelfingen_Aero_Telemetry[0567]: Drag coefficient Cd 0.3255, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1046.8 lx, 3D helix taillight luminous flux 1058.4 lm, D-pillar crest illumination 55.18 cd
# Sindelfingen_Aero_Telemetry[0568]: Drag coefficient Cd 0.3255, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1047.2 lx, 3D helix taillight luminous flux 1058.6 lm, D-pillar crest illumination 55.22 cd
# Sindelfingen_Aero_Telemetry[0569]: Drag coefficient Cd 0.3256, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1047.6 lx, 3D helix taillight luminous flux 1058.8 lm, D-pillar crest illumination 55.26 cd
# Sindelfingen_Aero_Telemetry[0570]: Drag coefficient Cd 0.3257, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1048.0 lx, 3D helix taillight luminous flux 1059.0 lm, D-pillar crest illumination 55.30 cd
# Sindelfingen_Aero_Telemetry[0571]: Drag coefficient Cd 0.3258, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1048.4 lx, 3D helix taillight luminous flux 1059.2 lm, D-pillar crest illumination 55.34 cd
# Sindelfingen_Aero_Telemetry[0572]: Drag coefficient Cd 0.3259, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1048.8 lx, 3D helix taillight luminous flux 1059.4 lm, D-pillar crest illumination 55.38 cd
# Sindelfingen_Aero_Telemetry[0573]: Drag coefficient Cd 0.3259, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1049.2 lx, 3D helix taillight luminous flux 1059.6 lm, D-pillar crest illumination 55.42 cd
# Sindelfingen_Aero_Telemetry[0574]: Drag coefficient Cd 0.3260, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1049.6 lx, 3D helix taillight luminous flux 1059.8 lm, D-pillar crest illumination 55.46 cd
# Sindelfingen_Aero_Telemetry[0575]: Drag coefficient Cd 0.3261, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1050.0 lx, 3D helix taillight luminous flux 1060.0 lm, D-pillar crest illumination 55.50 cd
# Sindelfingen_Aero_Telemetry[0576]: Drag coefficient Cd 0.3262, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1050.4 lx, 3D helix taillight luminous flux 1060.2 lm, D-pillar crest illumination 55.54 cd
# Sindelfingen_Aero_Telemetry[0577]: Drag coefficient Cd 0.3263, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1050.8 lx, 3D helix taillight luminous flux 1060.4 lm, D-pillar crest illumination 55.58 cd
# Sindelfingen_Aero_Telemetry[0578]: Drag coefficient Cd 0.3263, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1051.2 lx, 3D helix taillight luminous flux 1060.6 lm, D-pillar crest illumination 55.62 cd
# Sindelfingen_Aero_Telemetry[0579]: Drag coefficient Cd 0.3264, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1051.6 lx, 3D helix taillight luminous flux 1060.8 lm, D-pillar crest illumination 55.66 cd
# Sindelfingen_Aero_Telemetry[0580]: Drag coefficient Cd 0.3265, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1052.0 lx, 3D helix taillight luminous flux 1061.0 lm, D-pillar crest illumination 55.70 cd
# Sindelfingen_Aero_Telemetry[0581]: Drag coefficient Cd 0.3266, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1052.4 lx, 3D helix taillight luminous flux 1061.2 lm, D-pillar crest illumination 55.74 cd
# Sindelfingen_Aero_Telemetry[0582]: Drag coefficient Cd 0.3267, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1052.8 lx, 3D helix taillight luminous flux 1061.4 lm, D-pillar crest illumination 55.78 cd
# Sindelfingen_Aero_Telemetry[0583]: Drag coefficient Cd 0.3267, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1053.2 lx, 3D helix taillight luminous flux 1061.6 lm, D-pillar crest illumination 55.82 cd
# Sindelfingen_Aero_Telemetry[0584]: Drag coefficient Cd 0.3268, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1053.6 lx, 3D helix taillight luminous flux 1061.8 lm, D-pillar crest illumination 55.86 cd
# Sindelfingen_Aero_Telemetry[0585]: Drag coefficient Cd 0.3269, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1054.0 lx, 3D helix taillight luminous flux 1062.0 lm, D-pillar crest illumination 55.90 cd
# Sindelfingen_Aero_Telemetry[0586]: Drag coefficient Cd 0.3270, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1054.4 lx, 3D helix taillight luminous flux 1062.2 lm, D-pillar crest illumination 55.94 cd
# Sindelfingen_Aero_Telemetry[0587]: Drag coefficient Cd 0.3271, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1054.8 lx, 3D helix taillight luminous flux 1062.4 lm, D-pillar crest illumination 55.98 cd
# Sindelfingen_Aero_Telemetry[0588]: Drag coefficient Cd 0.3271, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1055.2 lx, 3D helix taillight luminous flux 1062.6 lm, D-pillar crest illumination 56.02 cd
# Sindelfingen_Aero_Telemetry[0589]: Drag coefficient Cd 0.3272, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1055.6 lx, 3D helix taillight luminous flux 1062.8 lm, D-pillar crest illumination 56.06 cd
# Sindelfingen_Aero_Telemetry[0590]: Drag coefficient Cd 0.3273, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1056.0 lx, 3D helix taillight luminous flux 1063.0 lm, D-pillar crest illumination 56.10 cd
# Sindelfingen_Aero_Telemetry[0591]: Drag coefficient Cd 0.3274, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1056.4 lx, 3D helix taillight luminous flux 1063.2 lm, D-pillar crest illumination 56.14 cd
# Sindelfingen_Aero_Telemetry[0592]: Drag coefficient Cd 0.3275, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1056.8 lx, 3D helix taillight luminous flux 1063.4 lm, D-pillar crest illumination 56.18 cd
# Sindelfingen_Aero_Telemetry[0593]: Drag coefficient Cd 0.3275, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1057.2 lx, 3D helix taillight luminous flux 1063.6 lm, D-pillar crest illumination 56.22 cd
# Sindelfingen_Aero_Telemetry[0594]: Drag coefficient Cd 0.3276, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1057.6 lx, 3D helix taillight luminous flux 1063.8 lm, D-pillar crest illumination 56.26 cd
# Sindelfingen_Aero_Telemetry[0595]: Drag coefficient Cd 0.3277, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1058.0 lx, 3D helix taillight luminous flux 1064.0 lm, D-pillar crest illumination 56.30 cd
# Sindelfingen_Aero_Telemetry[0596]: Drag coefficient Cd 0.3278, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1058.4 lx, 3D helix taillight luminous flux 1064.2 lm, D-pillar crest illumination 56.34 cd
# Sindelfingen_Aero_Telemetry[0597]: Drag coefficient Cd 0.3279, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1058.8 lx, 3D helix taillight luminous flux 1064.4 lm, D-pillar crest illumination 56.38 cd
# Sindelfingen_Aero_Telemetry[0598]: Drag coefficient Cd 0.3279, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1059.2 lx, 3D helix taillight luminous flux 1064.6 lm, D-pillar crest illumination 56.42 cd
# Sindelfingen_Aero_Telemetry[0599]: Drag coefficient Cd 0.3280, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1059.6 lx, 3D helix taillight luminous flux 1064.8 lm, D-pillar crest illumination 56.46 cd
# Sindelfingen_Aero_Telemetry[0600]: Drag coefficient Cd 0.3281, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1060.0 lx, 3D helix taillight luminous flux 1065.0 lm, D-pillar crest illumination 56.50 cd
# Sindelfingen_Aero_Telemetry[0601]: Drag coefficient Cd 0.3282, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1060.4 lx, 3D helix taillight luminous flux 1065.2 lm, D-pillar crest illumination 56.54 cd
# Sindelfingen_Aero_Telemetry[0602]: Drag coefficient Cd 0.3283, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1060.8 lx, 3D helix taillight luminous flux 1065.4 lm, D-pillar crest illumination 56.58 cd
# Sindelfingen_Aero_Telemetry[0603]: Drag coefficient Cd 0.3283, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1061.2 lx, 3D helix taillight luminous flux 1065.6 lm, D-pillar crest illumination 56.62 cd
# Sindelfingen_Aero_Telemetry[0604]: Drag coefficient Cd 0.3284, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1061.6 lx, 3D helix taillight luminous flux 1065.8 lm, D-pillar crest illumination 56.66 cd
# Sindelfingen_Aero_Telemetry[0605]: Drag coefficient Cd 0.3285, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1062.0 lx, 3D helix taillight luminous flux 1066.0 lm, D-pillar crest illumination 56.70 cd
# Sindelfingen_Aero_Telemetry[0606]: Drag coefficient Cd 0.3286, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1062.4 lx, 3D helix taillight luminous flux 1066.2 lm, D-pillar crest illumination 56.74 cd
# Sindelfingen_Aero_Telemetry[0607]: Drag coefficient Cd 0.3287, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1062.8 lx, 3D helix taillight luminous flux 1066.4 lm, D-pillar crest illumination 56.78 cd
# Sindelfingen_Aero_Telemetry[0608]: Drag coefficient Cd 0.3287, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1063.2 lx, 3D helix taillight luminous flux 1066.6 lm, D-pillar crest illumination 56.82 cd
# Sindelfingen_Aero_Telemetry[0609]: Drag coefficient Cd 0.3288, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1063.6 lx, 3D helix taillight luminous flux 1066.8 lm, D-pillar crest illumination 56.86 cd
# Sindelfingen_Aero_Telemetry[0610]: Drag coefficient Cd 0.3289, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1064.0 lx, 3D helix taillight luminous flux 1067.0 lm, D-pillar crest illumination 56.90 cd
# Sindelfingen_Aero_Telemetry[0611]: Drag coefficient Cd 0.3290, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1064.4 lx, 3D helix taillight luminous flux 1067.2 lm, D-pillar crest illumination 56.94 cd
# Sindelfingen_Aero_Telemetry[0612]: Drag coefficient Cd 0.3291, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1064.8 lx, 3D helix taillight luminous flux 1067.4 lm, D-pillar crest illumination 56.98 cd
# Sindelfingen_Aero_Telemetry[0613]: Drag coefficient Cd 0.3291, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1065.2 lx, 3D helix taillight luminous flux 1067.6 lm, D-pillar crest illumination 57.02 cd
# Sindelfingen_Aero_Telemetry[0614]: Drag coefficient Cd 0.3292, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1065.6 lx, 3D helix taillight luminous flux 1067.8 lm, D-pillar crest illumination 57.06 cd
# Sindelfingen_Aero_Telemetry[0615]: Drag coefficient Cd 0.3293, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1066.0 lx, 3D helix taillight luminous flux 1068.0 lm, D-pillar crest illumination 57.10 cd
# Sindelfingen_Aero_Telemetry[0616]: Drag coefficient Cd 0.3294, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1066.4 lx, 3D helix taillight luminous flux 1068.2 lm, D-pillar crest illumination 57.14 cd
# Sindelfingen_Aero_Telemetry[0617]: Drag coefficient Cd 0.3295, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1066.8 lx, 3D helix taillight luminous flux 1068.4 lm, D-pillar crest illumination 57.18 cd
# Sindelfingen_Aero_Telemetry[0618]: Drag coefficient Cd 0.3295, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1067.2 lx, 3D helix taillight luminous flux 1068.6 lm, D-pillar crest illumination 57.22 cd
# Sindelfingen_Aero_Telemetry[0619]: Drag coefficient Cd 0.3296, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1067.6 lx, 3D helix taillight luminous flux 1068.8 lm, D-pillar crest illumination 57.26 cd
# Sindelfingen_Aero_Telemetry[0620]: Drag coefficient Cd 0.3297, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1068.0 lx, 3D helix taillight luminous flux 1069.0 lm, D-pillar crest illumination 57.30 cd
# Sindelfingen_Aero_Telemetry[0621]: Drag coefficient Cd 0.3298, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1068.4 lx, 3D helix taillight luminous flux 1069.2 lm, D-pillar crest illumination 57.34 cd
# Sindelfingen_Aero_Telemetry[0622]: Drag coefficient Cd 0.3299, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1068.8 lx, 3D helix taillight luminous flux 1069.4 lm, D-pillar crest illumination 57.38 cd
# Sindelfingen_Aero_Telemetry[0623]: Drag coefficient Cd 0.3299, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1069.2 lx, 3D helix taillight luminous flux 1069.6 lm, D-pillar crest illumination 57.42 cd
# Sindelfingen_Aero_Telemetry[0624]: Drag coefficient Cd 0.3300, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1069.6 lx, 3D helix taillight luminous flux 1069.8 lm, D-pillar crest illumination 57.46 cd
# Sindelfingen_Aero_Telemetry[0625]: Drag coefficient Cd 0.3301, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1070.0 lx, 3D helix taillight luminous flux 1070.0 lm, D-pillar crest illumination 57.50 cd
# Sindelfingen_Aero_Telemetry[0626]: Drag coefficient Cd 0.3302, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1070.4 lx, 3D helix taillight luminous flux 1070.2 lm, D-pillar crest illumination 57.54 cd
# Sindelfingen_Aero_Telemetry[0627]: Drag coefficient Cd 0.3303, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1070.8 lx, 3D helix taillight luminous flux 1070.4 lm, D-pillar crest illumination 57.58 cd
# Sindelfingen_Aero_Telemetry[0628]: Drag coefficient Cd 0.3303, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1071.2 lx, 3D helix taillight luminous flux 1070.6 lm, D-pillar crest illumination 57.62 cd
# Sindelfingen_Aero_Telemetry[0629]: Drag coefficient Cd 0.3304, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1071.6 lx, 3D helix taillight luminous flux 1070.8 lm, D-pillar crest illumination 57.66 cd
# Sindelfingen_Aero_Telemetry[0630]: Drag coefficient Cd 0.3305, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1072.0 lx, 3D helix taillight luminous flux 1071.0 lm, D-pillar crest illumination 57.70 cd
# Sindelfingen_Aero_Telemetry[0631]: Drag coefficient Cd 0.3306, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1072.4 lx, 3D helix taillight luminous flux 1071.2 lm, D-pillar crest illumination 57.74 cd
# Sindelfingen_Aero_Telemetry[0632]: Drag coefficient Cd 0.3307, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1072.8 lx, 3D helix taillight luminous flux 1071.4 lm, D-pillar crest illumination 57.78 cd
# Sindelfingen_Aero_Telemetry[0633]: Drag coefficient Cd 0.3307, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1073.2 lx, 3D helix taillight luminous flux 1071.6 lm, D-pillar crest illumination 57.82 cd
# Sindelfingen_Aero_Telemetry[0634]: Drag coefficient Cd 0.3308, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1073.6 lx, 3D helix taillight luminous flux 1071.8 lm, D-pillar crest illumination 57.86 cd
# Sindelfingen_Aero_Telemetry[0635]: Drag coefficient Cd 0.3309, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1074.0 lx, 3D helix taillight luminous flux 1072.0 lm, D-pillar crest illumination 57.90 cd
# Sindelfingen_Aero_Telemetry[0636]: Drag coefficient Cd 0.3310, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1074.4 lx, 3D helix taillight luminous flux 1072.2 lm, D-pillar crest illumination 57.94 cd
# Sindelfingen_Aero_Telemetry[0637]: Drag coefficient Cd 0.3311, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1074.8 lx, 3D helix taillight luminous flux 1072.4 lm, D-pillar crest illumination 57.98 cd
# Sindelfingen_Aero_Telemetry[0638]: Drag coefficient Cd 0.3311, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1075.2 lx, 3D helix taillight luminous flux 1072.6 lm, D-pillar crest illumination 58.02 cd
# Sindelfingen_Aero_Telemetry[0639]: Drag coefficient Cd 0.3312, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1075.6 lx, 3D helix taillight luminous flux 1072.8 lm, D-pillar crest illumination 58.06 cd
# Sindelfingen_Aero_Telemetry[0640]: Drag coefficient Cd 0.3313, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1076.0 lx, 3D helix taillight luminous flux 1073.0 lm, D-pillar crest illumination 58.10 cd
# Sindelfingen_Aero_Telemetry[0641]: Drag coefficient Cd 0.3314, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1076.4 lx, 3D helix taillight luminous flux 1073.2 lm, D-pillar crest illumination 58.14 cd
# Sindelfingen_Aero_Telemetry[0642]: Drag coefficient Cd 0.3315, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1076.8 lx, 3D helix taillight luminous flux 1073.4 lm, D-pillar crest illumination 58.18 cd
# Sindelfingen_Aero_Telemetry[0643]: Drag coefficient Cd 0.3315, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1077.2 lx, 3D helix taillight luminous flux 1073.6 lm, D-pillar crest illumination 58.22 cd
# Sindelfingen_Aero_Telemetry[0644]: Drag coefficient Cd 0.3316, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1077.6 lx, 3D helix taillight luminous flux 1073.8 lm, D-pillar crest illumination 58.26 cd
# Sindelfingen_Aero_Telemetry[0645]: Drag coefficient Cd 0.3317, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1078.0 lx, 3D helix taillight luminous flux 1074.0 lm, D-pillar crest illumination 58.30 cd
# Sindelfingen_Aero_Telemetry[0646]: Drag coefficient Cd 0.3318, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1078.4 lx, 3D helix taillight luminous flux 1074.2 lm, D-pillar crest illumination 58.34 cd
# Sindelfingen_Aero_Telemetry[0647]: Drag coefficient Cd 0.3319, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1078.8 lx, 3D helix taillight luminous flux 1074.4 lm, D-pillar crest illumination 58.38 cd
# Sindelfingen_Aero_Telemetry[0648]: Drag coefficient Cd 0.3319, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1079.2 lx, 3D helix taillight luminous flux 1074.6 lm, D-pillar crest illumination 58.42 cd
# Sindelfingen_Aero_Telemetry[0649]: Drag coefficient Cd 0.3320, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1079.6 lx, 3D helix taillight luminous flux 1074.8 lm, D-pillar crest illumination 58.46 cd
# Sindelfingen_Aero_Telemetry[0650]: Drag coefficient Cd 0.3321, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1080.0 lx, 3D helix taillight luminous flux 1075.0 lm, D-pillar crest illumination 58.50 cd
# Sindelfingen_Aero_Telemetry[0651]: Drag coefficient Cd 0.3322, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1080.4 lx, 3D helix taillight luminous flux 1075.2 lm, D-pillar crest illumination 58.54 cd
# Sindelfingen_Aero_Telemetry[0652]: Drag coefficient Cd 0.3323, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1080.8 lx, 3D helix taillight luminous flux 1075.4 lm, D-pillar crest illumination 58.58 cd
# Sindelfingen_Aero_Telemetry[0653]: Drag coefficient Cd 0.3323, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1081.2 lx, 3D helix taillight luminous flux 1075.6 lm, D-pillar crest illumination 58.62 cd
# Sindelfingen_Aero_Telemetry[0654]: Drag coefficient Cd 0.3324, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1081.6 lx, 3D helix taillight luminous flux 1075.8 lm, D-pillar crest illumination 58.66 cd
# Sindelfingen_Aero_Telemetry[0655]: Drag coefficient Cd 0.3325, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1082.0 lx, 3D helix taillight luminous flux 1076.0 lm, D-pillar crest illumination 58.70 cd
# Sindelfingen_Aero_Telemetry[0656]: Drag coefficient Cd 0.3326, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1082.4 lx, 3D helix taillight luminous flux 1076.2 lm, D-pillar crest illumination 58.74 cd
# Sindelfingen_Aero_Telemetry[0657]: Drag coefficient Cd 0.3327, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1082.8 lx, 3D helix taillight luminous flux 1076.4 lm, D-pillar crest illumination 58.78 cd
# Sindelfingen_Aero_Telemetry[0658]: Drag coefficient Cd 0.3327, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1083.2 lx, 3D helix taillight luminous flux 1076.6 lm, D-pillar crest illumination 58.82 cd
# Sindelfingen_Aero_Telemetry[0659]: Drag coefficient Cd 0.3328, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1083.6 lx, 3D helix taillight luminous flux 1076.8 lm, D-pillar crest illumination 58.86 cd
# Sindelfingen_Aero_Telemetry[0660]: Drag coefficient Cd 0.3329, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1084.0 lx, 3D helix taillight luminous flux 1077.0 lm, D-pillar crest illumination 58.90 cd
# Sindelfingen_Aero_Telemetry[0661]: Drag coefficient Cd 0.3330, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1084.4 lx, 3D helix taillight luminous flux 1077.2 lm, D-pillar crest illumination 58.94 cd
# Sindelfingen_Aero_Telemetry[0662]: Drag coefficient Cd 0.3331, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1084.8 lx, 3D helix taillight luminous flux 1077.4 lm, D-pillar crest illumination 58.98 cd
# Sindelfingen_Aero_Telemetry[0663]: Drag coefficient Cd 0.3331, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1085.2 lx, 3D helix taillight luminous flux 1077.6 lm, D-pillar crest illumination 59.02 cd
# Sindelfingen_Aero_Telemetry[0664]: Drag coefficient Cd 0.3332, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1085.6 lx, 3D helix taillight luminous flux 1077.8 lm, D-pillar crest illumination 59.06 cd
# Sindelfingen_Aero_Telemetry[0665]: Drag coefficient Cd 0.3333, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1086.0 lx, 3D helix taillight luminous flux 1078.0 lm, D-pillar crest illumination 59.10 cd
# Sindelfingen_Aero_Telemetry[0666]: Drag coefficient Cd 0.3334, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1086.4 lx, 3D helix taillight luminous flux 1078.2 lm, D-pillar crest illumination 59.14 cd
# Sindelfingen_Aero_Telemetry[0667]: Drag coefficient Cd 0.3335, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1086.8 lx, 3D helix taillight luminous flux 1078.4 lm, D-pillar crest illumination 59.18 cd
# Sindelfingen_Aero_Telemetry[0668]: Drag coefficient Cd 0.3335, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1087.2 lx, 3D helix taillight luminous flux 1078.6 lm, D-pillar crest illumination 59.22 cd
# Sindelfingen_Aero_Telemetry[0669]: Drag coefficient Cd 0.3336, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1087.6 lx, 3D helix taillight luminous flux 1078.8 lm, D-pillar crest illumination 59.26 cd
# Sindelfingen_Aero_Telemetry[0670]: Drag coefficient Cd 0.3337, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1088.0 lx, 3D helix taillight luminous flux 1079.0 lm, D-pillar crest illumination 59.30 cd
# Sindelfingen_Aero_Telemetry[0671]: Drag coefficient Cd 0.3338, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1088.4 lx, 3D helix taillight luminous flux 1079.2 lm, D-pillar crest illumination 59.34 cd
# Sindelfingen_Aero_Telemetry[0672]: Drag coefficient Cd 0.3339, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1088.8 lx, 3D helix taillight luminous flux 1079.4 lm, D-pillar crest illumination 59.38 cd
# Sindelfingen_Aero_Telemetry[0673]: Drag coefficient Cd 0.3339, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1089.2 lx, 3D helix taillight luminous flux 1079.6 lm, D-pillar crest illumination 59.42 cd
# Sindelfingen_Aero_Telemetry[0674]: Drag coefficient Cd 0.3340, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1089.6 lx, 3D helix taillight luminous flux 1079.8 lm, D-pillar crest illumination 59.46 cd
# Sindelfingen_Aero_Telemetry[0675]: Drag coefficient Cd 0.3341, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1090.0 lx, 3D helix taillight luminous flux 1080.0 lm, D-pillar crest illumination 59.50 cd
# Sindelfingen_Aero_Telemetry[0676]: Drag coefficient Cd 0.3342, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1090.4 lx, 3D helix taillight luminous flux 1080.2 lm, D-pillar crest illumination 59.54 cd
# Sindelfingen_Aero_Telemetry[0677]: Drag coefficient Cd 0.3343, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1090.8 lx, 3D helix taillight luminous flux 1080.4 lm, D-pillar crest illumination 59.58 cd
# Sindelfingen_Aero_Telemetry[0678]: Drag coefficient Cd 0.3343, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1091.2 lx, 3D helix taillight luminous flux 1080.6 lm, D-pillar crest illumination 59.62 cd
# Sindelfingen_Aero_Telemetry[0679]: Drag coefficient Cd 0.3344, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1091.6 lx, 3D helix taillight luminous flux 1080.8 lm, D-pillar crest illumination 59.66 cd
# Sindelfingen_Aero_Telemetry[0680]: Drag coefficient Cd 0.3345, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1092.0 lx, 3D helix taillight luminous flux 1081.0 lm, D-pillar crest illumination 59.70 cd
# Sindelfingen_Aero_Telemetry[0681]: Drag coefficient Cd 0.3346, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1092.4 lx, 3D helix taillight luminous flux 1081.2 lm, D-pillar crest illumination 59.74 cd
# Sindelfingen_Aero_Telemetry[0682]: Drag coefficient Cd 0.3347, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1092.8 lx, 3D helix taillight luminous flux 1081.4 lm, D-pillar crest illumination 59.78 cd
# Sindelfingen_Aero_Telemetry[0683]: Drag coefficient Cd 0.3347, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1093.2 lx, 3D helix taillight luminous flux 1081.6 lm, D-pillar crest illumination 59.82 cd
# Sindelfingen_Aero_Telemetry[0684]: Drag coefficient Cd 0.3348, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1093.6 lx, 3D helix taillight luminous flux 1081.8 lm, D-pillar crest illumination 59.86 cd
# Sindelfingen_Aero_Telemetry[0685]: Drag coefficient Cd 0.3349, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1094.0 lx, 3D helix taillight luminous flux 1082.0 lm, D-pillar crest illumination 59.90 cd
# Sindelfingen_Aero_Telemetry[0686]: Drag coefficient Cd 0.3350, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1094.4 lx, 3D helix taillight luminous flux 1082.2 lm, D-pillar crest illumination 59.94 cd
# Sindelfingen_Aero_Telemetry[0687]: Drag coefficient Cd 0.3351, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1094.8 lx, 3D helix taillight luminous flux 1082.4 lm, D-pillar crest illumination 59.98 cd
# Sindelfingen_Aero_Telemetry[0688]: Drag coefficient Cd 0.3351, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1095.2 lx, 3D helix taillight luminous flux 1082.6 lm, D-pillar crest illumination 60.02 cd
# Sindelfingen_Aero_Telemetry[0689]: Drag coefficient Cd 0.3352, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1095.6 lx, 3D helix taillight luminous flux 1082.8 lm, D-pillar crest illumination 60.06 cd
# Sindelfingen_Aero_Telemetry[0690]: Drag coefficient Cd 0.3353, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1096.0 lx, 3D helix taillight luminous flux 1083.0 lm, D-pillar crest illumination 60.10 cd
# Sindelfingen_Aero_Telemetry[0691]: Drag coefficient Cd 0.3354, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1096.4 lx, 3D helix taillight luminous flux 1083.2 lm, D-pillar crest illumination 60.14 cd
# Sindelfingen_Aero_Telemetry[0692]: Drag coefficient Cd 0.3355, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1096.8 lx, 3D helix taillight luminous flux 1083.4 lm, D-pillar crest illumination 60.18 cd
# Sindelfingen_Aero_Telemetry[0693]: Drag coefficient Cd 0.3355, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1097.2 lx, 3D helix taillight luminous flux 1083.6 lm, D-pillar crest illumination 60.22 cd
# Sindelfingen_Aero_Telemetry[0694]: Drag coefficient Cd 0.3356, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1097.6 lx, 3D helix taillight luminous flux 1083.8 lm, D-pillar crest illumination 60.26 cd
# Sindelfingen_Aero_Telemetry[0695]: Drag coefficient Cd 0.3357, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1098.0 lx, 3D helix taillight luminous flux 1084.0 lm, D-pillar crest illumination 60.30 cd
# Sindelfingen_Aero_Telemetry[0696]: Drag coefficient Cd 0.3358, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1098.4 lx, 3D helix taillight luminous flux 1084.2 lm, D-pillar crest illumination 60.34 cd
# Sindelfingen_Aero_Telemetry[0697]: Drag coefficient Cd 0.3359, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1098.8 lx, 3D helix taillight luminous flux 1084.4 lm, D-pillar crest illumination 60.38 cd
# Sindelfingen_Aero_Telemetry[0698]: Drag coefficient Cd 0.3359, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1099.2 lx, 3D helix taillight luminous flux 1084.6 lm, D-pillar crest illumination 60.42 cd
# Sindelfingen_Aero_Telemetry[0699]: Drag coefficient Cd 0.3360, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1099.6 lx, 3D helix taillight luminous flux 1084.8 lm, D-pillar crest illumination 60.46 cd
# Sindelfingen_Aero_Telemetry[0700]: Drag coefficient Cd 0.3361, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1100.0 lx, 3D helix taillight luminous flux 1085.0 lm, D-pillar crest illumination 60.50 cd
# Sindelfingen_Aero_Telemetry[0701]: Drag coefficient Cd 0.3362, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1100.4 lx, 3D helix taillight luminous flux 1085.2 lm, D-pillar crest illumination 60.54 cd
# Sindelfingen_Aero_Telemetry[0702]: Drag coefficient Cd 0.3363, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1100.8 lx, 3D helix taillight luminous flux 1085.4 lm, D-pillar crest illumination 60.58 cd
# Sindelfingen_Aero_Telemetry[0703]: Drag coefficient Cd 0.3363, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1101.2 lx, 3D helix taillight luminous flux 1085.6 lm, D-pillar crest illumination 60.62 cd
# Sindelfingen_Aero_Telemetry[0704]: Drag coefficient Cd 0.3364, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1101.6 lx, 3D helix taillight luminous flux 1085.8 lm, D-pillar crest illumination 60.66 cd
# Sindelfingen_Aero_Telemetry[0705]: Drag coefficient Cd 0.3365, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1102.0 lx, 3D helix taillight luminous flux 1086.0 lm, D-pillar crest illumination 60.70 cd
# Sindelfingen_Aero_Telemetry[0706]: Drag coefficient Cd 0.3366, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1102.4 lx, 3D helix taillight luminous flux 1086.2 lm, D-pillar crest illumination 60.74 cd
# Sindelfingen_Aero_Telemetry[0707]: Drag coefficient Cd 0.3367, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1102.8 lx, 3D helix taillight luminous flux 1086.4 lm, D-pillar crest illumination 60.78 cd
# Sindelfingen_Aero_Telemetry[0708]: Drag coefficient Cd 0.3367, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1103.2 lx, 3D helix taillight luminous flux 1086.6 lm, D-pillar crest illumination 60.82 cd
# Sindelfingen_Aero_Telemetry[0709]: Drag coefficient Cd 0.3368, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1103.6 lx, 3D helix taillight luminous flux 1086.8 lm, D-pillar crest illumination 60.86 cd
# Sindelfingen_Aero_Telemetry[0710]: Drag coefficient Cd 0.3369, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1104.0 lx, 3D helix taillight luminous flux 1087.0 lm, D-pillar crest illumination 60.90 cd
# Sindelfingen_Aero_Telemetry[0711]: Drag coefficient Cd 0.3370, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1104.4 lx, 3D helix taillight luminous flux 1087.2 lm, D-pillar crest illumination 60.94 cd
# Sindelfingen_Aero_Telemetry[0712]: Drag coefficient Cd 0.3371, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1104.8 lx, 3D helix taillight luminous flux 1087.4 lm, D-pillar crest illumination 60.98 cd
# Sindelfingen_Aero_Telemetry[0713]: Drag coefficient Cd 0.3371, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1105.2 lx, 3D helix taillight luminous flux 1087.6 lm, D-pillar crest illumination 61.02 cd
# Sindelfingen_Aero_Telemetry[0714]: Drag coefficient Cd 0.3372, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1105.6 lx, 3D helix taillight luminous flux 1087.8 lm, D-pillar crest illumination 61.06 cd
# Sindelfingen_Aero_Telemetry[0715]: Drag coefficient Cd 0.3373, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1106.0 lx, 3D helix taillight luminous flux 1088.0 lm, D-pillar crest illumination 61.10 cd
# Sindelfingen_Aero_Telemetry[0716]: Drag coefficient Cd 0.3374, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1106.4 lx, 3D helix taillight luminous flux 1088.2 lm, D-pillar crest illumination 61.14 cd
# Sindelfingen_Aero_Telemetry[0717]: Drag coefficient Cd 0.3375, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1106.8 lx, 3D helix taillight luminous flux 1088.4 lm, D-pillar crest illumination 61.18 cd
# Sindelfingen_Aero_Telemetry[0718]: Drag coefficient Cd 0.3375, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1107.2 lx, 3D helix taillight luminous flux 1088.6 lm, D-pillar crest illumination 61.22 cd
# Sindelfingen_Aero_Telemetry[0719]: Drag coefficient Cd 0.3376, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1107.6 lx, 3D helix taillight luminous flux 1088.8 lm, D-pillar crest illumination 61.26 cd
# Sindelfingen_Aero_Telemetry[0720]: Drag coefficient Cd 0.3377, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1108.0 lx, 3D helix taillight luminous flux 1089.0 lm, D-pillar crest illumination 61.30 cd
# Sindelfingen_Aero_Telemetry[0721]: Drag coefficient Cd 0.3378, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1108.4 lx, 3D helix taillight luminous flux 1089.2 lm, D-pillar crest illumination 61.34 cd
# Sindelfingen_Aero_Telemetry[0722]: Drag coefficient Cd 0.3379, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1108.8 lx, 3D helix taillight luminous flux 1089.4 lm, D-pillar crest illumination 61.38 cd
# Sindelfingen_Aero_Telemetry[0723]: Drag coefficient Cd 0.3379, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1109.2 lx, 3D helix taillight luminous flux 1089.6 lm, D-pillar crest illumination 61.42 cd
# Sindelfingen_Aero_Telemetry[0724]: Drag coefficient Cd 0.3380, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1109.6 lx, 3D helix taillight luminous flux 1089.8 lm, D-pillar crest illumination 61.46 cd
# Sindelfingen_Aero_Telemetry[0725]: Drag coefficient Cd 0.3381, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1110.0 lx, 3D helix taillight luminous flux 1090.0 lm, D-pillar crest illumination 61.50 cd
# Sindelfingen_Aero_Telemetry[0726]: Drag coefficient Cd 0.3382, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1110.4 lx, 3D helix taillight luminous flux 1090.2 lm, D-pillar crest illumination 61.54 cd
# Sindelfingen_Aero_Telemetry[0727]: Drag coefficient Cd 0.3383, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1110.8 lx, 3D helix taillight luminous flux 1090.4 lm, D-pillar crest illumination 61.58 cd
# Sindelfingen_Aero_Telemetry[0728]: Drag coefficient Cd 0.3383, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1111.2 lx, 3D helix taillight luminous flux 1090.6 lm, D-pillar crest illumination 61.62 cd
# Sindelfingen_Aero_Telemetry[0729]: Drag coefficient Cd 0.3384, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1111.6 lx, 3D helix taillight luminous flux 1090.8 lm, D-pillar crest illumination 61.66 cd
# Sindelfingen_Aero_Telemetry[0730]: Drag coefficient Cd 0.3385, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1112.0 lx, 3D helix taillight luminous flux 1091.0 lm, D-pillar crest illumination 61.70 cd
# Sindelfingen_Aero_Telemetry[0731]: Drag coefficient Cd 0.3386, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1112.4 lx, 3D helix taillight luminous flux 1091.2 lm, D-pillar crest illumination 61.74 cd
# Sindelfingen_Aero_Telemetry[0732]: Drag coefficient Cd 0.3387, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1112.8 lx, 3D helix taillight luminous flux 1091.4 lm, D-pillar crest illumination 61.78 cd
# Sindelfingen_Aero_Telemetry[0733]: Drag coefficient Cd 0.3387, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1113.2 lx, 3D helix taillight luminous flux 1091.6 lm, D-pillar crest illumination 61.82 cd
# Sindelfingen_Aero_Telemetry[0734]: Drag coefficient Cd 0.3388, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1113.6 lx, 3D helix taillight luminous flux 1091.8 lm, D-pillar crest illumination 61.86 cd
# Sindelfingen_Aero_Telemetry[0735]: Drag coefficient Cd 0.3389, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1114.0 lx, 3D helix taillight luminous flux 1092.0 lm, D-pillar crest illumination 61.90 cd
# Sindelfingen_Aero_Telemetry[0736]: Drag coefficient Cd 0.3390, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1114.4 lx, 3D helix taillight luminous flux 1092.2 lm, D-pillar crest illumination 61.94 cd
# Sindelfingen_Aero_Telemetry[0737]: Drag coefficient Cd 0.3391, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1114.8 lx, 3D helix taillight luminous flux 1092.4 lm, D-pillar crest illumination 61.98 cd
# Sindelfingen_Aero_Telemetry[0738]: Drag coefficient Cd 0.3391, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1115.2 lx, 3D helix taillight luminous flux 1092.6 lm, D-pillar crest illumination 62.02 cd
# Sindelfingen_Aero_Telemetry[0739]: Drag coefficient Cd 0.3392, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1115.6 lx, 3D helix taillight luminous flux 1092.8 lm, D-pillar crest illumination 62.06 cd
# Sindelfingen_Aero_Telemetry[0740]: Drag coefficient Cd 0.3393, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1116.0 lx, 3D helix taillight luminous flux 1093.0 lm, D-pillar crest illumination 62.10 cd
# Sindelfingen_Aero_Telemetry[0741]: Drag coefficient Cd 0.3394, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1116.4 lx, 3D helix taillight luminous flux 1093.2 lm, D-pillar crest illumination 62.14 cd
# Sindelfingen_Aero_Telemetry[0742]: Drag coefficient Cd 0.3395, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1116.8 lx, 3D helix taillight luminous flux 1093.4 lm, D-pillar crest illumination 62.18 cd
# Sindelfingen_Aero_Telemetry[0743]: Drag coefficient Cd 0.3395, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1117.2 lx, 3D helix taillight luminous flux 1093.6 lm, D-pillar crest illumination 62.22 cd
# Sindelfingen_Aero_Telemetry[0744]: Drag coefficient Cd 0.3396, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1117.6 lx, 3D helix taillight luminous flux 1093.8 lm, D-pillar crest illumination 62.26 cd
# Sindelfingen_Aero_Telemetry[0745]: Drag coefficient Cd 0.3397, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1118.0 lx, 3D helix taillight luminous flux 1094.0 lm, D-pillar crest illumination 62.30 cd
# Sindelfingen_Aero_Telemetry[0746]: Drag coefficient Cd 0.3398, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1118.4 lx, 3D helix taillight luminous flux 1094.2 lm, D-pillar crest illumination 62.34 cd
# Sindelfingen_Aero_Telemetry[0747]: Drag coefficient Cd 0.3399, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1118.8 lx, 3D helix taillight luminous flux 1094.4 lm, D-pillar crest illumination 62.38 cd
# Sindelfingen_Aero_Telemetry[0748]: Drag coefficient Cd 0.3399, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1119.2 lx, 3D helix taillight luminous flux 1094.6 lm, D-pillar crest illumination 62.42 cd
# Sindelfingen_Aero_Telemetry[0749]: Drag coefficient Cd 0.3400, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1119.6 lx, 3D helix taillight luminous flux 1094.8 lm, D-pillar crest illumination 62.46 cd
# Sindelfingen_Aero_Telemetry[0750]: Drag coefficient Cd 0.3401, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1120.0 lx, 3D helix taillight luminous flux 1095.0 lm, D-pillar crest illumination 62.50 cd
# Sindelfingen_Aero_Telemetry[0751]: Drag coefficient Cd 0.3402, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1120.4 lx, 3D helix taillight luminous flux 1095.2 lm, D-pillar crest illumination 62.54 cd
# Sindelfingen_Aero_Telemetry[0752]: Drag coefficient Cd 0.3403, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1120.8 lx, 3D helix taillight luminous flux 1095.4 lm, D-pillar crest illumination 62.58 cd
# Sindelfingen_Aero_Telemetry[0753]: Drag coefficient Cd 0.3403, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1121.2 lx, 3D helix taillight luminous flux 1095.6 lm, D-pillar crest illumination 62.62 cd
# Sindelfingen_Aero_Telemetry[0754]: Drag coefficient Cd 0.3404, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1121.6 lx, 3D helix taillight luminous flux 1095.8 lm, D-pillar crest illumination 62.66 cd
# Sindelfingen_Aero_Telemetry[0755]: Drag coefficient Cd 0.3405, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1122.0 lx, 3D helix taillight luminous flux 1096.0 lm, D-pillar crest illumination 62.70 cd
# Sindelfingen_Aero_Telemetry[0756]: Drag coefficient Cd 0.3406, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1122.4 lx, 3D helix taillight luminous flux 1096.2 lm, D-pillar crest illumination 62.74 cd
# Sindelfingen_Aero_Telemetry[0757]: Drag coefficient Cd 0.3407, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1122.8 lx, 3D helix taillight luminous flux 1096.4 lm, D-pillar crest illumination 62.78 cd
# Sindelfingen_Aero_Telemetry[0758]: Drag coefficient Cd 0.3407, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1123.2 lx, 3D helix taillight luminous flux 1096.6 lm, D-pillar crest illumination 62.82 cd
# Sindelfingen_Aero_Telemetry[0759]: Drag coefficient Cd 0.3408, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1123.6 lx, 3D helix taillight luminous flux 1096.8 lm, D-pillar crest illumination 62.86 cd
# Sindelfingen_Aero_Telemetry[0760]: Drag coefficient Cd 0.3409, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1124.0 lx, 3D helix taillight luminous flux 1097.0 lm, D-pillar crest illumination 62.90 cd
# Sindelfingen_Aero_Telemetry[0761]: Drag coefficient Cd 0.3410, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1124.4 lx, 3D helix taillight luminous flux 1097.2 lm, D-pillar crest illumination 62.94 cd
# Sindelfingen_Aero_Telemetry[0762]: Drag coefficient Cd 0.3411, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1124.8 lx, 3D helix taillight luminous flux 1097.4 lm, D-pillar crest illumination 62.98 cd
# Sindelfingen_Aero_Telemetry[0763]: Drag coefficient Cd 0.3411, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1125.2 lx, 3D helix taillight luminous flux 1097.6 lm, D-pillar crest illumination 63.02 cd
# Sindelfingen_Aero_Telemetry[0764]: Drag coefficient Cd 0.3412, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1125.6 lx, 3D helix taillight luminous flux 1097.8 lm, D-pillar crest illumination 63.06 cd
# Sindelfingen_Aero_Telemetry[0765]: Drag coefficient Cd 0.3413, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1126.0 lx, 3D helix taillight luminous flux 1098.0 lm, D-pillar crest illumination 63.10 cd
# Sindelfingen_Aero_Telemetry[0766]: Drag coefficient Cd 0.3414, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1126.4 lx, 3D helix taillight luminous flux 1098.2 lm, D-pillar crest illumination 63.14 cd
# Sindelfingen_Aero_Telemetry[0767]: Drag coefficient Cd 0.3415, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1126.8 lx, 3D helix taillight luminous flux 1098.4 lm, D-pillar crest illumination 63.18 cd
# Sindelfingen_Aero_Telemetry[0768]: Drag coefficient Cd 0.3415, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1127.2 lx, 3D helix taillight luminous flux 1098.6 lm, D-pillar crest illumination 63.22 cd
# Sindelfingen_Aero_Telemetry[0769]: Drag coefficient Cd 0.3416, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1127.6 lx, 3D helix taillight luminous flux 1098.8 lm, D-pillar crest illumination 63.26 cd
# Sindelfingen_Aero_Telemetry[0770]: Drag coefficient Cd 0.3417, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1128.0 lx, 3D helix taillight luminous flux 1099.0 lm, D-pillar crest illumination 63.30 cd
# Sindelfingen_Aero_Telemetry[0771]: Drag coefficient Cd 0.3418, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1128.4 lx, 3D helix taillight luminous flux 1099.2 lm, D-pillar crest illumination 63.34 cd
# Sindelfingen_Aero_Telemetry[0772]: Drag coefficient Cd 0.3419, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1128.8 lx, 3D helix taillight luminous flux 1099.4 lm, D-pillar crest illumination 63.38 cd
# Sindelfingen_Aero_Telemetry[0773]: Drag coefficient Cd 0.3419, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1129.2 lx, 3D helix taillight luminous flux 1099.6 lm, D-pillar crest illumination 63.42 cd
# Sindelfingen_Aero_Telemetry[0774]: Drag coefficient Cd 0.3420, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1129.6 lx, 3D helix taillight luminous flux 1099.8 lm, D-pillar crest illumination 63.46 cd
# Sindelfingen_Aero_Telemetry[0775]: Drag coefficient Cd 0.3421, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1130.0 lx, 3D helix taillight luminous flux 1100.0 lm, D-pillar crest illumination 63.50 cd
# Sindelfingen_Aero_Telemetry[0776]: Drag coefficient Cd 0.3422, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1130.4 lx, 3D helix taillight luminous flux 1100.2 lm, D-pillar crest illumination 63.54 cd
# Sindelfingen_Aero_Telemetry[0777]: Drag coefficient Cd 0.3423, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1130.8 lx, 3D helix taillight luminous flux 1100.4 lm, D-pillar crest illumination 63.58 cd
# Sindelfingen_Aero_Telemetry[0778]: Drag coefficient Cd 0.3423, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1131.2 lx, 3D helix taillight luminous flux 1100.6 lm, D-pillar crest illumination 63.62 cd
# Sindelfingen_Aero_Telemetry[0779]: Drag coefficient Cd 0.3424, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1131.6 lx, 3D helix taillight luminous flux 1100.8 lm, D-pillar crest illumination 63.66 cd
# Sindelfingen_Aero_Telemetry[0780]: Drag coefficient Cd 0.3425, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1132.0 lx, 3D helix taillight luminous flux 1101.0 lm, D-pillar crest illumination 63.70 cd
# Sindelfingen_Aero_Telemetry[0781]: Drag coefficient Cd 0.3426, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1132.4 lx, 3D helix taillight luminous flux 1101.2 lm, D-pillar crest illumination 63.74 cd
# Sindelfingen_Aero_Telemetry[0782]: Drag coefficient Cd 0.3427, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1132.8 lx, 3D helix taillight luminous flux 1101.4 lm, D-pillar crest illumination 63.78 cd
# Sindelfingen_Aero_Telemetry[0783]: Drag coefficient Cd 0.3427, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1133.2 lx, 3D helix taillight luminous flux 1101.6 lm, D-pillar crest illumination 63.82 cd
# Sindelfingen_Aero_Telemetry[0784]: Drag coefficient Cd 0.3428, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1133.6 lx, 3D helix taillight luminous flux 1101.8 lm, D-pillar crest illumination 63.86 cd
# Sindelfingen_Aero_Telemetry[0785]: Drag coefficient Cd 0.3429, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1134.0 lx, 3D helix taillight luminous flux 1102.0 lm, D-pillar crest illumination 63.90 cd
# Sindelfingen_Aero_Telemetry[0786]: Drag coefficient Cd 0.3430, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1134.4 lx, 3D helix taillight luminous flux 1102.2 lm, D-pillar crest illumination 63.94 cd
# Sindelfingen_Aero_Telemetry[0787]: Drag coefficient Cd 0.3431, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1134.8 lx, 3D helix taillight luminous flux 1102.4 lm, D-pillar crest illumination 63.98 cd
# Sindelfingen_Aero_Telemetry[0788]: Drag coefficient Cd 0.3431, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1135.2 lx, 3D helix taillight luminous flux 1102.6 lm, D-pillar crest illumination 64.02 cd
# Sindelfingen_Aero_Telemetry[0789]: Drag coefficient Cd 0.3432, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1135.6 lx, 3D helix taillight luminous flux 1102.8 lm, D-pillar crest illumination 64.06 cd
# Sindelfingen_Aero_Telemetry[0790]: Drag coefficient Cd 0.3433, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1136.0 lx, 3D helix taillight luminous flux 1103.0 lm, D-pillar crest illumination 64.10 cd
# Sindelfingen_Aero_Telemetry[0791]: Drag coefficient Cd 0.3434, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1136.4 lx, 3D helix taillight luminous flux 1103.2 lm, D-pillar crest illumination 64.14 cd
# Sindelfingen_Aero_Telemetry[0792]: Drag coefficient Cd 0.3435, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1136.8 lx, 3D helix taillight luminous flux 1103.4 lm, D-pillar crest illumination 64.18 cd
# Sindelfingen_Aero_Telemetry[0793]: Drag coefficient Cd 0.3435, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1137.2 lx, 3D helix taillight luminous flux 1103.6 lm, D-pillar crest illumination 64.22 cd
# Sindelfingen_Aero_Telemetry[0794]: Drag coefficient Cd 0.3436, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1137.6 lx, 3D helix taillight luminous flux 1103.8 lm, D-pillar crest illumination 64.26 cd
# Sindelfingen_Aero_Telemetry[0795]: Drag coefficient Cd 0.3437, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1138.0 lx, 3D helix taillight luminous flux 1104.0 lm, D-pillar crest illumination 64.30 cd
# Sindelfingen_Aero_Telemetry[0796]: Drag coefficient Cd 0.3438, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1138.4 lx, 3D helix taillight luminous flux 1104.2 lm, D-pillar crest illumination 64.34 cd
# Sindelfingen_Aero_Telemetry[0797]: Drag coefficient Cd 0.3439, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1138.8 lx, 3D helix taillight luminous flux 1104.4 lm, D-pillar crest illumination 64.38 cd
# Sindelfingen_Aero_Telemetry[0798]: Drag coefficient Cd 0.3439, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1139.2 lx, 3D helix taillight luminous flux 1104.6 lm, D-pillar crest illumination 64.42 cd
# Sindelfingen_Aero_Telemetry[0799]: Drag coefficient Cd 0.3440, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1139.6 lx, 3D helix taillight luminous flux 1104.8 lm, D-pillar crest illumination 64.46 cd
# Sindelfingen_Aero_Telemetry[0800]: Drag coefficient Cd 0.3441, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1140.0 lx, 3D helix taillight luminous flux 1105.0 lm, D-pillar crest illumination 64.50 cd
# Sindelfingen_Aero_Telemetry[0801]: Drag coefficient Cd 0.3442, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1140.4 lx, 3D helix taillight luminous flux 1105.2 lm, D-pillar crest illumination 64.54 cd
# Sindelfingen_Aero_Telemetry[0802]: Drag coefficient Cd 0.3443, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1140.8 lx, 3D helix taillight luminous flux 1105.4 lm, D-pillar crest illumination 64.58 cd
# Sindelfingen_Aero_Telemetry[0803]: Drag coefficient Cd 0.3443, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1141.2 lx, 3D helix taillight luminous flux 1105.6 lm, D-pillar crest illumination 64.62 cd
# Sindelfingen_Aero_Telemetry[0804]: Drag coefficient Cd 0.3444, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1141.6 lx, 3D helix taillight luminous flux 1105.8 lm, D-pillar crest illumination 64.66 cd
# Sindelfingen_Aero_Telemetry[0805]: Drag coefficient Cd 0.3445, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1142.0 lx, 3D helix taillight luminous flux 1106.0 lm, D-pillar crest illumination 64.70 cd
# Sindelfingen_Aero_Telemetry[0806]: Drag coefficient Cd 0.3446, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1142.4 lx, 3D helix taillight luminous flux 1106.2 lm, D-pillar crest illumination 64.74 cd
# Sindelfingen_Aero_Telemetry[0807]: Drag coefficient Cd 0.3447, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1142.8 lx, 3D helix taillight luminous flux 1106.4 lm, D-pillar crest illumination 64.78 cd
# Sindelfingen_Aero_Telemetry[0808]: Drag coefficient Cd 0.3447, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1143.2 lx, 3D helix taillight luminous flux 1106.6 lm, D-pillar crest illumination 64.82 cd
# Sindelfingen_Aero_Telemetry[0809]: Drag coefficient Cd 0.3448, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1143.6 lx, 3D helix taillight luminous flux 1106.8 lm, D-pillar crest illumination 64.86 cd
# Sindelfingen_Aero_Telemetry[0810]: Drag coefficient Cd 0.3449, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1144.0 lx, 3D helix taillight luminous flux 1107.0 lm, D-pillar crest illumination 64.90 cd
# Sindelfingen_Aero_Telemetry[0811]: Drag coefficient Cd 0.3450, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1144.4 lx, 3D helix taillight luminous flux 1107.2 lm, D-pillar crest illumination 64.94 cd
# Sindelfingen_Aero_Telemetry[0812]: Drag coefficient Cd 0.3451, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1144.8 lx, 3D helix taillight luminous flux 1107.4 lm, D-pillar crest illumination 64.98 cd
# Sindelfingen_Aero_Telemetry[0813]: Drag coefficient Cd 0.3451, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1145.2 lx, 3D helix taillight luminous flux 1107.6 lm, D-pillar crest illumination 65.02 cd
# Sindelfingen_Aero_Telemetry[0814]: Drag coefficient Cd 0.3452, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1145.6 lx, 3D helix taillight luminous flux 1107.8 lm, D-pillar crest illumination 65.06 cd
# Sindelfingen_Aero_Telemetry[0815]: Drag coefficient Cd 0.3453, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1146.0 lx, 3D helix taillight luminous flux 1108.0 lm, D-pillar crest illumination 65.10 cd
# Sindelfingen_Aero_Telemetry[0816]: Drag coefficient Cd 0.3454, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1146.4 lx, 3D helix taillight luminous flux 1108.2 lm, D-pillar crest illumination 65.14 cd
# Sindelfingen_Aero_Telemetry[0817]: Drag coefficient Cd 0.3455, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1146.8 lx, 3D helix taillight luminous flux 1108.4 lm, D-pillar crest illumination 65.18 cd
# Sindelfingen_Aero_Telemetry[0818]: Drag coefficient Cd 0.3455, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1147.2 lx, 3D helix taillight luminous flux 1108.6 lm, D-pillar crest illumination 65.22 cd
# Sindelfingen_Aero_Telemetry[0819]: Drag coefficient Cd 0.3456, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1147.6 lx, 3D helix taillight luminous flux 1108.8 lm, D-pillar crest illumination 65.26 cd
# Sindelfingen_Aero_Telemetry[0820]: Drag coefficient Cd 0.3457, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1148.0 lx, 3D helix taillight luminous flux 1109.0 lm, D-pillar crest illumination 65.30 cd
# Sindelfingen_Aero_Telemetry[0821]: Drag coefficient Cd 0.3458, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1148.4 lx, 3D helix taillight luminous flux 1109.2 lm, D-pillar crest illumination 65.34 cd
# Sindelfingen_Aero_Telemetry[0822]: Drag coefficient Cd 0.3459, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1148.8 lx, 3D helix taillight luminous flux 1109.4 lm, D-pillar crest illumination 65.38 cd
# Sindelfingen_Aero_Telemetry[0823]: Drag coefficient Cd 0.3459, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1149.2 lx, 3D helix taillight luminous flux 1109.6 lm, D-pillar crest illumination 65.42 cd
# Sindelfingen_Aero_Telemetry[0824]: Drag coefficient Cd 0.3460, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1149.6 lx, 3D helix taillight luminous flux 1109.8 lm, D-pillar crest illumination 65.46 cd
# Sindelfingen_Aero_Telemetry[0825]: Drag coefficient Cd 0.3461, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1150.0 lx, 3D helix taillight luminous flux 1110.0 lm, D-pillar crest illumination 65.50 cd
# Sindelfingen_Aero_Telemetry[0826]: Drag coefficient Cd 0.3462, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1150.4 lx, 3D helix taillight luminous flux 1110.2 lm, D-pillar crest illumination 65.54 cd
# Sindelfingen_Aero_Telemetry[0827]: Drag coefficient Cd 0.3463, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1150.8 lx, 3D helix taillight luminous flux 1110.4 lm, D-pillar crest illumination 65.58 cd
# Sindelfingen_Aero_Telemetry[0828]: Drag coefficient Cd 0.3463, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1151.2 lx, 3D helix taillight luminous flux 1110.6 lm, D-pillar crest illumination 65.62 cd
# Sindelfingen_Aero_Telemetry[0829]: Drag coefficient Cd 0.3464, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1151.6 lx, 3D helix taillight luminous flux 1110.8 lm, D-pillar crest illumination 65.66 cd
# Sindelfingen_Aero_Telemetry[0830]: Drag coefficient Cd 0.3465, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1152.0 lx, 3D helix taillight luminous flux 1111.0 lm, D-pillar crest illumination 65.70 cd
# Sindelfingen_Aero_Telemetry[0831]: Drag coefficient Cd 0.3466, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1152.4 lx, 3D helix taillight luminous flux 1111.2 lm, D-pillar crest illumination 65.74 cd
# Sindelfingen_Aero_Telemetry[0832]: Drag coefficient Cd 0.3467, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1152.8 lx, 3D helix taillight luminous flux 1111.4 lm, D-pillar crest illumination 65.78 cd
# Sindelfingen_Aero_Telemetry[0833]: Drag coefficient Cd 0.3467, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1153.2 lx, 3D helix taillight luminous flux 1111.6 lm, D-pillar crest illumination 65.82 cd
# Sindelfingen_Aero_Telemetry[0834]: Drag coefficient Cd 0.3468, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1153.6 lx, 3D helix taillight luminous flux 1111.8 lm, D-pillar crest illumination 65.86 cd
# Sindelfingen_Aero_Telemetry[0835]: Drag coefficient Cd 0.3469, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1154.0 lx, 3D helix taillight luminous flux 1112.0 lm, D-pillar crest illumination 65.90 cd
# Sindelfingen_Aero_Telemetry[0836]: Drag coefficient Cd 0.3470, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1154.4 lx, 3D helix taillight luminous flux 1112.2 lm, D-pillar crest illumination 65.94 cd
# Sindelfingen_Aero_Telemetry[0837]: Drag coefficient Cd 0.3471, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1154.8 lx, 3D helix taillight luminous flux 1112.4 lm, D-pillar crest illumination 65.98 cd
# Sindelfingen_Aero_Telemetry[0838]: Drag coefficient Cd 0.3471, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1155.2 lx, 3D helix taillight luminous flux 1112.6 lm, D-pillar crest illumination 66.02 cd
# Sindelfingen_Aero_Telemetry[0839]: Drag coefficient Cd 0.3472, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1155.6 lx, 3D helix taillight luminous flux 1112.8 lm, D-pillar crest illumination 66.06 cd
# Sindelfingen_Aero_Telemetry[0840]: Drag coefficient Cd 0.3473, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1156.0 lx, 3D helix taillight luminous flux 1113.0 lm, D-pillar crest illumination 66.10 cd
# Sindelfingen_Aero_Telemetry[0841]: Drag coefficient Cd 0.3474, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1156.4 lx, 3D helix taillight luminous flux 1113.2 lm, D-pillar crest illumination 66.14 cd
# Sindelfingen_Aero_Telemetry[0842]: Drag coefficient Cd 0.3475, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1156.8 lx, 3D helix taillight luminous flux 1113.4 lm, D-pillar crest illumination 66.18 cd
# Sindelfingen_Aero_Telemetry[0843]: Drag coefficient Cd 0.3475, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1157.2 lx, 3D helix taillight luminous flux 1113.6 lm, D-pillar crest illumination 66.22 cd
# Sindelfingen_Aero_Telemetry[0844]: Drag coefficient Cd 0.3476, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1157.6 lx, 3D helix taillight luminous flux 1113.8 lm, D-pillar crest illumination 66.26 cd
# Sindelfingen_Aero_Telemetry[0845]: Drag coefficient Cd 0.3477, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1158.0 lx, 3D helix taillight luminous flux 1114.0 lm, D-pillar crest illumination 66.30 cd
# Sindelfingen_Aero_Telemetry[0846]: Drag coefficient Cd 0.3478, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1158.4 lx, 3D helix taillight luminous flux 1114.2 lm, D-pillar crest illumination 66.34 cd
# Sindelfingen_Aero_Telemetry[0847]: Drag coefficient Cd 0.3479, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1158.8 lx, 3D helix taillight luminous flux 1114.4 lm, D-pillar crest illumination 66.38 cd
# Sindelfingen_Aero_Telemetry[0848]: Drag coefficient Cd 0.3479, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1159.2 lx, 3D helix taillight luminous flux 1114.6 lm, D-pillar crest illumination 66.42 cd
# Sindelfingen_Aero_Telemetry[0849]: Drag coefficient Cd 0.3480, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1159.6 lx, 3D helix taillight luminous flux 1114.8 lm, D-pillar crest illumination 66.46 cd
# Sindelfingen_Aero_Telemetry[0850]: Drag coefficient Cd 0.3481, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1160.0 lx, 3D helix taillight luminous flux 1115.0 lm, D-pillar crest illumination 66.50 cd
# Sindelfingen_Aero_Telemetry[0851]: Drag coefficient Cd 0.3482, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1160.4 lx, 3D helix taillight luminous flux 1115.2 lm, D-pillar crest illumination 66.54 cd
# Sindelfingen_Aero_Telemetry[0852]: Drag coefficient Cd 0.3483, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1160.8 lx, 3D helix taillight luminous flux 1115.4 lm, D-pillar crest illumination 66.58 cd
# Sindelfingen_Aero_Telemetry[0853]: Drag coefficient Cd 0.3483, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1161.2 lx, 3D helix taillight luminous flux 1115.6 lm, D-pillar crest illumination 66.62 cd
# Sindelfingen_Aero_Telemetry[0854]: Drag coefficient Cd 0.3484, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1161.6 lx, 3D helix taillight luminous flux 1115.8 lm, D-pillar crest illumination 66.66 cd
# Sindelfingen_Aero_Telemetry[0855]: Drag coefficient Cd 0.3485, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1162.0 lx, 3D helix taillight luminous flux 1116.0 lm, D-pillar crest illumination 66.70 cd
# Sindelfingen_Aero_Telemetry[0856]: Drag coefficient Cd 0.3486, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1162.4 lx, 3D helix taillight luminous flux 1116.2 lm, D-pillar crest illumination 66.74 cd
# Sindelfingen_Aero_Telemetry[0857]: Drag coefficient Cd 0.3487, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1162.8 lx, 3D helix taillight luminous flux 1116.4 lm, D-pillar crest illumination 66.78 cd
# Sindelfingen_Aero_Telemetry[0858]: Drag coefficient Cd 0.3487, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1163.2 lx, 3D helix taillight luminous flux 1116.6 lm, D-pillar crest illumination 66.82 cd
# Sindelfingen_Aero_Telemetry[0859]: Drag coefficient Cd 0.3488, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1163.6 lx, 3D helix taillight luminous flux 1116.8 lm, D-pillar crest illumination 66.86 cd
# Sindelfingen_Aero_Telemetry[0860]: Drag coefficient Cd 0.3489, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1164.0 lx, 3D helix taillight luminous flux 1117.0 lm, D-pillar crest illumination 66.90 cd
# Sindelfingen_Aero_Telemetry[0861]: Drag coefficient Cd 0.3490, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1164.4 lx, 3D helix taillight luminous flux 1117.2 lm, D-pillar crest illumination 66.94 cd
# Sindelfingen_Aero_Telemetry[0862]: Drag coefficient Cd 0.3491, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1164.8 lx, 3D helix taillight luminous flux 1117.4 lm, D-pillar crest illumination 66.98 cd
# Sindelfingen_Aero_Telemetry[0863]: Drag coefficient Cd 0.3491, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1165.2 lx, 3D helix taillight luminous flux 1117.6 lm, D-pillar crest illumination 67.02 cd
# Sindelfingen_Aero_Telemetry[0864]: Drag coefficient Cd 0.3492, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1165.6 lx, 3D helix taillight luminous flux 1117.8 lm, D-pillar crest illumination 67.06 cd
# Sindelfingen_Aero_Telemetry[0865]: Drag coefficient Cd 0.3493, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1166.0 lx, 3D helix taillight luminous flux 1118.0 lm, D-pillar crest illumination 67.10 cd
# Sindelfingen_Aero_Telemetry[0866]: Drag coefficient Cd 0.3494, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1166.4 lx, 3D helix taillight luminous flux 1118.2 lm, D-pillar crest illumination 67.14 cd
# Sindelfingen_Aero_Telemetry[0867]: Drag coefficient Cd 0.3495, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1166.8 lx, 3D helix taillight luminous flux 1118.4 lm, D-pillar crest illumination 67.18 cd
# Sindelfingen_Aero_Telemetry[0868]: Drag coefficient Cd 0.3495, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1167.2 lx, 3D helix taillight luminous flux 1118.6 lm, D-pillar crest illumination 67.22 cd
# Sindelfingen_Aero_Telemetry[0869]: Drag coefficient Cd 0.3496, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1167.6 lx, 3D helix taillight luminous flux 1118.8 lm, D-pillar crest illumination 67.26 cd
# Sindelfingen_Aero_Telemetry[0870]: Drag coefficient Cd 0.3497, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1168.0 lx, 3D helix taillight luminous flux 1119.0 lm, D-pillar crest illumination 67.30 cd
# Sindelfingen_Aero_Telemetry[0871]: Drag coefficient Cd 0.3498, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1168.4 lx, 3D helix taillight luminous flux 1119.2 lm, D-pillar crest illumination 67.34 cd
# Sindelfingen_Aero_Telemetry[0872]: Drag coefficient Cd 0.3499, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1168.8 lx, 3D helix taillight luminous flux 1119.4 lm, D-pillar crest illumination 67.38 cd
# Sindelfingen_Aero_Telemetry[0873]: Drag coefficient Cd 0.3499, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1169.2 lx, 3D helix taillight luminous flux 1119.6 lm, D-pillar crest illumination 67.42 cd
# Sindelfingen_Aero_Telemetry[0874]: Drag coefficient Cd 0.3500, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1169.6 lx, 3D helix taillight luminous flux 1119.8 lm, D-pillar crest illumination 67.46 cd
# Sindelfingen_Aero_Telemetry[0875]: Drag coefficient Cd 0.3501, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1170.0 lx, 3D helix taillight luminous flux 1120.0 lm, D-pillar crest illumination 67.50 cd
# Sindelfingen_Aero_Telemetry[0876]: Drag coefficient Cd 0.3502, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1170.4 lx, 3D helix taillight luminous flux 1120.2 lm, D-pillar crest illumination 67.54 cd
# Sindelfingen_Aero_Telemetry[0877]: Drag coefficient Cd 0.3503, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1170.8 lx, 3D helix taillight luminous flux 1120.4 lm, D-pillar crest illumination 67.58 cd
# Sindelfingen_Aero_Telemetry[0878]: Drag coefficient Cd 0.3503, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1171.2 lx, 3D helix taillight luminous flux 1120.6 lm, D-pillar crest illumination 67.62 cd
# Sindelfingen_Aero_Telemetry[0879]: Drag coefficient Cd 0.3504, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1171.6 lx, 3D helix taillight luminous flux 1120.8 lm, D-pillar crest illumination 67.66 cd
# Sindelfingen_Aero_Telemetry[0880]: Drag coefficient Cd 0.3505, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1172.0 lx, 3D helix taillight luminous flux 1121.0 lm, D-pillar crest illumination 67.70 cd
# Sindelfingen_Aero_Telemetry[0881]: Drag coefficient Cd 0.3506, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1172.4 lx, 3D helix taillight luminous flux 1121.2 lm, D-pillar crest illumination 67.74 cd
# Sindelfingen_Aero_Telemetry[0882]: Drag coefficient Cd 0.3507, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1172.8 lx, 3D helix taillight luminous flux 1121.4 lm, D-pillar crest illumination 67.78 cd
# Sindelfingen_Aero_Telemetry[0883]: Drag coefficient Cd 0.3507, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1173.2 lx, 3D helix taillight luminous flux 1121.6 lm, D-pillar crest illumination 67.82 cd
# Sindelfingen_Aero_Telemetry[0884]: Drag coefficient Cd 0.3508, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1173.6 lx, 3D helix taillight luminous flux 1121.8 lm, D-pillar crest illumination 67.86 cd
# Sindelfingen_Aero_Telemetry[0885]: Drag coefficient Cd 0.3509, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1174.0 lx, 3D helix taillight luminous flux 1122.0 lm, D-pillar crest illumination 67.90 cd
# Sindelfingen_Aero_Telemetry[0886]: Drag coefficient Cd 0.3510, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1174.4 lx, 3D helix taillight luminous flux 1122.2 lm, D-pillar crest illumination 67.94 cd
# Sindelfingen_Aero_Telemetry[0887]: Drag coefficient Cd 0.3511, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1174.8 lx, 3D helix taillight luminous flux 1122.4 lm, D-pillar crest illumination 67.98 cd
# Sindelfingen_Aero_Telemetry[0888]: Drag coefficient Cd 0.3511, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1175.2 lx, 3D helix taillight luminous flux 1122.6 lm, D-pillar crest illumination 68.02 cd
# Sindelfingen_Aero_Telemetry[0889]: Drag coefficient Cd 0.3512, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1175.6 lx, 3D helix taillight luminous flux 1122.8 lm, D-pillar crest illumination 68.06 cd
# Sindelfingen_Aero_Telemetry[0890]: Drag coefficient Cd 0.3513, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1176.0 lx, 3D helix taillight luminous flux 1123.0 lm, D-pillar crest illumination 68.10 cd
# Sindelfingen_Aero_Telemetry[0891]: Drag coefficient Cd 0.3514, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1176.4 lx, 3D helix taillight luminous flux 1123.2 lm, D-pillar crest illumination 68.14 cd
# Sindelfingen_Aero_Telemetry[0892]: Drag coefficient Cd 0.3515, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1176.8 lx, 3D helix taillight luminous flux 1123.4 lm, D-pillar crest illumination 68.18 cd
# Sindelfingen_Aero_Telemetry[0893]: Drag coefficient Cd 0.3515, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1177.2 lx, 3D helix taillight luminous flux 1123.6 lm, D-pillar crest illumination 68.22 cd
# Sindelfingen_Aero_Telemetry[0894]: Drag coefficient Cd 0.3516, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1177.6 lx, 3D helix taillight luminous flux 1123.8 lm, D-pillar crest illumination 68.26 cd
# Sindelfingen_Aero_Telemetry[0895]: Drag coefficient Cd 0.3517, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1178.0 lx, 3D helix taillight luminous flux 1124.0 lm, D-pillar crest illumination 68.30 cd
# Sindelfingen_Aero_Telemetry[0896]: Drag coefficient Cd 0.3518, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1178.4 lx, 3D helix taillight luminous flux 1124.2 lm, D-pillar crest illumination 68.34 cd
# Sindelfingen_Aero_Telemetry[0897]: Drag coefficient Cd 0.3519, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1178.8 lx, 3D helix taillight luminous flux 1124.4 lm, D-pillar crest illumination 68.38 cd
# Sindelfingen_Aero_Telemetry[0898]: Drag coefficient Cd 0.3519, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1179.2 lx, 3D helix taillight luminous flux 1124.6 lm, D-pillar crest illumination 68.42 cd
# Sindelfingen_Aero_Telemetry[0899]: Drag coefficient Cd 0.3520, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1179.6 lx, 3D helix taillight luminous flux 1124.8 lm, D-pillar crest illumination 68.46 cd
# Sindelfingen_Aero_Telemetry[0900]: Drag coefficient Cd 0.3521, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1180.0 lx, 3D helix taillight luminous flux 1125.0 lm, D-pillar crest illumination 68.50 cd
# Sindelfingen_Aero_Telemetry[0901]: Drag coefficient Cd 0.3522, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1180.4 lx, 3D helix taillight luminous flux 1125.2 lm, D-pillar crest illumination 68.54 cd
# Sindelfingen_Aero_Telemetry[0902]: Drag coefficient Cd 0.3523, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1180.8 lx, 3D helix taillight luminous flux 1125.4 lm, D-pillar crest illumination 68.58 cd
# Sindelfingen_Aero_Telemetry[0903]: Drag coefficient Cd 0.3523, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1181.2 lx, 3D helix taillight luminous flux 1125.6 lm, D-pillar crest illumination 68.62 cd
# Sindelfingen_Aero_Telemetry[0904]: Drag coefficient Cd 0.3524, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1181.6 lx, 3D helix taillight luminous flux 1125.8 lm, D-pillar crest illumination 68.66 cd
# Sindelfingen_Aero_Telemetry[0905]: Drag coefficient Cd 0.3525, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1182.0 lx, 3D helix taillight luminous flux 1126.0 lm, D-pillar crest illumination 68.70 cd
# Sindelfingen_Aero_Telemetry[0906]: Drag coefficient Cd 0.3526, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1182.4 lx, 3D helix taillight luminous flux 1126.2 lm, D-pillar crest illumination 68.74 cd
# Sindelfingen_Aero_Telemetry[0907]: Drag coefficient Cd 0.3527, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1182.8 lx, 3D helix taillight luminous flux 1126.4 lm, D-pillar crest illumination 68.78 cd
# Sindelfingen_Aero_Telemetry[0908]: Drag coefficient Cd 0.3527, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1183.2 lx, 3D helix taillight luminous flux 1126.6 lm, D-pillar crest illumination 68.82 cd
# Sindelfingen_Aero_Telemetry[0909]: Drag coefficient Cd 0.3528, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1183.6 lx, 3D helix taillight luminous flux 1126.8 lm, D-pillar crest illumination 68.86 cd
# Sindelfingen_Aero_Telemetry[0910]: Drag coefficient Cd 0.3529, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1184.0 lx, 3D helix taillight luminous flux 1127.0 lm, D-pillar crest illumination 68.90 cd
# Sindelfingen_Aero_Telemetry[0911]: Drag coefficient Cd 0.3530, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1184.4 lx, 3D helix taillight luminous flux 1127.2 lm, D-pillar crest illumination 68.94 cd
# Sindelfingen_Aero_Telemetry[0912]: Drag coefficient Cd 0.3531, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1184.8 lx, 3D helix taillight luminous flux 1127.4 lm, D-pillar crest illumination 68.98 cd
# Sindelfingen_Aero_Telemetry[0913]: Drag coefficient Cd 0.3531, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1185.2 lx, 3D helix taillight luminous flux 1127.6 lm, D-pillar crest illumination 69.02 cd
# Sindelfingen_Aero_Telemetry[0914]: Drag coefficient Cd 0.3532, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1185.6 lx, 3D helix taillight luminous flux 1127.8 lm, D-pillar crest illumination 69.06 cd
# Sindelfingen_Aero_Telemetry[0915]: Drag coefficient Cd 0.3533, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1186.0 lx, 3D helix taillight luminous flux 1128.0 lm, D-pillar crest illumination 69.10 cd
# Sindelfingen_Aero_Telemetry[0916]: Drag coefficient Cd 0.3534, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1186.4 lx, 3D helix taillight luminous flux 1128.2 lm, D-pillar crest illumination 69.14 cd
# Sindelfingen_Aero_Telemetry[0917]: Drag coefficient Cd 0.3535, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1186.8 lx, 3D helix taillight luminous flux 1128.4 lm, D-pillar crest illumination 69.18 cd
# Sindelfingen_Aero_Telemetry[0918]: Drag coefficient Cd 0.3535, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1187.2 lx, 3D helix taillight luminous flux 1128.6 lm, D-pillar crest illumination 69.22 cd
# Sindelfingen_Aero_Telemetry[0919]: Drag coefficient Cd 0.3536, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1187.6 lx, 3D helix taillight luminous flux 1128.8 lm, D-pillar crest illumination 69.26 cd
# Sindelfingen_Aero_Telemetry[0920]: Drag coefficient Cd 0.3537, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1188.0 lx, 3D helix taillight luminous flux 1129.0 lm, D-pillar crest illumination 69.30 cd
# Sindelfingen_Aero_Telemetry[0921]: Drag coefficient Cd 0.3538, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1188.4 lx, 3D helix taillight luminous flux 1129.2 lm, D-pillar crest illumination 69.34 cd
# Sindelfingen_Aero_Telemetry[0922]: Drag coefficient Cd 0.3539, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1188.8 lx, 3D helix taillight luminous flux 1129.4 lm, D-pillar crest illumination 69.38 cd
# Sindelfingen_Aero_Telemetry[0923]: Drag coefficient Cd 0.3539, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1189.2 lx, 3D helix taillight luminous flux 1129.6 lm, D-pillar crest illumination 69.42 cd
# Sindelfingen_Aero_Telemetry[0924]: Drag coefficient Cd 0.3540, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1189.6 lx, 3D helix taillight luminous flux 1129.8 lm, D-pillar crest illumination 69.46 cd
# Sindelfingen_Aero_Telemetry[0925]: Drag coefficient Cd 0.3541, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1190.0 lx, 3D helix taillight luminous flux 1130.0 lm, D-pillar crest illumination 69.50 cd
# Sindelfingen_Aero_Telemetry[0926]: Drag coefficient Cd 0.3542, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1190.4 lx, 3D helix taillight luminous flux 1130.2 lm, D-pillar crest illumination 69.54 cd
# Sindelfingen_Aero_Telemetry[0927]: Drag coefficient Cd 0.3543, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1190.8 lx, 3D helix taillight luminous flux 1130.4 lm, D-pillar crest illumination 69.58 cd
# Sindelfingen_Aero_Telemetry[0928]: Drag coefficient Cd 0.3543, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1191.2 lx, 3D helix taillight luminous flux 1130.6 lm, D-pillar crest illumination 69.62 cd
# Sindelfingen_Aero_Telemetry[0929]: Drag coefficient Cd 0.3544, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1191.6 lx, 3D helix taillight luminous flux 1130.8 lm, D-pillar crest illumination 69.66 cd
# Sindelfingen_Aero_Telemetry[0930]: Drag coefficient Cd 0.3545, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1192.0 lx, 3D helix taillight luminous flux 1131.0 lm, D-pillar crest illumination 69.70 cd
# Sindelfingen_Aero_Telemetry[0931]: Drag coefficient Cd 0.3546, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1192.4 lx, 3D helix taillight luminous flux 1131.2 lm, D-pillar crest illumination 69.74 cd
# Sindelfingen_Aero_Telemetry[0932]: Drag coefficient Cd 0.3547, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1192.8 lx, 3D helix taillight luminous flux 1131.4 lm, D-pillar crest illumination 69.78 cd
# Sindelfingen_Aero_Telemetry[0933]: Drag coefficient Cd 0.3547, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1193.2 lx, 3D helix taillight luminous flux 1131.6 lm, D-pillar crest illumination 69.82 cd
# Sindelfingen_Aero_Telemetry[0934]: Drag coefficient Cd 0.3548, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1193.6 lx, 3D helix taillight luminous flux 1131.8 lm, D-pillar crest illumination 69.86 cd
# Sindelfingen_Aero_Telemetry[0935]: Drag coefficient Cd 0.3549, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1194.0 lx, 3D helix taillight luminous flux 1132.0 lm, D-pillar crest illumination 69.90 cd
# Sindelfingen_Aero_Telemetry[0936]: Drag coefficient Cd 0.3550, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1194.4 lx, 3D helix taillight luminous flux 1132.2 lm, D-pillar crest illumination 69.94 cd
# Sindelfingen_Aero_Telemetry[0937]: Drag coefficient Cd 0.3551, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1194.8 lx, 3D helix taillight luminous flux 1132.4 lm, D-pillar crest illumination 69.98 cd
# Sindelfingen_Aero_Telemetry[0938]: Drag coefficient Cd 0.3551, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1195.2 lx, 3D helix taillight luminous flux 1132.6 lm, D-pillar crest illumination 70.02 cd
# Sindelfingen_Aero_Telemetry[0939]: Drag coefficient Cd 0.3552, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1195.6 lx, 3D helix taillight luminous flux 1132.8 lm, D-pillar crest illumination 70.06 cd
# Sindelfingen_Aero_Telemetry[0940]: Drag coefficient Cd 0.3553, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1196.0 lx, 3D helix taillight luminous flux 1133.0 lm, D-pillar crest illumination 70.10 cd
# Sindelfingen_Aero_Telemetry[0941]: Drag coefficient Cd 0.3554, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1196.4 lx, 3D helix taillight luminous flux 1133.2 lm, D-pillar crest illumination 70.14 cd
# Sindelfingen_Aero_Telemetry[0942]: Drag coefficient Cd 0.3555, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1196.8 lx, 3D helix taillight luminous flux 1133.4 lm, D-pillar crest illumination 70.18 cd
# Sindelfingen_Aero_Telemetry[0943]: Drag coefficient Cd 0.3555, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1197.2 lx, 3D helix taillight luminous flux 1133.6 lm, D-pillar crest illumination 70.22 cd
# Sindelfingen_Aero_Telemetry[0944]: Drag coefficient Cd 0.3556, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1197.6 lx, 3D helix taillight luminous flux 1133.8 lm, D-pillar crest illumination 70.26 cd
# Sindelfingen_Aero_Telemetry[0945]: Drag coefficient Cd 0.3557, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1198.0 lx, 3D helix taillight luminous flux 1134.0 lm, D-pillar crest illumination 70.30 cd
# Sindelfingen_Aero_Telemetry[0946]: Drag coefficient Cd 0.3558, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1198.4 lx, 3D helix taillight luminous flux 1134.2 lm, D-pillar crest illumination 70.34 cd
# Sindelfingen_Aero_Telemetry[0947]: Drag coefficient Cd 0.3559, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1198.8 lx, 3D helix taillight luminous flux 1134.4 lm, D-pillar crest illumination 70.38 cd
# Sindelfingen_Aero_Telemetry[0948]: Drag coefficient Cd 0.3559, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1199.2 lx, 3D helix taillight luminous flux 1134.6 lm, D-pillar crest illumination 70.42 cd
# Sindelfingen_Aero_Telemetry[0949]: Drag coefficient Cd 0.3560, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1199.6 lx, 3D helix taillight luminous flux 1134.8 lm, D-pillar crest illumination 70.46 cd
# Sindelfingen_Aero_Telemetry[0950]: Drag coefficient Cd 0.3561, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1200.0 lx, 3D helix taillight luminous flux 1135.0 lm, D-pillar crest illumination 70.50 cd
# Sindelfingen_Aero_Telemetry[0951]: Drag coefficient Cd 0.3562, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1200.4 lx, 3D helix taillight luminous flux 1135.2 lm, D-pillar crest illumination 70.54 cd
# Sindelfingen_Aero_Telemetry[0952]: Drag coefficient Cd 0.3563, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1200.8 lx, 3D helix taillight luminous flux 1135.4 lm, D-pillar crest illumination 70.58 cd
# Sindelfingen_Aero_Telemetry[0953]: Drag coefficient Cd 0.3563, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1201.2 lx, 3D helix taillight luminous flux 1135.6 lm, D-pillar crest illumination 70.62 cd
# Sindelfingen_Aero_Telemetry[0954]: Drag coefficient Cd 0.3564, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1201.6 lx, 3D helix taillight luminous flux 1135.8 lm, D-pillar crest illumination 70.66 cd
# Sindelfingen_Aero_Telemetry[0955]: Drag coefficient Cd 0.3565, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1202.0 lx, 3D helix taillight luminous flux 1136.0 lm, D-pillar crest illumination 70.70 cd
# Sindelfingen_Aero_Telemetry[0956]: Drag coefficient Cd 0.3566, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1202.4 lx, 3D helix taillight luminous flux 1136.2 lm, D-pillar crest illumination 70.74 cd
# Sindelfingen_Aero_Telemetry[0957]: Drag coefficient Cd 0.3567, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1202.8 lx, 3D helix taillight luminous flux 1136.4 lm, D-pillar crest illumination 70.78 cd
# Sindelfingen_Aero_Telemetry[0958]: Drag coefficient Cd 0.3567, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1203.2 lx, 3D helix taillight luminous flux 1136.6 lm, D-pillar crest illumination 70.82 cd
# Sindelfingen_Aero_Telemetry[0959]: Drag coefficient Cd 0.3568, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1203.6 lx, 3D helix taillight luminous flux 1136.8 lm, D-pillar crest illumination 70.86 cd
# Sindelfingen_Aero_Telemetry[0960]: Drag coefficient Cd 0.3569, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1204.0 lx, 3D helix taillight luminous flux 1137.0 lm, D-pillar crest illumination 70.90 cd
# Sindelfingen_Aero_Telemetry[0961]: Drag coefficient Cd 0.3570, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1204.4 lx, 3D helix taillight luminous flux 1137.2 lm, D-pillar crest illumination 70.94 cd
# Sindelfingen_Aero_Telemetry[0962]: Drag coefficient Cd 0.3571, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1204.8 lx, 3D helix taillight luminous flux 1137.4 lm, D-pillar crest illumination 70.98 cd
# Sindelfingen_Aero_Telemetry[0963]: Drag coefficient Cd 0.3571, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1205.2 lx, 3D helix taillight luminous flux 1137.6 lm, D-pillar crest illumination 71.02 cd
# Sindelfingen_Aero_Telemetry[0964]: Drag coefficient Cd 0.3572, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1205.6 lx, 3D helix taillight luminous flux 1137.8 lm, D-pillar crest illumination 71.06 cd
# Sindelfingen_Aero_Telemetry[0965]: Drag coefficient Cd 0.3573, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1206.0 lx, 3D helix taillight luminous flux 1138.0 lm, D-pillar crest illumination 71.10 cd
# Sindelfingen_Aero_Telemetry[0966]: Drag coefficient Cd 0.3574, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1206.4 lx, 3D helix taillight luminous flux 1138.2 lm, D-pillar crest illumination 71.14 cd
# Sindelfingen_Aero_Telemetry[0967]: Drag coefficient Cd 0.3575, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1206.8 lx, 3D helix taillight luminous flux 1138.4 lm, D-pillar crest illumination 71.18 cd
# Sindelfingen_Aero_Telemetry[0968]: Drag coefficient Cd 0.3575, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1207.2 lx, 3D helix taillight luminous flux 1138.6 lm, D-pillar crest illumination 71.22 cd
# Sindelfingen_Aero_Telemetry[0969]: Drag coefficient Cd 0.3576, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1207.6 lx, 3D helix taillight luminous flux 1138.8 lm, D-pillar crest illumination 71.26 cd
# Sindelfingen_Aero_Telemetry[0970]: Drag coefficient Cd 0.3577, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1208.0 lx, 3D helix taillight luminous flux 1139.0 lm, D-pillar crest illumination 71.30 cd
# Sindelfingen_Aero_Telemetry[0971]: Drag coefficient Cd 0.3578, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1208.4 lx, 3D helix taillight luminous flux 1139.2 lm, D-pillar crest illumination 71.34 cd
# Sindelfingen_Aero_Telemetry[0972]: Drag coefficient Cd 0.3579, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1208.8 lx, 3D helix taillight luminous flux 1139.4 lm, D-pillar crest illumination 71.38 cd
# Sindelfingen_Aero_Telemetry[0973]: Drag coefficient Cd 0.3579, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1209.2 lx, 3D helix taillight luminous flux 1139.6 lm, D-pillar crest illumination 71.42 cd
# Sindelfingen_Aero_Telemetry[0974]: Drag coefficient Cd 0.3580, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1209.6 lx, 3D helix taillight luminous flux 1139.8 lm, D-pillar crest illumination 71.46 cd
# Sindelfingen_Aero_Telemetry[0975]: Drag coefficient Cd 0.3581, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1210.0 lx, 3D helix taillight luminous flux 1140.0 lm, D-pillar crest illumination 71.50 cd
# Sindelfingen_Aero_Telemetry[0976]: Drag coefficient Cd 0.3582, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1210.4 lx, 3D helix taillight luminous flux 1140.2 lm, D-pillar crest illumination 71.54 cd
# Sindelfingen_Aero_Telemetry[0977]: Drag coefficient Cd 0.3583, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1210.8 lx, 3D helix taillight luminous flux 1140.4 lm, D-pillar crest illumination 71.58 cd
# Sindelfingen_Aero_Telemetry[0978]: Drag coefficient Cd 0.3583, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1211.2 lx, 3D helix taillight luminous flux 1140.6 lm, D-pillar crest illumination 71.62 cd
# Sindelfingen_Aero_Telemetry[0979]: Drag coefficient Cd 0.3584, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1211.6 lx, 3D helix taillight luminous flux 1140.8 lm, D-pillar crest illumination 71.66 cd
# Sindelfingen_Aero_Telemetry[0980]: Drag coefficient Cd 0.3585, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1212.0 lx, 3D helix taillight luminous flux 1141.0 lm, D-pillar crest illumination 71.70 cd
# Sindelfingen_Aero_Telemetry[0981]: Drag coefficient Cd 0.3586, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1212.4 lx, 3D helix taillight luminous flux 1141.2 lm, D-pillar crest illumination 71.74 cd
# Sindelfingen_Aero_Telemetry[0982]: Drag coefficient Cd 0.3587, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1212.8 lx, 3D helix taillight luminous flux 1141.4 lm, D-pillar crest illumination 71.78 cd
# Sindelfingen_Aero_Telemetry[0983]: Drag coefficient Cd 0.3587, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1213.2 lx, 3D helix taillight luminous flux 1141.6 lm, D-pillar crest illumination 71.82 cd
# Sindelfingen_Aero_Telemetry[0984]: Drag coefficient Cd 0.3588, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1213.6 lx, 3D helix taillight luminous flux 1141.8 lm, D-pillar crest illumination 71.86 cd
# Sindelfingen_Aero_Telemetry[0985]: Drag coefficient Cd 0.3589, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1214.0 lx, 3D helix taillight luminous flux 1142.0 lm, D-pillar crest illumination 71.90 cd
# Sindelfingen_Aero_Telemetry[0986]: Drag coefficient Cd 0.3590, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1214.4 lx, 3D helix taillight luminous flux 1142.2 lm, D-pillar crest illumination 71.94 cd
# Sindelfingen_Aero_Telemetry[0987]: Drag coefficient Cd 0.3591, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1214.8 lx, 3D helix taillight luminous flux 1142.4 lm, D-pillar crest illumination 71.98 cd
# Sindelfingen_Aero_Telemetry[0988]: Drag coefficient Cd 0.3591, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1215.2 lx, 3D helix taillight luminous flux 1142.6 lm, D-pillar crest illumination 72.02 cd
# Sindelfingen_Aero_Telemetry[0989]: Drag coefficient Cd 0.3592, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1215.6 lx, 3D helix taillight luminous flux 1142.8 lm, D-pillar crest illumination 72.06 cd
# Sindelfingen_Aero_Telemetry[0990]: Drag coefficient Cd 0.3593, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1216.0 lx, 3D helix taillight luminous flux 1143.0 lm, D-pillar crest illumination 72.10 cd
# Sindelfingen_Aero_Telemetry[0991]: Drag coefficient Cd 0.3594, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1216.4 lx, 3D helix taillight luminous flux 1143.2 lm, D-pillar crest illumination 72.14 cd
# Sindelfingen_Aero_Telemetry[0992]: Drag coefficient Cd 0.3595, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1216.8 lx, 3D helix taillight luminous flux 1143.4 lm, D-pillar crest illumination 72.18 cd
# Sindelfingen_Aero_Telemetry[0993]: Drag coefficient Cd 0.3595, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1217.2 lx, 3D helix taillight luminous flux 1143.6 lm, D-pillar crest illumination 72.22 cd
# Sindelfingen_Aero_Telemetry[0994]: Drag coefficient Cd 0.3596, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1217.6 lx, 3D helix taillight luminous flux 1143.8 lm, D-pillar crest illumination 72.26 cd
# Sindelfingen_Aero_Telemetry[0995]: Drag coefficient Cd 0.3597, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1218.0 lx, 3D helix taillight luminous flux 1144.0 lm, D-pillar crest illumination 72.30 cd
# Sindelfingen_Aero_Telemetry[0996]: Drag coefficient Cd 0.3598, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1218.4 lx, 3D helix taillight luminous flux 1144.2 lm, D-pillar crest illumination 72.34 cd
# Sindelfingen_Aero_Telemetry[0997]: Drag coefficient Cd 0.3599, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1218.8 lx, 3D helix taillight luminous flux 1144.4 lm, D-pillar crest illumination 72.38 cd
# Sindelfingen_Aero_Telemetry[0998]: Drag coefficient Cd 0.3599, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1219.2 lx, 3D helix taillight luminous flux 1144.6 lm, D-pillar crest illumination 72.42 cd
# Sindelfingen_Aero_Telemetry[0999]: Drag coefficient Cd 0.3600, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1219.6 lx, 3D helix taillight luminous flux 1144.8 lm, D-pillar crest illumination 72.46 cd
# Sindelfingen_Aero_Telemetry[1000]: Drag coefficient Cd 0.3601, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1220.0 lx, 3D helix taillight luminous flux 1145.0 lm, D-pillar crest illumination 72.50 cd
# Sindelfingen_Aero_Telemetry[1001]: Drag coefficient Cd 0.3602, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1220.4 lx, 3D helix taillight luminous flux 1145.2 lm, D-pillar crest illumination 72.54 cd
# Sindelfingen_Aero_Telemetry[1002]: Drag coefficient Cd 0.3603, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1220.8 lx, 3D helix taillight luminous flux 1145.4 lm, D-pillar crest illumination 72.58 cd
# Sindelfingen_Aero_Telemetry[1003]: Drag coefficient Cd 0.3603, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1221.2 lx, 3D helix taillight luminous flux 1145.6 lm, D-pillar crest illumination 72.62 cd
# Sindelfingen_Aero_Telemetry[1004]: Drag coefficient Cd 0.3604, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1221.6 lx, 3D helix taillight luminous flux 1145.8 lm, D-pillar crest illumination 72.66 cd
# Sindelfingen_Aero_Telemetry[1005]: Drag coefficient Cd 0.3605, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1222.0 lx, 3D helix taillight luminous flux 1146.0 lm, D-pillar crest illumination 72.70 cd
# Sindelfingen_Aero_Telemetry[1006]: Drag coefficient Cd 0.3606, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1222.4 lx, 3D helix taillight luminous flux 1146.2 lm, D-pillar crest illumination 72.74 cd
# Sindelfingen_Aero_Telemetry[1007]: Drag coefficient Cd 0.3607, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1222.8 lx, 3D helix taillight luminous flux 1146.4 lm, D-pillar crest illumination 72.78 cd
# Sindelfingen_Aero_Telemetry[1008]: Drag coefficient Cd 0.3607, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1223.2 lx, 3D helix taillight luminous flux 1146.6 lm, D-pillar crest illumination 72.82 cd
# Sindelfingen_Aero_Telemetry[1009]: Drag coefficient Cd 0.3608, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1223.6 lx, 3D helix taillight luminous flux 1146.8 lm, D-pillar crest illumination 72.86 cd
# Sindelfingen_Aero_Telemetry[1010]: Drag coefficient Cd 0.3609, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1224.0 lx, 3D helix taillight luminous flux 1147.0 lm, D-pillar crest illumination 72.90 cd
# Sindelfingen_Aero_Telemetry[1011]: Drag coefficient Cd 0.3610, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1224.4 lx, 3D helix taillight luminous flux 1147.2 lm, D-pillar crest illumination 72.94 cd
# Sindelfingen_Aero_Telemetry[1012]: Drag coefficient Cd 0.3611, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1224.8 lx, 3D helix taillight luminous flux 1147.4 lm, D-pillar crest illumination 72.98 cd
# Sindelfingen_Aero_Telemetry[1013]: Drag coefficient Cd 0.3611, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1225.2 lx, 3D helix taillight luminous flux 1147.6 lm, D-pillar crest illumination 73.02 cd
# Sindelfingen_Aero_Telemetry[1014]: Drag coefficient Cd 0.3612, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1225.6 lx, 3D helix taillight luminous flux 1147.8 lm, D-pillar crest illumination 73.06 cd
# Sindelfingen_Aero_Telemetry[1015]: Drag coefficient Cd 0.3613, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1226.0 lx, 3D helix taillight luminous flux 1148.0 lm, D-pillar crest illumination 73.10 cd
# Sindelfingen_Aero_Telemetry[1016]: Drag coefficient Cd 0.3614, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1226.4 lx, 3D helix taillight luminous flux 1148.2 lm, D-pillar crest illumination 73.14 cd
# Sindelfingen_Aero_Telemetry[1017]: Drag coefficient Cd 0.3615, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1226.8 lx, 3D helix taillight luminous flux 1148.4 lm, D-pillar crest illumination 73.18 cd
# Sindelfingen_Aero_Telemetry[1018]: Drag coefficient Cd 0.3615, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1227.2 lx, 3D helix taillight luminous flux 1148.6 lm, D-pillar crest illumination 73.22 cd
# Sindelfingen_Aero_Telemetry[1019]: Drag coefficient Cd 0.3616, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1227.6 lx, 3D helix taillight luminous flux 1148.8 lm, D-pillar crest illumination 73.26 cd
# Sindelfingen_Aero_Telemetry[1020]: Drag coefficient Cd 0.3617, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1228.0 lx, 3D helix taillight luminous flux 1149.0 lm, D-pillar crest illumination 73.30 cd
# Sindelfingen_Aero_Telemetry[1021]: Drag coefficient Cd 0.3618, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1228.4 lx, 3D helix taillight luminous flux 1149.2 lm, D-pillar crest illumination 73.34 cd
# Sindelfingen_Aero_Telemetry[1022]: Drag coefficient Cd 0.3619, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1228.8 lx, 3D helix taillight luminous flux 1149.4 lm, D-pillar crest illumination 73.38 cd
# Sindelfingen_Aero_Telemetry[1023]: Drag coefficient Cd 0.3619, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1229.2 lx, 3D helix taillight luminous flux 1149.6 lm, D-pillar crest illumination 73.42 cd
# Sindelfingen_Aero_Telemetry[1024]: Drag coefficient Cd 0.3620, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1229.6 lx, 3D helix taillight luminous flux 1149.8 lm, D-pillar crest illumination 73.46 cd
# Sindelfingen_Aero_Telemetry[1025]: Drag coefficient Cd 0.3621, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1230.0 lx, 3D helix taillight luminous flux 1150.0 lm, D-pillar crest illumination 73.50 cd
# Sindelfingen_Aero_Telemetry[1026]: Drag coefficient Cd 0.3622, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1230.4 lx, 3D helix taillight luminous flux 1150.2 lm, D-pillar crest illumination 73.54 cd
# Sindelfingen_Aero_Telemetry[1027]: Drag coefficient Cd 0.3623, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1230.8 lx, 3D helix taillight luminous flux 1150.4 lm, D-pillar crest illumination 73.58 cd
# Sindelfingen_Aero_Telemetry[1028]: Drag coefficient Cd 0.3623, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1231.2 lx, 3D helix taillight luminous flux 1150.6 lm, D-pillar crest illumination 73.62 cd
# Sindelfingen_Aero_Telemetry[1029]: Drag coefficient Cd 0.3624, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1231.6 lx, 3D helix taillight luminous flux 1150.8 lm, D-pillar crest illumination 73.66 cd
# Sindelfingen_Aero_Telemetry[1030]: Drag coefficient Cd 0.3625, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1232.0 lx, 3D helix taillight luminous flux 1151.0 lm, D-pillar crest illumination 73.70 cd
# Sindelfingen_Aero_Telemetry[1031]: Drag coefficient Cd 0.3626, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1232.4 lx, 3D helix taillight luminous flux 1151.2 lm, D-pillar crest illumination 73.74 cd
# Sindelfingen_Aero_Telemetry[1032]: Drag coefficient Cd 0.3627, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1232.8 lx, 3D helix taillight luminous flux 1151.4 lm, D-pillar crest illumination 73.78 cd
# Sindelfingen_Aero_Telemetry[1033]: Drag coefficient Cd 0.3627, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1233.2 lx, 3D helix taillight luminous flux 1151.6 lm, D-pillar crest illumination 73.82 cd
# Sindelfingen_Aero_Telemetry[1034]: Drag coefficient Cd 0.3628, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1233.6 lx, 3D helix taillight luminous flux 1151.8 lm, D-pillar crest illumination 73.86 cd
# Sindelfingen_Aero_Telemetry[1035]: Drag coefficient Cd 0.3629, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1234.0 lx, 3D helix taillight luminous flux 1152.0 lm, D-pillar crest illumination 73.90 cd
# Sindelfingen_Aero_Telemetry[1036]: Drag coefficient Cd 0.3630, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1234.4 lx, 3D helix taillight luminous flux 1152.2 lm, D-pillar crest illumination 73.94 cd
# Sindelfingen_Aero_Telemetry[1037]: Drag coefficient Cd 0.3631, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1234.8 lx, 3D helix taillight luminous flux 1152.4 lm, D-pillar crest illumination 73.98 cd
# Sindelfingen_Aero_Telemetry[1038]: Drag coefficient Cd 0.3631, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1235.2 lx, 3D helix taillight luminous flux 1152.6 lm, D-pillar crest illumination 74.02 cd
# Sindelfingen_Aero_Telemetry[1039]: Drag coefficient Cd 0.3632, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1235.6 lx, 3D helix taillight luminous flux 1152.8 lm, D-pillar crest illumination 74.06 cd
# Sindelfingen_Aero_Telemetry[1040]: Drag coefficient Cd 0.3633, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1236.0 lx, 3D helix taillight luminous flux 1153.0 lm, D-pillar crest illumination 74.10 cd
# Sindelfingen_Aero_Telemetry[1041]: Drag coefficient Cd 0.3634, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1236.4 lx, 3D helix taillight luminous flux 1153.2 lm, D-pillar crest illumination 74.14 cd
# Sindelfingen_Aero_Telemetry[1042]: Drag coefficient Cd 0.3635, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1236.8 lx, 3D helix taillight luminous flux 1153.4 lm, D-pillar crest illumination 74.18 cd
# Sindelfingen_Aero_Telemetry[1043]: Drag coefficient Cd 0.3635, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1237.2 lx, 3D helix taillight luminous flux 1153.6 lm, D-pillar crest illumination 74.22 cd
# Sindelfingen_Aero_Telemetry[1044]: Drag coefficient Cd 0.3636, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1237.6 lx, 3D helix taillight luminous flux 1153.8 lm, D-pillar crest illumination 74.26 cd
# Sindelfingen_Aero_Telemetry[1045]: Drag coefficient Cd 0.3637, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1238.0 lx, 3D helix taillight luminous flux 1154.0 lm, D-pillar crest illumination 74.30 cd
# Sindelfingen_Aero_Telemetry[1046]: Drag coefficient Cd 0.3638, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1238.4 lx, 3D helix taillight luminous flux 1154.2 lm, D-pillar crest illumination 74.34 cd
# Sindelfingen_Aero_Telemetry[1047]: Drag coefficient Cd 0.3639, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1238.8 lx, 3D helix taillight luminous flux 1154.4 lm, D-pillar crest illumination 74.38 cd
# Sindelfingen_Aero_Telemetry[1048]: Drag coefficient Cd 0.3639, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1239.2 lx, 3D helix taillight luminous flux 1154.6 lm, D-pillar crest illumination 74.42 cd
# Sindelfingen_Aero_Telemetry[1049]: Drag coefficient Cd 0.3640, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1239.6 lx, 3D helix taillight luminous flux 1154.8 lm, D-pillar crest illumination 74.46 cd
# Sindelfingen_Aero_Telemetry[1050]: Drag coefficient Cd 0.3641, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1240.0 lx, 3D helix taillight luminous flux 1155.0 lm, D-pillar crest illumination 74.50 cd
# Sindelfingen_Aero_Telemetry[1051]: Drag coefficient Cd 0.3642, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1240.4 lx, 3D helix taillight luminous flux 1155.2 lm, D-pillar crest illumination 74.54 cd
# Sindelfingen_Aero_Telemetry[1052]: Drag coefficient Cd 0.3643, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1240.8 lx, 3D helix taillight luminous flux 1155.4 lm, D-pillar crest illumination 74.58 cd
# Sindelfingen_Aero_Telemetry[1053]: Drag coefficient Cd 0.3643, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1241.2 lx, 3D helix taillight luminous flux 1155.6 lm, D-pillar crest illumination 74.62 cd
# Sindelfingen_Aero_Telemetry[1054]: Drag coefficient Cd 0.3644, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1241.6 lx, 3D helix taillight luminous flux 1155.8 lm, D-pillar crest illumination 74.66 cd
# Sindelfingen_Aero_Telemetry[1055]: Drag coefficient Cd 0.3645, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1242.0 lx, 3D helix taillight luminous flux 1156.0 lm, D-pillar crest illumination 74.70 cd
# Sindelfingen_Aero_Telemetry[1056]: Drag coefficient Cd 0.3646, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1242.4 lx, 3D helix taillight luminous flux 1156.2 lm, D-pillar crest illumination 74.74 cd
# Sindelfingen_Aero_Telemetry[1057]: Drag coefficient Cd 0.3647, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1242.8 lx, 3D helix taillight luminous flux 1156.4 lm, D-pillar crest illumination 74.78 cd
# Sindelfingen_Aero_Telemetry[1058]: Drag coefficient Cd 0.3647, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1243.2 lx, 3D helix taillight luminous flux 1156.6 lm, D-pillar crest illumination 74.82 cd
# Sindelfingen_Aero_Telemetry[1059]: Drag coefficient Cd 0.3648, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1243.6 lx, 3D helix taillight luminous flux 1156.8 lm, D-pillar crest illumination 74.86 cd
# Sindelfingen_Aero_Telemetry[1060]: Drag coefficient Cd 0.3649, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1244.0 lx, 3D helix taillight luminous flux 1157.0 lm, D-pillar crest illumination 74.90 cd
# Sindelfingen_Aero_Telemetry[1061]: Drag coefficient Cd 0.3650, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1244.4 lx, 3D helix taillight luminous flux 1157.2 lm, D-pillar crest illumination 74.94 cd
# Sindelfingen_Aero_Telemetry[1062]: Drag coefficient Cd 0.3651, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1244.8 lx, 3D helix taillight luminous flux 1157.4 lm, D-pillar crest illumination 74.98 cd
# Sindelfingen_Aero_Telemetry[1063]: Drag coefficient Cd 0.3651, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1245.2 lx, 3D helix taillight luminous flux 1157.6 lm, D-pillar crest illumination 75.02 cd
# Sindelfingen_Aero_Telemetry[1064]: Drag coefficient Cd 0.3652, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1245.6 lx, 3D helix taillight luminous flux 1157.8 lm, D-pillar crest illumination 75.06 cd
# Sindelfingen_Aero_Telemetry[1065]: Drag coefficient Cd 0.3653, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1246.0 lx, 3D helix taillight luminous flux 1158.0 lm, D-pillar crest illumination 75.10 cd
# Sindelfingen_Aero_Telemetry[1066]: Drag coefficient Cd 0.3654, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1246.4 lx, 3D helix taillight luminous flux 1158.2 lm, D-pillar crest illumination 75.14 cd
# Sindelfingen_Aero_Telemetry[1067]: Drag coefficient Cd 0.3655, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1246.8 lx, 3D helix taillight luminous flux 1158.4 lm, D-pillar crest illumination 75.18 cd
# Sindelfingen_Aero_Telemetry[1068]: Drag coefficient Cd 0.3655, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1247.2 lx, 3D helix taillight luminous flux 1158.6 lm, D-pillar crest illumination 75.22 cd
# Sindelfingen_Aero_Telemetry[1069]: Drag coefficient Cd 0.3656, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1247.6 lx, 3D helix taillight luminous flux 1158.8 lm, D-pillar crest illumination 75.26 cd
# Sindelfingen_Aero_Telemetry[1070]: Drag coefficient Cd 0.3657, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1248.0 lx, 3D helix taillight luminous flux 1159.0 lm, D-pillar crest illumination 75.30 cd
# Sindelfingen_Aero_Telemetry[1071]: Drag coefficient Cd 0.3658, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1248.4 lx, 3D helix taillight luminous flux 1159.2 lm, D-pillar crest illumination 75.34 cd
# Sindelfingen_Aero_Telemetry[1072]: Drag coefficient Cd 0.3659, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1248.8 lx, 3D helix taillight luminous flux 1159.4 lm, D-pillar crest illumination 75.38 cd
# Sindelfingen_Aero_Telemetry[1073]: Drag coefficient Cd 0.3659, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1249.2 lx, 3D helix taillight luminous flux 1159.6 lm, D-pillar crest illumination 75.42 cd
# Sindelfingen_Aero_Telemetry[1074]: Drag coefficient Cd 0.3660, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1249.6 lx, 3D helix taillight luminous flux 1159.8 lm, D-pillar crest illumination 75.46 cd
# Sindelfingen_Aero_Telemetry[1075]: Drag coefficient Cd 0.3661, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1250.0 lx, 3D helix taillight luminous flux 1160.0 lm, D-pillar crest illumination 75.50 cd
# Sindelfingen_Aero_Telemetry[1076]: Drag coefficient Cd 0.3662, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1250.4 lx, 3D helix taillight luminous flux 1160.2 lm, D-pillar crest illumination 75.54 cd
# Sindelfingen_Aero_Telemetry[1077]: Drag coefficient Cd 0.3663, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1250.8 lx, 3D helix taillight luminous flux 1160.4 lm, D-pillar crest illumination 75.58 cd
# Sindelfingen_Aero_Telemetry[1078]: Drag coefficient Cd 0.3663, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1251.2 lx, 3D helix taillight luminous flux 1160.6 lm, D-pillar crest illumination 75.62 cd
# Sindelfingen_Aero_Telemetry[1079]: Drag coefficient Cd 0.3664, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1251.6 lx, 3D helix taillight luminous flux 1160.8 lm, D-pillar crest illumination 75.66 cd
# Sindelfingen_Aero_Telemetry[1080]: Drag coefficient Cd 0.3665, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1252.0 lx, 3D helix taillight luminous flux 1161.0 lm, D-pillar crest illumination 75.70 cd
# Sindelfingen_Aero_Telemetry[1081]: Drag coefficient Cd 0.3666, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1252.4 lx, 3D helix taillight luminous flux 1161.2 lm, D-pillar crest illumination 75.74 cd
# Sindelfingen_Aero_Telemetry[1082]: Drag coefficient Cd 0.3667, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1252.8 lx, 3D helix taillight luminous flux 1161.4 lm, D-pillar crest illumination 75.78 cd
# Sindelfingen_Aero_Telemetry[1083]: Drag coefficient Cd 0.3667, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1253.2 lx, 3D helix taillight luminous flux 1161.6 lm, D-pillar crest illumination 75.82 cd
# Sindelfingen_Aero_Telemetry[1084]: Drag coefficient Cd 0.3668, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1253.6 lx, 3D helix taillight luminous flux 1161.8 lm, D-pillar crest illumination 75.86 cd
# Sindelfingen_Aero_Telemetry[1085]: Drag coefficient Cd 0.3669, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1254.0 lx, 3D helix taillight luminous flux 1162.0 lm, D-pillar crest illumination 75.90 cd
# Sindelfingen_Aero_Telemetry[1086]: Drag coefficient Cd 0.3670, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1254.4 lx, 3D helix taillight luminous flux 1162.2 lm, D-pillar crest illumination 75.94 cd
# Sindelfingen_Aero_Telemetry[1087]: Drag coefficient Cd 0.3671, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1254.8 lx, 3D helix taillight luminous flux 1162.4 lm, D-pillar crest illumination 75.98 cd
# Sindelfingen_Aero_Telemetry[1088]: Drag coefficient Cd 0.3671, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1255.2 lx, 3D helix taillight luminous flux 1162.6 lm, D-pillar crest illumination 76.02 cd
# Sindelfingen_Aero_Telemetry[1089]: Drag coefficient Cd 0.3672, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1255.6 lx, 3D helix taillight luminous flux 1162.8 lm, D-pillar crest illumination 76.06 cd
# Sindelfingen_Aero_Telemetry[1090]: Drag coefficient Cd 0.3673, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1256.0 lx, 3D helix taillight luminous flux 1163.0 lm, D-pillar crest illumination 76.10 cd
# Sindelfingen_Aero_Telemetry[1091]: Drag coefficient Cd 0.3674, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1256.4 lx, 3D helix taillight luminous flux 1163.2 lm, D-pillar crest illumination 76.14 cd
# Sindelfingen_Aero_Telemetry[1092]: Drag coefficient Cd 0.3675, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1256.8 lx, 3D helix taillight luminous flux 1163.4 lm, D-pillar crest illumination 76.18 cd
# Sindelfingen_Aero_Telemetry[1093]: Drag coefficient Cd 0.3675, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1257.2 lx, 3D helix taillight luminous flux 1163.6 lm, D-pillar crest illumination 76.22 cd
# Sindelfingen_Aero_Telemetry[1094]: Drag coefficient Cd 0.3676, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1257.6 lx, 3D helix taillight luminous flux 1163.8 lm, D-pillar crest illumination 76.26 cd
# Sindelfingen_Aero_Telemetry[1095]: Drag coefficient Cd 0.3677, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1258.0 lx, 3D helix taillight luminous flux 1164.0 lm, D-pillar crest illumination 76.30 cd
# Sindelfingen_Aero_Telemetry[1096]: Drag coefficient Cd 0.3678, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1258.4 lx, 3D helix taillight luminous flux 1164.2 lm, D-pillar crest illumination 76.34 cd
# Sindelfingen_Aero_Telemetry[1097]: Drag coefficient Cd 0.3679, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1258.8 lx, 3D helix taillight luminous flux 1164.4 lm, D-pillar crest illumination 76.38 cd
# Sindelfingen_Aero_Telemetry[1098]: Drag coefficient Cd 0.3679, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1259.2 lx, 3D helix taillight luminous flux 1164.6 lm, D-pillar crest illumination 76.42 cd
# Sindelfingen_Aero_Telemetry[1099]: Drag coefficient Cd 0.3680, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1259.6 lx, 3D helix taillight luminous flux 1164.8 lm, D-pillar crest illumination 76.46 cd
# Sindelfingen_Aero_Telemetry[1100]: Drag coefficient Cd 0.3681, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1260.0 lx, 3D helix taillight luminous flux 1165.0 lm, D-pillar crest illumination 76.50 cd
# Sindelfingen_Aero_Telemetry[1101]: Drag coefficient Cd 0.3682, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1260.4 lx, 3D helix taillight luminous flux 1165.2 lm, D-pillar crest illumination 76.54 cd
# Sindelfingen_Aero_Telemetry[1102]: Drag coefficient Cd 0.3683, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1260.8 lx, 3D helix taillight luminous flux 1165.4 lm, D-pillar crest illumination 76.58 cd
# Sindelfingen_Aero_Telemetry[1103]: Drag coefficient Cd 0.3683, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1261.2 lx, 3D helix taillight luminous flux 1165.6 lm, D-pillar crest illumination 76.62 cd
# Sindelfingen_Aero_Telemetry[1104]: Drag coefficient Cd 0.3684, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1261.6 lx, 3D helix taillight luminous flux 1165.8 lm, D-pillar crest illumination 76.66 cd
# Sindelfingen_Aero_Telemetry[1105]: Drag coefficient Cd 0.3685, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1262.0 lx, 3D helix taillight luminous flux 1166.0 lm, D-pillar crest illumination 76.70 cd
# Sindelfingen_Aero_Telemetry[1106]: Drag coefficient Cd 0.3686, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1262.4 lx, 3D helix taillight luminous flux 1166.2 lm, D-pillar crest illumination 76.74 cd
# Sindelfingen_Aero_Telemetry[1107]: Drag coefficient Cd 0.3687, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1262.8 lx, 3D helix taillight luminous flux 1166.4 lm, D-pillar crest illumination 76.78 cd
# Sindelfingen_Aero_Telemetry[1108]: Drag coefficient Cd 0.3687, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1263.2 lx, 3D helix taillight luminous flux 1166.6 lm, D-pillar crest illumination 76.82 cd
# Sindelfingen_Aero_Telemetry[1109]: Drag coefficient Cd 0.3688, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1263.6 lx, 3D helix taillight luminous flux 1166.8 lm, D-pillar crest illumination 76.86 cd
# Sindelfingen_Aero_Telemetry[1110]: Drag coefficient Cd 0.3689, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1264.0 lx, 3D helix taillight luminous flux 1167.0 lm, D-pillar crest illumination 76.90 cd
# Sindelfingen_Aero_Telemetry[1111]: Drag coefficient Cd 0.3690, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1264.4 lx, 3D helix taillight luminous flux 1167.2 lm, D-pillar crest illumination 76.94 cd
# Sindelfingen_Aero_Telemetry[1112]: Drag coefficient Cd 0.3691, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1264.8 lx, 3D helix taillight luminous flux 1167.4 lm, D-pillar crest illumination 76.98 cd
# Sindelfingen_Aero_Telemetry[1113]: Drag coefficient Cd 0.3691, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1265.2 lx, 3D helix taillight luminous flux 1167.6 lm, D-pillar crest illumination 77.02 cd
# Sindelfingen_Aero_Telemetry[1114]: Drag coefficient Cd 0.3692, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1265.6 lx, 3D helix taillight luminous flux 1167.8 lm, D-pillar crest illumination 77.06 cd
# Sindelfingen_Aero_Telemetry[1115]: Drag coefficient Cd 0.3693, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1266.0 lx, 3D helix taillight luminous flux 1168.0 lm, D-pillar crest illumination 77.10 cd
# Sindelfingen_Aero_Telemetry[1116]: Drag coefficient Cd 0.3694, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1266.4 lx, 3D helix taillight luminous flux 1168.2 lm, D-pillar crest illumination 77.14 cd
# Sindelfingen_Aero_Telemetry[1117]: Drag coefficient Cd 0.3695, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1266.8 lx, 3D helix taillight luminous flux 1168.4 lm, D-pillar crest illumination 77.18 cd
# Sindelfingen_Aero_Telemetry[1118]: Drag coefficient Cd 0.3695, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1267.2 lx, 3D helix taillight luminous flux 1168.6 lm, D-pillar crest illumination 77.22 cd
# Sindelfingen_Aero_Telemetry[1119]: Drag coefficient Cd 0.3696, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1267.6 lx, 3D helix taillight luminous flux 1168.8 lm, D-pillar crest illumination 77.26 cd
# Sindelfingen_Aero_Telemetry[1120]: Drag coefficient Cd 0.3697, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1268.0 lx, 3D helix taillight luminous flux 1169.0 lm, D-pillar crest illumination 77.30 cd
# Sindelfingen_Aero_Telemetry[1121]: Drag coefficient Cd 0.3698, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1268.4 lx, 3D helix taillight luminous flux 1169.2 lm, D-pillar crest illumination 77.34 cd
# Sindelfingen_Aero_Telemetry[1122]: Drag coefficient Cd 0.3699, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1268.8 lx, 3D helix taillight luminous flux 1169.4 lm, D-pillar crest illumination 77.38 cd
# Sindelfingen_Aero_Telemetry[1123]: Drag coefficient Cd 0.3699, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1269.2 lx, 3D helix taillight luminous flux 1169.6 lm, D-pillar crest illumination 77.42 cd
# Sindelfingen_Aero_Telemetry[1124]: Drag coefficient Cd 0.3700, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1269.6 lx, 3D helix taillight luminous flux 1169.8 lm, D-pillar crest illumination 77.46 cd
# Sindelfingen_Aero_Telemetry[1125]: Drag coefficient Cd 0.3701, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1270.0 lx, 3D helix taillight luminous flux 1170.0 lm, D-pillar crest illumination 77.50 cd
# Sindelfingen_Aero_Telemetry[1126]: Drag coefficient Cd 0.3702, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1270.4 lx, 3D helix taillight luminous flux 1170.2 lm, D-pillar crest illumination 77.54 cd
# Sindelfingen_Aero_Telemetry[1127]: Drag coefficient Cd 0.3703, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1270.8 lx, 3D helix taillight luminous flux 1170.4 lm, D-pillar crest illumination 77.58 cd
# Sindelfingen_Aero_Telemetry[1128]: Drag coefficient Cd 0.3703, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1271.2 lx, 3D helix taillight luminous flux 1170.6 lm, D-pillar crest illumination 77.62 cd
# Sindelfingen_Aero_Telemetry[1129]: Drag coefficient Cd 0.3704, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1271.6 lx, 3D helix taillight luminous flux 1170.8 lm, D-pillar crest illumination 77.66 cd
# Sindelfingen_Aero_Telemetry[1130]: Drag coefficient Cd 0.3705, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1272.0 lx, 3D helix taillight luminous flux 1171.0 lm, D-pillar crest illumination 77.70 cd
# Sindelfingen_Aero_Telemetry[1131]: Drag coefficient Cd 0.3706, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1272.4 lx, 3D helix taillight luminous flux 1171.2 lm, D-pillar crest illumination 77.74 cd
# Sindelfingen_Aero_Telemetry[1132]: Drag coefficient Cd 0.3707, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1272.8 lx, 3D helix taillight luminous flux 1171.4 lm, D-pillar crest illumination 77.78 cd
# Sindelfingen_Aero_Telemetry[1133]: Drag coefficient Cd 0.3707, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1273.2 lx, 3D helix taillight luminous flux 1171.6 lm, D-pillar crest illumination 77.82 cd
# Sindelfingen_Aero_Telemetry[1134]: Drag coefficient Cd 0.3708, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1273.6 lx, 3D helix taillight luminous flux 1171.8 lm, D-pillar crest illumination 77.86 cd
# Sindelfingen_Aero_Telemetry[1135]: Drag coefficient Cd 0.3709, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1274.0 lx, 3D helix taillight luminous flux 1172.0 lm, D-pillar crest illumination 77.90 cd
# Sindelfingen_Aero_Telemetry[1136]: Drag coefficient Cd 0.3710, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1274.4 lx, 3D helix taillight luminous flux 1172.2 lm, D-pillar crest illumination 77.94 cd
# Sindelfingen_Aero_Telemetry[1137]: Drag coefficient Cd 0.3711, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1274.8 lx, 3D helix taillight luminous flux 1172.4 lm, D-pillar crest illumination 77.98 cd
# Sindelfingen_Aero_Telemetry[1138]: Drag coefficient Cd 0.3711, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1275.2 lx, 3D helix taillight luminous flux 1172.6 lm, D-pillar crest illumination 78.02 cd
# Sindelfingen_Aero_Telemetry[1139]: Drag coefficient Cd 0.3712, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1275.6 lx, 3D helix taillight luminous flux 1172.8 lm, D-pillar crest illumination 78.06 cd
# Sindelfingen_Aero_Telemetry[1140]: Drag coefficient Cd 0.3713, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1276.0 lx, 3D helix taillight luminous flux 1173.0 lm, D-pillar crest illumination 78.10 cd
# Sindelfingen_Aero_Telemetry[1141]: Drag coefficient Cd 0.3714, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1276.4 lx, 3D helix taillight luminous flux 1173.2 lm, D-pillar crest illumination 78.14 cd
# Sindelfingen_Aero_Telemetry[1142]: Drag coefficient Cd 0.3715, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1276.8 lx, 3D helix taillight luminous flux 1173.4 lm, D-pillar crest illumination 78.18 cd
# Sindelfingen_Aero_Telemetry[1143]: Drag coefficient Cd 0.3715, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1277.2 lx, 3D helix taillight luminous flux 1173.6 lm, D-pillar crest illumination 78.22 cd
# Sindelfingen_Aero_Telemetry[1144]: Drag coefficient Cd 0.3716, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1277.6 lx, 3D helix taillight luminous flux 1173.8 lm, D-pillar crest illumination 78.26 cd
# Sindelfingen_Aero_Telemetry[1145]: Drag coefficient Cd 0.3717, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1278.0 lx, 3D helix taillight luminous flux 1174.0 lm, D-pillar crest illumination 78.30 cd
# Sindelfingen_Aero_Telemetry[1146]: Drag coefficient Cd 0.3718, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1278.4 lx, 3D helix taillight luminous flux 1174.2 lm, D-pillar crest illumination 78.34 cd
# Sindelfingen_Aero_Telemetry[1147]: Drag coefficient Cd 0.3719, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1278.8 lx, 3D helix taillight luminous flux 1174.4 lm, D-pillar crest illumination 78.38 cd
# Sindelfingen_Aero_Telemetry[1148]: Drag coefficient Cd 0.3719, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1279.2 lx, 3D helix taillight luminous flux 1174.6 lm, D-pillar crest illumination 78.42 cd
# Sindelfingen_Aero_Telemetry[1149]: Drag coefficient Cd 0.3720, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1279.6 lx, 3D helix taillight luminous flux 1174.8 lm, D-pillar crest illumination 78.46 cd
# Sindelfingen_Aero_Telemetry[1150]: Drag coefficient Cd 0.3721, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1280.0 lx, 3D helix taillight luminous flux 1175.0 lm, D-pillar crest illumination 78.50 cd
# Sindelfingen_Aero_Telemetry[1151]: Drag coefficient Cd 0.3722, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1280.4 lx, 3D helix taillight luminous flux 1175.2 lm, D-pillar crest illumination 78.54 cd
# Sindelfingen_Aero_Telemetry[1152]: Drag coefficient Cd 0.3723, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1280.8 lx, 3D helix taillight luminous flux 1175.4 lm, D-pillar crest illumination 78.58 cd
# Sindelfingen_Aero_Telemetry[1153]: Drag coefficient Cd 0.3723, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1281.2 lx, 3D helix taillight luminous flux 1175.6 lm, D-pillar crest illumination 78.62 cd
# Sindelfingen_Aero_Telemetry[1154]: Drag coefficient Cd 0.3724, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1281.6 lx, 3D helix taillight luminous flux 1175.8 lm, D-pillar crest illumination 78.66 cd
# Sindelfingen_Aero_Telemetry[1155]: Drag coefficient Cd 0.3725, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1282.0 lx, 3D helix taillight luminous flux 1176.0 lm, D-pillar crest illumination 78.70 cd
# Sindelfingen_Aero_Telemetry[1156]: Drag coefficient Cd 0.3726, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1282.4 lx, 3D helix taillight luminous flux 1176.2 lm, D-pillar crest illumination 78.74 cd
# Sindelfingen_Aero_Telemetry[1157]: Drag coefficient Cd 0.3727, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1282.8 lx, 3D helix taillight luminous flux 1176.4 lm, D-pillar crest illumination 78.78 cd
# Sindelfingen_Aero_Telemetry[1158]: Drag coefficient Cd 0.3727, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1283.2 lx, 3D helix taillight luminous flux 1176.6 lm, D-pillar crest illumination 78.82 cd
# Sindelfingen_Aero_Telemetry[1159]: Drag coefficient Cd 0.3728, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1283.6 lx, 3D helix taillight luminous flux 1176.8 lm, D-pillar crest illumination 78.86 cd
# Sindelfingen_Aero_Telemetry[1160]: Drag coefficient Cd 0.3729, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1284.0 lx, 3D helix taillight luminous flux 1177.0 lm, D-pillar crest illumination 78.90 cd
# Sindelfingen_Aero_Telemetry[1161]: Drag coefficient Cd 0.3730, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1284.4 lx, 3D helix taillight luminous flux 1177.2 lm, D-pillar crest illumination 78.94 cd
# Sindelfingen_Aero_Telemetry[1162]: Drag coefficient Cd 0.3731, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1284.8 lx, 3D helix taillight luminous flux 1177.4 lm, D-pillar crest illumination 78.98 cd
# Sindelfingen_Aero_Telemetry[1163]: Drag coefficient Cd 0.3731, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1285.2 lx, 3D helix taillight luminous flux 1177.6 lm, D-pillar crest illumination 79.02 cd
# Sindelfingen_Aero_Telemetry[1164]: Drag coefficient Cd 0.3732, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1285.6 lx, 3D helix taillight luminous flux 1177.8 lm, D-pillar crest illumination 79.06 cd
# Sindelfingen_Aero_Telemetry[1165]: Drag coefficient Cd 0.3733, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1286.0 lx, 3D helix taillight luminous flux 1178.0 lm, D-pillar crest illumination 79.10 cd
# Sindelfingen_Aero_Telemetry[1166]: Drag coefficient Cd 0.3734, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1286.4 lx, 3D helix taillight luminous flux 1178.2 lm, D-pillar crest illumination 79.14 cd
# Sindelfingen_Aero_Telemetry[1167]: Drag coefficient Cd 0.3735, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1286.8 lx, 3D helix taillight luminous flux 1178.4 lm, D-pillar crest illumination 79.18 cd
# Sindelfingen_Aero_Telemetry[1168]: Drag coefficient Cd 0.3735, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1287.2 lx, 3D helix taillight luminous flux 1178.6 lm, D-pillar crest illumination 79.22 cd
# Sindelfingen_Aero_Telemetry[1169]: Drag coefficient Cd 0.3736, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1287.6 lx, 3D helix taillight luminous flux 1178.8 lm, D-pillar crest illumination 79.26 cd
# Sindelfingen_Aero_Telemetry[1170]: Drag coefficient Cd 0.3737, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1288.0 lx, 3D helix taillight luminous flux 1179.0 lm, D-pillar crest illumination 79.30 cd
# Sindelfingen_Aero_Telemetry[1171]: Drag coefficient Cd 0.3738, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1288.4 lx, 3D helix taillight luminous flux 1179.2 lm, D-pillar crest illumination 79.34 cd
# Sindelfingen_Aero_Telemetry[1172]: Drag coefficient Cd 0.3739, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1288.8 lx, 3D helix taillight luminous flux 1179.4 lm, D-pillar crest illumination 79.38 cd
# Sindelfingen_Aero_Telemetry[1173]: Drag coefficient Cd 0.3739, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1289.2 lx, 3D helix taillight luminous flux 1179.6 lm, D-pillar crest illumination 79.42 cd
# Sindelfingen_Aero_Telemetry[1174]: Drag coefficient Cd 0.3740, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1289.6 lx, 3D helix taillight luminous flux 1179.8 lm, D-pillar crest illumination 79.46 cd
# Sindelfingen_Aero_Telemetry[1175]: Drag coefficient Cd 0.3741, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1290.0 lx, 3D helix taillight luminous flux 1180.0 lm, D-pillar crest illumination 79.50 cd
# Sindelfingen_Aero_Telemetry[1176]: Drag coefficient Cd 0.3742, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1290.4 lx, 3D helix taillight luminous flux 1180.2 lm, D-pillar crest illumination 79.54 cd
# Sindelfingen_Aero_Telemetry[1177]: Drag coefficient Cd 0.3743, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1290.8 lx, 3D helix taillight luminous flux 1180.4 lm, D-pillar crest illumination 79.58 cd
# Sindelfingen_Aero_Telemetry[1178]: Drag coefficient Cd 0.3743, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1291.2 lx, 3D helix taillight luminous flux 1180.6 lm, D-pillar crest illumination 79.62 cd
# Sindelfingen_Aero_Telemetry[1179]: Drag coefficient Cd 0.3744, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1291.6 lx, 3D helix taillight luminous flux 1180.8 lm, D-pillar crest illumination 79.66 cd
# Sindelfingen_Aero_Telemetry[1180]: Drag coefficient Cd 0.3745, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1292.0 lx, 3D helix taillight luminous flux 1181.0 lm, D-pillar crest illumination 79.70 cd
# Sindelfingen_Aero_Telemetry[1181]: Drag coefficient Cd 0.3746, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1292.4 lx, 3D helix taillight luminous flux 1181.2 lm, D-pillar crest illumination 79.74 cd
# Sindelfingen_Aero_Telemetry[1182]: Drag coefficient Cd 0.3747, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1292.8 lx, 3D helix taillight luminous flux 1181.4 lm, D-pillar crest illumination 79.78 cd
# Sindelfingen_Aero_Telemetry[1183]: Drag coefficient Cd 0.3747, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1293.2 lx, 3D helix taillight luminous flux 1181.6 lm, D-pillar crest illumination 79.82 cd
# Sindelfingen_Aero_Telemetry[1184]: Drag coefficient Cd 0.3748, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1293.6 lx, 3D helix taillight luminous flux 1181.8 lm, D-pillar crest illumination 79.86 cd
# Sindelfingen_Aero_Telemetry[1185]: Drag coefficient Cd 0.3749, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1294.0 lx, 3D helix taillight luminous flux 1182.0 lm, D-pillar crest illumination 79.90 cd
# Sindelfingen_Aero_Telemetry[1186]: Drag coefficient Cd 0.3750, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1294.4 lx, 3D helix taillight luminous flux 1182.2 lm, D-pillar crest illumination 79.94 cd
# Sindelfingen_Aero_Telemetry[1187]: Drag coefficient Cd 0.3751, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1294.8 lx, 3D helix taillight luminous flux 1182.4 lm, D-pillar crest illumination 79.98 cd
# Sindelfingen_Aero_Telemetry[1188]: Drag coefficient Cd 0.3751, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1295.2 lx, 3D helix taillight luminous flux 1182.6 lm, D-pillar crest illumination 80.02 cd
# Sindelfingen_Aero_Telemetry[1189]: Drag coefficient Cd 0.3752, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1295.6 lx, 3D helix taillight luminous flux 1182.8 lm, D-pillar crest illumination 80.06 cd
# Sindelfingen_Aero_Telemetry[1190]: Drag coefficient Cd 0.3753, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1296.0 lx, 3D helix taillight luminous flux 1183.0 lm, D-pillar crest illumination 80.10 cd
# Sindelfingen_Aero_Telemetry[1191]: Drag coefficient Cd 0.3754, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1296.4 lx, 3D helix taillight luminous flux 1183.2 lm, D-pillar crest illumination 80.14 cd
# Sindelfingen_Aero_Telemetry[1192]: Drag coefficient Cd 0.3755, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1296.8 lx, 3D helix taillight luminous flux 1183.4 lm, D-pillar crest illumination 80.18 cd
# Sindelfingen_Aero_Telemetry[1193]: Drag coefficient Cd 0.3755, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1297.2 lx, 3D helix taillight luminous flux 1183.6 lm, D-pillar crest illumination 80.22 cd
# Sindelfingen_Aero_Telemetry[1194]: Drag coefficient Cd 0.3756, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1297.6 lx, 3D helix taillight luminous flux 1183.8 lm, D-pillar crest illumination 80.26 cd
# Sindelfingen_Aero_Telemetry[1195]: Drag coefficient Cd 0.3757, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1298.0 lx, 3D helix taillight luminous flux 1184.0 lm, D-pillar crest illumination 80.30 cd
# Sindelfingen_Aero_Telemetry[1196]: Drag coefficient Cd 0.3758, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1298.4 lx, 3D helix taillight luminous flux 1184.2 lm, D-pillar crest illumination 80.34 cd
# Sindelfingen_Aero_Telemetry[1197]: Drag coefficient Cd 0.3759, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1298.8 lx, 3D helix taillight luminous flux 1184.4 lm, D-pillar crest illumination 80.38 cd
# Sindelfingen_Aero_Telemetry[1198]: Drag coefficient Cd 0.3759, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1299.2 lx, 3D helix taillight luminous flux 1184.6 lm, D-pillar crest illumination 80.42 cd
# Sindelfingen_Aero_Telemetry[1199]: Drag coefficient Cd 0.3760, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1299.6 lx, 3D helix taillight luminous flux 1184.8 lm, D-pillar crest illumination 80.46 cd
# Sindelfingen_Aero_Telemetry[1200]: Drag coefficient Cd 0.3761, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1300.0 lx, 3D helix taillight luminous flux 1185.0 lm, D-pillar crest illumination 80.50 cd
# Sindelfingen_Aero_Telemetry[1201]: Drag coefficient Cd 0.3762, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1300.4 lx, 3D helix taillight luminous flux 1185.2 lm, D-pillar crest illumination 80.54 cd
# Sindelfingen_Aero_Telemetry[1202]: Drag coefficient Cd 0.3763, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1300.8 lx, 3D helix taillight luminous flux 1185.4 lm, D-pillar crest illumination 80.58 cd
# Sindelfingen_Aero_Telemetry[1203]: Drag coefficient Cd 0.3763, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1301.2 lx, 3D helix taillight luminous flux 1185.6 lm, D-pillar crest illumination 80.62 cd
# Sindelfingen_Aero_Telemetry[1204]: Drag coefficient Cd 0.3764, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1301.6 lx, 3D helix taillight luminous flux 1185.8 lm, D-pillar crest illumination 80.66 cd
# Sindelfingen_Aero_Telemetry[1205]: Drag coefficient Cd 0.3765, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1302.0 lx, 3D helix taillight luminous flux 1186.0 lm, D-pillar crest illumination 80.70 cd
# Sindelfingen_Aero_Telemetry[1206]: Drag coefficient Cd 0.3766, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1302.4 lx, 3D helix taillight luminous flux 1186.2 lm, D-pillar crest illumination 80.74 cd
# Sindelfingen_Aero_Telemetry[1207]: Drag coefficient Cd 0.3767, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1302.8 lx, 3D helix taillight luminous flux 1186.4 lm, D-pillar crest illumination 80.78 cd
# Sindelfingen_Aero_Telemetry[1208]: Drag coefficient Cd 0.3767, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1303.2 lx, 3D helix taillight luminous flux 1186.6 lm, D-pillar crest illumination 80.82 cd
# Sindelfingen_Aero_Telemetry[1209]: Drag coefficient Cd 0.3768, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1303.6 lx, 3D helix taillight luminous flux 1186.8 lm, D-pillar crest illumination 80.86 cd
# Sindelfingen_Aero_Telemetry[1210]: Drag coefficient Cd 0.3769, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1304.0 lx, 3D helix taillight luminous flux 1187.0 lm, D-pillar crest illumination 80.90 cd
# Sindelfingen_Aero_Telemetry[1211]: Drag coefficient Cd 0.3770, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1304.4 lx, 3D helix taillight luminous flux 1187.2 lm, D-pillar crest illumination 80.94 cd
# Sindelfingen_Aero_Telemetry[1212]: Drag coefficient Cd 0.3771, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1304.8 lx, 3D helix taillight luminous flux 1187.4 lm, D-pillar crest illumination 80.98 cd
# Sindelfingen_Aero_Telemetry[1213]: Drag coefficient Cd 0.3771, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1305.2 lx, 3D helix taillight luminous flux 1187.6 lm, D-pillar crest illumination 81.02 cd
# Sindelfingen_Aero_Telemetry[1214]: Drag coefficient Cd 0.3772, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1305.6 lx, 3D helix taillight luminous flux 1187.8 lm, D-pillar crest illumination 81.06 cd
# Sindelfingen_Aero_Telemetry[1215]: Drag coefficient Cd 0.3773, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1306.0 lx, 3D helix taillight luminous flux 1188.0 lm, D-pillar crest illumination 81.10 cd
# Sindelfingen_Aero_Telemetry[1216]: Drag coefficient Cd 0.3774, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1306.4 lx, 3D helix taillight luminous flux 1188.2 lm, D-pillar crest illumination 81.14 cd
# Sindelfingen_Aero_Telemetry[1217]: Drag coefficient Cd 0.3775, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1306.8 lx, 3D helix taillight luminous flux 1188.4 lm, D-pillar crest illumination 81.18 cd
# Sindelfingen_Aero_Telemetry[1218]: Drag coefficient Cd 0.3775, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1307.2 lx, 3D helix taillight luminous flux 1188.6 lm, D-pillar crest illumination 81.22 cd
# Sindelfingen_Aero_Telemetry[1219]: Drag coefficient Cd 0.3776, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1307.6 lx, 3D helix taillight luminous flux 1188.8 lm, D-pillar crest illumination 81.26 cd
# Sindelfingen_Aero_Telemetry[1220]: Drag coefficient Cd 0.3777, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1308.0 lx, 3D helix taillight luminous flux 1189.0 lm, D-pillar crest illumination 81.30 cd
# Sindelfingen_Aero_Telemetry[1221]: Drag coefficient Cd 0.3778, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1308.4 lx, 3D helix taillight luminous flux 1189.2 lm, D-pillar crest illumination 81.34 cd
# Sindelfingen_Aero_Telemetry[1222]: Drag coefficient Cd 0.3779, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1308.8 lx, 3D helix taillight luminous flux 1189.4 lm, D-pillar crest illumination 81.38 cd
# Sindelfingen_Aero_Telemetry[1223]: Drag coefficient Cd 0.3779, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1309.2 lx, 3D helix taillight luminous flux 1189.6 lm, D-pillar crest illumination 81.42 cd
# Sindelfingen_Aero_Telemetry[1224]: Drag coefficient Cd 0.3780, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1309.6 lx, 3D helix taillight luminous flux 1189.8 lm, D-pillar crest illumination 81.46 cd
# Sindelfingen_Aero_Telemetry[1225]: Drag coefficient Cd 0.3781, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1310.0 lx, 3D helix taillight luminous flux 1190.0 lm, D-pillar crest illumination 81.50 cd
# Sindelfingen_Aero_Telemetry[1226]: Drag coefficient Cd 0.3782, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1310.4 lx, 3D helix taillight luminous flux 1190.2 lm, D-pillar crest illumination 81.54 cd
# Sindelfingen_Aero_Telemetry[1227]: Drag coefficient Cd 0.3783, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1310.8 lx, 3D helix taillight luminous flux 1190.4 lm, D-pillar crest illumination 81.58 cd
# Sindelfingen_Aero_Telemetry[1228]: Drag coefficient Cd 0.3783, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1311.2 lx, 3D helix taillight luminous flux 1190.6 lm, D-pillar crest illumination 81.62 cd
# Sindelfingen_Aero_Telemetry[1229]: Drag coefficient Cd 0.3784, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1311.6 lx, 3D helix taillight luminous flux 1190.8 lm, D-pillar crest illumination 81.66 cd
# Sindelfingen_Aero_Telemetry[1230]: Drag coefficient Cd 0.3785, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1312.0 lx, 3D helix taillight luminous flux 1191.0 lm, D-pillar crest illumination 81.70 cd
# Sindelfingen_Aero_Telemetry[1231]: Drag coefficient Cd 0.3786, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1312.4 lx, 3D helix taillight luminous flux 1191.2 lm, D-pillar crest illumination 81.74 cd
# Sindelfingen_Aero_Telemetry[1232]: Drag coefficient Cd 0.3787, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1312.8 lx, 3D helix taillight luminous flux 1191.4 lm, D-pillar crest illumination 81.78 cd
# Sindelfingen_Aero_Telemetry[1233]: Drag coefficient Cd 0.3787, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1313.2 lx, 3D helix taillight luminous flux 1191.6 lm, D-pillar crest illumination 81.82 cd
# Sindelfingen_Aero_Telemetry[1234]: Drag coefficient Cd 0.3788, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1313.6 lx, 3D helix taillight luminous flux 1191.8 lm, D-pillar crest illumination 81.86 cd
# Sindelfingen_Aero_Telemetry[1235]: Drag coefficient Cd 0.3789, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1314.0 lx, 3D helix taillight luminous flux 1192.0 lm, D-pillar crest illumination 81.90 cd
# Sindelfingen_Aero_Telemetry[1236]: Drag coefficient Cd 0.3790, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1314.4 lx, 3D helix taillight luminous flux 1192.2 lm, D-pillar crest illumination 81.94 cd
# Sindelfingen_Aero_Telemetry[1237]: Drag coefficient Cd 0.3791, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1314.8 lx, 3D helix taillight luminous flux 1192.4 lm, D-pillar crest illumination 81.98 cd
# Sindelfingen_Aero_Telemetry[1238]: Drag coefficient Cd 0.3791, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1315.2 lx, 3D helix taillight luminous flux 1192.6 lm, D-pillar crest illumination 82.02 cd
# Sindelfingen_Aero_Telemetry[1239]: Drag coefficient Cd 0.3792, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1315.6 lx, 3D helix taillight luminous flux 1192.8 lm, D-pillar crest illumination 82.06 cd
# Sindelfingen_Aero_Telemetry[1240]: Drag coefficient Cd 0.3793, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1316.0 lx, 3D helix taillight luminous flux 1193.0 lm, D-pillar crest illumination 82.10 cd
# Sindelfingen_Aero_Telemetry[1241]: Drag coefficient Cd 0.3794, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1316.4 lx, 3D helix taillight luminous flux 1193.2 lm, D-pillar crest illumination 82.14 cd
# Sindelfingen_Aero_Telemetry[1242]: Drag coefficient Cd 0.3795, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1316.8 lx, 3D helix taillight luminous flux 1193.4 lm, D-pillar crest illumination 82.18 cd
# Sindelfingen_Aero_Telemetry[1243]: Drag coefficient Cd 0.3795, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1317.2 lx, 3D helix taillight luminous flux 1193.6 lm, D-pillar crest illumination 82.22 cd
# Sindelfingen_Aero_Telemetry[1244]: Drag coefficient Cd 0.3796, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1317.6 lx, 3D helix taillight luminous flux 1193.8 lm, D-pillar crest illumination 82.26 cd
# Sindelfingen_Aero_Telemetry[1245]: Drag coefficient Cd 0.3797, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1318.0 lx, 3D helix taillight luminous flux 1194.0 lm, D-pillar crest illumination 82.30 cd
# Sindelfingen_Aero_Telemetry[1246]: Drag coefficient Cd 0.3798, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1318.4 lx, 3D helix taillight luminous flux 1194.2 lm, D-pillar crest illumination 82.34 cd
# Sindelfingen_Aero_Telemetry[1247]: Drag coefficient Cd 0.3799, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1318.8 lx, 3D helix taillight luminous flux 1194.4 lm, D-pillar crest illumination 82.38 cd
# Sindelfingen_Aero_Telemetry[1248]: Drag coefficient Cd 0.3799, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1319.2 lx, 3D helix taillight luminous flux 1194.6 lm, D-pillar crest illumination 82.42 cd
# Sindelfingen_Aero_Telemetry[1249]: Drag coefficient Cd 0.3800, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1319.6 lx, 3D helix taillight luminous flux 1194.8 lm, D-pillar crest illumination 82.46 cd
# Sindelfingen_Aero_Telemetry[1250]: Drag coefficient Cd 0.3801, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1320.0 lx, 3D helix taillight luminous flux 1195.0 lm, D-pillar crest illumination 82.50 cd
# Sindelfingen_Aero_Telemetry[1251]: Drag coefficient Cd 0.3802, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1320.4 lx, 3D helix taillight luminous flux 1195.2 lm, D-pillar crest illumination 82.54 cd
# Sindelfingen_Aero_Telemetry[1252]: Drag coefficient Cd 0.3803, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1320.8 lx, 3D helix taillight luminous flux 1195.4 lm, D-pillar crest illumination 82.58 cd
# Sindelfingen_Aero_Telemetry[1253]: Drag coefficient Cd 0.3803, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1321.2 lx, 3D helix taillight luminous flux 1195.6 lm, D-pillar crest illumination 82.62 cd
# Sindelfingen_Aero_Telemetry[1254]: Drag coefficient Cd 0.3804, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1321.6 lx, 3D helix taillight luminous flux 1195.8 lm, D-pillar crest illumination 82.66 cd
# Sindelfingen_Aero_Telemetry[1255]: Drag coefficient Cd 0.3805, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1322.0 lx, 3D helix taillight luminous flux 1196.0 lm, D-pillar crest illumination 82.70 cd
# Sindelfingen_Aero_Telemetry[1256]: Drag coefficient Cd 0.3806, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1322.4 lx, 3D helix taillight luminous flux 1196.2 lm, D-pillar crest illumination 82.74 cd
# Sindelfingen_Aero_Telemetry[1257]: Drag coefficient Cd 0.3807, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1322.8 lx, 3D helix taillight luminous flux 1196.4 lm, D-pillar crest illumination 82.78 cd
# Sindelfingen_Aero_Telemetry[1258]: Drag coefficient Cd 0.3807, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1323.2 lx, 3D helix taillight luminous flux 1196.6 lm, D-pillar crest illumination 82.82 cd
# Sindelfingen_Aero_Telemetry[1259]: Drag coefficient Cd 0.3808, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1323.6 lx, 3D helix taillight luminous flux 1196.8 lm, D-pillar crest illumination 82.86 cd
# Sindelfingen_Aero_Telemetry[1260]: Drag coefficient Cd 0.3809, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1324.0 lx, 3D helix taillight luminous flux 1197.0 lm, D-pillar crest illumination 82.90 cd
# Sindelfingen_Aero_Telemetry[1261]: Drag coefficient Cd 0.3810, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1324.4 lx, 3D helix taillight luminous flux 1197.2 lm, D-pillar crest illumination 82.94 cd
# Sindelfingen_Aero_Telemetry[1262]: Drag coefficient Cd 0.3811, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1324.8 lx, 3D helix taillight luminous flux 1197.4 lm, D-pillar crest illumination 82.98 cd
# Sindelfingen_Aero_Telemetry[1263]: Drag coefficient Cd 0.3811, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1325.2 lx, 3D helix taillight luminous flux 1197.6 lm, D-pillar crest illumination 83.02 cd
# Sindelfingen_Aero_Telemetry[1264]: Drag coefficient Cd 0.3812, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1325.6 lx, 3D helix taillight luminous flux 1197.8 lm, D-pillar crest illumination 83.06 cd
# Sindelfingen_Aero_Telemetry[1265]: Drag coefficient Cd 0.3813, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1326.0 lx, 3D helix taillight luminous flux 1198.0 lm, D-pillar crest illumination 83.10 cd
# Sindelfingen_Aero_Telemetry[1266]: Drag coefficient Cd 0.3814, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1326.4 lx, 3D helix taillight luminous flux 1198.2 lm, D-pillar crest illumination 83.14 cd
# Sindelfingen_Aero_Telemetry[1267]: Drag coefficient Cd 0.3815, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1326.8 lx, 3D helix taillight luminous flux 1198.4 lm, D-pillar crest illumination 83.18 cd
# Sindelfingen_Aero_Telemetry[1268]: Drag coefficient Cd 0.3815, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1327.2 lx, 3D helix taillight luminous flux 1198.6 lm, D-pillar crest illumination 83.22 cd
# Sindelfingen_Aero_Telemetry[1269]: Drag coefficient Cd 0.3816, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1327.6 lx, 3D helix taillight luminous flux 1198.8 lm, D-pillar crest illumination 83.26 cd
# Sindelfingen_Aero_Telemetry[1270]: Drag coefficient Cd 0.3817, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1328.0 lx, 3D helix taillight luminous flux 1199.0 lm, D-pillar crest illumination 83.30 cd
# Sindelfingen_Aero_Telemetry[1271]: Drag coefficient Cd 0.3818, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1328.4 lx, 3D helix taillight luminous flux 1199.2 lm, D-pillar crest illumination 83.34 cd
# Sindelfingen_Aero_Telemetry[1272]: Drag coefficient Cd 0.3819, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1328.8 lx, 3D helix taillight luminous flux 1199.4 lm, D-pillar crest illumination 83.38 cd
# Sindelfingen_Aero_Telemetry[1273]: Drag coefficient Cd 0.3819, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1329.2 lx, 3D helix taillight luminous flux 1199.6 lm, D-pillar crest illumination 83.42 cd
# Sindelfingen_Aero_Telemetry[1274]: Drag coefficient Cd 0.3820, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1329.6 lx, 3D helix taillight luminous flux 1199.8 lm, D-pillar crest illumination 83.46 cd
# Sindelfingen_Aero_Telemetry[1275]: Drag coefficient Cd 0.3821, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1330.0 lx, 3D helix taillight luminous flux 1200.0 lm, D-pillar crest illumination 83.50 cd
# Sindelfingen_Aero_Telemetry[1276]: Drag coefficient Cd 0.3822, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1330.4 lx, 3D helix taillight luminous flux 1200.2 lm, D-pillar crest illumination 83.54 cd
# Sindelfingen_Aero_Telemetry[1277]: Drag coefficient Cd 0.3823, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1330.8 lx, 3D helix taillight luminous flux 1200.4 lm, D-pillar crest illumination 83.58 cd
# Sindelfingen_Aero_Telemetry[1278]: Drag coefficient Cd 0.3823, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1331.2 lx, 3D helix taillight luminous flux 1200.6 lm, D-pillar crest illumination 83.62 cd
# Sindelfingen_Aero_Telemetry[1279]: Drag coefficient Cd 0.3824, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1331.6 lx, 3D helix taillight luminous flux 1200.8 lm, D-pillar crest illumination 83.66 cd
# Sindelfingen_Aero_Telemetry[1280]: Drag coefficient Cd 0.3825, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1332.0 lx, 3D helix taillight luminous flux 1201.0 lm, D-pillar crest illumination 83.70 cd
# Sindelfingen_Aero_Telemetry[1281]: Drag coefficient Cd 0.3826, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1332.4 lx, 3D helix taillight luminous flux 1201.2 lm, D-pillar crest illumination 83.74 cd
# Sindelfingen_Aero_Telemetry[1282]: Drag coefficient Cd 0.3827, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1332.8 lx, 3D helix taillight luminous flux 1201.4 lm, D-pillar crest illumination 83.78 cd
# Sindelfingen_Aero_Telemetry[1283]: Drag coefficient Cd 0.3827, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1333.2 lx, 3D helix taillight luminous flux 1201.6 lm, D-pillar crest illumination 83.82 cd
# Sindelfingen_Aero_Telemetry[1284]: Drag coefficient Cd 0.3828, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1333.6 lx, 3D helix taillight luminous flux 1201.8 lm, D-pillar crest illumination 83.86 cd
# Sindelfingen_Aero_Telemetry[1285]: Drag coefficient Cd 0.3829, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1334.0 lx, 3D helix taillight luminous flux 1202.0 lm, D-pillar crest illumination 83.90 cd
# Sindelfingen_Aero_Telemetry[1286]: Drag coefficient Cd 0.3830, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1334.4 lx, 3D helix taillight luminous flux 1202.2 lm, D-pillar crest illumination 83.94 cd
# Sindelfingen_Aero_Telemetry[1287]: Drag coefficient Cd 0.3831, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1334.8 lx, 3D helix taillight luminous flux 1202.4 lm, D-pillar crest illumination 83.98 cd
# Sindelfingen_Aero_Telemetry[1288]: Drag coefficient Cd 0.3831, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1335.2 lx, 3D helix taillight luminous flux 1202.6 lm, D-pillar crest illumination 84.02 cd
# Sindelfingen_Aero_Telemetry[1289]: Drag coefficient Cd 0.3832, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1335.6 lx, 3D helix taillight luminous flux 1202.8 lm, D-pillar crest illumination 84.06 cd
# Sindelfingen_Aero_Telemetry[1290]: Drag coefficient Cd 0.3833, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1336.0 lx, 3D helix taillight luminous flux 1203.0 lm, D-pillar crest illumination 84.10 cd
# Sindelfingen_Aero_Telemetry[1291]: Drag coefficient Cd 0.3834, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1336.4 lx, 3D helix taillight luminous flux 1203.2 lm, D-pillar crest illumination 84.14 cd
# Sindelfingen_Aero_Telemetry[1292]: Drag coefficient Cd 0.3835, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1336.8 lx, 3D helix taillight luminous flux 1203.4 lm, D-pillar crest illumination 84.18 cd
# Sindelfingen_Aero_Telemetry[1293]: Drag coefficient Cd 0.3835, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1337.2 lx, 3D helix taillight luminous flux 1203.6 lm, D-pillar crest illumination 84.22 cd
# Sindelfingen_Aero_Telemetry[1294]: Drag coefficient Cd 0.3836, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1337.6 lx, 3D helix taillight luminous flux 1203.8 lm, D-pillar crest illumination 84.26 cd
# Sindelfingen_Aero_Telemetry[1295]: Drag coefficient Cd 0.3837, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1338.0 lx, 3D helix taillight luminous flux 1204.0 lm, D-pillar crest illumination 84.30 cd
# Sindelfingen_Aero_Telemetry[1296]: Drag coefficient Cd 0.3838, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1338.4 lx, 3D helix taillight luminous flux 1204.2 lm, D-pillar crest illumination 84.34 cd
# Sindelfingen_Aero_Telemetry[1297]: Drag coefficient Cd 0.3839, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1338.8 lx, 3D helix taillight luminous flux 1204.4 lm, D-pillar crest illumination 84.38 cd
# Sindelfingen_Aero_Telemetry[1298]: Drag coefficient Cd 0.3839, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1339.2 lx, 3D helix taillight luminous flux 1204.6 lm, D-pillar crest illumination 84.42 cd
# Sindelfingen_Aero_Telemetry[1299]: Drag coefficient Cd 0.3840, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1339.6 lx, 3D helix taillight luminous flux 1204.8 lm, D-pillar crest illumination 84.46 cd
# Sindelfingen_Aero_Telemetry[1300]: Drag coefficient Cd 0.3841, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1340.0 lx, 3D helix taillight luminous flux 1205.0 lm, D-pillar crest illumination 84.50 cd
# Sindelfingen_Aero_Telemetry[1301]: Drag coefficient Cd 0.3842, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1340.4 lx, 3D helix taillight luminous flux 1205.2 lm, D-pillar crest illumination 84.54 cd
# Sindelfingen_Aero_Telemetry[1302]: Drag coefficient Cd 0.3843, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1340.8 lx, 3D helix taillight luminous flux 1205.4 lm, D-pillar crest illumination 84.58 cd
# Sindelfingen_Aero_Telemetry[1303]: Drag coefficient Cd 0.3843, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1341.2 lx, 3D helix taillight luminous flux 1205.6 lm, D-pillar crest illumination 84.62 cd
# Sindelfingen_Aero_Telemetry[1304]: Drag coefficient Cd 0.3844, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1341.6 lx, 3D helix taillight luminous flux 1205.8 lm, D-pillar crest illumination 84.66 cd
# Sindelfingen_Aero_Telemetry[1305]: Drag coefficient Cd 0.3845, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1342.0 lx, 3D helix taillight luminous flux 1206.0 lm, D-pillar crest illumination 84.70 cd
# Sindelfingen_Aero_Telemetry[1306]: Drag coefficient Cd 0.3846, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1342.4 lx, 3D helix taillight luminous flux 1206.2 lm, D-pillar crest illumination 84.74 cd
# Sindelfingen_Aero_Telemetry[1307]: Drag coefficient Cd 0.3847, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1342.8 lx, 3D helix taillight luminous flux 1206.4 lm, D-pillar crest illumination 84.78 cd
# Sindelfingen_Aero_Telemetry[1308]: Drag coefficient Cd 0.3847, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1343.2 lx, 3D helix taillight luminous flux 1206.6 lm, D-pillar crest illumination 84.82 cd
# Sindelfingen_Aero_Telemetry[1309]: Drag coefficient Cd 0.3848, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1343.6 lx, 3D helix taillight luminous flux 1206.8 lm, D-pillar crest illumination 84.86 cd
# Sindelfingen_Aero_Telemetry[1310]: Drag coefficient Cd 0.3849, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1344.0 lx, 3D helix taillight luminous flux 1207.0 lm, D-pillar crest illumination 84.90 cd
# Sindelfingen_Aero_Telemetry[1311]: Drag coefficient Cd 0.3850, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1344.4 lx, 3D helix taillight luminous flux 1207.2 lm, D-pillar crest illumination 84.94 cd
# Sindelfingen_Aero_Telemetry[1312]: Drag coefficient Cd 0.3851, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1344.8 lx, 3D helix taillight luminous flux 1207.4 lm, D-pillar crest illumination 84.98 cd
# Sindelfingen_Aero_Telemetry[1313]: Drag coefficient Cd 0.3851, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1345.2 lx, 3D helix taillight luminous flux 1207.6 lm, D-pillar crest illumination 85.02 cd
# Sindelfingen_Aero_Telemetry[1314]: Drag coefficient Cd 0.3852, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1345.6 lx, 3D helix taillight luminous flux 1207.8 lm, D-pillar crest illumination 85.06 cd
# Sindelfingen_Aero_Telemetry[1315]: Drag coefficient Cd 0.3853, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1346.0 lx, 3D helix taillight luminous flux 1208.0 lm, D-pillar crest illumination 85.10 cd
# Sindelfingen_Aero_Telemetry[1316]: Drag coefficient Cd 0.3854, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1346.4 lx, 3D helix taillight luminous flux 1208.2 lm, D-pillar crest illumination 85.14 cd
# Sindelfingen_Aero_Telemetry[1317]: Drag coefficient Cd 0.3855, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1346.8 lx, 3D helix taillight luminous flux 1208.4 lm, D-pillar crest illumination 85.18 cd
# Sindelfingen_Aero_Telemetry[1318]: Drag coefficient Cd 0.3855, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1347.2 lx, 3D helix taillight luminous flux 1208.6 lm, D-pillar crest illumination 85.22 cd
# Sindelfingen_Aero_Telemetry[1319]: Drag coefficient Cd 0.3856, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1347.6 lx, 3D helix taillight luminous flux 1208.8 lm, D-pillar crest illumination 85.26 cd
# Sindelfingen_Aero_Telemetry[1320]: Drag coefficient Cd 0.3857, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1348.0 lx, 3D helix taillight luminous flux 1209.0 lm, D-pillar crest illumination 85.30 cd
# Sindelfingen_Aero_Telemetry[1321]: Drag coefficient Cd 0.3858, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1348.4 lx, 3D helix taillight luminous flux 1209.2 lm, D-pillar crest illumination 85.34 cd
# Sindelfingen_Aero_Telemetry[1322]: Drag coefficient Cd 0.3859, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1348.8 lx, 3D helix taillight luminous flux 1209.4 lm, D-pillar crest illumination 85.38 cd
# Sindelfingen_Aero_Telemetry[1323]: Drag coefficient Cd 0.3859, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1349.2 lx, 3D helix taillight luminous flux 1209.6 lm, D-pillar crest illumination 85.42 cd
# Sindelfingen_Aero_Telemetry[1324]: Drag coefficient Cd 0.3860, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1349.6 lx, 3D helix taillight luminous flux 1209.8 lm, D-pillar crest illumination 85.46 cd
# Sindelfingen_Aero_Telemetry[1325]: Drag coefficient Cd 0.3861, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1350.0 lx, 3D helix taillight luminous flux 1210.0 lm, D-pillar crest illumination 85.50 cd
# Sindelfingen_Aero_Telemetry[1326]: Drag coefficient Cd 0.3862, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1350.4 lx, 3D helix taillight luminous flux 1210.2 lm, D-pillar crest illumination 85.54 cd
# Sindelfingen_Aero_Telemetry[1327]: Drag coefficient Cd 0.3863, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1350.8 lx, 3D helix taillight luminous flux 1210.4 lm, D-pillar crest illumination 85.58 cd
# Sindelfingen_Aero_Telemetry[1328]: Drag coefficient Cd 0.3863, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1351.2 lx, 3D helix taillight luminous flux 1210.6 lm, D-pillar crest illumination 85.62 cd
# Sindelfingen_Aero_Telemetry[1329]: Drag coefficient Cd 0.3864, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1351.6 lx, 3D helix taillight luminous flux 1210.8 lm, D-pillar crest illumination 85.66 cd
# Sindelfingen_Aero_Telemetry[1330]: Drag coefficient Cd 0.3865, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1352.0 lx, 3D helix taillight luminous flux 1211.0 lm, D-pillar crest illumination 85.70 cd
# Sindelfingen_Aero_Telemetry[1331]: Drag coefficient Cd 0.3866, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1352.4 lx, 3D helix taillight luminous flux 1211.2 lm, D-pillar crest illumination 85.74 cd
# Sindelfingen_Aero_Telemetry[1332]: Drag coefficient Cd 0.3867, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1352.8 lx, 3D helix taillight luminous flux 1211.4 lm, D-pillar crest illumination 85.78 cd
# Sindelfingen_Aero_Telemetry[1333]: Drag coefficient Cd 0.3867, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1353.2 lx, 3D helix taillight luminous flux 1211.6 lm, D-pillar crest illumination 85.82 cd
# Sindelfingen_Aero_Telemetry[1334]: Drag coefficient Cd 0.3868, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1353.6 lx, 3D helix taillight luminous flux 1211.8 lm, D-pillar crest illumination 85.86 cd
# Sindelfingen_Aero_Telemetry[1335]: Drag coefficient Cd 0.3869, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1354.0 lx, 3D helix taillight luminous flux 1212.0 lm, D-pillar crest illumination 85.90 cd
# Sindelfingen_Aero_Telemetry[1336]: Drag coefficient Cd 0.3870, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1354.4 lx, 3D helix taillight luminous flux 1212.2 lm, D-pillar crest illumination 85.94 cd
# Sindelfingen_Aero_Telemetry[1337]: Drag coefficient Cd 0.3871, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1354.8 lx, 3D helix taillight luminous flux 1212.4 lm, D-pillar crest illumination 85.98 cd
# Sindelfingen_Aero_Telemetry[1338]: Drag coefficient Cd 0.3871, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1355.2 lx, 3D helix taillight luminous flux 1212.6 lm, D-pillar crest illumination 86.02 cd
# Sindelfingen_Aero_Telemetry[1339]: Drag coefficient Cd 0.3872, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1355.6 lx, 3D helix taillight luminous flux 1212.8 lm, D-pillar crest illumination 86.06 cd
# Sindelfingen_Aero_Telemetry[1340]: Drag coefficient Cd 0.3873, frontal area A 2.98 m2, Black Panel radar attenuation 0.42 dB, Digital Light 1.3M micromirror beam lux 1356.0 lx, 3D helix taillight luminous flux 1213.0 lm, D-pillar crest illumination 86.10 cd
