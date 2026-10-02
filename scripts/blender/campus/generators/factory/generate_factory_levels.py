"""
AUTO TYCOON CAMPUS HQ - UNIT_10 MANUFACTURING PLANT & ASSEMBLY COMPLEX GENERATOR (PHASES 171-178)

Generates all 8 progression levels (L0-L7) for UNIT_10:
- Footprint: 60m x 70m (Zone A Manufacturing Mega-Plot)
- Architectural Identity: Full-Scale Automotive Stamping, Body, Paint & Final Assembly Plant —
  1970s industrial assembly hall with sawtooth roof skylights, heavy mechanical stamping presses,
  dual overhead bridge cranes, vehicle carrier monorail, freight loading docks, robotic Body-in-White (BIW) welding cells,
  automated electro-dip paint shop with tall exhaust filtration stacks, slat assembly conveyor, powertrain marriage skids,
  AGV transport lanes, ASRS racking, cleanroom battery marriage, and hypermodern lights-out Gigafactory with skybridge & solar array.

Follows the UNIT_01 Proven Production Standard:
- 100% deterministic GEO_* and HITBOX_* naming convention (zero generic names)
- Parameterized BMesh modeling with clean bevels and smooth shading by angle
- Strict polygon budgets:
    L0:  1,000 -  3,000 tris (Target: ~1,850 - 2,500)
    L1:  8,000 - 12,000 tris (Target: ~9,800 - 10,500)
    L2: 14,000 - 18,000 tris (Target: ~15,800 - 16,500)
    L3: 20,000 - 26,000 tris (Target: ~23,000 - 24,000)
    L4: 30,000 - 40,000 tris (Target: ~34,000 - 36,000)
    L5: 40,000 - 55,000 tris (Target: ~46,500 - 49,000)
    L6: 50,000 - 65,000 tris (Target: ~57,500 - 60,000)
    L7: 60,000 - 80,000 tris (Target: ~70,000 - 74,000)
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

def bmesh_truss_span(bm, length: float, width: float, depth: float, loc: tuple, bays=10, axis='X'):
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

# ── Specialized Manufacturing Procedural Subassemblies ──

def bmesh_surveyor_theodolite(bm, loc: tuple):
    """Creates a surveyor theodolite on an aluminum tripod (~180 tris)."""
    lx, ly, lz = loc
    for i in range(3):
        angle = i * (2 * math.pi / 3)
        foot_x = lx + 0.65 * math.cos(angle)
        foot_y = ly + 0.65 * math.sin(angle)
        leg_mid_x = (lx + foot_x) / 2
        leg_mid_y = (ly + foot_y) / 2
        bmesh_cylinder(bm, 0.028, 1.35, (leg_mid_x, leg_mid_y, lz + 0.65), segments=6, rot_x=math.radians(24.0), rot_z=-angle)
    bmesh_cylinder(bm, 0.15, 0.08, (lx, ly, lz + 1.25), segments=8)
    bmesh_box(bm, (0.16, 0.16, 0.25), (lx, ly, lz + 1.45))
    bmesh_cylinder(bm, 0.042, 0.32, (lx, ly, lz + 1.52), segments=8, rot_x=math.radians(90.0))

def bmesh_stamping_press_unit(bm, loc: tuple):
    """Heavy 2,000-ton automotive transfer stamping press (~1,100 tris)."""
    lx, ly, lz = loc
    for cx in [-1.8, 1.8]:
        for cy in [-1.5, 1.5]:
            bmesh_box(bm, (0.75, 0.75, 8.2), (lx + cx, ly + cy, lz + 4.1))
            bmesh_box(bm, (1.1, 1.1, 0.35), (lx + cx, ly + cy, lz + 0.175))
    bmesh_box(bm, (4.6, 4.0, 2.2), (lx, ly, lz + 7.2))
    bmesh_tube(bm, 1.3, 0.6, 0.45, (lx + 2.4, ly, lz + 7.2), segments=20, rot_y=math.radians(90.0))
    bmesh_cylinder(bm, 0.85, 2.8, (lx, ly, lz + 5.2), segments=16)
    bmesh_box(bm, (3.8, 3.2, 0.85), (lx, ly, lz + 3.4))
    bmesh_box(bm, (4.2, 3.6, 0.75), (lx, ly, lz + 0.75))
    for pi in range(6):
        bmesh_box(bm, (1.6, 1.1, 0.03), (lx, ly + 2.4, lz + 0.5 + pi * 0.08))

def bmesh_steel_coil_feeder(bm, loc: tuple):
    """Automotive sheet-metal coil uncoiler de-reeler unit (~420 tris)."""
    lx, ly, lz = loc
    bmesh_box(bm, (2.6, 2.4, 0.6), (lx, ly, lz + 0.3))
    bmesh_box(bm, (0.45, 0.45, 2.2), (lx - 0.9, ly, lz + 1.4))
    bmesh_box(bm, (0.45, 0.45, 2.2), (lx + 0.9, ly, lz + 1.4))
    bmesh_cylinder(bm, 0.18, 2.0, (lx, ly, lz + 2.0), segments=12, rot_y=math.radians(90.0))
    bmesh_tube(bm, 0.95, 0.22, 1.4, (lx, ly, lz + 2.0), segments=16, rot_y=math.radians(90.0))

def bmesh_stamped_parts_rack(bm, loc: tuple):
    """Heavy welded steel parts basket loaded with stamped body panels (~400 tris)."""
    lx, ly, lz = loc
    # 4 corner steel posts
    for cx in [-0.9, 0.9]:
        for cy in [-0.65, 0.65]:
            bmesh_box(bm, (0.1, 0.1, 1.5), (lx + cx, ly + cy, lz + 0.75))
    # Base pallet
    bmesh_box(bm, (2.0, 1.5, 0.15), (lx, ly, lz + 0.08))
    bmesh_box(bm, (2.0, 1.5, 0.08), (lx, ly, lz + 1.45))
    # Stamped hood / roof outer panels stacked inside
    for pi in range(8):
        bmesh_box(bm, (1.6, 1.2, 0.025), (lx, ly, lz + 0.25 + pi * 0.14))

def bmesh_monorail_vehicle_carrier(bm, loc: tuple):
    """Overhead monorail carrier C-yoke with suspended car body (~1,200 tris)."""
    lx, ly, lz = loc
    bmesh_cylinder(bm, 0.16, 0.12, (lx - 0.4, ly, lz + 0.25), segments=14, rot_x=math.radians(90.0))
    bmesh_cylinder(bm, 0.16, 0.12, (lx + 0.4, ly, lz + 0.25), segments=14, rot_x=math.radians(90.0))
    bmesh_cylinder(bm, 0.07, 2.8, (lx, ly, lz - 1.2), segments=10)
    bmesh_box(bm, (0.22, 0.22, 2.4), (lx - 1.4, ly, lz - 2.2))
    bmesh_box(bm, (1.5, 0.22, 0.22), (lx - 0.7, ly, lz - 1.0))
    bmesh_box(bm, (1.5, 0.22, 0.22), (lx - 0.7, ly, lz - 3.4))
    bmesh_box(bm, (1.9, 4.4, 0.9), (lx, ly, lz - 3.2))
    bmesh_box(bm, (1.6, 2.2, 0.65), (lx, ly - 0.2, lz - 2.45))
    for wx, wy in [(-0.95, -1.3), (0.95, -1.3), (-0.95, 1.3), (0.95, 1.3)]:
        bmesh_tube(bm, 0.40, 0.30, 0.10, (lx + wx, ly + wy, lz - 3.2), segments=14, rot_y=math.radians(90.0))

def bmesh_overhead_crane(bm, span: float, loc: tuple):
    """Heavy 30-ton traveling overhead bridge crane with trolley & hoist hook (~1,250 tris)."""
    lx, ly, lz = loc
    hw = span / 2
    bmesh_box(bm, (span + 1.2, 0.85, 0.6), (lx, ly, lz))
    bmesh_box(bm, (span + 1.2, 0.85, 0.6), (lx, ly + 2.2, lz))
    for ex in [-hw - 0.4, hw + 0.4]:
        for ey in [0.0, 2.2]:
            bmesh_cylinder(bm, 0.32, 0.22, (lx + ex, ly + ey, lz - 0.35), segments=12, rot_x=math.radians(90.0))
    bmesh_box(bm, (2.4, 2.8, 0.55), (lx - 4.0, ly + 1.1, lz + 0.45))
    bmesh_cylinder(bm, 0.35, 1.8, (lx - 4.0, ly + 1.1, lz + 0.9), segments=14, rot_y=math.radians(90.0))
    bmesh_cylinder(bm, 0.04, 3.2, (lx - 4.5, ly + 1.1, lz - 1.2), segments=8)
    bmesh_cylinder(bm, 0.04, 3.2, (lx - 3.5, ly + 1.1, lz - 1.2), segments=8)
    bmesh_box(bm, (1.2, 0.8, 0.6), (lx - 4.0, ly + 1.1, lz - 2.8))
    bmesh_tube(bm, 0.35, 0.18, 0.22, (lx - 4.0, ly + 1.1, lz - 3.4), segments=14)

def bmesh_spot_weld_robot(bm, loc: tuple):
    """Articulated 6-axis Body-in-White industrial spot-welding robot (~580 tris)."""
    lx, ly, lz = loc
    bmesh_cylinder(bm, 0.55, 0.45, (lx, ly, lz + 0.225), segments=20)
    bmesh_cylinder(bm, 0.42, 0.35, (lx, ly, lz + 0.55), segments=16)
    bmesh_box(bm, (0.55, 0.55, 0.65), (lx, ly, lz + 0.95))
    bmesh_cylinder(bm, 0.14, 1.1, (lx - 0.28, ly, lz + 1.2), segments=14, rot_x=math.radians(25.0))
    bmesh_box(bm, (0.35, 0.35, 1.8), (lx, ly + 0.4, lz + 1.8))
    bmesh_cylinder(bm, 0.22, 0.42, (lx, ly + 0.8, lz + 2.6), segments=16, rot_y=math.radians(90.0))
    bmesh_box(bm, (0.28, 1.4, 0.28), (lx, ly + 1.4, lz + 2.5))
    bmesh_cylinder(bm, 0.12, 0.35, (lx, ly + 2.1, lz + 2.5), segments=14, rot_y=math.radians(90.0))
    bmesh_box(bm, (0.15, 0.45, 0.45), (lx, ly + 2.3, lz + 2.5))
    bmesh_cylinder(bm, 0.035, 0.35, (lx, ly + 2.6, lz + 2.65), segments=12)
    bmesh_cylinder(bm, 0.035, 0.35, (lx, ly + 2.6, lz + 2.35), segments=12)
    # Cable dress pack connecting base to elbow
    bmesh_cylinder(bm, 0.04, 1.6, (lx - 0.25, ly + 0.3, lz + 1.9), segments=10, rot_x=math.radians(20.0))

def bmesh_agv_transport_cart(bm, loc: tuple):
    """Autonomous Guided Vehicle (AGV) component transport cart (~520 tris)."""
    lx, ly, lz = loc
    bmesh_box(bm, (1.8, 3.2, 0.45), (lx, ly, lz + 0.28))
    for wx in [-0.85, 0.85]:
        for wy in [-1.1, 1.1]:
            bmesh_cylinder(bm, 0.16, 0.14, (lx + wx, ly + wy, lz + 0.15), segments=16, rot_y=math.radians(90.0))
            bmesh_cylinder(bm, 0.06, 0.16, (lx + wx, ly + wy, lz + 0.15), segments=12, rot_y=math.radians(90.0))
    # Optical LiDAR navigation puck & safety sensor
    bmesh_cylinder(bm, 0.065, 0.12, (lx - 0.75, ly + 1.4, lz + 0.56), segments=14)
    bmesh_cylinder(bm, 0.045, 0.08, (lx + 0.75, ly + 1.4, lz + 0.54), segments=12)
    bmesh_cylinder(bm, 0.065, 0.12, (lx + 0.75, ly - 1.4, lz + 0.56), segments=14)
    bmesh_box(bm, (1.4, 2.4, 0.15), (lx, ly, lz + 0.58))
    bmesh_box(bm, (0.6, 0.9, 0.45), (lx, ly, lz + 0.88))
    for cyl in range(3):
        bmesh_cylinder(bm, 0.08, 0.25, (lx - 0.15, ly - 0.25 + cyl * 0.25, lz + 0.98), segments=12)
        bmesh_cylinder(bm, 0.08, 0.25, (lx + 0.15, ly - 0.25 + cyl * 0.25, lz + 0.98), segments=12)

# ── LEVEL BUILDERS ──

def build_factory_l0(export_path: str):
    """L0: Greenfield Mega-Plot Ground Prep (Target: ~1,850 tris)."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_10_FACTORY_L0", None)
    bpy.context.collection.objects.link(root)
    
    # 1. Foundation Plinth (60m x 70m x 0.3m, Z in [-0.30, 0.0])
    bm_plinth = bmesh.new()
    bmesh_box(bm_plinth, (60.0, 70.0, 0.3), (0.0, 0.0, -0.15))
    create_mesh_object("GEO_Factory_Foundation_Plinth", bm_plinth, mat_travertine_concrete(), root, 0.04)
    
    # 2. Heavy Excavation Pit for Stamping Press Deep Foundation Bed
    bm_excav = bmesh.new()
    bmesh_box(bm_excav, (16.0, 36.0, 0.18), (-16.0, -4.0, 0.09))
    for px in [-16.0]:
        for py in [-14.0, -4.0, 6.0]:
            bmesh_box(bm_excav, (5.2, 5.0, 0.12), (px, py, 0.20))
            for ax in [-1.8, 1.8]:
                for ay in [-1.5, 1.5]:
                    bmesh_cylinder(bm_excav, 0.06, 0.4, (px + ax, py + ay, 0.35), segments=6)
    create_mesh_object("GEO_Factory_Excavation_Pits", bm_excav, mat_cast_iron_dark(), root)
    
    # 3. Precision Surveyor Total Stations & Theodolites (4 units)
    bm_surv = bmesh.new()
    bmesh_surveyor_theodolite(bm_surv, (-25.0, -30.0, 0.0))
    bmesh_surveyor_theodolite(bm_surv, (25.0, -30.0, 0.0))
    bmesh_surveyor_theodolite(bm_surv, (25.0, 30.0, 0.0))
    bmesh_surveyor_theodolite(bm_surv, (-25.0, 30.0, 0.0))
    create_mesh_object("GEO_Factory_Survey_Theodolites", bm_surv, mat_safety_yellow(), root)
    
    # 4. Geotechnical Heavy Pile Driving Mast Rig
    bm_pile = bmesh.new()
    bmesh_box(bm_pile, (0.65, 3.8, 0.55), (10.0, 15.0, 0.275))
    bmesh_box(bm_pile, (0.65, 3.8, 0.55), (12.4, 15.0, 0.275))
    bmesh_box(bm_pile, (2.2, 3.2, 0.45), (11.2, 15.0, 0.65))
    bmesh_box(bm_pile, (0.35, 0.35, 5.2), (11.2, 14.0, 3.1))
    bmesh_cylinder(bm_pile, 0.08, 4.2, (11.2, 13.6, 2.5), segments=8)
    create_mesh_object("GEO_Factory_Pile_Driver_Rig", bm_pile, mat_construction_orange(), root)
    
    # 5. Boundary Survey Stakes (16 stakes)
    bm_stakes = bmesh.new()
    for sx in [-28.0, 28.0]:
        for y_idx in range(4):
            sy = -24.0 + y_idx * 16.0
            bmesh_cylinder(bm_stakes, 0.05, 1.8, (sx, sy, 0.9), segments=6)
            bmesh_box(bm_stakes, (0.02, 0.3, 0.2), (sx, sy, 1.7))
    for sy in [-33.0, 33.0]:
        for x_idx in range(4):
            sx = -18.0 + x_idx * 12.0
            bmesh_cylinder(bm_stakes, 0.05, 1.8, (sx, sy, 0.9), segments=6)
            bmesh_box(bm_stakes, (0.3, 0.02, 0.2), (sx, sy, 1.7))
    create_mesh_object("GEO_Factory_Boundary_Stakes", bm_stakes, mat_safety_yellow(), root)
    
    # 6. Site Security Fence & Mega-Project Signboard
    bm_fence = bmesh.new()
    for py in [-33.0, 33.0]:
        for x_idx in range(9):
            px = -24.0 + x_idx * 6.0
            bmesh_cylinder(bm_fence, 0.05, 1.4, (px, py, 0.7), segments=6)
    bmesh_box(bm_fence, (52.0, 0.06, 0.06), (0.0, -33.0, 1.2))
    bmesh_box(bm_fence, (52.0, 0.06, 0.06), (0.0, 33.0, 1.2))
    bmesh_box(bm_fence, (0.2, 0.2, 3.6), (-5.0, 32.0, 1.8))
    bmesh_box(bm_fence, (0.2, 0.2, 3.6), (5.0, 32.0, 1.8))
    bmesh_box(bm_fence, (10.6, 0.15, 2.6), (0.0, 32.0, 3.2))
    create_mesh_object("GEO_Factory_Site_Signboard_Fence", bm_fence, mat_dark_slate_roof(), root)
    
    # Semantic Hitboxes
    bm_hitbox = bmesh.new()
    bmesh_box(bm_hitbox, (58.0, 68.0, 4.0), (0.0, 0.0, 2.0))
    create_mesh_object("HITBOX_FACTORY_MAIN", bm_hitbox, None, root)
    
    bm_hall_hb = bmesh.new()
    bmesh_box(bm_hall_hb, (40.0, 50.0, 3.0), (-5.0, -4.0, 1.5))
    create_mesh_object("HITBOX_FACTORY_ASSEMBLY", bm_hall_hb, None, root)
    
    extras = {
        "unit_id": "FACTORY",
        "unit_key": "UNIT_10",
        "level": 0,
        "tier": "empty_plot",
        "building_name": "Manufacturing Plant (Reserved Mega-Plot)",
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

def add_base_factory_l1(root):
    """Builds L1 baseline: main assembly hall, internal columns, dual cranes, 4 stamping presses, monorail, freight docks (~9,950 tris)."""
    # 1. Foundation Plinth (60m x 70m x 0.3m, Z in [-0.30, 0.0])
    bm_plinth = bmesh.new()
    bmesh_box(bm_plinth, (60.0, 70.0, 0.3), (0.0, 0.0, -0.15))
    create_mesh_object("GEO_Factory_Foundation_Plinth", bm_plinth, mat_travertine_concrete(), root, 0.04)
    
    # 2. Main Assembly & Stamping Hall (38m x 48m x 11m, centered at X = -5.0m, Y = -4.0m)
    bm_hall = bmesh.new()
    bmesh_box(bm_hall, (38.0, 48.0, 10.8), (-5.0, -4.0, 5.4))
    bmesh_box(bm_hall, (38.6, 48.6, 0.4), (-5.0, -4.0, 11.0))
    create_mesh_object("GEO_Factory_Main_Assembly_Hall", bm_hall, mat_travertine_concrete(), root, 0.08)
    
    # 3. Internal Heavy Structural Column Grid (4 x 6 = 24 I-beam columns with crane brackets)
    bm_cols = bmesh.new()
    for cx in [-21.0, -11.0, 1.0, 11.0]:
        for cy in [-24.0, -16.0, -8.0, 0.0, 8.0, 16.0]:
            bmesh_ibeam(bm_cols, 10.6, 0.45, 0.35, 0.03, 0.02, (cx, cy, 5.3), axis='Z')
            bmesh_box(bm_cols, (0.55, 0.55, 0.35), (cx, cy, 8.2))
    create_mesh_object("GEO_Factory_Internal_Column_Grid", bm_cols, mat_coral_structural_beam(), root)
    
    # 4. Dual Traveling Overhead 30-Ton Bridge Cranes
    bm_crane = bmesh.new()
    bmesh_overhead_crane(bm_crane, 32.0, (-5.0, -10.0, 8.8))
    bmesh_overhead_crane(bm_crane, 32.0, (-5.0, 8.0, 8.8))
    create_mesh_object("GEO_Factory_Traveling_Bridge_Crane", bm_crane, mat_safety_yellow(), root)
    
    # 5. Industrial Sawtooth Roof Skylights (4 rows of angled north-facing monitors)
    bm_sawtooth = bmesh.new()
    for sy in [-20.0, -8.0, 4.0, 16.0]:
        bmesh_box(bm_sawtooth, (36.0, 4.5, 2.6), (-5.0, sy, 12.3))
        bmesh_box(bm_sawtooth, (0.3, 4.6, 2.7), (-23.0, sy, 12.3))
        bmesh_box(bm_sawtooth, (0.3, 4.6, 2.7), (13.0, sy, 12.3))
    create_mesh_object("GEO_Factory_Sawtooth_Roof_Monitors", bm_sawtooth, mat_corrugated_industrial_steel(), root)
    
    # Sawtooth Clerestory Glazing & Mullions
    bm_saw_glass = bmesh.new()
    for sy in [-20.0, -8.0, 4.0, 16.0]:
        bmesh_box(bm_saw_glass, (35.6, 0.2, 1.8), (-5.0, sy + 2.1, 12.3))
        for mi in range(12):
            mx = -21.0 + mi * 3.2
            bmesh_box(bm_saw_glass, (0.12, 0.25, 1.9), (mx, sy + 2.1, 12.3))
    create_mesh_object("GEO_Factory_Sawtooth_Glass", bm_saw_glass, mat_tinted_acrylic_window(), root)
    
    # 6. Heavy Mechanical Stamping Press Line (4 giant 2,000-ton transfer stamping presses + Coil Feeders + Racks)
    bm_press = bmesh.new()
    for py in [-18.0, -10.0, -2.0, 6.0]:
        bmesh_stamping_press_unit(bm_press, (-16.0, py, 0.0))
    bmesh_steel_coil_feeder(bm_press, (-16.0, 13.5, 0.0))
    bmesh_steel_coil_feeder(bm_press, (-16.0, 17.5, 0.0))
    # Stamped body panels racks
    for ry in [-14.0, -6.0, 2.0]:
        bmesh_stamped_parts_rack(bm_press, (-10.5, ry, 0.0))
    create_mesh_object("GEO_Factory_Stamping_Presses", bm_press, mat_coral_structural_beam(), root, 0.04)
    
    # 7. Overhead Vehicle Carrier Monorail Conveyor Loop
    bm_monorail = bmesh.new()
    bmesh_ibeam(bm_monorail, 42.0, 0.45, 0.28, 0.03, 0.02, (-2.0, -4.0, 9.2), axis='Y')
    bmesh_ibeam(bm_monorail, 42.0, 0.45, 0.28, 0.03, 0.02, (6.0, -4.0, 9.2), axis='Y')
    bmesh_ibeam(bm_monorail, 8.5, 0.45, 0.28, 0.03, 0.02, (2.0, 17.0, 9.2), axis='X')
    bmesh_ibeam(bm_monorail, 8.5, 0.45, 0.28, 0.03, 0.02, (2.0, -25.0, 9.2), axis='X')
    for hy in [-22.0, -14.0, -6.0, 2.0, 10.0, 16.0]:
        bmesh_cylinder(bm_monorail, 0.04, 1.8, (-2.0, hy, 10.1), segments=8)
        bmesh_cylinder(bm_monorail, 0.04, 1.8, (6.0, hy, 10.1), segments=8)
    bmesh_monorail_vehicle_carrier(bm_monorail, (6.0, -10.0, 9.2))
    bmesh_monorail_vehicle_carrier(bm_monorail, (6.0, 6.0, 9.2))
    create_mesh_object("GEO_Factory_Overhead_Monorail_Carrier", bm_monorail, mat_safety_yellow(), root)
    
    # 8. Logistics Freight Docks (East flank: X = 20.0m, Y = -4.0m, 12m x 44m x 5m)
    bm_docks = bmesh.new()
    bmesh_box(bm_docks, (12.0, 44.0, 5.0), (20.0, -4.0, 2.5))
    bmesh_box(bm_docks, (12.5, 44.5, 0.3), (20.0, -4.0, 5.15))
    for dy in [-16.0, -8.0, 0.0, 8.0]:
        bmesh_box(bm_docks, (0.3, 4.2, 3.8), (13.9, dy, 2.1))
        bmesh_box(bm_docks, (0.4, 0.3, 1.2), (13.8, dy - 2.3, 0.8))
        bmesh_box(bm_docks, (0.4, 0.3, 1.2), (13.8, dy + 2.3, 0.8))
        bmesh_box(bm_docks, (1.8, 3.8, 0.12), (14.8, dy, 0.10))
    create_mesh_object("GEO_Factory_Freight_Dock_Bays", bm_docks, mat_corrugated_industrial_steel(), root)
    
    # 9. Plant Management Office & Gatehouse (North wing: Y = 25.0m, 28m x 10m x 6.5m)
    bm_office = bmesh.new()
    bmesh_box(bm_office, (28.0, 10.0, 6.2), (-5.0, 25.0, 3.1))
    bmesh_box(bm_office, (28.6, 10.6, 0.4), (-5.0, 25.0, 6.3))
    bmesh_box(bm_office, (4.5, 2.6, 1.6), (-12.0, 25.0, 7.2))
    bmesh_cylinder(bm_office, 0.7, 0.25, (-12.0, 25.0, 8.1), segments=16)
    bmesh_box(bm_office, (4.5, 2.6, 1.6), (2.0, 25.0, 7.2))
    bmesh_cylinder(bm_office, 0.7, 0.25, (2.0, 25.0, 8.1), segments=16)
    create_mesh_object("GEO_Factory_Management_Office", bm_office, mat_lavender_brick_1970(), root, 0.05)
    
    # 10. Office Ribbon Windows & Main Entry Canopy
    bm_win = bmesh.new()
    bmesh_box(bm_win, (24.0, 0.25, 2.2), (-5.0, 30.1, 4.2))
    bmesh_box(bm_win, (4.0, 0.25, 2.8), (-5.0, 30.1, 1.4))
    create_mesh_object("GEO_Factory_Office_Glass", bm_win, mat_tinted_acrylic_window(), root)
    
    bm_mull = bmesh.new()
    for xm in [-10.0, -5.0, 0.0, 5.0, 10.0]:
        bmesh_box(bm_mull, (0.15, 0.35, 2.4), (-5.0 + xm, 30.15, 4.2))
    bmesh_box(bm_mull, (6.0, 2.2, 0.25), (-5.0, 31.0, 3.0))
    create_mesh_object("GEO_Factory_Office_Mullions", bm_mull, mat_brushed_aluminum(), root)
    
    # Semantic Hitboxes
    bm_hitbox = bmesh.new()
    bmesh_box(bm_hitbox, (58.0, 68.0, 13.0), (0.0, 0.0, 6.5))
    create_mesh_object("HITBOX_FACTORY_MAIN", bm_hitbox, None, root)
    
    bm_hall_hb = bmesh.new()
    bmesh_box(bm_hall_hb, (40.0, 50.0, 13.0), (-5.0, -4.0, 6.5))
    create_mesh_object("HITBOX_FACTORY_ASSEMBLY", bm_hall_hb, None, root)

def build_factory_l1(export_path: str):
    """L1: 1970s Industrial Assembly Hall & Mechanical Stamping Line (Target: ~9,950 tris)."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_10_FACTORY_L1", None)
    bpy.context.collection.objects.link(root)
    add_base_factory_l1(root)
    
    extras = {
        "unit_id": "FACTORY",
        "unit_key": "UNIT_10",
        "level": 1,
        "tier": "office",
        "building_name": "Manufacturing Plant (Manual Assembly & Stamping)",
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

def add_factory_l2_geometry(root):
    """Adds L2 Body-in-White (BIW) Robotic Welding Shop (+6,150 tris -> ~16,100 tris)."""
    # 1. BIW Welding Annex Wing on South-West flank (18m x 16m x 9m)
    bm_biw = bmesh.new()
    bmesh_box(bm_biw, (18.0, 16.0, 8.8), (-18.0, -22.0, 4.4))
    bmesh_box(bm_biw, (18.6, 16.6, 0.4), (-18.0, -22.0, 9.0))
    create_mesh_object("GEO_Factory_BIW_Welding_Shell", bm_biw, mat_travertine_concrete(), root, 0.06)
    
    # 2. 12 Articulated 6-Axis Spot-Welding Industrial Robots
    bm_robots = bmesh.new()
    for ry in [-27.0, -24.0, -21.0, -18.0, -15.0, -12.0]:
        for rx in [-22.5, -13.5]:
            bmesh_spot_weld_robot(bm_robots, (rx, ry, 0.0))
    create_mesh_object("GEO_Factory_BIW_Welding_Robots", bm_robots, mat_construction_orange(), root)
    
    # 3. Vehicle Body Framing Fixture Jig & Transformer Stations & Safety Enclosure
    bm_jig = bmesh.new()
    bmesh_box(bm_jig, (2.6, 18.0, 0.35), (-18.0, -19.5, 0.18))
    for fy in range(-27, -11, 3):
        bmesh_box(bm_jig, (3.2, 0.18, 1.8), (-18.0, float(fy), 0.9))
        bmesh_cylinder(bm_jig, 0.05, 0.45, (-19.2, float(fy), 1.6), segments=12, rot_y=math.radians(90.0))
        bmesh_cylinder(bm_jig, 0.05, 0.45, (-16.8, float(fy), 1.6), segments=12, rot_y=math.radians(90.0))
    for ti in range(4):
        bmesh_box(bm_jig, (1.2, 1.4, 2.2), (-25.5, -25.0 + ti * 3.5, 1.1))
        bmesh_cylinder(bm_jig, 0.08, 0.35, (-25.5, -25.0 + ti * 3.5, 2.35), segments=14)
    # Perimeter safety fence posts & rails
    for fence_x in [-26.5, -9.5]:
        for fence_y_idx in range(7):
            fy_p = -27.0 + fence_y_idx * 2.6
            bmesh_cylinder(bm_jig, 0.04, 2.2, (fence_x, fy_p, 1.1), segments=8)
    bmesh_box(bm_jig, (0.05, 17.0, 0.08), (-26.5, -19.0, 2.1))
    bmesh_box(bm_jig, (0.05, 17.0, 0.08), (-9.5, -19.0, 2.1))
    create_mesh_object("GEO_Factory_BIW_Framing_Jig", bm_jig, mat_coral_structural_beam(), root)

def build_factory_l2(export_path: str):
    """L2: Body-in-White Robotic Welding Shop (Target: ~16,100 tris)."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_10_FACTORY_L2", None)
    bpy.context.collection.objects.link(root)
    add_base_factory_l1(root)
    add_factory_l2_geometry(root)
    
    extras = {
        "unit_id": "FACTORY",
        "unit_key": "UNIT_10",
        "level": 2,
        "tier": "department",
        "building_name": "Manufacturing Plant (Body-in-White Robotic Welding Shop)",
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

def add_factory_l3_geometry(root):
    """Adds L3 Automated Paint Shop & Exhaust Stacks (+7,400 tris -> ~23,500 tris)."""
    # 1. Paint Shop High-Bay Wing (South flank: X = 5.0m, Y = -22.0m, 24m x 16m x 12.5m)
    bm_paint = bmesh.new()
    bmesh_box(bm_paint, (24.0, 16.0, 12.2), (5.0, -22.0, 6.1))
    bmesh_box(bm_paint, (24.6, 16.6, 0.4), (5.0, -22.0, 12.4))
    create_mesh_object("GEO_Factory_Paint_Shop_Shell", bm_paint, mat_travertine_concrete(), root, 0.06)
    
    # 2. Triple Towering Industrial Scrubber Exhaust Stacks (Rising to 20m)
    bm_stacks = bmesh.new()
    for sx, sy in [(14.0, -27.0), (14.0, -21.0), (14.0, -15.0)]:
        bmesh_cylinder(bm_stacks, 1.3, 18.0, (sx, sy, 9.0), segments=24)
        for st in range(8):
            st_z = 10.0 + st * 1.0
            bmesh_tube(bm_stacks, 1.45, 1.30, 0.12, (sx, sy, st_z), segments=24)
        bmesh_tube(bm_stacks, 1.7, 1.25, 0.6, (sx, sy, 18.2), segments=24)
        bmesh_cylinder(bm_stacks, 0.08, 1.4, (sx, sy, 19.0), segments=12)
        bmesh_cylinder(bm_stacks, 0.03, 17.0, (sx + 1.45, sy, 8.5), segments=8)
        for h in range(12):
            hz = 3.0 + h * 1.2
            bmesh_tube(bm_stacks, 0.55, 0.50, 0.06, (sx + 1.75, sy, hz), segments=14)
    create_mesh_object("GEO_Factory_Paint_Exhaust_Stacks", bm_stacks, mat_corrugated_industrial_steel(), root)
    
    # 3. E-Coat Dip Tank Conveyor & Curing Oven Tunnel & Rooftop Air Scrubbers
    bm_dip = bmesh.new()
    bmesh_box(bm_dip, (4.5, 12.0, 1.8), (0.0, -22.0, 0.9))
    bmesh_box(bm_dip, (3.8, 11.2, 1.4), (0.0, -22.0, 1.1))
    bmesh_ibeam(bm_dip, 14.0, 0.25, 0.18, 0.03, 0.02, (-1.2, -22.0, 2.2), axis='Y')
    bmesh_ibeam(bm_dip, 14.0, 0.25, 0.18, 0.03, 0.02, (1.2, -22.0, 2.2), axis='Y')
    bmesh_box(bm_dip, (5.2, 12.0, 4.2), (8.0, -22.0, 2.1))
    for oi in range(6):
        oy = -26.0 + oi * 1.8
        bmesh_cylinder(bm_dip, 0.15, 4.4, (10.8, oy, 2.2), segments=12, rot_x=math.radians(90.0))
    # 3 Rooftop air scrubbers
    for ri, rx in enumerate([-1.0, 3.5, 7.5]):
        bmesh_box(bm_dip, (3.2, 3.8, 2.2), (rx, -22.0, 13.5))
        bmesh_cylinder(bm_dip, 0.75, 0.4, (rx, -22.0, 14.8), segments=16)
    create_mesh_object("GEO_Factory_Paint_Dip_Tanks_Oven", bm_dip, mat_cast_iron_dark(), root)

def build_factory_l3(export_path: str):
    """L3: Automated Paint Shop & Exhaust Stacks (Target: ~23,500 tris)."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_10_FACTORY_L3", None)
    bpy.context.collection.objects.link(root)
    add_base_factory_l1(root)
    add_factory_l2_geometry(root)
    add_factory_l3_geometry(root)
    
    extras = {
        "unit_id": "FACTORY",
        "unit_key": "UNIT_10",
        "level": 3,
        "tier": "center",
        "building_name": "Manufacturing Plant (Automated Electro-Coat Paint Shop)",
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

def add_factory_l4_geometry(root):
    """Adds L4 Final Assembly Hall, Slat Conveyor & Powertrain Marriage (+11,500 tris -> ~35,000 tris)."""
    # 1. High-Bay Final Assembly Hall expansion (North-East: X = 15.0m, Y = 10.0m, 22m x 24m x 13.5m)
    bm_final = bmesh.new()
    bmesh_box(bm_final, (22.0, 24.0, 13.2), (15.0, 10.0, 6.6))
    bmesh_box(bm_final, (22.6, 24.6, 0.4), (15.0, 10.0, 13.4))
    create_mesh_object("GEO_Factory_Final_Assembly_Hall", bm_final, mat_travertine_concrete(), root, 0.06)
    
    # 2. Structural Steel Roof Trusses across Final Assembly Hall (6 portal frame trusses with 10 bays)
    bm_trusses = bmesh.new()
    for ty in [-2.0, 3.0, 8.0, 13.0, 18.0, 22.0]:
        bmesh_truss_span(bm_trusses, 21.5, 0.8, 1.2, (15.0, ty, 12.8), bays=10, axis='X')
    create_mesh_object("GEO_Factory_Assembly_Roof_Trusses", bm_trusses, mat_coral_structural_beam(), root)
    
    # 3. Low-Iron Curtain Glass Visitor Observation Walkway
    bm_walkway = bmesh.new()
    bmesh_box(bm_walkway, (18.0, 0.25, 4.2), (15.0, 22.05, 8.5))
    create_mesh_object("GEO_Factory_Observation_Glass", bm_walkway, mat_modern_curtain_glass(), root)
    
    # Curtain Glass Mullions & Mezzanine Safety Balustrade Railing (52 spindles)
    bm_mull = bmesh.new()
    for gx in range(6, 24, 2):
        bmesh_box(bm_mull, (0.12, 0.35, 4.3), (float(gx), 22.08, 8.5))
    for bi in range(52):
        bx = 6.2 + bi * 0.34
        bmesh_cylinder(bm_mull, 0.02, 1.1, (bx, 21.8, 6.9), segments=8)
    bmesh_box(bm_mull, (17.8, 0.06, 0.06), (15.0, 21.8, 7.5))
    create_mesh_object("GEO_Factory_Observation_Mullions", bm_mull, mat_brushed_aluminum(), root)
    
    # 4. In-Floor Slat Conveyor Assembly Carousel & Powertrain Marriage Hydraulic Skid & Tool Balancers
    bm_conveyor = bmesh.new()
    bmesh_box(bm_conveyor, (3.2, 22.0, 0.35), (15.0, 10.0, 0.18))
    # Slat conveyor steel plates (72 plates)
    for si in range(72):
        sy = -0.8 + si * 0.30
        bmesh_box(bm_conveyor, (2.8, 0.26, 0.08), (15.0, sy, 0.40))
    # Automated Powertrain Marriage In-Ground Hydraulic Lift
    bmesh_box(bm_conveyor, (3.8, 5.0, 0.45), (15.0, 10.0, 0.6))
    for cyl_x in [13.8, 16.2]:
        for cyl_y in [8.5, 11.5]:
            bmesh_cylinder(bm_conveyor, 0.12, 1.8, (cyl_x, cyl_y, 0.9), segments=16)
    # Multi-spindle automated torque nutrunners (8 robotic torque spindles)
    for nx in [14.0, 14.8, 15.6, 16.2]:
        for ny in [8.8, 11.2]:
            bmesh_cylinder(bm_conveyor, 0.05, 1.2, (nx, ny, 1.8), segments=12)
            bmesh_cylinder(bm_conveyor, 0.08, 0.25, (nx, ny, 2.45), segments=14)
    # 8 Overhead ergonomic tool balancers hanging above the conveyor
    for bi in range(8):
        by = 0.5 + bi * 2.6
        bmesh_cylinder(bm_conveyor, 0.08, 0.35, (13.3, by, 3.8), segments=12)
        bmesh_cylinder(bm_conveyor, 0.015, 1.6, (13.3, by, 2.8), segments=8)
        bmesh_cylinder(bm_conveyor, 0.08, 0.35, (16.7, by, 3.8), segments=12)
        bmesh_cylinder(bm_conveyor, 0.015, 1.6, (16.7, by, 2.8), segments=8)
    # Line-side kitting flow racks (4 tiers of hardware tote bins)
    for ri in range(5):
        ry = 1.0 + ri * 4.2
        bmesh_box(bm_conveyor, (1.2, 2.4, 1.6), (11.5, ry, 0.8))
        for bi in range(4):
            bmesh_box(bm_conveyor, (0.35, 0.5, 0.3), (11.5, ry - 0.75 + bi * 0.5, 1.7))
    create_mesh_object("GEO_Factory_Assembly_Floor_Conveyor", bm_conveyor, mat_cast_iron_dark(), root)

def build_factory_l4(export_path: str):
    """L4: Final Assembly Hall, Slat Conveyor & Powertrain Marriage (Target: ~35,000 tris)."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_10_FACTORY_L4", None)
    bpy.context.collection.objects.link(root)
    add_base_factory_l1(root)
    add_factory_l2_geometry(root)
    add_factory_l3_geometry(root)
    add_factory_l4_geometry(root)
    
    extras = {
        "unit_id": "FACTORY",
        "unit_key": "UNIT_10",
        "level": 4,
        "tier": "advanced_hq",
        "building_name": "Manufacturing Plant (Final Assembly & Carrier Monorail)",
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

def add_factory_l5_geometry(root):
    """Adds L5 Flexible Multi-Platform Robotics Cell, ASRS & AGVs (+12,500 tris -> ~47,500 tris)."""
    # 1. Flexible Robotics Control Center (South wing: X = -5.0m, Y = -24.0m, 30m x 10m x 10m)
    bm_robotics = bmesh.new()
    bmesh_box(bm_robotics, (30.0, 10.0, 9.8), (-5.0, -24.0, 4.9))
    bmesh_box(bm_robotics, (30.6, 10.6, 0.4), (-5.0, -24.0, 10.0))
    create_mesh_object("GEO_Factory_Robotics_Control_Shell", bm_robotics, mat_travertine_concrete(), root, 0.05)
    
    # 2. Fleet of 10 Autonomous Guided Vehicles (AGVs) carrying parts & engines
    bm_agv = bmesh.new()
    for i, ay in enumerate([-20.0, -16.0, -12.0, -8.0, -4.0, 0.0, 4.0, 8.0, 12.0, 16.0]):
        ax = 8.5 if i % 2 == 0 else -10.5
        bmesh_agv_transport_cart(bm_agv, (ax, ay, 0.0))
    create_mesh_object("GEO_Factory_AGV_Transport_Fleet", bm_agv, mat_safety_yellow(), root)
    
    # 3. High-Density Automated Storage & Retrieval System (ASRS) Pallet Racking Towers (6 rack towers)
    bm_asrs = bmesh.new()
    for rx in [-5.0, 0.0, 5.0]:
        for ry in [-27.0, -21.0]:
            for col_x in [-2.2, 2.2]:
                for col_y in [-1.4, 1.4]:
                    bmesh_box(bm_asrs, (0.12, 0.12, 8.5), (rx + col_x, ry + col_y, 4.25))
            for tier in range(4):
                tz = 1.5 + tier * 2.0
                bmesh_box(bm_asrs, (4.4, 0.10, 0.12), (rx, ry - 1.4, tz))
                bmesh_box(bm_asrs, (4.4, 0.10, 0.12), (rx, ry + 1.4, tz))
                for bi in range(5):
                    bx = rx - 1.7 + bi * 0.85
                    bmesh_box(bm_asrs, (0.75, 1.2, 0.65), (bx, ry, tz + 0.38))
            for cz in [2.5, 4.5, 6.5]:
                bmesh_cylinder(bm_asrs, 0.02, 3.2, (rx, ry, cz), segments=8, rot_y=math.radians(35.0))
                bmesh_cylinder(bm_asrs, 0.02, 3.2, (rx, ry, cz), segments=8, rot_y=math.radians(-35.0))
    # Stacker crane mast on center guide rails
    bmesh_cylinder(bm_asrs, 0.14, 9.0, (0.0, -24.0, 4.5), segments=16)
    bmesh_box(bm_asrs, (1.8, 1.8, 0.8), (0.0, -24.0, 4.5))
    create_mesh_object("GEO_Factory_ASRS_Storage_Racks", bm_asrs, mat_coral_structural_beam(), root)
    
    # 4. Central Factory Floor Operations Monitoring Console (Workstation & Chairs)
    bm_console = bmesh.new()
    bmesh_box(bm_console, (6.0, 2.4, 0.9), (-5.0, 18.0, 0.45))
    for mi in range(6):
        bmesh_box(bm_console, (0.9, 0.1, 0.7), (-7.5 + mi * 1.0, 18.8, 1.35))
        bmesh_cylinder(bm_console, 0.04, 0.5, (-7.5 + mi * 1.0, 18.8, 0.95), segments=8)
    for ci in range(3):
        bmesh_cylinder(bm_console, 0.28, 0.45, (-6.5 + ci * 1.5, 17.2, 0.25), segments=12)
        bmesh_cylinder(bm_console, 0.04, 0.45, (-6.5 + ci * 1.5, 17.2, 0.65), segments=8)
        bmesh_box(bm_console, (0.5, 0.45, 0.45), (-6.5 + ci * 1.5, 17.2, 0.95))
    create_mesh_object("GEO_Factory_Floor_Control_Desk", bm_console, mat_modern_curtain_glass(), root)
    
    # Hitbox
    bm_rob_hb = bmesh.new()
    bmesh_box(bm_rob_hb, (32.0, 12.0, 11.0), (-5.0, -24.0, 5.5))
    create_mesh_object("HITBOX_FACTORY_ROBOTICS", bm_rob_hb, None, root)

def build_factory_l5(export_path: str):
    """L5: Flexible Multi-Platform Robotics Cell & AGVs (Target: ~47,500 tris)."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_10_FACTORY_L5", None)
    bpy.context.collection.objects.link(root)
    add_base_factory_l1(root)
    add_factory_l2_geometry(root)
    add_factory_l3_geometry(root)
    add_factory_l4_geometry(root)
    add_factory_l5_geometry(root)
    
    extras = {
        "unit_id": "FACTORY",
        "unit_key": "UNIT_10",
        "level": 5,
        "tier": "world_class_hq",
        "building_name": "Manufacturing Plant (Multi-Platform Robotics Cell & AGVs)",
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

def add_factory_l6_geometry(root):
    """Adds L6 High-Voltage EV Battery Pack Marriage & Megawatt Solar Array (+11,000 tris -> ~58,500 tris)."""
    # 1. Cleanroom Battery Pack Marriage Module (West flank: X = -22.0m, Y = -4.0m, 8m x 36m x 9.5m)
    bm_battery = bmesh.new()
    bmesh_box(bm_battery, (8.0, 36.0, 9.5), (-22.0, -4.0, 4.75))
    bmesh_box(bm_battery, (8.6, 36.6, 0.4), (-22.0, -4.0, 9.7))
    create_mesh_object("GEO_Factory_Battery_Marriage_Shell", bm_battery, mat_travertine_concrete(), root, 0.05)
    
    # 2. Automated EV Battery Pack Hydraulic Elevator Lifter Docks (4 docking bays with cell modules & nutrunners)
    bm_lifters = bmesh.new()
    for by in [-16.0, -8.0, 0.0, 8.0]:
        bmesh_box(bm_lifters, (3.2, 4.4, 0.8), (-22.0, by, 0.4))
        bmesh_cylinder(bm_lifters, 0.06, 1.8, (-23.0, by, 0.9), segments=12, rot_x=math.radians(35.0))
        bmesh_cylinder(bm_lifters, 0.06, 1.8, (-21.0, by, 0.9), segments=12, rot_x=math.radians(-35.0))
        bmesh_box(bm_lifters, (2.4, 3.8, 0.35), (-22.0, by, 1.5))
        # 16 internal prismatic cell modules visible inside tray
        for ci in range(4):
            for cj in range(4):
                bmesh_box(bm_lifters, (0.45, 0.7, 0.22), (-22.6 + cj * 0.42, by - 1.2 + ci * 0.8, 1.7))
        bmesh_cylinder(bm_lifters, 0.06, 0.3, (-22.0, by + 1.8, 1.5), segments=14, rot_x=math.radians(90.0))
        bmesh_cylinder(bm_lifters, 0.06, 0.3, (-22.0, by - 1.8, 1.5), segments=14, rot_x=math.radians(90.0))
        # Overhead automated torque nutrunner fastening gantry
        bmesh_box(bm_lifters, (2.8, 0.3, 0.3), (-22.0, by, 3.2))
        for sp in [-0.9, -0.3, 0.3, 0.9]:
            bmesh_cylinder(bm_lifters, 0.04, 0.8, (-22.0 + sp, by, 2.8), segments=12)
            bmesh_cylinder(bm_lifters, 0.07, 0.15, (-22.0 + sp, by, 2.35), segments=14)
    # High-voltage diagnostic test bench cabinet
    bmesh_box(bm_lifters, (1.8, 3.2, 2.2), (-22.0, 15.0, 1.1))
    bmesh_cylinder(bm_lifters, 0.05, 1.8, (-22.0, 14.2, 1.0), segments=10)
    bmesh_cylinder(bm_lifters, 0.05, 1.8, (-22.0, 15.8, 1.0), segments=10)
    create_mesh_object("GEO_Factory_Battery_Docking_Lifters", bm_lifters, mat_construction_orange(), root)
    
    # 3. Rooftop Megawatt Photovoltaic Solar Canopy Array across Main Factory Roof (28 purlins + 80 modules)
    bm_solar = bmesh.new()
    for pi in range(28):
        px = -23.0 + pi * 1.35
        bmesh_cylinder(bm_solar, 0.04, 46.0, (px, -4.0, 13.2), segments=10, rot_x=math.radians(90.0))
    for row in range(10):
        py = -23.0 + row * 4.3
        for col in range(8):
            px = -18.0 + col * 4.2
            bmesh_box(bm_solar, (3.8, 2.1, 0.08), (px, py, 13.6))
            bmesh_box(bm_solar, (0.4, 0.3, 0.12), (px, py, 13.4))
            bmesh_cylinder(bm_solar, 0.025, 0.4, (px, py, 13.3), segments=8)
    create_mesh_object("GEO_Factory_Photovoltaic_Solar_Canopy", bm_solar, mat_modern_curtain_glass(), root)

def build_factory_l6(export_path: str):
    """L6: High-Voltage EV Battery Marriage & Megawatt Solar Array (Target: ~58,500 tris)."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_10_FACTORY_L6", None)
    bpy.context.collection.objects.link(root)
    add_base_factory_l1(root)
    add_factory_l2_geometry(root)
    add_factory_l3_geometry(root)
    add_factory_l4_geometry(root)
    add_factory_l5_geometry(root)
    add_factory_l6_geometry(root)
    
    extras = {
        "unit_id": "FACTORY",
        "unit_key": "UNIT_10",
        "level": 6,
        "tier": "innovation_campus",
        "building_name": "Manufacturing Plant (Battery Marriage & Powertrain Docking)",
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

def add_factory_l7_geometry(root):
    """Adds L7 Lights-Out Gigafactory Operations Spire Tower, Skybridge & Drone Vertiport (+13,500 tris -> ~72,000 tris)."""
    # 1. Soaring Central Gigafactory Operations Spire Tower (NW corner: X = -18.0m, Y = 25.0m, rising to 22.5m)
    bm_giga_tower = bmesh.new()
    bmesh_box(bm_giga_tower, (12.0, 12.0, 21.0), (-18.0, 25.0, 10.5))
    bmesh_box(bm_giga_tower, (12.6, 12.6, 0.6), (-18.0, 25.0, 21.3))
    bmesh_cylinder(bm_giga_tower, 0.09, 3.8, (-18.0, 25.0, 23.2), segments=16)
    # Microwave dish drums on mast
    for mwd in [22.8, 24.2]:
        bmesh_cylinder(bm_giga_tower, 0.45, 0.22, (-18.0, 25.4, mwd), segments=14, rot_x=math.radians(90.0))
        bmesh_cylinder(bm_giga_tower, 0.45, 0.22, (-18.0, 24.6, mwd), segments=14, rot_x=math.radians(90.0))
    for ci in [-5.8, 5.8]:
        for cj in [-5.8, 5.8]:
            bmesh_box(bm_giga_tower, (0.5, 0.5, 20.0), (-18.0 + ci, 25.0 + cj, 10.5))
    create_mesh_object("GEO_Factory_Gigafactory_Tower_Shell", bm_giga_tower, mat_travertine_concrete(), root, 0.06)
    
    # 2. Tower Double-Skin Structural Curtain Glass & 64 Aerodynamic Louvers & Panoramic Elevator
    bm_tower_glass = bmesh.new()
    bmesh_box(bm_tower_glass, (11.8, 11.8, 16.5), (-18.0, 25.0, 11.5))
    create_mesh_object("GEO_Factory_Tower_Curtain_Glass", bm_tower_glass, mat_modern_curtain_glass(), root)
    
    bm_louvers = bmesh.new()
    for lz_idx in range(20):
        lz_pos = 3.5 + lz_idx * 0.9
        bmesh_box(bm_louvers, (12.2, 0.45, 0.06), (-18.0, 31.2, lz_pos))
        bmesh_box(bm_louvers, (12.2, 0.45, 0.06), (-18.0, 18.8, lz_pos))
        bmesh_box(bm_louvers, (0.45, 12.2, 0.06), (-11.8, 25.0, lz_pos))
        bmesh_box(bm_louvers, (0.45, 12.2, 0.06), (-24.2, 25.0, lz_pos))
    for fi in range(8):
        fx = -23.6 + fi * 1.6
        bmesh_box(bm_louvers, (0.08, 0.35, 16.5), (fx, 31.3, 11.5))
        bmesh_box(bm_louvers, (0.08, 0.35, 16.5), (fx, 18.7, 11.5))
    # Panoramic exterior glass elevator running on south tower face
    bmesh_box(bm_louvers, (2.4, 2.2, 3.2), (-18.0, 18.0, 12.0))
    for rail_x in [-18.8, -17.2]:
        bmesh_cylinder(bm_louvers, 0.04, 20.0, (rail_x, 18.5, 10.5), segments=8)
    create_mesh_object("GEO_Factory_Tower_Aero_Louvers", bm_louvers, mat_brushed_aluminum(), root)
    
    # 3. Continuous Panoramic Glass Visitor Skybridge with Under-Slung Structural Truss (Spanning 48m)
    bm_skybridge = bmesh.new()
    bmesh_box(bm_skybridge, (4.5, 48.0, 3.5), (-5.0, -4.0, 14.5))
    bmesh_box(bm_skybridge, (0.15, 47.6, 2.2), (-7.15, -4.0, 14.5))
    bmesh_box(bm_skybridge, (0.15, 47.6, 2.2), (-2.85, -4.0, 14.5))
    for mi in range(24):
        my = -26.0 + mi * 2.0
        bmesh_box(bm_skybridge, (0.25, 0.08, 2.4), (-7.15, my, 14.5))
        bmesh_box(bm_skybridge, (0.25, 0.08, 2.4), (-2.85, my, 14.5))
    for cz in [12.6]:
        bmesh_cylinder(bm_skybridge, 0.06, 48.0, (-6.8, -4.0, cz), segments=8, rot_x=math.radians(90.0))
        bmesh_cylinder(bm_skybridge, 0.06, 48.0, (-3.2, -4.0, cz), segments=8, rot_x=math.radians(90.0))
        for ti in range(24):
            ty = -26.0 + ti * 2.1
            bmesh_cylinder(bm_skybridge, 0.035, 3.6, (-5.0, ty, cz), segments=6, rot_y=math.radians(90.0))
            bmesh_cylinder(bm_skybridge, 0.035, 2.2, (-6.8, ty, 13.5), segments=6)
            bmesh_cylinder(bm_skybridge, 0.035, 2.2, (-3.2, ty, 13.5), segments=6)
    create_mesh_object("GEO_Factory_Visitor_SkyBridge_Glass", bm_skybridge, mat_modern_curtain_glass(), root)
    
    # 4. Rooftop Automated Drone Logistics Vertiport & Lighting Ring
    bm_vertiport = bmesh.new()
    bmesh_cylinder(bm_vertiport, 4.8, 0.35, (-18.0, 25.0, 21.75), segments=28)
    bmesh_tube(bm_vertiport, 5.1, 4.7, 0.15, (-18.0, 25.0, 21.85), segments=28)
    for h in range(24):
        hang = h * 2 * math.pi / 24
        hx = -18.0 + 4.9 * math.cos(hang)
        hy = 25.0 + 4.9 * math.sin(hang)
        bmesh_cylinder(bm_vertiport, 0.08, 0.18, (hx, hy, 21.95), segments=12)
    bmesh_box(bm_vertiport, (0.3, 3.8, 1.8), (-15.5, 25.0, 22.8))
    bmesh_cylinder(bm_vertiport, 0.08, 3.6, (-15.5, 25.0, 23.6), segments=12, rot_x=math.radians(90.0))
    create_mesh_object("GEO_Factory_Drone_Vertiport", bm_vertiport, mat_safety_yellow(), root)
    
    # 5. Central Holographic Production Line Telemetry Pod & 3D Hologram Wireframe
    bm_holo = bmesh.new()
    bmesh_cylinder(bm_holo, 3.2, 0.35, (-5.0, -4.0, 16.5), segments=32)
    bmesh_tube(bm_holo, 2.9, 2.6, 0.12, (-5.0, -4.0, 17.2), segments=32)
    bmesh_tube(bm_holo, 2.2, 1.9, 0.12, (-5.0, -4.0, 18.0), segments=28)
    bmesh_tube(bm_holo, 1.5, 1.2, 0.12, (-5.0, -4.0, 18.8), segments=24)
    for pi in range(96):
        theta = pi * 2 * math.pi / 96
        px = -5.0 + 2.75 * math.cos(theta)
        py = -4.0 + 2.75 * math.sin(theta)
        bmesh_cylinder(bm_holo, 0.02, 0.45, (px, py, 17.2), segments=8)
    bmesh_box(bm_holo, (1.8, 3.6, 0.8), (-5.0, -4.0, 18.2))
    bmesh_box(bm_holo, (1.4, 1.8, 0.6), (-5.0, -4.2, 18.8))
    for hwx, hwy in [(-0.9, -1.0), (0.9, -1.0), (-0.9, 1.0), (0.9, 1.0)]:
        bmesh_cylinder(bm_holo, 0.3, 0.12, (-5.0 + hwx, -4.0 + hwy, 18.0), segments=14, rot_y=math.radians(90.0))
    create_mesh_object("GEO_Factory_Holographic_Production_Pod", bm_holo, mat_holographic_cyan_glow(), root)
    
    # Hitbox
    bm_tower_hb = bmesh.new()
    bmesh_box(bm_tower_hb, (14.0, 14.0, 22.0), (-18.0, 25.0, 11.0))
    create_mesh_object("HITBOX_FACTORY_TOWER", bm_tower_hb, None, root)

def build_factory_l7(export_path: str):
    """L7: Lights-Out Hyper-Automated Gigafactory Complex (Target: ~72,000 tris)."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_10_FACTORY_L7", None)
    bpy.context.collection.objects.link(root)
    add_base_factory_l1(root)
    add_factory_l2_geometry(root)
    add_factory_l3_geometry(root)
    add_factory_l4_geometry(root)
    add_factory_l5_geometry(root)
    add_factory_l6_geometry(root)
    add_factory_l7_geometry(root)
    
    extras = {
        "unit_id": "FACTORY",
        "unit_key": "UNIT_10",
        "level": 7,
        "tier": "hypermodern_campus",
        "building_name": "Manufacturing Plant (Lights-Out Gigafactory Complex)",
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── BATCH GENERATION ORCHESTRATOR ──

def generate_all_factory_levels(output_dir: str = None):
    if output_dir is None:
        output_dir = os.path.join(workspace_root, "public", "models", "campus")
    os.makedirs(output_dir, exist_ok=True)
    
    levels = [
        (0, "hq_10_factory_l0.glb", build_factory_l0),
        (1, "hq_10_factory_l1.glb", build_factory_l1),
        (2, "hq_10_factory_l2.glb", build_factory_l2),
        (3, "hq_10_factory_l3.glb", build_factory_l3),
        (4, "hq_10_factory_l4.glb", build_factory_l4),
        (5, "hq_10_factory_l5.glb", build_factory_l5),
        (6, "hq_10_factory_l6.glb", build_factory_l6),
        (7, "hq_10_factory_l7.glb", build_factory_l7),
    ]
    
    results = {}
    print("=" * 70)
    print(" AUTO TYCOON CAMPUS - UNIT_10 MANUFACTURING PLANT COMPLEX")
    print(f" Target Output Directory: {output_dir}")
    print("=" * 70)
    
    all_passed = True
    for lvl, filename, builder_func in levels:
        out_path = os.path.join(output_dir, filename)
        tier_name = CAMPUS_TRIANGLE_BUDGETS[lvl]["tier"]
        print(f"\n>>> Generating UNIT_10 Level {lvl} ({tier_name}) -> {filename}...")
        
        success = builder_func(out_path)
        passed, report = audit_scene("UNIT_10_FACTORY", lvl, bpy)
        print_audit_summary(report)
        
        file_size = os.path.getsize(out_path) if os.path.exists(out_path) else 0
        tris = report["total_triangles"]
        print(f"    Export: {success} | Size: {file_size / 1024:.1f} KB | Triangles: {tris:,}")
        results[lvl] = {"file": filename, "passed": passed, "size_kb": file_size / 1024.0, "triangles": tris}
        if not passed:
            all_passed = False
            
    print("\n" + "=" * 70)
    print(" UNIT_10 MANUFACTURING PLANT SUMMARY AUDIT TABLE")
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
    
    generate_all_factory_levels(target_dir)
