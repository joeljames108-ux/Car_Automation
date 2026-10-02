"""
AUTO TYCOON CAMPUS HQ - UNIT_13 SAFETY, CRASH TEST & HOMOLOGATION HQ GENERATOR (PHASES 163-170)

Generates all 8 progression levels (L0-L7) for UNIT_13:
- Footprint: 28m x 60m (Zone D Linear Collider Plot)
- Architectural Identity: Linear Crash Propulsion Runway, 100-Ton Reinforced Impact Barrier,
  Multi-Axis Load Cell Matrix, ATD Crash Dummy Calibration Lab, Side-Impact Deceleration Sled,
  High-Speed Photogrammetry Camera Towers, Pedestrian Safety Air-Cannon Gantry,
  Rollover Inversion Spit Pit, Roof Crush Hydraulic Press, Active Safety ADAS Robotic Arena,
  and Hypermodern Virtual-Physical Crash Synthesis Spire Tower.

Follows the UNIT_01 Proven Production Standard:
- 100% deterministic GEO_* and HITBOX_* naming convention (zero generic names)
- Parameterized BMesh modeling with clean bevels and smooth shading by angle
- Strict polygon budgets:
    L0:  1,000 -  3,000 tris (Target: ~2,700)
    L1:  8,000 - 12,000 tris (Target: ~10,500)
    L2: 14,000 - 18,000 tris (Target: ~15,500)
    L3: 20,000 - 26,000 tris (Target: ~23,200)
    L4: 30,000 - 40,000 tris (Target: ~34,500)
    L5: 40,000 - 55,000 tris (Target: ~47,800)
    L6: 50,000 - 65,000 tris (Target: ~59,200)
    L7: 60,000 - 80,000 tris (Target: ~71,800)
- Ground contact check (min Z in [-0.45, 0.10])
- Full quality gate compliance via campus_quality_gate.py with ZERO warnings.
"""

import bpy
import bmesh
import math
import os
import sys

# Resolve project root and import campus libraries
current_dir = os.path.dirname(os.path.abspath(__file__))
blender_scripts_dir = os.path.abspath(os.path.join(current_dir, "..", "..", ".."))
workspace_root = os.path.abspath(os.path.join(current_dir, "..", "..", "..", "..", ".."))
if blender_scripts_dir not in sys.path:
    sys.path.insert(0, blender_scripts_dir)

from campus.materials.campus_pbr_library import (
    mat_lavender_brick_1970,
    mat_coral_structural_beam,
    mat_tinted_acrylic_window,
    mat_modern_curtain_glass,
    mat_travertine_concrete,
    mat_dark_slate_roof,
    mat_brushed_aluminum,
    mat_safety_yellow,
    mat_construction_orange,
    mat_cast_iron_dark,
    mat_corrugated_industrial_steel,
    mat_pearl_concept_car_paint,
    mat_holographic_cyan_glow,
    mat_cryo_cyan_emissive,
)
from campus.utils.campus_export_utils import export_campus_glb
from campus.utils.campus_quality_gate import audit_scene, print_audit_summary, CAMPUS_TRIANGLE_BUDGETS

def reset_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for block in bpy.data.meshes:
        if block.users == 0:
            bpy.data.meshes.remove(block)
    for block in bpy.data.materials:
        if block.users == 0:
            bpy.data.materials.remove(block)

def create_mesh_object(name: str, bm: bmesh.types.BMesh, material, parent=None, bevel_width=0.0):
    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new(name, mesh)
    if material:
        obj.data.materials.append(material)
    if parent:
        obj.parent = parent
    bpy.context.collection.objects.link(obj)
    
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.shade_smooth_by_angle(angle=math.radians(34.0))
    
    if bevel_width > 0.001:
        bev = obj.modifiers.new("Bevel", type='BEVEL')
        bev.width = bevel_width
        bev.segments = 2
        bev.limit_method = 'ANGLE'
        bev.angle_limit = math.radians(35.0)
    
    obj.select_set(False)
    return obj

# ── Parameterized BMesh Geometry Helpers ──

def bmesh_box(bm, size: tuple, loc: tuple):
    sx, sy, sz = size
    lx, ly, lz = loc
    x0, x1 = lx - sx/2, lx + sx/2
    y0, y1 = ly - sy/2, ly + sy/2
    z0, z1 = lz - sz/2, lz + sz/2
    v = [
        bm.verts.new((x0, y0, z0)), bm.verts.new((x1, y0, z0)),
        bm.verts.new((x1, y1, z0)), bm.verts.new((x0, y1, z0)),
        bm.verts.new((x0, y0, z1)), bm.verts.new((x1, y0, z1)),
        bm.verts.new((x1, y1, z1)), bm.verts.new((x0, y1, z1))
    ]
    bm.faces.new([v[0], v[1], v[2], v[3]]) # Bottom
    bm.faces.new([v[4], v[7], v[6], v[5]]) # Top
    bm.faces.new([v[0], v[4], v[5], v[1]]) # Front
    bm.faces.new([v[1], v[5], v[6], v[2]]) # Right
    bm.faces.new([v[2], v[6], v[7], v[3]]) # Back
    bm.faces.new([v[3], v[7], v[4], v[0]]) # Left

def bmesh_cylinder(bm, radius: float, height: float, loc: tuple, segments=20, rot_x=0.0, rot_y=0.0, rot_z=0.0):
    lx, ly, lz = loc
    cos_rx, sin_rx = math.cos(rot_x), math.sin(rot_x)
    cos_ry, sin_ry = math.cos(rot_y), math.sin(rot_y)
    cos_rz, sin_rz = math.cos(rot_z), math.sin(rot_z)
    top_verts, bot_verts = [], []
    for i in range(segments):
        theta = i * 2 * math.pi / segments
        vx = radius * math.cos(theta)
        vy = radius * math.sin(theta)
        def transform(x, y, z):
            x0 = x * cos_rz - y * sin_rz
            y0 = x * sin_rz + y * cos_rz
            x1 = x0 * cos_ry + z * sin_ry
            z1 = -x0 * sin_ry + z * cos_ry
            y2 = y0 * cos_rx - z1 * sin_rx
            z2 = y0 * sin_rx + z1 * cos_rx
            return (lx + x1, ly + y2, lz + z2)
        top_verts.append(bm.verts.new(transform(vx, vy, height/2)))
        bot_verts.append(bm.verts.new(transform(vx, vy, -height/2)))
    for i in range(segments):
        i_next = (i + 1) % segments
        bm.faces.new([bot_verts[i], top_verts[i], top_verts[i_next], bot_verts[i_next]])
    bm.faces.new(top_verts)
    bm.faces.new(reversed(bot_verts))

def bmesh_tube(bm, outer_r: float, inner_r: float, height: float, loc: tuple, segments=20, rot_x=0.0, rot_y=0.0, rot_z=0.0):
    lx, ly, lz = loc
    cos_rx, sin_rx = math.cos(rot_x), math.sin(rot_x)
    cos_ry, sin_ry = math.cos(rot_y), math.sin(rot_y)
    cos_rz, sin_rz = math.cos(rot_z), math.sin(rot_z)
    def transform(x, y, z):
        x0 = x * cos_rz - y * sin_rz
        y0 = x * sin_rz + y * cos_rz
        x1 = x0 * cos_ry + z * sin_ry
        z1 = -x0 * sin_ry + z * cos_ry
        y2 = y0 * cos_rx - z1 * sin_rx
        z2 = y0 * sin_rx + z1 * cos_rx
        return (lx + x1, ly + y2, lz + z2)
    t_out, b_out, t_in, b_in = [], [], [], []
    for i in range(segments):
        theta = i * 2 * math.pi / segments
        c, s = math.cos(theta), math.sin(theta)
        t_out.append(bm.verts.new(transform(outer_r * c, outer_r * s, height/2)))
        b_out.append(bm.verts.new(transform(outer_r * c, outer_r * s, -height/2)))
        t_in.append(bm.verts.new(transform(inner_r * c, inner_r * s, height/2)))
        b_in.append(bm.verts.new(transform(inner_r * c, inner_r * s, -height/2)))
    for i in range(segments):
        nxt = (i + 1) % segments
        bm.faces.new([b_out[i], t_out[i], t_out[nxt], b_out[nxt]])
        bm.faces.new([b_in[nxt], t_in[nxt], t_in[i], b_in[i]])
        bm.faces.new([t_out[i], t_in[i], t_in[nxt], t_out[nxt]])
        bm.faces.new([b_out[nxt], b_in[nxt], b_in[i], b_out[i]])

def bmesh_ibeam(bm, length: float, depth: float, flange_w: float, flange_t: float, web_t: float, loc: tuple, axis='Y'):
    lx, ly, lz = loc
    half_d = depth / 2
    if axis == 'Y':
        bmesh_box(bm, (flange_w, length, flange_t), (lx, ly, lz - half_d + flange_t/2))
        bmesh_box(bm, (web_t, length, depth - 2*flange_t), (lx, ly, lz))
        bmesh_box(bm, (flange_w, length, flange_t), (lx, ly, lz + half_d - flange_t/2))
    elif axis == 'X':
        bmesh_box(bm, (length, flange_w, flange_t), (lx, ly, lz - half_d + flange_t/2))
        bmesh_box(bm, (length, web_t, depth - 2*flange_t), (lx, ly, lz))
        bmesh_box(bm, (length, flange_w, flange_t), (lx, ly, lz + half_d - flange_t/2))
    elif axis == 'Z':
        bmesh_box(bm, (flange_w, flange_t, length), (lx, ly - half_d + flange_t/2, lz))
        bmesh_box(bm, (web_t, depth - 2*flange_t, length), (lx, ly, lz))
        bmesh_box(bm, (flange_w, flange_t, length), (lx, ly + half_d - flange_t/2, lz))

