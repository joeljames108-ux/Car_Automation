"""
generate_toyota_supra_a80_master_cad.py
================================================================================
CLASS-A PRODUCTION MASTER CAD GENERATOR: 1993 TOYOTA SUPRA A80 (MK4) COUPE
================================================================================
Architectural Standards & Rigorous Directives Applied:
- The 15MB+ / 650,000+ Triangle Quality Law (Target: 800,000 - 950,000+ tris).
- Minimum Grade A Production Certification (>= 90%, target 100.0%).
- 7/7 Populated Subsystems: BODY, DOORS, GLASS, AERO, LIGHTING, POWERTRAIN, CHASSIS, WHEELS, INTERIOR.
- World Coordinate Space: +Y Forward, +Z Up, +X Driver Right (LHD).
- Preserved Kinematic Pivots: Physical hinge origins on articulating doors with export_apply=False.
- 10 Semantic Audio-Haptic Hitboxes (hide_render=True) with sound_fx & haptic metadata.
- 7+ Baked NLA Actions (Action_Door_L_Open, Action_Door_R_Open, Action_Steering_Turn, 4 wheel spins).
- 4 Standardized CAMERA_* Nodes (Hero, Cockpit, Wheel, Engine).
- Principled BSDF PBR Shaders: Renaissance Red (3L2), clearcoat, optical transmission glass, chrome, high-emission optics.
- Dual-mode export: Primary GLB (>=15MB) and companion Meshopt compressed asset (.opt.glb).
"""

import bpy
import bmesh
from mathutils import Vector, Euler, Matrix, Quaternion
import math
import os
import shutil
import subprocess


# ─── 1. Scene Sanitation & Helpers ───────────────────────────────────────────
def clean_scene():
    """Purge all existing objects, meshes, materials, and collections."""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

    for b in [bpy.data.meshes, bpy.data.materials, bpy.data.textures,
              bpy.data.images, bpy.data.cameras, bpy.data.lights,
              bpy.data.actions, bpy.data.collections]:
        for item in list(b):
            b.remove(item, do_unlink=True)


def safe_face(bm, verts, mat_idx=0):
    """Safely create face if valid and non-duplicate."""
    if len(verts) < 3 or len(set(verts)) < 3:
        return None
    try:
        f = bm.faces.new(verts)
        f.material_index = mat_idx
        return f
    except ValueError:
        return None


def set_op_material(op_ret, mat_idx):
    """Assign material index to all faces linked to vertices of a bmesh operator."""
    for v in op_ret.get('verts', []):
        for f in v.link_faces:
            f.material_index = mat_idx


def create_mesh_object(name, bm, parent_col, mat=None, smooth=True, bevel_w=0.0025, subsurf_lvl=0, parent_obj=None):
    """Helper to convert BMesh to Object, apply materials and modifiers."""
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.0005)
    mesh = bpy.data.meshes.new(name + "_Mesh")
    bm.to_mesh(mesh)
    bm.free()
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)

    if mat:
        if isinstance(mat, list):
            for m in mat:
                obj.data.materials.append(m)
        else:
            obj.data.materials.append(mat)

    parent_col.objects.link(obj)

    if parent_obj:
        obj.parent = parent_obj

    if smooth:
        for poly in obj.data.polygons:
            poly.use_smooth = True

    if bevel_w > 0:
        bev = obj.modifiers.new(name="Bevel", type='BEVEL')
        bev.width = bevel_w
        bev.segments = 2
        bev.limit_method = 'ANGLE'
        bev.angle_limit = math.radians(35.0)

    if subsurf_lvl > 0:
        sub = obj.modifiers.new(name="Subsurf", type='SUBSURF')
        sub.levels = subsurf_lvl
        sub.render_levels = subsurf_lvl

    wn = obj.modifiers.new(name="WeightedNormal", type='WEIGHTED_NORMAL')
    wn.keep_sharp = True

    return obj


# ─── 2. Materials Factory ────────────────────────────────────────────────────
def build_materials():
    mats = {}

    def make_pbr(name, base_col, rough=0.2, metal=0.0, trans=0.0, ior=1.5, emission=None, emit_str=1.0, clearcoat=0.0, alpha=1.0):
        mat = bpy.data.materials.new(name)
        mat.use_nodes = True
        nodes = mat.node_tree.nodes
        links = mat.node_tree.links
        nodes.clear()

        node_out = nodes.new(type='ShaderNodeOutputMaterial')
        node_bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
        links.new(node_bsdf.outputs['BSDF'], node_out.inputs['Surface'])

        node_bsdf.inputs['Base Color'].default_value = base_col
        node_bsdf.inputs['Roughness'].default_value = rough
        node_bsdf.inputs['Metallic'].default_value = metal

        # Blender 4.0+ & 5.x Principled BSDF inputs
        if 'Transmission Weight' in node_bsdf.inputs:
            node_bsdf.inputs['Transmission Weight'].default_value = trans
        elif 'Transmission' in node_bsdf.inputs:
            node_bsdf.inputs['Transmission'].default_value = trans

        if 'Coat Weight' in node_bsdf.inputs:
            node_bsdf.inputs['Coat Weight'].default_value = clearcoat
        elif 'Clearcoat' in node_bsdf.inputs:
            node_bsdf.inputs['Clearcoat'].default_value = clearcoat

        if 'IOR' in node_bsdf.inputs:
            node_bsdf.inputs['IOR'].default_value = ior

        if alpha < 1.0:
            if 'Alpha' in node_bsdf.inputs:
                node_bsdf.inputs['Alpha'].default_value = alpha
            mat.blend_method = 'BLEND'

        if emission:
            if 'Emission Color' in node_bsdf.inputs:
                node_bsdf.inputs['Emission Color'].default_value = emission
                if 'Emission Strength' in node_bsdf.inputs:
                    node_bsdf.inputs['Emission Strength'].default_value = emit_str
            elif 'Emission' in node_bsdf.inputs:
                node_bsdf.inputs['Emission'].default_value = emission

        return mat

    # 1. Iconic Renaissance Red (3L2) Gloss Body Paint
    mats['paint_red'] = make_pbr('M_BodyPaint_RenaissanceRed', (0.82, 0.04, 0.06, 1.0), rough=0.14, metal=0.72, clearcoat=1.0)
    # 2. Satin Black Polyurethane & Trim
    mats['trim_black'] = make_pbr('M_Trim_SatinBlack', (0.04, 0.04, 0.045, 1.0), rough=0.48, metal=0.08)
    # 3. Gloss Piano Black
    mats['gloss_black'] = make_pbr('M_Gloss_Black', (0.015, 0.015, 0.018, 1.0), rough=0.08, metal=0.20, clearcoat=1.0)
    # 4. Optical Windshield & Hatch Glass
    mats['glass_clear'] = make_pbr('M_Glass_Optical', (0.92, 0.95, 0.98, 0.20), rough=0.015, metal=0.0, trans=0.96, ior=1.52, clearcoat=1.0, alpha=0.35)
    # 5. Smoked Glass / Polycarbonate Outer Headlamp Lens
    mats['glass_smoked'] = make_pbr('M_Glass_Smoked', (0.35, 0.36, 0.38, 0.30), rough=0.04, metal=0.05, trans=0.85, ior=1.52, clearcoat=1.0, alpha=0.50)
    # 6. Black Ceramic Frit Border
    mats['frit_black'] = make_pbr('M_CeramicFrit_Black', (0.012, 0.012, 0.014, 1.0), rough=0.75, metal=0.0)
    # 7. Headlight Chrome & Reflector
    mats['chrome'] = make_pbr('M_Chrome_Polished', (0.96, 0.96, 0.98, 1.0), rough=0.03, metal=0.98)
    # 8. Gunmetal Headlight Housing Bezel
    mats['gunmetal'] = make_pbr('M_Bezel_Gunmetal', (0.10, 0.11, 0.12, 1.0), rough=0.32, metal=0.85)
    # 9. Amber Turn Signal LED / Bulb
    mats['amber_light'] = make_pbr('M_Light_Amber', (1.0, 0.52, 0.02, 1.0), rough=0.08, emission=(1.0, 0.52, 0.02, 1.0), emit_str=24.0)
    # 10. Ruby Red Taillight LED / Bulb
    mats['ruby_light'] = make_pbr('M_Light_Ruby', (0.98, 0.02, 0.03, 1.0), rough=0.08, emission=(0.98, 0.02, 0.03, 1.0), emit_str=28.0)
    # 11. Reverse Light White
    mats['white_light'] = make_pbr('M_Light_Reverse', (0.96, 0.96, 1.0, 1.0), rough=0.08, emission=(0.96, 0.96, 1.0, 1.0), emit_str=30.0)
    # 12. Cast Aluminum / 17" Alloy Silver
    mats['alloy_silver'] = make_pbr('M_Alloy_Silver', (0.86, 0.87, 0.89, 1.0), rough=0.16, metal=0.94, clearcoat=0.85)
    # 13. High-Performance Tire Rubber
    mats['rubber_tire'] = make_pbr('M_Rubber_Tire', (0.035, 0.035, 0.038, 1.0), rough=0.78, metal=0.02)
    # 14. Cross-Drilled Brake Rotor Steel
    mats['rotor_steel'] = make_pbr('M_Brake_Rotor', (0.68, 0.70, 0.73, 1.0), rough=0.22, metal=0.95)
    # 15. Caliper Gloss Black
    mats['caliper_black'] = make_pbr('M_Brake_Caliper', (0.03, 0.03, 0.04, 1.0), rough=0.12, metal=0.65, clearcoat=1.0)
    # 16. Interior Charcoal Leather & Dash
    mats['interior_dark'] = make_pbr('M_Interior_Charcoal', (0.05, 0.05, 0.06, 1.0), rough=0.62, metal=0.04)
    # 17. Gauge Cluster Lit Phosphor/Orange
    mats['gauge_lit'] = make_pbr('M_Gauge_Cluster', (0.1, 0.1, 0.1, 1.0), rough=0.25, emission=(1.0, 0.42, 0.04, 1.0), emit_str=20.0)
    # 18. Engine 2JZ-GTE Metallic Block & Cam Cover
    mats['engine_iron'] = make_pbr('M_Engine_Block', (0.16, 0.18, 0.20, 1.0), rough=0.48, metal=0.82)
    mats['engine_silver'] = make_pbr('M_Engine_CamCover', (0.82, 0.84, 0.86, 1.0), rough=0.22, metal=0.92, clearcoat=0.6)
    # 19. Stainless Steel 90mm Cannon Exhaust
    mats['exhaust_pipe'] = make_pbr('M_Exhaust_Stainless', (0.90, 0.91, 0.93, 1.0), rough=0.12, metal=0.96)

    return mats


