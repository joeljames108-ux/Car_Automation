"""
Bentley Continental GT Speed Convertible (2020s) Phase 22: Part A
Header, PBR Material Suite for Jewelry, Utilities, and Subsystems 1 and 2:
- Subsystem 1: Signature Twin Cut-Crystal Matrix LED Headlamp Clusters
- Subsystem 2: Elliptical Cut-Crystal Jewel LED Taillamps & CHMSL Lightbar
"""

PART_BENTLEY2_A = '''"""
=============================================================================
Procedural Class-A CAD Generator: Bentley Continental GT Speed Convertible (2020s)
PHASE 22: Exterior Micro-Detailing, Jewelry, Cut-Crystal Optics & Emblems
=============================================================================
Convertible Architecture · 2020s Era Grand Touring Masterpiece (Type 3S)
Handcrafted in Crewe, England.
Adheres strictly to the Maximum Visual Quality & Intensive CAD Mesh Standard.

Phase 22 Architectural Scope:
1. Complete PBR Material Suite for Micro-Jewelry:
   - Sequin Blue Multi-Coat Deep Pearlescent Metallic Paint
   - Mulliner High-Gloss Mirror Brightware Chrome (#F8FAFC, Metallic 0.99, Roughness 0.02)
   - Dark Tint Speed Grille Matrix & Bezel Metal (#1E2024, Metallic 0.95, Roughness 0.12)
   - Cut-Crystal Diamond-Faceted Glass (Transmission 0.96, IOR 1.62, Dispersion 0.04)
   - Crystal Polycarbonate Outer Lens (Transmission 0.95, IOR 1.52, Clearcoat 1.0)
   - High-Intensity Matrix LED Projector Beam (Emission 24.0, Cold White 6500K)
   - Jewel Faceted LED DRL Halo Rings (Emission 14.0, Warm White 5500K)
   - Ruby Jewel Red LED Taillamp Optics (Transmission 0.72, Emission 8.0)
   - Clear Diamond Cut Reverse Lamp Prism (Transmission 0.92, IOR 1.54)
   - Amber Dynamic LED Indicator Ribbon (Emission 12.0)
   - Black Enamel Cloisonné Bentley 'B' Roundel Field (#08080A)
   - First-Surface Optical Mirror Glass (Metallic 1.0, Roughness 0.01)
   - Jewel Knurled Aluminum (Metallic 0.94, Roughness 0.18)
   - Gloss Piano Black Aero Finishes
   - Satin EPDM Weatherstrip Rubber Seals
2. Precision CAD Jewelry Subsystems:
   - Twin Cut-Crystal Matrix LED Headlamp Clusters (Inboard 110mm / Outboard 85mm)
   - Elliptical Cut-Crystal Jewel LED Taillamps with 3D Diamond Optics & Chrome Bezels
   - Full-Width Trailing Lip 24-LED Center High-Mount Stop Lamp (CHMSL)
   - Flying 'B' Mascot Spine Seat & Winged 'B' Radiator / Boot Emblems
   - Hand-Scripted Chrome "Speed" Fender Badges & "12" Wing Vent Jewelry
   - Mulliner Jewel-Knurled Billet Aluminum Fuel Filler & Oil Caps
   - Sculpted Teardrop Exterior Door Mirrors with Sweeping LED Turn Repeaters
   - Flush-Fitting Aerodynamic Pop-Out Door Handles & Ground Puddle Lamps
   - Mulliner Polished Chrome Cockpit Waistline Beltline Trim & Cowl Brightware
   - Dual Pantograph Aerodynamic Windshield Wipers & Heated Washer Nozzles
   - 22-Inch Speed Floating Self-Leveling Bentley 'B' Wheel Center Caps
   - Front Wing Air Extractor Matrix Vents & Polished Chrome Aero Vanes
   - Flush Ultrasonic Parking Sensor Rosettes & 360 Surround View Cameras
   - Stamped British Registration License Plates & LED Illuminators
   - Interior Electrochromic Rearview Mirror, ADAS Stereo Cameras & HUD Well
   - Speed Brake Caliper Pad Retainers & Raised "BENTLEY" Relief Badges
   - Tonneau Deck Stainless Brightware Strips & Soft-Top Latch Receptors
   - Front Radar Transceiver Dome & ACC Heated Wire Grid Behind Matrix
   - Secondary Stone Guard Wire Screens Behind Radiator Matrix
   - Cockpit Seat Belt Shoulder Guides & Chrome Buckle Tongues
   - Steering Wheel Diamond-Knurled Scroll Wheels & Anodized Shift Paddles
   - Naim for Bentley Diamond-Machined Audio Tweeter Grilles
   - Fuel Flap Articulated Hinge Mechanism & Tethered Cap Cord
   - Exhaust Tip Fluted Rifled Inner Liners & Bumper Heat Isolation Bezels
   - Illuminated Stainless Steel "SPEED" Door Sill Treadplates
   - Showroom Integration & Dual-Mode GLB Export to all Target Locations
=============================================================================
"""

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector, Matrix, Euler, Quaternion


# ----------------------------------------------------------------------------
# 1. CORE UTILITIES & COMPATIBILITY WRAPPERS
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


def _compat_create_torus(bm, major_radius=1.0, minor_radius=0.25, major_segments=24, minor_segments=12, matrix=None, **kwargs):
    if matrix is None:
        matrix = Matrix()
    verts = []
    for i in range(major_segments):
        u = 2.0 * math.pi * i / major_segments
        cos_u, sin_u = math.cos(u), math.sin(u)
        ring_center = Vector((major_radius * cos_u, major_radius * sin_u, 0.0))
        radial_dir = Vector((cos_u, sin_u, 0.0))
        z_dir = Vector((0.0, 0.0, 1.0))
        for j in range(minor_segments):
            v = 2.0 * math.pi * j / minor_segments
            cos_v, sin_v = math.cos(v), math.sin(v)
            pt = ring_center + (radial_dir * cos_v + z_dir * sin_v) * minor_radius
            verts.append(bm.verts.new(matrix @ pt))
    bm.verts.ensure_lookup_table()
    faces = []
    for i in range(major_segments):
        next_i = (i + 1) % major_segments
        for j in range(minor_segments):
            next_j = (j + 1) % minor_segments
            v1 = verts[i * minor_segments + j]
            v2 = verts[next_i * minor_segments + j]
            v3 = verts[next_i * minor_segments + next_j]
            v4 = verts[i * minor_segments + next_j]
            faces.append(bm.faces.new((v1, v2, v3, v4)))
    return {"verts": verts, "faces": faces}
bmesh.ops.create_torus = _compat_create_torus


def make_pbr_mat(name, base_color=(0.8, 0.8, 0.8, 1.0), metallic=0.0, roughness=0.5,
                 clearcoat=0.0, transmission=0.0, ior=1.45, emission=(0, 0, 0, 1), emission_strength=0.0):
    """Factory helper creating physically authentic Principled BSDF PBR materials."""
    mat = bpy.data.materials.get(name)
    if not mat:
        mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
        tree = mat.node_tree
        tree.nodes.clear()
        bsdf = tree.nodes.new(type="ShaderNodeBsdfPrincipled")
        output = tree.nodes.new(type="ShaderNodeOutputMaterial")
        tree.links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])
    else:
        tree = mat.node_tree
        bsdf = tree.nodes.get("Principled BSDF")
        if not bsdf:
            bsdf = tree.nodes.new(type="ShaderNodeBsdfPrincipled")
            output = tree.nodes.get("Material Output")
            if not output:
                output = tree.nodes.new(type="ShaderNodeOutputMaterial")
            tree.links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])

    bsdf.inputs["Base Color"].default_value = base_color
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["IOR"].default_value = ior

    if "Clearcoat" in bsdf.inputs:
        bsdf.inputs["Clearcoat"].default_value = clearcoat
        if "Clearcoat Roughness" in bsdf.inputs:
            bsdf.inputs["Clearcoat Roughness"].default_value = 0.03
    elif "Coat Weight" in bsdf.inputs:
        bsdf.inputs["Coat Weight"].default_value = clearcoat
        if "Coat Roughness" in bsdf.inputs:
            bsdf.inputs["Coat Roughness"].default_value = 0.03

    if "Transmission" in bsdf.inputs:
        bsdf.inputs["Transmission"].default_value = transmission
    elif "Transmission Weight" in bsdf.inputs:
        bsdf.inputs["Transmission Weight"].default_value = transmission

    if transmission > 0.0:
        if hasattr(mat, 'blend_method'):
            mat.blend_method = 'BLEND'
        if hasattr(mat, 'shadow_method'):
            mat.shadow_method = 'NONE'

    if emission_strength > 0.0:
        if "Emission Color" in bsdf.inputs:
            bsdf.inputs["Emission Color"].default_value = emission
        elif "Emission" in bsdf.inputs:
            bsdf.inputs["Emission"].default_value = emission
        if "Emission Strength" in bsdf.inputs:
            bsdf.inputs["Emission Strength"].default_value = emission_strength

    return mat


def link_obj(name, bm, parent_col, mat=None, bevel=0.002, subsurf=0):
    """Creates a new Blender object from bmesh, welds coincident verts, applies smooth normals & modifiers."""
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.0001)

    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    bm.to_mesh(mesh)
    bm.free()

    if hasattr(mesh, "shade_smooth_by_angle"):
        mesh.shade_smooth_by_angle(angle=math.radians(35))
    else:
        mesh.polygons.foreach_set("use_smooth", [True] * len(mesh.polygons))

    obj = bpy.data.objects.new(name, mesh)
    parent_col.objects.link(obj)

    if mat:
        obj.data.materials.append(mat)

    if bevel > 0.0:
        bev = obj.modifiers.new(name="Bevel", type='BEVEL')
        bev.width = bevel
        bev.segments = 2
        bev.limit_method = 'ANGLE'
        bev.angle_limit = math.radians(35)
        bev.profile = 0.7

    wn = obj.modifiers.new(name="WeightedNormal", type='WEIGHTED_NORMAL')
    wn.keep_sharp = True

    if subsurf > 0:
        sub = obj.modifiers.new(name="Subsurf", type='SUBSURF')
        sub.levels = subsurf
        sub.render_levels = subsurf

    return obj


def create_bentley_jewelry_materials():
    """Builds the micro-detailing and cut-crystal jewelry material suite for Bentley Continental GT Speed."""
    mats = {}

    # 1. Sequin Blue Metallic Paint
    mats["paint"] = make_pbr_mat(
        "BENTLEY_Sequin_Blue_Metallic",
        base_color=(0.045, 0.125, 0.380, 1.0),
        metallic=0.88,
        roughness=0.12,
        clearcoat=1.0
    )

    # 2. Mulliner Polished Mirror Chrome
    mats["chrome"] = make_pbr_mat(
        "BENTLEY_Mulliner_Mirror_Chrome",
        base_color=(0.97, 0.98, 0.99, 1.0),
        metallic=0.99,
        roughness=0.015
    )

    # 3. Speed Dark Tint Matrix Metal
    mats["dark_tint"] = make_pbr_mat(
        "BENTLEY_Speed_Dark_Tint_Grille",
        base_color=(0.12, 0.13, 0.15, 1.0),
        metallic=0.95,
        roughness=0.12
    )

    # 4. Cut-Crystal Faceted Glass (High IOR 1.62, ultra-clear for headlamp diamond reflectors)
    mats["crystal_glass"] = make_pbr_mat(
        "BENTLEY_CutCrystal_Diamond_Glass",
        base_color=(0.98, 0.99, 1.0, 1.0),
        roughness=0.01,
        transmission=0.97,
        clearcoat=1.0,
        ior=1.62
    )

    # 5. Clear Polycarbonate Outer Headlamp / Taillamp Cover
    mats["polycarb"] = make_pbr_mat(
        "BENTLEY_Polycarbonate_Outer_Lens",
        base_color=(0.96, 0.98, 1.0, 1.0),
        roughness=0.01,
        transmission=0.95,
        clearcoat=1.0,
        ior=1.52
    )

    # 6. High-Intensity Matrix LED Projector Beam (Cold White 6500K)
    mats["led_headlight"] = make_pbr_mat(
        "BENTLEY_Matrix_LED_Projector_Beam",
        base_color=(0.92, 0.96, 1.0, 1.0),
        roughness=0.05,
        emission=(0.92, 0.96, 1.0, 1.0),
        emission_strength=24.0
    )

    # 7. Jewel Faceted DRL Halo Rings (Warm White 5500K)
    mats["led_drl"] = make_pbr_mat(
        "BENTLEY_CutCrystal_DRL_Halo_Rings",
        base_color=(1.0, 0.98, 0.95, 1.0),
        roughness=0.08,
        emission=(1.0, 0.98, 0.95, 1.0),
        emission_strength=14.0
    )

    # 8. Ruby Jewel Red LED Taillamp Optics
    mats["led_taillight"] = make_pbr_mat(
        "BENTLEY_Ruby_Jewel_LED_Taillamps",
        base_color=(0.85, 0.02, 0.04, 1.0),
        roughness=0.04,
        transmission=0.74,
        emission=(0.95, 0.02, 0.04, 1.0),
        emission_strength=8.5
    )

    # 9. Crystal Clear Reverse Lamp Diffuser
    mats["clear_reverse"] = make_pbr_mat(
        "BENTLEY_Diamond_Reverse_Lamp_Diffuser",
        base_color=(0.95, 0.98, 1.0, 1.0),
        roughness=0.08,
        transmission=0.92,
        ior=1.52
    )

    # 10. Amber Dynamic LED Turn Signal Ribbon
    mats["amber_indicator"] = make_pbr_mat(
        "BENTLEY_Amber_Dynamic_Turn_Signal",
        base_color=(1.0, 0.45, 0.02, 1.0),
        roughness=0.06,
        emission=(1.0, 0.45, 0.02, 1.0),
        emission_strength=12.0
    )

    # 11. Black Enamel Cloisonné Bentley 'B' Roundel Field
    mats["black_enamel"] = make_pbr_mat(
        "BENTLEY_Cloisonne_Black_Enamel",
        base_color=(0.02, 0.02, 0.025, 1.0),
        metallic=0.20,
        roughness=0.04,
        clearcoat=1.0
    )

    # 12. First-Surface Optical Mirror Glass
    mats["mirror_glass"] = make_pbr_mat(
        "BENTLEY_FirstSurface_Optical_Mirror",
        base_color=(0.98, 0.98, 0.98, 1.0),
        metallic=1.0,
        roughness=0.005
    )

    # 13. Jewel Knurled Aluminum (Mulliner knurling)
    mats["knurled_metal"] = make_pbr_mat(
        "BENTLEY_Mulliner_Jewel_Knurled_Metal",
        base_color=(0.82, 0.84, 0.86, 1.0),
        metallic=0.94,
        roughness=0.18
    )

    # 14. Gloss Piano Black Aero Finish
    mats["piano_black"] = make_pbr_mat(
        "BENTLEY_Gloss_Piano_Black",
        base_color=(0.012, 0.012, 0.015, 1.0),
        metallic=0.15,
        roughness=0.06
    )

    # 15. Satin Technical Black EPDM Weatherstrip Rubber
    mats["trim_black"] = make_pbr_mat(
        "BENTLEY_Satin_Black_EPDM_Rubber",
        base_color=(0.045, 0.045, 0.050, 1.0),
        roughness=0.75
    )

    # 16. Red Speed Brake Caliper Enamel
    mats["red_caliper"] = make_pbr_mat(
        "BENTLEY_Speed_Red_Brake_Caliper",
        base_color=(0.78, 0.05, 0.08, 1.0),
        metallic=0.12,
        roughness=0.18,
        clearcoat=1.0
    )

    # 17. UK Front White Reflective Acrylic Number Plate
    mats["plate_white"] = make_pbr_mat(
        "BENTLEY_UK_Front_Reflective_Plate",
        base_color=(0.94, 0.95, 0.96, 1.0),
        roughness=0.25,
        clearcoat=0.9
    )

    # 18. UK Rear Yellow Reflective Acrylic Number Plate
    mats["plate_yellow"] = make_pbr_mat(
        "BENTLEY_UK_Rear_Reflective_Plate",
        base_color=(0.92, 0.78, 0.06, 1.0),
        roughness=0.25,
        clearcoat=0.9
    )

    return mats


# ----------------------------------------------------------------------------
# 2. SUBSYSTEM 1: TWIN CUT-CRYSTAL MATRIX LED HEADLAMP CLUSTERS
# ----------------------------------------------------------------------------

def build_bentley_cut_crystal_headlamps(parent_col, mats):
    """
    Constructs the iconic Bentley cut-crystal twin circular Matrix LED headlamps:
    - Left & Right clusters each housing twin circular optical lenses:
      * Inboard Main Unit: 110mm diameter projector with diamond-cut internal prisms.
      * Outboard Secondary Unit: 85mm diameter projector with illuminated DRL halo ring.
    - Concentric diamond-knurled polished chrome inner surround bezels.
    - Sparkling 3D diamond cut-glass internal facets creating jewelry sparkle when unlit.
    - High-output central LED projector diodes and sweeping amber turn signal light ribbons.
    - Aerodynamically flush crystal-clear polycarbonate outer cover lenses (Y = +2.080m).
    """
    objs = []
    bm_housing = bmesh.new()
    bm_crystal = bmesh.new()
    bm_projector = bmesh.new()
    bm_halo = bmesh.new()
    bm_lens = bmesh.new()

    # Headlamp Cluster Parameters
    # Each side has 2 circular lamps: Inboard (X_off ~ 0.520m) and Outboard (X_off ~ 0.730m)
    headlamp_pairs = [
        # Side,  X_inboard, X_outboard, Y_pos,  Z_pos,  R_in,  R_out
        ("L",   -0.530,    -0.735,      2.060,  0.690,  0.064, 0.050),
        ("R",    0.530,     0.735,      2.060,  0.690,  0.064, 0.050),
    ]

    for side, xi, xo, hy, hz, ri, ro in headlamp_pairs:
        x_sign = 1.0 if xi > 0 else -1.0

        # Master Headlamp Bucket Housing Cavity
        mat_cav = Matrix.Translation(Vector((x_sign * 0.630, hy - 0.040, hz))) @ Euler((0, x_sign * math.radians(-10), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_housing, size=1.0, matrix=mat_cav @ Matrix.Diagonal(Vector((0.360, 0.140, 0.160, 1.0))))

        # 1. Inboard Main 110mm Matrix LED Projector
        mat_in = Matrix.Translation(Vector((xi, hy, hz))) @ Euler((0, x_sign * math.radians(-8), 0), 'XYZ').to_matrix().to_4x4()
        # Knurled Polished Chrome Outer Bezel Ring
        bmesh.ops.create_torus(bm_housing, major_radius=ri * 1.08, minor_radius=0.007, major_segments=24, minor_segments=12, matrix=mat_in @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
        # Stepped Chrome Reflector Funnel Bowl
        bmesh.ops.create_cylinder(bm_housing, radius=ri, depth=0.070, segments=24, matrix=mat_in @ Matrix.Translation(Vector((0, -0.035, 0))) @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
        # Faceted Cut-Crystal Diamond Prisms inside Reflector Bowl (Jewelry sparkle)
        for facet_i in range(12):
            f_ang = facet_i * (2.0 * math.pi / 12.0)
            mat_facet = mat_in @ Euler((0, 0, f_ang), 'XYZ').to_matrix().to_4x4() @ Matrix.Translation(Vector((ri * 0.72, 0.0, -0.015)))
            bmesh.ops.create_cube(bm_crystal, size=1.0, matrix=mat_facet @ Matrix.Diagonal(Vector((0.012, 0.010, 0.018, 1.0))))
        # Central Spherical Bi-LED Projector Lens (Clear glass sphere)
        mat_proj = mat_in @ Matrix.Translation(Vector((0, 0.010, 0)))
        bmesh.ops.create_cylinder(bm_projector, radius=ri * 0.55, depth=0.035, segments=20, matrix=mat_proj @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
        # High-Intensity LED Light Diode Core
        bmesh.ops.create_cylinder(bm_projector, radius=0.018, depth=0.015, segments=14, matrix=mat_in @ Matrix.Translation(Vector((0, -0.020, 0))) @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # 2. Outboard 85mm Cut-Crystal Halo DRL & High-Beam Unit
        mat_out = Matrix.Translation(Vector((xo, hy - 0.025, hz - 0.005))) @ Euler((0, x_sign * math.radians(-14), 0), 'XYZ').to_matrix().to_4x4()
        # Knurled Polished Chrome Bezel
        bmesh.ops.create_torus(bm_housing, major_radius=ro * 1.08, minor_radius=0.006, major_segments=22, minor_segments=10, matrix=mat_out @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
        # Circular Diamond-Faceted Daytime Running Light (DRL) Glowing Halo Ring
        bmesh.ops.create_torus(bm_halo, major_radius=ro * 0.94, minor_radius=0.0065, major_segments=24, minor_segments=12, matrix=mat_out @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
        # Inner Cut-Crystal Spherical Lens
        bmesh.ops.create_cylinder(bm_crystal, radius=ro * 0.62, depth=0.030, segments=18, matrix=mat_out @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # 3. Sweeping Dynamic Amber Turn Indicator Light Ribbon (Bottom brow of cluster)
        mat_ind = mat_cav @ Matrix.Translation(Vector((0.0, 0.055, -0.065)))
        bmesh.ops.create_cube(bm_halo, size=1.0, matrix=mat_ind @ Matrix.Diagonal(Vector((0.280, 0.015, 0.014, 1.0))))

        # 4. Aerodynamic Outer Polycarbonate Headlamp Lens Cover
        mat_cover = mat_cav @ Matrix.Translation(Vector((0.0, 0.065, 0.0)))
        bmesh.ops.create_cube(bm_lens, size=1.0, matrix=mat_cover @ Matrix.Diagonal(Vector((0.370, 0.012, 0.170, 1.0))))

    obj_housing = link_obj("GEO_BENTLEY_Headlamp_Chrome_Housings", bm_housing, parent_col, mats["chrome"], bevel=0.001)
    obj_crystal = link_obj("GEO_BENTLEY_CutCrystal_Internal_Optics", bm_crystal, parent_col, mats["crystal_glass"], bevel=0.0005)
    obj_projector = link_obj("GEO_BENTLEY_Matrix_LED_Projectors", bm_projector, parent_col, mats["led_headlight"], bevel=0.0008)
    obj_halo = link_obj("GEO_BENTLEY_CutCrystal_DRL_Halo_Rings", bm_halo, parent_col, mats["led_drl"], bevel=0.0005)
    obj_lens = link_obj("GEO_BENTLEY_Headlamp_Outer_Polycarb_Lenses", bm_lens, parent_col, mats["polycarb"], bevel=0.0008)

    objs.extend([obj_housing, obj_crystal, obj_projector, obj_halo, obj_lens])
    return objs


# ----------------------------------------------------------------------------
# 3. SUBSYSTEM 2: ELLIPTICAL CUT-CRYSTAL JEWEL LED TAILLAMPS & CHMSL
# ----------------------------------------------------------------------------

def build_bentley_cut_crystal_taillamps(parent_col, mats):
    """
    Constructs the majestic elliptical cut-crystal jewel LED taillamps of the Continental GT:
    - Symmetrical horizontal elliptical taillamps mirroring the oval exhaust tips below.
    - Polished Mulliner chrome outer elliptical surround frame bezel (X = +-0.620m, Y = -2.320m, Z = 0.770m).
    - 3D diamond quilted cut-crystal internal reflector prisms casting deep gem-like reflections.
    - Glowing ruby red LED perimeter illumination band (tail & stop functions).
    - Center diamond-faceted crystal-clear reverse light prism window.
    - Full-width trailing lip 24-LED Center High-Mount Stop Lamp (CHMSL) ribbon on decklid.
    """
    objs = []
    bm_tframes = bmesh.new()
    bm_tjewels = bmesh.new()
    bm_tred = bmesh.new()
    bm_treverse = bmesh.new()
    bm_chmsl = bmesh.new()

    # Left & Right Elliptical Taillamps
    taillamp_locs = [
        ("L", -0.630, -2.315, 0.770, -1.0),
        ("R",  0.630, -2.315, 0.770,  1.0),
    ]

    for side, tx, ty, tz, x_sign in taillamp_locs:
        # Base Elliptical Alignment Matrix (Slightly canted inward and swept around rear boat-tail)
        mat_tl = Matrix.Translation(Vector((tx, ty, tz))) @ Euler((math.radians(6), x_sign * math.radians(12), 0), 'XYZ').to_matrix().to_4x4()

        # 1. Polished Chrome Outer Elliptical Bezel Frame
        mat_e_frame = mat_tl @ Matrix.Diagonal(Vector((1.36, 1.0, 0.82, 1.0)))
        bmesh.ops.create_cylinder(bm_tframes, cap_ends=False, radius=0.125, depth=0.040, segments=32, matrix=mat_e_frame @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # 2. Recessed Housing Backing Cavity
        bmesh.ops.create_cylinder(bm_tframes, radius=0.120, depth=0.050, segments=28, matrix=mat_e_frame @ Matrix.Translation(Vector((0, 0.020, 0))) @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # 3. 3D Diamond Quilted Cut-Crystal Internal Reflector Optic Prisms
        for row in range(3):
            for col in range(5):
                px = (col - 2) * 0.042
                pz = (row - 1) * 0.034
                if (px / 0.12)**2 + (pz / 0.08)**2 <= 0.85:
                    mat_prism = mat_tl @ Matrix.Translation(Vector((px, 0.010, pz)))
                    bmesh.ops.create_cube(bm_tjewels, size=1.0, matrix=mat_prism @ Matrix.Diagonal(Vector((0.018, 0.014, 0.018, 1.0))))

        # 4. Glowing Ruby Red LED Elliptical Perimeter Ring (Positioned forward inside bezel)
        mat_red_ring = mat_tl @ Matrix.Diagonal(Vector((1.30, 1.0, 0.78, 1.0))) @ Matrix.Translation(Vector((0, -0.008, 0)))
        bmesh.ops.create_cylinder(bm_tred, cap_ends=False, radius=0.114, depth=0.016, segments=32, matrix=mat_red_ring @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # 5. Center Diamond-Cut Crystal Clear Reverse Lamp Prism Window
        mat_rev = mat_tl @ Matrix.Translation(Vector((0.0, -0.010, 0.0)))
        bmesh.ops.create_cube(bm_treverse, size=1.0, matrix=mat_rev @ Matrix.Diagonal(Vector((0.085, 0.012, 0.038, 1.0))))

    # 6. Full-Width 24-LED Center High-Mount Stop Lamp (CHMSL) (Trailing lip of rear decklid, Y = -2.260m, Z = 0.885m)
    mat_chmsl = Matrix.Translation(Vector((0.0, -2.260, 0.885))) @ Euler((math.radians(8), 0, 0), 'XYZ').to_matrix().to_4x4()
    # Slim Red Polycarbonate Light Strip
    bmesh.ops.create_cube(bm_chmsl, size=1.0, matrix=mat_chmsl @ Matrix.Diagonal(Vector((0.540, 0.018, 0.014, 1.0))))
    # Polished Chrome Bezel Gasket
    bmesh.ops.create_cube(bm_tframes, size=1.0, matrix=mat_chmsl @ Matrix.Translation(Vector((0, 0.005, 0))) @ Matrix.Diagonal(Vector((0.555, 0.014, 0.020, 1.0))))

    obj_tframes = link_obj("GEO_BENTLEY_Taillamp_Chrome_Bezel_Frames", bm_tframes, parent_col, mats["chrome"], bevel=0.001)
    obj_tjewels = link_obj("GEO_BENTLEY_Taillamp_CutCrystal_Jewel_Optics", bm_tjewels, parent_col, mats["crystal_glass"], bevel=0.0005)
    obj_tred = link_obj("GEO_BENTLEY_Taillamp_Ruby_Red_LED_Rings", bm_tred, parent_col, mats["led_taillight"], bevel=0.0008)
    obj_treverse = link_obj("GEO_BENTLEY_Taillamp_Clear_Reverse_Prisms", bm_treverse, parent_col, mats["clear_reverse"], bevel=0.0005)
    obj_chmsl = link_obj("GEO_BENTLEY_Decklid_CHMSL_Third_Brake_Light", bm_chmsl, parent_col, mats["led_taillight"], bevel=0.0006)

    objs.extend([obj_tframes, obj_tjewels, obj_tred, obj_treverse, obj_chmsl])
    return objs
'''
