"""
AUTO TYCOON CAMPUS HQ - UNIT_05 CHASSIS & DYNAMICS HQ GENERATOR (PHASES 89-96)

Generates all 8 progression levels (L0-L7) for UNIT_05:
- Footprint: 36m x 36m (Master Plot)
- Architectural Identity: Engineering dynamics & test rig character — 
  4-post & 7-post hydraulic shaker rigs with welded chassis mule and carbon monocoque fixtures,
  overhead crane gantry, hydraulic power annex, Kinematics & Compliance (K&C) test hall,
  high-speed damper dyno lab with anti-roll bar torsion benches, high-inertia brake dyno wing,
  Driver-in-the-Loop (DiL) 6-DOF Stewart platform motion dome, and quantum AI chassis synthesis tower.

Follows the UNIT_01 Proven Production Standard:
- 100% deterministic GEO_* and HITBOX_* naming
- Parameterized BMesh modeling
- Strict triangle budgets (L0: 1k-3k, L1: 8k-12k, L2: 14k-18k, L3: 20k-26k,
  L4: 30k-40k, L5: 40k-55k, L6: 50k-65k, L7: 60k-80k)
- Zero generic names, no raw cubes
- Full quality gate compliance via campus_quality_gate.py
"""

import bpy
import bmesh
import math
import os
import sys
from math import radians

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
    mat_oil_stained_asphalt,
    mat_high_voltage_orange,
    mat_cryo_cyan_emissive,
    mat_satin_matte_white,
    mat_holographic_cyan_glow,
    mat_cedar_wood_decking,
    mat_hitbox_invisible,
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

def add_hitbox(name: str, size: tuple, loc: tuple, parent=None):
    bm = bmesh.new()
    bmesh_box(bm, size, loc)
    obj = create_mesh_object(name, bm, mat_hitbox_invisible(), parent=parent)
    obj.display_type = 'WIRE'
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

def bmesh_cylinder(bm, radius: float, height: float, loc: tuple, segments=24, rot_x=0.0, rot_y=0.0):
    lx, ly, lz = loc
    cos_rx, sin_rx = math.cos(rot_x), math.sin(rot_x)
    cos_ry, sin_ry = math.cos(rot_y), math.sin(rot_y)
    top_verts, bot_verts = [], []
    for i in range(segments):
        theta = i * 2 * math.pi / segments
        vx = radius * math.cos(theta)
        vy = radius * math.sin(theta)
        def transform(x, y, z):
            x1 = x * cos_ry + z * sin_ry
            z1 = -x * sin_ry + z * cos_ry
            y2 = y * cos_rx - z1 * sin_rx
            z2 = y * sin_rx + z1 * cos_rx
            return (lx + x1, ly + y2, lz + z2)
        top_verts.append(bm.verts.new(transform(vx, vy, height/2)))
        bot_verts.append(bm.verts.new(transform(vx, vy, -height/2)))
    for i in range(segments):
        i_next = (i + 1) % segments
        bm.faces.new([bot_verts[i], top_verts[i], top_verts[i_next], bot_verts[i_next]])
    bm.faces.new(top_verts)
    bm.faces.new(reversed(bot_verts))

def bmesh_tube(bm, outer_r: float, inner_r: float, height: float, loc: tuple, segments=24):
    lx, ly, lz = loc
    t_out, b_out = [], []
    t_in, b_in = [], []
    for i in range(segments):
        theta = i * 2 * math.pi / segments
        c, s = math.cos(theta), math.sin(theta)
        t_out.append(bm.verts.new((lx + outer_r * c, ly + outer_r * s, lz + height/2)))
        b_out.append(bm.verts.new((lx + outer_r * c, ly + outer_r * s, lz - height/2)))
        t_in.append(bm.verts.new((lx + inner_r * c, ly + inner_r * s, lz + height/2)))
        b_in.append(bm.verts.new((lx + inner_r * c, ly + inner_r * s, lz - height/2)))
    for i in range(segments):
        nxt = (i + 1) % segments
        bm.faces.new([b_out[i], t_out[i], t_out[nxt], b_out[nxt]])
        bm.faces.new([b_in[nxt], t_in[nxt], t_in[i], b_in[i]])
        bm.faces.new([t_out[i], t_in[i], t_in[nxt], t_out[nxt]])
        bm.faces.new([b_out[nxt], b_in[nxt], b_in[i], b_out[i]])

def bmesh_ibeam(bm, length: float, depth: float, flange_w: float, flange_t: float, web_t: float, loc: tuple, axis='Y'):
    """Creates a high-detail structural I-beam along X, Y, or Z axis."""
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

def bmesh_coil_stack(bm, outer_r: float, wire_r: float, height: float, num_coils: int, loc: tuple, segments=16):
    """Creates a multi-ring helical spring appearance for chassis suspension test benches."""
    lx, ly, lz = loc
    step_z = height / max(1, num_coils)
    for c in range(num_coils):
        cz = lz - height/2 + (c + 0.5) * step_z
        bmesh_tube(bm, outer_r + wire_r, outer_r - wire_r, wire_r * 1.8, (lx, ly, cz), segments=segments)

def bmesh_stewart_platform(bm, center: tuple, base_r: float, top_r: float, height: float, strut_r=0.08, segments=24):
    """Generates a high-fidelity 6-DOF Stewart Platform (Hexapod) with 6 hydraulic actuator struts."""
    cx, cy, cz = center
    base_angles = [radians(a) for a in [10, 50, 130, 170, 250, 290]]
    top_angles = [radians(a) for a in [40, 140, 160, 260, 280, 20]]
    
    for i in range(6):
        bx = cx + base_r * math.cos(base_angles[i])
        by = cy + base_r * math.sin(base_angles[i])
        bz = cz
        
        tx = cx + top_r * math.cos(top_angles[i])
        ty = cy + top_r * math.sin(top_angles[i])
        tz = cz + height
        
        dx, dy, dz = tx - bx, ty - by, tz - bz
        dist = math.sqrt(dx*dx + dy*dy + dz*dz)
        rot_y = math.atan2(dx, dz)
        rot_x = math.atan2(-dy, math.sqrt(dx*dx + dz*dz))
        
        # Lower cylinder barrel
        bmesh_cylinder(bm, strut_r * 1.35, dist * 0.55, (bx + dx*0.25, by + dy*0.25, bz + dz*0.25), segments=segments, rot_x=rot_x, rot_y=rot_y)
        # Upper piston rod
        bmesh_cylinder(bm, strut_r * 0.85, dist * 0.55, (bx + dx*0.75, by + dy*0.75, bz + dz*0.75), segments=segments, rot_x=rot_x, rot_y=rot_y)
        # Linear position encoder sensor along cylinder
        bmesh_cylinder(bm, strut_r * 0.35, dist * 0.5, (bx + dx*0.3 + 0.15, by + dy*0.3, bz + dz*0.3), segments=12, rot_x=rot_x, rot_y=rot_y)
        # Spherical rod end joints (Heim joints)
        bmesh_cylinder(bm, strut_r * 2.0, strut_r * 2.0, (bx, by, bz), segments=segments)
        bmesh_cylinder(bm, strut_r * 2.0, strut_r * 2.0, (tx, ty, tz), segments=segments)

# =========================================================================
# LEVEL BUILDERS (L0 - L7)
# =========================================================================

