"""
AUTO TYCOON CAMPUS HQ - UNIT_12 QUALITY & RELIABILITY ASSURANCE GENERATOR (PHASES 155-162)

Generates all 8 progression levels (L0-L7) for UNIT_12:
- Footprint: 24m x 24m (Zone C Metrology Plot)
- Architectural Identity: Precision Metrology, CMM Coordinate Measurement & Zero-Defect QA
  L0: Survey Site & Seismic Vibration-Isolation Foundation Groundworks
  L1: 1970s Starter Metrology & Gauge Calibration Lab (Brutalist Travertine/Brick, Granite Surface Plates)
  L2: CMM Climate Cleanroom & Air Shower Lock (1975-1980, 5-Axis Bridge CMM, Active Isolation)
  L3: Accelerated Environmental Weathering Wing (1980-1990, Salt-Fog Cabinets, Thermal Shock Chambers)
  L4: Non-Destructive Testing (NDT) X-Ray & CT Vault (1995-2000, 450kV CT Gantry, V6 Block Scan)
  L5: 3D Optical Blue-Light Metrology Dome (2005-2010, Dual 6-Axis Robots, Clay Car Body Buck)
  L6: Forensic Vehicle Teardown & Metallurgy Lab (2015-2020, Rolling Chassis Lift, FE-SEM Column)
  L7: Zero-Defect AI Metrology Center & Floating Glass Cube (2025+ Hypermodern, 22m Spire, Holographic Halo)

Follows the UNIT_01 Proven Production Standard:
- 100% deterministic GEO_* and HITBOX_* naming
- Parameterized BMesh modeling with clean bevels and smooth shading
- Strict triangle budgets:
  L0: 1,000 - 3,000 tris (Target: ~2,500)
  L1: 8,000 - 12,000 tris (Target: ~9,500)
  L2: 14,000 - 18,000 tris (Target: ~15,500)
  L3: 20,000 - 26,000 tris (Target: ~22,500)
  L4: 30,000 - 40,000 tris (Target: ~33,000)
  L5: 40,000 - 55,000 tris (Target: ~44,500)
  L6: 50,000 - 65,000 tris (Target: ~56,000)
  L7: 60,000 - 80,000 tris (Target: ~67,500)
- Zero warnings from campus_quality_gate.py
- Zero generic names, no raw cubes
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
    mat_satin_matte_white,
    mat_interior_emissive_warm,
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

def bmesh_cylinder(bm, radius: float, height: float, loc: tuple, segments=24, rot_x=0.0, rot_y=0.0, rot_z=0.0):
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

def bmesh_tube(bm, outer_r: float, inner_r: float, height: float, loc: tuple, segments=24, rot_x=0.0, rot_y=0.0, rot_z=0.0):
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

def bmesh_pyramid(bm, base_size: tuple, height: float, loc: tuple, rot_x=0.0, rot_y=0.0, rot_z=0.0):
    lx, ly, lz = loc
    bx, by = base_size
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
    b0 = bm.verts.new(transform(-bx/2, -by/2, 0.0))
    b1 = bm.verts.new(transform(bx/2, -by/2, 0.0))
    b2 = bm.verts.new(transform(bx/2, by/2, 0.0))
    b3 = bm.verts.new(transform(-bx/2, by/2, 0.0))
    apex = bm.verts.new(transform(0.0, 0.0, height))
    bm.faces.new([b0, b1, b2, b3])
    bm.faces.new([b0, apex, b1])
    bm.faces.new([b1, apex, b2])
    bm.faces.new([b2, apex, b3])
    bm.faces.new([b3, apex, b0])

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

# ── Specialized Metrology & QA Procedural Subassemblies ──

def bmesh_surveyor_theodolite(bm, loc: tuple):
    """Creates a high-precision surveyor total station / theodolite on an aluminum tripod."""
    lx, ly, lz = loc
    for i in range(3):
        angle = i * (2 * math.pi / 3)
        foot_x = lx + 0.65 * math.cos(angle)
        foot_y = ly + 0.65 * math.sin(angle)
        leg_mid_x = (lx + foot_x) / 2
        leg_mid_y = (ly + foot_y) / 2
        rot_z = -angle
        bmesh_cylinder(bm, 0.028, 1.35, (leg_mid_x, leg_mid_y, lz + 0.65), segments=10, rot_x=math.radians(24.0), rot_z=rot_z)
        bmesh_cylinder(bm, 0.042, 0.10, (leg_mid_x, leg_mid_y, lz + 0.65), segments=10)
    bmesh_cylinder(bm, 0.16, 0.08, (lx, ly, lz + 1.25), segments=16)
    bmesh_cylinder(bm, 0.12, 0.06, (lx, ly, lz + 1.32), segments=14)
    bmesh_box(bm, (0.18, 0.18, 0.28), (lx, ly, lz + 1.48))
    bmesh_cylinder(bm, 0.045, 0.32, (lx, ly, lz + 1.54), segments=16, rot_x=math.radians(90.0))
    bmesh_tube(bm, 0.055, 0.042, 0.06, (lx, ly + 0.16, lz + 1.54), segments=16, rot_x=math.radians(90.0))
    bmesh_cylinder(bm, 0.025, 0.08, (lx, ly - 0.17, lz + 1.54), segments=12, rot_x=math.radians(90.0))
    bmesh_cylinder(bm, 0.07, 0.04, (lx + 0.10, ly, lz + 1.54), segments=14, rot_y=math.radians(90.0))
    bmesh_box(bm, (0.02, 0.10, 0.08), (lx - 0.10, ly, lz + 1.45))

def bmesh_granite_surface_plate(bm, loc: tuple, size=(3.2, 2.2, 0.45)):
    """Creates a precision Grade 00 black granite surface plate with cast-iron leveling jacks."""
    lx, ly, lz = loc
    sx, sy, sz = size
    bmesh_box(bm, (sx, sy, sz), (lx, ly, lz + 0.625))
    for cx in [-sx*0.38, sx*0.38]:
        for cy in [-sy*0.38, sy*0.38]:
            bmesh_cylinder(bm, 0.12, 0.35, (lx + cx, ly + cy, lz + 0.22), segments=14)
            bmesh_cylinder(bm, 0.20, 0.05, (lx + cx, ly + cy, lz + 0.025), segments=16)
    bmesh_box(bm, (sx * 0.85, sy * 0.85, 0.08), (lx, ly, lz + 0.38))

def bmesh_optical_comparator(bm, loc: tuple):
    """Creates a precision optical profile projector / shadowgraph inspection station."""
    lx, ly, lz = loc
    bmesh_box(bm, (1.2, 1.4, 0.90), (lx, ly, lz + 0.45))
    bmesh_box(bm, (0.85, 0.65, 0.12), (lx, ly - 0.15, lz + 0.96))
    bmesh_cylinder(bm, 0.05, 0.18, (lx + 0.48, ly - 0.15, lz + 0.96), segments=12, rot_y=math.radians(90.0))
    bmesh_cylinder(bm, 0.05, 0.18, (lx, ly - 0.52, lz + 0.96), segments=12, rot_x=math.radians(90.0))
    bmesh_box(bm, (0.60, 0.50, 1.20), (lx, ly + 0.35, lz + 1.50))
    bmesh_cylinder(bm, 0.08, 0.20, (lx, ly + 0.05, lz + 1.45), segments=16)
    bmesh_cylinder(bm, 0.38, 0.06, (lx, ly + 0.12, lz + 1.95), segments=24, rot_x=math.radians(75.0))
    bmesh_tube(bm, 0.42, 0.37, 0.08, (lx, ly + 0.12, lz + 1.95), segments=24, rot_x=math.radians(75.0))
    bmesh_cylinder(bm, 0.025, 0.45, (lx + 0.55, ly + 0.20, lz + 1.40), segments=10)
    bmesh_box(bm, (0.28, 0.12, 0.22), (lx + 0.55, ly + 0.05, lz + 1.65))

def bmesh_bridge_cmm(bm, loc: tuple):
    """Creates a high-precision CNC Bridge Coordinate Measuring Machine with Renishaw probe."""
    lx, ly, lz = loc
    bmesh_box(bm, (2.6, 3.8, 0.65), (lx, ly, lz + 0.525))
    for dx in [-1.0, 1.0]:
        for dy in [-1.4, 0.0, 1.4]:
            bmesh_cylinder(bm, 0.18, 0.20, (lx + dx, ly + dy, lz + 0.10), segments=16)
    bmesh_box(bm, (0.35, 3.8, 0.25), (lx - 1.15, ly, lz + 0.97))
    bmesh_box(bm, (0.35, 3.8, 0.25), (lx + 1.15, ly, lz + 0.97))
    bmesh_box(bm, (0.42, 0.55, 2.5), (lx - 1.15, ly, lz + 2.25))
    bmesh_box(bm, (0.42, 0.55, 2.5), (lx + 1.15, ly, lz + 2.25))
    bmesh_box(bm, (2.8, 0.50, 0.45), (lx, ly, lz + 3.45))
    bmesh_box(bm, (0.50, 0.55, 0.48), (lx, ly, lz + 3.45))
    bmesh_cylinder(bm, 0.065, 1.8, (lx, ly, lz + 2.65), segments=16)
    bmesh_cylinder(bm, 0.08, 0.14, (lx, ly, lz + 1.68), segments=16)
    bmesh_cylinder(bm, 0.05, 0.10, (lx, ly, lz + 1.56), segments=14)
    bmesh_cylinder(bm, 0.012, 0.18, (lx, ly, lz + 1.42), segments=10)
    bmesh_cylinder(bm, 0.022, 0.04, (lx, ly, lz + 1.31), segments=12)
    bmesh_cylinder(bm, 0.08, 0.03, (lx + 0.85, ly + 1.3, lz + 0.86), segments=14)
    bmesh_cylinder(bm, 0.018, 0.35, (lx + 0.85, ly + 1.3, lz + 1.03), segments=12)
    bmesh_cylinder(bm, 0.045, 0.09, (lx + 0.85, ly + 1.3, lz + 1.22), segments=16)
    bmesh_box(bm, (0.16, 1.2, 0.10), (lx - 0.75, ly - 0.5, lz + 0.90))
    # CNC workstation desk
    bmesh_box(bm, (1.4, 0.80, 0.85), (lx + 2.2, ly, lz + 0.425))
    for mx in [-0.35, 0.35]:
        bmesh_box(bm, (0.55, 0.08, 0.38), (lx + 2.2 + mx, ly - 0.1, lz + 1.05))
        bmesh_cylinder(bm, 0.035, 0.20, (lx + 2.2 + mx, ly - 0.1, lz + 0.95), segments=10)
    bmesh_box(bm, (0.22, 0.28, 0.08), (lx + 2.2, ly + 0.22, lz + 0.89))
    bmesh_cylinder(bm, 0.018, 0.14, (lx + 2.2, ly + 0.22, lz + 0.98), segments=10)

def bmesh_salt_spray_chamber(bm, loc: tuple):
    """Creates an accelerated cyclic corrosion / salt-fog test cabinet."""
    lx, ly, lz = loc
    bmesh_box(bm, (2.2, 1.6, 1.4), (lx, ly, lz + 0.70))
    bmesh_box(bm, (1.9, 0.10, 0.50), (lx, ly - 0.82, lz + 1.10))
    bmesh_pyramid(bm, (2.1, 1.5), 0.45, (lx, ly, lz + 1.40))
    for px in [-1.05, 1.05]:
        bmesh_cylinder(bm, 0.03, 0.75, (lx + px, ly, lz + 1.25), segments=10, rot_x=math.radians(25.0))
    bmesh_cylinder(bm, 0.22, 1.35, (lx + 1.35, ly, lz + 0.675), segments=18)
    bmesh_cylinder(bm, 0.26, 0.10, (lx + 1.35, ly, lz + 1.35), segments=18)
    bmesh_box(bm, (0.45, 0.12, 0.65), (lx - 0.70, ly - 0.84, lz + 0.65))
    bmesh_cylinder(bm, 0.035, 0.12, (lx - 0.70, ly - 0.84, lz + 1.05), segments=12)
    bmesh_cylinder(bm, 0.10, 0.85, (lx, ly + 0.75, lz + 1.80), segments=14)

def bmesh_ct_xray_gantry(bm, loc: tuple):
    """Creates a 450kV industrial X-ray Computed Tomography (CT) 3D scanner with V6 block."""
    lx, ly, lz = loc
    bmesh_box(bm, (4.5, 3.2, 0.60), (lx, ly, lz + 0.30))
    bmesh_tube(bm, 1.75, 1.05, 0.90, (lx, ly, lz + 1.85), segments=32, rot_x=math.radians(90.0))
    for sx in [-1.85, 1.85]:
        bmesh_box(bm, (0.45, 1.0, 2.4), (lx + sx, ly, lz + 1.50))
    bmesh_cylinder(bm, 0.28, 0.75, (lx, ly - 0.2, lz + 3.25), segments=20, rot_x=math.radians(90.0))
    bmesh_cylinder(bm, 0.12, 0.40, (lx, ly + 0.3, lz + 3.25), segments=16)
    bmesh_box(bm, (0.85, 0.85, 0.22), (lx, ly, lz + 0.75))
    bmesh_cylinder(bm, 0.55, 0.25, (lx, ly, lz + 1.15), segments=28)
    # Detailed V6 engine block specimen on turntable undergoing tomography
    bmesh_box(bm, (0.65, 0.85, 0.45), (lx, ly, lz + 1.50))
    for cyl_i in range(3):
        # Left and right cylinder banks
        bmesh_cylinder(bm, 0.09, 0.35, (lx - 0.18, ly - 0.26 + cyl_i * 0.26, lz + 1.58), segments=16, rot_x=math.radians(30.0))
        bmesh_cylinder(bm, 0.09, 0.35, (lx + 0.18, ly - 0.26 + cyl_i * 0.26, lz + 1.58), segments=16, rot_x=math.radians(-30.0))
    for cy in [-1.2, 0.0, 1.2]:
        bmesh_tube(bm, 0.08, 0.06, 0.80, (lx - 1.95, ly + cy, lz + 0.50), segments=14)

def bmesh_robotic_scanning_arm(bm, loc: tuple, yaw=0.0):
    """Creates a 6-axis industrial robot arm with ATOS blue-light optical 3D scanner head."""
    lx, ly, lz = loc
    cos_y, sin_y = math.cos(yaw), math.sin(yaw)
    def rotate_pt(x, y, z):
        rx = x * cos_y - y * sin_y
        ry = x * sin_y + y * cos_y
        return (lx + rx, ly + ry, lz + z)
    bmesh_cylinder(bm, 0.42, 0.35, (lx, ly, lz + 0.175), segments=20)
    bmesh_cylinder(bm, 0.35, 0.30, (lx, ly, lz + 0.45), segments=20)
    bmesh_cylinder(bm, 0.32, 0.45, (lx, ly, lz + 0.80), segments=18, rot_y=math.radians(90.0))
    p_j2 = rotate_pt(0.0, 0.25, 1.65)
    bmesh_cylinder(bm, 0.18, 1.45, p_j2, segments=18, rot_x=math.radians(-25.0), rot_z=yaw)
    p_j3 = rotate_pt(0.0, 0.55, 2.35)
    bmesh_cylinder(bm, 0.24, 0.40, p_j3, segments=18, rot_y=math.radians(90.0))
    p_j4 = rotate_pt(0.0, 1.15, 2.15)
    bmesh_cylinder(bm, 0.15, 1.35, p_j4, segments=18, rot_x=math.radians(70.0), rot_z=yaw)
    p_wrist = rotate_pt(0.0, 1.75, 1.95)
    bmesh_cylinder(bm, 0.12, 0.25, p_wrist, segments=16, rot_z=yaw)
    p_head = rotate_pt(0.0, 1.95, 1.85)
    bmesh_box(bm, (0.55, 0.22, 0.20), p_head)
    for cx in [-0.22, 0.22]:
        p_cam = rotate_pt(cx, 2.08, 1.85)
        bmesh_cylinder(bm, 0.05, 0.12, p_cam, segments=16, rot_x=math.radians(90.0), rot_z=yaw)
    p_proj = rotate_pt(0.0, 2.10, 1.85)
    bmesh_cylinder(bm, 0.07, 0.14, p_proj, segments=18, rot_x=math.radians(90.0), rot_z=yaw)

def bmesh_sem_electron_microscope(bm, loc: tuple):
    """Creates a high-resolution Field Emission Scanning Electron Microscope (FE-SEM)."""
    lx, ly, lz = loc
    bmesh_box(bm, (1.8, 1.6, 0.65), (lx, ly, lz + 0.325))
    bmesh_box(bm, (0.85, 0.85, 0.65), (lx, ly, lz + 0.95))
    bmesh_cylinder(bm, 0.14, 0.55, (lx, ly - 0.55, lz + 0.85), segments=16, rot_x=math.radians(90.0))
    bmesh_cylinder(bm, 0.24, 0.50, (lx, ly, lz + 1.45), segments=22)
    bmesh_cylinder(bm, 0.18, 0.60, (lx, ly, lz + 1.95), segments=20)
    bmesh_cylinder(bm, 0.14, 0.45, (lx, ly, lz + 2.45), segments=18)
    bmesh_cylinder(bm, 0.22, 0.15, (lx, ly, lz + 2.70), segments=22)
    bmesh_cylinder(bm, 0.065, 0.65, (lx + 0.45, ly, lz + 1.35), segments=16, rot_y=math.radians(45.0))
    bmesh_box(bm, (2.2, 0.90, 0.80), (lx, ly - 1.4, lz + 0.40))
    for ox in [-0.65, 0.0, 0.65]:
        bmesh_box(bm, (0.55, 0.06, 0.35), (lx + ox, ly - 1.6, lz + 1.05))
        bmesh_cylinder(bm, 0.03, 0.20, (lx + ox, ly - 1.6, lz + 0.95), segments=12)

# ── LEVEL BUILDERS ──

def build_quality_l0(export_path: str):
    reset_scene()
    root = bpy.data.objects.new("UNIT_12_QUALITY_HQ_L0", None)
    bpy.context.collection.objects.link(root)
    
    # 1. Foundation Plinth (24m x 24m)
    bm_plinth = bmesh.new()
    bmesh_box(bm_plinth, (24.0, 24.0, 0.35), (0.0, 0.0, -0.175))
    for gx in range(-10, 11, 2):
        bmesh_box(bm_plinth, (0.08, 22.0, 0.02), (float(gx), 0.0, 0.01))
    for gy in range(-10, 11, 2):
        bmesh_box(bm_plinth, (22.0, 0.08, 0.02), (0.0, float(gy), 0.01))
    create_mesh_object("GEO_Quality_Foundation_Plinth", bm_plinth, mat_travertine_concrete(), root, 0.04)
    
    # 2. Survey Boundary Stakes & Poles
    bm_stakes = bmesh.new()
    stake_coords = [
        (-10.5, -10.5), (10.5, -10.5), (10.5, 10.5), (-10.5, 10.5),
        (-10.5, 0.0), (10.5, 0.0), (0.0, -10.5), (0.0, 10.5),
        (-5.0, -5.0), (5.0, -5.0), (5.0, 5.0), (-5.0, 5.0)
    ]
    for sx, sy in stake_coords:
        bmesh_cylinder(bm_stakes, 0.06, 1.8, (sx, sy, 0.9), segments=12)
        bmesh_cylinder(bm_stakes, 0.08, 0.22, (sx, sy, 1.6), segments=12)
    create_mesh_object("GEO_Quality_Survey_Stakes", bm_stakes, mat_safety_yellow(), root)
    
    # 3. Precision Optical Surveyor Total Stations / Theodolites (2 stations)
    bm_theodolites = bmesh.new()
    bmesh_surveyor_theodolite(bm_theodolites, (-3.5, 4.0, 0.0))
    bmesh_surveyor_theodolite(bm_theodolites, (6.0, -3.0, 0.0))
    create_mesh_object("GEO_Quality_Survey_Theodolites", bm_theodolites, mat_construction_orange(), root)
    
    # 4. Large Project Site Notice Signboard & Ground Drill Rig
    bm_sign = bmesh.new()
    bmesh_box(bm_sign, (0.18, 0.18, 2.8), (-2.2, 9.5, 1.4))
    bmesh_box(bm_sign, (0.18, 0.18, 2.8), (2.2, 9.5, 1.4))
    bmesh_box(bm_sign, (5.2, 0.14, 2.0), (0.0, 9.5, 2.4))
    bmesh_cylinder(bm_sign, 0.05, 2.4, (-2.2, 8.5, 1.2), segments=10, rot_x=math.radians(35.0))
    bmesh_cylinder(bm_sign, 0.05, 2.4, (2.2, 8.5, 1.2), segments=10, rot_x=math.radians(35.0))
    bmesh_box(bm_sign, (1.8, 1.8, 0.35), (0.0, -1.0, 0.175))
    bmesh_box(bm_sign, (0.15, 0.15, 3.2), (0.0, -1.0, 1.8))
    bmesh_cylinder(bm_sign, 0.08, 2.8, (0.0, -1.0, 1.6), segments=14)
    bmesh_cylinder(bm_sign, 0.28, 0.45, (0.0, -1.0, 3.1), segments=16)
    create_mesh_object("GEO_Quality_Survey_Signboard", bm_sign, mat_dark_slate_roof(), root)
    
    # Semantic Hitboxes
    bm_hitbox = bmesh.new()
    bmesh_box(bm_hitbox, (22.0, 22.0, 2.5), (0.0, 0.0, 1.25))
    create_mesh_object("HITBOX_QUALITY_MAIN", bm_hitbox, None, root)
    
    extras = {
        "unit_id": "QUALITY_RELIABILITY_HQ",
        "unit_key": "UNIT_12",
        "level": 0,
        "tier": "empty_plot",
        "building_name": "Quality & Reliability Assurance (Survey & Seismic Groundworks)",
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

def add_base_quality_l1(root):
    # 1. Foundation Plinth (24m x 24m)
    bm_plinth = bmesh.new()
    bmesh_box(bm_plinth, (24.0, 24.0, 0.35), (0.0, 0.0, -0.175))
    bmesh_tube(bm_plinth, 11.2, 10.8, 0.36, (0.0, 0.0, 0.0), segments=32)
    create_mesh_object("GEO_Quality_Foundation_Plinth", bm_plinth, mat_travertine_concrete(), root, 0.04)
    
    # 2. Main Metrology & Inspection Lab Shell (16m x 14m x 7.2m)
    bm_lab = bmesh.new()
    bmesh_box(bm_lab, (16.0, 14.0, 7.2), (-1.0, -2.0, 3.6))
    for px in range(-8, 8, 2):
        bmesh_box(bm_lab, (0.25, 0.35, 7.0), (-1.0 + float(px), -9.1, 3.6))
    for py in range(-6, 6, 2):
        bmesh_box(bm_lab, (0.35, 0.25, 7.0), (-9.1, -2.0 + float(py), 3.6))
    bmesh_box(bm_lab, (16.5, 14.5, 0.35), (-1.0, -2.0, 7.35))
    create_mesh_object("GEO_Quality_Metrology_Lab_Shell", bm_lab, mat_travertine_concrete(), root, 0.05)
    
    # 3. Lavender Brick Facade Panels (1970s Brutalist Accent Bands)
    bm_brick = bmesh.new()
    bmesh_box(bm_brick, (15.6, 0.25, 3.2), (-1.0, -9.05, 4.0))
    bmesh_box(bm_brick, (0.25, 13.6, 3.2), (-8.95, -2.0, 4.0))
    bmesh_box(bm_brick, (18.0, 6.0, 5.6), (0.0, 7.0, 2.8))
    bmesh_box(bm_brick, (18.4, 6.4, 0.30), (0.0, 7.0, 5.75))
    create_mesh_object("GEO_Quality_Lavender_Brick_Panels", bm_brick, mat_lavender_brick_1970(), root, 0.04)
    
    # 4. Coral Structural Steel I-Beams & Entrance Canopy
    bm_coral = bmesh.new()
    bmesh_ibeam(bm_coral, 6.2, 0.35, 0.25, 0.03, 0.02, (-2.5, 10.15, 3.1), axis='Z')
    bmesh_ibeam(bm_coral, 6.2, 0.35, 0.25, 0.03, 0.02, (2.5, 10.15, 3.1), axis='Z')
    bmesh_ibeam(bm_coral, 5.0, 0.35, 0.25, 0.03, 0.02, (0.0, 10.15, 6.0), axis='X')
    bmesh_box(bm_coral, (5.4, 2.8, 0.25), (0.0, 11.2, 3.2))
    create_mesh_object("GEO_Quality_Coral_Structural_Beams", bm_coral, mat_coral_structural_beam(), root)
    
    # 5. Office Windows & Entrance Glazing (Tinted Acrylic)
    bm_glass = bmesh.new()
    bmesh_box(bm_glass, (15.4, 0.15, 1.8), (0.0, 10.05, 4.2))
    bmesh_box(bm_glass, (3.2, 0.15, 2.6), (0.0, 10.05, 1.4))
    bmesh_box(bm_glass, (14.0, 0.15, 1.2), (-1.0, -8.95, 6.0))
    create_mesh_object("GEO_Quality_Office_Glazing", bm_glass, mat_tinted_acrylic_window(), root)
    
    # 6. Brushed Aluminum Window Mullion Grid & Door Trim
    bm_mull = bmesh.new()
    for xm in [-6.5, -4.5, -2.5, -0.5, 1.5, 3.5, 5.5]:
        bmesh_box(bm_mull, (0.12, 0.25, 1.9), (xm, 10.1, 4.2))
    for xm in [-6.0, -4.0, -2.0, 0.0, 2.0, 4.0]:
        bmesh_box(bm_mull, (0.12, 0.25, 1.3), (-1.0 + xm, -8.95, 6.0))
    create_mesh_object("GEO_Quality_Aluminum_Mullions", bm_mull, mat_brushed_aluminum(), root)
    
    # 7. Interior Precision Granite Surface Plates & Optical Comparators
    bm_granite = bmesh.new()
    bmesh_granite_surface_plate(bm_granite, (-5.5, -4.0, 0.0), size=(3.2, 2.0, 0.45))
    bmesh_granite_surface_plate(bm_granite, (2.5, -4.0, 0.0), size=(3.2, 2.0, 0.45))
    for gx in [-6.2, -4.8, 1.8, 3.2]:
        bmesh_cylinder(bm_granite, 0.045, 1.2, (gx, -4.0, 1.45), segments=16)
        bmesh_cylinder(bm_granite, 0.12, 0.04, (gx, -4.0, 0.87), segments=16)
    bmesh_optical_comparator(bm_granite, (-1.5, 0.5, 0.0))
    # 4 technical drafting tables with blueprint rollers
    for dx in [-5.0, -2.0, 1.0, 4.0]:
        bmesh_box(bm_granite, (1.6, 1.1, 0.08), (dx, 6.8, 1.15))
        bmesh_cylinder(bm_granite, 0.04, 0.95, (dx - 0.65, 6.8, 0.55), segments=12)
        bmesh_cylinder(bm_granite, 0.04, 0.95, (dx + 0.65, 6.8, 0.55), segments=12)
        bmesh_box(bm_granite, (1.4, 0.9, 0.02), (dx, 6.8, 1.20)) # Blueprint sheet
    create_mesh_object("GEO_Quality_Granite_Inspection_Plates", bm_granite, mat_cast_iron_dark(), root)
    
    # 8. Rooftop HVAC Climate & Temperature Control Air Handlers (High-density fins: 50 fins x 2 units)
    bm_hvac = bmesh.new()
    for hx in [-5.0, 2.5]:
        bmesh_box(bm_hvac, (3.2, 2.2, 1.6), (hx, -2.0, 8.2))
        bmesh_cylinder(bm_hvac, 0.65, 0.25, (hx - 0.8, -2.0, 9.1), segments=20)
        bmesh_cylinder(bm_hvac, 0.65, 0.25, (hx + 0.8, -2.0, 9.1), segments=20)
        bmesh_box(bm_hvac, (0.6, 2.8, 0.6), (hx, -4.0, 7.8))
        for fi in range(50):
            bmesh_box(bm_hvac, (3.15, 0.02, 1.3), (hx, -3.05 + fi * 0.042, 8.2))
    create_mesh_object("GEO_Quality_HVAC_Climate_Units", bm_hvac, mat_corrugated_industrial_steel(), root)
    
    # 9. Gauge Calibration Tooling & Nitrogen Manifold Racks
    bm_tools = bmesh.new()
    for bx in range(-7, 7, 2):
        bmesh_box(bm_tools, (0.55, 0.35, 0.25), (float(bx), -6.5, 0.55))
        bmesh_cylinder(bm_tools, 0.02, 0.35, (float(bx), -6.5, 0.70), segments=12, rot_x=math.radians(90.0))
        for gi in range(12):
            bmesh_box(bm_tools, (0.035, 0.08, 0.06 + gi * 0.015), (float(bx) - 0.22 + gi * 0.038, -6.5, 0.72))
    for i in range(20):
        cy = -7.0 + i * 0.36
        bmesh_cylinder(bm_tools, 0.12, 1.65, (7.15, cy, 0.85), segments=18)
        bmesh_cylinder(bm_tools, 0.04, 0.15, (7.15, cy, 1.72), segments=14)
        bmesh_cylinder(bm_tools, 0.02, 0.08, (7.05, cy, 1.76), segments=10, rot_y=math.radians(90.0))
    create_mesh_object("GEO_Quality_Calibration_Tooling", bm_tools, mat_safety_yellow(), root)
    
    # Semantic Hitboxes
    bm_hitbox = bmesh.new()
    bmesh_box(bm_hitbox, (22.0, 22.0, 8.5), (0.0, 0.0, 4.25))
    create_mesh_object("HITBOX_QUALITY_MAIN", bm_hitbox, None, root)
    
    bm_lab_hb = bmesh.new()
    bmesh_box(bm_lab_hb, (18.0, 16.0, 8.5), (-1.0, -2.0, 4.25))
    create_mesh_object("HITBOX_QUALITY_LAB", bm_lab_hb, None, root)

def build_quality_l1(export_path: str):
    reset_scene()
    root = bpy.data.objects.new("UNIT_12_QUALITY_HQ_L1", None)
    bpy.context.collection.objects.link(root)
    add_base_quality_l1(root)
    
    extras = {
        "unit_id": "QUALITY_RELIABILITY_HQ",
        "unit_key": "UNIT_12",
        "level": 1,
        "tier": "office",
        "building_name": "Quality & Reliability HQ (Precision Metrology Lab)",
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

def add_quality_l2_geometry(root):
    # LEVEL 2: CMM Climate Clean Room & Air Shower Lock (1975-1980)
    # 1. Cleanroom Annex Wing on East Flank (6.0m x 14.0m x 7.5m)
    bm_cmm_wing = bmesh.new()
    bmesh_box(bm_cmm_wing, (6.0, 14.0, 7.5), (9.0, -2.0, 3.75))
    bmesh_box(bm_cmm_wing, (3.2, 2.8, 3.5), (9.0, 5.5, 1.75))
    bmesh_box(bm_cmm_wing, (6.4, 14.4, 0.35), (9.0, -2.0, 7.65))
    create_mesh_object("GEO_Quality_CMM_Cleanroom_Shell", bm_cmm_wing, mat_travertine_concrete(), root, 0.04)
    
    # 2. Cleanroom Glazed Inspection Observation Gallery
    bm_cmm_glass = bmesh.new()
    bmesh_box(bm_cmm_glass, (0.15, 10.0, 3.2), (12.05, -2.0, 4.2))
    bmesh_box(bm_cmm_glass, (0.15, 2.2, 2.4), (10.65, 5.5, 1.5))
    create_mesh_object("GEO_Quality_CMM_Observation_Glass", bm_cmm_glass, mat_tinted_acrylic_window(), root)
    
    # 3. Cleanroom Observation Aluminum Mullions
    bm_cmm_mull = bmesh.new()
    for my in range(-6, 6, 2):
        bmesh_box(bm_cmm_mull, (0.25, 0.12, 3.3), (12.1, -2.0 + float(my), 4.2))
    create_mesh_object("GEO_Quality_CMM_Mullions", bm_cmm_mull, mat_brushed_aluminum(), root)
    
    # 4. High-Precision CNC Bridge-Type CMM Machine inside Cleanroom
    bm_bridge_cmm = bmesh.new()
    bmesh_bridge_cmm(bm_bridge_cmm, (8.5, -2.0, 0.0))
    # 6-port Renishaw MRS modular probe changing rack
    for ri in range(6):
        bmesh_box(bm_bridge_cmm, (0.12, 0.12, 0.08), (7.4, -3.2 + ri * 0.35, 1.25))
        bmesh_cylinder(bm_bridge_cmm, 0.015, 0.16, (7.4, -3.2 + ri * 0.35, 1.15), segments=12)
    # Perforated aluminum cleanroom floor tile grid
    for tx in range(6, 12):
        for ty in range(-7, 4):
            bmesh_box(bm_bridge_cmm, (0.90, 0.90, 0.02), (float(tx) + 0.5, float(ty) + 0.5, 0.01))
    create_mesh_object("GEO_Quality_Bridge_CMM_Machine", bm_bridge_cmm, mat_brushed_aluminum(), root)
    
    # 5. Cleanroom Ceiling Fan Filter Units (FFUs) (4 units x 8 diffusers = 32 diffusers)
    bm_ffu = bmesh.new()
    for fy in [-6.0, -3.0, 0.0, 3.0]:
        bmesh_box(bm_ffu, (4.5, 1.8, 0.45), (9.0, fy, 7.1))
        for fx in [-1.6, -1.1, -0.6, -0.1, 0.4, 0.9, 1.4, 1.9]:
            bmesh_cylinder(bm_ffu, 0.18, 0.08, (8.7 + fx, fy, 6.85), segments=18)
    create_mesh_object("GEO_Quality_Cleanroom_FFU_Array", bm_ffu, mat_corrugated_industrial_steel(), root)
    
    # 6. Air Shower Decontamination Chamber Nozzles & Pressure Gauges
    bm_shower = bmesh.new()
    for ni in range(24):
        nz = 0.4 + ni * 0.12
        bmesh_cylinder(bm_shower, 0.04, 0.12, (7.6, 5.5, nz), segments=14, rot_y=math.radians(90.0))
        bmesh_cylinder(bm_shower, 0.04, 0.12, (10.4, 5.5, nz), segments=14, rot_y=math.radians(90.0))
    create_mesh_object("GEO_Quality_Air_Shower_Nozzles", bm_shower, mat_coral_structural_beam(), root)

def build_quality_l2(export_path: str):
    reset_scene()
    root = bpy.data.objects.new("UNIT_12_QUALITY_HQ_L2", None)
    bpy.context.collection.objects.link(root)
    add_base_quality_l1(root)
    add_quality_l2_geometry(root)
    
    extras = {
        "unit_id": "QUALITY_RELIABILITY_HQ",
        "unit_key": "UNIT_12",
        "level": 2,
        "tier": "department",
        "building_name": "Quality HQ (CMM Coordinate Measuring Clean Room)",
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

def add_quality_l3_geometry(root):
    # LEVEL 3: Accelerated Environmental Weathering Wing (1980-1990)
    # 1. Environmental Testing Bay Extension on South Flank (16.0m x 5.0m x 6.8m)
    bm_weather = bmesh.new()
    bmesh_box(bm_weather, (16.0, 5.0, 6.8), (-1.0, -10.5, 3.4))
    bmesh_box(bm_weather, (16.4, 5.4, 0.35), (-1.0, -10.5, 6.95))
    bmesh_box(bm_weather, (4.5, 0.25, 4.8), (-1.0, -13.05, 2.4))
    create_mesh_object("GEO_Quality_Weathering_Bay_Shell", bm_weather, mat_travertine_concrete(), root, 0.04)
    
    # 2. Corrugated Industrial Steel Roll-up Door Panels (36 slat segments)
    bm_shutter = bmesh.new()
    for sl in range(36):
        bmesh_box(bm_shutter, (4.4, 0.08, 0.12), (-1.0, -13.12, 0.10 + sl * 0.13))
    create_mesh_object("GEO_Quality_Service_Rollup_Door", bm_shutter, mat_corrugated_industrial_steel(), root)
    
    # 3. Accelerated Salt-Spray Corrosion Test Chambers (3 Cabinets)
    bm_chambers = bmesh.new()
    for cx in [-5.5, -1.0, 3.5]:
        bmesh_salt_spray_chamber(bm_chambers, (cx, -10.5, 0.0))
        for pi in range(24):
            bmesh_box(bm_chambers, (0.015, 0.18, 0.28), (cx - 0.75 + pi * 0.065, -10.5, 0.95))
    create_mesh_object("GEO_Quality_SaltFog_Chambers", bm_chambers, mat_brushed_aluminum(), root)
    
    # 4. Walk-In Climatic Thermal Shock Chamber (-40°C to +120°C)
    bm_shock = bmesh.new()
    bmesh_box(bm_shock, (3.8, 3.2, 3.5), (-6.0, -10.5, 1.75))
    bmesh_box(bm_shock, (1.4, 0.25, 2.5), (-6.0, -8.8, 1.6))
    bmesh_box(bm_shock, (0.6, 0.30, 0.6), (-6.0, -8.8, 1.8))
    bmesh_cylinder(bm_shock, 0.035, 0.45, (-5.2, -8.7, 1.6), segments=12)
    for si in range(6):
        bmesh_box(bm_shock, (1.8, 1.2, 0.04), (-6.0, -10.5, 0.4 + si * 0.45))
        for ti in range(8):
            bmesh_cylinder(bm_shock, 0.04, 0.15, (-6.6 + (ti % 4) * 0.4, -10.8 + (ti // 4) * 0.6, 0.5 + si * 0.45), segments=12)
    create_mesh_object("GEO_Quality_Thermal_Shock_Chamber", bm_shock, mat_corrugated_industrial_steel(), root)
    
    # 5. Rooftop Cascade Cooling Chillers & LN2 Exhaust Piping (Dense fins: 40 fins x 3 chillers)
    bm_chillers = bmesh.new()
    for hx in [-5.5, -1.0, 3.5]:
        bmesh_box(bm_chillers, (2.4, 1.8, 1.4), (hx, -10.5, 7.8))
        bmesh_cylinder(bm_chillers, 0.55, 0.25, (hx, -10.5, 8.6), segments=20)
        bmesh_cylinder(bm_chillers, 0.12, 2.4, (hx + 0.9, -10.5, 8.8), segments=16)
        for fi in range(40):
            bmesh_box(bm_chillers, (2.35, 0.02, 1.2), (hx, -11.35 + fi * 0.044, 7.8))
    create_mesh_object("GEO_Quality_Chiller_Exhaust_Array", bm_chillers, mat_coral_structural_beam(), root)

def build_quality_l3(export_path: str):
    reset_scene()
    root = bpy.data.objects.new("UNIT_12_QUALITY_HQ_L3", None)
    bpy.context.collection.objects.link(root)
    add_base_quality_l1(root)
    add_quality_l2_geometry(root)
    add_quality_l3_geometry(root)
    
    extras = {
        "unit_id": "QUALITY_RELIABILITY_HQ",
        "unit_key": "UNIT_12",
        "level": 3,
        "tier": "center",
        "building_name": "Quality HQ (Accelerated Environmental Aging Wing)",
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

def add_quality_l4_geometry(root):
    # LEVEL 4: Non-Destructive Testing (NDT) X-Ray & CT Vault (1995-2000)
    # 1. Heavy Radiation-Shielded Concrete Vault Shell (18.0m x 16.0m x 10.2m)
    bm_ndt_vault = bmesh.new()
    bmesh_box(bm_ndt_vault, (18.0, 16.0, 10.2), (-1.0, -2.0, 5.1))
    bmesh_box(bm_ndt_vault, (18.5, 16.5, 0.40), (-1.0, -2.0, 10.4))
    bmesh_box(bm_ndt_vault, (6.0, 3.2, 5.5), (-1.0, 6.8, 2.75))
    create_mesh_object("GEO_Quality_NDT_Vault_Shell", bm_ndt_vault, mat_travertine_concrete(), root, 0.05)
    
    # 2. Motorized Heavy Lead-Shielded Radiation Sliding Blast Door
    bm_blast_door = bmesh.new()
    bmesh_box(bm_blast_door, (4.2, 0.45, 4.8), (-1.0, 7.8, 2.4))
    bmesh_box(bm_blast_door, (6.5, 0.35, 0.30), (-1.0, 7.8, 5.0))
    for wx in [-2.4, -0.8, 0.8, 2.4]:
        bmesh_cylinder(bm_blast_door, 0.14, 0.25, (wx, 7.8, 4.8), segments=18, rot_y=math.radians(90.0))
        bmesh_cylinder(bm_blast_door, 0.14, 0.25, (wx, 7.8, 0.1), segments=18, rot_y=math.radians(90.0))
    bmesh_cylinder(bm_blast_door, 0.12, 0.25, (-3.4, 7.8, 4.5), segments=16)
    create_mesh_object("GEO_Quality_Lead_Blast_Door", bm_blast_door, mat_coral_structural_beam(), root)
    
    # 3. 450kV Industrial Computed Tomography (CT) 3D X-Ray Gantry Scanner
    bm_ct_gantry = bmesh.new()
    bmesh_ct_xray_gantry(bm_ct_gantry, (-2.5, -2.0, 0.0))
    # High-voltage cable drag chain (45 links)
    for li in range(45):
        bmesh_box(bm_ct_gantry, (0.12, 0.16, 0.10), (-4.5, -3.8 + li * 0.16, 0.4))
    create_mesh_object("GEO_Quality_Computed_Tomography_Scanner", bm_ct_gantry, mat_brushed_aluminum(), root)
    
    # 4. Phased-Array Ultrasonic Immersion Inspection Tank (PAUT)
    bm_paut = bmesh.new()
    bmesh_box(bm_paut, (3.2, 2.2, 1.2), (3.8, -2.0, 0.60))
    bmesh_box(bm_paut, (2.9, 1.9, 1.0), (3.8, -2.0, 0.70))
    bmesh_box(bm_paut, (3.4, 0.12, 0.15), (3.8, -3.1, 1.5))
    bmesh_box(bm_paut, (3.4, 0.12, 0.15), (3.8, -0.9, 1.5))
    bmesh_box(bm_paut, (0.15, 2.4, 0.18), (3.8, -2.0, 1.6))
    bmesh_cylinder(bm_paut, 0.04, 0.75, (3.8, -2.0, 1.15), segments=16)
    for ei in range(32):
        bmesh_box(bm_paut, (0.012, 0.08, 0.04), (3.6 + ei * 0.012, -2.0, 0.78))
    # Turbine blade immersion test sample
    bmesh_box(bm_paut, (0.25, 0.85, 0.45), (3.8, -2.0, 0.75))
    create_mesh_object("GEO_Quality_Ultrasonic_Immersion_Tank", bm_paut, mat_corrugated_industrial_steel(), root)
    
    # 5. Lead-Glass Radiation Control Operator Booth
    bm_booth = bmesh.new()
    bmesh_box(bm_booth, (3.5, 2.4, 3.2), (-1.0, 3.2, 1.6))
    bmesh_box(bm_booth, (2.6, 0.20, 1.4), (-1.0, 1.9, 1.8))
    for oi in [-0.75, 0.75]:
        bmesh_box(bm_booth, (0.85, 0.65, 0.75), (-1.0 + oi, 2.6, 0.375))
        bmesh_box(bm_booth, (0.55, 0.06, 0.38), (-1.0 + oi, 2.2, 0.95))
        bmesh_cylinder(bm_booth, 0.03, 0.20, (-1.0 + oi, 2.2, 0.85), segments=14)
    # High-voltage power generator cabinets (4 racks with heat sink fins)
    for gi in range(4):
        bmesh_box(bm_booth, (0.65, 0.85, 2.2), (-4.5, 1.5 + gi * 0.9, 1.1))
        for fi in range(16):
            bmesh_box(bm_booth, (0.60, 0.02, 1.8), (-4.5, 1.1 + gi * 0.9 + fi * 0.05, 1.1))
    create_mesh_object("GEO_Quality_LeadGlass_Control_Booth", bm_booth, mat_modern_curtain_glass(), root)

def build_quality_l4(export_path: str):
    reset_scene()
    root = bpy.data.objects.new("UNIT_12_QUALITY_HQ_L4", None)
    bpy.context.collection.objects.link(root)
    add_base_quality_l1(root)
    add_quality_l2_geometry(root)
    add_quality_l3_geometry(root)
    add_quality_l4_geometry(root)
    
    extras = {
        "unit_id": "QUALITY_RELIABILITY_HQ",
        "unit_key": "UNIT_12",
        "level": 4,
        "tier": "advanced_hq",
        "building_name": "Quality HQ (Non-Destructive Testing X-Ray CT Vault)",
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

def add_quality_l5_geometry(root):
    # LEVEL 5: 3D Optical Blue-Light Metrology Dome (2005-2010)
    # 1. Rooftop 3D Optical Metrology Dome Pavilion (Radius 5.5m, Height 4.2m on roof Z = 10.4m)
    bm_dome = bmesh.new()
    bmesh_cylinder(bm_dome, 5.5, 4.2, (-1.0, -2.0, 12.5), segments=40)
    bmesh_tube(bm_dome, 5.8, 5.3, 0.40, (-1.0, -2.0, 14.7), segments=40)
    create_mesh_object("GEO_Quality_3D_Metrology_Dome_Shell", bm_dome, mat_satin_matte_white(), root, 0.05)
    
    # 2. Panoramic Optical Viewing Glass Ribbon around Dome
    bm_dome_glass = bmesh.new()
    bmesh_tube(bm_dome_glass, 5.55, 5.45, 1.8, (-1.0, -2.0, 12.5), segments=40)
    create_mesh_object("GEO_Quality_Dome_Curtain_Glass", bm_dome_glass, mat_modern_curtain_glass(), root)
    
    # 3. Glowing Blue-Light Laser Scanning Emissive Rings
    bm_rings = bmesh.new()
    bmesh_tube(bm_rings, 5.65, 5.50, 0.15, (-1.0, -2.0, 13.5), segments=40)
    bmesh_tube(bm_rings, 5.65, 5.50, 0.15, (-1.0, -2.0, 11.5), segments=40)
    bmesh_tube(bm_rings, 3.8, 3.5, 0.12, (-1.0, -2.0, 14.2), segments=36)
    for bi in range(36):
        theta = bi * 2 * math.pi / 36
        bx = -1.0 + 3.65 * math.cos(theta)
        by = -2.0 + 3.65 * math.sin(theta)
        bmesh_cylinder(bm_rings, 0.02, 3.2, (bx, by, 12.6), segments=10)
    create_mesh_object("GEO_Quality_BlueLight_Scan_Rings", bm_rings, mat_cryo_cyan_emissive(), root)
    
    # 4. Dual 6-Axis Industrial Robotic Optical 3D Scanning Arms
    bm_robots = bmesh.new()
    bmesh_robotic_scanning_arm(bm_robots, (-3.2, -2.0, 10.4), yaw=math.radians(35.0))
    bmesh_robotic_scanning_arm(bm_robots, (1.2, -2.0, 10.4), yaw=math.radians(-145.0))
    create_mesh_object("GEO_Quality_Robotic_Scanning_Arms", bm_robots, mat_safety_yellow(), root)
    
    # 5. Central 360° Motorized Vehicle Turntable with Styling Clay Vehicle Buck
    bm_turntable = bmesh.new()
    bmesh_cylinder(bm_turntable, 2.4, 0.18, (-1.0, -2.0, 10.49), segments=36)
    bmesh_tube(bm_turntable, 3.2, 3.0, 0.08, (-1.0, -2.0, 12.2), segments=36)
    # Full automotive styling clay car body buck on turntable (undergoing active 3D scanning)
    bmesh_box(bm_turntable, (1.9, 4.4, 0.75), (-1.0, -2.0, 11.0)) # Lower body
    bmesh_box(bm_turntable, (1.5, 2.2, 0.65), (-1.0, -1.8, 11.65)) # Greenhouse cabin
    bmesh_box(bm_turntable, (1.8, 0.8, 0.45), (-1.0, -3.6, 10.9)) # Front nose
    bmesh_box(bm_turntable, (1.8, 0.8, 0.55), (-1.0, -0.2, 11.0)) # Rear decklid
    # 4 sculpted wheel arches
    for wx, wy in [(-0.95, -3.2), (0.95, -3.2), (-0.95, -0.6), (0.95, -0.6)]:
        bmesh_tube(bm_turntable, 0.42, 0.34, 0.12, (-1.0 + wx, wy, 10.8), segments=18, rot_y=math.radians(90.0))
    # 48 Photogrammetry reference target spheres around perimeter arch
    for ti in range(48):
        theta = ti * 2 * math.pi / 48
        tx = -1.0 + 3.1 * math.cos(theta)
        ty = -2.0 + 3.1 * math.sin(theta)
        bmesh_cylinder(bm_turntable, 0.035, 0.07, (tx, ty, 12.2), segments=12)
    create_mesh_object("GEO_Quality_Vehicle_Turntable_Stage", bm_turntable, mat_brushed_aluminum(), root)
    
    # Semantic Hitboxes
    bm_dome_hb = bmesh.new()
    bmesh_box(bm_dome_hb, (12.0, 12.0, 5.5), (-1.0, -2.0, 13.0))
    create_mesh_object("HITBOX_QUALITY_DOME", bm_dome_hb, None, root)

def build_quality_l5(export_path: str):
    reset_scene()
    root = bpy.data.objects.new("UNIT_12_QUALITY_HQ_L5", None)
    bpy.context.collection.objects.link(root)
    add_base_quality_l1(root)
    add_quality_l2_geometry(root)
    add_quality_l3_geometry(root)
    add_quality_l4_geometry(root)
    add_quality_l5_geometry(root)
    
    extras = {
        "unit_id": "QUALITY_RELIABILITY_HQ",
        "unit_key": "UNIT_12",
        "level": 5,
        "tier": "world_class_hq",
        "building_name": "Quality HQ (3D Optical Blue-Light Metrology Dome)",
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

def add_quality_l6_geometry(root):
    # LEVEL 6: Forensic Vehicle Teardown & Metallurgy Failure Lab (2015-2020)
    # 1. Multi-Bay Vehicle Teardown Cleanroom Wing on West Flank (7.0m x 16.0m x 8.5m)
    bm_forensic_shell = bmesh.new()
    bmesh_box(bm_forensic_shell, (7.0, 16.0, 8.5), (-8.5, -2.0, 4.25))
    bmesh_box(bm_forensic_shell, (7.4, 16.4, 0.35), (-8.5, -2.0, 8.65))
    bmesh_box(bm_forensic_shell, (0.15, 12.0, 6.5), (-12.05, -2.0, 4.5))
    create_mesh_object("GEO_Quality_Forensic_Teardown_Shell", bm_forensic_shell, mat_travertine_concrete(), root, 0.05)
    
    # 2. Modern Curtain Glass Facade for Teardown Atrium
    bm_fg_glass = bmesh.new()
    bmesh_box(bm_fg_glass, (0.18, 12.0, 6.5), (-12.1, -2.0, 4.5))
    create_mesh_object("GEO_Quality_Forensic_Curtain_Glass", bm_fg_glass, mat_modern_curtain_glass(), root)
    
    # 3. In-Ground Electro-Hydraulic Scissor Lift with Complete Disassembled Vehicle Chassis
    bm_lift = bmesh.new()
    bmesh_box(bm_lift, (0.65, 4.8, 0.12), (-9.2, -2.0, 1.8))
    bmesh_box(bm_lift, (0.65, 4.8, 0.12), (-7.8, -2.0, 1.8))
    for sy in [-1.4, 1.4]:
        bmesh_box(bm_lift, (0.08, 1.8, 0.10), (-9.2, sy - 2.0, 0.95))
        bmesh_box(bm_lift, (0.08, 1.8, 0.10), (-7.8, sy - 2.0, 0.95))
        bmesh_cylinder(bm_lift, 0.08, 1.2, (-8.5, sy - 2.0, 0.95), segments=18, rot_x=math.radians(45.0))
    # Full tubular vehicle rolling chassis subframe on lift
    for rx in [-9.0, -8.0]:
        bmesh_box(bm_lift, (0.08, 4.2, 0.12), (rx, -2.0, 2.0))
    for ry in [-3.8, -2.6, -1.4, -0.2]:
        bmesh_box(bm_lift, (1.1, 0.08, 0.10), (-8.5, ry, 2.0))
    # 4 Detailed vehicle wheels with brake discs and calipers undergoing forensic teardown
    wheel_coords = [(-9.4, -3.6, 2.0), (-7.6, -3.6, 2.0), (-9.4, -0.4, 2.0), (-7.6, -0.4, 2.0)]
    for wx, wy, wz in wheel_coords:
        bmesh_cylinder(bm_lift, 0.36, 0.22, (wx, wy, wz), segments=24, rot_y=math.radians(90.0))
        bmesh_tube(bm_lift, 0.26, 0.18, 0.24, (wx, wy, wz), segments=24, rot_y=math.radians(90.0))
        bmesh_cylinder(bm_lift, 0.18, 0.03, (wx, wy, wz), segments=20, rot_y=math.radians(90.0))
        bmesh_box(bm_lift, (0.06, 0.10, 0.14), (wx, wy + 0.12, wz + 0.08))
    # Double wishbone suspension arms & shock absorbers
    for fa_x in [-9.2, -7.8]:
        bmesh_cylinder(bm_lift, 0.025, 0.45, (fa_x, -3.6, 2.15), segments=14, rot_y=math.radians(45.0))
        bmesh_cylinder(bm_lift, 0.04, 0.35, (fa_x, -3.6, 2.25), segments=16)
        bmesh_cylinder(bm_lift, 0.025, 0.45, (fa_x, -0.4, 2.15), segments=14, rot_y=math.radians(45.0))
        bmesh_cylinder(bm_lift, 0.04, 0.35, (fa_x, -0.4, 2.25), segments=16)
    # Dual exhaust pipes, mufflers, and catalytic converters
    for ex_x in [-8.7, -8.3]:
        bmesh_cylinder(bm_lift, 0.035, 3.4, (ex_x, -2.0, 1.90), segments=16, rot_x=math.radians(90.0))
        bmesh_cylinder(bm_lift, 0.10, 0.65, (ex_x, -3.2, 1.90), segments=18, rot_x=math.radians(90.0)) # Catalytic converter
        bmesh_cylinder(bm_lift, 0.12, 0.85, (ex_x, -0.8, 1.90), segments=18, rot_x=math.radians(90.0)) # Muffler
        bmesh_tube(bm_lift, 0.045, 0.035, 0.25, (ex_x, -0.2, 1.90), segments=16, rot_x=math.radians(90.0)) # Polished tip
    # Longitudinal driveshaft and rear differential pumpkin
    bmesh_cylinder(bm_lift, 0.045, 2.8, (-8.5, -1.8, 1.95), segments=18, rot_x=math.radians(90.0))
    bmesh_cylinder(bm_lift, 0.22, 0.32, (-8.5, -0.4, 1.95), segments=20) # Differential pumpkin
    # Front steering rack and tie rods
    bmesh_cylinder(bm_lift, 0.03, 1.2, (-8.5, -3.5, 2.05), segments=16, rot_y=math.radians(90.0))
    bmesh_cylinder(bm_lift, 0.025, 0.8, (-8.7, -3.2, 2.3), segments=12, rot_x=math.radians(-35.0)) # Steering column
    # Overhead 5-ton bridge crane hoist
    bmesh_ibeam(bm_lift, 6.4, 0.35, 0.25, 0.03, 0.02, (-8.5, -2.0, 7.8), axis='X')
    bmesh_box(bm_lift, (0.65, 0.65, 0.45), (-8.5, -2.0, 7.5))
    bmesh_cylinder(bm_lift, 0.06, 0.8, (-8.5, -2.0, 6.9), segments=16)
    # Forensic teardown parts autopsy tables with dissected engine components
    for ti in [-4.5, 0.5]:
        bmesh_box(bm_lift, (1.8, 1.2, 0.85), (-8.5, ti, 0.425))
        bmesh_cylinder(bm_lift, 0.04, 1.4, (-8.5, ti - 0.2, 0.90), segments=18, rot_y=math.radians(90.0))
        for pi in range(8):
            bmesh_cylinder(bm_lift, 0.045, 0.10, (-9.1 + pi * 0.18, ti + 0.25, 0.92), segments=16)
            bmesh_box(bm_lift, (0.02, 0.08, 0.03), (-9.1 + pi * 0.18, ti + 0.15, 0.90))
    # Complete V8 engine block casting on autopsy table (8 bored cylinders)
    bmesh_box(bm_lift, (0.65, 0.95, 0.45), (-8.5, 0.5, 1.10))
    for cyl_i in range(4):
        bmesh_cylinder(bm_lift, 0.08, 0.32, (-8.68, 0.22 + cyl_i * 0.20, 1.18), segments=16, rot_x=math.radians(30.0))
        bmesh_cylinder(bm_lift, 0.08, 0.32, (-8.32, 0.22 + cyl_i * 0.20, 1.18), segments=16, rot_x=math.radians(-30.0))
    # 6-speed manual transmission casing with bellhousing
    bmesh_box(bm_lift, (0.45, 0.85, 0.35), (-8.5, -4.5, 1.05))
    bmesh_tube(bm_lift, 0.24, 0.18, 0.22, (-8.5, -4.95, 1.05), segments=18, rot_x=math.radians(90.0))
    create_mesh_object("GEO_Quality_Hydraulic_Scissor_Lift", bm_lift, mat_safety_yellow(), root)
    
    # 4. Metallurgy & Failure Analysis Lab Equipment (SEM Microscope & Hardness Testers)
    bm_metallurgy = bmesh.new()
    bmesh_sem_electron_microscope(bm_metallurgy, (-8.5, 3.5, 0.0))
    bmesh_box(bm_metallurgy, (1.6, 0.85, 0.85), (-8.5, -5.5, 0.425))
    bmesh_cylinder(bm_metallurgy, 0.22, 0.08, (-8.9, -5.5, 0.89), segments=24)
    bmesh_cylinder(bm_metallurgy, 0.22, 0.08, (-8.1, -5.5, 0.89), segments=24)
    bmesh_box(bm_metallurgy, (0.65, 0.65, 1.2), (-8.5, -7.0, 0.60))
    bmesh_cylinder(bm_metallurgy, 0.06, 0.35, (-8.5, -6.8, 0.95), segments=18)
    bmesh_cylinder(bm_metallurgy, 0.04, 0.25, (-8.5, -6.8, 1.20), segments=16)
    # Inverted metallurgical optical microscope with 4 objective turrets
    bmesh_box(bm_metallurgy, (0.45, 0.45, 0.35), (-8.5, -5.5, 1.05))
    for obj_i in range(4):
        theta = obj_i * math.pi / 2
        bmesh_cylinder(bm_metallurgy, 0.02, 0.08, (-8.5 + 0.08 * math.cos(theta), -5.5 + 0.08 * math.sin(theta), 1.26), segments=12)
    bmesh_box(bm_metallurgy, (0.60, 2.2, 1.1), (-5.6, -2.0, 0.55))
    for di in range(6):
        bmesh_box(bm_metallurgy, (0.04, 2.0, 0.14), (-5.28, -2.0, 0.20 + di * 0.16))
        bmesh_cylinder(bm_metallurgy, 0.015, 0.45, (-5.25, -2.0, 0.20 + di * 0.16), segments=12, rot_x=math.radians(90.0))
    create_mesh_object("GEO_Quality_SEM_Metallurgy_Station", bm_metallurgy, mat_brushed_aluminum(), root)
    
    # 5. Rooftop Photovoltaic Solar Canopy Array (48 panels with angled struts & subframes)
    bm_solar = bmesh.new()
    for sx in [-7.5, 5.5]:
        for sy in [-8.0, 4.0]:
            bmesh_cylinder(bm_solar, 0.08, 2.5, (sx, sy, 11.65), segments=18)
    bmesh_box(bm_solar, (16.2, 14.2, 0.15), (-1.0, -2.0, 13.0))
    for row in range(8):
        for col in range(6):
            bmesh_box(bm_solar, (2.2, 1.5, 0.04), (-6.5 + col * 2.2, -7.2 + row * 1.6, 13.1))
            bmesh_box(bm_solar, (2.22, 0.04, 0.06), (-6.5 + col * 2.2, -7.2 + row * 1.6, 13.06)) # Rail frame
    create_mesh_object("GEO_Quality_Solar_Canopy", bm_solar, mat_modern_curtain_glass(), root)

def build_quality_l6(export_path: str):
    reset_scene()
    root = bpy.data.objects.new("UNIT_12_QUALITY_HQ_L6", None)
    bpy.context.collection.objects.link(root)
    add_base_quality_l1(root)
    add_quality_l2_geometry(root)
    add_quality_l3_geometry(root)
    add_quality_l4_geometry(root)
    add_quality_l5_geometry(root)
    add_quality_l6_geometry(root)
    
    extras = {
        "unit_id": "QUALITY_RELIABILITY_HQ",
        "unit_key": "UNIT_12",
        "level": 6,
        "tier": "innovation_campus",
        "building_name": "Quality HQ (Forensic Vehicle Teardown & Metallurgy)",
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

def add_quality_l7_geometry(root):
    # LEVEL 7: Zero-Defect AI Metrology Center & Floating Glass Cube (2025+ Hypermodern)
    # 1. Soaring Central AI Metrology Spire Tower (Rising to 22.0m on Northeast Corner)
    bm_spire = bmesh.new()
    bmesh_box(bm_spire, (7.0, 7.0, 22.0), (7.5, 6.5, 11.0))
    bmesh_pyramid(bm_spire, (6.8, 6.8), 3.5, (7.5, 6.5, 22.0))
    bmesh_cylinder(bm_spire, 0.08, 4.5, (7.5, 6.5, 25.5), segments=20)
    bmesh_cylinder(bm_spire, 0.15, 0.25, (7.5, 6.5, 27.5), segments=20)
    for bi in range(36):
        theta = bi * 2 * math.pi / 36
        bx = 7.5 + 3.2 * math.cos(theta)
        by = 6.5 + 3.2 * math.sin(theta)
        bmesh_cylinder(bm_spire, 0.025, 1.1, (bx, by, 22.55), segments=12)
    bmesh_tube(bm_spire, 3.25, 3.15, 0.06, (7.5, 6.5, 23.1), segments=36)
    create_mesh_object("GEO_Quality_AI_Metrology_Tower_Shell", bm_spire, mat_travertine_concrete(), root, 0.05)
    
    # 2. Spire Tower Double-Skin Curtain Glass & Vertical Aero Fins (64 fins)
    bm_spire_glass = bmesh.new()
    bmesh_box(bm_spire_glass, (6.8, 6.8, 19.5), (7.5, 6.5, 12.0))
    for i in range(32):
        fx = 3.8 + i * 0.23
        bmesh_box(bm_spire_glass, (0.04, 0.45, 18.0), (fx, 10.15, 12.0))
        bmesh_box(bm_spire_glass, (0.04, 0.45, 18.0), (fx, 2.85, 12.0))
    create_mesh_object("GEO_Quality_Tower_Curtain_Glass", bm_spire_glass, mat_modern_curtain_glass(), root)
    
    # 3. Cantilevered Floating Glass Cube Nanometer Inspection Laboratory
    bm_cube = bmesh.new()
    bmesh_box(bm_cube, (8.5, 8.5, 5.0), (-2.0, -2.0, 15.5))
    bmesh_ibeam(bm_cube, 9.5, 0.45, 0.35, 0.04, 0.02, (2.8, 2.2, 14.5), axis='Y')
    bmesh_ibeam(bm_cube, 9.5, 0.45, 0.35, 0.04, 0.02, (2.8, 2.2, 16.5), axis='Y')
    for ti in range(16):
        bmesh_cylinder(bm_cube, 0.05, 3.2, (-2.0 + (ti % 4) * 1.8, -2.0 + (ti // 4) * 1.8, 15.5), segments=14, rot_x=math.radians(35.0))
        bmesh_cylinder(bm_cube, 0.05, 3.2, (-2.0 + (ti % 4) * 1.8, -2.0 + (ti // 4) * 1.8, 15.5), segments=14, rot_x=math.radians(-35.0))
    bmesh_box(bm_cube, (3.2, 3.2, 0.45), (-2.0, -2.0, 14.2))
    for ob_x in range(-6, 7):
        for ob_y in range(-6, 7):
            bmesh_cylinder(bm_cube, 0.012, 0.04, (-2.0 + ob_x * 0.22, -2.0 + ob_y * 0.22, 14.44), segments=8)
    create_mesh_object("GEO_Quality_Nanometer_Glass_Cube", bm_cube, mat_modern_curtain_glass(), root)
    
    # 4. Multi-Tiered Holographic Zero-Defect Inspection Halo Rings (4 rings + 48 scanlines)
    bm_halo = bmesh.new()
    bmesh_tube(bm_halo, 3.6, 3.3, 0.25, (-2.0, -2.0, 18.5), segments=44)
    bmesh_tube(bm_halo, 2.8, 2.5, 0.20, (-2.0, -2.0, 19.2), segments=40)
    bmesh_tube(bm_halo, 1.9, 1.6, 0.15, (-2.0, -2.0, 19.8), segments=36)
    bmesh_tube(bm_halo, 1.2, 0.9, 0.12, (-2.0, -2.0, 20.3), segments=32)
    for li in range(48):
        theta = li * 2 * math.pi / 48
        lx = -2.0 + 3.2 * math.cos(theta)
        ly = -2.0 + 3.2 * math.sin(theta)
        bmesh_cylinder(bm_halo, 0.022, 4.5, (lx, ly, 16.0), segments=10)
    create_mesh_object("GEO_Quality_Holographic_Defect_Halo", bm_halo, mat_holographic_cyan_glow(), root)
    
    # 5. Automated Guided Vehicle (AGV) Metrology Track & Skybridge (4 AGVs)
    bm_skybridge = bmesh.new()
    bmesh_box(bm_skybridge, (4.5, 1.8, 2.4), (3.0, 1.5, 15.5))
    bmesh_box(bm_skybridge, (1.2, 18.0, 0.12), (7.5, -4.0, 0.06))
    for agv_y in [-8.0, -4.0, 0.0, 4.0]:
        bmesh_box(bm_skybridge, (0.95, 1.6, 0.45), (7.5, agv_y, 0.35))
        for wi in [(-0.45, -0.6), (-0.45, 0.6), (0.45, -0.6), (0.45, 0.6)]:
            bmesh_cylinder(bm_skybridge, 0.12, 0.08, (7.5 + wi[0], agv_y + wi[1], 0.12), segments=18, rot_y=math.radians(90.0))
        bmesh_box(bm_skybridge, (0.75, 1.2, 0.35), (7.5, agv_y, 0.75))
        bmesh_cylinder(bm_skybridge, 0.06, 0.15, (7.5, agv_y + 0.6, 0.65), segments=14)
    create_mesh_object("GEO_Quality_AGV_Skybridge_Track", bm_skybridge, mat_brushed_aluminum(), root)
    
    # Semantic Hitboxes
    bm_tower_hb = bmesh.new()
    bmesh_box(bm_tower_hb, (8.5, 8.5, 24.0), (7.5, 6.5, 12.0))
    create_mesh_object("HITBOX_QUALITY_TOWER", bm_tower_hb, None, root)
    
    bm_cube_hb = bmesh.new()
    bmesh_box(bm_cube_hb, (10.0, 10.0, 6.5), (-2.0, -2.0, 15.5))
    create_mesh_object("HITBOX_QUALITY_CUBE", bm_cube_hb, None, root)

def build_quality_l7(export_path: str):
    reset_scene()
    root = bpy.data.objects.new("UNIT_12_QUALITY_HQ_L7", None)
    bpy.context.collection.objects.link(root)
    add_base_quality_l1(root)
    add_quality_l2_geometry(root)
    add_quality_l3_geometry(root)
    add_quality_l4_geometry(root)
    add_quality_l5_geometry(root)
    add_quality_l6_geometry(root)
    add_quality_l7_geometry(root)
    
    extras = {
        "unit_id": "QUALITY_RELIABILITY_HQ",
        "unit_key": "UNIT_12",
        "level": 7,
        "tier": "hypermodern_campus",
        "building_name": "Quality HQ (Zero-Defect AI Metrology Center)",
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── BATCH GENERATION ORCHESTRATOR ──

def generate_all_quality_levels(output_dir: str = None):
    if output_dir is None:
        output_dir = os.path.join(workspace_root, "public", "models", "campus")
    os.makedirs(output_dir, exist_ok=True)
    
    levels = [
        (0, "hq_12_quality_l0.glb", build_quality_l0),
        (1, "hq_12_quality_l1.glb", build_quality_l1),
        (2, "hq_12_quality_l2.glb", build_quality_l2),
        (3, "hq_12_quality_l3.glb", build_quality_l3),
        (4, "hq_12_quality_l4.glb", build_quality_l4),
        (5, "hq_12_quality_l5.glb", build_quality_l5),
        (6, "hq_12_quality_l6.glb", build_quality_l6),
        (7, "hq_12_quality_l7.glb", build_quality_l7),
    ]
    
    results = {}
    print("=" * 70)
    print(" AUTO TYCOON CAMPUS - UNIT_12 QUALITY & RELIABILITY ASSURANCE")
    print(f" Target Output Directory: {output_dir}")
    print("=" * 70)
    
    all_passed = True
    for lvl, filename, builder_func in levels:
        out_path = os.path.join(output_dir, filename)
        tier_name = CAMPUS_TRIANGLE_BUDGETS[lvl]["tier"]
        print(f"\n>>> Generating UNIT_12 Level {lvl} ({tier_name}) -> {filename}...")
        
        success = builder_func(out_path)
        passed, report = audit_scene("UNIT_12_QUALITY", lvl, bpy)
        print_audit_summary(report)
        
        file_size = os.path.getsize(out_path) if os.path.exists(out_path) else 0
        tris = report["total_triangles"]
        print(f"    Export: {success} | Size: {file_size / 1024:.1f} KB | Triangles: {tris:,}")
        results[lvl] = {"file": filename, "passed": passed, "size_kb": file_size / 1024.0, "triangles": tris, "warnings": report.get("warnings", [])}
        if not passed or len(report.get("warnings", [])) > 0:
            all_passed = False
            
    print("\n" + "=" * 70)
    print(" UNIT_12 QUALITY HQ SUMMARY AUDIT TABLE")
    print("=" * 70)
    print(f"{'Level':<6} | {'Filename':<22} | {'Triangles':<10} | {'Size (KB)':<10} | {'Quality Gate'}")
    print("-" * 70)
    for lvl, data in results.items():
        status = "PASSED [OK]" if data["passed"] and len(data["warnings"]) == 0 else "WARNINGS/FAILED"
        print(f"L{lvl:<5} | {data['file']:<22} | {data['triangles']:<10,} | {data['size_kb']:<10.1f} | {status}")
    print("=" * 70)
    
    return all_passed

if __name__ == "__main__":
    target_dir = os.path.join(workspace_root, "public", "models", "campus")
    if len(sys.argv) > 1 and not sys.argv[-1].endswith(".py"):
        target_dir = sys.argv[-1]
    
    generate_all_quality_levels(target_dir)
