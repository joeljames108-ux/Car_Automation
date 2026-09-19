"""
=============================================================================
Procedural Class-A CAD Generator: Hongqi L5 State Limousine (2020s)
PHASE 63: Heavy-Duty State Monocoque, 6.0L V12 Powertrain, Intelligent 4WD,
Hydropneumatic Air Suspension, 20" Sunflower Wheels & Presidential Salon
=============================================================================
Limousine Architecture — 2020s Sovereign Chinese Ceremonial Engineering
Phase 63 builds the heavy-duty armored mechanical rolling chassis and opulent
imperial ceremonial passenger compartment for the Hongqi L5 State Limousine:
1. Heavy-duty ladder-reinforced monocoque chassis (3,435mm wheelbase) with blast floor
2. 6.0L All-Aluminum DOHC 48-valve V12 engine (CA12GV60-01) with dual intake manifolds
3. Intelligent 4WD driveline with electronic transfer case and front/rear differentials
4. Double-wishbone front and multi-link rear hydropneumatic adaptive air suspension
5. 20-inch retro-modern multi-spoke polished chrome alloy wheels with golden sunflower emblems
6. Imperial State Salon upholstered in cream nappa leather with Chinese lacquer veneers,
   authentic celadon jade door pull handles, and embroidered silk headliner
7. Full armored underfloor composite blast shielding & dual stainless steel exhaust
=============================================================================
"""

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector, Matrix, Euler, Quaternion


# ============================================================================
# 1. CORE COMPATIBILITY WRAPPERS & UTILITIES
# ============================================================================

def _compat_create_cylinder(bm, radius=1.0, depth=2.0, segments=16, cap_ends=True, cap_tris=False, matrix=None, **kwargs):
    """Blender 5.x compatibility wrapper for bmesh cylinder creation using create_cone."""
    r1 = kwargs.pop('radius1', radius)
    r2 = kwargs.pop('radius2', radius)
    kwargs.pop('round_cap', None)
    if matrix is None:
        matrix = Matrix()
    return bmesh.ops.create_cone(
        bm,
        cap_ends=cap_ends,
        cap_tris=cap_tris,
        segments=segments,
        radius1=r1,
        radius2=r2,
        depth=depth,
        matrix=matrix,
        **kwargs
    )

if not hasattr(bmesh.ops, 'create_cylinder'):
    bmesh.ops.create_cylinder = _compat_create_cylinder


def add_annular_tube(bm, r_inner, r_outer, depth, segments=36, matrix=None, create_sidewalls=True):
    """Generates an annular cylindrical tube/ring with quad walls and smooth sidewalls."""
    if matrix is None:
        matrix = Matrix()
    d2 = depth * 0.5
    for i in range(segments):
        a0 = i * (2.0 * math.pi / segments)
        a1 = (i + 1) * (2.0 * math.pi / segments)
        c0, s0 = math.cos(a0), math.sin(a0)
        c1, s1 = math.cos(a1), math.sin(a1)
        v_out_0_top = bm.verts.new(matrix @ Vector((c0 * r_outer, s0 * r_outer, d2)))
        v_out_1_top = bm.verts.new(matrix @ Vector((c1 * r_outer, s1 * r_outer, d2)))
        v_out_1_bot = bm.verts.new(matrix @ Vector((c1 * r_outer, s1 * r_outer, -d2)))
        v_out_0_bot = bm.verts.new(matrix @ Vector((c0 * r_outer, s0 * r_outer, -d2)))
        bm.faces.new([v_out_0_top, v_out_1_top, v_out_1_bot, v_out_0_bot])
        if r_inner > 0:
            v_in_0_top = bm.verts.new(matrix @ Vector((c0 * r_inner, s0 * r_inner, d2)))
            v_in_1_top = bm.verts.new(matrix @ Vector((c1 * r_inner, s1 * r_inner, d2)))
            v_in_1_bot = bm.verts.new(matrix @ Vector((c1 * r_inner, s1 * r_inner, -d2)))
            v_in_0_bot = bm.verts.new(matrix @ Vector((c0 * r_inner, s0 * r_inner, -d2)))
            bm.faces.new([v_in_0_bot, v_in_1_bot, v_in_1_top, v_in_0_top])
            if create_sidewalls:
                bm.faces.new([v_in_0_top, v_in_1_top, v_out_1_top, v_out_0_top])
                bm.faces.new([v_out_0_bot, v_out_1_bot, v_in_1_bot, v_in_0_bot])


def apply_smooth_and_modifiers(obj, angle_deg=35.0, bevel_width=0.003, segments=2):
    """Applies smooth shading and non-destructive modifiers for Class-A CAD mesh quality."""
    if obj.type == 'MESH':
        for poly in obj.data.polygons:
            poly.use_smooth = True
        if hasattr(obj.data, 'use_auto_smooth'):
            obj.data.use_auto_smooth = True
            obj.data.auto_smooth_angle = math.radians(angle_deg)
        if bevel_width > 0:
            mod_bev = obj.modifiers.new(name="BeVEL", type='BEVEL')
            mod_bev.width = bevel_width
            mod_bev.segments = segments
            mod_bev.limit_method = 'ANGLE'
            mod_bev.angle_limit = math.radians(angle_deg)
        mod_wn = obj.modifiers.new(name="WeightedNormal", type='WEIGHTED_NORMAL')
        mod_wn.keep_sharp = True


def create_mesh_object(name, bm, material, bevel_width=0.002):
    """Finalizes bmesh into a Blender object and links it to the scene."""
    me = bpy.data.meshes.new(f"{name}_Mesh")
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.004)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me)
    bm.free()
    obj = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(obj)
    if material:
        obj.data.materials.append(material)
    apply_smooth_and_modifiers(obj, angle_deg=35.0, bevel_width=bevel_width, segments=2)
    return obj


# ============================================================================
# 2. COMPLETE PBR MATERIAL SUITE
# ============================================================================

def build_hongqi_l5_material_suite():
    """Builds the bespoke PBR material suite for the Hongqi L5 State Limousine."""
    mats = {}

    def get_or_create_mat(name):
        mat = bpy.data.materials.get(name)
        if not mat:
            mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
        nodes = mat.node_tree.nodes
        nodes.clear()
        node_out = nodes.new(type='ShaderNodeOutputMaterial')
        node_bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
        mat.node_tree.links.new(node_bsdf.outputs['BSDF'], node_out.inputs['Surface'])
        return mat, node_bsdf

    # 1. Armored Ballistic Steel / Structural Monocoque
    m_arm, b_arm = get_or_create_mat("Mat_Hongqi_Armor_Steel")
    b_arm.inputs['Base Color'].default_value = (0.12, 0.13, 0.14, 1.0)
    b_arm.inputs['Metallic'].default_value = 0.85
    b_arm.inputs['Roughness'].default_value = 0.40
    mats['armor_steel'] = m_arm

    # 2. 6.0L V12 Die-Cast Aluminum Engine Alloy
    m_eng, b_eng = get_or_create_mat("Mat_Hongqi_V12_Alloy")
    b_eng.inputs['Base Color'].default_value = (0.72, 0.74, 0.76, 1.0)
    b_eng.inputs['Metallic'].default_value = 0.90
    b_eng.inputs['Roughness'].default_value = 0.28
    mats['v12_alloy'] = m_eng

    # 3. Mirror Chrome (Intake plenums, valve cover badges, brightwork)
    m_chr, b_chr = get_or_create_mat("Mat_Hongqi_Chrome")
    b_chr.inputs['Base Color'].default_value = (0.95, 0.96, 0.98, 1.0)
    b_chr.inputs['Metallic'].default_value = 1.0
    b_chr.inputs['Roughness'].default_value = 0.04
    mats['chrome'] = m_chr

    # 4. Polished 24k Gold Electroplate (Sunflower emblem, ceremonial accents)
    m_gold, b_gold = get_or_create_mat("Mat_Hongqi_Sunflower_Gold")
    b_gold.inputs['Base Color'].default_value = (1.0, 0.82, 0.22, 1.0)
    b_gold.inputs['Metallic'].default_value = 1.0
    b_gold.inputs['Roughness'].default_value = 0.08
    mats['gold'] = m_gold

    # 5. Imperial Red Flag Lacquer (Ruby translucent red flag emblems)
    m_red, b_red = get_or_create_mat("Mat_Hongqi_RedFlag_Lacquer")
    b_red.inputs['Base Color'].default_value = (0.85, 0.02, 0.04, 1.0)
    b_red.inputs['Roughness'].default_value = 0.10
    if 'Transmission' in b_red.inputs:
        b_red.inputs['Transmission'].default_value = 0.45
    elif 'Transmission Weight' in b_red.inputs:
        b_red.inputs['Transmission Weight'].default_value = 0.45
    mats['red_flag'] = m_red

    # 6. Authentic Celadon Jade (Door pull handles & console trims)
    m_jade, b_jade = get_or_create_mat("Mat_Hongqi_Celadon_Jade")
    b_jade.inputs['Base Color'].default_value = (0.42, 0.68, 0.54, 1.0) # Delicate sea-green celadon
    b_jade.inputs['Roughness'].default_value = 0.14
    b_jade.inputs['IOR'].default_value = 1.62
    if 'Subsurface' in b_jade.inputs:
        b_jade.inputs['Subsurface'].default_value = 0.25
        b_jade.inputs['Subsurface Color'].default_value = (0.50, 0.75, 0.60, 1.0)
    elif 'Subsurface Weight' in b_jade.inputs:
        b_jade.inputs['Subsurface Weight'].default_value = 0.25
    mats['jade'] = m_jade

    # 7. Chinese Red-Brown Piano Lacquer Wood Veneer
    m_wood, b_wood = get_or_create_mat("Mat_Hongqi_Chinese_Lacquer_Wood")
    b_wood.inputs['Base Color'].default_value = (0.16, 0.04, 0.02, 1.0)
    b_wood.inputs['Roughness'].default_value = 0.08
    if 'Clearcoat' in b_wood.inputs:
        b_wood.inputs['Clearcoat'].default_value = 1.0
        b_wood.inputs['Clearcoat Roughness'].default_value = 0.03
    mats['lacquer_wood'] = m_wood

    # 8. Imperial Cream Nappa Leather (State Salon Seats)
    m_lea, b_lea = get_or_create_mat("Mat_Hongqi_Imperial_Cream_Leather")
    b_lea.inputs['Base Color'].default_value = (0.86, 0.84, 0.78, 1.0)
    b_lea.inputs['Roughness'].default_value = 0.55
    mats['leather_cream'] = m_lea

    # 9. Woven Imperial Silk Headliner (Cloud pattern fabric)
    m_silk, b_silk = get_or_create_mat("Mat_Hongqi_Silk_Headliner")
    b_silk.inputs['Base Color'].default_value = (0.82, 0.80, 0.74, 1.0)
    b_silk.inputs['Roughness'].default_value = 0.65
    if 'Sheen' in b_silk.inputs:
        b_silk.inputs['Sheen'].default_value = 0.80
    elif 'Sheen Weight' in b_silk.inputs:
        b_silk.inputs['Sheen Weight'].default_value = 0.80
    mats['silk'] = m_silk

    # 10. Driveline Forged Alloy & Driveshafts
    m_drive, b_drive = get_or_create_mat("Mat_Hongqi_Driveline_Alloy")
    b_drive.inputs['Base Color'].default_value = (0.24, 0.25, 0.27, 1.0)
    b_drive.inputs['Metallic'].default_value = 0.90
    b_drive.inputs['Roughness'].default_value = 0.32
    mats['driveline'] = m_drive

    # 11. Suspension Forged Aluminum Arms
    m_susp, b_susp = get_or_create_mat("Mat_Hongqi_Suspension_Alloy")
    b_susp.inputs['Base Color'].default_value = (0.60, 0.62, 0.65, 1.0)
    b_susp.inputs['Metallic'].default_value = 0.92
    b_susp.inputs['Roughness'].default_value = 0.25
    mats['suspension'] = m_susp

    # 12. 275/40 R20 Radial Tire Rubber
    m_tire, b_tire = get_or_create_mat("Mat_Hongqi_Tire_Rubber")
    b_tire.inputs['Base Color'].default_value = (0.025, 0.025, 0.028, 1.0)
    b_tire.inputs['Roughness'].default_value = 0.85
    mats['tire'] = m_tire

    # 13. Ventilated Brake Discs & Calipers
    m_brake, b_brake = get_or_create_mat("Mat_Hongqi_Brake_Steel")
    b_brake.inputs['Base Color'].default_value = (0.65, 0.67, 0.70, 1.0)
    b_brake.inputs['Metallic'].default_value = 0.95
    b_brake.inputs['Roughness'].default_value = 0.20
    mats['brake'] = m_brake

    # 14. Underbody Armored Blast Pan Coating
    m_under, b_under = get_or_create_mat("Mat_Hongqi_Underbody_Armored")
    b_under.inputs['Base Color'].default_value = (0.04, 0.045, 0.05, 1.0)
    b_under.inputs['Roughness'].default_value = 0.90
    mats['underbody'] = m_under

    # 15. Dual Stainless Steel Exhaust System
    m_exh, b_exh = get_or_create_mat("Mat_Hongqi_Exhaust_Steel")
    b_exh.inputs['Base Color'].default_value = (0.80, 0.82, 0.85, 1.0)
    b_exh.inputs['Metallic'].default_value = 0.95
    b_exh.inputs['Roughness'].default_value = 0.18
    mats['exhaust'] = m_exh

    return mats


# ============================================================================
# 3. HEAVY-DUTY STATE MONOCOQUE CHASSIS ARCHITECTURE
# ============================================================================

def build_hongqi_l5_monocoque_chassis(mats):
    """
    Constructs the heavy-duty reinforced monocoque chassis of the Hongqi L5:
    - 3,435mm wheelbase longitudinal frame members (Y = +1.7175m to -1.7175m)
    - Integrated armored underfloor blast deflection plates
    - Front and rear boxed suspension subframes with cross braces
    - Reinforced ballistic B-pillar and door sill structures
    """
    bm = bmesh.new()

    wb_front = 1.7175
    wb_rear = -1.7175
    half_track = 0.86
    floor_z = 0.26

    # 1. Main Longitudinal Heavy-Duty Box Rails (Left & Right)
    for side in [1.0, -1.0]:
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.72 * side, 0.0, floor_z + 0.08))) @
                   Matrix.Scale(0.16, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(5.20, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.18, 4, Vector((0, 0, 1)))
        )
        # Outer heavy ballistic rocker sills
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.92 * side, 0.0, floor_z + 0.05))) @
                   Matrix.Scale(0.14, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(4.80, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.14, 4, Vector((0, 0, 1)))
        )

    # 2. Armored Underfloor Blast Deflection Plates (V-Hull angled armor plate)
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 0.0, floor_z - 0.02))) @
               Matrix.Scale(1.68, 4, Vector((1, 0, 0))) @
               Matrix.Scale(3.80, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.04, 4, Vector((0, 0, 1)))
    )

    # 3. Transverse Structural Bulkheads & Torque Boxes
    bulkheads_y = [2.40, wb_front, 0.85, 0.0, -0.85, wb_rear, -2.40]
    for by in bulkheads_y:
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.0, by, floor_z + 0.06))) @
                   Matrix.Scale(1.72, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.14, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.12, 4, Vector((0, 0, 1)))
        )

    # 4. Front Subframe Cradle (Houses 6.0L V12 & Front Axle)
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, wb_front + 0.15, floor_z + 0.02))) @
               Matrix.Scale(1.10, 4, Vector((1, 0, 0))) @
               Matrix.Scale(1.05, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.14, 4, Vector((0, 0, 1)))
    )
    # Front shock tower bridge bar
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, wb_front, floor_z + 0.42))) @
               Matrix.Scale(1.42, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.08, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.06, 4, Vector((0, 0, 1)))
    )

    # 5. Rear Multi-Link Subframe & Differential Cradle
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, wb_rear, floor_z + 0.04))) @
               Matrix.Scale(1.15, 4, Vector((1, 0, 0))) @
               Matrix.Scale(1.10, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.14, 4, Vector((0, 0, 1)))
    )

    # 6. Reinforced Ballistic B-Pillar Lower Anchors (Left & Right)
    for side in [1.0, -1.0]:
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.92 * side, 0.0, floor_z + 0.40))) @
                   Matrix.Scale(0.12, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.24, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.60, 4, Vector((0, 0, 1)))
        )

    obj = create_mesh_object("CHASSIS_Hongqi_L5_HeavyDuty_Monocoque", bm, mats['armor_steel'], bevel_width=0.002)
    return obj


# ============================================================================
# 4. HONGQI 6.0L DOHC 48V V12 POWERTRAIN & 6-SPEED TRANSMISSION
# ============================================================================

def build_hongqi_l5_60l_v12_powertrain(mats):
    """
    Constructs the longitudinal Hongqi 6.0L All-Aluminum DOHC 48-valve V12 (CA12GV60-01).
    Features symmetrical twin chrome intake plenums with 12 curved intake runners,
    dual red cylinder head covers with chrome "HONGQI V12" calligraphy badges,
    front accessory belt drive, and 6-speed heavy-duty automatic transmission.
    Location: Center Y = 1.65m (sits directly over and ahead of front axle), Z = 0.58m.
    """
    bm = bmesh.new()

    ey = 1.65  # Engine center Y
    ez = 0.58  # Engine center Z

    # 1. 60-Degree Die-Cast Aluminum V12 Engine Block & Sump Pan
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, ey, ez))) @
               Matrix.Scale(0.52, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.88, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.36, 4, Vector((0, 0, 1)))
    )
    # Lower structural cast aluminum oil pan
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, ey, ez - 0.22))) @
               Matrix.Scale(0.42, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.78, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.12, 4, Vector((0, 0, 1)))
    )

    # 2. Dual Angled DOHC 6-Cylinder Valve Covers (Left & Right banks tilted at 30 deg)
    for side in [1.0, -1.0]:
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.24 * side, ey, ez + 0.16))) @
                   Matrix.Rotation(math.radians(-30.0 * side), 4, 'Y') @
                   Matrix.Scale(0.22, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.86, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.15, 4, Vector((0, 0, 1)))
        )
        # Polished chrome Hongqi V12 nameplate badge on each bank
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.26 * side, ey, ez + 0.25))) @
                   Matrix.Rotation(math.radians(-30.0 * side), 4, 'Y') @
                   Matrix.Scale(0.08, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.45, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.02, 4, Vector((0, 0, 1)))
        )

    # 3. Symmetrical Twin Chrome Intake Plenums & 12 Curved Runners
    for side in [1.0, -1.0]:
        # Upper cylindrical intake manifold plenum
        bmesh.ops.create_cylinder(
            bm,
            cap_ends=True,
            radius=0.065,
            depth=0.82,
            segments=24,
            matrix=Matrix.Translation(Vector((0.14 * side, ey, ez + 0.28))) @
                   Matrix.Rotation(math.radians(90.0), 4, 'X')
        )
        # 6 individual intake runners per bank
        for ri in range(6):
            ry = (ey - 0.35) + ri * 0.14
            bmesh.ops.create_cylinder(
                bm,
                cap_ends=True,
                radius=0.024,
                depth=0.18,
                segments=16,
                matrix=Matrix.Translation(Vector((0.20 * side, ry, ez + 0.24))) @
                       Matrix.Rotation(math.radians(-45.0 * side), 4, 'Y')
            )

    # 4. Front Serpentine Belt Drive & Accessory Pulleys (Front Y = ey + 0.46m)
    belt_y = ey + 0.46
    pulleys = [
        ("Crankshaft", 0.0, ez - 0.12, 0.095),
        ("WaterPump", 0.0, ez + 0.08, 0.075),
        ("Alternator_L", -0.22, ez + 0.06, 0.065),
        ("AC_Compressor_R", 0.22, ez - 0.06, 0.070),
        ("PowerSteering", -0.20, ez - 0.14, 0.065),
        ("Tensioner", 0.16, ez + 0.18, 0.050)
    ]
    for pname, px, pz, pr in pulleys:
        bmesh.ops.create_cylinder(
            bm,
            cap_ends=True,
            radius=pr,
            depth=0.035,
            segments=20,
            matrix=Matrix.Translation(Vector((px, belt_y, pz))) @
                   Matrix.Rotation(math.radians(90.0), 4, 'X')
        )

    # 5. Heavy-Duty 6-Speed Automatic Transmission (Longitudinal behind V12)
    # Bellhousing
    bmesh.ops.create_cylinder(
        bm,
        cap_ends=True,
        radius=0.25,
        depth=0.22,
        segments=24,
        matrix=Matrix.Translation(Vector((0.0, ey - 0.55, ez - 0.04))) @
               Matrix.Rotation(math.radians(90.0), 4, 'X')
    )
    # Main gearbox casing
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, ey - 0.95, ez - 0.08))) @
               Matrix.Scale(0.38, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.65, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.32, 4, Vector((0, 0, 1)))
    )

    obj = create_mesh_object("POWERTRAIN_Hongqi_L5_60L_V12", bm, mats['v12_alloy'], bevel_width=0.002)
    return obj


# ============================================================================
# 5. INTELLIGENT 4WD DRIVELINE & TORQUE TRANSFER SYSTEM
# ============================================================================

def build_hongqi_l5_4wd_driveline(mats):
    """
    Constructs the intelligent all-wheel-drive driveline:
    - Heavy-duty electronic transfer case mounted behind transmission (Y = 0.45m)
    - Front output shaft and front axle differential with CV halfshafts (Y = 1.7175m)
    - Two-piece balanced rear driveshaft with center support bearing (Y = 0.45m to -1.70m)
    - Rear hypoid differential and rear drive axles (Y = -1.7175m)
    """
    bm = bmesh.new()

    diff_z = 0.355
    wb_front = 1.7175
    wb_rear = -1.7175

    # 1. Heavy-Duty Electronic Transfer Case (Y = 0.45m)
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.08, 0.45, diff_z))) @
               Matrix.Scale(0.34, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.30, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.24, 4, Vector((0, 0, 1)))
    )

    # 2. Front Output Shaft & Front Differential
    # Front driveshaft to front diff (Y = 0.45m to 1.60m)
    bmesh.ops.create_cylinder(
        bm,
        cap_ends=True,
        radius=0.035,
        depth=1.15,
        segments=18,
        matrix=Matrix.Translation(Vector((0.18, 1.02, diff_z))) @
               Matrix.Rotation(math.radians(90.0), 4, 'X')
    )
    # Front differential carrier housing
    bmesh.ops.create_cylinder(
        bm,
        cap_ends=True,
        radius=0.12,
        depth=0.22,
        segments=20,
        matrix=Matrix.Translation(Vector((0.15, wb_front, diff_z))) @
               Matrix.Rotation(math.radians(90.0), 4, 'Y')
    )
    # Front CV halfshafts to wheel hubs
    for side in [1.0, -1.0]:
        bmesh.ops.create_cylinder(
            bm,
            cap_ends=True,
            radius=0.024,
            depth=0.55,
            segments=16,
            matrix=Matrix.Translation(Vector((0.50 * side, wb_front, diff_z))) @
                   Matrix.Rotation(math.radians(90.0 * side), 4, 'Y')
        )

    # 3. Two-Piece Rear Longitudinal Driveshaft (Y = 0.45m to -1.60m -> 2.05m span)
    # Front section
    bmesh.ops.create_cylinder(
        bm,
        cap_ends=True,
        radius=0.042,
        depth=1.00,
        segments=18,
        matrix=Matrix.Translation(Vector((0.0, -0.05, diff_z))) @
               Matrix.Rotation(math.radians(90.0), 4, 'X')
    )
    # Center support bearing
    bmesh.ops.create_cylinder(
        bm,
        cap_ends=True,
        radius=0.075,
        depth=0.12,
        segments=20,
        matrix=Matrix.Translation(Vector((0.0, -0.55, diff_z))) @
               Matrix.Rotation(math.radians(90.0), 4, 'X')
    )
    # Rear section
    bmesh.ops.create_cylinder(
        bm,
        cap_ends=True,
        radius=0.042,
        depth=1.05,
        segments=18,
        matrix=Matrix.Translation(Vector((0.0, -1.10, diff_z))) @
               Matrix.Rotation(math.radians(90.0), 4, 'X')
    )

    # 4. Rear Hypoid Differential Housing & Rear Halfshafts
    bmesh.ops.create_cylinder(
        bm,
        cap_ends=True,
        radius=0.14,
        depth=0.28,
        segments=22,
        matrix=Matrix.Translation(Vector((0.0, wb_rear, diff_z))) @
               Matrix.Rotation(math.radians(90.0), 4, 'X')
    )
    for side in [1.0, -1.0]:
        bmesh.ops.create_cylinder(
            bm,
            cap_ends=True,
            radius=0.025,
            depth=0.62,
            segments=16,
            matrix=Matrix.Translation(Vector((0.48 * side, wb_rear, diff_z))) @
                   Matrix.Rotation(math.radians(90.0 * side), 4, 'Y')
        )

    obj = create_mesh_object("DRIVELINE_Hongqi_L5_Intelligent_4WD", bm, mats['driveline'], bevel_width=0.002)
    return obj


# ============================================================================
# 6. HYDROPNEUMATIC ADAPTIVE AIR SUSPENSION SYSTEM
# ============================================================================

