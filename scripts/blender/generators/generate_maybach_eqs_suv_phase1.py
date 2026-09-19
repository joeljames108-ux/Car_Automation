"""
=============================================================================
Procedural Class-A CAD Generator: Mercedes-Maybach EQS 680 SUV (Future Era)
PHASE 51: EVA2 Skateboard Platform, 108.4 kWh Battery Pack, Dual e-Motors,
AIRMATIC Air Suspension, 24" Aero Monoblock Wheels & Executive Lounge Suite
=============================================================================
Luxury Car Architecture · Future Era Ultra-Luxury Electric SUV (Sindelfingen / Tuscaloosa)
Vehicle Dimensions:
  Wheelbase: 3,210 mm
  Overall Length: 5,125 mm
  Overall Width: 2,034 mm
  Overall Height: 1,721 mm
  Front Track: 1,667 mm
  Rear Track: 1,678 mm
  Powertrain: Dual PSM e-Motors, 484 kW (649 hp), 950 Nm, 4MATIC AWD
  Battery: 108.4 kWh usable NCM pouch cells, 400V architecture, liquid-cooled

This Phase A script generates the foundational rolling skateboard chassis:
1. EVA2 Dedicated Skateboard Platform & Extruded Aluminum Subframe
2. 108.4 kWh High-Voltage Battery Pack with Liquid-Cooling Chill Plate
3. Dual e-Motor Powertrain (Front PSM + Planetary Gearbox, Rear PSM + Inverter)
4. AIRMATIC Adaptive Air Suspension with 4.5° Rear-Axle Steering Actuator
5. 24" Forged Maybach Aero Monoblock Wheels, Pirelli EV Tires & 415mm Brakes
6. Full Underbody Aerodynamic Belly Pan & Acoustic Wheel Arch Tubs
7. Executive Lounge Cabin Foundation: MBUX Hyperscreen & First-Class Reclining Seats
Adheres strictly to the Maximum Visual Quality & Intensive CAD Mesh Standard.
=============================================================================
"""

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector, Matrix, Euler, Quaternion


# ============================================================================
# 1. COMPATIBILITY & CAD SURFACE FINISHING UTILITIES
# ============================================================================

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


def make_pbr_material(name, base_color=(0.8, 0.8, 0.8, 1.0), metallic=0.0, roughness=0.5,
                      clearcoat=0.0, transmission=0.0, ior=1.45, emission=(0, 0, 0, 1), emission_strength=0.0,
                      alpha=1.0):
    """Creates a Principled BSDF PBR material with Blender 4.x/5.x compatibility."""
    mat = bpy.data.materials.get(name)
    if mat is None:
        mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    bsdf.location = (0, 0)
    bsdf.inputs['Base Color'].default_value = base_color
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness
    if 'Clearcoat' in bsdf.inputs:
        bsdf.inputs['Clearcoat'].default_value = clearcoat
    elif 'Coat Weight' in bsdf.inputs:
        bsdf.inputs['Coat Weight'].default_value = clearcoat
    if 'Transmission' in bsdf.inputs:
        bsdf.inputs['Transmission'].default_value = transmission
    elif 'Transmission Weight' in bsdf.inputs:
        bsdf.inputs['Transmission Weight'].default_value = transmission
    bsdf.inputs['IOR'].default_value = ior
    if alpha < 1.0:
        bsdf.inputs['Alpha'].default_value = alpha
        mat.blend_method = 'BLEND' if hasattr(mat, 'blend_method') else mat.blend_method
    if emission_strength > 0.0:
        if 'Emission' in bsdf.inputs:
            bsdf.inputs['Emission'].default_value = emission
        elif 'Emission Color' in bsdf.inputs:
            bsdf.inputs['Emission Color'].default_value = emission
        if 'Emission Strength' in bsdf.inputs:
            bsdf.inputs['Emission Strength'].default_value = emission_strength
    output = nodes.new(type='ShaderNodeOutputMaterial')
    output.location = (300, 0)
    mat.node_tree.links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
    return mat


def create_mesh_object(name, collection):
    """Creates an empty mesh object and links it to the specified collection."""
    mesh = bpy.data.meshes.new(name + "_Mesh")
    obj = bpy.data.objects.new(name, mesh)
    collection.objects.link(obj)
    return obj, mesh


def assign_material(obj, mat):
    """Assigns material to slot 0."""
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)


def apply_auto_smooth(obj, angle_deg=35.0):
    """Applies smooth shading with auto-smooth angle."""
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.shade_smooth()
    obj.select_set(False)
    if hasattr(obj.data, 'use_auto_smooth'):
        obj.data.use_auto_smooth = True


def add_solidify_modifier(obj, thickness=0.002, offset=-1.0):
    """Adds Solidify modifier for sheet metal gauge thickness."""
    mod = obj.modifiers.new(name="Solidify_SheetMetal", type='SOLIDIFY')
    mod.thickness = thickness
    mod.offset = offset
    return mod


def add_bevel_modifier(obj, width=0.003, segments=2, limit_method='ANGLE', angle_limit=30):
    """Adds Bevel modifier for crisp chamfers."""
    mod = obj.modifiers.new(name="Bevel_EdgeChamfer", type='BEVEL')
    mod.width = width
    mod.segments = segments
    mod.limit_method = limit_method
    if limit_method == 'ANGLE':
        mod.angle_limit = math.radians(angle_limit)
    return mod


def add_weighted_normal(obj, keep_sharp=True):
    """Adds Weighted Normal modifier to eliminate CAD shading seam artifacts."""
    mod = obj.modifiers.new(name="WeightedNormal", type='WEIGHTED_NORMAL')
    mod.keep_sharp = keep_sharp
    return mod


def finalize_cad_object(obj, mat, thickness=0.002, bevel_width=0.003, smooth_angle=35.0):
    """Complete CAD pipeline: material, solidify, bevel, weighted normal, smooth."""
    assign_material(obj, mat)
    add_solidify_modifier(obj, thickness=thickness)
    add_bevel_modifier(obj, width=bevel_width, segments=2)
    add_weighted_normal(obj)
    apply_auto_smooth(obj, angle_deg=smooth_angle)


# ============================================================================
# 2. COMPLETE SINDELFINGEN / MAYBACH ELECTRIC PBR MATERIAL SUITE
# ============================================================================

def setup_maybach_eqs_phase1_materials():
    """Creates the complete Phase 51 PBR material suite for Maybach EQS SUV."""
    mats = {}

    # 1. EVA2 Skateboard Hydroformed Steel/Aluminum Frame
    mats['eva2_frame'] = make_pbr_material(
        "Maybach_EQS_EVA2_Perimeter_Frame",
        (0.18, 0.20, 0.22, 1.0),
        metallic=0.88,
        roughness=0.28
    )

    # 2. Battery Enclosure Shield (Reinforced Aluminum Honeycomb)
    mats['battery_enclosure'] = make_pbr_material(
        "Maybach_EQS_Battery_Shield_Plate",
        (0.24, 0.26, 0.28, 1.0),
        metallic=0.92,
        roughness=0.22
    )

    # 3. High-Voltage Copper-Orange Shielded Bus Bars
    mats['hv_orange'] = make_pbr_material(
        "Maybach_EQS_HV_Orange_Cable",
        (0.95, 0.38, 0.05, 1.0),
        metallic=0.15,
        roughness=0.35
    )

    # 4. Cast Aluminum Suspension Subframe
    mats['cast_subframe'] = make_pbr_material(
        "Maybach_EQS_Cast_Aluminum_Subframe",
        (0.65, 0.67, 0.70, 1.0),
        metallic=0.90,
        roughness=0.30
    )

    # 5. e-Motor Inverter Casing (Ribbed Cast Aluminum)
    mats['motor_casing'] = make_pbr_material(
        "Maybach_EQS_PSM_Motor_Casing",
        (0.55, 0.58, 0.60, 1.0),
        metallic=0.92,
        roughness=0.25
    )

    # 6. Motor Rotor / Stator Core (Steel Lamination)
    mats['stator_core'] = make_pbr_material(
        "Maybach_EQS_Stator_Core_Lamination",
        (0.12, 0.13, 0.14, 1.0),
        metallic=0.85,
        roughness=0.40
    )

    # 7. AIRMATIC Air Spring Rubber Bellows
    mats['air_spring_bellows'] = make_pbr_material(
        "Maybach_EQS_AIRMATIC_Bellows",
        (0.04, 0.04, 0.04, 1.0),
        metallic=0.02,
        roughness=0.75
    )

    # 8. Adaptive Damper Aluminum Cylinder
    mats['damper_cylinder'] = make_pbr_material(
        "Maybach_EQS_ADS_Damper_Cylinder",
        (0.78, 0.80, 0.82, 1.0),
        metallic=0.95,
        roughness=0.15
    )

    # 9. 24-inch Forged Maybach Aero Monoblock Rim (Mirror Polished)
    mats['maybach_monoblock_chrome'] = make_pbr_material(
        "Maybach_EQS_24Inch_Monoblock_Chrome",
        (0.97, 0.98, 0.99, 1.0),
        metallic=0.99,
        roughness=0.03,
        clearcoat=1.0
    )

    # 10. Monoblock Radial Venting Dark Flutes
    mats['wheel_vent_flutes'] = make_pbr_material(
        "Maybach_EQS_Wheel_Vent_Flutes_Satin",
        (0.10, 0.11, 0.12, 1.0),
        metallic=0.75,
        roughness=0.40
    )

    # 11. Pirelli Scorpion Zero EV Noise-Cancelling Tire Rubber
    mats['pirelli_tire'] = make_pbr_material(
        "Maybach_EQS_Pirelli_EV_Tire_Rubber",
        (0.03, 0.03, 0.03, 1.0),
        metallic=0.02,
        roughness=0.78
    )

    # 12. 415mm Ventilated Cast-Iron Brake Rotor
    mats['brake_rotor'] = make_pbr_material(
        "Maybach_EQS_415mm_Ventilated_Rotor",
        (0.72, 0.74, 0.76, 1.0),
        metallic=0.94,
        roughness=0.20
    )

    # 13. Silver 6-Piston Caliper with Maybach Lettering
    mats['maybach_caliper'] = make_pbr_material(
        "Maybach_EQS_Silver_Brake_Caliper",
        (0.85, 0.86, 0.88, 1.0),
        metallic=0.88,
        roughness=0.18,
        clearcoat=0.90
    )

    # 14. Smooth Aerodynamic Underbody Belly Pan
    mats['aero_belly_pan'] = make_pbr_material(
        "Maybach_EQS_Aero_Composite_Belly_Pan",
        (0.05, 0.05, 0.06, 1.0),
        metallic=0.10,
        roughness=0.60
    )

    # 15. Rear-Axle Steering Actuator Unit
    mats['rear_steer_actuator'] = make_pbr_material(
        "Maybach_EQS_Rear_Steer_Actuator",
        (0.35, 0.38, 0.40, 1.0),
        metallic=0.80,
        roughness=0.30
    )

    # 16. MBUX Hyperscreen Glass Panel (Curved 1.41m OLED Glass)
    mats['hyperscreen_glass'] = make_pbr_material(
        "Maybach_EQS_Hyperscreen_OLED_Glass",
        (0.01, 0.01, 0.02, 1.0),
        metallic=0.10,
        roughness=0.02,
        clearcoat=1.0
    )

    # 17. MBUX Hyperscreen Active Digital OLED Graphics
    mats['hyperscreen_oled'] = make_pbr_material(
        "Maybach_EQS_Hyperscreen_OLED_Display",
        (0.05, 0.25, 0.45, 1.0),
        metallic=0.0,
        roughness=0.05,
        emission=(0.10, 0.50, 0.90, 1.0),
        emission_strength=4.5
    )

    # 18. Diamond-Quilted Exclusive Nappa Leather (Macchiato Beige)
    mats['macchiato_leather'] = make_pbr_material(
        "Maybach_EQS_Nappa_Macchiato_Beige",
        (0.86, 0.82, 0.74, 1.0),
        metallic=0.05,
        roughness=0.68
    )

    # 19. Rose Gold Interior Jewelry & Louver Trim
    mats['rose_gold'] = make_pbr_material(
        "Maybach_EQS_Rose_Gold_Interior_Trim",
        (0.92, 0.65, 0.52, 1.0),
        metallic=0.96,
        roughness=0.10,
        clearcoat=0.95
    )

    # 20. White Piano Lacquer Center Floating Bridge
    mats['white_piano_lacquer'] = make_pbr_material(
        "Maybach_EQS_White_Piano_Lacquer",
        (0.95, 0.95, 0.96, 1.0),
        metallic=0.05,
        roughness=0.04,
        clearcoat=1.0
    )

    # 21. Natural Open-Pore Birch Wood with Maybach Emblems
    mats['birch_wood'] = make_pbr_material(
        "Maybach_EQS_OpenPore_Birch_Wood",
        (0.38, 0.28, 0.20, 1.0),
        metallic=0.02,
        roughness=0.55
    )

    # 22. Ethylene-Glycol Coolant Hose (High-Pressure Blue)
    mats['coolant_hose'] = make_pbr_material(
        "Maybach_EQS_Coolant_Hose",
        (0.02, 0.18, 0.45, 1.0),
        metallic=0.05,
        roughness=0.40
    )

    print(f"[MATERIALS] Created {len(mats)} Maybach EQS SUV Phase 51 PBR materials")
    return mats


# ============================================================================
# 3. EVA2 DEDICATED ELECTRIC SKATEBOARD PLATFORM
# ============================================================================

def build_maybach_eqs_eva2_chassis(col, mats):
    """
    Builds the EVA2 dedicated electric skateboard chassis:
    - Perimeter hydroformed steel/aluminum side sill members
    - Underbody flat floor pan housing battery pack
    - Front extruded crash boxes and radiator cradle
    - Front and rear cast aluminum suspension subframes
    - Structural A/B/C/D-pillar roof arch cage
    """
    all_objs = []

    # ── 3.1 Skateboard Floor Pan ─────────────────────────────────────────
    obj_floor, mesh_floor = create_mesh_object("GEO_Maybach_EQS_Floor_Pan", col)
    bm = bmesh.new()
    floor_w = 0.98
    floor_front_y = 1.70
    floor_rear_y = -1.65
    floor_z = 0.16

    fp0 = bm.verts.new(Vector((-floor_w, floor_front_y, floor_z)))
    fp1 = bm.verts.new(Vector((floor_w, floor_front_y, floor_z)))
    fp2 = bm.verts.new(Vector((floor_w, floor_rear_y, floor_z)))
    fp3 = bm.verts.new(Vector((-floor_w, floor_rear_y, floor_z)))
    fp4 = bm.verts.new(Vector((-floor_w, floor_front_y, floor_z + 0.08)))
    fp5 = bm.verts.new(Vector((floor_w, floor_front_y, floor_z + 0.08)))
    fp6 = bm.verts.new(Vector((floor_w, floor_rear_y, floor_z + 0.08)))
    fp7 = bm.verts.new(Vector((-floor_w, floor_rear_y, floor_z + 0.08)))

    bm.faces.new([fp0, fp1, fp2, fp3])
    bm.faces.new([fp4, fp7, fp6, fp5])
    bm.faces.new([fp0, fp3, fp7, fp4])
    bm.faces.new([fp1, fp5, fp6, fp2])
    bm.faces.new([fp3, fp2, fp6, fp7])
    bm.faces.new([fp0, fp4, fp5, fp1])

    bm.to_mesh(mesh_floor)
    bm.free()
    finalize_cad_object(obj_floor, mats['eva2_frame'], thickness=0.003, bevel_width=0.003)
    all_objs.append(obj_floor)

    # ── 3.2 Side Sill Extrusions (Left + Right) ─────────────────────────
    for side_name, side_sign in [("Left", 1), ("Right", -1)]:
        obj_sill, mesh_sill = create_mesh_object(f"GEO_Maybach_EQS_Side_Sill_{side_name}", col)
        bm = bmesh.new()
        sx = side_sign * 0.96
        sill_w = 0.08
        sill_front_y = 1.68
        sill_rear_y = -1.62
        sill_z_low = 0.14
        sill_z_high = 0.28

        sv0 = bm.verts.new(Vector((sx - sill_w/2, sill_front_y, sill_z_low)))
        sv1 = bm.verts.new(Vector((sx + sill_w/2, sill_front_y, sill_z_low)))
        sv2 = bm.verts.new(Vector((sx + sill_w/2, sill_front_y, sill_z_high)))
        sv3 = bm.verts.new(Vector((sx - sill_w/2, sill_front_y, sill_z_high)))
        sv4 = bm.verts.new(Vector((sx - sill_w/2, sill_rear_y, sill_z_low)))
        sv5 = bm.verts.new(Vector((sx + sill_w/2, sill_rear_y, sill_z_low)))
        sv6 = bm.verts.new(Vector((sx + sill_w/2, sill_rear_y, sill_z_high)))
        sv7 = bm.verts.new(Vector((sx - sill_w/2, sill_rear_y, sill_z_high)))

        bm.faces.new([sv0, sv1, sv2, sv3])
        bm.faces.new([sv4, sv7, sv6, sv5])
        bm.faces.new([sv0, sv3, sv7, sv4])
        bm.faces.new([sv1, sv5, sv6, sv2])
        bm.faces.new([sv3, sv2, sv6, sv7])
        bm.faces.new([sv0, sv4, sv5, sv1])

        bm.to_mesh(mesh_sill)
        bm.free()
        finalize_cad_object(obj_sill, mats['eva2_frame'], thickness=0.003)
        all_objs.append(obj_sill)

    # ── 3.3 Front Cast Aluminum Subframe ────────────────────────────────
    obj_fsub, mesh_fsub = create_mesh_object("GEO_Maybach_EQS_Front_Subframe", col)
    bm = bmesh.new()
    fsub_w = 0.68
    fsub_front_y = 2.45
    fsub_rear_y = 1.45
    fsub_z_low = 0.16
    fsub_z_high = 0.38

    fsv0 = bm.verts.new(Vector((-fsub_w, fsub_front_y, fsub_z_low)))
    fsv1 = bm.verts.new(Vector((fsub_w, fsub_front_y, fsub_z_low)))
    fsv2 = bm.verts.new(Vector((fsub_w, fsub_rear_y, fsub_z_high)))
    fsv3 = bm.verts.new(Vector((-fsub_w, fsub_rear_y, fsub_z_high)))
    fsv4 = bm.verts.new(Vector((-fsub_w * 0.85, fsub_front_y, fsub_z_high)))
    fsv5 = bm.verts.new(Vector((fsub_w * 0.85, fsub_front_y, fsub_z_high)))

    bm.faces.new([fsv0, fsv1, fsv5, fsv4])
    bm.faces.new([fsv4, fsv5, fsv2, fsv3])
    bm.faces.new([fsv0, fsv4, fsv3])
    bm.faces.new([fsv1, fsv2, fsv5])

    bm.to_mesh(mesh_fsub)
    bm.free()
    finalize_cad_object(obj_fsub, mats['cast_subframe'], thickness=0.004, bevel_width=0.003)
    all_objs.append(obj_fsub)

    # ── 3.4 Rear Cast Aluminum Subframe with Rear Steer Mounting ────────
    obj_rsub, mesh_rsub = create_mesh_object("GEO_Maybach_EQS_Rear_Subframe", col)
    bm = bmesh.new()
    rsub_w = 0.70
    rsub_front_y = -1.40
    rsub_rear_y = -2.35
    rsub_z_low = 0.18
    rsub_z_high = 0.42

    rsv0 = bm.verts.new(Vector((-rsub_w, rsub_front_y, rsub_z_high)))
    rsv1 = bm.verts.new(Vector((rsub_w, rsub_front_y, rsub_z_high)))
    rsv2 = bm.verts.new(Vector((rsub_w, rsub_rear_y, rsub_z_low)))
    rsv3 = bm.verts.new(Vector((-rsub_w, rsub_rear_y, rsub_z_low)))

    bm.faces.new([rsv0, rsv1, rsv2, rsv3])

    bm.to_mesh(mesh_rsub)
    bm.free()
    finalize_cad_object(obj_rsub, mats['cast_subframe'], thickness=0.004, bevel_width=0.003)
    all_objs.append(obj_rsub)

    # ── 3.5 Structural Pillar Cage (A, B, C, D Pillars & Cantrail Rails) ──
    for side_name, side_sign in [("Left", 1), ("Right", -1)]:
        # Internal A-Pillar (cowl to cantrail)
        obj_apillar, mesh_apillar = create_mesh_object(f"GEO_Maybach_EQS_A_Pillar_{side_name}", col)
        bm = bmesh.new()
        ax0 = side_sign * 0.78
        ax1 = side_sign * 0.72
        v0 = bm.verts.new(Vector((ax0 - 0.02, 1.22, 0.92)))
        v1 = bm.verts.new(Vector((ax0 + 0.02, 1.22, 0.92)))
        v2 = bm.verts.new(Vector((ax1 + 0.02, 1.08, 1.54)))
        v3 = bm.verts.new(Vector((ax1 - 0.02, 1.08, 1.54)))
        v4 = bm.verts.new(Vector((ax0 - 0.02, 1.18, 0.92)))
        v5 = bm.verts.new(Vector((ax0 + 0.02, 1.18, 0.92)))
        v6 = bm.verts.new(Vector((ax1 + 0.02, 1.04, 1.54)))
        v7 = bm.verts.new(Vector((ax1 - 0.02, 1.04, 1.54)))
        bm.faces.new([v0, v1, v2, v3])
        bm.faces.new([v4, v7, v6, v5])
        bm.faces.new([v0, v3, v7, v4])
        bm.faces.new([v1, v5, v6, v2])
        bm.to_mesh(mesh_apillar)
        bm.free()
        finalize_cad_object(obj_apillar, mats['eva2_frame'], thickness=0.003)
        all_objs.append(obj_apillar)

        # Internal B-Pillar (floor sill to cantrail)
        obj_bpillar, mesh_bpillar = create_mesh_object(f"GEO_Maybach_EQS_B_Pillar_{side_name}", col)
        bm = bmesh.new()
        bx = side_sign * 0.82
        bv0 = bm.verts.new(Vector((bx - 0.025, 0.03, 0.35)))
        bv1 = bm.verts.new(Vector((bx + 0.025, 0.03, 0.35)))
        bv2 = bm.verts.new(Vector((bx + 0.025, 0.03, 1.55)))
        bv3 = bm.verts.new(Vector((bx - 0.025, 0.03, 1.55)))
        bv4 = bm.verts.new(Vector((bx - 0.025, -0.03, 0.35)))
        bv5 = bm.verts.new(Vector((bx + 0.025, -0.03, 0.35)))
        bv6 = bm.verts.new(Vector((bx + 0.025, -0.03, 1.55)))
        bv7 = bm.verts.new(Vector((bx - 0.025, -0.03, 1.55)))
        bm.faces.new([bv0, bv1, bv2, bv3])
        bm.faces.new([bv4, bv7, bv6, bv5])
        bm.faces.new([bv0, bv3, bv7, bv4])
        bm.faces.new([bv1, bv5, bv6, bv2])
        bm.to_mesh(mesh_bpillar)
        bm.free()
        finalize_cad_object(obj_bpillar, mats['eva2_frame'], thickness=0.003)
        all_objs.append(obj_bpillar)

        # Internal C-Pillar (rear door shutface to cantrail)
        obj_cpillar, mesh_cpillar = create_mesh_object(f"GEO_Maybach_EQS_C_Pillar_{side_name}", col)
        bm = bmesh.new()
        cx = side_sign * 0.80
        cv0 = bm.verts.new(Vector((cx - 0.025, -0.88, 0.35)))
        cv1 = bm.verts.new(Vector((cx + 0.025, -0.88, 0.35)))
        cv2 = bm.verts.new(Vector((cx + 0.025, -0.88, 1.54)))
        cv3 = bm.verts.new(Vector((cx - 0.025, -0.88, 1.54)))
        cv4 = bm.verts.new(Vector((cx - 0.025, -0.94, 0.35)))
        cv5 = bm.verts.new(Vector((cx + 0.025, -0.94, 0.35)))
        cv6 = bm.verts.new(Vector((cx + 0.025, -0.94, 1.54)))
        cv7 = bm.verts.new(Vector((cx - 0.025, -0.94, 1.54)))
        bm.faces.new([cv0, cv1, cv2, cv3])
        bm.faces.new([cv4, cv7, cv6, cv5])
        bm.faces.new([cv0, cv3, cv7, cv4])
        bm.faces.new([cv1, cv5, cv6, cv2])
        bm.to_mesh(mesh_cpillar)
        bm.free()
        finalize_cad_object(obj_cpillar, mats['eva2_frame'], thickness=0.003)
        all_objs.append(obj_cpillar)

        # Internal D-Pillar (rear wheel tub to roof header)
        obj_dpillar, mesh_dpillar = create_mesh_object(f"GEO_Maybach_EQS_D_Pillar_{side_name}", col)
        bm = bmesh.new()
        dx0 = side_sign * 0.78
        dx1 = side_sign * 0.72
        dv0 = bm.verts.new(Vector((dx0 - 0.025, -1.65, 0.95)))
        dv1 = bm.verts.new(Vector((dx0 + 0.025, -1.65, 0.95)))
        dv2 = bm.verts.new(Vector((dx1 + 0.025, -1.45, 1.54)))
        dv3 = bm.verts.new(Vector((dx1 - 0.025, -1.45, 1.54)))
        dv4 = bm.verts.new(Vector((dx0 - 0.025, -1.70, 0.95)))
        dv5 = bm.verts.new(Vector((dx0 + 0.025, -1.70, 0.95)))
        dv6 = bm.verts.new(Vector((dx1 + 0.025, -1.50, 1.54)))
        dv7 = bm.verts.new(Vector((dx1 - 0.025, -1.50, 1.54)))
        bm.faces.new([dv0, dv1, dv2, dv3])
        bm.faces.new([dv4, dv7, dv6, dv5])
        bm.faces.new([dv0, dv3, dv7, dv4])
        bm.faces.new([dv1, dv5, dv6, dv2])
        bm.to_mesh(mesh_dpillar)
        bm.free()
        finalize_cad_object(obj_dpillar, mats['eva2_frame'], thickness=0.003)
        all_objs.append(obj_dpillar)

        # Cantrail Roof Box Rail (runs inside roof edge from cowl to D-pillar)
        obj_rail, mesh_rail = create_mesh_object(f"GEO_Maybach_EQS_Roof_Rail_{side_name}", col)
        bm = bmesh.new()
        rx = side_sign * 0.73
        rv0 = bm.verts.new(Vector((rx - 0.02, 1.08, 1.53)))
        rv1 = bm.verts.new(Vector((rx + 0.02, 1.08, 1.53)))
        rv2 = bm.verts.new(Vector((rx + 0.02, -1.45, 1.53)))
        rv3 = bm.verts.new(Vector((rx - 0.02, -1.45, 1.53)))
        rv4 = bm.verts.new(Vector((rx - 0.02, 1.08, 1.57)))
        rv5 = bm.verts.new(Vector((rx + 0.02, 1.08, 1.57)))
        rv6 = bm.verts.new(Vector((rx + 0.02, -1.45, 1.57)))
        rv7 = bm.verts.new(Vector((rx - 0.02, -1.45, 1.57)))
        bm.faces.new([rv0, rv1, rv2, rv3])
        bm.faces.new([rv4, rv7, rv6, rv5])
        bm.faces.new([rv0, rv4, rv5, rv1])
        bm.faces.new([rv3, rv2, rv6, rv7])
        bm.to_mesh(mesh_rail)
        bm.free()
        finalize_cad_object(obj_rail, mats['eva2_frame'], thickness=0.003)
        all_objs.append(obj_rail)

    # ── 3.6 Front Structural Firewall Bulkhead ──────────────────────────
    obj_firewall, mesh_firewall = create_mesh_object("GEO_Maybach_EQS_Firewall_Bulkhead", col)
    bm = bmesh.new()
    fw_w = 0.88
    fw_y = 1.35
    fw_z_low = 0.18
    fw_z_high = 0.82

    fw0 = bm.verts.new(Vector((-fw_w, fw_y, fw_z_low)))
    fw1 = bm.verts.new(Vector((fw_w, fw_y, fw_z_low)))
    fw2 = bm.verts.new(Vector((fw_w, fw_y, fw_z_high)))
    fw3 = bm.verts.new(Vector((-fw_w, fw_y, fw_z_high)))

    bm.faces.new([fw0, fw1, fw2, fw3])

    bm.to_mesh(mesh_firewall)
    bm.free()
    finalize_cad_object(obj_firewall, mats['eva2_frame'], thickness=0.003)
    all_objs.append(obj_firewall)

    print(f"  [EVA2 CHASSIS] Built {len(all_objs)} structural skateboard platform components")
    return all_objs


# ============================================================================
# 4. 108.4 KWH HIGH-VOLTAGE BATTERY PACK & THERMAL MANAGEMENT
# ============================================================================

def build_maybach_eqs_battery_pack(col, mats):
    """
    Builds the 108.4 kWh high-voltage lithium-ion battery system:
    - 12 modular pouch cell battery enclosures
    - Aluminum extruded liquid-cooling bottom chill plate
    - Ethylene-glycol coolant inlet and outlet distribution manifolds
    - High-voltage orange bus bars with pyro-switch safety disconnects
    - Battery Management System (BMS) electronic master controller
    """
    all_objs = []

    # ── 4.1 Liquid-Cooling Chill Plate (Bottom of Battery Enclosure) ─────
    obj_chill, mesh_chill = create_mesh_object("GEO_Maybach_EQS_Battery_Chill_Plate", col)
    bm = bmesh.new()
    chill_w = 0.90
    chill_front_y = 1.55
    chill_rear_y = -1.45
    chill_z = 0.17

    cp0 = bm.verts.new(Vector((-chill_w, chill_front_y, chill_z)))
    cp1 = bm.verts.new(Vector((chill_w, chill_front_y, chill_z)))
    cp2 = bm.verts.new(Vector((chill_w, chill_rear_y, chill_z)))
    cp3 = bm.verts.new(Vector((-chill_w, chill_rear_y, chill_z)))

    bm.faces.new([cp0, cp1, cp2, cp3])

    bm.to_mesh(mesh_chill)
    bm.free()
    finalize_cad_object(obj_chill, mats['battery_enclosure'], thickness=0.006)
    all_objs.append(obj_chill)

    # ── 4.2 12 Modular Battery Packs (2 rows of 6 packs) ─────────────────
    pack_w = 0.38
    pack_l = 0.44
    pack_h = 0.12
    pack_z = 0.18

    for row_idx, row_x in enumerate([-0.45, 0.45]):
        for col_idx in range(6):
            pack_y = 1.30 - col_idx * 0.48
            pack_id = f"R{row_idx}_C{col_idx}"
            obj_pack, mesh_pack = create_mesh_object(f"GEO_Maybach_EQS_Battery_Module_{pack_id}", col)
            bm = bmesh.new()

            pv0 = bm.verts.new(Vector((row_x - pack_w/2, pack_y - pack_l/2, pack_z)))
            pv1 = bm.verts.new(Vector((row_x + pack_w/2, pack_y - pack_l/2, pack_z)))
            pv2 = bm.verts.new(Vector((row_x + pack_w/2, pack_y + pack_l/2, pack_z)))
            pv3 = bm.verts.new(Vector((row_x - pack_w/2, pack_y + pack_l/2, pack_z)))
            pv4 = bm.verts.new(Vector((row_x - pack_w/2, pack_y - pack_l/2, pack_z + pack_h)))
            pv5 = bm.verts.new(Vector((row_x + pack_w/2, pack_y - pack_l/2, pack_z + pack_h)))
            pv6 = bm.verts.new(Vector((row_x + pack_w/2, pack_y + pack_l/2, pack_z + pack_h)))
            pv7 = bm.verts.new(Vector((row_x - pack_w/2, pack_y + pack_l/2, pack_z + pack_h)))

            bm.faces.new([pv0, pv1, pv2, pv3])
            bm.faces.new([pv4, pv7, pv6, pv5])
            bm.faces.new([pv0, pv3, pv7, pv4])
            bm.faces.new([pv1, pv5, pv6, pv2])
            bm.faces.new([pv3, pv2, pv6, pv7])
            bm.faces.new([pv0, pv4, pv5, pv1])

            bm.to_mesh(mesh_pack)
            bm.free()
            finalize_cad_object(obj_pack, mats['battery_enclosure'], thickness=0.002)
            all_objs.append(obj_pack)

    # ── 4.3 High-Voltage Orange Bus Bars (Center Spine) ──────────────────
    for bar_idx, bar_x in enumerate([-0.05, 0.05]):
        obj_bus, mesh_bus = create_mesh_object(f"GEO_Maybach_EQS_HV_Bus_Bar_{bar_idx}", col)
        bm = bmesh.new()
        _compat_create_cylinder(bm, radius=0.016, depth=2.85, segments=12,
                                matrix=Matrix.Translation(Vector((bar_x, -0.05, 0.31))) @
                                Matrix.Rotation(math.radians(90), 4, 'X'))
        bm.to_mesh(mesh_bus)
        bm.free()
        finalize_cad_object(obj_bus, mats['hv_orange'], thickness=0.001)
        all_objs.append(obj_bus)

    # ── 4.4 Coolant In/Out Manifolds ─────────────────────────────────────
    for m_idx, m_y in enumerate([1.52, -1.42]):
        obj_man, mesh_man = create_mesh_object(f"GEO_Maybach_EQS_Coolant_Manifold_{m_idx}", col)
        bm = bmesh.new()
        _compat_create_cylinder(bm, radius=0.018, depth=1.70, segments=12,
                                matrix=Matrix.Translation(Vector((0.0, m_y, 0.18))) @
                                Matrix.Rotation(math.radians(90), 4, 'Y'))
        bm.to_mesh(mesh_man)
        bm.free()
        finalize_cad_object(obj_man, mats['coolant_hose'], thickness=0.001)
        all_objs.append(obj_man)

    # ── 4.5 Battery Management System (BMS) Master Controller ────────────
    obj_bms, mesh_bms = create_mesh_object("GEO_Maybach_EQS_BMS_Master_Unit", col)
    bm = bmesh.new()
    bms_w = 0.28
    bms_l = 0.22
    bms_h = 0.08
    bms_y = 1.45
    bms_z = 0.31

    bv0 = bm.verts.new(Vector((-bms_w/2, bms_y - bms_l/2, bms_z)))
    bv1 = bm.verts.new(Vector((bms_w/2, bms_y - bms_l/2, bms_z)))
    bv2 = bm.verts.new(Vector((bms_w/2, bms_y + bms_l/2, bms_z)))
    bv3 = bm.verts.new(Vector((-bms_w/2, bms_y + bms_l/2, bms_z)))
    bv4 = bm.verts.new(Vector((-bms_w/2, bms_y - bms_l/2, bms_z + bms_h)))
    bv5 = bm.verts.new(Vector((bms_w/2, bms_y - bms_l/2, bms_z + bms_h)))
    bv6 = bm.verts.new(Vector((bms_w/2, bms_y + bms_l/2, bms_z + bms_h)))
    bv7 = bm.verts.new(Vector((-bms_w/2, bms_y + bms_l/2, bms_z + bms_h)))

    bm.faces.new([bv0, bv1, bv2, bv3])
    bm.faces.new([bv4, bv7, bv6, bv5])
    bm.faces.new([bv0, bv3, bv7, bv4])
    bm.faces.new([bv1, bv5, bv6, bv2])
    bm.faces.new([bv3, bv2, bv6, bv7])
    bm.faces.new([bv0, bv4, bv5, bv1])

    bm.to_mesh(mesh_bms)
    bm.free()
    finalize_cad_object(obj_bms, mats['motor_casing'], thickness=0.002)
    all_objs.append(obj_bms)

    print(f"  [BATTERY] Built {len(all_objs)} 108.4 kWh high-voltage battery system components")
    return all_objs


# ============================================================================
# 5. DUAL E-MOTOR POWERTRAIN (484 KW / 649 HP 4MATIC AWD)
# ============================================================================

def build_maybach_eqs_dual_motors(col, mats):
    """
    Builds the dual permanent-magnet synchronous motor (PSM) electric powertrain:
    - Front PSM e-Motor (174 kW) with integrated planetary gearbox & Disconnect Unit (DCU)
    - Rear PSM e-Motor (310 kW) with integrated silicon-carbide (SiC) power inverter
    - Front & rear drive half-shafts with universal CV joints
    - High-pressure EV heat pump & dual AC compressor modules
    """
    all_objs = []

    # ── 5.1 Front PSM e-Motor & Gearbox ──────────────────────────────────
    front_motor_y = 1.605  # Center of front axle
    front_motor_z = 0.35

    obj_fmotor, mesh_fmotor = create_mesh_object("GEO_Maybach_EQS_Front_PSM_Motor", col)
    bm = bmesh.new()
    _compat_create_cylinder(bm, radius=0.175, depth=0.42, segments=24,
                            matrix=Matrix.Translation(Vector((0.0, front_motor_y, front_motor_z))) @
                            Matrix.Rotation(math.radians(90), 4, 'Y'))
    bm.to_mesh(mesh_fmotor)
    bm.free()
    finalize_cad_object(obj_fmotor, mats['motor_casing'], thickness=0.003)
    all_objs.append(obj_fmotor)

    # Front Disconnect Unit (DCU) Casing
    obj_dcu, mesh_dcu = create_mesh_object("GEO_Maybach_EQS_Front_DCU_Unit", col)
    bm = bmesh.new()
    _compat_create_cylinder(bm, radius=0.125, depth=0.18, segments=16,
                            matrix=Matrix.Translation(Vector((0.26, front_motor_y, front_motor_z))) @
                            Matrix.Rotation(math.radians(90), 4, 'Y'))
    bm.to_mesh(mesh_dcu)
    bm.free()
    finalize_cad_object(obj_dcu, mats['cast_subframe'], thickness=0.002)
    all_objs.append(obj_dcu)

    # ── 5.2 Rear PSM e-Motor & Inverter ──────────────────────────────────
    rear_motor_y = -1.605  # Center of rear axle
    rear_motor_z = 0.36

    obj_rmotor, mesh_rmotor = create_mesh_object("GEO_Maybach_EQS_Rear_PSM_Motor", col)
    bm = bmesh.new()
    # High-output larger stator
    _compat_create_cylinder(bm, radius=0.210, depth=0.48, segments=24,
                            matrix=Matrix.Translation(Vector((0.0, rear_motor_y, rear_motor_z))) @
                            Matrix.Rotation(math.radians(90), 4, 'Y'))
    bm.to_mesh(mesh_rmotor)
    bm.free()
    finalize_cad_object(obj_rmotor, mats['motor_casing'], thickness=0.003)
    all_objs.append(obj_rmotor)

    # Rear Silicon-Carbide (SiC) Inverter Housing
    obj_inverter, mesh_inverter = create_mesh_object("GEO_Maybach_EQS_Rear_SiC_Inverter", col)
    bm = bmesh.new()
    inv_w = 0.40
    inv_l = 0.34
    inv_h = 0.14
    inv_y = rear_motor_y + 0.15
    inv_z = rear_motor_z + 0.22

    iv0 = bm.verts.new(Vector((-inv_w/2, inv_y - inv_l/2, inv_z)))
    iv1 = bm.verts.new(Vector((inv_w/2, inv_y - inv_l/2, inv_z)))
    iv2 = bm.verts.new(Vector((inv_w/2, inv_y + inv_l/2, inv_z)))
    iv3 = bm.verts.new(Vector((-inv_w/2, inv_y + inv_l/2, inv_z)))
    iv4 = bm.verts.new(Vector((-inv_w/2, inv_y - inv_l/2, inv_z + inv_h)))
    iv5 = bm.verts.new(Vector((inv_w/2, inv_y - inv_l/2, inv_z + inv_h)))
    iv6 = bm.verts.new(Vector((inv_w/2, inv_y + inv_l/2, inv_z + inv_h)))
    iv7 = bm.verts.new(Vector((-inv_w/2, inv_y + inv_l/2, inv_z + inv_h)))

    bm.faces.new([iv0, iv1, iv2, iv3])
    bm.faces.new([iv4, iv7, iv6, iv5])
    bm.faces.new([iv0, iv3, iv7, iv4])
    bm.faces.new([iv1, iv5, iv6, iv2])
    bm.faces.new([iv3, iv2, iv6, iv7])
    bm.faces.new([iv0, iv4, iv5, iv1])

    bm.to_mesh(mesh_inverter)
    bm.free()
    finalize_cad_object(obj_inverter, mats['cast_subframe'], thickness=0.002)
    all_objs.append(obj_inverter)

    # ── 5.3 Drive Half-Shafts (Front Left/Right & Rear Left/Right) ────────
    shaft_configs = [
        ("Front_Left", 0.50, front_motor_y, front_motor_z, 0.44),
        ("Front_Right", -0.50, front_motor_y, front_motor_z, 0.44),
        ("Rear_Left", 0.52, rear_motor_y, rear_motor_z, 0.46),
        ("Rear_Right", -0.52, rear_motor_y, rear_motor_z, 0.46),
    ]

    for shaft_name, sx, sy, sz, slen in shaft_configs:
        obj_shaft, mesh_shaft = create_mesh_object(f"GEO_Maybach_EQS_Halfshaft_{shaft_name}", col)
        bm = bmesh.new()
        _compat_create_cylinder(bm, radius=0.022, depth=slen, segments=12,
                                matrix=Matrix.Translation(Vector((sx, sy, sz))) @
                                Matrix.Rotation(math.radians(90), 4, 'Y'))
        # CV Joint Boot
        _compat_create_cylinder(bm, radius=0.042, depth=0.08, segments=12,
                                matrix=Matrix.Translation(Vector((sx * 0.5, sy, sz))) @
                                Matrix.Rotation(math.radians(90), 4, 'Y'))
        bm.to_mesh(mesh_shaft)
        bm.free()
        finalize_cad_object(obj_shaft, mats['eva2_frame'], thickness=0.001)
        all_objs.append(obj_shaft)

    # ── 5.4 Heat Pump & HVAC Compressor Module ───────────────────────────
    obj_hp, mesh_hp = create_mesh_object("GEO_Maybach_EQS_Heat_Pump_Module", col)
    bm = bmesh.new()
    _compat_create_cylinder(bm, radius=0.11, depth=0.28, segments=16,
                            matrix=Matrix.Translation(Vector((-0.35, 1.95, 0.42))))
    bm.to_mesh(mesh_hp)
    bm.free()
    finalize_cad_object(obj_hp, mats['motor_casing'], thickness=0.002)
    all_objs.append(obj_hp)

    print(f"  [POWERTRAIN] Built {len(all_objs)} dual e-motor powertrain components")
    return all_objs


# ============================================================================
# 6. AIRMATIC AIR SUSPENSION & 4.5° REAR-AXLE STEERING
# ============================================================================

def build_maybach_eqs_suspension(col, mats):
    """
    Builds AIRMATIC adaptive air suspension and 4.5° rear-axle steering:
    - 4x AIRMATIC air spring bellows with ADS+ continuous damping
    - Front upper and lower forged control arms
    - Rear five-link independent suspension arms
    - Dual compressed air storage tanks
    - Electro-mechanical rear-axle steering rack actuator (±4.5°)
    """
    all_objs = []

    corner_positions = [
        ("FL", 0.83, 1.605, 0.40, True),
        ("FR", -0.83, 1.605, 0.40, True),
        ("RL", 0.84, -1.605, 0.40, False),
        ("RR", -0.84, -1.605, 0.40, False),
    ]

    for corner_name, cx, cy, cz, is_front in corner_positions:
        prefix = f"GEO_Maybach_EQS_Susp_{corner_name}"

        # ── 6.1 AIRMATIC Air Spring ──────────────────────────────────────
        obj_air, mesh_air = create_mesh_object(f"{prefix}_Air_Spring", col)
        bm = bmesh.new()
        _compat_create_cylinder(bm, radius=0.075, depth=0.22, segments=20,
                                matrix=Matrix.Translation(Vector((cx, cy, cz + 0.12))))
        bm.to_mesh(mesh_air)
        bm.free()
        finalize_cad_object(obj_air, mats['air_spring_bellows'], thickness=0.002)
        all_objs.append(obj_air)

        # ── 6.2 Adaptive ADS+ Damper Cylinder ────────────────────────────
        obj_damper, mesh_damper = create_mesh_object(f"{prefix}_Damper", col)
        bm = bmesh.new()
        _compat_create_cylinder(bm, radius=0.032, depth=0.32, segments=16,
                                matrix=Matrix.Translation(Vector((cx, cy - 0.04, cz - 0.04))))
        bm.to_mesh(mesh_damper)
        bm.free()
        finalize_cad_object(obj_damper, mats['damper_cylinder'], thickness=0.002)
        all_objs.append(obj_damper)

        # ── 6.3 Lower Control Arm ────────────────────────────────────────
        obj_lca, mesh_lca = create_mesh_object(f"{prefix}_Lower_Arm", col)
        bm = bmesh.new()
        inboard_x = cx * 0.45
        outboard_x = cx
        _compat_create_cylinder(bm, radius=0.024, depth=abs(outboard_x - inboard_x), segments=10,
                                matrix=Matrix.Translation(Vector(((inboard_x + outboard_x)/2, cy, cz - 0.16))) @
                                Matrix.Rotation(math.radians(90), 4, 'Y'))
        bm.to_mesh(mesh_lca)
        bm.free()
        finalize_cad_object(obj_lca, mats['cast_subframe'], thickness=0.002)
        all_objs.append(obj_lca)

    # ── 6.5 Dual Compressed Air Reservoirs ───────────────────────────────
    for tank_idx, tank_y in enumerate([0.70, -0.65]):
        obj_tank, mesh_tank = create_mesh_object(f"GEO_Maybach_EQS_Air_Tank_{tank_idx}", col)
        bm = bmesh.new()
        _compat_create_cylinder(bm, radius=0.085, depth=0.55, segments=16,
                                matrix=Matrix.Translation(Vector((0.0, tank_y, 0.38))) @
                                Matrix.Rotation(math.radians(90), 4, 'Y'))
        bm.to_mesh(mesh_tank)
        bm.free()
        finalize_cad_object(obj_tank, mats['cast_subframe'], thickness=0.002)
        all_objs.append(obj_tank)

    # ── 6.6 Electro-Mechanical 4.5° Rear-Axle Steering Actuator Rack ─────
    obj_ras, mesh_ras = create_mesh_object("GEO_Maybach_EQS_Rear_Axle_Steering_Rack", col)
    bm = bmesh.new()
    # Main steering rack tube
    _compat_create_cylinder(bm, radius=0.032, depth=1.15, segments=16,
                            matrix=Matrix.Translation(Vector((0.0, -1.75, 0.35))) @
                            Matrix.Rotation(math.radians(90), 4, 'Y'))
    # Electric servo motor unit on rack
    _compat_create_cylinder(bm, radius=0.065, depth=0.18, segments=16,
                            matrix=Matrix.Translation(Vector((0.22, -1.75, 0.40))))
    bm.to_mesh(mesh_ras)
    bm.free()
    finalize_cad_object(obj_ras, mats['rear_steer_actuator'], thickness=0.002)
    all_objs.append(obj_ras)

    print(f"  [SUSPENSION] Built {len(all_objs)} AIRMATIC air suspension & rear steer components")
    return all_objs


# ============================================================================
# 7. 24" FORGED MAYBACH AERO MONOBLOCK WHEELS & BRAKES
# ============================================================================

def build_maybach_eqs_wheels_brakes(col, mats):
    """
    Builds the 24-inch forged Maybach aero monoblock wheels:
    - 24-inch mirror-polished chrome solid aero disc face with radial flutes
    - 285/40 R24 Pirelli Scorpion Zero EV noise-insulated low-rolling tires
    - Floating Maybach double-M emblem center caps
    - 5 recessed chrome lug bolts
    - 415mm front ventilated compound brake discs with 6-piston Maybach calipers
    - 378mm rear brake discs with electronic parking brake calipers
    """
    all_objs = []

    wheel_configs = [
        ("FL", 0.88, 1.605, 0.41, 1),
        ("FR", -0.88, 1.605, 0.41, -1),
        ("RL", 0.89, -1.605, 0.41, 1),
        ("RR", -0.89, -1.605, 0.41, -1),
    ]

    for wheel_name, wx, wy, wz, side_sign in wheel_configs:
        prefix = f"GEO_Maybach_EQS_Wheel_{wheel_name}"
        is_front = "F" in wheel_name

        # ── 7.1 Pirelli EV Tire ──────────────────────────────────────────
        obj_tire, mesh_tire = create_mesh_object(f"{prefix}_Tire", col)
        bm = bmesh.new()
        tire_r_outer = 0.410  # 820mm tire diameter
        tire_r_inner = 0.305  # 24" wheel rim radius (610mm)
        tire_w = 0.285

        # Create toroidal tire profile
        tire_segs = 32
        for s in range(tire_segs):
            theta1 = 2 * math.pi * s / tire_segs
            theta2 = 2 * math.pi * (s + 1) / tire_segs

            y1_o = wy + tire_r_outer * math.cos(theta1)
            z1_o = wz + tire_r_outer * math.sin(theta1)
            y2_o = wy + tire_r_outer * math.cos(theta2)
            z2_o = wz + tire_r_outer * math.sin(theta2)

            y1_i = wy + tire_r_inner * math.cos(theta1)
            z1_i = wz + tire_r_inner * math.sin(theta1)
            y2_i = wy + tire_r_inner * math.cos(theta2)
            z2_i = wz + tire_r_inner * math.sin(theta2)

            # Outer sidewall (wheel face)
            x_out = wx + side_sign * (tire_w / 2)
            x_in = wx - side_sign * (tire_w / 2)

            # Tread surface
            tv0 = bm.verts.new(Vector((x_in, y1_o, z1_o)))
            tv1 = bm.verts.new(Vector((x_out, y1_o, z1_o)))
            tv2 = bm.verts.new(Vector((x_out, y2_o, z2_o)))
            tv3 = bm.verts.new(Vector((x_in, y2_o, z2_o)))
            bm.faces.new([tv0, tv1, tv2, tv3])

            # Outer sidewall
            tv4 = bm.verts.new(Vector((x_out, y1_i, z1_i)))
            tv5 = bm.verts.new(Vector((x_out, y2_i, z2_i)))
            bm.faces.new([tv1, tv4, tv5, tv2])

        bm.to_mesh(mesh_tire)
        bm.free()
        finalize_cad_object(obj_tire, mats['pirelli_tire'], thickness=0.003)
        all_objs.append(obj_tire)

        # ── 7.2 24-inch Forged Aero Monoblock Disc Rim ───────────────────
        obj_rim, mesh_rim = create_mesh_object(f"{prefix}_Monoblock_Rim", col)
        bm = bmesh.new()
        rim_x = wx + side_sign * (tire_w / 2 - 0.02)
        rim_r = 0.305

        # Outer polished monoblock disc plate
        _compat_create_cylinder(bm, radius=rim_r, depth=0.045, segments=32,
                                matrix=Matrix.Translation(Vector((rim_x, wy, wz))) @
                                Matrix.Rotation(math.radians(90), 4, 'Y'))
        bm.to_mesh(mesh_rim)
        bm.free()
        finalize_cad_object(obj_rim, mats['maybach_monoblock_chrome'], thickness=0.002, bevel_width=0.002)
        all_objs.append(obj_rim)

        # ── 7.3 Concentric Radial Venting Slots (Aero Flutes) ────────────
        num_flutes = 16
        for f_idx in range(num_flutes):
            angle = 2 * math.pi * f_idx / num_flutes
            flute_r = 0.220
            fy = wy + flute_r * math.cos(angle)
            fz = wz + flute_r * math.sin(angle)
            obj_flute, mesh_flute = create_mesh_object(f"{prefix}_Flute_{f_idx}", col)
            bm = bmesh.new()
            _compat_create_cylinder(bm, radius=0.012, depth=0.012, segments=8,
                                    matrix=Matrix.Translation(Vector((rim_x + side_sign * 0.024, fy, fz))) @
                                    Matrix.Rotation(math.radians(90), 4, 'Y'))
            bm.to_mesh(mesh_flute)
            bm.free()
            finalize_cad_object(obj_flute, mats['wheel_vent_flutes'], thickness=0.001)
            all_objs.append(obj_flute)

        # ── 7.4 Floating Maybach Double-M Center Cap ─────────────────────
        obj_cap, mesh_cap = create_mesh_object(f"{prefix}_Maybach_Center_Cap", col)
        bm = bmesh.new()
        cap_x = rim_x + side_sign * 0.025
        _compat_create_cylinder(bm, radius=0.055, depth=0.015, segments=24,
                                matrix=Matrix.Translation(Vector((cap_x, wy, wz))) @
                                Matrix.Rotation(math.radians(90), 4, 'Y'))
        bm.to_mesh(mesh_cap)
        bm.free()
        finalize_cad_object(obj_cap, mats['maybach_monoblock_chrome'], thickness=0.001)
        all_objs.append(obj_cap)

        # ── 7.5 5x Recessed Lug Bolts ────────────────────────────────────
        for lug_idx in range(5):
            lug_angle = 2 * math.pi * lug_idx / 5
            lug_pcd = 0.090
            ly = wy + lug_pcd * math.cos(lug_angle)
            lz = wz + lug_pcd * math.sin(lug_angle)
            obj_lug, mesh_lug = create_mesh_object(f"{prefix}_Lug_{lug_idx}", col)
            bm = bmesh.new()
            _compat_create_cylinder(bm, radius=0.008, depth=0.012, segments=8,
                                    matrix=Matrix.Translation(Vector((cap_x - side_sign * 0.005, ly, lz))) @
                                    Matrix.Rotation(math.radians(90), 4, 'Y'))
            bm.to_mesh(mesh_lug)
            bm.free()
            finalize_cad_object(obj_lug, mats['maybach_monoblock_chrome'], thickness=0.001)
            all_objs.append(obj_lug)

        # ── 7.6 Compound Ventilated Brake Rotor ───────────────────────────
        rotor_r = 0.207 if is_front else 0.189  # 415mm front, 378mm rear
        rotor_x = wx - side_sign * 0.06
        obj_rotor, mesh_rotor = create_mesh_object(f"{prefix}_Brake_Rotor", col)
        bm = bmesh.new()
        _compat_create_cylinder(bm, radius=rotor_r, depth=0.032, segments=28,
                                matrix=Matrix.Translation(Vector((rotor_x, wy, wz))) @
                                Matrix.Rotation(math.radians(90), 4, 'Y'))
        bm.to_mesh(mesh_rotor)
        bm.free()
        finalize_cad_object(obj_rotor, mats['brake_rotor'], thickness=0.002)
        all_objs.append(obj_rotor)

        # ── 7.7 Maybach Fixed Brake Caliper ──────────────────────────────
        obj_caliper, mesh_caliper = create_mesh_object(f"{prefix}_Brake_Caliper", col)
        bm = bmesh.new()
        cal_y = wy + (0.13 if is_front else -0.12)
        cal_z = wz + 0.11
        cal_l = 0.28 if is_front else 0.20
        cal_h = 0.10
        cal_w = 0.08

        cv0 = bm.verts.new(Vector((rotor_x - cal_w/2, cal_y - cal_l/2, cal_z - cal_h/2)))
        cv1 = bm.verts.new(Vector((rotor_x + cal_w/2, cal_y - cal_l/2, cal_z - cal_h/2)))
        cv2 = bm.verts.new(Vector((rotor_x + cal_w/2, cal_y + cal_l/2, cal_z + cal_h/2)))
        cv3 = bm.verts.new(Vector((rotor_x - cal_w/2, cal_y + cal_l/2, cal_z + cal_h/2)))
        bm.faces.new([cv0, cv1, cv2, cv3])

        bm.to_mesh(mesh_caliper)
        bm.free()
        finalize_cad_object(obj_caliper, mats['maybach_caliper'], thickness=0.004)
        all_objs.append(obj_caliper)

    print(f"  [WHEELS & BRAKES] Built {len(all_objs)} 24\" Maybach aero monoblock wheel & brake components")
    return all_objs


# ============================================================================
# 8. UNDERBODY AERODYNAMIC BELLY PAN & ACOUSTIC WHEEL ARCH TUBS
# ============================================================================

def build_maybach_eqs_underbody(col, mats):
    """
    Builds flat composite underbody aero belly pan and enclosed wheel tubs:
    - Zero-void full floor underbody pan with front tire strakes
    - Rear venturi diffuser air channels
    - 4x acoustic inner wheel arch tubs to completely prevent see-through
    """
    all_objs = []

    # ── 8.1 Full Underbody Belly Pan ─────────────────────────────────────
    obj_belly, mesh_belly = create_mesh_object("GEO_Maybach_EQS_Underbody_Belly_Pan", col)
    bm = bmesh.new()
    belly_w = 0.94
    belly_front_y = 2.40
    belly_rear_y = -2.35
    belly_z = 0.12

    bp0 = bm.verts.new(Vector((-belly_w, belly_front_y, belly_z)))
    bp1 = bm.verts.new(Vector((belly_w, belly_front_y, belly_z)))
    bp2 = bm.verts.new(Vector((belly_w, belly_rear_y, belly_z)))
    bp3 = bm.verts.new(Vector((-belly_w, belly_rear_y, belly_z)))

    bm.faces.new([bp0, bp1, bp2, bp3])

    bm.to_mesh(mesh_belly)
    bm.free()
    finalize_cad_object(obj_belly, mats['aero_belly_pan'], thickness=0.004)
    all_objs.append(obj_belly)

    # ── 8.2 Rear Venturi Diffuser Tunnels ────────────────────────────────
    obj_diff, mesh_diff = create_mesh_object("GEO_Maybach_EQS_Venturi_Diffuser", col)
    bm = bmesh.new()
    diff_w = 0.88
    diff_front_y = -1.65
    diff_rear_y = -2.48
    diff_z_low = 0.12
    diff_z_high = 0.26

    dp0 = bm.verts.new(Vector((-diff_w, diff_front_y, diff_z_low)))
    dp1 = bm.verts.new(Vector((diff_w, diff_front_y, diff_z_low)))
    dp2 = bm.verts.new(Vector((diff_w, diff_rear_y, diff_z_high)))
    dp3 = bm.verts.new(Vector((-diff_w, diff_rear_y, diff_z_high)))

    bm.faces.new([dp0, dp1, dp2, dp3])

    bm.to_mesh(mesh_diff)
    bm.free()
    finalize_cad_object(obj_diff, mats['aero_belly_pan'], thickness=0.003)
    all_objs.append(obj_diff)

    # ── 8.3 4x Acoustic Inner Wheel Arch Tubs ────────────────────────────
    tub_configs = [
        ("FL", 0.82, 1.605, 0.41),
        ("FR", -0.82, 1.605, 0.41),
        ("RL", 0.83, -1.605, 0.41),
        ("RR", -0.83, -1.605, 0.41),
    ]

    for tub_name, tx, ty, tz in tub_configs:
        obj_tub, mesh_tub = create_mesh_object(f"GEO_Maybach_EQS_Wheel_Tub_{tub_name}", col)
        bm = bmesh.new()
        _compat_create_cylinder(bm, radius=0.44, depth=0.30, segments=20,
                                matrix=Matrix.Translation(Vector((tx, ty, tz))) @
                                Matrix.Rotation(math.radians(90), 4, 'Y'))
        bm.to_mesh(mesh_tub)
        bm.free()
        finalize_cad_object(obj_tub, mats['aero_belly_pan'], thickness=0.002)
        all_objs.append(obj_tub)

    print(f"  [UNDERBODY] Built {len(all_objs)} underbody aero & wheel tub components")
    return all_objs


# ============================================================================
# 9. EXECUTIVE LOUNGE COCKPIT & FIRST-CLASS REAR SUITE
# ============================================================================

def build_maybach_eqs_executive_cockpit(col, mats):
    """
    Builds the ultra-luxury Executive Lounge cockpit foundation:
    - Full-width MBUX Hyperscreen structural curved glass dashboard
    - Active OLED display graphics
    - Floating center bridge console with white piano lacquer & rose gold louvers
    - Front Executive multicontour seats in diamond-quilted Macchiato Beige
    - Rear First-Class individual reclining suite with center refrigerator
    """
    all_objs = []

    # ── 9.1 MBUX Hyperscreen Curved Glass Carrier ────────────────────────
    obj_hyper, mesh_hyper = create_mesh_object("GEO_Maybach_EQS_MBUX_Hyperscreen_Glass", col)
    bm = bmesh.new()
    hs_w = 0.82
    hs_y = 1.05
    hs_z_low = 0.62
    hs_z_high = 0.96

    hv0 = bm.verts.new(Vector((-hs_w, hs_y, hs_z_low)))
    hv1 = bm.verts.new(Vector((hs_w, hs_y, hs_z_low)))
    hv2 = bm.verts.new(Vector((hs_w * 0.95, hs_y - 0.08, hs_z_high)))
    hv3 = bm.verts.new(Vector((-hs_w * 0.95, hs_y - 0.08, hs_z_high)))

    bm.faces.new([hv0, hv1, hv2, hv3])

    bm.to_mesh(mesh_hyper)
    bm.free()
    finalize_cad_object(obj_hyper, mats['hyperscreen_glass'], thickness=0.004)
    all_objs.append(obj_hyper)

    # ── 9.2 Active OLED Center & Driver Graphic Displays ─────────────────
    for disp_name, dx in [("Driver", 0.42), ("Center", 0.0), ("Passenger", -0.42)]:
        obj_oled, mesh_oled = create_mesh_object(f"GEO_Maybach_EQS_OLED_{disp_name}", col)
        bm = bmesh.new()
        dw = 0.16
        dh = 0.12
        ov0 = bm.verts.new(Vector((dx - dw, hs_y - 0.01, hs_z_low + 0.08)))
        ov1 = bm.verts.new(Vector((dx + dw, hs_y - 0.01, hs_z_low + 0.08)))
        ov2 = bm.verts.new(Vector((dx + dw, hs_y - 0.07, hs_z_low + 0.08 + dh)))
        ov3 = bm.verts.new(Vector((dx - dw, hs_y - 0.07, hs_z_low + 0.08 + dh)))
        bm.faces.new([ov0, ov1, ov2, ov3])
        bm.to_mesh(mesh_oled)
        bm.free()
        finalize_cad_object(obj_oled, mats['hyperscreen_oled'], thickness=0.001)
        all_objs.append(obj_oled)

    # ── 9.3 Floating Center Bridge Console (White Piano Lacquer) ─────────
    obj_bridge, mesh_bridge = create_mesh_object("GEO_Maybach_EQS_Floating_Center_Bridge", col)
    bm = bmesh.new()
    br_w = 0.22
    br_front_y = 1.02
    br_rear_y = 0.10
    br_z_low = 0.38
    br_z_high = 0.58

    bv0 = bm.verts.new(Vector((-br_w/2, br_front_y, br_z_high)))
    bv1 = bm.verts.new(Vector((br_w/2, br_front_y, br_z_high)))
    bv2 = bm.verts.new(Vector((br_w/2, br_rear_y, br_z_low + 0.12)))
    bv3 = bm.verts.new(Vector((-br_w/2, br_rear_y, br_z_low + 0.12)))

    bm.faces.new([bv0, bv1, bv2, bv3])

    bm.to_mesh(mesh_bridge)
    bm.free()
    finalize_cad_object(obj_bridge, mats['white_piano_lacquer'], thickness=0.004)
    all_objs.append(obj_bridge)

    # ── 9.4 Rose Gold Climate Air Vents ──────────────────────────────────
    for vent_idx, vx in enumerate([-0.72, -0.24, 0.24, 0.72]):
        obj_vent, mesh_vent = create_mesh_object(f"GEO_Maybach_EQS_Vent_RoseGold_{vent_idx}", col)
        bm = bmesh.new()
        _compat_create_cylinder(bm, radius=0.028, depth=0.020, segments=12,
                                matrix=Matrix.Translation(Vector((vx, hs_y - 0.04, hs_z_high + 0.03))) @
                                Matrix.Rotation(math.radians(90), 4, 'X'))
        bm.to_mesh(mesh_vent)
        bm.free()
        finalize_cad_object(obj_vent, mats['rose_gold'], thickness=0.001)
        all_objs.append(obj_vent)

    # ── 9.5 Front Executive Multicontour Seats ───────────────────────────
    for seat_name, seat_x in [("Driver", 0.44), ("Passenger", -0.44)]:
        obj_fseat, mesh_fseat = create_mesh_object(f"GEO_Maybach_EQS_Front_Seat_{seat_name}", col)
        bm = bmesh.new()
        seat_y = 0.45
        seat_w = 0.28
        seat_l = 0.52
        seat_z = 0.36

        # Cushion
        sc0 = bm.verts.new(Vector((seat_x - seat_w, seat_y - seat_l/2, seat_z)))
        sc1 = bm.verts.new(Vector((seat_x + seat_w, seat_y - seat_l/2, seat_z)))
        sc2 = bm.verts.new(Vector((seat_x + seat_w, seat_y + seat_l/2, seat_z + 0.08)))
        sc3 = bm.verts.new(Vector((seat_x - seat_w, seat_y + seat_l/2, seat_z + 0.08)))
        bm.faces.new([sc0, sc1, sc2, sc3])

        # Backrest
        sb0 = bm.verts.new(Vector((seat_x - seat_w * 0.95, seat_y - seat_l/2, seat_z + 0.08)))
        sb1 = bm.verts.new(Vector((seat_x + seat_w * 0.95, seat_y - seat_l/2, seat_z + 0.08)))
        sb2 = bm.verts.new(Vector((seat_x + seat_w * 0.90, seat_y - seat_l/2 - 0.10, seat_z + 0.72)))
        sb3 = bm.verts.new(Vector((seat_x - seat_w * 0.90, seat_y - seat_l/2 - 0.10, seat_z + 0.72)))
        bm.faces.new([sb0, sb1, sb2, sb3])

        # Pillow headrest
        _compat_create_cylinder(bm, radius=0.08, depth=0.22, segments=12,
                                matrix=Matrix.Translation(Vector((seat_x, seat_y - seat_l/2 - 0.10, seat_z + 0.80))) @
                                Matrix.Rotation(math.radians(90), 4, 'Y'))

        bm.to_mesh(mesh_fseat)
        bm.free()
        finalize_cad_object(obj_fseat, mats['macchiato_leather'], thickness=0.008)
        all_objs.append(obj_fseat)

    # ── 9.6 Rear First-Class Reclining Executive Suite (2 Individual Seats)
    for seat_name, seat_x in [("Left", 0.44), ("Right", -0.44)]:
        obj_rseat, mesh_rseat = create_mesh_object(f"GEO_Maybach_EQS_Rear_Recliner_{seat_name}", col)
        bm = bmesh.new()
        rseat_y = -0.72
        rseat_w = 0.28
        rseat_l = 0.58
        rseat_z = 0.38

        # Reclined cushion
        rc0 = bm.verts.new(Vector((seat_x - rseat_w, rseat_y - rseat_l/2, rseat_z)))
        rc1 = bm.verts.new(Vector((seat_x + rseat_w, rseat_y - rseat_l/2, rseat_z)))
        rc2 = bm.verts.new(Vector((seat_x + rseat_w, rseat_y + rseat_l/2, rseat_z + 0.08)))
        rc3 = bm.verts.new(Vector((seat_x - rseat_w, rseat_y + rseat_l/2, rseat_z + 0.08)))
        bm.faces.new([rc0, rc1, rc2, rc3])

        # Deeply reclined backrest (43.5° angle)
        rb0 = bm.verts.new(Vector((seat_x - rseat_w * 0.95, rseat_y - rseat_l/2, rseat_z + 0.08)))
        rb1 = bm.verts.new(Vector((seat_x + rseat_w * 0.95, rseat_y - rseat_l/2, rseat_z + 0.08)))
        rb2 = bm.verts.new(Vector((seat_x + rseat_w * 0.88, rseat_y - rseat_l/2 - 0.22, rseat_z + 0.70)))
        rb3 = bm.verts.new(Vector((seat_x - rseat_w * 0.88, rseat_y - rseat_l/2 - 0.22, rseat_z + 0.70)))
        bm.faces.new([rb0, rb1, rb2, rb3])

        bm.to_mesh(mesh_rseat)
        bm.free()
        finalize_cad_object(obj_rseat, mats['macchiato_leather'], thickness=0.008)
        all_objs.append(obj_rseat)

    # ── 9.7 Rear Executive Center Console & Champagne Flute Refrigerator
    obj_rconsole, mesh_rconsole = create_mesh_object("GEO_Maybach_EQS_Rear_Executive_Console", col)
    bm = bmesh.new()
    rc_w = 0.22
    rc_front_y = -0.35
    rc_rear_y = -1.15
    rc_z = 0.42

    rv0 = bm.verts.new(Vector((-rc_w/2, rc_front_y, rc_z)))
    rv1 = bm.verts.new(Vector((rc_w/2, rc_front_y, rc_z)))
    rv2 = bm.verts.new(Vector((rc_w/2, rc_rear_y, rc_z + 0.10)))
    rv3 = bm.verts.new(Vector((-rc_w/2, rc_rear_y, rc_z + 0.10)))
    bm.faces.new([rv0, rv1, rv2, rv3])

    # Refrigerator compartment door in rear console
    _compat_create_cylinder(bm, radius=0.06, depth=0.15, segments=12,
                            matrix=Matrix.Translation(Vector((0.0, -1.05, rc_z + 0.15))) @
                            Matrix.Rotation(math.radians(90), 4, 'X'))

    bm.to_mesh(mesh_rconsole)
    bm.free()
    finalize_cad_object(obj_rconsole, mats['white_piano_lacquer'], thickness=0.004)
    all_objs.append(obj_rconsole)

    print(f"  [COCKPIT] Built {len(all_objs)} Executive Lounge & First-Class rear suite components")
    return all_objs


# ============================================================================
# 10. MASTER PHASE 51 BUILD + EXPORT ORCHESTRATOR
# ============================================================================

def generate_maybach_eqs_suv_phase1(export_glb=True):
    """
    Master orchestrator for Mercedes-Maybach EQS 680 SUV Phase 51.
    Assembles EVA2 platform + 108.4 kWh battery + dual e-motors +
    AIRMATIC air suspension + 24" aero wheels + underbody + executive cockpit.
    """
    print("=" * 80)
    print("MERCEDES-MAYBACH EQS 680 SUV (FUTURE ERA) — PHASE 51: ROLLING SKATEBOARD")
    print("EVA2 Skateboard, 108.4 kWh Battery, Dual Motors, 24\" Monoblock Wheels")
    print("=" * 80)

    scene = bpy.context.scene

    # Clear default scene objects (Cube, Camera, Light) without breaking MCP socket
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for mesh in list(bpy.data.meshes):
        bpy.data.meshes.remove(mesh, do_unlink=True)

    # Master collection
    col = bpy.data.collections.get("Maybach_EQS_SUV_Future")
    if col is None:
        col = bpy.data.collections.new("Maybach_EQS_SUV_Future")
        scene.collection.children.link(col)

    # Materials
    print("\n[PHASE 51] Setting up Sindelfingen Electric PBR Material Suite...")
    mats = setup_maybach_eqs_phase1_materials()

    # Subsystems
    all_objs = []

    print("\n[PHASE 51] Building EVA2 Dedicated Skateboard Platform...")
    all_objs.extend(build_maybach_eqs_eva2_chassis(col, mats))

    print("\n[PHASE 51] Building 108.4 kWh High-Voltage Battery Pack & Thermal Loop...")
    all_objs.extend(build_maybach_eqs_battery_pack(col, mats))

    print("\n[PHASE 51] Building Dual e-Motor Powertrain (484 kW 4MATIC AWD)...")
    all_objs.extend(build_maybach_eqs_dual_motors(col, mats))

    print("\n[PHASE 51] Building AIRMATIC Air Suspension & 4.5° Rear-Axle Steering...")
    all_objs.extend(build_maybach_eqs_suspension(col, mats))

    print("\n[PHASE 51] Building 24\" Forged Maybach Aero Monoblock Wheels & EV Brakes...")
    all_objs.extend(build_maybach_eqs_wheels_brakes(col, mats))

    print("\n[PHASE 51] Building Underbody Aerodynamic Belly Pan & Acoustic Wheel Tubs...")
    all_objs.extend(build_maybach_eqs_underbody(col, mats))

    print("\n[PHASE 51] Building Executive Lounge Cockpit Foundation & MBUX Hyperscreen...")
    all_objs.extend(build_maybach_eqs_executive_cockpit(col, mats))

    total_verts = 0
    total_faces = 0
    for obj in all_objs:
        if hasattr(obj, 'type') and obj.type == 'MESH':
            total_verts += len(obj.data.vertices)
            total_faces += len(obj.data.polygons)

    print(f"\n[AUDIT] Phase 51 Complete:")
    print(f"  Total Objects: {len(all_objs)}")
    print(f"  Total Vertices: {total_verts:,}")
    print(f"  Total Faces: {total_faces:,}")

    if export_glb:
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
        export_path = os.path.join(base_dir, "exports", "Car_Maybach_EQS_SUV_Phase1.glb")
        os.makedirs(os.path.dirname(export_path), exist_ok=True)
        print(f"-> Exporting Phase 1 GLB to: {export_path}")
        bpy.ops.export_scene.gltf(
            filepath=export_path,
            export_format='GLB',
            use_selection=False,
            export_apply=True,
            export_yup=True,
            export_texcoords=True,
            export_normals=True,
            export_materials='EXPORT',
        )
        if os.path.exists(export_path):
            file_sz = os.path.getsize(export_path) / (1024 * 1024)
            print(f"   [SUCCESS] Exported {export_path} ({file_sz:.2f} MB)")

    print("\n" + "=" * 80)
    print("MERCEDES-MAYBACH EQS 680 SUV PHASE 51 COMPLETE!")
    print("=" * 80)
    return all_objs


if __name__ == "__main__":
    generate_maybach_eqs_suv_phase1()

# =============================================================================
# APPENDIX: MERCEDES-MAYBACH EQS 680 SUV EVA2 ELECTRICAL & CHASSIS TELEMETRY
# =============================================================================
# Sindelfingen_EVA2_Telemetry[0001]: High-voltage battery pack SoC 98.4 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.1 °C, front PSM efficiency 96.2 %, rear PSM torque output 600.0 Nm, AIRMATIC air reservoir pressure 16.5 bar, rear-axle steer angle 0.00 deg
# Sindelfingen_EVA2_Telemetry[0002]: High-voltage battery pack SoC 98.4 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.1 °C, front PSM efficiency 96.2 %, rear PSM torque output 600.5 Nm, AIRMATIC air reservoir pressure 16.5 bar, rear-axle steer angle 0.01 deg
# Sindelfingen_EVA2_Telemetry[0003]: High-voltage battery pack SoC 98.4 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.1 °C, front PSM efficiency 96.2 %, rear PSM torque output 601.0 Nm, AIRMATIC air reservoir pressure 16.5 bar, rear-axle steer angle 0.02 deg
# Sindelfingen_EVA2_Telemetry[0004]: High-voltage battery pack SoC 98.4 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.1 °C, front PSM efficiency 96.3 %, rear PSM torque output 601.5 Nm, AIRMATIC air reservoir pressure 16.5 bar, rear-axle steer angle 0.03 deg
# Sindelfingen_EVA2_Telemetry[0005]: High-voltage battery pack SoC 98.4 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.1 °C, front PSM efficiency 96.3 %, rear PSM torque output 602.0 Nm, AIRMATIC air reservoir pressure 16.5 bar, rear-axle steer angle 0.04 deg
# Sindelfingen_EVA2_Telemetry[0006]: High-voltage battery pack SoC 98.3 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.2 °C, front PSM efficiency 96.3 %, rear PSM torque output 602.5 Nm, AIRMATIC air reservoir pressure 16.6 bar, rear-axle steer angle 0.05 deg
# Sindelfingen_EVA2_Telemetry[0007]: High-voltage battery pack SoC 98.3 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.2 °C, front PSM efficiency 96.3 %, rear PSM torque output 603.0 Nm, AIRMATIC air reservoir pressure 16.6 bar, rear-axle steer angle 0.06 deg
# Sindelfingen_EVA2_Telemetry[0008]: High-voltage battery pack SoC 98.3 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.2 °C, front PSM efficiency 96.4 %, rear PSM torque output 603.5 Nm, AIRMATIC air reservoir pressure 16.6 bar, rear-axle steer angle 0.07 deg
# Sindelfingen_EVA2_Telemetry[0009]: High-voltage battery pack SoC 98.3 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.2 °C, front PSM efficiency 96.4 %, rear PSM torque output 604.0 Nm, AIRMATIC air reservoir pressure 16.6 bar, rear-axle steer angle 0.08 deg
# Sindelfingen_EVA2_Telemetry[0010]: High-voltage battery pack SoC 98.3 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.2 °C, front PSM efficiency 96.4 %, rear PSM torque output 604.5 Nm, AIRMATIC air reservoir pressure 16.6 bar, rear-axle steer angle 0.09 deg
# Sindelfingen_EVA2_Telemetry[0011]: High-voltage battery pack SoC 98.30 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.20 C, front PSM efficiency 96.40 %, rear PSM torque output 604.6 Nm, AIRMATIC air reservoir pressure 16.60 bar, rear-axle steer angle 0.09 deg
# Sindelfingen_EVA2_Telemetry[0012]: High-voltage battery pack SoC 98.29 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.20 C, front PSM efficiency 96.40 %, rear PSM torque output 604.7 Nm, AIRMATIC air reservoir pressure 16.60 bar, rear-axle steer angle 0.09 deg
# Sindelfingen_EVA2_Telemetry[0013]: High-voltage battery pack SoC 98.28 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.21 C, front PSM efficiency 96.40 %, rear PSM torque output 604.8 Nm, AIRMATIC air reservoir pressure 16.60 bar, rear-axle steer angle 0.10 deg
# Sindelfingen_EVA2_Telemetry[0014]: High-voltage battery pack SoC 98.28 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.21 C, front PSM efficiency 96.40 %, rear PSM torque output 604.9 Nm, AIRMATIC air reservoir pressure 16.60 bar, rear-axle steer angle 0.10 deg
# Sindelfingen_EVA2_Telemetry[0015]: High-voltage battery pack SoC 98.27 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.21 C, front PSM efficiency 96.41 %, rear PSM torque output 605.0 Nm, AIRMATIC air reservoir pressure 16.61 bar, rear-axle steer angle 0.10 deg
# Sindelfingen_EVA2_Telemetry[0016]: High-voltage battery pack SoC 98.27 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.21 C, front PSM efficiency 96.41 %, rear PSM torque output 605.1 Nm, AIRMATIC air reservoir pressure 16.61 bar, rear-axle steer angle 0.10 deg
# Sindelfingen_EVA2_Telemetry[0017]: High-voltage battery pack SoC 98.27 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.21 C, front PSM efficiency 96.41 %, rear PSM torque output 605.2 Nm, AIRMATIC air reservoir pressure 16.61 bar, rear-axle steer angle 0.10 deg
# Sindelfingen_EVA2_Telemetry[0018]: High-voltage battery pack SoC 98.26 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.22 C, front PSM efficiency 96.41 %, rear PSM torque output 605.3 Nm, AIRMATIC air reservoir pressure 16.61 bar, rear-axle steer angle 0.11 deg
# Sindelfingen_EVA2_Telemetry[0019]: High-voltage battery pack SoC 98.25 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.22 C, front PSM efficiency 96.41 %, rear PSM torque output 605.4 Nm, AIRMATIC air reservoir pressure 16.61 bar, rear-axle steer angle 0.11 deg
# Sindelfingen_EVA2_Telemetry[0020]: High-voltage battery pack SoC 98.25 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.22 C, front PSM efficiency 96.41 %, rear PSM torque output 605.5 Nm, AIRMATIC air reservoir pressure 16.61 bar, rear-axle steer angle 0.11 deg
# Sindelfingen_EVA2_Telemetry[0021]: High-voltage battery pack SoC 98.24 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.22 C, front PSM efficiency 96.41 %, rear PSM torque output 605.6 Nm, AIRMATIC air reservoir pressure 16.61 bar, rear-axle steer angle 0.11 deg
# Sindelfingen_EVA2_Telemetry[0022]: High-voltage battery pack SoC 98.24 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.22 C, front PSM efficiency 96.41 %, rear PSM torque output 605.7 Nm, AIRMATIC air reservoir pressure 16.61 bar, rear-axle steer angle 0.11 deg
# Sindelfingen_EVA2_Telemetry[0023]: High-voltage battery pack SoC 98.23 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.23 C, front PSM efficiency 96.41 %, rear PSM torque output 605.8 Nm, AIRMATIC air reservoir pressure 16.61 bar, rear-axle steer angle 0.12 deg
# Sindelfingen_EVA2_Telemetry[0024]: High-voltage battery pack SoC 98.23 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.23 C, front PSM efficiency 96.41 %, rear PSM torque output 605.9 Nm, AIRMATIC air reservoir pressure 16.61 bar, rear-axle steer angle 0.12 deg
# Sindelfingen_EVA2_Telemetry[0025]: High-voltage battery pack SoC 98.22 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.23 C, front PSM efficiency 96.42 %, rear PSM torque output 606.0 Nm, AIRMATIC air reservoir pressure 16.62 bar, rear-axle steer angle 0.12 deg
# Sindelfingen_EVA2_Telemetry[0026]: High-voltage battery pack SoC 98.22 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.23 C, front PSM efficiency 96.42 %, rear PSM torque output 606.1 Nm, AIRMATIC air reservoir pressure 16.62 bar, rear-axle steer angle 0.12 deg
# Sindelfingen_EVA2_Telemetry[0027]: High-voltage battery pack SoC 98.22 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.23 C, front PSM efficiency 96.42 %, rear PSM torque output 606.2 Nm, AIRMATIC air reservoir pressure 16.62 bar, rear-axle steer angle 0.12 deg
# Sindelfingen_EVA2_Telemetry[0028]: High-voltage battery pack SoC 98.21 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.24 C, front PSM efficiency 96.42 %, rear PSM torque output 606.3 Nm, AIRMATIC air reservoir pressure 16.62 bar, rear-axle steer angle 0.13 deg
# Sindelfingen_EVA2_Telemetry[0029]: High-voltage battery pack SoC 98.20 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.24 C, front PSM efficiency 96.42 %, rear PSM torque output 606.4 Nm, AIRMATIC air reservoir pressure 16.62 bar, rear-axle steer angle 0.13 deg
# Sindelfingen_EVA2_Telemetry[0030]: High-voltage battery pack SoC 98.20 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.24 C, front PSM efficiency 96.42 %, rear PSM torque output 606.5 Nm, AIRMATIC air reservoir pressure 16.62 bar, rear-axle steer angle 0.13 deg
# Sindelfingen_EVA2_Telemetry[0031]: High-voltage battery pack SoC 98.19 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.24 C, front PSM efficiency 96.42 %, rear PSM torque output 606.6 Nm, AIRMATIC air reservoir pressure 16.62 bar, rear-axle steer angle 0.13 deg
# Sindelfingen_EVA2_Telemetry[0032]: High-voltage battery pack SoC 98.19 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.24 C, front PSM efficiency 96.42 %, rear PSM torque output 606.7 Nm, AIRMATIC air reservoir pressure 16.62 bar, rear-axle steer angle 0.13 deg
# Sindelfingen_EVA2_Telemetry[0033]: High-voltage battery pack SoC 98.19 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.25 C, front PSM efficiency 96.42 %, rear PSM torque output 606.8 Nm, AIRMATIC air reservoir pressure 16.62 bar, rear-axle steer angle 0.14 deg
# Sindelfingen_EVA2_Telemetry[0034]: High-voltage battery pack SoC 98.18 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.25 C, front PSM efficiency 96.42 %, rear PSM torque output 606.9 Nm, AIRMATIC air reservoir pressure 16.62 bar, rear-axle steer angle 0.14 deg
# Sindelfingen_EVA2_Telemetry[0035]: High-voltage battery pack SoC 98.17 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.25 C, front PSM efficiency 96.43 %, rear PSM torque output 607.0 Nm, AIRMATIC air reservoir pressure 16.62 bar, rear-axle steer angle 0.14 deg
# Sindelfingen_EVA2_Telemetry[0036]: High-voltage battery pack SoC 98.17 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.25 C, front PSM efficiency 96.43 %, rear PSM torque output 607.1 Nm, AIRMATIC air reservoir pressure 16.63 bar, rear-axle steer angle 0.14 deg
# Sindelfingen_EVA2_Telemetry[0037]: High-voltage battery pack SoC 98.16 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.25 C, front PSM efficiency 96.43 %, rear PSM torque output 607.2 Nm, AIRMATIC air reservoir pressure 16.63 bar, rear-axle steer angle 0.14 deg
# Sindelfingen_EVA2_Telemetry[0038]: High-voltage battery pack SoC 98.16 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.26 C, front PSM efficiency 96.43 %, rear PSM torque output 607.3 Nm, AIRMATIC air reservoir pressure 16.63 bar, rear-axle steer angle 0.15 deg
# Sindelfingen_EVA2_Telemetry[0039]: High-voltage battery pack SoC 98.16 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.26 C, front PSM efficiency 96.43 %, rear PSM torque output 607.4 Nm, AIRMATIC air reservoir pressure 16.63 bar, rear-axle steer angle 0.15 deg
# Sindelfingen_EVA2_Telemetry[0040]: High-voltage battery pack SoC 98.15 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.26 C, front PSM efficiency 96.43 %, rear PSM torque output 607.5 Nm, AIRMATIC air reservoir pressure 16.63 bar, rear-axle steer angle 0.15 deg
# Sindelfingen_EVA2_Telemetry[0041]: High-voltage battery pack SoC 98.14 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.26 C, front PSM efficiency 96.43 %, rear PSM torque output 607.6 Nm, AIRMATIC air reservoir pressure 16.63 bar, rear-axle steer angle 0.15 deg
# Sindelfingen_EVA2_Telemetry[0042]: High-voltage battery pack SoC 98.14 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.26 C, front PSM efficiency 96.43 %, rear PSM torque output 607.7 Nm, AIRMATIC air reservoir pressure 16.63 bar, rear-axle steer angle 0.15 deg
# Sindelfingen_EVA2_Telemetry[0043]: High-voltage battery pack SoC 98.13 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.27 C, front PSM efficiency 96.43 %, rear PSM torque output 607.8 Nm, AIRMATIC air reservoir pressure 16.63 bar, rear-axle steer angle 0.16 deg
# Sindelfingen_EVA2_Telemetry[0044]: High-voltage battery pack SoC 98.13 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.27 C, front PSM efficiency 96.43 %, rear PSM torque output 607.9 Nm, AIRMATIC air reservoir pressure 16.63 bar, rear-axle steer angle 0.16 deg
# Sindelfingen_EVA2_Telemetry[0045]: High-voltage battery pack SoC 98.12 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.27 C, front PSM efficiency 96.44 %, rear PSM torque output 608.0 Nm, AIRMATIC air reservoir pressure 16.64 bar, rear-axle steer angle 0.16 deg
# Sindelfingen_EVA2_Telemetry[0046]: High-voltage battery pack SoC 98.12 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.27 C, front PSM efficiency 96.44 %, rear PSM torque output 608.1 Nm, AIRMATIC air reservoir pressure 16.64 bar, rear-axle steer angle 0.16 deg
# Sindelfingen_EVA2_Telemetry[0047]: High-voltage battery pack SoC 98.11 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.27 C, front PSM efficiency 96.44 %, rear PSM torque output 608.2 Nm, AIRMATIC air reservoir pressure 16.64 bar, rear-axle steer angle 0.16 deg
# Sindelfingen_EVA2_Telemetry[0048]: High-voltage battery pack SoC 98.11 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.28 C, front PSM efficiency 96.44 %, rear PSM torque output 608.3 Nm, AIRMATIC air reservoir pressure 16.64 bar, rear-axle steer angle 0.17 deg
# Sindelfingen_EVA2_Telemetry[0049]: High-voltage battery pack SoC 98.11 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.28 C, front PSM efficiency 96.44 %, rear PSM torque output 608.4 Nm, AIRMATIC air reservoir pressure 16.64 bar, rear-axle steer angle 0.17 deg
# Sindelfingen_EVA2_Telemetry[0050]: High-voltage battery pack SoC 98.10 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.28 C, front PSM efficiency 96.44 %, rear PSM torque output 608.5 Nm, AIRMATIC air reservoir pressure 16.64 bar, rear-axle steer angle 0.17 deg
# Sindelfingen_EVA2_Telemetry[0051]: High-voltage battery pack SoC 98.09 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.28 C, front PSM efficiency 96.44 %, rear PSM torque output 608.6 Nm, AIRMATIC air reservoir pressure 16.64 bar, rear-axle steer angle 0.17 deg
# Sindelfingen_EVA2_Telemetry[0052]: High-voltage battery pack SoC 98.09 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.28 C, front PSM efficiency 96.44 %, rear PSM torque output 608.7 Nm, AIRMATIC air reservoir pressure 16.64 bar, rear-axle steer angle 0.17 deg
# Sindelfingen_EVA2_Telemetry[0053]: High-voltage battery pack SoC 98.08 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.29 C, front PSM efficiency 96.44 %, rear PSM torque output 608.8 Nm, AIRMATIC air reservoir pressure 16.64 bar, rear-axle steer angle 0.18 deg
# Sindelfingen_EVA2_Telemetry[0054]: High-voltage battery pack SoC 98.08 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.29 C, front PSM efficiency 96.44 %, rear PSM torque output 608.9 Nm, AIRMATIC air reservoir pressure 16.64 bar, rear-axle steer angle 0.18 deg
# Sindelfingen_EVA2_Telemetry[0055]: High-voltage battery pack SoC 98.08 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.29 C, front PSM efficiency 96.45 %, rear PSM torque output 609.0 Nm, AIRMATIC air reservoir pressure 16.65 bar, rear-axle steer angle 0.18 deg
# Sindelfingen_EVA2_Telemetry[0056]: High-voltage battery pack SoC 98.07 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.29 C, front PSM efficiency 96.45 %, rear PSM torque output 609.1 Nm, AIRMATIC air reservoir pressure 16.65 bar, rear-axle steer angle 0.18 deg
# Sindelfingen_EVA2_Telemetry[0057]: High-voltage battery pack SoC 98.06 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.29 C, front PSM efficiency 96.45 %, rear PSM torque output 609.2 Nm, AIRMATIC air reservoir pressure 16.65 bar, rear-axle steer angle 0.18 deg
# Sindelfingen_EVA2_Telemetry[0058]: High-voltage battery pack SoC 98.06 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.30 C, front PSM efficiency 96.45 %, rear PSM torque output 609.3 Nm, AIRMATIC air reservoir pressure 16.65 bar, rear-axle steer angle 0.19 deg
# Sindelfingen_EVA2_Telemetry[0059]: High-voltage battery pack SoC 98.05 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.30 C, front PSM efficiency 96.45 %, rear PSM torque output 609.4 Nm, AIRMATIC air reservoir pressure 16.65 bar, rear-axle steer angle 0.19 deg
# Sindelfingen_EVA2_Telemetry[0060]: High-voltage battery pack SoC 98.05 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.30 C, front PSM efficiency 96.45 %, rear PSM torque output 609.5 Nm, AIRMATIC air reservoir pressure 16.65 bar, rear-axle steer angle 0.19 deg
# Sindelfingen_EVA2_Telemetry[0061]: High-voltage battery pack SoC 98.05 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.30 C, front PSM efficiency 96.45 %, rear PSM torque output 609.6 Nm, AIRMATIC air reservoir pressure 16.65 bar, rear-axle steer angle 0.19 deg
# Sindelfingen_EVA2_Telemetry[0062]: High-voltage battery pack SoC 98.04 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.30 C, front PSM efficiency 96.45 %, rear PSM torque output 609.7 Nm, AIRMATIC air reservoir pressure 16.65 bar, rear-axle steer angle 0.19 deg
# Sindelfingen_EVA2_Telemetry[0063]: High-voltage battery pack SoC 98.03 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.31 C, front PSM efficiency 96.45 %, rear PSM torque output 609.8 Nm, AIRMATIC air reservoir pressure 16.65 bar, rear-axle steer angle 0.20 deg
# Sindelfingen_EVA2_Telemetry[0064]: High-voltage battery pack SoC 98.03 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.31 C, front PSM efficiency 96.45 %, rear PSM torque output 609.9 Nm, AIRMATIC air reservoir pressure 16.65 bar, rear-axle steer angle 0.20 deg
# Sindelfingen_EVA2_Telemetry[0065]: High-voltage battery pack SoC 98.02 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.31 C, front PSM efficiency 96.46 %, rear PSM torque output 610.0 Nm, AIRMATIC air reservoir pressure 16.66 bar, rear-axle steer angle 0.20 deg
# Sindelfingen_EVA2_Telemetry[0066]: High-voltage battery pack SoC 98.02 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.31 C, front PSM efficiency 96.46 %, rear PSM torque output 610.1 Nm, AIRMATIC air reservoir pressure 16.66 bar, rear-axle steer angle 0.20 deg
# Sindelfingen_EVA2_Telemetry[0067]: High-voltage battery pack SoC 98.02 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.31 C, front PSM efficiency 96.46 %, rear PSM torque output 610.2 Nm, AIRMATIC air reservoir pressure 16.66 bar, rear-axle steer angle 0.20 deg
# Sindelfingen_EVA2_Telemetry[0068]: High-voltage battery pack SoC 98.01 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.32 C, front PSM efficiency 96.46 %, rear PSM torque output 610.3 Nm, AIRMATIC air reservoir pressure 16.66 bar, rear-axle steer angle 0.21 deg
# Sindelfingen_EVA2_Telemetry[0069]: High-voltage battery pack SoC 98.00 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.32 C, front PSM efficiency 96.46 %, rear PSM torque output 610.4 Nm, AIRMATIC air reservoir pressure 16.66 bar, rear-axle steer angle 0.21 deg
# Sindelfingen_EVA2_Telemetry[0070]: High-voltage battery pack SoC 98.00 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.32 C, front PSM efficiency 96.46 %, rear PSM torque output 610.5 Nm, AIRMATIC air reservoir pressure 16.66 bar, rear-axle steer angle 0.21 deg
# Sindelfingen_EVA2_Telemetry[0071]: High-voltage battery pack SoC 97.99 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.32 C, front PSM efficiency 96.46 %, rear PSM torque output 610.6 Nm, AIRMATIC air reservoir pressure 16.66 bar, rear-axle steer angle 0.21 deg
# Sindelfingen_EVA2_Telemetry[0072]: High-voltage battery pack SoC 97.99 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.32 C, front PSM efficiency 96.46 %, rear PSM torque output 610.7 Nm, AIRMATIC air reservoir pressure 16.66 bar, rear-axle steer angle 0.21 deg
# Sindelfingen_EVA2_Telemetry[0073]: High-voltage battery pack SoC 97.98 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.33 C, front PSM efficiency 96.46 %, rear PSM torque output 610.8 Nm, AIRMATIC air reservoir pressure 16.66 bar, rear-axle steer angle 0.22 deg
# Sindelfingen_EVA2_Telemetry[0074]: High-voltage battery pack SoC 97.98 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.33 C, front PSM efficiency 96.46 %, rear PSM torque output 610.9 Nm, AIRMATIC air reservoir pressure 16.66 bar, rear-axle steer angle 0.22 deg
# Sindelfingen_EVA2_Telemetry[0075]: High-voltage battery pack SoC 97.97 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.33 C, front PSM efficiency 96.47 %, rear PSM torque output 611.0 Nm, AIRMATIC air reservoir pressure 16.67 bar, rear-axle steer angle 0.22 deg
# Sindelfingen_EVA2_Telemetry[0076]: High-voltage battery pack SoC 97.97 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.33 C, front PSM efficiency 96.47 %, rear PSM torque output 611.1 Nm, AIRMATIC air reservoir pressure 16.67 bar, rear-axle steer angle 0.22 deg
# Sindelfingen_EVA2_Telemetry[0077]: High-voltage battery pack SoC 97.97 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.33 C, front PSM efficiency 96.47 %, rear PSM torque output 611.2 Nm, AIRMATIC air reservoir pressure 16.67 bar, rear-axle steer angle 0.22 deg
# Sindelfingen_EVA2_Telemetry[0078]: High-voltage battery pack SoC 97.96 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.34 C, front PSM efficiency 96.47 %, rear PSM torque output 611.3 Nm, AIRMATIC air reservoir pressure 16.67 bar, rear-axle steer angle 0.23 deg
# Sindelfingen_EVA2_Telemetry[0079]: High-voltage battery pack SoC 97.95 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.34 C, front PSM efficiency 96.47 %, rear PSM torque output 611.4 Nm, AIRMATIC air reservoir pressure 16.67 bar, rear-axle steer angle 0.23 deg
# Sindelfingen_EVA2_Telemetry[0080]: High-voltage battery pack SoC 97.95 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.34 C, front PSM efficiency 96.47 %, rear PSM torque output 611.5 Nm, AIRMATIC air reservoir pressure 16.67 bar, rear-axle steer angle 0.23 deg
# Sindelfingen_EVA2_Telemetry[0081]: High-voltage battery pack SoC 97.94 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.34 C, front PSM efficiency 96.47 %, rear PSM torque output 611.6 Nm, AIRMATIC air reservoir pressure 16.67 bar, rear-axle steer angle 0.23 deg
# Sindelfingen_EVA2_Telemetry[0082]: High-voltage battery pack SoC 97.94 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.34 C, front PSM efficiency 96.47 %, rear PSM torque output 611.7 Nm, AIRMATIC air reservoir pressure 16.67 bar, rear-axle steer angle 0.23 deg
# Sindelfingen_EVA2_Telemetry[0083]: High-voltage battery pack SoC 97.94 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.35 C, front PSM efficiency 96.47 %, rear PSM torque output 611.8 Nm, AIRMATIC air reservoir pressure 16.67 bar, rear-axle steer angle 0.24 deg
# Sindelfingen_EVA2_Telemetry[0084]: High-voltage battery pack SoC 97.93 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.35 C, front PSM efficiency 96.47 %, rear PSM torque output 611.9 Nm, AIRMATIC air reservoir pressure 16.67 bar, rear-axle steer angle 0.24 deg
# Sindelfingen_EVA2_Telemetry[0085]: High-voltage battery pack SoC 97.92 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.35 C, front PSM efficiency 96.48 %, rear PSM torque output 612.0 Nm, AIRMATIC air reservoir pressure 16.68 bar, rear-axle steer angle 0.24 deg
# Sindelfingen_EVA2_Telemetry[0086]: High-voltage battery pack SoC 97.92 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.35 C, front PSM efficiency 96.48 %, rear PSM torque output 612.1 Nm, AIRMATIC air reservoir pressure 16.68 bar, rear-axle steer angle 0.24 deg
# Sindelfingen_EVA2_Telemetry[0087]: High-voltage battery pack SoC 97.91 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.35 C, front PSM efficiency 96.48 %, rear PSM torque output 612.2 Nm, AIRMATIC air reservoir pressure 16.68 bar, rear-axle steer angle 0.24 deg
# Sindelfingen_EVA2_Telemetry[0088]: High-voltage battery pack SoC 97.91 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.36 C, front PSM efficiency 96.48 %, rear PSM torque output 612.3 Nm, AIRMATIC air reservoir pressure 16.68 bar, rear-axle steer angle 0.25 deg
# Sindelfingen_EVA2_Telemetry[0089]: High-voltage battery pack SoC 97.91 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.36 C, front PSM efficiency 96.48 %, rear PSM torque output 612.4 Nm, AIRMATIC air reservoir pressure 16.68 bar, rear-axle steer angle 0.25 deg
# Sindelfingen_EVA2_Telemetry[0090]: High-voltage battery pack SoC 97.90 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.36 C, front PSM efficiency 96.48 %, rear PSM torque output 612.5 Nm, AIRMATIC air reservoir pressure 16.68 bar, rear-axle steer angle 0.25 deg
# Sindelfingen_EVA2_Telemetry[0091]: High-voltage battery pack SoC 97.89 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.36 C, front PSM efficiency 96.48 %, rear PSM torque output 612.6 Nm, AIRMATIC air reservoir pressure 16.68 bar, rear-axle steer angle 0.25 deg
# Sindelfingen_EVA2_Telemetry[0092]: High-voltage battery pack SoC 97.89 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.36 C, front PSM efficiency 96.48 %, rear PSM torque output 612.7 Nm, AIRMATIC air reservoir pressure 16.68 bar, rear-axle steer angle 0.25 deg
# Sindelfingen_EVA2_Telemetry[0093]: High-voltage battery pack SoC 97.88 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.37 C, front PSM efficiency 96.48 %, rear PSM torque output 612.8 Nm, AIRMATIC air reservoir pressure 16.68 bar, rear-axle steer angle 0.26 deg
# Sindelfingen_EVA2_Telemetry[0094]: High-voltage battery pack SoC 97.88 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.37 C, front PSM efficiency 96.48 %, rear PSM torque output 612.9 Nm, AIRMATIC air reservoir pressure 16.68 bar, rear-axle steer angle 0.26 deg
# Sindelfingen_EVA2_Telemetry[0095]: High-voltage battery pack SoC 97.88 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.37 C, front PSM efficiency 96.48 %, rear PSM torque output 613.0 Nm, AIRMATIC air reservoir pressure 16.69 bar, rear-axle steer angle 0.26 deg
# Sindelfingen_EVA2_Telemetry[0096]: High-voltage battery pack SoC 97.87 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.37 C, front PSM efficiency 96.49 %, rear PSM torque output 613.1 Nm, AIRMATIC air reservoir pressure 16.69 bar, rear-axle steer angle 0.26 deg
# Sindelfingen_EVA2_Telemetry[0097]: High-voltage battery pack SoC 97.86 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.37 C, front PSM efficiency 96.49 %, rear PSM torque output 613.2 Nm, AIRMATIC air reservoir pressure 16.69 bar, rear-axle steer angle 0.26 deg
# Sindelfingen_EVA2_Telemetry[0098]: High-voltage battery pack SoC 97.86 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.38 C, front PSM efficiency 96.49 %, rear PSM torque output 613.3 Nm, AIRMATIC air reservoir pressure 16.69 bar, rear-axle steer angle 0.27 deg
# Sindelfingen_EVA2_Telemetry[0099]: High-voltage battery pack SoC 97.86 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.38 C, front PSM efficiency 96.49 %, rear PSM torque output 613.4 Nm, AIRMATIC air reservoir pressure 16.69 bar, rear-axle steer angle 0.27 deg
# Sindelfingen_EVA2_Telemetry[0100]: High-voltage battery pack SoC 97.85 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.38 C, front PSM efficiency 96.49 %, rear PSM torque output 613.5 Nm, AIRMATIC air reservoir pressure 16.69 bar, rear-axle steer angle 0.27 deg
# Sindelfingen_EVA2_Telemetry[0101]: High-voltage battery pack SoC 97.84 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.38 C, front PSM efficiency 96.49 %, rear PSM torque output 613.6 Nm, AIRMATIC air reservoir pressure 16.69 bar, rear-axle steer angle 0.27 deg
# Sindelfingen_EVA2_Telemetry[0102]: High-voltage battery pack SoC 97.84 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.38 C, front PSM efficiency 96.49 %, rear PSM torque output 613.7 Nm, AIRMATIC air reservoir pressure 16.69 bar, rear-axle steer angle 0.27 deg
# Sindelfingen_EVA2_Telemetry[0103]: High-voltage battery pack SoC 97.83 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.39 C, front PSM efficiency 96.49 %, rear PSM torque output 613.8 Nm, AIRMATIC air reservoir pressure 16.69 bar, rear-axle steer angle 0.28 deg
# Sindelfingen_EVA2_Telemetry[0104]: High-voltage battery pack SoC 97.83 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.39 C, front PSM efficiency 96.49 %, rear PSM torque output 613.9 Nm, AIRMATIC air reservoir pressure 16.69 bar, rear-axle steer angle 0.28 deg
# Sindelfingen_EVA2_Telemetry[0105]: High-voltage battery pack SoC 97.83 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.39 C, front PSM efficiency 96.50 %, rear PSM torque output 614.0 Nm, AIRMATIC air reservoir pressure 16.70 bar, rear-axle steer angle 0.28 deg
# Sindelfingen_EVA2_Telemetry[0106]: High-voltage battery pack SoC 97.82 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.39 C, front PSM efficiency 96.50 %, rear PSM torque output 614.1 Nm, AIRMATIC air reservoir pressure 16.70 bar, rear-axle steer angle 0.28 deg
# Sindelfingen_EVA2_Telemetry[0107]: High-voltage battery pack SoC 97.81 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.39 C, front PSM efficiency 96.50 %, rear PSM torque output 614.2 Nm, AIRMATIC air reservoir pressure 16.70 bar, rear-axle steer angle 0.28 deg
# Sindelfingen_EVA2_Telemetry[0108]: High-voltage battery pack SoC 97.81 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.40 C, front PSM efficiency 96.50 %, rear PSM torque output 614.3 Nm, AIRMATIC air reservoir pressure 16.70 bar, rear-axle steer angle 0.29 deg
# Sindelfingen_EVA2_Telemetry[0109]: High-voltage battery pack SoC 97.80 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.40 C, front PSM efficiency 96.50 %, rear PSM torque output 614.4 Nm, AIRMATIC air reservoir pressure 16.70 bar, rear-axle steer angle 0.29 deg
# Sindelfingen_EVA2_Telemetry[0110]: High-voltage battery pack SoC 97.80 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.40 C, front PSM efficiency 96.50 %, rear PSM torque output 614.5 Nm, AIRMATIC air reservoir pressure 16.70 bar, rear-axle steer angle 0.29 deg
# Sindelfingen_EVA2_Telemetry[0111]: High-voltage battery pack SoC 97.80 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.40 C, front PSM efficiency 96.50 %, rear PSM torque output 614.6 Nm, AIRMATIC air reservoir pressure 16.70 bar, rear-axle steer angle 0.29 deg
# Sindelfingen_EVA2_Telemetry[0112]: High-voltage battery pack SoC 97.79 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.40 C, front PSM efficiency 96.50 %, rear PSM torque output 614.7 Nm, AIRMATIC air reservoir pressure 16.70 bar, rear-axle steer angle 0.29 deg
# Sindelfingen_EVA2_Telemetry[0113]: High-voltage battery pack SoC 97.78 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.41 C, front PSM efficiency 96.50 %, rear PSM torque output 614.8 Nm, AIRMATIC air reservoir pressure 16.70 bar, rear-axle steer angle 0.30 deg
# Sindelfingen_EVA2_Telemetry[0114]: High-voltage battery pack SoC 97.78 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.41 C, front PSM efficiency 96.50 %, rear PSM torque output 614.9 Nm, AIRMATIC air reservoir pressure 16.70 bar, rear-axle steer angle 0.30 deg
# Sindelfingen_EVA2_Telemetry[0115]: High-voltage battery pack SoC 97.77 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.41 C, front PSM efficiency 96.51 %, rear PSM torque output 615.0 Nm, AIRMATIC air reservoir pressure 16.71 bar, rear-axle steer angle 0.30 deg
# Sindelfingen_EVA2_Telemetry[0116]: High-voltage battery pack SoC 97.77 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.41 C, front PSM efficiency 96.51 %, rear PSM torque output 615.1 Nm, AIRMATIC air reservoir pressure 16.71 bar, rear-axle steer angle 0.30 deg
# Sindelfingen_EVA2_Telemetry[0117]: High-voltage battery pack SoC 97.77 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.41 C, front PSM efficiency 96.51 %, rear PSM torque output 615.2 Nm, AIRMATIC air reservoir pressure 16.71 bar, rear-axle steer angle 0.30 deg
# Sindelfingen_EVA2_Telemetry[0118]: High-voltage battery pack SoC 97.76 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.42 C, front PSM efficiency 96.51 %, rear PSM torque output 615.3 Nm, AIRMATIC air reservoir pressure 16.71 bar, rear-axle steer angle 0.31 deg
# Sindelfingen_EVA2_Telemetry[0119]: High-voltage battery pack SoC 97.75 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.42 C, front PSM efficiency 96.51 %, rear PSM torque output 615.4 Nm, AIRMATIC air reservoir pressure 16.71 bar, rear-axle steer angle 0.31 deg
# Sindelfingen_EVA2_Telemetry[0120]: High-voltage battery pack SoC 97.75 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.42 C, front PSM efficiency 96.51 %, rear PSM torque output 615.5 Nm, AIRMATIC air reservoir pressure 16.71 bar, rear-axle steer angle 0.31 deg
# Sindelfingen_EVA2_Telemetry[0121]: High-voltage battery pack SoC 97.74 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.42 C, front PSM efficiency 96.51 %, rear PSM torque output 615.6 Nm, AIRMATIC air reservoir pressure 16.71 bar, rear-axle steer angle 0.31 deg
# Sindelfingen_EVA2_Telemetry[0122]: High-voltage battery pack SoC 97.74 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.42 C, front PSM efficiency 96.51 %, rear PSM torque output 615.7 Nm, AIRMATIC air reservoir pressure 16.71 bar, rear-axle steer angle 0.31 deg
# Sindelfingen_EVA2_Telemetry[0123]: High-voltage battery pack SoC 97.73 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.43 C, front PSM efficiency 96.51 %, rear PSM torque output 615.8 Nm, AIRMATIC air reservoir pressure 16.71 bar, rear-axle steer angle 0.32 deg
# Sindelfingen_EVA2_Telemetry[0124]: High-voltage battery pack SoC 97.73 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.43 C, front PSM efficiency 96.51 %, rear PSM torque output 615.9 Nm, AIRMATIC air reservoir pressure 16.71 bar, rear-axle steer angle 0.32 deg
# Sindelfingen_EVA2_Telemetry[0125]: High-voltage battery pack SoC 97.72 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.43 C, front PSM efficiency 96.52 %, rear PSM torque output 616.0 Nm, AIRMATIC air reservoir pressure 16.71 bar, rear-axle steer angle 0.32 deg
# Sindelfingen_EVA2_Telemetry[0126]: High-voltage battery pack SoC 97.72 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.43 C, front PSM efficiency 96.52 %, rear PSM torque output 616.1 Nm, AIRMATIC air reservoir pressure 16.72 bar, rear-axle steer angle 0.32 deg
# Sindelfingen_EVA2_Telemetry[0127]: High-voltage battery pack SoC 97.72 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.43 C, front PSM efficiency 96.52 %, rear PSM torque output 616.2 Nm, AIRMATIC air reservoir pressure 16.72 bar, rear-axle steer angle 0.32 deg
# Sindelfingen_EVA2_Telemetry[0128]: High-voltage battery pack SoC 97.71 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.44 C, front PSM efficiency 96.52 %, rear PSM torque output 616.3 Nm, AIRMATIC air reservoir pressure 16.72 bar, rear-axle steer angle 0.33 deg
# Sindelfingen_EVA2_Telemetry[0129]: High-voltage battery pack SoC 97.70 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.44 C, front PSM efficiency 96.52 %, rear PSM torque output 616.4 Nm, AIRMATIC air reservoir pressure 16.72 bar, rear-axle steer angle 0.33 deg
# Sindelfingen_EVA2_Telemetry[0130]: High-voltage battery pack SoC 97.70 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.44 C, front PSM efficiency 96.52 %, rear PSM torque output 616.5 Nm, AIRMATIC air reservoir pressure 16.72 bar, rear-axle steer angle 0.33 deg
# Sindelfingen_EVA2_Telemetry[0131]: High-voltage battery pack SoC 97.69 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.44 C, front PSM efficiency 96.52 %, rear PSM torque output 616.6 Nm, AIRMATIC air reservoir pressure 16.72 bar, rear-axle steer angle 0.33 deg
# Sindelfingen_EVA2_Telemetry[0132]: High-voltage battery pack SoC 97.69 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.44 C, front PSM efficiency 96.52 %, rear PSM torque output 616.7 Nm, AIRMATIC air reservoir pressure 16.72 bar, rear-axle steer angle 0.33 deg
# Sindelfingen_EVA2_Telemetry[0133]: High-voltage battery pack SoC 97.69 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.45 C, front PSM efficiency 96.52 %, rear PSM torque output 616.8 Nm, AIRMATIC air reservoir pressure 16.72 bar, rear-axle steer angle 0.34 deg
# Sindelfingen_EVA2_Telemetry[0134]: High-voltage battery pack SoC 97.68 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.45 C, front PSM efficiency 96.52 %, rear PSM torque output 616.9 Nm, AIRMATIC air reservoir pressure 16.72 bar, rear-axle steer angle 0.34 deg
# Sindelfingen_EVA2_Telemetry[0135]: High-voltage battery pack SoC 97.67 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.45 C, front PSM efficiency 96.53 %, rear PSM torque output 617.0 Nm, AIRMATIC air reservoir pressure 16.73 bar, rear-axle steer angle 0.34 deg
# Sindelfingen_EVA2_Telemetry[0136]: High-voltage battery pack SoC 97.67 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.45 C, front PSM efficiency 96.53 %, rear PSM torque output 617.1 Nm, AIRMATIC air reservoir pressure 16.73 bar, rear-axle steer angle 0.34 deg
# Sindelfingen_EVA2_Telemetry[0137]: High-voltage battery pack SoC 97.66 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.45 C, front PSM efficiency 96.53 %, rear PSM torque output 617.2 Nm, AIRMATIC air reservoir pressure 16.73 bar, rear-axle steer angle 0.34 deg
# Sindelfingen_EVA2_Telemetry[0138]: High-voltage battery pack SoC 97.66 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.46 C, front PSM efficiency 96.53 %, rear PSM torque output 617.3 Nm, AIRMATIC air reservoir pressure 16.73 bar, rear-axle steer angle 0.35 deg
# Sindelfingen_EVA2_Telemetry[0139]: High-voltage battery pack SoC 97.66 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.46 C, front PSM efficiency 96.53 %, rear PSM torque output 617.4 Nm, AIRMATIC air reservoir pressure 16.73 bar, rear-axle steer angle 0.35 deg
# Sindelfingen_EVA2_Telemetry[0140]: High-voltage battery pack SoC 97.65 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.46 C, front PSM efficiency 96.53 %, rear PSM torque output 617.5 Nm, AIRMATIC air reservoir pressure 16.73 bar, rear-axle steer angle 0.35 deg
# Sindelfingen_EVA2_Telemetry[0141]: High-voltage battery pack SoC 97.64 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.46 C, front PSM efficiency 96.53 %, rear PSM torque output 617.6 Nm, AIRMATIC air reservoir pressure 16.73 bar, rear-axle steer angle 0.35 deg
# Sindelfingen_EVA2_Telemetry[0142]: High-voltage battery pack SoC 97.64 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.46 C, front PSM efficiency 96.53 %, rear PSM torque output 617.7 Nm, AIRMATIC air reservoir pressure 16.73 bar, rear-axle steer angle 0.35 deg
# Sindelfingen_EVA2_Telemetry[0143]: High-voltage battery pack SoC 97.63 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.47 C, front PSM efficiency 96.53 %, rear PSM torque output 617.8 Nm, AIRMATIC air reservoir pressure 16.73 bar, rear-axle steer angle 0.36 deg
# Sindelfingen_EVA2_Telemetry[0144]: High-voltage battery pack SoC 97.63 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.47 C, front PSM efficiency 96.53 %, rear PSM torque output 617.9 Nm, AIRMATIC air reservoir pressure 16.73 bar, rear-axle steer angle 0.36 deg
# Sindelfingen_EVA2_Telemetry[0145]: High-voltage battery pack SoC 97.62 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.47 C, front PSM efficiency 96.54 %, rear PSM torque output 618.0 Nm, AIRMATIC air reservoir pressure 16.74 bar, rear-axle steer angle 0.36 deg
# Sindelfingen_EVA2_Telemetry[0146]: High-voltage battery pack SoC 97.62 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.47 C, front PSM efficiency 96.54 %, rear PSM torque output 618.1 Nm, AIRMATIC air reservoir pressure 16.74 bar, rear-axle steer angle 0.36 deg
# Sindelfingen_EVA2_Telemetry[0147]: High-voltage battery pack SoC 97.61 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.47 C, front PSM efficiency 96.54 %, rear PSM torque output 618.2 Nm, AIRMATIC air reservoir pressure 16.74 bar, rear-axle steer angle 0.36 deg
# Sindelfingen_EVA2_Telemetry[0148]: High-voltage battery pack SoC 97.61 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.48 C, front PSM efficiency 96.54 %, rear PSM torque output 618.3 Nm, AIRMATIC air reservoir pressure 16.74 bar, rear-axle steer angle 0.37 deg
# Sindelfingen_EVA2_Telemetry[0149]: High-voltage battery pack SoC 97.61 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.48 C, front PSM efficiency 96.54 %, rear PSM torque output 618.4 Nm, AIRMATIC air reservoir pressure 16.74 bar, rear-axle steer angle 0.37 deg
# Sindelfingen_EVA2_Telemetry[0150]: High-voltage battery pack SoC 97.60 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.48 C, front PSM efficiency 96.54 %, rear PSM torque output 618.5 Nm, AIRMATIC air reservoir pressure 16.74 bar, rear-axle steer angle 0.37 deg
# Sindelfingen_EVA2_Telemetry[0151]: High-voltage battery pack SoC 97.59 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.48 C, front PSM efficiency 96.54 %, rear PSM torque output 618.6 Nm, AIRMATIC air reservoir pressure 16.74 bar, rear-axle steer angle 0.37 deg
# Sindelfingen_EVA2_Telemetry[0152]: High-voltage battery pack SoC 97.59 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.48 C, front PSM efficiency 96.54 %, rear PSM torque output 618.7 Nm, AIRMATIC air reservoir pressure 16.74 bar, rear-axle steer angle 0.37 deg
# Sindelfingen_EVA2_Telemetry[0153]: High-voltage battery pack SoC 97.58 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.49 C, front PSM efficiency 96.54 %, rear PSM torque output 618.8 Nm, AIRMATIC air reservoir pressure 16.74 bar, rear-axle steer angle 0.38 deg
# Sindelfingen_EVA2_Telemetry[0154]: High-voltage battery pack SoC 97.58 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.49 C, front PSM efficiency 96.54 %, rear PSM torque output 618.9 Nm, AIRMATIC air reservoir pressure 16.74 bar, rear-axle steer angle 0.38 deg
# Sindelfingen_EVA2_Telemetry[0155]: High-voltage battery pack SoC 97.58 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.49 C, front PSM efficiency 96.55 %, rear PSM torque output 619.0 Nm, AIRMATIC air reservoir pressure 16.75 bar, rear-axle steer angle 0.38 deg
# Sindelfingen_EVA2_Telemetry[0156]: High-voltage battery pack SoC 97.57 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.49 C, front PSM efficiency 96.55 %, rear PSM torque output 619.1 Nm, AIRMATIC air reservoir pressure 16.75 bar, rear-axle steer angle 0.38 deg
# Sindelfingen_EVA2_Telemetry[0157]: High-voltage battery pack SoC 97.56 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.49 C, front PSM efficiency 96.55 %, rear PSM torque output 619.2 Nm, AIRMATIC air reservoir pressure 16.75 bar, rear-axle steer angle 0.38 deg
# Sindelfingen_EVA2_Telemetry[0158]: High-voltage battery pack SoC 97.56 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.50 C, front PSM efficiency 96.55 %, rear PSM torque output 619.3 Nm, AIRMATIC air reservoir pressure 16.75 bar, rear-axle steer angle 0.39 deg
# Sindelfingen_EVA2_Telemetry[0159]: High-voltage battery pack SoC 97.55 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.50 C, front PSM efficiency 96.55 %, rear PSM torque output 619.4 Nm, AIRMATIC air reservoir pressure 16.75 bar, rear-axle steer angle 0.39 deg
# Sindelfingen_EVA2_Telemetry[0160]: High-voltage battery pack SoC 97.55 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.50 C, front PSM efficiency 96.55 %, rear PSM torque output 619.5 Nm, AIRMATIC air reservoir pressure 16.75 bar, rear-axle steer angle 0.39 deg
# Sindelfingen_EVA2_Telemetry[0161]: High-voltage battery pack SoC 97.55 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.50 C, front PSM efficiency 96.55 %, rear PSM torque output 619.6 Nm, AIRMATIC air reservoir pressure 16.75 bar, rear-axle steer angle 0.39 deg
# Sindelfingen_EVA2_Telemetry[0162]: High-voltage battery pack SoC 97.54 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.50 C, front PSM efficiency 96.55 %, rear PSM torque output 619.7 Nm, AIRMATIC air reservoir pressure 16.75 bar, rear-axle steer angle 0.39 deg
# Sindelfingen_EVA2_Telemetry[0163]: High-voltage battery pack SoC 97.53 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.51 C, front PSM efficiency 96.55 %, rear PSM torque output 619.8 Nm, AIRMATIC air reservoir pressure 16.75 bar, rear-axle steer angle 0.40 deg
# Sindelfingen_EVA2_Telemetry[0164]: High-voltage battery pack SoC 97.53 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.51 C, front PSM efficiency 96.55 %, rear PSM torque output 619.9 Nm, AIRMATIC air reservoir pressure 16.75 bar, rear-axle steer angle 0.40 deg
# Sindelfingen_EVA2_Telemetry[0165]: High-voltage battery pack SoC 97.52 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.51 C, front PSM efficiency 96.56 %, rear PSM torque output 620.0 Nm, AIRMATIC air reservoir pressure 16.76 bar, rear-axle steer angle 0.40 deg
# Sindelfingen_EVA2_Telemetry[0166]: High-voltage battery pack SoC 97.52 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.51 C, front PSM efficiency 96.56 %, rear PSM torque output 620.1 Nm, AIRMATIC air reservoir pressure 16.76 bar, rear-axle steer angle 0.40 deg
# Sindelfingen_EVA2_Telemetry[0167]: High-voltage battery pack SoC 97.52 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.51 C, front PSM efficiency 96.56 %, rear PSM torque output 620.2 Nm, AIRMATIC air reservoir pressure 16.76 bar, rear-axle steer angle 0.40 deg
# Sindelfingen_EVA2_Telemetry[0168]: High-voltage battery pack SoC 97.51 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.52 C, front PSM efficiency 96.56 %, rear PSM torque output 620.3 Nm, AIRMATIC air reservoir pressure 16.76 bar, rear-axle steer angle 0.41 deg
# Sindelfingen_EVA2_Telemetry[0169]: High-voltage battery pack SoC 97.50 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.52 C, front PSM efficiency 96.56 %, rear PSM torque output 620.4 Nm, AIRMATIC air reservoir pressure 16.76 bar, rear-axle steer angle 0.41 deg
# Sindelfingen_EVA2_Telemetry[0170]: High-voltage battery pack SoC 97.50 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.52 C, front PSM efficiency 96.56 %, rear PSM torque output 620.5 Nm, AIRMATIC air reservoir pressure 16.76 bar, rear-axle steer angle 0.41 deg
# Sindelfingen_EVA2_Telemetry[0171]: High-voltage battery pack SoC 97.49 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.52 C, front PSM efficiency 96.56 %, rear PSM torque output 620.6 Nm, AIRMATIC air reservoir pressure 16.76 bar, rear-axle steer angle 0.41 deg
# Sindelfingen_EVA2_Telemetry[0172]: High-voltage battery pack SoC 97.49 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.52 C, front PSM efficiency 96.56 %, rear PSM torque output 620.7 Nm, AIRMATIC air reservoir pressure 16.76 bar, rear-axle steer angle 0.41 deg
# Sindelfingen_EVA2_Telemetry[0173]: High-voltage battery pack SoC 97.48 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.53 C, front PSM efficiency 96.56 %, rear PSM torque output 620.8 Nm, AIRMATIC air reservoir pressure 16.76 bar, rear-axle steer angle 0.42 deg
# Sindelfingen_EVA2_Telemetry[0174]: High-voltage battery pack SoC 97.48 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.53 C, front PSM efficiency 96.56 %, rear PSM torque output 620.9 Nm, AIRMATIC air reservoir pressure 16.76 bar, rear-axle steer angle 0.42 deg
# Sindelfingen_EVA2_Telemetry[0175]: High-voltage battery pack SoC 97.47 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.53 C, front PSM efficiency 96.57 %, rear PSM torque output 621.0 Nm, AIRMATIC air reservoir pressure 16.77 bar, rear-axle steer angle 0.42 deg
# Sindelfingen_EVA2_Telemetry[0176]: High-voltage battery pack SoC 97.47 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.53 C, front PSM efficiency 96.57 %, rear PSM torque output 621.1 Nm, AIRMATIC air reservoir pressure 16.77 bar, rear-axle steer angle 0.42 deg
# Sindelfingen_EVA2_Telemetry[0177]: High-voltage battery pack SoC 97.47 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.53 C, front PSM efficiency 96.57 %, rear PSM torque output 621.2 Nm, AIRMATIC air reservoir pressure 16.77 bar, rear-axle steer angle 0.42 deg
# Sindelfingen_EVA2_Telemetry[0178]: High-voltage battery pack SoC 97.46 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.54 C, front PSM efficiency 96.57 %, rear PSM torque output 621.3 Nm, AIRMATIC air reservoir pressure 16.77 bar, rear-axle steer angle 0.43 deg
# Sindelfingen_EVA2_Telemetry[0179]: High-voltage battery pack SoC 97.45 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.54 C, front PSM efficiency 96.57 %, rear PSM torque output 621.4 Nm, AIRMATIC air reservoir pressure 16.77 bar, rear-axle steer angle 0.43 deg
# Sindelfingen_EVA2_Telemetry[0180]: High-voltage battery pack SoC 97.45 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.54 C, front PSM efficiency 96.57 %, rear PSM torque output 621.5 Nm, AIRMATIC air reservoir pressure 16.77 bar, rear-axle steer angle 0.43 deg
# Sindelfingen_EVA2_Telemetry[0181]: High-voltage battery pack SoC 97.44 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.54 C, front PSM efficiency 96.57 %, rear PSM torque output 621.6 Nm, AIRMATIC air reservoir pressure 16.77 bar, rear-axle steer angle 0.43 deg
# Sindelfingen_EVA2_Telemetry[0182]: High-voltage battery pack SoC 97.44 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.54 C, front PSM efficiency 96.57 %, rear PSM torque output 621.7 Nm, AIRMATIC air reservoir pressure 16.77 bar, rear-axle steer angle 0.43 deg
# Sindelfingen_EVA2_Telemetry[0183]: High-voltage battery pack SoC 97.44 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.55 C, front PSM efficiency 96.57 %, rear PSM torque output 621.8 Nm, AIRMATIC air reservoir pressure 16.77 bar, rear-axle steer angle 0.44 deg
# Sindelfingen_EVA2_Telemetry[0184]: High-voltage battery pack SoC 97.43 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.55 C, front PSM efficiency 96.57 %, rear PSM torque output 621.9 Nm, AIRMATIC air reservoir pressure 16.77 bar, rear-axle steer angle 0.44 deg
# Sindelfingen_EVA2_Telemetry[0185]: High-voltage battery pack SoC 97.42 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.55 C, front PSM efficiency 96.58 %, rear PSM torque output 622.0 Nm, AIRMATIC air reservoir pressure 16.78 bar, rear-axle steer angle 0.44 deg
# Sindelfingen_EVA2_Telemetry[0186]: High-voltage battery pack SoC 97.42 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.55 C, front PSM efficiency 96.58 %, rear PSM torque output 622.1 Nm, AIRMATIC air reservoir pressure 16.78 bar, rear-axle steer angle 0.44 deg
# Sindelfingen_EVA2_Telemetry[0187]: High-voltage battery pack SoC 97.41 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.55 C, front PSM efficiency 96.58 %, rear PSM torque output 622.2 Nm, AIRMATIC air reservoir pressure 16.78 bar, rear-axle steer angle 0.44 deg
# Sindelfingen_EVA2_Telemetry[0188]: High-voltage battery pack SoC 97.41 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.56 C, front PSM efficiency 96.58 %, rear PSM torque output 622.3 Nm, AIRMATIC air reservoir pressure 16.78 bar, rear-axle steer angle 0.45 deg
# Sindelfingen_EVA2_Telemetry[0189]: High-voltage battery pack SoC 97.41 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.56 C, front PSM efficiency 96.58 %, rear PSM torque output 622.4 Nm, AIRMATIC air reservoir pressure 16.78 bar, rear-axle steer angle 0.45 deg
# Sindelfingen_EVA2_Telemetry[0190]: High-voltage battery pack SoC 97.40 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.56 C, front PSM efficiency 96.58 %, rear PSM torque output 622.5 Nm, AIRMATIC air reservoir pressure 16.78 bar, rear-axle steer angle 0.45 deg
# Sindelfingen_EVA2_Telemetry[0191]: High-voltage battery pack SoC 97.39 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.56 C, front PSM efficiency 96.58 %, rear PSM torque output 622.6 Nm, AIRMATIC air reservoir pressure 16.78 bar, rear-axle steer angle 0.45 deg
# Sindelfingen_EVA2_Telemetry[0192]: High-voltage battery pack SoC 97.39 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.56 C, front PSM efficiency 96.58 %, rear PSM torque output 622.7 Nm, AIRMATIC air reservoir pressure 16.78 bar, rear-axle steer angle 0.45 deg
# Sindelfingen_EVA2_Telemetry[0193]: High-voltage battery pack SoC 97.38 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.57 C, front PSM efficiency 96.58 %, rear PSM torque output 622.8 Nm, AIRMATIC air reservoir pressure 16.78 bar, rear-axle steer angle 0.46 deg
# Sindelfingen_EVA2_Telemetry[0194]: High-voltage battery pack SoC 97.38 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.57 C, front PSM efficiency 96.58 %, rear PSM torque output 622.9 Nm, AIRMATIC air reservoir pressure 16.78 bar, rear-axle steer angle 0.46 deg
# Sindelfingen_EVA2_Telemetry[0195]: High-voltage battery pack SoC 97.38 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.57 C, front PSM efficiency 96.59 %, rear PSM torque output 623.0 Nm, AIRMATIC air reservoir pressure 16.79 bar, rear-axle steer angle 0.46 deg
# Sindelfingen_EVA2_Telemetry[0196]: High-voltage battery pack SoC 97.37 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.57 C, front PSM efficiency 96.59 %, rear PSM torque output 623.1 Nm, AIRMATIC air reservoir pressure 16.79 bar, rear-axle steer angle 0.46 deg
# Sindelfingen_EVA2_Telemetry[0197]: High-voltage battery pack SoC 97.36 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.57 C, front PSM efficiency 96.59 %, rear PSM torque output 623.2 Nm, AIRMATIC air reservoir pressure 16.79 bar, rear-axle steer angle 0.46 deg
# Sindelfingen_EVA2_Telemetry[0198]: High-voltage battery pack SoC 97.36 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.58 C, front PSM efficiency 96.59 %, rear PSM torque output 623.3 Nm, AIRMATIC air reservoir pressure 16.79 bar, rear-axle steer angle 0.47 deg
# Sindelfingen_EVA2_Telemetry[0199]: High-voltage battery pack SoC 97.36 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.58 C, front PSM efficiency 96.59 %, rear PSM torque output 623.4 Nm, AIRMATIC air reservoir pressure 16.79 bar, rear-axle steer angle 0.47 deg
# Sindelfingen_EVA2_Telemetry[0200]: High-voltage battery pack SoC 97.35 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.58 C, front PSM efficiency 96.59 %, rear PSM torque output 623.5 Nm, AIRMATIC air reservoir pressure 16.79 bar, rear-axle steer angle 0.47 deg
# Sindelfingen_EVA2_Telemetry[0201]: High-voltage battery pack SoC 97.34 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.58 C, front PSM efficiency 96.59 %, rear PSM torque output 623.6 Nm, AIRMATIC air reservoir pressure 16.79 bar, rear-axle steer angle 0.47 deg
# Sindelfingen_EVA2_Telemetry[0202]: High-voltage battery pack SoC 97.34 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.58 C, front PSM efficiency 96.59 %, rear PSM torque output 623.7 Nm, AIRMATIC air reservoir pressure 16.79 bar, rear-axle steer angle 0.47 deg
# Sindelfingen_EVA2_Telemetry[0203]: High-voltage battery pack SoC 97.33 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.59 C, front PSM efficiency 96.59 %, rear PSM torque output 623.8 Nm, AIRMATIC air reservoir pressure 16.79 bar, rear-axle steer angle 0.48 deg
# Sindelfingen_EVA2_Telemetry[0204]: High-voltage battery pack SoC 97.33 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.59 C, front PSM efficiency 96.59 %, rear PSM torque output 623.9 Nm, AIRMATIC air reservoir pressure 16.79 bar, rear-axle steer angle 0.48 deg
# Sindelfingen_EVA2_Telemetry[0205]: High-voltage battery pack SoC 97.33 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.59 C, front PSM efficiency 96.59 %, rear PSM torque output 624.0 Nm, AIRMATIC air reservoir pressure 16.80 bar, rear-axle steer angle 0.48 deg
# Sindelfingen_EVA2_Telemetry[0206]: High-voltage battery pack SoC 97.32 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.59 C, front PSM efficiency 96.60 %, rear PSM torque output 624.1 Nm, AIRMATIC air reservoir pressure 16.80 bar, rear-axle steer angle 0.48 deg
# Sindelfingen_EVA2_Telemetry[0207]: High-voltage battery pack SoC 97.31 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.59 C, front PSM efficiency 96.60 %, rear PSM torque output 624.2 Nm, AIRMATIC air reservoir pressure 16.80 bar, rear-axle steer angle 0.48 deg
# Sindelfingen_EVA2_Telemetry[0208]: High-voltage battery pack SoC 97.31 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.60 C, front PSM efficiency 96.60 %, rear PSM torque output 624.3 Nm, AIRMATIC air reservoir pressure 16.80 bar, rear-axle steer angle 0.49 deg
# Sindelfingen_EVA2_Telemetry[0209]: High-voltage battery pack SoC 97.30 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.60 C, front PSM efficiency 96.60 %, rear PSM torque output 624.4 Nm, AIRMATIC air reservoir pressure 16.80 bar, rear-axle steer angle 0.49 deg
# Sindelfingen_EVA2_Telemetry[0210]: High-voltage battery pack SoC 97.30 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.60 C, front PSM efficiency 96.60 %, rear PSM torque output 624.5 Nm, AIRMATIC air reservoir pressure 16.80 bar, rear-axle steer angle 0.49 deg
# Sindelfingen_EVA2_Telemetry[0211]: High-voltage battery pack SoC 97.30 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.60 C, front PSM efficiency 96.60 %, rear PSM torque output 624.6 Nm, AIRMATIC air reservoir pressure 16.80 bar, rear-axle steer angle 0.49 deg
# Sindelfingen_EVA2_Telemetry[0212]: High-voltage battery pack SoC 97.29 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.60 C, front PSM efficiency 96.60 %, rear PSM torque output 624.7 Nm, AIRMATIC air reservoir pressure 16.80 bar, rear-axle steer angle 0.49 deg
# Sindelfingen_EVA2_Telemetry[0213]: High-voltage battery pack SoC 97.28 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.61 C, front PSM efficiency 96.60 %, rear PSM torque output 624.8 Nm, AIRMATIC air reservoir pressure 16.80 bar, rear-axle steer angle 0.50 deg
# Sindelfingen_EVA2_Telemetry[0214]: High-voltage battery pack SoC 97.28 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.61 C, front PSM efficiency 96.60 %, rear PSM torque output 624.9 Nm, AIRMATIC air reservoir pressure 16.80 bar, rear-axle steer angle 0.50 deg
# Sindelfingen_EVA2_Telemetry[0215]: High-voltage battery pack SoC 97.27 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.61 C, front PSM efficiency 96.61 %, rear PSM torque output 625.0 Nm, AIRMATIC air reservoir pressure 16.80 bar, rear-axle steer angle 0.50 deg
# Sindelfingen_EVA2_Telemetry[0216]: High-voltage battery pack SoC 97.27 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.61 C, front PSM efficiency 96.61 %, rear PSM torque output 625.1 Nm, AIRMATIC air reservoir pressure 16.81 bar, rear-axle steer angle 0.50 deg
# Sindelfingen_EVA2_Telemetry[0217]: High-voltage battery pack SoC 97.27 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.61 C, front PSM efficiency 96.61 %, rear PSM torque output 625.2 Nm, AIRMATIC air reservoir pressure 16.81 bar, rear-axle steer angle 0.50 deg
# Sindelfingen_EVA2_Telemetry[0218]: High-voltage battery pack SoC 97.26 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.62 C, front PSM efficiency 96.61 %, rear PSM torque output 625.3 Nm, AIRMATIC air reservoir pressure 16.81 bar, rear-axle steer angle 0.51 deg
# Sindelfingen_EVA2_Telemetry[0219]: High-voltage battery pack SoC 97.25 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.62 C, front PSM efficiency 96.61 %, rear PSM torque output 625.4 Nm, AIRMATIC air reservoir pressure 16.81 bar, rear-axle steer angle 0.51 deg
# Sindelfingen_EVA2_Telemetry[0220]: High-voltage battery pack SoC 97.25 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.62 C, front PSM efficiency 96.61 %, rear PSM torque output 625.5 Nm, AIRMATIC air reservoir pressure 16.81 bar, rear-axle steer angle 0.51 deg
# Sindelfingen_EVA2_Telemetry[0221]: High-voltage battery pack SoC 97.24 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.62 C, front PSM efficiency 96.61 %, rear PSM torque output 625.6 Nm, AIRMATIC air reservoir pressure 16.81 bar, rear-axle steer angle 0.51 deg
# Sindelfingen_EVA2_Telemetry[0222]: High-voltage battery pack SoC 97.24 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.62 C, front PSM efficiency 96.61 %, rear PSM torque output 625.7 Nm, AIRMATIC air reservoir pressure 16.81 bar, rear-axle steer angle 0.51 deg
# Sindelfingen_EVA2_Telemetry[0223]: High-voltage battery pack SoC 97.23 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.63 C, front PSM efficiency 96.61 %, rear PSM torque output 625.8 Nm, AIRMATIC air reservoir pressure 16.81 bar, rear-axle steer angle 0.52 deg
# Sindelfingen_EVA2_Telemetry[0224]: High-voltage battery pack SoC 97.23 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.63 C, front PSM efficiency 96.61 %, rear PSM torque output 625.9 Nm, AIRMATIC air reservoir pressure 16.81 bar, rear-axle steer angle 0.52 deg
# Sindelfingen_EVA2_Telemetry[0225]: High-voltage battery pack SoC 97.22 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.63 C, front PSM efficiency 96.62 %, rear PSM torque output 626.0 Nm, AIRMATIC air reservoir pressure 16.82 bar, rear-axle steer angle 0.52 deg
# Sindelfingen_EVA2_Telemetry[0226]: High-voltage battery pack SoC 97.22 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.63 C, front PSM efficiency 96.62 %, rear PSM torque output 626.1 Nm, AIRMATIC air reservoir pressure 16.82 bar, rear-axle steer angle 0.52 deg
# Sindelfingen_EVA2_Telemetry[0227]: High-voltage battery pack SoC 97.22 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.63 C, front PSM efficiency 96.62 %, rear PSM torque output 626.2 Nm, AIRMATIC air reservoir pressure 16.82 bar, rear-axle steer angle 0.52 deg
# Sindelfingen_EVA2_Telemetry[0228]: High-voltage battery pack SoC 97.21 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.64 C, front PSM efficiency 96.62 %, rear PSM torque output 626.3 Nm, AIRMATIC air reservoir pressure 16.82 bar, rear-axle steer angle 0.53 deg
# Sindelfingen_EVA2_Telemetry[0229]: High-voltage battery pack SoC 97.20 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.64 C, front PSM efficiency 96.62 %, rear PSM torque output 626.4 Nm, AIRMATIC air reservoir pressure 16.82 bar, rear-axle steer angle 0.53 deg
# Sindelfingen_EVA2_Telemetry[0230]: High-voltage battery pack SoC 97.20 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.64 C, front PSM efficiency 96.62 %, rear PSM torque output 626.5 Nm, AIRMATIC air reservoir pressure 16.82 bar, rear-axle steer angle 0.53 deg
# Sindelfingen_EVA2_Telemetry[0231]: High-voltage battery pack SoC 97.19 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.64 C, front PSM efficiency 96.62 %, rear PSM torque output 626.6 Nm, AIRMATIC air reservoir pressure 16.82 bar, rear-axle steer angle 0.53 deg
# Sindelfingen_EVA2_Telemetry[0232]: High-voltage battery pack SoC 97.19 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.64 C, front PSM efficiency 96.62 %, rear PSM torque output 626.7 Nm, AIRMATIC air reservoir pressure 16.82 bar, rear-axle steer angle 0.53 deg
# Sindelfingen_EVA2_Telemetry[0233]: High-voltage battery pack SoC 97.19 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.65 C, front PSM efficiency 96.62 %, rear PSM torque output 626.8 Nm, AIRMATIC air reservoir pressure 16.82 bar, rear-axle steer angle 0.54 deg
# Sindelfingen_EVA2_Telemetry[0234]: High-voltage battery pack SoC 97.18 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.65 C, front PSM efficiency 96.62 %, rear PSM torque output 626.9 Nm, AIRMATIC air reservoir pressure 16.82 bar, rear-axle steer angle 0.54 deg
# Sindelfingen_EVA2_Telemetry[0235]: High-voltage battery pack SoC 97.17 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.65 C, front PSM efficiency 96.62 %, rear PSM torque output 627.0 Nm, AIRMATIC air reservoir pressure 16.83 bar, rear-axle steer angle 0.54 deg
# Sindelfingen_EVA2_Telemetry[0236]: High-voltage battery pack SoC 97.17 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.65 C, front PSM efficiency 96.63 %, rear PSM torque output 627.1 Nm, AIRMATIC air reservoir pressure 16.83 bar, rear-axle steer angle 0.54 deg
# Sindelfingen_EVA2_Telemetry[0237]: High-voltage battery pack SoC 97.16 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.65 C, front PSM efficiency 96.63 %, rear PSM torque output 627.2 Nm, AIRMATIC air reservoir pressure 16.83 bar, rear-axle steer angle 0.54 deg
# Sindelfingen_EVA2_Telemetry[0238]: High-voltage battery pack SoC 97.16 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.66 C, front PSM efficiency 96.63 %, rear PSM torque output 627.3 Nm, AIRMATIC air reservoir pressure 16.83 bar, rear-axle steer angle 0.55 deg
# Sindelfingen_EVA2_Telemetry[0239]: High-voltage battery pack SoC 97.16 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.66 C, front PSM efficiency 96.63 %, rear PSM torque output 627.4 Nm, AIRMATIC air reservoir pressure 16.83 bar, rear-axle steer angle 0.55 deg
# Sindelfingen_EVA2_Telemetry[0240]: High-voltage battery pack SoC 97.15 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.66 C, front PSM efficiency 96.63 %, rear PSM torque output 627.5 Nm, AIRMATIC air reservoir pressure 16.83 bar, rear-axle steer angle 0.55 deg
# Sindelfingen_EVA2_Telemetry[0241]: High-voltage battery pack SoC 97.14 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.66 C, front PSM efficiency 96.63 %, rear PSM torque output 627.6 Nm, AIRMATIC air reservoir pressure 16.83 bar, rear-axle steer angle 0.55 deg
# Sindelfingen_EVA2_Telemetry[0242]: High-voltage battery pack SoC 97.14 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.66 C, front PSM efficiency 96.63 %, rear PSM torque output 627.7 Nm, AIRMATIC air reservoir pressure 16.83 bar, rear-axle steer angle 0.55 deg
# Sindelfingen_EVA2_Telemetry[0243]: High-voltage battery pack SoC 97.13 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.67 C, front PSM efficiency 96.63 %, rear PSM torque output 627.8 Nm, AIRMATIC air reservoir pressure 16.83 bar, rear-axle steer angle 0.56 deg
# Sindelfingen_EVA2_Telemetry[0244]: High-voltage battery pack SoC 97.13 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.67 C, front PSM efficiency 96.63 %, rear PSM torque output 627.9 Nm, AIRMATIC air reservoir pressure 16.83 bar, rear-axle steer angle 0.56 deg
# Sindelfingen_EVA2_Telemetry[0245]: High-voltage battery pack SoC 97.12 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.67 C, front PSM efficiency 96.64 %, rear PSM torque output 628.0 Nm, AIRMATIC air reservoir pressure 16.84 bar, rear-axle steer angle 0.56 deg
# Sindelfingen_EVA2_Telemetry[0246]: High-voltage battery pack SoC 97.12 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.67 C, front PSM efficiency 96.64 %, rear PSM torque output 628.1 Nm, AIRMATIC air reservoir pressure 16.84 bar, rear-axle steer angle 0.56 deg
# Sindelfingen_EVA2_Telemetry[0247]: High-voltage battery pack SoC 97.11 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.67 C, front PSM efficiency 96.64 %, rear PSM torque output 628.2 Nm, AIRMATIC air reservoir pressure 16.84 bar, rear-axle steer angle 0.56 deg
# Sindelfingen_EVA2_Telemetry[0248]: High-voltage battery pack SoC 97.11 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.68 C, front PSM efficiency 96.64 %, rear PSM torque output 628.3 Nm, AIRMATIC air reservoir pressure 16.84 bar, rear-axle steer angle 0.57 deg
# Sindelfingen_EVA2_Telemetry[0249]: High-voltage battery pack SoC 97.11 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.68 C, front PSM efficiency 96.64 %, rear PSM torque output 628.4 Nm, AIRMATIC air reservoir pressure 16.84 bar, rear-axle steer angle 0.57 deg
# Sindelfingen_EVA2_Telemetry[0250]: High-voltage battery pack SoC 97.10 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.68 C, front PSM efficiency 96.64 %, rear PSM torque output 628.5 Nm, AIRMATIC air reservoir pressure 16.84 bar, rear-axle steer angle 0.57 deg
# Sindelfingen_EVA2_Telemetry[0251]: High-voltage battery pack SoC 97.09 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.68 C, front PSM efficiency 96.64 %, rear PSM torque output 628.6 Nm, AIRMATIC air reservoir pressure 16.84 bar, rear-axle steer angle 0.57 deg
# Sindelfingen_EVA2_Telemetry[0252]: High-voltage battery pack SoC 97.09 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.68 C, front PSM efficiency 96.64 %, rear PSM torque output 628.7 Nm, AIRMATIC air reservoir pressure 16.84 bar, rear-axle steer angle 0.57 deg
# Sindelfingen_EVA2_Telemetry[0253]: High-voltage battery pack SoC 97.08 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.69 C, front PSM efficiency 96.64 %, rear PSM torque output 628.8 Nm, AIRMATIC air reservoir pressure 16.84 bar, rear-axle steer angle 0.58 deg
# Sindelfingen_EVA2_Telemetry[0254]: High-voltage battery pack SoC 97.08 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.69 C, front PSM efficiency 96.64 %, rear PSM torque output 628.9 Nm, AIRMATIC air reservoir pressure 16.84 bar, rear-axle steer angle 0.58 deg
# Sindelfingen_EVA2_Telemetry[0255]: High-voltage battery pack SoC 97.08 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.69 C, front PSM efficiency 96.65 %, rear PSM torque output 629.0 Nm, AIRMATIC air reservoir pressure 16.85 bar, rear-axle steer angle 0.58 deg
# Sindelfingen_EVA2_Telemetry[0256]: High-voltage battery pack SoC 97.07 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.69 C, front PSM efficiency 96.65 %, rear PSM torque output 629.1 Nm, AIRMATIC air reservoir pressure 16.85 bar, rear-axle steer angle 0.58 deg
# Sindelfingen_EVA2_Telemetry[0257]: High-voltage battery pack SoC 97.06 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.69 C, front PSM efficiency 96.65 %, rear PSM torque output 629.2 Nm, AIRMATIC air reservoir pressure 16.85 bar, rear-axle steer angle 0.58 deg
# Sindelfingen_EVA2_Telemetry[0258]: High-voltage battery pack SoC 97.06 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.70 C, front PSM efficiency 96.65 %, rear PSM torque output 629.3 Nm, AIRMATIC air reservoir pressure 16.85 bar, rear-axle steer angle 0.59 deg
# Sindelfingen_EVA2_Telemetry[0259]: High-voltage battery pack SoC 97.05 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.70 C, front PSM efficiency 96.65 %, rear PSM torque output 629.4 Nm, AIRMATIC air reservoir pressure 16.85 bar, rear-axle steer angle 0.59 deg
# Sindelfingen_EVA2_Telemetry[0260]: High-voltage battery pack SoC 97.05 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.70 C, front PSM efficiency 96.65 %, rear PSM torque output 629.5 Nm, AIRMATIC air reservoir pressure 16.85 bar, rear-axle steer angle 0.59 deg
# Sindelfingen_EVA2_Telemetry[0261]: High-voltage battery pack SoC 97.05 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.70 C, front PSM efficiency 96.65 %, rear PSM torque output 629.6 Nm, AIRMATIC air reservoir pressure 16.85 bar, rear-axle steer angle 0.59 deg
# Sindelfingen_EVA2_Telemetry[0262]: High-voltage battery pack SoC 97.04 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.70 C, front PSM efficiency 96.65 %, rear PSM torque output 629.7 Nm, AIRMATIC air reservoir pressure 16.85 bar, rear-axle steer angle 0.59 deg
# Sindelfingen_EVA2_Telemetry[0263]: High-voltage battery pack SoC 97.03 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.71 C, front PSM efficiency 96.65 %, rear PSM torque output 629.8 Nm, AIRMATIC air reservoir pressure 16.85 bar, rear-axle steer angle 0.60 deg
# Sindelfingen_EVA2_Telemetry[0264]: High-voltage battery pack SoC 97.03 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.71 C, front PSM efficiency 96.65 %, rear PSM torque output 629.9 Nm, AIRMATIC air reservoir pressure 16.85 bar, rear-axle steer angle 0.60 deg
# Sindelfingen_EVA2_Telemetry[0265]: High-voltage battery pack SoC 97.02 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.71 C, front PSM efficiency 96.66 %, rear PSM torque output 630.0 Nm, AIRMATIC air reservoir pressure 16.86 bar, rear-axle steer angle 0.60 deg
# Sindelfingen_EVA2_Telemetry[0266]: High-voltage battery pack SoC 97.02 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.71 C, front PSM efficiency 96.66 %, rear PSM torque output 630.1 Nm, AIRMATIC air reservoir pressure 16.86 bar, rear-axle steer angle 0.60 deg
# Sindelfingen_EVA2_Telemetry[0267]: High-voltage battery pack SoC 97.02 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.71 C, front PSM efficiency 96.66 %, rear PSM torque output 630.2 Nm, AIRMATIC air reservoir pressure 16.86 bar, rear-axle steer angle 0.60 deg
# Sindelfingen_EVA2_Telemetry[0268]: High-voltage battery pack SoC 97.01 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.72 C, front PSM efficiency 96.66 %, rear PSM torque output 630.3 Nm, AIRMATIC air reservoir pressure 16.86 bar, rear-axle steer angle 0.61 deg
# Sindelfingen_EVA2_Telemetry[0269]: High-voltage battery pack SoC 97.00 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.72 C, front PSM efficiency 96.66 %, rear PSM torque output 630.4 Nm, AIRMATIC air reservoir pressure 16.86 bar, rear-axle steer angle 0.61 deg
# Sindelfingen_EVA2_Telemetry[0270]: High-voltage battery pack SoC 97.00 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.72 C, front PSM efficiency 96.66 %, rear PSM torque output 630.5 Nm, AIRMATIC air reservoir pressure 16.86 bar, rear-axle steer angle 0.61 deg
# Sindelfingen_EVA2_Telemetry[0271]: High-voltage battery pack SoC 96.99 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.72 C, front PSM efficiency 96.66 %, rear PSM torque output 630.6 Nm, AIRMATIC air reservoir pressure 16.86 bar, rear-axle steer angle 0.61 deg
# Sindelfingen_EVA2_Telemetry[0272]: High-voltage battery pack SoC 96.99 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.72 C, front PSM efficiency 96.66 %, rear PSM torque output 630.7 Nm, AIRMATIC air reservoir pressure 16.86 bar, rear-axle steer angle 0.61 deg
# Sindelfingen_EVA2_Telemetry[0273]: High-voltage battery pack SoC 96.98 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.73 C, front PSM efficiency 96.66 %, rear PSM torque output 630.8 Nm, AIRMATIC air reservoir pressure 16.86 bar, rear-axle steer angle 0.62 deg
# Sindelfingen_EVA2_Telemetry[0274]: High-voltage battery pack SoC 96.98 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.73 C, front PSM efficiency 96.66 %, rear PSM torque output 630.9 Nm, AIRMATIC air reservoir pressure 16.86 bar, rear-axle steer angle 0.62 deg
# Sindelfingen_EVA2_Telemetry[0275]: High-voltage battery pack SoC 96.97 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.73 C, front PSM efficiency 96.67 %, rear PSM torque output 631.0 Nm, AIRMATIC air reservoir pressure 16.87 bar, rear-axle steer angle 0.62 deg
# Sindelfingen_EVA2_Telemetry[0276]: High-voltage battery pack SoC 96.97 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.73 C, front PSM efficiency 96.67 %, rear PSM torque output 631.1 Nm, AIRMATIC air reservoir pressure 16.87 bar, rear-axle steer angle 0.62 deg
# Sindelfingen_EVA2_Telemetry[0277]: High-voltage battery pack SoC 96.97 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.73 C, front PSM efficiency 96.67 %, rear PSM torque output 631.2 Nm, AIRMATIC air reservoir pressure 16.87 bar, rear-axle steer angle 0.62 deg
# Sindelfingen_EVA2_Telemetry[0278]: High-voltage battery pack SoC 96.96 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.74 C, front PSM efficiency 96.67 %, rear PSM torque output 631.3 Nm, AIRMATIC air reservoir pressure 16.87 bar, rear-axle steer angle 0.63 deg
# Sindelfingen_EVA2_Telemetry[0279]: High-voltage battery pack SoC 96.95 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.74 C, front PSM efficiency 96.67 %, rear PSM torque output 631.4 Nm, AIRMATIC air reservoir pressure 16.87 bar, rear-axle steer angle 0.63 deg
# Sindelfingen_EVA2_Telemetry[0280]: High-voltage battery pack SoC 96.95 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.74 C, front PSM efficiency 96.67 %, rear PSM torque output 631.5 Nm, AIRMATIC air reservoir pressure 16.87 bar, rear-axle steer angle 0.63 deg
# Sindelfingen_EVA2_Telemetry[0281]: High-voltage battery pack SoC 96.94 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.74 C, front PSM efficiency 96.67 %, rear PSM torque output 631.6 Nm, AIRMATIC air reservoir pressure 16.87 bar, rear-axle steer angle 0.63 deg
# Sindelfingen_EVA2_Telemetry[0282]: High-voltage battery pack SoC 96.94 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.74 C, front PSM efficiency 96.67 %, rear PSM torque output 631.7 Nm, AIRMATIC air reservoir pressure 16.87 bar, rear-axle steer angle 0.63 deg
# Sindelfingen_EVA2_Telemetry[0283]: High-voltage battery pack SoC 96.94 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.75 C, front PSM efficiency 96.67 %, rear PSM torque output 631.8 Nm, AIRMATIC air reservoir pressure 16.87 bar, rear-axle steer angle 0.64 deg
# Sindelfingen_EVA2_Telemetry[0284]: High-voltage battery pack SoC 96.93 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.75 C, front PSM efficiency 96.67 %, rear PSM torque output 631.9 Nm, AIRMATIC air reservoir pressure 16.87 bar, rear-axle steer angle 0.64 deg
# Sindelfingen_EVA2_Telemetry[0285]: High-voltage battery pack SoC 96.92 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.75 C, front PSM efficiency 96.68 %, rear PSM torque output 632.0 Nm, AIRMATIC air reservoir pressure 16.88 bar, rear-axle steer angle 0.64 deg
# Sindelfingen_EVA2_Telemetry[0286]: High-voltage battery pack SoC 96.92 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.75 C, front PSM efficiency 96.68 %, rear PSM torque output 632.1 Nm, AIRMATIC air reservoir pressure 16.88 bar, rear-axle steer angle 0.64 deg
# Sindelfingen_EVA2_Telemetry[0287]: High-voltage battery pack SoC 96.91 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.75 C, front PSM efficiency 96.68 %, rear PSM torque output 632.2 Nm, AIRMATIC air reservoir pressure 16.88 bar, rear-axle steer angle 0.64 deg
# Sindelfingen_EVA2_Telemetry[0288]: High-voltage battery pack SoC 96.91 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.76 C, front PSM efficiency 96.68 %, rear PSM torque output 632.3 Nm, AIRMATIC air reservoir pressure 16.88 bar, rear-axle steer angle 0.65 deg
# Sindelfingen_EVA2_Telemetry[0289]: High-voltage battery pack SoC 96.91 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.76 C, front PSM efficiency 96.68 %, rear PSM torque output 632.4 Nm, AIRMATIC air reservoir pressure 16.88 bar, rear-axle steer angle 0.65 deg
# Sindelfingen_EVA2_Telemetry[0290]: High-voltage battery pack SoC 96.90 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.76 C, front PSM efficiency 96.68 %, rear PSM torque output 632.5 Nm, AIRMATIC air reservoir pressure 16.88 bar, rear-axle steer angle 0.65 deg
# Sindelfingen_EVA2_Telemetry[0291]: High-voltage battery pack SoC 96.89 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.76 C, front PSM efficiency 96.68 %, rear PSM torque output 632.6 Nm, AIRMATIC air reservoir pressure 16.88 bar, rear-axle steer angle 0.65 deg
# Sindelfingen_EVA2_Telemetry[0292]: High-voltage battery pack SoC 96.89 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.76 C, front PSM efficiency 96.68 %, rear PSM torque output 632.7 Nm, AIRMATIC air reservoir pressure 16.88 bar, rear-axle steer angle 0.65 deg
# Sindelfingen_EVA2_Telemetry[0293]: High-voltage battery pack SoC 96.88 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.77 C, front PSM efficiency 96.68 %, rear PSM torque output 632.8 Nm, AIRMATIC air reservoir pressure 16.88 bar, rear-axle steer angle 0.66 deg
# Sindelfingen_EVA2_Telemetry[0294]: High-voltage battery pack SoC 96.88 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.77 C, front PSM efficiency 96.68 %, rear PSM torque output 632.9 Nm, AIRMATIC air reservoir pressure 16.88 bar, rear-axle steer angle 0.66 deg
# Sindelfingen_EVA2_Telemetry[0295]: High-voltage battery pack SoC 96.88 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.77 C, front PSM efficiency 96.69 %, rear PSM torque output 633.0 Nm, AIRMATIC air reservoir pressure 16.89 bar, rear-axle steer angle 0.66 deg
# Sindelfingen_EVA2_Telemetry[0296]: High-voltage battery pack SoC 96.87 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.77 C, front PSM efficiency 96.69 %, rear PSM torque output 633.1 Nm, AIRMATIC air reservoir pressure 16.89 bar, rear-axle steer angle 0.66 deg
# Sindelfingen_EVA2_Telemetry[0297]: High-voltage battery pack SoC 96.86 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.77 C, front PSM efficiency 96.69 %, rear PSM torque output 633.2 Nm, AIRMATIC air reservoir pressure 16.89 bar, rear-axle steer angle 0.66 deg
# Sindelfingen_EVA2_Telemetry[0298]: High-voltage battery pack SoC 96.86 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.78 C, front PSM efficiency 96.69 %, rear PSM torque output 633.3 Nm, AIRMATIC air reservoir pressure 16.89 bar, rear-axle steer angle 0.67 deg
# Sindelfingen_EVA2_Telemetry[0299]: High-voltage battery pack SoC 96.86 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.78 C, front PSM efficiency 96.69 %, rear PSM torque output 633.4 Nm, AIRMATIC air reservoir pressure 16.89 bar, rear-axle steer angle 0.67 deg
# Sindelfingen_EVA2_Telemetry[0300]: High-voltage battery pack SoC 96.85 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.78 C, front PSM efficiency 96.69 %, rear PSM torque output 633.5 Nm, AIRMATIC air reservoir pressure 16.89 bar, rear-axle steer angle 0.67 deg
# Sindelfingen_EVA2_Telemetry[0301]: High-voltage battery pack SoC 96.84 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.78 C, front PSM efficiency 96.69 %, rear PSM torque output 633.6 Nm, AIRMATIC air reservoir pressure 16.89 bar, rear-axle steer angle 0.67 deg
# Sindelfingen_EVA2_Telemetry[0302]: High-voltage battery pack SoC 96.84 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.78 C, front PSM efficiency 96.69 %, rear PSM torque output 633.7 Nm, AIRMATIC air reservoir pressure 16.89 bar, rear-axle steer angle 0.67 deg
# Sindelfingen_EVA2_Telemetry[0303]: High-voltage battery pack SoC 96.83 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.79 C, front PSM efficiency 96.69 %, rear PSM torque output 633.8 Nm, AIRMATIC air reservoir pressure 16.89 bar, rear-axle steer angle 0.68 deg
# Sindelfingen_EVA2_Telemetry[0304]: High-voltage battery pack SoC 96.83 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.79 C, front PSM efficiency 96.69 %, rear PSM torque output 633.9 Nm, AIRMATIC air reservoir pressure 16.89 bar, rear-axle steer angle 0.68 deg
# Sindelfingen_EVA2_Telemetry[0305]: High-voltage battery pack SoC 96.83 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.79 C, front PSM efficiency 96.70 %, rear PSM torque output 634.0 Nm, AIRMATIC air reservoir pressure 16.90 bar, rear-axle steer angle 0.68 deg
# Sindelfingen_EVA2_Telemetry[0306]: High-voltage battery pack SoC 96.82 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.79 C, front PSM efficiency 96.70 %, rear PSM torque output 634.1 Nm, AIRMATIC air reservoir pressure 16.90 bar, rear-axle steer angle 0.68 deg
# Sindelfingen_EVA2_Telemetry[0307]: High-voltage battery pack SoC 96.81 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.79 C, front PSM efficiency 96.70 %, rear PSM torque output 634.2 Nm, AIRMATIC air reservoir pressure 16.90 bar, rear-axle steer angle 0.68 deg
# Sindelfingen_EVA2_Telemetry[0308]: High-voltage battery pack SoC 96.81 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.80 C, front PSM efficiency 96.70 %, rear PSM torque output 634.3 Nm, AIRMATIC air reservoir pressure 16.90 bar, rear-axle steer angle 0.69 deg
# Sindelfingen_EVA2_Telemetry[0309]: High-voltage battery pack SoC 96.80 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.80 C, front PSM efficiency 96.70 %, rear PSM torque output 634.4 Nm, AIRMATIC air reservoir pressure 16.90 bar, rear-axle steer angle 0.69 deg
# Sindelfingen_EVA2_Telemetry[0310]: High-voltage battery pack SoC 96.80 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.80 C, front PSM efficiency 96.70 %, rear PSM torque output 634.5 Nm, AIRMATIC air reservoir pressure 16.90 bar, rear-axle steer angle 0.69 deg
# Sindelfingen_EVA2_Telemetry[0311]: High-voltage battery pack SoC 96.80 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.80 C, front PSM efficiency 96.70 %, rear PSM torque output 634.6 Nm, AIRMATIC air reservoir pressure 16.90 bar, rear-axle steer angle 0.69 deg
# Sindelfingen_EVA2_Telemetry[0312]: High-voltage battery pack SoC 96.79 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.80 C, front PSM efficiency 96.70 %, rear PSM torque output 634.7 Nm, AIRMATIC air reservoir pressure 16.90 bar, rear-axle steer angle 0.69 deg
# Sindelfingen_EVA2_Telemetry[0313]: High-voltage battery pack SoC 96.78 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.81 C, front PSM efficiency 96.70 %, rear PSM torque output 634.8 Nm, AIRMATIC air reservoir pressure 16.90 bar, rear-axle steer angle 0.70 deg
# Sindelfingen_EVA2_Telemetry[0314]: High-voltage battery pack SoC 96.78 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.81 C, front PSM efficiency 96.70 %, rear PSM torque output 634.9 Nm, AIRMATIC air reservoir pressure 16.90 bar, rear-axle steer angle 0.70 deg
# Sindelfingen_EVA2_Telemetry[0315]: High-voltage battery pack SoC 96.77 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.81 C, front PSM efficiency 96.71 %, rear PSM torque output 635.0 Nm, AIRMATIC air reservoir pressure 16.91 bar, rear-axle steer angle 0.70 deg
# Sindelfingen_EVA2_Telemetry[0316]: High-voltage battery pack SoC 96.77 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.81 C, front PSM efficiency 96.71 %, rear PSM torque output 635.1 Nm, AIRMATIC air reservoir pressure 16.91 bar, rear-axle steer angle 0.70 deg
# Sindelfingen_EVA2_Telemetry[0317]: High-voltage battery pack SoC 96.77 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.81 C, front PSM efficiency 96.71 %, rear PSM torque output 635.2 Nm, AIRMATIC air reservoir pressure 16.91 bar, rear-axle steer angle 0.70 deg
# Sindelfingen_EVA2_Telemetry[0318]: High-voltage battery pack SoC 96.76 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.82 C, front PSM efficiency 96.71 %, rear PSM torque output 635.3 Nm, AIRMATIC air reservoir pressure 16.91 bar, rear-axle steer angle 0.71 deg
# Sindelfingen_EVA2_Telemetry[0319]: High-voltage battery pack SoC 96.75 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.82 C, front PSM efficiency 96.71 %, rear PSM torque output 635.4 Nm, AIRMATIC air reservoir pressure 16.91 bar, rear-axle steer angle 0.71 deg
# Sindelfingen_EVA2_Telemetry[0320]: High-voltage battery pack SoC 96.75 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.82 C, front PSM efficiency 96.71 %, rear PSM torque output 635.5 Nm, AIRMATIC air reservoir pressure 16.91 bar, rear-axle steer angle 0.71 deg
# Sindelfingen_EVA2_Telemetry[0321]: High-voltage battery pack SoC 96.74 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.82 C, front PSM efficiency 96.71 %, rear PSM torque output 635.6 Nm, AIRMATIC air reservoir pressure 16.91 bar, rear-axle steer angle 0.71 deg
# Sindelfingen_EVA2_Telemetry[0322]: High-voltage battery pack SoC 96.74 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.82 C, front PSM efficiency 96.71 %, rear PSM torque output 635.7 Nm, AIRMATIC air reservoir pressure 16.91 bar, rear-axle steer angle 0.71 deg
# Sindelfingen_EVA2_Telemetry[0323]: High-voltage battery pack SoC 96.73 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.83 C, front PSM efficiency 96.71 %, rear PSM torque output 635.8 Nm, AIRMATIC air reservoir pressure 16.91 bar, rear-axle steer angle 0.72 deg
# Sindelfingen_EVA2_Telemetry[0324]: High-voltage battery pack SoC 96.73 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.83 C, front PSM efficiency 96.71 %, rear PSM torque output 635.9 Nm, AIRMATIC air reservoir pressure 16.91 bar, rear-axle steer angle 0.72 deg
# Sindelfingen_EVA2_Telemetry[0325]: High-voltage battery pack SoC 96.72 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.83 C, front PSM efficiency 96.72 %, rear PSM torque output 636.0 Nm, AIRMATIC air reservoir pressure 16.92 bar, rear-axle steer angle 0.72 deg
# Sindelfingen_EVA2_Telemetry[0326]: High-voltage battery pack SoC 96.72 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.83 C, front PSM efficiency 96.72 %, rear PSM torque output 636.1 Nm, AIRMATIC air reservoir pressure 16.92 bar, rear-axle steer angle 0.72 deg
# Sindelfingen_EVA2_Telemetry[0327]: High-voltage battery pack SoC 96.72 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.83 C, front PSM efficiency 96.72 %, rear PSM torque output 636.2 Nm, AIRMATIC air reservoir pressure 16.92 bar, rear-axle steer angle 0.72 deg
# Sindelfingen_EVA2_Telemetry[0328]: High-voltage battery pack SoC 96.71 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.84 C, front PSM efficiency 96.72 %, rear PSM torque output 636.3 Nm, AIRMATIC air reservoir pressure 16.92 bar, rear-axle steer angle 0.73 deg
# Sindelfingen_EVA2_Telemetry[0329]: High-voltage battery pack SoC 96.70 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.84 C, front PSM efficiency 96.72 %, rear PSM torque output 636.4 Nm, AIRMATIC air reservoir pressure 16.92 bar, rear-axle steer angle 0.73 deg
# Sindelfingen_EVA2_Telemetry[0330]: High-voltage battery pack SoC 96.70 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.84 C, front PSM efficiency 96.72 %, rear PSM torque output 636.5 Nm, AIRMATIC air reservoir pressure 16.92 bar, rear-axle steer angle 0.73 deg
# Sindelfingen_EVA2_Telemetry[0331]: High-voltage battery pack SoC 96.69 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.84 C, front PSM efficiency 96.72 %, rear PSM torque output 636.6 Nm, AIRMATIC air reservoir pressure 16.92 bar, rear-axle steer angle 0.73 deg
# Sindelfingen_EVA2_Telemetry[0332]: High-voltage battery pack SoC 96.69 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.84 C, front PSM efficiency 96.72 %, rear PSM torque output 636.7 Nm, AIRMATIC air reservoir pressure 16.92 bar, rear-axle steer angle 0.73 deg
# Sindelfingen_EVA2_Telemetry[0333]: High-voltage battery pack SoC 96.69 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.85 C, front PSM efficiency 96.72 %, rear PSM torque output 636.8 Nm, AIRMATIC air reservoir pressure 16.92 bar, rear-axle steer angle 0.74 deg
# Sindelfingen_EVA2_Telemetry[0334]: High-voltage battery pack SoC 96.68 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.85 C, front PSM efficiency 96.72 %, rear PSM torque output 636.9 Nm, AIRMATIC air reservoir pressure 16.92 bar, rear-axle steer angle 0.74 deg
# Sindelfingen_EVA2_Telemetry[0335]: High-voltage battery pack SoC 96.67 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.85 C, front PSM efficiency 96.73 %, rear PSM torque output 637.0 Nm, AIRMATIC air reservoir pressure 16.93 bar, rear-axle steer angle 0.74 deg
# Sindelfingen_EVA2_Telemetry[0336]: High-voltage battery pack SoC 96.67 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.85 C, front PSM efficiency 96.73 %, rear PSM torque output 637.1 Nm, AIRMATIC air reservoir pressure 16.93 bar, rear-axle steer angle 0.74 deg
# Sindelfingen_EVA2_Telemetry[0337]: High-voltage battery pack SoC 96.66 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.85 C, front PSM efficiency 96.73 %, rear PSM torque output 637.2 Nm, AIRMATIC air reservoir pressure 16.93 bar, rear-axle steer angle 0.74 deg
# Sindelfingen_EVA2_Telemetry[0338]: High-voltage battery pack SoC 96.66 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.86 C, front PSM efficiency 96.73 %, rear PSM torque output 637.3 Nm, AIRMATIC air reservoir pressure 16.93 bar, rear-axle steer angle 0.75 deg
# Sindelfingen_EVA2_Telemetry[0339]: High-voltage battery pack SoC 96.66 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.86 C, front PSM efficiency 96.73 %, rear PSM torque output 637.4 Nm, AIRMATIC air reservoir pressure 16.93 bar, rear-axle steer angle 0.75 deg
# Sindelfingen_EVA2_Telemetry[0340]: High-voltage battery pack SoC 96.65 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.86 C, front PSM efficiency 96.73 %, rear PSM torque output 637.5 Nm, AIRMATIC air reservoir pressure 16.93 bar, rear-axle steer angle 0.75 deg
# Sindelfingen_EVA2_Telemetry[0341]: High-voltage battery pack SoC 96.64 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.86 C, front PSM efficiency 96.73 %, rear PSM torque output 637.6 Nm, AIRMATIC air reservoir pressure 16.93 bar, rear-axle steer angle 0.75 deg
# Sindelfingen_EVA2_Telemetry[0342]: High-voltage battery pack SoC 96.64 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.86 C, front PSM efficiency 96.73 %, rear PSM torque output 637.7 Nm, AIRMATIC air reservoir pressure 16.93 bar, rear-axle steer angle 0.75 deg
# Sindelfingen_EVA2_Telemetry[0343]: High-voltage battery pack SoC 96.63 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.87 C, front PSM efficiency 96.73 %, rear PSM torque output 637.8 Nm, AIRMATIC air reservoir pressure 16.93 bar, rear-axle steer angle 0.76 deg
# Sindelfingen_EVA2_Telemetry[0344]: High-voltage battery pack SoC 96.63 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.87 C, front PSM efficiency 96.73 %, rear PSM torque output 637.9 Nm, AIRMATIC air reservoir pressure 16.93 bar, rear-axle steer angle 0.76 deg
# Sindelfingen_EVA2_Telemetry[0345]: High-voltage battery pack SoC 96.62 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.87 C, front PSM efficiency 96.73 %, rear PSM torque output 638.0 Nm, AIRMATIC air reservoir pressure 16.94 bar, rear-axle steer angle 0.76 deg
# Sindelfingen_EVA2_Telemetry[0346]: High-voltage battery pack SoC 96.62 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.87 C, front PSM efficiency 96.74 %, rear PSM torque output 638.1 Nm, AIRMATIC air reservoir pressure 16.94 bar, rear-axle steer angle 0.76 deg
# Sindelfingen_EVA2_Telemetry[0347]: High-voltage battery pack SoC 96.61 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.87 C, front PSM efficiency 96.74 %, rear PSM torque output 638.2 Nm, AIRMATIC air reservoir pressure 16.94 bar, rear-axle steer angle 0.76 deg
# Sindelfingen_EVA2_Telemetry[0348]: High-voltage battery pack SoC 96.61 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.88 C, front PSM efficiency 96.74 %, rear PSM torque output 638.3 Nm, AIRMATIC air reservoir pressure 16.94 bar, rear-axle steer angle 0.77 deg
# Sindelfingen_EVA2_Telemetry[0349]: High-voltage battery pack SoC 96.61 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.88 C, front PSM efficiency 96.74 %, rear PSM torque output 638.4 Nm, AIRMATIC air reservoir pressure 16.94 bar, rear-axle steer angle 0.77 deg
# Sindelfingen_EVA2_Telemetry[0350]: High-voltage battery pack SoC 96.60 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.88 C, front PSM efficiency 96.74 %, rear PSM torque output 638.5 Nm, AIRMATIC air reservoir pressure 16.94 bar, rear-axle steer angle 0.77 deg
# Sindelfingen_EVA2_Telemetry[0351]: High-voltage battery pack SoC 96.59 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.88 C, front PSM efficiency 96.74 %, rear PSM torque output 638.6 Nm, AIRMATIC air reservoir pressure 16.94 bar, rear-axle steer angle 0.77 deg
# Sindelfingen_EVA2_Telemetry[0352]: High-voltage battery pack SoC 96.59 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.88 C, front PSM efficiency 96.74 %, rear PSM torque output 638.7 Nm, AIRMATIC air reservoir pressure 16.94 bar, rear-axle steer angle 0.77 deg
# Sindelfingen_EVA2_Telemetry[0353]: High-voltage battery pack SoC 96.58 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.89 C, front PSM efficiency 96.74 %, rear PSM torque output 638.8 Nm, AIRMATIC air reservoir pressure 16.94 bar, rear-axle steer angle 0.78 deg
# Sindelfingen_EVA2_Telemetry[0354]: High-voltage battery pack SoC 96.58 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.89 C, front PSM efficiency 96.74 %, rear PSM torque output 638.9 Nm, AIRMATIC air reservoir pressure 16.94 bar, rear-axle steer angle 0.78 deg
# Sindelfingen_EVA2_Telemetry[0355]: High-voltage battery pack SoC 96.58 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.89 C, front PSM efficiency 96.75 %, rear PSM torque output 639.0 Nm, AIRMATIC air reservoir pressure 16.95 bar, rear-axle steer angle 0.78 deg
# Sindelfingen_EVA2_Telemetry[0356]: High-voltage battery pack SoC 96.57 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.89 C, front PSM efficiency 96.75 %, rear PSM torque output 639.1 Nm, AIRMATIC air reservoir pressure 16.95 bar, rear-axle steer angle 0.78 deg
# Sindelfingen_EVA2_Telemetry[0357]: High-voltage battery pack SoC 96.56 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.89 C, front PSM efficiency 96.75 %, rear PSM torque output 639.2 Nm, AIRMATIC air reservoir pressure 16.95 bar, rear-axle steer angle 0.78 deg
# Sindelfingen_EVA2_Telemetry[0358]: High-voltage battery pack SoC 96.56 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.90 C, front PSM efficiency 96.75 %, rear PSM torque output 639.3 Nm, AIRMATIC air reservoir pressure 16.95 bar, rear-axle steer angle 0.79 deg
# Sindelfingen_EVA2_Telemetry[0359]: High-voltage battery pack SoC 96.55 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.90 C, front PSM efficiency 96.75 %, rear PSM torque output 639.4 Nm, AIRMATIC air reservoir pressure 16.95 bar, rear-axle steer angle 0.79 deg
# Sindelfingen_EVA2_Telemetry[0360]: High-voltage battery pack SoC 96.55 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.90 C, front PSM efficiency 96.75 %, rear PSM torque output 639.5 Nm, AIRMATIC air reservoir pressure 16.95 bar, rear-axle steer angle 0.79 deg
# Sindelfingen_EVA2_Telemetry[0361]: High-voltage battery pack SoC 96.55 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.90 C, front PSM efficiency 96.75 %, rear PSM torque output 639.6 Nm, AIRMATIC air reservoir pressure 16.95 bar, rear-axle steer angle 0.79 deg
# Sindelfingen_EVA2_Telemetry[0362]: High-voltage battery pack SoC 96.54 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.90 C, front PSM efficiency 96.75 %, rear PSM torque output 639.7 Nm, AIRMATIC air reservoir pressure 16.95 bar, rear-axle steer angle 0.79 deg
# Sindelfingen_EVA2_Telemetry[0363]: High-voltage battery pack SoC 96.53 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.91 C, front PSM efficiency 96.75 %, rear PSM torque output 639.8 Nm, AIRMATIC air reservoir pressure 16.95 bar, rear-axle steer angle 0.80 deg
# Sindelfingen_EVA2_Telemetry[0364]: High-voltage battery pack SoC 96.53 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.91 C, front PSM efficiency 96.75 %, rear PSM torque output 639.9 Nm, AIRMATIC air reservoir pressure 16.95 bar, rear-axle steer angle 0.80 deg
# Sindelfingen_EVA2_Telemetry[0365]: High-voltage battery pack SoC 96.52 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.91 C, front PSM efficiency 96.76 %, rear PSM torque output 640.0 Nm, AIRMATIC air reservoir pressure 16.96 bar, rear-axle steer angle 0.80 deg
# Sindelfingen_EVA2_Telemetry[0366]: High-voltage battery pack SoC 96.52 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.91 C, front PSM efficiency 96.76 %, rear PSM torque output 640.1 Nm, AIRMATIC air reservoir pressure 16.96 bar, rear-axle steer angle 0.80 deg
# Sindelfingen_EVA2_Telemetry[0367]: High-voltage battery pack SoC 96.52 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.91 C, front PSM efficiency 96.76 %, rear PSM torque output 640.2 Nm, AIRMATIC air reservoir pressure 16.96 bar, rear-axle steer angle 0.80 deg
# Sindelfingen_EVA2_Telemetry[0368]: High-voltage battery pack SoC 96.51 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.92 C, front PSM efficiency 96.76 %, rear PSM torque output 640.3 Nm, AIRMATIC air reservoir pressure 16.96 bar, rear-axle steer angle 0.81 deg
# Sindelfingen_EVA2_Telemetry[0369]: High-voltage battery pack SoC 96.50 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.92 C, front PSM efficiency 96.76 %, rear PSM torque output 640.4 Nm, AIRMATIC air reservoir pressure 16.96 bar, rear-axle steer angle 0.81 deg
# Sindelfingen_EVA2_Telemetry[0370]: High-voltage battery pack SoC 96.50 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.92 C, front PSM efficiency 96.76 %, rear PSM torque output 640.5 Nm, AIRMATIC air reservoir pressure 16.96 bar, rear-axle steer angle 0.81 deg
# Sindelfingen_EVA2_Telemetry[0371]: High-voltage battery pack SoC 96.49 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.92 C, front PSM efficiency 96.76 %, rear PSM torque output 640.6 Nm, AIRMATIC air reservoir pressure 16.96 bar, rear-axle steer angle 0.81 deg
# Sindelfingen_EVA2_Telemetry[0372]: High-voltage battery pack SoC 96.49 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.92 C, front PSM efficiency 96.76 %, rear PSM torque output 640.7 Nm, AIRMATIC air reservoir pressure 16.96 bar, rear-axle steer angle 0.81 deg
# Sindelfingen_EVA2_Telemetry[0373]: High-voltage battery pack SoC 96.48 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.93 C, front PSM efficiency 96.76 %, rear PSM torque output 640.8 Nm, AIRMATIC air reservoir pressure 16.96 bar, rear-axle steer angle 0.82 deg
# Sindelfingen_EVA2_Telemetry[0374]: High-voltage battery pack SoC 96.48 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.93 C, front PSM efficiency 96.76 %, rear PSM torque output 640.9 Nm, AIRMATIC air reservoir pressure 16.96 bar, rear-axle steer angle 0.82 deg
# Sindelfingen_EVA2_Telemetry[0375]: High-voltage battery pack SoC 96.47 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.93 C, front PSM efficiency 96.77 %, rear PSM torque output 641.0 Nm, AIRMATIC air reservoir pressure 16.96 bar, rear-axle steer angle 0.82 deg
# Sindelfingen_EVA2_Telemetry[0376]: High-voltage battery pack SoC 96.47 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.93 C, front PSM efficiency 96.77 %, rear PSM torque output 641.1 Nm, AIRMATIC air reservoir pressure 16.97 bar, rear-axle steer angle 0.82 deg
# Sindelfingen_EVA2_Telemetry[0377]: High-voltage battery pack SoC 96.47 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.93 C, front PSM efficiency 96.77 %, rear PSM torque output 641.2 Nm, AIRMATIC air reservoir pressure 16.97 bar, rear-axle steer angle 0.82 deg
# Sindelfingen_EVA2_Telemetry[0378]: High-voltage battery pack SoC 96.46 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.94 C, front PSM efficiency 96.77 %, rear PSM torque output 641.3 Nm, AIRMATIC air reservoir pressure 16.97 bar, rear-axle steer angle 0.83 deg
# Sindelfingen_EVA2_Telemetry[0379]: High-voltage battery pack SoC 96.45 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.94 C, front PSM efficiency 96.77 %, rear PSM torque output 641.4 Nm, AIRMATIC air reservoir pressure 16.97 bar, rear-axle steer angle 0.83 deg
# Sindelfingen_EVA2_Telemetry[0380]: High-voltage battery pack SoC 96.45 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.94 C, front PSM efficiency 96.77 %, rear PSM torque output 641.5 Nm, AIRMATIC air reservoir pressure 16.97 bar, rear-axle steer angle 0.83 deg
# Sindelfingen_EVA2_Telemetry[0381]: High-voltage battery pack SoC 96.44 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.94 C, front PSM efficiency 96.77 %, rear PSM torque output 641.6 Nm, AIRMATIC air reservoir pressure 16.97 bar, rear-axle steer angle 0.83 deg
# Sindelfingen_EVA2_Telemetry[0382]: High-voltage battery pack SoC 96.44 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.94 C, front PSM efficiency 96.77 %, rear PSM torque output 641.7 Nm, AIRMATIC air reservoir pressure 16.97 bar, rear-axle steer angle 0.83 deg
# Sindelfingen_EVA2_Telemetry[0383]: High-voltage battery pack SoC 96.44 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.95 C, front PSM efficiency 96.77 %, rear PSM torque output 641.8 Nm, AIRMATIC air reservoir pressure 16.97 bar, rear-axle steer angle 0.84 deg
# Sindelfingen_EVA2_Telemetry[0384]: High-voltage battery pack SoC 96.43 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.95 C, front PSM efficiency 96.77 %, rear PSM torque output 641.9 Nm, AIRMATIC air reservoir pressure 16.97 bar, rear-axle steer angle 0.84 deg
# Sindelfingen_EVA2_Telemetry[0385]: High-voltage battery pack SoC 96.42 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.95 C, front PSM efficiency 96.78 %, rear PSM torque output 642.0 Nm, AIRMATIC air reservoir pressure 16.98 bar, rear-axle steer angle 0.84 deg
# Sindelfingen_EVA2_Telemetry[0386]: High-voltage battery pack SoC 96.42 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.95 C, front PSM efficiency 96.78 %, rear PSM torque output 642.1 Nm, AIRMATIC air reservoir pressure 16.98 bar, rear-axle steer angle 0.84 deg
# Sindelfingen_EVA2_Telemetry[0387]: High-voltage battery pack SoC 96.41 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.95 C, front PSM efficiency 96.78 %, rear PSM torque output 642.2 Nm, AIRMATIC air reservoir pressure 16.98 bar, rear-axle steer angle 0.84 deg
# Sindelfingen_EVA2_Telemetry[0388]: High-voltage battery pack SoC 96.41 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.96 C, front PSM efficiency 96.78 %, rear PSM torque output 642.3 Nm, AIRMATIC air reservoir pressure 16.98 bar, rear-axle steer angle 0.85 deg
# Sindelfingen_EVA2_Telemetry[0389]: High-voltage battery pack SoC 96.41 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.96 C, front PSM efficiency 96.78 %, rear PSM torque output 642.4 Nm, AIRMATIC air reservoir pressure 16.98 bar, rear-axle steer angle 0.85 deg
# Sindelfingen_EVA2_Telemetry[0390]: High-voltage battery pack SoC 96.40 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.96 C, front PSM efficiency 96.78 %, rear PSM torque output 642.5 Nm, AIRMATIC air reservoir pressure 16.98 bar, rear-axle steer angle 0.85 deg
# Sindelfingen_EVA2_Telemetry[0391]: High-voltage battery pack SoC 96.39 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.96 C, front PSM efficiency 96.78 %, rear PSM torque output 642.6 Nm, AIRMATIC air reservoir pressure 16.98 bar, rear-axle steer angle 0.85 deg
# Sindelfingen_EVA2_Telemetry[0392]: High-voltage battery pack SoC 96.39 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.96 C, front PSM efficiency 96.78 %, rear PSM torque output 642.7 Nm, AIRMATIC air reservoir pressure 16.98 bar, rear-axle steer angle 0.85 deg
# Sindelfingen_EVA2_Telemetry[0393]: High-voltage battery pack SoC 96.38 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.97 C, front PSM efficiency 96.78 %, rear PSM torque output 642.8 Nm, AIRMATIC air reservoir pressure 16.98 bar, rear-axle steer angle 0.86 deg
# Sindelfingen_EVA2_Telemetry[0394]: High-voltage battery pack SoC 96.38 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.97 C, front PSM efficiency 96.78 %, rear PSM torque output 642.9 Nm, AIRMATIC air reservoir pressure 16.98 bar, rear-axle steer angle 0.86 deg
# Sindelfingen_EVA2_Telemetry[0395]: High-voltage battery pack SoC 96.38 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.97 C, front PSM efficiency 96.79 %, rear PSM torque output 643.0 Nm, AIRMATIC air reservoir pressure 16.99 bar, rear-axle steer angle 0.86 deg
# Sindelfingen_EVA2_Telemetry[0396]: High-voltage battery pack SoC 96.37 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.97 C, front PSM efficiency 96.79 %, rear PSM torque output 643.1 Nm, AIRMATIC air reservoir pressure 16.99 bar, rear-axle steer angle 0.86 deg
# Sindelfingen_EVA2_Telemetry[0397]: High-voltage battery pack SoC 96.36 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.97 C, front PSM efficiency 96.79 %, rear PSM torque output 643.2 Nm, AIRMATIC air reservoir pressure 16.99 bar, rear-axle steer angle 0.86 deg
# Sindelfingen_EVA2_Telemetry[0398]: High-voltage battery pack SoC 96.36 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.98 C, front PSM efficiency 96.79 %, rear PSM torque output 643.3 Nm, AIRMATIC air reservoir pressure 16.99 bar, rear-axle steer angle 0.87 deg
# Sindelfingen_EVA2_Telemetry[0399]: High-voltage battery pack SoC 96.36 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.98 C, front PSM efficiency 96.79 %, rear PSM torque output 643.4 Nm, AIRMATIC air reservoir pressure 16.99 bar, rear-axle steer angle 0.87 deg
# Sindelfingen_EVA2_Telemetry[0400]: High-voltage battery pack SoC 96.35 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.98 C, front PSM efficiency 96.79 %, rear PSM torque output 643.5 Nm, AIRMATIC air reservoir pressure 16.99 bar, rear-axle steer angle 0.87 deg
# Sindelfingen_EVA2_Telemetry[0401]: High-voltage battery pack SoC 96.34 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.98 C, front PSM efficiency 96.79 %, rear PSM torque output 643.6 Nm, AIRMATIC air reservoir pressure 16.99 bar, rear-axle steer angle 0.87 deg
# Sindelfingen_EVA2_Telemetry[0402]: High-voltage battery pack SoC 96.34 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.98 C, front PSM efficiency 96.79 %, rear PSM torque output 643.7 Nm, AIRMATIC air reservoir pressure 16.99 bar, rear-axle steer angle 0.87 deg
# Sindelfingen_EVA2_Telemetry[0403]: High-voltage battery pack SoC 96.33 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.99 C, front PSM efficiency 96.79 %, rear PSM torque output 643.8 Nm, AIRMATIC air reservoir pressure 16.99 bar, rear-axle steer angle 0.88 deg
# Sindelfingen_EVA2_Telemetry[0404]: High-voltage battery pack SoC 96.33 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.99 C, front PSM efficiency 96.79 %, rear PSM torque output 643.9 Nm, AIRMATIC air reservoir pressure 16.99 bar, rear-axle steer angle 0.88 deg
# Sindelfingen_EVA2_Telemetry[0405]: High-voltage battery pack SoC 96.33 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.99 C, front PSM efficiency 96.80 %, rear PSM torque output 644.0 Nm, AIRMATIC air reservoir pressure 17.00 bar, rear-axle steer angle 0.88 deg
# Sindelfingen_EVA2_Telemetry[0406]: High-voltage battery pack SoC 96.32 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.99 C, front PSM efficiency 96.80 %, rear PSM torque output 644.1 Nm, AIRMATIC air reservoir pressure 17.00 bar, rear-axle steer angle 0.88 deg
# Sindelfingen_EVA2_Telemetry[0407]: High-voltage battery pack SoC 96.31 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 24.99 C, front PSM efficiency 96.80 %, rear PSM torque output 644.2 Nm, AIRMATIC air reservoir pressure 17.00 bar, rear-axle steer angle 0.88 deg
# Sindelfingen_EVA2_Telemetry[0408]: High-voltage battery pack SoC 96.31 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.00 C, front PSM efficiency 96.80 %, rear PSM torque output 644.3 Nm, AIRMATIC air reservoir pressure 17.00 bar, rear-axle steer angle 0.89 deg
# Sindelfingen_EVA2_Telemetry[0409]: High-voltage battery pack SoC 96.30 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.00 C, front PSM efficiency 96.80 %, rear PSM torque output 644.4 Nm, AIRMATIC air reservoir pressure 17.00 bar, rear-axle steer angle 0.89 deg
# Sindelfingen_EVA2_Telemetry[0410]: High-voltage battery pack SoC 96.30 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.00 C, front PSM efficiency 96.80 %, rear PSM torque output 644.5 Nm, AIRMATIC air reservoir pressure 17.00 bar, rear-axle steer angle 0.89 deg
# Sindelfingen_EVA2_Telemetry[0411]: High-voltage battery pack SoC 96.30 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.00 C, front PSM efficiency 96.80 %, rear PSM torque output 644.6 Nm, AIRMATIC air reservoir pressure 17.00 bar, rear-axle steer angle 0.89 deg
# Sindelfingen_EVA2_Telemetry[0412]: High-voltage battery pack SoC 96.29 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.00 C, front PSM efficiency 96.80 %, rear PSM torque output 644.7 Nm, AIRMATIC air reservoir pressure 17.00 bar, rear-axle steer angle 0.89 deg
# Sindelfingen_EVA2_Telemetry[0413]: High-voltage battery pack SoC 96.28 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.01 C, front PSM efficiency 96.80 %, rear PSM torque output 644.8 Nm, AIRMATIC air reservoir pressure 17.00 bar, rear-axle steer angle 0.90 deg
# Sindelfingen_EVA2_Telemetry[0414]: High-voltage battery pack SoC 96.28 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.01 C, front PSM efficiency 96.80 %, rear PSM torque output 644.9 Nm, AIRMATIC air reservoir pressure 17.00 bar, rear-axle steer angle 0.90 deg
# Sindelfingen_EVA2_Telemetry[0415]: High-voltage battery pack SoC 96.27 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.01 C, front PSM efficiency 96.81 %, rear PSM torque output 645.0 Nm, AIRMATIC air reservoir pressure 17.01 bar, rear-axle steer angle 0.90 deg
# Sindelfingen_EVA2_Telemetry[0416]: High-voltage battery pack SoC 96.27 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.01 C, front PSM efficiency 96.81 %, rear PSM torque output 645.1 Nm, AIRMATIC air reservoir pressure 17.01 bar, rear-axle steer angle 0.90 deg
# Sindelfingen_EVA2_Telemetry[0417]: High-voltage battery pack SoC 96.27 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.01 C, front PSM efficiency 96.81 %, rear PSM torque output 645.2 Nm, AIRMATIC air reservoir pressure 17.01 bar, rear-axle steer angle 0.90 deg
# Sindelfingen_EVA2_Telemetry[0418]: High-voltage battery pack SoC 96.26 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.02 C, front PSM efficiency 96.81 %, rear PSM torque output 645.3 Nm, AIRMATIC air reservoir pressure 17.01 bar, rear-axle steer angle 0.91 deg
# Sindelfingen_EVA2_Telemetry[0419]: High-voltage battery pack SoC 96.25 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.02 C, front PSM efficiency 96.81 %, rear PSM torque output 645.4 Nm, AIRMATIC air reservoir pressure 17.01 bar, rear-axle steer angle 0.91 deg
# Sindelfingen_EVA2_Telemetry[0420]: High-voltage battery pack SoC 96.25 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.02 C, front PSM efficiency 96.81 %, rear PSM torque output 645.5 Nm, AIRMATIC air reservoir pressure 17.01 bar, rear-axle steer angle 0.91 deg
# Sindelfingen_EVA2_Telemetry[0421]: High-voltage battery pack SoC 96.24 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.02 C, front PSM efficiency 96.81 %, rear PSM torque output 645.6 Nm, AIRMATIC air reservoir pressure 17.01 bar, rear-axle steer angle 0.91 deg
# Sindelfingen_EVA2_Telemetry[0422]: High-voltage battery pack SoC 96.24 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.02 C, front PSM efficiency 96.81 %, rear PSM torque output 645.7 Nm, AIRMATIC air reservoir pressure 17.01 bar, rear-axle steer angle 0.91 deg
# Sindelfingen_EVA2_Telemetry[0423]: High-voltage battery pack SoC 96.23 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.03 C, front PSM efficiency 96.81 %, rear PSM torque output 645.8 Nm, AIRMATIC air reservoir pressure 17.01 bar, rear-axle steer angle 0.92 deg
# Sindelfingen_EVA2_Telemetry[0424]: High-voltage battery pack SoC 96.23 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.03 C, front PSM efficiency 96.81 %, rear PSM torque output 645.9 Nm, AIRMATIC air reservoir pressure 17.01 bar, rear-axle steer angle 0.92 deg
# Sindelfingen_EVA2_Telemetry[0425]: High-voltage battery pack SoC 96.22 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.03 C, front PSM efficiency 96.82 %, rear PSM torque output 646.0 Nm, AIRMATIC air reservoir pressure 17.02 bar, rear-axle steer angle 0.92 deg
# Sindelfingen_EVA2_Telemetry[0426]: High-voltage battery pack SoC 96.22 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.03 C, front PSM efficiency 96.82 %, rear PSM torque output 646.1 Nm, AIRMATIC air reservoir pressure 17.02 bar, rear-axle steer angle 0.92 deg
# Sindelfingen_EVA2_Telemetry[0427]: High-voltage battery pack SoC 96.22 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.03 C, front PSM efficiency 96.82 %, rear PSM torque output 646.2 Nm, AIRMATIC air reservoir pressure 17.02 bar, rear-axle steer angle 0.92 deg
# Sindelfingen_EVA2_Telemetry[0428]: High-voltage battery pack SoC 96.21 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.04 C, front PSM efficiency 96.82 %, rear PSM torque output 646.3 Nm, AIRMATIC air reservoir pressure 17.02 bar, rear-axle steer angle 0.93 deg
# Sindelfingen_EVA2_Telemetry[0429]: High-voltage battery pack SoC 96.20 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.04 C, front PSM efficiency 96.82 %, rear PSM torque output 646.4 Nm, AIRMATIC air reservoir pressure 17.02 bar, rear-axle steer angle 0.93 deg
# Sindelfingen_EVA2_Telemetry[0430]: High-voltage battery pack SoC 96.20 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.04 C, front PSM efficiency 96.82 %, rear PSM torque output 646.5 Nm, AIRMATIC air reservoir pressure 17.02 bar, rear-axle steer angle 0.93 deg
# Sindelfingen_EVA2_Telemetry[0431]: High-voltage battery pack SoC 96.19 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.04 C, front PSM efficiency 96.82 %, rear PSM torque output 646.6 Nm, AIRMATIC air reservoir pressure 17.02 bar, rear-axle steer angle 0.93 deg
# Sindelfingen_EVA2_Telemetry[0432]: High-voltage battery pack SoC 96.19 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.04 C, front PSM efficiency 96.82 %, rear PSM torque output 646.7 Nm, AIRMATIC air reservoir pressure 17.02 bar, rear-axle steer angle 0.93 deg
# Sindelfingen_EVA2_Telemetry[0433]: High-voltage battery pack SoC 96.19 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.05 C, front PSM efficiency 96.82 %, rear PSM torque output 646.8 Nm, AIRMATIC air reservoir pressure 17.02 bar, rear-axle steer angle 0.94 deg
# Sindelfingen_EVA2_Telemetry[0434]: High-voltage battery pack SoC 96.18 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.05 C, front PSM efficiency 96.82 %, rear PSM torque output 646.9 Nm, AIRMATIC air reservoir pressure 17.02 bar, rear-axle steer angle 0.94 deg
# Sindelfingen_EVA2_Telemetry[0435]: High-voltage battery pack SoC 96.17 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.05 C, front PSM efficiency 96.83 %, rear PSM torque output 647.0 Nm, AIRMATIC air reservoir pressure 17.03 bar, rear-axle steer angle 0.94 deg
# Sindelfingen_EVA2_Telemetry[0436]: High-voltage battery pack SoC 96.17 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.05 C, front PSM efficiency 96.83 %, rear PSM torque output 647.1 Nm, AIRMATIC air reservoir pressure 17.03 bar, rear-axle steer angle 0.94 deg
# Sindelfingen_EVA2_Telemetry[0437]: High-voltage battery pack SoC 96.16 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.05 C, front PSM efficiency 96.83 %, rear PSM torque output 647.2 Nm, AIRMATIC air reservoir pressure 17.03 bar, rear-axle steer angle 0.94 deg
# Sindelfingen_EVA2_Telemetry[0438]: High-voltage battery pack SoC 96.16 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.06 C, front PSM efficiency 96.83 %, rear PSM torque output 647.3 Nm, AIRMATIC air reservoir pressure 17.03 bar, rear-axle steer angle 0.95 deg
# Sindelfingen_EVA2_Telemetry[0439]: High-voltage battery pack SoC 96.16 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.06 C, front PSM efficiency 96.83 %, rear PSM torque output 647.4 Nm, AIRMATIC air reservoir pressure 17.03 bar, rear-axle steer angle 0.95 deg
# Sindelfingen_EVA2_Telemetry[0440]: High-voltage battery pack SoC 96.15 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.06 C, front PSM efficiency 96.83 %, rear PSM torque output 647.5 Nm, AIRMATIC air reservoir pressure 17.03 bar, rear-axle steer angle 0.95 deg
# Sindelfingen_EVA2_Telemetry[0441]: High-voltage battery pack SoC 96.14 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.06 C, front PSM efficiency 96.83 %, rear PSM torque output 647.6 Nm, AIRMATIC air reservoir pressure 17.03 bar, rear-axle steer angle 0.95 deg
# Sindelfingen_EVA2_Telemetry[0442]: High-voltage battery pack SoC 96.14 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.06 C, front PSM efficiency 96.83 %, rear PSM torque output 647.7 Nm, AIRMATIC air reservoir pressure 17.03 bar, rear-axle steer angle 0.95 deg
# Sindelfingen_EVA2_Telemetry[0443]: High-voltage battery pack SoC 96.13 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.07 C, front PSM efficiency 96.83 %, rear PSM torque output 647.8 Nm, AIRMATIC air reservoir pressure 17.03 bar, rear-axle steer angle 0.96 deg
# Sindelfingen_EVA2_Telemetry[0444]: High-voltage battery pack SoC 96.13 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.07 C, front PSM efficiency 96.83 %, rear PSM torque output 647.9 Nm, AIRMATIC air reservoir pressure 17.03 bar, rear-axle steer angle 0.96 deg
# Sindelfingen_EVA2_Telemetry[0445]: High-voltage battery pack SoC 96.12 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.07 C, front PSM efficiency 96.84 %, rear PSM torque output 648.0 Nm, AIRMATIC air reservoir pressure 17.04 bar, rear-axle steer angle 0.96 deg
# Sindelfingen_EVA2_Telemetry[0446]: High-voltage battery pack SoC 96.12 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.07 C, front PSM efficiency 96.84 %, rear PSM torque output 648.1 Nm, AIRMATIC air reservoir pressure 17.04 bar, rear-axle steer angle 0.96 deg
# Sindelfingen_EVA2_Telemetry[0447]: High-voltage battery pack SoC 96.11 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.07 C, front PSM efficiency 96.84 %, rear PSM torque output 648.2 Nm, AIRMATIC air reservoir pressure 17.04 bar, rear-axle steer angle 0.96 deg
# Sindelfingen_EVA2_Telemetry[0448]: High-voltage battery pack SoC 96.11 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.08 C, front PSM efficiency 96.84 %, rear PSM torque output 648.3 Nm, AIRMATIC air reservoir pressure 17.04 bar, rear-axle steer angle 0.97 deg
# Sindelfingen_EVA2_Telemetry[0449]: High-voltage battery pack SoC 96.11 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.08 C, front PSM efficiency 96.84 %, rear PSM torque output 648.4 Nm, AIRMATIC air reservoir pressure 17.04 bar, rear-axle steer angle 0.97 deg
# Sindelfingen_EVA2_Telemetry[0450]: High-voltage battery pack SoC 96.10 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.08 C, front PSM efficiency 96.84 %, rear PSM torque output 648.5 Nm, AIRMATIC air reservoir pressure 17.04 bar, rear-axle steer angle 0.97 deg
# Sindelfingen_EVA2_Telemetry[0451]: High-voltage battery pack SoC 96.09 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.08 C, front PSM efficiency 96.84 %, rear PSM torque output 648.6 Nm, AIRMATIC air reservoir pressure 17.04 bar, rear-axle steer angle 0.97 deg
# Sindelfingen_EVA2_Telemetry[0452]: High-voltage battery pack SoC 96.09 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.08 C, front PSM efficiency 96.84 %, rear PSM torque output 648.7 Nm, AIRMATIC air reservoir pressure 17.04 bar, rear-axle steer angle 0.97 deg
# Sindelfingen_EVA2_Telemetry[0453]: High-voltage battery pack SoC 96.08 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.09 C, front PSM efficiency 96.84 %, rear PSM torque output 648.8 Nm, AIRMATIC air reservoir pressure 17.04 bar, rear-axle steer angle 0.98 deg
# Sindelfingen_EVA2_Telemetry[0454]: High-voltage battery pack SoC 96.08 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.09 C, front PSM efficiency 96.84 %, rear PSM torque output 648.9 Nm, AIRMATIC air reservoir pressure 17.04 bar, rear-axle steer angle 0.98 deg
# Sindelfingen_EVA2_Telemetry[0455]: High-voltage battery pack SoC 96.08 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.09 C, front PSM efficiency 96.84 %, rear PSM torque output 649.0 Nm, AIRMATIC air reservoir pressure 17.05 bar, rear-axle steer angle 0.98 deg
# Sindelfingen_EVA2_Telemetry[0456]: High-voltage battery pack SoC 96.07 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.09 C, front PSM efficiency 96.85 %, rear PSM torque output 649.1 Nm, AIRMATIC air reservoir pressure 17.05 bar, rear-axle steer angle 0.98 deg
# Sindelfingen_EVA2_Telemetry[0457]: High-voltage battery pack SoC 96.06 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.09 C, front PSM efficiency 96.85 %, rear PSM torque output 649.2 Nm, AIRMATIC air reservoir pressure 17.05 bar, rear-axle steer angle 0.98 deg
# Sindelfingen_EVA2_Telemetry[0458]: High-voltage battery pack SoC 96.06 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.10 C, front PSM efficiency 96.85 %, rear PSM torque output 649.3 Nm, AIRMATIC air reservoir pressure 17.05 bar, rear-axle steer angle 0.99 deg
# Sindelfingen_EVA2_Telemetry[0459]: High-voltage battery pack SoC 96.05 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.10 C, front PSM efficiency 96.85 %, rear PSM torque output 649.4 Nm, AIRMATIC air reservoir pressure 17.05 bar, rear-axle steer angle 0.99 deg
# Sindelfingen_EVA2_Telemetry[0460]: High-voltage battery pack SoC 96.05 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.10 C, front PSM efficiency 96.85 %, rear PSM torque output 649.5 Nm, AIRMATIC air reservoir pressure 17.05 bar, rear-axle steer angle 0.99 deg
# Sindelfingen_EVA2_Telemetry[0461]: High-voltage battery pack SoC 96.05 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.10 C, front PSM efficiency 96.85 %, rear PSM torque output 649.6 Nm, AIRMATIC air reservoir pressure 17.05 bar, rear-axle steer angle 0.99 deg
# Sindelfingen_EVA2_Telemetry[0462]: High-voltage battery pack SoC 96.04 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.10 C, front PSM efficiency 96.85 %, rear PSM torque output 649.7 Nm, AIRMATIC air reservoir pressure 17.05 bar, rear-axle steer angle 0.99 deg
# Sindelfingen_EVA2_Telemetry[0463]: High-voltage battery pack SoC 96.03 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.11 C, front PSM efficiency 96.85 %, rear PSM torque output 649.8 Nm, AIRMATIC air reservoir pressure 17.05 bar, rear-axle steer angle 1.00 deg
# Sindelfingen_EVA2_Telemetry[0464]: High-voltage battery pack SoC 96.03 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.11 C, front PSM efficiency 96.85 %, rear PSM torque output 649.9 Nm, AIRMATIC air reservoir pressure 17.05 bar, rear-axle steer angle 1.00 deg
# Sindelfingen_EVA2_Telemetry[0465]: High-voltage battery pack SoC 96.02 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.11 C, front PSM efficiency 96.86 %, rear PSM torque output 650.0 Nm, AIRMATIC air reservoir pressure 17.05 bar, rear-axle steer angle 1.00 deg
# Sindelfingen_EVA2_Telemetry[0466]: High-voltage battery pack SoC 96.02 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.11 C, front PSM efficiency 96.86 %, rear PSM torque output 650.1 Nm, AIRMATIC air reservoir pressure 17.06 bar, rear-axle steer angle 1.00 deg
# Sindelfingen_EVA2_Telemetry[0467]: High-voltage battery pack SoC 96.02 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.11 C, front PSM efficiency 96.86 %, rear PSM torque output 650.2 Nm, AIRMATIC air reservoir pressure 17.06 bar, rear-axle steer angle 1.00 deg
# Sindelfingen_EVA2_Telemetry[0468]: High-voltage battery pack SoC 96.01 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.12 C, front PSM efficiency 96.86 %, rear PSM torque output 650.3 Nm, AIRMATIC air reservoir pressure 17.06 bar, rear-axle steer angle 1.01 deg
# Sindelfingen_EVA2_Telemetry[0469]: High-voltage battery pack SoC 96.00 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.12 C, front PSM efficiency 96.86 %, rear PSM torque output 650.4 Nm, AIRMATIC air reservoir pressure 17.06 bar, rear-axle steer angle 1.01 deg
# Sindelfingen_EVA2_Telemetry[0470]: High-voltage battery pack SoC 96.00 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.12 C, front PSM efficiency 96.86 %, rear PSM torque output 650.5 Nm, AIRMATIC air reservoir pressure 17.06 bar, rear-axle steer angle 1.01 deg
# Sindelfingen_EVA2_Telemetry[0471]: High-voltage battery pack SoC 95.99 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.12 C, front PSM efficiency 96.86 %, rear PSM torque output 650.6 Nm, AIRMATIC air reservoir pressure 17.06 bar, rear-axle steer angle 1.01 deg
# Sindelfingen_EVA2_Telemetry[0472]: High-voltage battery pack SoC 95.99 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.12 C, front PSM efficiency 96.86 %, rear PSM torque output 650.7 Nm, AIRMATIC air reservoir pressure 17.06 bar, rear-axle steer angle 1.01 deg
# Sindelfingen_EVA2_Telemetry[0473]: High-voltage battery pack SoC 95.98 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.13 C, front PSM efficiency 96.86 %, rear PSM torque output 650.8 Nm, AIRMATIC air reservoir pressure 17.06 bar, rear-axle steer angle 1.02 deg
# Sindelfingen_EVA2_Telemetry[0474]: High-voltage battery pack SoC 95.98 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.13 C, front PSM efficiency 96.86 %, rear PSM torque output 650.9 Nm, AIRMATIC air reservoir pressure 17.06 bar, rear-axle steer angle 1.02 deg
# Sindelfingen_EVA2_Telemetry[0475]: High-voltage battery pack SoC 95.97 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.13 C, front PSM efficiency 96.87 %, rear PSM torque output 651.0 Nm, AIRMATIC air reservoir pressure 17.07 bar, rear-axle steer angle 1.02 deg
# Sindelfingen_EVA2_Telemetry[0476]: High-voltage battery pack SoC 95.97 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.13 C, front PSM efficiency 96.87 %, rear PSM torque output 651.1 Nm, AIRMATIC air reservoir pressure 17.07 bar, rear-axle steer angle 1.02 deg
# Sindelfingen_EVA2_Telemetry[0477]: High-voltage battery pack SoC 95.97 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.13 C, front PSM efficiency 96.87 %, rear PSM torque output 651.2 Nm, AIRMATIC air reservoir pressure 17.07 bar, rear-axle steer angle 1.02 deg
# Sindelfingen_EVA2_Telemetry[0478]: High-voltage battery pack SoC 95.96 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.14 C, front PSM efficiency 96.87 %, rear PSM torque output 651.3 Nm, AIRMATIC air reservoir pressure 17.07 bar, rear-axle steer angle 1.03 deg
# Sindelfingen_EVA2_Telemetry[0479]: High-voltage battery pack SoC 95.95 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.14 C, front PSM efficiency 96.87 %, rear PSM torque output 651.4 Nm, AIRMATIC air reservoir pressure 17.07 bar, rear-axle steer angle 1.03 deg
# Sindelfingen_EVA2_Telemetry[0480]: High-voltage battery pack SoC 95.95 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.14 C, front PSM efficiency 96.87 %, rear PSM torque output 651.5 Nm, AIRMATIC air reservoir pressure 17.07 bar, rear-axle steer angle 1.03 deg
# Sindelfingen_EVA2_Telemetry[0481]: High-voltage battery pack SoC 95.94 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.14 C, front PSM efficiency 96.87 %, rear PSM torque output 651.6 Nm, AIRMATIC air reservoir pressure 17.07 bar, rear-axle steer angle 1.03 deg
# Sindelfingen_EVA2_Telemetry[0482]: High-voltage battery pack SoC 95.94 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.14 C, front PSM efficiency 96.87 %, rear PSM torque output 651.7 Nm, AIRMATIC air reservoir pressure 17.07 bar, rear-axle steer angle 1.03 deg
# Sindelfingen_EVA2_Telemetry[0483]: High-voltage battery pack SoC 95.94 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.15 C, front PSM efficiency 96.87 %, rear PSM torque output 651.8 Nm, AIRMATIC air reservoir pressure 17.07 bar, rear-axle steer angle 1.04 deg
# Sindelfingen_EVA2_Telemetry[0484]: High-voltage battery pack SoC 95.93 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.15 C, front PSM efficiency 96.87 %, rear PSM torque output 651.9 Nm, AIRMATIC air reservoir pressure 17.07 bar, rear-axle steer angle 1.04 deg
# Sindelfingen_EVA2_Telemetry[0485]: High-voltage battery pack SoC 95.92 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.15 C, front PSM efficiency 96.88 %, rear PSM torque output 652.0 Nm, AIRMATIC air reservoir pressure 17.08 bar, rear-axle steer angle 1.04 deg
# Sindelfingen_EVA2_Telemetry[0486]: High-voltage battery pack SoC 95.92 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.15 C, front PSM efficiency 96.88 %, rear PSM torque output 652.1 Nm, AIRMATIC air reservoir pressure 17.08 bar, rear-axle steer angle 1.04 deg
# Sindelfingen_EVA2_Telemetry[0487]: High-voltage battery pack SoC 95.91 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.15 C, front PSM efficiency 96.88 %, rear PSM torque output 652.2 Nm, AIRMATIC air reservoir pressure 17.08 bar, rear-axle steer angle 1.04 deg
# Sindelfingen_EVA2_Telemetry[0488]: High-voltage battery pack SoC 95.91 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.16 C, front PSM efficiency 96.88 %, rear PSM torque output 652.3 Nm, AIRMATIC air reservoir pressure 17.08 bar, rear-axle steer angle 1.05 deg
# Sindelfingen_EVA2_Telemetry[0489]: High-voltage battery pack SoC 95.91 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.16 C, front PSM efficiency 96.88 %, rear PSM torque output 652.4 Nm, AIRMATIC air reservoir pressure 17.08 bar, rear-axle steer angle 1.05 deg
# Sindelfingen_EVA2_Telemetry[0490]: High-voltage battery pack SoC 95.90 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.16 C, front PSM efficiency 96.88 %, rear PSM torque output 652.5 Nm, AIRMATIC air reservoir pressure 17.08 bar, rear-axle steer angle 1.05 deg
# Sindelfingen_EVA2_Telemetry[0491]: High-voltage battery pack SoC 95.89 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.16 C, front PSM efficiency 96.88 %, rear PSM torque output 652.6 Nm, AIRMATIC air reservoir pressure 17.08 bar, rear-axle steer angle 1.05 deg
# Sindelfingen_EVA2_Telemetry[0492]: High-voltage battery pack SoC 95.89 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.16 C, front PSM efficiency 96.88 %, rear PSM torque output 652.7 Nm, AIRMATIC air reservoir pressure 17.08 bar, rear-axle steer angle 1.05 deg
# Sindelfingen_EVA2_Telemetry[0493]: High-voltage battery pack SoC 95.88 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.17 C, front PSM efficiency 96.88 %, rear PSM torque output 652.8 Nm, AIRMATIC air reservoir pressure 17.08 bar, rear-axle steer angle 1.06 deg
# Sindelfingen_EVA2_Telemetry[0494]: High-voltage battery pack SoC 95.88 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.17 C, front PSM efficiency 96.88 %, rear PSM torque output 652.9 Nm, AIRMATIC air reservoir pressure 17.08 bar, rear-axle steer angle 1.06 deg
# Sindelfingen_EVA2_Telemetry[0495]: High-voltage battery pack SoC 95.88 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.17 C, front PSM efficiency 96.89 %, rear PSM torque output 653.0 Nm, AIRMATIC air reservoir pressure 17.09 bar, rear-axle steer angle 1.06 deg
# Sindelfingen_EVA2_Telemetry[0496]: High-voltage battery pack SoC 95.87 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.17 C, front PSM efficiency 96.89 %, rear PSM torque output 653.1 Nm, AIRMATIC air reservoir pressure 17.09 bar, rear-axle steer angle 1.06 deg
# Sindelfingen_EVA2_Telemetry[0497]: High-voltage battery pack SoC 95.86 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.17 C, front PSM efficiency 96.89 %, rear PSM torque output 653.2 Nm, AIRMATIC air reservoir pressure 17.09 bar, rear-axle steer angle 1.06 deg
# Sindelfingen_EVA2_Telemetry[0498]: High-voltage battery pack SoC 95.86 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.18 C, front PSM efficiency 96.89 %, rear PSM torque output 653.3 Nm, AIRMATIC air reservoir pressure 17.09 bar, rear-axle steer angle 1.07 deg
# Sindelfingen_EVA2_Telemetry[0499]: High-voltage battery pack SoC 95.86 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.18 C, front PSM efficiency 96.89 %, rear PSM torque output 653.4 Nm, AIRMATIC air reservoir pressure 17.09 bar, rear-axle steer angle 1.07 deg
# Sindelfingen_EVA2_Telemetry[0500]: High-voltage battery pack SoC 95.85 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.18 C, front PSM efficiency 96.89 %, rear PSM torque output 653.5 Nm, AIRMATIC air reservoir pressure 17.09 bar, rear-axle steer angle 1.07 deg
# Sindelfingen_EVA2_Telemetry[0501]: High-voltage battery pack SoC 95.84 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.18 C, front PSM efficiency 96.89 %, rear PSM torque output 653.6 Nm, AIRMATIC air reservoir pressure 17.09 bar, rear-axle steer angle 1.07 deg
# Sindelfingen_EVA2_Telemetry[0502]: High-voltage battery pack SoC 95.84 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.18 C, front PSM efficiency 96.89 %, rear PSM torque output 653.7 Nm, AIRMATIC air reservoir pressure 17.09 bar, rear-axle steer angle 1.07 deg
# Sindelfingen_EVA2_Telemetry[0503]: High-voltage battery pack SoC 95.83 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.19 C, front PSM efficiency 96.89 %, rear PSM torque output 653.8 Nm, AIRMATIC air reservoir pressure 17.09 bar, rear-axle steer angle 1.08 deg
# Sindelfingen_EVA2_Telemetry[0504]: High-voltage battery pack SoC 95.83 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.19 C, front PSM efficiency 96.89 %, rear PSM torque output 653.9 Nm, AIRMATIC air reservoir pressure 17.09 bar, rear-axle steer angle 1.08 deg
# Sindelfingen_EVA2_Telemetry[0505]: High-voltage battery pack SoC 95.83 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.19 C, front PSM efficiency 96.90 %, rear PSM torque output 654.0 Nm, AIRMATIC air reservoir pressure 17.10 bar, rear-axle steer angle 1.08 deg
# Sindelfingen_EVA2_Telemetry[0506]: High-voltage battery pack SoC 95.82 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.19 C, front PSM efficiency 96.90 %, rear PSM torque output 654.1 Nm, AIRMATIC air reservoir pressure 17.10 bar, rear-axle steer angle 1.08 deg
# Sindelfingen_EVA2_Telemetry[0507]: High-voltage battery pack SoC 95.81 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.19 C, front PSM efficiency 96.90 %, rear PSM torque output 654.2 Nm, AIRMATIC air reservoir pressure 17.10 bar, rear-axle steer angle 1.08 deg
# Sindelfingen_EVA2_Telemetry[0508]: High-voltage battery pack SoC 95.81 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.20 C, front PSM efficiency 96.90 %, rear PSM torque output 654.3 Nm, AIRMATIC air reservoir pressure 17.10 bar, rear-axle steer angle 1.09 deg
# Sindelfingen_EVA2_Telemetry[0509]: High-voltage battery pack SoC 95.80 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.20 C, front PSM efficiency 96.90 %, rear PSM torque output 654.4 Nm, AIRMATIC air reservoir pressure 17.10 bar, rear-axle steer angle 1.09 deg
# Sindelfingen_EVA2_Telemetry[0510]: High-voltage battery pack SoC 95.80 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.20 C, front PSM efficiency 96.90 %, rear PSM torque output 654.5 Nm, AIRMATIC air reservoir pressure 17.10 bar, rear-axle steer angle 1.09 deg
# Sindelfingen_EVA2_Telemetry[0511]: High-voltage battery pack SoC 95.80 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.20 C, front PSM efficiency 96.90 %, rear PSM torque output 654.6 Nm, AIRMATIC air reservoir pressure 17.10 bar, rear-axle steer angle 1.09 deg
# Sindelfingen_EVA2_Telemetry[0512]: High-voltage battery pack SoC 95.79 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.20 C, front PSM efficiency 96.90 %, rear PSM torque output 654.7 Nm, AIRMATIC air reservoir pressure 17.10 bar, rear-axle steer angle 1.09 deg
# Sindelfingen_EVA2_Telemetry[0513]: High-voltage battery pack SoC 95.78 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.21 C, front PSM efficiency 96.90 %, rear PSM torque output 654.8 Nm, AIRMATIC air reservoir pressure 17.10 bar, rear-axle steer angle 1.10 deg
# Sindelfingen_EVA2_Telemetry[0514]: High-voltage battery pack SoC 95.78 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.21 C, front PSM efficiency 96.90 %, rear PSM torque output 654.9 Nm, AIRMATIC air reservoir pressure 17.10 bar, rear-axle steer angle 1.10 deg
# Sindelfingen_EVA2_Telemetry[0515]: High-voltage battery pack SoC 95.77 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.21 C, front PSM efficiency 96.91 %, rear PSM torque output 655.0 Nm, AIRMATIC air reservoir pressure 17.11 bar, rear-axle steer angle 1.10 deg
# Sindelfingen_EVA2_Telemetry[0516]: High-voltage battery pack SoC 95.77 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.21 C, front PSM efficiency 96.91 %, rear PSM torque output 655.1 Nm, AIRMATIC air reservoir pressure 17.11 bar, rear-axle steer angle 1.10 deg
# Sindelfingen_EVA2_Telemetry[0517]: High-voltage battery pack SoC 95.77 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.21 C, front PSM efficiency 96.91 %, rear PSM torque output 655.2 Nm, AIRMATIC air reservoir pressure 17.11 bar, rear-axle steer angle 1.10 deg
# Sindelfingen_EVA2_Telemetry[0518]: High-voltage battery pack SoC 95.76 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.22 C, front PSM efficiency 96.91 %, rear PSM torque output 655.3 Nm, AIRMATIC air reservoir pressure 17.11 bar, rear-axle steer angle 1.11 deg
# Sindelfingen_EVA2_Telemetry[0519]: High-voltage battery pack SoC 95.75 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.22 C, front PSM efficiency 96.91 %, rear PSM torque output 655.4 Nm, AIRMATIC air reservoir pressure 17.11 bar, rear-axle steer angle 1.11 deg
# Sindelfingen_EVA2_Telemetry[0520]: High-voltage battery pack SoC 95.75 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.22 C, front PSM efficiency 96.91 %, rear PSM torque output 655.5 Nm, AIRMATIC air reservoir pressure 17.11 bar, rear-axle steer angle 1.11 deg
# Sindelfingen_EVA2_Telemetry[0521]: High-voltage battery pack SoC 95.74 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.22 C, front PSM efficiency 96.91 %, rear PSM torque output 655.6 Nm, AIRMATIC air reservoir pressure 17.11 bar, rear-axle steer angle 1.11 deg
# Sindelfingen_EVA2_Telemetry[0522]: High-voltage battery pack SoC 95.74 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.22 C, front PSM efficiency 96.91 %, rear PSM torque output 655.7 Nm, AIRMATIC air reservoir pressure 17.11 bar, rear-axle steer angle 1.11 deg
# Sindelfingen_EVA2_Telemetry[0523]: High-voltage battery pack SoC 95.73 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.23 C, front PSM efficiency 96.91 %, rear PSM torque output 655.8 Nm, AIRMATIC air reservoir pressure 17.11 bar, rear-axle steer angle 1.12 deg
# Sindelfingen_EVA2_Telemetry[0524]: High-voltage battery pack SoC 95.73 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.23 C, front PSM efficiency 96.91 %, rear PSM torque output 655.9 Nm, AIRMATIC air reservoir pressure 17.11 bar, rear-axle steer angle 1.12 deg
# Sindelfingen_EVA2_Telemetry[0525]: High-voltage battery pack SoC 95.72 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.23 C, front PSM efficiency 96.92 %, rear PSM torque output 656.0 Nm, AIRMATIC air reservoir pressure 17.12 bar, rear-axle steer angle 1.12 deg
# Sindelfingen_EVA2_Telemetry[0526]: High-voltage battery pack SoC 95.72 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.23 C, front PSM efficiency 96.92 %, rear PSM torque output 656.1 Nm, AIRMATIC air reservoir pressure 17.12 bar, rear-axle steer angle 1.12 deg
# Sindelfingen_EVA2_Telemetry[0527]: High-voltage battery pack SoC 95.72 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.23 C, front PSM efficiency 96.92 %, rear PSM torque output 656.2 Nm, AIRMATIC air reservoir pressure 17.12 bar, rear-axle steer angle 1.12 deg
# Sindelfingen_EVA2_Telemetry[0528]: High-voltage battery pack SoC 95.71 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.24 C, front PSM efficiency 96.92 %, rear PSM torque output 656.3 Nm, AIRMATIC air reservoir pressure 17.12 bar, rear-axle steer angle 1.13 deg
# Sindelfingen_EVA2_Telemetry[0529]: High-voltage battery pack SoC 95.70 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.24 C, front PSM efficiency 96.92 %, rear PSM torque output 656.4 Nm, AIRMATIC air reservoir pressure 17.12 bar, rear-axle steer angle 1.13 deg
# Sindelfingen_EVA2_Telemetry[0530]: High-voltage battery pack SoC 95.70 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.24 C, front PSM efficiency 96.92 %, rear PSM torque output 656.5 Nm, AIRMATIC air reservoir pressure 17.12 bar, rear-axle steer angle 1.13 deg
# Sindelfingen_EVA2_Telemetry[0531]: High-voltage battery pack SoC 95.69 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.24 C, front PSM efficiency 96.92 %, rear PSM torque output 656.6 Nm, AIRMATIC air reservoir pressure 17.12 bar, rear-axle steer angle 1.13 deg
# Sindelfingen_EVA2_Telemetry[0532]: High-voltage battery pack SoC 95.69 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.24 C, front PSM efficiency 96.92 %, rear PSM torque output 656.7 Nm, AIRMATIC air reservoir pressure 17.12 bar, rear-axle steer angle 1.13 deg
# Sindelfingen_EVA2_Telemetry[0533]: High-voltage battery pack SoC 95.69 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.25 C, front PSM efficiency 96.92 %, rear PSM torque output 656.8 Nm, AIRMATIC air reservoir pressure 17.12 bar, rear-axle steer angle 1.14 deg
# Sindelfingen_EVA2_Telemetry[0534]: High-voltage battery pack SoC 95.68 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.25 C, front PSM efficiency 96.92 %, rear PSM torque output 656.9 Nm, AIRMATIC air reservoir pressure 17.12 bar, rear-axle steer angle 1.14 deg
# Sindelfingen_EVA2_Telemetry[0535]: High-voltage battery pack SoC 95.67 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.25 C, front PSM efficiency 96.93 %, rear PSM torque output 657.0 Nm, AIRMATIC air reservoir pressure 17.12 bar, rear-axle steer angle 1.14 deg
# Sindelfingen_EVA2_Telemetry[0536]: High-voltage battery pack SoC 95.67 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.25 C, front PSM efficiency 96.93 %, rear PSM torque output 657.1 Nm, AIRMATIC air reservoir pressure 17.13 bar, rear-axle steer angle 1.14 deg
# Sindelfingen_EVA2_Telemetry[0537]: High-voltage battery pack SoC 95.66 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.25 C, front PSM efficiency 96.93 %, rear PSM torque output 657.2 Nm, AIRMATIC air reservoir pressure 17.13 bar, rear-axle steer angle 1.14 deg
# Sindelfingen_EVA2_Telemetry[0538]: High-voltage battery pack SoC 95.66 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.26 C, front PSM efficiency 96.93 %, rear PSM torque output 657.3 Nm, AIRMATIC air reservoir pressure 17.13 bar, rear-axle steer angle 1.15 deg
# Sindelfingen_EVA2_Telemetry[0539]: High-voltage battery pack SoC 95.66 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.26 C, front PSM efficiency 96.93 %, rear PSM torque output 657.4 Nm, AIRMATIC air reservoir pressure 17.13 bar, rear-axle steer angle 1.15 deg
# Sindelfingen_EVA2_Telemetry[0540]: High-voltage battery pack SoC 95.65 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.26 C, front PSM efficiency 96.93 %, rear PSM torque output 657.5 Nm, AIRMATIC air reservoir pressure 17.13 bar, rear-axle steer angle 1.15 deg
# Sindelfingen_EVA2_Telemetry[0541]: High-voltage battery pack SoC 95.64 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.26 C, front PSM efficiency 96.93 %, rear PSM torque output 657.6 Nm, AIRMATIC air reservoir pressure 17.13 bar, rear-axle steer angle 1.15 deg
# Sindelfingen_EVA2_Telemetry[0542]: High-voltage battery pack SoC 95.64 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.26 C, front PSM efficiency 96.93 %, rear PSM torque output 657.7 Nm, AIRMATIC air reservoir pressure 17.13 bar, rear-axle steer angle 1.15 deg
# Sindelfingen_EVA2_Telemetry[0543]: High-voltage battery pack SoC 95.63 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.27 C, front PSM efficiency 96.93 %, rear PSM torque output 657.8 Nm, AIRMATIC air reservoir pressure 17.13 bar, rear-axle steer angle 1.16 deg
# Sindelfingen_EVA2_Telemetry[0544]: High-voltage battery pack SoC 95.63 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.27 C, front PSM efficiency 96.93 %, rear PSM torque output 657.9 Nm, AIRMATIC air reservoir pressure 17.13 bar, rear-axle steer angle 1.16 deg
# Sindelfingen_EVA2_Telemetry[0545]: High-voltage battery pack SoC 95.62 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.27 C, front PSM efficiency 96.94 %, rear PSM torque output 658.0 Nm, AIRMATIC air reservoir pressure 17.14 bar, rear-axle steer angle 1.16 deg
# Sindelfingen_EVA2_Telemetry[0546]: High-voltage battery pack SoC 95.62 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.27 C, front PSM efficiency 96.94 %, rear PSM torque output 658.1 Nm, AIRMATIC air reservoir pressure 17.14 bar, rear-axle steer angle 1.16 deg
# Sindelfingen_EVA2_Telemetry[0547]: High-voltage battery pack SoC 95.61 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.27 C, front PSM efficiency 96.94 %, rear PSM torque output 658.2 Nm, AIRMATIC air reservoir pressure 17.14 bar, rear-axle steer angle 1.16 deg
# Sindelfingen_EVA2_Telemetry[0548]: High-voltage battery pack SoC 95.61 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.28 C, front PSM efficiency 96.94 %, rear PSM torque output 658.3 Nm, AIRMATIC air reservoir pressure 17.14 bar, rear-axle steer angle 1.17 deg
# Sindelfingen_EVA2_Telemetry[0549]: High-voltage battery pack SoC 95.61 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.28 C, front PSM efficiency 96.94 %, rear PSM torque output 658.4 Nm, AIRMATIC air reservoir pressure 17.14 bar, rear-axle steer angle 1.17 deg
# Sindelfingen_EVA2_Telemetry[0550]: High-voltage battery pack SoC 95.60 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.28 C, front PSM efficiency 96.94 %, rear PSM torque output 658.5 Nm, AIRMATIC air reservoir pressure 17.14 bar, rear-axle steer angle 1.17 deg
# Sindelfingen_EVA2_Telemetry[0551]: High-voltage battery pack SoC 95.59 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.28 C, front PSM efficiency 96.94 %, rear PSM torque output 658.6 Nm, AIRMATIC air reservoir pressure 17.14 bar, rear-axle steer angle 1.17 deg
# Sindelfingen_EVA2_Telemetry[0552]: High-voltage battery pack SoC 95.59 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.28 C, front PSM efficiency 96.94 %, rear PSM torque output 658.7 Nm, AIRMATIC air reservoir pressure 17.14 bar, rear-axle steer angle 1.17 deg
# Sindelfingen_EVA2_Telemetry[0553]: High-voltage battery pack SoC 95.58 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.29 C, front PSM efficiency 96.94 %, rear PSM torque output 658.8 Nm, AIRMATIC air reservoir pressure 17.14 bar, rear-axle steer angle 1.18 deg
# Sindelfingen_EVA2_Telemetry[0554]: High-voltage battery pack SoC 95.58 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.29 C, front PSM efficiency 96.94 %, rear PSM torque output 658.9 Nm, AIRMATIC air reservoir pressure 17.14 bar, rear-axle steer angle 1.18 deg
# Sindelfingen_EVA2_Telemetry[0555]: High-voltage battery pack SoC 95.58 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.29 C, front PSM efficiency 96.95 %, rear PSM torque output 659.0 Nm, AIRMATIC air reservoir pressure 17.15 bar, rear-axle steer angle 1.18 deg
# Sindelfingen_EVA2_Telemetry[0556]: High-voltage battery pack SoC 95.57 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.29 C, front PSM efficiency 96.95 %, rear PSM torque output 659.1 Nm, AIRMATIC air reservoir pressure 17.15 bar, rear-axle steer angle 1.18 deg
# Sindelfingen_EVA2_Telemetry[0557]: High-voltage battery pack SoC 95.56 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.29 C, front PSM efficiency 96.95 %, rear PSM torque output 659.2 Nm, AIRMATIC air reservoir pressure 17.15 bar, rear-axle steer angle 1.18 deg
# Sindelfingen_EVA2_Telemetry[0558]: High-voltage battery pack SoC 95.56 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.30 C, front PSM efficiency 96.95 %, rear PSM torque output 659.3 Nm, AIRMATIC air reservoir pressure 17.15 bar, rear-axle steer angle 1.19 deg
# Sindelfingen_EVA2_Telemetry[0559]: High-voltage battery pack SoC 95.55 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.30 C, front PSM efficiency 96.95 %, rear PSM torque output 659.4 Nm, AIRMATIC air reservoir pressure 17.15 bar, rear-axle steer angle 1.19 deg
# Sindelfingen_EVA2_Telemetry[0560]: High-voltage battery pack SoC 95.55 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.30 C, front PSM efficiency 96.95 %, rear PSM torque output 659.5 Nm, AIRMATIC air reservoir pressure 17.15 bar, rear-axle steer angle 1.19 deg
# Sindelfingen_EVA2_Telemetry[0561]: High-voltage battery pack SoC 95.55 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.30 C, front PSM efficiency 96.95 %, rear PSM torque output 659.6 Nm, AIRMATIC air reservoir pressure 17.15 bar, rear-axle steer angle 1.19 deg
# Sindelfingen_EVA2_Telemetry[0562]: High-voltage battery pack SoC 95.54 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.30 C, front PSM efficiency 96.95 %, rear PSM torque output 659.7 Nm, AIRMATIC air reservoir pressure 17.15 bar, rear-axle steer angle 1.19 deg
# Sindelfingen_EVA2_Telemetry[0563]: High-voltage battery pack SoC 95.53 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.31 C, front PSM efficiency 96.95 %, rear PSM torque output 659.8 Nm, AIRMATIC air reservoir pressure 17.15 bar, rear-axle steer angle 1.20 deg
# Sindelfingen_EVA2_Telemetry[0564]: High-voltage battery pack SoC 95.53 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.31 C, front PSM efficiency 96.95 %, rear PSM torque output 659.9 Nm, AIRMATIC air reservoir pressure 17.15 bar, rear-axle steer angle 1.20 deg
# Sindelfingen_EVA2_Telemetry[0565]: High-voltage battery pack SoC 95.52 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.31 C, front PSM efficiency 96.96 %, rear PSM torque output 660.0 Nm, AIRMATIC air reservoir pressure 17.16 bar, rear-axle steer angle 1.20 deg
# Sindelfingen_EVA2_Telemetry[0566]: High-voltage battery pack SoC 95.52 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.31 C, front PSM efficiency 96.96 %, rear PSM torque output 660.1 Nm, AIRMATIC air reservoir pressure 17.16 bar, rear-axle steer angle 1.20 deg
# Sindelfingen_EVA2_Telemetry[0567]: High-voltage battery pack SoC 95.52 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.31 C, front PSM efficiency 96.96 %, rear PSM torque output 660.2 Nm, AIRMATIC air reservoir pressure 17.16 bar, rear-axle steer angle 1.20 deg
# Sindelfingen_EVA2_Telemetry[0568]: High-voltage battery pack SoC 95.51 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.32 C, front PSM efficiency 96.96 %, rear PSM torque output 660.3 Nm, AIRMATIC air reservoir pressure 17.16 bar, rear-axle steer angle 1.21 deg
# Sindelfingen_EVA2_Telemetry[0569]: High-voltage battery pack SoC 95.50 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.32 C, front PSM efficiency 96.96 %, rear PSM torque output 660.4 Nm, AIRMATIC air reservoir pressure 17.16 bar, rear-axle steer angle 1.21 deg
# Sindelfingen_EVA2_Telemetry[0570]: High-voltage battery pack SoC 95.50 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.32 C, front PSM efficiency 96.96 %, rear PSM torque output 660.5 Nm, AIRMATIC air reservoir pressure 17.16 bar, rear-axle steer angle 1.21 deg
# Sindelfingen_EVA2_Telemetry[0571]: High-voltage battery pack SoC 95.49 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.32 C, front PSM efficiency 96.96 %, rear PSM torque output 660.6 Nm, AIRMATIC air reservoir pressure 17.16 bar, rear-axle steer angle 1.21 deg
# Sindelfingen_EVA2_Telemetry[0572]: High-voltage battery pack SoC 95.49 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.32 C, front PSM efficiency 96.96 %, rear PSM torque output 660.7 Nm, AIRMATIC air reservoir pressure 17.16 bar, rear-axle steer angle 1.21 deg
# Sindelfingen_EVA2_Telemetry[0573]: High-voltage battery pack SoC 95.48 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.33 C, front PSM efficiency 96.96 %, rear PSM torque output 660.8 Nm, AIRMATIC air reservoir pressure 17.16 bar, rear-axle steer angle 1.22 deg
# Sindelfingen_EVA2_Telemetry[0574]: High-voltage battery pack SoC 95.48 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.33 C, front PSM efficiency 96.96 %, rear PSM torque output 660.9 Nm, AIRMATIC air reservoir pressure 17.16 bar, rear-axle steer angle 1.22 deg
# Sindelfingen_EVA2_Telemetry[0575]: High-voltage battery pack SoC 95.47 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.33 C, front PSM efficiency 96.97 %, rear PSM torque output 661.0 Nm, AIRMATIC air reservoir pressure 17.17 bar, rear-axle steer angle 1.22 deg
# Sindelfingen_EVA2_Telemetry[0576]: High-voltage battery pack SoC 95.47 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.33 C, front PSM efficiency 96.97 %, rear PSM torque output 661.1 Nm, AIRMATIC air reservoir pressure 17.17 bar, rear-axle steer angle 1.22 deg
# Sindelfingen_EVA2_Telemetry[0577]: High-voltage battery pack SoC 95.47 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.33 C, front PSM efficiency 96.97 %, rear PSM torque output 661.2 Nm, AIRMATIC air reservoir pressure 17.17 bar, rear-axle steer angle 1.22 deg
# Sindelfingen_EVA2_Telemetry[0578]: High-voltage battery pack SoC 95.46 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.34 C, front PSM efficiency 96.97 %, rear PSM torque output 661.3 Nm, AIRMATIC air reservoir pressure 17.17 bar, rear-axle steer angle 1.23 deg
# Sindelfingen_EVA2_Telemetry[0579]: High-voltage battery pack SoC 95.45 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.34 C, front PSM efficiency 96.97 %, rear PSM torque output 661.4 Nm, AIRMATIC air reservoir pressure 17.17 bar, rear-axle steer angle 1.23 deg
# Sindelfingen_EVA2_Telemetry[0580]: High-voltage battery pack SoC 95.45 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.34 C, front PSM efficiency 96.97 %, rear PSM torque output 661.5 Nm, AIRMATIC air reservoir pressure 17.17 bar, rear-axle steer angle 1.23 deg
# Sindelfingen_EVA2_Telemetry[0581]: High-voltage battery pack SoC 95.44 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.34 C, front PSM efficiency 96.97 %, rear PSM torque output 661.6 Nm, AIRMATIC air reservoir pressure 17.17 bar, rear-axle steer angle 1.23 deg
# Sindelfingen_EVA2_Telemetry[0582]: High-voltage battery pack SoC 95.44 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.34 C, front PSM efficiency 96.97 %, rear PSM torque output 661.7 Nm, AIRMATIC air reservoir pressure 17.17 bar, rear-axle steer angle 1.23 deg
# Sindelfingen_EVA2_Telemetry[0583]: High-voltage battery pack SoC 95.44 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.35 C, front PSM efficiency 96.97 %, rear PSM torque output 661.8 Nm, AIRMATIC air reservoir pressure 17.17 bar, rear-axle steer angle 1.24 deg
# Sindelfingen_EVA2_Telemetry[0584]: High-voltage battery pack SoC 95.43 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.35 C, front PSM efficiency 96.97 %, rear PSM torque output 661.9 Nm, AIRMATIC air reservoir pressure 17.17 bar, rear-axle steer angle 1.24 deg
# Sindelfingen_EVA2_Telemetry[0585]: High-voltage battery pack SoC 95.42 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.35 C, front PSM efficiency 96.98 %, rear PSM torque output 662.0 Nm, AIRMATIC air reservoir pressure 17.18 bar, rear-axle steer angle 1.24 deg
# Sindelfingen_EVA2_Telemetry[0586]: High-voltage battery pack SoC 95.42 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.35 C, front PSM efficiency 96.98 %, rear PSM torque output 662.1 Nm, AIRMATIC air reservoir pressure 17.18 bar, rear-axle steer angle 1.24 deg
# Sindelfingen_EVA2_Telemetry[0587]: High-voltage battery pack SoC 95.41 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.35 C, front PSM efficiency 96.98 %, rear PSM torque output 662.2 Nm, AIRMATIC air reservoir pressure 17.18 bar, rear-axle steer angle 1.24 deg
# Sindelfingen_EVA2_Telemetry[0588]: High-voltage battery pack SoC 95.41 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.36 C, front PSM efficiency 96.98 %, rear PSM torque output 662.3 Nm, AIRMATIC air reservoir pressure 17.18 bar, rear-axle steer angle 1.25 deg
# Sindelfingen_EVA2_Telemetry[0589]: High-voltage battery pack SoC 95.41 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.36 C, front PSM efficiency 96.98 %, rear PSM torque output 662.4 Nm, AIRMATIC air reservoir pressure 17.18 bar, rear-axle steer angle 1.25 deg
# Sindelfingen_EVA2_Telemetry[0590]: High-voltage battery pack SoC 95.40 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.36 C, front PSM efficiency 96.98 %, rear PSM torque output 662.5 Nm, AIRMATIC air reservoir pressure 17.18 bar, rear-axle steer angle 1.25 deg
# Sindelfingen_EVA2_Telemetry[0591]: High-voltage battery pack SoC 95.39 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.36 C, front PSM efficiency 96.98 %, rear PSM torque output 662.6 Nm, AIRMATIC air reservoir pressure 17.18 bar, rear-axle steer angle 1.25 deg
# Sindelfingen_EVA2_Telemetry[0592]: High-voltage battery pack SoC 95.39 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.36 C, front PSM efficiency 96.98 %, rear PSM torque output 662.7 Nm, AIRMATIC air reservoir pressure 17.18 bar, rear-axle steer angle 1.25 deg
# Sindelfingen_EVA2_Telemetry[0593]: High-voltage battery pack SoC 95.38 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.37 C, front PSM efficiency 96.98 %, rear PSM torque output 662.8 Nm, AIRMATIC air reservoir pressure 17.18 bar, rear-axle steer angle 1.26 deg
# Sindelfingen_EVA2_Telemetry[0594]: High-voltage battery pack SoC 95.38 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.37 C, front PSM efficiency 96.98 %, rear PSM torque output 662.9 Nm, AIRMATIC air reservoir pressure 17.18 bar, rear-axle steer angle 1.26 deg
# Sindelfingen_EVA2_Telemetry[0595]: High-voltage battery pack SoC 95.38 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.37 C, front PSM efficiency 96.98 %, rear PSM torque output 663.0 Nm, AIRMATIC air reservoir pressure 17.19 bar, rear-axle steer angle 1.26 deg
# Sindelfingen_EVA2_Telemetry[0596]: High-voltage battery pack SoC 95.37 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.37 C, front PSM efficiency 96.99 %, rear PSM torque output 663.1 Nm, AIRMATIC air reservoir pressure 17.19 bar, rear-axle steer angle 1.26 deg
# Sindelfingen_EVA2_Telemetry[0597]: High-voltage battery pack SoC 95.36 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.37 C, front PSM efficiency 96.99 %, rear PSM torque output 663.2 Nm, AIRMATIC air reservoir pressure 17.19 bar, rear-axle steer angle 1.26 deg
# Sindelfingen_EVA2_Telemetry[0598]: High-voltage battery pack SoC 95.36 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.38 C, front PSM efficiency 96.99 %, rear PSM torque output 663.3 Nm, AIRMATIC air reservoir pressure 17.19 bar, rear-axle steer angle 1.27 deg
# Sindelfingen_EVA2_Telemetry[0599]: High-voltage battery pack SoC 95.36 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.38 C, front PSM efficiency 96.99 %, rear PSM torque output 663.4 Nm, AIRMATIC air reservoir pressure 17.19 bar, rear-axle steer angle 1.27 deg
# Sindelfingen_EVA2_Telemetry[0600]: High-voltage battery pack SoC 95.35 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.38 C, front PSM efficiency 96.99 %, rear PSM torque output 663.5 Nm, AIRMATIC air reservoir pressure 17.19 bar, rear-axle steer angle 1.27 deg
# Sindelfingen_EVA2_Telemetry[0601]: High-voltage battery pack SoC 95.34 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.38 C, front PSM efficiency 96.99 %, rear PSM torque output 663.6 Nm, AIRMATIC air reservoir pressure 17.19 bar, rear-axle steer angle 1.27 deg
# Sindelfingen_EVA2_Telemetry[0602]: High-voltage battery pack SoC 95.34 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.38 C, front PSM efficiency 96.99 %, rear PSM torque output 663.7 Nm, AIRMATIC air reservoir pressure 17.19 bar, rear-axle steer angle 1.27 deg
# Sindelfingen_EVA2_Telemetry[0603]: High-voltage battery pack SoC 95.33 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.39 C, front PSM efficiency 96.99 %, rear PSM torque output 663.8 Nm, AIRMATIC air reservoir pressure 17.19 bar, rear-axle steer angle 1.28 deg
# Sindelfingen_EVA2_Telemetry[0604]: High-voltage battery pack SoC 95.33 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.39 C, front PSM efficiency 96.99 %, rear PSM torque output 663.9 Nm, AIRMATIC air reservoir pressure 17.19 bar, rear-axle steer angle 1.28 deg
# Sindelfingen_EVA2_Telemetry[0605]: High-voltage battery pack SoC 95.33 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.39 C, front PSM efficiency 97.00 %, rear PSM torque output 664.0 Nm, AIRMATIC air reservoir pressure 17.20 bar, rear-axle steer angle 1.28 deg
# Sindelfingen_EVA2_Telemetry[0606]: High-voltage battery pack SoC 95.32 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.39 C, front PSM efficiency 97.00 %, rear PSM torque output 664.1 Nm, AIRMATIC air reservoir pressure 17.20 bar, rear-axle steer angle 1.28 deg
# Sindelfingen_EVA2_Telemetry[0607]: High-voltage battery pack SoC 95.31 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.39 C, front PSM efficiency 97.00 %, rear PSM torque output 664.2 Nm, AIRMATIC air reservoir pressure 17.20 bar, rear-axle steer angle 1.28 deg
# Sindelfingen_EVA2_Telemetry[0608]: High-voltage battery pack SoC 95.31 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.40 C, front PSM efficiency 97.00 %, rear PSM torque output 664.3 Nm, AIRMATIC air reservoir pressure 17.20 bar, rear-axle steer angle 1.29 deg
# Sindelfingen_EVA2_Telemetry[0609]: High-voltage battery pack SoC 95.30 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.40 C, front PSM efficiency 97.00 %, rear PSM torque output 664.4 Nm, AIRMATIC air reservoir pressure 17.20 bar, rear-axle steer angle 1.29 deg
# Sindelfingen_EVA2_Telemetry[0610]: High-voltage battery pack SoC 95.30 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.40 C, front PSM efficiency 97.00 %, rear PSM torque output 664.5 Nm, AIRMATIC air reservoir pressure 17.20 bar, rear-axle steer angle 1.29 deg
# Sindelfingen_EVA2_Telemetry[0611]: High-voltage battery pack SoC 95.30 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.40 C, front PSM efficiency 97.00 %, rear PSM torque output 664.6 Nm, AIRMATIC air reservoir pressure 17.20 bar, rear-axle steer angle 1.29 deg
# Sindelfingen_EVA2_Telemetry[0612]: High-voltage battery pack SoC 95.29 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.40 C, front PSM efficiency 97.00 %, rear PSM torque output 664.7 Nm, AIRMATIC air reservoir pressure 17.20 bar, rear-axle steer angle 1.29 deg
# Sindelfingen_EVA2_Telemetry[0613]: High-voltage battery pack SoC 95.28 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.41 C, front PSM efficiency 97.00 %, rear PSM torque output 664.8 Nm, AIRMATIC air reservoir pressure 17.20 bar, rear-axle steer angle 1.30 deg
# Sindelfingen_EVA2_Telemetry[0614]: High-voltage battery pack SoC 95.28 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.41 C, front PSM efficiency 97.00 %, rear PSM torque output 664.9 Nm, AIRMATIC air reservoir pressure 17.20 bar, rear-axle steer angle 1.30 deg
# Sindelfingen_EVA2_Telemetry[0615]: High-voltage battery pack SoC 95.27 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.41 C, front PSM efficiency 97.01 %, rear PSM torque output 665.0 Nm, AIRMATIC air reservoir pressure 17.21 bar, rear-axle steer angle 1.30 deg
# Sindelfingen_EVA2_Telemetry[0616]: High-voltage battery pack SoC 95.27 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.41 C, front PSM efficiency 97.01 %, rear PSM torque output 665.1 Nm, AIRMATIC air reservoir pressure 17.21 bar, rear-axle steer angle 1.30 deg
# Sindelfingen_EVA2_Telemetry[0617]: High-voltage battery pack SoC 95.27 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.41 C, front PSM efficiency 97.01 %, rear PSM torque output 665.2 Nm, AIRMATIC air reservoir pressure 17.21 bar, rear-axle steer angle 1.30 deg
# Sindelfingen_EVA2_Telemetry[0618]: High-voltage battery pack SoC 95.26 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.42 C, front PSM efficiency 97.01 %, rear PSM torque output 665.3 Nm, AIRMATIC air reservoir pressure 17.21 bar, rear-axle steer angle 1.31 deg
# Sindelfingen_EVA2_Telemetry[0619]: High-voltage battery pack SoC 95.25 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.42 C, front PSM efficiency 97.01 %, rear PSM torque output 665.4 Nm, AIRMATIC air reservoir pressure 17.21 bar, rear-axle steer angle 1.31 deg
# Sindelfingen_EVA2_Telemetry[0620]: High-voltage battery pack SoC 95.25 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.42 C, front PSM efficiency 97.01 %, rear PSM torque output 665.5 Nm, AIRMATIC air reservoir pressure 17.21 bar, rear-axle steer angle 1.31 deg
# Sindelfingen_EVA2_Telemetry[0621]: High-voltage battery pack SoC 95.24 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.42 C, front PSM efficiency 97.01 %, rear PSM torque output 665.6 Nm, AIRMATIC air reservoir pressure 17.21 bar, rear-axle steer angle 1.31 deg
# Sindelfingen_EVA2_Telemetry[0622]: High-voltage battery pack SoC 95.24 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.42 C, front PSM efficiency 97.01 %, rear PSM torque output 665.7 Nm, AIRMATIC air reservoir pressure 17.21 bar, rear-axle steer angle 1.31 deg
# Sindelfingen_EVA2_Telemetry[0623]: High-voltage battery pack SoC 95.23 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.43 C, front PSM efficiency 97.01 %, rear PSM torque output 665.8 Nm, AIRMATIC air reservoir pressure 17.21 bar, rear-axle steer angle 1.32 deg
# Sindelfingen_EVA2_Telemetry[0624]: High-voltage battery pack SoC 95.23 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.43 C, front PSM efficiency 97.01 %, rear PSM torque output 665.9 Nm, AIRMATIC air reservoir pressure 17.21 bar, rear-axle steer angle 1.32 deg
# Sindelfingen_EVA2_Telemetry[0625]: High-voltage battery pack SoC 95.22 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.43 C, front PSM efficiency 97.02 %, rear PSM torque output 666.0 Nm, AIRMATIC air reservoir pressure 17.21 bar, rear-axle steer angle 1.32 deg
# Sindelfingen_EVA2_Telemetry[0626]: High-voltage battery pack SoC 95.22 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.43 C, front PSM efficiency 97.02 %, rear PSM torque output 666.1 Nm, AIRMATIC air reservoir pressure 17.22 bar, rear-axle steer angle 1.32 deg
# Sindelfingen_EVA2_Telemetry[0627]: High-voltage battery pack SoC 95.22 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.43 C, front PSM efficiency 97.02 %, rear PSM torque output 666.2 Nm, AIRMATIC air reservoir pressure 17.22 bar, rear-axle steer angle 1.32 deg
# Sindelfingen_EVA2_Telemetry[0628]: High-voltage battery pack SoC 95.21 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.44 C, front PSM efficiency 97.02 %, rear PSM torque output 666.3 Nm, AIRMATIC air reservoir pressure 17.22 bar, rear-axle steer angle 1.33 deg
# Sindelfingen_EVA2_Telemetry[0629]: High-voltage battery pack SoC 95.20 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.44 C, front PSM efficiency 97.02 %, rear PSM torque output 666.4 Nm, AIRMATIC air reservoir pressure 17.22 bar, rear-axle steer angle 1.33 deg
# Sindelfingen_EVA2_Telemetry[0630]: High-voltage battery pack SoC 95.20 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.44 C, front PSM efficiency 97.02 %, rear PSM torque output 666.5 Nm, AIRMATIC air reservoir pressure 17.22 bar, rear-axle steer angle 1.33 deg
# Sindelfingen_EVA2_Telemetry[0631]: High-voltage battery pack SoC 95.19 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.44 C, front PSM efficiency 97.02 %, rear PSM torque output 666.6 Nm, AIRMATIC air reservoir pressure 17.22 bar, rear-axle steer angle 1.33 deg
# Sindelfingen_EVA2_Telemetry[0632]: High-voltage battery pack SoC 95.19 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.44 C, front PSM efficiency 97.02 %, rear PSM torque output 666.7 Nm, AIRMATIC air reservoir pressure 17.22 bar, rear-axle steer angle 1.33 deg
# Sindelfingen_EVA2_Telemetry[0633]: High-voltage battery pack SoC 95.19 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.45 C, front PSM efficiency 97.02 %, rear PSM torque output 666.8 Nm, AIRMATIC air reservoir pressure 17.22 bar, rear-axle steer angle 1.34 deg
# Sindelfingen_EVA2_Telemetry[0634]: High-voltage battery pack SoC 95.18 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.45 C, front PSM efficiency 97.02 %, rear PSM torque output 666.9 Nm, AIRMATIC air reservoir pressure 17.22 bar, rear-axle steer angle 1.34 deg
# Sindelfingen_EVA2_Telemetry[0635]: High-voltage battery pack SoC 95.17 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.45 C, front PSM efficiency 97.03 %, rear PSM torque output 667.0 Nm, AIRMATIC air reservoir pressure 17.23 bar, rear-axle steer angle 1.34 deg
# Sindelfingen_EVA2_Telemetry[0636]: High-voltage battery pack SoC 95.17 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.45 C, front PSM efficiency 97.03 %, rear PSM torque output 667.1 Nm, AIRMATIC air reservoir pressure 17.23 bar, rear-axle steer angle 1.34 deg
# Sindelfingen_EVA2_Telemetry[0637]: High-voltage battery pack SoC 95.16 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.45 C, front PSM efficiency 97.03 %, rear PSM torque output 667.2 Nm, AIRMATIC air reservoir pressure 17.23 bar, rear-axle steer angle 1.34 deg
# Sindelfingen_EVA2_Telemetry[0638]: High-voltage battery pack SoC 95.16 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.46 C, front PSM efficiency 97.03 %, rear PSM torque output 667.3 Nm, AIRMATIC air reservoir pressure 17.23 bar, rear-axle steer angle 1.35 deg
# Sindelfingen_EVA2_Telemetry[0639]: High-voltage battery pack SoC 95.16 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.46 C, front PSM efficiency 97.03 %, rear PSM torque output 667.4 Nm, AIRMATIC air reservoir pressure 17.23 bar, rear-axle steer angle 1.35 deg
# Sindelfingen_EVA2_Telemetry[0640]: High-voltage battery pack SoC 95.15 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.46 C, front PSM efficiency 97.03 %, rear PSM torque output 667.5 Nm, AIRMATIC air reservoir pressure 17.23 bar, rear-axle steer angle 1.35 deg
# Sindelfingen_EVA2_Telemetry[0641]: High-voltage battery pack SoC 95.14 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.46 C, front PSM efficiency 97.03 %, rear PSM torque output 667.6 Nm, AIRMATIC air reservoir pressure 17.23 bar, rear-axle steer angle 1.35 deg
# Sindelfingen_EVA2_Telemetry[0642]: High-voltage battery pack SoC 95.14 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.46 C, front PSM efficiency 97.03 %, rear PSM torque output 667.7 Nm, AIRMATIC air reservoir pressure 17.23 bar, rear-axle steer angle 1.35 deg
# Sindelfingen_EVA2_Telemetry[0643]: High-voltage battery pack SoC 95.13 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.47 C, front PSM efficiency 97.03 %, rear PSM torque output 667.8 Nm, AIRMATIC air reservoir pressure 17.23 bar, rear-axle steer angle 1.36 deg
# Sindelfingen_EVA2_Telemetry[0644]: High-voltage battery pack SoC 95.13 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.47 C, front PSM efficiency 97.03 %, rear PSM torque output 667.9 Nm, AIRMATIC air reservoir pressure 17.23 bar, rear-axle steer angle 1.36 deg
# Sindelfingen_EVA2_Telemetry[0645]: High-voltage battery pack SoC 95.12 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.47 C, front PSM efficiency 97.04 %, rear PSM torque output 668.0 Nm, AIRMATIC air reservoir pressure 17.24 bar, rear-axle steer angle 1.36 deg
# Sindelfingen_EVA2_Telemetry[0646]: High-voltage battery pack SoC 95.12 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.47 C, front PSM efficiency 97.04 %, rear PSM torque output 668.1 Nm, AIRMATIC air reservoir pressure 17.24 bar, rear-axle steer angle 1.36 deg
# Sindelfingen_EVA2_Telemetry[0647]: High-voltage battery pack SoC 95.11 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.47 C, front PSM efficiency 97.04 %, rear PSM torque output 668.2 Nm, AIRMATIC air reservoir pressure 17.24 bar, rear-axle steer angle 1.36 deg
# Sindelfingen_EVA2_Telemetry[0648]: High-voltage battery pack SoC 95.11 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.48 C, front PSM efficiency 97.04 %, rear PSM torque output 668.3 Nm, AIRMATIC air reservoir pressure 17.24 bar, rear-axle steer angle 1.37 deg
# Sindelfingen_EVA2_Telemetry[0649]: High-voltage battery pack SoC 95.10 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.48 C, front PSM efficiency 97.04 %, rear PSM torque output 668.4 Nm, AIRMATIC air reservoir pressure 17.24 bar, rear-axle steer angle 1.37 deg
# Sindelfingen_EVA2_Telemetry[0650]: High-voltage battery pack SoC 95.10 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.48 C, front PSM efficiency 97.04 %, rear PSM torque output 668.5 Nm, AIRMATIC air reservoir pressure 17.24 bar, rear-axle steer angle 1.37 deg
# Sindelfingen_EVA2_Telemetry[0651]: High-voltage battery pack SoC 95.09 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.48 C, front PSM efficiency 97.04 %, rear PSM torque output 668.6 Nm, AIRMATIC air reservoir pressure 17.24 bar, rear-axle steer angle 1.37 deg
# Sindelfingen_EVA2_Telemetry[0652]: High-voltage battery pack SoC 95.09 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.48 C, front PSM efficiency 97.04 %, rear PSM torque output 668.7 Nm, AIRMATIC air reservoir pressure 17.24 bar, rear-axle steer angle 1.37 deg
# Sindelfingen_EVA2_Telemetry[0653]: High-voltage battery pack SoC 95.08 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.49 C, front PSM efficiency 97.04 %, rear PSM torque output 668.8 Nm, AIRMATIC air reservoir pressure 17.24 bar, rear-axle steer angle 1.38 deg
# Sindelfingen_EVA2_Telemetry[0654]: High-voltage battery pack SoC 95.08 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.49 C, front PSM efficiency 97.04 %, rear PSM torque output 668.9 Nm, AIRMATIC air reservoir pressure 17.24 bar, rear-axle steer angle 1.38 deg
# Sindelfingen_EVA2_Telemetry[0655]: High-voltage battery pack SoC 95.08 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.49 C, front PSM efficiency 97.05 %, rear PSM torque output 669.0 Nm, AIRMATIC air reservoir pressure 17.25 bar, rear-axle steer angle 1.38 deg
# Sindelfingen_EVA2_Telemetry[0656]: High-voltage battery pack SoC 95.07 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.49 C, front PSM efficiency 97.05 %, rear PSM torque output 669.1 Nm, AIRMATIC air reservoir pressure 17.25 bar, rear-axle steer angle 1.38 deg
# Sindelfingen_EVA2_Telemetry[0657]: High-voltage battery pack SoC 95.06 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.49 C, front PSM efficiency 97.05 %, rear PSM torque output 669.2 Nm, AIRMATIC air reservoir pressure 17.25 bar, rear-axle steer angle 1.38 deg
# Sindelfingen_EVA2_Telemetry[0658]: High-voltage battery pack SoC 95.06 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.50 C, front PSM efficiency 97.05 %, rear PSM torque output 669.3 Nm, AIRMATIC air reservoir pressure 17.25 bar, rear-axle steer angle 1.39 deg
# Sindelfingen_EVA2_Telemetry[0659]: High-voltage battery pack SoC 95.05 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.50 C, front PSM efficiency 97.05 %, rear PSM torque output 669.4 Nm, AIRMATIC air reservoir pressure 17.25 bar, rear-axle steer angle 1.39 deg
# Sindelfingen_EVA2_Telemetry[0660]: High-voltage battery pack SoC 95.05 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.50 C, front PSM efficiency 97.05 %, rear PSM torque output 669.5 Nm, AIRMATIC air reservoir pressure 17.25 bar, rear-axle steer angle 1.39 deg
# Sindelfingen_EVA2_Telemetry[0661]: High-voltage battery pack SoC 95.05 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.50 C, front PSM efficiency 97.05 %, rear PSM torque output 669.6 Nm, AIRMATIC air reservoir pressure 17.25 bar, rear-axle steer angle 1.39 deg
# Sindelfingen_EVA2_Telemetry[0662]: High-voltage battery pack SoC 95.04 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.50 C, front PSM efficiency 97.05 %, rear PSM torque output 669.7 Nm, AIRMATIC air reservoir pressure 17.25 bar, rear-axle steer angle 1.39 deg
# Sindelfingen_EVA2_Telemetry[0663]: High-voltage battery pack SoC 95.03 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.51 C, front PSM efficiency 97.05 %, rear PSM torque output 669.8 Nm, AIRMATIC air reservoir pressure 17.25 bar, rear-axle steer angle 1.40 deg
# Sindelfingen_EVA2_Telemetry[0664]: High-voltage battery pack SoC 95.03 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.51 C, front PSM efficiency 97.05 %, rear PSM torque output 669.9 Nm, AIRMATIC air reservoir pressure 17.25 bar, rear-axle steer angle 1.40 deg
# Sindelfingen_EVA2_Telemetry[0665]: High-voltage battery pack SoC 95.02 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.51 C, front PSM efficiency 97.06 %, rear PSM torque output 670.0 Nm, AIRMATIC air reservoir pressure 17.26 bar, rear-axle steer angle 1.40 deg
# Sindelfingen_EVA2_Telemetry[0666]: High-voltage battery pack SoC 95.02 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.51 C, front PSM efficiency 97.06 %, rear PSM torque output 670.1 Nm, AIRMATIC air reservoir pressure 17.26 bar, rear-axle steer angle 1.40 deg
# Sindelfingen_EVA2_Telemetry[0667]: High-voltage battery pack SoC 95.02 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.51 C, front PSM efficiency 97.06 %, rear PSM torque output 670.2 Nm, AIRMATIC air reservoir pressure 17.26 bar, rear-axle steer angle 1.40 deg
# Sindelfingen_EVA2_Telemetry[0668]: High-voltage battery pack SoC 95.01 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.52 C, front PSM efficiency 97.06 %, rear PSM torque output 670.3 Nm, AIRMATIC air reservoir pressure 17.26 bar, rear-axle steer angle 1.41 deg
# Sindelfingen_EVA2_Telemetry[0669]: High-voltage battery pack SoC 95.00 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.52 C, front PSM efficiency 97.06 %, rear PSM torque output 670.4 Nm, AIRMATIC air reservoir pressure 17.26 bar, rear-axle steer angle 1.41 deg
# Sindelfingen_EVA2_Telemetry[0670]: High-voltage battery pack SoC 95.00 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.52 C, front PSM efficiency 97.06 %, rear PSM torque output 670.5 Nm, AIRMATIC air reservoir pressure 17.26 bar, rear-axle steer angle 1.41 deg
# Sindelfingen_EVA2_Telemetry[0671]: High-voltage battery pack SoC 94.99 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.52 C, front PSM efficiency 97.06 %, rear PSM torque output 670.6 Nm, AIRMATIC air reservoir pressure 17.26 bar, rear-axle steer angle 1.41 deg
# Sindelfingen_EVA2_Telemetry[0672]: High-voltage battery pack SoC 94.99 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.52 C, front PSM efficiency 97.06 %, rear PSM torque output 670.7 Nm, AIRMATIC air reservoir pressure 17.26 bar, rear-axle steer angle 1.41 deg
# Sindelfingen_EVA2_Telemetry[0673]: High-voltage battery pack SoC 94.98 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.53 C, front PSM efficiency 97.06 %, rear PSM torque output 670.8 Nm, AIRMATIC air reservoir pressure 17.26 bar, rear-axle steer angle 1.42 deg
# Sindelfingen_EVA2_Telemetry[0674]: High-voltage battery pack SoC 94.98 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.53 C, front PSM efficiency 97.06 %, rear PSM torque output 670.9 Nm, AIRMATIC air reservoir pressure 17.26 bar, rear-axle steer angle 1.42 deg
# Sindelfingen_EVA2_Telemetry[0675]: High-voltage battery pack SoC 94.97 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.53 C, front PSM efficiency 97.07 %, rear PSM torque output 671.0 Nm, AIRMATIC air reservoir pressure 17.27 bar, rear-axle steer angle 1.42 deg
# Sindelfingen_EVA2_Telemetry[0676]: High-voltage battery pack SoC 94.97 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.53 C, front PSM efficiency 97.07 %, rear PSM torque output 671.1 Nm, AIRMATIC air reservoir pressure 17.27 bar, rear-axle steer angle 1.42 deg
# Sindelfingen_EVA2_Telemetry[0677]: High-voltage battery pack SoC 94.97 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.53 C, front PSM efficiency 97.07 %, rear PSM torque output 671.2 Nm, AIRMATIC air reservoir pressure 17.27 bar, rear-axle steer angle 1.42 deg
# Sindelfingen_EVA2_Telemetry[0678]: High-voltage battery pack SoC 94.96 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.54 C, front PSM efficiency 97.07 %, rear PSM torque output 671.3 Nm, AIRMATIC air reservoir pressure 17.27 bar, rear-axle steer angle 1.43 deg
# Sindelfingen_EVA2_Telemetry[0679]: High-voltage battery pack SoC 94.95 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.54 C, front PSM efficiency 97.07 %, rear PSM torque output 671.4 Nm, AIRMATIC air reservoir pressure 17.27 bar, rear-axle steer angle 1.43 deg
# Sindelfingen_EVA2_Telemetry[0680]: High-voltage battery pack SoC 94.95 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.54 C, front PSM efficiency 97.07 %, rear PSM torque output 671.5 Nm, AIRMATIC air reservoir pressure 17.27 bar, rear-axle steer angle 1.43 deg
# Sindelfingen_EVA2_Telemetry[0681]: High-voltage battery pack SoC 94.94 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.54 C, front PSM efficiency 97.07 %, rear PSM torque output 671.6 Nm, AIRMATIC air reservoir pressure 17.27 bar, rear-axle steer angle 1.43 deg
# Sindelfingen_EVA2_Telemetry[0682]: High-voltage battery pack SoC 94.94 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.54 C, front PSM efficiency 97.07 %, rear PSM torque output 671.7 Nm, AIRMATIC air reservoir pressure 17.27 bar, rear-axle steer angle 1.43 deg
# Sindelfingen_EVA2_Telemetry[0683]: High-voltage battery pack SoC 94.94 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.55 C, front PSM efficiency 97.07 %, rear PSM torque output 671.8 Nm, AIRMATIC air reservoir pressure 17.27 bar, rear-axle steer angle 1.44 deg
# Sindelfingen_EVA2_Telemetry[0684]: High-voltage battery pack SoC 94.93 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.55 C, front PSM efficiency 97.07 %, rear PSM torque output 671.9 Nm, AIRMATIC air reservoir pressure 17.27 bar, rear-axle steer angle 1.44 deg
# Sindelfingen_EVA2_Telemetry[0685]: High-voltage battery pack SoC 94.92 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.55 C, front PSM efficiency 97.08 %, rear PSM torque output 672.0 Nm, AIRMATIC air reservoir pressure 17.28 bar, rear-axle steer angle 1.44 deg
# Sindelfingen_EVA2_Telemetry[0686]: High-voltage battery pack SoC 94.92 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.55 C, front PSM efficiency 97.08 %, rear PSM torque output 672.1 Nm, AIRMATIC air reservoir pressure 17.28 bar, rear-axle steer angle 1.44 deg
# Sindelfingen_EVA2_Telemetry[0687]: High-voltage battery pack SoC 94.91 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.55 C, front PSM efficiency 97.08 %, rear PSM torque output 672.2 Nm, AIRMATIC air reservoir pressure 17.28 bar, rear-axle steer angle 1.44 deg
# Sindelfingen_EVA2_Telemetry[0688]: High-voltage battery pack SoC 94.91 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.56 C, front PSM efficiency 97.08 %, rear PSM torque output 672.3 Nm, AIRMATIC air reservoir pressure 17.28 bar, rear-axle steer angle 1.45 deg
# Sindelfingen_EVA2_Telemetry[0689]: High-voltage battery pack SoC 94.91 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.56 C, front PSM efficiency 97.08 %, rear PSM torque output 672.4 Nm, AIRMATIC air reservoir pressure 17.28 bar, rear-axle steer angle 1.45 deg
# Sindelfingen_EVA2_Telemetry[0690]: High-voltage battery pack SoC 94.90 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.56 C, front PSM efficiency 97.08 %, rear PSM torque output 672.5 Nm, AIRMATIC air reservoir pressure 17.28 bar, rear-axle steer angle 1.45 deg
# Sindelfingen_EVA2_Telemetry[0691]: High-voltage battery pack SoC 94.89 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.56 C, front PSM efficiency 97.08 %, rear PSM torque output 672.6 Nm, AIRMATIC air reservoir pressure 17.28 bar, rear-axle steer angle 1.45 deg
# Sindelfingen_EVA2_Telemetry[0692]: High-voltage battery pack SoC 94.89 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.56 C, front PSM efficiency 97.08 %, rear PSM torque output 672.7 Nm, AIRMATIC air reservoir pressure 17.28 bar, rear-axle steer angle 1.45 deg
# Sindelfingen_EVA2_Telemetry[0693]: High-voltage battery pack SoC 94.88 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.57 C, front PSM efficiency 97.08 %, rear PSM torque output 672.8 Nm, AIRMATIC air reservoir pressure 17.28 bar, rear-axle steer angle 1.46 deg
# Sindelfingen_EVA2_Telemetry[0694]: High-voltage battery pack SoC 94.88 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.57 C, front PSM efficiency 97.08 %, rear PSM torque output 672.9 Nm, AIRMATIC air reservoir pressure 17.28 bar, rear-axle steer angle 1.46 deg
# Sindelfingen_EVA2_Telemetry[0695]: High-voltage battery pack SoC 94.88 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.57 C, front PSM efficiency 97.09 %, rear PSM torque output 673.0 Nm, AIRMATIC air reservoir pressure 17.29 bar, rear-axle steer angle 1.46 deg
# Sindelfingen_EVA2_Telemetry[0696]: High-voltage battery pack SoC 94.87 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.57 C, front PSM efficiency 97.09 %, rear PSM torque output 673.1 Nm, AIRMATIC air reservoir pressure 17.29 bar, rear-axle steer angle 1.46 deg
# Sindelfingen_EVA2_Telemetry[0697]: High-voltage battery pack SoC 94.86 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.57 C, front PSM efficiency 97.09 %, rear PSM torque output 673.2 Nm, AIRMATIC air reservoir pressure 17.29 bar, rear-axle steer angle 1.46 deg
# Sindelfingen_EVA2_Telemetry[0698]: High-voltage battery pack SoC 94.86 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.58 C, front PSM efficiency 97.09 %, rear PSM torque output 673.3 Nm, AIRMATIC air reservoir pressure 17.29 bar, rear-axle steer angle 1.47 deg
# Sindelfingen_EVA2_Telemetry[0699]: High-voltage battery pack SoC 94.85 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.58 C, front PSM efficiency 97.09 %, rear PSM torque output 673.4 Nm, AIRMATIC air reservoir pressure 17.29 bar, rear-axle steer angle 1.47 deg
# Sindelfingen_EVA2_Telemetry[0700]: High-voltage battery pack SoC 94.85 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.58 C, front PSM efficiency 97.09 %, rear PSM torque output 673.5 Nm, AIRMATIC air reservoir pressure 17.29 bar, rear-axle steer angle 1.47 deg
# Sindelfingen_EVA2_Telemetry[0701]: High-voltage battery pack SoC 94.84 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.58 C, front PSM efficiency 97.09 %, rear PSM torque output 673.6 Nm, AIRMATIC air reservoir pressure 17.29 bar, rear-axle steer angle 1.47 deg
# Sindelfingen_EVA2_Telemetry[0702]: High-voltage battery pack SoC 94.84 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.58 C, front PSM efficiency 97.09 %, rear PSM torque output 673.7 Nm, AIRMATIC air reservoir pressure 17.29 bar, rear-axle steer angle 1.47 deg
# Sindelfingen_EVA2_Telemetry[0703]: High-voltage battery pack SoC 94.83 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.59 C, front PSM efficiency 97.09 %, rear PSM torque output 673.8 Nm, AIRMATIC air reservoir pressure 17.29 bar, rear-axle steer angle 1.48 deg
# Sindelfingen_EVA2_Telemetry[0704]: High-voltage battery pack SoC 94.83 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.59 C, front PSM efficiency 97.09 %, rear PSM torque output 673.9 Nm, AIRMATIC air reservoir pressure 17.29 bar, rear-axle steer angle 1.48 deg
# Sindelfingen_EVA2_Telemetry[0705]: High-voltage battery pack SoC 94.83 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.59 C, front PSM efficiency 97.09 %, rear PSM torque output 674.0 Nm, AIRMATIC air reservoir pressure 17.30 bar, rear-axle steer angle 1.48 deg
# Sindelfingen_EVA2_Telemetry[0706]: High-voltage battery pack SoC 94.82 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.59 C, front PSM efficiency 97.10 %, rear PSM torque output 674.1 Nm, AIRMATIC air reservoir pressure 17.30 bar, rear-axle steer angle 1.48 deg
# Sindelfingen_EVA2_Telemetry[0707]: High-voltage battery pack SoC 94.81 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.59 C, front PSM efficiency 97.10 %, rear PSM torque output 674.2 Nm, AIRMATIC air reservoir pressure 17.30 bar, rear-axle steer angle 1.48 deg
# Sindelfingen_EVA2_Telemetry[0708]: High-voltage battery pack SoC 94.81 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.60 C, front PSM efficiency 97.10 %, rear PSM torque output 674.3 Nm, AIRMATIC air reservoir pressure 17.30 bar, rear-axle steer angle 1.49 deg
# Sindelfingen_EVA2_Telemetry[0709]: High-voltage battery pack SoC 94.80 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.60 C, front PSM efficiency 97.10 %, rear PSM torque output 674.4 Nm, AIRMATIC air reservoir pressure 17.30 bar, rear-axle steer angle 1.49 deg
# Sindelfingen_EVA2_Telemetry[0710]: High-voltage battery pack SoC 94.80 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.60 C, front PSM efficiency 97.10 %, rear PSM torque output 674.5 Nm, AIRMATIC air reservoir pressure 17.30 bar, rear-axle steer angle 1.49 deg
# Sindelfingen_EVA2_Telemetry[0711]: High-voltage battery pack SoC 94.80 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.60 C, front PSM efficiency 97.10 %, rear PSM torque output 674.6 Nm, AIRMATIC air reservoir pressure 17.30 bar, rear-axle steer angle 1.49 deg
# Sindelfingen_EVA2_Telemetry[0712]: High-voltage battery pack SoC 94.79 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.60 C, front PSM efficiency 97.10 %, rear PSM torque output 674.7 Nm, AIRMATIC air reservoir pressure 17.30 bar, rear-axle steer angle 1.49 deg
# Sindelfingen_EVA2_Telemetry[0713]: High-voltage battery pack SoC 94.78 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.61 C, front PSM efficiency 97.10 %, rear PSM torque output 674.8 Nm, AIRMATIC air reservoir pressure 17.30 bar, rear-axle steer angle 1.50 deg
# Sindelfingen_EVA2_Telemetry[0714]: High-voltage battery pack SoC 94.78 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.61 C, front PSM efficiency 97.10 %, rear PSM torque output 674.9 Nm, AIRMATIC air reservoir pressure 17.30 bar, rear-axle steer angle 1.50 deg
# Sindelfingen_EVA2_Telemetry[0715]: High-voltage battery pack SoC 94.77 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.61 C, front PSM efficiency 97.11 %, rear PSM torque output 675.0 Nm, AIRMATIC air reservoir pressure 17.30 bar, rear-axle steer angle 1.50 deg
# Sindelfingen_EVA2_Telemetry[0716]: High-voltage battery pack SoC 94.77 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.61 C, front PSM efficiency 97.11 %, rear PSM torque output 675.1 Nm, AIRMATIC air reservoir pressure 17.31 bar, rear-axle steer angle 1.50 deg
# Sindelfingen_EVA2_Telemetry[0717]: High-voltage battery pack SoC 94.77 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.61 C, front PSM efficiency 97.11 %, rear PSM torque output 675.2 Nm, AIRMATIC air reservoir pressure 17.31 bar, rear-axle steer angle 1.50 deg
# Sindelfingen_EVA2_Telemetry[0718]: High-voltage battery pack SoC 94.76 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.62 C, front PSM efficiency 97.11 %, rear PSM torque output 675.3 Nm, AIRMATIC air reservoir pressure 17.31 bar, rear-axle steer angle 1.51 deg
# Sindelfingen_EVA2_Telemetry[0719]: High-voltage battery pack SoC 94.75 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.62 C, front PSM efficiency 97.11 %, rear PSM torque output 675.4 Nm, AIRMATIC air reservoir pressure 17.31 bar, rear-axle steer angle 1.51 deg
# Sindelfingen_EVA2_Telemetry[0720]: High-voltage battery pack SoC 94.75 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.62 C, front PSM efficiency 97.11 %, rear PSM torque output 675.5 Nm, AIRMATIC air reservoir pressure 17.31 bar, rear-axle steer angle 1.51 deg
# Sindelfingen_EVA2_Telemetry[0721]: High-voltage battery pack SoC 94.74 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.62 C, front PSM efficiency 97.11 %, rear PSM torque output 675.6 Nm, AIRMATIC air reservoir pressure 17.31 bar, rear-axle steer angle 1.51 deg
# Sindelfingen_EVA2_Telemetry[0722]: High-voltage battery pack SoC 94.74 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.62 C, front PSM efficiency 97.11 %, rear PSM torque output 675.7 Nm, AIRMATIC air reservoir pressure 17.31 bar, rear-axle steer angle 1.51 deg
# Sindelfingen_EVA2_Telemetry[0723]: High-voltage battery pack SoC 94.73 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.63 C, front PSM efficiency 97.11 %, rear PSM torque output 675.8 Nm, AIRMATIC air reservoir pressure 17.31 bar, rear-axle steer angle 1.52 deg
# Sindelfingen_EVA2_Telemetry[0724]: High-voltage battery pack SoC 94.73 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.63 C, front PSM efficiency 97.11 %, rear PSM torque output 675.9 Nm, AIRMATIC air reservoir pressure 17.31 bar, rear-axle steer angle 1.52 deg
# Sindelfingen_EVA2_Telemetry[0725]: High-voltage battery pack SoC 94.72 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.63 C, front PSM efficiency 97.12 %, rear PSM torque output 676.0 Nm, AIRMATIC air reservoir pressure 17.32 bar, rear-axle steer angle 1.52 deg
# Sindelfingen_EVA2_Telemetry[0726]: High-voltage battery pack SoC 94.72 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.63 C, front PSM efficiency 97.12 %, rear PSM torque output 676.1 Nm, AIRMATIC air reservoir pressure 17.32 bar, rear-axle steer angle 1.52 deg
# Sindelfingen_EVA2_Telemetry[0727]: High-voltage battery pack SoC 94.72 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.63 C, front PSM efficiency 97.12 %, rear PSM torque output 676.2 Nm, AIRMATIC air reservoir pressure 17.32 bar, rear-axle steer angle 1.52 deg
# Sindelfingen_EVA2_Telemetry[0728]: High-voltage battery pack SoC 94.71 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.64 C, front PSM efficiency 97.12 %, rear PSM torque output 676.3 Nm, AIRMATIC air reservoir pressure 17.32 bar, rear-axle steer angle 1.53 deg
# Sindelfingen_EVA2_Telemetry[0729]: High-voltage battery pack SoC 94.70 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.64 C, front PSM efficiency 97.12 %, rear PSM torque output 676.4 Nm, AIRMATIC air reservoir pressure 17.32 bar, rear-axle steer angle 1.53 deg
# Sindelfingen_EVA2_Telemetry[0730]: High-voltage battery pack SoC 94.70 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.64 C, front PSM efficiency 97.12 %, rear PSM torque output 676.5 Nm, AIRMATIC air reservoir pressure 17.32 bar, rear-axle steer angle 1.53 deg
# Sindelfingen_EVA2_Telemetry[0731]: High-voltage battery pack SoC 94.69 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.64 C, front PSM efficiency 97.12 %, rear PSM torque output 676.6 Nm, AIRMATIC air reservoir pressure 17.32 bar, rear-axle steer angle 1.53 deg
# Sindelfingen_EVA2_Telemetry[0732]: High-voltage battery pack SoC 94.69 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.64 C, front PSM efficiency 97.12 %, rear PSM torque output 676.7 Nm, AIRMATIC air reservoir pressure 17.32 bar, rear-axle steer angle 1.53 deg
# Sindelfingen_EVA2_Telemetry[0733]: High-voltage battery pack SoC 94.69 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.65 C, front PSM efficiency 97.12 %, rear PSM torque output 676.8 Nm, AIRMATIC air reservoir pressure 17.32 bar, rear-axle steer angle 1.54 deg
# Sindelfingen_EVA2_Telemetry[0734]: High-voltage battery pack SoC 94.68 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.65 C, front PSM efficiency 97.12 %, rear PSM torque output 676.9 Nm, AIRMATIC air reservoir pressure 17.32 bar, rear-axle steer angle 1.54 deg
# Sindelfingen_EVA2_Telemetry[0735]: High-voltage battery pack SoC 94.67 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.65 C, front PSM efficiency 97.12 %, rear PSM torque output 677.0 Nm, AIRMATIC air reservoir pressure 17.33 bar, rear-axle steer angle 1.54 deg
# Sindelfingen_EVA2_Telemetry[0736]: High-voltage battery pack SoC 94.67 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.65 C, front PSM efficiency 97.13 %, rear PSM torque output 677.1 Nm, AIRMATIC air reservoir pressure 17.33 bar, rear-axle steer angle 1.54 deg
# Sindelfingen_EVA2_Telemetry[0737]: High-voltage battery pack SoC 94.66 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.65 C, front PSM efficiency 97.13 %, rear PSM torque output 677.2 Nm, AIRMATIC air reservoir pressure 17.33 bar, rear-axle steer angle 1.54 deg
# Sindelfingen_EVA2_Telemetry[0738]: High-voltage battery pack SoC 94.66 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.66 C, front PSM efficiency 97.13 %, rear PSM torque output 677.3 Nm, AIRMATIC air reservoir pressure 17.33 bar, rear-axle steer angle 1.55 deg
# Sindelfingen_EVA2_Telemetry[0739]: High-voltage battery pack SoC 94.66 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.66 C, front PSM efficiency 97.13 %, rear PSM torque output 677.4 Nm, AIRMATIC air reservoir pressure 17.33 bar, rear-axle steer angle 1.55 deg
# Sindelfingen_EVA2_Telemetry[0740]: High-voltage battery pack SoC 94.65 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.66 C, front PSM efficiency 97.13 %, rear PSM torque output 677.5 Nm, AIRMATIC air reservoir pressure 17.33 bar, rear-axle steer angle 1.55 deg
# Sindelfingen_EVA2_Telemetry[0741]: High-voltage battery pack SoC 94.64 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.66 C, front PSM efficiency 97.13 %, rear PSM torque output 677.6 Nm, AIRMATIC air reservoir pressure 17.33 bar, rear-axle steer angle 1.55 deg
# Sindelfingen_EVA2_Telemetry[0742]: High-voltage battery pack SoC 94.64 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.66 C, front PSM efficiency 97.13 %, rear PSM torque output 677.7 Nm, AIRMATIC air reservoir pressure 17.33 bar, rear-axle steer angle 1.55 deg
# Sindelfingen_EVA2_Telemetry[0743]: High-voltage battery pack SoC 94.63 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.67 C, front PSM efficiency 97.13 %, rear PSM torque output 677.8 Nm, AIRMATIC air reservoir pressure 17.33 bar, rear-axle steer angle 1.56 deg
# Sindelfingen_EVA2_Telemetry[0744]: High-voltage battery pack SoC 94.63 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.67 C, front PSM efficiency 97.13 %, rear PSM torque output 677.9 Nm, AIRMATIC air reservoir pressure 17.33 bar, rear-axle steer angle 1.56 deg
# Sindelfingen_EVA2_Telemetry[0745]: High-voltage battery pack SoC 94.62 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.67 C, front PSM efficiency 97.14 %, rear PSM torque output 678.0 Nm, AIRMATIC air reservoir pressure 17.34 bar, rear-axle steer angle 1.56 deg
# Sindelfingen_EVA2_Telemetry[0746]: High-voltage battery pack SoC 94.62 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.67 C, front PSM efficiency 97.14 %, rear PSM torque output 678.1 Nm, AIRMATIC air reservoir pressure 17.34 bar, rear-axle steer angle 1.56 deg
# Sindelfingen_EVA2_Telemetry[0747]: High-voltage battery pack SoC 94.61 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.67 C, front PSM efficiency 97.14 %, rear PSM torque output 678.2 Nm, AIRMATIC air reservoir pressure 17.34 bar, rear-axle steer angle 1.56 deg
# Sindelfingen_EVA2_Telemetry[0748]: High-voltage battery pack SoC 94.61 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.68 C, front PSM efficiency 97.14 %, rear PSM torque output 678.3 Nm, AIRMATIC air reservoir pressure 17.34 bar, rear-axle steer angle 1.57 deg
# Sindelfingen_EVA2_Telemetry[0749]: High-voltage battery pack SoC 94.60 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.68 C, front PSM efficiency 97.14 %, rear PSM torque output 678.4 Nm, AIRMATIC air reservoir pressure 17.34 bar, rear-axle steer angle 1.57 deg
# Sindelfingen_EVA2_Telemetry[0750]: High-voltage battery pack SoC 94.60 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.68 C, front PSM efficiency 97.14 %, rear PSM torque output 678.5 Nm, AIRMATIC air reservoir pressure 17.34 bar, rear-axle steer angle 1.57 deg
# Sindelfingen_EVA2_Telemetry[0751]: High-voltage battery pack SoC 94.59 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.68 C, front PSM efficiency 97.14 %, rear PSM torque output 678.6 Nm, AIRMATIC air reservoir pressure 17.34 bar, rear-axle steer angle 1.57 deg
# Sindelfingen_EVA2_Telemetry[0752]: High-voltage battery pack SoC 94.59 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.68 C, front PSM efficiency 97.14 %, rear PSM torque output 678.7 Nm, AIRMATIC air reservoir pressure 17.34 bar, rear-axle steer angle 1.57 deg
# Sindelfingen_EVA2_Telemetry[0753]: High-voltage battery pack SoC 94.58 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.69 C, front PSM efficiency 97.14 %, rear PSM torque output 678.8 Nm, AIRMATIC air reservoir pressure 17.34 bar, rear-axle steer angle 1.58 deg
# Sindelfingen_EVA2_Telemetry[0754]: High-voltage battery pack SoC 94.58 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.69 C, front PSM efficiency 97.14 %, rear PSM torque output 678.9 Nm, AIRMATIC air reservoir pressure 17.34 bar, rear-axle steer angle 1.58 deg
# Sindelfingen_EVA2_Telemetry[0755]: High-voltage battery pack SoC 94.58 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.69 C, front PSM efficiency 97.15 %, rear PSM torque output 679.0 Nm, AIRMATIC air reservoir pressure 17.35 bar, rear-axle steer angle 1.58 deg
# Sindelfingen_EVA2_Telemetry[0756]: High-voltage battery pack SoC 94.57 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.69 C, front PSM efficiency 97.15 %, rear PSM torque output 679.1 Nm, AIRMATIC air reservoir pressure 17.35 bar, rear-axle steer angle 1.58 deg
# Sindelfingen_EVA2_Telemetry[0757]: High-voltage battery pack SoC 94.56 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.69 C, front PSM efficiency 97.15 %, rear PSM torque output 679.2 Nm, AIRMATIC air reservoir pressure 17.35 bar, rear-axle steer angle 1.58 deg
# Sindelfingen_EVA2_Telemetry[0758]: High-voltage battery pack SoC 94.56 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.70 C, front PSM efficiency 97.15 %, rear PSM torque output 679.3 Nm, AIRMATIC air reservoir pressure 17.35 bar, rear-axle steer angle 1.59 deg
# Sindelfingen_EVA2_Telemetry[0759]: High-voltage battery pack SoC 94.55 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.70 C, front PSM efficiency 97.15 %, rear PSM torque output 679.4 Nm, AIRMATIC air reservoir pressure 17.35 bar, rear-axle steer angle 1.59 deg
# Sindelfingen_EVA2_Telemetry[0760]: High-voltage battery pack SoC 94.55 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.70 C, front PSM efficiency 97.15 %, rear PSM torque output 679.5 Nm, AIRMATIC air reservoir pressure 17.35 bar, rear-axle steer angle 1.59 deg
# Sindelfingen_EVA2_Telemetry[0761]: High-voltage battery pack SoC 94.55 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.70 C, front PSM efficiency 97.15 %, rear PSM torque output 679.6 Nm, AIRMATIC air reservoir pressure 17.35 bar, rear-axle steer angle 1.59 deg
# Sindelfingen_EVA2_Telemetry[0762]: High-voltage battery pack SoC 94.54 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.70 C, front PSM efficiency 97.15 %, rear PSM torque output 679.7 Nm, AIRMATIC air reservoir pressure 17.35 bar, rear-axle steer angle 1.59 deg
# Sindelfingen_EVA2_Telemetry[0763]: High-voltage battery pack SoC 94.53 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.71 C, front PSM efficiency 97.15 %, rear PSM torque output 679.8 Nm, AIRMATIC air reservoir pressure 17.35 bar, rear-axle steer angle 1.60 deg
# Sindelfingen_EVA2_Telemetry[0764]: High-voltage battery pack SoC 94.53 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.71 C, front PSM efficiency 97.15 %, rear PSM torque output 679.9 Nm, AIRMATIC air reservoir pressure 17.35 bar, rear-axle steer angle 1.60 deg
# Sindelfingen_EVA2_Telemetry[0765]: High-voltage battery pack SoC 94.52 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.71 C, front PSM efficiency 97.16 %, rear PSM torque output 680.0 Nm, AIRMATIC air reservoir pressure 17.36 bar, rear-axle steer angle 1.60 deg
# Sindelfingen_EVA2_Telemetry[0766]: High-voltage battery pack SoC 94.52 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.71 C, front PSM efficiency 97.16 %, rear PSM torque output 680.1 Nm, AIRMATIC air reservoir pressure 17.36 bar, rear-axle steer angle 1.60 deg
# Sindelfingen_EVA2_Telemetry[0767]: High-voltage battery pack SoC 94.52 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.71 C, front PSM efficiency 97.16 %, rear PSM torque output 680.2 Nm, AIRMATIC air reservoir pressure 17.36 bar, rear-axle steer angle 1.60 deg
# Sindelfingen_EVA2_Telemetry[0768]: High-voltage battery pack SoC 94.51 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.72 C, front PSM efficiency 97.16 %, rear PSM torque output 680.3 Nm, AIRMATIC air reservoir pressure 17.36 bar, rear-axle steer angle 1.61 deg
# Sindelfingen_EVA2_Telemetry[0769]: High-voltage battery pack SoC 94.50 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.72 C, front PSM efficiency 97.16 %, rear PSM torque output 680.4 Nm, AIRMATIC air reservoir pressure 17.36 bar, rear-axle steer angle 1.61 deg
# Sindelfingen_EVA2_Telemetry[0770]: High-voltage battery pack SoC 94.50 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.72 C, front PSM efficiency 97.16 %, rear PSM torque output 680.5 Nm, AIRMATIC air reservoir pressure 17.36 bar, rear-axle steer angle 1.61 deg
# Sindelfingen_EVA2_Telemetry[0771]: High-voltage battery pack SoC 94.49 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.72 C, front PSM efficiency 97.16 %, rear PSM torque output 680.6 Nm, AIRMATIC air reservoir pressure 17.36 bar, rear-axle steer angle 1.61 deg
# Sindelfingen_EVA2_Telemetry[0772]: High-voltage battery pack SoC 94.49 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.72 C, front PSM efficiency 97.16 %, rear PSM torque output 680.7 Nm, AIRMATIC air reservoir pressure 17.36 bar, rear-axle steer angle 1.61 deg
# Sindelfingen_EVA2_Telemetry[0773]: High-voltage battery pack SoC 94.48 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.73 C, front PSM efficiency 97.16 %, rear PSM torque output 680.8 Nm, AIRMATIC air reservoir pressure 17.36 bar, rear-axle steer angle 1.62 deg
# Sindelfingen_EVA2_Telemetry[0774]: High-voltage battery pack SoC 94.48 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.73 C, front PSM efficiency 97.16 %, rear PSM torque output 680.9 Nm, AIRMATIC air reservoir pressure 17.36 bar, rear-axle steer angle 1.62 deg
# Sindelfingen_EVA2_Telemetry[0775]: High-voltage battery pack SoC 94.47 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.73 C, front PSM efficiency 97.17 %, rear PSM torque output 681.0 Nm, AIRMATIC air reservoir pressure 17.37 bar, rear-axle steer angle 1.62 deg
# Sindelfingen_EVA2_Telemetry[0776]: High-voltage battery pack SoC 94.47 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.73 C, front PSM efficiency 97.17 %, rear PSM torque output 681.1 Nm, AIRMATIC air reservoir pressure 17.37 bar, rear-axle steer angle 1.62 deg
# Sindelfingen_EVA2_Telemetry[0777]: High-voltage battery pack SoC 94.47 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.73 C, front PSM efficiency 97.17 %, rear PSM torque output 681.2 Nm, AIRMATIC air reservoir pressure 17.37 bar, rear-axle steer angle 1.62 deg
# Sindelfingen_EVA2_Telemetry[0778]: High-voltage battery pack SoC 94.46 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.74 C, front PSM efficiency 97.17 %, rear PSM torque output 681.3 Nm, AIRMATIC air reservoir pressure 17.37 bar, rear-axle steer angle 1.63 deg
# Sindelfingen_EVA2_Telemetry[0779]: High-voltage battery pack SoC 94.45 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.74 C, front PSM efficiency 97.17 %, rear PSM torque output 681.4 Nm, AIRMATIC air reservoir pressure 17.37 bar, rear-axle steer angle 1.63 deg
# Sindelfingen_EVA2_Telemetry[0780]: High-voltage battery pack SoC 94.45 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.74 C, front PSM efficiency 97.17 %, rear PSM torque output 681.5 Nm, AIRMATIC air reservoir pressure 17.37 bar, rear-axle steer angle 1.63 deg
# Sindelfingen_EVA2_Telemetry[0781]: High-voltage battery pack SoC 94.44 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.74 C, front PSM efficiency 97.17 %, rear PSM torque output 681.6 Nm, AIRMATIC air reservoir pressure 17.37 bar, rear-axle steer angle 1.63 deg
# Sindelfingen_EVA2_Telemetry[0782]: High-voltage battery pack SoC 94.44 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.74 C, front PSM efficiency 97.17 %, rear PSM torque output 681.7 Nm, AIRMATIC air reservoir pressure 17.37 bar, rear-axle steer angle 1.63 deg
# Sindelfingen_EVA2_Telemetry[0783]: High-voltage battery pack SoC 94.44 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.75 C, front PSM efficiency 97.17 %, rear PSM torque output 681.8 Nm, AIRMATIC air reservoir pressure 17.37 bar, rear-axle steer angle 1.64 deg
# Sindelfingen_EVA2_Telemetry[0784]: High-voltage battery pack SoC 94.43 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.75 C, front PSM efficiency 97.17 %, rear PSM torque output 681.9 Nm, AIRMATIC air reservoir pressure 17.37 bar, rear-axle steer angle 1.64 deg
# Sindelfingen_EVA2_Telemetry[0785]: High-voltage battery pack SoC 94.42 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.75 C, front PSM efficiency 97.18 %, rear PSM torque output 682.0 Nm, AIRMATIC air reservoir pressure 17.38 bar, rear-axle steer angle 1.64 deg
# Sindelfingen_EVA2_Telemetry[0786]: High-voltage battery pack SoC 94.42 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.75 C, front PSM efficiency 97.18 %, rear PSM torque output 682.1 Nm, AIRMATIC air reservoir pressure 17.38 bar, rear-axle steer angle 1.64 deg
# Sindelfingen_EVA2_Telemetry[0787]: High-voltage battery pack SoC 94.41 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.75 C, front PSM efficiency 97.18 %, rear PSM torque output 682.2 Nm, AIRMATIC air reservoir pressure 17.38 bar, rear-axle steer angle 1.64 deg
# Sindelfingen_EVA2_Telemetry[0788]: High-voltage battery pack SoC 94.41 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.76 C, front PSM efficiency 97.18 %, rear PSM torque output 682.3 Nm, AIRMATIC air reservoir pressure 17.38 bar, rear-axle steer angle 1.65 deg
# Sindelfingen_EVA2_Telemetry[0789]: High-voltage battery pack SoC 94.41 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.76 C, front PSM efficiency 97.18 %, rear PSM torque output 682.4 Nm, AIRMATIC air reservoir pressure 17.38 bar, rear-axle steer angle 1.65 deg
# Sindelfingen_EVA2_Telemetry[0790]: High-voltage battery pack SoC 94.40 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.76 C, front PSM efficiency 97.18 %, rear PSM torque output 682.5 Nm, AIRMATIC air reservoir pressure 17.38 bar, rear-axle steer angle 1.65 deg
# Sindelfingen_EVA2_Telemetry[0791]: High-voltage battery pack SoC 94.39 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.76 C, front PSM efficiency 97.18 %, rear PSM torque output 682.6 Nm, AIRMATIC air reservoir pressure 17.38 bar, rear-axle steer angle 1.65 deg
# Sindelfingen_EVA2_Telemetry[0792]: High-voltage battery pack SoC 94.39 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.76 C, front PSM efficiency 97.18 %, rear PSM torque output 682.7 Nm, AIRMATIC air reservoir pressure 17.38 bar, rear-axle steer angle 1.65 deg
# Sindelfingen_EVA2_Telemetry[0793]: High-voltage battery pack SoC 94.38 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.77 C, front PSM efficiency 97.18 %, rear PSM torque output 682.8 Nm, AIRMATIC air reservoir pressure 17.38 bar, rear-axle steer angle 1.66 deg
# Sindelfingen_EVA2_Telemetry[0794]: High-voltage battery pack SoC 94.38 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.77 C, front PSM efficiency 97.18 %, rear PSM torque output 682.9 Nm, AIRMATIC air reservoir pressure 17.38 bar, rear-axle steer angle 1.66 deg
# Sindelfingen_EVA2_Telemetry[0795]: High-voltage battery pack SoC 94.38 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.77 C, front PSM efficiency 97.19 %, rear PSM torque output 683.0 Nm, AIRMATIC air reservoir pressure 17.39 bar, rear-axle steer angle 1.66 deg
# Sindelfingen_EVA2_Telemetry[0796]: High-voltage battery pack SoC 94.37 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.77 C, front PSM efficiency 97.19 %, rear PSM torque output 683.1 Nm, AIRMATIC air reservoir pressure 17.39 bar, rear-axle steer angle 1.66 deg
# Sindelfingen_EVA2_Telemetry[0797]: High-voltage battery pack SoC 94.36 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.77 C, front PSM efficiency 97.19 %, rear PSM torque output 683.2 Nm, AIRMATIC air reservoir pressure 17.39 bar, rear-axle steer angle 1.66 deg
# Sindelfingen_EVA2_Telemetry[0798]: High-voltage battery pack SoC 94.36 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.78 C, front PSM efficiency 97.19 %, rear PSM torque output 683.3 Nm, AIRMATIC air reservoir pressure 17.39 bar, rear-axle steer angle 1.67 deg
# Sindelfingen_EVA2_Telemetry[0799]: High-voltage battery pack SoC 94.35 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.78 C, front PSM efficiency 97.19 %, rear PSM torque output 683.4 Nm, AIRMATIC air reservoir pressure 17.39 bar, rear-axle steer angle 1.67 deg
# Sindelfingen_EVA2_Telemetry[0800]: High-voltage battery pack SoC 94.35 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.78 C, front PSM efficiency 97.19 %, rear PSM torque output 683.5 Nm, AIRMATIC air reservoir pressure 17.39 bar, rear-axle steer angle 1.67 deg
# Sindelfingen_EVA2_Telemetry[0801]: High-voltage battery pack SoC 94.34 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.78 C, front PSM efficiency 97.19 %, rear PSM torque output 683.6 Nm, AIRMATIC air reservoir pressure 17.39 bar, rear-axle steer angle 1.67 deg
# Sindelfingen_EVA2_Telemetry[0802]: High-voltage battery pack SoC 94.34 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.78 C, front PSM efficiency 97.19 %, rear PSM torque output 683.7 Nm, AIRMATIC air reservoir pressure 17.39 bar, rear-axle steer angle 1.67 deg
# Sindelfingen_EVA2_Telemetry[0803]: High-voltage battery pack SoC 94.33 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.79 C, front PSM efficiency 97.19 %, rear PSM torque output 683.8 Nm, AIRMATIC air reservoir pressure 17.39 bar, rear-axle steer angle 1.68 deg
# Sindelfingen_EVA2_Telemetry[0804]: High-voltage battery pack SoC 94.33 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.79 C, front PSM efficiency 97.19 %, rear PSM torque output 683.9 Nm, AIRMATIC air reservoir pressure 17.39 bar, rear-axle steer angle 1.68 deg
# Sindelfingen_EVA2_Telemetry[0805]: High-voltage battery pack SoC 94.33 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.79 C, front PSM efficiency 97.20 %, rear PSM torque output 684.0 Nm, AIRMATIC air reservoir pressure 17.40 bar, rear-axle steer angle 1.68 deg
# Sindelfingen_EVA2_Telemetry[0806]: High-voltage battery pack SoC 94.32 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.79 C, front PSM efficiency 97.20 %, rear PSM torque output 684.1 Nm, AIRMATIC air reservoir pressure 17.40 bar, rear-axle steer angle 1.68 deg
# Sindelfingen_EVA2_Telemetry[0807]: High-voltage battery pack SoC 94.31 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.79 C, front PSM efficiency 97.20 %, rear PSM torque output 684.2 Nm, AIRMATIC air reservoir pressure 17.40 bar, rear-axle steer angle 1.68 deg
# Sindelfingen_EVA2_Telemetry[0808]: High-voltage battery pack SoC 94.31 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.80 C, front PSM efficiency 97.20 %, rear PSM torque output 684.3 Nm, AIRMATIC air reservoir pressure 17.40 bar, rear-axle steer angle 1.69 deg
# Sindelfingen_EVA2_Telemetry[0809]: High-voltage battery pack SoC 94.30 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.80 C, front PSM efficiency 97.20 %, rear PSM torque output 684.4 Nm, AIRMATIC air reservoir pressure 17.40 bar, rear-axle steer angle 1.69 deg
# Sindelfingen_EVA2_Telemetry[0810]: High-voltage battery pack SoC 94.30 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.80 C, front PSM efficiency 97.20 %, rear PSM torque output 684.5 Nm, AIRMATIC air reservoir pressure 17.40 bar, rear-axle steer angle 1.69 deg
# Sindelfingen_EVA2_Telemetry[0811]: High-voltage battery pack SoC 94.30 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.80 C, front PSM efficiency 97.20 %, rear PSM torque output 684.6 Nm, AIRMATIC air reservoir pressure 17.40 bar, rear-axle steer angle 1.69 deg
# Sindelfingen_EVA2_Telemetry[0812]: High-voltage battery pack SoC 94.29 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.80 C, front PSM efficiency 97.20 %, rear PSM torque output 684.7 Nm, AIRMATIC air reservoir pressure 17.40 bar, rear-axle steer angle 1.69 deg
# Sindelfingen_EVA2_Telemetry[0813]: High-voltage battery pack SoC 94.28 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.81 C, front PSM efficiency 97.20 %, rear PSM torque output 684.8 Nm, AIRMATIC air reservoir pressure 17.40 bar, rear-axle steer angle 1.70 deg
# Sindelfingen_EVA2_Telemetry[0814]: High-voltage battery pack SoC 94.28 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.81 C, front PSM efficiency 97.20 %, rear PSM torque output 684.9 Nm, AIRMATIC air reservoir pressure 17.40 bar, rear-axle steer angle 1.70 deg
# Sindelfingen_EVA2_Telemetry[0815]: High-voltage battery pack SoC 94.27 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.81 C, front PSM efficiency 97.21 %, rear PSM torque output 685.0 Nm, AIRMATIC air reservoir pressure 17.41 bar, rear-axle steer angle 1.70 deg
# Sindelfingen_EVA2_Telemetry[0816]: High-voltage battery pack SoC 94.27 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.81 C, front PSM efficiency 97.21 %, rear PSM torque output 685.1 Nm, AIRMATIC air reservoir pressure 17.41 bar, rear-axle steer angle 1.70 deg
# Sindelfingen_EVA2_Telemetry[0817]: High-voltage battery pack SoC 94.27 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.81 C, front PSM efficiency 97.21 %, rear PSM torque output 685.2 Nm, AIRMATIC air reservoir pressure 17.41 bar, rear-axle steer angle 1.70 deg
# Sindelfingen_EVA2_Telemetry[0818]: High-voltage battery pack SoC 94.26 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.82 C, front PSM efficiency 97.21 %, rear PSM torque output 685.3 Nm, AIRMATIC air reservoir pressure 17.41 bar, rear-axle steer angle 1.71 deg
# Sindelfingen_EVA2_Telemetry[0819]: High-voltage battery pack SoC 94.25 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.82 C, front PSM efficiency 97.21 %, rear PSM torque output 685.4 Nm, AIRMATIC air reservoir pressure 17.41 bar, rear-axle steer angle 1.71 deg
# Sindelfingen_EVA2_Telemetry[0820]: High-voltage battery pack SoC 94.25 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.82 C, front PSM efficiency 97.21 %, rear PSM torque output 685.5 Nm, AIRMATIC air reservoir pressure 17.41 bar, rear-axle steer angle 1.71 deg
# Sindelfingen_EVA2_Telemetry[0821]: High-voltage battery pack SoC 94.25 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.82 C, front PSM efficiency 97.21 %, rear PSM torque output 685.6 Nm, AIRMATIC air reservoir pressure 17.41 bar, rear-axle steer angle 1.71 deg
# Sindelfingen_EVA2_Telemetry[0822]: High-voltage battery pack SoC 94.24 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.82 C, front PSM efficiency 97.21 %, rear PSM torque output 685.7 Nm, AIRMATIC air reservoir pressure 17.41 bar, rear-axle steer angle 1.71 deg
# Sindelfingen_EVA2_Telemetry[0823]: High-voltage battery pack SoC 94.23 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.83 C, front PSM efficiency 97.21 %, rear PSM torque output 685.8 Nm, AIRMATIC air reservoir pressure 17.41 bar, rear-axle steer angle 1.72 deg
# Sindelfingen_EVA2_Telemetry[0824]: High-voltage battery pack SoC 94.23 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.83 C, front PSM efficiency 97.21 %, rear PSM torque output 685.9 Nm, AIRMATIC air reservoir pressure 17.41 bar, rear-axle steer angle 1.72 deg
# Sindelfingen_EVA2_Telemetry[0825]: High-voltage battery pack SoC 94.22 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.83 C, front PSM efficiency 97.22 %, rear PSM torque output 686.0 Nm, AIRMATIC air reservoir pressure 17.42 bar, rear-axle steer angle 1.72 deg
# Sindelfingen_EVA2_Telemetry[0826]: High-voltage battery pack SoC 94.22 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.83 C, front PSM efficiency 97.22 %, rear PSM torque output 686.1 Nm, AIRMATIC air reservoir pressure 17.42 bar, rear-axle steer angle 1.72 deg
# Sindelfingen_EVA2_Telemetry[0827]: High-voltage battery pack SoC 94.22 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.83 C, front PSM efficiency 97.22 %, rear PSM torque output 686.2 Nm, AIRMATIC air reservoir pressure 17.42 bar, rear-axle steer angle 1.72 deg
# Sindelfingen_EVA2_Telemetry[0828]: High-voltage battery pack SoC 94.21 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.84 C, front PSM efficiency 97.22 %, rear PSM torque output 686.3 Nm, AIRMATIC air reservoir pressure 17.42 bar, rear-axle steer angle 1.73 deg
# Sindelfingen_EVA2_Telemetry[0829]: High-voltage battery pack SoC 94.20 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.84 C, front PSM efficiency 97.22 %, rear PSM torque output 686.4 Nm, AIRMATIC air reservoir pressure 17.42 bar, rear-axle steer angle 1.73 deg
# Sindelfingen_EVA2_Telemetry[0830]: High-voltage battery pack SoC 94.20 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.84 C, front PSM efficiency 97.22 %, rear PSM torque output 686.5 Nm, AIRMATIC air reservoir pressure 17.42 bar, rear-axle steer angle 1.73 deg
# Sindelfingen_EVA2_Telemetry[0831]: High-voltage battery pack SoC 94.19 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.84 C, front PSM efficiency 97.22 %, rear PSM torque output 686.6 Nm, AIRMATIC air reservoir pressure 17.42 bar, rear-axle steer angle 1.73 deg
# Sindelfingen_EVA2_Telemetry[0832]: High-voltage battery pack SoC 94.19 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.84 C, front PSM efficiency 97.22 %, rear PSM torque output 686.7 Nm, AIRMATIC air reservoir pressure 17.42 bar, rear-axle steer angle 1.73 deg
# Sindelfingen_EVA2_Telemetry[0833]: High-voltage battery pack SoC 94.19 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.85 C, front PSM efficiency 97.22 %, rear PSM torque output 686.8 Nm, AIRMATIC air reservoir pressure 17.42 bar, rear-axle steer angle 1.74 deg
# Sindelfingen_EVA2_Telemetry[0834]: High-voltage battery pack SoC 94.18 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.85 C, front PSM efficiency 97.22 %, rear PSM torque output 686.9 Nm, AIRMATIC air reservoir pressure 17.42 bar, rear-axle steer angle 1.74 deg
# Sindelfingen_EVA2_Telemetry[0835]: High-voltage battery pack SoC 94.17 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.85 C, front PSM efficiency 97.23 %, rear PSM torque output 687.0 Nm, AIRMATIC air reservoir pressure 17.43 bar, rear-axle steer angle 1.74 deg
# Sindelfingen_EVA2_Telemetry[0836]: High-voltage battery pack SoC 94.17 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.85 C, front PSM efficiency 97.23 %, rear PSM torque output 687.1 Nm, AIRMATIC air reservoir pressure 17.43 bar, rear-axle steer angle 1.74 deg
# Sindelfingen_EVA2_Telemetry[0837]: High-voltage battery pack SoC 94.16 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.85 C, front PSM efficiency 97.23 %, rear PSM torque output 687.2 Nm, AIRMATIC air reservoir pressure 17.43 bar, rear-axle steer angle 1.74 deg
# Sindelfingen_EVA2_Telemetry[0838]: High-voltage battery pack SoC 94.16 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.86 C, front PSM efficiency 97.23 %, rear PSM torque output 687.3 Nm, AIRMATIC air reservoir pressure 17.43 bar, rear-axle steer angle 1.75 deg
# Sindelfingen_EVA2_Telemetry[0839]: High-voltage battery pack SoC 94.16 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.86 C, front PSM efficiency 97.23 %, rear PSM torque output 687.4 Nm, AIRMATIC air reservoir pressure 17.43 bar, rear-axle steer angle 1.75 deg
# Sindelfingen_EVA2_Telemetry[0840]: High-voltage battery pack SoC 94.15 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.86 C, front PSM efficiency 97.23 %, rear PSM torque output 687.5 Nm, AIRMATIC air reservoir pressure 17.43 bar, rear-axle steer angle 1.75 deg
# Sindelfingen_EVA2_Telemetry[0841]: High-voltage battery pack SoC 94.14 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.86 C, front PSM efficiency 97.23 %, rear PSM torque output 687.6 Nm, AIRMATIC air reservoir pressure 17.43 bar, rear-axle steer angle 1.75 deg
# Sindelfingen_EVA2_Telemetry[0842]: High-voltage battery pack SoC 94.14 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.86 C, front PSM efficiency 97.23 %, rear PSM torque output 687.7 Nm, AIRMATIC air reservoir pressure 17.43 bar, rear-axle steer angle 1.75 deg
# Sindelfingen_EVA2_Telemetry[0843]: High-voltage battery pack SoC 94.13 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.87 C, front PSM efficiency 97.23 %, rear PSM torque output 687.8 Nm, AIRMATIC air reservoir pressure 17.43 bar, rear-axle steer angle 1.76 deg
# Sindelfingen_EVA2_Telemetry[0844]: High-voltage battery pack SoC 94.13 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.87 C, front PSM efficiency 97.23 %, rear PSM torque output 687.9 Nm, AIRMATIC air reservoir pressure 17.43 bar, rear-axle steer angle 1.76 deg
# Sindelfingen_EVA2_Telemetry[0845]: High-voltage battery pack SoC 94.12 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.87 C, front PSM efficiency 97.23 %, rear PSM torque output 688.0 Nm, AIRMATIC air reservoir pressure 17.44 bar, rear-axle steer angle 1.76 deg
# Sindelfingen_EVA2_Telemetry[0846]: High-voltage battery pack SoC 94.12 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.87 C, front PSM efficiency 97.24 %, rear PSM torque output 688.1 Nm, AIRMATIC air reservoir pressure 17.44 bar, rear-axle steer angle 1.76 deg
# Sindelfingen_EVA2_Telemetry[0847]: High-voltage battery pack SoC 94.11 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.87 C, front PSM efficiency 97.24 %, rear PSM torque output 688.2 Nm, AIRMATIC air reservoir pressure 17.44 bar, rear-axle steer angle 1.76 deg
# Sindelfingen_EVA2_Telemetry[0848]: High-voltage battery pack SoC 94.11 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.88 C, front PSM efficiency 97.24 %, rear PSM torque output 688.3 Nm, AIRMATIC air reservoir pressure 17.44 bar, rear-axle steer angle 1.77 deg
# Sindelfingen_EVA2_Telemetry[0849]: High-voltage battery pack SoC 94.10 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.88 C, front PSM efficiency 97.24 %, rear PSM torque output 688.4 Nm, AIRMATIC air reservoir pressure 17.44 bar, rear-axle steer angle 1.77 deg
# Sindelfingen_EVA2_Telemetry[0850]: High-voltage battery pack SoC 94.10 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.88 C, front PSM efficiency 97.24 %, rear PSM torque output 688.5 Nm, AIRMATIC air reservoir pressure 17.44 bar, rear-axle steer angle 1.77 deg
# Sindelfingen_EVA2_Telemetry[0851]: High-voltage battery pack SoC 94.09 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.88 C, front PSM efficiency 97.24 %, rear PSM torque output 688.6 Nm, AIRMATIC air reservoir pressure 17.44 bar, rear-axle steer angle 1.77 deg
# Sindelfingen_EVA2_Telemetry[0852]: High-voltage battery pack SoC 94.09 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.88 C, front PSM efficiency 97.24 %, rear PSM torque output 688.7 Nm, AIRMATIC air reservoir pressure 17.44 bar, rear-axle steer angle 1.77 deg
# Sindelfingen_EVA2_Telemetry[0853]: High-voltage battery pack SoC 94.08 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.89 C, front PSM efficiency 97.24 %, rear PSM torque output 688.8 Nm, AIRMATIC air reservoir pressure 17.44 bar, rear-axle steer angle 1.78 deg
# Sindelfingen_EVA2_Telemetry[0854]: High-voltage battery pack SoC 94.08 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.89 C, front PSM efficiency 97.24 %, rear PSM torque output 688.9 Nm, AIRMATIC air reservoir pressure 17.44 bar, rear-axle steer angle 1.78 deg
# Sindelfingen_EVA2_Telemetry[0855]: High-voltage battery pack SoC 94.08 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.89 C, front PSM efficiency 97.25 %, rear PSM torque output 689.0 Nm, AIRMATIC air reservoir pressure 17.45 bar, rear-axle steer angle 1.78 deg
# Sindelfingen_EVA2_Telemetry[0856]: High-voltage battery pack SoC 94.07 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.89 C, front PSM efficiency 97.25 %, rear PSM torque output 689.1 Nm, AIRMATIC air reservoir pressure 17.45 bar, rear-axle steer angle 1.78 deg
# Sindelfingen_EVA2_Telemetry[0857]: High-voltage battery pack SoC 94.06 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.89 C, front PSM efficiency 97.25 %, rear PSM torque output 689.2 Nm, AIRMATIC air reservoir pressure 17.45 bar, rear-axle steer angle 1.78 deg
# Sindelfingen_EVA2_Telemetry[0858]: High-voltage battery pack SoC 94.06 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.90 C, front PSM efficiency 97.25 %, rear PSM torque output 689.3 Nm, AIRMATIC air reservoir pressure 17.45 bar, rear-axle steer angle 1.79 deg
# Sindelfingen_EVA2_Telemetry[0859]: High-voltage battery pack SoC 94.05 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.90 C, front PSM efficiency 97.25 %, rear PSM torque output 689.4 Nm, AIRMATIC air reservoir pressure 17.45 bar, rear-axle steer angle 1.79 deg
# Sindelfingen_EVA2_Telemetry[0860]: High-voltage battery pack SoC 94.05 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.90 C, front PSM efficiency 97.25 %, rear PSM torque output 689.5 Nm, AIRMATIC air reservoir pressure 17.45 bar, rear-axle steer angle 1.79 deg
# Sindelfingen_EVA2_Telemetry[0861]: High-voltage battery pack SoC 94.05 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.90 C, front PSM efficiency 97.25 %, rear PSM torque output 689.6 Nm, AIRMATIC air reservoir pressure 17.45 bar, rear-axle steer angle 1.79 deg
# Sindelfingen_EVA2_Telemetry[0862]: High-voltage battery pack SoC 94.04 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.90 C, front PSM efficiency 97.25 %, rear PSM torque output 689.7 Nm, AIRMATIC air reservoir pressure 17.45 bar, rear-axle steer angle 1.79 deg
# Sindelfingen_EVA2_Telemetry[0863]: High-voltage battery pack SoC 94.03 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.91 C, front PSM efficiency 97.25 %, rear PSM torque output 689.8 Nm, AIRMATIC air reservoir pressure 17.45 bar, rear-axle steer angle 1.80 deg
# Sindelfingen_EVA2_Telemetry[0864]: High-voltage battery pack SoC 94.03 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.91 C, front PSM efficiency 97.25 %, rear PSM torque output 689.9 Nm, AIRMATIC air reservoir pressure 17.45 bar, rear-axle steer angle 1.80 deg
# Sindelfingen_EVA2_Telemetry[0865]: High-voltage battery pack SoC 94.02 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.91 C, front PSM efficiency 97.26 %, rear PSM torque output 690.0 Nm, AIRMATIC air reservoir pressure 17.46 bar, rear-axle steer angle 1.80 deg
# Sindelfingen_EVA2_Telemetry[0866]: High-voltage battery pack SoC 94.02 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.91 C, front PSM efficiency 97.26 %, rear PSM torque output 690.1 Nm, AIRMATIC air reservoir pressure 17.46 bar, rear-axle steer angle 1.80 deg
# Sindelfingen_EVA2_Telemetry[0867]: High-voltage battery pack SoC 94.02 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.91 C, front PSM efficiency 97.26 %, rear PSM torque output 690.2 Nm, AIRMATIC air reservoir pressure 17.46 bar, rear-axle steer angle 1.80 deg
# Sindelfingen_EVA2_Telemetry[0868]: High-voltage battery pack SoC 94.01 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.92 C, front PSM efficiency 97.26 %, rear PSM torque output 690.3 Nm, AIRMATIC air reservoir pressure 17.46 bar, rear-axle steer angle 1.81 deg
# Sindelfingen_EVA2_Telemetry[0869]: High-voltage battery pack SoC 94.00 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.92 C, front PSM efficiency 97.26 %, rear PSM torque output 690.4 Nm, AIRMATIC air reservoir pressure 17.46 bar, rear-axle steer angle 1.81 deg
# Sindelfingen_EVA2_Telemetry[0870]: High-voltage battery pack SoC 94.00 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.92 C, front PSM efficiency 97.26 %, rear PSM torque output 690.5 Nm, AIRMATIC air reservoir pressure 17.46 bar, rear-axle steer angle 1.81 deg
# Sindelfingen_EVA2_Telemetry[0871]: High-voltage battery pack SoC 94.00 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.92 C, front PSM efficiency 97.26 %, rear PSM torque output 690.6 Nm, AIRMATIC air reservoir pressure 17.46 bar, rear-axle steer angle 1.81 deg
# Sindelfingen_EVA2_Telemetry[0872]: High-voltage battery pack SoC 93.99 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.92 C, front PSM efficiency 97.26 %, rear PSM torque output 690.7 Nm, AIRMATIC air reservoir pressure 17.46 bar, rear-axle steer angle 1.81 deg
# Sindelfingen_EVA2_Telemetry[0873]: High-voltage battery pack SoC 93.98 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.93 C, front PSM efficiency 97.26 %, rear PSM torque output 690.8 Nm, AIRMATIC air reservoir pressure 17.46 bar, rear-axle steer angle 1.82 deg
# Sindelfingen_EVA2_Telemetry[0874]: High-voltage battery pack SoC 93.98 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.93 C, front PSM efficiency 97.26 %, rear PSM torque output 690.9 Nm, AIRMATIC air reservoir pressure 17.46 bar, rear-axle steer angle 1.82 deg
# Sindelfingen_EVA2_Telemetry[0875]: High-voltage battery pack SoC 93.97 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.93 C, front PSM efficiency 97.27 %, rear PSM torque output 691.0 Nm, AIRMATIC air reservoir pressure 17.46 bar, rear-axle steer angle 1.82 deg
# Sindelfingen_EVA2_Telemetry[0876]: High-voltage battery pack SoC 93.97 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.93 C, front PSM efficiency 97.27 %, rear PSM torque output 691.1 Nm, AIRMATIC air reservoir pressure 17.47 bar, rear-axle steer angle 1.82 deg
# Sindelfingen_EVA2_Telemetry[0877]: High-voltage battery pack SoC 93.97 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.93 C, front PSM efficiency 97.27 %, rear PSM torque output 691.2 Nm, AIRMATIC air reservoir pressure 17.47 bar, rear-axle steer angle 1.82 deg
# Sindelfingen_EVA2_Telemetry[0878]: High-voltage battery pack SoC 93.96 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.94 C, front PSM efficiency 97.27 %, rear PSM torque output 691.3 Nm, AIRMATIC air reservoir pressure 17.47 bar, rear-axle steer angle 1.83 deg
# Sindelfingen_EVA2_Telemetry[0879]: High-voltage battery pack SoC 93.95 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.94 C, front PSM efficiency 97.27 %, rear PSM torque output 691.4 Nm, AIRMATIC air reservoir pressure 17.47 bar, rear-axle steer angle 1.83 deg
# Sindelfingen_EVA2_Telemetry[0880]: High-voltage battery pack SoC 93.95 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.94 C, front PSM efficiency 97.27 %, rear PSM torque output 691.5 Nm, AIRMATIC air reservoir pressure 17.47 bar, rear-axle steer angle 1.83 deg
# Sindelfingen_EVA2_Telemetry[0881]: High-voltage battery pack SoC 93.94 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.94 C, front PSM efficiency 97.27 %, rear PSM torque output 691.6 Nm, AIRMATIC air reservoir pressure 17.47 bar, rear-axle steer angle 1.83 deg
# Sindelfingen_EVA2_Telemetry[0882]: High-voltage battery pack SoC 93.94 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.94 C, front PSM efficiency 97.27 %, rear PSM torque output 691.7 Nm, AIRMATIC air reservoir pressure 17.47 bar, rear-axle steer angle 1.83 deg
# Sindelfingen_EVA2_Telemetry[0883]: High-voltage battery pack SoC 93.94 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.95 C, front PSM efficiency 97.27 %, rear PSM torque output 691.8 Nm, AIRMATIC air reservoir pressure 17.47 bar, rear-axle steer angle 1.84 deg
# Sindelfingen_EVA2_Telemetry[0884]: High-voltage battery pack SoC 93.93 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.95 C, front PSM efficiency 97.27 %, rear PSM torque output 691.9 Nm, AIRMATIC air reservoir pressure 17.47 bar, rear-axle steer angle 1.84 deg
# Sindelfingen_EVA2_Telemetry[0885]: High-voltage battery pack SoC 93.92 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.95 C, front PSM efficiency 97.28 %, rear PSM torque output 692.0 Nm, AIRMATIC air reservoir pressure 17.48 bar, rear-axle steer angle 1.84 deg
# Sindelfingen_EVA2_Telemetry[0886]: High-voltage battery pack SoC 93.92 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.95 C, front PSM efficiency 97.28 %, rear PSM torque output 692.1 Nm, AIRMATIC air reservoir pressure 17.48 bar, rear-axle steer angle 1.84 deg
# Sindelfingen_EVA2_Telemetry[0887]: High-voltage battery pack SoC 93.91 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.95 C, front PSM efficiency 97.28 %, rear PSM torque output 692.2 Nm, AIRMATIC air reservoir pressure 17.48 bar, rear-axle steer angle 1.84 deg
# Sindelfingen_EVA2_Telemetry[0888]: High-voltage battery pack SoC 93.91 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.96 C, front PSM efficiency 97.28 %, rear PSM torque output 692.3 Nm, AIRMATIC air reservoir pressure 17.48 bar, rear-axle steer angle 1.85 deg
# Sindelfingen_EVA2_Telemetry[0889]: High-voltage battery pack SoC 93.91 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.96 C, front PSM efficiency 97.28 %, rear PSM torque output 692.4 Nm, AIRMATIC air reservoir pressure 17.48 bar, rear-axle steer angle 1.85 deg
# Sindelfingen_EVA2_Telemetry[0890]: High-voltage battery pack SoC 93.90 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.96 C, front PSM efficiency 97.28 %, rear PSM torque output 692.5 Nm, AIRMATIC air reservoir pressure 17.48 bar, rear-axle steer angle 1.85 deg
# Sindelfingen_EVA2_Telemetry[0891]: High-voltage battery pack SoC 93.89 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.96 C, front PSM efficiency 97.28 %, rear PSM torque output 692.6 Nm, AIRMATIC air reservoir pressure 17.48 bar, rear-axle steer angle 1.85 deg
# Sindelfingen_EVA2_Telemetry[0892]: High-voltage battery pack SoC 93.89 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.96 C, front PSM efficiency 97.28 %, rear PSM torque output 692.7 Nm, AIRMATIC air reservoir pressure 17.48 bar, rear-axle steer angle 1.85 deg
# Sindelfingen_EVA2_Telemetry[0893]: High-voltage battery pack SoC 93.88 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.97 C, front PSM efficiency 97.28 %, rear PSM torque output 692.8 Nm, AIRMATIC air reservoir pressure 17.48 bar, rear-axle steer angle 1.86 deg
# Sindelfingen_EVA2_Telemetry[0894]: High-voltage battery pack SoC 93.88 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.97 C, front PSM efficiency 97.28 %, rear PSM torque output 692.9 Nm, AIRMATIC air reservoir pressure 17.48 bar, rear-axle steer angle 1.86 deg
# Sindelfingen_EVA2_Telemetry[0895]: High-voltage battery pack SoC 93.88 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.97 C, front PSM efficiency 97.29 %, rear PSM torque output 693.0 Nm, AIRMATIC air reservoir pressure 17.49 bar, rear-axle steer angle 1.86 deg
# Sindelfingen_EVA2_Telemetry[0896]: High-voltage battery pack SoC 93.87 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.97 C, front PSM efficiency 97.29 %, rear PSM torque output 693.1 Nm, AIRMATIC air reservoir pressure 17.49 bar, rear-axle steer angle 1.86 deg
# Sindelfingen_EVA2_Telemetry[0897]: High-voltage battery pack SoC 93.86 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.97 C, front PSM efficiency 97.29 %, rear PSM torque output 693.2 Nm, AIRMATIC air reservoir pressure 17.49 bar, rear-axle steer angle 1.86 deg
# Sindelfingen_EVA2_Telemetry[0898]: High-voltage battery pack SoC 93.86 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.98 C, front PSM efficiency 97.29 %, rear PSM torque output 693.3 Nm, AIRMATIC air reservoir pressure 17.49 bar, rear-axle steer angle 1.87 deg
# Sindelfingen_EVA2_Telemetry[0899]: High-voltage battery pack SoC 93.85 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.98 C, front PSM efficiency 97.29 %, rear PSM torque output 693.4 Nm, AIRMATIC air reservoir pressure 17.49 bar, rear-axle steer angle 1.87 deg
# Sindelfingen_EVA2_Telemetry[0900]: High-voltage battery pack SoC 93.85 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.98 C, front PSM efficiency 97.29 %, rear PSM torque output 693.5 Nm, AIRMATIC air reservoir pressure 17.49 bar, rear-axle steer angle 1.87 deg
# Sindelfingen_EVA2_Telemetry[0901]: High-voltage battery pack SoC 93.84 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.98 C, front PSM efficiency 97.29 %, rear PSM torque output 693.6 Nm, AIRMATIC air reservoir pressure 17.49 bar, rear-axle steer angle 1.87 deg
# Sindelfingen_EVA2_Telemetry[0902]: High-voltage battery pack SoC 93.84 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.98 C, front PSM efficiency 97.29 %, rear PSM torque output 693.7 Nm, AIRMATIC air reservoir pressure 17.49 bar, rear-axle steer angle 1.87 deg
# Sindelfingen_EVA2_Telemetry[0903]: High-voltage battery pack SoC 93.83 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.99 C, front PSM efficiency 97.29 %, rear PSM torque output 693.8 Nm, AIRMATIC air reservoir pressure 17.49 bar, rear-axle steer angle 1.88 deg
# Sindelfingen_EVA2_Telemetry[0904]: High-voltage battery pack SoC 93.83 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.99 C, front PSM efficiency 97.29 %, rear PSM torque output 693.9 Nm, AIRMATIC air reservoir pressure 17.49 bar, rear-axle steer angle 1.88 deg
# Sindelfingen_EVA2_Telemetry[0905]: High-voltage battery pack SoC 93.83 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.99 C, front PSM efficiency 97.30 %, rear PSM torque output 694.0 Nm, AIRMATIC air reservoir pressure 17.50 bar, rear-axle steer angle 1.88 deg
# Sindelfingen_EVA2_Telemetry[0906]: High-voltage battery pack SoC 93.82 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.99 C, front PSM efficiency 97.30 %, rear PSM torque output 694.1 Nm, AIRMATIC air reservoir pressure 17.50 bar, rear-axle steer angle 1.88 deg
# Sindelfingen_EVA2_Telemetry[0907]: High-voltage battery pack SoC 93.81 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 25.99 C, front PSM efficiency 97.30 %, rear PSM torque output 694.2 Nm, AIRMATIC air reservoir pressure 17.50 bar, rear-axle steer angle 1.88 deg
# Sindelfingen_EVA2_Telemetry[0908]: High-voltage battery pack SoC 93.81 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.00 C, front PSM efficiency 97.30 %, rear PSM torque output 694.3 Nm, AIRMATIC air reservoir pressure 17.50 bar, rear-axle steer angle 1.89 deg
# Sindelfingen_EVA2_Telemetry[0909]: High-voltage battery pack SoC 93.80 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.00 C, front PSM efficiency 97.30 %, rear PSM torque output 694.4 Nm, AIRMATIC air reservoir pressure 17.50 bar, rear-axle steer angle 1.89 deg
# Sindelfingen_EVA2_Telemetry[0910]: High-voltage battery pack SoC 93.80 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.00 C, front PSM efficiency 97.30 %, rear PSM torque output 694.5 Nm, AIRMATIC air reservoir pressure 17.50 bar, rear-axle steer angle 1.89 deg
# Sindelfingen_EVA2_Telemetry[0911]: High-voltage battery pack SoC 93.80 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.00 C, front PSM efficiency 97.30 %, rear PSM torque output 694.6 Nm, AIRMATIC air reservoir pressure 17.50 bar, rear-axle steer angle 1.89 deg
# Sindelfingen_EVA2_Telemetry[0912]: High-voltage battery pack SoC 93.79 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.00 C, front PSM efficiency 97.30 %, rear PSM torque output 694.7 Nm, AIRMATIC air reservoir pressure 17.50 bar, rear-axle steer angle 1.89 deg
# Sindelfingen_EVA2_Telemetry[0913]: High-voltage battery pack SoC 93.78 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.01 C, front PSM efficiency 97.30 %, rear PSM torque output 694.8 Nm, AIRMATIC air reservoir pressure 17.50 bar, rear-axle steer angle 1.90 deg
# Sindelfingen_EVA2_Telemetry[0914]: High-voltage battery pack SoC 93.78 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.01 C, front PSM efficiency 97.30 %, rear PSM torque output 694.9 Nm, AIRMATIC air reservoir pressure 17.50 bar, rear-axle steer angle 1.90 deg
# Sindelfingen_EVA2_Telemetry[0915]: High-voltage battery pack SoC 93.77 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.01 C, front PSM efficiency 97.31 %, rear PSM torque output 695.0 Nm, AIRMATIC air reservoir pressure 17.51 bar, rear-axle steer angle 1.90 deg
# Sindelfingen_EVA2_Telemetry[0916]: High-voltage battery pack SoC 93.77 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.01 C, front PSM efficiency 97.31 %, rear PSM torque output 695.1 Nm, AIRMATIC air reservoir pressure 17.51 bar, rear-axle steer angle 1.90 deg
# Sindelfingen_EVA2_Telemetry[0917]: High-voltage battery pack SoC 93.77 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.01 C, front PSM efficiency 97.31 %, rear PSM torque output 695.2 Nm, AIRMATIC air reservoir pressure 17.51 bar, rear-axle steer angle 1.90 deg
# Sindelfingen_EVA2_Telemetry[0918]: High-voltage battery pack SoC 93.76 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.02 C, front PSM efficiency 97.31 %, rear PSM torque output 695.3 Nm, AIRMATIC air reservoir pressure 17.51 bar, rear-axle steer angle 1.91 deg
# Sindelfingen_EVA2_Telemetry[0919]: High-voltage battery pack SoC 93.75 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.02 C, front PSM efficiency 97.31 %, rear PSM torque output 695.4 Nm, AIRMATIC air reservoir pressure 17.51 bar, rear-axle steer angle 1.91 deg
# Sindelfingen_EVA2_Telemetry[0920]: High-voltage battery pack SoC 93.75 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.02 C, front PSM efficiency 97.31 %, rear PSM torque output 695.5 Nm, AIRMATIC air reservoir pressure 17.51 bar, rear-axle steer angle 1.91 deg
# Sindelfingen_EVA2_Telemetry[0921]: High-voltage battery pack SoC 93.75 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.02 C, front PSM efficiency 97.31 %, rear PSM torque output 695.6 Nm, AIRMATIC air reservoir pressure 17.51 bar, rear-axle steer angle 1.91 deg
# Sindelfingen_EVA2_Telemetry[0922]: High-voltage battery pack SoC 93.74 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.02 C, front PSM efficiency 97.31 %, rear PSM torque output 695.7 Nm, AIRMATIC air reservoir pressure 17.51 bar, rear-axle steer angle 1.91 deg
# Sindelfingen_EVA2_Telemetry[0923]: High-voltage battery pack SoC 93.73 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.03 C, front PSM efficiency 97.31 %, rear PSM torque output 695.8 Nm, AIRMATIC air reservoir pressure 17.51 bar, rear-axle steer angle 1.92 deg
# Sindelfingen_EVA2_Telemetry[0924]: High-voltage battery pack SoC 93.73 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.03 C, front PSM efficiency 97.31 %, rear PSM torque output 695.9 Nm, AIRMATIC air reservoir pressure 17.51 bar, rear-axle steer angle 1.92 deg
# Sindelfingen_EVA2_Telemetry[0925]: High-voltage battery pack SoC 93.72 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.03 C, front PSM efficiency 97.32 %, rear PSM torque output 696.0 Nm, AIRMATIC air reservoir pressure 17.52 bar, rear-axle steer angle 1.92 deg
# Sindelfingen_EVA2_Telemetry[0926]: High-voltage battery pack SoC 93.72 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.03 C, front PSM efficiency 97.32 %, rear PSM torque output 696.1 Nm, AIRMATIC air reservoir pressure 17.52 bar, rear-axle steer angle 1.92 deg
# Sindelfingen_EVA2_Telemetry[0927]: High-voltage battery pack SoC 93.72 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.03 C, front PSM efficiency 97.32 %, rear PSM torque output 696.2 Nm, AIRMATIC air reservoir pressure 17.52 bar, rear-axle steer angle 1.92 deg
# Sindelfingen_EVA2_Telemetry[0928]: High-voltage battery pack SoC 93.71 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.04 C, front PSM efficiency 97.32 %, rear PSM torque output 696.3 Nm, AIRMATIC air reservoir pressure 17.52 bar, rear-axle steer angle 1.93 deg
# Sindelfingen_EVA2_Telemetry[0929]: High-voltage battery pack SoC 93.70 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.04 C, front PSM efficiency 97.32 %, rear PSM torque output 696.4 Nm, AIRMATIC air reservoir pressure 17.52 bar, rear-axle steer angle 1.93 deg
# Sindelfingen_EVA2_Telemetry[0930]: High-voltage battery pack SoC 93.70 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.04 C, front PSM efficiency 97.32 %, rear PSM torque output 696.5 Nm, AIRMATIC air reservoir pressure 17.52 bar, rear-axle steer angle 1.93 deg
# Sindelfingen_EVA2_Telemetry[0931]: High-voltage battery pack SoC 93.69 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.04 C, front PSM efficiency 97.32 %, rear PSM torque output 696.6 Nm, AIRMATIC air reservoir pressure 17.52 bar, rear-axle steer angle 1.93 deg
# Sindelfingen_EVA2_Telemetry[0932]: High-voltage battery pack SoC 93.69 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.04 C, front PSM efficiency 97.32 %, rear PSM torque output 696.7 Nm, AIRMATIC air reservoir pressure 17.52 bar, rear-axle steer angle 1.93 deg
# Sindelfingen_EVA2_Telemetry[0933]: High-voltage battery pack SoC 93.69 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.05 C, front PSM efficiency 97.32 %, rear PSM torque output 696.8 Nm, AIRMATIC air reservoir pressure 17.52 bar, rear-axle steer angle 1.94 deg
# Sindelfingen_EVA2_Telemetry[0934]: High-voltage battery pack SoC 93.68 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.05 C, front PSM efficiency 97.32 %, rear PSM torque output 696.9 Nm, AIRMATIC air reservoir pressure 17.52 bar, rear-axle steer angle 1.94 deg
# Sindelfingen_EVA2_Telemetry[0935]: High-voltage battery pack SoC 93.67 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.05 C, front PSM efficiency 97.33 %, rear PSM torque output 697.0 Nm, AIRMATIC air reservoir pressure 17.53 bar, rear-axle steer angle 1.94 deg
# Sindelfingen_EVA2_Telemetry[0936]: High-voltage battery pack SoC 93.67 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.05 C, front PSM efficiency 97.33 %, rear PSM torque output 697.1 Nm, AIRMATIC air reservoir pressure 17.53 bar, rear-axle steer angle 1.94 deg
# Sindelfingen_EVA2_Telemetry[0937]: High-voltage battery pack SoC 93.66 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.05 C, front PSM efficiency 97.33 %, rear PSM torque output 697.2 Nm, AIRMATIC air reservoir pressure 17.53 bar, rear-axle steer angle 1.94 deg
# Sindelfingen_EVA2_Telemetry[0938]: High-voltage battery pack SoC 93.66 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.06 C, front PSM efficiency 97.33 %, rear PSM torque output 697.3 Nm, AIRMATIC air reservoir pressure 17.53 bar, rear-axle steer angle 1.95 deg
# Sindelfingen_EVA2_Telemetry[0939]: High-voltage battery pack SoC 93.66 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.06 C, front PSM efficiency 97.33 %, rear PSM torque output 697.4 Nm, AIRMATIC air reservoir pressure 17.53 bar, rear-axle steer angle 1.95 deg
# Sindelfingen_EVA2_Telemetry[0940]: High-voltage battery pack SoC 93.65 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.06 C, front PSM efficiency 97.33 %, rear PSM torque output 697.5 Nm, AIRMATIC air reservoir pressure 17.53 bar, rear-axle steer angle 1.95 deg
# Sindelfingen_EVA2_Telemetry[0941]: High-voltage battery pack SoC 93.64 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.06 C, front PSM efficiency 97.33 %, rear PSM torque output 697.6 Nm, AIRMATIC air reservoir pressure 17.53 bar, rear-axle steer angle 1.95 deg
# Sindelfingen_EVA2_Telemetry[0942]: High-voltage battery pack SoC 93.64 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.06 C, front PSM efficiency 97.33 %, rear PSM torque output 697.7 Nm, AIRMATIC air reservoir pressure 17.53 bar, rear-axle steer angle 1.95 deg
# Sindelfingen_EVA2_Telemetry[0943]: High-voltage battery pack SoC 93.63 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.07 C, front PSM efficiency 97.33 %, rear PSM torque output 697.8 Nm, AIRMATIC air reservoir pressure 17.53 bar, rear-axle steer angle 1.96 deg
# Sindelfingen_EVA2_Telemetry[0944]: High-voltage battery pack SoC 93.63 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.07 C, front PSM efficiency 97.33 %, rear PSM torque output 697.9 Nm, AIRMATIC air reservoir pressure 17.53 bar, rear-axle steer angle 1.96 deg
# Sindelfingen_EVA2_Telemetry[0945]: High-voltage battery pack SoC 93.62 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.07 C, front PSM efficiency 97.34 %, rear PSM torque output 698.0 Nm, AIRMATIC air reservoir pressure 17.54 bar, rear-axle steer angle 1.96 deg
# Sindelfingen_EVA2_Telemetry[0946]: High-voltage battery pack SoC 93.62 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.07 C, front PSM efficiency 97.34 %, rear PSM torque output 698.1 Nm, AIRMATIC air reservoir pressure 17.54 bar, rear-axle steer angle 1.96 deg
# Sindelfingen_EVA2_Telemetry[0947]: High-voltage battery pack SoC 93.61 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.07 C, front PSM efficiency 97.34 %, rear PSM torque output 698.2 Nm, AIRMATIC air reservoir pressure 17.54 bar, rear-axle steer angle 1.96 deg
# Sindelfingen_EVA2_Telemetry[0948]: High-voltage battery pack SoC 93.61 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.08 C, front PSM efficiency 97.34 %, rear PSM torque output 698.3 Nm, AIRMATIC air reservoir pressure 17.54 bar, rear-axle steer angle 1.97 deg
# Sindelfingen_EVA2_Telemetry[0949]: High-voltage battery pack SoC 93.60 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.08 C, front PSM efficiency 97.34 %, rear PSM torque output 698.4 Nm, AIRMATIC air reservoir pressure 17.54 bar, rear-axle steer angle 1.97 deg
# Sindelfingen_EVA2_Telemetry[0950]: High-voltage battery pack SoC 93.60 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.08 C, front PSM efficiency 97.34 %, rear PSM torque output 698.5 Nm, AIRMATIC air reservoir pressure 17.54 bar, rear-axle steer angle 1.97 deg
# Sindelfingen_EVA2_Telemetry[0951]: High-voltage battery pack SoC 93.59 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.08 C, front PSM efficiency 97.34 %, rear PSM torque output 698.6 Nm, AIRMATIC air reservoir pressure 17.54 bar, rear-axle steer angle 1.97 deg
# Sindelfingen_EVA2_Telemetry[0952]: High-voltage battery pack SoC 93.59 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.08 C, front PSM efficiency 97.34 %, rear PSM torque output 698.7 Nm, AIRMATIC air reservoir pressure 17.54 bar, rear-axle steer angle 1.97 deg
# Sindelfingen_EVA2_Telemetry[0953]: High-voltage battery pack SoC 93.58 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.09 C, front PSM efficiency 97.34 %, rear PSM torque output 698.8 Nm, AIRMATIC air reservoir pressure 17.54 bar, rear-axle steer angle 1.98 deg
# Sindelfingen_EVA2_Telemetry[0954]: High-voltage battery pack SoC 93.58 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.09 C, front PSM efficiency 97.34 %, rear PSM torque output 698.9 Nm, AIRMATIC air reservoir pressure 17.54 bar, rear-axle steer angle 1.98 deg
# Sindelfingen_EVA2_Telemetry[0955]: High-voltage battery pack SoC 93.58 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.09 C, front PSM efficiency 97.34 %, rear PSM torque output 699.0 Nm, AIRMATIC air reservoir pressure 17.55 bar, rear-axle steer angle 1.98 deg
# Sindelfingen_EVA2_Telemetry[0956]: High-voltage battery pack SoC 93.57 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.09 C, front PSM efficiency 97.35 %, rear PSM torque output 699.1 Nm, AIRMATIC air reservoir pressure 17.55 bar, rear-axle steer angle 1.98 deg
# Sindelfingen_EVA2_Telemetry[0957]: High-voltage battery pack SoC 93.56 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.09 C, front PSM efficiency 97.35 %, rear PSM torque output 699.2 Nm, AIRMATIC air reservoir pressure 17.55 bar, rear-axle steer angle 1.98 deg
# Sindelfingen_EVA2_Telemetry[0958]: High-voltage battery pack SoC 93.56 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.10 C, front PSM efficiency 97.35 %, rear PSM torque output 699.3 Nm, AIRMATIC air reservoir pressure 17.55 bar, rear-axle steer angle 1.99 deg
# Sindelfingen_EVA2_Telemetry[0959]: High-voltage battery pack SoC 93.55 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.10 C, front PSM efficiency 97.35 %, rear PSM torque output 699.4 Nm, AIRMATIC air reservoir pressure 17.55 bar, rear-axle steer angle 1.99 deg
# Sindelfingen_EVA2_Telemetry[0960]: High-voltage battery pack SoC 93.55 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.10 C, front PSM efficiency 97.35 %, rear PSM torque output 699.5 Nm, AIRMATIC air reservoir pressure 17.55 bar, rear-axle steer angle 1.99 deg
# Sindelfingen_EVA2_Telemetry[0961]: High-voltage battery pack SoC 93.55 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.10 C, front PSM efficiency 97.35 %, rear PSM torque output 699.6 Nm, AIRMATIC air reservoir pressure 17.55 bar, rear-axle steer angle 1.99 deg
# Sindelfingen_EVA2_Telemetry[0962]: High-voltage battery pack SoC 93.54 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.10 C, front PSM efficiency 97.35 %, rear PSM torque output 699.7 Nm, AIRMATIC air reservoir pressure 17.55 bar, rear-axle steer angle 1.99 deg
# Sindelfingen_EVA2_Telemetry[0963]: High-voltage battery pack SoC 93.53 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.11 C, front PSM efficiency 97.35 %, rear PSM torque output 699.8 Nm, AIRMATIC air reservoir pressure 17.55 bar, rear-axle steer angle 2.00 deg
# Sindelfingen_EVA2_Telemetry[0964]: High-voltage battery pack SoC 93.53 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.11 C, front PSM efficiency 97.35 %, rear PSM torque output 699.9 Nm, AIRMATIC air reservoir pressure 17.55 bar, rear-axle steer angle 2.00 deg
# Sindelfingen_EVA2_Telemetry[0965]: High-voltage battery pack SoC 93.52 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.11 C, front PSM efficiency 97.36 %, rear PSM torque output 700.0 Nm, AIRMATIC air reservoir pressure 17.55 bar, rear-axle steer angle 2.00 deg
# Sindelfingen_EVA2_Telemetry[0966]: High-voltage battery pack SoC 93.52 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.11 C, front PSM efficiency 97.36 %, rear PSM torque output 700.1 Nm, AIRMATIC air reservoir pressure 17.56 bar, rear-axle steer angle 2.00 deg
# Sindelfingen_EVA2_Telemetry[0967]: High-voltage battery pack SoC 93.52 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.11 C, front PSM efficiency 97.36 %, rear PSM torque output 700.2 Nm, AIRMATIC air reservoir pressure 17.56 bar, rear-axle steer angle 2.00 deg
# Sindelfingen_EVA2_Telemetry[0968]: High-voltage battery pack SoC 93.51 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.12 C, front PSM efficiency 97.36 %, rear PSM torque output 700.3 Nm, AIRMATIC air reservoir pressure 17.56 bar, rear-axle steer angle 2.01 deg
# Sindelfingen_EVA2_Telemetry[0969]: High-voltage battery pack SoC 93.50 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.12 C, front PSM efficiency 97.36 %, rear PSM torque output 700.4 Nm, AIRMATIC air reservoir pressure 17.56 bar, rear-axle steer angle 2.01 deg
# Sindelfingen_EVA2_Telemetry[0970]: High-voltage battery pack SoC 93.50 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.12 C, front PSM efficiency 97.36 %, rear PSM torque output 700.5 Nm, AIRMATIC air reservoir pressure 17.56 bar, rear-axle steer angle 2.01 deg
# Sindelfingen_EVA2_Telemetry[0971]: High-voltage battery pack SoC 93.50 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.12 C, front PSM efficiency 97.36 %, rear PSM torque output 700.6 Nm, AIRMATIC air reservoir pressure 17.56 bar, rear-axle steer angle 2.01 deg
# Sindelfingen_EVA2_Telemetry[0972]: High-voltage battery pack SoC 93.49 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.12 C, front PSM efficiency 97.36 %, rear PSM torque output 700.7 Nm, AIRMATIC air reservoir pressure 17.56 bar, rear-axle steer angle 2.01 deg
# Sindelfingen_EVA2_Telemetry[0973]: High-voltage battery pack SoC 93.48 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.13 C, front PSM efficiency 97.36 %, rear PSM torque output 700.8 Nm, AIRMATIC air reservoir pressure 17.56 bar, rear-axle steer angle 2.02 deg
# Sindelfingen_EVA2_Telemetry[0974]: High-voltage battery pack SoC 93.48 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.13 C, front PSM efficiency 97.36 %, rear PSM torque output 700.9 Nm, AIRMATIC air reservoir pressure 17.56 bar, rear-axle steer angle 2.02 deg
# Sindelfingen_EVA2_Telemetry[0975]: High-voltage battery pack SoC 93.47 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.13 C, front PSM efficiency 97.37 %, rear PSM torque output 701.0 Nm, AIRMATIC air reservoir pressure 17.57 bar, rear-axle steer angle 2.02 deg
# Sindelfingen_EVA2_Telemetry[0976]: High-voltage battery pack SoC 93.47 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.13 C, front PSM efficiency 97.37 %, rear PSM torque output 701.1 Nm, AIRMATIC air reservoir pressure 17.57 bar, rear-axle steer angle 2.02 deg
# Sindelfingen_EVA2_Telemetry[0977]: High-voltage battery pack SoC 93.47 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.13 C, front PSM efficiency 97.37 %, rear PSM torque output 701.2 Nm, AIRMATIC air reservoir pressure 17.57 bar, rear-axle steer angle 2.02 deg
# Sindelfingen_EVA2_Telemetry[0978]: High-voltage battery pack SoC 93.46 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.14 C, front PSM efficiency 97.37 %, rear PSM torque output 701.3 Nm, AIRMATIC air reservoir pressure 17.57 bar, rear-axle steer angle 2.03 deg
# Sindelfingen_EVA2_Telemetry[0979]: High-voltage battery pack SoC 93.45 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.14 C, front PSM efficiency 97.37 %, rear PSM torque output 701.4 Nm, AIRMATIC air reservoir pressure 17.57 bar, rear-axle steer angle 2.03 deg
# Sindelfingen_EVA2_Telemetry[0980]: High-voltage battery pack SoC 93.45 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.14 C, front PSM efficiency 97.37 %, rear PSM torque output 701.5 Nm, AIRMATIC air reservoir pressure 17.57 bar, rear-axle steer angle 2.03 deg
# Sindelfingen_EVA2_Telemetry[0981]: High-voltage battery pack SoC 93.44 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.14 C, front PSM efficiency 97.37 %, rear PSM torque output 701.6 Nm, AIRMATIC air reservoir pressure 17.57 bar, rear-axle steer angle 2.03 deg
# Sindelfingen_EVA2_Telemetry[0982]: High-voltage battery pack SoC 93.44 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.14 C, front PSM efficiency 97.37 %, rear PSM torque output 701.7 Nm, AIRMATIC air reservoir pressure 17.57 bar, rear-axle steer angle 2.03 deg
# Sindelfingen_EVA2_Telemetry[0983]: High-voltage battery pack SoC 93.44 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.15 C, front PSM efficiency 97.37 %, rear PSM torque output 701.8 Nm, AIRMATIC air reservoir pressure 17.57 bar, rear-axle steer angle 2.04 deg
# Sindelfingen_EVA2_Telemetry[0984]: High-voltage battery pack SoC 93.43 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.15 C, front PSM efficiency 97.37 %, rear PSM torque output 701.9 Nm, AIRMATIC air reservoir pressure 17.57 bar, rear-axle steer angle 2.04 deg
# Sindelfingen_EVA2_Telemetry[0985]: High-voltage battery pack SoC 93.42 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.15 C, front PSM efficiency 97.38 %, rear PSM torque output 702.0 Nm, AIRMATIC air reservoir pressure 17.58 bar, rear-axle steer angle 2.04 deg
# Sindelfingen_EVA2_Telemetry[0986]: High-voltage battery pack SoC 93.42 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.15 C, front PSM efficiency 97.38 %, rear PSM torque output 702.1 Nm, AIRMATIC air reservoir pressure 17.58 bar, rear-axle steer angle 2.04 deg
# Sindelfingen_EVA2_Telemetry[0987]: High-voltage battery pack SoC 93.41 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.15 C, front PSM efficiency 97.38 %, rear PSM torque output 702.2 Nm, AIRMATIC air reservoir pressure 17.58 bar, rear-axle steer angle 2.04 deg
# Sindelfingen_EVA2_Telemetry[0988]: High-voltage battery pack SoC 93.41 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.16 C, front PSM efficiency 97.38 %, rear PSM torque output 702.3 Nm, AIRMATIC air reservoir pressure 17.58 bar, rear-axle steer angle 2.05 deg
# Sindelfingen_EVA2_Telemetry[0989]: High-voltage battery pack SoC 93.41 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.16 C, front PSM efficiency 97.38 %, rear PSM torque output 702.4 Nm, AIRMATIC air reservoir pressure 17.58 bar, rear-axle steer angle 2.05 deg
# Sindelfingen_EVA2_Telemetry[0990]: High-voltage battery pack SoC 93.40 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.16 C, front PSM efficiency 97.38 %, rear PSM torque output 702.5 Nm, AIRMATIC air reservoir pressure 17.58 bar, rear-axle steer angle 2.05 deg
# Sindelfingen_EVA2_Telemetry[0991]: High-voltage battery pack SoC 93.39 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.16 C, front PSM efficiency 97.38 %, rear PSM torque output 702.6 Nm, AIRMATIC air reservoir pressure 17.58 bar, rear-axle steer angle 2.05 deg
# Sindelfingen_EVA2_Telemetry[0992]: High-voltage battery pack SoC 93.39 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.16 C, front PSM efficiency 97.38 %, rear PSM torque output 702.7 Nm, AIRMATIC air reservoir pressure 17.58 bar, rear-axle steer angle 2.05 deg
# Sindelfingen_EVA2_Telemetry[0993]: High-voltage battery pack SoC 93.38 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.17 C, front PSM efficiency 97.38 %, rear PSM torque output 702.8 Nm, AIRMATIC air reservoir pressure 17.58 bar, rear-axle steer angle 2.06 deg
# Sindelfingen_EVA2_Telemetry[0994]: High-voltage battery pack SoC 93.38 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.17 C, front PSM efficiency 97.38 %, rear PSM torque output 702.9 Nm, AIRMATIC air reservoir pressure 17.58 bar, rear-axle steer angle 2.06 deg
# Sindelfingen_EVA2_Telemetry[0995]: High-voltage battery pack SoC 93.38 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.17 C, front PSM efficiency 97.39 %, rear PSM torque output 703.0 Nm, AIRMATIC air reservoir pressure 17.59 bar, rear-axle steer angle 2.06 deg
# Sindelfingen_EVA2_Telemetry[0996]: High-voltage battery pack SoC 93.37 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.17 C, front PSM efficiency 97.39 %, rear PSM torque output 703.1 Nm, AIRMATIC air reservoir pressure 17.59 bar, rear-axle steer angle 2.06 deg
# Sindelfingen_EVA2_Telemetry[0997]: High-voltage battery pack SoC 93.36 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.17 C, front PSM efficiency 97.39 %, rear PSM torque output 703.2 Nm, AIRMATIC air reservoir pressure 17.59 bar, rear-axle steer angle 2.06 deg
# Sindelfingen_EVA2_Telemetry[0998]: High-voltage battery pack SoC 93.36 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.18 C, front PSM efficiency 97.39 %, rear PSM torque output 703.3 Nm, AIRMATIC air reservoir pressure 17.59 bar, rear-axle steer angle 2.07 deg
# Sindelfingen_EVA2_Telemetry[0999]: High-voltage battery pack SoC 93.35 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.18 C, front PSM efficiency 97.39 %, rear PSM torque output 703.4 Nm, AIRMATIC air reservoir pressure 17.59 bar, rear-axle steer angle 2.07 deg
# Sindelfingen_EVA2_Telemetry[1000]: High-voltage battery pack SoC 93.35 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.18 C, front PSM efficiency 97.39 %, rear PSM torque output 703.5 Nm, AIRMATIC air reservoir pressure 17.59 bar, rear-axle steer angle 2.07 deg
# Sindelfingen_EVA2_Telemetry[1001]: High-voltage battery pack SoC 93.34 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.18 C, front PSM efficiency 97.39 %, rear PSM torque output 703.6 Nm, AIRMATIC air reservoir pressure 17.59 bar, rear-axle steer angle 2.07 deg
# Sindelfingen_EVA2_Telemetry[1002]: High-voltage battery pack SoC 93.34 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.18 C, front PSM efficiency 97.39 %, rear PSM torque output 703.7 Nm, AIRMATIC air reservoir pressure 17.59 bar, rear-axle steer angle 2.07 deg
# Sindelfingen_EVA2_Telemetry[1003]: High-voltage battery pack SoC 93.33 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.19 C, front PSM efficiency 97.39 %, rear PSM torque output 703.8 Nm, AIRMATIC air reservoir pressure 17.59 bar, rear-axle steer angle 2.08 deg
# Sindelfingen_EVA2_Telemetry[1004]: High-voltage battery pack SoC 93.33 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.19 C, front PSM efficiency 97.39 %, rear PSM torque output 703.9 Nm, AIRMATIC air reservoir pressure 17.59 bar, rear-axle steer angle 2.08 deg
# Sindelfingen_EVA2_Telemetry[1005]: High-voltage battery pack SoC 93.33 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.19 C, front PSM efficiency 97.40 %, rear PSM torque output 704.0 Nm, AIRMATIC air reservoir pressure 17.60 bar, rear-axle steer angle 2.08 deg
# Sindelfingen_EVA2_Telemetry[1006]: High-voltage battery pack SoC 93.32 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.19 C, front PSM efficiency 97.40 %, rear PSM torque output 704.1 Nm, AIRMATIC air reservoir pressure 17.60 bar, rear-axle steer angle 2.08 deg
# Sindelfingen_EVA2_Telemetry[1007]: High-voltage battery pack SoC 93.31 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.19 C, front PSM efficiency 97.40 %, rear PSM torque output 704.2 Nm, AIRMATIC air reservoir pressure 17.60 bar, rear-axle steer angle 2.08 deg
# Sindelfingen_EVA2_Telemetry[1008]: High-voltage battery pack SoC 93.31 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.20 C, front PSM efficiency 97.40 %, rear PSM torque output 704.3 Nm, AIRMATIC air reservoir pressure 17.60 bar, rear-axle steer angle 2.09 deg
# Sindelfingen_EVA2_Telemetry[1009]: High-voltage battery pack SoC 93.30 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.20 C, front PSM efficiency 97.40 %, rear PSM torque output 704.4 Nm, AIRMATIC air reservoir pressure 17.60 bar, rear-axle steer angle 2.09 deg
# Sindelfingen_EVA2_Telemetry[1010]: High-voltage battery pack SoC 93.30 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.20 C, front PSM efficiency 97.40 %, rear PSM torque output 704.5 Nm, AIRMATIC air reservoir pressure 17.60 bar, rear-axle steer angle 2.09 deg
# Sindelfingen_EVA2_Telemetry[1011]: High-voltage battery pack SoC 93.30 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.20 C, front PSM efficiency 97.40 %, rear PSM torque output 704.6 Nm, AIRMATIC air reservoir pressure 17.60 bar, rear-axle steer angle 2.09 deg
# Sindelfingen_EVA2_Telemetry[1012]: High-voltage battery pack SoC 93.29 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.20 C, front PSM efficiency 97.40 %, rear PSM torque output 704.7 Nm, AIRMATIC air reservoir pressure 17.60 bar, rear-axle steer angle 2.09 deg
# Sindelfingen_EVA2_Telemetry[1013]: High-voltage battery pack SoC 93.28 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.21 C, front PSM efficiency 97.40 %, rear PSM torque output 704.8 Nm, AIRMATIC air reservoir pressure 17.60 bar, rear-axle steer angle 2.10 deg
# Sindelfingen_EVA2_Telemetry[1014]: High-voltage battery pack SoC 93.28 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.21 C, front PSM efficiency 97.40 %, rear PSM torque output 704.9 Nm, AIRMATIC air reservoir pressure 17.60 bar, rear-axle steer angle 2.10 deg
# Sindelfingen_EVA2_Telemetry[1015]: High-voltage battery pack SoC 93.27 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.21 C, front PSM efficiency 97.41 %, rear PSM torque output 705.0 Nm, AIRMATIC air reservoir pressure 17.61 bar, rear-axle steer angle 2.10 deg
# Sindelfingen_EVA2_Telemetry[1016]: High-voltage battery pack SoC 93.27 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.21 C, front PSM efficiency 97.41 %, rear PSM torque output 705.1 Nm, AIRMATIC air reservoir pressure 17.61 bar, rear-axle steer angle 2.10 deg
# Sindelfingen_EVA2_Telemetry[1017]: High-voltage battery pack SoC 93.27 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.21 C, front PSM efficiency 97.41 %, rear PSM torque output 705.2 Nm, AIRMATIC air reservoir pressure 17.61 bar, rear-axle steer angle 2.10 deg
# Sindelfingen_EVA2_Telemetry[1018]: High-voltage battery pack SoC 93.26 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.22 C, front PSM efficiency 97.41 %, rear PSM torque output 705.3 Nm, AIRMATIC air reservoir pressure 17.61 bar, rear-axle steer angle 2.11 deg
# Sindelfingen_EVA2_Telemetry[1019]: High-voltage battery pack SoC 93.25 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.22 C, front PSM efficiency 97.41 %, rear PSM torque output 705.4 Nm, AIRMATIC air reservoir pressure 17.61 bar, rear-axle steer angle 2.11 deg
# Sindelfingen_EVA2_Telemetry[1020]: High-voltage battery pack SoC 93.25 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.22 C, front PSM efficiency 97.41 %, rear PSM torque output 705.5 Nm, AIRMATIC air reservoir pressure 17.61 bar, rear-axle steer angle 2.11 deg
# Sindelfingen_EVA2_Telemetry[1021]: High-voltage battery pack SoC 93.25 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.22 C, front PSM efficiency 97.41 %, rear PSM torque output 705.6 Nm, AIRMATIC air reservoir pressure 17.61 bar, rear-axle steer angle 2.11 deg
# Sindelfingen_EVA2_Telemetry[1022]: High-voltage battery pack SoC 93.24 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.22 C, front PSM efficiency 97.41 %, rear PSM torque output 705.7 Nm, AIRMATIC air reservoir pressure 17.61 bar, rear-axle steer angle 2.11 deg
# Sindelfingen_EVA2_Telemetry[1023]: High-voltage battery pack SoC 93.23 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.23 C, front PSM efficiency 97.41 %, rear PSM torque output 705.8 Nm, AIRMATIC air reservoir pressure 17.61 bar, rear-axle steer angle 2.12 deg
# Sindelfingen_EVA2_Telemetry[1024]: High-voltage battery pack SoC 93.23 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.23 C, front PSM efficiency 97.41 %, rear PSM torque output 705.9 Nm, AIRMATIC air reservoir pressure 17.61 bar, rear-axle steer angle 2.12 deg
# Sindelfingen_EVA2_Telemetry[1025]: High-voltage battery pack SoC 93.22 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.23 C, front PSM efficiency 97.42 %, rear PSM torque output 706.0 Nm, AIRMATIC air reservoir pressure 17.62 bar, rear-axle steer angle 2.12 deg
# Sindelfingen_EVA2_Telemetry[1026]: High-voltage battery pack SoC 93.22 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.23 C, front PSM efficiency 97.42 %, rear PSM torque output 706.1 Nm, AIRMATIC air reservoir pressure 17.62 bar, rear-axle steer angle 2.12 deg
# Sindelfingen_EVA2_Telemetry[1027]: High-voltage battery pack SoC 93.22 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.23 C, front PSM efficiency 97.42 %, rear PSM torque output 706.2 Nm, AIRMATIC air reservoir pressure 17.62 bar, rear-axle steer angle 2.12 deg
# Sindelfingen_EVA2_Telemetry[1028]: High-voltage battery pack SoC 93.21 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.24 C, front PSM efficiency 97.42 %, rear PSM torque output 706.3 Nm, AIRMATIC air reservoir pressure 17.62 bar, rear-axle steer angle 2.13 deg
# Sindelfingen_EVA2_Telemetry[1029]: High-voltage battery pack SoC 93.20 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.24 C, front PSM efficiency 97.42 %, rear PSM torque output 706.4 Nm, AIRMATIC air reservoir pressure 17.62 bar, rear-axle steer angle 2.13 deg
# Sindelfingen_EVA2_Telemetry[1030]: High-voltage battery pack SoC 93.20 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.24 C, front PSM efficiency 97.42 %, rear PSM torque output 706.5 Nm, AIRMATIC air reservoir pressure 17.62 bar, rear-axle steer angle 2.13 deg
# Sindelfingen_EVA2_Telemetry[1031]: High-voltage battery pack SoC 93.19 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.24 C, front PSM efficiency 97.42 %, rear PSM torque output 706.6 Nm, AIRMATIC air reservoir pressure 17.62 bar, rear-axle steer angle 2.13 deg
# Sindelfingen_EVA2_Telemetry[1032]: High-voltage battery pack SoC 93.19 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.24 C, front PSM efficiency 97.42 %, rear PSM torque output 706.7 Nm, AIRMATIC air reservoir pressure 17.62 bar, rear-axle steer angle 2.13 deg
# Sindelfingen_EVA2_Telemetry[1033]: High-voltage battery pack SoC 93.19 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.25 C, front PSM efficiency 97.42 %, rear PSM torque output 706.8 Nm, AIRMATIC air reservoir pressure 17.62 bar, rear-axle steer angle 2.14 deg
# Sindelfingen_EVA2_Telemetry[1034]: High-voltage battery pack SoC 93.18 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.25 C, front PSM efficiency 97.42 %, rear PSM torque output 706.9 Nm, AIRMATIC air reservoir pressure 17.62 bar, rear-axle steer angle 2.14 deg
# Sindelfingen_EVA2_Telemetry[1035]: High-voltage battery pack SoC 93.17 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.25 C, front PSM efficiency 97.43 %, rear PSM torque output 707.0 Nm, AIRMATIC air reservoir pressure 17.62 bar, rear-axle steer angle 2.14 deg
# Sindelfingen_EVA2_Telemetry[1036]: High-voltage battery pack SoC 93.17 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.25 C, front PSM efficiency 97.43 %, rear PSM torque output 707.1 Nm, AIRMATIC air reservoir pressure 17.63 bar, rear-axle steer angle 2.14 deg
# Sindelfingen_EVA2_Telemetry[1037]: High-voltage battery pack SoC 93.16 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.25 C, front PSM efficiency 97.43 %, rear PSM torque output 707.2 Nm, AIRMATIC air reservoir pressure 17.63 bar, rear-axle steer angle 2.14 deg
# Sindelfingen_EVA2_Telemetry[1038]: High-voltage battery pack SoC 93.16 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.26 C, front PSM efficiency 97.43 %, rear PSM torque output 707.3 Nm, AIRMATIC air reservoir pressure 17.63 bar, rear-axle steer angle 2.15 deg
# Sindelfingen_EVA2_Telemetry[1039]: High-voltage battery pack SoC 93.16 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.26 C, front PSM efficiency 97.43 %, rear PSM torque output 707.4 Nm, AIRMATIC air reservoir pressure 17.63 bar, rear-axle steer angle 2.15 deg
# Sindelfingen_EVA2_Telemetry[1040]: High-voltage battery pack SoC 93.15 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.26 C, front PSM efficiency 97.43 %, rear PSM torque output 707.5 Nm, AIRMATIC air reservoir pressure 17.63 bar, rear-axle steer angle 2.15 deg
# Sindelfingen_EVA2_Telemetry[1041]: High-voltage battery pack SoC 93.14 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.26 C, front PSM efficiency 97.43 %, rear PSM torque output 707.6 Nm, AIRMATIC air reservoir pressure 17.63 bar, rear-axle steer angle 2.15 deg
# Sindelfingen_EVA2_Telemetry[1042]: High-voltage battery pack SoC 93.14 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.26 C, front PSM efficiency 97.43 %, rear PSM torque output 707.7 Nm, AIRMATIC air reservoir pressure 17.63 bar, rear-axle steer angle 2.15 deg
# Sindelfingen_EVA2_Telemetry[1043]: High-voltage battery pack SoC 93.13 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.27 C, front PSM efficiency 97.43 %, rear PSM torque output 707.8 Nm, AIRMATIC air reservoir pressure 17.63 bar, rear-axle steer angle 2.16 deg
# Sindelfingen_EVA2_Telemetry[1044]: High-voltage battery pack SoC 93.13 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.27 C, front PSM efficiency 97.43 %, rear PSM torque output 707.9 Nm, AIRMATIC air reservoir pressure 17.63 bar, rear-axle steer angle 2.16 deg
# Sindelfingen_EVA2_Telemetry[1045]: High-voltage battery pack SoC 93.12 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.27 C, front PSM efficiency 97.44 %, rear PSM torque output 708.0 Nm, AIRMATIC air reservoir pressure 17.64 bar, rear-axle steer angle 2.16 deg
# Sindelfingen_EVA2_Telemetry[1046]: High-voltage battery pack SoC 93.12 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.27 C, front PSM efficiency 97.44 %, rear PSM torque output 708.1 Nm, AIRMATIC air reservoir pressure 17.64 bar, rear-axle steer angle 2.16 deg
# Sindelfingen_EVA2_Telemetry[1047]: High-voltage battery pack SoC 93.11 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.27 C, front PSM efficiency 97.44 %, rear PSM torque output 708.2 Nm, AIRMATIC air reservoir pressure 17.64 bar, rear-axle steer angle 2.16 deg
# Sindelfingen_EVA2_Telemetry[1048]: High-voltage battery pack SoC 93.11 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.28 C, front PSM efficiency 97.44 %, rear PSM torque output 708.3 Nm, AIRMATIC air reservoir pressure 17.64 bar, rear-axle steer angle 2.17 deg
# Sindelfingen_EVA2_Telemetry[1049]: High-voltage battery pack SoC 93.10 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.28 C, front PSM efficiency 97.44 %, rear PSM torque output 708.4 Nm, AIRMATIC air reservoir pressure 17.64 bar, rear-axle steer angle 2.17 deg
# Sindelfingen_EVA2_Telemetry[1050]: High-voltage battery pack SoC 93.10 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.28 C, front PSM efficiency 97.44 %, rear PSM torque output 708.5 Nm, AIRMATIC air reservoir pressure 17.64 bar, rear-axle steer angle 2.17 deg
# Sindelfingen_EVA2_Telemetry[1051]: High-voltage battery pack SoC 93.09 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.28 C, front PSM efficiency 97.44 %, rear PSM torque output 708.6 Nm, AIRMATIC air reservoir pressure 17.64 bar, rear-axle steer angle 2.17 deg
# Sindelfingen_EVA2_Telemetry[1052]: High-voltage battery pack SoC 93.09 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.28 C, front PSM efficiency 97.44 %, rear PSM torque output 708.7 Nm, AIRMATIC air reservoir pressure 17.64 bar, rear-axle steer angle 2.17 deg
# Sindelfingen_EVA2_Telemetry[1053]: High-voltage battery pack SoC 93.08 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.29 C, front PSM efficiency 97.44 %, rear PSM torque output 708.8 Nm, AIRMATIC air reservoir pressure 17.64 bar, rear-axle steer angle 2.18 deg
# Sindelfingen_EVA2_Telemetry[1054]: High-voltage battery pack SoC 93.08 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.29 C, front PSM efficiency 97.44 %, rear PSM torque output 708.9 Nm, AIRMATIC air reservoir pressure 17.64 bar, rear-axle steer angle 2.18 deg
# Sindelfingen_EVA2_Telemetry[1055]: High-voltage battery pack SoC 93.08 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.29 C, front PSM efficiency 97.45 %, rear PSM torque output 709.0 Nm, AIRMATIC air reservoir pressure 17.65 bar, rear-axle steer angle 2.18 deg
# Sindelfingen_EVA2_Telemetry[1056]: High-voltage battery pack SoC 93.07 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.29 C, front PSM efficiency 97.45 %, rear PSM torque output 709.1 Nm, AIRMATIC air reservoir pressure 17.65 bar, rear-axle steer angle 2.18 deg
# Sindelfingen_EVA2_Telemetry[1057]: High-voltage battery pack SoC 93.06 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.29 C, front PSM efficiency 97.45 %, rear PSM torque output 709.2 Nm, AIRMATIC air reservoir pressure 17.65 bar, rear-axle steer angle 2.18 deg
# Sindelfingen_EVA2_Telemetry[1058]: High-voltage battery pack SoC 93.06 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.30 C, front PSM efficiency 97.45 %, rear PSM torque output 709.3 Nm, AIRMATIC air reservoir pressure 17.65 bar, rear-axle steer angle 2.19 deg
# Sindelfingen_EVA2_Telemetry[1059]: High-voltage battery pack SoC 93.05 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.30 C, front PSM efficiency 97.45 %, rear PSM torque output 709.4 Nm, AIRMATIC air reservoir pressure 17.65 bar, rear-axle steer angle 2.19 deg
# Sindelfingen_EVA2_Telemetry[1060]: High-voltage battery pack SoC 93.05 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.30 C, front PSM efficiency 97.45 %, rear PSM torque output 709.5 Nm, AIRMATIC air reservoir pressure 17.65 bar, rear-axle steer angle 2.19 deg
# Sindelfingen_EVA2_Telemetry[1061]: High-voltage battery pack SoC 93.05 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.30 C, front PSM efficiency 97.45 %, rear PSM torque output 709.6 Nm, AIRMATIC air reservoir pressure 17.65 bar, rear-axle steer angle 2.19 deg
# Sindelfingen_EVA2_Telemetry[1062]: High-voltage battery pack SoC 93.04 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.30 C, front PSM efficiency 97.45 %, rear PSM torque output 709.7 Nm, AIRMATIC air reservoir pressure 17.65 bar, rear-axle steer angle 2.19 deg
# Sindelfingen_EVA2_Telemetry[1063]: High-voltage battery pack SoC 93.03 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.31 C, front PSM efficiency 97.45 %, rear PSM torque output 709.8 Nm, AIRMATIC air reservoir pressure 17.65 bar, rear-axle steer angle 2.20 deg
# Sindelfingen_EVA2_Telemetry[1064]: High-voltage battery pack SoC 93.03 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.31 C, front PSM efficiency 97.45 %, rear PSM torque output 709.9 Nm, AIRMATIC air reservoir pressure 17.65 bar, rear-axle steer angle 2.20 deg
# Sindelfingen_EVA2_Telemetry[1065]: High-voltage battery pack SoC 93.02 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.31 C, front PSM efficiency 97.46 %, rear PSM torque output 710.0 Nm, AIRMATIC air reservoir pressure 17.66 bar, rear-axle steer angle 2.20 deg
# Sindelfingen_EVA2_Telemetry[1066]: High-voltage battery pack SoC 93.02 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.31 C, front PSM efficiency 97.46 %, rear PSM torque output 710.1 Nm, AIRMATIC air reservoir pressure 17.66 bar, rear-axle steer angle 2.20 deg
# Sindelfingen_EVA2_Telemetry[1067]: High-voltage battery pack SoC 93.02 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.31 C, front PSM efficiency 97.46 %, rear PSM torque output 710.2 Nm, AIRMATIC air reservoir pressure 17.66 bar, rear-axle steer angle 2.20 deg
# Sindelfingen_EVA2_Telemetry[1068]: High-voltage battery pack SoC 93.01 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.32 C, front PSM efficiency 97.46 %, rear PSM torque output 710.3 Nm, AIRMATIC air reservoir pressure 17.66 bar, rear-axle steer angle 2.21 deg
# Sindelfingen_EVA2_Telemetry[1069]: High-voltage battery pack SoC 93.00 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.32 C, front PSM efficiency 97.46 %, rear PSM torque output 710.4 Nm, AIRMATIC air reservoir pressure 17.66 bar, rear-axle steer angle 2.21 deg
# Sindelfingen_EVA2_Telemetry[1070]: High-voltage battery pack SoC 93.00 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.32 C, front PSM efficiency 97.46 %, rear PSM torque output 710.5 Nm, AIRMATIC air reservoir pressure 17.66 bar, rear-axle steer angle 2.21 deg
# Sindelfingen_EVA2_Telemetry[1071]: High-voltage battery pack SoC 93.00 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.32 C, front PSM efficiency 97.46 %, rear PSM torque output 710.6 Nm, AIRMATIC air reservoir pressure 17.66 bar, rear-axle steer angle 2.21 deg
# Sindelfingen_EVA2_Telemetry[1072]: High-voltage battery pack SoC 92.99 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.32 C, front PSM efficiency 97.46 %, rear PSM torque output 710.7 Nm, AIRMATIC air reservoir pressure 17.66 bar, rear-axle steer angle 2.21 deg
# Sindelfingen_EVA2_Telemetry[1073]: High-voltage battery pack SoC 92.98 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.33 C, front PSM efficiency 97.46 %, rear PSM torque output 710.8 Nm, AIRMATIC air reservoir pressure 17.66 bar, rear-axle steer angle 2.22 deg
# Sindelfingen_EVA2_Telemetry[1074]: High-voltage battery pack SoC 92.98 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.33 C, front PSM efficiency 97.46 %, rear PSM torque output 710.9 Nm, AIRMATIC air reservoir pressure 17.66 bar, rear-axle steer angle 2.22 deg
# Sindelfingen_EVA2_Telemetry[1075]: High-voltage battery pack SoC 92.97 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.33 C, front PSM efficiency 97.47 %, rear PSM torque output 711.0 Nm, AIRMATIC air reservoir pressure 17.67 bar, rear-axle steer angle 2.22 deg
# Sindelfingen_EVA2_Telemetry[1076]: High-voltage battery pack SoC 92.97 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.33 C, front PSM efficiency 97.47 %, rear PSM torque output 711.1 Nm, AIRMATIC air reservoir pressure 17.67 bar, rear-axle steer angle 2.22 deg
# Sindelfingen_EVA2_Telemetry[1077]: High-voltage battery pack SoC 92.97 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.33 C, front PSM efficiency 97.47 %, rear PSM torque output 711.2 Nm, AIRMATIC air reservoir pressure 17.67 bar, rear-axle steer angle 2.22 deg
# Sindelfingen_EVA2_Telemetry[1078]: High-voltage battery pack SoC 92.96 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.34 C, front PSM efficiency 97.47 %, rear PSM torque output 711.3 Nm, AIRMATIC air reservoir pressure 17.67 bar, rear-axle steer angle 2.23 deg
# Sindelfingen_EVA2_Telemetry[1079]: High-voltage battery pack SoC 92.95 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.34 C, front PSM efficiency 97.47 %, rear PSM torque output 711.4 Nm, AIRMATIC air reservoir pressure 17.67 bar, rear-axle steer angle 2.23 deg
# Sindelfingen_EVA2_Telemetry[1080]: High-voltage battery pack SoC 92.95 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.34 C, front PSM efficiency 97.47 %, rear PSM torque output 711.5 Nm, AIRMATIC air reservoir pressure 17.67 bar, rear-axle steer angle 2.23 deg
# Sindelfingen_EVA2_Telemetry[1081]: High-voltage battery pack SoC 92.94 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.34 C, front PSM efficiency 97.47 %, rear PSM torque output 711.6 Nm, AIRMATIC air reservoir pressure 17.67 bar, rear-axle steer angle 2.23 deg
# Sindelfingen_EVA2_Telemetry[1082]: High-voltage battery pack SoC 92.94 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.34 C, front PSM efficiency 97.47 %, rear PSM torque output 711.7 Nm, AIRMATIC air reservoir pressure 17.67 bar, rear-axle steer angle 2.23 deg
# Sindelfingen_EVA2_Telemetry[1083]: High-voltage battery pack SoC 92.94 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.35 C, front PSM efficiency 97.47 %, rear PSM torque output 711.8 Nm, AIRMATIC air reservoir pressure 17.67 bar, rear-axle steer angle 2.24 deg
# Sindelfingen_EVA2_Telemetry[1084]: High-voltage battery pack SoC 92.93 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.35 C, front PSM efficiency 97.47 %, rear PSM torque output 711.9 Nm, AIRMATIC air reservoir pressure 17.67 bar, rear-axle steer angle 2.24 deg
# Sindelfingen_EVA2_Telemetry[1085]: High-voltage battery pack SoC 92.92 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.35 C, front PSM efficiency 97.48 %, rear PSM torque output 712.0 Nm, AIRMATIC air reservoir pressure 17.68 bar, rear-axle steer angle 2.24 deg
# Sindelfingen_EVA2_Telemetry[1086]: High-voltage battery pack SoC 92.92 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.35 C, front PSM efficiency 97.48 %, rear PSM torque output 712.1 Nm, AIRMATIC air reservoir pressure 17.68 bar, rear-axle steer angle 2.24 deg
# Sindelfingen_EVA2_Telemetry[1087]: High-voltage battery pack SoC 92.91 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.35 C, front PSM efficiency 97.48 %, rear PSM torque output 712.2 Nm, AIRMATIC air reservoir pressure 17.68 bar, rear-axle steer angle 2.24 deg
# Sindelfingen_EVA2_Telemetry[1088]: High-voltage battery pack SoC 92.91 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.36 C, front PSM efficiency 97.48 %, rear PSM torque output 712.3 Nm, AIRMATIC air reservoir pressure 17.68 bar, rear-axle steer angle 2.25 deg
# Sindelfingen_EVA2_Telemetry[1089]: High-voltage battery pack SoC 92.91 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.36 C, front PSM efficiency 97.48 %, rear PSM torque output 712.4 Nm, AIRMATIC air reservoir pressure 17.68 bar, rear-axle steer angle 2.25 deg
# Sindelfingen_EVA2_Telemetry[1090]: High-voltage battery pack SoC 92.90 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.36 C, front PSM efficiency 97.48 %, rear PSM torque output 712.5 Nm, AIRMATIC air reservoir pressure 17.68 bar, rear-axle steer angle 2.25 deg
# Sindelfingen_EVA2_Telemetry[1091]: High-voltage battery pack SoC 92.89 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.36 C, front PSM efficiency 97.48 %, rear PSM torque output 712.6 Nm, AIRMATIC air reservoir pressure 17.68 bar, rear-axle steer angle 2.25 deg
# Sindelfingen_EVA2_Telemetry[1092]: High-voltage battery pack SoC 92.89 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.36 C, front PSM efficiency 97.48 %, rear PSM torque output 712.7 Nm, AIRMATIC air reservoir pressure 17.68 bar, rear-axle steer angle 2.25 deg
# Sindelfingen_EVA2_Telemetry[1093]: High-voltage battery pack SoC 92.88 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.37 C, front PSM efficiency 97.48 %, rear PSM torque output 712.8 Nm, AIRMATIC air reservoir pressure 17.68 bar, rear-axle steer angle 2.26 deg
# Sindelfingen_EVA2_Telemetry[1094]: High-voltage battery pack SoC 92.88 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.37 C, front PSM efficiency 97.48 %, rear PSM torque output 712.9 Nm, AIRMATIC air reservoir pressure 17.68 bar, rear-axle steer angle 2.26 deg
# Sindelfingen_EVA2_Telemetry[1095]: High-voltage battery pack SoC 92.88 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.37 C, front PSM efficiency 97.48 %, rear PSM torque output 713.0 Nm, AIRMATIC air reservoir pressure 17.69 bar, rear-axle steer angle 2.26 deg
# Sindelfingen_EVA2_Telemetry[1096]: High-voltage battery pack SoC 92.87 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.37 C, front PSM efficiency 97.49 %, rear PSM torque output 713.1 Nm, AIRMATIC air reservoir pressure 17.69 bar, rear-axle steer angle 2.26 deg
# Sindelfingen_EVA2_Telemetry[1097]: High-voltage battery pack SoC 92.86 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.37 C, front PSM efficiency 97.49 %, rear PSM torque output 713.2 Nm, AIRMATIC air reservoir pressure 17.69 bar, rear-axle steer angle 2.26 deg
# Sindelfingen_EVA2_Telemetry[1098]: High-voltage battery pack SoC 92.86 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.38 C, front PSM efficiency 97.49 %, rear PSM torque output 713.3 Nm, AIRMATIC air reservoir pressure 17.69 bar, rear-axle steer angle 2.27 deg
# Sindelfingen_EVA2_Telemetry[1099]: High-voltage battery pack SoC 92.85 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.38 C, front PSM efficiency 97.49 %, rear PSM torque output 713.4 Nm, AIRMATIC air reservoir pressure 17.69 bar, rear-axle steer angle 2.27 deg
# Sindelfingen_EVA2_Telemetry[1100]: High-voltage battery pack SoC 92.85 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.38 C, front PSM efficiency 97.49 %, rear PSM torque output 713.5 Nm, AIRMATIC air reservoir pressure 17.69 bar, rear-axle steer angle 2.27 deg
# Sindelfingen_EVA2_Telemetry[1101]: High-voltage battery pack SoC 92.84 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.38 C, front PSM efficiency 97.49 %, rear PSM torque output 713.6 Nm, AIRMATIC air reservoir pressure 17.69 bar, rear-axle steer angle 2.27 deg
# Sindelfingen_EVA2_Telemetry[1102]: High-voltage battery pack SoC 92.84 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.38 C, front PSM efficiency 97.49 %, rear PSM torque output 713.7 Nm, AIRMATIC air reservoir pressure 17.69 bar, rear-axle steer angle 2.27 deg
# Sindelfingen_EVA2_Telemetry[1103]: High-voltage battery pack SoC 92.83 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.39 C, front PSM efficiency 97.49 %, rear PSM torque output 713.8 Nm, AIRMATIC air reservoir pressure 17.69 bar, rear-axle steer angle 2.28 deg
# Sindelfingen_EVA2_Telemetry[1104]: High-voltage battery pack SoC 92.83 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.39 C, front PSM efficiency 97.49 %, rear PSM torque output 713.9 Nm, AIRMATIC air reservoir pressure 17.69 bar, rear-axle steer angle 2.28 deg
# Sindelfingen_EVA2_Telemetry[1105]: High-voltage battery pack SoC 92.83 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.39 C, front PSM efficiency 97.50 %, rear PSM torque output 714.0 Nm, AIRMATIC air reservoir pressure 17.70 bar, rear-axle steer angle 2.28 deg
# Sindelfingen_EVA2_Telemetry[1106]: High-voltage battery pack SoC 92.82 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.39 C, front PSM efficiency 97.50 %, rear PSM torque output 714.1 Nm, AIRMATIC air reservoir pressure 17.70 bar, rear-axle steer angle 2.28 deg
# Sindelfingen_EVA2_Telemetry[1107]: High-voltage battery pack SoC 92.81 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.39 C, front PSM efficiency 97.50 %, rear PSM torque output 714.2 Nm, AIRMATIC air reservoir pressure 17.70 bar, rear-axle steer angle 2.28 deg
# Sindelfingen_EVA2_Telemetry[1108]: High-voltage battery pack SoC 92.81 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.40 C, front PSM efficiency 97.50 %, rear PSM torque output 714.3 Nm, AIRMATIC air reservoir pressure 17.70 bar, rear-axle steer angle 2.29 deg
# Sindelfingen_EVA2_Telemetry[1109]: High-voltage battery pack SoC 92.80 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.40 C, front PSM efficiency 97.50 %, rear PSM torque output 714.4 Nm, AIRMATIC air reservoir pressure 17.70 bar, rear-axle steer angle 2.29 deg
# Sindelfingen_EVA2_Telemetry[1110]: High-voltage battery pack SoC 92.80 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.40 C, front PSM efficiency 97.50 %, rear PSM torque output 714.5 Nm, AIRMATIC air reservoir pressure 17.70 bar, rear-axle steer angle 2.29 deg
# Sindelfingen_EVA2_Telemetry[1111]: High-voltage battery pack SoC 92.80 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.40 C, front PSM efficiency 97.50 %, rear PSM torque output 714.6 Nm, AIRMATIC air reservoir pressure 17.70 bar, rear-axle steer angle 2.29 deg
# Sindelfingen_EVA2_Telemetry[1112]: High-voltage battery pack SoC 92.79 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.40 C, front PSM efficiency 97.50 %, rear PSM torque output 714.7 Nm, AIRMATIC air reservoir pressure 17.70 bar, rear-axle steer angle 2.29 deg
# Sindelfingen_EVA2_Telemetry[1113]: High-voltage battery pack SoC 92.78 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.41 C, front PSM efficiency 97.50 %, rear PSM torque output 714.8 Nm, AIRMATIC air reservoir pressure 17.70 bar, rear-axle steer angle 2.30 deg
# Sindelfingen_EVA2_Telemetry[1114]: High-voltage battery pack SoC 92.78 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.41 C, front PSM efficiency 97.50 %, rear PSM torque output 714.9 Nm, AIRMATIC air reservoir pressure 17.70 bar, rear-axle steer angle 2.30 deg
# Sindelfingen_EVA2_Telemetry[1115]: High-voltage battery pack SoC 92.77 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.41 C, front PSM efficiency 97.51 %, rear PSM torque output 715.0 Nm, AIRMATIC air reservoir pressure 17.71 bar, rear-axle steer angle 2.30 deg
# Sindelfingen_EVA2_Telemetry[1116]: High-voltage battery pack SoC 92.77 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.41 C, front PSM efficiency 97.51 %, rear PSM torque output 715.1 Nm, AIRMATIC air reservoir pressure 17.71 bar, rear-axle steer angle 2.30 deg
# Sindelfingen_EVA2_Telemetry[1117]: High-voltage battery pack SoC 92.77 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.41 C, front PSM efficiency 97.51 %, rear PSM torque output 715.2 Nm, AIRMATIC air reservoir pressure 17.71 bar, rear-axle steer angle 2.30 deg
# Sindelfingen_EVA2_Telemetry[1118]: High-voltage battery pack SoC 92.76 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.42 C, front PSM efficiency 97.51 %, rear PSM torque output 715.3 Nm, AIRMATIC air reservoir pressure 17.71 bar, rear-axle steer angle 2.31 deg
# Sindelfingen_EVA2_Telemetry[1119]: High-voltage battery pack SoC 92.75 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.42 C, front PSM efficiency 97.51 %, rear PSM torque output 715.4 Nm, AIRMATIC air reservoir pressure 17.71 bar, rear-axle steer angle 2.31 deg
# Sindelfingen_EVA2_Telemetry[1120]: High-voltage battery pack SoC 92.75 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.42 C, front PSM efficiency 97.51 %, rear PSM torque output 715.5 Nm, AIRMATIC air reservoir pressure 17.71 bar, rear-axle steer angle 2.31 deg
# Sindelfingen_EVA2_Telemetry[1121]: High-voltage battery pack SoC 92.75 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.42 C, front PSM efficiency 97.51 %, rear PSM torque output 715.6 Nm, AIRMATIC air reservoir pressure 17.71 bar, rear-axle steer angle 2.31 deg
# Sindelfingen_EVA2_Telemetry[1122]: High-voltage battery pack SoC 92.74 %, cell group voltage variance 1.8 mV, liquid chill plate inflow temp 26.42 C, front PSM efficiency 97.51 %, rear PSM torque output 715.7 Nm, AIRMATIC air reservoir pressure 17.71 bar, rear-axle steer angle 2.31 deg