def bmesh_truss_span(bm, length: float, width: float, depth: float, loc: tuple, bays=8, axis='X'):
    """Generates a structural steel 4-chord box truss beam with diagonal cross-lacing."""
    lx, ly, lz = loc
    chord_r = 0.04
    strut_r = 0.022
    hw, hd = width / 2, depth / 2
    if axis == 'X':
        for cy in [-hw, hw]:
            for cz in [-hd, hd]:
                bmesh_cylinder(bm, chord_r, length, (lx, ly + cy, lz + cz), segments=8, rot_y=math.radians(90.0))
        bay_len = length / bays
        for b in range(bays + 1):
            bx = lx - length/2 + b * bay_len
            bmesh_cylinder(bm, strut_r, width, (bx, ly, lz - hd), segments=6, rot_x=math.radians(90.0))
            bmesh_cylinder(bm, strut_r, width, (bx, ly, lz + hd), segments=6, rot_x=math.radians(90.0))
            bmesh_cylinder(bm, strut_r, depth, (bx, ly - hw, lz), segments=6)
            bmesh_cylinder(bm, strut_r, depth, (bx, ly + hw, lz), segments=6)
            if b < bays:
                mid_x = bx + bay_len / 2
                diag_len = math.sqrt(bay_len**2 + depth**2)
                ang = math.atan2(depth, bay_len)
                bmesh_cylinder(bm, strut_r, diag_len, (mid_x, ly - hw, lz), segments=6, rot_y=-ang)
                bmesh_cylinder(bm, strut_r, diag_len, (mid_x, ly + hw, lz), segments=6, rot_y=-ang)
    elif axis == 'Y':
        for cx in [-hw, hw]:
            for cz in [-hd, hd]:
                bmesh_cylinder(bm, chord_r, length, (lx + cx, ly, lz + cz), segments=8, rot_x=math.radians(90.0))
        bay_len = length / bays
        for b in range(bays + 1):
            by = ly - length/2 + b * bay_len
            bmesh_cylinder(bm, strut_r, width, (lx, by, lz - hd), segments=6, rot_y=math.radians(90.0))
            bmesh_cylinder(bm, strut_r, width, (lx, by, lz + hd), segments=6, rot_y=math.radians(90.0))
            bmesh_cylinder(bm, strut_r, depth, (lx - hw, by, lz), segments=6)
            bmesh_cylinder(bm, strut_r, depth, (lx + hw, by, lz), segments=6)

# ── Specialized Safety & Crash Test Procedural Subassemblies ──

def bmesh_surveyor_theodolite(bm, loc: tuple):
    """Creates a precision surveyor theodolite on an aluminum tripod (~280 tris)."""
    lx, ly, lz = loc
    for i in range(3):
        angle = i * (2 * math.pi / 3)
        foot_x = lx + 0.65 * math.cos(angle)
        foot_y = ly + 0.65 * math.sin(angle)
        leg_mid_x = (lx + foot_x) / 2
        leg_mid_y = (ly + foot_y) / 2
        bmesh_cylinder(bm, 0.028, 1.35, (leg_mid_x, leg_mid_y, lz + 0.65), segments=8, rot_x=math.radians(24.0), rot_z=-angle)
        bmesh_cylinder(bm, 0.042, 0.10, (leg_mid_x, leg_mid_y, lz + 0.65), segments=8)
    bmesh_cylinder(bm, 0.15, 0.08, (lx, ly, lz + 1.25), segments=12)
    bmesh_box(bm, (0.16, 0.16, 0.25), (lx, ly, lz + 1.45))
    bmesh_cylinder(bm, 0.042, 0.32, (lx, ly, lz + 1.52), segments=12, rot_x=math.radians(90.0))
    bmesh_cylinder(bm, 0.065, 0.04, (lx + 0.09, ly, lz + 1.52), segments=10, rot_y=math.radians(90.0))

def bmesh_crash_test_sedan(bm, loc: tuple, crumpled=True):
    """Detailed instrumented crash test vehicle with roll cage, wheels, targets (~2,600 tris)."""
    lx, ly, lz = loc
    bmesh_box(bm, (1.95, 4.4, 0.22), (lx, ly, lz + 0.28))
    bmesh_box(bm, (1.92, 2.4, 0.85), (lx, ly - 0.2, lz + 0.75))
    bmesh_box(bm, (1.65, 1.9, 0.65), (lx, ly - 0.25, lz + 1.42))
    bmesh_box(bm, (1.90, 1.1, 0.72), (lx, ly - 1.7, lz + 0.72))
    
    if crumpled:
        bmesh_box(bm, (1.88, 0.35, 0.78), (lx, ly + 1.15, lz + 0.76))
        bmesh_box(bm, (1.78, 0.30, 0.74), (lx, ly + 1.45, lz + 0.78))
        bmesh_box(bm, (1.68, 0.25, 0.68), (lx, ly + 1.70, lz + 0.82))
        bmesh_box(bm, (1.60, 0.20, 0.58), (lx, ly + 1.90, lz + 0.86))
    else:
        bmesh_box(bm, (1.88, 1.2, 0.70), (lx, ly + 1.5, lz + 0.70))
        
    for rc_y in [-1.0, -0.2, 0.6]:
        bmesh_cylinder(bm, 0.035, 1.35, (lx - 0.75, ly + rc_y, lz + 0.95), segments=8)
        bmesh_cylinder(bm, 0.035, 1.35, (lx + 0.75, ly + rc_y, lz + 0.95), segments=8)
        bmesh_cylinder(bm, 0.035, 1.50, (lx, ly + rc_y, lz + 1.62), segments=8, rot_y=math.radians(90.0))
    bmesh_cylinder(bm, 0.035, 1.6, (lx - 0.75, ly - 0.2, lz + 1.62), segments=8, rot_x=math.radians(90.0))
    bmesh_cylinder(bm, 0.035, 1.6, (lx + 0.75, ly - 0.2, lz + 1.62), segments=8, rot_x=math.radians(90.0))
    
    for wx in [lx - 1.02, lx + 1.02]:
        for wy in [ly - 1.35, ly + 1.25]:
            bmesh_tube(bm, 0.36, 0.22, 0.24, (wx, wy, lz + 0.36), segments=16, rot_y=math.radians(90.0))
            bmesh_tube(bm, 0.23, 0.10, 0.20, (wx, wy, lz + 0.36), segments=14, rot_y=math.radians(90.0))
            bmesh_cylinder(bm, 0.08, 0.22, (wx, wy, lz + 0.36), segments=10, rot_y=math.radians(90.0))
            for sp in range(5):
                sang = sp * 2 * math.pi / 5
                sx = wx
                sy = wy + 0.15 * math.cos(sang)
                sz = lz + 0.36 + 0.15 * math.sin(sang)
                bmesh_cylinder(bm, 0.024, 0.14, (sx, sy, sz), segments=6, rot_x=sang)

    for px in [lx - 0.97, lx + 0.97]:
        for py in [ly - 1.0, ly - 0.2, ly + 0.6]:
            bmesh_cylinder(bm, 0.08, 0.02, (px, py, lz + 0.85), segments=10, rot_y=math.radians(90.0))
    for rz_pos in [ly - 0.6, ly, ly + 0.4]:
        bmesh_cylinder(bm, 0.09, 0.02, (lx, rz_pos, lz + 1.76), segments=10)

def bmesh_floodlight_bank(bm, loc: tuple, rot_x=0.0):
    """High-intensity 10kW photogrammetry floodlight array (~340 tris)."""
    lx, ly, lz = loc
    bmesh_box(bm, (0.08, 0.95, 0.65), (lx - 0.85, ly, lz))
    bmesh_box(bm, (0.08, 0.95, 0.65), (lx + 0.85, ly, lz))
    bmesh_box(bm, (1.75, 0.08, 0.08), (lx, ly, lz - 0.32))
    bmesh_box(bm, (1.60, 0.85, 0.55), (lx, ly, lz))
    for fx in [-0.55, -0.18, 0.18, 0.55]:
        bmesh_cylinder(bm, 0.16, 0.12, (lx + fx, ly, lz - 0.26), segments=12, rot_x=math.radians(90.0))
    for f in range(6):
        bmesh_box(bm, (1.50, 0.02, 0.45), (lx, ly + 0.44 + f*0.04, lz))

def bmesh_crash_dummy(bm, loc: tuple, seated=True):
    """Articulated Hybrid III anthropomorphic test dummy (~420 tris)."""
    lx, ly, lz = loc
    bmesh_cylinder(bm, 0.11, 0.22, (lx, ly, lz + 1.25), segments=12)
    bmesh_cylinder(bm, 0.055, 0.12, (lx, ly, lz + 1.10), segments=10)
    bmesh_box(bm, (0.36, 0.24, 0.45), (lx, ly, lz + 0.82))
    bmesh_box(bm, (0.34, 0.26, 0.22), (lx, ly, lz + 0.50))
    if seated:
        bmesh_cylinder(bm, 0.075, 0.42, (lx - 0.11, ly + 0.22, lz + 0.48), segments=10, rot_x=math.radians(90.0))
        bmesh_cylinder(bm, 0.075, 0.42, (lx + 0.11, ly + 0.22, lz + 0.48), segments=10, rot_x=math.radians(90.0))
        bmesh_cylinder(bm, 0.065, 0.45, (lx - 0.11, ly + 0.42, lz + 0.22), segments=10)
        bmesh_cylinder(bm, 0.065, 0.45, (lx + 0.11, ly + 0.42, lz + 0.22), segments=10)
        bmesh_box(bm, (0.09, 0.22, 0.07), (lx - 0.11, ly + 0.48, lz + 0.035))
        bmesh_box(bm, (0.09, 0.22, 0.07), (lx + 0.11, ly + 0.48, lz + 0.035))
        bmesh_cylinder(bm, 0.055, 0.32, (lx - 0.24, ly + 0.10, lz + 0.75), segments=8, rot_x=math.radians(45.0))
        bmesh_cylinder(bm, 0.055, 0.32, (lx + 0.24, ly + 0.10, lz + 0.75), segments=8, rot_x=math.radians(45.0))
    else:
        bmesh_cylinder(bm, 0.075, 0.48, (lx - 0.11, ly, lz + 0.24), segments=10)
        bmesh_cylinder(bm, 0.075, 0.48, (lx + 0.11, ly, lz + 0.24), segments=10)
        bmesh_cylinder(bm, 0.055, 0.55, (lx - 0.24, ly, lz + 0.65), segments=8)
        bmesh_cylinder(bm, 0.055, 0.55, (lx + 0.24, ly, lz + 0.65), segments=8)

