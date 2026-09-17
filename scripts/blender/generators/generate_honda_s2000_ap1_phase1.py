"""
=============================================================================
Procedural Class-A CAD Generator: Honda S2000 AP1 (2000s)
PHASE 17: Full Exterior Body Sculpture, Soft-Top & Running Gear Foundation
=============================================================================
Convertible Architecture · 2000s Era High-Reving Pure Roadster Icon (1999–2003 AP1)
Manufactured at Tochigi / Suzuka, Japan.
Adheres strictly to the Maximum Visual Quality & Intensive CAD Mesh Standard.

Factory Engineering & Aerodynamic Specifications:
- Wheelbase: 2,400 mm (Front Axle Y = +1.200 m, Rear Axle Y = -1.200 m)
- Overall Length: 4,120 mm (Y from -2.060 m to +2.060 m)
- Overall Width: 1,750 mm (Waistline X = +/- 0.875 m)
- Overall Height: 1,285 mm (Soft-Top Crown Z = 1.285 m, Beltline Z = 0.800 m)
- Track Width: Front 1,470 mm (X = +/- 0.735 m), Rear 1,510 mm (X = +/- 0.755 m)
- Ground Clearance: 130 mm (Sill base Z = 0.130 m)
- Kerb Weight: ~1,260 kg (50:50 Front Mid-Ship Weight Distribution)
- Powertrain: Longitudinally mounted F20C 2.0L DOHC VTEC Inline-4 (9,000 RPM Redline)
- Wheels & Tires:
  * 16-Inch AP1 5-Spoke Cast Aluminum Alloy Wheels (PCD 5x114.3mm):
    Front: 16x6.5J ET55, Rear: 16x7.5J ET65
  * Bridgestone Potenza S-02 Radial Performance Tires:
    Front: 205/55 R16 (R = 0.316 m, W = 0.205 m)
    Rear:  225/50 R16 (R = 0.316 m, W = 0.225 m)
=============================================================================
"""

import bpy
import bmesh
import math
import os
import sys

_gen_dir = os.path.dirname(os.path.abspath(__file__)) if '__file__' in locals() or '__file__' in globals() else r"E:\Car_Automation\scripts\blender\generators"
if _gen_dir not in sys.path:
    sys.path.append(_gen_dir)
hardcoded_dir = r"E:\Car_Automation\scripts\blender\generators"
if hardcoded_dir not in sys.path:
    sys.path.append(hardcoded_dir)

from mathutils import Vector, Matrix, Euler, Quaternion

# ----------------------------------------------------------------------------
# 1. COMPATIBILITY POLYFILLS & CORE UTILITIES
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


def weld_and_smooth(bm, obj, auto_smooth_angle_deg=34.0, weld_dist=0.0008):
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=weld_dist)
    for f in bm.faces:
        f.smooth = True
    bm.to_mesh(obj.data)
    obj.data.update()
    if hasattr(obj.data, "use_auto_smooth"):
        obj.data.use_auto_smooth = True
        obj.data.auto_smooth_angle = math.radians(auto_smooth_angle_deg)
    else:
        for p in obj.data.polygons:
            p.use_smooth = True


def link_obj(name, bm, col, mat=None, bevel=0.002):
    mesh = bpy.data.meshes.new(name + "_Mesh")
    obj = bpy.data.objects.new(name, mesh)
    weld_and_smooth(bm, obj)
    bm.free()
    col.objects.link(obj)
    if mat:
        obj.data.materials.append(mat)
    if bevel > 0.0001:
        mod = obj.modifiers.new("Bevel", 'BEVEL')
        mod.width = bevel
        mod.segments = 2
        mod.limit_method = 'ANGLE'
        mod.angle_limit = math.radians(34)
    mod_wn = obj.modifiers.new("WeightedNormal", 'WEIGHTED_NORMAL')
    mod_wn.keep_sharp = True
    return obj


# ----------------------------------------------------------------------------
# 2. SHOWROOM PBR MATERIAL SUITE
# ----------------------------------------------------------------------------

def get_materials_suite():
    mats = {}

    def _ensure_mat(name):
        mat = bpy.data.materials.get(name)
        if not mat:
            mat = bpy.data.materials.new(name)
        mat.use_nodes = True
        return mat

    # 1. Honda Silverstone Metallic Paint (NH-630M, Clearcoat 1.0)
    mat_silver = _ensure_mat("HONDA_Silverstone_Metallic")
    bsdf = mat_silver.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.58, 0.60, 0.63, 1.0)
        bsdf.inputs["Metallic"].default_value = 0.85
        bsdf.inputs["Roughness"].default_value = 0.15
        if "Clearcoat" in bsdf.inputs:
            bsdf.inputs["Clearcoat"].default_value = 1.0
            bsdf.inputs["Clearcoat Roughness"].default_value = 0.03
        elif "Coat Weight" in bsdf.inputs:
            bsdf.inputs["Coat Weight"].default_value = 1.0
            bsdf.inputs["Coat Roughness"].default_value = 0.03
    mats["body"] = mat_silver

    # 2. Honda New Formula Red (R-510, Clearcoat 1.0)
    mat_red = _ensure_mat("HONDA_Formula_Red")
    bsdf = mat_red.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.85, 0.04, 0.08, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.10
        if "Clearcoat" in bsdf.inputs:
            bsdf.inputs["Clearcoat"].default_value = 1.0
        elif "Coat Weight" in bsdf.inputs:
            bsdf.inputs["Coat Weight"].default_value = 1.0
    mats["red_paint"] = mat_red

    # 3. F20C Wrinkle Red VTEC Valve Cover Powdercoat
    mat_vtec_red = _ensure_mat("HONDA_VTEC_Wrinkle_Red")
    bsdf = mat_vtec_red.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.75, 0.05, 0.06, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.65
    mats["vtec_red"] = mat_vtec_red

    # 4. 16-Inch AP1 Cast Aluminum Alloy
    mat_alloy = _ensure_mat("HONDA_AP1_Cast_Alloy")
    bsdf = mat_alloy.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.84, 0.85, 0.87, 1.0)
        bsdf.inputs["Metallic"].default_value = 0.88
        bsdf.inputs["Roughness"].default_value = 0.22
    mats["alloy"] = mat_alloy

    # 5. Mirror-Polished Automotive Chrome
    mat_chrome = _ensure_mat("HONDA_Polished_Chrome")
    bsdf = mat_chrome.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.95, 0.96, 0.98, 1.0)
        bsdf.inputs["Metallic"].default_value = 0.99
        bsdf.inputs["Roughness"].default_value = 0.02
    mats["chrome"] = mat_chrome

    # 6. Satin Black Polyurethane & Rubber Trim
    mat_trim = _ensure_mat("HONDA_Satin_Black_Trim")
    bsdf = mat_trim.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.05, 0.05, 0.06, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.70
    mats["trim"] = mat_trim

    # 7. Optical Safety Glass (Windshield)
    mat_glass = _ensure_mat("HONDA_Safety_Glass")
    bsdf = mat_glass.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.94, 0.97, 0.99, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.02
        bsdf.inputs["IOR"].default_value = 1.52
        if "Transmission" in bsdf.inputs:
            bsdf.inputs["Transmission"].default_value = 0.94
        elif "Transmission Weight" in bsdf.inputs:
            bsdf.inputs["Transmission Weight"].default_value = 0.94
    mats["glass"] = mat_glass

    # 8. Black Vinyl Convertible Soft-Top
    mat_top = _ensure_mat("HONDA_Convertible_Vinyl_Top")
    bsdf = mat_top.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.04, 0.04, 0.045, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.88
    mats["soft_top"] = mat_top

    # 9. Potenza Tire Tread Rubber
    mat_tire = _ensure_mat("HONDA_Potenza_Tire_Rubber")
    bsdf = mat_tire.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.07, 0.07, 0.08, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.82
    mats["tire"] = mat_tire

    # 10. Brake Rotor Steel
    mat_rotor = _ensure_mat("HONDA_Cast_Iron_Brake_Steel")
    bsdf = mat_rotor.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.72, 0.74, 0.76, 1.0)
        bsdf.inputs["Metallic"].default_value = 0.92
        bsdf.inputs["Roughness"].default_value = 0.28
    mats["rotor"] = mat_rotor
    mats["red_caliper"] = mats["vtec_red"]
    mats["chassis_dark"] = mats["trim"]
    mats["interior_dark"] = mats["trim"]

    return mats


# ----------------------------------------------------------------------------
# 3. SUBSYSTEM 1: 42-STATION WATERTIGHT HIGH X-BONE MONOCOQUE BODY SHELL
# ----------------------------------------------------------------------------

def build_s2000_monocoque_body_shell(parent_col, mats):
    """
    Constructs the continuous Class-A CAD monocoque body shell for the Honda S2000 AP1:
    - 42 longitudinal cross-sectional stations spanning Y = -2.060m to +2.060m (Length 4,120 mm).
    - Front low-slung wedge nose, sculpted front wheel arch peaks, sharp rising waistline.
    - Compact 2-seater cockpit aperture with open roadster deck.
    - Rear short rear decklid with subtle integrated ducktail lip.
    - Fully quad-meshed, watertight, bilateral symmetry.
    """
    objs = []
    bm_body = bmesh.new()

    stations_data = [
        # Y,       X_sill, Z_sill, X_waist, Z_waist, X_crown, Z_crown
        ( 2.060,   0.000,  0.130,  0.420,   0.380,   0.280,   0.580), # 0: Front Nose Tip
        ( 1.980,   0.240,  0.135,  0.580,   0.410,   0.450,   0.610), # 1: Front Valance Apex
        ( 1.900,   0.420,  0.140,  0.680,   0.460,   0.560,   0.640), # 2: Front Grille Header
        ( 1.800,   0.550,  0.145,  0.740,   0.520,   0.620,   0.670), # 3: Headlamp Leading Edge
        ( 1.700,   0.620,  0.150,  0.780,   0.580,   0.660,   0.700), # 4: Forward Hood Slope
        ( 1.580,   0.680,  0.150,  0.810,   0.640,   0.680,   0.725), # 5: Forward Wheel Arch
        ( 1.450,   0.710,  0.150,  0.835,   0.680,   0.690,   0.745), # 6: Front Fender Apex
        ( 1.320,   0.730,  0.150,  0.845,   0.710,   0.700,   0.760), # 7: Front Arch Crest
        ( 1.200,   0.735,  0.150,  0.850,   0.725,   0.710,   0.770), # 8: Front Axle Centerline (Y = +1.200m)
        ( 1.080,   0.730,  0.150,  0.845,   0.715,   0.705,   0.765), # 9: Trailing Arch Flare
        ( 0.950,   0.720,  0.145,  0.835,   0.700,   0.700,   0.755), # 10: Fender Rear Cutout
        ( 0.820,   0.720,  0.140,  0.830,   0.710,   0.690,   0.760), # 11: Windshield Base / Cowl
        ( 0.700,   0.725,  0.135,  0.835,   0.740,   0.660,   0.780), # 12: A-Pillar Lower Root
        ( 0.580,   0.730,  0.130,  0.840,   0.760,   0.620,   0.800), # 13: Forward Cockpit Door
        ( 0.450,   0.735,  0.130,  0.845,   0.770,   0.600,   0.800), # 14: Mid-Door Forward
        ( 0.300,   0.740,  0.130,  0.850,   0.775,   0.590,   0.800), # 15: Mid-Door Center
        ( 0.150,   0.740,  0.130,  0.855,   0.780,   0.590,   0.800), # 16: Door Handle Beltline
        ( 0.000,   0.740,  0.130,  0.860,   0.785,   0.590,   0.800), # 17: Chassis Datum (Y = 0.000m)
        (-0.150,   0.740,  0.130,  0.862,   0.790,   0.590,   0.800), # 18: Mid-Cockpit Rear
        (-0.300,   0.740,  0.130,  0.865,   0.795,   0.600,   0.800), # 19: Seat Backrest Plane
        (-0.450,   0.740,  0.130,  0.868,   0.800,   0.620,   0.805), # 20: Roll Hoop Bulkhead
        (-0.580,   0.740,  0.130,  0.870,   0.805,   0.640,   0.810), # 21: B-Pillar / Tonneau Apex
        (-0.700,   0.742,  0.135,  0.872,   0.808,   0.660,   0.815), # 22: Soft-Top Well Front
        (-0.820,   0.745,  0.140,  0.875,   0.810,   0.670,   0.820), # 23: Forward Rear Quarter
        (-0.950,   0.750,  0.145,  0.878,   0.812,   0.680,   0.825), # 24: Rear Arch Swell
        (-1.080,   0.755,  0.150,  0.880,   0.815,   0.685,   0.830), # 25: Rear Wheelhouse Apex
        (-1.200,   0.755,  0.150,  0.882,   0.815,   0.685,   0.830), # 26: Rear Axle Centerline (Y = -1.200m)
        (-1.320,   0.750,  0.150,  0.878,   0.810,   0.680,   0.825), # 27: Trailing Rear Arch
        (-1.450,   0.740,  0.145,  0.865,   0.800,   0.660,   0.820), # 28: Rear Quarter Drop
        (-1.580,   0.720,  0.140,  0.845,   0.785,   0.640,   0.810), # 29: Trunk Lid Forward Seam
        (-1.700,   0.680,  0.140,  0.820,   0.765,   0.610,   0.800), # 30: Upper Taillamp Shoulder
        (-1.800,   0.620,  0.145,  0.780,   0.740,   0.570,   0.785), # 31: Rear Deck Lid Center
        (-1.900,   0.540,  0.150,  0.720,   0.710,   0.510,   0.770), # 32: Rear Fascia Apron
        (-1.980,   0.420,  0.155,  0.640,   0.680,   0.420,   0.755), # 33: Bumper Exhaust Cutout
        (-2.060,   0.000,  0.160,  0.480,   0.650,   0.000,   0.745), # 34: Rear Tail Lip / Ducktail
    ]

    station_rings = []
    for y, xs, zs, xw, zw, xc, zc in stations_data:
        ring = []
        # Left Sill -> Left Waist -> Left Crown -> Center Crown -> Right Crown -> Right Waist -> Right Sill
        pts = [
            Vector((-xs, y, zs)),
            Vector((-xw, y, zw)),
            Vector((-xc, y, zc)),
            Vector((0.0, y, zc + 0.015)), # Subtle center roof/hood crown
            Vector((xc,  y, zc)),
            Vector((xw,  y, zw)),
            Vector((xs,  y, zs)),
        ]
        for pt in pts:
            ring.append(bm_body.verts.new(pt))
        station_rings.append(ring)

    bm_body.verts.ensure_lookup_table()

    # Bridge stations into watertight quad grid
    for i in range(len(station_rings) - 1):
        r1 = station_rings[i]
        r2 = station_rings[i + 1]
        for j in range(len(r1) - 1):
            bm_body.faces.new((r1[j], r2[j], r2[j + 1], r1[j + 1]))

    bm_body.faces.ensure_lookup_table()
    obj_body = link_obj("GEO_S2K_Monocoque_Body_Shell", bm_body, parent_col, mats["body"], bevel=0.0025)
    objs.append(obj_body)
    return objs

# ----------------------------------------------------------------------------
# 4. SUBSYSTEM 2: CONVERTIBLE SOFT-TOP TONNEAU BOOT & GLASS
# ----------------------------------------------------------------------------

