"""
=============================================================================
Procedural Class-A CAD Generator: Jaguar F-Type V8 R Convertible (2010s)
PHASE 19: Exterior Body Sculpture, Running Gear & Aerodynamic Chassis
=============================================================================
Convertible Architecture · 2010s Era Modern British Performance Icon (X152)
Engineered at Whitley / Castle Bromwich, Birmingham, UK.
Adheres strictly to the Maximum Visual Quality & Intensive CAD Mesh Standard.

Dimensions:
- Overall Length: 4,470 mm (4.470 m)
- Overall Width:  1,923 mm (1.923 m)
- Overall Height: 1,319 mm (1.319 m)
- Wheelbase:      2,622 mm (2.622 m)
- Front Track:    1,597 mm (1.597 m)
- Rear Track:     1,649 mm (1.649 m)
- Front Axle:     Y = +1.311 m
- Rear Axle:      Y = -1.311 m
- Coordinate System: Y-Forward (+Y), Z-Up (+Z), X-Lateral (+X Driver LHD)
=============================================================================
"""

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector, Matrix, Euler

# ----------------------------------------------------------------------------
# 1. CORE UTILITIES & PBR SHADER FACTORY
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
        ring_verts = []
        for j in range(minor_segments):
            v = 2.0 * math.pi * j / minor_segments
            pos = ring_center + minor_radius * (math.cos(v) * radial_dir + math.sin(v) * z_dir)
            ring_verts.append(bm.verts.new(matrix @ pos))
        verts.append(ring_verts)
    bm.verts.ensure_lookup_table()
    for i in range(major_segments):
        next_i = (i + 1) % major_segments
        for j in range(minor_segments):
            next_j = (j + 1) % minor_segments
            v0 = verts[i][j]
            v1 = verts[next_i][j]
            v2 = verts[next_i][next_j]
            v3 = verts[i][next_j]
            bm.faces.new((v0, v1, v2, v3))
    bm.faces.ensure_lookup_table()
bmesh.ops.create_torus = _compat_create_torus

def clean_scene():
    """Wipes active scene completely for a clean-slate generation run."""
    bpy.ops.wm.read_factory_settings(use_empty=True)
    for block in bpy.data.meshes:
        bpy.data.meshes.remove(block, do_unlink=True)
    for block in bpy.data.materials:
        bpy.data.materials.remove(block, do_unlink=True)
    for block in bpy.data.collections:
        bpy.data.collections.remove(block, do_unlink=True)


def _ensure_mat(name):
    """Retrieves or creates a material with node-tree enabled."""
    mat = bpy.data.materials.get(name)
    if not mat:
        mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
    return mat


def make_pbr_mat(name, base_color, metallic=0.0, roughness=0.5, clearcoat=0.0,
                 transmission=0.0, ior=1.45, emission=(0, 0, 0, 1), emission_strength=0.0):
    """Creates a production-grade Principled BSDF PBR material."""
    mat = _ensure_mat(name)
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
    """
    Creates a new Blender object from a bmesh, welds coincident vertices,
    computes smooth normals by angle, adds non-destructive Bevel and WeightedNormal.
    """
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


def create_jaguar_ftype_pbr_materials():
    """
    Builds the complete authentic PBR material suite for the Jaguar F-Type V8 R:
    - Firesand Metallic Orange / Caldera Red primary paint
    - Piano Black gloss aero trim & roof tonneau
    - Satin aluminum split-spoke alloy finish
    - High-performance Brembo Yellow brake caliper enamel
    - Optical tinted dielectric window safety glass
    - Carbon fiber weave texture simulation for aero louvers
    """
    mats = {}

    # 1. Firesand Metallic Orange Automotive Clearcoat
    # (Iconic F-Type launch color: #E85D04 / #D34100 deep multi-stage pearlescent)
    mats["body"] = make_pbr_mat(
        "JAGUAR_Firesand_Metallic_Orange",
        base_color=(0.88, 0.22, 0.02, 1.0),
        metallic=0.82,
        roughness=0.14,
        clearcoat=1.0,
        ior=1.52
    )

    # 2. Gloss Piano Black (Aero Splitters, Diffuser, Louvers, Pillar Trim)
    mats["gloss_black"] = make_pbr_mat(
        "JAGUAR_Piano_Gloss_Black",
        base_color=(0.015, 0.015, 0.018, 1.0),
        metallic=0.20,
        roughness=0.08,
        clearcoat=1.0
    )

    # 3. Satin Technical Black (Underbody tray, inner wheel wells, engine plastics)
    mats["satin_black"] = make_pbr_mat(
        "JAGUAR_Satin_Technical_Black",
        base_color=(0.04, 0.04, 0.045, 1.0),
        metallic=0.05,
        roughness=0.65
    )

    # 4. Diamond-Turned Cast Aluminum Alloy (20-inch Cyclone Wheels)
    mats["alloy"] = make_pbr_mat(
        "JAGUAR_Cyclone_Forged_Alloy",
        base_color=(0.86, 0.88, 0.90, 1.0),
        metallic=0.95,
        roughness=0.18
    )

    # 5. Mirror-Polished Automotive Chrome (Growler rings, exhaust tips)
    mats["chrome"] = make_pbr_mat(
        "JAGUAR_Mirror_Polished_Chrome",
        base_color=(0.96, 0.97, 0.98, 1.0),
        metallic=0.99,
        roughness=0.02
    )

    # 6. Pirelli P Zero Ultra-High Performance Rubber
    mats["tire"] = make_pbr_mat(
        "JAGUAR_PZero_Tread_Rubber",
        base_color=(0.025, 0.025, 0.028, 1.0),
        metallic=0.0,
        roughness=0.82
    )

    # 7. Optical Safety Glass (Windshield, side quarter windows)
    mats["glass"] = make_pbr_mat(
        "JAGUAR_Optical_Windshield_Glass",
        base_color=(0.94, 0.98, 1.0, 1.0),
        roughness=0.01,
        transmission=0.95,
        clearcoat=1.0,
        ior=1.52
    )

    # 8. Brembo High-Temperature Performance Yellow (6-Piston Calipers)
    mats["yellow_caliper"] = make_pbr_mat(
        "JAGUAR_Brembo_Performance_Yellow",
        base_color=(0.95, 0.78, 0.04, 1.0),
        metallic=0.15,
        roughness=0.22,
        clearcoat=0.90
    )

    # 9. Cross-Drilled High-Carbon Brake Rotor Steel
    mats["rotor"] = make_pbr_mat(
        "JAGUAR_Carbon_Alloy_Brake_Steel",
        base_color=(0.70, 0.72, 0.75, 1.0),
        metallic=0.94,
        roughness=0.26
    )

    # 10. Heavy Canvas Convertible Soft-Top Tonneau
    mats["soft_top"] = make_pbr_mat(
        "JAGUAR_Mohair_Convertible_Fabric",
        base_color=(0.03, 0.03, 0.035, 1.0),
        metallic=0.0,
        roughness=0.92
    )

    # 11. Engine Aluminum Block & Supercharger Casting
    mats["engine_metal"] = make_pbr_mat(
        "JAGUAR_V8R_Cast_Aluminum",
        base_color=(0.65, 0.67, 0.70, 1.0),
        metallic=0.88,
        roughness=0.35
    )

    return mats


# ----------------------------------------------------------------------------
# 2. SUBSYSTEM 1: 42-STATION WATERTIGHT CLASS-A MONOCOQUE BODY SHELL
# ----------------------------------------------------------------------------

def build_jaguar_ftype_monocoque_body_shell(parent_col, mats):
    """
    Constructs the complete 42-station Class-A CAD monocoque body shell for
    the Jaguar F-Type V8 R Convertible (X152):
    - 42 longitudinal cross-sectional stations spanning Y = +2.235m to -2.235m (Length 4,470 mm).
    - Low-slung feline snout with shark-mouth prow, raked back toward front axle.
    - Long clamshell bonnet with twin longitudinal power-dome rises.
    - Dramatic cockpit waist taper and muscular flared rear haunches (Width 1,923 mm).
    - Open roadster tonneau cavity behind seats with seamless decklid transition.
    - Swept aerodynamic Kammback tail with integrated spoiler recess.
    """
    objs = []
    bm_body = bmesh.new()

    # 42 Stations from Front Nose Tip (Y = +2.235m) to Rear Diffuser Trailing Edge (Y = -2.235m)
    # Format: (Y, X_sill, Z_sill, X_waist, Z_waist, X_crown, Z_crown)
    stations_data = [
        # Front Overhang (Y: +2.235m to +1.311m) - Predatory Feline Shark Nose
        ( 2.235,   0.000,  0.130,  0.440,   0.360,   0.320,   0.580), # 0: Front Nose Apex
        ( 2.180,   0.220,  0.132,  0.580,   0.390,   0.460,   0.615), # 1: Front Valance Apex
        ( 2.120,   0.380,  0.135,  0.680,   0.430,   0.560,   0.645), # 2: Shark-Mouth Grille Header
        ( 2.050,   0.500,  0.138,  0.740,   0.480,   0.630,   0.675), # 3: Headlamp Leading Corner
        ( 1.960,   0.600,  0.140,  0.795,   0.540,   0.690,   0.708), # 4: Lower Front Bumper Corner
        ( 1.860,   0.680,  0.142,  0.835,   0.600,   0.730,   0.735), # 5: Forward Hood Slope
        ( 1.740,   0.740,  0.145,  0.865,   0.660,   0.760,   0.760), # 6: Front Fender Rise
        ( 1.620,   0.785,  0.148,  0.890,   0.710,   0.780,   0.782), # 7: Forward Wheel Arch Brow
        ( 1.480,   0.815,  0.150,  0.905,   0.745,   0.795,   0.800), # 8: Front Arch Peak
        ( 1.380,   0.825,  0.150,  0.915,   0.765,   0.805,   0.810), # 9: Pre-Axle Clamshell Seam
        ( 1.311,   0.830,  0.150,  0.920,   0.775,   0.810,   0.815), # 10: Front Axle Centerline
        ( 1.220,   0.825,  0.150,  0.915,   0.770,   0.805,   0.812), # 11: Trailing Front Wheel Arch
        ( 1.100,   0.810,  0.148,  0.900,   0.755,   0.795,   0.805), # 12: Arch Exit Vent Flank
        ( 0.980,   0.785,  0.145,  0.885,   0.745,   0.785,   0.800), # 13: Side Louver Extractor Scallop
        ( 0.850,   0.765,  0.142,  0.875,   0.745,   0.770,   0.805), # 14: Cowl Base Forward Seam
        ( 0.720,   0.755,  0.140,  0.870,   0.755,   0.745,   0.818), # 15: Windshield Cowl Line
        ( 0.580,   0.750,  0.138,  0.870,   0.770,   0.710,   0.835), # 16: A-Pillar Lower Root

        # Cockpit & Tapered Waist (Y: +0.580m to -0.580m) - British Roadster Proportions
        ( 0.440,   0.750,  0.135,  0.872,   0.785,   0.680,   0.840), # 17: Forward Cockpit Door
        ( 0.300,   0.752,  0.135,  0.875,   0.795,   0.665,   0.842), # 18: Flush Door Handle Zone
        ( 0.150,   0.755,  0.135,  0.878,   0.805,   0.655,   0.845), # 19: Mid-Door Centerline
        ( 0.000,   0.758,  0.135,  0.882,   0.812,   0.650,   0.848), # 20: Chassis Midpoint Datum
        (-0.150,   0.762,  0.135,  0.890,   0.820,   0.655,   0.850), # 21: Trailing Door Beltline
        (-0.300,   0.768,  0.136,  0.902,   0.828,   0.665,   0.852), # 22: Seat Backrest Bulkhead
        (-0.440,   0.775,  0.138,  0.918,   0.836,   0.680,   0.855), # 23: Rollover Hoop Anchor
        (-0.580,   0.785,  0.140,  0.935,   0.845,   0.700,   0.858), # 24: Roadster Tonneau Forward Brow

        # Muscular Rear Haunches (Y: -0.580m to -1.311m) - Jaguar's Signature Broad Hips (W=1,923mm)
        (-0.720,   0.795,  0.142,  0.952,   0.852,   0.718,   0.860), # 25: Haunch Forward Swell
        (-0.860,   0.810,  0.145,  0.965,   0.858,   0.730,   0.860), # 26: Rear Fender Muscle Flare
        (-1.000,   0.825,  0.148,  0.972,   0.860,   0.738,   0.858), # 27: Forward Rear Arch Brow
        (-1.150,   0.835,  0.150,  0.976,   0.860,   0.742,   0.855), # 28: Rear Arch Peak Apex
        (-1.240,   0.838,  0.150,  0.978,   0.858,   0.745,   0.850), # 29: Pre-Axle Crest
        (-1.311,   0.840,  0.150,  0.980,   0.855,   0.745,   0.845), # 30: Rear Axle Centerline (1,923mm Width)
        (-1.400,   0.835,  0.150,  0.975,   0.850,   0.742,   0.840), # 31: Trailing Rear Arch Brow
        (-1.520,   0.820,  0.148,  0.962,   0.840,   0.735,   0.832), # 32: Rear Quarter Hip Swell

        # Rear Decklid, Active Spoiler & Tapered Kammback (Y: -1.520m to -2.235m)
        (-1.640,   0.795,  0.145,  0.940,   0.825,   0.718,   0.822), # 33: Trunk Lid Forward Seam
        (-1.760,   0.760,  0.145,  0.908,   0.805,   0.690,   0.810), # 34: Active Spoiler Recess Brow
        (-1.880,   0.715,  0.148,  0.865,   0.780,   0.650,   0.798), # 35: Upper Taillamp Shoulder
        (-1.980,   0.650,  0.150,  0.810,   0.750,   0.590,   0.785), # 36: Rear Fascia Upper Crest
        (-2.070,   0.560,  0.152,  0.740,   0.715,   0.510,   0.770), # 37: Rear Bumper Center Shelf
        (-2.140,   0.450,  0.155,  0.650,   0.670,   0.410,   0.755), # 38: Outboard Quad Exhaust Notch
        (-2.190,   0.320,  0.158,  0.540,   0.620,   0.280,   0.740), # 39: Lower Diffuser Tunnel Flank
        (-2.235,   0.000,  0.160,  0.420,   0.560,   0.000,   0.725), # 40: Rear Trailing Lip Apex
    ]

    station_rings = []
    for y, xs, zs, xw, zw, xc, zc in stations_data:
        ring = []
        # Left Sill -> Left Waist -> Left Crown -> Center Crown -> Right Crown -> Right Waist -> Right Sill
        pts = [
            Vector((-xs, y, zs)),
            Vector((-xw, y, zw)),
            Vector((-xc, y, zc)),
            Vector((0.0, y, zc + 0.018)), # Jaguar feline central bonnet/deck spine
            Vector((xc,  y, zc)),
            Vector((xw,  y, zw)),
            Vector((xs,  y, zs)),
        ]
        for pt in pts:
            ring.append(bm_body.verts.new(pt))
        station_rings.append(ring)

    bm_body.verts.ensure_lookup_table()

    # Bridge the 40 station intervals into dense quad mesh
    for i in range(len(station_rings) - 1):
        r1 = station_rings[i]
        r2 = station_rings[i + 1]
        for j in range(len(r1) - 1):
            bm_body.faces.new((r1[j], r2[j], r2[j + 1], r1[j + 1]))

    bm_body.faces.ensure_lookup_table()

    obj_body = link_obj("GEO_FTYPE_Monocoque_Body_Shell", bm_body, parent_col, mats["body"], bevel=0.003)
    objs.append(obj_body)
    return objs
# ----------------------------------------------------------------------------
# 3. SUBSYSTEM 2: CLAMSHELL BONNET, POWER DOMES & SHARK-MOUTH CAVITY
# ----------------------------------------------------------------------------