def bmesh_high_speed_camera(bm, loc: tuple, height=3.2):
    """High-speed 1,000 FPS photogrammetry camera on heavy telescopic pedestal (~480 tris)."""
    lx, ly, lz = loc
    bmesh_cylinder(bm, 0.55, 0.08, (lx, ly, lz + 0.04), segments=16)
    bmesh_cylinder(bm, 0.08, height, (lx, ly, lz + height/2), segments=14)
    bmesh_cylinder(bm, 0.12, 0.18, (lx, ly, lz + height * 0.6), segments=16)
    bmesh_box(bm, (0.24, 0.24, 0.16), (lx, ly, lz + height + 0.08))
    bmesh_box(bm, (0.22, 0.42, 0.24), (lx, ly, lz + height + 0.26))
    bmesh_tube(bm, 0.09, 0.07, 0.22, (lx, ly - 0.28, lz + height + 0.26), segments=18, rot_x=math.radians(90.0))
    bmesh_cylinder(bm, 0.065, 0.04, (lx, ly - 0.38, lz + height + 0.26), segments=16, rot_x=math.radians(90.0))
    bmesh_cylinder(bm, 0.07, 0.04, (lx, ly + 0.23, lz + height + 0.26), segments=14, rot_x=math.radians(90.0))
    # 8 cooling fins on camera top
    for fi in range(8):
        bmesh_box(bm, (0.18, 0.02, 0.05), (lx, ly - 0.14 + fi * 0.04, lz + height + 0.40))

# ── LEVEL BUILDERS ──

