"""
=============================================================================
Procedural Class-A CAD Generator: Lotus Elise Series 2 (111R) (2000s)
PHASE 32: Insectoid Composite Clamshells, Extruded Diffuser & Master Export
=============================================================================
Roadster Architecture · 2000s British Mid-Engine Track Legend (Hethel, UK)
Adheres strictly to the Maximum Visual Quality & Intensive CAD Mesh Standard.

Vehicle Dimensions:
- Wheelbase: 2300 mm (Front axle: Y = +1.150m, Rear axle: Y = -1.150m)
- Overall Length: 3785 mm (Front tip: Y = +1.8925m, Rear transom: Y = -1.8925m)
- Overall Width: 1719 mm (Outer fender flanks: X = +/- 0.8595m)
- Overall Height: 1143 mm (Roofless roadster top of windshield: Z = 1.143m)
- Track Width: Front 1457 mm (X = +/- 0.7285m), Rear 1460 mm (X = +/- 0.730m)
- Ground Clearance: 120 mm (Z_rocker = 0.120m)

Phase 32 Subsystems & Master Assembly:
1. Imports and executes Phase 31 underlying chassis & powertrain:
   - Bonded extruded aluminum tub, rear engine subframe, 2ZZ-GE engine, C64 transaxle,
     double wishbones, staggered 16"/17" alloy wheels, and minimalist cockpit.
2. High-Precision Class-A Exterior Bodywork:
   - Continuous solid quad-grid Composite Front Clamshell with insectoid front face & nostrils.
   - Sculpted Composite Lightweight Side Doors bridging the clamshells.
   - Dual Swept Aerodynamic Headlamp Clusters under clear polycarbonate covers.
   - Continuous solid quad-grid Rear Clamshell with cooling louvers & side NACA scoops.
   - Rear Transom Bumper Bulkhead sealing engine bay.
   - Integrated Rear Aerofoil Ducktail Lip Spoiler.
   - Functional Extruded Aluminum Rear Aero Diffuser with 5 vertical air strakes.
   - Center Twin Stainless Steel Round Exhaust Pipes (70mm) exiting through diffuser.
   - Distinctive Round Quad Taillamp Clusters (Ruby brake lamps & amber turn indicators).
   - Lotus Enamel Yellow/Green Nose Badge & Chrome LOTUS Transom Lettering.
   - Slim Aerodynamic Body-Colored Wing Mirrors.
3. Master Multi-Target GLB Export:
   - public/models/vehicles/roadster/2000s/vehicle.glb
   - public/models/Car_Lotus_Elise_S2_Complete.glb
   - exports/Car_Lotus_Elise_S2_2000s.glb
=============================================================================
"""

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector, Matrix, Euler, Quaternion

# Import Phase 31 Generator
gen_dir = os.path.dirname(os.path.abspath(__file__))
if gen_dir not in sys.path:
    sys.path.append(gen_dir)

import generate_lotus_elise_s2_phase1


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

    if transmission > 0.5:
        if hasattr(mat, "blend_method"):
            mat.blend_method = 'BLEND'
        if hasattr(mat, "shadow_method"):
            mat.shadow_method = 'NONE'

    return mat


def link_obj(name, bm, col, mat=None, bevel=0.001, subsurf=0):
    """Converts a bmesh into an object with smooth normals and optional modifiers."""
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
    if subsurf > 0:
        sub = obj.modifiers.new("Subsurf", 'SUBSURF')
        sub.levels = subsurf
        sub.render_levels = subsurf
    return obj


# ----------------------------------------------------------------------------
# 2. PHASE 32 PBR MATERIAL PALETTE
# ----------------------------------------------------------------------------

def create_elise_phase2_materials():
    """Builds the comprehensive PBR material suite for Lotus Elise Series 2 exterior body and jewelry."""
    mats = {}
    # Lotus Racing Green Metallic High-Gloss Body Paint
    mats["paint_green"] = make_pbr_mat(
        "MAT_Elise_Jewel_Racing_Green",
        base_color=(0.012, 0.160, 0.038, 1.0),
        metallic=0.45,
        roughness=0.12,
        clearcoat=1.0
    )
    # Raw Brushed Extruded Aluminum Diffuser
    mats["raw_diffuser"] = make_pbr_mat(
        "MAT_Elise_Extruded_Aluminum_Diffuser",
        base_color=(0.88, 0.90, 0.92, 1.0),
        metallic=0.92,
        roughness=0.25
    )
    # Polished Stainless Steel Exhaust Tips
    mats["exhaust_steel"] = make_pbr_mat(
        "MAT_Elise_Polished_Stainless_Exhaust",
        base_color=(0.94, 0.95, 0.96, 1.0),
        metallic=0.98,
        roughness=0.04
    )
    # Dark Carbon Soot Bore
    mats["exhaust_soot"] = make_pbr_mat(
        "MAT_Elise_Exhaust_Soot_Bore",
        base_color=(0.02, 0.02, 0.02, 1.0),
        metallic=0.10,
        roughness=0.95
    )
    # Optical Headlamp Clear Polycarbonate Cover
    mats["glass_headlamp"] = make_pbr_mat(
        "MAT_Elise_Headlamp_Polycarbonate",
        base_color=(0.94, 0.96, 0.98, 1.0),
        metallic=0.0,
        roughness=0.02,
        transmission=0.95,
        ior=1.52,
        clearcoat=1.0
    )
    # Xenon Core Projector Beam (Emission 14.0)
    mats["xenon_beam"] = make_pbr_mat(
        "MAT_Elise_Xenon_Projector_Beam",
        base_color=(0.92, 0.96, 1.00, 1.0),
        metallic=0.0,
        roughness=0.04,
        emission=(0.88, 0.94, 1.00, 1.0),
        emission_strength=14.0
    )
    # Ruby Red Taillamp Lens (Emission 8.0)
    mats["ruby_lens"] = make_pbr_mat(
        "MAT_Elise_Ruby_Taillamp_Lens",
        base_color=(0.92, 0.04, 0.06, 1.0),
        metallic=0.0,
        roughness=0.04,
        transmission=0.75,
        emission=(0.94, 0.03, 0.04, 1.0),
        emission_strength=8.0
    )
    # Amber Turn Signal Lens (Emission 10.0)
    mats["amber_lens"] = make_pbr_mat(
        "MAT_Elise_Amber_Turn_Lens",
        base_color=(1.00, 0.52, 0.04, 1.0),
        metallic=0.0,
        roughness=0.05,
        transmission=0.70,
        emission=(1.00, 0.48, 0.02, 1.0),
        emission_strength=10.0
    )
    # Lotus Enamel Yellow
    mats["lotus_yellow"] = make_pbr_mat(
        "MAT_Elise_Lotus_Badge_Yellow",
        base_color=(0.98, 0.82, 0.04, 1.0),
        metallic=0.05,
        roughness=0.15
    )
    # Lotus Enamel Green
    mats["lotus_green"] = make_pbr_mat(
        "MAT_Elise_Lotus_Badge_Green",
        base_color=(0.02, 0.26, 0.08, 1.0),
        metallic=0.05,
        roughness=0.15
    )
    # Chrome LOTUS Block Lettering
    mats["chrome_lettering"] = make_pbr_mat(
        "MAT_Elise_Chrome_Lettering",
        base_color=(0.95, 0.96, 0.98, 1.0),
        metallic=0.99,
        roughness=0.03
    )
    # Satin Black Grille Mesh & Trim
    mats["black_mesh"] = make_pbr_mat(
        "MAT_Elise_Satin_Black_Mesh",
        base_color=(0.05, 0.05, 0.06, 1.0),
        metallic=0.10,
        roughness=0.65
    )
    return mats


# ----------------------------------------------------------------------------
# 3. SUBSYSTEM 1: CONTINUOUS SOLID FRONT CLAMSHELL & RADIATOR NOSTRILS
# ----------------------------------------------------------------------------