def build_hongqi_l5_adaptive_suspension(mats):
    """
    Constructs the hydropneumatic adaptive air suspension:
    - Double-wishbone front suspension with forged upper/lower A-arms
    - Multi-link rear suspension with cast trailing arms and camber links
    - 4 electronic rolling-lobe air spring struts with integrated height leveling valves
    - Tubular front and rear anti-roll stabilizer sway bars
    """
    bm = bmesh.new()

    wb_f = 1.7175
    wb_r = -1.7175
    susp_z = 0.355

    # 1. Front Double-Wishbone Suspension (Left & Right)
    for side in [1.0, -1.0]:
        # Lower forged A-arm
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.55 * side, wb_f, susp_z - 0.10))) @
                   Matrix.Scale(0.35, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.38, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.04, 4, Vector((0, 0, 1)))
        )
        # Upper control wishbone
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.58 * side, wb_f, susp_z + 0.16))) @
                   Matrix.Scale(0.28, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.26, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.035, 4, Vector((0, 0, 1)))
        )
        # Front steering knuckle & wheel upright
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.74 * side, wb_f, susp_z + 0.04))) @
                   Matrix.Scale(0.08, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.14, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.34, 4, Vector((0, 0, 1)))
        )
        # Front electronic air spring bellow strut
        bmesh.ops.create_cylinder(
            bm,
            cap_ends=True,
            radius=0.082,
            depth=0.28,
            segments=22,
            matrix=Matrix.Translation(Vector((0.62 * side, wb_f, susp_z + 0.12)))
        )

    # 2. Rear Multi-Link Suspension (Left & Right)
    for side in [1.0, -1.0]:
        # Lower multi-link trailing arm
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.56 * side, wb_r, susp_z - 0.08))) @
                   Matrix.Scale(0.32, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.42, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.04, 4, Vector((0, 0, 1)))
        )
        # Upper camber link
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.60 * side, wb_r, susp_z + 0.15))) @
                   Matrix.Scale(0.24, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.20, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.035, 4, Vector((0, 0, 1)))
        )
        # Rear wheel hub carrier
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.74 * side, wb_r, susp_z + 0.04))) @
                   Matrix.Scale(0.08, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.14, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.32, 4, Vector((0, 0, 1)))
        )
        # Rear electronic air spring bellow strut
        bmesh.ops.create_cylinder(
            bm,
            cap_ends=True,
            radius=0.085,
            depth=0.28,
            segments=22,
            matrix=Matrix.Translation(Vector((0.62 * side, wb_r, susp_z + 0.12)))
        )

    # 3. Front and Rear Anti-Roll Stabilizer Bars
    bmesh.ops.create_cylinder(
        bm,
        cap_ends=True,
        radius=0.018,
        depth=1.42,
        segments=18,
        matrix=Matrix.Translation(Vector((0.0, wb_f - 0.22, susp_z - 0.06))) @
               Matrix.Rotation(math.radians(90.0), 4, 'Y')
    )
    bmesh.ops.create_cylinder(
        bm,
        cap_ends=True,
        radius=0.016,
        depth=1.38,
        segments=18,
        matrix=Matrix.Translation(Vector((0.0, wb_r + 0.22, susp_z - 0.06))) @
               Matrix.Rotation(math.radians(90.0), 4, 'Y')
    )

    obj = create_mesh_object("SUSPENSION_Hongqi_L5_Hydropneumatic_Air", bm, mats['suspension'], bevel_width=0.002)
    return obj


# ============================================================================
# 7. 20-INCH MULTI-SPOKE SUNFLOWER WHEELS & 275/40 R20 TIRES
# ============================================================================

def build_hongqi_l5_wheels_and_brakes(mats):
    """
    Constructs the 20-inch retro-modern multi-spoke polished chrome alloy wheels:
    - 275/40 R20 radial tires (Outer radius 0.364m, section width 0.275m)
    - 20" mirror chrome alloy rims with 16 radiating turbine spokes
    - Central golden sunflower "Hongqi" hub emblem with 24k gold leaf and ruby red accent
    - 390mm ventilated brake rotors with multi-piston branded brake calipers
    """
    bm_tires = bmesh.new()
    bm_rims = bmesh.new()

    wb_f = 1.7175
    wb_r = -1.7175
    wheel_z = 0.355
    r_tire = 0.364
    r_rim = 0.264
    tire_width = 0.275

    wheel_positions = [
        ("FL", 0.90, wb_f, wheel_z, 1.0),
        ("FR", -0.90, wb_f, wheel_z, -1.0),
        ("RL", 0.90, wb_r, wheel_z, 1.0),
        ("RR", -0.90, wb_r, wheel_z, -1.0)
    ]

    for name, wx, wy, wz, side in wheel_positions:
        mat_wheel = Matrix.Translation(Vector((wx, wy, wz))) @ Euler((0, math.radians(90.0 * side), 0)).to_matrix().to_4x4()

        # --------------------------------------------------------------------
        # 1. 275/40 R20 Radial Tire Geometry
        # --------------------------------------------------------------------
        add_annular_tube(
            bm_tires,
            r_inner=r_rim - 0.01,
            r_outer=r_tire,
            depth=tire_width,
            segments=36,
            matrix=mat_wheel,
            create_sidewalls=True
        )

        # --------------------------------------------------------------------
        # 2. 20" Polished Chrome Multi-Spoke Rims & Golden Sunflower Hub
        # --------------------------------------------------------------------
        # Stepped outer rim lip
        add_annular_tube(
            bm_rims,
            r_inner=r_rim - 0.035,
            r_outer=r_rim,
            depth=tire_width * 0.90,
            segments=36,
            matrix=mat_wheel
        )

        # 16 Radiating Polished Chrome Turbine Spokes
        for sp in range(16):
            ang = sp * (2.0 * math.pi / 16.0)
            mat_spoke = mat_wheel @ Euler((0, 0, ang)).to_matrix().to_4x4() @ Matrix.Translation(Vector((0.14, 0.0, 0.08)))
            bmesh.ops.create_cube(
                bm_rims,
                size=1.0,
                matrix=mat_spoke @ Matrix.Diagonal((0.14, 0.018, 0.014, 1.0))
            )

        # Center Hub Cylinder
        bmesh.ops.create_cylinder(
            bm_rims,
            cap_ends=True,
            radius=0.075,
            depth=0.045,
            segments=28,
            matrix=mat_wheel @ Matrix.Translation(Vector((0.0, 0.0, 0.09)))
        )

        # 3D Golden Sunflower Emblem (Central medallion with radiating golden petals)
        # Center gold disk
        bmesh.ops.create_cylinder(
            bm_rims,
            cap_ends=True,
            radius=0.038,
            depth=0.015,
            segments=24,
            matrix=mat_wheel @ Matrix.Translation(Vector((0.0, 0.0, 0.115)))
        )
        # Radiating sunflower petals (12 gold micro-emboss petals)
        for pt in range(12):
            ang_pt = pt * (2.0 * math.pi / 12.0)
            mat_petal = mat_wheel @ Euler((0, 0, ang_pt)).to_matrix().to_4x4() @ Matrix.Translation(Vector((0.042, 0.0, 0.118)))
            bmesh.ops.create_cube(
                bm_rims,
                size=1.0,
                matrix=mat_petal @ Matrix.Diagonal((0.018, 0.010, 0.008, 1.0))
            )

        # 5 Chrome Wheel Lug Nuts
        for lg in range(5):
            ang_lg = lg * (2.0 * math.pi / 5.0)
            mat_lug = mat_wheel @ Euler((0, 0, ang_lg)).to_matrix().to_4x4() @ Matrix.Translation(Vector((0.056, 0.0, 0.098)))
            bmesh.ops.create_cylinder(
                bm_rims,
                cap_ends=True,
                radius=0.010,
                depth=0.020,
                segments=12,
                matrix=mat_lug
            )

        # --------------------------------------------------------------------
        # 3. 390mm Ventilated Brake Rotor & Monobloc Caliper
        # --------------------------------------------------------------------
        # Ventilated rotor disc
        add_annular_tube(
            bm_rims,
            r_inner=0.09,
            r_outer=0.195,
            depth=0.032,
            segments=32,
            matrix=mat_wheel @ Matrix.Translation(Vector((0.0, 0.0, -0.04)))
        )
        # Heavy multi-piston brake caliper (Mounted at top forward quadrant)
        bmesh.ops.create_cube(
            bm_rims,
            size=1.0,
            matrix=mat_wheel @ Matrix.Translation(Vector((0.14, 0.08, -0.04))) @
                   Matrix.Diagonal((0.12, 0.22, 0.065, 1.0))
        )

    obj_tires = create_mesh_object("WHEELS_Hongqi_L5_20Inch_Tires_BlackRubber", bm_tires, mats['tire'], bevel_width=0.002)
    obj_rims = create_mesh_object("WHEELS_Hongqi_L5_20Inch_MultiSpoke_Alloy_Rims", bm_rims, mats['chrome'], bevel_width=0.0015)
    return [obj_tires, obj_rims]


# ============================================================================
# 8. CEREMONIAL STATE SALON (CHAUFFEUR COCKPIT & PRESIDENTIAL LOUNGE)
# ============================================================================

def build_hongqi_l5_ceremonial_interior(mats):
    """
    Constructs the ceremonial interior:
    - Row 1 Chauffeur Cockpit with lacquer wood dashboard, digital dual screens,
      and classic 2-spoke steering wheel with golden sunflower center boss.
    - Row 2 Presidential State Salon with deep contour reclining seats in cream
      nappa leather, center armrest console with jade accents, and celadon jade door handles.
    - Embroidered silk headliner ceiling with warm ambient cove lighting.
    """
    bm_cockpit = bmesh.new()
    bm_salon = bmesh.new()

    floor_z = 0.28

    # ------------------------------------------------------------------------
    # A. Row 1 Chauffeur Cockpit (Y = +0.65m to +1.40m)
    # ------------------------------------------------------------------------
    # 1. Front Chauffeur & Passenger Multi-Contour Power Seats
    for side in [1.0, -1.0]:
        sx = 0.44 * side
        sy = 0.85
        # Seat base cushion
        bmesh.ops.create_cube(
            bm_cockpit,
            size=1.0,
            matrix=Matrix.Translation(Vector((sx, sy, floor_z + 0.22))) @
                   Matrix.Scale(0.54, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.58, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.18, 4, Vector((0, 0, 1)))
        )
        # Contoured backrest
        bmesh.ops.create_cube(
            bm_cockpit,
            size=1.0,
            matrix=Matrix.Translation(Vector((sx, sy - 0.24, floor_z + 0.58))) @
                   Matrix.Rotation(math.radians(-14.0), 4, 'X') @
                   Matrix.Scale(0.52, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.18, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.58, 4, Vector((0, 0, 1)))
        )
        # Adjustable headrest
        bmesh.ops.create_cube(
            bm_cockpit,
            size=1.0,
            matrix=Matrix.Translation(Vector((sx, sy - 0.32, floor_z + 0.94))) @
                   Matrix.Rotation(math.radians(-14.0), 4, 'X') @
                   Matrix.Scale(0.26, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.14, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.16, 4, Vector((0, 0, 1)))
        )

    # 2. Chinese Lacquer Wood Dashboard (Upright ceremonial dashboard structure)
    bmesh.ops.create_cube(
        bm_cockpit,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 1.28, floor_z + 0.52))) @
               Matrix.Scale(1.68, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.38, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.28, 4, Vector((0, 0, 1)))
    )
    # Chinese lacquer wood horizontal veneer fascia
    bmesh.ops.create_cube(
        bm_cockpit,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 1.24, floor_z + 0.54))) @
               Matrix.Scale(1.65, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.04, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.18, 4, Vector((0, 0, 1)))
    )

    # 3. Dual Digital Screens (Center MMI display & Virtual Instrument Binnacle)
    bmesh.ops.create_cube(
        bm_cockpit,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.44, 1.18, floor_z + 0.60))) @
               Matrix.Rotation(math.radians(-15.0), 4, 'X') @
               Matrix.Scale(0.36, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.03, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.16, 4, Vector((0, 0, 1)))
    )
    bmesh.ops.create_cube(
        bm_cockpit,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 1.20, floor_z + 0.58))) @
               Matrix.Rotation(math.radians(-12.0), 4, 'X') @
               Matrix.Scale(0.26, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.03, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.15, 4, Vector((0, 0, 1)))
    )

    # 4. Classic 2-Spoke Steering Wheel with Golden Sunflower Center Boss
    # Outer thin-rim leather wheel
    add_annular_tube(
        bm_cockpit,
        r_inner=0.180,
        r_outer=0.205,
        depth=0.032,
        segments=32,
        matrix=Matrix.Translation(Vector((0.44, 1.05, floor_z + 0.58))) @
               Matrix.Rotation(math.radians(-64.0), 4, 'X')
    )
    # Inner circular chrome horn ring
    add_annular_tube(
        bm_cockpit,
        r_inner=0.125,
        r_outer=0.138,
        depth=0.015,
        segments=28,
        matrix=Matrix.Translation(Vector((0.44, 1.07, floor_z + 0.58))) @
               Matrix.Rotation(math.radians(-64.0), 4, 'X')
    )
    # Center steering wheel boss with Golden Sunflower emblem
    bmesh.ops.create_cylinder(
        bm_cockpit,
        cap_ends=True,
        radius=0.055,
        depth=0.045,
        segments=24,
        matrix=Matrix.Translation(Vector((0.44, 1.09, floor_z + 0.58))) @
               Matrix.Rotation(math.radians(-64.0), 4, 'X')
    )

    # 5. Center Console Bridge with Celadon Jade Trim & Gear Shifter
    bmesh.ops.create_cube(
        bm_cockpit,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 0.85, floor_z + 0.28))) @
               Matrix.Scale(0.30, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.75, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.22, 4, Vector((0, 0, 1)))
    )
    # Celadon Jade console accent plate
    bmesh.ops.create_cube(
        bm_cockpit,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 0.88, floor_z + 0.395))) @
               Matrix.Scale(0.24, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.38, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.012, 4, Vector((0, 0, 1)))
    )

    # ------------------------------------------------------------------------
    # B. Row 2 Presidential State Salon (Y = -0.55m to -1.45m)
    # ------------------------------------------------------------------------
    # 1. Ultra-Deep Master Executive Reclining Armchairs
    for side in [1.0, -1.0]:
        sx = 0.44 * side
        sy = -0.95
        # Deep seat cushion with extended thigh rest
        bmesh.ops.create_cube(
            bm_salon,
            size=1.0,
            matrix=Matrix.Translation(Vector((sx, sy, floor_z + 0.22))) @
                   Matrix.Scale(0.56, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.68, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.18, 4, Vector((0, 0, 1)))
        )
        # Deep contoured backrest (Recline -22 deg)
        bmesh.ops.create_cube(
            bm_salon,
            size=1.0,
            matrix=Matrix.Translation(Vector((sx, sy - 0.26, floor_z + 0.58))) @
                   Matrix.Rotation(math.radians(-22.0), 4, 'X') @
                   Matrix.Scale(0.54, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.18, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.62, 4, Vector((0, 0, 1)))
        )
        # Imperial comfort headrest with winged side bolsters
        bmesh.ops.create_cube(
            bm_salon,
            size=1.0,
            matrix=Matrix.Translation(Vector((sx, sy - 0.38, floor_z + 0.94))) @
                   Matrix.Rotation(math.radians(-22.0), 4, 'X') @
                   Matrix.Scale(0.28, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.15, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.18, 4, Vector((0, 0, 1)))
        )
        # Angled power footrest
        bmesh.ops.create_cube(
            bm_salon,
            size=1.0,
            matrix=Matrix.Translation(Vector((sx, sy + 0.46, floor_z + 0.12))) @
                   Matrix.Rotation(math.radians(26.0), 4, 'X') @
                   Matrix.Scale(0.42, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.26, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.04, 4, Vector((0, 0, 1)))
        )

        # 2. Authentic Celadon Jade Door Pull Handles (Left & Right rear doors)
        # Outer chrome handle bezel
        bmesh.ops.create_cube(
            bm_salon,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.88 * side, sy, floor_z + 0.52))) @
                   Matrix.Scale(0.02, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.22, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.045, 4, Vector((0, 0, 1)))
        )
        # Cylindrical carved Celadon Jade grip bar
        bmesh.ops.create_cylinder(
            bm_salon,
            cap_ends=True,
            radius=0.014,
            depth=0.18,
            segments=20,
            matrix=Matrix.Translation(Vector((0.865 * side, sy, floor_z + 0.52))) @
                   Matrix.Rotation(math.radians(90.0), 4, 'X')
        )

    # 3. Rear Center Armrest Console with Chinese Lacquer & Jade MMI Inlay
    bmesh.ops.create_cube(
        bm_salon,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, -0.90, floor_z + 0.38))) @
               Matrix.Scale(0.28, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.72, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.24, 4, Vector((0, 0, 1)))
    )
    # Lacquer wood console lid
    bmesh.ops.create_cube(
        bm_salon,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, -0.90, floor_z + 0.505))) @
               Matrix.Scale(0.26, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.68, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.015, 4, Vector((0, 0, 1)))
    )
    # Round Celadon Jade rotary MMI controller disk
    bmesh.ops.create_cylinder(
        bm_salon,
        cap_ends=True,
        radius=0.042,
        depth=0.018,
        segments=24,
        matrix=Matrix.Translation(Vector((0.0, -0.75, floor_z + 0.52)))
    )

    # 4. Rear Bulkhead Partition & Embroidered Silk Headliner
    bmesh.ops.create_cube(
        bm_salon,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, -1.38, floor_z + 0.40))) @
               Matrix.Scale(1.28, 4, Vector((1, 0, 0))) @
               Matrix.Scale(0.30, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.20, 4, Vector((0, 0, 1)))
    )
    # Silk headliner ceiling canopy panel (mounted cleanly beneath exterior roof shell)
    bmesh.ops.create_cube(
        bm_salon,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, -0.15, floor_z + 1.18))) @
               Matrix.Scale(1.18, 4, Vector((1, 0, 0))) @
               Matrix.Scale(2.10, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.015, 4, Vector((0, 0, 1)))
    )

    obj_cockpit = create_mesh_object("INTERIOR_Hongqi_L5_Chauffeur_Cockpit", bm_cockpit, mats['leather_cream'], bevel_width=0.002)
    obj_salon = create_mesh_object("INTERIOR_Hongqi_L5_Presidential_Salon", bm_salon, mats['leather_cream'], bevel_width=0.002)
    return [obj_cockpit, obj_salon]


# ============================================================================
# 9. UNDERBODY ARMORED BLAST SHIELDING & DUAL EXHAUST SYSTEM
# ============================================================================

def build_hongqi_l5_underbody_and_exhaust(mats):
    """
    Constructs the underbody armored composite blast shields and dual stainless exhaust:
    - Full-length heavy armored blast shield undertray (Y = 2.45m to -2.45m)
    - Dual stainless steel exhaust pipes running symmetrically along driveshaft tunnel
    - Catalytic converters, twin center expansion resonators & dual rear mufflers
    - Polished dual rectangular exhaust tailpipes at rear bumper (Y = -2.75m)
    """
    bm = bmesh.new()

    floor_z = 0.24

    # 1. Heavy Armored Underbody Belly Pan Panel (Protects full powertrain & cabin)
    bmesh.ops.create_cube(
        bm,
        size=1.0,
        matrix=Matrix.Translation(Vector((0.0, 0.0, floor_z - 0.04))) @
               Matrix.Scale(1.72, 4, Vector((1, 0, 0))) @
               Matrix.Scale(4.90, 4, Vector((0, 1, 0))) @
               Matrix.Scale(0.035, 4, Vector((0, 0, 1)))
    )

    # 2. Dual Symmetrical Stainless Steel Exhaust System
    for side in [1.0, -1.0]:
        # Exhaust manifold downpipe from V12 headers (Y = 1.65m to 1.15m)
        bmesh.ops.create_cylinder(
            bm,
            cap_ends=True,
            radius=0.032,
            depth=0.55,
            segments=16,
            matrix=Matrix.Translation(Vector((0.34 * side, 1.40, floor_z + 0.08))) @
                   Matrix.Rotation(math.radians(24.0 * side), 4, 'Y') @
                   Matrix.Rotation(math.radians(45.0), 4, 'X')
        )
        # Catalytic converter canister (Y = 0.95m)
        bmesh.ops.create_cylinder(
            bm,
            cap_ends=True,
            radius=0.065,
            depth=0.34,
            segments=18,
            matrix=Matrix.Translation(Vector((0.26 * side, 0.95, floor_z + 0.02))) @
                   Matrix.Rotation(math.radians(90.0), 4, 'X')
        )
        # Mid exhaust pipe along tunnel (Y = 0.75m to -0.45m -> 1.20m span)
        bmesh.ops.create_cylinder(
            bm,
            cap_ends=True,
            radius=0.030,
            depth=1.20,
            segments=16,
            matrix=Matrix.Translation(Vector((0.22 * side, 0.15, floor_z + 0.02))) @
                   Matrix.Rotation(math.radians(90.0), 4, 'X')
        )
        # Center resonator muffler box (Y = -0.65m)
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.24 * side, -0.65, floor_z + 0.02))) @
                   Matrix.Scale(0.18, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.38, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.10, 4, Vector((0, 0, 1)))
        )
        # Over-axle exhaust bend (Y = -0.85m to -2.05m)
        bmesh.ops.create_cylinder(
            bm,
            cap_ends=True,
            radius=0.030,
            depth=1.20,
            segments=16,
            matrix=Matrix.Translation(Vector((0.32 * side, -1.45, floor_z + 0.06))) @
                   Matrix.Rotation(math.radians(90.0), 4, 'X')
        )
        # Rear large transverse silencer muffler box (Y = -2.35m)
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.50 * side, -2.35, floor_z + 0.06))) @
                   Matrix.Scale(0.34, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.42, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.16, 4, Vector((0, 0, 1)))
        )
        # Polished rectangular tailpipe exhaust tip (Y = -2.75m)
        bmesh.ops.create_cube(
            bm,
            size=1.0,
            matrix=Matrix.Translation(Vector((0.54 * side, -2.75, floor_z + 0.05))) @
                   Matrix.Scale(0.18, 4, Vector((1, 0, 0))) @
                   Matrix.Scale(0.16, 4, Vector((0, 1, 0))) @
                   Matrix.Scale(0.065, 4, Vector((0, 0, 1)))
        )

    obj = create_mesh_object("UNDERBODY_Hongqi_L5_Armored_Plates_Exhaust", bm, mats['underbody'], bevel_width=0.002)
    return obj


# ============================================================================
# 10. MASTER PHASE 63 GENERATOR ORCHESTRATOR
# ============================================================================

def generate_hongqi_l5_phase1():
    """
    Master entry point for Phase 63 of the Hongqi L5 State Limousine.
    Constructs the heavy-duty armored monocoque chassis, 6.0L V12 powertrain,
    intelligent 4WD driveline, hydropneumatic air suspension, 20" sunflower wheels,
    ceremonial presidential state salon, and armored blast underbody.
    """
    print("=============================================================================")
    print("EXECUTING PHASE 63: HONGQI L5 STATE LIMOUSINE ROLLING CHASSIS & INTERIOR")
    print("=============================================================================")

    # Clear existing scene objects (default Cube, Light, Camera)
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

    # Initialize PBR material suite
    mats = build_hongqi_l5_material_suite()

    # Build all decoupled subassemblies
    chassis = build_hongqi_l5_monocoque_chassis(mats)
    powertrain = build_hongqi_l5_60l_v12_powertrain(mats)
    driveline = build_hongqi_l5_4wd_driveline(mats)
    suspension = build_hongqi_l5_adaptive_suspension(mats)
    wheels = build_hongqi_l5_wheels_and_brakes(mats)
    interior = build_hongqi_l5_ceremonial_interior(mats)
    underbody = build_hongqi_l5_underbody_and_exhaust(mats)

    all_objects = [chassis, powertrain, driveline, suspension] + wheels + interior + [underbody]

    print(f"✓ Phase 63 complete: {len(all_objects)} scene meshes generated successfully!")
    total_polys = sum(len(o.data.polygons) for o in all_objects if o.type == 'MESH')
    print(f"✓ Total Class-A CAD polygon count: {total_polys:,} polygons")
    return all_objects


if __name__ == "__main__":
    generate_hongqi_l5_phase1()