# ─── 3. Unibody & Cockpit Aperture ───────────────────────────────────────────
def build_unibody(parent_col, mats):
    """
    Class-A Procedural CAD Lofting of Toyota Supra A80 Unibody:
    - Section 1: Front Nose, Hood & Contoured Fenders (Y = 2.25m to +0.55m).
    - Section 2: Lower Rocker Sills & Open Cabin Aperture (Y = +0.55m to -0.55m).
    - Section 3: Rear Quarter Haunches with extreme Coke-bottle flare & Decklid (Y = -0.55m to -2.26m).
    - Section 4: Vertical Rear Fascia Panel with taillamp mounting recesses & exhaust cutout.
    - Section 5: Painted Renaissance Red Roof Panel, Windshield Header & C-Pillars.
    - Front bumper intercooler mouth, twin horizontal ducts, and satin black chin splitter.
    - Deep triangular side brake cooling scoops sculpted into rocker sills.
    """
    bm = bmesh.new()

    # 1. Front Nose, Hood & Fenders
    front_stations = [
        {"y": 2.250, "zf": 0.140, "zs": 0.260, "zb": 0.560, "zr": 0.600, "xs": 0.620, "xb": 0.680}, # Nose Tip
        {"y": 2.120, "zf": 0.140, "zs": 0.280, "zb": 0.620, "zr": 0.640, "xs": 0.700, "xb": 0.760}, # Headlamp Front
        {"y": 1.950, "zf": 0.140, "zs": 0.300, "zb": 0.660, "zr": 0.680, "xs": 0.760, "xb": 0.830}, # Headlamp Rear
        {"y": 1.650, "zf": 0.150, "zs": 0.320, "zb": 0.700, "zr": 0.720, "xs": 0.810, "xb": 0.865}, # Fender Forward
        {"y": 1.275, "zf": 0.150, "zs": 0.340, "zb": 0.730, "zr": 0.745, "xs": 0.835, "xb": 0.885}, # Front Axle Arch
        {"y": 0.950, "zf": 0.150, "zs": 0.300, "zb": 0.750, "zr": 0.770, "xs": 0.820, "xb": 0.870}, # Fender Aft
        {"y": 0.550, "zf": 0.150, "zs": 0.260, "zb": 0.775, "zr": 0.805, "xs": 0.805, "xb": 0.840}, # Cowl / A-Pillar Base
    ]

    for side in [1.0, -1.0]:
        grid_f = []
        for s in front_stations:
            y = s["y"]
            zf = s["zf"]
            zs = s["zs"]
            zb = s["zb"]
            zr = s["zr"]
            xs = s["xs"] * side
            xb = s["xb"] * side

            # Wheel arch clearance
            dist_f = abs(y - 1.275)
            if dist_f < 0.38:
                arch_f = math.sqrt(max(0.0, 0.38**2 - dist_f**2)) * 0.70
                zs = max(zs, 0.320 + arch_f)

            # Central 2JZ hood power bulge
            bulge = 0.025 if 0.80 < y < 2.05 else 0.0

            row = [
                bm.verts.new(Vector((0.0,            y, zf))),
                bm.verts.new(Vector((xs * 0.70,     y, zf))),
                bm.verts.new(Vector((xs,            y, zs))),
                bm.verts.new(Vector((xb * 0.98,     y, (zs + zb) * 0.50))),
                bm.verts.new(Vector((xb,            y, zb))),
                bm.verts.new(Vector((xb * 0.55,     y, (zb + zr) * 0.52 + bulge * 0.5))),
                bm.verts.new(Vector((0.0,            y, zr + bulge))),
            ]
            grid_f.append(row)

        for i in range(len(front_stations) - 1):
            for j in range(6):
                v00 = grid_f[i][j]
                v01 = grid_f[i][j+1]
                v11 = grid_f[i+1][j+1]
                v10 = grid_f[i+1][j]
                if side > 0:
                    safe_face(bm, (v00, v01, v11, v10), mat_idx=0)
                else:
                    safe_face(bm, (v00, v10, v11, v01), mat_idx=0)

    # 2. Lower Rocker Sills & Open Cabin Aperture (Y from +0.550m to -0.550m)
    sill_stations = [
        {"y":  0.550, "zf": 0.150, "zs": 0.260, "xs": 0.805},
        {"y":  0.200, "zf": 0.150, "zs": 0.250, "xs": 0.795},
        {"y": -0.150, "zf": 0.150, "zs": 0.250, "xs": 0.795},
        {"y": -0.550, "zf": 0.150, "zs": 0.260, "xs": 0.815},
    ]
    for side in [1.0, -1.0]:
        grid_s = []
        for s in sill_stations:
            y = s["y"]
            xs = s["xs"] * side
            zf = s["zf"]
            zs = s["zs"]
            row = [
                bm.verts.new(Vector((0.0,         y, zf))),
                bm.verts.new(Vector((xs * 0.70,   y, zf))),
                bm.verts.new(Vector((xs,          y, zs))),
                bm.verts.new(Vector((xs * 0.98,   y, zs + 0.050))),
            ]
            grid_s.append(row)

        for i in range(len(sill_stations) - 1):
            for j in range(3):
                v00 = grid_s[i][j]
                v01 = grid_s[i][j+1]
                v11 = grid_s[i+1][j+1]
                v10 = grid_s[i+1][j]
                if side > 0:
                    safe_face(bm, (v00, v01, v11, v10), mat_idx=0)
                else:
                    safe_face(bm, (v00, v10, v11, v01), mat_idx=0)

    # 3. Rear Quarter Haunches, Coke-Bottle Flare & Decklid (Y from -0.550m to -2.260m)
    rear_stations = [
        {"y": -0.550, "zf": 0.150, "zs": 0.260, "zb": 0.785, "zr": 0.835, "xs": 0.815, "xb": 0.845}, # B-Pillar Base
        {"y": -0.850, "zf": 0.150, "zs": 0.280, "zb": 0.815, "zr": 0.845, "xs": 0.855, "xb": 0.890}, # Haunch Swell Start
        {"y": -1.150, "zf": 0.150, "zs": 0.350, "zb": 0.835, "zr": 0.855, "xs": 0.875, "xb": 0.908}, # Rear Arch Peak
        {"y": -1.275, "zf": 0.150, "zs": 0.360, "zb": 0.840, "zr": 0.860, "xs": 0.880, "xb": 0.910}, # Rear Axle
        {"y": -1.550, "zf": 0.150, "zs": 0.340, "zb": 0.845, "zr": 0.865, "xs": 0.865, "xb": 0.895}, # C-Pillar Base
        {"y": -1.850, "zf": 0.150, "zs": 0.310, "zb": 0.850, "zr": 0.870, "xs": 0.835, "xb": 0.865}, # Decklid Start
        {"y": -2.080, "zf": 0.160, "zs": 0.310, "zb": 0.840, "zr": 0.865, "xs": 0.790, "xb": 0.825}, # Decklid Ducktail
        {"y": -2.260, "zf": 0.160, "zs": 0.320, "zb": 0.810, "zr": 0.835, "xs": 0.725, "xb": 0.765}, # Taillamp Fascia Top
    ]

    for side in [1.0, -1.0]:
        grid_r = []
        for s in rear_stations:
            y = s["y"]
            zf = s["zf"]
            zs = s["zs"]
            zb = s["zb"]
            zr = s["zr"]
            xs = s["xs"] * side
            xb = s["xb"] * side

            # Rear arch clearance
            dist_r = abs(y - (-1.275))
            if dist_r < 0.38:
                arch_r = math.sqrt(max(0.0, 0.38**2 - dist_r**2)) * 0.70
                zs = max(zs, 0.320 + arch_r)

            row = [
                bm.verts.new(Vector((0.0,            y, zf))),
                bm.verts.new(Vector((xs * 0.75,     y, zf))),
                bm.verts.new(Vector((xs,            y, zs))),
                bm.verts.new(Vector((xb * 0.98,     y, (zs + zb) * 0.50))),
                bm.verts.new(Vector((xb,            y, zb))),
                bm.verts.new(Vector((xb * 0.60,     y, (zb + zr) * 0.52))),
                bm.verts.new(Vector((0.0,            y, zr))),
            ]
            grid_r.append(row)

        for i in range(len(rear_stations) - 1):
            for j in range(6):
                v00 = grid_r[i][j]
                v01 = grid_r[i][j+1]
                v11 = grid_r[i+1][j+1]
                v10 = grid_r[i+1][j]
                if side > 0:
                    safe_face(bm, (v00, v01, v11, v10), mat_idx=0)
                else:
                    safe_face(bm, (v00, v10, v11, v01), mat_idx=0)

    # 4. Vertical Rear Fascia Panel (Y = -2.260m, Z from 0.160m to 0.835m)
    for side in [1.0, -1.0]:
        xs = 0.725 * side
        xb = 0.765 * side
        rf_verts = [
            bm.verts.new(Vector((0.0,        -2.260, 0.160))),
            bm.verts.new(Vector((xs * 0.75,  -2.260, 0.160))),
            bm.verts.new(Vector((xs,         -2.260, 0.320))),
            bm.verts.new(Vector((xb * 0.98,  -2.260, 0.560))),
            bm.verts.new(Vector((xb,         -2.260, 0.810))),
            bm.verts.new(Vector((xb * 0.60,  -2.260, 0.822))),
            bm.verts.new(Vector((0.0,        -2.260, 0.835))),
        ]
        for f_idx in range(len(rf_verts) - 1):
            v0 = rf_verts[f_idx]
            v1 = rf_verts[f_idx + 1]
            if side > 0:
                safe_face(bm, (v0, v1, rf_verts[-1], rf_verts[0]), mat_idx=0)
            else:
                safe_face(bm, (v0, rf_verts[0], rf_verts[-1], v1), mat_idx=0)

    # 5. Painted Body Roof Panel (Renaissance Red, correct +Z outward normal)
    roof_stations = [
        {"y":  0.100, "w": 0.620, "z": 1.250}, # Windshield Top Header
        {"y": -0.150, "w": 0.625, "z": 1.272}, # Roof Mid High Point
        {"y": -0.450, "w": 0.620, "z": 1.270}, # B-Pillar Header
        {"y": -0.650, "w": 0.610, "z": 1.250}, # Rear Hatch Glass Header
    ]
    grid_roof = []
    for s in roof_stations:
        y = s["y"]
        w = s["w"]
        z = s["z"]
        row = [
            bm.verts.new(Vector((-w,         y, z))),
            bm.verts.new(Vector((-w * 0.50,  y, z + 0.010))),
            bm.verts.new(Vector((0.0,        y, z + 0.015))),
            bm.verts.new(Vector((w * 0.50,   y, z + 0.010))),
            bm.verts.new(Vector((w,          y, z))),
        ]
        grid_roof.append(row)

    for i in range(len(roof_stations) - 1):
        for j in range(4):
            safe_face(bm, (grid_roof[i][j], grid_roof[i+1][j], grid_roof[i+1][j+1], grid_roof[i][j+1]), mat_idx=0)

    # 6. Solid Structural A-Pillars (Connecting Cowl to Roof)
    for side in [1.0, -1.0]:
        ap_cowl = bm.verts.new(Vector((0.805 * side, 0.550, 0.775)))
        ap_cowl_in = bm.verts.new(Vector((0.740 * side, 0.550, 0.805)))
        ap_roof = bm.verts.new(Vector((0.620 * side, 0.100, 1.250)))
        ap_roof_in = bm.verts.new(Vector((0.560 * side, 0.100, 1.250)))
        if side > 0:
            safe_face(bm, (ap_cowl, ap_cowl_in, ap_roof_in, ap_roof), mat_idx=0)
        else:
            safe_face(bm, (ap_cowl, ap_roof, ap_roof_in, ap_cowl_in), mat_idx=0)

    # 7. Solid Structural C-Pillar Sail Panels (Roof to Rear Haunch)
    for side in [1.0, -1.0]:
        cp_roof = bm.verts.new(Vector((0.610 * side, -0.650, 1.250)))
        cp_roof_in = bm.verts.new(Vector((0.550 * side, -0.650, 1.250)))
        cp_deck = bm.verts.new(Vector((0.790 * side, -1.850, 0.865)))
        cp_deck_in = bm.verts.new(Vector((0.730 * side, -1.850, 0.865)))
        cp_belt_b = bm.verts.new(Vector((0.815 * side, -0.550, 0.785)))
        cp_roof_b = bm.verts.new(Vector((0.620 * side, -0.450, 1.270)))

        if side > 0:
            safe_face(bm, (cp_roof, cp_deck, cp_deck_in, cp_roof_in), mat_idx=0)
            safe_face(bm, (cp_roof_b, cp_roof, cp_deck, cp_belt_b), mat_idx=0)
        else:
            safe_face(bm, (cp_roof, cp_roof_in, cp_deck_in, cp_deck), mat_idx=0)
            safe_face(bm, (cp_roof_b, cp_belt_b, cp_deck, cp_roof), mat_idx=0)

    # 8. Front Bumper Nose Cap & Central Intercooler Mouth
    v_mouth_tl = bm.verts.new(Vector((-0.380, 2.250, 0.420)))
    v_mouth_tc = bm.verts.new(Vector(( 0.000, 2.250, 0.420)))
    v_mouth_tr = bm.verts.new(Vector(( 0.380, 2.250, 0.420)))
    v_mouth_bl = bm.verts.new(Vector((-0.380, 2.250, 0.200)))
    v_mouth_bc = bm.verts.new(Vector(( 0.000, 2.250, 0.200)))
    v_mouth_br = bm.verts.new(Vector(( 0.380, 2.250, 0.200)))

    # Upper nose bar connecting to hood
    v_nose_top_l = bm.verts.new(Vector((-0.434, 2.250, 0.560)))
    v_nose_top_c = bm.verts.new(Vector(( 0.000, 2.250, 0.600)))
    v_nose_top_r = bm.verts.new(Vector(( 0.434, 2.250, 0.560)))

    safe_face(bm, [v_nose_top_l, v_nose_top_c, v_mouth_tc, v_mouth_tl], mat_idx=0)
    safe_face(bm, [v_nose_top_c, v_nose_top_r, v_mouth_tr, v_mouth_tc], mat_idx=0)

    # Recessed Silver Intercooler Core (mat_idx=1: alloy_silver)
    v_ic_tl = bm.verts.new(Vector((-0.370, 2.140, 0.410)))
    v_ic_tr = bm.verts.new(Vector(( 0.370, 2.140, 0.410)))
    v_ic_bl = bm.verts.new(Vector((-0.370, 2.140, 0.210)))
    v_ic_br = bm.verts.new(Vector(( 0.370, 2.140, 0.210)))

    safe_face(bm, [v_ic_bl, v_ic_br, v_ic_tr, v_ic_tl], mat_idx=1) # alloy silver intercooler
    safe_face(bm, [v_mouth_bl, v_mouth_br, v_ic_br, v_ic_bl], mat_idx=2) # satin black duct
    safe_face(bm, [v_mouth_tl, v_ic_tl, v_ic_tr, v_mouth_tr], mat_idx=2)
    safe_face(bm, [v_mouth_bl, v_ic_bl, v_ic_tl, v_mouth_tl], mat_idx=2)
    safe_face(bm, [v_mouth_br, v_mouth_tr, v_ic_tr, v_ic_br], mat_idx=2)

    # Active Low Front Chin Splitter Lip (Satin Black)
    v_lip_c = bm.verts.new(Vector(( 0.000, 2.270, 0.120)))
    v_lip_l = bm.verts.new(Vector((-0.620, 2.220, 0.120)))
    v_lip_r = bm.verts.new(Vector(( 0.620, 2.220, 0.120)))
    safe_face(bm, [v_lip_l, v_lip_c, v_mouth_bc, v_mouth_bl], mat_idx=2)
    safe_face(bm, [v_lip_c, v_lip_r, v_mouth_br, v_mouth_bc], mat_idx=2)

    # 9. Side Rocker Air Duct / Brake Scoops forward of rear wheels
    for side in [1.0, -1.0]:
        sc_ret = bmesh.ops.create_cube(bm, size=1.0)
        for v in sc_ret['verts']:
            v.co.x = v.co.x * 0.040 + (0.835 * side)
            v.co.y = v.co.y * 0.180 - 0.700
            v.co.z = v.co.z * 0.110 + 0.360
        set_op_material(sc_ret, 2) # trim black mesh

    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.001)
    bmesh.ops.subdivide_edges(bm, edges=bm.edges, cuts=2, use_grid_fill=True)

    body_obj = create_mesh_object("BODY_Unibody", bm, parent_col, mat=[mats['paint_red'], mats['alloy_silver'], mats['trim_black']], bevel_w=0.002, subsurf_lvl=3)
    body_obj["subsystem"] = "BODY"
    return body_obj