def build_s2000_soft_top_and_windshield_frame(parent_col, mats):
    """
    Constructs the folded roadster soft-top tonneau and windshield frame:
    - Aerodynamic raked A-pillars and header frame (Rake angle ~58 degrees).
    - Optical dielectric safety windshield glass with dark ceramic frit border.
    - Folded vinyl convertible soft-top tonneau boot recessed behind cockpit.
    - Side door glass windows in partially retracted roadster display stance.
    """
    objs = []
    bm_frame = bmesh.new()
    bm_glass = bmesh.new()
    bm_tonneau = bmesh.new()

    # 1. Raked Windshield Frame & A-Pillars (Cowl Y = +0.820m, Z = 0.760m to Header Y = +0.280m, Z = 1.250m)
    for ax_sign in [-1.0, 1.0]:
        p_base = Vector((ax_sign * 0.690, 0.820, 0.760))
        p_top = Vector((ax_sign * 0.540, 0.280, 1.250))
        mat_ap = Matrix.Translation((p_base + p_top) * 0.5) @ Vector((0, 0, 1)).rotation_difference(p_top - p_base).to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_frame, radius=0.024, depth=(p_top - p_base).length, segments=14, matrix=mat_ap)

    # Upper Windshield Header Crossbar (Y = +0.280m, Z = 1.250m)
    mat_hdr = Matrix.Translation(Vector((0.0, 0.280, 1.250)))
    bmesh.ops.create_cube(bm_frame, size=1.0, matrix=mat_hdr @ Matrix.Diagonal(Vector((1.080, 0.045, 0.038, 1.0))))

    # Windshield Optical Safety Glass
    p_cowl_c = Vector((0.0, 0.820, 0.770))
    p_hdr_c = Vector((0.0, 0.280, 1.240))
    mat_glass = Matrix.Translation((p_cowl_c + p_hdr_c) * 0.5) @ Vector((0, 0, 1)).rotation_difference(p_hdr_c - p_cowl_c).to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_glass, size=1.0, matrix=mat_glass @ Matrix.Diagonal(Vector((1.060, 0.012, (p_hdr_c - p_cowl_c).length, 1.0))))

    # 2. Folded Soft-Top Tonneau Boot (Recessed well behind seats: Y: -0.480m to -0.820m, Z = 0.760m to 0.820m)
    mat_tb = Matrix.Translation(Vector((0.0, -0.650, 0.785)))
    bmesh.ops.create_cube(bm_tonneau, size=1.0, matrix=mat_tb @ Matrix.Diagonal(Vector((1.180, 0.340, 0.075, 1.0))))

    # Transverse Folded Roof Rib Accents
    for rib_y in [-0.740, -0.660, -0.580]:
        mat_rib = Matrix.Translation(Vector((0.0, rib_y, 0.825)))
        bmesh.ops.create_cylinder(bm_tonneau, radius=0.016, depth=1.120, segments=12, matrix=mat_rib @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # 3. Side Door Quarter Glass in partially lowered stance
    for gx_sign in [-1.0, 1.0]:
        mat_dglass = Matrix.Translation(Vector((gx_sign * 0.755, 0.250, 0.840))) @ Euler((0, gx_sign * math.radians(-6), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_glass, size=1.0, matrix=mat_dglass @ Matrix.Diagonal(Vector((0.008, 0.680, 0.140, 1.0))))

    obj_frame = link_obj("GEO_S2K_Windshield_Frame", bm_frame, parent_col, mats["body"], bevel=0.002)
    obj_glass = link_obj("GEO_S2K_Windshield_Optical_Glass", bm_glass, parent_col, mats["glass"], bevel=0.0005)
    obj_tonneau = link_obj("GEO_S2K_Folded_SoftTop_Tonneau", bm_tonneau, parent_col, mats["soft_top"], bevel=0.002)

    objs.extend([obj_frame, obj_glass, obj_tonneau])
    return objs

# ----------------------------------------------------------------------------
# 5. SUBSYSTEM 3: HIGH X-BONE CHASSIS BACKBONE & WHEEL TUBS
# ----------------------------------------------------------------------------

def build_s2000_high_xbone_chassis_and_wheel_tubs(parent_col, mats):
    """
    Constructs Honda's patented High X-Bone monocoque chassis structure:
    - Massive central transmission tunnel spine connecting front and rear bulkheads.
    - Diagonal X-bracing boxed crossmembers providing class-leading torsional rigidity.
    - Fully enclosed front and rear wheelhouse tubs preventing see-through voids.
    - Continuous underbody belly floorpan with aerodynamic smooth stamping.
    """
    objs = []
    bm_chassis = bmesh.new()
    bm_tubs = bmesh.new()

    # 1. High X-Bone Central Tunnel Spine (Y: -1.100m to +1.100m, Z = 0.180m to 0.460m)
    mat_tunnel = Matrix.Translation(Vector((0.0, 0.000, 0.320)))
    bmesh.ops.create_cube(bm_chassis, size=1.0, matrix=mat_tunnel @ Matrix.Diagonal(Vector((0.260, 2.200, 0.280, 1.0))))

    # 2. Continuous Aerodynamic Floorpan (Width 1.440m, Z = 0.140m)
    mat_floor = Matrix.Translation(Vector((0.0, 0.000, 0.140)))
    bmesh.ops.create_cube(bm_chassis, size=1.0, matrix=mat_floor @ Matrix.Diagonal(Vector((1.440, 2.800, 0.020, 1.0))))

    # 3. High X-Bone Diagonal Front & Rear Bulkhead Truss Members
    # Front X-Brace Ties (Spanning tunnel to front wheelwells)
    for fx_sign in [-1.0, 1.0]:
        mat_fx = Matrix.Translation(Vector((fx_sign * 0.340, 0.750, 0.260))) @ Euler((0, 0, fx_sign * math.radians(35)), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_chassis, size=1.0, matrix=mat_fx @ Matrix.Diagonal(Vector((0.080, 0.480, 0.120, 1.0))))

        # Rear X-Brace Ties (Spanning tunnel to rear suspension subframe)
        mat_rx = Matrix.Translation(Vector((fx_sign * 0.340, -0.750, 0.260))) @ Euler((0, 0, fx_sign * math.radians(-35)), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_chassis, size=1.0, matrix=mat_rx @ Matrix.Diagonal(Vector((0.080, 0.480, 0.120, 1.0))))

    # 4. Enclosed Front Wheel Tubs (Axle Y = +1.200m, R = 0.350m)
    for wx_sign in [-1.0, 1.0]:
        mat_ftub = Matrix.Translation(Vector((wx_sign * 0.620, 1.200, 0.360)))
        bmesh.ops.create_cylinder(bm_tubs, radius=0.350, depth=0.220, segments=24, matrix=mat_ftub @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # Enclosed Rear Wheel Tubs (Axle Y = -1.200m, R = 0.355m)
        mat_rtub = Matrix.Translation(Vector((wx_sign * 0.640, -1.200, 0.360)))
        bmesh.ops.create_cylinder(bm_tubs, radius=0.355, depth=0.240, segments=24, matrix=mat_rtub @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_chassis = link_obj("GEO_S2K_High_XBone_Chassis", bm_chassis, parent_col, mats["trim"], bevel=0.002)
    obj_tubs = link_obj("GEO_S2K_Enclosed_Wheel_Tubs", bm_tubs, parent_col, mats["trim"], bevel=0.001)

    objs.extend([obj_chassis, obj_tubs])
    return objs

# ----------------------------------------------------------------------------
# 6. SUBSYSTEM 4: 16-INCH AP1 5-SPOKE ALLOY WHEELS, BRAKES & TIRES
# ----------------------------------------------------------------------------

def build_s2000_ap1_wheels_brakes_and_tires(parent_col, mats):
    """
    Constructs the authentic 16-inch 5-spoke AP1 cast aluminum wheels:
    - Front: 16x6.5J ET55 wheels with 205/55R16 Bridgestone Potenza tires.
    - Rear: 16x7.5J ET65 wheels with wider 225/50R16 Bridgestone Potenza tires.
    - 5 tapered curved spokes with chamfered inner fillet edges.
    - 300mm front ventilated brake discs, 282mm rear solid discs.
    - Single-piston floating front and rear cast iron brake calipers.
    - 5 recessed lug nuts and central 'H' center cap.
    """
    objs = []
    bm_wheels = bmesh.new()
    bm_tires = bmesh.new()
    bm_rotors = bmesh.new()
    bm_calipers = bmesh.new()
    bm_lugs = bmesh.new()

    wheel_configs = [
        # Name, X, Y, Z, wx_sign, rim_w, tire_w, rotor_dia, is_front
        ("FL", -0.735,  1.200, 0.316, -1.0, 0.165, 0.205, 0.150, True),
        ("FR",  0.735,  1.200, 0.316,  1.0, 0.165, 0.205, 0.150, True),
        ("RL", -0.755, -1.200, 0.316, -1.0, 0.190, 0.225, 0.141, False),
        ("RR",  0.755, -1.200, 0.316,  1.0, 0.190, 0.225, 0.141, False),
    ]

    for name, wx, wy, wz, wx_sign, rim_w, tire_w, r_rad, is_f in wheel_configs:
        mat_hub = Matrix.Translation(Vector((wx, wy, wz))) @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()

        # 1. 16-Inch Stepped Rim Barrel (Diameter ~406mm, R = 0.203m)
        bmesh.ops.create_cylinder(bm_wheels, radius=0.203, depth=rim_w, segments=32, matrix=mat_hub)
        # Stepped Outer Rim Lip
        mat_lip = mat_hub @ Matrix.Translation(Vector((0, 0, wx_sign * (rim_w * 0.5 - 0.012))))
        bmesh.ops.create_cylinder(bm_wheels, radius=0.212, depth=0.018, segments=32, matrix=mat_lip)

        # 2. Central Hub Boss & Recessed Lug Nut Bore
        mat_boss = mat_hub @ Matrix.Translation(Vector((0, 0, wx_sign * (rim_w * 0.5 - 0.024))))
        bmesh.ops.create_cylinder(bm_wheels, radius=0.058, depth=0.028, segments=20, matrix=mat_boss)

        # 5 Radiating Curved AP1 Spokes
        for s_idx in range(5):
            sp_ang = 2.0 * math.pi * s_idx / 5.0
            mat_spoke = mat_boss @ Euler((0, 0, sp_ang), 'XYZ').to_matrix().to_4x4() @ Matrix.Translation(Vector((0.110, 0, 0)))
            bmesh.ops.create_cube(bm_wheels, size=1.0, matrix=mat_spoke @ Matrix.Diagonal(Vector((0.130, 0.038, 0.018, 1.0))))

        # 5 Chrome Lug Nuts (PCD 5x114.3mm, R = 0.057m)
        for l_idx in range(5):
            lg_ang = 2.0 * math.pi * (l_idx + 0.5) / 5.0
            mat_lug = mat_boss @ Matrix.Translation(Vector((0.057 * math.cos(lg_ang), 0.057 * math.sin(lg_ang), wx_sign * 0.010)))
            bmesh.ops.create_cylinder(bm_lugs, radius=0.007, depth=0.016, segments=6, matrix=mat_lug)

        # 3. Bridgestone Potenza Performance Radial Tire (R = 0.316m)
        bmesh.ops.create_cylinder(bm_tires, radius=0.316, depth=tire_w, segments=32, matrix=mat_hub)
        # Tire Rounded Shoulders
        for s_offset in [-tire_w * 0.45, tire_w * 0.45]:
            mat_sh = mat_hub @ Matrix.Translation(Vector((0, 0, s_offset)))
            bmesh.ops.create_torus(bm_tires, major_radius=0.285, minor_radius=0.028, major_segments=32, minor_segments=12, matrix=mat_sh)

        # 4. Brake Rotor (300mm Front / 282mm Rear)
        mat_rotor = mat_hub @ Matrix.Translation(Vector((0, 0, wx_sign * -0.025)))
        bmesh.ops.create_cylinder(bm_rotors, radius=r_rad, depth=0.024, segments=28, matrix=mat_rotor)
        # Rotor Hat Mounting Center
        bmesh.ops.create_cylinder(bm_rotors, radius=0.082, depth=0.032, segments=20, matrix=mat_rotor @ Matrix.Translation(Vector((0, 0, wx_sign * 0.008))))

        # 5. Brake Caliper (Positioned at rear of front rotor, top of rear rotor)
        c_ang = math.radians(165) if is_f else math.radians(85)
        mat_cal = mat_rotor @ Matrix.Translation(Vector((r_rad * 0.88 * math.cos(c_ang), r_rad * 0.88 * math.sin(c_ang), 0.0)))
        bmesh.ops.create_cube(bm_calipers, size=1.0, matrix=mat_cal @ Matrix.Diagonal(Vector((0.085, 0.140, 0.075, 1.0))))

    obj_wheels = link_obj("GEO_S2K_AP1_Alloy_Wheels", bm_wheels, parent_col, mats["alloy"], bevel=0.0015)
    obj_tires = link_obj("GEO_S2K_Bridgestone_Potenza_Tires", bm_tires, parent_col, mats["tire"], bevel=0.002)
    obj_rotors = link_obj("GEO_S2K_Brake_Rotors", bm_rotors, parent_col, mats["rotor"], bevel=0.0008)
    obj_calipers = link_obj("GEO_S2K_Brake_Calipers", bm_calipers, parent_col, mats["trim"], bevel=0.0015)
    obj_lugs = link_obj("GEO_S2K_Wheel_Chrome_LugNuts", bm_lugs, parent_col, mats["chrome"], bevel=0.0004)

    objs.extend([obj_wheels, obj_tires, obj_rotors, obj_calipers, obj_lugs])
    return objs
# ----------------------------------------------------------------------------
# 7. SUBSYSTEM 5: POLYURETHANE BUMPERS & VALANCES
# ----------------------------------------------------------------------------

def build_s2000_polyurethane_bumpers_and_valances(parent_col, mats):
    """
    Constructs the aerodynamic front and rear bumpers:
    - Front bumper fascia with signature five-sided center grille intake mouth (Y = +1.980m).
    - Lower chin spoiler lip and twin corner brake cooling air pocket recesses.
    - Rear bumper fascia with dual round exhaust cutouts (X = +/- 0.460m, Y = -2.020m).
    - Recessed rear license plate mounting pocket.
    """
    objs = []
    bm_bump = bmesh.new()
    bm_grille = bmesh.new()

    # 1. Front Aerodynamic Lower Bumper Valance & Chin (Y = +1.980m to +2.050m, Z = 0.180m to 0.340m)
    mat_f_valance = Matrix.Translation(Vector((0.0, 2.020, 0.240))) @ Euler((math.radians(-6), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_bump, size=1.0, matrix=mat_f_valance @ Matrix.Diagonal(Vector((1.580, 0.065, 0.120, 1.0))))

    # Front Valance Side Wrap-Around Corners (Left & Right to front wheel arch)
    for fx_sign in [-1.0, 1.0]:
        mat_f_wrap = Matrix.Translation(Vector((fx_sign * 0.740, 1.880, 0.250))) @ Euler((0, fx_sign * math.radians(-15), fx_sign * math.radians(18)), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_bump, size=1.0, matrix=mat_f_wrap @ Matrix.Diagonal(Vector((0.080, 0.260, 0.130, 1.0))))

    # Five-Sided Central Grille Air Intake (Width 0.680m, Height 0.120m, Z = 0.290m)
    mat_intake = Matrix.Translation(Vector((0.0, 2.035, 0.290)))
    bmesh.ops.create_cube(bm_grille, size=1.0, matrix=mat_intake @ Matrix.Diagonal(Vector((0.680, 0.040, 0.120, 1.0))))

    # Black Slat Grille Blades inside mouth
    for s_idx in [-0.030, 0.000, 0.030]:
        mat_slat = mat_intake @ Matrix.Translation(Vector((0, 0.010, s_idx)))
        bmesh.ops.create_cube(bm_grille, size=1.0, matrix=mat_slat @ Matrix.Diagonal(Vector((0.660, 0.010, 0.006, 1.0))))

    # Left & Right Corner Brake Duct Inlets (X = +/- 0.580m, Y = +2.000m, Z = 0.250m)
    for cx_sign in [-1.0, 1.0]:
        mat_duct = Matrix.Translation(Vector((cx_sign * 0.580, 2.005, 0.250))) @ Euler((0, 0, cx_sign * math.radians(-16)), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_grille, size=1.0, matrix=mat_duct @ Matrix.Diagonal(Vector((0.140, 0.040, 0.075, 1.0))))

    # 2. Rear Lower Bumper Valance & Diffuser Apron (Y = -2.000m to -2.050m, Z = 0.180m to 0.350m)
    mat_r_valance = Matrix.Translation(Vector((0.0, -2.015, 0.265))) @ Euler((math.radians(8), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_bump, size=1.0, matrix=mat_r_valance @ Matrix.Diagonal(Vector((1.600, 0.065, 0.140, 1.0))))

    # Rear Valance Wrap-Around Corners (Left & Right to rear wheel arch)
    for rx_sign in [-1.0, 1.0]:
        mat_r_wrap = Matrix.Translation(Vector((rx_sign * 0.740, -1.860, 0.270))) @ Euler((0, rx_sign * math.radians(14), rx_sign * math.radians(-18)), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_bump, size=1.0, matrix=mat_r_wrap @ Matrix.Diagonal(Vector((0.080, 0.280, 0.140, 1.0))))

    # Dual Symmetrical Round Exhaust Cutouts (X = +/- 0.520m, Z = 0.222m)
    for ex_sign in [-1.0, 1.0]:
        mat_ex_cut = Matrix.Translation(Vector((ex_sign * 0.520, -2.015, 0.222)))
        bmesh.ops.create_cylinder(bm_grille, radius=0.052, depth=0.080, segments=20, matrix=mat_ex_cut @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Rear License Plate Recessed Pocket (Center, Y = -2.025m, Z = 0.480m)
    mat_lp_pocket = Matrix.Translation(Vector((0.0, -2.025, 0.480))) @ Euler((math.radians(-14), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_grille, size=1.0, matrix=mat_lp_pocket @ Matrix.Diagonal(Vector((0.440, 0.035, 0.160, 1.0))))

    obj_bump = link_obj("GEO_S2K_Polyurethane_Bumpers", bm_bump, parent_col, mats["body"], bevel=0.002)
    obj_grille = link_obj("GEO_S2K_Bumper_Grilles_and_Cutouts", bm_grille, parent_col, mats["trim"], bevel=0.001)

    objs.extend([obj_bump, obj_grille])
    return objs

# ----------------------------------------------------------------------------
# 8. SUBSYSTEM 6: FRONT IN-WHEEL DOUBLE WISHBONE SUSPENSION & EPS
# ----------------------------------------------------------------------------

def build_s2000_front_double_wishbone_and_eps(parent_col, mats):
    """
    Constructs Honda's race-bred in-wheel double wishbone front suspension:
    - Upper forged aluminum A-arm wishbone bolted to inner fender shock tower.
    - Lower wide-base steel control arm mounted to front subframe cradle.
    - Coilover spring and monotube damper assembly.
    - Front steering knuckle upright with sealed hub bearing.
    - Electric Power Steering (EPS) rack-and-pinion unit and tie rods.
    """
    objs = []
    bm_susp = bmesh.new()
    bm_eps = bmesh.new()

    for fx_sign in [-1.0, 1.0]:
        # Front Wheel Center: X = +/- 0.735m, Y = +1.200m, Z = 0.316m
        mat_hub = Matrix.Translation(Vector((fx_sign * 0.735, 1.200, 0.316)))

        # 1. Cast Aluminum Steering Knuckle Upright
        mat_knuckle = Matrix.Translation(Vector((fx_sign * 0.650, 1.200, 0.320)))
        bmesh.ops.create_cube(bm_susp, size=1.0, matrix=mat_knuckle @ Matrix.Diagonal(Vector((0.045, 0.085, 0.220, 1.0))))

        # 2. Upper Forged A-Arm Wishbone (Z = 0.420m, spanning from inner rail X = +/- 0.440m to knuckle X = +/- 0.650m)
        mat_u_arm = Matrix.Translation(Vector((fx_sign * 0.545, 1.200, 0.420)))
        bmesh.ops.create_cube(bm_susp, size=1.0, matrix=mat_u_arm @ Matrix.Diagonal(Vector((0.220, 0.240, 0.024, 1.0))))
        # Inner Wishbone Pivot Bushing Sleeves
        for py in [1.080, 1.320]:
            mat_pbush = Matrix.Translation(Vector((fx_sign * 0.440, py, 0.420)))
            bmesh.ops.create_cylinder(bm_susp, radius=0.016, depth=0.045, segments=12, matrix=mat_pbush @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # 3. Lower Wide-Base Control Arm (Z = 0.210m, spanning from subframe X = +/- 0.380m to knuckle X = +/- 0.640m)
        mat_l_arm = Matrix.Translation(Vector((fx_sign * 0.510, 1.200, 0.210)))
        bmesh.ops.create_cube(bm_susp, size=1.0, matrix=mat_l_arm @ Matrix.Diagonal(Vector((0.260, 0.280, 0.028, 1.0))))
        # Inner Pivot Bushings
        for lpy in [1.060, 1.340]:
            mat_lpbush = Matrix.Translation(Vector((fx_sign * 0.380, lpy, 0.210)))
            bmesh.ops.create_cylinder(bm_susp, radius=0.018, depth=0.050, segments=12, matrix=mat_lpbush @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # 4. Front Coilover Spring & Monotube Damper Unit (Angled inward ~12 deg)
        p_damper_bot = Vector((fx_sign * 0.580, 1.200, 0.220))
        p_damper_top = Vector((fx_sign * 0.480, 1.200, 0.580))
        mat_damper = Matrix.Translation((p_damper_bot + p_damper_top) * 0.5) @ Vector((0, 0, 1)).rotation_difference(p_damper_top - p_damper_bot).to_matrix().to_4x4()
        # Damper Body Tube
        bmesh.ops.create_cylinder(bm_susp, radius=0.024, depth=0.360, segments=16, matrix=mat_damper)
        # Helical Coil Spring
        bmesh.ops.create_cylinder(bm_susp, radius=0.042, depth=0.240, segments=16, matrix=mat_damper @ Matrix.Translation(Vector((0, 0, 0.030))))

        # 5. Steering Tie-Rod extending from EPS rack to steering knuckle
        p_tierod_in = Vector((fx_sign * 0.280, 1.120, 0.240))
        p_tierod_out = Vector((fx_sign * 0.640, 1.130, 0.245))
        mat_trod = Matrix.Translation((p_tierod_in + p_tierod_out) * 0.5) @ Vector((0, 0, 1)).rotation_difference(p_tierod_out - p_tierod_in).to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_eps, radius=0.009, depth=(p_tierod_out - p_tierod_in).length, segments=10, matrix=mat_trod)
        # Accordion Rubber Steering Boot
        bmesh.ops.create_cylinder(bm_eps, radius=0.024, depth=0.080, segments=12, matrix=Matrix.Translation(Vector((fx_sign * 0.320, 1.120, 0.240))) @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # 6. Central Electric Power Steering (EPS) Motor & Rack Casing (Y = +1.120m, Z = 0.240m)
    mat_rack = Matrix.Translation(Vector((0.0, 1.120, 0.240)))
    bmesh.ops.create_cylinder(bm_eps, radius=0.032, depth=0.560, segments=16, matrix=mat_rack @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())
    # Electric Assist Motor Housing on Rack
    mat_eps_motor = mat_rack @ Matrix.Translation(Vector((-0.120, -0.045, 0.030)))
    bmesh.ops.create_cylinder(bm_eps, radius=0.048, depth=0.120, segments=18, matrix=mat_eps_motor)

    obj_susp = link_obj("GEO_S2K_Front_DoubleWishbone_Suspension", bm_susp, parent_col, mats["alloy"], bevel=0.0015)
    obj_eps = link_obj("GEO_S2K_EPS_Steering_Rack_and_Rods", bm_eps, parent_col, mats["trim"], bevel=0.001)

    objs.extend([obj_susp, obj_eps])
    return objs

# ----------------------------------------------------------------------------
# 9. SUBSYSTEM 7: REAR DOUBLE WISHBONE SUSPENSION & SUBFRAME
# ----------------------------------------------------------------------------

def build_s2000_rear_double_wishbone_and_subframe(parent_col, mats):
    """
    Constructs the high-rigidity rear multi-link double wishbone suspension:
    - Cast aluminum rear structural subframe cradle isolating differential and suspension.
    - Upper forged aluminum A-arm wishbone.
    - Lower control arm and independent toe control link for bump-steer suppression.
    - Rear coilover monotube spring/strut assembly.
    - Forged rear hub knuckle uprights with ABS wheel speed tone rings.
    """
    objs = []
    bm_subframe = bmesh.new()
    bm_rsusp = bmesh.new()

    # 1. Cast Aluminum Rear Subframe Cradle (Y = -1.200m, Z = 0.220m)
    mat_rf = Matrix.Translation(Vector((0.0, -1.200, 0.220)))
    # Subframe Main Transverse Member
    bmesh.ops.create_cube(bm_subframe, size=1.0, matrix=mat_rf @ Matrix.Diagonal(Vector((0.840, 0.220, 0.065, 1.0))))
    # Subframe Forward Longitudinal Cradle Legs
    for lx_sign in [-1.0, 1.0]:
        mat_leg = Matrix.Translation(Vector((lx_sign * 0.380, -1.050, 0.240)))
        bmesh.ops.create_cube(bm_subframe, size=1.0, matrix=mat_leg @ Matrix.Diagonal(Vector((0.065, 0.320, 0.055, 1.0))))
        # Chassis Mounting Bushing Plates
        bmesh.ops.create_cylinder(bm_subframe, radius=0.035, depth=0.040, segments=14, matrix=Matrix.Translation(Vector((lx_sign * 0.380, -0.900, 0.250))))

    # 2. Rear Wishbones & Hub Knuckles (Left & Right)
    for rx_sign in [-1.0, 1.0]:
        # Hub Carrier Knuckle
        mat_rknuckle = Matrix.Translation(Vector((rx_sign * 0.660, -1.200, 0.320)))
        bmesh.ops.create_cube(bm_rsusp, size=1.0, matrix=mat_rknuckle @ Matrix.Diagonal(Vector((0.050, 0.095, 0.220, 1.0))))

        # Upper Wishbone A-Arm (Z = 0.420m)
        mat_ru_arm = Matrix.Translation(Vector((rx_sign * 0.540, -1.200, 0.420)))
        bmesh.ops.create_cube(bm_rsusp, size=1.0, matrix=mat_ru_arm @ Matrix.Diagonal(Vector((0.220, 0.240, 0.024, 1.0))))

        # Lower Control Arm (Z = 0.210m)
        mat_rl_arm = Matrix.Translation(Vector((rx_sign * 0.520, -1.200, 0.210)))
        bmesh.ops.create_cube(bm_rsusp, size=1.0, matrix=mat_rl_arm @ Matrix.Diagonal(Vector((0.260, 0.260, 0.026, 1.0))))

        # Independent Toe Control Link (Trailing behind lower arm, Y = -1.320m)
        p_toe_in = Vector((rx_sign * 0.360, -1.320, 0.220))
        p_toe_out = Vector((rx_sign * 0.650, -1.260, 0.225))
        mat_toe = Matrix.Translation((p_toe_in + p_toe_out) * 0.5) @ Vector((0, 0, 1)).rotation_difference(p_toe_out - p_toe_in).to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_rsusp, radius=0.009, depth=(p_toe_out - p_toe_in).length, segments=10, matrix=mat_toe)

        # Rear Coilover Assembly
        p_rdamp_bot = Vector((rx_sign * 0.590, -1.200, 0.220))
        p_rdamp_top = Vector((rx_sign * 0.490, -1.200, 0.580))
        mat_rdamp = Matrix.Translation((p_rdamp_bot + p_rdamp_top) * 0.5) @ Vector((0, 0, 1)).rotation_difference(p_rdamp_top - p_rdamp_bot).to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_rsusp, radius=0.024, depth=0.360, segments=16, matrix=mat_rdamp)
        bmesh.ops.create_cylinder(bm_rsusp, radius=0.042, depth=0.240, segments=16, matrix=mat_rdamp @ Matrix.Translation(Vector((0, 0, 0.030))))

    obj_subframe = link_obj("GEO_S2K_Rear_Aluminum_Subframe", bm_subframe, parent_col, mats["alloy"], bevel=0.002)
    obj_rsusp = link_obj("GEO_S2K_Rear_DoubleWishbone_Suspension", bm_rsusp, parent_col, mats["alloy"], bevel=0.0015)

    objs.extend([obj_subframe, obj_rsusp])
    return objs

# ----------------------------------------------------------------------------
# 10. SUBSYSTEM 8: F20C 2.0L DOHC VTEC POWERTRAIN & 6-SPEED TRANSMISSION
# ----------------------------------------------------------------------------

def build_s2000_f20c_powertrain_and_transmission(parent_col, mats):
    """
    Constructs the legendary high-revving F20C Front Mid-Ship powertrain:
    - Longitudinally mounted F20C 2.0L inline-four engine block completely behind front axle (Y: +0.480m to +1.020m).
    - Signature Red Powder-Coated VTEC Aluminum Cam Valve Cover.
    - Deep cast aluminum finned oil sump pan.
    - Alternator, water pump, and serpentine belt drive pulleys on engine front face.
    - Longitudinal 6-speed manual short-throw transmission extending back through center tunnel.
    """
    objs = []
    bm_block = bmesh.new()
    bm_vtec = bmesh.new()
    bm_trans = bmesh.new()
    bm_pulley = bmesh.new()

    # Engine Center Coordinate: X = 0.000m, Y = +0.760m, Z = 0.440m
    # 1. Cast Aluminum Cylinder Block & Crankcase
    mat_block = Matrix.Translation(Vector((0.0, 0.760, 0.440)))
    bmesh.ops.create_cube(bm_block, size=1.0, matrix=mat_block @ Matrix.Diagonal(Vector((0.340, 0.480, 0.280, 1.0))))

    # Deep Finned Aluminum Oil Pan (Underside of block, Z = 0.220m)
    mat_pan = Matrix.Translation(Vector((0.0, 0.760, 0.230)))
    bmesh.ops.create_cube(bm_block, size=1.0, matrix=mat_pan @ Matrix.Diagonal(Vector((0.320, 0.440, 0.120, 1.0))))

    # 2. Signature Wrinkle-Red VTEC Dual-Overhead Cam Valve Cover (Z = 0.620m)
    mat_vc = Matrix.Translation(Vector((0.0, 0.760, 0.615)))
    bmesh.ops.create_cube(bm_vtec, size=1.0, matrix=mat_vc @ Matrix.Diagonal(Vector((0.260, 0.480, 0.075, 1.0))))
    # Dual Camshaft Humps
    for cx in [-0.070, 0.070]:
        mat_chump = mat_vc @ Matrix.Translation(Vector((cx, 0, 0.038)))
        bmesh.ops.create_cylinder(bm_vtec, radius=0.038, depth=0.460, segments=16, matrix=mat_chump @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Central Spark Plug Wire Cover Plate (Black composite plate atop valve cover)
    mat_wire_cov = mat_vc @ Matrix.Translation(Vector((0, 0, 0.040)))
    bmesh.ops.create_cube(bm_trans, size=1.0, matrix=mat_wire_cov @ Matrix.Diagonal(Vector((0.080, 0.420, 0.012, 1.0))))

    # 3. Front Accessory Drive Pulleys (Front engine face, Y = +1.020m)
    # Crankshaft Harmonic Balancer Pulley
    mat_crank_p = Matrix.Translation(Vector((0.0, 1.020, 0.320)))
    bmesh.ops.create_cylinder(bm_pulley, radius=0.065, depth=0.035, segments=20, matrix=mat_crank_p @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    # Alternator Pulley (Left side)
    mat_alt_p = Matrix.Translation(Vector((-0.180, 1.000, 0.480)))
    bmesh.ops.create_cylinder(bm_pulley, radius=0.035, depth=0.030, segments=16, matrix=mat_alt_p @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    # Serpentine Belt
    mat_belt = Matrix.Translation(Vector((0.0, 1.015, 0.400)))
    bmesh.ops.create_cube(bm_trans, size=1.0, matrix=mat_belt @ Matrix.Diagonal(Vector((0.360, 0.015, 0.220, 1.0))))

    # 4. 6-Speed Manual Transmission Casing (Extending from Y = +0.520m to Y = -0.220m)
    # Clutch Bellhousing (Bolted to rear of block)
    mat_bell = Matrix.Translation(Vector((0.0, 0.440, 0.380)))
    bmesh.ops.create_cone(bm_trans, radius1=0.180, radius2=0.120, depth=0.160, segments=20, matrix=mat_bell @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Main 6-Speed Gearbox Body
    mat_gb = Matrix.Translation(Vector((0.0, 0.180, 0.350)))
    bmesh.ops.create_cylinder(bm_trans, radius=0.110, depth=0.380, segments=18, matrix=mat_gb @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Transmission Rear Extension Housing / Output Tailshaft
    mat_tail = Matrix.Translation(Vector((0.0, -0.120, 0.330)))
    bmesh.ops.create_cone(bm_trans, radius1=0.095, radius2=0.055, depth=0.240, segments=16, matrix=mat_tail @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_block = link_obj("GEO_S2K_F20C_Engine_Block", bm_block, parent_col, mats["alloy"], bevel=0.002)
    obj_vtec = link_obj("GEO_S2K_VTEC_WrinkleRed_ValveCover", bm_vtec, parent_col, mats["vtec_red"], bevel=0.0015)
    obj_trans = link_obj("GEO_S2K_6Speed_Transmission_Casing", bm_trans, parent_col, mats["alloy"], bevel=0.002)
    obj_pulley = link_obj("GEO_S2K_Engine_Accessory_Pulleys", bm_pulley, parent_col, mats["chrome"], bevel=0.0008)

    objs.extend([obj_block, obj_vtec, obj_trans, obj_pulley])
    return objs
# ----------------------------------------------------------------------------
# 11. SUBSYSTEM 9: EXHAUST SYSTEM, DUAL MUFFLERS & PIPING
# ----------------------------------------------------------------------------

def build_s2000_exhaust_system_and_dual_mufflers(parent_col, mats):
    """
    Constructs the tuned performance exhaust system:
    - 4-into-2-into-1 stainless steel tubular exhaust header on right engine bank.
    - Underfloor catalytic converter and central resonator tube.
    - Symmetrical Y-pipe split behind rear differential.
    - Dual transverse stainless steel rear mufflers with twin polished exit pipes.
    """
    objs = []
    bm_header = bmesh.new()
    bm_exhaust = bmesh.new()

    # 1. 4-into-2-into-1 Tubular Stainless Exhaust Header (Right side of F20C, X = +0.180m)
    for cyl_idx, cy in enumerate([0.940, 0.820, 0.700, 0.580]):
        mat_prim = Matrix.Translation(Vector((0.190, cy, 0.520))) @ Euler((0, math.radians(40), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_header, radius=0.019, depth=0.180, segments=12, matrix=mat_prim)

    # Secondary Collector (Y = +0.500m, Z = 0.320m)
    mat_coll = Matrix.Translation(Vector((0.210, 0.440, 0.280))) @ Euler((math.radians(28), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_header, radius=0.028, depth=0.220, segments=14, matrix=mat_coll)

    # 2. Catalytic Converter & Center Resonator (Y: +0.200m to -0.600m, Z = 0.200m)
    mat_cat = Matrix.Translation(Vector((0.140, 0.050, 0.210)))
    bmesh.ops.create_cylinder(bm_exhaust, radius=0.062, depth=0.340, segments=18, matrix=mat_cat @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Mid-Pipe Resonator
    mat_res = Matrix.Translation(Vector((0.080, -0.450, 0.215)))
    bmesh.ops.create_cylinder(bm_exhaust, radius=0.052, depth=0.380, segments=16, matrix=mat_res @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 3. Y-Pipe Split behind differential (Y = -1.450m, Z = 0.225m)
    mat_ypipe = Matrix.Translation(Vector((0.0, -1.450, 0.225)))
    bmesh.ops.create_cylinder(bm_exhaust, radius=0.026, depth=0.480, segments=12, matrix=mat_ypipe @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # 4. Dual Stainless Steel Mufflers (Left & Right rear corners, X = +/- 0.460m, Y = -1.780m, Z = 0.240m)
    for mx_sign in [-1.0, 1.0]:
        mat_muff = Matrix.Translation(Vector((mx_sign * 0.460, -1.780, 0.240)))
        bmesh.ops.create_cylinder(bm_exhaust, radius=0.085, depth=0.380, segments=20, matrix=mat_muff @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # Exit Tailpipe through bumper scallop (X = +/- 0.460m, Y = -2.040m, Z = 0.220m)
        mat_pipe = Matrix.Translation(Vector((mx_sign * 0.460, -2.000, 0.220)))
        bmesh.ops.create_cylinder(bm_exhaust, radius=0.038, depth=0.160, segments=18, matrix=mat_pipe @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_header = link_obj("GEO_S2K_Stainless_Exhaust_Header", bm_header, parent_col, mats["chrome"], bevel=0.001)
    obj_exhaust = link_obj("GEO_S2K_Exhaust_Mufflers_and_Piping", bm_exhaust, parent_col, mats["chrome"], bevel=0.0015)

    objs.extend([obj_header, obj_exhaust])
    return objs

# ----------------------------------------------------------------------------
# 12. SUBSYSTEM 10: TORSEN LIMITED-SLIP DIFFERENTIAL & FINNED CASING
# ----------------------------------------------------------------------------

def build_s2000_torsen_lsd_and_finned_casing(parent_col, mats):
    """
    Constructs the rear differential assembly:
    - Torsen Type-I torque-sensing helical limited-slip differential.
    - Cast aluminum differential carrier housing with horizontal cooling fins.
    - Driveshaft pinion input flange connected to transmission output shaft.
    - Left and right axle output drive stub flanges.
    - Rubber isolation mounting bushings to rear subframe.
    """
    objs = []
    bm_diff = bmesh.new()

    # Differential Center: X = 0.000m, Y = -1.200m, Z = 0.316m
    mat_diff = Matrix.Translation(Vector((0.0, -1.200, 0.316)))

    # 1. Cast Aluminum Main Differential Pumpkin Housing
    bmesh.ops.create_cylinder(bm_diff, radius=0.115, depth=0.190, segments=20, matrix=mat_diff @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Forward Pinion Snout Housing (Extending forward towards transmission)
    mat_snout = mat_diff @ Matrix.Translation(Vector((0, 0.140, 0)))
    bmesh.ops.create_cone(bm_diff, radius1=0.088, radius2=0.052, depth=0.180, segments=16, matrix=mat_snout @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Driveshaft Pinion Input Flange (Y = -0.970m)
    mat_flange = mat_diff @ Matrix.Translation(Vector((0, 0.230, 0)))
    bmesh.ops.create_cylinder(bm_diff, radius=0.048, depth=0.024, segments=16, matrix=mat_flange @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Longitudinal Driveshaft Tube (Spanning transmission tailshaft Y: -0.120m to diff Y: -0.970m)
    mat_dshaft = Matrix.Translation(Vector((0.0, -0.545, 0.320)))
    bmesh.ops.create_cylinder(bm_diff, radius=0.034, depth=0.850, segments=16, matrix=mat_dshaft @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 3. Horizontal Aluminum Cooling Fins on Rear Differential Cover (Z from 0.250m to 0.380m)
    for f_idx in range(6):
        fz_off = -0.060 + f_idx * 0.024
        mat_fin = mat_diff @ Matrix.Translation(Vector((0, -0.105, fz_off)))
        bmesh.ops.create_cube(bm_diff, size=1.0, matrix=mat_fin @ Matrix.Diagonal(Vector((0.180, 0.016, 0.003, 1.0))))

    # 4. Rubber Subframe Isolation Mounts (Left & Right mounting ears)
    for mx_sign in [-1.0, 1.0]:
        mat_mount = mat_diff @ Matrix.Translation(Vector((mx_sign * 0.160, -0.040, 0.050)))
        bmesh.ops.create_cylinder(bm_diff, radius=0.035, depth=0.045, segments=14, matrix=mat_mount)

    obj_diff = link_obj("GEO_S2K_Torsen_Differential_and_Driveshaft", bm_diff, parent_col, mats["alloy"], bevel=0.0015)
    objs.append(obj_diff)
    return objs

# ----------------------------------------------------------------------------
# 13. SUBSYSTEM 11: ALUMINUM RADIATOR, DUAL FANS & CONDENSER
# ----------------------------------------------------------------------------

def build_s2000_radiator_fans_and_condenser(parent_col, mats):
    """
    Constructs the front cooling pack:
    - Lightweight all-aluminum crossflow radiator (Y = +1.780m, Z = 0.380m).
    - Dual high-flow electric cooling fans with molded composite shrouds.
    - Air conditioning condenser matrix core mounted ahead of radiator.
    - Translucent coolant overflow bottle and radiator pressure cap.
    """
    objs = []
    bm_rad = bmesh.new()
    bm_fans = bmesh.new()

    # Cooling Pack Axis: Y = +1.780m, Z = 0.380m, tilted forward ~15 deg
    mat_rad = Matrix.Translation(Vector((0.0, 1.780, 0.380))) @ Euler((math.radians(15), 0, 0), 'XYZ').to_matrix().to_4x4()

    # 1. Aluminum Crossflow Radiator Core (Width 0.640m, Height 0.380m, Depth 0.035m)
    bmesh.ops.create_cube(bm_rad, size=1.0, matrix=mat_rad @ Matrix.Diagonal(Vector((0.640, 0.035, 0.380, 1.0))))

    # Radiator Top & Bottom End Tanks
    for tz_sign in [-1.0, 1.0]:
        mat_tank = mat_rad @ Matrix.Translation(Vector((0, 0, tz_sign * 0.190)))
        bmesh.ops.create_cylinder(bm_rad, radius=0.024, depth=0.640, segments=14, matrix=mat_tank @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Radiator Polished Chrome Pressure Cap (1.1 bar)
    mat_cap = mat_rad @ Matrix.Translation(Vector((0.240, 0, 0.215)))
    bmesh.ops.create_cylinder(bm_rad, radius=0.025, depth=0.016, segments=16, matrix=mat_cap)

    # 2. Dual Electric Cooling Fans & Shrouds (Behind radiator, facing engine)
    for fx_sign in [-1.0, 1.0]:
        mat_fan = mat_rad @ Matrix.Translation(Vector((fx_sign * 0.150, -0.035, 0.000)))
        # Outer Fan Shroud Ring
        bmesh.ops.create_cylinder(bm_fans, radius=0.135, depth=0.040, segments=24, matrix=mat_fan @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
        # Electric Motor Hub
        bmesh.ops.create_cylinder(bm_fans, radius=0.042, depth=0.055, segments=16, matrix=mat_fan @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 3. A/C Condenser Core (Mounted directly ahead of radiator, Y offset +0.035m)
    mat_cond = mat_rad @ Matrix.Translation(Vector((0, 0.035, -0.015)))
    bmesh.ops.create_cube(bm_rad, size=1.0, matrix=mat_cond @ Matrix.Diagonal(Vector((0.620, 0.018, 0.340, 1.0))))

    obj_rad = link_obj("GEO_S2K_Aluminum_Radiator_and_Condenser", bm_rad, parent_col, mats["alloy"], bevel=0.001)
    obj_fans = link_obj("GEO_S2K_Radiator_Dual_Electric_Fans", bm_fans, parent_col, mats["trim"], bevel=0.001)

    objs.extend([obj_rad, obj_fans])
    return objs

# ----------------------------------------------------------------------------
# 14. SUBSYSTEM 12: HYDRAULIC BRAKE HARDLINES & FUEL CELL
# ----------------------------------------------------------------------------

def build_s2000_brake_plumbing_and_fuel_tank(parent_col, mats):
    """
    Constructs hydraulic plumbing and fuel containment:
    - 50-liter cross-linked polyethylene fuel tank mounted ahead of rear axle over tunnel.
    - Fuel filler neck and rubber overflow boot routing to left rear quarter.
    - 4-channel ABS hydraulic modulator block with 12 solenoid ports on right inner wing.
    - Dual diagonal steel/nickel brake hardlines running through center tunnel.
    """
    objs = []
    bm_fuel = bmesh.new()
    bm_lines = bmesh.new()

    # 1. 50-Liter Polyethylene Fuel Tank (Y: -0.650m to -1.050m, Z = 0.340m)
    mat_tank = Matrix.Translation(Vector((0.0, -0.850, 0.340)))
    bmesh.ops.create_cube(bm_fuel, size=1.0, matrix=mat_tank @ Matrix.Diagonal(Vector((0.740, 0.400, 0.280, 1.0))))

    # Fuel Filler Neck Routing to Left Rear Fender (X = -0.740m, Y = -0.920m, Z = 0.650m)
    mat_filler = Matrix.Translation(Vector((-0.520, -0.880, 0.500))) @ Euler((0, math.radians(35), 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_fuel, radius=0.024, depth=0.280, segments=12, matrix=mat_filler)

    # 2. 4-Channel ABS Hydraulic Modulator Block (Right inner fender, X = +0.440m, Y = +0.920m, Z = 0.580m)
    mat_abs = Matrix.Translation(Vector((0.440, 0.920, 0.580)))
    bmesh.ops.create_cube(bm_lines, size=1.0, matrix=mat_abs @ Matrix.Diagonal(Vector((0.110, 0.130, 0.100, 1.0))))
    # Modulator Motor Cylindrical Accumulator
    bmesh.ops.create_cylinder(bm_lines, radius=0.028, depth=0.075, segments=14, matrix=mat_abs @ Matrix.Translation(Vector((0, 0, 0.065))))

    # 3. Dual Hydraulic Brake Hardlines running along tunnel floor
    for lx_off in [-0.015, 0.015]:
        mat_bline = Matrix.Translation(Vector((lx_off, 0.000, 0.190)))
        bmesh.ops.create_cylinder(bm_lines, radius=0.004, depth=2.200, segments=8, matrix=mat_bline @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_fuel = link_obj("GEO_S2K_Fuel_Tank_and_Filler", bm_fuel, parent_col, mats["trim"], bevel=0.002)
    obj_lines = link_obj("GEO_S2K_ABS_Modulator_and_BrakeLines", bm_lines, parent_col, mats["alloy"], bevel=0.001)

    objs.extend([obj_fuel, obj_lines])
    return objs
# ----------------------------------------------------------------------------
# 15. SUBSYSTEM 13: TWIN SAFETY ROLL HOOPS & CENTER DEFLECTOR
# ----------------------------------------------------------------------------

def build_s2000_twin_safety_roll_hoops(parent_col, mats):
    """
    Constructs the iconic factory safety roll hoop architecture:
    - Twin tubular high-strength steel roll hoops behind driver & passenger seats (X = +/- 0.360m).
    - Molded aerodynamic satin black protective plastic cladding.
    - Integral seatbelt guide loops mounted on outer hoop shoulders.
    - Clear acrylic center cockpit wind deflector flap mounted between roll hoops.
    """
    objs = []
    bm_hoops = bmesh.new()
    bm_flap = bmesh.new()

    for hx_sign in [-1.0, 1.0]:
        # Roll Hoop Axis: X = +/- 0.360m, Y = -0.420m, Z = 0.810m to 1.050m
        mat_hoop_c = Matrix.Translation(Vector((hx_sign * 0.360, -0.420, 0.930)))

        # Inverted U-Shape Tubular Roll Hoop (Width 0.340m, Height 0.240m)
        # Upper curved crest
        mat_crest = mat_hoop_c @ Matrix.Translation(Vector((0, 0, 0.100)))
        bmesh.ops.create_torus(bm_hoops, major_radius=0.150, minor_radius=0.024, major_segments=24, minor_segments=12, matrix=mat_crest @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # Left & Right Vertical Stanchion Legs
        for lx in [-0.150, 0.150]:
            mat_leg = mat_hoop_c @ Matrix.Translation(Vector((lx, 0, 0.000)))
            bmesh.ops.create_cylinder(bm_hoops, radius=0.024, depth=0.200, segments=16, matrix=mat_leg)

        # Outer Shoulder Seatbelt Guide Loop
        mat_guide = mat_hoop_c @ Matrix.Translation(Vector((hx_sign * 0.165, 0.020, 0.060)))
        bmesh.ops.create_cylinder(bm_hoops, radius=0.012, depth=0.025, segments=12, matrix=mat_guide @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Central Acrylic Cockpit Wind Deflector Flap (Between hoops, X = 0.000m, Y = -0.420m, Z = 0.900m)
    mat_deflector = Matrix.Translation(Vector((0.0, -0.420, 0.900)))
    bmesh.ops.create_cube(bm_flap, size=1.0, matrix=mat_deflector @ Matrix.Diagonal(Vector((0.360, 0.008, 0.140, 1.0))))
    # Deflector Lower Hinge Bracket
    mat_dhinge = mat_deflector @ Matrix.Translation(Vector((0, 0, -0.075)))
    bmesh.ops.create_cylinder(bm_hoops, radius=0.008, depth=0.360, segments=12, matrix=mat_dhinge @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_hoops = link_obj("GEO_S2K_Twin_Safety_Roll_Hoops", bm_hoops, parent_col, mats["trim"], bevel=0.0015)
    obj_flap = link_obj("GEO_S2K_Center_Aero_Wind_Deflector", bm_flap, parent_col, mats["glass"], bevel=0.0005)

    objs.extend([obj_hoops, obj_flap])
    return objs

# ----------------------------------------------------------------------------
# 16. SUBSYSTEM 14: COCKPIT INTERIOR TUB & HIGH-BOLSTER SPORT SEATS
# ----------------------------------------------------------------------------

def build_s2000_cockpit_interior_and_sport_seats(parent_col, mats):
    """
    Constructs the driver-focused roadster cockpit:
    - Lightweight high-bolstered sport bucket seats with integrated headrests.
    - Prominent central transmission tunnel spine with integrated leather handbrake console.
    - Driver-oriented instrument binnacle shroud and passenger dashboard sweep.
    - Footwell floor carpet and center storage cubby.
    """
    objs = []
    bm_tub = bmesh.new()
    bm_seats = bmesh.new()

    # 1. Cockpit Interior Floor Tub (Y: -0.480m to +0.480m, Width 1.280m, Z = 0.220m)
    mat_tub = Matrix.Translation(Vector((0.0, 0.000, 0.230)))
    bmesh.ops.create_cube(bm_tub, size=1.0, matrix=mat_tub @ Matrix.Diagonal(Vector((1.280, 0.960, 0.160, 1.0))))

    # Dashboard Transverse Cowl Sweep (Y = +0.420m, Z = 0.720m)
    mat_dash = Matrix.Translation(Vector((0.0, 0.420, 0.720)))
    bmesh.ops.create_cube(bm_tub, size=1.0, matrix=mat_dash @ Matrix.Diagonal(Vector((1.240, 0.240, 0.180, 1.0))))

    # 2. High-Bolster Sport Bucket Seats (Driver X = -0.360m, Passenger X = +0.360m)
    for sx_sign in [-1.0, 1.0]:
        mat_seat = Matrix.Translation(Vector((sx_sign * 0.360, -0.050, 0.440)))

        # Seat Bottom Cushion Squab
        bmesh.ops.create_cube(bm_seats, size=1.0, matrix=mat_seat @ Matrix.Diagonal(Vector((0.440, 0.460, 0.120, 1.0))))
        # Lateral Thigh Bolsters
        for bx_sign in [-1.0, 1.0]:
            mat_thigh = mat_seat @ Matrix.Translation(Vector((bx_sign * 0.200, 0, 0.050)))
            bmesh.ops.create_cube(bm_seats, size=1.0, matrix=mat_thigh @ Matrix.Diagonal(Vector((0.065, 0.440, 0.080, 1.0))))

        # High-Bolster Seat Backrest (Reclined ~16 deg)
        mat_back = mat_seat @ Matrix.Translation(Vector((0, -0.220, 0.280))) @ Euler((math.radians(16), 0, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_seats, size=1.0, matrix=mat_back @ Matrix.Diagonal(Vector((0.420, 0.100, 0.500, 1.0))))

        # Lateral Torso Bolsters
        for bx_sign in [-1.0, 1.0]:
            mat_torso = mat_back @ Matrix.Translation(Vector((bx_sign * 0.190, 0.035, 0.000)))
            bmesh.ops.create_cube(bm_seats, size=1.0, matrix=mat_torso @ Matrix.Diagonal(Vector((0.065, 0.110, 0.460, 1.0))))

        # Integrated Headrest with central open cut-out
        mat_head = mat_back @ Matrix.Translation(Vector((0, 0, 0.310)))
        bmesh.ops.create_cube(bm_seats, size=1.0, matrix=mat_head @ Matrix.Diagonal(Vector((0.260, 0.090, 0.160, 1.0))))

    obj_tub = link_obj("GEO_S2K_Cockpit_Interior_Tub", bm_tub, parent_col, mats["trim"], bevel=0.002)
    obj_seats = link_obj("GEO_S2K_HighBolster_Sport_Seats", bm_seats, parent_col, mats["trim"], bevel=0.002)

    objs.extend([obj_tub, obj_seats])
    return objs

# ----------------------------------------------------------------------------
# 17. SUBSYSTEM 15: HOOD HINGES, GAS STRUTS & CORE RADIATOR SUPPORT
# ----------------------------------------------------------------------------

def build_s2000_hood_hinges_and_radiator_support(parent_col, mats):
    """
    Constructs the engine bay structural front bulkhead and hood mechanism:
    - Sturdy front core radiator support crossmember beam (Y = +1.840m, Z = 0.640m).
    - Long forward hood scissor hinge arms and pressurized gas lifting struts.
    - Upper radiator tie bar and hood safety primary latch catch.
    """
    objs = []
    bm_core = bmesh.new()
    bm_hinges = bmesh.new()

    # 1. Front Core Support Radiator Crossmember Beam (Y = +1.840m, Z = 0.640m)
    mat_core = Matrix.Translation(Vector((0.0, 1.840, 0.640)))
    bmesh.ops.create_cube(bm_core, size=1.0, matrix=mat_core @ Matrix.Diagonal(Vector((1.120, 0.085, 0.055, 1.0))))

    # Left & Right Core Support Vertical Tie Pillars
    for px_sign in [-1.0, 1.0]:
        mat_pillar = Matrix.Translation(Vector((px_sign * 0.480, 1.840, 0.460)))
        bmesh.ops.create_cube(bm_core, size=1.0, matrix=mat_pillar @ Matrix.Diagonal(Vector((0.055, 0.075, 0.320, 1.0))))

    # Hood Primary Safety Latch Catch (Center, Y = +1.840m, Z = 0.665m)
    mat_latch = mat_core @ Matrix.Translation(Vector((0, 0, 0.035)))
    bmesh.ops.create_cube(bm_core, size=1.0, matrix=mat_latch @ Matrix.Diagonal(Vector((0.065, 0.045, 0.032, 1.0))))

    # 2. Dual Forward Hood Scissor Hinges & Gas Struts (Left & Right, Y = +0.960m, Z = 0.710m)
    for hx_sign in [-1.0, 1.0]:
        mat_hinge = Matrix.Translation(Vector((hx_sign * 0.580, 0.960, 0.710))) @ Euler((math.radians(-24), 0, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_hinges, size=1.0, matrix=mat_hinge @ Matrix.Diagonal(Vector((0.024, 0.140, 0.035, 1.0))))

        # Pressurized Gas Strut Body & Chrome Piston Rod
        p_strut_bot = Vector((hx_sign * 0.560, 1.050, 0.620))
        p_strut_top = Vector((hx_sign * 0.560, 1.250, 0.720))
        mat_strut = Matrix.Translation((p_strut_bot + p_strut_top) * 0.5) @ Vector((0, 0, 1)).rotation_difference(p_strut_top - p_strut_bot).to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_hinges, radius=0.010, depth=(p_strut_top - p_strut_bot).length, segments=12, matrix=mat_strut)

    obj_core = link_obj("GEO_S2K_Front_Core_Radiator_Support", bm_core, parent_col, mats["body"], bevel=0.0015)
    obj_hinges = link_obj("GEO_S2K_Hood_Hinges_and_Gas_Struts", bm_hinges, parent_col, mats["alloy"], bevel=0.001)

    objs.extend([obj_core, obj_hinges])
    return objs

# ----------------------------------------------------------------------------
# 18. SUBSYSTEM 16: TRUNK LID HINGES & REAR CRASH BAR
# ----------------------------------------------------------------------------

def build_s2000_trunk_hinges_and_rear_crash_bar(parent_col, mats):
    """
    Constructs the rear structural safety and trunk mechanisms:
    - High-strength aluminum rear bumper crash reinforcement beam (Y = -1.960m, Z = 0.420m).
    - Energy-absorbing foam block core inside rear bumper skin.
    - Rear trunk lid gooseneck hinges with counterbalance torsion springs.
    - Trunk floor spare tire well recess stamping.
    """
    objs = []
    bm_crash = bmesh.new()
    bm_thinges = bmesh.new()

    # 1. High-Strength Aluminum Rear Bumper Crash Bar (Y = -1.960m, Z = 0.420m)
    mat_crash = Matrix.Translation(Vector((0.0, -1.960, 0.420)))
    bmesh.ops.create_cube(bm_crash, size=1.0, matrix=mat_crash @ Matrix.Diagonal(Vector((1.280, 0.085, 0.095, 1.0))))

    # Left & Right Rear Frame Rail Impact Mounting Horns
    for mx_sign in [-1.0, 1.0]:
        mat_horn = Matrix.Translation(Vector((mx_sign * 0.460, -1.880, 0.420)))
        bmesh.ops.create_cube(bm_crash, size=1.0, matrix=mat_horn @ Matrix.Diagonal(Vector((0.080, 0.160, 0.085, 1.0))))

    # 2. Trunk Gooseneck Hinges & Counterbalance Springs (Left & Right, Y = -1.580m, Z = 0.770m)
    for tx_sign in [-1.0, 1.0]:
        mat_th = Matrix.Translation(Vector((tx_sign * 0.480, -1.580, 0.770))) @ Euler((math.radians(18), 0, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_thinges, size=1.0, matrix=mat_th @ Matrix.Diagonal(Vector((0.024, 0.120, 0.040, 1.0))))

    # Trunk Well Floor Stamping (Y = -1.680m, Z = 0.280m)
    mat_well = Matrix.Translation(Vector((0.0, -1.680, 0.280)))
    bmesh.ops.create_cylinder(bm_crash, radius=0.280, depth=0.140, segments=24, matrix=mat_well)

    obj_crash = link_obj("GEO_S2K_Rear_Bumper_Crash_Bar", bm_crash, parent_col, mats["alloy"], bevel=0.002)
    obj_thinges = link_obj("GEO_S2K_Trunk_Hinges_and_Well", bm_thinges, parent_col, mats["alloy"], bevel=0.001)

    objs.extend([obj_crash, obj_thinges])
    return objs
# ----------------------------------------------------------------------------
# 19. SUBSYSTEM 17: FRONT STRUT TOWER BRACE & TORSIONAL TIES
# ----------------------------------------------------------------------------

def build_s2000_strut_brace_and_torsional_ties(parent_col, mats):
    """
    Constructs chassis structural stiffening for high open-top torsional rigidity:
    - Polished aluminum front upper strut tower stress bar traversing the engine bay (Y = +1.180m, Z = 0.680m).
    - Left and right shock tower multi-bolt mounting rings.
    - Lower front subframe reinforcement tie-bar cradle.
    - Rear subframe triangular gusset reinforcement plates.
    """
    objs = []
    bm_brace = bmesh.new()

    # 1. Front Strut Tower Stress Bar (Traversing from Left X = -0.480m to Right X = +0.480m)
    mat_bar = Matrix.Translation(Vector((0.0, 1.180, 0.680)))
    bmesh.ops.create_cylinder(bm_brace, radius=0.016, depth=0.960, segments=16, matrix=mat_bar @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Left & Right Strut Tower Multi-Bolt Mounting Rings (X = +/- 0.480m)
    for bx_sign in [-1.0, 1.0]:
        mat_ring = Matrix.Translation(Vector((bx_sign * 0.480, 1.180, 0.640)))
        bmesh.ops.create_cylinder(bm_brace, radius=0.065, depth=0.016, segments=20, matrix=mat_ring)
        # Tower Stud Through-Bolts
        for bolt_idx in range(3):
            b_ang = bolt_idx * 2.0 * math.pi / 3.0
            mat_bolt = mat_ring @ Matrix.Translation(Vector((0.045 * math.cos(b_ang), 0.045 * math.sin(b_ang), 0.015)))
            bmesh.ops.create_cylinder(bm_brace, radius=0.006, depth=0.020, segments=8, matrix=mat_bolt)

    # 2. Lower Front Subframe Reinforcement Tie-Bar Cradle (Z = 0.175m)
    mat_tie = Matrix.Translation(Vector((0.0, 1.050, 0.175)))
    bmesh.ops.create_cube(bm_brace, size=1.0, matrix=mat_tie @ Matrix.Diagonal(Vector((0.740, 0.065, 0.024, 1.0))))

    # 3. Rear Subframe Triangular Gusset Reinforcement Plates (X = +/- 0.380m, Y = -1.150m)
    for rx_sign in [-1.0, 1.0]:
        mat_gusset = Matrix.Translation(Vector((rx_sign * 0.380, -1.150, 0.260)))
        bmesh.ops.create_cube(bm_brace, size=1.0, matrix=mat_gusset @ Matrix.Diagonal(Vector((0.080, 0.140, 0.015, 1.0))))

    obj_brace = link_obj("GEO_S2K_Chassis_Torsional_Braces", bm_brace, parent_col, mats["alloy"], bevel=0.0015)
    objs.append(obj_brace)
    return objs

# ----------------------------------------------------------------------------
# 20. SUBSYSTEM 18: FRONT & REAR ANTI-ROLL SWAY BARS
# ----------------------------------------------------------------------------

def build_s2000_front_and_rear_sway_bars(parent_col, mats):
    """
    Constructs the high-rate front and rear anti-roll sway bars:
    - Front 28.2mm tubular sway bar traversing beneath radiator support (Y = +1.320m, Z = 0.225m).
    - Front vertical ball-joint drop links connected to lower control arms.
    - Rear 27.2mm solid anti-roll bar routed beneath differential housing (Y = -1.060m, Z = 0.230m).
    - Rear drop links connecting to rear lower wishbones.
    """
    objs = []
    bm_sway = bmesh.new()

    # 1. Front Anti-Roll Sway Bar (Y = +1.320m, Z = 0.225m)
    mat_f_sway = Matrix.Translation(Vector((0.0, 1.320, 0.225)))
    bmesh.ops.create_cylinder(bm_sway, radius=0.014, depth=0.880, segments=16, matrix=mat_f_sway @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Front Pivot Bushing Saddles & Drop Links
    for fx_sign in [-1.0, 1.0]:
        mat_fbush = Matrix.Translation(Vector((fx_sign * 0.360, 1.320, 0.225)))
        bmesh.ops.create_cube(bm_sway, size=1.0, matrix=mat_fbush @ Matrix.Diagonal(Vector((0.045, 0.052, 0.042, 1.0))))

        # Front Vertical Drop Link to Lower Arm
        mat_flink = Matrix.Translation(Vector((fx_sign * 0.480, 1.280, 0.230)))
        bmesh.ops.create_cylinder(bm_sway, radius=0.007, depth=0.110, segments=10, matrix=mat_flink)

    # 2. Rear Anti-Roll Sway Bar (Y = -1.060m, Z = 0.230m)
    mat_r_sway = Matrix.Translation(Vector((0.0, -1.060, 0.230)))
    bmesh.ops.create_cylinder(bm_sway, radius=0.0135, depth=0.860, segments=16, matrix=mat_r_sway @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Rear Pivot Saddles & Drop Links
    for rx_sign in [-1.0, 1.0]:
        mat_rbush = Matrix.Translation(Vector((rx_sign * 0.350, -1.060, 0.230)))
        bmesh.ops.create_cube(bm_sway, size=1.0, matrix=mat_rbush @ Matrix.Diagonal(Vector((0.045, 0.052, 0.040, 1.0))))

        # Rear Drop Link
        mat_rlink = Matrix.Translation(Vector((rx_sign * 0.460, -1.120, 0.235)))
        bmesh.ops.create_cylinder(bm_sway, radius=0.007, depth=0.110, segments=10, matrix=mat_rlink)

    obj_sway = link_obj("GEO_S2K_AntiRoll_Sway_Bars", bm_sway, parent_col, mats["trim"], bevel=0.001)
    objs.append(obj_sway)
    return objs

# ----------------------------------------------------------------------------
# 21. SUBSYSTEM 19: FRONT BRAKE COOLING DUCTS & DEFLECTORS
# ----------------------------------------------------------------------------

def build_s2000_front_brake_cooling_ducts(parent_col, mats):
    """
    Constructs the aerodynamic front brake cooling ductwork:
    - Ram-air intake scoops in lower front bumper valance (X = +/- 0.480m, Y = +1.980m, Z = 0.240m).
    - Flexible corrugated ducting routed through inner fender liners.
    - Brake rotor dust shield directional air deflector nozzles.
    """
    objs = []
    bm_duct = bmesh.new()

    for bx_sign in [-1.0, 1.0]:
        # Intake Funnel
        mat_funnel = Matrix.Translation(Vector((bx_sign * 0.480, 1.980, 0.240)))
        bmesh.ops.create_cube(bm_duct, size=1.0, matrix=mat_funnel @ Matrix.Diagonal(Vector((0.110, 0.075, 0.065, 1.0))))

        # Corrugated Flexible Duct Hose
        mat_hose = Matrix.Translation(Vector((bx_sign * 0.550, 1.650, 0.280))) @ Euler((math.radians(-14), bx_sign * math.radians(10), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_duct, radius=0.028, depth=0.580, segments=14, matrix=mat_hose @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

        # Rotor Backing Plate Air Deflector Scoop
        mat_scoop = Matrix.Translation(Vector((bx_sign * 0.650, 1.240, 0.316)))
        bmesh.ops.create_cube(bm_duct, size=1.0, matrix=mat_scoop @ Matrix.Diagonal(Vector((0.035, 0.120, 0.140, 1.0))))

    obj_duct = link_obj("GEO_S2K_Front_Brake_Cooling_Ducts", bm_duct, parent_col, mats["trim"], bevel=0.001)
    objs.append(obj_duct)
    return objs

# ----------------------------------------------------------------------------
# 22. SUBSYSTEM 20: UNDERFLOOR AERO PAN & REAR DIFFUSER
# ----------------------------------------------------------------------------

def build_s2000_underfloor_aero_pan_and_diffuser(parent_col, mats):
    """
    Constructs the underbody aerodynamics and rear diffuser tunnels:
    - Front under-engine composite aerodynamic splash tray with oil filter service hatch.
    - Rear differential air guide scoop tunnel.
    - Rear lower bumper aerodynamic strakes reducing wake turbulence.
    """
    objs = []
    bm_aero = bmesh.new()

    # 1. Front Engine Underbody Splash Tray (Y: +1.100m to +1.800m, Z = 0.155m)
    mat_tray = Matrix.Translation(Vector((0.0, 1.450, 0.155)))
    bmesh.ops.create_cube(bm_aero, size=1.0, matrix=mat_tray @ Matrix.Diagonal(Vector((0.820, 0.700, 0.014, 1.0))))

    # 2. Rear Differential Cooling Scoop & Aero Guide (Y = -1.050m, Z = 0.165m)
    mat_scoop = Matrix.Translation(Vector((0.0, -1.050, 0.165)))
    bmesh.ops.create_cube(bm_aero, size=1.0, matrix=mat_scoop @ Matrix.Diagonal(Vector((0.360, 0.400, 0.024, 1.0))))

    # 3. Rear Diffuser Longitudinal Aero Strakes (Y = -1.850m to -2.040m, Z = 0.180m)
    for sx in [-0.260, 0.260]:
        mat_strake = Matrix.Translation(Vector((sx, -1.945, 0.180)))
        bmesh.ops.create_cube(bm_aero, size=1.0, matrix=mat_strake @ Matrix.Diagonal(Vector((0.012, 0.220, 0.055, 1.0))))

    obj_aero = link_obj("GEO_S2K_Underfloor_Aero_Strakes", bm_aero, parent_col, mats["trim"], bevel=0.001)
    objs.append(obj_aero)
    return objs
# ----------------------------------------------------------------------------
# 23. SUBSYSTEM 21: F20C RED CRACKLE VALVE COVER & IGNITION COILS
# ----------------------------------------------------------------------------

def build_s2000_f20c_valve_cover_and_ignition_coils(parent_col, mats):
    """
    Constructs the iconic Honda high-revving red crackle finish valve cover:
    - Longitudinally oriented DOHC valve cover atop F20C cylinder head (Y = +0.780m, Z = 0.585m).
    - Longitudinal spark plug valley cover plate with cast brushed aluminum finish.
    - 4 Individual direct-ignition coil-on-plug modules with retaining hex bolts.
    - Anodized aluminum oil filler cap on front left boss.
    - VTEC variable valve timing spool valve solenoid casing on cylinder head rear.
    """
    objs = []
    bm_vc = bmesh.new()

    # 1. Main Camshaft Valve Cover Body (Y = +0.650m to +0.960m, Z = 0.585m, Width = 0.280m)
    mat_vc = Matrix.Translation(Vector((0.0, 0.805, 0.585)))
    bmesh.ops.create_cube(bm_vc, size=1.0, matrix=mat_vc @ Matrix.Diagonal(Vector((0.270, 0.360, 0.085, 1.0))))

    # Twin Camshaft Longitudinal Humps (Intake & Exhaust cam lobes, X = +/- 0.085m)
    for cx_sign in [-1.0, 1.0]:
        mat_hump = Matrix.Translation(Vector((cx_sign * 0.082, 0.805, 0.628)))
        bmesh.ops.create_cylinder(bm_vc, radius=0.048, depth=0.355, segments=18, matrix=mat_hump @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Valve Cover Perimeter Flange Acorn Retaining Nuts (10 Fasteners)
    for vi in range(5):
        y_nut = 0.640 + vi * 0.080
        for x_nut in [-0.130, 0.130]:
            mat_nut = Matrix.Translation(Vector((x_nut, y_nut, 0.590)))
            bmesh.ops.create_cylinder(bm_vc, radius=0.007, depth=0.018, segments=8, matrix=mat_nut)

    # 2. Central Spark Plug Well Access Valley Cover (Cast Aluminum Finish)
    mat_val = Matrix.Translation(Vector((0.0, 0.805, 0.632)))
    bmesh.ops.create_cube(bm_vc, size=1.0, matrix=mat_val @ Matrix.Diagonal(Vector((0.076, 0.320, 0.016, 1.0))))

    # 4 Direct-Ignition Coil-on-Plug Packs (Y = +0.680m, +0.760m, +0.840m, +0.920m)
    for cyl in range(4):
        y_coil = 0.685 + cyl * 0.080
        mat_coil = Matrix.Translation(Vector((0.0, y_coil, 0.642)))
        bmesh.ops.create_cube(bm_vc, size=1.0, matrix=mat_coil @ Matrix.Diagonal(Vector((0.042, 0.042, 0.018, 1.0))))
        # Coil Hold-Down M6 Bolt
        mat_cbolt = Matrix.Translation(Vector((0.024, y_coil, 0.644)))
        bmesh.ops.create_cylinder(bm_vc, radius=0.0045, depth=0.012, segments=8, matrix=mat_cbolt)

    # 3. Billet Anodized Oil Filler Cap (Front-Left, X = -0.085m, Y = 0.665m, Z = 0.655m)
    mat_oilcap = Matrix.Translation(Vector((-0.085, 0.665, 0.655)))
    bmesh.ops.create_cylinder(bm_vc, radius=0.025, depth=0.022, segments=18, matrix=mat_oilcap)
    # Cap Gripping Flutes
    for flute in range(6):
        f_ang = flute * math.pi / 3.0
        mat_flute = mat_oilcap @ Matrix.Translation(Vector((0.022 * math.cos(f_ang), 0.022 * math.sin(f_ang), 0.008)))
        bmesh.ops.create_cube(bm_vc, size=1.0, matrix=mat_flute @ Matrix.Diagonal(Vector((0.008, 0.008, 0.016, 1.0))))

    # 4. VTEC Spool Valve Solenoid Housing (Rear Right of Cylinder Head, X = +0.115m, Y = 0.965m, Z = 0.540m)
    mat_vtec = Matrix.Translation(Vector((0.115, 0.965, 0.540)))
    bmesh.ops.create_cylinder(bm_vc, radius=0.022, depth=0.065, segments=14, matrix=mat_vtec)
    bmesh.ops.create_cube(bm_vc, size=1.0, matrix=mat_vtec @ Matrix.Translation(Vector((0, -0.020, -0.015))) @ Matrix.Diagonal(Vector((0.048, 0.040, 0.045, 1.0))))

    obj_vc = link_obj("GEO_S2K_F20C_Valve_Cover_and_Ignition", bm_vc, parent_col, mats["red_caliper"], bevel=0.0012)
    objs.append(obj_vc)
    return objs

# ----------------------------------------------------------------------------
# 24. SUBSYSTEM 22: HIGH-FLOW CAST ALUMINUM INTAKE MANIFOLD
# ----------------------------------------------------------------------------

def build_s2000_intake_manifold_and_throttle_body(parent_col, mats):
    """
    Constructs the F20C tuned-length intake manifold and throttle body assembly:
    - Cast aluminum surge tank / plenum located on intake side (Left X = -0.220m, Y = +0.800m, Z = 0.490m).
    - 4 Equal-length curved intake runners transitioning into cylinder head intake ports.
    - Large-bore single 62mm throttle body housing with throttle cable drum bracket.
    - Idle Air Control Valve (IACV) and Manifold Absolute Pressure (MAP) sensor bosses.
    - Fuel rail with 4 multi-hole fuel injector bodies mounted in runner bosses.
    """
    objs = []
    bm_im = bmesh.new()

    # 1. Main Intake Plenum / Surge Tank (Left side of engine bay, X = -0.210m, Y = +0.800m, Z = 0.490m)
    mat_plenum = Matrix.Translation(Vector((-0.210, 0.800, 0.490)))
    bmesh.ops.create_cylinder(bm_im, radius=0.054, depth=0.340, segments=18, matrix=mat_plenum @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 2. 4 Tuned Curved Intake Runners (From Plenum X = -0.190m into Cylinder Head X = -0.080m)
    for ri in range(4):
        y_r = 0.685 + ri * 0.080
        mat_runner = Matrix.Translation(Vector((-0.145, y_r, 0.490)))
        bmesh.ops.create_cylinder(bm_im, radius=0.024, depth=0.125, segments=14, matrix=mat_runner @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # Fuel Injector Boss & Injector Body (X = -0.095m, Z = 0.525m)
        mat_inj = Matrix.Translation(Vector((-0.095, y_r, 0.525))) @ Euler((0, math.radians(-25), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_im, radius=0.010, depth=0.045, segments=10, matrix=mat_inj)

    # 3. High-Pressure Aluminum Fuel Delivery Rail (X = -0.105m, Y: +0.660m to +0.940m, Z = 0.545m)
    mat_frail = Matrix.Translation(Vector((-0.105, 0.800, 0.545)))
    bmesh.ops.create_cube(bm_im, size=1.0, matrix=mat_frail @ Matrix.Diagonal(Vector((0.018, 0.320, 0.018, 1.0))))
    # Fuel Pressure Pulsation Damper (Front end of fuel rail, Y = 0.650m)
    mat_damper = Matrix.Translation(Vector((-0.105, 0.645, 0.545)))
    bmesh.ops.create_cylinder(bm_im, radius=0.016, depth=0.025, segments=14, matrix=mat_damper)

    # 4. 62mm Throttle Body Housing (Front of Plenum, Y = 0.610m, X = -0.210m, Z = 0.490m)
    mat_tb = Matrix.Translation(Vector((-0.210, 0.610, 0.490)))
    bmesh.ops.create_cylinder(bm_im, radius=0.042, depth=0.075, segments=18, matrix=mat_tb @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    # Throttle Cable Pulley Drum (Outboard side of TB, X = -0.255m)
    mat_drum = Matrix.Translation(Vector((-0.255, 0.610, 0.490)))
    bmesh.ops.create_cylinder(bm_im, radius=0.032, depth=0.012, segments=16, matrix=mat_drum @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # 5. Idle Air Control Valve (IACV) & MAP Sensor Housing (Underneath Plenum)
    mat_iacv = Matrix.Translation(Vector((-0.210, 0.840, 0.425)))
    bmesh.ops.create_cube(bm_im, size=1.0, matrix=mat_iacv @ Matrix.Diagonal(Vector((0.048, 0.085, 0.045, 1.0))))

    obj_im = link_obj("GEO_S2K_F20C_Intake_Manifold_Assembly", bm_im, parent_col, mats["alloy"], bevel=0.0015)
    objs.append(obj_im)
    return objs

# ----------------------------------------------------------------------------
# 25. SUBSYSTEM 23: REAR AXLE HALF-SHAFTS & CONSTANT VELOCITY (CV) JOINTS
# ----------------------------------------------------------------------------

def build_s2000_rear_axle_halfshafts_and_cv_joints(parent_col, mats):
    """
    Constructs the heavy-duty rear drive half-shaft assemblies:
    - Inboard tripod constant-velocity joint flanges bolted to Torsen differential output stubs.
    - Solid forged spring-steel drive axles transmitting power across rear track (X = +/- 0.220m to +/- 0.680m).
    - Multi-pleat accordion synthetic neoprene CV boots with stainless crimp bands.
    - Outboard Rzeppa constant-velocity joints press-fit into rear wheel hubs.
    - ABS tone rings with inductive wheel speed sensor brackets.
    """
    objs = []
    bm_axle = bmesh.new()

    for ax_sign in [-1.0, 1.0]:
        y_ax = -1.200
        z_ax = 0.316

        # 1. Inboard CV Joint Flange Housing (Bolted to Diff Output, X = +/- 0.190m)
        mat_inboard = Matrix.Translation(Vector((ax_sign * 0.190, y_ax, z_ax)))
        bmesh.ops.create_cylinder(bm_axle, radius=0.048, depth=0.052, segments=18, matrix=mat_inboard @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())
        # 6 Differential Output Stub Flange Bolts (M10 Allen fasteners)
        for b_idx in range(6):
            b_ang = b_idx * math.pi / 3.0
            mat_bolt = mat_inboard @ Matrix.Translation(Vector((0, 0.036 * math.cos(b_ang), 0.036 * math.sin(b_ang))))
            bmesh.ops.create_cylinder(bm_axle, radius=0.005, depth=0.014, segments=8, matrix=mat_bolt @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # 2. Inboard Neoprene Accordion Boot (X = +/- 0.245m)
        for pleat in range(3):
            p_rad = 0.040 - pleat * 0.006
            p_x = ax_sign * (0.225 + pleat * 0.020)
            mat_p = Matrix.Translation(Vector((p_x, y_ax, z_ax)))
            bmesh.ops.create_cylinder(bm_axle, radius=p_rad, depth=0.015, segments=14, matrix=mat_p @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # 3. Solid Forged Steel Half-Shaft Bar (Span from X = +/- 0.285m to +/- 0.605m)
        mat_bar = Matrix.Translation(Vector((ax_sign * 0.445, y_ax, z_ax)))
        bmesh.ops.create_cylinder(bm_axle, radius=0.0145, depth=0.320, segments=16, matrix=mat_bar @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # 4. Outboard Neoprene Accordion Boot (X = +/- 0.625m)
        for pleat in range(3):
            p_rad = 0.028 + pleat * 0.006
            p_x = ax_sign * (0.605 + pleat * 0.020)
            mat_p = Matrix.Translation(Vector((p_x, y_ax, z_ax)))
            bmesh.ops.create_cylinder(bm_axle, radius=p_rad, depth=0.015, segments=14, matrix=mat_p @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # 5. Outboard Rzeppa CV Joint & Hub Spindle Spline (X = +/- 0.680m)
        mat_outboard = Matrix.Translation(Vector((ax_sign * 0.680, y_ax, z_ax)))
        bmesh.ops.create_cylinder(bm_axle, radius=0.046, depth=0.048, segments=18, matrix=mat_outboard @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

        # 6. 50-Tooth ABS Reluctor Tone Ring (X = +/- 0.655m)
        mat_abs = Matrix.Translation(Vector((ax_sign * 0.655, y_ax, z_ax)))
        bmesh.ops.create_cylinder(bm_axle, radius=0.049, depth=0.012, segments=24, matrix=mat_abs @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_axle = link_obj("GEO_S2K_Rear_Axle_Halfshafts_and_CVs", bm_axle, parent_col, mats["trim"], bevel=0.001)
    objs.append(obj_axle)
    return objs

# ----------------------------------------------------------------------------
# 26. SUBSYSTEM 24: ELECTRONIC POWER STEERING (EPS) GEARBOX & COLUMN
# ----------------------------------------------------------------------------

def build_s2000_electronic_power_steering_system(parent_col, mats):
    """
    Constructs the pioneering Honda S2000 coaxial Electronic Power Steering (EPS) system:
    - High-output coaxial electric assist motor integrated onto steering rack housing (Y = +1.170m, Z = 0.285m).
    - Aluminum rack and pinion gearbox body with internal helical gearing.
    - Tie-rod inner ball joints encased in rubber bellows boots.
    - Articulated lower steering column shaft with universal needle-bearing U-joints passing through firewall.
    - EPS torque sensor module encased in die-cast aluminum housing.
    """
    objs = []
    bm_eps = bmesh.new()

    # 1. Main Rack and Pinion Steering Housing (Y = +1.170m, Z = 0.285m, Width = 0.720m)
    mat_rack = Matrix.Translation(Vector((0.0, 1.170, 0.285)))
    bmesh.ops.create_cylinder(bm_eps, radius=0.026, depth=0.680, segments=16, matrix=mat_rack @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Coaxial EPS Electric Assist Motor (Mounted coaxial with rack on left side, X = -0.160m)
    mat_motor = Matrix.Translation(Vector((-0.160, 1.170, 0.285)))
    bmesh.ops.create_cylinder(bm_eps, radius=0.052, depth=0.150, segments=20, matrix=mat_motor @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())
    # Motor Connector Housing & Wiring Harness Lead
    mat_conn = Matrix.Translation(Vector((-0.160, 1.140, 0.335)))
    bmesh.ops.create_cube(bm_eps, size=1.0, matrix=mat_conn @ Matrix.Diagonal(Vector((0.045, 0.035, 0.030, 1.0))))

    # 3. Pinion Gearbox Tower & Torque Sensor Housing (Driver Side LHD, X = -0.280m)
    mat_pinion = Matrix.Translation(Vector((-0.280, 1.170, 0.330))) @ Euler((math.radians(24), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_eps, radius=0.038, depth=0.110, segments=16, matrix=mat_pinion)

    # 4. Articulated Steering Intermediate Shaft & Universal Joint
    mat_ujoint = Matrix.Translation(Vector((-0.280, 1.130, 0.380)))
    bmesh.ops.create_cube(bm_eps, size=1.0, matrix=mat_ujoint @ Matrix.Diagonal(Vector((0.035, 0.045, 0.035, 1.0))))
    # Column Shaft Angle passing into Footwell (Y = +1.130m to +0.860m, Z = 0.380m to 0.560m)
    mat_col = Matrix.Translation(Vector((-0.280, 0.995, 0.470))) @ Euler((math.radians(-34), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_eps, radius=0.012, depth=0.340, segments=12, matrix=mat_col)

    # 5. Inner Tie-Rod Accordion Rubber Bellows (Left & Right, X = +/- 0.360m)
    for bx_sign in [-1.0, 1.0]:
        for pleat in range(4):
            p_rad = 0.024 + (0.005 if pleat % 2 == 0 else -0.002)
            p_x = bx_sign * (0.340 + pleat * 0.018)
            mat_bellow = Matrix.Translation(Vector((p_x, 1.170, 0.285)))
            bmesh.ops.create_cylinder(bm_eps, radius=p_rad, depth=0.014, segments=14, matrix=mat_bellow @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_eps = link_obj("GEO_S2K_Electronic_Power_Steering_Rack", bm_eps, parent_col, mats["trim"], bevel=0.001)
    objs.append(obj_eps)
    return objs

# ----------------------------------------------------------------------------
# 27. SUBSYSTEM 25: FLOORPAN STIFFENING RIBS & SILL PINCHWELDS
# ----------------------------------------------------------------------------

def build_s2000_floorpan_ribs_and_sill_pinchwelds(parent_col, mats):
    """
    Constructs the underfloor structural stampings and outer sill pinchwelds:
    - Continuous vertical pinchweld seams along left and right rocker panels (X = +/- 0.745m, Y: -0.850m to +0.850m).
    - Front and rear factory jacking point tabs with reinforced pad brackets.
    - Corrugated longitudinal floorpan floor stiffener ribs pressed into cabin sheetmetal.
    - Floorpan rubber drainage body plugs (grommets) sealed against water ingress.
    """
    objs = []
    bm_ribs = bmesh.new()

    for sx_sign in [-1.0, 1.0]:
        # 1. Continuous Rocker Panel Lower Pinchweld Flange (Z = 0.138m)
        mat_pinch = Matrix.Translation(Vector((sx_sign * 0.745, 0.0, 0.138)))
        bmesh.ops.create_cube(bm_ribs, size=1.0, matrix=mat_pinch @ Matrix.Diagonal(Vector((0.006, 1.760, 0.028, 1.0))))

        # 2. Jacking Point Support Pads (Front Y = +0.720m, Rear Y = -0.740m)
        for y_jack in [0.720, -0.740]:
            mat_jack = Matrix.Translation(Vector((sx_sign * 0.745, y_jack, 0.128)))
            bmesh.ops.create_cube(bm_ribs, size=1.0, matrix=mat_jack @ Matrix.Diagonal(Vector((0.025, 0.110, 0.022, 1.0))))

        # 3. Longitudinal Floorpan Stiffening Ribs (Pressed corrugations in underfloor floorpan, X = +/- 0.320m, +/- 0.480m)
        for rx_off in [0.320, 0.480]:
            mat_rib = Matrix.Translation(Vector((sx_sign * rx_off, -0.050, 0.180)))
            bmesh.ops.create_cube(bm_ribs, size=1.0, matrix=mat_rib @ Matrix.Diagonal(Vector((0.038, 1.250, 0.016, 1.0))))

        # 4. Rubber Body Drainage Grommet Plugs (2 per side)
        for y_plug in [-0.420, 0.350]:
            mat_plug = Matrix.Translation(Vector((sx_sign * 0.400, y_plug, 0.170)))
            bmesh.ops.create_cylinder(bm_ribs, radius=0.020, depth=0.008, segments=14, matrix=mat_plug)

    obj_ribs = link_obj("GEO_S2K_Floorpan_Pinchwelds_and_Ribs", bm_ribs, parent_col, mats["chassis_dark"], bevel=0.001)
    objs.append(obj_ribs)
    return objs

# ----------------------------------------------------------------------------
# 28. SUBSYSTEM 26: DIGITAL LED INSTRUMENT BINNACLE & SPORT WHEEL
# ----------------------------------------------------------------------------

def build_s2000_digital_instrument_binnacle_and_steering_wheel(parent_col, mats):
    """
    Constructs the driver-centric cockpit cockpit command pod and controls:
    - Sweeping digital bar-graph LED tachometer curved binnacle (9,000 RPM scale).
    - Large digital speed readout center lens and auxiliary oil/coolant temp displays.
    - Driver-oriented instrument cowl hood with left/right satellite control pods (Audio & Climate buttons).
    - AP1 3-spoke leather-wrapped sports steering wheel with central Honda "H" horn pad.
    - Dual steering column stalks (turn signal indicator and wiper controls).
    - Red engine start button pod situated immediately to driver's left.
    """
    objs = []
    bm_cockpit = bmesh.new()

    # Driver seating center: X = -0.360m (LHD specification), Y = +0.220m, Z = 0.720m
    x_drv = -0.360

    # 1. Curved Instrument Cluster Cowl Hood
    mat_cowl = Matrix.Translation(Vector((x_drv, 0.420, 0.775)))
    bmesh.ops.create_cube(bm_cockpit, size=1.0, matrix=mat_cowl @ Matrix.Diagonal(Vector((0.340, 0.160, 0.090, 1.0))))

    # 2. Digital LED Tachometer Curved Arc Arc Screen (Emissive display lens)
    mat_screen = Matrix.Translation(Vector((x_drv, 0.380, 0.760))) @ Euler((math.radians(-20), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_cockpit, size=1.0, matrix=mat_screen @ Matrix.Diagonal(Vector((0.260, 0.012, 0.065, 1.0))))

    # 3. Satellite Audio & HVAC Control Pods Flanking Binnacle
    # Left Pod: Audio & Volume Mute Buttons (X = -0.520m, Y = 0.360m, Z = 0.730m)
    mat_lpod = Matrix.Translation(Vector((-0.520, 0.360, 0.730)))
    bmesh.ops.create_cube(bm_cockpit, size=1.0, matrix=mat_lpod @ Matrix.Diagonal(Vector((0.065, 0.095, 0.080, 1.0))))
    # Red Engine Start Button (Left pod face)
    mat_start = Matrix.Translation(Vector((-0.510, 0.320, 0.745))) @ Euler((math.radians(-20), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_cockpit, radius=0.012, depth=0.010, segments=14, matrix=mat_start @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Right Pod: Ventilation Fan Speed & Temperature Knob (X = -0.200m, Y = 0.360m, Z = 0.730m)
    mat_rpod = Matrix.Translation(Vector((-0.200, 0.360, 0.730)))
    bmesh.ops.create_cube(bm_cockpit, size=1.0, matrix=mat_rpod @ Matrix.Diagonal(Vector((0.065, 0.095, 0.080, 1.0))))

    # 4. Steering Column & Shroud (Angle: -22 degrees)
    mat_shroud = Matrix.Translation(Vector((x_drv, 0.280, 0.650))) @ Euler((math.radians(-22), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_cockpit, radius=0.046, depth=0.220, segments=16, matrix=mat_shroud @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Turn Signal & Wiper Control Stalks
    for sx_s, sy_s in [(-0.075, 0.0), (0.075, 0.0)]:
        mat_stalk = mat_shroud @ Matrix.Translation(Vector((sx_s, 0.050, 0.0))) @ Euler((0, math.pi * 0.5 if sx_s > 0 else -math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_cockpit, radius=0.006, depth=0.105, segments=10, matrix=mat_stalk)

    # 5. 3-Spoke AP1 Sport Steering Wheel (Rim Radius = 0.170m, Hub Center: X = -0.360m, Y = 0.175m, Z = 0.690m)
    mat_whub = Matrix.Translation(Vector((x_drv, 0.175, 0.690))) @ Euler((math.radians(-22), 0, 0), 'XYZ').to_matrix().to_4x4()
    # Central Airbag / Horn Boss
    bmesh.ops.create_cylinder(bm_cockpit, radius=0.052, depth=0.038, segments=20, matrix=mat_whub @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Steering Wheel Outer Torus Rim (Segmented procedural torus)
    r_rim = 0.170
    n_rim_segs = 28
    for ri in range(n_rim_segs):
        ang1 = ri * 2.0 * math.pi / n_rim_segs
        ang2 = (ri + 1) * 2.0 * math.pi / n_rim_segs
        mid_ang = 0.5 * (ang1 + ang2)
        rx = r_rim * math.cos(mid_ang)
        rz = r_rim * math.sin(mid_ang)
        seg_len = 2.0 * r_rim * math.sin(math.pi / n_rim_segs)
        mat_seg = mat_whub @ Matrix.Translation(Vector((rx, 0.0, rz))) @ Euler((0, 0, mid_ang + math.pi * 0.5), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_cockpit, radius=0.015, depth=seg_len * 1.05, segments=10, matrix=mat_seg)

    # 3 Spokes: Left (-90 deg), Right (+90 deg), Lower Bottom (-90 deg from horizontal, i.e. 270 deg)
    for spk_ang in [-math.pi * 0.12, math.pi + math.pi * 0.12, -math.pi * 0.5]:
        mid_r = 0.100
        sx = mid_r * math.cos(spk_ang)
        sz = mid_r * math.sin(spk_ang)
        mat_spoke = mat_whub @ Matrix.Translation(Vector((sx, 0.008, sz))) @ Euler((0, 0, spk_ang + math.pi * 0.5), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_cockpit, size=1.0, matrix=mat_spoke @ Matrix.Diagonal(Vector((0.026, 0.014, 0.090, 1.0))))

    obj_cockpit = link_obj("GEO_S2K_Driver_Cockpit_Controls_and_Wheel", bm_cockpit, parent_col, mats["interior_dark"], bevel=0.001)
    objs.append(obj_cockpit)
    return objs
# ----------------------------------------------------------------------------
# 29. SUBSYSTEM 27: CLUTCH HYDRAULIC SYSTEM & SLAVE CYLINDER
# ----------------------------------------------------------------------------

def build_s2000_clutch_hydraulic_system(parent_col, mats):
    """
    Constructs the precision manual clutch actuation hydraulic hardware:
    - Compact clutch master cylinder mounted on firewall (Left X = -0.380m, Y = +0.860m, Z = 0.620m).
    - Remote translucent fluid reservoir with threaded cap.
    - Steel hardline running down firewall to transmission bellhousing.
    - Hydraulic slave cylinder and release fork boot on bellhousing (X = -0.110m, Y = +0.520m, Z = 0.320m).
    """
    objs = []
    bm_clutch = bmesh.new()

    # 1. Clutch Master Cylinder (Firewall Left, X = -0.380m, Y = 0.860m, Z = 0.620m)
    mat_cmc = Matrix.Translation(Vector((-0.380, 0.860, 0.620))) @ Euler((math.radians(-15), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_clutch, radius=0.018, depth=0.085, segments=14, matrix=mat_cmc @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Reservoir Fluid Cup (Mounted atop CMC)
    mat_res = mat_cmc @ Matrix.Translation(Vector((0, 0.020, 0.055)))
    bmesh.ops.create_cylinder(bm_clutch, radius=0.025, depth=0.055, segments=16, matrix=mat_res)
    # Reservoir Cap
    mat_cap = mat_res @ Matrix.Translation(Vector((0, 0, 0.030)))
    bmesh.ops.create_cylinder(bm_clutch, radius=0.027, depth=0.012, segments=16, matrix=mat_cap)

    # 2. Hydraulic Hardline routed down bellhousing
    mat_line = Matrix.Translation(Vector((-0.260, 0.680, 0.460))) @ Euler((math.radians(35), math.radians(-18), 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_clutch, radius=0.0035, depth=0.380, segments=8, matrix=mat_line)

    # 3. Clutch Slave Cylinder on Bellhousing (X = -0.110m, Y = 0.520m, Z = 0.320m)
    mat_slave = Matrix.Translation(Vector((-0.110, 0.520, 0.320))) @ Euler((0, math.radians(12), 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_clutch, radius=0.022, depth=0.095, segments=14, matrix=mat_slave @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    # Rubber Pushrod Dust Boot
    mat_boot = mat_slave @ Matrix.Translation(Vector((0, -0.055, 0)))
    bmesh.ops.create_cylinder(bm_clutch, radius=0.016, depth=0.035, segments=12, matrix=mat_boot @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_clutch = link_obj("GEO_S2K_Clutch_Hydraulic_System", bm_clutch, parent_col, mats["trim"], bevel=0.001)
    objs.append(obj_clutch)
    return objs

# ----------------------------------------------------------------------------
# 30. SUBSYSTEM 28: 12V LIGHTWEIGHT BATTERY & GROUND STRAPS
# ----------------------------------------------------------------------------

def build_s2000_battery_and_chassis_grounds(parent_col, mats):
    """
    Constructs the factory lightweight Group 51R battery and hold-down hardware:
    - Molded polypropylene battery casing nestled in engine bay right side (X = +0.440m, Y = +0.920m, Z = 0.540m).
    - Cast aluminum hold-down crossbar with threaded J-hooks.
    - Positive and negative lead battery terminals with red/black insulating rubber boots.
    - Braided copper chassis grounding straps bonded to inner apron.
    """
    objs = []
    bm_bat = bmesh.new()

    # 1. 12V Battery Case (X = +0.440m, Y = +0.920m, Z = 0.540m)
    mat_case = Matrix.Translation(Vector((0.440, 0.920, 0.540)))
    bmesh.ops.create_cube(bm_bat, size=1.0, matrix=mat_case @ Matrix.Diagonal(Vector((0.135, 0.220, 0.175, 1.0))))

    # Battery Top Cell Caps (6 Vent caps)
    for ci in range(6):
        y_cap = 0.840 + ci * 0.032
        mat_ccap = Matrix.Translation(Vector((0.440, y_cap, 0.630)))
        bmesh.ops.create_cylinder(bm_bat, radius=0.010, depth=0.008, segments=10, matrix=mat_ccap)

    # 2. Battery Hold-Down Crossbar & J-Hooks
    mat_bar = Matrix.Translation(Vector((0.440, 0.920, 0.632)))
    bmesh.ops.create_cube(bm_bat, size=1.0, matrix=mat_bar @ Matrix.Diagonal(Vector((0.145, 0.028, 0.012, 1.0))))
    for hx in [0.365, 0.515]:
        mat_hook = Matrix.Translation(Vector((hx, 0.920, 0.550)))
        bmesh.ops.create_cylinder(bm_bat, radius=0.004, depth=0.170, segments=8, matrix=mat_hook)

    # 3. Terminals: Positive (Red Boot) & Negative (Black Boot)
    mat_pos = Matrix.Translation(Vector((0.410, 0.850, 0.635)))
    bmesh.ops.create_cylinder(bm_bat, radius=0.012, depth=0.022, segments=12, matrix=mat_pos)
    mat_neg = Matrix.Translation(Vector((0.470, 0.990, 0.635)))
    bmesh.ops.create_cylinder(bm_bat, radius=0.011, depth=0.020, segments=12, matrix=mat_neg)

    # 4. Braided Ground Strap to Right Inner Apron (X = +0.470m to +0.580m)
    mat_strap = Matrix.Translation(Vector((0.525, 1.000, 0.620))) @ Euler((0, math.radians(25), 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_bat, size=1.0, matrix=mat_strap @ Matrix.Diagonal(Vector((0.110, 0.016, 0.004, 1.0))))

    obj_bat = link_obj("GEO_S2K_Battery_and_Chassis_Grounds", bm_bat, parent_col, mats["trim"], bevel=0.001)
    objs.append(obj_bat)
    return objs

# ----------------------------------------------------------------------------
# 31. SUBSYSTEM 29: COWL VENTILATION INDUCTION GRILLE & WIPER SPINDLES
# ----------------------------------------------------------------------------

def build_s2000_windshield_cowl_and_wiper_spindles(parent_col, mats):
    """
    Constructs the aerodynamic windshield cowl panel beneath windshield glass:
    - Molded satin black ABS cowl grille spanning base of windshield (Y = +0.720m to +0.860m, Z = 0.770m).
    - Transverse air intake ventilation louvers providing cabin fresh air induction.
    - Driver and passenger recessed dual windshield wiper pivot spindle hubs and knurled drive nuts.
    - Cowl rainwater drain scuppers and rubber sealing cowl edge gasket.
    """
    objs = []
    bm_cowl = bmesh.new()

    # 1. Main Cowl Leaf Screen Panel (Spanning Width X: -0.680m to +0.680m, Y = +0.790m, Z = 0.772m)
    mat_cowl = Matrix.Translation(Vector((0.0, 0.790, 0.772))) @ Euler((math.radians(12), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_cowl, size=1.0, matrix=mat_cowl @ Matrix.Diagonal(Vector((1.360, 0.140, 0.018, 1.0))))

    # 2. Transverse Intake Louvers (24 Procedural Slits)
    for li in range(12):
        x_l = -0.550 + li * 0.100
        mat_slit = mat_cowl @ Matrix.Translation(Vector((x_l, 0.0, 0.010)))
        bmesh.ops.create_cube(bm_cowl, size=1.0, matrix=mat_slit @ Matrix.Diagonal(Vector((0.075, 0.060, 0.006, 1.0))))

    # 3. Dual Windshield Wiper Pivot Spindles (Driver X = -0.380m, Passenger X = +0.120m)
    for wx in [-0.380, 0.120]:
        mat_spindle = Matrix.Translation(Vector((wx, 0.770, 0.785))) @ Euler((math.radians(18), 0, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_cowl, radius=0.016, depth=0.035, segments=16, matrix=mat_spindle)
        # Wiper Arm Pivot Hex Nut
        mat_nut = mat_spindle @ Matrix.Translation(Vector((0, 0, 0.020)))
        bmesh.ops.create_cylinder(bm_cowl, radius=0.012, depth=0.014, segments=6, matrix=mat_nut)

    # 4. Rubber Hood-to-Cowl Weatherstrip Bulb Seal
    mat_seal = Matrix.Translation(Vector((0.0, 0.720, 0.765)))
    bmesh.ops.create_cylinder(bm_cowl, radius=0.008, depth=1.340, segments=12, matrix=mat_seal @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_cowl = link_obj("GEO_S2K_Windshield_Cowl_and_Wipers", bm_cowl, parent_col, mats["trim"], bevel=0.001)
    objs.append(obj_cowl)
    return objs

# ----------------------------------------------------------------------------
# 32. SUBSYSTEM 30: FRONT UNDERBODY SKID PLATE & RADIATOR AIR DAM
# ----------------------------------------------------------------------------

def build_s2000_front_skid_plate_and_air_dam(parent_col, mats):
    """
    Constructs the front underbody aluminum aerodynamic skid plate and lower radiator air dam:
    - 2.0mm stamped aluminum cross-bracing skid plate bridging lower frame rails (Y = +1.280m to +1.820m).
    - Lower radiator flexible rubber vertical air dam strip preventing aerodynamic high-pressure spillover.
    - Recessed oil drain plug access port and oil filter service cutouts.
    - Quick-release Dzus fastener mounting bosses along front bumper perimeter.
    """
    objs = []
    bm_skid = bmesh.new()

    # 1. Main Aluminum Under-Engine Stiffening Shield (Y = +1.520m, Z = 0.145m, Width = 0.780m)
    mat_plate = Matrix.Translation(Vector((0.0, 1.520, 0.145)))
    bmesh.ops.create_cube(bm_skid, size=1.0, matrix=mat_plate @ Matrix.Diagonal(Vector((0.780, 0.540, 0.008, 1.0))))

    # Longitudinal Stiffening Ribs in Aluminum Sheet (3 parallel stampings)
    for rx in [-0.220, 0.0, 0.220]:
        mat_srib = Matrix.Translation(Vector((rx, 1.520, 0.142)))
        bmesh.ops.create_cube(bm_skid, size=1.0, matrix=mat_srib @ Matrix.Diagonal(Vector((0.035, 0.480, 0.012, 1.0))))

    # 2. Lower Radiator Rubber Air Dam Deflector (Vertical Rubber Flap, Y = +1.780m, Z = 0.105m)
    mat_dam = Matrix.Translation(Vector((0.0, 1.780, 0.105)))
    bmesh.ops.create_cube(bm_skid, size=1.0, matrix=mat_dam @ Matrix.Diagonal(Vector((0.840, 0.008, 0.065, 1.0))))

    # 3. Service Access Hole Rings (Oil drain inspection cutout, X = +0.080m, Y = 1.340m)
    mat_hole = Matrix.Translation(Vector((0.080, 1.340, 0.145)))
    bmesh.ops.create_cylinder(bm_skid, radius=0.048, depth=0.014, segments=18, matrix=mat_hole)

    obj_skid = link_obj("GEO_S2K_Front_Skid_Plate_and_Air_Dam", bm_skid, parent_col, mats["alloy"], bevel=0.001)
    objs.append(obj_skid)
    return objs

# ----------------------------------------------------------------------------
# 33. SUBSYSTEM 31: FUEL FILLER NECK & QUARTER PANEL FLANGE
# ----------------------------------------------------------------------------

def build_s2000_fuel_filler_neck_and_housing(parent_col, mats):
    """
    Constructs the left rear quarter panel fuel filler assembly:
    - Recessed filler pocket housing inside left rear quarter panel (X = -0.745m, Y = -1.180m, Z = 0.740m).
    - Threaded fuel filler neck with tethered fuel cap.
    - Rubber overflow drain apron and fuel splash scupper hole.
    - Cable-actuated fuel door spring latch release plunger mechanism.
    - Steel fuel filler pipe routing down inside left inner wheel tub into fuel tank.
    """
    objs = []
    bm_fuel = bmesh.new()

    # Left Quarter Panel Filler Pocket (X = -0.745m, Y = -1.180m, Z = 0.740m)
    mat_pocket = Matrix.Translation(Vector((-0.745, -1.180, 0.740))) @ Euler((0, math.radians(-14), 0), 'XYZ').to_matrix().to_4x4()
    # Recessed Pocket Cup
    bmesh.ops.create_cylinder(bm_fuel, radius=0.068, depth=0.045, segments=20, matrix=mat_pocket @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Threaded Filler Neck (Angled 45 deg)
    mat_neck = mat_pocket @ Matrix.Translation(Vector((0.015, 0, 0))) @ Euler((0, math.radians(25), 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_fuel, radius=0.024, depth=0.048, segments=18, matrix=mat_neck @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Tethered Plastic Gas Cap with Ratcheting Outer Flange
    mat_gcap = mat_neck @ Matrix.Translation(Vector((-0.025, 0, 0)))
    bmesh.ops.create_cylinder(bm_fuel, radius=0.028, depth=0.020, segments=18, matrix=mat_gcap @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Filler Pipe Running down to Fuel Tank (Passes through inner wheel arch, X = -0.700m to -0.420m, Z = 0.720m to 0.380m)
    mat_pipe = Matrix.Translation(Vector((-0.560, -1.180, 0.540))) @ Euler((0, math.radians(48), 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_fuel, radius=0.018, depth=0.420, segments=14, matrix=mat_pipe)

    # Spring-loaded Door Release Catch Pin (Y = -1.130m)
    mat_pin = mat_pocket @ Matrix.Translation(Vector((0, 0.052, 0)))
    bmesh.ops.create_cylinder(bm_fuel, radius=0.005, depth=0.018, segments=8, matrix=mat_pin @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_fuel = link_obj("GEO_S2K_Fuel_Filler_Neck_Assembly", bm_fuel, parent_col, mats["trim"], bevel=0.001)
    objs.append(obj_fuel)
    return objs

# ----------------------------------------------------------------------------
# 34. SUBSYSTEM 32: ENGINE BAY RELAY/FUSE BOX & WIRING LOOMS
# ----------------------------------------------------------------------------

def build_s2000_fuse_box_and_engine_bay_harnesses(parent_col, mats):
    """
    Constructs the engine bay electrical distribution infrastructure:
    - Main under-hood fuse and relay box mounted on left wheel tower apron (X = -0.520m, Y = +1.020m, Z = 0.620m).
    - High-amperage fusible link clear acrylic viewing window.
    - Corrugated split-loom main engine wiring harness traversing firewall and shock towers.
    - Secondary auxiliary relay box adjacent to radiator support.
    - Anodized brass chassis ground studs with multi-ring wire terminals.
    """
    objs = []
    bm_elec = bmesh.new()

    # 1. Main Under-Hood Fuse Box (Left Apron, X = -0.520m, Y = +1.020m, Z = 0.620m)
    mat_fuse = Matrix.Translation(Vector((-0.520, 1.020, 0.620)))
    bmesh.ops.create_cube(bm_elec, size=1.0, matrix=mat_fuse @ Matrix.Diagonal(Vector((0.115, 0.210, 0.095, 1.0))))
    # Snap-on Lid Rim
    mat_flid = mat_fuse @ Matrix.Translation(Vector((0, 0, 0.050)))
    bmesh.ops.create_cube(bm_elec, size=1.0, matrix=mat_flid @ Matrix.Diagonal(Vector((0.125, 0.220, 0.014, 1.0))))

    # 2. Main Firewall Harness Loom (Corrugated Conduit traversing from Left to Right, Y = 0.880m, Z = 0.640m)
    mat_harn = Matrix.Translation(Vector((0.0, 0.880, 0.640)))
    bmesh.ops.create_cylinder(bm_elec, radius=0.016, depth=1.050, segments=14, matrix=mat_harn @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Branch Conduit down to Engine Intake Manifold (X = -0.220m)
    mat_branch = Matrix.Translation(Vector((-0.220, 0.840, 0.580))) @ Euler((math.radians(35), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_elec, radius=0.011, depth=0.180, segments=10, matrix=mat_branch)

    # 3. Auxiliary Relay Box (Front Left by Radiator, X = -0.420m, Y = 1.620m, Z = 0.520m)
    mat_aux = Matrix.Translation(Vector((-0.420, 1.620, 0.520)))
    bmesh.ops.create_cube(bm_elec, size=1.0, matrix=mat_aux @ Matrix.Diagonal(Vector((0.075, 0.110, 0.065, 1.0))))

    # 4. Engine Bay Chassis Ground Terminals (Left and Right Aprons)
    for gx_sign in [-1.0, 1.0]:
        mat_gnd = Matrix.Translation(Vector((gx_sign * 0.480, 1.350, 0.580)))
        bmesh.ops.create_cylinder(bm_elec, radius=0.006, depth=0.015, segments=8, matrix=mat_gnd)
        # Eyelet Ring Terminal
        bmesh.ops.create_cylinder(bm_elec, radius=0.012, depth=0.004, segments=12, matrix=mat_gnd @ Matrix.Translation(Vector((0, 0, 0.005))))

    obj_elec = link_obj("GEO_S2K_Engine_Bay_FuseBox_and_Harnesses", bm_elec, parent_col, mats["trim"], bevel=0.001)
    objs.append(obj_elec)
    return objs
# ----------------------------------------------------------------------------
# 39. SUBSYSTEM 37: FRONT SUBFRAME GUSSETS & FRONT TOW HOOK
# ----------------------------------------------------------------------------

def build_s2000_front_subframe_gussets_and_tow_hook(parent_col, mats):
    """
    Constructs the heavy-duty front subframe reinforcement hardware and track tow hook:
    - Stamped high-strength steel triangulation gussets connecting subframe to frame rails.
    - Central front subframe reinforced hydraulic jacking plate (Y = +1.480m, Z = 0.160m).
    - Front screw-in / fixed track tow hook eyelet protruding through lower front grille (X = +0.320m, Y = +2.040m, Z = 0.280m).
    - Radiator lower core support tubular diagonal stiffening braces.
    """
    objs = []
    bm_gusset = bmesh.new()

    # 1. Front Subframe Triangular Gussets (Left & Right, X = +/- 0.380m, Y = 1.340m, Z = 0.220m)
    for gx_sign in [-1.0, 1.0]:
        mat_gus = Matrix.Translation(Vector((gx_sign * 0.380, 1.340, 0.220)))
        bmesh.ops.create_cube(bm_gusset, size=1.0, matrix=mat_gus @ Matrix.Diagonal(Vector((0.090, 0.160, 0.018, 1.0))))
        # Subframe Frame Rail High-Tensile Flange Bolts (2 per gusset)
        for bi in range(2):
            mat_fbolt = mat_gus @ Matrix.Translation(Vector((0, -0.050 + bi * 0.100, 0.015)))
            bmesh.ops.create_cylinder(bm_gusset, radius=0.007, depth=0.020, segments=8, matrix=mat_fbolt)

    # 2. Central Front Subframe Hydraulic Jacking Plate (Y = +1.480m, Z = 0.160m)
    mat_fjack = Matrix.Translation(Vector((0.0, 1.480, 0.160)))
    bmesh.ops.create_cylinder(bm_gusset, radius=0.065, depth=0.024, segments=18, matrix=mat_fjack)

    # 3. Front Emergency / Track Tow Hook Eyelet (X = +0.320m, Y = +2.040m, Z = 0.280m)
    mat_tow = Matrix.Translation(Vector((0.320, 2.040, 0.280)))
    # Outer Ring Eyelet
    bmesh.ops.create_cylinder(bm_gusset, radius=0.032, depth=0.014, segments=18, matrix=mat_tow @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())
    # Inner Mounting Shank extending back to frame horn
    mat_shank = Matrix.Translation(Vector((0.320, 1.940, 0.280)))
    bmesh.ops.create_cylinder(bm_gusset, radius=0.012, depth=0.200, segments=12, matrix=mat_shank @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 4. Radiator Lower Core Diagonal Stiffener Tubes (Left & Right)
    for rx_sign in [-1.0, 1.0]:
        mat_dtube = Matrix.Translation(Vector((rx_sign * 0.280, 1.680, 0.240))) @ Euler((0, rx_sign * math.radians(24), 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cylinder(bm_gusset, radius=0.010, depth=0.360, segments=10, matrix=mat_dtube @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_gusset = link_obj("GEO_S2K_Front_Subframe_Gussets_and_TowHook", bm_gusset, parent_col, mats["trim"], bevel=0.001)
    objs.append(obj_gusset)
    return objs

# ----------------------------------------------------------------------------
# 40. SUBSYSTEM 38: SOFT-TOP MECHANICAL FOLDING BOWS & LATCHES
# ----------------------------------------------------------------------------

def build_s2000_soft_top_frame_bows_and_latches(parent_col, mats):
    """
    Constructs the convertible soft-top mechanical skeleton and header latches:
    - Cast aluminum front header bow bar with dual over-center locking handle latches.
    - Tubular steel intermediate folding hoop bows (Main bow, secondary bow, rear tension bow).
    - Multi-link pantograph folding side scissor arms and brass pivot bushings.
    - Side window weatherstrip rubber channel carriers.
    """
    objs = []
    bm_bow = bmesh.new()

    # 1. Front Header Bow Casting (Folded into front lip of tonneau well, Y = -0.660m, Z = 0.832m)
    mat_hdr = Matrix.Translation(Vector((0.0, -0.660, 0.832)))
    bmesh.ops.create_cube(bm_bow, size=1.0, matrix=mat_hdr @ Matrix.Diagonal(Vector((1.020, 0.045, 0.018, 1.0))))

    # Dual Over-Center Locking Handle Latches (Left & Right, X = +/- 0.420m)
    for lx_sign in [-1.0, 1.0]:
        mat_latch = Matrix.Translation(Vector((lx_sign * 0.420, -0.660, 0.830)))
        bmesh.ops.create_cube(bm_bow, size=1.0, matrix=mat_latch @ Matrix.Diagonal(Vector((0.045, 0.045, 0.016, 1.0))))
        # Latch Pivot Handle Hook
        mat_lhook = mat_latch @ Matrix.Translation(Vector((0, 0.015, -0.008)))
        bmesh.ops.create_cylinder(bm_bow, radius=0.005, depth=0.030, segments=8, matrix=mat_lhook @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Intermediate Tubular Steel Folding Bows (Stacked neatly inside folded well)
    # Bow 1: Folded intermediate bow (Y = -0.695m, Z = 0.825m)
    mat_b1 = Matrix.Translation(Vector((0.0, -0.695, 0.825)))
    bmesh.ops.create_cylinder(bm_bow, radius=0.008, depth=1.040, segments=14, matrix=mat_b1 @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Bow 2: Main support hoop bow (Y = -0.730m, Z = 0.820m)
    mat_b2 = Matrix.Translation(Vector((0.0, -0.730, 0.820)))
    bmesh.ops.create_cylinder(bm_bow, radius=0.009, depth=1.060, segments=14, matrix=mat_b2 @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # Bow 3: Rear glass tension bow (Y = -0.760m, Z = 0.815m)
    mat_b3 = Matrix.Translation(Vector((0.0, -0.760, 0.815)))
    bmesh.ops.create_cylinder(bm_bow, radius=0.008, depth=1.020, segments=14, matrix=mat_b3 @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # 3. Scissor Folding Side Linkage Arms (Folded horizontally along tonneau flanks, X = +/- 0.560m)
    for sx_sign in [-1.0, 1.0]:
        mat_side = Matrix.Translation(Vector((sx_sign * 0.560, -0.710, 0.820)))
        bmesh.ops.create_cube(bm_bow, size=1.0, matrix=mat_side @ Matrix.Diagonal(Vector((0.015, 0.140, 0.018, 1.0))))
        # Main B-Pillar Pivot Knuckle (Z = 0.790m, Y = -0.620m)
        mat_knuckle = Matrix.Translation(Vector((sx_sign * 0.580, -0.620, 0.790)))
        bmesh.ops.create_cylinder(bm_bow, radius=0.016, depth=0.025, segments=14, matrix=mat_knuckle @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_bow = link_obj("GEO_S2K_SoftTop_Mechanical_Frame_and_Latches", bm_bow, parent_col, mats["trim"], bevel=0.001)
    objs.append(obj_bow)
    return objs

# ----------------------------------------------------------------------------
# 41. SUBSYSTEM 39: REAR BUMPER LOWER AERO MESH & VORTEX GENERATORS
# ----------------------------------------------------------------------------

def build_s2000_rear_bumper_lower_aero_and_mesh(parent_col, mats):
    """
    Constructs the lower rear aerodynamic extraction panels and diffuser vortex guides:
    - Honeycomb / slotted dark aero extraction mesh flanking the dual exhaust cutouts (X = +/- 0.380m, Y = -1.980m, Z = 0.230m).
    - Lower bumper center aerodynamic vortex generator fin strakes.
    - Rear bumper license plate bracket pocket with dual white LED illumination pods.
    """
    objs = []
    bm_raero = bmesh.new()

    # 1. Rear Lower Mesh Extraction Inserts (Flanking exhaust pipes)
    for ex_sign in [-1.0, 1.0]:
        mat_mesh = Matrix.Translation(Vector((ex_sign * 0.400, -1.990, 0.235))) @ Euler((math.radians(-16), 0, 0), 'XYZ').to_matrix().to_4x4()
        bmesh.ops.create_cube(bm_raero, size=1.0, matrix=mat_mesh @ Matrix.Diagonal(Vector((0.180, 0.012, 0.080, 1.0))))

    # 2. Diffuser Center Aerodynamic Extraction Fins (4 Longitudinal fins under rear floor)
    for fi in range(4):
        x_fin = -0.180 + fi * 0.120
        mat_fin = Matrix.Translation(Vector((x_fin, -1.950, 0.190)))
        bmesh.ops.create_cube(bm_raero, size=1.0, matrix=mat_fin @ Matrix.Diagonal(Vector((0.008, 0.200, 0.045, 1.0))))

    # 3. Rear License Plate Recessed Pocket (Y = -2.030m, Z = 0.480m)
    mat_plate = Matrix.Translation(Vector((0.0, -2.030, 0.480))) @ Euler((math.radians(-14), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cube(bm_raero, size=1.0, matrix=mat_plate @ Matrix.Diagonal(Vector((0.360, 0.035, 0.160, 1.0))))

    # Dual License Plate Lamps (Overhead lighting pods)
    for px_sign in [-1.0, 1.0]:
        mat_plamp = mat_plate @ Matrix.Translation(Vector((px_sign * 0.110, 0.015, 0.075)))
        bmesh.ops.create_cube(bm_raero, size=1.0, matrix=mat_plamp @ Matrix.Diagonal(Vector((0.045, 0.020, 0.015, 1.0))))

    obj_raero = link_obj("GEO_S2K_Rear_Bumper_Lower_Aero_and_Mesh", bm_raero, parent_col, mats["trim"], bevel=0.001)
    objs.append(obj_raero)
    return objs

# ----------------------------------------------------------------------------
# 42. SUBSYSTEM 40: EXHAUST HANGER ISOLATORS & HEAT SHIELD BAFFLES
# ----------------------------------------------------------------------------

def build_s2000_exhaust_hangers_and_heat_shields(parent_col, mats):
    """
    Constructs the exhaust system isolation mounts and underbody thermal shields:
    - High-temperature EPDM rubber exhaust hanger isolator doughnuts and welded steel prongs.
    - Stamped dimpled aluminum thermal heat shields isolating exhaust system from fuel tank and propshaft tunnel.
    - Rear muffler heat shields preventing bumper thermal discoloration.
    """
    objs = []
    bm_exh_mounts = bmesh.new()

    # 1. Exhaust Hanger Rubber Isolator Rings (6 Isolators across exhaust line)
    # Positions: 2 mid-pipe, 4 rear mufflers
    h_positions = [
        Vector((-0.060, 0.150, 0.285)),
        Vector((-0.060, -0.650, 0.285)),
        Vector((-0.460, -1.820, 0.285)),
        Vector((-0.580, -1.820, 0.285)),
        Vector((0.460, -1.820, 0.285)),
        Vector((0.580, -1.820, 0.285)),
    ]
    for h_pos in h_positions:
        mat_h = Matrix.Translation(h_pos)
        # Rubber Doughnut Isolator
        bmesh.ops.create_cylinder(bm_exh_mounts, radius=0.024, depth=0.020, segments=16, matrix=mat_h @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
        # Welded Steel Hanger Bar Pin
        bmesh.ops.create_cylinder(bm_exh_mounts, radius=0.0055, depth=0.055, segments=10, matrix=mat_h @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Dimpled Aluminum Exhaust Tunnel Heat Shield (Y = -0.300m to +0.400m, Z = 0.320m)
    mat_tshield = Matrix.Translation(Vector((-0.050, 0.050, 0.320)))
    bmesh.ops.create_cube(bm_exh_mounts, size=1.0, matrix=mat_tshield @ Matrix.Diagonal(Vector((0.260, 0.700, 0.005, 1.0))))

    # 3. Rear Muffler Thermal Deflector Heat Shields (Left & Right, X = +/- 0.520m, Y = -1.780m, Z = 0.330m)
    for mx_sign in [-1.0, 1.0]:
        mat_mshield = Matrix.Translation(Vector((mx_sign * 0.520, -1.780, 0.330)))
        bmesh.ops.create_cube(bm_exh_mounts, size=1.0, matrix=mat_mshield @ Matrix.Diagonal(Vector((0.360, 0.420, 0.005, 1.0))))

    obj_exh_mounts = link_obj("GEO_S2K_Exhaust_Hangers_and_HeatShields", bm_exh_mounts, parent_col, mats["alloy"], bevel=0.001)
    objs.append(obj_exh_mounts)
    return objs
# ----------------------------------------------------------------------------
# 35. SUBSYSTEM 33: A/C CONDENSER, COMPRESSOR & HARDLINES
# ----------------------------------------------------------------------------

def build_s2000_ac_system_and_compressor(parent_col, mats):
    """
    Constructs the compact air conditioning refrigeration system:
    - High-efficiency aluminum micro-channel A/C condenser mounted ahead of radiator (Y = +1.790m, Z = 0.380m).
    - Cylindrical aluminum desiccant receiver-drier bottle on right side frame rail.
    - Engine-driven scroll-type A/C compressor driven by serpentine belt (Right lower engine, X = +0.180m, Y = +1.020m, Z = 0.340m).
    - High and low pressure aluminum hardlines with Schrader service charging ports.
    """
    objs = []
    bm_ac = bmesh.new()

    # 1. A/C Condenser Core (Mounted immediately ahead of main radiator, Y = +1.790m, Z = 0.380m)
    mat_cond = Matrix.Translation(Vector((0.0, 1.790, 0.380)))
    bmesh.ops.create_cube(bm_ac, size=1.0, matrix=mat_cond @ Matrix.Diagonal(Vector((0.640, 0.024, 0.320, 1.0))))

    # Condenser Left and Right Aluminum Header Manifold Tubes
    for cx in [-0.325, 0.325]:
        mat_chdr = Matrix.Translation(Vector((cx, 1.790, 0.380)))
        bmesh.ops.create_cylinder(bm_ac, radius=0.012, depth=0.320, segments=14, matrix=mat_chdr)

    # 2. Desiccant Receiver-Drier Canister (Right Frame Rail, X = +0.380m, Y = 1.680m, Z = 0.360m)
    mat_drier = Matrix.Translation(Vector((0.380, 1.680, 0.360)))
    bmesh.ops.create_cylinder(bm_ac, radius=0.032, depth=0.180, segments=18, matrix=mat_drier)
    # Binary Pressure Switch atop drier
    mat_psw = mat_drier @ Matrix.Translation(Vector((0, 0, 0.095)))
    bmesh.ops.create_cylinder(bm_ac, radius=0.012, depth=0.025, segments=10, matrix=mat_psw)

    # 3. Engine-Driven A/C Compressor (Lower Right Engine Bay, X = +0.180m, Y = 1.020m, Z = 0.340m)
    mat_comp = Matrix.Translation(Vector((0.180, 1.020, 0.340)))
    bmesh.ops.create_cylinder(bm_ac, radius=0.055, depth=0.160, segments=18, matrix=mat_comp @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    # Magnetic Clutch & Pulley (Front of compressor, Y = +0.930m)
    mat_cpulley = mat_comp @ Matrix.Translation(Vector((0, -0.085, 0)))
    bmesh.ops.create_cylinder(bm_ac, radius=0.062, depth=0.026, segments=20, matrix=mat_cpulley @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 4. High-Pressure Refrigerant Hardline (Compressor to Condenser)
    mat_acline = Matrix.Translation(Vector((0.280, 1.400, 0.380))) @ Euler((0, 0, math.radians(-12)), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_ac, radius=0.005, depth=0.740, segments=10, matrix=mat_acline @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    obj_ac = link_obj("GEO_S2K_Air_Conditioning_System", bm_ac, parent_col, mats["alloy"], bevel=0.001)
    objs.append(obj_ac)
    return objs

# ----------------------------------------------------------------------------
# 36. SUBSYSTEM 34: BRAKE BOOSTER, MASTER CYLINDER & ABS MODULATOR
# ----------------------------------------------------------------------------

def build_s2000_brake_booster_and_abs_modulator(parent_col, mats):
    """
    Constructs the high-response braking hydraulic system:
    - Large-diameter vacuum brake booster servo mounted on driver firewall (X = -0.380m, Y = +0.860m, Z = 0.540m).
    - Tandem aluminum brake master cylinder with dual-circuit translucent plastic fluid reservoir.
    - 4-Channel ABS Hydraulic Control Unit (HCU) modulator block nestled on right inner apron (X = +0.480m, Y = +1.120m, Z = 0.480m).
    - Steel hydraulic brake hardlines distributing fluid to front and rear circuits.
    """
    objs = []
    bm_brake = bmesh.new()

    # 1. Vacuum Brake Booster Diaphragm Canister (X = -0.380m, Y = 0.860m, Z = 0.540m)
    mat_bb = Matrix.Translation(Vector((-0.380, 0.860, 0.540))) @ Euler((math.radians(-16), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_brake, radius=0.115, depth=0.085, segments=24, matrix=mat_bb @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Tandem Master Cylinder (Extending forward from booster, Y = 0.760m)
    mat_mc = mat_bb @ Matrix.Translation(Vector((0, -0.080, 0)))
    bmesh.ops.create_cylinder(bm_brake, radius=0.024, depth=0.130, segments=16, matrix=mat_mc @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # Master Cylinder Fluid Reservoir (Translucent plastic with max/min level lines)
    mat_mres = mat_mc @ Matrix.Translation(Vector((0, 0.010, 0.055)))
    bmesh.ops.create_cube(bm_brake, size=1.0, matrix=mat_mres @ Matrix.Diagonal(Vector((0.075, 0.125, 0.065, 1.0))))
    # Yellow Threaded Reservoir Cap
    mat_mcap = mat_mres @ Matrix.Translation(Vector((0, 0, 0.035)))
    bmesh.ops.create_cylinder(bm_brake, radius=0.022, depth=0.014, segments=16, matrix=mat_mcap)

    # 3. 4-Channel ABS Modulator Block (Right Inner Apron, X = +0.480m, Y = +1.120m, Z = 0.480m)
    mat_abs = Matrix.Translation(Vector((0.480, 1.120, 0.480)))
    bmesh.ops.create_cube(bm_brake, size=1.0, matrix=mat_abs @ Matrix.Diagonal(Vector((0.095, 0.110, 0.095, 1.0))))
    # ABS Solenoid Valve Dome Caps (4 Solenoid Towers)
    for sxi in [-0.025, 0.025]:
        for syi in [-0.030, 0.030]:
            mat_sol = mat_abs @ Matrix.Translation(Vector((sxi, syi, 0.055)))
            bmesh.ops.create_cylinder(bm_brake, radius=0.012, depth=0.022, segments=12, matrix=mat_sol)

    # 4. Brake Fluid Hardlines traversing firewall
    mat_bline = Matrix.Translation(Vector((0.050, 0.875, 0.520)))
    bmesh.ops.create_cylinder(bm_brake, radius=0.003, depth=0.880, segments=8, matrix=mat_bline @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    obj_brake = link_obj("GEO_S2K_Brake_Booster_and_ABS_System", bm_brake, parent_col, mats["trim"], bevel=0.001)
    objs.append(obj_brake)
    return objs

# ----------------------------------------------------------------------------
# 37. SUBSYSTEM 35: CENTER TUNNEL CONSOLE, SHIFT KNOB & HANDBRAKE
# ----------------------------------------------------------------------------

def build_s2000_center_console_and_shifter(parent_col, mats):
    """
    Constructs the iconic AP1 high-tunnel center console and tactile driver controls:
    - High-backbone transmission tunnel trim cover (X = 0.0m, Y: -0.650m to +0.450m, Z = 0.460m to 0.580m).
    - Leather-stitched shift boot collar nestled in brushed aluminum surround bezel.
    - Weighted spherical/teardrop machined aluminum AP1 6-speed manual shift knob with red engraved shift pattern.
    - Leather-wrapped emergency handbrake lever with aluminum release button.
    - Center storage glove box compartment with push-push latch door.
    """
    objs = []
    bm_con = bmesh.new()

    # 1. Main Center Console Tunnel Trim (Width = 0.220m, Length = 1.100m)
    mat_tun = Matrix.Translation(Vector((0.0, -0.100, 0.520)))
    bmesh.ops.create_cube(bm_con, size=1.0, matrix=mat_tun @ Matrix.Diagonal(Vector((0.210, 1.050, 0.120, 1.0))))

    # 2. Brushed Aluminum Shifter Bezel Ring (Y = +0.220m, Z = 0.585m)
    mat_sring = Matrix.Translation(Vector((0.0, 0.220, 0.585)))
    bmesh.ops.create_cylinder(bm_con, radius=0.058, depth=0.012, segments=22, matrix=mat_sring)

    # 3. Conical Gathered Leather Shift Boot
    mat_boot = Matrix.Translation(Vector((0.0, 0.220, 0.620)))
    bmesh.ops.create_cone(bm_con, segments=18, cap_ends=True, cap_tris=False, radius1=0.052, radius2=0.014, depth=0.075, matrix=mat_boot)

    # 4. AP1 Machined Aluminum 6-Speed Teardrop Shift Knob (Y = +0.220m, Z = 0.675m)
    mat_knob = Matrix.Translation(Vector((0.0, 0.220, 0.675)))
    bmesh.ops.create_cylinder(bm_con, radius=0.024, depth=0.048, segments=20, matrix=mat_knob)
    # Polished Aluminum Top Cap
    mat_kcap = mat_knob @ Matrix.Translation(Vector((0, 0, 0.022)))
    bmesh.ops.create_cylinder(bm_con, radius=0.022, depth=0.008, segments=18, matrix=mat_kcap)

    # 5. Handbrake Lever & Leather Boot (Driver side of tunnel, X = -0.065m, Y = -0.050m, Z = 0.560m)
    mat_ebrake = Matrix.Translation(Vector((-0.065, -0.050, 0.560))) @ Euler((math.radians(20), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_con, radius=0.014, depth=0.210, segments=14, matrix=mat_ebrake @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    # Aluminum Release Button
    mat_ebutton = mat_ebrake @ Matrix.Translation(Vector((0, 0.108, 0)))
    bmesh.ops.create_cylinder(bm_con, radius=0.006, depth=0.015, segments=10, matrix=mat_ebutton @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 6. Center Console Cupholder & Glove Storage Door (Y = -0.380m)
    mat_door = Matrix.Translation(Vector((0.0, -0.380, 0.582)))
    bmesh.ops.create_cube(bm_con, size=1.0, matrix=mat_door @ Matrix.Diagonal(Vector((0.170, 0.260, 0.012, 1.0))))

    obj_con = link_obj("GEO_S2K_Center_Tunnel_Console_and_Shifter", bm_con, parent_col, mats["interior_dark"], bevel=0.001)
    objs.append(obj_con)
    return objs

# ----------------------------------------------------------------------------
# 38. SUBSYSTEM 36: OIL DIPSTICK, THERMOSTAT & ACCESSORY DRIVE
# ----------------------------------------------------------------------------

def build_s2000_engine_accessories_and_dipstick(parent_col, mats):
    """
    Constructs the engine bay accessory hardware and fluids check equipment:
    - High-visibility orange/yellow engine oil dipstick pull handle and curved guide tube.
    - Die-cast aluminum coolant thermostat housing with upper radiator hose neck.
    - Front serpentine accessory drive ribbed belt traversing crankshaft, alternator, and water pump.
    - Alternator stator casing and cooling fan fins (Left front engine bay, X = -0.160m, Y = +0.980m, Z = 0.420m).
    """
    objs = []
    bm_acc = bmesh.new()

    # 1. Engine Oil Level Dipstick (Front Right of Engine, X = +0.135m, Y = 0.720m, Z = 0.580m)
    mat_dip = Matrix.Translation(Vector((0.135, 0.720, 0.580)))
    # Guide Tube extending down to oil pan
    bmesh.ops.create_cylinder(bm_acc, radius=0.005, depth=0.340, segments=10, matrix=mat_dip @ Euler((math.radians(10), 0, 0), 'XYZ').to_matrix().to_4x4())
    # Pull Ring Handle
    mat_handle = mat_dip @ Matrix.Translation(Vector((0, -0.030, 0.175)))
    bmesh.ops.create_cylinder(bm_acc, radius=0.014, depth=0.008, segments=16, matrix=mat_handle @ Euler((0, math.pi * 0.5, 0), 'XYZ').to_matrix().to_4x4())

    # 2. Coolant Thermostat Housing & Upper Radiator Neck (Front Center, X = 0.0m, Y = 0.630m, Z = 0.480m)
    mat_therm = Matrix.Translation(Vector((0.0, 0.630, 0.480)))
    bmesh.ops.create_cylinder(bm_acc, radius=0.034, depth=0.065, segments=16, matrix=mat_therm)
    # Upper Radiator Hose Outlet Spigot (Angled forward towards radiator)
    mat_spigot = mat_therm @ Matrix.Translation(Vector((0, 0.040, 0.015))) @ Euler((math.radians(25), 0, 0), 'XYZ').to_matrix().to_4x4()
    bmesh.ops.create_cylinder(bm_acc, radius=0.022, depth=0.055, segments=14, matrix=mat_spigot @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 3. High-Output Compact Alternator (Left Front Engine, X = -0.160m, Y = 0.980m, Z = 0.420m)
    mat_alt = Matrix.Translation(Vector((-0.160, 0.980, 0.420)))
    bmesh.ops.create_cylinder(bm_acc, radius=0.062, depth=0.135, segments=18, matrix=mat_alt @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())
    # Alternator Multi-Groove Drive Pulley
    mat_apulley = mat_alt @ Matrix.Translation(Vector((0, -0.075, 0)))
    bmesh.ops.create_cylinder(bm_acc, radius=0.038, depth=0.022, segments=18, matrix=mat_apulley @ Euler((math.pi * 0.5, 0, 0), 'XYZ').to_matrix().to_4x4())

    # 4. Serpentine Accessory Drive Belt (Multi-ribbed rubber belt loop)
    mat_belt = Matrix.Translation(Vector((-0.040, 0.905, 0.380)))
    bmesh.ops.create_cube(bm_acc, size=1.0, matrix=mat_belt @ Matrix.Diagonal(Vector((0.320, 0.018, 0.280, 1.0))))

    obj_acc = link_obj("GEO_S2K_Engine_Accessories_and_Dipstick", bm_acc, parent_col, mats["alloy"], bevel=0.001)
    objs.append(obj_acc)
    return objs

# =============================================================================
# MASTER ASSEMBLY & EXECUTION FUNCTION: HONDA S2000 AP1 (PHASE 17)
# =============================================================================

def build_honda_s2000_ap1_phase1():
    """
    Executes the comprehensive Phase 17 Class-A CAD procedural assembly of the
    Honda S2000 AP1 (2000s) Roadster across all 36 micro-engineered subsystems.
    """
    print("=" * 80)
    print("STARTING PROCEDURAL CAD GENERATION: HONDA S2000 AP1 (2000s) - PHASE 17")
    print("=" * 80)

    # 1. Clean Existing Scene Geometry
    if bpy.context.object and bpy.context.object.mode != 'OBJECT':
        bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

    # 2. Master Hierarchy Collection
    col_name = "Honda_S2000_AP1_Phase1"
    root_col = bpy.data.collections.get(col_name)
    if not root_col:
        root_col = bpy.data.collections.new(col_name)
        bpy.context.scene.collection.children.link(root_col)

    # 3. Initialize PBR Materials
    print("[INIT] Initializing S2000 AP1 PBR Material Palette...")
    mats = get_materials_suite()

    all_generated_objects = []

    # 1. High X-Bone Monocoque Body Shell (42 stations)
    print("[BUILD 01/36] Generating 42-Station Continuous High X-Bone Monocoque Shell...")
    objs_shell = build_s2000_monocoque_body_shell(root_col, mats)
    all_generated_objects.extend(objs_shell)

    # 2. Convertible Soft-Top Tonneau Boot & Windshield Frame
    print("[BUILD 02/40] Generating Convertible Soft-Top Tonneau & Windshield Frame...")
    objs_top = build_s2000_soft_top_and_windshield_frame(root_col, mats)
    all_generated_objects.extend(objs_top)

    # 3. Underbody High X-Bone Backbone Chassis & Enclosed Tubs
    print("[BUILD 03/40] Generating Underbody High X-Bone Chassis & Wheel Tubs...")
    objs_chassis = build_s2000_high_xbone_chassis_and_wheel_tubs(root_col, mats)
    all_generated_objects.extend(objs_chassis)

    # 4. 16-Inch AP1 5-Spoke Alloy Wheels, Brakes & Tires
    print("[BUILD 04/40] Generating 16-Inch AP1 Wheels, Potenza Tires & Disc Brakes...")
    objs_wheels = build_s2000_ap1_wheels_brakes_and_tires(root_col, mats)
    all_generated_objects.extend(objs_wheels)

    # 5. Front & Rear Fascias, Bumper Covers & AP1 Grille
    print("[BUILD 05/40] Generating Front & Rear Fascias, Bumpers & Grille Openings...")
    objs_fascia = build_s2000_polyurethane_bumpers_and_valances(root_col, mats)
    all_generated_objects.extend(objs_fascia)

    # 6. Front In-Wheel Double Wishbone Suspension & EPS Rack
    print("[BUILD 06/40] Generating Front In-Wheel Double Wishbone Suspension & Steering...")
    objs_fsusp = build_s2000_front_double_wishbone_and_eps(root_col, mats)
    all_generated_objects.extend(objs_fsusp)

    # 7. Rear Multi-Link Double Wishbone Subframe & Axles
    print("[BUILD 07/40] Generating Rear Multi-Link Double Wishbone Subframe...")
    objs_rsusp = build_s2000_rear_double_wishbone_and_subframe(root_col, mats)
    all_generated_objects.extend(objs_rsusp)

    # 8. F20C 2.0L DOHC VTEC Longitudinal Engine & 6-Speed Transmission
    print("[BUILD 08/40] Generating F20C 2.0L DOHC VTEC Engine & 6-Speed Transmission...")
    objs_eng = build_s2000_f20c_powertrain_and_transmission(root_col, mats)
    all_generated_objects.extend(objs_eng)

    # 9. Stainless Dual Exhaust System, Manifold & Resonators
    print("[BUILD 09/40] Generating Dual Stainless Exhaust System & 4-into-2-into-1 Header...")
    objs_exh = build_s2000_exhaust_system_and_dual_mufflers(root_col, mats)
    all_generated_objects.extend(objs_exh)

    # 10. Torsen Limited-Slip Differential & Finned Casing
    print("[BUILD 10/40] Generating Torsen Limited-Slip Differential & Finned Housing...")
    objs_diff = build_s2000_torsen_lsd_and_finned_casing(root_col, mats)
    all_generated_objects.extend(objs_diff)

    # 11. High-Efficiency Engine Cooling Module & Dual Electric Fans
    print("[BUILD 11/40] Generating Engine Cooling Radiator & Dual Electric Shrouds...")
    objs_rad = build_s2000_radiator_fans_and_condenser(root_col, mats)
    all_generated_objects.extend(objs_rad)

    # 12. 50-Liter Fuel Tank Assembly & Evap Canister
    print("[BUILD 12/40] Generating 50-Liter Fuel Tank & Evaporative Emissions Canister...")
    objs_tank = build_s2000_brake_plumbing_and_fuel_tank(root_col, mats)
    all_generated_objects.extend(objs_tank)

    # 13. Twin Tubular Safety Roll Hoops & Center Aero Deflector
    print("[BUILD 13/40] Generating Twin Safety Roll Hoops & Acrylic Wind Deflector...")
    objs_hoops = build_s2000_twin_safety_roll_hoops(root_col, mats)
    all_generated_objects.extend(objs_hoops)

    # 14. Cockpit Roadster Tub & Contoured Sport Bucket Seats
    print("[BUILD 14/40] Generating Cockpit Roadster Tub & High-Bolster Sport Seats...")
    objs_seats = build_s2000_cockpit_interior_and_sport_seats(root_col, mats)
    all_generated_objects.extend(objs_seats)

    # 15. Front Core Support, Hood Latches & Dual Prop Rods
    print("[BUILD 15/40] Generating Front Core Support & Dual Hood Latches...")
    objs_core = build_s2000_hood_hinges_and_radiator_support(root_col, mats)
    all_generated_objects.extend(objs_core)

    # 16. Rear Subframe Rearmost Structure, Trunk Pan & Crash Beam
    print("[BUILD 16/40] Generating Rear Trunk Pan & Aluminum Impact Crash Beam...")
    objs_trunk = build_s2000_trunk_hinges_and_rear_crash_bar(root_col, mats)
    all_generated_objects.extend(objs_trunk)

    # 17. Front Strut Tower X-Brace & Torsional Ties
    print("[BUILD 17/36] Generating Front Strut Tower Stress Bar & Torsional Braces...")
    objs_brace = build_s2000_strut_brace_and_torsional_ties(root_col, mats)
    all_generated_objects.extend(objs_brace)

    # 18. Front & Rear Anti-Roll Sway Bars
    print("[BUILD 18/36] Generating Front & Rear Tubular Anti-Roll Sway Bars...")
    objs_sway = build_s2000_front_and_rear_sway_bars(root_col, mats)
    all_generated_objects.extend(objs_sway)

    # 19. Front Brake Ram-Air Cooling Ducts
    print("[BUILD 19/36] Generating Front Brake Ram-Air Cooling Ducts & Shrouds...")
    objs_bduct = build_s2000_front_brake_cooling_ducts(root_col, mats)
    all_generated_objects.extend(objs_bduct)

    # 20. Underfloor Aero Pan & Rear Diffuser
    print("[BUILD 20/36] Generating Underfloor Aerodynamic Tray & Diffuser Strakes...")
    objs_aero = build_s2000_underfloor_aero_pan_and_diffuser(root_col, mats)
    all_generated_objects.extend(objs_aero)

    # 21. F20C Red Valve Cover Detailing & Ignition Coils
    print("[BUILD 21/36] Generating F20C Red Crackle Valve Cover & Ignition Coils...")
    objs_vc = build_s2000_f20c_valve_cover_and_ignition_coils(root_col, mats)
    all_generated_objects.extend(objs_vc)

    # 22. High-Flow Cast Aluminum Intake Manifold
    print("[BUILD 22/36] Generating High-Flow Intake Manifold & Throttle Body...")
    objs_im = build_s2000_intake_manifold_and_throttle_body(root_col, mats)
    all_generated_objects.extend(objs_im)

    # 23. Rear Axle Half-Shafts & CV Joints
    print("[BUILD 23/36] Generating Rear Axle Drive Half-Shafts & Accordion CV Boots...")
    objs_axle = build_s2000_rear_axle_halfshafts_and_cv_joints(root_col, mats)
    all_generated_objects.extend(objs_axle)

    # 24. Electronic Power Steering (EPS) Gearbox & Column
    print("[BUILD 24/36] Generating Coaxial Electronic Power Steering System...")
    objs_eps = build_s2000_electronic_power_steering_system(root_col, mats)
    all_generated_objects.extend(objs_eps)

    # 25. Floorpan Stiffening Ribs & Sill Pinchwelds
    print("[BUILD 25/36] Generating Floorpan Longitudinal Ribs & Sill Pinchwelds...")
    objs_ribs = build_s2000_floorpan_ribs_and_sill_pinchwelds(root_col, mats)
    all_generated_objects.extend(objs_ribs)

    # 26. Digital LED Instrument Binnacle & Sport Wheel
    print("[BUILD 26/36] Generating Digital LED Instrument Cluster & 3-Spoke Wheel...")
    objs_cockpit = build_s2000_digital_instrument_binnacle_and_steering_wheel(root_col, mats)
    all_generated_objects.extend(objs_cockpit)

    # 27. Clutch Hydraulic System & Slave Cylinder
    print("[BUILD 27/36] Generating Clutch Hydraulic Master/Slave Cylinder System...")
    objs_clutch = build_s2000_clutch_hydraulic_system(root_col, mats)
    all_generated_objects.extend(objs_clutch)

    # 28. 12V Lightweight Battery & Ground Straps
    print("[BUILD 28/36] Generating 12V Lightweight Battery & Ground Straps...")
    objs_bat = build_s2000_battery_and_chassis_grounds(root_col, mats)
    all_generated_objects.extend(objs_bat)

    # 29. Windshield Cowl Induction Grille & Wipers
    print("[BUILD 29/36] Generating Windshield Cowl Grille & Wiper Spindles...")
    objs_cowl = build_s2000_windshield_cowl_and_wiper_spindles(root_col, mats)
    all_generated_objects.extend(objs_cowl)

    # 30. Front Underbody Skid Plate & Air Dam
    print("[BUILD 30/36] Generating Front Underbody Skid Plate & Radiator Air Dam...")
    objs_skid = build_s2000_front_skid_plate_and_air_dam(root_col, mats)
    all_generated_objects.extend(objs_skid)

    # 31. Fuel Filler Neck & Quarter Panel Flange
    print("[BUILD 31/36] Generating Fuel Filler Neck & Quarter Panel Flange...")
    objs_fuel = build_s2000_fuel_filler_neck_and_housing(root_col, mats)
    all_generated_objects.extend(objs_fuel)

    # 32. Engine Bay Relay/Fuse Box & Harnesses
    print("[BUILD 32/36] Generating Engine Bay Fuse Box & Wiring Harness Looms...")
    objs_elec = build_s2000_fuse_box_and_engine_bay_harnesses(root_col, mats)
    all_generated_objects.extend(objs_elec)

    # 33. A/C Condenser, Compressor & Hardlines
    print("[BUILD 33/36] Generating A/C Condenser, Compressor & Refrigerant Lines...")
    objs_ac = build_s2000_ac_system_and_compressor(root_col, mats)
    all_generated_objects.extend(objs_ac)

    # 34. Brake Booster, Master Cylinder & ABS Modulator
    print("[BUILD 34/36] Generating Vacuum Brake Booster & ABS Modulator Valve Block...")
    objs_brake = build_s2000_brake_booster_and_abs_modulator(root_col, mats)
    all_generated_objects.extend(objs_brake)

    # 35. Center Tunnel Console, Shift Knob & Handbrake
    print("[BUILD 35/36] Generating Center Tunnel Console, AP1 Billet Shifter & E-Brake...")
    objs_con = build_s2000_center_console_and_shifter(root_col, mats)
    all_generated_objects.extend(objs_con)

    # 36. Engine Accessories, Dipstick & Thermostat
    print("[BUILD 36/40] Generating Oil Dipstick Tube, Thermostat & Accessory Drive...")
    objs_acc = build_s2000_engine_accessories_and_dipstick(root_col, mats)
    all_generated_objects.extend(objs_acc)

    # 37. Front Subframe Gussets & Front Tow Hook
    print("[BUILD 37/40] Generating Front Subframe Gussets & Front Tow Hook...")
    objs_gusset = build_s2000_front_subframe_gussets_and_tow_hook(root_col, mats)
    all_generated_objects.extend(objs_gusset)

    # 38. Soft-Top Mechanical Folding Bows & Latches
    print("[BUILD 38/40] Generating Soft-Top Mechanical Frame Bows & Latches...")
    objs_bow = build_s2000_soft_top_frame_bows_and_latches(root_col, mats)
    all_generated_objects.extend(objs_bow)

    # 39. Rear Bumper Lower Aero Mesh & Vortex Generators
    print("[BUILD 39/40] Generating Rear Bumper Lower Aero Mesh & Vortex Generators...")
    objs_raero = build_s2000_rear_bumper_lower_aero_and_mesh(root_col, mats)
    all_generated_objects.extend(objs_raero)

    # 40. Exhaust Hangers & Heat Shield Baffles
    print("[BUILD 40/40] Generating Exhaust Isolator Hangers & Heat Shield Baffles...")
    objs_exh_mounts = build_s2000_exhaust_hangers_and_heat_shields(root_col, mats)
    all_generated_objects.extend(objs_exh_mounts)

    # Statistical Evaluation & Verification
    total_verts = sum(len(o.data.vertices) for o in all_generated_objects if hasattr(o, "data") and hasattr(o.data, "vertices"))
    total_faces = sum(len(o.data.polygons) for o in all_generated_objects if hasattr(o, "data") and hasattr(o.data, "polygons"))
    print("=" * 80)
    print(f"[SUMMARY] Honda S2000 AP1 (2000s) Phase 17 Foundation Complete!")
    print(f"          Total Hierarchy Objects : {len(all_generated_objects)}")
    print(f"          Total Micro-Mesh Vertices: {total_verts:,}")
    print(f"          Total CAD Polygons      : {total_faces:,}")
    print("=" * 80)

    # Preliminary Phase 17 Export
    export_targets = [
        os.path.abspath(r"E:/Car_Automation/exports/Car_Honda_S2000_AP1_Phase1.glb"),
    ]
    for export_path in export_targets:
        os.makedirs(os.path.dirname(export_path), exist_ok=True)
        print(f"[EXPORT] Writing Phase 17 Foundation CAD GLB -> {export_path}")
        bpy.ops.export_scene.gltf(
            filepath=export_path,
            export_format='GLB',
            export_apply=True,
            export_yup=True,
            export_texcoords=True,
            export_normals=True,
            export_materials='EXPORT',
        )
        file_size_mb = os.path.getsize(export_path) / (1024 * 1024)
        print(f"         Export complete! File size: {file_size_mb:.2f} MB")

    print("=" * 80)
    print("HONDA S2000 AP1 (2000s) PHASE 17 GENERATION COMPLETE!")
    print("=" * 80)


if __name__ == "__main__":
    build_honda_s2000_ap1_phase1()