def build_safety_l0(export_path: str):
    """L0: Survey Site & Bedrock Impact Footing Prep (Target: ~2,700 tris)."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_13_SAFETY_HQ_L0", None)
    bpy.context.collection.objects.link(root)
    
    # 1. Foundation Plinth (28m x 60m x 0.3m, Z in [-0.30, 0.0])
    bm_plinth = bmesh.new()
    bmesh_box(bm_plinth, (28.0, 60.0, 0.3), (0.0, 0.0, -0.15))
    create_mesh_object("GEO_Safety_Foundation_Plinth", bm_plinth, mat_travertine_concrete(), root, 0.04)
    
    # 2. Linear Runway Excavation Trench & Barrier Footing Pit
    bm_excav = bmesh.new()
    bmesh_box(bm_excav, (10.5, 45.0, 0.15), (-2.0, -6.0, 0.075))
    bmesh_box(bm_excav, (8.5, 7.5, 0.25), (-2.0, 13.0, 0.125))
    for ax in [-5.0, -2.0, 1.0]:
        for ay in [10.5, 13.0, 15.5]:
            bmesh_cylinder(bm_excav, 0.045, 0.5, (ax, ay, 0.35), segments=8)
            bmesh_cylinder(bm_excav, 0.09, 0.08, (ax, ay, 0.25), segments=8)
    create_mesh_object("GEO_Safety_Foundation_Excavation", bm_excav, mat_cast_iron_dark(), root)
    
    # 3. Precision Surveyor Total Stations & Theodolites
    bm_surv = bmesh.new()
    bmesh_surveyor_theodolite(bm_surv, (-2.0, -25.0, 0.0))
    bmesh_surveyor_theodolite(bm_surv, (-2.0, 22.0, 0.0))
    bmesh_surveyor_theodolite(bm_surv, (10.0, 0.0, 0.0))
    create_mesh_object("GEO_Safety_Survey_Theodolites", bm_surv, mat_safety_yellow(), root)
    
    # 4. Geotechnical Core Drill Rig
    bm_drill = bmesh.new()
    bmesh_box(bm_drill, (0.45, 2.6, 0.45), (-8.0, 13.0, 0.225))
    bmesh_box(bm_drill, (0.45, 2.6, 0.45), (-6.4, 13.0, 0.225))
    bmesh_box(bm_drill, (1.4, 2.0, 0.35), (-7.2, 13.0, 0.55))
    bmesh_box(bm_drill, (0.28, 0.28, 3.8), (-7.2, 12.4, 2.2))
    bmesh_cylinder(bm_drill, 0.06, 3.2, (-7.2, 12.1, 1.8), segments=10)
    create_mesh_object("GEO_Safety_Core_Drill_Rig", bm_drill, mat_construction_orange(), root)
    
    # 5. Boundary Survey Stakes (16 stakes)
    bm_stakes = bmesh.new()
    for sx in [-13.0, 13.0]:
        for y_idx in range(8):
            sy = -28.0 + y_idx * 8.0
            bmesh_cylinder(bm_stakes, 0.045, 1.6, (sx, sy, 0.8), segments=8)
            bmesh_box(bm_stakes, (0.02, 0.25, 0.18), (sx, sy, 1.5))
    create_mesh_object("GEO_Safety_Boundary_Stakes", bm_stakes, mat_safety_yellow(), root)
    
    # 6. Site Security Fence & Project Signboard
    bm_fence = bmesh.new()
    for py in [-28.0, 28.0]:
        for x_idx in range(9):
            px = -12.0 + x_idx * 3.0
            bmesh_cylinder(bm_fence, 0.04, 1.2, (px, py, 0.6), segments=8)
    bmesh_box(bm_fence, (24.0, 0.06, 0.06), (0.0, -28.0, 1.0))
    bmesh_box(bm_fence, (24.0, 0.06, 0.06), (0.0, 28.0, 1.0))
    bmesh_box(bm_fence, (0.15, 0.15, 2.8), (6.0, 25.0, 1.4))
    bmesh_box(bm_fence, (0.15, 0.15, 2.8), (11.0, 25.0, 1.4))
    bmesh_box(bm_fence, (5.4, 0.12, 1.8), (8.5, 25.0, 2.2))
    create_mesh_object("GEO_Safety_Site_Signboard_Fence", bm_fence, mat_dark_slate_roof(), root)
    
    # Semantic Hitboxes
    bm_hitbox = bmesh.new()
    bmesh_box(bm_hitbox, (26.0, 58.0, 3.5), (0.0, 0.0, 1.75))
    create_mesh_object("HITBOX_SAFETY_MAIN", bm_hitbox, None, root)
    
    bm_track_hb = bmesh.new()
    bmesh_box(bm_track_hb, (12.0, 48.0, 2.0), (-2.0, -6.0, 1.0))
    create_mesh_object("HITBOX_SAFETY_TRACK", bm_track_hb, None, root)
    
    extras = {
        "unit_id": "SAFETY_HQ",
        "unit_key": "UNIT_13",
        "level": 0,
        "tier": "empty_plot",
        "building_name": "Safety & Crash Test Center (Survey & Ground Prep)",
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

def add_base_safety_l1(root):
    """Builds the comprehensive L1 baseline: linear crash runway, 100-ton barrier, car, gantries, bunker (~10,500 tris)."""
    # 1. Foundation Plinth (28m x 60m x 0.3m, Z in [-0.30, 0.0])
    bm_plinth = bmesh.new()
    bmesh_box(bm_plinth, (28.0, 60.0, 0.3), (0.0, 0.0, -0.15))
    create_mesh_object("GEO_Safety_Foundation_Plinth", bm_plinth, mat_travertine_concrete(), root, 0.04)
    
    # 2. Main Linear Crash Track Runway Channel (X = -2.0m, length = 44m)
    bm_runway = bmesh.new()
    bmesh_box(bm_runway, (10.0, 44.0, 0.4), (-2.0, -6.0, 0.2))
    bmesh_box(bm_runway, (0.45, 44.0, 0.35), (-7.2, -6.0, 0.35))
    bmesh_box(bm_runway, (0.45, 44.0, 0.35), (3.2, -6.0, 0.35))
    create_mesh_object("GEO_Safety_Crash_Runway_Hall", bm_runway, mat_travertine_concrete(), root, 0.04)
    
    # Twin Steel Tow Guide Rails & Center Cable Channel
    bm_rails = bmesh.new()
    bmesh_ibeam(bm_rails, 43.0, 0.16, 0.14, 0.025, 0.02, (-3.2, -6.0, 0.32), axis='Y')
    bmesh_ibeam(bm_rails, 43.0, 0.16, 0.14, 0.025, 0.02, (-0.8, -6.0, 0.32), axis='Y')
    bmesh_box(bm_rails, (0.65, 43.0, 0.12), (-2.0, -6.0, 0.22))
    for ry in range(-25, 10, 3):
        bmesh_cylinder(bm_rails, 0.065, 0.45, (-2.0, float(ry), 0.26), segments=10, rot_y=math.radians(90.0))
    create_mesh_object("GEO_Safety_Guide_Rails_Trench", bm_rails, mat_cast_iron_dark(), root)
    
    # 3. 100-Ton Reinforced Concrete Impact Barrier Block (Impact point at Y = 12.0m)
    bm_barrier = bmesh.new()
    bmesh_box(bm_barrier, (8.5, 6.5, 5.8), (-2.0, 15.25, 2.9))
    for bx in [-5.0, -2.0, 1.0]:
        bmesh_box(bm_barrier, (0.85, 3.5, 4.5), (bx, 19.5, 2.25))
    create_mesh_object("GEO_Safety_Rigid_Impact_Barrier", bm_barrier, mat_travertine_concrete(), root, 0.08)
    
    # Barrier Impact Face & Load Cell Matrix
    bm_hazard = bmesh.new()
    bmesh_box(bm_hazard, (7.8, 0.25, 4.8), (-2.0, 11.9, 2.6))
    for r in range(6):
        for c in range(8):
            lx_pad = -5.0 + c * 0.85
            lz_pad = 0.6 + r * 0.70
            bmesh_cylinder(bm_hazard, 0.10, 0.08, (lx_pad, 11.75, lz_pad), segments=10, rot_x=math.radians(90.0))
    create_mesh_object("GEO_Safety_Barrier_Hazard_Face", bm_hazard, mat_safety_yellow(), root)
    
    # 4. Runway Tow Winch Drive Motor Housing
    bm_winch = bmesh.new()
    bmesh_box(bm_winch, (4.5, 4.0, 0.5), (-2.0, -26.0, 0.25))
    bmesh_cylinder(bm_winch, 0.65, 1.8, (-1.2, -26.0, 1.2), segments=16, rot_x=math.radians(90.0))
    bmesh_tube(bm_winch, 0.75, 0.35, 1.4, (-3.0, -26.0, 1.2), segments=16, rot_y=math.radians(90.0))
    bmesh_box(bm_winch, (1.2, 0.8, 2.2), (1.5, -26.0, 1.35))
    create_mesh_object("GEO_Safety_Runway_Tow_Winch", bm_winch, mat_construction_orange(), root)
    
    # 5. Instrumented Crash Test Sedan at Point of Barrier Impact (Y = 9.8m)
    bm_car = bmesh.new()
    bmesh_crash_test_sedan(bm_car, (-2.0, 9.8, 0.0), crumpled=True)
    create_mesh_object("GEO_Safety_Crash_Test_Vehicle", bm_car, mat_pearl_concept_car_paint(), root)
    
    # 6. Overhead High-Speed Photogrammetry Lighting Truss Gantries
    bm_lights = bmesh.new()
    for ty in [2.0, 6.0, 10.0]:
        bmesh_truss_span(bm_lights, 12.0, 0.7, 0.7, (-2.0, ty, 7.2), bays=8, axis='X')
        bmesh_cylinder(bm_lights, 0.12, 7.2, (-7.6, ty, 3.6), segments=10)
        bmesh_cylinder(bm_lights, 0.12, 7.2, (3.6, ty, 3.6), segments=10)
        bmesh_floodlight_bank(bm_lights, (-5.2, ty, 6.4), rot_x=math.radians(20.0))
        bmesh_floodlight_bank(bm_lights, (1.2, ty, 6.4), rot_x=math.radians(20.0))
    create_mesh_object("GEO_Safety_Photogrammetry_Lighting_Truss", bm_lights, mat_safety_yellow(), root)
    
    # 7. Telemetry & Observation Bunker Office
    bm_office = bmesh.new()
    bmesh_box(bm_office, (8.5, 36.0, 6.2), (9.25, 0.0, 3.1))
    bmesh_box(bm_office, (9.0, 36.6, 0.4), (9.25, 0.0, 6.3))
    bmesh_box(bm_office, (3.2, 5.5, 1.8), (9.0, -8.0, 7.4))
    bmesh_box(bm_office, (3.2, 5.5, 1.8), (9.0, 8.0, 7.4))
    create_mesh_object("GEO_Safety_Telemetry_Office_Halls", bm_office, mat_lavender_brick_1970(), root, 0.06)
    
    # 8. Reinforced Ballistic Observation Windows & Mullions
    bm_win = bmesh.new()
    bmesh_box(bm_win, (0.15, 26.0, 2.2), (4.92, 0.0, 3.8))
    for ey in range(-12, 13, 6):
        bmesh_box(bm_win, (0.15, 2.8, 1.8), (13.58, float(ey), 3.5))
    create_mesh_object("GEO_Safety_Observation_Glass", bm_win, mat_tinted_acrylic_window(), root)
    
    bm_mull = bmesh.new()
    for wy in range(-12, 13, 3):
        bmesh_box(bm_mull, (0.28, 0.16, 2.4), (4.95, float(wy), 3.8))
    bmesh_box(bm_mull, (1.2, 28.0, 0.25), (4.6, 0.0, 5.0))
    create_mesh_object("GEO_Safety_Observation_Mullions", bm_mull, mat_brushed_aluminum(), root)
    
    # Semantic Hitboxes
    bm_hitbox = bmesh.new()
    bmesh_box(bm_hitbox, (26.0, 58.0, 9.0), (0.0, 0.0, 4.5))
    create_mesh_object("HITBOX_SAFETY_MAIN", bm_hitbox, None, root)
    
    bm_track_hb = bmesh.new()
    bmesh_box(bm_track_hb, (12.0, 46.0, 8.5), (-2.0, -6.0, 4.25))
    create_mesh_object("HITBOX_SAFETY_TRACK", bm_track_hb, None, root)

def build_safety_l1(export_path: str):
    """L1: 1970s Linear Crash Runway & 100-Ton Barrier Block (Target: ~10,500 tris)."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_13_SAFETY_HQ_L1", None)
    bpy.context.collection.objects.link(root)
    add_base_safety_l1(root)
    
    extras = {
        "unit_id": "SAFETY_HQ",
        "unit_key": "UNIT_13",
        "level": 1,
        "tier": "office",
        "building_name": "Safety & Crash Test Center (Linear Crash Runway)",
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

def add_safety_l2_geometry(root):
    """Adds L2 ATD Crash Dummy Calibration Lab (+4,800 tris -> ~15,300 tris)."""
    # 1. ATD Crash Dummy Calibration Lab Annex (West flank: X = -10.5m, Y = 0.0m, 6m x 22m x 6.5m)
    bm_dummy_shell = bmesh.new()
    bmesh_box(bm_dummy_shell, (6.2, 22.0, 6.2), (-10.5, 0.0, 3.1))
    bmesh_box(bm_dummy_shell, (6.6, 22.4, 0.4), (-10.5, 0.0, 6.3))
    create_mesh_object("GEO_Safety_Dummy_Lab_Shell", bm_dummy_shell, mat_lavender_brick_1970(), root, 0.05)
    
    # Windows for Dummy Lab
    bm_dummy_win = bmesh.new()
    for dy in [-7.0, -2.0, 3.0, 8.0]:
        bmesh_box(bm_dummy_win, (0.15, 2.4, 1.8), (-13.65, dy, 3.5))
    create_mesh_object("GEO_Safety_Dummy_Lab_Windows", bm_dummy_win, mat_tinted_acrylic_window(), root)
    
    # 2. Crash Test Dummy Storage & Calibration Racks (4 vertical racks with 6 detailed ATD dummies)
    bm_dummies = bmesh.new()
    for i, ry in enumerate([-7.5, -2.5, 2.5, 7.5]):
        bmesh_box(bm_dummies, (1.4, 2.2, 0.15), (-10.5, ry, 0.10))
        bmesh_box(bm_dummies, (0.10, 0.10, 2.2), (-11.1, ry - 1.0, 1.15))
        bmesh_box(bm_dummies, (0.10, 0.10, 2.2), (-11.1, ry + 1.0, 1.15))
        bmesh_box(bm_dummies, (0.10, 0.10, 2.2), (-9.9, ry - 1.0, 1.15))
        bmesh_box(bm_dummies, (0.10, 0.10, 2.2), (-9.9, ry + 1.0, 1.15))
        bmesh_box(bm_dummies, (1.2, 0.06, 0.06), (-10.5, ry, 1.8))
        if i % 2 == 0:
            bmesh_crash_dummy(bm_dummies, (-10.5, ry - 0.45, 0.1), seated=True)
            bmesh_crash_dummy(bm_dummies, (-10.5, ry + 0.45, 0.1), seated=True)
        else:
            bmesh_crash_dummy(bm_dummies, (-10.5, ry, 0.1), seated=False)
    for pi in range(4):
        py = -5.0 + pi * 3.2
        bmesh_box(bm_dummies, (1.2, 0.8, 1.8), (-8.2, py, 0.9))
        bmesh_cylinder(bm_dummies, 0.10, 0.20, (-8.2, py, 1.9), segments=14)
        bmesh_box(bm_dummies, (0.32, 0.22, 0.35), (-8.2, py - 0.2, 1.05))
    create_mesh_object("GEO_Safety_ATD_Crash_Dummies", bm_dummies, mat_construction_orange(), root)
    
    # 3. Dummy Head Drop Calibration Test Tower & Thorax Impact Pendulum
    bm_calib_rigs = bmesh.new()
    bmesh_cylinder(bm_calib_rigs, 0.45, 0.12, (-10.5, -9.5, 0.10), segments=16)
    bmesh_cylinder(bm_calib_rigs, 0.04, 3.4, (-10.65, -9.5, 1.7), segments=10)
    bmesh_cylinder(bm_calib_rigs, 0.04, 3.4, (-10.35, -9.5, 1.7), segments=10)
    bmesh_box(bm_calib_rigs, (0.42, 0.25, 0.18), (-10.5, -9.5, 2.4))
    bmesh_box(bm_calib_rigs, (1.8, 1.2, 0.8), (-10.5, 9.8, 0.4))
    bmesh_box(bm_calib_rigs, (0.8, 0.8, 1.2), (-10.5, 9.8, 1.2))
    bmesh_cylinder(bm_calib_rigs, 0.035, 1.8, (-10.5, 9.0, 1.8), segments=10, rot_x=math.radians(35.0))
    bmesh_cylinder(bm_calib_rigs, 0.12, 0.22, (-10.5, 8.4, 1.2), segments=14, rot_x=math.radians(90.0))
    create_mesh_object("GEO_Safety_Calibration_Test_Rigs", bm_calib_rigs, mat_coral_structural_beam(), root)
    
    # 4. Telemetry DAQ Consoles, Bridge Amplifiers & Gas Manifold Racks
    bm_daq = bmesh.new()
    for ri in range(4):
        rx = -12.5
        ry = -4.5 + ri * 3.0
        bmesh_box(bm_daq, (0.85, 1.2, 2.2), (rx, ry, 1.1))
        bmesh_cylinder(bm_daq, 0.18, 0.05, (rx + 0.43, ry, 1.6), segments=14, rot_y=math.radians(90.0))
        for fi in range(8):
            bmesh_box(bm_daq, (0.02, 0.8, 0.06), (rx + 0.43, ry, 0.4 + fi * 0.12))
    for bi in range(16):
        by = -8.0 + bi * 1.0
        bmesh_cylinder(bm_daq, 0.12, 1.6, (-7.6, by, 0.8), segments=14)
        bmesh_cylinder(bm_daq, 0.04, 0.15, (-7.6, by, 1.65), segments=10)
    create_mesh_object("GEO_Safety_DAQ_Instrumentation_Racks", bm_daq, mat_brushed_aluminum(), root)

def build_safety_l2(export_path: str):
    """L2: ATD Crash Dummy Calibration Lab (Target: ~15,500 tris)."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_13_SAFETY_HQ_L2", None)
    bpy.context.collection.objects.link(root)
    add_base_safety_l1(root)
    add_safety_l2_geometry(root)
    
    extras = {
        "unit_id": "SAFETY_HQ",
        "unit_key": "UNIT_13",
        "level": 2,
        "tier": "department",
        "building_name": "Safety HQ (Crash Test Dummy Calibration Lab)",
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

def add_safety_l3_geometry(root):
    """Adds L3 Side-Impact Sled & High-Speed Photogrammetry Camera Towers (+7,800 tris -> ~23,200 tris)."""
    # 1. Transverse Side-Impact Deceleration Sled Track (Y = 6.0m, X from -10.0m to 8.0m)
    bm_sled_track = bmesh.new()
    bmesh_box(bm_sled_track, (18.5, 2.6, 0.35), (-1.0, 6.0, 0.2))
    bmesh_ibeam(bm_sled_track, 18.0, 0.18, 0.16, 0.03, 0.025, (-1.0, 5.4, 0.35), axis='X')
    bmesh_ibeam(bm_sled_track, 18.0, 0.18, 0.16, 0.03, 0.025, (-1.0, 6.6, 0.35), axis='X')
    bmesh_cylinder(bm_sled_track, 0.32, 3.5, (-8.5, 6.0, 0.55), segments=18, rot_y=math.radians(90.0))
    bmesh_box(bm_sled_track, (1.2, 1.4, 1.2), (-10.0, 6.0, 0.6))
    for ci in range(40):
        bmesh_box(bm_sled_track, (0.12, 0.16, 0.08), (-7.5 + ci * 0.35, 5.0, 0.25))
    create_mesh_object("GEO_Safety_Side_Impact_Track", bm_sled_track, mat_cast_iron_dark(), root)
    
    # 2. Movable Deformable Barrier (MDB) Ram Sled Trolley
    bm_mdb = bmesh.new()
    bmesh_box(bm_mdb, (2.6, 1.8, 0.45), (-5.0, 6.0, 0.60))
    for wx in [-6.0, -4.0]:
        for wy in [5.15, 6.85]:
            bmesh_cylinder(bm_mdb, 0.18, 0.12, (wx, wy, 0.35), segments=16, rot_x=math.radians(90.0))
    bmesh_box(bm_mdb, (0.55, 1.6, 0.85), (-3.5, 6.0, 0.85))
    for f in range(10):
        bmesh_box(bm_mdb, (1.8, 1.4, 0.04), (-5.0, 6.0, 0.85 + f*0.06))
    create_mesh_object("GEO_Safety_MDB_Ram_Sled", bm_mdb, mat_coral_structural_beam(), root)
    
    # 3. 4 High-Speed Photogrammetry Camera Towers
    bm_cams = bmesh.new()
    bmesh_high_speed_camera(bm_cams, (-7.5, 1.0, 0.0), height=3.6)
    bmesh_high_speed_camera(bm_cams, (3.5, 1.0, 0.0), height=3.6)
    bmesh_high_speed_camera(bm_cams, (-7.5, 11.0, 0.0), height=4.2)
    bmesh_high_speed_camera(bm_cams, (3.5, 11.0, 0.0), height=4.2)
    create_mesh_object("GEO_Safety_High_Speed_Cameras", bm_cams, mat_safety_yellow(), root)
    
    # 4. Pulsed Strobe Photogrammetry Lighting Units (12 units)
    bm_strobes = bmesh.new()
    for si in range(12):
        sy = 0.5 + si * 1.1
        bmesh_cylinder(bm_strobes, 0.05, 1.8, (-7.6, sy, 5.0), segments=10, rot_y=math.radians(45.0))
        bmesh_cylinder(bm_strobes, 0.16, 0.22, (-6.5, sy, 5.8), segments=16, rot_y=math.radians(90.0))
        bmesh_box(bm_strobes, (0.35, 0.35, 0.15), (-6.3, sy, 5.8))
        # 4 barn doors per strobe
        bmesh_box(bm_strobes, (0.02, 0.35, 0.12), (-6.1, sy, 5.95))
        bmesh_box(bm_strobes, (0.02, 0.35, 0.12), (-6.1, sy, 5.65))
    create_mesh_object("GEO_Safety_Pulsed_Strobes", bm_strobes, mat_brushed_aluminum(), root)
    
    # 5. Photogrammetry Optical Floor Calibration Grid Targets (96 target discs)
    bm_floor_grid = bmesh.new()
    for r in range(8):
        for c in range(12):
            tx = -6.5 + c * 0.8
            ty = 2.0 + r * 1.2
            bmesh_cylinder(bm_floor_grid, 0.065, 0.015, (tx, ty, 0.41), segments=12)
    create_mesh_object("GEO_Safety_Photogrammetry_Floor_Targets", bm_floor_grid, mat_safety_yellow(), root)
    
    # 6. Optical Calibration Checkerboard Reference Backdrops
    bm_boards = bmesh.new()
    bmesh_box(bm_boards, (0.12, 6.2, 3.2), (-8.0, 8.5, 2.2))
    bmesh_cylinder(bm_boards, 0.08, 3.8, (-8.0, 5.6, 1.9), segments=12)
    bmesh_cylinder(bm_boards, 0.08, 3.8, (-8.0, 11.4, 1.9), segments=12)
    for row in range(5):
        for col in range(9):
            bmesh_box(bm_boards, (0.02, 0.6, 0.55), (-7.92, 6.0 + col * 0.65, 0.8 + row * 0.65))
    create_mesh_object("GEO_Safety_Checkerboard_Backdrops", bm_boards, mat_travertine_concrete(), root)

def build_safety_l3(export_path: str):
    """L3: Side-Impact Sled & High-Speed Photogrammetry Camera Rig (Target: ~23,200 tris)."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_13_SAFETY_HQ_L3", None)
    bpy.context.collection.objects.link(root)
    add_base_safety_l1(root)
    add_safety_l2_geometry(root)
    add_safety_l3_geometry(root)
    
    extras = {
        "unit_id": "SAFETY_HQ",
        "unit_key": "UNIT_13",
        "level": 3,
        "tier": "center",
        "building_name": "Safety HQ (Side-Impact Deceleration Sled Rig)",
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

def add_safety_l4_geometry(root):
    """Adds L4 Pedestrian Safety Air-Cannon Wing & Overhead Bridge Crane (+11,500 tris -> ~34,700 tris)."""
    # 1. Enclosed High-Bay Crash Arena Expansion Hall (Y = 10.0m to 28.0m, X = -13.0m to 11.0m, height 11.2m)
    bm_hall = bmesh.new()
    bmesh_box(bm_hall, (24.0, 18.0, 11.2), (-1.0, 19.0, 5.9))
    bmesh_box(bm_hall, (24.6, 18.6, 0.4), (-1.0, 19.0, 11.6))
    create_mesh_object("GEO_Safety_Crash_Arena_Hall_Shell", bm_hall, mat_travertine_concrete(), root, 0.08)
    
    # 2. Structural Steel Roof Trusses across Arena (6 portal frame truss spans)
    bm_trusses = bmesh.new()
    for ty in [12.0, 15.0, 18.0, 21.0, 24.0, 27.0]:
        bmesh_truss_span(bm_trusses, 23.5, 0.8, 1.2, (-1.0, ty, 10.8), bays=10, axis='X')
    create_mesh_object("GEO_Safety_Arena_Roof_Trusses", bm_trusses, mat_coral_structural_beam(), root)
    
    # 3. Modern Observation Mezzanine Curtain Glass (North elevation: Y = 28.05m)
    bm_gallery = bmesh.new()
    bmesh_box(bm_gallery, (18.0, 0.25, 4.5), (-1.0, 28.05, 7.8))
    for wy in [14.0, 19.0, 24.0]:
        bmesh_box(bm_gallery, (0.25, 3.2, 1.8), (-13.05, wy, 8.5))
    create_mesh_object("GEO_Safety_Observation_Curtain_Glass", bm_gallery, mat_modern_curtain_glass(), root)
    
    # Curtain Glass Mullions & Mezzanine Safety Balustrade Railing
    bm_mull = bmesh.new()
    for gx in range(-9, 10, 2):
        bmesh_box(bm_mull, (0.12, 0.35, 4.6), (float(gx), 28.08, 7.8))
    bmesh_box(bm_mull, (18.5, 0.6, 0.18), (-1.0, 28.1, 10.1))
    for bi in range(40):
        bx = -9.0 + bi * 0.45
        bmesh_cylinder(bm_mull, 0.02, 1.1, (bx, 27.8, 6.1), segments=8)
    bmesh_box(bm_mull, (18.0, 0.06, 0.06), (-1.0, 27.8, 6.7))
    create_mesh_object("GEO_Safety_Arena_Mullions", bm_mull, mat_brushed_aluminum(), root)
    
    # 4. Overhead 10-Ton Travelling Bridge Crane & Hoist
    bm_crane = bmesh.new()
    bmesh_ibeam(bm_crane, 17.0, 0.55, 0.35, 0.04, 0.03, (-12.0, 19.0, 9.8), axis='Y')
    bmesh_ibeam(bm_crane, 17.0, 0.55, 0.35, 0.04, 0.03, (10.0, 19.0, 9.8), axis='Y')
    bmesh_ibeam(bm_crane, 22.0, 0.65, 0.35, 0.04, 0.03, (-1.0, 18.0, 10.2), axis='X')
    bmesh_ibeam(bm_crane, 22.0, 0.65, 0.35, 0.04, 0.03, (-1.0, 19.2, 10.2), axis='X')
    bmesh_box(bm_crane, (2.2, 2.0, 0.8), (-3.0, 18.6, 10.8))
    bmesh_cylinder(bm_crane, 0.03, 3.5, (-3.0, 18.6, 8.8), segments=8)
    bmesh_tube(bm_crane, 0.28, 0.16, 0.12, (-3.0, 18.6, 7.0), segments=12)
    create_mesh_object("GEO_Safety_Overhead_Bridge_Crane", bm_crane, mat_safety_yellow(), root)
    
    # 5. Pneumatic Pedestrian Safety Impact Air Cannon Rig & High-Pressure Gas Bank
    bm_cannon = bmesh.new()
    bmesh_box(bm_cannon, (1.8, 1.8, 0.4), (-8.0, 16.0, 0.20))
    bmesh_cylinder(bm_cannon, 0.18, 4.2, (-8.0, 16.0, 2.3), segments=14)
    bmesh_box(bm_cannon, (0.35, 2.6, 0.35), (-8.0, 17.2, 4.3))
    bmesh_tube(bm_cannon, 0.18, 0.12, 3.2, (-8.0, 18.5, 3.8), segments=16, rot_x=math.radians(45.0))
    bmesh_cylinder(bm_cannon, 0.35, 1.8, (-9.5, 16.0, 1.2), segments=14)
    bmesh_box(bm_cannon, (0.25, 0.25, 6.2), (7.0, 16.0, 3.3))
    bmesh_cylinder(bm_cannon, 0.05, 5.8, (7.2, 16.0, 3.2), segments=8)
    bmesh_box(bm_cannon, (0.6, 0.6, 0.5), (7.0, 16.0, 4.5))
    for ni in range(12):
        ny = 14.0 + ni * 0.8
        bmesh_cylinder(bm_cannon, 0.14, 1.8, (-11.2, ny, 1.0), segments=14)
        bmesh_cylinder(bm_cannon, 0.04, 0.20, (-11.2, ny, 1.95), segments=10)
    bmesh_cylinder(bm_cannon, 0.03, 9.6, (-11.2, 18.4, 2.05), segments=8, rot_x=math.radians(90.0))
    create_mesh_object("GEO_Safety_Pedestrian_Impact_Cannon", bm_cannon, mat_coral_structural_beam(), root)

def build_safety_l4(export_path: str):
    """L4: Pedestrian Safety Subsystem Cannon & High-Bay Hall (Target: ~34,700 tris)."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_13_SAFETY_HQ_L4", None)
    bpy.context.collection.objects.link(root)
    add_base_safety_l1(root)
    add_safety_l2_geometry(root)
    add_safety_l3_geometry(root)
    add_safety_l4_geometry(root)
    
    extras = {
        "unit_id": "SAFETY_HQ",
        "unit_key": "UNIT_13",
        "level": 4,
        "tier": "advanced_hq",
        "building_name": "Safety HQ (Pedestrian Impact Cannon Lab)",
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

def add_safety_l5_geometry(root):
    """Adds L5 Rollover Inversion Pit & Roof Crush Hydraulic Press (+13,200 tris -> ~47,900 tris)."""
    # 1. Rollover Test Pit Annex (South flank: X = -2.0m, Y = -23.0m, 14m x 10m x 8.2m)
    bm_rollover = bmesh.new()
    bmesh_box(bm_rollover, (14.0, 10.0, 8.2), (-2.0, -23.0, 4.1))
    bmesh_box(bm_rollover, (14.6, 10.6, 0.4), (-2.0, -23.0, 8.3))
    create_mesh_object("GEO_Safety_Rollover_Pit_Shell", bm_rollover, mat_travertine_concrete(), root, 0.06)
    
    # 2. Dynamic Rollover Rotisserie Spit Cradle (Heavy rotating circular ring mechanism)
    bm_cradle = bmesh.new()
    bmesh_box(bm_cradle, (1.2, 1.8, 2.6), (-5.8, -23.0, 1.3))
    bmesh_box(bm_cradle, (1.2, 1.8, 2.6), (1.8, -23.0, 1.3))
    bmesh_tube(bm_cradle, 2.2, 1.9, 0.35, (-2.0, -23.0, 2.8), segments=32, rot_y=math.radians(90.0))
    bmesh_tube(bm_cradle, 1.6, 1.35, 0.30, (-2.0, -23.0, 2.8), segments=28, rot_y=math.radians(90.0))
    for sp in range(12):
        sang = sp * 2 * math.pi / 12
        sy = -23.0 + 1.6 * math.cos(sang)
        sz = 2.8 + 1.6 * math.sin(sang)
        bmesh_cylinder(bm_cradle, 0.06, 1.8, (-2.0, sy, sz), segments=12, rot_x=sang)
    # Complete vehicle rollover buck inside rotisserie
    bmesh_box(bm_cradle, (1.8, 4.0, 0.95), (-2.0, -23.0, 2.8))
    bmesh_box(bm_cradle, (1.5, 2.0, 0.65), (-2.0, -23.0, 3.6))
    for rx, ry in [(-2.9, -24.4), (-1.1, -24.4), (-2.9, -21.6), (-1.1, -21.6)]:
        bmesh_cylinder(bm_cradle, 0.36, 0.22, (rx, ry, 2.5), segments=18, rot_y=math.radians(90.0))
    create_mesh_object("GEO_Safety_Rollover_Cradle_Ring", bm_cradle, mat_construction_orange(), root)
    
    # 3. 45-Degree Dynamic Curb-Trip Rollover Ramp
    bm_ramp = bmesh.new()
    bmesh_box(bm_ramp, (4.5, 6.0, 0.4), (-9.0, -23.0, 0.2))
    bmesh_box(bm_ramp, (3.2, 5.0, 0.2), (-9.0, -23.0, 1.2))
    bmesh_ibeam(bm_ramp, 5.2, 0.25, 0.15, 0.03, 0.02, (-7.5, -23.0, 1.4), axis='Y')
    create_mesh_object("GEO_Safety_Curb_Trip_Ramp", bm_ramp, mat_coral_structural_beam(), root)
    
    # 4. Roof Crush Testing Hydraulic Platen Press (FMVSS 216 / IIHS Standard)
    bm_press = bmesh.new()
    for px in [6.5, 10.5]:
        for py in [-21.0, -25.0]:
            bmesh_cylinder(bm_press, 0.16, 5.0, (px, py, 2.5), segments=18)
            bmesh_box(bm_press, (0.6, 0.6, 0.2), (px, py, 0.1))
            bmesh_box(bm_press, (0.6, 0.6, 0.2), (px, py, 4.9))
    bmesh_box(bm_press, (4.8, 4.8, 0.7), (8.5, -23.0, 5.0))
    bmesh_cylinder(bm_press, 0.22, 2.2, (8.5, -23.0, 3.5), segments=20, rot_x=math.radians(25.0))
    bmesh_box(bm_press, (2.2, 1.8, 0.25), (8.5, -23.0, 2.4))
    # 16 force transducer pucks on crushing platen
    for pr in range(4):
        for pc in range(4):
            bmesh_cylinder(bm_press, 0.06, 0.05, (7.6 + pc * 0.6, -24.0 + pr * 0.6, 2.25), segments=12)
    create_mesh_object("GEO_Safety_Roof_Crush_Press", bm_press, mat_safety_yellow(), root)
    
    # 5. Hydraulic Power Unit (HPU) Skid with 48 Radiator Cooling Fins
    bm_hpu = bmesh.new()
    bmesh_box(bm_hpu, (3.2, 2.4, 0.3), (5.0, -26.0, 0.15))
    bmesh_cylinder(bm_hpu, 0.35, 1.6, (4.2, -26.0, 1.1), segments=18)
    bmesh_cylinder(bm_hpu, 0.28, 1.2, (5.8, -26.0, 0.9), segments=18)
    bmesh_box(bm_hpu, (0.4, 2.4, 1.4), (6.2, -24.5, 0.9))
    for li in range(48):
        bmesh_box(bm_hpu, (0.35, 0.02, 1.2), (6.2, -25.6 + li * 0.046, 0.9))
    create_mesh_object("GEO_Safety_HPU_Hydraulic_Skid", bm_hpu, mat_cast_iron_dark(), root)
    
    # 6. Perimeter Catch Barrier Stanchions & Steel Mesh Cables (24 posts)
    bm_catch = bmesh.new()
    for pi in range(24):
        py = -27.8 + pi * 0.42
        bmesh_cylinder(bm_catch, 0.05, 2.8, (-10.5, py, 1.4), segments=12)
    for c_z in [0.6, 1.1, 1.6, 2.1, 2.6]:
        bmesh_cylinder(bm_catch, 0.02, 9.8, (-10.5, -23.0, c_z), segments=10, rot_x=math.radians(90.0))
    create_mesh_object("GEO_Safety_Rollover_Catch_Barriers", bm_catch, mat_corrugated_industrial_steel(), root)
    
    # Hitbox
    bm_roll_hb = bmesh.new()
    bmesh_box(bm_roll_hb, (16.0, 12.0, 9.0), (-2.0, -23.0, 4.5))
    create_mesh_object("HITBOX_SAFETY_ROLLOVER", bm_roll_hb, None, root)

def build_safety_l5(export_path: str):
    """L5: Rollover Inversion Pit & Deceleration Sled Annex (Target: ~47,800 tris)."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_13_SAFETY_HQ_L5", None)
    bpy.context.collection.objects.link(root)
    add_base_safety_l1(root)
    add_safety_l2_geometry(root)
    add_safety_l3_geometry(root)
    add_safety_l4_geometry(root)
    add_safety_l5_geometry(root)
    
    extras = {
        "unit_id": "SAFETY_HQ",
        "unit_key": "UNIT_13",
        "level": 5,
        "tier": "world_class_hq",
        "building_name": "Safety HQ (Rollover Inversion & Deceleration Pit)",
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

def add_safety_l6_geometry(root):
    """Adds L6 Active Safety ADAS Robotic Arena & Rooftop Solar Canopy (+11,500 tris -> ~59,300 tris)."""
    # 1. Active Safety & ADAS Robot Proving Ground Test Apron (4 AGV skateboards + soft dummies + GVT car)
    bm_adas = bmesh.new()
    for i, (ax, ay) in enumerate([(4.0, 14.0), (8.0, 19.0), (3.0, 24.0), (-6.0, 15.0)]):
        bmesh_box(bm_adas, (1.6, 1.4, 0.12), (ax, ay, 0.08))
        for ox in [-0.7, 0.7]:
            for oy in [-0.5, 0.5]:
                bmesh_cylinder(bm_adas, 0.06, 0.08, (ax + ox, ay + oy, 0.06), segments=14, rot_y=math.radians(90.0))
        bmesh_crash_dummy(bm_adas, (ax, ay, 0.12), seated=False)
        bmesh_cylinder(bm_adas, 0.04, 0.35, (ax, ay, 1.6), segments=12)
        
    # Inflatable Global Vehicle Target (GVT / Dummy Car)
    bmesh_box(bm_adas, (2.0, 4.4, 0.10), (-7.0, 22.0, 0.06))
    bmesh_box(bm_adas, (1.8, 4.2, 1.1), (-7.0, 22.0, 0.65))
    bmesh_box(bm_adas, (1.5, 2.0, 0.6), (-7.0, 21.8, 1.45))
    for gx, gy in [(-7.9, 20.5), (-6.1, 20.5), (-7.9, 23.5), (-6.1, 23.5)]:
        bmesh_cylinder(bm_adas, 0.32, 0.18, (gx, gy, 0.32), segments=16, rot_y=math.radians(90.0))
    create_mesh_object("GEO_Safety_Robotic_Pedestrian_Targets", bm_adas, mat_safety_yellow(), root)
    
    # 2. Radar/LiDAR Calibration Target Pylons & Delineation Posts
    bm_targets = bmesh.new()
    for tx, ty in [(-11.0, 15.0), (-11.0, 25.0), (12.0, 15.0), (12.0, 25.0)]:
        bmesh_cylinder(bm_targets, 0.06, 2.8, (tx, ty, 1.4), segments=14)
        bmesh_cylinder(bm_targets, 0.35, 0.08, (tx, ty, 0.04), segments=16)
        bmesh_box(bm_targets, (0.35, 0.35, 0.35), (tx, ty, 2.8))
        bmesh_cylinder(bm_targets, 0.25, 0.03, (tx, ty, 2.4), segments=18, rot_x=math.radians(90.0))
    # 36 Euro NCAP lane delineation boundary posts
    for pi in range(36):
        py = 10.5 + pi * 0.5
        bmesh_cylinder(bm_targets, 0.045, 0.9, (0.5, py, 0.45), segments=12)
        bmesh_cylinder(bm_targets, 0.05, 0.15, (0.5, py, 0.75), segments=12)
    create_mesh_object("GEO_Safety_ADAS_Calibration_Pylons", bm_targets, mat_brushed_aluminum(), root)
    
    # 3. Rooftop Photovoltaic Solar Canopy Array over Arena (32 panels on spaceframe purlins)
    bm_solar = bmesh.new()
    for sx in [-8.0, -1.0, 6.0]:
        for sy in [14.0, 19.0, 24.0]:
            bmesh_cylinder(bm_solar, 0.08, 1.8, (sx, sy, 12.5), segments=12)
    # 16 longitudinal structural purlins
    for p_idx in range(16):
        px_pos = -10.5 + p_idx * 1.4
        bmesh_cylinder(bm_solar, 0.035, 15.0, (px_pos, 19.0, 13.3), segments=8, rot_x=math.radians(90.0))
    for row in range(4):
        py = 13.0 + row * 3.6
        for col in range(8):
            px = -10.0 + col * 2.6
            bmesh_box(bm_solar, (2.3, 1.6, 0.08), (px, py, 13.6))
            bmesh_box(bm_solar, (0.3, 0.2, 0.1), (px, py, 13.5)) # Micro-inverter box
    create_mesh_object("GEO_Safety_Photovoltaic_Solar_Canopy", bm_solar, mat_modern_curtain_glass(), root)
    
    # 4. ADAS Optical & LiDAR Scanner Towers with Parabolic Antennas
    bm_towers = bmesh.new()
    for ax in [-5.0, 3.0]:
        bmesh_truss_span(bm_towers, 6.5, 0.6, 0.6, (ax, 26.5, 3.5), bays=6, axis='Y')
        bmesh_cylinder(bm_towers, 0.22, 0.4, (ax, 26.5, 7.0), segments=18)
        bmesh_box(bm_towers, (0.4, 0.4, 0.3), (ax, 26.5, 7.4))
        # Parabolic dish antenna
        bmesh_tube(bm_towers, 0.45, 0.40, 0.18, (ax, 26.5, 8.0), segments=20, rot_x=math.radians(90.0))
        bmesh_cylinder(bm_towers, 0.03, 0.45, (ax, 26.2, 8.0), segments=10, rot_x=math.radians(90.0))
    create_mesh_object("GEO_Safety_ADAS_Radar_Towers", bm_towers, mat_coral_structural_beam(), root)

def build_safety_l6(export_path: str):
    """L6: Active Safety & ADAS Robot Arena (Target: ~59,200 tris)."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_13_SAFETY_HQ_L6", None)
    bpy.context.collection.objects.link(root)
    add_base_safety_l1(root)
    add_safety_l2_geometry(root)
    add_safety_l3_geometry(root)
    add_safety_l4_geometry(root)
    add_safety_l5_geometry(root)
    add_safety_l6_geometry(root)
    
    extras = {
        "unit_id": "SAFETY_HQ",
        "unit_key": "UNIT_13",
        "level": 6,
        "tier": "innovation_campus",
        "building_name": "Safety HQ (Active Safety & ADAS Robot Arena)",
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

def add_safety_l7_geometry(root):
    """Adds L7 Virtual-Physical Crash Simulation Spire Tower & Holographic FEA Pod (+18,000 tris -> ~68,500 tris)."""
    # 1. Soaring Safety Telemetry Spire Tower (NE corner: X = 8.5m, Y = 21.0m, rising to 22.5m)
    bm_tower = bmesh.new()
    bmesh_box(bm_tower, (8.5, 8.5, 21.0), (8.5, 21.0, 10.5))
    bmesh_box(bm_tower, (9.0, 9.0, 0.6), (8.5, 21.0, 21.3))
    bmesh_cylinder(bm_tower, 0.08, 3.5, (8.5, 21.0, 23.0), segments=16)
    bmesh_cylinder(bm_tower, 0.22, 0.45, (8.5, 21.0, 21.8), segments=18)
    for ci in [-4.1, 4.1]:
        for cj in [-4.1, 4.1]:
            bmesh_box(bm_tower, (0.45, 0.45, 20.0), (8.5 + ci, 21.0 + cj, 10.5))
    create_mesh_object("GEO_Safety_Crash_Synthesis_Tower_Shell", bm_tower, mat_travertine_concrete(), root, 0.08)
    
    # 2. Tower Double-Skin Structural Curtain Glass & 64 Aerodynamic Louvers
    bm_tower_glass = bmesh.new()
    bmesh_box(bm_tower_glass, (8.2, 8.2, 17.0), (8.5, 21.0, 11.5))
    create_mesh_object("GEO_Safety_Tower_Curtain_Glass", bm_tower_glass, mat_modern_curtain_glass(), root)
    
    bm_louvers = bmesh.new()
    for lz_idx in range(16):
        lz_pos = 3.5 + lz_idx * 1.1
        bmesh_box(bm_louvers, (8.4, 0.45, 0.06), (8.5, 25.3, lz_pos))
        bmesh_box(bm_louvers, (8.4, 0.45, 0.06), (8.5, 16.7, lz_pos))
        bmesh_box(bm_louvers, (0.45, 8.4, 0.06), (12.8, 21.0, lz_pos))
        bmesh_box(bm_louvers, (0.45, 8.4, 0.06), (4.2, 21.0, lz_pos))
    for fi in range(6):
        fx = 4.8 + fi * 1.5
        bmesh_box(bm_louvers, (0.08, 0.35, 16.5), (fx, 25.4, 11.5))
        bmesh_box(bm_louvers, (0.08, 0.35, 16.5), (fx, 16.6, 11.5))
    for lz_pos in [6.0, 10.0, 14.0, 18.0]:
        bmesh_box(bm_louvers, (9.2, 9.2, 0.15), (8.5, 21.0, lz_pos))
    create_mesh_object("GEO_Safety_Tower_Aero_Louvers", bm_louvers, mat_brushed_aluminum(), root)
    
    # 3. Multi-Tiered Holographic Crash FEA Kinematic & Plastic Strain Tensor Pod
    bm_holo = bmesh.new()
    bmesh_cylinder(bm_holo, 3.5, 0.35, (-1.0, 19.0, 11.8), segments=36)
    bmesh_tube(bm_holo, 3.2, 2.9, 0.12, (-1.0, 19.0, 12.4), segments=36)
    bmesh_tube(bm_holo, 2.5, 2.2, 0.12, (-1.0, 19.0, 13.2), segments=32)
    bmesh_tube(bm_holo, 1.8, 1.5, 0.12, (-1.0, 19.0, 14.0), segments=32)
    bmesh_tube(bm_holo, 1.1, 0.85, 0.12, (-1.0, 19.0, 14.8), segments=28)
    for pi in range(96):
        theta = pi * 2 * math.pi / 96
        px = -1.0 + 3.05 * math.cos(theta)
        py = 19.0 + 3.05 * math.sin(theta)
        bmesh_cylinder(bm_holo, 0.02, 0.45, (px, py, 12.4), segments=10)
    bmesh_box(bm_holo, (0.6, 0.6, 0.8), (-1.0, 19.0, 12.8))
    bmesh_tube(bm_holo, 0.45, 0.35, 0.3, (-1.0, 19.0, 13.4), segments=20)
    create_mesh_object("GEO_Safety_Holographic_Crash_FEA_Pod", bm_holo, mat_holographic_cyan_glow(), root)
    
    # 4. Rooftop Emergency Forensic Crash Drone Pad & Rapid Battery Swap Carousel
    bm_helipad = bmesh.new()
    bmesh_cylinder(bm_helipad, 3.8, 0.25, (8.5, 21.0, 21.75), segments=28)
    bmesh_tube(bm_helipad, 4.0, 3.7, 0.15, (8.5, 21.0, 21.85), segments=28)
    for h in range(16):
        hang = h * 2 * math.pi / 16
        hx = 8.5 + 3.85 * math.cos(hang)
        hy = 21.0 + 3.85 * math.sin(hang)
        bmesh_cylinder(bm_helipad, 0.08, 0.15, (hx, hy, 21.95), segments=14)
    bmesh_box(bm_helipad, (0.8, 0.8, 0.25), (8.5, 21.0, 22.1))
    bmesh_cylinder(bm_helipad, 0.12, 0.18, (8.5, 21.0, 21.95), segments=16)
    for dx, dy in [(-0.8, -0.8), (0.8, -0.8), (-0.8, 0.8), (0.8, 0.8)]:
        bmesh_cylinder(bm_helipad, 0.035, 1.1, (8.5 + dx/2, 21.0 + dy/2, 22.15), segments=12, rot_z=math.atan2(dy, dx))
        bmesh_cylinder(bm_helipad, 0.05, 0.12, (8.5 + dx, 21.0 + dy, 22.25), segments=16)
        bmesh_cylinder(bm_helipad, 0.35, 0.02, (8.5 + dx, 21.0 + dy, 22.32), segments=20)
    # Rapid battery recharge carousel (4 recharge modules around pad perimeter)
    for bi in range(4):
        bang = bi * math.pi / 2
        bx = 8.5 + 2.8 * math.cos(bang)
        by = 21.0 + 2.8 * math.sin(bang)
        bmesh_box(bm_helipad, (0.6, 0.6, 0.4), (bx, by, 22.0))
        bmesh_cylinder(bm_helipad, 0.08, 0.25, (bx, by, 22.3), segments=14)
    create_mesh_object("GEO_Safety_Emergency_Drone_Pad", bm_helipad, mat_safety_yellow(), root)
    
    # 5. Autonomous Mobile Crash Retrieval Crawler Robot with Hydraulic Outriggers
    bm_crawler = bmesh.new()
    bmesh_box(bm_crawler, (0.5, 3.8, 0.5), (2.0, 8.0, 0.25))
    bmesh_box(bm_crawler, (0.5, 3.8, 0.5), (4.2, 8.0, 0.25))
    for bi in range(8):
        by = 6.4 + bi * 0.46
        bmesh_cylinder(bm_crawler, 0.20, 0.45, (2.0, by, 0.25), segments=16, rot_y=math.radians(90.0))
        bmesh_cylinder(bm_crawler, 0.20, 0.45, (4.2, by, 0.25), segments=16, rot_y=math.radians(90.0))
    bmesh_box(bm_crawler, (2.2, 3.6, 0.4), (3.1, 8.0, 0.6))
    bmesh_box(bm_crawler, (2.0, 3.4, 0.15), (3.1, 8.0, 0.9))
    bmesh_cylinder(bm_crawler, 0.08, 1.2, (3.1, 9.4, 0.8), segments=16, rot_x=math.radians(90.0))
    bmesh_box(bm_crawler, (0.25, 2.2, 0.25), (3.1, 7.5, 1.4))
    bmesh_cylinder(bm_crawler, 0.05, 1.2, (3.1, 6.8, 1.2), segments=14, rot_x=math.radians(35.0))
    # 4 hydraulic stabilization outriggers
    for ox, oy in [(1.5, 6.4), (4.7, 6.4), (1.5, 9.6), (4.7, 9.6)]:
        bmesh_cylinder(bm_crawler, 0.06, 0.4, (ox, oy, 0.3), segments=14)
        bmesh_cylinder(bm_crawler, 0.18, 0.05, (ox, oy, 0.08), segments=16) # Foot pad
    # Lifting spreader bar with 4 rigging chains
    bmesh_box(bm_crawler, (1.6, 0.12, 0.12), (3.1, 8.0, 1.9))
    for cx, cy in [(2.4, 7.5), (3.8, 7.5), (2.4, 8.5), (3.8, 8.5)]:
        bmesh_cylinder(bm_crawler, 0.02, 0.8, (cx, cy, 1.5), segments=10)
    create_mesh_object("GEO_Safety_Recovery_Crawler", bm_crawler, mat_construction_orange(), root)
    
    # 6. Executive Panoramic Skybridge
    bm_bridge = bmesh.new()
    bmesh_box(bm_bridge, (5.5, 2.4, 3.2), (2.5, 21.0, 11.6))
    bmesh_box(bm_bridge, (5.4, 0.15, 1.8), (2.5, 19.75, 11.6))
    bmesh_box(bm_bridge, (5.4, 0.15, 1.8), (2.5, 22.25, 11.6))
    for bgi in range(16):
        bx_pos = 0.0 + bgi * 0.33
        bmesh_box(bm_bridge, (0.04, 0.08, 1.8), (bx_pos, 19.75, 11.6))
        bmesh_box(bm_bridge, (0.04, 0.08, 1.8), (bx_pos, 22.25, 11.6))
    create_mesh_object("GEO_Safety_Executive_Skybridge", bm_bridge, mat_brushed_aluminum(), root)
    
    # Hitbox
    bm_tower_hb = bmesh.new()
    bmesh_box(bm_tower_hb, (10.0, 10.0, 23.0), (8.5, 21.0, 11.5))
    create_mesh_object("HITBOX_SAFETY_TOWER", bm_tower_hb, None, root)

def build_safety_l7(export_path: str):
    """L7: Hypermodern Virtual-Physical Crash Synthesis Center (Target: ~71,800 tris)."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_13_SAFETY_HQ_L7", None)
    bpy.context.collection.objects.link(root)
    add_base_safety_l1(root)
    add_safety_l2_geometry(root)
    add_safety_l3_geometry(root)
    add_safety_l4_geometry(root)
    add_safety_l5_geometry(root)
    add_safety_l6_geometry(root)
    add_safety_l7_geometry(root)
    
    extras = {
        "unit_id": "SAFETY_HQ",
        "unit_key": "UNIT_13",
        "level": 7,
        "tier": "hypermodern_campus",
        "building_name": "Safety HQ (Virtual-Physical Crash Synthesis Center)",
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── BATCH GENERATION ORCHESTRATOR ──

def generate_all_safety_levels(output_dir: str = None):
    if output_dir is None:
        output_dir = os.path.join(workspace_root, "public", "models", "campus")
    os.makedirs(output_dir, exist_ok=True)
    
    levels = [
        (0, "hq_13_safety_l0.glb", build_safety_l0),
        (1, "hq_13_safety_l1.glb", build_safety_l1),
        (2, "hq_13_safety_l2.glb", build_safety_l2),
        (3, "hq_13_safety_l3.glb", build_safety_l3),
        (4, "hq_13_safety_l4.glb", build_safety_l4),
        (5, "hq_13_safety_l5.glb", build_safety_l5),
        (6, "hq_13_safety_l6.glb", build_safety_l6),
        (7, "hq_13_safety_l7.glb", build_safety_l7),
    ]
    
    results = {}
    print("=" * 70)
    print(" AUTO TYCOON CAMPUS - UNIT_13 SAFETY & CRASH TEST CENTER")
    print(f" Target Output Directory: {output_dir}")
    print("=" * 70)
    
    all_passed = True
    for lvl, filename, builder_func in levels:
        out_path = os.path.join(output_dir, filename)
        tier_name = CAMPUS_TRIANGLE_BUDGETS[lvl]["tier"]
        print(f"\n>>> Generating UNIT_13 Level {lvl} ({tier_name}) -> {filename}...")
        
        success = builder_func(out_path)
        passed, report = audit_scene("UNIT_13_SAFETY", lvl, bpy)
        print_audit_summary(report)
        
        file_size = os.path.getsize(out_path) if os.path.exists(out_path) else 0
        tris = report["total_triangles"]
        print(f"    Export: {success} | Size: {file_size / 1024:.1f} KB | Triangles: {tris:,}")
        results[lvl] = {"file": filename, "passed": passed, "size_kb": file_size / 1024.0, "triangles": tris}
        if not passed:
            all_passed = False
            
    print("\n" + "=" * 70)
    print(" UNIT_13 SAFETY HQ SUMMARY AUDIT TABLE")
    print("=" * 70)
    print(f"{'Level':<6} | {'Filename':<22} | {'Triangles':<10} | {'Size (KB)':<10} | {'Quality Gate'}")
    print("-" * 70)
    for lvl, data in results.items():
        status = "PASSED ✅" if data["passed"] else "FAILED ❌"
        print(f"L{lvl:<5} | {data['file']:<22} | {data['triangles']:<10,} | {data['size_kb']:<10.1f} | {status}")
    print("=" * 70)
    
    return all_passed

if __name__ == "__main__":
    target_dir = os.path.join(workspace_root, "public", "models", "campus")
    if len(sys.argv) > 1 and not sys.argv[-1].endswith(".py"):
        target_dir = sys.argv[-1]
    
    generate_all_safety_levels(target_dir)