# ─── 4. Separated Articulating Doors & Frameless Glass ───────────────────────
def build_doors(parent_col, mats):
    """
    Separated articulating doors with forward physical hinge vectors.
    Door window glass is created as a separated child mesh with subsurf_lvl=0
    to prevent Catmull-Clark rounding/potato-chipping!
    """
    doors = []

    for side, sign in [("L", -1.0), ("R", 1.0)]:
        bm = bmesh.new()

        y_fwd = 0.520
        y_mid = 0.080
        y_aft = -0.380

        z_btm = 0.260
        z_mid = 0.520
        z_top = 0.780

        x_waist = sign * 0.805
        x_edge = sign * 0.830

        # Outer door sheet metal
        v0 = bm.verts.new(Vector((x_edge, y_fwd, z_btm)))
        v1 = bm.verts.new(Vector((x_edge, y_fwd, z_mid)))
        v2 = bm.verts.new(Vector((x_edge, y_fwd, z_top)))

        v3 = bm.verts.new(Vector((x_waist, y_mid, z_btm)))
        v4 = bm.verts.new(Vector((x_waist, y_mid, z_mid)))
        v5 = bm.verts.new(Vector((x_waist, y_mid, z_top)))

        v6 = bm.verts.new(Vector((x_edge, y_aft, z_btm)))
        v7 = bm.verts.new(Vector((x_edge, y_aft, z_mid)))
        v8 = bm.verts.new(Vector((x_edge, y_aft, z_top)))

        if sign < 0:
            safe_face(bm, [v0, v3, v4, v1], mat_idx=0)
            safe_face(bm, [v1, v4, v5, v2], mat_idx=0)
            safe_face(bm, [v3, v6, v7, v4], mat_idx=0)
            safe_face(bm, [v4, v7, v8, v5], mat_idx=0)
        else:
            safe_face(bm, [v0, v1, v4, v3], mat_idx=0)
            safe_face(bm, [v1, v2, v5, v4], mat_idx=0)
            safe_face(bm, [v3, v4, v7, v6], mat_idx=0)
            safe_face(bm, [v4, v5, v8, v7], mat_idx=0)

        # Inner Door Card & Jamb
        x_in = sign * 0.720
        v0_in = bm.verts.new(Vector((x_in, y_fwd, z_btm + 0.050)))
        v2_in = bm.verts.new(Vector((x_in, y_fwd, z_top)))
        v6_in = bm.verts.new(Vector((x_in, y_aft, z_btm + 0.050)))
        v8_in = bm.verts.new(Vector((x_in, y_aft, z_top)))

        if sign < 0:
            safe_face(bm, [v0, v0_in, v2_in, v2], mat_idx=1)
            safe_face(bm, [v6, v8, v8_in, v6_in], mat_idx=1)
            safe_face(bm, [v0_in, v6_in, v8_in, v2_in], mat_idx=1)
        else:
            safe_face(bm, [v0, v2, v2_in, v0_in], mat_idx=1)
            safe_face(bm, [v6, v6_in, v8_in, v8], mat_idx=1)
            safe_face(bm, [v0_in, v2_in, v8_in, v6_in], mat_idx=1)

        # Molded Armrest & Speaker Grille
        ret_arm = bmesh.ops.create_cube(bm, size=1.0)
        for v in ret_arm['verts']:
            v.co.x = v.co.x * 0.035 + (sign * 0.730)
            v.co.y = v.co.y * 0.320 + 0.050
            v.co.z = v.co.z * 0.080 + 0.500
        set_op_material(ret_arm, 1)

        # Aerodynamic Side Mirror
        v_m1 = bm.verts.new(Vector((x_edge + sign * 0.08, 0.44, 0.80)))
        v_m2 = bm.verts.new(Vector((x_edge + sign * 0.16, 0.40, 0.85)))
        v_m3 = bm.verts.new(Vector((x_edge + sign * 0.16, 0.32, 0.85)))
        v_m4 = bm.verts.new(Vector((x_edge + sign * 0.08, 0.34, 0.80)))
        safe_face(bm, [v_m1, v_m2, v_m3, v_m4], mat_idx=0)

        bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.001)
        bmesh.ops.subdivide_edges(bm, edges=bm.edges, cuts=1, use_grid_fill=True)

        door_name = f"DOOR_F{side}"
        obj_door = create_mesh_object(door_name, bm, parent_col, mat=[mats['paint_red'], mats['trim_black']], bevel_w=0.002, subsurf_lvl=2)

        hinge_pos = Vector((sign * 0.830, y_fwd, 0.480))
        obj_door.location = hinge_pos
        for v in obj_door.data.vertices:
            v.co -= hinge_pos

        obj_door["subsystem"] = "DOORS"
        obj_door["interactive"] = True
        obj_door["sound_fx"] = "door_latch"
        obj_door["haptic"] = "medium"

        # Separate Frameless Door Window Glass (Parented to Door, subsurf_lvl=0)
        bm_glass = bmesh.new()
        x_top = sign * 0.630
        vg0 = bm_glass.verts.new(Vector((x_edge - hinge_pos.x, y_fwd - hinge_pos.y, z_top - hinge_pos.z)))
        vg1 = bm_glass.verts.new(Vector((x_top - hinge_pos.x,  0.100 - hinge_pos.y, 1.240 - hinge_pos.z)))
        vg2 = bm_glass.verts.new(Vector((x_top - hinge_pos.x, -0.450 - hinge_pos.y, 1.250 - hinge_pos.z)))
        vg3 = bm_glass.verts.new(Vector((x_edge - hinge_pos.x, y_aft - hinge_pos.y, z_top - hinge_pos.z)))

        if sign < 0:
            safe_face(bm_glass, [vg0, vg3, vg2, vg1], mat_idx=0)
        else:
            safe_face(bm_glass, [vg0, vg1, vg2, vg3], mat_idx=0)

        glass_obj = create_mesh_object(f"{door_name}_Glass", bm_glass, parent_col, mat=mats['glass_clear'], smooth=True, bevel_w=0.0, subsurf_lvl=0, parent_obj=obj_door)
        glass_obj["subsystem"] = "GLASS"

        doors.append(obj_door)

    return doors


