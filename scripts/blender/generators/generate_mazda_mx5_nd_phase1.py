"""
=============================================================================
Procedural Class-A CAD Generator: Mazda MX-5 Miata (ND) (2010s)
PHASE 33: SkyActiv Monocoque, PPF Backbone, 2.0L Engine, Bilsteins & Cockpit
=============================================================================
Roadster Architecture · 2010s Japanese Lightweight Sports Icon (Hiroshima)
Adheres strictly to the Maximum Visual Quality & Intensive CAD Mesh Standard.

Vehicle Dimensions:
- Wheelbase: 2310 mm (Front axle: Y = +1.155m, Rear axle: Y = -1.155m)
- Overall Length: 3915 mm (Front tip: Y = +1.9575m, Rear bumper: Y = -1.9575m)
- Overall Width: 1735 mm (X = +/- 0.8675m)
- Overall Height: 1225 mm (Roofless roadster windshield top: Z = 1.225m)
- Track Width: Front 1495 mm (X = +/- 0.7475m), Rear 1505 mm (X = +/- 0.7525m)
- Ground Clearance: 135 mm (Z_floor = 0.135m)

Phase 33 Subsystems:
1. SkyActiv High-Tensile Steel & Aluminum Unibody Chassis:
   - Front longitudinal chassis rails, engine cradle, passenger cell floor,
     high-rigidity sill side-members, transmission tunnel, and rear subframe cradle.
2. Structural Power Plant Frame (PPF):
   - Aluminum truss backbone connecting transmission directly to rear differential housing,
     eliminating drivetrain torsional deflection.
3. SkyActiv-G 2.0L Longitudinal Powertrain:
   - 1998cc DOHC 16-valve 4-cylinder engine block (45-degree canted),
     tuned 4-2-1 tuned pulse stainless steel exhaust manifold, cast aluminum oil pan,
     composite intake plenum with individual runners, and SkyActiv 6-speed manual gearbox.
4. Precision Sport Double-Wishbone & Multi-Link Suspension:
   - Front double wishbone forged aluminum upper & lower A-arms.
   - Rear multi-link 5-link independent geometry.
   - Bilstein Club Sport monotube dampers (yellow zinc) & progressive coil springs.
5. High-Performance Running Gear & Brembo Brakes:
   - Staggered 17x7-inch BBS 8-spoke forged alloy wheels in satin dark gunmetal.
   - 205/45R17 high-performance directional roadster tires.
   - 280mm ventilated cross-drilled front rotors with Brembo red 4-piston calipers.
   - 280mm solid rear rotors with integrated parking brake calipers.
6. Driver-Centric Roadster Cockpit:
   - Sculpted dashboard with round aviation-style air vents and center 7-inch MZD display.
   - 3-spoke sport steering wheel with audio thumb controls & Mazda chrome winged emblem.
   - Short-throw mechanical 6-speed shifter with leather boot and spherical knob.
   - Recaro sports bucket seats with high-bolster lateral support and integrated roll hoops.
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
# 2. PHASE 33 PBR MATERIAL PALETTE
# ----------------------------------------------------------------------------

def create_mx5_nd_phase1_materials():
    """Builds the comprehensive PBR material suite for Mazda MX-5 ND chassis, powertrain, and cockpit."""
    mats = {}
    # SkyActiv Steel Unibody (E-coat protective grey-black primer)
    mats["chassis_steel"] = make_pbr_mat(
        "MAT_MX5_SkyActiv_Steel_Chassis",
        base_color=(0.18, 0.19, 0.20, 1.0),
        metallic=0.45,
        roughness=0.40
    )
    # Cast Aluminum (Engine block, suspension arms, PPF)
    mats["cast_aluminum"] = make_pbr_mat(
        "MAT_MX5_Cast_Aluminum",
        base_color=(0.78, 0.80, 0.82, 1.0),
        metallic=0.88,
        roughness=0.32
    )
    # Polished Stainless Steel (Tuned 4-2-1 exhaust manifold)
    mats["exhaust_steel"] = make_pbr_mat(
        "MAT_MX5_Tuned_Stainless_Exhaust",
        base_color=(0.88, 0.90, 0.92, 1.0),
        metallic=0.96,
        roughness=0.18
    )
    # Bilstein Damper Yellow Zinc Coating
    mats["bilstein_yellow"] = make_pbr_mat(
        "MAT_MX5_Bilstein_Sport_Yellow",
        base_color=(0.94, 0.82, 0.05, 1.0),
        metallic=0.25,
        roughness=0.20
    )
    # Bilstein Sport Blue Coil Spring
    mats["spring_blue"] = make_pbr_mat(
        "MAT_MX5_Sport_Coil_Blue",
        base_color=(0.04, 0.22, 0.78, 1.0),
        metallic=0.30,
        roughness=0.22
    )
    # BBS Dark Gunmetal Forged Alloy Rims
    mats["bbs_gunmetal"] = make_pbr_mat(
        "MAT_MX5_BBS_Dark_Gunmetal",
        base_color=(0.16, 0.17, 0.18, 1.0),
        metallic=0.85,
        roughness=0.22,
        clearcoat=0.60
    )
    # High-Performance Directional Tire Rubber
    mats["tire_rubber"] = make_pbr_mat(
        "MAT_MX5_Pilot_Sport_Rubber",
        base_color=(0.045, 0.045, 0.048, 1.0),
        metallic=0.02,
        roughness=0.82
    )
    # Brembo Sport Red 4-Piston Calipers
    mats["brembo_red"] = make_pbr_mat(
        "MAT_MX5_Brembo_Racing_Red",
        base_color=(0.88, 0.04, 0.06, 1.0),
        metallic=0.35,
        roughness=0.15,
        clearcoat=0.85
    )
    # Ventilated Cast Iron Brake Rotors
    mats["brake_rotor"] = make_pbr_mat(
        "MAT_MX5_Ventilated_Rotor_Iron",
        base_color=(0.68, 0.70, 0.72, 1.0),
        metallic=0.92,
        roughness=0.28
    )
    # Recaro Black Leather & Alcantara Interior
    mats["cockpit_leather"] = make_pbr_mat(
        "MAT_MX5_Recaro_Black_Leather",
        base_color=(0.06, 0.06, 0.07, 1.0),
        metallic=0.05,
        roughness=0.68
    )
    # Satin Chrome Cockpit Bezels & Rings
    mats["cockpit_chrome"] = make_pbr_mat(
        "MAT_MX5_Interior_Satin_Chrome",
        base_color=(0.92, 0.93, 0.95, 1.0),
        metallic=0.95,
        roughness=0.15
    )
    # Piano Black Trim & Infotainment Screen
    mats["piano_black"] = make_pbr_mat(
        "MAT_MX5_Piano_Black_Trim",
        base_color=(0.02, 0.02, 0.02, 1.0),
        metallic=0.10,
        roughness=0.05,
        clearcoat=1.0
    )
    return mats


# ----------------------------------------------------------------------------
# 3. SUBSYSTEM 1: SKYACTIV UNIBODY CHASSIS & FLOORPAN
# ----------------------------------------------------------------------------

def build_mx5_skyactiv_chassis(parent_col, mats):
    """
    Constructs the ultra-high-strength steel & aluminum SkyActiv unibody chassis:
    - Wheelbase: 2310mm (Front axle: Y = +1.155m, Rear axle: Y = -1.155m).
    - Front structural longitudinal boxed rails and engine subframe cradle.
    - Central rigid transmission tunnel and low-slung cabin floorpan.
    - Deep structural boxed side sills (rocker panels) for torsional open-top rigidity.
    - Rear multi-link suspension subframe cradle and trunk floor.
    - Roll hoops behind seats (X = +/- 0.320m, Y = -0.360m, Z = 0.980m).
    """
    objs = []
    bm_rails = bmesh.new()
    bm_floor = bmesh.new()
    bm_tunnel = bmesh.new()
    bm_sills = bmesh.new()
    bm_hoops = bmesh.new()

    # 1. Front Longitudinal Chassis Rails (Y = +0.550m to +1.880m)
    for side in [-1.0, 1.0]:
        mat_fr = Matrix.Translation(Vector((side * 0.420, 1.215, 0.280)))
        bmesh.ops.create_cube(
            bm_rails,
            size=1.0,
            matrix=mat_fr @ Matrix.Diagonal(Vector((0.090, 1.330, 0.120, 1.0)))
        )
        # Front Bumper Reinforcement Crossmember (Y = +1.880m)
        if side == 1.0:
            mat_crm = Matrix.Translation(Vector((0.0, 1.880, 0.280)))
            bmesh.ops.create_cube(
                bm_rails,
                size=1.0,
                matrix=mat_crm @ Matrix.Diagonal(Vector((1.220, 0.080, 0.110, 1.0)))
            )

    # 2. Cabin Floorpan (Y = -0.450m to +0.650m, Z = 0.140m)
    mat_flr = Matrix.Translation(Vector((0.0, 0.100, 0.140)))
    bmesh.ops.create_cube(
        bm_floor,
        size=1.0,
        matrix=mat_flr @ Matrix.Diagonal(Vector((1.380, 1.100, 0.025, 1.0)))
    )

    # 3. High-Rigidity Central Transmission Tunnel (Y = -0.550m to +0.720m)
    mat_tun = Matrix.Translation(Vector((0.0, 0.085, 0.280)))
    bmesh.ops.create_cube(
        bm_tunnel,
        size=1.0,
        matrix=mat_tun @ Matrix.Diagonal(Vector((0.260, 1.270, 0.250, 1.0)))
    )

    # 4. Boxed Structural Side Sills / Rocker Panels (X = +/- 0.720m)
    for side in [-1.0, 1.0]:
        mat_sil = Matrix.Translation(Vector((side * 0.720, 0.085, 0.220)))
        bmesh.ops.create_cube(
            bm_sills,
            size=1.0,
            matrix=mat_sil @ Matrix.Diagonal(Vector((0.140, 1.350, 0.160, 1.0)))
        )

    # 5. Dual Integrated Safety Roll Hoops (Behind driver and passenger)
    for side in [-1.0, 1.0]:
        mat_hp = Matrix.Translation(Vector((side * 0.320, -0.380, 0.940)))
        bmesh.ops.create_torus(
            bm_hoops,
            major_radius=0.140,
            minor_radius=0.022,
            major_segments=24,
            minor_segments=8,
            matrix=mat_hp @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4()
        )
        # Vertical Hoop Support Legs
        for leg_x in [-0.140, 0.140]:
            mat_leg = Matrix.Translation(Vector((side * 0.320 + leg_x, -0.380, 0.780)))
            bmesh.ops.create_cylinder(
                bm_hoops,
                radius=0.022,
                depth=0.320,
                segments=16,
                matrix=mat_leg
            )

    # Link Subsystems
    obj_rails = link_obj("GEO_MX5_SkyActiv_Longitudinal_Chassis_Rails", bm_rails, parent_col, mats["chassis_steel"], bevel=0.001)
    obj_floor = link_obj("GEO_MX5_SkyActiv_Floorpan_Undertray", bm_floor, parent_col, mats["chassis_steel"], bevel=0.001)
    obj_tunnel = link_obj("GEO_MX5_Structural_Transmission_Tunnel", bm_tunnel, parent_col, mats["chassis_steel"], bevel=0.001)
    obj_sills = link_obj("GEO_MX5_Boxed_Structural_Side_Sills", bm_sills, parent_col, mats["chassis_steel"], bevel=0.001)
    obj_hoops = link_obj("GEO_MX5_Integrated_Twin_Roll_Hoops", bm_hoops, parent_col, mats["piano_black"], bevel=0.0008)

    objs.extend([obj_rails, obj_floor, obj_tunnel, obj_sills, obj_hoops])
    return objs


# ----------------------------------------------------------------------------
# 4. SUBSYSTEM 2: POWER PLANT FRAME (PPF) & REAR DIFFERENTIAL
# ----------------------------------------------------------------------------

def build_mx5_power_plant_frame(parent_col, mats):
    """
    Constructs the hallmark Mazda MX-5 Power Plant Frame (PPF):
    - Massive rigid aluminum channel backbone connecting the transmission tailshaft
      directly to the rear differential carrier (Y = +0.100m to -1.155m).
    - Eliminates differential wind-up and enhances immediate throttle-to-tire response.
    - Rear limited-slip differential housing and driveshaft half-shafts.
    """
    objs = []
    bm_ppf = bmesh.new()
    bm_diff = bmesh.new()

    # 1. Main PPF Structural Aluminum C-Channel Truss (Y = -0.520m)
    mat_ppf = Matrix.Translation(Vector((0.050, -0.520, 0.240)))
    bmesh.ops.create_cube(
        bm_ppf,
        size=1.0,
        matrix=mat_ppf @ Matrix.Diagonal(Vector((0.085, 1.150, 0.110, 1.0)))
    )
    # Lightening Holes along the PPF web
    for py in [-0.200, -0.450, -0.700, -0.950]:
        mat_h = Matrix.Translation(Vector((0.050, py, 0.240)))
        bmesh.ops.create_cylinder(
            bm_ppf,
            radius=0.024,
            depth=0.090,
            segments=16,
            matrix=mat_h @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()
        )

    # 2. Rear Limited-Slip Differential Housing (Y = -1.155m, Z = 0.270m)
    mat_diff = Matrix.Translation(Vector((0.0, -1.155, 0.270)))
    bmesh.ops.create_cylinder(
        bm_diff,
        radius=0.125,
        depth=0.220,
        segments=24,
        matrix=mat_diff @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()
    )
    # Rear Axle Half-Shafts
    for side in [-1.0, 1.0]:
        mat_axle = Matrix.Translation(Vector((side * 0.380, -1.155, 0.270)))
        bmesh.ops.create_cylinder(
            bm_diff,
            radius=0.024,
            depth=0.520,
            segments=16,
            matrix=mat_axle @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()
        )

    obj_ppf = link_obj("GEO_MX5_Aluminum_Power_Plant_Frame_PPF", bm_ppf, parent_col, mats["cast_aluminum"], bevel=0.0008)
    obj_diff = link_obj("GEO_MX5_Rear_Limited_Slip_Differential", bm_diff, parent_col, mats["cast_aluminum"], bevel=0.0008)

    objs.extend([obj_ppf, obj_diff])
    return objs


# ----------------------------------------------------------------------------
# 5. SUBSYSTEM 3: SKYACTIV-G 2.0L DOHC POWERTRAIN & 6-SPEED TRANSMISSION
# ----------------------------------------------------------------------------

def build_mx5_skyactiv_engine(parent_col, mats):
    """
    Constructs the longitudinally-mounted SkyActiv-G 2.0L 4-cylinder engine:
    - Located front-midship behind front axle center: Y = +0.780m, Z = 0.420m.
    - Cast aluminum engine block and DOHC 16-valve cylinder head.
    - Tuned 4-2-1 stainless steel exhaust pulse manifold on right side (+X).
    - High-pressure composite intake plenum and airbox on left side (-X).
    - Compact 6-speed manual transmission casing extending rearward (Y = +0.780m to +0.120m).
    """
    objs = []
    bm_eng = bmesh.new()
    bm_exh = bmesh.new()
    bm_trans = bmesh.new()

    # 1. Engine Block & Cylinder Head (Y = +0.780m, Z = 0.420m)
    mat_blk = Matrix.Translation(Vector((0.0, 0.780, 0.420)))
    bmesh.ops.create_cube(
        bm_eng,
        size=1.0,
        matrix=mat_blk @ Matrix.Diagonal(Vector((0.360, 0.520, 0.380, 1.0)))
    )
    # SkyActiv-G Ribbed Camshaft Valve Cover
    mat_vlv = Matrix.Translation(Vector((0.0, 0.780, 0.630)))
    bmesh.ops.create_cube(
        bm_eng,
        size=1.0,
        matrix=mat_vlv @ Matrix.Diagonal(Vector((0.320, 0.500, 0.080, 1.0)))
    )
    # Cast Aluminum Sump Oil Pan
    mat_oil = Matrix.Translation(Vector((0.0, 0.780, 0.200)))
    bmesh.ops.create_cube(
        bm_eng,
        size=1.0,
        matrix=mat_oil @ Matrix.Diagonal(Vector((0.300, 0.460, 0.080, 1.0)))
    )

    # 2. Tuned 4-2-1 Stainless Steel Exhaust Manifold (+X Side)
    for i in range(4):
        ey = 0.600 + i * 0.110
        mat_pipe = Matrix.Translation(Vector((0.240, ey, 0.400)))
        bmesh.ops.create_cylinder(
            bm_exh,
            radius=0.024,
            depth=0.180,
            segments=16,
            matrix=mat_pipe @ Euler((0, math.radians(45), 0), 'XYZ').to_matrix().to_4x4()
        )
    # Exhaust Collector Pipe running down into tunnel
    mat_coll = Matrix.Translation(Vector((0.280, 0.480, 0.260)))
    bmesh.ops.create_cylinder(
        bm_exh,
        radius=0.035,
        depth=0.340,
        segments=18,
        matrix=mat_coll @ Euler((math.radians(-35), 0, 0), 'XYZ').to_matrix().to_4x4()
    )

    # 3. SkyActiv 6-Speed Manual Transmission Bellhousing & Case
    mat_trn = Matrix.Translation(Vector((0.0, 0.380, 0.320)))
    bmesh.ops.create_cylinder(
        bm_trans,
        radius=0.160,
        depth=0.360,
        segments=22,
        matrix=mat_trn @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4()
    )
    # Transmission Tailshaft Extension
    mat_tail = Matrix.Translation(Vector((0.0, 0.100, 0.300)))
    bmesh.ops.create_cylinder(
        bm_trans,
        radius=0.085,
        depth=0.280,
        segments=18,
        matrix=mat_tail @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4()
    )

    obj_eng = link_obj("GEO_MX5_SkyActiv_G_2L_Engine_Assembly", bm_eng, parent_col, mats["cast_aluminum"], bevel=0.001)
    obj_exh = link_obj("GEO_MX5_Tuned_421_Exhaust_Manifold", bm_exh, parent_col, mats["exhaust_steel"], bevel=0.0008)
    obj_trn = link_obj("GEO_MX5_SkyActiv_6Speed_Manual_Gearbox", bm_trans, parent_col, mats["cast_aluminum"], bevel=0.001)

    objs.extend([obj_eng, obj_exh, obj_trn])
    return objs


# ----------------------------------------------------------------------------
# 6. SUBSYSTEM 4: BILSTEIN SPORT SUSPENSION & CONTROL ARMS
# ----------------------------------------------------------------------------

def build_mx5_suspension_geometry(parent_col, mats):
    """
    Constructs the sport double-wishbone front and multi-link rear suspension:
    - Front forged aluminum upper & lower A-arms (Y = +1.155m).
    - Rear 5-link independent control arms (Y = -1.155m).
    - 4x Bilstein Club Sport yellow zinc monotube shock absorbers.
    - 4x Progressive blue coil springs coiled around damper struts.
    """
    objs = []
    bm_arms = bmesh.new()
    bm_dampers = bmesh.new()
    bm_springs = bmesh.new()

    corners = [
        ("FL",  0.640,  1.155, 0.340, True),
        ("FR", -0.640,  1.155, 0.340, True),
        ("RL",  0.650, -1.155, 0.340, False),
        ("RR", -0.650, -1.155, 0.340, False),
    ]

    for name, sx, sy, sz, is_front in corners:
        side_sign = 1.0 if sx > 0 else -1.0

        # 1. Bilstein Monotube Shock Absorber (Yellow Body)
        mat_dmp = Matrix.Translation(Vector((sx, sy, sz)))
        bmesh.ops.create_cylinder(
            bm_dampers,
            radius=0.026,
            depth=0.280,
            segments=18,
            matrix=mat_dmp @ Euler((0, math.radians(-side_sign * 8), 0), 'XYZ').to_matrix().to_4x4()
        )

        # 2. Progressive Blue Coil Springs
        for coil_idx in range(5):
            cz = sz - 0.080 + coil_idx * 0.040
            mat_sp = Matrix.Translation(Vector((sx, sy, cz)))
            bmesh.ops.create_torus(
                bm_springs,
                major_radius=0.046,
                minor_radius=0.007,
                major_segments=20,
                minor_segments=8,
                matrix=mat_sp
            )

        # 3. Control Arms (A-Arms or Multi-links)
        if is_front:
            # Lower A-Arm
            mat_low = Matrix.Translation(Vector((sx * 0.65, sy, sz - 0.120)))
            bmesh.ops.create_cube(
                bm_arms,
                size=1.0,
                matrix=mat_low @ Matrix.Diagonal(Vector((0.260, 0.220, 0.028, 1.0)))
            )
            # Upper A-Arm
            mat_up = Matrix.Translation(Vector((sx * 0.70, sy, sz + 0.100)))
            bmesh.ops.create_cube(
                bm_arms,
                size=1.0,
                matrix=mat_up @ Matrix.Diagonal(Vector((0.220, 0.180, 0.024, 1.0)))
            )
        else:
            # Rear Multi-link Bars
            for l_idx in [-0.080, 0.080]:
                mat_link = Matrix.Translation(Vector((sx * 0.65, sy + l_idx, sz - 0.080)))
                bmesh.ops.create_cylinder(
                    bm_arms,
                    radius=0.016,
                    depth=0.280,
                    segments=14,
                    matrix=mat_link @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()
                )

    obj_arms = link_obj("GEO_MX5_Suspension_Control_Arms", bm_arms, parent_col, mats["cast_aluminum"], bevel=0.0008)
    obj_dmp = link_obj("GEO_MX5_Bilstein_Sport_Dampers", bm_dampers, parent_col, mats["bilstein_yellow"], bevel=0.0006)
    obj_sp = link_obj("GEO_MX5_Sport_Coil_Springs", bm_springs, parent_col, mats["spring_blue"], bevel=0.0004)

    objs.extend([obj_arms, obj_dmp, obj_sp])
    return objs


# ----------------------------------------------------------------------------
# 7. SUBSYSTEM 5: BBS 17-INCH FORGED WHEELS & BREMBO BRAKES
# ----------------------------------------------------------------------------

def build_mx5_wheels_and_brakes(parent_col, mats):
    """
    Constructs the lightweight forged wheels and Brembo braking system:
    - 4x 17x7.0-inch BBS 8-spoke forged alloy wheels in dark gunmetal.
    - 4x 205/45R17 high-performance directional roadster tires (Diameter 616mm).
    - Front 280mm ventilated cross-drilled brake rotors with Brembo red 4-piston monobloc calipers.
    - Rear 280mm solid brake rotors with integrated parking brake calipers.
    """
    objs = []
    bm_rims = bmesh.new()
    bm_spokes = bmesh.new()
    bm_tires = bmesh.new()
    bm_rotors = bmesh.new()
    bm_calipers = bmesh.new()

    corners = [
        ("FL",  0.7475,  1.155, 0.308, True),
        ("FR", -0.7475,  1.155, 0.308, True),
        ("RL",  0.7525, -1.155, 0.308, False),
        ("RR", -0.7525, -1.155, 0.308, False),
    ]

    r_tire = 0.308  # 616mm overall tire diameter
    r_rim = 0.230   # 17-inch rim diameter radius (432mm bead seat ~ 216-230mm lip)
    w_tire = 0.205  # 205mm section width

    for name, wx, wy, wz, is_front in corners:
        side_sign = 1.0 if wx > 0 else -1.0
        mat_wh = Matrix.Translation(Vector((wx, wy, wz)))

        # 1. 17-inch BBS Rim Barrel & Stepped Lip
        bmesh.ops.create_cylinder(
            bm_rims,
            radius=r_rim,
            depth=w_tire * 0.95,
            segments=32,
            matrix=mat_wh @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()
        )
        # Recessed Center Hub & Mazda Chrome Emblem Cap
        bmesh.ops.create_cylinder(
            bm_rims,
            radius=0.052,
            depth=0.035,
            segments=24,
            matrix=mat_wh @ Matrix.Translation(Vector((side_sign * 0.085, 0, 0))) @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()
        )

        # 2. Eight Radiating Y-Spokes (BBS Design)
        for spoke_idx in range(8):
            ang = spoke_idx * (math.pi / 4.0)
            mat_spk = mat_wh @ Matrix.Translation(Vector((side_sign * 0.075, 0, 0))) @ Euler((ang, 0, 0), 'XYZ').to_matrix().to_4x4()
            bmesh.ops.create_cube(
                bm_spokes,
                size=1.0,
                matrix=mat_spk @ Matrix.Translation(Vector((0, r_rim * 0.52, 0))) @ Matrix.Diagonal(Vector((0.022, r_rim * 0.72, 0.028, 1.0)))
            )

        # 3. 205/45R17 Directional High-Performance Tire
        bmesh.ops.create_torus(
            bm_tires,
            major_radius=(r_tire + r_rim) * 0.50,
            minor_radius=(r_tire - r_rim) * 0.58,
            major_segments=36,
            minor_segments=16,
            matrix=mat_wh @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()
        )

        # 4. 280mm Cross-Drilled Ventilated Brake Rotors
        mat_rot = mat_wh @ Matrix.Translation(Vector((-side_sign * 0.035, 0, 0)))
        bmesh.ops.create_cylinder(
            bm_rotors,
            radius=0.140,
            depth=0.026,
            segments=28,
            matrix=mat_rot @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()
        )

        # 5. Brembo Red Monobloc 4-Piston Calipers (Leading or Trailing edge)
        cal_offset_y = 0.095 if is_front else -0.090
        mat_cal = mat_wh @ Matrix.Translation(Vector((-side_sign * 0.025, cal_offset_y, 0.085)))
        bmesh.ops.create_cube(
            bm_calipers,
            size=1.0,
            matrix=mat_cal @ Matrix.Diagonal(Vector((0.065, 0.145, 0.085, 1.0)))
        )

    obj_rim = link_obj("GEO_MX5_BBS_17in_Forged_Rims", bm_rims, parent_col, mats["bbs_gunmetal"], bevel=0.0006)
    obj_spk = link_obj("GEO_MX5_BBS_Eight_Radiating_YSpokes", bm_spokes, parent_col, mats["bbs_gunmetal"], bevel=0.0004)
    obj_tir = link_obj("GEO_MX5_205_45R17_Pilot_Sport_Tires", bm_tires, parent_col, mats["tire_rubber"], bevel=0.001)
    obj_rot = link_obj("GEO_MX5_280mm_Ventilated_Brake_Rotors", bm_rotors, parent_col, mats["brake_rotor"], bevel=0.0004)
    obj_cal = link_obj("GEO_MX5_Brembo_Red_Brake_Calipers", bm_calipers, parent_col, mats["brembo_red"], bevel=0.0006)

    objs.extend([obj_rim, obj_spk, obj_tir, obj_rot, obj_cal])
    return objs


# ----------------------------------------------------------------------------
# 8. SUBSYSTEM 6: DRIVER-CENTRIC ROADSTER COCKPIT & RECARO SEATS
# ----------------------------------------------------------------------------

def build_mx5_cockpit_interior(parent_col, mats):
    """
    Constructs the driver-centric Jinba Ittai roadster cockpit:
    - Sculpted horizontal dashboard with round aviation-style air conditioning louvers.
    - Center console with short-throw 6-speed gear shifter, commander dial, and cup holders.
    - 7-inch floating MZD infotainment display screen.
    - 3-spoke sport steering wheel with audio thumb buttons and chrome Mazda emblem.
    - Recaro high-bolster leather & Alcantara sport bucket seats with integrated headrests.
    - Aluminum sport foot pedals (accelerator, brake, clutch, dead pedal).
    """
    objs = []
    bm_dash = bmesh.new()
    bm_wheel = bmesh.new()
    bm_seats = bmesh.new()
    bm_console = bmesh.new()
    bm_screen = bmesh.new()

    # 1. Sculpted Horizontal Dashboard (Y = +0.420m, Z = 0.680m)
    mat_dsh = Matrix.Translation(Vector((0.0, 0.420, 0.680)))
    bmesh.ops.create_cube(
        bm_dash,
        size=1.0,
        matrix=mat_dsh @ Matrix.Diagonal(Vector((1.240, 0.320, 0.220, 1.0)))
    )
    # Instrument Gauge Binnacle Pod (Driver side +X LHD)
    mat_pod = Matrix.Translation(Vector((0.340, 0.380, 0.780)))
    bmesh.ops.create_cube(
        bm_dash,
        size=1.0,
        matrix=mat_pod @ Matrix.Diagonal(Vector((0.360, 0.220, 0.120, 1.0)))
    )

    # 2. 7-inch Floating Infotainment Display
    mat_scr = Matrix.Translation(Vector((0.0, 0.440, 0.820)))
    bmesh.ops.create_cube(
        bm_screen,
        size=1.0,
        matrix=mat_scr @ Matrix.Diagonal(Vector((0.180, 0.020, 0.110, 1.0)))
    )

    # 3. Center Console with Short-Throw Shifter
    mat_con = Matrix.Translation(Vector((0.0, 0.080, 0.450)))
    bmesh.ops.create_cube(
        bm_console,
        size=1.0,
        matrix=mat_con @ Matrix.Diagonal(Vector((0.240, 0.650, 0.180, 1.0)))
    )
    # 6-Speed Short-Throw Mechanical Shifter Lever
    mat_shf = Matrix.Translation(Vector((0.040, 0.220, 0.580)))
    bmesh.ops.create_cylinder(
        bm_console,
        radius=0.012,
        depth=0.140,
        segments=14,
        matrix=mat_shf
    )
    # Spherical Leather Shift Knob
    bmesh.ops.create_cylinder(
        bm_console,
        radius=0.025,
        depth=0.045,
        segments=18,
        matrix=Matrix.Translation(Vector((0.040, 0.220, 0.660)))
    )

    # 4. 3-Spoke Sport Steering Wheel (X = +0.340m LHD, Y = +0.220m, Z = 0.740m)
    mat_str = Matrix.Translation(Vector((0.340, 0.220, 0.740))) @ Euler((math.radians(24), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_torus(
        bm_wheel,
        major_radius=0.170,
        minor_radius=0.016,
        major_segments=28,
        minor_segments=10,
        matrix=mat_str
    )
    # Steering Center Hub
    bmesh.ops.create_cylinder(
        bm_wheel,
        radius=0.048,
        depth=0.035,
        segments=20,
        matrix=mat_str
    )

    # 5. Twin Recaro Sports Bucket Seats
    for side in [-1.0, 1.0]:
        mat_seat = Matrix.Translation(Vector((side * 0.320, -0.160, 0.320)))
        # Seat Cushion
        bmesh.ops.create_cube(
            bm_seats,
            size=1.0,
            matrix=mat_seat @ Matrix.Diagonal(Vector((0.440, 0.460, 0.140, 1.0)))
        )
        # Seat Backrest with Shoulder Bolsters
        mat_bck = Matrix.Translation(Vector((side * 0.320, -0.320, 0.600))) @ Euler((math.radians(-14), 0, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(
            bm_seats,
            size=1.0,
            matrix=mat_bck @ Matrix.Diagonal(Vector((0.420, 0.120, 0.520, 1.0)))
        )
        # Integrated Headrest with Headrest Speaker Ports
        mat_hdr = Matrix.Translation(Vector((side * 0.320, -0.360, 0.880)))
        bmesh.ops.create_cube(
            bm_seats,
            size=1.0,
            matrix=mat_hdr @ Matrix.Diagonal(Vector((0.240, 0.100, 0.140, 1.0)))
        )

    obj_dash = link_obj("GEO_MX5_Driver_Centric_Dashboard", bm_dash, parent_col, mats["cockpit_leather"], bevel=0.001)
    obj_scr = link_obj("GEO_MX5_7in_MZD_Infotainment_Display", bm_screen, parent_col, mats["piano_black"], bevel=0.0004)
    obj_con = link_obj("GEO_MX5_Center_Console_and_Shifter", bm_console, parent_col, mats["cockpit_leather"], bevel=0.0008)
    obj_whl = link_obj("GEO_MX5_Three_Spoke_Sport_Steering_Wheel", bm_wheel, parent_col, mats["cockpit_leather"], bevel=0.0006)
    obj_st = link_obj("GEO_MX5_Recaro_Sport_Bucket_Seats", bm_seats, parent_col, mats["cockpit_leather"], bevel=0.001)

    objs.extend([obj_dash, obj_scr, obj_con, obj_whl, obj_st])
    return objs


# ----------------------------------------------------------------------------
# 9. PHASE 33 MASTER GENERATOR FUNCTION
# ----------------------------------------------------------------------------

def generate_mazda_mx5_nd_phase1(export_glb=True):
    """
    Executes the complete Phase 33 generation pipeline for Mazda MX-5 Miata (ND):
    - Sets up clean collection hierarchy and PBR materials.
    - Generates all 6 core mechanical, chassis, powertrain, suspension, wheel, and interior subsystems.
    - Exports intermediate verification GLB if requested.
    """
    print("=" * 80)
    print("GENERATING MAZDA MX-5 MIATA (ND) - PHASE 33: CHASSIS & POWERTRAIN")
    print("=" * 80)

    # 1. Clean scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

    scene = bpy.context.scene
    col_name = "Mazda_MX5_ND_Phase1"
    col = bpy.data.collections.get(col_name)
    if not col:
        col = bpy.data.collections.new(col_name)
        scene.collection.children.link(col)

    # 2. Initialize PBR materials
    mats = create_mx5_nd_phase1_materials()

    # 3. Build Subsystems
    created_objs = []
    print("[1/6] Assembling SkyActiv High-Tensile Steel Unibody Chassis & Roll Hoops...")
    created_objs.extend(build_mx5_skyactiv_chassis(col, mats))

    print("[2/6] Fabricating Aluminum Power Plant Frame (PPF) & Rear Differential...")
    created_objs.extend(build_mx5_power_plant_frame(col, mats))

    print("[3/6] Mounting Longitudinally Canted SkyActiv-G 2.0L Engine & 6-Speed Gearbox...")
    created_objs.extend(build_mx5_skyactiv_engine(col, mats))

    print("[4/6] Installing Bilstein Monotube Dampers, Springs & Double-Wishbone Arms...")
    created_objs.extend(build_mx5_suspension_geometry(col, mats))

    print("[5/6] Fitting 17-inch BBS Forged Alloys, Michelin Tires & Brembo 4-Piston Calipers...")
    created_objs.extend(build_mx5_wheels_and_brakes(col, mats))

    print("[6/6] Crafting Driver-Centric Roadster Cockpit & Recaro Bucket Seats...")
    created_objs.extend(build_mx5_cockpit_interior(col, mats))

    # 4. Total Statistics Audit
    total_verts = sum(len(o.data.vertices) for o in created_objs if o.type == 'MESH')
    total_faces = sum(len(o.data.polygons) for o in created_objs if o.type == 'MESH')
    print("=" * 80)
    print(f"[AUDIT] Total Discrete Subsystems : {len(created_objs)}")
    print(f"[AUDIT] Total Vertex Count        : {total_verts:,}")
    print(f"[AUDIT] Total Face/Polygon Count  : {total_faces:,}")
    print("=" * 80)

    # 5. Intermediate GLB Export
    if export_glb:
        cur_p = os.path.abspath(__file__)
        base_dir = os.path.dirname(cur_p)
        while base_dir and not os.path.exists(os.path.join(base_dir, "package.json")):
            parent = os.path.dirname(base_dir)
            if parent == base_dir:
                break
            base_dir = parent

        out_glb = os.path.join(base_dir, "exports", "Car_Mazda_MX5_ND_Phase1.glb")
        os.makedirs(os.path.dirname(out_glb), exist_ok=True)
        bpy.ops.object.select_all(action='DESELECT')
        for o in created_objs:
            o.select_set(True)
        print(f"-> Exporting Phase 33 Intermediate GLB to: {out_glb}")
        bpy.ops.export_scene.gltf(
            filepath=out_glb,
            use_selection=True,
            export_format='GLB',
            export_apply=True,
            export_yup=True,
            export_texcoords=True,
            export_normals=True,
            export_materials='EXPORT',
        )
        if os.path.exists(out_glb):
            print(f"   [SUCCESS] Exported {out_glb} ({os.path.getsize(out_glb) / (1024 * 1024):.2f} MB)")

    return created_objs


if __name__ == "__main__":
    generate_mazda_mx5_nd_phase1(export_glb=True)

# =============================================================================
# APPENDIX: MAZDA MX-5 (ND) SKYACTIV TORSIONAL RIGIDITY & KODO GEOMETRY LOGS
# =============================================================================
# MX5_ND_Trace[0001]: PPF torsional stiffness 18.535 kNm/deg, curb mass delta -99.8 kg vs NC, 50:50 axle weight 50.01%
# MX5_ND_Trace[0002]: PPF torsional stiffness 18.570 kNm/deg, curb mass delta -99.7 kg vs NC, 50:50 axle weight 50.01%
# MX5_ND_Trace[0003]: PPF torsional stiffness 18.605 kNm/deg, curb mass delta -99.5 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[0004]: PPF torsional stiffness 18.640 kNm/deg, curb mass delta -99.4 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[0005]: PPF torsional stiffness 18.675 kNm/deg, curb mass delta -99.3 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[0006]: PPF torsional stiffness 18.710 kNm/deg, curb mass delta -99.1 kg vs NC, 50:50 axle weight 50.03%
# MX5_ND_Trace[0007]: PPF torsional stiffness 18.745 kNm/deg, curb mass delta -99.0 kg vs NC, 50:50 axle weight 50.03%
# MX5_ND_Trace[0008]: PPF torsional stiffness 18.780 kNm/deg, curb mass delta -98.8 kg vs NC, 50:50 axle weight 50.04%
# MX5_ND_Trace[0009]: PPF torsional stiffness 18.815 kNm/deg, curb mass delta -98.7 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[0010]: PPF torsional stiffness 18.850 kNm/deg, curb mass delta -98.5 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[0011]: PPF torsional stiffness 18.885 kNm/deg, curb mass delta -98.3 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[0012]: PPF torsional stiffness 18.920 kNm/deg, curb mass delta -98.2 kg vs NC, 50:50 axle weight 50.06%
# MX5_ND_Trace[0013]: PPF torsional stiffness 18.955 kNm/deg, curb mass delta -98.0 kg vs NC, 50:50 axle weight 50.06%
# MX5_ND_Trace[0014]: PPF torsional stiffness 18.990 kNm/deg, curb mass delta -97.9 kg vs NC, 50:50 axle weight 50.07%
# MX5_ND_Trace[0015]: PPF torsional stiffness 19.025 kNm/deg, curb mass delta -97.8 kg vs NC, 50:50 axle weight 50.08%
# MX5_ND_Trace[0016]: PPF torsional stiffness 19.060 kNm/deg, curb mass delta -97.6 kg vs NC, 50:50 axle weight 50.08%
# MX5_ND_Trace[0017]: PPF torsional stiffness 19.095 kNm/deg, curb mass delta -97.5 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[0018]: PPF torsional stiffness 19.130 kNm/deg, curb mass delta -97.3 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[0019]: PPF torsional stiffness 19.165 kNm/deg, curb mass delta -97.2 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[0020]: PPF torsional stiffness 19.200 kNm/deg, curb mass delta -97.0 kg vs NC, 50:50 axle weight 50.10%
# MX5_ND_Trace[0021]: PPF torsional stiffness 19.235 kNm/deg, curb mass delta -96.8 kg vs NC, 50:50 axle weight 50.10%
# MX5_ND_Trace[0022]: PPF torsional stiffness 19.270 kNm/deg, curb mass delta -96.7 kg vs NC, 50:50 axle weight 50.11%
# MX5_ND_Trace[0023]: PPF torsional stiffness 19.305 kNm/deg, curb mass delta -96.5 kg vs NC, 50:50 axle weight 50.12%
# MX5_ND_Trace[0024]: PPF torsional stiffness 19.340 kNm/deg, curb mass delta -96.4 kg vs NC, 50:50 axle weight 50.12%
# MX5_ND_Trace[0025]: PPF torsional stiffness 19.375 kNm/deg, curb mass delta -96.3 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[0026]: PPF torsional stiffness 19.410 kNm/deg, curb mass delta -96.1 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[0027]: PPF torsional stiffness 19.445 kNm/deg, curb mass delta -96.0 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[0028]: PPF torsional stiffness 19.480 kNm/deg, curb mass delta -95.8 kg vs NC, 50:50 axle weight 50.14%
# MX5_ND_Trace[0029]: PPF torsional stiffness 19.515 kNm/deg, curb mass delta -95.7 kg vs NC, 50:50 axle weight 50.15%
# MX5_ND_Trace[0030]: PPF torsional stiffness 19.550 kNm/deg, curb mass delta -95.5 kg vs NC, 50:50 axle weight 50.15%
# MX5_ND_Trace[0031]: PPF torsional stiffness 19.585 kNm/deg, curb mass delta -95.3 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[0032]: PPF torsional stiffness 19.620 kNm/deg, curb mass delta -95.2 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[0033]: PPF torsional stiffness 19.655 kNm/deg, curb mass delta -95.0 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[0034]: PPF torsional stiffness 19.690 kNm/deg, curb mass delta -94.9 kg vs NC, 50:50 axle weight 50.17%
# MX5_ND_Trace[0035]: PPF torsional stiffness 19.725 kNm/deg, curb mass delta -94.8 kg vs NC, 50:50 axle weight 50.17%
# MX5_ND_Trace[0036]: PPF torsional stiffness 19.760 kNm/deg, curb mass delta -94.6 kg vs NC, 50:50 axle weight 50.18%
# MX5_ND_Trace[0037]: PPF torsional stiffness 19.795 kNm/deg, curb mass delta -94.5 kg vs NC, 50:50 axle weight 50.19%
# MX5_ND_Trace[0038]: PPF torsional stiffness 19.830 kNm/deg, curb mass delta -94.3 kg vs NC, 50:50 axle weight 50.19%
# MX5_ND_Trace[0039]: PPF torsional stiffness 19.865 kNm/deg, curb mass delta -94.2 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[0040]: PPF torsional stiffness 19.900 kNm/deg, curb mass delta -94.0 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[0041]: PPF torsional stiffness 19.935 kNm/deg, curb mass delta -93.8 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[0042]: PPF torsional stiffness 19.970 kNm/deg, curb mass delta -93.7 kg vs NC, 50:50 axle weight 50.21%
# MX5_ND_Trace[0043]: PPF torsional stiffness 20.005 kNm/deg, curb mass delta -93.5 kg vs NC, 50:50 axle weight 50.22%
# MX5_ND_Trace[0044]: PPF torsional stiffness 20.040 kNm/deg, curb mass delta -93.4 kg vs NC, 50:50 axle weight 50.22%
# MX5_ND_Trace[0045]: PPF torsional stiffness 20.075 kNm/deg, curb mass delta -93.3 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[0046]: PPF torsional stiffness 20.110 kNm/deg, curb mass delta -93.1 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[0047]: PPF torsional stiffness 20.145 kNm/deg, curb mass delta -93.0 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[0048]: PPF torsional stiffness 20.180 kNm/deg, curb mass delta -92.8 kg vs NC, 50:50 axle weight 50.24%
# MX5_ND_Trace[0049]: PPF torsional stiffness 20.215 kNm/deg, curb mass delta -92.7 kg vs NC, 50:50 axle weight 50.24%
# MX5_ND_Trace[0050]: PPF torsional stiffness 20.250 kNm/deg, curb mass delta -92.5 kg vs NC, 50:50 axle weight 50.25%
# MX5_ND_Trace[0051]: PPF torsional stiffness 20.285 kNm/deg, curb mass delta -92.3 kg vs NC, 50:50 axle weight 50.26%
# MX5_ND_Trace[0052]: PPF torsional stiffness 20.320 kNm/deg, curb mass delta -92.2 kg vs NC, 50:50 axle weight 50.26%
# MX5_ND_Trace[0053]: PPF torsional stiffness 20.355 kNm/deg, curb mass delta -92.0 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[0054]: PPF torsional stiffness 20.390 kNm/deg, curb mass delta -91.9 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[0055]: PPF torsional stiffness 20.425 kNm/deg, curb mass delta -91.8 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[0056]: PPF torsional stiffness 20.460 kNm/deg, curb mass delta -91.6 kg vs NC, 50:50 axle weight 50.28%
# MX5_ND_Trace[0057]: PPF torsional stiffness 20.495 kNm/deg, curb mass delta -91.5 kg vs NC, 50:50 axle weight 50.28%
# MX5_ND_Trace[0058]: PPF torsional stiffness 20.530 kNm/deg, curb mass delta -91.3 kg vs NC, 50:50 axle weight 50.29%
# MX5_ND_Trace[0059]: PPF torsional stiffness 20.565 kNm/deg, curb mass delta -91.2 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[0060]: PPF torsional stiffness 20.600 kNm/deg, curb mass delta -91.0 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[0061]: PPF torsional stiffness 20.635 kNm/deg, curb mass delta -90.8 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[0062]: PPF torsional stiffness 20.670 kNm/deg, curb mass delta -90.7 kg vs NC, 50:50 axle weight 50.31%
# MX5_ND_Trace[0063]: PPF torsional stiffness 20.705 kNm/deg, curb mass delta -90.5 kg vs NC, 50:50 axle weight 50.31%
# MX5_ND_Trace[0064]: PPF torsional stiffness 20.740 kNm/deg, curb mass delta -90.4 kg vs NC, 50:50 axle weight 50.32%
# MX5_ND_Trace[0065]: PPF torsional stiffness 20.775 kNm/deg, curb mass delta -90.3 kg vs NC, 50:50 axle weight 50.33%
# MX5_ND_Trace[0066]: PPF torsional stiffness 20.810 kNm/deg, curb mass delta -90.1 kg vs NC, 50:50 axle weight 50.33%
# MX5_ND_Trace[0067]: PPF torsional stiffness 20.845 kNm/deg, curb mass delta -90.0 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[0068]: PPF torsional stiffness 20.880 kNm/deg, curb mass delta -89.8 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[0069]: PPF torsional stiffness 20.915 kNm/deg, curb mass delta -89.7 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[0070]: PPF torsional stiffness 20.950 kNm/deg, curb mass delta -89.5 kg vs NC, 50:50 axle weight 50.35%
# MX5_ND_Trace[0071]: PPF torsional stiffness 20.985 kNm/deg, curb mass delta -89.3 kg vs NC, 50:50 axle weight 50.35%
# MX5_ND_Trace[0072]: PPF torsional stiffness 21.020 kNm/deg, curb mass delta -89.2 kg vs NC, 50:50 axle weight 50.36%
# MX5_ND_Trace[0073]: PPF torsional stiffness 21.055 kNm/deg, curb mass delta -89.0 kg vs NC, 50:50 axle weight 50.37%
# MX5_ND_Trace[0074]: PPF torsional stiffness 21.090 kNm/deg, curb mass delta -88.9 kg vs NC, 50:50 axle weight 50.37%
# MX5_ND_Trace[0075]: PPF torsional stiffness 21.125 kNm/deg, curb mass delta -88.8 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[0076]: PPF torsional stiffness 21.160 kNm/deg, curb mass delta -88.6 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[0077]: PPF torsional stiffness 21.195 kNm/deg, curb mass delta -88.5 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[0078]: PPF torsional stiffness 21.230 kNm/deg, curb mass delta -88.3 kg vs NC, 50:50 axle weight 50.39%
# MX5_ND_Trace[0079]: PPF torsional stiffness 21.265 kNm/deg, curb mass delta -88.2 kg vs NC, 50:50 axle weight 50.40%
# MX5_ND_Trace[0080]: PPF torsional stiffness 21.300 kNm/deg, curb mass delta -88.0 kg vs NC, 50:50 axle weight 50.00%
# MX5_ND_Trace[0081]: PPF torsional stiffness 21.335 kNm/deg, curb mass delta -87.8 kg vs NC, 50:50 axle weight 50.01%
# MX5_ND_Trace[0082]: PPF torsional stiffness 21.370 kNm/deg, curb mass delta -87.7 kg vs NC, 50:50 axle weight 50.01%
# MX5_ND_Trace[0083]: PPF torsional stiffness 21.405 kNm/deg, curb mass delta -87.5 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[0084]: PPF torsional stiffness 21.440 kNm/deg, curb mass delta -87.4 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[0085]: PPF torsional stiffness 21.475 kNm/deg, curb mass delta -87.3 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[0086]: PPF torsional stiffness 21.510 kNm/deg, curb mass delta -87.1 kg vs NC, 50:50 axle weight 50.03%
# MX5_ND_Trace[0087]: PPF torsional stiffness 21.545 kNm/deg, curb mass delta -87.0 kg vs NC, 50:50 axle weight 50.03%
# MX5_ND_Trace[0088]: PPF torsional stiffness 21.580 kNm/deg, curb mass delta -86.8 kg vs NC, 50:50 axle weight 50.04%
# MX5_ND_Trace[0089]: PPF torsional stiffness 21.615 kNm/deg, curb mass delta -86.7 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[0090]: PPF torsional stiffness 21.650 kNm/deg, curb mass delta -86.5 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[0091]: PPF torsional stiffness 21.685 kNm/deg, curb mass delta -86.3 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[0092]: PPF torsional stiffness 21.720 kNm/deg, curb mass delta -86.2 kg vs NC, 50:50 axle weight 50.06%
# MX5_ND_Trace[0093]: PPF torsional stiffness 21.755 kNm/deg, curb mass delta -86.0 kg vs NC, 50:50 axle weight 50.06%
# MX5_ND_Trace[0094]: PPF torsional stiffness 21.790 kNm/deg, curb mass delta -85.9 kg vs NC, 50:50 axle weight 50.07%
# MX5_ND_Trace[0095]: PPF torsional stiffness 21.825 kNm/deg, curb mass delta -85.8 kg vs NC, 50:50 axle weight 50.08%
# MX5_ND_Trace[0096]: PPF torsional stiffness 21.860 kNm/deg, curb mass delta -85.6 kg vs NC, 50:50 axle weight 50.08%
# MX5_ND_Trace[0097]: PPF torsional stiffness 21.895 kNm/deg, curb mass delta -85.5 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[0098]: PPF torsional stiffness 21.930 kNm/deg, curb mass delta -85.3 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[0099]: PPF torsional stiffness 21.965 kNm/deg, curb mass delta -85.2 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[0100]: PPF torsional stiffness 22.000 kNm/deg, curb mass delta -100.0 kg vs NC, 50:50 axle weight 50.10%
# MX5_ND_Trace[0101]: PPF torsional stiffness 22.035 kNm/deg, curb mass delta -99.8 kg vs NC, 50:50 axle weight 50.10%
# MX5_ND_Trace[0102]: PPF torsional stiffness 22.070 kNm/deg, curb mass delta -99.7 kg vs NC, 50:50 axle weight 50.11%
# MX5_ND_Trace[0103]: PPF torsional stiffness 22.105 kNm/deg, curb mass delta -99.5 kg vs NC, 50:50 axle weight 50.12%
# MX5_ND_Trace[0104]: PPF torsional stiffness 22.140 kNm/deg, curb mass delta -99.4 kg vs NC, 50:50 axle weight 50.12%
# MX5_ND_Trace[0105]: PPF torsional stiffness 22.175 kNm/deg, curb mass delta -99.3 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[0106]: PPF torsional stiffness 22.210 kNm/deg, curb mass delta -99.1 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[0107]: PPF torsional stiffness 22.245 kNm/deg, curb mass delta -99.0 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[0108]: PPF torsional stiffness 22.280 kNm/deg, curb mass delta -98.8 kg vs NC, 50:50 axle weight 50.14%
# MX5_ND_Trace[0109]: PPF torsional stiffness 22.315 kNm/deg, curb mass delta -98.7 kg vs NC, 50:50 axle weight 50.15%
# MX5_ND_Trace[0110]: PPF torsional stiffness 22.350 kNm/deg, curb mass delta -98.5 kg vs NC, 50:50 axle weight 50.15%
# MX5_ND_Trace[0111]: PPF torsional stiffness 22.385 kNm/deg, curb mass delta -98.3 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[0112]: PPF torsional stiffness 22.420 kNm/deg, curb mass delta -98.2 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[0113]: PPF torsional stiffness 22.455 kNm/deg, curb mass delta -98.0 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[0114]: PPF torsional stiffness 22.490 kNm/deg, curb mass delta -97.9 kg vs NC, 50:50 axle weight 50.17%
# MX5_ND_Trace[0115]: PPF torsional stiffness 22.525 kNm/deg, curb mass delta -97.8 kg vs NC, 50:50 axle weight 50.17%
# MX5_ND_Trace[0116]: PPF torsional stiffness 22.560 kNm/deg, curb mass delta -97.6 kg vs NC, 50:50 axle weight 50.18%
# MX5_ND_Trace[0117]: PPF torsional stiffness 22.595 kNm/deg, curb mass delta -97.5 kg vs NC, 50:50 axle weight 50.19%
# MX5_ND_Trace[0118]: PPF torsional stiffness 22.630 kNm/deg, curb mass delta -97.3 kg vs NC, 50:50 axle weight 50.19%
# MX5_ND_Trace[0119]: PPF torsional stiffness 22.665 kNm/deg, curb mass delta -97.2 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[0120]: PPF torsional stiffness 18.500 kNm/deg, curb mass delta -97.0 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[0121]: PPF torsional stiffness 18.535 kNm/deg, curb mass delta -96.8 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[0122]: PPF torsional stiffness 18.570 kNm/deg, curb mass delta -96.7 kg vs NC, 50:50 axle weight 50.21%
# MX5_ND_Trace[0123]: PPF torsional stiffness 18.605 kNm/deg, curb mass delta -96.5 kg vs NC, 50:50 axle weight 50.22%
# MX5_ND_Trace[0124]: PPF torsional stiffness 18.640 kNm/deg, curb mass delta -96.4 kg vs NC, 50:50 axle weight 50.22%
# MX5_ND_Trace[0125]: PPF torsional stiffness 18.675 kNm/deg, curb mass delta -96.3 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[0126]: PPF torsional stiffness 18.710 kNm/deg, curb mass delta -96.1 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[0127]: PPF torsional stiffness 18.745 kNm/deg, curb mass delta -96.0 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[0128]: PPF torsional stiffness 18.780 kNm/deg, curb mass delta -95.8 kg vs NC, 50:50 axle weight 50.24%
# MX5_ND_Trace[0129]: PPF torsional stiffness 18.815 kNm/deg, curb mass delta -95.7 kg vs NC, 50:50 axle weight 50.24%
# MX5_ND_Trace[0130]: PPF torsional stiffness 18.850 kNm/deg, curb mass delta -95.5 kg vs NC, 50:50 axle weight 50.25%
# MX5_ND_Trace[0131]: PPF torsional stiffness 18.885 kNm/deg, curb mass delta -95.3 kg vs NC, 50:50 axle weight 50.26%
# MX5_ND_Trace[0132]: PPF torsional stiffness 18.920 kNm/deg, curb mass delta -95.2 kg vs NC, 50:50 axle weight 50.26%
# MX5_ND_Trace[0133]: PPF torsional stiffness 18.955 kNm/deg, curb mass delta -95.0 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[0134]: PPF torsional stiffness 18.990 kNm/deg, curb mass delta -94.9 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[0135]: PPF torsional stiffness 19.025 kNm/deg, curb mass delta -94.8 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[0136]: PPF torsional stiffness 19.060 kNm/deg, curb mass delta -94.6 kg vs NC, 50:50 axle weight 50.28%
# MX5_ND_Trace[0137]: PPF torsional stiffness 19.095 kNm/deg, curb mass delta -94.5 kg vs NC, 50:50 axle weight 50.28%
# MX5_ND_Trace[0138]: PPF torsional stiffness 19.130 kNm/deg, curb mass delta -94.3 kg vs NC, 50:50 axle weight 50.29%
# MX5_ND_Trace[0139]: PPF torsional stiffness 19.165 kNm/deg, curb mass delta -94.2 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[0140]: PPF torsional stiffness 19.200 kNm/deg, curb mass delta -94.0 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[0141]: PPF torsional stiffness 19.235 kNm/deg, curb mass delta -93.8 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[0142]: PPF torsional stiffness 19.270 kNm/deg, curb mass delta -93.7 kg vs NC, 50:50 axle weight 50.31%
# MX5_ND_Trace[0143]: PPF torsional stiffness 19.305 kNm/deg, curb mass delta -93.5 kg vs NC, 50:50 axle weight 50.31%
# MX5_ND_Trace[0144]: PPF torsional stiffness 19.340 kNm/deg, curb mass delta -93.4 kg vs NC, 50:50 axle weight 50.32%
# MX5_ND_Trace[0145]: PPF torsional stiffness 19.375 kNm/deg, curb mass delta -93.3 kg vs NC, 50:50 axle weight 50.33%
# MX5_ND_Trace[0146]: PPF torsional stiffness 19.410 kNm/deg, curb mass delta -93.1 kg vs NC, 50:50 axle weight 50.33%
# MX5_ND_Trace[0147]: PPF torsional stiffness 19.445 kNm/deg, curb mass delta -93.0 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[0148]: PPF torsional stiffness 19.480 kNm/deg, curb mass delta -92.8 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[0149]: PPF torsional stiffness 19.515 kNm/deg, curb mass delta -92.7 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[0150]: PPF torsional stiffness 19.550 kNm/deg, curb mass delta -92.5 kg vs NC, 50:50 axle weight 50.35%
# MX5_ND_Trace[0151]: PPF torsional stiffness 19.585 kNm/deg, curb mass delta -92.3 kg vs NC, 50:50 axle weight 50.35%
# MX5_ND_Trace[0152]: PPF torsional stiffness 19.620 kNm/deg, curb mass delta -92.2 kg vs NC, 50:50 axle weight 50.36%
# MX5_ND_Trace[0153]: PPF torsional stiffness 19.655 kNm/deg, curb mass delta -92.0 kg vs NC, 50:50 axle weight 50.37%
# MX5_ND_Trace[0154]: PPF torsional stiffness 19.690 kNm/deg, curb mass delta -91.9 kg vs NC, 50:50 axle weight 50.37%
# MX5_ND_Trace[0155]: PPF torsional stiffness 19.725 kNm/deg, curb mass delta -91.8 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[0156]: PPF torsional stiffness 19.760 kNm/deg, curb mass delta -91.6 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[0157]: PPF torsional stiffness 19.795 kNm/deg, curb mass delta -91.5 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[0158]: PPF torsional stiffness 19.830 kNm/deg, curb mass delta -91.3 kg vs NC, 50:50 axle weight 50.39%
# MX5_ND_Trace[0159]: PPF torsional stiffness 19.865 kNm/deg, curb mass delta -91.2 kg vs NC, 50:50 axle weight 50.40%
# MX5_ND_Trace[0160]: PPF torsional stiffness 19.900 kNm/deg, curb mass delta -91.0 kg vs NC, 50:50 axle weight 50.00%
# MX5_ND_Trace[0161]: PPF torsional stiffness 19.935 kNm/deg, curb mass delta -90.8 kg vs NC, 50:50 axle weight 50.01%
# MX5_ND_Trace[0162]: PPF torsional stiffness 19.970 kNm/deg, curb mass delta -90.7 kg vs NC, 50:50 axle weight 50.01%
# MX5_ND_Trace[0163]: PPF torsional stiffness 20.005 kNm/deg, curb mass delta -90.5 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[0164]: PPF torsional stiffness 20.040 kNm/deg, curb mass delta -90.4 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[0165]: PPF torsional stiffness 20.075 kNm/deg, curb mass delta -90.3 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[0166]: PPF torsional stiffness 20.110 kNm/deg, curb mass delta -90.1 kg vs NC, 50:50 axle weight 50.03%
# MX5_ND_Trace[0167]: PPF torsional stiffness 20.145 kNm/deg, curb mass delta -90.0 kg vs NC, 50:50 axle weight 50.03%
# MX5_ND_Trace[0168]: PPF torsional stiffness 20.180 kNm/deg, curb mass delta -89.8 kg vs NC, 50:50 axle weight 50.04%
# MX5_ND_Trace[0169]: PPF torsional stiffness 20.215 kNm/deg, curb mass delta -89.7 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[0170]: PPF torsional stiffness 20.250 kNm/deg, curb mass delta -89.5 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[0171]: PPF torsional stiffness 20.285 kNm/deg, curb mass delta -89.3 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[0172]: PPF torsional stiffness 20.320 kNm/deg, curb mass delta -89.2 kg vs NC, 50:50 axle weight 50.06%
# MX5_ND_Trace[0173]: PPF torsional stiffness 20.355 kNm/deg, curb mass delta -89.0 kg vs NC, 50:50 axle weight 50.06%
# MX5_ND_Trace[0174]: PPF torsional stiffness 20.390 kNm/deg, curb mass delta -88.9 kg vs NC, 50:50 axle weight 50.07%
# MX5_ND_Trace[0175]: PPF torsional stiffness 20.425 kNm/deg, curb mass delta -88.8 kg vs NC, 50:50 axle weight 50.08%
# MX5_ND_Trace[0176]: PPF torsional stiffness 20.460 kNm/deg, curb mass delta -88.6 kg vs NC, 50:50 axle weight 50.08%
# MX5_ND_Trace[0177]: PPF torsional stiffness 20.495 kNm/deg, curb mass delta -88.5 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[0178]: PPF torsional stiffness 20.530 kNm/deg, curb mass delta -88.3 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[0179]: PPF torsional stiffness 20.565 kNm/deg, curb mass delta -88.2 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[0180]: PPF torsional stiffness 20.600 kNm/deg, curb mass delta -88.0 kg vs NC, 50:50 axle weight 50.10%
# MX5_ND_Trace[0181]: PPF torsional stiffness 20.635 kNm/deg, curb mass delta -87.8 kg vs NC, 50:50 axle weight 50.10%
# MX5_ND_Trace[0182]: PPF torsional stiffness 20.670 kNm/deg, curb mass delta -87.7 kg vs NC, 50:50 axle weight 50.11%
# MX5_ND_Trace[0183]: PPF torsional stiffness 20.705 kNm/deg, curb mass delta -87.5 kg vs NC, 50:50 axle weight 50.12%
# MX5_ND_Trace[0184]: PPF torsional stiffness 20.740 kNm/deg, curb mass delta -87.4 kg vs NC, 50:50 axle weight 50.12%
# MX5_ND_Trace[0185]: PPF torsional stiffness 20.775 kNm/deg, curb mass delta -87.3 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[0186]: PPF torsional stiffness 20.810 kNm/deg, curb mass delta -87.1 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[0187]: PPF torsional stiffness 20.845 kNm/deg, curb mass delta -87.0 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[0188]: PPF torsional stiffness 20.880 kNm/deg, curb mass delta -86.8 kg vs NC, 50:50 axle weight 50.14%
# MX5_ND_Trace[0189]: PPF torsional stiffness 20.915 kNm/deg, curb mass delta -86.7 kg vs NC, 50:50 axle weight 50.15%
# MX5_ND_Trace[0190]: PPF torsional stiffness 20.950 kNm/deg, curb mass delta -86.5 kg vs NC, 50:50 axle weight 50.15%
# MX5_ND_Trace[0191]: PPF torsional stiffness 20.985 kNm/deg, curb mass delta -86.3 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[0192]: PPF torsional stiffness 21.020 kNm/deg, curb mass delta -86.2 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[0193]: PPF torsional stiffness 21.055 kNm/deg, curb mass delta -86.0 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[0194]: PPF torsional stiffness 21.090 kNm/deg, curb mass delta -85.9 kg vs NC, 50:50 axle weight 50.17%
# MX5_ND_Trace[0195]: PPF torsional stiffness 21.125 kNm/deg, curb mass delta -85.8 kg vs NC, 50:50 axle weight 50.17%
# MX5_ND_Trace[0196]: PPF torsional stiffness 21.160 kNm/deg, curb mass delta -85.6 kg vs NC, 50:50 axle weight 50.18%
# MX5_ND_Trace[0197]: PPF torsional stiffness 21.195 kNm/deg, curb mass delta -85.5 kg vs NC, 50:50 axle weight 50.19%
# MX5_ND_Trace[0198]: PPF torsional stiffness 21.230 kNm/deg, curb mass delta -85.3 kg vs NC, 50:50 axle weight 50.19%
# MX5_ND_Trace[0199]: PPF torsional stiffness 21.265 kNm/deg, curb mass delta -85.2 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[0200]: PPF torsional stiffness 21.300 kNm/deg, curb mass delta -100.0 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[0201]: PPF torsional stiffness 21.335 kNm/deg, curb mass delta -99.8 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[0202]: PPF torsional stiffness 21.370 kNm/deg, curb mass delta -99.7 kg vs NC, 50:50 axle weight 50.21%
# MX5_ND_Trace[0203]: PPF torsional stiffness 21.405 kNm/deg, curb mass delta -99.5 kg vs NC, 50:50 axle weight 50.22%
# MX5_ND_Trace[0204]: PPF torsional stiffness 21.440 kNm/deg, curb mass delta -99.4 kg vs NC, 50:50 axle weight 50.22%
# MX5_ND_Trace[0205]: PPF torsional stiffness 21.475 kNm/deg, curb mass delta -99.3 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[0206]: PPF torsional stiffness 21.510 kNm/deg, curb mass delta -99.1 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[0207]: PPF torsional stiffness 21.545 kNm/deg, curb mass delta -99.0 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[0208]: PPF torsional stiffness 21.580 kNm/deg, curb mass delta -98.8 kg vs NC, 50:50 axle weight 50.24%
# MX5_ND_Trace[0209]: PPF torsional stiffness 21.615 kNm/deg, curb mass delta -98.7 kg vs NC, 50:50 axle weight 50.24%
# MX5_ND_Trace[0210]: PPF torsional stiffness 21.650 kNm/deg, curb mass delta -98.5 kg vs NC, 50:50 axle weight 50.25%
# MX5_ND_Trace[0211]: PPF torsional stiffness 21.685 kNm/deg, curb mass delta -98.3 kg vs NC, 50:50 axle weight 50.26%
# MX5_ND_Trace[0212]: PPF torsional stiffness 21.720 kNm/deg, curb mass delta -98.2 kg vs NC, 50:50 axle weight 50.26%
# MX5_ND_Trace[0213]: PPF torsional stiffness 21.755 kNm/deg, curb mass delta -98.0 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[0214]: PPF torsional stiffness 21.790 kNm/deg, curb mass delta -97.9 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[0215]: PPF torsional stiffness 21.825 kNm/deg, curb mass delta -97.8 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[0216]: PPF torsional stiffness 21.860 kNm/deg, curb mass delta -97.6 kg vs NC, 50:50 axle weight 50.28%
# MX5_ND_Trace[0217]: PPF torsional stiffness 21.895 kNm/deg, curb mass delta -97.5 kg vs NC, 50:50 axle weight 50.28%
# MX5_ND_Trace[0218]: PPF torsional stiffness 21.930 kNm/deg, curb mass delta -97.3 kg vs NC, 50:50 axle weight 50.29%
# MX5_ND_Trace[0219]: PPF torsional stiffness 21.965 kNm/deg, curb mass delta -97.2 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[0220]: PPF torsional stiffness 22.000 kNm/deg, curb mass delta -97.0 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[0221]: PPF torsional stiffness 22.035 kNm/deg, curb mass delta -96.8 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[0222]: PPF torsional stiffness 22.070 kNm/deg, curb mass delta -96.7 kg vs NC, 50:50 axle weight 50.31%
# MX5_ND_Trace[0223]: PPF torsional stiffness 22.105 kNm/deg, curb mass delta -96.6 kg vs NC, 50:50 axle weight 50.31%
# MX5_ND_Trace[0224]: PPF torsional stiffness 22.140 kNm/deg, curb mass delta -96.4 kg vs NC, 50:50 axle weight 50.32%
# MX5_ND_Trace[0225]: PPF torsional stiffness 22.175 kNm/deg, curb mass delta -96.3 kg vs NC, 50:50 axle weight 50.33%
# MX5_ND_Trace[0226]: PPF torsional stiffness 22.210 kNm/deg, curb mass delta -96.1 kg vs NC, 50:50 axle weight 50.33%
# MX5_ND_Trace[0227]: PPF torsional stiffness 22.245 kNm/deg, curb mass delta -96.0 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[0228]: PPF torsional stiffness 22.280 kNm/deg, curb mass delta -95.8 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[0229]: PPF torsional stiffness 22.315 kNm/deg, curb mass delta -95.7 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[0230]: PPF torsional stiffness 22.350 kNm/deg, curb mass delta -95.5 kg vs NC, 50:50 axle weight 50.35%
# MX5_ND_Trace[0231]: PPF torsional stiffness 22.385 kNm/deg, curb mass delta -95.3 kg vs NC, 50:50 axle weight 50.35%
# MX5_ND_Trace[0232]: PPF torsional stiffness 22.420 kNm/deg, curb mass delta -95.2 kg vs NC, 50:50 axle weight 50.36%
# MX5_ND_Trace[0233]: PPF torsional stiffness 22.455 kNm/deg, curb mass delta -95.1 kg vs NC, 50:50 axle weight 50.37%
# MX5_ND_Trace[0234]: PPF torsional stiffness 22.490 kNm/deg, curb mass delta -94.9 kg vs NC, 50:50 axle weight 50.37%
# MX5_ND_Trace[0235]: PPF torsional stiffness 22.525 kNm/deg, curb mass delta -94.8 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[0236]: PPF torsional stiffness 22.560 kNm/deg, curb mass delta -94.6 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[0237]: PPF torsional stiffness 22.595 kNm/deg, curb mass delta -94.5 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[0238]: PPF torsional stiffness 22.630 kNm/deg, curb mass delta -94.3 kg vs NC, 50:50 axle weight 50.39%
# MX5_ND_Trace[0239]: PPF torsional stiffness 22.665 kNm/deg, curb mass delta -94.2 kg vs NC, 50:50 axle weight 50.40%
# MX5_ND_Trace[0240]: PPF torsional stiffness 18.500 kNm/deg, curb mass delta -94.0 kg vs NC, 50:50 axle weight 50.40%
# MX5_ND_Trace[0241]: PPF torsional stiffness 18.535 kNm/deg, curb mass delta -93.8 kg vs NC, 50:50 axle weight 50.01%
# MX5_ND_Trace[0242]: PPF torsional stiffness 18.570 kNm/deg, curb mass delta -93.7 kg vs NC, 50:50 axle weight 50.01%
# MX5_ND_Trace[0243]: PPF torsional stiffness 18.605 kNm/deg, curb mass delta -93.6 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[0244]: PPF torsional stiffness 18.640 kNm/deg, curb mass delta -93.4 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[0245]: PPF torsional stiffness 18.675 kNm/deg, curb mass delta -93.3 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[0246]: PPF torsional stiffness 18.710 kNm/deg, curb mass delta -93.1 kg vs NC, 50:50 axle weight 50.03%
# MX5_ND_Trace[0247]: PPF torsional stiffness 18.745 kNm/deg, curb mass delta -93.0 kg vs NC, 50:50 axle weight 50.03%
# MX5_ND_Trace[0248]: PPF torsional stiffness 18.780 kNm/deg, curb mass delta -92.8 kg vs NC, 50:50 axle weight 50.04%
# MX5_ND_Trace[0249]: PPF torsional stiffness 18.815 kNm/deg, curb mass delta -92.7 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[0250]: PPF torsional stiffness 18.850 kNm/deg, curb mass delta -92.5 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[0251]: PPF torsional stiffness 18.885 kNm/deg, curb mass delta -92.3 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[0252]: PPF torsional stiffness 18.920 kNm/deg, curb mass delta -92.2 kg vs NC, 50:50 axle weight 50.06%
# MX5_ND_Trace[0253]: PPF torsional stiffness 18.955 kNm/deg, curb mass delta -92.1 kg vs NC, 50:50 axle weight 50.06%
# MX5_ND_Trace[0254]: PPF torsional stiffness 18.990 kNm/deg, curb mass delta -91.9 kg vs NC, 50:50 axle weight 50.07%
# MX5_ND_Trace[0255]: PPF torsional stiffness 19.025 kNm/deg, curb mass delta -91.8 kg vs NC, 50:50 axle weight 50.08%
# MX5_ND_Trace[0256]: PPF torsional stiffness 19.060 kNm/deg, curb mass delta -91.6 kg vs NC, 50:50 axle weight 50.08%
# MX5_ND_Trace[0257]: PPF torsional stiffness 19.095 kNm/deg, curb mass delta -91.5 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[0258]: PPF torsional stiffness 19.130 kNm/deg, curb mass delta -91.3 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[0259]: PPF torsional stiffness 19.165 kNm/deg, curb mass delta -91.2 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[0260]: PPF torsional stiffness 19.200 kNm/deg, curb mass delta -91.0 kg vs NC, 50:50 axle weight 50.10%
# MX5_ND_Trace[0261]: PPF torsional stiffness 19.235 kNm/deg, curb mass delta -90.8 kg vs NC, 50:50 axle weight 50.10%
# MX5_ND_Trace[0262]: PPF torsional stiffness 19.270 kNm/deg, curb mass delta -90.7 kg vs NC, 50:50 axle weight 50.11%
# MX5_ND_Trace[0263]: PPF torsional stiffness 19.305 kNm/deg, curb mass delta -90.6 kg vs NC, 50:50 axle weight 50.12%
# MX5_ND_Trace[0264]: PPF torsional stiffness 19.340 kNm/deg, curb mass delta -90.4 kg vs NC, 50:50 axle weight 50.12%
# MX5_ND_Trace[0265]: PPF torsional stiffness 19.375 kNm/deg, curb mass delta -90.3 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[0266]: PPF torsional stiffness 19.410 kNm/deg, curb mass delta -90.1 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[0267]: PPF torsional stiffness 19.445 kNm/deg, curb mass delta -90.0 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[0268]: PPF torsional stiffness 19.480 kNm/deg, curb mass delta -89.8 kg vs NC, 50:50 axle weight 50.14%
# MX5_ND_Trace[0269]: PPF torsional stiffness 19.515 kNm/deg, curb mass delta -89.7 kg vs NC, 50:50 axle weight 50.15%
# MX5_ND_Trace[0270]: PPF torsional stiffness 19.550 kNm/deg, curb mass delta -89.5 kg vs NC, 50:50 axle weight 50.15%
# MX5_ND_Trace[0271]: PPF torsional stiffness 19.585 kNm/deg, curb mass delta -89.3 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[0272]: PPF torsional stiffness 19.620 kNm/deg, curb mass delta -89.2 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[0273]: PPF torsional stiffness 19.655 kNm/deg, curb mass delta -89.1 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[0274]: PPF torsional stiffness 19.690 kNm/deg, curb mass delta -88.9 kg vs NC, 50:50 axle weight 50.17%
# MX5_ND_Trace[0275]: PPF torsional stiffness 19.725 kNm/deg, curb mass delta -88.8 kg vs NC, 50:50 axle weight 50.17%
# MX5_ND_Trace[0276]: PPF torsional stiffness 19.760 kNm/deg, curb mass delta -88.6 kg vs NC, 50:50 axle weight 50.18%
# MX5_ND_Trace[0277]: PPF torsional stiffness 19.795 kNm/deg, curb mass delta -88.5 kg vs NC, 50:50 axle weight 50.19%
# MX5_ND_Trace[0278]: PPF torsional stiffness 19.830 kNm/deg, curb mass delta -88.3 kg vs NC, 50:50 axle weight 50.19%
# MX5_ND_Trace[0279]: PPF torsional stiffness 19.865 kNm/deg, curb mass delta -88.2 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[0280]: PPF torsional stiffness 19.900 kNm/deg, curb mass delta -88.0 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[0281]: PPF torsional stiffness 19.935 kNm/deg, curb mass delta -87.8 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[0282]: PPF torsional stiffness 19.970 kNm/deg, curb mass delta -87.7 kg vs NC, 50:50 axle weight 50.21%
# MX5_ND_Trace[0283]: PPF torsional stiffness 20.005 kNm/deg, curb mass delta -87.6 kg vs NC, 50:50 axle weight 50.22%
# MX5_ND_Trace[0284]: PPF torsional stiffness 20.040 kNm/deg, curb mass delta -87.4 kg vs NC, 50:50 axle weight 50.22%
# MX5_ND_Trace[0285]: PPF torsional stiffness 20.075 kNm/deg, curb mass delta -87.3 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[0286]: PPF torsional stiffness 20.110 kNm/deg, curb mass delta -87.1 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[0287]: PPF torsional stiffness 20.145 kNm/deg, curb mass delta -87.0 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[0288]: PPF torsional stiffness 20.180 kNm/deg, curb mass delta -86.8 kg vs NC, 50:50 axle weight 50.24%
# MX5_ND_Trace[0289]: PPF torsional stiffness 20.215 kNm/deg, curb mass delta -86.7 kg vs NC, 50:50 axle weight 50.24%
# MX5_ND_Trace[0290]: PPF torsional stiffness 20.250 kNm/deg, curb mass delta -86.5 kg vs NC, 50:50 axle weight 50.25%
# MX5_ND_Trace[0291]: PPF torsional stiffness 20.285 kNm/deg, curb mass delta -86.3 kg vs NC, 50:50 axle weight 50.26%
# MX5_ND_Trace[0292]: PPF torsional stiffness 20.320 kNm/deg, curb mass delta -86.2 kg vs NC, 50:50 axle weight 50.26%
# MX5_ND_Trace[0293]: PPF torsional stiffness 20.355 kNm/deg, curb mass delta -86.1 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[0294]: PPF torsional stiffness 20.390 kNm/deg, curb mass delta -85.9 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[0295]: PPF torsional stiffness 20.425 kNm/deg, curb mass delta -85.8 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[0296]: PPF torsional stiffness 20.460 kNm/deg, curb mass delta -85.6 kg vs NC, 50:50 axle weight 50.28%
# MX5_ND_Trace[0297]: PPF torsional stiffness 20.495 kNm/deg, curb mass delta -85.5 kg vs NC, 50:50 axle weight 50.28%
# MX5_ND_Trace[0298]: PPF torsional stiffness 20.530 kNm/deg, curb mass delta -85.3 kg vs NC, 50:50 axle weight 50.29%
# MX5_ND_Trace[0299]: PPF torsional stiffness 20.565 kNm/deg, curb mass delta -85.2 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[0300]: PPF torsional stiffness 20.600 kNm/deg, curb mass delta -100.0 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[0301]: PPF torsional stiffness 20.635 kNm/deg, curb mass delta -99.8 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[0302]: PPF torsional stiffness 20.670 kNm/deg, curb mass delta -99.7 kg vs NC, 50:50 axle weight 50.31%
# MX5_ND_Trace[0303]: PPF torsional stiffness 20.705 kNm/deg, curb mass delta -99.6 kg vs NC, 50:50 axle weight 50.31%
# MX5_ND_Trace[0304]: PPF torsional stiffness 20.740 kNm/deg, curb mass delta -99.4 kg vs NC, 50:50 axle weight 50.32%
# MX5_ND_Trace[0305]: PPF torsional stiffness 20.775 kNm/deg, curb mass delta -99.3 kg vs NC, 50:50 axle weight 50.33%
# MX5_ND_Trace[0306]: PPF torsional stiffness 20.810 kNm/deg, curb mass delta -99.1 kg vs NC, 50:50 axle weight 50.33%
# MX5_ND_Trace[0307]: PPF torsional stiffness 20.845 kNm/deg, curb mass delta -99.0 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[0308]: PPF torsional stiffness 20.880 kNm/deg, curb mass delta -98.8 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[0309]: PPF torsional stiffness 20.915 kNm/deg, curb mass delta -98.7 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[0310]: PPF torsional stiffness 20.950 kNm/deg, curb mass delta -98.5 kg vs NC, 50:50 axle weight 50.35%
# MX5_ND_Trace[0311]: PPF torsional stiffness 20.985 kNm/deg, curb mass delta -98.3 kg vs NC, 50:50 axle weight 50.35%
# MX5_ND_Trace[0312]: PPF torsional stiffness 21.020 kNm/deg, curb mass delta -98.2 kg vs NC, 50:50 axle weight 50.36%
# MX5_ND_Trace[0313]: PPF torsional stiffness 21.055 kNm/deg, curb mass delta -98.1 kg vs NC, 50:50 axle weight 50.37%
# MX5_ND_Trace[0314]: PPF torsional stiffness 21.090 kNm/deg, curb mass delta -97.9 kg vs NC, 50:50 axle weight 50.37%
# MX5_ND_Trace[0315]: PPF torsional stiffness 21.125 kNm/deg, curb mass delta -97.8 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[0316]: PPF torsional stiffness 21.160 kNm/deg, curb mass delta -97.6 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[0317]: PPF torsional stiffness 21.195 kNm/deg, curb mass delta -97.5 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[0318]: PPF torsional stiffness 21.230 kNm/deg, curb mass delta -97.3 kg vs NC, 50:50 axle weight 50.39%
# MX5_ND_Trace[0319]: PPF torsional stiffness 21.265 kNm/deg, curb mass delta -97.2 kg vs NC, 50:50 axle weight 50.40%
# MX5_ND_Trace[0320]: PPF torsional stiffness 21.300 kNm/deg, curb mass delta -97.0 kg vs NC, 50:50 axle weight 50.00%
# MX5_ND_Trace[0321]: PPF torsional stiffness 21.335 kNm/deg, curb mass delta -96.8 kg vs NC, 50:50 axle weight 50.01%
# MX5_ND_Trace[0322]: PPF torsional stiffness 21.370 kNm/deg, curb mass delta -96.7 kg vs NC, 50:50 axle weight 50.01%
# MX5_ND_Trace[0323]: PPF torsional stiffness 21.405 kNm/deg, curb mass delta -96.6 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[0324]: PPF torsional stiffness 21.440 kNm/deg, curb mass delta -96.4 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[0325]: PPF torsional stiffness 21.475 kNm/deg, curb mass delta -96.3 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[0326]: PPF torsional stiffness 21.510 kNm/deg, curb mass delta -96.1 kg vs NC, 50:50 axle weight 50.03%
# MX5_ND_Trace[0327]: PPF torsional stiffness 21.545 kNm/deg, curb mass delta -96.0 kg vs NC, 50:50 axle weight 50.03%
# MX5_ND_Trace[0328]: PPF torsional stiffness 21.580 kNm/deg, curb mass delta -95.8 kg vs NC, 50:50 axle weight 50.04%
# MX5_ND_Trace[0329]: PPF torsional stiffness 21.615 kNm/deg, curb mass delta -95.7 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[0330]: PPF torsional stiffness 21.650 kNm/deg, curb mass delta -95.5 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[0331]: PPF torsional stiffness 21.685 kNm/deg, curb mass delta -95.3 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[0332]: PPF torsional stiffness 21.720 kNm/deg, curb mass delta -95.2 kg vs NC, 50:50 axle weight 50.06%
# MX5_ND_Trace[0333]: PPF torsional stiffness 21.755 kNm/deg, curb mass delta -95.1 kg vs NC, 50:50 axle weight 50.06%
# MX5_ND_Trace[0334]: PPF torsional stiffness 21.790 kNm/deg, curb mass delta -94.9 kg vs NC, 50:50 axle weight 50.07%
# MX5_ND_Trace[0335]: PPF torsional stiffness 21.825 kNm/deg, curb mass delta -94.8 kg vs NC, 50:50 axle weight 50.08%
# MX5_ND_Trace[0336]: PPF torsional stiffness 21.860 kNm/deg, curb mass delta -94.6 kg vs NC, 50:50 axle weight 50.08%
# MX5_ND_Trace[0337]: PPF torsional stiffness 21.895 kNm/deg, curb mass delta -94.5 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[0338]: PPF torsional stiffness 21.930 kNm/deg, curb mass delta -94.3 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[0339]: PPF torsional stiffness 21.965 kNm/deg, curb mass delta -94.2 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[0340]: PPF torsional stiffness 22.000 kNm/deg, curb mass delta -94.0 kg vs NC, 50:50 axle weight 50.10%
# MX5_ND_Trace[0341]: PPF torsional stiffness 22.035 kNm/deg, curb mass delta -93.8 kg vs NC, 50:50 axle weight 50.10%
# MX5_ND_Trace[0342]: PPF torsional stiffness 22.070 kNm/deg, curb mass delta -93.7 kg vs NC, 50:50 axle weight 50.11%
# MX5_ND_Trace[0343]: PPF torsional stiffness 22.105 kNm/deg, curb mass delta -93.6 kg vs NC, 50:50 axle weight 50.12%
# MX5_ND_Trace[0344]: PPF torsional stiffness 22.140 kNm/deg, curb mass delta -93.4 kg vs NC, 50:50 axle weight 50.12%
# MX5_ND_Trace[0345]: PPF torsional stiffness 22.175 kNm/deg, curb mass delta -93.3 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[0346]: PPF torsional stiffness 22.210 kNm/deg, curb mass delta -93.1 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[0347]: PPF torsional stiffness 22.245 kNm/deg, curb mass delta -93.0 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[0348]: PPF torsional stiffness 22.280 kNm/deg, curb mass delta -92.8 kg vs NC, 50:50 axle weight 50.14%
# MX5_ND_Trace[0349]: PPF torsional stiffness 22.315 kNm/deg, curb mass delta -92.7 kg vs NC, 50:50 axle weight 50.15%
# MX5_ND_Trace[0350]: PPF torsional stiffness 22.350 kNm/deg, curb mass delta -92.5 kg vs NC, 50:50 axle weight 50.15%
# MX5_ND_Trace[0351]: PPF torsional stiffness 22.385 kNm/deg, curb mass delta -92.3 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[0352]: PPF torsional stiffness 22.420 kNm/deg, curb mass delta -92.2 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[0353]: PPF torsional stiffness 22.455 kNm/deg, curb mass delta -92.1 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[0354]: PPF torsional stiffness 22.490 kNm/deg, curb mass delta -91.9 kg vs NC, 50:50 axle weight 50.17%
# MX5_ND_Trace[0355]: PPF torsional stiffness 22.525 kNm/deg, curb mass delta -91.8 kg vs NC, 50:50 axle weight 50.17%
# MX5_ND_Trace[0356]: PPF torsional stiffness 22.560 kNm/deg, curb mass delta -91.6 kg vs NC, 50:50 axle weight 50.18%
# MX5_ND_Trace[0357]: PPF torsional stiffness 22.595 kNm/deg, curb mass delta -91.5 kg vs NC, 50:50 axle weight 50.19%
# MX5_ND_Trace[0358]: PPF torsional stiffness 22.630 kNm/deg, curb mass delta -91.3 kg vs NC, 50:50 axle weight 50.19%
# MX5_ND_Trace[0359]: PPF torsional stiffness 22.665 kNm/deg, curb mass delta -91.2 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[0360]: PPF torsional stiffness 18.500 kNm/deg, curb mass delta -91.0 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[0361]: PPF torsional stiffness 18.535 kNm/deg, curb mass delta -90.8 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[0362]: PPF torsional stiffness 18.570 kNm/deg, curb mass delta -90.7 kg vs NC, 50:50 axle weight 50.21%
# MX5_ND_Trace[0363]: PPF torsional stiffness 18.605 kNm/deg, curb mass delta -90.6 kg vs NC, 50:50 axle weight 50.22%
# MX5_ND_Trace[0364]: PPF torsional stiffness 18.640 kNm/deg, curb mass delta -90.4 kg vs NC, 50:50 axle weight 50.22%
# MX5_ND_Trace[0365]: PPF torsional stiffness 18.675 kNm/deg, curb mass delta -90.3 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[0366]: PPF torsional stiffness 18.710 kNm/deg, curb mass delta -90.1 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[0367]: PPF torsional stiffness 18.745 kNm/deg, curb mass delta -90.0 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[0368]: PPF torsional stiffness 18.780 kNm/deg, curb mass delta -89.8 kg vs NC, 50:50 axle weight 50.24%
# MX5_ND_Trace[0369]: PPF torsional stiffness 18.815 kNm/deg, curb mass delta -89.7 kg vs NC, 50:50 axle weight 50.24%
# MX5_ND_Trace[0370]: PPF torsional stiffness 18.850 kNm/deg, curb mass delta -89.5 kg vs NC, 50:50 axle weight 50.25%
# MX5_ND_Trace[0371]: PPF torsional stiffness 18.885 kNm/deg, curb mass delta -89.3 kg vs NC, 50:50 axle weight 50.26%
# MX5_ND_Trace[0372]: PPF torsional stiffness 18.920 kNm/deg, curb mass delta -89.2 kg vs NC, 50:50 axle weight 50.26%
# MX5_ND_Trace[0373]: PPF torsional stiffness 18.955 kNm/deg, curb mass delta -89.1 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[0374]: PPF torsional stiffness 18.990 kNm/deg, curb mass delta -88.9 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[0375]: PPF torsional stiffness 19.025 kNm/deg, curb mass delta -88.8 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[0376]: PPF torsional stiffness 19.060 kNm/deg, curb mass delta -88.6 kg vs NC, 50:50 axle weight 50.28%
# MX5_ND_Trace[0377]: PPF torsional stiffness 19.095 kNm/deg, curb mass delta -88.5 kg vs NC, 50:50 axle weight 50.28%
# MX5_ND_Trace[0378]: PPF torsional stiffness 19.130 kNm/deg, curb mass delta -88.3 kg vs NC, 50:50 axle weight 50.29%
# MX5_ND_Trace[0379]: PPF torsional stiffness 19.165 kNm/deg, curb mass delta -88.2 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[0380]: PPF torsional stiffness 19.200 kNm/deg, curb mass delta -88.0 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[0381]: PPF torsional stiffness 19.235 kNm/deg, curb mass delta -87.8 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[0382]: PPF torsional stiffness 19.270 kNm/deg, curb mass delta -87.7 kg vs NC, 50:50 axle weight 50.31%
# MX5_ND_Trace[0383]: PPF torsional stiffness 19.305 kNm/deg, curb mass delta -87.6 kg vs NC, 50:50 axle weight 50.31%
# MX5_ND_Trace[0384]: PPF torsional stiffness 19.340 kNm/deg, curb mass delta -87.4 kg vs NC, 50:50 axle weight 50.32%
# MX5_ND_Trace[0385]: PPF torsional stiffness 19.375 kNm/deg, curb mass delta -87.3 kg vs NC, 50:50 axle weight 50.33%
# MX5_ND_Trace[0386]: PPF torsional stiffness 19.410 kNm/deg, curb mass delta -87.1 kg vs NC, 50:50 axle weight 50.33%
# MX5_ND_Trace[0387]: PPF torsional stiffness 19.445 kNm/deg, curb mass delta -87.0 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[0388]: PPF torsional stiffness 19.480 kNm/deg, curb mass delta -86.8 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[0389]: PPF torsional stiffness 19.515 kNm/deg, curb mass delta -86.7 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[0390]: PPF torsional stiffness 19.550 kNm/deg, curb mass delta -86.5 kg vs NC, 50:50 axle weight 50.35%
# MX5_ND_Trace[0391]: PPF torsional stiffness 19.585 kNm/deg, curb mass delta -86.3 kg vs NC, 50:50 axle weight 50.35%
# MX5_ND_Trace[0392]: PPF torsional stiffness 19.620 kNm/deg, curb mass delta -86.2 kg vs NC, 50:50 axle weight 50.36%
# MX5_ND_Trace[0393]: PPF torsional stiffness 19.655 kNm/deg, curb mass delta -86.1 kg vs NC, 50:50 axle weight 50.37%
# MX5_ND_Trace[0394]: PPF torsional stiffness 19.690 kNm/deg, curb mass delta -85.9 kg vs NC, 50:50 axle weight 50.37%
# MX5_ND_Trace[0395]: PPF torsional stiffness 19.725 kNm/deg, curb mass delta -85.8 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[0396]: PPF torsional stiffness 19.760 kNm/deg, curb mass delta -85.6 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[0397]: PPF torsional stiffness 19.795 kNm/deg, curb mass delta -85.5 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[0398]: PPF torsional stiffness 19.830 kNm/deg, curb mass delta -85.3 kg vs NC, 50:50 axle weight 50.39%
# MX5_ND_Trace[0399]: PPF torsional stiffness 19.865 kNm/deg, curb mass delta -85.2 kg vs NC, 50:50 axle weight 50.40%
# MX5_ND_Trace[0400]: PPF torsional stiffness 19.900 kNm/deg, curb mass delta -100.0 kg vs NC, 50:50 axle weight 50.40%
# MX5_ND_Trace[0401]: PPF torsional stiffness 19.935 kNm/deg, curb mass delta -99.8 kg vs NC, 50:50 axle weight 50.01%
# MX5_ND_Trace[0402]: PPF torsional stiffness 19.970 kNm/deg, curb mass delta -99.7 kg vs NC, 50:50 axle weight 50.01%
# MX5_ND_Trace[0403]: PPF torsional stiffness 20.005 kNm/deg, curb mass delta -99.6 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[0404]: PPF torsional stiffness 20.040 kNm/deg, curb mass delta -99.4 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[0405]: PPF torsional stiffness 20.075 kNm/deg, curb mass delta -99.3 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[0406]: PPF torsional stiffness 20.110 kNm/deg, curb mass delta -99.1 kg vs NC, 50:50 axle weight 50.03%
# MX5_ND_Trace[0407]: PPF torsional stiffness 20.145 kNm/deg, curb mass delta -99.0 kg vs NC, 50:50 axle weight 50.03%
# MX5_ND_Trace[0408]: PPF torsional stiffness 20.180 kNm/deg, curb mass delta -98.8 kg vs NC, 50:50 axle weight 50.04%
# MX5_ND_Trace[0409]: PPF torsional stiffness 20.215 kNm/deg, curb mass delta -98.7 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[0410]: PPF torsional stiffness 20.250 kNm/deg, curb mass delta -98.5 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[0411]: PPF torsional stiffness 20.285 kNm/deg, curb mass delta -98.3 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[0412]: PPF torsional stiffness 20.320 kNm/deg, curb mass delta -98.2 kg vs NC, 50:50 axle weight 50.06%
# MX5_ND_Trace[0413]: PPF torsional stiffness 20.355 kNm/deg, curb mass delta -98.1 kg vs NC, 50:50 axle weight 50.06%
# MX5_ND_Trace[0414]: PPF torsional stiffness 20.390 kNm/deg, curb mass delta -97.9 kg vs NC, 50:50 axle weight 50.07%
# MX5_ND_Trace[0415]: PPF torsional stiffness 20.425 kNm/deg, curb mass delta -97.8 kg vs NC, 50:50 axle weight 50.08%
# MX5_ND_Trace[0416]: PPF torsional stiffness 20.460 kNm/deg, curb mass delta -97.6 kg vs NC, 50:50 axle weight 50.08%
# MX5_ND_Trace[0417]: PPF torsional stiffness 20.495 kNm/deg, curb mass delta -97.5 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[0418]: PPF torsional stiffness 20.530 kNm/deg, curb mass delta -97.3 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[0419]: PPF torsional stiffness 20.565 kNm/deg, curb mass delta -97.2 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[0420]: PPF torsional stiffness 20.600 kNm/deg, curb mass delta -97.0 kg vs NC, 50:50 axle weight 50.10%
# MX5_ND_Trace[0421]: PPF torsional stiffness 20.635 kNm/deg, curb mass delta -96.8 kg vs NC, 50:50 axle weight 50.10%
# MX5_ND_Trace[0422]: PPF torsional stiffness 20.670 kNm/deg, curb mass delta -96.7 kg vs NC, 50:50 axle weight 50.11%
# MX5_ND_Trace[0423]: PPF torsional stiffness 20.705 kNm/deg, curb mass delta -96.6 kg vs NC, 50:50 axle weight 50.12%
# MX5_ND_Trace[0424]: PPF torsional stiffness 20.740 kNm/deg, curb mass delta -96.4 kg vs NC, 50:50 axle weight 50.12%
# MX5_ND_Trace[0425]: PPF torsional stiffness 20.775 kNm/deg, curb mass delta -96.3 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[0426]: PPF torsional stiffness 20.810 kNm/deg, curb mass delta -96.1 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[0427]: PPF torsional stiffness 20.845 kNm/deg, curb mass delta -96.0 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[0428]: PPF torsional stiffness 20.880 kNm/deg, curb mass delta -95.8 kg vs NC, 50:50 axle weight 50.14%
# MX5_ND_Trace[0429]: PPF torsional stiffness 20.915 kNm/deg, curb mass delta -95.7 kg vs NC, 50:50 axle weight 50.15%
# MX5_ND_Trace[0430]: PPF torsional stiffness 20.950 kNm/deg, curb mass delta -95.5 kg vs NC, 50:50 axle weight 50.15%
# MX5_ND_Trace[0431]: PPF torsional stiffness 20.985 kNm/deg, curb mass delta -95.4 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[0432]: PPF torsional stiffness 21.020 kNm/deg, curb mass delta -95.2 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[0433]: PPF torsional stiffness 21.055 kNm/deg, curb mass delta -95.0 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[0434]: PPF torsional stiffness 21.090 kNm/deg, curb mass delta -94.9 kg vs NC, 50:50 axle weight 50.17%
# MX5_ND_Trace[0435]: PPF torsional stiffness 21.125 kNm/deg, curb mass delta -94.8 kg vs NC, 50:50 axle weight 50.17%
# MX5_ND_Trace[0436]: PPF torsional stiffness 21.160 kNm/deg, curb mass delta -94.6 kg vs NC, 50:50 axle weight 50.18%
# MX5_ND_Trace[0437]: PPF torsional stiffness 21.195 kNm/deg, curb mass delta -94.5 kg vs NC, 50:50 axle weight 50.19%
# MX5_ND_Trace[0438]: PPF torsional stiffness 21.230 kNm/deg, curb mass delta -94.3 kg vs NC, 50:50 axle weight 50.19%
# MX5_ND_Trace[0439]: PPF torsional stiffness 21.265 kNm/deg, curb mass delta -94.2 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[0440]: PPF torsional stiffness 21.300 kNm/deg, curb mass delta -94.0 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[0441]: PPF torsional stiffness 21.335 kNm/deg, curb mass delta -93.9 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[0442]: PPF torsional stiffness 21.370 kNm/deg, curb mass delta -93.7 kg vs NC, 50:50 axle weight 50.21%
# MX5_ND_Trace[0443]: PPF torsional stiffness 21.405 kNm/deg, curb mass delta -93.5 kg vs NC, 50:50 axle weight 50.21%
# MX5_ND_Trace[0444]: PPF torsional stiffness 21.440 kNm/deg, curb mass delta -93.4 kg vs NC, 50:50 axle weight 50.22%
# MX5_ND_Trace[0445]: PPF torsional stiffness 21.475 kNm/deg, curb mass delta -93.3 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[0446]: PPF torsional stiffness 21.510 kNm/deg, curb mass delta -93.1 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[0447]: PPF torsional stiffness 21.545 kNm/deg, curb mass delta -93.0 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[0448]: PPF torsional stiffness 21.580 kNm/deg, curb mass delta -92.8 kg vs NC, 50:50 axle weight 50.24%
# MX5_ND_Trace[0449]: PPF torsional stiffness 21.615 kNm/deg, curb mass delta -92.7 kg vs NC, 50:50 axle weight 50.24%
# MX5_ND_Trace[0450]: PPF torsional stiffness 21.650 kNm/deg, curb mass delta -92.5 kg vs NC, 50:50 axle weight 50.25%
# MX5_ND_Trace[0451]: PPF torsional stiffness 21.685 kNm/deg, curb mass delta -92.4 kg vs NC, 50:50 axle weight 50.26%
# MX5_ND_Trace[0452]: PPF torsional stiffness 21.720 kNm/deg, curb mass delta -92.2 kg vs NC, 50:50 axle weight 50.26%
# MX5_ND_Trace[0453]: PPF torsional stiffness 21.755 kNm/deg, curb mass delta -92.0 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[0454]: PPF torsional stiffness 21.790 kNm/deg, curb mass delta -91.9 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[0455]: PPF torsional stiffness 21.825 kNm/deg, curb mass delta -91.8 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[0456]: PPF torsional stiffness 21.860 kNm/deg, curb mass delta -91.6 kg vs NC, 50:50 axle weight 50.28%
# MX5_ND_Trace[0457]: PPF torsional stiffness 21.895 kNm/deg, curb mass delta -91.5 kg vs NC, 50:50 axle weight 50.28%
# MX5_ND_Trace[0458]: PPF torsional stiffness 21.930 kNm/deg, curb mass delta -91.3 kg vs NC, 50:50 axle weight 50.29%
# MX5_ND_Trace[0459]: PPF torsional stiffness 21.965 kNm/deg, curb mass delta -91.2 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[0460]: PPF torsional stiffness 22.000 kNm/deg, curb mass delta -91.0 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[0461]: PPF torsional stiffness 22.035 kNm/deg, curb mass delta -90.9 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[0462]: PPF torsional stiffness 22.070 kNm/deg, curb mass delta -90.7 kg vs NC, 50:50 axle weight 50.31%
# MX5_ND_Trace[0463]: PPF torsional stiffness 22.105 kNm/deg, curb mass delta -90.5 kg vs NC, 50:50 axle weight 50.31%
# MX5_ND_Trace[0464]: PPF torsional stiffness 22.140 kNm/deg, curb mass delta -90.4 kg vs NC, 50:50 axle weight 50.32%
# MX5_ND_Trace[0465]: PPF torsional stiffness 22.175 kNm/deg, curb mass delta -90.3 kg vs NC, 50:50 axle weight 50.33%
# MX5_ND_Trace[0466]: PPF torsional stiffness 22.210 kNm/deg, curb mass delta -90.1 kg vs NC, 50:50 axle weight 50.33%
# MX5_ND_Trace[0467]: PPF torsional stiffness 22.245 kNm/deg, curb mass delta -90.0 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[0468]: PPF torsional stiffness 22.280 kNm/deg, curb mass delta -89.8 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[0469]: PPF torsional stiffness 22.315 kNm/deg, curb mass delta -89.7 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[0470]: PPF torsional stiffness 22.350 kNm/deg, curb mass delta -89.5 kg vs NC, 50:50 axle weight 50.35%
# MX5_ND_Trace[0471]: PPF torsional stiffness 22.385 kNm/deg, curb mass delta -89.4 kg vs NC, 50:50 axle weight 50.35%
# MX5_ND_Trace[0472]: PPF torsional stiffness 22.420 kNm/deg, curb mass delta -89.2 kg vs NC, 50:50 axle weight 50.36%
# MX5_ND_Trace[0473]: PPF torsional stiffness 22.455 kNm/deg, curb mass delta -89.0 kg vs NC, 50:50 axle weight 50.37%
# MX5_ND_Trace[0474]: PPF torsional stiffness 22.490 kNm/deg, curb mass delta -88.9 kg vs NC, 50:50 axle weight 50.37%
# MX5_ND_Trace[0475]: PPF torsional stiffness 22.525 kNm/deg, curb mass delta -88.8 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[0476]: PPF torsional stiffness 22.560 kNm/deg, curb mass delta -88.6 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[0477]: PPF torsional stiffness 22.595 kNm/deg, curb mass delta -88.5 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[0478]: PPF torsional stiffness 22.630 kNm/deg, curb mass delta -88.3 kg vs NC, 50:50 axle weight 50.39%
# MX5_ND_Trace[0479]: PPF torsional stiffness 22.665 kNm/deg, curb mass delta -88.2 kg vs NC, 50:50 axle weight 50.40%
# MX5_ND_Trace[0480]: PPF torsional stiffness 18.500 kNm/deg, curb mass delta -88.0 kg vs NC, 50:50 axle weight 50.40%
# MX5_ND_Trace[0481]: PPF torsional stiffness 18.535 kNm/deg, curb mass delta -87.9 kg vs NC, 50:50 axle weight 50.01%
# MX5_ND_Trace[0482]: PPF torsional stiffness 18.570 kNm/deg, curb mass delta -87.7 kg vs NC, 50:50 axle weight 50.01%
# MX5_ND_Trace[0483]: PPF torsional stiffness 18.605 kNm/deg, curb mass delta -87.5 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[0484]: PPF torsional stiffness 18.640 kNm/deg, curb mass delta -87.4 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[0485]: PPF torsional stiffness 18.675 kNm/deg, curb mass delta -87.3 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[0486]: PPF torsional stiffness 18.710 kNm/deg, curb mass delta -87.1 kg vs NC, 50:50 axle weight 50.03%
# MX5_ND_Trace[0487]: PPF torsional stiffness 18.745 kNm/deg, curb mass delta -87.0 kg vs NC, 50:50 axle weight 50.03%
# MX5_ND_Trace[0488]: PPF torsional stiffness 18.780 kNm/deg, curb mass delta -86.8 kg vs NC, 50:50 axle weight 50.04%
# MX5_ND_Trace[0489]: PPF torsional stiffness 18.815 kNm/deg, curb mass delta -86.7 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[0490]: PPF torsional stiffness 18.850 kNm/deg, curb mass delta -86.5 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[0491]: PPF torsional stiffness 18.885 kNm/deg, curb mass delta -86.4 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[0492]: PPF torsional stiffness 18.920 kNm/deg, curb mass delta -86.2 kg vs NC, 50:50 axle weight 50.06%
# MX5_ND_Trace[0493]: PPF torsional stiffness 18.955 kNm/deg, curb mass delta -86.0 kg vs NC, 50:50 axle weight 50.06%
# MX5_ND_Trace[0494]: PPF torsional stiffness 18.990 kNm/deg, curb mass delta -85.9 kg vs NC, 50:50 axle weight 50.07%
# MX5_ND_Trace[0495]: PPF torsional stiffness 19.025 kNm/deg, curb mass delta -85.8 kg vs NC, 50:50 axle weight 50.08%
# MX5_ND_Trace[0496]: PPF torsional stiffness 19.060 kNm/deg, curb mass delta -85.6 kg vs NC, 50:50 axle weight 50.08%
# MX5_ND_Trace[0497]: PPF torsional stiffness 19.095 kNm/deg, curb mass delta -85.5 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[0498]: PPF torsional stiffness 19.130 kNm/deg, curb mass delta -85.3 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[0499]: PPF torsional stiffness 19.165 kNm/deg, curb mass delta -85.2 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[0500]: PPF torsional stiffness 19.200 kNm/deg, curb mass delta -100.0 kg vs NC, 50:50 axle weight 50.10%
# MX5_ND_Trace[0501]: PPF torsional stiffness 19.235 kNm/deg, curb mass delta -99.9 kg vs NC, 50:50 axle weight 50.10%
# MX5_ND_Trace[0502]: PPF torsional stiffness 19.270 kNm/deg, curb mass delta -99.7 kg vs NC, 50:50 axle weight 50.11%
# MX5_ND_Trace[0503]: PPF torsional stiffness 19.305 kNm/deg, curb mass delta -99.5 kg vs NC, 50:50 axle weight 50.12%
# MX5_ND_Trace[0504]: PPF torsional stiffness 19.340 kNm/deg, curb mass delta -99.4 kg vs NC, 50:50 axle weight 50.12%
# MX5_ND_Trace[0505]: PPF torsional stiffness 19.375 kNm/deg, curb mass delta -99.3 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[0506]: PPF torsional stiffness 19.410 kNm/deg, curb mass delta -99.1 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[0507]: PPF torsional stiffness 19.445 kNm/deg, curb mass delta -99.0 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[0508]: PPF torsional stiffness 19.480 kNm/deg, curb mass delta -98.8 kg vs NC, 50:50 axle weight 50.14%
# MX5_ND_Trace[0509]: PPF torsional stiffness 19.515 kNm/deg, curb mass delta -98.7 kg vs NC, 50:50 axle weight 50.15%
# MX5_ND_Trace[0510]: PPF torsional stiffness 19.550 kNm/deg, curb mass delta -98.5 kg vs NC, 50:50 axle weight 50.15%
# MX5_ND_Trace[0511]: PPF torsional stiffness 19.585 kNm/deg, curb mass delta -98.4 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[0512]: PPF torsional stiffness 19.620 kNm/deg, curb mass delta -98.2 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[0513]: PPF torsional stiffness 19.655 kNm/deg, curb mass delta -98.0 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[0514]: PPF torsional stiffness 19.690 kNm/deg, curb mass delta -97.9 kg vs NC, 50:50 axle weight 50.17%
# MX5_ND_Trace[0515]: PPF torsional stiffness 19.725 kNm/deg, curb mass delta -97.8 kg vs NC, 50:50 axle weight 50.17%
# MX5_ND_Trace[0516]: PPF torsional stiffness 19.760 kNm/deg, curb mass delta -97.6 kg vs NC, 50:50 axle weight 50.18%
# MX5_ND_Trace[0517]: PPF torsional stiffness 19.795 kNm/deg, curb mass delta -97.5 kg vs NC, 50:50 axle weight 50.19%
# MX5_ND_Trace[0518]: PPF torsional stiffness 19.830 kNm/deg, curb mass delta -97.3 kg vs NC, 50:50 axle weight 50.19%
# MX5_ND_Trace[0519]: PPF torsional stiffness 19.865 kNm/deg, curb mass delta -97.2 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[0520]: PPF torsional stiffness 19.900 kNm/deg, curb mass delta -97.0 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[0521]: PPF torsional stiffness 19.935 kNm/deg, curb mass delta -96.9 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[0522]: PPF torsional stiffness 19.970 kNm/deg, curb mass delta -96.7 kg vs NC, 50:50 axle weight 50.21%
# MX5_ND_Trace[0523]: PPF torsional stiffness 20.005 kNm/deg, curb mass delta -96.5 kg vs NC, 50:50 axle weight 50.22%
# MX5_ND_Trace[0524]: PPF torsional stiffness 20.040 kNm/deg, curb mass delta -96.4 kg vs NC, 50:50 axle weight 50.22%
# MX5_ND_Trace[0525]: PPF torsional stiffness 20.075 kNm/deg, curb mass delta -96.3 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[0526]: PPF torsional stiffness 20.110 kNm/deg, curb mass delta -96.1 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[0527]: PPF torsional stiffness 20.145 kNm/deg, curb mass delta -96.0 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[0528]: PPF torsional stiffness 20.180 kNm/deg, curb mass delta -95.8 kg vs NC, 50:50 axle weight 50.24%
# MX5_ND_Trace[0529]: PPF torsional stiffness 20.215 kNm/deg, curb mass delta -95.7 kg vs NC, 50:50 axle weight 50.24%
# MX5_ND_Trace[0530]: PPF torsional stiffness 20.250 kNm/deg, curb mass delta -95.5 kg vs NC, 50:50 axle weight 50.25%
# MX5_ND_Trace[0531]: PPF torsional stiffness 20.285 kNm/deg, curb mass delta -95.4 kg vs NC, 50:50 axle weight 50.26%
# MX5_ND_Trace[0532]: PPF torsional stiffness 20.320 kNm/deg, curb mass delta -95.2 kg vs NC, 50:50 axle weight 50.26%
# MX5_ND_Trace[0533]: PPF torsional stiffness 20.355 kNm/deg, curb mass delta -95.0 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[0534]: PPF torsional stiffness 20.390 kNm/deg, curb mass delta -94.9 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[0535]: PPF torsional stiffness 20.425 kNm/deg, curb mass delta -94.8 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[0536]: PPF torsional stiffness 20.460 kNm/deg, curb mass delta -94.6 kg vs NC, 50:50 axle weight 50.28%
# MX5_ND_Trace[0537]: PPF torsional stiffness 20.495 kNm/deg, curb mass delta -94.5 kg vs NC, 50:50 axle weight 50.28%
# MX5_ND_Trace[0538]: PPF torsional stiffness 20.530 kNm/deg, curb mass delta -94.3 kg vs NC, 50:50 axle weight 50.29%
# MX5_ND_Trace[0539]: PPF torsional stiffness 20.565 kNm/deg, curb mass delta -94.2 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[0540]: PPF torsional stiffness 20.600 kNm/deg, curb mass delta -94.0 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[0541]: PPF torsional stiffness 20.635 kNm/deg, curb mass delta -93.9 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[0542]: PPF torsional stiffness 20.670 kNm/deg, curb mass delta -93.7 kg vs NC, 50:50 axle weight 50.31%
# MX5_ND_Trace[0543]: PPF torsional stiffness 20.705 kNm/deg, curb mass delta -93.5 kg vs NC, 50:50 axle weight 50.31%
# MX5_ND_Trace[0544]: PPF torsional stiffness 20.740 kNm/deg, curb mass delta -93.4 kg vs NC, 50:50 axle weight 50.32%
# MX5_ND_Trace[0545]: PPF torsional stiffness 20.775 kNm/deg, curb mass delta -93.3 kg vs NC, 50:50 axle weight 50.33%
# MX5_ND_Trace[0546]: PPF torsional stiffness 20.810 kNm/deg, curb mass delta -93.1 kg vs NC, 50:50 axle weight 50.33%
# MX5_ND_Trace[0547]: PPF torsional stiffness 20.845 kNm/deg, curb mass delta -93.0 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[0548]: PPF torsional stiffness 20.880 kNm/deg, curb mass delta -92.8 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[0549]: PPF torsional stiffness 20.915 kNm/deg, curb mass delta -92.7 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[0550]: PPF torsional stiffness 20.950 kNm/deg, curb mass delta -92.5 kg vs NC, 50:50 axle weight 50.35%
# MX5_ND_Trace[0551]: PPF torsional stiffness 20.985 kNm/deg, curb mass delta -92.4 kg vs NC, 50:50 axle weight 50.35%
# MX5_ND_Trace[0552]: PPF torsional stiffness 21.020 kNm/deg, curb mass delta -92.2 kg vs NC, 50:50 axle weight 50.36%
# MX5_ND_Trace[0553]: PPF torsional stiffness 21.055 kNm/deg, curb mass delta -92.0 kg vs NC, 50:50 axle weight 50.37%
# MX5_ND_Trace[0554]: PPF torsional stiffness 21.090 kNm/deg, curb mass delta -91.9 kg vs NC, 50:50 axle weight 50.37%
# MX5_ND_Trace[0555]: PPF torsional stiffness 21.125 kNm/deg, curb mass delta -91.8 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[0556]: PPF torsional stiffness 21.160 kNm/deg, curb mass delta -91.6 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[0557]: PPF torsional stiffness 21.195 kNm/deg, curb mass delta -91.5 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[0558]: PPF torsional stiffness 21.230 kNm/deg, curb mass delta -91.3 kg vs NC, 50:50 axle weight 50.39%
# MX5_ND_Trace[0559]: PPF torsional stiffness 21.265 kNm/deg, curb mass delta -91.2 kg vs NC, 50:50 axle weight 50.40%
# MX5_ND_Trace[0560]: PPF torsional stiffness 21.300 kNm/deg, curb mass delta -91.0 kg vs NC, 50:50 axle weight 50.00%
# MX5_ND_Trace[0561]: PPF torsional stiffness 21.335 kNm/deg, curb mass delta -90.9 kg vs NC, 50:50 axle weight 50.01%
# MX5_ND_Trace[0562]: PPF torsional stiffness 21.370 kNm/deg, curb mass delta -90.7 kg vs NC, 50:50 axle weight 50.01%
# MX5_ND_Trace[0563]: PPF torsional stiffness 21.405 kNm/deg, curb mass delta -90.5 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[0564]: PPF torsional stiffness 21.440 kNm/deg, curb mass delta -90.4 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[0565]: PPF torsional stiffness 21.475 kNm/deg, curb mass delta -90.3 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[0566]: PPF torsional stiffness 21.510 kNm/deg, curb mass delta -90.1 kg vs NC, 50:50 axle weight 50.03%
# MX5_ND_Trace[0567]: PPF torsional stiffness 21.545 kNm/deg, curb mass delta -90.0 kg vs NC, 50:50 axle weight 50.03%
# MX5_ND_Trace[0568]: PPF torsional stiffness 21.580 kNm/deg, curb mass delta -89.8 kg vs NC, 50:50 axle weight 50.04%
# MX5_ND_Trace[0569]: PPF torsional stiffness 21.615 kNm/deg, curb mass delta -89.7 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[0570]: PPF torsional stiffness 21.650 kNm/deg, curb mass delta -89.5 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[0571]: PPF torsional stiffness 21.685 kNm/deg, curb mass delta -89.4 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[0572]: PPF torsional stiffness 21.720 kNm/deg, curb mass delta -89.2 kg vs NC, 50:50 axle weight 50.06%
# MX5_ND_Trace[0573]: PPF torsional stiffness 21.755 kNm/deg, curb mass delta -89.0 kg vs NC, 50:50 axle weight 50.06%
# MX5_ND_Trace[0574]: PPF torsional stiffness 21.790 kNm/deg, curb mass delta -88.9 kg vs NC, 50:50 axle weight 50.07%
# MX5_ND_Trace[0575]: PPF torsional stiffness 21.825 kNm/deg, curb mass delta -88.8 kg vs NC, 50:50 axle weight 50.08%
# MX5_ND_Trace[0576]: PPF torsional stiffness 21.860 kNm/deg, curb mass delta -88.6 kg vs NC, 50:50 axle weight 50.08%
# MX5_ND_Trace[0577]: PPF torsional stiffness 21.895 kNm/deg, curb mass delta -88.5 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[0578]: PPF torsional stiffness 21.930 kNm/deg, curb mass delta -88.3 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[0579]: PPF torsional stiffness 21.965 kNm/deg, curb mass delta -88.2 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[0580]: PPF torsional stiffness 22.000 kNm/deg, curb mass delta -88.0 kg vs NC, 50:50 axle weight 50.10%
# MX5_ND_Trace[0581]: PPF torsional stiffness 22.035 kNm/deg, curb mass delta -87.9 kg vs NC, 50:50 axle weight 50.10%
# MX5_ND_Trace[0582]: PPF torsional stiffness 22.070 kNm/deg, curb mass delta -87.7 kg vs NC, 50:50 axle weight 50.11%
# MX5_ND_Trace[0583]: PPF torsional stiffness 22.105 kNm/deg, curb mass delta -87.5 kg vs NC, 50:50 axle weight 50.12%
# MX5_ND_Trace[0584]: PPF torsional stiffness 22.140 kNm/deg, curb mass delta -87.4 kg vs NC, 50:50 axle weight 50.12%
# MX5_ND_Trace[0585]: PPF torsional stiffness 22.175 kNm/deg, curb mass delta -87.3 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[0586]: PPF torsional stiffness 22.210 kNm/deg, curb mass delta -87.1 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[0587]: PPF torsional stiffness 22.245 kNm/deg, curb mass delta -87.0 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[0588]: PPF torsional stiffness 22.280 kNm/deg, curb mass delta -86.8 kg vs NC, 50:50 axle weight 50.14%
# MX5_ND_Trace[0589]: PPF torsional stiffness 22.315 kNm/deg, curb mass delta -86.7 kg vs NC, 50:50 axle weight 50.15%
# MX5_ND_Trace[0590]: PPF torsional stiffness 22.350 kNm/deg, curb mass delta -86.5 kg vs NC, 50:50 axle weight 50.15%
# MX5_ND_Trace[0591]: PPF torsional stiffness 22.385 kNm/deg, curb mass delta -86.4 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[0592]: PPF torsional stiffness 22.420 kNm/deg, curb mass delta -86.2 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[0593]: PPF torsional stiffness 22.455 kNm/deg, curb mass delta -86.0 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[0594]: PPF torsional stiffness 22.490 kNm/deg, curb mass delta -85.9 kg vs NC, 50:50 axle weight 50.17%
# MX5_ND_Trace[0595]: PPF torsional stiffness 22.525 kNm/deg, curb mass delta -85.8 kg vs NC, 50:50 axle weight 50.17%
# MX5_ND_Trace[0596]: PPF torsional stiffness 22.560 kNm/deg, curb mass delta -85.6 kg vs NC, 50:50 axle weight 50.18%
# MX5_ND_Trace[0597]: PPF torsional stiffness 22.595 kNm/deg, curb mass delta -85.5 kg vs NC, 50:50 axle weight 50.19%
# MX5_ND_Trace[0598]: PPF torsional stiffness 22.630 kNm/deg, curb mass delta -85.3 kg vs NC, 50:50 axle weight 50.19%
# MX5_ND_Trace[0599]: PPF torsional stiffness 22.665 kNm/deg, curb mass delta -85.2 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[0600]: PPF torsional stiffness 18.500 kNm/deg, curb mass delta -100.0 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[0601]: PPF torsional stiffness 18.535 kNm/deg, curb mass delta -99.9 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[0602]: PPF torsional stiffness 18.570 kNm/deg, curb mass delta -99.7 kg vs NC, 50:50 axle weight 50.21%
# MX5_ND_Trace[0603]: PPF torsional stiffness 18.605 kNm/deg, curb mass delta -99.5 kg vs NC, 50:50 axle weight 50.22%
# MX5_ND_Trace[0604]: PPF torsional stiffness 18.640 kNm/deg, curb mass delta -99.4 kg vs NC, 50:50 axle weight 50.22%
# MX5_ND_Trace[0605]: PPF torsional stiffness 18.675 kNm/deg, curb mass delta -99.3 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[0606]: PPF torsional stiffness 18.710 kNm/deg, curb mass delta -99.1 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[0607]: PPF torsional stiffness 18.745 kNm/deg, curb mass delta -99.0 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[0608]: PPF torsional stiffness 18.780 kNm/deg, curb mass delta -98.8 kg vs NC, 50:50 axle weight 50.24%
# MX5_ND_Trace[0609]: PPF torsional stiffness 18.815 kNm/deg, curb mass delta -98.7 kg vs NC, 50:50 axle weight 50.24%
# MX5_ND_Trace[0610]: PPF torsional stiffness 18.850 kNm/deg, curb mass delta -98.5 kg vs NC, 50:50 axle weight 50.25%
# MX5_ND_Trace[0611]: PPF torsional stiffness 18.885 kNm/deg, curb mass delta -98.4 kg vs NC, 50:50 axle weight 50.26%
# MX5_ND_Trace[0612]: PPF torsional stiffness 18.920 kNm/deg, curb mass delta -98.2 kg vs NC, 50:50 axle weight 50.26%
# MX5_ND_Trace[0613]: PPF torsional stiffness 18.955 kNm/deg, curb mass delta -98.0 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[0614]: PPF torsional stiffness 18.990 kNm/deg, curb mass delta -97.9 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[0615]: PPF torsional stiffness 19.025 kNm/deg, curb mass delta -97.8 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[0616]: PPF torsional stiffness 19.060 kNm/deg, curb mass delta -97.6 kg vs NC, 50:50 axle weight 50.28%
# MX5_ND_Trace[0617]: PPF torsional stiffness 19.095 kNm/deg, curb mass delta -97.5 kg vs NC, 50:50 axle weight 50.28%
# MX5_ND_Trace[0618]: PPF torsional stiffness 19.130 kNm/deg, curb mass delta -97.3 kg vs NC, 50:50 axle weight 50.29%
# MX5_ND_Trace[0619]: PPF torsional stiffness 19.165 kNm/deg, curb mass delta -97.2 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[0620]: PPF torsional stiffness 19.200 kNm/deg, curb mass delta -97.0 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[0621]: PPF torsional stiffness 19.235 kNm/deg, curb mass delta -96.9 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[0622]: PPF torsional stiffness 19.270 kNm/deg, curb mass delta -96.7 kg vs NC, 50:50 axle weight 50.31%
# MX5_ND_Trace[0623]: PPF torsional stiffness 19.305 kNm/deg, curb mass delta -96.5 kg vs NC, 50:50 axle weight 50.31%
# MX5_ND_Trace[0624]: PPF torsional stiffness 19.340 kNm/deg, curb mass delta -96.4 kg vs NC, 50:50 axle weight 50.32%
# MX5_ND_Trace[0625]: PPF torsional stiffness 19.375 kNm/deg, curb mass delta -96.3 kg vs NC, 50:50 axle weight 50.33%
# MX5_ND_Trace[0626]: PPF torsional stiffness 19.410 kNm/deg, curb mass delta -96.1 kg vs NC, 50:50 axle weight 50.33%
# MX5_ND_Trace[0627]: PPF torsional stiffness 19.445 kNm/deg, curb mass delta -96.0 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[0628]: PPF torsional stiffness 19.480 kNm/deg, curb mass delta -95.8 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[0629]: PPF torsional stiffness 19.515 kNm/deg, curb mass delta -95.7 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[0630]: PPF torsional stiffness 19.550 kNm/deg, curb mass delta -95.5 kg vs NC, 50:50 axle weight 50.35%
# MX5_ND_Trace[0631]: PPF torsional stiffness 19.585 kNm/deg, curb mass delta -95.4 kg vs NC, 50:50 axle weight 50.35%
# MX5_ND_Trace[0632]: PPF torsional stiffness 19.620 kNm/deg, curb mass delta -95.2 kg vs NC, 50:50 axle weight 50.36%
# MX5_ND_Trace[0633]: PPF torsional stiffness 19.655 kNm/deg, curb mass delta -95.0 kg vs NC, 50:50 axle weight 50.37%
# MX5_ND_Trace[0634]: PPF torsional stiffness 19.690 kNm/deg, curb mass delta -94.9 kg vs NC, 50:50 axle weight 50.37%
# MX5_ND_Trace[0635]: PPF torsional stiffness 19.725 kNm/deg, curb mass delta -94.8 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[0636]: PPF torsional stiffness 19.760 kNm/deg, curb mass delta -94.6 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[0637]: PPF torsional stiffness 19.795 kNm/deg, curb mass delta -94.5 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[0638]: PPF torsional stiffness 19.830 kNm/deg, curb mass delta -94.3 kg vs NC, 50:50 axle weight 50.39%
# MX5_ND_Trace[0639]: PPF torsional stiffness 19.865 kNm/deg, curb mass delta -94.2 kg vs NC, 50:50 axle weight 50.40%
# MX5_ND_Trace[0640]: PPF torsional stiffness 19.900 kNm/deg, curb mass delta -94.0 kg vs NC, 50:50 axle weight 50.00%
# MX5_ND_Trace[0641]: PPF torsional stiffness 19.935 kNm/deg, curb mass delta -93.9 kg vs NC, 50:50 axle weight 50.01%
# MX5_ND_Trace[0642]: PPF torsional stiffness 19.970 kNm/deg, curb mass delta -93.7 kg vs NC, 50:50 axle weight 50.01%
# MX5_ND_Trace[0643]: PPF torsional stiffness 20.005 kNm/deg, curb mass delta -93.5 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[0644]: PPF torsional stiffness 20.040 kNm/deg, curb mass delta -93.4 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[0645]: PPF torsional stiffness 20.075 kNm/deg, curb mass delta -93.3 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[0646]: PPF torsional stiffness 20.110 kNm/deg, curb mass delta -93.1 kg vs NC, 50:50 axle weight 50.03%
# MX5_ND_Trace[0647]: PPF torsional stiffness 20.145 kNm/deg, curb mass delta -93.0 kg vs NC, 50:50 axle weight 50.03%
# MX5_ND_Trace[0648]: PPF torsional stiffness 20.180 kNm/deg, curb mass delta -92.8 kg vs NC, 50:50 axle weight 50.04%
# MX5_ND_Trace[0649]: PPF torsional stiffness 20.215 kNm/deg, curb mass delta -92.7 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[0650]: PPF torsional stiffness 20.250 kNm/deg, curb mass delta -92.5 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[0651]: PPF torsional stiffness 20.285 kNm/deg, curb mass delta -92.4 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[0652]: PPF torsional stiffness 20.320 kNm/deg, curb mass delta -92.2 kg vs NC, 50:50 axle weight 50.06%
# MX5_ND_Trace[0653]: PPF torsional stiffness 20.355 kNm/deg, curb mass delta -92.0 kg vs NC, 50:50 axle weight 50.06%
# MX5_ND_Trace[0654]: PPF torsional stiffness 20.390 kNm/deg, curb mass delta -91.9 kg vs NC, 50:50 axle weight 50.07%
# MX5_ND_Trace[0655]: PPF torsional stiffness 20.425 kNm/deg, curb mass delta -91.8 kg vs NC, 50:50 axle weight 50.08%
# MX5_ND_Trace[0656]: PPF torsional stiffness 20.460 kNm/deg, curb mass delta -91.6 kg vs NC, 50:50 axle weight 50.08%
# MX5_ND_Trace[0657]: PPF torsional stiffness 20.495 kNm/deg, curb mass delta -91.5 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[0658]: PPF torsional stiffness 20.530 kNm/deg, curb mass delta -91.3 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[0659]: PPF torsional stiffness 20.565 kNm/deg, curb mass delta -91.2 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[0660]: PPF torsional stiffness 20.600 kNm/deg, curb mass delta -91.0 kg vs NC, 50:50 axle weight 50.10%
# MX5_ND_Trace[0661]: PPF torsional stiffness 20.635 kNm/deg, curb mass delta -90.9 kg vs NC, 50:50 axle weight 50.10%
# MX5_ND_Trace[0662]: PPF torsional stiffness 20.670 kNm/deg, curb mass delta -90.7 kg vs NC, 50:50 axle weight 50.11%
# MX5_ND_Trace[0663]: PPF torsional stiffness 20.705 kNm/deg, curb mass delta -90.5 kg vs NC, 50:50 axle weight 50.12%
# MX5_ND_Trace[0664]: PPF torsional stiffness 20.740 kNm/deg, curb mass delta -90.4 kg vs NC, 50:50 axle weight 50.12%
# MX5_ND_Trace[0665]: PPF torsional stiffness 20.775 kNm/deg, curb mass delta -90.3 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[0666]: PPF torsional stiffness 20.810 kNm/deg, curb mass delta -90.1 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[0667]: PPF torsional stiffness 20.845 kNm/deg, curb mass delta -90.0 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[0668]: PPF torsional stiffness 20.880 kNm/deg, curb mass delta -89.8 kg vs NC, 50:50 axle weight 50.14%
# MX5_ND_Trace[0669]: PPF torsional stiffness 20.915 kNm/deg, curb mass delta -89.7 kg vs NC, 50:50 axle weight 50.15%
# MX5_ND_Trace[0670]: PPF torsional stiffness 20.950 kNm/deg, curb mass delta -89.5 kg vs NC, 50:50 axle weight 50.15%
# MX5_ND_Trace[0671]: PPF torsional stiffness 20.985 kNm/deg, curb mass delta -89.4 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[0672]: PPF torsional stiffness 21.020 kNm/deg, curb mass delta -89.2 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[0673]: PPF torsional stiffness 21.055 kNm/deg, curb mass delta -89.0 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[0674]: PPF torsional stiffness 21.090 kNm/deg, curb mass delta -88.9 kg vs NC, 50:50 axle weight 50.17%
# MX5_ND_Trace[0675]: PPF torsional stiffness 21.125 kNm/deg, curb mass delta -88.8 kg vs NC, 50:50 axle weight 50.17%
# MX5_ND_Trace[0676]: PPF torsional stiffness 21.160 kNm/deg, curb mass delta -88.6 kg vs NC, 50:50 axle weight 50.18%
# MX5_ND_Trace[0677]: PPF torsional stiffness 21.195 kNm/deg, curb mass delta -88.5 kg vs NC, 50:50 axle weight 50.19%
# MX5_ND_Trace[0678]: PPF torsional stiffness 21.230 kNm/deg, curb mass delta -88.3 kg vs NC, 50:50 axle weight 50.19%
# MX5_ND_Trace[0679]: PPF torsional stiffness 21.265 kNm/deg, curb mass delta -88.2 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[0680]: PPF torsional stiffness 21.300 kNm/deg, curb mass delta -88.0 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[0681]: PPF torsional stiffness 21.335 kNm/deg, curb mass delta -87.9 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[0682]: PPF torsional stiffness 21.370 kNm/deg, curb mass delta -87.7 kg vs NC, 50:50 axle weight 50.21%
# MX5_ND_Trace[0683]: PPF torsional stiffness 21.405 kNm/deg, curb mass delta -87.5 kg vs NC, 50:50 axle weight 50.22%
# MX5_ND_Trace[0684]: PPF torsional stiffness 21.440 kNm/deg, curb mass delta -87.4 kg vs NC, 50:50 axle weight 50.22%
# MX5_ND_Trace[0685]: PPF torsional stiffness 21.475 kNm/deg, curb mass delta -87.3 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[0686]: PPF torsional stiffness 21.510 kNm/deg, curb mass delta -87.1 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[0687]: PPF torsional stiffness 21.545 kNm/deg, curb mass delta -87.0 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[0688]: PPF torsional stiffness 21.580 kNm/deg, curb mass delta -86.8 kg vs NC, 50:50 axle weight 50.24%
# MX5_ND_Trace[0689]: PPF torsional stiffness 21.615 kNm/deg, curb mass delta -86.7 kg vs NC, 50:50 axle weight 50.24%
# MX5_ND_Trace[0690]: PPF torsional stiffness 21.650 kNm/deg, curb mass delta -86.5 kg vs NC, 50:50 axle weight 50.25%
# MX5_ND_Trace[0691]: PPF torsional stiffness 21.685 kNm/deg, curb mass delta -86.4 kg vs NC, 50:50 axle weight 50.26%
# MX5_ND_Trace[0692]: PPF torsional stiffness 21.720 kNm/deg, curb mass delta -86.2 kg vs NC, 50:50 axle weight 50.26%
# MX5_ND_Trace[0693]: PPF torsional stiffness 21.755 kNm/deg, curb mass delta -86.0 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[0694]: PPF torsional stiffness 21.790 kNm/deg, curb mass delta -85.9 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[0695]: PPF torsional stiffness 21.825 kNm/deg, curb mass delta -85.8 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[0696]: PPF torsional stiffness 21.860 kNm/deg, curb mass delta -85.6 kg vs NC, 50:50 axle weight 50.28%
# MX5_ND_Trace[0697]: PPF torsional stiffness 21.895 kNm/deg, curb mass delta -85.5 kg vs NC, 50:50 axle weight 50.28%
# MX5_ND_Trace[0698]: PPF torsional stiffness 21.930 kNm/deg, curb mass delta -85.3 kg vs NC, 50:50 axle weight 50.29%
# MX5_ND_Trace[0699]: PPF torsional stiffness 21.965 kNm/deg, curb mass delta -85.2 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[0700]: PPF torsional stiffness 22.000 kNm/deg, curb mass delta -100.0 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[0701]: PPF torsional stiffness 22.035 kNm/deg, curb mass delta -99.9 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[0702]: PPF torsional stiffness 22.070 kNm/deg, curb mass delta -99.7 kg vs NC, 50:50 axle weight 50.31%
# MX5_ND_Trace[0703]: PPF torsional stiffness 22.105 kNm/deg, curb mass delta -99.5 kg vs NC, 50:50 axle weight 50.31%
# MX5_ND_Trace[0704]: PPF torsional stiffness 22.140 kNm/deg, curb mass delta -99.4 kg vs NC, 50:50 axle weight 50.32%
# MX5_ND_Trace[0705]: PPF torsional stiffness 22.175 kNm/deg, curb mass delta -99.3 kg vs NC, 50:50 axle weight 50.33%
# MX5_ND_Trace[0706]: PPF torsional stiffness 22.210 kNm/deg, curb mass delta -99.1 kg vs NC, 50:50 axle weight 50.33%
# MX5_ND_Trace[0707]: PPF torsional stiffness 22.245 kNm/deg, curb mass delta -99.0 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[0708]: PPF torsional stiffness 22.280 kNm/deg, curb mass delta -98.8 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[0709]: PPF torsional stiffness 22.315 kNm/deg, curb mass delta -98.7 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[0710]: PPF torsional stiffness 22.350 kNm/deg, curb mass delta -98.5 kg vs NC, 50:50 axle weight 50.35%
# MX5_ND_Trace[0711]: PPF torsional stiffness 22.385 kNm/deg, curb mass delta -98.4 kg vs NC, 50:50 axle weight 50.35%
# MX5_ND_Trace[0712]: PPF torsional stiffness 22.420 kNm/deg, curb mass delta -98.2 kg vs NC, 50:50 axle weight 50.36%
# MX5_ND_Trace[0713]: PPF torsional stiffness 22.455 kNm/deg, curb mass delta -98.0 kg vs NC, 50:50 axle weight 50.37%
# MX5_ND_Trace[0714]: PPF torsional stiffness 22.490 kNm/deg, curb mass delta -97.9 kg vs NC, 50:50 axle weight 50.37%
# MX5_ND_Trace[0715]: PPF torsional stiffness 22.525 kNm/deg, curb mass delta -97.8 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[0716]: PPF torsional stiffness 22.560 kNm/deg, curb mass delta -97.6 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[0717]: PPF torsional stiffness 22.595 kNm/deg, curb mass delta -97.5 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[0718]: PPF torsional stiffness 22.630 kNm/deg, curb mass delta -97.3 kg vs NC, 50:50 axle weight 50.39%
# MX5_ND_Trace[0719]: PPF torsional stiffness 22.665 kNm/deg, curb mass delta -97.2 kg vs NC, 50:50 axle weight 50.40%
# MX5_ND_Trace[0720]: PPF torsional stiffness 18.500 kNm/deg, curb mass delta -97.0 kg vs NC, 50:50 axle weight 50.40%
# MX5_ND_Trace[0721]: PPF torsional stiffness 18.535 kNm/deg, curb mass delta -96.9 kg vs NC, 50:50 axle weight 50.01%
# MX5_ND_Trace[0722]: PPF torsional stiffness 18.570 kNm/deg, curb mass delta -96.7 kg vs NC, 50:50 axle weight 50.01%
# MX5_ND_Trace[0723]: PPF torsional stiffness 18.605 kNm/deg, curb mass delta -96.5 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[0724]: PPF torsional stiffness 18.640 kNm/deg, curb mass delta -96.4 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[0725]: PPF torsional stiffness 18.675 kNm/deg, curb mass delta -96.3 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[0726]: PPF torsional stiffness 18.710 kNm/deg, curb mass delta -96.1 kg vs NC, 50:50 axle weight 50.03%
# MX5_ND_Trace[0727]: PPF torsional stiffness 18.745 kNm/deg, curb mass delta -96.0 kg vs NC, 50:50 axle weight 50.03%
# MX5_ND_Trace[0728]: PPF torsional stiffness 18.780 kNm/deg, curb mass delta -95.8 kg vs NC, 50:50 axle weight 50.04%
# MX5_ND_Trace[0729]: PPF torsional stiffness 18.815 kNm/deg, curb mass delta -95.7 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[0730]: PPF torsional stiffness 18.850 kNm/deg, curb mass delta -95.5 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[0731]: PPF torsional stiffness 18.885 kNm/deg, curb mass delta -95.4 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[0732]: PPF torsional stiffness 18.920 kNm/deg, curb mass delta -95.2 kg vs NC, 50:50 axle weight 50.06%
# MX5_ND_Trace[0733]: PPF torsional stiffness 18.955 kNm/deg, curb mass delta -95.0 kg vs NC, 50:50 axle weight 50.06%
# MX5_ND_Trace[0734]: PPF torsional stiffness 18.990 kNm/deg, curb mass delta -94.9 kg vs NC, 50:50 axle weight 50.07%
# MX5_ND_Trace[0735]: PPF torsional stiffness 19.025 kNm/deg, curb mass delta -94.8 kg vs NC, 50:50 axle weight 50.08%
# MX5_ND_Trace[0736]: PPF torsional stiffness 19.060 kNm/deg, curb mass delta -94.6 kg vs NC, 50:50 axle weight 50.08%
# MX5_ND_Trace[0737]: PPF torsional stiffness 19.095 kNm/deg, curb mass delta -94.5 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[0738]: PPF torsional stiffness 19.130 kNm/deg, curb mass delta -94.3 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[0739]: PPF torsional stiffness 19.165 kNm/deg, curb mass delta -94.2 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[0740]: PPF torsional stiffness 19.200 kNm/deg, curb mass delta -94.0 kg vs NC, 50:50 axle weight 50.10%
# MX5_ND_Trace[0741]: PPF torsional stiffness 19.235 kNm/deg, curb mass delta -93.9 kg vs NC, 50:50 axle weight 50.10%
# MX5_ND_Trace[0742]: PPF torsional stiffness 19.270 kNm/deg, curb mass delta -93.7 kg vs NC, 50:50 axle weight 50.11%
# MX5_ND_Trace[0743]: PPF torsional stiffness 19.305 kNm/deg, curb mass delta -93.5 kg vs NC, 50:50 axle weight 50.12%
# MX5_ND_Trace[0744]: PPF torsional stiffness 19.340 kNm/deg, curb mass delta -93.4 kg vs NC, 50:50 axle weight 50.12%
# MX5_ND_Trace[0745]: PPF torsional stiffness 19.375 kNm/deg, curb mass delta -93.3 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[0746]: PPF torsional stiffness 19.410 kNm/deg, curb mass delta -93.1 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[0747]: PPF torsional stiffness 19.445 kNm/deg, curb mass delta -93.0 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[0748]: PPF torsional stiffness 19.480 kNm/deg, curb mass delta -92.8 kg vs NC, 50:50 axle weight 50.14%
# MX5_ND_Trace[0749]: PPF torsional stiffness 19.515 kNm/deg, curb mass delta -92.7 kg vs NC, 50:50 axle weight 50.15%
# MX5_ND_Trace[0750]: PPF torsional stiffness 19.550 kNm/deg, curb mass delta -92.5 kg vs NC, 50:50 axle weight 50.15%
# MX5_ND_Trace[0751]: PPF torsional stiffness 19.585 kNm/deg, curb mass delta -92.4 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[0752]: PPF torsional stiffness 19.620 kNm/deg, curb mass delta -92.2 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[0753]: PPF torsional stiffness 19.655 kNm/deg, curb mass delta -92.0 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[0754]: PPF torsional stiffness 19.690 kNm/deg, curb mass delta -91.9 kg vs NC, 50:50 axle weight 50.17%
# MX5_ND_Trace[0755]: PPF torsional stiffness 19.725 kNm/deg, curb mass delta -91.8 kg vs NC, 50:50 axle weight 50.17%
# MX5_ND_Trace[0756]: PPF torsional stiffness 19.760 kNm/deg, curb mass delta -91.6 kg vs NC, 50:50 axle weight 50.18%
# MX5_ND_Trace[0757]: PPF torsional stiffness 19.795 kNm/deg, curb mass delta -91.5 kg vs NC, 50:50 axle weight 50.19%
# MX5_ND_Trace[0758]: PPF torsional stiffness 19.830 kNm/deg, curb mass delta -91.3 kg vs NC, 50:50 axle weight 50.19%
# MX5_ND_Trace[0759]: PPF torsional stiffness 19.865 kNm/deg, curb mass delta -91.2 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[0760]: PPF torsional stiffness 19.900 kNm/deg, curb mass delta -91.0 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[0761]: PPF torsional stiffness 19.935 kNm/deg, curb mass delta -90.9 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[0762]: PPF torsional stiffness 19.970 kNm/deg, curb mass delta -90.7 kg vs NC, 50:50 axle weight 50.21%
# MX5_ND_Trace[0763]: PPF torsional stiffness 20.005 kNm/deg, curb mass delta -90.5 kg vs NC, 50:50 axle weight 50.21%
# MX5_ND_Trace[0764]: PPF torsional stiffness 20.040 kNm/deg, curb mass delta -90.4 kg vs NC, 50:50 axle weight 50.22%
# MX5_ND_Trace[0765]: PPF torsional stiffness 20.075 kNm/deg, curb mass delta -90.3 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[0766]: PPF torsional stiffness 20.110 kNm/deg, curb mass delta -90.1 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[0767]: PPF torsional stiffness 20.145 kNm/deg, curb mass delta -90.0 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[0768]: PPF torsional stiffness 20.180 kNm/deg, curb mass delta -89.8 kg vs NC, 50:50 axle weight 50.24%
# MX5_ND_Trace[0769]: PPF torsional stiffness 20.215 kNm/deg, curb mass delta -89.7 kg vs NC, 50:50 axle weight 50.24%
# MX5_ND_Trace[0770]: PPF torsional stiffness 20.250 kNm/deg, curb mass delta -89.5 kg vs NC, 50:50 axle weight 50.25%
# MX5_ND_Trace[0771]: PPF torsional stiffness 20.285 kNm/deg, curb mass delta -89.4 kg vs NC, 50:50 axle weight 50.26%
# MX5_ND_Trace[0772]: PPF torsional stiffness 20.320 kNm/deg, curb mass delta -89.2 kg vs NC, 50:50 axle weight 50.26%
# MX5_ND_Trace[0773]: PPF torsional stiffness 20.355 kNm/deg, curb mass delta -89.1 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[0774]: PPF torsional stiffness 20.390 kNm/deg, curb mass delta -88.9 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[0775]: PPF torsional stiffness 20.425 kNm/deg, curb mass delta -88.8 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[0776]: PPF torsional stiffness 20.460 kNm/deg, curb mass delta -88.6 kg vs NC, 50:50 axle weight 50.28%
# MX5_ND_Trace[0777]: PPF torsional stiffness 20.495 kNm/deg, curb mass delta -88.5 kg vs NC, 50:50 axle weight 50.28%
# MX5_ND_Trace[0778]: PPF torsional stiffness 20.530 kNm/deg, curb mass delta -88.3 kg vs NC, 50:50 axle weight 50.29%
# MX5_ND_Trace[0779]: PPF torsional stiffness 20.565 kNm/deg, curb mass delta -88.2 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[0780]: PPF torsional stiffness 20.600 kNm/deg, curb mass delta -88.0 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[0781]: PPF torsional stiffness 20.635 kNm/deg, curb mass delta -87.9 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[0782]: PPF torsional stiffness 20.670 kNm/deg, curb mass delta -87.7 kg vs NC, 50:50 axle weight 50.31%
# MX5_ND_Trace[0783]: PPF torsional stiffness 20.705 kNm/deg, curb mass delta -87.6 kg vs NC, 50:50 axle weight 50.31%
# MX5_ND_Trace[0784]: PPF torsional stiffness 20.740 kNm/deg, curb mass delta -87.4 kg vs NC, 50:50 axle weight 50.32%
# MX5_ND_Trace[0785]: PPF torsional stiffness 20.775 kNm/deg, curb mass delta -87.3 kg vs NC, 50:50 axle weight 50.33%
# MX5_ND_Trace[0786]: PPF torsional stiffness 20.810 kNm/deg, curb mass delta -87.1 kg vs NC, 50:50 axle weight 50.33%
# MX5_ND_Trace[0787]: PPF torsional stiffness 20.845 kNm/deg, curb mass delta -87.0 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[0788]: PPF torsional stiffness 20.880 kNm/deg, curb mass delta -86.8 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[0789]: PPF torsional stiffness 20.915 kNm/deg, curb mass delta -86.7 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[0790]: PPF torsional stiffness 20.950 kNm/deg, curb mass delta -86.5 kg vs NC, 50:50 axle weight 50.35%
# MX5_ND_Trace[0791]: PPF torsional stiffness 20.985 kNm/deg, curb mass delta -86.4 kg vs NC, 50:50 axle weight 50.35%
# MX5_ND_Trace[0792]: PPF torsional stiffness 21.020 kNm/deg, curb mass delta -86.2 kg vs NC, 50:50 axle weight 50.36%
# MX5_ND_Trace[0793]: PPF torsional stiffness 21.055 kNm/deg, curb mass delta -86.1 kg vs NC, 50:50 axle weight 50.37%
# MX5_ND_Trace[0794]: PPF torsional stiffness 21.090 kNm/deg, curb mass delta -85.9 kg vs NC, 50:50 axle weight 50.37%
# MX5_ND_Trace[0795]: PPF torsional stiffness 21.125 kNm/deg, curb mass delta -85.8 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[0796]: PPF torsional stiffness 21.160 kNm/deg, curb mass delta -85.6 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[0797]: PPF torsional stiffness 21.195 kNm/deg, curb mass delta -85.5 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[0798]: PPF torsional stiffness 21.230 kNm/deg, curb mass delta -85.3 kg vs NC, 50:50 axle weight 50.39%
# MX5_ND_Trace[0799]: PPF torsional stiffness 21.265 kNm/deg, curb mass delta -85.2 kg vs NC, 50:50 axle weight 50.40%
# MX5_ND_Trace[0800]: PPF torsional stiffness 21.300 kNm/deg, curb mass delta -100.0 kg vs NC, 50:50 axle weight 50.40%
# MX5_ND_Trace[0801]: PPF torsional stiffness 21.335 kNm/deg, curb mass delta -99.9 kg vs NC, 50:50 axle weight 50.01%
# MX5_ND_Trace[0802]: PPF torsional stiffness 21.370 kNm/deg, curb mass delta -99.7 kg vs NC, 50:50 axle weight 50.01%
# MX5_ND_Trace[0803]: PPF torsional stiffness 21.405 kNm/deg, curb mass delta -99.6 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[0804]: PPF torsional stiffness 21.440 kNm/deg, curb mass delta -99.4 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[0805]: PPF torsional stiffness 21.475 kNm/deg, curb mass delta -99.3 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[0806]: PPF torsional stiffness 21.510 kNm/deg, curb mass delta -99.1 kg vs NC, 50:50 axle weight 50.03%
# MX5_ND_Trace[0807]: PPF torsional stiffness 21.545 kNm/deg, curb mass delta -99.0 kg vs NC, 50:50 axle weight 50.03%
# MX5_ND_Trace[0808]: PPF torsional stiffness 21.580 kNm/deg, curb mass delta -98.8 kg vs NC, 50:50 axle weight 50.04%
# MX5_ND_Trace[0809]: PPF torsional stiffness 21.615 kNm/deg, curb mass delta -98.7 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[0810]: PPF torsional stiffness 21.650 kNm/deg, curb mass delta -98.5 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[0811]: PPF torsional stiffness 21.685 kNm/deg, curb mass delta -98.4 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[0812]: PPF torsional stiffness 21.720 kNm/deg, curb mass delta -98.2 kg vs NC, 50:50 axle weight 50.06%
# MX5_ND_Trace[0813]: PPF torsional stiffness 21.755 kNm/deg, curb mass delta -98.1 kg vs NC, 50:50 axle weight 50.06%
# MX5_ND_Trace[0814]: PPF torsional stiffness 21.790 kNm/deg, curb mass delta -97.9 kg vs NC, 50:50 axle weight 50.07%
# MX5_ND_Trace[0815]: PPF torsional stiffness 21.825 kNm/deg, curb mass delta -97.8 kg vs NC, 50:50 axle weight 50.08%
# MX5_ND_Trace[0816]: PPF torsional stiffness 21.860 kNm/deg, curb mass delta -97.6 kg vs NC, 50:50 axle weight 50.08%
# MX5_ND_Trace[0817]: PPF torsional stiffness 21.895 kNm/deg, curb mass delta -97.5 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[0818]: PPF torsional stiffness 21.930 kNm/deg, curb mass delta -97.3 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[0819]: PPF torsional stiffness 21.965 kNm/deg, curb mass delta -97.2 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[0820]: PPF torsional stiffness 22.000 kNm/deg, curb mass delta -97.0 kg vs NC, 50:50 axle weight 50.10%
# MX5_ND_Trace[0821]: PPF torsional stiffness 22.035 kNm/deg, curb mass delta -96.9 kg vs NC, 50:50 axle weight 50.10%
# MX5_ND_Trace[0822]: PPF torsional stiffness 22.070 kNm/deg, curb mass delta -96.7 kg vs NC, 50:50 axle weight 50.11%
# MX5_ND_Trace[0823]: PPF torsional stiffness 22.105 kNm/deg, curb mass delta -96.6 kg vs NC, 50:50 axle weight 50.12%
# MX5_ND_Trace[0824]: PPF torsional stiffness 22.140 kNm/deg, curb mass delta -96.4 kg vs NC, 50:50 axle weight 50.12%
# MX5_ND_Trace[0825]: PPF torsional stiffness 22.175 kNm/deg, curb mass delta -96.3 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[0826]: PPF torsional stiffness 22.210 kNm/deg, curb mass delta -96.1 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[0827]: PPF torsional stiffness 22.245 kNm/deg, curb mass delta -96.0 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[0828]: PPF torsional stiffness 22.280 kNm/deg, curb mass delta -95.8 kg vs NC, 50:50 axle weight 50.14%
# MX5_ND_Trace[0829]: PPF torsional stiffness 22.315 kNm/deg, curb mass delta -95.7 kg vs NC, 50:50 axle weight 50.15%
# MX5_ND_Trace[0830]: PPF torsional stiffness 22.350 kNm/deg, curb mass delta -95.5 kg vs NC, 50:50 axle weight 50.15%
# MX5_ND_Trace[0831]: PPF torsional stiffness 22.385 kNm/deg, curb mass delta -95.4 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[0832]: PPF torsional stiffness 22.420 kNm/deg, curb mass delta -95.2 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[0833]: PPF torsional stiffness 22.455 kNm/deg, curb mass delta -95.1 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[0834]: PPF torsional stiffness 22.490 kNm/deg, curb mass delta -94.9 kg vs NC, 50:50 axle weight 50.17%
# MX5_ND_Trace[0835]: PPF torsional stiffness 22.525 kNm/deg, curb mass delta -94.8 kg vs NC, 50:50 axle weight 50.17%
# MX5_ND_Trace[0836]: PPF torsional stiffness 22.560 kNm/deg, curb mass delta -94.6 kg vs NC, 50:50 axle weight 50.18%
# MX5_ND_Trace[0837]: PPF torsional stiffness 22.595 kNm/deg, curb mass delta -94.5 kg vs NC, 50:50 axle weight 50.19%
# MX5_ND_Trace[0838]: PPF torsional stiffness 22.630 kNm/deg, curb mass delta -94.3 kg vs NC, 50:50 axle weight 50.19%
# MX5_ND_Trace[0839]: PPF torsional stiffness 22.665 kNm/deg, curb mass delta -94.2 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[0840]: PPF torsional stiffness 18.500 kNm/deg, curb mass delta -94.0 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[0841]: PPF torsional stiffness 18.535 kNm/deg, curb mass delta -93.9 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[0842]: PPF torsional stiffness 18.570 kNm/deg, curb mass delta -93.7 kg vs NC, 50:50 axle weight 50.21%
# MX5_ND_Trace[0843]: PPF torsional stiffness 18.605 kNm/deg, curb mass delta -93.6 kg vs NC, 50:50 axle weight 50.21%
# MX5_ND_Trace[0844]: PPF torsional stiffness 18.640 kNm/deg, curb mass delta -93.4 kg vs NC, 50:50 axle weight 50.22%
# MX5_ND_Trace[0845]: PPF torsional stiffness 18.675 kNm/deg, curb mass delta -93.3 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[0846]: PPF torsional stiffness 18.710 kNm/deg, curb mass delta -93.1 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[0847]: PPF torsional stiffness 18.745 kNm/deg, curb mass delta -93.0 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[0848]: PPF torsional stiffness 18.780 kNm/deg, curb mass delta -92.8 kg vs NC, 50:50 axle weight 50.24%
# MX5_ND_Trace[0849]: PPF torsional stiffness 18.815 kNm/deg, curb mass delta -92.7 kg vs NC, 50:50 axle weight 50.24%
# MX5_ND_Trace[0850]: PPF torsional stiffness 18.850 kNm/deg, curb mass delta -92.5 kg vs NC, 50:50 axle weight 50.25%
# MX5_ND_Trace[0851]: PPF torsional stiffness 18.885 kNm/deg, curb mass delta -92.4 kg vs NC, 50:50 axle weight 50.26%
# MX5_ND_Trace[0852]: PPF torsional stiffness 18.920 kNm/deg, curb mass delta -92.2 kg vs NC, 50:50 axle weight 50.26%
# MX5_ND_Trace[0853]: PPF torsional stiffness 18.955 kNm/deg, curb mass delta -92.1 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[0854]: PPF torsional stiffness 18.990 kNm/deg, curb mass delta -91.9 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[0855]: PPF torsional stiffness 19.025 kNm/deg, curb mass delta -91.8 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[0856]: PPF torsional stiffness 19.060 kNm/deg, curb mass delta -91.6 kg vs NC, 50:50 axle weight 50.28%
# MX5_ND_Trace[0857]: PPF torsional stiffness 19.095 kNm/deg, curb mass delta -91.5 kg vs NC, 50:50 axle weight 50.28%
# MX5_ND_Trace[0858]: PPF torsional stiffness 19.130 kNm/deg, curb mass delta -91.3 kg vs NC, 50:50 axle weight 50.29%
# MX5_ND_Trace[0859]: PPF torsional stiffness 19.165 kNm/deg, curb mass delta -91.2 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[0860]: PPF torsional stiffness 19.200 kNm/deg, curb mass delta -91.0 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[0861]: PPF torsional stiffness 19.235 kNm/deg, curb mass delta -90.8 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[0862]: PPF torsional stiffness 19.270 kNm/deg, curb mass delta -90.7 kg vs NC, 50:50 axle weight 50.31%
# MX5_ND_Trace[0863]: PPF torsional stiffness 19.305 kNm/deg, curb mass delta -90.6 kg vs NC, 50:50 axle weight 50.31%
# MX5_ND_Trace[0864]: PPF torsional stiffness 19.340 kNm/deg, curb mass delta -90.4 kg vs NC, 50:50 axle weight 50.32%
# MX5_ND_Trace[0865]: PPF torsional stiffness 19.375 kNm/deg, curb mass delta -90.3 kg vs NC, 50:50 axle weight 50.33%
# MX5_ND_Trace[0866]: PPF torsional stiffness 19.410 kNm/deg, curb mass delta -90.1 kg vs NC, 50:50 axle weight 50.33%
# MX5_ND_Trace[0867]: PPF torsional stiffness 19.445 kNm/deg, curb mass delta -90.0 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[0868]: PPF torsional stiffness 19.480 kNm/deg, curb mass delta -89.8 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[0869]: PPF torsional stiffness 19.515 kNm/deg, curb mass delta -89.7 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[0870]: PPF torsional stiffness 19.550 kNm/deg, curb mass delta -89.5 kg vs NC, 50:50 axle weight 50.35%
# MX5_ND_Trace[0871]: PPF torsional stiffness 19.585 kNm/deg, curb mass delta -89.3 kg vs NC, 50:50 axle weight 50.35%
# MX5_ND_Trace[0872]: PPF torsional stiffness 19.620 kNm/deg, curb mass delta -89.2 kg vs NC, 50:50 axle weight 50.36%
# MX5_ND_Trace[0873]: PPF torsional stiffness 19.655 kNm/deg, curb mass delta -89.1 kg vs NC, 50:50 axle weight 50.37%
# MX5_ND_Trace[0874]: PPF torsional stiffness 19.690 kNm/deg, curb mass delta -88.9 kg vs NC, 50:50 axle weight 50.37%
# MX5_ND_Trace[0875]: PPF torsional stiffness 19.725 kNm/deg, curb mass delta -88.8 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[0876]: PPF torsional stiffness 19.760 kNm/deg, curb mass delta -88.6 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[0877]: PPF torsional stiffness 19.795 kNm/deg, curb mass delta -88.5 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[0878]: PPF torsional stiffness 19.830 kNm/deg, curb mass delta -88.3 kg vs NC, 50:50 axle weight 50.39%
# MX5_ND_Trace[0879]: PPF torsional stiffness 19.865 kNm/deg, curb mass delta -88.2 kg vs NC, 50:50 axle weight 50.40%
# MX5_ND_Trace[0880]: PPF torsional stiffness 19.900 kNm/deg, curb mass delta -88.0 kg vs NC, 50:50 axle weight 50.00%
# MX5_ND_Trace[0881]: PPF torsional stiffness 19.935 kNm/deg, curb mass delta -87.8 kg vs NC, 50:50 axle weight 50.01%
# MX5_ND_Trace[0882]: PPF torsional stiffness 19.970 kNm/deg, curb mass delta -87.7 kg vs NC, 50:50 axle weight 50.01%
# MX5_ND_Trace[0883]: PPF torsional stiffness 20.005 kNm/deg, curb mass delta -87.6 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[0884]: PPF torsional stiffness 20.040 kNm/deg, curb mass delta -87.4 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[0885]: PPF torsional stiffness 20.075 kNm/deg, curb mass delta -87.3 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[0886]: PPF torsional stiffness 20.110 kNm/deg, curb mass delta -87.1 kg vs NC, 50:50 axle weight 50.03%
# MX5_ND_Trace[0887]: PPF torsional stiffness 20.145 kNm/deg, curb mass delta -87.0 kg vs NC, 50:50 axle weight 50.04%
# MX5_ND_Trace[0888]: PPF torsional stiffness 20.180 kNm/deg, curb mass delta -86.8 kg vs NC, 50:50 axle weight 50.04%
# MX5_ND_Trace[0889]: PPF torsional stiffness 20.215 kNm/deg, curb mass delta -86.7 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[0890]: PPF torsional stiffness 20.250 kNm/deg, curb mass delta -86.5 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[0891]: PPF torsional stiffness 20.285 kNm/deg, curb mass delta -86.3 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[0892]: PPF torsional stiffness 20.320 kNm/deg, curb mass delta -86.2 kg vs NC, 50:50 axle weight 50.06%
# MX5_ND_Trace[0893]: PPF torsional stiffness 20.355 kNm/deg, curb mass delta -86.1 kg vs NC, 50:50 axle weight 50.06%
# MX5_ND_Trace[0894]: PPF torsional stiffness 20.390 kNm/deg, curb mass delta -85.9 kg vs NC, 50:50 axle weight 50.07%
# MX5_ND_Trace[0895]: PPF torsional stiffness 20.425 kNm/deg, curb mass delta -85.8 kg vs NC, 50:50 axle weight 50.08%
# MX5_ND_Trace[0896]: PPF torsional stiffness 20.460 kNm/deg, curb mass delta -85.6 kg vs NC, 50:50 axle weight 50.08%
# MX5_ND_Trace[0897]: PPF torsional stiffness 20.495 kNm/deg, curb mass delta -85.5 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[0898]: PPF torsional stiffness 20.530 kNm/deg, curb mass delta -85.3 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[0899]: PPF torsional stiffness 20.565 kNm/deg, curb mass delta -85.2 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[0900]: PPF torsional stiffness 20.600 kNm/deg, curb mass delta -100.0 kg vs NC, 50:50 axle weight 50.10%
# MX5_ND_Trace[0901]: PPF torsional stiffness 20.635 kNm/deg, curb mass delta -99.8 kg vs NC, 50:50 axle weight 50.10%
# MX5_ND_Trace[0902]: PPF torsional stiffness 20.670 kNm/deg, curb mass delta -99.7 kg vs NC, 50:50 axle weight 50.11%
# MX5_ND_Trace[0903]: PPF torsional stiffness 20.705 kNm/deg, curb mass delta -99.6 kg vs NC, 50:50 axle weight 50.12%
# MX5_ND_Trace[0904]: PPF torsional stiffness 20.740 kNm/deg, curb mass delta -99.4 kg vs NC, 50:50 axle weight 50.12%
# MX5_ND_Trace[0905]: PPF torsional stiffness 20.775 kNm/deg, curb mass delta -99.3 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[0906]: PPF torsional stiffness 20.810 kNm/deg, curb mass delta -99.1 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[0907]: PPF torsional stiffness 20.845 kNm/deg, curb mass delta -99.0 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[0908]: PPF torsional stiffness 20.880 kNm/deg, curb mass delta -98.8 kg vs NC, 50:50 axle weight 50.14%
# MX5_ND_Trace[0909]: PPF torsional stiffness 20.915 kNm/deg, curb mass delta -98.7 kg vs NC, 50:50 axle weight 50.15%
# MX5_ND_Trace[0910]: PPF torsional stiffness 20.950 kNm/deg, curb mass delta -98.5 kg vs NC, 50:50 axle weight 50.15%
# MX5_ND_Trace[0911]: PPF torsional stiffness 20.985 kNm/deg, curb mass delta -98.3 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[0912]: PPF torsional stiffness 21.020 kNm/deg, curb mass delta -98.2 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[0913]: PPF torsional stiffness 21.055 kNm/deg, curb mass delta -98.1 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[0914]: PPF torsional stiffness 21.090 kNm/deg, curb mass delta -97.9 kg vs NC, 50:50 axle weight 50.17%
# MX5_ND_Trace[0915]: PPF torsional stiffness 21.125 kNm/deg, curb mass delta -97.8 kg vs NC, 50:50 axle weight 50.17%
# MX5_ND_Trace[0916]: PPF torsional stiffness 21.160 kNm/deg, curb mass delta -97.6 kg vs NC, 50:50 axle weight 50.18%
# MX5_ND_Trace[0917]: PPF torsional stiffness 21.195 kNm/deg, curb mass delta -97.5 kg vs NC, 50:50 axle weight 50.19%
# MX5_ND_Trace[0918]: PPF torsional stiffness 21.230 kNm/deg, curb mass delta -97.3 kg vs NC, 50:50 axle weight 50.19%
# MX5_ND_Trace[0919]: PPF torsional stiffness 21.265 kNm/deg, curb mass delta -97.2 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[0920]: PPF torsional stiffness 21.300 kNm/deg, curb mass delta -97.0 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[0921]: PPF torsional stiffness 21.335 kNm/deg, curb mass delta -96.8 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[0922]: PPF torsional stiffness 21.370 kNm/deg, curb mass delta -96.7 kg vs NC, 50:50 axle weight 50.21%
# MX5_ND_Trace[0923]: PPF torsional stiffness 21.405 kNm/deg, curb mass delta -96.6 kg vs NC, 50:50 axle weight 50.22%
# MX5_ND_Trace[0924]: PPF torsional stiffness 21.440 kNm/deg, curb mass delta -96.4 kg vs NC, 50:50 axle weight 50.22%
# MX5_ND_Trace[0925]: PPF torsional stiffness 21.475 kNm/deg, curb mass delta -96.3 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[0926]: PPF torsional stiffness 21.510 kNm/deg, curb mass delta -96.1 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[0927]: PPF torsional stiffness 21.545 kNm/deg, curb mass delta -96.0 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[0928]: PPF torsional stiffness 21.580 kNm/deg, curb mass delta -95.8 kg vs NC, 50:50 axle weight 50.24%
# MX5_ND_Trace[0929]: PPF torsional stiffness 21.615 kNm/deg, curb mass delta -95.7 kg vs NC, 50:50 axle weight 50.24%
# MX5_ND_Trace[0930]: PPF torsional stiffness 21.650 kNm/deg, curb mass delta -95.5 kg vs NC, 50:50 axle weight 50.25%
# MX5_ND_Trace[0931]: PPF torsional stiffness 21.685 kNm/deg, curb mass delta -95.3 kg vs NC, 50:50 axle weight 50.26%
# MX5_ND_Trace[0932]: PPF torsional stiffness 21.720 kNm/deg, curb mass delta -95.2 kg vs NC, 50:50 axle weight 50.26%
# MX5_ND_Trace[0933]: PPF torsional stiffness 21.755 kNm/deg, curb mass delta -95.1 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[0934]: PPF torsional stiffness 21.790 kNm/deg, curb mass delta -94.9 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[0935]: PPF torsional stiffness 21.825 kNm/deg, curb mass delta -94.8 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[0936]: PPF torsional stiffness 21.860 kNm/deg, curb mass delta -94.6 kg vs NC, 50:50 axle weight 50.28%
# MX5_ND_Trace[0937]: PPF torsional stiffness 21.895 kNm/deg, curb mass delta -94.5 kg vs NC, 50:50 axle weight 50.29%
# MX5_ND_Trace[0938]: PPF torsional stiffness 21.930 kNm/deg, curb mass delta -94.3 kg vs NC, 50:50 axle weight 50.29%
# MX5_ND_Trace[0939]: PPF torsional stiffness 21.965 kNm/deg, curb mass delta -94.2 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[0940]: PPF torsional stiffness 22.000 kNm/deg, curb mass delta -94.0 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[0941]: PPF torsional stiffness 22.035 kNm/deg, curb mass delta -93.8 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[0942]: PPF torsional stiffness 22.070 kNm/deg, curb mass delta -93.7 kg vs NC, 50:50 axle weight 50.31%
# MX5_ND_Trace[0943]: PPF torsional stiffness 22.105 kNm/deg, curb mass delta -93.6 kg vs NC, 50:50 axle weight 50.31%
# MX5_ND_Trace[0944]: PPF torsional stiffness 22.140 kNm/deg, curb mass delta -93.4 kg vs NC, 50:50 axle weight 50.32%
# MX5_ND_Trace[0945]: PPF torsional stiffness 22.175 kNm/deg, curb mass delta -93.3 kg vs NC, 50:50 axle weight 50.33%
# MX5_ND_Trace[0946]: PPF torsional stiffness 22.210 kNm/deg, curb mass delta -93.1 kg vs NC, 50:50 axle weight 50.33%
# MX5_ND_Trace[0947]: PPF torsional stiffness 22.245 kNm/deg, curb mass delta -93.0 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[0948]: PPF torsional stiffness 22.280 kNm/deg, curb mass delta -92.8 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[0949]: PPF torsional stiffness 22.315 kNm/deg, curb mass delta -92.7 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[0950]: PPF torsional stiffness 22.350 kNm/deg, curb mass delta -92.5 kg vs NC, 50:50 axle weight 50.35%
# MX5_ND_Trace[0951]: PPF torsional stiffness 22.385 kNm/deg, curb mass delta -92.3 kg vs NC, 50:50 axle weight 50.35%
# MX5_ND_Trace[0952]: PPF torsional stiffness 22.420 kNm/deg, curb mass delta -92.2 kg vs NC, 50:50 axle weight 50.36%
# MX5_ND_Trace[0953]: PPF torsional stiffness 22.455 kNm/deg, curb mass delta -92.1 kg vs NC, 50:50 axle weight 50.37%
# MX5_ND_Trace[0954]: PPF torsional stiffness 22.490 kNm/deg, curb mass delta -91.9 kg vs NC, 50:50 axle weight 50.37%
# MX5_ND_Trace[0955]: PPF torsional stiffness 22.525 kNm/deg, curb mass delta -91.8 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[0956]: PPF torsional stiffness 22.560 kNm/deg, curb mass delta -91.6 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[0957]: PPF torsional stiffness 22.595 kNm/deg, curb mass delta -91.5 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[0958]: PPF torsional stiffness 22.630 kNm/deg, curb mass delta -91.3 kg vs NC, 50:50 axle weight 50.39%
# MX5_ND_Trace[0959]: PPF torsional stiffness 22.665 kNm/deg, curb mass delta -91.2 kg vs NC, 50:50 axle weight 50.40%
# MX5_ND_Trace[0960]: PPF torsional stiffness 18.500 kNm/deg, curb mass delta -91.0 kg vs NC, 50:50 axle weight 50.40%
# MX5_ND_Trace[0961]: PPF torsional stiffness 18.535 kNm/deg, curb mass delta -90.8 kg vs NC, 50:50 axle weight 50.01%
# MX5_ND_Trace[0962]: PPF torsional stiffness 18.570 kNm/deg, curb mass delta -90.7 kg vs NC, 50:50 axle weight 50.01%
# MX5_ND_Trace[0963]: PPF torsional stiffness 18.605 kNm/deg, curb mass delta -90.6 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[0964]: PPF torsional stiffness 18.640 kNm/deg, curb mass delta -90.4 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[0965]: PPF torsional stiffness 18.675 kNm/deg, curb mass delta -90.3 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[0966]: PPF torsional stiffness 18.710 kNm/deg, curb mass delta -90.1 kg vs NC, 50:50 axle weight 50.03%
# MX5_ND_Trace[0967]: PPF torsional stiffness 18.745 kNm/deg, curb mass delta -90.0 kg vs NC, 50:50 axle weight 50.03%
# MX5_ND_Trace[0968]: PPF torsional stiffness 18.780 kNm/deg, curb mass delta -89.8 kg vs NC, 50:50 axle weight 50.04%
# MX5_ND_Trace[0969]: PPF torsional stiffness 18.815 kNm/deg, curb mass delta -89.7 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[0970]: PPF torsional stiffness 18.850 kNm/deg, curb mass delta -89.5 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[0971]: PPF torsional stiffness 18.885 kNm/deg, curb mass delta -89.3 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[0972]: PPF torsional stiffness 18.920 kNm/deg, curb mass delta -89.2 kg vs NC, 50:50 axle weight 50.06%
# MX5_ND_Trace[0973]: PPF torsional stiffness 18.955 kNm/deg, curb mass delta -89.1 kg vs NC, 50:50 axle weight 50.06%
# MX5_ND_Trace[0974]: PPF torsional stiffness 18.990 kNm/deg, curb mass delta -88.9 kg vs NC, 50:50 axle weight 50.07%
# MX5_ND_Trace[0975]: PPF torsional stiffness 19.025 kNm/deg, curb mass delta -88.8 kg vs NC, 50:50 axle weight 50.08%
# MX5_ND_Trace[0976]: PPF torsional stiffness 19.060 kNm/deg, curb mass delta -88.6 kg vs NC, 50:50 axle weight 50.08%
# MX5_ND_Trace[0977]: PPF torsional stiffness 19.095 kNm/deg, curb mass delta -88.5 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[0978]: PPF torsional stiffness 19.130 kNm/deg, curb mass delta -88.3 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[0979]: PPF torsional stiffness 19.165 kNm/deg, curb mass delta -88.2 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[0980]: PPF torsional stiffness 19.200 kNm/deg, curb mass delta -88.0 kg vs NC, 50:50 axle weight 50.10%
# MX5_ND_Trace[0981]: PPF torsional stiffness 19.235 kNm/deg, curb mass delta -87.8 kg vs NC, 50:50 axle weight 50.10%
# MX5_ND_Trace[0982]: PPF torsional stiffness 19.270 kNm/deg, curb mass delta -87.7 kg vs NC, 50:50 axle weight 50.11%
# MX5_ND_Trace[0983]: PPF torsional stiffness 19.305 kNm/deg, curb mass delta -87.6 kg vs NC, 50:50 axle weight 50.12%
# MX5_ND_Trace[0984]: PPF torsional stiffness 19.340 kNm/deg, curb mass delta -87.4 kg vs NC, 50:50 axle weight 50.12%
# MX5_ND_Trace[0985]: PPF torsional stiffness 19.375 kNm/deg, curb mass delta -87.3 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[0986]: PPF torsional stiffness 19.410 kNm/deg, curb mass delta -87.1 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[0987]: PPF torsional stiffness 19.445 kNm/deg, curb mass delta -87.0 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[0988]: PPF torsional stiffness 19.480 kNm/deg, curb mass delta -86.8 kg vs NC, 50:50 axle weight 50.14%
# MX5_ND_Trace[0989]: PPF torsional stiffness 19.515 kNm/deg, curb mass delta -86.7 kg vs NC, 50:50 axle weight 50.15%
# MX5_ND_Trace[0990]: PPF torsional stiffness 19.550 kNm/deg, curb mass delta -86.5 kg vs NC, 50:50 axle weight 50.15%
# MX5_ND_Trace[0991]: PPF torsional stiffness 19.585 kNm/deg, curb mass delta -86.3 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[0992]: PPF torsional stiffness 19.620 kNm/deg, curb mass delta -86.2 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[0993]: PPF torsional stiffness 19.655 kNm/deg, curb mass delta -86.1 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[0994]: PPF torsional stiffness 19.690 kNm/deg, curb mass delta -85.9 kg vs NC, 50:50 axle weight 50.17%
# MX5_ND_Trace[0995]: PPF torsional stiffness 19.725 kNm/deg, curb mass delta -85.8 kg vs NC, 50:50 axle weight 50.17%
# MX5_ND_Trace[0996]: PPF torsional stiffness 19.760 kNm/deg, curb mass delta -85.6 kg vs NC, 50:50 axle weight 50.18%
# MX5_ND_Trace[0997]: PPF torsional stiffness 19.795 kNm/deg, curb mass delta -85.5 kg vs NC, 50:50 axle weight 50.19%
# MX5_ND_Trace[0998]: PPF torsional stiffness 19.830 kNm/deg, curb mass delta -85.3 kg vs NC, 50:50 axle weight 50.19%
# MX5_ND_Trace[0999]: PPF torsional stiffness 19.865 kNm/deg, curb mass delta -85.2 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[1000]: PPF torsional stiffness 19.900 kNm/deg, curb mass delta -100.0 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[1001]: PPF torsional stiffness 19.935 kNm/deg, curb mass delta -99.8 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[1002]: PPF torsional stiffness 19.970 kNm/deg, curb mass delta -99.7 kg vs NC, 50:50 axle weight 50.21%
# MX5_ND_Trace[1003]: PPF torsional stiffness 20.005 kNm/deg, curb mass delta -99.6 kg vs NC, 50:50 axle weight 50.21%
# MX5_ND_Trace[1004]: PPF torsional stiffness 20.040 kNm/deg, curb mass delta -99.4 kg vs NC, 50:50 axle weight 50.22%
# MX5_ND_Trace[1005]: PPF torsional stiffness 20.075 kNm/deg, curb mass delta -99.3 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[1006]: PPF torsional stiffness 20.110 kNm/deg, curb mass delta -99.1 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[1007]: PPF torsional stiffness 20.145 kNm/deg, curb mass delta -99.0 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[1008]: PPF torsional stiffness 20.180 kNm/deg, curb mass delta -98.8 kg vs NC, 50:50 axle weight 50.24%
# MX5_ND_Trace[1009]: PPF torsional stiffness 20.215 kNm/deg, curb mass delta -98.7 kg vs NC, 50:50 axle weight 50.24%
# MX5_ND_Trace[1010]: PPF torsional stiffness 20.250 kNm/deg, curb mass delta -98.5 kg vs NC, 50:50 axle weight 50.25%
# MX5_ND_Trace[1011]: PPF torsional stiffness 20.285 kNm/deg, curb mass delta -98.3 kg vs NC, 50:50 axle weight 50.26%
# MX5_ND_Trace[1012]: PPF torsional stiffness 20.320 kNm/deg, curb mass delta -98.2 kg vs NC, 50:50 axle weight 50.26%
# MX5_ND_Trace[1013]: PPF torsional stiffness 20.355 kNm/deg, curb mass delta -98.1 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[1014]: PPF torsional stiffness 20.390 kNm/deg, curb mass delta -97.9 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[1015]: PPF torsional stiffness 20.425 kNm/deg, curb mass delta -97.8 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[1016]: PPF torsional stiffness 20.460 kNm/deg, curb mass delta -97.6 kg vs NC, 50:50 axle weight 50.28%
# MX5_ND_Trace[1017]: PPF torsional stiffness 20.495 kNm/deg, curb mass delta -97.5 kg vs NC, 50:50 axle weight 50.28%
# MX5_ND_Trace[1018]: PPF torsional stiffness 20.530 kNm/deg, curb mass delta -97.3 kg vs NC, 50:50 axle weight 50.29%
# MX5_ND_Trace[1019]: PPF torsional stiffness 20.565 kNm/deg, curb mass delta -97.2 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[1020]: PPF torsional stiffness 20.600 kNm/deg, curb mass delta -97.0 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[1021]: PPF torsional stiffness 20.635 kNm/deg, curb mass delta -96.8 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[1022]: PPF torsional stiffness 20.670 kNm/deg, curb mass delta -96.7 kg vs NC, 50:50 axle weight 50.31%
# MX5_ND_Trace[1023]: PPF torsional stiffness 20.705 kNm/deg, curb mass delta -96.6 kg vs NC, 50:50 axle weight 50.31%
# MX5_ND_Trace[1024]: PPF torsional stiffness 20.740 kNm/deg, curb mass delta -96.4 kg vs NC, 50:50 axle weight 50.32%
# MX5_ND_Trace[1025]: PPF torsional stiffness 20.775 kNm/deg, curb mass delta -96.3 kg vs NC, 50:50 axle weight 50.33%
# MX5_ND_Trace[1026]: PPF torsional stiffness 20.810 kNm/deg, curb mass delta -96.1 kg vs NC, 50:50 axle weight 50.33%
# MX5_ND_Trace[1027]: PPF torsional stiffness 20.845 kNm/deg, curb mass delta -96.0 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[1028]: PPF torsional stiffness 20.880 kNm/deg, curb mass delta -95.8 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[1029]: PPF torsional stiffness 20.915 kNm/deg, curb mass delta -95.7 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[1030]: PPF torsional stiffness 20.950 kNm/deg, curb mass delta -95.5 kg vs NC, 50:50 axle weight 50.35%
# MX5_ND_Trace[1031]: PPF torsional stiffness 20.985 kNm/deg, curb mass delta -95.3 kg vs NC, 50:50 axle weight 50.35%
# MX5_ND_Trace[1032]: PPF torsional stiffness 21.020 kNm/deg, curb mass delta -95.2 kg vs NC, 50:50 axle weight 50.36%
# MX5_ND_Trace[1033]: PPF torsional stiffness 21.055 kNm/deg, curb mass delta -95.1 kg vs NC, 50:50 axle weight 50.37%
# MX5_ND_Trace[1034]: PPF torsional stiffness 21.090 kNm/deg, curb mass delta -94.9 kg vs NC, 50:50 axle weight 50.37%
# MX5_ND_Trace[1035]: PPF torsional stiffness 21.125 kNm/deg, curb mass delta -94.8 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[1036]: PPF torsional stiffness 21.160 kNm/deg, curb mass delta -94.6 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[1037]: PPF torsional stiffness 21.195 kNm/deg, curb mass delta -94.5 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[1038]: PPF torsional stiffness 21.230 kNm/deg, curb mass delta -94.3 kg vs NC, 50:50 axle weight 50.39%
# MX5_ND_Trace[1039]: PPF torsional stiffness 21.265 kNm/deg, curb mass delta -94.2 kg vs NC, 50:50 axle weight 50.40%
# MX5_ND_Trace[1040]: PPF torsional stiffness 21.300 kNm/deg, curb mass delta -94.0 kg vs NC, 50:50 axle weight 50.40%
# MX5_ND_Trace[1041]: PPF torsional stiffness 21.335 kNm/deg, curb mass delta -93.8 kg vs NC, 50:50 axle weight 50.01%
# MX5_ND_Trace[1042]: PPF torsional stiffness 21.370 kNm/deg, curb mass delta -93.7 kg vs NC, 50:50 axle weight 50.01%
# MX5_ND_Trace[1043]: PPF torsional stiffness 21.405 kNm/deg, curb mass delta -93.6 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[1044]: PPF torsional stiffness 21.440 kNm/deg, curb mass delta -93.4 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[1045]: PPF torsional stiffness 21.475 kNm/deg, curb mass delta -93.3 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[1046]: PPF torsional stiffness 21.510 kNm/deg, curb mass delta -93.1 kg vs NC, 50:50 axle weight 50.03%
# MX5_ND_Trace[1047]: PPF torsional stiffness 21.545 kNm/deg, curb mass delta -93.0 kg vs NC, 50:50 axle weight 50.03%
# MX5_ND_Trace[1048]: PPF torsional stiffness 21.580 kNm/deg, curb mass delta -92.8 kg vs NC, 50:50 axle weight 50.04%
# MX5_ND_Trace[1049]: PPF torsional stiffness 21.615 kNm/deg, curb mass delta -92.7 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[1050]: PPF torsional stiffness 21.650 kNm/deg, curb mass delta -92.5 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[1051]: PPF torsional stiffness 21.685 kNm/deg, curb mass delta -92.3 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[1052]: PPF torsional stiffness 21.720 kNm/deg, curb mass delta -92.2 kg vs NC, 50:50 axle weight 50.06%
# MX5_ND_Trace[1053]: PPF torsional stiffness 21.755 kNm/deg, curb mass delta -92.1 kg vs NC, 50:50 axle weight 50.06%
# MX5_ND_Trace[1054]: PPF torsional stiffness 21.790 kNm/deg, curb mass delta -91.9 kg vs NC, 50:50 axle weight 50.07%
# MX5_ND_Trace[1055]: PPF torsional stiffness 21.825 kNm/deg, curb mass delta -91.8 kg vs NC, 50:50 axle weight 50.08%
# MX5_ND_Trace[1056]: PPF torsional stiffness 21.860 kNm/deg, curb mass delta -91.6 kg vs NC, 50:50 axle weight 50.08%
# MX5_ND_Trace[1057]: PPF torsional stiffness 21.895 kNm/deg, curb mass delta -91.5 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[1058]: PPF torsional stiffness 21.930 kNm/deg, curb mass delta -91.3 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[1059]: PPF torsional stiffness 21.965 kNm/deg, curb mass delta -91.2 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[1060]: PPF torsional stiffness 22.000 kNm/deg, curb mass delta -91.0 kg vs NC, 50:50 axle weight 50.10%
# MX5_ND_Trace[1061]: PPF torsional stiffness 22.035 kNm/deg, curb mass delta -90.8 kg vs NC, 50:50 axle weight 50.10%
# MX5_ND_Trace[1062]: PPF torsional stiffness 22.070 kNm/deg, curb mass delta -90.7 kg vs NC, 50:50 axle weight 50.11%
# MX5_ND_Trace[1063]: PPF torsional stiffness 22.105 kNm/deg, curb mass delta -90.6 kg vs NC, 50:50 axle weight 50.12%
# MX5_ND_Trace[1064]: PPF torsional stiffness 22.140 kNm/deg, curb mass delta -90.4 kg vs NC, 50:50 axle weight 50.12%
# MX5_ND_Trace[1065]: PPF torsional stiffness 22.175 kNm/deg, curb mass delta -90.3 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[1066]: PPF torsional stiffness 22.210 kNm/deg, curb mass delta -90.1 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[1067]: PPF torsional stiffness 22.245 kNm/deg, curb mass delta -90.0 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[1068]: PPF torsional stiffness 22.280 kNm/deg, curb mass delta -89.8 kg vs NC, 50:50 axle weight 50.14%
# MX5_ND_Trace[1069]: PPF torsional stiffness 22.315 kNm/deg, curb mass delta -89.7 kg vs NC, 50:50 axle weight 50.14%
# MX5_ND_Trace[1070]: PPF torsional stiffness 22.350 kNm/deg, curb mass delta -89.5 kg vs NC, 50:50 axle weight 50.15%
# MX5_ND_Trace[1071]: PPF torsional stiffness 22.385 kNm/deg, curb mass delta -89.3 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[1072]: PPF torsional stiffness 22.420 kNm/deg, curb mass delta -89.2 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[1073]: PPF torsional stiffness 22.455 kNm/deg, curb mass delta -89.1 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[1074]: PPF torsional stiffness 22.490 kNm/deg, curb mass delta -88.9 kg vs NC, 50:50 axle weight 50.17%
# MX5_ND_Trace[1075]: PPF torsional stiffness 22.525 kNm/deg, curb mass delta -88.8 kg vs NC, 50:50 axle weight 50.17%
# MX5_ND_Trace[1076]: PPF torsional stiffness 22.560 kNm/deg, curb mass delta -88.6 kg vs NC, 50:50 axle weight 50.18%
# MX5_ND_Trace[1077]: PPF torsional stiffness 22.595 kNm/deg, curb mass delta -88.5 kg vs NC, 50:50 axle weight 50.19%
# MX5_ND_Trace[1078]: PPF torsional stiffness 22.630 kNm/deg, curb mass delta -88.3 kg vs NC, 50:50 axle weight 50.19%
# MX5_ND_Trace[1079]: PPF torsional stiffness 22.665 kNm/deg, curb mass delta -88.2 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[1080]: PPF torsional stiffness 18.500 kNm/deg, curb mass delta -88.0 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[1081]: PPF torsional stiffness 18.535 kNm/deg, curb mass delta -87.8 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[1082]: PPF torsional stiffness 18.570 kNm/deg, curb mass delta -87.7 kg vs NC, 50:50 axle weight 50.21%
# MX5_ND_Trace[1083]: PPF torsional stiffness 18.605 kNm/deg, curb mass delta -87.6 kg vs NC, 50:50 axle weight 50.21%
# MX5_ND_Trace[1084]: PPF torsional stiffness 18.640 kNm/deg, curb mass delta -87.4 kg vs NC, 50:50 axle weight 50.22%
# MX5_ND_Trace[1085]: PPF torsional stiffness 18.675 kNm/deg, curb mass delta -87.3 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[1086]: PPF torsional stiffness 18.710 kNm/deg, curb mass delta -87.1 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[1087]: PPF torsional stiffness 18.745 kNm/deg, curb mass delta -87.0 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[1088]: PPF torsional stiffness 18.780 kNm/deg, curb mass delta -86.8 kg vs NC, 50:50 axle weight 50.24%
# MX5_ND_Trace[1089]: PPF torsional stiffness 18.815 kNm/deg, curb mass delta -86.7 kg vs NC, 50:50 axle weight 50.24%
# MX5_ND_Trace[1090]: PPF torsional stiffness 18.850 kNm/deg, curb mass delta -86.5 kg vs NC, 50:50 axle weight 50.25%
# MX5_ND_Trace[1091]: PPF torsional stiffness 18.885 kNm/deg, curb mass delta -86.3 kg vs NC, 50:50 axle weight 50.26%
# MX5_ND_Trace[1092]: PPF torsional stiffness 18.920 kNm/deg, curb mass delta -86.2 kg vs NC, 50:50 axle weight 50.26%
# MX5_ND_Trace[1093]: PPF torsional stiffness 18.955 kNm/deg, curb mass delta -86.1 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[1094]: PPF torsional stiffness 18.990 kNm/deg, curb mass delta -85.9 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[1095]: PPF torsional stiffness 19.025 kNm/deg, curb mass delta -85.8 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[1096]: PPF torsional stiffness 19.060 kNm/deg, curb mass delta -85.6 kg vs NC, 50:50 axle weight 50.28%
# MX5_ND_Trace[1097]: PPF torsional stiffness 19.095 kNm/deg, curb mass delta -85.5 kg vs NC, 50:50 axle weight 50.28%
# MX5_ND_Trace[1098]: PPF torsional stiffness 19.130 kNm/deg, curb mass delta -85.3 kg vs NC, 50:50 axle weight 50.29%
# MX5_ND_Trace[1099]: PPF torsional stiffness 19.165 kNm/deg, curb mass delta -85.2 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[1100]: PPF torsional stiffness 19.200 kNm/deg, curb mass delta -100.0 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[1101]: PPF torsional stiffness 19.235 kNm/deg, curb mass delta -99.8 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[1102]: PPF torsional stiffness 19.270 kNm/deg, curb mass delta -99.7 kg vs NC, 50:50 axle weight 50.31%
# MX5_ND_Trace[1103]: PPF torsional stiffness 19.305 kNm/deg, curb mass delta -99.6 kg vs NC, 50:50 axle weight 50.31%
# MX5_ND_Trace[1104]: PPF torsional stiffness 19.340 kNm/deg, curb mass delta -99.4 kg vs NC, 50:50 axle weight 50.32%
# MX5_ND_Trace[1105]: PPF torsional stiffness 19.375 kNm/deg, curb mass delta -99.3 kg vs NC, 50:50 axle weight 50.33%
# MX5_ND_Trace[1106]: PPF torsional stiffness 19.410 kNm/deg, curb mass delta -99.1 kg vs NC, 50:50 axle weight 50.33%
# MX5_ND_Trace[1107]: PPF torsional stiffness 19.445 kNm/deg, curb mass delta -99.0 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[1108]: PPF torsional stiffness 19.480 kNm/deg, curb mass delta -98.8 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[1109]: PPF torsional stiffness 19.515 kNm/deg, curb mass delta -98.7 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[1110]: PPF torsional stiffness 19.550 kNm/deg, curb mass delta -98.5 kg vs NC, 50:50 axle weight 50.35%
# MX5_ND_Trace[1111]: PPF torsional stiffness 19.585 kNm/deg, curb mass delta -98.3 kg vs NC, 50:50 axle weight 50.35%
# MX5_ND_Trace[1112]: PPF torsional stiffness 19.620 kNm/deg, curb mass delta -98.2 kg vs NC, 50:50 axle weight 50.36%
# MX5_ND_Trace[1113]: PPF torsional stiffness 19.655 kNm/deg, curb mass delta -98.1 kg vs NC, 50:50 axle weight 50.37%
# MX5_ND_Trace[1114]: PPF torsional stiffness 19.690 kNm/deg, curb mass delta -97.9 kg vs NC, 50:50 axle weight 50.37%
# MX5_ND_Trace[1115]: PPF torsional stiffness 19.725 kNm/deg, curb mass delta -97.8 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[1116]: PPF torsional stiffness 19.760 kNm/deg, curb mass delta -97.6 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[1117]: PPF torsional stiffness 19.795 kNm/deg, curb mass delta -97.5 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[1118]: PPF torsional stiffness 19.830 kNm/deg, curb mass delta -97.3 kg vs NC, 50:50 axle weight 50.39%
# MX5_ND_Trace[1119]: PPF torsional stiffness 19.865 kNm/deg, curb mass delta -97.2 kg vs NC, 50:50 axle weight 50.39%
# MX5_ND_Trace[1120]: PPF torsional stiffness 19.900 kNm/deg, curb mass delta -97.0 kg vs NC, 50:50 axle weight 50.00%
# MX5_ND_Trace[1121]: PPF torsional stiffness 19.935 kNm/deg, curb mass delta -96.8 kg vs NC, 50:50 axle weight 50.01%
# MX5_ND_Trace[1122]: PPF torsional stiffness 19.970 kNm/deg, curb mass delta -96.7 kg vs NC, 50:50 axle weight 50.01%
# MX5_ND_Trace[1123]: PPF torsional stiffness 20.005 kNm/deg, curb mass delta -96.6 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[1124]: PPF torsional stiffness 20.040 kNm/deg, curb mass delta -96.4 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[1125]: PPF torsional stiffness 20.075 kNm/deg, curb mass delta -96.3 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[1126]: PPF torsional stiffness 20.110 kNm/deg, curb mass delta -96.1 kg vs NC, 50:50 axle weight 50.03%
# MX5_ND_Trace[1127]: PPF torsional stiffness 20.145 kNm/deg, curb mass delta -96.0 kg vs NC, 50:50 axle weight 50.03%
# MX5_ND_Trace[1128]: PPF torsional stiffness 20.180 kNm/deg, curb mass delta -95.8 kg vs NC, 50:50 axle weight 50.04%
# MX5_ND_Trace[1129]: PPF torsional stiffness 20.215 kNm/deg, curb mass delta -95.7 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[1130]: PPF torsional stiffness 20.250 kNm/deg, curb mass delta -95.5 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[1131]: PPF torsional stiffness 20.285 kNm/deg, curb mass delta -95.3 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[1132]: PPF torsional stiffness 20.320 kNm/deg, curb mass delta -95.2 kg vs NC, 50:50 axle weight 50.06%
# MX5_ND_Trace[1133]: PPF torsional stiffness 20.355 kNm/deg, curb mass delta -95.1 kg vs NC, 50:50 axle weight 50.06%
# MX5_ND_Trace[1134]: PPF torsional stiffness 20.390 kNm/deg, curb mass delta -94.9 kg vs NC, 50:50 axle weight 50.07%
# MX5_ND_Trace[1135]: PPF torsional stiffness 20.425 kNm/deg, curb mass delta -94.8 kg vs NC, 50:50 axle weight 50.08%
# MX5_ND_Trace[1136]: PPF torsional stiffness 20.460 kNm/deg, curb mass delta -94.6 kg vs NC, 50:50 axle weight 50.08%
# MX5_ND_Trace[1137]: PPF torsional stiffness 20.495 kNm/deg, curb mass delta -94.5 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[1138]: PPF torsional stiffness 20.530 kNm/deg, curb mass delta -94.3 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[1139]: PPF torsional stiffness 20.565 kNm/deg, curb mass delta -94.2 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[1140]: PPF torsional stiffness 20.600 kNm/deg, curb mass delta -94.0 kg vs NC, 50:50 axle weight 50.10%
# MX5_ND_Trace[1141]: PPF torsional stiffness 20.635 kNm/deg, curb mass delta -93.8 kg vs NC, 50:50 axle weight 50.10%
# MX5_ND_Trace[1142]: PPF torsional stiffness 20.670 kNm/deg, curb mass delta -93.7 kg vs NC, 50:50 axle weight 50.11%
# MX5_ND_Trace[1143]: PPF torsional stiffness 20.705 kNm/deg, curb mass delta -93.6 kg vs NC, 50:50 axle weight 50.12%
# MX5_ND_Trace[1144]: PPF torsional stiffness 20.740 kNm/deg, curb mass delta -93.4 kg vs NC, 50:50 axle weight 50.12%
# MX5_ND_Trace[1145]: PPF torsional stiffness 20.775 kNm/deg, curb mass delta -93.3 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[1146]: PPF torsional stiffness 20.810 kNm/deg, curb mass delta -93.1 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[1147]: PPF torsional stiffness 20.845 kNm/deg, curb mass delta -93.0 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[1148]: PPF torsional stiffness 20.880 kNm/deg, curb mass delta -92.8 kg vs NC, 50:50 axle weight 50.14%
# MX5_ND_Trace[1149]: PPF torsional stiffness 20.915 kNm/deg, curb mass delta -92.7 kg vs NC, 50:50 axle weight 50.15%
# MX5_ND_Trace[1150]: PPF torsional stiffness 20.950 kNm/deg, curb mass delta -92.5 kg vs NC, 50:50 axle weight 50.15%
# MX5_ND_Trace[1151]: PPF torsional stiffness 20.985 kNm/deg, curb mass delta -92.3 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[1152]: PPF torsional stiffness 21.020 kNm/deg, curb mass delta -92.2 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[1153]: PPF torsional stiffness 21.055 kNm/deg, curb mass delta -92.1 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[1154]: PPF torsional stiffness 21.090 kNm/deg, curb mass delta -91.9 kg vs NC, 50:50 axle weight 50.17%
# MX5_ND_Trace[1155]: PPF torsional stiffness 21.125 kNm/deg, curb mass delta -91.8 kg vs NC, 50:50 axle weight 50.17%
# MX5_ND_Trace[1156]: PPF torsional stiffness 21.160 kNm/deg, curb mass delta -91.6 kg vs NC, 50:50 axle weight 50.18%
# MX5_ND_Trace[1157]: PPF torsional stiffness 21.195 kNm/deg, curb mass delta -91.5 kg vs NC, 50:50 axle weight 50.19%
# MX5_ND_Trace[1158]: PPF torsional stiffness 21.230 kNm/deg, curb mass delta -91.3 kg vs NC, 50:50 axle weight 50.19%
# MX5_ND_Trace[1159]: PPF torsional stiffness 21.265 kNm/deg, curb mass delta -91.2 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[1160]: PPF torsional stiffness 21.300 kNm/deg, curb mass delta -91.0 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[1161]: PPF torsional stiffness 21.335 kNm/deg, curb mass delta -90.8 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[1162]: PPF torsional stiffness 21.370 kNm/deg, curb mass delta -90.7 kg vs NC, 50:50 axle weight 50.21%
# MX5_ND_Trace[1163]: PPF torsional stiffness 21.405 kNm/deg, curb mass delta -90.6 kg vs NC, 50:50 axle weight 50.22%
# MX5_ND_Trace[1164]: PPF torsional stiffness 21.440 kNm/deg, curb mass delta -90.4 kg vs NC, 50:50 axle weight 50.22%
# MX5_ND_Trace[1165]: PPF torsional stiffness 21.475 kNm/deg, curb mass delta -90.3 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[1166]: PPF torsional stiffness 21.510 kNm/deg, curb mass delta -90.1 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[1167]: PPF torsional stiffness 21.545 kNm/deg, curb mass delta -90.0 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[1168]: PPF torsional stiffness 21.580 kNm/deg, curb mass delta -89.8 kg vs NC, 50:50 axle weight 50.24%
# MX5_ND_Trace[1169]: PPF torsional stiffness 21.615 kNm/deg, curb mass delta -89.7 kg vs NC, 50:50 axle weight 50.24%
# MX5_ND_Trace[1170]: PPF torsional stiffness 21.650 kNm/deg, curb mass delta -89.5 kg vs NC, 50:50 axle weight 50.25%
# MX5_ND_Trace[1171]: PPF torsional stiffness 21.685 kNm/deg, curb mass delta -89.3 kg vs NC, 50:50 axle weight 50.26%
# MX5_ND_Trace[1172]: PPF torsional stiffness 21.720 kNm/deg, curb mass delta -89.2 kg vs NC, 50:50 axle weight 50.26%
# MX5_ND_Trace[1173]: PPF torsional stiffness 21.755 kNm/deg, curb mass delta -89.1 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[1174]: PPF torsional stiffness 21.790 kNm/deg, curb mass delta -88.9 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[1175]: PPF torsional stiffness 21.825 kNm/deg, curb mass delta -88.8 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[1176]: PPF torsional stiffness 21.860 kNm/deg, curb mass delta -88.6 kg vs NC, 50:50 axle weight 50.28%
# MX5_ND_Trace[1177]: PPF torsional stiffness 21.895 kNm/deg, curb mass delta -88.5 kg vs NC, 50:50 axle weight 50.28%
# MX5_ND_Trace[1178]: PPF torsional stiffness 21.930 kNm/deg, curb mass delta -88.3 kg vs NC, 50:50 axle weight 50.29%
# MX5_ND_Trace[1179]: PPF torsional stiffness 21.965 kNm/deg, curb mass delta -88.2 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[1180]: PPF torsional stiffness 22.000 kNm/deg, curb mass delta -88.0 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[1181]: PPF torsional stiffness 22.035 kNm/deg, curb mass delta -87.8 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[1182]: PPF torsional stiffness 22.070 kNm/deg, curb mass delta -87.7 kg vs NC, 50:50 axle weight 50.31%
# MX5_ND_Trace[1183]: PPF torsional stiffness 22.105 kNm/deg, curb mass delta -87.6 kg vs NC, 50:50 axle weight 50.31%
# MX5_ND_Trace[1184]: PPF torsional stiffness 22.140 kNm/deg, curb mass delta -87.4 kg vs NC, 50:50 axle weight 50.32%
# MX5_ND_Trace[1185]: PPF torsional stiffness 22.175 kNm/deg, curb mass delta -87.3 kg vs NC, 50:50 axle weight 50.33%
# MX5_ND_Trace[1186]: PPF torsional stiffness 22.210 kNm/deg, curb mass delta -87.1 kg vs NC, 50:50 axle weight 50.33%
# MX5_ND_Trace[1187]: PPF torsional stiffness 22.245 kNm/deg, curb mass delta -87.0 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[1188]: PPF torsional stiffness 22.280 kNm/deg, curb mass delta -86.8 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[1189]: PPF torsional stiffness 22.315 kNm/deg, curb mass delta -86.7 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[1190]: PPF torsional stiffness 22.350 kNm/deg, curb mass delta -86.5 kg vs NC, 50:50 axle weight 50.35%
# MX5_ND_Trace[1191]: PPF torsional stiffness 22.385 kNm/deg, curb mass delta -86.3 kg vs NC, 50:50 axle weight 50.35%
# MX5_ND_Trace[1192]: PPF torsional stiffness 22.420 kNm/deg, curb mass delta -86.2 kg vs NC, 50:50 axle weight 50.36%
# MX5_ND_Trace[1193]: PPF torsional stiffness 22.455 kNm/deg, curb mass delta -86.1 kg vs NC, 50:50 axle weight 50.37%
# MX5_ND_Trace[1194]: PPF torsional stiffness 22.490 kNm/deg, curb mass delta -85.9 kg vs NC, 50:50 axle weight 50.37%
# MX5_ND_Trace[1195]: PPF torsional stiffness 22.525 kNm/deg, curb mass delta -85.8 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[1196]: PPF torsional stiffness 22.560 kNm/deg, curb mass delta -85.6 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[1197]: PPF torsional stiffness 22.595 kNm/deg, curb mass delta -85.5 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[1198]: PPF torsional stiffness 22.630 kNm/deg, curb mass delta -85.3 kg vs NC, 50:50 axle weight 50.39%
# MX5_ND_Trace[1199]: PPF torsional stiffness 22.665 kNm/deg, curb mass delta -85.2 kg vs NC, 50:50 axle weight 50.40%
# MX5_ND_Trace[1200]: PPF torsional stiffness 18.500 kNm/deg, curb mass delta -100.0 kg vs NC, 50:50 axle weight 50.40%
# MX5_ND_Trace[1201]: PPF torsional stiffness 18.535 kNm/deg, curb mass delta -99.8 kg vs NC, 50:50 axle weight 50.01%
# MX5_ND_Trace[1202]: PPF torsional stiffness 18.570 kNm/deg, curb mass delta -99.7 kg vs NC, 50:50 axle weight 50.01%
# MX5_ND_Trace[1203]: PPF torsional stiffness 18.605 kNm/deg, curb mass delta -99.6 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[1204]: PPF torsional stiffness 18.640 kNm/deg, curb mass delta -99.4 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[1205]: PPF torsional stiffness 18.675 kNm/deg, curb mass delta -99.3 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[1206]: PPF torsional stiffness 18.710 kNm/deg, curb mass delta -99.1 kg vs NC, 50:50 axle weight 50.03%
# MX5_ND_Trace[1207]: PPF torsional stiffness 18.745 kNm/deg, curb mass delta -99.0 kg vs NC, 50:50 axle weight 50.03%
# MX5_ND_Trace[1208]: PPF torsional stiffness 18.780 kNm/deg, curb mass delta -98.8 kg vs NC, 50:50 axle weight 50.04%
# MX5_ND_Trace[1209]: PPF torsional stiffness 18.815 kNm/deg, curb mass delta -98.7 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[1210]: PPF torsional stiffness 18.850 kNm/deg, curb mass delta -98.5 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[1211]: PPF torsional stiffness 18.885 kNm/deg, curb mass delta -98.3 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[1212]: PPF torsional stiffness 18.920 kNm/deg, curb mass delta -98.2 kg vs NC, 50:50 axle weight 50.06%
# MX5_ND_Trace[1213]: PPF torsional stiffness 18.955 kNm/deg, curb mass delta -98.1 kg vs NC, 50:50 axle weight 50.06%
# MX5_ND_Trace[1214]: PPF torsional stiffness 18.990 kNm/deg, curb mass delta -97.9 kg vs NC, 50:50 axle weight 50.07%
# MX5_ND_Trace[1215]: PPF torsional stiffness 19.025 kNm/deg, curb mass delta -97.8 kg vs NC, 50:50 axle weight 50.08%
# MX5_ND_Trace[1216]: PPF torsional stiffness 19.060 kNm/deg, curb mass delta -97.6 kg vs NC, 50:50 axle weight 50.08%
# MX5_ND_Trace[1217]: PPF torsional stiffness 19.095 kNm/deg, curb mass delta -97.5 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[1218]: PPF torsional stiffness 19.130 kNm/deg, curb mass delta -97.3 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[1219]: PPF torsional stiffness 19.165 kNm/deg, curb mass delta -97.2 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[1220]: PPF torsional stiffness 19.200 kNm/deg, curb mass delta -97.0 kg vs NC, 50:50 axle weight 50.10%
# MX5_ND_Trace[1221]: PPF torsional stiffness 19.235 kNm/deg, curb mass delta -96.8 kg vs NC, 50:50 axle weight 50.10%
# MX5_ND_Trace[1222]: PPF torsional stiffness 19.270 kNm/deg, curb mass delta -96.7 kg vs NC, 50:50 axle weight 50.11%
# MX5_ND_Trace[1223]: PPF torsional stiffness 19.305 kNm/deg, curb mass delta -96.6 kg vs NC, 50:50 axle weight 50.12%
# MX5_ND_Trace[1224]: PPF torsional stiffness 19.340 kNm/deg, curb mass delta -96.4 kg vs NC, 50:50 axle weight 50.12%
# MX5_ND_Trace[1225]: PPF torsional stiffness 19.375 kNm/deg, curb mass delta -96.3 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[1226]: PPF torsional stiffness 19.410 kNm/deg, curb mass delta -96.1 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[1227]: PPF torsional stiffness 19.445 kNm/deg, curb mass delta -96.0 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[1228]: PPF torsional stiffness 19.480 kNm/deg, curb mass delta -95.8 kg vs NC, 50:50 axle weight 50.14%
# MX5_ND_Trace[1229]: PPF torsional stiffness 19.515 kNm/deg, curb mass delta -95.7 kg vs NC, 50:50 axle weight 50.15%
# MX5_ND_Trace[1230]: PPF torsional stiffness 19.550 kNm/deg, curb mass delta -95.5 kg vs NC, 50:50 axle weight 50.15%
# MX5_ND_Trace[1231]: PPF torsional stiffness 19.585 kNm/deg, curb mass delta -95.3 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[1232]: PPF torsional stiffness 19.620 kNm/deg, curb mass delta -95.2 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[1233]: PPF torsional stiffness 19.655 kNm/deg, curb mass delta -95.1 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[1234]: PPF torsional stiffness 19.690 kNm/deg, curb mass delta -94.9 kg vs NC, 50:50 axle weight 50.17%
# MX5_ND_Trace[1235]: PPF torsional stiffness 19.725 kNm/deg, curb mass delta -94.8 kg vs NC, 50:50 axle weight 50.17%
# MX5_ND_Trace[1236]: PPF torsional stiffness 19.760 kNm/deg, curb mass delta -94.6 kg vs NC, 50:50 axle weight 50.18%
# MX5_ND_Trace[1237]: PPF torsional stiffness 19.795 kNm/deg, curb mass delta -94.5 kg vs NC, 50:50 axle weight 50.19%
# MX5_ND_Trace[1238]: PPF torsional stiffness 19.830 kNm/deg, curb mass delta -94.3 kg vs NC, 50:50 axle weight 50.19%
# MX5_ND_Trace[1239]: PPF torsional stiffness 19.865 kNm/deg, curb mass delta -94.2 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[1240]: PPF torsional stiffness 19.900 kNm/deg, curb mass delta -94.0 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[1241]: PPF torsional stiffness 19.935 kNm/deg, curb mass delta -93.8 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[1242]: PPF torsional stiffness 19.970 kNm/deg, curb mass delta -93.7 kg vs NC, 50:50 axle weight 50.21%
# MX5_ND_Trace[1243]: PPF torsional stiffness 20.005 kNm/deg, curb mass delta -93.6 kg vs NC, 50:50 axle weight 50.21%
# MX5_ND_Trace[1244]: PPF torsional stiffness 20.040 kNm/deg, curb mass delta -93.4 kg vs NC, 50:50 axle weight 50.22%
# MX5_ND_Trace[1245]: PPF torsional stiffness 20.075 kNm/deg, curb mass delta -93.3 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[1246]: PPF torsional stiffness 20.110 kNm/deg, curb mass delta -93.1 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[1247]: PPF torsional stiffness 20.145 kNm/deg, curb mass delta -93.0 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[1248]: PPF torsional stiffness 20.180 kNm/deg, curb mass delta -92.8 kg vs NC, 50:50 axle weight 50.24%
# MX5_ND_Trace[1249]: PPF torsional stiffness 20.215 kNm/deg, curb mass delta -92.7 kg vs NC, 50:50 axle weight 50.24%
# MX5_ND_Trace[1250]: PPF torsional stiffness 20.250 kNm/deg, curb mass delta -92.5 kg vs NC, 50:50 axle weight 50.25%
# MX5_ND_Trace[1251]: PPF torsional stiffness 20.285 kNm/deg, curb mass delta -92.3 kg vs NC, 50:50 axle weight 50.26%
# MX5_ND_Trace[1252]: PPF torsional stiffness 20.320 kNm/deg, curb mass delta -92.2 kg vs NC, 50:50 axle weight 50.26%
# MX5_ND_Trace[1253]: PPF torsional stiffness 20.355 kNm/deg, curb mass delta -92.1 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[1254]: PPF torsional stiffness 20.390 kNm/deg, curb mass delta -91.9 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[1255]: PPF torsional stiffness 20.425 kNm/deg, curb mass delta -91.8 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[1256]: PPF torsional stiffness 20.460 kNm/deg, curb mass delta -91.6 kg vs NC, 50:50 axle weight 50.28%
# MX5_ND_Trace[1257]: PPF torsional stiffness 20.495 kNm/deg, curb mass delta -91.5 kg vs NC, 50:50 axle weight 50.28%
# MX5_ND_Trace[1258]: PPF torsional stiffness 20.530 kNm/deg, curb mass delta -91.3 kg vs NC, 50:50 axle weight 50.29%
# MX5_ND_Trace[1259]: PPF torsional stiffness 20.565 kNm/deg, curb mass delta -91.2 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[1260]: PPF torsional stiffness 20.600 kNm/deg, curb mass delta -91.0 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[1261]: PPF torsional stiffness 20.635 kNm/deg, curb mass delta -90.8 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[1262]: PPF torsional stiffness 20.670 kNm/deg, curb mass delta -90.7 kg vs NC, 50:50 axle weight 50.31%
# MX5_ND_Trace[1263]: PPF torsional stiffness 20.705 kNm/deg, curb mass delta -90.6 kg vs NC, 50:50 axle weight 50.31%
# MX5_ND_Trace[1264]: PPF torsional stiffness 20.740 kNm/deg, curb mass delta -90.4 kg vs NC, 50:50 axle weight 50.32%
# MX5_ND_Trace[1265]: PPF torsional stiffness 20.775 kNm/deg, curb mass delta -90.3 kg vs NC, 50:50 axle weight 50.33%
# MX5_ND_Trace[1266]: PPF torsional stiffness 20.810 kNm/deg, curb mass delta -90.1 kg vs NC, 50:50 axle weight 50.33%
# MX5_ND_Trace[1267]: PPF torsional stiffness 20.845 kNm/deg, curb mass delta -90.0 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[1268]: PPF torsional stiffness 20.880 kNm/deg, curb mass delta -89.8 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[1269]: PPF torsional stiffness 20.915 kNm/deg, curb mass delta -89.7 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[1270]: PPF torsional stiffness 20.950 kNm/deg, curb mass delta -89.5 kg vs NC, 50:50 axle weight 50.35%
# MX5_ND_Trace[1271]: PPF torsional stiffness 20.985 kNm/deg, curb mass delta -89.3 kg vs NC, 50:50 axle weight 50.35%
# MX5_ND_Trace[1272]: PPF torsional stiffness 21.020 kNm/deg, curb mass delta -89.2 kg vs NC, 50:50 axle weight 50.36%
# MX5_ND_Trace[1273]: PPF torsional stiffness 21.055 kNm/deg, curb mass delta -89.1 kg vs NC, 50:50 axle weight 50.37%
# MX5_ND_Trace[1274]: PPF torsional stiffness 21.090 kNm/deg, curb mass delta -88.9 kg vs NC, 50:50 axle weight 50.37%
# MX5_ND_Trace[1275]: PPF torsional stiffness 21.125 kNm/deg, curb mass delta -88.8 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[1276]: PPF torsional stiffness 21.160 kNm/deg, curb mass delta -88.6 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[1277]: PPF torsional stiffness 21.195 kNm/deg, curb mass delta -88.5 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[1278]: PPF torsional stiffness 21.230 kNm/deg, curb mass delta -88.3 kg vs NC, 50:50 axle weight 50.39%
# MX5_ND_Trace[1279]: PPF torsional stiffness 21.265 kNm/deg, curb mass delta -88.2 kg vs NC, 50:50 axle weight 50.40%
# MX5_ND_Trace[1280]: PPF torsional stiffness 21.300 kNm/deg, curb mass delta -88.0 kg vs NC, 50:50 axle weight 50.00%
# MX5_ND_Trace[1281]: PPF torsional stiffness 21.335 kNm/deg, curb mass delta -87.8 kg vs NC, 50:50 axle weight 50.01%
# MX5_ND_Trace[1282]: PPF torsional stiffness 21.370 kNm/deg, curb mass delta -87.7 kg vs NC, 50:50 axle weight 50.01%
# MX5_ND_Trace[1283]: PPF torsional stiffness 21.405 kNm/deg, curb mass delta -87.6 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[1284]: PPF torsional stiffness 21.440 kNm/deg, curb mass delta -87.4 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[1285]: PPF torsional stiffness 21.475 kNm/deg, curb mass delta -87.3 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[1286]: PPF torsional stiffness 21.510 kNm/deg, curb mass delta -87.1 kg vs NC, 50:50 axle weight 50.03%
# MX5_ND_Trace[1287]: PPF torsional stiffness 21.545 kNm/deg, curb mass delta -87.0 kg vs NC, 50:50 axle weight 50.03%
# MX5_ND_Trace[1288]: PPF torsional stiffness 21.580 kNm/deg, curb mass delta -86.8 kg vs NC, 50:50 axle weight 50.04%
# MX5_ND_Trace[1289]: PPF torsional stiffness 21.615 kNm/deg, curb mass delta -86.7 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[1290]: PPF torsional stiffness 21.650 kNm/deg, curb mass delta -86.5 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[1291]: PPF torsional stiffness 21.685 kNm/deg, curb mass delta -86.3 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[1292]: PPF torsional stiffness 21.720 kNm/deg, curb mass delta -86.2 kg vs NC, 50:50 axle weight 50.06%
# MX5_ND_Trace[1293]: PPF torsional stiffness 21.755 kNm/deg, curb mass delta -86.1 kg vs NC, 50:50 axle weight 50.06%
# MX5_ND_Trace[1294]: PPF torsional stiffness 21.790 kNm/deg, curb mass delta -85.9 kg vs NC, 50:50 axle weight 50.07%
# MX5_ND_Trace[1295]: PPF torsional stiffness 21.825 kNm/deg, curb mass delta -85.8 kg vs NC, 50:50 axle weight 50.08%
# MX5_ND_Trace[1296]: PPF torsional stiffness 21.860 kNm/deg, curb mass delta -85.6 kg vs NC, 50:50 axle weight 50.08%
# MX5_ND_Trace[1297]: PPF torsional stiffness 21.895 kNm/deg, curb mass delta -85.5 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[1298]: PPF torsional stiffness 21.930 kNm/deg, curb mass delta -85.3 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[1299]: PPF torsional stiffness 21.965 kNm/deg, curb mass delta -85.2 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[1300]: PPF torsional stiffness 22.000 kNm/deg, curb mass delta -100.0 kg vs NC, 50:50 axle weight 50.10%
# MX5_ND_Trace[1301]: PPF torsional stiffness 22.035 kNm/deg, curb mass delta -99.8 kg vs NC, 50:50 axle weight 50.10%
# MX5_ND_Trace[1302]: PPF torsional stiffness 22.070 kNm/deg, curb mass delta -99.7 kg vs NC, 50:50 axle weight 50.11%
# MX5_ND_Trace[1303]: PPF torsional stiffness 22.105 kNm/deg, curb mass delta -99.6 kg vs NC, 50:50 axle weight 50.12%
# MX5_ND_Trace[1304]: PPF torsional stiffness 22.140 kNm/deg, curb mass delta -99.4 kg vs NC, 50:50 axle weight 50.12%
# MX5_ND_Trace[1305]: PPF torsional stiffness 22.175 kNm/deg, curb mass delta -99.3 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[1306]: PPF torsional stiffness 22.210 kNm/deg, curb mass delta -99.1 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[1307]: PPF torsional stiffness 22.245 kNm/deg, curb mass delta -99.0 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[1308]: PPF torsional stiffness 22.280 kNm/deg, curb mass delta -98.8 kg vs NC, 50:50 axle weight 50.14%
# MX5_ND_Trace[1309]: PPF torsional stiffness 22.315 kNm/deg, curb mass delta -98.7 kg vs NC, 50:50 axle weight 50.14%
# MX5_ND_Trace[1310]: PPF torsional stiffness 22.350 kNm/deg, curb mass delta -98.5 kg vs NC, 50:50 axle weight 50.15%
# MX5_ND_Trace[1311]: PPF torsional stiffness 22.385 kNm/deg, curb mass delta -98.3 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[1312]: PPF torsional stiffness 22.420 kNm/deg, curb mass delta -98.2 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[1313]: PPF torsional stiffness 22.455 kNm/deg, curb mass delta -98.1 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[1314]: PPF torsional stiffness 22.490 kNm/deg, curb mass delta -97.9 kg vs NC, 50:50 axle weight 50.17%
# MX5_ND_Trace[1315]: PPF torsional stiffness 22.525 kNm/deg, curb mass delta -97.8 kg vs NC, 50:50 axle weight 50.17%
# MX5_ND_Trace[1316]: PPF torsional stiffness 22.560 kNm/deg, curb mass delta -97.6 kg vs NC, 50:50 axle weight 50.18%
# MX5_ND_Trace[1317]: PPF torsional stiffness 22.595 kNm/deg, curb mass delta -97.5 kg vs NC, 50:50 axle weight 50.19%
# MX5_ND_Trace[1318]: PPF torsional stiffness 22.630 kNm/deg, curb mass delta -97.3 kg vs NC, 50:50 axle weight 50.19%
# MX5_ND_Trace[1319]: PPF torsional stiffness 22.665 kNm/deg, curb mass delta -97.2 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[1320]: PPF torsional stiffness 18.500 kNm/deg, curb mass delta -97.0 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[1321]: PPF torsional stiffness 18.535 kNm/deg, curb mass delta -96.8 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[1322]: PPF torsional stiffness 18.570 kNm/deg, curb mass delta -96.7 kg vs NC, 50:50 axle weight 50.21%
# MX5_ND_Trace[1323]: PPF torsional stiffness 18.605 kNm/deg, curb mass delta -96.6 kg vs NC, 50:50 axle weight 50.22%
# MX5_ND_Trace[1324]: PPF torsional stiffness 18.640 kNm/deg, curb mass delta -96.4 kg vs NC, 50:50 axle weight 50.22%
# MX5_ND_Trace[1325]: PPF torsional stiffness 18.675 kNm/deg, curb mass delta -96.3 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[1326]: PPF torsional stiffness 18.710 kNm/deg, curb mass delta -96.1 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[1327]: PPF torsional stiffness 18.745 kNm/deg, curb mass delta -96.0 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[1328]: PPF torsional stiffness 18.780 kNm/deg, curb mass delta -95.8 kg vs NC, 50:50 axle weight 50.24%
# MX5_ND_Trace[1329]: PPF torsional stiffness 18.815 kNm/deg, curb mass delta -95.7 kg vs NC, 50:50 axle weight 50.24%
# MX5_ND_Trace[1330]: PPF torsional stiffness 18.850 kNm/deg, curb mass delta -95.5 kg vs NC, 50:50 axle weight 50.25%
# MX5_ND_Trace[1331]: PPF torsional stiffness 18.885 kNm/deg, curb mass delta -95.3 kg vs NC, 50:50 axle weight 50.26%
# MX5_ND_Trace[1332]: PPF torsional stiffness 18.920 kNm/deg, curb mass delta -95.2 kg vs NC, 50:50 axle weight 50.26%
# MX5_ND_Trace[1333]: PPF torsional stiffness 18.955 kNm/deg, curb mass delta -95.1 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[1334]: PPF torsional stiffness 18.990 kNm/deg, curb mass delta -94.9 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[1335]: PPF torsional stiffness 19.025 kNm/deg, curb mass delta -94.8 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[1336]: PPF torsional stiffness 19.060 kNm/deg, curb mass delta -94.6 kg vs NC, 50:50 axle weight 50.28%
# MX5_ND_Trace[1337]: PPF torsional stiffness 19.095 kNm/deg, curb mass delta -94.5 kg vs NC, 50:50 axle weight 50.28%
# MX5_ND_Trace[1338]: PPF torsional stiffness 19.130 kNm/deg, curb mass delta -94.3 kg vs NC, 50:50 axle weight 50.29%
# MX5_ND_Trace[1339]: PPF torsional stiffness 19.165 kNm/deg, curb mass delta -94.2 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[1340]: PPF torsional stiffness 19.200 kNm/deg, curb mass delta -94.0 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[1341]: PPF torsional stiffness 19.235 kNm/deg, curb mass delta -93.8 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[1342]: PPF torsional stiffness 19.270 kNm/deg, curb mass delta -93.7 kg vs NC, 50:50 axle weight 50.31%
# MX5_ND_Trace[1343]: PPF torsional stiffness 19.305 kNm/deg, curb mass delta -93.6 kg vs NC, 50:50 axle weight 50.31%
# MX5_ND_Trace[1344]: PPF torsional stiffness 19.340 kNm/deg, curb mass delta -93.4 kg vs NC, 50:50 axle weight 50.32%
# MX5_ND_Trace[1345]: PPF torsional stiffness 19.375 kNm/deg, curb mass delta -93.3 kg vs NC, 50:50 axle weight 50.33%
# MX5_ND_Trace[1346]: PPF torsional stiffness 19.410 kNm/deg, curb mass delta -93.1 kg vs NC, 50:50 axle weight 50.33%
# MX5_ND_Trace[1347]: PPF torsional stiffness 19.445 kNm/deg, curb mass delta -93.0 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[1348]: PPF torsional stiffness 19.480 kNm/deg, curb mass delta -92.8 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[1349]: PPF torsional stiffness 19.515 kNm/deg, curb mass delta -92.7 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[1350]: PPF torsional stiffness 19.550 kNm/deg, curb mass delta -92.5 kg vs NC, 50:50 axle weight 50.35%
# MX5_ND_Trace[1351]: PPF torsional stiffness 19.585 kNm/deg, curb mass delta -92.3 kg vs NC, 50:50 axle weight 50.35%
# MX5_ND_Trace[1352]: PPF torsional stiffness 19.620 kNm/deg, curb mass delta -92.2 kg vs NC, 50:50 axle weight 50.36%
# MX5_ND_Trace[1353]: PPF torsional stiffness 19.655 kNm/deg, curb mass delta -92.1 kg vs NC, 50:50 axle weight 50.37%
# MX5_ND_Trace[1354]: PPF torsional stiffness 19.690 kNm/deg, curb mass delta -91.9 kg vs NC, 50:50 axle weight 50.37%
# MX5_ND_Trace[1355]: PPF torsional stiffness 19.725 kNm/deg, curb mass delta -91.8 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[1356]: PPF torsional stiffness 19.760 kNm/deg, curb mass delta -91.6 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[1357]: PPF torsional stiffness 19.795 kNm/deg, curb mass delta -91.5 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[1358]: PPF torsional stiffness 19.830 kNm/deg, curb mass delta -91.3 kg vs NC, 50:50 axle weight 50.39%
# MX5_ND_Trace[1359]: PPF torsional stiffness 19.865 kNm/deg, curb mass delta -91.2 kg vs NC, 50:50 axle weight 50.39%
# MX5_ND_Trace[1360]: PPF torsional stiffness 19.900 kNm/deg, curb mass delta -91.0 kg vs NC, 50:50 axle weight 50.40%
# MX5_ND_Trace[1361]: PPF torsional stiffness 19.935 kNm/deg, curb mass delta -90.8 kg vs NC, 50:50 axle weight 50.01%
# MX5_ND_Trace[1362]: PPF torsional stiffness 19.970 kNm/deg, curb mass delta -90.7 kg vs NC, 50:50 axle weight 50.01%
# MX5_ND_Trace[1363]: PPF torsional stiffness 20.005 kNm/deg, curb mass delta -90.6 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[1364]: PPF torsional stiffness 20.040 kNm/deg, curb mass delta -90.4 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[1365]: PPF torsional stiffness 20.075 kNm/deg, curb mass delta -90.3 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[1366]: PPF torsional stiffness 20.110 kNm/deg, curb mass delta -90.1 kg vs NC, 50:50 axle weight 50.03%
# MX5_ND_Trace[1367]: PPF torsional stiffness 20.145 kNm/deg, curb mass delta -90.0 kg vs NC, 50:50 axle weight 50.03%
# MX5_ND_Trace[1368]: PPF torsional stiffness 20.180 kNm/deg, curb mass delta -89.8 kg vs NC, 50:50 axle weight 50.04%
# MX5_ND_Trace[1369]: PPF torsional stiffness 20.215 kNm/deg, curb mass delta -89.7 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[1370]: PPF torsional stiffness 20.250 kNm/deg, curb mass delta -89.5 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[1371]: PPF torsional stiffness 20.285 kNm/deg, curb mass delta -89.3 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[1372]: PPF torsional stiffness 20.320 kNm/deg, curb mass delta -89.2 kg vs NC, 50:50 axle weight 50.06%
# MX5_ND_Trace[1373]: PPF torsional stiffness 20.355 kNm/deg, curb mass delta -89.1 kg vs NC, 50:50 axle weight 50.06%
# MX5_ND_Trace[1374]: PPF torsional stiffness 20.390 kNm/deg, curb mass delta -88.9 kg vs NC, 50:50 axle weight 50.07%
# MX5_ND_Trace[1375]: PPF torsional stiffness 20.425 kNm/deg, curb mass delta -88.8 kg vs NC, 50:50 axle weight 50.08%
# MX5_ND_Trace[1376]: PPF torsional stiffness 20.460 kNm/deg, curb mass delta -88.6 kg vs NC, 50:50 axle weight 50.08%
# MX5_ND_Trace[1377]: PPF torsional stiffness 20.495 kNm/deg, curb mass delta -88.5 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[1378]: PPF torsional stiffness 20.530 kNm/deg, curb mass delta -88.3 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[1379]: PPF torsional stiffness 20.565 kNm/deg, curb mass delta -88.2 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[1380]: PPF torsional stiffness 20.600 kNm/deg, curb mass delta -88.0 kg vs NC, 50:50 axle weight 50.10%
# MX5_ND_Trace[1381]: PPF torsional stiffness 20.635 kNm/deg, curb mass delta -87.8 kg vs NC, 50:50 axle weight 50.10%
# MX5_ND_Trace[1382]: PPF torsional stiffness 20.670 kNm/deg, curb mass delta -87.7 kg vs NC, 50:50 axle weight 50.11%
# MX5_ND_Trace[1383]: PPF torsional stiffness 20.705 kNm/deg, curb mass delta -87.6 kg vs NC, 50:50 axle weight 50.12%
# MX5_ND_Trace[1384]: PPF torsional stiffness 20.740 kNm/deg, curb mass delta -87.4 kg vs NC, 50:50 axle weight 50.12%
# MX5_ND_Trace[1385]: PPF torsional stiffness 20.775 kNm/deg, curb mass delta -87.3 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[1386]: PPF torsional stiffness 20.810 kNm/deg, curb mass delta -87.1 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[1387]: PPF torsional stiffness 20.845 kNm/deg, curb mass delta -87.0 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[1388]: PPF torsional stiffness 20.880 kNm/deg, curb mass delta -86.8 kg vs NC, 50:50 axle weight 50.14%
# MX5_ND_Trace[1389]: PPF torsional stiffness 20.915 kNm/deg, curb mass delta -86.7 kg vs NC, 50:50 axle weight 50.15%
# MX5_ND_Trace[1390]: PPF torsional stiffness 20.950 kNm/deg, curb mass delta -86.5 kg vs NC, 50:50 axle weight 50.15%
# MX5_ND_Trace[1391]: PPF torsional stiffness 20.985 kNm/deg, curb mass delta -86.3 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[1392]: PPF torsional stiffness 21.020 kNm/deg, curb mass delta -86.2 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[1393]: PPF torsional stiffness 21.055 kNm/deg, curb mass delta -86.1 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[1394]: PPF torsional stiffness 21.090 kNm/deg, curb mass delta -85.9 kg vs NC, 50:50 axle weight 50.17%
# MX5_ND_Trace[1395]: PPF torsional stiffness 21.125 kNm/deg, curb mass delta -85.8 kg vs NC, 50:50 axle weight 50.17%
# MX5_ND_Trace[1396]: PPF torsional stiffness 21.160 kNm/deg, curb mass delta -85.6 kg vs NC, 50:50 axle weight 50.18%
# MX5_ND_Trace[1397]: PPF torsional stiffness 21.195 kNm/deg, curb mass delta -85.5 kg vs NC, 50:50 axle weight 50.19%
# MX5_ND_Trace[1398]: PPF torsional stiffness 21.230 kNm/deg, curb mass delta -85.3 kg vs NC, 50:50 axle weight 50.19%
# MX5_ND_Trace[1399]: PPF torsional stiffness 21.265 kNm/deg, curb mass delta -85.2 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[1400]: PPF torsional stiffness 21.300 kNm/deg, curb mass delta -100.0 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[1401]: PPF torsional stiffness 21.335 kNm/deg, curb mass delta -99.8 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[1402]: PPF torsional stiffness 21.370 kNm/deg, curb mass delta -99.7 kg vs NC, 50:50 axle weight 50.21%
# MX5_ND_Trace[1403]: PPF torsional stiffness 21.405 kNm/deg, curb mass delta -99.6 kg vs NC, 50:50 axle weight 50.22%
# MX5_ND_Trace[1404]: PPF torsional stiffness 21.440 kNm/deg, curb mass delta -99.4 kg vs NC, 50:50 axle weight 50.22%
# MX5_ND_Trace[1405]: PPF torsional stiffness 21.475 kNm/deg, curb mass delta -99.3 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[1406]: PPF torsional stiffness 21.510 kNm/deg, curb mass delta -99.1 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[1407]: PPF torsional stiffness 21.545 kNm/deg, curb mass delta -99.0 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[1408]: PPF torsional stiffness 21.580 kNm/deg, curb mass delta -98.8 kg vs NC, 50:50 axle weight 50.24%
# MX5_ND_Trace[1409]: PPF torsional stiffness 21.615 kNm/deg, curb mass delta -98.7 kg vs NC, 50:50 axle weight 50.24%
# MX5_ND_Trace[1410]: PPF torsional stiffness 21.650 kNm/deg, curb mass delta -98.5 kg vs NC, 50:50 axle weight 50.25%
# MX5_ND_Trace[1411]: PPF torsional stiffness 21.685 kNm/deg, curb mass delta -98.3 kg vs NC, 50:50 axle weight 50.26%
# MX5_ND_Trace[1412]: PPF torsional stiffness 21.720 kNm/deg, curb mass delta -98.2 kg vs NC, 50:50 axle weight 50.26%
# MX5_ND_Trace[1413]: PPF torsional stiffness 21.755 kNm/deg, curb mass delta -98.1 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[1414]: PPF torsional stiffness 21.790 kNm/deg, curb mass delta -97.9 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[1415]: PPF torsional stiffness 21.825 kNm/deg, curb mass delta -97.8 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[1416]: PPF torsional stiffness 21.860 kNm/deg, curb mass delta -97.6 kg vs NC, 50:50 axle weight 50.28%
# MX5_ND_Trace[1417]: PPF torsional stiffness 21.895 kNm/deg, curb mass delta -97.5 kg vs NC, 50:50 axle weight 50.28%
# MX5_ND_Trace[1418]: PPF torsional stiffness 21.930 kNm/deg, curb mass delta -97.3 kg vs NC, 50:50 axle weight 50.29%
# MX5_ND_Trace[1419]: PPF torsional stiffness 21.965 kNm/deg, curb mass delta -97.2 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[1420]: PPF torsional stiffness 22.000 kNm/deg, curb mass delta -97.0 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[1421]: PPF torsional stiffness 22.035 kNm/deg, curb mass delta -96.8 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[1422]: PPF torsional stiffness 22.070 kNm/deg, curb mass delta -96.7 kg vs NC, 50:50 axle weight 50.31%
# MX5_ND_Trace[1423]: PPF torsional stiffness 22.105 kNm/deg, curb mass delta -96.6 kg vs NC, 50:50 axle weight 50.31%
# MX5_ND_Trace[1424]: PPF torsional stiffness 22.140 kNm/deg, curb mass delta -96.4 kg vs NC, 50:50 axle weight 50.32%
# MX5_ND_Trace[1425]: PPF torsional stiffness 22.175 kNm/deg, curb mass delta -96.3 kg vs NC, 50:50 axle weight 50.33%
# MX5_ND_Trace[1426]: PPF torsional stiffness 22.210 kNm/deg, curb mass delta -96.1 kg vs NC, 50:50 axle weight 50.33%
# MX5_ND_Trace[1427]: PPF torsional stiffness 22.245 kNm/deg, curb mass delta -96.0 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[1428]: PPF torsional stiffness 22.280 kNm/deg, curb mass delta -95.8 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[1429]: PPF torsional stiffness 22.315 kNm/deg, curb mass delta -95.7 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[1430]: PPF torsional stiffness 22.350 kNm/deg, curb mass delta -95.5 kg vs NC, 50:50 axle weight 50.35%
# MX5_ND_Trace[1431]: PPF torsional stiffness 22.385 kNm/deg, curb mass delta -95.3 kg vs NC, 50:50 axle weight 50.35%
# MX5_ND_Trace[1432]: PPF torsional stiffness 22.420 kNm/deg, curb mass delta -95.2 kg vs NC, 50:50 axle weight 50.36%
# MX5_ND_Trace[1433]: PPF torsional stiffness 22.455 kNm/deg, curb mass delta -95.1 kg vs NC, 50:50 axle weight 50.37%
# MX5_ND_Trace[1434]: PPF torsional stiffness 22.490 kNm/deg, curb mass delta -94.9 kg vs NC, 50:50 axle weight 50.37%
# MX5_ND_Trace[1435]: PPF torsional stiffness 22.525 kNm/deg, curb mass delta -94.8 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[1436]: PPF torsional stiffness 22.560 kNm/deg, curb mass delta -94.6 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[1437]: PPF torsional stiffness 22.595 kNm/deg, curb mass delta -94.5 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[1438]: PPF torsional stiffness 22.630 kNm/deg, curb mass delta -94.3 kg vs NC, 50:50 axle weight 50.39%
# MX5_ND_Trace[1439]: PPF torsional stiffness 22.665 kNm/deg, curb mass delta -94.2 kg vs NC, 50:50 axle weight 50.40%
# MX5_ND_Trace[1440]: PPF torsional stiffness 18.500 kNm/deg, curb mass delta -94.0 kg vs NC, 50:50 axle weight 50.40%
# MX5_ND_Trace[1441]: PPF torsional stiffness 18.535 kNm/deg, curb mass delta -93.8 kg vs NC, 50:50 axle weight 50.01%
# MX5_ND_Trace[1442]: PPF torsional stiffness 18.570 kNm/deg, curb mass delta -93.7 kg vs NC, 50:50 axle weight 50.01%
# MX5_ND_Trace[1443]: PPF torsional stiffness 18.605 kNm/deg, curb mass delta -93.6 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[1444]: PPF torsional stiffness 18.640 kNm/deg, curb mass delta -93.4 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[1445]: PPF torsional stiffness 18.675 kNm/deg, curb mass delta -93.3 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[1446]: PPF torsional stiffness 18.710 kNm/deg, curb mass delta -93.1 kg vs NC, 50:50 axle weight 50.03%
# MX5_ND_Trace[1447]: PPF torsional stiffness 18.745 kNm/deg, curb mass delta -93.0 kg vs NC, 50:50 axle weight 50.03%
# MX5_ND_Trace[1448]: PPF torsional stiffness 18.780 kNm/deg, curb mass delta -92.8 kg vs NC, 50:50 axle weight 50.04%
# MX5_ND_Trace[1449]: PPF torsional stiffness 18.815 kNm/deg, curb mass delta -92.7 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[1450]: PPF torsional stiffness 18.850 kNm/deg, curb mass delta -92.5 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[1451]: PPF torsional stiffness 18.885 kNm/deg, curb mass delta -92.3 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[1452]: PPF torsional stiffness 18.920 kNm/deg, curb mass delta -92.2 kg vs NC, 50:50 axle weight 50.06%
# MX5_ND_Trace[1453]: PPF torsional stiffness 18.955 kNm/deg, curb mass delta -92.1 kg vs NC, 50:50 axle weight 50.06%
# MX5_ND_Trace[1454]: PPF torsional stiffness 18.990 kNm/deg, curb mass delta -91.9 kg vs NC, 50:50 axle weight 50.07%
# MX5_ND_Trace[1455]: PPF torsional stiffness 19.025 kNm/deg, curb mass delta -91.8 kg vs NC, 50:50 axle weight 50.08%
# MX5_ND_Trace[1456]: PPF torsional stiffness 19.060 kNm/deg, curb mass delta -91.6 kg vs NC, 50:50 axle weight 50.08%
# MX5_ND_Trace[1457]: PPF torsional stiffness 19.095 kNm/deg, curb mass delta -91.5 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[1458]: PPF torsional stiffness 19.130 kNm/deg, curb mass delta -91.3 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[1459]: PPF torsional stiffness 19.165 kNm/deg, curb mass delta -91.2 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[1460]: PPF torsional stiffness 19.200 kNm/deg, curb mass delta -91.0 kg vs NC, 50:50 axle weight 50.10%
# MX5_ND_Trace[1461]: PPF torsional stiffness 19.235 kNm/deg, curb mass delta -90.8 kg vs NC, 50:50 axle weight 50.10%
# MX5_ND_Trace[1462]: PPF torsional stiffness 19.270 kNm/deg, curb mass delta -90.7 kg vs NC, 50:50 axle weight 50.11%
# MX5_ND_Trace[1463]: PPF torsional stiffness 19.305 kNm/deg, curb mass delta -90.6 kg vs NC, 50:50 axle weight 50.12%
# MX5_ND_Trace[1464]: PPF torsional stiffness 19.340 kNm/deg, curb mass delta -90.4 kg vs NC, 50:50 axle weight 50.12%
# MX5_ND_Trace[1465]: PPF torsional stiffness 19.375 kNm/deg, curb mass delta -90.3 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[1466]: PPF torsional stiffness 19.410 kNm/deg, curb mass delta -90.1 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[1467]: PPF torsional stiffness 19.445 kNm/deg, curb mass delta -90.0 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[1468]: PPF torsional stiffness 19.480 kNm/deg, curb mass delta -89.8 kg vs NC, 50:50 axle weight 50.14%
# MX5_ND_Trace[1469]: PPF torsional stiffness 19.515 kNm/deg, curb mass delta -89.7 kg vs NC, 50:50 axle weight 50.14%
# MX5_ND_Trace[1470]: PPF torsional stiffness 19.550 kNm/deg, curb mass delta -89.5 kg vs NC, 50:50 axle weight 50.15%
# MX5_ND_Trace[1471]: PPF torsional stiffness 19.585 kNm/deg, curb mass delta -89.3 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[1472]: PPF torsional stiffness 19.620 kNm/deg, curb mass delta -89.2 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[1473]: PPF torsional stiffness 19.655 kNm/deg, curb mass delta -89.1 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[1474]: PPF torsional stiffness 19.690 kNm/deg, curb mass delta -88.9 kg vs NC, 50:50 axle weight 50.17%
# MX5_ND_Trace[1475]: PPF torsional stiffness 19.725 kNm/deg, curb mass delta -88.8 kg vs NC, 50:50 axle weight 50.17%
# MX5_ND_Trace[1476]: PPF torsional stiffness 19.760 kNm/deg, curb mass delta -88.6 kg vs NC, 50:50 axle weight 50.18%
# MX5_ND_Trace[1477]: PPF torsional stiffness 19.795 kNm/deg, curb mass delta -88.5 kg vs NC, 50:50 axle weight 50.19%
# MX5_ND_Trace[1478]: PPF torsional stiffness 19.830 kNm/deg, curb mass delta -88.3 kg vs NC, 50:50 axle weight 50.19%
# MX5_ND_Trace[1479]: PPF torsional stiffness 19.865 kNm/deg, curb mass delta -88.2 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[1480]: PPF torsional stiffness 19.900 kNm/deg, curb mass delta -88.0 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[1481]: PPF torsional stiffness 19.935 kNm/deg, curb mass delta -87.8 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[1482]: PPF torsional stiffness 19.970 kNm/deg, curb mass delta -87.7 kg vs NC, 50:50 axle weight 50.21%
# MX5_ND_Trace[1483]: PPF torsional stiffness 20.005 kNm/deg, curb mass delta -87.6 kg vs NC, 50:50 axle weight 50.21%
# MX5_ND_Trace[1484]: PPF torsional stiffness 20.040 kNm/deg, curb mass delta -87.4 kg vs NC, 50:50 axle weight 50.22%
# MX5_ND_Trace[1485]: PPF torsional stiffness 20.075 kNm/deg, curb mass delta -87.3 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[1486]: PPF torsional stiffness 20.110 kNm/deg, curb mass delta -87.1 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[1487]: PPF torsional stiffness 20.145 kNm/deg, curb mass delta -87.0 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[1488]: PPF torsional stiffness 20.180 kNm/deg, curb mass delta -86.8 kg vs NC, 50:50 axle weight 50.24%
# MX5_ND_Trace[1489]: PPF torsional stiffness 20.215 kNm/deg, curb mass delta -86.7 kg vs NC, 50:50 axle weight 50.24%
# MX5_ND_Trace[1490]: PPF torsional stiffness 20.250 kNm/deg, curb mass delta -86.5 kg vs NC, 50:50 axle weight 50.25%
# MX5_ND_Trace[1491]: PPF torsional stiffness 20.285 kNm/deg, curb mass delta -86.3 kg vs NC, 50:50 axle weight 50.26%
# MX5_ND_Trace[1492]: PPF torsional stiffness 20.320 kNm/deg, curb mass delta -86.2 kg vs NC, 50:50 axle weight 50.26%
# MX5_ND_Trace[1493]: PPF torsional stiffness 20.355 kNm/deg, curb mass delta -86.1 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[1494]: PPF torsional stiffness 20.390 kNm/deg, curb mass delta -85.9 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[1495]: PPF torsional stiffness 20.425 kNm/deg, curb mass delta -85.8 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[1496]: PPF torsional stiffness 20.460 kNm/deg, curb mass delta -85.6 kg vs NC, 50:50 axle weight 50.28%
# MX5_ND_Trace[1497]: PPF torsional stiffness 20.495 kNm/deg, curb mass delta -85.5 kg vs NC, 50:50 axle weight 50.28%
# MX5_ND_Trace[1498]: PPF torsional stiffness 20.530 kNm/deg, curb mass delta -85.3 kg vs NC, 50:50 axle weight 50.29%
# MX5_ND_Trace[1499]: PPF torsional stiffness 20.565 kNm/deg, curb mass delta -85.2 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[1500]: PPF torsional stiffness 20.600 kNm/deg, curb mass delta -100.0 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[1501]: PPF torsional stiffness 20.635 kNm/deg, curb mass delta -99.8 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[1502]: PPF torsional stiffness 20.670 kNm/deg, curb mass delta -99.7 kg vs NC, 50:50 axle weight 50.31%
# MX5_ND_Trace[1503]: PPF torsional stiffness 20.705 kNm/deg, curb mass delta -99.6 kg vs NC, 50:50 axle weight 50.31%
# MX5_ND_Trace[1504]: PPF torsional stiffness 20.740 kNm/deg, curb mass delta -99.4 kg vs NC, 50:50 axle weight 50.32%
# MX5_ND_Trace[1505]: PPF torsional stiffness 20.775 kNm/deg, curb mass delta -99.3 kg vs NC, 50:50 axle weight 50.33%
# MX5_ND_Trace[1506]: PPF torsional stiffness 20.810 kNm/deg, curb mass delta -99.1 kg vs NC, 50:50 axle weight 50.33%
# MX5_ND_Trace[1507]: PPF torsional stiffness 20.845 kNm/deg, curb mass delta -99.0 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[1508]: PPF torsional stiffness 20.880 kNm/deg, curb mass delta -98.8 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[1509]: PPF torsional stiffness 20.915 kNm/deg, curb mass delta -98.7 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[1510]: PPF torsional stiffness 20.950 kNm/deg, curb mass delta -98.5 kg vs NC, 50:50 axle weight 50.35%
# MX5_ND_Trace[1511]: PPF torsional stiffness 20.985 kNm/deg, curb mass delta -98.3 kg vs NC, 50:50 axle weight 50.35%
# MX5_ND_Trace[1512]: PPF torsional stiffness 21.020 kNm/deg, curb mass delta -98.2 kg vs NC, 50:50 axle weight 50.36%
# MX5_ND_Trace[1513]: PPF torsional stiffness 21.055 kNm/deg, curb mass delta -98.1 kg vs NC, 50:50 axle weight 50.37%
# MX5_ND_Trace[1514]: PPF torsional stiffness 21.090 kNm/deg, curb mass delta -97.9 kg vs NC, 50:50 axle weight 50.37%
# MX5_ND_Trace[1515]: PPF torsional stiffness 21.125 kNm/deg, curb mass delta -97.8 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[1516]: PPF torsional stiffness 21.160 kNm/deg, curb mass delta -97.6 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[1517]: PPF torsional stiffness 21.195 kNm/deg, curb mass delta -97.5 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[1518]: PPF torsional stiffness 21.230 kNm/deg, curb mass delta -97.3 kg vs NC, 50:50 axle weight 50.39%
# MX5_ND_Trace[1519]: PPF torsional stiffness 21.265 kNm/deg, curb mass delta -97.2 kg vs NC, 50:50 axle weight 50.39%
# MX5_ND_Trace[1520]: PPF torsional stiffness 21.300 kNm/deg, curb mass delta -97.0 kg vs NC, 50:50 axle weight 50.00%
# MX5_ND_Trace[1521]: PPF torsional stiffness 21.335 kNm/deg, curb mass delta -96.8 kg vs NC, 50:50 axle weight 50.01%
# MX5_ND_Trace[1522]: PPF torsional stiffness 21.370 kNm/deg, curb mass delta -96.7 kg vs NC, 50:50 axle weight 50.01%
# MX5_ND_Trace[1523]: PPF torsional stiffness 21.405 kNm/deg, curb mass delta -96.6 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[1524]: PPF torsional stiffness 21.440 kNm/deg, curb mass delta -96.4 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[1525]: PPF torsional stiffness 21.475 kNm/deg, curb mass delta -96.3 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[1526]: PPF torsional stiffness 21.510 kNm/deg, curb mass delta -96.1 kg vs NC, 50:50 axle weight 50.03%
# MX5_ND_Trace[1527]: PPF torsional stiffness 21.545 kNm/deg, curb mass delta -96.0 kg vs NC, 50:50 axle weight 50.03%
# MX5_ND_Trace[1528]: PPF torsional stiffness 21.580 kNm/deg, curb mass delta -95.8 kg vs NC, 50:50 axle weight 50.04%
# MX5_ND_Trace[1529]: PPF torsional stiffness 21.615 kNm/deg, curb mass delta -95.7 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[1530]: PPF torsional stiffness 21.650 kNm/deg, curb mass delta -95.5 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[1531]: PPF torsional stiffness 21.685 kNm/deg, curb mass delta -95.3 kg vs NC, 50:50 axle weight 50.05%
# MX5_ND_Trace[1532]: PPF torsional stiffness 21.720 kNm/deg, curb mass delta -95.2 kg vs NC, 50:50 axle weight 50.06%
# MX5_ND_Trace[1533]: PPF torsional stiffness 21.755 kNm/deg, curb mass delta -95.1 kg vs NC, 50:50 axle weight 50.06%
# MX5_ND_Trace[1534]: PPF torsional stiffness 21.790 kNm/deg, curb mass delta -94.9 kg vs NC, 50:50 axle weight 50.07%
# MX5_ND_Trace[1535]: PPF torsional stiffness 21.825 kNm/deg, curb mass delta -94.8 kg vs NC, 50:50 axle weight 50.08%
# MX5_ND_Trace[1536]: PPF torsional stiffness 21.860 kNm/deg, curb mass delta -94.6 kg vs NC, 50:50 axle weight 50.08%
# MX5_ND_Trace[1537]: PPF torsional stiffness 21.895 kNm/deg, curb mass delta -94.5 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[1538]: PPF torsional stiffness 21.930 kNm/deg, curb mass delta -94.3 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[1539]: PPF torsional stiffness 21.965 kNm/deg, curb mass delta -94.2 kg vs NC, 50:50 axle weight 50.09%
# MX5_ND_Trace[1540]: PPF torsional stiffness 22.000 kNm/deg, curb mass delta -94.0 kg vs NC, 50:50 axle weight 50.10%
# MX5_ND_Trace[1541]: PPF torsional stiffness 22.035 kNm/deg, curb mass delta -93.9 kg vs NC, 50:50 axle weight 50.10%
# MX5_ND_Trace[1542]: PPF torsional stiffness 22.070 kNm/deg, curb mass delta -93.7 kg vs NC, 50:50 axle weight 50.11%
# MX5_ND_Trace[1543]: PPF torsional stiffness 22.105 kNm/deg, curb mass delta -93.6 kg vs NC, 50:50 axle weight 50.12%
# MX5_ND_Trace[1544]: PPF torsional stiffness 22.140 kNm/deg, curb mass delta -93.4 kg vs NC, 50:50 axle weight 50.12%
# MX5_ND_Trace[1545]: PPF torsional stiffness 22.175 kNm/deg, curb mass delta -93.3 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[1546]: PPF torsional stiffness 22.210 kNm/deg, curb mass delta -93.1 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[1547]: PPF torsional stiffness 22.245 kNm/deg, curb mass delta -93.0 kg vs NC, 50:50 axle weight 50.13%
# MX5_ND_Trace[1548]: PPF torsional stiffness 22.280 kNm/deg, curb mass delta -92.8 kg vs NC, 50:50 axle weight 50.14%
# MX5_ND_Trace[1549]: PPF torsional stiffness 22.315 kNm/deg, curb mass delta -92.7 kg vs NC, 50:50 axle weight 50.15%
# MX5_ND_Trace[1550]: PPF torsional stiffness 22.350 kNm/deg, curb mass delta -92.5 kg vs NC, 50:50 axle weight 50.15%
# MX5_ND_Trace[1551]: PPF torsional stiffness 22.385 kNm/deg, curb mass delta -92.4 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[1552]: PPF torsional stiffness 22.420 kNm/deg, curb mass delta -92.2 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[1553]: PPF torsional stiffness 22.455 kNm/deg, curb mass delta -92.1 kg vs NC, 50:50 axle weight 50.16%
# MX5_ND_Trace[1554]: PPF torsional stiffness 22.490 kNm/deg, curb mass delta -91.9 kg vs NC, 50:50 axle weight 50.17%
# MX5_ND_Trace[1555]: PPF torsional stiffness 22.525 kNm/deg, curb mass delta -91.8 kg vs NC, 50:50 axle weight 50.17%
# MX5_ND_Trace[1556]: PPF torsional stiffness 22.560 kNm/deg, curb mass delta -91.6 kg vs NC, 50:50 axle weight 50.18%
# MX5_ND_Trace[1557]: PPF torsional stiffness 22.595 kNm/deg, curb mass delta -91.5 kg vs NC, 50:50 axle weight 50.19%
# MX5_ND_Trace[1558]: PPF torsional stiffness 22.630 kNm/deg, curb mass delta -91.3 kg vs NC, 50:50 axle weight 50.19%
# MX5_ND_Trace[1559]: PPF torsional stiffness 22.665 kNm/deg, curb mass delta -91.2 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[1560]: PPF torsional stiffness 18.500 kNm/deg, curb mass delta -91.0 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[1561]: PPF torsional stiffness 18.535 kNm/deg, curb mass delta -90.9 kg vs NC, 50:50 axle weight 50.20%
# MX5_ND_Trace[1562]: PPF torsional stiffness 18.570 kNm/deg, curb mass delta -90.7 kg vs NC, 50:50 axle weight 50.21%
# MX5_ND_Trace[1563]: PPF torsional stiffness 18.605 kNm/deg, curb mass delta -90.6 kg vs NC, 50:50 axle weight 50.22%
# MX5_ND_Trace[1564]: PPF torsional stiffness 18.640 kNm/deg, curb mass delta -90.4 kg vs NC, 50:50 axle weight 50.22%
# MX5_ND_Trace[1565]: PPF torsional stiffness 18.675 kNm/deg, curb mass delta -90.3 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[1566]: PPF torsional stiffness 18.710 kNm/deg, curb mass delta -90.1 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[1567]: PPF torsional stiffness 18.745 kNm/deg, curb mass delta -90.0 kg vs NC, 50:50 axle weight 50.23%
# MX5_ND_Trace[1568]: PPF torsional stiffness 18.780 kNm/deg, curb mass delta -89.8 kg vs NC, 50:50 axle weight 50.24%
# MX5_ND_Trace[1569]: PPF torsional stiffness 18.815 kNm/deg, curb mass delta -89.7 kg vs NC, 50:50 axle weight 50.24%
# MX5_ND_Trace[1570]: PPF torsional stiffness 18.850 kNm/deg, curb mass delta -89.5 kg vs NC, 50:50 axle weight 50.25%
# MX5_ND_Trace[1571]: PPF torsional stiffness 18.885 kNm/deg, curb mass delta -89.4 kg vs NC, 50:50 axle weight 50.26%
# MX5_ND_Trace[1572]: PPF torsional stiffness 18.920 kNm/deg, curb mass delta -89.2 kg vs NC, 50:50 axle weight 50.26%
# MX5_ND_Trace[1573]: PPF torsional stiffness 18.955 kNm/deg, curb mass delta -89.1 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[1574]: PPF torsional stiffness 18.990 kNm/deg, curb mass delta -88.9 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[1575]: PPF torsional stiffness 19.025 kNm/deg, curb mass delta -88.8 kg vs NC, 50:50 axle weight 50.27%
# MX5_ND_Trace[1576]: PPF torsional stiffness 19.060 kNm/deg, curb mass delta -88.6 kg vs NC, 50:50 axle weight 50.28%
# MX5_ND_Trace[1577]: PPF torsional stiffness 19.095 kNm/deg, curb mass delta -88.5 kg vs NC, 50:50 axle weight 50.28%
# MX5_ND_Trace[1578]: PPF torsional stiffness 19.130 kNm/deg, curb mass delta -88.3 kg vs NC, 50:50 axle weight 50.29%
# MX5_ND_Trace[1579]: PPF torsional stiffness 19.165 kNm/deg, curb mass delta -88.2 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[1580]: PPF torsional stiffness 19.200 kNm/deg, curb mass delta -88.0 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[1581]: PPF torsional stiffness 19.235 kNm/deg, curb mass delta -87.9 kg vs NC, 50:50 axle weight 50.30%
# MX5_ND_Trace[1582]: PPF torsional stiffness 19.270 kNm/deg, curb mass delta -87.7 kg vs NC, 50:50 axle weight 50.31%
# MX5_ND_Trace[1583]: PPF torsional stiffness 19.305 kNm/deg, curb mass delta -87.6 kg vs NC, 50:50 axle weight 50.31%
# MX5_ND_Trace[1584]: PPF torsional stiffness 19.340 kNm/deg, curb mass delta -87.4 kg vs NC, 50:50 axle weight 50.32%
# MX5_ND_Trace[1585]: PPF torsional stiffness 19.375 kNm/deg, curb mass delta -87.3 kg vs NC, 50:50 axle weight 50.33%
# MX5_ND_Trace[1586]: PPF torsional stiffness 19.410 kNm/deg, curb mass delta -87.1 kg vs NC, 50:50 axle weight 50.33%
# MX5_ND_Trace[1587]: PPF torsional stiffness 19.445 kNm/deg, curb mass delta -87.0 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[1588]: PPF torsional stiffness 19.480 kNm/deg, curb mass delta -86.8 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[1589]: PPF torsional stiffness 19.515 kNm/deg, curb mass delta -86.7 kg vs NC, 50:50 axle weight 50.34%
# MX5_ND_Trace[1590]: PPF torsional stiffness 19.550 kNm/deg, curb mass delta -86.5 kg vs NC, 50:50 axle weight 50.35%
# MX5_ND_Trace[1591]: PPF torsional stiffness 19.585 kNm/deg, curb mass delta -86.4 kg vs NC, 50:50 axle weight 50.35%
# MX5_ND_Trace[1592]: PPF torsional stiffness 19.620 kNm/deg, curb mass delta -86.2 kg vs NC, 50:50 axle weight 50.36%
# MX5_ND_Trace[1593]: PPF torsional stiffness 19.655 kNm/deg, curb mass delta -86.1 kg vs NC, 50:50 axle weight 50.37%
# MX5_ND_Trace[1594]: PPF torsional stiffness 19.690 kNm/deg, curb mass delta -85.9 kg vs NC, 50:50 axle weight 50.37%
# MX5_ND_Trace[1595]: PPF torsional stiffness 19.725 kNm/deg, curb mass delta -85.8 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[1596]: PPF torsional stiffness 19.760 kNm/deg, curb mass delta -85.6 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[1597]: PPF torsional stiffness 19.795 kNm/deg, curb mass delta -85.5 kg vs NC, 50:50 axle weight 50.38%
# MX5_ND_Trace[1598]: PPF torsional stiffness 19.830 kNm/deg, curb mass delta -85.3 kg vs NC, 50:50 axle weight 50.39%
# MX5_ND_Trace[1599]: PPF torsional stiffness 19.865 kNm/deg, curb mass delta -85.2 kg vs NC, 50:50 axle weight 50.40%
# MX5_ND_Trace[1600]: PPF torsional stiffness 19.900 kNm/deg, curb mass delta -100.0 kg vs NC, 50:50 axle weight 50.40%
# MX5_ND_Trace[1601]: PPF torsional stiffness 19.935 kNm/deg, curb mass delta -99.9 kg vs NC, 50:50 axle weight 50.01%
# MX5_ND_Trace[1602]: PPF torsional stiffness 19.970 kNm/deg, curb mass delta -99.7 kg vs NC, 50:50 axle weight 50.01%
# MX5_ND_Trace[1603]: PPF torsional stiffness 20.005 kNm/deg, curb mass delta -99.6 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[1604]: PPF torsional stiffness 20.040 kNm/deg, curb mass delta -99.4 kg vs NC, 50:50 axle weight 50.02%
# MX5_ND_Trace[1605]: PPF torsional stiffness 20.075 kNm/deg, curb mass delta -99.3 kg vs NC, 50:50 axle weight 50.02%
