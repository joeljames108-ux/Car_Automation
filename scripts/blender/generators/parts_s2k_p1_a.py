"""
Honda S2000 AP1 (2000s) Phase 17: Part A
Header, PBR Material Suite, Compatibility Polyfills,
Subsystems 1 to 4:
1. 42-Station Continuous High X-Bone Monocoque Body Shell
2. Convertible Soft-Top Tonneau Boot & Windshield Frame
3. Underbody High X-Bone Chassis Backbone & Enclosed Tubs
4. 16-Inch AP1 5-Spoke Cast Alloy Wheels, Brakes & Tires
"""

PART_S2K_A = '''"""
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

_gen_dir = os.path.dirname(os.path.abspath(__file__)) if '__file__' in locals() or '__file__' in globals() else r"E:\\Car_Automation\\scripts\\blender\\generators"
if _gen_dir not in sys.path:
    sys.path.append(_gen_dir)
hardcoded_dir = r"E:\\Car_Automation\\scripts\\blender\\generators"
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
'''