# ─── 5. Optical Greenhouse Glass & Black Ceramic Frit ────────────────────────
def build_greenhouse_glass(parent_col, mats):
    """
    Curved compound-curvature windshield, triangular quarter windows,
    and massive fastback rear hatch backlite with black ceramic frit borders.
    """
    bm = bmesh.new()

    # 1. Front Windshield (Cowl Y = 0.55m -> Roof Y = 0.10m)
    n_ws = 8
    ws_rings = []
    for step in range(n_ws):
        t = step / (n_ws - 1)
        y = 0.550 - t * 0.450
        z = 0.775 + t * 0.475
        w = 0.740 - t * 0.120
        bow_y = 0.035 * (1.0 - (2.0 * t - 1.0)**2)
        ring = [
            bm.verts.new(Vector((-w,         y + bow_y, z))),
            bm.verts.new(Vector((-w * 0.50,  y + bow_y + 0.010, z + 0.005))),
            bm.verts.new(Vector((0.0,        y + bow_y + 0.015, z + 0.010))),
            bm.verts.new(Vector((w * 0.50,   y + bow_y + 0.010, z + 0.005))),
            bm.verts.new(Vector((w,          y + bow_y, z))),
        ]
        ws_rings.append(ring)

    for step in range(n_ws - 1):
        for j in range(4):
            m_idx = 1 if (step == 0 or step == n_ws - 2 or j == 0 or j == 3) else 0
            safe_face(bm, (ws_rings[step][j], ws_rings[step+1][j], ws_rings[step+1][j+1], ws_rings[step][j+1]), mat_idx=m_idx)

    # 2. Fixed Rear Triangular Quarter Windows (Behind B-Pillar: Y in [-0.45m, -0.95m])
    for side in [1.0, -1.0]:
        qw = [
            bm.verts.new(Vector((0.620 * side, -0.450, 1.250))), # B-Pillar Top
            bm.verts.new(Vector((0.815 * side, -0.450, 0.785))), # B-Pillar Belt
            bm.verts.new(Vector((0.780 * side, -0.950, 0.835))), # Quarter Belt
            bm.verts.new(Vector((0.600 * side, -0.750, 1.220))), # Roof Curve
        ]
        if side > 0:
            safe_face(bm, qw, mat_idx=0)
        else:
            safe_face(bm, qw[::-1], mat_idx=0)

    # 3. Fastback Rear Hatch Backlite Pane (Sloping down from roof to decklid)
    n_rw = 8
    rw_rings = []
    for step in range(n_rw):
        t = step / (n_rw - 1)
        y = -0.650 - t * 1.150
        z = 1.250 - t * 0.385
        w = 0.600 + t * 0.120 if t < 0.6 else 0.720 - (t - 0.6) * 0.150
        ring = [
            bm.verts.new(Vector((-w,         y, z))),
            bm.verts.new(Vector((-w * 0.50,  y, z + 0.010))),
            bm.verts.new(Vector((0.0,        y, z + 0.015))),
            bm.verts.new(Vector((w * 0.50,   y, z + 0.010))),
            bm.verts.new(Vector((w,          y, z))),
        ]
        rw_rings.append(ring)

    for step in range(n_rw - 1):
        for j in range(4):
            m_idx = 1 if (step == 0 or step == n_rw - 2 or j == 0 or j == 3) else 0
            safe_face(bm, (rw_rings[step][j], rw_rings[step+1][j], rw_rings[step+1][j+1], rw_rings[step][j+1]), mat_idx=m_idx)

    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.001)

    obj_glass = create_mesh_object("GLASS_Greenhouse", bm, parent_col, mat=[mats['glass_clear'], mats['frit_black']], bevel_w=0.0, subsurf_lvl=0)
    obj_glass["subsystem"] = "GLASS"
    return obj_glass


# ─── 6. High Hoop Rear Spoiler Wing ──────────────────────────────────────────
def build_aero_wing(parent_col, mats):
    """
    Iconic Toyota Supra A80 High Hoop Rear Spoiler Wing:
    - Curved vertical stanchions rising from rear haunches to Z = 1.25m
    - High-downforce cambered bridging airfoil with integrated LED third brake light
    """
    bm = bmesh.new()

    for sign in [-1.0, 1.0]:
        x_base = sign * 0.720
        x_arch = sign * 0.680

        # Curved Upright Stanchion
        vb_f = bm.verts.new(Vector((x_base, -1.820, 0.870)))
        vb_m = bm.verts.new(Vector((x_base + sign * 0.02, -1.950, 0.865)))
        vb_r = bm.verts.new(Vector((x_base, -2.080, 0.865)))

        vm_f = bm.verts.new(Vector((x_arch, -1.840, 1.050)))
        vm_m = bm.verts.new(Vector((x_arch, -1.950, 1.050)))
        vm_r = bm.verts.new(Vector((x_arch, -2.060, 1.050)))

        vt_f = bm.verts.new(Vector((x_arch, -1.860, 1.240)))
        vt_m = bm.verts.new(Vector((x_arch, -1.960, 1.240)))
        vt_r = bm.verts.new(Vector((x_arch, -2.060, 1.220)))

        if sign < 0:
            safe_face(bm, [vb_f, vm_f, vm_m, vb_m], mat_idx=0)
            safe_face(bm, [vb_m, vm_m, vm_r, vb_r], mat_idx=0)
            safe_face(bm, [vm_f, vt_f, vt_m, vm_m], mat_idx=0)
            safe_face(bm, [vm_m, vt_m, vt_r, vm_r], mat_idx=0)
        else:
            safe_face(bm, [vb_f, vb_m, vm_m, vm_f], mat_idx=0)
            safe_face(bm, [vb_m, vb_r, vm_r, vm_m], mat_idx=0)
            safe_face(bm, [vm_f, vm_m, vt_m, vt_f], mat_idx=0)
            safe_face(bm, [vm_m, vm_r, vt_r, vt_m], mat_idx=0)

    # Bridging Airfoil
    x_coords = [-0.680, -0.520, -0.360, -0.200, 0.000, 0.200, 0.360, 0.520, 0.680]
    airfoil_rings = []

    for x in x_coords:
        v_le = bm.verts.new(Vector((x, -1.860, 1.230)))
        v_top = bm.verts.new(Vector((x, -1.960, 1.255)))
        v_te = bm.verts.new(Vector((x, -2.060, 1.230)))
        v_btm = bm.verts.new(Vector((x, -1.960, 1.215)))
        airfoil_rings.append((v_le, v_top, v_te, v_btm))

    for i in range(len(airfoil_rings) - 1):
        r1 = airfoil_rings[i]
        r2 = airfoil_rings[i + 1]
        safe_face(bm, [r1[0], r2[0], r2[1], r1[1]], mat_idx=0)
        safe_face(bm, [r1[1], r2[1], r2[2], r1[2]], mat_idx=0)
        # Underside center third brake light (ruby_light, mat_idx=1)
        m_btm = 1 if (3 <= i <= 4) else 0
        safe_face(bm, [r1[2], r2[2], r2[3], r1[3]], mat_idx=m_btm)
        safe_face(bm, [r1[3], r2[3], r2[0], r1[0]], mat_idx=0)

    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.001)
    bmesh.ops.subdivide_edges(bm, edges=bm.edges, cuts=1, use_grid_fill=True)

    obj_wing = create_mesh_object("AERO_HoopWing", bm, parent_col, mat=[mats['paint_red'], mats['ruby_light']], bevel_w=0.003, subsurf_lvl=2)
    obj_wing["subsystem"] = "AERO"
    obj_wing["interactive"] = True
    obj_wing["sound_fx"] = "wing_tap"
    obj_wing["haptic"] = "medium"
    return obj_wing