def build_chassis_l0(export_path: str):
    """Level 0: Empty Plot (Surveyed Industrial Dynamics Ground)."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_05_Chassis_HQ_L0", None)
    bpy.context.collection.objects.link(root)

    # 1. Base excavation earth pad
    bm_pad = bmesh.new()
    bmesh_box(bm_pad, (36.0, 36.0, 0.3), (0.0, 0.0, -0.15))
    create_mesh_object("GEO_Chassis_Plot_Excavation_Pad", bm_pad, mat_travertine_concrete(), parent=root)

    # 2. Seismic isolation test trench & foundation outlines
    bm_trench = bmesh.new()
    bmesh_box(bm_trench, (20.5, 0.6, 0.25), (0.0, -4.0 + 11.0, 0.125))
    bmesh_box(bm_trench, (20.5, 0.6, 0.25), (0.0, -4.0 - 11.0, 0.125))
    bmesh_box(bm_trench, (0.6, 22.0, 0.25), (-10.0, -4.0, 0.125))
    bmesh_box(bm_trench, (0.6, 22.0, 0.25), (10.0, -4.0, 0.125))
    bmesh_box(bm_trench, (16.5, 0.5, 0.2), (0.0, 15.0, 0.1))
    bmesh_box(bm_trench, (0.5, 8.0, 0.2), (-8.0, 11.0, 0.1))
    bmesh_box(bm_trench, (0.5, 8.0, 0.2), (8.0, 11.0, 0.1))
    create_mesh_object("GEO_Chassis_Foundation_Trench_Curbs", bm_trench, mat_travertine_concrete(), parent=root)

    # 3. Steel survey boundary pylons with hazard markings
    bm_pylons = bmesh.new()
    corners = [(-17.0, -17.0), (17.0, -17.0), (17.0, 17.0), (-17.0, 17.0)]
    for cx, cy in corners:
        bmesh_cylinder(bm_pylons, 0.25, 2.2, (cx, cy, 1.1), segments=24)
        bmesh_box(bm_pylons, (0.8, 0.8, 0.3), (cx, cy, 0.15))
        # Tension cables to ground stakes
        for off_x, off_y in [(-0.8, -0.8), (0.8, 0.8)]:
            bmesh_cylinder(bm_pylons, 0.03, 1.8, (cx + off_x*0.5, cy + off_y*0.5, 0.9), segments=10)
    create_mesh_object("GEO_Chassis_Survey_Boundary_Pylons", bm_pylons, mat_safety_yellow(), parent=root)

    # 4. Surveyor optical theodolite & tripod
    bm_tripod = bmesh.new()
    tx, ty = -6.0, 4.0
    for ang in [0, 120, 240]:
        rad = math.radians(ang)
        lx, ly = tx + 0.6 * math.cos(rad), ty + 0.6 * math.sin(rad)
        bmesh_cylinder(bm_tripod, 0.05, 1.5, ((tx + lx)/2, (ty + ly)/2, 0.75), segments=16)
    bmesh_cylinder(bm_tripod, 0.18, 0.35, (tx, ty, 1.5), segments=24)
    bmesh_cylinder(bm_tripod, 0.09, 0.45, (tx, ty, 1.7), segments=24, rot_y=math.radians(90))
    create_mesh_object("GEO_Chassis_Surveyor_Theodolite", bm_tripod, mat_brushed_aluminum(), parent=root)

    # 5. Project Billboard: UNIT_05 CHASSIS & DYNAMICS TEST CENTER
    bm_board = bmesh.new()
    bx, by = 0.0, 16.0
    bmesh_box(bm_board, (0.2, 0.2, 3.2), (bx - 3.2, by, 1.6))
    bmesh_box(bm_board, (0.2, 0.2, 3.2), (bx + 3.2, by, 1.6))
    bmesh_box(bm_board, (6.8, 0.15, 2.0), (bx, by, 2.4))
    create_mesh_object("GEO_Chassis_Project_Billboard", bm_board, mat_dark_slate_roof(), parent=root)

    # 6. Semantic Hitbox
    add_hitbox("HITBOX_CHASSIS_PLOT", (36.0, 36.0, 3.5), (0.0, 0.0, 1.75), parent=root)

    extras = {
        "unit_id": "CHASSIS_DYNAMICS_HQ",
        "unit_key": "UNIT_05",
        "level": 0,
        "tier": "empty_plot",
        "building_name": "Chassis & Dynamics HQ (Surveyed Plot)",
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

def add_base_chassis_l1_geometry(root):
    """
    Constructs the complete 1970s starter Chassis & Dynamics HQ (~10.2k tris):
    - Main 4-Post Hydraulic Shaker Hall (20m x 22m x 8.5m)
    - 4-Post Shaker Test Pit with hydraulic actuator rams, spherical bearings, and wheel pads
    - 3D Welded Tubular Test Mule Chassis Frame resting directly on shaker pads
    - Hydraulic high-pressure manifold hardlines along the floor trench
    - Corrugated industrial steel upper siding panels
    - Overhead crane runway girders, bridge, and hoist trolley with cable drum
    - Hydraulic pump annex on East flank with multi-fin cooling tower
    - Front Suspension Alignment & Spring Rating Bay with roll-up door, bench testers, and spring storage rack
    - High industrial ribbon clerestory windows with detailed mullion grid
    """
    # 1. Foundation & Plinth (min Z = -0.30m, within ground contact spec)
    bm_plinth = bmesh.new()
    bmesh_box(bm_plinth, (36.0, 36.0, 0.3), (0.0, 0.0, -0.15))
    create_mesh_object("GEO_Chassis_Foundation_Plinth", bm_plinth, mat_travertine_concrete(), parent=root, bevel_width=0.04)

    # 2. Main Shaker Hall (Lavender Brick 1970s)
    bm_hall = bmesh.new()
    bmesh_box(bm_hall, (20.0, 22.0, 8.5), (0.0, -4.0, 4.25))
    bmesh_box(bm_hall, (16.0, 8.0, 6.5), (0.0, 11.0, 3.25))
    create_mesh_object("GEO_Chassis_Brick_Halls", bm_hall, mat_lavender_brick_1970(), parent=root, bevel_width=0.04)

    # 3. Corrugated Industrial Siding Bands on Upper Walls
    bm_siding = bmesh.new()
    for sy in [-14.0, -4.0, 6.0]:
        bmesh_box(bm_siding, (20.2, 3.8, 2.2), (0.0, sy, 7.2))
    create_mesh_object("GEO_Chassis_Upper_Corrugated_Siding", bm_siding, mat_corrugated_industrial_steel(), parent=root)

    # 4. Coral Structural Steel I-Beams & Pilasters
    bm_steel = bmesh.new()
    bmesh_box(bm_steel, (20.6, 22.6, 0.35), (0.0, -4.0, 4.3))
    bmesh_box(bm_steel, (20.6, 22.6, 0.35), (0.0, -4.0, 8.4))
    bmesh_box(bm_steel, (16.6, 8.6, 0.3), (0.0, 11.0, 6.4))
    for px in [-10.15, 10.15]:
        for py in [-14.0, -9.0, -4.0, 1.0, 6.0]:
            bmesh_ibeam(bm_steel, 8.5, 0.45, 0.35, 0.04, 0.03, (px, py, 4.25), axis='Z')
    for px in [-8.15, -4.0, 4.0, 8.15]:
        bmesh_ibeam(bm_steel, 6.5, 0.4, 0.3, 0.04, 0.03, (px, 15.1, 3.25), axis='Z')
    create_mesh_object("GEO_Chassis_Structural_Steel_Beams", bm_steel, mat_coral_structural_beam(), parent=root)

    # 5. Interior 4-Post Shaker Rig & Pit Details
    bm_shaker = bmesh.new()
    post_coords = [(-2.2, -6.5), (2.2, -6.5), (-2.2, -1.5), (2.2, -1.5)]
    for px, py in post_coords:
        # Lower cylinder barrel
        bmesh_cylinder(bm_shaker, 0.42, 1.3, (px, py, 0.65), segments=32)
        # Chrome piston rod
        bmesh_cylinder(bm_shaker, 0.24, 0.85, (px, py, 1.45), segments=32)
        # Spherical rod bearing
        bmesh_cylinder(bm_shaker, 0.35, 0.25, (px, py, 1.95), segments=28)
        # Heavy cast-iron wheel contact pad
        bmesh_box(bm_shaker, (0.85, 1.15, 0.15), (px, py, 2.15))
        # Hydraulic high-pressure hose connection
        bmesh_cylinder(bm_shaker, 0.06, 0.8, (px + 0.35, py, 0.65), segments=20, rot_y=math.radians(90))
    # Safety perimeter guard rails around shaker pit
    for rx, ry in [(-4.0, -4.0), (4.0, -4.0)]:
        bmesh_cylinder(bm_shaker, 0.05, 1.1, (rx, ry - 3.5, 0.55), segments=16)
        bmesh_cylinder(bm_shaker, 0.05, 1.1, (rx, ry + 3.5, 0.55), segments=16)
        bmesh_box(bm_shaker, (0.08, 7.0, 0.05), (rx, ry, 1.05))
        bmesh_box(bm_shaker, (0.08, 7.0, 0.05), (rx, ry, 0.55))
    create_mesh_object("GEO_Chassis_4Post_Shaker_Actuators", bm_shaker, mat_brushed_aluminum(), parent=root)

    # 6. Welded Spaceframe Test Mule Chassis sitting on shaker pads
    bm_mule = bmesh.new()
    # Longitudinal lower rails
    bmesh_cylinder(bm_mule, 0.045, 5.2, (-2.0, -4.0, 2.3), segments=16, rot_x=math.radians(90))
    bmesh_cylinder(bm_mule, 0.045, 5.2, (2.0, -4.0, 2.3), segments=16, rot_x=math.radians(90))
    # Longitudinal upper rails
    bmesh_cylinder(bm_mule, 0.04, 5.0, (-1.8, -4.0, 2.8), segments=16, rot_x=math.radians(90))
    bmesh_cylinder(bm_mule, 0.04, 5.0, (1.8, -4.0, 2.8), segments=16, rot_x=math.radians(90))
    # Crossmembers & bulkheads
    for my in [-6.4, -4.0, -1.6]:
        bmesh_cylinder(bm_mule, 0.04, 4.0, (0.0, my, 2.3), segments=16, rot_y=math.radians(90))
        bmesh_cylinder(bm_mule, 0.04, 3.6, (0.0, my, 2.8), segments=16, rot_y=math.radians(90))
        bmesh_cylinder(bm_mule, 0.035, 0.5, (-1.9, my, 2.55), segments=12)
        bmesh_cylinder(bm_mule, 0.035, 0.5, (1.9, my, 2.55), segments=12)
    # Roll-over safety hoop over driver section
    bmesh_cylinder(bm_mule, 0.05, 1.2, (-1.7, -3.8, 3.4), segments=16)
    bmesh_cylinder(bm_mule, 0.05, 1.2, (1.7, -3.8, 3.4), segments=16)
    bmesh_cylinder(bm_mule, 0.05, 3.4, (0.0, -3.8, 4.0), segments=16, rot_y=math.radians(90))
    # Front and rear suspension wishbone A-arms connecting to pads
    for px, py in post_coords:
        bmesh_cylinder(bm_mule, 0.035, 0.6, (px * 0.7, py, 2.22), segments=12)
        bmesh_cylinder(bm_mule, 0.03, 0.7, (px * 0.85, py, 2.28), segments=12, rot_x=math.radians(35))
    create_mesh_object("GEO_Chassis_Tubular_Test_Mule_Chassis", bm_mule, mat_construction_orange(), parent=root)

    # 7. Floor Hydraulic Supply & Return Manifolds
    bm_lines = bmesh.new()
    for ly in [-12.0, -7.0, -2.0, 3.0]:
        bmesh_cylinder(bm_lines, 0.06, 4.0, (6.0, ly, 0.1), segments=16, rot_y=math.radians(90))
        bmesh_cylinder(bm_lines, 0.04, 4.0, (6.0, ly + 0.2, 0.1), segments=16, rot_y=math.radians(90))
    # High-pressure stainless manifold header
    bmesh_cylinder(bm_lines, 0.09, 16.0, (8.2, -4.0, 0.12), segments=20, rot_x=math.radians(90))
    bmesh_cylinder(bm_lines, 0.07, 16.0, (8.5, -4.0, 0.12), segments=20, rot_x=math.radians(90))
    create_mesh_object("GEO_Chassis_Hydraulic_Line_Manifolds", bm_lines, mat_brushed_aluminum(), parent=root)

    # 8. Overhead Traveling Crane Gantry with Cable Drum
    bm_crane = bmesh.new()
    bmesh_ibeam(bm_crane, 21.0, 0.5, 0.3, 0.04, 0.03, (-9.0, -4.0, 7.8), axis='Y')
    bmesh_ibeam(bm_crane, 21.0, 0.5, 0.3, 0.04, 0.03, (9.0, -4.0, 7.8), axis='Y')
    bmesh_ibeam(bm_crane, 18.0, 0.55, 0.35, 0.04, 0.03, (0.0, -4.0, 7.7), axis='X')
    bmesh_box(bm_crane, (1.4, 1.4, 0.6), (0.0, -4.0, 7.2))
    # Cable drum & hoist hook
    bmesh_cylinder(bm_crane, 0.25, 0.8, (0.0, -4.0, 6.7), segments=24, rot_y=math.radians(90))
    bmesh_cylinder(bm_crane, 0.06, 1.1, (0.0, -4.0, 5.9), segments=16)
    create_mesh_object("GEO_Chassis_Overhead_Crane_Gantry", bm_crane, mat_safety_yellow(), parent=root)

    # 9. Hydraulic Pump Annex with Multi-Fin Cooling Radiator Tower
    bm_annex = bmesh.new()
    bmesh_box(bm_annex, (5.0, 10.0, 5.5), (12.5, -7.0, 2.75))
    create_mesh_object("GEO_Chassis_Hydraulic_Pump_Annex", bm_annex, mat_travertine_concrete(), parent=root, bevel_width=0.04)

    bm_cooling = bmesh.new()
    bmesh_cylinder(bm_cooling, 1.7, 2.4, (12.5, -7.0, 6.7), segments=32)
    bmesh_tube(bm_cooling, 1.8, 1.6, 0.6, (12.5, -7.0, 8.0), segments=32)
    bmesh_cylinder(bm_cooling, 0.45, 0.8, (12.5, -7.0, 8.0), segments=24)
    # 8 cooling radiator fin rings
    for f in range(8):
        fz = 5.8 + f * 0.25
        bmesh_tube(bm_cooling, 1.9, 1.7, 0.05, (12.5, -7.0, fz), segments=32)
    create_mesh_object("GEO_Chassis_Cooling_Radiator_Tower", bm_cooling, mat_brushed_aluminum(), parent=root)

    # 10. High Industrial Ribbon Windows & Clerestories
    bm_glass = bmesh.new()
    bm_frames = bmesh.new()
    for side_x in [-10.1, 10.1]:
        bmesh_box(bm_glass, (0.1, 18.0, 2.4), (side_x, -4.0, 6.3))
        for i in range(7):
            my = -13.0 + i * 3.0
            bmesh_box(bm_frames, (0.2, 0.12, 2.5), (side_x, my, 6.3))
    bmesh_box(bm_glass, (14.0, 0.1, 1.8), (0.0, 15.05, 5.0))
    for i in range(5):
        mx = -7.0 + i * 3.5
        bmesh_box(bm_frames, (0.12, 0.2, 1.9), (mx, 15.05, 5.0))
    create_mesh_object("GEO_Chassis_Clerestory_Ribbon_Glass", bm_glass, mat_tinted_acrylic_window(), parent=root)
    create_mesh_object("GEO_Chassis_Window_Mullion_Frames", bm_frames, mat_dark_slate_roof(), parent=root)

    # 11. Front Vehicle Drive-In Roll-Up Door
    bm_door = bmesh.new()
    bmesh_box(bm_door, (4.8, 0.15, 4.2), (0.0, 15.08, 2.1))
    for s in range(12):
        bmesh_box(bm_door, (4.7, 0.18, 0.08), (0.0, 15.08, 0.35 + s * 0.35))
    create_mesh_object("GEO_Chassis_DriveIn_Rollup_Door", bm_door, mat_corrugated_industrial_steel(), parent=root)

    # 12. Suspension Alignment Bay Tester Benches & Spring Racks
    bm_bench = bmesh.new()
    # Alignment twin run-up ramp tracks
    bmesh_box(bm_bench, (0.8, 6.0, 0.3), (-2.0, 11.0, 0.15))
    bmesh_box(bm_bench, (0.8, 6.0, 0.3), (2.0, 11.0, 0.15))
    # Turnplates at front of ramp
    bmesh_cylinder(bm_bench, 0.35, 0.06, (-2.0, 13.0, 0.33), segments=24)
    bmesh_cylinder(bm_bench, 0.35, 0.06, (2.0, 13.0, 0.33), segments=24)
    # Technician tool chest & mechanical spring rater
    bmesh_box(bm_bench, (1.8, 1.0, 1.2), (-6.0, 12.0, 0.6))
    bmesh_coil_stack(bm_bench, 0.14, 0.025, 0.6, 6, (-6.0, 12.0, 1.5), segments=20)
    create_mesh_object("GEO_Chassis_Alignment_Bay_Equipment", bm_bench, mat_cast_iron_dark(), parent=root)

    # 13. Suspension Spring Inventory Storage Rack (10 distinct rate springs)
    bm_springs = bmesh.new()
    bmesh_box(bm_springs, (3.2, 0.6, 2.0), (-6.0, 8.5, 1.0))
    for shelf_z in [0.4, 1.0, 1.6]:
        bmesh_box(bm_springs, (3.0, 0.55, 0.05), (-6.0, 8.5, shelf_z))
        for sp in range(4):
            sx = -7.0 + sp * 0.7
            bmesh_coil_stack(bm_springs, 0.09, 0.018, 0.38, 5, (sx, 8.5, shelf_z + 0.22), segments=16)
    create_mesh_object("GEO_Chassis_Spring_Tester_Rack", bm_springs, mat_brushed_aluminum(), parent=root)

    # 14. Roof Gravel, Parapets & HVAC Stacks
    bm_roof = bmesh.new()
    bmesh_box(bm_roof, (19.6, 21.6, 0.4), (0.0, -4.0, 8.6))
    bmesh_box(bm_roof, (15.6, 7.6, 0.3), (0.0, 11.0, 6.6))
    bmesh_cylinder(bm_roof, 0.45, 1.8, (-6.0, -10.0, 9.5), segments=24)
    bmesh_cylinder(bm_roof, 0.45, 1.8, (6.0, -10.0, 9.5), segments=24)
    create_mesh_object("GEO_Chassis_Roof_Parapets_HVAC", bm_roof, mat_dark_slate_roof(), parent=root)

    # 15. Semantic Hitboxes
    add_hitbox("HITBOX_CHASSIS_MAIN", (20.5, 22.5, 9.0), (0.0, -4.0, 4.5), parent=root)

def build_chassis_l1(export_path: str):
    """Level 1: 1970s Starter Chassis HQ (4-Post Shaker & Alignment Bay)."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_05_Chassis_HQ_L1", None)
    bpy.context.collection.objects.link(root)
    add_base_chassis_l1_geometry(root)

    extras = {
        "unit_id": "CHASSIS_DYNAMICS_HQ",
        "unit_key": "UNIT_05",
        "level": 1,
        "tier": "office",
        "building_name": "Chassis & Dynamics HQ (4-Post Shaker Facility)",
        "sub_departments": ["ch_spring_damper", "ch_wheel_alignment"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── LEVEL 2: KINEMATICS & COMPLIANCE (K&C) WING (1975-1980) ──
def add_chassis_l2_geometry(root):
    """
    Level 2 additions (~5.6k tris):
    - West Flank K&C Rig Wing (8.0m x 20.0m x 7.5m)
    - Multi-axis floating wheel pads (longitudinal, lateral, camber compliance)
    - 4 CNC machined vehicle hub clamp fixtures with laser deflection sensors
    - Dedicated K&C overhead crane gantry with motorized hoist
    - Compliance bushing deflection test bench with pneumatic cyclic cylinder
    - 12-bottle nitrogen accumulator bank
    """
    # 1. K&C Wing Building Shell (West flank: X [-18.0, -10.0], Y [-14.0, 6.0], Z [0.0, 7.5])
    bm_wing = bmesh.new()
    bmesh_box(bm_wing, (8.0, 20.0, 7.5), (-14.0, -4.0, 3.75))
    create_mesh_object("GEO_Chassis_KC_Wing_Brick", bm_wing, mat_lavender_brick_1970(), parent=root, bevel_width=0.04)

    # 2. Structural Portal Frames & Beltline
    bm_beams = bmesh.new()
    bmesh_box(bm_beams, (8.5, 20.5, 0.35), (-14.0, -4.0, 3.8))
    bmesh_box(bm_beams, (8.5, 20.5, 0.35), (-14.0, -4.0, 7.4))
    for wy in [-13.0, -7.0, -1.0, 5.0]:
        bmesh_ibeam(bm_beams, 7.5, 0.45, 0.35, 0.04, 0.03, (-18.1, wy, 3.75), axis='Z')
    create_mesh_object("GEO_Chassis_KC_Structural_Beams", bm_beams, mat_coral_structural_beam(), parent=root)

    # 3. K&C Multi-Axis Testing Rig Internals
    bm_kc_rig = bmesh.new()
    bmesh_box(bm_kc_rig, (5.5, 8.5, 0.4), (-14.0, -4.0, 0.4))
    kc_pads = [(-15.5, -6.5), (-12.5, -6.5), (-15.5, -1.5), (-12.5, -1.5)]
    for kx, ky in kc_pads:
        bmesh_box(bm_kc_rig, (1.2, 1.4, 0.25), (kx, ky, 0.7))
        # Horizontal servo actuators (X & Y compliance rams)
        bmesh_cylinder(bm_kc_rig, 0.12, 1.2, (kx - 0.7, ky, 0.7), segments=24, rot_y=math.radians(90))
        bmesh_cylinder(bm_kc_rig, 0.12, 1.2, (kx, ky + 0.8, 0.7), segments=24, rot_x=math.radians(90))
        # Vertical load cell cylinder
        bmesh_cylinder(bm_kc_rig, 0.22, 0.4, (kx, ky, 0.95), segments=24)
        # Laser displacement sensor heads
        bmesh_box(bm_kc_rig, (0.15, 0.15, 0.3), (kx + 0.5, ky + 0.5, 1.2))
    create_mesh_object("GEO_Chassis_KC_MultiAxis_Rig", bm_kc_rig, mat_brushed_aluminum(), parent=root)

    # 4. K&C Wheel Hub Clamp Fixtures & Disc Simulators
    bm_fixtures = bmesh.new()
    for kx, ky in kc_pads:
        # Billet wheel adapter clamp
        bmesh_cylinder(bm_fixtures, 0.28, 0.15, (kx, ky, 1.15), segments=24, rot_y=math.radians(90))
        # Simulated brake rotor disc
        bmesh_cylinder(bm_fixtures, 0.38, 0.04, (kx, ky, 1.25), segments=28, rot_y=math.radians(90))
        # Suspension upright strut linkage
        bmesh_cylinder(bm_fixtures, 0.05, 0.6, (kx, ky, 1.45), segments=16)
    create_mesh_object("GEO_Chassis_KC_Hub_Fixtures", bm_fixtures, mat_cast_iron_dark(), parent=root)

    # 5. Dedicated K&C Overhead Crane Hoist
    bm_kc_crane = bmesh.new()
    bmesh_ibeam(bm_kc_crane, 18.0, 0.4, 0.25, 0.035, 0.025, (-14.0, -4.0, 6.8), axis='Y')
    bmesh_box(bm_kc_crane, (1.2, 1.2, 0.5), (-14.0, -4.0, 6.4))
    bmesh_cylinder(bm_kc_crane, 0.05, 1.2, (-14.0, -4.0, 5.5), segments=16)
    create_mesh_object("GEO_Chassis_KC_Overhead_Gantry", bm_kc_crane, mat_safety_yellow(), parent=root)

    # 6. Elastomeric Bushing Deflection Tester Bench
    bm_bush = bmesh.new()
    bmesh_box(bm_bush, (2.4, 1.4, 1.0), (-14.0, 3.5, 0.5))
    bmesh_cylinder(bm_bush, 0.16, 1.0, (-14.0, 3.5, 1.3), segments=24) # Cyclic loading actuator
    bmesh_box(bm_bush, (0.8, 0.5, 0.4), (-14.0, 3.5, 1.7)) # Load cell crosshead
    create_mesh_object("GEO_Chassis_Bushing_Deflection_Tester", bm_bush, mat_brushed_aluminum(), parent=root)

    # 7. Nitrogen Accumulator Pressure Bottle Bank
    bm_acc = bmesh.new()
    for row in range(2):
        for col in range(6):
            ax = -17.2 + row * 0.6
            ay = -12.0 + col * 1.0
            bmesh_cylinder(bm_acc, 0.18, 1.8, (ax, ay, 0.9), segments=20)
            bmesh_cylinder(bm_acc, 0.04, 0.25, (ax, ay, 1.9), segments=16)
    create_mesh_object("GEO_Chassis_Nitrogen_Accumulators", bm_acc, mat_safety_yellow(), parent=root)

    # 8. K&C Wing Glazing & Ribbon Windows
    bm_kc_glass = bmesh.new()
    bmesh_box(bm_kc_glass, (0.1, 16.0, 2.2), (-18.05, -4.0, 5.2))
    create_mesh_object("GEO_Chassis_KC_Ribbon_Glass", bm_kc_glass, mat_tinted_acrylic_window(), parent=root)

def build_chassis_l2(export_path: str):
    """Level 2: 1975-1980 K&C Rig Wing & Multi-Axis Deflection Lab."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_05_Chassis_HQ_L2", None)
    bpy.context.collection.objects.link(root)
    add_base_chassis_l1_geometry(root)
    add_chassis_l2_geometry(root)

    extras = {
        "unit_id": "CHASSIS_DYNAMICS_HQ",
        "unit_key": "UNIT_05",
        "level": 2,
        "tier": "department",
        "building_name": "Chassis HQ (K&C Testing Wing)",
        "sub_departments": ["ch_kc_compliance", "ch_bushing_dynamics"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── LEVEL 3: DAMPER DYNO & SPRING BENCH (1980-1990) ──
def add_chassis_l3_geometry(root):
    """
    Level 3 additions (~6.8k tris):
    - Second-story Damper Testing Lab atop main hall (14.0m x 14.0m x 4.0m)
    - 4 vertical damper dynamometer stroke test towers with coil springs & remote reservoirs
    - Anti-roll bar torsion fatigue testing rig (8m bed with rotary torque actuators)
    - Rooftop industrial chillers and heavy hydraulic conduits
    - Roof ventilation cowls and pressure relief stacks
    """
    # 1. Second Story Damper Test Floor (Z = [8.5, 12.5])
    bm_floor = bmesh.new()
    bmesh_box(bm_floor, (14.0, 14.0, 4.0), (0.0, -4.0, 10.5))
    create_mesh_object("GEO_Chassis_Damper_Lab_Shell", bm_floor, mat_lavender_brick_1970(), parent=root, bevel_width=0.04)

    # 2. Lab Ribbon Windows
    bm_win = bmesh.new()
    bmesh_box(bm_win, (13.6, 0.1, 1.8), (0.0, 3.05, 10.8))
    bmesh_box(bm_win, (13.6, 0.1, 1.8), (0.0, -11.05, 10.8))
    bmesh_box(bm_win, (0.1, 13.6, 1.8), (-7.05, -4.0, 10.8))
    bmesh_box(bm_win, (0.1, 13.6, 1.8), (7.05, -4.0, 10.8))
    create_mesh_object("GEO_Chassis_Damper_Lab_Windows", bm_win, mat_tinted_acrylic_window(), parent=root)

    # 3. 4 Vertical Damper Dynamometer Stroke Towers with Piggyback Reservoirs
    bm_dynos = bmesh.new()
    dyno_locs = [(-4.0, -6.0), (4.0, -6.0), (-4.0, -2.0), (4.0, -2.0)]
    for dx, dy in dyno_locs:
        bmesh_box(bm_dynos, (1.8, 1.8, 0.6), (dx, dy, 9.1))
        # Twin guide columns
        bmesh_cylinder(bm_dynos, 0.08, 2.2, (dx - 0.5, dy, 10.4), segments=24)
        bmesh_cylinder(bm_dynos, 0.08, 2.2, (dx + 0.5, dy, 10.4), segments=24)
        # Crosshead load cell
        bmesh_box(bm_dynos, (1.4, 0.6, 0.4), (dx, dy, 11.2))
        # Damper & coilover under test
        bmesh_cylinder(bm_dynos, 0.07, 1.0, (dx, dy, 10.1), segments=24)
        bmesh_coil_stack(bm_dynos, 0.12, 0.02, 0.7, 7, (dx, dy, 10.1), segments=20)
        # Remote piggyback reservoir canister
        bmesh_cylinder(bm_dynos, 0.045, 0.45, (dx + 0.35, dy + 0.3, 10.2), segments=16)
        # Stainless braided line
        bmesh_cylinder(bm_dynos, 0.015, 0.35, (dx + 0.2, dy + 0.15, 10.4), segments=12, rot_x=math.radians(45))
    create_mesh_object("GEO_Chassis_Vertical_Damper_Dynos", bm_dynos, mat_brushed_aluminum(), parent=root)

    # 4. Anti-Roll Bar (ARB) Torsion Rig Bed
    bm_arb = bmesh.new()
    bmesh_box(bm_arb, (8.0, 1.4, 0.6), (0.0, -9.0, 9.1))
    # Dual rotary torque actuators
    bmesh_cylinder(bm_arb, 0.35, 0.8, (-3.5, -9.0, 9.6), segments=24, rot_y=math.radians(90))
    bmesh_cylinder(bm_arb, 0.35, 0.8, (3.5, -9.0, 9.6), segments=24, rot_y=math.radians(90))
    # Torsion specimen bar
    bmesh_cylinder(bm_arb, 0.04, 6.2, (0.0, -9.0, 9.6), segments=20, rot_y=math.radians(90))
    # Clamping pillow blocks
    bmesh_box(bm_arb, (0.4, 0.5, 0.6), (-1.8, -9.0, 9.5))
    bmesh_box(bm_arb, (0.4, 0.5, 0.6), (1.8, -9.0, 9.5))
    create_mesh_object("GEO_Chassis_AntiRollBar_Torsion_Rig", bm_arb, mat_cast_iron_dark(), parent=root)

    # 5. Rooftop Industrial Chillers & Pipe Conduits
    bm_chillers = bmesh.new()
    bmesh_box(bm_chillers, (3.2, 4.5, 1.8), (-5.0, -4.0, 13.5))
    bmesh_box(bm_chillers, (3.2, 4.5, 1.8), (5.0, -4.0, 13.5))
    for cx in [-5.0, 5.0]:
        for cy in [-5.0, -3.0]:
            bmesh_tube(bm_chillers, 0.85, 0.7, 0.4, (cx, cy, 14.6), segments=28)
            bmesh_cylinder(bm_chillers, 0.25, 0.5, (cx, cy, 14.6), segments=20)
    # Heavy hydraulic conduits
    bmesh_cylinder(bm_chillers, 0.15, 6.0, (8.5, -7.0, 9.0), segments=20)
    bmesh_cylinder(bm_chillers, 0.15, 6.0, (9.0, -7.0, 9.0), segments=20)
    create_mesh_object("GEO_Chassis_Rooftop_Chillers_Conduits", bm_chillers, mat_cast_iron_dark(), parent=root)

    # 6. Rooftop Pressure Relief Stacks & Ventilation Cowls
    bm_vents = bmesh.new()
    for vx, vy in [(-5.0, 1.5), (5.0, 1.5), (0.0, 1.5)]:
        bmesh_cylinder(bm_vents, 0.35, 1.6, (vx, vy, 13.3), segments=20)
        bmesh_cylinder(bm_vents, 0.5, 0.25, (vx, vy, 14.1), segments=20)
    create_mesh_object("GEO_Chassis_Rooftop_Exhaust_Vents_L3", bm_vents, mat_corrugated_industrial_steel(), parent=root)

def build_chassis_l3(export_path: str):
    """Level 3: 1980-1990 High-Speed Damper Dyno & Anti-Roll Bar Lab."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_05_Chassis_HQ_L3", None)
    bpy.context.collection.objects.link(root)
    add_base_chassis_l1_geometry(root)
    add_chassis_l2_geometry(root)
    add_chassis_l3_geometry(root)

    extras = {
        "unit_id": "CHASSIS_DYNAMICS_HQ",
        "unit_key": "UNIT_05",
        "level": 3,
        "tier": "center",
        "building_name": "Chassis HQ (High-Speed Damper Dyno Center)",
        "sub_departments": ["ch_damper_dyno", "ch_antiroll_testing"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── LEVEL 4: 7-POST FORMULA SHAKER RIG & ACTIVE SUSPENSION (1990-2000) ──
def add_chassis_l4_geometry(root):
    """
    Level 4 additions (~12.2k tris):
    - 7-Post Formula Shaker Rig expansion (3 aerodynamic downforce actuators)
    - Full Carbon-Composite Single-Seater Monocoque Mock-Up on the shaker
    - 2-Story modern curtain glass telemetry observation suite with CRT consoles
    - Active suspension high-speed servo-valve test bench with pulsation dampeners
    - Double-chord Warren space-frame tubular roof trusses
    """
    # 1. 3 Additional Aerodynamic Actuator Posts (Pitch & Roll Downforce Simulator)
    bm_7post = bmesh.new()
    downforce_posts = [(0.0, -8.0), (-1.8, -4.0), (1.8, -4.0)]
    for px, py in downforce_posts:
        bmesh_cylinder(bm_7post, 0.38, 1.8, (px, py, 0.9), segments=28)
        bmesh_cylinder(bm_7post, 0.20, 1.2, (px, py, 2.0), segments=28)
        bmesh_box(bm_7post, (0.65, 0.65, 0.25), (px, py, 2.7))
        bmesh_cylinder(bm_7post, 0.08, 1.1, (px, py + 0.4, 1.8), segments=20, rot_x=math.radians(45))
        # Aerodynamic load pushrod down to monocoque fixture
        bmesh_cylinder(bm_7post, 0.04, 1.4, (px, py, 3.4), segments=16)
        bmesh_cylinder(bm_7post, 0.12, 0.12, (px, py, 4.1), segments=20)
    create_mesh_object("GEO_Chassis_7Post_Downforce_Actuators", bm_7post, mat_brushed_aluminum(), parent=root)

    # 2. Formula 1 Carbon-Composite Monocoque Fixture atop 7-post rig
    bm_mono = bmesh.new()
    # Survival cell cockpit
    bmesh_box(bm_mono, (1.6, 4.2, 1.1), (0.0, -4.0, 2.9))
    # Nosecone taper
    bmesh_box(bm_mono, (0.9, 2.2, 0.7), (0.0, -7.0, 2.7))
    # Front wing mock-up
    bmesh_box(bm_mono, (3.4, 0.8, 0.12), (0.0, -7.8, 2.3))
    # Sidepods for radiator air simulation
    bmesh_box(bm_mono, (2.6, 2.4, 0.8), (0.0, -3.8, 2.7))
    # Rear wing assembly
    bmesh_box(bm_mono, (2.8, 0.7, 0.1), (0.0, -1.2, 3.8))
    bmesh_box(bm_mono, (0.08, 0.7, 1.2), (-1.3, -1.2, 3.2))
    bmesh_box(bm_mono, (0.08, 0.7, 1.2), (1.3, -1.2, 3.2))
    create_mesh_object("GEO_Chassis_Formula_Monocoque_Fixture", bm_mono, mat_cast_iron_dark(), parent=root)

    # 3. Active Suspension Servo-Valve Flow Test Bench
    bm_active = bmesh.new()
    bmesh_box(bm_active, (3.2, 1.6, 1.1), (-6.0, -4.0, 0.55))
    for v in range(4):
        vx = -7.0 + v * 0.7
        bmesh_cylinder(bm_active, 0.09, 0.6, (vx, -4.0, 1.3), segments=20) # Valve manifold
        bmesh_cylinder(bm_active, 0.05, 0.4, (vx, -4.3, 1.5), segments=16, rot_x=math.radians(90))
    create_mesh_object("GEO_Chassis_Active_Suspension_Valve_Benches", bm_active, mat_brushed_aluminum(), parent=root)

    # 4. Modern Glass Curtain Telemetry Observation Mezzanine (Z = [4.5, 9.5])
    bm_glass = bmesh.new()
    bmesh_box(bm_glass, (18.0, 4.0, 5.0), (0.0, 5.0, 7.0))
    create_mesh_object("GEO_Chassis_Telemetry_Mezzanine_Glass", bm_glass, mat_modern_curtain_glass(), parent=root)

    # 5. Telemetry Console Stations & Computers inside mezzanine
    bm_console = bmesh.new()
    for cx in [-6.0, -2.0, 2.0, 6.0]:
        bmesh_box(bm_console, (2.2, 1.0, 0.8), (cx, 5.5, 5.0))
        bmesh_box(bm_console, (0.7, 0.5, 0.5), (cx - 0.45, 5.5, 5.7))
        bmesh_box(bm_console, (0.7, 0.5, 0.5), (cx + 0.45, 5.5, 5.7))
        bmesh_box(bm_console, (0.4, 0.8, 1.6), (cx + 0.9, 5.5, 5.5))
    create_mesh_object("GEO_Chassis_Telemetry_Control_Consoles", bm_console, mat_dark_slate_roof(), parent=root)

    # 6. Steel Space-Frame Tubular Roof Trusses with Gusset Nodes
    bm_truss = bmesh.new()
    for ty in [-12.0, -7.0, -2.0, 3.0]:
        bmesh_box(bm_truss, (19.8, 0.15, 0.15), (0.0, ty, 8.4))
        bmesh_box(bm_truss, (19.8, 0.15, 0.15), (0.0, ty, 7.6))
        for tx in range(-9, 10, 2):
            bmesh_cylinder(bm_truss, 0.05, 0.95, (tx, ty, 8.0), segments=16, rot_y=math.radians(45))
            bmesh_cylinder(bm_truss, 0.05, 0.95, (tx, ty, 8.0), segments=16, rot_y=math.radians(-45))
            # Spherical node connector
            bmesh_cylinder(bm_truss, 0.1, 0.1, (tx, ty, 8.4), segments=16)
            bmesh_cylinder(bm_truss, 0.1, 0.1, (tx, ty, 7.6), segments=16)
    create_mesh_object("GEO_Chassis_SpaceFrame_Roof_Trusses", bm_truss, mat_coral_structural_beam(), parent=root)

def build_chassis_l4(export_path: str):
    """Level 4: 1990-2000 7-Post Formula Shaker Rig & Active Suspension."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_05_Chassis_HQ_L4", None)
    bpy.context.collection.objects.link(root)
    add_base_chassis_l1_geometry(root)
    add_chassis_l2_geometry(root)
    add_chassis_l3_geometry(root)
    add_chassis_l4_geometry(root)

    extras = {
        "unit_id": "CHASSIS_DYNAMICS_HQ",
        "unit_key": "UNIT_05",
        "level": 4,
        "tier": "advanced_hq",
        "building_name": "Chassis HQ (7-Post Formula Shaker Rig Center)",
        "sub_departments": ["ch_7post_rig", "ch_active_suspension"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── LEVEL 5: HIGH-INERTIA BRAKE DYNO WING & SOLAR CANOPY (2000-2010) ──
def add_chassis_l5_geometry(root):
    """
    Level 5 additions (~14.5k tris):
    - East Flank High-Inertia Brake Dyno Wing (8.0m x 14.0m x 8.0m)
    - Heavy multi-plate flywheel inertia dyno assembly with 36 internal cooling vanes
    - FLIR infrared thermal pyrometer camera gantry & high-temp ducting
    - Secondary EV Regenerative Braking high-speed motor dynamometer cell
    - High-density Photovoltaic solar panel roof canopy across the complex
    """
    # 1. Brake Dyno Wing Shell (East flank: X [10.0, 18.0], Y [0.0, 14.0], Z [0.0, 8.0])
    bm_brake = bmesh.new()
    bmesh_box(bm_brake, (8.0, 14.0, 8.0), (14.0, 7.0, 4.0))
    create_mesh_object("GEO_Chassis_Brake_Dyno_Wing_Concrete", bm_brake, mat_travertine_concrete(), parent=root, bevel_width=0.05)

    # 2. High-Inertia Flywheel Dynamometer Rig with Internal Vanes
    bm_flywheel = bmesh.new()
    # Massive multi-plate cast iron flywheel (3.2m diameter)
    bmesh_cylinder(bm_flywheel, 1.6, 2.0, (14.0, 7.0, 2.2), segments=40, rot_x=math.radians(90))
    # Outer inertia ring
    bmesh_tube(bm_flywheel, 1.75, 1.5, 0.6, (14.0, 7.0, 2.2), segments=40)
    # Electric drive motor
    bmesh_cylinder(bm_flywheel, 0.95, 2.4, (14.0, 4.2, 2.2), segments=32, rot_x=math.radians(90))
    # Carbon ceramic brake rotor test fixture
    bmesh_cylinder(bm_flywheel, 0.5, 0.22, (14.0, 8.8, 2.2), segments=36, rot_x=math.radians(90))
    # Internal radial cooling vanes inside vented rotor
    for v in range(36):
        theta = v * 2 * math.pi / 36
        vx = 14.0 + 0.38 * math.cos(theta)
        vz = 2.2 + 0.38 * math.sin(theta)
        bmesh_box(bm_flywheel, (0.02, 0.18, 0.16), (vx, 8.8, vz))
    # Dual monobloc brake calipers
    bmesh_box(bm_flywheel, (0.45, 0.7, 0.9), (14.0, 8.8, 2.7))
    create_mesh_object("GEO_Chassis_Brake_Flywheel_Assembly", bm_flywheel, mat_cast_iron_dark(), parent=root)

    # 3. FLIR Infrared Thermal Pyrometer Sensor Gantry
    bm_flir = bmesh.new()
    bmesh_box(bm_flir, (1.8, 0.12, 1.6), (14.0, 9.8, 2.5))
    bmesh_cylinder(bm_flir, 0.14, 0.35, (13.6, 9.6, 2.6), segments=20, rot_x=math.radians(45))
    bmesh_cylinder(bm_flir, 0.14, 0.35, (14.4, 9.6, 2.6), segments=20, rot_x=math.radians(45))
    create_mesh_object("GEO_Chassis_Brake_Thermal_Scrubbers", bm_flir, mat_brushed_aluminum(), parent=root)

    # 4. Secondary EV Regenerative Braking E-Motor Dyno Cell
    bm_reg = bmesh.new()
    bmesh_cylinder(bm_reg, 0.75, 2.2, (14.0, 11.5, 2.0), segments=32, rot_x=math.radians(90))
    bmesh_box(bm_reg, (1.2, 0.8, 1.2), (14.0, 13.0, 2.0))
    # High-voltage orange insulated power lines
    bmesh_cylinder(bm_reg, 0.08, 3.5, (14.8, 12.0, 1.5), segments=16)
    bmesh_cylinder(bm_reg, 0.08, 3.5, (15.1, 12.0, 1.5), segments=16)
    create_mesh_object("GEO_Chassis_Regenerative_Braking_EMotor_Dyno", bm_reg, mat_high_voltage_orange(), parent=root)

    # 5. High-Temp Exhaust Scrubbers & Heat Exchangers atop brake wing
    bm_scrubbers = bmesh.new()
    bmesh_cylinder(bm_scrubbers, 0.75, 3.4, (12.5, 11.0, 9.7), segments=28)
    bmesh_cylinder(bm_scrubbers, 0.75, 3.4, (15.5, 11.0, 9.7), segments=28)
    bmesh_cylinder(bm_scrubbers, 0.38, 3.0, (14.0, 11.0, 8.8), segments=24, rot_y=math.radians(90))
    # Exhaust cooling fins
    for c in range(6):
        cz = 9.0 + c * 0.4
        bmesh_tube(bm_scrubbers, 0.88, 0.75, 0.05, (12.5, 11.0, cz), segments=28)
        bmesh_tube(bm_scrubbers, 0.88, 0.75, 0.05, (15.5, 11.0, cz), segments=28)
    create_mesh_object("GEO_Chassis_Brake_Heat_Scrubbers", bm_scrubbers, mat_brushed_aluminum(), parent=root)

    # 6. Photovoltaic Solar Canopy (Z = 13.2)
    bm_solar = bmesh.new()
    bmesh_box(bm_solar, (26.0, 22.0, 0.25), (-3.0, -4.0, 13.2))
    for r in range(12):
        sy = -13.0 + r * 1.8
        bmesh_box(bm_solar, (25.0, 1.5, 0.08), (-3.0, sy, 13.38))
        for col_x in range(-11, 12, 4):
            bmesh_box(bm_solar, (3.8, 1.4, 0.04), (col_x, sy, 13.44))
    for sx in [-15.0, 0.0, 9.0]:
        for sy in [-13.0, -4.0, 5.0]:
            bmesh_cylinder(bm_solar, 0.12, 4.5, (sx, sy, 11.0), segments=20)
    create_mesh_object("GEO_Chassis_Photovoltaic_Solar_Canopy", bm_solar, mat_modern_curtain_glass(), parent=root)

def build_chassis_l5(export_path: str):
    """Level 5: 2000-2010 High-Inertia Brake Dyno & Solar Canopy."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_05_Chassis_HQ_L5", None)
    bpy.context.collection.objects.link(root)
    add_base_chassis_l1_geometry(root)
    add_chassis_l2_geometry(root)
    add_chassis_l3_geometry(root)
    add_chassis_l4_geometry(root)
    add_chassis_l5_geometry(root)

    extras = {
        "unit_id": "CHASSIS_DYNAMICS_HQ",
        "unit_key": "UNIT_05",
        "level": 5,
        "tier": "world_class_hq",
        "building_name": "Chassis HQ (High-Inertia Brake Dyno Center)",
        "sub_departments": ["ch_brake_dyno", "ch_thermal_simulation"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── LEVEL 6: DRIVER-IN-THE-LOOP (DiL) 6-DOF MOTION SIMULATOR (2010-2020) ──
def add_chassis_l6_geometry(root):
    """
    Level 6 additions (~16.2k tris):
    - 6-DOF Stewart Platform Hexapod motion simulator theater
    - 14m diameter cylindrical simulator pod with geodesic dome and 24 radial structural ribs
    - Carbon composite driver cockpit capsule inside with 180° collimated wrap screen
    - Operator control bridge with multi-monitor telemetry array
    - Dedicated clean air recirculation & HVAC chillers
    - Rooftop cedar observation terrace with glass balustrades
    - Cyan LED architectural accent rings
    """
    # 1. DiL Motion Simulator Cylindrical Theater Shell (North Plot: X [-7.0, 7.0], Y [9.0, 23.0])
    bm_theater = bmesh.new()
    bmesh_cylinder(bm_theater, 7.0, 9.0, (0.0, 16.0, 4.5), segments=56)
    create_mesh_object("GEO_Chassis_DiL_Theater_Cylinder", bm_theater, mat_satin_matte_white(), parent=root, bevel_width=0.04)

    # 2. Geodesic Dome Skylight on Theater Roof
    bm_dome = bmesh.new()
    bmesh_cylinder(bm_dome, 6.2, 1.8, (0.0, 16.0, 9.9), segments=56)
    create_mesh_object("GEO_Chassis_DiL_Roof_Dome_Glass", bm_dome, mat_modern_curtain_glass(), parent=root)

    # 3. 24 Geodesic Radial Structural Ribs
    bm_ribs = bmesh.new()
    for rib in range(24):
        theta = rib * 2 * math.pi / 24
        rx = 6.2 * math.cos(theta)
        ry = 16.0 + 6.2 * math.sin(theta)
        bmesh_cylinder(bm_ribs, 0.06, 2.2, (rx * 0.7, ry * 0.7 + 4.8, 10.2), segments=12, rot_x=math.cos(theta)*0.3, rot_y=math.sin(theta)*0.3)
    create_mesh_object("GEO_Chassis_DiL_Geodesic_Structural_Ribs", bm_ribs, mat_coral_structural_beam(), parent=root)

    # 4. High-Fidelity 6-DOF Stewart Platform (Hexapod) Assembly inside theater
    bm_hexapod = bmesh.new()
    bmesh_cylinder(bm_hexapod, 4.6, 0.6, (0.0, 16.0, 0.5), segments=36)
    bmesh_cylinder(bm_hexapod, 3.8, 0.28, (0.0, 16.0, 3.2), segments=36)
    # Stewart platform struts
    bmesh_stewart_platform(bm_hexapod, (0.0, 16.0, 0.8), base_r=4.0, top_r=3.2, height=2.4, strut_r=0.09, segments=24)
    # Cockpit shell with bucket seat outline
    bmesh_box(bm_hexapod, (2.4, 3.4, 1.4), (0.0, 16.0, 4.1))
    bmesh_cylinder(bm_hexapod, 0.22, 0.05, (0.0, 15.5, 4.5), segments=20) # Steering wheel
    # 180-degree curved cylindrical projection screen
    bmesh_tube(bm_hexapod, 5.8, 5.7, 3.2, (0.0, 16.0, 4.2), segments=48)
    create_mesh_object("GEO_Chassis_Stewart_Platform_Hexapod", bm_hexapod, mat_brushed_aluminum(), parent=root)

    # 5. Operator Telemetry Control Bridge overlooking simulator
    bm_bridge = bmesh.new()
    bmesh_box(bm_bridge, (4.5, 2.5, 1.2), (0.0, 10.5, 4.2))
    # 3 Curved wide-screen LCD telemetry monitors
    for mon in [-1.4, 0.0, 1.4]:
        bmesh_box(bm_bridge, (1.1, 0.1, 0.7), (mon, 10.8, 5.2))
        bmesh_cylinder(bm_bridge, 0.04, 0.4, (mon, 10.8, 4.8), segments=12)
    create_mesh_object("GEO_Chassis_DiL_Operator_Control_Bridge", bm_bridge, mat_dark_slate_roof(), parent=root)

    # 6. HVAC Air Recirculation & Scrubber Pods
    bm_hvac = bmesh.new()
    bmesh_box(bm_hvac, (2.2, 2.2, 2.4), (-5.8, 20.0, 1.2))
    bmesh_box(bm_hvac, (2.2, 2.2, 2.4), (5.8, 20.0, 1.2))
    create_mesh_object("GEO_Chassis_DiL_HVAC_Air_Recirculators", bm_hvac, mat_corrugated_industrial_steel(), parent=root)

    # 7. Cyan LED Architectural Accent Rings
    bm_led = bmesh.new()
    bmesh_tube(bm_led, 7.12, 6.98, 0.2, (0.0, 16.0, 4.5), segments=56)
    bmesh_tube(bm_led, 7.12, 6.98, 0.2, (0.0, 16.0, 8.8), segments=56)
    create_mesh_object("GEO_Chassis_LED_Accent_Rings", bm_led, mat_cryo_cyan_emissive(), parent=root)

    # 8. Rooftop Cedar Decking & Observation Terrace
    bm_deck = bmesh.new()
    bmesh_box(bm_deck, (10.0, 10.0, 0.15), (0.0, 16.0, 9.1))
    # Glass balustrade around terrace
    for bx, by, bw, bl in [(-5.0, 0.0, 0.08, 10.0), (5.0, 0.0, 0.08, 10.0), (0.0, -5.0, 10.0, 0.08), (0.0, 5.0, 10.0, 0.08)]:
        bmesh_box(bm_deck, (bw, bl, 1.1), (bx, 16.0 + by, 9.7))
    create_mesh_object("GEO_Chassis_Rooftop_Cedar_Terrace", bm_deck, mat_cedar_wood_decking(), parent=root)

    # 9. Additional Semantic Hitbox for DiL Theater
    add_hitbox("HITBOX_CHASSIS_DIL_DOME", (15.0, 15.0, 11.0), (0.0, 16.0, 5.5), parent=root)

def build_chassis_l6(export_path: str):
    """Level 6: 2010-2020 Driver-in-the-Loop 6-DOF Motion Platform."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_05_Chassis_HQ_L6", None)
    bpy.context.collection.objects.link(root)
    add_base_chassis_l1_geometry(root)
    add_chassis_l2_geometry(root)
    add_chassis_l3_geometry(root)
    add_chassis_l4_geometry(root)
    add_chassis_l5_geometry(root)
    add_chassis_l6_geometry(root)

    extras = {
        "unit_id": "CHASSIS_DYNAMICS_HQ",
        "unit_key": "UNIT_05",
        "level": 6,
        "tier": "innovation_campus",
        "building_name": "Chassis HQ (6-DOF Driver Motion Simulator)",
        "sub_departments": ["ch_dil_simulator", "ch_vehicle_dynamics_ai"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── LEVEL 7: MAGNETIC LEVITATION & AI CHASSIS SYNTHESIS (2020s+) ──
def add_chassis_l7_geometry(root):
    """
    Level 7 additions (~21.5k tris):
    - Soaring aerodynamic glass envelope canopy spanning the complex with diagrid space truss
    - Linear Induction MagLev Dynamic Isolation Chamber with 64 copper stator teeth & reaction rail
    - 5-Story Quantum Dynamics AI Compute Tower with parametric hexagonal cooling lattice
    - Vertical Superconducting Cryogenic Dewar Flasks with vacuum jacket transfer lines
    - Glazed skybridge connecting DiL theater to compute tower
    - Autonomous vehicle sensor drone pad with landing rings
    """
    # 1. Quantum Dynamics Compute Tower (South-East: X [7.0, 16.0], Y [-16.0, -7.0], Z [0.0, 18.0])
    bm_tower = bmesh.new()
    bmesh_box(bm_tower, (9.0, 9.0, 18.0), (11.5, -11.5, 9.0))
    create_mesh_object("GEO_Chassis_Quantum_Compute_Tower", bm_tower, mat_satin_matte_white(), parent=root, bevel_width=0.06)

    # 2. Tower Curtain Glass Facades with Cyan Glow
    bm_tow_glass = bmesh.new()
    for fl in range(5):
        fz = 2.5 + fl * 3.5
        bmesh_box(bm_tow_glass, (9.2, 8.0, 1.8), (11.5, -11.5, fz))
        bmesh_box(bm_tow_glass, (8.0, 9.2, 1.8), (11.5, -11.5, fz))
    create_mesh_object("GEO_Chassis_Tower_Curtain_Glass", bm_tow_glass, mat_modern_curtain_glass(), parent=root)

    # 3. Parametric Hexagonal Lattice Bracing on Quantum Tower
    bm_lat = bmesh.new()
    for fl in range(5):
        fz = 2.5 + fl * 3.5
        for edge_x in [-4.6, 4.6]:
            for edge_y in [-4.6, 4.6]:
                bmesh_cylinder(bm_lat, 0.08, 3.5, (11.5 + edge_x, -11.5 + edge_y, fz), segments=16)
        # Diagonal lattice ties
        bmesh_cylinder(bm_lat, 0.05, 5.0, (11.5, -11.5 + 4.6, fz), segments=12, rot_x=math.radians(35))
        bmesh_cylinder(bm_lat, 0.05, 5.0, (11.5, -11.5 - 4.6, fz), segments=12, rot_x=math.radians(-35))
    create_mesh_object("GEO_Chassis_Quantum_Lattice_Bracing", bm_lat, mat_coral_structural_beam(), parent=root)

    # 4. Cryogenic Liquid-Nitrogen Cooling Manifolds on Tower with Cooling Fins
    bm_cryo = bmesh.new()
    bmesh_cylinder(bm_cryo, 0.38, 16.0, (16.2, -11.5, 9.0), segments=28)
    bmesh_cylinder(bm_cryo, 0.38, 16.0, (11.5, -16.2, 9.0), segments=28)
    # 20 cryogenic cooling radiator rings
    for cr in range(20):
        cz = 2.0 + cr * 0.7
        bmesh_tube(bm_cryo, 0.52, 0.38, 0.05, (16.2, -11.5, cz), segments=28)
        bmesh_tube(bm_cryo, 0.52, 0.38, 0.05, (11.5, -16.2, cz), segments=28)
    create_mesh_object("GEO_Chassis_Cryogenic_Cooling_Manifolds", bm_cryo, mat_cryo_cyan_emissive(), parent=root)

    # 5. Vertical Superconducting Cryogenic Dewar Vacuum Flasks
    bm_dewar = bmesh.new()
    for d in range(4):
        dx = 8.0 + d * 1.6
        bmesh_cylinder(bm_dewar, 0.55, 3.2, (dx, -16.2, 1.6), segments=24)
        bmesh_tube(bm_dewar, 0.65, 0.55, 0.2, (dx, -16.2, 3.1), segments=24)
        bmesh_cylinder(bm_dewar, 0.12, 1.2, (dx, -16.2, 3.8), segments=16)
    create_mesh_object("GEO_Chassis_Quantum_Superconducting_Cryo_Vessels", bm_dewar, mat_brushed_aluminum(), parent=root)

    # 6. Linear Induction MagLev Dynamic Isolation Chamber (West-to-East: Y = -16.0)
    bm_maglev = bmesh.new()
    bmesh_box(bm_maglev, (26.0, 3.5, 0.6), (-1.0, -16.0, 0.3))
    # 64 linear stator coils & electromagnetic teeth along channel
    for coil_x in range(-24, 24, 1):
        cx = -1.0 + coil_x * 0.5
        bmesh_box(bm_maglev, (0.42, 3.2, 0.25), (cx, -16.0, 0.7))
        bmesh_cylinder(bm_maglev, 0.06, 0.4, (cx, -16.0, 0.95), segments=16)
    bmesh_box(bm_maglev, (26.0, 3.2, 2.0), (-1.0, -16.0, 1.8))
    create_mesh_object("GEO_Chassis_MagLev_Test_Chamber", bm_maglev, mat_modern_curtain_glass(), parent=root)

    # 7. Soaring Aerodynamic Glass Envelope Canopy (Z = 16.5) with Diagrid Space Truss
    bm_aero = bmesh.new()
    bmesh_box(bm_aero, (32.0, 34.0, 0.5), (-1.0, 0.0, 16.5))
    bmesh_box(bm_aero, (32.4, 34.4, 0.2), (-1.0, 0.0, 16.8))
    for sx in [-14.0, 0.0, 12.0]:
        for sy in [-14.0, 0.0, 14.0]:
            bmesh_cylinder(bm_aero, 0.18, 8.0, (sx, sy, 12.5), segments=24)
            # Diagonal tension stay cables
            bmesh_cylinder(bm_aero, 0.04, 6.5, (sx + 2.0, sy + 2.0, 14.5), segments=12, rot_x=math.radians(25), rot_y=math.radians(25))
    create_mesh_object("GEO_Chassis_Aerodynamic_Glass_Canopy", bm_aero, mat_modern_curtain_glass(), parent=root)

    # 8. Glazed Skybridge connecting DiL Theater to Quantum Tower
    bm_bridge = bmesh.new()
    bx, by, bz = 4.0, 1.5, 8.5
    dx, dy = 8.0, -17.0
    dist = math.sqrt(dx*dx + dy*dy)
    bmesh_box(bm_bridge, (dist, 2.2, 2.6), (bx, by, bz))
    create_mesh_object("GEO_Chassis_Glazed_Skybridge", bm_bridge, mat_modern_curtain_glass(), parent=root)

    # 9. Autonomous Drone Landing Pad atop Quantum Tower
    bm_pad = bmesh.new()
    bmesh_box(bm_pad, (8.0, 8.0, 0.2), (11.5, -11.5, 18.1))
    bmesh_tube(bm_pad, 3.4, 3.0, 0.08, (11.5, -11.5, 18.25), segments=48)
    bmesh_cylinder(bm_pad, 0.8, 0.08, (11.5, -11.5, 18.25), segments=32)
    create_mesh_object("GEO_Chassis_Drone_Landing_Pad", bm_pad, mat_safety_yellow(), parent=root)

    # 10. Hitbox for Quantum Tower
    add_hitbox("HITBOX_CHASSIS_TOWER", (10.0, 10.0, 19.0), (11.5, -11.5, 9.5), parent=root)

def build_chassis_l7(export_path: str):
    """Level 7: 2020s+ Magnetic Levitation & AI Chassis Synthesis Master Complex."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_05_Chassis_HQ_L7", None)
    bpy.context.collection.objects.link(root)
    add_base_chassis_l1_geometry(root)
    add_chassis_l2_geometry(root)
    add_chassis_l3_geometry(root)
    add_chassis_l4_geometry(root)
    add_chassis_l5_geometry(root)
    add_chassis_l6_geometry(root)
    add_chassis_l7_geometry(root)

    extras = {
        "unit_id": "CHASSIS_DYNAMICS_HQ",
        "unit_key": "UNIT_05",
        "level": 7,
        "tier": "hypermodern_campus",
        "building_name": "Chassis HQ (MagLev & AI Chassis Master Complex)",
        "sub_departments": ["ch_quantum_dynamics", "ch_maglev_chamber", "ch_autonomous_chassis_lab"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# =========================================================================
# BATCH GENERATION & AUDIT ENTRYPOINT
# =========================================================================
def generate_all_chassis_levels(output_dir: str):
    os.makedirs(output_dir, exist_ok=True)
    results = {}
    
    levels = [
        (0, "hq_05_chassis_l0.glb", build_chassis_l0),
        (1, "hq_05_chassis_l1.glb", build_chassis_l1),
        (2, "hq_05_chassis_l2.glb", build_chassis_l2),
        (3, "hq_05_chassis_l3.glb", build_chassis_l3),
        (4, "hq_05_chassis_l4.glb", build_chassis_l4),
        (5, "hq_05_chassis_l5.glb", build_chassis_l5),
        (6, "hq_05_chassis_l6.glb", build_chassis_l6),
        (7, "hq_05_chassis_l7.glb", build_chassis_l7),
    ]
    
    print("\n" + "#" * 70)
    print(" AUTO TYCOON CAMPUS HQ - UNIT_05 CHASSIS & DYNAMICS HQ GENERATION")
    print(f" Target Output Directory: {output_dir}")
    print("#" * 70)
    
    all_passed = True
    for lvl, filename, builder_func in levels:
        out_path = os.path.join(output_dir, filename)
        tier_name = CAMPUS_TRIANGLE_BUDGETS[lvl]["tier"]
        print(f"\n>>> Generating UNIT_05 Level {lvl} ({tier_name}) -> {filename}...")
        
        success = builder_func(out_path)
        passed, report = audit_scene("UNIT_05_CHASSIS", lvl, bpy)
        print_audit_summary(report)
        
        file_size = os.path.getsize(out_path) if os.path.exists(out_path) else 0
        tris = report["total_triangles"]
        print(f"    Export: {success} | Size: {file_size / 1024:.1f} KB | Triangles: {tris:,}")
        results[lvl] = {"file": filename, "passed": passed, "size_kb": file_size / 1024.0, "triangles": tris}
        if not passed:
            all_passed = False
            
    print("\n" + "=" * 70)
    print(" UNIT_05 CHASSIS HQ SUMMARY AUDIT TABLE")
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
    
    generate_all_chassis_levels(target_dir)