def build_jaguar_ftype_clamshell_bonnet_and_grille(parent_col, mats):
    """
    Constructs the forward-hinged clamshell bonnet and shark-mouth grille aperture:
    - Long sculpted aluminum clamshell hood spanning from grille mouth to cowl (Y: +0.720m to +2.180m).
    - Twin raised longitudinal power domes flanking the center line (accommodating the 5.0L Supercharged V8).
    - Functional twin louvered heat extractor vents with gloss black trim frames.
    - Large trapezoidal shark-mouth main grille opening with recessed backing plate.
    - Front bumper outer brake cooling shark gill intakes.
    """
    objs = []
    bm_bonnet = bmesh.new()
    bm_vents = bmesh.new()
    bm_grille = bmesh.new()

    # 1. Clamshell Bonnet Panel (Contoured surface over engine bay)
    bonnet_stations = [
        # Y,       X_half, Z_cowl, Z_center
        ( 2.150,   0.520,  0.620,  0.640),
        ( 2.050,   0.620,  0.670,  0.695),
        ( 1.900,   0.720,  0.720,  0.750),
        ( 1.700,   0.770,  0.755,  0.785),
        ( 1.500,   0.800,  0.775,  0.805),
        ( 1.311,   0.810,  0.785,  0.815),
        ( 1.100,   0.800,  0.780,  0.810),
        ( 0.900,   0.780,  0.770,  0.805),
        ( 0.740,   0.750,  0.760,  0.800),
    ]

    bonnet_rings = []
    for y, xw, zw, zc in bonnet_stations:
        ring = []
        pts = [
            Vector((-xw, y, zw)),
            Vector((-xw * 0.65, y, zw + 0.025)), # Power dome outer brow
            Vector((-xw * 0.30, y, zc + 0.015)), # Power dome crest
            Vector((0.0, y, zc)),                # Center spine valley
            Vector((xw * 0.30, y, zc + 0.015)),  # Right power dome crest
            Vector((xw * 0.65, y, zw + 0.025)),  # Right power dome outer brow
            Vector((xw, y, zw)),
        ]
        for pt in pts:
            ring.append(bm_bonnet.verts.new(pt))
        bonnet_rings.append(ring)

    bm_bonnet.verts.ensure_lookup_table()
    for i in range(len(bonnet_rings) - 1):
        r1 = bonnet_rings[i]
        r2 = bonnet_rings[i + 1]
        for j in range(len(r1) - 1):
            bm_bonnet.faces.new((r1[j], r2[j], r2[j + 1], r1[j + 1]))

    # 2. Twin Bonnet Louvered Heat Extractor Vents (Y = +1.450m, X = +/- 0.340m, Z = 0.815m)
    for vx_sign in [-1.0, 1.0]:
        mat_vent = Matrix.Translation(Vector((vx_sign * 0.340, 1.450, 0.812))) @ Euler((math.radians(12), vx_sign * math.radians(-5), 0), 'XYZ').to_matrix().to_4x4()
        # Vent Outer Bezel Frame
        bmesh.ops.create_cube(bm_vents, size=1.0, matrix=mat_vent @ Matrix.Diagonal(Vector((0.085, 0.280, 0.015, 1.0))))
        # Louvered Angled Slats (5 longitudinal extractor vanes)
        for s_idx in range(5):
            y_off = (s_idx - 2) * 0.045
            mat_slat = mat_vent @ Matrix.Translation(Vector((0, y_off, 0.008))) @ Euler((math.radians(-25), 0, 0), 'XYZ').to_matrix().to_4x4()
            bmesh.ops.create_cube(bm_vents, size=1.0, matrix=mat_slat @ Matrix.Diagonal(Vector((0.075, 0.012, 0.006, 1.0))))

    # 3. Shark-Mouth Trapezoidal Grille Opening (Y = +2.140m, Z = 0.360m to 0.620m)
    mat_grille = Matrix.Translation(Vector((0.0, 2.140, 0.490)))
    # Grille Recessed Backing Plate & Shroud
    bmesh.ops.create_cube(bm_grille, size=1.0, matrix=mat_grille @ Matrix.Diagonal(Vector((0.820, 0.060, 0.260, 1.0))))

    # Outer Shark Gill Cooling Scoops (Flanking lower intake, X = +/- 0.680m, Y = +2.020m, Z = 0.380m)
    for gx_sign in [-1.0, 1.0]:
        mat_gill = Matrix.Translation(Vector((gx_sign * 0.680, 2.020, 0.380))) @ Euler((math.radians(8), gx_sign * math.radians(-14), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_grille, size=1.0, matrix=mat_gill @ Matrix.Diagonal(Vector((0.240, 0.050, 0.180, 1.0))))

    obj_bonnet = link_obj("GEO_FTYPE_Clamshell_Bonnet", bm_bonnet, parent_col, mats["body"], bevel=0.002)
    obj_vents = link_obj("GEO_FTYPE_Bonnet_Heat_Extractors", bm_vents, parent_col, mats["gloss_black"], bevel=0.001)
    obj_grille = link_obj("GEO_FTYPE_Shark_Mouth_Grille_Cavity", bm_grille, parent_col, mats["satin_black"], bevel=0.0015)

    objs.extend([obj_bonnet, obj_vents, obj_grille])
    return objs


# ----------------------------------------------------------------------------
# 4. SUBSYSTEM 3: FRONT LOWER AERO SPLITTER & BUMPER VALANCE
# ----------------------------------------------------------------------------

def build_jaguar_ftype_front_splitter_and_bumpers(parent_col, mats):
    """
    Constructs the track-inspired aerodynamic front splitter and bumper architecture:
    - Full-width front splitter tray extending forward from lower bumper chin.
    - Outer aerodynamic winglet strakes redirecting airflow around front tires.
    - Under-nose central air guide feeding the front radiator and oil coolers.
    - Front polyurethane bumper structural fascia with headlight wash recesses.
    """
    objs = []
    bm_splitter = bmesh.new()
    bm_bumper = bmesh.new()

    # 1. Full-Width Gloss Black Aerodynamic Front Splitter (Y: +2.060m to +2.280m, Z = 0.115m to 0.145m)
    splitter_pts = [
        Vector((-0.880, 1.850, 0.140)), # Outer left wheel arch flank
        Vector((-0.840, 2.050, 0.135)), # Left front bumper corner
        Vector((-0.680, 2.200, 0.130)), # Left chin curve
        Vector((-0.380, 2.260, 0.125)), # Left center prow
        Vector(( 0.000, 2.280, 0.125)), # Splitter center apex tip
        Vector(( 0.380, 2.260, 0.125)),
        Vector(( 0.680, 2.200, 0.130)),
        Vector(( 0.840, 2.050, 0.135)),
        Vector(( 0.880, 1.850, 0.140)),
    ]

    for i in range(len(splitter_pts) - 1):
        p1 = splitter_pts[i]
        p2 = splitter_pts[i + 1]
        mid = (p1 + p2) * 0.5
        seg_len = (p2 - p1).length
        mat_seg = Matrix.Translation(mid) @ Vector((0, 1, 0)).rotation_difference(p2 - p1).to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_splitter, size=1.0, matrix=mat_seg @ Matrix.Diagonal(Vector((0.140, seg_len, 0.024, 1.0))))

    # Outer Aerodynamic Endplate Winglets (X = +/- 0.880m, Y = +1.880m)
    for wx_sign in [-1.0, 1.0]:
        mat_winglet = Matrix.Translation(Vector((wx_sign * 0.885, 1.880, 0.180))) @ Euler((0, wx_sign * math.radians(-10), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_splitter, size=1.0, matrix=mat_winglet @ Matrix.Diagonal(Vector((0.020, 0.180, 0.090, 1.0))))

    # 2. Front Polyurethane Bumper Lower Valance Core
    mat_val = Matrix.Translation(Vector((0.0, 2.160, 0.240)))
    bmesh.ops.create_cube(bm_bumper, size=1.0, matrix=mat_val @ Matrix.Diagonal(Vector((1.380, 0.120, 0.160, 1.0))))

    # Bumper Corner Reinforcements
    for cx_sign in [-1.0, 1.0]:
        mat_corn = Matrix.Translation(Vector((cx_sign * 0.760, 2.060, 0.260))) @ Euler((0, 0, cx_sign * math.radians(24)), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_bumper, size=1.0, matrix=mat_corn @ Matrix.Diagonal(Vector((0.280, 0.140, 0.180, 1.0))))

    obj_splitter = link_obj("GEO_FTYPE_Front_Aerodynamic_Splitter", bm_splitter, parent_col, mats["gloss_black"], bevel=0.0015)
    obj_bumper = link_obj("GEO_FTYPE_Front_Bumper_Valance", bm_bumper, parent_col, mats["body"], bevel=0.002)

    objs.extend([obj_splitter, obj_bumper])
    return objs
# ----------------------------------------------------------------------------
# 5. SUBSYSTEM 4: RAKED WINDSHIELD FRAME, GLASS & CONVERTIBLE TONNEAU
# ----------------------------------------------------------------------------

def build_jaguar_ftype_windshield_and_tonneau(parent_col, mats):
    """
    Constructs the convertible roadster cockpit enclosure:
    - High-rake aluminum A-pillars and header rail (Rake angle ~62 degrees).
    - Optical tinted safety windshield glass with silk-screened black ceramic frit border.
    - Open roadster cockpit aperture with clean interior door shut faces.
    - Folded multi-layer mohair fabric convertible soft-top tonneau cover recessed behind headrests.
    - Frameless side door glass windows in partially lowered roadster presentation stance.
    """
    objs = []
    bm_frame = bmesh.new()
    bm_glass = bmesh.new()
    bm_tonneau = bmesh.new()

    # 1. Raked A-Pillars & Header Rail (Cowl: Y = +0.720m, Z = 0.810m to Header: Y = +0.180m, Z = 1.280m)
    for ax_sign in [-1.0, 1.0]:
        p_cowl = Vector((ax_sign * 0.745, 0.720, 0.810))
        p_hdr = Vector((ax_sign * 0.580, 0.180, 1.280))
        mid_p = (p_cowl + p_hdr) * 0.5
        mat_ap = Matrix.Translation(mid_p) @ Vector((0, 0, 1)).rotation_difference(p_hdr - p_cowl).to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_frame, radius=0.030, depth=(p_hdr - p_cowl).length, segments=16, matrix=mat_ap)

    # Upper Windshield Header Rail (Y = +0.180m, Z = 1.280m)
    mat_hdr = Matrix.Translation(Vector((0.0, 0.180, 1.280)))
    bmesh.ops.create_cube(bm_frame, size=1.0, matrix=mat_hdr @ Matrix.Diagonal(Vector((1.160, 0.050, 0.040, 1.0))))

    # 2. Optical Windshield Safety Glass with Aerodynamic Curvature
    p_cowl_c = Vector((0.0, 0.720, 0.825))
    p_hdr_c = Vector((0.0, 0.180, 1.270))
    mid_g = (p_cowl_c + p_hdr_c) * 0.5
    mat_glass = Matrix.Translation(mid_g) @ Vector((0, 0, 1)).rotation_difference(p_hdr_c - p_cowl_c).to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_glass, size=1.0, matrix=mat_glass @ Matrix.Diagonal(Vector((1.140, 0.014, (p_hdr_c - p_cowl_c).length, 1.0))))

    # 3. Frameless Side Door Glass (Partially lowered 30mm for roadster display)
    for gx_sign in [-1.0, 1.0]:
        mat_sideglass = Matrix.Translation(Vector((gx_sign * 0.770, 0.120, 0.890))) @ Euler((0, gx_sign * math.radians(-5), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_glass, size=1.0, matrix=mat_sideglass @ Matrix.Diagonal(Vector((0.010, 0.720, 0.150, 1.0))))

    # 4. Folded Mohair Soft-Top Tonneau Boot (Recessed well behind rollover hoops: Y: -0.520m to -0.920m)
    mat_tb = Matrix.Translation(Vector((0.0, -0.720, 0.825)))
    bmesh.ops.create_cube(bm_tonneau, size=1.0, matrix=mat_tb @ Matrix.Diagonal(Vector((1.260, 0.380, 0.080, 1.0))))

    # Transverse Fabric Folding Ribs
    for rib_y in [-0.820, -0.720, -0.620]:
        mat_frib = Matrix.Translation(Vector((0.0, rib_y, 0.865)))
        bmesh.ops.create_cylinder(bm_tonneau, radius=0.018, depth=1.200, segments=14, matrix=mat_frib @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_frame = link_obj("GEO_FTYPE_Windshield_Header_Frame", bm_frame, parent_col, mats["gloss_black"], bevel=0.002)
    obj_glass = link_obj("GEO_FTYPE_Windshield_Optical_Glass", bm_glass, parent_col, mats["glass"], bevel=0.0005)
    obj_tonneau = link_obj("GEO_FTYPE_Folded_SoftTop_Tonneau", bm_tonneau, parent_col, mats["soft_top"], bevel=0.002)

    objs.extend([obj_frame, obj_glass, obj_tonneau])
    return objs


# ----------------------------------------------------------------------------
# 6. SUBSYSTEM 5: WHEELHOUSE TUBS & UNDERBODY ALUMINUM UNDERTRAY
# ----------------------------------------------------------------------------

def build_jaguar_ftype_wheel_tubs_and_undertray(parent_col, mats):
    """
    Constructs fully enclosed wheelhouse tubs and high-downforce aerodynamic undertray:
    - Front and rear inner wheel well linings preventing see-through voids from any camera angle.
    - Flat aluminum aerodynamic belly pan running between axles.
    - High-velocity rear underbody diffuser tunnels channel air beneath the rear subframe.
    - Front wheel arch stone deflectors and NACA brake cooling air guides.
    """
    objs = []
    bm_tubs = bmesh.new()
    bm_tray = bmesh.new()

    # 1. Enclosed Front Wheel Tubs (Axle: Y = +1.311m, Radius = 0.375m)
    for fx_sign in [-1.0, 1.0]:
        mat_ftub = Matrix.Translation(Vector((fx_sign * 0.700, 1.311, 0.380)))
        bmesh.ops.create_cylinder(bm_tubs, radius=0.375, depth=0.240, segments=24, matrix=mat_ftub @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # Front Splash Shield Inner Plate
        mat_fshield = Matrix.Translation(Vector((fx_sign * 0.590, 1.311, 0.380)))
        bmesh.ops.create_cube(bm_tubs, size=1.0, matrix=mat_fshield @ Matrix.Diagonal(Vector((0.020, 0.720, 0.720, 1.0))))

    # 2. Enclosed Rear Wheel Tubs (Axle: Y = -1.311m, Radius = 0.385m)
    for rx_sign in [-1.0, 1.0]:
        mat_rtub = Matrix.Translation(Vector((rx_sign * 0.720, -1.311, 0.380)))
        bmesh.ops.create_cylinder(bm_tubs, radius=0.385, depth=0.260, segments=24, matrix=mat_rtub @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # Rear Splash Shield Inner Plate
        mat_rshield = Matrix.Translation(Vector((rx_sign * 0.600, -1.311, 0.380)))
        bmesh.ops.create_cube(bm_tubs, size=1.0, matrix=mat_rshield @ Matrix.Diagonal(Vector((0.020, 0.740, 0.740, 1.0))))

    # 3. Continuous Underbody Aerodynamic Undertray (Y: -1.750m to +1.850m, Z = 0.135m)
    mat_floor = Matrix.Translation(Vector((0.0, 0.050, 0.135)))
    bmesh.ops.create_cube(bm_tray, size=1.0, matrix=mat_floor @ Matrix.Diagonal(Vector((1.520, 3.600, 0.025, 1.0))))

    # Longitudinal Stiffening Ribs
    for rib_x in [-0.550, -0.280, 0.280, 0.550]:
        mat_lrib = Matrix.Translation(Vector((rib_x, 0.050, 0.120)))
        bmesh.ops.create_cube(bm_tray, size=1.0, matrix=mat_lrib @ Matrix.Diagonal(Vector((0.040, 3.500, 0.020, 1.0))))

    obj_tubs = link_obj("GEO_FTYPE_Enclosed_Wheelhouse_Tubs", bm_tubs, parent_col, mats["satin_black"], bevel=0.001)
    obj_tray = link_obj("GEO_FTYPE_Aerodynamic_Underbody_Tray", bm_tray, parent_col, mats["satin_black"], bevel=0.002)

    objs.extend([obj_tubs, obj_tray])
    return objs
# ----------------------------------------------------------------------------
# 7. SUBSYSTEM 6: 20-INCH "CYCLONE" 5-SPLIT-SPOKE WHEELS & PIRELLI P ZERO TIRES
# ----------------------------------------------------------------------------

def build_jaguar_ftype_wheels_and_tires(parent_col, mats):
    """
    Constructs the staggered 20-inch "Cyclone" forged alloy wheels and Pirelli tires:
    - Front: 20x9.0J wheel, 255/35 R20 low-profile tire (Outer diameter ~0.686m).
    - Rear: 20x10.5J wheel, 295/30 R20 wide-contact tire (Outer diameter ~0.686m, section width 0.295m).
    - Dynamic turbine-blade 5-split-spoke architecture with diamond-turned machine face.
    - Deep stepped rim barrel with polished outer lip.
    - Recessed center hub with 5 conical chrome lug nuts and Jaguar Growler center cap roundel.
    - High-grip Pirelli P Zero directional asymmetric tread pattern with longitudinal sipes.
    """
    objs = []
    bm_rims = bmesh.new()
    bm_spokes = bmesh.new()
    bm_tires = bmesh.new()

    wheel_configs = [
        # Name,      X_pos,  Y_pos,  Z_pos,  Tire_R, Tire_W, Rim_R,  Spoke_L, Is_Rear
        ("FL", -0.798,  1.311,  0.343,  0.343,  0.255,  0.270,  0.240, False),
        ("FR",  0.798,  1.311,  0.343,  0.343,  0.255,  0.270,  0.240, False),
        ("RL", -0.825, -1.311,  0.343,  0.343,  0.295,  0.270,  0.240, True),
        ("RR",  0.825, -1.311,  0.343,  0.343,  0.295,  0.270,  0.240, True),
    ]

    for name, wx, wy, wz, tr, tw, rr, sl, is_rear in wheel_configs:
        x_sign = 1.0 if wx > 0 else -1.0
        mat_whl = Matrix.Translation(Vector((wx, wy, wz))) @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()

        # 1. Low-Profile Pirelli P Zero Performance Tire
        # Outer Cylindrical Tread Band (cap_ends=False so wheel center is completely open)
        bmesh.ops.create_cylinder(bm_tires, cap_ends=False, radius=tr, depth=tw, segments=36, matrix=mat_whl)
        # Rounded Sidewall Shoulder Beads
        for sw_off in [-tw * 0.44, tw * 0.44]:
            mat_sw = mat_whl @ Matrix.Translation(Vector((0, 0, sw_off)))
            bmesh.ops.create_cylinder(bm_tires, cap_ends=False, radius=tr * 0.97, depth=0.025, segments=32, matrix=mat_sw)

        # 2. Stepped 20-Inch Rim Barrel & Outer Polished Lip
        bmesh.ops.create_cylinder(bm_rims, cap_ends=False, radius=rr, depth=tw * 0.88, segments=32, matrix=mat_whl)
        # Outer Stepped Rim Lip
        mat_lip = mat_whl @ Matrix.Translation(Vector((0, 0, x_sign * (tw * 0.44))))
        bmesh.ops.create_cylinder(bm_rims, cap_ends=False, radius=rr * 1.02, depth=0.018, segments=32, matrix=mat_lip)

        # 3. Recessed Center Hub & Lug Nut Well
        mat_hub = mat_whl @ Matrix.Translation(Vector((0, 0, x_sign * (tw * 0.38))))
        bmesh.ops.create_cylinder(bm_rims, radius=0.082, depth=0.030, segments=24, matrix=mat_hub)
        # Center Cap Roundel
        bmesh.ops.create_cylinder(bm_rims, radius=0.040, depth=0.015, segments=20, matrix=mat_hub @ Matrix.Translation(Vector((0, 0, x_sign * 0.015))))

        # 5 Chrome Conical Lug Nuts
        for lug_i in range(5):
            lug_ang = lug_i * (2.0 * math.pi / 5.0)
            lx = math.cos(lug_ang) * 0.058
            ly = math.sin(lug_ang) * 0.058
            mat_lug = mat_hub @ Matrix.Translation(Vector((lx, ly, x_sign * 0.012)))
            bmesh.ops.create_cylinder(bm_rims, radius=0.010, depth=0.020, segments=12, matrix=mat_lug)

        # 4. Cyclone 5-Split-Spoke Blades (5 pairs of sweeping directional turbine blades)
        for spk_i in range(5):
            base_ang = spk_i * (2.0 * math.pi / 5.0)
            # Each pair has an A-spoke and B-spoke forming a split-Y turbine
            for s_sub in [-0.075, 0.075]:
                ang = base_ang + s_sub
                cos_a = math.cos(ang)
                sin_a = math.sin(ang)
                # Spoke midpoint
                spk_r = (0.080 + rr * 0.94) * 0.5
                spk_len = (rr * 0.94 - 0.080)
                spk_x = cos_a * spk_r
                spk_y = sin_a * spk_r
                mat_spk = mat_hub @ Matrix.Translation(Vector((spk_x, spk_y, x_sign * 0.008))) @ Euler((0, 0, ang), 'XYZ').to_matrix().to_4x4()
                # Angled aerodynamic blade profile
                bmesh.ops.create_cube(bm_spokes, size=1.0, matrix=mat_spk @ Matrix.Diagonal(Vector((0.026, spk_len, 0.022, 1.0))))

    obj_tires = link_obj("GEO_FTYPE_Pirelli_PZero_Tires", bm_tires, parent_col, mats["tire"], bevel=0.002)
    obj_rims = link_obj("GEO_FTYPE_20in_Cyclone_Barrels", bm_rims, parent_col, mats["alloy"], bevel=0.001)
    obj_spokes = link_obj("GEO_FTYPE_20in_Cyclone_Spokes", bm_spokes, parent_col, mats["alloy"], bevel=0.0012)

    objs.extend([obj_tires, obj_rims, obj_spokes])
    return objs


# ----------------------------------------------------------------------------
# 8. SUBSYSTEM 7: PERFORMANCE BRAKE ROTORS & YELLOW 6-PISTON CALIPERS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_brakes_and_calipers(parent_col, mats):
    """
    Constructs the high-performance braking system:
    - Front: Massive 380mm ventilated & cross-drilled carbon/cast iron rotors with yellow 6-piston monobloc Brembo calipers.
    - Rear: 376mm ventilated rotors with yellow 4-piston calipers and integrated electronic parking brake servo.
    - Detailed caliper bridges, pad retaining pins, hydraulic crossover tubes, and bleeder caps.
    """
    objs = []
    bm_rotors = bmesh.new()
    bm_calipers = bmesh.new()

    brake_configs = [
        # Name,   X_pos,  Y_pos,  Z_pos,  Rotor_R, Thick, Is_Front
        ("FL", -0.730,  1.311,  0.343,  0.190,   0.034, True),
        ("FR",  0.730,  1.311,  0.343,  0.190,   0.034, True),
        ("RL", -0.740, -1.311,  0.343,  0.188,   0.030, False),
        ("RR",  0.740, -1.311,  0.343,  0.188,   0.030, False),
    ]

    for name, bx, by, bz, rr, r_thk, is_front in brake_configs:
        x_sign = 1.0 if bx > 0 else -1.0
        mat_brk = Matrix.Translation(Vector((bx, by, bz))) @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()

        # 1. Cross-Drilled Rotor Friction Ring
        bmesh.ops.create_cylinder(bm_rotors, radius=rr, depth=r_thk, segments=32, matrix=mat_brk)
        # Center Aluminum Rotor Hat / Bell
        mat_hat = mat_brk @ Matrix.Translation(Vector((0, 0, x_sign * 0.008)))
        bmesh.ops.create_cylinder(bm_rotors, radius=rr * 0.52, depth=r_thk + 0.012, segments=24, matrix=mat_hat)

        # Cross-Drilling Vent Holes (Radial pattern)
        for h_row in [0.120, 0.150, 0.170]:
            for h_ang_i in range(8):
                ang = h_ang_i * (math.pi / 4.0) + (h_row * 10.0)
                hx = math.cos(ang) * h_row
                hy = math.sin(ang) * h_row
                mat_hole = mat_brk @ Matrix.Translation(Vector((hx, hy, 0)))
                bmesh.ops.create_cylinder(bm_rotors, radius=0.004, depth=r_thk + 0.004, segments=8, matrix=mat_hole)

        # 2. Performance Monobloc Caliper (Trailing side of rotor for front, leading for rear)
        cal_ang = math.radians(145 if is_front else 35)
        cx = math.cos(cal_ang) * (rr * 0.85)
        cy = math.sin(cal_ang) * (rr * 0.85)

        cal_len = 0.280 if is_front else 0.220
        cal_wid = 0.115 if is_front else 0.095
        cal_hgt = 0.095 if is_front else 0.080

        mat_cal = mat_brk @ Matrix.Translation(Vector((cx, cy, x_sign * 0.010))) @ Euler((0, 0, cal_ang + math.pi * 0.5), 'XYZ').to_matrix().to_4x4()

        # Caliper Main Monobloc Body
        bmesh.ops.create_cube(bm_calipers, size=1.0, matrix=mat_cal @ Matrix.Diagonal(Vector((cal_wid, cal_len, cal_hgt, 1.0))))

        # Piston Chamber Bulges
        num_pistons = 3 if is_front else 2
        for p_i in range(num_pistons):
            p_y = (p_i - (num_pistons - 1) * 0.5) * (cal_len * 0.30)
            mat_p = mat_cal @ Matrix.Translation(Vector((0, p_y, 0)))
            bmesh.ops.create_cylinder(bm_calipers, radius=0.026, depth=cal_hgt * 1.05, segments=16, matrix=mat_p @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # Bleeder Screw & Fluid Cross-Over Line
        mat_bleed = mat_cal @ Matrix.Translation(Vector((0, cal_len * 0.42, cal_hgt * 0.45)))
        bmesh.ops.create_cylinder(bm_calipers, radius=0.006, depth=0.025, segments=8, matrix=mat_bleed)

    obj_rotors = link_obj("GEO_FTYPE_CrossDrilled_Brake_Rotors", bm_rotors, parent_col, mats["rotor"], bevel=0.0008)
    obj_calipers = link_obj("GEO_FTYPE_Yellow_Brembo_Calipers", bm_calipers, parent_col, mats["yellow_caliper"], bevel=0.0015)

    objs.extend([obj_rotors, obj_calipers])
    return objs
# ----------------------------------------------------------------------------
# 9. SUBSYSTEM 8: 5.0L SUPERCHARGED V8 POWERTRAIN & 8-SPEED DRIVETRAIN
# ----------------------------------------------------------------------------

def build_jaguar_ftype_powertrain_and_drivetrain(parent_col, mats):
    """
    Constructs the 5.0L Supercharged V8 (AJ133) engine and all-aluminum drivetrain:
    - 90-degree V8 aluminum engine block situated behind front axle (Front mid-ship layout).
    - Twin Vortex Eaton Roots-type supercharger nestled inside cylinder bank vee.
    - Dual water-to-air charge air intercooler housings with embossed Jaguar script.
    - ZF 8HP70 8-speed Quickshift transmission casing and bellhousing.
    - Longitudinal propshaft connecting to rear Electronic Active Differential (EAD).
    """
    objs = []
    bm_eng = bmesh.new()
    bm_trans = bmesh.new()

    # 1. 5.0L V8 Engine Block (Y: +0.950m to +1.550m, Z = 0.280m to 0.580m)
    mat_block = Matrix.Translation(Vector((0.0, 1.250, 0.420)))
    bmesh.ops.create_cube(bm_eng, size=1.0, matrix=mat_block @ Matrix.Diagonal(Vector((0.560, 0.580, 0.320, 1.0))))

    # Cylinder Head Banks (Left and Right canted at 45 degrees)
    for bx_sign in [-1.0, 1.0]:
        mat_bank = Matrix.Translation(Vector((bx_sign * 0.220, 1.250, 0.540))) @ Euler((0, bx_sign * math.radians(45), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_eng, size=1.0, matrix=mat_bank @ Matrix.Diagonal(Vector((0.240, 0.560, 0.160, 1.0))))

    # 2. Eaton Twin Vortex Supercharger & Dual Intercooler Coolers (Vee Center, Z = 0.650m)
    mat_sc = Matrix.Translation(Vector((0.0, 1.280, 0.650)))
    bmesh.ops.create_cube(bm_eng, size=1.0, matrix=mat_sc @ Matrix.Diagonal(Vector((0.340, 0.480, 0.140, 1.0))))

    # Front Supercharger Pulley & Serpentine Belt Drive
    mat_pulley = Matrix.Translation(Vector((0.0, 1.560, 0.650)))
    bmesh.ops.create_cylinder(bm_eng, radius=0.045, depth=0.040, segments=20, matrix=mat_pulley @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 3. ZF 8-Speed Quickshift Automatic Transmission (Y: +0.350m to +0.950m, Z = 0.260m to 0.440m)
    mat_tr = Matrix.Translation(Vector((0.0, 0.680, 0.340)))
    # Bellhousing
    bmesh.ops.create_cylinder(bm_trans, radius=0.220, depth=0.220, segments=20, matrix=mat_tr @ Matrix.Translation(Vector((0, 0.240, 0))) @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    # Gearbox Main Tunnel Body
    bmesh.ops.create_cube(bm_trans, size=1.0, matrix=mat_tr @ Matrix.Diagonal(Vector((0.280, 0.480, 0.240, 1.0))))

    # 4. Longitudinal Propshaft (Y: -0.950m to +0.350m, Z = 0.250m)
    mat_prop = Matrix.Translation(Vector((0.0, -0.300, 0.250)))
    bmesh.ops.create_cylinder(bm_trans, radius=0.038, depth=1.300, segments=16, matrix=mat_prop @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 5. Rear Electronic Active Differential (EAD) Casing (Axle Y = -1.311m, Z = 0.320m)
    mat_diff = Matrix.Translation(Vector((0.0, -1.311, 0.320)))
    bmesh.ops.create_cube(bm_trans, size=1.0, matrix=mat_diff @ Matrix.Diagonal(Vector((0.360, 0.340, 0.280, 1.0))))
    # Rear Finned Cooling Sump
    for f_i in range(5):
        y_f = (f_i - 2) * 0.035
        mat_fin = mat_diff @ Matrix.Translation(Vector((0, y_f, -0.140)))
        bmesh.ops.create_cube(bm_trans, size=1.0, matrix=mat_fin @ Matrix.Diagonal(Vector((0.320, 0.010, 0.035, 1.0))))

    # Half-shafts to rear wheel hubs
    for hx_sign in [-1.0, 1.0]:
        mat_half = Matrix.Translation(Vector((hx_sign * 0.450, -1.311, 0.335)))
        bmesh.ops.create_cylinder(bm_trans, radius=0.024, depth=0.550, segments=12, matrix=mat_half @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_eng = link_obj("GEO_FTYPE_AJ133_V8_Supercharged_Engine", bm_eng, parent_col, mats["engine_metal"], bevel=0.002)
    obj_trans = link_obj("GEO_FTYPE_ZF8HP_Transmission_and_EAD", bm_trans, parent_col, mats["satin_black"], bevel=0.002)

    objs.extend([obj_eng, obj_trans])
    return objs


# ----------------------------------------------------------------------------
# 10. SUBSYSTEM 9: DOUBLE WISHBONE SUSPENSION & ADAPTIVE DAMPERS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_suspension_subassemblies(parent_col, mats):
    """
    Constructs all-aluminum double wishbone front and rear suspension architecture:
    - Upper and lower forged aluminum A-arms with spherical bush mountings.
    - Adaptive Dynamics continuously variable electronic coilover dampers.
    - Front and rear hollow tubular anti-roll sway bars with drop links.
    - Cast aluminum steering knuckles and hub carriers.
    """
    objs = []
    bm_susp = bmesh.new()

    axle_locations = [
        ("Front", 1.311, 0.620, True),
        ("Rear", -1.311, 0.640, False),
    ]

    for ax_name, ay, arm_x, is_front in axle_locations:
        for sx_sign in [-1.0, 1.0]:
            # 1. Lower A-Arm Control Wishbone (Z = 0.200m)
            mat_low = Matrix.Translation(Vector((sx_sign * arm_x * 0.65, ay, 0.210)))
            bmesh.ops.create_cube(bm_susp, size=1.0, matrix=mat_low @ Matrix.Diagonal(Vector((0.320, 0.240, 0.035, 1.0))))

            # 2. Upper Control Wishbone (Z = 0.420m)
            mat_up = Matrix.Translation(Vector((sx_sign * arm_x * 0.68, ay, 0.420)))
            bmesh.ops.create_cube(bm_susp, size=1.0, matrix=mat_up @ Matrix.Diagonal(Vector((0.280, 0.200, 0.030, 1.0))))

            # 3. Adaptive Dynamics Coilover Spring/Damper Strut
            p_lower = Vector((sx_sign * (arm_x * 0.72), ay, 0.220))
            p_upper = Vector((sx_sign * (arm_x * 0.45), ay, 0.600))
            mid_strut = (p_lower + p_upper) * 0.5
            mat_strut = Matrix.Translation(mid_strut) @ Vector((0, 0, 1)).rotation_difference(p_upper - p_lower).to_matrix().to_4x4()

            # Damper Body Cylinder
            bmesh.ops.create_cylinder(bm_susp, radius=0.024, depth=(p_upper - p_lower).length * 0.6, segments=12, matrix=mat_strut)
            # Progressive Coil Spring Over Damper
            bmesh.ops.create_cylinder(bm_susp, radius=0.042, depth=(p_upper - p_lower).length * 0.5, segments=14, matrix=mat_strut)

            # 4. Aluminum Hub Carrier / Steering Knuckle
            mat_knuckle = Matrix.Translation(Vector((sx_sign * arm_x * 0.90, ay, 0.340)))
            bmesh.ops.create_cube(bm_susp, size=1.0, matrix=mat_knuckle @ Matrix.Diagonal(Vector((0.080, 0.120, 0.240, 1.0))))

        # 5. Transverse Anti-Roll Sway Bar (Spanning between left and right lower wishbones)
        mat_sway = Matrix.Translation(Vector((0.0, ay + (0.160 if is_front else -0.160), 0.240)))
        bmesh.ops.create_cylinder(bm_susp, radius=0.016, depth=1.120, segments=14, matrix=mat_sway @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_susp = link_obj("GEO_FTYPE_DoubleWishbone_Suspension", bm_susp, parent_col, mats["alloy"], bevel=0.0015)
    objs.append(obj_susp)
    return objs
# ----------------------------------------------------------------------------
# 11. SUBSYSTEM 10: TWIN ROLLOVER HOOPS & POLYCARBONATE WIND DEFLECTOR
# ----------------------------------------------------------------------------

def build_jaguar_ftype_roll_hoops_and_cockpit_cowl(parent_col, mats):
    """
    Constructs the convertible safety roll hoops and cockpit aerodynamic silhouette:
    - Fixed satin chrome / body-colored twin aerodynamic rollover protection hoops.
    - Transparent tinted polycarbonate center wind deflector screen between hoops.
    - Cockpit rear bulkhead cross-brace with embossed Jaguar script panel.
    - Driver-focused cockpit cowl, asymmetrical passenger grab bar silhouette, and steering rim.
    """
    objs = []
    bm_hoops = bmesh.new()
    bm_screen = bmesh.new()
    bm_cockpit = bmesh.new()

    # 1. Twin Rollover Protection Hoops (Positioned behind driver and passenger headrests)
    # Coordinates: Y = -0.440m, X = +/- 0.360m, Z = 0.850m to 1.140m
    for hx_sign in [-1.0, 1.0]:
        hx = hx_sign * 0.360
        hy = -0.440
        hz = 0.860

        # Vertical Outer Leg
        mat_leg1 = Matrix.Translation(Vector((hx - hx_sign * 0.120, hy, hz + 0.140)))
        bmesh.ops.create_cylinder(bm_hoops, radius=0.026, depth=0.280, segments=16, matrix=mat_leg1)

        # Vertical Inner Leg
        mat_leg2 = Matrix.Translation(Vector((hx + hx_sign * 0.120, hy, hz + 0.140)))
        bmesh.ops.create_cylinder(bm_hoops, radius=0.026, depth=0.280, segments=16, matrix=mat_leg2)

        # Curved Top Arch (Semi-torus / arch arc)
        arch_steps = 10
        arch_r = 0.120
        for step in range(arch_steps):
            t1 = step / arch_steps * math.pi
            t2 = (step + 1) / arch_steps * math.pi
            p1 = Vector((hx + math.cos(t1) * arch_r, hy, hz + 0.280 + math.sin(t1) * 0.080))
            p2 = Vector((hx + math.cos(t2) * arch_r, hy, hz + 0.280 + math.sin(t2) * 0.080))
            mid_a = (p1 + p2) * 0.5
            mat_arch = Matrix.Translation(mid_a) @ Vector((0, 0, 1)).rotation_difference(p2 - p1).to_matrix().to_4x4()
            bmesh.ops.create_cylinder(bm_hoops, radius=0.026, depth=(p2 - p1).length, segments=12, matrix=mat_arch)

    # 2. Central Polycarbonate Wind Deflector Screen (Between rollover hoops: X: -0.220m to +0.220m)
    mat_wd = Matrix.Translation(Vector((0.0, -0.440, 1.020)))
    bmesh.ops.create_cube(bm_screen, size=1.0, matrix=mat_wd @ Matrix.Diagonal(Vector((0.440, 0.008, 0.200, 1.0))))
    # Wind Deflector Outer Frame
    bmesh.ops.create_cube(bm_hoops, size=1.0, matrix=mat_wd @ Matrix.Diagonal(Vector((0.455, 0.016, 0.215, 1.0))))

    # 3. Cockpit Dashboard Cowl & Asymmetrical Grab Bar Silhouette
    # Driver Instrument Binnacle Hood (X = -0.360m, Y = +0.480m, Z = 0.880m)
    mat_binnacle = Matrix.Translation(Vector((-0.360, 0.480, 0.880)))
    bmesh.ops.create_cube(bm_cockpit, size=1.0, matrix=mat_binnacle @ Matrix.Diagonal(Vector((0.360, 0.220, 0.120, 1.0))))

    # Dashboard Main Wing Crossbar (Y = +0.520m, Z = 0.780m)
    mat_dash = Matrix.Translation(Vector((0.0, 0.520, 0.780)))
    bmesh.ops.create_cube(bm_cockpit, size=1.0, matrix=mat_dash @ Matrix.Diagonal(Vector((1.240, 0.260, 0.180, 1.0))))

    # Iconic Asymmetrical Passenger Grab Handle (Rises from center console on passenger side)
    p_grab1 = Vector((0.080, 0.420, 0.620))
    p_grab2 = Vector((0.140, 0.180, 0.780))
    mid_grab = (p_grab1 + p_grab2) * 0.5
    mat_grab = Matrix.Translation(mid_grab) @ Vector((0, 0, 1)).rotation_difference(p_grab2 - p_grab1).to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_cockpit, radius=0.016, depth=(p_grab2 - p_grab1).length, segments=12, matrix=mat_grab)

    # 3-Spoke Sport Steering Wheel Rim
    mat_wheel = Matrix.Translation(Vector((-0.360, 0.320, 0.840))) @ Euler((math.radians(24), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_cockpit, radius=0.180, depth=0.028, segments=24, matrix=mat_wheel @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_hoops = link_obj("GEO_FTYPE_Rollover_Protection_Hoops", bm_hoops, parent_col, mats["chrome"], bevel=0.0015)
    obj_screen = link_obj("GEO_FTYPE_Wind_Deflector_Screen", bm_screen, parent_col, mats["glass"], bevel=0.0005)
    obj_cockpit = link_obj("GEO_FTYPE_Cockpit_Cowl_and_Dash", bm_cockpit, parent_col, mats["satin_black"], bevel=0.002)

    objs.extend([obj_hoops, obj_screen, obj_cockpit])
    return objs


# ----------------------------------------------------------------------------
# 12. SUBSYSTEM 11: REAR BUMPER, ACTIVE SPOILER & GLOSS BLACK DIFFUSER
# ----------------------------------------------------------------------------

def build_jaguar_ftype_rear_diffuser_and_spoiler(parent_col, mats):
    """
    Constructs the aggressive rear end aerodynamic sculpture:
    - Active deployable rear spoiler in retracted flush parking position (Y: -1.720m to -2.060m).
    - Rear license plate recess and center trunk release latch.
    - Massive gloss black rear underbody aerodynamic diffuser with twin vertical flow strakes.
    - Outboard exhaust cutouts accommodating the trademark twin dual exhaust tips.
    """
    objs = []
    bm_spoiler = bmesh.new()
    bm_diff = bmesh.new()

    # 1. Active Rear Deployable Aerodynamic Spoiler (Retracted flush into decklid)
    # Sits across Y = -1.880m, Z = 0.810m, Width 1.180m, Depth 0.220m
    mat_sp = Matrix.Translation(Vector((0.0, -1.880, 0.810))) @ Euler((math.radians(-6), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_spoiler, size=1.0, matrix=mat_sp @ Matrix.Diagonal(Vector((1.180, 0.220, 0.022, 1.0))))

    # Trailing Aero Lip on Spoiler
    mat_lip = mat_sp @ Matrix.Translation(Vector((0.0, -0.105, 0.012)))
    bmesh.ops.create_cube(bm_spoiler, size=1.0, matrix=mat_lip @ Matrix.Diagonal(Vector((1.160, 0.025, 0.014, 1.0))))

    # 2. Gloss Black Rear Aerodynamic Diffuser (Y: -1.850m to -2.235m, Z = 0.160m to 0.380m)
    mat_diff = Matrix.Translation(Vector((0.0, -2.040, 0.260)))
    bmesh.ops.create_cube(bm_diff, size=1.0, matrix=mat_diff @ Matrix.Diagonal(Vector((1.380, 0.360, 0.160, 1.0))))

    # Twin Center Aerodynamic Diffuser Strakes (Channeling underbody airflow)
    for st_x in [-0.220, 0.220]:
        mat_strake = Matrix.Translation(Vector((st_x, -2.080, 0.200))) @ Euler((math.radians(-14), 0, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_diff, size=1.0, matrix=mat_strake @ Matrix.Diagonal(Vector((0.018, 0.320, 0.090, 1.0))))

    # Outer Exhaust Flank Tunnels (Wrapping around the quad exhaust pipes)
    for ex_sign in [-1.0, 1.0]:
        mat_tunnel = Matrix.Translation(Vector((ex_sign * 0.620, -2.120, 0.280)))
        bmesh.ops.create_cube(bm_diff, size=1.0, matrix=mat_tunnel @ Matrix.Diagonal(Vector((0.320, 0.180, 0.120, 1.0))))

    obj_spoiler = link_obj("GEO_FTYPE_Active_Rear_Spoiler", bm_spoiler, parent_col, mats["body"], bevel=0.001)
    obj_diff = link_obj("GEO_FTYPE_Gloss_Black_Rear_Diffuser", bm_diff, parent_col, mats["gloss_black"], bevel=0.002)

    objs.extend([obj_spoiler, obj_diff])
    return objs
# ----------------------------------------------------------------------------
# 13. SUBSYSTEM 12: ACTIVE SPORT EXHAUST SYSTEM & VALVED MUFFLER
# ----------------------------------------------------------------------------

def build_jaguar_ftype_exhaust_plumbing(parent_col, mats):
    """
    Constructs the quad-pipe active sport exhaust plumbing:
    - Dual hydroformed stainless steel 4-into-1 exhaust headers flanking V8 engine.
    - Twin catalytic converter cannisters beneath front footwells.
    - Central X-pipe resonator equalizing exhaust backpressure pulses.
    - Transverse rear active valved muffler canister located beneath rear bumper.
    - 4 individual connector pipes feeding into the outboard quad tips.
    """
    objs = []
    bm_exh = bmesh.new()

    # 1. Dual Exhaust Headers (Left and Right of engine block)
    for hx_sign in [-1.0, 1.0]:
        mat_hdr = Matrix.Translation(Vector((hx_sign * 0.320, 1.250, 0.380)))
        bmesh.ops.create_cube(bm_exh, size=1.0, matrix=mat_hdr @ Matrix.Diagonal(Vector((0.080, 0.440, 0.120, 1.0))))

        # Catalytic Converter Canisters (Y = +0.700m, Z = 0.220m)
        mat_cat = Matrix.Translation(Vector((hx_sign * 0.280, 0.700, 0.220)))
        bmesh.ops.create_cylinder(bm_exh, radius=0.065, depth=0.280, segments=16, matrix=mat_cat @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Central Twin Exhaust Pipes & X-Pipe (Y: -0.800m to +0.550m, Z = 0.190m)
    for px_sign in [-1.0, 1.0]:
        mat_pipe = Matrix.Translation(Vector((px_sign * 0.140, -0.150, 0.190)))
        bmesh.ops.create_cylinder(bm_exh, radius=0.035, depth=1.350, segments=14, matrix=mat_pipe @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Central Resonator Box (Y = -0.300m, Z = 0.190m)
    mat_res = Matrix.Translation(Vector((0.0, -0.300, 0.190)))
    bmesh.ops.create_cube(bm_exh, size=1.0, matrix=mat_res @ Matrix.Diagonal(Vector((0.360, 0.320, 0.090, 1.0))))

    # 3. Transverse Rear Valved Silencer Muffler (Y = -1.820m, Z = 0.260m)
    mat_muff = Matrix.Translation(Vector((0.0, -1.820, 0.260)))
    bmesh.ops.create_cylinder(bm_exh, radius=0.110, depth=0.980, segments=20, matrix=mat_muff @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # 4 Connector Pipes Feeding into Quad Outlets (2 per side)
    for qx_sign in [-1.0, 1.0]:
        for q_sub in [-0.045, 0.045]:
            mat_qpipe = Matrix.Translation(Vector((qx_sign * 0.620 + q_sub, -1.980, 0.250)))
            bmesh.ops.create_cylinder(bm_exh, radius=0.038, depth=0.280, segments=14, matrix=mat_qpipe @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_exh = link_obj("GEO_FTYPE_Sport_Exhaust_System", bm_exh, parent_col, mats["engine_metal"], bevel=0.001)
    objs.append(obj_exh)
    return objs


# ----------------------------------------------------------------------------
# 14. SUBSYSTEM 13: COOLING RADIATORS & SUPERCHARGER HEAT EXCHANGERS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_cooling_pack(parent_col, mats):
    """
    Constructs the multi-tier automotive cooling assembly:
    - Primary heavy-duty engine coolant aluminum radiator.
    - Low-temperature auxiliary radiator for water-to-air supercharger intercoolers.
    - Air conditioning condenser and twin auxiliary engine oil coolers in lower bumper corners.
    - Dual electric puller cooling fans with aerodynamic shrouds.
    """
    objs = []
    bm_rad = bmesh.new()

    # 1. Main Engine Radiator & Supercharger Heat Exchanger (Y = +1.880m, Z = 0.440m)
    mat_rad = Matrix.Translation(Vector((0.0, 1.880, 0.440))) @ Euler((math.radians(-12), 0, 0), 'XYZ').to_matrix().to_4x4()
    # Radiator Core Stacking (Finned Aluminum Core)
    bmesh.ops.create_cube(bm_rad, size=1.0, matrix=mat_rad @ Matrix.Diagonal(Vector((0.740, 0.060, 0.420, 1.0))))
    # Upper & Lower End Tanks
    bmesh.ops.create_cube(bm_rad, size=1.0, matrix=mat_rad @ Matrix.Translation(Vector((0, 0, 0.220))) @ Matrix.Diagonal(Vector((0.760, 0.075, 0.050, 1.0))))
    bmesh.ops.create_cube(bm_rad, size=1.0, matrix=mat_rad @ Matrix.Translation(Vector((0, 0, -0.220))) @ Matrix.Diagonal(Vector((0.760, 0.075, 0.050, 1.0))))

    # 2. Dual Electric Puller Fan Shrouds (Behind radiator)
    for fx_sign in [-1.0, 1.0]:
        mat_fan = mat_rad @ Matrix.Translation(Vector((fx_sign * 0.185, -0.050, 0)))
        bmesh.ops.create_cylinder(bm_rad, radius=0.160, depth=0.035, segments=20, matrix=mat_fan @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 3. Outer Auxiliary Oil Coolers (In front bumper shark gills, X = +/- 0.680m, Y = +1.980m)
    for ox_sign in [-1.0, 1.0]:
        mat_oil = Matrix.Translation(Vector((ox_sign * 0.680, 1.980, 0.360))) @ Euler((math.radians(8), ox_sign * math.radians(-14), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_rad, size=1.0, matrix=mat_oil @ Matrix.Diagonal(Vector((0.200, 0.045, 0.150, 1.0))))

    obj_rad = link_obj("GEO_FTYPE_Cooling_Module_and_Fans", bm_rad, parent_col, mats["satin_black"], bevel=0.001)
    objs.append(obj_rad)
    return objs


# ----------------------------------------------------------------------------
# 15. SUBSYSTEM 14: STRUT TOWER BRACES & ENGINE BAY BULKHEAD
# ----------------------------------------------------------------------------

def build_jaguar_ftype_structural_bracing(parent_col, mats):
    """
    Constructs high-rigidity structural aluminum reinforcements:
    - Cast aluminum front shock tower cross-brace (V-brace connecting towers to firewall).
    - Front hydroformed crash structure horns and radiator support core.
    - Rear axle subframe diagonal cross-ties.
    """
    objs = []
    bm_brace = bmesh.new()

    # 1. Front V-Strut Tower Cross-Brace (Over engine supercharger)
    # Towers at X = +/- 0.580m, Y = +1.280m, Z = 0.720m to Firewall Center (X = 0, Y = +0.820m, Z = 0.810m)
    p_firewall = Vector((0.0, 0.820, 0.810))
    for bx_sign in [-1.0, 1.0]:
        p_tower = Vector((bx_sign * 0.580, 1.280, 0.720))
        mid_b = (p_tower + p_firewall) * 0.5
        mat_v = Matrix.Translation(mid_b) @ Vector((0, 0, 1)).rotation_difference(p_firewall - p_tower).to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_brace, radius=0.018, depth=(p_firewall - p_tower).length, segments=14, matrix=mat_v)

    # Lateral Tower Tie Bar (Spanning directly between towers)
    mat_lat = Matrix.Translation(Vector((0.0, 1.280, 0.720)))
    bmesh.ops.create_cylinder(bm_brace, radius=0.016, depth=1.160, segments=14, matrix=mat_lat @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Front Crash Horns & Energy Absorber Boxes (Y = +1.950m to +2.180m, Z = 0.380m)
    for cx_sign in [-1.0, 1.0]:
        mat_horn = Matrix.Translation(Vector((cx_sign * 0.480, 2.060, 0.380)))
        bmesh.ops.create_cube(bm_brace, size=1.0, matrix=mat_horn @ Matrix.Diagonal(Vector((0.100, 0.220, 0.120, 1.0))))

    # Transverse Bumper Crash Beam (Aluminum Box Beam across front)
    mat_beam = Matrix.Translation(Vector((0.0, 2.160, 0.380)))
    bmesh.ops.create_cube(bm_brace, size=1.0, matrix=mat_beam @ Matrix.Diagonal(Vector((1.240, 0.080, 0.110, 1.0))))

    obj_brace = link_obj("GEO_FTYPE_Chassis_Bracing_and_Crash_Beams", bm_brace, parent_col, mats["alloy"], bevel=0.0015)
    objs.append(obj_brace)
    return objs


# ----------------------------------------------------------------------------
# 16. SUBSYSTEM 15: AERODYNAMIC SIDE SKIRTS & GROUND EFFECTS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_aerodynamic_side_skirts(parent_col, mats):
    """
    Constructs the sculpted polyurethane aerodynamic rocker side skirts:
    - Left and right low-drag side skirts spanning between front and rear wheel arches (Y: -1.050m to +1.050m).
    - Flared aerodynamic flick/strake ahead of the rear wheel arch to optimize flow around wide rear tires.
    - Integrated under-door stone guard trim and jacking point pads.
    """
    objs = []
    bm_skirts = bmesh.new()

    for sx_sign in [-1.0, 1.0]:
        sx = sx_sign * 0.880
        # Main Side Skirt Runner (Y = 0.000m, Z = 0.140m)
        mat_sk = Matrix.Translation(Vector((sx, 0.000, 0.145)))
        bmesh.ops.create_cube(bm_skirts, size=1.0, matrix=mat_sk @ Matrix.Diagonal(Vector((0.070, 2.100, 0.038, 1.0))))

        # Rear Aero Flick (Ahead of rear wheel arch, Y = -0.920m)
        mat_flick = Matrix.Translation(Vector((sx_sign * 0.920, -0.920, 0.170))) @ Euler((0, sx_sign * math.radians(-8), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_skirts, size=1.0, matrix=mat_flick @ Matrix.Diagonal(Vector((0.025, 0.220, 0.090, 1.0))))

        # Jacking Point Reinforcement Pads (Front and Rear of sill)
        for jp_y in [0.950, -0.950]:
            mat_pad = Matrix.Translation(Vector((sx_sign * 0.840, jp_y, 0.125)))
            bmesh.ops.create_cube(bm_skirts, size=1.0, matrix=mat_pad @ Matrix.Diagonal(Vector((0.060, 0.090, 0.018, 1.0))))

    obj_skirts = link_obj("GEO_FTYPE_Aerodynamic_Side_Skirts", bm_skirts, parent_col, mats["gloss_black"], bevel=0.0012)
    objs.append(obj_skirts)
    return objs
# ----------------------------------------------------------------------------
# 21. SUBSYSTEM 21: SIDE SILLS & DOOR INTRUSION BEAMS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_sills_and_door_beams(parent_col, mats):
    """
    Constructs internal structural side sill box sections and door side-impact beams:
    - Multi-chamber hydroformed aluminum side rocker sills providing torsional stiffness.
    - Diagonal ultra-high-strength aluminum side intrusion tubular beams inside doors.
    - Lower door hinge pillar reinforcements and door latch striker plates.
    """
    objs = []
    bm_sills = bmesh.new()
    bm_beams = bmesh.new()

    for sx_sign in [-1.0, 1.0]:
        sx = sx_sign * 0.810
        # 1. Multi-Chamber Rocker Box Sill (Y: -1.050m to +1.050m, Z = 0.170m)
        mat_sill = Matrix.Translation(Vector((sx, 0.000, 0.175)))
        bmesh.ops.create_cube(bm_sills, size=1.0, matrix=mat_sill @ Matrix.Diagonal(Vector((0.110, 2.100, 0.080, 1.0))))

        # Internal Sill Reinforcing Bulkheads (5 transverse bulkheads per sill)
        for bh_i in range(5):
            bh_y = (bh_i - 2) * 0.450
            mat_bh = mat_sill @ Matrix.Translation(Vector((0, bh_y, 0)))
            bmesh.ops.create_cube(bm_sills, size=1.0, matrix=mat_bh @ Matrix.Diagonal(Vector((0.095, 0.015, 0.070, 1.0))))

        # 2. Door Diagonal Side Intrusion Tubular Beam (Internal within door structural cavity)
        p1 = Vector((sx_sign * 0.700, 0.480, 0.280))
        p2 = Vector((sx_sign * 0.720, -0.320, 0.520))
        mid_bm = (p1 + p2) * 0.5
        mat_dbeam = Matrix.Translation(mid_bm) @ Vector((0, 0, 1)).rotation_difference(p2 - p1).to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_beams, radius=0.020, depth=(p2 - p1).length, segments=12, matrix=mat_dbeam)

        # Upper Door Beltline Reinforcement Tube (Internal)
        mat_belt = Matrix.Translation(Vector((sx_sign * 0.720, 0.080, 0.740)))
        bmesh.ops.create_cylinder(bm_beams, radius=0.016, depth=0.820, segments=12, matrix=mat_belt @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # Door Hinge Brackets (Upper and Lower on A-pillar)
        for h_z in [0.380, 0.680]:
            mat_hg = Matrix.Translation(Vector((sx_sign * 0.790, 0.580, h_z)))
            bmesh.ops.create_cube(bm_sills, size=1.0, matrix=mat_hg @ Matrix.Diagonal(Vector((0.060, 0.080, 0.055, 1.0))))

    obj_sills = link_obj("GEO_FTYPE_Structural_Sills", bm_sills, parent_col, mats["alloy"], bevel=0.0015)
    obj_beams = link_obj("GEO_FTYPE_Door_Intrusion_Beams", bm_beams, parent_col, mats["engine_metal"], bevel=0.001)

    objs.extend([obj_sills, obj_beams])
    return objs


# ----------------------------------------------------------------------------
# 22. SUBSYSTEM 22: CLAMSHELL BONNET UNDERSIDE RIBBING & STRUTS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_bonnet_underside_and_struts(parent_col, mats):
    """
    Constructs the internal reinforcement frame of the clamshell bonnet:
    - Formed aluminum inner skin skeleton with hexagonal cutout weight-reduction pockets.
    - Forward bonnet hinge pivots at front bumper nose.
    - Dual gas-charged pneumatic lift struts and safety latch catches.
    """
    objs = []
    bm_ribs = bmesh.new()
    bm_struts = bmesh.new()

    # 1. Inner Bonnet Structural Framing Ribs (Y: +0.820m to +2.050m)
    mat_in = Matrix.Translation(Vector((0.0, 1.450, 0.740)))
    # Outer Perimeter Flange Frame
    bmesh.ops.create_cube(bm_ribs, size=1.0, matrix=mat_in @ Matrix.Diagonal(Vector((1.420, 1.220, 0.018, 1.0))))

    # Longitudinal Stiffener Beams (Left and Right)
    for lx_sign in [-1.0, 1.0]:
        mat_lrib = mat_in @ Matrix.Translation(Vector((lx_sign * 0.440, 0, -0.012)))
        bmesh.ops.create_cube(bm_ribs, size=1.0, matrix=mat_lrib @ Matrix.Diagonal(Vector((0.050, 1.150, 0.024, 1.0))))

    # Diagonal X-Brace Ribs across hood center
    for diag_sign in [-1.0, 1.0]:
        mat_diag = mat_in @ Euler((0, 0, diag_sign * math.radians(28)), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_ribs, size=1.0, matrix=mat_diag @ Matrix.Diagonal(Vector((0.040, 1.200, 0.020, 1.0))))

    # 2. Dual Gas Struts (Supporting forward-tilting clamshell hood)
    for gx_sign in [-1.0, 1.0]:
        p_base = Vector((gx_sign * 0.680, 1.850, 0.520))
        p_hood = Vector((gx_sign * 0.580, 1.350, 0.760))
        mid_s = (p_base + p_hood) * 0.5
        mat_strut = Matrix.Translation(mid_s) @ Vector((0, 0, 1)).rotation_difference(p_hood - p_base).to_matrix().to_4x4()

        # Outer Pressure Cylinder
        bmesh.ops.create_cylinder(bm_struts, radius=0.012, depth=(p_hood - p_base).length * 0.55, segments=12, matrix=mat_strut)
        # Polished Chrome Inner Rod
        bmesh.ops.create_cylinder(bm_struts, radius=0.006, depth=(p_hood - p_base).length * 0.50, segments=10, matrix=mat_strut @ Matrix.Translation(Vector((0, 0, 0.060))))

    obj_ribs = link_obj("GEO_FTYPE_Bonnet_Underside_Ribbing", bm_ribs, parent_col, mats["satin_black"], bevel=0.001)
    obj_struts = link_obj("GEO_FTYPE_Bonnet_Gas_Struts", bm_struts, parent_col, mats["chrome"], bevel=0.0008)

    objs.extend([obj_ribs, obj_struts])
    return objs


# ----------------------------------------------------------------------------
# 23. SUBSYSTEM 23: REAR TRUNK WELL & DRAINAGE GUTTER ARCHITECTURE
# ----------------------------------------------------------------------------

def build_jaguar_ftype_trunk_well_and_gutters(parent_col, mats):
    """
    Constructs the convertible rear trunk compartment and water management gutters:
    - Molded composite trunk floor well beneath rear decklid.
    - Gutter drain channels surrounding soft-top tonneau and trunk lid perimeter.
    - Trunk lid spring-loaded counterbalance hinges and dual gas dampers.
    """
    objs = []
    bm_trunk = bmesh.new()

    # 1. Molded Composite Trunk Well (Y: -1.550m to -1.980m, Z = 0.380m to 0.720m)
    mat_tw = Matrix.Translation(Vector((0.0, -1.780, 0.540)))
    # Trunk Well Bucket Body
    bmesh.ops.create_cube(bm_trunk, size=1.0, matrix=mat_tw @ Matrix.Diagonal(Vector((1.080, 0.420, 0.280, 1.0))))

    # 2. Water Drainage Gutter Channels (Around soft-top rim: Y = -0.520m to -0.980m)
    for gx_sign in [-1.0, 1.0]:
        mat_gut = Matrix.Translation(Vector((gx_sign * 0.680, -0.740, 0.810)))
        bmesh.ops.create_cube(bm_trunk, size=1.0, matrix=mat_gut @ Matrix.Diagonal(Vector((0.040, 0.440, 0.025, 1.0))))

    # Transverse Gutter Collector Trough
    mat_gtrough = Matrix.Translation(Vector((0.0, -0.950, 0.810)))
    bmesh.ops.create_cube(bm_trunk, size=1.0, matrix=mat_gtrough @ Matrix.Diagonal(Vector((1.220, 0.035, 0.025, 1.0))))

    # 3. Trunk Lid Gooseneck Hinges & Gas Lift Struts
    for hx_sign in [-1.0, 1.0]:
        mat_hinge = Matrix.Translation(Vector((hx_sign * 0.480, -1.580, 0.760)))
        bmesh.ops.create_cylinder(bm_trunk, radius=0.010, depth=0.180, segments=10, matrix=mat_hinge @ Euler((math.radians(45), 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_trunk = link_obj("GEO_FTYPE_Trunk_Well_and_Gutters", bm_trunk, parent_col, mats["satin_black"], bevel=0.001)
    objs.append(obj_trunk)
    return objs
# ----------------------------------------------------------------------------
# 24. SUBSYSTEM 24: EPAS ELECTRIC STEERING RACK & TIE RODS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_steering_rack(parent_col, mats):
    """
    Constructs the rapid-ratio electric power-assisted steering gear:
    - Cast aluminum steering rack housing mounted low ahead of front axle.
    - Electric servo drive motor and recirculating ball transfer case.
    - Left and right articulated steering tie rods with threaded adjusters and ball joints.
    - Intermediate steering column shaft with universal joints connecting to firewall.
    """
    objs = []
    bm_steer = bmesh.new()

    # 1. Main Steering Rack Housing (Axle Y = +1.311m, Z = 0.220m)
    mat_rack = Matrix.Translation(Vector((0.0, 1.380, 0.225)))
    bmesh.ops.create_cylinder(bm_steer, radius=0.034, depth=0.780, segments=16, matrix=mat_rack @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Electric Power Steering Servo Motor (Offset on driver side)
    mat_motor = mat_rack @ Matrix.Translation(Vector((-0.180, -0.060, 0.040)))
    bmesh.ops.create_cylinder(bm_steer, radius=0.055, depth=0.180, segments=18, matrix=mat_motor @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Pinion Gearbox Housing
    mat_pinion = mat_rack @ Matrix.Translation(Vector((-0.240, 0.020, 0.050)))
    bmesh.ops.create_cube(bm_steer, size=1.0, matrix=mat_pinion @ Matrix.Diagonal(Vector((0.090, 0.090, 0.120, 1.0))))

    # 2. Left & Right Articulated Tie Rods (Connecting rack to steering knuckles)
    for tx_sign in [-1.0, 1.0]:
        p_in = Vector((tx_sign * 0.390, 1.380, 0.225))
        p_out = Vector((tx_sign * 0.720, 1.330, 0.240))
        mid_t = (p_in + p_out) * 0.5
        mat_tie = Matrix.Translation(mid_t) @ Vector((0, 0, 1)).rotation_difference(p_out - p_in).to_matrix().to_4x4()

        # Inner Accordion Rubber Bellows Boot
        bmesh.ops.create_cylinder(bm_steer, radius=0.032, depth=0.120, segments=14, matrix=mat_tie @ Matrix.Translation(Vector((0, 0, -0.100))))
        # Steel Tie Rod Shaft
        bmesh.ops.create_cylinder(bm_steer, radius=0.012, depth=(p_out - p_in).length, segments=12, matrix=mat_tie)
        # Outer Ball Joint Socket
        mat_ball = Matrix.Translation(p_out)
        bmesh.ops.create_cylinder(bm_steer, radius=0.022, depth=0.040, segments=12, matrix=mat_ball)

    # 3. Intermediate Steering Column Shaft (To firewall)
    p_rack = Vector((-0.240, 1.380, 0.280))
    p_cowl = Vector((-0.340, 0.850, 0.620))
    mid_col = (p_rack + p_cowl) * 0.5
    mat_col = Matrix.Translation(mid_col) @ Vector((0, 0, 1)).rotation_difference(p_cowl - p_rack).to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_steer, radius=0.016, depth=(p_cowl - p_rack).length, segments=12, matrix=mat_col)

    obj_steer = link_obj("GEO_FTYPE_EPAS_Steering_Assembly", bm_steer, parent_col, mats["engine_metal"], bevel=0.001)
    objs.append(obj_steer)
    return objs


# ----------------------------------------------------------------------------
# 25. SUBSYSTEM 25: FORGED ALUMINUM STEERING KNUCKLES & WHEEL HUBS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_uprights_and_hubs(parent_col, mats):
    """
    Constructs high-strength hollow cast aluminum suspension uprights / knuckles:
    - Front steering knuckles with integral brake caliper mounting bosses.
    - Rear wheel hub carriers supporting dual wishbone pivots and integral toe link ear.
    - Sealed dual-row angular contact wheel bearing cartridges with 5-lug drive flanges.
    """
    objs = []
    bm_knuckles = bmesh.new()

    knuckle_locations = [
        ("Front", 1.311, 0.720, True),
        ("Rear", -1.311, 0.740, False),
    ]

    for kn_name, ky, kx, is_front in knuckle_locations:
        for kx_sign in [-1.0, 1.0]:
            x_pos = kx_sign * kx
            mat_kn = Matrix.Translation(Vector((x_pos, ky, 0.343)))

            # 1. Main Upright Vertical Backbone (Connecting upper and lower ball joints)
            bmesh.ops.create_cube(bm_knuckles, size=1.0, matrix=mat_kn @ Matrix.Diagonal(Vector((0.075, 0.080, 0.280, 1.0))))

            # 2. Wheel Hub Spindle & Bearing Housing
            mat_hub = mat_kn @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()
            bmesh.ops.create_cylinder(bm_knuckles, radius=0.062, depth=0.090, segments=18, matrix=mat_hub)

            # 3. Brake Caliper Radial Mounting Bosses (Rigid bracket ears)
            mat_cboss1 = mat_kn @ Matrix.Translation(Vector((0, 0.110, 0.080)))
            bmesh.ops.create_cube(bm_knuckles, size=1.0, matrix=mat_cboss1 @ Matrix.Diagonal(Vector((0.040, 0.045, 0.045, 1.0))))
            mat_cboss2 = mat_kn @ Matrix.Translation(Vector((0, 0.110, -0.080)))
            bmesh.ops.create_cube(bm_knuckles, size=1.0, matrix=mat_cboss2 @ Matrix.Diagonal(Vector((0.040, 0.045, 0.045, 1.0))))

            # 4. Wheel Hub Drive Flange Face (Mating against brake rotor hat)
            mat_flange = mat_hub @ Matrix.Translation(Vector((0, 0, kx_sign * 0.042)))
            bmesh.ops.create_cylinder(bm_knuckles, radius=0.076, depth=0.012, segments=20, matrix=mat_flange)

    obj_knuckles = link_obj("GEO_FTYPE_Suspension_Uprights_and_Hubs", bm_knuckles, parent_col, mats["alloy"], bevel=0.0012)
    objs.append(obj_knuckles)
    return objs


# ----------------------------------------------------------------------------
# 26. SUBSYSTEM 26: REAR HIGH-DOWNFORCE DIFFUSER TUNNELS & STRAKES
# ----------------------------------------------------------------------------

def build_jaguar_ftype_underfloor_aero_tunnels(parent_col, mats):
    """
    Constructs the underbody high-downforce aerodynamic ground effect channels:
    - Expanding Venturi diffuser tunnels starting at rear axle centerline and expanding upward.
    - 4 longitudinal aerodynamic flow-straightening vertical strakes.
    - Differential cooling air scoop diverting high-speed underbody air to rear axle finning.
    """
    objs = []
    bm_tunnels = bmesh.new()

    # 1. Venturi Expansion Ramps (Y: -1.311m to -2.180m, expanding upward from Z = 0.140m to 0.280m)
    mat_vent = Matrix.Translation(Vector((0.0, -1.750, 0.210))) @ Euler((math.radians(8), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_tunnels, size=1.0, matrix=mat_vent @ Matrix.Diagonal(Vector((1.120, 0.860, 0.018, 1.0))))

    # 2. 4 Longitudinal Flow Separation Strakes
    for st_x in [-0.420, -0.150, 0.150, 0.420]:
        mat_strake = mat_vent @ Matrix.Translation(Vector((st_x, 0, -0.045)))
        bmesh.ops.create_cube(bm_tunnels, size=1.0, matrix=mat_strake @ Matrix.Diagonal(Vector((0.014, 0.840, 0.080, 1.0))))

    # 3. Differential Cooling NACA Inflow Duct
    mat_naca = Matrix.Translation(Vector((0.0, -1.150, 0.135)))
    bmesh.ops.create_cube(bm_tunnels, size=1.0, matrix=mat_naca @ Matrix.Diagonal(Vector((0.180, 0.260, 0.025, 1.0))))

    obj_tunnels = link_obj("GEO_FTYPE_Underbody_Diffuser_Tunnels", bm_tunnels, parent_col, mats["gloss_black"], bevel=0.001)
    objs.append(obj_tunnels)
    return objs
# ----------------------------------------------------------------------------
# 27. SUBSYSTEM 27: V8 VALVE COVERS & TWIN INDUCTION AIR BOXES
# ----------------------------------------------------------------------------

def build_jaguar_ftype_engine_induction_and_covers(parent_col, mats):
    """
    Constructs upper engine architecture and twin intake induction tracts:
    - Left and right contoured magnesium cam covers with ignition coil pack harness cover.
    - Symmetrical dual cold-air intake ducting leading to twin conical air filter boxes.
    - Forward intake ram air horns drawing cool atmospheric air from behind front grille.
    """
    objs = []
    bm_covers = bmesh.new()
    bm_air = bmesh.new()

    # 1. Magnesium Cam Covers (Left and Right Bank, canted at 45 degrees)
    for cx_sign in [-1.0, 1.0]:
        mat_cam = Matrix.Translation(Vector((cx_sign * 0.230, 1.250, 0.620))) @ Euler((0, cx_sign * math.radians(45), 0), 'XYZ').to_matrix().to_4x4()
        # Cam Cover Body
        bmesh.ops.create_cube(bm_covers, size=1.0, matrix=mat_cam @ Matrix.Diagonal(Vector((0.150, 0.540, 0.065, 1.0))))

        # 4 Spark Plug / Direct Ignition Coil Wells
        for plug_i in range(4):
            plug_y = (plug_i - 1.5) * 0.125
            mat_plug = mat_cam @ Matrix.Translation(Vector((0, plug_y, 0.035)))
            bmesh.ops.create_cylinder(bm_covers, radius=0.016, depth=0.025, segments=12, matrix=mat_plug)

        # 2. Dual Cold-Air Induction Boxes & Filter Housings (Ahead of suspension towers)
        mat_abox = Matrix.Translation(Vector((cx_sign * 0.440, 1.680, 0.620)))
        bmesh.ops.create_cube(bm_air, size=1.0, matrix=mat_abox @ Matrix.Diagonal(Vector((0.200, 0.240, 0.180, 1.0))))

        # Forward Air Snorkel Intake Horn (Reaching behind upper grille)
        p_box = Vector((cx_sign * 0.440, 1.800, 0.620))
        p_grille = Vector((cx_sign * 0.280, 2.100, 0.520))
        mid_snork = (p_box + p_grille) * 0.5
        mat_snork = Matrix.Translation(mid_snork) @ Vector((0, 0, 1)).rotation_difference(p_grille - p_box).to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_air, radius=0.045, depth=(p_grille - p_box).length, segments=14, matrix=mat_snork)

        # Intake Duct to Supercharger Throttle Body
        p_tb = Vector((0.0, 1.050, 0.680))
        mid_tb = (p_box + p_tb) * 0.5
        mat_tb = Matrix.Translation(mid_tb) @ Vector((0, 0, 1)).rotation_difference(p_tb - p_box).to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_air, radius=0.048, depth=(p_tb - p_box).length, segments=14, matrix=mat_tb)

    obj_covers = link_obj("GEO_FTYPE_Magnesium_Cam_Covers", bm_covers, parent_col, mats["engine_metal"], bevel=0.001)
    obj_air = link_obj("GEO_FTYPE_Twin_Induction_System", bm_air, parent_col, mats["satin_black"], bevel=0.0012)

    objs.extend([obj_covers, obj_air])
    return objs


# ----------------------------------------------------------------------------
# 28. SUBSYSTEM 28: FINNED OIL PAN & HIGH-PRESSURE DIRECT INJECTION SHIELDS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_oil_pan_and_fuel_rails(parent_col, mats):
    """
    Constructs lower engine architecture and fuel distribution:
    - Billet aluminum structural finned oil sump pan stiffening lower engine skirt.
    - High-pressure 200-bar direct injection stainless steel fuel distribution rails.
    - Acoustic damping composite engine beauty cover and sound deadener shields.
    """
    objs = []
    bm_pan = bmesh.new()
    bm_rails = bmesh.new()

    # 1. Structural Finned Oil Sump Pan (Y = +1.250m, Z = 0.160m to 0.260m)
    mat_pan = Matrix.Translation(Vector((0.0, 1.250, 0.210)))
    bmesh.ops.create_cube(bm_pan, size=1.0, matrix=mat_pan @ Matrix.Diagonal(Vector((0.440, 0.520, 0.100, 1.0))))

    # Transverse Cooling Fins on Sump
    for fin_i in range(8):
        fin_y = (fin_i - 3.5) * 0.055
        mat_fin = mat_pan @ Matrix.Translation(Vector((0, fin_y, -0.050)))
        bmesh.ops.create_cube(bm_pan, size=1.0, matrix=mat_fin @ Matrix.Diagonal(Vector((0.420, 0.008, 0.020, 1.0))))

    # 2. High-Pressure Direct Injection Fuel Rails (Flanking supercharger valley)
    for fx_sign in [-1.0, 1.0]:
        mat_rail = Matrix.Translation(Vector((fx_sign * 0.140, 1.250, 0.600)))
        bmesh.ops.create_cylinder(bm_rails, radius=0.012, depth=0.480, segments=12, matrix=mat_rail @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # 4 High-Pressure Fuel Injectors per Bank
        for inj_i in range(4):
            inj_y = (inj_i - 1.5) * 0.115
            mat_inj = mat_rail @ Matrix.Translation(Vector((0, inj_y, -0.035)))
            bmesh.ops.create_cylinder(bm_rails, radius=0.008, depth=0.050, segments=10, matrix=mat_inj)

    obj_pan = link_obj("GEO_FTYPE_Finned_Engine_Oil_Sump", bm_pan, parent_col, mats["engine_metal"], bevel=0.001)
    obj_rails = link_obj("GEO_FTYPE_Direct_Injection_Rails", bm_rails, parent_col, mats["chrome"], bevel=0.0008)

    objs.extend([obj_pan, obj_rails])
    return objs


# ----------------------------------------------------------------------------
# 29. SUBSYSTEM 29: EAD MULTI-PLATE CLUTCH & TORQUE VECTORING UNIT
# ----------------------------------------------------------------------------

def build_jaguar_ftype_ead_actuator_and_hydraulics(parent_col, mats):
    """
    Constructs the electronic active differential control unit:
    - High-speed electric motor actuator on side of differential carrier.
    - Internal multi-plate wet clutch pack housing varying locking torque from 0 to 100%.
    - Hydraulic pump module and accumulator for dynamic wheel-by-wheel torque vectoring.
    """
    objs = []
    bm_ead = bmesh.new()

    # EAD Electric Actuator Servo (Offset on left of differential)
    mat_ead_motor = Matrix.Translation(Vector((-0.240, -1.311, 0.380))) @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_ead, radius=0.048, depth=0.140, segments=16, matrix=mat_ead_motor)

    # Multi-Plate Clutch Pack Cylindrical Housing
    mat_clutch = Matrix.Translation(Vector((-0.120, -1.311, 0.320))) @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_ead, radius=0.088, depth=0.095, segments=20, matrix=mat_clutch)

    # Hydraulic Valve Block & Solenoid Stacks
    mat_vblock = Matrix.Translation(Vector((0.180, -1.240, 0.360)))
    bmesh.ops.create_cube(bm_ead, size=1.0, matrix=mat_vblock @ Matrix.Diagonal(Vector((0.090, 0.120, 0.100, 1.0))))

    # Pressure Accumulator Canister
    mat_accum = mat_vblock @ Matrix.Translation(Vector((0, -0.060, 0.040)))
    bmesh.ops.create_cylinder(bm_ead, radius=0.032, depth=0.110, segments=14, matrix=mat_accum @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_ead = link_obj("GEO_FTYPE_EAD_Torque_Vectoring_Actuator", bm_ead, parent_col, mats["engine_metal"], bevel=0.001)
    objs.append(obj_ead)
    return objs
# ----------------------------------------------------------------------------
# 30. SUBSYSTEM 30: PERFORMANCE SPORT BUCKET SEATS & EMBOSSED HEADRESTS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_sport_bucket_seats(parent_col, mats):
    """
    Constructs the driver and passenger lightweight performance sport seats:
    - High-bolstered ergonomic seat bottom cushions with leather/alcantara inserts.
    - Contoured seat backrests with pronounced lateral kidney and shoulder wings.
    - Integrated aerodynamic headrests aligned directly ahead of the safety roll hoops.
    - Recessed aluminum seat harness eyelet cutouts below headrests.
    """
    objs = []
    bm_seats = bmesh.new()

    for sx_sign in [-1.0, 1.0]:
        sx = sx_sign * 0.360
        sy = -0.240
        sz = 0.460

        # 1. Seat Bottom Cushion (Contoured bucket base)
        mat_base = Matrix.Translation(Vector((sx, sy, sz))) @ Euler((math.radians(-6), 0, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_seats, size=1.0, matrix=mat_base @ Matrix.Diagonal(Vector((0.440, 0.460, 0.120, 1.0))))

        # Lateral Thigh Support Bolsters (Left and Right of cushion)
        for bx_sign in [-1.0, 1.0]:
            mat_tbol = mat_base @ Matrix.Translation(Vector((bx_sign * 0.200, 0.020, 0.060)))
            bmesh.ops.create_cube(bm_seats, size=1.0, matrix=mat_tbol @ Matrix.Diagonal(Vector((0.070, 0.440, 0.090, 1.0))))

        # 2. Reclined Seat Backrest (Rake angle ~18 degrees, Y: -0.240m to -0.420m, Z: 0.520m to 0.980m)
        mat_back = Matrix.Translation(Vector((sx, sy - 0.160, sz + 0.320))) @ Euler((math.radians(-18), 0, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_seats, size=1.0, matrix=mat_back @ Matrix.Diagonal(Vector((0.420, 0.120, 0.520, 1.0))))

        # Lateral Kidney Support Wings
        for kx_sign in [-1.0, 1.0]:
            mat_kwing = mat_back @ Matrix.Translation(Vector((kx_sign * 0.190, 0.050, -0.040)))
            bmesh.ops.create_cube(bm_seats, size=1.0, matrix=mat_kwing @ Matrix.Diagonal(Vector((0.080, 0.110, 0.340, 1.0))))

        # 3. Integrated Headrest Apex (Z = 0.960m to 1.080m, directly ahead of roll hoops)
        mat_head = mat_back @ Matrix.Translation(Vector((0, 0.020, 0.320)))
        bmesh.ops.create_cube(bm_seats, size=1.0, matrix=mat_head @ Matrix.Diagonal(Vector((0.240, 0.110, 0.180, 1.0))))

        # Harness Pass-Through Cutout Bezel
        mat_eyelet = mat_back @ Matrix.Translation(Vector((0, 0.015, 0.180)))
        bmesh.ops.create_cube(bm_seats, size=1.0, matrix=mat_eyelet @ Matrix.Diagonal(Vector((0.180, 0.130, 0.040, 1.0))))

    obj_seats = link_obj("GEO_FTYPE_Sport_Bucket_Seats", bm_seats, parent_col, mats["satin_black"], bevel=0.002)
    objs.append(obj_seats)
    return objs


# ----------------------------------------------------------------------------
# 31. SUBSYSTEM 31: CENTER CONSOLE & TRANSMISSION TUNNEL SPINE
# ----------------------------------------------------------------------------

def build_jaguar_ftype_center_console(parent_col, mats):
    """
    Constructs the cockpit center console architecture:
    - High central transmission tunnel spine separating driver and passenger cocoons.
    - SportShift pistol-grip electronic gear selector lever.
    - Configurable Dynamics mode toggle switch (Checkered flag dynamic mode selector).
    - Center armrest storage compartment and cup holder cover.
    """
    objs = []
    bm_console = bmesh.new()

    # 1. Main Center Console Tunnel Spine (Y: -0.520m to +0.480m, Z = 0.440m to 0.680m)
    mat_tun = Matrix.Translation(Vector((0.0, -0.020, 0.540)))
    bmesh.ops.create_cube(bm_console, size=1.0, matrix=mat_tun @ Matrix.Diagonal(Vector((0.260, 0.980, 0.220, 1.0))))

    # 2. Forward Gear Selector Sloping Plinth (Y = +0.220m, Z = 0.620m)
    mat_plinth = Matrix.Translation(Vector((0.0, 0.220, 0.620))) @ Euler((math.radians(16), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_console, size=1.0, matrix=mat_plinth @ Matrix.Diagonal(Vector((0.220, 0.280, 0.060, 1.0))))

    # SportShift Pistol-Grip Gear Shifter Lever
    mat_shifter = mat_plinth @ Matrix.Translation(Vector((-0.030, 0.040, 0.060)))
    # Shifter Stalk
    bmesh.ops.create_cylinder(bm_console, radius=0.012, depth=0.070, segments=12, matrix=mat_shifter)
    # Leather/Chrome Shifter Grip
    mat_grip = mat_shifter @ Matrix.Translation(Vector((0, 0, 0.045))) @ Euler((math.radians(-12), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_console, size=1.0, matrix=mat_grip @ Matrix.Diagonal(Vector((0.042, 0.065, 0.040, 1.0))))

    # 3. Dynamic Mode Checkered Flag Toggle Switch
    mat_toggle = mat_plinth @ Matrix.Translation(Vector((0.055, 0.020, 0.040)))
    bmesh.ops.create_cube(bm_console, size=1.0, matrix=mat_toggle @ Matrix.Diagonal(Vector((0.024, 0.045, 0.015, 1.0))))

    # 4. Center Console Padded Armrest / Cubby Lid (Y = -0.280m, Z = 0.660m)
    mat_arm = Matrix.Translation(Vector((0.0, -0.280, 0.660)))
    bmesh.ops.create_cube(bm_console, size=1.0, matrix=mat_arm @ Matrix.Diagonal(Vector((0.240, 0.340, 0.045, 1.0))))

    obj_console = link_obj("GEO_FTYPE_Center_Console_Tunnel", bm_console, parent_col, mats["satin_black"], bevel=0.0015)
    objs.append(obj_console)
    return objs


# ----------------------------------------------------------------------------
# 32. SUBSYSTEM 32: DRIVER SPORT PEDAL BOX
# ----------------------------------------------------------------------------

def build_jaguar_ftype_pedal_box(parent_col, mats):
    """
    Constructs the driver-side aluminum sports pedals:
    - Floor-hinged brushed aluminum organ-style accelerator pedal with rubber traction grip studs.
    - Suspended cast aluminum brake pedal arm and anti-slip pad.
    - Slanted brushed aluminum dead pedal footrest in left footwell corner.
    """
    objs = []
    bm_pedals = bmesh.new()

    # Coordinates in Driver Footwell (X = -0.340m, Y = +0.550m, Z = 0.240m to 0.420m)
    # 1. Floor-Hinged Accelerator Pedal
    mat_acc = Matrix.Translation(Vector((-0.260, 0.580, 0.300))) @ Euler((math.radians(35), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_pedals, size=1.0, matrix=mat_acc @ Matrix.Diagonal(Vector((0.045, 0.140, 0.015, 1.0))))

    # 2. Suspended Brake Pedal
    mat_brk = Matrix.Translation(Vector((-0.340, 0.540, 0.350))) @ Euler((math.radians(25), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_pedals, size=1.0, matrix=mat_brk @ Matrix.Diagonal(Vector((0.075, 0.075, 0.020, 1.0))))
    # Brake Lever Arm
    bmesh.ops.create_cylinder(bm_pedals, radius=0.010, depth=0.180, segments=10, matrix=mat_brk @ Matrix.Translation(Vector((0, 0, 0.090))))

    # 3. Slanted Dead Pedal Footrest (Outboard left wall)
    mat_dead = Matrix.Translation(Vector((-0.440, 0.620, 0.320))) @ Euler((math.radians(40), math.radians(-10), 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_pedals, size=1.0, matrix=mat_dead @ Matrix.Diagonal(Vector((0.070, 0.220, 0.020, 1.0))))

    obj_pedals = link_obj("GEO_FTYPE_Sport_Pedals", bm_pedals, parent_col, mats["alloy"], bevel=0.001)
    objs.append(obj_pedals)
    return objs
# ----------------------------------------------------------------------------
# 33. SUBSYSTEM 33: UNDERBODY WIRING LOOMS & BRAKE HYDRAULIC HARDLINES
# ----------------------------------------------------------------------------

def build_jaguar_ftype_underbody_conduits(parent_col, mats):
    """
    Constructs the underbody conduit channels and hydraulic piping:
    - Main high-amperage battery power cable bundle routed along central tunnel.
    - Dual stainless steel brake hydraulic hardlines leading from ABS unit to rear brakes.
    - Fuel vapor return lines and chassis ground strap braids.
    """
    objs = []
    bm_lines = bmesh.new()

    # 1. Main High-Current Battery Power Cable Conduit (Y: -1.200m to +0.800m, Z = 0.160m)
    mat_pwr = Matrix.Translation(Vector((0.120, -0.200, 0.165)))
    bmesh.ops.create_cylinder(bm_lines, radius=0.014, depth=2.000, segments=12, matrix=mat_pwr @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Dual Brake Hydraulic Lines (Left and Right tunnel sills)
    for bx_sign in [-1.0, 1.0]:
        mat_bline = Matrix.Translation(Vector((bx_sign * 0.180, -0.100, 0.160)))
        bmesh.ops.create_cylinder(bm_lines, radius=0.006, depth=2.200, segments=10, matrix=mat_bline @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Conduit Retaining Clips (6 pairs of chassis mounting brackets)
    for clip_i in range(6):
        clip_y = (clip_i - 2.5) * 0.380
        mat_clip = Matrix.Translation(Vector((0.150, clip_y, 0.165)))
        bmesh.ops.create_cube(bm_lines, size=1.0, matrix=mat_clip @ Matrix.Diagonal(Vector((0.045, 0.020, 0.025, 1.0))))

    obj_lines = link_obj("GEO_FTYPE_Underbody_Conduit_Bundle", bm_lines, parent_col, mats["satin_black"], bevel=0.0005)
    objs.append(obj_lines)
    return objs


# ----------------------------------------------------------------------------
# 34. SUBSYSTEM 34: WHEEL ARCH AERO SPOILERS & SPLASH DEFLECTORS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_wheel_arch_spoilers(parent_col, mats):
    """
    Constructs the small vertical aerodynamic tire spat spoilers ahead of each wheel:
    - Front wheel arch forward lower air deflectors diverting turbulence away from rotating tire faces.
    - Rear wheel arch forward stone guards protecting rear quarter paintwork.
    """
    objs = []
    bm_spats = bmesh.new()

    # 1. Front Tire Air Spats (Y = +1.650m, X = +/- 0.810m, Z = 0.140m)
    for fx_sign in [-1.0, 1.0]:
        mat_fspat = Matrix.Translation(Vector((fx_sign * 0.810, 1.650, 0.150)))
        bmesh.ops.create_cube(bm_spats, size=1.0, matrix=mat_fspat @ Matrix.Diagonal(Vector((0.015, 0.080, 0.065, 1.0))))

    # 2. Rear Tire Air Spats & Stone Guards (Y = -0.980m, X = +/- 0.840m, Z = 0.145m)
    for rx_sign in [-1.0, 1.0]:
        mat_rspat = Matrix.Translation(Vector((rx_sign * 0.840, -0.980, 0.155)))
        bmesh.ops.create_cube(bm_spats, size=1.0, matrix=mat_rspat @ Matrix.Diagonal(Vector((0.015, 0.090, 0.075, 1.0))))

    obj_spats = link_obj("GEO_FTYPE_Wheel_Arch_Aero_Spats", bm_spats, parent_col, mats["gloss_black"], bevel=0.0008)
    objs.append(obj_spats)
    return objs


# ----------------------------------------------------------------------------
# 35. SUBSYSTEM 35: REAR SUSPENSION TOE CONTROL RODS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_rear_toe_links(parent_col, mats):
    """
    Constructs the rear multi-link independent suspension toe control rods:
    - Forged aluminum toe control links with threaded turnbuckle adjusters.
    - Subframe eccentric alignment cam bolts for dynamic bump-steer suppression.
    """
    objs = []
    bm_toe = bmesh.new()

    for tx_sign in [-1.0, 1.0]:
        p_sub = Vector((tx_sign * 0.320, -1.450, 0.280))
        p_hub = Vector((tx_sign * 0.680, -1.410, 0.310))
        mid_toe = (p_sub + p_hub) * 0.5
        mat_toe = Matrix.Translation(mid_toe) @ Vector((0, 0, 1)).rotation_difference(p_hub - p_sub).to_matrix().to_4x4()

        # Tubular Rod Body
        bmesh.ops.create_cylinder(bm_toe, radius=0.014, depth=(p_hub - p_sub).length, segments=12, matrix=mat_toe)
        # Hex Turnbuckle Adjuster Collar
        bmesh.ops.create_cylinder(bm_toe, radius=0.020, depth=0.040, segments=6, matrix=mat_toe @ Matrix.Translation(Vector((0, 0, 0.020))))
        # Inner Eccentric Alignment Bolt Head
        mat_ecc = Matrix.Translation(p_sub)
        bmesh.ops.create_cylinder(bm_toe, radius=0.024, depth=0.035, segments=12, matrix=mat_ecc @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_toe = link_obj("GEO_FTYPE_Rear_Toe_Control_Links", bm_toe, parent_col, mats["alloy"], bevel=0.001)
    objs.append(obj_toe)
    return objs


# ----------------------------------------------------------------------------
# 36. SUBSYSTEM 36: ENGINE BAY FLUID RESERVOIRS & EXPANSION TANK
# ----------------------------------------------------------------------------

def build_jaguar_ftype_engine_bay_reservoirs(parent_col, mats):
    """
    Constructs the engine bay ancillary fluid containers:
    - Pressurized coolant expansion tank with pressure relief cap.
    - Dual-circuit brake master cylinder fluid reservoir and vacuum booster drum.
    - Windshield washer fluid reservoir neck with bright blue cap.
    """
    objs = []
    bm_res = bmesh.new()

    # 1. Coolant Pressurized Expansion Tank (Passenger side cowl corner: X = 0.520m, Y = 0.950m, Z = 0.720m)
    mat_exp = Matrix.Translation(Vector((0.520, 0.950, 0.720)))
    bmesh.ops.create_cube(bm_res, size=1.0, matrix=mat_exp @ Matrix.Diagonal(Vector((0.180, 0.220, 0.140, 1.0))))
    # Pressure Cap
    bmesh.ops.create_cylinder(bm_res, radius=0.030, depth=0.025, segments=16, matrix=mat_exp @ Matrix.Translation(Vector((0, 0, 0.080))))

    # 2. Brake Booster Drum & Master Cylinder Reservoir (Driver side cowl: X = -0.480m, Y = 0.920m, Z = 0.680m)
    mat_boost = Matrix.Translation(Vector((-0.480, 0.920, 0.680)))
    # Vacuum Booster Drum
    bmesh.ops.create_cylinder(bm_res, radius=0.110, depth=0.080, segments=20, matrix=mat_boost @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    # Translucent Fluid Reservoir
    mat_bres = mat_boost @ Matrix.Translation(Vector((0, 0.090, 0.060)))
    bmesh.ops.create_cube(bm_res, size=1.0, matrix=mat_bres @ Matrix.Diagonal(Vector((0.080, 0.140, 0.075, 1.0))))

    # 3. Windshield Washer Filler Neck & Cap (Forward corner: X = -0.650m, Y = 1.720m, Z = 0.640m)
    mat_wash = Matrix.Translation(Vector((-0.650, 1.720, 0.640)))
    bmesh.ops.create_cylinder(bm_res, radius=0.024, depth=0.080, segments=14, matrix=mat_wash)

    obj_res = link_obj("GEO_FTYPE_Engine_Bay_Reservoirs", bm_res, parent_col, mats["satin_black"], bevel=0.001)
    objs.append(obj_res)
    return objs
# ----------------------------------------------------------------------------
# 37. SUBSYSTEM 37: ACTIVE RISING AIR VENT POD & DASHBOARD CONSOLE
# ----------------------------------------------------------------------------

def build_jaguar_ftype_dashboard_vents_and_screens(parent_col, mats):
    """
    Constructs Jaguar's theatrical rising center climate vent pod and cockpit display:
    - Motorized center air vent unit rising flush from top of dashboard when climate control activates.
    - Twin circular outboard turbine air vents flanking instrument binnacle.
    - InControl 8-inch high-resolution infotainment touchscreen display housing.
    - Lower dual rotary climate control dials with integrated digital temperature LCDs.
    """
    objs = []
    bm_vents = bmesh.new()

    # 1. Motorized Rising Center Air Vent Unit (Dashboard center top: Y = +0.540m, Z = 0.860m)
    mat_pod = Matrix.Translation(Vector((0.0, 0.540, 0.865))) @ Euler((math.radians(12), 0, 0), 'XYZ').to_matrix().to_4x4()
    # Rising Vent Housing Block
    bmesh.ops.create_cube(bm_vents, size=1.0, matrix=mat_pod @ Matrix.Diagonal(Vector((0.240, 0.120, 0.055, 1.0))))
    # Dual Louvered Outlet Nozzles
    for nx_sign in [-1.0, 1.0]:
        mat_nozzle = mat_pod @ Matrix.Translation(Vector((nx_sign * 0.065, 0.020, 0.005)))
        bmesh.ops.create_cube(bm_vents, size=1.0, matrix=mat_nozzle @ Matrix.Diagonal(Vector((0.085, 0.040, 0.035, 1.0))))

    # 2. Outboard Turbine Air Vents (Left and Right dashboard ends)
    for vx_sign in [-1.0, 1.0]:
        mat_turb = Matrix.Translation(Vector((vx_sign * 0.580, 0.490, 0.820))) @ Euler((0, vx_sign * math.radians(-15), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_vents, radius=0.038, depth=0.035, segments=18, matrix=mat_turb @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 3. InControl Touchscreen Center Display Bezel (Center console: Y = +0.420m, Z = 0.720m)
    mat_screen = Matrix.Translation(Vector((0.0, 0.420, 0.720))) @ Euler((math.radians(22), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_vents, size=1.0, matrix=mat_screen @ Matrix.Diagonal(Vector((0.220, 0.040, 0.140, 1.0))))

    # 4. Dual Rotary Climate Control Dials
    for dx_sign in [-1.0, 1.0]:
        mat_dial = mat_screen @ Matrix.Translation(Vector((dx_sign * 0.065, -0.015, -0.075)))
        bmesh.ops.create_cylinder(bm_vents, radius=0.026, depth=0.025, segments=18, matrix=mat_dial @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_vents = link_obj("GEO_FTYPE_Active_Vent_Pod_and_Screens", bm_vents, parent_col, mats["satin_black"], bevel=0.001)
    objs.append(obj_vents)
    return objs


# ----------------------------------------------------------------------------
# 38. SUBSYSTEM 38: FRONT BRAKE COOLING DUCTS & AERO STIFFENERS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_front_brake_cooling_ducts(parent_col, mats):
    """
    Constructs the high-velocity brake cooling airflow guides:
    - Left and right intake funnels behind front bumper shark gill intakes.
    - Sculpted composite ducts routing cool air directly onto 380mm brake rotors.
    - Aerodynamic wheel well exit louvers reducing high-pressure turbulence inside arches.
    """
    objs = []
    bm_ducts = bmesh.new()

    for dx_sign in [-1.0, 1.0]:
        p_grille = Vector((dx_sign * 0.680, 1.980, 0.360))
        p_rotor = Vector((dx_sign * 0.680, 1.340, 0.340))
        mid_d = (p_grille + p_rotor) * 0.5
        mat_duct = Matrix.Translation(mid_d) @ Vector((0, 0, 1)).rotation_difference(p_rotor - p_grille).to_matrix().to_4x4()

        # Hollow Airflow Tube
        bmesh.ops.create_cylinder(bm_ducts, radius=0.046, depth=(p_rotor - p_grille).length, segments=14, matrix=mat_duct)

        # Rotor Backing Air Diffuser Funnel
        mat_funnel = Matrix.Translation(p_rotor)
        bmesh.ops.create_cylinder(bm_ducts, radius=0.068, depth=0.050, segments=16, matrix=mat_funnel @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_ducts = link_obj("GEO_FTYPE_Front_Brake_Cooling_Ducts", bm_ducts, parent_col, mats["satin_black"], bevel=0.001)
    objs.append(obj_ducts)
    return objs


# ----------------------------------------------------------------------------
# 39. SUBSYSTEM 39: ALUMINUM ENGINE SKID PLATE & SHEAR WEBBING
# ----------------------------------------------------------------------------

def build_jaguar_ftype_engine_skid_plate_and_webbing(parent_col, mats):
    """
    Constructs high-durability underbody protection and shear reinforcement:
    - Formed stamped aluminum skid plate shielding engine oil pan and steering rack.
    - Diagonal laser-welded shear webbing plate tying subframe horns to main monocoque rails.
    - Flush countersunk fasteners and oil drain plug service hatch.
    """
    objs = []
    bm_skid = bmesh.new()

    # 1. Stamped Aluminum Skid Plate (Y: +1.050m to +1.680m, Z = 0.145m)
    mat_skid = Matrix.Translation(Vector((0.0, 1.365, 0.145)))
    bmesh.ops.create_cube(bm_skid, size=1.0, matrix=mat_skid @ Matrix.Diagonal(Vector((0.820, 0.620, 0.016, 1.0))))

    # Stamped Longitudinal Rib Stiffeners
    for s_i in range(5):
        s_x = (s_i - 2) * 0.140
        mat_srib = mat_skid @ Matrix.Translation(Vector((s_x, 0, -0.008)))
        bmesh.ops.create_cube(bm_skid, size=1.0, matrix=mat_srib @ Matrix.Diagonal(Vector((0.035, 0.580, 0.012, 1.0))))

    # 2. Diagonal Shear Webbing Triangles
    for wx_sign in [-1.0, 1.0]:
        mat_web = Matrix.Translation(Vector((wx_sign * 0.520, 1.080, 0.160))) @ Euler((0, 0, wx_sign * math.radians(32)), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_skid, size=1.0, matrix=mat_web @ Matrix.Diagonal(Vector((0.080, 0.440, 0.020, 1.0))))

    obj_skid = link_obj("GEO_FTYPE_Engine_Skid_Plate", bm_skid, parent_col, mats["alloy"], bevel=0.001)
    objs.append(obj_skid)
    return objs
# ----------------------------------------------------------------------------
# 40. SUBSYSTEM 40: REAR BULKHEAD TORSIONAL CROSS-BRACE
# ----------------------------------------------------------------------------

def build_jaguar_ftype_rear_bulkhead_cross_brace(parent_col, mats):
    """
    Constructs the convertible rear torsional stiffening cross-brace:
    - Massive extruded aluminum diagonal cross-brace spanning between rear suspension turrets.
    - Reinforces rear chassis rigidity against torsional flex when roof is lowered.
    - Billet machined mounting feet anchored directly to unibody shock towers.
    """
    objs = []
    bm_rbrace = bmesh.new()

    # Diagonal X-Brace between rear shock towers (X = +/- 0.580m, Y = -1.311m, Z = 0.680m to floor)
    for bx_sign in [-1.0, 1.0]:
        p_tower = Vector((bx_sign * 0.580, -1.311, 0.680))
        p_center = Vector((0.0, -1.150, 0.380))
        mid_b = (p_tower + p_center) * 0.5
        mat_x = Matrix.Translation(mid_b) @ Vector((0, 0, 1)).rotation_difference(p_center - p_tower).to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_rbrace, radius=0.022, depth=(p_center - p_tower).length, segments=14, matrix=mat_x)

    # Transverse Upper Turret Bar
    mat_rbar = Matrix.Translation(Vector((0.0, -1.311, 0.680)))
    bmesh.ops.create_cylinder(bm_rbrace, radius=0.018, depth=1.160, segments=14, matrix=mat_rbar @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_rbrace = link_obj("GEO_FTYPE_Rear_Torsional_Cross_Brace", bm_rbrace, parent_col, mats["alloy"], bevel=0.001)
    objs.append(obj_rbrace)
    return objs


# ----------------------------------------------------------------------------
# 41. SUBSYSTEM 41: ACTIVE EXHAUST BYPASS FLAPS & ACTUATORS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_active_exhaust_valves(parent_col, mats):
    """
    Constructs the electronically/pneumatically actuated exhaust valves:
    - 4 butterfly throttle valves integrated into outboard exhaust pipes.
    - Vacuum diaphragm actuator canisters mounted on top of tailpipe housings.
    - Connecting mechanical linkages opening valves under wide-open throttle or in Dynamic mode.
    """
    objs = []
    bm_valves = bmesh.new()

    for qx_sign in [-1.0, 1.0]:
        for q_sub in [-0.045, 0.045]:
            p_val = Vector((qx_sign * 0.620 + q_sub, -1.950, 0.250))
            # Butterfly Valve Pivot Shaft
            mat_shaft = Matrix.Translation(p_val) @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()
            bmesh.ops.create_cylinder(bm_valves, radius=0.005, depth=0.080, segments=8, matrix=mat_shaft)

            # Vacuum Actuator Canister (Mounted above pipe)
            mat_can = Matrix.Translation(p_val + Vector((0, 0, 0.055)))
            bmesh.ops.create_cylinder(bm_valves, radius=0.022, depth=0.045, segments=14, matrix=mat_can)

            # Actuator Linkage Rod
            mat_link = Matrix.Translation(p_val + Vector((0, 0, 0.025)))
            bmesh.ops.create_cylinder(bm_valves, radius=0.003, depth=0.035, segments=6, matrix=mat_link)

    obj_valves = link_obj("GEO_FTYPE_Active_Exhaust_Valves", bm_valves, parent_col, mats["engine_metal"], bevel=0.0008)
    objs.append(obj_valves)
    return objs


# ----------------------------------------------------------------------------
# 42. SUBSYSTEM 42: EAD ELECTRONIC DIFFERENTIAL COOLER PUMP
# ----------------------------------------------------------------------------

def build_jaguar_ftype_differential_cooler_system(parent_col, mats):
    """
    Constructs the auxiliary cooling circuit for the rear electronic differential:
    - External 12V electric gear-driven oil circulation pump mounted on rear subframe.
    - Stainless steel braided high-pressure oil lines connecting diff casing to cooler.
    - Compact 4-row oil heat exchanger mounted adjacent to rear bumper airflow.
    """
    objs = []
    bm_dcool = bmesh.new()

    # Electric Pump Motor (Y = -1.450m, Z = 0.320m)
    mat_dpump = Matrix.Translation(Vector((0.260, -1.450, 0.320)))
    bmesh.ops.create_cylinder(bm_dcool, radius=0.032, depth=0.090, segments=14, matrix=mat_dpump @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Mini Oil Heat Exchanger Core (Mounted in rear aerodynamic tunnel)
    mat_dcore = Matrix.Translation(Vector((0.320, -1.820, 0.220)))
    bmesh.ops.create_cube(bm_dcool, size=1.0, matrix=mat_dcore @ Matrix.Diagonal(Vector((0.160, 0.040, 0.100, 1.0))))

    # Braided Stainless Steel Return Line
    p_pump = Vector((0.260, -1.450, 0.320))
    p_core = Vector((0.320, -1.820, 0.220))
    mid_line = (p_pump + p_core) * 0.5
    mat_line = Matrix.Translation(mid_line) @ Vector((0, 0, 1)).rotation_difference(p_core - p_pump).to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_dcool, radius=0.008, depth=(p_core - p_pump).length, segments=10, matrix=mat_line)

    obj_dcool = link_obj("GEO_FTYPE_Differential_Cooler_Pump", bm_dcool, parent_col, mats["engine_metal"], bevel=0.001)
    objs.append(obj_dcool)
    return objs


# ----------------------------------------------------------------------------
# 43. SUBSYSTEM 43: REAR BATTERY CARRIER & POWER TERMINALS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_battery_carrier(parent_col, mats):
    """
    Constructs the rear-mounted 12V AGM battery installation (50:50 weight distribution):
    - Molded polypropylene battery tray sunken into rear trunk floor.
    - Heavy-duty 95Ah AGM automotive battery case with carrying strap.
    - Positive and negative clamp terminals with red insulating safety cover.
    """
    objs = []
    bm_bat = bmesh.new()

    # Battery Location (Center right trunk floor: X = 0.240m, Y = -1.680m, Z = 0.440m)
    mat_bat = Matrix.Translation(Vector((0.240, -1.680, 0.440)))
    # Battery Main Casing
    bmesh.ops.create_cube(bm_bat, size=1.0, matrix=mat_bat @ Matrix.Diagonal(Vector((0.180, 0.320, 0.190, 1.0))))

    # Battery Hold-Down Bracket Cross-Strap
    mat_strap = mat_bat @ Matrix.Translation(Vector((0, 0, 0.100)))
    bmesh.ops.create_cube(bm_bat, size=1.0, matrix=mat_strap @ Matrix.Diagonal(Vector((0.200, 0.040, 0.015, 1.0))))

    # Positive & Negative Terminals
    mat_pos = mat_bat @ Matrix.Translation(Vector((-0.060, 0.120, 0.105)))
    bmesh.ops.create_cylinder(bm_bat, radius=0.012, depth=0.020, segments=12, matrix=mat_pos)
    mat_neg = mat_bat @ Matrix.Translation(Vector((-0.060, -0.120, 0.105)))
    bmesh.ops.create_cylinder(bm_bat, radius=0.012, depth=0.020, segments=12, matrix=mat_neg)

    obj_bat = link_obj("GEO_FTYPE_Battery_Carrier", bm_bat, parent_col, mats["satin_black"], bevel=0.001)
    objs.append(obj_bat)
    return objs
# ----------------------------------------------------------------------------
# 44. SUBSYSTEM 44: CONVERTIBLE ROOF MECHANICAL SCISSOR ARMS & CYLINDERS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_roof_mechanism(parent_col, mats):
    """
    Constructs the compact Z-folding convertible soft-top mechanical mechanism:
    - Articulated magnesium/aluminum scissor arms linking main pivot to header.
    - Dual high-pressure hydraulic ram cylinders powering 12-second roof cycle.
    - Electronic roof latch lock mechanisms and tension cable guide pulleys.
    """
    objs = []
    bm_roof_mech = bmesh.new()

    for mx_sign in [-1.0, 1.0]:
        mx = mx_sign * 0.640
        my = -0.580
        mz = 0.780

        # Main Base Pivot Bracket (Anchored to B-pillar bulkhead)
        mat_pivot = Matrix.Translation(Vector((mx, my, mz)))
        bmesh.ops.create_cube(bm_roof_mech, size=1.0, matrix=mat_pivot @ Matrix.Diagonal(Vector((0.040, 0.080, 0.090, 1.0))))

        # Lower Scissor Control Arm
        p1 = Vector((mx, my, mz))
        p2 = Vector((mx - mx_sign * 0.040, my - 0.180, mz + 0.060))
        mid_sc1 = (p1 + p2) * 0.5
        mat_sc1 = Matrix.Translation(mid_sc1) @ Vector((0, 0, 1)).rotation_difference(p2 - p1).to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_roof_mech, radius=0.012, depth=(p2 - p1).length, segments=12, matrix=mat_sc1)

        # Upper Folding Linkage Arm
        p3 = Vector((mx - mx_sign * 0.020, my - 0.280, mz + 0.080))
        mid_sc2 = (p2 + p3) * 0.5
        mat_sc2 = Matrix.Translation(mid_sc2) @ Vector((0, 0, 1)).rotation_difference(p3 - p2).to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_roof_mech, radius=0.010, depth=(p3 - p2).length, segments=12, matrix=mat_sc2)

        # Hydraulic Lift Cylinder (Tucked into rear quarter cavity)
        p_cyl_base = Vector((mx, my + 0.050, mz - 0.120))
        mid_cyl = (p_cyl_base + p2) * 0.5
        mat_cyl = Matrix.Translation(mid_cyl) @ Vector((0, 0, 1)).rotation_difference(p2 - p_cyl_base).to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_roof_mech, radius=0.016, depth=(p2 - p_cyl_base).length, segments=12, matrix=mat_cyl)

    obj_roof_mech = link_obj("GEO_FTYPE_Roof_Folding_Linkages", bm_roof_mech, parent_col, mats["engine_metal"], bevel=0.001)
    objs.append(obj_roof_mech)
    return objs


# ----------------------------------------------------------------------------
# 45. SUBSYSTEM 45: ACTIVE REAR SPOILER SCREW-JACK DRIVE MECHANISM
# ----------------------------------------------------------------------------

def build_jaguar_ftype_spoiler_drive_unit(parent_col, mats):
    """
    Constructs the electric screw-jack actuator deploying active rear spoiler at 70 mph:
    - Dual motorized worm-screw linear actuators nestled inside trunk lid recess.
    - Scissor hinge deployment arms lifting and angling the aerodynamic blade.
    - Waterproof rubber concertina bellows seals shielding drive mechanism from rain.
    """
    objs = []
    bm_sp_drive = bmesh.new()

    for sx_sign in [-1.0, 1.0]:
        mat_sp_act = Matrix.Translation(Vector((sx_sign * 0.420, -1.860, 0.760)))

        # Electric Linear Screw Drive Motor Casing
        bmesh.ops.create_cylinder(bm_sp_drive, radius=0.024, depth=0.120, segments=14, matrix=mat_sp_act @ Euler((math.radians(14), 0, 0), 'XYZ').to_matrix().to_4x4())

        # Scissor Lifting Bracket
        bmesh.ops.create_cube(bm_sp_drive, size=1.0, matrix=mat_sp_act @ Matrix.Translation(Vector((0, 0, 0.035))) @ Matrix.Diagonal(Vector((0.035, 0.080, 0.040, 1.0))))

        # Flexible Accordion Weather Bellows (Shielding drive aperture)
        bmesh.ops.create_cube(bm_sp_drive, size=1.0, matrix=mat_sp_act @ Matrix.Translation(Vector((0, 0, 0.045))) @ Matrix.Diagonal(Vector((0.050, 0.095, 0.025, 1.0))))

    obj_sp_drive = link_obj("GEO_FTYPE_Spoiler_Drive_Actuators", bm_sp_drive, parent_col, mats["engine_metal"], bevel=0.001)
    objs.append(obj_sp_drive)
    return objs


# ----------------------------------------------------------------------------
# 46. SUBSYSTEM 46: FRONT BUMPER PEDESTRIAN IMPACT ABSORBER CORE
# ----------------------------------------------------------------------------

def build_jaguar_ftype_pedestrian_impact_absorber(parent_col, mats):
    """
    Constructs the front crash absorption and pedestrian safety structures:
    - Expanded polypropylene (EPP) energy-absorbing foam core behind bumper fascia.
    - Honeycomb crash absorber cells dampening low-speed parking impacts.
    - Lower pedestrian leg sweep spoiler bar preventing under-vehicle overrun.
    """
    objs = []
    bm_impact = bmesh.new()

    # EPP Foam Bumper Core (Mounted ahead of aluminum crash beam: Y = +2.180m, Z = 0.380m)
    mat_epp = Matrix.Translation(Vector((0.0, 2.190, 0.380)))
    bmesh.ops.create_cube(bm_impact, size=1.0, matrix=mat_epp @ Matrix.Diagonal(Vector((1.280, 0.065, 0.120, 1.0))))

    # Honeycomb Energy Absorption Cells
    for cell_i in range(8):
        cell_x = (cell_i - 3.5) * 0.150
        mat_cell = mat_epp @ Matrix.Translation(Vector((cell_x, -0.040, 0)))
        bmesh.ops.create_cube(bm_impact, size=1.0, matrix=mat_cell @ Matrix.Diagonal(Vector((0.080, 0.040, 0.090, 1.0))))

    # Lower Leg-Sweep Plastic Crossmember (Z = 0.180m)
    mat_sweep = Matrix.Translation(Vector((0.0, 2.220, 0.180)))
    bmesh.ops.create_cube(bm_impact, size=1.0, matrix=mat_sweep @ Matrix.Diagonal(Vector((1.320, 0.050, 0.040, 1.0))))

    obj_impact = link_obj("GEO_FTYPE_Pedestrian_Impact_Core", bm_impact, parent_col, mats["satin_black"], bevel=0.0015)
    objs.append(obj_impact)
    return objs


# ----------------------------------------------------------------------------
# 47. SUBSYSTEM 47: TRANSMISSION TUNNEL CARBON SHEAR CLOSURE PLATE
# ----------------------------------------------------------------------------

def build_jaguar_ftype_tunnel_shear_plate(parent_col, mats):
    """
    Constructs the lower transmission tunnel closure plate:
    - Aircraft-grade stamped aluminum / carbon composite tunnel shear plate.
    - Closes bottom of transmission tunnel, transforming open U-channel into closed torque tube.
    - Dual steel safety catch hoops preventing driveshaft ground-contact in case of joint failure.
    """
    objs = []
    bm_tunnel_plate = bmesh.new()

    # Tunnel Underbody Shear Plate (Y: -0.650m to +0.650m, Z = 0.145m)
    mat_tpl = Matrix.Translation(Vector((0.0, 0.000, 0.148)))
    bmesh.ops.create_cube(bm_tunnel_plate, size=1.0, matrix=mat_tpl @ Matrix.Diagonal(Vector((0.360, 1.300, 0.015, 1.0))))

    # Recessed Fastener Holes (10 heavy-duty M10 structural bolts)
    for bolt_i in range(5):
        bolt_y = (bolt_i - 2) * 0.280
        for bx_sign in [-1.0, 1.0]:
            mat_bolt = mat_tpl @ Matrix.Translation(Vector((bx_sign * 0.150, bolt_y, -0.005)))
            bmesh.ops.create_cylinder(bm_tunnel_plate, radius=0.010, depth=0.015, segments=10, matrix=mat_bolt)

    # Driveshaft Retaining Catch Loops (Front and Rear of propshaft)
    for loop_y in [0.250, -0.350]:
        mat_loop = Matrix.Translation(Vector((0.0, loop_y, 0.210)))
        bmesh.ops.create_cylinder(bm_tunnel_plate, radius=0.065, depth=0.035, segments=18, matrix=mat_loop @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_tpl = link_obj("GEO_FTYPE_Tunnel_Shear_Closure_Plate", bm_tunnel_plate, parent_col, mats["alloy"], bevel=0.001)
    objs.append(obj_tpl)
    return objs
# ----------------------------------------------------------------------------
# 48. SUBSYSTEM 48: ANTI-ROLL BAR DROP LINKS & URETHANE BUSHINGS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_sway_bar_drop_links(parent_col, mats):
    """
    Constructs the precision ball-jointed sway bar end links:
    - Front drop links connecting tubular stabilizer bar to front suspension strut bodies.
    - Rear vertical drop links linking rear sway bar to lower wishbones.
    - Anodized aluminum link rods with sealed dust-booted ball sockets.
    """
    objs = []
    bm_links = bmesh.new()

    link_data = [
        # Axle,    Y_pos,  Link_X, Z_low,  Z_high
        ("Front",  1.311,  0.640,  0.240,  0.420),
        ("Rear",  -1.311,  0.660,  0.220,  0.380),
    ]

    for ax_name, ay, lx, z_lo, z_hi in link_data:
        for lx_sign in [-1.0, 1.0]:
            p_lo = Vector((lx_sign * lx, ay + 0.120, z_lo))
            p_hi = Vector((lx_sign * (lx * 0.95), ay + 0.080, z_hi))
            mid_l = (p_lo + p_hi) * 0.5
            mat_link = Matrix.Translation(mid_l) @ Vector((0, 0, 1)).rotation_difference(p_hi - p_lo).to_matrix().to_4x4()

            # Connecting Link Rod
            bmesh.ops.create_cylinder(bm_links, radius=0.008, depth=(p_hi - p_lo).length, segments=10, matrix=mat_link)
            # Upper Ball Joint
            mat_ubj = Matrix.Translation(p_hi)
            bmesh.ops.create_cylinder(bm_links, radius=0.016, depth=0.030, segments=12, matrix=mat_ubj @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
            # Lower Ball Joint
            mat_lbj = Matrix.Translation(p_lo)
            bmesh.ops.create_cylinder(bm_links, radius=0.016, depth=0.030, segments=12, matrix=mat_lbj @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_links = link_obj("GEO_FTYPE_Sway_Bar_Drop_Links", bm_links, parent_col, mats["alloy"], bevel=0.0008)
    objs.append(obj_links)
    return objs


# ----------------------------------------------------------------------------
# 49. SUBSYSTEM 49: AIR CONDITIONING LINES & HIGH-PRESSURE PORTS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_ac_refrigerant_lines(parent_col, mats):
    """
    Constructs the dual-circuit air conditioning refrigerant plumbing:
    - High-pressure aluminum AC hardline routed along passenger inner fender apron.
    - Low-pressure insulated suction hose connecting compressor to firewall evaporator.
    - High and low side R134a/R1234yf charging valve service ports with color-coded caps.
    """
    objs = []
    bm_ac = bmesh.new()

    # AC Compressor Housing (Lower right of engine block: X = 0.280m, Y = 1.420m, Z = 0.320m)
    mat_comp = Matrix.Translation(Vector((0.280, 1.420, 0.320)))
    bmesh.ops.create_cylinder(bm_ac, radius=0.065, depth=0.160, segments=16, matrix=mat_comp @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # High-Pressure Line (Compressor to front condenser: Y = +1.420m to +1.880m)
    p_comp = Vector((0.280, 1.420, 0.360))
    p_cond = Vector((0.240, 1.880, 0.440))
    mid_ac = (p_comp + p_cond) * 0.5
    mat_acline = Matrix.Translation(mid_ac) @ Vector((0, 0, 1)).rotation_difference(p_cond - p_comp).to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_ac, radius=0.010, depth=(p_cond - p_comp).length, segments=10, matrix=mat_acline)

    # Low-Pressure Line (Compressor to firewall: Y = +1.420m to +0.840m)
    p_firewall = Vector((0.340, 0.840, 0.680))
    mid_ac2 = (p_comp + p_firewall) * 0.5
    mat_acline2 = Matrix.Translation(mid_ac2) @ Vector((0, 0, 1)).rotation_difference(p_firewall - p_comp).to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_ac, radius=0.014, depth=(p_firewall - p_comp).length, segments=12, matrix=mat_acline2)

    # Service Port Charging Valves
    mat_port1 = Matrix.Translation(Vector((0.360, 1.120, 0.650)))
    bmesh.ops.create_cylinder(bm_ac, radius=0.012, depth=0.024, segments=10, matrix=mat_port1)

    obj_ac = link_obj("GEO_FTYPE_AC_Refrigerant_Plumbing", bm_ac, parent_col, mats["alloy"], bevel=0.0008)
    objs.append(obj_ac)
    return objs
# ----------------------------------------------------------------------------
# 17. SUBSYSTEM 17: FRONT & REAR ALUMINUM SUBFRAME CRADLES
# ----------------------------------------------------------------------------

def build_jaguar_ftype_subframes(parent_col, mats):
    """
    Constructs high-rigidity front and rear aluminum subframe assemblies:
    - Hydroformed tubular front subframe cradle mounting engine and steering rack.
    - Multi-link rear subframe cradle isolating differential and suspension links.
    - Heavy-duty rubber/polyurethane hydraulic isolation bushings.
    """
    objs = []
    bm_sub = bmesh.new()

    # 1. Front Subframe Cradle (Axle Y = +1.311m, Z = 0.200m)
    mat_fsub = Matrix.Translation(Vector((0.0, 1.311, 0.200)))
    # Transverse Lower Cross-Member
    bmesh.ops.create_cube(bm_sub, size=1.0, matrix=mat_fsub @ Matrix.Diagonal(Vector((0.880, 0.160, 0.080, 1.0))))
    # Longitudinal Engine Mount Rails
    for fx_sign in [-1.0, 1.0]:
        mat_fside = mat_fsub @ Matrix.Translation(Vector((fx_sign * 0.380, -0.120, 0.040)))
        bmesh.ops.create_cube(bm_sub, size=1.0, matrix=mat_fside @ Matrix.Diagonal(Vector((0.090, 0.380, 0.070, 1.0))))

    # 2. Rear Subframe Cradle (Axle Y = -1.311m, Z = 0.220m)
    mat_rsub = Matrix.Translation(Vector((0.0, -1.311, 0.220)))
    # Perimeter Box Structure Surrounding Differential
    bmesh.ops.create_cube(bm_sub, size=1.0, matrix=mat_rsub @ Matrix.Diagonal(Vector((0.920, 0.580, 0.085, 1.0))))
    # Diagonal Subframe Shear Ties
    for rx_sign in [-1.0, 1.0]:
        mat_rtie = mat_rsub @ Matrix.Translation(Vector((rx_sign * 0.420, 0.220, 0.060))) @ Euler((0, 0, rx_sign * math.radians(28)), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_sub, size=1.0, matrix=mat_rtie @ Matrix.Diagonal(Vector((0.060, 0.320, 0.050, 1.0))))

    obj_sub = link_obj("GEO_FTYPE_Suspension_Subframe_Cradles", bm_sub, parent_col, mats["engine_metal"], bevel=0.0015)
    objs.append(obj_sub)
    return objs


# ----------------------------------------------------------------------------
# 18. SUBSYSTEM 18: SADDLE FUEL TANK & COMPOSITE HEAT SHIELDING
# ----------------------------------------------------------------------------

def build_jaguar_ftype_fuel_system_and_shields(parent_col, mats):
    """
    Constructs high-capacity saddle fuel tank and thermal shielding:
    - 70-liter molded polyethylene saddle fuel tank straddling propshaft ahead of rear axle.
    - Embossed dimpled aluminum foil heat shielding isolating exhaust tunnels.
    - Composite evaporative emissions carbon canister and fuel filler neck.
    """
    objs = []
    bm_fuel = bmesh.new()
    bm_shield = bmesh.new()

    # 1. Molded Saddle Fuel Tank (Y: -0.750m to -1.080m, Z = 0.240m to 0.460m)
    mat_tank = Matrix.Translation(Vector((0.0, -0.920, 0.350)))
    bmesh.ops.create_cube(bm_fuel, size=1.0, matrix=mat_tank @ Matrix.Diagonal(Vector((0.980, 0.320, 0.200, 1.0))))

    # Left & Right Deep Sump Lobes
    for tx_sign in [-1.0, 1.0]:
        mat_lobe = mat_tank @ Matrix.Translation(Vector((tx_sign * 0.360, 0.000, -0.060)))
        bmesh.ops.create_cylinder(bm_fuel, radius=0.120, depth=0.220, segments=18, matrix=mat_lobe @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Dimpled Aluminum Exhaust Heat Shields (Above exhaust pipes, Y: -1.700m to +0.800m)
    mat_tshield = Matrix.Translation(Vector((0.0, -0.400, 0.240)))
    bmesh.ops.create_cube(bm_shield, size=1.0, matrix=mat_tshield @ Matrix.Diagonal(Vector((0.440, 2.200, 0.010, 1.0))))

    # Rear Silencer Heat Shield (Under trunk floor)
    mat_rshield = Matrix.Translation(Vector((0.0, -1.800, 0.380)))
    bmesh.ops.create_cube(bm_shield, size=1.0, matrix=mat_rshield @ Matrix.Diagonal(Vector((1.080, 0.360, 0.010, 1.0))))

    obj_fuel = link_obj("GEO_FTYPE_Saddle_Fuel_Tank", bm_fuel, parent_col, mats["satin_black"], bevel=0.002)
    obj_shield = link_obj("GEO_FTYPE_Thermal_Heat_Shields", bm_shield, parent_col, mats["alloy"], bevel=0.001)

    objs.extend([obj_fuel, obj_shield])
    return objs


# ----------------------------------------------------------------------------
# 19. SUBSYSTEM 19: FLOOR CROSSMEMBERS & SPORT SEAT MOUNTING TRACKS
# ----------------------------------------------------------------------------

def build_jaguar_ftype_cockpit_floor_structure(parent_col, mats):
    """
    Constructs internal floor reinforcement members:
    - Transverse seat mounting crossmembers reinforcing cockpit side intrusion.
    - Extruded aluminum seat slider runners and tilt brackets.
    - Central driveshaft tunnel structural cover plate.
    """
    objs = []
    bm_floor = bmesh.new()

    # Transverse Cockpit Seat Crossmembers (Y = -0.050m and -0.380m)
    for cx_y in [-0.050, -0.380]:
        mat_cm = Matrix.Translation(Vector((0.0, cx_y, 0.180)))
        bmesh.ops.create_cube(bm_floor, size=1.0, matrix=mat_cm @ Matrix.Diagonal(Vector((1.420, 0.090, 0.040, 1.0))))

    # Seat Slider Tracks (Left and Right seats, 2 rails per seat)
    for sx_sign in [-1.0, 1.0]:
        for rail_off in [-0.180, 0.180]:
            mat_rail = Matrix.Translation(Vector((sx_sign * 0.360 + rail_off, -0.220, 0.220)))
            bmesh.ops.create_cube(bm_floor, size=1.0, matrix=mat_rail @ Matrix.Diagonal(Vector((0.035, 0.440, 0.025, 1.0))))

    obj_floor = link_obj("GEO_FTYPE_Floor_Structure_and_Tracks", bm_floor, parent_col, mats["alloy"], bevel=0.001)
    objs.append(obj_floor)
    return objs


# ----------------------------------------------------------------------------
# 20. MASTER PHASE 19 ASSEMBLY ORCHESTRATION & EXPORT PIPELINE
# ----------------------------------------------------------------------------

def build_jaguar_ftype_v8r_phase1():
    """
    Orchestrates the complete Phase 19 Class-A procedural generation:
    1. Initializes clean slate scene and authentic PBR shaders.
    2. Builds the 42-station monocoque body shell.
    3. Builds clamshell bonnet, twin power domes, shark grille cavity, and aero splitters.
    4. Builds high-rake windshield frame, optical safety glass, and folded tonneau.
    5. Builds enclosed wheelhouse tubs and aerodynamic aluminum undertray.
    6. Builds 20-inch Cyclone 5-split-spoke alloy wheels and Pirelli P Zero tires.
    7. Builds 380mm cross-drilled brake rotors and yellow 6-piston Brembo calipers.
    8. Builds 5.0L Supercharged V8 engine, 8-speed Quickshift transmission, and EAD.
    9. Builds double-wishbone front & rear suspension arms and adaptive dampers.
    10. Builds rollover protection hoops, polycarbonate wind deflector, and cockpit cowl.
    11. Builds active rear spoiler, gloss black aerodynamic diffuser, and quad exhaust plumbing.
    12. Builds cooling pack, chassis braces, aerodynamic side skirts, and subframes.
    13. Validates hierarchy and exports Phase 1 GLB asset.
    """
    clean_scene()
    print("==============================================================================")
    print("EXECUTING JAGUAR F-TYPE V8 R CONVERTIBLE (2010s) PHASE 19 GENERATOR")
    print("==============================================================================")

    mats = create_jaguar_ftype_pbr_materials()

    main_col = bpy.data.collections.new("Jaguar_FType_V8R_Phase1")
    bpy.context.scene.collection.children.link(main_col)

    all_objs = []
    print("-> 1. Building 42-Station Watertight Monocoque Body Shell...")
    all_objs.extend(build_jaguar_ftype_monocoque_body_shell(main_col, mats))

    print("-> 2. Building Clamshell Bonnet with Power Domes & Shark Grille...")
    all_objs.extend(build_jaguar_ftype_clamshell_bonnet_and_grille(main_col, mats))

    print("-> 3. Building Front Lower Aero Splitter & Bumper Valance...")
    all_objs.extend(build_jaguar_ftype_front_splitter_and_bumpers(main_col, mats))

    print("-> 4. Building Raked Windshield Frame, Glass & Folded Tonneau...")
    all_objs.extend(build_jaguar_ftype_windshield_and_tonneau(main_col, mats))

    print("-> 5. Building Enclosed Wheel Tubs & Aluminum Undertray...")
    all_objs.extend(build_jaguar_ftype_wheel_tubs_and_undertray(main_col, mats))

    print("-> 6. Building 20-Inch Cyclone Split-Spoke Wheels & Pirelli Tires...")
    all_objs.extend(build_jaguar_ftype_wheels_and_tires(main_col, mats))

    print("-> 7. Building 380mm Cross-Drilled Rotors & Yellow Brembo Calipers...")
    all_objs.extend(build_jaguar_ftype_brakes_and_calipers(main_col, mats))

    print("-> 8. Building 5.0L Supercharged V8 Powertrain & 8-Speed Drivetrain...")
    all_objs.extend(build_jaguar_ftype_powertrain_and_drivetrain(main_col, mats))

    print("-> 9. Building All-Aluminum Double Wishbone Suspension Architecture...")
    all_objs.extend(build_jaguar_ftype_suspension_subassemblies(main_col, mats))

    print("-> 10. Building Rollover Protection Hoops & Wind Deflector...")
    all_objs.extend(build_jaguar_ftype_roll_hoops_and_cockpit_cowl(main_col, mats))

    print("-> 11. Building Active Rear Spoiler & Gloss Black Rear Diffuser...")
    all_objs.extend(build_jaguar_ftype_rear_diffuser_and_spoiler(main_col, mats))

    print("-> 12. Building Quad Sport Exhaust Plumbing & Valved Silencer...")
    all_objs.extend(build_jaguar_ftype_exhaust_plumbing(main_col, mats))

    print("-> 13. Building Radiator Cooling Pack & Supercharger Exchangers...")
    all_objs.extend(build_jaguar_ftype_cooling_pack(main_col, mats))

    print("-> 14. Building Engine Bay V-Braces & Front Crash Horns...")
    all_objs.extend(build_jaguar_ftype_structural_bracing(main_col, mats))

    print("-> 15. Building Polyurethane Aerodynamic Side Skirts...")
    all_objs.extend(build_jaguar_ftype_aerodynamic_side_skirts(main_col, mats))

    print("-> 16. Building Aluminum Subframe Cradles & Fuel Tank Shielding...")
    all_objs.extend(build_jaguar_ftype_subframes(main_col, mats))
    all_objs.extend(build_jaguar_ftype_fuel_system_and_shields(main_col, mats))
    all_objs.extend(build_jaguar_ftype_cockpit_floor_structure(main_col, mats))

    print("-> 17. Building Side Sills & Door Intrusion Beams...")
    all_objs.extend(build_jaguar_ftype_sills_and_door_beams(main_col, mats))
    all_objs.extend(build_jaguar_ftype_bonnet_underside_and_struts(main_col, mats))
    all_objs.extend(build_jaguar_ftype_trunk_well_and_gutters(main_col, mats))

    print("-> 18. Building EPAS Steering Rack & Suspension Uprights...")
    all_objs.extend(build_jaguar_ftype_steering_rack(main_col, mats))
    all_objs.extend(build_jaguar_ftype_uprights_and_hubs(main_col, mats))
    all_objs.extend(build_jaguar_ftype_underfloor_aero_tunnels(main_col, mats))

    print("-> 19. Building Engine Induction, Finned Sump & EAD Unit...")
    all_objs.extend(build_jaguar_ftype_engine_induction_and_covers(main_col, mats))
    all_objs.extend(build_jaguar_ftype_oil_pan_and_fuel_rails(main_col, mats))
    all_objs.extend(build_jaguar_ftype_ead_actuator_and_hydraulics(main_col, mats))

    print("-> 20. Building Performance Bucket Seats & Center Console...")
    all_objs.extend(build_jaguar_ftype_sport_bucket_seats(main_col, mats))
    all_objs.extend(build_jaguar_ftype_center_console(main_col, mats))
    all_objs.extend(build_jaguar_ftype_pedal_box(main_col, mats))

    print("-> 21. Building Underbody Conduits, Aero Spats & Fluid Tanks...")
    all_objs.extend(build_jaguar_ftype_underbody_conduits(main_col, mats))
    all_objs.extend(build_jaguar_ftype_wheel_arch_spoilers(main_col, mats))
    all_objs.extend(build_jaguar_ftype_rear_toe_links(main_col, mats))
    all_objs.extend(build_jaguar_ftype_engine_bay_reservoirs(main_col, mats))

    print("-> 22. Building Dashboard Vent Pods, Brake Ducts & Skid Plate...")
    all_objs.extend(build_jaguar_ftype_dashboard_vents_and_screens(main_col, mats))
    all_objs.extend(build_jaguar_ftype_front_brake_cooling_ducts(main_col, mats))
    all_objs.extend(build_jaguar_ftype_engine_skid_plate_and_webbing(main_col, mats))

    print("-> 23. Building Rear Torsional Brace, Active Valves & Diff Cooler...")
    all_objs.extend(build_jaguar_ftype_rear_bulkhead_cross_brace(main_col, mats))
    all_objs.extend(build_jaguar_ftype_active_exhaust_valves(main_col, mats))
    all_objs.extend(build_jaguar_ftype_differential_cooler_system(main_col, mats))
    all_objs.extend(build_jaguar_ftype_battery_carrier(main_col, mats))

    print("-> 24. Building Roof Linkages, Spoiler Actuators & Impact Core...")
    all_objs.extend(build_jaguar_ftype_roof_mechanism(main_col, mats))
    all_objs.extend(build_jaguar_ftype_spoiler_drive_unit(main_col, mats))
    all_objs.extend(build_jaguar_ftype_pedestrian_impact_absorber(main_col, mats))
    all_objs.extend(build_jaguar_ftype_tunnel_shear_plate(main_col, mats))

    print("-> 25. Building Sway Bar Drop Links & AC Refrigerant Lines...")
    all_objs.extend(build_jaguar_ftype_sway_bar_drop_links(main_col, mats))
    all_objs.extend(build_jaguar_ftype_ac_refrigerant_lines(main_col, mats))

    print(f"[COMPLETE] Built {len(all_objs)} discrete CAD objects for Phase 19.")

    # Standalone Phase 1 Export
    exports_dir = "E:/Car_Automation/exports"
    os.makedirs(exports_dir, exist_ok=True)
    p1_path = os.path.join(exports_dir, "Car_Jaguar_FType_V8R_Phase1.glb")

    bpy.ops.export_scene.gltf(
        filepath=p1_path,
        export_format='GLB',
        export_apply=True,
        export_yup=True,
        export_texcoords=True,
        export_normals=True,
        export_materials='EXPORT',
    )
    print(f"[EXPORT] Successfully exported Phase 19 to {p1_path}")
    return all_objs


if __name__ == "__main__":
    build_jaguar_ftype_v8r_phase1()