# ─── 7. Lighting Optics (Triple Projector Front & Quad Round Rear) ───────────
def build_lighting_optics(parent_col, mats):
    """
    Iconic Toyota Supra A80 Lighting Architecture:
    - Front: Triple Projector Headlamps (Low Beam, High Beam, Amber Marker) under
      aerodynamic curved smoked polycarbonate lenses, set cleanly into the front fenders.
    - Rear: Quad Round Afterburner Taillamp Pods (Amber Turn, Dual Ruby Stop/Tail, White Reverse)
      set squarely onto the rear vertical fascia!
    """
    bm = bmesh.new()

    # Front Headlamp Optics
    for sign in [-1.0, 1.0]:
        xc = sign * 0.660
        yc = 2.040
        zc = 0.638

        # Gunmetal Bezel Backplate (mat_idx=0) recessed flush into fender
        ret_plate = bmesh.ops.create_cube(bm, size=1.0)
        for v in ret_plate['verts']:
            v.co.x = v.co.x * 0.150 + xc
            v.co.y = v.co.y * 0.200 + yc
            v.co.z = v.co.z * 0.016 + zc
        set_op_material(ret_plate, 0)

        # 3 Projectors: Low Beam (Chrome), High Beam (Chrome), Amber Marker (Amber)
        projectors = [
            (xc + sign * 0.040, yc + 0.055, zc + 0.008, 0.028, 2), # Inboard Low Beam
            (xc,                yc,         zc + 0.006, 0.028, 2), # Center High Beam
            (xc - sign * 0.040, yc - 0.055, zc + 0.004, 0.022, 3), # Outboard Amber Marker
        ]

        for px, py, pz, pr, pmat in projectors:
            ring_f = []
            ring_b = []
            for a in range(16):
                ang = a * (math.pi * 2.0 / 16.0)
                dx = math.cos(ang) * pr
                dz = math.sin(ang) * pr
                ring_f.append(bm.verts.new(Vector((px + dx, py + 0.015, pz + dz))))
                ring_b.append(bm.verts.new(Vector((px + dx * 0.70, py - 0.010, pz + dz * 0.70))))

            for a in range(16):
                nxt = (a + 1) % 16
                safe_face(bm, [ring_f[a], ring_f[nxt], ring_b[nxt], ring_b[a]], mat_idx=pmat)
            safe_face(bm, ring_f, mat_idx=pmat)
            safe_face(bm, ring_b[::-1], mat_idx=pmat)

        # Aerodynamic Flush Smoked Outer Lens (mat_idx=1: glass_smoked)
        v_h_fl = bm.verts.new(Vector((xc - sign * 0.075, yc + 0.100, zc + 0.015)))
        v_h_fr = bm.verts.new(Vector((xc + sign * 0.075, yc + 0.085, zc + 0.010)))
        v_h_rr = bm.verts.new(Vector((xc + sign * 0.075, yc - 0.095, zc + 0.022)))
        v_h_rl = bm.verts.new(Vector((xc - sign * 0.075, yc - 0.095, zc + 0.028)))
        safe_face(bm, [v_h_fl, v_h_fr, v_h_rr, v_h_rl], mat_idx=1)

    # Rear Taillamps: Legendary Quad Round Afterburners on Rear Fascia
    for sign in [-1.0, 1.0]:
        base_x = sign * 0.540
        y_pos = -2.262 # Proud of the rear fascia at -2.260m!
        z_pos = 0.730

        # Gunmetal Surround Panel (mat_idx=0)
        ret_rp = bmesh.ops.create_cube(bm, size=1.0)
        for v in ret_rp['verts']:
            v.co.x = v.co.x * 0.360 + base_x
            v.co.y = v.co.y * 0.018 + y_pos
            v.co.z = v.co.z * 0.090 + z_pos
        set_op_material(ret_rp, 0)

        # 4 Round Afterburner Lenses (Inboard to Outboard):
        # 1: White Reverse (mat_idx=5), 2: Ruby Tail (mat_idx=4), 3: Ruby Stop (mat_idx=4), 4: Amber Turn (mat_idx=3)
        round_lights = [
            (base_x - sign * 0.120, 0.030, 5), # White Reverse
            (base_x - sign * 0.040, 0.035, 4), # Inner Ruby Tail
            (base_x + sign * 0.040, 0.035, 4), # Outer Ruby Stop
            (base_x + sign * 0.120, 0.032, 3), # Amber Turn Indicator
        ]

        for lx, lr, lmat in round_lights:
            circle_f = []
            circle_b = []
            for a in range(16):
                ang = a * (math.pi * 2.0 / 16.0)
                dx = math.cos(ang) * lr
                dz = math.sin(ang) * lr
                circle_f.append(bm.verts.new(Vector((lx + dx, y_pos - 0.012, z_pos + dz))))
                circle_b.append(bm.verts.new(Vector((lx + dx, y_pos + 0.005, z_pos + dz))))

            for a in range(16):
                nxt = (a + 1) % 16
                safe_face(bm, [circle_f[a], circle_f[nxt], circle_b[nxt], circle_b[a]], mat_idx=lmat)
            safe_face(bm, circle_f, mat_idx=lmat)

    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.001)

    obj_lights = create_mesh_object(
        "LIGHTING_Optics",
        bm,
        parent_col,
        mat=[
            mats['gunmetal'],     # 0: bezel
            mats['glass_smoked'], # 1: outer lens
            mats['chrome'],       # 2: projector chrome
            mats['amber_light'],  # 3: amber indicator
            mats['ruby_light'],   # 4: ruby tail/brake
            mats['white_light'],  # 5: white reverse
        ],
        bevel_w=0.001,
        subsurf_lvl=1
    )
    obj_lights["subsystem"] = "LIGHTING"
    return obj_lights


# ─── 8. Powertrain (2JZ-GTE Twin-Turbo) & Performance Exhaust ────────────────
def build_powertrain_2jz(parent_col, mats):
    """
    2JZ-GTE Inline-6 Twin-Turbo Powertrain:
    - Cast iron engine block and silver alloy twin-cam valve cover
    - Dual sequential turbocharger induction system and titanium strut brace
    - Single large-bore 90mm stainless cannon exhaust tip with dark inner bore
    """
    bm = bmesh.new()

    # Engine Block (mat_idx=1: engine_iron)
    ret_eb = bmesh.ops.create_cube(bm, size=1.0)
    for v in ret_eb['verts']:
        v.co.x = v.co.x * 0.320
        v.co.y = v.co.y * 0.720 + 1.250
        v.co.z = v.co.z * 0.380 + 0.360
    set_op_material(ret_eb, 1)

    # Valve / Cam Cover (mat_idx=0: engine_silver)
    ret_vc = bmesh.ops.create_cube(bm, size=1.0)
    for v in ret_vc['verts']:
        v.co.x = v.co.x * 0.260
        v.co.y = v.co.y * 0.680 + 1.250
        v.co.z = v.co.z * 0.080 + 0.580
    set_op_material(ret_vc, 0)

    # Twin Turbochargers (mat_idx=0)
    for ty in [1.100, 1.400]:
        ret_t = bmesh.ops.create_cone(bm, cap_ends=True, segments=16, radius1=0.065, radius2=0.045, depth=0.100)
        for v in ret_t['verts']:
            v.co.x += 0.240
            v.co.y += ty
            v.co.z += 0.420
        set_op_material(ret_t, 0)

    # Front Strut Brace Bar (mat_idx=3: chrome)
    v_st_l = bm.verts.new(Vector((-0.680, 1.275, 0.660)))
    v_st_r = bm.verts.new(Vector(( 0.680, 1.275, 0.660)))
    v_st_ml = bm.verts.new(Vector((-0.200, 1.275, 0.720)))
    v_st_mr = bm.verts.new(Vector(( 0.200, 1.275, 0.720)))
    safe_face(bm, [v_st_l, v_st_ml, v_st_mr, v_st_r], mat_idx=3)

    # Stainless Performance Cannon Exhaust (mat_idx=2: exhaust_pipe)
    ex_angles = [a * (math.pi * 2.0 / 16.0) for a in range(16)]
    ex_tip = []
    ex_bore = []
    for ang in ex_angles:
        dx = math.cos(ang) * 0.048
        dz = math.sin(ang) * 0.048
        ex_tip.append(bm.verts.new(Vector(( 0.520 + dx, -2.285, 0.220 + dz))))
        ex_bore.append(bm.verts.new(Vector((0.520 + dx * 0.85, -2.140, 0.220 + dz * 0.85))))

    for a in range(16):
        nxt = (a + 1) % 16
        safe_face(bm, [ex_tip[a], ex_tip[nxt], ex_bore[nxt], ex_bore[a]], mat_idx=2)
    safe_face(bm, ex_bore[::-1], mat_idx=1) # dark bore

    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.001)

    obj_2jz = create_mesh_object("POWERTRAIN_2JZGTE", bm, parent_col, mat=[mats['engine_silver'], mats['engine_iron'], mats['exhaust_pipe'], mats['chrome']], bevel_w=0.002, subsurf_lvl=2)
    obj_2jz["subsystem"] = "POWERTRAIN"
    obj_2jz["interactive"] = True
    obj_2jz["sound_fx"] = "engine_rev"
    obj_2jz["haptic"] = "heavy"
    return obj_2jz


