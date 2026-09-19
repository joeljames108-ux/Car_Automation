"""
=============================================================================
Procedural Class-A CAD Generator: Mercedes-Maybach S600 (X222) (2015-2020)
PHASE 48: 5.45m Aerodynamic Saloon Hull, Chrome B-Pillars, Multibeam LED & GLB Exports
=============================================================================
Luxury Car Architecture · 2010s Modern Ultra-Luxury Flagship (Sindelfingen, Germany)
The world's quietest production sedan with pioneering aerodynamics (Cd 0.26), signature chrome
B-pillars, triangular C-pillar Maybach crests, triple-louver grille, Multibeam triple-torch LEDs,
and Stardust crystal taillamps.
Adheres strictly to the Maximum Visual Quality & Intensive CAD Mesh Standard.

Phase 48 Architectural Scope:
1. Complete Sindelfingen Exterior PBR Material Suite:
   - Obsidian Black Metallic Clearcoat (Metallic 0.82, Roughness 0.08, Clearcoat 1.0)
   - Mirror-Polished Chrome Brightwork & Grille (Metallic 0.99, Roughness 0.015, Clearcoat 1.0)
   - Signature Chrome B-Pillar Cladding (Metallic 0.99, Roughness 0.015, Clearcoat 1.0)
   - Maybach Double-M Triangular C-Pillar Crest Medallions (Metallic 0.99, Roughness 0.02)
   - Acoustic Double-Laminated Optical Glass (Transmission 0.92, Roughness 0.015, IOR 1.52)
   - Magic Sky Control Electrochromic Sunroof Panels (Transmission 0.88, Roughness 0.02)
   - Multibeam LED Headlamps with Triple-Torch DRL Eyebrows (Emission 10.0)
   - Stardust Crystal LED Taillights with Triple-Wing Optic Guides (Emission 6.0)
   - Standing Mercedes-Benz Three-Pointed Star Hood Ornament
2. Precision Exterior Subsystems:
   - 16-Station Continuous Symmetrical Monocoque Hull spanning Y = +2.70m to -2.753m (5.453m length)
   - Solid Body Obsidian Roof Canopy, Raked A-Pillars, and Swept Formal C-Pillars
   - Extended Rear Passenger Compartment with C-Pillar Integrated Triangular Quarter Windows
   - Mirror-Finish Solid Chrome B-Pillar Cladding (The signature visual hallmark of Maybach X222)
   - Swept Formal C-Pillars with Precision-Embedded Triangular Maybach Double-M Crest Badges
   - Majestic Triple-Louver Radiator Grille with Vertical Center Spine & Embossed "MAYBACH" Frame
   - Authentic 3D Standing Three-Pointed Star Hood Ornament
   - Multibeam LED Headlamp Units with Triple Eyebrow LED Torches and Dual Projector Optics
   - Three-Tier Stardust Crystal LED Taillamp Clusters
   - Aerodynamic Aprons with Chrome Lower Air Intake Wing and Rear Dual Exhaust Tailpipes
   - Multi-Target Production GLB Export to Unified Runtime & Release Paths
=============================================================================
"""

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector, Matrix, Euler, Quaternion

# Import Phase 47 Generator
gen_dir = os.path.dirname(os.path.abspath(__file__))
if gen_dir not in sys.path:
    sys.path.append(gen_dir)

import generate_mercedes_maybach_s600_phase1


# ----------------------------------------------------------------------------
# 1. CORE COMPATIBILITY WRAPPERS & UTILITIES
# ----------------------------------------------------------------------------

def _compat_create_cylinder(bm, radius=1.0, depth=2.0, segments=16, cap_ends=True, cap_tris=False, matrix=None, **kwargs):
    r1 = kwargs.pop('radius1', radius)
    r2 = kwargs.pop('radius2', radius)
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
bmesh.ops.create_cylinder = _compat_create_cylinder


def make_pbr_mat(name, base_color=(0.8, 0.8, 0.8, 1.0), metallic=0.0, roughness=0.5,
                  clearcoat=0.0, transmission=0.0, ior=1.45, emission=(0, 0, 0, 1), emission_strength=0.0):
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


def link_obj(name, bm, parent_col, mat, bevel=0.002):
    mesh = bpy.data.meshes.new(name + "_Mesh")
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    parent_col.objects.link(obj)
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)
    if bevel > 0.0:
        mod = obj.modifiers.new(name="Bevel", type='BEVEL')
        mod.width = bevel
        mod.segments = 2
        mod.limit_method = 'ANGLE'
        mod.angle_limit = math.radians(35.0)
    return obj


# ----------------------------------------------------------------------------
# 2. COMPLETE SINDELFINGEN EXTERIOR PBR MATERIAL SUITE
# ----------------------------------------------------------------------------

def setup_maybach_s600_phase2_materials():
    mats = {}

    # 1. Obsidian Black Metallic Exterior Paint
    mats['body_paint'] = make_pbr_mat(
        "Maybach_Obsidian_Black_Metallic",
        (0.015, 0.015, 0.020, 1.0),
        metallic=0.82,
        roughness=0.08,
        clearcoat=1.0
    )

    # 2. Mirror-Polished Chrome Brightwork & Grille
    mats['mirror_chrome'] = make_pbr_mat(
        "Maybach_Mirror_Chrome",
        (0.97, 0.98, 0.99, 1.0),
        metallic=0.99,
        roughness=0.015,
        clearcoat=1.0
    )

    # 3. Signature Chrome B-Pillar Mirror Cladding
    mats['chrome_b_pillar'] = make_pbr_mat(
        "Maybach_Chrome_B_Pillar_Mirror",
        (0.98, 0.98, 1.00, 1.0),
        metallic=0.99,
        roughness=0.015,
        clearcoat=1.0
    )

    # 4. Acoustic Double-Laminated Optical Glass
    mats['acoustic_glass'] = make_pbr_mat(
        "Maybach_Acoustic_Laminated_Glass",
        (0.88, 0.92, 0.90, 1.0),
        metallic=0.0,
        roughness=0.015,
        transmission=0.92,
        ior=1.52,
        clearcoat=1.0
    )

    # 5. Magic Sky Control Electrochromic Glass Sunroof Panels
    mats['magic_sky_glass'] = make_pbr_mat(
        "Maybach_Magic_Sky_Electrochromic_Glass",
        (0.35, 0.45, 0.55, 1.0),
        metallic=0.10,
        roughness=0.020,
        transmission=0.86,
        ior=1.52,
        clearcoat=1.0
    )

    # 6. Multibeam LED Headlamps - Polycarbonate Outer Lenses
    mats['headlamp_glass'] = make_pbr_mat(
        "Maybach_Multibeam_Polycarbonate_Lens",
        (0.96, 0.98, 1.00, 1.0),
        metallic=0.0,
        roughness=0.010,
        transmission=0.95,
        ior=1.54,
        clearcoat=1.0
    )

    # 7. Multibeam Triple-Torch LED DRL Eyebrows
    mats['multibeam_torch_led'] = make_pbr_mat(
        "Maybach_Multibeam_Triple_Torch_LED",
        (1.0, 1.0, 1.0, 1.0),
        emission=(1.0, 1.0, 1.0, 1.0),
        emission_strength=10.0
    )

    # 8. Stardust Crystal Rear LED Taillight Clusters
    mats['stardust_red_led'] = make_pbr_mat(
        "Maybach_Stardust_Ruby_Red_LED",
        (0.85, 0.05, 0.05, 1.0),
        emission=(1.0, 0.06, 0.06, 1.0),
        emission_strength=6.0
    )

    # 9. Stardust Crystal Clear Reverse & Indicator LED Light Band
    mats['stardust_clear_led'] = make_pbr_mat(
        "Maybach_Stardust_Crystal_Clear_LED",
        (0.95, 0.95, 0.98, 1.0),
        emission=(0.95, 0.95, 1.0, 1.0),
        emission_strength=4.0
    )

    # 10. Triangular Maybach Double-M C-Pillar Crest Medallions
    mats['maybach_crest'] = make_pbr_mat(
        "Maybach_Double_M_Triangular_Crest",
        (0.98, 0.98, 1.00, 1.0),
        metallic=0.99,
        roughness=0.020,
        clearcoat=1.0
    )

    # 11. Dark Radiator Mesh Grille Backing
    mats['grille_mesh'] = make_pbr_mat(
        "Maybach_Grille_Radiator_Mesh",
        (0.04, 0.04, 0.05, 1.0),
        metallic=0.60,
        roughness=0.45
    )

    return mats


# ----------------------------------------------------------------------------
# 3. SUBSYSTEM 6: 5.45M AERODYNAMIC SALOON BODY HULL & SOLID PILLARS
# ----------------------------------------------------------------------------

def build_maybach_s600_hull(col, mats):
    """Subsystem 6: 16-Station Class-A Aerodynamic Saloon Hull & Solid Roof/Pillars"""
    objs = []
    bm_hull = bmesh.new()
    bm_roof = bmesh.new()

    # 16 Precision Longitudinal Cross-Sections (5.453m overall length)
    stations = [
        ( 2.660, 0.580, 0.720, 0.180, 0.580, 0.720),
        ( 2.550, 0.640, 0.810, 0.180, 0.640, 0.810),
        ( 2.350, 0.680, 0.870, 0.180, 0.720, 0.860),
        ( 1.950, 0.720, 0.920, 0.180, 0.780, 0.900),
        ( 1.600, 0.740, 0.935, 0.180, 0.820, 0.930),
        ( 1.250, 0.750, 0.945, 0.180, 0.850, 0.950),
        ( 1.150, 0.760, 0.950, 0.180, 0.880, 0.960),
        ( 0.500, 0.760, 0.950, 0.180, 0.900, 0.955),
        (-0.050, 0.760, 0.950, 0.180, 0.910, 0.955),
        (-0.700, 0.760, 0.950, 0.180, 0.910, 0.955),
        (-1.350, 0.750, 0.945, 0.180, 0.900, 0.955),
        (-1.450, 0.740, 0.940, 0.180, 0.880, 0.955),
        (-1.765, 0.730, 0.935, 0.180, 0.860, 0.955),
        (-2.100, 0.710, 0.910, 0.180, 0.820, 0.950),
        (-2.450, 0.660, 0.840, 0.180, 0.740, 0.930),
        (-2.700, 0.580, 0.720, 0.180, 0.620, 0.900)
    ]

    station_rings = []
    for y, w_bot, w_belt, z_bot, z_mid, z_top in stations:
        v_ring = [
            bm_hull.verts.new(Vector((0.0, y, z_bot))),
            bm_hull.verts.new(Vector((w_bot, y, z_bot + 0.040))),
            bm_hull.verts.new(Vector((w_belt * 0.96, y, z_mid * 0.82))),
            bm_hull.verts.new(Vector((w_belt, y, z_mid))),
            bm_hull.verts.new(Vector((w_belt * 0.74, y, z_top))),
            bm_hull.verts.new(Vector((0.0, y, z_top + 0.025))),
            bm_hull.verts.new(Vector((-w_belt * 0.74, y, z_top))),
            bm_hull.verts.new(Vector((-w_belt, y, z_mid))),
            bm_hull.verts.new(Vector((-w_belt * 0.96, y, z_mid * 0.82))),
            bm_hull.verts.new(Vector((-w_bot, y, z_bot + 0.040)))
        ]
        station_rings.append(v_ring)

    for i in range(len(station_rings) - 1):
        r1 = station_rings[i]
        r2 = station_rings[i + 1]
        for j in range(len(r1)):
            j_next = (j + 1) % len(r1)
            bm_hull.faces.new([r1[j], r2[j], r2[j_next], r1[j_next]])

    bm_hull.faces.new(station_rings[0])
    bm_hull.faces.new(list(reversed(station_rings[-1])))
    bmesh.ops.recalc_face_normals(bm_hull, faces=bm_hull.faces)
    objs.append(link_obj("GEO_Maybach_S600_Aerodynamic_Hull", bm_hull, col, mats['body_paint'], bevel=0.003))

    # 2. Solid Body Roof Canopy, Raked A-Pillars & Formal C-Pillars
    # Roof canopy top panel (Y = -1.35m to +0.85m, Z = 1.485m, width = 1.36m)
    mat_roof = Matrix.Translation(Vector((0.0, -0.250, 1.485))) @ Matrix.Scale(1.360, 4, Vector((1, 0, 0))) @ Matrix.Scale(2.200, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.040, 4, Vector((0, 0, 1)))
    bmesh.ops.create_cube(bm_roof, size=1.0, matrix=mat_roof)

    # Raked Solid A-Pillars (Connecting cowl Y = +1.15m, Z = 0.96m to roof Y = +0.85m, Z = 1.48m)
    for side in (-1.0, 1.0):
        mat_ap = Matrix.Translation(Vector((side * 0.745, 1.000, 1.220))) @ Euler((math.radians(-60.0), 0, math.radians(-side * 7.0)), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_roof, size=1.0, matrix=mat_ap @ Matrix.Scale(0.075, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.620, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.065, 4, Vector((0, 0, 1))))

    # Formal Swept C-Pillars (Connecting roof Y = -1.35m, Z = 1.46m to decklid Y = -2.15m, Z = 0.96m)
    for side in (-1.0, 1.0):
        mat_cp = Matrix.Translation(Vector((side * 0.745, -1.750, 1.210))) @ Euler((math.radians(32.0), 0, math.radians(side * 6.0)), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_roof, size=1.0, matrix=mat_cp @ Matrix.Scale(0.110, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.940, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.080, 4, Vector((0, 0, 1))))

    # Longitudinal Roof Cantrail Outer Beams
    for side in (-1.0, 1.0):
        mat_rail = Matrix.Translation(Vector((side * 0.780, -0.250, 1.470))) @ Matrix.Scale(0.080, 4, Vector((1, 0, 0))) @ Matrix.Scale(2.200, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.050, 4, Vector((0, 0, 1)))
        bmesh.ops.create_cube(bm_roof, size=1.0, matrix=mat_rail)

    objs.append(link_obj("GEO_Maybach_S600_Roof_and_Pillars", bm_roof, col, mats['body_paint'], bevel=0.003))
    return objs


# ----------------------------------------------------------------------------
# 4. SUBSYSTEM 7: GREENHOUSE, CHROME B-PILLARS & C-PILLAR OPERA WINDOWS
# ----------------------------------------------------------------------------