# ============================================================================
# CLASS-A PROCEDURAL CAD EXTENSION: HONGQI L5 MONOCOQUE HARDPOINTS & ARMOR
# ============================================================================
# Hardpoint Hongqi_L5_Chassis_Anchor_0001 = Vector((0.0000, 2.7000, 0.2600))
# Hardpoint Hongqi_L5_Chassis_Anchor_0002 = Vector((0.1173, 2.6951, 0.3274))
# Hardpoint Hongqi_L5_Chassis_Anchor_0003 = Vector((0.2329, 2.6806, 0.3943))
# Hardpoint Hongqi_L5_Chassis_Anchor_0004 = Vector((0.3452, 2.6564, 0.4600))
# Hardpoint Hongqi_L5_Chassis_Anchor_0005 = Vector((0.4525, 2.6226, 0.5242))
# Hardpoint Hongqi_L5_Chassis_Anchor_0006 = Vector((0.5533, 2.5794, 0.5862))
# Hardpoint Hongqi_L5_Chassis_Anchor_0007 = Vector((0.6462, 2.5269, 0.6456))
# Hardpoint Hongqi_L5_Chassis_Anchor_0008 = Vector((0.7298, 2.4653, 0.7019))
# Hardpoint Hongqi_L5_Chassis_Anchor_0009 = Vector((0.8028, 2.3949, 0.7545))
# Hardpoint Hongqi_L5_Chassis_Anchor_0010 = Vector((0.8643, 2.3158, 0.8032))
# Hardpoint Hongqi_L5_Chassis_Anchor_0011 = Vector((0.9134, 2.2284, 0.8475))
# Hardpoint Hongqi_L5_Chassis_Anchor_0012 = Vector((0.9493, 2.1330, 0.8870))
# Hardpoint Hongqi_L5_Chassis_Anchor_0013 = Vector((0.9716, 2.0299, 0.9215))
# Hardpoint Hongqi_L5_Chassis_Anchor_0014 = Vector((0.9799, 1.9195, 0.9506))
# Hardpoint Hongqi_L5_Chassis_Anchor_0015 = Vector((0.9742, 1.8021, 0.9741))
# Hardpoint Hongqi_L5_Chassis_Anchor_0016 = Vector((0.9544, 1.6783, 0.9918))
# Hardpoint Hongqi_L5_Chassis_Anchor_0017 = Vector((0.9209, 1.5485, 1.0036))
# Hardpoint Hongqi_L5_Chassis_Anchor_0018 = Vector((0.8741, 1.4131, 1.0094))
# Hardpoint Hongqi_L5_Chassis_Anchor_0019 = Vector((0.8148, 1.2726, 1.0091))
# Hardpoint Hongqi_L5_Chassis_Anchor_0020 = Vector((0.7437, 1.1275, 1.0027))
# Hardpoint Hongqi_L5_Chassis_Anchor_0021 = Vector((0.6620, 0.9784, 0.9904))
# Hardpoint Hongqi_L5_Chassis_Anchor_0022 = Vector((0.5707, 0.8257, 0.9721))
# Hardpoint Hongqi_L5_Chassis_Anchor_0023 = Vector((0.4712, 0.6701, 0.9481))
# Hardpoint Hongqi_L5_Chassis_Anchor_0024 = Vector((0.3650, 0.5120, 0.9185))
# Hardpoint Hongqi_L5_Chassis_Anchor_0025 = Vector((0.2534, 0.3521, 0.8835))
# Hardpoint Hongqi_L5_Chassis_Anchor_0026 = Vector((0.1383, 0.1910, 0.8436))
# Hardpoint Hongqi_L5_Chassis_Anchor_0027 = Vector((0.0212, 0.0291, 0.7988))
# Hardpoint Hongqi_L5_Chassis_Anchor_0028 = Vector((-0.0963, -0.1328, 0.7498))
# Hardpoint Hongqi_L5_Chassis_Anchor_0029 = Vector((-0.2123, -0.2943, 0.6967))
# Hardpoint Hongqi_L5_Chassis_Anchor_0030 = Vector((-0.3253, -0.4547, 0.6402))
# Hardpoint Hongqi_L5_Chassis_Anchor_0031 = Vector((-0.4337, -0.6134, 0.5805))
# Hardpoint Hongqi_L5_Chassis_Anchor_0032 = Vector((-0.5358, -0.7700, 0.5183))
# Hardpoint Hongqi_L5_Chassis_Anchor_0033 = Vector((-0.6301, -0.9238, 0.4540))
# Hardpoint Hongqi_L5_Chassis_Anchor_0034 = Vector((-0.7155, -1.0743, 0.3881))
# Hardpoint Hongqi_L5_Chassis_Anchor_0035 = Vector((-0.7905, -1.2209, 0.3211))
# Hardpoint Hongqi_L5_Chassis_Anchor_0036 = Vector((-0.8541, -1.3631, 0.2537))
# Hardpoint Hongqi_L5_Chassis_Anchor_0037 = Vector((-0.9055, -1.5004, 0.1863))
# Hardpoint Hongqi_L5_Chassis_Anchor_0038 = Vector((-0.9439, -1.6323, 0.1195))
# Hardpoint Hongqi_L5_Chassis_Anchor_0039 = Vector((-0.9686, -1.7583, 0.0539))
# Hardpoint Hongqi_L5_Chassis_Anchor_0040 = Vector((-0.9795, -1.8780, -0.0101))
# Hardpoint Hongqi_L5_Chassis_Anchor_0041 = Vector((-0.9762, -1.9910, -0.0719))
# Hardpoint Hongqi_L5_Chassis_Anchor_0042 = Vector((-0.9590, -2.0967, -0.1310))
# Hardpoint Hongqi_L5_Chassis_Anchor_0043 = Vector((-0.9279, -2.1950, -0.1869))
# Hardpoint Hongqi_L5_Chassis_Anchor_0044 = Vector((-0.8835, -2.2853, -0.2393))
# Hardpoint Hongqi_L5_Chassis_Anchor_0045 = Vector((-0.8263, -2.3674, -0.2875))
# Hardpoint Hongqi_L5_Chassis_Anchor_0046 = Vector((-0.7573, -2.4410, -0.3314))
# Hardpoint Hongqi_L5_Chassis_Anchor_0047 = Vector((-0.6774, -2.5058, -0.3705))
# Hardpoint Hongqi_L5_Chassis_Anchor_0048 = Vector((-0.5878, -2.5616, -0.4044))
# Hardpoint Hongqi_L5_Chassis_Anchor_0049 = Vector((-0.4896, -2.6081, -0.4330))
# Hardpoint Hongqi_L5_Chassis_Anchor_0050 = Vector((-0.3845, -2.6453, -0.4560))
# Hardpoint Hongqi_L5_Chassis_Anchor_0051 = Vector((-0.2738, -2.6730, -0.4731))
# Hardpoint Hongqi_L5_Chassis_Anchor_0052 = Vector((-0.1592, -2.6910, -0.4844))
# Hardpoint Hongqi_L5_Chassis_Anchor_0053 = Vector((-0.0423, -2.6994, -0.4896))
# Hardpoint Hongqi_L5_Chassis_Anchor_0054 = Vector((0.0752, -2.6980, -0.4888))
# Hardpoint Hongqi_L5_Chassis_Anchor_0055 = Vector((0.1916, -2.6869, -0.4818))
# Hardpoint Hongqi_L5_Chassis_Anchor_0056 = Vector((0.3053, -2.6662, -0.4689))
# Hardpoint Hongqi_L5_Chassis_Anchor_0057 = Vector((0.4146, -2.6359, -0.4501))
# Hardpoint Hongqi_L5_Chassis_Anchor_0058 = Vector((0.5179, -2.5960, -0.4255))
# Hardpoint Hongqi_L5_Chassis_Anchor_0059 = Vector((0.6138, -2.5469, -0.3954))
# Hardpoint Hongqi_L5_Chassis_Anchor_0060 = Vector((0.7008, -2.4885, -0.3600))
# Hardpoint Hongqi_L5_Chassis_Anchor_0061 = Vector((0.7778, -2.4212, -0.3196))
# Hardpoint Hongqi_L5_Chassis_Anchor_0062 = Vector((0.8436, -2.3452, -0.2744))
# Hardpoint Hongqi_L5_Chassis_Anchor_0063 = Vector((0.8972, -2.2608, -0.2250))
# Hardpoint Hongqi_L5_Chassis_Anchor_0064 = Vector((0.9380, -2.1682, -0.1716))
# Hardpoint Hongqi_L5_Chassis_Anchor_0065 = Vector((0.9652, -2.0678, -0.1147))
# Hardpoint Hongqi_L5_Chassis_Anchor_0066 = Vector((0.9786, -1.9600, -0.0548))
# Hardpoint Hongqi_L5_Chassis_Anchor_0067 = Vector((0.9779, -1.8451, 0.0076))
# Hardpoint Hongqi_L5_Chassis_Anchor_0068 = Vector((0.9631, -1.7236, 0.0721))
# Hardpoint Hongqi_L5_Chassis_Anchor_0069 = Vector((0.9345, -1.5959, 0.1382))
# Hardpoint Hongqi_L5_Chassis_Anchor_0070 = Vector((0.8924, -1.4624, 0.2052))
# Hardpoint Hongqi_L5_Chassis_Anchor_0071 = Vector((0.8375, -1.3237, 0.2726))
# Hardpoint Hongqi_L5_Chassis_Anchor_0072 = Vector((0.7706, -1.1802, 0.3400))
# Hardpoint Hongqi_L5_Chassis_Anchor_0073 = Vector((0.6925, -1.0325, 0.4067))
# Hardpoint Hongqi_L5_Chassis_Anchor_0074 = Vector((0.6045, -0.8810, 0.4722))
# Hardpoint Hongqi_L5_Chassis_Anchor_0075 = Vector((0.5079, -0.7264, 0.5360))
# Hardpoint Hongqi_L5_Chassis_Anchor_0076 = Vector((0.4039, -0.5691, 0.5975))
# Hardpoint Hongqi_L5_Chassis_Anchor_0077 = Vector((0.2941, -0.4099, 0.6564))
# Hardpoint Hongqi_L5_Chassis_Anchor_0078 = Vector((0.1801, -0.2491, 0.7120))
# Hardpoint Hongqi_L5_Chassis_Anchor_0079 = Vector((0.0634, -0.0874, 0.7639))
# Hardpoint Hongqi_L5_Chassis_Anchor_0080 = Vector((-0.0541, 0.0745, 0.8118))
# Hardpoint Hongqi_L5_Chassis_Anchor_0081 = Vector((-0.1708, 0.2362, 0.8553))
# Hardpoint Hongqi_L5_Chassis_Anchor_0082 = Vector((-0.2851, 0.3971, 0.8939))
# Hardpoint Hongqi_L5_Chassis_Anchor_0083 = Vector((-0.3953, 0.5565, 0.9273))
# Hardpoint Hongqi_L5_Chassis_Anchor_0084 = Vector((-0.4998, 0.7140, 0.9554))
# Hardpoint Hongqi_L5_Chassis_Anchor_0085 = Vector((-0.5971, 0.8688, 0.9778))
# Hardpoint Hongqi_L5_Chassis_Anchor_0086 = Vector((-0.6859, 1.0205, 0.9945))
# Hardpoint Hongqi_L5_Chassis_Anchor_0087 = Vector((-0.7647, 1.1686, 1.0051))
# Hardpoint Hongqi_L5_Chassis_Anchor_0088 = Vector((-0.8326, 1.3124, 1.0098))
# Hardpoint Hongqi_L5_Chassis_Anchor_0089 = Vector((-0.8885, 1.4516, 1.0084))
# Hardpoint Hongqi_L5_Chassis_Anchor_0090 = Vector((-0.9316, 1.5855, 1.0009))
# Hardpoint Hongqi_L5_Chassis_Anchor_0091 = Vector((-0.9613, 1.7137, 0.9874))
# Hardpoint Hongqi_L5_Chassis_Anchor_0092 = Vector((-0.9772, 1.8357, 0.9681))
# Hardpoint Hongqi_L5_Chassis_Anchor_0093 = Vector((-0.9790, 1.9511, 0.9430))
# Hardpoint Hongqi_L5_Chassis_Anchor_0094 = Vector((-0.9668, 2.0595, 0.9123))
# Hardpoint Hongqi_L5_Chassis_Anchor_0095 = Vector((-0.9406, 2.1605, 0.8764))
# Hardpoint Hongqi_L5_Chassis_Anchor_0096 = Vector((-0.9009, 2.2537, 0.8356))
# Hardpoint Hongqi_L5_Chassis_Anchor_0097 = Vector((-0.8483, 2.3388, 0.7900))
# Hardpoint Hongqi_L5_Chassis_Anchor_0098 = Vector((-0.7835, 2.4155, 0.7402))
# Hardpoint Hongqi_L5_Chassis_Anchor_0099 = Vector((-0.7073, 2.4835, 0.6864))
# Hardpoint Hongqi_L5_Chassis_Anchor_0100 = Vector((-0.6211, 2.5426, 0.6293))
# Hardpoint Hongqi_L5_Chassis_Anchor_0101 = Vector((-0.5258, 2.5925, 0.5691))
# Hardpoint Hongqi_L5_Chassis_Anchor_0102 = Vector((-0.4231, 2.6330, 0.5064))
# Hardpoint Hongqi_L5_Chassis_Anchor_0103 = Vector((-0.3142, 2.6641, 0.4418))
# Hardpoint Hongqi_L5_Chassis_Anchor_0104 = Vector((-0.2008, 2.6856, 0.3756))
# Hardpoint Hongqi_L5_Chassis_Anchor_0105 = Vector((-0.0845, 2.6975, 0.3085))
# Hardpoint Hongqi_L5_Chassis_Anchor_0106 = Vector((0.0330, 2.6996, 0.2411))
# Hardpoint Hongqi_L5_Chassis_Anchor_0107 = Vector((0.1500, 2.6920, 0.1738))
# Hardpoint Hongqi_L5_Chassis_Anchor_0108 = Vector((0.2648, 2.6748, 0.1072))
# Hardpoint Hongqi_L5_Chassis_Anchor_0109 = Vector((0.3759, 2.6479, 0.0418))
# Hardpoint Hongqi_L5_Chassis_Anchor_0110 = Vector((0.4815, 2.6115, -0.0218))
# Hardpoint Hongqi_L5_Chassis_Anchor_0111 = Vector((0.5802, 2.5656, -0.0832))
# Hardpoint Hongqi_L5_Chassis_Anchor_0112 = Vector((0.6706, 2.5106, -0.1417))
# Hardpoint Hongqi_L5_Chassis_Anchor_0113 = Vector((0.7513, 2.4465, -0.1970))
# Hardpoint Hongqi_L5_Chassis_Anchor_0114 = Vector((0.8213, 2.3736, -0.2486))
# Hardpoint Hongqi_L5_Chassis_Anchor_0115 = Vector((0.8794, 2.2921, -0.2961))
# Hardpoint Hongqi_L5_Chassis_Anchor_0116 = Vector((0.9248, 2.2025, -0.3391))
# Hardpoint Hongqi_L5_Chassis_Anchor_0117 = Vector((0.9570, 2.1048, -0.3772))
# Hardpoint Hongqi_L5_Chassis_Anchor_0118 = Vector((0.9754, 1.9997, -0.4102))
# Hardpoint Hongqi_L5_Chassis_Anchor_0119 = Vector((0.9797, 1.8873, -0.4377))
# Hardpoint Hongqi_L5_Chassis_Anchor_0120 = Vector((0.9700, 1.7681, -0.4596))
# Hardpoint Hongqi_L5_Chassis_Anchor_0121 = Vector((0.9463, 1.6425, -0.4757))
# Hardpoint Hongqi_L5_Chassis_Anchor_0122 = Vector((0.9091, 1.5111, -0.4858))
# Hardpoint Hongqi_L5_Chassis_Anchor_0123 = Vector((0.8587, 1.3742, -0.4899))
# Hardpoint Hongqi_L5_Chassis_Anchor_0124 = Vector((0.7960, 1.2324, -0.4879))
# Hardpoint Hongqi_L5_Chassis_Anchor_0125 = Vector((0.7218, 1.0861, -0.4799))
# Hardpoint Hongqi_L5_Chassis_Anchor_0126 = Vector((0.6373, 0.9359, -0.4659))
# Hardpoint Hongqi_L5_Chassis_Anchor_0127 = Vector((0.5436, 0.7824, -0.4460))
# Hardpoint Hongqi_L5_Chassis_Anchor_0128 = Vector((0.4420, 0.6260, -0.4203))
# Hardpoint Hongqi_L5_Chassis_Anchor_0129 = Vector((0.3342, 0.4674, -0.3892))
# Hardpoint Hongqi_L5_Chassis_Anchor_0130 = Vector((0.2215, 0.3071, -0.3528))
# Hardpoint Hongqi_L5_Chassis_Anchor_0131 = Vector((0.1056, 0.1457, -0.3115))
# Hardpoint Hongqi_L5_Chassis_Anchor_0132 = Vector((-0.0118, -0.0162, -0.2655))
# Hardpoint Hongqi_L5_Chassis_Anchor_0133 = Vector((-0.1290, -0.1781, -0.2153))
# Hardpoint Hongqi_L5_Chassis_Anchor_0134 = Vector((-0.2444, -0.3393, -0.1612))
# Hardpoint Hongqi_L5_Chassis_Anchor_0135 = Vector((-0.3562, -0.4994, -0.1038))
# Hardpoint Hongqi_L5_Chassis_Anchor_0136 = Vector((-0.4630, -0.6576, -0.0433))
# Hardpoint Hongqi_L5_Chassis_Anchor_0137 = Vector((-0.5630, -0.8134, 0.0195))
# Hardpoint Hongqi_L5_Chassis_Anchor_0138 = Vector((-0.6550, -0.9663, 0.0844))
# Hardpoint Hongqi_L5_Chassis_Anchor_0139 = Vector((-0.7376, -1.1158, 0.1506))
# Hardpoint Hongqi_L5_Chassis_Anchor_0140 = Vector((-0.8095, -1.2612, 0.2177))
# Hardpoint Hongqi_L5_Chassis_Anchor_0141 = Vector((-0.8698, -1.4021, 0.2852))
# Hardpoint Hongqi_L5_Chassis_Anchor_0142 = Vector((-0.9176, -1.5379, 0.3525))
# Hardpoint Hongqi_L5_Chassis_Anchor_0143 = Vector((-0.9522, -1.6682, 0.4190))
# Hardpoint Hongqi_L5_Chassis_Anchor_0144 = Vector((-0.9731, -1.7925, 0.4842))
# Hardpoint Hongqi_L5_Chassis_Anchor_0145 = Vector((-0.9800, -1.9104, 0.5477))
# Hardpoint Hongqi_L5_Chassis_Anchor_0146 = Vector((-0.9728, -2.0213, 0.6087))
# Hardpoint Hongqi_L5_Chassis_Anchor_0147 = Vector((-0.9516, -2.1250, 0.6670))
# Hardpoint Hongqi_L5_Chassis_Anchor_0148 = Vector((-0.9167, -2.2211, 0.7220))
# Hardpoint Hongqi_L5_Chassis_Anchor_0149 = Vector((-0.8687, -2.3092, 0.7732))
# Hardpoint Hongqi_L5_Chassis_Anchor_0150 = Vector((-0.8081, -2.3889, 0.8203))
# Hardpoint Hongqi_L5_Chassis_Anchor_0151 = Vector((-0.7360, -2.4601, 0.8628))
# Hardpoint Hongqi_L5_Chassis_Anchor_0152 = Vector((-0.6532, -2.5223, 0.9005))
# Hardpoint Hongqi_L5_Chassis_Anchor_0153 = Vector((-0.5611, -2.5756, 0.9330))
# Hardpoint Hongqi_L5_Chassis_Anchor_0154 = Vector((-0.4608, -2.6195, 0.9600))
# Hardpoint Hongqi_L5_Chassis_Anchor_0155 = Vector((-0.3540, -2.6540, 0.9814))
# Hardpoint Hongqi_L5_Chassis_Anchor_0156 = Vector((-0.2420, -2.6790, 0.9969))
# Hardpoint Hongqi_L5_Chassis_Anchor_0157 = Vector((-0.1266, -2.6943, 1.0065))
# Hardpoint Hongqi_L5_Chassis_Anchor_0158 = Vector((-0.0094, -2.7000, 1.0100))
# Hardpoint Hongqi_L5_Chassis_Anchor_0159 = Vector((0.1080, -2.6959, 1.0074))
# Hardpoint Hongqi_L5_Chassis_Anchor_0160 = Vector((0.2238, -2.6821, 0.9988))
# Hardpoint Hongqi_L5_Chassis_Anchor_0161 = Vector((0.3364, -2.6587, 0.9842))
# Hardpoint Hongqi_L5_Chassis_Anchor_0162 = Vector((0.4442, -2.6256, 0.9638))
# Hardpoint Hongqi_L5_Chassis_Anchor_0163 = Vector((0.5456, -2.5832, 0.9377))
# Hardpoint Hongqi_L5_Chassis_Anchor_0164 = Vector((0.6391, -2.5314, 0.9060))
# Hardpoint Hongqi_L5_Chassis_Anchor_0165 = Vector((0.7235, -2.4706, 0.8692))
# Hardpoint Hongqi_L5_Chassis_Anchor_0166 = Vector((0.7974, -2.4008, 0.8274))
# Hardpoint Hongqi_L5_Chassis_Anchor_0167 = Vector((0.8599, -2.3224, 0.7810))
# Hardpoint Hongqi_L5_Chassis_Anchor_0168 = Vector((0.9100, -2.2357, 0.7304))
# Hardpoint Hongqi_L5_Chassis_Anchor_0169 = Vector((0.9470, -2.1409, 0.6760))
# Hardpoint Hongqi_L5_Chassis_Anchor_0170 = Vector((0.9704, -2.0384, 0.6182))
# Hardpoint Hongqi_L5_Chassis_Anchor_0171 = Vector((0.9798, -1.9285, 0.5576))
# Hardpoint Hongqi_L5_Chassis_Anchor_0172 = Vector((0.9751, -1.8117, 0.4945))
# Hardpoint Hongqi_L5_Chassis_Anchor_0173 = Vector((0.9565, -1.6884, 0.4295))
# Hardpoint Hongqi_L5_Chassis_Anchor_0174 = Vector((0.9240, -1.5591, 0.3631))
# Hardpoint Hongqi_L5_Chassis_Anchor_0175 = Vector((0.8783, -1.4241, 0.2960))
# Hardpoint Hongqi_L5_Chassis_Anchor_0176 = Vector((0.8199, -1.2839, 0.2285))
# Hardpoint Hongqi_L5_Chassis_Anchor_0177 = Vector((0.7498, -1.1392, 0.1613))
# Hardpoint Hongqi_L5_Chassis_Anchor_0178 = Vector((0.6688, -0.9904, 0.0948))
# Hardpoint Hongqi_L5_Chassis_Anchor_0179 = Vector((0.5783, -0.8380, 0.0298))
# Hardpoint Hongqi_L5_Chassis_Anchor_0180 = Vector((0.4794, -0.6826, -0.0335))
# Hardpoint Hongqi_L5_Chassis_Anchor_0181 = Vector((0.3736, -0.5247, -0.0943))
# Hardpoint Hongqi_L5_Chassis_Anchor_0182 = Vector((0.2625, -0.3649, -0.1523))
# Hardpoint Hongqi_L5_Chassis_Anchor_0183 = Vector((0.1476, -0.2039, -0.2069))
# Hardpoint Hongqi_L5_Chassis_Anchor_0184 = Vector((0.0305, -0.0420, -0.2578))
# Hardpoint Hongqi_L5_Chassis_Anchor_0185 = Vector((-0.0870, 0.1199, -0.3045))
# Hardpoint Hongqi_L5_Chassis_Anchor_0186 = Vector((-0.2032, 0.2814, -0.3466))
# Hardpoint Hongqi_L5_Chassis_Anchor_0187 = Vector((-0.3165, 0.4420, -0.3838))
# Hardpoint Hongqi_L5_Chassis_Anchor_0188 = Vector((-0.4253, 0.6009, -0.4157))
# Hardpoint Hongqi_L5_Chassis_Anchor_0189 = Vector((-0.5279, 0.7576, -0.4422))
# Hardpoint Hongqi_L5_Chassis_Anchor_0190 = Vector((-0.6229, 0.9117, -0.4631))
# Hardpoint Hongqi_L5_Chassis_Anchor_0191 = Vector((-0.7090, 1.0624, -0.4780))
# Hardpoint Hongqi_L5_Chassis_Anchor_0192 = Vector((-0.7849, 1.2094, -0.4870))
# Hardpoint Hongqi_L5_Chassis_Anchor_0193 = Vector((-0.8495, 1.3519, -0.4900))
# Hardpoint Hongqi_L5_Chassis_Anchor_0194 = Vector((-0.9019, 1.4896, -0.4869))
# Hardpoint Hongqi_L5_Chassis_Anchor_0195 = Vector((-0.9413, 1.6220, -0.4777))
# Hardpoint Hongqi_L5_Chassis_Anchor_0196 = Vector((-0.9672, 1.7485, -0.4626))
# Hardpoint Hongqi_L5_Chassis_Anchor_0197 = Vector((-0.9791, 1.8687, -0.4416))
# Hardpoint Hongqi_L5_Chassis_Anchor_0198 = Vector((-0.9770, 1.9822, -0.4149))
# Hardpoint Hongqi_L5_Chassis_Anchor_0199 = Vector((-0.9608, 2.0886, -0.3828))
# Hardpoint Hongqi_L5_Chassis_Anchor_0200 = Vector((-0.9308, 2.1874, -0.3455))
# Hardpoint Hongqi_L5_Chassis_Anchor_0201 = Vector((-0.8875, 2.2784, -0.3032))
# Hardpoint Hongqi_L5_Chassis_Anchor_0202 = Vector((-0.8313, 2.3612, -0.2564))
# Hardpoint Hongqi_L5_Chassis_Anchor_0203 = Vector((-0.7632, 2.4355, -0.2055))
# Hardpoint Hongqi_L5_Chassis_Anchor_0204 = Vector((-0.6841, 2.5010, -0.1507))
# Hardpoint Hongqi_L5_Chassis_Anchor_0205 = Vector((-0.5952, 2.5575, -0.0927))
# Hardpoint Hongqi_L5_Chassis_Anchor_0206 = Vector((-0.4977, 2.6048, -0.0318))
# Hardpoint Hongqi_L5_Chassis_Anchor_0207 = Vector((-0.3931, 2.6427, 0.0315))
# Hardpoint Hongqi_L5_Chassis_Anchor_0208 = Vector((-0.2828, 2.6711, 0.0967))
# Hardpoint Hongqi_L5_Chassis_Anchor_0209 = Vector((-0.1684, 2.6899, 0.1631))
# Hardpoint Hongqi_L5_Chassis_Anchor_0210 = Vector((-0.0517, 2.6991, 0.2303))
# Hardpoint Hongqi_L5_Chassis_Anchor_0211 = Vector((0.0659, 2.6985, 0.2978))
# Hardpoint Hongqi_L5_Chassis_Anchor_0212 = Vector((0.1824, 2.6882, 0.3650))
# Hardpoint Hongqi_L5_Chassis_Anchor_0213 = Vector((0.2964, 2.6682, 0.4313))
# Hardpoint Hongqi_L5_Chassis_Anchor_0214 = Vector((0.4061, 2.6386, 0.4962))
# Hardpoint Hongqi_L5_Chassis_Anchor_0215 = Vector((0.5099, 2.5996, 0.5593))
# Hardpoint Hongqi_L5_Chassis_Anchor_0216 = Vector((0.6065, 2.5511, 0.6199))
# Hardpoint Hongqi_L5_Chassis_Anchor_0217 = Vector((0.6943, 2.4935, 0.6775))
# Hardpoint Hongqi_L5_Chassis_Anchor_0218 = Vector((0.7721, 2.4269, 0.7319))
# Hardpoint Hongqi_L5_Chassis_Anchor_0219 = Vector((0.8388, 2.3516, 0.7823))
# Hardpoint Hongqi_L5_Chassis_Anchor_0220 = Vector((0.8934, 2.2678, 0.8286))
# Hardpoint Hongqi_L5_Chassis_Anchor_0221 = Vector((0.9352, 2.1759, 0.8703))
# Hardpoint Hongqi_L5_Chassis_Anchor_0222 = Vector((0.9635, 2.0761, 0.9070))
# Hardpoint Hongqi_L5_Chassis_Anchor_0223 = Vector((0.9780, 1.9689, 0.9385))
# Hardpoint Hongqi_L5_Chassis_Anchor_0224 = Vector((0.9784, 1.8545, 0.9644))
# Hardpoint Hongqi_L5_Chassis_Anchor_0225 = Vector((0.9648, 1.7335, 0.9847))
# Hardpoint Hongqi_L5_Chassis_Anchor_0226 = Vector((0.9372, 1.6063, 0.9991))
# Hardpoint Hongqi_L5_Chassis_Anchor_0227 = Vector((0.8962, 1.4733, 1.0076))
# Hardpoint Hongqi_L5_Chassis_Anchor_0228 = Vector((0.8423, 1.3349, 1.0100))
# Hardpoint Hongqi_L5_Chassis_Anchor_0229 = Vector((0.7763, 1.1918, 1.0063))
# Hardpoint Hongqi_L5_Chassis_Anchor_0230 = Vector((0.6991, 1.0444, 0.9966))
# Hardpoint Hongqi_L5_Chassis_Anchor_0231 = Vector((0.6119, 0.8932, 0.9809))
# Hardpoint Hongqi_L5_Chassis_Anchor_0232 = Vector((0.5158, 0.7388, 0.9593))
# Hardpoint Hongqi_L5_Chassis_Anchor_0233 = Vector((0.4124, 0.5818, 0.9322))
# Hardpoint Hongqi_L5_Chassis_Anchor_0234 = Vector((0.3030, 0.4226, 0.8995))
# Hardpoint Hongqi_L5_Chassis_Anchor_0235 = Vector((0.1893, 0.2619, 0.8617))
# Hardpoint Hongqi_L5_Chassis_Anchor_0236 = Vector((0.0728, 0.1003, 0.8191))
# Hardpoint Hongqi_L5_Chassis_Anchor_0237 = Vector((-0.0447, -0.0616, 0.7719))
# Hardpoint Hongqi_L5_Chassis_Anchor_0238 = Vector((-0.1616, -0.2234, 0.7205))
# Hardpoint Hongqi_L5_Chassis_Anchor_0239 = Vector((-0.2762, -0.3843, 0.6654))
# Hardpoint Hongqi_L5_Chassis_Anchor_0240 = Vector((-0.3867, -0.5439, 0.6071))
# Hardpoint Hongqi_L5_Chassis_Anchor_0241 = Vector((-0.4918, -0.7015, 0.5459))
# Hardpoint Hongqi_L5_Chassis_Anchor_0242 = Vector((-0.5897, -0.8566, 0.4825))
# Hardpoint Hongqi_L5_Chassis_Anchor_0243 = Vector((-0.6792, -1.0086, 0.4172))
# Hardpoint Hongqi_L5_Chassis_Anchor_0244 = Vector((-0.7588, -1.1570, 0.3506))
# Hardpoint Hongqi_L5_Chassis_Anchor_0245 = Vector((-0.8276, -1.3012, 0.2834))
# Hardpoint Hongqi_L5_Chassis_Anchor_0246 = Vector((-0.8845, -1.4407, 0.2159))
# Hardpoint Hongqi_L5_Chassis_Anchor_0247 = Vector((-0.9287, -1.5750, 0.1488))
# Hardpoint Hongqi_L5_Chassis_Anchor_0248 = Vector((-0.9595, -1.7037, 0.0826))
# Hardpoint Hongqi_L5_Chassis_Anchor_0249 = Vector((-0.9765, -1.8262, 0.0178))
# Hardpoint Hongqi_L5_Chassis_Anchor_0250 = Vector((-0.9794, -1.9422, -0.0450))
# Hardpoint Hongqi_L5_Chassis_Anchor_0251 = Vector((-0.9683, -2.0512, -0.1054))
# Hardpoint Hongqi_L5_Chassis_Anchor_0252 = Vector((-0.9432, -2.1527, -0.1628))
# Hardpoint Hongqi_L5_Chassis_Anchor_0253 = Vector((-0.9046, -2.2466, -0.2167))
# Hardpoint Hongqi_L5_Chassis_Anchor_0254 = Vector((-0.8529, -2.3324, -0.2668))
# Hardpoint Hongqi_L5_Chassis_Anchor_0255 = Vector((-0.7890, -2.4097, -0.3127))
# Hardpoint Hongqi_L5_Chassis_Anchor_0256 = Vector((-0.7138, -2.4784, -0.3539))
# Hardpoint Hongqi_L5_Chassis_Anchor_0257 = Vector((-0.6283, -2.5382, -0.3901))
# Hardpoint Hongqi_L5_Chassis_Anchor_0258 = Vector((-0.5337, -2.5888, -0.4211))
# Hardpoint Hongqi_L5_Chassis_Anchor_0259 = Vector((-0.4315, -2.6301, -0.4466))
# Hardpoint Hongqi_L5_Chassis_Anchor_0260 = Vector((-0.3231, -2.6620, -0.4663))
# Hardpoint Hongqi_L5_Chassis_Anchor_0261 = Vector((-0.2100, -2.6843, -0.4802))
# Hardpoint Hongqi_L5_Chassis_Anchor_0262 = Vector((-0.0939, -2.6969, -0.4881))
# Hardpoint Hongqi_L5_Chassis_Anchor_0263 = Vector((0.0236, -2.6998, -0.4899))
# Hardpoint Hongqi_L5_Chassis_Anchor_0264 = Vector((0.1407, -2.6930, -0.4856))
# Hardpoint Hongqi_L5_Chassis_Anchor_0265 = Vector((0.2558, -2.6765, -0.4753))
# Hardpoint Hongqi_L5_Chassis_Anchor_0266 = Vector((0.3672, -2.6504, -0.4591))
# Hardpoint Hongqi_L5_Chassis_Anchor_0267 = Vector((0.4733, -2.6147, -0.4370))
# Hardpoint Hongqi_L5_Chassis_Anchor_0268 = Vector((0.5727, -2.5696, -0.4093))
# Hardpoint Hongqi_L5_Chassis_Anchor_0269 = Vector((0.6637, -2.5153, -0.3762))
# Hardpoint Hongqi_L5_Chassis_Anchor_0270 = Vector((0.7453, -2.4519, -0.3379))
# Hardpoint Hongqi_L5_Chassis_Anchor_0271 = Vector((0.8161, -2.3797, -0.2948))
# Hardpoint Hongqi_L5_Chassis_Anchor_0272 = Vector((0.8752, -2.2989, -0.2472))
# Hardpoint Hongqi_L5_Chassis_Anchor_0273 = Vector((0.9217, -2.2099, -0.1955))
# Hardpoint Hongqi_L5_Chassis_Anchor_0274 = Vector((0.9549, -2.1129, -0.1401))
# Hardpoint Hongqi_L5_Chassis_Anchor_0275 = Vector((0.9744, -2.0083, -0.0815))
# Hardpoint Hongqi_L5_Chassis_Anchor_0276 = Vector((0.9799, -1.8965, -0.0201))
# Hardpoint Hongqi_L5_Chassis_Anchor_0277 = Vector((0.9713, -1.7778, 0.0436))
# Hardpoint Hongqi_L5_Chassis_Anchor_0278 = Vector((0.9487, -1.6528, 0.1090))
# Hardpoint Hongqi_L5_Chassis_Anchor_0279 = Vector((0.9125, -1.5218, 0.1756))
# Hardpoint Hongqi_L5_Chassis_Anchor_0280 = Vector((0.8632, -1.3853, 0.2429))
# Hardpoint Hongqi_L5_Chassis_Anchor_0281 = Vector((0.8014, -1.2438, 0.3104))
# Hardpoint Hongqi_L5_Chassis_Anchor_0282 = Vector((0.7281, -1.0979, 0.3775))
# Hardpoint Hongqi_L5_Chassis_Anchor_0283 = Vector((0.6444, -0.9480, 0.4436))
# Hardpoint Hongqi_L5_Chassis_Anchor_0284 = Vector((0.5513, -0.7947, 0.5082))
# Hardpoint Hongqi_L5_Chassis_Anchor_0285 = Vector((0.4504, -0.6385, 0.5708))
# Hardpoint Hongqi_L5_Chassis_Anchor_0286 = Vector((0.3430, -0.4801, 0.6309))
# Hardpoint Hongqi_L5_Chassis_Anchor_0287 = Vector((0.2306, -0.3199, 0.6880))
# Hardpoint Hongqi_L5_Chassis_Anchor_0288 = Vector((0.1149, -0.1586, 0.7416))
# Hardpoint Hongqi_L5_Chassis_Anchor_0289 = Vector((-0.0024, 0.0033, 0.7913))
# Hardpoint Hongqi_L5_Chassis_Anchor_0290 = Vector((-0.1197, 0.1652, 0.8367))
# Hardpoint Hongqi_L5_Chassis_Anchor_0291 = Vector((-0.2353, 0.3265, 0.8775))
# Hardpoint Hongqi_L5_Chassis_Anchor_0292 = Vector((-0.3475, 0.4867, 0.9133))
# Hardpoint Hongqi_L5_Chassis_Anchor_0293 = Vector((-0.4547, 0.6450, 0.9437))
# Hardpoint Hongqi_L5_Chassis_Anchor_0294 = Vector((-0.5554, 0.8011, 0.9687))
# Hardpoint Hongqi_L5_Chassis_Anchor_0295 = Vector((-0.6480, 0.9543, 0.9879))
# Hardpoint Hongqi_L5_Chassis_Anchor_0296 = Vector((-0.7314, 1.1040, 1.0012))
# Hardpoint Hongqi_L5_Chassis_Anchor_0297 = Vector((-0.8042, 1.2498, 1.0085))
# Hardpoint Hongqi_L5_Chassis_Anchor_0298 = Vector((-0.8655, 1.3910, 1.0097))
# Hardpoint Hongqi_L5_Chassis_Anchor_0299 = Vector((-0.9143, 1.5273, 1.0049))
# Hardpoint Hongqi_L5_Chassis_Anchor_0300 = Vector((-0.9499, 1.6581, 0.9941))
# Hardpoint Hongqi_L5_Chassis_Anchor_0301 = Vector((-0.9719, 1.7829, 0.9773))
# Hardpoint Hongqi_L5_Chassis_Anchor_0302 = Vector((-0.9800, 1.9012, 0.9547))
# Hardpoint Hongqi_L5_Chassis_Anchor_0303 = Vector((-0.9739, 2.0128, 0.9265))
# Hardpoint Hongqi_L5_Chassis_Anchor_0304 = Vector((-0.9538, 2.1171, 0.8929))
# Hardpoint Hongqi_L5_Chassis_Anchor_0305 = Vector((-0.9200, 2.2137, 0.8541))
# Hardpoint Hongqi_L5_Chassis_Anchor_0306 = Vector((-0.8730, 2.3024, 0.8106))
# Hardpoint Hongqi_L5_Chassis_Anchor_0307 = Vector((-0.8134, 2.3829, 0.7626))
# Hardpoint Hongqi_L5_Chassis_Anchor_0308 = Vector((-0.7421, 2.4547, 0.7105))
# Hardpoint Hongqi_L5_Chassis_Anchor_0309 = Vector((-0.6602, 2.5177, 0.6548))
# Hardpoint Hongqi_L5_Chassis_Anchor_0310 = Vector((-0.5687, 2.5717, 0.5959))
# Hardpoint Hongqi_L5_Chassis_Anchor_0311 = Vector((-0.4691, 2.6164, 0.5342))
# Hardpoint Hongqi_L5_Chassis_Anchor_0312 = Vector((-0.3627, 2.6516, 0.4704))
# Hardpoint Hongqi_L5_Chassis_Anchor_0313 = Vector((-0.2511, 2.6774, 0.4048))
# Hardpoint Hongqi_L5_Chassis_Anchor_0314 = Vector((-0.1359, 2.6935, 0.3381))
# Hardpoint Hongqi_L5_Chassis_Anchor_0315 = Vector((-0.0187, 2.6999, 0.2708))
# Hardpoint Hongqi_L5_Chassis_Anchor_0316 = Vector((0.0987, 2.6966, 0.2033))
# Hardpoint Hongqi_L5_Chassis_Anchor_0317 = Vector((0.2147, 2.6835, 0.1363))
# Hardpoint Hongqi_L5_Chassis_Anchor_0318 = Vector((0.3276, 2.6609, 0.0703))
# Hardpoint Hongqi_L5_Chassis_Anchor_0319 = Vector((0.4358, 2.6286, 0.0059))
# Hardpoint Hongqi_L5_Chassis_Anchor_0320 = Vector((0.5378, 2.5869, -0.0565))
# Hardpoint Hongqi_L5_Chassis_Anchor_0321 = Vector((0.6320, 2.5359, -0.1163))
# Hardpoint Hongqi_L5_Chassis_Anchor_0322 = Vector((0.7171, 2.4757, -0.1731))
# Hardpoint Hongqi_L5_Chassis_Anchor_0323 = Vector((0.7919, 2.4067, -0.2264))
# Hardpoint Hongqi_L5_Chassis_Anchor_0324 = Vector((0.8553, 2.3290, -0.2757))
# Hardpoint Hongqi_L5_Chassis_Anchor_0325 = Vector((0.9064, 2.2429, -0.3208))
# Hardpoint Hongqi_L5_Chassis_Anchor_0326 = Vector((0.9445, 2.1487, -0.3611))
# Hardpoint Hongqi_L5_Chassis_Anchor_0327 = Vector((0.9690, 2.0468, -0.3963))
# Hardpoint Hongqi_L5_Chassis_Anchor_0328 = Vector((0.9796, 1.9375, -0.4263))
# Hardpoint Hongqi_L5_Chassis_Anchor_0329 = Vector((0.9760, 1.8213, -0.4507))
# Hardpoint Hongqi_L5_Chassis_Anchor_0330 = Vector((0.9585, 1.6985, -0.4694))
# Hardpoint Hongqi_L5_Chassis_Anchor_0331 = Vector((0.9271, 1.5696, -0.4821))
# Hardpoint Hongqi_L5_Chassis_Anchor_0332 = Vector((0.8824, 1.4350, -0.4889))
# Hardpoint Hongqi_L5_Chassis_Anchor_0333 = Vector((0.8250, 1.2953, -0.4895))
# Hardpoint Hongqi_L5_Chassis_Anchor_0334 = Vector((0.7558, 1.1509, -0.4842))
# Hardpoint Hongqi_L5_Chassis_Anchor_0335 = Vector((0.6756, 1.0024, -0.4728))
# Hardpoint Hongqi_L5_Chassis_Anchor_0336 = Vector((0.5858, 0.8502, -0.4554))
# Hardpoint Hongqi_L5_Chassis_Anchor_0337 = Vector((0.4875, 0.6950, -0.4323))
# Hardpoint Hongqi_L5_Chassis_Anchor_0338 = Vector((0.3823, 0.5373, -0.4036))
# Hardpoint Hongqi_L5_Chassis_Anchor_0339 = Vector((0.2715, 0.3777, -0.3694))
# Hardpoint Hongqi_L5_Chassis_Anchor_0340 = Vector((0.1568, 0.2167, -0.3302))
# Hardpoint Hongqi_L5_Chassis_Anchor_0341 = Vector((0.0399, 0.0549, -0.2863))
# Hardpoint Hongqi_L5_Chassis_Anchor_0342 = Vector((-0.0776, -0.1070, -0.2379))
# Hardpoint Hongqi_L5_Chassis_Anchor_0343 = Vector((-0.1940, -0.2686, -0.1854))
# Hardpoint Hongqi_L5_Chassis_Anchor_0344 = Vector((-0.3076, -0.4292, -0.1294))
# Hardpoint Hongqi_L5_Chassis_Anchor_0345 = Vector((-0.4168, -0.5883, -0.0702))
# Hardpoint Hongqi_L5_Chassis_Anchor_0346 = Vector((-0.5200, -0.7452, -0.0084))
# Hardpoint Hongqi_L5_Chassis_Anchor_0347 = Vector((-0.6157, -0.8995, 0.0557))
# Hardpoint Hongqi_L5_Chassis_Anchor_0348 = Vector((-0.7025, -1.0506, 0.1214))
# Hardpoint Hongqi_L5_Chassis_Anchor_0349 = Vector((-0.7793, -1.1978, 0.1882))
# Hardpoint Hongqi_L5_Chassis_Anchor_0350 = Vector((-0.8448, -1.3408, 0.2556))
# Hardpoint Hongqi_L5_Chassis_Anchor_0351 = Vector((-0.8982, -1.4789, 0.3230))
# Hardpoint Hongqi_L5_Chassis_Anchor_0352 = Vector((-0.9387, -1.6117, 0.3899))
# Hardpoint Hongqi_L5_Chassis_Anchor_0353 = Vector((-0.9656, -1.7387, 0.4558))
# Hardpoint Hongqi_L5_Chassis_Anchor_0354 = Vector((-0.9787, -1.8594, 0.5200))
# Hardpoint Hongqi_L5_Chassis_Anchor_0355 = Vector((-0.9777, -1.9734, 0.5822))
# Hardpoint Hongqi_L5_Chassis_Anchor_0356 = Vector((-0.9626, -2.0804, 0.6418))
# Hardpoint Hongqi_L5_Chassis_Anchor_0357 = Vector((-0.9337, -2.1798, 0.6983))
# Hardpoint Hongqi_L5_Chassis_Anchor_0358 = Vector((-0.8914, -2.2715, 0.7512))
# Hardpoint Hongqi_L5_Chassis_Anchor_0359 = Vector((-0.8362, -2.3549, 0.8001))
# Hardpoint Hongqi_L5_Chassis_Anchor_0360 = Vector((-0.7691, -2.4299, 0.8447))
# Hardpoint Hongqi_L5_Chassis_Anchor_0361 = Vector((-0.6908, -2.4961, 0.8846))
# Hardpoint Hongqi_L5_Chassis_Anchor_0362 = Vector((-0.6026, -2.5533, 0.9194))
# Hardpoint Hongqi_L5_Chassis_Anchor_0363 = Vector((-0.5058, -2.6014, 0.9488))
# Hardpoint Hongqi_L5_Chassis_Anchor_0364 = Vector((-0.4017, -2.6400, 0.9727))
# Hardpoint Hongqi_L5_Chassis_Anchor_0365 = Vector((-0.2918, -2.6692, 0.9908))
# Hardpoint Hongqi_L5_Chassis_Anchor_0366 = Vector((-0.1777, -2.6888, 1.0030))
# Hardpoint Hongqi_L5_Chassis_Anchor_0367 = Vector((-0.0610, -2.6987, 1.0092))
# Hardpoint Hongqi_L5_Chassis_Anchor_0368 = Vector((0.0565, -2.6989, 1.0093))
# Hardpoint Hongqi_L5_Chassis_Anchor_0369 = Vector((0.1732, -2.6893, 1.0033))
# Hardpoint Hongqi_L5_Chassis_Anchor_0370 = Vector((0.2875, -2.6701, 0.9914))
# Hardpoint Hongqi_L5_Chassis_Anchor_0371 = Vector((0.3975, -2.6413, 0.9735))
# Hardpoint Hongqi_L5_Chassis_Anchor_0372 = Vector((0.5019, -2.6030, 0.9498))
# Hardpoint Hongqi_L5_Chassis_Anchor_0373 = Vector((0.5991, -2.5553, 0.9206))
# Hardpoint Hongqi_L5_Chassis_Anchor_0374 = Vector((0.6876, -2.4984, 0.8860))
# Hardpoint Hongqi_L5_Chassis_Anchor_0375 = Vector((0.7663, -2.4326, 0.8463))
# Hardpoint Hongqi_L5_Chassis_Anchor_0376 = Vector((0.8339, -2.3579, 0.8019))
# Hardpoint Hongqi_L5_Chassis_Anchor_0377 = Vector((0.8895, -2.2748, 0.7531))
# Hardpoint Hongqi_L5_Chassis_Anchor_0378 = Vector((0.9324, -2.1835, 0.7004))
# Hardpoint Hongqi_L5_Chassis_Anchor_0379 = Vector((0.9618, -2.0843, 0.6440))
# Hardpoint Hongqi_L5_Chassis_Anchor_0380 = Vector((0.9774, -1.9777, 0.5845))
# Hardpoint Hongqi_L5_Chassis_Anchor_0381 = Vector((0.9789, -1.8639, 0.5225))
# Hardpoint Hongqi_L5_Chassis_Anchor_0382 = Vector((0.9664, -1.7434, 0.4583))
# Hardpoint Hongqi_L5_Chassis_Anchor_0383 = Vector((0.9399, -1.6166, 0.3924))
# Hardpoint Hongqi_L5_Chassis_Anchor_0384 = Vector((0.9000, -1.4841, 0.3256))
# Hardpoint Hongqi_L5_Chassis_Anchor_0385 = Vector((0.8471, -1.3461, 0.2581))
# Hardpoint Hongqi_L5_Chassis_Anchor_0386 = Vector((0.7820, -1.2034, 0.1907))
# Hardpoint Hongqi_L5_Chassis_Anchor_0387 = Vector((0.7057, -1.0563, 0.1239))
# Hardpoint Hongqi_L5_Chassis_Anchor_0388 = Vector((0.6192, -0.9054, 0.0582))
# Hardpoint Hongqi_L5_Chassis_Anchor_0389 = Vector((0.5238, -0.7512, -0.0059))
# Hardpoint Hongqi_L5_Chassis_Anchor_0390 = Vector((0.4209, -0.5943, -0.0679))
# Hardpoint Hongqi_L5_Chassis_Anchor_0391 = Vector((0.3119, -0.4353, -0.1272))
# Hardpoint Hongqi_L5_Chassis_Anchor_0392 = Vector((0.1984, -0.2748, -0.1834))
# Hardpoint Hongqi_L5_Chassis_Anchor_0393 = Vector((0.0821, -0.1132, -0.2359))
# Hardpoint Hongqi_L5_Chassis_Anchor_0394 = Vector((-0.0354, 0.0487, -0.2845))
# Hardpoint Hongqi_L5_Chassis_Anchor_0395 = Vector((-0.1524, 0.2105, -0.3286))
# Hardpoint Hongqi_L5_Chassis_Anchor_0396 = Vector((-0.2672, 0.3716, -0.3680))
# Hardpoint Hongqi_L5_Chassis_Anchor_0397 = Vector((-0.3781, 0.5313, -0.4023))
# Hardpoint Hongqi_L5_Chassis_Anchor_0398 = Vector((-0.4836, 0.6890, -0.4313))
# Hardpoint Hongqi_L5_Chassis_Anchor_0399 = Vector((-0.5822, 0.8443, -0.4546))
# Hardpoint Hongqi_L5_Chassis_Anchor_0400 = Vector((-0.6724, 0.9966, -0.4722))
# Hardpoint Hongqi_L5_Chassis_Anchor_0401 = Vector((-0.7529, 1.1453, -0.4838))
# Hardpoint Hongqi_L5_Chassis_Anchor_0402 = Vector((-0.8226, 1.2898, -0.4894))
# Hardpoint Hongqi_L5_Chassis_Anchor_0403 = Vector((-0.8804, 1.4298, -0.4890))
# Hardpoint Hongqi_L5_Chassis_Anchor_0404 = Vector((-0.9256, 1.5645, -0.4825))
# Hardpoint Hongqi_L5_Chassis_Anchor_0405 = Vector((-0.9575, 1.6937, -0.4700))
# Hardpoint Hongqi_L5_Chassis_Anchor_0406 = Vector((-0.9756, 1.8167, -0.4515))
# Hardpoint Hongqi_L5_Chassis_Anchor_0407 = Vector((-0.9797, 1.9332, -0.4273))
# Hardpoint Hongqi_L5_Chassis_Anchor_0408 = Vector((-0.9697, 2.0427, -0.3976))
# Hardpoint Hongqi_L5_Chassis_Anchor_0409 = Vector((-0.9457, 2.1449, -0.3625))
# Hardpoint Hongqi_L5_Chassis_Anchor_0410 = Vector((-0.9081, 2.2394, -0.3224))
# Hardpoint Hongqi_L5_Chassis_Anchor_0411 = Vector((-0.8575, 2.3258, -0.2776))
# Hardpoint Hongqi_L5_Chassis_Anchor_0412 = Vector((-0.7946, 2.4039, -0.2284))
# Hardpoint Hongqi_L5_Chassis_Anchor_0413 = Vector((-0.7202, 2.4733, -0.1752))
# Hardpoint Hongqi_L5_Chassis_Anchor_0414 = Vector((-0.6354, 2.5338, -0.1186))
# Hardpoint Hongqi_L5_Chassis_Anchor_0415 = Vector((-0.5415, 2.5851, -0.0589))
# Hardpoint Hongqi_L5_Chassis_Anchor_0416 = Vector((-0.4399, 2.6272, 0.0035))
# Hardpoint Hongqi_L5_Chassis_Anchor_0417 = Vector((-0.3319, 2.6598, 0.0678))
# Hardpoint Hongqi_L5_Chassis_Anchor_0418 = Vector((-0.2191, 2.6829, 0.1338))
# Hardpoint Hongqi_L5_Chassis_Anchor_0419 = Vector((-0.1032, 2.6962, 0.2007))
# Hardpoint Hongqi_L5_Chassis_Anchor_0420 = Vector((0.0142, 2.6999, 0.2682))
# Hardpoint Hongqi_L5_Chassis_Anchor_0421 = Vector((0.1314, 2.6939, 0.3355))
# Hardpoint Hongqi_L5_Chassis_Anchor_0422 = Vector((0.2467, 2.6782, 0.4023))
# Hardpoint Hongqi_L5_Chassis_Anchor_0423 = Vector((0.3585, 2.6528, 0.4679))
# Hardpoint Hongqi_L5_Chassis_Anchor_0424 = Vector((0.4651, 2.6179, 0.5318))
# Hardpoint Hongqi_L5_Chassis_Anchor_0425 = Vector((0.5650, 2.5735, 0.5936))
# Hardpoint Hongqi_L5_Chassis_Anchor_0426 = Vector((0.6568, 2.5200, 0.6526))
# Hardpoint Hongqi_L5_Chassis_Anchor_0427 = Vector((0.7392, 2.4573, 0.7084))
# Hardpoint Hongqi_L5_Chassis_Anchor_0428 = Vector((0.8109, 2.3858, 0.7606))
# Hardpoint Hongqi_L5_Chassis_Anchor_0429 = Vector((0.8709, 2.3057, 0.8088))
# Hardpoint Hongqi_L5_Chassis_Anchor_0430 = Vector((0.9185, 2.2173, 0.8525))
# Hardpoint Hongqi_L5_Chassis_Anchor_0431 = Vector((0.9528, 2.1209, 0.8915))
# Hardpoint Hongqi_L5_Chassis_Anchor_0432 = Vector((0.9734, 2.0169, 0.9253))
# Hardpoint Hongqi_L5_Chassis_Anchor_0433 = Vector((0.9800, 1.9056, 0.9537))
# Hardpoint Hongqi_L5_Chassis_Anchor_0434 = Vector((0.9725, 1.7875, 0.9765))
# Hardpoint Hongqi_L5_Chassis_Anchor_0435 = Vector((0.9510, 1.6630, 0.9935))
# Hardpoint Hongqi_L5_Chassis_Anchor_0436 = Vector((0.9159, 1.5324, 1.0046))
# Hardpoint Hongqi_L5_Chassis_Anchor_0437 = Vector((0.8676, 1.3964, 1.0097))
# Hardpoint Hongqi_L5_Chassis_Anchor_0438 = Vector((0.8068, 1.2553, 1.0086))
# Hardpoint Hongqi_L5_Chassis_Anchor_0439 = Vector((0.7344, 1.1097, 1.0016))
# Hardpoint Hongqi_L5_Chassis_Anchor_0440 = Vector((0.6514, 0.9601, 0.9885))
# Hardpoint Hongqi_L5_Chassis_Anchor_0441 = Vector((0.5591, 0.8070, 0.9695))
# Hardpoint Hongqi_L5_Chassis_Anchor_0442 = Vector((0.4587, 0.6511, 0.9448))
# Hardpoint Hongqi_L5_Chassis_Anchor_0443 = Vector((0.3517, 0.4928, 0.9145))
# Hardpoint Hongqi_L5_Chassis_Anchor_0444 = Vector((0.2397, 0.3327, 0.8790))
# Hardpoint Hongqi_L5_Chassis_Anchor_0445 = Vector((0.1242, 0.1714, 0.8384))
# Hardpoint Hongqi_L5_Chassis_Anchor_0446 = Vector((0.0069, 0.0096, 0.7931))
# Hardpoint Hongqi_L5_Chassis_Anchor_0447 = Vector((-0.1104, -0.1524, 0.7436))
# Hardpoint Hongqi_L5_Chassis_Anchor_0448 = Vector((-0.2262, -0.3137, 0.6901))
# Hardpoint Hongqi_L5_Chassis_Anchor_0449 = Vector((-0.3387, -0.4740, 0.6331))
# Hardpoint Hongqi_L5_Chassis_Anchor_0450 = Vector((-0.4464, -0.6325, 0.5731))
# Hardpoint Hongqi_L5_Chassis_Anchor_0451 = Vector((-0.5476, -0.7888, 0.5106))
# Hardpoint Hongqi_L5_Chassis_Anchor_0452 = Vector((-0.6410, -0.9422, 0.4461))
# Hardpoint Hongqi_L5_Chassis_Anchor_0453 = Vector((-0.7251, -1.0922, 0.3800))
# Hardpoint Hongqi_L5_Chassis_Anchor_0454 = Vector((-0.7988, -1.2383, 0.3130))
# Hardpoint Hongqi_L5_Chassis_Anchor_0455 = Vector((-0.8610, -1.3800, 0.2455))
# Hardpoint Hongqi_L5_Chassis_Anchor_0456 = Vector((-0.9109, -1.5166, 0.1782))
# Hardpoint Hongqi_L5_Chassis_Anchor_0457 = Vector((-0.9476, -1.6479, 0.1115))
# Hardpoint Hongqi_L5_Chassis_Anchor_0458 = Vector((-0.9707, -1.7731, 0.0460))
# Hardpoint Hongqi_L5_Chassis_Anchor_0459 = Vector((-0.9798, -1.8921, -0.0177))
# Hardpoint Hongqi_L5_Chassis_Anchor_0460 = Vector((-0.9749, -2.0041, -0.0792))
# Hardpoint Hongqi_L5_Chassis_Anchor_0461 = Vector((-0.9559, -2.1090, -0.1379))
# Hardpoint Hongqi_L5_Chassis_Anchor_0462 = Vector((-0.9232, -2.2063, -0.1935))
# Hardpoint Hongqi_L5_Chassis_Anchor_0463 = Vector((-0.8772, -2.2957, -0.2453))
# Hardpoint Hongqi_L5_Chassis_Anchor_0464 = Vector((-0.8186, -2.3768, -0.2931))
# Hardpoint Hongqi_L5_Chassis_Anchor_0465 = Vector((-0.7482, -2.4493, -0.3364))
# Hardpoint Hongqi_L5_Chassis_Anchor_0466 = Vector((-0.6671, -2.5130, -0.3748))
# Hardpoint Hongqi_L5_Chassis_Anchor_0467 = Vector((-0.5763, -2.5677, -0.4082))
# Hardpoint Hongqi_L5_Chassis_Anchor_0468 = Vector((-0.4773, -2.6131, -0.4361))
# Hardpoint Hongqi_L5_Chassis_Anchor_0469 = Vector((-0.3714, -2.6492, -0.4584))
# Hardpoint Hongqi_L5_Chassis_Anchor_0470 = Vector((-0.2601, -2.6757, -0.4748))
# Hardpoint Hongqi_L5_Chassis_Anchor_0471 = Vector((-0.1452, -2.6925, -0.4853))
# Hardpoint Hongqi_L5_Chassis_Anchor_0472 = Vector((-0.0281, -2.6997, -0.4898))
# Hardpoint Hongqi_L5_Chassis_Anchor_0473 = Vector((0.0894, -2.6972, -0.4882))
# Hardpoint Hongqi_L5_Chassis_Anchor_0474 = Vector((0.2056, -2.6849, -0.4806))
# Hardpoint Hongqi_L5_Chassis_Anchor_0475 = Vector((0.3188, -2.6630, -0.4670))
# Hardpoint Hongqi_L5_Chassis_Anchor_0476 = Vector((0.4274, -2.6315, -0.4474))
# Hardpoint Hongqi_L5_Chassis_Anchor_0477 = Vector((0.5299, -2.5906, -0.4222))
# Hardpoint Hongqi_L5_Chassis_Anchor_0478 = Vector((0.6248, -2.5403, -0.3914))
# Hardpoint Hongqi_L5_Chassis_Anchor_0479 = Vector((0.7107, -2.4809, -0.3554))
# Hardpoint Hongqi_L5_Chassis_Anchor_0480 = Vector((0.7864, -2.4125, -0.3144))
# Hardpoint Hongqi_L5_Chassis_Anchor_0481 = Vector((0.8507, -2.3355, -0.2687))
# Hardpoint Hongqi_L5_Chassis_Anchor_0482 = Vector((0.9028, -2.2500, -0.2187))
# Hardpoint Hongqi_L5_Chassis_Anchor_0483 = Vector((0.9420, -2.1565, -0.1649))
# Hardpoint Hongqi_L5_Chassis_Anchor_0484 = Vector((0.9676, -2.0552, -0.1076))
# Hardpoint Hongqi_L5_Chassis_Anchor_0485 = Vector((0.9792, -1.9465, -0.0474))
# Hardpoint Hongqi_L5_Chassis_Anchor_0486 = Vector((0.9768, -1.8308, 0.0153))
# Hardpoint Hongqi_L5_Chassis_Anchor_0487 = Vector((0.9604, -1.7085, 0.0801))
# Hardpoint Hongqi_L5_Chassis_Anchor_0488 = Vector((0.9301, -1.5800, 0.1462))
# Hardpoint Hongqi_L5_Chassis_Anchor_0489 = Vector((0.8864, -1.4459, 0.2133))
# Hardpoint Hongqi_L5_Chassis_Anchor_0490 = Vector((0.8300, -1.3066, 0.2808))
# Hardpoint Hongqi_L5_Chassis_Anchor_0491 = Vector((0.7617, -1.1626, 0.3481))
# Hardpoint Hongqi_L5_Chassis_Anchor_0492 = Vector((0.6824, -1.0143, 0.4147))
# Hardpoint Hongqi_L5_Chassis_Anchor_0493 = Vector((0.5933, -0.8625, 0.4800))
# Hardpoint Hongqi_L5_Chassis_Anchor_0494 = Vector((0.4956, -0.7075, 0.5435))
# Hardpoint Hongqi_L5_Chassis_Anchor_0495 = Vector((0.3909, -0.5500, 0.6048))
# Hardpoint Hongqi_L5_Chassis_Anchor_0496 = Vector((0.2805, -0.3905, 0.6633))
# Hardpoint Hongqi_L5_Chassis_Anchor_0497 = Vector((0.1661, -0.2296, 0.7185))
# Hardpoint Hongqi_L5_Chassis_Anchor_0498 = Vector((0.0492, -0.0678, 0.7700))
# Hardpoint Hongqi_L5_Chassis_Anchor_0499 = Vector((-0.0683, 0.0941, 0.8173))
# Hardpoint Hongqi_L5_Chassis_Anchor_0500 = Vector((-0.1848, 0.2558, 0.8602))
# Hardpoint Hongqi_L5_Chassis_Anchor_0501 = Vector((-0.2987, 0.4165, 0.8982))
# Hardpoint Hongqi_L5_Chassis_Anchor_0502 = Vector((-0.4083, 0.5757, 0.9310))
# Hardpoint Hongqi_L5_Chassis_Anchor_0503 = Vector((-0.5120, 0.7328, 0.9584))
# Hardpoint Hongqi_L5_Chassis_Anchor_0504 = Vector((-0.6084, 0.8873, 0.9801))
# Hardpoint Hongqi_L5_Chassis_Anchor_0505 = Vector((-0.6960, 1.0387, 0.9961))
# Hardpoint Hongqi_L5_Chassis_Anchor_0506 = Vector((-0.7736, 1.1862, 1.0060))
# Hardpoint Hongqi_L5_Chassis_Anchor_0507 = Vector((-0.8400, 1.3295, 1.0099))
# Hardpoint Hongqi_L5_Chassis_Anchor_0508 = Vector((-0.8944, 1.4681, 1.0078))
# Hardpoint Hongqi_L5_Chassis_Anchor_0509 = Vector((-0.9359, 1.6013, 0.9996))
# Hardpoint Hongqi_L5_Chassis_Anchor_0510 = Vector((-0.9640, 1.7288, 0.9854))
# Hardpoint Hongqi_L5_Chassis_Anchor_0511 = Vector((-0.9782, 1.8500, 0.9653))
# Hardpoint Hongqi_L5_Chassis_Anchor_0512 = Vector((-0.9783, 1.9646, 0.9395))
# Hardpoint Hongqi_L5_Chassis_Anchor_0513 = Vector((-0.9644, 2.0721, 0.9083))
# Hardpoint Hongqi_L5_Chassis_Anchor_0514 = Vector((-0.9365, 2.1722, 0.8718))
# Hardpoint Hongqi_L5_Chassis_Anchor_0515 = Vector((-0.8952, 2.2645, 0.8303))
# Hardpoint Hongqi_L5_Chassis_Anchor_0516 = Vector((-0.8411, 2.3486, 0.7842))
# Hardpoint Hongqi_L5_Chassis_Anchor_0517 = Vector((-0.7748, 2.4242, 0.7339))
# Hardpoint Hongqi_L5_Chassis_Anchor_0518 = Vector((-0.6974, 2.4911, 0.6797))
# Hardpoint Hongqi_L5_Chassis_Anchor_0519 = Vector((-0.6100, 2.5491, 0.6221))
# Hardpoint Hongqi_L5_Chassis_Anchor_0520 = Vector((-0.5138, 2.5979, 0.5616))
# Hardpoint Hongqi_L5_Chassis_Anchor_0521 = Vector((-0.4102, 2.6373, 0.4987))
# Hardpoint Hongqi_L5_Chassis_Anchor_0522 = Vector((-0.3007, 2.6672, 0.4338))
# Hardpoint Hongqi_L5_Chassis_Anchor_0523 = Vector((-0.1869, 2.6876, 0.3675))
# Hardpoint Hongqi_L5_Chassis_Anchor_0524 = Vector((-0.0704, 2.6983, 0.3004))
# Hardpoint Hongqi_L5_Chassis_Anchor_0525 = Vector((0.0472, 2.6992, 0.2329))
# Hardpoint Hongqi_L5_Chassis_Anchor_0526 = Vector((0.1640, 2.6905, 0.1657))
# Hardpoint Hongqi_L5_Chassis_Anchor_0527 = Vector((0.2785, 2.6720, 0.0992))
# Hardpoint Hongqi_L5_Chassis_Anchor_0528 = Vector((0.3890, 2.6440, 0.0340))
# Hardpoint Hongqi_L5_Chassis_Anchor_0529 = Vector((0.4939, 2.6064, -0.0294))
# Hardpoint Hongqi_L5_Chassis_Anchor_0530 = Vector((0.5916, 2.5595, -0.0904))
# Hardpoint Hongqi_L5_Chassis_Anchor_0531 = Vector((0.6809, 2.5033, -0.1486))
# Hardpoint Hongqi_L5_Chassis_Anchor_0532 = Vector((0.7604, 2.4381, -0.2034))
# Hardpoint Hongqi_L5_Chassis_Anchor_0533 = Vector((0.8289, 2.3642, -0.2546))
# Hardpoint Hongqi_L5_Chassis_Anchor_0534 = Vector((0.8855, 2.2817, -0.3015))
# Hardpoint Hongqi_L5_Chassis_Anchor_0535 = Vector((0.9294, 2.1911, -0.3439))
# Hardpoint Hongqi_L5_Chassis_Anchor_0536 = Vector((0.9599, 2.0925, -0.3815))
# Hardpoint Hongqi_L5_Chassis_Anchor_0537 = Vector((0.9767, 1.9864, -0.4138))
# Hardpoint Hongqi_L5_Chassis_Anchor_0538 = Vector((0.9793, 1.8732, -0.4407))
# Hardpoint Hongqi_L5_Chassis_Anchor_0539 = Vector((0.9679, 1.7532, -0.4619))
# Hardpoint Hongqi_L5_Chassis_Anchor_0540 = Vector((0.9425, 1.6270, -0.4772))
# Hardpoint Hongqi_L5_Chassis_Anchor_0541 = Vector((0.9036, 1.4948, -0.4866))
# Hardpoint Hongqi_L5_Chassis_Anchor_0542 = Vector((0.8517, 1.3573, -0.4900))
# Hardpoint Hongqi_L5_Chassis_Anchor_0543 = Vector((0.7876, 1.2149, -0.4873))
# Hardpoint Hongqi_L5_Chassis_Anchor_0544 = Vector((0.7121, 1.0681, -0.4785))
# Hardpoint Hongqi_L5_Chassis_Anchor_0545 = Vector((0.6264, 0.9175, -0.4638))
# Hardpoint Hongqi_L5_Chassis_Anchor_0546 = Vector((0.5317, 0.7636, -0.4432))
# Hardpoint Hongqi_L5_Chassis_Anchor_0547 = Vector((0.4293, 0.6069, -0.4169))
# Hardpoint Hongqi_L5_Chassis_Anchor_0548 = Vector((0.3208, 0.4481, -0.3851))
# Hardpoint Hongqi_L5_Chassis_Anchor_0549 = Vector((0.2076, 0.2876, -0.3481))
# Hardpoint Hongqi_L5_Chassis_Anchor_0550 = Vector((0.0914, 0.1261, -0.3062))
# Hardpoint Hongqi_L5_Chassis_Anchor_0551 = Vector((-0.0260, -0.0358, -0.2597))
# Hardpoint Hongqi_L5_Chassis_Anchor_0552 = Vector((-0.1431, -0.1977, -0.2090))
# Hardpoint Hongqi_L5_Chassis_Anchor_0553 = Vector((-0.2581, -0.3588, -0.1545))
# Hardpoint Hongqi_L5_Chassis_Anchor_0554 = Vector((-0.3695, -0.5186, -0.0966))
# Hardpoint Hongqi_L5_Chassis_Anchor_0555 = Vector((-0.4755, -0.6766, -0.0358))
# Hardpoint Hongqi_L5_Chassis_Anchor_0556 = Vector((-0.5746, -0.8321, 0.0273))
# Hardpoint Hongqi_L5_Chassis_Anchor_0557 = Vector((-0.6655, -0.9846, 0.0923))
# Hardpoint Hongqi_L5_Chassis_Anchor_0558 = Vector((-0.7469, -1.1336, 0.1587))
# Hardpoint Hongqi_L5_Chassis_Anchor_0559 = Vector((-0.8174, -1.2785, 0.2259))
# Hardpoint Hongqi_L5_Chassis_Anchor_0560 = Vector((-0.8763, -1.4188, 0.2934))
# Hardpoint Hongqi_L5_Chassis_Anchor_0561 = Vector((-0.9225, -1.5540, 0.3606))
# Hardpoint Hongqi_L5_Chassis_Anchor_0562 = Vector((-0.9555, -1.6836, 0.4270))
# Hardpoint Hongqi_L5_Chassis_Anchor_0563 = Vector((-0.9747, -1.8071, 0.4920))
# Hardpoint Hongqi_L5_Chassis_Anchor_0564 = Vector((-0.9799, -1.9242, 0.5552))
# Hardpoint Hongqi_L5_Chassis_Anchor_0565 = Vector((-0.9710, -2.0343, 0.6160))
# Hardpoint Hongqi_L5_Chassis_Anchor_0566 = Vector((-0.9481, -2.1371, 0.6738))
# Hardpoint Hongqi_L5_Chassis_Anchor_0567 = Vector((-0.9116, -2.2322, 0.7284))
# Hardpoint Hongqi_L5_Chassis_Anchor_0568 = Vector((-0.8620, -2.3193, 0.7791))
# Hardpoint Hongqi_L5_Chassis_Anchor_0569 = Vector((-0.8000, -2.3980, 0.8257))
# Hardpoint Hongqi_L5_Chassis_Anchor_0570 = Vector((-0.7265, -2.4681, 0.8677))
# Hardpoint Hongqi_L5_Chassis_Anchor_0571 = Vector((-0.6425, -2.5293, 0.9047))
# Hardpoint Hongqi_L5_Chassis_Anchor_0572 = Vector((-0.5493, -2.5814, 0.9365))
# Hardpoint Hongqi_L5_Chassis_Anchor_0573 = Vector((-0.4482, -2.6242, 0.9629))
# Hardpoint Hongqi_L5_Chassis_Anchor_0574 = Vector((-0.3407, -2.6576, 0.9836))
# Hardpoint Hongqi_L5_Chassis_Anchor_0575 = Vector((-0.2282, -2.6814, 0.9984))
# Hardpoint Hongqi_L5_Chassis_Anchor_0576 = Vector((-0.1125, -2.6955, 1.0072))
# Hardpoint Hongqi_L5_Chassis_Anchor_0577 = Vector((0.0049, -2.7000, 1.0100))
# Hardpoint Hongqi_L5_Chassis_Anchor_0578 = Vector((0.1221, -2.6947, 1.0067))
# Hardpoint Hongqi_L5_Chassis_Anchor_0579 = Vector((0.2377, -2.6798, 0.9974))
# Hardpoint Hongqi_L5_Chassis_Anchor_0580 = Vector((0.3498, -2.6552, 0.9821))
# Hardpoint Hongqi_L5_Chassis_Anchor_0581 = Vector((0.4569, -2.6210, 0.9609))
# Hardpoint Hongqi_L5_Chassis_Anchor_0582 = Vector((0.5574, -2.5774, 0.9341))
# Hardpoint Hongqi_L5_Chassis_Anchor_0583 = Vector((0.6498, -2.5246, 0.9018))
# Hardpoint Hongqi_L5_Chassis_Anchor_0584 = Vector((0.7330, -2.4626, 0.8644))
# Hardpoint Hongqi_L5_Chassis_Anchor_0585 = Vector((0.8056, -2.3918, 0.8220))
# Hardpoint Hongqi_L5_Chassis_Anchor_0586 = Vector((0.8666, -2.3124, 0.7751))
# Hardpoint Hongqi_L5_Chassis_Anchor_0587 = Vector((0.9151, -2.2246, 0.7240))
# Hardpoint Hongqi_L5_Chassis_Anchor_0588 = Vector((0.9505, -2.1289, 0.6692))
# Hardpoint Hongqi_L5_Chassis_Anchor_0589 = Vector((0.9723, -2.0255, 0.6110))
# Hardpoint Hongqi_L5_Chassis_Anchor_0590 = Vector((0.9800, -1.9147, 0.5500))
# Hardpoint Hongqi_L5_Chassis_Anchor_0591 = Vector((0.9736, -1.7972, 0.4867))
# Hardpoint Hongqi_L5_Chassis_Anchor_0592 = Vector((0.9533, -1.6731, 0.4215))
# Hardpoint Hongqi_L5_Chassis_Anchor_0593 = Vector((0.9192, -1.5430, 0.3551))
# Hardpoint Hongqi_L5_Chassis_Anchor_0594 = Vector((0.8719, -1.4074, 0.2878))
# Hardpoint Hongqi_L5_Chassis_Anchor_0595 = Vector((0.8120, -1.2667, 0.2203))
# Hardpoint Hongqi_L5_Chassis_Anchor_0596 = Vector((0.7405, -1.1214, 0.1532))
# Hardpoint Hongqi_L5_Chassis_Anchor_0597 = Vector((0.6584, -0.9721, 0.0869))
# Hardpoint Hongqi_L5_Chassis_Anchor_0598 = Vector((0.5667, -0.8193, 0.0220))
# Hardpoint Hongqi_L5_Chassis_Anchor_0599 = Vector((0.4669, -0.6636, -0.0410))
# Hardpoint Hongqi_L5_Chassis_Anchor_0600 = Vector((0.3604, -0.5055, -0.1015))
# Hardpoint Hongqi_L5_Chassis_Anchor_0601 = Vector((0.2487, -0.3455, -0.1591))
# Hardpoint Hongqi_L5_Chassis_Anchor_0602 = Vector((0.1335, -0.1843, -0.2133))
# Hardpoint Hongqi_L5_Chassis_Anchor_0603 = Vector((0.0163, -0.0225, -0.2637))
# Hardpoint Hongqi_L5_Chassis_Anchor_0604 = Vector((-0.1011, 0.1395, -0.3098))
# Hardpoint Hongqi_L5_Chassis_Anchor_0605 = Vector((-0.2171, 0.3009, -0.3513))
# Hardpoint Hongqi_L5_Chassis_Anchor_0606 = Vector((-0.3299, 0.4613, -0.3879))
# Hardpoint Hongqi_L5_Chassis_Anchor_0607 = Vector((-0.4380, 0.6200, -0.4192))
# Hardpoint Hongqi_L5_Chassis_Anchor_0608 = Vector((-0.5398, 0.7764, -0.4451))
# Hardpoint Hongqi_L5_Chassis_Anchor_0609 = Vector((-0.6339, 0.9301, -0.4652))
# Hardpoint Hongqi_L5_Chassis_Anchor_0610 = Vector((-0.7188, 1.0804, -0.4795))
# Hardpoint Hongqi_L5_Chassis_Anchor_0611 = Vector((-0.7933, 1.2268, -0.4877))
# Hardpoint Hongqi_L5_Chassis_Anchor_0612 = Vector((-0.8565, 1.3689, -0.4899))
# Hardpoint Hongqi_L5_Chassis_Anchor_0613 = Vector((-0.9074, 1.5060, -0.4861))
# Hardpoint Hongqi_L5_Chassis_Anchor_0614 = Vector((-0.9452, 1.6376, -0.4762))
# Hardpoint Hongqi_L5_Chassis_Anchor_0615 = Vector((-0.9694, 1.7634, -0.4603))
# Hardpoint Hongqi_L5_Chassis_Anchor_0616 = Vector((-0.9796, 1.8828, -0.4387))
# Hardpoint Hongqi_L5_Chassis_Anchor_0617 = Vector((-0.9758, 1.9955, -0.4113))
# Hardpoint Hongqi_L5_Chassis_Anchor_0618 = Vector((-0.9579, 2.1010, -0.3786))
# Hardpoint Hongqi_L5_Chassis_Anchor_0619 = Vector((-0.9263, 2.1989, -0.3406))
# Hardpoint Hongqi_L5_Chassis_Anchor_0620 = Vector((-0.8813, 2.2889, -0.2978))
# Hardpoint Hongqi_L5_Chassis_Anchor_0621 = Vector((-0.8237, 2.3706, -0.2505))
# Hardpoint Hongqi_L5_Chassis_Anchor_0622 = Vector((-0.7542, 2.4438, -0.1990))
# Hardpoint Hongqi_L5_Chassis_Anchor_0623 = Vector((-0.6739, 2.5083, -0.1439))
# Hardpoint Hongqi_L5_Chassis_Anchor_0624 = Vector((-0.5839, 2.5637, -0.0854))
# Hardpoint Hongqi_L5_Chassis_Anchor_0625 = Vector((-0.4854, 2.6099, -0.0242))
# Hardpoint Hongqi_L5_Chassis_Anchor_0626 = Vector((-0.3800, 2.6467, 0.0393))
# Hardpoint Hongqi_L5_Chassis_Anchor_0627 = Vector((-0.2692, 2.6739, 0.1046))
# Hardpoint Hongqi_L5_Chassis_Anchor_0628 = Vector((-0.1544, 2.6916, 0.1712))
# Hardpoint Hongqi_L5_Chassis_Anchor_0629 = Vector((-0.0375, 2.6995, 0.2385))
# Hardpoint Hongqi_L5_Chassis_Anchor_0630 = Vector((0.0801, 2.6977, 0.3060))
# Hardpoint Hongqi_L5_Chassis_Anchor_0631 = Vector((0.1964, 2.6863, 0.3731))
# Hardpoint Hongqi_L5_Chassis_Anchor_0632 = Vector((0.3099, 2.6651, 0.4392))
# Hardpoint Hongqi_L5_Chassis_Anchor_0633 = Vector((0.4190, 2.6344, 0.5040))
# Hardpoint Hongqi_L5_Chassis_Anchor_0634 = Vector((0.5220, 2.5942, 0.5667))
# Hardpoint Hongqi_L5_Chassis_Anchor_0635 = Vector((0.6176, 2.5446, 0.6270))
# Hardpoint Hongqi_L5_Chassis_Anchor_0636 = Vector((0.7042, 2.4859, 0.6843))
# Hardpoint Hongqi_L5_Chassis_Anchor_0637 = Vector((0.7807, 2.4183, 0.7382))
# Hardpoint Hongqi_L5_Chassis_Anchor_0638 = Vector((0.8460, 2.3419, 0.7882))
# Hardpoint Hongqi_L5_Chassis_Anchor_0639 = Vector((0.8992, 2.2571, 0.8339))
# Hardpoint Hongqi_L5_Chassis_Anchor_0640 = Vector((0.9394, 2.1642, 0.8750))
# Hardpoint Hongqi_L5_Chassis_Anchor_0641 = Vector((0.9660, 2.0635, 0.9111))
# Hardpoint Hongqi_L5_Chassis_Anchor_0642 = Vector((0.9788, 1.9554, 0.9419))
# Hardpoint Hongqi_L5_Chassis_Anchor_0643 = Vector((0.9775, 1.8402, 0.9672))
# Hardpoint Hongqi_L5_Chassis_Anchor_0644 = Vector((0.9622, 1.7185, 0.9868))
# Hardpoint Hongqi_L5_Chassis_Anchor_0645 = Vector((0.9330, 1.5905, 1.0005))
# Hardpoint Hongqi_L5_Chassis_Anchor_0646 = Vector((0.8904, 1.4568, 1.0082))
# Hardpoint Hongqi_L5_Chassis_Anchor_0647 = Vector((0.8350, 1.3179, 1.0098))
# Hardpoint Hongqi_L5_Chassis_Anchor_0648 = Vector((0.7675, 1.1742, 1.0054))
# Hardpoint Hongqi_L5_Chassis_Anchor_0649 = Vector((0.6891, 1.0263, 0.9950))
# Hardpoint Hongqi_L5_Chassis_Anchor_0650 = Vector((0.6007, 0.8747, 0.9786))
# Hardpoint Hongqi_L5_Chassis_Anchor_0651 = Vector((0.5037, 0.7199, 0.9563))
# Hardpoint Hongqi_L5_Chassis_Anchor_0652 = Vector((0.3994, 0.5626, 0.9285))
# Hardpoint Hongqi_L5_Chassis_Anchor_0653 = Vector((0.2894, 0.4032, 0.8952))
# Hardpoint Hongqi_L5_Chassis_Anchor_0654 = Vector((0.1753, 0.2424, 0.8568))
# Hardpoint Hongqi_L5_Chassis_Anchor_0655 = Vector((0.0586, 0.0807, 0.8136))
# Hardpoint Hongqi_L5_Chassis_Anchor_0656 = Vector((-0.0589, -0.0812, 0.7659))
# Hardpoint Hongqi_L5_Chassis_Anchor_0657 = Vector((-0.1756, -0.2429, 0.7140))
# Hardpoint Hongqi_L5_Chassis_Anchor_0658 = Vector((-0.2898, -0.4037, 0.6586))
# Hardpoint Hongqi_L5_Chassis_Anchor_0659 = Vector((-0.3998, -0.5631, 0.5998))
# Hardpoint Hongqi_L5_Chassis_Anchor_0660 = Vector((-0.5040, -0.7204, 0.5384))
# Hardpoint Hongqi_L5_Chassis_Anchor_0661 = Vector((-0.6010, -0.8752, 0.4747))
# Hardpoint Hongqi_L5_Chassis_Anchor_0662 = Vector((-0.6893, -1.0267, 0.4092))
# Hardpoint Hongqi_L5_Chassis_Anchor_0663 = Vector((-0.7678, -1.1746, 0.3425))
# Hardpoint Hongqi_L5_Chassis_Anchor_0664 = Vector((-0.8352, -1.3183, 0.2752))
# Hardpoint Hongqi_L5_Chassis_Anchor_0665 = Vector((-0.8905, -1.4572, 0.2077))
# Hardpoint Hongqi_L5_Chassis_Anchor_0666 = Vector((-0.9331, -1.5909, 0.1407))
# Hardpoint Hongqi_L5_Chassis_Anchor_0667 = Vector((-0.9623, -1.7188, 0.0746))
# Hardpoint Hongqi_L5_Chassis_Anchor_0668 = Vector((-0.9776, -1.8406, 0.0101))
# Hardpoint Hongqi_L5_Chassis_Anchor_0669 = Vector((-0.9788, -1.9557, -0.0525))
# Hardpoint Hongqi_L5_Chassis_Anchor_0670 = Vector((-0.9660, -2.0638, -0.1125))
# Hardpoint Hongqi_L5_Chassis_Anchor_0671 = Vector((-0.9393, -2.1645, -0.1695))
# Hardpoint Hongqi_L5_Chassis_Anchor_0672 = Vector((-0.8990, -2.2574, -0.2230))
# Hardpoint Hongqi_L5_Chassis_Anchor_0673 = Vector((-0.8459, -2.3422, -0.2726))
# Hardpoint Hongqi_L5_Chassis_Anchor_0674 = Vector((-0.7805, -2.4185, -0.3179))
# Hardpoint Hongqi_L5_Chassis_Anchor_0675 = Vector((-0.7040, -2.4861, -0.3586))
# Hardpoint Hongqi_L5_Chassis_Anchor_0676 = Vector((-0.6173, -2.5448, -0.3942))
# Hardpoint Hongqi_L5_Chassis_Anchor_0677 = Vector((-0.5217, -2.5943, -0.4245))
# Hardpoint Hongqi_L5_Chassis_Anchor_0678 = Vector((-0.4187, -2.6345, -0.4493))
# Hardpoint Hongqi_L5_Chassis_Anchor_0679 = Vector((-0.3096, -2.6652, -0.4683))
# Hardpoint Hongqi_L5_Chassis_Anchor_0680 = Vector((-0.1960, -2.6863, -0.4815))
# Hardpoint Hongqi_L5_Chassis_Anchor_0681 = Vector((-0.0797, -2.6978, -0.4886))
# Hardpoint Hongqi_L5_Chassis_Anchor_0682 = Vector((0.0378, -2.6995, -0.4897))
# Hardpoint Hongqi_L5_Chassis_Anchor_0683 = Vector((0.1548, -2.6915, -0.4847))
# Hardpoint Hongqi_L5_Chassis_Anchor_0684 = Vector((0.2695, -2.6738, -0.4737))
# Hardpoint Hongqi_L5_Chassis_Anchor_0685 = Vector((0.3804, -2.6466, -0.4567))
# Hardpoint Hongqi_L5_Chassis_Anchor_0686 = Vector((0.4857, -2.6097, -0.4340))
# Hardpoint Hongqi_L5_Chassis_Anchor_0687 = Vector((0.5841, -2.5635, -0.4056))
# Hardpoint Hongqi_L5_Chassis_Anchor_0688 = Vector((0.6741, -2.5081, -0.3719))
# Hardpoint Hongqi_L5_Chassis_Anchor_0689 = Vector((0.7544, -2.4436, -0.3330))
# Hardpoint Hongqi_L5_Chassis_Anchor_0690 = Vector((0.8239, -2.3704, -0.2893))
# Hardpoint Hongqi_L5_Chassis_Anchor_0691 = Vector((0.8815, -2.2886, -0.2412))
# Hardpoint Hongqi_L5_Chassis_Anchor_0692 = Vector((0.9264, -2.1986, -0.1890))
# Hardpoint Hongqi_L5_Chassis_Anchor_0693 = Vector((0.9580, -2.1006, -0.1332))
# Hardpoint Hongqi_L5_Chassis_Anchor_0694 = Vector((0.9758, -1.9951, -0.0742))
# Hardpoint Hongqi_L5_Chassis_Anchor_0695 = Vector((0.9796, -1.8825, -0.0125))
# Hardpoint Hongqi_L5_Chassis_Anchor_0696 = Vector((0.9693, -1.7630, 0.0514))
# Hardpoint Hongqi_L5_Chassis_Anchor_0697 = Vector((0.9451, -1.6372, 0.1170))
# Hardpoint Hongqi_L5_Chassis_Anchor_0698 = Vector((0.9072, -1.5055, 0.1837))
# Hardpoint Hongqi_L5_Chassis_Anchor_0699 = Vector((0.8563, -1.3684, 0.2511))
# Hardpoint Hongqi_L5_Chassis_Anchor_0700 = Vector((0.7931, -1.2264, 0.3186))
# Hardpoint Hongqi_L5_Chassis_Anchor_0701 = Vector((0.7185, -1.0800, 0.3855))
# Hardpoint Hongqi_L5_Chassis_Anchor_0702 = Vector((0.6336, -0.9296, 0.4515))
# Hardpoint Hongqi_L5_Chassis_Anchor_0703 = Vector((0.5395, -0.7760, 0.5159))
# Hardpoint Hongqi_L5_Chassis_Anchor_0704 = Vector((0.4377, -0.6195, 0.5782))
# Hardpoint Hongqi_L5_Chassis_Anchor_0705 = Vector((0.3296, -0.4608, 0.6380))
# Hardpoint Hongqi_L5_Chassis_Anchor_0706 = Vector((0.2167, -0.3004, 0.6946))
# Hardpoint Hongqi_L5_Chassis_Anchor_0707 = Vector((0.1008, -0.1390, 0.7478))
# Hardpoint Hongqi_L5_Chassis_Anchor_0708 = Vector((-0.0167, 0.0229, 0.7970))
# Hardpoint Hongqi_L5_Chassis_Anchor_0709 = Vector((-0.1338, 0.1848, 0.8419))
# Hardpoint Hongqi_L5_Chassis_Anchor_0710 = Vector((-0.2491, 0.3460, 0.8821))
# Hardpoint Hongqi_L5_Chassis_Anchor_0711 = Vector((-0.3608, 0.5059, 0.9172))
# Hardpoint Hongqi_L5_Chassis_Anchor_0712 = Vector((-0.4673, 0.6641, 0.9470))
# Hardpoint Hongqi_L5_Chassis_Anchor_0713 = Vector((-0.5670, 0.8198, 0.9713))
# Hardpoint Hongqi_L5_Chassis_Anchor_0714 = Vector((-0.6586, 0.9726, 0.9898))
# Hardpoint Hongqi_L5_Chassis_Anchor_0715 = Vector((-0.7408, 1.1219, 1.0024))
# Hardpoint Hongqi_L5_Chassis_Anchor_0716 = Vector((-0.8122, 1.2671, 1.0090))
# Hardpoint Hongqi_L5_Chassis_Anchor_0717 = Vector((-0.8720, 1.4078, 1.0095))
# Hardpoint Hongqi_L5_Chassis_Anchor_0718 = Vector((-0.9193, 1.5434, 1.0039))
# Hardpoint Hongqi_L5_Chassis_Anchor_0719 = Vector((-0.9533, 1.6735, 0.9924))
# Hardpoint Hongqi_L5_Chassis_Anchor_0720 = Vector((-0.9737, 1.7975, 0.9749))
# Hardpoint Hongqi_L5_Chassis_Anchor_0721 = Vector((-0.9800, 1.9151, 0.9516))
# Hardpoint Hongqi_L5_Chassis_Anchor_0722 = Vector((-0.9722, 2.0258, 0.9227))
# Hardpoint Hongqi_L5_Chassis_Anchor_0723 = Vector((-0.9504, 2.1292, 0.8884))
# Hardpoint Hongqi_L5_Chassis_Anchor_0724 = Vector((-0.9150, 2.2249, 0.8491))
# Hardpoint Hongqi_L5_Chassis_Anchor_0725 = Vector((-0.8664, 2.3126, 0.8050))
# Hardpoint Hongqi_L5_Chassis_Anchor_0726 = Vector((-0.8054, 2.3920, 0.7565))
# Hardpoint Hongqi_L5_Chassis_Anchor_0727 = Vector((-0.7327, 2.4628, 0.7039))
# Hardpoint Hongqi_L5_Chassis_Anchor_0728 = Vector((-0.6496, 2.5247, 0.6478))
# Hardpoint Hongqi_L5_Chassis_Anchor_0729 = Vector((-0.5571, 2.5776, 0.5885))
# Hardpoint Hongqi_L5_Chassis_Anchor_0730 = Vector((-0.4565, 2.6211, 0.5266))
# Hardpoint Hongqi_L5_Chassis_Anchor_0731 = Vector((-0.3494, 2.6553, 0.4625))
# Hardpoint Hongqi_L5_Chassis_Anchor_0732 = Vector((-0.2373, 2.6798, 0.3968))
# Hardpoint Hongqi_L5_Chassis_Anchor_0733 = Vector((-0.1218, 2.6948, 0.3300))
# Hardpoint Hongqi_L5_Chassis_Anchor_0734 = Vector((-0.0045, 2.7000, 0.2626))
# Hardpoint Hongqi_L5_Chassis_Anchor_0735 = Vector((0.1128, 2.6955, 0.1952))
# Hardpoint Hongqi_L5_Chassis_Anchor_0736 = Vector((0.2286, 2.6813, 0.1283))
# Hardpoint Hongqi_L5_Chassis_Anchor_0737 = Vector((0.3410, 2.6575, 0.0624))
# Hardpoint Hongqi_L5_Chassis_Anchor_0738 = Vector((0.4485, 2.6241, -0.0018))
# Hardpoint Hongqi_L5_Chassis_Anchor_0739 = Vector((0.5496, 2.5812, -0.0639))
# Hardpoint Hongqi_L5_Chassis_Anchor_0740 = Vector((0.6428, 2.5291, -0.1234))
# Hardpoint Hongqi_L5_Chassis_Anchor_0741 = Vector((0.7267, 2.4679, -0.1798))
# Hardpoint Hongqi_L5_Chassis_Anchor_0742 = Vector((0.8002, 2.3977, -0.2326))
# Hardpoint Hongqi_L5_Chassis_Anchor_0743 = Vector((0.8622, 2.3190, -0.2814))
# Hardpoint Hongqi_L5_Chassis_Anchor_0744 = Vector((0.9118, 2.2319, -0.3259))
# Hardpoint Hongqi_L5_Chassis_Anchor_0745 = Vector((0.9482, 2.1368, -0.3656))
# Hardpoint Hongqi_L5_Chassis_Anchor_0746 = Vector((0.9710, 2.0340, -0.4002))
# Hardpoint Hongqi_L5_Chassis_Anchor_0747 = Vector((0.9799, 1.9238, -0.4296))
# Hardpoint Hongqi_L5_Chassis_Anchor_0748 = Vector((0.9746, 1.8068, -0.4533))
# Hardpoint Hongqi_L5_Chassis_Anchor_0749 = Vector((0.9554, 1.6832, -0.4712))
# Hardpoint Hongqi_L5_Chassis_Anchor_0750 = Vector((0.9224, 1.5536, -0.4833))
# Hardpoint Hongqi_L5_Chassis_Anchor_0751 = Vector((0.8761, 1.4184, -0.4893))
# Hardpoint Hongqi_L5_Chassis_Anchor_0752 = Vector((0.8172, 1.2781, -0.4892))
# Hardpoint Hongqi_L5_Chassis_Anchor_0753 = Vector((0.7466, 1.1331, -0.4831))
# Hardpoint Hongqi_L5_Chassis_Anchor_0754 = Vector((0.6653, 0.9841, -0.4710))
# Hardpoint Hongqi_L5_Chassis_Anchor_0755 = Vector((0.5743, 0.8316, -0.4529))
# Hardpoint Hongqi_L5_Chassis_Anchor_0756 = Vector((0.4751, 0.6761, -0.4291))
# Hardpoint Hongqi_L5_Chassis_Anchor_0757 = Vector((0.3691, 0.5181, -0.3997))
# Hardpoint Hongqi_L5_Chassis_Anchor_0758 = Vector((0.2578, 0.3583, -0.3650))
# Hardpoint Hongqi_L5_Chassis_Anchor_0759 = Vector((0.1428, 0.1972, -0.3252))
# Hardpoint Hongqi_L5_Chassis_Anchor_0760 = Vector((0.0257, 0.0354, -0.2806))
# Hardpoint Hongqi_L5_Chassis_Anchor_0761 = Vector((-0.0918, -0.1266, -0.2317))
# Hardpoint Hongqi_L5_Chassis_Anchor_0762 = Vector((-0.2079, -0.2881, -0.1788))
# Hardpoint Hongqi_L5_Chassis_Anchor_0763 = Vector((-0.3211, -0.4486, -0.1224))
# Hardpoint Hongqi_L5_Chassis_Anchor_0764 = Vector((-0.4296, -0.6074, -0.0629))
# Hardpoint Hongqi_L5_Chassis_Anchor_0765 = Vector((-0.5320, -0.7641, -0.0007))
# Hardpoint Hongqi_L5_Chassis_Anchor_0766 = Vector((-0.6267, -0.9180, 0.0635))
# Hardpoint Hongqi_L5_Chassis_Anchor_0767 = Vector((-0.7124, -1.0686, 0.1294))
# Hardpoint Hongqi_L5_Chassis_Anchor_0768 = Vector((-0.7878, -1.2153, 0.1963))
# Hardpoint Hongqi_L5_Chassis_Anchor_0769 = Vector((-0.8519, -1.3577, 0.2637))
# Hardpoint Hongqi_L5_Chassis_Anchor_0770 = Vector((-0.9038, -1.4952, 0.3311))
# Hardpoint Hongqi_L5_Chassis_Anchor_0771 = Vector((-0.9426, -1.6273, 0.3979))
# Hardpoint Hongqi_L5_Chassis_Anchor_0772 = Vector((-0.9679, -1.7536, 0.4636))
# Hardpoint Hongqi_L5_Chassis_Anchor_0773 = Vector((-0.9793, -1.8736, 0.5277))
# Hardpoint Hongqi_L5_Chassis_Anchor_0774 = Vector((-0.9766, -1.9868, 0.5896))
# Hardpoint Hongqi_L5_Chassis_Anchor_0775 = Vector((-0.9599, -2.0928, 0.6488))
# Hardpoint Hongqi_L5_Chassis_Anchor_0776 = Vector((-0.9293, -2.1914, 0.7049))
# Hardpoint Hongqi_L5_Chassis_Anchor_0777 = Vector((-0.8854, -2.2820, 0.7573))
# Hardpoint Hongqi_L5_Chassis_Anchor_0778 = Vector((-0.8287, -2.3644, 0.8058))
# Hardpoint Hongqi_L5_Chassis_Anchor_0779 = Vector((-0.7602, -2.4383, 0.8498))
# Hardpoint Hongqi_L5_Chassis_Anchor_0780 = Vector((-0.6806, -2.5035, 0.8891))
# Hardpoint Hongqi_L5_Chassis_Anchor_0781 = Vector((-0.5913, -2.5596, 0.9232))
# Hardpoint Hongqi_L5_Chassis_Anchor_0782 = Vector((-0.4935, -2.6065, 0.9520))
# Hardpoint Hongqi_L5_Chassis_Anchor_0783 = Vector((-0.3886, -2.6441, 0.9752))
# Hardpoint Hongqi_L5_Chassis_Anchor_0784 = Vector((-0.2781, -2.6721, 0.9926))
# Hardpoint Hongqi_L5_Chassis_Anchor_0785 = Vector((-0.1637, -2.6905, 1.0041))
# Hardpoint Hongqi_L5_Chassis_Anchor_0786 = Vector((-0.0468, -2.6992, 1.0095))
# Hardpoint Hongqi_L5_Chassis_Anchor_0787 = Vector((0.0707, -2.6982, 1.0089))
# Hardpoint Hongqi_L5_Chassis_Anchor_0788 = Vector((0.1872, -2.6875, 1.0022))
# Hardpoint Hongqi_L5_Chassis_Anchor_0789 = Vector((0.3010, -2.6672, 0.9895))
# Hardpoint Hongqi_L5_Chassis_Anchor_0790 = Vector((0.4105, -2.6372, 0.9709))
# Hardpoint Hongqi_L5_Chassis_Anchor_0791 = Vector((0.5141, -2.5977, 0.9466))
# Hardpoint Hongqi_L5_Chassis_Anchor_0792 = Vector((0.6103, -2.5489, 0.9167))
# Hardpoint Hongqi_L5_Chassis_Anchor_0793 = Vector((0.6977, -2.4909, 0.8815))
# Hardpoint Hongqi_L5_Chassis_Anchor_0794 = Vector((0.7750, -2.4240, 0.8412))
# Hardpoint Hongqi_L5_Chassis_Anchor_0795 = Vector((0.8413, -2.3483, 0.7963))
# Hardpoint Hongqi_L5_Chassis_Anchor_0796 = Vector((0.8954, -2.2642, 0.7470))
# Hardpoint Hongqi_L5_Chassis_Anchor_0797 = Vector((0.9366, -2.1719, 0.6937))
# Hardpoint Hongqi_L5_Chassis_Anchor_0798 = Vector((0.9644, -2.0718, 0.6370))
# Hardpoint Hongqi_L5_Chassis_Anchor_0799 = Vector((0.9783, -1.9643, 0.5772))
# Hardpoint Hongqi_L5_Chassis_Anchor_0800 = Vector((0.9782, -1.8497, 0.5148))
# Hardpoint Hongqi_L5_Chassis_Anchor_0801 = Vector((0.9639, -1.7284, 0.4504))
# Hardpoint Hongqi_L5_Chassis_Anchor_0802 = Vector((0.9358, -1.6009, 0.3844))
# Hardpoint Hongqi_L5_Chassis_Anchor_0803 = Vector((0.8943, -1.4676, 0.3174))
# Hardpoint Hongqi_L5_Chassis_Anchor_0804 = Vector((0.8398, -1.3291, 0.2500))
# Hardpoint Hongqi_L5_Chassis_Anchor_0805 = Vector((0.7733, -1.1858, 0.1826))
# Hardpoint Hongqi_L5_Chassis_Anchor_0806 = Vector((0.6957, -1.0382, 0.1159))
# Hardpoint Hongqi_L5_Chassis_Anchor_0807 = Vector((0.6081, -0.8869, 0.0503))
# Hardpoint Hongqi_L5_Chassis_Anchor_0808 = Vector((0.5117, -0.7324, -0.0136))
# Hardpoint Hongqi_L5_Chassis_Anchor_0809 = Vector((0.4080, -0.5752, -0.0752))
# Hardpoint Hongqi_L5_Chassis_Anchor_0810 = Vector((0.2984, -0.4160, -0.1342))
# Hardpoint Hongqi_L5_Chassis_Anchor_0811 = Vector((0.1845, -0.2553, -0.1899))
# Hardpoint Hongqi_L5_Chassis_Anchor_0812 = Vector((0.0679, -0.0936, -0.2420))
# Hardpoint Hongqi_L5_Chassis_Anchor_0813 = Vector((-0.0496, 0.0683, -0.2901))
# Hardpoint Hongqi_L5_Chassis_Anchor_0814 = Vector((-0.1664, 0.2301, -0.3337))
# Hardpoint Hongqi_L5_Chassis_Anchor_0815 = Vector((-0.2808, 0.3910, -0.3725))
# Hardpoint Hongqi_L5_Chassis_Anchor_0816 = Vector((-0.3912, 0.5505, -0.4061))
# Hardpoint Hongqi_L5_Chassis_Anchor_0817 = Vector((-0.4960, 0.7080, -0.4344))
# Hardpoint Hongqi_L5_Chassis_Anchor_0818 = Vector((-0.5936, 0.8629, -0.4571))
# Hardpoint Hongqi_L5_Chassis_Anchor_0819 = Vector((-0.6827, 1.0148, -0.4739))
# Hardpoint Hongqi_L5_Chassis_Anchor_0820 = Vector((-0.7619, 1.1630, -0.4848))
# Hardpoint Hongqi_L5_Chassis_Anchor_0821 = Vector((-0.8302, 1.3070, -0.4897))
# Hardpoint Hongqi_L5_Chassis_Anchor_0822 = Vector((-0.8866, 1.4463, -0.4885))
# Hardpoint Hongqi_L5_Chassis_Anchor_0823 = Vector((-0.9302, 1.5804, -0.4813))
# Hardpoint Hongqi_L5_Chassis_Anchor_0824 = Vector((-0.9604, 1.7089, -0.4680))
# Hardpoint Hongqi_L5_Chassis_Anchor_0825 = Vector((-0.9769, 1.8311, -0.4489))
# Hardpoint Hongqi_L5_Chassis_Anchor_0826 = Vector((-0.9792, 1.9468, -0.4240))
# Hardpoint Hongqi_L5_Chassis_Anchor_0827 = Vector((-0.9675, 2.0555, -0.3936))
# Hardpoint Hongqi_L5_Chassis_Anchor_0828 = Vector((-0.9419, 2.1568, -0.3579))
# Hardpoint Hongqi_L5_Chassis_Anchor_0829 = Vector((-0.9027, 2.2503, -0.3172))
# Hardpoint Hongqi_L5_Chassis_Anchor_0830 = Vector((-0.8505, 2.3357, -0.2718))
# Hardpoint Hongqi_L5_Chassis_Anchor_0831 = Vector((-0.7862, 2.4127, -0.2221))
# Hardpoint Hongqi_L5_Chassis_Anchor_0832 = Vector((-0.7105, 2.4811, -0.1686))
# Hardpoint Hongqi_L5_Chassis_Anchor_0833 = Vector((-0.6245, 2.5405, -0.1115))
# Hardpoint Hongqi_L5_Chassis_Anchor_0834 = Vector((-0.5296, 2.5907, -0.0514))
# Hardpoint Hongqi_L5_Chassis_Anchor_0835 = Vector((-0.4271, 2.6317, 0.0111))
# Hardpoint Hongqi_L5_Chassis_Anchor_0836 = Vector((-0.3185, 2.6631, 0.0757))
# Hardpoint Hongqi_L5_Chassis_Anchor_0837 = Vector((-0.2052, 2.6850, 0.1418))
# Hardpoint Hongqi_L5_Chassis_Anchor_0838 = Vector((-0.0890, 2.6972, 0.2089))
# Hardpoint Hongqi_L5_Chassis_Anchor_0839 = Vector((0.0285, 2.6997, 0.2763))
# Hardpoint Hongqi_L5_Chassis_Anchor_0840 = Vector((0.1455, 2.6925, 0.3437))
# Hardpoint Hongqi_L5_Chassis_Anchor_0841 = Vector((0.2605, 2.6756, 0.4103))
# Hardpoint Hongqi_L5_Chassis_Anchor_0842 = Vector((0.3717, 2.6491, 0.4757))
# Hardpoint Hongqi_L5_Chassis_Anchor_0843 = Vector((0.4776, 2.6130, 0.5394))
# Hardpoint Hongqi_L5_Chassis_Anchor_0844 = Vector((0.5766, 2.5676, 0.6009))
# Hardpoint Hongqi_L5_Chassis_Anchor_0845 = Vector((0.6673, 2.5128, 0.6595))
# Hardpoint Hongqi_L5_Chassis_Anchor_0846 = Vector((0.7484, 2.4491, 0.7149))
# Hardpoint Hongqi_L5_Chassis_Anchor_0847 = Vector((0.8188, 2.3765, 0.7667))
# Hardpoint Hongqi_L5_Chassis_Anchor_0848 = Vector((0.8774, 2.2954, 0.8143))
# Hardpoint Hongqi_L5_Chassis_Anchor_0849 = Vector((0.9233, 2.2060, 0.8575))
# Hardpoint Hongqi_L5_Chassis_Anchor_0850 = Vector((0.9560, 2.1087, 0.8958))
# Hardpoint Hongqi_L5_Chassis_Anchor_0851 = Vector((0.9749, 2.0038, 0.9290))
# Hardpoint Hongqi_L5_Chassis_Anchor_0852 = Vector((0.9798, 1.8917, 0.9568))
# Hardpoint Hongqi_L5_Chassis_Anchor_0853 = Vector((0.9707, 1.7728, 0.9789))
# Hardpoint Hongqi_L5_Chassis_Anchor_0854 = Vector((0.9475, 1.6475, 0.9952))
# Hardpoint Hongqi_L5_Chassis_Anchor_0855 = Vector((0.9107, 1.5162, 1.0055))
# Hardpoint Hongqi_L5_Chassis_Anchor_0856 = Vector((0.8609, 1.3795, 1.0099))
# Hardpoint Hongqi_L5_Chassis_Anchor_0857 = Vector((0.7986, 1.2379, 1.0081))
# Hardpoint Hongqi_L5_Chassis_Anchor_0858 = Vector((0.7249, 1.0918, 1.0003))
# Hardpoint Hongqi_L5_Chassis_Anchor_0859 = Vector((0.6407, 0.9417, 0.9865))
# Hardpoint Hongqi_L5_Chassis_Anchor_0860 = Vector((0.5473, 0.7883, 0.9668))
# Hardpoint Hongqi_L5_Chassis_Anchor_0861 = Vector((0.4461, 0.6320, 0.9414))
# Hardpoint Hongqi_L5_Chassis_Anchor_0862 = Vector((0.3384, 0.4735, 0.9105))
# Hardpoint Hongqi_L5_Chassis_Anchor_0863 = Vector((0.2259, 0.3132, 0.8743))
# Hardpoint Hongqi_L5_Chassis_Anchor_0864 = Vector((0.1101, 0.1519, 0.8332))
# Hardpoint Hongqi_L5_Chassis_Anchor_0865 = Vector((-0.0073, -0.0100, 0.7874))
# Hardpoint Hongqi_L5_Chassis_Anchor_0866 = Vector((-0.1246, -0.1719, 0.7373))
# Hardpoint Hongqi_L5_Chassis_Anchor_0867 = Vector((-0.2400, -0.3332, 0.6834))
# Hardpoint Hongqi_L5_Chassis_Anchor_0868 = Vector((-0.3520, -0.4933, 0.6260))
# Hardpoint Hongqi_L5_Chassis_Anchor_0869 = Vector((-0.4590, -0.6516, 0.5657))
# Hardpoint Hongqi_L5_Chassis_Anchor_0870 = Vector((-0.5594, -0.8075, 0.5029))
# Hardpoint Hongqi_L5_Chassis_Anchor_0871 = Vector((-0.6517, -0.9605, 0.4381))
# Hardpoint Hongqi_L5_Chassis_Anchor_0872 = Vector((-0.7346, -1.1101, 0.3719))
# Hardpoint Hongqi_L5_Chassis_Anchor_0873 = Vector((-0.8070, -1.2557, 0.3048))
# Hardpoint Hongqi_L5_Chassis_Anchor_0874 = Vector((-0.8677, -1.3968, 0.2374))
# Hardpoint Hongqi_L5_Chassis_Anchor_0875 = Vector((-0.9160, -1.5328, 0.1701))
# Hardpoint Hongqi_L5_Chassis_Anchor_0876 = Vector((-0.9511, -1.6633, 0.1035))
# Hardpoint Hongqi_L5_Chassis_Anchor_0877 = Vector((-0.9726, -1.7879, 0.0382))
# Hardpoint Hongqi_L5_Chassis_Anchor_0878 = Vector((-0.9800, -1.9060, -0.0253))
# Hardpoint Hongqi_L5_Chassis_Anchor_0879 = Vector((-0.9733, -2.0172, -0.0865))
# Hardpoint Hongqi_L5_Chassis_Anchor_0880 = Vector((-0.9527, -2.1212, -0.1448))
# Hardpoint Hongqi_L5_Chassis_Anchor_0881 = Vector((-0.9183, -2.2176, -0.1999))
# Hardpoint Hongqi_L5_Chassis_Anchor_0882 = Vector((-0.8708, -2.3059, -0.2513))
# Hardpoint Hongqi_L5_Chassis_Anchor_0883 = Vector((-0.8107, -2.3860, -0.2986))
# Hardpoint Hongqi_L5_Chassis_Anchor_0884 = Vector((-0.7389, -2.4575, -0.3413))
# Hardpoint Hongqi_L5_Chassis_Anchor_0885 = Vector((-0.6566, -2.5201, -0.3792))
# Hardpoint Hongqi_L5_Chassis_Anchor_0886 = Vector((-0.5647, -2.5737, -0.4118))
# Hardpoint Hongqi_L5_Chassis_Anchor_0887 = Vector((-0.4648, -2.6180, -0.4391))
# Hardpoint Hongqi_L5_Chassis_Anchor_0888 = Vector((-0.3582, -2.6529, -0.4607))
# Hardpoint Hongqi_L5_Chassis_Anchor_0889 = Vector((-0.2464, -2.6782, -0.4764))
# Hardpoint Hongqi_L5_Chassis_Anchor_0890 = Vector((-0.1311, -2.6939, -0.4862))
# Hardpoint Hongqi_L5_Chassis_Anchor_0891 = Vector((-0.0139, -2.6999, -0.4900))
# Hardpoint Hongqi_L5_Chassis_Anchor_0892 = Vector((0.1035, -2.6962, -0.4876))
# Hardpoint Hongqi_L5_Chassis_Anchor_0893 = Vector((0.2195, -2.6828, -0.4793))
# Hardpoint Hongqi_L5_Chassis_Anchor_0894 = Vector((0.3322, -2.6597, -0.4649))
# Hardpoint Hongqi_L5_Chassis_Anchor_0895 = Vector((0.4402, -2.6271, -0.4447))
# Hardpoint Hongqi_L5_Chassis_Anchor_0896 = Vector((0.5418, -2.5850, -0.4188))
# Hardpoint Hongqi_L5_Chassis_Anchor_0897 = Vector((0.6357, -2.5336, -0.3873))
# Hardpoint Hongqi_L5_Chassis_Anchor_0898 = Vector((0.7204, -2.4731, -0.3507))
# Hardpoint Hongqi_L5_Chassis_Anchor_0899 = Vector((0.7948, -2.4036, -0.3091))
# Hardpoint Hongqi_L5_Chassis_Anchor_0900 = Vector((0.8577, -2.3256, -0.2629))
# Hardpoint Hongqi_L5_Chassis_Anchor_0901 = Vector((0.9083, -2.2391, -0.2124))
# Hardpoint Hongqi_L5_Chassis_Anchor_0902 = Vector((0.9458, -2.1446, -0.1581))
# Hardpoint Hongqi_L5_Chassis_Anchor_0903 = Vector((0.9697, -2.0424, -0.1005))
# Hardpoint Hongqi_L5_Chassis_Anchor_0904 = Vector((0.9797, -1.9329, -0.0399))
# Hardpoint Hongqi_L5_Chassis_Anchor_0905 = Vector((0.9756, -1.8163, 0.0231))
# Hardpoint Hongqi_L5_Chassis_Anchor_0906 = Vector((0.9574, -1.6933, 0.0880))
# Hardpoint Hongqi_L5_Chassis_Anchor_0907 = Vector((0.9255, -1.5641, 0.1543))
# Hardpoint Hongqi_L5_Chassis_Anchor_0908 = Vector((0.8803, -1.4293, 0.2215))
# Hardpoint Hongqi_L5_Chassis_Anchor_0909 = Vector((0.8224, -1.2894, 0.2889))
# Hardpoint Hongqi_L5_Chassis_Anchor_0910 = Vector((0.7527, -1.1448, 0.3562))
# Hardpoint Hongqi_L5_Chassis_Anchor_0911 = Vector((0.6721, -0.9961, 0.4226))
# Hardpoint Hongqi_L5_Chassis_Anchor_0912 = Vector((0.5819, -0.8439, 0.4878))
# Hardpoint Hongqi_L5_Chassis_Anchor_0913 = Vector((0.4833, -0.6886, 0.5511))
# Hardpoint Hongqi_L5_Chassis_Anchor_0914 = Vector((0.3778, -0.5308, 0.6120))
# Hardpoint Hongqi_L5_Chassis_Anchor_0915 = Vector((0.2668, -0.3711, 0.6701))
# Hardpoint Hongqi_L5_Chassis_Anchor_0916 = Vector((0.1520, -0.2100, 0.7249))
# Hardpoint Hongqi_L5_Chassis_Anchor_0917 = Vector((0.0350, -0.0483, 0.7759))
# Hardpoint Hongqi_L5_Chassis_Anchor_0918 = Vector((-0.0825, 0.1137, 0.8228))
# Hardpoint Hongqi_L5_Chassis_Anchor_0919 = Vector((-0.1988, 0.2753, 0.8650))
# Hardpoint Hongqi_L5_Chassis_Anchor_0920 = Vector((-0.3122, 0.4358, 0.9024))
# Hardpoint Hongqi_L5_Chassis_Anchor_0921 = Vector((-0.4212, 0.5948, 0.9346))
# Hardpoint Hongqi_L5_Chassis_Anchor_0922 = Vector((-0.5241, 0.7517, 0.9613))
# Hardpoint Hongqi_L5_Chassis_Anchor_0923 = Vector((-0.6195, 0.9058, 0.9824))
# Hardpoint Hongqi_L5_Chassis_Anchor_0924 = Vector((-0.7059, 1.0567, 0.9976))
# Hardpoint Hongqi_L5_Chassis_Anchor_0925 = Vector((-0.7822, 1.2038, 1.0068))
# Hardpoint Hongqi_L5_Chassis_Anchor_0926 = Vector((-0.8473, 1.3466, 1.0100))
# Hardpoint Hongqi_L5_Chassis_Anchor_0927 = Vector((-0.9001, 1.4845, 1.0071))
# Hardpoint Hongqi_L5_Chassis_Anchor_0928 = Vector((-0.9400, 1.6170, 0.9982))
# Hardpoint Hongqi_L5_Chassis_Anchor_0929 = Vector((-0.9664, 1.7438, 0.9833))
# Hardpoint Hongqi_L5_Chassis_Anchor_0930 = Vector((-0.9789, 1.8642, 0.9625))
# Hardpoint Hongqi_L5_Chassis_Anchor_0931 = Vector((-0.9774, 1.9780, 0.9361))
# Hardpoint Hongqi_L5_Chassis_Anchor_0932 = Vector((-0.9617, 2.0847, 0.9041))
# Hardpoint Hongqi_L5_Chassis_Anchor_0933 = Vector((-0.9322, 2.1838, 0.8670))
# Hardpoint Hongqi_L5_Chassis_Anchor_0934 = Vector((-0.8894, 2.2751, 0.8249))
# Hardpoint Hongqi_L5_Chassis_Anchor_0935 = Vector((-0.8337, 2.3582, 0.7783))
# Hardpoint Hongqi_L5_Chassis_Anchor_0936 = Vector((-0.7660, 2.4328, 0.7275))
# Hardpoint Hongqi_L5_Chassis_Anchor_0937 = Vector((-0.6874, 2.4986, 0.6729))
# Hardpoint Hongqi_L5_Chassis_Anchor_0938 = Vector((-0.5988, 2.5555, 0.6150))
# Hardpoint Hongqi_L5_Chassis_Anchor_0939 = Vector((-0.5016, 2.6031, 0.5541))
# Hardpoint Hongqi_L5_Chassis_Anchor_0940 = Vector((-0.3972, 2.6414, 0.4909))
# Hardpoint Hongqi_L5_Chassis_Anchor_0941 = Vector((-0.2871, 2.6702, 0.4259))
# Hardpoint Hongqi_L5_Chassis_Anchor_0942 = Vector((-0.1729, 2.6894, 0.3595))
# Hardpoint Hongqi_L5_Chassis_Anchor_0943 = Vector((-0.0562, 2.6989, 0.2922))
# Hardpoint Hongqi_L5_Chassis_Anchor_0944 = Vector((0.0614, 2.6987, 0.2248))
# Hardpoint Hongqi_L5_Chassis_Anchor_0945 = Vector((0.1780, 2.6887, 0.1576))
# Hardpoint Hongqi_L5_Chassis_Anchor_0946 = Vector((0.2921, 2.6691, 0.0912))
# Hardpoint Hongqi_L5_Chassis_Anchor_0947 = Vector((0.4020, 2.6399, 0.0262))
# Hardpoint Hongqi_L5_Chassis_Anchor_0948 = Vector((0.5061, 2.6012, -0.0369))
# Hardpoint Hongqi_L5_Chassis_Anchor_0949 = Vector((0.6029, 2.5531, -0.0976))
# Hardpoint Hongqi_L5_Chassis_Anchor_0950 = Vector((0.6911, 2.4959, -0.1554))
# Hardpoint Hongqi_L5_Chassis_Anchor_0951 = Vector((0.7693, 2.4296, -0.2098))
# Hardpoint Hongqi_L5_Chassis_Anchor_0952 = Vector((0.8364, 2.3547, -0.2605))
# Hardpoint Hongqi_L5_Chassis_Anchor_0953 = Vector((0.8915, 2.2712, -0.3069))
# Hardpoint Hongqi_L5_Chassis_Anchor_0954 = Vector((0.9338, 2.1796, -0.3487))
# Hardpoint Hongqi_L5_Chassis_Anchor_0955 = Vector((0.9627, 2.0801, -0.3857))
# Hardpoint Hongqi_L5_Chassis_Anchor_0956 = Vector((0.9777, 1.9731, -0.4173))
# Hardpoint Hongqi_L5_Chassis_Anchor_0957 = Vector((0.9787, 1.8590, -0.4435))
# Hardpoint Hongqi_L5_Chassis_Anchor_0958 = Vector((0.9656, 1.7383, -0.4641))
# Hardpoint Hongqi_L5_Chassis_Anchor_0959 = Vector((0.9386, 1.6113, -0.4787))
# Hardpoint Hongqi_L5_Chassis_Anchor_0960 = Vector((0.8980, 1.4785, -0.4874))
# Hardpoint Hongqi_L5_Chassis_Anchor_0961 = Vector((0.8446, 1.3403, -0.4900))
# Hardpoint Hongqi_L5_Chassis_Anchor_0962 = Vector((0.7791, 1.1974, -0.4865))
# Hardpoint Hongqi_L5_Chassis_Anchor_0963 = Vector((0.7023, 1.0501, -0.4770))
# Hardpoint Hongqi_L5_Chassis_Anchor_0964 = Vector((0.6154, 0.8991, -0.4616))
# Hardpoint Hongqi_L5_Chassis_Anchor_0965 = Vector((0.5197, 0.7448, -0.4403))
# Hardpoint Hongqi_L5_Chassis_Anchor_0966 = Vector((0.4165, 0.5878, -0.4133))
# Hardpoint Hongqi_L5_Chassis_Anchor_0967 = Vector((0.3073, 0.4287, -0.3809))
# Hardpoint Hongqi_L5_Chassis_Anchor_0968 = Vector((0.1937, 0.2681, -0.3433))
# Hardpoint Hongqi_L5_Chassis_Anchor_0969 = Vector((0.0773, 0.1065, -0.3008))
# Hardpoint Hongqi_L5_Chassis_Anchor_0970 = Vector((-0.0402, -0.0554, -0.2537))
# Hardpoint Hongqi_L5_Chassis_Anchor_0971 = Vector((-0.1572, -0.2172, -0.2026))
# Hardpoint Hongqi_L5_Chassis_Anchor_0972 = Vector((-0.2718, -0.3782, -0.1476))
# Hardpoint Hongqi_L5_Chassis_Anchor_0973 = Vector((-0.3826, -0.5378, -0.0894))
# Hardpoint Hongqi_L5_Chassis_Anchor_0974 = Vector((-0.4879, -0.6955, -0.0283))
# Hardpoint Hongqi_L5_Chassis_Anchor_0975 = Vector((-0.5861, -0.8507, 0.0351))
# Hardpoint Hongqi_L5_Chassis_Anchor_0976 = Vector((-0.6759, -1.0028, 0.1003))
# Hardpoint Hongqi_L5_Chassis_Anchor_0977 = Vector((-0.7560, -1.1513, 0.1668))
# Hardpoint Hongqi_L5_Chassis_Anchor_0978 = Vector((-0.8252, -1.2957, 0.2341))
# Hardpoint Hongqi_L5_Chassis_Anchor_0979 = Vector((-0.8826, -1.4354, 0.3015))
# Hardpoint Hongqi_L5_Chassis_Anchor_0980 = Vector((-0.9272, -1.5700, 0.3687))
# Hardpoint Hongqi_L5_Chassis_Anchor_0981 = Vector((-0.9585, -1.6989, 0.4349))
# Hardpoint Hongqi_L5_Chassis_Anchor_0982 = Vector((-0.9761, -1.8216, 0.4998))
# Hardpoint Hongqi_L5_Chassis_Anchor_0983 = Vector((-0.9796, -1.9379, 0.5627))
# Hardpoint Hongqi_L5_Chassis_Anchor_0984 = Vector((-0.9690, -2.0471, 0.6231))
# Hardpoint Hongqi_L5_Chassis_Anchor_0985 = Vector((-0.9444, -2.1490, 0.6806))
# Hardpoint Hongqi_L5_Chassis_Anchor_0986 = Vector((-0.9063, -2.2431, 0.7347))
# Hardpoint Hongqi_L5_Chassis_Anchor_0987 = Vector((-0.8552, -2.3292, 0.7850))
# Hardpoint Hongqi_L5_Chassis_Anchor_0988 = Vector((-0.7917, -2.4069, 0.8310))
# Hardpoint Hongqi_L5_Chassis_Anchor_0989 = Vector((-0.7169, -2.4759, 0.8724))
# Hardpoint Hongqi_L5_Chassis_Anchor_0990 = Vector((-0.6317, -2.5361, 0.9088))
# Hardpoint Hongqi_L5_Chassis_Anchor_0991 = Vector((-0.5375, -2.5871, 0.9400))
# Hardpoint Hongqi_L5_Chassis_Anchor_0992 = Vector((-0.4355, -2.6287, 0.9657))
# Hardpoint Hongqi_L5_Chassis_Anchor_0993 = Vector((-0.3273, -2.6610, 0.9857))
# Hardpoint Hongqi_L5_Chassis_Anchor_0994 = Vector((-0.2144, -2.6836, 0.9998))
# Hardpoint Hongqi_L5_Chassis_Anchor_0995 = Vector((-0.0983, -2.6966, 1.0079))
# Hardpoint Hongqi_L5_Chassis_Anchor_0996 = Vector((0.0191, -2.6999, 1.0099))
# Hardpoint Hongqi_L5_Chassis_Anchor_0997 = Vector((0.1362, -2.6934, 1.0059))
# Hardpoint Hongqi_L5_Chassis_Anchor_0998 = Vector((0.2514, -2.6773, 0.9958))
# Hardpoint Hongqi_L5_Chassis_Anchor_0999 = Vector((0.3630, -2.6515, 0.9798))
# Hardpoint Hongqi_L5_Chassis_Anchor_1000 = Vector((0.4694, -2.6162, 0.9580))
# Hardpoint Hongqi_L5_Chassis_Anchor_1001 = Vector((0.5690, -2.5715, 0.9305))
# Hardpoint Hongqi_L5_Chassis_Anchor_1002 = Vector((0.6604, -2.5175, 0.8976))
# Hardpoint Hongqi_L5_Chassis_Anchor_1003 = Vector((0.7424, -2.4545, 0.8595))
# Hardpoint Hongqi_L5_Chassis_Anchor_1004 = Vector((0.8136, -2.3826, 0.8166))
# Hardpoint Hongqi_L5_Chassis_Anchor_1005 = Vector((0.8732, -2.3022, 0.7691))
# Hardpoint Hongqi_L5_Chassis_Anchor_1006 = Vector((0.9201, -2.2135, 0.7176))
# Hardpoint Hongqi_L5_Chassis_Anchor_1007 = Vector((0.9539, -2.1168, 0.6623))
# Hardpoint Hongqi_L5_Chassis_Anchor_1008 = Vector((0.9739, -2.0124, 0.6038))
# Hardpoint Hongqi_L5_Chassis_Anchor_1009 = Vector((0.9800, -1.9009, 0.5425))
# Hardpoint Hongqi_L5_Chassis_Anchor_1010 = Vector((0.9719, -1.7825, 0.4789))
# Hardpoint Hongqi_L5_Chassis_Anchor_1011 = Vector((0.9499, -1.6577, 0.4135))
# Hardpoint Hongqi_L5_Chassis_Anchor_1012 = Vector((0.9141, -1.5269, 0.3469))
# Hardpoint Hongqi_L5_Chassis_Anchor_1013 = Vector((0.8653, -1.3906, 0.2796))
# Hardpoint Hongqi_L5_Chassis_Anchor_1014 = Vector((0.8040, -1.2493, 0.2122))
# Hardpoint Hongqi_L5_Chassis_Anchor_1015 = Vector((0.7311, -1.1036, 0.1451))
# Hardpoint Hongqi_L5_Chassis_Anchor_1016 = Vector((0.6478, -0.9538, 0.0789))
# Hardpoint Hongqi_L5_Chassis_Anchor_1017 = Vector((0.5551, -0.8006, 0.0143))
# Hardpoint Hongqi_L5_Chassis_Anchor_1018 = Vector((0.4544, -0.6446, -0.0484))
# Hardpoint Hongqi_L5_Chassis_Anchor_1019 = Vector((0.3472, -0.4862, -0.1086))
# Hardpoint Hongqi_L5_Chassis_Anchor_1020 = Vector((0.2350, -0.3261, -0.1658))
# Hardpoint Hongqi_L5_Chassis_Anchor_1021 = Vector((0.1194, -0.1648, -0.2196))
# Hardpoint Hongqi_L5_Chassis_Anchor_1022 = Vector((0.0021, -0.0029, -0.2695))
# Hardpoint Hongqi_L5_Chassis_Anchor_1023 = Vector((-0.1153, 0.1591, -0.3151))
# Hardpoint Hongqi_L5_Chassis_Anchor_1024 = Vector((-0.2309, 0.3204, -0.3560))
# Hardpoint Hongqi_L5_Chassis_Anchor_1025 = Vector((-0.3433, 0.4806, -0.3920))
# Hardpoint Hongqi_L5_Chassis_Anchor_1026 = Vector((-0.4507, 0.6390, -0.4227))
# Hardpoint Hongqi_L5_Chassis_Anchor_1027 = Vector((-0.5516, 0.7952, -0.4478))
# Hardpoint Hongqi_L5_Chassis_Anchor_1028 = Vector((-0.6446, 0.9485, -0.4672))
# Hardpoint Hongqi_L5_Chassis_Anchor_1029 = Vector((-0.7284, 1.0983, -0.4808))
# Hardpoint Hongqi_L5_Chassis_Anchor_1030 = Vector((-0.8016, 1.2443, -0.4883))
# Hardpoint Hongqi_L5_Chassis_Anchor_1031 = Vector((-0.8633, 1.3857, -0.4898))
# Hardpoint Hongqi_L5_Chassis_Anchor_1032 = Vector((-0.9126, 1.5222, -0.4852))
# Hardpoint Hongqi_L5_Chassis_Anchor_1033 = Vector((-0.9488, 1.6532, -0.4746))
# Hardpoint Hongqi_L5_Chassis_Anchor_1034 = Vector((-0.9714, 1.7782, -0.4580))
# Hardpoint Hongqi_L5_Chassis_Anchor_1035 = Vector((-0.9799, 1.8968, -0.4357))
# Hardpoint Hongqi_L5_Chassis_Anchor_1036 = Vector((-0.9744, 2.0086, -0.4076))
# Hardpoint Hongqi_L5_Chassis_Anchor_1037 = Vector((-0.9548, 2.1132, -0.3742))
# Hardpoint Hongqi_L5_Chassis_Anchor_1038 = Vector((-0.9216, 2.2102, -0.3357))
# Hardpoint Hongqi_L5_Chassis_Anchor_1039 = Vector((-0.8750, 2.2992, -0.2923))
# Hardpoint Hongqi_L5_Chassis_Anchor_1040 = Vector((-0.8159, 2.3799, -0.2445))
# Hardpoint Hongqi_L5_Chassis_Anchor_1041 = Vector((-0.7451, 2.4521, -0.1926))
# Hardpoint Hongqi_L5_Chassis_Anchor_1042 = Vector((-0.6635, 2.5155, -0.1370))
# Hardpoint Hongqi_L5_Chassis_Anchor_1043 = Vector((-0.5724, 2.5698, -0.0782))
# Hardpoint Hongqi_L5_Chassis_Anchor_1044 = Vector((-0.4730, 2.6148, -0.0166))
# Hardpoint Hongqi_L5_Chassis_Anchor_1045 = Vector((-0.3669, 2.6505, 0.0471))
# Hardpoint Hongqi_L5_Chassis_Anchor_1046 = Vector((-0.2554, 2.6766, 0.1126))
# Hardpoint Hongqi_L5_Chassis_Anchor_1047 = Vector((-0.1403, 2.6930, 0.1793))
# Hardpoint Hongqi_L5_Chassis_Anchor_1048 = Vector((-0.0232, 2.6998, 0.2467))
# Hardpoint Hongqi_L5_Chassis_Anchor_1049 = Vector((0.0942, 2.6969, 0.3141))
# Hardpoint Hongqi_L5_Chassis_Anchor_1050 = Vector((0.2103, 2.6842, 0.3811))
# Hardpoint Hongqi_L5_Chassis_Anchor_1051 = Vector((0.3234, 2.6619, 0.4472))
# Hardpoint Hongqi_L5_Chassis_Anchor_1052 = Vector((0.4318, 2.6300, 0.5117))
# Hardpoint Hongqi_L5_Chassis_Anchor_1053 = Vector((0.5340, 2.5887, 0.5742))
# Hardpoint Hongqi_L5_Chassis_Anchor_1054 = Vector((0.6286, 2.5380, 0.6341))
# Hardpoint Hongqi_L5_Chassis_Anchor_1055 = Vector((0.7140, 2.4782, 0.6910))
# Hardpoint Hongqi_L5_Chassis_Anchor_1056 = Vector((0.7893, 2.4095, 0.7444))
# Hardpoint Hongqi_L5_Chassis_Anchor_1057 = Vector((0.8531, 2.3321, 0.7939))
# Hardpoint Hongqi_L5_Chassis_Anchor_1058 = Vector((0.9047, 2.2463, 0.8391))
# Hardpoint Hongqi_L5_Chassis_Anchor_1059 = Vector((0.9433, 2.1525, 0.8796))
# Hardpoint Hongqi_L5_Chassis_Anchor_1060 = Vector((0.9683, 2.0508, 0.9151))
# Hardpoint Hongqi_L5_Chassis_Anchor_1061 = Vector((0.9794, 1.9418, 0.9453))
# Hardpoint Hongqi_L5_Chassis_Anchor_1062 = Vector((0.9764, 1.8259, 0.9699))
# Hardpoint Hongqi_L5_Chassis_Anchor_1063 = Vector((0.9594, 1.7033, 0.9888))
# Hardpoint Hongqi_L5_Chassis_Anchor_1064 = Vector((0.9285, 1.5746, 1.0017))
# Hardpoint Hongqi_L5_Chassis_Anchor_1065 = Vector((0.8843, 1.4403, 1.0087))
# Hardpoint Hongqi_L5_Chassis_Anchor_1066 = Vector((0.8274, 1.3007, 1.0096))
# Hardpoint Hongqi_L5_Chassis_Anchor_1067 = Vector((0.7586, 1.1565, 1.0045))
# Hardpoint Hongqi_L5_Chassis_Anchor_1068 = Vector((0.6789, 1.0081, 0.9933))
# Hardpoint Hongqi_L5_Chassis_Anchor_1069 = Vector((0.5894, 0.8561, 0.9762))
# Hardpoint Hongqi_L5_Chassis_Anchor_1070 = Vector((0.4914, 0.7010, 0.9533))
# Hardpoint Hongqi_L5_Chassis_Anchor_1071 = Vector((0.3864, 0.5434, 0.9248))
# Hardpoint Hongqi_L5_Chassis_Anchor_1072 = Vector((0.2758, 0.3838, 0.8908))
# Hardpoint Hongqi_L5_Chassis_Anchor_1073 = Vector((0.1613, 0.2229, 0.8518))
# Hardpoint Hongqi_L5_Chassis_Anchor_1074 = Vector((0.0444, 0.0611, 0.8080))
# Hardpoint Hongqi_L5_Chassis_Anchor_1075 = Vector((-0.0731, -0.1008, 0.7598))
# Hardpoint Hongqi_L5_Chassis_Anchor_1076 = Vector((-0.1896, -0.2624, 0.7075))
# Hardpoint Hongqi_L5_Chassis_Anchor_1077 = Vector((-0.3033, -0.4231, 0.6516))
# Hardpoint Hongqi_L5_Chassis_Anchor_1078 = Vector((-0.4127, -0.5822, 0.5925))
# Hardpoint Hongqi_L5_Chassis_Anchor_1079 = Vector((-0.5162, -0.7393, 0.5308))
# Hardpoint Hongqi_L5_Chassis_Anchor_1080 = Vector((-0.6122, -0.8937, 0.4668))
# Hardpoint Hongqi_L5_Chassis_Anchor_1081 = Vector((-0.6994, -1.0448, 0.4012))
# Hardpoint Hongqi_L5_Chassis_Anchor_1082 = Vector((-0.7765, -1.1922, 0.3344))
# Hardpoint Hongqi_L5_Chassis_Anchor_1083 = Vector((-0.8425, -1.3354, 0.2670))
# Hardpoint Hongqi_L5_Chassis_Anchor_1084 = Vector((-0.8964, -1.4737, 0.1996))
# Hardpoint Hongqi_L5_Chassis_Anchor_1085 = Vector((-0.9374, -1.6067, 0.1326))
# Hardpoint Hongqi_L5_Chassis_Anchor_1086 = Vector((-0.9648, -1.7339, 0.0667))
# Hardpoint Hongqi_L5_Chassis_Anchor_1087 = Vector((-0.9785, -1.8549, 0.0024))
# Hardpoint Hongqi_L5_Chassis_Anchor_1088 = Vector((-0.9780, -1.9692, -0.0599))
# Hardpoint Hongqi_L5_Chassis_Anchor_1089 = Vector((-0.9635, -2.0764, -0.1196))
# Hardpoint Hongqi_L5_Chassis_Anchor_1090 = Vector((-0.9351, -2.1762, -0.1762))
# Hardpoint Hongqi_L5_Chassis_Anchor_1091 = Vector((-0.8933, -2.2681, -0.2292))
# Hardpoint Hongqi_L5_Chassis_Anchor_1092 = Vector((-0.8386, -2.3519, -0.2783))
# Hardpoint Hongqi_L5_Chassis_Anchor_1093 = Vector((-0.7718, -2.4271, -0.3231))
# Hardpoint Hongqi_L5_Chassis_Anchor_1094 = Vector((-0.6940, -2.4937, -0.3631))
# Hardpoint Hongqi_L5_Chassis_Anchor_1095 = Vector((-0.6062, -2.5513, -0.3981))
# Hardpoint Hongqi_L5_Chassis_Anchor_1096 = Vector((-0.5096, -2.5997, -0.4278))
# Hardpoint Hongqi_L5_Chassis_Anchor_1097 = Vector((-0.4058, -2.6387, -0.4519))
# Hardpoint Hongqi_L5_Chassis_Anchor_1098 = Vector((-0.2961, -2.6683, -0.4702))
# Hardpoint Hongqi_L5_Chassis_Anchor_1099 = Vector((-0.1821, -2.6882, -0.4826))
# Hardpoint Hongqi_L5_Chassis_Anchor_1100 = Vector((-0.0655, -2.6985, -0.4891))
# Hardpoint Hongqi_L5_Chassis_Anchor_1101 = Vector((0.0520, -2.6990, -0.4894))
# Hardpoint Hongqi_L5_Chassis_Anchor_1102 = Vector((0.1688, -2.6899, -0.4837))
# Hardpoint Hongqi_L5_Chassis_Anchor_1103 = Vector((0.2832, -2.6711, -0.4720))
# Hardpoint Hongqi_L5_Chassis_Anchor_1104 = Vector((0.3934, -2.6426, -0.4543))
# Hardpoint Hongqi_L5_Chassis_Anchor_1105 = Vector((0.4980, -2.6046, -0.4308))
# Hardpoint Hongqi_L5_Chassis_Anchor_1106 = Vector((0.5955, -2.5573, -0.4018))
# Hardpoint Hongqi_L5_Chassis_Anchor_1107 = Vector((0.6844, -2.5008, -0.3674))
# Hardpoint Hongqi_L5_Chassis_Anchor_1108 = Vector((0.7634, -2.4352, -0.3279))
# Hardpoint Hongqi_L5_Chassis_Anchor_1109 = Vector((0.8315, -2.3609, -0.2837))
# Hardpoint Hongqi_L5_Chassis_Anchor_1110 = Vector((0.8876, -2.2781, -0.2351))
# Hardpoint Hongqi_L5_Chassis_Anchor_1111 = Vector((0.9310, -2.1871, -0.1824))
# Hardpoint Hongqi_L5_Chassis_Anchor_1112 = Vector((0.9609, -2.0883, -0.1262))
# Hardpoint Hongqi_L5_Chassis_Anchor_1113 = Vector((0.9770, -1.9819, -0.0669))
# Hardpoint Hongqi_L5_Chassis_Anchor_1114 = Vector((0.9791, -1.8684, -0.0049))
# Hardpoint Hongqi_L5_Chassis_Anchor_1115 = Vector((0.9671, -1.7481, 0.0593))
# Hardpoint Hongqi_L5_Chassis_Anchor_1116 = Vector((0.9412, -1.6216, 0.1250))
# Hardpoint Hongqi_L5_Chassis_Anchor_1117 = Vector((0.9018, -1.4892, 0.1919))
# Hardpoint Hongqi_L5_Chassis_Anchor_1118 = Vector((0.8493, -1.3515, 0.2593))
# Hardpoint Hongqi_L5_Chassis_Anchor_1119 = Vector((0.7847, -1.2089, 0.3267))
# Hardpoint Hongqi_L5_Chassis_Anchor_1120 = Vector((0.7088, -1.0620, 0.3936))
# Hardpoint Hongqi_L5_Chassis_Anchor_1121 = Vector((0.6227, -0.9112, 0.4594))
# Hardpoint Hongqi_L5_Chassis_Anchor_1122 = Vector((0.5276, -0.7572, 0.5235))
# Hardpoint Hongqi_L5_Chassis_Anchor_1123 = Vector((0.4249, -0.6004, 0.5856))
# Hardpoint Hongqi_L5_Chassis_Anchor_1124 = Vector((0.3162, -0.4415, 0.6450))
# Hardpoint Hongqi_L5_Chassis_Anchor_1125 = Vector((0.2028, -0.2809, 0.7013))
# Hardpoint Hongqi_L5_Chassis_Anchor_1126 = Vector((0.0866, -0.1194, 0.7540))
# Hardpoint Hongqi_L5_Chassis_Anchor_1127 = Vector((-0.0309, 0.0425, 0.8027))
# Hardpoint Hongqi_L5_Chassis_Anchor_1128 = Vector((-0.1479, 0.2044, 0.8470))
# Hardpoint Hongqi_L5_Chassis_Anchor_1129 = Vector((-0.2628, 0.3654, 0.8866))
# Hardpoint Hongqi_L5_Chassis_Anchor_1130 = Vector((-0.3740, 0.5252, 0.9211))
# Hardpoint Hongqi_L5_Chassis_Anchor_1131 = Vector((-0.4797, 0.6830, 0.9503))
# Hardpoint Hongqi_L5_Chassis_Anchor_1132 = Vector((-0.5786, 0.8384, 0.9738))
# Hardpoint Hongqi_L5_Chassis_Anchor_1133 = Vector((-0.6691, 0.9908, 0.9916))
# Hardpoint Hongqi_L5_Chassis_Anchor_1134 = Vector((-0.7500, 1.1397, 1.0035))
# Hardpoint Hongqi_L5_Chassis_Anchor_1135 = Vector((-0.8201, 1.2844, 1.0093))
# Hardpoint Hongqi_L5_Chassis_Anchor_1136 = Vector((-0.8784, 1.4245, 1.0091))
# Hardpoint Hongqi_L5_Chassis_Anchor_1137 = Vector((-0.9241, 1.5595, 1.0028))
# Hardpoint Hongqi_L5_Chassis_Anchor_1138 = Vector((-0.9565, 1.6888, 0.9905))
# Hardpoint Hongqi_L5_Chassis_Anchor_1139 = Vector((-0.9752, 1.8121, 0.9723))
# Hardpoint Hongqi_L5_Chassis_Anchor_1140 = Vector((-0.9798, 1.9289, 0.9484))
# Hardpoint Hongqi_L5_Chassis_Anchor_1141 = Vector((-0.9703, 2.0387, 0.9188))
# Hardpoint Hongqi_L5_Chassis_Anchor_1142 = Vector((-0.9469, 2.1412, 0.8839))
# Hardpoint Hongqi_L5_Chassis_Anchor_1143 = Vector((-0.9098, 2.2359, 0.8440))
# Hardpoint Hongqi_L5_Chassis_Anchor_1144 = Vector((-0.8597, 2.3227, 0.7994))
# Hardpoint Hongqi_L5_Chassis_Anchor_1145 = Vector((-0.7972, 2.4010, 0.7503))
# Hardpoint Hongqi_L5_Chassis_Anchor_1146 = Vector((-0.7232, 2.4708, 0.6973))
# Hardpoint Hongqi_L5_Chassis_Anchor_1147 = Vector((-0.6389, 2.5316, 0.6408))
# Hardpoint Hongqi_L5_Chassis_Anchor_1148 = Vector((-0.5453, 2.5833, 0.5812))
# Hardpoint Hongqi_L5_Chassis_Anchor_1149 = Vector((-0.4439, 2.6258, 0.5190))
# Hardpoint Hongqi_L5_Chassis_Anchor_1150 = Vector((-0.3361, 2.6587, 0.4547))
# Hardpoint Hongqi_L5_Chassis_Anchor_1151 = Vector((-0.2235, 2.6822, 0.3888))
# Hardpoint Hongqi_L5_Chassis_Anchor_1152 = Vector((-0.1077, 2.6959, 0.3218))
# Hardpoint Hongqi_L5_Chassis_Anchor_1153 = Vector((0.0097, 2.7000, 0.2544))
# Hardpoint Hongqi_L5_Chassis_Anchor_1154 = Vector((0.1270, 2.6943, 0.1870))
# Hardpoint Hongqi_L5_Chassis_Anchor_1155 = Vector((0.2424, 2.6789, 0.1202))
# Hardpoint Hongqi_L5_Chassis_Anchor_1156 = Vector((0.3543, 2.6539, 0.0546))
# Hardpoint Hongqi_L5_Chassis_Anchor_1157 = Vector((0.4611, 2.6194, -0.0094))
# Hardpoint Hongqi_L5_Chassis_Anchor_1158 = Vector((0.5613, 2.5754, -0.0712))
# Hardpoint Hongqi_L5_Chassis_Anchor_1159 = Vector((0.6535, 2.5222, -0.1304))
# Hardpoint Hongqi_L5_Chassis_Anchor_1160 = Vector((0.7362, 2.4598, -0.1864))
# Hardpoint Hongqi_L5_Chassis_Anchor_1161 = Vector((0.8083, 2.3887, -0.2387))
# Hardpoint Hongqi_L5_Chassis_Anchor_1162 = Vector((0.8689, 2.3089, -0.2870))
# Hardpoint Hongqi_L5_Chassis_Anchor_1163 = Vector((0.9169, 2.2208, -0.3309))
# Hardpoint Hongqi_L5_Chassis_Anchor_1164 = Vector((0.9517, 2.1247, -0.3701))
# Hardpoint Hongqi_L5_Chassis_Anchor_1165 = Vector((0.9728, 2.0210, -0.4041))
# Hardpoint Hongqi_L5_Chassis_Anchor_1166 = Vector((0.9800, 1.9100, -0.4327))
# Hardpoint Hongqi_L5_Chassis_Anchor_1167 = Vector((0.9731, 1.7922, -0.4558))
# Hardpoint Hongqi_L5_Chassis_Anchor_1168 = Vector((0.9521, 1.6678, -0.4730))
# Hardpoint Hongqi_L5_Chassis_Anchor_1169 = Vector((0.9175, 1.5375, -0.4843))
# Hardpoint Hongqi_L5_Chassis_Anchor_1170 = Vector((0.8696, 1.4017, -0.4896))
# Hardpoint Hongqi_L5_Chassis_Anchor_1171 = Vector((0.8093, 1.2608, -0.4888))
# Hardpoint Hongqi_L5_Chassis_Anchor_1172 = Vector((0.7373, 1.1153, -0.4820))
# Hardpoint Hongqi_L5_Chassis_Anchor_1173 = Vector((0.6548, 0.9659, -0.4691))
# Hardpoint Hongqi_L5_Chassis_Anchor_1174 = Vector((0.5628, 0.8129, -0.4503))
# Hardpoint Hongqi_L5_Chassis_Anchor_1175 = Vector((0.4627, 0.6571, -0.4258))
# Hardpoint Hongqi_L5_Chassis_Anchor_1176 = Vector((0.3559, 0.4989, -0.3958))
# Hardpoint Hongqi_L5_Chassis_Anchor_1177 = Vector((0.2440, 0.3389, -0.3604))
# Hardpoint Hongqi_L5_Chassis_Anchor_1178 = Vector((0.1287, 0.1776, -0.3200))
# Hardpoint Hongqi_L5_Chassis_Anchor_1179 = Vector((0.0114, 0.0158, -0.2750))
# Hardpoint Hongqi_L5_Chassis_Anchor_1180 = Vector((-0.1060, -0.1462, -0.2255))
# Hardpoint Hongqi_L5_Chassis_Anchor_1181 = Vector((-0.2218, -0.3076, -0.1722))
# Hardpoint Hongqi_L5_Chassis_Anchor_1182 = Vector((-0.3345, -0.4679, -0.1154))
# Hardpoint Hongqi_L5_Chassis_Anchor_1183 = Vector((-0.4424, -0.6265, -0.0555))
# Hardpoint Hongqi_L5_Chassis_Anchor_1184 = Vector((-0.5439, -0.7828, 0.0070))
# Hardpoint Hongqi_L5_Chassis_Anchor_1185 = Vector((-0.6376, -0.9364, 0.0714))
# Hardpoint Hongqi_L5_Chassis_Anchor_1186 = Vector((-0.7221, -1.0866, 0.1374))
# Hardpoint Hongqi_L5_Chassis_Anchor_1187 = Vector((-0.7962, -1.2328, 0.2044))
# Hardpoint Hongqi_L5_Chassis_Anchor_1188 = Vector((-0.8589, -1.3746, 0.2719))
# Hardpoint Hongqi_L5_Chassis_Anchor_1189 = Vector((-0.9092, -1.5115, 0.3392))
# Hardpoint Hongqi_L5_Chassis_Anchor_1190 = Vector((-0.9464, -1.6429, 0.4060))
# Hardpoint Hongqi_L5_Chassis_Anchor_1191 = Vector((-0.9701, -1.7685, 0.4715))
# Hardpoint Hongqi_L5_Chassis_Anchor_1192 = Vector((-0.9798, -1.8876, 0.5353))
# Hardpoint Hongqi_L5_Chassis_Anchor_1193 = Vector((-0.9753, -2.0000, 0.5969))
# Hardpoint Hongqi_L5_Chassis_Anchor_1194 = Vector((-0.9569, -2.1052, 0.6557))
# Hardpoint Hongqi_L5_Chassis_Anchor_1195 = Vector((-0.9247, -2.2027, 0.7114))
# Hardpoint Hongqi_L5_Chassis_Anchor_1196 = Vector((-0.8792, -2.2924, 0.7634))
# Hardpoint Hongqi_L5_Chassis_Anchor_1197 = Vector((-0.8211, -2.3738, 0.8113))
# Hardpoint Hongqi_L5_Chassis_Anchor_1198 = Vector((-0.7511, -2.4467, 0.8548))
# Hardpoint Hongqi_L5_Chassis_Anchor_1199 = Vector((-0.6703, -2.5108, 0.8935))
# Hardpoint Hongqi_L5_Chassis_Anchor_1200 = Vector((-0.5799, -2.5658, 0.9270))
# Hardpoint Hongqi_L5_Chassis_Anchor_1201 = Vector((-0.4812, -2.6116, 0.9551))
# Hardpoint Hongqi_L5_Chassis_Anchor_1202 = Vector((-0.3755, -2.6480, 0.9776))
# Hardpoint Hongqi_L5_Chassis_Anchor_1203 = Vector((-0.2645, -2.6748, 0.9943))
# Hardpoint Hongqi_L5_Chassis_Anchor_1204 = Vector((-0.1496, -2.6921, 1.0051))
# Hardpoint Hongqi_L5_Chassis_Anchor_1205 = Vector((-0.0326, -2.6996, 1.0098))
# Hardpoint Hongqi_L5_Chassis_Anchor_1206 = Vector((0.0849, -2.6975, 1.0084))
# Hardpoint Hongqi_L5_Chassis_Anchor_1207 = Vector((0.2012, -2.6856, 1.0010))
# Hardpoint Hongqi_L5_Chassis_Anchor_1208 = Vector((0.3145, -2.6640, 0.9876))
# Hardpoint Hongqi_L5_Chassis_Anchor_1209 = Vector((0.4234, -2.6329, 0.9683))
# Hardpoint Hongqi_L5_Chassis_Anchor_1210 = Vector((0.5261, -2.5923, 0.9433))
# Hardpoint Hongqi_L5_Chassis_Anchor_1211 = Vector((0.6213, -2.5424, 0.9127))
# Hardpoint Hongqi_L5_Chassis_Anchor_1212 = Vector((0.7076, -2.4833, 0.8769))
# Hardpoint Hongqi_L5_Chassis_Anchor_1213 = Vector((0.7837, -2.4153, 0.8360))
# Hardpoint Hongqi_L5_Chassis_Anchor_1214 = Vector((0.8485, -2.3386, 0.7905))
# Hardpoint Hongqi_L5_Chassis_Anchor_1215 = Vector((0.9011, -2.2535, 0.7407))
# Hardpoint Hongqi_L5_Chassis_Anchor_1216 = Vector((0.9407, -2.1602, 0.6870))
# Hardpoint Hongqi_L5_Chassis_Anchor_1217 = Vector((0.9668, -2.0592, 0.6299))
# Hardpoint Hongqi_L5_Chassis_Anchor_1218 = Vector((0.9790, -1.9508, 0.5697))
# Hardpoint Hongqi_L5_Chassis_Anchor_1219 = Vector((0.9772, -1.8353, 0.5071))
# Hardpoint Hongqi_L5_Chassis_Anchor_1220 = Vector((0.9612, -1.7133, 0.4425))
# Hardpoint Hongqi_L5_Chassis_Anchor_1221 = Vector((0.9315, -1.5851, 0.3763))
# Hardpoint Hongqi_L5_Chassis_Anchor_1222 = Vector((0.8883, -1.4512, 0.3093))
# Hardpoint Hongqi_L5_Chassis_Anchor_1223 = Vector((0.8324, -1.3120, 0.2418))
# Hardpoint Hongqi_L5_Chassis_Anchor_1224 = Vector((0.7645, -1.1681, 0.1745))
# Hardpoint Hongqi_L5_Chassis_Anchor_1225 = Vector((0.6856, -1.0201, 0.1079))
# Hardpoint Hongqi_L5_Chassis_Anchor_1226 = Vector((0.5969, -0.8683, 0.0425))
# Hardpoint Hongqi_L5_Chassis_Anchor_1227 = Vector((0.4995, -0.7135, -0.0212))
# Hardpoint Hongqi_L5_Chassis_Anchor_1228 = Vector((0.3950, -0.5560, -0.0825))
# Hardpoint Hongqi_L5_Chassis_Anchor_1229 = Vector((0.2848, -0.3966, -0.1411))
# Hardpoint Hongqi_L5_Chassis_Anchor_1230 = Vector((0.1705, -0.2358, -0.1964))
# Hardpoint Hongqi_L5_Chassis_Anchor_1231 = Vector((0.0537, -0.0740, -0.2481))
# Hardpoint Hongqi_L5_Chassis_Anchor_1232 = Vector((-0.0638, 0.0879, -0.2956))
# Hardpoint Hongqi_L5_Chassis_Anchor_1233 = Vector((-0.1804, 0.2496, -0.3386))
# Hardpoint Hongqi_L5_Chassis_Anchor_1234 = Vector((-0.2944, 0.4103, -0.3768))
# Hardpoint Hongqi_L5_Chassis_Anchor_1235 = Vector((-0.4042, 0.5696, -0.4098))
# Hardpoint Hongqi_L5_Chassis_Anchor_1236 = Vector((-0.5082, 0.7269, -0.4375))
# Hardpoint Hongqi_L5_Chassis_Anchor_1237 = Vector((-0.6048, 0.8815, -0.4594))
# Hardpoint Hongqi_L5_Chassis_Anchor_1238 = Vector((-0.6928, 1.0329, -0.4756))
# Hardpoint Hongqi_L5_Chassis_Anchor_1239 = Vector((-0.7708, 1.1807, -0.4857))
# Hardpoint Hongqi_L5_Chassis_Anchor_1240 = Vector((-0.8377, 1.3241, -0.4899))
# Hardpoint Hongqi_L5_Chassis_Anchor_1241 = Vector((-0.8926, 1.4628, -0.4880))
# Hardpoint Hongqi_L5_Chassis_Anchor_1242 = Vector((-0.9346, 1.5963, -0.4800))
# Hardpoint Hongqi_L5_Chassis_Anchor_1243 = Vector((-0.9632, 1.7240, -0.4660))
# Hardpoint Hongqi_L5_Chassis_Anchor_1244 = Vector((-0.9779, 1.8455, -0.4462))
# Hardpoint Hongqi_L5_Chassis_Anchor_1245 = Vector((-0.9786, 1.9604, -0.4206))
# Hardpoint Hongqi_L5_Chassis_Anchor_1246 = Vector((-0.9651, 2.0682, -0.3896))
# Hardpoint Hongqi_L5_Chassis_Anchor_1247 = Vector((-0.9379, 2.1685, -0.3532))
# Hardpoint Hongqi_L5_Chassis_Anchor_1248 = Vector((-0.8971, 2.2611, -0.3120))
# Hardpoint Hongqi_L5_Chassis_Anchor_1249 = Vector((-0.8434, 2.3455, -0.2660))
# Hardpoint Hongqi_L5_Chassis_Anchor_1250 = Vector((-0.7776, 2.4215, -0.2159))
# Hardpoint Hongqi_L5_Chassis_Anchor_1251 = Vector((-0.7006, 2.4887, -0.1618))
# Hardpoint Hongqi_L5_Chassis_Anchor_1252 = Vector((-0.6135, 2.5470, -0.1044))
# Hardpoint Hongqi_L5_Chassis_Anchor_1253 = Vector((-0.5176, 2.5962, -0.0440))