# ─── 9. Chassis Subframe & Inboard Splash Tubs ────────────────────────────────
def build_chassis_subframe(parent_col, mats):
    """
    Chassis structural frame, floorpan, and INBOARD splash half-tubs.
    """
    bm = bmesh.new()

    v_fp_fl = bm.verts.new(Vector((-0.720,  0.550, 0.160)))
    v_fp_fr = bm.verts.new(Vector(( 0.720,  0.550, 0.160)))
    v_fp_rl = bm.verts.new(Vector((-0.740, -1.650, 0.160)))
    v_fp_rr = bm.verts.new(Vector(( 0.740, -1.650, 0.160)))

    v_tun_fl = bm.verts.new(Vector((-0.140,  0.550, 0.320)))
    v_tun_fr = bm.verts.new(Vector(( 0.140,  0.550, 0.320)))
    v_tun_rl = bm.verts.new(Vector((-0.140, -1.650, 0.280)))
    v_tun_rr = bm.verts.new(Vector(( 0.140, -1.650, 0.280)))

    safe_face(bm, [v_fp_fl, v_tun_fl, v_tun_rl, v_fp_rl], mat_idx=0)
    safe_face(bm, [v_tun_fr, v_fp_fr, v_fp_rr, v_tun_rr], mat_idx=0)
    safe_face(bm, [v_tun_fl, v_tun_fr, v_tun_rr, v_tun_rl], mat_idx=0)

    # Front & Rear Suspension Control Arms
    for wy in [1.275, -1.275]:
        for sign in [-1.0, 1.0]:
            ret_arm = bmesh.ops.create_cube(bm, size=1.0)
            for v in ret_arm['verts']:
                v.co.x = v.co.x * 0.150 + (sign * 0.620)
                v.co.y = v.co.y * 0.050 + wy
                v.co.z = v.co.z * 0.030 + 0.250

    # Inboard Splash Half-Tubs
    wheel_y = {"F": 1.275, "R": -1.275}
    for axle, wy in wheel_y.items():
        for sign in [-1.0, 1.0]:
            x_in = sign * 0.520
            tub_pts = []
            for a in range(9):
                ang = a * (math.pi / 8.0)
                dy = math.cos(ang) * 0.360
                dz = math.sin(ang) * 0.360
                tub_pts.append(bm.verts.new(Vector((x_in, wy + dy, 0.320 + dz))))

            tub_floor = [bm.verts.new(Vector((x_in - sign * 0.120, p.co.y, 0.180))) for p in tub_pts]
            for a in range(8):
                safe_face(bm, [tub_pts[a], tub_pts[a+1], tub_floor[a+1], tub_floor[a]], mat_idx=0)

    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.001)

    obj_chassis = create_mesh_object("CHASSIS_Subframe", bm, parent_col, mat=mats['trim_black'], bevel_w=0.002, subsurf_lvl=2)
    obj_chassis["subsystem"] = "CHASSIS"
    obj_chassis["interactive"] = True
    obj_chassis["sound_fx"] = "metal_creak"
    obj_chassis["haptic"] = "medium"
    return obj_chassis


# ─── 10. 17-Inch Staggered 5-Spoke Alloy Wheels & Brakes ─────────────────────
def build_wheels_and_brakes(parent_col, mats):
    """
    Authentic Toyota Supra A80 17-inch Staggered 5-Spoke Star Alloy Wheels:
    - 32-segment tire torus with directional tread pattern sipes
    - Stepped outer rim lip and 5 curved sculpted star spokes
    - Center hub cap with 5 chrome recessed lug nuts
    - Cross-drilled ventilated brake rotors and monobloc branded calipers
    """
    wheel_objs = []
    corners = [
        ("FL", -0.760,  1.275, 0.322, 0.235, 4),
        ("FR",  0.760,  1.275, 0.322, 0.235, 4),
        ("RL", -0.762, -1.275, 0.320, 0.260, 2),
        ("RR",  0.762, -1.275, 0.320, 0.260, 2),
    ]

    rot_r = Euler((0.0, math.radians(90.0), 0.0), 'XYZ')

    for name, wx, wy, wz, w_width, pistons in corners:
        bm = bmesh.new()
        is_left = wx < 0
        side_sign = -1.0 if is_left else 1.0

        r_tire = 0.321
        r_rim = 0.216
        r_hub = 0.075
        r_rotor = 0.162

        n_tire_rings = 32
        t_rings = []
        for step in range(n_tire_rings):
            phi = step * 2.0 * math.pi / n_tire_rings
            cos_p = math.cos(phi)
            sin_p = math.sin(phi)

            pts = [
                Vector((-w_width * 0.50, cos_p * r_rim, sin_p * r_rim)),
                Vector((-w_width * 0.52, cos_p * (r_rim + 0.035), sin_p * (r_rim + 0.035))),
                Vector((-w_width * 0.48, cos_p * r_tire, sin_p * r_tire)),
                Vector(( w_width * 0.48, cos_p * r_tire, sin_p * r_tire)),
                Vector(( w_width * 0.52, cos_p * (r_rim + 0.035), sin_p * (r_rim + 0.035))),
                Vector(( w_width * 0.50, cos_p * r_rim, sin_p * r_rim)),
            ]
            t_rings.append([bm.verts.new(p) for p in pts])

        for step in range(n_tire_rings):
            s_next = (step + 1) % n_tire_rings
            for j in range(5):
                if is_left:
                    safe_face(bm, (t_rings[step][j], t_rings[step][j+1], t_rings[s_next][j+1], t_rings[s_next][j]), mat_idx=1)
                else:
                    safe_face(bm, (t_rings[step][j], t_rings[s_next][j], t_rings[s_next][j+1], t_rings[step][j+1]), mat_idx=1)

        # Directional Tread Sipes (40 transverse cuts, mat_idx=1)
        for s_idx in range(40):
            s_angle = s_idx * 2.0 * math.pi / 40.0
            ret_sipe = bmesh.ops.create_cube(bm, size=1.0)
            rot_sipe = Euler((s_angle, 0.0, 0.0), 'XYZ')
            for v in ret_sipe['verts']:
                v.co = rot_sipe.to_matrix() @ v.co
                v.co.x = v.co.x * (w_width * 0.78)
                v.co.y += math.cos(s_angle) * (r_tire - 0.003)
                v.co.z += math.sin(s_angle) * (r_tire - 0.003)
                v.co.y *= 0.005
                v.co.z *= 0.005
            set_op_material(ret_sipe, 1)

        # Stepped Outer Rim Lip (mat_idx=0: alloy_silver)
        ret_rim = bmesh.ops.create_cone(bm, cap_ends=False, segments=36, radius1=r_rim, radius2=r_rim, depth=w_width * 0.88)
        for v in ret_rim['verts']:
            v.co = rot_r.to_matrix() @ v.co
            v.co.x += 0.010 * side_sign
        set_op_material(ret_rim, 0)

        # 5 Curved Supra Star Spokes (mat_idx=0: alloy_silver)
        for sp in range(5):
            theta = sp * (2.0 * math.pi / 5.0)
            ret_sp = bmesh.ops.create_cube(bm, size=1.0)
            rot_spk = Euler((theta, 0.0, 0.0), 'XYZ')
            for v in ret_sp['verts']:
                v.co.x = v.co.x * 0.026 + (w_width * 0.40 * side_sign)
                v.co.y = v.co.y * 0.040
                v.co.z = v.co.z * (r_rim * 0.32) + (r_rim * 0.45)
                v.co = rot_spk.to_matrix() @ v.co
            set_op_material(ret_sp, 0)

        # Center Hub Cap with 5 Lug Nuts (mat_idx=0 & chrome mat_idx=3)
        ret_hub = bmesh.ops.create_cone(bm, cap_ends=True, segments=28, radius1=r_hub, radius2=r_hub, depth=0.028)
        for v in ret_hub['verts']:
            v.co = rot_r.to_matrix() @ v.co
            v.co.x += (w_width * 0.42 * side_sign)
        set_op_material(ret_hub, 0)

        for l_idx in range(5):
            l_ang = l_idx * math.pi * 0.4
            ret_lug = bmesh.ops.create_cone(bm, cap_ends=True, segments=12, radius1=0.010, radius2=0.010, depth=0.015)
            for v in ret_lug['verts']:
                v.co = rot_r.to_matrix() @ v.co
                v.co.x += (w_width * 0.435 * side_sign)
                v.co.y += math.cos(l_ang) * 0.038
                v.co.z += math.sin(l_ang) * 0.038
            set_op_material(ret_lug, 3) # chrome lug

        # Cross-Drilled Vented Brake Rotor (mat_idx=2: rotor_steel)
        ret_disc = bmesh.ops.create_cone(bm, cap_ends=True, segments=32, radius1=r_rotor, radius2=r_rotor, depth=0.022)
        for v in ret_disc['verts']:
            v.co = rot_r.to_matrix() @ v.co
            v.co.x += (w_width * 0.15 * side_sign)
        set_op_material(ret_disc, 2)

        # Monobloc Brake Caliper (mat_idx=3: caliper_black)
        ret_cal = bmesh.ops.create_cube(bm, size=1.0)
        cal_l = 0.110 if pistons == 4 else 0.080
        for v in ret_cal['verts']:
            v.co.x = v.co.x * 0.055 + (w_width * 0.18 * side_sign)
            v.co.y = v.co.y * cal_l
            v.co.z = v.co.z * 0.095 + 0.140
        set_op_material(ret_cal, 3)

        bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.001)
        bmesh.ops.subdivide_edges(bm, edges=bm.edges, cuts=1, use_grid_fill=True)

        w_obj = create_mesh_object(f"WHEEL_{name}", bm, parent_col, mat=[mats['alloy_silver'], mats['rubber_tire'], mats['rotor_steel'], mats['caliper_black']], bevel_w=0.002, subsurf_lvl=2)
        w_obj.location = Vector((wx, wy, wz))
        w_obj["subsystem"] = "WHEELS"
        w_obj["interactive"] = True
        w_obj["sound_fx"] = "tire_kick"
        w_obj["haptic"] = "soft"

        wheel_objs.append(w_obj)

    return wheel_objs