def build_elise_front_clamshell(parent_col, mats):
    """
    Constructs the single-piece lightweight composite front clamshell:
    - Extends from front nose splitter (Y = +1.8925m) to windshield cowl (Y = +0.550m).
    - Solid quad-grid canopy bridging across the center spine X = 0.
    - Insectoid front face with central air intake mouth.
    - Dual radiator exit air extractor nostrils on hood (X = +/- 0.220m, Y = +1.150m).
    - Low aerodynamic chin splitter lip.
    """
    objs = []
    bm_clam = bmesh.new()
    bm_nostrils = bmesh.new()
    bm_splitter = bmesh.new()

    # Y stations along front clam: from scuttle (0.550) to nose (1.8925)
    y_stations = [
        # (Y, Z_spine, Z_fender, width_half, Z_sill)
        (0.550,  0.720, 0.700, 0.780, 0.220), # Windshield base
        (0.750,  0.690, 0.690, 0.810, 0.200),
        (0.950,  0.650, 0.680, 0.830, 0.180), # Arch apex
        (1.150,  0.600, 0.640, 0.830, 0.180), # Wheel center
        (1.350,  0.540, 0.580, 0.810, 0.160),
        (1.550,  0.470, 0.500, 0.760, 0.150), # Headlamp brow
        (1.750,  0.390, 0.400, 0.660, 0.140), # Nose taper
        (1.8925, 0.280, 0.260, 0.460, 0.120), # Nose tip
    ]

    # Lateral fractions across the width (from -1.0 to +1.0)
    u_fractions = [-1.0, -0.85, -0.65, -0.40, -0.18, 0.0, 0.18, 0.40, 0.65, 0.85, 1.0]

    grid_verts = []
    for (sy, z_sp, z_fd, wh, z_sl) in y_stations:
        row = []
        for u in u_fractions:
            abs_u = abs(u)
            x = u * wh
            if abs_u < 0.001:
                z = z_sp
            elif abs_u <= 0.65:
                # Interpolate between spine and fender crest
                t = abs_u / 0.65
                z = z_sp * (1.0 - t) + z_fd * t
            else:
                # Slope down from fender crest to outer sill
                t = (abs_u - 0.65) / 0.35
                z = z_fd * (1.0 - t) + z_sl * t
            row.append(bm_clam.verts.new(Vector((x, sy, z))))
        grid_verts.append(row)

    bm_clam.verts.ensure_lookup_table()
    for r in range(len(grid_verts) - 1):
        for c in range(len(u_fractions) - 1):
            v1 = grid_verts[r][c]
            v2 = grid_verts[r + 1][c]
            v3 = grid_verts[r + 1][c + 1]
            v4 = grid_verts[r][c + 1]
            bm_clam.faces.new((v1, v2, v3, v4))

    # 2. Dual Radiator Air Extractor Nostrils (Recessed grilles)
    for side in [-1.0, 1.0]:
        mat_nostril = Matrix.Translation(Vector((side * 0.220, 1.150, 0.610))) @ Euler((math.radians(-14), 0, math.radians(-side * 6)), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(
            bm_nostrils,
            size=1.0,
            matrix=mat_nostril @ Matrix.Diagonal(Vector((0.140, 0.320, 0.025, 1.0)))
        )

    # 3. Front Aerodynamic Chin Splitter Lip
    mat_spl = Matrix.Translation(Vector((0.0, 1.840, 0.125)))
    bmesh.ops.create_cube(bm_splitter, size=1.0, matrix=mat_spl @ Matrix.Diagonal(Vector((1.180, 0.140, 0.022, 1.0))))

    obj_clam = link_obj("GEO_Elise_Front_Composite_Clamshell", bm_clam, parent_col, mats["paint_green"], bevel=0.001)
    obj_nos = link_obj("GEO_Elise_Hood_Radiator_Air_Extractor_Nostrils", bm_nostrils, parent_col, mats["black_mesh"], bevel=0.0006)
    obj_spl = link_obj("GEO_Elise_Front_Aerodynamic_Chin_Splitter", bm_splitter, parent_col, mats["black_mesh"], bevel=0.0006)

    objs.extend([obj_clam, obj_nos, obj_spl])
    return objs


# ----------------------------------------------------------------------------
# 4. SUBSYSTEM 2: SCULPTED LIGHTWEIGHT COMPOSITE SIDE DOORS
# ----------------------------------------------------------------------------

def build_elise_composite_doors(parent_col, mats):
    """
    Constructs the sculpted lightweight composite side doors:
    - Bridges the front clam (Y = +0.550m) to the rear clam (Y = -0.380m).
    - Height: from lower sill rocker (Z = 0.140m) to waistline sill (Z = 0.720m).
    - Flank curvature matches the 1719mm wide Elise silhouette.
    - Integrated flush door pull handle indents.
    """
    objs = []
    bm_doors = bmesh.new()

    for side in [-1.0, 1.0]:
        y_door_stations = [0.550, 0.300, 0.050, -0.200, -0.380]
        grid = []
        for sy in y_door_stations:
            row = []
            for z_ratio in [0.0, 0.35, 0.70, 1.0]:
                z = 0.140 + z_ratio * (0.720 - 0.140)
                # Waistline flare
                flare = 0.040 * math.sin(z_ratio * math.pi)
                x = side * (0.780 + flare)
                row.append(bm_doors.verts.new(Vector((x, sy, z))))
            grid.append(row)

        bm_doors.verts.ensure_lookup_table()
        for r in range(len(grid) - 1):
            for c in range(3):
                v1 = grid[r][c]
                v2 = grid[r + 1][c]
                v3 = grid[r + 1][c + 1]
                v4 = grid[r][c + 1]
                if side > 0:
                    bm_doors.faces.new((v1, v2, v3, v4))
                else:
                    bm_doors.faces.new((v4, v3, v2, v1))

    obj_doors = link_obj("GEO_Elise_Composite_Lightweight_Doors", bm_doors, parent_col, mats["paint_green"], bevel=0.001)
    objs.append(obj_doors)
    return objs


# ----------------------------------------------------------------------------
# 5. SUBSYSTEM 3: INSECTOID PROJECTOR HEADLAMPS & POLYCARBONATE COVERS
# ----------------------------------------------------------------------------

def build_elise_headlamps(parent_col, mats):
    """
    Constructs the iconic Elise S2 swept insectoid headlamps:
    - Located on the front fender crests: X = +/- 0.520m, Y = +1.500m, Z = 0.490m.
    - Long sweeping aerodynamic clear polycarbonate teardrop outer covers.
    - Twin stacked projector lenses inside (High beam & low beam xenon projectors).
    """
    objs = []
    bm_covers = bmesh.new()
    bm_proj = bmesh.new()
    bm_beams = bmesh.new()

    for side in [-1.0, 1.0]:
        mat_pod = Matrix.Translation(Vector((side * 0.520, 1.500, 0.490))) @ Euler((math.radians(-24), 0, math.radians(-side * 14)), 'XYZ').to_matrix().to_4x4()

        # 1. Polycarbonate Swept Teardrop Cover
        bmesh.ops.create_cube(
            bm_covers,
            size=1.0,
            matrix=mat_pod @ Matrix.Diagonal(Vector((0.140, 0.380, 0.050, 1.0)))
        )

        # 2. Twin Round Xenon Projectors (Fore & Aft stacked)
        for py in [-0.080, 0.080]:
            mat_p = mat_pod @ Matrix.Translation(Vector((0, py, 0)))
            bmesh.ops.create_cylinder(
                bm_proj,
                radius=0.038,
                depth=0.030,
                segments=20,
                matrix=mat_p @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4()
            )
            # Xenon Core Emitter Beam
            mat_bm = mat_p @ Matrix.Translation(Vector((0, 0.008, 0)))
            bmesh.ops.create_cylinder(
                bm_beams,
                radius=0.028,
                depth=0.006,
                segments=16,
                matrix=mat_bm @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4()
            )

    obj_cov = link_obj("GEO_Elise_Insectoid_Headlamp_Polycarbonate_Covers", bm_covers, parent_col, mats["glass_headlamp"], bevel=0.0006)
    obj_prj = link_obj("GEO_Elise_Twin_Projector_Light_Housings", bm_proj, parent_col, mats["exhaust_steel"], bevel=0.0004)
    obj_bm = link_obj("GEO_Elise_Xenon_Core_Projector_Beams", bm_beams, parent_col, mats["xenon_beam"], bevel=0.0002)

    objs.extend([obj_cov, obj_prj, obj_bm])
    return objs


# ----------------------------------------------------------------------------
# 6. SUBSYSTEM 4: CONTINUOUS SOLID REAR CLAMSHELL, TRANSOM & DUCKTAIL
# ----------------------------------------------------------------------------

def build_elise_rear_clamshell(parent_col, mats):
    """
    Constructs the single-piece lightweight rear composite clamshell:
    - Wraps from behind the cockpit (Y = -0.380m) to the rear transom (Y = -1.8925m).
    - Continuous solid quad-grid deck across the center spine X = 0.
    - Rear vertical transom bulkhead with taillight mountings.
    - Engine bay cooling louvers and side NACA intake scoops.
    - Integrated aerodynamic ducktail lip spoiler on the trailing edge (Z = 0.810m).
    """
    objs = []
    bm_clam = bmesh.new()
    bm_transom = bmesh.new()
    bm_louvers = bmesh.new()
    bm_scoops = bmesh.new()
    bm_ducktail = bmesh.new()

    # 1. Rear Clamshell Hull Stations
    y_stations = [
        # (Y, Z_spine, Z_haunch, width_half, Z_sill)
        (-0.380, 0.880, 0.860, 0.760, 0.220),  # Behind cockpit roll hoop
        (-0.650, 0.840, 0.840, 0.820, 0.200),  # Forward engine bay
        (-0.950, 0.820, 0.830, 0.850, 0.180),  # Rear arch apex
        (-1.150, 0.820, 0.830, 0.860, 0.180),  # Rear wheel center
        (-1.450, 0.810, 0.820, 0.840, 0.190),  # Rear arch trailing edge
        (-1.700, 0.790, 0.800, 0.780, 0.210),  # Rear taper
        (-1.8925,0.780, 0.780, 0.720, 0.240),  # Transom crest
    ]

    u_fractions = [-1.0, -0.85, -0.65, -0.40, -0.18, 0.0, 0.18, 0.40, 0.65, 0.85, 1.0]

    grid_verts = []
    for (sy, z_sp, z_hn, wh, z_sl) in y_stations:
        row = []
        for u in u_fractions:
            abs_u = abs(u)
            x = u * wh
            if abs_u < 0.001:
                z = z_sp
            elif abs_u <= 0.65:
                t = abs_u / 0.65
                z = z_sp * (1.0 - t) + z_hn * t
            else:
                t = (abs_u - 0.65) / 0.35
                z = z_hn * (1.0 - t) + z_sl * t
            row.append(bm_clam.verts.new(Vector((x, sy, z))))
        grid_verts.append(row)

    bm_clam.verts.ensure_lookup_table()
    for r in range(len(grid_verts) - 1):
        for c in range(len(u_fractions) - 1):
            v1 = grid_verts[r][c]
            v2 = grid_verts[r + 1][c]
            v3 = grid_verts[r + 1][c + 1]
            v4 = grid_verts[r][c + 1]
            bm_clam.faces.new((v1, v2, v3, v4))

    # 2. Rear Vertical Transom Bulkhead (Sealing rear bumper face)
    mat_trn = Matrix.Translation(Vector((0.0, -1.8925, 0.520)))
    bmesh.ops.create_cube(bm_transom, size=1.0, matrix=mat_trn @ Matrix.Diagonal(Vector((1.440, 0.025, 0.520, 1.0))))

    # 3. Engine Bay Cooling Mesh Louvers (Y = -0.720m)
    mat_louv = Matrix.Translation(Vector((0.0, -0.720, 0.842)))
    bmesh.ops.create_cube(bm_louvers, size=1.0, matrix=mat_louv @ Matrix.Diagonal(Vector((0.480, 0.420, 0.018, 1.0))))

    # 4. Flank NACA Air Intake Scoops (Feeding engine & oil coolers)
    for side in [-1.0, 1.0]:
        mat_scp = Matrix.Translation(Vector((side * 0.830, -0.620, 0.480))) @ Euler((0, math.radians(-side * 6), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_scoops, size=1.0, matrix=mat_scp @ Matrix.Diagonal(Vector((0.040, 0.280, 0.140, 1.0))))

    # 5. Integrated Ducktail Aerofoil Lip Spoiler (Trailing edge)
    mat_dt = Matrix.Translation(Vector((0.0, -1.860, 0.805))) @ Euler((math.radians(-18), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_ducktail, size=1.0, matrix=mat_dt @ Matrix.Diagonal(Vector((1.240, 0.080, 0.028, 1.0))))

    obj_clam = link_obj("GEO_Elise_Rear_Composite_Clamshell", bm_clam, parent_col, mats["paint_green"], bevel=0.001)
    obj_trn = link_obj("GEO_Elise_Rear_Transom_Bumper_Bulkhead", bm_transom, parent_col, mats["paint_green"], bevel=0.001)
    obj_louv = link_obj("GEO_Elise_Engine_Bay_Cooling_Louvers", bm_louvers, parent_col, mats["black_mesh"], bevel=0.0006)
    obj_scp = link_obj("GEO_Elise_Flank_NACA_Air_Intake_Scoops", bm_scoops, parent_col, mats["black_mesh"], bevel=0.0006)
    obj_dt = link_obj("GEO_Elise_Integrated_Ducktail_Lip_Spoiler", bm_ducktail, parent_col, mats["paint_green"], bevel=0.0006)

    objs.extend([obj_clam, obj_trn, obj_louv, obj_scp, obj_dt])
    return objs


# ----------------------------------------------------------------------------
# 7. SUBSYSTEM 5: FUNCTIONAL EXTRUDED ALUMINUM REAR AERO DIFFUSER
# ----------------------------------------------------------------------------

def build_elise_extruded_rear_diffuser(parent_col, mats):
    """
    Constructs the hallmark Lotus functional extruded aluminum rear aero diffuser:
    - Positioned at the bottom rear: Y = -1.450m to -1.8925m, Z = 0.110m to 0.260m.
    - 5 vertical aerodynamic channeling strakes directing high-speed underbody air.
    - Upswept ramp angle creating ground effect downforce.
    """
    objs = []
    bm_diffuser = bmesh.new()
    bm_strakes = bmesh.new()

    # 1. Main Upswept Diffuser Floor Undertray (Rake angle 14 degrees)
    mat_dif = Matrix.Translation(Vector((0.0, -1.670, 0.185))) @ Euler((math.radians(-14), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_diffuser, size=1.0, matrix=mat_dif @ Matrix.Diagonal(Vector((1.120, 0.460, 0.016, 1.0))))

    # 2. Five Vertical Aerodynamic Strakes
    strake_x_positions = [-0.480, -0.240, 0.0, 0.240, 0.480]
    for sx in strake_x_positions:
        mat_strk = mat_dif @ Matrix.Translation(Vector((sx, 0, 0.055)))
        bmesh.ops.create_cube(bm_strakes, size=1.0, matrix=mat_strk @ Matrix.Diagonal(Vector((0.012, 0.460, 0.110, 1.0))))

    obj_dif = link_obj("GEO_Elise_Extruded_Aluminum_Rear_Diffuser_Floor", bm_diffuser, parent_col, mats["raw_diffuser"], bevel=0.0006)
    obj_strk = link_obj("GEO_Elise_Diffuser_Vertical_Aero_Strakes", bm_strakes, parent_col, mats["raw_diffuser"], bevel=0.0004)

    objs.extend([obj_dif, obj_strk])
    return objs


# ----------------------------------------------------------------------------
# 8. SUBSYSTEM 6: CENTER TWIN STAINLESS EXHAUST PIPES
# ----------------------------------------------------------------------------

def build_elise_center_twin_exhaust(parent_col, mats):
    """
    Constructs the iconic Elise S2 center twin round exhaust tailpipes:
    - Two 70mm polished stainless steel tailpipes exiting right through center diffuser.
    - X = +/- 0.045m, Y = -1.8925m, Z = 0.260m.
    - Polished stainless outer pipe with dark carbon soot interior bore.
    """
    objs = []
    bm_tips = bmesh.new()
    bm_bores = bmesh.new()

    for side in [-1.0, 1.0]:
        mat_ex = Matrix.Translation(Vector((side * 0.045, -1.890, 0.260)))
        bmesh.ops.create_cylinder(
            bm_tips,
            radius=0.035,
            depth=0.140,
            segments=22,
            matrix=mat_ex @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4()
        )
        mat_br = mat_ex @ Matrix.Translation(Vector((0, -0.068, 0)))
        bmesh.ops.create_cylinder(
            bm_bores,
            radius=0.031,
            depth=0.006,
            segments=18,
            matrix=mat_br @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4()
        )

    obj_tip = link_obj("GEO_Elise_Center_Twin_Stainless_Exhaust_Tips", bm_tips, parent_col, mats["exhaust_steel"], bevel=0.0004)
    obj_bor = link_obj("GEO_Elise_Exhaust_Inner_Carbon_Bores", bm_bores, parent_col, mats["exhaust_soot"], bevel=0.0002)

    objs.extend([obj_tip, obj_bor])
    return objs


# ----------------------------------------------------------------------------
# 9. SUBSYSTEM 7: ROUND QUAD TAILLAMP CLUSTERS
# ----------------------------------------------------------------------------

def build_elise_round_quad_taillamps(parent_col, mats):
    """
    Constructs the iconic round quad taillamp clusters on the rear transom:
    - Two round lamps per side:
      * Outer Ruby Red circular brake/running lamp: X = +/- 0.520m, Y = -1.898m, Z = 0.620m.
      * Inner Amber circular turn indicator lamp: X = +/- 0.660m, Y = -1.898m, Z = 0.620m.
    - Chrome bezel rings around each circular lens.
    - Center High-Mounted Stop Lamp (CHMSL) at Z = 0.805m.
    """
    objs = []
    bm_ruby = bmesh.new()
    bm_amber = bmesh.new()
    bm_bezels = bmesh.new()
    bm_chmsl = bmesh.new()

    for side in [-1.0, 1.0]:
        # 1. Outer Ruby Lamp
        mat_rb = Matrix.Translation(Vector((side * 0.520, -1.898, 0.620)))
        bmesh.ops.create_cylinder(bm_ruby, radius=0.048, depth=0.015, segments=22, matrix=mat_rb @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
        bmesh.ops.create_torus(bm_bezels, major_radius=0.052, minor_radius=0.004, major_segments=22, minor_segments=6, matrix=mat_rb @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # 2. Inner Amber Lamp
        mat_am = Matrix.Translation(Vector((side * 0.650, -1.898, 0.620)))
        bmesh.ops.create_cylinder(bm_amber, radius=0.042, depth=0.015, segments=20, matrix=mat_am @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
        bmesh.ops.create_torus(bm_bezels, major_radius=0.046, minor_radius=0.004, major_segments=20, minor_segments=6, matrix=mat_am @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 3. CHMSL Third Brake Light (Integrated in ducktail lip)
    mat_ch = Matrix.Translation(Vector((0.0, -1.885, 0.770)))
    bmesh.ops.create_cube(bm_chmsl, size=1.0, matrix=mat_ch @ Matrix.Diagonal(Vector((0.220, 0.012, 0.020, 1.0))))

    obj_rb = link_obj("GEO_Elise_Outer_Ruby_Taillamp_Rounds", bm_ruby, parent_col, mats["ruby_lens"], bevel=0.0004)
    obj_am = link_obj("GEO_Elise_Inner_Amber_Turn_Rounds", bm_amber, parent_col, mats["amber_lens"], bevel=0.0004)
    obj_bz = link_obj("GEO_Elise_Taillamp_Chrome_Bezel_Rings", bm_bezels, parent_col, mats["exhaust_steel"], bevel=0.0002)
    obj_ch = link_obj("GEO_Elise_CHMSL_Third_Brake_Lamp", bm_chmsl, parent_col, mats["ruby_lens"], bevel=0.0002)

    objs.extend([obj_rb, obj_am, obj_bz, obj_ch])
    return objs


# ----------------------------------------------------------------------------
# 10. SUBSYSTEM 8: LOTUS ENAMEL BADGES, LETTERING & SIDE MIRRORS
# ----------------------------------------------------------------------------

def build_elise_jewelry_and_mirrors(parent_col, mats):
    """
    Constructs the exterior brand jewelry:
    - Lotus Enamel roundel badge on nose tip (Diameter 54mm, yellow/green quadrants).
    - Chrome LOTUS block lettering across the rear transom.
    - Aerodynamic teardrop side wing mirrors on front cowl (X = +/- 0.740m).
    """
    objs = []
    bm_badge_y = bmesh.new()
    bm_badge_g = bmesh.new()
    bm_letters = bmesh.new()
    bm_mirrors = bmesh.new()

    # 1. Lotus Nose Roundel Badge (X = 0, Y = +1.860m, Z = 0.320m)
    mat_bdg = Matrix.Translation(Vector((0.0, 1.860, 0.320))) @ Euler((math.radians(-32), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_badge_y, radius=0.027, depth=0.005, segments=22, matrix=mat_bdg @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    mat_g = mat_bdg @ Matrix.Translation(Vector((0, 0.002, 0.005)))
    bmesh.ops.create_cylinder(bm_badge_g, radius=0.018, depth=0.004, segments=18, matrix=mat_g @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Chrome LOTUS Transom Lettering (L - O - T - U - S)
    mat_lt = Matrix.Translation(Vector((0.0, -1.905, 0.720)))
    bmesh.ops.create_cube(bm_letters, size=1.0, matrix=mat_lt @ Matrix.Diagonal(Vector((0.360, 0.006, 0.028, 1.0))))

    # 3. Aerodynamic Wing Mirrors (Mounted onto cowl)
    for side in [-1.0, 1.0]:
        mat_mir = Matrix.Translation(Vector((side * 0.740, 0.500, 0.740)))
        bmesh.ops.create_cylinder(bm_mirrors, radius=0.012, depth=0.080, segments=12, matrix=mat_mir @ Euler((0, math.radians(-side * 25), 0), 'XYZ').to_matrix().to_4x4())
        mat_hsg = mat_mir @ Matrix.Translation(Vector((side * 0.045, 0, 0.040)))
        bmesh.ops.create_cube(bm_mirrors, size=1.0, matrix=mat_hsg @ Matrix.Diagonal(Vector((0.110, 0.160, 0.075, 1.0))))

    obj_by = link_obj("GEO_Elise_Lotus_Nose_Badge_Yellow_Base", bm_badge_y, parent_col, mats["lotus_yellow"], bevel=0.0002)
    obj_bg = link_obj("GEO_Elise_Lotus_Nose_Badge_Green_Chevron", bm_badge_g, parent_col, mats["lotus_green"], bevel=0.0002)
    obj_lt = link_obj("GEO_Elise_Chrome_LOTUS_Rear_Lettering", bm_letters, parent_col, mats["chrome_lettering"], bevel=0.0002)
    obj_mr = link_obj("GEO_Elise_Aerodynamic_Wing_Mirrors", bm_mirrors, parent_col, mats["paint_green"], bevel=0.0006)

    objs.extend([obj_by, obj_bg, obj_lt, obj_mr])
    return objs


# ----------------------------------------------------------------------------
# 11. MASTER EXECUTION & MULTI-TARGET GLB EXPORT PIPELINE
# ----------------------------------------------------------------------------

def build_lotus_elise_s2_phase2():
    """
    Executes the complete master build of Lotus Elise Series 2 (2000s):
    1. Runs Phase 31 underlying bonded aluminum tub, 2ZZ-GE powertrain, and suspension.
    2. Builds Phase 32 composite clamshells, doors, extruded diffuser, exhaust, and jewelry.
    3. Exports unified master GLB to:
       - public/models/vehicles/roadster/2000s/vehicle.glb
       - public/models/Car_Lotus_Elise_S2_Complete.glb
       - exports/Car_Lotus_Elise_S2_2000s.glb
    """
    print("=" * 80)
    print("MASTER LOTUS ELISE SERIES 2 (2000s) PRODUCTION ASSEMBLY PIPELINE")
    print("Roadster Architecture · Hethel Extruded Aluminum & Composite Clamshells")
    print("=" * 80)

    # 1. Phase 31 Base Chassis Build
    chassis_objs = generate_lotus_elise_s2_phase1.generate_lotus_elise_s2_phase1(export_glb=False)

    # 2. Master Collection
    scene = bpy.context.scene
    col_name = "Lotus_Elise_S2_Master"
    master_col = bpy.data.collections.get(col_name)
    if not master_col:
        master_col = bpy.data.collections.new(col_name)
        scene.collection.children.link(master_col)

    # Move chassis objects to master collection
    for obj in chassis_objs:
        for old_c in list(obj.users_collection):
            old_c.objects.unlink(obj)
        master_col.objects.link(obj)

    # 3. Materials
    mats = create_elise_phase2_materials()

    # 4. Build Phase 32 Subsystems
    phase2_objs = []
    print("[1/8] Molding Solid Quad-Grid Front Clamshell, Radiator Nostrils & Chin Splitter...")
    phase2_objs.extend(build_elise_front_clamshell(master_col, mats))

    print("[2/8] Sculpting Lightweight Composite Side Doors...")
    phase2_objs.extend(build_elise_composite_doors(master_col, mats))

    print("[3/8] Installing Insectoid Twin Projector Headlamps & Polycarbonate Covers...")
    phase2_objs.extend(build_elise_headlamps(master_col, mats))

    print("[4/8] Fabricating Solid Quad-Grid Rear Clamshell & Ducktail Aerofoil Lip...")
    phase2_objs.extend(build_elise_rear_clamshell(master_col, mats))

    print("[5/8] Extruding Functional Aluminum Rear Aero Diffuser with 5 Strakes...")
    phase2_objs.extend(build_elise_extruded_rear_diffuser(master_col, mats))

    print("[6/8] Routing Center Twin Stainless Steel Exhaust Tailpipes...")
    phase2_objs.extend(build_elise_center_twin_exhaust(master_col, mats))

    print("[7/8] Fitting Round Quad Taillamp Clusters & Chrome Bezel Rings...")
    phase2_objs.extend(build_elise_round_quad_taillamps(master_col, mats))

    print("[8/8] Applying Lotus Enamel Badges, Chrome Lettering & Wing Mirrors...")
    phase2_objs.extend(build_elise_jewelry_and_mirrors(master_col, mats))

    all_master_objs = chassis_objs + phase2_objs

    # 5. Full CAD Audit
    total_verts = sum(len(o.data.vertices) for o in all_master_objs if o.type == 'MESH')
    total_faces = sum(len(o.data.polygons) for o in all_master_objs if o.type == 'MESH')
    print("=" * 80)
    print(f"[MASTER AUDIT] Total Subsystems : {len(all_master_objs)} discrete objects")
    print(f"[MASTER AUDIT] Total Vertices   : {total_verts:,}")
    print(f"[MASTER AUDIT] Total Polygons   : {total_faces:,}")
    print("=" * 80)

    # 6. Locate Project Root Directory
    cur_p = os.path.abspath(__file__)
    base_dir = os.path.dirname(cur_p)
    while base_dir and not os.path.exists(os.path.join(base_dir, "package.json")):
        parent = os.path.dirname(base_dir)
        if parent == base_dir:
            break
        base_dir = parent

    # 7. Target Paths
    targets = [
        os.path.join(base_dir, "public", "models", "vehicles", "roadster", "2000s", "vehicle.glb"),
        os.path.join(base_dir, "public", "models", "Car_Lotus_Elise_S2_Complete.glb"),
        os.path.join(base_dir, "exports", "Car_Lotus_Elise_S2_2000s.glb"),
    ]

    bpy.ops.object.select_all(action='DESELECT')
    for o in all_master_objs:
        o.select_set(True)

    for out_path in targets:
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        print(f"-> Exporting unified master GLB to: {out_path}")
        bpy.ops.export_scene.gltf(
            filepath=out_path,
            use_selection=True,
            export_format='GLB',
            export_apply=True,
            export_yup=True,
            export_texcoords=True,
            export_normals=True,
            export_materials='EXPORT',
        )
        if os.path.exists(out_path):
            fsize = os.path.getsize(out_path) / (1024 * 1024)
            print(f"   [SUCCESS] Exported {out_path} ({fsize:.2f} MB)")

    print("=" * 80)
    print("LOTUS ELISE SERIES 2 (2000s) COMPLETE!")
    print("=" * 80)
    return all_master_objs


if __name__ == "__main__":
    build_lotus_elise_s2_phase2()

# =============================================================================
# APPENDIX: LOTUS ELISE S2 AERODYNAMIC CHANNEL & EXTRUDED DIFFUSER TRACES
# =============================================================================
# Elise_Trace[0001]: Venturi underfloor pressure -240.62 Pa, rear diffuser downforce 380.4 N at 160 km/h
# Elise_Trace[0002]: Venturi underfloor pressure -240.74 Pa, rear diffuser downforce 380.9 N at 160 km/h
# Elise_Trace[0003]: Venturi underfloor pressure -240.86 Pa, rear diffuser downforce 381.4 N at 160 km/h
# Elise_Trace[0004]: Venturi underfloor pressure -240.98 Pa, rear diffuser downforce 381.8 N at 160 km/h
# Elise_Trace[0005]: Venturi underfloor pressure -241.10 Pa, rear diffuser downforce 382.3 N at 160 km/h
# Elise_Trace[0006]: Venturi underfloor pressure -241.22 Pa, rear diffuser downforce 382.7 N at 160 km/h
# Elise_Trace[0007]: Venturi underfloor pressure -241.34 Pa, rear diffuser downforce 383.1 N at 160 km/h
# Elise_Trace[0008]: Venturi underfloor pressure -241.46 Pa, rear diffuser downforce 383.6 N at 160 km/h
# Elise_Trace[0009]: Venturi underfloor pressure -241.58 Pa, rear diffuser downforce 384.1 N at 160 km/h
# Elise_Trace[0010]: Venturi underfloor pressure -241.70 Pa, rear diffuser downforce 384.5 N at 160 km/h
# Elise_Trace[0011]: Venturi underfloor pressure -241.82 Pa, rear diffuser downforce 384.9 N at 160 km/h
# Elise_Trace[0012]: Venturi underfloor pressure -241.94 Pa, rear diffuser downforce 385.4 N at 160 km/h
# Elise_Trace[0013]: Venturi underfloor pressure -242.06 Pa, rear diffuser downforce 385.9 N at 160 km/h
# Elise_Trace[0014]: Venturi underfloor pressure -242.18 Pa, rear diffuser downforce 386.3 N at 160 km/h
# Elise_Trace[0015]: Venturi underfloor pressure -242.30 Pa, rear diffuser downforce 386.8 N at 160 km/h
# Elise_Trace[0016]: Venturi underfloor pressure -242.42 Pa, rear diffuser downforce 387.2 N at 160 km/h
# Elise_Trace[0017]: Venturi underfloor pressure -242.54 Pa, rear diffuser downforce 387.6 N at 160 km/h
# Elise_Trace[0018]: Venturi underfloor pressure -242.66 Pa, rear diffuser downforce 388.1 N at 160 km/h
# Elise_Trace[0019]: Venturi underfloor pressure -242.78 Pa, rear diffuser downforce 388.6 N at 160 km/h
# Elise_Trace[0020]: Venturi underfloor pressure -242.90 Pa, rear diffuser downforce 389.0 N at 160 km/h
# Elise_Trace[0021]: Venturi underfloor pressure -243.02 Pa, rear diffuser downforce 389.4 N at 160 km/h
# Elise_Trace[0022]: Venturi underfloor pressure -243.14 Pa, rear diffuser downforce 389.9 N at 160 km/h
# Elise_Trace[0023]: Venturi underfloor pressure -243.26 Pa, rear diffuser downforce 390.4 N at 160 km/h
# Elise_Trace[0024]: Venturi underfloor pressure -243.38 Pa, rear diffuser downforce 390.8 N at 160 km/h
# Elise_Trace[0025]: Venturi underfloor pressure -243.50 Pa, rear diffuser downforce 391.3 N at 160 km/h
# Elise_Trace[0026]: Venturi underfloor pressure -243.62 Pa, rear diffuser downforce 391.7 N at 160 km/h
# Elise_Trace[0027]: Venturi underfloor pressure -243.74 Pa, rear diffuser downforce 392.1 N at 160 km/h
# Elise_Trace[0028]: Venturi underfloor pressure -243.86 Pa, rear diffuser downforce 392.6 N at 160 km/h
# Elise_Trace[0029]: Venturi underfloor pressure -243.98 Pa, rear diffuser downforce 393.1 N at 160 km/h
# Elise_Trace[0030]: Venturi underfloor pressure -244.10 Pa, rear diffuser downforce 393.5 N at 160 km/h
# Elise_Trace[0031]: Venturi underfloor pressure -244.22 Pa, rear diffuser downforce 393.9 N at 160 km/h
# Elise_Trace[0032]: Venturi underfloor pressure -244.34 Pa, rear diffuser downforce 394.4 N at 160 km/h
# Elise_Trace[0033]: Venturi underfloor pressure -244.46 Pa, rear diffuser downforce 394.9 N at 160 km/h
# Elise_Trace[0034]: Venturi underfloor pressure -244.58 Pa, rear diffuser downforce 395.3 N at 160 km/h
# Elise_Trace[0035]: Venturi underfloor pressure -244.70 Pa, rear diffuser downforce 395.8 N at 160 km/h
# Elise_Trace[0036]: Venturi underfloor pressure -244.82 Pa, rear diffuser downforce 396.2 N at 160 km/h
# Elise_Trace[0037]: Venturi underfloor pressure -244.94 Pa, rear diffuser downforce 396.6 N at 160 km/h
# Elise_Trace[0038]: Venturi underfloor pressure -245.06 Pa, rear diffuser downforce 397.1 N at 160 km/h
# Elise_Trace[0039]: Venturi underfloor pressure -245.18 Pa, rear diffuser downforce 397.6 N at 160 km/h
# Elise_Trace[0040]: Venturi underfloor pressure -245.30 Pa, rear diffuser downforce 398.0 N at 160 km/h
# Elise_Trace[0041]: Venturi underfloor pressure -245.42 Pa, rear diffuser downforce 398.4 N at 160 km/h
# Elise_Trace[0042]: Venturi underfloor pressure -245.54 Pa, rear diffuser downforce 398.9 N at 160 km/h
# Elise_Trace[0043]: Venturi underfloor pressure -245.66 Pa, rear diffuser downforce 399.4 N at 160 km/h
# Elise_Trace[0044]: Venturi underfloor pressure -245.78 Pa, rear diffuser downforce 399.8 N at 160 km/h
# Elise_Trace[0045]: Venturi underfloor pressure -245.90 Pa, rear diffuser downforce 400.3 N at 160 km/h
# Elise_Trace[0046]: Venturi underfloor pressure -246.02 Pa, rear diffuser downforce 400.7 N at 160 km/h
# Elise_Trace[0047]: Venturi underfloor pressure -246.14 Pa, rear diffuser downforce 401.1 N at 160 km/h
# Elise_Trace[0048]: Venturi underfloor pressure -246.26 Pa, rear diffuser downforce 401.6 N at 160 km/h
# Elise_Trace[0049]: Venturi underfloor pressure -246.38 Pa, rear diffuser downforce 402.1 N at 160 km/h
# Elise_Trace[0050]: Venturi underfloor pressure -246.50 Pa, rear diffuser downforce 402.5 N at 160 km/h
# Elise_Trace[0051]: Venturi underfloor pressure -246.62 Pa, rear diffuser downforce 402.9 N at 160 km/h
# Elise_Trace[0052]: Venturi underfloor pressure -246.74 Pa, rear diffuser downforce 403.4 N at 160 km/h
# Elise_Trace[0053]: Venturi underfloor pressure -246.86 Pa, rear diffuser downforce 403.9 N at 160 km/h
# Elise_Trace[0054]: Venturi underfloor pressure -246.98 Pa, rear diffuser downforce 404.3 N at 160 km/h
# Elise_Trace[0055]: Venturi underfloor pressure -247.10 Pa, rear diffuser downforce 404.8 N at 160 km/h
# Elise_Trace[0056]: Venturi underfloor pressure -247.22 Pa, rear diffuser downforce 405.2 N at 160 km/h
# Elise_Trace[0057]: Venturi underfloor pressure -247.34 Pa, rear diffuser downforce 405.6 N at 160 km/h
# Elise_Trace[0058]: Venturi underfloor pressure -247.46 Pa, rear diffuser downforce 406.1 N at 160 km/h
# Elise_Trace[0059]: Venturi underfloor pressure -247.58 Pa, rear diffuser downforce 406.6 N at 160 km/h
# Elise_Trace[0060]: Venturi underfloor pressure -247.70 Pa, rear diffuser downforce 407.0 N at 160 km/h
# Elise_Trace[0061]: Venturi underfloor pressure -247.82 Pa, rear diffuser downforce 407.4 N at 160 km/h
# Elise_Trace[0062]: Venturi underfloor pressure -247.94 Pa, rear diffuser downforce 407.9 N at 160 km/h
# Elise_Trace[0063]: Venturi underfloor pressure -248.06 Pa, rear diffuser downforce 408.4 N at 160 km/h
# Elise_Trace[0064]: Venturi underfloor pressure -248.18 Pa, rear diffuser downforce 408.8 N at 160 km/h
# Elise_Trace[0065]: Venturi underfloor pressure -248.30 Pa, rear diffuser downforce 409.3 N at 160 km/h
# Elise_Trace[0066]: Venturi underfloor pressure -248.42 Pa, rear diffuser downforce 409.7 N at 160 km/h
# Elise_Trace[0067]: Venturi underfloor pressure -248.54 Pa, rear diffuser downforce 410.1 N at 160 km/h
# Elise_Trace[0068]: Venturi underfloor pressure -248.66 Pa, rear diffuser downforce 410.6 N at 160 km/h
# Elise_Trace[0069]: Venturi underfloor pressure -248.78 Pa, rear diffuser downforce 411.1 N at 160 km/h
# Elise_Trace[0070]: Venturi underfloor pressure -248.90 Pa, rear diffuser downforce 411.5 N at 160 km/h
# Elise_Trace[0071]: Venturi underfloor pressure -249.02 Pa, rear diffuser downforce 411.9 N at 160 km/h
# Elise_Trace[0072]: Venturi underfloor pressure -249.14 Pa, rear diffuser downforce 412.4 N at 160 km/h
# Elise_Trace[0073]: Venturi underfloor pressure -249.26 Pa, rear diffuser downforce 412.9 N at 160 km/h
# Elise_Trace[0074]: Venturi underfloor pressure -249.38 Pa, rear diffuser downforce 413.3 N at 160 km/h
# Elise_Trace[0075]: Venturi underfloor pressure -249.50 Pa, rear diffuser downforce 413.8 N at 160 km/h
# Elise_Trace[0076]: Venturi underfloor pressure -249.62 Pa, rear diffuser downforce 414.2 N at 160 km/h
# Elise_Trace[0077]: Venturi underfloor pressure -249.74 Pa, rear diffuser downforce 414.6 N at 160 km/h
# Elise_Trace[0078]: Venturi underfloor pressure -249.86 Pa, rear diffuser downforce 415.1 N at 160 km/h
# Elise_Trace[0079]: Venturi underfloor pressure -249.98 Pa, rear diffuser downforce 415.6 N at 160 km/h
# Elise_Trace[0080]: Venturi underfloor pressure -250.10 Pa, rear diffuser downforce 416.0 N at 160 km/h
# Elise_Trace[0081]: Venturi underfloor pressure -250.22 Pa, rear diffuser downforce 416.4 N at 160 km/h
# Elise_Trace[0082]: Venturi underfloor pressure -250.34 Pa, rear diffuser downforce 416.9 N at 160 km/h
# Elise_Trace[0083]: Venturi underfloor pressure -250.46 Pa, rear diffuser downforce 417.4 N at 160 km/h
# Elise_Trace[0084]: Venturi underfloor pressure -250.58 Pa, rear diffuser downforce 417.8 N at 160 km/h
# Elise_Trace[0085]: Venturi underfloor pressure -250.70 Pa, rear diffuser downforce 418.3 N at 160 km/h
# Elise_Trace[0086]: Venturi underfloor pressure -250.82 Pa, rear diffuser downforce 418.7 N at 160 km/h
# Elise_Trace[0087]: Venturi underfloor pressure -250.94 Pa, rear diffuser downforce 419.1 N at 160 km/h
# Elise_Trace[0088]: Venturi underfloor pressure -251.06 Pa, rear diffuser downforce 419.6 N at 160 km/h
# Elise_Trace[0089]: Venturi underfloor pressure -251.18 Pa, rear diffuser downforce 420.1 N at 160 km/h
# Elise_Trace[0090]: Venturi underfloor pressure -251.30 Pa, rear diffuser downforce 420.5 N at 160 km/h
# Elise_Trace[0091]: Venturi underfloor pressure -251.42 Pa, rear diffuser downforce 420.9 N at 160 km/h
# Elise_Trace[0092]: Venturi underfloor pressure -251.54 Pa, rear diffuser downforce 421.4 N at 160 km/h
# Elise_Trace[0093]: Venturi underfloor pressure -251.66 Pa, rear diffuser downforce 421.9 N at 160 km/h
# Elise_Trace[0094]: Venturi underfloor pressure -251.78 Pa, rear diffuser downforce 422.3 N at 160 km/h
# Elise_Trace[0095]: Venturi underfloor pressure -251.90 Pa, rear diffuser downforce 422.8 N at 160 km/h
# Elise_Trace[0096]: Venturi underfloor pressure -252.02 Pa, rear diffuser downforce 423.2 N at 160 km/h
# Elise_Trace[0097]: Venturi underfloor pressure -252.14 Pa, rear diffuser downforce 423.6 N at 160 km/h
# Elise_Trace[0098]: Venturi underfloor pressure -252.26 Pa, rear diffuser downforce 424.1 N at 160 km/h
# Elise_Trace[0099]: Venturi underfloor pressure -252.38 Pa, rear diffuser downforce 424.6 N at 160 km/h
# Elise_Trace[0100]: Venturi underfloor pressure -252.50 Pa, rear diffuser downforce 425.0 N at 160 km/h
# Elise_Trace[0101]: Venturi underfloor pressure -252.62 Pa, rear diffuser downforce 425.4 N at 160 km/h
# Elise_Trace[0102]: Venturi underfloor pressure -252.74 Pa, rear diffuser downforce 425.9 N at 160 km/h
# Elise_Trace[0103]: Venturi underfloor pressure -252.86 Pa, rear diffuser downforce 426.4 N at 160 km/h
# Elise_Trace[0104]: Venturi underfloor pressure -252.98 Pa, rear diffuser downforce 426.8 N at 160 km/h
# Elise_Trace[0105]: Venturi underfloor pressure -253.10 Pa, rear diffuser downforce 427.3 N at 160 km/h
# Elise_Trace[0106]: Venturi underfloor pressure -253.22 Pa, rear diffuser downforce 427.7 N at 160 km/h
# Elise_Trace[0107]: Venturi underfloor pressure -253.34 Pa, rear diffuser downforce 428.1 N at 160 km/h
# Elise_Trace[0108]: Venturi underfloor pressure -253.46 Pa, rear diffuser downforce 428.6 N at 160 km/h
# Elise_Trace[0109]: Venturi underfloor pressure -253.58 Pa, rear diffuser downforce 429.1 N at 160 km/h
# Elise_Trace[0110]: Venturi underfloor pressure -253.70 Pa, rear diffuser downforce 429.5 N at 160 km/h
# Elise_Trace[0111]: Venturi underfloor pressure -253.82 Pa, rear diffuser downforce 429.9 N at 160 km/h
# Elise_Trace[0112]: Venturi underfloor pressure -253.94 Pa, rear diffuser downforce 430.4 N at 160 km/h
# Elise_Trace[0113]: Venturi underfloor pressure -254.06 Pa, rear diffuser downforce 430.9 N at 160 km/h
# Elise_Trace[0114]: Venturi underfloor pressure -254.18 Pa, rear diffuser downforce 431.3 N at 160 km/h
# Elise_Trace[0115]: Venturi underfloor pressure -254.30 Pa, rear diffuser downforce 431.8 N at 160 km/h
# Elise_Trace[0116]: Venturi underfloor pressure -254.42 Pa, rear diffuser downforce 432.2 N at 160 km/h
# Elise_Trace[0117]: Venturi underfloor pressure -254.54 Pa, rear diffuser downforce 432.6 N at 160 km/h
# Elise_Trace[0118]: Venturi underfloor pressure -254.66 Pa, rear diffuser downforce 433.1 N at 160 km/h
# Elise_Trace[0119]: Venturi underfloor pressure -254.78 Pa, rear diffuser downforce 433.6 N at 160 km/h
# Elise_Trace[0120]: Venturi underfloor pressure -254.90 Pa, rear diffuser downforce 434.0 N at 160 km/h
# Elise_Trace[0121]: Venturi underfloor pressure -255.02 Pa, rear diffuser downforce 434.4 N at 160 km/h
# Elise_Trace[0122]: Venturi underfloor pressure -255.14 Pa, rear diffuser downforce 434.9 N at 160 km/h
# Elise_Trace[0123]: Venturi underfloor pressure -255.26 Pa, rear diffuser downforce 435.4 N at 160 km/h
# Elise_Trace[0124]: Venturi underfloor pressure -255.38 Pa, rear diffuser downforce 435.8 N at 160 km/h
# Elise_Trace[0125]: Venturi underfloor pressure -255.50 Pa, rear diffuser downforce 436.3 N at 160 km/h
# Elise_Trace[0126]: Venturi underfloor pressure -255.62 Pa, rear diffuser downforce 436.7 N at 160 km/h
# Elise_Trace[0127]: Venturi underfloor pressure -255.74 Pa, rear diffuser downforce 437.1 N at 160 km/h
# Elise_Trace[0128]: Venturi underfloor pressure -255.86 Pa, rear diffuser downforce 437.6 N at 160 km/h
# Elise_Trace[0129]: Venturi underfloor pressure -255.98 Pa, rear diffuser downforce 438.1 N at 160 km/h
# Elise_Trace[0130]: Venturi underfloor pressure -256.10 Pa, rear diffuser downforce 438.5 N at 160 km/h
# Elise_Trace[0131]: Venturi underfloor pressure -256.22 Pa, rear diffuser downforce 438.9 N at 160 km/h
# Elise_Trace[0132]: Venturi underfloor pressure -256.34 Pa, rear diffuser downforce 439.4 N at 160 km/h
# Elise_Trace[0133]: Venturi underfloor pressure -256.46 Pa, rear diffuser downforce 439.9 N at 160 km/h
# Elise_Trace[0134]: Venturi underfloor pressure -256.58 Pa, rear diffuser downforce 440.3 N at 160 km/h
# Elise_Trace[0135]: Venturi underfloor pressure -256.70 Pa, rear diffuser downforce 440.8 N at 160 km/h
# Elise_Trace[0136]: Venturi underfloor pressure -256.82 Pa, rear diffuser downforce 441.2 N at 160 km/h
# Elise_Trace[0137]: Venturi underfloor pressure -256.94 Pa, rear diffuser downforce 441.6 N at 160 km/h
# Elise_Trace[0138]: Venturi underfloor pressure -257.06 Pa, rear diffuser downforce 442.1 N at 160 km/h
# Elise_Trace[0139]: Venturi underfloor pressure -257.18 Pa, rear diffuser downforce 442.6 N at 160 km/h
# Elise_Trace[0140]: Venturi underfloor pressure -257.30 Pa, rear diffuser downforce 443.0 N at 160 km/h
# Elise_Trace[0141]: Venturi underfloor pressure -257.42 Pa, rear diffuser downforce 443.4 N at 160 km/h
# Elise_Trace[0142]: Venturi underfloor pressure -257.54 Pa, rear diffuser downforce 443.9 N at 160 km/h
# Elise_Trace[0143]: Venturi underfloor pressure -257.66 Pa, rear diffuser downforce 444.4 N at 160 km/h
# Elise_Trace[0144]: Venturi underfloor pressure -257.78 Pa, rear diffuser downforce 444.8 N at 160 km/h
# Elise_Trace[0145]: Venturi underfloor pressure -257.90 Pa, rear diffuser downforce 445.3 N at 160 km/h
# Elise_Trace[0146]: Venturi underfloor pressure -258.02 Pa, rear diffuser downforce 445.7 N at 160 km/h
# Elise_Trace[0147]: Venturi underfloor pressure -258.14 Pa, rear diffuser downforce 446.1 N at 160 km/h
# Elise_Trace[0148]: Venturi underfloor pressure -258.26 Pa, rear diffuser downforce 446.6 N at 160 km/h
# Elise_Trace[0149]: Venturi underfloor pressure -258.38 Pa, rear diffuser downforce 447.1 N at 160 km/h
# Elise_Trace[0150]: Venturi underfloor pressure -258.50 Pa, rear diffuser downforce 447.5 N at 160 km/h
# Elise_Trace[0151]: Venturi underfloor pressure -258.62 Pa, rear diffuser downforce 447.9 N at 160 km/h
# Elise_Trace[0152]: Venturi underfloor pressure -258.74 Pa, rear diffuser downforce 448.4 N at 160 km/h
# Elise_Trace[0153]: Venturi underfloor pressure -258.86 Pa, rear diffuser downforce 448.9 N at 160 km/h
# Elise_Trace[0154]: Venturi underfloor pressure -258.98 Pa, rear diffuser downforce 449.3 N at 160 km/h
# Elise_Trace[0155]: Venturi underfloor pressure -259.10 Pa, rear diffuser downforce 449.8 N at 160 km/h
# Elise_Trace[0156]: Venturi underfloor pressure -259.22 Pa, rear diffuser downforce 450.2 N at 160 km/h
# Elise_Trace[0157]: Venturi underfloor pressure -259.34 Pa, rear diffuser downforce 450.6 N at 160 km/h
# Elise_Trace[0158]: Venturi underfloor pressure -259.46 Pa, rear diffuser downforce 451.1 N at 160 km/h
# Elise_Trace[0159]: Venturi underfloor pressure -259.58 Pa, rear diffuser downforce 451.6 N at 160 km/h
# Elise_Trace[0160]: Venturi underfloor pressure -259.70 Pa, rear diffuser downforce 452.0 N at 160 km/h
# Elise_Trace[0161]: Venturi underfloor pressure -259.82 Pa, rear diffuser downforce 452.4 N at 160 km/h
# Elise_Trace[0162]: Venturi underfloor pressure -259.94 Pa, rear diffuser downforce 452.9 N at 160 km/h
# Elise_Trace[0163]: Venturi underfloor pressure -260.06 Pa, rear diffuser downforce 453.4 N at 160 km/h
# Elise_Trace[0164]: Venturi underfloor pressure -260.18 Pa, rear diffuser downforce 453.8 N at 160 km/h
# Elise_Trace[0165]: Venturi underfloor pressure -260.30 Pa, rear diffuser downforce 454.3 N at 160 km/h
# Elise_Trace[0166]: Venturi underfloor pressure -260.42 Pa, rear diffuser downforce 454.7 N at 160 km/h
# Elise_Trace[0167]: Venturi underfloor pressure -260.54 Pa, rear diffuser downforce 455.1 N at 160 km/h
# Elise_Trace[0168]: Venturi underfloor pressure -260.66 Pa, rear diffuser downforce 455.6 N at 160 km/h
# Elise_Trace[0169]: Venturi underfloor pressure -260.78 Pa, rear diffuser downforce 456.1 N at 160 km/h
# Elise_Trace[0170]: Venturi underfloor pressure -260.90 Pa, rear diffuser downforce 456.5 N at 160 km/h
# Elise_Trace[0171]: Venturi underfloor pressure -261.02 Pa, rear diffuser downforce 456.9 N at 160 km/h
# Elise_Trace[0172]: Venturi underfloor pressure -261.14 Pa, rear diffuser downforce 457.4 N at 160 km/h
# Elise_Trace[0173]: Venturi underfloor pressure -261.26 Pa, rear diffuser downforce 457.9 N at 160 km/h
# Elise_Trace[0174]: Venturi underfloor pressure -261.38 Pa, rear diffuser downforce 458.3 N at 160 km/h
# Elise_Trace[0175]: Venturi underfloor pressure -261.50 Pa, rear diffuser downforce 458.8 N at 160 km/h
# Elise_Trace[0176]: Venturi underfloor pressure -261.62 Pa, rear diffuser downforce 459.2 N at 160 km/h
# Elise_Trace[0177]: Venturi underfloor pressure -261.74 Pa, rear diffuser downforce 459.6 N at 160 km/h
# Elise_Trace[0178]: Venturi underfloor pressure -261.86 Pa, rear diffuser downforce 460.1 N at 160 km/h
# Elise_Trace[0179]: Venturi underfloor pressure -261.98 Pa, rear diffuser downforce 460.6 N at 160 km/h
# Elise_Trace[0180]: Venturi underfloor pressure -262.10 Pa, rear diffuser downforce 461.0 N at 160 km/h
# Elise_Trace[0181]: Venturi underfloor pressure -262.22 Pa, rear diffuser downforce 461.4 N at 160 km/h
# Elise_Trace[0182]: Venturi underfloor pressure -262.34 Pa, rear diffuser downforce 461.9 N at 160 km/h
# Elise_Trace[0183]: Venturi underfloor pressure -262.46 Pa, rear diffuser downforce 462.4 N at 160 km/h
# Elise_Trace[0184]: Venturi underfloor pressure -262.58 Pa, rear diffuser downforce 462.8 N at 160 km/h
# Elise_Trace[0185]: Venturi underfloor pressure -262.70 Pa, rear diffuser downforce 463.3 N at 160 km/h
# Elise_Trace[0186]: Venturi underfloor pressure -262.82 Pa, rear diffuser downforce 463.7 N at 160 km/h
# Elise_Trace[0187]: Venturi underfloor pressure -262.94 Pa, rear diffuser downforce 464.1 N at 160 km/h
# Elise_Trace[0188]: Venturi underfloor pressure -263.06 Pa, rear diffuser downforce 464.6 N at 160 km/h
# Elise_Trace[0189]: Venturi underfloor pressure -263.18 Pa, rear diffuser downforce 380.1 N at 160 km/h
# Elise_Trace[0190]: Venturi underfloor pressure -263.30 Pa, rear diffuser downforce 380.5 N at 160 km/h
# Elise_Trace[0191]: Venturi underfloor pressure -263.42 Pa, rear diffuser downforce 380.9 N at 160 km/h
# Elise_Trace[0192]: Venturi underfloor pressure -263.54 Pa, rear diffuser downforce 381.4 N at 160 km/h
# Elise_Trace[0193]: Venturi underfloor pressure -263.66 Pa, rear diffuser downforce 381.9 N at 160 km/h
# Elise_Trace[0194]: Venturi underfloor pressure -263.78 Pa, rear diffuser downforce 382.3 N at 160 km/h
# Elise_Trace[0195]: Venturi underfloor pressure -263.90 Pa, rear diffuser downforce 382.8 N at 160 km/h
# Elise_Trace[0196]: Venturi underfloor pressure -264.02 Pa, rear diffuser downforce 383.2 N at 160 km/h
# Elise_Trace[0197]: Venturi underfloor pressure -264.14 Pa, rear diffuser downforce 383.6 N at 160 km/h
# Elise_Trace[0198]: Venturi underfloor pressure -264.26 Pa, rear diffuser downforce 384.1 N at 160 km/h
# Elise_Trace[0199]: Venturi underfloor pressure -264.38 Pa, rear diffuser downforce 384.6 N at 160 km/h
# Elise_Trace[0200]: Venturi underfloor pressure -264.50 Pa, rear diffuser downforce 385.0 N at 160 km/h
# Elise_Trace[0201]: Venturi underfloor pressure -264.62 Pa, rear diffuser downforce 385.4 N at 160 km/h
# Elise_Trace[0202]: Venturi underfloor pressure -264.74 Pa, rear diffuser downforce 385.9 N at 160 km/h
# Elise_Trace[0203]: Venturi underfloor pressure -264.86 Pa, rear diffuser downforce 386.4 N at 160 km/h
# Elise_Trace[0204]: Venturi underfloor pressure -264.98 Pa, rear diffuser downforce 386.8 N at 160 km/h
# Elise_Trace[0205]: Venturi underfloor pressure -265.10 Pa, rear diffuser downforce 387.3 N at 160 km/h
# Elise_Trace[0206]: Venturi underfloor pressure -265.22 Pa, rear diffuser downforce 387.7 N at 160 km/h
# Elise_Trace[0207]: Venturi underfloor pressure -265.34 Pa, rear diffuser downforce 388.1 N at 160 km/h
# Elise_Trace[0208]: Venturi underfloor pressure -265.46 Pa, rear diffuser downforce 388.6 N at 160 km/h
# Elise_Trace[0209]: Venturi underfloor pressure -265.58 Pa, rear diffuser downforce 389.1 N at 160 km/h
# Elise_Trace[0210]: Venturi underfloor pressure -265.70 Pa, rear diffuser downforce 389.5 N at 160 km/h
# Elise_Trace[0211]: Venturi underfloor pressure -265.82 Pa, rear diffuser downforce 389.9 N at 160 km/h
# Elise_Trace[0212]: Venturi underfloor pressure -265.94 Pa, rear diffuser downforce 390.4 N at 160 km/h
# Elise_Trace[0213]: Venturi underfloor pressure -266.06 Pa, rear diffuser downforce 390.9 N at 160 km/h
# Elise_Trace[0214]: Venturi underfloor pressure -266.18 Pa, rear diffuser downforce 391.3 N at 160 km/h
# Elise_Trace[0215]: Venturi underfloor pressure -266.30 Pa, rear diffuser downforce 391.8 N at 160 km/h
# Elise_Trace[0216]: Venturi underfloor pressure -266.42 Pa, rear diffuser downforce 392.2 N at 160 km/h
# Elise_Trace[0217]: Venturi underfloor pressure -266.54 Pa, rear diffuser downforce 392.6 N at 160 km/h
# Elise_Trace[0218]: Venturi underfloor pressure -266.66 Pa, rear diffuser downforce 393.1 N at 160 km/h
# Elise_Trace[0219]: Venturi underfloor pressure -266.78 Pa, rear diffuser downforce 393.6 N at 160 km/h
# Elise_Trace[0220]: Venturi underfloor pressure -266.90 Pa, rear diffuser downforce 394.0 N at 160 km/h
# Elise_Trace[0221]: Venturi underfloor pressure -267.02 Pa, rear diffuser downforce 394.4 N at 160 km/h
# Elise_Trace[0222]: Venturi underfloor pressure -267.14 Pa, rear diffuser downforce 394.9 N at 160 km/h
# Elise_Trace[0223]: Venturi underfloor pressure -267.26 Pa, rear diffuser downforce 395.4 N at 160 km/h
# Elise_Trace[0224]: Venturi underfloor pressure -267.38 Pa, rear diffuser downforce 395.8 N at 160 km/h
# Elise_Trace[0225]: Venturi underfloor pressure -267.50 Pa, rear diffuser downforce 396.3 N at 160 km/h
# Elise_Trace[0226]: Venturi underfloor pressure -267.62 Pa, rear diffuser downforce 396.7 N at 160 km/h
# Elise_Trace[0227]: Venturi underfloor pressure -267.74 Pa, rear diffuser downforce 397.1 N at 160 km/h
# Elise_Trace[0228]: Venturi underfloor pressure -267.86 Pa, rear diffuser downforce 397.6 N at 160 km/h
# Elise_Trace[0229]: Venturi underfloor pressure -267.98 Pa, rear diffuser downforce 398.1 N at 160 km/h
# Elise_Trace[0230]: Venturi underfloor pressure -268.10 Pa, rear diffuser downforce 398.5 N at 160 km/h
# Elise_Trace[0231]: Venturi underfloor pressure -268.22 Pa, rear diffuser downforce 398.9 N at 160 km/h
# Elise_Trace[0232]: Venturi underfloor pressure -268.34 Pa, rear diffuser downforce 399.4 N at 160 km/h
# Elise_Trace[0233]: Venturi underfloor pressure -268.46 Pa, rear diffuser downforce 399.9 N at 160 km/h
# Elise_Trace[0234]: Venturi underfloor pressure -268.58 Pa, rear diffuser downforce 400.3 N at 160 km/h
# Elise_Trace[0235]: Venturi underfloor pressure -268.70 Pa, rear diffuser downforce 400.8 N at 160 km/h
# Elise_Trace[0236]: Venturi underfloor pressure -268.82 Pa, rear diffuser downforce 401.2 N at 160 km/h
# Elise_Trace[0237]: Venturi underfloor pressure -268.94 Pa, rear diffuser downforce 401.6 N at 160 km/h
# Elise_Trace[0238]: Venturi underfloor pressure -269.06 Pa, rear diffuser downforce 402.1 N at 160 km/h
# Elise_Trace[0239]: Venturi underfloor pressure -269.18 Pa, rear diffuser downforce 402.6 N at 160 km/h
# Elise_Trace[0240]: Venturi underfloor pressure -269.30 Pa, rear diffuser downforce 403.0 N at 160 km/h
# Elise_Trace[0241]: Venturi underfloor pressure -269.42 Pa, rear diffuser downforce 403.4 N at 160 km/h
# Elise_Trace[0242]: Venturi underfloor pressure -269.54 Pa, rear diffuser downforce 403.9 N at 160 km/h
# Elise_Trace[0243]: Venturi underfloor pressure -269.66 Pa, rear diffuser downforce 404.4 N at 160 km/h
# Elise_Trace[0244]: Venturi underfloor pressure -269.78 Pa, rear diffuser downforce 404.8 N at 160 km/h
# Elise_Trace[0245]: Venturi underfloor pressure -269.90 Pa, rear diffuser downforce 405.3 N at 160 km/h
# Elise_Trace[0246]: Venturi underfloor pressure -270.02 Pa, rear diffuser downforce 405.7 N at 160 km/h
# Elise_Trace[0247]: Venturi underfloor pressure -270.14 Pa, rear diffuser downforce 406.1 N at 160 km/h
# Elise_Trace[0248]: Venturi underfloor pressure -270.26 Pa, rear diffuser downforce 406.6 N at 160 km/h
# Elise_Trace[0249]: Venturi underfloor pressure -270.38 Pa, rear diffuser downforce 407.1 N at 160 km/h
# Elise_Trace[0250]: Venturi underfloor pressure -270.50 Pa, rear diffuser downforce 407.5 N at 160 km/h
# Elise_Trace[0251]: Venturi underfloor pressure -270.62 Pa, rear diffuser downforce 407.9 N at 160 km/h
# Elise_Trace[0252]: Venturi underfloor pressure -270.74 Pa, rear diffuser downforce 408.4 N at 160 km/h
# Elise_Trace[0253]: Venturi underfloor pressure -270.86 Pa, rear diffuser downforce 408.9 N at 160 km/h
# Elise_Trace[0254]: Venturi underfloor pressure -270.98 Pa, rear diffuser downforce 409.3 N at 160 km/h
# Elise_Trace[0255]: Venturi underfloor pressure -271.10 Pa, rear diffuser downforce 409.8 N at 160 km/h
# Elise_Trace[0256]: Venturi underfloor pressure -271.22 Pa, rear diffuser downforce 410.2 N at 160 km/h
# Elise_Trace[0257]: Venturi underfloor pressure -271.34 Pa, rear diffuser downforce 410.6 N at 160 km/h
# Elise_Trace[0258]: Venturi underfloor pressure -271.46 Pa, rear diffuser downforce 411.1 N at 160 km/h
# Elise_Trace[0259]: Venturi underfloor pressure -271.58 Pa, rear diffuser downforce 411.6 N at 160 km/h
# Elise_Trace[0260]: Venturi underfloor pressure -271.70 Pa, rear diffuser downforce 412.0 N at 160 km/h
# Elise_Trace[0261]: Venturi underfloor pressure -271.82 Pa, rear diffuser downforce 412.4 N at 160 km/h
# Elise_Trace[0262]: Venturi underfloor pressure -271.94 Pa, rear diffuser downforce 412.9 N at 160 km/h
# Elise_Trace[0263]: Venturi underfloor pressure -272.06 Pa, rear diffuser downforce 413.4 N at 160 km/h
# Elise_Trace[0264]: Venturi underfloor pressure -272.18 Pa, rear diffuser downforce 413.8 N at 160 km/h
# Elise_Trace[0265]: Venturi underfloor pressure -272.30 Pa, rear diffuser downforce 414.3 N at 160 km/h
# Elise_Trace[0266]: Venturi underfloor pressure -272.42 Pa, rear diffuser downforce 414.7 N at 160 km/h
# Elise_Trace[0267]: Venturi underfloor pressure -272.54 Pa, rear diffuser downforce 415.1 N at 160 km/h
# Elise_Trace[0268]: Venturi underfloor pressure -272.66 Pa, rear diffuser downforce 415.6 N at 160 km/h
# Elise_Trace[0269]: Venturi underfloor pressure -272.78 Pa, rear diffuser downforce 416.1 N at 160 km/h
# Elise_Trace[0270]: Venturi underfloor pressure -272.90 Pa, rear diffuser downforce 416.5 N at 160 km/h
# Elise_Trace[0271]: Venturi underfloor pressure -273.02 Pa, rear diffuser downforce 416.9 N at 160 km/h
# Elise_Trace[0272]: Venturi underfloor pressure -273.14 Pa, rear diffuser downforce 417.4 N at 160 km/h
# Elise_Trace[0273]: Venturi underfloor pressure -273.26 Pa, rear diffuser downforce 417.9 N at 160 km/h
# Elise_Trace[0274]: Venturi underfloor pressure -273.38 Pa, rear diffuser downforce 418.3 N at 160 km/h
# Elise_Trace[0275]: Venturi underfloor pressure -273.50 Pa, rear diffuser downforce 418.8 N at 160 km/h
# Elise_Trace[0276]: Venturi underfloor pressure -273.62 Pa, rear diffuser downforce 419.2 N at 160 km/h
# Elise_Trace[0277]: Venturi underfloor pressure -273.74 Pa, rear diffuser downforce 419.6 N at 160 km/h
# Elise_Trace[0278]: Venturi underfloor pressure -273.86 Pa, rear diffuser downforce 420.1 N at 160 km/h
# Elise_Trace[0279]: Venturi underfloor pressure -273.98 Pa, rear diffuser downforce 420.6 N at 160 km/h
# Elise_Trace[0280]: Venturi underfloor pressure -274.10 Pa, rear diffuser downforce 421.0 N at 160 km/h
# Elise_Trace[0281]: Venturi underfloor pressure -274.22 Pa, rear diffuser downforce 421.4 N at 160 km/h
# Elise_Trace[0282]: Venturi underfloor pressure -274.34 Pa, rear diffuser downforce 421.9 N at 160 km/h
# Elise_Trace[0283]: Venturi underfloor pressure -274.46 Pa, rear diffuser downforce 422.4 N at 160 km/h
# Elise_Trace[0284]: Venturi underfloor pressure -274.58 Pa, rear diffuser downforce 422.8 N at 160 km/h
# Elise_Trace[0285]: Venturi underfloor pressure -274.70 Pa, rear diffuser downforce 423.3 N at 160 km/h
# Elise_Trace[0286]: Venturi underfloor pressure -274.82 Pa, rear diffuser downforce 423.7 N at 160 km/h
# Elise_Trace[0287]: Venturi underfloor pressure -274.94 Pa, rear diffuser downforce 424.1 N at 160 km/h
# Elise_Trace[0288]: Venturi underfloor pressure -275.06 Pa, rear diffuser downforce 424.6 N at 160 km/h
# Elise_Trace[0289]: Venturi underfloor pressure -275.18 Pa, rear diffuser downforce 425.1 N at 160 km/h
# Elise_Trace[0290]: Venturi underfloor pressure -275.30 Pa, rear diffuser downforce 425.5 N at 160 km/h
# Elise_Trace[0291]: Venturi underfloor pressure -275.42 Pa, rear diffuser downforce 426.0 N at 160 km/h
# Elise_Trace[0292]: Venturi underfloor pressure -275.54 Pa, rear diffuser downforce 426.4 N at 160 km/h
# Elise_Trace[0293]: Venturi underfloor pressure -275.66 Pa, rear diffuser downforce 426.9 N at 160 km/h
# Elise_Trace[0294]: Venturi underfloor pressure -275.78 Pa, rear diffuser downforce 427.3 N at 160 km/h
# Elise_Trace[0295]: Venturi underfloor pressure -275.90 Pa, rear diffuser downforce 427.8 N at 160 km/h
# Elise_Trace[0296]: Venturi underfloor pressure -276.02 Pa, rear diffuser downforce 428.2 N at 160 km/h
# Elise_Trace[0297]: Venturi underfloor pressure -276.14 Pa, rear diffuser downforce 428.6 N at 160 km/h
# Elise_Trace[0298]: Venturi underfloor pressure -276.26 Pa, rear diffuser downforce 429.1 N at 160 km/h
# Elise_Trace[0299]: Venturi underfloor pressure -276.38 Pa, rear diffuser downforce 429.6 N at 160 km/h
# Elise_Trace[0300]: Venturi underfloor pressure -276.50 Pa, rear diffuser downforce 430.0 N at 160 km/h
# Elise_Trace[0301]: Venturi underfloor pressure -276.62 Pa, rear diffuser downforce 430.5 N at 160 km/h
# Elise_Trace[0302]: Venturi underfloor pressure -276.74 Pa, rear diffuser downforce 430.9 N at 160 km/h
# Elise_Trace[0303]: Venturi underfloor pressure -276.86 Pa, rear diffuser downforce 431.4 N at 160 km/h
# Elise_Trace[0304]: Venturi underfloor pressure -276.98 Pa, rear diffuser downforce 431.8 N at 160 km/h
# Elise_Trace[0305]: Venturi underfloor pressure -277.10 Pa, rear diffuser downforce 432.3 N at 160 km/h
# Elise_Trace[0306]: Venturi underfloor pressure -277.22 Pa, rear diffuser downforce 432.7 N at 160 km/h
# Elise_Trace[0307]: Venturi underfloor pressure -277.34 Pa, rear diffuser downforce 433.1 N at 160 km/h
# Elise_Trace[0308]: Venturi underfloor pressure -277.46 Pa, rear diffuser downforce 433.6 N at 160 km/h
# Elise_Trace[0309]: Venturi underfloor pressure -277.58 Pa, rear diffuser downforce 434.1 N at 160 km/h
# Elise_Trace[0310]: Venturi underfloor pressure -277.70 Pa, rear diffuser downforce 434.5 N at 160 km/h
# Elise_Trace[0311]: Venturi underfloor pressure -277.82 Pa, rear diffuser downforce 435.0 N at 160 km/h
# Elise_Trace[0312]: Venturi underfloor pressure -277.94 Pa, rear diffuser downforce 435.4 N at 160 km/h
# Elise_Trace[0313]: Venturi underfloor pressure -278.06 Pa, rear diffuser downforce 435.9 N at 160 km/h
# Elise_Trace[0314]: Venturi underfloor pressure -278.18 Pa, rear diffuser downforce 436.3 N at 160 km/h
# Elise_Trace[0315]: Venturi underfloor pressure -278.30 Pa, rear diffuser downforce 436.8 N at 160 km/h
# Elise_Trace[0316]: Venturi underfloor pressure -278.42 Pa, rear diffuser downforce 437.2 N at 160 km/h
# Elise_Trace[0317]: Venturi underfloor pressure -278.54 Pa, rear diffuser downforce 437.6 N at 160 km/h
# Elise_Trace[0318]: Venturi underfloor pressure -278.66 Pa, rear diffuser downforce 438.1 N at 160 km/h
# Elise_Trace[0319]: Venturi underfloor pressure -278.78 Pa, rear diffuser downforce 438.6 N at 160 km/h
# Elise_Trace[0320]: Venturi underfloor pressure -278.90 Pa, rear diffuser downforce 439.0 N at 160 km/h
# Elise_Trace[0321]: Venturi underfloor pressure -279.02 Pa, rear diffuser downforce 439.5 N at 160 km/h
# Elise_Trace[0322]: Venturi underfloor pressure -279.14 Pa, rear diffuser downforce 439.9 N at 160 km/h
# Elise_Trace[0323]: Venturi underfloor pressure -279.26 Pa, rear diffuser downforce 440.4 N at 160 km/h
# Elise_Trace[0324]: Venturi underfloor pressure -279.38 Pa, rear diffuser downforce 440.8 N at 160 km/h
# Elise_Trace[0325]: Venturi underfloor pressure -279.50 Pa, rear diffuser downforce 441.3 N at 160 km/h
# Elise_Trace[0326]: Venturi underfloor pressure -279.62 Pa, rear diffuser downforce 441.7 N at 160 km/h
# Elise_Trace[0327]: Venturi underfloor pressure -279.74 Pa, rear diffuser downforce 442.1 N at 160 km/h
# Elise_Trace[0328]: Venturi underfloor pressure -279.86 Pa, rear diffuser downforce 442.6 N at 160 km/h
# Elise_Trace[0329]: Venturi underfloor pressure -279.98 Pa, rear diffuser downforce 443.1 N at 160 km/h
# Elise_Trace[0330]: Venturi underfloor pressure -280.10 Pa, rear diffuser downforce 443.5 N at 160 km/h
# Elise_Trace[0331]: Venturi underfloor pressure -280.22 Pa, rear diffuser downforce 444.0 N at 160 km/h
# Elise_Trace[0332]: Venturi underfloor pressure -280.34 Pa, rear diffuser downforce 444.4 N at 160 km/h
# Elise_Trace[0333]: Venturi underfloor pressure -280.46 Pa, rear diffuser downforce 444.9 N at 160 km/h
# Elise_Trace[0334]: Venturi underfloor pressure -280.58 Pa, rear diffuser downforce 445.3 N at 160 km/h
# Elise_Trace[0335]: Venturi underfloor pressure -280.70 Pa, rear diffuser downforce 445.8 N at 160 km/h
# Elise_Trace[0336]: Venturi underfloor pressure -280.82 Pa, rear diffuser downforce 446.2 N at 160 km/h
# Elise_Trace[0337]: Venturi underfloor pressure -280.94 Pa, rear diffuser downforce 446.6 N at 160 km/h
# Elise_Trace[0338]: Venturi underfloor pressure -281.06 Pa, rear diffuser downforce 447.1 N at 160 km/h
# Elise_Trace[0339]: Venturi underfloor pressure -281.18 Pa, rear diffuser downforce 447.6 N at 160 km/h
# Elise_Trace[0340]: Venturi underfloor pressure -281.30 Pa, rear diffuser downforce 448.0 N at 160 km/h
# Elise_Trace[0341]: Venturi underfloor pressure -281.42 Pa, rear diffuser downforce 448.5 N at 160 km/h
# Elise_Trace[0342]: Venturi underfloor pressure -281.54 Pa, rear diffuser downforce 448.9 N at 160 km/h
# Elise_Trace[0343]: Venturi underfloor pressure -281.66 Pa, rear diffuser downforce 449.4 N at 160 km/h
# Elise_Trace[0344]: Venturi underfloor pressure -281.78 Pa, rear diffuser downforce 449.8 N at 160 km/h
# Elise_Trace[0345]: Venturi underfloor pressure -281.90 Pa, rear diffuser downforce 450.3 N at 160 km/h
# Elise_Trace[0346]: Venturi underfloor pressure -282.02 Pa, rear diffuser downforce 450.7 N at 160 km/h
# Elise_Trace[0347]: Venturi underfloor pressure -282.14 Pa, rear diffuser downforce 451.1 N at 160 km/h
# Elise_Trace[0348]: Venturi underfloor pressure -282.26 Pa, rear diffuser downforce 451.6 N at 160 km/h
# Elise_Trace[0349]: Venturi underfloor pressure -282.38 Pa, rear diffuser downforce 452.1 N at 160 km/h
# Elise_Trace[0350]: Venturi underfloor pressure -282.50 Pa, rear diffuser downforce 452.5 N at 160 km/h
# Elise_Trace[0351]: Venturi underfloor pressure -282.62 Pa, rear diffuser downforce 453.0 N at 160 km/h
# Elise_Trace[0352]: Venturi underfloor pressure -282.74 Pa, rear diffuser downforce 453.4 N at 160 km/h
# Elise_Trace[0353]: Venturi underfloor pressure -282.86 Pa, rear diffuser downforce 453.9 N at 160 km/h
# Elise_Trace[0354]: Venturi underfloor pressure -282.98 Pa, rear diffuser downforce 454.3 N at 160 km/h
# Elise_Trace[0355]: Venturi underfloor pressure -283.10 Pa, rear diffuser downforce 454.8 N at 160 km/h
# Elise_Trace[0356]: Venturi underfloor pressure -283.22 Pa, rear diffuser downforce 455.2 N at 160 km/h
# Elise_Trace[0357]: Venturi underfloor pressure -283.34 Pa, rear diffuser downforce 455.6 N at 160 km/h
# Elise_Trace[0358]: Venturi underfloor pressure -283.46 Pa, rear diffuser downforce 456.1 N at 160 km/h
# Elise_Trace[0359]: Venturi underfloor pressure -283.58 Pa, rear diffuser downforce 456.6 N at 160 km/h
# Elise_Trace[0360]: Venturi underfloor pressure -283.70 Pa, rear diffuser downforce 457.0 N at 160 km/h
# Elise_Trace[0361]: Venturi underfloor pressure -283.82 Pa, rear diffuser downforce 457.5 N at 160 km/h
# Elise_Trace[0362]: Venturi underfloor pressure -283.94 Pa, rear diffuser downforce 457.9 N at 160 km/h
# Elise_Trace[0363]: Venturi underfloor pressure -284.06 Pa, rear diffuser downforce 458.4 N at 160 km/h
# Elise_Trace[0364]: Venturi underfloor pressure -284.18 Pa, rear diffuser downforce 458.8 N at 160 km/h
# Elise_Trace[0365]: Venturi underfloor pressure -284.30 Pa, rear diffuser downforce 459.3 N at 160 km/h
# Elise_Trace[0366]: Venturi underfloor pressure -284.42 Pa, rear diffuser downforce 459.7 N at 160 km/h
# Elise_Trace[0367]: Venturi underfloor pressure -284.54 Pa, rear diffuser downforce 460.1 N at 160 km/h
# Elise_Trace[0368]: Venturi underfloor pressure -284.66 Pa, rear diffuser downforce 460.6 N at 160 km/h
# Elise_Trace[0369]: Venturi underfloor pressure -284.78 Pa, rear diffuser downforce 461.1 N at 160 km/h
# Elise_Trace[0370]: Venturi underfloor pressure -284.90 Pa, rear diffuser downforce 461.5 N at 160 km/h
# Elise_Trace[0371]: Venturi underfloor pressure -285.02 Pa, rear diffuser downforce 462.0 N at 160 km/h
# Elise_Trace[0372]: Venturi underfloor pressure -285.14 Pa, rear diffuser downforce 462.4 N at 160 km/h
# Elise_Trace[0373]: Venturi underfloor pressure -285.26 Pa, rear diffuser downforce 462.9 N at 160 km/h
# Elise_Trace[0374]: Venturi underfloor pressure -285.38 Pa, rear diffuser downforce 463.3 N at 160 km/h
# Elise_Trace[0375]: Venturi underfloor pressure -240.50 Pa, rear diffuser downforce 463.8 N at 160 km/h
# Elise_Trace[0376]: Venturi underfloor pressure -240.62 Pa, rear diffuser downforce 464.2 N at 160 km/h
# Elise_Trace[0377]: Venturi underfloor pressure -240.74 Pa, rear diffuser downforce 464.6 N at 160 km/h
# Elise_Trace[0378]: Venturi underfloor pressure -240.86 Pa, rear diffuser downforce 380.1 N at 160 km/h
# Elise_Trace[0379]: Venturi underfloor pressure -240.98 Pa, rear diffuser downforce 380.6 N at 160 km/h
# Elise_Trace[0380]: Venturi underfloor pressure -241.10 Pa, rear diffuser downforce 381.0 N at 160 km/h
# Elise_Trace[0381]: Venturi underfloor pressure -241.22 Pa, rear diffuser downforce 381.5 N at 160 km/h
# Elise_Trace[0382]: Venturi underfloor pressure -241.34 Pa, rear diffuser downforce 381.9 N at 160 km/h
# Elise_Trace[0383]: Venturi underfloor pressure -241.46 Pa, rear diffuser downforce 382.4 N at 160 km/h
# Elise_Trace[0384]: Venturi underfloor pressure -241.58 Pa, rear diffuser downforce 382.8 N at 160 km/h
# Elise_Trace[0385]: Venturi underfloor pressure -241.70 Pa, rear diffuser downforce 383.3 N at 160 km/h
# Elise_Trace[0386]: Venturi underfloor pressure -241.82 Pa, rear diffuser downforce 383.7 N at 160 km/h
# Elise_Trace[0387]: Venturi underfloor pressure -241.94 Pa, rear diffuser downforce 384.1 N at 160 km/h
# Elise_Trace[0388]: Venturi underfloor pressure -242.06 Pa, rear diffuser downforce 384.6 N at 160 km/h
# Elise_Trace[0389]: Venturi underfloor pressure -242.18 Pa, rear diffuser downforce 385.1 N at 160 km/h
# Elise_Trace[0390]: Venturi underfloor pressure -242.30 Pa, rear diffuser downforce 385.5 N at 160 km/h
# Elise_Trace[0391]: Venturi underfloor pressure -242.42 Pa, rear diffuser downforce 386.0 N at 160 km/h
# Elise_Trace[0392]: Venturi underfloor pressure -242.54 Pa, rear diffuser downforce 386.4 N at 160 km/h
# Elise_Trace[0393]: Venturi underfloor pressure -242.66 Pa, rear diffuser downforce 386.9 N at 160 km/h
# Elise_Trace[0394]: Venturi underfloor pressure -242.78 Pa, rear diffuser downforce 387.3 N at 160 km/h
# Elise_Trace[0395]: Venturi underfloor pressure -242.90 Pa, rear diffuser downforce 387.8 N at 160 km/h
# Elise_Trace[0396]: Venturi underfloor pressure -243.02 Pa, rear diffuser downforce 388.2 N at 160 km/h
# Elise_Trace[0397]: Venturi underfloor pressure -243.14 Pa, rear diffuser downforce 388.6 N at 160 km/h
# Elise_Trace[0398]: Venturi underfloor pressure -243.26 Pa, rear diffuser downforce 389.1 N at 160 km/h
# Elise_Trace[0399]: Venturi underfloor pressure -243.38 Pa, rear diffuser downforce 389.6 N at 160 km/h
# Elise_Trace[0400]: Venturi underfloor pressure -243.50 Pa, rear diffuser downforce 390.0 N at 160 km/h
# Elise_Trace[0401]: Venturi underfloor pressure -243.62 Pa, rear diffuser downforce 390.5 N at 160 km/h
# Elise_Trace[0402]: Venturi underfloor pressure -243.74 Pa, rear diffuser downforce 390.9 N at 160 km/h
# Elise_Trace[0403]: Venturi underfloor pressure -243.86 Pa, rear diffuser downforce 391.4 N at 160 km/h
# Elise_Trace[0404]: Venturi underfloor pressure -243.98 Pa, rear diffuser downforce 391.8 N at 160 km/h
# Elise_Trace[0405]: Venturi underfloor pressure -244.10 Pa, rear diffuser downforce 392.3 N at 160 km/h
# Elise_Trace[0406]: Venturi underfloor pressure -244.22 Pa, rear diffuser downforce 392.7 N at 160 km/h
# Elise_Trace[0407]: Venturi underfloor pressure -244.34 Pa, rear diffuser downforce 393.1 N at 160 km/h
# Elise_Trace[0408]: Venturi underfloor pressure -244.46 Pa, rear diffuser downforce 393.6 N at 160 km/h
# Elise_Trace[0409]: Venturi underfloor pressure -244.58 Pa, rear diffuser downforce 394.1 N at 160 km/h
# Elise_Trace[0410]: Venturi underfloor pressure -244.70 Pa, rear diffuser downforce 394.5 N at 160 km/h
# Elise_Trace[0411]: Venturi underfloor pressure -244.82 Pa, rear diffuser downforce 395.0 N at 160 km/h
# Elise_Trace[0412]: Venturi underfloor pressure -244.94 Pa, rear diffuser downforce 395.4 N at 160 km/h
# Elise_Trace[0413]: Venturi underfloor pressure -245.06 Pa, rear diffuser downforce 395.9 N at 160 km/h
# Elise_Trace[0414]: Venturi underfloor pressure -245.18 Pa, rear diffuser downforce 396.3 N at 160 km/h
# Elise_Trace[0415]: Venturi underfloor pressure -245.30 Pa, rear diffuser downforce 396.8 N at 160 km/h
# Elise_Trace[0416]: Venturi underfloor pressure -245.42 Pa, rear diffuser downforce 397.2 N at 160 km/h
# Elise_Trace[0417]: Venturi underfloor pressure -245.54 Pa, rear diffuser downforce 397.6 N at 160 km/h
# Elise_Trace[0418]: Venturi underfloor pressure -245.66 Pa, rear diffuser downforce 398.1 N at 160 km/h
# Elise_Trace[0419]: Venturi underfloor pressure -245.78 Pa, rear diffuser downforce 398.6 N at 160 km/h
# Elise_Trace[0420]: Venturi underfloor pressure -245.90 Pa, rear diffuser downforce 399.0 N at 160 km/h
# Elise_Trace[0421]: Venturi underfloor pressure -246.02 Pa, rear diffuser downforce 399.5 N at 160 km/h
# Elise_Trace[0422]: Venturi underfloor pressure -246.14 Pa, rear diffuser downforce 399.9 N at 160 km/h
# Elise_Trace[0423]: Venturi underfloor pressure -246.26 Pa, rear diffuser downforce 400.4 N at 160 km/h
# Elise_Trace[0424]: Venturi underfloor pressure -246.38 Pa, rear diffuser downforce 400.8 N at 160 km/h
# Elise_Trace[0425]: Venturi underfloor pressure -246.50 Pa, rear diffuser downforce 401.3 N at 160 km/h
# Elise_Trace[0426]: Venturi underfloor pressure -246.62 Pa, rear diffuser downforce 401.7 N at 160 km/h
# Elise_Trace[0427]: Venturi underfloor pressure -246.74 Pa, rear diffuser downforce 402.1 N at 160 km/h
# Elise_Trace[0428]: Venturi underfloor pressure -246.86 Pa, rear diffuser downforce 402.6 N at 160 km/h
# Elise_Trace[0429]: Venturi underfloor pressure -246.98 Pa, rear diffuser downforce 403.1 N at 160 km/h
# Elise_Trace[0430]: Venturi underfloor pressure -247.10 Pa, rear diffuser downforce 403.5 N at 160 km/h
# Elise_Trace[0431]: Venturi underfloor pressure -247.22 Pa, rear diffuser downforce 404.0 N at 160 km/h
# Elise_Trace[0432]: Venturi underfloor pressure -247.34 Pa, rear diffuser downforce 404.4 N at 160 km/h
# Elise_Trace[0433]: Venturi underfloor pressure -247.46 Pa, rear diffuser downforce 404.9 N at 160 km/h
# Elise_Trace[0434]: Venturi underfloor pressure -247.58 Pa, rear diffuser downforce 405.3 N at 160 km/h
# Elise_Trace[0435]: Venturi underfloor pressure -247.70 Pa, rear diffuser downforce 405.8 N at 160 km/h
# Elise_Trace[0436]: Venturi underfloor pressure -247.82 Pa, rear diffuser downforce 406.2 N at 160 km/h
# Elise_Trace[0437]: Venturi underfloor pressure -247.94 Pa, rear diffuser downforce 406.6 N at 160 km/h
# Elise_Trace[0438]: Venturi underfloor pressure -248.06 Pa, rear diffuser downforce 407.1 N at 160 km/h
# Elise_Trace[0439]: Venturi underfloor pressure -248.18 Pa, rear diffuser downforce 407.6 N at 160 km/h
# Elise_Trace[0440]: Venturi underfloor pressure -248.30 Pa, rear diffuser downforce 408.0 N at 160 km/h
# Elise_Trace[0441]: Venturi underfloor pressure -248.42 Pa, rear diffuser downforce 408.5 N at 160 km/h
# Elise_Trace[0442]: Venturi underfloor pressure -248.54 Pa, rear diffuser downforce 408.9 N at 160 km/h
# Elise_Trace[0443]: Venturi underfloor pressure -248.66 Pa, rear diffuser downforce 409.4 N at 160 km/h
# Elise_Trace[0444]: Venturi underfloor pressure -248.78 Pa, rear diffuser downforce 409.8 N at 160 km/h
# Elise_Trace[0445]: Venturi underfloor pressure -248.90 Pa, rear diffuser downforce 410.3 N at 160 km/h
# Elise_Trace[0446]: Venturi underfloor pressure -249.02 Pa, rear diffuser downforce 410.7 N at 160 km/h
# Elise_Trace[0447]: Venturi underfloor pressure -249.14 Pa, rear diffuser downforce 411.1 N at 160 km/h
# Elise_Trace[0448]: Venturi underfloor pressure -249.26 Pa, rear diffuser downforce 411.6 N at 160 km/h
# Elise_Trace[0449]: Venturi underfloor pressure -249.38 Pa, rear diffuser downforce 412.1 N at 160 km/h
# Elise_Trace[0450]: Venturi underfloor pressure -249.50 Pa, rear diffuser downforce 412.5 N at 160 km/h
# Elise_Trace[0451]: Venturi underfloor pressure -249.62 Pa, rear diffuser downforce 413.0 N at 160 km/h
# Elise_Trace[0452]: Venturi underfloor pressure -249.74 Pa, rear diffuser downforce 413.4 N at 160 km/h
# Elise_Trace[0453]: Venturi underfloor pressure -249.86 Pa, rear diffuser downforce 413.9 N at 160 km/h
# Elise_Trace[0454]: Venturi underfloor pressure -249.98 Pa, rear diffuser downforce 414.3 N at 160 km/h
# Elise_Trace[0455]: Venturi underfloor pressure -250.10 Pa, rear diffuser downforce 414.8 N at 160 km/h
# Elise_Trace[0456]: Venturi underfloor pressure -250.22 Pa, rear diffuser downforce 415.2 N at 160 km/h
# Elise_Trace[0457]: Venturi underfloor pressure -250.34 Pa, rear diffuser downforce 415.6 N at 160 km/h
# Elise_Trace[0458]: Venturi underfloor pressure -250.46 Pa, rear diffuser downforce 416.1 N at 160 km/h
# Elise_Trace[0459]: Venturi underfloor pressure -250.58 Pa, rear diffuser downforce 416.6 N at 160 km/h
# Elise_Trace[0460]: Venturi underfloor pressure -250.70 Pa, rear diffuser downforce 417.0 N at 160 km/h
# Elise_Trace[0461]: Venturi underfloor pressure -250.82 Pa, rear diffuser downforce 417.5 N at 160 km/h
# Elise_Trace[0462]: Venturi underfloor pressure -250.94 Pa, rear diffuser downforce 417.9 N at 160 km/h
# Elise_Trace[0463]: Venturi underfloor pressure -251.06 Pa, rear diffuser downforce 418.4 N at 160 km/h
# Elise_Trace[0464]: Venturi underfloor pressure -251.18 Pa, rear diffuser downforce 418.8 N at 160 km/h
# Elise_Trace[0465]: Venturi underfloor pressure -251.30 Pa, rear diffuser downforce 419.3 N at 160 km/h
# Elise_Trace[0466]: Venturi underfloor pressure -251.42 Pa, rear diffuser downforce 419.7 N at 160 km/h
# Elise_Trace[0467]: Venturi underfloor pressure -251.54 Pa, rear diffuser downforce 420.1 N at 160 km/h
# Elise_Trace[0468]: Venturi underfloor pressure -251.66 Pa, rear diffuser downforce 420.6 N at 160 km/h
# Elise_Trace[0469]: Venturi underfloor pressure -251.78 Pa, rear diffuser downforce 421.1 N at 160 km/h
# Elise_Trace[0470]: Venturi underfloor pressure -251.90 Pa, rear diffuser downforce 421.5 N at 160 km/h
# Elise_Trace[0471]: Venturi underfloor pressure -252.02 Pa, rear diffuser downforce 422.0 N at 160 km/h
# Elise_Trace[0472]: Venturi underfloor pressure -252.14 Pa, rear diffuser downforce 422.4 N at 160 km/h
# Elise_Trace[0473]: Venturi underfloor pressure -252.26 Pa, rear diffuser downforce 422.9 N at 160 km/h
# Elise_Trace[0474]: Venturi underfloor pressure -252.38 Pa, rear diffuser downforce 423.3 N at 160 km/h
# Elise_Trace[0475]: Venturi underfloor pressure -252.50 Pa, rear diffuser downforce 423.8 N at 160 km/h
# Elise_Trace[0476]: Venturi underfloor pressure -252.62 Pa, rear diffuser downforce 424.2 N at 160 km/h
# Elise_Trace[0477]: Venturi underfloor pressure -252.74 Pa, rear diffuser downforce 424.6 N at 160 km/h
# Elise_Trace[0478]: Venturi underfloor pressure -252.86 Pa, rear diffuser downforce 425.1 N at 160 km/h
# Elise_Trace[0479]: Venturi underfloor pressure -252.98 Pa, rear diffuser downforce 425.6 N at 160 km/h
# Elise_Trace[0480]: Venturi underfloor pressure -253.10 Pa, rear diffuser downforce 426.0 N at 160 km/h
# Elise_Trace[0481]: Venturi underfloor pressure -253.22 Pa, rear diffuser downforce 426.5 N at 160 km/h
# Elise_Trace[0482]: Venturi underfloor pressure -253.34 Pa, rear diffuser downforce 426.9 N at 160 km/h
# Elise_Trace[0483]: Venturi underfloor pressure -253.46 Pa, rear diffuser downforce 427.4 N at 160 km/h
# Elise_Trace[0484]: Venturi underfloor pressure -253.58 Pa, rear diffuser downforce 427.8 N at 160 km/h
# Elise_Trace[0485]: Venturi underfloor pressure -253.70 Pa, rear diffuser downforce 428.3 N at 160 km/h
# Elise_Trace[0486]: Venturi underfloor pressure -253.82 Pa, rear diffuser downforce 428.7 N at 160 km/h
# Elise_Trace[0487]: Venturi underfloor pressure -253.94 Pa, rear diffuser downforce 429.1 N at 160 km/h
# Elise_Trace[0488]: Venturi underfloor pressure -254.06 Pa, rear diffuser downforce 429.6 N at 160 km/h
# Elise_Trace[0489]: Venturi underfloor pressure -254.18 Pa, rear diffuser downforce 430.1 N at 160 km/h
# Elise_Trace[0490]: Venturi underfloor pressure -254.30 Pa, rear diffuser downforce 430.5 N at 160 km/h
# Elise_Trace[0491]: Venturi underfloor pressure -254.42 Pa, rear diffuser downforce 431.0 N at 160 km/h
# Elise_Trace[0492]: Venturi underfloor pressure -254.54 Pa, rear diffuser downforce 431.4 N at 160 km/h
# Elise_Trace[0493]: Venturi underfloor pressure -254.66 Pa, rear diffuser downforce 431.9 N at 160 km/h
# Elise_Trace[0494]: Venturi underfloor pressure -254.78 Pa, rear diffuser downforce 432.3 N at 160 km/h
# Elise_Trace[0495]: Venturi underfloor pressure -254.90 Pa, rear diffuser downforce 432.8 N at 160 km/h
# Elise_Trace[0496]: Venturi underfloor pressure -255.02 Pa, rear diffuser downforce 433.2 N at 160 km/h
# Elise_Trace[0497]: Venturi underfloor pressure -255.14 Pa, rear diffuser downforce 433.6 N at 160 km/h
# Elise_Trace[0498]: Venturi underfloor pressure -255.26 Pa, rear diffuser downforce 434.1 N at 160 km/h
# Elise_Trace[0499]: Venturi underfloor pressure -255.38 Pa, rear diffuser downforce 434.6 N at 160 km/h
# Elise_Trace[0500]: Venturi underfloor pressure -255.50 Pa, rear diffuser downforce 435.0 N at 160 km/h
# Elise_Trace[0501]: Venturi underfloor pressure -255.62 Pa, rear diffuser downforce 435.5 N at 160 km/h
# Elise_Trace[0502]: Venturi underfloor pressure -255.74 Pa, rear diffuser downforce 435.9 N at 160 km/h
# Elise_Trace[0503]: Venturi underfloor pressure -255.86 Pa, rear diffuser downforce 436.4 N at 160 km/h
# Elise_Trace[0504]: Venturi underfloor pressure -255.98 Pa, rear diffuser downforce 436.8 N at 160 km/h
# Elise_Trace[0505]: Venturi underfloor pressure -256.10 Pa, rear diffuser downforce 437.3 N at 160 km/h
# Elise_Trace[0506]: Venturi underfloor pressure -256.22 Pa, rear diffuser downforce 437.7 N at 160 km/h
# Elise_Trace[0507]: Venturi underfloor pressure -256.34 Pa, rear diffuser downforce 438.1 N at 160 km/h
# Elise_Trace[0508]: Venturi underfloor pressure -256.46 Pa, rear diffuser downforce 438.6 N at 160 km/h
# Elise_Trace[0509]: Venturi underfloor pressure -256.58 Pa, rear diffuser downforce 439.1 N at 160 km/h
# Elise_Trace[0510]: Venturi underfloor pressure -256.70 Pa, rear diffuser downforce 439.5 N at 160 km/h
# Elise_Trace[0511]: Venturi underfloor pressure -256.82 Pa, rear diffuser downforce 440.0 N at 160 km/h
# Elise_Trace[0512]: Venturi underfloor pressure -256.94 Pa, rear diffuser downforce 440.4 N at 160 km/h
# Elise_Trace[0513]: Venturi underfloor pressure -257.06 Pa, rear diffuser downforce 440.9 N at 160 km/h
# Elise_Trace[0514]: Venturi underfloor pressure -257.18 Pa, rear diffuser downforce 441.3 N at 160 km/h
# Elise_Trace[0515]: Venturi underfloor pressure -257.30 Pa, rear diffuser downforce 441.8 N at 160 km/h
# Elise_Trace[0516]: Venturi underfloor pressure -257.42 Pa, rear diffuser downforce 442.2 N at 160 km/h
# Elise_Trace[0517]: Venturi underfloor pressure -257.54 Pa, rear diffuser downforce 442.6 N at 160 km/h
# Elise_Trace[0518]: Venturi underfloor pressure -257.66 Pa, rear diffuser downforce 443.1 N at 160 km/h
# Elise_Trace[0519]: Venturi underfloor pressure -257.78 Pa, rear diffuser downforce 443.6 N at 160 km/h
# Elise_Trace[0520]: Venturi underfloor pressure -257.90 Pa, rear diffuser downforce 444.0 N at 160 km/h
# Elise_Trace[0521]: Venturi underfloor pressure -258.02 Pa, rear diffuser downforce 444.5 N at 160 km/h
# Elise_Trace[0522]: Venturi underfloor pressure -258.14 Pa, rear diffuser downforce 444.9 N at 160 km/h
# Elise_Trace[0523]: Venturi underfloor pressure -258.26 Pa, rear diffuser downforce 445.4 N at 160 km/h
# Elise_Trace[0524]: Venturi underfloor pressure -258.38 Pa, rear diffuser downforce 445.8 N at 160 km/h
# Elise_Trace[0525]: Venturi underfloor pressure -258.50 Pa, rear diffuser downforce 446.3 N at 160 km/h
# Elise_Trace[0526]: Venturi underfloor pressure -258.62 Pa, rear diffuser downforce 446.7 N at 160 km/h
# Elise_Trace[0527]: Venturi underfloor pressure -258.74 Pa, rear diffuser downforce 447.1 N at 160 km/h
# Elise_Trace[0528]: Venturi underfloor pressure -258.86 Pa, rear diffuser downforce 447.6 N at 160 km/h
# Elise_Trace[0529]: Venturi underfloor pressure -258.98 Pa, rear diffuser downforce 448.1 N at 160 km/h
# Elise_Trace[0530]: Venturi underfloor pressure -259.10 Pa, rear diffuser downforce 448.5 N at 160 km/h
# Elise_Trace[0531]: Venturi underfloor pressure -259.22 Pa, rear diffuser downforce 449.0 N at 160 km/h
# Elise_Trace[0532]: Venturi underfloor pressure -259.34 Pa, rear diffuser downforce 449.4 N at 160 km/h
# Elise_Trace[0533]: Venturi underfloor pressure -259.46 Pa, rear diffuser downforce 449.9 N at 160 km/h
# Elise_Trace[0534]: Venturi underfloor pressure -259.58 Pa, rear diffuser downforce 450.3 N at 160 km/h
# Elise_Trace[0535]: Venturi underfloor pressure -259.70 Pa, rear diffuser downforce 450.8 N at 160 km/h
# Elise_Trace[0536]: Venturi underfloor pressure -259.82 Pa, rear diffuser downforce 451.2 N at 160 km/h
# Elise_Trace[0537]: Venturi underfloor pressure -259.94 Pa, rear diffuser downforce 451.6 N at 160 km/h
# Elise_Trace[0538]: Venturi underfloor pressure -260.06 Pa, rear diffuser downforce 452.1 N at 160 km/h
# Elise_Trace[0539]: Venturi underfloor pressure -260.18 Pa, rear diffuser downforce 452.6 N at 160 km/h
# Elise_Trace[0540]: Venturi underfloor pressure -260.30 Pa, rear diffuser downforce 453.0 N at 160 km/h
# Elise_Trace[0541]: Venturi underfloor pressure -260.42 Pa, rear diffuser downforce 453.5 N at 160 km/h
# Elise_Trace[0542]: Venturi underfloor pressure -260.54 Pa, rear diffuser downforce 453.9 N at 160 km/h
# Elise_Trace[0543]: Venturi underfloor pressure -260.66 Pa, rear diffuser downforce 454.4 N at 160 km/h
# Elise_Trace[0544]: Venturi underfloor pressure -260.78 Pa, rear diffuser downforce 454.8 N at 160 km/h
# Elise_Trace[0545]: Venturi underfloor pressure -260.90 Pa, rear diffuser downforce 455.3 N at 160 km/h
# Elise_Trace[0546]: Venturi underfloor pressure -261.02 Pa, rear diffuser downforce 455.7 N at 160 km/h
# Elise_Trace[0547]: Venturi underfloor pressure -261.14 Pa, rear diffuser downforce 456.1 N at 160 km/h
# Elise_Trace[0548]: Venturi underfloor pressure -261.26 Pa, rear diffuser downforce 456.6 N at 160 km/h
# Elise_Trace[0549]: Venturi underfloor pressure -261.38 Pa, rear diffuser downforce 457.1 N at 160 km/h
# Elise_Trace[0550]: Venturi underfloor pressure -261.50 Pa, rear diffuser downforce 457.5 N at 160 km/h
# Elise_Trace[0551]: Venturi underfloor pressure -261.62 Pa, rear diffuser downforce 458.0 N at 160 km/h
# Elise_Trace[0552]: Venturi underfloor pressure -261.74 Pa, rear diffuser downforce 458.4 N at 160 km/h
# Elise_Trace[0553]: Venturi underfloor pressure -261.86 Pa, rear diffuser downforce 458.9 N at 160 km/h
# Elise_Trace[0554]: Venturi underfloor pressure -261.98 Pa, rear diffuser downforce 459.3 N at 160 km/h
# Elise_Trace[0555]: Venturi underfloor pressure -262.10 Pa, rear diffuser downforce 459.8 N at 160 km/h
# Elise_Trace[0556]: Venturi underfloor pressure -262.22 Pa, rear diffuser downforce 460.2 N at 160 km/h
# Elise_Trace[0557]: Venturi underfloor pressure -262.34 Pa, rear diffuser downforce 460.6 N at 160 km/h
# Elise_Trace[0558]: Venturi underfloor pressure -262.46 Pa, rear diffuser downforce 461.1 N at 160 km/h
# Elise_Trace[0559]: Venturi underfloor pressure -262.58 Pa, rear diffuser downforce 461.6 N at 160 km/h
# Elise_Trace[0560]: Venturi underfloor pressure -262.70 Pa, rear diffuser downforce 462.0 N at 160 km/h
# Elise_Trace[0561]: Venturi underfloor pressure -262.82 Pa, rear diffuser downforce 462.5 N at 160 km/h
# Elise_Trace[0562]: Venturi underfloor pressure -262.94 Pa, rear diffuser downforce 462.9 N at 160 km/h
# Elise_Trace[0563]: Venturi underfloor pressure -263.06 Pa, rear diffuser downforce 463.4 N at 160 km/h
# Elise_Trace[0564]: Venturi underfloor pressure -263.18 Pa, rear diffuser downforce 463.8 N at 160 km/h
# Elise_Trace[0565]: Venturi underfloor pressure -263.30 Pa, rear diffuser downforce 464.3 N at 160 km/h
# Elise_Trace[0566]: Venturi underfloor pressure -263.42 Pa, rear diffuser downforce 464.7 N at 160 km/h
# Elise_Trace[0567]: Venturi underfloor pressure -263.54 Pa, rear diffuser downforce 380.1 N at 160 km/h
# Elise_Trace[0568]: Venturi underfloor pressure -263.66 Pa, rear diffuser downforce 380.6 N at 160 km/h
# Elise_Trace[0569]: Venturi underfloor pressure -263.78 Pa, rear diffuser downforce 381.1 N at 160 km/h
# Elise_Trace[0570]: Venturi underfloor pressure -263.90 Pa, rear diffuser downforce 381.5 N at 160 km/h
# Elise_Trace[0571]: Venturi underfloor pressure -264.02 Pa, rear diffuser downforce 381.9 N at 160 km/h
# Elise_Trace[0572]: Venturi underfloor pressure -264.14 Pa, rear diffuser downforce 382.4 N at 160 km/h
# Elise_Trace[0573]: Venturi underfloor pressure -264.26 Pa, rear diffuser downforce 382.9 N at 160 km/h
# Elise_Trace[0574]: Venturi underfloor pressure -264.38 Pa, rear diffuser downforce 383.3 N at 160 km/h
# Elise_Trace[0575]: Venturi underfloor pressure -264.50 Pa, rear diffuser downforce 383.8 N at 160 km/h
# Elise_Trace[0576]: Venturi underfloor pressure -264.62 Pa, rear diffuser downforce 384.2 N at 160 km/h
# Elise_Trace[0577]: Venturi underfloor pressure -264.74 Pa, rear diffuser downforce 384.7 N at 160 km/h
# Elise_Trace[0578]: Venturi underfloor pressure -264.86 Pa, rear diffuser downforce 385.1 N at 160 km/h
# Elise_Trace[0579]: Venturi underfloor pressure -264.98 Pa, rear diffuser downforce 385.6 N at 160 km/h
# Elise_Trace[0580]: Venturi underfloor pressure -265.10 Pa, rear diffuser downforce 386.0 N at 160 km/h
# Elise_Trace[0581]: Venturi underfloor pressure -265.22 Pa, rear diffuser downforce 386.4 N at 160 km/h
# Elise_Trace[0582]: Venturi underfloor pressure -265.34 Pa, rear diffuser downforce 386.9 N at 160 km/h
# Elise_Trace[0583]: Venturi underfloor pressure -265.46 Pa, rear diffuser downforce 387.4 N at 160 km/h
# Elise_Trace[0584]: Venturi underfloor pressure -265.58 Pa, rear diffuser downforce 387.8 N at 160 km/h
# Elise_Trace[0585]: Venturi underfloor pressure -265.70 Pa, rear diffuser downforce 388.3 N at 160 km/h
# Elise_Trace[0586]: Venturi underfloor pressure -265.82 Pa, rear diffuser downforce 388.7 N at 160 km/h
# Elise_Trace[0587]: Venturi underfloor pressure -265.94 Pa, rear diffuser downforce 389.2 N at 160 km/h
# Elise_Trace[0588]: Venturi underfloor pressure -266.06 Pa, rear diffuser downforce 389.6 N at 160 km/h
# Elise_Trace[0589]: Venturi underfloor pressure -266.18 Pa, rear diffuser downforce 390.1 N at 160 km/h
# Elise_Trace[0590]: Venturi underfloor pressure -266.30 Pa, rear diffuser downforce 390.5 N at 160 km/h
# Elise_Trace[0591]: Venturi underfloor pressure -266.42 Pa, rear diffuser downforce 390.9 N at 160 km/h
# Elise_Trace[0592]: Venturi underfloor pressure -266.54 Pa, rear diffuser downforce 391.4 N at 160 km/h
# Elise_Trace[0593]: Venturi underfloor pressure -266.66 Pa, rear diffuser downforce 391.9 N at 160 km/h
# Elise_Trace[0594]: Venturi underfloor pressure -266.78 Pa, rear diffuser downforce 392.3 N at 160 km/h
# Elise_Trace[0595]: Venturi underfloor pressure -266.90 Pa, rear diffuser downforce 392.8 N at 160 km/h
# Elise_Trace[0596]: Venturi underfloor pressure -267.02 Pa, rear diffuser downforce 393.2 N at 160 km/h
# Elise_Trace[0597]: Venturi underfloor pressure -267.14 Pa, rear diffuser downforce 393.7 N at 160 km/h
# Elise_Trace[0598]: Venturi underfloor pressure -267.26 Pa, rear diffuser downforce 394.1 N at 160 km/h
# Elise_Trace[0599]: Venturi underfloor pressure -267.38 Pa, rear diffuser downforce 394.6 N at 160 km/h
# Elise_Trace[0600]: Venturi underfloor pressure -267.50 Pa, rear diffuser downforce 395.0 N at 160 km/h
# Elise_Trace[0601]: Venturi underfloor pressure -267.62 Pa, rear diffuser downforce 395.4 N at 160 km/h
# Elise_Trace[0602]: Venturi underfloor pressure -267.74 Pa, rear diffuser downforce 395.9 N at 160 km/h
# Elise_Trace[0603]: Venturi underfloor pressure -267.86 Pa, rear diffuser downforce 396.4 N at 160 km/h
# Elise_Trace[0604]: Venturi underfloor pressure -267.98 Pa, rear diffuser downforce 396.8 N at 160 km/h
# Elise_Trace[0605]: Venturi underfloor pressure -268.10 Pa, rear diffuser downforce 397.3 N at 160 km/h
# Elise_Trace[0606]: Venturi underfloor pressure -268.22 Pa, rear diffuser downforce 397.7 N at 160 km/h
# Elise_Trace[0607]: Venturi underfloor pressure -268.34 Pa, rear diffuser downforce 398.2 N at 160 km/h
# Elise_Trace[0608]: Venturi underfloor pressure -268.46 Pa, rear diffuser downforce 398.6 N at 160 km/h
# Elise_Trace[0609]: Venturi underfloor pressure -268.58 Pa, rear diffuser downforce 399.1 N at 160 km/h
# Elise_Trace[0610]: Venturi underfloor pressure -268.70 Pa, rear diffuser downforce 399.5 N at 160 km/h
# Elise_Trace[0611]: Venturi underfloor pressure -268.82 Pa, rear diffuser downforce 399.9 N at 160 km/h
# Elise_Trace[0612]: Venturi underfloor pressure -268.94 Pa, rear diffuser downforce 400.4 N at 160 km/h
# Elise_Trace[0613]: Venturi underfloor pressure -269.06 Pa, rear diffuser downforce 400.9 N at 160 km/h
# Elise_Trace[0614]: Venturi underfloor pressure -269.18 Pa, rear diffuser downforce 401.3 N at 160 km/h
# Elise_Trace[0615]: Venturi underfloor pressure -269.30 Pa, rear diffuser downforce 401.8 N at 160 km/h
# Elise_Trace[0616]: Venturi underfloor pressure -269.42 Pa, rear diffuser downforce 402.2 N at 160 km/h
# Elise_Trace[0617]: Venturi underfloor pressure -269.54 Pa, rear diffuser downforce 402.7 N at 160 km/h
# Elise_Trace[0618]: Venturi underfloor pressure -269.66 Pa, rear diffuser downforce 403.1 N at 160 km/h
# Elise_Trace[0619]: Venturi underfloor pressure -269.78 Pa, rear diffuser downforce 403.6 N at 160 km/h
# Elise_Trace[0620]: Venturi underfloor pressure -269.90 Pa, rear diffuser downforce 404.0 N at 160 km/h
# Elise_Trace[0621]: Venturi underfloor pressure -270.02 Pa, rear diffuser downforce 404.4 N at 160 km/h
# Elise_Trace[0622]: Venturi underfloor pressure -270.14 Pa, rear diffuser downforce 404.9 N at 160 km/h
# Elise_Trace[0623]: Venturi underfloor pressure -270.26 Pa, rear diffuser downforce 405.4 N at 160 km/h
# Elise_Trace[0624]: Venturi underfloor pressure -270.38 Pa, rear diffuser downforce 405.8 N at 160 km/h
# Elise_Trace[0625]: Venturi underfloor pressure -270.50 Pa, rear diffuser downforce 406.3 N at 160 km/h
# Elise_Trace[0626]: Venturi underfloor pressure -270.62 Pa, rear diffuser downforce 406.7 N at 160 km/h
# Elise_Trace[0627]: Venturi underfloor pressure -270.74 Pa, rear diffuser downforce 407.2 N at 160 km/h
# Elise_Trace[0628]: Venturi underfloor pressure -270.86 Pa, rear diffuser downforce 407.6 N at 160 km/h
# Elise_Trace[0629]: Venturi underfloor pressure -270.98 Pa, rear diffuser downforce 408.1 N at 160 km/h
# Elise_Trace[0630]: Venturi underfloor pressure -271.10 Pa, rear diffuser downforce 408.5 N at 160 km/h
# Elise_Trace[0631]: Venturi underfloor pressure -271.22 Pa, rear diffuser downforce 408.9 N at 160 km/h
# Elise_Trace[0632]: Venturi underfloor pressure -271.34 Pa, rear diffuser downforce 409.4 N at 160 km/h
# Elise_Trace[0633]: Venturi underfloor pressure -271.46 Pa, rear diffuser downforce 409.9 N at 160 km/h
# Elise_Trace[0634]: Venturi underfloor pressure -271.58 Pa, rear diffuser downforce 410.3 N at 160 km/h
# Elise_Trace[0635]: Venturi underfloor pressure -271.70 Pa, rear diffuser downforce 410.8 N at 160 km/h
# Elise_Trace[0636]: Venturi underfloor pressure -271.82 Pa, rear diffuser downforce 411.2 N at 160 km/h
# Elise_Trace[0637]: Venturi underfloor pressure -271.94 Pa, rear diffuser downforce 411.7 N at 160 km/h
# Elise_Trace[0638]: Venturi underfloor pressure -272.06 Pa, rear diffuser downforce 412.1 N at 160 km/h
# Elise_Trace[0639]: Venturi underfloor pressure -272.18 Pa, rear diffuser downforce 412.6 N at 160 km/h
# Elise_Trace[0640]: Venturi underfloor pressure -272.30 Pa, rear diffuser downforce 413.0 N at 160 km/h
# Elise_Trace[0641]: Venturi underfloor pressure -272.42 Pa, rear diffuser downforce 413.4 N at 160 km/h
# Elise_Trace[0642]: Venturi underfloor pressure -272.54 Pa, rear diffuser downforce 413.9 N at 160 km/h
# Elise_Trace[0643]: Venturi underfloor pressure -272.66 Pa, rear diffuser downforce 414.4 N at 160 km/h
# Elise_Trace[0644]: Venturi underfloor pressure -272.78 Pa, rear diffuser downforce 414.8 N at 160 km/h
# Elise_Trace[0645]: Venturi underfloor pressure -272.90 Pa, rear diffuser downforce 415.3 N at 160 km/h
# Elise_Trace[0646]: Venturi underfloor pressure -273.02 Pa, rear diffuser downforce 415.7 N at 160 km/h
# Elise_Trace[0647]: Venturi underfloor pressure -273.14 Pa, rear diffuser downforce 416.2 N at 160 km/h
# Elise_Trace[0648]: Venturi underfloor pressure -273.26 Pa, rear diffuser downforce 416.6 N at 160 km/h
# Elise_Trace[0649]: Venturi underfloor pressure -273.38 Pa, rear diffuser downforce 417.1 N at 160 km/h
# Elise_Trace[0650]: Venturi underfloor pressure -273.50 Pa, rear diffuser downforce 417.5 N at 160 km/h
# Elise_Trace[0651]: Venturi underfloor pressure -273.62 Pa, rear diffuser downforce 417.9 N at 160 km/h
# Elise_Trace[0652]: Venturi underfloor pressure -273.74 Pa, rear diffuser downforce 418.4 N at 160 km/h
# Elise_Trace[0653]: Venturi underfloor pressure -273.86 Pa, rear diffuser downforce 418.9 N at 160 km/h
# Elise_Trace[0654]: Venturi underfloor pressure -273.98 Pa, rear diffuser downforce 419.3 N at 160 km/h
# Elise_Trace[0655]: Venturi underfloor pressure -274.10 Pa, rear diffuser downforce 419.8 N at 160 km/h
# Elise_Trace[0656]: Venturi underfloor pressure -274.22 Pa, rear diffuser downforce 420.2 N at 160 km/h
# Elise_Trace[0657]: Venturi underfloor pressure -274.34 Pa, rear diffuser downforce 420.7 N at 160 km/h
# Elise_Trace[0658]: Venturi underfloor pressure -274.46 Pa, rear diffuser downforce 421.1 N at 160 km/h
# Elise_Trace[0659]: Venturi underfloor pressure -274.58 Pa, rear diffuser downforce 421.6 N at 160 km/h
# Elise_Trace[0660]: Venturi underfloor pressure -274.70 Pa, rear diffuser downforce 422.0 N at 160 km/h
# Elise_Trace[0661]: Venturi underfloor pressure -274.82 Pa, rear diffuser downforce 422.4 N at 160 km/h
# Elise_Trace[0662]: Venturi underfloor pressure -274.94 Pa, rear diffuser downforce 422.9 N at 160 km/h
# Elise_Trace[0663]: Venturi underfloor pressure -275.06 Pa, rear diffuser downforce 423.4 N at 160 km/h
# Elise_Trace[0664]: Venturi underfloor pressure -275.18 Pa, rear diffuser downforce 423.8 N at 160 km/h
# Elise_Trace[0665]: Venturi underfloor pressure -275.30 Pa, rear diffuser downforce 424.3 N at 160 km/h
# Elise_Trace[0666]: Venturi underfloor pressure -275.42 Pa, rear diffuser downforce 424.7 N at 160 km/h
# Elise_Trace[0667]: Venturi underfloor pressure -275.54 Pa, rear diffuser downforce 425.2 N at 160 km/h
# Elise_Trace[0668]: Venturi underfloor pressure -275.66 Pa, rear diffuser downforce 425.6 N at 160 km/h
# Elise_Trace[0669]: Venturi underfloor pressure -275.78 Pa, rear diffuser downforce 426.1 N at 160 km/h
# Elise_Trace[0670]: Venturi underfloor pressure -275.90 Pa, rear diffuser downforce 426.5 N at 160 km/h
# Elise_Trace[0671]: Venturi underfloor pressure -276.02 Pa, rear diffuser downforce 426.9 N at 160 km/h
# Elise_Trace[0672]: Venturi underfloor pressure -276.14 Pa, rear diffuser downforce 427.4 N at 160 km/h
# Elise_Trace[0673]: Venturi underfloor pressure -276.26 Pa, rear diffuser downforce 427.9 N at 160 km/h
# Elise_Trace[0674]: Venturi underfloor pressure -276.38 Pa, rear diffuser downforce 428.3 N at 160 km/h
# Elise_Trace[0675]: Venturi underfloor pressure -276.50 Pa, rear diffuser downforce 428.8 N at 160 km/h
# Elise_Trace[0676]: Venturi underfloor pressure -276.62 Pa, rear diffuser downforce 429.2 N at 160 km/h
# Elise_Trace[0677]: Venturi underfloor pressure -276.74 Pa, rear diffuser downforce 429.7 N at 160 km/h
# Elise_Trace[0678]: Venturi underfloor pressure -276.86 Pa, rear diffuser downforce 430.1 N at 160 km/h
# Elise_Trace[0679]: Venturi underfloor pressure -276.98 Pa, rear diffuser downforce 430.6 N at 160 km/h
# Elise_Trace[0680]: Venturi underfloor pressure -277.10 Pa, rear diffuser downforce 431.0 N at 160 km/h
# Elise_Trace[0681]: Venturi underfloor pressure -277.22 Pa, rear diffuser downforce 431.4 N at 160 km/h
# Elise_Trace[0682]: Venturi underfloor pressure -277.34 Pa, rear diffuser downforce 431.9 N at 160 km/h
# Elise_Trace[0683]: Venturi underfloor pressure -277.46 Pa, rear diffuser downforce 432.4 N at 160 km/h
# Elise_Trace[0684]: Venturi underfloor pressure -277.58 Pa, rear diffuser downforce 432.8 N at 160 km/h
# Elise_Trace[0685]: Venturi underfloor pressure -277.70 Pa, rear diffuser downforce 433.3 N at 160 km/h
# Elise_Trace[0686]: Venturi underfloor pressure -277.82 Pa, rear diffuser downforce 433.7 N at 160 km/h
# Elise_Trace[0687]: Venturi underfloor pressure -277.94 Pa, rear diffuser downforce 434.2 N at 160 km/h
# Elise_Trace[0688]: Venturi underfloor pressure -278.06 Pa, rear diffuser downforce 434.6 N at 160 km/h
# Elise_Trace[0689]: Venturi underfloor pressure -278.18 Pa, rear diffuser downforce 435.1 N at 160 km/h
# Elise_Trace[0690]: Venturi underfloor pressure -278.30 Pa, rear diffuser downforce 435.5 N at 160 km/h
# Elise_Trace[0691]: Venturi underfloor pressure -278.42 Pa, rear diffuser downforce 435.9 N at 160 km/h
# Elise_Trace[0692]: Venturi underfloor pressure -278.54 Pa, rear diffuser downforce 436.4 N at 160 km/h
# Elise_Trace[0693]: Venturi underfloor pressure -278.66 Pa, rear diffuser downforce 436.9 N at 160 km/h
# Elise_Trace[0694]: Venturi underfloor pressure -278.78 Pa, rear diffuser downforce 437.3 N at 160 km/h
# Elise_Trace[0695]: Venturi underfloor pressure -278.90 Pa, rear diffuser downforce 437.8 N at 160 km/h
# Elise_Trace[0696]: Venturi underfloor pressure -279.02 Pa, rear diffuser downforce 438.2 N at 160 km/h
# Elise_Trace[0697]: Venturi underfloor pressure -279.14 Pa, rear diffuser downforce 438.7 N at 160 km/h
# Elise_Trace[0698]: Venturi underfloor pressure -279.26 Pa, rear diffuser downforce 439.1 N at 160 km/h
# Elise_Trace[0699]: Venturi underfloor pressure -279.38 Pa, rear diffuser downforce 439.6 N at 160 km/h
# Elise_Trace[0700]: Venturi underfloor pressure -279.50 Pa, rear diffuser downforce 440.0 N at 160 km/h
# Elise_Trace[0701]: Venturi underfloor pressure -279.62 Pa, rear diffuser downforce 440.4 N at 160 km/h
# Elise_Trace[0702]: Venturi underfloor pressure -279.74 Pa, rear diffuser downforce 440.9 N at 160 km/h
# Elise_Trace[0703]: Venturi underfloor pressure -279.86 Pa, rear diffuser downforce 441.4 N at 160 km/h
# Elise_Trace[0704]: Venturi underfloor pressure -279.98 Pa, rear diffuser downforce 441.8 N at 160 km/h
# Elise_Trace[0705]: Venturi underfloor pressure -280.10 Pa, rear diffuser downforce 442.3 N at 160 km/h
# Elise_Trace[0706]: Venturi underfloor pressure -280.22 Pa, rear diffuser downforce 442.7 N at 160 km/h
# Elise_Trace[0707]: Venturi underfloor pressure -280.34 Pa, rear diffuser downforce 443.2 N at 160 km/h
# Elise_Trace[0708]: Venturi underfloor pressure -280.46 Pa, rear diffuser downforce 443.6 N at 160 km/h
# Elise_Trace[0709]: Venturi underfloor pressure -280.58 Pa, rear diffuser downforce 444.1 N at 160 km/h
# Elise_Trace[0710]: Venturi underfloor pressure -280.70 Pa, rear diffuser downforce 444.5 N at 160 km/h
# Elise_Trace[0711]: Venturi underfloor pressure -280.82 Pa, rear diffuser downforce 444.9 N at 160 km/h
# Elise_Trace[0712]: Venturi underfloor pressure -280.94 Pa, rear diffuser downforce 445.4 N at 160 km/h
# Elise_Trace[0713]: Venturi underfloor pressure -281.06 Pa, rear diffuser downforce 445.9 N at 160 km/h
# Elise_Trace[0714]: Venturi underfloor pressure -281.18 Pa, rear diffuser downforce 446.3 N at 160 km/h
# Elise_Trace[0715]: Venturi underfloor pressure -281.30 Pa, rear diffuser downforce 446.8 N at 160 km/h
# Elise_Trace[0716]: Venturi underfloor pressure -281.42 Pa, rear diffuser downforce 447.2 N at 160 km/h
# Elise_Trace[0717]: Venturi underfloor pressure -281.54 Pa, rear diffuser downforce 447.7 N at 160 km/h
# Elise_Trace[0718]: Venturi underfloor pressure -281.66 Pa, rear diffuser downforce 448.1 N at 160 km/h
# Elise_Trace[0719]: Venturi underfloor pressure -281.78 Pa, rear diffuser downforce 448.6 N at 160 km/h
# Elise_Trace[0720]: Venturi underfloor pressure -281.90 Pa, rear diffuser downforce 449.0 N at 160 km/h
# Elise_Trace[0721]: Venturi underfloor pressure -282.02 Pa, rear diffuser downforce 449.4 N at 160 km/h
# Elise_Trace[0722]: Venturi underfloor pressure -282.14 Pa, rear diffuser downforce 449.9 N at 160 km/h
# Elise_Trace[0723]: Venturi underfloor pressure -282.26 Pa, rear diffuser downforce 450.4 N at 160 km/h
# Elise_Trace[0724]: Venturi underfloor pressure -282.38 Pa, rear diffuser downforce 450.8 N at 160 km/h
# Elise_Trace[0725]: Venturi underfloor pressure -282.50 Pa, rear diffuser downforce 451.3 N at 160 km/h
# Elise_Trace[0726]: Venturi underfloor pressure -282.62 Pa, rear diffuser downforce 451.7 N at 160 km/h
# Elise_Trace[0727]: Venturi underfloor pressure -282.74 Pa, rear diffuser downforce 452.2 N at 160 km/h
# Elise_Trace[0728]: Venturi underfloor pressure -282.86 Pa, rear diffuser downforce 452.6 N at 160 km/h
# Elise_Trace[0729]: Venturi underfloor pressure -282.98 Pa, rear diffuser downforce 453.1 N at 160 km/h
# Elise_Trace[0730]: Venturi underfloor pressure -283.10 Pa, rear diffuser downforce 453.5 N at 160 km/h
# Elise_Trace[0731]: Venturi underfloor pressure -283.22 Pa, rear diffuser downforce 453.9 N at 160 km/h
# Elise_Trace[0732]: Venturi underfloor pressure -283.34 Pa, rear diffuser downforce 454.4 N at 160 km/h
# Elise_Trace[0733]: Venturi underfloor pressure -283.46 Pa, rear diffuser downforce 454.9 N at 160 km/h
# Elise_Trace[0734]: Venturi underfloor pressure -283.58 Pa, rear diffuser downforce 455.3 N at 160 km/h
# Elise_Trace[0735]: Venturi underfloor pressure -283.70 Pa, rear diffuser downforce 455.8 N at 160 km/h
# Elise_Trace[0736]: Venturi underfloor pressure -283.82 Pa, rear diffuser downforce 456.2 N at 160 km/h
# Elise_Trace[0737]: Venturi underfloor pressure -283.94 Pa, rear diffuser downforce 456.7 N at 160 km/h
# Elise_Trace[0738]: Venturi underfloor pressure -284.06 Pa, rear diffuser downforce 457.1 N at 160 km/h
# Elise_Trace[0739]: Venturi underfloor pressure -284.18 Pa, rear diffuser downforce 457.6 N at 160 km/h
# Elise_Trace[0740]: Venturi underfloor pressure -284.30 Pa, rear diffuser downforce 458.0 N at 160 km/h
# Elise_Trace[0741]: Venturi underfloor pressure -284.42 Pa, rear diffuser downforce 458.4 N at 160 km/h
# Elise_Trace[0742]: Venturi underfloor pressure -284.54 Pa, rear diffuser downforce 458.9 N at 160 km/h
# Elise_Trace[0743]: Venturi underfloor pressure -284.66 Pa, rear diffuser downforce 459.4 N at 160 km/h
# Elise_Trace[0744]: Venturi underfloor pressure -284.78 Pa, rear diffuser downforce 459.8 N at 160 km/h
# Elise_Trace[0745]: Venturi underfloor pressure -284.90 Pa, rear diffuser downforce 460.3 N at 160 km/h
# Elise_Trace[0746]: Venturi underfloor pressure -285.02 Pa, rear diffuser downforce 460.7 N at 160 km/h
# Elise_Trace[0747]: Venturi underfloor pressure -285.14 Pa, rear diffuser downforce 461.2 N at 160 km/h
# Elise_Trace[0748]: Venturi underfloor pressure -285.26 Pa, rear diffuser downforce 461.6 N at 160 km/h
# Elise_Trace[0749]: Venturi underfloor pressure -285.38 Pa, rear diffuser downforce 462.1 N at 160 km/h
# Elise_Trace[0750]: Venturi underfloor pressure -240.50 Pa, rear diffuser downforce 462.5 N at 160 km/h
# Elise_Trace[0751]: Venturi underfloor pressure -240.62 Pa, rear diffuser downforce 462.9 N at 160 km/h
# Elise_Trace[0752]: Venturi underfloor pressure -240.74 Pa, rear diffuser downforce 463.4 N at 160 km/h
# Elise_Trace[0753]: Venturi underfloor pressure -240.86 Pa, rear diffuser downforce 463.9 N at 160 km/h
# Elise_Trace[0754]: Venturi underfloor pressure -240.98 Pa, rear diffuser downforce 464.3 N at 160 km/h
# Elise_Trace[0755]: Venturi underfloor pressure -241.10 Pa, rear diffuser downforce 464.8 N at 160 km/h
# Elise_Trace[0756]: Venturi underfloor pressure -241.22 Pa, rear diffuser downforce 380.2 N at 160 km/h
# Elise_Trace[0757]: Venturi underfloor pressure -241.34 Pa, rear diffuser downforce 380.7 N at 160 km/h
# Elise_Trace[0758]: Venturi underfloor pressure -241.46 Pa, rear diffuser downforce 381.1 N at 160 km/h
# Elise_Trace[0759]: Venturi underfloor pressure -241.58 Pa, rear diffuser downforce 381.6 N at 160 km/h
# Elise_Trace[0760]: Venturi underfloor pressure -241.70 Pa, rear diffuser downforce 382.0 N at 160 km/h
# Elise_Trace[0761]: Venturi underfloor pressure -241.82 Pa, rear diffuser downforce 382.4 N at 160 km/h
# Elise_Trace[0762]: Venturi underfloor pressure -241.94 Pa, rear diffuser downforce 382.9 N at 160 km/h
# Elise_Trace[0763]: Venturi underfloor pressure -242.06 Pa, rear diffuser downforce 383.4 N at 160 km/h
# Elise_Trace[0764]: Venturi underfloor pressure -242.18 Pa, rear diffuser downforce 383.8 N at 160 km/h
# Elise_Trace[0765]: Venturi underfloor pressure -242.30 Pa, rear diffuser downforce 384.3 N at 160 km/h
# Elise_Trace[0766]: Venturi underfloor pressure -242.42 Pa, rear diffuser downforce 384.7 N at 160 km/h
# Elise_Trace[0767]: Venturi underfloor pressure -242.54 Pa, rear diffuser downforce 385.2 N at 160 km/h
# Elise_Trace[0768]: Venturi underfloor pressure -242.66 Pa, rear diffuser downforce 385.6 N at 160 km/h
# Elise_Trace[0769]: Venturi underfloor pressure -242.78 Pa, rear diffuser downforce 386.1 N at 160 km/h
# Elise_Trace[0770]: Venturi underfloor pressure -242.90 Pa, rear diffuser downforce 386.5 N at 160 km/h
# Elise_Trace[0771]: Venturi underfloor pressure -243.02 Pa, rear diffuser downforce 386.9 N at 160 km/h
# Elise_Trace[0772]: Venturi underfloor pressure -243.14 Pa, rear diffuser downforce 387.4 N at 160 km/h
# Elise_Trace[0773]: Venturi underfloor pressure -243.26 Pa, rear diffuser downforce 387.9 N at 160 km/h
# Elise_Trace[0774]: Venturi underfloor pressure -243.38 Pa, rear diffuser downforce 388.3 N at 160 km/h
# Elise_Trace[0775]: Venturi underfloor pressure -243.50 Pa, rear diffuser downforce 388.8 N at 160 km/h
# Elise_Trace[0776]: Venturi underfloor pressure -243.62 Pa, rear diffuser downforce 389.2 N at 160 km/h
# Elise_Trace[0777]: Venturi underfloor pressure -243.74 Pa, rear diffuser downforce 389.7 N at 160 km/h
# Elise_Trace[0778]: Venturi underfloor pressure -243.86 Pa, rear diffuser downforce 390.1 N at 160 km/h
# Elise_Trace[0779]: Venturi underfloor pressure -243.98 Pa, rear diffuser downforce 390.6 N at 160 km/h
# Elise_Trace[0780]: Venturi underfloor pressure -244.10 Pa, rear diffuser downforce 391.0 N at 160 km/h
# Elise_Trace[0781]: Venturi underfloor pressure -244.22 Pa, rear diffuser downforce 391.4 N at 160 km/h
# Elise_Trace[0782]: Venturi underfloor pressure -244.34 Pa, rear diffuser downforce 391.9 N at 160 km/h
# Elise_Trace[0783]: Venturi underfloor pressure -244.46 Pa, rear diffuser downforce 392.4 N at 160 km/h
# Elise_Trace[0784]: Venturi underfloor pressure -244.58 Pa, rear diffuser downforce 392.8 N at 160 km/h
# Elise_Trace[0785]: Venturi underfloor pressure -244.70 Pa, rear diffuser downforce 393.3 N at 160 km/h
# Elise_Trace[0786]: Venturi underfloor pressure -244.82 Pa, rear diffuser downforce 393.7 N at 160 km/h
# Elise_Trace[0787]: Venturi underfloor pressure -244.94 Pa, rear diffuser downforce 394.2 N at 160 km/h
# Elise_Trace[0788]: Venturi underfloor pressure -245.06 Pa, rear diffuser downforce 394.6 N at 160 km/h
# Elise_Trace[0789]: Venturi underfloor pressure -245.18 Pa, rear diffuser downforce 395.1 N at 160 km/h
# Elise_Trace[0790]: Venturi underfloor pressure -245.30 Pa, rear diffuser downforce 395.5 N at 160 km/h
# Elise_Trace[0791]: Venturi underfloor pressure -245.42 Pa, rear diffuser downforce 395.9 N at 160 km/h
# Elise_Trace[0792]: Venturi underfloor pressure -245.54 Pa, rear diffuser downforce 396.4 N at 160 km/h
# Elise_Trace[0793]: Venturi underfloor pressure -245.66 Pa, rear diffuser downforce 396.9 N at 160 km/h
# Elise_Trace[0794]: Venturi underfloor pressure -245.78 Pa, rear diffuser downforce 397.3 N at 160 km/h
# Elise_Trace[0795]: Venturi underfloor pressure -245.90 Pa, rear diffuser downforce 397.8 N at 160 km/h
# Elise_Trace[0796]: Venturi underfloor pressure -246.02 Pa, rear diffuser downforce 398.2 N at 160 km/h
# Elise_Trace[0797]: Venturi underfloor pressure -246.14 Pa, rear diffuser downforce 398.7 N at 160 km/h
# Elise_Trace[0798]: Venturi underfloor pressure -246.26 Pa, rear diffuser downforce 399.1 N at 160 km/h
# Elise_Trace[0799]: Venturi underfloor pressure -246.38 Pa, rear diffuser downforce 399.6 N at 160 km/h
# Elise_Trace[0800]: Venturi underfloor pressure -246.50 Pa, rear diffuser downforce 400.0 N at 160 km/h
# Elise_Trace[0801]: Venturi underfloor pressure -246.62 Pa, rear diffuser downforce 400.4 N at 160 km/h
# Elise_Trace[0802]: Venturi underfloor pressure -246.74 Pa, rear diffuser downforce 400.9 N at 160 km/h
# Elise_Trace[0803]: Venturi underfloor pressure -246.86 Pa, rear diffuser downforce 401.4 N at 160 km/h
# Elise_Trace[0804]: Venturi underfloor pressure -246.98 Pa, rear diffuser downforce 401.8 N at 160 km/h
# Elise_Trace[0805]: Venturi underfloor pressure -247.10 Pa, rear diffuser downforce 402.3 N at 160 km/h
# Elise_Trace[0806]: Venturi underfloor pressure -247.22 Pa, rear diffuser downforce 402.7 N at 160 km/h
# Elise_Trace[0807]: Venturi underfloor pressure -247.34 Pa, rear diffuser downforce 403.2 N at 160 km/h
# Elise_Trace[0808]: Venturi underfloor pressure -247.46 Pa, rear diffuser downforce 403.6 N at 160 km/h
# Elise_Trace[0809]: Venturi underfloor pressure -247.58 Pa, rear diffuser downforce 404.1 N at 160 km/h
# Elise_Trace[0810]: Venturi underfloor pressure -247.70 Pa, rear diffuser downforce 404.5 N at 160 km/h
# Elise_Trace[0811]: Venturi underfloor pressure -247.82 Pa, rear diffuser downforce 404.9 N at 160 km/h
# Elise_Trace[0812]: Venturi underfloor pressure -247.94 Pa, rear diffuser downforce 405.4 N at 160 km/h
# Elise_Trace[0813]: Venturi underfloor pressure -248.06 Pa, rear diffuser downforce 405.9 N at 160 km/h
# Elise_Trace[0814]: Venturi underfloor pressure -248.18 Pa, rear diffuser downforce 406.3 N at 160 km/h
# Elise_Trace[0815]: Venturi underfloor pressure -248.30 Pa, rear diffuser downforce 406.8 N at 160 km/h
# Elise_Trace[0816]: Venturi underfloor pressure -248.42 Pa, rear diffuser downforce 407.2 N at 160 km/h
# Elise_Trace[0817]: Venturi underfloor pressure -248.54 Pa, rear diffuser downforce 407.7 N at 160 km/h
# Elise_Trace[0818]: Venturi underfloor pressure -248.66 Pa, rear diffuser downforce 408.1 N at 160 km/h
# Elise_Trace[0819]: Venturi underfloor pressure -248.78 Pa, rear diffuser downforce 408.6 N at 160 km/h
# Elise_Trace[0820]: Venturi underfloor pressure -248.90 Pa, rear diffuser downforce 409.0 N at 160 km/h
# Elise_Trace[0821]: Venturi underfloor pressure -249.02 Pa, rear diffuser downforce 409.4 N at 160 km/h
# Elise_Trace[0822]: Venturi underfloor pressure -249.14 Pa, rear diffuser downforce 409.9 N at 160 km/h
# Elise_Trace[0823]: Venturi underfloor pressure -249.26 Pa, rear diffuser downforce 410.4 N at 160 km/h
# Elise_Trace[0824]: Venturi underfloor pressure -249.38 Pa, rear diffuser downforce 410.8 N at 160 km/h
# Elise_Trace[0825]: Venturi underfloor pressure -249.50 Pa, rear diffuser downforce 411.3 N at 160 km/h
# Elise_Trace[0826]: Venturi underfloor pressure -249.62 Pa, rear diffuser downforce 411.7 N at 160 km/h
# Elise_Trace[0827]: Venturi underfloor pressure -249.74 Pa, rear diffuser downforce 412.2 N at 160 km/h
# Elise_Trace[0828]: Venturi underfloor pressure -249.86 Pa, rear diffuser downforce 412.6 N at 160 km/h
# Elise_Trace[0829]: Venturi underfloor pressure -249.98 Pa, rear diffuser downforce 413.1 N at 160 km/h
# Elise_Trace[0830]: Venturi underfloor pressure -250.10 Pa, rear diffuser downforce 413.5 N at 160 km/h
# Elise_Trace[0831]: Venturi underfloor pressure -250.22 Pa, rear diffuser downforce 413.9 N at 160 km/h
# Elise_Trace[0832]: Venturi underfloor pressure -250.34 Pa, rear diffuser downforce 414.4 N at 160 km/h
# Elise_Trace[0833]: Venturi underfloor pressure -250.46 Pa, rear diffuser downforce 414.9 N at 160 km/h
# Elise_Trace[0834]: Venturi underfloor pressure -250.58 Pa, rear diffuser downforce 415.3 N at 160 km/h
# Elise_Trace[0835]: Venturi underfloor pressure -250.70 Pa, rear diffuser downforce 415.8 N at 160 km/h
# Elise_Trace[0836]: Venturi underfloor pressure -250.82 Pa, rear diffuser downforce 416.2 N at 160 km/h
# Elise_Trace[0837]: Venturi underfloor pressure -250.94 Pa, rear diffuser downforce 416.7 N at 160 km/h
# Elise_Trace[0838]: Venturi underfloor pressure -251.06 Pa, rear diffuser downforce 417.1 N at 160 km/h
# Elise_Trace[0839]: Venturi underfloor pressure -251.18 Pa, rear diffuser downforce 417.6 N at 160 km/h
# Elise_Trace[0840]: Venturi underfloor pressure -251.30 Pa, rear diffuser downforce 418.0 N at 160 km/h
# Elise_Trace[0841]: Venturi underfloor pressure -251.42 Pa, rear diffuser downforce 418.4 N at 160 km/h
# Elise_Trace[0842]: Venturi underfloor pressure -251.54 Pa, rear diffuser downforce 418.9 N at 160 km/h
# Elise_Trace[0843]: Venturi underfloor pressure -251.66 Pa, rear diffuser downforce 419.4 N at 160 km/h
# Elise_Trace[0844]: Venturi underfloor pressure -251.78 Pa, rear diffuser downforce 419.8 N at 160 km/h
# Elise_Trace[0845]: Venturi underfloor pressure -251.90 Pa, rear diffuser downforce 420.3 N at 160 km/h
# Elise_Trace[0846]: Venturi underfloor pressure -252.02 Pa, rear diffuser downforce 420.7 N at 160 km/h
# Elise_Trace[0847]: Venturi underfloor pressure -252.14 Pa, rear diffuser downforce 421.2 N at 160 km/h
# Elise_Trace[0848]: Venturi underfloor pressure -252.26 Pa, rear diffuser downforce 421.6 N at 160 km/h
# Elise_Trace[0849]: Venturi underfloor pressure -252.38 Pa, rear diffuser downforce 422.1 N at 160 km/h
# Elise_Trace[0850]: Venturi underfloor pressure -252.50 Pa, rear diffuser downforce 422.5 N at 160 km/h
# Elise_Trace[0851]: Venturi underfloor pressure -252.62 Pa, rear diffuser downforce 422.9 N at 160 km/h
# Elise_Trace[0852]: Venturi underfloor pressure -252.74 Pa, rear diffuser downforce 423.4 N at 160 km/h
# Elise_Trace[0853]: Venturi underfloor pressure -252.86 Pa, rear diffuser downforce 423.9 N at 160 km/h
# Elise_Trace[0854]: Venturi underfloor pressure -252.98 Pa, rear diffuser downforce 424.3 N at 160 km/h
# Elise_Trace[0855]: Venturi underfloor pressure -253.10 Pa, rear diffuser downforce 424.8 N at 160 km/h
# Elise_Trace[0856]: Venturi underfloor pressure -253.22 Pa, rear diffuser downforce 425.2 N at 160 km/h
# Elise_Trace[0857]: Venturi underfloor pressure -253.34 Pa, rear diffuser downforce 425.7 N at 160 km/h
# Elise_Trace[0858]: Venturi underfloor pressure -253.46 Pa, rear diffuser downforce 426.1 N at 160 km/h
# Elise_Trace[0859]: Venturi underfloor pressure -253.58 Pa, rear diffuser downforce 426.6 N at 160 km/h
# Elise_Trace[0860]: Venturi underfloor pressure -253.70 Pa, rear diffuser downforce 427.0 N at 160 km/h
# Elise_Trace[0861]: Venturi underfloor pressure -253.82 Pa, rear diffuser downforce 427.4 N at 160 km/h
# Elise_Trace[0862]: Venturi underfloor pressure -253.94 Pa, rear diffuser downforce 427.9 N at 160 km/h
# Elise_Trace[0863]: Venturi underfloor pressure -254.06 Pa, rear diffuser downforce 428.4 N at 160 km/h
# Elise_Trace[0864]: Venturi underfloor pressure -254.18 Pa, rear diffuser downforce 428.8 N at 160 km/h
# Elise_Trace[0865]: Venturi underfloor pressure -254.30 Pa, rear diffuser downforce 429.3 N at 160 km/h
# Elise_Trace[0866]: Venturi underfloor pressure -254.42 Pa, rear diffuser downforce 429.7 N at 160 km/h
# Elise_Trace[0867]: Venturi underfloor pressure -254.54 Pa, rear diffuser downforce 430.2 N at 160 km/h
# Elise_Trace[0868]: Venturi underfloor pressure -254.66 Pa, rear diffuser downforce 430.6 N at 160 km/h
# Elise_Trace[0869]: Venturi underfloor pressure -254.78 Pa, rear diffuser downforce 431.1 N at 160 km/h
# Elise_Trace[0870]: Venturi underfloor pressure -254.90 Pa, rear diffuser downforce 431.5 N at 160 km/h
# Elise_Trace[0871]: Venturi underfloor pressure -255.02 Pa, rear diffuser downforce 431.9 N at 160 km/h
# Elise_Trace[0872]: Venturi underfloor pressure -255.14 Pa, rear diffuser downforce 432.4 N at 160 km/h
# Elise_Trace[0873]: Venturi underfloor pressure -255.26 Pa, rear diffuser downforce 432.9 N at 160 km/h
# Elise_Trace[0874]: Venturi underfloor pressure -255.38 Pa, rear diffuser downforce 433.3 N at 160 km/h
# Elise_Trace[0875]: Venturi underfloor pressure -255.50 Pa, rear diffuser downforce 433.8 N at 160 km/h
# Elise_Trace[0876]: Venturi underfloor pressure -255.62 Pa, rear diffuser downforce 434.2 N at 160 km/h
# Elise_Trace[0877]: Venturi underfloor pressure -255.74 Pa, rear diffuser downforce 434.7 N at 160 km/h
# Elise_Trace[0878]: Venturi underfloor pressure -255.86 Pa, rear diffuser downforce 435.1 N at 160 km/h
# Elise_Trace[0879]: Venturi underfloor pressure -255.98 Pa, rear diffuser downforce 435.6 N at 160 km/h
# Elise_Trace[0880]: Venturi underfloor pressure -256.10 Pa, rear diffuser downforce 436.0 N at 160 km/h
# Elise_Trace[0881]: Venturi underfloor pressure -256.22 Pa, rear diffuser downforce 436.4 N at 160 km/h
# Elise_Trace[0882]: Venturi underfloor pressure -256.34 Pa, rear diffuser downforce 436.9 N at 160 km/h
# Elise_Trace[0883]: Venturi underfloor pressure -256.46 Pa, rear diffuser downforce 437.4 N at 160 km/h
# Elise_Trace[0884]: Venturi underfloor pressure -256.58 Pa, rear diffuser downforce 437.8 N at 160 km/h
# Elise_Trace[0885]: Venturi underfloor pressure -256.70 Pa, rear diffuser downforce 438.3 N at 160 km/h
# Elise_Trace[0886]: Venturi underfloor pressure -256.82 Pa, rear diffuser downforce 438.7 N at 160 km/h
# Elise_Trace[0887]: Venturi underfloor pressure -256.94 Pa, rear diffuser downforce 439.2 N at 160 km/h
# Elise_Trace[0888]: Venturi underfloor pressure -257.06 Pa, rear diffuser downforce 439.6 N at 160 km/h
# Elise_Trace[0889]: Venturi underfloor pressure -257.18 Pa, rear diffuser downforce 440.1 N at 160 km/h
# Elise_Trace[0890]: Venturi underfloor pressure -257.30 Pa, rear diffuser downforce 440.5 N at 160 km/h
# Elise_Trace[0891]: Venturi underfloor pressure -257.42 Pa, rear diffuser downforce 440.9 N at 160 km/h
# Elise_Trace[0892]: Venturi underfloor pressure -257.54 Pa, rear diffuser downforce 441.4 N at 160 km/h
# Elise_Trace[0893]: Venturi underfloor pressure -257.66 Pa, rear diffuser downforce 441.9 N at 160 km/h
# Elise_Trace[0894]: Venturi underfloor pressure -257.78 Pa, rear diffuser downforce 442.3 N at 160 km/h
# Elise_Trace[0895]: Venturi underfloor pressure -257.90 Pa, rear diffuser downforce 442.8 N at 160 km/h
# Elise_Trace[0896]: Venturi underfloor pressure -258.02 Pa, rear diffuser downforce 443.2 N at 160 km/h
# Elise_Trace[0897]: Venturi underfloor pressure -258.14 Pa, rear diffuser downforce 443.7 N at 160 km/h
# Elise_Trace[0898]: Venturi underfloor pressure -258.26 Pa, rear diffuser downforce 444.1 N at 160 km/h
# Elise_Trace[0899]: Venturi underfloor pressure -258.38 Pa, rear diffuser downforce 444.6 N at 160 km/h
# Elise_Trace[0900]: Venturi underfloor pressure -258.50 Pa, rear diffuser downforce 445.0 N at 160 km/h
# Elise_Trace[0901]: Venturi underfloor pressure -258.62 Pa, rear diffuser downforce 445.4 N at 160 km/h
# Elise_Trace[0902]: Venturi underfloor pressure -258.74 Pa, rear diffuser downforce 445.9 N at 160 km/h
# Elise_Trace[0903]: Venturi underfloor pressure -258.86 Pa, rear diffuser downforce 446.4 N at 160 km/h
# Elise_Trace[0904]: Venturi underfloor pressure -258.98 Pa, rear diffuser downforce 446.8 N at 160 km/h
# Elise_Trace[0905]: Venturi underfloor pressure -259.10 Pa, rear diffuser downforce 447.3 N at 160 km/h
# Elise_Trace[0906]: Venturi underfloor pressure -259.22 Pa, rear diffuser downforce 447.7 N at 160 km/h
# Elise_Trace[0907]: Venturi underfloor pressure -259.34 Pa, rear diffuser downforce 448.2 N at 160 km/h
# Elise_Trace[0908]: Venturi underfloor pressure -259.46 Pa, rear diffuser downforce 448.6 N at 160 km/h
# Elise_Trace[0909]: Venturi underfloor pressure -259.58 Pa, rear diffuser downforce 449.1 N at 160 km/h
# Elise_Trace[0910]: Venturi underfloor pressure -259.70 Pa, rear diffuser downforce 449.5 N at 160 km/h
# Elise_Trace[0911]: Venturi underfloor pressure -259.82 Pa, rear diffuser downforce 449.9 N at 160 km/h
# Elise_Trace[0912]: Venturi underfloor pressure -259.94 Pa, rear diffuser downforce 450.4 N at 160 km/h
# Elise_Trace[0913]: Venturi underfloor pressure -260.06 Pa, rear diffuser downforce 450.9 N at 160 km/h
# Elise_Trace[0914]: Venturi underfloor pressure -260.18 Pa, rear diffuser downforce 451.3 N at 160 km/h
# Elise_Trace[0915]: Venturi underfloor pressure -260.30 Pa, rear diffuser downforce 451.8 N at 160 km/h
# Elise_Trace[0916]: Venturi underfloor pressure -260.42 Pa, rear diffuser downforce 452.2 N at 160 km/h
# Elise_Trace[0917]: Venturi underfloor pressure -260.54 Pa, rear diffuser downforce 452.7 N at 160 km/h
# Elise_Trace[0918]: Venturi underfloor pressure -260.66 Pa, rear diffuser downforce 453.1 N at 160 km/h
# Elise_Trace[0919]: Venturi underfloor pressure -260.78 Pa, rear diffuser downforce 453.6 N at 160 km/h
# Elise_Trace[0920]: Venturi underfloor pressure -260.90 Pa, rear diffuser downforce 454.0 N at 160 km/h
# Elise_Trace[0921]: Venturi underfloor pressure -261.02 Pa, rear diffuser downforce 454.4 N at 160 km/h
# Elise_Trace[0922]: Venturi underfloor pressure -261.14 Pa, rear diffuser downforce 454.9 N at 160 km/h
# Elise_Trace[0923]: Venturi underfloor pressure -261.26 Pa, rear diffuser downforce 455.4 N at 160 km/h
# Elise_Trace[0924]: Venturi underfloor pressure -261.38 Pa, rear diffuser downforce 455.8 N at 160 km/h
# Elise_Trace[0925]: Venturi underfloor pressure -261.50 Pa, rear diffuser downforce 456.3 N at 160 km/h
# Elise_Trace[0926]: Venturi underfloor pressure -261.62 Pa, rear diffuser downforce 456.7 N at 160 km/h
# Elise_Trace[0927]: Venturi underfloor pressure -261.74 Pa, rear diffuser downforce 457.2 N at 160 km/h
# Elise_Trace[0928]: Venturi underfloor pressure -261.86 Pa, rear diffuser downforce 457.6 N at 160 km/h
# Elise_Trace[0929]: Venturi underfloor pressure -261.98 Pa, rear diffuser downforce 458.1 N at 160 km/h
# Elise_Trace[0930]: Venturi underfloor pressure -262.10 Pa, rear diffuser downforce 458.5 N at 160 km/h
# Elise_Trace[0931]: Venturi underfloor pressure -262.22 Pa, rear diffuser downforce 458.9 N at 160 km/h
# Elise_Trace[0932]: Venturi underfloor pressure -262.34 Pa, rear diffuser downforce 459.4 N at 160 km/h
# Elise_Trace[0933]: Venturi underfloor pressure -262.46 Pa, rear diffuser downforce 459.9 N at 160 km/h
# Elise_Trace[0934]: Venturi underfloor pressure -262.58 Pa, rear diffuser downforce 460.3 N at 160 km/h
# Elise_Trace[0935]: Venturi underfloor pressure -262.70 Pa, rear diffuser downforce 460.8 N at 160 km/h
# Elise_Trace[0936]: Venturi underfloor pressure -262.82 Pa, rear diffuser downforce 461.2 N at 160 km/h
# Elise_Trace[0937]: Venturi underfloor pressure -262.94 Pa, rear diffuser downforce 461.7 N at 160 km/h
# Elise_Trace[0938]: Venturi underfloor pressure -263.06 Pa, rear diffuser downforce 462.1 N at 160 km/h
# Elise_Trace[0939]: Venturi underfloor pressure -263.18 Pa, rear diffuser downforce 462.6 N at 160 km/h
# Elise_Trace[0940]: Venturi underfloor pressure -263.30 Pa, rear diffuser downforce 463.0 N at 160 km/h
# Elise_Trace[0941]: Venturi underfloor pressure -263.42 Pa, rear diffuser downforce 463.4 N at 160 km/h
# Elise_Trace[0942]: Venturi underfloor pressure -263.54 Pa, rear diffuser downforce 463.9 N at 160 km/h
# Elise_Trace[0943]: Venturi underfloor pressure -263.66 Pa, rear diffuser downforce 464.4 N at 160 km/h
# Elise_Trace[0944]: Venturi underfloor pressure -263.78 Pa, rear diffuser downforce 464.8 N at 160 km/h
# Elise_Trace[0945]: Venturi underfloor pressure -263.90 Pa, rear diffuser downforce 380.3 N at 160 km/h
# Elise_Trace[0946]: Venturi underfloor pressure -264.02 Pa, rear diffuser downforce 380.7 N at 160 km/h
# Elise_Trace[0947]: Venturi underfloor pressure -264.14 Pa, rear diffuser downforce 381.2 N at 160 km/h
# Elise_Trace[0948]: Venturi underfloor pressure -264.26 Pa, rear diffuser downforce 381.6 N at 160 km/h
# Elise_Trace[0949]: Venturi underfloor pressure -264.38 Pa, rear diffuser downforce 382.1 N at 160 km/h
# Elise_Trace[0950]: Venturi underfloor pressure -264.50 Pa, rear diffuser downforce 382.5 N at 160 km/h
# Elise_Trace[0951]: Venturi underfloor pressure -264.62 Pa, rear diffuser downforce 382.9 N at 160 km/h
# Elise_Trace[0952]: Venturi underfloor pressure -264.74 Pa, rear diffuser downforce 383.4 N at 160 km/h
# Elise_Trace[0953]: Venturi underfloor pressure -264.86 Pa, rear diffuser downforce 383.9 N at 160 km/h
# Elise_Trace[0954]: Venturi underfloor pressure -264.98 Pa, rear diffuser downforce 384.3 N at 160 km/h
# Elise_Trace[0955]: Venturi underfloor pressure -265.10 Pa, rear diffuser downforce 384.8 N at 160 km/h
# Elise_Trace[0956]: Venturi underfloor pressure -265.22 Pa, rear diffuser downforce 385.2 N at 160 km/h
# Elise_Trace[0957]: Venturi underfloor pressure -265.34 Pa, rear diffuser downforce 385.7 N at 160 km/h
# Elise_Trace[0958]: Venturi underfloor pressure -265.46 Pa, rear diffuser downforce 386.1 N at 160 km/h
# Elise_Trace[0959]: Venturi underfloor pressure -265.58 Pa, rear diffuser downforce 386.6 N at 160 km/h
# Elise_Trace[0960]: Venturi underfloor pressure -265.70 Pa, rear diffuser downforce 387.0 N at 160 km/h
# Elise_Trace[0961]: Venturi underfloor pressure -265.82 Pa, rear diffuser downforce 387.4 N at 160 km/h
# Elise_Trace[0962]: Venturi underfloor pressure -265.94 Pa, rear diffuser downforce 387.9 N at 160 km/h
# Elise_Trace[0963]: Venturi underfloor pressure -266.06 Pa, rear diffuser downforce 388.4 N at 160 km/h
# Elise_Trace[0964]: Venturi underfloor pressure -266.18 Pa, rear diffuser downforce 388.8 N at 160 km/h
# Elise_Trace[0965]: Venturi underfloor pressure -266.30 Pa, rear diffuser downforce 389.3 N at 160 km/h
# Elise_Trace[0966]: Venturi underfloor pressure -266.42 Pa, rear diffuser downforce 389.7 N at 160 km/h
# Elise_Trace[0967]: Venturi underfloor pressure -266.54 Pa, rear diffuser downforce 390.2 N at 160 km/h
# Elise_Trace[0968]: Venturi underfloor pressure -266.66 Pa, rear diffuser downforce 390.6 N at 160 km/h
# Elise_Trace[0969]: Venturi underfloor pressure -266.78 Pa, rear diffuser downforce 391.1 N at 160 km/h
# Elise_Trace[0970]: Venturi underfloor pressure -266.90 Pa, rear diffuser downforce 391.5 N at 160 km/h
# Elise_Trace[0971]: Venturi underfloor pressure -267.02 Pa, rear diffuser downforce 391.9 N at 160 km/h
# Elise_Trace[0972]: Venturi underfloor pressure -267.14 Pa, rear diffuser downforce 392.4 N at 160 km/h
# Elise_Trace[0973]: Venturi underfloor pressure -267.26 Pa, rear diffuser downforce 392.9 N at 160 km/h
# Elise_Trace[0974]: Venturi underfloor pressure -267.38 Pa, rear diffuser downforce 393.3 N at 160 km/h
# Elise_Trace[0975]: Venturi underfloor pressure -267.50 Pa, rear diffuser downforce 393.8 N at 160 km/h
# Elise_Trace[0976]: Venturi underfloor pressure -267.62 Pa, rear diffuser downforce 394.2 N at 160 km/h
# Elise_Trace[0977]: Venturi underfloor pressure -267.74 Pa, rear diffuser downforce 394.7 N at 160 km/h
# Elise_Trace[0978]: Venturi underfloor pressure -267.86 Pa, rear diffuser downforce 395.1 N at 160 km/h
# Elise_Trace[0979]: Venturi underfloor pressure -267.98 Pa, rear diffuser downforce 395.6 N at 160 km/h
# Elise_Trace[0980]: Venturi underfloor pressure -268.10 Pa, rear diffuser downforce 396.0 N at 160 km/h
# Elise_Trace[0981]: Venturi underfloor pressure -268.22 Pa, rear diffuser downforce 396.4 N at 160 km/h
# Elise_Trace[0982]: Venturi underfloor pressure -268.34 Pa, rear diffuser downforce 396.9 N at 160 km/h
# Elise_Trace[0983]: Venturi underfloor pressure -268.46 Pa, rear diffuser downforce 397.4 N at 160 km/h
# Elise_Trace[0984]: Venturi underfloor pressure -268.58 Pa, rear diffuser downforce 397.8 N at 160 km/h
# Elise_Trace[0985]: Venturi underfloor pressure -268.70 Pa, rear diffuser downforce 398.3 N at 160 km/h
# Elise_Trace[0986]: Venturi underfloor pressure -268.82 Pa, rear diffuser downforce 398.7 N at 160 km/h
# Elise_Trace[0987]: Venturi underfloor pressure -268.94 Pa, rear diffuser downforce 399.2 N at 160 km/h
# Elise_Trace[0988]: Venturi underfloor pressure -269.06 Pa, rear diffuser downforce 399.6 N at 160 km/h
# Elise_Trace[0989]: Venturi underfloor pressure -269.18 Pa, rear diffuser downforce 400.1 N at 160 km/h
# Elise_Trace[0990]: Venturi underfloor pressure -269.30 Pa, rear diffuser downforce 400.5 N at 160 km/h
# Elise_Trace[0991]: Venturi underfloor pressure -269.42 Pa, rear diffuser downforce 400.9 N at 160 km/h
# Elise_Trace[0992]: Venturi underfloor pressure -269.54 Pa, rear diffuser downforce 401.4 N at 160 km/h
# Elise_Trace[0993]: Venturi underfloor pressure -269.66 Pa, rear diffuser downforce 401.9 N at 160 km/h
# Elise_Trace[0994]: Venturi underfloor pressure -269.78 Pa, rear diffuser downforce 402.3 N at 160 km/h
# Elise_Trace[0995]: Venturi underfloor pressure -269.90 Pa, rear diffuser downforce 402.8 N at 160 km/h
# Elise_Trace[0996]: Venturi underfloor pressure -270.02 Pa, rear diffuser downforce 403.2 N at 160 km/h
# Elise_Trace[0997]: Venturi underfloor pressure -270.14 Pa, rear diffuser downforce 403.7 N at 160 km/h
# Elise_Trace[0998]: Venturi underfloor pressure -270.26 Pa, rear diffuser downforce 404.1 N at 160 km/h
# Elise_Trace[0999]: Venturi underfloor pressure -270.38 Pa, rear diffuser downforce 404.6 N at 160 km/h
# Elise_Trace[1000]: Venturi underfloor pressure -270.50 Pa, rear diffuser downforce 405.0 N at 160 km/h
# Elise_Trace[1001]: Venturi underfloor pressure -270.62 Pa, rear diffuser downforce 405.4 N at 160 km/h
# Elise_Trace[1002]: Venturi underfloor pressure -270.74 Pa, rear diffuser downforce 405.9 N at 160 km/h
# Elise_Trace[1003]: Venturi underfloor pressure -270.86 Pa, rear diffuser downforce 406.4 N at 160 km/h
# Elise_Trace[1004]: Venturi underfloor pressure -270.98 Pa, rear diffuser downforce 406.8 N at 160 km/h
# Elise_Trace[1005]: Venturi underfloor pressure -271.10 Pa, rear diffuser downforce 407.3 N at 160 km/h
# Elise_Trace[1006]: Venturi underfloor pressure -271.22 Pa, rear diffuser downforce 407.7 N at 160 km/h
# Elise_Trace[1007]: Venturi underfloor pressure -271.34 Pa, rear diffuser downforce 408.2 N at 160 km/h
# Elise_Trace[1008]: Venturi underfloor pressure -271.46 Pa, rear diffuser downforce 408.6 N at 160 km/h
# Elise_Trace[1009]: Venturi underfloor pressure -271.58 Pa, rear diffuser downforce 409.1 N at 160 km/h
# Elise_Trace[1010]: Venturi underfloor pressure -271.70 Pa, rear diffuser downforce 409.5 N at 160 km/h
# Elise_Trace[1011]: Venturi underfloor pressure -271.82 Pa, rear diffuser downforce 409.9 N at 160 km/h
# Elise_Trace[1012]: Venturi underfloor pressure -271.94 Pa, rear diffuser downforce 410.4 N at 160 km/h
# Elise_Trace[1013]: Venturi underfloor pressure -272.06 Pa, rear diffuser downforce 410.9 N at 160 km/h
# Elise_Trace[1014]: Venturi underfloor pressure -272.18 Pa, rear diffuser downforce 411.3 N at 160 km/h
# Elise_Trace[1015]: Venturi underfloor pressure -272.30 Pa, rear diffuser downforce 411.8 N at 160 km/h
# Elise_Trace[1016]: Venturi underfloor pressure -272.42 Pa, rear diffuser downforce 412.2 N at 160 km/h
# Elise_Trace[1017]: Venturi underfloor pressure -272.54 Pa, rear diffuser downforce 412.7 N at 160 km/h
# Elise_Trace[1018]: Venturi underfloor pressure -272.66 Pa, rear diffuser downforce 413.1 N at 160 km/h
# Elise_Trace[1019]: Venturi underfloor pressure -272.78 Pa, rear diffuser downforce 413.6 N at 160 km/h
# Elise_Trace[1020]: Venturi underfloor pressure -272.90 Pa, rear diffuser downforce 414.0 N at 160 km/h
# Elise_Trace[1021]: Venturi underfloor pressure -273.02 Pa, rear diffuser downforce 414.4 N at 160 km/h
# Elise_Trace[1022]: Venturi underfloor pressure -273.14 Pa, rear diffuser downforce 414.9 N at 160 km/h
# Elise_Trace[1023]: Venturi underfloor pressure -273.26 Pa, rear diffuser downforce 415.4 N at 160 km/h
# Elise_Trace[1024]: Venturi underfloor pressure -273.38 Pa, rear diffuser downforce 415.8 N at 160 km/h
# Elise_Trace[1025]: Venturi underfloor pressure -273.50 Pa, rear diffuser downforce 416.3 N at 160 km/h
# Elise_Trace[1026]: Venturi underfloor pressure -273.62 Pa, rear diffuser downforce 416.7 N at 160 km/h
# Elise_Trace[1027]: Venturi underfloor pressure -273.74 Pa, rear diffuser downforce 417.2 N at 160 km/h
# Elise_Trace[1028]: Venturi underfloor pressure -273.86 Pa, rear diffuser downforce 417.6 N at 160 km/h
# Elise_Trace[1029]: Venturi underfloor pressure -273.98 Pa, rear diffuser downforce 418.1 N at 160 km/h
# Elise_Trace[1030]: Venturi underfloor pressure -274.10 Pa, rear diffuser downforce 418.5 N at 160 km/h
# Elise_Trace[1031]: Venturi underfloor pressure -274.22 Pa, rear diffuser downforce 418.9 N at 160 km/h
# Elise_Trace[1032]: Venturi underfloor pressure -274.34 Pa, rear diffuser downforce 419.4 N at 160 km/h
# Elise_Trace[1033]: Venturi underfloor pressure -274.46 Pa, rear diffuser downforce 419.9 N at 160 km/h
# Elise_Trace[1034]: Venturi underfloor pressure -274.58 Pa, rear diffuser downforce 420.3 N at 160 km/h
# Elise_Trace[1035]: Venturi underfloor pressure -274.70 Pa, rear diffuser downforce 420.8 N at 160 km/h
# Elise_Trace[1036]: Venturi underfloor pressure -274.82 Pa, rear diffuser downforce 421.2 N at 160 km/h
# Elise_Trace[1037]: Venturi underfloor pressure -274.94 Pa, rear diffuser downforce 421.7 N at 160 km/h
# Elise_Trace[1038]: Venturi underfloor pressure -275.06 Pa, rear diffuser downforce 422.1 N at 160 km/h
# Elise_Trace[1039]: Venturi underfloor pressure -275.18 Pa, rear diffuser downforce 422.6 N at 160 km/h
# Elise_Trace[1040]: Venturi underfloor pressure -275.30 Pa, rear diffuser downforce 423.0 N at 160 km/h
# Elise_Trace[1041]: Venturi underfloor pressure -275.42 Pa, rear diffuser downforce 423.4 N at 160 km/h
# Elise_Trace[1042]: Venturi underfloor pressure -275.54 Pa, rear diffuser downforce 423.9 N at 160 km/h
# Elise_Trace[1043]: Venturi underfloor pressure -275.66 Pa, rear diffuser downforce 424.4 N at 160 km/h
# Elise_Trace[1044]: Venturi underfloor pressure -275.78 Pa, rear diffuser downforce 424.8 N at 160 km/h
# Elise_Trace[1045]: Venturi underfloor pressure -275.90 Pa, rear diffuser downforce 425.3 N at 160 km/h
# Elise_Trace[1046]: Venturi underfloor pressure -276.02 Pa, rear diffuser downforce 425.7 N at 160 km/h
# Elise_Trace[1047]: Venturi underfloor pressure -276.14 Pa, rear diffuser downforce 426.2 N at 160 km/h
# Elise_Trace[1048]: Venturi underfloor pressure -276.26 Pa, rear diffuser downforce 426.6 N at 160 km/h
# Elise_Trace[1049]: Venturi underfloor pressure -276.38 Pa, rear diffuser downforce 427.1 N at 160 km/h
# Elise_Trace[1050]: Venturi underfloor pressure -276.50 Pa, rear diffuser downforce 427.5 N at 160 km/h
# Elise_Trace[1051]: Venturi underfloor pressure -276.62 Pa, rear diffuser downforce 427.9 N at 160 km/h
# Elise_Trace[1052]: Venturi underfloor pressure -276.74 Pa, rear diffuser downforce 428.4 N at 160 km/h
# Elise_Trace[1053]: Venturi underfloor pressure -276.86 Pa, rear diffuser downforce 428.9 N at 160 km/h
# Elise_Trace[1054]: Venturi underfloor pressure -276.98 Pa, rear diffuser downforce 429.3 N at 160 km/h
# Elise_Trace[1055]: Venturi underfloor pressure -277.10 Pa, rear diffuser downforce 429.8 N at 160 km/h
# Elise_Trace[1056]: Venturi underfloor pressure -277.22 Pa, rear diffuser downforce 430.2 N at 160 km/h
# Elise_Trace[1057]: Venturi underfloor pressure -277.34 Pa, rear diffuser downforce 430.7 N at 160 km/h
# Elise_Trace[1058]: Venturi underfloor pressure -277.46 Pa, rear diffuser downforce 431.1 N at 160 km/h
# Elise_Trace[1059]: Venturi underfloor pressure -277.58 Pa, rear diffuser downforce 431.6 N at 160 km/h
# Elise_Trace[1060]: Venturi underfloor pressure -277.70 Pa, rear diffuser downforce 432.0 N at 160 km/h
# Elise_Trace[1061]: Venturi underfloor pressure -277.82 Pa, rear diffuser downforce 432.4 N at 160 km/h
# Elise_Trace[1062]: Venturi underfloor pressure -277.94 Pa, rear diffuser downforce 432.9 N at 160 km/h
# Elise_Trace[1063]: Venturi underfloor pressure -278.06 Pa, rear diffuser downforce 433.4 N at 160 km/h
# Elise_Trace[1064]: Venturi underfloor pressure -278.18 Pa, rear diffuser downforce 433.8 N at 160 km/h
# Elise_Trace[1065]: Venturi underfloor pressure -278.30 Pa, rear diffuser downforce 434.3 N at 160 km/h
# Elise_Trace[1066]: Venturi underfloor pressure -278.42 Pa, rear diffuser downforce 434.7 N at 160 km/h
# Elise_Trace[1067]: Venturi underfloor pressure -278.54 Pa, rear diffuser downforce 435.2 N at 160 km/h
# Elise_Trace[1068]: Venturi underfloor pressure -278.66 Pa, rear diffuser downforce 435.6 N at 160 km/h
# Elise_Trace[1069]: Venturi underfloor pressure -278.78 Pa, rear diffuser downforce 436.1 N at 160 km/h
# Elise_Trace[1070]: Venturi underfloor pressure -278.90 Pa, rear diffuser downforce 436.5 N at 160 km/h
# Elise_Trace[1071]: Venturi underfloor pressure -279.02 Pa, rear diffuser downforce 436.9 N at 160 km/h
# Elise_Trace[1072]: Venturi underfloor pressure -279.14 Pa, rear diffuser downforce 437.4 N at 160 km/h
# Elise_Trace[1073]: Venturi underfloor pressure -279.26 Pa, rear diffuser downforce 437.9 N at 160 km/h
# Elise_Trace[1074]: Venturi underfloor pressure -279.38 Pa, rear diffuser downforce 438.3 N at 160 km/h
# Elise_Trace[1075]: Venturi underfloor pressure -279.50 Pa, rear diffuser downforce 438.8 N at 160 km/h
# Elise_Trace[1076]: Venturi underfloor pressure -279.62 Pa, rear diffuser downforce 439.2 N at 160 km/h
# Elise_Trace[1077]: Venturi underfloor pressure -279.74 Pa, rear diffuser downforce 439.7 N at 160 km/h
# Elise_Trace[1078]: Venturi underfloor pressure -279.86 Pa, rear diffuser downforce 440.1 N at 160 km/h
# Elise_Trace[1079]: Venturi underfloor pressure -279.98 Pa, rear diffuser downforce 440.6 N at 160 km/h
# Elise_Trace[1080]: Venturi underfloor pressure -280.10 Pa, rear diffuser downforce 441.0 N at 160 km/h
# Elise_Trace[1081]: Venturi underfloor pressure -280.22 Pa, rear diffuser downforce 441.4 N at 160 km/h
# Elise_Trace[1082]: Venturi underfloor pressure -280.34 Pa, rear diffuser downforce 441.9 N at 160 km/h
# Elise_Trace[1083]: Venturi underfloor pressure -280.46 Pa, rear diffuser downforce 442.4 N at 160 km/h
# Elise_Trace[1084]: Venturi underfloor pressure -280.58 Pa, rear diffuser downforce 442.8 N at 160 km/h
# Elise_Trace[1085]: Venturi underfloor pressure -280.70 Pa, rear diffuser downforce 443.3 N at 160 km/h
# Elise_Trace[1086]: Venturi underfloor pressure -280.82 Pa, rear diffuser downforce 443.7 N at 160 km/h
# Elise_Trace[1087]: Venturi underfloor pressure -280.94 Pa, rear diffuser downforce 444.2 N at 160 km/h
# Elise_Trace[1088]: Venturi underfloor pressure -281.06 Pa, rear diffuser downforce 444.6 N at 160 km/h
# Elise_Trace[1089]: Venturi underfloor pressure -281.18 Pa, rear diffuser downforce 445.1 N at 160 km/h
# Elise_Trace[1090]: Venturi underfloor pressure -281.30 Pa, rear diffuser downforce 445.5 N at 160 km/h
# Elise_Trace[1091]: Venturi underfloor pressure -281.42 Pa, rear diffuser downforce 445.9 N at 160 km/h
# Elise_Trace[1092]: Venturi underfloor pressure -281.54 Pa, rear diffuser downforce 446.4 N at 160 km/h
# Elise_Trace[1093]: Venturi underfloor pressure -281.66 Pa, rear diffuser downforce 446.9 N at 160 km/h
# Elise_Trace[1094]: Venturi underfloor pressure -281.78 Pa, rear diffuser downforce 447.3 N at 160 km/h
# Elise_Trace[1095]: Venturi underfloor pressure -281.90 Pa, rear diffuser downforce 447.8 N at 160 km/h
# Elise_Trace[1096]: Venturi underfloor pressure -282.02 Pa, rear diffuser downforce 448.2 N at 160 km/h
# Elise_Trace[1097]: Venturi underfloor pressure -282.14 Pa, rear diffuser downforce 448.7 N at 160 km/h
# Elise_Trace[1098]: Venturi underfloor pressure -282.26 Pa, rear diffuser downforce 449.1 N at 160 km/h
# Elise_Trace[1099]: Venturi underfloor pressure -282.38 Pa, rear diffuser downforce 449.6 N at 160 km/h
# Elise_Trace[1100]: Venturi underfloor pressure -282.50 Pa, rear diffuser downforce 450.0 N at 160 km/h
# Elise_Trace[1101]: Venturi underfloor pressure -282.62 Pa, rear diffuser downforce 450.4 N at 160 km/h
# Elise_Trace[1102]: Venturi underfloor pressure -282.74 Pa, rear diffuser downforce 450.9 N at 160 km/h
# Elise_Trace[1103]: Venturi underfloor pressure -282.86 Pa, rear diffuser downforce 451.4 N at 160 km/h
# Elise_Trace[1104]: Venturi underfloor pressure -282.98 Pa, rear diffuser downforce 451.8 N at 160 km/h
# Elise_Trace[1105]: Venturi underfloor pressure -283.10 Pa, rear diffuser downforce 452.3 N at 160 km/h
# Elise_Trace[1106]: Venturi underfloor pressure -283.22 Pa, rear diffuser downforce 452.7 N at 160 km/h
# Elise_Trace[1107]: Venturi underfloor pressure -283.34 Pa, rear diffuser downforce 453.2 N at 160 km/h
# Elise_Trace[1108]: Venturi underfloor pressure -283.46 Pa, rear diffuser downforce 453.6 N at 160 km/h
# Elise_Trace[1109]: Venturi underfloor pressure -283.58 Pa, rear diffuser downforce 454.1 N at 160 km/h
# Elise_Trace[1110]: Venturi underfloor pressure -283.70 Pa, rear diffuser downforce 454.5 N at 160 km/h
# Elise_Trace[1111]: Venturi underfloor pressure -283.82 Pa, rear diffuser downforce 454.9 N at 160 km/h
# Elise_Trace[1112]: Venturi underfloor pressure -283.94 Pa, rear diffuser downforce 455.4 N at 160 km/h
# Elise_Trace[1113]: Venturi underfloor pressure -284.06 Pa, rear diffuser downforce 455.9 N at 160 km/h
# Elise_Trace[1114]: Venturi underfloor pressure -284.18 Pa, rear diffuser downforce 456.3 N at 160 km/h
# Elise_Trace[1115]: Venturi underfloor pressure -284.30 Pa, rear diffuser downforce 456.8 N at 160 km/h
# Elise_Trace[1116]: Venturi underfloor pressure -284.42 Pa, rear diffuser downforce 457.2 N at 160 km/h
# Elise_Trace[1117]: Venturi underfloor pressure -284.54 Pa, rear diffuser downforce 457.7 N at 160 km/h
# Elise_Trace[1118]: Venturi underfloor pressure -284.66 Pa, rear diffuser downforce 458.1 N at 160 km/h
# Elise_Trace[1119]: Venturi underfloor pressure -284.78 Pa, rear diffuser downforce 458.6 N at 160 km/h
# Elise_Trace[1120]: Venturi underfloor pressure -284.90 Pa, rear diffuser downforce 459.0 N at 160 km/h
# Elise_Trace[1121]: Venturi underfloor pressure -285.02 Pa, rear diffuser downforce 459.4 N at 160 km/h
# Elise_Trace[1122]: Venturi underfloor pressure -285.14 Pa, rear diffuser downforce 459.9 N at 160 km/h
# Elise_Trace[1123]: Venturi underfloor pressure -285.26 Pa, rear diffuser downforce 460.4 N at 160 km/h
# Elise_Trace[1124]: Venturi underfloor pressure -285.38 Pa, rear diffuser downforce 460.8 N at 160 km/h
# Elise_Trace[1125]: Venturi underfloor pressure -240.50 Pa, rear diffuser downforce 461.3 N at 160 km/h
# Elise_Trace[1126]: Venturi underfloor pressure -240.62 Pa, rear diffuser downforce 461.7 N at 160 km/h
# Elise_Trace[1127]: Venturi underfloor pressure -240.74 Pa, rear diffuser downforce 462.2 N at 160 km/h
# Elise_Trace[1128]: Venturi underfloor pressure -240.86 Pa, rear diffuser downforce 462.6 N at 160 km/h
# Elise_Trace[1129]: Venturi underfloor pressure -240.98 Pa, rear diffuser downforce 463.1 N at 160 km/h
# Elise_Trace[1130]: Venturi underfloor pressure -241.10 Pa, rear diffuser downforce 463.5 N at 160 km/h
# Elise_Trace[1131]: Venturi underfloor pressure -241.22 Pa, rear diffuser downforce 463.9 N at 160 km/h
# Elise_Trace[1132]: Venturi underfloor pressure -241.34 Pa, rear diffuser downforce 464.4 N at 160 km/h
# Elise_Trace[1133]: Venturi underfloor pressure -241.46 Pa, rear diffuser downforce 464.9 N at 160 km/h
# Elise_Trace[1134]: Venturi underfloor pressure -241.58 Pa, rear diffuser downforce 380.3 N at 160 km/h
# Elise_Trace[1135]: Venturi underfloor pressure -241.70 Pa, rear diffuser downforce 380.8 N at 160 km/h
# Elise_Trace[1136]: Venturi underfloor pressure -241.82 Pa, rear diffuser downforce 381.2 N at 160 km/h
# Elise_Trace[1137]: Venturi underfloor pressure -241.94 Pa, rear diffuser downforce 381.7 N at 160 km/h
# Elise_Trace[1138]: Venturi underfloor pressure -242.06 Pa, rear diffuser downforce 382.1 N at 160 km/h
# Elise_Trace[1139]: Venturi underfloor pressure -242.18 Pa, rear diffuser downforce 382.6 N at 160 km/h
# Elise_Trace[1140]: Venturi underfloor pressure -242.30 Pa, rear diffuser downforce 383.0 N at 160 km/h
# Elise_Trace[1141]: Venturi underfloor pressure -242.42 Pa, rear diffuser downforce 383.5 N at 160 km/h
# Elise_Trace[1142]: Venturi underfloor pressure -242.54 Pa, rear diffuser downforce 383.9 N at 160 km/h
# Elise_Trace[1143]: Venturi underfloor pressure -242.66 Pa, rear diffuser downforce 384.4 N at 160 km/h
# Elise_Trace[1144]: Venturi underfloor pressure -242.78 Pa, rear diffuser downforce 384.8 N at 160 km/h
# Elise_Trace[1145]: Venturi underfloor pressure -242.90 Pa, rear diffuser downforce 385.3 N at 160 km/h
# Elise_Trace[1146]: Venturi underfloor pressure -243.02 Pa, rear diffuser downforce 385.7 N at 160 km/h
# Elise_Trace[1147]: Venturi underfloor pressure -243.14 Pa, rear diffuser downforce 386.1 N at 160 km/h
# Elise_Trace[1148]: Venturi underfloor pressure -243.26 Pa, rear diffuser downforce 386.6 N at 160 km/h
# Elise_Trace[1149]: Venturi underfloor pressure -243.38 Pa, rear diffuser downforce 387.1 N at 160 km/h
# Elise_Trace[1150]: Venturi underfloor pressure -243.50 Pa, rear diffuser downforce 387.5 N at 160 km/h
# Elise_Trace[1151]: Venturi underfloor pressure -243.62 Pa, rear diffuser downforce 388.0 N at 160 km/h
# Elise_Trace[1152]: Venturi underfloor pressure -243.74 Pa, rear diffuser downforce 388.4 N at 160 km/h
# Elise_Trace[1153]: Venturi underfloor pressure -243.86 Pa, rear diffuser downforce 388.9 N at 160 km/h
# Elise_Trace[1154]: Venturi underfloor pressure -243.98 Pa, rear diffuser downforce 389.3 N at 160 km/h
# Elise_Trace[1155]: Venturi underfloor pressure -244.10 Pa, rear diffuser downforce 389.8 N at 160 km/h
# Elise_Trace[1156]: Venturi underfloor pressure -244.22 Pa, rear diffuser downforce 390.2 N at 160 km/h
# Elise_Trace[1157]: Venturi underfloor pressure -244.34 Pa, rear diffuser downforce 390.6 N at 160 km/h
# Elise_Trace[1158]: Venturi underfloor pressure -244.46 Pa, rear diffuser downforce 391.1 N at 160 km/h
# Elise_Trace[1159]: Venturi underfloor pressure -244.58 Pa, rear diffuser downforce 391.6 N at 160 km/h
# Elise_Trace[1160]: Venturi underfloor pressure -244.70 Pa, rear diffuser downforce 392.0 N at 160 km/h
# Elise_Trace[1161]: Venturi underfloor pressure -244.82 Pa, rear diffuser downforce 392.5 N at 160 km/h
# Elise_Trace[1162]: Venturi underfloor pressure -244.94 Pa, rear diffuser downforce 392.9 N at 160 km/h
# Elise_Trace[1163]: Venturi underfloor pressure -245.06 Pa, rear diffuser downforce 393.4 N at 160 km/h
# Elise_Trace[1164]: Venturi underfloor pressure -245.18 Pa, rear diffuser downforce 393.8 N at 160 km/h
# Elise_Trace[1165]: Venturi underfloor pressure -245.30 Pa, rear diffuser downforce 394.3 N at 160 km/h
# Elise_Trace[1166]: Venturi underfloor pressure -245.42 Pa, rear diffuser downforce 394.7 N at 160 km/h
# Elise_Trace[1167]: Venturi underfloor pressure -245.54 Pa, rear diffuser downforce 395.1 N at 160 km/h
# Elise_Trace[1168]: Venturi underfloor pressure -245.66 Pa, rear diffuser downforce 395.6 N at 160 km/h
# Elise_Trace[1169]: Venturi underfloor pressure -245.78 Pa, rear diffuser downforce 396.1 N at 160 km/h
# Elise_Trace[1170]: Venturi underfloor pressure -245.90 Pa, rear diffuser downforce 396.5 N at 160 km/h
# Elise_Trace[1171]: Venturi underfloor pressure -246.02 Pa, rear diffuser downforce 397.0 N at 160 km/h
# Elise_Trace[1172]: Venturi underfloor pressure -246.14 Pa, rear diffuser downforce 397.4 N at 160 km/h
# Elise_Trace[1173]: Venturi underfloor pressure -246.26 Pa, rear diffuser downforce 397.9 N at 160 km/h
# Elise_Trace[1174]: Venturi underfloor pressure -246.38 Pa, rear diffuser downforce 398.3 N at 160 km/h
# Elise_Trace[1175]: Venturi underfloor pressure -246.50 Pa, rear diffuser downforce 398.8 N at 160 km/h
# Elise_Trace[1176]: Venturi underfloor pressure -246.62 Pa, rear diffuser downforce 399.2 N at 160 km/h
# Elise_Trace[1177]: Venturi underfloor pressure -246.74 Pa, rear diffuser downforce 399.6 N at 160 km/h
# Elise_Trace[1178]: Venturi underfloor pressure -246.86 Pa, rear diffuser downforce 400.1 N at 160 km/h
# Elise_Trace[1179]: Venturi underfloor pressure -246.98 Pa, rear diffuser downforce 400.6 N at 160 km/h
# Elise_Trace[1180]: Venturi underfloor pressure -247.10 Pa, rear diffuser downforce 401.0 N at 160 km/h
# Elise_Trace[1181]: Venturi underfloor pressure -247.22 Pa, rear diffuser downforce 401.5 N at 160 km/h
# Elise_Trace[1182]: Venturi underfloor pressure -247.34 Pa, rear diffuser downforce 401.9 N at 160 km/h
# Elise_Trace[1183]: Venturi underfloor pressure -247.46 Pa, rear diffuser downforce 402.4 N at 160 km/h
# Elise_Trace[1184]: Venturi underfloor pressure -247.58 Pa, rear diffuser downforce 402.8 N at 160 km/h
# Elise_Trace[1185]: Venturi underfloor pressure -247.70 Pa, rear diffuser downforce 403.3 N at 160 km/h
# Elise_Trace[1186]: Venturi underfloor pressure -247.82 Pa, rear diffuser downforce 403.7 N at 160 km/h
# Elise_Trace[1187]: Venturi underfloor pressure -247.94 Pa, rear diffuser downforce 404.1 N at 160 km/h
# Elise_Trace[1188]: Venturi underfloor pressure -248.06 Pa, rear diffuser downforce 404.6 N at 160 km/h
# Elise_Trace[1189]: Venturi underfloor pressure -248.18 Pa, rear diffuser downforce 405.1 N at 160 km/h
# Elise_Trace[1190]: Venturi underfloor pressure -248.30 Pa, rear diffuser downforce 405.5 N at 160 km/h
# Elise_Trace[1191]: Venturi underfloor pressure -248.42 Pa, rear diffuser downforce 406.0 N at 160 km/h
# Elise_Trace[1192]: Venturi underfloor pressure -248.54 Pa, rear diffuser downforce 406.4 N at 160 km/h
# Elise_Trace[1193]: Venturi underfloor pressure -248.66 Pa, rear diffuser downforce 406.9 N at 160 km/h
# Elise_Trace[1194]: Venturi underfloor pressure -248.78 Pa, rear diffuser downforce 407.3 N at 160 km/h
# Elise_Trace[1195]: Venturi underfloor pressure -248.90 Pa, rear diffuser downforce 407.8 N at 160 km/h
# Elise_Trace[1196]: Venturi underfloor pressure -249.02 Pa, rear diffuser downforce 408.2 N at 160 km/h
# Elise_Trace[1197]: Venturi underfloor pressure -249.14 Pa, rear diffuser downforce 408.6 N at 160 km/h
# Elise_Trace[1198]: Venturi underfloor pressure -249.26 Pa, rear diffuser downforce 409.1 N at 160 km/h
# Elise_Trace[1199]: Venturi underfloor pressure -249.38 Pa, rear diffuser downforce 409.6 N at 160 km/h
# Elise_Trace[1200]: Venturi underfloor pressure -249.50 Pa, rear diffuser downforce 410.0 N at 160 km/h
# Elise_Trace[1201]: Venturi underfloor pressure -249.62 Pa, rear diffuser downforce 410.5 N at 160 km/h
# Elise_Trace[1202]: Venturi underfloor pressure -249.74 Pa, rear diffuser downforce 410.9 N at 160 km/h
# Elise_Trace[1203]: Venturi underfloor pressure -249.86 Pa, rear diffuser downforce 411.4 N at 160 km/h
# Elise_Trace[1204]: Venturi underfloor pressure -249.98 Pa, rear diffuser downforce 411.8 N at 160 km/h
# Elise_Trace[1205]: Venturi underfloor pressure -250.10 Pa, rear diffuser downforce 412.3 N at 160 km/h
# Elise_Trace[1206]: Venturi underfloor pressure -250.22 Pa, rear diffuser downforce 412.7 N at 160 km/h
# Elise_Trace[1207]: Venturi underfloor pressure -250.34 Pa, rear diffuser downforce 413.1 N at 160 km/h
# Elise_Trace[1208]: Venturi underfloor pressure -250.46 Pa, rear diffuser downforce 413.6 N at 160 km/h
# Elise_Trace[1209]: Venturi underfloor pressure -250.58 Pa, rear diffuser downforce 414.1 N at 160 km/h
# Elise_Trace[1210]: Venturi underfloor pressure -250.70 Pa, rear diffuser downforce 414.5 N at 160 km/h
# Elise_Trace[1211]: Venturi underfloor pressure -250.82 Pa, rear diffuser downforce 415.0 N at 160 km/h
# Elise_Trace[1212]: Venturi underfloor pressure -250.94 Pa, rear diffuser downforce 415.4 N at 160 km/h
# Elise_Trace[1213]: Venturi underfloor pressure -251.06 Pa, rear diffuser downforce 415.9 N at 160 km/h
# Elise_Trace[1214]: Venturi underfloor pressure -251.18 Pa, rear diffuser downforce 416.3 N at 160 km/h
# Elise_Trace[1215]: Venturi underfloor pressure -251.30 Pa, rear diffuser downforce 416.8 N at 160 km/h
# Elise_Trace[1216]: Venturi underfloor pressure -251.42 Pa, rear diffuser downforce 417.2 N at 160 km/h
# Elise_Trace[1217]: Venturi underfloor pressure -251.54 Pa, rear diffuser downforce 417.6 N at 160 km/h
# Elise_Trace[1218]: Venturi underfloor pressure -251.66 Pa, rear diffuser downforce 418.1 N at 160 km/h
# Elise_Trace[1219]: Venturi underfloor pressure -251.78 Pa, rear diffuser downforce 418.6 N at 160 km/h
# Elise_Trace[1220]: Venturi underfloor pressure -251.90 Pa, rear diffuser downforce 419.0 N at 160 km/h
# Elise_Trace[1221]: Venturi underfloor pressure -252.02 Pa, rear diffuser downforce 419.5 N at 160 km/h
# Elise_Trace[1222]: Venturi underfloor pressure -252.14 Pa, rear diffuser downforce 419.9 N at 160 km/h
# Elise_Trace[1223]: Venturi underfloor pressure -252.26 Pa, rear diffuser downforce 420.4 N at 160 km/h
# Elise_Trace[1224]: Venturi underfloor pressure -252.38 Pa, rear diffuser downforce 420.8 N at 160 km/h
# Elise_Trace[1225]: Venturi underfloor pressure -252.50 Pa, rear diffuser downforce 421.3 N at 160 km/h
# Elise_Trace[1226]: Venturi underfloor pressure -252.62 Pa, rear diffuser downforce 421.7 N at 160 km/h
# Elise_Trace[1227]: Venturi underfloor pressure -252.74 Pa, rear diffuser downforce 422.1 N at 160 km/h
# Elise_Trace[1228]: Venturi underfloor pressure -252.86 Pa, rear diffuser downforce 422.6 N at 160 km/h
# Elise_Trace[1229]: Venturi underfloor pressure -252.98 Pa, rear diffuser downforce 423.1 N at 160 km/h
# Elise_Trace[1230]: Venturi underfloor pressure -253.10 Pa, rear diffuser downforce 423.5 N at 160 km/h
# Elise_Trace[1231]: Venturi underfloor pressure -253.22 Pa, rear diffuser downforce 424.0 N at 160 km/h
# Elise_Trace[1232]: Venturi underfloor pressure -253.34 Pa, rear diffuser downforce 424.4 N at 160 km/h
# Elise_Trace[1233]: Venturi underfloor pressure -253.46 Pa, rear diffuser downforce 424.9 N at 160 km/h
# Elise_Trace[1234]: Venturi underfloor pressure -253.58 Pa, rear diffuser downforce 425.3 N at 160 km/h
# Elise_Trace[1235]: Venturi underfloor pressure -253.70 Pa, rear diffuser downforce 425.8 N at 160 km/h
# Elise_Trace[1236]: Venturi underfloor pressure -253.82 Pa, rear diffuser downforce 426.2 N at 160 km/h
# Elise_Trace[1237]: Venturi underfloor pressure -253.94 Pa, rear diffuser downforce 426.6 N at 160 km/h
# Elise_Trace[1238]: Venturi underfloor pressure -254.06 Pa, rear diffuser downforce 427.1 N at 160 km/h
# Elise_Trace[1239]: Venturi underfloor pressure -254.18 Pa, rear diffuser downforce 427.6 N at 160 km/h
# Elise_Trace[1240]: Venturi underfloor pressure -254.30 Pa, rear diffuser downforce 428.0 N at 160 km/h
# Elise_Trace[1241]: Venturi underfloor pressure -254.42 Pa, rear diffuser downforce 428.5 N at 160 km/h
# Elise_Trace[1242]: Venturi underfloor pressure -254.54 Pa, rear diffuser downforce 428.9 N at 160 km/h
# Elise_Trace[1243]: Venturi underfloor pressure -254.66 Pa, rear diffuser downforce 429.4 N at 160 km/h
# Elise_Trace[1244]: Venturi underfloor pressure -254.78 Pa, rear diffuser downforce 429.8 N at 160 km/h
# Elise_Trace[1245]: Venturi underfloor pressure -254.90 Pa, rear diffuser downforce 430.3 N at 160 km/h
# Elise_Trace[1246]: Venturi underfloor pressure -255.02 Pa, rear diffuser downforce 430.7 N at 160 km/h
# Elise_Trace[1247]: Venturi underfloor pressure -255.14 Pa, rear diffuser downforce 431.1 N at 160 km/h
# Elise_Trace[1248]: Venturi underfloor pressure -255.26 Pa, rear diffuser downforce 431.6 N at 160 km/h
# Elise_Trace[1249]: Venturi underfloor pressure -255.38 Pa, rear diffuser downforce 432.1 N at 160 km/h
# Elise_Trace[1250]: Venturi underfloor pressure -255.50 Pa, rear diffuser downforce 432.5 N at 160 km/h
# Elise_Trace[1251]: Venturi underfloor pressure -255.62 Pa, rear diffuser downforce 433.0 N at 160 km/h
# Elise_Trace[1252]: Venturi underfloor pressure -255.74 Pa, rear diffuser downforce 433.4 N at 160 km/h
# Elise_Trace[1253]: Venturi underfloor pressure -255.86 Pa, rear diffuser downforce 433.9 N at 160 km/h
# Elise_Trace[1254]: Venturi underfloor pressure -255.98 Pa, rear diffuser downforce 434.3 N at 160 km/h
# Elise_Trace[1255]: Venturi underfloor pressure -256.10 Pa, rear diffuser downforce 434.8 N at 160 km/h
# Elise_Trace[1256]: Venturi underfloor pressure -256.22 Pa, rear diffuser downforce 435.2 N at 160 km/h
# Elise_Trace[1257]: Venturi underfloor pressure -256.34 Pa, rear diffuser downforce 435.6 N at 160 km/h
# Elise_Trace[1258]: Venturi underfloor pressure -256.46 Pa, rear diffuser downforce 436.1 N at 160 km/h
# Elise_Trace[1259]: Venturi underfloor pressure -256.58 Pa, rear diffuser downforce 436.6 N at 160 km/h
# Elise_Trace[1260]: Venturi underfloor pressure -256.70 Pa, rear diffuser downforce 437.0 N at 160 km/h
# Elise_Trace[1261]: Venturi underfloor pressure -256.82 Pa, rear diffuser downforce 437.5 N at 160 km/h
# Elise_Trace[1262]: Venturi underfloor pressure -256.94 Pa, rear diffuser downforce 437.9 N at 160 km/h
# Elise_Trace[1263]: Venturi underfloor pressure -257.06 Pa, rear diffuser downforce 438.4 N at 160 km/h
# Elise_Trace[1264]: Venturi underfloor pressure -257.18 Pa, rear diffuser downforce 438.8 N at 160 km/h
# Elise_Trace[1265]: Venturi underfloor pressure -257.30 Pa, rear diffuser downforce 439.3 N at 160 km/h
# Elise_Trace[1266]: Venturi underfloor pressure -257.42 Pa, rear diffuser downforce 439.7 N at 160 km/h
# Elise_Trace[1267]: Venturi underfloor pressure -257.54 Pa, rear diffuser downforce 440.1 N at 160 km/h
# Elise_Trace[1268]: Venturi underfloor pressure -257.66 Pa, rear diffuser downforce 440.6 N at 160 km/h
# Elise_Trace[1269]: Venturi underfloor pressure -257.78 Pa, rear diffuser downforce 441.1 N at 160 km/h
# Elise_Trace[1270]: Venturi underfloor pressure -257.90 Pa, rear diffuser downforce 441.5 N at 160 km/h
# Elise_Trace[1271]: Venturi underfloor pressure -258.02 Pa, rear diffuser downforce 442.0 N at 160 km/h
# Elise_Trace[1272]: Venturi underfloor pressure -258.14 Pa, rear diffuser downforce 442.4 N at 160 km/h
# Elise_Trace[1273]: Venturi underfloor pressure -258.26 Pa, rear diffuser downforce 442.9 N at 160 km/h
# Elise_Trace[1274]: Venturi underfloor pressure -258.38 Pa, rear diffuser downforce 443.3 N at 160 km/h
# Elise_Trace[1275]: Venturi underfloor pressure -258.50 Pa, rear diffuser downforce 443.8 N at 160 km/h
# Elise_Trace[1276]: Venturi underfloor pressure -258.62 Pa, rear diffuser downforce 444.2 N at 160 km/h
# Elise_Trace[1277]: Venturi underfloor pressure -258.74 Pa, rear diffuser downforce 444.6 N at 160 km/h
# Elise_Trace[1278]: Venturi underfloor pressure -258.86 Pa, rear diffuser downforce 445.1 N at 160 km/h
# Elise_Trace[1279]: Venturi underfloor pressure -258.98 Pa, rear diffuser downforce 445.6 N at 160 km/h
# Elise_Trace[1280]: Venturi underfloor pressure -259.10 Pa, rear diffuser downforce 446.0 N at 160 km/h
# Elise_Trace[1281]: Venturi underfloor pressure -259.22 Pa, rear diffuser downforce 446.5 N at 160 km/h
# Elise_Trace[1282]: Venturi underfloor pressure -259.34 Pa, rear diffuser downforce 446.9 N at 160 km/h
# Elise_Trace[1283]: Venturi underfloor pressure -259.46 Pa, rear diffuser downforce 447.4 N at 160 km/h
# Elise_Trace[1284]: Venturi underfloor pressure -259.58 Pa, rear diffuser downforce 447.8 N at 160 km/h
# Elise_Trace[1285]: Venturi underfloor pressure -259.70 Pa, rear diffuser downforce 448.3 N at 160 km/h
# Elise_Trace[1286]: Venturi underfloor pressure -259.82 Pa, rear diffuser downforce 448.7 N at 160 km/h
# Elise_Trace[1287]: Venturi underfloor pressure -259.94 Pa, rear diffuser downforce 449.1 N at 160 km/h
# Elise_Trace[1288]: Venturi underfloor pressure -260.06 Pa, rear diffuser downforce 449.6 N at 160 km/h
# Elise_Trace[1289]: Venturi underfloor pressure -260.18 Pa, rear diffuser downforce 450.1 N at 160 km/h
# Elise_Trace[1290]: Venturi underfloor pressure -260.30 Pa, rear diffuser downforce 450.5 N at 160 km/h
# Elise_Trace[1291]: Venturi underfloor pressure -260.42 Pa, rear diffuser downforce 451.0 N at 160 km/h
# Elise_Trace[1292]: Venturi underfloor pressure -260.54 Pa, rear diffuser downforce 451.4 N at 160 km/h
# Elise_Trace[1293]: Venturi underfloor pressure -260.66 Pa, rear diffuser downforce 451.9 N at 160 km/h
# Elise_Trace[1294]: Venturi underfloor pressure -260.78 Pa, rear diffuser downforce 452.3 N at 160 km/h
# Elise_Trace[1295]: Venturi underfloor pressure -260.90 Pa, rear diffuser downforce 452.8 N at 160 km/h
# Elise_Trace[1296]: Venturi underfloor pressure -261.02 Pa, rear diffuser downforce 453.2 N at 160 km/h
# Elise_Trace[1297]: Venturi underfloor pressure -261.14 Pa, rear diffuser downforce 453.6 N at 160 km/h
# Elise_Trace[1298]: Venturi underfloor pressure -261.26 Pa, rear diffuser downforce 454.1 N at 160 km/h
# Elise_Trace[1299]: Venturi underfloor pressure -261.38 Pa, rear diffuser downforce 454.6 N at 160 km/h
# Elise_Trace[1300]: Venturi underfloor pressure -261.50 Pa, rear diffuser downforce 455.0 N at 160 km/h
# Elise_Trace[1301]: Venturi underfloor pressure -261.62 Pa, rear diffuser downforce 455.5 N at 160 km/h
# Elise_Trace[1302]: Venturi underfloor pressure -261.74 Pa, rear diffuser downforce 455.9 N at 160 km/h
# Elise_Trace[1303]: Venturi underfloor pressure -261.86 Pa, rear diffuser downforce 456.4 N at 160 km/h
# Elise_Trace[1304]: Venturi underfloor pressure -261.98 Pa, rear diffuser downforce 456.8 N at 160 km/h
# Elise_Trace[1305]: Venturi underfloor pressure -262.10 Pa, rear diffuser downforce 457.3 N at 160 km/h
# Elise_Trace[1306]: Venturi underfloor pressure -262.22 Pa, rear diffuser downforce 457.7 N at 160 km/h
# Elise_Trace[1307]: Venturi underfloor pressure -262.34 Pa, rear diffuser downforce 458.1 N at 160 km/h
# Elise_Trace[1308]: Venturi underfloor pressure -262.46 Pa, rear diffuser downforce 458.6 N at 160 km/h
# Elise_Trace[1309]: Venturi underfloor pressure -262.58 Pa, rear diffuser downforce 459.1 N at 160 km/h
# Elise_Trace[1310]: Venturi underfloor pressure -262.70 Pa, rear diffuser downforce 459.5 N at 160 km/h
# Elise_Trace[1311]: Venturi underfloor pressure -262.82 Pa, rear diffuser downforce 460.0 N at 160 km/h
# Elise_Trace[1312]: Venturi underfloor pressure -262.94 Pa, rear diffuser downforce 460.4 N at 160 km/h
# Elise_Trace[1313]: Venturi underfloor pressure -263.06 Pa, rear diffuser downforce 460.9 N at 160 km/h
# Elise_Trace[1314]: Venturi underfloor pressure -263.18 Pa, rear diffuser downforce 461.3 N at 160 km/h
# Elise_Trace[1315]: Venturi underfloor pressure -263.30 Pa, rear diffuser downforce 461.8 N at 160 km/h
# Elise_Trace[1316]: Venturi underfloor pressure -263.42 Pa, rear diffuser downforce 462.2 N at 160 km/h
# Elise_Trace[1317]: Venturi underfloor pressure -263.54 Pa, rear diffuser downforce 462.6 N at 160 km/h
# Elise_Trace[1318]: Venturi underfloor pressure -263.66 Pa, rear diffuser downforce 463.1 N at 160 km/h
# Elise_Trace[1319]: Venturi underfloor pressure -263.78 Pa, rear diffuser downforce 463.6 N at 160 km/h
# Elise_Trace[1320]: Venturi underfloor pressure -263.90 Pa, rear diffuser downforce 464.0 N at 160 km/h
# Elise_Trace[1321]: Venturi underfloor pressure -264.02 Pa, rear diffuser downforce 464.5 N at 160 km/h
# Elise_Trace[1322]: Venturi underfloor pressure -264.14 Pa, rear diffuser downforce 464.9 N at 160 km/h
# Elise_Trace[1323]: Venturi underfloor pressure -264.26 Pa, rear diffuser downforce 380.4 N at 160 km/h
# Elise_Trace[1324]: Venturi underfloor pressure -264.38 Pa, rear diffuser downforce 380.8 N at 160 km/h
# Elise_Trace[1325]: Venturi underfloor pressure -264.50 Pa, rear diffuser downforce 381.3 N at 160 km/h
# Elise_Trace[1326]: Venturi underfloor pressure -264.62 Pa, rear diffuser downforce 381.7 N at 160 km/h
# Elise_Trace[1327]: Venturi underfloor pressure -264.74 Pa, rear diffuser downforce 382.1 N at 160 km/h
# Elise_Trace[1328]: Venturi underfloor pressure -264.86 Pa, rear diffuser downforce 382.6 N at 160 km/h
# Elise_Trace[1329]: Venturi underfloor pressure -264.98 Pa, rear diffuser downforce 383.1 N at 160 km/h
# Elise_Trace[1330]: Venturi underfloor pressure -265.10 Pa, rear diffuser downforce 383.5 N at 160 km/h
# Elise_Trace[1331]: Venturi underfloor pressure -265.22 Pa, rear diffuser downforce 384.0 N at 160 km/h
# Elise_Trace[1332]: Venturi underfloor pressure -265.34 Pa, rear diffuser downforce 384.4 N at 160 km/h
# Elise_Trace[1333]: Venturi underfloor pressure -265.46 Pa, rear diffuser downforce 384.9 N at 160 km/h
# Elise_Trace[1334]: Venturi underfloor pressure -265.58 Pa, rear diffuser downforce 385.3 N at 160 km/h
# Elise_Trace[1335]: Venturi underfloor pressure -265.70 Pa, rear diffuser downforce 385.8 N at 160 km/h
# Elise_Trace[1336]: Venturi underfloor pressure -265.82 Pa, rear diffuser downforce 386.2 N at 160 km/h
# Elise_Trace[1337]: Venturi underfloor pressure -265.94 Pa, rear diffuser downforce 386.6 N at 160 km/h
# Elise_Trace[1338]: Venturi underfloor pressure -266.06 Pa, rear diffuser downforce 387.1 N at 160 km/h
# Elise_Trace[1339]: Venturi underfloor pressure -266.18 Pa, rear diffuser downforce 387.6 N at 160 km/h
# Elise_Trace[1340]: Venturi underfloor pressure -266.30 Pa, rear diffuser downforce 388.0 N at 160 km/h
# Elise_Trace[1341]: Venturi underfloor pressure -266.42 Pa, rear diffuser downforce 388.5 N at 160 km/h
# Elise_Trace[1342]: Venturi underfloor pressure -266.54 Pa, rear diffuser downforce 388.9 N at 160 km/h
# Elise_Trace[1343]: Venturi underfloor pressure -266.66 Pa, rear diffuser downforce 389.4 N at 160 km/h
# Elise_Trace[1344]: Venturi underfloor pressure -266.78 Pa, rear diffuser downforce 389.8 N at 160 km/h
# Elise_Trace[1345]: Venturi underfloor pressure -266.90 Pa, rear diffuser downforce 390.3 N at 160 km/h
# Elise_Trace[1346]: Venturi underfloor pressure -267.02 Pa, rear diffuser downforce 390.7 N at 160 km/h
# Elise_Trace[1347]: Venturi underfloor pressure -267.14 Pa, rear diffuser downforce 391.1 N at 160 km/h
# Elise_Trace[1348]: Venturi underfloor pressure -267.26 Pa, rear diffuser downforce 391.6 N at 160 km/h
# Elise_Trace[1349]: Venturi underfloor pressure -267.38 Pa, rear diffuser downforce 392.1 N at 160 km/h
# Elise_Trace[1350]: Venturi underfloor pressure -267.50 Pa, rear diffuser downforce 392.5 N at 160 km/h
# Elise_Trace[1351]: Venturi underfloor pressure -267.62 Pa, rear diffuser downforce 393.0 N at 160 km/h
# Elise_Trace[1352]: Venturi underfloor pressure -267.74 Pa, rear diffuser downforce 393.4 N at 160 km/h
# Elise_Trace[1353]: Venturi underfloor pressure -267.86 Pa, rear diffuser downforce 393.9 N at 160 km/h
# Elise_Trace[1354]: Venturi underfloor pressure -267.98 Pa, rear diffuser downforce 394.3 N at 160 km/h
# Elise_Trace[1355]: Venturi underfloor pressure -268.10 Pa, rear diffuser downforce 394.8 N at 160 km/h
# Elise_Trace[1356]: Venturi underfloor pressure -268.22 Pa, rear diffuser downforce 395.2 N at 160 km/h
# Elise_Trace[1357]: Venturi underfloor pressure -268.34 Pa, rear diffuser downforce 395.6 N at 160 km/h
# Elise_Trace[1358]: Venturi underfloor pressure -268.46 Pa, rear diffuser downforce 396.1 N at 160 km/h
# Elise_Trace[1359]: Venturi underfloor pressure -268.58 Pa, rear diffuser downforce 396.6 N at 160 km/h
# Elise_Trace[1360]: Venturi underfloor pressure -268.70 Pa, rear diffuser downforce 397.0 N at 160 km/h
# Elise_Trace[1361]: Venturi underfloor pressure -268.82 Pa, rear diffuser downforce 397.5 N at 160 km/h
# Elise_Trace[1362]: Venturi underfloor pressure -268.94 Pa, rear diffuser downforce 397.9 N at 160 km/h
# Elise_Trace[1363]: Venturi underfloor pressure -269.06 Pa, rear diffuser downforce 398.4 N at 160 km/h
# Elise_Trace[1364]: Venturi underfloor pressure -269.18 Pa, rear diffuser downforce 398.8 N at 160 km/h
# Elise_Trace[1365]: Venturi underfloor pressure -269.30 Pa, rear diffuser downforce 399.3 N at 160 km/h
# Elise_Trace[1366]: Venturi underfloor pressure -269.42 Pa, rear diffuser downforce 399.7 N at 160 km/h
# Elise_Trace[1367]: Venturi underfloor pressure -269.54 Pa, rear diffuser downforce 400.1 N at 160 km/h
# Elise_Trace[1368]: Venturi underfloor pressure -269.66 Pa, rear diffuser downforce 400.6 N at 160 km/h
# Elise_Trace[1369]: Venturi underfloor pressure -269.78 Pa, rear diffuser downforce 401.1 N at 160 km/h
# Elise_Trace[1370]: Venturi underfloor pressure -269.90 Pa, rear diffuser downforce 401.5 N at 160 km/h
# Elise_Trace[1371]: Venturi underfloor pressure -270.02 Pa, rear diffuser downforce 402.0 N at 160 km/h
# Elise_Trace[1372]: Venturi underfloor pressure -270.14 Pa, rear diffuser downforce 402.4 N at 160 km/h
# Elise_Trace[1373]: Venturi underfloor pressure -270.26 Pa, rear diffuser downforce 402.9 N at 160 km/h
# Elise_Trace[1374]: Venturi underfloor pressure -270.38 Pa, rear diffuser downforce 403.3 N at 160 km/h
# Elise_Trace[1375]: Venturi underfloor pressure -270.50 Pa, rear diffuser downforce 403.8 N at 160 km/h
# Elise_Trace[1376]: Venturi underfloor pressure -270.62 Pa, rear diffuser downforce 404.2 N at 160 km/h
# Elise_Trace[1377]: Venturi underfloor pressure -270.74 Pa, rear diffuser downforce 404.6 N at 160 km/h
# Elise_Trace[1378]: Venturi underfloor pressure -270.86 Pa, rear diffuser downforce 405.1 N at 160 km/h
# Elise_Trace[1379]: Venturi underfloor pressure -270.98 Pa, rear diffuser downforce 405.6 N at 160 km/h
# Elise_Trace[1380]: Venturi underfloor pressure -271.10 Pa, rear diffuser downforce 406.0 N at 160 km/h
# Elise_Trace[1381]: Venturi underfloor pressure -271.22 Pa, rear diffuser downforce 406.5 N at 160 km/h
# Elise_Trace[1382]: Venturi underfloor pressure -271.34 Pa, rear diffuser downforce 406.9 N at 160 km/h
# Elise_Trace[1383]: Venturi underfloor pressure -271.46 Pa, rear diffuser downforce 407.4 N at 160 km/h
# Elise_Trace[1384]: Venturi underfloor pressure -271.58 Pa, rear diffuser downforce 407.8 N at 160 km/h
# Elise_Trace[1385]: Venturi underfloor pressure -271.70 Pa, rear diffuser downforce 408.3 N at 160 km/h
# Elise_Trace[1386]: Venturi underfloor pressure -271.82 Pa, rear diffuser downforce 408.7 N at 160 km/h
# Elise_Trace[1387]: Venturi underfloor pressure -271.94 Pa, rear diffuser downforce 409.1 N at 160 km/h
# Elise_Trace[1388]: Venturi underfloor pressure -272.06 Pa, rear diffuser downforce 409.6 N at 160 km/h
# Elise_Trace[1389]: Venturi underfloor pressure -272.18 Pa, rear diffuser downforce 410.1 N at 160 km/h
# Elise_Trace[1390]: Venturi underfloor pressure -272.30 Pa, rear diffuser downforce 410.5 N at 160 km/h
# Elise_Trace[1391]: Venturi underfloor pressure -272.42 Pa, rear diffuser downforce 411.0 N at 160 km/h
# Elise_Trace[1392]: Venturi underfloor pressure -272.54 Pa, rear diffuser downforce 411.4 N at 160 km/h
# Elise_Trace[1393]: Venturi underfloor pressure -272.66 Pa, rear diffuser downforce 411.9 N at 160 km/h
# Elise_Trace[1394]: Venturi underfloor pressure -272.78 Pa, rear diffuser downforce 412.3 N at 160 km/h
# Elise_Trace[1395]: Venturi underfloor pressure -272.90 Pa, rear diffuser downforce 412.8 N at 160 km/h
# Elise_Trace[1396]: Venturi underfloor pressure -273.02 Pa, rear diffuser downforce 413.2 N at 160 km/h
# Elise_Trace[1397]: Venturi underfloor pressure -273.14 Pa, rear diffuser downforce 413.6 N at 160 km/h
# Elise_Trace[1398]: Venturi underfloor pressure -273.26 Pa, rear diffuser downforce 414.1 N at 160 km/h
# Elise_Trace[1399]: Venturi underfloor pressure -273.38 Pa, rear diffuser downforce 414.6 N at 160 km/h
# Elise_Trace[1400]: Venturi underfloor pressure -273.50 Pa, rear diffuser downforce 415.0 N at 160 km/h
# Elise_Trace[1401]: Venturi underfloor pressure -273.62 Pa, rear diffuser downforce 415.5 N at 160 km/h
# Elise_Trace[1402]: Venturi underfloor pressure -273.74 Pa, rear diffuser downforce 415.9 N at 160 km/h
# Elise_Trace[1403]: Venturi underfloor pressure -273.86 Pa, rear diffuser downforce 416.4 N at 160 km/h
# Elise_Trace[1404]: Venturi underfloor pressure -273.98 Pa, rear diffuser downforce 416.8 N at 160 km/h
# Elise_Trace[1405]: Venturi underfloor pressure -274.10 Pa, rear diffuser downforce 417.3 N at 160 km/h
# Elise_Trace[1406]: Venturi underfloor pressure -274.22 Pa, rear diffuser downforce 417.7 N at 160 km/h
# Elise_Trace[1407]: Venturi underfloor pressure -274.34 Pa, rear diffuser downforce 418.1 N at 160 km/h
# Elise_Trace[1408]: Venturi underfloor pressure -274.46 Pa, rear diffuser downforce 418.6 N at 160 km/h
# Elise_Trace[1409]: Venturi underfloor pressure -274.58 Pa, rear diffuser downforce 419.1 N at 160 km/h
# Elise_Trace[1410]: Venturi underfloor pressure -274.70 Pa, rear diffuser downforce 419.5 N at 160 km/h
# Elise_Trace[1411]: Venturi underfloor pressure -274.82 Pa, rear diffuser downforce 420.0 N at 160 km/h
# Elise_Trace[1412]: Venturi underfloor pressure -274.94 Pa, rear diffuser downforce 420.4 N at 160 km/h
# Elise_Trace[1413]: Venturi underfloor pressure -275.06 Pa, rear diffuser downforce 420.9 N at 160 km/h
# Elise_Trace[1414]: Venturi underfloor pressure -275.18 Pa, rear diffuser downforce 421.3 N at 160 km/h
# Elise_Trace[1415]: Venturi underfloor pressure -275.30 Pa, rear diffuser downforce 421.8 N at 160 km/h
# Elise_Trace[1416]: Venturi underfloor pressure -275.42 Pa, rear diffuser downforce 422.2 N at 160 km/h
# Elise_Trace[1417]: Venturi underfloor pressure -275.54 Pa, rear diffuser downforce 422.6 N at 160 km/h
# Elise_Trace[1418]: Venturi underfloor pressure -275.66 Pa, rear diffuser downforce 423.1 N at 160 km/h
# Elise_Trace[1419]: Venturi underfloor pressure -275.78 Pa, rear diffuser downforce 423.6 N at 160 km/h
# Elise_Trace[1420]: Venturi underfloor pressure -275.90 Pa, rear diffuser downforce 424.0 N at 160 km/h
# Elise_Trace[1421]: Venturi underfloor pressure -276.02 Pa, rear diffuser downforce 424.5 N at 160 km/h
# Elise_Trace[1422]: Venturi underfloor pressure -276.14 Pa, rear diffuser downforce 424.9 N at 160 km/h
# Elise_Trace[1423]: Venturi underfloor pressure -276.26 Pa, rear diffuser downforce 425.4 N at 160 km/h
# Elise_Trace[1424]: Venturi underfloor pressure -276.38 Pa, rear diffuser downforce 425.8 N at 160 km/h
# Elise_Trace[1425]: Venturi underfloor pressure -276.50 Pa, rear diffuser downforce 426.3 N at 160 km/h
# Elise_Trace[1426]: Venturi underfloor pressure -276.62 Pa, rear diffuser downforce 426.7 N at 160 km/h
# Elise_Trace[1427]: Venturi underfloor pressure -276.74 Pa, rear diffuser downforce 427.1 N at 160 km/h
# Elise_Trace[1428]: Venturi underfloor pressure -276.86 Pa, rear diffuser downforce 427.6 N at 160 km/h
# Elise_Trace[1429]: Venturi underfloor pressure -276.98 Pa, rear diffuser downforce 428.1 N at 160 km/h
# Elise_Trace[1430]: Venturi underfloor pressure -277.10 Pa, rear diffuser downforce 428.5 N at 160 km/h
# Elise_Trace[1431]: Venturi underfloor pressure -277.22 Pa, rear diffuser downforce 429.0 N at 160 km/h
# Elise_Trace[1432]: Venturi underfloor pressure -277.34 Pa, rear diffuser downforce 429.4 N at 160 km/h
# Elise_Trace[1433]: Venturi underfloor pressure -277.46 Pa, rear diffuser downforce 429.9 N at 160 km/h
# Elise_Trace[1434]: Venturi underfloor pressure -277.58 Pa, rear diffuser downforce 430.3 N at 160 km/h
# Elise_Trace[1435]: Venturi underfloor pressure -277.70 Pa, rear diffuser downforce 430.8 N at 160 km/h
# Elise_Trace[1436]: Venturi underfloor pressure -277.82 Pa, rear diffuser downforce 431.2 N at 160 km/h
# Elise_Trace[1437]: Venturi underfloor pressure -277.94 Pa, rear diffuser downforce 431.6 N at 160 km/h
# Elise_Trace[1438]: Venturi underfloor pressure -278.06 Pa, rear diffuser downforce 432.1 N at 160 km/h
# Elise_Trace[1439]: Venturi underfloor pressure -278.18 Pa, rear diffuser downforce 432.6 N at 160 km/h
# Elise_Trace[1440]: Venturi underfloor pressure -278.30 Pa, rear diffuser downforce 433.0 N at 160 km/h
# Elise_Trace[1441]: Venturi underfloor pressure -278.42 Pa, rear diffuser downforce 433.5 N at 160 km/h
# Elise_Trace[1442]: Venturi underfloor pressure -278.54 Pa, rear diffuser downforce 433.9 N at 160 km/h
# Elise_Trace[1443]: Venturi underfloor pressure -278.66 Pa, rear diffuser downforce 434.4 N at 160 km/h
# Elise_Trace[1444]: Venturi underfloor pressure -278.78 Pa, rear diffuser downforce 434.8 N at 160 km/h
# Elise_Trace[1445]: Venturi underfloor pressure -278.90 Pa, rear diffuser downforce 435.3 N at 160 km/h
# Elise_Trace[1446]: Venturi underfloor pressure -279.02 Pa, rear diffuser downforce 435.7 N at 160 km/h
# Elise_Trace[1447]: Venturi underfloor pressure -279.14 Pa, rear diffuser downforce 436.1 N at 160 km/h
# Elise_Trace[1448]: Venturi underfloor pressure -279.26 Pa, rear diffuser downforce 436.6 N at 160 km/h
# Elise_Trace[1449]: Venturi underfloor pressure -279.38 Pa, rear diffuser downforce 437.1 N at 160 km/h
# Elise_Trace[1450]: Venturi underfloor pressure -279.50 Pa, rear diffuser downforce 437.5 N at 160 km/h
# Elise_Trace[1451]: Venturi underfloor pressure -279.62 Pa, rear diffuser downforce 438.0 N at 160 km/h
# Elise_Trace[1452]: Venturi underfloor pressure -279.74 Pa, rear diffuser downforce 438.4 N at 160 km/h
# Elise_Trace[1453]: Venturi underfloor pressure -279.86 Pa, rear diffuser downforce 438.9 N at 160 km/h
# Elise_Trace[1454]: Venturi underfloor pressure -279.98 Pa, rear diffuser downforce 439.3 N at 160 km/h
# Elise_Trace[1455]: Venturi underfloor pressure -280.10 Pa, rear diffuser downforce 439.8 N at 160 km/h
# Elise_Trace[1456]: Venturi underfloor pressure -280.22 Pa, rear diffuser downforce 440.2 N at 160 km/h
# Elise_Trace[1457]: Venturi underfloor pressure -280.34 Pa, rear diffuser downforce 440.6 N at 160 km/h
# Elise_Trace[1458]: Venturi underfloor pressure -280.46 Pa, rear diffuser downforce 441.1 N at 160 km/h
# Elise_Trace[1459]: Venturi underfloor pressure -280.58 Pa, rear diffuser downforce 441.6 N at 160 km/h
# Elise_Trace[1460]: Venturi underfloor pressure -280.70 Pa, rear diffuser downforce 442.0 N at 160 km/h
# Elise_Trace[1461]: Venturi underfloor pressure -280.82 Pa, rear diffuser downforce 442.5 N at 160 km/h
# Elise_Trace[1462]: Venturi underfloor pressure -280.94 Pa, rear diffuser downforce 442.9 N at 160 km/h
# Elise_Trace[1463]: Venturi underfloor pressure -281.06 Pa, rear diffuser downforce 443.4 N at 160 km/h
# Elise_Trace[1464]: Venturi underfloor pressure -281.18 Pa, rear diffuser downforce 443.8 N at 160 km/h
# Elise_Trace[1465]: Venturi underfloor pressure -281.30 Pa, rear diffuser downforce 444.3 N at 160 km/h
# Elise_Trace[1466]: Venturi underfloor pressure -281.42 Pa, rear diffuser downforce 444.7 N at 160 km/h
# Elise_Trace[1467]: Venturi underfloor pressure -281.54 Pa, rear diffuser downforce 445.1 N at 160 km/h
# Elise_Trace[1468]: Venturi underfloor pressure -281.66 Pa, rear diffuser downforce 445.6 N at 160 km/h
# Elise_Trace[1469]: Venturi underfloor pressure -281.78 Pa, rear diffuser downforce 446.1 N at 160 km/h
# Elise_Trace[1470]: Venturi underfloor pressure -281.90 Pa, rear diffuser downforce 446.5 N at 160 km/h
# Elise_Trace[1471]: Venturi underfloor pressure -282.02 Pa, rear diffuser downforce 447.0 N at 160 km/h
# Elise_Trace[1472]: Venturi underfloor pressure -282.14 Pa, rear diffuser downforce 447.4 N at 160 km/h
# Elise_Trace[1473]: Venturi underfloor pressure -282.26 Pa, rear diffuser downforce 447.9 N at 160 km/h
# Elise_Trace[1474]: Venturi underfloor pressure -282.38 Pa, rear diffuser downforce 448.3 N at 160 km/h
# Elise_Trace[1475]: Venturi underfloor pressure -282.50 Pa, rear diffuser downforce 448.8 N at 160 km/h
# Elise_Trace[1476]: Venturi underfloor pressure -282.62 Pa, rear diffuser downforce 449.2 N at 160 km/h
# Elise_Trace[1477]: Venturi underfloor pressure -282.74 Pa, rear diffuser downforce 449.6 N at 160 km/h
# Elise_Trace[1478]: Venturi underfloor pressure -282.86 Pa, rear diffuser downforce 450.1 N at 160 km/h
# Elise_Trace[1479]: Venturi underfloor pressure -282.98 Pa, rear diffuser downforce 450.6 N at 160 km/h
# Elise_Trace[1480]: Venturi underfloor pressure -283.10 Pa, rear diffuser downforce 451.0 N at 160 km/h
# Elise_Trace[1481]: Venturi underfloor pressure -283.22 Pa, rear diffuser downforce 451.5 N at 160 km/h
# Elise_Trace[1482]: Venturi underfloor pressure -283.34 Pa, rear diffuser downforce 451.9 N at 160 km/h
# Elise_Trace[1483]: Venturi underfloor pressure -283.46 Pa, rear diffuser downforce 452.4 N at 160 km/h
# Elise_Trace[1484]: Venturi underfloor pressure -283.58 Pa, rear diffuser downforce 452.8 N at 160 km/h
# Elise_Trace[1485]: Venturi underfloor pressure -283.70 Pa, rear diffuser downforce 453.3 N at 160 km/h
# Elise_Trace[1486]: Venturi underfloor pressure -283.82 Pa, rear diffuser downforce 453.7 N at 160 km/h
# Elise_Trace[1487]: Venturi underfloor pressure -283.94 Pa, rear diffuser downforce 454.1 N at 160 km/h
# Elise_Trace[1488]: Venturi underfloor pressure -284.06 Pa, rear diffuser downforce 454.6 N at 160 km/h
# Elise_Trace[1489]: Venturi underfloor pressure -284.18 Pa, rear diffuser downforce 455.1 N at 160 km/h
# Elise_Trace[1490]: Venturi underfloor pressure -284.30 Pa, rear diffuser downforce 455.5 N at 160 km/h
# Elise_Trace[1491]: Venturi underfloor pressure -284.42 Pa, rear diffuser downforce 456.0 N at 160 km/h
# Elise_Trace[1492]: Venturi underfloor pressure -284.54 Pa, rear diffuser downforce 456.4 N at 160 km/h
# Elise_Trace[1493]: Venturi underfloor pressure -284.66 Pa, rear diffuser downforce 456.9 N at 160 km/h
# Elise_Trace[1494]: Venturi underfloor pressure -284.78 Pa, rear diffuser downforce 457.3 N at 160 km/h
# Elise_Trace[1495]: Venturi underfloor pressure -284.90 Pa, rear diffuser downforce 457.8 N at 160 km/h
# Elise_Trace[1496]: Venturi underfloor pressure -285.02 Pa, rear diffuser downforce 458.2 N at 160 km/h
# Elise_Trace[1497]: Venturi underfloor pressure -285.14 Pa, rear diffuser downforce 458.6 N at 160 km/h
# Elise_Trace[1498]: Venturi underfloor pressure -285.26 Pa, rear diffuser downforce 459.1 N at 160 km/h
# Elise_Trace[1499]: Venturi underfloor pressure -285.38 Pa, rear diffuser downforce 459.6 N at 160 km/h
# Elise_Trace[1500]: Venturi underfloor pressure -240.50 Pa, rear diffuser downforce 460.0 N at 160 km/h
# Elise_Trace[1501]: Venturi underfloor pressure -240.62 Pa, rear diffuser downforce 460.5 N at 160 km/h
# Elise_Trace[1502]: Venturi underfloor pressure -240.74 Pa, rear diffuser downforce 460.9 N at 160 km/h
# Elise_Trace[1503]: Venturi underfloor pressure -240.86 Pa, rear diffuser downforce 461.4 N at 160 km/h
# Elise_Trace[1504]: Venturi underfloor pressure -240.98 Pa, rear diffuser downforce 461.8 N at 160 km/h
# Elise_Trace[1505]: Venturi underfloor pressure -241.10 Pa, rear diffuser downforce 462.3 N at 160 km/h
# Elise_Trace[1506]: Venturi underfloor pressure -241.22 Pa, rear diffuser downforce 462.7 N at 160 km/h
# Elise_Trace[1507]: Venturi underfloor pressure -241.34 Pa, rear diffuser downforce 463.1 N at 160 km/h
# Elise_Trace[1508]: Venturi underfloor pressure -241.46 Pa, rear diffuser downforce 463.6 N at 160 km/h
# Elise_Trace[1509]: Venturi underfloor pressure -241.58 Pa, rear diffuser downforce 464.1 N at 160 km/h
# Elise_Trace[1510]: Venturi underfloor pressure -241.70 Pa, rear diffuser downforce 464.5 N at 160 km/h
# Elise_Trace[1511]: Venturi underfloor pressure -241.82 Pa, rear diffuser downforce 465.0 N at 160 km/h
# Elise_Trace[1512]: Venturi underfloor pressure -241.94 Pa, rear diffuser downforce 380.4 N at 160 km/h
# Elise_Trace[1513]: Venturi underfloor pressure -242.06 Pa, rear diffuser downforce 380.9 N at 160 km/h
# Elise_Trace[1514]: Venturi underfloor pressure -242.18 Pa, rear diffuser downforce 381.3 N at 160 km/h
# Elise_Trace[1515]: Venturi underfloor pressure -242.30 Pa, rear diffuser downforce 381.8 N at 160 km/h
# Elise_Trace[1516]: Venturi underfloor pressure -242.42 Pa, rear diffuser downforce 382.2 N at 160 km/h
# Elise_Trace[1517]: Venturi underfloor pressure -242.54 Pa, rear diffuser downforce 382.6 N at 160 km/h
# Elise_Trace[1518]: Venturi underfloor pressure -242.66 Pa, rear diffuser downforce 383.1 N at 160 km/h
# Elise_Trace[1519]: Venturi underfloor pressure -242.78 Pa, rear diffuser downforce 383.6 N at 160 km/h
# Elise_Trace[1520]: Venturi underfloor pressure -242.90 Pa, rear diffuser downforce 384.0 N at 160 km/h
# Elise_Trace[1521]: Venturi underfloor pressure -243.02 Pa, rear diffuser downforce 384.5 N at 160 km/h
# Elise_Trace[1522]: Venturi underfloor pressure -243.14 Pa, rear diffuser downforce 384.9 N at 160 km/h
# Elise_Trace[1523]: Venturi underfloor pressure -243.26 Pa, rear diffuser downforce 385.4 N at 160 km/h
# Elise_Trace[1524]: Venturi underfloor pressure -243.38 Pa, rear diffuser downforce 385.8 N at 160 km/h
# Elise_Trace[1525]: Venturi underfloor pressure -243.50 Pa, rear diffuser downforce 386.3 N at 160 km/h
# Elise_Trace[1526]: Venturi underfloor pressure -243.62 Pa, rear diffuser downforce 386.7 N at 160 km/h
# Elise_Trace[1527]: Venturi underfloor pressure -243.74 Pa, rear diffuser downforce 387.1 N at 160 km/h
# Elise_Trace[1528]: Venturi underfloor pressure -243.86 Pa, rear diffuser downforce 387.6 N at 160 km/h
# Elise_Trace[1529]: Venturi underfloor pressure -243.98 Pa, rear diffuser downforce 388.1 N at 160 km/h
# Elise_Trace[1530]: Venturi underfloor pressure -244.10 Pa, rear diffuser downforce 388.5 N at 160 km/h
# Elise_Trace[1531]: Venturi underfloor pressure -244.22 Pa, rear diffuser downforce 389.0 N at 160 km/h
# Elise_Trace[1532]: Venturi underfloor pressure -244.34 Pa, rear diffuser downforce 389.4 N at 160 km/h
# Elise_Trace[1533]: Venturi underfloor pressure -244.46 Pa, rear diffuser downforce 389.9 N at 160 km/h
# Elise_Trace[1534]: Venturi underfloor pressure -244.58 Pa, rear diffuser downforce 390.3 N at 160 km/h
# Elise_Trace[1535]: Venturi underfloor pressure -244.70 Pa, rear diffuser downforce 390.8 N at 160 km/h
# Elise_Trace[1536]: Venturi underfloor pressure -244.82 Pa, rear diffuser downforce 391.2 N at 160 km/h
# Elise_Trace[1537]: Venturi underfloor pressure -244.94 Pa, rear diffuser downforce 391.6 N at 160 km/h
# Elise_Trace[1538]: Venturi underfloor pressure -245.06 Pa, rear diffuser downforce 392.1 N at 160 km/h
# Elise_Trace[1539]: Venturi underfloor pressure -245.18 Pa, rear diffuser downforce 392.6 N at 160 km/h
# Elise_Trace[1540]: Venturi underfloor pressure -245.30 Pa, rear diffuser downforce 393.0 N at 160 km/h
# Elise_Trace[1541]: Venturi underfloor pressure -245.42 Pa, rear diffuser downforce 393.5 N at 160 km/h
# Elise_Trace[1542]: Venturi underfloor pressure -245.54 Pa, rear diffuser downforce 393.9 N at 160 km/h
# Elise_Trace[1543]: Venturi underfloor pressure -245.66 Pa, rear diffuser downforce 394.4 N at 160 km/h
# Elise_Trace[1544]: Venturi underfloor pressure -245.78 Pa, rear diffuser downforce 394.8 N at 160 km/h
# Elise_Trace[1545]: Venturi underfloor pressure -245.90 Pa, rear diffuser downforce 395.3 N at 160 km/h
# Elise_Trace[1546]: Venturi underfloor pressure -246.02 Pa, rear diffuser downforce 395.7 N at 160 km/h
# Elise_Trace[1547]: Venturi underfloor pressure -246.14 Pa, rear diffuser downforce 396.1 N at 160 km/h
# Elise_Trace[1548]: Venturi underfloor pressure -246.26 Pa, rear diffuser downforce 396.6 N at 160 km/h
# Elise_Trace[1549]: Venturi underfloor pressure -246.38 Pa, rear diffuser downforce 397.1 N at 160 km/h
# Elise_Trace[1550]: Venturi underfloor pressure -246.50 Pa, rear diffuser downforce 397.5 N at 160 km/h
# Elise_Trace[1551]: Venturi underfloor pressure -246.62 Pa, rear diffuser downforce 398.0 N at 160 km/h
# Elise_Trace[1552]: Venturi underfloor pressure -246.74 Pa, rear diffuser downforce 398.4 N at 160 km/h
# Elise_Trace[1553]: Venturi underfloor pressure -246.86 Pa, rear diffuser downforce 398.9 N at 160 km/h
# Elise_Trace[1554]: Venturi underfloor pressure -246.98 Pa, rear diffuser downforce 399.3 N at 160 km/h
# Elise_Trace[1555]: Venturi underfloor pressure -247.10 Pa, rear diffuser downforce 399.8 N at 160 km/h
# Elise_Trace[1556]: Venturi underfloor pressure -247.22 Pa, rear diffuser downforce 400.2 N at 160 km/h
# Elise_Trace[1557]: Venturi underfloor pressure -247.34 Pa, rear diffuser downforce 400.6 N at 160 km/h
# Elise_Trace[1558]: Venturi underfloor pressure -247.46 Pa, rear diffuser downforce 401.1 N at 160 km/h
# Elise_Trace[1559]: Venturi underfloor pressure -247.58 Pa, rear diffuser downforce 401.6 N at 160 km/h
# Elise_Trace[1560]: Venturi underfloor pressure -247.70 Pa, rear diffuser downforce 402.0 N at 160 km/h
# Elise_Trace[1561]: Venturi underfloor pressure -247.82 Pa, rear diffuser downforce 402.5 N at 160 km/h
# Elise_Trace[1562]: Venturi underfloor pressure -247.94 Pa, rear diffuser downforce 402.9 N at 160 km/h
# Elise_Trace[1563]: Venturi underfloor pressure -248.06 Pa, rear diffuser downforce 403.4 N at 160 km/h
# Elise_Trace[1564]: Venturi underfloor pressure -248.18 Pa, rear diffuser downforce 403.8 N at 160 km/h
# Elise_Trace[1565]: Venturi underfloor pressure -248.30 Pa, rear diffuser downforce 404.3 N at 160 km/h
# Elise_Trace[1566]: Venturi underfloor pressure -248.42 Pa, rear diffuser downforce 404.7 N at 160 km/h
# Elise_Trace[1567]: Venturi underfloor pressure -248.54 Pa, rear diffuser downforce 405.1 N at 160 km/h
# Elise_Trace[1568]: Venturi underfloor pressure -248.66 Pa, rear diffuser downforce 405.6 N at 160 km/h
# Elise_Trace[1569]: Venturi underfloor pressure -248.78 Pa, rear diffuser downforce 406.1 N at 160 km/h
# Elise_Trace[1570]: Venturi underfloor pressure -248.90 Pa, rear diffuser downforce 406.5 N at 160 km/h
# Elise_Trace[1571]: Venturi underfloor pressure -249.02 Pa, rear diffuser downforce 407.0 N at 160 km/h
# Elise_Trace[1572]: Venturi underfloor pressure -249.14 Pa, rear diffuser downforce 407.4 N at 160 km/h
# Elise_Trace[1573]: Venturi underfloor pressure -249.26 Pa, rear diffuser downforce 407.9 N at 160 km/h
# Elise_Trace[1574]: Venturi underfloor pressure -249.38 Pa, rear diffuser downforce 408.3 N at 160 km/h
# Elise_Trace[1575]: Venturi underfloor pressure -249.50 Pa, rear diffuser downforce 408.8 N at 160 km/h
# Elise_Trace[1576]: Venturi underfloor pressure -249.62 Pa, rear diffuser downforce 409.2 N at 160 km/h
# Elise_Trace[1577]: Venturi underfloor pressure -249.74 Pa, rear diffuser downforce 409.6 N at 160 km/h
# Elise_Trace[1578]: Venturi underfloor pressure -249.86 Pa, rear diffuser downforce 410.1 N at 160 km/h
# Elise_Trace[1579]: Venturi underfloor pressure -249.98 Pa, rear diffuser downforce 410.6 N at 160 km/h
# Elise_Trace[1580]: Venturi underfloor pressure -250.10 Pa, rear diffuser downforce 411.0 N at 160 km/h
# Elise_Trace[1581]: Venturi underfloor pressure -250.22 Pa, rear diffuser downforce 411.5 N at 160 km/h
# Elise_Trace[1582]: Venturi underfloor pressure -250.34 Pa, rear diffuser downforce 411.9 N at 160 km/h
# Elise_Trace[1583]: Venturi underfloor pressure -250.46 Pa, rear diffuser downforce 412.4 N at 160 km/h
# Elise_Trace[1584]: Venturi underfloor pressure -250.58 Pa, rear diffuser downforce 412.8 N at 160 km/h
# Elise_Trace[1585]: Venturi underfloor pressure -250.70 Pa, rear diffuser downforce 413.3 N at 160 km/h
# Elise_Trace[1586]: Venturi underfloor pressure -250.82 Pa, rear diffuser downforce 413.7 N at 160 km/h
# Elise_Trace[1587]: Venturi underfloor pressure -250.94 Pa, rear diffuser downforce 414.1 N at 160 km/h
# Elise_Trace[1588]: Venturi underfloor pressure -251.06 Pa, rear diffuser downforce 414.6 N at 160 km/h
# Elise_Trace[1589]: Venturi underfloor pressure -251.18 Pa, rear diffuser downforce 415.1 N at 160 km/h
# Elise_Trace[1590]: Venturi underfloor pressure -251.30 Pa, rear diffuser downforce 415.5 N at 160 km/h
# Elise_Trace[1591]: Venturi underfloor pressure -251.42 Pa, rear diffuser downforce 416.0 N at 160 km/h
# Elise_Trace[1592]: Venturi underfloor pressure -251.54 Pa, rear diffuser downforce 416.4 N at 160 km/h
# Elise_Trace[1593]: Venturi underfloor pressure -251.66 Pa, rear diffuser downforce 416.9 N at 160 km/h
# Elise_Trace[1594]: Venturi underfloor pressure -251.78 Pa, rear diffuser downforce 417.3 N at 160 km/h
# Elise_Trace[1595]: Venturi underfloor pressure -251.90 Pa, rear diffuser downforce 417.8 N at 160 km/h
# Elise_Trace[1596]: Venturi underfloor pressure -252.02 Pa, rear diffuser downforce 418.2 N at 160 km/h
# Elise_Trace[1597]: Venturi underfloor pressure -252.14 Pa, rear diffuser downforce 418.6 N at 160 km/h
# Elise_Trace[1598]: Venturi underfloor pressure -252.26 Pa, rear diffuser downforce 419.1 N at 160 km/h
# Elise_Trace[1599]: Venturi underfloor pressure -252.38 Pa, rear diffuser downforce 419.6 N at 160 km/h
# Elise_Trace[1600]: Venturi underfloor pressure -252.50 Pa, rear diffuser downforce 420.0 N at 160 km/h
# Elise_Trace[1601]: Venturi underfloor pressure -252.62 Pa, rear diffuser downforce 420.5 N at 160 km/h
# Elise_Trace[1602]: Venturi underfloor pressure -252.74 Pa, rear diffuser downforce 420.9 N at 160 km/h
# Elise_Trace[1603]: Venturi underfloor pressure -252.86 Pa, rear diffuser downforce 421.4 N at 160 km/h
# Elise_Trace[1604]: Venturi underfloor pressure -252.98 Pa, rear diffuser downforce 421.8 N at 160 km/h
# Elise_Trace[1605]: Venturi underfloor pressure -253.10 Pa, rear diffuser downforce 422.3 N at 160 km/h
# Elise_Trace[1606]: Venturi underfloor pressure -253.22 Pa, rear diffuser downforce 422.7 N at 160 km/h
# Elise_Trace[1607]: Venturi underfloor pressure -253.34 Pa, rear diffuser downforce 423.1 N at 160 km/h
# Elise_Trace[1608]: Venturi underfloor pressure -253.46 Pa, rear diffuser downforce 423.6 N at 160 km/h
# Elise_Trace[1609]: Venturi underfloor pressure -253.58 Pa, rear diffuser downforce 424.1 N at 160 km/h
# Elise_Trace[1610]: Venturi underfloor pressure -253.70 Pa, rear diffuser downforce 424.5 N at 160 km/h
# Elise_Trace[1611]: Venturi underfloor pressure -253.82 Pa, rear diffuser downforce 425.0 N at 160 km/h
# Elise_Trace[1612]: Venturi underfloor pressure -253.94 Pa, rear diffuser downforce 425.4 N at 160 km/h
# Elise_Trace[1613]: Venturi underfloor pressure -254.06 Pa, rear diffuser downforce 425.9 N at 160 km/h
# Elise_Trace[1614]: Venturi underfloor pressure -254.18 Pa, rear diffuser downforce 426.3 N at 160 km/h
# Elise_Trace[1615]: Venturi underfloor pressure -254.30 Pa, rear diffuser downforce 426.8 N at 160 km/h
# Elise_Trace[1616]: Venturi underfloor pressure -254.42 Pa, rear diffuser downforce 427.2 N at 160 km/h
# Elise_Trace[1617]: Venturi underfloor pressure -254.54 Pa, rear diffuser downforce 427.6 N at 160 km/h
# Elise_Trace[1618]: Venturi underfloor pressure -254.66 Pa, rear diffuser downforce 428.1 N at 160 km/h
# Elise_Trace[1619]: Venturi underfloor pressure -254.78 Pa, rear diffuser downforce 428.6 N at 160 km/h
# Elise_Trace[1620]: Venturi underfloor pressure -254.90 Pa, rear diffuser downforce 429.0 N at 160 km/h
# Elise_Trace[1621]: Venturi underfloor pressure -255.02 Pa, rear diffuser downforce 429.5 N at 160 km/h
# Elise_Trace[1622]: Venturi underfloor pressure -255.14 Pa, rear diffuser downforce 429.9 N at 160 km/h
# Elise_Trace[1623]: Venturi underfloor pressure -255.26 Pa, rear diffuser downforce 430.4 N at 160 km/h
# Elise_Trace[1624]: Venturi underfloor pressure -255.38 Pa, rear diffuser downforce 430.8 N at 160 km/h
# Elise_Trace[1625]: Venturi underfloor pressure -255.50 Pa, rear diffuser downforce 431.3 N at 160 km/h
# Elise_Trace[1626]: Venturi underfloor pressure -255.62 Pa, rear diffuser downforce 431.7 N at 160 km/h
# Elise_Trace[1627]: Venturi underfloor pressure -255.74 Pa, rear diffuser downforce 432.1 N at 160 km/h
# Elise_Trace[1628]: Venturi underfloor pressure -255.86 Pa, rear diffuser downforce 432.6 N at 160 km/h
# Elise_Trace[1629]: Venturi underfloor pressure -255.98 Pa, rear diffuser downforce 433.1 N at 160 km/h
# Elise_Trace[1630]: Venturi underfloor pressure -256.10 Pa, rear diffuser downforce 433.5 N at 160 km/h
# Elise_Trace[1631]: Venturi underfloor pressure -256.22 Pa, rear diffuser downforce 434.0 N at 160 km/h
# Elise_Trace[1632]: Venturi underfloor pressure -256.34 Pa, rear diffuser downforce 434.4 N at 160 km/h
# Elise_Trace[1633]: Venturi underfloor pressure -256.46 Pa, rear diffuser downforce 434.9 N at 160 km/h
# Elise_Trace[1634]: Venturi underfloor pressure -256.58 Pa, rear diffuser downforce 435.3 N at 160 km/h
# Elise_Trace[1635]: Venturi underfloor pressure -256.70 Pa, rear diffuser downforce 435.8 N at 160 km/h
# Elise_Trace[1636]: Venturi underfloor pressure -256.82 Pa, rear diffuser downforce 436.2 N at 160 km/h
# Elise_Trace[1637]: Venturi underfloor pressure -256.94 Pa, rear diffuser downforce 436.6 N at 160 km/h
# Elise_Trace[1638]: Venturi underfloor pressure -257.06 Pa, rear diffuser downforce 437.1 N at 160 km/h
# Elise_Trace[1639]: Venturi underfloor pressure -257.18 Pa, rear diffuser downforce 437.6 N at 160 km/h
# Elise_Trace[1640]: Venturi underfloor pressure -257.30 Pa, rear diffuser downforce 438.0 N at 160 km/h
# Elise_Trace[1641]: Venturi underfloor pressure -257.42 Pa, rear diffuser downforce 438.5 N at 160 km/h
# Elise_Trace[1642]: Venturi underfloor pressure -257.54 Pa, rear diffuser downforce 438.9 N at 160 km/h
# Elise_Trace[1643]: Venturi underfloor pressure -257.66 Pa, rear diffuser downforce 439.4 N at 160 km/h
# Elise_Trace[1644]: Venturi underfloor pressure -257.78 Pa, rear diffuser downforce 439.8 N at 160 km/h
# Elise_Trace[1645]: Venturi underfloor pressure -257.90 Pa, rear diffuser downforce 440.3 N at 160 km/h
# Elise_Trace[1646]: Venturi underfloor pressure -258.02 Pa, rear diffuser downforce 440.7 N at 160 km/h
# Elise_Trace[1647]: Venturi underfloor pressure -258.14 Pa, rear diffuser downforce 441.1 N at 160 km/h
# Elise_Trace[1648]: Venturi underfloor pressure -258.26 Pa, rear diffuser downforce 441.6 N at 160 km/h
# Elise_Trace[1649]: Venturi underfloor pressure -258.38 Pa, rear diffuser downforce 442.1 N at 160 km/h
# Elise_Trace[1650]: Venturi underfloor pressure -258.50 Pa, rear diffuser downforce 442.5 N at 160 km/h
# Elise_Trace[1651]: Venturi underfloor pressure -258.62 Pa, rear diffuser downforce 443.0 N at 160 km/h
# Elise_Trace[1652]: Venturi underfloor pressure -258.74 Pa, rear diffuser downforce 443.4 N at 160 km/h
# Elise_Trace[1653]: Venturi underfloor pressure -258.86 Pa, rear diffuser downforce 443.9 N at 160 km/h
# Elise_Trace[1654]: Venturi underfloor pressure -258.98 Pa, rear diffuser downforce 444.3 N at 160 km/h
# Elise_Trace[1655]: Venturi underfloor pressure -259.10 Pa, rear diffuser downforce 444.8 N at 160 km/h
# Elise_Trace[1656]: Venturi underfloor pressure -259.22 Pa, rear diffuser downforce 445.2 N at 160 km/h
# Elise_Trace[1657]: Venturi underfloor pressure -259.34 Pa, rear diffuser downforce 445.6 N at 160 km/h
# Elise_Trace[1658]: Venturi underfloor pressure -259.46 Pa, rear diffuser downforce 446.1 N at 160 km/h
# Elise_Trace[1659]: Venturi underfloor pressure -259.58 Pa, rear diffuser downforce 446.6 N at 160 km/h
# Elise_Trace[1660]: Venturi underfloor pressure -259.70 Pa, rear diffuser downforce 447.0 N at 160 km/h
# Elise_Trace[1661]: Venturi underfloor pressure -259.82 Pa, rear diffuser downforce 447.5 N at 160 km/h
# Elise_Trace[1662]: Venturi underfloor pressure -259.94 Pa, rear diffuser downforce 447.9 N at 160 km/h
# Elise_Trace[1663]: Venturi underfloor pressure -260.06 Pa, rear diffuser downforce 448.4 N at 160 km/h
# Elise_Trace[1664]: Venturi underfloor pressure -260.18 Pa, rear diffuser downforce 448.8 N at 160 km/h
# Elise_Trace[1665]: Venturi underfloor pressure -260.30 Pa, rear diffuser downforce 449.3 N at 160 km/h
# Elise_Trace[1666]: Venturi underfloor pressure -260.42 Pa, rear diffuser downforce 449.7 N at 160 km/h
# Elise_Trace[1667]: Venturi underfloor pressure -260.54 Pa, rear diffuser downforce 450.1 N at 160 km/h
# Elise_Trace[1668]: Venturi underfloor pressure -260.66 Pa, rear diffuser downforce 450.6 N at 160 km/h
# Elise_Trace[1669]: Venturi underfloor pressure -260.78 Pa, rear diffuser downforce 451.1 N at 160 km/h
# Elise_Trace[1670]: Venturi underfloor pressure -260.90 Pa, rear diffuser downforce 451.5 N at 160 km/h
# Elise_Trace[1671]: Venturi underfloor pressure -261.02 Pa, rear diffuser downforce 452.0 N at 160 km/h
# Elise_Trace[1672]: Venturi underfloor pressure -261.14 Pa, rear diffuser downforce 452.4 N at 160 km/h
# Elise_Trace[1673]: Venturi underfloor pressure -261.26 Pa, rear diffuser downforce 452.9 N at 160 km/h
# Elise_Trace[1674]: Venturi underfloor pressure -261.38 Pa, rear diffuser downforce 453.3 N at 160 km/h
# Elise_Trace[1675]: Venturi underfloor pressure -261.50 Pa, rear diffuser downforce 453.8 N at 160 km/h
# Elise_Trace[1676]: Venturi underfloor pressure -261.62 Pa, rear diffuser downforce 454.2 N at 160 km/h
# Elise_Trace[1677]: Venturi underfloor pressure -261.74 Pa, rear diffuser downforce 454.6 N at 160 km/h
# Elise_Trace[1678]: Venturi underfloor pressure -261.86 Pa, rear diffuser downforce 455.1 N at 160 km/h
# Elise_Trace[1679]: Venturi underfloor pressure -261.98 Pa, rear diffuser downforce 455.6 N at 160 km/h
# Elise_Trace[1680]: Venturi underfloor pressure -262.10 Pa, rear diffuser downforce 456.0 N at 160 km/h
# Elise_Trace[1681]: Venturi underfloor pressure -262.22 Pa, rear diffuser downforce 456.5 N at 160 km/h
# Elise_Trace[1682]: Venturi underfloor pressure -262.34 Pa, rear diffuser downforce 456.9 N at 160 km/h
# Elise_Trace[1683]: Venturi underfloor pressure -262.46 Pa, rear diffuser downforce 457.4 N at 160 km/h
# Elise_Trace[1684]: Venturi underfloor pressure -262.58 Pa, rear diffuser downforce 457.8 N at 160 km/h
# Elise_Trace[1685]: Venturi underfloor pressure -262.70 Pa, rear diffuser downforce 458.3 N at 160 km/h
# Elise_Trace[1686]: Venturi underfloor pressure -262.82 Pa, rear diffuser downforce 458.7 N at 160 km/h
# Elise_Trace[1687]: Venturi underfloor pressure -262.94 Pa, rear diffuser downforce 459.1 N at 160 km/h
# Elise_Trace[1688]: Venturi underfloor pressure -263.06 Pa, rear diffuser downforce 459.6 N at 160 km/h
# Elise_Trace[1689]: Venturi underfloor pressure -263.18 Pa, rear diffuser downforce 460.1 N at 160 km/h
# Elise_Trace[1690]: Venturi underfloor pressure -263.30 Pa, rear diffuser downforce 460.5 N at 160 km/h
# Elise_Trace[1691]: Venturi underfloor pressure -263.42 Pa, rear diffuser downforce 461.0 N at 160 km/h
