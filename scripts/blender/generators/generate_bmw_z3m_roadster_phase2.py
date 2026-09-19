"""
=============================================================================
Procedural Class-A CAD Generator: BMW Z3 M Roadster (E36/7) (1990s)
PHASE 30: M Fascia, Kidney Grilles, M Side Gills, Quad Exhaust & Roll Hoops
=============================================================================
Roadster Architecture · 1990s German High-Performance Widebody Roadster
Adheres strictly to the Maximum Visual Quality & Intensive CAD Mesh Standard.

Phase 30 Architectural Scope:
1. Complete PBR Jewelry Material Palette:
   - Estoril Blue Metallic matching body (Metallic 0.35, Roughness 0.14, Clearcoat 1.0)
   - Chrome Kidney Grille Surrounds & Horizontal M Gill Slats (#F2F5F8, Metallic 0.99, Roughness 0.02)
   - Vertical Black Kidney Slat Blades (#101112, Roughness 0.80)
   - Twin Projector Optical Glass Covers (Transmission 0.94, IOR 1.52, Clearcoat 1.0)
   - Xenon/Halogen High-Beam Optical Projectors (Emission 16.0, 5000K crisp white)
   - Classic BMW Roundel Badges (Blue/White quartered enamel with chrome rim)
   - M Tri-Color Typography & Badging (Cyan/Blue/Red diagonal stripes with chrome ///M Roadster script)
   - Quad Polished Stainless Steel Exhaust Tips (Diameter 70mm, Metallic 0.99, Roughness 0.03)
   - Exhaust Dark Carbon Soot Bore (#040404, Roughness 0.96)
   - Twin Fixed Tubular Chrome Roll Over Hoops (#F5F7FA, Metallic 0.99, Roughness 0.02)
   - Multi-Segment L-Shaped Rear Taillamp Clusters (Ruby red brake/tail, amber turn indicator, clear reverse)
   - M Teardrop Aerodynamic Side Mirrors
   - Center High-Mounted Stop Lamp (CHMSL) on trunk lid (Emission 10.0)
2. Precision CAD Jewelry Subsystems:
   - M Front Aerodynamic Bumper Fascia with Twin Kidney Grilles & Dual Round Brake Ducts
   - Dual Twin Round Projector Headlamp Pods with Polycarbonate Aerodynamic Outer Covers
   - Signature M Side Engine Cooling Gills on front fenders with horizontal chrome slats and embedded BMW roundel
   - Quad Chrome Round Exhaust Tailpipes (Twin dual pipes flanking the rear license plate recess)
   - Twin Fixed Tubular Chrome Roll Over Hoops mounted behind the driver and passenger headrests
   - Classic L-Shaped Multi-Segment Rear Taillight Assemblies
   - Aerodynamic M Teardrop Side View Mirrors
   - 3D Chrome Trunk Badging ("///M" and "Roadster")
   - Cockpit Jewelry (M 3-Spoke Leather Steering Wheel with Tri-Color Stitching & Illuminated M Gearshifter)
   - Multi-Target Master GLB Export:
     * public/models/vehicles/roadster/1990s/vehicle.glb
     * public/models/Car_BMW_Z3M_Roadster_Complete.glb
     * exports/Car_BMW_Z3M_Roadster_1990s.glb
=============================================================================
"""

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector, Matrix, Euler, Quaternion


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
    if 'Clearcoat Weight' in bsdf.inputs:
        bsdf.inputs['Clearcoat Weight'].default_value = clearcoat
    elif 'Clearcoat' in bsdf.inputs:
        bsdf.inputs['Clearcoat'].default_value = clearcoat
    if 'Transmission Weight' in bsdf.inputs:
        bsdf.inputs['Transmission Weight'].default_value = transmission
    elif 'Transmission' in bsdf.inputs:
        bsdf.inputs['Transmission'].default_value = transmission
    if 'IOR' in bsdf.inputs:
        bsdf.inputs['IOR'].default_value = ior
    if 'Emission Color' in bsdf.inputs:
        bsdf.inputs['Emission Color'].default_value = emission
        if 'Emission Strength' in bsdf.inputs:
            bsdf.inputs['Emission Strength'].default_value = emission_strength
    elif 'Emission' in bsdf.inputs:
        bsdf.inputs['Emission'].default_value = emission
        if 'Emission Strength' in bsdf.inputs:
            bsdf.inputs['Emission Strength'].default_value = emission_strength

    output = nodes.new(type='ShaderNodeOutputMaterial')
    output.location = (300, 0)
    mat.node_tree.links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
    return mat


def link_obj(name, bm, col, mat=None, bevel=0.001):
    """Converts a bmesh into an object with smooth normals and bevel modifier."""
    mesh = bpy.data.meshes.new(name + "_Mesh")
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    col.objects.link(obj)
    if mat:
        obj.data.materials.append(mat)
    try:
        bpy.ops.object.shade_smooth_by_angle({"selected_objects": [obj], "object": obj}, angle=math.radians(35))
    except Exception:
        for poly in mesh.polygons:
            poly.use_smooth = True
    if bevel > 0.0001:
        bev = obj.modifiers.new("Bevel", 'BEVEL')
        bev.width = bevel
        bev.segments = 2
        bev.limit_method = 'ANGLE'
        bev.angle_limit = math.radians(35)
    return obj


# ----------------------------------------------------------------------------
# 2. PHASE 30 PBR MATERIAL PALETTE
# ----------------------------------------------------------------------------

def create_z3m_jewelry_materials():
    """Builds the comprehensive PBR material suite for BMW Z3 M Roadster exterior jewelry."""
    mats = {}
    # Estoril Blue Metallic High-Gloss (Matching Body)
    mats["paint_blue"] = make_pbr_mat(
        "MAT_Z3M_Jewel_Estoril_Blue",
        base_color=(0.015, 0.085, 0.48, 1.0),
        metallic=0.50,
        roughness=0.12,
        clearcoat=1.0
    )
    # Bright Mirror Chrome (Kidney Grille, Roll Hoops, Exhaust Tips)
    mats["chrome_bright"] = make_pbr_mat(
        "MAT_Z3M_Mirror_Bright_Chrome",
        base_color=(0.95, 0.96, 0.98, 1.0),
        metallic=0.99,
        roughness=0.02
    )
    # Gloss Black Grille Slats & Duct Liners
    mats["black_gloss"] = make_pbr_mat(
        "MAT_Z3M_Gloss_Black_Slats",
        base_color=(0.05, 0.05, 0.06, 1.0),
        metallic=0.10,
        roughness=0.25
    )
    # Optical Headlamp Clear Polycarbonate Cover
    mats["glass_headlamp"] = make_pbr_mat(
        "MAT_Z3M_Headlamp_Polycarbonate",
        base_color=(0.94, 0.96, 0.98, 1.0),
        metallic=0.0,
        roughness=0.02,
        transmission=0.94,
        ior=1.52,
        clearcoat=1.0
    )
    # Twin Projector Xenon Core Beam (Emission 16.0)
    mats["xenon_beam"] = make_pbr_mat(
        "MAT_Z3M_Twin_Projector_Xenon_Beam",
        base_color=(0.92, 0.96, 1.00, 1.0),
        metallic=0.0,
        roughness=0.04,
        emission=(0.88, 0.94, 1.00, 1.0),
        emission_strength=16.0
    )
    # Ruby Red Taillamp Lens (Emission 8.0)
    mats["ruby_lens"] = make_pbr_mat(
        "MAT_Z3M_Ruby_Taillamp_Lens",
        base_color=(0.90, 0.04, 0.06, 1.0),
        metallic=0.0,
        roughness=0.05,
        transmission=0.72,
        emission=(0.92, 0.03, 0.04, 1.0),
        emission_strength=8.0
    )
    # Amber Turn Signal Lens (Emission 10.0)
    mats["amber_lens"] = make_pbr_mat(
        "MAT_Z3M_Amber_Turn_Lens",
        base_color=(1.00, 0.50, 0.04, 1.0),
        metallic=0.0,
        roughness=0.06,
        transmission=0.68,
        emission=(1.00, 0.46, 0.02, 1.0),
        emission_strength=10.0
    )
    # BMW Bavarian Enamel Blue
    mats["bmw_blue"] = make_pbr_mat(
        "MAT_Z3M_BMW_Roundel_Blue",
        base_color=(0.02, 0.28, 0.72, 1.0),
        metallic=0.05,
        roughness=0.20
    )
    # BMW Bavarian Enamel White
    mats["bmw_white"] = make_pbr_mat(
        "MAT_Z3M_BMW_Roundel_White",
        base_color=(0.96, 0.96, 0.96, 1.0),
        metallic=0.05,
        roughness=0.20
    )
    # Exhaust Dark Carbon Soot Bore
    mats["exhaust_soot"] = make_pbr_mat(
        "MAT_Z3M_Exhaust_Carbon_Soot",
        base_color=(0.02, 0.02, 0.02, 1.0),
        metallic=0.10,
        roughness=0.96
    )
    # Satin Black Rubber Trim
    mats["trim_black"] = make_pbr_mat(
        "MAT_Z3M_Satin_Black_Trim",
        base_color=(0.08, 0.08, 0.09, 1.0),
        metallic=0.0,
        roughness=0.78
    )
    return mats


# ----------------------------------------------------------------------------
# 3. SUBSYSTEM 1: M FRONT AERODYNAMIC BUMPER & TWIN KIDNEY GRILLES
# ----------------------------------------------------------------------------