# ─── 11. Cockpit Interior ("Fighter Jet" Ergonomics) ─────────────────────────
def build_cockpit_interior(parent_col, mats):
    """
    Authentic Toyota Supra A80 Fighter Jet Cockpit:
    - Asymmetric driver-centric dashboard sweeping around the steering wheel
    - 3 circular gauge binnacle dials backlit with warm orange phosphor
    - Center console bridge with 6-speed manual shifter and handbrake
    - Twin contoured Recaro sport seats with deep lateral bolsters
    """
    bm = bmesh.new()

    # Dashboard Main Structure
    v_db_fl = bm.verts.new(Vector((-0.680, 0.520, 0.760)))
    v_db_fr = bm.verts.new(Vector(( 0.680, 0.520, 0.760)))
    v_db_rl = bm.verts.new(Vector((-0.680, 0.220, 0.680)))
    v_db_rr = bm.verts.new(Vector(( 0.680, 0.220, 0.680)))
    v_db_bl = bm.verts.new(Vector((-0.680, 0.220, 0.420)))
    v_db_br = bm.verts.new(Vector(( 0.680, 0.220, 0.420)))

    safe_face(bm, [v_db_fl, v_db_fr, v_db_rr, v_db_rl], mat_idx=0)
    safe_face(bm, [v_db_rl, v_db_rr, v_db_br, v_db_bl], mat_idx=0)

    # Driver-Oriented Binnacle Cowl Peak (X = -0.380m)
    v_cowl_t = bm.verts.new(Vector((-0.380, 0.240, 0.810)))
    v_cowl_l = bm.verts.new(Vector((-0.550, 0.240, 0.700)))
    v_cowl_r = bm.verts.new(Vector((-0.210, 0.240, 0.700)))
    safe_face(bm, [v_cowl_l, v_cowl_t, v_cowl_r], mat_idx=0)

    # 3 Triple Gauge Dials (mat_idx=1: gauge_lit)
    for gx in [-0.460, -0.380, -0.300]:
        ret_g = bmesh.ops.create_cone(bm, cap_ends=True, segments=16, radius1=0.034, radius2=0.034, depth=0.015)
        rot_g = Euler((math.radians(75.0), 0.0, 0.0), 'XYZ')
        for v in ret_g['verts']:
            v.co = rot_g.to_matrix() @ v.co
            v.co.x += gx
            v.co.y += 0.235
            v.co.z += 0.745
        set_op_material(ret_g, 1)

    # Center Bridge Console & 6-Speed Shifter
    ret_con = bmesh.ops.create_cube(bm, size=1.0)
    for v in ret_con['verts']:
        v.co.x = v.co.x * 0.180
        v.co.y = v.co.y * 0.620 - 0.150
        v.co.z = v.co.z * 0.160 + 0.380
    set_op_material(ret_con, 0)

    # Shifter Lever
    ret_sh = bmesh.ops.create_cone(bm, cap_ends=True, segments=12, radius1=0.012, radius2=0.008, depth=0.120)
    for v in ret_sh['verts']:
        v.co.x += -0.060
        v.co.y += 0.020
        v.co.z += 0.500
    set_op_material(ret_sh, 0)

    # Twin Contoured Recaro Sport Seats (Driver LHD & Passenger RHD)
    for sx in [-0.380, 0.380]:
        # Cushion
        ret_sc = bmesh.ops.create_cube(bm, size=1.0)
        for v in ret_sc['verts']:
            v.co.x = v.co.x * 0.440 + sx
            v.co.y = v.co.y * 0.480 - 0.120
            v.co.z = v.co.z * 0.140 + 0.280
        set_op_material(ret_sc, 0)

        # Backrest (Anatomical recline rearward towards -Y)
        ret_sb = bmesh.ops.create_cube(bm, size=1.0)
        rot_sb = Euler((math.radians(16.0), 0.0, 0.0), 'XYZ')
        for v in ret_sb['verts']:
            v.co = rot_sb.to_matrix() @ v.co
            v.co.x = v.co.x * 0.420 + sx
            v.co.y = v.co.y * 0.120 - 0.380
            v.co.z = v.co.z * 0.620 + 0.620
        set_op_material(ret_sb, 0)

        # Headrest
        ret_hr = bmesh.ops.create_cube(bm, size=1.0)
        for v in ret_hr['verts']:
            v.co.x = v.co.x * 0.220 + sx
            v.co.y = v.co.y * 0.100 - 0.480
            v.co.z = v.co.z * 0.160 + 0.980
        set_op_material(ret_hr, 0)

    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.001)
    bmesh.ops.subdivide_edges(bm, edges=bm.edges, cuts=1, use_grid_fill=True)

    obj_interior = create_mesh_object("INTERIOR_Cockpit", bm, parent_col, mat=[mats['interior_dark'], mats['gauge_lit']], bevel_w=0.002, subsurf_lvl=2)
    obj_interior["subsystem"] = "INTERIOR"
    obj_interior["interactive"] = True
    obj_interior["sound_fx"] = "seat_slide"
    obj_interior["haptic"] = "soft"

    # Separate Steering Wheel for NLA Turn Animation
    bm_sw = bmesh.new()
    ret_rim = bmesh.ops.create_cone(bm_sw, cap_ends=False, segments=24, radius1=0.170, radius2=0.170, depth=0.024)
    rot_sw = Euler((math.radians(22.0), 0.0, 0.0), 'XYZ')
    for v in ret_rim['verts']:
        v.co = rot_sw.to_matrix() @ v.co
    set_op_material(ret_rim, 0)

    # 3-Spoke Sport Hub
    ret_hub = bmesh.ops.create_cone(bm_sw, cap_ends=True, segments=16, radius1=0.055, radius2=0.055, depth=0.025)
    for v in ret_hub['verts']:
        v.co = rot_sw.to_matrix() @ v.co
    set_op_material(ret_hub, 0)

    for sp_ang in [0.0, math.radians(120.0), math.radians(240.0)]:
        ret_spk = bmesh.ops.create_cube(bm_sw, size=1.0)
        rot_spk = Euler((math.radians(22.0), 0.0, sp_ang), 'XYZ')
        for v in ret_spk['verts']:
            v.co.x = v.co.x * 0.022
            v.co.y = v.co.y * 0.012
            v.co.z = v.co.z * 0.060 + 0.080
            v.co = rot_spk.to_matrix() @ v.co
        set_op_material(ret_spk, 0)

    bmesh.ops.remove_doubles(bm_sw, verts=bm_sw.verts, dist=0.001)

    obj_sw = create_mesh_object("INTERIOR_SteeringWheel", bm_sw, parent_col, mat=[mats['interior_dark'], mats['trim_black']], bevel_w=0.001, subsurf_lvl=2)
    obj_sw.location = Vector((-0.380, 0.280, 0.680))
    obj_sw["subsystem"] = "INTERIOR"
    obj_sw["interactive"] = True
    obj_sw["sound_fx"] = "steering_turn"
    obj_sw["haptic"] = "light"

    return obj_interior, obj_sw


# ─── 12. 10 Semantic Audio-Haptic Hitboxes ───────────────────────────────────
def build_hitboxes(parent_col):
    """
    10 Lightweight Collision Hulls (12-36 tris each) with hide_render=True,
    embedded with sound_fx, haptic, and interactive metadata.
    """
    hitbox_defs = [
        ("HITBOX_Hood",       (0.000,  1.450, 0.680), (0.82, 0.75, 0.22), "hood_open",    "heavy"),
        ("HITBOX_Trunk",      (0.000, -1.850, 0.820), (0.75, 0.45, 0.24), "trunk_latch",  "medium"),
        ("HITBOX_Door_L",     (-0.840, 0.080, 0.520), (0.16, 0.92, 0.55), "door_handle",  "medium"),
        ("HITBOX_Door_R",     ( 0.840, 0.080, 0.520), (0.16, 0.92, 0.55), "door_handle",  "medium"),
        ("HITBOX_Bumper_F",   (0.000,  2.240, 0.360), (0.84, 0.25, 0.32), "bumper_tap",   "light"),
        ("HITBOX_Bumper_R",   (0.000, -2.250, 0.450), (0.82, 0.25, 0.38), "bumper_tap",   "light"),
        ("HITBOX_Wheel_FL",   (-0.760, 1.275, 0.322), (0.28, 0.68, 0.68), "tire_kick",    "soft"),
        ("HITBOX_Wheel_FR",   ( 0.760, 1.275, 0.322), (0.28, 0.68, 0.68), "tire_kick",    "soft"),
        ("HITBOX_Wheel_RL",   (-0.762,-1.275, 0.320), (0.30, 0.68, 0.68), "tire_kick",    "soft"),
        ("HITBOX_Wheel_RR",   ( 0.762,-1.275, 0.320), (0.30, 0.68, 0.68), "tire_kick",    "soft"),
    ]

    hitboxes = []
    for name, loc, size, sfx, haptic in hitbox_defs:
        bm = bmesh.new()
        bmesh.ops.create_cube(bm, size=1.0)
        for v in bm.verts:
            v.co.x *= size[0]
            v.co.y *= size[1]
            v.co.z *= size[2]

        mesh = bpy.data.meshes.new(name + "_Mesh")
        bm.to_mesh(mesh)
        bm.free()
        mesh.update()

        obj = bpy.data.objects.new(name, mesh)
        obj.location = loc
        obj.display_type = 'WIRE'
        obj.hide_render = True # Invisible in final beauty render!

        obj["interactive"] = True
        obj["sound_fx"] = sfx
        obj["haptic"] = haptic
        obj["subsystem"] = "HITBOX"

        parent_col.objects.link(obj)
        hitboxes.append(obj)

    return hitboxes


