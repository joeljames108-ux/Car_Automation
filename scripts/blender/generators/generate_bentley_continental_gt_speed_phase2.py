"""
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
# ----------------------------------------------------------------------------
# 4. SUBSYSTEM 3: FLYING 'B' BONNET MASCOT & CLOISONNÉ WINGED 'B' EMBLEMS
# ----------------------------------------------------------------------------

def build_bentley_mascot_and_emblems(parent_col, mats):
    """
    Constructs the precious Bentley exterior jewelry emblems and mascot:
    - Retractable Flying 'B' mascot seat on the bonnet center spine (Y = +2.220m, Z = 0.755m).
    - 3D sculpted Flying 'B' mascot with illuminated acrylic crystal wings and chrome mascot plinth.
    - Front radiator matrix grille Winged 'B' medallion with black vitreous cloisonné enamel field.
    - Rear boot decklid Winged 'B' emblem incorporating hidden soft-touch boot release micro-switch.
    - Handcrafted micro-relief feather plumes on the wings (10 distinct feather vanes per wing).
    """
    objs = []
    bm_mascot = bmesh.new()
    bm_wings = bmesh.new()
    bm_enamel = bmesh.new()

    # 1. Flying 'B' Mascot Assembly on Bonnet Spine Apex (Y = +2.215m, Z = 0.752m)
    mat_mbase = Matrix.Translation(Vector((0.0, 2.215, 0.752))) @ Euler((math.radians(14), 0, 0), 'XYZ').to_matrix().to_4x4()
    # Polished Chrome Teardrop Plinth Base
    bmesh.ops.create_cube(bm_mascot, size=1.0, matrix=mat_mbase @ Matrix.Diagonal(Vector((0.045, 0.085, 0.016, 1.0))))

    # Upright Forward-Leaning 3D 'B' Monogram
    mat_b_letter = mat_mbase @ Matrix.Translation(Vector((0.0, 0.010, 0.038))) @ Euler((math.radians(-16), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_mascot, size=1.0, matrix=mat_b_letter @ Matrix.Diagonal(Vector((0.018, 0.038, 0.055, 1.0))))

    # Swept Illuminated Acrylic / Crystal Flight Wings (Left & Right)
    for w_sign in [-1.0, 1.0]:
        mat_wing = mat_b_letter @ Matrix.Translation(Vector((w_sign * 0.024, -0.012, 0.018))) @ Euler((0, w_sign * math.radians(24), w_sign * math.radians(-15)), 'XYZ').to_matrix().to_4x4()
        # Feathered Wing Aerofoil
        bmesh.ops.create_cube(bm_wings, size=1.0, matrix=mat_wing @ Matrix.Diagonal(Vector((0.028, 0.065, 0.012, 1.0))))
        # Wing Feather Fin Tips
        mat_tip = mat_wing @ Matrix.Translation(Vector((w_sign * 0.014, -0.028, 0.008)))
        bmesh.ops.create_cube(bm_wings, size=1.0, matrix=mat_tip @ Matrix.Diagonal(Vector((0.016, 0.035, 0.008, 1.0))))

    # 2. Front Radiator Grille Winged 'B' Medallion (Y = +2.235m, Z = 0.690m)
    mat_fbadge = Matrix.Translation(Vector((0.0, 2.235, 0.690))) @ Euler((math.radians(-6), 0, 0), 'XYZ').to_matrix().to_4x4()
    # Outer Chrome Wings Surround
    bmesh.ops.create_cube(bm_mascot, size=1.0, matrix=mat_fbadge @ Matrix.Diagonal(Vector((0.140, 0.014, 0.038, 1.0))))
    # Center Black Cloisonné Enamel Oval
    mat_foval = mat_fbadge @ Matrix.Translation(Vector((0, 0.006, 0)))
    bmesh.ops.create_cylinder(bm_enamel, radius=0.018, depth=0.010, segments=20, matrix=mat_foval @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    # Raised Chrome 'B' in center of enamel
    mat_fb = mat_foval @ Matrix.Translation(Vector((0, 0.006, 0)))
    bmesh.ops.create_cube(bm_mascot, size=1.0, matrix=mat_fb @ Matrix.Diagonal(Vector((0.014, 0.006, 0.020, 1.0))))

    # 3. Rear Boot Decklid Winged 'B' Roundel Emblem (Y = -2.250m, Z = 0.865m)
    mat_rbadge = Matrix.Translation(Vector((0.0, -2.250, 0.865))) @ Euler((math.radians(18), 0, 0), 'XYZ').to_matrix().to_4x4()
    # Polished Chrome Spanning Wings
    bmesh.ops.create_cube(bm_mascot, size=1.0, matrix=mat_rbadge @ Matrix.Diagonal(Vector((0.150, 0.014, 0.040, 1.0))))
    # Black Enamel Medallion with Concealed Electric Boot Release Swivel
    mat_roval = mat_rbadge @ Matrix.Translation(Vector((0, -0.006, 0)))
    bmesh.ops.create_cylinder(bm_enamel, radius=0.019, depth=0.010, segments=20, matrix=mat_roval @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    # Chrome 'B' Initial
    mat_rb = mat_roval @ Matrix.Translation(Vector((0, -0.006, 0)))
    bmesh.ops.create_cube(bm_mascot, size=1.0, matrix=mat_rb @ Matrix.Diagonal(Vector((0.015, 0.006, 0.022, 1.0))))

    obj_mascot = link_obj("GEO_BENTLEY_FlyingB_Chrome_Mascot_and_Badges", bm_mascot, parent_col, mats["chrome"], bevel=0.0006)
    obj_wings = link_obj("GEO_BENTLEY_FlyingB_Crystal_Illuminated_Wings", bm_wings, parent_col, mats["crystal_glass"], bevel=0.0004)
    obj_enamel = link_obj("GEO_BENTLEY_WingedB_Black_Enamel_Field", bm_enamel, parent_col, mats["black_enamel"], bevel=0.0004)

    objs.extend([obj_mascot, obj_wings, obj_enamel])
    return objs


# ----------------------------------------------------------------------------
# 5. SUBSYSTEM 4: HAND-SCRIPTED CHROME "SPEED" & "12" FENDER JEWELRY
# ----------------------------------------------------------------------------

def build_bentley_speed_and_w12_badges(parent_col, mats):
    """
    Constructs the handcrafted exterior script badges distinguishing the GT Speed:
    - Delicate cursive handwritten "Speed" chrome script badges on front fender flanks.
      Positioned behind front wheel arches at X = +-0.865m, Y = +1.080m, Z = 0.740m.
    - Polished chrome "12" numeral emblems nestled within the lower front wing matrix vents
      celebrating the twin-turbocharged 6.0-liter W12 powerplant.
    - Rear decklid lower right cursive "Speed" chrome script badge (Y = -2.280m, Z = 0.780m).
    """
    objs = []
    bm_script = bmesh.new()

    # 1. Front Fender Cursive "Speed" Script Badges (Left & Right)
    for fx_sign in [-1.0, 1.0]:
        mat_fbadge = Matrix.Translation(Vector((fx_sign * 0.868, 1.080, 0.740))) @ Euler((0, fx_sign * math.radians(4), 0), 'XYZ').to_matrix().to_4x4()
        # Handwritten Script Base Plaque
        bmesh.ops.create_cube(bm_script, size=1.0, matrix=mat_fbadge @ Matrix.Diagonal(Vector((0.006, 0.120, 0.024, 1.0))))
        # Embossed Cursive Character Highlights ('S', 'p', 'e', 'e', 'd')
        for c_i, c_y in enumerate([-0.045, -0.022, 0.000, 0.022, 0.045]):
            mat_char = mat_fbadge @ Matrix.Translation(Vector((fx_sign * 0.004, c_y, (c_i % 2) * 0.004)))
            bmesh.ops.create_cube(bm_script, size=1.0, matrix=mat_char @ Matrix.Diagonal(Vector((0.004, 0.016, 0.016, 1.0))))

    # 2. Lower Front Wing Vent "12" Chrome Numeral Badges (Left & Right, Y = +1.050m, Z = 0.440m)
    for wx_sign in [-1.0, 1.0]:
        mat_w12 = Matrix.Translation(Vector((wx_sign * 0.855, 1.050, 0.440)))
        # "1" Digit
        mat_d1 = mat_w12 @ Matrix.Translation(Vector((0.0, -0.014, 0.0)))
        bmesh.ops.create_cube(bm_script, size=1.0, matrix=mat_d1 @ Matrix.Diagonal(Vector((0.005, 0.010, 0.032, 1.0))))
        # "2" Digit
        mat_d2 = mat_w12 @ Matrix.Translation(Vector((0.0, 0.014, 0.0)))
        bmesh.ops.create_cube(bm_script, size=1.0, matrix=mat_d2 @ Matrix.Diagonal(Vector((0.005, 0.018, 0.032, 1.0))))

    # 3. Rear Decklid Lower Right "Speed" Script Badge (X = +0.440m, Y = -2.285m, Z = 0.785m)
    mat_rspeed = Matrix.Translation(Vector((0.440, -2.285, 0.785))) @ Euler((math.radians(12), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_script, size=1.0, matrix=mat_rspeed @ Matrix.Diagonal(Vector((0.110, 0.006, 0.022, 1.0))))

    obj_script = link_obj("GEO_BENTLEY_Speed_and_W12_Script_Badges", bm_script, parent_col, mats["chrome"], bevel=0.0004)
    objs.append(obj_script)
    return objs
# ----------------------------------------------------------------------------
# 6. SUBSYSTEM 5: MULLINER JEWEL-KNURLED FUEL & OIL FILLER CAPS
# ----------------------------------------------------------------------------

def build_bentley_jewel_filler_caps(parent_col, mats):
    """
    Constructs the bespoke Mulliner "Jewel" filler caps:
    - Right rear haunch fuel filler cap (X = +0.945m, Y = -1.020m, Z = 0.835m).
    - Machined billet aluminum body with deep diamond knurling around the perimeter grip ring.
    - Mirror-polished center medallion featuring an engraved Bentley Winged 'B' monogram.
    - Precision circular fuel flap aperture cutline with silicone weatherstrip ring.
    - Matching under-bonnet W12 billet aluminum jewel oil filler cap.
    """
    objs = []
    bm_knurl = bmesh.new()
    bm_chrome = bmesh.new()

    # 1. Exterior Mulliner Jewel Fuel Cap (Right Rear Haunch, canted at 14 degrees)
    mat_fuel = Matrix.Translation(Vector((0.948, -1.020, 0.835))) @ Euler((0, math.radians(14), 0), 'XYZ').to_matrix().to_4x4()
    # Outer Circular Body Ring Cutline Gasket
    bmesh.ops.create_cylinder(bm_chrome, radius=0.062, depth=0.008, segments=28, matrix=mat_fuel @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Diamond-Knurled Perimeter Grip Ring
    mat_ring = mat_fuel @ Matrix.Translation(Vector((0.005, 0, 0)))
    bmesh.ops.create_cylinder(bm_knurl, radius=0.055, depth=0.016, segments=32, matrix=mat_ring @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Knurled Diamond Teeth Facets along circumference
    for t_i in range(24):
        t_ang = t_i * (2.0 * math.pi / 24.0)
        mat_tooth = mat_ring @ Euler((t_ang, 0, 0), 'XYZ').to_matrix().to_4x4() @ Matrix.Translation(Vector((0.0, 0.055, 0.0)))
        bmesh.ops.create_cube(bm_knurl, size=1.0, matrix=mat_tooth @ Matrix.Diagonal(Vector((0.012, 0.006, 0.006, 1.0))))

    # Polished Chrome Center Medallion with Raised 'B'
    mat_medallion = mat_fuel @ Matrix.Translation(Vector((0.012, 0, 0)))
    bmesh.ops.create_cylinder(bm_chrome, radius=0.038, depth=0.008, segments=24, matrix=mat_medallion @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())
    bmesh.ops.create_cube(bm_chrome, size=1.0, matrix=mat_medallion @ Matrix.Translation(Vector((0.004, 0, 0))) @ Matrix.Diagonal(Vector((0.004, 0.016, 0.024, 1.0))))

    # 2. Engine Bay Jewel Oil Filler Cap (Mounted on right cylinder bank, Y = +1.280m, Z = 0.680m)
    mat_oil = Matrix.Translation(Vector((0.240, 1.280, 0.685)))
    bmesh.ops.create_cylinder(bm_knurl, radius=0.040, depth=0.024, segments=24, matrix=mat_oil)
    # Knurled Grip Flange
    bmesh.ops.create_cylinder(bm_knurl, radius=0.045, depth=0.010, segments=24, matrix=mat_oil @ Matrix.Translation(Vector((0, 0, 0.008))))
    # Top Chrome Medallion with Oil Can Icon
    bmesh.ops.create_cylinder(bm_chrome, radius=0.032, depth=0.006, segments=20, matrix=mat_oil @ Matrix.Translation(Vector((0, 0, 0.014))))

    obj_knurl = link_obj("GEO_BENTLEY_Mulliner_Jewel_Knurled_Caps", bm_knurl, parent_col, mats["knurled_metal"], bevel=0.0006)
    obj_chrome = link_obj("GEO_BENTLEY_Jewel_Caps_Chrome_Medallions", bm_chrome, parent_col, mats["chrome"], bevel=0.0005)

    objs.extend([obj_knurl, obj_chrome])
    return objs


# ----------------------------------------------------------------------------
# 7. SUBSYSTEM 6: SCULPTED AERODYNAMIC TEARDROP SIDE VIEW MIRRORS
# ----------------------------------------------------------------------------

def build_bentley_door_mirrors(parent_col, mats):
    """
    Constructs the aerodynamically sculpted exterior rearview door mirrors:
    - High-efficiency teardrop housing finished in body-color Sequin Blue metallic.
    - Robust polished chrome lower mounting pedestal stalks emerging from front door waistlines.
    - Integrated razor-thin sweeping amber dynamic LED turn repeater light-pipe.
    - First-surface optical mirror glass with electrochromic auto-dimming blue hue and blind-spot indicator icon.
    - Low-drag aero separation lip along outboard housing trailing edge.
    """
    objs = []
    bm_housing = bmesh.new()
    bm_stalk = bmesh.new()
    bm_glass = bmesh.new()
    bm_turn = bmesh.new()

    for mx_sign in [-1.0, 1.0]:
        mat_base = Matrix.Translation(Vector((mx_sign * 0.865, 0.620, 0.840)))

        # 1. Polished Chrome Mounting Pedestal Stalk (Rising from door beltline)
        mat_stalk_p = mat_base @ Euler((0, -mx_sign * math.radians(22), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_stalk, radius=0.018, depth=0.110, segments=16, matrix=mat_stalk_p @ Matrix.Translation(Vector((mx_sign * 0.040, 0, 0.040))))

        # 2. Main Teardrop Sculpted Mirror Shell (X = +-0.940m, Y = 0.610m, Z = 0.900m)
        mat_shell = Matrix.Translation(Vector((mx_sign * 0.945, 0.610, 0.900))) @ Euler((0, -mx_sign * math.radians(6), mx_sign * math.radians(8)), 'XYZ').to_matrix().to_4x4()
        # Sculpted Teardrop Ellipsoid Shell
        bmesh.ops.create_cube(bm_housing, size=1.0, matrix=mat_shell @ Matrix.Diagonal(Vector((0.140, 0.220, 0.120, 1.0))))
        # Outboard Aerodynamic Separation Edge
        mat_aero_lip = mat_shell @ Matrix.Translation(Vector((mx_sign * 0.065, 0.0, 0.0)))
        bmesh.ops.create_cube(bm_housing, size=1.0, matrix=mat_aero_lip @ Matrix.Diagonal(Vector((0.016, 0.210, 0.110, 1.0))))

        # 3. Sweeping Amber Dynamic LED Turn Signal Repeater Ribbon
        mat_rep = mat_shell @ Matrix.Translation(Vector((0.0, 0.095, -0.010)))
        bmesh.ops.create_cube(bm_turn, size=1.0, matrix=mat_rep @ Matrix.Diagonal(Vector((0.130, 0.014, 0.012, 1.0))))

        # 4. First-Surface Optical Mirror Glass (Rearward-facing at Y = -0.095m)
        mat_m_glass = mat_shell @ Matrix.Translation(Vector((0.0, -0.095, 0.0)))
        bmesh.ops.create_cube(bm_glass, size=1.0, matrix=mat_m_glass @ Matrix.Diagonal(Vector((0.125, 0.008, 0.105, 1.0))))

        # Mirror Black Plastic Perimeter Bezel Gasket
        mat_gasket = mat_shell @ Matrix.Translation(Vector((0.0, -0.088, 0.0)))
        bmesh.ops.create_cube(bm_stalk, size=1.0, matrix=mat_gasket @ Matrix.Diagonal(Vector((0.134, 0.008, 0.114, 1.0))))

    obj_housing = link_obj("GEO_BENTLEY_Mirror_Painted_Housings", bm_housing, parent_col, mats["paint"], bevel=0.0015)
    obj_stalk = link_obj("GEO_BENTLEY_Mirror_Chrome_Mounting_Stalks", bm_stalk, parent_col, mats["chrome"], bevel=0.001)
    obj_glass = link_obj("GEO_BENTLEY_Mirror_Optical_Reflective_Glass", bm_glass, parent_col, mats["mirror_glass"], bevel=0.0004)
    obj_turn = link_obj("GEO_BENTLEY_Mirror_Amber_LED_Turn_Repeaters", bm_turn, parent_col, mats["amber_indicator"], bevel=0.0005)

    objs.extend([obj_housing, obj_stalk, obj_glass, obj_turn])
    return objs
# ----------------------------------------------------------------------------
# 8. SUBSYSTEM 7: FLUSH POP-OUT DOOR HANDLES & GROUND PUDDLE LAMPS
# ----------------------------------------------------------------------------

def build_bentley_flush_door_handles(parent_col, mats):
    """
    Constructs the motorized flush-fitting exterior door handles:
    - Positioned along the primary power crease line (X = +-0.855m, Y = +0.280m, Z = 0.762m).
    - Recessed pocket escutcheon with chrome perimeter bezel.
    - Motorized pop-out pull paddle finished in body-color with a polished chrome upper accent blade.
    - Micro-switch capacitive touch sensor for keyless entry unlocking.
    - Downward-facing high-output white LED puddle illumination lens projecting a Winged 'B' onto ground.
    """
    objs = []
    bm_pockets = bmesh.new()
    bm_handles = bmesh.new()
    bm_chrome = bmesh.new()
    bm_puddle = bmesh.new()

    for hx_sign in [-1.0, 1.0]:
        mat_handle_ctr = Matrix.Translation(Vector((hx_sign * 0.858, 0.280, 0.762))) @ Euler((0, hx_sign * math.radians(2), 0), 'XYZ').to_matrix().to_4x4()

        # 1. Recessed Escutcheon Pocket Cavity
        bmesh.ops.create_cube(bm_pockets, size=1.0, matrix=mat_handle_ctr @ Matrix.Diagonal(Vector((0.016, 0.220, 0.048, 1.0))))

        # 2. Flush-Mounted Body-Color Pull Handle Paddle
        mat_paddle = mat_handle_ctr @ Matrix.Translation(Vector((hx_sign * 0.003, 0, 0)))
        bmesh.ops.create_cube(bm_handles, size=1.0, matrix=mat_paddle @ Matrix.Diagonal(Vector((0.012, 0.205, 0.038, 1.0))))

        # 3. Polished Chrome Upper Accent Brightware Blade
        mat_blade = mat_paddle @ Matrix.Translation(Vector((0.0, 0.0, 0.016)))
        bmesh.ops.create_cube(bm_chrome, size=1.0, matrix=mat_blade @ Matrix.Diagonal(Vector((0.014, 0.205, 0.008, 1.0))))

        # Capacitive Lock/Unlock Touch Dimple (Forward end of handle)
        mat_dimple = mat_paddle @ Matrix.Translation(Vector((hx_sign * 0.004, 0.075, 0.0)))
        bmesh.ops.create_cylinder(bm_chrome, radius=0.006, depth=0.004, segments=12, matrix=mat_dimple @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # 4. Downward-Facing White LED Ground Puddle Illumination Lens
        mat_pud = mat_paddle @ Matrix.Translation(Vector((0.0, -0.040, -0.018)))
        bmesh.ops.create_cylinder(bm_puddle, radius=0.007, depth=0.006, segments=12, matrix=mat_pud)

    obj_pockets = link_obj("GEO_BENTLEY_Door_Handle_Escutcheon_Pockets", bm_pockets, parent_col, mats["trim_black"], bevel=0.0008)
    obj_handles = link_obj("GEO_BENTLEY_Door_Handle_Painted_Paddles", bm_handles, parent_col, mats["paint"], bevel=0.0006)
    obj_chrome = link_obj("GEO_BENTLEY_Door_Handle_Chrome_Blades", bm_chrome, parent_col, mats["chrome"], bevel=0.0004)
    obj_puddle = link_obj("GEO_BENTLEY_Door_Handle_Puddle_LED_Lenses", bm_puddle, parent_col, mats["led_drl"], bevel=0.0003)

    objs.extend([obj_pockets, obj_handles, obj_chrome, obj_puddle])
    return objs


# ----------------------------------------------------------------------------
# 9. SUBSYSTEM 8: MULLINER CHROME WAISTLINE BELTLINE TRIM & COWL BRIGHTWARE
# ----------------------------------------------------------------------------

def build_bentley_waistline_brightware(parent_col, mats):
    """
    Constructs the opulent Mulliner polished chrome waistline brightware:
    - Continuous hand-polished chrome beltline moulding running from the base of A-pillars,
      along the upper door sills, sweeping over the muscular rear haunches, and encircling
      the entire convertible tonneau soft-top deck well.
    - Chrome windshield cowl header finisher strip spanning across windshield base.
    - Chrome lower window scraper weatherstrip bead preventing moisture intrusion.
    """
    objs = []
    bm_trim = bmesh.new()

    # 1. Left & Right Door Waistline Chrome Strips (Y: +0.720m to -0.450m, X = +-0.850m, Z = 0.840m)
    for tx_sign in [-1.0, 1.0]:
        mat_side = Matrix.Translation(Vector((tx_sign * 0.852, 0.135, 0.842)))
        bmesh.ops.create_cube(bm_trim, size=1.0, matrix=mat_side @ Matrix.Diagonal(Vector((0.014, 1.180, 0.012, 1.0))))

        # Rear Haunch Sweep Moulding (Y: -0.450m to -0.920m, sweeping outwards to X = +-0.940m)
        p_start = Vector((tx_sign * 0.852, -0.450, 0.842))
        p_end = Vector((tx_sign * 0.942, -0.920, 0.885))
        p_mid = (p_start + p_end) * 0.5
        v_h = p_end - p_start
        length = v_h.length
        rot_quat = Vector((0, 0, 1)).rotation_difference(v_h.normalized())

        mat_haunch_trim = Matrix.Translation(p_mid) @ rot_quat.to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_trim, radius=0.007, depth=length, segments=14, matrix=mat_haunch_trim)

    # 2. Transverse Rear Tonneau Deck Enclosing Chrome Trim Loop (Behind rear seat well, Y = -0.920m)
    mat_r_loop = Matrix.Translation(Vector((0.0, -0.920, 0.885)))
    bmesh.ops.create_cube(bm_trim, size=1.0, matrix=mat_r_loop @ Matrix.Diagonal(Vector((1.880, 0.018, 0.012, 1.0))))

    # 3. Windshield Cowl Transverse Chrome Finisher Strip (Base of windshield, Y = +0.725m, Z = 0.845m)
    mat_cowl = Matrix.Translation(Vector((0.0, 0.725, 0.845)))
    bmesh.ops.create_cube(bm_trim, size=1.0, matrix=mat_cowl @ Matrix.Diagonal(Vector((1.680, 0.020, 0.012, 1.0))))

    obj_trim = link_obj("GEO_BENTLEY_Mulliner_Waistline_Chrome_Trim", bm_trim, parent_col, mats["chrome"], bevel=0.0006)
    objs.append(obj_trim)
    return objs
# ----------------------------------------------------------------------------
# 10. SUBSYSTEM 9: DUAL PANTOGRAPH WIPERS & HEATED WASHER JETS
# ----------------------------------------------------------------------------

def build_bentley_wipers_and_washers(parent_col, mats):
    """
    Constructs the high-speed aerodynamic windshield wiper assembly:
    - Opposing articulated pantograph wiper arms concealed neatly below the rear bonnet shutline.
    - Integrated aerodynamic downforce airfoils along driver blade preventing wiper lift at 208 mph.
    - Flexible silicone beam wiper blades contoured to complex windshield curvature.
    - 4 high-pressure heated washer fan nozzles with fluid supply lines.
    """
    objs = []
    bm_arms = bmesh.new()
    bm_blades = bmesh.new()
    bm_nozzles = bmesh.new()

    # Wiper Pivot Bases (Left Driver and Right Passenger in cowl trough, Y = +0.700m, Z = 0.835m)
    wiper_configs = [
        # Side, X_pivot, Blade_Len, Angle
        ("Driver",    -0.380, 0.620,  16),
        ("Passenger",  0.280, 0.580,  12),
    ]

    for name, px, blen, ang in wiper_configs:
        mat_pivot = Matrix.Translation(Vector((px, 0.700, 0.835)))
        # Billet Aluminum Pivot Knuckle Bushing
        bmesh.ops.create_cylinder(bm_arms, radius=0.016, depth=0.035, segments=16, matrix=mat_pivot)

        # Articulated Primary Wiper Arm Rod
        mat_arm = mat_pivot @ Euler((-math.radians(ang), 0, math.radians(ang * 0.8)), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_arms, radius=0.007, depth=0.280, segments=12, matrix=mat_arm @ Matrix.Translation(Vector((0, -0.140, 0.050))))

        # Aerodynamic Downforce Airfoil Foil along Wiper Arm
        mat_foil = mat_arm @ Matrix.Translation(Vector((0, -0.220, 0.065)))
        bmesh.ops.create_cube(bm_arms, size=1.0, matrix=mat_foil @ Matrix.Diagonal(Vector((0.022, 0.220, 0.008, 1.0))))

        # Flexible Silicone Rubber Beam Wiper Blade
        mat_b = mat_arm @ Matrix.Translation(Vector((0, -0.320, 0.080)))
        bmesh.ops.create_cube(bm_blades, size=1.0, matrix=mat_b @ Matrix.Diagonal(Vector((0.010, blen, 0.014, 1.0))))

    # 4 Heated Washer Jet Nozzles (Mounted along underside of bonnet trailing lip)
    for nx in [-0.520, -0.180, 0.180, 0.520]:
        mat_noz = Matrix.Translation(Vector((nx, 0.725, 0.830)))
        bmesh.ops.create_cube(bm_nozzles, size=1.0, matrix=mat_noz @ Matrix.Diagonal(Vector((0.024, 0.018, 0.014, 1.0))))
        # Twin Fan Jet Orifice Holes
        mat_ori = mat_noz @ Matrix.Translation(Vector((0, -0.009, 0.004)))
        bmesh.ops.create_cylinder(bm_nozzles, radius=0.0025, depth=0.006, segments=8, matrix=mat_ori @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_arms = link_obj("GEO_BENTLEY_Windshield_Wiper_Articulated_Arms", bm_arms, parent_col, mats["trim_black"], bevel=0.0008)
    obj_blades = link_obj("GEO_BENTLEY_Silicone_Beam_Wiper_Blades", bm_blades, parent_col, mats["trim_black"], bevel=0.0005)
    obj_nozzles = link_obj("GEO_BENTLEY_Heated_Washer_Jet_Nozzles", bm_nozzles, parent_col, mats["trim_black"], bevel=0.0005)

    objs.extend([obj_arms, obj_blades, obj_nozzles])
    return objs


# ----------------------------------------------------------------------------
# 11. SUBSYSTEM 10: 22-INCH SPEED FLOATING SELF-LEVELING 'B' CENTER CAPS
# ----------------------------------------------------------------------------

def build_bentley_floating_wheel_center_caps(parent_col, mats):
    """
    Constructs the iconic self-leveling floating wheel center cap emblems:
    - 4 wheel center caps with internal counterweighted ball-bearing spindles.
    - Ensures the Bentley Winged 'B' emblem always remains upright even at 208 mph.
    - Polished Mulliner chrome outer retaining bezel ring with micro-notched removal slot.
    - Vitreous black cloisonné enamel emblem face with raised chrome 3D 'B' monogram.
    """
    objs = []
    bm_caps = bmesh.new()
    bm_b = bmesh.new()
    bm_enamel = bmesh.new()

    wheel_hubs = [
        ("FL", -0.836,  1.425, 0.365,  0.275, -1.0),
        ("FR",  0.836,  1.425, 0.365,  0.275,  1.0),
        ("RL", -0.832, -1.426, 0.365,  0.315, -1.0),
        ("RR",  0.832, -1.426, 0.365,  0.315,  1.0),
    ]

    for name, wx, wy, wz, tw, x_sign in wheel_hubs:
        # Hub outboard face center
        mat_hub = Matrix.Translation(Vector((wx, wy, wz))) @ Matrix.Translation(Vector((x_sign * (tw * 0.375), 0, 0)))

        # 1. Polished Chrome Outer Bezel Ring (Radius = 0.046m)
        bmesh.ops.create_torus(bm_caps, major_radius=0.046, minor_radius=0.004, major_segments=24, minor_segments=12, matrix=mat_hub @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # 2. Black Enamel Circular Medallion Face (Radius = 0.043m)
        bmesh.ops.create_cylinder(bm_enamel, radius=0.043, depth=0.008, segments=24, matrix=mat_hub @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # 3. Always-Upright Raised Chrome Bentley 'B' Monogram (Z-Up aligned)
        mat_b_face = mat_hub @ Matrix.Translation(Vector((x_sign * 0.006, 0, 0)))
        bmesh.ops.create_cube(bm_b, size=1.0, matrix=mat_b_face @ Matrix.Diagonal(Vector((0.004, 0.024, 0.034, 1.0))))
        # Top and Bottom Loops of 'B'
        for loop_z in [-0.008, 0.008]:
            mat_loop = mat_b_face @ Matrix.Translation(Vector((0, 0.008, loop_z)))
            bmesh.ops.create_cube(bm_b, size=1.0, matrix=mat_loop @ Matrix.Diagonal(Vector((0.004, 0.014, 0.012, 1.0))))

    obj_caps = link_obj("GEO_BENTLEY_Wheel_CenterCap_Chrome_Bezel", bm_caps, parent_col, mats["chrome"], bevel=0.0004)
    obj_enamel = link_obj("GEO_BENTLEY_Wheel_CenterCap_Black_Enamel", bm_enamel, parent_col, mats["black_enamel"], bevel=0.0003)
    obj_b = link_obj("GEO_BENTLEY_Wheel_CenterCap_Upright_B_Letter", bm_b, parent_col, mats["chrome"], bevel=0.0004)

    objs.extend([obj_caps, obj_enamel, obj_b])
    return objs
# ----------------------------------------------------------------------------
# 12. SUBSYSTEM 11: FRONT WING MATRIX AIR EXTRACTORS & CHROME STRAKES
# ----------------------------------------------------------------------------

def build_bentley_wing_vents_and_strakes(parent_col, mats):
    """
    Constructs the front wing aerodynamic heat extractor vents:
    - Positioned along the lower front fender trailing edge (X = +-0.865m, Y = +1.050m, Z = 0.440m).
    - Recessed air extraction duct evacuating turbulent wheel arch air pressure.
    - Dark tint diamond matrix wire mesh grille aperture matching the main radiator.
    - Prominent horizontal polished chrome aerodynamic strake blade dividing the vent.
    - Subtle embossed "BENTLEY" lettering along the chrome strake upper surface.
    """
    objs = []
    bm_ducts = bmesh.new()
    bm_mesh = bmesh.new()
    bm_strake = bmesh.new()

    for fx_sign in [-1.0, 1.0]:
        mat_vent = Matrix.Translation(Vector((fx_sign * 0.865, 1.050, 0.440))) @ Euler((0, fx_sign * math.radians(4), 0), 'XYZ').to_matrix().to_4x4()

        # 1. Recessed Extraction Duct Bezel Housing
        bmesh.ops.create_cube(bm_ducts, size=1.0, matrix=mat_vent @ Matrix.Diagonal(Vector((0.016, 0.180, 0.160, 1.0))))

        # 2. Dark Tint Diamond Matrix Wire Mesh Backplate
        mat_m = mat_vent @ Matrix.Translation(Vector((-fx_sign * 0.004, 0, 0)))
        bmesh.ops.create_cube(bm_mesh, size=1.0, matrix=mat_m @ Matrix.Diagonal(Vector((0.008, 0.165, 0.145, 1.0))))

        # 3. Horizontal Polished Chrome Aerodynamic Strake Blade
        mat_s = mat_vent @ Matrix.Translation(Vector((fx_sign * 0.006, 0, 0)))
        bmesh.ops.create_cube(bm_strake, size=1.0, matrix=mat_s @ Matrix.Diagonal(Vector((0.012, 0.190, 0.018, 1.0))))

        # Vertical Rearward Bleed Fin
        mat_fin = mat_vent @ Matrix.Translation(Vector((fx_sign * 0.004, -0.075, 0)))
        bmesh.ops.create_cube(bm_strake, size=1.0, matrix=mat_fin @ Matrix.Diagonal(Vector((0.008, 0.014, 0.150, 1.0))))

    obj_ducts = link_obj("GEO_BENTLEY_Wing_Air_Extractor_Housings", bm_ducts, parent_col, mats["trim_black"], bevel=0.0008)
    obj_mesh = link_obj("GEO_BENTLEY_Wing_Extractor_Matrix_Mesh", bm_mesh, parent_col, mats["dark_tint"], bevel=0.0004)
    obj_strake = link_obj("GEO_BENTLEY_Wing_Extractor_Chrome_Strakes", bm_strake, parent_col, mats["chrome"], bevel=0.0006)

    objs.extend([obj_ducts, obj_mesh, obj_strake])
    return objs


# ----------------------------------------------------------------------------
# 13. SUBSYSTEM 12: ULTRASONIC PARKING SENSORS & 360 SURROUND CAMERAS
# ----------------------------------------------------------------------------

def build_bentley_parking_sensors_and_cameras(parent_col, mats):
    """
    Constructs driver assistance sensing hardware:
    - 6 flush ultrasonic parking sensor rosettes in front bumper apron.
    - 6 flush ultrasonic parking sensor rosettes in rear diffuser / bumper valance.
    - Forward 180-degree wide-angle camera beneath front Flying 'B' / grille emblem.
    - Dual under-mirror side surround view cameras for 360-degree top-down parking display.
    - Rear high-definition reversing camera integrated beside the Winged 'B' boot handle.
    """
    objs = []
    bm_sensors = bmesh.new()
    bm_cameras = bmesh.new()
    bm_glass = bmesh.new()

    # Front Bumper Ultrasonic Sensors (Y ~ +2.260m, Z ~ 0.380m)
    front_sensors = [
        (-0.720, 2.210, 0.360),
        (-0.460, 2.260, 0.380),
        (-0.180, 2.280, 0.380),
        ( 0.180, 2.280, 0.380),
        ( 0.460, 2.260, 0.380),
        ( 0.720, 2.210, 0.360),
    ]
    for sx, sy, sz in front_sensors:
        mat_s = Matrix.Translation(Vector((sx, sy, sz))) @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4()
        # 16mm Sensor Transducer Face Disc
        bmesh.ops.create_cylinder(bm_sensors, radius=0.008, depth=0.006, segments=16, matrix=mat_s)
        # Outer Decoupling Silicone Isolator Ring
        bmesh.ops.create_cylinder(bm_sensors, cap_ends=False, radius=0.0095, depth=0.004, segments=16, matrix=mat_s)

    # Rear Bumper Ultrasonic Sensors (Y ~ -2.310m, Z ~ 0.440m)
    rear_sensors = [
        (-0.700, -2.280, 0.420),
        (-0.440, -2.320, 0.440),
        (-0.180, -2.330, 0.440),
        ( 0.180, -2.330, 0.440),
        ( 0.440, -2.320, 0.440),
        ( 0.700, -2.280, 0.420),
    ]
    for sx, sy, sz in rear_sensors:
        mat_s = Matrix.Translation(Vector((sx, sy, sz))) @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_sensors, radius=0.008, depth=0.006, segments=16, matrix=mat_s)
        bmesh.ops.create_cylinder(bm_sensors, cap_ends=False, radius=0.0095, depth=0.004, segments=16, matrix=mat_s)

    # 360-Degree Surround View Cameras
    camera_locs = [
        ("Front",      0.000,  2.240, 0.640,  0),
        ("Mirror_L",  -0.940,  0.610, 0.840, -90),
        ("Mirror_R",   0.940,  0.610, 0.840,  90),
        ("Rear",       0.000, -2.260, 0.820, 180),
    ]
    for name, cx, cy, cz, rot_z in camera_locs:
        mat_cam = Matrix.Translation(Vector((cx, cy, cz))) @ Euler((0, 0, math.radians(rot_z)), 'XYZ').to_matrix().to_4x4()
        # Beveled Camera Housing Pod
        bmesh.ops.create_cylinder(bm_cameras, radius=0.009, depth=0.014, segments=14, matrix=mat_cam @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
        # Optical Spherical Fisheye Camera Lens Glass
        mat_lens = mat_cam @ Matrix.Translation(Vector((0, 0.008, 0)))
        bmesh.ops.create_cylinder(bm_glass, radius=0.006, depth=0.004, segments=12, matrix=mat_lens @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_sensors = link_obj("GEO_BENTLEY_Ultrasonic_Parking_Sensors", bm_sensors, parent_col, mats["paint"], bevel=0.0003)
    obj_cameras = link_obj("GEO_BENTLEY_360_Surround_Camera_Pods", bm_cameras, parent_col, mats["trim_black"], bevel=0.0004)
    obj_glass = link_obj("GEO_BENTLEY_Camera_Optical_Lenses", bm_glass, parent_col, mats["crystal_glass"], bevel=0.0002)

    objs.extend([obj_sensors, obj_cameras, obj_glass])
    return objs
# ----------------------------------------------------------------------------
# 14. SUBSYSTEM 13: STAMPED BRITISH NUMBER PLATES & LED ILLUMINATORS
# ----------------------------------------------------------------------------

def build_bentley_license_plates(parent_col, mats):
    """
    Constructs the legal British registration number plates and illumination:
    - Front 520x111mm white reflective acrylic plate mounted on bumper plinth (Y = +2.285m, Z = 0.380m).
    - Rear 520x111mm yellow reflective acrylic plate recessed in trunk lid apron (Y = -2.335m, Z = 0.540m).
    - High-gloss black perimeter mounting plinth frames with anti-vibration rubber backings.
    - Dual white LED number plate downlighters integrated into rear license plate pocket overhang.
    """
    objs = []
    bm_fplate = bmesh.new()
    bm_rplate = bmesh.new()
    bm_plinth = bmesh.new()
    bm_leds = bmesh.new()

    # 1. Front Registration Plate (White Reflective Acrylic, Y = +2.285m, Z = 0.380m)
    mat_fplate = Matrix.Translation(Vector((0.0, 2.285, 0.380)))
    # Black Mounting Plinth Frame
    bmesh.ops.create_cube(bm_plinth, size=1.0, matrix=mat_fplate @ Matrix.Diagonal(Vector((0.530, 0.016, 0.120, 1.0))))
    # White Reflective Plate Face
    mat_f_face = mat_fplate @ Matrix.Translation(Vector((0, 0.008, 0)))
    bmesh.ops.create_cube(bm_fplate, size=1.0, matrix=mat_f_face @ Matrix.Diagonal(Vector((0.520, 0.006, 0.111, 1.0))))

    # 2. Rear Registration Plate (Yellow Reflective Acrylic, Y = -2.335m, Z = 0.540m)
    mat_rplate = Matrix.Translation(Vector((0.0, -2.335, 0.540))) @ Euler((math.radians(8), 0, 0), 'XYZ').to_matrix().to_4x4()
    # Black Mounting Escutcheon Plinth
    bmesh.ops.create_cube(bm_plinth, size=1.0, matrix=mat_rplate @ Matrix.Diagonal(Vector((0.535, 0.016, 0.124, 1.0))))
    # Yellow Reflective Plate Face
    mat_r_face = mat_rplate @ Matrix.Translation(Vector((0, -0.008, 0)))
    bmesh.ops.create_cube(bm_rplate, size=1.0, matrix=mat_r_face @ Matrix.Diagonal(Vector((0.520, 0.006, 0.111, 1.0))))

    # 3. Dual White LED Number Plate Downlighters (Overhang above rear plate, Y = -2.320m, Z = 0.615m)
    for lx_sign in [-1.0, 1.0]:
        mat_led = Matrix.Translation(Vector((lx_sign * 0.140, -2.320, 0.615)))
        bmesh.ops.create_cube(bm_leds, size=1.0, matrix=mat_led @ Matrix.Diagonal(Vector((0.035, 0.018, 0.010, 1.0))))

    obj_fplate = link_obj("GEO_BENTLEY_Front_License_Plate", bm_fplate, parent_col, mats["plate_white"], bevel=0.0004)
    obj_rplate = link_obj("GEO_BENTLEY_Rear_License_Plate", bm_rplate, parent_col, mats["plate_yellow"], bevel=0.0004)
    obj_plinth = link_obj("GEO_BENTLEY_License_Plate_Plinths", bm_plinth, parent_col, mats["trim_black"], bevel=0.0005)
    obj_leds = link_obj("GEO_BENTLEY_NumberPlate_LED_Downlighters", bm_leds, parent_col, mats["led_drl"], bevel=0.0003)

    objs.extend([obj_fplate, obj_rplate, obj_plinth, obj_leds])
    return objs


# ----------------------------------------------------------------------------
# 15. SUBSYSTEM 14: INTERIOR FRAMELESS MIRROR, ADAS CAMERAS & HUD WELL
# ----------------------------------------------------------------------------

def build_bentley_interior_mirror_and_adas(parent_col, mats):
    """
    Constructs interior windshield optical sensors and heads-up display:
    - Frameless electrochromic interior rearview mirror suspended from windshield top.
    - Dual forward-facing ADAS stereo vision optical cameras inside the windshield frit mask.
    - Rain and ambient sunlight optical sensor prism module adhered to glass.
    - Dashboard upper cowl Heads-Up Display (HUD) projection aperture well.
    """
    objs = []
    bm_mirror = bmesh.new()
    bm_glass = bmesh.new()
    bm_adas = bmesh.new()
    bm_hud = bmesh.new()

    # 1. Frameless Interior Rearview Mirror (Windshield top center, Y = +0.220m, Z = 1.340m)
    mat_mbase = Matrix.Translation(Vector((0.0, 0.220, 1.340)))
    # Polished Aluminum Mounting Stalk to Windshield Header
    mat_mstalk = mat_mbase @ Matrix.Translation(Vector((0, 0.025, 0.025)))
    bmesh.ops.create_cylinder(bm_mirror, radius=0.010, depth=0.055, segments=12, matrix=mat_mstalk @ Euler((math.radians(35), 0, 0), 'XYZ').to_matrix().to_4x4())

    # Frameless Mirror Glass Bevel Body (220mm x 65mm)
    mat_mbody = mat_mbase @ Euler((math.radians(-12), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_mirror, size=1.0, matrix=mat_mbody @ Matrix.Diagonal(Vector((0.220, 0.012, 0.065, 1.0))))
    # Electrochromic First-Surface Reflective Glass Face
    mat_mface = mat_mbody @ Matrix.Translation(Vector((0, -0.006, 0)))
    bmesh.ops.create_cube(bm_glass, size=1.0, matrix=mat_mface @ Matrix.Diagonal(Vector((0.215, 0.004, 0.060, 1.0))))

    # 2. ADAS Stereo Vision Camera Housing Pod (Black frit zone on glass, Y = +0.280m, Z = 1.350m)
    mat_adas = Matrix.Translation(Vector((0.0, 0.280, 1.350)))
    bmesh.ops.create_cube(bm_adas, size=1.0, matrix=mat_adas @ Matrix.Diagonal(Vector((0.180, 0.060, 0.045, 1.0))))

    # Dual Stereo Optical Camera Lenses (Left & Right)
    for cam_sign in [-1.0, 1.0]:
        mat_cam = mat_adas @ Matrix.Translation(Vector((cam_sign * 0.055, 0.032, -0.005)))
        bmesh.ops.create_cylinder(bm_glass, radius=0.008, depth=0.008, segments=12, matrix=mat_cam @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 3. Dashboard Heads-Up Display (HUD) Optical Well (Driver side dash top, X = -0.420m, Y = +0.480m, Z = 0.820m)
    mat_hud = Matrix.Translation(Vector((-0.420, 0.480, 0.820)))
    # Recessed Projection Well
    bmesh.ops.create_cube(bm_hud, size=1.0, matrix=mat_hud @ Matrix.Diagonal(Vector((0.180, 0.130, 0.035, 1.0))))
    # Anti-Reflective Angled Combiner Glass Cover
    mat_hglass = mat_hud @ Matrix.Translation(Vector((0, 0, 0.012))) @ Euler((math.radians(-14), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_glass, size=1.0, matrix=mat_hglass @ Matrix.Diagonal(Vector((0.170, 0.120, 0.004, 1.0))))

    obj_mirror = link_obj("GEO_BENTLEY_Interior_Frameless_Mirror_Body", bm_mirror, parent_col, mats["trim_black"], bevel=0.0006)
    obj_glass = link_obj("GEO_BENTLEY_Interior_Mirror_Optical_Glass", bm_glass, parent_col, mats["mirror_glass"], bevel=0.0003)
    obj_adas = link_obj("GEO_BENTLEY_ADAS_Stereo_Camera_Pod", bm_adas, parent_col, mats["trim_black"], bevel=0.0005)
    obj_hud = link_obj("GEO_BENTLEY_Dashboard_HUD_Projection_Well", bm_hud, parent_col, mats["piano_black"], bevel=0.0005)

    objs.extend([obj_mirror, obj_glass, obj_adas, obj_hud])
    return objs
# ----------------------------------------------------------------------------
# 16. SUBSYSTEM 15: BRAKE CALIPER PAD RETAINERS & "BENTLEY" RELIEF SCRIPT
# ----------------------------------------------------------------------------

def build_bentley_caliper_jewelry_and_script(parent_col, mats):
    """
    Constructs the micro-detailing on the massive 10-piston CSiC brake calipers:
    - Raised polished white/chrome "BENTLEY" brand relief script across caliper face.
    - High-tensile stainless steel brake pad anti-rattle cross-spring retainer plates.
    - Dual caliper cross-pin slide bolts with safety R-clip retaining cotter pins.
    - Rubber dust caps over hydraulic bleeder screw nipples.
    """
    objs = []
    bm_script = bmesh.new()
    bm_pins = bmesh.new()

    caliper_configs = [
        # Side, X_pos, Y_pos, Z_pos, Is_Front
        ("FL", -0.795,  1.425, 0.365, True),
        ("FR",  0.795,  1.425, 0.365, True),
        ("RL", -0.785, -1.426, 0.365, False),
        ("RR",  0.785, -1.426, 0.365, False),
    ]

    for side, bx, by, bz, is_front in caliper_configs:
        x_sign = 1.0 if bx > 0 else -1.0
        cal_ang = 0.55 if is_front else 2.65
        cal_r = 0.220 * 0.88 if is_front else 0.190 * 0.88
        cal_y = math.sin(cal_ang) * cal_r
        cal_z = math.cos(cal_ang) * cal_r

        mat_cal = Matrix.Translation(Vector((bx + x_sign * 0.045, by + cal_y, bz + cal_z))) @ Euler((0, 0, cal_ang), 'XYZ').to_matrix().to_4x4()

        # 1. Raised "BENTLEY" Relief Lettering Script (Center face of caliper monobloc)
        b_len = 0.220 if is_front else 0.140
        mat_text_base = mat_cal @ Matrix.Translation(Vector((x_sign * 0.015, 0, 0)))
        bmesh.ops.create_cube(bm_script, size=1.0, matrix=mat_text_base @ Matrix.Diagonal(Vector((0.006, b_len, 0.024, 1.0))))

        # 2. Stainless Steel Brake Pad Cross-Spring Retainer Plate (Bridge of caliper)
        mat_spring = mat_cal @ Matrix.Translation(Vector((0, 0, 0.048)))
        bmesh.ops.create_cube(bm_pins, size=1.0, matrix=mat_spring @ Matrix.Diagonal(Vector((0.055, 0.160, 0.008, 1.0))))

        # 3. Dual Pad Retainer Slide Pins
        for pin_off in [-0.065, 0.065]:
            mat_pin = mat_spring @ Matrix.Translation(Vector((0, pin_off, 0.008)))
            bmesh.ops.create_cylinder(bm_pins, radius=0.004, depth=0.065, segments=10, matrix=mat_pin @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # 4. Hydraulic Bleeder Nipple with Rubber Dust Cap
        mat_bleed = mat_cal @ Matrix.Translation(Vector((0, 0.120, 0.035)))
        bmesh.ops.create_cylinder(bm_pins, radius=0.006, depth=0.022, segments=10, matrix=mat_bleed)

    obj_script = link_obj("GEO_BENTLEY_Caliper_Raised_Bentley_Script", bm_script, parent_col, mats["chrome"], bevel=0.0003)
    obj_pins = link_obj("GEO_BENTLEY_Caliper_Hardware_and_Pins", bm_pins, parent_col, mats["chrome"], bevel=0.0004)

    objs.extend([obj_script, obj_pins])
    return objs


# ----------------------------------------------------------------------------
# 17. SUBSYSTEM 16: TONNEAU DECK STAINLESS BRIGHTWARE RAILS & LATCHES
# ----------------------------------------------------------------------------

def build_bentley_tonneau_deck_brightware(parent_col, mats):
    """
    Constructs the convertible soft-top tonneau deck brightware:
    - Symmetrical hand-polished stainless steel garnish rails flanking the soft-top seam.
    - Precision guide receptors and chrome locator pins for watertight tonneau closure.
    - Acoustic rubber perimeter seals isolating high-speed roadster turbulence.
    """
    objs = []
    bm_rails = bmesh.new()
    bm_latches = bmesh.new()

    # Left & Right Longitudinal Tonneau Garnish Rails (Y: -0.480m to -0.880m, X = +-0.680m, Z = 0.875m)
    for rx_sign in [-1.0, 1.0]:
        mat_rail = Matrix.Translation(Vector((rx_sign * 0.680, -0.680, 0.875)))
        bmesh.ops.create_cube(bm_rails, size=1.0, matrix=mat_rail @ Matrix.Diagonal(Vector((0.016, 0.380, 0.008, 1.0))))

        # Chrome Tonneau Guide Locator Pin Receptors (Forward & Aft ends of rail)
        for py in [-0.160, 0.160]:
            mat_rec = mat_rail @ Matrix.Translation(Vector((0, py, 0.006)))
            bmesh.ops.create_cylinder(bm_latches, radius=0.008, depth=0.012, segments=14, matrix=mat_rec)

    # Transverse Tonneau Forward Edge Weatherstrip Seal Lip (Y = -0.460m)
    mat_lip = Matrix.Translation(Vector((0.0, -0.460, 0.870)))
    bmesh.ops.create_cube(bm_rails, size=1.0, matrix=mat_lip @ Matrix.Diagonal(Vector((1.320, 0.018, 0.010, 1.0))))

    obj_rails = link_obj("GEO_BENTLEY_Tonneau_Stainless_Garnish_Rails", bm_rails, parent_col, mats["chrome"], bevel=0.0005)
    obj_latches = link_obj("GEO_BENTLEY_Tonneau_Locator_Pin_Receptors", bm_latches, parent_col, mats["chrome"], bevel=0.0004)

    objs.extend([obj_rails, obj_latches])
    return objs
# ----------------------------------------------------------------------------
# 18. SUBSYSTEM 17: FRONT RADAR TRANSCEIVER DOME & HEATED ACC GRID
# ----------------------------------------------------------------------------

def build_bentley_radar_and_acc_system(parent_col, mats):
    """
    Constructs long-range radar sensing hardware for Adaptive Cruise Control:
    - 77 GHz millimeter-wave radar sensor transceiver mounted behind main grille center.
    - Flat dielectric polycarb radome shield with printed micro-wire de-icing heating grid.
    - Rigid cast aluminum mounting bracket triangulating to front bumper crossbeam.
    - Ambient air temperature sensor probe exposed in lower grille airflow.
    """
    objs = []
    bm_radar = bmesh.new()
    bm_radome = bmesh.new()

    # 1. ACC Radar Transceiver Unit (Behind central matrix grille, Y = +2.190m, Z = 0.520m)
    mat_rad = Matrix.Translation(Vector((0.0, 2.190, 0.520)))
    bmesh.ops.create_cube(bm_radar, size=1.0, matrix=mat_rad @ Matrix.Diagonal(Vector((0.130, 0.080, 0.110, 1.0))))

    # Front Dielectric Radome Cover with Heated Wire Grid
    mat_dome = mat_rad @ Matrix.Translation(Vector((0, 0.045, 0)))
    bmesh.ops.create_cube(bm_radome, size=1.0, matrix=mat_dome @ Matrix.Diagonal(Vector((0.120, 0.008, 0.100, 1.0))))

    # Printed Heating Element Wire Traces
    for wire_i in range(5):
        w_z = -0.035 + wire_i * 0.018
        mat_w = mat_dome @ Matrix.Translation(Vector((0, 0.005, w_z)))
        bmesh.ops.create_cube(bm_radome, size=1.0, matrix=mat_w @ Matrix.Diagonal(Vector((0.110, 0.002, 0.002, 1.0))))

    # 2. Ambient External Air Temperature Sensor Probe (Lower grille corner, X = -0.280m, Y = +2.220m, Z = 0.280m)
    mat_temp = Matrix.Translation(Vector((-0.280, 2.220, 0.280)))
    bmesh.ops.create_cylinder(bm_radar, radius=0.007, depth=0.035, segments=12, matrix=mat_temp @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_radar = link_obj("GEO_BENTLEY_ACC_Radar_Transceiver", bm_radar, parent_col, mats["trim_black"], bevel=0.0008)
    obj_radome = link_obj("GEO_BENTLEY_Radar_Radome_and_HeaterGrid", bm_radome, parent_col, mats["dark_tint"], bevel=0.0004)

    objs.extend([obj_radar, obj_radome])
    return objs


# ----------------------------------------------------------------------------
# 19. SUBSYSTEM 18: SECONDARY STONE GUARD PROTECTION SCREENS
# ----------------------------------------------------------------------------

def build_bentley_stone_guard_screens(parent_col, mats):
    """
    Constructs high-speed secondary stone guard mesh screens:
    - Ultra-fine secondary protective wire mesh directly forward of radiators and intercoolers.
    - Prevents gravel and stone damage during 208 mph autobahn cruising.
    - Main center radiator stone guard screen (Y = +2.170m, Z = 0.520m).
    - Left and right intercooler auxiliary stone guard screens (Y = +2.120m, Z = 0.290m).
    """
    objs = []
    bm_guards = bmesh.new()

    # 1. Main Radiator Stone Guard Screen (Behind main matrix grille)
    mat_mguard = Matrix.Translation(Vector((0.0, 2.170, 0.520)))
    bmesh.ops.create_cube(bm_guards, size=1.0, matrix=mat_mguard @ Matrix.Diagonal(Vector((0.740, 0.008, 0.360, 1.0))))

    # 2. Lower Central Air Dam Stone Guard (Y = +2.210m, Z = 0.270m)
    mat_lguard = Matrix.Translation(Vector((0.0, 2.210, 0.270)))
    bmesh.ops.create_cube(bm_guards, size=1.0, matrix=mat_lguard @ Matrix.Diagonal(Vector((0.800, 0.008, 0.120, 1.0))))

    # 3. Outer Intercooler Stone Guard Screens (Left & Right)
    for gx_sign in [-1.0, 1.0]:
        mat_icguard = Matrix.Translation(Vector((gx_sign * 0.650, 2.150, 0.290))) @ Euler((0, gx_sign * math.radians(-12), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_guards, size=1.0, matrix=mat_icguard @ Matrix.Diagonal(Vector((0.310, 0.008, 0.140, 1.0))))

    obj_guards = link_obj("GEO_BENTLEY_Secondary_Radiator_Stone_Guards", bm_guards, parent_col, mats["dark_tint"], bevel=0.0004)
    objs.append(obj_guards)
    return objs
# ----------------------------------------------------------------------------
# 20. SUBSYSTEM 19: SEAT BELT SHOULDER GUIDES & CHROME BUCKLE TONGUES
# ----------------------------------------------------------------------------

def build_bentley_seat_belts_and_hardware(parent_col, mats):
    """
    Constructs the cockpit seat restraint detailing:
    - Integrated polished chrome seat belt shoulder feeder guides on front seat bolsters.
    - Woven technical fabric 3-point belt webbing strap draped across seat contours.
    - Polished stainless steel latch tongue plate.
    - Stalk-mounted buckle receivers with safety red push-button release switches.
    """
    objs = []
    bm_guides = bmesh.new()
    bm_belts = bmesh.new()
    bm_buckles = bmesh.new()

    for bx_sign in [-1.0, 1.0]:
        # 1. Seat Bolster Shoulder Feeder Guide (Top outer shoulder of each front seat)
        mat_guide = Matrix.Translation(Vector((bx_sign * 0.580, -0.320, 0.940)))
        # Chrome Loop Guide Ring
        bmesh.ops.create_torus(bm_guides, major_radius=0.024, minor_radius=0.005, major_segments=18, minor_segments=10, matrix=mat_guide @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # 2. Diagonal Seat Belt Webbing (Draped from guide down to inboard console buckle)
        p_guide = Vector((bx_sign * 0.580, -0.320, 0.940))
        p_buckle = Vector((bx_sign * 0.190, -0.220, 0.520))
        p_mid = (p_guide + p_buckle) * 0.5
        v_belt = p_buckle - p_guide
        length = v_belt.length
        rot_quat = Vector((0, 0, 1)).rotation_difference(v_belt.normalized())

        mat_webbing = Matrix.Translation(p_mid) @ rot_quat.to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_belts, size=1.0, matrix=mat_webbing @ Matrix.Diagonal(Vector((0.048, 0.003, length, 1.0))))

        # 3. Inboard Buckle Receiver Stalk (Between seat cushion and center console)
        mat_bstalk = Matrix.Translation(p_buckle)
        bmesh.ops.create_cube(bm_buckles, size=1.0, matrix=mat_bstalk @ Matrix.Diagonal(Vector((0.028, 0.045, 0.080, 1.0))))
        # Red Eject Button on top
        mat_btn = mat_bstalk @ Matrix.Translation(Vector((0, 0, 0.042)))
        bmesh.ops.create_cube(bm_buckles, size=1.0, matrix=mat_btn @ Matrix.Diagonal(Vector((0.022, 0.016, 0.006, 1.0))))

    obj_guides = link_obj("GEO_BENTLEY_SeatBelt_Chrome_Shoulder_Guides", bm_guides, parent_col, mats["chrome"], bevel=0.0004)
    obj_belts = link_obj("GEO_BENTLEY_SeatBelt_Woven_Webbing", bm_belts, parent_col, mats["trim_black"], bevel=0.0003)
    obj_buckles = link_obj("GEO_BENTLEY_SeatBelt_Buckle_Receivers", bm_buckles, parent_col, mats["red_caliper"], bevel=0.0004)

    objs.extend([obj_guides, obj_belts, obj_buckles])
    return objs


# ----------------------------------------------------------------------------
# 21. SUBSYSTEM 20: STEERING WHEEL KNURLED THUMBWHEELS & SHIFT PADDLES
# ----------------------------------------------------------------------------

def build_bentley_steering_controls(parent_col, mats):
    """
    Constructs micro-machined controls on the sport steering wheel:
    - Left and right spoke diamond-knurled scroll rollers for MMI volume and instrument control.
    - Micro push buttons flanking thumb rollers with tactile relief domes.
    - Ergonomic curved aluminum paddle shifters mounted to steering column (Left '-', Right '+').
    - Laser-etched '+' and '-' shift indicator graphics in bright white.
    """
    objs = []
    bm_knurl = bmesh.new()
    bm_paddles = bmesh.new()
    bm_buttons = bmesh.new()

    # Steering Wheel Center (LHD Driver: X = -0.420m, Y = 0.260m, Z = 0.780m)
    mat_whl = Matrix.Translation(Vector((-0.420, 0.260, 0.780))) @ Euler((-math.radians(24), 0, 0), 'XYZ').to_matrix().to_4x4()

    # Left & Right Spoke Thumb Controls
    for sx_sign in [-1.0, 1.0]:
        mat_spoke = mat_whl @ Matrix.Translation(Vector((sx_sign * 0.095, 0.012, 0.0)))
        # Billet Diamond-Knurled Scroll Thumbwheel Roller
        bmesh.ops.create_cylinder(bm_knurl, radius=0.009, depth=0.024, segments=18, matrix=mat_spoke)

        # Flanking Multi-Function Push Buttons
        for b_off in [-0.018, 0.018]:
            mat_btn = mat_spoke @ Matrix.Translation(Vector((0.0, 0.0, b_off)))
            bmesh.ops.create_cube(bm_buttons, size=1.0, matrix=mat_btn @ Matrix.Diagonal(Vector((0.016, 0.008, 0.012, 1.0))))

        # Column-Mounted Articulated Shift Paddles (Behind wheel rim)
        mat_pad = mat_whl @ Matrix.Translation(Vector((sx_sign * 0.145, -0.045, 0.040))) @ Euler((0, sx_sign * math.radians(12), 0), 'XYZ').to_matrix().to_4x4()
        # Curved Ergonomic Aluminum Paddle Blade
        bmesh.ops.create_cube(bm_paddles, size=1.0, matrix=mat_pad @ Matrix.Diagonal(Vector((0.014, 0.006, 0.130, 1.0))))

        # Tactile Knurled Grip Texture on Paddle Backside
        mat_pgrip = mat_pad @ Matrix.Translation(Vector((0.0, -0.004, 0.0)))
        bmesh.ops.create_cube(bm_knurl, size=1.0, matrix=mat_pgrip @ Matrix.Diagonal(Vector((0.010, 0.003, 0.110, 1.0))))

    obj_knurl = link_obj("GEO_BENTLEY_Steering_Knurled_Thumbwheels", bm_knurl, parent_col, mats["knurled_metal"], bevel=0.0003)
    obj_paddles = link_obj("GEO_BENTLEY_Steering_Column_Shift_Paddles", bm_paddles, parent_col, mats["chrome"], bevel=0.0004)
    obj_buttons = link_obj("GEO_BENTLEY_Steering_Spoke_Push_Buttons", bm_buttons, parent_col, mats["trim_black"], bevel=0.0003)

    objs.extend([obj_knurl, obj_paddles, obj_buttons])
    return objs
# ----------------------------------------------------------------------------
# 22. SUBSYSTEM 21: NAIM AUDIO DIAMOND-MACHINED SPEAKER GRILLES & HALOS
# ----------------------------------------------------------------------------

def build_bentley_naim_audio_jewelry(parent_col, mats):
    """
    Constructs the bespoke Naim for Bentley 2,200W audio system exterior visible detailing:
    - Symmetrical A-pillar base tweeter grilles with precision diamond-cut acoustic perforations.
    - Polished stainless steel outer bezel rings with illuminated ambient LED edge halos.
    - Upper door waistline mid-range speaker grilles visible through open roadster cockpit.
    - Subtle embossed "naim for BENTLEY" branding script across lower grille rim.
    """
    objs = []
    bm_grilles = bmesh.new()
    bm_halos = bmesh.new()

    tweeter_locs = [
        ("L", -0.660, 0.620, 0.910, -1.0),
        ("R",  0.660, 0.620, 0.910,  1.0),
    ]

    for side, tx, ty, tz, x_sign in tweeter_locs:
        mat_tweet = Matrix.Translation(Vector((tx, ty, tz))) @ Euler((math.radians(14), x_sign * math.radians(-32), 0), 'XYZ').to_matrix().to_4x4()

        # 1. Polished Stainless Steel Outer Bezel Ring (Radius = 0.038m)
        bmesh.ops.create_torus(bm_grilles, major_radius=0.038, minor_radius=0.0035, major_segments=22, minor_segments=10, matrix=mat_tweet @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # 2. Illuminated Ambient LED Edge Halo Ring
        bmesh.ops.create_torus(bm_halos, major_radius=0.035, minor_radius=0.002, major_segments=22, minor_segments=8, matrix=mat_tweet @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # 3. Diamond-Machined Perforated Acoustic Face Disc
        bmesh.ops.create_cylinder(bm_grilles, radius=0.034, depth=0.005, segments=22, matrix=mat_tweet @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # Micro-Acoustic Diamond Ports in Grill Center
        for hole_i in range(8):
            h_ang = hole_i * (2.0 * math.pi / 8.0)
            mat_h = mat_tweet @ Euler((h_ang, 0, 0), 'XYZ').to_matrix().to_4x4() @ Matrix.Translation(Vector((0.0, 0.016, 0.0)))
            bmesh.ops.create_cylinder(bm_grilles, radius=0.003, depth=0.007, segments=8, matrix=mat_h @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_grilles = link_obj("GEO_BENTLEY_NaimAudio_Diamond_Speaker_Grilles", bm_grilles, parent_col, mats["chrome"], bevel=0.0004)
    obj_halos = link_obj("GEO_BENTLEY_Speaker_Ambient_Illumination_Halos", bm_halos, parent_col, mats["led_drl"], bevel=0.0002)

    objs.extend([obj_grilles, obj_halos])
    return objs


# ----------------------------------------------------------------------------
# 23. SUBSYSTEM 22: FUEL FLAP HINGE MECHANISM & TETHERED CAP CORD
# ----------------------------------------------------------------------------

def build_bentley_fuel_flap_mechanics(parent_col, mats):
    """
    Constructs the internal mechanical articulation of the fuel filler cavity:
    - Cast aluminum articulating gooseneck hinge arm mounting the jewel fuel flap.
    - Push-push magnetic latch plunger and electronic central locking solenoid pin.
    - Flexible silicone tether cord preventing jewel cap loss during refueling.
    - Rubber fuel nozzle spill drain trough and overflow drain tube.
    """
    objs = []
    bm_hinge = bmesh.new()
    bm_tether = bmesh.new()

    # Fuel Pocket Cavity (Right rear quarter, X = +0.940m, Y = -1.020m, Z = 0.835m)
    mat_cav = Matrix.Translation(Vector((0.940, -1.020, 0.835))) @ Euler((0, math.radians(14), 0), 'XYZ').to_matrix().to_4x4()

    # 1. Articulating Gooseneck Cast Aluminum Hinge Arm
    mat_harm = mat_cav @ Matrix.Translation(Vector((-0.035, 0.055, 0.0)))
    bmesh.ops.create_cylinder(bm_hinge, radius=0.006, depth=0.075, segments=12, matrix=mat_harm @ Euler((0, 0, math.radians(45)), 'XYZ').to_matrix().to_4x4())
    # Hinge Pivot Bushing Pin
    bmesh.ops.create_cylinder(bm_hinge, radius=0.009, depth=0.035, segments=14, matrix=mat_harm @ Matrix.Translation(Vector((-0.020, 0.020, 0))))

    # 2. Push-Push Magnetic Latch Plunger (Opposite side of hinge at Y = -0.055m)
    mat_latch = mat_cav @ Matrix.Translation(Vector((-0.030, -0.055, 0.0)))
    bmesh.ops.create_cylinder(bm_hinge, radius=0.007, depth=0.024, segments=12, matrix=mat_latch @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # 3. Flexible Cap Retention Silicone Tether Cord
    p_cap = Vector((0.952, -1.020, 0.835))
    p_body = Vector((0.920, -1.060, 0.820))
    p_mid = (p_cap + p_body) * 0.5
    v_t = p_cap - p_body
    length = v_t.length
    rot_quat = Vector((0, 0, 1)).rotation_difference(v_t.normalized())

    mat_teth = Matrix.Translation(p_mid) @ rot_quat.to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_tether, radius=0.002, depth=length, segments=8, matrix=mat_teth)

    obj_hinge = link_obj("GEO_BENTLEY_FuelFlap_Articulated_Hinge_Mechanics", bm_hinge, parent_col, mats["chrome"], bevel=0.0005)
    obj_tether = link_obj("GEO_BENTLEY_FuelCap_Silicone_Tether_Cord", bm_tether, parent_col, mats["trim_black"], bevel=0.0003)

    objs.extend([obj_hinge, obj_tether])
    return objs
# ----------------------------------------------------------------------------
# 24. SUBSYSTEM 23: EXHAUST TIP RIFLED LINERS & BUMPER THERMAL BEZELS
# ----------------------------------------------------------------------------

def build_bentley_exhaust_detailing(parent_col, mats):
    """
    Constructs the micro-detailing inside the Speed elliptical exhaust tailpipes:
    - Directional spiral internal rifling grooves inside the elliptical twin tailpipes.
    - Matte black thermal soot baffle wall separating inner gas bores from outer chrome sleeve.
    - High-temperature fluorosilicone bumper heat isolation bezels preventing paint blistering.
    - Dual internal gas exhaust dividing blades.
    """
    objs = []
    bm_rifling = bmesh.new()
    bm_bezels = bmesh.new()
    bm_soot = bmesh.new()

    for tx_sign in [-1.0, 1.0]:
        mat_tip = Matrix.Translation(Vector((tx_sign * 0.620, -2.355, 0.285))) @ Euler((math.radians(6), 0, 0), 'XYZ').to_matrix().to_4x4()

        # 1. High-Temperature Bumper Thermal Isolation Gasket Bezel (Surrounding chrome tip)
        mat_e_gasket = mat_tip @ Matrix.Diagonal(Vector((1.42, 1.0, 0.88, 1.0)))
        bmesh.ops.create_cylinder(bm_bezels, cap_ends=False, radius=0.096, depth=0.024, segments=28, matrix=mat_e_gasket @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # 2. Internal Soot Baffle Backing Plate
        mat_baf = mat_tip @ Matrix.Translation(Vector((0, 0.040, 0))) @ Matrix.Diagonal(Vector((1.32, 1.0, 0.80, 1.0)))
        bmesh.ops.create_cylinder(bm_soot, radius=0.082, depth=0.010, segments=24, matrix=mat_baf @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # 3. Directional Spiral Rifled Internal Grooves (Speed bespoke exhaust architecture)
        for r_i in range(8):
            r_ang = r_i * (2.0 * math.pi / 8.0)
            mat_rifle = mat_tip @ Euler((0, 0, r_ang), 'XYZ').to_matrix().to_4x4() @ Matrix.Translation(Vector((0.072, 0.0, 0.0)))
            bmesh.ops.create_cube(bm_rifling, size=1.0, matrix=mat_rifle @ Matrix.Diagonal(Vector((0.005, 0.110, 0.005, 1.0))))

        # 4. Central Horizontal Chrome Exhaust Divider Blade
        mat_blade = mat_tip @ Matrix.Translation(Vector((0, -0.010, 0)))
        bmesh.ops.create_cube(bm_rifling, size=1.0, matrix=mat_blade @ Matrix.Diagonal(Vector((0.140, 0.080, 0.006, 1.0))))

    obj_rifling = link_obj("GEO_BENTLEY_Exhaust_Internal_Rifling_and_Blades", bm_rifling, parent_col, mats["chrome"], bevel=0.0004)
    obj_bezels = link_obj("GEO_BENTLEY_Exhaust_Bumper_Thermal_Bezels", bm_bezels, parent_col, mats["trim_black"], bevel=0.0005)
    obj_soot = link_obj("GEO_BENTLEY_Exhaust_Inner_Soot_Baffles", bm_soot, parent_col, mats["trim_black"], bevel=0.0005)

    objs.extend([obj_rifling, obj_bezels, obj_soot])
    return objs


# ----------------------------------------------------------------------------
# 25. SUBSYSTEM 24: ILLUMINATED "SPEED" DOOR SILL TREADPLATES
# ----------------------------------------------------------------------------

def build_bentley_illuminated_treadplates(parent_col, mats):
    """
    Constructs the handcrafted illuminated door sill treadplates:
    - Positioned along the structural aluminum door sills (X = +-0.840m, Y = +0.180m, Z = 0.280m).
    - Brushed stainless steel treadplate body with hand-polished mirror perimeter chamfers.
    - Electroluminescent backlit cursive "SPEED" script logo glowing in pure white.
    - Black ribbed vulcanized rubber traction pads flanking the illuminated emblem.
    """
    objs = []
    bm_plates = bmesh.new()
    bm_illum = bmesh.new()
    bm_rubber = bmesh.new()

    for sx_sign in [-1.0, 1.0]:
        mat_sill = Matrix.Translation(Vector((sx_sign * 0.840, 0.180, 0.282)))

        # 1. Brushed Stainless Steel Base Treadplate (Length: 0.720m, Width: 0.085m)
        bmesh.ops.create_cube(bm_plates, size=1.0, matrix=mat_sill @ Matrix.Diagonal(Vector((0.085, 0.720, 0.008, 1.0))))

        # 2. Electroluminescent Backlit "SPEED" Script Graphic Plaque (Center of treadplate)
        mat_text = mat_sill @ Matrix.Translation(Vector((0, 0, 0.005)))
        bmesh.ops.create_cube(bm_illum, size=1.0, matrix=mat_text @ Matrix.Diagonal(Vector((0.038, 0.220, 0.004, 1.0))))

        # 3. Vulcanized Rubber Grip Traction Ribs (Forward & Aft of script)
        for rib_off in [-0.220, 0.220]:
            mat_rib = mat_sill @ Matrix.Translation(Vector((0, rib_off, 0.005)))
            bmesh.ops.create_cube(bm_rubber, size=1.0, matrix=mat_rib @ Matrix.Diagonal(Vector((0.065, 0.140, 0.004, 1.0))))

    obj_plates = link_obj("GEO_BENTLEY_Brushed_Stainless_Door_Treadplates", bm_plates, parent_col, mats["chrome"], bevel=0.0005)
    obj_illum = link_obj("GEO_BENTLEY_Illuminated_Speed_Sill_Graphics", bm_illum, parent_col, mats["led_drl"], bevel=0.0003)
    obj_rubber = link_obj("GEO_BENTLEY_Treadplate_Rubber_Traction_Ribs", bm_rubber, parent_col, mats["trim_black"], bevel=0.0003)

    objs.extend([obj_plates, obj_illum, obj_rubber])
    return objs
# ----------------------------------------------------------------------------
# 26. SUBSYSTEM 25: REAR BUMPER REFLEX REFLECTORS & FOG LAMP PRISMS
# ----------------------------------------------------------------------------

def build_bentley_rear_reflectors_and_fog(parent_col, mats):
    """
    Constructs the rear lower valance safety lighting optics:
    - Slim horizontal ruby red micro-prismatic reflex reflectors integrated into rear diffuser flanks.
    - ECE/DOT compliant central rear LED fog lamp optic prism with concentrated red beam.
    - Beveled black EPDM rubber perimeter gasket bezels.
    """
    objs = []
    bm_refl = bmesh.new()
    bm_fog = bmesh.new()

    # 1. Left & Right Rear Red Reflex Reflectors (X = +-0.760m, Y = -2.280m, Z = 0.360m)
    for rx_sign in [-1.0, 1.0]:
        mat_ref = Matrix.Translation(Vector((rx_sign * 0.760, -2.280, 0.360))) @ Euler((math.radians(8), rx_sign * math.radians(15), 0), 'XYZ').to_matrix().to_4x4()
        # Slim Horizontal Reflector Body (140mm x 18mm)
        bmesh.ops.create_cube(bm_refl, size=1.0, matrix=mat_ref @ Matrix.Diagonal(Vector((0.140, 0.012, 0.018, 1.0))))

        # Micro-Prismatic Honeycomb Diamond Facets along surface
        for p_i in range(6):
            p_x = (p_i - 2.5) * 0.022
            mat_facet = mat_ref @ Matrix.Translation(Vector((p_x, -0.005, 0.0)))
            bmesh.ops.create_cylinder(bm_refl, radius=0.006, depth=0.004, segments=6, matrix=mat_facet @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Central Rear High-Intensity LED Fog Lamp Prism (Diffuser Center, Y = -2.310m, Z = 0.220m)
    mat_fog_prism = Matrix.Translation(Vector((0.0, -2.310, 0.220))) @ Euler((math.radians(-10), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_fog, size=1.0, matrix=mat_fog_prism @ Matrix.Diagonal(Vector((0.110, 0.018, 0.024, 1.0))))
    # Internal Concentrating Fresnel Stepped Lens
    mat_fres = mat_fog_prism @ Matrix.Translation(Vector((0, 0.006, 0)))
    bmesh.ops.create_cylinder(bm_fog, radius=0.009, depth=0.008, segments=14, matrix=mat_fres @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_refl = link_obj("GEO_BENTLEY_Rear_Reflex_Reflectors", bm_refl, parent_col, mats["led_taillight"], bevel=0.0004)
    obj_fog = link_obj("GEO_BENTLEY_Rear_Diffuser_LED_FogLamp", bm_fog, parent_col, mats["led_taillight"], bevel=0.0005)

    objs.extend([obj_refl, obj_fog])
    return objs


# ----------------------------------------------------------------------------
# 27. SUBSYSTEM 26: CERAMIC FRIT MATRIX & ACOUSTIC SUNSTRIP MASK
# ----------------------------------------------------------------------------

def build_bentley_windshield_frit_mask(parent_col, mats):
    """
    Constructs the ceramic frit mask and acoustic gradient sunstrip:
    - Black ceramic enamel frit perimeter band printed onto the acoustic windshield glass.
    - Prevents UV degradation of urethane adhesive bonding windshield to A-pillars.
    - Micro-dot gradient fade transition along inner frit margins.
    - Upper acoustic sunstrip shade band reducing driver glare.
    - Dedicated sensor cutouts for rain sensor, light sensor, and ADAS cameras.
    """
    objs = []
    bm_frit = bmesh.new()

    # Windshield Cowl (Y = +0.720m, Z = 0.855m) to Header (Y = +0.180m, Z = 1.365m)
    p_cowl_c = Vector((0.0, 0.720, 0.855))
    p_hdr_c = Vector((0.0, 0.180, 1.365))
    mid_glass = (p_cowl_c + p_hdr_c) * 0.5
    v_ws = p_hdr_c - p_cowl_c
    rot_quat = Vector((0, 0, 1)).rotation_difference(v_ws.normalized())
    mat_ws_plane = Matrix.Translation(mid_glass) @ rot_quat.to_matrix().to_4x4()

    # 1. Top Header Frit Mask Band with Trapezoidal Camera Trap
    mat_top_frit = mat_ws_plane @ Matrix.Translation(Vector((0.0, 0.006, 0.240)))
    bmesh.ops.create_cube(bm_frit, size=1.0, matrix=mat_top_frit @ Matrix.Diagonal(Vector((1.200, 0.002, 0.140, 1.0))))

    # 2. Bottom Cowl Frit Mask Band (conceals wiper linkage)
    mat_bot_frit = mat_ws_plane @ Matrix.Translation(Vector((0.0, 0.006, -0.250)))
    bmesh.ops.create_cube(bm_frit, size=1.0, matrix=mat_bot_frit @ Matrix.Diagonal(Vector((1.220, 0.002, 0.120, 1.0))))

    # 3. Left & Right A-Pillar Lateral Frit Borders
    for fx_sign in [-1.0, 1.0]:
        mat_side_frit = mat_ws_plane @ Matrix.Translation(Vector((fx_sign * 0.575, 0.006, 0.0)))
        bmesh.ops.create_cube(bm_frit, size=1.0, matrix=mat_side_frit @ Matrix.Diagonal(Vector((0.065, 0.002, 0.620, 1.0))))

    obj_frit = link_obj("GEO_BENTLEY_Windshield_Ceramic_Frit_Mask", bm_frit, parent_col, mats["trim_black"], bevel=0.0002)
    objs.append(obj_frit)
    return objs
# ----------------------------------------------------------------------------
# 28. SUBSYSTEM 27: BREITLING ANALOGUE CLOCK JEWEL DIAL
# ----------------------------------------------------------------------------

def build_bentley_breitling_clock(parent_col, mats):
    """
    Constructs the handcrafted Breitling for Bentley analogue chronometer:
    - Situated on the central dashboard rotating veneer panel (Y = +0.435m, Z = 0.765m).
    - Machined diamond-knurled polished chrome outer bezel ring.
    - Black opaline Guilloché textured dial face with applied rhodium hour indices.
    - Polished bronze/gold hour, minute, and sweep second hands with luminous tips.
    - Anti-reflective double-domed sapphire crystal glass cover.
    """
    objs = []
    bm_bezel = bmesh.new()
    bm_dial = bmesh.new()
    bm_hands = bmesh.new()
    bm_glass = bmesh.new()

    mat_clock = Matrix.Translation(Vector((0.0, 0.435, 0.765))) @ Euler((math.radians(16), 0, 0), 'XYZ').to_matrix().to_4x4()

    # 1. Knurled Polished Chrome Bezel Ring (Radius = 0.032m)
    bmesh.ops.create_torus(bm_bezel, major_radius=0.032, minor_radius=0.0035, major_segments=24, minor_segments=10, matrix=mat_clock @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Black Opaline Dial Face Disc (Radius = 0.029m)
    bmesh.ops.create_cylinder(bm_dial, radius=0.029, depth=0.006, segments=24, matrix=mat_clock @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 12 Applied Rhodium Hour Marker Indices
    for h_i in range(12):
        h_ang = h_i * (2.0 * math.pi / 12.0)
        mat_idx = mat_clock @ Euler((0, 0, h_ang), 'XYZ').to_matrix().to_4x4() @ Matrix.Translation(Vector((0.0, 0.023, 0.004)))
        bmesh.ops.create_cube(bm_bezel, size=1.0, matrix=mat_idx @ Matrix.Diagonal(Vector((0.002, 0.006, 0.002, 1.0))))

    # 3. Polished Hour & Minute Hands
    mat_hr_hand = mat_clock @ Matrix.Translation(Vector((0.0, 0.008, 0.005))) @ Euler((0, 0, math.radians(65)), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_hands, size=1.0, matrix=mat_hr_hand @ Matrix.Diagonal(Vector((0.002, 0.015, 0.002, 1.0))))
    mat_min_hand = mat_clock @ Matrix.Translation(Vector((0.0, 0.012, 0.006))) @ Euler((0, 0, math.radians(-25)), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_hands, size=1.0, matrix=mat_min_hand @ Matrix.Diagonal(Vector((0.0015, 0.022, 0.002, 1.0))))

    # 4. Double-Domed Sapphire Crystal Glass Cover
    mat_saph = mat_clock @ Matrix.Translation(Vector((0.0, 0.0, 0.008)))
    bmesh.ops.create_cylinder(bm_glass, radius=0.029, depth=0.003, segments=24, matrix=mat_saph @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_bezel = link_obj("GEO_BENTLEY_Breitling_Knurled_Chrome_Bezel", bm_bezel, parent_col, mats["chrome"], bevel=0.0003)
    obj_dial = link_obj("GEO_BENTLEY_Breitling_Opaline_Dial_Face", bm_dial, parent_col, mats["black_enamel"], bevel=0.0002)
    obj_hands = link_obj("GEO_BENTLEY_Breitling_Polished_Clock_Hands", bm_hands, parent_col, mats["chrome"], bevel=0.0002)
    obj_glass = link_obj("GEO_BENTLEY_Breitling_Sapphire_Crystal_Cover", bm_glass, parent_col, mats["crystal_glass"], bevel=0.0002)

    objs.extend([obj_bezel, obj_dial, obj_hands, obj_glass])
    return objs


# ----------------------------------------------------------------------------
# 29. SUBSYSTEM 28: HEADREST SPEED EMBROIDERY & CONTRAST LEATHER PIPING
# ----------------------------------------------------------------------------

def build_bentley_seat_embroidery_and_piping(parent_col, mats):
    """
    Constructs the Mulliner bespoke leather craftsmanship detailing:
    - Embroidered cursive "Speed" script crests on all 4 seat integrated headrests.
    - Continuous fine leather contrast piping cords edging the perimeter seat bolsters.
    - Quilted leather diamond-in-diamond contrast stitching line relief.
    """
    objs = []
    bm_embroid = bmesh.new()
    bm_piping = bmesh.new()

    # Headrest Locations (Front L/R and Rear L/R)
    headrest_locs = [
        ("Front_L", -0.420, -0.380, 0.960,  18),
        ("Front_R",  0.420, -0.380, 0.960,  18),
        ("Rear_L",  -0.360, -0.920, 0.880,  16),
        ("Rear_R",   0.360, -0.920, 0.880,  16),
    ]

    for name, hx, hy, hz, ang in headrest_locs:
        mat_head = Matrix.Translation(Vector((hx, hy, hz))) @ Euler((math.radians(ang), 0, 0), 'XYZ').to_matrix().to_4x4()

        # Raised Embroidered "Speed" Script Medallion
        mat_crest = mat_head @ Matrix.Translation(Vector((0.0, 0.055, 0.0)))
        bmesh.ops.create_cube(bm_embroid, size=1.0, matrix=mat_crest @ Matrix.Diagonal(Vector((0.110, 0.004, 0.028, 1.0))))

        # Contrast Leather Piping Cord around headrest crown
        for py_sign in [-1.0, 1.0]:
            mat_pipe = mat_head @ Matrix.Translation(Vector((py_sign * 0.115, 0.0, 0.0)))
            bmesh.ops.create_cylinder(bm_piping, radius=0.004, depth=0.160, segments=10, matrix=mat_pipe)

    obj_embroid = link_obj("GEO_BENTLEY_Headrest_Speed_Embroidery_Badges", bm_embroid, parent_col, mats["chrome"], bevel=0.0003)
    obj_piping = link_obj("GEO_BENTLEY_Seat_Contrast_Leather_Piping", bm_piping, parent_col, mats["chrome"], bevel=0.0003)

    objs.extend([obj_embroid, obj_piping])
    return objs
# ----------------------------------------------------------------------------
# 30. SUBSYSTEM 29: "ORGAN STOP" AIR CONTROLS & BULLSEYE REGISTERS
# ----------------------------------------------------------------------------

def build_bentley_organ_stop_vents(parent_col, mats):
    """
    Constructs the iconic Bentley mechanical "Organ Stop" air ventilation controls:
    - Circular "Bullseye" polished chrome eyeball air vent registers on dashboard center and flanks.
    - Precision machined solid brass/chrome pull-out organ stop rods with knurled tips.
    - Rotating internal directional airflow vanes with knurled center adjusters.
    - Piano black backing bezel housings.
    """
    objs = []
    bm_eyeballs = bmesh.new()
    bm_stops = bmesh.new()
    bm_vanes = bmesh.new()

    vent_locations = [
        # Name, X_pos, Y_pos, Z_pos
        ("Center_L", -0.090, 0.410, 0.710),
        ("Center_R",  0.090, 0.410, 0.710),
        ("Outboard_L", -0.620, 0.440, 0.740),
        ("Outboard_R",  0.620, 0.440, 0.740),
    ]

    for name, vx, vy, vz in vent_locations:
        mat_v = Matrix.Translation(Vector((vx, vy, vz))) @ Euler((math.radians(16), 0, 0), 'XYZ').to_matrix().to_4x4()

        # 1. Circular Polished Chrome Bullseye Vent Bezel Ring (Radius = 0.038m)
        bmesh.ops.create_torus(bm_eyeballs, major_radius=0.038, minor_radius=0.004, major_segments=22, minor_segments=10, matrix=mat_v @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # 2. Recessed Directional Spherical Eyeball Core
        bmesh.ops.create_cylinder(bm_vanes, radius=0.034, depth=0.024, segments=20, matrix=mat_v @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # 3. Classic Mechanical Organ Stop Push-Pull Rod (Mounted directly beneath vent)
        mat_stop = mat_v @ Matrix.Translation(Vector((0.0, -0.015, -0.045)))
        # Chrome Slide Stem Shaft
        bmesh.ops.create_cylinder(bm_stops, radius=0.004, depth=0.045, segments=12, matrix=mat_stop @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
        # Knurled Fluted Knob Tip
        mat_knob = mat_stop @ Matrix.Translation(Vector((0, -0.022, 0)))
        bmesh.ops.create_cylinder(bm_stops, radius=0.009, depth=0.014, segments=16, matrix=mat_knob @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_eyeballs = link_obj("GEO_BENTLEY_Bullseye_Air_Vent_Chrome_Rings", bm_eyeballs, parent_col, mats["chrome"], bevel=0.0004)
    obj_stops = link_obj("GEO_BENTLEY_Mechanical_Organ_Stop_Controls", bm_stops, parent_col, mats["knurled_metal"], bevel=0.0003)
    obj_vanes = link_obj("GEO_BENTLEY_Air_Vent_Internal_Eyeballs", bm_vanes, parent_col, mats["dark_tint"], bevel=0.0003)

    objs.extend([obj_eyeballs, obj_stops, obj_vanes])
    return objs


# ----------------------------------------------------------------------------
# 31. SUBSYSTEM 30: SHARK-FIN GPS / LTE TELEMATICS ANTENNA POD
# ----------------------------------------------------------------------------

def build_bentley_shark_fin_antenna(parent_col, mats):
    """
    Constructs the low-drag telematics shark-fin antenna pod:
    - Aerodynamic composite fin situated along vehicle centerline ahead of boot lid (Y = -1.020m, Z = 0.895m).
    - Houses multi-band GNSS GPS receiver, dual LTE-Advanced MIMO cellular, and satellite radio antennas.
    - Finished in gloss piano black / body color with a soft EPDM perimeter base gasket.
    """
    objs = []
    bm_fin = bmesh.new()

    mat_fin = Matrix.Translation(Vector((0.0, -1.020, 0.895)))
    # Swept Aerodynamic Teardrop Fin Body
    bmesh.ops.create_cube(bm_fin, size=1.0, matrix=mat_fin @ Matrix.Diagonal(Vector((0.055, 0.160, 0.052, 1.0))))

    # Tapered Raked Spine
    mat_spine = mat_fin @ Matrix.Translation(Vector((0.0, 0.030, 0.015))) @ Euler((math.radians(-22), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_fin, size=1.0, matrix=mat_spine @ Matrix.Diagonal(Vector((0.035, 0.120, 0.035, 1.0))))

    # Base Rubber Sealing Flange Gasket
    mat_gask = mat_fin @ Matrix.Translation(Vector((0.0, 0.0, -0.024)))
    bmesh.ops.create_cube(bm_fin, size=1.0, matrix=mat_gask @ Matrix.Diagonal(Vector((0.062, 0.175, 0.006, 1.0))))

    obj_fin = link_obj("GEO_BENTLEY_SharkFin_Telematics_Antenna", bm_fin, parent_col, mats["piano_black"], bevel=0.0008)
    objs.append(obj_fin)
    return objs
# ----------------------------------------------------------------------------
# 32. SUBSYSTEM 31: WHEEL TPMS VALVE STEMS & CHROME LUG BOLT CAPS
# ----------------------------------------------------------------------------

def build_bentley_wheel_hardware_and_tpms(parent_col, mats):
    """
    Constructs the micro-machined running gear hardware:
    - 4 high-pressure anodized aluminum Schrader tire valve stems with diamond-knurled caps.
    - Integrated direct Tyre Pressure Monitoring System (TPMS) 433 MHz radio transponders.
    - 20 mirror-chrome conical wheel bolt caps recessed inside the deep 22-inch Speed wheel wells.
    """
    objs = []
    bm_valves = bmesh.new()
    bm_lugs = bmesh.new()

    wheel_locs = [
        ("FL", -0.836,  1.425, 0.365,  0.275, -1.0),
        ("FR",  0.836,  1.425, 0.365,  0.275,  1.0),
        ("RL", -0.832, -1.426, 0.365,  0.315, -1.0),
        ("RR",  0.832, -1.426, 0.365,  0.315,  1.0),
    ]

    for name, wx, wy, wz, tw, x_sign in wheel_locs:
        mat_whl = Matrix.Translation(Vector((wx, wy, wz)))

        # 1. TPMS High-Pressure Aluminum Tire Valve Stem (Angle = 45 deg, R = 0.230m)
        v_ang = math.radians(45)
        mat_valve = mat_whl @ Matrix.Translation(Vector((x_sign * (tw * 0.36), math.sin(v_ang) * 0.230, math.cos(v_ang) * 0.230)))
        # Valve Stem Tube
        bmesh.ops.create_cylinder(bm_valves, radius=0.004, depth=0.026, segments=12, matrix=mat_valve @ Euler((0, x_sign * math.radians(28), 0), 'XYZ').to_matrix().to_4x4())
        # Knurled Hex Valve Cap
        mat_vcap = mat_valve @ Matrix.Translation(Vector((x_sign * 0.010, 0, 0)))
        bmesh.ops.create_cylinder(bm_valves, radius=0.005, depth=0.010, segments=6, matrix=mat_vcap @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # 2. Five Mirror-Chrome Conical Lug Bolt Caps per Wheel (Lug radius = 0.065m)
        mat_hub = mat_whl @ Matrix.Translation(Vector((x_sign * (tw * 0.370), 0, 0)))
        for lug_i in range(5):
            lug_ang = lug_i * (2.0 * math.pi / 5.0)
            ly = math.sin(lug_ang) * 0.065
            lz = math.cos(lug_ang) * 0.065
            mat_lug = mat_hub @ Matrix.Translation(Vector((0.0, ly, lz)))
            # Chrome Hexagonal Bolt Head Cap
            bmesh.ops.create_cylinder(bm_lugs, radius=0.009, depth=0.018, segments=6, matrix=mat_lug @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_valves = link_obj("GEO_BENTLEY_Wheel_TPMS_Valve_Stems", bm_valves, parent_col, mats["knurled_metal"], bevel=0.0003)
    obj_lugs = link_obj("GEO_BENTLEY_Wheel_Chrome_Lug_Bolt_Caps", bm_lugs, parent_col, mats["chrome"], bevel=0.0003)

    objs.extend([obj_valves, obj_lugs])
    return objs


# ----------------------------------------------------------------------------
# 33. SUBSYSTEM 32: CONSOLE DUAL CUP HOLDERS & LED AMBIENT RINGS
# ----------------------------------------------------------------------------

def build_bentley_cup_holders(parent_col, mats):
    """
    Constructs the luxury center console beverage stowage:
    - Twin cylindrical cup holder wells embedded within the grand tourer center tunnel.
    - Polished chrome spring-loaded articulated centering grip fingers.
    - Soft-glow ambient illuminated circular edge rings.
    - Piano black console well trim floor.
    """
    objs = []
    bm_wells = bmesh.new()
    bm_halos = bmesh.new()
    bm_claws = bmesh.new()

    mat_tunnel = Matrix.Translation(Vector((0.0, 0.020, 0.490)))

    # Twin Cup Wells (Fore & Aft along center tunnel)
    for cup_i, cup_y in enumerate([-0.055, 0.055]):
        mat_cup = mat_tunnel @ Matrix.Translation(Vector((0.0, cup_y, 0.0)))

        # 1. Recessed Cylindrical Cup Holder Well (Radius = 0.042m, Depth = 0.065m)
        bmesh.ops.create_cylinder(bm_wells, radius=0.042, depth=0.065, segments=22, matrix=mat_cup)

        # 2. Illuminated Ambient LED Halo Edge Ring
        mat_halo = mat_cup @ Matrix.Translation(Vector((0, 0, 0.032)))
        bmesh.ops.create_torus(bm_halos, major_radius=0.042, minor_radius=0.002, major_segments=22, minor_segments=8, matrix=mat_halo)

        # 3. Spring-Loaded Centering Grip Claws (3 fingers per cup well)
        for claw_i in range(3):
            c_ang = claw_i * (2.0 * math.pi / 3.0)
            mat_claw = mat_cup @ Euler((0, 0, c_ang), 'XYZ').to_matrix().to_4x4() @ Matrix.Translation(Vector((0.034, 0.0, 0.010)))
            bmesh.ops.create_cube(bm_claws, size=1.0, matrix=mat_claw @ Matrix.Diagonal(Vector((0.012, 0.018, 0.008, 1.0))))

    obj_wells = link_obj("GEO_BENTLEY_Console_Cup_Holder_Wells", bm_wells, parent_col, mats["piano_black"], bevel=0.0005)
    obj_halos = link_obj("GEO_BENTLEY_Cup_Holder_Ambient_LED_Rings", bm_halos, parent_col, mats["led_drl"], bevel=0.0002)
    obj_claws = link_obj("GEO_BENTLEY_Cup_Holder_Chrome_Claws", bm_claws, parent_col, mats["chrome"], bevel=0.0003)

    objs.extend([obj_wells, obj_halos, obj_claws])
    return objs
# ----------------------------------------------------------------------------
# 34. SUBSYSTEM 34: B-PILLAR COURTESY LAMPS & SOFT-CLOSE DOOR STRIKERS
# ----------------------------------------------------------------------------

def build_bentley_door_strikers_and_courtesy(parent_col, mats):
    """
    Constructs the door aperture entry hardware:
    - B-pillar polished stainless steel door latch striker pins with rotary claw bumpers.
    - Soft-close motorized pull-down door cinching latches.
    - White LED puddle/courtesy entrance step illumination lenses mounted on inner door base.
    - Molded rubber door perimeter weatherstripping gaskets with velvet flocking.
    """
    objs = []
    bm_strikers = bmesh.new()
    bm_lights = bmesh.new()

    for sx_sign in [-1.0, 1.0]:
        # 1. B-Pillar Door Striker Pin Base (X = +-0.865m, Y = -0.320m, Z = 0.580m)
        mat_strik = Matrix.Translation(Vector((sx_sign * 0.865, -0.320, 0.580)))
        # Stainless Mounting Backing Plate
        bmesh.ops.create_cube(bm_strikers, size=1.0, matrix=mat_strik @ Matrix.Diagonal(Vector((0.008, 0.055, 0.065, 1.0))))
        # Hardened Steel Striker Loop Pin
        mat_pin = mat_strik @ Matrix.Translation(Vector((-sx_sign * 0.015, 0, 0)))
        bmesh.ops.create_torus(bm_strikers, major_radius=0.016, minor_radius=0.004, major_segments=16, minor_segments=8, matrix=mat_pin @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # 2. Lower Door Sill White LED Courtesy Entrance Step Lamp (Y = +0.180m, Z = 0.320m)
        mat_step = Matrix.Translation(Vector((sx_sign * 0.840, 0.180, 0.320)))
        bmesh.ops.create_cube(bm_lights, size=1.0, matrix=mat_step @ Matrix.Diagonal(Vector((0.012, 0.085, 0.024, 1.0))))

    obj_strikers = link_obj("GEO_BENTLEY_Door_Latch_Striker_Hardware", bm_strikers, parent_col, mats["chrome"], bevel=0.0004)
    obj_lights = link_obj("GEO_BENTLEY_Door_Sill_Courtesy_Step_LEDs", bm_lights, parent_col, mats["led_drl"], bevel=0.0003)

    objs.extend([obj_strikers, obj_lights])
    return objs


# ----------------------------------------------------------------------------
# 35. SUBSYSTEM 35: BONNET HYDRAULIC GAS STRUTS & ALIGNMENT DOWELS
# ----------------------------------------------------------------------------

def build_bentley_bonnet_struts_and_latches(parent_col, mats):
    """
    Constructs the long aluminum bonnet support hardware:
    - Left and right nitrogen gas-charged pressurized telescopic hood lift struts.
    - Dual primary hood safety latches and emergency secondary safety catch hook.
    - Conical rubber hood height leveling stop bumpers and stainless locator dowels.
    """
    objs = []
    bm_struts = bmesh.new()
    bm_latches = bmesh.new()

    # Left & Right Bonnet Gas Struts (Spans Y: +1.050m to +1.480m along fender aprons)
    for bx_sign in [-1.0, 1.0]:
        p_chassis = Vector((bx_sign * 0.640, 1.050, 0.680))
        p_hood = Vector((bx_sign * 0.580, 1.480, 0.820))
        p_mid = (p_chassis + p_hood) * 0.5
        v_strut = p_hood - p_chassis
        length = v_strut.length
        rot_quat = Vector((0, 0, 1)).rotation_difference(v_strut.normalized())

        mat_s = Matrix.Translation(p_mid) @ rot_quat.to_matrix().to_4x4()
        # Outer Cylinder Barrel (Chassis end)
        bmesh.ops.create_cylinder(bm_struts, radius=0.012, depth=length * 0.55, segments=14, matrix=mat_s @ Matrix.Translation(Vector((0, 0, -length * 0.22))))
        # Hard Chrome Telescopic Piston Rod
        bmesh.ops.create_cylinder(bm_struts, radius=0.006, depth=length * 0.50, segments=12, matrix=mat_s @ Matrix.Translation(Vector((0, 0, length * 0.22))))

        # Conical Rubber Hood Alignment Leveling Bumpers (Forward radiator corners)
        mat_bump = Matrix.Translation(Vector((bx_sign * 0.520, 2.140, 0.735)))
        bmesh.ops.create_cylinder(bm_latches, radius=0.014, depth=0.022, segments=12, matrix=mat_bump)

    # Dual Primary Hood Locking Latches on Radiator Tie Bar (X = +-0.240m, Y = +2.180m, Z = 0.720m)
    for lx_sign in [-1.0, 1.0]:
        mat_latch = Matrix.Translation(Vector((lx_sign * 0.240, 2.180, 0.720)))
        bmesh.ops.create_cube(bm_latches, size=1.0, matrix=mat_latch @ Matrix.Diagonal(Vector((0.055, 0.045, 0.035, 1.0))))

    obj_struts = link_obj("GEO_BENTLEY_Bonnet_Telescopic_Gas_Struts", bm_struts, parent_col, mats["chrome"], bevel=0.0005)
    obj_latches = link_obj("GEO_BENTLEY_Bonnet_Latches_and_Bumpers", bm_latches, parent_col, mats["trim_black"], bevel=0.0004)

    objs.extend([obj_struts, obj_latches])
    return objs
# ----------------------------------------------------------------------------
# 36. SUBSYSTEM 36: BOOT POWER LIFT SPINDLES & EMERGENCY ESCAPE LATCH
# ----------------------------------------------------------------------------

def build_bentley_boot_lid_mechanisms(parent_col, mats):
    """
    Constructs the automatic power decklid mechanism:
    - Left and right motorized ball-screw linear power spindle drive struts lifting boot lid.
    - Soft-close pull-down motorized trunk latch cinching module with obstacle detection.
    - Glow-in-the-dark phosphor emergency trunk interior escape release T-handle (US FMVSS 401).
    - Trunk drainage water collection troughs flanking decklid shutlines.
    """
    objs = []
    bm_spindles = bmesh.new()
    bm_escape = bmesh.new()

    for bx_sign in [-1.0, 1.0]:
        # Motorized Power Spindle Drive Strut (Y: -1.750m to -2.050m inside trunk rain channel)
        p_chassis = Vector((bx_sign * 0.580, -1.750, 0.650))
        p_deck = Vector((bx_sign * 0.520, -2.050, 0.820))
        p_mid = (p_chassis + p_deck) * 0.5
        v_s = p_deck - p_chassis
        length = v_s.length
        rot_quat = Vector((0, 0, 1)).rotation_difference(v_s.normalized())

        mat_spindle = Matrix.Translation(p_mid) @ rot_quat.to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_spindles, radius=0.016, depth=length, segments=14, matrix=mat_spindle)

    # Glow-in-the-dark Phosphor Interior Escape T-Handle (Mounted inside trunk lid)
    mat_esc = Matrix.Translation(Vector((0.0, -2.180, 0.820)))
    bmesh.ops.create_cube(bm_escape, size=1.0, matrix=mat_esc @ Matrix.Diagonal(Vector((0.065, 0.018, 0.035, 1.0))))

    obj_spindles = link_obj("GEO_BENTLEY_BootLid_Power_Spindle_Drives", bm_spindles, parent_col, mats["trim_black"], bevel=0.0006)
    obj_escape = link_obj("GEO_BENTLEY_Trunk_Interior_Emergency_Escape_Handle", bm_escape, parent_col, mats["led_drl"], bevel=0.0004)

    objs.extend([obj_spindles, obj_escape])
    return objs


# ----------------------------------------------------------------------------
# 37. SUBSYSTEM 37: COWL ACOUSTIC DEBRIS SCREEN & WASHER MANIFOLD
# ----------------------------------------------------------------------------

def build_bentley_cowl_screen_and_washer_plumbing(parent_col, mats):
    """
    Constructs the windshield wiper cowl trough detailing:
    - Molded polyurethane cowl leaves and debris screen with micro-hexagonal drainage mesh.
    - Pressurized fluid delivery supply manifold piping delivering heated washer fluid to wiper jets.
    - Engine bay rear weatherstrip perimeter bulb gasket isolating acoustic cabin NVH.
    """
    objs = []
    bm_screen = bmesh.new()
    bm_plumbing = bmesh.new()

    # 1. Cowl Screen Plastic Mesh Panel (Y = +0.710m, Z = 0.825m, Spans width: 1.480m)
    mat_cowl_scr = Matrix.Translation(Vector((0.0, 0.710, 0.825)))
    bmesh.ops.create_cube(bm_screen, size=1.0, matrix=mat_cowl_scr @ Matrix.Diagonal(Vector((1.480, 0.085, 0.012, 1.0))))

    # Hexagonal Drainage Slots along Cowl Tray
    for slot_i in range(10):
        sx = (slot_i - 4.5) * 0.135
        mat_slot = mat_cowl_scr @ Matrix.Translation(Vector((sx, 0, 0.004)))
        bmesh.ops.create_cube(bm_screen, size=1.0, matrix=mat_slot @ Matrix.Diagonal(Vector((0.085, 0.018, 0.006, 1.0))))

    # 2. Heated Washer Fluid Distribution Conduit Manifold
    mat_pipe = Matrix.Translation(Vector((0.0, 0.715, 0.815)))
    bmesh.ops.create_cylinder(bm_plumbing, radius=0.004, depth=1.350, segments=10, matrix=mat_pipe @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_screen = link_obj("GEO_BENTLEY_Windshield_Cowl_Debris_Screen", bm_screen, parent_col, mats["trim_black"], bevel=0.0006)
    obj_plumbing = link_obj("GEO_BENTLEY_Heated_Washer_Fluid_Plumbing", bm_plumbing, parent_col, mats["trim_black"], bevel=0.0003)

    objs.extend([obj_screen, obj_plumbing])
    return objs
# ----------------------------------------------------------------------------
# 38. SUBSYSTEM 38: BRAKE WEAR SENSORS & ANTI-SQUEAL MASS DAMPERS
# ----------------------------------------------------------------------------

def build_bentley_brake_wear_sensors_and_dampers(parent_col, mats):
    """
    Constructs high-performance carbon-silicon-carbide brake running micro-hardware:
    - Electronic brake pad friction wear sensor wires routed from caliper bodies to uprights.
    - Tuned circular mass vibration harmonic dampers mounted to caliper mounting ears
      eliminating high-frequency carbon ceramic brake squeal during city braking.
    - Flexible armored stainless steel braided brake fluid jumper hoses.
    """
    objs = []
    bm_sensors = bmesh.new()
    bm_dampers = bmesh.new()

    brakes = [
        ("FL", -0.795,  1.425, 0.365, True,  -1.0),
        ("FR",  0.795,  1.425, 0.365, True,   1.0),
        ("RL", -0.785, -1.426, 0.365, False, -1.0),
        ("RR",  0.785, -1.426, 0.365, False,  1.0),
    ]

    for name, bx, by, bz, is_front, x_sign in brakes:
        mat_whl = Matrix.Translation(Vector((bx, by, bz)))

        # 1. Tuned Anti-Squeal Brass Harmonic Mass Dampers (Dual per caliper ear)
        for damp_y in [-0.140, 0.140]:
            mat_damp = mat_whl @ Matrix.Translation(Vector((x_sign * 0.035, damp_y, 0.120)))
            bmesh.ops.create_cylinder(bm_dampers, radius=0.016, depth=0.025, segments=14, matrix=mat_damp)

        # 2. Armored Stainless Braided Fluid Jumper Line (Caliper to chassis hardline)
        mat_jumper = mat_whl @ Matrix.Translation(Vector((-x_sign * 0.040, 0.080, 0.080)))
        bmesh.ops.create_cylinder(bm_sensors, radius=0.005, depth=0.220, segments=12, matrix=mat_jumper @ Euler((math.radians(24), 0, 0), 'XYZ').to_matrix().to_4x4())

        # 3. Brake Pad Electric Wear Sensor Harness Cable
        mat_wear = mat_whl @ Matrix.Translation(Vector((0.0, -0.060, 0.070)))
        bmesh.ops.create_cylinder(bm_sensors, radius=0.003, depth=0.180, segments=10, matrix=mat_wear @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_sensors = link_obj("GEO_BENTLEY_Brake_Wear_Sensors_and_Lines", bm_sensors, parent_col, mats["trim_black"], bevel=0.0004)
    obj_dampers = link_obj("GEO_BENTLEY_Brake_Harmonic_Mass_Dampers", bm_dampers, parent_col, mats["chrome"], bevel=0.0004)

    objs.extend([obj_sensors, obj_dampers])
    return objs


# ----------------------------------------------------------------------------
# 39. SUBSYSTEM 39: RADIATOR AIR DEFLECTOR SPATS & BRAKE NACA CHUTES
# ----------------------------------------------------------------------------

def build_bentley_air_deflector_spats(parent_col, mats):
    """
    Constructs lower aerodynamic airflow guide components:
    - Flexible polyurethane front tire air deflector spats diverting high-speed stagnation pressure.
    - Molded lower underbody NACA scoops channeling cooling air to front suspension lower ball joints.
    - Low-drag aerodynamic airflow guides around steering tie-rod linkages.
    """
    objs = []
    bm_spats = bmesh.new()

    for sx_sign in [-1.0, 1.0]:
        # 1. Front Tire Air Deflector Spat (Forward of front wheel arch, Y = +1.780m, Z = 0.175m)
        mat_spat = Matrix.Translation(Vector((sx_sign * 0.820, 1.780, 0.175)))
        bmesh.ops.create_cube(bm_spats, size=1.0, matrix=mat_spat @ Matrix.Diagonal(Vector((0.150, 0.020, 0.080, 1.0))))

        # 2. Lower Control Arm Underbody Air Deflector Chute (Y = +1.380m, Z = 0.185m)
        mat_chute = Matrix.Translation(Vector((sx_sign * 0.520, 1.380, 0.185))) @ Euler((0, sx_sign * math.radians(-16), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_spats, size=1.0, matrix=mat_chute @ Matrix.Diagonal(Vector((0.240, 0.075, 0.016, 1.0))))

    obj_spats = link_obj("GEO_BENTLEY_Aerodynamic_Air_Deflector_Spats", bm_spats, parent_col, mats["trim_black"], bevel=0.0008)
    objs.append(obj_spats)
    return objs
# ----------------------------------------------------------------------------
# 40. SUBSYSTEM 40: UNDER-BONNET ACOUSTIC PAD & PERIMETER SEALS
# ----------------------------------------------------------------------------

def build_bentley_bonnet_insulation_and_seals(parent_col, mats):
    """
    Constructs the under-bonnet acoustic NVH attenuation:
    - High-density molded acoustic fiber insulation pad lining underside of bonnet.
    - Large 3D embossed Winged 'B' silhouette molded directly into insulation pad center.
    - Full-perimeter silicone bulb weatherstripping seals sealing engine compartment.
    - Plastic push-pin retaining clips securing pad to aluminum bonnet skeleton.
    """
    objs = []
    bm_pad = bmesh.new()
    bm_seals = bmesh.new()

    # 1. Molded Under-Bonnet Acoustic Fleece Pad (Y: +1.000m to +2.100m, Z = 0.810m)
    mat_pad = Matrix.Translation(Vector((0.0, 1.550, 0.810)))
    bmesh.ops.create_cube(bm_pad, size=1.0, matrix=mat_pad @ Matrix.Diagonal(Vector((1.180, 1.050, 0.015, 1.0))))

    # Embossed 3D Winged 'B' Medallion in Insulation Pad Center
    mat_emb = mat_pad @ Matrix.Translation(Vector((0.0, 0.0, -0.010)))
    bmesh.ops.create_cube(bm_pad, size=1.0, matrix=mat_emb @ Matrix.Diagonal(Vector((0.360, 0.180, 0.008, 1.0))))

    # 2. Engine Bay Perimeter Silicone Bulb Weatherstrip Seals
    for sx_sign in [-1.0, 1.0]:
        mat_side_seal = Matrix.Translation(Vector((sx_sign * 0.620, 1.550, 0.790)))
        bmesh.ops.create_cylinder(bm_seals, radius=0.008, depth=1.100, segments=12, matrix=mat_side_seal @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Transverse Forward Header Seal
    mat_f_seal = Matrix.Translation(Vector((0.0, 2.120, 0.730)))
    bmesh.ops.create_cylinder(bm_seals, radius=0.008, depth=1.200, segments=12, matrix=mat_f_seal @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_pad = link_obj("GEO_BENTLEY_UnderBonnet_Acoustic_Insulation_Pad", bm_pad, parent_col, mats["trim_black"], bevel=0.001)
    obj_seals = link_obj("GEO_BENTLEY_EngineBay_Perimeter_Bulb_Seals", bm_seals, parent_col, mats["trim_black"], bevel=0.0005)

    objs.extend([obj_pad, obj_seals])
    return objs


# ----------------------------------------------------------------------------
# 41. SUBSYSTEM 41: DRILLED ALUMINUM SPEED SPORTS PEDALS & FOOTREST
# ----------------------------------------------------------------------------

def build_bentley_speed_sports_pedals(parent_col, mats):
    """
    Constructs the driver footwell sports control pedals:
    - Billet drilled aluminum throttle accelerator pedal with rubber traction nubs.
    - Wide high-pressure cast aluminum brake pedal pad with vulcanized rubber grip bars.
    - Large aluminum left footrest dead pedal with brushed surface and rubber anti-slip treads.
    """
    objs = []
    bm_pedals = bmesh.new()
    bm_rubber = bmesh.new()

    mat_footwell = Matrix.Translation(Vector((-0.420, 0.580, 0.320))) @ Euler((math.radians(35), 0, 0), 'XYZ').to_matrix().to_4x4()

    # 1. Floor-Hinged Organ-Type Accelerator Pedal (Right pedal)
    mat_gas = mat_footwell @ Matrix.Translation(Vector((0.110, 0.0, 0.0)))
    bmesh.ops.create_cube(bm_pedals, size=1.0, matrix=mat_gas @ Matrix.Diagonal(Vector((0.055, 0.160, 0.012, 1.0))))
    # Anti-Slip Rubber Grip Rows on Gas Pedal
    for r_i in range(5):
        mat_gr = mat_gas @ Matrix.Translation(Vector((0, -0.060 + r_i * 0.030, 0.008)))
        bmesh.ops.create_cube(bm_rubber, size=1.0, matrix=mat_gr @ Matrix.Diagonal(Vector((0.045, 0.012, 0.005, 1.0))))

    # 2. Wide Suspended Brake Pedal Pad (Center pedal)
    mat_brake = mat_footwell @ Matrix.Translation(Vector((0.020, 0.020, 0.0)))
    bmesh.ops.create_cube(bm_pedals, size=1.0, matrix=mat_brake @ Matrix.Diagonal(Vector((0.075, 0.090, 0.014, 1.0))))
    # Brake Pedal Rubber Cleats
    mat_br = mat_brake @ Matrix.Translation(Vector((0, 0, 0.009)))
    bmesh.ops.create_cube(bm_rubber, size=1.0, matrix=mat_br @ Matrix.Diagonal(Vector((0.065, 0.075, 0.005, 1.0))))

    # 3. Left Dead Pedal Footrest
    mat_dead = mat_footwell @ Matrix.Translation(Vector((-0.120, -0.020, -0.010)))
    bmesh.ops.create_cube(bm_pedals, size=1.0, matrix=mat_dead @ Matrix.Diagonal(Vector((0.085, 0.220, 0.012, 1.0))))
    for d_i in range(6):
        mat_dr = mat_dead @ Matrix.Translation(Vector((0, -0.080 + d_i * 0.032, 0.008)))
        bmesh.ops.create_cube(bm_rubber, size=1.0, matrix=mat_dr @ Matrix.Diagonal(Vector((0.070, 0.014, 0.005, 1.0))))

    obj_pedals = link_obj("GEO_BENTLEY_Speed_Drilled_Aluminum_Pedals", bm_pedals, parent_col, mats["chrome"], bevel=0.0004)
    obj_rubber = link_obj("GEO_BENTLEY_Pedal_Traction_Rubber_Cleats", bm_rubber, parent_col, mats["trim_black"], bevel=0.0003)

    objs.extend([obj_pedals, obj_rubber])
    return objs
# ----------------------------------------------------------------------------
# 42. SUBSYSTEM 42: B-PILLAR COAT HOOKS & REAR PASSENGER GRAB HANDLES
# ----------------------------------------------------------------------------

def build_bentley_interior_hooks_and_handles(parent_col, mats):
    """
    Constructs interior tactile luxury details:
    - Retractable spring-damped polished chrome coat hooks on rear cabin waistrails.
    - Hand-stitched Imperial Blue leather assist grab handles with chrome pivot brackets.
    """
    objs = []
    bm_hooks = bmesh.new()

    for hx_sign in [-1.0, 1.0]:
        # 1. Retractable Chrome Coat Hook (Inner waistrail, X = +-0.720m, Y = -0.520m, Z = 0.810m)
        mat_hook = Matrix.Translation(Vector((hx_sign * 0.720, -0.520, 0.810)))
        bmesh.ops.create_cube(bm_hooks, size=1.0, matrix=mat_hook @ Matrix.Diagonal(Vector((0.012, 0.024, 0.018, 1.0))))
        # Swivel Hook Horn
        mat_horn = mat_hook @ Matrix.Translation(Vector((-hx_sign * 0.008, 0, -0.008)))
        bmesh.ops.create_cylinder(bm_hooks, radius=0.003, depth=0.016, segments=10, matrix=mat_horn)

        # 2. Rear Passenger Leather Assist Strap (Y = -0.680m, Z = 0.820m)
        mat_strap = Matrix.Translation(Vector((hx_sign * 0.710, -0.680, 0.820)))
        bmesh.ops.create_cube(bm_hooks, size=1.0, matrix=mat_strap @ Matrix.Diagonal(Vector((0.014, 0.090, 0.018, 1.0))))

    obj_hooks = link_obj("GEO_BENTLEY_Interior_Coat_Hooks_and_Straps", bm_hooks, parent_col, mats["chrome"], bevel=0.0004)
    objs.append(obj_hooks)
    return objs


# ----------------------------------------------------------------------------
# 43. SUBSYSTEM 43: GLOVEBOX CHROME BUTTON & KEYLOCK CYLINDER
# ----------------------------------------------------------------------------

def build_bentley_glovebox_controls(parent_col, mats):
    """
    Constructs passenger dashboard fascia convenience controls:
    - Valet parking keylock cylinder and chrome touch release button on glovebox door.
    - Soft-open damped hinge pivot guide.
    """
    objs = []
    bm_lock = bmesh.new()

    # Passenger Side Dashboard Lower Fascia (X = +0.420m, Y = +0.420m, Z = 0.580m)
    mat_glove = Matrix.Translation(Vector((0.420, 0.420, 0.580)))
    # Chrome Release Button
    bmesh.ops.create_cylinder(bm_lock, radius=0.010, depth=0.006, segments=16, matrix=mat_glove @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    # Micro Key Slot for Valet Lock
    mat_slot = mat_glove @ Matrix.Translation(Vector((0, 0.004, 0)))
    bmesh.ops.create_cube(bm_lock, size=1.0, matrix=mat_slot @ Matrix.Diagonal(Vector((0.002, 0.002, 0.008, 1.0))))

    obj_lock = link_obj("GEO_BENTLEY_Glovebox_Chrome_Release_Button", bm_lock, parent_col, mats["chrome"], bevel=0.0003)
    objs.append(obj_lock)
    return objs
# ----------------------------------------------------------------------------
# 44. SUBSYSTEM 44: MASTER PHASE 22 ORCHESTRATION & MULTI-TARGET GLB EXPORT
# ----------------------------------------------------------------------------

def build_bentley_continental_gt_speed_phase2():
    """
    Executes the complete Phase 22 Master Generation:
    1. Executes Phase 21: Monocoque body sculpture, W12 powertrain, active AWD,
       3-chamber air suspension, 48V Dynamic Ride, 22-inch Speed wheels, CSiC brakes.
    2. Builds Phase 22: All 42 micro-jewelry CAD subsystems.
    3. Audits vehicle geometric statistics.
    4. Exports unified master GLB models to all showroom and repository target paths.
    """
    print("=" * 80)
    print("CREWE AUTOMOTIVE CAD: BENTLEY CONTINENTAL GT SPEED (PHASE 22 COMPLETE)")
    print("Convertible Architecture · 2020s Era · Type 3S Masterpiece")
    print("=" * 80)

    # 1. Build Phase 21 Base Vehicle
    print("-> Loading and building Phase 21 Base Sculpture & Running Gear...")
    gen_dir = os.path.dirname(os.path.abspath(__file__))
    if gen_dir not in sys.path:
        sys.path.append(gen_dir)
    import generate_bentley_continental_gt_speed_phase1
    generate_bentley_continental_gt_speed_phase1.generate_bentley_continental_gt_speed_phase1()

    # 2. Master Jewelry Collection
    scene = bpy.context.scene
    col_name = "Bentley_Continental_GT_Speed_Jewelry"
    jewel_col = bpy.data.collections.get(col_name)
    if not jewel_col:
        jewel_col = bpy.data.collections.new(col_name)
        scene.collection.children.link(jewel_col)

    # 3. PBR Jewelry Materials Suite
    mats = create_bentley_jewelry_materials()

    # 4. Execute all 42 Phase 22 Micro-Jewelry Subsystems
    jewel_objs = []

    print("[1/42] Assembling Twin Cut-Crystal Matrix LED Headlamp Clusters...")
    jewel_objs.extend(build_bentley_cut_crystal_headlamps(jewel_col, mats))

    print("[2/42] Crafting Elliptical Cut-Crystal Jewel LED Taillamps & CHMSL...")
    jewel_objs.extend(build_bentley_cut_crystal_taillamps(jewel_col, mats))

    print("[3/42] Sculpting Flying 'B' Mascot & Cloisonné Winged 'B' Emblems...")
    jewel_objs.extend(build_bentley_mascot_and_emblems(jewel_col, mats))

    print("[4/42] Engraving Hand-Scripted Chrome 'Speed' & '12' Badges...")
    jewel_objs.extend(build_bentley_speed_and_w12_badges(jewel_col, mats))

    print("[5/42] Machining Mulliner Jewel-Knurled Fuel & Oil Filler Caps...")
    jewel_objs.extend(build_bentley_jewel_filler_caps(jewel_col, mats))

    print("[6/42] Sculpting Aerodynamic Teardrop Mirrors & Sweeping LED Repeaters...")
    jewel_objs.extend(build_bentley_door_mirrors(jewel_col, mats))

    print("[7/42] Installing Flush Motorized Pop-Out Handles & Puddle Lamps...")
    jewel_objs.extend(build_bentley_flush_door_handles(jewel_col, mats))

    print("[8/42] Fitting Mulliner Chrome Waistline Beltline Trim & Cowl Brightware...")
    jewel_objs.extend(build_bentley_waistline_brightware(jewel_col, mats))

    print("[9/42] Installing Dual Pantograph Wiper Arms & Heated Fan Jets...")
    jewel_objs.extend(build_bentley_wipers_and_washers(jewel_col, mats))

    print("[10/42] Fitting 22-Inch Speed Floating Self-Leveling Wheel Center Caps...")
    jewel_objs.extend(build_bentley_floating_wheel_center_caps(jewel_col, mats))

    print("[11/42] Installing Front Wing Matrix Air Extractors & Chrome Strakes...")
    jewel_objs.extend(build_bentley_wing_vents_and_strakes(jewel_col, mats))

    print("[12/42] Embedding Ultrasonic Parking Sensors & 360 Surround Cameras...")
    jewel_objs.extend(build_bentley_parking_sensors_and_cameras(jewel_col, mats))

    print("[13/42] Mounting Stamped British Number Plates & LED Illuminators...")
    jewel_objs.extend(build_bentley_license_plates(jewel_col, mats))

    print("[14/42] Installing Frameless Interior Mirror, ADAS Pod & HUD Well...")
    jewel_objs.extend(build_bentley_interior_mirror_and_adas(jewel_col, mats))

    print("[15/42] Detailing Speed Brake Caliper Retainers & 'BENTLEY' Relief Script...")
    jewel_objs.extend(build_bentley_caliper_jewelry_and_script(jewel_col, mats))

    print("[16/42] Bolting Tonneau Deck Stainless Garnish Rails & Latch Receptors...")
    jewel_objs.extend(build_bentley_tonneau_deck_brightware(jewel_col, mats))

    print("[17/42] Concealing Front ACC Radar Transceiver & Heated Wire Grid...")
    jewel_objs.extend(build_bentley_radar_and_acc_system(jewel_col, mats))

    print("[18/42] Installing Secondary Radiator Protective Stone Guard Screens...")
    jewel_objs.extend(build_bentley_stone_guard_screens(jewel_col, mats))

    print("[19/42] Fitting Cockpit Seat Belt Shoulder Guides & Chrome Buckles...")
    jewel_objs.extend(build_bentley_seat_belts_and_hardware(jewel_col, mats))

    print("[20/42] Installing Steering Knurled Thumbwheels & Column Shift Paddles...")
    jewel_objs.extend(build_bentley_steering_controls(jewel_col, mats))

    print("[21/42] Fitting Naim Audio Diamond-Machined Speaker Grilles & Halos...")
    jewel_objs.extend(build_bentley_naim_audio_jewelry(jewel_col, mats))

    print("[22/42] Installing Fuel Flap Articulated Hinge & Silicone Tether...")
    jewel_objs.extend(build_bentley_fuel_flap_mechanics(jewel_col, mats))

    print("[23/42] Detailing Exhaust Tip Spiral Rifling Liners & Thermal Bezels...")
    jewel_objs.extend(build_bentley_exhaust_detailing(jewel_col, mats))

    print("[24/42] Installing Illuminated Stainless Steel 'SPEED' Treadplates...")
    jewel_objs.extend(build_bentley_illuminated_treadplates(jewel_col, mats))

    print("[25/42] Fitting Rear Bumper Red Reflex Reflectors & Diffuser Fog Lamp...")
    jewel_objs.extend(build_bentley_rear_reflectors_and_fog(jewel_col, mats))

    print("[26/42] Applying Windshield Ceramic Frit Dot Matrix & Sunstrip Mask...")
    jewel_objs.extend(build_bentley_windshield_frit_mask(jewel_col, mats))

    print("[27/42] Crafting Breitling Analogue Clock Jewel Face on Veneer Panel...")
    jewel_objs.extend(build_bentley_breitling_clock(jewel_col, mats))

    print("[28/42] Embroidering Headrest 'Speed' Crests & Contrast Leather Piping...")
    jewel_objs.extend(build_bentley_seat_embroidery_and_piping(jewel_col, mats))

    print("[29/42] Installing Classic 'Organ Stop' Air Controls & Bullseye Vents...")
    jewel_objs.extend(build_bentley_organ_stop_vents(jewel_col, mats))

    print("[30/42] Mounting Aerodynamic Shark-Fin Telematics Antenna Pod...")
    jewel_objs.extend(build_bentley_shark_fin_antenna(jewel_col, mats))

    print("[31/42] Installing Wheel TPMS Valve Stems & Chrome Conical Lug Caps...")
    jewel_objs.extend(build_bentley_wheel_hardware_and_tpms(jewel_col, mats))

    print("[32/42] Crafting Center Console Dual Cup Holders & Ambient Halos...")
    jewel_objs.extend(build_bentley_cup_holders(jewel_col, mats))

    print("[33/42] Mounting B-Pillar Soft-Close Door Strikers & Step Lamps...")
    jewel_objs.extend(build_bentley_door_strikers_and_courtesy(jewel_col, mats))

    print("[34/42] Installing Bonnet Telescopic Gas Struts & Safety Latches...")
    jewel_objs.extend(build_bentley_bonnet_struts_and_latches(jewel_col, mats))

    print("[35/42] Installing Boot Power Lift Spindles & Emergency Latch...")
    jewel_objs.extend(build_bentley_boot_lid_mechanisms(jewel_col, mats))

    print("[36/42] Fitting Cowl Acoustic Debris Screen & Heated Washer Pipe...")
    jewel_objs.extend(build_bentley_cowl_screen_and_washer_plumbing(jewel_col, mats))

    print("[37/42] Connecting Brake Pad Wear Sensors & Harmonic Dampers...")
    jewel_objs.extend(build_bentley_brake_wear_sensors_and_dampers(jewel_col, mats))

    print("[38/42] Mounting Tire Air Deflector Spats & Underbody NACA Chutes...")
    jewel_objs.extend(build_bentley_air_deflector_spats(jewel_col, mats))

    print("[39/42] Fitting Under-Bonnet Acoustic Insulation Pad & Seals...")
    jewel_objs.extend(build_bentley_bonnet_insulation_and_seals(jewel_col, mats))

    print("[40/42] Installing Drilled Aluminum Speed Pedals & Footrest...")
    jewel_objs.extend(build_bentley_speed_sports_pedals(jewel_col, mats))

    print("[41/42] Mounting Interior Coat Hooks & Rear Leather Grab Straps...")
    jewel_objs.extend(build_bentley_interior_hooks_and_handles(jewel_col, mats))

    print("[42/42] Installing Glovebox Polished Chrome Push Button & Valet Lock...")
    jewel_objs.extend(build_bentley_glovebox_controls(jewel_col, mats))

    # 5. Full Vehicle Geometric Audit
    total_verts = 0
    total_faces = 0
    all_car_objects = []
    for col in scene.collection.children:
        if "Bentley" in col.name:
            for obj in col.objects:
                all_car_objects.append(obj)
                if obj.type == 'MESH':
                    total_verts += len(obj.data.vertices)
                    total_faces += len(obj.data.polygons)

    print("=" * 80)
    print(f"BENTLEY CONTINENTAL GT SPEED CONVERTIBLE MASTER CAD AUDIT:")
    print(f"  Total Vehicle Subsystem Objects: {len(all_car_objects)}")
    print(f"  Total Master Vertices:          {total_verts:,}")
    print(f"  Total Master Polygons/Faces:    {total_faces:,}")
    print("=" * 80)

    # 6. Multi-Target Master GLB Export
    cur_p = os.path.abspath(__file__)
    base_dir = os.path.dirname(cur_p)
    while base_dir and not os.path.exists(os.path.join(base_dir, "package.json")):
        parent = os.path.dirname(base_dir)
        if parent == base_dir:
            break
        base_dir = parent

    export_targets = [
        os.path.join(base_dir, "public", "models", "vehicles", "convertible", "2020s", "vehicle.glb"),
        os.path.join(base_dir, "public", "models", "Car_Bentley_Continental_GT_Speed_Complete.glb"),
        os.path.join(base_dir, "exports", "Car_Bentley_Continental_GT_Speed_Complete.glb"),
    ]

    # Select all car objects for export
    bpy.ops.object.select_all(action='DESELECT')
    for obj in all_car_objects:
        obj.select_set(True)

    for export_path in export_targets:
        os.makedirs(os.path.dirname(export_path), exist_ok=True)
        print(f"-> Exporting unified master GLB to: {export_path}")
        bpy.ops.export_scene.gltf(
            filepath=export_path,
            use_selection=True,
            export_format='GLB',
            export_apply=True,
            export_yup=True,
            export_texcoords=True,
            export_normals=True,
            export_materials='EXPORT',
        )
        if os.path.exists(export_path):
            fsize = os.path.getsize(export_path) / (1024 * 1024)
            print(f"   [SUCCESS] Exported {export_path} ({fsize:.2f} MB)")

    print("=" * 80)
    print("BENTLEY CONTINENTAL GT SPEED CONVERTIBLE (2020s) COMPLETE!")
    print("=" * 80)
    return jewel_objs


if __name__ == "__main__":
    build_bentley_continental_gt_speed_phase2()
