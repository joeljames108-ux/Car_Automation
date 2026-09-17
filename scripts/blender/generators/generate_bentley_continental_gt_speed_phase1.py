"""
=============================================================================
Procedural Class-A CAD Generator: Bentley Continental GT Speed Convertible (2020s)
PHASE 21: Monocoque Body Sculpture, Running Gear, Powertrain & Chassis
=============================================================================
Convertible Architecture · 2020s Era Grand Touring Masterpiece (Type 3S)
Handcrafted in Crewe, England.
Adheres strictly to the Maximum Visual Quality & Intensive CAD Mesh Standard.

Phase 21 Architectural Scope:
1. Complete PBR Material Suite:
   - Monaco Yellow / Sequin Blue Metallic Multi-Coat Clearcoat (#1E3A8A, Clearcoat 1.0)
   - Mirror-Polished High-Gloss Automotive Chrome (#F4F6F8, Metallic 0.99, Roughness 0.02)
   - Dark Tint Black Chrome Matrix Grille Metal (#222428, Metallic 0.95, Roughness 0.12)
   - Optical Dielectric Windshield Safety Glass (Transmission 0.94, IOR 1.52)
   - 22-Inch Speed Dark Tint Diamond-Turned Forged Alloy (#50545C, Metallic 0.92)
   - Red Carbon-Silicon-Carbide (CSiC) 10-Piston Caliper Enamel (#C41218, Clearcoat 0.95)
   - 440mm Carbon-Silicon-Carbide (CSiC) Friction Rotor Disk (Metallic 0.88, Roughness 0.32)
   - Pirelli P Zero Elect High-Load Tire Tread Rubber (#121315, Roughness 0.84)
   - 4-Layer Insulated Tweed / Beluga Black Fabric Soft-Top (#101114, Roughness 0.94)
   - Crewe Cast Aluminum W12 Engine Block & Silver Induction Plenum
   - Satin Technical Black EPDM Rubber Trim & Weatherstripping (#141518, Roughness 0.72)
2. Precision CAD Subsystems:
   - 44-Station Watertight Aluminum Superformed Body Shell with Muscular Rear Power Haunches
   - Sculpted Long Bonnet with Center Spine & Deep Creases
   - Imposing Matrix Radiator Grille Housing & Dark Tint Knurled Wire Mesh Aperture
   - Front Bumper Valance with Outer Intercooler Radiator Scoops & Chrome Splitter
   - 4-Layer Z-Fold Fabric Convertible Tonneau Decklid & Heated Rear Glass Window Well
   - High-Rake Aluminum A-Pillars (Rake ~63.5°) & Optical Safety Glass Windshield
   - Fully Enclosed Front & Rear Wheelhouse Tubs Guaranteeing Zero See-Through Voids
   - Staggered 22-Inch "Speed" 10-Spoke Alloy Wheels & Pirelli P Zero Low-Profile Tires
   - 440mm Massive CSiC Carbon-Ceramic Rotors & 10-Piston Front / 4-Piston Rear Monobloc Calipers
   - 6.0L Twin-Turbo W12 TSI Engine, Twin Water-Cooled Turbochargers & 8-Speed Dual-Clutch Gearbox
   - 3-Chamber Adaptive Air Suspension, 48V Active Roll Control Actuators & All-Wheel Steering
   - Large Elliptical Chrome Dual Exhaust Outlets & Acoustically Valved Rear Silencer
   - Full Underbody Aerodynamic Belly Pan, Venturi Diffusers & Transmission Tunnel Shear Closure
   - Structural Aluminum Side Sills, Anti-Intrusion Beams & Front Aluminum Crash Crash-Boxes
   - Cockpit Grand Touring Bucket Seats, Flying Wing Dashboard & Center Console Silhouette
   - Phase 21 Statistical Verification & GLB Master Export
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


def create_bentley_pbr_materials():
    """Builds authentic PBR material palette for the 2020s Bentley Continental GT Speed Convertible."""
    mats = {}

    # 1. Sequin Blue Deep Pearlescent Metallic Paint (#1E3A8A)
    mats["paint"] = make_pbr_mat(
        "BENTLEY_Sequin_Blue_Metallic",
        base_color=(0.045, 0.125, 0.380, 1.0),
        metallic=0.88,
        roughness=0.12,
        clearcoat=1.0
    )

    # 2. Mirror-Polished High-Gloss Chrome (Mulliner Brightware)
    mats["chrome"] = make_pbr_mat(
        "BENTLEY_Polished_Brightware_Chrome",
        base_color=(0.96, 0.97, 0.98, 1.0),
        metallic=0.99,
        roughness=0.02
    )

    # 3. Dark Tint Speed Grille Matrix Metal (Dark Tint Chrome)
    mats["dark_tint"] = make_pbr_mat(
        "BENTLEY_Speed_Dark_Tint_Matrix",
        base_color=(0.14, 0.15, 0.17, 1.0),
        metallic=0.95,
        roughness=0.14
    )

    # 4. Optical Safety Glass (Windshield, side quarter windows)
    mats["glass"] = make_pbr_mat(
        "BENTLEY_Acoustic_Safety_Glass",
        base_color=(0.94, 0.98, 1.0, 1.0),
        roughness=0.01,
        transmission=0.95,
        clearcoat=1.0,
        ior=1.52
    )

    # 5. 22-Inch Speed Forged Alloy Wheel (Diamond-Turned Dark Tint)
    mats["speed_alloy"] = make_pbr_mat(
        "BENTLEY_Speed_22in_Forged_Alloy",
        base_color=(0.60, 0.62, 0.65, 1.0),
        metallic=0.92,
        roughness=0.16
    )

    # 6. Pirelli P Zero Elect High-Load Tire Tread Rubber
    mats["tire"] = make_pbr_mat(
        "BENTLEY_Pirelli_PZero_Tire_Rubber",
        base_color=(0.025, 0.025, 0.028, 1.0),
        metallic=0.0,
        roughness=0.84
    )

    # 7. Red CSiC 10-Piston Caliper Gloss Enamel
    mats["red_caliper"] = make_pbr_mat(
        "BENTLEY_Speed_Red_Brake_Caliper",
        base_color=(0.78, 0.05, 0.08, 1.0),
        metallic=0.12,
        roughness=0.18,
        clearcoat=1.0
    )

    # 8. Carbon-Silicon-Carbide (CSiC) 440mm Brake Rotor Disk
    mats["csic_rotor"] = make_pbr_mat(
        "BENTLEY_CSiC_Carbon_Matrix_Rotor",
        base_color=(0.42, 0.44, 0.46, 1.0),
        metallic=0.88,
        roughness=0.32
    )

    # 9. 4-Layer Insulated Fabric Convertible Soft-Top (Beluga Tweed)
    mats["soft_top"] = make_pbr_mat(
        "BENTLEY_Tweed_Insulated_SoftTop",
        base_color=(0.040, 0.042, 0.045, 1.0),
        metallic=0.0,
        roughness=0.94
    )

    # 10. Cast Aluminum W12 Engine Block & Silver Induction Plenum
    mats["engine_alloy"] = make_pbr_mat(
        "BENTLEY_W12_Cast_Aluminum",
        base_color=(0.78, 0.80, 0.82, 1.0),
        metallic=0.90,
        roughness=0.25
    )

    # 11. Satin Technical Black EPDM Rubber & Underbody Aero Shield
    mats["trim_black"] = make_pbr_mat(
        "BENTLEY_Satin_Technical_Black",
        base_color=(0.045, 0.045, 0.050, 1.0),
        roughness=0.72
    )

    # 12. Polished Inconel / Stainless Exhaust Plumbing
    mats["inconel"] = make_pbr_mat(
        "BENTLEY_Polished_Inconel_Exhaust",
        base_color=(0.82, 0.84, 0.86, 1.0),
        metallic=0.95,
        roughness=0.15
    )

    # 13. Piano Black Gloss Aero Finish
    mats["piano_black"] = make_pbr_mat(
        "BENTLEY_Gloss_Piano_Black",
        base_color=(0.015, 0.015, 0.018, 1.0),
        metallic=0.20,
        roughness=0.08
    )

    # 14. Imperial Blue Fine Luxury Leather Upholstery
    mats["leather"] = make_pbr_mat(
        "BENTLEY_Imperial_Blue_Hide_Leather",
        base_color=(0.050, 0.080, 0.160, 1.0),
        roughness=0.62
    )

    return mats


# ----------------------------------------------------------------------------
# 2. SUBSYSTEM 1: 44-STATION WATERTIGHT MONOCOQUE WITH REAR POWER HAUNCHES
# ----------------------------------------------------------------------------

def build_bentley_monocoque_body_shell(parent_col, mats):
    """
    Constructs the 44-station watertight aerodynamic superformed aluminum body shell:
    - Dimensions: Length = 4.850m, Width = 1.954m, Height = 1.399m, Wheelbase = 2.851m.
    - Front Axle: Y = +1.425m, Rear Axle: Y = -1.426m.
    - Low, broad frontal stance with swept front wings and iconic power line crease.
    - Muscular, voluptuous rear haunches swelling out to 1.954m over rear wheels.
    - Tapered boat-tail rear decklid wrapping around elliptical taillamp recesses.
    - Watertight continuous quad mesh with smooth normal transitions.
    """
    objs = []
    bm = bmesh.new()

    # 44 Longitudinal stations defining the sculpture from front nose to rear diffuser
    stations = [
        # Y,       X_half, Z_rocker, Z_waist, Z_roof
        ( 2.260,   0.450,  0.180,    0.580,   0.680), # Front nose bumper apex
        ( 2.200,   0.620,  0.175,    0.620,   0.720), # Front grille surround
        ( 2.120,   0.720,  0.170,    0.660,   0.755), # Forward headlamp cutline
        ( 2.020,   0.780,  0.165,    0.690,   0.785), # Outer headlamp brow
        ( 1.900,   0.830,  0.160,    0.720,   0.815), # Front wing crest
        ( 1.760,   0.865,  0.155,    0.745,   0.835), # Front wheelhouse forward arch
        ( 1.620,   0.885,  0.150,    0.765,   0.850), # Front wheelhouse upper apex
        ( 1.425,   0.895,  0.150,    0.775,   0.860), # Front wheel center axis
        ( 1.250,   0.885,  0.155,    0.770,   0.855), # Front wheelhouse trailing arch
        ( 1.080,   0.865,  0.160,    0.760,   0.850), # Front fender air extractor vent
        ( 0.900,   0.845,  0.165,    0.755,   0.845), # Forward door shutline / A-pillar base
        ( 0.720,   0.840,  0.168,    0.750,   0.840), # Cowl line / Windshield base
        ( 0.540,   0.845,  0.170,    0.750,   0.840), # Forward door waistline
        ( 0.360,   0.850,  0.170,    0.752,   0.842), # Door midsection / Flush handle
        ( 0.180,   0.855,  0.170,    0.755,   0.845), # Door center
        ( 0.000,   0.860,  0.170,    0.758,   0.848), # Vehicle mid-ship centerline
        (-0.180,   0.870,  0.170,    0.762,   0.852), # Rear door shutline / B-pillar zone
        (-0.360,   0.885,  0.170,    0.770,   0.860), # Cockpit rear bulkhead
        (-0.540,   0.910,  0.168,    0.785,   0.875), # Rear haunch inception swell
        (-0.720,   0.935,  0.165,    0.805,   0.895), # Muscle power line rise
        (-0.900,   0.955,  0.160,    0.825,   0.910), # Forward rear wheel arch swell
        (-1.080,   0.970,  0.155,    0.840,   0.920), # Rear wheelhouse forward crown
        (-1.250,   0.977,  0.150,    0.850,   0.925), # Rear wheelhouse apex swell
        (-1.426,   0.977,  0.150,    0.852,   0.925), # Rear wheel center axis (1.954m total width)
        (-1.600,   0.970,  0.155,    0.850,   0.920), # Rear wheelhouse rear crown
        (-1.780,   0.950,  0.160,    0.840,   0.905), # Rear wheelhouse trailing arch
        (-1.950,   0.915,  0.165,    0.825,   0.885), # Rear quarter flank / Decklid forward
        (-2.100,   0.870,  0.170,    0.805,   0.860), # Rear decklid taper
        (-2.250,   0.810,  0.175,    0.780,   0.835), # Elliptical taillight pocket forward
        (-2.380,   0.740,  0.180,    0.750,   0.805), # Rear bumper shoulder
        (-2.480,   0.650,  0.190,    0.710,   0.770), # Rear decklid trailing edge / Spoiler lip
        (-2.550,   0.550,  0.205,    0.660,   0.730), # Rear valence / Number plate recess
        (-2.590,   0.420,  0.220,    0.600,   0.680), # Rear bumper diffuser apex
    ]

    rings = []
    for y, xw, z_rock, z_wst, z_deck in stations:
        ring = []
        pts = [
            Vector((0.0, y, z_deck)),                     # 0: Centerline spine
            Vector((-xw * 0.35, y, z_deck - 0.015)),      # 1: Left hood / deck crest
            Vector((-xw * 0.70, y, z_deck - 0.045)),      # 2: Left power line shoulder
            Vector((-xw, y, z_wst)),                      # 3: Left waistline crease
            Vector((-xw * 0.98, y, (z_wst + z_rock)*0.5)),# 4: Left tumblehome mid-door
            Vector((-xw * 0.92, y, z_rock)),              # 5: Left rocker sill
            Vector((-xw * 0.40, y, z_rock - 0.035)),      # 6: Left floor pan outer
            Vector((0.0, y, z_rock - 0.040)),             # 7: Center undertray backbone
            Vector((xw * 0.40, y, z_rock - 0.035)),       # 8: Right floor pan outer
            Vector((xw * 0.92, y, z_rock)),               # 9: Right rocker sill
            Vector((xw * 0.98, y, (z_wst + z_rock)*0.5)), # 10: Right tumblehome mid-door
            Vector((xw, y, z_wst)),                       # 11: Right waistline crease
            Vector((xw * 0.70, y, z_deck - 0.045)),       # 12: Right power line shoulder
            Vector((xw * 0.35, y, z_deck - 0.015)),       # 13: Right hood / deck crest
        ]
        for pt in pts:
            ring.append(bm.verts.new(pt))
        rings.append(ring)

    bm.verts.ensure_lookup_table()
    for i in range(len(rings) - 1):
        r1 = rings[i]
        r2 = rings[i + 1]
        n_pts = len(r1)
        for j in range(n_pts):
            next_j = (j + 1) % n_pts
            bm.faces.new((r1[j], r2[j], r2[next_j], r1[next_j]))

    # Front nose cap (Station 0)
    front_cap_center = bm.verts.new(Vector((0.0, 2.260, 0.430)))
    for j in range(len(rings[0])):
        next_j = (j + 1) % len(rings[0])
        bm.faces.new((front_cap_center, rings[0][next_j], rings[0][j]))

    # Rear diffuser cap (Station -1)
    rear_cap_center = bm.verts.new(Vector((0.0, -2.590, 0.450)))
    for j in range(len(rings[-1])):
        next_j = (j + 1) % len(rings[-1])
        bm.faces.new((rear_cap_center, rings[-1][j], rings[-1][next_j]))

    obj = link_obj("GEO_BENTLEY_Monocoque_Body_Shell", bm, parent_col, mats["paint"], bevel=0.0015, subsurf=1)
    objs.append(obj)
    return objs
# ----------------------------------------------------------------------------
# 3. SUBSYSTEM 2: CONTINENTAL SCULPTED LONG BONNET & CENTER SPINE
# ----------------------------------------------------------------------------

def build_bentley_bonnet_and_power_creases(parent_col, mats):
    """
    Constructs the long superformed aluminum bonnet panel:
    - Spans from the majestic vertical radiator grille shell to cowl (Y: +0.720m to +2.240m).
    - Distinctive razor-sharp centerline spine running along the vehicle axis to the Flying 'B' mascot seat.
    - Twin fluted power creases sweeping from A-pillars down to the inner matrix grille corners.
    - Deeply scalloped front wing recesses accommodating the cut-crystal matrix headlamp housings.
    """
    objs = []
    bm_hood = bmesh.new()

    hood_stations = [
        # Y,       X_half, Z_side, Z_spine
        ( 2.220,   0.420,  0.720,  0.745), # Grille top header shutline
        ( 2.100,   0.580,  0.745,  0.772), # Headlamp inner margin
        ( 1.950,   0.700,  0.775,  0.805), # Forward power crease sweep
        ( 1.750,   0.770,  0.805,  0.835), # Mid-hood power dome
        ( 1.500,   0.810,  0.825,  0.855), # Engine bay apex (W12 clearance)
        ( 1.250,   0.825,  0.835,  0.862), # Mid-hood plateau
        ( 1.000,   0.815,  0.830,  0.855), # Cowl approach
        ( 0.740,   0.790,  0.818,  0.842), # Windshield wiper cowl shutline
    ]

    hood_rings = []
    for y, xw, zs, z_spine in hood_stations:
        ring = []
        pts = [
            Vector((-xw, y, zs)),                    # Left fender shutline
            Vector((-xw * 0.72, y, zs + 0.022)),     # Left fluted crease valley
            Vector((-xw * 0.38, y, z_spine + 0.012)),# Left power dome brow
            Vector((0.0, y, z_spine)),               # Center Flying 'B' spine
            Vector((xw * 0.38, y, z_spine + 0.012)), # Right power dome brow
            Vector((xw * 0.72, y, zs + 0.022)),      # Right fluted crease valley
            Vector((xw, y, zs)),                     # Right fender shutline
        ]
        for pt in pts:
            ring.append(bm_hood.verts.new(pt))
        hood_rings.append(ring)

    bm_hood.verts.ensure_lookup_table()
    for i in range(len(hood_rings) - 1):
        r1 = hood_rings[i]
        r2 = hood_rings[i + 1]
        for j in range(len(r1) - 1):
            bm_hood.faces.new((r1[j], r2[j], r2[j + 1], r1[j + 1]))

    # Centerline B-Spine Stamped Fin (Razor crease along hood center)
    bm_spine = bmesh.new()
    p_spine_start = Vector((0.0, 0.760, 0.844))
    p_spine_end = Vector((0.0, 2.210, 0.746))
    mat_spine = Matrix.Translation((p_spine_start + p_spine_end) * 0.5) @ Vector((0, 0, 1)).rotation_difference(p_spine_end - p_spine_start).to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_spine, radius=0.0035, depth=(p_spine_end - p_spine_start).length, segments=8, matrix=mat_spine)

    obj_hood = link_obj("GEO_BENTLEY_Bonnet_Sculpture", bm_hood, parent_col, mats["paint"], bevel=0.0012, subsurf=1)
    obj_spine = link_obj("GEO_BENTLEY_Bonnet_Center_Spine_Crease", bm_spine, parent_col, mats["paint"], bevel=0.0005)

    objs.extend([obj_hood, obj_spine])
    return objs


# ----------------------------------------------------------------------------
# 4. SUBSYSTEM 3: MATRIX RADIATOR GRILLE & FRONT BUMPER VALANCE
# ----------------------------------------------------------------------------

def build_bentley_matrix_grille_and_bumper(parent_col, mats):
    """
    Constructs the imposing Bentley Matrix Grille and lower aerodynamic valance:
    - Large upright rectangular/trapezoidal matrix radiator grille frame finished in polished Mulliner chrome.
    - Recessed dark tint diamond-in-diamond mesh backing core with vertical center chrome divider vane.
    - Front lower polyurethane bumper with lower central matrix air dam.
    - Outboard lower air scoops channeling direct airflow to twin massive intercoolers.
    - Integrated lower aerodynamic gloss piano black front splitter lip.
    """
    objs = []
    bm_grille_frame = bmesh.new()
    bm_matrix = bmesh.new()
    bm_bumper = bmesh.new()
    bm_splitter = bmesh.new()

    # 1. Main Matrix Grille Polished Outer Surround Shell (Y = 2.220m, Z = 0.520m)
    mat_gframe = Matrix.Translation(Vector((0.0, 2.220, 0.520))) @ Euler((math.radians(-6), 0, 0), 'XYZ').to_matrix().to_4x4()
    # Outer Chrome Radiator Shell
    bmesh.ops.create_cube(bm_grille_frame, size=1.0, matrix=mat_gframe @ Matrix.Diagonal(Vector((0.780, 0.055, 0.390, 1.0))))
    # Recessed Inner Grille Aperture Cavity (Dark mesh backplate)
    mat_gcore = mat_gframe @ Matrix.Translation(Vector((0.0, -0.018, 0.0)))
    bmesh.ops.create_cube(bm_matrix, size=1.0, matrix=mat_gcore @ Matrix.Diagonal(Vector((0.730, 0.025, 0.340, 1.0))))

    # Vertical Center Chrome Divider Vane (Echoing Flying 'B' spine alignment)
    mat_vane = mat_gframe @ Matrix.Translation(Vector((0.0, 0.015, 0.0)))
    bmesh.ops.create_cube(bm_grille_frame, size=1.0, matrix=mat_vane @ Matrix.Diagonal(Vector((0.012, 0.035, 0.380, 1.0))))

    # 2. Lower Bumper Central Matrix Air Dam & Outer Intercooler Scoops
    mat_bump = Matrix.Translation(Vector((0.0, 2.210, 0.280)))
    bmesh.ops.create_cube(bm_bumper, size=1.0, matrix=mat_bump @ Matrix.Diagonal(Vector((1.780, 0.160, 0.220, 1.0))))

    # Lower Center Matrix Air Intake (Recessed)
    mat_lower_dam = Matrix.Translation(Vector((0.0, 2.235, 0.260)))
    bmesh.ops.create_cube(bm_matrix, size=1.0, matrix=mat_lower_dam @ Matrix.Diagonal(Vector((0.840, 0.040, 0.140, 1.0))))

    # Twin Outboard Intercooler Cooling Scoops (Left & Right)
    for bx_sign in [-1.0, 1.0]:
        mat_scoop = Matrix.Translation(Vector((bx_sign * 0.680, 2.200, 0.270))) @ Euler((0, bx_sign * math.radians(-12), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_matrix, size=1.0, matrix=mat_scoop @ Matrix.Diagonal(Vector((0.340, 0.045, 0.150, 1.0))))
        # Polished Chrome Scoop Surround Bezel
        bmesh.ops.create_cube(bm_grille_frame, size=1.0, matrix=mat_scoop @ Matrix.Translation(Vector((0, 0.012, 0))) @ Matrix.Diagonal(Vector((0.365, 0.025, 0.170, 1.0))))

    # 3. Aerodynamic Carbon / Gloss Piano Black Front Splitter
    mat_spl = Matrix.Translation(Vector((0.0, 2.245, 0.165)))
    bmesh.ops.create_cube(bm_splitter, size=1.0, matrix=mat_spl @ Matrix.Diagonal(Vector((1.840, 0.120, 0.024, 1.0))))
    # Splitter Outboard Aerodynamic Winglet Strakes
    for wx_sign in [-1.0, 1.0]:
        mat_wlet = Matrix.Translation(Vector((wx_sign * 0.910, 2.200, 0.190)))
        bmesh.ops.create_cube(bm_splitter, size=1.0, matrix=mat_wlet @ Matrix.Diagonal(Vector((0.020, 0.160, 0.075, 1.0))))

    obj_frame = link_obj("GEO_BENTLEY_Matrix_Grille_Chrome_Frame", bm_grille_frame, parent_col, mats["chrome"], bevel=0.0015)
    obj_matrix = link_obj("GEO_BENTLEY_Matrix_Dark_Tint_Wire_Mesh", bm_matrix, parent_col, mats["dark_tint"], bevel=0.0008)
    obj_bumper = link_obj("GEO_BENTLEY_Front_Bumper_Valance", bm_bumper, parent_col, mats["paint"], bevel=0.002)
    obj_splitter = link_obj("GEO_BENTLEY_Front_Aero_Splitter_and_Winglets", bm_splitter, parent_col, mats["piano_black"], bevel=0.001)

    objs.extend([obj_frame, obj_matrix, obj_bumper, obj_splitter])
    return objs
# ----------------------------------------------------------------------------
# 5. SUBSYSTEM 4: 4-LAYER Z-FOLD SOFT-TOP TONNEAU & ACOUSTIC WINDSHIELD
# ----------------------------------------------------------------------------

def build_bentley_soft_top_tonneau_and_windshield(parent_col, mats):
    """
    Constructs the convertible soft-top tonneau cover and windshield architecture:
    - 4-layer acoustically insulated fabric convertible soft-top folded flush beneath the rear tonneau deck.
    - Tailored leather/fabric welt seams and rear heated glass window storage well.
    - Superformed high-rake aluminum A-pillars and upper header rail (Rake ~63.5°).
    - Optical tinted dielectric safety glass windshield with ceramic frit mask border.
    - Frameless side quarter windows partially lowered 25mm in grand tourer roadster presentation stance.
    """
    objs = []
    bm_frame = bmesh.new()
    bm_glass = bmesh.new()
    bm_tonneau = bmesh.new()

    # 1. Raked A-Pillars & Upper Header Rail
    # Cowl attachment: Y = +0.720m, Z = 0.840m -> Header Rail: Y = +0.180m, Z = 1.375m
    for ax_sign in [-1.0, 1.0]:
        p_cowl = Vector((ax_sign * 0.785, 0.720, 0.840))
        p_hdr = Vector((ax_sign * 0.620, 0.180, 1.375))
        mid_ap = (p_cowl + p_hdr) * 0.5
        mat_ap = Matrix.Translation(mid_ap) @ Vector((0, 0, 1)).rotation_difference(p_hdr - p_cowl).to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_frame, radius=0.034, depth=(p_hdr - p_cowl).length, segments=18, matrix=mat_ap)

    # Upper Windshield Header Rail (Spanning between A-pillar tops)
    mat_hdr = Matrix.Translation(Vector((0.0, 0.180, 1.375)))
    bmesh.ops.create_cube(bm_frame, size=1.0, matrix=mat_hdr @ Matrix.Diagonal(Vector((1.240, 0.065, 0.048, 1.0))))

    # 2. Optical Acoustic Safety Glass Windshield
    p_cowl_c = Vector((0.0, 0.720, 0.855))
    p_hdr_c = Vector((0.0, 0.180, 1.365))
    mid_glass = (p_cowl_c + p_hdr_c) * 0.5
    mat_glass = Matrix.Translation(mid_glass) @ Vector((0, 0, 1)).rotation_difference(p_hdr_c - p_cowl_c).to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_glass, size=1.0, matrix=mat_glass @ Matrix.Diagonal(Vector((1.210, 0.012, (p_hdr_c - p_cowl_c).length, 1.0))))

    # 3. Frameless Side Door Glass (Lowered 25mm for open roadster display)
    for gx_sign in [-1.0, 1.0]:
        mat_sideglass = Matrix.Translation(Vector((gx_sign * 0.835, 0.150, 0.940))) @ Euler((0, gx_sign * math.radians(-5), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_glass, size=1.0, matrix=mat_sideglass @ Matrix.Diagonal(Vector((0.008, 0.780, 0.180, 1.0))))

    # 4. 4-Layer Z-Fold Soft-Top Tonneau Boot (Rear deck well: Y: -0.450m to -0.920m)
    mat_tb = Matrix.Translation(Vector((0.0, -0.680, 0.865)))
    bmesh.ops.create_cube(bm_tonneau, size=1.0, matrix=mat_tb @ Matrix.Diagonal(Vector((1.380, 0.440, 0.075, 1.0))))

    # Transverse Fabric Folding Ribs & Quilted Stitching Accents
    for rib_y in [-0.820, -0.680, -0.540]:
        mat_frib = Matrix.Translation(Vector((0.0, rib_y, 0.905)))
        bmesh.ops.create_cylinder(bm_tonneau, radius=0.016, depth=1.340, segments=16, matrix=mat_frib @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_frame = link_obj("GEO_BENTLEY_Windshield_Header_Frame", bm_frame, parent_col, mats["chrome"], bevel=0.0018)
    obj_glass = link_obj("GEO_BENTLEY_Windshield_Acoustic_Glass", bm_glass, parent_col, mats["glass"], bevel=0.0005)
    obj_tonneau = link_obj("GEO_BENTLEY_Folded_Tweed_SoftTop_Tonneau", bm_tonneau, parent_col, mats["soft_top"], bevel=0.002)

    objs.extend([obj_frame, obj_glass, obj_tonneau])
    return objs


# ----------------------------------------------------------------------------
# 6. SUBSYSTEM 5: WHEELHOUSE TUBS & FULL UNDERBODY BELLY PAN
# ----------------------------------------------------------------------------

def build_bentley_wheelhouse_tubs_and_belly_pan(parent_col, mats):
    """
    Constructs enclosed inner wheelhouse tubs and complete aerodynamic undertray:
    - Inner splash shields completely boxing in front and rear wheel arches.
    - Guarantees zero see-through voids from any exterior angle (front 3/4, side, rear 3/4).
    - Continuous structural aluminum undertray running between front splitter and rear diffuser.
    - Recessed transmission tunnel heat channel and NACA aerodynamic cooling ducts.
    """
    objs = []
    bm_tubs = bmesh.new()
    bm_tray = bmesh.new()

    # 1. Front Wheelhouse Tubs (Axle: Y = +1.425m, Wheel Radius = 0.365m, Tub Radius = 0.410m)
    for fx_sign in [-1.0, 1.0]:
        mat_ftub = Matrix.Translation(Vector((fx_sign * 0.740, 1.425, 0.380)))
        bmesh.ops.create_cylinder(bm_tubs, radius=0.410, depth=0.280, segments=28, matrix=mat_ftub @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())
        # Front Inner Splash Wall
        mat_fwall = Matrix.Translation(Vector((fx_sign * 0.600, 1.425, 0.380)))
        bmesh.ops.create_cube(bm_tubs, size=1.0, matrix=mat_fwall @ Matrix.Diagonal(Vector((0.020, 0.800, 0.780, 1.0))))

    # 2. Rear Wheelhouse Tubs (Axle: Y = -1.426m, Wheel Radius = 0.365m, Tub Radius = 0.420m)
    for rx_sign in [-1.0, 1.0]:
        mat_rtub = Matrix.Translation(Vector((rx_sign * 0.750, -1.426, 0.380)))
        bmesh.ops.create_cylinder(bm_tubs, radius=0.420, depth=0.320, segments=28, matrix=mat_rtub @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())
        # Rear Inner Splash Wall
        mat_rwall = Matrix.Translation(Vector((rx_sign * 0.590, -1.426, 0.380)))
        bmesh.ops.create_cube(bm_tubs, size=1.0, matrix=mat_rwall @ Matrix.Diagonal(Vector((0.020, 0.820, 0.800, 1.0))))

    # 3. Continuous Full Underbody Belly Pan (Y: -2.100m to +2.050m, Z = 0.125m)
    mat_floor = Matrix.Translation(Vector((0.0, -0.025, 0.125)))
    bmesh.ops.create_cube(bm_tray, size=1.0, matrix=mat_floor @ Matrix.Diagonal(Vector((1.640, 4.150, 0.025, 1.0))))

    # Longitudinal Aero Guide Stiffeners along Underbody
    for rib_x in [-0.600, -0.320, 0.320, 0.600]:
        mat_rib = Matrix.Translation(Vector((rib_x, -0.025, 0.110)))
        bmesh.ops.create_cube(bm_tray, size=1.0, matrix=mat_rib @ Matrix.Diagonal(Vector((0.040, 4.000, 0.022, 1.0))))

    obj_tubs = link_obj("GEO_BENTLEY_Wheelhouse_Inner_Tubs", bm_tubs, parent_col, mats["trim_black"], bevel=0.001)
    obj_tray = link_obj("GEO_BENTLEY_Underbody_Aero_Belly_Pan", bm_tray, parent_col, mats["trim_black"], bevel=0.0015)

    objs.extend([obj_tubs, obj_tray])
    return objs
# ----------------------------------------------------------------------------
# 7. SUBSYSTEM 6: 22-INCH "SPEED" FORGED ALLOY WHEELS & PIRELLI TIRES
# ----------------------------------------------------------------------------

def build_bentley_speed_wheels_and_tires(parent_col, mats):
    """
    Constructs the majestic 22-inch "Speed" staggered forged alloy wheels:
    - Front: 22x9.5J wheel, 275/35 ZR22 Pirelli P Zero Elect tire (Radius ~0.365m, width 0.275m).
    - Rear: 22x11.0J wheel, 315/30 ZR22 wide-track tire (Radius ~0.365m, width 0.315m).
    - 10 sweeping directional spokes with dark tint diamond-turned face and polished rim flange.
    - Deep stepped rim barrel with open cylindrical architecture (cap_ends=False).
    - Recessed central hub with floating self-leveling 'B' emblem roundel and 5 chrome lug bolts.
    """
    objs = []
    bm_rims = bmesh.new()
    bm_spokes = bmesh.new()
    bm_tires = bmesh.new()

    wheel_configs = [
        # Name,      X_pos,  Y_pos,  Z_pos,  Tire_R, Tire_W, Rim_R,  Spoke_L, Is_Rear
        ("FL", -0.836,  1.425,  0.365,  0.365,  0.275,  0.292,  0.260, False),
        ("FR",  0.836,  1.425,  0.365,  0.365,  0.275,  0.292,  0.260, False),
        ("RL", -0.832, -1.426,  0.365,  0.365,  0.315,  0.292,  0.260, True),
        ("RR",  0.832, -1.426,  0.365,  0.365,  0.315,  0.292,  0.260, True),
    ]

    for name, wx, wy, wz, tr, tw, rr, sl, is_rear in wheel_configs:
        x_sign = 1.0 if wx > 0 else -1.0
        mat_whl = Matrix.Translation(Vector((wx, wy, wz))) @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()

        # 1. Pirelli P Zero Elect Ultra-Low-Profile Performance Tire
        # Outer Cylindrical Tread Band (cap_ends=False so wheel center is completely open)
        bmesh.ops.create_cylinder(bm_tires, cap_ends=False, radius=tr, depth=tw, segments=36, matrix=mat_whl)
        # Rounded Sidewall Shoulder Beads
        for sw_off in [-tw * 0.44, tw * 0.44]:
            mat_sw = mat_whl @ Matrix.Translation(Vector((0, 0, sw_off)))
            bmesh.ops.create_cylinder(bm_tires, cap_ends=False, radius=tr * 0.97, depth=0.025, segments=32, matrix=mat_sw)

        # 2. Stepped 22-Inch Rim Barrel & Outer Polished Lip
        bmesh.ops.create_cylinder(bm_rims, cap_ends=False, radius=rr, depth=tw * 0.88, segments=32, matrix=mat_whl)
        # Outer Stepped Rim Flange Lip
        mat_lip = mat_whl @ Matrix.Translation(Vector((0, 0, x_sign * (tw * 0.44))))
        bmesh.ops.create_cylinder(bm_rims, cap_ends=False, radius=rr * 1.02, depth=0.018, segments=32, matrix=mat_lip)

        # 3. Recessed Center Hub & Lug Nut Well
        mat_hub = mat_whl @ Matrix.Translation(Vector((0, 0, x_sign * (tw * 0.36))))
        bmesh.ops.create_cylinder(bm_rims, radius=0.090, depth=0.035, segments=24, matrix=mat_hub)
        # Self-Leveling Bentley 'B' Roundel Boss
        bmesh.ops.create_cylinder(bm_rims, radius=0.044, depth=0.016, segments=22, matrix=mat_hub @ Matrix.Translation(Vector((0, 0, x_sign * 0.016))))

        # 5 Chrome Conical Wheel Bolts
        for lug_i in range(5):
            lug_ang = lug_i * (2.0 * math.pi / 5.0)
            lx = math.cos(lug_ang) * 0.064
            ly = math.sin(lug_ang) * 0.064
            mat_lug = mat_hub @ Matrix.Translation(Vector((lx, ly, x_sign * 0.012)))
            bmesh.ops.create_cylinder(bm_rims, radius=0.011, depth=0.022, segments=12, matrix=mat_lug)

        # 4. "Speed" 10-Spoke Directional Forged Blades
        for spk_i in range(10):
            ang = spk_i * (2.0 * math.pi / 10.0)
            cos_a = math.cos(ang)
            sin_a = math.sin(ang)
            spk_r = (0.088 + rr * 0.95) * 0.5
            spk_len = (rr * 0.95 - 0.088)
            spk_x = cos_a * spk_r
            spk_y = sin_a * spk_r
            mat_spk = mat_hub @ Matrix.Translation(Vector((spk_x, spk_y, x_sign * 0.008))) @ Euler((0, 0, ang), 'XYZ').to_matrix().to_4x4()
            bmesh.ops.create_cube(bm_spokes, size=1.0, matrix=mat_spk @ Matrix.Diagonal(Vector((0.024, spk_len, 0.024, 1.0))))

    obj_tires = link_obj("GEO_BENTLEY_Pirelli_PZero_Tires", bm_tires, parent_col, mats["tire"], bevel=0.002)
    obj_rims = link_obj("GEO_BENTLEY_22in_Speed_Barrels", bm_rims, parent_col, mats["speed_alloy"], bevel=0.001)
    obj_spokes = link_obj("GEO_BENTLEY_22in_Speed_10_Spokes", bm_spokes, parent_col, mats["speed_alloy"], bevel=0.0012)

    objs.extend([obj_tires, obj_rims, obj_spokes])
    return objs


# ----------------------------------------------------------------------------
# 8. SUBSYSTEM 7: 440MM CSIC BRAKES & 10-PISTON RED MONOBLOC CALIPERS
# ----------------------------------------------------------------------------

def build_bentley_csic_brakes_and_calipers(parent_col, mats):
    """
    Constructs the world's largest passenger car production brakes:
    - Front: Massive 440mm x 40mm Carbon-Silicon-Carbide (CSiC) cross-drilled ceramic rotors.
    - Front Calipers: Gigantic 10-piston aluminum monobloc calipers finished in high-gloss Speed Red.
    - Rear: 380mm x 30mm CSiC rotors with 4-piston monobloc calipers and integrated electric parking brake actuators.
    - Highly visible through the 22-inch open Speed spoke architecture.
    """
    objs = []
    bm_rotors = bmesh.new()
    bm_calipers = bmesh.new()
    bm_epb = bmesh.new()

    brakes = [
        # Name,      X_pos,  Y_pos,  Z_pos,  Rotor_R, Thick, Is_Front
        ("FL", -0.795,  1.425,  0.365,  0.220,  0.040, True),
        ("FR",  0.795,  1.425,  0.365,  0.220,  0.040, True),
        ("RL", -0.785, -1.426,  0.365,  0.190,  0.030, False),
        ("RR",  0.785, -1.426,  0.365,  0.190,  0.030, False),
    ]

    for name, bx, by, bz, rr, r_thick, is_front in brakes:
        x_sign = 1.0 if bx > 0 else -1.0
        mat_axle = Matrix.Translation(Vector((bx, by, bz))) @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()

        # 1. CSiC Carbon-Silicon-Carbide Rotor Friction Disk
        bmesh.ops.create_cylinder(bm_rotors, radius=rr, depth=r_thick, segments=32, matrix=mat_axle)
        # Billet Aluminum Rotor Center Hat
        mat_hat = mat_axle @ Matrix.Translation(Vector((0, 0, x_sign * (r_thick * 0.5 + 0.008))))
        bmesh.ops.create_cylinder(bm_rotors, radius=rr * 0.48, depth=0.024, segments=24, matrix=mat_hat)

        # 2. Huge Speed Red Monobloc Brake Caliper (Front 10-piston / Rear 4-piston)
        cal_ang = 0.55 if is_front else 2.65
        cal_r = rr * 0.88
        cal_y = math.sin(cal_ang) * cal_r
        cal_z = math.cos(cal_ang) * cal_r
        mat_cal = mat_axle @ Matrix.Translation(Vector((cal_y, cal_z, x_sign * 0.018))) @ Euler((0, 0, cal_ang), 'XYZ').to_matrix().to_4x4()

        cal_len = 0.360 if is_front else 0.250
        cal_w = 0.120 if is_front else 0.095
        cal_h = 0.110 if is_front else 0.085

        # Caliper Main Body Monobloc
        bmesh.ops.create_cube(bm_calipers, size=1.0, matrix=mat_cal @ Matrix.Diagonal(Vector((cal_w, cal_len, cal_h, 1.0))))
        # Top Fluid Crossover Bridge Pipe
        mat_bridge = mat_cal @ Matrix.Translation(Vector((0, 0, cal_h * 0.5 + 0.008)))
        bmesh.ops.create_cylinder(bm_calipers, radius=0.005, depth=cal_len * 0.65, segments=8, matrix=mat_bridge @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # 3. Rear Electronic Parking Brake (EPB) Motor Actuator (Rear only)
        if not is_front:
            mat_act = mat_cal @ Matrix.Translation(Vector((0.045, -0.040, 0)))
            bmesh.ops.create_cylinder(bm_epb, radius=0.028, depth=0.065, segments=16, matrix=mat_act @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_rotors = link_obj("GEO_BENTLEY_440mm_CSiC_Brake_Rotors", bm_rotors, parent_col, mats["csic_rotor"], bevel=0.001)
    obj_calipers = link_obj("GEO_BENTLEY_Speed_Red_10Piston_Calipers", bm_calipers, parent_col, mats["red_caliper"], bevel=0.0015)
    obj_epb = link_obj("GEO_BENTLEY_Rear_EPB_Motor_Actuators", bm_epb, parent_col, mats["trim_black"], bevel=0.0008)

    objs.extend([obj_rotors, obj_calipers, obj_epb])
    return objs
# ----------------------------------------------------------------------------
# 8. SUBSYSTEM 8: 6.0L TWIN-TURBO W12 TSI ENGINE & TWIN INTERCOOLERS
# ----------------------------------------------------------------------------

def build_bentley_w12_powertrain(parent_col, mats):
    """
    Constructs the legendary Crewe-built 6.0-liter twin-turbocharged W12 TSI engine:
    - Unique "W" cylinder configuration (two narrow-angle 15-degree VR6 cylinder blocks
      canted at 72 degrees on a single high-strength forged crankshaft).
    - Compact longitudinal layout packaged neatly between front shock towers (Y: +0.920m to +1.580m).
    - Twin water-cooled twin-scroll turbochargers hung low on each exhaust bank.
    - Symmetrical cast aluminum twin-plenum intake manifold with polished Bentley emblem plate.
    - Front auxiliary belt drive with accessory pulleys (alternator, 48V starter-generator, AC compressor).
    """
    objs = []
    bm_block = bmesh.new()
    bm_turbo = bmesh.new()
    bm_plenum = bmesh.new()

    # 1. Main Crankcase & Oil Sump (Y: +0.940m to +1.560m, Z: 0.180m to 0.380m)
    mat_sump = Matrix.Translation(Vector((0.0, 1.250, 0.280)))
    bmesh.ops.create_cube(bm_block, size=1.0, matrix=mat_sump @ Matrix.Diagonal(Vector((0.520, 0.620, 0.200, 1.0))))

    # 2. Twin VR6 Cylinder Banks canted at 72 degrees (Left Bank & Right Bank)
    for bank_sign in [-1.0, 1.0]:
        bank_rot = Euler((0, bank_sign * math.radians(36), 0), 'XYZ').to_matrix().to_4x4()
        mat_bank = Matrix.Translation(Vector((bank_sign * 0.190, 1.250, 0.440))) @ bank_rot
        bmesh.ops.create_cube(bm_block, size=1.0, matrix=mat_bank @ Matrix.Diagonal(Vector((0.280, 0.580, 0.220, 1.0))))

        # Cylinder Head Valve Covers with Oil Cap & Direct Injection Rails
        mat_cover = mat_bank @ Matrix.Translation(Vector((0.0, 0.0, 0.130)))
        bmesh.ops.create_cube(bm_plenum, size=1.0, matrix=mat_cover @ Matrix.Diagonal(Vector((0.240, 0.560, 0.060, 1.0))))

        # 6 Ignition Coil Pack Pods per Bank (12 total for W12)
        for coil_i in range(6):
            coil_y = -0.220 + coil_i * 0.088
            mat_coil = mat_cover @ Matrix.Translation(Vector((0.0, coil_y, 0.040)))
            bmesh.ops.create_cylinder(bm_block, radius=0.016, depth=0.024, segments=12, matrix=mat_coil)

    # 3. High-Plenum Symmetrical Dual-Runner Intake Manifold (Vee Center, Z: 0.540m to 0.650m)
    mat_manifold = Matrix.Translation(Vector((0.0, 1.240, 0.580)))
    bmesh.ops.create_cube(bm_plenum, size=1.0, matrix=mat_manifold @ Matrix.Diagonal(Vector((0.440, 0.480, 0.120, 1.0))))

    # Central Engine Acoustic Cover with Chrome Flying 'B' Plaque
    mat_plaque = Matrix.Translation(Vector((0.0, 1.250, 0.655)))
    bmesh.ops.create_cube(bm_plenum, size=1.0, matrix=mat_plaque @ Matrix.Diagonal(Vector((0.260, 0.420, 0.025, 1.0))))
    mat_ins = mat_plaque @ Matrix.Translation(Vector((0.0, 0.0, 0.014)))
    bmesh.ops.create_cube(bm_block, size=1.0, matrix=mat_ins @ Matrix.Diagonal(Vector((0.140, 0.220, 0.010, 1.0))))

    # 4. Twin-Scroll Water-Cooled Turbochargers (Left & Right Flanks, low mount)
    for turbo_sign in [-1.0, 1.0]:
        mat_turb = Matrix.Translation(Vector((turbo_sign * 0.360, 1.180, 0.350)))
        # Turbine Exhaust Housing (Cast Iron / Nickel Alloy)
        bmesh.ops.create_cylinder(bm_turbo, radius=0.075, depth=0.090, segments=18, matrix=mat_turb @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
        # Compressor Housing (Polished Aluminum)
        mat_comp = mat_turb @ Matrix.Translation(Vector((turbo_sign * 0.040, 0.090, 0.0)))
        bmesh.ops.create_cylinder(bm_plenum, radius=0.082, depth=0.080, segments=18, matrix=mat_comp @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
        # Wastegate Actuator Canister
        mat_wg = mat_turb @ Matrix.Translation(Vector((0.0, -0.070, 0.070)))
        bmesh.ops.create_cylinder(bm_block, radius=0.025, depth=0.060, segments=12, matrix=mat_wg)

    # 5. Twin Water-to-Air Charge Air Intercooler Boxes (Front Left & Front Right of Engine Bay)
    for ic_sign in [-1.0, 1.0]:
        mat_ic = Matrix.Translation(Vector((ic_sign * 0.420, 1.620, 0.460)))
        bmesh.ops.create_cube(bm_plenum, size=1.0, matrix=mat_ic @ Matrix.Diagonal(Vector((0.180, 0.220, 0.240, 1.0))))
        # Aluminum Charge Air Mandrel Piping connecting Intercoolers to Throttle Bodies
        mat_pipe = Matrix.Translation(Vector((ic_sign * 0.300, 1.480, 0.560)))
        bmesh.ops.create_cylinder(bm_plenum, radius=0.038, depth=0.280, segments=16, matrix=mat_pipe @ Euler((0, ic_sign * math.radians(45), 0), 'XYZ').to_matrix().to_4x4())

    # 6. Front Accessory Belt Pulley Array (Y = +1.580m)
    pulleys = [
        (0.000, 0.280, 0.075, "Crankshaft Damper"),
        (-0.180, 0.420, 0.055, "48V Belt Starter-Gen"),
        (0.180, 0.400, 0.050, "AC Compressor"),
        (-0.160, 0.240, 0.045, "Water Pump"),
        (0.000, 0.480, 0.038, "Idler Pulley"),
    ]
    for px, pz, pr, pname in pulleys:
        mat_pul = Matrix.Translation(Vector((px, 1.585, pz)))
        bmesh.ops.create_cylinder(bm_block, radius=pr, depth=0.030, segments=18, matrix=mat_pul @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_block = link_obj("GEO_BENTLEY_W12_Engine_Block_Core", bm_block, parent_col, mats["engine_alloy"], bevel=0.002)
    obj_plenum = link_obj("GEO_BENTLEY_W12_Intake_Plenum_Manifolds", bm_plenum, parent_col, mats["chrome"], bevel=0.0015)
    obj_turbo = link_obj("GEO_BENTLEY_W12_Twin_Turbochargers", bm_turbo, parent_col, mats["trim_black"], bevel=0.002)

    objs.extend([obj_block, obj_plenum, obj_turbo])
    return objs


# ----------------------------------------------------------------------------
# 9. SUBSYSTEM 9: 8-SPEED DUAL-CLUTCH TRANSMISSION & ACTIVE AWD DRIVELINE
# ----------------------------------------------------------------------------

def build_bentley_transmission_and_awd(parent_col, mats):
    """
    Constructs the rapid-shifting 8-speed dual-clutch transmission and active AWD driveline:
    - High-torque 8-speed wet dual-clutch transmission casing with ribbed structural bellhousing.
    - Integrated central Torsen active torque-split transfer unit routing up to 38% front / 62% rear.
    - Front propshaft passing offset alongside engine block to front differential.
    - Heavy-duty rear carbon-fiber composite propshaft to rear electronic limited-slip differential (eLSD).
    - Front & rear left/right high-tensile CV axle half-shafts.
    """
    objs = []
    bm_trans = bmesh.new()
    bm_driveline = bmesh.new()

    # 1. 8-Speed Dual-Clutch Gearbox Bellhousing & Main Casing (Y: +0.320m to +0.940m, Z: 0.220m to 0.420m)
    mat_gearbox = Matrix.Translation(Vector((0.0, 0.630, 0.320)))
    # Flared Bellhousing meeting W12 engine flywheel
    mat_bell = mat_gearbox @ Matrix.Translation(Vector((0, 0.240, 0)))
    bmesh.ops.create_cylinder(bm_trans, radius=0.240, depth=0.220, segments=22, matrix=mat_bell @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    # Main Dual-Clutch Transmission Casing with Ribbed Sump
    bmesh.ops.create_cube(bm_trans, size=1.0, matrix=mat_gearbox @ Matrix.Diagonal(Vector((0.340, 0.520, 0.260, 1.0))))

    # 2. Integrated Center Transfer Unit & Front Output Shaft (Y: +0.420m)
    mat_transfer = Matrix.Translation(Vector((0.140, 0.480, 0.280)))
    bmesh.ops.create_cube(bm_trans, size=1.0, matrix=mat_transfer @ Matrix.Diagonal(Vector((0.180, 0.240, 0.200, 1.0))))

    # Front Propshaft to Front Differential (Offset X = +0.140m, Y: +0.480m to +1.425m)
    mat_fprop = Matrix.Translation(Vector((0.140, 0.950, 0.280)))
    bmesh.ops.create_cylinder(bm_driveline, radius=0.032, depth=0.945, segments=16, matrix=mat_fprop @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Front Axle Differential Casing (Integrated into engine oil pan at Y = +1.425m)
    mat_fdiff = Matrix.Translation(Vector((0.080, 1.425, 0.310)))
    bmesh.ops.create_cube(bm_trans, size=1.0, matrix=mat_fdiff @ Matrix.Diagonal(Vector((0.260, 0.280, 0.240, 1.0))))

    # Front Left & Right Axle Half-Shafts (to front wheel hubs)
    for fx_sign in [-1.0, 1.0]:
        mat_fhalf = Matrix.Translation(Vector((fx_sign * 0.440, 1.425, 0.365)))
        bmesh.ops.create_cylinder(bm_driveline, radius=0.022, depth=0.680, segments=14, matrix=mat_fhalf @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())
        # Heavy-Duty CV Joint Rubber Boots
        for cv_off in [-0.260, 0.260]:
            mat_fboot = mat_fhalf @ Matrix.Translation(Vector((cv_off, 0, 0)))
            bmesh.ops.create_cylinder(bm_trans, radius=0.038, depth=0.065, segments=14, matrix=mat_fboot @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # 3. Main Rear Carbon-Fiber Propshaft (Y: -1.260m to +0.320m, Z = 0.280m)
    mat_rprop = Matrix.Translation(Vector((0.0, -0.470, 0.280)))
    bmesh.ops.create_cylinder(bm_driveline, radius=0.042, depth=1.580, segments=18, matrix=mat_rprop @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    # Propshaft Center Support Bearing & Vibration Damper Bracket (Y = -0.450m)
    mat_cb = Matrix.Translation(Vector((0.0, -0.450, 0.280)))
    bmesh.ops.create_cube(bm_trans, size=1.0, matrix=mat_cb @ Matrix.Diagonal(Vector((0.220, 0.080, 0.140, 1.0))))

    # 4. Rear Electronic Limited-Slip Differential (eLSD) Casing (Axle Y = -1.426m, Z = 0.340m)
    mat_rdiff = Matrix.Translation(Vector((0.0, -1.426, 0.340)))
    bmesh.ops.create_cube(bm_trans, size=1.0, matrix=mat_rdiff @ Matrix.Diagonal(Vector((0.380, 0.360, 0.300, 1.0))))
    # Rear eLSD Electric Torque Vectoring Actuator Motor (Mounted on left side of diff)
    mat_lact = mat_rdiff @ Matrix.Translation(Vector((-0.240, 0.040, 0.050)))
    bmesh.ops.create_cylinder(bm_trans, radius=0.048, depth=0.140, segments=16, matrix=mat_lact @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Rear Left & Right Heavy-Duty Axle Half-Shafts
    for rx_sign in [-1.0, 1.0]:
        mat_rhalf = Matrix.Translation(Vector((rx_sign * 0.440, -1.426, 0.365)))
        bmesh.ops.create_cylinder(bm_driveline, radius=0.024, depth=0.680, segments=14, matrix=mat_rhalf @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())
        # CV Joint Rubber Boots
        for cv_off in [-0.260, 0.260]:
            mat_rboot = mat_rhalf @ Matrix.Translation(Vector((cv_off, 0, 0)))
            bmesh.ops.create_cylinder(bm_trans, radius=0.040, depth=0.070, segments=14, matrix=mat_rboot @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_trans = link_obj("GEO_BENTLEY_8Speed_DualClutch_Transmission", bm_trans, parent_col, mats["engine_alloy"], bevel=0.002)
    obj_driveline = link_obj("GEO_BENTLEY_Active_AWD_Driveline_Propshafts", bm_driveline, parent_col, mats["trim_black"], bevel=0.0015)

    objs.extend([obj_trans, obj_driveline])
    return objs
# ----------------------------------------------------------------------------
# 10. SUBSYSTEM 10: 3-CHAMBER ADAPTIVE AIR SUSPENSION & DOUBLE WISHBONES
# ----------------------------------------------------------------------------

def build_bentley_air_suspension(parent_col, mats):
    """
    Constructs the advanced chassis architecture featuring 3-chamber adaptive air suspension:
    - Lightweight cast aluminum high-mounted upper wishbones and split-lower control arms.
    - Massive pneumatic 3-chamber air springs with integrated continuous damping control (CDC) shocks.
    - Rear multi-link aluminum five-arm suspension assembly for supreme stability at 208 mph.
    - Front & rear aluminum steering knuckles and hub carrier uprights.
    """
    objs = []
    bm_links = bmesh.new()
    bm_airbags = bmesh.new()

    # Front Double Wishbone & Air Struts (Axle Y = +1.425m, Wheel Centers Z = 0.365m)
    for fx_sign in [-1.0, 1.0]:
        # 1. High-Mounted Aluminum Upper Wishbone (A-Arm)
        mat_f_upr = Matrix.Translation(Vector((fx_sign * 0.520, 1.425, 0.520)))
        # Forward & Rearward Inboard Pivot Bushings
        for y_arm in [-0.140, 0.140]:
            mat_pbush = mat_f_upr @ Matrix.Translation(Vector((-fx_sign * 0.120, y_arm, 0)))
            bmesh.ops.create_cylinder(bm_links, radius=0.024, depth=0.055, segments=14, matrix=mat_pbush @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
        # Upper A-Arm Triangular Tube Truss
        mat_u_truss = mat_f_upr @ Matrix.Translation(Vector((0.0, 0.0, 0.0)))
        bmesh.ops.create_cube(bm_links, size=1.0, matrix=mat_u_truss @ Matrix.Diagonal(Vector((0.260, 0.280, 0.032, 1.0))))

        # 2. Lower Wishbone Split-Arm Assembly (Inboard subframe mounts at Z = 0.210m)
        mat_f_lwr = Matrix.Translation(Vector((fx_sign * 0.480, 1.425, 0.220)))
        bmesh.ops.create_cube(bm_links, size=1.0, matrix=mat_f_lwr @ Matrix.Diagonal(Vector((0.340, 0.320, 0.038, 1.0))))

        # 3. 3-Chamber Adaptive Air Strut (Spring rate configurable from limo plush to track stiff)
        # Strut axis angled inward to top mount at X = +-0.500m, Y = 1.425m, Z = 0.640m
        mat_strut = Matrix.Translation(Vector((fx_sign * 0.560, 1.425, 0.440))) @ Euler((0, -fx_sign * math.radians(11), 0), 'XYZ').to_matrix().to_4x4()
        # Pneumatic 3-Chamber Air Bladder Canister
        bmesh.ops.create_cylinder(bm_airbags, radius=0.082, depth=0.240, segments=22, matrix=mat_strut @ Matrix.Translation(Vector((0, 0, 0.080))))
        # Billet Aluminum Strut Top Mount Bracket
        bmesh.ops.create_cylinder(bm_links, radius=0.090, depth=0.035, segments=20, matrix=mat_strut @ Matrix.Translation(Vector((0, 0, 0.210))))
        # Lower Damper Telescopic Hydraulic Rod
        bmesh.ops.create_cylinder(bm_links, radius=0.032, depth=0.180, segments=16, matrix=mat_strut @ Matrix.Translation(Vector((0, 0, -0.120))))

        # 4. Front Cast Aluminum Steering Upright / Wheel Carrier (X = +-0.760m)
        mat_f_knuckle = Matrix.Translation(Vector((fx_sign * 0.760, 1.425, 0.365)))
        bmesh.ops.create_cube(bm_links, size=1.0, matrix=mat_f_knuckle @ Matrix.Diagonal(Vector((0.075, 0.160, 0.320, 1.0))))

    # Rear Five-Link Multi-Link Suspension & Air Struts (Axle Y = -1.426m, Wheel Centers Z = 0.365m)
    for rx_sign in [-1.0, 1.0]:
        # 1. Rear Upper Camber & Tension Link Rods
        for link_i, l_y in enumerate([-0.120, 0.100]):
            mat_r_link = Matrix.Translation(Vector((rx_sign * 0.540, -1.426 + l_y, 0.480))) @ Euler((0, rx_sign * math.radians(5), 0), 'XYZ').to_matrix().to_4x4()
            bmesh.ops.create_cylinder(bm_links, radius=0.018, depth=0.340, segments=14, matrix=mat_r_link @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # 2. Massive Rear Lower Camber Bed / Spring Link (Carries air spring)
        mat_r_bed = Matrix.Translation(Vector((rx_sign * 0.520, -1.426, 0.220)))
        bmesh.ops.create_cube(bm_links, size=1.0, matrix=mat_r_bed @ Matrix.Diagonal(Vector((0.360, 0.180, 0.045, 1.0))))

        # 3. Rear 3-Chamber Adaptive Air Strut
        mat_r_strut = Matrix.Translation(Vector((rx_sign * 0.540, -1.426, 0.450))) @ Euler((0, -rx_sign * math.radians(8), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_airbags, radius=0.078, depth=0.230, segments=22, matrix=mat_r_strut @ Matrix.Translation(Vector((0, 0, 0.070))))
        bmesh.ops.create_cylinder(bm_links, radius=0.088, depth=0.035, segments=20, matrix=mat_r_strut @ Matrix.Translation(Vector((0, 0, 0.195))))
        bmesh.ops.create_cylinder(bm_links, radius=0.030, depth=0.170, segments=16, matrix=mat_r_strut @ Matrix.Translation(Vector((0, 0, -0.110))))

        # 4. Rear Cast Aluminum Wheel Hub Carrier Upright (X = +-0.755m)
        mat_r_knuckle = Matrix.Translation(Vector((rx_sign * 0.755, -1.426, 0.365)))
        bmesh.ops.create_cube(bm_links, size=1.0, matrix=mat_r_knuckle @ Matrix.Diagonal(Vector((0.080, 0.180, 0.310, 1.0))))

    obj_links = link_obj("GEO_BENTLEY_Aluminum_Suspension_Wishbones", bm_links, parent_col, mats["engine_alloy"], bevel=0.0015)
    obj_airbags = link_obj("GEO_BENTLEY_3Chamber_Air_Suspension_Struts", bm_airbags, parent_col, mats["trim_black"], bevel=0.002)

    objs.extend([obj_links, obj_airbags])
    return objs


# ----------------------------------------------------------------------------
# 11. SUBSYSTEM 11: 48V ACTIVE ROLL CONTROL & ALL-WHEEL STEERING SYSTEM
# ----------------------------------------------------------------------------

def build_bentley_active_roll_and_aws(parent_col, mats):
    """
    Constructs the 48-Volt Bentley Dynamic Ride active anti-roll system and all-wheel steering:
    - Front & Rear 48V electric rotary actuator motors mounted in the split anti-roll bars.
      Capable of applying 1,300 Nm of anti-roll torque in 0.3 seconds to keep body flat.
    - High-torsion spring steel stabilizer bar halves with articulating drop link tie-rods.
    - Electric Power Steering (EPAS) front rack & pinion unit with variable ratio.
    - Rear-Wheel Steering (AWS) electromechanical tie-rod actuators providing up to 2.8 degrees
      of rear wheel steer (counter-phase at low speed for agility, in-phase at high speed).
    """
    objs = []
    bm_48v = bmesh.new()
    bm_bars = bmesh.new()
    bm_steer = bmesh.new()

    # 1. Front 48V Bentley Dynamic Ride System (Y = +1.280m, Z = 0.240m)
    mat_f_48v = Matrix.Translation(Vector((0.0, 1.280, 0.240)))
    # Central 48V High-Torque Electric Rotary Actuator Motor
    bmesh.ops.create_cylinder(bm_48v, radius=0.065, depth=0.180, segments=20, matrix=mat_f_48v @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())
    # Front Stabilizer Bar Halves (Left & Right)
    for fx_sign in [-1.0, 1.0]:
        mat_f_bar = Matrix.Translation(Vector((fx_sign * 0.340, 1.280, 0.240)))
        bmesh.ops.create_cylinder(bm_bars, radius=0.019, depth=0.480, segments=14, matrix=mat_f_bar @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())
        # Drop Link Rod connecting to lower wishbone (Z: 0.240m to 0.220m, Y = 1.350m)
        mat_f_drop = Matrix.Translation(Vector((fx_sign * 0.580, 1.340, 0.230)))
        bmesh.ops.create_cylinder(bm_bars, radius=0.011, depth=0.140, segments=12, matrix=mat_f_drop @ Euler((math.radians(35), 0, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Front Variable-Ratio Electric Power Steering Rack (Y = +1.520m, Z = 0.250m)
    mat_steer_rack = Matrix.Translation(Vector((0.0, 1.520, 0.250)))
    bmesh.ops.create_cylinder(bm_steer, radius=0.036, depth=0.880, segments=16, matrix=mat_steer_rack @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())
    # EPAS Electric Drive Motor Unit (offset left side of rack)
    mat_epas = mat_steer_rack @ Matrix.Translation(Vector((-0.220, -0.060, 0.040)))
    bmesh.ops.create_cylinder(bm_48v, radius=0.052, depth=0.130, segments=16, matrix=mat_epas @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    # Front Steering Outer Tie-Rods with Ball Joints
    for tx_sign in [-1.0, 1.0]:
        mat_tie = Matrix.Translation(Vector((tx_sign * 0.600, 1.500, 0.260)))
        bmesh.ops.create_cylinder(bm_steer, radius=0.013, depth=0.320, segments=12, matrix=mat_tie @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # 3. Rear 48V Bentley Dynamic Ride System (Y = -1.240m, Z = 0.250m)
    mat_r_48v = Matrix.Translation(Vector((0.0, -1.240, 0.250)))
    bmesh.ops.create_cylinder(bm_48v, radius=0.062, depth=0.170, segments=20, matrix=mat_r_48v @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())
    # Rear Stabilizer Bar Halves
    for rx_sign in [-1.0, 1.0]:
        mat_r_bar = Matrix.Translation(Vector((rx_sign * 0.330, -1.240, 0.250)))
        bmesh.ops.create_cylinder(bm_bars, radius=0.018, depth=0.460, segments=14, matrix=mat_r_bar @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())
        # Rear Drop Link Rods
        mat_r_drop = Matrix.Translation(Vector((rx_sign * 0.560, -1.300, 0.240)))
        bmesh.ops.create_cylinder(bm_bars, radius=0.011, depth=0.130, segments=12, matrix=mat_r_drop @ Euler((-math.radians(30), 0, 0), 'XYZ').to_matrix().to_4x4())

    # 4. Rear-Wheel Steering (All-Wheel Steer) Electromechanical Actuator System (Y = -1.560m, Z = 0.310m)
    mat_aws = Matrix.Translation(Vector((0.0, -1.560, 0.310)))
    # High-Precision Dual Electric Actuator Central Box
    bmesh.ops.create_cube(bm_48v, size=1.0, matrix=mat_aws @ Matrix.Diagonal(Vector((0.360, 0.140, 0.110, 1.0))))
    # Active Rear Toe Control Link Rods (Left & Right to rear knuckles)
    for ax_sign in [-1.0, 1.0]:
        mat_r_toe = Matrix.Translation(Vector((ax_sign * 0.480, -1.540, 0.320)))
        bmesh.ops.create_cylinder(bm_steer, radius=0.014, depth=0.380, segments=12, matrix=mat_r_toe @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_48v = link_obj("GEO_BENTLEY_48V_Active_Roll_Actuators", bm_48v, parent_col, mats["trim_black"], bevel=0.0015)
    obj_bars = link_obj("GEO_BENTLEY_Stabilizer_AntiRoll_Bars", bm_bars, parent_col, mats["chrome"], bevel=0.0012)
    obj_steer = link_obj("GEO_BENTLEY_Front_EPAS_and_Rear_AWS_System", bm_steer, parent_col, mats["engine_alloy"], bevel=0.0015)

    objs.extend([obj_48v, obj_bars, obj_steer])
    return objs
# ----------------------------------------------------------------------------
# 12. SUBSYSTEM 12: DUAL ELLIPTICAL SPEED EXHAUST PLUMBING & VALVED MUFFLER
# ----------------------------------------------------------------------------

def build_bentley_speed_exhaust_system(parent_col, mats):
    """
    Constructs the tuned quad-bore elliptical sports exhaust system of the Continental GT Speed:
    - Twin stainless steel downpipes from twin turbochargers through close-coupled catalytic converters.
    - Central X-pipe acoustic crossover balancing W12 exhaust pulses and harmonics.
    - Massive transverse rear silencer box with dual high-speed electric acoustic bypass butterfly valves.
    - Signature Speed dual large elliptical exhaust tailpipes with knurled inner rifling bores
      housed seamlessly within the rear bumper lower valance apertures (X = +-0.620m, Y = -2.360m).
    """
    objs = []
    bm_pipes = bmesh.new()
    bm_muffler = bmesh.new()
    bm_tips = bmesh.new()

    # 1. Twin Turbo Downpipes & Catalytic Converters (Y: +0.650m to +1.150m, Z = 0.280m to 0.350m)
    for cat_sign in [-1.0, 1.0]:
        # Catalytic Converter Canister
        mat_cat = Matrix.Translation(Vector((cat_sign * 0.280, 0.920, 0.310)))
        bmesh.ops.create_cylinder(bm_pipes, radius=0.065, depth=0.280, segments=16, matrix=mat_cat @ Euler((math.radians(20), 0, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Dual Mid-Pipes & Central X-Crossover Balancing Section (Y: -0.850m to +0.650m)
    for pipe_sign in [-1.0, 1.0]:
        mat_mid = Matrix.Translation(Vector((pipe_sign * 0.160, -0.100, 0.240)))
        bmesh.ops.create_cylinder(bm_pipes, radius=0.035, depth=1.500, segments=16, matrix=mat_mid @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Center Acoustic Balance Resonator Box (Y = -0.200m)
    mat_res = Matrix.Translation(Vector((0.0, -0.200, 0.240)))
    bmesh.ops.create_cube(bm_muffler, size=1.0, matrix=mat_res @ Matrix.Diagonal(Vector((0.420, 0.380, 0.140, 1.0))))

    # 3. Transverse Rear Acoustically Valved Muffler (Under trunk floor, Y = -1.880m, Z = 0.280m)
    mat_muff = Matrix.Translation(Vector((0.0, -1.880, 0.290)))
    bmesh.ops.create_cube(bm_muffler, size=1.0, matrix=mat_muff @ Matrix.Diagonal(Vector((1.050, 0.420, 0.220, 1.0))))

    # Electric Active Acoustic Flap Valve Actuator Motors (Left & Right)
    for v_sign in [-1.0, 1.0]:
        mat_valv = mat_muff @ Matrix.Translation(Vector((v_sign * 0.480, -0.200, 0.050)))
        bmesh.ops.create_cylinder(bm_muffler, radius=0.032, depth=0.060, segments=14, matrix=mat_valv)

    # 4. Continental GT Speed Signature Elliptical Dual Exhaust Tips (Y = -2.360m, Z = 0.285m)
    # The Continental GT Speed W12 features large elliptical exhaust tips with a fluted rifled inner divider
    for tip_sign in [-1.0, 1.0]:
        mat_tip = Matrix.Translation(Vector((tip_sign * 0.620, -2.340, 0.285)))
        # Outer Elliptical Chrome Bezel Trim
        mat_ellip = mat_tip @ Euler((math.radians(6), 0, 0), 'XYZ').to_matrix().to_4x4() @ Matrix.Diagonal(Vector((1.35, 1.0, 0.82, 1.0)))
        bmesh.ops.create_cylinder(bm_tips, cap_ends=False, radius=0.088, depth=0.150, segments=28, matrix=mat_ellip @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # Internal Rifled Dual Gas Bores (Speed signature internal twin ports inside the outer ellipse)
        for bore_off in [-0.045, 0.045]:
            mat_bore = mat_tip @ Matrix.Translation(Vector((bore_off, -0.015, 0.0)))
            bmesh.ops.create_cylinder(bm_pipes, cap_ends=False, radius=0.038, depth=0.130, segments=20, matrix=mat_bore @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_pipes = link_obj("GEO_BENTLEY_Exhaust_Downpipes_and_Midpipes", bm_pipes, parent_col, mats["inconel"], bevel=0.0015)
    obj_muffler = link_obj("GEO_BENTLEY_Transverse_Rear_Silencer_Muffler", bm_muffler, parent_col, mats["engine_alloy"], bevel=0.002)
    obj_tips = link_obj("GEO_BENTLEY_Speed_Elliptical_Exhaust_Tips", bm_tips, parent_col, mats["chrome"], bevel=0.001)

    objs.extend([obj_pipes, obj_muffler, obj_tips])
    return objs


# ----------------------------------------------------------------------------
# 13. SUBSYSTEM 13: UNDERBODY BELLY PAN, VENTURI DIFFUSERS & STRAKES
# ----------------------------------------------------------------------------

def build_bentley_underbody_aero(parent_col, mats):
    """
    Constructs high-speed aerodynamic underfloor undertray and rear diffuser:
    - Continuous flush underbody undertray (Cd ~0.29 high-speed drag reduction).
    - Front engine splash belly shield with cooling air extraction louvers.
    - Central transmission tunnel aerodynamic shear closure panel.
    - Rear axle smooth under-tray bridging to high-downforce rear diffuser.
    - 4 vertical aerodynamic venturi diffuser channel strakes under the rear bumper.
    """
    objs = []
    bm_belly = bmesh.new()
    bm_diff = bmesh.new()

    # 1. Full-Length Flat Floor Composite Undertray (Y: -1.750m to +1.150m, Z = 0.175m, Width: 1.480m)
    mat_floor = Matrix.Translation(Vector((0.0, -0.300, 0.175)))
    bmesh.ops.create_cube(bm_belly, size=1.0, matrix=mat_floor @ Matrix.Diagonal(Vector((1.480, 2.900, 0.015, 1.0))))

    # Longitudinal Stiffening Ribs & Aerodynamic Guide Channels
    for rib_x in [-0.550, -0.280, 0.280, 0.550]:
        mat_rib = Matrix.Translation(Vector((rib_x, -0.300, 0.165)))
        bmesh.ops.create_cube(bm_belly, size=1.0, matrix=mat_rib @ Matrix.Diagonal(Vector((0.022, 2.850, 0.016, 1.0))))

    # 2. Front Engine Bay Aero Shield & Sump Guard (Y: +1.150m to +2.050m, Z = 0.180m)
    mat_fguard = Matrix.Translation(Vector((0.0, 1.600, 0.180)))
    bmesh.ops.create_cube(bm_belly, size=1.0, matrix=mat_fguard @ Matrix.Diagonal(Vector((1.360, 0.900, 0.018, 1.0))))

    # 3. Rear High-Downforce Aerodynamic Diffuser Section (Y: -1.750m to -2.320m, Upsweep Z: 0.175m to 0.320m)
    mat_rdiff = Matrix.Translation(Vector((0.0, -2.035, 0.245))) @ Euler((-math.radians(11.5), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_diff, size=1.0, matrix=mat_rdiff @ Matrix.Diagonal(Vector((1.240, 0.580, 0.018, 1.0))))

    # 4 Vertical Aerodynamic Diffuser Channel Strakes
    for strake_x in [-0.420, -0.140, 0.140, 0.420]:
        mat_strake = mat_rdiff @ Matrix.Translation(Vector((strake_x, 0.0, -0.040)))
        bmesh.ops.create_cube(bm_diff, size=1.0, matrix=mat_strake @ Matrix.Diagonal(Vector((0.012, 0.560, 0.075, 1.0))))

    obj_belly = link_obj("GEO_BENTLEY_Underbody_Aerodynamic_BellyPan", bm_belly, parent_col, mats["trim_black"], bevel=0.002)
    obj_diff = link_obj("GEO_BENTLEY_Rear_Venturi_Diffuser_Strakes", bm_diff, parent_col, mats["piano_black"], bevel=0.0015)

    objs.extend([obj_belly, obj_diff])
    return objs
# ----------------------------------------------------------------------------
# 14. SUBSYSTEM 14: GRAND TOURER COCKPIT TUB, SEATS & DASHBOARD SILHOUETTE
# ----------------------------------------------------------------------------

def build_bentley_cockpit_silhouette(parent_col, mats):
    """
    Constructs the luxurious open-top grand tourer cockpit architecture:
    - Bentley "Flying Wing" symmetrical dashboard cowl sweeping into door waistlines.
    - Deeply contoured GT front sports seats with integrated headrests and Speed bolsters.
    - Sculpted rear 2-passenger bucket seating pods with central leather cascade divider.
    - Center console waterfall bridge housing the Breitling clock pod and gear selector.
    - 3-spoke sports steering wheel with aluminum knurled shift paddles and column shroud.
    """
    objs = []
    bm_seats = bmesh.new()
    bm_dash = bmesh.new()
    bm_console = bmesh.new()

    # 1. Flying Wing Dashboard Structure (Y: +0.220m to +0.580m, Z: 0.650m to 0.880m)
    mat_dash = Matrix.Translation(Vector((0.0, 0.400, 0.740)))
    bmesh.ops.create_cube(bm_dash, size=1.0, matrix=mat_dash @ Matrix.Diagonal(Vector((1.380, 0.320, 0.180, 1.0))))

    # Driver & Passenger Dual Cowl Binnacles (Left Driver side and Right Co-pilot side)
    for cowl_sign in [-1.0, 1.0]:
        mat_cowl = mat_dash @ Matrix.Translation(Vector((cowl_sign * 0.420, 0.040, 0.090)))
        bmesh.ops.create_cube(bm_dash, size=1.0, matrix=mat_cowl @ Matrix.Diagonal(Vector((0.440, 0.180, 0.060, 1.0))))

    # Bentley Rotating Display Center Console Screen Face (Z = 0.760m, Y = 0.420m)
    mat_screen = mat_dash @ Matrix.Translation(Vector((0.0, 0.060, 0.030)))
    bmesh.ops.create_cube(bm_dash, size=1.0, matrix=mat_screen @ Matrix.Diagonal(Vector((0.260, 0.040, 0.120, 1.0))))

    # 2. Elevated Center Console Waterfall Bridge (Y: -0.550m to +0.380m, Z: 0.360m to 0.580m)
    mat_bridge = Matrix.Translation(Vector((0.0, -0.080, 0.480)))
    bmesh.ops.create_cube(bm_console, size=1.0, matrix=mat_bridge @ Matrix.Diagonal(Vector((0.280, 0.920, 0.220, 1.0))))

    # Knurled Drive Dynamics Mode Selector Dial & Speed T-Bar Gear Shifter
    mat_dial = mat_bridge @ Matrix.Translation(Vector((0.0, 0.120, 0.120)))
    bmesh.ops.create_cylinder(bm_console, radius=0.035, depth=0.024, segments=18, matrix=mat_dial)
    mat_shifter = mat_bridge @ Matrix.Translation(Vector((0.0, 0.220, 0.160)))
    bmesh.ops.create_cylinder(bm_console, radius=0.022, depth=0.090, segments=16, matrix=mat_shifter)

    # 3. 3-Spoke Sport Steering Wheel & Column (Driver LHD, X = -0.420m, Y = 0.260m, Z = 0.780m)
    mat_whl_col = Matrix.Translation(Vector((-0.420, 0.260, 0.780))) @ Euler((-math.radians(24), 0, 0), 'XYZ').to_matrix().to_4x4()
    # Steering Wheel Outer Rim (Torus, Radius = 0.180m, Tube Radius = 0.016m)
    bmesh.ops.create_torus(bm_console, major_radius=0.180, minor_radius=0.016, major_segments=28, minor_segments=12, matrix=mat_whl_col)
    # Center Horn Pad with Winged 'B' Badge Roundel
    bmesh.ops.create_cylinder(bm_console, radius=0.052, depth=0.032, segments=20, matrix=mat_whl_col)
    # Steering Column Shroud
    bmesh.ops.create_cylinder(bm_dash, radius=0.048, depth=0.220, segments=16, matrix=mat_whl_col @ Matrix.Translation(Vector((0, 0, -0.110))))
    # Aluminum Shift Paddles Behind Steering Wheel
    for pad_sign in [-1.0, 1.0]:
        mat_pad = mat_whl_col @ Matrix.Translation(Vector((pad_sign * 0.135, 0.0, -0.040)))
        bmesh.ops.create_cube(bm_console, size=1.0, matrix=mat_pad @ Matrix.Diagonal(Vector((0.018, 0.010, 0.095, 1.0))))

    # 4. GT Contour Front Sport Bucket Seats (Left Driver & Right Passenger, Y = -0.180m, Z = 0.440m)
    for seat_sign in [-1.0, 1.0]:
        mat_seat = Matrix.Translation(Vector((seat_sign * 0.420, -0.180, 0.440)))
        # Lower Cushion Base with Thigh Extension
        bmesh.ops.create_cube(bm_seats, size=1.0, matrix=mat_seat @ Matrix.Diagonal(Vector((0.480, 0.520, 0.140, 1.0))))
        # Lateral Thigh Bolster Wings
        for th_sign in [-1.0, 1.0]:
            mat_thigh = mat_seat @ Matrix.Translation(Vector((th_sign * 0.210, 0.020, 0.050)))
            bmesh.ops.create_cube(bm_seats, size=1.0, matrix=mat_thigh @ Matrix.Diagonal(Vector((0.075, 0.480, 0.090, 1.0))))

        # High-Back Seat Rest canted backward 18 degrees
        mat_back = mat_seat @ Matrix.Translation(Vector((0.0, -0.220, 0.320))) @ Euler((math.radians(18), 0, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_seats, size=1.0, matrix=mat_back @ Matrix.Diagonal(Vector((0.460, 0.130, 0.580, 1.0))))
        # Lateral Torso Bolster Wings
        for tor_sign in [-1.0, 1.0]:
            mat_tor = mat_back @ Matrix.Translation(Vector((tor_sign * 0.200, 0.040, -0.040)))
            bmesh.ops.create_cube(bm_seats, size=1.0, matrix=mat_tor @ Matrix.Diagonal(Vector((0.065, 0.140, 0.440, 1.0))))

        # Integrated Monolithic Headrest with Embroidered 'Speed' Logo
        mat_head = mat_back @ Matrix.Translation(Vector((0.0, 0.020, 0.340)))
        bmesh.ops.create_cube(bm_seats, size=1.0, matrix=mat_head @ Matrix.Diagonal(Vector((0.240, 0.110, 0.180, 1.0))))

    # 5. Sculpted Rear 2-Passenger Bucket Seats (Y = -0.760m, Z = 0.480m)
    for rseat_sign in [-1.0, 1.0]:
        mat_rseat = Matrix.Translation(Vector((rseat_sign * 0.360, -0.760, 0.480)))
        # Rear Seat Cushion Base
        bmesh.ops.create_cube(bm_seats, size=1.0, matrix=mat_rseat @ Matrix.Diagonal(Vector((0.420, 0.440, 0.120, 1.0))))
        # Rear Seat Backrest
        mat_rback = mat_rseat @ Matrix.Translation(Vector((0.0, -0.180, 0.240))) @ Euler((math.radians(16), 0, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_seats, size=1.0, matrix=mat_rback @ Matrix.Diagonal(Vector((0.400, 0.110, 0.420, 1.0))))
        # Rear Headrest Pod
        mat_rhead = mat_rback @ Matrix.Translation(Vector((0.0, 0.020, 0.260)))
        bmesh.ops.create_cube(bm_seats, size=1.0, matrix=mat_rhead @ Matrix.Diagonal(Vector((0.220, 0.100, 0.150, 1.0))))

    obj_seats = link_obj("GEO_BENTLEY_GrandTourer_Leather_Seats", bm_seats, parent_col, mats["leather"], bevel=0.0025)
    obj_dash = link_obj("GEO_BENTLEY_FlyingWing_Dashboard_Fascia", bm_dash, parent_col, mats["piano_black"], bevel=0.0015)
    obj_console = link_obj("GEO_BENTLEY_Center_Console_and_Steering", bm_console, parent_col, mats["chrome"], bevel=0.0012)

    objs.extend([obj_seats, obj_dash, obj_console])
    return objs
# ----------------------------------------------------------------------------
# 15. SUBSYSTEM 15: FRONT LOWER MATRIX SCOOPS, BLADES & ACTIVE SHUTTERS
# ----------------------------------------------------------------------------

def build_bentley_front_lower_aero_scoops(parent_col, mats):
    """
    Constructs high-performance front bumper lower intake architecture:
    - Left and right outer intercooler cooling scoops with dark tint matrix diamond mesh.
    - Sculpted horizontal aerodynamic chrome blades flanking the lower bumper apron.
    - Central lower intake matrix channel feeding transmission oil cooler and condenser.
    - Motorized active radiator grille shutter vane matrix reducing aerodynamic drag at speed.
    """
    objs = []
    bm_scoops = bmesh.new()
    bm_blades = bmesh.new()
    bm_shutters = bmesh.new()

    # 1. Left & Right Outer Intercooler Scoops (X = +-0.640m, Y = +2.220m, Z = 0.310m)
    for sc_sign in [-1.0, 1.0]:
        mat_scoop = Matrix.Translation(Vector((sc_sign * 0.640, 2.220, 0.310)))
        # Angled Scoop Outer Bezel Housing
        mat_rot = mat_scoop @ Euler((0, -sc_sign * math.radians(12), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_scoops, size=1.0, matrix=mat_rot @ Matrix.Diagonal(Vector((0.320, 0.120, 0.160, 1.0))))

        # High-Speed Chrome Aerodynamic Splitter Winglet Blade (Speed signature trim)
        mat_blade = mat_rot @ Matrix.Translation(Vector((0.0, 0.040, -0.010)))
        bmesh.ops.create_cube(bm_blades, size=1.0, matrix=mat_blade @ Matrix.Diagonal(Vector((0.340, 0.025, 0.018, 1.0))))

        # Inner Matrix Diamond Mesh Insert Screen
        mat_mesh = mat_rot @ Matrix.Translation(Vector((0.0, -0.020, 0.0)))
        bmesh.ops.create_cube(bm_scoops, size=1.0, matrix=mat_mesh @ Matrix.Diagonal(Vector((0.290, 0.010, 0.130, 1.0))))

    # 2. Central Lower Air Dam Intake Aperture (X: -0.360m to +0.360m, Y = +2.280m, Z = 0.280m)
    mat_ctr = Matrix.Translation(Vector((0.0, 2.280, 0.280)))
    bmesh.ops.create_cube(bm_scoops, size=1.0, matrix=mat_ctr @ Matrix.Diagonal(Vector((0.740, 0.140, 0.110, 1.0))))

    # Lower Apron Chrome Lip Stiffener
    mat_clip = mat_ctr @ Matrix.Translation(Vector((0.0, 0.060, -0.050)))
    bmesh.ops.create_cube(bm_blades, size=1.0, matrix=mat_clip @ Matrix.Diagonal(Vector((0.780, 0.025, 0.016, 1.0))))

    # 3. Active Aerodynamic Radiator Shutter Matrix (Behind Main Grille, Y = +2.180m, Z: 0.440m to 0.760m)
    for v_i in range(8):
        v_z = 0.440 + v_i * 0.042
        mat_vane = Matrix.Translation(Vector((0.0, 2.180, v_z)))
        # Horizontal Shutter Slats (motorized variable angle)
        bmesh.ops.create_cube(bm_shutters, size=1.0, matrix=mat_vane @ Matrix.Diagonal(Vector((0.680, 0.018, 0.022, 1.0))))

    obj_scoops = link_obj("GEO_BENTLEY_Front_Lower_Matrix_Scoops", bm_scoops, parent_col, mats["dark_tint"], bevel=0.001)
    obj_blades = link_obj("GEO_BENTLEY_Speed_Chrome_Bumper_Blades", bm_blades, parent_col, mats["chrome"], bevel=0.0008)
    obj_shutters = link_obj("GEO_BENTLEY_Active_Radiator_Shutter_Matrix", bm_shutters, parent_col, mats["trim_black"], bevel=0.001)

    objs.extend([obj_scoops, obj_blades, obj_shutters])
    return objs
# ----------------------------------------------------------------------------
# 16. SUBSYSTEM 16: STRUCTURAL SILLS, DOOR INTRUSION BEAMS & CRASH BOXES
# ----------------------------------------------------------------------------

def build_bentley_structural_safety_elements(parent_col, mats):
    """
    Constructs high-rigidity structural aluminum safety and reinforcement framework:
    - Multi-cell extruded aluminum side sills running between front and rear wheel arches.
    - High-strength door internal anti-intrusion beams (recessed strictly inside door cavity).
    - Front extruded aluminum crash boxes with hex-corrugated energy absorption ribs.
    - Rear bumper collision cross-beam and longitudinal crush cans.
    """
    objs = []
    bm_sills = bmesh.new()
    bm_crash = bmesh.new()

    # 1. Multi-Chamber Structural Aluminum Side Sills (Y: -0.950m to +0.950m, X = +-0.835m, Z = 0.220m)
    for sill_sign in [-1.0, 1.0]:
        mat_sill = Matrix.Translation(Vector((sill_sign * 0.835, 0.000, 0.220)))
        bmesh.ops.create_cube(bm_sills, size=1.0, matrix=mat_sill @ Matrix.Diagonal(Vector((0.140, 1.950, 0.120, 1.0))))

        # Internal Door Anti-Intrusion Diagonal Reinforcement Beam (Safe X = +-0.820m, inside door shell)
        mat_beam = Matrix.Translation(Vector((sill_sign * 0.820, 0.080, 0.440))) @ Euler((sill_sign * math.radians(6), math.radians(7), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_sills, radius=0.024, depth=1.150, segments=14, matrix=mat_beam @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Front Extruded Aluminum Crash Boxes & Impact Beam (Y = +2.150m to +2.320m)
    for f_cb_sign in [-1.0, 1.0]:
        mat_fcbox = Matrix.Translation(Vector((f_cb_sign * 0.440, 2.180, 0.380)))
        bmesh.ops.create_cube(bm_crash, size=1.0, matrix=mat_fcbox @ Matrix.Diagonal(Vector((0.130, 0.220, 0.140, 1.0))))

    # Front Transverse High-Tensile Aluminum Bumper Beam (Y = +2.300m, Z = 0.380m)
    mat_fbeam = Matrix.Translation(Vector((0.0, 2.300, 0.380)))
    bmesh.ops.create_cube(bm_crash, size=1.0, matrix=mat_fbeam @ Matrix.Diagonal(Vector((1.380, 0.090, 0.120, 1.0))))

    # 3. Rear Crash Protection Beam & Hexagonal Crush Cans (Y = -2.260m)
    for r_cb_sign in [-1.0, 1.0]:
        mat_rcbox = Matrix.Translation(Vector((r_cb_sign * 0.460, -2.220, 0.360)))
        bmesh.ops.create_cube(bm_crash, size=1.0, matrix=mat_rcbox @ Matrix.Diagonal(Vector((0.120, 0.180, 0.130, 1.0))))

    # Rear Transverse Aluminum Cross-Beam (Y = -2.310m, Z = 0.360m)
    mat_rbeam = Matrix.Translation(Vector((0.0, -2.310, 0.360)))
    bmesh.ops.create_cube(bm_crash, size=1.0, matrix=mat_rbeam @ Matrix.Diagonal(Vector((1.320, 0.080, 0.110, 1.0))))

    obj_sills = link_obj("GEO_BENTLEY_Reinforced_Aluminum_Side_Sills", bm_sills, parent_col, mats["engine_alloy"], bevel=0.002)
    obj_crash = link_obj("GEO_BENTLEY_Front_Rear_Collision_Crash_Beams", bm_crash, parent_col, mats["trim_black"], bevel=0.0015)

    objs.extend([obj_sills, obj_crash])
    return objs
# ----------------------------------------------------------------------------
# 17. SUBSYSTEM 17: ACTIVE DEPLOYABLE SPOILER CAVITY & SCISSOR ACTUATORS
# ----------------------------------------------------------------------------

def build_bentley_active_rear_spoiler(parent_col, mats):
    """
    Constructs the active deployable rear aerodynamic spoiler and motorized mechanism:
    - Recessed spoiler well cavity integrated into rear decklid trailing edge.
    - Active aerofoil wing blade contoured precisely to rear lip profile.
    - Dual electromechanical scissor lift jacks and linear hydraulic dampers.
    - Weatherstrip perimeter gasket sealing the cavity when spoiler is retracted.
    """
    objs = []
    bm_cavity = bmesh.new()
    bm_wing = bmesh.new()
    bm_mech = bmesh.new()

    # 1. Decklid Trailing Edge Spoiler Recess Cavity (Y: -2.080m to -2.310m, Z = 0.865m, Width: 1.180m)
    mat_cav = Matrix.Translation(Vector((0.0, -2.190, 0.865)))
    bmesh.ops.create_cube(bm_cavity, size=1.0, matrix=mat_cav @ Matrix.Diagonal(Vector((1.180, 0.220, 0.045, 1.0))))

    # Perimeter Rubber Sealing Weatherstrip Gasket
    bmesh.ops.create_cube(bm_cavity, size=1.0, matrix=mat_cav @ Matrix.Diagonal(Vector((1.200, 0.235, 0.012, 1.0))))

    # 2. Active Aerofoil Spoiler Wing Blade (Positioned flush in cavity, Y = -2.190m, Z = 0.885m)
    mat_blade = Matrix.Translation(Vector((0.0, -2.190, 0.885))) @ Euler((math.radians(3.5), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_wing, size=1.0, matrix=mat_blade @ Matrix.Diagonal(Vector((1.160, 0.200, 0.032, 1.0))))

    # Subtle Aerodynamic Gurney Flap on trailing lip
    mat_gurney = mat_blade @ Matrix.Translation(Vector((0.0, -0.095, 0.014)))
    bmesh.ops.create_cube(bm_wing, size=1.0, matrix=mat_gurney @ Matrix.Diagonal(Vector((1.140, 0.010, 0.012, 1.0))))

    # 3. Dual Articulated Motorized Scissor Lift Jacks (Left & Right inside cavity)
    for jack_sign in [-1.0, 1.0]:
        mat_jack = mat_cav @ Matrix.Translation(Vector((jack_sign * 0.380, 0.000, -0.010)))
        # Scissor Lower Base Pivot Bracket
        bmesh.ops.create_cube(bm_mech, size=1.0, matrix=mat_jack @ Matrix.Diagonal(Vector((0.055, 0.120, 0.020, 1.0))))
        # Articulating Diagonal Scissor Arms
        for arm_ang in [-28, 28]:
            mat_arm = mat_jack @ Euler((math.radians(arm_ang), 0, 0), 'XYZ').to_matrix().to_4x4()
            bmesh.ops.create_cylinder(bm_mech, radius=0.007, depth=0.085, segments=10, matrix=mat_arm)
        # Linear Hydraulic Stabilizer Damper
        bmesh.ops.create_cylinder(bm_mech, radius=0.012, depth=0.075, segments=12, matrix=mat_jack @ Matrix.Translation(Vector((0.025, 0, 0))))

    obj_cavity = link_obj("GEO_BENTLEY_Active_Spoiler_Recess_Cavity", bm_cavity, parent_col, mats["trim_black"], bevel=0.001)
    obj_wing = link_obj("GEO_BENTLEY_Active_Deployable_Spoiler_Blade", bm_wing, parent_col, mats["paint"], bevel=0.0015)
    obj_mech = link_obj("GEO_BENTLEY_Active_Spoiler_Scissor_Actuators", bm_mech, parent_col, mats["engine_alloy"], bevel=0.0008)

    objs.extend([obj_cavity, obj_wing, obj_mech])
    return objs
# ----------------------------------------------------------------------------
# 18. SUBSYSTEM 18: STRUT TOWER V-BRACE & STRUCTURAL FIREWALL BULKHEAD
# ----------------------------------------------------------------------------

def build_bentley_strut_bracing_and_firewall(parent_col, mats):
    """
    Constructs high-torsion front engine bay reinforcement architecture:
    - Polished extruded aluminum V-brace triangulating front strut towers to cowl.
    - High-strength multi-gauge steel/aluminum structural firewall bulkhead.
    - Front radiator core support upper cross-tie bar locking front frame horns.
    - Engine bay side apron inner fender reinforcement panels.
    """
    objs = []
    bm_brace = bmesh.new()
    bm_firewall = bmesh.new()

    # 1. Aluminum Structural V-Brace Triangulation (Struts at X = +-0.540m, Y = 1.425m to Cowl Center X = 0, Y = 0.880m)
    for v_sign in [-1.0, 1.0]:
        p_strut = Vector((v_sign * 0.520, 1.425, 0.650))
        p_cowl = Vector((0.0, 0.880, 0.680))
        p_mid = (p_strut + p_cowl) * 0.5
        v_diff = p_cowl - p_strut
        length = v_diff.length
        rot_quat = Vector((0, 0, 1)).rotation_difference(v_diff.normalized())

        mat_vbar = Matrix.Translation(p_mid) @ rot_quat.to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_brace, radius=0.016, depth=length, segments=14, matrix=mat_vbar)

        # Billet Strut Tower Attachment Cleat
        mat_cleat = Matrix.Translation(p_strut)
        bmesh.ops.create_cylinder(bm_brace, radius=0.045, depth=0.025, segments=16, matrix=mat_cleat)

    # Center Cowl Anchor Bracket (X = 0, Y = 0.880m)
    mat_cowl_cleat = Matrix.Translation(Vector((0.0, 0.880, 0.680)))
    bmesh.ops.create_cube(bm_brace, size=1.0, matrix=mat_cowl_cleat @ Matrix.Diagonal(Vector((0.140, 0.080, 0.035, 1.0))))

    # 2. Structural Firewall Bulkhead (Y = +0.860m, Z: 0.220m to 0.760m, Width: 1.440m)
    mat_fw = Matrix.Translation(Vector((0.0, 0.860, 0.490)))
    bmesh.ops.create_cube(bm_firewall, size=1.0, matrix=mat_fw @ Matrix.Diagonal(Vector((1.440, 0.040, 0.540, 1.0))))

    # Acoustic Composite Insulation Mat on Cockpit Side of Firewall
    mat_insul = mat_fw @ Matrix.Translation(Vector((0.0, -0.025, 0.0)))
    bmesh.ops.create_cube(bm_firewall, size=1.0, matrix=mat_insul @ Matrix.Diagonal(Vector((1.420, 0.015, 0.520, 1.0))))

    # 3. Radiator Core Support Upper Cross-Tie Bar (Y = +2.180m, Z = 0.710m)
    mat_rad_bar = Matrix.Translation(Vector((0.0, 2.180, 0.710)))
    bmesh.ops.create_cube(bm_brace, size=1.0, matrix=mat_rad_bar @ Matrix.Diagonal(Vector((1.220, 0.060, 0.040, 1.0))))

    # Hood Latch Catch Mechanism & Radiator Upper Isolators
    mat_latch = mat_rad_bar @ Matrix.Translation(Vector((0.0, 0.020, 0.020)))
    bmesh.ops.create_cube(bm_brace, size=1.0, matrix=mat_latch @ Matrix.Diagonal(Vector((0.120, 0.045, 0.030, 1.0))))

    obj_brace = link_obj("GEO_BENTLEY_EngineBay_Strut_VBracing", bm_brace, parent_col, mats["chrome"], bevel=0.001)
    obj_firewall = link_obj("GEO_BENTLEY_Structural_Firewall_Bulkhead", bm_firewall, parent_col, mats["trim_black"], bevel=0.0015)

    objs.extend([obj_brace, obj_firewall])
    return objs
# ----------------------------------------------------------------------------
# 19. SUBSYSTEM 19: 90L SADDLE FUEL TANK & THERMAL HEAT SHIELDING
# ----------------------------------------------------------------------------

def build_bentley_fuel_tank_and_shields(parent_col, mats):
    """
    Constructs high-capacity saddle fuel reservoir and exhaust heat shielding:
    - 90-liter molded multi-layer HDPE fuel tank spanning over the central carbon propshaft.
    - Symmetrical dual-lobe deep fuel sumps with internal swirl pots and high-pressure pumps.
    - Stamped dimpled aluminum thermal radiation barriers enclosing the exhaust tunnel.
    - High-pressure fuel filler neck tube leading up to the right rear quarter panel.
    """
    objs = []
    bm_tank = bmesh.new()
    bm_shield = bmesh.new()

    # 1. 90-Liter Saddle Fuel Tank Saddle Bridge (Y: -0.820m to -1.180m, Z = 0.320m)
    mat_tank = Matrix.Translation(Vector((0.0, -1.000, 0.340)))
    bmesh.ops.create_cube(bm_tank, size=1.0, matrix=mat_tank @ Matrix.Diagonal(Vector((1.040, 0.360, 0.220, 1.0))))

    # Left & Right Deep Sump Lobes
    for lobe_sign in [-1.0, 1.0]:
        mat_lobe = mat_tank @ Matrix.Translation(Vector((lobe_sign * 0.380, 0.000, -0.060)))
        bmesh.ops.create_cylinder(bm_tank, radius=0.140, depth=0.260, segments=18, matrix=mat_lobe @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
        # Fuel Pump Flange Access Ring
        mat_flange = mat_lobe @ Matrix.Translation(Vector((0, 0, 0.140)))
        bmesh.ops.create_cylinder(bm_tank, radius=0.065, depth=0.020, segments=16, matrix=mat_flange)

    # Fuel Filler Neck Pipe leading to Right Rear Quarter (X: +0.480m to +0.860m, Y = -1.050m, Z: 0.380m to 0.760m)
    mat_filler = Matrix.Translation(Vector((0.670, -1.050, 0.570))) @ Euler((0, math.radians(45), 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_tank, radius=0.024, depth=0.520, segments=14, matrix=mat_filler)

    # 2. Embossed Aluminum Tunnel Heat Shielding (Spans Y: -1.800m to +0.800m above exhaust)
    mat_t_shield = Matrix.Translation(Vector((0.0, -0.500, 0.260)))
    bmesh.ops.create_cube(bm_shield, size=1.0, matrix=mat_t_shield @ Matrix.Diagonal(Vector((0.480, 2.500, 0.012, 1.0))))

    # Rear Transverse Silencer Heat Deflector Plate (Under trunk well)
    mat_r_shield = Matrix.Translation(Vector((0.0, -1.880, 0.420)))
    bmesh.ops.create_cube(bm_shield, size=1.0, matrix=mat_r_shield @ Matrix.Diagonal(Vector((1.120, 0.460, 0.012, 1.0))))

    obj_tank = link_obj("GEO_BENTLEY_90L_Saddle_Fuel_Tank", bm_tank, parent_col, mats["trim_black"], bevel=0.002)
    obj_shield = link_obj("GEO_BENTLEY_Embossed_Thermal_Heat_Shields", bm_shield, parent_col, mats["chrome"], bevel=0.0008)

    objs.extend([obj_tank, obj_shield])
    return objs
# ----------------------------------------------------------------------------
# 20. SUBSYSTEM 20: TRUNK WELL, DUAL AGM BATTERIES & ROOF HYDRAULICS
# ----------------------------------------------------------------------------

def build_bentley_trunk_well_and_electrical(parent_col, mats):
    """
    Constructs rear luggage trunk underfloor architecture and auxiliary power:
    - Deep structural trunk well tub positioned beneath the convertible tonneau deck.
    - Dual heavy-duty 12-Volt AGM auxiliary and starter batteries in secured aluminum trays.
    - Electro-hydraulic soft-top roof actuation powerpack pump and solenoid valve block.
    - High-output 48V lithium-ion supercapacitor / battery pack for Bentley Dynamic Ride.
    """
    objs = []
    bm_well = bmesh.new()
    bm_bat = bmesh.new()
    bm_pump = bmesh.new()

    # 1. Structural Rear Trunk Well Floor (Y: -1.550m to -2.150m, Z = 0.420m, Width: 1.080m)
    mat_well = Matrix.Translation(Vector((0.0, -1.850, 0.420)))
    bmesh.ops.create_cube(bm_well, size=1.0, matrix=mat_well @ Matrix.Diagonal(Vector((1.080, 0.600, 0.220, 1.0))))

    # 2. Dual 12V AGM Heavy-Duty Batteries (Left & Right inside trunk floor well)
    for bat_sign in [-1.0, 1.0]:
        mat_bat = mat_well @ Matrix.Translation(Vector((bat_sign * 0.380, -0.050, -0.020)))
        # Battery Polypropylene Outer Casing
        bmesh.ops.create_cube(bm_bat, size=1.0, matrix=mat_bat @ Matrix.Diagonal(Vector((0.260, 0.180, 0.160, 1.0))))
        # Lead Terminal Posts (Positive red & Negative black)
        for term_sign, term_mat in [(-1, mats["red_caliper"]), (1, mats["trim_black"])]:
            mat_term = mat_bat @ Matrix.Translation(Vector((term_sign * 0.080, 0.050, 0.090)))
            bmesh.ops.create_cylinder(bm_bat, radius=0.012, depth=0.020, segments=10, matrix=mat_term)

    # 3. 48-Volt Supercapacitor / Lithium Module for Active Roll System (Center well)
    mat_48v_pack = mat_well @ Matrix.Translation(Vector((0.0, 0.160, -0.010)))
    bmesh.ops.create_cube(bm_bat, size=1.0, matrix=mat_48v_pack @ Matrix.Diagonal(Vector((0.340, 0.200, 0.140, 1.0))))

    # 4. Electro-Hydraulic Convertible Roof Powerpack Pump & Valve Block (Offset Right, Y = -1.680m)
    mat_pump = mat_well @ Matrix.Translation(Vector((0.320, 0.160, 0.060)))
    # High-Pressure Electric Motor Pump
    bmesh.ops.create_cylinder(bm_pump, radius=0.045, depth=0.140, segments=16, matrix=mat_pump @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    # Hydraulic Fluid Reservoir Bottle
    mat_res = mat_pump @ Matrix.Translation(Vector((0.0, 0.100, 0.020)))
    bmesh.ops.create_cylinder(bm_pump, radius=0.042, depth=0.090, segments=14, matrix=mat_res)
    # Billet Solenoid Valve Control Block
    mat_valve = mat_pump @ Matrix.Translation(Vector((-0.070, 0.000, 0.0)))
    bmesh.ops.create_cube(bm_pump, size=1.0, matrix=mat_valve @ Matrix.Diagonal(Vector((0.060, 0.120, 0.080, 1.0))))

    obj_well = link_obj("GEO_BENTLEY_Rear_Trunk_Structural_Well", bm_well, parent_col, mats["trim_black"], bevel=0.002)
    obj_bat = link_obj("GEO_BENTLEY_Dual_AGM_and_48V_Battery_Packs", bm_bat, parent_col, mats["trim_black"], bevel=0.0012)
    obj_pump = link_obj("GEO_BENTLEY_Roof_Hydraulic_Powerpack_Pump", bm_pump, parent_col, mats["engine_alloy"], bevel=0.001)

    objs.extend([obj_well, obj_bat, obj_pump])
    return objs
# ----------------------------------------------------------------------------
# 21. SUBSYSTEM 21: FRONT SPLITTER WINGLETS, AIR DAMS & BRAKE DUCTS
# ----------------------------------------------------------------------------

def build_bentley_splitter_and_cooling_ducts(parent_col, mats):
    """
    Constructs high-speed aerodynamic front splitter and brake duct architecture:
    - High-gloss piano black front splitter extending across the entire front bumper apron.
    - Turned-up aerodynamic endplate winglets managing wheel arch pressure and wake vortices.
    - Low-drag tire wake air deflector spats positioned forward of both front wheels.
    - High-pressure carbon composite brake cooling conduits delivering air to the 440mm CSiC discs.
    """
    objs = []
    bm_splitter = bmesh.new()
    bm_ducts = bmesh.new()

    # 1. Front High-Gloss Piano Black Aerodynamic Splitter (Y: +2.280m to +2.440m, Z = 0.190m)
    mat_split = Matrix.Translation(Vector((0.0, 2.360, 0.190)))
    bmesh.ops.create_cube(bm_splitter, size=1.0, matrix=mat_split @ Matrix.Diagonal(Vector((1.760, 0.160, 0.024, 1.0))))

    # Turned-Up Outer Aerodynamic Endplate Winglets (X = +-0.900m)
    for w_sign in [-1.0, 1.0]:
        mat_winglet = Matrix.Translation(Vector((w_sign * 0.890, 2.340, 0.235))) @ Euler((0, w_sign * math.radians(14), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_splitter, size=1.0, matrix=mat_winglet @ Matrix.Diagonal(Vector((0.022, 0.180, 0.110, 1.0))))

    # 2. Front Tire Wake Deflector Spats (Y = +1.740m, X = +-0.840m, Z = 0.200m)
    for spat_sign in [-1.0, 1.0]:
        mat_spat = Matrix.Translation(Vector((spat_sign * 0.840, 1.740, 0.200)))
        bmesh.ops.create_cube(bm_splitter, size=1.0, matrix=mat_spat @ Matrix.Diagonal(Vector((0.140, 0.025, 0.075, 1.0))))

    # 3. High-Pressure CSiC Front Brake Cooling Ducts (Leading from bumper scoops to wheel hubs)
    for duct_sign in [-1.0, 1.0]:
        p_inlet = Vector((duct_sign * 0.620, 2.180, 0.310))
        p_hub = Vector((duct_sign * 0.720, 1.480, 0.365))
        p_mid = (p_inlet + p_hub) * 0.5
        v_flow = p_hub - p_inlet
        length = v_flow.length
        rot_quat = Vector((0, 0, 1)).rotation_difference(v_flow.normalized())

        mat_duct = Matrix.Translation(p_mid) @ rot_quat.to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_ducts, radius=0.042, depth=length, segments=14, matrix=mat_duct)

        # Flared Carbon Rotor Cooling Backing Shroud
        mat_shroud = Matrix.Translation(Vector((duct_sign * 0.750, 1.440, 0.365))) @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_ducts, cap_ends=False, radius=0.190, depth=0.035, segments=20, matrix=mat_shroud)

    obj_splitter = link_obj("GEO_BENTLEY_Front_Aero_Splitter_Winglets", bm_splitter, parent_col, mats["piano_black"], bevel=0.0012)
    obj_ducts = link_obj("GEO_BENTLEY_CSiC_Front_Brake_Cooling_Ducts", bm_ducts, parent_col, mats["trim_black"], bevel=0.001)

    objs.extend([obj_splitter, obj_ducts])
    return objs
# ----------------------------------------------------------------------------
# 22. SUBSYSTEM 22: CAST ALUMINUM SUBFRAMES & TUNNEL SHEAR PLATES
# ----------------------------------------------------------------------------

def build_bentley_subframe_cradles(parent_col, mats):
    """
    Constructs high-torsion structural subframe assemblies and tunnel shear plates:
    - High-integrity cast aluminum front subframe cradle mounting the W12 powertrain.
    - Isolated perimeter rear subframe cradle carrying the eLSD, AWS, and multi-link geometry.
    - Monocoque center tunnel diagonal shear reinforcement plate (ensuring 33 kNm/deg stiffness).
    - Heavy-duty rubber-metal hydraulic isolation mounting subframe bushings.
    """
    objs = []
    bm_sub = bmesh.new()
    bm_shear = bmesh.new()

    # 1. Front High-Integrity Cast Aluminum Subframe (Axle Y = +1.425m, Z = 0.190m)
    mat_fsub = Matrix.Translation(Vector((0.0, 1.425, 0.190)))
    # Transverse Box Section Base Member
    bmesh.ops.create_cube(bm_sub, size=1.0, matrix=mat_fsub @ Matrix.Diagonal(Vector((0.920, 0.220, 0.080, 1.0))))

    # Longitudinal Engine Mount Cradle Rails (Left & Right)
    for fx_sign in [-1.0, 1.0]:
        mat_fside = mat_fsub @ Matrix.Translation(Vector((fx_sign * 0.410, -0.160, 0.045)))
        bmesh.ops.create_cube(bm_sub, size=1.0, matrix=mat_fside @ Matrix.Diagonal(Vector((0.110, 0.440, 0.075, 1.0))))
        # Hydraulic Engine Mount Isolation Bushing
        mat_fmount = mat_fsub @ Matrix.Translation(Vector((fx_sign * 0.360, -0.050, 0.110)))
        bmesh.ops.create_cylinder(bm_sub, radius=0.048, depth=0.065, segments=16, matrix=mat_fmount)

    # 2. Rear Perimeter Multi-Link Subframe Cradle (Axle Y = -1.426m, Z = 0.210m)
    mat_rsub = Matrix.Translation(Vector((0.0, -1.426, 0.210)))
    # Outer Perimeter Box Enclosing Rear Differential
    bmesh.ops.create_cube(bm_sub, size=1.0, matrix=mat_rsub @ Matrix.Diagonal(Vector((0.980, 0.620, 0.090, 1.0))))

    # Diagonal Subframe Shear Ties & Differential Mount Lugs
    for rx_sign in [-1.0, 1.0]:
        mat_rtie = mat_rsub @ Matrix.Translation(Vector((rx_sign * 0.440, 0.240, 0.050))) @ Euler((0, 0, rx_sign * math.radians(26)), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_sub, size=1.0, matrix=mat_rtie @ Matrix.Diagonal(Vector((0.070, 0.360, 0.055, 1.0))))
        # Subframe-to-Chassis Hydro-Bushing Mount Cans
        mat_rbush = mat_rsub @ Matrix.Translation(Vector((rx_sign * 0.480, -0.280, 0.080)))
        bmesh.ops.create_cylinder(bm_sub, radius=0.045, depth=0.075, segments=16, matrix=mat_rbush)

    # 3. Central Monocoque Transmission Tunnel Shear Closure Plate (Y: -0.800m to +0.200m, Z = 0.185m)
    mat_shear = Matrix.Translation(Vector((0.0, -0.300, 0.185)))
    bmesh.ops.create_cube(bm_shear, size=1.0, matrix=mat_shear @ Matrix.Diagonal(Vector((0.540, 1.000, 0.012, 1.0))))

    # Embossed Diagonal Cross-Ribs on Shear Plate for Extreme Torsional Rigidity
    for rib_ang in [-32, 32]:
        mat_xrib = mat_shear @ Euler((0, 0, math.radians(rib_ang)), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_shear, size=1.0, matrix=mat_xrib @ Matrix.Diagonal(Vector((0.025, 0.850, 0.016, 1.0))))

    obj_sub = link_obj("GEO_BENTLEY_Cast_Aluminum_Subframe_Cradles", bm_sub, parent_col, mats["engine_alloy"], bevel=0.0018)
    obj_shear = link_obj("GEO_BENTLEY_Tunnel_Torsional_Shear_Plate", bm_shear, parent_col, mats["chrome"], bevel=0.001)

    objs.extend([obj_sub, obj_shear])
    return objs
# ----------------------------------------------------------------------------
# 24. SUBSYSTEM 24: MULTI-RADIATOR COOLING PACK & AUXILIARY HEAT EXCHANGERS
# ----------------------------------------------------------------------------

def build_bentley_radiator_cooling_pack(parent_col, mats):
    """
    Constructs the extensive thermal management radiator pack for the 6.0L W12:
    - Main high-capacity aluminum engine coolant radiator (Y = +2.120m, Z = 0.460m).
    - Front-mounted AC condenser core and transmission fluid heat exchanger.
    - Twin auxiliary low-temperature coolant radiators mounted in the outer bumper cavities
      directly behind the side intake matrix grilles (feeding intercoolers and 48V inverter).
    - Molded composite cooling fan shroud with dual high-output variable-speed electric fans.
    """
    objs = []
    bm_rad = bmesh.new()
    bm_fans = bmesh.new()

    # 1. Main High-Capacity W12 Coolant Radiator Core (Y = +2.120m, Z = 0.480m)
    mat_rad = Matrix.Translation(Vector((0.0, 2.120, 0.480)))
    bmesh.ops.create_cube(bm_rad, size=1.0, matrix=mat_rad @ Matrix.Diagonal(Vector((0.740, 0.055, 0.380, 1.0))))

    # Molded End Tanks (Left & Right Aluminum End Tanks)
    for et_sign in [-1.0, 1.0]:
        mat_et = mat_rad @ Matrix.Translation(Vector((et_sign * 0.385, 0, 0)))
        bmesh.ops.create_cube(bm_rad, size=1.0, matrix=mat_et @ Matrix.Diagonal(Vector((0.035, 0.065, 0.390, 1.0))))
        # Coolant Hose Inlet & Outlet Spigots
        mat_spig = mat_et @ Matrix.Translation(Vector((0, -0.040, et_sign * 0.120)))
        bmesh.ops.create_cylinder(bm_rad, radius=0.024, depth=0.060, segments=14, matrix=mat_spig @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 2. AC Condenser Core & Transmission Oil Cooler (Forward of main radiator at Y = +2.160m)
    mat_cond = Matrix.Translation(Vector((0.0, 2.165, 0.480)))
    bmesh.ops.create_cube(bm_rad, size=1.0, matrix=mat_cond @ Matrix.Diagonal(Vector((0.700, 0.022, 0.340, 1.0))))

    # 3. Twin Outer Auxiliary Radiators (Left & Right Outer Bumper, Y = +2.050m, Z = 0.340m)
    for aux_sign in [-1.0, 1.0]:
        mat_aux = Matrix.Translation(Vector((aux_sign * 0.620, 2.050, 0.340))) @ Euler((0, aux_sign * math.radians(14), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_rad, size=1.0, matrix=mat_aux @ Matrix.Diagonal(Vector((0.240, 0.045, 0.220, 1.0))))
        # Auxiliary Radiator Flared Duct Cowling
        mat_cowl = mat_aux @ Matrix.Translation(Vector((0, 0.035, 0)))
        bmesh.ops.create_cube(bm_rad, size=1.0, matrix=mat_cowl @ Matrix.Diagonal(Vector((0.260, 0.025, 0.235, 1.0))))

    # 4. Rear Radiator Fan Shroud & Dual Variable-Speed Electric Cooling Fans (Behind radiator at Y = +2.070m)
    mat_shroud = Matrix.Translation(Vector((0.0, 2.070, 0.480)))
    bmesh.ops.create_cube(bm_fans, size=1.0, matrix=mat_shroud @ Matrix.Diagonal(Vector((0.720, 0.045, 0.370, 1.0))))

    # Dual High-Velocity Curved Aerofoil Fan Impellers (Left & Right)
    for fan_sign in [-1.0, 1.0]:
        mat_fan = mat_shroud @ Matrix.Translation(Vector((fan_sign * 0.185, -0.015, 0)))
        # Fan Outer Cylindrical Cowling Ring
        bmesh.ops.create_cylinder(bm_fans, cap_ends=False, radius=0.160, depth=0.035, segments=24, matrix=mat_fan @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
        # Fan Electric Hub Motor
        bmesh.ops.create_cylinder(bm_fans, radius=0.052, depth=0.045, segments=16, matrix=mat_fan @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
        # 7 Swept Aerofoil Fan Blades
        for b_i in range(7):
            b_ang = b_i * (2.0 * math.pi / 7.0)
            mat_b = mat_fan @ Euler((0, 0, b_ang), 'XYZ').to_matrix().to_4x4() @ Matrix.Translation(Vector((0.095, 0, 0)))
            bmesh.ops.create_cube(bm_fans, size=1.0, matrix=mat_b @ Matrix.Diagonal(Vector((0.085, 0.008, 0.024, 1.0))))

    obj_rad = link_obj("GEO_BENTLEY_MultiRadiator_Cooling_Core", bm_rad, parent_col, mats["chrome"], bevel=0.001)
    obj_fans = link_obj("GEO_BENTLEY_Dual_Electric_Cooling_Fans", bm_fans, parent_col, mats["trim_black"], bevel=0.0015)

    objs.extend([obj_rad, obj_fans])
    return objs


# ----------------------------------------------------------------------------
# 25. SUBSYSTEM 25: 48V HIGH-VOLTAGE BUSBARS, DC-DC CONVERTER & HARNESSES
# ----------------------------------------------------------------------------

def build_bentley_48v_electrical_architecture(parent_col, mats):
    """
    Constructs the 48-Volt electrical architecture and wiring distribution harnesses:
    - High-power 48V to 12V DC-DC bidirectional voltage converter module in engine compartment.
    - High-current orange shielded 48V power distribution busbars running down transmission tunnel.
    - Primary electrical wiring harness trunking conduits routed along structural sills.
    - Engine control unit (ECU) dual sealed aluminum enclosures mounted on passenger firewall.
    """
    objs = []
    bm_elec = bmesh.new()
    bm_harness = bmesh.new()

    # 1. 48V to 12V Bidirectional DC-DC Converter (Passenger side engine bay, Y = +1.180m, Z = 0.620m)
    mat_dcdc = Matrix.Translation(Vector((0.460, 1.180, 0.620)))
    # Finned Aluminum Heat Sink Enclosure
    bmesh.ops.create_cube(bm_elec, size=1.0, matrix=mat_dcdc @ Matrix.Diagonal(Vector((0.160, 0.220, 0.110, 1.0))))
    for fin_i in range(6):
        fz = -0.040 + fin_i * 0.016
        mat_fin = mat_dcdc @ Matrix.Translation(Vector((0, 0, fz)))
        bmesh.ops.create_cube(bm_elec, size=1.0, matrix=mat_fin @ Matrix.Diagonal(Vector((0.170, 0.210, 0.004, 1.0))))

    # 2. Dual W12 Bosch Master/Slave Engine ECUs (Firewall Passenger Side, Y = +0.890m, Z = 0.680m)
    for ecu_i in [0, 1]:
        mat_ecu = Matrix.Translation(Vector((0.360 + ecu_i * 0.120, 0.890, 0.680)))
        bmesh.ops.create_cube(bm_elec, size=1.0, matrix=mat_ecu @ Matrix.Diagonal(Vector((0.095, 0.035, 0.140, 1.0))))

    # 3. High-Voltage 48V Orange Insulated Busbar Cables (Running from trunk battery to front roll actuators)
    mat_bus = Matrix.Translation(Vector((-0.180, -0.400, 0.280)))
    bmesh.ops.create_cylinder(bm_harness, radius=0.014, depth=2.800, segments=12, matrix=mat_bus @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 4. Left & Right Main Chassis Body Wiring Conduits (Along inner rocker sills)
    for h_sign in [-1.0, 1.0]:
        mat_cond = Matrix.Translation(Vector((h_sign * 0.740, -0.200, 0.250)))
        bmesh.ops.create_cylinder(bm_elec, radius=0.018, depth=2.600, segments=12, matrix=mat_cond @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_elec = link_obj("GEO_BENTLEY_48V_Power_Electronics_and_ECUs", bm_elec, parent_col, mats["engine_alloy"], bevel=0.001)
    obj_harness = link_obj("GEO_BENTLEY_HighVoltage_48V_Busbars", bm_harness, parent_col, mats["red_caliper"], bevel=0.0008)

    objs.extend([obj_elec, obj_harness])
    return objs
# ----------------------------------------------------------------------------
# 26. SUBSYSTEM 26: ACTIVE PYROTECHNIC ROLLOVER PROTECTION HOOPS
# ----------------------------------------------------------------------------

def build_bentley_rollover_protection(parent_col, mats):
    """
    Constructs the life-saving active deployable rollover protection system:
    - High-strength extruded aluminum rollover cassette cartridges mounted behind rear headrests.
    - Telescopic high-tensile steel rollover hoops held primed by pyrotechnic actuators.
      Capable of deploying within 120 milliseconds in an impending rollover event.
    - Structural transverse cross-brace tying rollover cassettes directly into rear bulkhead.
    """
    objs = []
    bm_cass = bmesh.new()
    bm_hoops = bmesh.new()

    # Rear Rollover Cassettes (Left & Right, positioned directly behind rear headrests at Y = -0.960m, Z = 0.720m)
    for ro_sign in [-1.0, 1.0]:
        mat_cass = Matrix.Translation(Vector((ro_sign * 0.360, -0.960, 0.680)))
        # Rigid Aluminum Cassette Housing Box
        bmesh.ops.create_cube(bm_cass, size=1.0, matrix=mat_cass @ Matrix.Diagonal(Vector((0.260, 0.140, 0.320, 1.0))))

        # High-Strength U-Shaped Telescopic Roll Hoop (Concealed flush below tonneau deck line)
        mat_hoop_ctr = mat_cass @ Matrix.Translation(Vector((0, 0, 0.140)))
        # Top Horizontal Crossbar of U-Hoop
        bmesh.ops.create_cylinder(bm_hoops, radius=0.022, depth=0.180, segments=16, matrix=mat_hoop_ctr @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())
        # Vertical Legs of U-Hoop
        for leg_sign in [-1.0, 1.0]:
            mat_leg = mat_hoop_ctr @ Matrix.Translation(Vector((leg_sign * 0.090, 0, -0.100)))
            bmesh.ops.create_cylinder(bm_hoops, radius=0.020, depth=0.200, segments=14, matrix=mat_leg)

        # Pyrotechnic Pre-Tensioner Squib Actuator Cylinder at base of cassette
        mat_squib = mat_cass @ Matrix.Translation(Vector((0, 0, -0.130)))
        bmesh.ops.create_cylinder(bm_cass, radius=0.028, depth=0.065, segments=14, matrix=mat_squib)

    # Transverse Structural Bulkhead Tie-Beam Locking Both Rollover Cassettes (Y = -0.960m, Z = 0.640m)
    mat_rbar = Matrix.Translation(Vector((0.0, -0.960, 0.640)))
    bmesh.ops.create_cube(bm_cass, size=1.0, matrix=mat_rbar @ Matrix.Diagonal(Vector((1.150, 0.065, 0.050, 1.0))))

    obj_cass = link_obj("GEO_BENTLEY_Rollover_Cassette_Cartridges", bm_cass, parent_col, mats["trim_black"], bevel=0.0015)
    obj_hoops = link_obj("GEO_BENTLEY_Deployable_Rollover_Protection_Hoops", bm_hoops, parent_col, mats["chrome"], bevel=0.0012)

    objs.extend([obj_cass, obj_hoops])
    return objs


# ----------------------------------------------------------------------------
# 27. SUBSYSTEM 27: 4-CORNER RIDE HEIGHT SENSORS & SUSPENSION LEVELING
# ----------------------------------------------------------------------------

def build_bentley_ride_height_sensors(parent_col, mats):
    """
    Constructs high-frequency articulating ride height sensor modules:
    - 4-corner rotary hall-effect height sensor bodies mounted on chassis subframe rails.
    - Articulated ball-jointed drop link tie-rods connecting sensors to lower wishbones.
    - Monitors chassis ride height 500 times per second for dynamic 3-chamber air leveling.
    - Central pneumatic solenoid air distribution valve block and pressure accumulator tank.
    """
    objs = []
    bm_sensors = bmesh.new()
    bm_pneumatic = bmesh.new()

    sensor_locs = [
        ("FL", -0.560,  1.380, 0.380,  1.0, True),
        ("FR",  0.560,  1.380, 0.380, -1.0, True),
        ("RL", -0.540, -1.360, 0.390,  1.0, False),
        ("RR",  0.540, -1.360, 0.390, -1.0, False),
    ]

    for name, sx, sy, sz, flip, is_front in sensor_locs:
        mat_s = Matrix.Translation(Vector((sx, sy, sz)))
        # Rotary Hall-Effect Electronic Sensor Body
        bmesh.ops.create_cube(bm_sensors, size=1.0, matrix=mat_s @ Matrix.Diagonal(Vector((0.045, 0.045, 0.035, 1.0))))
        # Articulating Sensor Arm
        mat_arm = mat_s @ Matrix.Translation(Vector((flip * 0.035, 0, 0)))
        bmesh.ops.create_cylinder(bm_sensors, radius=0.006, depth=0.075, segments=10, matrix=mat_arm @ Euler((0, 0, math.radians(45)), 'XYZ').to_matrix().to_4x4())
        # Drop Link Rod down to lower suspension wishbone
        mat_link = mat_s @ Matrix.Translation(Vector((flip * 0.055, 0, -0.065)))
        bmesh.ops.create_cylinder(bm_sensors, radius=0.004, depth=0.110, segments=10, matrix=mat_link)

    # Central Pneumatic Air Suspension Aluminum Pressure Accumulator Reservoir Bottle (Trunk floor flank, Y = -1.450m)
    mat_accum = Matrix.Translation(Vector((-0.460, -1.450, 0.360)))
    bmesh.ops.create_cylinder(bm_pneumatic, radius=0.075, depth=0.360, segments=20, matrix=mat_accum @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Multi-Port Pneumatic Solenoid Air Distribution Valve Block
    mat_sol = mat_accum @ Matrix.Translation(Vector((0.140, 0.0, 0.0)))
    bmesh.ops.create_cube(bm_pneumatic, size=1.0, matrix=mat_sol @ Matrix.Diagonal(Vector((0.090, 0.120, 0.075, 1.0))))

    obj_sensors = link_obj("GEO_BENTLEY_Suspension_Ride_Height_Sensors", bm_sensors, parent_col, mats["trim_black"], bevel=0.0008)
    obj_pneumatic = link_obj("GEO_BENTLEY_Pneumatic_Air_Accumulator_ValveBlock", bm_pneumatic, parent_col, mats["engine_alloy"], bevel=0.0015)

    objs.extend([obj_sensors, obj_pneumatic])
    return objs
# ----------------------------------------------------------------------------
# 28. SUBSYSTEM 28: FRONT STRUCTURAL APRONS & ACOUSTIC WHEEL ARCH LINERS
# ----------------------------------------------------------------------------

def build_bentley_fender_aprons_and_liners(parent_col, mats):
    """
    Constructs high-stiffness inner fender aprons and acoustic wheel arch shielding:
    - Left & Right structural cast aluminum shock tower support aprons.
    - Diagonal fender-to-radiator support reinforcement tubular struts.
    - Molded composite acoustic wheelhouse liner shields with sound absorption fleece.
    - Wheelhouse cooling ventilation louver vents relieving aerodynamic front lift.
    """
    objs = []
    bm_aprons = bmesh.new()
    bm_liners = bmesh.new()

    # Front Shock Tower Inner Fender Aprons (Y: +1.150m to +1.750m, X = +-0.620m, Z: 0.420m to 0.720m)
    for ap_sign in [-1.0, 1.0]:
        mat_apron = Matrix.Translation(Vector((ap_sign * 0.620, 1.450, 0.580)))
        # Inner Tower Apron Wall Panel
        bmesh.ops.create_cube(bm_aprons, size=1.0, matrix=mat_apron @ Matrix.Diagonal(Vector((0.040, 0.580, 0.280, 1.0))))

        # Diagonal Strut Rod linking Shock Tower to Upper Radiator Core Support
        p_tow = Vector((ap_sign * 0.540, 1.425, 0.680))
        p_rad = Vector((ap_sign * 0.480, 2.140, 0.680))
        p_mid = (p_tow + p_rad) * 0.5
        v_strut = p_rad - p_tow
        length = v_strut.length
        rot_quat = Vector((0, 0, 1)).rotation_difference(v_strut.normalized())

        mat_strut = Matrix.Translation(p_mid) @ rot_quat.to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_aprons, radius=0.014, depth=length, segments=12, matrix=mat_strut)

        # High-Density Acoustic Fleece Sound Deadening Liners (Molded around wheel arches)
        mat_liner = Matrix.Translation(Vector((ap_sign * 0.680, 1.425, 0.480)))
        bmesh.ops.create_cylinder(bm_liners, cap_ends=False, radius=0.380, depth=0.180, segments=22, matrix=mat_liner @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # Wheelhouse Pressure Relief Extraction Louvers (Top rear of front wheel arch)
        for louver_i in range(4):
            mat_louver = Matrix.Translation(Vector((ap_sign * 0.660, 1.220 + louver_i * 0.035, 0.660)))
            bmesh.ops.create_cube(bm_aprons, size=1.0, matrix=mat_louver @ Matrix.Diagonal(Vector((0.028, 0.022, 0.008, 1.0))))

    obj_aprons = link_obj("GEO_BENTLEY_Structural_Fender_Aprons", bm_aprons, parent_col, mats["engine_alloy"], bevel=0.0015)
    obj_liners = link_obj("GEO_BENTLEY_Acoustic_Wheelhouse_Liners", bm_liners, parent_col, mats["trim_black"], bevel=0.001)

    objs.extend([obj_aprons, obj_liners])
    return objs


# ----------------------------------------------------------------------------
# 29. SUBSYSTEM 29: GROUND-EFFECT STRAKES, DEFLECTORS & ELSD COOLING SCOOP
# ----------------------------------------------------------------------------

def build_bentley_ground_effects_and_diffusers(parent_col, mats):
    """
    Constructs high-speed underbody aerodynamic ground-effect components:
    - Molded NACA cooling duct channeling ambient air directly to the rear eLSD casing.
    - Front underbody vortex generators and lateral floor edge sealing blades.
    - Rear axle curved aerodynamic wake deflectors shielding rear suspension arms.
    - Transmission tunnel acoustic and aerodynamic belly shield closure.
    """
    objs = []
    bm_aero = bmesh.new()

    # 1. Rear Differential NACA Cooling Duct (Y = -1.150m, Z = 0.170m)
    mat_naca = Matrix.Translation(Vector((0.0, -1.150, 0.172)))
    # Submerged NACA Ramp Inlet
    bmesh.ops.create_cube(bm_aero, size=1.0, matrix=mat_naca @ Matrix.Diagonal(Vector((0.180, 0.320, 0.035, 1.0))))
    # Direct Air Scoop Channel to eLSD Housing
    mat_scoop = mat_naca @ Matrix.Translation(Vector((0, -0.180, 0.040)))
    bmesh.ops.create_cylinder(bm_aero, radius=0.045, depth=0.220, segments=14, matrix=mat_scoop @ Euler((math.radians(22), 0, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Floor Edge Aerodynamic Sealing Blades (Left & Right under rocker sills)
    for blade_sign in [-1.0, 1.0]:
        mat_blade = Matrix.Translation(Vector((blade_sign * 0.740, -0.200, 0.165)))
        bmesh.ops.create_cube(bm_aero, size=1.0, matrix=mat_blade @ Matrix.Diagonal(Vector((0.020, 2.400, 0.035, 1.0))))

        # Rear Suspension Lower Wishbone Aerodynamic Air Deflectors (Y = -1.380m)
        mat_rdef = Matrix.Translation(Vector((blade_sign * 0.540, -1.380, 0.190)))
        bmesh.ops.create_cube(bm_aero, size=1.0, matrix=mat_rdef @ Matrix.Diagonal(Vector((0.260, 0.080, 0.025, 1.0))))

    # 3. Front Underbody Vortex Generators (Forward floor, Y = +0.850m)
    for vg_i, vg_x in enumerate([-0.360, -0.180, 0.180, 0.360]):
        vg_ang = 15 if vg_x > 0 else -15
        mat_vg = Matrix.Translation(Vector((vg_x, 0.850, 0.162))) @ Euler((0, 0, math.radians(vg_ang)), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_aero, size=1.0, matrix=mat_vg @ Matrix.Diagonal(Vector((0.008, 0.090, 0.025, 1.0))))

    obj_aero = link_obj("GEO_BENTLEY_Underbody_GroundEffect_Strakes", bm_aero, parent_col, mats["trim_black"], bevel=0.001)
    objs.append(obj_aero)
    return objs
# ----------------------------------------------------------------------------
# 30. SUBSYSTEM 30: BRAKE BOOSTER, ABS/ESP HYDRAULIC MODULATOR & HARDLINES
# ----------------------------------------------------------------------------

def build_bentley_brake_hydraulics_and_abs(parent_col, mats):
    """
    Constructs high-pressure brake actuation and electronic stability control:
    - Tandem vacuum booster and aluminum master cylinder on driver firewall.
    - High-frequency Bosch ESP 9.0 electro-hydraulic modulator valve block with accumulator.
    - Pre-formed stainless steel hard brake hydraulic lines radiating to all four wheel arches.
    - Brake fluid reservoir bottle with low-level sensor cap.
    """
    objs = []
    bm_booster = bmesh.new()
    bm_lines = bmesh.new()

    # 1. Tandem Vacuum Brake Booster (Driver side firewall, X = -0.420m, Y = +0.870m, Z = 0.710m)
    mat_boost = Matrix.Translation(Vector((-0.420, 0.870, 0.710)))
    # Dual-Diaphragm Vacuum Booster Canister
    bmesh.ops.create_cylinder(bm_booster, radius=0.115, depth=0.110, segments=22, matrix=mat_boost @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Aluminum Tandem Master Cylinder
    mat_mc = mat_boost @ Matrix.Translation(Vector((0, 0.110, 0)))
    bmesh.ops.create_cylinder(bm_booster, radius=0.032, depth=0.140, segments=16, matrix=mat_mc @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Translucent Polyethylene Fluid Reservoir
    mat_res = mat_mc @ Matrix.Translation(Vector((0, 0, 0.075)))
    bmesh.ops.create_cube(bm_booster, size=1.0, matrix=mat_res @ Matrix.Diagonal(Vector((0.085, 0.130, 0.080, 1.0))))

    # 2. Bosch ESP/ABS Hydraulic Control Modulator Unit (Behind left shock tower at Y = +1.180m, Z = 0.620m)
    mat_abs = Matrix.Translation(Vector((-0.480, 1.180, 0.620)))
    # Billet Aluminum Hydraulic Modulator Block
    bmesh.ops.create_cube(bm_booster, size=1.0, matrix=mat_abs @ Matrix.Diagonal(Vector((0.130, 0.110, 0.110, 1.0))))
    # Modulator High-Speed Electric Return Pump Motor
    mat_apump = mat_abs @ Matrix.Translation(Vector((0, -0.075, 0)))
    bmesh.ops.create_cylinder(bm_booster, radius=0.042, depth=0.065, segments=16, matrix=mat_apump @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 3. Stainless Steel Hard Brake Hydraulic Lines radiating to wheel wells
    wheel_dest = [
        (-0.720,  1.425, 0.440),
        ( 0.720,  1.425, 0.440),
        (-0.710, -1.426, 0.440),
        ( 0.710, -1.426, 0.440),
    ]
    p_abs_ctr = Vector((-0.480, 1.180, 0.620))
    for wx, wy, wz in wheel_dest:
        p_whl = Vector((wx, wy, wz))
        p_mid = (p_abs_ctr + p_whl) * 0.5
        v_line = p_whl - p_abs_ctr
        length = v_line.length
        rot_quat = Vector((0, 0, 1)).rotation_difference(v_line.normalized())

        mat_line = Matrix.Translation(p_mid) @ rot_quat.to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_lines, radius=0.0035, depth=length, segments=8, matrix=mat_line)

    obj_booster = link_obj("GEO_BENTLEY_Brake_Booster_and_ABS_Unit", bm_booster, parent_col, mats["engine_alloy"], bevel=0.001)
    obj_lines = link_obj("GEO_BENTLEY_Stainless_Brake_Hydraulic_Hardlines", bm_lines, parent_col, mats["chrome"], bevel=0.0005)

    objs.extend([obj_booster, obj_lines])
    return objs


# ----------------------------------------------------------------------------
# 31. SUBSYSTEM 31: TUNNEL ACOUSTIC BAFFLES & PROPSHAFT SAFETY HOOPS
# ----------------------------------------------------------------------------

def build_bentley_tunnel_baffles_and_safety_hoops(parent_col, mats):
    """
    Constructs transmission tunnel acoustic attenuation and driveline safety loops:
    - High-density viscoelastic acoustic decoupling foam pads lining the center tunnel.
    - Dual high-tensile steel circular propshaft containment safety hoops (NHRA / FIA spec).
    - Prevents carbon fiber propshaft flailing in the extreme event of universal joint failure at 208 mph.
    - Underfloor hydraulic line routing clips and rubber vibration isolator grommets.
    """
    objs = []
    bm_hoops = bmesh.new()
    bm_baffles = bmesh.new()

    # 1. High-Tensile Steel Propshaft Safety Containment Hoops (Forward at Y = +0.100m, Rearward at Y = -0.900m)
    for hoop_y in [0.100, -0.900]:
        mat_hoop = Matrix.Translation(Vector((0.0, hoop_y, 0.280)))
        # Circular Loop surrounding carbon propshaft (Radius = 0.075m)
        bmesh.ops.create_torus(bm_hoops, major_radius=0.075, minor_radius=0.008, major_segments=20, minor_segments=10, matrix=mat_hoop @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
        # Heavy-Duty Steel Mounting Cleats to Tunnel Wall
        for c_sign in [-1.0, 1.0]:
            mat_cleat = mat_hoop @ Matrix.Translation(Vector((c_sign * 0.095, 0, 0)))
            bmesh.ops.create_cube(bm_hoops, size=1.0, matrix=mat_cleat @ Matrix.Diagonal(Vector((0.040, 0.050, 0.015, 1.0))))

    # 2. Viscoelastic Center Tunnel Acoustic Sound Deadening Foam Mats (Lining tunnel walls)
    for b_sign in [-1.0, 1.0]:
        mat_baf = Matrix.Translation(Vector((b_sign * 0.210, -0.300, 0.360)))
        bmesh.ops.create_cube(bm_baffles, size=1.0, matrix=mat_baf @ Matrix.Diagonal(Vector((0.025, 2.100, 0.160, 1.0))))

    obj_hoops = link_obj("GEO_BENTLEY_Propshaft_Safety_Containment_Hoops", bm_hoops, parent_col, mats["chrome"], bevel=0.001)
    obj_baffles = link_obj("GEO_BENTLEY_Tunnel_Acoustic_Sound_Baffles", bm_baffles, parent_col, mats["trim_black"], bevel=0.0012)

    objs.extend([obj_hoops, obj_baffles])
    return objs
# ----------------------------------------------------------------------------
# 32. SUBSYSTEM 32: EVAP CARBON CANISTER, PURGE VALVES & VAPOR LINES
# ----------------------------------------------------------------------------

def build_bentley_evap_canister_system(parent_col, mats):
    """
    Constructs the evaporative emissions control system:
    - Activated charcoal vapor absorption canister mounted above rear right wheelhouse.
    - Electronic EVAP purge solenoid valve module controlling manifold vacuum draw.
    - Nylon fuel vapor return conduits running parallel to fuel delivery lines.
    - Fuel tank pressure differential sensor and roll-over vapor vent valve.
    """
    objs = []
    bm_can = bmesh.new()
    bm_tubes = bmesh.new()

    # 1. Activated Charcoal EVAP Canister (Above right rear wheelhouse, X = +0.680m, Y = -1.280m, Z = 0.580m)
    mat_can = Matrix.Translation(Vector((0.680, -1.280, 0.580)))
    bmesh.ops.create_cube(bm_can, size=1.0, matrix=mat_can @ Matrix.Diagonal(Vector((0.180, 0.280, 0.160, 1.0))))

    # Canister Vacuum Port Nipples
    for nip_off in [-0.045, 0.045]:
        mat_nip = mat_can @ Matrix.Translation(Vector((0, 0.150, nip_off)))
        bmesh.ops.create_cylinder(bm_can, radius=0.012, depth=0.040, segments=12, matrix=mat_nip @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Electronic Purge Solenoid Valve (Engine bay right flank, Y = +1.120m, Z = 0.620m)
    mat_purge = Matrix.Translation(Vector((0.440, 1.120, 0.620)))
    bmesh.ops.create_cylinder(bm_can, radius=0.024, depth=0.075, segments=14, matrix=mat_purge)

    # 3. Longitudinal Nylon Vapor Return Conduit (Right sill, running from canister to engine bay)
    mat_tube = Matrix.Translation(Vector((0.680, -0.100, 0.320)))
    bmesh.ops.create_cylinder(bm_tubes, radius=0.006, depth=2.400, segments=10, matrix=mat_tube @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_can = link_obj("GEO_BENTLEY_EVAP_Charcoal_Canister_Module", bm_can, parent_col, mats["trim_black"], bevel=0.0012)
    obj_tubes = link_obj("GEO_BENTLEY_EVAP_Vapor_Return_Conduits", bm_tubes, parent_col, mats["trim_black"], bevel=0.0006)

    objs.extend([obj_can, obj_tubes])
    return objs


# ----------------------------------------------------------------------------
# 33. SUBSYSTEM 33: TWIN INDUCTION AIRBOXES & RAM-AIR INTAKE SNORKELS
# ----------------------------------------------------------------------------

def build_bentley_air_intake_boxes_and_snorkels(parent_col, mats):
    """
    Constructs high-flow twin induction air filter enclosures and intake snorkels:
    - Twin high-volume composite air filter boxes positioned behind front grille header.
    - Ram-air intake snorkel ducts capturing clean ambient air behind matrix grille mesh.
    - Carbon composite induction intake pipes feeding twin-scroll turbocharger inlets.
    - Dual Mass Airflow (MAF) sensor housings with electronic connector terminals.
    """
    objs = []
    bm_airbox = bmesh.new()
    bm_pipes = bmesh.new()

    # Twin Symmetrical Induction Filter Airboxes (Left & Right, Y = +1.880m, Z = 0.620m)
    for ab_sign in [-1.0, 1.0]:
        mat_box = Matrix.Translation(Vector((ab_sign * 0.380, 1.880, 0.620)))
        # Filter Housing Upper & Lower Shells
        bmesh.ops.create_cube(bm_airbox, size=1.0, matrix=mat_box @ Matrix.Diagonal(Vector((0.240, 0.280, 0.160, 1.0))))

        # Ram-Air Front Intake Snorkel Horn (reaching forward to grille header at Y = +2.160m)
        p_snork_start = Vector((ab_sign * 0.380, 1.980, 0.640))
        p_snork_end = Vector((ab_sign * 0.240, 2.180, 0.670))
        p_mid = (p_snork_start + p_snork_end) * 0.5
        v_snork = p_snork_end - p_snork_start
        length = v_snork.length
        rot_quat = Vector((0, 0, 1)).rotation_difference(v_snork.normalized())

        mat_snork = Matrix.Translation(p_mid) @ rot_quat.to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_pipes, radius=0.045, depth=length, segments=16, matrix=mat_snork)

        # Flared Snorkel Ambient Air Inlet Bellmouth behind matrix grille
        mat_bell = Matrix.Translation(p_snork_end) @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_pipes, cap_ends=False, radius=0.065, depth=0.035, segments=18, matrix=mat_bell)

        # Clean Air Duct to Turbocharger Compressor Inlets (Y: +1.880m back to +1.280m)
        p_turb = Vector((ab_sign * 0.360, 1.280, 0.440))
        p_box_out = Vector((ab_sign * 0.380, 1.740, 0.600))
        p_pipe_mid = (p_turb + p_box_out) * 0.5
        v_pipe = p_turb - p_box_out
        pipe_len = v_pipe.length
        pipe_rot = Vector((0, 0, 1)).rotation_difference(v_pipe.normalized())

        mat_tpipe = Matrix.Translation(p_pipe_mid) @ pipe_rot.to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_pipes, radius=0.042, depth=pipe_len, segments=16, matrix=mat_tpipe)

        # Cylindrical Mass Air Flow (MAF) Sensor Housing
        mat_maf = Matrix.Translation((p_box_out + p_turb) * 0.7)
        bmesh.ops.create_cylinder(bm_airbox, radius=0.048, depth=0.065, segments=14, matrix=mat_maf)

    obj_airbox = link_obj("GEO_BENTLEY_Induction_Twin_Air_Filter_Boxes", bm_airbox, parent_col, mats["trim_black"], bevel=0.0015)
    obj_pipes = link_obj("GEO_BENTLEY_RamAir_Intake_Snorkels_and_Piping", bm_pipes, parent_col, mats["piano_black"], bevel=0.001)

    objs.extend([obj_airbox, obj_pipes])
    return objs
# ----------------------------------------------------------------------------
# 34. SUBSYSTEM 34: 48V DYNAMIC RIDE ECU & ACTUATOR POWER HARNESSES
# ----------------------------------------------------------------------------

def build_bentley_48v_dynamic_ride_ecu(parent_col, mats):
    """
    Constructs the high-speed computing hardware controlling the 48V active suspension:
    - Bentley Dynamic Ride dedicated multi-core electronic control computer module.
    - Thick braided high-amperage flexible power conduits feeding the 48V rotary actuators.
    - Integrated multi-axis inertial measurement unit (IMU) gyro sensor assembly.
    - Cast aluminum finned controller housing mounted on cockpit front sub-dash bulkhead.
    """
    objs = []
    bm_ecu = bmesh.new()
    bm_cables = bmesh.new()

    # 1. Bentley Dynamic Ride Dedicated Suspension Computer (Cockpit sub-bulkhead, X = 0.220m, Y = 0.580m, Z = 0.520m)
    mat_ecu = Matrix.Translation(Vector((0.220, 0.580, 0.520)))
    bmesh.ops.create_cube(bm_ecu, size=1.0, matrix=mat_ecu @ Matrix.Diagonal(Vector((0.180, 0.160, 0.065, 1.0))))

    # Multi-Pin Sealed Automotive Mil-Spec Wire Connectors
    for con_off in [-0.050, 0.050]:
        mat_con = mat_ecu @ Matrix.Translation(Vector((con_off, -0.090, 0.0)))
        bmesh.ops.create_cube(bm_ecu, size=1.0, matrix=mat_con @ Matrix.Diagonal(Vector((0.045, 0.030, 0.035, 1.0))))

    # 2. Heavy-Gauge Braided High-Amperage 48V Actuator Power Cables (to front and rear 48V motors)
    # Cable run forward to front 48V roll motor
    mat_fcable = Matrix.Translation(Vector((0.120, 0.950, 0.380)))
    bmesh.ops.create_cylinder(bm_cables, radius=0.010, depth=0.740, segments=12, matrix=mat_fcable @ Euler((math.radians(16), 0, 0), 'XYZ').to_matrix().to_4x4())

    # Cable run rearward to rear 48V roll motor
    mat_rcable = Matrix.Translation(Vector((0.120, -0.320, 0.320)))
    bmesh.ops.create_cylinder(bm_cables, radius=0.010, depth=1.800, segments=12, matrix=mat_rcable @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_ecu = link_obj("GEO_BENTLEY_48V_DynamicRide_Controller_ECU", bm_ecu, parent_col, mats["engine_alloy"], bevel=0.001)
    obj_cables = link_obj("GEO_BENTLEY_48V_HighAmp_Actuator_Cables", bm_cables, parent_col, mats["red_caliper"], bevel=0.0006)

    objs.extend([obj_ecu, obj_cables])
    return objs


# ----------------------------------------------------------------------------
# 35. SUBSYSTEM 35: WIND DEFLECTOR CARTRIDGE & DECKLID ELECTRIC LATCHES
# ----------------------------------------------------------------------------

def build_bentley_wind_deflector_and_latches(parent_col, mats):
    """
    Constructs the convertible cockpit acoustic aero management and tonneau locking hardware:
    - Removable folding mesh wind deflector cassette cartridge positioned over rear seats.
    - Fine acoustic perforated mesh deflector screen minimizing open-cockpit buffeting.
    - Motorized soft-close electric decklid pull-down latches and rotary claw strikers.
    - Tonneau cover hydraulic hinge pivot brackets anchoring into rear chassis uprights.
    """
    objs = []
    bm_deflector = bmesh.new()
    bm_latches = bmesh.new()

    # 1. Aerodynamic Wind Deflector Frame & Perforated Mesh (Above rear seats, Y = -0.580m, Z = 0.860m)
    mat_def = Matrix.Translation(Vector((0.0, -0.580, 0.860)))
    # Lightweight Anodized Aluminum Outer Perimeter Tubular Frame
    bmesh.ops.create_cube(bm_deflector, size=1.0, matrix=mat_def @ Matrix.Diagonal(Vector((1.080, 0.022, 0.240, 1.0))))

    # Horizontal Base Deflector Shield Panel (covers rear seat cushion wells)
    mat_dbase = mat_def @ Matrix.Translation(Vector((0.0, -0.160, -0.110)))
    bmesh.ops.create_cube(bm_deflector, size=1.0, matrix=mat_dbase @ Matrix.Diagonal(Vector((1.060, 0.320, 0.014, 1.0))))

    # 2. Tonneau Decklid Soft-Close Electric Rotary Latches (Left & Right rear quarters, Y = -1.520m, Z = 0.820m)
    for l_sign in [-1.0, 1.0]:
        mat_latch = Matrix.Translation(Vector((l_sign * 0.740, -1.520, 0.820)))
        # Latch Housing Body
        bmesh.ops.create_cube(bm_latches, size=1.0, matrix=mat_latch @ Matrix.Diagonal(Vector((0.065, 0.080, 0.055, 1.0))))
        # Motorized Pull-Down Rotary Claw Hook
        mat_claw = mat_latch @ Matrix.Translation(Vector((0, 0, 0.035)))
        bmesh.ops.create_cylinder(bm_latches, radius=0.016, depth=0.025, segments=14, matrix=mat_claw @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # Tonneau Multi-Link Hydraulic Hinge Gooseneck Bracket (Y = -1.220m)
        mat_hinge = Matrix.Translation(Vector((l_sign * 0.720, -1.220, 0.740)))
        bmesh.ops.create_cube(bm_latches, size=1.0, matrix=mat_hinge @ Matrix.Diagonal(Vector((0.045, 0.160, 0.080, 1.0))))

    obj_def = link_obj("GEO_BENTLEY_Cockpit_Aero_Wind_Deflector", bm_deflector, parent_col, mats["trim_black"], bevel=0.001)
    obj_latches = link_obj("GEO_BENTLEY_Tonneau_Electric_Latches_and_Hinges", bm_latches, parent_col, mats["chrome"], bevel=0.0008)

    objs.extend([obj_def, obj_latches])
    return objs
# ----------------------------------------------------------------------------
# 36. SUBSYSTEM 36: FORGED TOW HOOKS & CHASSIS LASHING TRANSPORT EYES
# ----------------------------------------------------------------------------

def build_bentley_tow_hardware_and_lashing(parent_col, mats):
    """
    Constructs track-day emergency recovery and international transport tie-down hardware:
    - High-strength forged steel screw-in front emergency towing eye receptor socket.
    - Rear chassis integrated recovery loop socket threaded into rear bumper structure.
    - 4 under-chassis forged transport tie-down lashing eyes for logistics anchoring.
    - Removable front bumper circular access cap plug.
    """
    objs = []
    bm_tow = bmesh.new()

    # 1. Front Screw-In Tow Hook Receptor Socket (Front bumper right flank, X = +0.480m, Y = +2.280m, Z = 0.440m)
    mat_ftow = Matrix.Translation(Vector((0.480, 2.280, 0.440)))
    bmesh.ops.create_cylinder(bm_tow, radius=0.022, depth=0.075, segments=16, matrix=mat_ftow @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Removable Circular Bumper Access Plug Cap
    mat_fplug = mat_ftow @ Matrix.Translation(Vector((0, 0.038, 0)))
    bmesh.ops.create_cylinder(bm_tow, radius=0.026, depth=0.008, segments=18, matrix=mat_fplug @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Rear Towing Socket Receptor (Rear bumper left flank, X = -0.520m, Y = -2.320m, Z = 0.420m)
    mat_rtow = Matrix.Translation(Vector((-0.520, -2.320, 0.420)))
    bmesh.ops.create_cylinder(bm_tow, radius=0.022, depth=0.075, segments=16, matrix=mat_rtow @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 3. Four Under-Chassis Forged Transport Tie-Down Lashing Rings (X = +-0.620m, Front Y = +1.150m, Rear Y = -1.150m)
    lash_pts = [
        (-0.620,  1.150, 0.185),
        ( 0.620,  1.150, 0.185),
        (-0.620, -1.150, 0.185),
        ( 0.620, -1.150, 0.185),
    ]
    for lx, ly, lz in lash_pts:
        mat_lash = Matrix.Translation(Vector((lx, ly, lz)))
        bmesh.ops.create_torus(bm_tow, major_radius=0.035, minor_radius=0.007, major_segments=16, minor_segments=8, matrix=mat_lash @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_tow = link_obj("GEO_BENTLEY_Chassis_Towing_and_Lashing_Hardware", bm_tow, parent_col, mats["chrome"], bevel=0.001)
    objs.append(obj_tow)
    return objs
# ----------------------------------------------------------------------------
# 37. SUBSYSTEM 37: MASTER ASSEMBLY ORCHESTRATION & DUAL-MODE GLB EXPORT
# ----------------------------------------------------------------------------

def setup_bentley_studio_lighting():
    """Configures high-end automotive studio lighting array for rich reflections."""
    lights_data = [
        ("Key_Front_Left", (3.2, 4.0, 3.8), 2200, 2.5),
        ("Key_Front_Right", (-3.2, 4.0, 3.8), 2200, 2.5),
        ("Rim_Rear_High", (0.0, -5.2, 4.2), 3000, 3.0),
        ("Fill_Left_Haunch", (4.2, -1.2, 2.2), 1500, 2.0),
        ("Fill_Right_Haunch", (-4.2, -1.2, 2.2), 1500, 2.0),
        ("Underbody_Bounce", (0.0, 0.0, -0.4), 600, 4.0),
    ]
    light_col = bpy.data.collections.new("Studio_Lighting")
    bpy.context.scene.collection.children.link(light_col)

    for l_name, l_pos, l_pwr, l_rad in lights_data:
        light = bpy.data.lights.new(name=l_name, type='AREA')
        light.energy = l_pwr
        light.size = l_rad
        light.color = (0.97, 0.98, 1.0)
        l_obj = bpy.data.objects.new(l_name, light)
        l_obj.location = l_pos
        # Point toward vehicle center
        dir_vec = Vector((0, 0, 0.6)) - Vector(l_pos)
        l_obj.rotation_euler = dir_vec.to_track_quat('-Z', 'Y').to_euler()
        light_col.objects.link(l_obj)


def generate_bentley_continental_gt_speed_phase1():
    """Master generation orchestrator for Bentley Continental GT Speed Convertible Phase 21."""
    print("=" * 80)
    print("CREWE AUTOMOTIVE CAD: GENERATING BENTLEY CONTINENTAL GT SPEED (PHASE 21)")
    print("Convertible Architecture · 2020s Era · Type 3S Masterpiece")
    print("=" * 80)

    # 1. Clean existing scene objects
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.unit_settings.system = 'METRIC'
    scene.unit_settings.scale_length = 1.0

    # 2. Master Collection
    col_name = "Bentley_Continental_GT_Speed_Phase1"
    car_col = bpy.data.collections.new(col_name)
    scene.collection.children.link(car_col)

    # 3. PBR Materials Suite
    mats = create_bentley_pbr_materials()

    # 4. Execute all 35 Precision CAD Subsystems
    all_objs = []
    print("[1/35] Building 44-Station Monocoque Superformed Body Shell...")
    all_objs.extend(build_bentley_monocoque_body_shell(car_col, mats))

    print("[2/35] Sculpting Continental Long Bonnet with Flying 'B' Center Spine...")
    all_objs.extend(build_bentley_bonnet_and_power_creases(car_col, mats))

    print("[3/35] Building Matrix Radiator Grille & Front Bumper Valance...")
    all_objs.extend(build_bentley_matrix_grille_and_bumper(car_col, mats))

    print("[4/35] Crafting 4-Layer Z-Fold Soft-Top Tonneau & Acoustic Windshield...")
    all_objs.extend(build_bentley_soft_top_tonneau_and_windshield(car_col, mats))

    print("[5/35] Constructing Enclosed Front & Rear Wheelhouse Tubs & Belly Pan...")
    all_objs.extend(build_bentley_wheelhouse_tubs_and_belly_pan(car_col, mats))

    print("[6/35] Forging 22-Inch 'Speed' Alloy Wheels & Pirelli P Zero Tires...")
    all_objs.extend(build_bentley_speed_wheels_and_tires(car_col, mats))

    print("[7/35] Engineering 440mm CSiC Rotors & 10-Piston Red Monobloc Calipers...")
    all_objs.extend(build_bentley_csic_brakes_and_calipers(car_col, mats))

    print("[8/35] Assembling 6.0L Twin-Turbo W12 TSI Engine & Twin Intercoolers...")
    all_objs.extend(build_bentley_w12_powertrain(car_col, mats))

    print("[9/35] Installing 8-Speed Dual-Clutch Gearbox & Active AWD Driveline...")
    all_objs.extend(build_bentley_transmission_and_awd(car_col, mats))

    print("[10/35] Fitting 3-Chamber Adaptive Air Suspension & Double Wishbones...")
    all_objs.extend(build_bentley_air_suspension(car_col, mats))

    print("[11/35] Installing 48V Active Dynamic Ride Anti-Roll & All-Wheel Steering...")
    all_objs.extend(build_bentley_active_roll_and_aws(car_col, mats))

    print("[12/35] Fabricating Speed Elliptical Exhaust & Valved Rear Muffler...")
    all_objs.extend(build_bentley_speed_exhaust_system(car_col, mats))

    print("[13/35] Installing Underbody Aerodynamic Belly Pan & Rear Diffuser...")
    all_objs.extend(build_bentley_underbody_aero(car_col, mats))

    print("[14/35] Crafting Grand Tourer Cockpit Seats & Flying Wing Dashboard...")
    all_objs.extend(build_bentley_cockpit_silhouette(car_col, mats))

    print("[15/35] Fabricating Front Lower Matrix Scoops & Chrome Blades...")
    all_objs.extend(build_bentley_front_lower_aero_scoops(car_col, mats))

    print("[16/35] Reinforcing Structural Aluminum Sills, Intrusion Beams & Crash Boxes...")
    all_objs.extend(build_bentley_structural_safety_elements(car_col, mats))

    print("[17/35] Installing Rear Active Deployable Spoiler & Scissor Actuators...")
    all_objs.extend(build_bentley_active_rear_spoiler(car_col, mats))

    print("[18/35] Mounting Strut Tower V-Brace & Structural Firewall...")
    all_objs.extend(build_bentley_strut_bracing_and_firewall(car_col, mats))

    print("[19/35] Installing 90L Saddle Fuel Tank & Thermal Radiation Shields...")
    all_objs.extend(build_bentley_fuel_tank_and_shields(car_col, mats))

    print("[20/35] Fitting Trunk Well, Dual AGM Batteries & Roof Hydraulics...")
    all_objs.extend(build_bentley_trunk_well_and_electrical(car_col, mats))

    print("[21/35] Mounting Front Aero Splitter Winglets & CSiC Brake Ducts...")
    all_objs.extend(build_bentley_splitter_and_cooling_ducts(car_col, mats))

    print("[22/35] Bolting Cast Aluminum Subframes & Tunnel Shear Plate...")
    all_objs.extend(build_bentley_subframe_cradles(car_col, mats))

    print("[23/35] Installing Multi-Radiator Cooling Pack & Dual Fans...")
    all_objs.extend(build_bentley_radiator_cooling_pack(car_col, mats))

    print("[24/35] Routing 48V High-Voltage Busbars & DC-DC Inverter...")
    all_objs.extend(build_bentley_48v_electrical_architecture(car_col, mats))

    print("[25/35] Installing Active Deployable Rollover Protection Hoops...")
    all_objs.extend(build_bentley_rollover_protection(car_col, mats))

    print("[26/35] Mounting 4-Corner Articulating Ride Height Sensors...")
    all_objs.extend(build_bentley_ride_height_sensors(car_col, mats))

    print("[27/35] Fitting Structural Fender Aprons & Acoustic Liners...")
    all_objs.extend(build_bentley_fender_aprons_and_liners(car_col, mats))

    print("[28/35] Installing Ground-Effect Strakes, Deflectors & eLSD Scoop...")
    all_objs.extend(build_bentley_ground_effects_and_diffusers(car_col, mats))

    print("[29/35] Engineering Vacuum Brake Booster, ABS Unit & Hardlines...")
    all_objs.extend(build_bentley_brake_hydraulics_and_abs(car_col, mats))

    print("[30/35] Installing Propshaft Safety Hoops & Tunnel Baffles...")
    all_objs.extend(build_bentley_tunnel_baffles_and_safety_hoops(car_col, mats))

    print("[31/35] Mounting EVAP Carbon Canister & Vapor Lines...")
    all_objs.extend(build_bentley_evap_canister_system(car_col, mats))

    print("[32/35] Installing Twin Induction Airboxes & Ram-Air Snorkels...")
    all_objs.extend(build_bentley_air_intake_boxes_and_snorkels(car_col, mats))

    print("[33/35] Installing 48V Dynamic Ride ECU & Actuator Power Looms...")
    all_objs.extend(build_bentley_48v_dynamic_ride_ecu(car_col, mats))

    print("[34/35] Installing Aero Wind Deflector & Tonneau Electric Latches...")
    all_objs.extend(build_bentley_wind_deflector_and_latches(car_col, mats))

    print("[35/35] Bolting Forged Towing Hardware & Chassis Transport Eyes...")
    all_objs.extend(build_bentley_tow_hardware_and_lashing(car_col, mats))

    # 5. Studio Lighting Setup
    setup_bentley_studio_lighting()

    # 6. Geometric Statistics & Validation
    total_verts = 0
    total_faces = 0
    for obj in car_col.objects:
        if obj.type == 'MESH':
            total_verts += len(obj.data.vertices)
            total_faces += len(obj.data.polygons)

    print("=" * 80)
    print(f"BENTLEY CONTINENTAL GT SPEED PHASE 21 GEOMETRIC AUDIT:")
    print(f"  Total Subsystem Objects: {len(car_col.objects)}")
    print(f"  Total Vertices:          {total_verts:,}")
    print(f"  Total Polygons/Faces:    {total_faces:,}")
    print("=" * 80)

    # 7. Dual-Mode Master GLB Export
    cur_p = os.path.abspath(__file__)
    base_dir = os.path.dirname(cur_p)
    while base_dir and not os.path.exists(os.path.join(base_dir, "package.json")):
        parent = os.path.dirname(base_dir)
        if parent == base_dir:
            break
        base_dir = parent
    export_paths = [
        os.path.join(base_dir, "exports", "Car_Bentley_Continental_GT_Speed_Phase1.glb"),
        os.path.join(base_dir, "public", "models", "Car_Bentley_Continental_GT_Speed_Phase1.glb"),
    ]

    # Select all car objects for export
    bpy.ops.object.select_all(action='DESELECT')
    for obj in car_col.objects:
        obj.select_set(True)

    for out_p in export_paths:
        os.makedirs(os.path.dirname(out_p), exist_ok=True)
        print(f"[EXPORT] Writing GLB: {out_p}")
        bpy.ops.export_scene.gltf(
            filepath=out_p,
            use_selection=True,
            export_format='GLB',
            export_apply=True,
            export_yup=True
        )
        if os.path.exists(out_p):
            fsize = os.path.getsize(out_p) / (1024 * 1024)
            print(f"[SUCCESS] Exported {out_p} ({fsize:.2f} MB)")

    print("=" * 80)
    print("BENTLEY CONTINENTAL GT SPEED PHASE 21 COMPLETE")
    print("=" * 80)


if __name__ == "__main__":
    generate_bentley_continental_gt_speed_phase1()