# ─── 13. Standardized Cameras & NLA Actions ──────────────────────────────────
def build_cameras(parent_col):
    """
    Standardized CAMERA_* nodes for Three.js OrbitControls runtime discovery.
    """
    cam_defs = [
        ("CAMERA_Hero",     Vector((-4.2,  4.2, 1.55)), Vector((0.0,  0.15, 0.58)), 48.0),
        ("CAMERA_Cockpit",  Vector((-0.38, 0.05, 0.95)), Vector((-0.38, 0.85, 0.72)), 32.0),
        ("CAMERA_Wheel_FL", Vector((-1.65, 1.45, 0.55)), Vector((-0.76, 1.28, 0.32)), 55.0),
        ("CAMERA_Engine",   Vector(( 0.00, 1.45, 1.65)), Vector(( 0.00, 1.28, 0.45)), 50.0),
    ]

    cam_objs = []
    for name, pos, target, fov in cam_defs:
        cam_data = bpy.data.cameras.new(name)
        cam_data.lens = fov
        cam_data.clip_start = 0.1
        cam_data.clip_end = 100.0

        cam_obj = bpy.data.objects.new(name, cam_data)
        cam_obj.location = pos

        direction = target - pos
        rot_quat = direction.to_track_quat('-Z', 'Y')
        cam_obj.rotation_euler = rot_quat.to_euler()

        parent_col.objects.link(cam_obj)
        cam_objs.append(cam_obj)

    return cam_objs


def bake_vehicle_actions(door_fl, door_fr, sw_obj, wheels):
    """
    Bake 7+ NLA Actions onto physical articulating objects:
    - Action_Door_L_Open, Action_Door_R_Open
    - Action_Steering_Turn
    - Action_WHEEL_FL_Spin, Action_WHEEL_FR_Spin, Action_WHEEL_RL_Spin, Action_WHEEL_RR_Spin
    """
    act_fl = bpy.data.actions.new(name="Action_Door_L_Open")
    door_fl.animation_data_create()
    door_fl.animation_data.action = act_fl
    door_fl.rotation_euler = Euler((0.0, 0.0, 0.0), 'XYZ')
    door_fl.keyframe_insert(data_path="rotation_euler", frame=1)
    door_fl.rotation_euler = Euler((0.0, 0.0, math.radians(-52.0)), 'XYZ')
    door_fl.keyframe_insert(data_path="rotation_euler", frame=30)
    door_fl.rotation_euler = Euler((0.0, 0.0, 0.0), 'XYZ')

    act_fr = bpy.data.actions.new(name="Action_Door_R_Open")
    door_fr.animation_data_create()
    door_fr.animation_data.action = act_fr
    door_fr.rotation_euler = Euler((0.0, 0.0, 0.0), 'XYZ')
    door_fr.keyframe_insert(data_path="rotation_euler", frame=1)
    door_fr.rotation_euler = Euler((0.0, 0.0, math.radians(52.0)), 'XYZ')
    door_fr.keyframe_insert(data_path="rotation_euler", frame=30)
    door_fr.rotation_euler = Euler((0.0, 0.0, 0.0), 'XYZ')

    act_sw = bpy.data.actions.new(name="Action_Steering_Turn")
    sw_obj.animation_data_create()
    sw_obj.animation_data.action = act_sw
    sw_obj.rotation_euler = Euler((math.radians(22.0), 0.0, 0.0), 'XYZ')
    sw_obj.keyframe_insert(data_path="rotation_euler", frame=1)
    sw_obj.rotation_euler = Euler((math.radians(22.0), 0.0, math.radians(35.0)), 'XYZ')
    sw_obj.keyframe_insert(data_path="rotation_euler", frame=30)
    sw_obj.rotation_euler = Euler((math.radians(22.0), 0.0, math.radians(-35.0)), 'XYZ')
    sw_obj.keyframe_insert(data_path="rotation_euler", frame=60)
    sw_obj.rotation_euler = Euler((math.radians(22.0), 0.0, 0.0), 'XYZ')
    sw_obj.keyframe_insert(data_path="rotation_euler", frame=90)

    for w in wheels:
        act_w = bpy.data.actions.new(name=f"Action_{w.name}_Spin")
        w.animation_data_create()
        w.animation_data.action = act_w
        w.rotation_euler = Euler((0.0, 0.0, 0.0), 'XYZ')
        w.keyframe_insert(data_path="rotation_euler", frame=1)
        w.rotation_euler = Euler((math.radians(360.0), 0.0, 0.0), 'XYZ')
        w.keyframe_insert(data_path="rotation_euler", frame=40)
        w.rotation_euler = Euler((0.0, 0.0, 0.0), 'XYZ')


# ─── 14. Master Execution & glTF Dual-Mode Export ─────────────────────────────
def generate_toyota_supra_master():
    print("=" * 80)
    print("STARTING TOYOTA SUPRA A80 CLASS-A MASTER CAD GENERATION")
    print("=" * 80)

    clean_scene()

    col_master = bpy.data.collections.new("TOYOTA_SUPRA_A80")
    bpy.context.scene.collection.children.link(col_master)

    mats = build_materials()

    print("▸ Building Unibody & Cockpit Aperture...")
    obj_body = build_unibody(col_master, mats)

    print("▸ Building Articulating Doors & Frameless Glass...")
    doors = build_doors(col_master, mats)
    door_fl, door_fr = doors[0], doors[1]

    print("▸ Building Greenhouse Glass & Black Ceramic Frit...")
    obj_glass = build_greenhouse_glass(col_master, mats)

    print("▸ Building High Hoop Rear Spoiler Wing...")
    obj_wing = build_aero_wing(col_master, mats)

    print("▸ Building Triple Projector Front & Quad Round Rear Lighting...")
    obj_lights = build_lighting_optics(col_master, mats)

    print("▸ Building 2JZ-GTE Twin-Turbo Powertrain & Cannon Exhaust...")
    obj_2jz = build_powertrain_2jz(col_master, mats)

    print("▸ Building Chassis Subframe & Inboard Wheel Tubs...")
    obj_chassis = build_chassis_subframe(col_master, mats)

    print("▸ Building 17-Inch Staggered 5-Spoke Alloy Wheels & Brakes...")
    wheel_objs = build_wheels_and_brakes(col_master, mats)

    print("▸ Building Cockpit Interior ('Fighter Jet' Wrap Dash & Recaros)...")
    obj_interior, sw_obj = build_cockpit_interior(col_master, mats)

    print("▸ Building 10 Semantic Audio-Haptic Hitboxes...")
    hitboxes = build_hitboxes(col_master)

    print("▸ Building Standardized Cameras...")
    cameras = build_cameras(col_master)

    print("▸ Baking 7+ NLA Actions...")
    bake_vehicle_actions(door_fl, door_fr, sw_obj, wheel_objs)

    # Pre-Export Modifier Baking Protocol (Preserving Kinematic Pivot Origins!)
    print("Executing pre-export modifier baking protocol...")
    for obj in list(col_master.objects):
        if obj.type == 'MESH':
            bpy.context.view_layer.objects.active = obj
            for mod in list(obj.modifiers):
                if mod.type in ['BEVEL', 'SUBSURF', 'WEIGHTED_NORMAL']:
                    try:
                        bpy.ops.object.modifier_apply(modifier=mod.name)
                    except Exception as e:
                        print(f"    [WARN] Modifier apply error on {obj.name}: {e}")

    total_tris = sum(len(o.data.polygons) * 2 for o in col_master.objects if o.type == 'MESH')
    print(f"[TOYOTA SUPRA A80] Evaluated Class-A CAD Geometry: {total_tris:,} triangles across {len(col_master.objects)} objects.")

    # Export Paths
    export_dir = "e:/Car_Automation/public/models/vehicles/coupe/1990s"
    os.makedirs(export_dir, exist_ok=True)
    os.makedirs("e:/Car_Automation/public/models", exist_ok=True)
    os.makedirs("e:/Car_Automation/exports", exist_ok=True)

    glb_main = os.path.join(export_dir, "vehicle.glb")
    glb_opt = os.path.join(export_dir, "vehicle.opt.glb")

    print(f"▸ Exporting Primary Production GLB to: {glb_main}")
    bpy.ops.export_scene.gltf(
        filepath=glb_main,
        export_format='GLB',
        use_selection=False,
        export_apply=False, # Essential for preserved kinematic hinge origins
        export_extras=True, # Essential for sound_fx & haptic metadata
        export_yup=True,
        export_animations=True,
        export_animation_mode='ACTIONS',
        export_cameras=True,
        export_lights=False
    )

    size_mb = os.path.getsize(glb_main) / (1024 * 1024)
    print(f"✅ Exported vehicle.glb successfully! File size: {size_mb:.2f} MB")

    # Mirror to top-level model locations
    mirrors = [
        "e:/Car_Automation/public/models/Car_Toyota_Supra_A80.glb",
        "e:/Car_Automation/public/models/Car_Toyota_Supra_Complete.glb",
        "e:/Car_Automation/exports/Car_Toyota_Supra_A80.glb",
        "e:/Car_Automation/exports/Car_Toyota_Supra_Complete.glb",
    ]
    for m in mirrors:
        shutil.copy2(glb_main, m)
        print(f"  ▸ Mirrored to: {m}")

    # Generate companion .opt.glb using gltfpack
    print("▸ Generating companion Meshopt compressed asset (vehicle.opt.glb)...")
    try:
        cmd = f'npx -y gltfpack -i "{glb_main}" -o "{glb_opt}" -cc -kn -km -ke'
        res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        if os.path.exists(glb_opt):
            opt_mb = os.path.getsize(glb_opt) / (1024 * 1024)
            print(f"✅ Meshopt companion generated! File size: {opt_mb:.2f} MB")
        else:
            print(f"⚠️ gltfpack did not create {glb_opt}: {res.stderr}")
    except Exception as e:
        print(f"⚠️ gltfpack execution error: {e}")

    print("=" * 80)
    print("TOYOTA SUPRA A80 MASTER CAD PIPELINE COMPLETED")
    print("=" * 80)
    return glb_main


if __name__ == "__main__":
    generate_toyota_supra_master()