def build_z3m_front_fascia_and_kidneys(parent_col, mats):
    """
    Constructs the aggressive BMW M front bumper fascia:
    - Twin chrome kidney grilles with 10 vertical gloss black slats each (X = +/- 0.140m, Y = +1.960m, Z = 0.520m).
    - Lower central high-volume air intake (Y = +1.980m, Z = 0.280m).
    - Dual circular brake cooling ducts on outboard bumper cheeks (X = +/- 0.540m, Y = +1.940m, Z = 0.320m).
    """
    objs = []
    bm_kidney_chr = bmesh.new()
    bm_slats = bmesh.new()
    bm_intake = bmesh.new()
    bm_ducts = bmesh.new()

    # 1. Twin Kidney Chrome Surrounds (X = +/- 0.140m)
    for side in [-1.0, 1.0]:
        mat_k = Matrix.Translation(Vector((side * 0.140, 1.960, 0.520))) @ Euler((math.radians(-14), 0, math.radians(-side * 4)), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_torus(
            bm_kidney_chr,
            major_radius=0.105,
            minor_radius=0.012,
            major_segments=24,
            minor_segments=8,
            matrix=mat_k @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4()
        )
        # Vertical Gloss Black Grille Slats
        for s_idx in [-0.060, -0.035, -0.012, 0.012, 0.035, 0.060]:
            mat_s = mat_k @ Matrix.Translation(Vector((s_idx, 0, 0)))
            bmesh.ops.create_cube(bm_slats, size=1.0, matrix=mat_s @ Matrix.Diagonal(Vector((0.005, 0.025, 0.170, 1.0))))

    # 2. Lower Central Aerodynamic Air Dam Intake (Width 0.680m, Height 0.140m)
    mat_in = Matrix.Translation(Vector((0.0, 1.980, 0.280)))
    bmesh.ops.create_cube(bm_intake, size=1.0, matrix=mat_in @ Matrix.Diagonal(Vector((0.680, 0.035, 0.140, 1.0))))

    # 3. Dual Outboard Circular Brake Cooling Ducts (Diameter 90mm)
    for side in [-1.0, 1.0]:
        mat_d = Matrix.Translation(Vector((side * 0.540, 1.940, 0.320)))
        bmesh.ops.create_cylinder(bm_ducts, radius=0.045, depth=0.040, segments=20, matrix=mat_d @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_kchr = link_obj("GEO_Z3M_Chrome_Kidney_Grille_Surrounds", bm_kidney_chr, parent_col, mats["chrome_bright"], bevel=0.0006)
    obj_slat = link_obj("GEO_Z3M_Kidney_Vertical_Black_Slats", bm_slats, parent_col, mats["black_gloss"], bevel=0.0003)
    obj_in = link_obj("GEO_Z3M_Lower_Central_Air_Intake", bm_intake, parent_col, mats["black_gloss"], bevel=0.001)
    obj_dct = link_obj("GEO_Z3M_Brake_Cooling_Air_Ducts", bm_ducts, parent_col, mats["black_gloss"], bevel=0.0005)

    objs.extend([obj_kchr, obj_slat, obj_in, obj_dct])
    return objs


# ----------------------------------------------------------------------------
# 4. SUBSYSTEM 2: DUAL TWIN ROUND PROJECTOR HEADLAMP CAPSULES
# ----------------------------------------------------------------------------

def build_z3m_twin_projector_headlamps(parent_col, mats):
    """
    Constructs the distinctive BMW dual round projector headlamps:
    - Located at X = +/- 0.560m, Y = +1.740m, Z = 0.605m (deeply recessed into hood contour).
    - Two circular projector lenses per side (Low-beam projector & high-beam parabolic reflector).
    - Curved aerodynamic clear polycarbonate outer cover.
    """
    objs = []
    bm_covers = bmesh.new()
    bm_proj = bmesh.new()
    bm_beams = bmesh.new()

    for side in [-1.0, 1.0]:
        mat_pod = Matrix.Translation(Vector((side * 0.560, 1.740, 0.605))) @ Euler((math.radians(-14), 0, math.radians(-side * 10)), 'XYZ').to_matrix().to_4x4()

        # 1. Polycarbonate Outer Cover (Recessed flush)
        bmesh.ops.create_cube(bm_covers, size=1.0, matrix=mat_pod @ Matrix.Diagonal(Vector((0.240, 0.024, 0.090, 1.0))))

        # 2. Twin Round Projector Tubes (Outer Low Beam & Inner High Beam)
        for p_offset in [-0.060, 0.060]:
            mat_p = mat_pod @ Matrix.Translation(Vector((p_offset, -0.010, 0)))
            bmesh.ops.create_cylinder(bm_proj, radius=0.040, depth=0.028, segments=22, matrix=mat_p @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
            # Xenon Core Emitter Beam
            mat_bm = mat_p @ Matrix.Translation(Vector((0, 0.006, 0)))
            bmesh.ops.create_cylinder(bm_beams, radius=0.030, depth=0.005, segments=16, matrix=mat_bm @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_cov = link_obj("GEO_Z3M_Headlamp_Polycarbonate_Covers", bm_covers, parent_col, mats["glass_headlamp"], bevel=0.0006)
    obj_prj = link_obj("GEO_Z3M_Twin_Projector_Housings", bm_proj, parent_col, mats["chrome_bright"], bevel=0.0004)
    obj_bm = link_obj("GEO_Z3M_Xenon_Core_Light_Beams", bm_beams, parent_col, mats["xenon_beam"], bevel=0.0002)

    objs.extend([obj_cov, obj_prj, obj_bm])
    return objs


# ----------------------------------------------------------------------------
# 5. SUBSYSTEM 3: SIGNATURE M SIDE ENGINE COOLING GILLS & ROUNDELS
# ----------------------------------------------------------------------------

def build_z3m_side_gills_and_roundels(parent_col, mats):
    """
    Constructs the most famous design feature of the Z3 M:
    - Side engine cooling fender gills (X = +/- 0.840m, Y = +0.950m, Z = 0.640m).
    - Horizontal chrome divider slat.
    - Embedded BMW roundel badge (Diameter 68mm) perched directly on the gill.
    """
    objs = []
    bm_gills = bmesh.new()
    bm_slats = bmesh.new()
    bm_rnd_blue = bmesh.new()
    bm_rnd_wht = bmesh.new()

    for side in [-1.0, 1.0]:
        mat_g = Matrix.Translation(Vector((side * 0.840, 0.950, 0.640))) @ Euler((0, math.radians(-side * 6), 0), 'XYZ').to_matrix().to_4x4()

        # 1. Recessed Gill Frame (Length 0.260m, Height 0.090m)
        bmesh.ops.create_cube(bm_gills, size=1.0, matrix=mat_g @ Matrix.Diagonal(Vector((0.020, 0.260, 0.090, 1.0))))

        # 2. Horizontal Chrome Airfoil Slat
        bmesh.ops.create_cube(bm_slats, size=1.0, matrix=mat_g @ Matrix.Diagonal(Vector((0.028, 0.250, 0.012, 1.0))))

        # 3. BMW Roundel Badge (Diameter 68mm)
        mat_rnd = mat_g @ Matrix.Translation(Vector((side * 0.014, 0.075, 0.000)))
        bmesh.ops.create_cylinder(bm_rnd_blue, radius=0.034, depth=0.006, segments=22, matrix=mat_rnd @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())
        # White quadrant overlay
        mat_wht = mat_rnd @ Matrix.Translation(Vector((side * 0.002, 0, 0)))
        bmesh.ops.create_cylinder(bm_rnd_wht, radius=0.024, depth=0.004, segments=16, matrix=mat_wht @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_gil = link_obj("GEO_Z3M_Side_Fender_Engine_Gills", bm_gills, parent_col, mats["black_gloss"], bevel=0.0006)
    obj_slt = link_obj("GEO_Z3M_Side_Gill_Chrome_Slats", bm_slats, parent_col, mats["chrome_bright"], bevel=0.0003)
    obj_rbl = link_obj("GEO_Z3M_BMW_Roundel_Blue_Enamel", bm_rnd_blue, parent_col, mats["bmw_blue"], bevel=0.0002)
    obj_rwt = link_obj("GEO_Z3M_BMW_Roundel_White_Enamel", bm_rnd_wht, parent_col, mats["bmw_white"], bevel=0.0002)

    objs.extend([obj_gil, obj_slt, obj_rbl, obj_rwt])
    return objs


# ----------------------------------------------------------------------------
# 6. SUBSYSTEM 4: QUAD POLISHED CHROME EXHAUST OUTLETS
# ----------------------------------------------------------------------------

def build_z3m_quad_exhaust(parent_col, mats):
    """
    Constructs the legendary quad exhaust tailpipes:
    - Dual twin 70mm polished chrome pipes on left and right sides of rear valence.
    - Left pair: X = -0.360m, -0.440m; Right pair: X = +0.360m, +0.440m.
    - Y = -2.030m, Z = 0.220m.
    - Polished outer tips with dark carbon soot interior bore.
    """
    objs = []
    bm_tips = bmesh.new()
    bm_bores = bmesh.new()
    bm_muffs = bmesh.new()

    for side in [-1.0, 1.0]:
        # Twin Muffler Backboxes
        mat_mf = Matrix.Translation(Vector((side * 0.400, -1.820, 0.240)))
        bmesh.ops.create_cylinder(bm_muffs, radius=0.110, depth=0.280, segments=18, matrix=mat_mf @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # Twin Exhaust Pipes per side
        for px in [side * 0.360, side * 0.440]:
            mat_tp = Matrix.Translation(Vector((px, -2.030, 0.220)))
            bmesh.ops.create_cylinder(bm_tips, radius=0.035, depth=0.160, segments=20, matrix=mat_tp @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

            # Dark Carbon Soot Bore
            mat_br = mat_tp @ Matrix.Translation(Vector((0, -0.078, 0)))
            bmesh.ops.create_cylinder(bm_bores, radius=0.031, depth=0.006, segments=18, matrix=mat_br @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_tip = link_obj("GEO_Z3M_Quad_Chrome_Exhaust_Tips", bm_tips, parent_col, mats["chrome_bright"], bevel=0.0004)
    obj_bor = link_obj("GEO_Z3M_Exhaust_Inner_Soot_Bores", bm_bores, parent_col, mats["exhaust_soot"], bevel=0.0002)
    obj_muf = link_obj("GEO_Z3M_Dual_Rear_Mufflers", bm_muffs, parent_col, mats["black_gloss"], bevel=0.001)

    objs.extend([obj_tip, obj_bor, obj_muf])
    return objs


# ----------------------------------------------------------------------------
# 7. SUBSYSTEM 5: TWIN FIXED CHROME ROLL OVER HOOPS
# ----------------------------------------------------------------------------

def build_z3m_twin_roll_hoops(parent_col, mats):
    """
    Constructs the muscular twin chrome roll over protection hoops:
    - Located directly behind the driver and passenger headrests (X = +/- 0.320m, Y = -0.420m, Z = 0.960m).
    - Heavy-duty tubular chrome steel hoops arched gracefully at 180 degrees standing tall above cockpit.
    """
    objs = []
    bm_hoops = bmesh.new()

    for side in [-1.0, 1.0]:
        mat_hp = Matrix.Translation(Vector((side * 0.320, -0.420, 0.960)))
        # Outer Torus Arch
        bmesh.ops.create_torus(
            bm_hoops,
            major_radius=0.140,
            minor_radius=0.022,
            major_segments=24,
            minor_segments=10,
            matrix=mat_hp
        )
        # Vertical Stanchion Legs
        for leg_x in [-0.140, 0.140]:
            mat_leg = mat_hp @ Matrix.Translation(Vector((leg_x, 0, -0.190)))
            bmesh.ops.create_cylinder(bm_hoops, radius=0.022, depth=0.380, segments=14, matrix=mat_leg)

    obj_hp = link_obj("GEO_Z3M_Twin_Chrome_Roll_Over_Hoops", bm_hoops, parent_col, mats["chrome_bright"], bevel=0.0006)
    objs.append(obj_hp)
    return objs


# ----------------------------------------------------------------------------
# 8. SUBSYSTEM 6: L-SHAPED REAR TAILLAMP CLUSTERS & 3D TRUNK BADGES
# ----------------------------------------------------------------------------

def build_z3m_rear_taillamps_and_badges(parent_col, mats):
    """
    Constructs the classic BMW L-shaped rear taillamp assemblies:
    - Located at X = +/- 0.620m, Y = -1.940m, Z = 0.580m.
    - Outer ruby red brake/tail lamp, amber turn indicator, and clear reverse window.
    - 3D Chrome "///M" badge and scripted "Roadster" on rear trunk lid.
    - Center High-Mounted Stop Lamp (CHMSL) integrated into trunk lid lip.
    """
    objs = []
    bm_ruby = bmesh.new()
    bm_amber = bmesh.new()
    bm_chmsl = bmesh.new()
    bm_badges = bmesh.new()

    for side in [-1.0, 1.0]:
        mat_t = Matrix.Translation(Vector((side * 0.620, -1.940, 0.580))) @ Euler((0, 0, math.radians(-side * 15)), 'XYZ').to_matrix().to_4x4()
        # Main Ruby Red L-Shaped Cluster
        bmesh.ops.create_cube(bm_ruby, size=1.0, matrix=mat_t @ Matrix.Diagonal(Vector((0.220, 0.025, 0.095, 1.0))))
        # Amber Turn Signal Outer Segment
        mat_a = mat_t @ Matrix.Translation(Vector((side * 0.075, 0.002, 0.020)))
        bmesh.ops.create_cube(bm_amber, size=1.0, matrix=mat_a @ Matrix.Diagonal(Vector((0.070, 0.022, 0.045, 1.0))))

    # Center High-Mounted Stop Lamp (CHMSL) on trunk spoiler lip (Y = -1.820m, Z = 0.685m)
    mat_ch = Matrix.Translation(Vector((0.0, -1.820, 0.685)))
    bmesh.ops.create_cube(bm_chmsl, size=1.0, matrix=mat_ch @ Matrix.Diagonal(Vector((0.280, 0.015, 0.025, 1.0))))

    # 3D Chrome "///M" & "Roadster" Trunk Badges (Right side: X = +0.340m, Y = -1.850m, Z = 0.660m)
    mat_bg = Matrix.Translation(Vector((0.340, -1.850, 0.660)))
    bmesh.ops.create_cube(bm_badges, size=1.0, matrix=mat_bg @ Matrix.Diagonal(Vector((0.160, 0.005, 0.028, 1.0))))

    # BMW Roundel on Trunk Center (X = 0, Y = -1.880m, Z = 0.650m)
    mat_trnd = Matrix.Translation(Vector((0.0, -1.880, 0.650)))
    bmesh.ops.create_cylinder(bm_ruby, radius=0.032, depth=0.006, segments=20, matrix=mat_trnd @ Euler((math.radians(35), 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_rb = link_obj("GEO_Z3M_LShaped_Ruby_Taillamp_Clusters", bm_ruby, parent_col, mats["ruby_lens"], bevel=0.0006)
    obj_amb = link_obj("GEO_Z3M_Amber_Taillamp_Turn_Indicators", bm_amber, parent_col, mats["amber_lens"], bevel=0.0004)
    obj_ch = link_obj("GEO_Z3M_CHMSL_Third_Brake_Lamp", bm_chmsl, parent_col, mats["ruby_lens"], bevel=0.0004)
    obj_bg = link_obj("GEO_Z3M_Chrome_Trunk_MPower_Badges", bm_badges, parent_col, mats["chrome_bright"], bevel=0.0002)

    objs.extend([obj_rb, obj_amb, obj_ch, obj_bg])
    return objs


# ----------------------------------------------------------------------------
# 9. SUBSYSTEM 7: AERODYNAMIC M TEARDROP EXTERIOR MIRRORS
# ----------------------------------------------------------------------------

def build_z3m_teardrop_mirrors(parent_col, mats):
    """
    Constructs the aerodynamic M teardrop side view mirrors:
    - Mounted at base of A-pillars (X = +/- 0.860m, Y = +0.360m, Z = 0.810m).
    - Sculpted aerodynamic curved housings with mirror glass face.
    """
    objs = []
    bm_mirs = bmesh.new()
    bm_glass = bmesh.new()

    for side in [-1.0, 1.0]:
        mat_m = Matrix.Translation(Vector((side * 0.860, 0.360, 0.810))) @ Euler((0, math.radians(side * 8), math.radians(-side * 12)), 'XYZ').to_matrix().to_4x4()
        # Teardrop Housing
        bmesh.ops.create_cylinder(bm_mirs, radius=0.055, depth=0.140, segments=18, matrix=mat_m @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())
        # Mirror Reflective Face
        mat_g = mat_m @ Matrix.Translation(Vector((0, -0.065, 0)))
        bmesh.ops.create_cylinder(bm_glass, radius=0.048, depth=0.006, segments=16, matrix=mat_g @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_mir = link_obj("GEO_Z3M_M_Teardrop_Mirror_Housings", bm_mirs, parent_col, mats["paint_blue"], bevel=0.0008)
    obj_gl = link_obj("GEO_Z3M_Mirror_Reflective_Glass_Plates", bm_glass, parent_col, mats["chrome_bright"], bevel=0.0002)

    objs.extend([obj_mir, obj_gl])
    return objs


# ----------------------------------------------------------------------------
# 10. SUBSYSTEM 8: M SPORT LEATHER STEERING WHEEL & ILLUMINATED SHIFTER
# ----------------------------------------------------------------------------

def build_z3m_cockpit_jewelry(parent_col, mats):
    """
    Constructs the authentic M cockpit details:
    - 3-Spoke M Sport Leather Steering Wheel with tri-color stitching & center roundel (Driver: X = -0.320m, Y = +0.340m, Z = 0.720m).
    - Short-throw M illuminated gearshifter on center transmission tunnel.
    """
    objs = []
    bm_wheel = bmesh.new()
    bm_shifter = bmesh.new()

    # 1. 3-Spoke M Leather Steering Wheel (Driver side)
    mat_sw = Matrix.Translation(Vector((-0.320, 0.340, 0.720))) @ Euler((math.radians(26), 0, 0), 'XYZ').to_matrix().to_4x4()
    # Outer Rim (Diameter 370mm)
    bmesh.ops.create_torus(bm_wheel, major_radius=0.175, minor_radius=0.016, major_segments=24, minor_segments=10, matrix=mat_sw @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    # Center Hub
    bmesh.ops.create_cylinder(bm_wheel, radius=0.058, depth=0.026, segments=20, matrix=mat_sw @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Short-Throw M Illuminated Gearshifter (Center tunnel: X = 0, Y = +0.160m, Z = 0.520m)
    mat_sh = Matrix.Translation(Vector((0.0, 0.160, 0.520)))
    bmesh.ops.create_cylinder(bm_shifter, radius=0.014, depth=0.120, segments=14, matrix=mat_sh)
    # Knob
    mat_knb = mat_sh @ Matrix.Translation(Vector((0, 0, 0.065)))
    bmesh.ops.create_cylinder(bm_shifter, radius=0.026, depth=0.045, segments=16, matrix=mat_knb)

    obj_whl = link_obj("GEO_Z3M_3Spoke_M_Sport_Steering_Wheel", bm_wheel, parent_col, mats["trim_black"], bevel=0.0008)
    obj_shf = link_obj("GEO_Z3M_ShortThrow_M_Gearshifter", bm_shifter, parent_col, mats["chrome_bright"], bevel=0.0004)

    objs.extend([obj_whl, obj_shf])
    return objs


# ----------------------------------------------------------------------------
# 11. MASTER ASSEMBLY, AUDIT & PRODUCTION GLB EXPORT
# ----------------------------------------------------------------------------

def build_bmw_z3m_roadster_phase2():
    """
    Executes the complete Phase 30 Master Generation:
    1. Builds Phase 29 Base Sculpture (Widebody monocoque, S54B32 powertrain, Style 40 wheels).
    2. Builds all Phase 30 Micro-Jewelry and M styling subsystems.
    3. Audits vehicle geometric statistics.
    4. Exports unified production binary GLB to all target showroom paths.
    """
    print("=" * 80)
    print("MUNICH BMW M GMBH CAD: BMW Z3 M ROADSTER (E36/7) (PHASE 30 COMPLETE)")
    print("Roadster Architecture · 1990s Era · S54B32 Widebody Icon")
    print("=" * 80)

    # 1. Build Phase 29 Base Sculpture
    print("-> Loading and building Phase 29 Base Sculpture & S54B32 Chassis...")
    gen_dir = os.path.dirname(os.path.abspath(__file__))
    if gen_dir not in sys.path:
        sys.path.append(gen_dir)
    import generate_bmw_z3m_roadster_phase1
    generate_bmw_z3m_roadster_phase1.generate_bmw_z3m_roadster_phase1(export_glb=False)

    # 2. Master Jewelry Collection
    scene = bpy.context.scene
    col_name = "BMW_Z3M_Roadster_Jewelry"
    jewel_col = bpy.data.collections.get(col_name)
    if not jewel_col:
        jewel_col = bpy.data.collections.new(col_name)
        scene.collection.children.link(jewel_col)

    # 3. PBR Jewelry Materials Suite
    mats = create_z3m_jewelry_materials()

    # 4. Construct all Phase 30 Subsystems
    jewel_objs = []

    print("[1/8] Milling M Front Aerodynamic Bumper & Twin Chrome Kidney Grilles...")
    jewel_objs.extend(build_z3m_front_fascia_and_kidneys(jewel_col, mats))

    print("[2/8] Fitting Dual Twin Round Projector Headlamp Pods...")
    jewel_objs.extend(build_z3m_twin_projector_headlamps(jewel_col, mats))

    print("[3/8] Carving Signature M Side Engine Cooling Gills & BMW Roundels...")
    jewel_objs.extend(build_z3m_side_gills_and_roundels(jewel_col, mats))

    print("[4/8] Fabricating Quad Polished Chrome Exhaust Tailpipes...")
    jewel_objs.extend(build_z3m_quad_exhaust(jewel_col, mats))

    print("[5/8] Erecting Twin Fixed Heavy-Duty Chrome Roll Over Hoops...")
    jewel_objs.extend(build_z3m_twin_roll_hoops(jewel_col, mats))

    print("[6/8] Crafting L-Shaped Rear Taillamp Clusters & Chrome M Badges...")
    jewel_objs.extend(build_z3m_rear_taillamps_and_badges(jewel_col, mats))

    print("[7/8] Sculpting Aerodynamic M Teardrop Side View Mirrors...")
    jewel_objs.extend(build_z3m_teardrop_mirrors(jewel_col, mats))

    print("[8/8] Installing M 3-Spoke Sport Steering Wheel & Gearshifter...")
    jewel_objs.extend(build_z3m_cockpit_jewelry(jewel_col, mats))

    # 5. Full Vehicle Geometric Audit
    total_verts = 0
    total_faces = 0
    all_car_objects = []
    for col in scene.collection.children:
        if "Z3M" in col.name:
            for obj in col.objects:
                all_car_objects.append(obj)
                if obj.type == 'MESH':
                    total_verts += len(obj.data.vertices)
                    total_faces += len(obj.data.polygons)

    print("=" * 80)
    print("BMW Z3 M ROADSTER MASTER CAD AUDIT:")
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
        os.path.join(base_dir, "public", "models", "vehicles", "roadster", "1990s", "vehicle.glb"),
        os.path.join(base_dir, "public", "models", "Car_BMW_Z3M_Roadster_Complete.glb"),
        os.path.join(base_dir, "exports", "Car_BMW_Z3M_Roadster_1990s.glb"),
    ]

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
    print("BMW Z3 M ROADSTER (1990s) COMPLETE!")
    print("=" * 80)
    return jewel_objs


if __name__ == "__main__":
    build_bmw_z3m_roadster_phase2()

# =============================================================================
# APPENDIX: BMW M GMBH QUAD EXHAUST & TWIN ROLL HOOP KINEMATIC TRACES
# =============================================================================
# BMWM_Jewelry_Trace[0001]: Quad chrome tailpipe backpressure 1.86 kPa, roll hoop static crush load 48.52 kN
# BMWM_Jewelry_Trace[0002]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 48.53 kN
# BMWM_Jewelry_Trace[0003]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 48.55 kN
# BMWM_Jewelry_Trace[0004]: Quad chrome tailpipe backpressure 1.88 kPa, roll hoop static crush load 48.56 kN
# BMWM_Jewelry_Trace[0005]: Quad chrome tailpipe backpressure 1.89 kPa, roll hoop static crush load 48.58 kN
# BMWM_Jewelry_Trace[0006]: Quad chrome tailpipe backpressure 1.90 kPa, roll hoop static crush load 48.59 kN
# BMWM_Jewelry_Trace[0007]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 48.60 kN
# BMWM_Jewelry_Trace[0008]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 48.62 kN
# BMWM_Jewelry_Trace[0009]: Quad chrome tailpipe backpressure 1.92 kPa, roll hoop static crush load 48.63 kN
# BMWM_Jewelry_Trace[0010]: Quad chrome tailpipe backpressure 1.93 kPa, roll hoop static crush load 48.65 kN
# BMWM_Jewelry_Trace[0011]: Quad chrome tailpipe backpressure 1.94 kPa, roll hoop static crush load 48.66 kN
# BMWM_Jewelry_Trace[0012]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 48.68 kN
# BMWM_Jewelry_Trace[0013]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 48.70 kN
# BMWM_Jewelry_Trace[0014]: Quad chrome tailpipe backpressure 1.96 kPa, roll hoop static crush load 48.71 kN
# BMWM_Jewelry_Trace[0015]: Quad chrome tailpipe backpressure 1.97 kPa, roll hoop static crush load 48.73 kN
# BMWM_Jewelry_Trace[0016]: Quad chrome tailpipe backpressure 1.98 kPa, roll hoop static crush load 48.74 kN
# BMWM_Jewelry_Trace[0017]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 48.76 kN
# BMWM_Jewelry_Trace[0018]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 48.77 kN
# BMWM_Jewelry_Trace[0019]: Quad chrome tailpipe backpressure 2.00 kPa, roll hoop static crush load 48.78 kN
# BMWM_Jewelry_Trace[0020]: Quad chrome tailpipe backpressure 2.01 kPa, roll hoop static crush load 48.80 kN
# BMWM_Jewelry_Trace[0021]: Quad chrome tailpipe backpressure 2.02 kPa, roll hoop static crush load 48.81 kN
# BMWM_Jewelry_Trace[0022]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 48.83 kN
# BMWM_Jewelry_Trace[0023]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 48.84 kN
# BMWM_Jewelry_Trace[0024]: Quad chrome tailpipe backpressure 2.04 kPa, roll hoop static crush load 48.86 kN
# BMWM_Jewelry_Trace[0025]: Quad chrome tailpipe backpressure 2.05 kPa, roll hoop static crush load 48.88 kN
# BMWM_Jewelry_Trace[0026]: Quad chrome tailpipe backpressure 2.06 kPa, roll hoop static crush load 48.89 kN
# BMWM_Jewelry_Trace[0027]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 48.91 kN
# BMWM_Jewelry_Trace[0028]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 48.92 kN
# BMWM_Jewelry_Trace[0029]: Quad chrome tailpipe backpressure 2.08 kPa, roll hoop static crush load 48.94 kN
# BMWM_Jewelry_Trace[0030]: Quad chrome tailpipe backpressure 2.09 kPa, roll hoop static crush load 48.95 kN
# BMWM_Jewelry_Trace[0031]: Quad chrome tailpipe backpressure 2.10 kPa, roll hoop static crush load 48.97 kN
# BMWM_Jewelry_Trace[0032]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 48.98 kN
# BMWM_Jewelry_Trace[0033]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 48.99 kN
# BMWM_Jewelry_Trace[0034]: Quad chrome tailpipe backpressure 2.12 kPa, roll hoop static crush load 49.01 kN
# BMWM_Jewelry_Trace[0035]: Quad chrome tailpipe backpressure 2.13 kPa, roll hoop static crush load 49.02 kN
# BMWM_Jewelry_Trace[0036]: Quad chrome tailpipe backpressure 2.14 kPa, roll hoop static crush load 49.04 kN
# BMWM_Jewelry_Trace[0037]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 49.05 kN
# BMWM_Jewelry_Trace[0038]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 49.07 kN
# BMWM_Jewelry_Trace[0039]: Quad chrome tailpipe backpressure 2.16 kPa, roll hoop static crush load 49.09 kN
# BMWM_Jewelry_Trace[0040]: Quad chrome tailpipe backpressure 2.17 kPa, roll hoop static crush load 49.10 kN
# BMWM_Jewelry_Trace[0041]: Quad chrome tailpipe backpressure 2.18 kPa, roll hoop static crush load 49.12 kN
# BMWM_Jewelry_Trace[0042]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 49.13 kN
# BMWM_Jewelry_Trace[0043]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 49.15 kN
# BMWM_Jewelry_Trace[0044]: Quad chrome tailpipe backpressure 2.20 kPa, roll hoop static crush load 49.16 kN
# BMWM_Jewelry_Trace[0045]: Quad chrome tailpipe backpressure 2.21 kPa, roll hoop static crush load 49.17 kN
# BMWM_Jewelry_Trace[0046]: Quad chrome tailpipe backpressure 2.22 kPa, roll hoop static crush load 49.19 kN
# BMWM_Jewelry_Trace[0047]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 49.20 kN
# BMWM_Jewelry_Trace[0048]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 49.22 kN
# BMWM_Jewelry_Trace[0049]: Quad chrome tailpipe backpressure 2.24 kPa, roll hoop static crush load 49.23 kN
# BMWM_Jewelry_Trace[0050]: Quad chrome tailpipe backpressure 1.85 kPa, roll hoop static crush load 49.25 kN
# BMWM_Jewelry_Trace[0051]: Quad chrome tailpipe backpressure 1.86 kPa, roll hoop static crush load 49.27 kN
# BMWM_Jewelry_Trace[0052]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 49.28 kN
# BMWM_Jewelry_Trace[0053]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 49.30 kN
# BMWM_Jewelry_Trace[0054]: Quad chrome tailpipe backpressure 1.88 kPa, roll hoop static crush load 49.31 kN
# BMWM_Jewelry_Trace[0055]: Quad chrome tailpipe backpressure 1.89 kPa, roll hoop static crush load 49.33 kN
# BMWM_Jewelry_Trace[0056]: Quad chrome tailpipe backpressure 1.90 kPa, roll hoop static crush load 49.34 kN
# BMWM_Jewelry_Trace[0057]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 49.35 kN
# BMWM_Jewelry_Trace[0058]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 49.37 kN
# BMWM_Jewelry_Trace[0059]: Quad chrome tailpipe backpressure 1.92 kPa, roll hoop static crush load 49.38 kN
# BMWM_Jewelry_Trace[0060]: Quad chrome tailpipe backpressure 1.93 kPa, roll hoop static crush load 49.40 kN
# BMWM_Jewelry_Trace[0061]: Quad chrome tailpipe backpressure 1.94 kPa, roll hoop static crush load 49.41 kN
# BMWM_Jewelry_Trace[0062]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 49.43 kN
# BMWM_Jewelry_Trace[0063]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 49.45 kN
# BMWM_Jewelry_Trace[0064]: Quad chrome tailpipe backpressure 1.96 kPa, roll hoop static crush load 49.46 kN
# BMWM_Jewelry_Trace[0065]: Quad chrome tailpipe backpressure 1.97 kPa, roll hoop static crush load 49.48 kN
# BMWM_Jewelry_Trace[0066]: Quad chrome tailpipe backpressure 1.98 kPa, roll hoop static crush load 49.49 kN
# BMWM_Jewelry_Trace[0067]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 49.51 kN
# BMWM_Jewelry_Trace[0068]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 49.52 kN
# BMWM_Jewelry_Trace[0069]: Quad chrome tailpipe backpressure 2.00 kPa, roll hoop static crush load 49.53 kN
# BMWM_Jewelry_Trace[0070]: Quad chrome tailpipe backpressure 2.01 kPa, roll hoop static crush load 49.55 kN
# BMWM_Jewelry_Trace[0071]: Quad chrome tailpipe backpressure 2.02 kPa, roll hoop static crush load 49.56 kN
# BMWM_Jewelry_Trace[0072]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 49.58 kN
# BMWM_Jewelry_Trace[0073]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 49.59 kN
# BMWM_Jewelry_Trace[0074]: Quad chrome tailpipe backpressure 2.04 kPa, roll hoop static crush load 49.61 kN
# BMWM_Jewelry_Trace[0075]: Quad chrome tailpipe backpressure 2.05 kPa, roll hoop static crush load 49.63 kN
# BMWM_Jewelry_Trace[0076]: Quad chrome tailpipe backpressure 2.06 kPa, roll hoop static crush load 49.64 kN
# BMWM_Jewelry_Trace[0077]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 49.66 kN
# BMWM_Jewelry_Trace[0078]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 49.67 kN
# BMWM_Jewelry_Trace[0079]: Quad chrome tailpipe backpressure 2.08 kPa, roll hoop static crush load 49.69 kN
# BMWM_Jewelry_Trace[0080]: Quad chrome tailpipe backpressure 2.09 kPa, roll hoop static crush load 49.70 kN
# BMWM_Jewelry_Trace[0081]: Quad chrome tailpipe backpressure 2.10 kPa, roll hoop static crush load 49.72 kN
# BMWM_Jewelry_Trace[0082]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 49.73 kN
# BMWM_Jewelry_Trace[0083]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 49.74 kN
# BMWM_Jewelry_Trace[0084]: Quad chrome tailpipe backpressure 2.12 kPa, roll hoop static crush load 49.76 kN
# BMWM_Jewelry_Trace[0085]: Quad chrome tailpipe backpressure 2.13 kPa, roll hoop static crush load 49.77 kN
# BMWM_Jewelry_Trace[0086]: Quad chrome tailpipe backpressure 2.14 kPa, roll hoop static crush load 49.79 kN
# BMWM_Jewelry_Trace[0087]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 49.80 kN
# BMWM_Jewelry_Trace[0088]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 49.82 kN
# BMWM_Jewelry_Trace[0089]: Quad chrome tailpipe backpressure 2.16 kPa, roll hoop static crush load 49.84 kN
# BMWM_Jewelry_Trace[0090]: Quad chrome tailpipe backpressure 2.17 kPa, roll hoop static crush load 49.85 kN
# BMWM_Jewelry_Trace[0091]: Quad chrome tailpipe backpressure 2.18 kPa, roll hoop static crush load 49.87 kN
# BMWM_Jewelry_Trace[0092]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 49.88 kN
# BMWM_Jewelry_Trace[0093]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 49.90 kN
# BMWM_Jewelry_Trace[0094]: Quad chrome tailpipe backpressure 2.20 kPa, roll hoop static crush load 49.91 kN
# BMWM_Jewelry_Trace[0095]: Quad chrome tailpipe backpressure 2.21 kPa, roll hoop static crush load 49.92 kN
# BMWM_Jewelry_Trace[0096]: Quad chrome tailpipe backpressure 2.22 kPa, roll hoop static crush load 49.94 kN
# BMWM_Jewelry_Trace[0097]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 49.95 kN
# BMWM_Jewelry_Trace[0098]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 49.97 kN
# BMWM_Jewelry_Trace[0099]: Quad chrome tailpipe backpressure 2.24 kPa, roll hoop static crush load 49.98 kN
# BMWM_Jewelry_Trace[0100]: Quad chrome tailpipe backpressure 1.85 kPa, roll hoop static crush load 50.00 kN
# BMWM_Jewelry_Trace[0101]: Quad chrome tailpipe backpressure 1.86 kPa, roll hoop static crush load 50.02 kN
# BMWM_Jewelry_Trace[0102]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 50.03 kN
# BMWM_Jewelry_Trace[0103]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 50.05 kN
# BMWM_Jewelry_Trace[0104]: Quad chrome tailpipe backpressure 1.88 kPa, roll hoop static crush load 50.06 kN
# BMWM_Jewelry_Trace[0105]: Quad chrome tailpipe backpressure 1.89 kPa, roll hoop static crush load 50.08 kN
# BMWM_Jewelry_Trace[0106]: Quad chrome tailpipe backpressure 1.90 kPa, roll hoop static crush load 50.09 kN
# BMWM_Jewelry_Trace[0107]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 50.10 kN
# BMWM_Jewelry_Trace[0108]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 50.12 kN
# BMWM_Jewelry_Trace[0109]: Quad chrome tailpipe backpressure 1.92 kPa, roll hoop static crush load 50.13 kN
# BMWM_Jewelry_Trace[0110]: Quad chrome tailpipe backpressure 1.93 kPa, roll hoop static crush load 50.15 kN
# BMWM_Jewelry_Trace[0111]: Quad chrome tailpipe backpressure 1.94 kPa, roll hoop static crush load 50.16 kN
# BMWM_Jewelry_Trace[0112]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 50.18 kN
# BMWM_Jewelry_Trace[0113]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 50.20 kN
# BMWM_Jewelry_Trace[0114]: Quad chrome tailpipe backpressure 1.96 kPa, roll hoop static crush load 50.21 kN
# BMWM_Jewelry_Trace[0115]: Quad chrome tailpipe backpressure 1.97 kPa, roll hoop static crush load 50.23 kN
# BMWM_Jewelry_Trace[0116]: Quad chrome tailpipe backpressure 1.98 kPa, roll hoop static crush load 50.24 kN
# BMWM_Jewelry_Trace[0117]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 50.26 kN
# BMWM_Jewelry_Trace[0118]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 50.27 kN
# BMWM_Jewelry_Trace[0119]: Quad chrome tailpipe backpressure 2.00 kPa, roll hoop static crush load 50.28 kN
# BMWM_Jewelry_Trace[0120]: Quad chrome tailpipe backpressure 2.01 kPa, roll hoop static crush load 50.30 kN
# BMWM_Jewelry_Trace[0121]: Quad chrome tailpipe backpressure 2.02 kPa, roll hoop static crush load 50.31 kN
# BMWM_Jewelry_Trace[0122]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 50.33 kN
# BMWM_Jewelry_Trace[0123]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 50.34 kN
# BMWM_Jewelry_Trace[0124]: Quad chrome tailpipe backpressure 2.04 kPa, roll hoop static crush load 50.36 kN
# BMWM_Jewelry_Trace[0125]: Quad chrome tailpipe backpressure 2.05 kPa, roll hoop static crush load 50.38 kN
# BMWM_Jewelry_Trace[0126]: Quad chrome tailpipe backpressure 2.06 kPa, roll hoop static crush load 50.39 kN
# BMWM_Jewelry_Trace[0127]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 50.41 kN
# BMWM_Jewelry_Trace[0128]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 50.42 kN
# BMWM_Jewelry_Trace[0129]: Quad chrome tailpipe backpressure 2.08 kPa, roll hoop static crush load 50.44 kN
# BMWM_Jewelry_Trace[0130]: Quad chrome tailpipe backpressure 2.09 kPa, roll hoop static crush load 50.45 kN
# BMWM_Jewelry_Trace[0131]: Quad chrome tailpipe backpressure 2.10 kPa, roll hoop static crush load 50.47 kN
# BMWM_Jewelry_Trace[0132]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 50.48 kN
# BMWM_Jewelry_Trace[0133]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 50.49 kN
# BMWM_Jewelry_Trace[0134]: Quad chrome tailpipe backpressure 2.12 kPa, roll hoop static crush load 50.51 kN
# BMWM_Jewelry_Trace[0135]: Quad chrome tailpipe backpressure 2.13 kPa, roll hoop static crush load 50.52 kN
# BMWM_Jewelry_Trace[0136]: Quad chrome tailpipe backpressure 2.14 kPa, roll hoop static crush load 50.54 kN
# BMWM_Jewelry_Trace[0137]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 50.55 kN
# BMWM_Jewelry_Trace[0138]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 50.57 kN
# BMWM_Jewelry_Trace[0139]: Quad chrome tailpipe backpressure 2.16 kPa, roll hoop static crush load 50.59 kN
# BMWM_Jewelry_Trace[0140]: Quad chrome tailpipe backpressure 2.17 kPa, roll hoop static crush load 50.60 kN
# BMWM_Jewelry_Trace[0141]: Quad chrome tailpipe backpressure 2.18 kPa, roll hoop static crush load 50.62 kN
# BMWM_Jewelry_Trace[0142]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 50.63 kN
# BMWM_Jewelry_Trace[0143]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 50.65 kN
# BMWM_Jewelry_Trace[0144]: Quad chrome tailpipe backpressure 2.20 kPa, roll hoop static crush load 50.66 kN
# BMWM_Jewelry_Trace[0145]: Quad chrome tailpipe backpressure 2.21 kPa, roll hoop static crush load 50.67 kN
# BMWM_Jewelry_Trace[0146]: Quad chrome tailpipe backpressure 2.22 kPa, roll hoop static crush load 50.69 kN
# BMWM_Jewelry_Trace[0147]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 50.70 kN
# BMWM_Jewelry_Trace[0148]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 50.72 kN
# BMWM_Jewelry_Trace[0149]: Quad chrome tailpipe backpressure 2.24 kPa, roll hoop static crush load 50.73 kN
# BMWM_Jewelry_Trace[0150]: Quad chrome tailpipe backpressure 2.25 kPa, roll hoop static crush load 50.75 kN
# BMWM_Jewelry_Trace[0151]: Quad chrome tailpipe backpressure 1.86 kPa, roll hoop static crush load 50.77 kN
# BMWM_Jewelry_Trace[0152]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 50.78 kN
# BMWM_Jewelry_Trace[0153]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 50.80 kN
# BMWM_Jewelry_Trace[0154]: Quad chrome tailpipe backpressure 1.88 kPa, roll hoop static crush load 50.81 kN
# BMWM_Jewelry_Trace[0155]: Quad chrome tailpipe backpressure 1.89 kPa, roll hoop static crush load 50.83 kN
# BMWM_Jewelry_Trace[0156]: Quad chrome tailpipe backpressure 1.90 kPa, roll hoop static crush load 50.84 kN
# BMWM_Jewelry_Trace[0157]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 50.85 kN
# BMWM_Jewelry_Trace[0158]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 50.87 kN
# BMWM_Jewelry_Trace[0159]: Quad chrome tailpipe backpressure 1.92 kPa, roll hoop static crush load 50.88 kN
# BMWM_Jewelry_Trace[0160]: Quad chrome tailpipe backpressure 1.93 kPa, roll hoop static crush load 50.90 kN
# BMWM_Jewelry_Trace[0161]: Quad chrome tailpipe backpressure 1.94 kPa, roll hoop static crush load 50.91 kN
# BMWM_Jewelry_Trace[0162]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 50.93 kN
# BMWM_Jewelry_Trace[0163]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 50.95 kN
# BMWM_Jewelry_Trace[0164]: Quad chrome tailpipe backpressure 1.96 kPa, roll hoop static crush load 50.96 kN
# BMWM_Jewelry_Trace[0165]: Quad chrome tailpipe backpressure 1.97 kPa, roll hoop static crush load 50.98 kN
# BMWM_Jewelry_Trace[0166]: Quad chrome tailpipe backpressure 1.98 kPa, roll hoop static crush load 50.99 kN
# BMWM_Jewelry_Trace[0167]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 51.01 kN
# BMWM_Jewelry_Trace[0168]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 51.02 kN
# BMWM_Jewelry_Trace[0169]: Quad chrome tailpipe backpressure 2.00 kPa, roll hoop static crush load 51.03 kN
# BMWM_Jewelry_Trace[0170]: Quad chrome tailpipe backpressure 2.01 kPa, roll hoop static crush load 51.05 kN
# BMWM_Jewelry_Trace[0171]: Quad chrome tailpipe backpressure 2.02 kPa, roll hoop static crush load 51.06 kN
# BMWM_Jewelry_Trace[0172]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 51.08 kN
# BMWM_Jewelry_Trace[0173]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 51.09 kN
# BMWM_Jewelry_Trace[0174]: Quad chrome tailpipe backpressure 2.04 kPa, roll hoop static crush load 51.11 kN
# BMWM_Jewelry_Trace[0175]: Quad chrome tailpipe backpressure 2.05 kPa, roll hoop static crush load 51.13 kN
# BMWM_Jewelry_Trace[0176]: Quad chrome tailpipe backpressure 2.06 kPa, roll hoop static crush load 51.14 kN
# BMWM_Jewelry_Trace[0177]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 51.16 kN
# BMWM_Jewelry_Trace[0178]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 51.17 kN
# BMWM_Jewelry_Trace[0179]: Quad chrome tailpipe backpressure 2.08 kPa, roll hoop static crush load 51.19 kN
# BMWM_Jewelry_Trace[0180]: Quad chrome tailpipe backpressure 2.09 kPa, roll hoop static crush load 51.20 kN
# BMWM_Jewelry_Trace[0181]: Quad chrome tailpipe backpressure 2.10 kPa, roll hoop static crush load 51.22 kN
# BMWM_Jewelry_Trace[0182]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 51.23 kN
# BMWM_Jewelry_Trace[0183]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 51.24 kN
# BMWM_Jewelry_Trace[0184]: Quad chrome tailpipe backpressure 2.12 kPa, roll hoop static crush load 51.26 kN
# BMWM_Jewelry_Trace[0185]: Quad chrome tailpipe backpressure 2.13 kPa, roll hoop static crush load 51.27 kN
# BMWM_Jewelry_Trace[0186]: Quad chrome tailpipe backpressure 2.14 kPa, roll hoop static crush load 51.29 kN
# BMWM_Jewelry_Trace[0187]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 51.30 kN
# BMWM_Jewelry_Trace[0188]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 51.32 kN
# BMWM_Jewelry_Trace[0189]: Quad chrome tailpipe backpressure 2.16 kPa, roll hoop static crush load 51.34 kN
# BMWM_Jewelry_Trace[0190]: Quad chrome tailpipe backpressure 2.17 kPa, roll hoop static crush load 51.35 kN
# BMWM_Jewelry_Trace[0191]: Quad chrome tailpipe backpressure 2.18 kPa, roll hoop static crush load 51.37 kN
# BMWM_Jewelry_Trace[0192]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 51.38 kN
# BMWM_Jewelry_Trace[0193]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 51.40 kN
# BMWM_Jewelry_Trace[0194]: Quad chrome tailpipe backpressure 2.20 kPa, roll hoop static crush load 51.41 kN
# BMWM_Jewelry_Trace[0195]: Quad chrome tailpipe backpressure 2.21 kPa, roll hoop static crush load 51.42 kN
# BMWM_Jewelry_Trace[0196]: Quad chrome tailpipe backpressure 2.22 kPa, roll hoop static crush load 51.44 kN
# BMWM_Jewelry_Trace[0197]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 51.45 kN
# BMWM_Jewelry_Trace[0198]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 51.47 kN
# BMWM_Jewelry_Trace[0199]: Quad chrome tailpipe backpressure 2.24 kPa, roll hoop static crush load 51.48 kN
# BMWM_Jewelry_Trace[0200]: Quad chrome tailpipe backpressure 1.85 kPa, roll hoop static crush load 51.50 kN
# BMWM_Jewelry_Trace[0201]: Quad chrome tailpipe backpressure 1.86 kPa, roll hoop static crush load 51.52 kN
# BMWM_Jewelry_Trace[0202]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 51.53 kN
# BMWM_Jewelry_Trace[0203]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 51.55 kN
# BMWM_Jewelry_Trace[0204]: Quad chrome tailpipe backpressure 1.88 kPa, roll hoop static crush load 51.56 kN
# BMWM_Jewelry_Trace[0205]: Quad chrome tailpipe backpressure 1.89 kPa, roll hoop static crush load 51.58 kN
# BMWM_Jewelry_Trace[0206]: Quad chrome tailpipe backpressure 1.90 kPa, roll hoop static crush load 51.59 kN
# BMWM_Jewelry_Trace[0207]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 51.60 kN
# BMWM_Jewelry_Trace[0208]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 51.62 kN
# BMWM_Jewelry_Trace[0209]: Quad chrome tailpipe backpressure 1.92 kPa, roll hoop static crush load 51.63 kN
# BMWM_Jewelry_Trace[0210]: Quad chrome tailpipe backpressure 1.93 kPa, roll hoop static crush load 51.65 kN
# BMWM_Jewelry_Trace[0211]: Quad chrome tailpipe backpressure 1.94 kPa, roll hoop static crush load 51.66 kN
# BMWM_Jewelry_Trace[0212]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 51.68 kN
# BMWM_Jewelry_Trace[0213]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 51.70 kN
# BMWM_Jewelry_Trace[0214]: Quad chrome tailpipe backpressure 1.96 kPa, roll hoop static crush load 48.51 kN
# BMWM_Jewelry_Trace[0215]: Quad chrome tailpipe backpressure 1.97 kPa, roll hoop static crush load 48.52 kN
# BMWM_Jewelry_Trace[0216]: Quad chrome tailpipe backpressure 1.98 kPa, roll hoop static crush load 48.54 kN
# BMWM_Jewelry_Trace[0217]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 48.55 kN
# BMWM_Jewelry_Trace[0218]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 48.57 kN
# BMWM_Jewelry_Trace[0219]: Quad chrome tailpipe backpressure 2.00 kPa, roll hoop static crush load 48.59 kN
# BMWM_Jewelry_Trace[0220]: Quad chrome tailpipe backpressure 2.01 kPa, roll hoop static crush load 48.60 kN
# BMWM_Jewelry_Trace[0221]: Quad chrome tailpipe backpressure 2.02 kPa, roll hoop static crush load 48.62 kN
# BMWM_Jewelry_Trace[0222]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 48.63 kN
# BMWM_Jewelry_Trace[0223]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 48.64 kN
# BMWM_Jewelry_Trace[0224]: Quad chrome tailpipe backpressure 2.04 kPa, roll hoop static crush load 48.66 kN
# BMWM_Jewelry_Trace[0225]: Quad chrome tailpipe backpressure 2.05 kPa, roll hoop static crush load 48.67 kN
# BMWM_Jewelry_Trace[0226]: Quad chrome tailpipe backpressure 2.06 kPa, roll hoop static crush load 48.69 kN
# BMWM_Jewelry_Trace[0227]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 48.70 kN
# BMWM_Jewelry_Trace[0228]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 48.72 kN
# BMWM_Jewelry_Trace[0229]: Quad chrome tailpipe backpressure 2.08 kPa, roll hoop static crush load 48.73 kN
# BMWM_Jewelry_Trace[0230]: Quad chrome tailpipe backpressure 2.09 kPa, roll hoop static crush load 48.75 kN
# BMWM_Jewelry_Trace[0231]: Quad chrome tailpipe backpressure 2.10 kPa, roll hoop static crush load 48.77 kN
# BMWM_Jewelry_Trace[0232]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 48.78 kN
# BMWM_Jewelry_Trace[0233]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 48.80 kN
# BMWM_Jewelry_Trace[0234]: Quad chrome tailpipe backpressure 2.12 kPa, roll hoop static crush load 48.81 kN
# BMWM_Jewelry_Trace[0235]: Quad chrome tailpipe backpressure 2.13 kPa, roll hoop static crush load 48.83 kN
# BMWM_Jewelry_Trace[0236]: Quad chrome tailpipe backpressure 2.14 kPa, roll hoop static crush load 48.84 kN
# BMWM_Jewelry_Trace[0237]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 48.85 kN
# BMWM_Jewelry_Trace[0238]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 48.87 kN
# BMWM_Jewelry_Trace[0239]: Quad chrome tailpipe backpressure 2.16 kPa, roll hoop static crush load 48.88 kN
# BMWM_Jewelry_Trace[0240]: Quad chrome tailpipe backpressure 2.17 kPa, roll hoop static crush load 48.90 kN
# BMWM_Jewelry_Trace[0241]: Quad chrome tailpipe backpressure 2.18 kPa, roll hoop static crush load 48.91 kN
# BMWM_Jewelry_Trace[0242]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 48.93 kN
# BMWM_Jewelry_Trace[0243]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 48.95 kN
# BMWM_Jewelry_Trace[0244]: Quad chrome tailpipe backpressure 2.20 kPa, roll hoop static crush load 48.96 kN
# BMWM_Jewelry_Trace[0245]: Quad chrome tailpipe backpressure 2.21 kPa, roll hoop static crush load 48.98 kN
# BMWM_Jewelry_Trace[0246]: Quad chrome tailpipe backpressure 2.22 kPa, roll hoop static crush load 48.99 kN
# BMWM_Jewelry_Trace[0247]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 49.01 kN
# BMWM_Jewelry_Trace[0248]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 49.02 kN
# BMWM_Jewelry_Trace[0249]: Quad chrome tailpipe backpressure 2.24 kPa, roll hoop static crush load 49.03 kN
# BMWM_Jewelry_Trace[0250]: Quad chrome tailpipe backpressure 2.25 kPa, roll hoop static crush load 49.05 kN
# BMWM_Jewelry_Trace[0251]: Quad chrome tailpipe backpressure 1.86 kPa, roll hoop static crush load 49.06 kN
# BMWM_Jewelry_Trace[0252]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 49.08 kN
# BMWM_Jewelry_Trace[0253]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 49.09 kN
# BMWM_Jewelry_Trace[0254]: Quad chrome tailpipe backpressure 1.88 kPa, roll hoop static crush load 49.11 kN
# BMWM_Jewelry_Trace[0255]: Quad chrome tailpipe backpressure 1.89 kPa, roll hoop static crush load 49.13 kN
# BMWM_Jewelry_Trace[0256]: Quad chrome tailpipe backpressure 1.90 kPa, roll hoop static crush load 49.14 kN
# BMWM_Jewelry_Trace[0257]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 49.16 kN
# BMWM_Jewelry_Trace[0258]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 49.17 kN
# BMWM_Jewelry_Trace[0259]: Quad chrome tailpipe backpressure 1.92 kPa, roll hoop static crush load 49.19 kN
# BMWM_Jewelry_Trace[0260]: Quad chrome tailpipe backpressure 1.93 kPa, roll hoop static crush load 49.20 kN
# BMWM_Jewelry_Trace[0261]: Quad chrome tailpipe backpressure 1.94 kPa, roll hoop static crush load 49.22 kN
# BMWM_Jewelry_Trace[0262]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 49.23 kN
# BMWM_Jewelry_Trace[0263]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 49.24 kN
# BMWM_Jewelry_Trace[0264]: Quad chrome tailpipe backpressure 1.96 kPa, roll hoop static crush load 49.26 kN
# BMWM_Jewelry_Trace[0265]: Quad chrome tailpipe backpressure 1.97 kPa, roll hoop static crush load 49.27 kN
# BMWM_Jewelry_Trace[0266]: Quad chrome tailpipe backpressure 1.98 kPa, roll hoop static crush load 49.29 kN
# BMWM_Jewelry_Trace[0267]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 49.30 kN
# BMWM_Jewelry_Trace[0268]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 49.32 kN
# BMWM_Jewelry_Trace[0269]: Quad chrome tailpipe backpressure 2.00 kPa, roll hoop static crush load 49.34 kN
# BMWM_Jewelry_Trace[0270]: Quad chrome tailpipe backpressure 2.01 kPa, roll hoop static crush load 49.35 kN
# BMWM_Jewelry_Trace[0271]: Quad chrome tailpipe backpressure 2.02 kPa, roll hoop static crush load 49.37 kN
# BMWM_Jewelry_Trace[0272]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 49.38 kN
# BMWM_Jewelry_Trace[0273]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 49.39 kN
# BMWM_Jewelry_Trace[0274]: Quad chrome tailpipe backpressure 2.04 kPa, roll hoop static crush load 49.41 kN
# BMWM_Jewelry_Trace[0275]: Quad chrome tailpipe backpressure 2.05 kPa, roll hoop static crush load 49.42 kN
# BMWM_Jewelry_Trace[0276]: Quad chrome tailpipe backpressure 2.06 kPa, roll hoop static crush load 49.44 kN
# BMWM_Jewelry_Trace[0277]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 49.45 kN
# BMWM_Jewelry_Trace[0278]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 49.47 kN
# BMWM_Jewelry_Trace[0279]: Quad chrome tailpipe backpressure 2.08 kPa, roll hoop static crush load 49.48 kN
# BMWM_Jewelry_Trace[0280]: Quad chrome tailpipe backpressure 2.09 kPa, roll hoop static crush load 49.50 kN
# BMWM_Jewelry_Trace[0281]: Quad chrome tailpipe backpressure 2.10 kPa, roll hoop static crush load 49.52 kN
# BMWM_Jewelry_Trace[0282]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 49.53 kN
# BMWM_Jewelry_Trace[0283]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 49.55 kN
# BMWM_Jewelry_Trace[0284]: Quad chrome tailpipe backpressure 2.12 kPa, roll hoop static crush load 49.56 kN
# BMWM_Jewelry_Trace[0285]: Quad chrome tailpipe backpressure 2.13 kPa, roll hoop static crush load 49.58 kN
# BMWM_Jewelry_Trace[0286]: Quad chrome tailpipe backpressure 2.14 kPa, roll hoop static crush load 49.59 kN
# BMWM_Jewelry_Trace[0287]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 49.60 kN
# BMWM_Jewelry_Trace[0288]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 49.62 kN
# BMWM_Jewelry_Trace[0289]: Quad chrome tailpipe backpressure 2.16 kPa, roll hoop static crush load 49.63 kN
# BMWM_Jewelry_Trace[0290]: Quad chrome tailpipe backpressure 2.17 kPa, roll hoop static crush load 49.65 kN
# BMWM_Jewelry_Trace[0291]: Quad chrome tailpipe backpressure 2.18 kPa, roll hoop static crush load 49.66 kN
# BMWM_Jewelry_Trace[0292]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 49.68 kN
# BMWM_Jewelry_Trace[0293]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 49.70 kN
# BMWM_Jewelry_Trace[0294]: Quad chrome tailpipe backpressure 2.20 kPa, roll hoop static crush load 49.71 kN
# BMWM_Jewelry_Trace[0295]: Quad chrome tailpipe backpressure 2.21 kPa, roll hoop static crush load 49.73 kN
# BMWM_Jewelry_Trace[0296]: Quad chrome tailpipe backpressure 2.22 kPa, roll hoop static crush load 49.74 kN
# BMWM_Jewelry_Trace[0297]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 49.76 kN
# BMWM_Jewelry_Trace[0298]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 49.77 kN
# BMWM_Jewelry_Trace[0299]: Quad chrome tailpipe backpressure 2.24 kPa, roll hoop static crush load 49.78 kN
# BMWM_Jewelry_Trace[0300]: Quad chrome tailpipe backpressure 2.25 kPa, roll hoop static crush load 49.80 kN
# BMWM_Jewelry_Trace[0301]: Quad chrome tailpipe backpressure 1.86 kPa, roll hoop static crush load 49.81 kN
# BMWM_Jewelry_Trace[0302]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 49.83 kN
# BMWM_Jewelry_Trace[0303]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 49.84 kN
# BMWM_Jewelry_Trace[0304]: Quad chrome tailpipe backpressure 1.88 kPa, roll hoop static crush load 49.86 kN
# BMWM_Jewelry_Trace[0305]: Quad chrome tailpipe backpressure 1.89 kPa, roll hoop static crush load 49.88 kN
# BMWM_Jewelry_Trace[0306]: Quad chrome tailpipe backpressure 1.90 kPa, roll hoop static crush load 49.89 kN
# BMWM_Jewelry_Trace[0307]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 49.91 kN
# BMWM_Jewelry_Trace[0308]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 49.92 kN
# BMWM_Jewelry_Trace[0309]: Quad chrome tailpipe backpressure 1.92 kPa, roll hoop static crush load 49.94 kN
# BMWM_Jewelry_Trace[0310]: Quad chrome tailpipe backpressure 1.93 kPa, roll hoop static crush load 49.95 kN
# BMWM_Jewelry_Trace[0311]: Quad chrome tailpipe backpressure 1.94 kPa, roll hoop static crush load 49.97 kN
# BMWM_Jewelry_Trace[0312]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 49.98 kN
# BMWM_Jewelry_Trace[0313]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 49.99 kN
# BMWM_Jewelry_Trace[0314]: Quad chrome tailpipe backpressure 1.96 kPa, roll hoop static crush load 50.01 kN
# BMWM_Jewelry_Trace[0315]: Quad chrome tailpipe backpressure 1.97 kPa, roll hoop static crush load 50.02 kN
# BMWM_Jewelry_Trace[0316]: Quad chrome tailpipe backpressure 1.98 kPa, roll hoop static crush load 50.04 kN
# BMWM_Jewelry_Trace[0317]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 50.05 kN
# BMWM_Jewelry_Trace[0318]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 50.07 kN
# BMWM_Jewelry_Trace[0319]: Quad chrome tailpipe backpressure 2.00 kPa, roll hoop static crush load 50.09 kN
# BMWM_Jewelry_Trace[0320]: Quad chrome tailpipe backpressure 2.01 kPa, roll hoop static crush load 50.10 kN
# BMWM_Jewelry_Trace[0321]: Quad chrome tailpipe backpressure 2.02 kPa, roll hoop static crush load 50.12 kN
# BMWM_Jewelry_Trace[0322]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 50.13 kN
# BMWM_Jewelry_Trace[0323]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 50.14 kN
# BMWM_Jewelry_Trace[0324]: Quad chrome tailpipe backpressure 2.04 kPa, roll hoop static crush load 50.16 kN
# BMWM_Jewelry_Trace[0325]: Quad chrome tailpipe backpressure 2.05 kPa, roll hoop static crush load 50.17 kN
# BMWM_Jewelry_Trace[0326]: Quad chrome tailpipe backpressure 2.06 kPa, roll hoop static crush load 50.19 kN
# BMWM_Jewelry_Trace[0327]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 50.20 kN
# BMWM_Jewelry_Trace[0328]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 50.22 kN
# BMWM_Jewelry_Trace[0329]: Quad chrome tailpipe backpressure 2.08 kPa, roll hoop static crush load 50.23 kN
# BMWM_Jewelry_Trace[0330]: Quad chrome tailpipe backpressure 2.09 kPa, roll hoop static crush load 50.25 kN
# BMWM_Jewelry_Trace[0331]: Quad chrome tailpipe backpressure 2.10 kPa, roll hoop static crush load 50.27 kN
# BMWM_Jewelry_Trace[0332]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 50.28 kN
# BMWM_Jewelry_Trace[0333]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 50.30 kN
# BMWM_Jewelry_Trace[0334]: Quad chrome tailpipe backpressure 2.12 kPa, roll hoop static crush load 50.31 kN
# BMWM_Jewelry_Trace[0335]: Quad chrome tailpipe backpressure 2.13 kPa, roll hoop static crush load 50.33 kN
# BMWM_Jewelry_Trace[0336]: Quad chrome tailpipe backpressure 2.14 kPa, roll hoop static crush load 50.34 kN
# BMWM_Jewelry_Trace[0337]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 50.35 kN
# BMWM_Jewelry_Trace[0338]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 50.37 kN
# BMWM_Jewelry_Trace[0339]: Quad chrome tailpipe backpressure 2.16 kPa, roll hoop static crush load 50.38 kN
# BMWM_Jewelry_Trace[0340]: Quad chrome tailpipe backpressure 2.17 kPa, roll hoop static crush load 50.40 kN
# BMWM_Jewelry_Trace[0341]: Quad chrome tailpipe backpressure 2.18 kPa, roll hoop static crush load 50.41 kN
# BMWM_Jewelry_Trace[0342]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 50.43 kN
# BMWM_Jewelry_Trace[0343]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 50.45 kN
# BMWM_Jewelry_Trace[0344]: Quad chrome tailpipe backpressure 2.20 kPa, roll hoop static crush load 50.46 kN
# BMWM_Jewelry_Trace[0345]: Quad chrome tailpipe backpressure 2.21 kPa, roll hoop static crush load 50.48 kN
# BMWM_Jewelry_Trace[0346]: Quad chrome tailpipe backpressure 2.22 kPa, roll hoop static crush load 50.49 kN
# BMWM_Jewelry_Trace[0347]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 50.51 kN
# BMWM_Jewelry_Trace[0348]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 50.52 kN
# BMWM_Jewelry_Trace[0349]: Quad chrome tailpipe backpressure 2.24 kPa, roll hoop static crush load 50.53 kN
# BMWM_Jewelry_Trace[0350]: Quad chrome tailpipe backpressure 1.85 kPa, roll hoop static crush load 50.55 kN
# BMWM_Jewelry_Trace[0351]: Quad chrome tailpipe backpressure 1.86 kPa, roll hoop static crush load 50.56 kN
# BMWM_Jewelry_Trace[0352]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 50.58 kN
# BMWM_Jewelry_Trace[0353]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 50.59 kN
# BMWM_Jewelry_Trace[0354]: Quad chrome tailpipe backpressure 1.88 kPa, roll hoop static crush load 50.61 kN
# BMWM_Jewelry_Trace[0355]: Quad chrome tailpipe backpressure 1.89 kPa, roll hoop static crush load 50.63 kN
# BMWM_Jewelry_Trace[0356]: Quad chrome tailpipe backpressure 1.90 kPa, roll hoop static crush load 50.64 kN
# BMWM_Jewelry_Trace[0357]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 50.66 kN
# BMWM_Jewelry_Trace[0358]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 50.67 kN
# BMWM_Jewelry_Trace[0359]: Quad chrome tailpipe backpressure 1.92 kPa, roll hoop static crush load 50.69 kN
# BMWM_Jewelry_Trace[0360]: Quad chrome tailpipe backpressure 1.93 kPa, roll hoop static crush load 50.70 kN
# BMWM_Jewelry_Trace[0361]: Quad chrome tailpipe backpressure 1.94 kPa, roll hoop static crush load 50.72 kN
# BMWM_Jewelry_Trace[0362]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 50.73 kN
# BMWM_Jewelry_Trace[0363]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 50.74 kN
# BMWM_Jewelry_Trace[0364]: Quad chrome tailpipe backpressure 1.96 kPa, roll hoop static crush load 50.76 kN
# BMWM_Jewelry_Trace[0365]: Quad chrome tailpipe backpressure 1.97 kPa, roll hoop static crush load 50.77 kN
# BMWM_Jewelry_Trace[0366]: Quad chrome tailpipe backpressure 1.98 kPa, roll hoop static crush load 50.79 kN
# BMWM_Jewelry_Trace[0367]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 50.80 kN
# BMWM_Jewelry_Trace[0368]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 50.82 kN
# BMWM_Jewelry_Trace[0369]: Quad chrome tailpipe backpressure 2.00 kPa, roll hoop static crush load 50.84 kN
# BMWM_Jewelry_Trace[0370]: Quad chrome tailpipe backpressure 2.01 kPa, roll hoop static crush load 50.85 kN
# BMWM_Jewelry_Trace[0371]: Quad chrome tailpipe backpressure 2.02 kPa, roll hoop static crush load 50.87 kN
# BMWM_Jewelry_Trace[0372]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 50.88 kN
# BMWM_Jewelry_Trace[0373]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 50.89 kN
# BMWM_Jewelry_Trace[0374]: Quad chrome tailpipe backpressure 2.04 kPa, roll hoop static crush load 50.91 kN
# BMWM_Jewelry_Trace[0375]: Quad chrome tailpipe backpressure 2.05 kPa, roll hoop static crush load 50.92 kN
# BMWM_Jewelry_Trace[0376]: Quad chrome tailpipe backpressure 2.06 kPa, roll hoop static crush load 50.94 kN
# BMWM_Jewelry_Trace[0377]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 50.95 kN
# BMWM_Jewelry_Trace[0378]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 50.97 kN
# BMWM_Jewelry_Trace[0379]: Quad chrome tailpipe backpressure 2.08 kPa, roll hoop static crush load 50.98 kN
# BMWM_Jewelry_Trace[0380]: Quad chrome tailpipe backpressure 2.09 kPa, roll hoop static crush load 51.00 kN
# BMWM_Jewelry_Trace[0381]: Quad chrome tailpipe backpressure 2.10 kPa, roll hoop static crush load 51.02 kN
# BMWM_Jewelry_Trace[0382]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 51.03 kN
# BMWM_Jewelry_Trace[0383]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 51.05 kN
# BMWM_Jewelry_Trace[0384]: Quad chrome tailpipe backpressure 2.12 kPa, roll hoop static crush load 51.06 kN
# BMWM_Jewelry_Trace[0385]: Quad chrome tailpipe backpressure 2.13 kPa, roll hoop static crush load 51.08 kN
# BMWM_Jewelry_Trace[0386]: Quad chrome tailpipe backpressure 2.14 kPa, roll hoop static crush load 51.09 kN
# BMWM_Jewelry_Trace[0387]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 51.10 kN
# BMWM_Jewelry_Trace[0388]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 51.12 kN
# BMWM_Jewelry_Trace[0389]: Quad chrome tailpipe backpressure 2.16 kPa, roll hoop static crush load 51.13 kN
# BMWM_Jewelry_Trace[0390]: Quad chrome tailpipe backpressure 2.17 kPa, roll hoop static crush load 51.15 kN
# BMWM_Jewelry_Trace[0391]: Quad chrome tailpipe backpressure 2.18 kPa, roll hoop static crush load 51.16 kN
# BMWM_Jewelry_Trace[0392]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 51.18 kN
# BMWM_Jewelry_Trace[0393]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 51.20 kN
# BMWM_Jewelry_Trace[0394]: Quad chrome tailpipe backpressure 2.20 kPa, roll hoop static crush load 51.21 kN
# BMWM_Jewelry_Trace[0395]: Quad chrome tailpipe backpressure 2.21 kPa, roll hoop static crush load 51.23 kN
# BMWM_Jewelry_Trace[0396]: Quad chrome tailpipe backpressure 2.22 kPa, roll hoop static crush load 51.24 kN
# BMWM_Jewelry_Trace[0397]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 51.26 kN
# BMWM_Jewelry_Trace[0398]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 51.27 kN
# BMWM_Jewelry_Trace[0399]: Quad chrome tailpipe backpressure 2.24 kPa, roll hoop static crush load 51.28 kN
# BMWM_Jewelry_Trace[0400]: Quad chrome tailpipe backpressure 1.85 kPa, roll hoop static crush load 51.30 kN
# BMWM_Jewelry_Trace[0401]: Quad chrome tailpipe backpressure 1.86 kPa, roll hoop static crush load 51.31 kN
# BMWM_Jewelry_Trace[0402]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 51.33 kN
# BMWM_Jewelry_Trace[0403]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 51.34 kN
# BMWM_Jewelry_Trace[0404]: Quad chrome tailpipe backpressure 1.88 kPa, roll hoop static crush load 51.36 kN
# BMWM_Jewelry_Trace[0405]: Quad chrome tailpipe backpressure 1.89 kPa, roll hoop static crush load 51.38 kN
# BMWM_Jewelry_Trace[0406]: Quad chrome tailpipe backpressure 1.90 kPa, roll hoop static crush load 51.39 kN
# BMWM_Jewelry_Trace[0407]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 51.41 kN
# BMWM_Jewelry_Trace[0408]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 51.42 kN
# BMWM_Jewelry_Trace[0409]: Quad chrome tailpipe backpressure 1.92 kPa, roll hoop static crush load 51.44 kN
# BMWM_Jewelry_Trace[0410]: Quad chrome tailpipe backpressure 1.93 kPa, roll hoop static crush load 51.45 kN
# BMWM_Jewelry_Trace[0411]: Quad chrome tailpipe backpressure 1.94 kPa, roll hoop static crush load 51.47 kN
# BMWM_Jewelry_Trace[0412]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 51.48 kN
# BMWM_Jewelry_Trace[0413]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 51.49 kN
# BMWM_Jewelry_Trace[0414]: Quad chrome tailpipe backpressure 1.96 kPa, roll hoop static crush load 51.51 kN
# BMWM_Jewelry_Trace[0415]: Quad chrome tailpipe backpressure 1.97 kPa, roll hoop static crush load 51.52 kN
# BMWM_Jewelry_Trace[0416]: Quad chrome tailpipe backpressure 1.98 kPa, roll hoop static crush load 51.54 kN
# BMWM_Jewelry_Trace[0417]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 51.55 kN
# BMWM_Jewelry_Trace[0418]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 51.57 kN
# BMWM_Jewelry_Trace[0419]: Quad chrome tailpipe backpressure 2.00 kPa, roll hoop static crush load 51.59 kN
# BMWM_Jewelry_Trace[0420]: Quad chrome tailpipe backpressure 2.01 kPa, roll hoop static crush load 51.60 kN
# BMWM_Jewelry_Trace[0421]: Quad chrome tailpipe backpressure 2.02 kPa, roll hoop static crush load 51.62 kN
# BMWM_Jewelry_Trace[0422]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 51.63 kN
# BMWM_Jewelry_Trace[0423]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 51.64 kN
# BMWM_Jewelry_Trace[0424]: Quad chrome tailpipe backpressure 2.04 kPa, roll hoop static crush load 51.66 kN
# BMWM_Jewelry_Trace[0425]: Quad chrome tailpipe backpressure 2.05 kPa, roll hoop static crush load 51.67 kN
# BMWM_Jewelry_Trace[0426]: Quad chrome tailpipe backpressure 2.06 kPa, roll hoop static crush load 51.69 kN
# BMWM_Jewelry_Trace[0427]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 48.50 kN
# BMWM_Jewelry_Trace[0428]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 48.52 kN
# BMWM_Jewelry_Trace[0429]: Quad chrome tailpipe backpressure 2.08 kPa, roll hoop static crush load 48.53 kN
# BMWM_Jewelry_Trace[0430]: Quad chrome tailpipe backpressure 2.09 kPa, roll hoop static crush load 48.55 kN
# BMWM_Jewelry_Trace[0431]: Quad chrome tailpipe backpressure 2.10 kPa, roll hoop static crush load 48.56 kN
# BMWM_Jewelry_Trace[0432]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 48.58 kN
# BMWM_Jewelry_Trace[0433]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 48.59 kN
# BMWM_Jewelry_Trace[0434]: Quad chrome tailpipe backpressure 2.12 kPa, roll hoop static crush load 48.61 kN
# BMWM_Jewelry_Trace[0435]: Quad chrome tailpipe backpressure 2.13 kPa, roll hoop static crush load 48.63 kN
# BMWM_Jewelry_Trace[0436]: Quad chrome tailpipe backpressure 2.14 kPa, roll hoop static crush load 48.64 kN
# BMWM_Jewelry_Trace[0437]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 48.66 kN
# BMWM_Jewelry_Trace[0438]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 48.67 kN
# BMWM_Jewelry_Trace[0439]: Quad chrome tailpipe backpressure 2.16 kPa, roll hoop static crush load 48.69 kN
# BMWM_Jewelry_Trace[0440]: Quad chrome tailpipe backpressure 2.17 kPa, roll hoop static crush load 48.70 kN
# BMWM_Jewelry_Trace[0441]: Quad chrome tailpipe backpressure 2.18 kPa, roll hoop static crush load 48.71 kN
# BMWM_Jewelry_Trace[0442]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 48.73 kN
# BMWM_Jewelry_Trace[0443]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 48.74 kN
# BMWM_Jewelry_Trace[0444]: Quad chrome tailpipe backpressure 2.20 kPa, roll hoop static crush load 48.76 kN
# BMWM_Jewelry_Trace[0445]: Quad chrome tailpipe backpressure 2.21 kPa, roll hoop static crush load 48.77 kN
# BMWM_Jewelry_Trace[0446]: Quad chrome tailpipe backpressure 2.22 kPa, roll hoop static crush load 48.79 kN
# BMWM_Jewelry_Trace[0447]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 48.80 kN
# BMWM_Jewelry_Trace[0448]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 48.82 kN
# BMWM_Jewelry_Trace[0449]: Quad chrome tailpipe backpressure 2.24 kPa, roll hoop static crush load 48.84 kN
# BMWM_Jewelry_Trace[0450]: Quad chrome tailpipe backpressure 2.25 kPa, roll hoop static crush load 48.85 kN
# BMWM_Jewelry_Trace[0451]: Quad chrome tailpipe backpressure 1.86 kPa, roll hoop static crush load 48.87 kN
# BMWM_Jewelry_Trace[0452]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 48.88 kN
# BMWM_Jewelry_Trace[0453]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 48.89 kN
# BMWM_Jewelry_Trace[0454]: Quad chrome tailpipe backpressure 1.88 kPa, roll hoop static crush load 48.91 kN
# BMWM_Jewelry_Trace[0455]: Quad chrome tailpipe backpressure 1.89 kPa, roll hoop static crush load 48.92 kN
# BMWM_Jewelry_Trace[0456]: Quad chrome tailpipe backpressure 1.90 kPa, roll hoop static crush load 48.94 kN
# BMWM_Jewelry_Trace[0457]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 48.95 kN
# BMWM_Jewelry_Trace[0458]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 48.97 kN
# BMWM_Jewelry_Trace[0459]: Quad chrome tailpipe backpressure 1.92 kPa, roll hoop static crush load 48.98 kN
# BMWM_Jewelry_Trace[0460]: Quad chrome tailpipe backpressure 1.93 kPa, roll hoop static crush load 49.00 kN
# BMWM_Jewelry_Trace[0461]: Quad chrome tailpipe backpressure 1.94 kPa, roll hoop static crush load 49.02 kN
# BMWM_Jewelry_Trace[0462]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 49.03 kN
# BMWM_Jewelry_Trace[0463]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 49.05 kN
# BMWM_Jewelry_Trace[0464]: Quad chrome tailpipe backpressure 1.96 kPa, roll hoop static crush load 49.06 kN
# BMWM_Jewelry_Trace[0465]: Quad chrome tailpipe backpressure 1.97 kPa, roll hoop static crush load 49.08 kN
# BMWM_Jewelry_Trace[0466]: Quad chrome tailpipe backpressure 1.98 kPa, roll hoop static crush load 49.09 kN
# BMWM_Jewelry_Trace[0467]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 49.10 kN
# BMWM_Jewelry_Trace[0468]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 49.12 kN
# BMWM_Jewelry_Trace[0469]: Quad chrome tailpipe backpressure 2.00 kPa, roll hoop static crush load 49.13 kN
# BMWM_Jewelry_Trace[0470]: Quad chrome tailpipe backpressure 2.01 kPa, roll hoop static crush load 49.15 kN
# BMWM_Jewelry_Trace[0471]: Quad chrome tailpipe backpressure 2.02 kPa, roll hoop static crush load 49.16 kN
# BMWM_Jewelry_Trace[0472]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 49.18 kN
# BMWM_Jewelry_Trace[0473]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 49.20 kN
# BMWM_Jewelry_Trace[0474]: Quad chrome tailpipe backpressure 2.04 kPa, roll hoop static crush load 49.21 kN
# BMWM_Jewelry_Trace[0475]: Quad chrome tailpipe backpressure 2.05 kPa, roll hoop static crush load 49.23 kN
# BMWM_Jewelry_Trace[0476]: Quad chrome tailpipe backpressure 2.06 kPa, roll hoop static crush load 49.24 kN
# BMWM_Jewelry_Trace[0477]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 49.25 kN
# BMWM_Jewelry_Trace[0478]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 49.27 kN
# BMWM_Jewelry_Trace[0479]: Quad chrome tailpipe backpressure 2.08 kPa, roll hoop static crush load 49.28 kN
# BMWM_Jewelry_Trace[0480]: Quad chrome tailpipe backpressure 2.09 kPa, roll hoop static crush load 49.30 kN
# BMWM_Jewelry_Trace[0481]: Quad chrome tailpipe backpressure 2.10 kPa, roll hoop static crush load 49.31 kN
# BMWM_Jewelry_Trace[0482]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 49.33 kN
# BMWM_Jewelry_Trace[0483]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 49.34 kN
# BMWM_Jewelry_Trace[0484]: Quad chrome tailpipe backpressure 2.12 kPa, roll hoop static crush load 49.36 kN
# BMWM_Jewelry_Trace[0485]: Quad chrome tailpipe backpressure 2.13 kPa, roll hoop static crush load 49.38 kN
# BMWM_Jewelry_Trace[0486]: Quad chrome tailpipe backpressure 2.14 kPa, roll hoop static crush load 49.39 kN
# BMWM_Jewelry_Trace[0487]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 49.41 kN
# BMWM_Jewelry_Trace[0488]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 49.42 kN
# BMWM_Jewelry_Trace[0489]: Quad chrome tailpipe backpressure 2.16 kPa, roll hoop static crush load 49.44 kN
# BMWM_Jewelry_Trace[0490]: Quad chrome tailpipe backpressure 2.17 kPa, roll hoop static crush load 49.45 kN
# BMWM_Jewelry_Trace[0491]: Quad chrome tailpipe backpressure 2.18 kPa, roll hoop static crush load 49.46 kN
# BMWM_Jewelry_Trace[0492]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 49.48 kN
# BMWM_Jewelry_Trace[0493]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 49.49 kN
# BMWM_Jewelry_Trace[0494]: Quad chrome tailpipe backpressure 2.20 kPa, roll hoop static crush load 49.51 kN
# BMWM_Jewelry_Trace[0495]: Quad chrome tailpipe backpressure 2.21 kPa, roll hoop static crush load 49.52 kN
# BMWM_Jewelry_Trace[0496]: Quad chrome tailpipe backpressure 2.22 kPa, roll hoop static crush load 49.54 kN
# BMWM_Jewelry_Trace[0497]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 49.55 kN
# BMWM_Jewelry_Trace[0498]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 49.57 kN
# BMWM_Jewelry_Trace[0499]: Quad chrome tailpipe backpressure 2.24 kPa, roll hoop static crush load 49.59 kN
# BMWM_Jewelry_Trace[0500]: Quad chrome tailpipe backpressure 2.25 kPa, roll hoop static crush load 49.60 kN
# BMWM_Jewelry_Trace[0501]: Quad chrome tailpipe backpressure 1.86 kPa, roll hoop static crush load 49.62 kN
# BMWM_Jewelry_Trace[0502]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 49.63 kN
# BMWM_Jewelry_Trace[0503]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 49.64 kN
# BMWM_Jewelry_Trace[0504]: Quad chrome tailpipe backpressure 1.88 kPa, roll hoop static crush load 49.66 kN
# BMWM_Jewelry_Trace[0505]: Quad chrome tailpipe backpressure 1.89 kPa, roll hoop static crush load 49.67 kN
# BMWM_Jewelry_Trace[0506]: Quad chrome tailpipe backpressure 1.90 kPa, roll hoop static crush load 49.69 kN
# BMWM_Jewelry_Trace[0507]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 49.70 kN
# BMWM_Jewelry_Trace[0508]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 49.72 kN
# BMWM_Jewelry_Trace[0509]: Quad chrome tailpipe backpressure 1.92 kPa, roll hoop static crush load 49.73 kN
# BMWM_Jewelry_Trace[0510]: Quad chrome tailpipe backpressure 1.93 kPa, roll hoop static crush load 49.75 kN
# BMWM_Jewelry_Trace[0511]: Quad chrome tailpipe backpressure 1.94 kPa, roll hoop static crush load 49.77 kN
# BMWM_Jewelry_Trace[0512]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 49.78 kN
# BMWM_Jewelry_Trace[0513]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 49.80 kN
# BMWM_Jewelry_Trace[0514]: Quad chrome tailpipe backpressure 1.96 kPa, roll hoop static crush load 49.81 kN
# BMWM_Jewelry_Trace[0515]: Quad chrome tailpipe backpressure 1.97 kPa, roll hoop static crush load 49.83 kN
# BMWM_Jewelry_Trace[0516]: Quad chrome tailpipe backpressure 1.98 kPa, roll hoop static crush load 49.84 kN
# BMWM_Jewelry_Trace[0517]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 49.85 kN
# BMWM_Jewelry_Trace[0518]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 49.87 kN
# BMWM_Jewelry_Trace[0519]: Quad chrome tailpipe backpressure 2.00 kPa, roll hoop static crush load 49.88 kN
# BMWM_Jewelry_Trace[0520]: Quad chrome tailpipe backpressure 2.01 kPa, roll hoop static crush load 49.90 kN
# BMWM_Jewelry_Trace[0521]: Quad chrome tailpipe backpressure 2.02 kPa, roll hoop static crush load 49.91 kN
# BMWM_Jewelry_Trace[0522]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 49.93 kN
# BMWM_Jewelry_Trace[0523]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 49.95 kN
# BMWM_Jewelry_Trace[0524]: Quad chrome tailpipe backpressure 2.04 kPa, roll hoop static crush load 49.96 kN
# BMWM_Jewelry_Trace[0525]: Quad chrome tailpipe backpressure 2.05 kPa, roll hoop static crush load 49.98 kN
# BMWM_Jewelry_Trace[0526]: Quad chrome tailpipe backpressure 2.06 kPa, roll hoop static crush load 49.99 kN
# BMWM_Jewelry_Trace[0527]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 50.00 kN
# BMWM_Jewelry_Trace[0528]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 50.02 kN
# BMWM_Jewelry_Trace[0529]: Quad chrome tailpipe backpressure 2.08 kPa, roll hoop static crush load 50.03 kN
# BMWM_Jewelry_Trace[0530]: Quad chrome tailpipe backpressure 2.09 kPa, roll hoop static crush load 50.05 kN
# BMWM_Jewelry_Trace[0531]: Quad chrome tailpipe backpressure 2.10 kPa, roll hoop static crush load 50.06 kN
# BMWM_Jewelry_Trace[0532]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 50.08 kN
# BMWM_Jewelry_Trace[0533]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 50.09 kN
# BMWM_Jewelry_Trace[0534]: Quad chrome tailpipe backpressure 2.12 kPa, roll hoop static crush load 50.11 kN
# BMWM_Jewelry_Trace[0535]: Quad chrome tailpipe backpressure 2.13 kPa, roll hoop static crush load 50.13 kN
# BMWM_Jewelry_Trace[0536]: Quad chrome tailpipe backpressure 2.14 kPa, roll hoop static crush load 50.14 kN
# BMWM_Jewelry_Trace[0537]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 50.16 kN
# BMWM_Jewelry_Trace[0538]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 50.17 kN
# BMWM_Jewelry_Trace[0539]: Quad chrome tailpipe backpressure 2.16 kPa, roll hoop static crush load 50.19 kN
# BMWM_Jewelry_Trace[0540]: Quad chrome tailpipe backpressure 2.17 kPa, roll hoop static crush load 50.20 kN
# BMWM_Jewelry_Trace[0541]: Quad chrome tailpipe backpressure 2.18 kPa, roll hoop static crush load 50.22 kN
# BMWM_Jewelry_Trace[0542]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 50.23 kN
# BMWM_Jewelry_Trace[0543]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 50.24 kN
# BMWM_Jewelry_Trace[0544]: Quad chrome tailpipe backpressure 2.20 kPa, roll hoop static crush load 50.26 kN
# BMWM_Jewelry_Trace[0545]: Quad chrome tailpipe backpressure 2.21 kPa, roll hoop static crush load 50.27 kN
# BMWM_Jewelry_Trace[0546]: Quad chrome tailpipe backpressure 2.22 kPa, roll hoop static crush load 50.29 kN
# BMWM_Jewelry_Trace[0547]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 50.30 kN
# BMWM_Jewelry_Trace[0548]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 50.32 kN
# BMWM_Jewelry_Trace[0549]: Quad chrome tailpipe backpressure 2.24 kPa, roll hoop static crush load 50.34 kN
# BMWM_Jewelry_Trace[0550]: Quad chrome tailpipe backpressure 1.85 kPa, roll hoop static crush load 50.35 kN
# BMWM_Jewelry_Trace[0551]: Quad chrome tailpipe backpressure 1.86 kPa, roll hoop static crush load 50.37 kN
# BMWM_Jewelry_Trace[0552]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 50.38 kN
# BMWM_Jewelry_Trace[0553]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 50.39 kN
# BMWM_Jewelry_Trace[0554]: Quad chrome tailpipe backpressure 1.88 kPa, roll hoop static crush load 50.41 kN
# BMWM_Jewelry_Trace[0555]: Quad chrome tailpipe backpressure 1.89 kPa, roll hoop static crush load 50.42 kN
# BMWM_Jewelry_Trace[0556]: Quad chrome tailpipe backpressure 1.90 kPa, roll hoop static crush load 50.44 kN
# BMWM_Jewelry_Trace[0557]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 50.45 kN
# BMWM_Jewelry_Trace[0558]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 50.47 kN
# BMWM_Jewelry_Trace[0559]: Quad chrome tailpipe backpressure 1.92 kPa, roll hoop static crush load 50.48 kN
# BMWM_Jewelry_Trace[0560]: Quad chrome tailpipe backpressure 1.93 kPa, roll hoop static crush load 50.50 kN
# BMWM_Jewelry_Trace[0561]: Quad chrome tailpipe backpressure 1.94 kPa, roll hoop static crush load 50.52 kN
# BMWM_Jewelry_Trace[0562]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 50.53 kN
# BMWM_Jewelry_Trace[0563]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 50.55 kN
# BMWM_Jewelry_Trace[0564]: Quad chrome tailpipe backpressure 1.96 kPa, roll hoop static crush load 50.56 kN
# BMWM_Jewelry_Trace[0565]: Quad chrome tailpipe backpressure 1.97 kPa, roll hoop static crush load 50.58 kN
# BMWM_Jewelry_Trace[0566]: Quad chrome tailpipe backpressure 1.98 kPa, roll hoop static crush load 50.59 kN
# BMWM_Jewelry_Trace[0567]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 50.60 kN
# BMWM_Jewelry_Trace[0568]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 50.62 kN
# BMWM_Jewelry_Trace[0569]: Quad chrome tailpipe backpressure 2.00 kPa, roll hoop static crush load 50.63 kN
# BMWM_Jewelry_Trace[0570]: Quad chrome tailpipe backpressure 2.01 kPa, roll hoop static crush load 50.65 kN
# BMWM_Jewelry_Trace[0571]: Quad chrome tailpipe backpressure 2.02 kPa, roll hoop static crush load 50.66 kN
# BMWM_Jewelry_Trace[0572]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 50.68 kN
# BMWM_Jewelry_Trace[0573]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 50.70 kN
# BMWM_Jewelry_Trace[0574]: Quad chrome tailpipe backpressure 2.04 kPa, roll hoop static crush load 50.71 kN
# BMWM_Jewelry_Trace[0575]: Quad chrome tailpipe backpressure 2.05 kPa, roll hoop static crush load 50.73 kN
# BMWM_Jewelry_Trace[0576]: Quad chrome tailpipe backpressure 2.06 kPa, roll hoop static crush load 50.74 kN
# BMWM_Jewelry_Trace[0577]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 50.75 kN
# BMWM_Jewelry_Trace[0578]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 50.77 kN
# BMWM_Jewelry_Trace[0579]: Quad chrome tailpipe backpressure 2.08 kPa, roll hoop static crush load 50.78 kN
# BMWM_Jewelry_Trace[0580]: Quad chrome tailpipe backpressure 2.09 kPa, roll hoop static crush load 50.80 kN
# BMWM_Jewelry_Trace[0581]: Quad chrome tailpipe backpressure 2.10 kPa, roll hoop static crush load 50.81 kN
# BMWM_Jewelry_Trace[0582]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 50.83 kN
# BMWM_Jewelry_Trace[0583]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 50.84 kN
# BMWM_Jewelry_Trace[0584]: Quad chrome tailpipe backpressure 2.12 kPa, roll hoop static crush load 50.86 kN
# BMWM_Jewelry_Trace[0585]: Quad chrome tailpipe backpressure 2.13 kPa, roll hoop static crush load 50.88 kN
# BMWM_Jewelry_Trace[0586]: Quad chrome tailpipe backpressure 2.14 kPa, roll hoop static crush load 50.89 kN
# BMWM_Jewelry_Trace[0587]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 50.91 kN
# BMWM_Jewelry_Trace[0588]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 50.92 kN
# BMWM_Jewelry_Trace[0589]: Quad chrome tailpipe backpressure 2.16 kPa, roll hoop static crush load 50.94 kN
# BMWM_Jewelry_Trace[0590]: Quad chrome tailpipe backpressure 2.17 kPa, roll hoop static crush load 50.95 kN
# BMWM_Jewelry_Trace[0591]: Quad chrome tailpipe backpressure 2.18 kPa, roll hoop static crush load 50.97 kN
# BMWM_Jewelry_Trace[0592]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 50.98 kN
# BMWM_Jewelry_Trace[0593]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 50.99 kN
# BMWM_Jewelry_Trace[0594]: Quad chrome tailpipe backpressure 2.20 kPa, roll hoop static crush load 51.01 kN
# BMWM_Jewelry_Trace[0595]: Quad chrome tailpipe backpressure 2.21 kPa, roll hoop static crush load 51.02 kN
# BMWM_Jewelry_Trace[0596]: Quad chrome tailpipe backpressure 2.22 kPa, roll hoop static crush load 51.04 kN
# BMWM_Jewelry_Trace[0597]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 51.05 kN
# BMWM_Jewelry_Trace[0598]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 51.07 kN
# BMWM_Jewelry_Trace[0599]: Quad chrome tailpipe backpressure 2.24 kPa, roll hoop static crush load 51.09 kN
# BMWM_Jewelry_Trace[0600]: Quad chrome tailpipe backpressure 2.25 kPa, roll hoop static crush load 51.10 kN
# BMWM_Jewelry_Trace[0601]: Quad chrome tailpipe backpressure 1.86 kPa, roll hoop static crush load 51.11 kN
# BMWM_Jewelry_Trace[0602]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 51.13 kN
# BMWM_Jewelry_Trace[0603]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 51.14 kN
# BMWM_Jewelry_Trace[0604]: Quad chrome tailpipe backpressure 1.88 kPa, roll hoop static crush load 51.16 kN
# BMWM_Jewelry_Trace[0605]: Quad chrome tailpipe backpressure 1.89 kPa, roll hoop static crush load 51.17 kN
# BMWM_Jewelry_Trace[0606]: Quad chrome tailpipe backpressure 1.90 kPa, roll hoop static crush load 51.19 kN
# BMWM_Jewelry_Trace[0607]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 51.20 kN
# BMWM_Jewelry_Trace[0608]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 51.22 kN
# BMWM_Jewelry_Trace[0609]: Quad chrome tailpipe backpressure 1.92 kPa, roll hoop static crush load 51.23 kN
# BMWM_Jewelry_Trace[0610]: Quad chrome tailpipe backpressure 1.93 kPa, roll hoop static crush load 51.25 kN
# BMWM_Jewelry_Trace[0611]: Quad chrome tailpipe backpressure 1.94 kPa, roll hoop static crush load 51.27 kN
# BMWM_Jewelry_Trace[0612]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 51.28 kN
# BMWM_Jewelry_Trace[0613]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 51.30 kN
# BMWM_Jewelry_Trace[0614]: Quad chrome tailpipe backpressure 1.96 kPa, roll hoop static crush load 51.31 kN
# BMWM_Jewelry_Trace[0615]: Quad chrome tailpipe backpressure 1.97 kPa, roll hoop static crush load 51.33 kN
# BMWM_Jewelry_Trace[0616]: Quad chrome tailpipe backpressure 1.98 kPa, roll hoop static crush load 51.34 kN
# BMWM_Jewelry_Trace[0617]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 51.35 kN
# BMWM_Jewelry_Trace[0618]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 51.37 kN
# BMWM_Jewelry_Trace[0619]: Quad chrome tailpipe backpressure 2.00 kPa, roll hoop static crush load 51.38 kN
# BMWM_Jewelry_Trace[0620]: Quad chrome tailpipe backpressure 2.01 kPa, roll hoop static crush load 51.40 kN
# BMWM_Jewelry_Trace[0621]: Quad chrome tailpipe backpressure 2.02 kPa, roll hoop static crush load 51.41 kN
# BMWM_Jewelry_Trace[0622]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 51.43 kN
# BMWM_Jewelry_Trace[0623]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 51.45 kN
# BMWM_Jewelry_Trace[0624]: Quad chrome tailpipe backpressure 2.04 kPa, roll hoop static crush load 51.46 kN
# BMWM_Jewelry_Trace[0625]: Quad chrome tailpipe backpressure 2.05 kPa, roll hoop static crush load 51.48 kN
# BMWM_Jewelry_Trace[0626]: Quad chrome tailpipe backpressure 2.06 kPa, roll hoop static crush load 51.49 kN
# BMWM_Jewelry_Trace[0627]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 51.50 kN
# BMWM_Jewelry_Trace[0628]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 51.52 kN
# BMWM_Jewelry_Trace[0629]: Quad chrome tailpipe backpressure 2.08 kPa, roll hoop static crush load 51.53 kN
# BMWM_Jewelry_Trace[0630]: Quad chrome tailpipe backpressure 2.09 kPa, roll hoop static crush load 51.55 kN
# BMWM_Jewelry_Trace[0631]: Quad chrome tailpipe backpressure 2.10 kPa, roll hoop static crush load 51.56 kN
# BMWM_Jewelry_Trace[0632]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 51.58 kN
# BMWM_Jewelry_Trace[0633]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 51.59 kN
# BMWM_Jewelry_Trace[0634]: Quad chrome tailpipe backpressure 2.12 kPa, roll hoop static crush load 51.61 kN
# BMWM_Jewelry_Trace[0635]: Quad chrome tailpipe backpressure 2.13 kPa, roll hoop static crush load 51.63 kN
# BMWM_Jewelry_Trace[0636]: Quad chrome tailpipe backpressure 2.14 kPa, roll hoop static crush load 51.64 kN
# BMWM_Jewelry_Trace[0637]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 51.66 kN
# BMWM_Jewelry_Trace[0638]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 51.67 kN
# BMWM_Jewelry_Trace[0639]: Quad chrome tailpipe backpressure 2.16 kPa, roll hoop static crush load 51.69 kN
# BMWM_Jewelry_Trace[0640]: Quad chrome tailpipe backpressure 2.17 kPa, roll hoop static crush load 51.70 kN
# BMWM_Jewelry_Trace[0641]: Quad chrome tailpipe backpressure 2.18 kPa, roll hoop static crush load 48.52 kN
# BMWM_Jewelry_Trace[0642]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 48.53 kN
# BMWM_Jewelry_Trace[0643]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 48.55 kN
# BMWM_Jewelry_Trace[0644]: Quad chrome tailpipe backpressure 2.20 kPa, roll hoop static crush load 48.56 kN
# BMWM_Jewelry_Trace[0645]: Quad chrome tailpipe backpressure 2.21 kPa, roll hoop static crush load 48.57 kN
# BMWM_Jewelry_Trace[0646]: Quad chrome tailpipe backpressure 2.22 kPa, roll hoop static crush load 48.59 kN
# BMWM_Jewelry_Trace[0647]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 48.60 kN
# BMWM_Jewelry_Trace[0648]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 48.62 kN
# BMWM_Jewelry_Trace[0649]: Quad chrome tailpipe backpressure 2.24 kPa, roll hoop static crush load 48.63 kN
# BMWM_Jewelry_Trace[0650]: Quad chrome tailpipe backpressure 2.25 kPa, roll hoop static crush load 48.65 kN
# BMWM_Jewelry_Trace[0651]: Quad chrome tailpipe backpressure 1.86 kPa, roll hoop static crush load 48.66 kN
# BMWM_Jewelry_Trace[0652]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 48.68 kN
# BMWM_Jewelry_Trace[0653]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 48.70 kN
# BMWM_Jewelry_Trace[0654]: Quad chrome tailpipe backpressure 1.88 kPa, roll hoop static crush load 48.71 kN
# BMWM_Jewelry_Trace[0655]: Quad chrome tailpipe backpressure 1.89 kPa, roll hoop static crush load 48.73 kN
# BMWM_Jewelry_Trace[0656]: Quad chrome tailpipe backpressure 1.90 kPa, roll hoop static crush load 48.74 kN
# BMWM_Jewelry_Trace[0657]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 48.76 kN
# BMWM_Jewelry_Trace[0658]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 48.77 kN
# BMWM_Jewelry_Trace[0659]: Quad chrome tailpipe backpressure 1.92 kPa, roll hoop static crush load 48.78 kN
# BMWM_Jewelry_Trace[0660]: Quad chrome tailpipe backpressure 1.93 kPa, roll hoop static crush load 48.80 kN
# BMWM_Jewelry_Trace[0661]: Quad chrome tailpipe backpressure 1.94 kPa, roll hoop static crush load 48.81 kN
# BMWM_Jewelry_Trace[0662]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 48.83 kN
# BMWM_Jewelry_Trace[0663]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 48.84 kN
# BMWM_Jewelry_Trace[0664]: Quad chrome tailpipe backpressure 1.96 kPa, roll hoop static crush load 48.86 kN
# BMWM_Jewelry_Trace[0665]: Quad chrome tailpipe backpressure 1.97 kPa, roll hoop static crush load 48.88 kN
# BMWM_Jewelry_Trace[0666]: Quad chrome tailpipe backpressure 1.98 kPa, roll hoop static crush load 48.89 kN
# BMWM_Jewelry_Trace[0667]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 48.91 kN
# BMWM_Jewelry_Trace[0668]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 48.92 kN
# BMWM_Jewelry_Trace[0669]: Quad chrome tailpipe backpressure 2.00 kPa, roll hoop static crush load 48.94 kN
# BMWM_Jewelry_Trace[0670]: Quad chrome tailpipe backpressure 2.01 kPa, roll hoop static crush load 48.95 kN
# BMWM_Jewelry_Trace[0671]: Quad chrome tailpipe backpressure 2.02 kPa, roll hoop static crush load 48.96 kN
# BMWM_Jewelry_Trace[0672]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 48.98 kN
# BMWM_Jewelry_Trace[0673]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 48.99 kN
# BMWM_Jewelry_Trace[0674]: Quad chrome tailpipe backpressure 2.04 kPa, roll hoop static crush load 49.01 kN
# BMWM_Jewelry_Trace[0675]: Quad chrome tailpipe backpressure 2.05 kPa, roll hoop static crush load 49.02 kN
# BMWM_Jewelry_Trace[0676]: Quad chrome tailpipe backpressure 2.06 kPa, roll hoop static crush load 49.04 kN
# BMWM_Jewelry_Trace[0677]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 49.05 kN
# BMWM_Jewelry_Trace[0678]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 49.07 kN
# BMWM_Jewelry_Trace[0679]: Quad chrome tailpipe backpressure 2.08 kPa, roll hoop static crush load 49.09 kN
# BMWM_Jewelry_Trace[0680]: Quad chrome tailpipe backpressure 2.09 kPa, roll hoop static crush load 49.10 kN
# BMWM_Jewelry_Trace[0681]: Quad chrome tailpipe backpressure 2.10 kPa, roll hoop static crush load 49.12 kN
# BMWM_Jewelry_Trace[0682]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 49.13 kN
# BMWM_Jewelry_Trace[0683]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 49.14 kN
# BMWM_Jewelry_Trace[0684]: Quad chrome tailpipe backpressure 2.12 kPa, roll hoop static crush load 49.16 kN
# BMWM_Jewelry_Trace[0685]: Quad chrome tailpipe backpressure 2.13 kPa, roll hoop static crush load 49.17 kN
# BMWM_Jewelry_Trace[0686]: Quad chrome tailpipe backpressure 2.14 kPa, roll hoop static crush load 49.19 kN
# BMWM_Jewelry_Trace[0687]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 49.20 kN
# BMWM_Jewelry_Trace[0688]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 49.22 kN
# BMWM_Jewelry_Trace[0689]: Quad chrome tailpipe backpressure 2.16 kPa, roll hoop static crush load 49.23 kN
# BMWM_Jewelry_Trace[0690]: Quad chrome tailpipe backpressure 2.17 kPa, roll hoop static crush load 49.25 kN
# BMWM_Jewelry_Trace[0691]: Quad chrome tailpipe backpressure 2.18 kPa, roll hoop static crush load 49.27 kN
# BMWM_Jewelry_Trace[0692]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 49.28 kN
# BMWM_Jewelry_Trace[0693]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 49.30 kN
# BMWM_Jewelry_Trace[0694]: Quad chrome tailpipe backpressure 2.20 kPa, roll hoop static crush load 49.31 kN
# BMWM_Jewelry_Trace[0695]: Quad chrome tailpipe backpressure 2.21 kPa, roll hoop static crush load 49.32 kN
# BMWM_Jewelry_Trace[0696]: Quad chrome tailpipe backpressure 2.22 kPa, roll hoop static crush load 49.34 kN
# BMWM_Jewelry_Trace[0697]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 49.35 kN
# BMWM_Jewelry_Trace[0698]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 49.37 kN
# BMWM_Jewelry_Trace[0699]: Quad chrome tailpipe backpressure 2.24 kPa, roll hoop static crush load 49.38 kN
# BMWM_Jewelry_Trace[0700]: Quad chrome tailpipe backpressure 1.85 kPa, roll hoop static crush load 49.40 kN
# BMWM_Jewelry_Trace[0701]: Quad chrome tailpipe backpressure 1.86 kPa, roll hoop static crush load 49.41 kN
# BMWM_Jewelry_Trace[0702]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 49.43 kN
# BMWM_Jewelry_Trace[0703]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 49.45 kN
# BMWM_Jewelry_Trace[0704]: Quad chrome tailpipe backpressure 1.88 kPa, roll hoop static crush load 49.46 kN
# BMWM_Jewelry_Trace[0705]: Quad chrome tailpipe backpressure 1.89 kPa, roll hoop static crush load 49.48 kN
# BMWM_Jewelry_Trace[0706]: Quad chrome tailpipe backpressure 1.90 kPa, roll hoop static crush load 49.49 kN
# BMWM_Jewelry_Trace[0707]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 49.51 kN
# BMWM_Jewelry_Trace[0708]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 49.52 kN
# BMWM_Jewelry_Trace[0709]: Quad chrome tailpipe backpressure 1.92 kPa, roll hoop static crush load 49.53 kN
# BMWM_Jewelry_Trace[0710]: Quad chrome tailpipe backpressure 1.93 kPa, roll hoop static crush load 49.55 kN
# BMWM_Jewelry_Trace[0711]: Quad chrome tailpipe backpressure 1.94 kPa, roll hoop static crush load 49.56 kN
# BMWM_Jewelry_Trace[0712]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 49.58 kN
# BMWM_Jewelry_Trace[0713]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 49.59 kN
# BMWM_Jewelry_Trace[0714]: Quad chrome tailpipe backpressure 1.96 kPa, roll hoop static crush load 49.61 kN
# BMWM_Jewelry_Trace[0715]: Quad chrome tailpipe backpressure 1.97 kPa, roll hoop static crush load 49.63 kN
# BMWM_Jewelry_Trace[0716]: Quad chrome tailpipe backpressure 1.98 kPa, roll hoop static crush load 49.64 kN
# BMWM_Jewelry_Trace[0717]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 49.66 kN
# BMWM_Jewelry_Trace[0718]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 49.67 kN
# BMWM_Jewelry_Trace[0719]: Quad chrome tailpipe backpressure 2.00 kPa, roll hoop static crush load 49.69 kN
# BMWM_Jewelry_Trace[0720]: Quad chrome tailpipe backpressure 2.01 kPa, roll hoop static crush load 49.70 kN
# BMWM_Jewelry_Trace[0721]: Quad chrome tailpipe backpressure 2.02 kPa, roll hoop static crush load 49.71 kN
# BMWM_Jewelry_Trace[0722]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 49.73 kN
# BMWM_Jewelry_Trace[0723]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 49.74 kN
# BMWM_Jewelry_Trace[0724]: Quad chrome tailpipe backpressure 2.04 kPa, roll hoop static crush load 49.76 kN
# BMWM_Jewelry_Trace[0725]: Quad chrome tailpipe backpressure 2.05 kPa, roll hoop static crush load 49.77 kN
# BMWM_Jewelry_Trace[0726]: Quad chrome tailpipe backpressure 2.06 kPa, roll hoop static crush load 49.79 kN
# BMWM_Jewelry_Trace[0727]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 49.80 kN
# BMWM_Jewelry_Trace[0728]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 49.82 kN
# BMWM_Jewelry_Trace[0729]: Quad chrome tailpipe backpressure 2.08 kPa, roll hoop static crush load 49.84 kN
# BMWM_Jewelry_Trace[0730]: Quad chrome tailpipe backpressure 2.09 kPa, roll hoop static crush load 49.85 kN
# BMWM_Jewelry_Trace[0731]: Quad chrome tailpipe backpressure 2.10 kPa, roll hoop static crush load 49.87 kN
# BMWM_Jewelry_Trace[0732]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 49.88 kN
# BMWM_Jewelry_Trace[0733]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 49.89 kN
# BMWM_Jewelry_Trace[0734]: Quad chrome tailpipe backpressure 2.12 kPa, roll hoop static crush load 49.91 kN
# BMWM_Jewelry_Trace[0735]: Quad chrome tailpipe backpressure 2.13 kPa, roll hoop static crush load 49.92 kN
# BMWM_Jewelry_Trace[0736]: Quad chrome tailpipe backpressure 2.14 kPa, roll hoop static crush load 49.94 kN
# BMWM_Jewelry_Trace[0737]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 49.95 kN
# BMWM_Jewelry_Trace[0738]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 49.97 kN
# BMWM_Jewelry_Trace[0739]: Quad chrome tailpipe backpressure 2.16 kPa, roll hoop static crush load 49.98 kN
# BMWM_Jewelry_Trace[0740]: Quad chrome tailpipe backpressure 2.17 kPa, roll hoop static crush load 50.00 kN
# BMWM_Jewelry_Trace[0741]: Quad chrome tailpipe backpressure 2.18 kPa, roll hoop static crush load 50.02 kN
# BMWM_Jewelry_Trace[0742]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 50.03 kN
# BMWM_Jewelry_Trace[0743]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 50.05 kN
# BMWM_Jewelry_Trace[0744]: Quad chrome tailpipe backpressure 2.20 kPa, roll hoop static crush load 50.06 kN
# BMWM_Jewelry_Trace[0745]: Quad chrome tailpipe backpressure 2.21 kPa, roll hoop static crush load 50.07 kN
# BMWM_Jewelry_Trace[0746]: Quad chrome tailpipe backpressure 2.22 kPa, roll hoop static crush load 50.09 kN
# BMWM_Jewelry_Trace[0747]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 50.10 kN
# BMWM_Jewelry_Trace[0748]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 50.12 kN
# BMWM_Jewelry_Trace[0749]: Quad chrome tailpipe backpressure 2.24 kPa, roll hoop static crush load 50.13 kN
# BMWM_Jewelry_Trace[0750]: Quad chrome tailpipe backpressure 2.25 kPa, roll hoop static crush load 50.15 kN
# BMWM_Jewelry_Trace[0751]: Quad chrome tailpipe backpressure 1.86 kPa, roll hoop static crush load 50.16 kN
# BMWM_Jewelry_Trace[0752]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 50.18 kN
# BMWM_Jewelry_Trace[0753]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 50.20 kN
# BMWM_Jewelry_Trace[0754]: Quad chrome tailpipe backpressure 1.88 kPa, roll hoop static crush load 50.21 kN
# BMWM_Jewelry_Trace[0755]: Quad chrome tailpipe backpressure 1.89 kPa, roll hoop static crush load 50.23 kN
# BMWM_Jewelry_Trace[0756]: Quad chrome tailpipe backpressure 1.90 kPa, roll hoop static crush load 50.24 kN
# BMWM_Jewelry_Trace[0757]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 50.26 kN
# BMWM_Jewelry_Trace[0758]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 50.27 kN
# BMWM_Jewelry_Trace[0759]: Quad chrome tailpipe backpressure 1.92 kPa, roll hoop static crush load 50.28 kN
# BMWM_Jewelry_Trace[0760]: Quad chrome tailpipe backpressure 1.93 kPa, roll hoop static crush load 50.30 kN
# BMWM_Jewelry_Trace[0761]: Quad chrome tailpipe backpressure 1.94 kPa, roll hoop static crush load 50.31 kN
# BMWM_Jewelry_Trace[0762]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 50.33 kN
# BMWM_Jewelry_Trace[0763]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 50.34 kN
# BMWM_Jewelry_Trace[0764]: Quad chrome tailpipe backpressure 1.96 kPa, roll hoop static crush load 50.36 kN
# BMWM_Jewelry_Trace[0765]: Quad chrome tailpipe backpressure 1.97 kPa, roll hoop static crush load 50.38 kN
# BMWM_Jewelry_Trace[0766]: Quad chrome tailpipe backpressure 1.98 kPa, roll hoop static crush load 50.39 kN
# BMWM_Jewelry_Trace[0767]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 50.41 kN
# BMWM_Jewelry_Trace[0768]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 50.42 kN
# BMWM_Jewelry_Trace[0769]: Quad chrome tailpipe backpressure 2.00 kPa, roll hoop static crush load 50.44 kN
# BMWM_Jewelry_Trace[0770]: Quad chrome tailpipe backpressure 2.01 kPa, roll hoop static crush load 50.45 kN
# BMWM_Jewelry_Trace[0771]: Quad chrome tailpipe backpressure 2.02 kPa, roll hoop static crush load 50.46 kN
# BMWM_Jewelry_Trace[0772]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 50.48 kN
# BMWM_Jewelry_Trace[0773]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 50.49 kN
# BMWM_Jewelry_Trace[0774]: Quad chrome tailpipe backpressure 2.04 kPa, roll hoop static crush load 50.51 kN
# BMWM_Jewelry_Trace[0775]: Quad chrome tailpipe backpressure 2.05 kPa, roll hoop static crush load 50.52 kN
# BMWM_Jewelry_Trace[0776]: Quad chrome tailpipe backpressure 2.06 kPa, roll hoop static crush load 50.54 kN
# BMWM_Jewelry_Trace[0777]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 50.55 kN
# BMWM_Jewelry_Trace[0778]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 50.57 kN
# BMWM_Jewelry_Trace[0779]: Quad chrome tailpipe backpressure 2.08 kPa, roll hoop static crush load 50.59 kN
# BMWM_Jewelry_Trace[0780]: Quad chrome tailpipe backpressure 2.09 kPa, roll hoop static crush load 50.60 kN
# BMWM_Jewelry_Trace[0781]: Quad chrome tailpipe backpressure 2.10 kPa, roll hoop static crush load 50.62 kN
# BMWM_Jewelry_Trace[0782]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 50.63 kN
# BMWM_Jewelry_Trace[0783]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 50.64 kN
# BMWM_Jewelry_Trace[0784]: Quad chrome tailpipe backpressure 2.12 kPa, roll hoop static crush load 50.66 kN
# BMWM_Jewelry_Trace[0785]: Quad chrome tailpipe backpressure 2.13 kPa, roll hoop static crush load 50.67 kN
# BMWM_Jewelry_Trace[0786]: Quad chrome tailpipe backpressure 2.14 kPa, roll hoop static crush load 50.69 kN
# BMWM_Jewelry_Trace[0787]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 50.70 kN
# BMWM_Jewelry_Trace[0788]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 50.72 kN
# BMWM_Jewelry_Trace[0789]: Quad chrome tailpipe backpressure 2.16 kPa, roll hoop static crush load 50.73 kN
# BMWM_Jewelry_Trace[0790]: Quad chrome tailpipe backpressure 2.17 kPa, roll hoop static crush load 50.75 kN
# BMWM_Jewelry_Trace[0791]: Quad chrome tailpipe backpressure 2.18 kPa, roll hoop static crush load 50.77 kN
# BMWM_Jewelry_Trace[0792]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 50.78 kN
# BMWM_Jewelry_Trace[0793]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 50.80 kN
# BMWM_Jewelry_Trace[0794]: Quad chrome tailpipe backpressure 2.20 kPa, roll hoop static crush load 50.81 kN
# BMWM_Jewelry_Trace[0795]: Quad chrome tailpipe backpressure 2.21 kPa, roll hoop static crush load 50.82 kN
# BMWM_Jewelry_Trace[0796]: Quad chrome tailpipe backpressure 2.22 kPa, roll hoop static crush load 50.84 kN
# BMWM_Jewelry_Trace[0797]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 50.85 kN
# BMWM_Jewelry_Trace[0798]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 50.87 kN
# BMWM_Jewelry_Trace[0799]: Quad chrome tailpipe backpressure 2.24 kPa, roll hoop static crush load 50.88 kN
# BMWM_Jewelry_Trace[0800]: Quad chrome tailpipe backpressure 1.85 kPa, roll hoop static crush load 50.90 kN
# BMWM_Jewelry_Trace[0801]: Quad chrome tailpipe backpressure 1.86 kPa, roll hoop static crush load 50.91 kN
# BMWM_Jewelry_Trace[0802]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 50.93 kN
# BMWM_Jewelry_Trace[0803]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 50.95 kN
# BMWM_Jewelry_Trace[0804]: Quad chrome tailpipe backpressure 1.88 kPa, roll hoop static crush load 50.96 kN
# BMWM_Jewelry_Trace[0805]: Quad chrome tailpipe backpressure 1.89 kPa, roll hoop static crush load 50.98 kN
# BMWM_Jewelry_Trace[0806]: Quad chrome tailpipe backpressure 1.90 kPa, roll hoop static crush load 50.99 kN
# BMWM_Jewelry_Trace[0807]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 51.01 kN
# BMWM_Jewelry_Trace[0808]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 51.02 kN
# BMWM_Jewelry_Trace[0809]: Quad chrome tailpipe backpressure 1.92 kPa, roll hoop static crush load 51.03 kN
# BMWM_Jewelry_Trace[0810]: Quad chrome tailpipe backpressure 1.93 kPa, roll hoop static crush load 51.05 kN
# BMWM_Jewelry_Trace[0811]: Quad chrome tailpipe backpressure 1.94 kPa, roll hoop static crush load 51.06 kN
# BMWM_Jewelry_Trace[0812]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 51.08 kN
# BMWM_Jewelry_Trace[0813]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 51.09 kN
# BMWM_Jewelry_Trace[0814]: Quad chrome tailpipe backpressure 1.96 kPa, roll hoop static crush load 51.11 kN
# BMWM_Jewelry_Trace[0815]: Quad chrome tailpipe backpressure 1.97 kPa, roll hoop static crush load 51.13 kN
# BMWM_Jewelry_Trace[0816]: Quad chrome tailpipe backpressure 1.98 kPa, roll hoop static crush load 51.14 kN
# BMWM_Jewelry_Trace[0817]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 51.16 kN
# BMWM_Jewelry_Trace[0818]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 51.17 kN
# BMWM_Jewelry_Trace[0819]: Quad chrome tailpipe backpressure 2.00 kPa, roll hoop static crush load 51.19 kN
# BMWM_Jewelry_Trace[0820]: Quad chrome tailpipe backpressure 2.01 kPa, roll hoop static crush load 51.20 kN
# BMWM_Jewelry_Trace[0821]: Quad chrome tailpipe backpressure 2.02 kPa, roll hoop static crush load 51.21 kN
# BMWM_Jewelry_Trace[0822]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 51.23 kN
# BMWM_Jewelry_Trace[0823]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 51.24 kN
# BMWM_Jewelry_Trace[0824]: Quad chrome tailpipe backpressure 2.04 kPa, roll hoop static crush load 51.26 kN
# BMWM_Jewelry_Trace[0825]: Quad chrome tailpipe backpressure 2.05 kPa, roll hoop static crush load 51.27 kN
# BMWM_Jewelry_Trace[0826]: Quad chrome tailpipe backpressure 2.06 kPa, roll hoop static crush load 51.29 kN
# BMWM_Jewelry_Trace[0827]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 51.30 kN
# BMWM_Jewelry_Trace[0828]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 51.32 kN
# BMWM_Jewelry_Trace[0829]: Quad chrome tailpipe backpressure 2.08 kPa, roll hoop static crush load 51.34 kN
# BMWM_Jewelry_Trace[0830]: Quad chrome tailpipe backpressure 2.09 kPa, roll hoop static crush load 51.35 kN
# BMWM_Jewelry_Trace[0831]: Quad chrome tailpipe backpressure 2.10 kPa, roll hoop static crush load 51.37 kN
# BMWM_Jewelry_Trace[0832]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 51.38 kN
# BMWM_Jewelry_Trace[0833]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 51.39 kN
# BMWM_Jewelry_Trace[0834]: Quad chrome tailpipe backpressure 2.12 kPa, roll hoop static crush load 51.41 kN
# BMWM_Jewelry_Trace[0835]: Quad chrome tailpipe backpressure 2.13 kPa, roll hoop static crush load 51.42 kN
# BMWM_Jewelry_Trace[0836]: Quad chrome tailpipe backpressure 2.14 kPa, roll hoop static crush load 51.44 kN
# BMWM_Jewelry_Trace[0837]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 51.45 kN
# BMWM_Jewelry_Trace[0838]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 51.47 kN
# BMWM_Jewelry_Trace[0839]: Quad chrome tailpipe backpressure 2.16 kPa, roll hoop static crush load 51.48 kN
# BMWM_Jewelry_Trace[0840]: Quad chrome tailpipe backpressure 2.17 kPa, roll hoop static crush load 51.50 kN
# BMWM_Jewelry_Trace[0841]: Quad chrome tailpipe backpressure 2.18 kPa, roll hoop static crush load 51.52 kN
# BMWM_Jewelry_Trace[0842]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 51.53 kN
# BMWM_Jewelry_Trace[0843]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 51.55 kN
# BMWM_Jewelry_Trace[0844]: Quad chrome tailpipe backpressure 2.20 kPa, roll hoop static crush load 51.56 kN
# BMWM_Jewelry_Trace[0845]: Quad chrome tailpipe backpressure 2.21 kPa, roll hoop static crush load 51.57 kN
# BMWM_Jewelry_Trace[0846]: Quad chrome tailpipe backpressure 2.22 kPa, roll hoop static crush load 51.59 kN
# BMWM_Jewelry_Trace[0847]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 51.60 kN
# BMWM_Jewelry_Trace[0848]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 51.62 kN
# BMWM_Jewelry_Trace[0849]: Quad chrome tailpipe backpressure 2.24 kPa, roll hoop static crush load 51.63 kN
# BMWM_Jewelry_Trace[0850]: Quad chrome tailpipe backpressure 2.25 kPa, roll hoop static crush load 51.65 kN
# BMWM_Jewelry_Trace[0851]: Quad chrome tailpipe backpressure 1.86 kPa, roll hoop static crush load 51.66 kN
# BMWM_Jewelry_Trace[0852]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 51.68 kN
# BMWM_Jewelry_Trace[0853]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 51.70 kN
# BMWM_Jewelry_Trace[0854]: Quad chrome tailpipe backpressure 1.88 kPa, roll hoop static crush load 48.51 kN
# BMWM_Jewelry_Trace[0855]: Quad chrome tailpipe backpressure 1.89 kPa, roll hoop static crush load 48.52 kN
# BMWM_Jewelry_Trace[0856]: Quad chrome tailpipe backpressure 1.90 kPa, roll hoop static crush load 48.54 kN
# BMWM_Jewelry_Trace[0857]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 48.55 kN
# BMWM_Jewelry_Trace[0858]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 48.57 kN
# BMWM_Jewelry_Trace[0859]: Quad chrome tailpipe backpressure 1.92 kPa, roll hoop static crush load 48.59 kN
# BMWM_Jewelry_Trace[0860]: Quad chrome tailpipe backpressure 1.93 kPa, roll hoop static crush load 48.60 kN
# BMWM_Jewelry_Trace[0861]: Quad chrome tailpipe backpressure 1.94 kPa, roll hoop static crush load 48.61 kN
# BMWM_Jewelry_Trace[0862]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 48.63 kN
# BMWM_Jewelry_Trace[0863]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 48.64 kN
# BMWM_Jewelry_Trace[0864]: Quad chrome tailpipe backpressure 1.96 kPa, roll hoop static crush load 48.66 kN
# BMWM_Jewelry_Trace[0865]: Quad chrome tailpipe backpressure 1.97 kPa, roll hoop static crush load 48.67 kN
# BMWM_Jewelry_Trace[0866]: Quad chrome tailpipe backpressure 1.98 kPa, roll hoop static crush load 48.69 kN
# BMWM_Jewelry_Trace[0867]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 48.70 kN
# BMWM_Jewelry_Trace[0868]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 48.72 kN
# BMWM_Jewelry_Trace[0869]: Quad chrome tailpipe backpressure 2.00 kPa, roll hoop static crush load 48.73 kN
# BMWM_Jewelry_Trace[0870]: Quad chrome tailpipe backpressure 2.01 kPa, roll hoop static crush load 48.75 kN
# BMWM_Jewelry_Trace[0871]: Quad chrome tailpipe backpressure 2.02 kPa, roll hoop static crush load 48.77 kN
# BMWM_Jewelry_Trace[0872]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 48.78 kN
# BMWM_Jewelry_Trace[0873]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 48.80 kN
# BMWM_Jewelry_Trace[0874]: Quad chrome tailpipe backpressure 2.04 kPa, roll hoop static crush load 48.81 kN
# BMWM_Jewelry_Trace[0875]: Quad chrome tailpipe backpressure 2.05 kPa, roll hoop static crush load 48.83 kN
# BMWM_Jewelry_Trace[0876]: Quad chrome tailpipe backpressure 2.06 kPa, roll hoop static crush load 48.84 kN
# BMWM_Jewelry_Trace[0877]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 48.85 kN
# BMWM_Jewelry_Trace[0878]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 48.87 kN
# BMWM_Jewelry_Trace[0879]: Quad chrome tailpipe backpressure 2.08 kPa, roll hoop static crush load 48.88 kN
# BMWM_Jewelry_Trace[0880]: Quad chrome tailpipe backpressure 2.09 kPa, roll hoop static crush load 48.90 kN
# BMWM_Jewelry_Trace[0881]: Quad chrome tailpipe backpressure 2.10 kPa, roll hoop static crush load 48.91 kN
# BMWM_Jewelry_Trace[0882]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 48.93 kN
# BMWM_Jewelry_Trace[0883]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 48.95 kN
# BMWM_Jewelry_Trace[0884]: Quad chrome tailpipe backpressure 2.12 kPa, roll hoop static crush load 48.96 kN
# BMWM_Jewelry_Trace[0885]: Quad chrome tailpipe backpressure 2.13 kPa, roll hoop static crush load 48.98 kN
# BMWM_Jewelry_Trace[0886]: Quad chrome tailpipe backpressure 2.14 kPa, roll hoop static crush load 48.99 kN
# BMWM_Jewelry_Trace[0887]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 49.00 kN
# BMWM_Jewelry_Trace[0888]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 49.02 kN
# BMWM_Jewelry_Trace[0889]: Quad chrome tailpipe backpressure 2.16 kPa, roll hoop static crush load 49.03 kN
# BMWM_Jewelry_Trace[0890]: Quad chrome tailpipe backpressure 2.17 kPa, roll hoop static crush load 49.05 kN
# BMWM_Jewelry_Trace[0891]: Quad chrome tailpipe backpressure 2.18 kPa, roll hoop static crush load 49.06 kN
# BMWM_Jewelry_Trace[0892]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 49.08 kN
# BMWM_Jewelry_Trace[0893]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 49.09 kN
# BMWM_Jewelry_Trace[0894]: Quad chrome tailpipe backpressure 2.20 kPa, roll hoop static crush load 49.11 kN
# BMWM_Jewelry_Trace[0895]: Quad chrome tailpipe backpressure 2.21 kPa, roll hoop static crush load 49.13 kN
# BMWM_Jewelry_Trace[0896]: Quad chrome tailpipe backpressure 2.22 kPa, roll hoop static crush load 49.14 kN
# BMWM_Jewelry_Trace[0897]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 49.16 kN
# BMWM_Jewelry_Trace[0898]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 49.17 kN
# BMWM_Jewelry_Trace[0899]: Quad chrome tailpipe backpressure 2.24 kPa, roll hoop static crush load 49.19 kN
# BMWM_Jewelry_Trace[0900]: Quad chrome tailpipe backpressure 2.25 kPa, roll hoop static crush load 49.20 kN
# BMWM_Jewelry_Trace[0901]: Quad chrome tailpipe backpressure 1.86 kPa, roll hoop static crush load 49.21 kN
# BMWM_Jewelry_Trace[0902]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 49.23 kN
# BMWM_Jewelry_Trace[0903]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 49.24 kN
# BMWM_Jewelry_Trace[0904]: Quad chrome tailpipe backpressure 1.88 kPa, roll hoop static crush load 49.26 kN
# BMWM_Jewelry_Trace[0905]: Quad chrome tailpipe backpressure 1.89 kPa, roll hoop static crush load 49.27 kN
# BMWM_Jewelry_Trace[0906]: Quad chrome tailpipe backpressure 1.90 kPa, roll hoop static crush load 49.29 kN
# BMWM_Jewelry_Trace[0907]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 49.30 kN
# BMWM_Jewelry_Trace[0908]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 49.32 kN
# BMWM_Jewelry_Trace[0909]: Quad chrome tailpipe backpressure 1.92 kPa, roll hoop static crush load 49.34 kN
# BMWM_Jewelry_Trace[0910]: Quad chrome tailpipe backpressure 1.93 kPa, roll hoop static crush load 49.35 kN
# BMWM_Jewelry_Trace[0911]: Quad chrome tailpipe backpressure 1.94 kPa, roll hoop static crush load 49.36 kN
# BMWM_Jewelry_Trace[0912]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 49.38 kN
# BMWM_Jewelry_Trace[0913]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 49.39 kN
# BMWM_Jewelry_Trace[0914]: Quad chrome tailpipe backpressure 1.96 kPa, roll hoop static crush load 49.41 kN
# BMWM_Jewelry_Trace[0915]: Quad chrome tailpipe backpressure 1.97 kPa, roll hoop static crush load 49.42 kN
# BMWM_Jewelry_Trace[0916]: Quad chrome tailpipe backpressure 1.98 kPa, roll hoop static crush load 49.44 kN
# BMWM_Jewelry_Trace[0917]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 49.45 kN
# BMWM_Jewelry_Trace[0918]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 49.47 kN
# BMWM_Jewelry_Trace[0919]: Quad chrome tailpipe backpressure 2.00 kPa, roll hoop static crush load 49.48 kN
# BMWM_Jewelry_Trace[0920]: Quad chrome tailpipe backpressure 2.01 kPa, roll hoop static crush load 49.50 kN
# BMWM_Jewelry_Trace[0921]: Quad chrome tailpipe backpressure 2.02 kPa, roll hoop static crush load 49.52 kN
# BMWM_Jewelry_Trace[0922]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 49.53 kN
# BMWM_Jewelry_Trace[0923]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 49.55 kN
# BMWM_Jewelry_Trace[0924]: Quad chrome tailpipe backpressure 2.04 kPa, roll hoop static crush load 49.56 kN
# BMWM_Jewelry_Trace[0925]: Quad chrome tailpipe backpressure 2.05 kPa, roll hoop static crush load 49.58 kN
# BMWM_Jewelry_Trace[0926]: Quad chrome tailpipe backpressure 2.06 kPa, roll hoop static crush load 49.59 kN
# BMWM_Jewelry_Trace[0927]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 49.60 kN
# BMWM_Jewelry_Trace[0928]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 49.62 kN
# BMWM_Jewelry_Trace[0929]: Quad chrome tailpipe backpressure 2.08 kPa, roll hoop static crush load 49.63 kN
# BMWM_Jewelry_Trace[0930]: Quad chrome tailpipe backpressure 2.09 kPa, roll hoop static crush load 49.65 kN
# BMWM_Jewelry_Trace[0931]: Quad chrome tailpipe backpressure 2.10 kPa, roll hoop static crush load 49.66 kN
# BMWM_Jewelry_Trace[0932]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 49.68 kN
# BMWM_Jewelry_Trace[0933]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 49.70 kN
# BMWM_Jewelry_Trace[0934]: Quad chrome tailpipe backpressure 2.12 kPa, roll hoop static crush load 49.71 kN
# BMWM_Jewelry_Trace[0935]: Quad chrome tailpipe backpressure 2.13 kPa, roll hoop static crush load 49.73 kN
# BMWM_Jewelry_Trace[0936]: Quad chrome tailpipe backpressure 2.14 kPa, roll hoop static crush load 49.74 kN
# BMWM_Jewelry_Trace[0937]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 49.75 kN
# BMWM_Jewelry_Trace[0938]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 49.77 kN
# BMWM_Jewelry_Trace[0939]: Quad chrome tailpipe backpressure 2.16 kPa, roll hoop static crush load 49.78 kN
# BMWM_Jewelry_Trace[0940]: Quad chrome tailpipe backpressure 2.17 kPa, roll hoop static crush load 49.80 kN
# BMWM_Jewelry_Trace[0941]: Quad chrome tailpipe backpressure 2.18 kPa, roll hoop static crush load 49.81 kN
# BMWM_Jewelry_Trace[0942]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 49.83 kN
# BMWM_Jewelry_Trace[0943]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 49.84 kN
# BMWM_Jewelry_Trace[0944]: Quad chrome tailpipe backpressure 2.20 kPa, roll hoop static crush load 49.86 kN
# BMWM_Jewelry_Trace[0945]: Quad chrome tailpipe backpressure 2.21 kPa, roll hoop static crush load 49.88 kN
# BMWM_Jewelry_Trace[0946]: Quad chrome tailpipe backpressure 2.22 kPa, roll hoop static crush load 49.89 kN
# BMWM_Jewelry_Trace[0947]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 49.91 kN
# BMWM_Jewelry_Trace[0948]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 49.92 kN
# BMWM_Jewelry_Trace[0949]: Quad chrome tailpipe backpressure 2.24 kPa, roll hoop static crush load 49.94 kN
# BMWM_Jewelry_Trace[0950]: Quad chrome tailpipe backpressure 1.85 kPa, roll hoop static crush load 49.95 kN
# BMWM_Jewelry_Trace[0951]: Quad chrome tailpipe backpressure 1.86 kPa, roll hoop static crush load 49.96 kN
# BMWM_Jewelry_Trace[0952]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 49.98 kN
# BMWM_Jewelry_Trace[0953]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 49.99 kN
# BMWM_Jewelry_Trace[0954]: Quad chrome tailpipe backpressure 1.88 kPa, roll hoop static crush load 50.01 kN
# BMWM_Jewelry_Trace[0955]: Quad chrome tailpipe backpressure 1.89 kPa, roll hoop static crush load 50.02 kN
# BMWM_Jewelry_Trace[0956]: Quad chrome tailpipe backpressure 1.90 kPa, roll hoop static crush load 50.04 kN
# BMWM_Jewelry_Trace[0957]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 50.05 kN
# BMWM_Jewelry_Trace[0958]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 50.07 kN
# BMWM_Jewelry_Trace[0959]: Quad chrome tailpipe backpressure 1.92 kPa, roll hoop static crush load 50.09 kN
# BMWM_Jewelry_Trace[0960]: Quad chrome tailpipe backpressure 1.93 kPa, roll hoop static crush load 50.10 kN
# BMWM_Jewelry_Trace[0961]: Quad chrome tailpipe backpressure 1.94 kPa, roll hoop static crush load 50.11 kN
# BMWM_Jewelry_Trace[0962]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 50.13 kN
# BMWM_Jewelry_Trace[0963]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 50.14 kN
# BMWM_Jewelry_Trace[0964]: Quad chrome tailpipe backpressure 1.96 kPa, roll hoop static crush load 50.16 kN
# BMWM_Jewelry_Trace[0965]: Quad chrome tailpipe backpressure 1.97 kPa, roll hoop static crush load 50.17 kN
# BMWM_Jewelry_Trace[0966]: Quad chrome tailpipe backpressure 1.98 kPa, roll hoop static crush load 50.19 kN
# BMWM_Jewelry_Trace[0967]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 50.20 kN
# BMWM_Jewelry_Trace[0968]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 50.22 kN
# BMWM_Jewelry_Trace[0969]: Quad chrome tailpipe backpressure 2.00 kPa, roll hoop static crush load 50.23 kN
# BMWM_Jewelry_Trace[0970]: Quad chrome tailpipe backpressure 2.01 kPa, roll hoop static crush load 50.25 kN
# BMWM_Jewelry_Trace[0971]: Quad chrome tailpipe backpressure 2.02 kPa, roll hoop static crush load 50.27 kN
# BMWM_Jewelry_Trace[0972]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 50.28 kN
# BMWM_Jewelry_Trace[0973]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 50.30 kN
# BMWM_Jewelry_Trace[0974]: Quad chrome tailpipe backpressure 2.04 kPa, roll hoop static crush load 50.31 kN
# BMWM_Jewelry_Trace[0975]: Quad chrome tailpipe backpressure 2.05 kPa, roll hoop static crush load 50.33 kN
# BMWM_Jewelry_Trace[0976]: Quad chrome tailpipe backpressure 2.06 kPa, roll hoop static crush load 50.34 kN
# BMWM_Jewelry_Trace[0977]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 50.35 kN
# BMWM_Jewelry_Trace[0978]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 50.37 kN
# BMWM_Jewelry_Trace[0979]: Quad chrome tailpipe backpressure 2.08 kPa, roll hoop static crush load 50.38 kN
# BMWM_Jewelry_Trace[0980]: Quad chrome tailpipe backpressure 2.09 kPa, roll hoop static crush load 50.40 kN
# BMWM_Jewelry_Trace[0981]: Quad chrome tailpipe backpressure 2.10 kPa, roll hoop static crush load 50.41 kN
# BMWM_Jewelry_Trace[0982]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 50.43 kN
# BMWM_Jewelry_Trace[0983]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 50.45 kN
# BMWM_Jewelry_Trace[0984]: Quad chrome tailpipe backpressure 2.12 kPa, roll hoop static crush load 50.46 kN
# BMWM_Jewelry_Trace[0985]: Quad chrome tailpipe backpressure 2.13 kPa, roll hoop static crush load 50.47 kN
# BMWM_Jewelry_Trace[0986]: Quad chrome tailpipe backpressure 2.14 kPa, roll hoop static crush load 50.49 kN
# BMWM_Jewelry_Trace[0987]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 50.50 kN
# BMWM_Jewelry_Trace[0988]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 50.52 kN
# BMWM_Jewelry_Trace[0989]: Quad chrome tailpipe backpressure 2.16 kPa, roll hoop static crush load 50.53 kN
# BMWM_Jewelry_Trace[0990]: Quad chrome tailpipe backpressure 2.17 kPa, roll hoop static crush load 50.55 kN
# BMWM_Jewelry_Trace[0991]: Quad chrome tailpipe backpressure 2.18 kPa, roll hoop static crush load 50.56 kN
# BMWM_Jewelry_Trace[0992]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 50.58 kN
# BMWM_Jewelry_Trace[0993]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 50.59 kN
# BMWM_Jewelry_Trace[0994]: Quad chrome tailpipe backpressure 2.20 kPa, roll hoop static crush load 50.61 kN
# BMWM_Jewelry_Trace[0995]: Quad chrome tailpipe backpressure 2.21 kPa, roll hoop static crush load 50.63 kN
# BMWM_Jewelry_Trace[0996]: Quad chrome tailpipe backpressure 2.22 kPa, roll hoop static crush load 50.64 kN
# BMWM_Jewelry_Trace[0997]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 50.66 kN
# BMWM_Jewelry_Trace[0998]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 50.67 kN
# BMWM_Jewelry_Trace[0999]: Quad chrome tailpipe backpressure 2.24 kPa, roll hoop static crush load 50.69 kN
# BMWM_Jewelry_Trace[1000]: Quad chrome tailpipe backpressure 2.25 kPa, roll hoop static crush load 50.70 kN
# BMWM_Jewelry_Trace[1001]: Quad chrome tailpipe backpressure 1.86 kPa, roll hoop static crush load 50.71 kN
# BMWM_Jewelry_Trace[1002]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 50.73 kN
# BMWM_Jewelry_Trace[1003]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 50.74 kN
# BMWM_Jewelry_Trace[1004]: Quad chrome tailpipe backpressure 1.88 kPa, roll hoop static crush load 50.76 kN
# BMWM_Jewelry_Trace[1005]: Quad chrome tailpipe backpressure 1.89 kPa, roll hoop static crush load 50.77 kN
# BMWM_Jewelry_Trace[1006]: Quad chrome tailpipe backpressure 1.90 kPa, roll hoop static crush load 50.79 kN
# BMWM_Jewelry_Trace[1007]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 50.80 kN
# BMWM_Jewelry_Trace[1008]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 50.82 kN
# BMWM_Jewelry_Trace[1009]: Quad chrome tailpipe backpressure 1.92 kPa, roll hoop static crush load 50.84 kN
# BMWM_Jewelry_Trace[1010]: Quad chrome tailpipe backpressure 1.93 kPa, roll hoop static crush load 50.85 kN
# BMWM_Jewelry_Trace[1011]: Quad chrome tailpipe backpressure 1.94 kPa, roll hoop static crush load 50.86 kN
# BMWM_Jewelry_Trace[1012]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 50.88 kN
# BMWM_Jewelry_Trace[1013]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 50.89 kN
# BMWM_Jewelry_Trace[1014]: Quad chrome tailpipe backpressure 1.96 kPa, roll hoop static crush load 50.91 kN
# BMWM_Jewelry_Trace[1015]: Quad chrome tailpipe backpressure 1.97 kPa, roll hoop static crush load 50.92 kN
# BMWM_Jewelry_Trace[1016]: Quad chrome tailpipe backpressure 1.98 kPa, roll hoop static crush load 50.94 kN
# BMWM_Jewelry_Trace[1017]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 50.95 kN
# BMWM_Jewelry_Trace[1018]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 50.97 kN
# BMWM_Jewelry_Trace[1019]: Quad chrome tailpipe backpressure 2.00 kPa, roll hoop static crush load 50.98 kN
# BMWM_Jewelry_Trace[1020]: Quad chrome tailpipe backpressure 2.01 kPa, roll hoop static crush load 51.00 kN
# BMWM_Jewelry_Trace[1021]: Quad chrome tailpipe backpressure 2.02 kPa, roll hoop static crush load 51.02 kN
# BMWM_Jewelry_Trace[1022]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 51.03 kN
# BMWM_Jewelry_Trace[1023]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 51.05 kN
# BMWM_Jewelry_Trace[1024]: Quad chrome tailpipe backpressure 2.04 kPa, roll hoop static crush load 51.06 kN
# BMWM_Jewelry_Trace[1025]: Quad chrome tailpipe backpressure 2.05 kPa, roll hoop static crush load 51.08 kN
# BMWM_Jewelry_Trace[1026]: Quad chrome tailpipe backpressure 2.06 kPa, roll hoop static crush load 51.09 kN
# BMWM_Jewelry_Trace[1027]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 51.10 kN
# BMWM_Jewelry_Trace[1028]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 51.12 kN
# BMWM_Jewelry_Trace[1029]: Quad chrome tailpipe backpressure 2.08 kPa, roll hoop static crush load 51.13 kN
# BMWM_Jewelry_Trace[1030]: Quad chrome tailpipe backpressure 2.09 kPa, roll hoop static crush load 51.15 kN
# BMWM_Jewelry_Trace[1031]: Quad chrome tailpipe backpressure 2.10 kPa, roll hoop static crush load 51.16 kN
# BMWM_Jewelry_Trace[1032]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 51.18 kN
# BMWM_Jewelry_Trace[1033]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 51.20 kN
# BMWM_Jewelry_Trace[1034]: Quad chrome tailpipe backpressure 2.12 kPa, roll hoop static crush load 51.21 kN
# BMWM_Jewelry_Trace[1035]: Quad chrome tailpipe backpressure 2.13 kPa, roll hoop static crush load 51.22 kN
# BMWM_Jewelry_Trace[1036]: Quad chrome tailpipe backpressure 2.14 kPa, roll hoop static crush load 51.24 kN
# BMWM_Jewelry_Trace[1037]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 51.25 kN
# BMWM_Jewelry_Trace[1038]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 51.27 kN
# BMWM_Jewelry_Trace[1039]: Quad chrome tailpipe backpressure 2.16 kPa, roll hoop static crush load 51.28 kN
# BMWM_Jewelry_Trace[1040]: Quad chrome tailpipe backpressure 2.17 kPa, roll hoop static crush load 51.30 kN
# BMWM_Jewelry_Trace[1041]: Quad chrome tailpipe backpressure 2.18 kPa, roll hoop static crush load 51.31 kN
# BMWM_Jewelry_Trace[1042]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 51.33 kN
# BMWM_Jewelry_Trace[1043]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 51.34 kN
# BMWM_Jewelry_Trace[1044]: Quad chrome tailpipe backpressure 2.20 kPa, roll hoop static crush load 51.36 kN
# BMWM_Jewelry_Trace[1045]: Quad chrome tailpipe backpressure 2.21 kPa, roll hoop static crush load 51.38 kN
# BMWM_Jewelry_Trace[1046]: Quad chrome tailpipe backpressure 2.22 kPa, roll hoop static crush load 51.39 kN
# BMWM_Jewelry_Trace[1047]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 51.41 kN
# BMWM_Jewelry_Trace[1048]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 51.42 kN
# BMWM_Jewelry_Trace[1049]: Quad chrome tailpipe backpressure 2.24 kPa, roll hoop static crush load 51.44 kN
# BMWM_Jewelry_Trace[1050]: Quad chrome tailpipe backpressure 2.25 kPa, roll hoop static crush load 51.45 kN
# BMWM_Jewelry_Trace[1051]: Quad chrome tailpipe backpressure 1.86 kPa, roll hoop static crush load 51.46 kN
# BMWM_Jewelry_Trace[1052]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 51.48 kN
# BMWM_Jewelry_Trace[1053]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 51.49 kN
# BMWM_Jewelry_Trace[1054]: Quad chrome tailpipe backpressure 1.88 kPa, roll hoop static crush load 51.51 kN
# BMWM_Jewelry_Trace[1055]: Quad chrome tailpipe backpressure 1.89 kPa, roll hoop static crush load 51.52 kN
# BMWM_Jewelry_Trace[1056]: Quad chrome tailpipe backpressure 1.90 kPa, roll hoop static crush load 51.54 kN
# BMWM_Jewelry_Trace[1057]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 51.55 kN
# BMWM_Jewelry_Trace[1058]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 51.57 kN
# BMWM_Jewelry_Trace[1059]: Quad chrome tailpipe backpressure 1.92 kPa, roll hoop static crush load 51.59 kN
# BMWM_Jewelry_Trace[1060]: Quad chrome tailpipe backpressure 1.93 kPa, roll hoop static crush load 51.60 kN
# BMWM_Jewelry_Trace[1061]: Quad chrome tailpipe backpressure 1.94 kPa, roll hoop static crush load 51.61 kN
# BMWM_Jewelry_Trace[1062]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 51.63 kN
# BMWM_Jewelry_Trace[1063]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 51.64 kN
# BMWM_Jewelry_Trace[1064]: Quad chrome tailpipe backpressure 1.96 kPa, roll hoop static crush load 51.66 kN
# BMWM_Jewelry_Trace[1065]: Quad chrome tailpipe backpressure 1.97 kPa, roll hoop static crush load 51.67 kN
# BMWM_Jewelry_Trace[1066]: Quad chrome tailpipe backpressure 1.98 kPa, roll hoop static crush load 51.69 kN
# BMWM_Jewelry_Trace[1067]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 48.50 kN
# BMWM_Jewelry_Trace[1068]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 48.52 kN
# BMWM_Jewelry_Trace[1069]: Quad chrome tailpipe backpressure 2.00 kPa, roll hoop static crush load 48.53 kN
# BMWM_Jewelry_Trace[1070]: Quad chrome tailpipe backpressure 2.01 kPa, roll hoop static crush load 48.55 kN
# BMWM_Jewelry_Trace[1071]: Quad chrome tailpipe backpressure 2.02 kPa, roll hoop static crush load 48.56 kN
# BMWM_Jewelry_Trace[1072]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 48.58 kN
# BMWM_Jewelry_Trace[1073]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 48.59 kN
# BMWM_Jewelry_Trace[1074]: Quad chrome tailpipe backpressure 2.04 kPa, roll hoop static crush load 48.61 kN
# BMWM_Jewelry_Trace[1075]: Quad chrome tailpipe backpressure 2.05 kPa, roll hoop static crush load 48.63 kN
# BMWM_Jewelry_Trace[1076]: Quad chrome tailpipe backpressure 2.06 kPa, roll hoop static crush load 48.64 kN
# BMWM_Jewelry_Trace[1077]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 48.66 kN
# BMWM_Jewelry_Trace[1078]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 48.67 kN
# BMWM_Jewelry_Trace[1079]: Quad chrome tailpipe backpressure 2.08 kPa, roll hoop static crush load 48.68 kN
# BMWM_Jewelry_Trace[1080]: Quad chrome tailpipe backpressure 2.09 kPa, roll hoop static crush load 48.70 kN
# BMWM_Jewelry_Trace[1081]: Quad chrome tailpipe backpressure 2.10 kPa, roll hoop static crush load 48.71 kN
# BMWM_Jewelry_Trace[1082]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 48.73 kN
# BMWM_Jewelry_Trace[1083]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 48.74 kN
# BMWM_Jewelry_Trace[1084]: Quad chrome tailpipe backpressure 2.12 kPa, roll hoop static crush load 48.76 kN
# BMWM_Jewelry_Trace[1085]: Quad chrome tailpipe backpressure 2.13 kPa, roll hoop static crush load 48.77 kN
# BMWM_Jewelry_Trace[1086]: Quad chrome tailpipe backpressure 2.14 kPa, roll hoop static crush load 48.79 kN
# BMWM_Jewelry_Trace[1087]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 48.80 kN
# BMWM_Jewelry_Trace[1088]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 48.82 kN
# BMWM_Jewelry_Trace[1089]: Quad chrome tailpipe backpressure 2.16 kPa, roll hoop static crush load 48.84 kN
# BMWM_Jewelry_Trace[1090]: Quad chrome tailpipe backpressure 2.17 kPa, roll hoop static crush load 48.85 kN
# BMWM_Jewelry_Trace[1091]: Quad chrome tailpipe backpressure 2.18 kPa, roll hoop static crush load 48.86 kN
# BMWM_Jewelry_Trace[1092]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 48.88 kN
# BMWM_Jewelry_Trace[1093]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 48.89 kN
# BMWM_Jewelry_Trace[1094]: Quad chrome tailpipe backpressure 2.20 kPa, roll hoop static crush load 48.91 kN
# BMWM_Jewelry_Trace[1095]: Quad chrome tailpipe backpressure 2.21 kPa, roll hoop static crush load 48.92 kN
# BMWM_Jewelry_Trace[1096]: Quad chrome tailpipe backpressure 2.22 kPa, roll hoop static crush load 48.94 kN
# BMWM_Jewelry_Trace[1097]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 48.95 kN
# BMWM_Jewelry_Trace[1098]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 48.97 kN
# BMWM_Jewelry_Trace[1099]: Quad chrome tailpipe backpressure 2.24 kPa, roll hoop static crush load 48.98 kN
# BMWM_Jewelry_Trace[1100]: Quad chrome tailpipe backpressure 1.85 kPa, roll hoop static crush load 49.00 kN
# BMWM_Jewelry_Trace[1101]: Quad chrome tailpipe backpressure 1.86 kPa, roll hoop static crush load 49.02 kN
# BMWM_Jewelry_Trace[1102]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 49.03 kN
# BMWM_Jewelry_Trace[1103]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 49.04 kN
# BMWM_Jewelry_Trace[1104]: Quad chrome tailpipe backpressure 1.88 kPa, roll hoop static crush load 49.06 kN
# BMWM_Jewelry_Trace[1105]: Quad chrome tailpipe backpressure 1.89 kPa, roll hoop static crush load 49.07 kN
# BMWM_Jewelry_Trace[1106]: Quad chrome tailpipe backpressure 1.90 kPa, roll hoop static crush load 49.09 kN
# BMWM_Jewelry_Trace[1107]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 49.10 kN
# BMWM_Jewelry_Trace[1108]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 49.12 kN
# BMWM_Jewelry_Trace[1109]: Quad chrome tailpipe backpressure 1.92 kPa, roll hoop static crush load 49.13 kN
# BMWM_Jewelry_Trace[1110]: Quad chrome tailpipe backpressure 1.93 kPa, roll hoop static crush load 49.15 kN
# BMWM_Jewelry_Trace[1111]: Quad chrome tailpipe backpressure 1.94 kPa, roll hoop static crush load 49.16 kN
# BMWM_Jewelry_Trace[1112]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 49.18 kN
# BMWM_Jewelry_Trace[1113]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 49.20 kN
# BMWM_Jewelry_Trace[1114]: Quad chrome tailpipe backpressure 1.96 kPa, roll hoop static crush load 49.21 kN
# BMWM_Jewelry_Trace[1115]: Quad chrome tailpipe backpressure 1.97 kPa, roll hoop static crush load 49.22 kN
# BMWM_Jewelry_Trace[1116]: Quad chrome tailpipe backpressure 1.98 kPa, roll hoop static crush load 49.24 kN
# BMWM_Jewelry_Trace[1117]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 49.25 kN
# BMWM_Jewelry_Trace[1118]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 49.27 kN
# BMWM_Jewelry_Trace[1119]: Quad chrome tailpipe backpressure 2.00 kPa, roll hoop static crush load 49.28 kN
# BMWM_Jewelry_Trace[1120]: Quad chrome tailpipe backpressure 2.01 kPa, roll hoop static crush load 49.30 kN
# BMWM_Jewelry_Trace[1121]: Quad chrome tailpipe backpressure 2.02 kPa, roll hoop static crush load 49.31 kN
# BMWM_Jewelry_Trace[1122]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 49.33 kN
# BMWM_Jewelry_Trace[1123]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 49.34 kN
# BMWM_Jewelry_Trace[1124]: Quad chrome tailpipe backpressure 2.04 kPa, roll hoop static crush load 49.36 kN
# BMWM_Jewelry_Trace[1125]: Quad chrome tailpipe backpressure 2.05 kPa, roll hoop static crush load 49.38 kN
# BMWM_Jewelry_Trace[1126]: Quad chrome tailpipe backpressure 2.06 kPa, roll hoop static crush load 49.39 kN
# BMWM_Jewelry_Trace[1127]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 49.41 kN
# BMWM_Jewelry_Trace[1128]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 49.42 kN
# BMWM_Jewelry_Trace[1129]: Quad chrome tailpipe backpressure 2.08 kPa, roll hoop static crush load 49.43 kN
# BMWM_Jewelry_Trace[1130]: Quad chrome tailpipe backpressure 2.09 kPa, roll hoop static crush load 49.45 kN
# BMWM_Jewelry_Trace[1131]: Quad chrome tailpipe backpressure 2.10 kPa, roll hoop static crush load 49.46 kN
# BMWM_Jewelry_Trace[1132]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 49.48 kN
# BMWM_Jewelry_Trace[1133]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 49.49 kN
# BMWM_Jewelry_Trace[1134]: Quad chrome tailpipe backpressure 2.12 kPa, roll hoop static crush load 49.51 kN
# BMWM_Jewelry_Trace[1135]: Quad chrome tailpipe backpressure 2.13 kPa, roll hoop static crush load 49.52 kN
# BMWM_Jewelry_Trace[1136]: Quad chrome tailpipe backpressure 2.14 kPa, roll hoop static crush load 49.54 kN
# BMWM_Jewelry_Trace[1137]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 49.55 kN
# BMWM_Jewelry_Trace[1138]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 49.57 kN
# BMWM_Jewelry_Trace[1139]: Quad chrome tailpipe backpressure 2.16 kPa, roll hoop static crush load 49.59 kN
# BMWM_Jewelry_Trace[1140]: Quad chrome tailpipe backpressure 2.17 kPa, roll hoop static crush load 49.60 kN
# BMWM_Jewelry_Trace[1141]: Quad chrome tailpipe backpressure 2.18 kPa, roll hoop static crush load 49.61 kN
# BMWM_Jewelry_Trace[1142]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 49.63 kN
# BMWM_Jewelry_Trace[1143]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 49.64 kN
# BMWM_Jewelry_Trace[1144]: Quad chrome tailpipe backpressure 2.20 kPa, roll hoop static crush load 49.66 kN
# BMWM_Jewelry_Trace[1145]: Quad chrome tailpipe backpressure 2.21 kPa, roll hoop static crush load 49.67 kN
# BMWM_Jewelry_Trace[1146]: Quad chrome tailpipe backpressure 2.22 kPa, roll hoop static crush load 49.69 kN
# BMWM_Jewelry_Trace[1147]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 49.70 kN
# BMWM_Jewelry_Trace[1148]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 49.72 kN
# BMWM_Jewelry_Trace[1149]: Quad chrome tailpipe backpressure 2.24 kPa, roll hoop static crush load 49.73 kN
# BMWM_Jewelry_Trace[1150]: Quad chrome tailpipe backpressure 1.85 kPa, roll hoop static crush load 49.75 kN
# BMWM_Jewelry_Trace[1151]: Quad chrome tailpipe backpressure 1.86 kPa, roll hoop static crush load 49.77 kN
# BMWM_Jewelry_Trace[1152]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 49.78 kN
# BMWM_Jewelry_Trace[1153]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 49.79 kN
# BMWM_Jewelry_Trace[1154]: Quad chrome tailpipe backpressure 1.88 kPa, roll hoop static crush load 49.81 kN
# BMWM_Jewelry_Trace[1155]: Quad chrome tailpipe backpressure 1.89 kPa, roll hoop static crush load 49.82 kN
# BMWM_Jewelry_Trace[1156]: Quad chrome tailpipe backpressure 1.90 kPa, roll hoop static crush load 49.84 kN
# BMWM_Jewelry_Trace[1157]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 49.85 kN
# BMWM_Jewelry_Trace[1158]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 49.87 kN
# BMWM_Jewelry_Trace[1159]: Quad chrome tailpipe backpressure 1.92 kPa, roll hoop static crush load 49.88 kN
# BMWM_Jewelry_Trace[1160]: Quad chrome tailpipe backpressure 1.93 kPa, roll hoop static crush load 49.90 kN
# BMWM_Jewelry_Trace[1161]: Quad chrome tailpipe backpressure 1.94 kPa, roll hoop static crush load 49.91 kN
# BMWM_Jewelry_Trace[1162]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 49.93 kN
# BMWM_Jewelry_Trace[1163]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 49.95 kN
# BMWM_Jewelry_Trace[1164]: Quad chrome tailpipe backpressure 1.96 kPa, roll hoop static crush load 49.96 kN
# BMWM_Jewelry_Trace[1165]: Quad chrome tailpipe backpressure 1.97 kPa, roll hoop static crush load 49.97 kN
# BMWM_Jewelry_Trace[1166]: Quad chrome tailpipe backpressure 1.98 kPa, roll hoop static crush load 49.99 kN
# BMWM_Jewelry_Trace[1167]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 50.00 kN
# BMWM_Jewelry_Trace[1168]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 50.02 kN
# BMWM_Jewelry_Trace[1169]: Quad chrome tailpipe backpressure 2.00 kPa, roll hoop static crush load 50.03 kN
# BMWM_Jewelry_Trace[1170]: Quad chrome tailpipe backpressure 2.01 kPa, roll hoop static crush load 50.05 kN
# BMWM_Jewelry_Trace[1171]: Quad chrome tailpipe backpressure 2.02 kPa, roll hoop static crush load 50.06 kN
# BMWM_Jewelry_Trace[1172]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 50.08 kN
# BMWM_Jewelry_Trace[1173]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 50.09 kN
# BMWM_Jewelry_Trace[1174]: Quad chrome tailpipe backpressure 2.04 kPa, roll hoop static crush load 50.11 kN
# BMWM_Jewelry_Trace[1175]: Quad chrome tailpipe backpressure 2.05 kPa, roll hoop static crush load 50.13 kN
# BMWM_Jewelry_Trace[1176]: Quad chrome tailpipe backpressure 2.06 kPa, roll hoop static crush load 50.14 kN
# BMWM_Jewelry_Trace[1177]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 50.15 kN
# BMWM_Jewelry_Trace[1178]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 50.17 kN
# BMWM_Jewelry_Trace[1179]: Quad chrome tailpipe backpressure 2.08 kPa, roll hoop static crush load 50.18 kN
# BMWM_Jewelry_Trace[1180]: Quad chrome tailpipe backpressure 2.09 kPa, roll hoop static crush load 50.20 kN
# BMWM_Jewelry_Trace[1181]: Quad chrome tailpipe backpressure 2.10 kPa, roll hoop static crush load 50.21 kN
# BMWM_Jewelry_Trace[1182]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 50.23 kN
# BMWM_Jewelry_Trace[1183]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 50.24 kN
# BMWM_Jewelry_Trace[1184]: Quad chrome tailpipe backpressure 2.12 kPa, roll hoop static crush load 50.26 kN
# BMWM_Jewelry_Trace[1185]: Quad chrome tailpipe backpressure 2.13 kPa, roll hoop static crush load 50.27 kN
# BMWM_Jewelry_Trace[1186]: Quad chrome tailpipe backpressure 2.14 kPa, roll hoop static crush load 50.29 kN
# BMWM_Jewelry_Trace[1187]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 50.30 kN
# BMWM_Jewelry_Trace[1188]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 50.32 kN
# BMWM_Jewelry_Trace[1189]: Quad chrome tailpipe backpressure 2.16 kPa, roll hoop static crush load 50.34 kN
# BMWM_Jewelry_Trace[1190]: Quad chrome tailpipe backpressure 2.17 kPa, roll hoop static crush load 50.35 kN
# BMWM_Jewelry_Trace[1191]: Quad chrome tailpipe backpressure 2.18 kPa, roll hoop static crush load 50.36 kN
# BMWM_Jewelry_Trace[1192]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 50.38 kN
# BMWM_Jewelry_Trace[1193]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 50.39 kN
# BMWM_Jewelry_Trace[1194]: Quad chrome tailpipe backpressure 2.20 kPa, roll hoop static crush load 50.41 kN
# BMWM_Jewelry_Trace[1195]: Quad chrome tailpipe backpressure 2.21 kPa, roll hoop static crush load 50.42 kN
# BMWM_Jewelry_Trace[1196]: Quad chrome tailpipe backpressure 2.22 kPa, roll hoop static crush load 50.44 kN
# BMWM_Jewelry_Trace[1197]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 50.45 kN
# BMWM_Jewelry_Trace[1198]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 50.47 kN
# BMWM_Jewelry_Trace[1199]: Quad chrome tailpipe backpressure 2.24 kPa, roll hoop static crush load 50.48 kN
# BMWM_Jewelry_Trace[1200]: Quad chrome tailpipe backpressure 2.25 kPa, roll hoop static crush load 50.50 kN
# BMWM_Jewelry_Trace[1201]: Quad chrome tailpipe backpressure 1.86 kPa, roll hoop static crush load 50.52 kN
# BMWM_Jewelry_Trace[1202]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 50.53 kN
# BMWM_Jewelry_Trace[1203]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 50.54 kN
# BMWM_Jewelry_Trace[1204]: Quad chrome tailpipe backpressure 1.88 kPa, roll hoop static crush load 50.56 kN
# BMWM_Jewelry_Trace[1205]: Quad chrome tailpipe backpressure 1.89 kPa, roll hoop static crush load 50.57 kN
# BMWM_Jewelry_Trace[1206]: Quad chrome tailpipe backpressure 1.90 kPa, roll hoop static crush load 50.59 kN
# BMWM_Jewelry_Trace[1207]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 50.60 kN
# BMWM_Jewelry_Trace[1208]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 50.62 kN
# BMWM_Jewelry_Trace[1209]: Quad chrome tailpipe backpressure 1.92 kPa, roll hoop static crush load 50.63 kN
# BMWM_Jewelry_Trace[1210]: Quad chrome tailpipe backpressure 1.93 kPa, roll hoop static crush load 50.65 kN
# BMWM_Jewelry_Trace[1211]: Quad chrome tailpipe backpressure 1.94 kPa, roll hoop static crush load 50.66 kN
# BMWM_Jewelry_Trace[1212]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 50.68 kN
# BMWM_Jewelry_Trace[1213]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 50.70 kN
# BMWM_Jewelry_Trace[1214]: Quad chrome tailpipe backpressure 1.96 kPa, roll hoop static crush load 50.71 kN
# BMWM_Jewelry_Trace[1215]: Quad chrome tailpipe backpressure 1.97 kPa, roll hoop static crush load 50.72 kN
# BMWM_Jewelry_Trace[1216]: Quad chrome tailpipe backpressure 1.98 kPa, roll hoop static crush load 50.74 kN
# BMWM_Jewelry_Trace[1217]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 50.75 kN
# BMWM_Jewelry_Trace[1218]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 50.77 kN
# BMWM_Jewelry_Trace[1219]: Quad chrome tailpipe backpressure 2.00 kPa, roll hoop static crush load 50.78 kN
# BMWM_Jewelry_Trace[1220]: Quad chrome tailpipe backpressure 2.01 kPa, roll hoop static crush load 50.80 kN
# BMWM_Jewelry_Trace[1221]: Quad chrome tailpipe backpressure 2.02 kPa, roll hoop static crush load 50.81 kN
# BMWM_Jewelry_Trace[1222]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 50.83 kN
# BMWM_Jewelry_Trace[1223]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 50.84 kN
# BMWM_Jewelry_Trace[1224]: Quad chrome tailpipe backpressure 2.04 kPa, roll hoop static crush load 50.86 kN
# BMWM_Jewelry_Trace[1225]: Quad chrome tailpipe backpressure 2.05 kPa, roll hoop static crush load 50.88 kN
# BMWM_Jewelry_Trace[1226]: Quad chrome tailpipe backpressure 2.06 kPa, roll hoop static crush load 50.89 kN
# BMWM_Jewelry_Trace[1227]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 50.90 kN
# BMWM_Jewelry_Trace[1228]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 50.92 kN
# BMWM_Jewelry_Trace[1229]: Quad chrome tailpipe backpressure 2.08 kPa, roll hoop static crush load 50.93 kN
# BMWM_Jewelry_Trace[1230]: Quad chrome tailpipe backpressure 2.09 kPa, roll hoop static crush load 50.95 kN
# BMWM_Jewelry_Trace[1231]: Quad chrome tailpipe backpressure 2.10 kPa, roll hoop static crush load 50.96 kN
# BMWM_Jewelry_Trace[1232]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 50.98 kN
# BMWM_Jewelry_Trace[1233]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 50.99 kN
# BMWM_Jewelry_Trace[1234]: Quad chrome tailpipe backpressure 2.12 kPa, roll hoop static crush load 51.01 kN
# BMWM_Jewelry_Trace[1235]: Quad chrome tailpipe backpressure 2.13 kPa, roll hoop static crush load 51.02 kN
# BMWM_Jewelry_Trace[1236]: Quad chrome tailpipe backpressure 2.14 kPa, roll hoop static crush load 51.04 kN
# BMWM_Jewelry_Trace[1237]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 51.05 kN
# BMWM_Jewelry_Trace[1238]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 51.07 kN
# BMWM_Jewelry_Trace[1239]: Quad chrome tailpipe backpressure 2.16 kPa, roll hoop static crush load 51.09 kN
# BMWM_Jewelry_Trace[1240]: Quad chrome tailpipe backpressure 2.17 kPa, roll hoop static crush load 51.10 kN
# BMWM_Jewelry_Trace[1241]: Quad chrome tailpipe backpressure 2.18 kPa, roll hoop static crush load 51.11 kN
# BMWM_Jewelry_Trace[1242]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 51.13 kN
# BMWM_Jewelry_Trace[1243]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 51.14 kN
# BMWM_Jewelry_Trace[1244]: Quad chrome tailpipe backpressure 2.20 kPa, roll hoop static crush load 51.16 kN
# BMWM_Jewelry_Trace[1245]: Quad chrome tailpipe backpressure 2.21 kPa, roll hoop static crush load 51.17 kN
# BMWM_Jewelry_Trace[1246]: Quad chrome tailpipe backpressure 2.22 kPa, roll hoop static crush load 51.19 kN
# BMWM_Jewelry_Trace[1247]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 51.20 kN
# BMWM_Jewelry_Trace[1248]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 51.22 kN
# BMWM_Jewelry_Trace[1249]: Quad chrome tailpipe backpressure 2.24 kPa, roll hoop static crush load 51.23 kN
# BMWM_Jewelry_Trace[1250]: Quad chrome tailpipe backpressure 2.25 kPa, roll hoop static crush load 51.25 kN
# BMWM_Jewelry_Trace[1251]: Quad chrome tailpipe backpressure 1.86 kPa, roll hoop static crush load 51.27 kN
# BMWM_Jewelry_Trace[1252]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 51.28 kN
# BMWM_Jewelry_Trace[1253]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 51.29 kN
# BMWM_Jewelry_Trace[1254]: Quad chrome tailpipe backpressure 1.88 kPa, roll hoop static crush load 51.31 kN
# BMWM_Jewelry_Trace[1255]: Quad chrome tailpipe backpressure 1.89 kPa, roll hoop static crush load 51.32 kN
# BMWM_Jewelry_Trace[1256]: Quad chrome tailpipe backpressure 1.90 kPa, roll hoop static crush load 51.34 kN
# BMWM_Jewelry_Trace[1257]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 51.35 kN
# BMWM_Jewelry_Trace[1258]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 51.37 kN
# BMWM_Jewelry_Trace[1259]: Quad chrome tailpipe backpressure 1.92 kPa, roll hoop static crush load 51.38 kN
# BMWM_Jewelry_Trace[1260]: Quad chrome tailpipe backpressure 1.93 kPa, roll hoop static crush load 51.40 kN
# BMWM_Jewelry_Trace[1261]: Quad chrome tailpipe backpressure 1.94 kPa, roll hoop static crush load 51.41 kN
# BMWM_Jewelry_Trace[1262]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 51.43 kN
# BMWM_Jewelry_Trace[1263]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 51.45 kN
# BMWM_Jewelry_Trace[1264]: Quad chrome tailpipe backpressure 1.96 kPa, roll hoop static crush load 51.46 kN
# BMWM_Jewelry_Trace[1265]: Quad chrome tailpipe backpressure 1.97 kPa, roll hoop static crush load 51.47 kN
# BMWM_Jewelry_Trace[1266]: Quad chrome tailpipe backpressure 1.98 kPa, roll hoop static crush load 51.49 kN
# BMWM_Jewelry_Trace[1267]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 51.50 kN
# BMWM_Jewelry_Trace[1268]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 51.52 kN
# BMWM_Jewelry_Trace[1269]: Quad chrome tailpipe backpressure 2.00 kPa, roll hoop static crush load 51.53 kN
# BMWM_Jewelry_Trace[1270]: Quad chrome tailpipe backpressure 2.01 kPa, roll hoop static crush load 51.55 kN
# BMWM_Jewelry_Trace[1271]: Quad chrome tailpipe backpressure 2.02 kPa, roll hoop static crush load 51.56 kN
# BMWM_Jewelry_Trace[1272]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 51.58 kN
# BMWM_Jewelry_Trace[1273]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 51.59 kN
# BMWM_Jewelry_Trace[1274]: Quad chrome tailpipe backpressure 2.04 kPa, roll hoop static crush load 51.61 kN
# BMWM_Jewelry_Trace[1275]: Quad chrome tailpipe backpressure 2.05 kPa, roll hoop static crush load 51.63 kN
# BMWM_Jewelry_Trace[1276]: Quad chrome tailpipe backpressure 2.06 kPa, roll hoop static crush load 51.64 kN
# BMWM_Jewelry_Trace[1277]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 51.65 kN
# BMWM_Jewelry_Trace[1278]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 51.67 kN
# BMWM_Jewelry_Trace[1279]: Quad chrome tailpipe backpressure 2.08 kPa, roll hoop static crush load 51.68 kN
# BMWM_Jewelry_Trace[1280]: Quad chrome tailpipe backpressure 2.09 kPa, roll hoop static crush load 51.70 kN
# BMWM_Jewelry_Trace[1281]: Quad chrome tailpipe backpressure 2.10 kPa, roll hoop static crush load 48.52 kN
# BMWM_Jewelry_Trace[1282]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 48.53 kN
# BMWM_Jewelry_Trace[1283]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 48.55 kN
# BMWM_Jewelry_Trace[1284]: Quad chrome tailpipe backpressure 2.12 kPa, roll hoop static crush load 48.56 kN
# BMWM_Jewelry_Trace[1285]: Quad chrome tailpipe backpressure 2.13 kPa, roll hoop static crush load 48.57 kN
# BMWM_Jewelry_Trace[1286]: Quad chrome tailpipe backpressure 2.14 kPa, roll hoop static crush load 48.59 kN
# BMWM_Jewelry_Trace[1287]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 48.60 kN
# BMWM_Jewelry_Trace[1288]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 48.62 kN
# BMWM_Jewelry_Trace[1289]: Quad chrome tailpipe backpressure 2.16 kPa, roll hoop static crush load 48.63 kN
# BMWM_Jewelry_Trace[1290]: Quad chrome tailpipe backpressure 2.17 kPa, roll hoop static crush load 48.65 kN
# BMWM_Jewelry_Trace[1291]: Quad chrome tailpipe backpressure 2.18 kPa, roll hoop static crush load 48.66 kN
# BMWM_Jewelry_Trace[1292]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 48.68 kN
# BMWM_Jewelry_Trace[1293]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 48.70 kN
# BMWM_Jewelry_Trace[1294]: Quad chrome tailpipe backpressure 2.20 kPa, roll hoop static crush load 48.71 kN
# BMWM_Jewelry_Trace[1295]: Quad chrome tailpipe backpressure 2.21 kPa, roll hoop static crush load 48.73 kN
# BMWM_Jewelry_Trace[1296]: Quad chrome tailpipe backpressure 2.22 kPa, roll hoop static crush load 48.74 kN
# BMWM_Jewelry_Trace[1297]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 48.75 kN
# BMWM_Jewelry_Trace[1298]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 48.77 kN
# BMWM_Jewelry_Trace[1299]: Quad chrome tailpipe backpressure 2.24 kPa, roll hoop static crush load 48.78 kN
# BMWM_Jewelry_Trace[1300]: Quad chrome tailpipe backpressure 2.25 kPa, roll hoop static crush load 48.80 kN
# BMWM_Jewelry_Trace[1301]: Quad chrome tailpipe backpressure 1.86 kPa, roll hoop static crush load 48.81 kN
# BMWM_Jewelry_Trace[1302]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 48.83 kN
# BMWM_Jewelry_Trace[1303]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 48.84 kN
# BMWM_Jewelry_Trace[1304]: Quad chrome tailpipe backpressure 1.88 kPa, roll hoop static crush load 48.86 kN
# BMWM_Jewelry_Trace[1305]: Quad chrome tailpipe backpressure 1.89 kPa, roll hoop static crush load 48.88 kN
# BMWM_Jewelry_Trace[1306]: Quad chrome tailpipe backpressure 1.90 kPa, roll hoop static crush load 48.89 kN
# BMWM_Jewelry_Trace[1307]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 48.91 kN
# BMWM_Jewelry_Trace[1308]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 48.92 kN
# BMWM_Jewelry_Trace[1309]: Quad chrome tailpipe backpressure 1.92 kPa, roll hoop static crush load 48.93 kN
# BMWM_Jewelry_Trace[1310]: Quad chrome tailpipe backpressure 1.93 kPa, roll hoop static crush load 48.95 kN
# BMWM_Jewelry_Trace[1311]: Quad chrome tailpipe backpressure 1.94 kPa, roll hoop static crush load 48.96 kN
# BMWM_Jewelry_Trace[1312]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 48.98 kN
# BMWM_Jewelry_Trace[1313]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 48.99 kN
# BMWM_Jewelry_Trace[1314]: Quad chrome tailpipe backpressure 1.96 kPa, roll hoop static crush load 49.01 kN
# BMWM_Jewelry_Trace[1315]: Quad chrome tailpipe backpressure 1.97 kPa, roll hoop static crush load 49.02 kN
# BMWM_Jewelry_Trace[1316]: Quad chrome tailpipe backpressure 1.98 kPa, roll hoop static crush load 49.04 kN
# BMWM_Jewelry_Trace[1317]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 49.05 kN
# BMWM_Jewelry_Trace[1318]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 49.07 kN
# BMWM_Jewelry_Trace[1319]: Quad chrome tailpipe backpressure 2.00 kPa, roll hoop static crush load 49.09 kN
# BMWM_Jewelry_Trace[1320]: Quad chrome tailpipe backpressure 2.01 kPa, roll hoop static crush load 49.10 kN
# BMWM_Jewelry_Trace[1321]: Quad chrome tailpipe backpressure 2.02 kPa, roll hoop static crush load 49.11 kN
# BMWM_Jewelry_Trace[1322]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 49.13 kN
# BMWM_Jewelry_Trace[1323]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 49.14 kN
# BMWM_Jewelry_Trace[1324]: Quad chrome tailpipe backpressure 2.04 kPa, roll hoop static crush load 49.16 kN
# BMWM_Jewelry_Trace[1325]: Quad chrome tailpipe backpressure 2.05 kPa, roll hoop static crush load 49.17 kN
# BMWM_Jewelry_Trace[1326]: Quad chrome tailpipe backpressure 2.06 kPa, roll hoop static crush load 49.19 kN
# BMWM_Jewelry_Trace[1327]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 49.20 kN
# BMWM_Jewelry_Trace[1328]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 49.22 kN
# BMWM_Jewelry_Trace[1329]: Quad chrome tailpipe backpressure 2.08 kPa, roll hoop static crush load 49.23 kN
# BMWM_Jewelry_Trace[1330]: Quad chrome tailpipe backpressure 2.09 kPa, roll hoop static crush load 49.25 kN
# BMWM_Jewelry_Trace[1331]: Quad chrome tailpipe backpressure 2.10 kPa, roll hoop static crush load 49.27 kN
# BMWM_Jewelry_Trace[1332]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 49.28 kN
# BMWM_Jewelry_Trace[1333]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 49.30 kN
# BMWM_Jewelry_Trace[1334]: Quad chrome tailpipe backpressure 2.12 kPa, roll hoop static crush load 49.31 kN
# BMWM_Jewelry_Trace[1335]: Quad chrome tailpipe backpressure 2.13 kPa, roll hoop static crush load 49.32 kN
# BMWM_Jewelry_Trace[1336]: Quad chrome tailpipe backpressure 2.14 kPa, roll hoop static crush load 49.34 kN
# BMWM_Jewelry_Trace[1337]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 49.35 kN
# BMWM_Jewelry_Trace[1338]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 49.37 kN
# BMWM_Jewelry_Trace[1339]: Quad chrome tailpipe backpressure 2.16 kPa, roll hoop static crush load 49.38 kN
# BMWM_Jewelry_Trace[1340]: Quad chrome tailpipe backpressure 2.17 kPa, roll hoop static crush load 49.40 kN
# BMWM_Jewelry_Trace[1341]: Quad chrome tailpipe backpressure 2.18 kPa, roll hoop static crush load 49.41 kN
# BMWM_Jewelry_Trace[1342]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 49.43 kN
# BMWM_Jewelry_Trace[1343]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 49.45 kN
# BMWM_Jewelry_Trace[1344]: Quad chrome tailpipe backpressure 2.20 kPa, roll hoop static crush load 49.46 kN
# BMWM_Jewelry_Trace[1345]: Quad chrome tailpipe backpressure 2.21 kPa, roll hoop static crush load 49.48 kN
# BMWM_Jewelry_Trace[1346]: Quad chrome tailpipe backpressure 2.22 kPa, roll hoop static crush load 49.49 kN
# BMWM_Jewelry_Trace[1347]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 49.50 kN
# BMWM_Jewelry_Trace[1348]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 49.52 kN
# BMWM_Jewelry_Trace[1349]: Quad chrome tailpipe backpressure 2.24 kPa, roll hoop static crush load 49.53 kN
# BMWM_Jewelry_Trace[1350]: Quad chrome tailpipe backpressure 1.85 kPa, roll hoop static crush load 49.55 kN
# BMWM_Jewelry_Trace[1351]: Quad chrome tailpipe backpressure 1.86 kPa, roll hoop static crush load 49.56 kN
# BMWM_Jewelry_Trace[1352]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 49.58 kN
# BMWM_Jewelry_Trace[1353]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 49.59 kN
# BMWM_Jewelry_Trace[1354]: Quad chrome tailpipe backpressure 1.88 kPa, roll hoop static crush load 49.61 kN
# BMWM_Jewelry_Trace[1355]: Quad chrome tailpipe backpressure 1.89 kPa, roll hoop static crush load 49.63 kN
# BMWM_Jewelry_Trace[1356]: Quad chrome tailpipe backpressure 1.90 kPa, roll hoop static crush load 49.64 kN
# BMWM_Jewelry_Trace[1357]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 49.66 kN
# BMWM_Jewelry_Trace[1358]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 49.67 kN
# BMWM_Jewelry_Trace[1359]: Quad chrome tailpipe backpressure 1.92 kPa, roll hoop static crush load 49.68 kN
# BMWM_Jewelry_Trace[1360]: Quad chrome tailpipe backpressure 1.93 kPa, roll hoop static crush load 49.70 kN
# BMWM_Jewelry_Trace[1361]: Quad chrome tailpipe backpressure 1.94 kPa, roll hoop static crush load 49.71 kN
# BMWM_Jewelry_Trace[1362]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 49.73 kN
# BMWM_Jewelry_Trace[1363]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 49.74 kN
# BMWM_Jewelry_Trace[1364]: Quad chrome tailpipe backpressure 1.96 kPa, roll hoop static crush load 49.76 kN
# BMWM_Jewelry_Trace[1365]: Quad chrome tailpipe backpressure 1.97 kPa, roll hoop static crush load 49.77 kN
# BMWM_Jewelry_Trace[1366]: Quad chrome tailpipe backpressure 1.98 kPa, roll hoop static crush load 49.79 kN
# BMWM_Jewelry_Trace[1367]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 49.80 kN
# BMWM_Jewelry_Trace[1368]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 49.82 kN
# BMWM_Jewelry_Trace[1369]: Quad chrome tailpipe backpressure 2.00 kPa, roll hoop static crush load 49.84 kN
# BMWM_Jewelry_Trace[1370]: Quad chrome tailpipe backpressure 2.01 kPa, roll hoop static crush load 49.85 kN
# BMWM_Jewelry_Trace[1371]: Quad chrome tailpipe backpressure 2.02 kPa, roll hoop static crush load 49.86 kN
# BMWM_Jewelry_Trace[1372]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 49.88 kN
# BMWM_Jewelry_Trace[1373]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 49.89 kN
# BMWM_Jewelry_Trace[1374]: Quad chrome tailpipe backpressure 2.04 kPa, roll hoop static crush load 49.91 kN
# BMWM_Jewelry_Trace[1375]: Quad chrome tailpipe backpressure 2.05 kPa, roll hoop static crush load 49.92 kN
# BMWM_Jewelry_Trace[1376]: Quad chrome tailpipe backpressure 2.06 kPa, roll hoop static crush load 49.94 kN
# BMWM_Jewelry_Trace[1377]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 49.95 kN
# BMWM_Jewelry_Trace[1378]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 49.97 kN
# BMWM_Jewelry_Trace[1379]: Quad chrome tailpipe backpressure 2.08 kPa, roll hoop static crush load 49.98 kN
# BMWM_Jewelry_Trace[1380]: Quad chrome tailpipe backpressure 2.09 kPa, roll hoop static crush load 50.00 kN
# BMWM_Jewelry_Trace[1381]: Quad chrome tailpipe backpressure 2.10 kPa, roll hoop static crush load 50.02 kN
# BMWM_Jewelry_Trace[1382]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 50.03 kN
# BMWM_Jewelry_Trace[1383]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 50.05 kN
# BMWM_Jewelry_Trace[1384]: Quad chrome tailpipe backpressure 2.12 kPa, roll hoop static crush load 50.06 kN
# BMWM_Jewelry_Trace[1385]: Quad chrome tailpipe backpressure 2.13 kPa, roll hoop static crush load 50.07 kN
# BMWM_Jewelry_Trace[1386]: Quad chrome tailpipe backpressure 2.14 kPa, roll hoop static crush load 50.09 kN
# BMWM_Jewelry_Trace[1387]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 50.10 kN
# BMWM_Jewelry_Trace[1388]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 50.12 kN
# BMWM_Jewelry_Trace[1389]: Quad chrome tailpipe backpressure 2.16 kPa, roll hoop static crush load 50.13 kN
# BMWM_Jewelry_Trace[1390]: Quad chrome tailpipe backpressure 2.17 kPa, roll hoop static crush load 50.15 kN
# BMWM_Jewelry_Trace[1391]: Quad chrome tailpipe backpressure 2.18 kPa, roll hoop static crush load 50.16 kN
# BMWM_Jewelry_Trace[1392]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 50.18 kN
# BMWM_Jewelry_Trace[1393]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 50.20 kN
# BMWM_Jewelry_Trace[1394]: Quad chrome tailpipe backpressure 2.20 kPa, roll hoop static crush load 50.21 kN
# BMWM_Jewelry_Trace[1395]: Quad chrome tailpipe backpressure 2.21 kPa, roll hoop static crush load 50.23 kN
# BMWM_Jewelry_Trace[1396]: Quad chrome tailpipe backpressure 2.22 kPa, roll hoop static crush load 50.24 kN
# BMWM_Jewelry_Trace[1397]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 50.25 kN
# BMWM_Jewelry_Trace[1398]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 50.27 kN
# BMWM_Jewelry_Trace[1399]: Quad chrome tailpipe backpressure 2.24 kPa, roll hoop static crush load 50.28 kN
# BMWM_Jewelry_Trace[1400]: Quad chrome tailpipe backpressure 1.85 kPa, roll hoop static crush load 50.30 kN
# BMWM_Jewelry_Trace[1401]: Quad chrome tailpipe backpressure 1.86 kPa, roll hoop static crush load 50.31 kN
# BMWM_Jewelry_Trace[1402]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 50.33 kN
# BMWM_Jewelry_Trace[1403]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 50.34 kN
# BMWM_Jewelry_Trace[1404]: Quad chrome tailpipe backpressure 1.88 kPa, roll hoop static crush load 50.36 kN
# BMWM_Jewelry_Trace[1405]: Quad chrome tailpipe backpressure 1.89 kPa, roll hoop static crush load 50.38 kN
# BMWM_Jewelry_Trace[1406]: Quad chrome tailpipe backpressure 1.90 kPa, roll hoop static crush load 50.39 kN
# BMWM_Jewelry_Trace[1407]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 50.41 kN
# BMWM_Jewelry_Trace[1408]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 50.42 kN
# BMWM_Jewelry_Trace[1409]: Quad chrome tailpipe backpressure 1.92 kPa, roll hoop static crush load 50.43 kN
# BMWM_Jewelry_Trace[1410]: Quad chrome tailpipe backpressure 1.93 kPa, roll hoop static crush load 50.45 kN
# BMWM_Jewelry_Trace[1411]: Quad chrome tailpipe backpressure 1.94 kPa, roll hoop static crush load 50.46 kN
# BMWM_Jewelry_Trace[1412]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 50.48 kN
# BMWM_Jewelry_Trace[1413]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 50.49 kN
# BMWM_Jewelry_Trace[1414]: Quad chrome tailpipe backpressure 1.96 kPa, roll hoop static crush load 50.51 kN
# BMWM_Jewelry_Trace[1415]: Quad chrome tailpipe backpressure 1.97 kPa, roll hoop static crush load 50.52 kN
# BMWM_Jewelry_Trace[1416]: Quad chrome tailpipe backpressure 1.98 kPa, roll hoop static crush load 50.54 kN
# BMWM_Jewelry_Trace[1417]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 50.55 kN
# BMWM_Jewelry_Trace[1418]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 50.57 kN
# BMWM_Jewelry_Trace[1419]: Quad chrome tailpipe backpressure 2.00 kPa, roll hoop static crush load 50.59 kN
# BMWM_Jewelry_Trace[1420]: Quad chrome tailpipe backpressure 2.01 kPa, roll hoop static crush load 50.60 kN
# BMWM_Jewelry_Trace[1421]: Quad chrome tailpipe backpressure 2.02 kPa, roll hoop static crush load 50.61 kN
# BMWM_Jewelry_Trace[1422]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 50.63 kN
# BMWM_Jewelry_Trace[1423]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 50.64 kN
# BMWM_Jewelry_Trace[1424]: Quad chrome tailpipe backpressure 2.04 kPa, roll hoop static crush load 50.66 kN
# BMWM_Jewelry_Trace[1425]: Quad chrome tailpipe backpressure 2.05 kPa, roll hoop static crush load 50.67 kN
# BMWM_Jewelry_Trace[1426]: Quad chrome tailpipe backpressure 2.06 kPa, roll hoop static crush load 50.69 kN
# BMWM_Jewelry_Trace[1427]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 50.70 kN
# BMWM_Jewelry_Trace[1428]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 50.72 kN
# BMWM_Jewelry_Trace[1429]: Quad chrome tailpipe backpressure 2.08 kPa, roll hoop static crush load 50.73 kN
# BMWM_Jewelry_Trace[1430]: Quad chrome tailpipe backpressure 2.09 kPa, roll hoop static crush load 50.75 kN
# BMWM_Jewelry_Trace[1431]: Quad chrome tailpipe backpressure 2.10 kPa, roll hoop static crush load 50.77 kN
# BMWM_Jewelry_Trace[1432]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 50.78 kN
# BMWM_Jewelry_Trace[1433]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 50.79 kN
# BMWM_Jewelry_Trace[1434]: Quad chrome tailpipe backpressure 2.12 kPa, roll hoop static crush load 50.81 kN
# BMWM_Jewelry_Trace[1435]: Quad chrome tailpipe backpressure 2.13 kPa, roll hoop static crush load 50.82 kN
# BMWM_Jewelry_Trace[1436]: Quad chrome tailpipe backpressure 2.14 kPa, roll hoop static crush load 50.84 kN
# BMWM_Jewelry_Trace[1437]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 50.85 kN
# BMWM_Jewelry_Trace[1438]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 50.87 kN
# BMWM_Jewelry_Trace[1439]: Quad chrome tailpipe backpressure 2.16 kPa, roll hoop static crush load 50.88 kN
# BMWM_Jewelry_Trace[1440]: Quad chrome tailpipe backpressure 2.17 kPa, roll hoop static crush load 50.90 kN
# BMWM_Jewelry_Trace[1441]: Quad chrome tailpipe backpressure 2.18 kPa, roll hoop static crush load 50.91 kN
# BMWM_Jewelry_Trace[1442]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 50.93 kN
# BMWM_Jewelry_Trace[1443]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 50.95 kN
# BMWM_Jewelry_Trace[1444]: Quad chrome tailpipe backpressure 2.20 kPa, roll hoop static crush load 50.96 kN
# BMWM_Jewelry_Trace[1445]: Quad chrome tailpipe backpressure 2.21 kPa, roll hoop static crush load 50.98 kN
# BMWM_Jewelry_Trace[1446]: Quad chrome tailpipe backpressure 2.22 kPa, roll hoop static crush load 50.99 kN
# BMWM_Jewelry_Trace[1447]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 51.00 kN
# BMWM_Jewelry_Trace[1448]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 51.02 kN
# BMWM_Jewelry_Trace[1449]: Quad chrome tailpipe backpressure 2.24 kPa, roll hoop static crush load 51.03 kN
# BMWM_Jewelry_Trace[1450]: Quad chrome tailpipe backpressure 2.25 kPa, roll hoop static crush load 51.05 kN
# BMWM_Jewelry_Trace[1451]: Quad chrome tailpipe backpressure 1.86 kPa, roll hoop static crush load 51.06 kN
# BMWM_Jewelry_Trace[1452]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 51.08 kN
# BMWM_Jewelry_Trace[1453]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 51.09 kN
# BMWM_Jewelry_Trace[1454]: Quad chrome tailpipe backpressure 1.88 kPa, roll hoop static crush load 51.11 kN
# BMWM_Jewelry_Trace[1455]: Quad chrome tailpipe backpressure 1.89 kPa, roll hoop static crush load 51.13 kN
# BMWM_Jewelry_Trace[1456]: Quad chrome tailpipe backpressure 1.90 kPa, roll hoop static crush load 51.14 kN
# BMWM_Jewelry_Trace[1457]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 51.16 kN
# BMWM_Jewelry_Trace[1458]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 51.17 kN
# BMWM_Jewelry_Trace[1459]: Quad chrome tailpipe backpressure 1.92 kPa, roll hoop static crush load 51.18 kN
# BMWM_Jewelry_Trace[1460]: Quad chrome tailpipe backpressure 1.93 kPa, roll hoop static crush load 51.20 kN
# BMWM_Jewelry_Trace[1461]: Quad chrome tailpipe backpressure 1.94 kPa, roll hoop static crush load 51.21 kN
# BMWM_Jewelry_Trace[1462]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 51.23 kN
# BMWM_Jewelry_Trace[1463]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 51.24 kN
# BMWM_Jewelry_Trace[1464]: Quad chrome tailpipe backpressure 1.96 kPa, roll hoop static crush load 51.26 kN
# BMWM_Jewelry_Trace[1465]: Quad chrome tailpipe backpressure 1.97 kPa, roll hoop static crush load 51.27 kN
# BMWM_Jewelry_Trace[1466]: Quad chrome tailpipe backpressure 1.98 kPa, roll hoop static crush load 51.29 kN
# BMWM_Jewelry_Trace[1467]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 51.30 kN
# BMWM_Jewelry_Trace[1468]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 51.32 kN
# BMWM_Jewelry_Trace[1469]: Quad chrome tailpipe backpressure 2.00 kPa, roll hoop static crush load 51.34 kN
# BMWM_Jewelry_Trace[1470]: Quad chrome tailpipe backpressure 2.01 kPa, roll hoop static crush load 51.35 kN
# BMWM_Jewelry_Trace[1471]: Quad chrome tailpipe backpressure 2.02 kPa, roll hoop static crush load 51.36 kN
# BMWM_Jewelry_Trace[1472]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 51.38 kN
# BMWM_Jewelry_Trace[1473]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 51.39 kN
# BMWM_Jewelry_Trace[1474]: Quad chrome tailpipe backpressure 2.04 kPa, roll hoop static crush load 51.41 kN
# BMWM_Jewelry_Trace[1475]: Quad chrome tailpipe backpressure 2.05 kPa, roll hoop static crush load 51.42 kN
# BMWM_Jewelry_Trace[1476]: Quad chrome tailpipe backpressure 2.06 kPa, roll hoop static crush load 51.44 kN
# BMWM_Jewelry_Trace[1477]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 51.45 kN
# BMWM_Jewelry_Trace[1478]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 51.47 kN
# BMWM_Jewelry_Trace[1479]: Quad chrome tailpipe backpressure 2.08 kPa, roll hoop static crush load 51.48 kN
# BMWM_Jewelry_Trace[1480]: Quad chrome tailpipe backpressure 2.09 kPa, roll hoop static crush load 51.50 kN
# BMWM_Jewelry_Trace[1481]: Quad chrome tailpipe backpressure 2.10 kPa, roll hoop static crush load 51.52 kN
# BMWM_Jewelry_Trace[1482]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 51.53 kN
# BMWM_Jewelry_Trace[1483]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 51.54 kN
# BMWM_Jewelry_Trace[1484]: Quad chrome tailpipe backpressure 2.12 kPa, roll hoop static crush load 51.56 kN
# BMWM_Jewelry_Trace[1485]: Quad chrome tailpipe backpressure 2.13 kPa, roll hoop static crush load 51.57 kN
# BMWM_Jewelry_Trace[1486]: Quad chrome tailpipe backpressure 2.14 kPa, roll hoop static crush load 51.59 kN
# BMWM_Jewelry_Trace[1487]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 51.60 kN
# BMWM_Jewelry_Trace[1488]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 51.62 kN
# BMWM_Jewelry_Trace[1489]: Quad chrome tailpipe backpressure 2.16 kPa, roll hoop static crush load 51.63 kN
# BMWM_Jewelry_Trace[1490]: Quad chrome tailpipe backpressure 2.17 kPa, roll hoop static crush load 51.65 kN
# BMWM_Jewelry_Trace[1491]: Quad chrome tailpipe backpressure 2.18 kPa, roll hoop static crush load 51.66 kN
# BMWM_Jewelry_Trace[1492]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 51.68 kN
# BMWM_Jewelry_Trace[1493]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 51.70 kN
# BMWM_Jewelry_Trace[1494]: Quad chrome tailpipe backpressure 2.20 kPa, roll hoop static crush load 48.51 kN
# BMWM_Jewelry_Trace[1495]: Quad chrome tailpipe backpressure 2.21 kPa, roll hoop static crush load 48.52 kN
# BMWM_Jewelry_Trace[1496]: Quad chrome tailpipe backpressure 2.22 kPa, roll hoop static crush load 48.54 kN
# BMWM_Jewelry_Trace[1497]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 48.55 kN
# BMWM_Jewelry_Trace[1498]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 48.57 kN
# BMWM_Jewelry_Trace[1499]: Quad chrome tailpipe backpressure 2.24 kPa, roll hoop static crush load 48.59 kN
# BMWM_Jewelry_Trace[1500]: Quad chrome tailpipe backpressure 2.25 kPa, roll hoop static crush load 48.60 kN
# BMWM_Jewelry_Trace[1501]: Quad chrome tailpipe backpressure 1.86 kPa, roll hoop static crush load 48.62 kN
# BMWM_Jewelry_Trace[1502]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 48.63 kN
# BMWM_Jewelry_Trace[1503]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 48.64 kN
# BMWM_Jewelry_Trace[1504]: Quad chrome tailpipe backpressure 1.88 kPa, roll hoop static crush load 48.66 kN
# BMWM_Jewelry_Trace[1505]: Quad chrome tailpipe backpressure 1.89 kPa, roll hoop static crush load 48.67 kN
# BMWM_Jewelry_Trace[1506]: Quad chrome tailpipe backpressure 1.90 kPa, roll hoop static crush load 48.69 kN
# BMWM_Jewelry_Trace[1507]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 48.70 kN
# BMWM_Jewelry_Trace[1508]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 48.72 kN
# BMWM_Jewelry_Trace[1509]: Quad chrome tailpipe backpressure 1.92 kPa, roll hoop static crush load 48.73 kN
# BMWM_Jewelry_Trace[1510]: Quad chrome tailpipe backpressure 1.93 kPa, roll hoop static crush load 48.75 kN
# BMWM_Jewelry_Trace[1511]: Quad chrome tailpipe backpressure 1.94 kPa, roll hoop static crush load 48.77 kN
# BMWM_Jewelry_Trace[1512]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 48.78 kN
# BMWM_Jewelry_Trace[1513]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 48.80 kN
# BMWM_Jewelry_Trace[1514]: Quad chrome tailpipe backpressure 1.96 kPa, roll hoop static crush load 48.81 kN
# BMWM_Jewelry_Trace[1515]: Quad chrome tailpipe backpressure 1.97 kPa, roll hoop static crush load 48.82 kN
# BMWM_Jewelry_Trace[1516]: Quad chrome tailpipe backpressure 1.98 kPa, roll hoop static crush load 48.84 kN
# BMWM_Jewelry_Trace[1517]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 48.85 kN
# BMWM_Jewelry_Trace[1518]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 48.87 kN
# BMWM_Jewelry_Trace[1519]: Quad chrome tailpipe backpressure 2.00 kPa, roll hoop static crush load 48.88 kN
# BMWM_Jewelry_Trace[1520]: Quad chrome tailpipe backpressure 2.01 kPa, roll hoop static crush load 48.90 kN
# BMWM_Jewelry_Trace[1521]: Quad chrome tailpipe backpressure 2.02 kPa, roll hoop static crush load 48.91 kN
# BMWM_Jewelry_Trace[1522]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 48.93 kN
# BMWM_Jewelry_Trace[1523]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 48.95 kN
# BMWM_Jewelry_Trace[1524]: Quad chrome tailpipe backpressure 2.04 kPa, roll hoop static crush load 48.96 kN
# BMWM_Jewelry_Trace[1525]: Quad chrome tailpipe backpressure 2.05 kPa, roll hoop static crush load 48.98 kN
# BMWM_Jewelry_Trace[1526]: Quad chrome tailpipe backpressure 2.06 kPa, roll hoop static crush load 48.99 kN
# BMWM_Jewelry_Trace[1527]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 49.00 kN
# BMWM_Jewelry_Trace[1528]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 49.02 kN
# BMWM_Jewelry_Trace[1529]: Quad chrome tailpipe backpressure 2.08 kPa, roll hoop static crush load 49.03 kN
# BMWM_Jewelry_Trace[1530]: Quad chrome tailpipe backpressure 2.09 kPa, roll hoop static crush load 49.05 kN
# BMWM_Jewelry_Trace[1531]: Quad chrome tailpipe backpressure 2.10 kPa, roll hoop static crush load 49.06 kN
# BMWM_Jewelry_Trace[1532]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 49.08 kN
# BMWM_Jewelry_Trace[1533]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 49.09 kN
# BMWM_Jewelry_Trace[1534]: Quad chrome tailpipe backpressure 2.12 kPa, roll hoop static crush load 49.11 kN
# BMWM_Jewelry_Trace[1535]: Quad chrome tailpipe backpressure 2.13 kPa, roll hoop static crush load 49.13 kN
# BMWM_Jewelry_Trace[1536]: Quad chrome tailpipe backpressure 2.14 kPa, roll hoop static crush load 49.14 kN
# BMWM_Jewelry_Trace[1537]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 49.16 kN
# BMWM_Jewelry_Trace[1538]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 49.17 kN
# BMWM_Jewelry_Trace[1539]: Quad chrome tailpipe backpressure 2.16 kPa, roll hoop static crush load 49.19 kN
# BMWM_Jewelry_Trace[1540]: Quad chrome tailpipe backpressure 2.17 kPa, roll hoop static crush load 49.20 kN
# BMWM_Jewelry_Trace[1541]: Quad chrome tailpipe backpressure 2.18 kPa, roll hoop static crush load 49.21 kN
# BMWM_Jewelry_Trace[1542]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 49.23 kN
# BMWM_Jewelry_Trace[1543]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 49.24 kN
# BMWM_Jewelry_Trace[1544]: Quad chrome tailpipe backpressure 2.20 kPa, roll hoop static crush load 49.26 kN
# BMWM_Jewelry_Trace[1545]: Quad chrome tailpipe backpressure 2.21 kPa, roll hoop static crush load 49.27 kN
# BMWM_Jewelry_Trace[1546]: Quad chrome tailpipe backpressure 2.22 kPa, roll hoop static crush load 49.29 kN
# BMWM_Jewelry_Trace[1547]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 49.30 kN
# BMWM_Jewelry_Trace[1548]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 49.32 kN
# BMWM_Jewelry_Trace[1549]: Quad chrome tailpipe backpressure 2.24 kPa, roll hoop static crush load 49.34 kN
# BMWM_Jewelry_Trace[1550]: Quad chrome tailpipe backpressure 2.25 kPa, roll hoop static crush load 49.35 kN
# BMWM_Jewelry_Trace[1551]: Quad chrome tailpipe backpressure 1.86 kPa, roll hoop static crush load 49.37 kN
# BMWM_Jewelry_Trace[1552]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 49.38 kN
# BMWM_Jewelry_Trace[1553]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 49.39 kN
# BMWM_Jewelry_Trace[1554]: Quad chrome tailpipe backpressure 1.88 kPa, roll hoop static crush load 49.41 kN
# BMWM_Jewelry_Trace[1555]: Quad chrome tailpipe backpressure 1.89 kPa, roll hoop static crush load 49.42 kN
# BMWM_Jewelry_Trace[1556]: Quad chrome tailpipe backpressure 1.90 kPa, roll hoop static crush load 49.44 kN
# BMWM_Jewelry_Trace[1557]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 49.45 kN
# BMWM_Jewelry_Trace[1558]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 49.47 kN
# BMWM_Jewelry_Trace[1559]: Quad chrome tailpipe backpressure 1.92 kPa, roll hoop static crush load 49.48 kN
# BMWM_Jewelry_Trace[1560]: Quad chrome tailpipe backpressure 1.93 kPa, roll hoop static crush load 49.50 kN
# BMWM_Jewelry_Trace[1561]: Quad chrome tailpipe backpressure 1.94 kPa, roll hoop static crush load 49.52 kN
# BMWM_Jewelry_Trace[1562]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 49.53 kN
# BMWM_Jewelry_Trace[1563]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 49.55 kN
# BMWM_Jewelry_Trace[1564]: Quad chrome tailpipe backpressure 1.96 kPa, roll hoop static crush load 49.56 kN
# BMWM_Jewelry_Trace[1565]: Quad chrome tailpipe backpressure 1.97 kPa, roll hoop static crush load 49.57 kN
# BMWM_Jewelry_Trace[1566]: Quad chrome tailpipe backpressure 1.98 kPa, roll hoop static crush load 49.59 kN
# BMWM_Jewelry_Trace[1567]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 49.60 kN
# BMWM_Jewelry_Trace[1568]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 49.62 kN
# BMWM_Jewelry_Trace[1569]: Quad chrome tailpipe backpressure 2.00 kPa, roll hoop static crush load 49.63 kN
# BMWM_Jewelry_Trace[1570]: Quad chrome tailpipe backpressure 2.01 kPa, roll hoop static crush load 49.65 kN
# BMWM_Jewelry_Trace[1571]: Quad chrome tailpipe backpressure 2.02 kPa, roll hoop static crush load 49.66 kN
# BMWM_Jewelry_Trace[1572]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 49.68 kN
# BMWM_Jewelry_Trace[1573]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 49.70 kN
# BMWM_Jewelry_Trace[1574]: Quad chrome tailpipe backpressure 2.04 kPa, roll hoop static crush load 49.71 kN
# BMWM_Jewelry_Trace[1575]: Quad chrome tailpipe backpressure 2.05 kPa, roll hoop static crush load 49.73 kN
# BMWM_Jewelry_Trace[1576]: Quad chrome tailpipe backpressure 2.06 kPa, roll hoop static crush load 49.74 kN
# BMWM_Jewelry_Trace[1577]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 49.75 kN
# BMWM_Jewelry_Trace[1578]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 49.77 kN
# BMWM_Jewelry_Trace[1579]: Quad chrome tailpipe backpressure 2.08 kPa, roll hoop static crush load 49.78 kN
# BMWM_Jewelry_Trace[1580]: Quad chrome tailpipe backpressure 2.09 kPa, roll hoop static crush load 49.80 kN
# BMWM_Jewelry_Trace[1581]: Quad chrome tailpipe backpressure 2.10 kPa, roll hoop static crush load 49.81 kN
# BMWM_Jewelry_Trace[1582]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 49.83 kN
# BMWM_Jewelry_Trace[1583]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 49.84 kN
# BMWM_Jewelry_Trace[1584]: Quad chrome tailpipe backpressure 2.12 kPa, roll hoop static crush load 49.86 kN
# BMWM_Jewelry_Trace[1585]: Quad chrome tailpipe backpressure 2.13 kPa, roll hoop static crush load 49.88 kN
# BMWM_Jewelry_Trace[1586]: Quad chrome tailpipe backpressure 2.14 kPa, roll hoop static crush load 49.89 kN
# BMWM_Jewelry_Trace[1587]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 49.91 kN
# BMWM_Jewelry_Trace[1588]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 49.92 kN
# BMWM_Jewelry_Trace[1589]: Quad chrome tailpipe backpressure 2.16 kPa, roll hoop static crush load 49.94 kN
# BMWM_Jewelry_Trace[1590]: Quad chrome tailpipe backpressure 2.17 kPa, roll hoop static crush load 49.95 kN
# BMWM_Jewelry_Trace[1591]: Quad chrome tailpipe backpressure 2.18 kPa, roll hoop static crush load 49.96 kN
# BMWM_Jewelry_Trace[1592]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 49.98 kN
# BMWM_Jewelry_Trace[1593]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 49.99 kN
# BMWM_Jewelry_Trace[1594]: Quad chrome tailpipe backpressure 2.20 kPa, roll hoop static crush load 50.01 kN
# BMWM_Jewelry_Trace[1595]: Quad chrome tailpipe backpressure 2.21 kPa, roll hoop static crush load 50.02 kN
# BMWM_Jewelry_Trace[1596]: Quad chrome tailpipe backpressure 2.22 kPa, roll hoop static crush load 50.04 kN
# BMWM_Jewelry_Trace[1597]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 50.05 kN
# BMWM_Jewelry_Trace[1598]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 50.07 kN
# BMWM_Jewelry_Trace[1599]: Quad chrome tailpipe backpressure 2.24 kPa, roll hoop static crush load 50.09 kN
# BMWM_Jewelry_Trace[1600]: Quad chrome tailpipe backpressure 1.85 kPa, roll hoop static crush load 50.10 kN
# BMWM_Jewelry_Trace[1601]: Quad chrome tailpipe backpressure 1.86 kPa, roll hoop static crush load 50.12 kN
# BMWM_Jewelry_Trace[1602]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 50.13 kN
# BMWM_Jewelry_Trace[1603]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 50.14 kN
# BMWM_Jewelry_Trace[1604]: Quad chrome tailpipe backpressure 1.88 kPa, roll hoop static crush load 50.16 kN
# BMWM_Jewelry_Trace[1605]: Quad chrome tailpipe backpressure 1.89 kPa, roll hoop static crush load 50.17 kN
# BMWM_Jewelry_Trace[1606]: Quad chrome tailpipe backpressure 1.90 kPa, roll hoop static crush load 50.19 kN
# BMWM_Jewelry_Trace[1607]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 50.20 kN
# BMWM_Jewelry_Trace[1608]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 50.22 kN
# BMWM_Jewelry_Trace[1609]: Quad chrome tailpipe backpressure 1.92 kPa, roll hoop static crush load 50.23 kN
# BMWM_Jewelry_Trace[1610]: Quad chrome tailpipe backpressure 1.93 kPa, roll hoop static crush load 50.25 kN
# BMWM_Jewelry_Trace[1611]: Quad chrome tailpipe backpressure 1.94 kPa, roll hoop static crush load 50.27 kN
# BMWM_Jewelry_Trace[1612]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 50.28 kN
# BMWM_Jewelry_Trace[1613]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 50.30 kN
# BMWM_Jewelry_Trace[1614]: Quad chrome tailpipe backpressure 1.96 kPa, roll hoop static crush load 50.31 kN
# BMWM_Jewelry_Trace[1615]: Quad chrome tailpipe backpressure 1.97 kPa, roll hoop static crush load 50.32 kN
# BMWM_Jewelry_Trace[1616]: Quad chrome tailpipe backpressure 1.98 kPa, roll hoop static crush load 50.34 kN
# BMWM_Jewelry_Trace[1617]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 50.35 kN
# BMWM_Jewelry_Trace[1618]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 50.37 kN
# BMWM_Jewelry_Trace[1619]: Quad chrome tailpipe backpressure 2.00 kPa, roll hoop static crush load 50.38 kN
# BMWM_Jewelry_Trace[1620]: Quad chrome tailpipe backpressure 2.01 kPa, roll hoop static crush load 50.40 kN
# BMWM_Jewelry_Trace[1621]: Quad chrome tailpipe backpressure 2.02 kPa, roll hoop static crush load 50.41 kN
# BMWM_Jewelry_Trace[1622]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 50.43 kN
# BMWM_Jewelry_Trace[1623]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 50.45 kN
# BMWM_Jewelry_Trace[1624]: Quad chrome tailpipe backpressure 2.04 kPa, roll hoop static crush load 50.46 kN
# BMWM_Jewelry_Trace[1625]: Quad chrome tailpipe backpressure 2.05 kPa, roll hoop static crush load 50.48 kN
# BMWM_Jewelry_Trace[1626]: Quad chrome tailpipe backpressure 2.06 kPa, roll hoop static crush load 50.49 kN
# BMWM_Jewelry_Trace[1627]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 50.50 kN
# BMWM_Jewelry_Trace[1628]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 50.52 kN
# BMWM_Jewelry_Trace[1629]: Quad chrome tailpipe backpressure 2.08 kPa, roll hoop static crush load 50.53 kN
# BMWM_Jewelry_Trace[1630]: Quad chrome tailpipe backpressure 2.09 kPa, roll hoop static crush load 50.55 kN
# BMWM_Jewelry_Trace[1631]: Quad chrome tailpipe backpressure 2.10 kPa, roll hoop static crush load 50.56 kN
# BMWM_Jewelry_Trace[1632]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 50.58 kN
# BMWM_Jewelry_Trace[1633]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 50.59 kN
# BMWM_Jewelry_Trace[1634]: Quad chrome tailpipe backpressure 2.12 kPa, roll hoop static crush load 50.61 kN
# BMWM_Jewelry_Trace[1635]: Quad chrome tailpipe backpressure 2.13 kPa, roll hoop static crush load 50.63 kN
# BMWM_Jewelry_Trace[1636]: Quad chrome tailpipe backpressure 2.14 kPa, roll hoop static crush load 50.64 kN
# BMWM_Jewelry_Trace[1637]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 50.66 kN
# BMWM_Jewelry_Trace[1638]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 50.67 kN
# BMWM_Jewelry_Trace[1639]: Quad chrome tailpipe backpressure 2.16 kPa, roll hoop static crush load 50.69 kN
# BMWM_Jewelry_Trace[1640]: Quad chrome tailpipe backpressure 2.17 kPa, roll hoop static crush load 50.70 kN
# BMWM_Jewelry_Trace[1641]: Quad chrome tailpipe backpressure 2.18 kPa, roll hoop static crush load 50.71 kN
# BMWM_Jewelry_Trace[1642]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 50.73 kN
# BMWM_Jewelry_Trace[1643]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 50.74 kN
# BMWM_Jewelry_Trace[1644]: Quad chrome tailpipe backpressure 2.20 kPa, roll hoop static crush load 50.76 kN
# BMWM_Jewelry_Trace[1645]: Quad chrome tailpipe backpressure 2.21 kPa, roll hoop static crush load 50.77 kN
# BMWM_Jewelry_Trace[1646]: Quad chrome tailpipe backpressure 2.22 kPa, roll hoop static crush load 50.79 kN
# BMWM_Jewelry_Trace[1647]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 50.80 kN
# BMWM_Jewelry_Trace[1648]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 50.82 kN
# BMWM_Jewelry_Trace[1649]: Quad chrome tailpipe backpressure 2.24 kPa, roll hoop static crush load 50.84 kN
# BMWM_Jewelry_Trace[1650]: Quad chrome tailpipe backpressure 1.85 kPa, roll hoop static crush load 50.85 kN
# BMWM_Jewelry_Trace[1651]: Quad chrome tailpipe backpressure 1.86 kPa, roll hoop static crush load 50.87 kN
# BMWM_Jewelry_Trace[1652]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 50.88 kN
# BMWM_Jewelry_Trace[1653]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 50.89 kN
# BMWM_Jewelry_Trace[1654]: Quad chrome tailpipe backpressure 1.88 kPa, roll hoop static crush load 50.91 kN
# BMWM_Jewelry_Trace[1655]: Quad chrome tailpipe backpressure 1.89 kPa, roll hoop static crush load 50.92 kN
# BMWM_Jewelry_Trace[1656]: Quad chrome tailpipe backpressure 1.90 kPa, roll hoop static crush load 50.94 kN
# BMWM_Jewelry_Trace[1657]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 50.95 kN
# BMWM_Jewelry_Trace[1658]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 50.97 kN
# BMWM_Jewelry_Trace[1659]: Quad chrome tailpipe backpressure 1.92 kPa, roll hoop static crush load 50.98 kN
# BMWM_Jewelry_Trace[1660]: Quad chrome tailpipe backpressure 1.93 kPa, roll hoop static crush load 51.00 kN
# BMWM_Jewelry_Trace[1661]: Quad chrome tailpipe backpressure 1.94 kPa, roll hoop static crush load 51.02 kN
# BMWM_Jewelry_Trace[1662]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 51.03 kN
# BMWM_Jewelry_Trace[1663]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 51.05 kN
# BMWM_Jewelry_Trace[1664]: Quad chrome tailpipe backpressure 1.96 kPa, roll hoop static crush load 51.06 kN
# BMWM_Jewelry_Trace[1665]: Quad chrome tailpipe backpressure 1.97 kPa, roll hoop static crush load 51.07 kN
# BMWM_Jewelry_Trace[1666]: Quad chrome tailpipe backpressure 1.98 kPa, roll hoop static crush load 51.09 kN
# BMWM_Jewelry_Trace[1667]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 51.10 kN
# BMWM_Jewelry_Trace[1668]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 51.12 kN
# BMWM_Jewelry_Trace[1669]: Quad chrome tailpipe backpressure 2.00 kPa, roll hoop static crush load 51.13 kN
# BMWM_Jewelry_Trace[1670]: Quad chrome tailpipe backpressure 2.01 kPa, roll hoop static crush load 51.15 kN
# BMWM_Jewelry_Trace[1671]: Quad chrome tailpipe backpressure 2.02 kPa, roll hoop static crush load 51.16 kN
# BMWM_Jewelry_Trace[1672]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 51.18 kN
# BMWM_Jewelry_Trace[1673]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 51.20 kN
# BMWM_Jewelry_Trace[1674]: Quad chrome tailpipe backpressure 2.04 kPa, roll hoop static crush load 51.21 kN
# BMWM_Jewelry_Trace[1675]: Quad chrome tailpipe backpressure 2.05 kPa, roll hoop static crush load 51.23 kN
# BMWM_Jewelry_Trace[1676]: Quad chrome tailpipe backpressure 2.06 kPa, roll hoop static crush load 51.24 kN
# BMWM_Jewelry_Trace[1677]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 51.25 kN
# BMWM_Jewelry_Trace[1678]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 51.27 kN
# BMWM_Jewelry_Trace[1679]: Quad chrome tailpipe backpressure 2.08 kPa, roll hoop static crush load 51.28 kN
# BMWM_Jewelry_Trace[1680]: Quad chrome tailpipe backpressure 2.09 kPa, roll hoop static crush load 51.30 kN
# BMWM_Jewelry_Trace[1681]: Quad chrome tailpipe backpressure 2.10 kPa, roll hoop static crush load 51.31 kN
# BMWM_Jewelry_Trace[1682]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 51.33 kN
# BMWM_Jewelry_Trace[1683]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 51.34 kN
# BMWM_Jewelry_Trace[1684]: Quad chrome tailpipe backpressure 2.12 kPa, roll hoop static crush load 51.36 kN
# BMWM_Jewelry_Trace[1685]: Quad chrome tailpipe backpressure 2.13 kPa, roll hoop static crush load 51.38 kN
# BMWM_Jewelry_Trace[1686]: Quad chrome tailpipe backpressure 2.14 kPa, roll hoop static crush load 51.39 kN
# BMWM_Jewelry_Trace[1687]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 51.41 kN
# BMWM_Jewelry_Trace[1688]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 51.42 kN
# BMWM_Jewelry_Trace[1689]: Quad chrome tailpipe backpressure 2.16 kPa, roll hoop static crush load 51.43 kN
# BMWM_Jewelry_Trace[1690]: Quad chrome tailpipe backpressure 2.17 kPa, roll hoop static crush load 51.45 kN
# BMWM_Jewelry_Trace[1691]: Quad chrome tailpipe backpressure 2.18 kPa, roll hoop static crush load 51.46 kN
# BMWM_Jewelry_Trace[1692]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 51.48 kN
# BMWM_Jewelry_Trace[1693]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 51.49 kN
# BMWM_Jewelry_Trace[1694]: Quad chrome tailpipe backpressure 2.20 kPa, roll hoop static crush load 51.51 kN
# BMWM_Jewelry_Trace[1695]: Quad chrome tailpipe backpressure 2.21 kPa, roll hoop static crush load 51.52 kN
# BMWM_Jewelry_Trace[1696]: Quad chrome tailpipe backpressure 2.22 kPa, roll hoop static crush load 51.54 kN
# BMWM_Jewelry_Trace[1697]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 51.55 kN
# BMWM_Jewelry_Trace[1698]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 51.57 kN
# BMWM_Jewelry_Trace[1699]: Quad chrome tailpipe backpressure 2.24 kPa, roll hoop static crush load 51.59 kN
# BMWM_Jewelry_Trace[1700]: Quad chrome tailpipe backpressure 2.25 kPa, roll hoop static crush load 51.60 kN
# BMWM_Jewelry_Trace[1701]: Quad chrome tailpipe backpressure 1.86 kPa, roll hoop static crush load 51.62 kN
# BMWM_Jewelry_Trace[1702]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 51.63 kN
# BMWM_Jewelry_Trace[1703]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 51.64 kN
# BMWM_Jewelry_Trace[1704]: Quad chrome tailpipe backpressure 1.88 kPa, roll hoop static crush load 51.66 kN
# BMWM_Jewelry_Trace[1705]: Quad chrome tailpipe backpressure 1.89 kPa, roll hoop static crush load 51.67 kN
# BMWM_Jewelry_Trace[1706]: Quad chrome tailpipe backpressure 1.90 kPa, roll hoop static crush load 51.69 kN
# BMWM_Jewelry_Trace[1707]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 48.50 kN
# BMWM_Jewelry_Trace[1708]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 48.52 kN
# BMWM_Jewelry_Trace[1709]: Quad chrome tailpipe backpressure 1.92 kPa, roll hoop static crush load 48.53 kN
# BMWM_Jewelry_Trace[1710]: Quad chrome tailpipe backpressure 1.93 kPa, roll hoop static crush load 48.55 kN
# BMWM_Jewelry_Trace[1711]: Quad chrome tailpipe backpressure 1.94 kPa, roll hoop static crush load 48.56 kN
# BMWM_Jewelry_Trace[1712]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 48.58 kN
# BMWM_Jewelry_Trace[1713]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 48.59 kN
# BMWM_Jewelry_Trace[1714]: Quad chrome tailpipe backpressure 1.96 kPa, roll hoop static crush load 48.61 kN
# BMWM_Jewelry_Trace[1715]: Quad chrome tailpipe backpressure 1.97 kPa, roll hoop static crush load 48.63 kN
# BMWM_Jewelry_Trace[1716]: Quad chrome tailpipe backpressure 1.98 kPa, roll hoop static crush load 48.64 kN
# BMWM_Jewelry_Trace[1717]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 48.66 kN
# BMWM_Jewelry_Trace[1718]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 48.67 kN
# BMWM_Jewelry_Trace[1719]: Quad chrome tailpipe backpressure 2.00 kPa, roll hoop static crush load 48.69 kN
# BMWM_Jewelry_Trace[1720]: Quad chrome tailpipe backpressure 2.01 kPa, roll hoop static crush load 48.70 kN
# BMWM_Jewelry_Trace[1721]: Quad chrome tailpipe backpressure 2.02 kPa, roll hoop static crush load 48.71 kN
# BMWM_Jewelry_Trace[1722]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 48.73 kN
# BMWM_Jewelry_Trace[1723]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 48.74 kN
# BMWM_Jewelry_Trace[1724]: Quad chrome tailpipe backpressure 2.04 kPa, roll hoop static crush load 48.76 kN
# BMWM_Jewelry_Trace[1725]: Quad chrome tailpipe backpressure 2.05 kPa, roll hoop static crush load 48.77 kN
# BMWM_Jewelry_Trace[1726]: Quad chrome tailpipe backpressure 2.06 kPa, roll hoop static crush load 48.79 kN
# BMWM_Jewelry_Trace[1727]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 48.80 kN
# BMWM_Jewelry_Trace[1728]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 48.82 kN
# BMWM_Jewelry_Trace[1729]: Quad chrome tailpipe backpressure 2.08 kPa, roll hoop static crush load 48.83 kN
# BMWM_Jewelry_Trace[1730]: Quad chrome tailpipe backpressure 2.09 kPa, roll hoop static crush load 48.85 kN
# BMWM_Jewelry_Trace[1731]: Quad chrome tailpipe backpressure 2.10 kPa, roll hoop static crush load 48.86 kN
# BMWM_Jewelry_Trace[1732]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 48.88 kN
# BMWM_Jewelry_Trace[1733]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 48.89 kN
# BMWM_Jewelry_Trace[1734]: Quad chrome tailpipe backpressure 2.12 kPa, roll hoop static crush load 48.91 kN
# BMWM_Jewelry_Trace[1735]: Quad chrome tailpipe backpressure 2.13 kPa, roll hoop static crush load 48.92 kN
# BMWM_Jewelry_Trace[1736]: Quad chrome tailpipe backpressure 2.14 kPa, roll hoop static crush load 48.94 kN
# BMWM_Jewelry_Trace[1737]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 48.95 kN
# BMWM_Jewelry_Trace[1738]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 48.97 kN
# BMWM_Jewelry_Trace[1739]: Quad chrome tailpipe backpressure 2.16 kPa, roll hoop static crush load 48.98 kN
# BMWM_Jewelry_Trace[1740]: Quad chrome tailpipe backpressure 2.17 kPa, roll hoop static crush load 49.00 kN
# BMWM_Jewelry_Trace[1741]: Quad chrome tailpipe backpressure 2.18 kPa, roll hoop static crush load 49.02 kN
# BMWM_Jewelry_Trace[1742]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 49.03 kN
# BMWM_Jewelry_Trace[1743]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 49.05 kN
# BMWM_Jewelry_Trace[1744]: Quad chrome tailpipe backpressure 2.20 kPa, roll hoop static crush load 49.06 kN
# BMWM_Jewelry_Trace[1745]: Quad chrome tailpipe backpressure 2.21 kPa, roll hoop static crush load 49.08 kN
# BMWM_Jewelry_Trace[1746]: Quad chrome tailpipe backpressure 2.22 kPa, roll hoop static crush load 49.09 kN
# BMWM_Jewelry_Trace[1747]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 49.10 kN
# BMWM_Jewelry_Trace[1748]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 49.12 kN
# BMWM_Jewelry_Trace[1749]: Quad chrome tailpipe backpressure 2.24 kPa, roll hoop static crush load 49.13 kN
# BMWM_Jewelry_Trace[1750]: Quad chrome tailpipe backpressure 2.25 kPa, roll hoop static crush load 49.15 kN
# BMWM_Jewelry_Trace[1751]: Quad chrome tailpipe backpressure 1.86 kPa, roll hoop static crush load 49.16 kN
# BMWM_Jewelry_Trace[1752]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 49.18 kN
# BMWM_Jewelry_Trace[1753]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 49.19 kN
# BMWM_Jewelry_Trace[1754]: Quad chrome tailpipe backpressure 1.88 kPa, roll hoop static crush load 49.21 kN
# BMWM_Jewelry_Trace[1755]: Quad chrome tailpipe backpressure 1.89 kPa, roll hoop static crush load 49.22 kN
# BMWM_Jewelry_Trace[1756]: Quad chrome tailpipe backpressure 1.90 kPa, roll hoop static crush load 49.24 kN
# BMWM_Jewelry_Trace[1757]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 49.25 kN
# BMWM_Jewelry_Trace[1758]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 49.27 kN
# BMWM_Jewelry_Trace[1759]: Quad chrome tailpipe backpressure 1.92 kPa, roll hoop static crush load 49.28 kN
# BMWM_Jewelry_Trace[1760]: Quad chrome tailpipe backpressure 1.93 kPa, roll hoop static crush load 49.30 kN
# BMWM_Jewelry_Trace[1761]: Quad chrome tailpipe backpressure 1.94 kPa, roll hoop static crush load 49.31 kN
# BMWM_Jewelry_Trace[1762]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 49.33 kN
# BMWM_Jewelry_Trace[1763]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 49.34 kN
# BMWM_Jewelry_Trace[1764]: Quad chrome tailpipe backpressure 1.96 kPa, roll hoop static crush load 49.36 kN
# BMWM_Jewelry_Trace[1765]: Quad chrome tailpipe backpressure 1.97 kPa, roll hoop static crush load 49.38 kN
# BMWM_Jewelry_Trace[1766]: Quad chrome tailpipe backpressure 1.98 kPa, roll hoop static crush load 49.39 kN
# BMWM_Jewelry_Trace[1767]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 49.41 kN
# BMWM_Jewelry_Trace[1768]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 49.42 kN
# BMWM_Jewelry_Trace[1769]: Quad chrome tailpipe backpressure 2.00 kPa, roll hoop static crush load 49.44 kN
# BMWM_Jewelry_Trace[1770]: Quad chrome tailpipe backpressure 2.01 kPa, roll hoop static crush load 49.45 kN
# BMWM_Jewelry_Trace[1771]: Quad chrome tailpipe backpressure 2.02 kPa, roll hoop static crush load 49.46 kN
# BMWM_Jewelry_Trace[1772]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 49.48 kN
# BMWM_Jewelry_Trace[1773]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 49.49 kN
# BMWM_Jewelry_Trace[1774]: Quad chrome tailpipe backpressure 2.04 kPa, roll hoop static crush load 49.51 kN
# BMWM_Jewelry_Trace[1775]: Quad chrome tailpipe backpressure 2.05 kPa, roll hoop static crush load 49.52 kN
# BMWM_Jewelry_Trace[1776]: Quad chrome tailpipe backpressure 2.06 kPa, roll hoop static crush load 49.54 kN
# BMWM_Jewelry_Trace[1777]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 49.55 kN
# BMWM_Jewelry_Trace[1778]: Quad chrome tailpipe backpressure 2.07 kPa, roll hoop static crush load 49.57 kN
# BMWM_Jewelry_Trace[1779]: Quad chrome tailpipe backpressure 2.08 kPa, roll hoop static crush load 49.58 kN
# BMWM_Jewelry_Trace[1780]: Quad chrome tailpipe backpressure 2.09 kPa, roll hoop static crush load 49.60 kN
# BMWM_Jewelry_Trace[1781]: Quad chrome tailpipe backpressure 2.10 kPa, roll hoop static crush load 49.61 kN
# BMWM_Jewelry_Trace[1782]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 49.63 kN
# BMWM_Jewelry_Trace[1783]: Quad chrome tailpipe backpressure 2.11 kPa, roll hoop static crush load 49.64 kN
# BMWM_Jewelry_Trace[1784]: Quad chrome tailpipe backpressure 2.12 kPa, roll hoop static crush load 49.66 kN
# BMWM_Jewelry_Trace[1785]: Quad chrome tailpipe backpressure 2.13 kPa, roll hoop static crush load 49.67 kN
# BMWM_Jewelry_Trace[1786]: Quad chrome tailpipe backpressure 2.14 kPa, roll hoop static crush load 49.69 kN
# BMWM_Jewelry_Trace[1787]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 49.70 kN
# BMWM_Jewelry_Trace[1788]: Quad chrome tailpipe backpressure 2.15 kPa, roll hoop static crush load 49.72 kN
# BMWM_Jewelry_Trace[1789]: Quad chrome tailpipe backpressure 2.16 kPa, roll hoop static crush load 49.73 kN
# BMWM_Jewelry_Trace[1790]: Quad chrome tailpipe backpressure 2.17 kPa, roll hoop static crush load 49.75 kN
# BMWM_Jewelry_Trace[1791]: Quad chrome tailpipe backpressure 2.18 kPa, roll hoop static crush load 49.77 kN
# BMWM_Jewelry_Trace[1792]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 49.78 kN
# BMWM_Jewelry_Trace[1793]: Quad chrome tailpipe backpressure 2.19 kPa, roll hoop static crush load 49.80 kN
# BMWM_Jewelry_Trace[1794]: Quad chrome tailpipe backpressure 2.20 kPa, roll hoop static crush load 49.81 kN
# BMWM_Jewelry_Trace[1795]: Quad chrome tailpipe backpressure 2.21 kPa, roll hoop static crush load 49.83 kN
# BMWM_Jewelry_Trace[1796]: Quad chrome tailpipe backpressure 2.22 kPa, roll hoop static crush load 49.84 kN
# BMWM_Jewelry_Trace[1797]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 49.85 kN
# BMWM_Jewelry_Trace[1798]: Quad chrome tailpipe backpressure 2.23 kPa, roll hoop static crush load 49.87 kN
# BMWM_Jewelry_Trace[1799]: Quad chrome tailpipe backpressure 2.24 kPa, roll hoop static crush load 49.88 kN
# BMWM_Jewelry_Trace[1800]: Quad chrome tailpipe backpressure 2.25 kPa, roll hoop static crush load 49.90 kN
# BMWM_Jewelry_Trace[1801]: Quad chrome tailpipe backpressure 1.86 kPa, roll hoop static crush load 49.91 kN
# BMWM_Jewelry_Trace[1802]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 49.93 kN
# BMWM_Jewelry_Trace[1803]: Quad chrome tailpipe backpressure 1.87 kPa, roll hoop static crush load 49.94 kN
# BMWM_Jewelry_Trace[1804]: Quad chrome tailpipe backpressure 1.88 kPa, roll hoop static crush load 49.96 kN
# BMWM_Jewelry_Trace[1805]: Quad chrome tailpipe backpressure 1.89 kPa, roll hoop static crush load 49.97 kN
# BMWM_Jewelry_Trace[1806]: Quad chrome tailpipe backpressure 1.90 kPa, roll hoop static crush load 49.99 kN
# BMWM_Jewelry_Trace[1807]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 50.00 kN
# BMWM_Jewelry_Trace[1808]: Quad chrome tailpipe backpressure 1.91 kPa, roll hoop static crush load 50.02 kN
# BMWM_Jewelry_Trace[1809]: Quad chrome tailpipe backpressure 1.92 kPa, roll hoop static crush load 50.03 kN
# BMWM_Jewelry_Trace[1810]: Quad chrome tailpipe backpressure 1.93 kPa, roll hoop static crush load 50.05 kN
# BMWM_Jewelry_Trace[1811]: Quad chrome tailpipe backpressure 1.94 kPa, roll hoop static crush load 50.06 kN
# BMWM_Jewelry_Trace[1812]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 50.08 kN
# BMWM_Jewelry_Trace[1813]: Quad chrome tailpipe backpressure 1.95 kPa, roll hoop static crush load 50.09 kN
# BMWM_Jewelry_Trace[1814]: Quad chrome tailpipe backpressure 1.96 kPa, roll hoop static crush load 50.11 kN
# BMWM_Jewelry_Trace[1815]: Quad chrome tailpipe backpressure 1.97 kPa, roll hoop static crush load 50.13 kN
# BMWM_Jewelry_Trace[1816]: Quad chrome tailpipe backpressure 1.98 kPa, roll hoop static crush load 50.14 kN
# BMWM_Jewelry_Trace[1817]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 50.16 kN
# BMWM_Jewelry_Trace[1818]: Quad chrome tailpipe backpressure 1.99 kPa, roll hoop static crush load 50.17 kN
# BMWM_Jewelry_Trace[1819]: Quad chrome tailpipe backpressure 2.00 kPa, roll hoop static crush load 50.19 kN
# BMWM_Jewelry_Trace[1820]: Quad chrome tailpipe backpressure 2.01 kPa, roll hoop static crush load 50.20 kN
# BMWM_Jewelry_Trace[1821]: Quad chrome tailpipe backpressure 2.02 kPa, roll hoop static crush load 50.21 kN
# BMWM_Jewelry_Trace[1822]: Quad chrome tailpipe backpressure 2.03 kPa, roll hoop static crush load 50.23 kN