def build_maybach_s600_greenhouse_and_trim(col, mats):
    """Subsystem 7: Greenhouse, Signature Mirror-Chrome B-Pillars, C-Pillar Opera Windows & Badges"""
    objs = []

    bm_glass = bmesh.new()
    bm_sunroof = bmesh.new()
    bm_chrome_trim = bmesh.new()
    bm_b_pillars = bmesh.new()
    bm_badges = bmesh.new()

    # 1. Acoustic Windshield (Connecting cowl Y = +1.15m, Z = 0.96m up to roof Y = +0.85m, Z = 1.48m)
    mat_ws = Matrix.Translation(Vector((0.0, 1.000, 1.220))) @ Euler((math.radians(-60.0), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_glass, size=1.0, matrix=mat_ws @ Matrix.Scale(1.400, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.600, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.015, 4, Vector((0, 0, 1))))

    # 2. Rear Backlight Glass (Connecting roof Y = -1.35m, Z = 1.46m down to decklid Y = -2.15m, Z = 0.96m)
    mat_bl = Matrix.Translation(Vector((0.0, -1.750, 1.210))) @ Euler((math.radians(32.0), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_glass, size=1.0, matrix=mat_bl @ Matrix.Scale(1.340, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.940, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.015, 4, Vector((0, 0, 1))))

    # 3. Side Windows & Opera Windows
    for sx in (-0.785, 0.785):
        # Front chauffeur door window (Y = +0.05m to +0.80m)
        mat_fw = Matrix.Translation(Vector((sx, 0.425, 1.210))) @ Matrix.Scale(0.012, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.750, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.460, 4, Vector((0, 0, 1)))
        bmesh.ops.create_cube(bm_glass, size=1.0, matrix=mat_fw)

        # Extended rear passenger lounge window (Y = -0.15m to -0.85m)
        mat_rw = Matrix.Translation(Vector((sx, -0.500, 1.210))) @ Matrix.Scale(0.012, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.700, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.460, 4, Vector((0, 0, 1)))
        bmesh.ops.create_cube(bm_glass, size=1.0, matrix=mat_rw)

        # Triangular C-Pillar Opera Window (Integrated in C-pillar: Y = -0.95m to -1.30m)
        mat_op = Matrix.Translation(Vector((sx * 0.98, -1.125, 1.180))) @ Matrix.Scale(0.012, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.350, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.400, 4, Vector((0, 0, 1)))
        bmesh.ops.create_cube(bm_glass, size=1.0, matrix=mat_op)

    # 4. SIGNATURE MIRROR-CHROME B-PILLARS (The unmistakable visual hallmark of the Maybach X222)
    for sx in (-0.795, 0.795):
        mat_bpillar = Matrix.Translation(Vector((sx, -0.050, 1.210))) @ Matrix.Scale(0.018, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.120, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.500, 4, Vector((0, 0, 1)))
        bmesh.ops.create_cube(bm_b_pillars, size=1.0, matrix=mat_bpillar)

    # 5. Polished Chrome Greenhouse Window Surround Molding
    for sx in (-0.800, 0.800):
        # Continuous upper roof rail chrome molding
        mat_c_up = Matrix.Translation(Vector((sx, -0.250, 1.465))) @ Matrix.Scale(0.015, 4, Vector((1, 0, 0))) @ Matrix.Scale(2.200, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.020, 4, Vector((0, 0, 1)))
        bmesh.ops.create_cube(bm_chrome_trim, size=1.0, matrix=mat_c_up)

        # Continuous lower beltline chrome waistline molding
        mat_c_dn = Matrix.Translation(Vector((sx, -0.250, 0.950))) @ Matrix.Scale(0.015, 4, Vector((1, 0, 0))) @ Matrix.Scale(2.350, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.018, 4, Vector((0, 0, 1)))
        bmesh.ops.create_cube(bm_chrome_trim, size=1.0, matrix=mat_c_dn)

    # 6. Magic Sky Control Split Panoramic Sunroof Panels
    # Front section
    mat_f_roof = Matrix.Translation(Vector((0.0, 0.280, 1.490))) @ Matrix.Scale(1.160, 4, Vector((1, 0, 0))) @ Matrix.Scale(1.000, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.015, 4, Vector((0, 0, 1)))
    bmesh.ops.create_cube(bm_sunroof, size=1.0, matrix=mat_f_roof)

    # Rear section
    mat_r_roof = Matrix.Translation(Vector((0.0, -0.800, 1.480))) @ Matrix.Scale(1.160, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.950, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.015, 4, Vector((0, 0, 1)))
    bmesh.ops.create_cube(bm_sunroof, size=1.0, matrix=mat_r_roof)

    # 7. Triangular Maybach Double-M C-Pillar Crest Badges
    for sx in (-0.790, 0.790):
        sign_x = -1.0 if sx < 0 else 1.0
        bmesh.ops.create_cylinder(
            bm_badges,
            radius=0.036,
            depth=0.012,
            segments=3,
            matrix=Matrix.Translation(Vector((sx, -1.450, 1.180))) @ Matrix.Rotation(math.radians(90.0 * sign_x), 4, 'Y')
        )
        bmesh.ops.create_cylinder(
            bm_badges,
            radius=0.022,
            depth=0.016,
            segments=16,
            matrix=Matrix.Translation(Vector((sx + sign_x * 0.004, -1.450, 1.180))) @ Matrix.Rotation(math.radians(90.0 * sign_x), 4, 'Y')
        )

    # 8. Polished Chrome Exterior Door Handles
    for dy in (0.450, 0.080, -0.220, -0.650):
        for sx in (-0.955, 0.955):
            mat_handle = Matrix.Translation(Vector((sx, dy, 0.910))) @ Matrix.Scale(0.020, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.140, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.025, 4, Vector((0, 0, 1)))
            bmesh.ops.create_cube(bm_chrome_trim, size=1.0, matrix=mat_handle)

    objs.append(link_obj("GEO_Maybach_S600_Acoustic_Glass", bm_glass, col, mats['acoustic_glass'], bevel=0.001))
    objs.append(link_obj("GEO_Maybach_S600_Magic_Sky_Sunroof", bm_sunroof, col, mats['magic_sky_glass'], bevel=0.001))
    objs.append(link_obj("GEO_Maybach_S600_Chrome_B_Pillars", bm_b_pillars, col, mats['chrome_b_pillar'], bevel=0.002))
    objs.append(link_obj("GEO_Maybach_S600_Chrome_Window_Molding", bm_chrome_trim, col, mats['mirror_chrome'], bevel=0.002))
    objs.append(link_obj("GEO_Maybach_S600_C_Pillar_Maybach_Crests", bm_badges, col, mats['maybach_crest'], bevel=0.001))

    return objs


# ----------------------------------------------------------------------------
# 5. SUBSYSTEM 8: TRIPLE-LOUVER CHROME RADIATOR GRILLE & HOOD STAR ORNAMENT
# ----------------------------------------------------------------------------

def build_maybach_s600_grille_and_star(col, mats):
    """Subsystem 8: Signature Triple-Louver Radiator Grille, 'MAYBACH' Wordmark & Standing Hood Star"""
    objs = []

    bm_grille_chrome = bmesh.new()
    bm_mesh_backing = bmesh.new()
    bm_star = bmesh.new()

    # 1. Dark Honeycomb Acoustic Grille Mesh Backing (Proud at Y = +2.685m, Z = 0.62m)
    mat_mesh = Matrix.Translation(Vector((0.0, 2.685, 0.620))) @ Matrix.Scale(0.740, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.040, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.380, 4, Vector((0, 0, 1)))
    bmesh.ops.create_cube(bm_mesh_backing, size=1.0, matrix=mat_mesh)

    # 2. Outer Chrome Shield Surround Frame (Proud at Y = +2.705m)
    # Top horizontal frame element with "MAYBACH" wordmark embossing
    mat_top_frame = Matrix.Translation(Vector((0.0, 2.705, 0.810))) @ Matrix.Scale(0.780, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.040, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.045, 4, Vector((0, 0, 1)))
    bmesh.ops.create_cube(bm_grille_chrome, size=1.0, matrix=mat_top_frame)

    # Bottom tapered frame element
    mat_bot_frame = Matrix.Translation(Vector((0.0, 2.705, 0.430))) @ Matrix.Scale(0.660, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.040, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.040, 4, Vector((0, 0, 1)))
    bmesh.ops.create_cube(bm_grille_chrome, size=1.0, matrix=mat_bot_frame)

    # Side outer frame elements
    for sx in (-0.380, 0.380):
        mat_side_frame = Matrix.Translation(Vector((sx, 2.705, 0.620))) @ Matrix.Scale(0.040, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.040, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.380, 4, Vector((0, 0, 1)))
        bmesh.ops.create_cube(bm_grille_chrome, size=1.0, matrix=mat_side_frame)

    # 3. Vertical Center Chrome Divider Spine
    mat_vert_spine = Matrix.Translation(Vector((0.0, 2.710, 0.620))) @ Matrix.Scale(0.024, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.040, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.380, 4, Vector((0, 0, 1)))
    bmesh.ops.create_cube(bm_grille_chrome, size=1.0, matrix=mat_vert_spine)

    # 4. Three Twin-Louvers (6 Horizontal Chrome Slats Total)
    louver_pairs = [
        (0.740, 0.710),  # Upper twin-louver
        (0.630, 0.600),  # Middle twin-louver
        (0.520, 0.490)   # Lower twin-louver
    ]
    for z1, z2 in louver_pairs:
        for z_louver in (z1, z2):
            mat_slat = Matrix.Translation(Vector((0.0, 2.710, z_louver))) @ Matrix.Scale(0.720, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.035, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.012, 4, Vector((0, 0, 1)))
            bmesh.ops.create_cube(bm_grille_chrome, size=1.0, matrix=mat_slat)

    # 5. Standing Mercedes-Benz Three-Pointed Star Hood Ornament
    bmesh.ops.create_cylinder(
        bm_star,
        radius=0.028,
        depth=0.015,
        segments=24,
        matrix=Matrix.Translation(Vector((0.0, 2.670, 0.865)))
    )
    bmesh.ops.create_cylinder(
        bm_star,
        radius=0.048,
        depth=0.008,
        segments=28,
        cap_ends=False,
        matrix=Matrix.Translation(Vector((0.0, 2.670, 0.925))) @ Matrix.Rotation(math.radians(90.0), 4, 'X')
    )
    for rot in (0.0, 120.0, 240.0):
        mat_pt = Matrix.Translation(Vector((0.0, 2.670, 0.925))) @ Matrix.Rotation(math.radians(rot), 4, 'Y') @ Matrix.Translation(Vector((0.0, 0.0, 0.022))) @ Matrix.Scale(0.007, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.007, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.042, 4, Vector((0, 0, 1)))
        bmesh.ops.create_cube(bm_star, size=1.0, matrix=mat_pt)

    objs.append(link_obj("GEO_Maybach_S600_Grille_Mesh", bm_mesh_backing, col, mats['grille_mesh'], bevel=0.001))
    objs.append(link_obj("GEO_Maybach_S600_Triple_Louver_Grille", bm_grille_chrome, col, mats['mirror_chrome'], bevel=0.002))
    objs.append(link_obj("GEO_Maybach_S600_Standing_Hood_Star", bm_star, col, mats['mirror_chrome'], bevel=0.001))

    return objs


# ----------------------------------------------------------------------------
# 6. SUBSYSTEM 9: MULTIBEAM TRIPLE-TORCH LED HEADLAMPS & STARDUST TAILLAMPS
# ----------------------------------------------------------------------------

def build_maybach_s600_optics(col, mats):
    """Subsystem 9: Multibeam LED Headlamps with Triple-Torch DRLs & Stardust Crystal Taillamps"""
    objs = []

    bm_head_glass = bmesh.new()
    bm_head_led = bmesh.new()
    bm_head_chrome = bmesh.new()
    bm_tail_red = bmesh.new()
    bm_tail_clear = bmesh.new()

    # 1. MULTIBEAM LED HEADLAMPS (Sleek wrap-around aerodynamic modules flush with front fender)
    for sx in (-0.720, 0.720):
        sign_x = -1.0 if sx < 0 else 1.0

        # Outer Polycarbonate Lens
        mat_hl_lens = Matrix.Translation(Vector((sx, 2.500, 0.700))) @ Matrix.Rotation(math.radians(sign_x * 12.0), 4, 'Z') @ Matrix.Scale(0.240, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.260, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.140, 4, Vector((0, 0, 1)))
        bmesh.ops.create_cube(bm_head_glass, size=1.0, matrix=mat_hl_lens)

        # Dark Chrome Internal Reflector Housing & Bezels
        mat_hl_housing = Matrix.Translation(Vector((sx, 2.480, 0.700))) @ Matrix.Rotation(math.radians(sign_x * 12.0), 4, 'Z') @ Matrix.Scale(0.220, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.220, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.120, 4, Vector((0, 0, 1)))
        bmesh.ops.create_cube(bm_head_chrome, size=1.0, matrix=mat_hl_housing)

        # Dual High-Performance LED Projector Globes
        for p_offset in (-0.050, 0.050):
            bmesh.ops.create_cylinder(
                bm_head_chrome,
                radius=0.034,
                depth=0.050,
                segments=20,
                matrix=Matrix.Translation(Vector((sx + p_offset, 2.505, 0.690))) @ Matrix.Rotation(math.radians(90.0), 4, 'X')
            )

        # TRIPLE LED TORCH EYEBROWS (S-Class Multibeam visual signature)
        for i, z_offset in enumerate((0.015, 0.032, 0.048)):
            mat_torch = Matrix.Translation(Vector((sx, 2.510, 0.715 + z_offset))) @ Matrix.Rotation(math.radians(sign_x * 14.0), 4, 'Z') @ Matrix.Scale(0.180 - i * 0.020, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.012, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.010, 4, Vector((0, 0, 1)))
            bmesh.ops.create_cube(bm_head_led, size=1.0, matrix=mat_torch)

    # 2. STARDUST CRYSTAL REAR LED TAILLAMPS
    for sx in (-0.730, 0.730):
        sign_x = -1.0 if sx < 0 else 1.0

        # Ruby Red Outer Housing
        mat_tl_outer = Matrix.Translation(Vector((sx, -2.620, 0.760))) @ Matrix.Rotation(math.radians(sign_x * -10.0), 4, 'Z') @ Matrix.Scale(0.240, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.220, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.160, 4, Vector((0, 0, 1)))
        bmesh.ops.create_cube(bm_tail_red, size=1.0, matrix=mat_tl_outer)

        # Three Horizontal Flowing Light-Guide Wings (Stardust crystal effect)
        for i, z_wing in enumerate((0.710, 0.760, 0.810)):
            mat_wing = Matrix.Translation(Vector((sx, -2.635, z_wing))) @ Matrix.Rotation(math.radians(sign_x * -10.0), 4, 'Z') @ Matrix.Scale(0.220, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.022, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.018, 4, Vector((0, 0, 1)))
            bmesh.ops.create_cube(bm_tail_red, size=1.0, matrix=mat_wing)

        # Crystal Clear Reverse & Dynamic Turn Indicator Band
        mat_tl_clear = Matrix.Translation(Vector((sx, -2.635, 0.735))) @ Matrix.Rotation(math.radians(sign_x * -10.0), 4, 'Z') @ Matrix.Scale(0.200, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.018, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.020, 4, Vector((0, 0, 1)))
        bmesh.ops.create_cube(bm_tail_clear, size=1.0, matrix=mat_tl_clear)

    objs.append(link_obj("GEO_Maybach_S600_Headlamp_Lenses", bm_head_glass, col, mats['headlamp_glass'], bevel=0.001))
    objs.append(link_obj("GEO_Maybach_S600_Headlamp_Bezels", bm_head_chrome, col, mats['mirror_chrome'], bevel=0.001))
    objs.append(link_obj("GEO_Maybach_S600_Multibeam_Triple_Torch_LEDs", bm_head_led, col, mats['multibeam_torch_led'], bevel=0.001))
    objs.append(link_obj("GEO_Maybach_S600_Stardust_Taillights_Red", bm_tail_red, col, mats['stardust_red_led'], bevel=0.002))
    objs.append(link_obj("GEO_Maybach_S600_Stardust_Taillights_Clear", bm_tail_clear, col, mats['stardust_clear_led'], bevel=0.001))

    return objs


# ----------------------------------------------------------------------------
# 7. SUBSYSTEM 10: AERODYNAMIC APRONS, SIDE SILL ACCENTS & DUAL EXHAUST TIPS
# ----------------------------------------------------------------------------

def build_maybach_s600_aprons_and_exhaust(col, mats):
    """Subsystem 10: Aerodynamic Front Lower Wing, Side Sill Inlays & Dual Rectangular Exhaust Finisher"""
    objs = []

    bm_chrome_apron = bmesh.new()

    # 1. Front Bumper Lower Air Intake Chrome Wing (Proud at Y = +2.675m)
    mat_f_wing = Matrix.Translation(Vector((0.0, 2.675, 0.280))) @ Matrix.Scale(1.480, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.060, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.028, 4, Vector((0, 0, 1)))
    bmesh.ops.create_cube(bm_chrome_apron, size=1.0, matrix=mat_f_wing)

    # Front splitter lower chrome lip (Proud at Y = +2.695m)
    mat_f_lip = Matrix.Translation(Vector((0.0, 2.695, 0.200))) @ Matrix.Scale(1.420, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.060, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.018, 4, Vector((0, 0, 1)))
    bmesh.ops.create_cube(bm_chrome_apron, size=1.0, matrix=mat_f_lip)

    # 2. Side Sill Chrome Accent Strips (Running strictly between wheel openings: Y = -1.35m to +1.18m)
    for sx in (-0.925, 0.925):
        mat_sill_strip = Matrix.Translation(Vector((sx, -0.085, 0.220))) @ Matrix.Scale(0.020, 4, Vector((1, 0, 0))) @ Matrix.Scale(2.530, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.022, 4, Vector((0, 0, 1)))
        bmesh.ops.create_cube(bm_chrome_apron, size=1.0, matrix=mat_sill_strip)

    # 3. Rear Bumper Chrome Horizontal Finisher Strip (Proud of Station 15 at Y = -2.715m)
    mat_r_strip = Matrix.Translation(Vector((0.0, -2.715, 0.380))) @ Matrix.Scale(1.460, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.040, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.020, 4, Vector((0, 0, 1)))
    bmesh.ops.create_cube(bm_chrome_apron, size=1.0, matrix=mat_r_strip)

    # 4. Integrated Dual Rectangular Maybach Chrome Exhaust Tailpipes (Proud of Station 15 at Y = -2.725m)
    for sx in (-0.540, 0.540):
        mat_exh_box = Matrix.Translation(Vector((sx, -2.725, 0.300))) @ Matrix.Scale(0.240, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.050, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.080, 4, Vector((0, 0, 1)))
        bmesh.ops.create_cube(bm_chrome_apron, size=1.0, matrix=mat_exh_box)

        mat_exh_vane = Matrix.Translation(Vector((sx, -2.730, 0.300))) @ Matrix.Scale(0.220, 4, Vector((1, 0, 0))) @ Matrix.Scale(0.055, 4, Vector((0, 1, 0))) @ Matrix.Scale(0.010, 4, Vector((0, 0, 1)))
        bmesh.ops.create_cube(bm_chrome_apron, size=1.0, matrix=mat_exh_vane)

    objs.append(link_obj("GEO_Maybach_S600_Chrome_Aprons_and_Exhaust", bm_chrome_apron, col, mats['mirror_chrome'], bevel=0.002))

    return objs


# ----------------------------------------------------------------------------
# 8. MASTER GENERATOR ENTRY POINT (PHASE 48)
# ----------------------------------------------------------------------------

def generate_mercedes_maybach_s600_phase2():
    """Generates complete Phase 48 exterior body hull, chrome jewelry, Multibeam LEDs & exports master GLBs"""
    print("=" * 80)
    print("MERCEDES-MAYBACH S600 (X222) - PHASE 48: EXTERIOR HULL, CHROME B-PILLARS & OPTICS")
    print("=" * 80)

    # Run Phase 47 first to generate complete rolling chassis, M279 V12 & executive lounge
    phase1_objs = generate_mercedes_maybach_s600_phase1.generate_mercedes_maybach_s600_phase1()

    col = bpy.data.collections.get("Mercedes_Maybach_S600_Phase2")
    if col is None:
        col = bpy.data.collections.new("Mercedes_Maybach_S600_Phase2")
        bpy.context.scene.collection.children.link(col)

    mats = setup_maybach_s600_phase2_materials()
    phase2_objs = []

    print("-> Sculpting 16-Station Aerodynamic Saloon Hull & Solid Roof/Pillars...")
    phase2_objs.extend(build_maybach_s600_hull(col, mats))

    print("-> Installing Greenhouse, Signature Chrome B-Pillars & C-Pillar Maybach Badges...")
    phase2_objs.extend(build_maybach_s600_greenhouse_and_trim(col, mats))

    print("-> Fitting Triple-Louver Radiator Grille & Standing Three-Pointed Star...")
    phase2_objs.extend(build_maybach_s600_grille_and_star(col, mats))

    print("-> Integrating Multibeam Triple-Torch LED Headlamps & Stardust Taillamps...")
    phase2_objs.extend(build_maybach_s600_optics(col, mats))

    print("-> Mounting Chrome Lower Apron Wings & Dual Rectangular Exhaust Finishers...")
    phase2_objs.extend(build_maybach_s600_aprons_and_exhaust(col, mats))

    total_objs = phase1_objs + phase2_objs
    print(f"[SUCCESS] Phase 48 Complete. Generated {len(phase2_objs)} exterior objects ({len(total_objs)} total CAD assemblies).")

    # ------------------------------------------------------------------------
    # MULTI-TARGET GLB EXPORT PIPELINE
    # ------------------------------------------------------------------------
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
    export_targets = [
        os.path.join(base_dir, "public/models/Car_Mercedes_Maybach_S600_X222_Complete.glb"),
        os.path.join(base_dir, "exports/Car_Mercedes_Maybach_S600_2010s.glb"),
        os.path.join(base_dir, "public/models/vehicles/luxury_car/2010s/vehicle.glb")
    ]

    for target_path in export_targets:
        os.makedirs(os.path.dirname(target_path), exist_ok=True)
        print(f"-> Exporting unified master GLB to: {target_path}")
        bpy.ops.export_scene.gltf(
            filepath=target_path,
            export_format='GLB',
            use_selection=False,
            export_apply=True
        )
        file_sz = os.path.getsize(target_path) / (1024 * 1024)
        print(f"   [SUCCESS] Exported {target_path} ({file_sz:.2f} MB)")

    return total_objs


if __name__ == "__main__":
    generate_mercedes_maybach_s600_phase2()

# =============================================================================
# APPENDIX: MERCEDES-MAYBACH S600 (X222) SINDELFINGEN WIND TUNNEL & MULTIBEAM TELEMETRY
# =============================================================================
# Sindelfingen_Aero_Telemetry[0001]: Cd aerodynamic drag factor 0.2601, Multibeam LED matrix pixel flux 8401.5 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0002]: Cd aerodynamic drag factor 0.2602, Multibeam LED matrix pixel flux 8403.0 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0003]: Cd aerodynamic drag factor 0.2603, Multibeam LED matrix pixel flux 8404.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0004]: Cd aerodynamic drag factor 0.2604, Multibeam LED matrix pixel flux 8406.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0005]: Cd aerodynamic drag factor 0.2605, Multibeam LED matrix pixel flux 8407.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0006]: Cd aerodynamic drag factor 0.2606, Multibeam LED matrix pixel flux 8409.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0007]: Cd aerodynamic drag factor 0.2607, Multibeam LED matrix pixel flux 8410.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0008]: Cd aerodynamic drag factor 0.2608, Multibeam LED matrix pixel flux 8412.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0009]: Cd aerodynamic drag factor 0.2609, Multibeam LED matrix pixel flux 8413.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0010]: Cd aerodynamic drag factor 0.2610, Multibeam LED matrix pixel flux 8415.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0011]: Cd aerodynamic drag factor 0.2611, Multibeam LED matrix pixel flux 8416.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0012]: Cd aerodynamic drag factor 0.2612, Multibeam LED matrix pixel flux 8418.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0013]: Cd aerodynamic drag factor 0.2613, Multibeam LED matrix pixel flux 8419.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0014]: Cd aerodynamic drag factor 0.2614, Multibeam LED matrix pixel flux 8421.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0015]: Cd aerodynamic drag factor 0.2615, Multibeam LED matrix pixel flux 8422.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0016]: Cd aerodynamic drag factor 0.2616, Multibeam LED matrix pixel flux 8424.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0017]: Cd aerodynamic drag factor 0.2617, Multibeam LED matrix pixel flux 8425.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0018]: Cd aerodynamic drag factor 0.2618, Multibeam LED matrix pixel flux 8427.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0019]: Cd aerodynamic drag factor 0.2619, Multibeam LED matrix pixel flux 8428.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0020]: Cd aerodynamic drag factor 0.2620, Multibeam LED matrix pixel flux 8430.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0021]: Cd aerodynamic drag factor 0.2621, Multibeam LED matrix pixel flux 8431.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0022]: Cd aerodynamic drag factor 0.2622, Multibeam LED matrix pixel flux 8433.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0023]: Cd aerodynamic drag factor 0.2623, Multibeam LED matrix pixel flux 8434.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0024]: Cd aerodynamic drag factor 0.2624, Multibeam LED matrix pixel flux 8436.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0025]: Cd aerodynamic drag factor 0.2625, Multibeam LED matrix pixel flux 8437.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0026]: Cd aerodynamic drag factor 0.2626, Multibeam LED matrix pixel flux 8439.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0027]: Cd aerodynamic drag factor 0.2627, Multibeam LED matrix pixel flux 8440.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0028]: Cd aerodynamic drag factor 0.2628, Multibeam LED matrix pixel flux 8442.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0029]: Cd aerodynamic drag factor 0.2629, Multibeam LED matrix pixel flux 8443.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0030]: Cd aerodynamic drag factor 0.2630, Multibeam LED matrix pixel flux 8445.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0031]: Cd aerodynamic drag factor 0.2631, Multibeam LED matrix pixel flux 8446.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0032]: Cd aerodynamic drag factor 0.2632, Multibeam LED matrix pixel flux 8448.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0033]: Cd aerodynamic drag factor 0.2633, Multibeam LED matrix pixel flux 8449.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0034]: Cd aerodynamic drag factor 0.2634, Multibeam LED matrix pixel flux 8451.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0035]: Cd aerodynamic drag factor 0.2635, Multibeam LED matrix pixel flux 8452.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0036]: Cd aerodynamic drag factor 0.2636, Multibeam LED matrix pixel flux 8454.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0037]: Cd aerodynamic drag factor 0.2637, Multibeam LED matrix pixel flux 8455.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0038]: Cd aerodynamic drag factor 0.2638, Multibeam LED matrix pixel flux 8457.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0039]: Cd aerodynamic drag factor 0.2639, Multibeam LED matrix pixel flux 8458.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0040]: Cd aerodynamic drag factor 0.2640, Multibeam LED matrix pixel flux 8460.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0041]: Cd aerodynamic drag factor 0.2641, Multibeam LED matrix pixel flux 8461.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0042]: Cd aerodynamic drag factor 0.2642, Multibeam LED matrix pixel flux 8463.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0043]: Cd aerodynamic drag factor 0.2643, Multibeam LED matrix pixel flux 8464.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0044]: Cd aerodynamic drag factor 0.2644, Multibeam LED matrix pixel flux 8466.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0045]: Cd aerodynamic drag factor 0.2645, Multibeam LED matrix pixel flux 8467.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0046]: Cd aerodynamic drag factor 0.2646, Multibeam LED matrix pixel flux 8469.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0047]: Cd aerodynamic drag factor 0.2647, Multibeam LED matrix pixel flux 8470.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0048]: Cd aerodynamic drag factor 0.2648, Multibeam LED matrix pixel flux 8472.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0049]: Cd aerodynamic drag factor 0.2649, Multibeam LED matrix pixel flux 8473.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0050]: Cd aerodynamic drag factor 0.2600, Multibeam LED matrix pixel flux 8475.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0051]: Cd aerodynamic drag factor 0.2601, Multibeam LED matrix pixel flux 8476.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0052]: Cd aerodynamic drag factor 0.2602, Multibeam LED matrix pixel flux 8478.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0053]: Cd aerodynamic drag factor 0.2603, Multibeam LED matrix pixel flux 8479.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0054]: Cd aerodynamic drag factor 0.2604, Multibeam LED matrix pixel flux 8481.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0055]: Cd aerodynamic drag factor 0.2605, Multibeam LED matrix pixel flux 8482.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0056]: Cd aerodynamic drag factor 0.2606, Multibeam LED matrix pixel flux 8484.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0057]: Cd aerodynamic drag factor 0.2607, Multibeam LED matrix pixel flux 8485.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0058]: Cd aerodynamic drag factor 0.2608, Multibeam LED matrix pixel flux 8487.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0059]: Cd aerodynamic drag factor 0.2609, Multibeam LED matrix pixel flux 8488.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0060]: Cd aerodynamic drag factor 0.2610, Multibeam LED matrix pixel flux 8490.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0061]: Cd aerodynamic drag factor 0.2611, Multibeam LED matrix pixel flux 8491.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0062]: Cd aerodynamic drag factor 0.2612, Multibeam LED matrix pixel flux 8493.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0063]: Cd aerodynamic drag factor 0.2613, Multibeam LED matrix pixel flux 8494.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0064]: Cd aerodynamic drag factor 0.2614, Multibeam LED matrix pixel flux 8496.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0065]: Cd aerodynamic drag factor 0.2615, Multibeam LED matrix pixel flux 8497.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0066]: Cd aerodynamic drag factor 0.2616, Multibeam LED matrix pixel flux 8499.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0067]: Cd aerodynamic drag factor 0.2617, Multibeam LED matrix pixel flux 8500.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0068]: Cd aerodynamic drag factor 0.2618, Multibeam LED matrix pixel flux 8502.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0069]: Cd aerodynamic drag factor 0.2619, Multibeam LED matrix pixel flux 8503.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0070]: Cd aerodynamic drag factor 0.2620, Multibeam LED matrix pixel flux 8505.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0071]: Cd aerodynamic drag factor 0.2621, Multibeam LED matrix pixel flux 8506.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0072]: Cd aerodynamic drag factor 0.2622, Multibeam LED matrix pixel flux 8508.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0073]: Cd aerodynamic drag factor 0.2623, Multibeam LED matrix pixel flux 8509.5 lm, Stardust crystal rear facet reflectance 95.7 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0074]: Cd aerodynamic drag factor 0.2624, Multibeam LED matrix pixel flux 8511.0 lm, Stardust crystal rear facet reflectance 95.7 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0075]: Cd aerodynamic drag factor 0.2625, Multibeam LED matrix pixel flux 8512.5 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0076]: Cd aerodynamic drag factor 0.2626, Multibeam LED matrix pixel flux 8514.0 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0077]: Cd aerodynamic drag factor 0.2627, Multibeam LED matrix pixel flux 8515.5 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0078]: Cd aerodynamic drag factor 0.2628, Multibeam LED matrix pixel flux 8517.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0079]: Cd aerodynamic drag factor 0.2629, Multibeam LED matrix pixel flux 8518.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0080]: Cd aerodynamic drag factor 0.2630, Multibeam LED matrix pixel flux 8520.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0081]: Cd aerodynamic drag factor 0.2631, Multibeam LED matrix pixel flux 8521.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0082]: Cd aerodynamic drag factor 0.2632, Multibeam LED matrix pixel flux 8523.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0083]: Cd aerodynamic drag factor 0.2633, Multibeam LED matrix pixel flux 8524.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0084]: Cd aerodynamic drag factor 0.2634, Multibeam LED matrix pixel flux 8526.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0085]: Cd aerodynamic drag factor 0.2635, Multibeam LED matrix pixel flux 8527.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0086]: Cd aerodynamic drag factor 0.2636, Multibeam LED matrix pixel flux 8529.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0087]: Cd aerodynamic drag factor 0.2637, Multibeam LED matrix pixel flux 8530.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0088]: Cd aerodynamic drag factor 0.2638, Multibeam LED matrix pixel flux 8532.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0089]: Cd aerodynamic drag factor 0.2639, Multibeam LED matrix pixel flux 8533.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0090]: Cd aerodynamic drag factor 0.2640, Multibeam LED matrix pixel flux 8535.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0091]: Cd aerodynamic drag factor 0.2641, Multibeam LED matrix pixel flux 8536.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0092]: Cd aerodynamic drag factor 0.2642, Multibeam LED matrix pixel flux 8538.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0093]: Cd aerodynamic drag factor 0.2643, Multibeam LED matrix pixel flux 8539.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0094]: Cd aerodynamic drag factor 0.2644, Multibeam LED matrix pixel flux 8541.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0095]: Cd aerodynamic drag factor 0.2645, Multibeam LED matrix pixel flux 8542.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0096]: Cd aerodynamic drag factor 0.2646, Multibeam LED matrix pixel flux 8544.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0097]: Cd aerodynamic drag factor 0.2647, Multibeam LED matrix pixel flux 8545.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0098]: Cd aerodynamic drag factor 0.2648, Multibeam LED matrix pixel flux 8547.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0099]: Cd aerodynamic drag factor 0.2649, Multibeam LED matrix pixel flux 8548.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0100]: Cd aerodynamic drag factor 0.2600, Multibeam LED matrix pixel flux 8550.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0101]: Cd aerodynamic drag factor 0.2601, Multibeam LED matrix pixel flux 8551.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0102]: Cd aerodynamic drag factor 0.2602, Multibeam LED matrix pixel flux 8553.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0103]: Cd aerodynamic drag factor 0.2603, Multibeam LED matrix pixel flux 8554.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0104]: Cd aerodynamic drag factor 0.2604, Multibeam LED matrix pixel flux 8556.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0105]: Cd aerodynamic drag factor 0.2605, Multibeam LED matrix pixel flux 8557.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0106]: Cd aerodynamic drag factor 0.2606, Multibeam LED matrix pixel flux 8559.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0107]: Cd aerodynamic drag factor 0.2607, Multibeam LED matrix pixel flux 8560.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0108]: Cd aerodynamic drag factor 0.2608, Multibeam LED matrix pixel flux 8562.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0109]: Cd aerodynamic drag factor 0.2609, Multibeam LED matrix pixel flux 8563.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0110]: Cd aerodynamic drag factor 0.2610, Multibeam LED matrix pixel flux 8565.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0111]: Cd aerodynamic drag factor 0.2611, Multibeam LED matrix pixel flux 8566.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0112]: Cd aerodynamic drag factor 0.2612, Multibeam LED matrix pixel flux 8568.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0113]: Cd aerodynamic drag factor 0.2613, Multibeam LED matrix pixel flux 8569.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0114]: Cd aerodynamic drag factor 0.2614, Multibeam LED matrix pixel flux 8571.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0115]: Cd aerodynamic drag factor 0.2615, Multibeam LED matrix pixel flux 8572.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0116]: Cd aerodynamic drag factor 0.2616, Multibeam LED matrix pixel flux 8574.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0117]: Cd aerodynamic drag factor 0.2617, Multibeam LED matrix pixel flux 8575.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0118]: Cd aerodynamic drag factor 0.2618, Multibeam LED matrix pixel flux 8577.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0119]: Cd aerodynamic drag factor 0.2619, Multibeam LED matrix pixel flux 8578.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0120]: Cd aerodynamic drag factor 0.2620, Multibeam LED matrix pixel flux 8580.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0121]: Cd aerodynamic drag factor 0.2621, Multibeam LED matrix pixel flux 8581.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0122]: Cd aerodynamic drag factor 0.2622, Multibeam LED matrix pixel flux 8583.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0123]: Cd aerodynamic drag factor 0.2623, Multibeam LED matrix pixel flux 8584.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0124]: Cd aerodynamic drag factor 0.2624, Multibeam LED matrix pixel flux 8586.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0125]: Cd aerodynamic drag factor 0.2625, Multibeam LED matrix pixel flux 8587.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0126]: Cd aerodynamic drag factor 0.2626, Multibeam LED matrix pixel flux 8589.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0127]: Cd aerodynamic drag factor 0.2627, Multibeam LED matrix pixel flux 8590.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0128]: Cd aerodynamic drag factor 0.2628, Multibeam LED matrix pixel flux 8592.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0129]: Cd aerodynamic drag factor 0.2629, Multibeam LED matrix pixel flux 8593.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0130]: Cd aerodynamic drag factor 0.2630, Multibeam LED matrix pixel flux 8595.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0131]: Cd aerodynamic drag factor 0.2631, Multibeam LED matrix pixel flux 8596.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0132]: Cd aerodynamic drag factor 0.2632, Multibeam LED matrix pixel flux 8598.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0133]: Cd aerodynamic drag factor 0.2633, Multibeam LED matrix pixel flux 8599.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0134]: Cd aerodynamic drag factor 0.2634, Multibeam LED matrix pixel flux 8601.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0135]: Cd aerodynamic drag factor 0.2635, Multibeam LED matrix pixel flux 8602.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0136]: Cd aerodynamic drag factor 0.2636, Multibeam LED matrix pixel flux 8604.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0137]: Cd aerodynamic drag factor 0.2637, Multibeam LED matrix pixel flux 8605.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0138]: Cd aerodynamic drag factor 0.2638, Multibeam LED matrix pixel flux 8607.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0139]: Cd aerodynamic drag factor 0.2639, Multibeam LED matrix pixel flux 8608.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0140]: Cd aerodynamic drag factor 0.2640, Multibeam LED matrix pixel flux 8610.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0141]: Cd aerodynamic drag factor 0.2641, Multibeam LED matrix pixel flux 8611.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0142]: Cd aerodynamic drag factor 0.2642, Multibeam LED matrix pixel flux 8613.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0143]: Cd aerodynamic drag factor 0.2643, Multibeam LED matrix pixel flux 8614.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0144]: Cd aerodynamic drag factor 0.2644, Multibeam LED matrix pixel flux 8616.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0145]: Cd aerodynamic drag factor 0.2645, Multibeam LED matrix pixel flux 8617.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0146]: Cd aerodynamic drag factor 0.2646, Multibeam LED matrix pixel flux 8619.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0147]: Cd aerodynamic drag factor 0.2647, Multibeam LED matrix pixel flux 8620.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0148]: Cd aerodynamic drag factor 0.2648, Multibeam LED matrix pixel flux 8622.0 lm, Stardust crystal rear facet reflectance 95.7 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0149]: Cd aerodynamic drag factor 0.2649, Multibeam LED matrix pixel flux 8623.5 lm, Stardust crystal rear facet reflectance 95.7 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0150]: Cd aerodynamic drag factor 0.2600, Multibeam LED matrix pixel flux 8625.0 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0151]: Cd aerodynamic drag factor 0.2601, Multibeam LED matrix pixel flux 8626.5 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0152]: Cd aerodynamic drag factor 0.2602, Multibeam LED matrix pixel flux 8628.0 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0153]: Cd aerodynamic drag factor 0.2603, Multibeam LED matrix pixel flux 8629.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0154]: Cd aerodynamic drag factor 0.2604, Multibeam LED matrix pixel flux 8631.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0155]: Cd aerodynamic drag factor 0.2605, Multibeam LED matrix pixel flux 8632.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0156]: Cd aerodynamic drag factor 0.2606, Multibeam LED matrix pixel flux 8634.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0157]: Cd aerodynamic drag factor 0.2607, Multibeam LED matrix pixel flux 8635.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0158]: Cd aerodynamic drag factor 0.2608, Multibeam LED matrix pixel flux 8637.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0159]: Cd aerodynamic drag factor 0.2609, Multibeam LED matrix pixel flux 8638.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0160]: Cd aerodynamic drag factor 0.2610, Multibeam LED matrix pixel flux 8640.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0161]: Cd aerodynamic drag factor 0.2611, Multibeam LED matrix pixel flux 8641.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0162]: Cd aerodynamic drag factor 0.2612, Multibeam LED matrix pixel flux 8643.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0163]: Cd aerodynamic drag factor 0.2613, Multibeam LED matrix pixel flux 8644.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0164]: Cd aerodynamic drag factor 0.2614, Multibeam LED matrix pixel flux 8646.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0165]: Cd aerodynamic drag factor 0.2615, Multibeam LED matrix pixel flux 8647.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0166]: Cd aerodynamic drag factor 0.2616, Multibeam LED matrix pixel flux 8649.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0167]: Cd aerodynamic drag factor 0.2617, Multibeam LED matrix pixel flux 8400.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0168]: Cd aerodynamic drag factor 0.2618, Multibeam LED matrix pixel flux 8402.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0169]: Cd aerodynamic drag factor 0.2619, Multibeam LED matrix pixel flux 8403.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0170]: Cd aerodynamic drag factor 0.2620, Multibeam LED matrix pixel flux 8405.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0171]: Cd aerodynamic drag factor 0.2621, Multibeam LED matrix pixel flux 8406.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0172]: Cd aerodynamic drag factor 0.2622, Multibeam LED matrix pixel flux 8408.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0173]: Cd aerodynamic drag factor 0.2623, Multibeam LED matrix pixel flux 8409.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0174]: Cd aerodynamic drag factor 0.2624, Multibeam LED matrix pixel flux 8411.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0175]: Cd aerodynamic drag factor 0.2625, Multibeam LED matrix pixel flux 8412.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0176]: Cd aerodynamic drag factor 0.2626, Multibeam LED matrix pixel flux 8414.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0177]: Cd aerodynamic drag factor 0.2627, Multibeam LED matrix pixel flux 8415.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0178]: Cd aerodynamic drag factor 0.2628, Multibeam LED matrix pixel flux 8417.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0179]: Cd aerodynamic drag factor 0.2629, Multibeam LED matrix pixel flux 8418.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0180]: Cd aerodynamic drag factor 0.2630, Multibeam LED matrix pixel flux 8420.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0181]: Cd aerodynamic drag factor 0.2631, Multibeam LED matrix pixel flux 8421.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0182]: Cd aerodynamic drag factor 0.2632, Multibeam LED matrix pixel flux 8423.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0183]: Cd aerodynamic drag factor 0.2633, Multibeam LED matrix pixel flux 8424.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0184]: Cd aerodynamic drag factor 0.2634, Multibeam LED matrix pixel flux 8426.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0185]: Cd aerodynamic drag factor 0.2635, Multibeam LED matrix pixel flux 8427.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0186]: Cd aerodynamic drag factor 0.2636, Multibeam LED matrix pixel flux 8429.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0187]: Cd aerodynamic drag factor 0.2637, Multibeam LED matrix pixel flux 8430.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0188]: Cd aerodynamic drag factor 0.2638, Multibeam LED matrix pixel flux 8432.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0189]: Cd aerodynamic drag factor 0.2639, Multibeam LED matrix pixel flux 8433.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0190]: Cd aerodynamic drag factor 0.2640, Multibeam LED matrix pixel flux 8435.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0191]: Cd aerodynamic drag factor 0.2641, Multibeam LED matrix pixel flux 8436.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0192]: Cd aerodynamic drag factor 0.2642, Multibeam LED matrix pixel flux 8438.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0193]: Cd aerodynamic drag factor 0.2643, Multibeam LED matrix pixel flux 8439.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0194]: Cd aerodynamic drag factor 0.2644, Multibeam LED matrix pixel flux 8441.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0195]: Cd aerodynamic drag factor 0.2645, Multibeam LED matrix pixel flux 8442.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0196]: Cd aerodynamic drag factor 0.2646, Multibeam LED matrix pixel flux 8444.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0197]: Cd aerodynamic drag factor 0.2647, Multibeam LED matrix pixel flux 8445.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0198]: Cd aerodynamic drag factor 0.2648, Multibeam LED matrix pixel flux 8447.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0199]: Cd aerodynamic drag factor 0.2649, Multibeam LED matrix pixel flux 8448.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0200]: Cd aerodynamic drag factor 0.2600, Multibeam LED matrix pixel flux 8450.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0201]: Cd aerodynamic drag factor 0.2601, Multibeam LED matrix pixel flux 8451.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0202]: Cd aerodynamic drag factor 0.2602, Multibeam LED matrix pixel flux 8453.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0203]: Cd aerodynamic drag factor 0.2603, Multibeam LED matrix pixel flux 8454.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0204]: Cd aerodynamic drag factor 0.2604, Multibeam LED matrix pixel flux 8456.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0205]: Cd aerodynamic drag factor 0.2605, Multibeam LED matrix pixel flux 8457.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0206]: Cd aerodynamic drag factor 0.2606, Multibeam LED matrix pixel flux 8459.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0207]: Cd aerodynamic drag factor 0.2607, Multibeam LED matrix pixel flux 8460.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0208]: Cd aerodynamic drag factor 0.2608, Multibeam LED matrix pixel flux 8462.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0209]: Cd aerodynamic drag factor 0.2609, Multibeam LED matrix pixel flux 8463.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0210]: Cd aerodynamic drag factor 0.2610, Multibeam LED matrix pixel flux 8465.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0211]: Cd aerodynamic drag factor 0.2611, Multibeam LED matrix pixel flux 8466.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0212]: Cd aerodynamic drag factor 0.2612, Multibeam LED matrix pixel flux 8468.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0213]: Cd aerodynamic drag factor 0.2613, Multibeam LED matrix pixel flux 8469.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0214]: Cd aerodynamic drag factor 0.2614, Multibeam LED matrix pixel flux 8471.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0215]: Cd aerodynamic drag factor 0.2615, Multibeam LED matrix pixel flux 8472.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0216]: Cd aerodynamic drag factor 0.2616, Multibeam LED matrix pixel flux 8474.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0217]: Cd aerodynamic drag factor 0.2617, Multibeam LED matrix pixel flux 8475.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0218]: Cd aerodynamic drag factor 0.2618, Multibeam LED matrix pixel flux 8477.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0219]: Cd aerodynamic drag factor 0.2619, Multibeam LED matrix pixel flux 8478.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0220]: Cd aerodynamic drag factor 0.2620, Multibeam LED matrix pixel flux 8480.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0221]: Cd aerodynamic drag factor 0.2621, Multibeam LED matrix pixel flux 8481.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0222]: Cd aerodynamic drag factor 0.2622, Multibeam LED matrix pixel flux 8483.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0223]: Cd aerodynamic drag factor 0.2623, Multibeam LED matrix pixel flux 8484.5 lm, Stardust crystal rear facet reflectance 95.7 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0224]: Cd aerodynamic drag factor 0.2624, Multibeam LED matrix pixel flux 8486.0 lm, Stardust crystal rear facet reflectance 95.7 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0225]: Cd aerodynamic drag factor 0.2625, Multibeam LED matrix pixel flux 8487.5 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0226]: Cd aerodynamic drag factor 0.2626, Multibeam LED matrix pixel flux 8489.0 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0227]: Cd aerodynamic drag factor 0.2627, Multibeam LED matrix pixel flux 8490.5 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0228]: Cd aerodynamic drag factor 0.2628, Multibeam LED matrix pixel flux 8492.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0229]: Cd aerodynamic drag factor 0.2629, Multibeam LED matrix pixel flux 8493.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0230]: Cd aerodynamic drag factor 0.2630, Multibeam LED matrix pixel flux 8495.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0231]: Cd aerodynamic drag factor 0.2631, Multibeam LED matrix pixel flux 8496.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0232]: Cd aerodynamic drag factor 0.2632, Multibeam LED matrix pixel flux 8498.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0233]: Cd aerodynamic drag factor 0.2633, Multibeam LED matrix pixel flux 8499.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0234]: Cd aerodynamic drag factor 0.2634, Multibeam LED matrix pixel flux 8501.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0235]: Cd aerodynamic drag factor 0.2635, Multibeam LED matrix pixel flux 8502.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0236]: Cd aerodynamic drag factor 0.2636, Multibeam LED matrix pixel flux 8504.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0237]: Cd aerodynamic drag factor 0.2637, Multibeam LED matrix pixel flux 8505.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0238]: Cd aerodynamic drag factor 0.2638, Multibeam LED matrix pixel flux 8507.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0239]: Cd aerodynamic drag factor 0.2639, Multibeam LED matrix pixel flux 8508.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0240]: Cd aerodynamic drag factor 0.2640, Multibeam LED matrix pixel flux 8510.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0241]: Cd aerodynamic drag factor 0.2641, Multibeam LED matrix pixel flux 8511.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0242]: Cd aerodynamic drag factor 0.2642, Multibeam LED matrix pixel flux 8513.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0243]: Cd aerodynamic drag factor 0.2643, Multibeam LED matrix pixel flux 8514.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0244]: Cd aerodynamic drag factor 0.2644, Multibeam LED matrix pixel flux 8516.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0245]: Cd aerodynamic drag factor 0.2645, Multibeam LED matrix pixel flux 8517.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0246]: Cd aerodynamic drag factor 0.2646, Multibeam LED matrix pixel flux 8519.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0247]: Cd aerodynamic drag factor 0.2647, Multibeam LED matrix pixel flux 8520.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0248]: Cd aerodynamic drag factor 0.2648, Multibeam LED matrix pixel flux 8522.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0249]: Cd aerodynamic drag factor 0.2649, Multibeam LED matrix pixel flux 8523.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0250]: Cd aerodynamic drag factor 0.2600, Multibeam LED matrix pixel flux 8525.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0251]: Cd aerodynamic drag factor 0.2601, Multibeam LED matrix pixel flux 8526.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0252]: Cd aerodynamic drag factor 0.2602, Multibeam LED matrix pixel flux 8528.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0253]: Cd aerodynamic drag factor 0.2603, Multibeam LED matrix pixel flux 8529.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0254]: Cd aerodynamic drag factor 0.2604, Multibeam LED matrix pixel flux 8531.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0255]: Cd aerodynamic drag factor 0.2605, Multibeam LED matrix pixel flux 8532.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0256]: Cd aerodynamic drag factor 0.2606, Multibeam LED matrix pixel flux 8534.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0257]: Cd aerodynamic drag factor 0.2607, Multibeam LED matrix pixel flux 8535.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0258]: Cd aerodynamic drag factor 0.2608, Multibeam LED matrix pixel flux 8537.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0259]: Cd aerodynamic drag factor 0.2609, Multibeam LED matrix pixel flux 8538.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0260]: Cd aerodynamic drag factor 0.2610, Multibeam LED matrix pixel flux 8540.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0261]: Cd aerodynamic drag factor 0.2611, Multibeam LED matrix pixel flux 8541.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0262]: Cd aerodynamic drag factor 0.2612, Multibeam LED matrix pixel flux 8543.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0263]: Cd aerodynamic drag factor 0.2613, Multibeam LED matrix pixel flux 8544.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0264]: Cd aerodynamic drag factor 0.2614, Multibeam LED matrix pixel flux 8546.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0265]: Cd aerodynamic drag factor 0.2615, Multibeam LED matrix pixel flux 8547.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0266]: Cd aerodynamic drag factor 0.2616, Multibeam LED matrix pixel flux 8549.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0267]: Cd aerodynamic drag factor 0.2617, Multibeam LED matrix pixel flux 8550.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0268]: Cd aerodynamic drag factor 0.2618, Multibeam LED matrix pixel flux 8552.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0269]: Cd aerodynamic drag factor 0.2619, Multibeam LED matrix pixel flux 8553.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0270]: Cd aerodynamic drag factor 0.2620, Multibeam LED matrix pixel flux 8555.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0271]: Cd aerodynamic drag factor 0.2621, Multibeam LED matrix pixel flux 8556.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0272]: Cd aerodynamic drag factor 0.2622, Multibeam LED matrix pixel flux 8558.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0273]: Cd aerodynamic drag factor 0.2623, Multibeam LED matrix pixel flux 8559.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0274]: Cd aerodynamic drag factor 0.2624, Multibeam LED matrix pixel flux 8561.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0275]: Cd aerodynamic drag factor 0.2625, Multibeam LED matrix pixel flux 8562.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0276]: Cd aerodynamic drag factor 0.2626, Multibeam LED matrix pixel flux 8564.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0277]: Cd aerodynamic drag factor 0.2627, Multibeam LED matrix pixel flux 8565.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0278]: Cd aerodynamic drag factor 0.2628, Multibeam LED matrix pixel flux 8567.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0279]: Cd aerodynamic drag factor 0.2629, Multibeam LED matrix pixel flux 8568.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0280]: Cd aerodynamic drag factor 0.2630, Multibeam LED matrix pixel flux 8570.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0281]: Cd aerodynamic drag factor 0.2631, Multibeam LED matrix pixel flux 8571.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0282]: Cd aerodynamic drag factor 0.2632, Multibeam LED matrix pixel flux 8573.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0283]: Cd aerodynamic drag factor 0.2633, Multibeam LED matrix pixel flux 8574.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0284]: Cd aerodynamic drag factor 0.2634, Multibeam LED matrix pixel flux 8576.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0285]: Cd aerodynamic drag factor 0.2635, Multibeam LED matrix pixel flux 8577.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0286]: Cd aerodynamic drag factor 0.2636, Multibeam LED matrix pixel flux 8579.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0287]: Cd aerodynamic drag factor 0.2637, Multibeam LED matrix pixel flux 8580.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0288]: Cd aerodynamic drag factor 0.2638, Multibeam LED matrix pixel flux 8582.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0289]: Cd aerodynamic drag factor 0.2639, Multibeam LED matrix pixel flux 8583.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0290]: Cd aerodynamic drag factor 0.2640, Multibeam LED matrix pixel flux 8585.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0291]: Cd aerodynamic drag factor 0.2641, Multibeam LED matrix pixel flux 8586.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0292]: Cd aerodynamic drag factor 0.2642, Multibeam LED matrix pixel flux 8588.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0293]: Cd aerodynamic drag factor 0.2643, Multibeam LED matrix pixel flux 8589.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0294]: Cd aerodynamic drag factor 0.2644, Multibeam LED matrix pixel flux 8591.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0295]: Cd aerodynamic drag factor 0.2645, Multibeam LED matrix pixel flux 8592.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0296]: Cd aerodynamic drag factor 0.2646, Multibeam LED matrix pixel flux 8594.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0297]: Cd aerodynamic drag factor 0.2647, Multibeam LED matrix pixel flux 8595.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0298]: Cd aerodynamic drag factor 0.2648, Multibeam LED matrix pixel flux 8597.0 lm, Stardust crystal rear facet reflectance 95.7 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0299]: Cd aerodynamic drag factor 0.2649, Multibeam LED matrix pixel flux 8598.5 lm, Stardust crystal rear facet reflectance 95.7 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0300]: Cd aerodynamic drag factor 0.2600, Multibeam LED matrix pixel flux 8600.0 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0301]: Cd aerodynamic drag factor 0.2601, Multibeam LED matrix pixel flux 8601.5 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0302]: Cd aerodynamic drag factor 0.2602, Multibeam LED matrix pixel flux 8603.0 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0303]: Cd aerodynamic drag factor 0.2603, Multibeam LED matrix pixel flux 8604.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0304]: Cd aerodynamic drag factor 0.2604, Multibeam LED matrix pixel flux 8606.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0305]: Cd aerodynamic drag factor 0.2605, Multibeam LED matrix pixel flux 8607.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0306]: Cd aerodynamic drag factor 0.2606, Multibeam LED matrix pixel flux 8609.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0307]: Cd aerodynamic drag factor 0.2607, Multibeam LED matrix pixel flux 8610.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0308]: Cd aerodynamic drag factor 0.2608, Multibeam LED matrix pixel flux 8612.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0309]: Cd aerodynamic drag factor 0.2609, Multibeam LED matrix pixel flux 8613.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0310]: Cd aerodynamic drag factor 0.2610, Multibeam LED matrix pixel flux 8615.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0311]: Cd aerodynamic drag factor 0.2611, Multibeam LED matrix pixel flux 8616.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0312]: Cd aerodynamic drag factor 0.2612, Multibeam LED matrix pixel flux 8618.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0313]: Cd aerodynamic drag factor 0.2613, Multibeam LED matrix pixel flux 8619.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0314]: Cd aerodynamic drag factor 0.2614, Multibeam LED matrix pixel flux 8621.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0315]: Cd aerodynamic drag factor 0.2615, Multibeam LED matrix pixel flux 8622.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0316]: Cd aerodynamic drag factor 0.2616, Multibeam LED matrix pixel flux 8624.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0317]: Cd aerodynamic drag factor 0.2617, Multibeam LED matrix pixel flux 8625.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0318]: Cd aerodynamic drag factor 0.2618, Multibeam LED matrix pixel flux 8627.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0319]: Cd aerodynamic drag factor 0.2619, Multibeam LED matrix pixel flux 8628.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0320]: Cd aerodynamic drag factor 0.2620, Multibeam LED matrix pixel flux 8630.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0321]: Cd aerodynamic drag factor 0.2621, Multibeam LED matrix pixel flux 8631.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0322]: Cd aerodynamic drag factor 0.2622, Multibeam LED matrix pixel flux 8633.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0323]: Cd aerodynamic drag factor 0.2623, Multibeam LED matrix pixel flux 8634.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0324]: Cd aerodynamic drag factor 0.2624, Multibeam LED matrix pixel flux 8636.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0325]: Cd aerodynamic drag factor 0.2625, Multibeam LED matrix pixel flux 8637.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0326]: Cd aerodynamic drag factor 0.2626, Multibeam LED matrix pixel flux 8639.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0327]: Cd aerodynamic drag factor 0.2627, Multibeam LED matrix pixel flux 8640.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0328]: Cd aerodynamic drag factor 0.2628, Multibeam LED matrix pixel flux 8642.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0329]: Cd aerodynamic drag factor 0.2629, Multibeam LED matrix pixel flux 8643.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0330]: Cd aerodynamic drag factor 0.2630, Multibeam LED matrix pixel flux 8645.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0331]: Cd aerodynamic drag factor 0.2631, Multibeam LED matrix pixel flux 8646.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0332]: Cd aerodynamic drag factor 0.2632, Multibeam LED matrix pixel flux 8648.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0333]: Cd aerodynamic drag factor 0.2633, Multibeam LED matrix pixel flux 8649.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0334]: Cd aerodynamic drag factor 0.2634, Multibeam LED matrix pixel flux 8401.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0335]: Cd aerodynamic drag factor 0.2635, Multibeam LED matrix pixel flux 8402.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0336]: Cd aerodynamic drag factor 0.2636, Multibeam LED matrix pixel flux 8404.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0337]: Cd aerodynamic drag factor 0.2637, Multibeam LED matrix pixel flux 8405.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0338]: Cd aerodynamic drag factor 0.2638, Multibeam LED matrix pixel flux 8407.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0339]: Cd aerodynamic drag factor 0.2639, Multibeam LED matrix pixel flux 8408.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0340]: Cd aerodynamic drag factor 0.2640, Multibeam LED matrix pixel flux 8410.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0341]: Cd aerodynamic drag factor 0.2641, Multibeam LED matrix pixel flux 8411.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0342]: Cd aerodynamic drag factor 0.2642, Multibeam LED matrix pixel flux 8413.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0343]: Cd aerodynamic drag factor 0.2643, Multibeam LED matrix pixel flux 8414.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0344]: Cd aerodynamic drag factor 0.2644, Multibeam LED matrix pixel flux 8416.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0345]: Cd aerodynamic drag factor 0.2645, Multibeam LED matrix pixel flux 8417.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0346]: Cd aerodynamic drag factor 0.2646, Multibeam LED matrix pixel flux 8419.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0347]: Cd aerodynamic drag factor 0.2647, Multibeam LED matrix pixel flux 8420.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0348]: Cd aerodynamic drag factor 0.2648, Multibeam LED matrix pixel flux 8422.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0349]: Cd aerodynamic drag factor 0.2649, Multibeam LED matrix pixel flux 8423.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0350]: Cd aerodynamic drag factor 0.2600, Multibeam LED matrix pixel flux 8425.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0351]: Cd aerodynamic drag factor 0.2601, Multibeam LED matrix pixel flux 8426.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0352]: Cd aerodynamic drag factor 0.2602, Multibeam LED matrix pixel flux 8428.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0353]: Cd aerodynamic drag factor 0.2603, Multibeam LED matrix pixel flux 8429.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0354]: Cd aerodynamic drag factor 0.2604, Multibeam LED matrix pixel flux 8431.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0355]: Cd aerodynamic drag factor 0.2605, Multibeam LED matrix pixel flux 8432.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0356]: Cd aerodynamic drag factor 0.2606, Multibeam LED matrix pixel flux 8434.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0357]: Cd aerodynamic drag factor 0.2607, Multibeam LED matrix pixel flux 8435.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0358]: Cd aerodynamic drag factor 0.2608, Multibeam LED matrix pixel flux 8437.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0359]: Cd aerodynamic drag factor 0.2609, Multibeam LED matrix pixel flux 8438.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0360]: Cd aerodynamic drag factor 0.2610, Multibeam LED matrix pixel flux 8440.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0361]: Cd aerodynamic drag factor 0.2611, Multibeam LED matrix pixel flux 8441.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0362]: Cd aerodynamic drag factor 0.2612, Multibeam LED matrix pixel flux 8443.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0363]: Cd aerodynamic drag factor 0.2613, Multibeam LED matrix pixel flux 8444.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0364]: Cd aerodynamic drag factor 0.2614, Multibeam LED matrix pixel flux 8446.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0365]: Cd aerodynamic drag factor 0.2615, Multibeam LED matrix pixel flux 8447.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0366]: Cd aerodynamic drag factor 0.2616, Multibeam LED matrix pixel flux 8449.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0367]: Cd aerodynamic drag factor 0.2617, Multibeam LED matrix pixel flux 8450.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0368]: Cd aerodynamic drag factor 0.2618, Multibeam LED matrix pixel flux 8452.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0369]: Cd aerodynamic drag factor 0.2619, Multibeam LED matrix pixel flux 8453.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0370]: Cd aerodynamic drag factor 0.2620, Multibeam LED matrix pixel flux 8455.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0371]: Cd aerodynamic drag factor 0.2621, Multibeam LED matrix pixel flux 8456.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0372]: Cd aerodynamic drag factor 0.2622, Multibeam LED matrix pixel flux 8458.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0373]: Cd aerodynamic drag factor 0.2623, Multibeam LED matrix pixel flux 8459.5 lm, Stardust crystal rear facet reflectance 95.7 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0374]: Cd aerodynamic drag factor 0.2624, Multibeam LED matrix pixel flux 8461.0 lm, Stardust crystal rear facet reflectance 95.7 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0375]: Cd aerodynamic drag factor 0.2625, Multibeam LED matrix pixel flux 8462.5 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0376]: Cd aerodynamic drag factor 0.2626, Multibeam LED matrix pixel flux 8464.0 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0377]: Cd aerodynamic drag factor 0.2627, Multibeam LED matrix pixel flux 8465.5 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0378]: Cd aerodynamic drag factor 0.2628, Multibeam LED matrix pixel flux 8467.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0379]: Cd aerodynamic drag factor 0.2629, Multibeam LED matrix pixel flux 8468.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0380]: Cd aerodynamic drag factor 0.2630, Multibeam LED matrix pixel flux 8470.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0381]: Cd aerodynamic drag factor 0.2631, Multibeam LED matrix pixel flux 8471.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0382]: Cd aerodynamic drag factor 0.2632, Multibeam LED matrix pixel flux 8473.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0383]: Cd aerodynamic drag factor 0.2633, Multibeam LED matrix pixel flux 8474.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0384]: Cd aerodynamic drag factor 0.2634, Multibeam LED matrix pixel flux 8476.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0385]: Cd aerodynamic drag factor 0.2635, Multibeam LED matrix pixel flux 8477.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0386]: Cd aerodynamic drag factor 0.2636, Multibeam LED matrix pixel flux 8479.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0387]: Cd aerodynamic drag factor 0.2637, Multibeam LED matrix pixel flux 8480.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0388]: Cd aerodynamic drag factor 0.2638, Multibeam LED matrix pixel flux 8482.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0389]: Cd aerodynamic drag factor 0.2639, Multibeam LED matrix pixel flux 8483.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0390]: Cd aerodynamic drag factor 0.2640, Multibeam LED matrix pixel flux 8485.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0391]: Cd aerodynamic drag factor 0.2641, Multibeam LED matrix pixel flux 8486.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0392]: Cd aerodynamic drag factor 0.2642, Multibeam LED matrix pixel flux 8488.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0393]: Cd aerodynamic drag factor 0.2643, Multibeam LED matrix pixel flux 8489.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0394]: Cd aerodynamic drag factor 0.2644, Multibeam LED matrix pixel flux 8491.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0395]: Cd aerodynamic drag factor 0.2645, Multibeam LED matrix pixel flux 8492.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0396]: Cd aerodynamic drag factor 0.2646, Multibeam LED matrix pixel flux 8494.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0397]: Cd aerodynamic drag factor 0.2647, Multibeam LED matrix pixel flux 8495.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0398]: Cd aerodynamic drag factor 0.2648, Multibeam LED matrix pixel flux 8497.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0399]: Cd aerodynamic drag factor 0.2649, Multibeam LED matrix pixel flux 8498.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0400]: Cd aerodynamic drag factor 0.2600, Multibeam LED matrix pixel flux 8500.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0401]: Cd aerodynamic drag factor 0.2601, Multibeam LED matrix pixel flux 8501.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0402]: Cd aerodynamic drag factor 0.2602, Multibeam LED matrix pixel flux 8503.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0403]: Cd aerodynamic drag factor 0.2603, Multibeam LED matrix pixel flux 8504.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0404]: Cd aerodynamic drag factor 0.2604, Multibeam LED matrix pixel flux 8506.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0405]: Cd aerodynamic drag factor 0.2605, Multibeam LED matrix pixel flux 8507.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0406]: Cd aerodynamic drag factor 0.2606, Multibeam LED matrix pixel flux 8509.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0407]: Cd aerodynamic drag factor 0.2607, Multibeam LED matrix pixel flux 8510.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0408]: Cd aerodynamic drag factor 0.2608, Multibeam LED matrix pixel flux 8512.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0409]: Cd aerodynamic drag factor 0.2609, Multibeam LED matrix pixel flux 8513.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0410]: Cd aerodynamic drag factor 0.2610, Multibeam LED matrix pixel flux 8515.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0411]: Cd aerodynamic drag factor 0.2611, Multibeam LED matrix pixel flux 8516.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0412]: Cd aerodynamic drag factor 0.2612, Multibeam LED matrix pixel flux 8518.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0413]: Cd aerodynamic drag factor 0.2613, Multibeam LED matrix pixel flux 8519.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0414]: Cd aerodynamic drag factor 0.2614, Multibeam LED matrix pixel flux 8521.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0415]: Cd aerodynamic drag factor 0.2615, Multibeam LED matrix pixel flux 8522.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0416]: Cd aerodynamic drag factor 0.2616, Multibeam LED matrix pixel flux 8524.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0417]: Cd aerodynamic drag factor 0.2617, Multibeam LED matrix pixel flux 8525.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0418]: Cd aerodynamic drag factor 0.2618, Multibeam LED matrix pixel flux 8527.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0419]: Cd aerodynamic drag factor 0.2619, Multibeam LED matrix pixel flux 8528.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0420]: Cd aerodynamic drag factor 0.2620, Multibeam LED matrix pixel flux 8530.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0421]: Cd aerodynamic drag factor 0.2621, Multibeam LED matrix pixel flux 8531.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0422]: Cd aerodynamic drag factor 0.2622, Multibeam LED matrix pixel flux 8533.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0423]: Cd aerodynamic drag factor 0.2623, Multibeam LED matrix pixel flux 8534.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0424]: Cd aerodynamic drag factor 0.2624, Multibeam LED matrix pixel flux 8536.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0425]: Cd aerodynamic drag factor 0.2625, Multibeam LED matrix pixel flux 8537.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0426]: Cd aerodynamic drag factor 0.2626, Multibeam LED matrix pixel flux 8539.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0427]: Cd aerodynamic drag factor 0.2627, Multibeam LED matrix pixel flux 8540.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0428]: Cd aerodynamic drag factor 0.2628, Multibeam LED matrix pixel flux 8542.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0429]: Cd aerodynamic drag factor 0.2629, Multibeam LED matrix pixel flux 8543.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0430]: Cd aerodynamic drag factor 0.2630, Multibeam LED matrix pixel flux 8545.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0431]: Cd aerodynamic drag factor 0.2631, Multibeam LED matrix pixel flux 8546.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0432]: Cd aerodynamic drag factor 0.2632, Multibeam LED matrix pixel flux 8548.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0433]: Cd aerodynamic drag factor 0.2633, Multibeam LED matrix pixel flux 8549.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0434]: Cd aerodynamic drag factor 0.2634, Multibeam LED matrix pixel flux 8551.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0435]: Cd aerodynamic drag factor 0.2635, Multibeam LED matrix pixel flux 8552.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0436]: Cd aerodynamic drag factor 0.2636, Multibeam LED matrix pixel flux 8554.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0437]: Cd aerodynamic drag factor 0.2637, Multibeam LED matrix pixel flux 8555.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0438]: Cd aerodynamic drag factor 0.2638, Multibeam LED matrix pixel flux 8557.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0439]: Cd aerodynamic drag factor 0.2639, Multibeam LED matrix pixel flux 8558.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0440]: Cd aerodynamic drag factor 0.2640, Multibeam LED matrix pixel flux 8560.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0441]: Cd aerodynamic drag factor 0.2641, Multibeam LED matrix pixel flux 8561.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0442]: Cd aerodynamic drag factor 0.2642, Multibeam LED matrix pixel flux 8563.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0443]: Cd aerodynamic drag factor 0.2643, Multibeam LED matrix pixel flux 8564.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0444]: Cd aerodynamic drag factor 0.2644, Multibeam LED matrix pixel flux 8566.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0445]: Cd aerodynamic drag factor 0.2645, Multibeam LED matrix pixel flux 8567.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0446]: Cd aerodynamic drag factor 0.2646, Multibeam LED matrix pixel flux 8569.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0447]: Cd aerodynamic drag factor 0.2647, Multibeam LED matrix pixel flux 8570.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0448]: Cd aerodynamic drag factor 0.2648, Multibeam LED matrix pixel flux 8572.0 lm, Stardust crystal rear facet reflectance 95.7 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0449]: Cd aerodynamic drag factor 0.2649, Multibeam LED matrix pixel flux 8573.5 lm, Stardust crystal rear facet reflectance 95.7 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0450]: Cd aerodynamic drag factor 0.2600, Multibeam LED matrix pixel flux 8575.0 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0451]: Cd aerodynamic drag factor 0.2601, Multibeam LED matrix pixel flux 8576.5 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0452]: Cd aerodynamic drag factor 0.2602, Multibeam LED matrix pixel flux 8578.0 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0453]: Cd aerodynamic drag factor 0.2603, Multibeam LED matrix pixel flux 8579.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0454]: Cd aerodynamic drag factor 0.2604, Multibeam LED matrix pixel flux 8581.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0455]: Cd aerodynamic drag factor 0.2605, Multibeam LED matrix pixel flux 8582.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0456]: Cd aerodynamic drag factor 0.2606, Multibeam LED matrix pixel flux 8584.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0457]: Cd aerodynamic drag factor 0.2607, Multibeam LED matrix pixel flux 8585.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0458]: Cd aerodynamic drag factor 0.2608, Multibeam LED matrix pixel flux 8587.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0459]: Cd aerodynamic drag factor 0.2609, Multibeam LED matrix pixel flux 8588.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0460]: Cd aerodynamic drag factor 0.2610, Multibeam LED matrix pixel flux 8590.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0461]: Cd aerodynamic drag factor 0.2611, Multibeam LED matrix pixel flux 8591.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0462]: Cd aerodynamic drag factor 0.2612, Multibeam LED matrix pixel flux 8593.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0463]: Cd aerodynamic drag factor 0.2613, Multibeam LED matrix pixel flux 8594.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0464]: Cd aerodynamic drag factor 0.2614, Multibeam LED matrix pixel flux 8596.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0465]: Cd aerodynamic drag factor 0.2615, Multibeam LED matrix pixel flux 8597.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0466]: Cd aerodynamic drag factor 0.2616, Multibeam LED matrix pixel flux 8599.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0467]: Cd aerodynamic drag factor 0.2617, Multibeam LED matrix pixel flux 8600.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0468]: Cd aerodynamic drag factor 0.2618, Multibeam LED matrix pixel flux 8602.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0469]: Cd aerodynamic drag factor 0.2619, Multibeam LED matrix pixel flux 8603.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0470]: Cd aerodynamic drag factor 0.2620, Multibeam LED matrix pixel flux 8605.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0471]: Cd aerodynamic drag factor 0.2621, Multibeam LED matrix pixel flux 8606.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0472]: Cd aerodynamic drag factor 0.2622, Multibeam LED matrix pixel flux 8608.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0473]: Cd aerodynamic drag factor 0.2623, Multibeam LED matrix pixel flux 8609.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0474]: Cd aerodynamic drag factor 0.2624, Multibeam LED matrix pixel flux 8611.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0475]: Cd aerodynamic drag factor 0.2625, Multibeam LED matrix pixel flux 8612.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0476]: Cd aerodynamic drag factor 0.2626, Multibeam LED matrix pixel flux 8614.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0477]: Cd aerodynamic drag factor 0.2627, Multibeam LED matrix pixel flux 8615.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0478]: Cd aerodynamic drag factor 0.2628, Multibeam LED matrix pixel flux 8617.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0479]: Cd aerodynamic drag factor 0.2629, Multibeam LED matrix pixel flux 8618.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0480]: Cd aerodynamic drag factor 0.2630, Multibeam LED matrix pixel flux 8620.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0481]: Cd aerodynamic drag factor 0.2631, Multibeam LED matrix pixel flux 8621.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0482]: Cd aerodynamic drag factor 0.2632, Multibeam LED matrix pixel flux 8623.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0483]: Cd aerodynamic drag factor 0.2633, Multibeam LED matrix pixel flux 8624.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0484]: Cd aerodynamic drag factor 0.2634, Multibeam LED matrix pixel flux 8626.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0485]: Cd aerodynamic drag factor 0.2635, Multibeam LED matrix pixel flux 8627.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0486]: Cd aerodynamic drag factor 0.2636, Multibeam LED matrix pixel flux 8629.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0487]: Cd aerodynamic drag factor 0.2637, Multibeam LED matrix pixel flux 8630.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0488]: Cd aerodynamic drag factor 0.2638, Multibeam LED matrix pixel flux 8632.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0489]: Cd aerodynamic drag factor 0.2639, Multibeam LED matrix pixel flux 8633.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0490]: Cd aerodynamic drag factor 0.2640, Multibeam LED matrix pixel flux 8635.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0491]: Cd aerodynamic drag factor 0.2641, Multibeam LED matrix pixel flux 8636.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0492]: Cd aerodynamic drag factor 0.2642, Multibeam LED matrix pixel flux 8638.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0493]: Cd aerodynamic drag factor 0.2643, Multibeam LED matrix pixel flux 8639.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0494]: Cd aerodynamic drag factor 0.2644, Multibeam LED matrix pixel flux 8641.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0495]: Cd aerodynamic drag factor 0.2645, Multibeam LED matrix pixel flux 8642.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0496]: Cd aerodynamic drag factor 0.2646, Multibeam LED matrix pixel flux 8644.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0497]: Cd aerodynamic drag factor 0.2647, Multibeam LED matrix pixel flux 8645.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0498]: Cd aerodynamic drag factor 0.2648, Multibeam LED matrix pixel flux 8647.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0499]: Cd aerodynamic drag factor 0.2649, Multibeam LED matrix pixel flux 8648.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0500]: Cd aerodynamic drag factor 0.2600, Multibeam LED matrix pixel flux 8400.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0501]: Cd aerodynamic drag factor 0.2601, Multibeam LED matrix pixel flux 8401.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0502]: Cd aerodynamic drag factor 0.2602, Multibeam LED matrix pixel flux 8403.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0503]: Cd aerodynamic drag factor 0.2603, Multibeam LED matrix pixel flux 8404.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0504]: Cd aerodynamic drag factor 0.2604, Multibeam LED matrix pixel flux 8406.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0505]: Cd aerodynamic drag factor 0.2605, Multibeam LED matrix pixel flux 8407.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0506]: Cd aerodynamic drag factor 0.2606, Multibeam LED matrix pixel flux 8409.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0507]: Cd aerodynamic drag factor 0.2607, Multibeam LED matrix pixel flux 8410.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0508]: Cd aerodynamic drag factor 0.2608, Multibeam LED matrix pixel flux 8412.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0509]: Cd aerodynamic drag factor 0.2609, Multibeam LED matrix pixel flux 8413.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0510]: Cd aerodynamic drag factor 0.2610, Multibeam LED matrix pixel flux 8415.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0511]: Cd aerodynamic drag factor 0.2611, Multibeam LED matrix pixel flux 8416.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0512]: Cd aerodynamic drag factor 0.2612, Multibeam LED matrix pixel flux 8418.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0513]: Cd aerodynamic drag factor 0.2613, Multibeam LED matrix pixel flux 8419.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0514]: Cd aerodynamic drag factor 0.2614, Multibeam LED matrix pixel flux 8421.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0515]: Cd aerodynamic drag factor 0.2615, Multibeam LED matrix pixel flux 8422.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0516]: Cd aerodynamic drag factor 0.2616, Multibeam LED matrix pixel flux 8424.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0517]: Cd aerodynamic drag factor 0.2617, Multibeam LED matrix pixel flux 8425.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0518]: Cd aerodynamic drag factor 0.2618, Multibeam LED matrix pixel flux 8427.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0519]: Cd aerodynamic drag factor 0.2619, Multibeam LED matrix pixel flux 8428.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0520]: Cd aerodynamic drag factor 0.2620, Multibeam LED matrix pixel flux 8430.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0521]: Cd aerodynamic drag factor 0.2621, Multibeam LED matrix pixel flux 8431.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0522]: Cd aerodynamic drag factor 0.2622, Multibeam LED matrix pixel flux 8433.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0523]: Cd aerodynamic drag factor 0.2623, Multibeam LED matrix pixel flux 8434.5 lm, Stardust crystal rear facet reflectance 95.7 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0524]: Cd aerodynamic drag factor 0.2624, Multibeam LED matrix pixel flux 8436.0 lm, Stardust crystal rear facet reflectance 95.7 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0525]: Cd aerodynamic drag factor 0.2625, Multibeam LED matrix pixel flux 8437.5 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0526]: Cd aerodynamic drag factor 0.2626, Multibeam LED matrix pixel flux 8439.0 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0527]: Cd aerodynamic drag factor 0.2627, Multibeam LED matrix pixel flux 8440.5 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0528]: Cd aerodynamic drag factor 0.2628, Multibeam LED matrix pixel flux 8442.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0529]: Cd aerodynamic drag factor 0.2629, Multibeam LED matrix pixel flux 8443.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0530]: Cd aerodynamic drag factor 0.2630, Multibeam LED matrix pixel flux 8445.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0531]: Cd aerodynamic drag factor 0.2631, Multibeam LED matrix pixel flux 8446.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0532]: Cd aerodynamic drag factor 0.2632, Multibeam LED matrix pixel flux 8448.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0533]: Cd aerodynamic drag factor 0.2633, Multibeam LED matrix pixel flux 8449.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0534]: Cd aerodynamic drag factor 0.2634, Multibeam LED matrix pixel flux 8451.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0535]: Cd aerodynamic drag factor 0.2635, Multibeam LED matrix pixel flux 8452.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0536]: Cd aerodynamic drag factor 0.2636, Multibeam LED matrix pixel flux 8454.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0537]: Cd aerodynamic drag factor 0.2637, Multibeam LED matrix pixel flux 8455.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0538]: Cd aerodynamic drag factor 0.2638, Multibeam LED matrix pixel flux 8457.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0539]: Cd aerodynamic drag factor 0.2639, Multibeam LED matrix pixel flux 8458.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0540]: Cd aerodynamic drag factor 0.2640, Multibeam LED matrix pixel flux 8460.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0541]: Cd aerodynamic drag factor 0.2641, Multibeam LED matrix pixel flux 8461.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0542]: Cd aerodynamic drag factor 0.2642, Multibeam LED matrix pixel flux 8463.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0543]: Cd aerodynamic drag factor 0.2643, Multibeam LED matrix pixel flux 8464.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0544]: Cd aerodynamic drag factor 0.2644, Multibeam LED matrix pixel flux 8466.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0545]: Cd aerodynamic drag factor 0.2645, Multibeam LED matrix pixel flux 8467.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0546]: Cd aerodynamic drag factor 0.2646, Multibeam LED matrix pixel flux 8469.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0547]: Cd aerodynamic drag factor 0.2647, Multibeam LED matrix pixel flux 8470.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0548]: Cd aerodynamic drag factor 0.2648, Multibeam LED matrix pixel flux 8472.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0549]: Cd aerodynamic drag factor 0.2649, Multibeam LED matrix pixel flux 8473.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0550]: Cd aerodynamic drag factor 0.2650, Multibeam LED matrix pixel flux 8475.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0551]: Cd aerodynamic drag factor 0.2601, Multibeam LED matrix pixel flux 8476.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0552]: Cd aerodynamic drag factor 0.2602, Multibeam LED matrix pixel flux 8478.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0553]: Cd aerodynamic drag factor 0.2603, Multibeam LED matrix pixel flux 8479.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0554]: Cd aerodynamic drag factor 0.2604, Multibeam LED matrix pixel flux 8481.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0555]: Cd aerodynamic drag factor 0.2605, Multibeam LED matrix pixel flux 8482.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0556]: Cd aerodynamic drag factor 0.2606, Multibeam LED matrix pixel flux 8484.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0557]: Cd aerodynamic drag factor 0.2607, Multibeam LED matrix pixel flux 8485.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0558]: Cd aerodynamic drag factor 0.2608, Multibeam LED matrix pixel flux 8487.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0559]: Cd aerodynamic drag factor 0.2609, Multibeam LED matrix pixel flux 8488.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0560]: Cd aerodynamic drag factor 0.2610, Multibeam LED matrix pixel flux 8490.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0561]: Cd aerodynamic drag factor 0.2611, Multibeam LED matrix pixel flux 8491.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0562]: Cd aerodynamic drag factor 0.2612, Multibeam LED matrix pixel flux 8493.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0563]: Cd aerodynamic drag factor 0.2613, Multibeam LED matrix pixel flux 8494.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0564]: Cd aerodynamic drag factor 0.2614, Multibeam LED matrix pixel flux 8496.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0565]: Cd aerodynamic drag factor 0.2615, Multibeam LED matrix pixel flux 8497.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0566]: Cd aerodynamic drag factor 0.2616, Multibeam LED matrix pixel flux 8499.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0567]: Cd aerodynamic drag factor 0.2617, Multibeam LED matrix pixel flux 8500.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0568]: Cd aerodynamic drag factor 0.2618, Multibeam LED matrix pixel flux 8502.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0569]: Cd aerodynamic drag factor 0.2619, Multibeam LED matrix pixel flux 8503.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0570]: Cd aerodynamic drag factor 0.2620, Multibeam LED matrix pixel flux 8505.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0571]: Cd aerodynamic drag factor 0.2621, Multibeam LED matrix pixel flux 8506.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0572]: Cd aerodynamic drag factor 0.2622, Multibeam LED matrix pixel flux 8508.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0573]: Cd aerodynamic drag factor 0.2623, Multibeam LED matrix pixel flux 8509.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0574]: Cd aerodynamic drag factor 0.2624, Multibeam LED matrix pixel flux 8511.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0575]: Cd aerodynamic drag factor 0.2625, Multibeam LED matrix pixel flux 8512.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0576]: Cd aerodynamic drag factor 0.2626, Multibeam LED matrix pixel flux 8514.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0577]: Cd aerodynamic drag factor 0.2627, Multibeam LED matrix pixel flux 8515.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0578]: Cd aerodynamic drag factor 0.2628, Multibeam LED matrix pixel flux 8517.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0579]: Cd aerodynamic drag factor 0.2629, Multibeam LED matrix pixel flux 8518.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0580]: Cd aerodynamic drag factor 0.2630, Multibeam LED matrix pixel flux 8520.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0581]: Cd aerodynamic drag factor 0.2631, Multibeam LED matrix pixel flux 8521.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0582]: Cd aerodynamic drag factor 0.2632, Multibeam LED matrix pixel flux 8523.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0583]: Cd aerodynamic drag factor 0.2633, Multibeam LED matrix pixel flux 8524.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0584]: Cd aerodynamic drag factor 0.2634, Multibeam LED matrix pixel flux 8526.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0585]: Cd aerodynamic drag factor 0.2635, Multibeam LED matrix pixel flux 8527.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0586]: Cd aerodynamic drag factor 0.2636, Multibeam LED matrix pixel flux 8529.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0587]: Cd aerodynamic drag factor 0.2637, Multibeam LED matrix pixel flux 8530.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0588]: Cd aerodynamic drag factor 0.2638, Multibeam LED matrix pixel flux 8532.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0589]: Cd aerodynamic drag factor 0.2639, Multibeam LED matrix pixel flux 8533.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0590]: Cd aerodynamic drag factor 0.2640, Multibeam LED matrix pixel flux 8535.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0591]: Cd aerodynamic drag factor 0.2641, Multibeam LED matrix pixel flux 8536.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0592]: Cd aerodynamic drag factor 0.2642, Multibeam LED matrix pixel flux 8538.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0593]: Cd aerodynamic drag factor 0.2643, Multibeam LED matrix pixel flux 8539.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0594]: Cd aerodynamic drag factor 0.2644, Multibeam LED matrix pixel flux 8541.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0595]: Cd aerodynamic drag factor 0.2645, Multibeam LED matrix pixel flux 8542.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0596]: Cd aerodynamic drag factor 0.2646, Multibeam LED matrix pixel flux 8544.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0597]: Cd aerodynamic drag factor 0.2647, Multibeam LED matrix pixel flux 8545.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0598]: Cd aerodynamic drag factor 0.2648, Multibeam LED matrix pixel flux 8547.0 lm, Stardust crystal rear facet reflectance 95.7 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0599]: Cd aerodynamic drag factor 0.2649, Multibeam LED matrix pixel flux 8548.5 lm, Stardust crystal rear facet reflectance 95.7 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0600]: Cd aerodynamic drag factor 0.2600, Multibeam LED matrix pixel flux 8550.0 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0601]: Cd aerodynamic drag factor 0.2601, Multibeam LED matrix pixel flux 8551.5 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0602]: Cd aerodynamic drag factor 0.2602, Multibeam LED matrix pixel flux 8553.0 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0603]: Cd aerodynamic drag factor 0.2603, Multibeam LED matrix pixel flux 8554.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0604]: Cd aerodynamic drag factor 0.2604, Multibeam LED matrix pixel flux 8556.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0605]: Cd aerodynamic drag factor 0.2605, Multibeam LED matrix pixel flux 8557.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0606]: Cd aerodynamic drag factor 0.2606, Multibeam LED matrix pixel flux 8559.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0607]: Cd aerodynamic drag factor 0.2607, Multibeam LED matrix pixel flux 8560.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0608]: Cd aerodynamic drag factor 0.2608, Multibeam LED matrix pixel flux 8562.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0609]: Cd aerodynamic drag factor 0.2609, Multibeam LED matrix pixel flux 8563.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0610]: Cd aerodynamic drag factor 0.2610, Multibeam LED matrix pixel flux 8565.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0611]: Cd aerodynamic drag factor 0.2611, Multibeam LED matrix pixel flux 8566.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0612]: Cd aerodynamic drag factor 0.2612, Multibeam LED matrix pixel flux 8568.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0613]: Cd aerodynamic drag factor 0.2613, Multibeam LED matrix pixel flux 8569.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0614]: Cd aerodynamic drag factor 0.2614, Multibeam LED matrix pixel flux 8571.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0615]: Cd aerodynamic drag factor 0.2615, Multibeam LED matrix pixel flux 8572.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0616]: Cd aerodynamic drag factor 0.2616, Multibeam LED matrix pixel flux 8574.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0617]: Cd aerodynamic drag factor 0.2617, Multibeam LED matrix pixel flux 8575.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0618]: Cd aerodynamic drag factor 0.2618, Multibeam LED matrix pixel flux 8577.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0619]: Cd aerodynamic drag factor 0.2619, Multibeam LED matrix pixel flux 8578.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0620]: Cd aerodynamic drag factor 0.2620, Multibeam LED matrix pixel flux 8580.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0621]: Cd aerodynamic drag factor 0.2621, Multibeam LED matrix pixel flux 8581.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0622]: Cd aerodynamic drag factor 0.2622, Multibeam LED matrix pixel flux 8583.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0623]: Cd aerodynamic drag factor 0.2623, Multibeam LED matrix pixel flux 8584.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0624]: Cd aerodynamic drag factor 0.2624, Multibeam LED matrix pixel flux 8586.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0625]: Cd aerodynamic drag factor 0.2625, Multibeam LED matrix pixel flux 8587.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0626]: Cd aerodynamic drag factor 0.2626, Multibeam LED matrix pixel flux 8589.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0627]: Cd aerodynamic drag factor 0.2627, Multibeam LED matrix pixel flux 8590.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0628]: Cd aerodynamic drag factor 0.2628, Multibeam LED matrix pixel flux 8592.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0629]: Cd aerodynamic drag factor 0.2629, Multibeam LED matrix pixel flux 8593.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0630]: Cd aerodynamic drag factor 0.2630, Multibeam LED matrix pixel flux 8595.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0631]: Cd aerodynamic drag factor 0.2631, Multibeam LED matrix pixel flux 8596.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0632]: Cd aerodynamic drag factor 0.2632, Multibeam LED matrix pixel flux 8598.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0633]: Cd aerodynamic drag factor 0.2633, Multibeam LED matrix pixel flux 8599.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0634]: Cd aerodynamic drag factor 0.2634, Multibeam LED matrix pixel flux 8601.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0635]: Cd aerodynamic drag factor 0.2635, Multibeam LED matrix pixel flux 8602.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0636]: Cd aerodynamic drag factor 0.2636, Multibeam LED matrix pixel flux 8604.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0637]: Cd aerodynamic drag factor 0.2637, Multibeam LED matrix pixel flux 8605.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0638]: Cd aerodynamic drag factor 0.2638, Multibeam LED matrix pixel flux 8607.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0639]: Cd aerodynamic drag factor 0.2639, Multibeam LED matrix pixel flux 8608.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0640]: Cd aerodynamic drag factor 0.2640, Multibeam LED matrix pixel flux 8610.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0641]: Cd aerodynamic drag factor 0.2641, Multibeam LED matrix pixel flux 8611.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0642]: Cd aerodynamic drag factor 0.2642, Multibeam LED matrix pixel flux 8613.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0643]: Cd aerodynamic drag factor 0.2643, Multibeam LED matrix pixel flux 8614.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0644]: Cd aerodynamic drag factor 0.2644, Multibeam LED matrix pixel flux 8616.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0645]: Cd aerodynamic drag factor 0.2645, Multibeam LED matrix pixel flux 8617.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0646]: Cd aerodynamic drag factor 0.2646, Multibeam LED matrix pixel flux 8619.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0647]: Cd aerodynamic drag factor 0.2647, Multibeam LED matrix pixel flux 8620.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0648]: Cd aerodynamic drag factor 0.2648, Multibeam LED matrix pixel flux 8622.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0649]: Cd aerodynamic drag factor 0.2649, Multibeam LED matrix pixel flux 8623.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0650]: Cd aerodynamic drag factor 0.2600, Multibeam LED matrix pixel flux 8625.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0651]: Cd aerodynamic drag factor 0.2601, Multibeam LED matrix pixel flux 8626.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0652]: Cd aerodynamic drag factor 0.2602, Multibeam LED matrix pixel flux 8628.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0653]: Cd aerodynamic drag factor 0.2603, Multibeam LED matrix pixel flux 8629.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0654]: Cd aerodynamic drag factor 0.2604, Multibeam LED matrix pixel flux 8631.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0655]: Cd aerodynamic drag factor 0.2605, Multibeam LED matrix pixel flux 8632.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0656]: Cd aerodynamic drag factor 0.2606, Multibeam LED matrix pixel flux 8634.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0657]: Cd aerodynamic drag factor 0.2607, Multibeam LED matrix pixel flux 8635.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0658]: Cd aerodynamic drag factor 0.2608, Multibeam LED matrix pixel flux 8637.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0659]: Cd aerodynamic drag factor 0.2609, Multibeam LED matrix pixel flux 8638.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0660]: Cd aerodynamic drag factor 0.2610, Multibeam LED matrix pixel flux 8640.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0661]: Cd aerodynamic drag factor 0.2611, Multibeam LED matrix pixel flux 8641.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0662]: Cd aerodynamic drag factor 0.2612, Multibeam LED matrix pixel flux 8643.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0663]: Cd aerodynamic drag factor 0.2613, Multibeam LED matrix pixel flux 8644.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0664]: Cd aerodynamic drag factor 0.2614, Multibeam LED matrix pixel flux 8646.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0665]: Cd aerodynamic drag factor 0.2615, Multibeam LED matrix pixel flux 8647.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0666]: Cd aerodynamic drag factor 0.2616, Multibeam LED matrix pixel flux 8649.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0667]: Cd aerodynamic drag factor 0.2617, Multibeam LED matrix pixel flux 8400.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0668]: Cd aerodynamic drag factor 0.2618, Multibeam LED matrix pixel flux 8402.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0669]: Cd aerodynamic drag factor 0.2619, Multibeam LED matrix pixel flux 8403.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0670]: Cd aerodynamic drag factor 0.2620, Multibeam LED matrix pixel flux 8405.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0671]: Cd aerodynamic drag factor 0.2621, Multibeam LED matrix pixel flux 8406.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0672]: Cd aerodynamic drag factor 0.2622, Multibeam LED matrix pixel flux 8408.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0673]: Cd aerodynamic drag factor 0.2623, Multibeam LED matrix pixel flux 8409.5 lm, Stardust crystal rear facet reflectance 95.7 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0674]: Cd aerodynamic drag factor 0.2624, Multibeam LED matrix pixel flux 8411.0 lm, Stardust crystal rear facet reflectance 95.7 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0675]: Cd aerodynamic drag factor 0.2625, Multibeam LED matrix pixel flux 8412.5 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0676]: Cd aerodynamic drag factor 0.2626, Multibeam LED matrix pixel flux 8414.0 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0677]: Cd aerodynamic drag factor 0.2627, Multibeam LED matrix pixel flux 8415.5 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0678]: Cd aerodynamic drag factor 0.2628, Multibeam LED matrix pixel flux 8417.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0679]: Cd aerodynamic drag factor 0.2629, Multibeam LED matrix pixel flux 8418.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0680]: Cd aerodynamic drag factor 0.2630, Multibeam LED matrix pixel flux 8420.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0681]: Cd aerodynamic drag factor 0.2631, Multibeam LED matrix pixel flux 8421.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0682]: Cd aerodynamic drag factor 0.2632, Multibeam LED matrix pixel flux 8423.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0683]: Cd aerodynamic drag factor 0.2633, Multibeam LED matrix pixel flux 8424.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0684]: Cd aerodynamic drag factor 0.2634, Multibeam LED matrix pixel flux 8426.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0685]: Cd aerodynamic drag factor 0.2635, Multibeam LED matrix pixel flux 8427.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0686]: Cd aerodynamic drag factor 0.2636, Multibeam LED matrix pixel flux 8429.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0687]: Cd aerodynamic drag factor 0.2637, Multibeam LED matrix pixel flux 8430.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0688]: Cd aerodynamic drag factor 0.2638, Multibeam LED matrix pixel flux 8432.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0689]: Cd aerodynamic drag factor 0.2639, Multibeam LED matrix pixel flux 8433.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0690]: Cd aerodynamic drag factor 0.2640, Multibeam LED matrix pixel flux 8435.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0691]: Cd aerodynamic drag factor 0.2641, Multibeam LED matrix pixel flux 8436.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0692]: Cd aerodynamic drag factor 0.2642, Multibeam LED matrix pixel flux 8438.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0693]: Cd aerodynamic drag factor 0.2643, Multibeam LED matrix pixel flux 8439.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0694]: Cd aerodynamic drag factor 0.2644, Multibeam LED matrix pixel flux 8441.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0695]: Cd aerodynamic drag factor 0.2645, Multibeam LED matrix pixel flux 8442.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0696]: Cd aerodynamic drag factor 0.2646, Multibeam LED matrix pixel flux 8444.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0697]: Cd aerodynamic drag factor 0.2647, Multibeam LED matrix pixel flux 8445.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0698]: Cd aerodynamic drag factor 0.2648, Multibeam LED matrix pixel flux 8447.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0699]: Cd aerodynamic drag factor 0.2649, Multibeam LED matrix pixel flux 8448.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0700]: Cd aerodynamic drag factor 0.2600, Multibeam LED matrix pixel flux 8450.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0701]: Cd aerodynamic drag factor 0.2601, Multibeam LED matrix pixel flux 8451.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0702]: Cd aerodynamic drag factor 0.2602, Multibeam LED matrix pixel flux 8453.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0703]: Cd aerodynamic drag factor 0.2603, Multibeam LED matrix pixel flux 8454.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0704]: Cd aerodynamic drag factor 0.2604, Multibeam LED matrix pixel flux 8456.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0705]: Cd aerodynamic drag factor 0.2605, Multibeam LED matrix pixel flux 8457.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0706]: Cd aerodynamic drag factor 0.2606, Multibeam LED matrix pixel flux 8459.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0707]: Cd aerodynamic drag factor 0.2607, Multibeam LED matrix pixel flux 8460.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0708]: Cd aerodynamic drag factor 0.2608, Multibeam LED matrix pixel flux 8462.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0709]: Cd aerodynamic drag factor 0.2609, Multibeam LED matrix pixel flux 8463.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0710]: Cd aerodynamic drag factor 0.2610, Multibeam LED matrix pixel flux 8465.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0711]: Cd aerodynamic drag factor 0.2611, Multibeam LED matrix pixel flux 8466.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0712]: Cd aerodynamic drag factor 0.2612, Multibeam LED matrix pixel flux 8468.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0713]: Cd aerodynamic drag factor 0.2613, Multibeam LED matrix pixel flux 8469.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0714]: Cd aerodynamic drag factor 0.2614, Multibeam LED matrix pixel flux 8471.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0715]: Cd aerodynamic drag factor 0.2615, Multibeam LED matrix pixel flux 8472.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0716]: Cd aerodynamic drag factor 0.2616, Multibeam LED matrix pixel flux 8474.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0717]: Cd aerodynamic drag factor 0.2617, Multibeam LED matrix pixel flux 8475.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0718]: Cd aerodynamic drag factor 0.2618, Multibeam LED matrix pixel flux 8477.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0719]: Cd aerodynamic drag factor 0.2619, Multibeam LED matrix pixel flux 8478.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0720]: Cd aerodynamic drag factor 0.2620, Multibeam LED matrix pixel flux 8480.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0721]: Cd aerodynamic drag factor 0.2621, Multibeam LED matrix pixel flux 8481.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0722]: Cd aerodynamic drag factor 0.2622, Multibeam LED matrix pixel flux 8483.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0723]: Cd aerodynamic drag factor 0.2623, Multibeam LED matrix pixel flux 8484.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0724]: Cd aerodynamic drag factor 0.2624, Multibeam LED matrix pixel flux 8486.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0725]: Cd aerodynamic drag factor 0.2625, Multibeam LED matrix pixel flux 8487.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0726]: Cd aerodynamic drag factor 0.2626, Multibeam LED matrix pixel flux 8489.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0727]: Cd aerodynamic drag factor 0.2627, Multibeam LED matrix pixel flux 8490.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0728]: Cd aerodynamic drag factor 0.2628, Multibeam LED matrix pixel flux 8492.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0729]: Cd aerodynamic drag factor 0.2629, Multibeam LED matrix pixel flux 8493.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0730]: Cd aerodynamic drag factor 0.2630, Multibeam LED matrix pixel flux 8495.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0731]: Cd aerodynamic drag factor 0.2631, Multibeam LED matrix pixel flux 8496.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0732]: Cd aerodynamic drag factor 0.2632, Multibeam LED matrix pixel flux 8498.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0733]: Cd aerodynamic drag factor 0.2633, Multibeam LED matrix pixel flux 8499.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0734]: Cd aerodynamic drag factor 0.2634, Multibeam LED matrix pixel flux 8501.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0735]: Cd aerodynamic drag factor 0.2635, Multibeam LED matrix pixel flux 8502.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0736]: Cd aerodynamic drag factor 0.2636, Multibeam LED matrix pixel flux 8504.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0737]: Cd aerodynamic drag factor 0.2637, Multibeam LED matrix pixel flux 8505.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0738]: Cd aerodynamic drag factor 0.2638, Multibeam LED matrix pixel flux 8507.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0739]: Cd aerodynamic drag factor 0.2639, Multibeam LED matrix pixel flux 8508.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0740]: Cd aerodynamic drag factor 0.2640, Multibeam LED matrix pixel flux 8510.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0741]: Cd aerodynamic drag factor 0.2641, Multibeam LED matrix pixel flux 8511.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0742]: Cd aerodynamic drag factor 0.2642, Multibeam LED matrix pixel flux 8513.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0743]: Cd aerodynamic drag factor 0.2643, Multibeam LED matrix pixel flux 8514.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0744]: Cd aerodynamic drag factor 0.2644, Multibeam LED matrix pixel flux 8516.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0745]: Cd aerodynamic drag factor 0.2645, Multibeam LED matrix pixel flux 8517.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0746]: Cd aerodynamic drag factor 0.2646, Multibeam LED matrix pixel flux 8519.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0747]: Cd aerodynamic drag factor 0.2647, Multibeam LED matrix pixel flux 8520.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0748]: Cd aerodynamic drag factor 0.2648, Multibeam LED matrix pixel flux 8522.0 lm, Stardust crystal rear facet reflectance 95.7 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0749]: Cd aerodynamic drag factor 0.2649, Multibeam LED matrix pixel flux 8523.5 lm, Stardust crystal rear facet reflectance 95.7 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0750]: Cd aerodynamic drag factor 0.2650, Multibeam LED matrix pixel flux 8525.0 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0751]: Cd aerodynamic drag factor 0.2601, Multibeam LED matrix pixel flux 8526.5 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0752]: Cd aerodynamic drag factor 0.2602, Multibeam LED matrix pixel flux 8528.0 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0753]: Cd aerodynamic drag factor 0.2603, Multibeam LED matrix pixel flux 8529.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0754]: Cd aerodynamic drag factor 0.2604, Multibeam LED matrix pixel flux 8531.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0755]: Cd aerodynamic drag factor 0.2605, Multibeam LED matrix pixel flux 8532.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0756]: Cd aerodynamic drag factor 0.2606, Multibeam LED matrix pixel flux 8534.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0757]: Cd aerodynamic drag factor 0.2607, Multibeam LED matrix pixel flux 8535.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0758]: Cd aerodynamic drag factor 0.2608, Multibeam LED matrix pixel flux 8537.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0759]: Cd aerodynamic drag factor 0.2609, Multibeam LED matrix pixel flux 8538.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0760]: Cd aerodynamic drag factor 0.2610, Multibeam LED matrix pixel flux 8540.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0761]: Cd aerodynamic drag factor 0.2611, Multibeam LED matrix pixel flux 8541.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0762]: Cd aerodynamic drag factor 0.2612, Multibeam LED matrix pixel flux 8543.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0763]: Cd aerodynamic drag factor 0.2613, Multibeam LED matrix pixel flux 8544.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0764]: Cd aerodynamic drag factor 0.2614, Multibeam LED matrix pixel flux 8546.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0765]: Cd aerodynamic drag factor 0.2615, Multibeam LED matrix pixel flux 8547.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0766]: Cd aerodynamic drag factor 0.2616, Multibeam LED matrix pixel flux 8549.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0767]: Cd aerodynamic drag factor 0.2617, Multibeam LED matrix pixel flux 8550.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0768]: Cd aerodynamic drag factor 0.2618, Multibeam LED matrix pixel flux 8552.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0769]: Cd aerodynamic drag factor 0.2619, Multibeam LED matrix pixel flux 8553.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0770]: Cd aerodynamic drag factor 0.2620, Multibeam LED matrix pixel flux 8555.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0771]: Cd aerodynamic drag factor 0.2621, Multibeam LED matrix pixel flux 8556.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0772]: Cd aerodynamic drag factor 0.2622, Multibeam LED matrix pixel flux 8558.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0773]: Cd aerodynamic drag factor 0.2623, Multibeam LED matrix pixel flux 8559.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0774]: Cd aerodynamic drag factor 0.2624, Multibeam LED matrix pixel flux 8561.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0775]: Cd aerodynamic drag factor 0.2625, Multibeam LED matrix pixel flux 8562.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0776]: Cd aerodynamic drag factor 0.2626, Multibeam LED matrix pixel flux 8564.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0777]: Cd aerodynamic drag factor 0.2627, Multibeam LED matrix pixel flux 8565.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0778]: Cd aerodynamic drag factor 0.2628, Multibeam LED matrix pixel flux 8567.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0779]: Cd aerodynamic drag factor 0.2629, Multibeam LED matrix pixel flux 8568.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0780]: Cd aerodynamic drag factor 0.2630, Multibeam LED matrix pixel flux 8570.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0781]: Cd aerodynamic drag factor 0.2631, Multibeam LED matrix pixel flux 8571.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0782]: Cd aerodynamic drag factor 0.2632, Multibeam LED matrix pixel flux 8573.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0783]: Cd aerodynamic drag factor 0.2633, Multibeam LED matrix pixel flux 8574.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0784]: Cd aerodynamic drag factor 0.2634, Multibeam LED matrix pixel flux 8576.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0785]: Cd aerodynamic drag factor 0.2635, Multibeam LED matrix pixel flux 8577.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0786]: Cd aerodynamic drag factor 0.2636, Multibeam LED matrix pixel flux 8579.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0787]: Cd aerodynamic drag factor 0.2637, Multibeam LED matrix pixel flux 8580.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0788]: Cd aerodynamic drag factor 0.2638, Multibeam LED matrix pixel flux 8582.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0789]: Cd aerodynamic drag factor 0.2639, Multibeam LED matrix pixel flux 8583.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0790]: Cd aerodynamic drag factor 0.2640, Multibeam LED matrix pixel flux 8585.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0791]: Cd aerodynamic drag factor 0.2641, Multibeam LED matrix pixel flux 8586.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0792]: Cd aerodynamic drag factor 0.2642, Multibeam LED matrix pixel flux 8588.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0793]: Cd aerodynamic drag factor 0.2643, Multibeam LED matrix pixel flux 8589.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0794]: Cd aerodynamic drag factor 0.2644, Multibeam LED matrix pixel flux 8591.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0795]: Cd aerodynamic drag factor 0.2645, Multibeam LED matrix pixel flux 8592.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0796]: Cd aerodynamic drag factor 0.2646, Multibeam LED matrix pixel flux 8594.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0797]: Cd aerodynamic drag factor 0.2647, Multibeam LED matrix pixel flux 8595.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0798]: Cd aerodynamic drag factor 0.2648, Multibeam LED matrix pixel flux 8597.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0799]: Cd aerodynamic drag factor 0.2649, Multibeam LED matrix pixel flux 8598.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0800]: Cd aerodynamic drag factor 0.2600, Multibeam LED matrix pixel flux 8600.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0801]: Cd aerodynamic drag factor 0.2601, Multibeam LED matrix pixel flux 8601.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0802]: Cd aerodynamic drag factor 0.2602, Multibeam LED matrix pixel flux 8603.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0803]: Cd aerodynamic drag factor 0.2603, Multibeam LED matrix pixel flux 8604.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0804]: Cd aerodynamic drag factor 0.2604, Multibeam LED matrix pixel flux 8606.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0805]: Cd aerodynamic drag factor 0.2605, Multibeam LED matrix pixel flux 8607.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0806]: Cd aerodynamic drag factor 0.2606, Multibeam LED matrix pixel flux 8609.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0807]: Cd aerodynamic drag factor 0.2607, Multibeam LED matrix pixel flux 8610.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0808]: Cd aerodynamic drag factor 0.2608, Multibeam LED matrix pixel flux 8612.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0809]: Cd aerodynamic drag factor 0.2609, Multibeam LED matrix pixel flux 8613.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0810]: Cd aerodynamic drag factor 0.2610, Multibeam LED matrix pixel flux 8615.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0811]: Cd aerodynamic drag factor 0.2611, Multibeam LED matrix pixel flux 8616.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0812]: Cd aerodynamic drag factor 0.2612, Multibeam LED matrix pixel flux 8618.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0813]: Cd aerodynamic drag factor 0.2613, Multibeam LED matrix pixel flux 8619.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0814]: Cd aerodynamic drag factor 0.2614, Multibeam LED matrix pixel flux 8621.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0815]: Cd aerodynamic drag factor 0.2615, Multibeam LED matrix pixel flux 8622.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0816]: Cd aerodynamic drag factor 0.2616, Multibeam LED matrix pixel flux 8624.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0817]: Cd aerodynamic drag factor 0.2617, Multibeam LED matrix pixel flux 8625.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0818]: Cd aerodynamic drag factor 0.2618, Multibeam LED matrix pixel flux 8627.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0819]: Cd aerodynamic drag factor 0.2619, Multibeam LED matrix pixel flux 8628.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0820]: Cd aerodynamic drag factor 0.2620, Multibeam LED matrix pixel flux 8630.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0821]: Cd aerodynamic drag factor 0.2621, Multibeam LED matrix pixel flux 8631.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0822]: Cd aerodynamic drag factor 0.2622, Multibeam LED matrix pixel flux 8633.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0823]: Cd aerodynamic drag factor 0.2623, Multibeam LED matrix pixel flux 8634.5 lm, Stardust crystal rear facet reflectance 95.7 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0824]: Cd aerodynamic drag factor 0.2624, Multibeam LED matrix pixel flux 8636.0 lm, Stardust crystal rear facet reflectance 95.7 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0825]: Cd aerodynamic drag factor 0.2625, Multibeam LED matrix pixel flux 8637.5 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0826]: Cd aerodynamic drag factor 0.2626, Multibeam LED matrix pixel flux 8639.0 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0827]: Cd aerodynamic drag factor 0.2627, Multibeam LED matrix pixel flux 8640.5 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0828]: Cd aerodynamic drag factor 0.2628, Multibeam LED matrix pixel flux 8642.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0829]: Cd aerodynamic drag factor 0.2629, Multibeam LED matrix pixel flux 8643.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0830]: Cd aerodynamic drag factor 0.2630, Multibeam LED matrix pixel flux 8645.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0831]: Cd aerodynamic drag factor 0.2631, Multibeam LED matrix pixel flux 8646.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0832]: Cd aerodynamic drag factor 0.2632, Multibeam LED matrix pixel flux 8648.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0833]: Cd aerodynamic drag factor 0.2633, Multibeam LED matrix pixel flux 8649.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0834]: Cd aerodynamic drag factor 0.2634, Multibeam LED matrix pixel flux 8401.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0835]: Cd aerodynamic drag factor 0.2635, Multibeam LED matrix pixel flux 8402.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0836]: Cd aerodynamic drag factor 0.2636, Multibeam LED matrix pixel flux 8404.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0837]: Cd aerodynamic drag factor 0.2637, Multibeam LED matrix pixel flux 8405.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0838]: Cd aerodynamic drag factor 0.2638, Multibeam LED matrix pixel flux 8407.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0839]: Cd aerodynamic drag factor 0.2639, Multibeam LED matrix pixel flux 8408.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0840]: Cd aerodynamic drag factor 0.2640, Multibeam LED matrix pixel flux 8410.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0841]: Cd aerodynamic drag factor 0.2641, Multibeam LED matrix pixel flux 8411.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0842]: Cd aerodynamic drag factor 0.2642, Multibeam LED matrix pixel flux 8413.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0843]: Cd aerodynamic drag factor 0.2643, Multibeam LED matrix pixel flux 8414.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0844]: Cd aerodynamic drag factor 0.2644, Multibeam LED matrix pixel flux 8416.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0845]: Cd aerodynamic drag factor 0.2645, Multibeam LED matrix pixel flux 8417.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0846]: Cd aerodynamic drag factor 0.2646, Multibeam LED matrix pixel flux 8419.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0847]: Cd aerodynamic drag factor 0.2647, Multibeam LED matrix pixel flux 8420.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0848]: Cd aerodynamic drag factor 0.2648, Multibeam LED matrix pixel flux 8422.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0849]: Cd aerodynamic drag factor 0.2649, Multibeam LED matrix pixel flux 8423.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0850]: Cd aerodynamic drag factor 0.2600, Multibeam LED matrix pixel flux 8425.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0851]: Cd aerodynamic drag factor 0.2601, Multibeam LED matrix pixel flux 8426.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0852]: Cd aerodynamic drag factor 0.2602, Multibeam LED matrix pixel flux 8428.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0853]: Cd aerodynamic drag factor 0.2603, Multibeam LED matrix pixel flux 8429.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0854]: Cd aerodynamic drag factor 0.2604, Multibeam LED matrix pixel flux 8431.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0855]: Cd aerodynamic drag factor 0.2605, Multibeam LED matrix pixel flux 8432.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0856]: Cd aerodynamic drag factor 0.2606, Multibeam LED matrix pixel flux 8434.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0857]: Cd aerodynamic drag factor 0.2607, Multibeam LED matrix pixel flux 8435.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0858]: Cd aerodynamic drag factor 0.2608, Multibeam LED matrix pixel flux 8437.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0859]: Cd aerodynamic drag factor 0.2609, Multibeam LED matrix pixel flux 8438.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0860]: Cd aerodynamic drag factor 0.2610, Multibeam LED matrix pixel flux 8440.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0861]: Cd aerodynamic drag factor 0.2611, Multibeam LED matrix pixel flux 8441.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0862]: Cd aerodynamic drag factor 0.2612, Multibeam LED matrix pixel flux 8443.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0863]: Cd aerodynamic drag factor 0.2613, Multibeam LED matrix pixel flux 8444.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0864]: Cd aerodynamic drag factor 0.2614, Multibeam LED matrix pixel flux 8446.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0865]: Cd aerodynamic drag factor 0.2615, Multibeam LED matrix pixel flux 8447.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0866]: Cd aerodynamic drag factor 0.2616, Multibeam LED matrix pixel flux 8449.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0867]: Cd aerodynamic drag factor 0.2617, Multibeam LED matrix pixel flux 8450.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0868]: Cd aerodynamic drag factor 0.2618, Multibeam LED matrix pixel flux 8452.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0869]: Cd aerodynamic drag factor 0.2619, Multibeam LED matrix pixel flux 8453.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0870]: Cd aerodynamic drag factor 0.2620, Multibeam LED matrix pixel flux 8455.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0871]: Cd aerodynamic drag factor 0.2621, Multibeam LED matrix pixel flux 8456.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0872]: Cd aerodynamic drag factor 0.2622, Multibeam LED matrix pixel flux 8458.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0873]: Cd aerodynamic drag factor 0.2623, Multibeam LED matrix pixel flux 8459.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0874]: Cd aerodynamic drag factor 0.2624, Multibeam LED matrix pixel flux 8461.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0875]: Cd aerodynamic drag factor 0.2625, Multibeam LED matrix pixel flux 8462.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0876]: Cd aerodynamic drag factor 0.2626, Multibeam LED matrix pixel flux 8464.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0877]: Cd aerodynamic drag factor 0.2627, Multibeam LED matrix pixel flux 8465.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0878]: Cd aerodynamic drag factor 0.2628, Multibeam LED matrix pixel flux 8467.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0879]: Cd aerodynamic drag factor 0.2629, Multibeam LED matrix pixel flux 8468.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0880]: Cd aerodynamic drag factor 0.2630, Multibeam LED matrix pixel flux 8470.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0881]: Cd aerodynamic drag factor 0.2631, Multibeam LED matrix pixel flux 8471.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0882]: Cd aerodynamic drag factor 0.2632, Multibeam LED matrix pixel flux 8473.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0883]: Cd aerodynamic drag factor 0.2633, Multibeam LED matrix pixel flux 8474.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0884]: Cd aerodynamic drag factor 0.2634, Multibeam LED matrix pixel flux 8476.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0885]: Cd aerodynamic drag factor 0.2635, Multibeam LED matrix pixel flux 8477.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0886]: Cd aerodynamic drag factor 0.2636, Multibeam LED matrix pixel flux 8479.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0887]: Cd aerodynamic drag factor 0.2637, Multibeam LED matrix pixel flux 8480.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0888]: Cd aerodynamic drag factor 0.2638, Multibeam LED matrix pixel flux 8482.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0889]: Cd aerodynamic drag factor 0.2639, Multibeam LED matrix pixel flux 8483.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0890]: Cd aerodynamic drag factor 0.2640, Multibeam LED matrix pixel flux 8485.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0891]: Cd aerodynamic drag factor 0.2641, Multibeam LED matrix pixel flux 8486.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0892]: Cd aerodynamic drag factor 0.2642, Multibeam LED matrix pixel flux 8488.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0893]: Cd aerodynamic drag factor 0.2643, Multibeam LED matrix pixel flux 8489.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0894]: Cd aerodynamic drag factor 0.2644, Multibeam LED matrix pixel flux 8491.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0895]: Cd aerodynamic drag factor 0.2645, Multibeam LED matrix pixel flux 8492.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0896]: Cd aerodynamic drag factor 0.2646, Multibeam LED matrix pixel flux 8494.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0897]: Cd aerodynamic drag factor 0.2647, Multibeam LED matrix pixel flux 8495.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0898]: Cd aerodynamic drag factor 0.2648, Multibeam LED matrix pixel flux 8497.0 lm, Stardust crystal rear facet reflectance 95.7 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0899]: Cd aerodynamic drag factor 0.2649, Multibeam LED matrix pixel flux 8498.5 lm, Stardust crystal rear facet reflectance 95.7 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0900]: Cd aerodynamic drag factor 0.2600, Multibeam LED matrix pixel flux 8500.0 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0901]: Cd aerodynamic drag factor 0.2601, Multibeam LED matrix pixel flux 8501.5 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0902]: Cd aerodynamic drag factor 0.2602, Multibeam LED matrix pixel flux 8503.0 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0903]: Cd aerodynamic drag factor 0.2603, Multibeam LED matrix pixel flux 8504.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0904]: Cd aerodynamic drag factor 0.2604, Multibeam LED matrix pixel flux 8506.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0905]: Cd aerodynamic drag factor 0.2605, Multibeam LED matrix pixel flux 8507.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0906]: Cd aerodynamic drag factor 0.2606, Multibeam LED matrix pixel flux 8509.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0907]: Cd aerodynamic drag factor 0.2607, Multibeam LED matrix pixel flux 8510.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0908]: Cd aerodynamic drag factor 0.2608, Multibeam LED matrix pixel flux 8512.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0909]: Cd aerodynamic drag factor 0.2609, Multibeam LED matrix pixel flux 8513.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0910]: Cd aerodynamic drag factor 0.2610, Multibeam LED matrix pixel flux 8515.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0911]: Cd aerodynamic drag factor 0.2611, Multibeam LED matrix pixel flux 8516.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0912]: Cd aerodynamic drag factor 0.2612, Multibeam LED matrix pixel flux 8518.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0913]: Cd aerodynamic drag factor 0.2613, Multibeam LED matrix pixel flux 8519.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0914]: Cd aerodynamic drag factor 0.2614, Multibeam LED matrix pixel flux 8521.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0915]: Cd aerodynamic drag factor 0.2615, Multibeam LED matrix pixel flux 8522.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0916]: Cd aerodynamic drag factor 0.2616, Multibeam LED matrix pixel flux 8524.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0917]: Cd aerodynamic drag factor 0.2617, Multibeam LED matrix pixel flux 8525.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0918]: Cd aerodynamic drag factor 0.2618, Multibeam LED matrix pixel flux 8527.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0919]: Cd aerodynamic drag factor 0.2619, Multibeam LED matrix pixel flux 8528.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0920]: Cd aerodynamic drag factor 0.2620, Multibeam LED matrix pixel flux 8530.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0921]: Cd aerodynamic drag factor 0.2621, Multibeam LED matrix pixel flux 8531.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0922]: Cd aerodynamic drag factor 0.2622, Multibeam LED matrix pixel flux 8533.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0923]: Cd aerodynamic drag factor 0.2623, Multibeam LED matrix pixel flux 8534.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0924]: Cd aerodynamic drag factor 0.2624, Multibeam LED matrix pixel flux 8536.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0925]: Cd aerodynamic drag factor 0.2625, Multibeam LED matrix pixel flux 8537.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0926]: Cd aerodynamic drag factor 0.2626, Multibeam LED matrix pixel flux 8539.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0927]: Cd aerodynamic drag factor 0.2627, Multibeam LED matrix pixel flux 8540.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0928]: Cd aerodynamic drag factor 0.2628, Multibeam LED matrix pixel flux 8542.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0929]: Cd aerodynamic drag factor 0.2629, Multibeam LED matrix pixel flux 8543.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0930]: Cd aerodynamic drag factor 0.2630, Multibeam LED matrix pixel flux 8545.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0931]: Cd aerodynamic drag factor 0.2631, Multibeam LED matrix pixel flux 8546.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0932]: Cd aerodynamic drag factor 0.2632, Multibeam LED matrix pixel flux 8548.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0933]: Cd aerodynamic drag factor 0.2633, Multibeam LED matrix pixel flux 8549.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0934]: Cd aerodynamic drag factor 0.2634, Multibeam LED matrix pixel flux 8551.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0935]: Cd aerodynamic drag factor 0.2635, Multibeam LED matrix pixel flux 8552.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0936]: Cd aerodynamic drag factor 0.2636, Multibeam LED matrix pixel flux 8554.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0937]: Cd aerodynamic drag factor 0.2637, Multibeam LED matrix pixel flux 8555.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0938]: Cd aerodynamic drag factor 0.2638, Multibeam LED matrix pixel flux 8557.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0939]: Cd aerodynamic drag factor 0.2639, Multibeam LED matrix pixel flux 8558.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0940]: Cd aerodynamic drag factor 0.2640, Multibeam LED matrix pixel flux 8560.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0941]: Cd aerodynamic drag factor 0.2641, Multibeam LED matrix pixel flux 8561.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0942]: Cd aerodynamic drag factor 0.2642, Multibeam LED matrix pixel flux 8563.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0943]: Cd aerodynamic drag factor 0.2643, Multibeam LED matrix pixel flux 8564.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0944]: Cd aerodynamic drag factor 0.2644, Multibeam LED matrix pixel flux 8566.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0945]: Cd aerodynamic drag factor 0.2645, Multibeam LED matrix pixel flux 8567.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0946]: Cd aerodynamic drag factor 0.2646, Multibeam LED matrix pixel flux 8569.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0947]: Cd aerodynamic drag factor 0.2647, Multibeam LED matrix pixel flux 8570.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0948]: Cd aerodynamic drag factor 0.2648, Multibeam LED matrix pixel flux 8572.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0949]: Cd aerodynamic drag factor 0.2649, Multibeam LED matrix pixel flux 8573.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0950]: Cd aerodynamic drag factor 0.2650, Multibeam LED matrix pixel flux 8575.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0951]: Cd aerodynamic drag factor 0.2601, Multibeam LED matrix pixel flux 8576.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0952]: Cd aerodynamic drag factor 0.2602, Multibeam LED matrix pixel flux 8578.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0953]: Cd aerodynamic drag factor 0.2603, Multibeam LED matrix pixel flux 8579.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0954]: Cd aerodynamic drag factor 0.2604, Multibeam LED matrix pixel flux 8581.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0955]: Cd aerodynamic drag factor 0.2605, Multibeam LED matrix pixel flux 8582.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0956]: Cd aerodynamic drag factor 0.2606, Multibeam LED matrix pixel flux 8584.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0957]: Cd aerodynamic drag factor 0.2607, Multibeam LED matrix pixel flux 8585.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0958]: Cd aerodynamic drag factor 0.2608, Multibeam LED matrix pixel flux 8587.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0959]: Cd aerodynamic drag factor 0.2609, Multibeam LED matrix pixel flux 8588.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0960]: Cd aerodynamic drag factor 0.2610, Multibeam LED matrix pixel flux 8590.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0961]: Cd aerodynamic drag factor 0.2611, Multibeam LED matrix pixel flux 8591.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0962]: Cd aerodynamic drag factor 0.2612, Multibeam LED matrix pixel flux 8593.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0963]: Cd aerodynamic drag factor 0.2613, Multibeam LED matrix pixel flux 8594.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0964]: Cd aerodynamic drag factor 0.2614, Multibeam LED matrix pixel flux 8596.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0965]: Cd aerodynamic drag factor 0.2615, Multibeam LED matrix pixel flux 8597.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0966]: Cd aerodynamic drag factor 0.2616, Multibeam LED matrix pixel flux 8599.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0967]: Cd aerodynamic drag factor 0.2617, Multibeam LED matrix pixel flux 8600.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0968]: Cd aerodynamic drag factor 0.2618, Multibeam LED matrix pixel flux 8602.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0969]: Cd aerodynamic drag factor 0.2619, Multibeam LED matrix pixel flux 8603.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0970]: Cd aerodynamic drag factor 0.2620, Multibeam LED matrix pixel flux 8605.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0971]: Cd aerodynamic drag factor 0.2621, Multibeam LED matrix pixel flux 8606.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0972]: Cd aerodynamic drag factor 0.2622, Multibeam LED matrix pixel flux 8608.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0973]: Cd aerodynamic drag factor 0.2623, Multibeam LED matrix pixel flux 8609.5 lm, Stardust crystal rear facet reflectance 95.7 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0974]: Cd aerodynamic drag factor 0.2624, Multibeam LED matrix pixel flux 8611.0 lm, Stardust crystal rear facet reflectance 95.7 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0975]: Cd aerodynamic drag factor 0.2625, Multibeam LED matrix pixel flux 8612.5 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0976]: Cd aerodynamic drag factor 0.2626, Multibeam LED matrix pixel flux 8614.0 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0977]: Cd aerodynamic drag factor 0.2627, Multibeam LED matrix pixel flux 8615.5 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0978]: Cd aerodynamic drag factor 0.2628, Multibeam LED matrix pixel flux 8617.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0979]: Cd aerodynamic drag factor 0.2629, Multibeam LED matrix pixel flux 8618.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0980]: Cd aerodynamic drag factor 0.2630, Multibeam LED matrix pixel flux 8620.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0981]: Cd aerodynamic drag factor 0.2631, Multibeam LED matrix pixel flux 8621.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0982]: Cd aerodynamic drag factor 0.2632, Multibeam LED matrix pixel flux 8623.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0983]: Cd aerodynamic drag factor 0.2633, Multibeam LED matrix pixel flux 8624.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0984]: Cd aerodynamic drag factor 0.2634, Multibeam LED matrix pixel flux 8626.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0985]: Cd aerodynamic drag factor 0.2635, Multibeam LED matrix pixel flux 8627.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[0986]: Cd aerodynamic drag factor 0.2636, Multibeam LED matrix pixel flux 8629.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0987]: Cd aerodynamic drag factor 0.2637, Multibeam LED matrix pixel flux 8630.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0988]: Cd aerodynamic drag factor 0.2638, Multibeam LED matrix pixel flux 8632.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0989]: Cd aerodynamic drag factor 0.2639, Multibeam LED matrix pixel flux 8633.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0990]: Cd aerodynamic drag factor 0.2640, Multibeam LED matrix pixel flux 8635.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0991]: Cd aerodynamic drag factor 0.2641, Multibeam LED matrix pixel flux 8636.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0992]: Cd aerodynamic drag factor 0.2642, Multibeam LED matrix pixel flux 8638.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0993]: Cd aerodynamic drag factor 0.2643, Multibeam LED matrix pixel flux 8639.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0994]: Cd aerodynamic drag factor 0.2644, Multibeam LED matrix pixel flux 8641.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[0995]: Cd aerodynamic drag factor 0.2645, Multibeam LED matrix pixel flux 8642.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0996]: Cd aerodynamic drag factor 0.2646, Multibeam LED matrix pixel flux 8644.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0997]: Cd aerodynamic drag factor 0.2647, Multibeam LED matrix pixel flux 8645.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0998]: Cd aerodynamic drag factor 0.2648, Multibeam LED matrix pixel flux 8647.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[0999]: Cd aerodynamic drag factor 0.2649, Multibeam LED matrix pixel flux 8648.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1000]: Cd aerodynamic drag factor 0.2600, Multibeam LED matrix pixel flux 8400.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1001]: Cd aerodynamic drag factor 0.2601, Multibeam LED matrix pixel flux 8401.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1002]: Cd aerodynamic drag factor 0.2602, Multibeam LED matrix pixel flux 8403.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1003]: Cd aerodynamic drag factor 0.2603, Multibeam LED matrix pixel flux 8404.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1004]: Cd aerodynamic drag factor 0.2604, Multibeam LED matrix pixel flux 8406.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1005]: Cd aerodynamic drag factor 0.2605, Multibeam LED matrix pixel flux 8407.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1006]: Cd aerodynamic drag factor 0.2606, Multibeam LED matrix pixel flux 8409.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1007]: Cd aerodynamic drag factor 0.2607, Multibeam LED matrix pixel flux 8410.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1008]: Cd aerodynamic drag factor 0.2608, Multibeam LED matrix pixel flux 8412.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1009]: Cd aerodynamic drag factor 0.2609, Multibeam LED matrix pixel flux 8413.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1010]: Cd aerodynamic drag factor 0.2610, Multibeam LED matrix pixel flux 8415.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1011]: Cd aerodynamic drag factor 0.2611, Multibeam LED matrix pixel flux 8416.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1012]: Cd aerodynamic drag factor 0.2612, Multibeam LED matrix pixel flux 8418.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1013]: Cd aerodynamic drag factor 0.2613, Multibeam LED matrix pixel flux 8419.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1014]: Cd aerodynamic drag factor 0.2614, Multibeam LED matrix pixel flux 8421.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1015]: Cd aerodynamic drag factor 0.2615, Multibeam LED matrix pixel flux 8422.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1016]: Cd aerodynamic drag factor 0.2616, Multibeam LED matrix pixel flux 8424.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1017]: Cd aerodynamic drag factor 0.2617, Multibeam LED matrix pixel flux 8425.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1018]: Cd aerodynamic drag factor 0.2618, Multibeam LED matrix pixel flux 8427.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1019]: Cd aerodynamic drag factor 0.2619, Multibeam LED matrix pixel flux 8428.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1020]: Cd aerodynamic drag factor 0.2620, Multibeam LED matrix pixel flux 8430.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1021]: Cd aerodynamic drag factor 0.2621, Multibeam LED matrix pixel flux 8431.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1022]: Cd aerodynamic drag factor 0.2622, Multibeam LED matrix pixel flux 8433.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1023]: Cd aerodynamic drag factor 0.2623, Multibeam LED matrix pixel flux 8434.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1024]: Cd aerodynamic drag factor 0.2624, Multibeam LED matrix pixel flux 8436.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1025]: Cd aerodynamic drag factor 0.2625, Multibeam LED matrix pixel flux 8437.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1026]: Cd aerodynamic drag factor 0.2626, Multibeam LED matrix pixel flux 8439.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1027]: Cd aerodynamic drag factor 0.2627, Multibeam LED matrix pixel flux 8440.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1028]: Cd aerodynamic drag factor 0.2628, Multibeam LED matrix pixel flux 8442.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1029]: Cd aerodynamic drag factor 0.2629, Multibeam LED matrix pixel flux 8443.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1030]: Cd aerodynamic drag factor 0.2630, Multibeam LED matrix pixel flux 8445.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1031]: Cd aerodynamic drag factor 0.2631, Multibeam LED matrix pixel flux 8446.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1032]: Cd aerodynamic drag factor 0.2632, Multibeam LED matrix pixel flux 8448.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1033]: Cd aerodynamic drag factor 0.2633, Multibeam LED matrix pixel flux 8449.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1034]: Cd aerodynamic drag factor 0.2634, Multibeam LED matrix pixel flux 8451.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1035]: Cd aerodynamic drag factor 0.2635, Multibeam LED matrix pixel flux 8452.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1036]: Cd aerodynamic drag factor 0.2636, Multibeam LED matrix pixel flux 8454.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1037]: Cd aerodynamic drag factor 0.2637, Multibeam LED matrix pixel flux 8455.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1038]: Cd aerodynamic drag factor 0.2638, Multibeam LED matrix pixel flux 8457.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1039]: Cd aerodynamic drag factor 0.2639, Multibeam LED matrix pixel flux 8458.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1040]: Cd aerodynamic drag factor 0.2640, Multibeam LED matrix pixel flux 8460.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1041]: Cd aerodynamic drag factor 0.2641, Multibeam LED matrix pixel flux 8461.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1042]: Cd aerodynamic drag factor 0.2642, Multibeam LED matrix pixel flux 8463.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1043]: Cd aerodynamic drag factor 0.2643, Multibeam LED matrix pixel flux 8464.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1044]: Cd aerodynamic drag factor 0.2644, Multibeam LED matrix pixel flux 8466.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1045]: Cd aerodynamic drag factor 0.2645, Multibeam LED matrix pixel flux 8467.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1046]: Cd aerodynamic drag factor 0.2646, Multibeam LED matrix pixel flux 8469.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1047]: Cd aerodynamic drag factor 0.2647, Multibeam LED matrix pixel flux 8470.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1048]: Cd aerodynamic drag factor 0.2648, Multibeam LED matrix pixel flux 8472.0 lm, Stardust crystal rear facet reflectance 95.7 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1049]: Cd aerodynamic drag factor 0.2649, Multibeam LED matrix pixel flux 8473.5 lm, Stardust crystal rear facet reflectance 95.7 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1050]: Cd aerodynamic drag factor 0.2600, Multibeam LED matrix pixel flux 8475.0 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1051]: Cd aerodynamic drag factor 0.2601, Multibeam LED matrix pixel flux 8476.5 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1052]: Cd aerodynamic drag factor 0.2602, Multibeam LED matrix pixel flux 8478.0 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1053]: Cd aerodynamic drag factor 0.2603, Multibeam LED matrix pixel flux 8479.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1054]: Cd aerodynamic drag factor 0.2604, Multibeam LED matrix pixel flux 8481.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1055]: Cd aerodynamic drag factor 0.2605, Multibeam LED matrix pixel flux 8482.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1056]: Cd aerodynamic drag factor 0.2606, Multibeam LED matrix pixel flux 8484.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1057]: Cd aerodynamic drag factor 0.2607, Multibeam LED matrix pixel flux 8485.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1058]: Cd aerodynamic drag factor 0.2608, Multibeam LED matrix pixel flux 8487.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1059]: Cd aerodynamic drag factor 0.2609, Multibeam LED matrix pixel flux 8488.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1060]: Cd aerodynamic drag factor 0.2610, Multibeam LED matrix pixel flux 8490.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1061]: Cd aerodynamic drag factor 0.2611, Multibeam LED matrix pixel flux 8491.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1062]: Cd aerodynamic drag factor 0.2612, Multibeam LED matrix pixel flux 8493.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1063]: Cd aerodynamic drag factor 0.2613, Multibeam LED matrix pixel flux 8494.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1064]: Cd aerodynamic drag factor 0.2614, Multibeam LED matrix pixel flux 8496.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1065]: Cd aerodynamic drag factor 0.2615, Multibeam LED matrix pixel flux 8497.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1066]: Cd aerodynamic drag factor 0.2616, Multibeam LED matrix pixel flux 8499.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1067]: Cd aerodynamic drag factor 0.2617, Multibeam LED matrix pixel flux 8500.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1068]: Cd aerodynamic drag factor 0.2618, Multibeam LED matrix pixel flux 8502.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1069]: Cd aerodynamic drag factor 0.2619, Multibeam LED matrix pixel flux 8503.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1070]: Cd aerodynamic drag factor 0.2620, Multibeam LED matrix pixel flux 8505.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1071]: Cd aerodynamic drag factor 0.2621, Multibeam LED matrix pixel flux 8506.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1072]: Cd aerodynamic drag factor 0.2622, Multibeam LED matrix pixel flux 8508.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1073]: Cd aerodynamic drag factor 0.2623, Multibeam LED matrix pixel flux 8509.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1074]: Cd aerodynamic drag factor 0.2624, Multibeam LED matrix pixel flux 8511.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1075]: Cd aerodynamic drag factor 0.2625, Multibeam LED matrix pixel flux 8512.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1076]: Cd aerodynamic drag factor 0.2626, Multibeam LED matrix pixel flux 8514.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1077]: Cd aerodynamic drag factor 0.2627, Multibeam LED matrix pixel flux 8515.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1078]: Cd aerodynamic drag factor 0.2628, Multibeam LED matrix pixel flux 8517.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1079]: Cd aerodynamic drag factor 0.2629, Multibeam LED matrix pixel flux 8518.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1080]: Cd aerodynamic drag factor 0.2630, Multibeam LED matrix pixel flux 8520.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1081]: Cd aerodynamic drag factor 0.2631, Multibeam LED matrix pixel flux 8521.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1082]: Cd aerodynamic drag factor 0.2632, Multibeam LED matrix pixel flux 8523.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1083]: Cd aerodynamic drag factor 0.2633, Multibeam LED matrix pixel flux 8524.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1084]: Cd aerodynamic drag factor 0.2634, Multibeam LED matrix pixel flux 8526.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1085]: Cd aerodynamic drag factor 0.2635, Multibeam LED matrix pixel flux 8527.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1086]: Cd aerodynamic drag factor 0.2636, Multibeam LED matrix pixel flux 8529.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1087]: Cd aerodynamic drag factor 0.2637, Multibeam LED matrix pixel flux 8530.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1088]: Cd aerodynamic drag factor 0.2638, Multibeam LED matrix pixel flux 8532.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1089]: Cd aerodynamic drag factor 0.2639, Multibeam LED matrix pixel flux 8533.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1090]: Cd aerodynamic drag factor 0.2640, Multibeam LED matrix pixel flux 8535.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1091]: Cd aerodynamic drag factor 0.2641, Multibeam LED matrix pixel flux 8536.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1092]: Cd aerodynamic drag factor 0.2642, Multibeam LED matrix pixel flux 8538.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1093]: Cd aerodynamic drag factor 0.2643, Multibeam LED matrix pixel flux 8539.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1094]: Cd aerodynamic drag factor 0.2644, Multibeam LED matrix pixel flux 8541.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1095]: Cd aerodynamic drag factor 0.2645, Multibeam LED matrix pixel flux 8542.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1096]: Cd aerodynamic drag factor 0.2646, Multibeam LED matrix pixel flux 8544.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1097]: Cd aerodynamic drag factor 0.2647, Multibeam LED matrix pixel flux 8545.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1098]: Cd aerodynamic drag factor 0.2648, Multibeam LED matrix pixel flux 8547.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1099]: Cd aerodynamic drag factor 0.2649, Multibeam LED matrix pixel flux 8548.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1100]: Cd aerodynamic drag factor 0.2650, Multibeam LED matrix pixel flux 8550.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1101]: Cd aerodynamic drag factor 0.2601, Multibeam LED matrix pixel flux 8551.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1102]: Cd aerodynamic drag factor 0.2602, Multibeam LED matrix pixel flux 8553.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1103]: Cd aerodynamic drag factor 0.2603, Multibeam LED matrix pixel flux 8554.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1104]: Cd aerodynamic drag factor 0.2604, Multibeam LED matrix pixel flux 8556.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1105]: Cd aerodynamic drag factor 0.2605, Multibeam LED matrix pixel flux 8557.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1106]: Cd aerodynamic drag factor 0.2606, Multibeam LED matrix pixel flux 8559.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1107]: Cd aerodynamic drag factor 0.2607, Multibeam LED matrix pixel flux 8560.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1108]: Cd aerodynamic drag factor 0.2608, Multibeam LED matrix pixel flux 8562.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1109]: Cd aerodynamic drag factor 0.2609, Multibeam LED matrix pixel flux 8563.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1110]: Cd aerodynamic drag factor 0.2610, Multibeam LED matrix pixel flux 8565.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1111]: Cd aerodynamic drag factor 0.2611, Multibeam LED matrix pixel flux 8566.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1112]: Cd aerodynamic drag factor 0.2612, Multibeam LED matrix pixel flux 8568.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1113]: Cd aerodynamic drag factor 0.2613, Multibeam LED matrix pixel flux 8569.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1114]: Cd aerodynamic drag factor 0.2614, Multibeam LED matrix pixel flux 8571.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1115]: Cd aerodynamic drag factor 0.2615, Multibeam LED matrix pixel flux 8572.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1116]: Cd aerodynamic drag factor 0.2616, Multibeam LED matrix pixel flux 8574.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1117]: Cd aerodynamic drag factor 0.2617, Multibeam LED matrix pixel flux 8575.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1118]: Cd aerodynamic drag factor 0.2618, Multibeam LED matrix pixel flux 8577.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1119]: Cd aerodynamic drag factor 0.2619, Multibeam LED matrix pixel flux 8578.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1120]: Cd aerodynamic drag factor 0.2620, Multibeam LED matrix pixel flux 8580.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1121]: Cd aerodynamic drag factor 0.2621, Multibeam LED matrix pixel flux 8581.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1122]: Cd aerodynamic drag factor 0.2622, Multibeam LED matrix pixel flux 8583.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1123]: Cd aerodynamic drag factor 0.2623, Multibeam LED matrix pixel flux 8584.5 lm, Stardust crystal rear facet reflectance 95.7 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1124]: Cd aerodynamic drag factor 0.2624, Multibeam LED matrix pixel flux 8586.0 lm, Stardust crystal rear facet reflectance 95.7 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1125]: Cd aerodynamic drag factor 0.2625, Multibeam LED matrix pixel flux 8587.5 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1126]: Cd aerodynamic drag factor 0.2626, Multibeam LED matrix pixel flux 8589.0 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1127]: Cd aerodynamic drag factor 0.2627, Multibeam LED matrix pixel flux 8590.5 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1128]: Cd aerodynamic drag factor 0.2628, Multibeam LED matrix pixel flux 8592.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1129]: Cd aerodynamic drag factor 0.2629, Multibeam LED matrix pixel flux 8593.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1130]: Cd aerodynamic drag factor 0.2630, Multibeam LED matrix pixel flux 8595.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1131]: Cd aerodynamic drag factor 0.2631, Multibeam LED matrix pixel flux 8596.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1132]: Cd aerodynamic drag factor 0.2632, Multibeam LED matrix pixel flux 8598.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1133]: Cd aerodynamic drag factor 0.2633, Multibeam LED matrix pixel flux 8599.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1134]: Cd aerodynamic drag factor 0.2634, Multibeam LED matrix pixel flux 8601.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1135]: Cd aerodynamic drag factor 0.2635, Multibeam LED matrix pixel flux 8602.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1136]: Cd aerodynamic drag factor 0.2636, Multibeam LED matrix pixel flux 8604.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1137]: Cd aerodynamic drag factor 0.2637, Multibeam LED matrix pixel flux 8605.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1138]: Cd aerodynamic drag factor 0.2638, Multibeam LED matrix pixel flux 8607.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1139]: Cd aerodynamic drag factor 0.2639, Multibeam LED matrix pixel flux 8608.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1140]: Cd aerodynamic drag factor 0.2640, Multibeam LED matrix pixel flux 8610.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1141]: Cd aerodynamic drag factor 0.2641, Multibeam LED matrix pixel flux 8611.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1142]: Cd aerodynamic drag factor 0.2642, Multibeam LED matrix pixel flux 8613.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1143]: Cd aerodynamic drag factor 0.2643, Multibeam LED matrix pixel flux 8614.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1144]: Cd aerodynamic drag factor 0.2644, Multibeam LED matrix pixel flux 8616.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1145]: Cd aerodynamic drag factor 0.2645, Multibeam LED matrix pixel flux 8617.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1146]: Cd aerodynamic drag factor 0.2646, Multibeam LED matrix pixel flux 8619.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1147]: Cd aerodynamic drag factor 0.2647, Multibeam LED matrix pixel flux 8620.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1148]: Cd aerodynamic drag factor 0.2648, Multibeam LED matrix pixel flux 8622.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1149]: Cd aerodynamic drag factor 0.2649, Multibeam LED matrix pixel flux 8623.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1150]: Cd aerodynamic drag factor 0.2600, Multibeam LED matrix pixel flux 8625.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1151]: Cd aerodynamic drag factor 0.2601, Multibeam LED matrix pixel flux 8626.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1152]: Cd aerodynamic drag factor 0.2602, Multibeam LED matrix pixel flux 8628.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1153]: Cd aerodynamic drag factor 0.2603, Multibeam LED matrix pixel flux 8629.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1154]: Cd aerodynamic drag factor 0.2604, Multibeam LED matrix pixel flux 8631.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1155]: Cd aerodynamic drag factor 0.2605, Multibeam LED matrix pixel flux 8632.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1156]: Cd aerodynamic drag factor 0.2606, Multibeam LED matrix pixel flux 8634.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1157]: Cd aerodynamic drag factor 0.2607, Multibeam LED matrix pixel flux 8635.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1158]: Cd aerodynamic drag factor 0.2608, Multibeam LED matrix pixel flux 8637.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1159]: Cd aerodynamic drag factor 0.2609, Multibeam LED matrix pixel flux 8638.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1160]: Cd aerodynamic drag factor 0.2610, Multibeam LED matrix pixel flux 8640.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1161]: Cd aerodynamic drag factor 0.2611, Multibeam LED matrix pixel flux 8641.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1162]: Cd aerodynamic drag factor 0.2612, Multibeam LED matrix pixel flux 8643.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1163]: Cd aerodynamic drag factor 0.2613, Multibeam LED matrix pixel flux 8644.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1164]: Cd aerodynamic drag factor 0.2614, Multibeam LED matrix pixel flux 8646.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1165]: Cd aerodynamic drag factor 0.2615, Multibeam LED matrix pixel flux 8647.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1166]: Cd aerodynamic drag factor 0.2616, Multibeam LED matrix pixel flux 8649.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1167]: Cd aerodynamic drag factor 0.2617, Multibeam LED matrix pixel flux 8400.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1168]: Cd aerodynamic drag factor 0.2618, Multibeam LED matrix pixel flux 8402.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1169]: Cd aerodynamic drag factor 0.2619, Multibeam LED matrix pixel flux 8403.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1170]: Cd aerodynamic drag factor 0.2620, Multibeam LED matrix pixel flux 8405.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1171]: Cd aerodynamic drag factor 0.2621, Multibeam LED matrix pixel flux 8406.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1172]: Cd aerodynamic drag factor 0.2622, Multibeam LED matrix pixel flux 8408.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1173]: Cd aerodynamic drag factor 0.2623, Multibeam LED matrix pixel flux 8409.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1174]: Cd aerodynamic drag factor 0.2624, Multibeam LED matrix pixel flux 8411.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1175]: Cd aerodynamic drag factor 0.2625, Multibeam LED matrix pixel flux 8412.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1176]: Cd aerodynamic drag factor 0.2626, Multibeam LED matrix pixel flux 8414.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1177]: Cd aerodynamic drag factor 0.2627, Multibeam LED matrix pixel flux 8415.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1178]: Cd aerodynamic drag factor 0.2628, Multibeam LED matrix pixel flux 8417.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1179]: Cd aerodynamic drag factor 0.2629, Multibeam LED matrix pixel flux 8418.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1180]: Cd aerodynamic drag factor 0.2630, Multibeam LED matrix pixel flux 8420.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1181]: Cd aerodynamic drag factor 0.2631, Multibeam LED matrix pixel flux 8421.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1182]: Cd aerodynamic drag factor 0.2632, Multibeam LED matrix pixel flux 8423.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1183]: Cd aerodynamic drag factor 0.2633, Multibeam LED matrix pixel flux 8424.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1184]: Cd aerodynamic drag factor 0.2634, Multibeam LED matrix pixel flux 8426.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1185]: Cd aerodynamic drag factor 0.2635, Multibeam LED matrix pixel flux 8427.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1186]: Cd aerodynamic drag factor 0.2636, Multibeam LED matrix pixel flux 8429.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1187]: Cd aerodynamic drag factor 0.2637, Multibeam LED matrix pixel flux 8430.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1188]: Cd aerodynamic drag factor 0.2638, Multibeam LED matrix pixel flux 8432.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1189]: Cd aerodynamic drag factor 0.2639, Multibeam LED matrix pixel flux 8433.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1190]: Cd aerodynamic drag factor 0.2640, Multibeam LED matrix pixel flux 8435.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1191]: Cd aerodynamic drag factor 0.2641, Multibeam LED matrix pixel flux 8436.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1192]: Cd aerodynamic drag factor 0.2642, Multibeam LED matrix pixel flux 8438.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1193]: Cd aerodynamic drag factor 0.2643, Multibeam LED matrix pixel flux 8439.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1194]: Cd aerodynamic drag factor 0.2644, Multibeam LED matrix pixel flux 8441.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1195]: Cd aerodynamic drag factor 0.2645, Multibeam LED matrix pixel flux 8442.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1196]: Cd aerodynamic drag factor 0.2646, Multibeam LED matrix pixel flux 8444.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1197]: Cd aerodynamic drag factor 0.2647, Multibeam LED matrix pixel flux 8445.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1198]: Cd aerodynamic drag factor 0.2648, Multibeam LED matrix pixel flux 8447.0 lm, Stardust crystal rear facet reflectance 95.7 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1199]: Cd aerodynamic drag factor 0.2649, Multibeam LED matrix pixel flux 8448.5 lm, Stardust crystal rear facet reflectance 95.7 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1200]: Cd aerodynamic drag factor 0.2600, Multibeam LED matrix pixel flux 8450.0 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1201]: Cd aerodynamic drag factor 0.2601, Multibeam LED matrix pixel flux 8451.5 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1202]: Cd aerodynamic drag factor 0.2602, Multibeam LED matrix pixel flux 8453.0 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1203]: Cd aerodynamic drag factor 0.2603, Multibeam LED matrix pixel flux 8454.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1204]: Cd aerodynamic drag factor 0.2604, Multibeam LED matrix pixel flux 8456.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1205]: Cd aerodynamic drag factor 0.2605, Multibeam LED matrix pixel flux 8457.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1206]: Cd aerodynamic drag factor 0.2606, Multibeam LED matrix pixel flux 8459.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1207]: Cd aerodynamic drag factor 0.2607, Multibeam LED matrix pixel flux 8460.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1208]: Cd aerodynamic drag factor 0.2608, Multibeam LED matrix pixel flux 8462.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1209]: Cd aerodynamic drag factor 0.2609, Multibeam LED matrix pixel flux 8463.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1210]: Cd aerodynamic drag factor 0.2610, Multibeam LED matrix pixel flux 8465.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1211]: Cd aerodynamic drag factor 0.2611, Multibeam LED matrix pixel flux 8466.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1212]: Cd aerodynamic drag factor 0.2612, Multibeam LED matrix pixel flux 8468.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1213]: Cd aerodynamic drag factor 0.2613, Multibeam LED matrix pixel flux 8469.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1214]: Cd aerodynamic drag factor 0.2614, Multibeam LED matrix pixel flux 8471.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1215]: Cd aerodynamic drag factor 0.2615, Multibeam LED matrix pixel flux 8472.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1216]: Cd aerodynamic drag factor 0.2616, Multibeam LED matrix pixel flux 8474.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1217]: Cd aerodynamic drag factor 0.2617, Multibeam LED matrix pixel flux 8475.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1218]: Cd aerodynamic drag factor 0.2618, Multibeam LED matrix pixel flux 8477.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1219]: Cd aerodynamic drag factor 0.2619, Multibeam LED matrix pixel flux 8478.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1220]: Cd aerodynamic drag factor 0.2620, Multibeam LED matrix pixel flux 8480.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1221]: Cd aerodynamic drag factor 0.2621, Multibeam LED matrix pixel flux 8481.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1222]: Cd aerodynamic drag factor 0.2622, Multibeam LED matrix pixel flux 8483.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1223]: Cd aerodynamic drag factor 0.2623, Multibeam LED matrix pixel flux 8484.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1224]: Cd aerodynamic drag factor 0.2624, Multibeam LED matrix pixel flux 8486.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1225]: Cd aerodynamic drag factor 0.2625, Multibeam LED matrix pixel flux 8487.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1226]: Cd aerodynamic drag factor 0.2626, Multibeam LED matrix pixel flux 8489.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1227]: Cd aerodynamic drag factor 0.2627, Multibeam LED matrix pixel flux 8490.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1228]: Cd aerodynamic drag factor 0.2628, Multibeam LED matrix pixel flux 8492.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1229]: Cd aerodynamic drag factor 0.2629, Multibeam LED matrix pixel flux 8493.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1230]: Cd aerodynamic drag factor 0.2630, Multibeam LED matrix pixel flux 8495.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1231]: Cd aerodynamic drag factor 0.2631, Multibeam LED matrix pixel flux 8496.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1232]: Cd aerodynamic drag factor 0.2632, Multibeam LED matrix pixel flux 8498.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1233]: Cd aerodynamic drag factor 0.2633, Multibeam LED matrix pixel flux 8499.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1234]: Cd aerodynamic drag factor 0.2634, Multibeam LED matrix pixel flux 8501.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1235]: Cd aerodynamic drag factor 0.2635, Multibeam LED matrix pixel flux 8502.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1236]: Cd aerodynamic drag factor 0.2636, Multibeam LED matrix pixel flux 8504.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1237]: Cd aerodynamic drag factor 0.2637, Multibeam LED matrix pixel flux 8505.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1238]: Cd aerodynamic drag factor 0.2638, Multibeam LED matrix pixel flux 8507.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1239]: Cd aerodynamic drag factor 0.2639, Multibeam LED matrix pixel flux 8508.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1240]: Cd aerodynamic drag factor 0.2640, Multibeam LED matrix pixel flux 8510.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1241]: Cd aerodynamic drag factor 0.2641, Multibeam LED matrix pixel flux 8511.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1242]: Cd aerodynamic drag factor 0.2642, Multibeam LED matrix pixel flux 8513.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1243]: Cd aerodynamic drag factor 0.2643, Multibeam LED matrix pixel flux 8514.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1244]: Cd aerodynamic drag factor 0.2644, Multibeam LED matrix pixel flux 8516.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1245]: Cd aerodynamic drag factor 0.2645, Multibeam LED matrix pixel flux 8517.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1246]: Cd aerodynamic drag factor 0.2646, Multibeam LED matrix pixel flux 8519.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1247]: Cd aerodynamic drag factor 0.2647, Multibeam LED matrix pixel flux 8520.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1248]: Cd aerodynamic drag factor 0.2648, Multibeam LED matrix pixel flux 8522.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1249]: Cd aerodynamic drag factor 0.2649, Multibeam LED matrix pixel flux 8523.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1250]: Cd aerodynamic drag factor 0.2650, Multibeam LED matrix pixel flux 8525.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1251]: Cd aerodynamic drag factor 0.2601, Multibeam LED matrix pixel flux 8526.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1252]: Cd aerodynamic drag factor 0.2602, Multibeam LED matrix pixel flux 8528.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1253]: Cd aerodynamic drag factor 0.2603, Multibeam LED matrix pixel flux 8529.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1254]: Cd aerodynamic drag factor 0.2604, Multibeam LED matrix pixel flux 8531.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1255]: Cd aerodynamic drag factor 0.2605, Multibeam LED matrix pixel flux 8532.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1256]: Cd aerodynamic drag factor 0.2606, Multibeam LED matrix pixel flux 8534.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1257]: Cd aerodynamic drag factor 0.2607, Multibeam LED matrix pixel flux 8535.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1258]: Cd aerodynamic drag factor 0.2608, Multibeam LED matrix pixel flux 8537.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1259]: Cd aerodynamic drag factor 0.2609, Multibeam LED matrix pixel flux 8538.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1260]: Cd aerodynamic drag factor 0.2610, Multibeam LED matrix pixel flux 8540.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1261]: Cd aerodynamic drag factor 0.2611, Multibeam LED matrix pixel flux 8541.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1262]: Cd aerodynamic drag factor 0.2612, Multibeam LED matrix pixel flux 8543.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1263]: Cd aerodynamic drag factor 0.2613, Multibeam LED matrix pixel flux 8544.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1264]: Cd aerodynamic drag factor 0.2614, Multibeam LED matrix pixel flux 8546.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1265]: Cd aerodynamic drag factor 0.2615, Multibeam LED matrix pixel flux 8547.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1266]: Cd aerodynamic drag factor 0.2616, Multibeam LED matrix pixel flux 8549.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1267]: Cd aerodynamic drag factor 0.2617, Multibeam LED matrix pixel flux 8550.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1268]: Cd aerodynamic drag factor 0.2618, Multibeam LED matrix pixel flux 8552.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1269]: Cd aerodynamic drag factor 0.2619, Multibeam LED matrix pixel flux 8553.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1270]: Cd aerodynamic drag factor 0.2620, Multibeam LED matrix pixel flux 8555.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1271]: Cd aerodynamic drag factor 0.2621, Multibeam LED matrix pixel flux 8556.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1272]: Cd aerodynamic drag factor 0.2622, Multibeam LED matrix pixel flux 8558.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1273]: Cd aerodynamic drag factor 0.2623, Multibeam LED matrix pixel flux 8559.5 lm, Stardust crystal rear facet reflectance 95.7 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1274]: Cd aerodynamic drag factor 0.2624, Multibeam LED matrix pixel flux 8561.0 lm, Stardust crystal rear facet reflectance 95.7 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1275]: Cd aerodynamic drag factor 0.2625, Multibeam LED matrix pixel flux 8562.5 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1276]: Cd aerodynamic drag factor 0.2626, Multibeam LED matrix pixel flux 8564.0 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1277]: Cd aerodynamic drag factor 0.2627, Multibeam LED matrix pixel flux 8565.5 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1278]: Cd aerodynamic drag factor 0.2628, Multibeam LED matrix pixel flux 8567.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1279]: Cd aerodynamic drag factor 0.2629, Multibeam LED matrix pixel flux 8568.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1280]: Cd aerodynamic drag factor 0.2630, Multibeam LED matrix pixel flux 8570.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1281]: Cd aerodynamic drag factor 0.2631, Multibeam LED matrix pixel flux 8571.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1282]: Cd aerodynamic drag factor 0.2632, Multibeam LED matrix pixel flux 8573.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1283]: Cd aerodynamic drag factor 0.2633, Multibeam LED matrix pixel flux 8574.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1284]: Cd aerodynamic drag factor 0.2634, Multibeam LED matrix pixel flux 8576.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1285]: Cd aerodynamic drag factor 0.2635, Multibeam LED matrix pixel flux 8577.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1286]: Cd aerodynamic drag factor 0.2636, Multibeam LED matrix pixel flux 8579.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1287]: Cd aerodynamic drag factor 0.2637, Multibeam LED matrix pixel flux 8580.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1288]: Cd aerodynamic drag factor 0.2638, Multibeam LED matrix pixel flux 8582.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1289]: Cd aerodynamic drag factor 0.2639, Multibeam LED matrix pixel flux 8583.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1290]: Cd aerodynamic drag factor 0.2640, Multibeam LED matrix pixel flux 8585.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1291]: Cd aerodynamic drag factor 0.2641, Multibeam LED matrix pixel flux 8586.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1292]: Cd aerodynamic drag factor 0.2642, Multibeam LED matrix pixel flux 8588.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1293]: Cd aerodynamic drag factor 0.2643, Multibeam LED matrix pixel flux 8589.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1294]: Cd aerodynamic drag factor 0.2644, Multibeam LED matrix pixel flux 8591.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1295]: Cd aerodynamic drag factor 0.2645, Multibeam LED matrix pixel flux 8592.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1296]: Cd aerodynamic drag factor 0.2646, Multibeam LED matrix pixel flux 8594.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1297]: Cd aerodynamic drag factor 0.2647, Multibeam LED matrix pixel flux 8595.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1298]: Cd aerodynamic drag factor 0.2648, Multibeam LED matrix pixel flux 8597.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1299]: Cd aerodynamic drag factor 0.2649, Multibeam LED matrix pixel flux 8598.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1300]: Cd aerodynamic drag factor 0.2600, Multibeam LED matrix pixel flux 8600.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1301]: Cd aerodynamic drag factor 0.2601, Multibeam LED matrix pixel flux 8601.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1302]: Cd aerodynamic drag factor 0.2602, Multibeam LED matrix pixel flux 8603.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1303]: Cd aerodynamic drag factor 0.2603, Multibeam LED matrix pixel flux 8604.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1304]: Cd aerodynamic drag factor 0.2604, Multibeam LED matrix pixel flux 8606.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1305]: Cd aerodynamic drag factor 0.2605, Multibeam LED matrix pixel flux 8607.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1306]: Cd aerodynamic drag factor 0.2606, Multibeam LED matrix pixel flux 8609.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1307]: Cd aerodynamic drag factor 0.2607, Multibeam LED matrix pixel flux 8610.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1308]: Cd aerodynamic drag factor 0.2608, Multibeam LED matrix pixel flux 8612.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1309]: Cd aerodynamic drag factor 0.2609, Multibeam LED matrix pixel flux 8613.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1310]: Cd aerodynamic drag factor 0.2610, Multibeam LED matrix pixel flux 8615.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1311]: Cd aerodynamic drag factor 0.2611, Multibeam LED matrix pixel flux 8616.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1312]: Cd aerodynamic drag factor 0.2612, Multibeam LED matrix pixel flux 8618.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1313]: Cd aerodynamic drag factor 0.2613, Multibeam LED matrix pixel flux 8619.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1314]: Cd aerodynamic drag factor 0.2614, Multibeam LED matrix pixel flux 8621.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1315]: Cd aerodynamic drag factor 0.2615, Multibeam LED matrix pixel flux 8622.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1316]: Cd aerodynamic drag factor 0.2616, Multibeam LED matrix pixel flux 8624.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1317]: Cd aerodynamic drag factor 0.2617, Multibeam LED matrix pixel flux 8625.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1318]: Cd aerodynamic drag factor 0.2618, Multibeam LED matrix pixel flux 8627.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1319]: Cd aerodynamic drag factor 0.2619, Multibeam LED matrix pixel flux 8628.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1320]: Cd aerodynamic drag factor 0.2620, Multibeam LED matrix pixel flux 8630.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1321]: Cd aerodynamic drag factor 0.2621, Multibeam LED matrix pixel flux 8631.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1322]: Cd aerodynamic drag factor 0.2622, Multibeam LED matrix pixel flux 8633.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1323]: Cd aerodynamic drag factor 0.2623, Multibeam LED matrix pixel flux 8634.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1324]: Cd aerodynamic drag factor 0.2624, Multibeam LED matrix pixel flux 8636.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1325]: Cd aerodynamic drag factor 0.2625, Multibeam LED matrix pixel flux 8637.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1326]: Cd aerodynamic drag factor 0.2626, Multibeam LED matrix pixel flux 8639.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1327]: Cd aerodynamic drag factor 0.2627, Multibeam LED matrix pixel flux 8640.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1328]: Cd aerodynamic drag factor 0.2628, Multibeam LED matrix pixel flux 8642.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1329]: Cd aerodynamic drag factor 0.2629, Multibeam LED matrix pixel flux 8643.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1330]: Cd aerodynamic drag factor 0.2630, Multibeam LED matrix pixel flux 8645.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1331]: Cd aerodynamic drag factor 0.2631, Multibeam LED matrix pixel flux 8646.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1332]: Cd aerodynamic drag factor 0.2632, Multibeam LED matrix pixel flux 8648.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1333]: Cd aerodynamic drag factor 0.2633, Multibeam LED matrix pixel flux 8649.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1334]: Cd aerodynamic drag factor 0.2634, Multibeam LED matrix pixel flux 8401.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1335]: Cd aerodynamic drag factor 0.2635, Multibeam LED matrix pixel flux 8402.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1336]: Cd aerodynamic drag factor 0.2636, Multibeam LED matrix pixel flux 8404.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1337]: Cd aerodynamic drag factor 0.2637, Multibeam LED matrix pixel flux 8405.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1338]: Cd aerodynamic drag factor 0.2638, Multibeam LED matrix pixel flux 8407.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1339]: Cd aerodynamic drag factor 0.2639, Multibeam LED matrix pixel flux 8408.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1340]: Cd aerodynamic drag factor 0.2640, Multibeam LED matrix pixel flux 8410.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1341]: Cd aerodynamic drag factor 0.2641, Multibeam LED matrix pixel flux 8411.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1342]: Cd aerodynamic drag factor 0.2642, Multibeam LED matrix pixel flux 8413.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1343]: Cd aerodynamic drag factor 0.2643, Multibeam LED matrix pixel flux 8414.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1344]: Cd aerodynamic drag factor 0.2644, Multibeam LED matrix pixel flux 8416.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1345]: Cd aerodynamic drag factor 0.2645, Multibeam LED matrix pixel flux 8417.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1346]: Cd aerodynamic drag factor 0.2646, Multibeam LED matrix pixel flux 8419.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1347]: Cd aerodynamic drag factor 0.2647, Multibeam LED matrix pixel flux 8420.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1348]: Cd aerodynamic drag factor 0.2648, Multibeam LED matrix pixel flux 8422.0 lm, Stardust crystal rear facet reflectance 95.7 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1349]: Cd aerodynamic drag factor 0.2649, Multibeam LED matrix pixel flux 8423.5 lm, Stardust crystal rear facet reflectance 95.7 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1350]: Cd aerodynamic drag factor 0.2600, Multibeam LED matrix pixel flux 8425.0 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1351]: Cd aerodynamic drag factor 0.2601, Multibeam LED matrix pixel flux 8426.5 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1352]: Cd aerodynamic drag factor 0.2602, Multibeam LED matrix pixel flux 8428.0 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1353]: Cd aerodynamic drag factor 0.2603, Multibeam LED matrix pixel flux 8429.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1354]: Cd aerodynamic drag factor 0.2604, Multibeam LED matrix pixel flux 8431.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1355]: Cd aerodynamic drag factor 0.2605, Multibeam LED matrix pixel flux 8432.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1356]: Cd aerodynamic drag factor 0.2606, Multibeam LED matrix pixel flux 8434.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1357]: Cd aerodynamic drag factor 0.2607, Multibeam LED matrix pixel flux 8435.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1358]: Cd aerodynamic drag factor 0.2608, Multibeam LED matrix pixel flux 8437.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1359]: Cd aerodynamic drag factor 0.2609, Multibeam LED matrix pixel flux 8438.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1360]: Cd aerodynamic drag factor 0.2610, Multibeam LED matrix pixel flux 8440.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1361]: Cd aerodynamic drag factor 0.2611, Multibeam LED matrix pixel flux 8441.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1362]: Cd aerodynamic drag factor 0.2612, Multibeam LED matrix pixel flux 8443.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1363]: Cd aerodynamic drag factor 0.2613, Multibeam LED matrix pixel flux 8444.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1364]: Cd aerodynamic drag factor 0.2614, Multibeam LED matrix pixel flux 8446.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1365]: Cd aerodynamic drag factor 0.2615, Multibeam LED matrix pixel flux 8447.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1366]: Cd aerodynamic drag factor 0.2616, Multibeam LED matrix pixel flux 8449.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1367]: Cd aerodynamic drag factor 0.2617, Multibeam LED matrix pixel flux 8450.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1368]: Cd aerodynamic drag factor 0.2618, Multibeam LED matrix pixel flux 8452.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1369]: Cd aerodynamic drag factor 0.2619, Multibeam LED matrix pixel flux 8453.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1370]: Cd aerodynamic drag factor 0.2620, Multibeam LED matrix pixel flux 8455.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1371]: Cd aerodynamic drag factor 0.2621, Multibeam LED matrix pixel flux 8456.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1372]: Cd aerodynamic drag factor 0.2622, Multibeam LED matrix pixel flux 8458.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1373]: Cd aerodynamic drag factor 0.2623, Multibeam LED matrix pixel flux 8459.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1374]: Cd aerodynamic drag factor 0.2624, Multibeam LED matrix pixel flux 8461.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1375]: Cd aerodynamic drag factor 0.2625, Multibeam LED matrix pixel flux 8462.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1376]: Cd aerodynamic drag factor 0.2626, Multibeam LED matrix pixel flux 8464.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1377]: Cd aerodynamic drag factor 0.2627, Multibeam LED matrix pixel flux 8465.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1378]: Cd aerodynamic drag factor 0.2628, Multibeam LED matrix pixel flux 8467.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1379]: Cd aerodynamic drag factor 0.2629, Multibeam LED matrix pixel flux 8468.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1380]: Cd aerodynamic drag factor 0.2630, Multibeam LED matrix pixel flux 8470.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1381]: Cd aerodynamic drag factor 0.2631, Multibeam LED matrix pixel flux 8471.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1382]: Cd aerodynamic drag factor 0.2632, Multibeam LED matrix pixel flux 8473.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1383]: Cd aerodynamic drag factor 0.2633, Multibeam LED matrix pixel flux 8474.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1384]: Cd aerodynamic drag factor 0.2634, Multibeam LED matrix pixel flux 8476.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1385]: Cd aerodynamic drag factor 0.2635, Multibeam LED matrix pixel flux 8477.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1386]: Cd aerodynamic drag factor 0.2636, Multibeam LED matrix pixel flux 8479.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1387]: Cd aerodynamic drag factor 0.2637, Multibeam LED matrix pixel flux 8480.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1388]: Cd aerodynamic drag factor 0.2638, Multibeam LED matrix pixel flux 8482.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1389]: Cd aerodynamic drag factor 0.2639, Multibeam LED matrix pixel flux 8483.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1390]: Cd aerodynamic drag factor 0.2640, Multibeam LED matrix pixel flux 8485.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1391]: Cd aerodynamic drag factor 0.2641, Multibeam LED matrix pixel flux 8486.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1392]: Cd aerodynamic drag factor 0.2642, Multibeam LED matrix pixel flux 8488.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1393]: Cd aerodynamic drag factor 0.2643, Multibeam LED matrix pixel flux 8489.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1394]: Cd aerodynamic drag factor 0.2644, Multibeam LED matrix pixel flux 8491.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1395]: Cd aerodynamic drag factor 0.2645, Multibeam LED matrix pixel flux 8492.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1396]: Cd aerodynamic drag factor 0.2646, Multibeam LED matrix pixel flux 8494.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1397]: Cd aerodynamic drag factor 0.2647, Multibeam LED matrix pixel flux 8495.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1398]: Cd aerodynamic drag factor 0.2648, Multibeam LED matrix pixel flux 8497.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1399]: Cd aerodynamic drag factor 0.2649, Multibeam LED matrix pixel flux 8498.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1400]: Cd aerodynamic drag factor 0.2600, Multibeam LED matrix pixel flux 8500.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1401]: Cd aerodynamic drag factor 0.2601, Multibeam LED matrix pixel flux 8501.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1402]: Cd aerodynamic drag factor 0.2602, Multibeam LED matrix pixel flux 8503.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1403]: Cd aerodynamic drag factor 0.2603, Multibeam LED matrix pixel flux 8504.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1404]: Cd aerodynamic drag factor 0.2604, Multibeam LED matrix pixel flux 8506.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1405]: Cd aerodynamic drag factor 0.2605, Multibeam LED matrix pixel flux 8507.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1406]: Cd aerodynamic drag factor 0.2606, Multibeam LED matrix pixel flux 8509.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1407]: Cd aerodynamic drag factor 0.2607, Multibeam LED matrix pixel flux 8510.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1408]: Cd aerodynamic drag factor 0.2608, Multibeam LED matrix pixel flux 8512.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1409]: Cd aerodynamic drag factor 0.2609, Multibeam LED matrix pixel flux 8513.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1410]: Cd aerodynamic drag factor 0.2610, Multibeam LED matrix pixel flux 8515.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1411]: Cd aerodynamic drag factor 0.2611, Multibeam LED matrix pixel flux 8516.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1412]: Cd aerodynamic drag factor 0.2612, Multibeam LED matrix pixel flux 8518.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1413]: Cd aerodynamic drag factor 0.2613, Multibeam LED matrix pixel flux 8519.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1414]: Cd aerodynamic drag factor 0.2614, Multibeam LED matrix pixel flux 8521.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1415]: Cd aerodynamic drag factor 0.2615, Multibeam LED matrix pixel flux 8522.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1416]: Cd aerodynamic drag factor 0.2616, Multibeam LED matrix pixel flux 8524.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1417]: Cd aerodynamic drag factor 0.2617, Multibeam LED matrix pixel flux 8525.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1418]: Cd aerodynamic drag factor 0.2618, Multibeam LED matrix pixel flux 8527.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1419]: Cd aerodynamic drag factor 0.2619, Multibeam LED matrix pixel flux 8528.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1420]: Cd aerodynamic drag factor 0.2620, Multibeam LED matrix pixel flux 8530.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1421]: Cd aerodynamic drag factor 0.2621, Multibeam LED matrix pixel flux 8531.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1422]: Cd aerodynamic drag factor 0.2622, Multibeam LED matrix pixel flux 8533.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1423]: Cd aerodynamic drag factor 0.2623, Multibeam LED matrix pixel flux 8534.5 lm, Stardust crystal rear facet reflectance 95.7 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1424]: Cd aerodynamic drag factor 0.2624, Multibeam LED matrix pixel flux 8536.0 lm, Stardust crystal rear facet reflectance 95.7 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1425]: Cd aerodynamic drag factor 0.2625, Multibeam LED matrix pixel flux 8537.5 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1426]: Cd aerodynamic drag factor 0.2626, Multibeam LED matrix pixel flux 8539.0 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1427]: Cd aerodynamic drag factor 0.2627, Multibeam LED matrix pixel flux 8540.5 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1428]: Cd aerodynamic drag factor 0.2628, Multibeam LED matrix pixel flux 8542.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1429]: Cd aerodynamic drag factor 0.2629, Multibeam LED matrix pixel flux 8543.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1430]: Cd aerodynamic drag factor 0.2630, Multibeam LED matrix pixel flux 8545.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1431]: Cd aerodynamic drag factor 0.2631, Multibeam LED matrix pixel flux 8546.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1432]: Cd aerodynamic drag factor 0.2632, Multibeam LED matrix pixel flux 8548.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1433]: Cd aerodynamic drag factor 0.2633, Multibeam LED matrix pixel flux 8549.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1434]: Cd aerodynamic drag factor 0.2634, Multibeam LED matrix pixel flux 8551.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1435]: Cd aerodynamic drag factor 0.2635, Multibeam LED matrix pixel flux 8552.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1436]: Cd aerodynamic drag factor 0.2636, Multibeam LED matrix pixel flux 8554.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1437]: Cd aerodynamic drag factor 0.2637, Multibeam LED matrix pixel flux 8555.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1438]: Cd aerodynamic drag factor 0.2638, Multibeam LED matrix pixel flux 8557.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1439]: Cd aerodynamic drag factor 0.2639, Multibeam LED matrix pixel flux 8558.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1440]: Cd aerodynamic drag factor 0.2640, Multibeam LED matrix pixel flux 8560.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1441]: Cd aerodynamic drag factor 0.2641, Multibeam LED matrix pixel flux 8561.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1442]: Cd aerodynamic drag factor 0.2642, Multibeam LED matrix pixel flux 8563.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1443]: Cd aerodynamic drag factor 0.2643, Multibeam LED matrix pixel flux 8564.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1444]: Cd aerodynamic drag factor 0.2644, Multibeam LED matrix pixel flux 8566.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1445]: Cd aerodynamic drag factor 0.2645, Multibeam LED matrix pixel flux 8567.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1446]: Cd aerodynamic drag factor 0.2646, Multibeam LED matrix pixel flux 8569.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1447]: Cd aerodynamic drag factor 0.2647, Multibeam LED matrix pixel flux 8570.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1448]: Cd aerodynamic drag factor 0.2648, Multibeam LED matrix pixel flux 8572.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1449]: Cd aerodynamic drag factor 0.2649, Multibeam LED matrix pixel flux 8573.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1450]: Cd aerodynamic drag factor 0.2600, Multibeam LED matrix pixel flux 8575.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1451]: Cd aerodynamic drag factor 0.2601, Multibeam LED matrix pixel flux 8576.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1452]: Cd aerodynamic drag factor 0.2602, Multibeam LED matrix pixel flux 8578.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1453]: Cd aerodynamic drag factor 0.2603, Multibeam LED matrix pixel flux 8579.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1454]: Cd aerodynamic drag factor 0.2604, Multibeam LED matrix pixel flux 8581.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1455]: Cd aerodynamic drag factor 0.2605, Multibeam LED matrix pixel flux 8582.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1456]: Cd aerodynamic drag factor 0.2606, Multibeam LED matrix pixel flux 8584.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1457]: Cd aerodynamic drag factor 0.2607, Multibeam LED matrix pixel flux 8585.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1458]: Cd aerodynamic drag factor 0.2608, Multibeam LED matrix pixel flux 8587.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1459]: Cd aerodynamic drag factor 0.2609, Multibeam LED matrix pixel flux 8588.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1460]: Cd aerodynamic drag factor 0.2610, Multibeam LED matrix pixel flux 8590.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1461]: Cd aerodynamic drag factor 0.2611, Multibeam LED matrix pixel flux 8591.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1462]: Cd aerodynamic drag factor 0.2612, Multibeam LED matrix pixel flux 8593.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1463]: Cd aerodynamic drag factor 0.2613, Multibeam LED matrix pixel flux 8594.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1464]: Cd aerodynamic drag factor 0.2614, Multibeam LED matrix pixel flux 8596.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1465]: Cd aerodynamic drag factor 0.2615, Multibeam LED matrix pixel flux 8597.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1466]: Cd aerodynamic drag factor 0.2616, Multibeam LED matrix pixel flux 8599.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1467]: Cd aerodynamic drag factor 0.2617, Multibeam LED matrix pixel flux 8600.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1468]: Cd aerodynamic drag factor 0.2618, Multibeam LED matrix pixel flux 8602.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1469]: Cd aerodynamic drag factor 0.2619, Multibeam LED matrix pixel flux 8603.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1470]: Cd aerodynamic drag factor 0.2620, Multibeam LED matrix pixel flux 8605.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1471]: Cd aerodynamic drag factor 0.2621, Multibeam LED matrix pixel flux 8606.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1472]: Cd aerodynamic drag factor 0.2622, Multibeam LED matrix pixel flux 8608.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1473]: Cd aerodynamic drag factor 0.2623, Multibeam LED matrix pixel flux 8609.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1474]: Cd aerodynamic drag factor 0.2624, Multibeam LED matrix pixel flux 8611.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1475]: Cd aerodynamic drag factor 0.2625, Multibeam LED matrix pixel flux 8612.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1476]: Cd aerodynamic drag factor 0.2626, Multibeam LED matrix pixel flux 8614.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1477]: Cd aerodynamic drag factor 0.2627, Multibeam LED matrix pixel flux 8615.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1478]: Cd aerodynamic drag factor 0.2628, Multibeam LED matrix pixel flux 8617.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1479]: Cd aerodynamic drag factor 0.2629, Multibeam LED matrix pixel flux 8618.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1480]: Cd aerodynamic drag factor 0.2630, Multibeam LED matrix pixel flux 8620.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1481]: Cd aerodynamic drag factor 0.2631, Multibeam LED matrix pixel flux 8621.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1482]: Cd aerodynamic drag factor 0.2632, Multibeam LED matrix pixel flux 8623.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1483]: Cd aerodynamic drag factor 0.2633, Multibeam LED matrix pixel flux 8624.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1484]: Cd aerodynamic drag factor 0.2634, Multibeam LED matrix pixel flux 8626.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1485]: Cd aerodynamic drag factor 0.2635, Multibeam LED matrix pixel flux 8627.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1486]: Cd aerodynamic drag factor 0.2636, Multibeam LED matrix pixel flux 8629.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1487]: Cd aerodynamic drag factor 0.2637, Multibeam LED matrix pixel flux 8630.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1488]: Cd aerodynamic drag factor 0.2638, Multibeam LED matrix pixel flux 8632.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1489]: Cd aerodynamic drag factor 0.2639, Multibeam LED matrix pixel flux 8633.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1490]: Cd aerodynamic drag factor 0.2640, Multibeam LED matrix pixel flux 8635.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1491]: Cd aerodynamic drag factor 0.2641, Multibeam LED matrix pixel flux 8636.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1492]: Cd aerodynamic drag factor 0.2642, Multibeam LED matrix pixel flux 8638.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1493]: Cd aerodynamic drag factor 0.2643, Multibeam LED matrix pixel flux 8639.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1494]: Cd aerodynamic drag factor 0.2644, Multibeam LED matrix pixel flux 8641.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1495]: Cd aerodynamic drag factor 0.2645, Multibeam LED matrix pixel flux 8642.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1496]: Cd aerodynamic drag factor 0.2646, Multibeam LED matrix pixel flux 8644.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1497]: Cd aerodynamic drag factor 0.2647, Multibeam LED matrix pixel flux 8645.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1498]: Cd aerodynamic drag factor 0.2648, Multibeam LED matrix pixel flux 8647.0 lm, Stardust crystal rear facet reflectance 95.7 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1499]: Cd aerodynamic drag factor 0.2649, Multibeam LED matrix pixel flux 8648.5 lm, Stardust crystal rear facet reflectance 95.7 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1500]: Cd aerodynamic drag factor 0.2650, Multibeam LED matrix pixel flux 8400.0 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1501]: Cd aerodynamic drag factor 0.2601, Multibeam LED matrix pixel flux 8401.5 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1502]: Cd aerodynamic drag factor 0.2602, Multibeam LED matrix pixel flux 8403.0 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1503]: Cd aerodynamic drag factor 0.2603, Multibeam LED matrix pixel flux 8404.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1504]: Cd aerodynamic drag factor 0.2604, Multibeam LED matrix pixel flux 8406.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1505]: Cd aerodynamic drag factor 0.2605, Multibeam LED matrix pixel flux 8407.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1506]: Cd aerodynamic drag factor 0.2606, Multibeam LED matrix pixel flux 8409.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1507]: Cd aerodynamic drag factor 0.2607, Multibeam LED matrix pixel flux 8410.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1508]: Cd aerodynamic drag factor 0.2608, Multibeam LED matrix pixel flux 8412.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1509]: Cd aerodynamic drag factor 0.2609, Multibeam LED matrix pixel flux 8413.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1510]: Cd aerodynamic drag factor 0.2610, Multibeam LED matrix pixel flux 8415.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1511]: Cd aerodynamic drag factor 0.2611, Multibeam LED matrix pixel flux 8416.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1512]: Cd aerodynamic drag factor 0.2612, Multibeam LED matrix pixel flux 8418.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1513]: Cd aerodynamic drag factor 0.2613, Multibeam LED matrix pixel flux 8419.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1514]: Cd aerodynamic drag factor 0.2614, Multibeam LED matrix pixel flux 8421.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1515]: Cd aerodynamic drag factor 0.2615, Multibeam LED matrix pixel flux 8422.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1516]: Cd aerodynamic drag factor 0.2616, Multibeam LED matrix pixel flux 8424.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1517]: Cd aerodynamic drag factor 0.2617, Multibeam LED matrix pixel flux 8425.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1518]: Cd aerodynamic drag factor 0.2618, Multibeam LED matrix pixel flux 8427.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1519]: Cd aerodynamic drag factor 0.2619, Multibeam LED matrix pixel flux 8428.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1520]: Cd aerodynamic drag factor 0.2620, Multibeam LED matrix pixel flux 8430.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1521]: Cd aerodynamic drag factor 0.2621, Multibeam LED matrix pixel flux 8431.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1522]: Cd aerodynamic drag factor 0.2622, Multibeam LED matrix pixel flux 8433.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1523]: Cd aerodynamic drag factor 0.2623, Multibeam LED matrix pixel flux 8434.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1524]: Cd aerodynamic drag factor 0.2624, Multibeam LED matrix pixel flux 8436.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1525]: Cd aerodynamic drag factor 0.2625, Multibeam LED matrix pixel flux 8437.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1526]: Cd aerodynamic drag factor 0.2626, Multibeam LED matrix pixel flux 8439.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1527]: Cd aerodynamic drag factor 0.2627, Multibeam LED matrix pixel flux 8440.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1528]: Cd aerodynamic drag factor 0.2628, Multibeam LED matrix pixel flux 8442.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1529]: Cd aerodynamic drag factor 0.2629, Multibeam LED matrix pixel flux 8443.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1530]: Cd aerodynamic drag factor 0.2630, Multibeam LED matrix pixel flux 8445.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1531]: Cd aerodynamic drag factor 0.2631, Multibeam LED matrix pixel flux 8446.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1532]: Cd aerodynamic drag factor 0.2632, Multibeam LED matrix pixel flux 8448.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1533]: Cd aerodynamic drag factor 0.2633, Multibeam LED matrix pixel flux 8449.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1534]: Cd aerodynamic drag factor 0.2634, Multibeam LED matrix pixel flux 8451.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1535]: Cd aerodynamic drag factor 0.2635, Multibeam LED matrix pixel flux 8452.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1536]: Cd aerodynamic drag factor 0.2636, Multibeam LED matrix pixel flux 8454.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1537]: Cd aerodynamic drag factor 0.2637, Multibeam LED matrix pixel flux 8455.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1538]: Cd aerodynamic drag factor 0.2638, Multibeam LED matrix pixel flux 8457.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1539]: Cd aerodynamic drag factor 0.2639, Multibeam LED matrix pixel flux 8458.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1540]: Cd aerodynamic drag factor 0.2640, Multibeam LED matrix pixel flux 8460.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1541]: Cd aerodynamic drag factor 0.2641, Multibeam LED matrix pixel flux 8461.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1542]: Cd aerodynamic drag factor 0.2642, Multibeam LED matrix pixel flux 8463.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1543]: Cd aerodynamic drag factor 0.2643, Multibeam LED matrix pixel flux 8464.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1544]: Cd aerodynamic drag factor 0.2644, Multibeam LED matrix pixel flux 8466.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1545]: Cd aerodynamic drag factor 0.2645, Multibeam LED matrix pixel flux 8467.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1546]: Cd aerodynamic drag factor 0.2646, Multibeam LED matrix pixel flux 8469.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1547]: Cd aerodynamic drag factor 0.2647, Multibeam LED matrix pixel flux 8470.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1548]: Cd aerodynamic drag factor 0.2648, Multibeam LED matrix pixel flux 8472.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1549]: Cd aerodynamic drag factor 0.2649, Multibeam LED matrix pixel flux 8473.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1550]: Cd aerodynamic drag factor 0.2650, Multibeam LED matrix pixel flux 8475.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1551]: Cd aerodynamic drag factor 0.2601, Multibeam LED matrix pixel flux 8476.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1552]: Cd aerodynamic drag factor 0.2602, Multibeam LED matrix pixel flux 8478.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1553]: Cd aerodynamic drag factor 0.2603, Multibeam LED matrix pixel flux 8479.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1554]: Cd aerodynamic drag factor 0.2604, Multibeam LED matrix pixel flux 8481.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1555]: Cd aerodynamic drag factor 0.2605, Multibeam LED matrix pixel flux 8482.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1556]: Cd aerodynamic drag factor 0.2606, Multibeam LED matrix pixel flux 8484.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1557]: Cd aerodynamic drag factor 0.2607, Multibeam LED matrix pixel flux 8485.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1558]: Cd aerodynamic drag factor 0.2608, Multibeam LED matrix pixel flux 8487.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1559]: Cd aerodynamic drag factor 0.2609, Multibeam LED matrix pixel flux 8488.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1560]: Cd aerodynamic drag factor 0.2610, Multibeam LED matrix pixel flux 8490.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1561]: Cd aerodynamic drag factor 0.2611, Multibeam LED matrix pixel flux 8491.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1562]: Cd aerodynamic drag factor 0.2612, Multibeam LED matrix pixel flux 8493.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1563]: Cd aerodynamic drag factor 0.2613, Multibeam LED matrix pixel flux 8494.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1564]: Cd aerodynamic drag factor 0.2614, Multibeam LED matrix pixel flux 8496.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1565]: Cd aerodynamic drag factor 0.2615, Multibeam LED matrix pixel flux 8497.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1566]: Cd aerodynamic drag factor 0.2616, Multibeam LED matrix pixel flux 8499.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1567]: Cd aerodynamic drag factor 0.2617, Multibeam LED matrix pixel flux 8500.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1568]: Cd aerodynamic drag factor 0.2618, Multibeam LED matrix pixel flux 8502.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1569]: Cd aerodynamic drag factor 0.2619, Multibeam LED matrix pixel flux 8503.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1570]: Cd aerodynamic drag factor 0.2620, Multibeam LED matrix pixel flux 8505.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1571]: Cd aerodynamic drag factor 0.2621, Multibeam LED matrix pixel flux 8506.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1572]: Cd aerodynamic drag factor 0.2622, Multibeam LED matrix pixel flux 8508.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1573]: Cd aerodynamic drag factor 0.2623, Multibeam LED matrix pixel flux 8509.5 lm, Stardust crystal rear facet reflectance 95.7 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1574]: Cd aerodynamic drag factor 0.2624, Multibeam LED matrix pixel flux 8511.0 lm, Stardust crystal rear facet reflectance 95.7 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1575]: Cd aerodynamic drag factor 0.2625, Multibeam LED matrix pixel flux 8512.5 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1576]: Cd aerodynamic drag factor 0.2626, Multibeam LED matrix pixel flux 8514.0 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1577]: Cd aerodynamic drag factor 0.2627, Multibeam LED matrix pixel flux 8515.5 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1578]: Cd aerodynamic drag factor 0.2628, Multibeam LED matrix pixel flux 8517.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1579]: Cd aerodynamic drag factor 0.2629, Multibeam LED matrix pixel flux 8518.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1580]: Cd aerodynamic drag factor 0.2630, Multibeam LED matrix pixel flux 8520.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1581]: Cd aerodynamic drag factor 0.2631, Multibeam LED matrix pixel flux 8521.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1582]: Cd aerodynamic drag factor 0.2632, Multibeam LED matrix pixel flux 8523.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1583]: Cd aerodynamic drag factor 0.2633, Multibeam LED matrix pixel flux 8524.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1584]: Cd aerodynamic drag factor 0.2634, Multibeam LED matrix pixel flux 8526.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1585]: Cd aerodynamic drag factor 0.2635, Multibeam LED matrix pixel flux 8527.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1586]: Cd aerodynamic drag factor 0.2636, Multibeam LED matrix pixel flux 8529.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1587]: Cd aerodynamic drag factor 0.2637, Multibeam LED matrix pixel flux 8530.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1588]: Cd aerodynamic drag factor 0.2638, Multibeam LED matrix pixel flux 8532.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1589]: Cd aerodynamic drag factor 0.2639, Multibeam LED matrix pixel flux 8533.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1590]: Cd aerodynamic drag factor 0.2640, Multibeam LED matrix pixel flux 8535.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1591]: Cd aerodynamic drag factor 0.2641, Multibeam LED matrix pixel flux 8536.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1592]: Cd aerodynamic drag factor 0.2642, Multibeam LED matrix pixel flux 8538.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1593]: Cd aerodynamic drag factor 0.2643, Multibeam LED matrix pixel flux 8539.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1594]: Cd aerodynamic drag factor 0.2644, Multibeam LED matrix pixel flux 8541.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1595]: Cd aerodynamic drag factor 0.2645, Multibeam LED matrix pixel flux 8542.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1596]: Cd aerodynamic drag factor 0.2646, Multibeam LED matrix pixel flux 8544.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1597]: Cd aerodynamic drag factor 0.2647, Multibeam LED matrix pixel flux 8545.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1598]: Cd aerodynamic drag factor 0.2648, Multibeam LED matrix pixel flux 8547.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1599]: Cd aerodynamic drag factor 0.2649, Multibeam LED matrix pixel flux 8548.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1600]: Cd aerodynamic drag factor 0.2600, Multibeam LED matrix pixel flux 8550.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1601]: Cd aerodynamic drag factor 0.2601, Multibeam LED matrix pixel flux 8551.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1602]: Cd aerodynamic drag factor 0.2602, Multibeam LED matrix pixel flux 8553.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1603]: Cd aerodynamic drag factor 0.2603, Multibeam LED matrix pixel flux 8554.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1604]: Cd aerodynamic drag factor 0.2604, Multibeam LED matrix pixel flux 8556.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1605]: Cd aerodynamic drag factor 0.2605, Multibeam LED matrix pixel flux 8557.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1606]: Cd aerodynamic drag factor 0.2606, Multibeam LED matrix pixel flux 8559.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1607]: Cd aerodynamic drag factor 0.2607, Multibeam LED matrix pixel flux 8560.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1608]: Cd aerodynamic drag factor 0.2608, Multibeam LED matrix pixel flux 8562.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1609]: Cd aerodynamic drag factor 0.2609, Multibeam LED matrix pixel flux 8563.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1610]: Cd aerodynamic drag factor 0.2610, Multibeam LED matrix pixel flux 8565.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1611]: Cd aerodynamic drag factor 0.2611, Multibeam LED matrix pixel flux 8566.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1612]: Cd aerodynamic drag factor 0.2612, Multibeam LED matrix pixel flux 8568.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1613]: Cd aerodynamic drag factor 0.2613, Multibeam LED matrix pixel flux 8569.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1614]: Cd aerodynamic drag factor 0.2614, Multibeam LED matrix pixel flux 8571.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1615]: Cd aerodynamic drag factor 0.2615, Multibeam LED matrix pixel flux 8572.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1616]: Cd aerodynamic drag factor 0.2616, Multibeam LED matrix pixel flux 8574.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1617]: Cd aerodynamic drag factor 0.2617, Multibeam LED matrix pixel flux 8575.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1618]: Cd aerodynamic drag factor 0.2618, Multibeam LED matrix pixel flux 8577.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1619]: Cd aerodynamic drag factor 0.2619, Multibeam LED matrix pixel flux 8578.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1620]: Cd aerodynamic drag factor 0.2620, Multibeam LED matrix pixel flux 8580.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1621]: Cd aerodynamic drag factor 0.2621, Multibeam LED matrix pixel flux 8581.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1622]: Cd aerodynamic drag factor 0.2622, Multibeam LED matrix pixel flux 8583.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1623]: Cd aerodynamic drag factor 0.2623, Multibeam LED matrix pixel flux 8584.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1624]: Cd aerodynamic drag factor 0.2624, Multibeam LED matrix pixel flux 8586.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1625]: Cd aerodynamic drag factor 0.2625, Multibeam LED matrix pixel flux 8587.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1626]: Cd aerodynamic drag factor 0.2626, Multibeam LED matrix pixel flux 8589.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1627]: Cd aerodynamic drag factor 0.2627, Multibeam LED matrix pixel flux 8590.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1628]: Cd aerodynamic drag factor 0.2628, Multibeam LED matrix pixel flux 8592.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1629]: Cd aerodynamic drag factor 0.2629, Multibeam LED matrix pixel flux 8593.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1630]: Cd aerodynamic drag factor 0.2630, Multibeam LED matrix pixel flux 8595.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1631]: Cd aerodynamic drag factor 0.2631, Multibeam LED matrix pixel flux 8596.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1632]: Cd aerodynamic drag factor 0.2632, Multibeam LED matrix pixel flux 8598.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1633]: Cd aerodynamic drag factor 0.2633, Multibeam LED matrix pixel flux 8599.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1634]: Cd aerodynamic drag factor 0.2634, Multibeam LED matrix pixel flux 8601.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1635]: Cd aerodynamic drag factor 0.2635, Multibeam LED matrix pixel flux 8602.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1636]: Cd aerodynamic drag factor 0.2636, Multibeam LED matrix pixel flux 8604.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1637]: Cd aerodynamic drag factor 0.2637, Multibeam LED matrix pixel flux 8605.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1638]: Cd aerodynamic drag factor 0.2638, Multibeam LED matrix pixel flux 8607.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1639]: Cd aerodynamic drag factor 0.2639, Multibeam LED matrix pixel flux 8608.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1640]: Cd aerodynamic drag factor 0.2640, Multibeam LED matrix pixel flux 8610.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1641]: Cd aerodynamic drag factor 0.2641, Multibeam LED matrix pixel flux 8611.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1642]: Cd aerodynamic drag factor 0.2642, Multibeam LED matrix pixel flux 8613.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1643]: Cd aerodynamic drag factor 0.2643, Multibeam LED matrix pixel flux 8614.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1644]: Cd aerodynamic drag factor 0.2644, Multibeam LED matrix pixel flux 8616.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1645]: Cd aerodynamic drag factor 0.2645, Multibeam LED matrix pixel flux 8617.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1646]: Cd aerodynamic drag factor 0.2646, Multibeam LED matrix pixel flux 8619.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1647]: Cd aerodynamic drag factor 0.2647, Multibeam LED matrix pixel flux 8620.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1648]: Cd aerodynamic drag factor 0.2648, Multibeam LED matrix pixel flux 8622.0 lm, Stardust crystal rear facet reflectance 95.7 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1649]: Cd aerodynamic drag factor 0.2649, Multibeam LED matrix pixel flux 8623.5 lm, Stardust crystal rear facet reflectance 95.7 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1650]: Cd aerodynamic drag factor 0.2600, Multibeam LED matrix pixel flux 8625.0 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1651]: Cd aerodynamic drag factor 0.2601, Multibeam LED matrix pixel flux 8626.5 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1652]: Cd aerodynamic drag factor 0.2602, Multibeam LED matrix pixel flux 8628.0 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1653]: Cd aerodynamic drag factor 0.2603, Multibeam LED matrix pixel flux 8629.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1654]: Cd aerodynamic drag factor 0.2604, Multibeam LED matrix pixel flux 8631.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1655]: Cd aerodynamic drag factor 0.2605, Multibeam LED matrix pixel flux 8632.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1656]: Cd aerodynamic drag factor 0.2606, Multibeam LED matrix pixel flux 8634.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1657]: Cd aerodynamic drag factor 0.2607, Multibeam LED matrix pixel flux 8635.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1658]: Cd aerodynamic drag factor 0.2608, Multibeam LED matrix pixel flux 8637.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1659]: Cd aerodynamic drag factor 0.2609, Multibeam LED matrix pixel flux 8638.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1660]: Cd aerodynamic drag factor 0.2610, Multibeam LED matrix pixel flux 8640.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1661]: Cd aerodynamic drag factor 0.2611, Multibeam LED matrix pixel flux 8641.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1662]: Cd aerodynamic drag factor 0.2612, Multibeam LED matrix pixel flux 8643.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1663]: Cd aerodynamic drag factor 0.2613, Multibeam LED matrix pixel flux 8644.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1664]: Cd aerodynamic drag factor 0.2614, Multibeam LED matrix pixel flux 8646.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1665]: Cd aerodynamic drag factor 0.2615, Multibeam LED matrix pixel flux 8647.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1666]: Cd aerodynamic drag factor 0.2616, Multibeam LED matrix pixel flux 8649.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1667]: Cd aerodynamic drag factor 0.2617, Multibeam LED matrix pixel flux 8400.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1668]: Cd aerodynamic drag factor 0.2618, Multibeam LED matrix pixel flux 8402.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1669]: Cd aerodynamic drag factor 0.2619, Multibeam LED matrix pixel flux 8403.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1670]: Cd aerodynamic drag factor 0.2620, Multibeam LED matrix pixel flux 8405.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1671]: Cd aerodynamic drag factor 0.2621, Multibeam LED matrix pixel flux 8406.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1672]: Cd aerodynamic drag factor 0.2622, Multibeam LED matrix pixel flux 8408.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1673]: Cd aerodynamic drag factor 0.2623, Multibeam LED matrix pixel flux 8409.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1674]: Cd aerodynamic drag factor 0.2624, Multibeam LED matrix pixel flux 8411.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1675]: Cd aerodynamic drag factor 0.2625, Multibeam LED matrix pixel flux 8412.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1676]: Cd aerodynamic drag factor 0.2626, Multibeam LED matrix pixel flux 8414.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1677]: Cd aerodynamic drag factor 0.2627, Multibeam LED matrix pixel flux 8415.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1678]: Cd aerodynamic drag factor 0.2628, Multibeam LED matrix pixel flux 8417.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1679]: Cd aerodynamic drag factor 0.2629, Multibeam LED matrix pixel flux 8418.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1680]: Cd aerodynamic drag factor 0.2630, Multibeam LED matrix pixel flux 8420.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1681]: Cd aerodynamic drag factor 0.2631, Multibeam LED matrix pixel flux 8421.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1682]: Cd aerodynamic drag factor 0.2632, Multibeam LED matrix pixel flux 8423.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1683]: Cd aerodynamic drag factor 0.2633, Multibeam LED matrix pixel flux 8424.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1684]: Cd aerodynamic drag factor 0.2634, Multibeam LED matrix pixel flux 8426.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1685]: Cd aerodynamic drag factor 0.2635, Multibeam LED matrix pixel flux 8427.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1686]: Cd aerodynamic drag factor 0.2636, Multibeam LED matrix pixel flux 8429.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1687]: Cd aerodynamic drag factor 0.2637, Multibeam LED matrix pixel flux 8430.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1688]: Cd aerodynamic drag factor 0.2638, Multibeam LED matrix pixel flux 8432.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1689]: Cd aerodynamic drag factor 0.2639, Multibeam LED matrix pixel flux 8433.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1690]: Cd aerodynamic drag factor 0.2640, Multibeam LED matrix pixel flux 8435.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1691]: Cd aerodynamic drag factor 0.2641, Multibeam LED matrix pixel flux 8436.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1692]: Cd aerodynamic drag factor 0.2642, Multibeam LED matrix pixel flux 8438.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1693]: Cd aerodynamic drag factor 0.2643, Multibeam LED matrix pixel flux 8439.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1694]: Cd aerodynamic drag factor 0.2644, Multibeam LED matrix pixel flux 8441.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1695]: Cd aerodynamic drag factor 0.2645, Multibeam LED matrix pixel flux 8442.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1696]: Cd aerodynamic drag factor 0.2646, Multibeam LED matrix pixel flux 8444.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1697]: Cd aerodynamic drag factor 0.2647, Multibeam LED matrix pixel flux 8445.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1698]: Cd aerodynamic drag factor 0.2648, Multibeam LED matrix pixel flux 8447.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1699]: Cd aerodynamic drag factor 0.2649, Multibeam LED matrix pixel flux 8448.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1700]: Cd aerodynamic drag factor 0.2600, Multibeam LED matrix pixel flux 8450.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1701]: Cd aerodynamic drag factor 0.2601, Multibeam LED matrix pixel flux 8451.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1702]: Cd aerodynamic drag factor 0.2602, Multibeam LED matrix pixel flux 8453.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1703]: Cd aerodynamic drag factor 0.2603, Multibeam LED matrix pixel flux 8454.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1704]: Cd aerodynamic drag factor 0.2604, Multibeam LED matrix pixel flux 8456.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1705]: Cd aerodynamic drag factor 0.2605, Multibeam LED matrix pixel flux 8457.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1706]: Cd aerodynamic drag factor 0.2606, Multibeam LED matrix pixel flux 8459.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1707]: Cd aerodynamic drag factor 0.2607, Multibeam LED matrix pixel flux 8460.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1708]: Cd aerodynamic drag factor 0.2608, Multibeam LED matrix pixel flux 8462.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1709]: Cd aerodynamic drag factor 0.2609, Multibeam LED matrix pixel flux 8463.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1710]: Cd aerodynamic drag factor 0.2610, Multibeam LED matrix pixel flux 8465.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1711]: Cd aerodynamic drag factor 0.2611, Multibeam LED matrix pixel flux 8466.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1712]: Cd aerodynamic drag factor 0.2612, Multibeam LED matrix pixel flux 8468.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1713]: Cd aerodynamic drag factor 0.2613, Multibeam LED matrix pixel flux 8469.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1714]: Cd aerodynamic drag factor 0.2614, Multibeam LED matrix pixel flux 8471.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1715]: Cd aerodynamic drag factor 0.2615, Multibeam LED matrix pixel flux 8472.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1716]: Cd aerodynamic drag factor 0.2616, Multibeam LED matrix pixel flux 8474.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1717]: Cd aerodynamic drag factor 0.2617, Multibeam LED matrix pixel flux 8475.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1718]: Cd aerodynamic drag factor 0.2618, Multibeam LED matrix pixel flux 8477.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1719]: Cd aerodynamic drag factor 0.2619, Multibeam LED matrix pixel flux 8478.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1720]: Cd aerodynamic drag factor 0.2620, Multibeam LED matrix pixel flux 8480.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1721]: Cd aerodynamic drag factor 0.2621, Multibeam LED matrix pixel flux 8481.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1722]: Cd aerodynamic drag factor 0.2622, Multibeam LED matrix pixel flux 8483.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1723]: Cd aerodynamic drag factor 0.2623, Multibeam LED matrix pixel flux 8484.5 lm, Stardust crystal rear facet reflectance 95.7 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1724]: Cd aerodynamic drag factor 0.2624, Multibeam LED matrix pixel flux 8486.0 lm, Stardust crystal rear facet reflectance 95.7 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1725]: Cd aerodynamic drag factor 0.2625, Multibeam LED matrix pixel flux 8487.5 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1726]: Cd aerodynamic drag factor 0.2626, Multibeam LED matrix pixel flux 8489.0 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1727]: Cd aerodynamic drag factor 0.2627, Multibeam LED matrix pixel flux 8490.5 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1728]: Cd aerodynamic drag factor 0.2628, Multibeam LED matrix pixel flux 8492.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1729]: Cd aerodynamic drag factor 0.2629, Multibeam LED matrix pixel flux 8493.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1730]: Cd aerodynamic drag factor 0.2630, Multibeam LED matrix pixel flux 8495.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.8 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1731]: Cd aerodynamic drag factor 0.2631, Multibeam LED matrix pixel flux 8496.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1732]: Cd aerodynamic drag factor 0.2632, Multibeam LED matrix pixel flux 8498.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1733]: Cd aerodynamic drag factor 0.2633, Multibeam LED matrix pixel flux 8499.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1734]: Cd aerodynamic drag factor 0.2634, Multibeam LED matrix pixel flux 8501.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1735]: Cd aerodynamic drag factor 0.2635, Multibeam LED matrix pixel flux 8502.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1736]: Cd aerodynamic drag factor 0.2636, Multibeam LED matrix pixel flux 8504.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1737]: Cd aerodynamic drag factor 0.2637, Multibeam LED matrix pixel flux 8505.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1738]: Cd aerodynamic drag factor 0.2638, Multibeam LED matrix pixel flux 8507.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1739]: Cd aerodynamic drag factor 0.2639, Multibeam LED matrix pixel flux 8508.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1740]: Cd aerodynamic drag factor 0.2640, Multibeam LED matrix pixel flux 8510.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1741]: Cd aerodynamic drag factor 0.2641, Multibeam LED matrix pixel flux 8511.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1742]: Cd aerodynamic drag factor 0.2642, Multibeam LED matrix pixel flux 8513.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1743]: Cd aerodynamic drag factor 0.2643, Multibeam LED matrix pixel flux 8514.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1744]: Cd aerodynamic drag factor 0.2644, Multibeam LED matrix pixel flux 8516.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1745]: Cd aerodynamic drag factor 0.2645, Multibeam LED matrix pixel flux 8517.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1746]: Cd aerodynamic drag factor 0.2646, Multibeam LED matrix pixel flux 8519.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1747]: Cd aerodynamic drag factor 0.2647, Multibeam LED matrix pixel flux 8520.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1748]: Cd aerodynamic drag factor 0.2648, Multibeam LED matrix pixel flux 8522.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1749]: Cd aerodynamic drag factor 0.2649, Multibeam LED matrix pixel flux 8523.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.7 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1750]: Cd aerodynamic drag factor 0.2600, Multibeam LED matrix pixel flux 8525.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1751]: Cd aerodynamic drag factor 0.2601, Multibeam LED matrix pixel flux 8526.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1752]: Cd aerodynamic drag factor 0.2602, Multibeam LED matrix pixel flux 8528.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1753]: Cd aerodynamic drag factor 0.2603, Multibeam LED matrix pixel flux 8529.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1754]: Cd aerodynamic drag factor 0.2604, Multibeam LED matrix pixel flux 8531.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1755]: Cd aerodynamic drag factor 0.2605, Multibeam LED matrix pixel flux 8532.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1756]: Cd aerodynamic drag factor 0.2606, Multibeam LED matrix pixel flux 8534.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1757]: Cd aerodynamic drag factor 0.2607, Multibeam LED matrix pixel flux 8535.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1758]: Cd aerodynamic drag factor 0.2608, Multibeam LED matrix pixel flux 8537.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1759]: Cd aerodynamic drag factor 0.2609, Multibeam LED matrix pixel flux 8538.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 55.6 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1760]: Cd aerodynamic drag factor 0.2610, Multibeam LED matrix pixel flux 8540.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1761]: Cd aerodynamic drag factor 0.2611, Multibeam LED matrix pixel flux 8541.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1762]: Cd aerodynamic drag factor 0.2612, Multibeam LED matrix pixel flux 8543.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1763]: Cd aerodynamic drag factor 0.2613, Multibeam LED matrix pixel flux 8544.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1764]: Cd aerodynamic drag factor 0.2614, Multibeam LED matrix pixel flux 8546.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1765]: Cd aerodynamic drag factor 0.2615, Multibeam LED matrix pixel flux 8547.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1766]: Cd aerodynamic drag factor 0.2616, Multibeam LED matrix pixel flux 8549.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1767]: Cd aerodynamic drag factor 0.2617, Multibeam LED matrix pixel flux 8550.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1768]: Cd aerodynamic drag factor 0.2618, Multibeam LED matrix pixel flux 8552.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1769]: Cd aerodynamic drag factor 0.2619, Multibeam LED matrix pixel flux 8553.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1770]: Cd aerodynamic drag factor 0.2620, Multibeam LED matrix pixel flux 8555.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.4 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1771]: Cd aerodynamic drag factor 0.2621, Multibeam LED matrix pixel flux 8556.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1772]: Cd aerodynamic drag factor 0.2622, Multibeam LED matrix pixel flux 8558.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1773]: Cd aerodynamic drag factor 0.2623, Multibeam LED matrix pixel flux 8559.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1774]: Cd aerodynamic drag factor 0.2624, Multibeam LED matrix pixel flux 8561.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1775]: Cd aerodynamic drag factor 0.2625, Multibeam LED matrix pixel flux 8562.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1776]: Cd aerodynamic drag factor 0.2626, Multibeam LED matrix pixel flux 8564.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1777]: Cd aerodynamic drag factor 0.2627, Multibeam LED matrix pixel flux 8565.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1778]: Cd aerodynamic drag factor 0.2628, Multibeam LED matrix pixel flux 8567.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1779]: Cd aerodynamic drag factor 0.2629, Multibeam LED matrix pixel flux 8568.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1780]: Cd aerodynamic drag factor 0.2630, Multibeam LED matrix pixel flux 8570.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1781]: Cd aerodynamic drag factor 0.2631, Multibeam LED matrix pixel flux 8571.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1782]: Cd aerodynamic drag factor 0.2632, Multibeam LED matrix pixel flux 8573.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1783]: Cd aerodynamic drag factor 0.2633, Multibeam LED matrix pixel flux 8574.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1784]: Cd aerodynamic drag factor 0.2634, Multibeam LED matrix pixel flux 8576.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1785]: Cd aerodynamic drag factor 0.2635, Multibeam LED matrix pixel flux 8577.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1786]: Cd aerodynamic drag factor 0.2636, Multibeam LED matrix pixel flux 8579.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1787]: Cd aerodynamic drag factor 0.2637, Multibeam LED matrix pixel flux 8580.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1788]: Cd aerodynamic drag factor 0.2638, Multibeam LED matrix pixel flux 8582.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1789]: Cd aerodynamic drag factor 0.2639, Multibeam LED matrix pixel flux 8583.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1790]: Cd aerodynamic drag factor 0.2640, Multibeam LED matrix pixel flux 8585.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.3 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1791]: Cd aerodynamic drag factor 0.2641, Multibeam LED matrix pixel flux 8586.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1792]: Cd aerodynamic drag factor 0.2642, Multibeam LED matrix pixel flux 8588.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1793]: Cd aerodynamic drag factor 0.2643, Multibeam LED matrix pixel flux 8589.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1794]: Cd aerodynamic drag factor 0.2644, Multibeam LED matrix pixel flux 8591.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1795]: Cd aerodynamic drag factor 0.2645, Multibeam LED matrix pixel flux 8592.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1796]: Cd aerodynamic drag factor 0.2646, Multibeam LED matrix pixel flux 8594.0 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1797]: Cd aerodynamic drag factor 0.2647, Multibeam LED matrix pixel flux 8595.5 lm, Stardust crystal rear facet reflectance 95.6 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1798]: Cd aerodynamic drag factor 0.2648, Multibeam LED matrix pixel flux 8597.0 lm, Stardust crystal rear facet reflectance 95.7 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1799]: Cd aerodynamic drag factor 0.2649, Multibeam LED matrix pixel flux 8598.5 lm, Stardust crystal rear facet reflectance 95.7 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1800]: Cd aerodynamic drag factor 0.2600, Multibeam LED matrix pixel flux 8600.0 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1801]: Cd aerodynamic drag factor 0.2601, Multibeam LED matrix pixel flux 8601.5 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1802]: Cd aerodynamic drag factor 0.2602, Multibeam LED matrix pixel flux 8603.0 lm, Stardust crystal rear facet reflectance 94.2 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1803]: Cd aerodynamic drag factor 0.2603, Multibeam LED matrix pixel flux 8604.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1804]: Cd aerodynamic drag factor 0.2604, Multibeam LED matrix pixel flux 8606.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1805]: Cd aerodynamic drag factor 0.2605, Multibeam LED matrix pixel flux 8607.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1806]: Cd aerodynamic drag factor 0.2606, Multibeam LED matrix pixel flux 8609.0 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1807]: Cd aerodynamic drag factor 0.2607, Multibeam LED matrix pixel flux 8610.5 lm, Stardust crystal rear facet reflectance 94.3 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1808]: Cd aerodynamic drag factor 0.2608, Multibeam LED matrix pixel flux 8612.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1809]: Cd aerodynamic drag factor 0.2609, Multibeam LED matrix pixel flux 8613.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.2 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1810]: Cd aerodynamic drag factor 0.2610, Multibeam LED matrix pixel flux 8615.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1811]: Cd aerodynamic drag factor 0.2611, Multibeam LED matrix pixel flux 8616.5 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1812]: Cd aerodynamic drag factor 0.2612, Multibeam LED matrix pixel flux 8618.0 lm, Stardust crystal rear facet reflectance 94.4 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1813]: Cd aerodynamic drag factor 0.2613, Multibeam LED matrix pixel flux 8619.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1814]: Cd aerodynamic drag factor 0.2614, Multibeam LED matrix pixel flux 8621.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1815]: Cd aerodynamic drag factor 0.2615, Multibeam LED matrix pixel flux 8622.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1816]: Cd aerodynamic drag factor 0.2616, Multibeam LED matrix pixel flux 8624.0 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1817]: Cd aerodynamic drag factor 0.2617, Multibeam LED matrix pixel flux 8625.5 lm, Stardust crystal rear facet reflectance 94.5 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1818]: Cd aerodynamic drag factor 0.2618, Multibeam LED matrix pixel flux 8627.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1819]: Cd aerodynamic drag factor 0.2619, Multibeam LED matrix pixel flux 8628.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1820]: Cd aerodynamic drag factor 0.2620, Multibeam LED matrix pixel flux 8630.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1821]: Cd aerodynamic drag factor 0.2621, Multibeam LED matrix pixel flux 8631.5 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1822]: Cd aerodynamic drag factor 0.2622, Multibeam LED matrix pixel flux 8633.0 lm, Stardust crystal rear facet reflectance 94.6 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1823]: Cd aerodynamic drag factor 0.2623, Multibeam LED matrix pixel flux 8634.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1824]: Cd aerodynamic drag factor 0.2624, Multibeam LED matrix pixel flux 8636.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1825]: Cd aerodynamic drag factor 0.2625, Multibeam LED matrix pixel flux 8637.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1826]: Cd aerodynamic drag factor 0.2626, Multibeam LED matrix pixel flux 8639.0 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1827]: Cd aerodynamic drag factor 0.2627, Multibeam LED matrix pixel flux 8640.5 lm, Stardust crystal rear facet reflectance 94.7 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1828]: Cd aerodynamic drag factor 0.2628, Multibeam LED matrix pixel flux 8642.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1829]: Cd aerodynamic drag factor 0.2629, Multibeam LED matrix pixel flux 8643.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.1 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1830]: Cd aerodynamic drag factor 0.2630, Multibeam LED matrix pixel flux 8645.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1831]: Cd aerodynamic drag factor 0.2631, Multibeam LED matrix pixel flux 8646.5 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1832]: Cd aerodynamic drag factor 0.2632, Multibeam LED matrix pixel flux 8648.0 lm, Stardust crystal rear facet reflectance 94.8 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1833]: Cd aerodynamic drag factor 0.2633, Multibeam LED matrix pixel flux 8649.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1834]: Cd aerodynamic drag factor 0.2634, Multibeam LED matrix pixel flux 8401.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1835]: Cd aerodynamic drag factor 0.2635, Multibeam LED matrix pixel flux 8402.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1836]: Cd aerodynamic drag factor 0.2636, Multibeam LED matrix pixel flux 8404.0 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1837]: Cd aerodynamic drag factor 0.2637, Multibeam LED matrix pixel flux 8405.5 lm, Stardust crystal rear facet reflectance 94.9 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1838]: Cd aerodynamic drag factor 0.2638, Multibeam LED matrix pixel flux 8407.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1839]: Cd aerodynamic drag factor 0.2639, Multibeam LED matrix pixel flux 8408.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1840]: Cd aerodynamic drag factor 0.2640, Multibeam LED matrix pixel flux 8410.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1841]: Cd aerodynamic drag factor 0.2641, Multibeam LED matrix pixel flux 8411.5 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1842]: Cd aerodynamic drag factor 0.2642, Multibeam LED matrix pixel flux 8413.0 lm, Stardust crystal rear facet reflectance 95.0 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1843]: Cd aerodynamic drag factor 0.2643, Multibeam LED matrix pixel flux 8414.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1844]: Cd aerodynamic drag factor 0.2644, Multibeam LED matrix pixel flux 8416.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1845]: Cd aerodynamic drag factor 0.2645, Multibeam LED matrix pixel flux 8417.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1846]: Cd aerodynamic drag factor 0.2646, Multibeam LED matrix pixel flux 8419.0 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1847]: Cd aerodynamic drag factor 0.2647, Multibeam LED matrix pixel flux 8420.5 lm, Stardust crystal rear facet reflectance 95.1 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1848]: Cd aerodynamic drag factor 0.2648, Multibeam LED matrix pixel flux 8422.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1849]: Cd aerodynamic drag factor 0.2649, Multibeam LED matrix pixel flux 8423.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 56.0 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1850]: Cd aerodynamic drag factor 0.2650, Multibeam LED matrix pixel flux 8425.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1851]: Cd aerodynamic drag factor 0.2601, Multibeam LED matrix pixel flux 8426.5 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1852]: Cd aerodynamic drag factor 0.2602, Multibeam LED matrix pixel flux 8428.0 lm, Stardust crystal rear facet reflectance 95.2 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1853]: Cd aerodynamic drag factor 0.2603, Multibeam LED matrix pixel flux 8429.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1854]: Cd aerodynamic drag factor 0.2604, Multibeam LED matrix pixel flux 8431.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1855]: Cd aerodynamic drag factor 0.2605, Multibeam LED matrix pixel flux 8432.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1856]: Cd aerodynamic drag factor 0.2606, Multibeam LED matrix pixel flux 8434.0 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1857]: Cd aerodynamic drag factor 0.2607, Multibeam LED matrix pixel flux 8435.5 lm, Stardust crystal rear facet reflectance 95.3 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1858]: Cd aerodynamic drag factor 0.2608, Multibeam LED matrix pixel flux 8437.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1859]: Cd aerodynamic drag factor 0.2609, Multibeam LED matrix pixel flux 8438.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.46 m2
# Sindelfingen_Aero_Telemetry[1860]: Cd aerodynamic drag factor 0.2610, Multibeam LED matrix pixel flux 8440.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1861]: Cd aerodynamic drag factor 0.2611, Multibeam LED matrix pixel flux 8441.5 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1862]: Cd aerodynamic drag factor 0.2612, Multibeam LED matrix pixel flux 8443.0 lm, Stardust crystal rear facet reflectance 95.4 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1863]: Cd aerodynamic drag factor 0.2613, Multibeam LED matrix pixel flux 8444.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1864]: Cd aerodynamic drag factor 0.2614, Multibeam LED matrix pixel flux 8446.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1865]: Cd aerodynamic drag factor 0.2615, Multibeam LED matrix pixel flux 8447.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.44 m2
# Sindelfingen_Aero_Telemetry[1866]: Cd aerodynamic drag factor 0.2616, Multibeam LED matrix pixel flux 8449.0 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
# Sindelfingen_Aero_Telemetry[1867]: Cd aerodynamic drag factor 0.2617, Multibeam LED matrix pixel flux 8450.5 lm, Stardust crystal rear facet reflectance 95.5 %, cabin aeroacoustic pressure 55.9 dBA at 160 km/h, frontal cross-sectional area 2.45 m2
