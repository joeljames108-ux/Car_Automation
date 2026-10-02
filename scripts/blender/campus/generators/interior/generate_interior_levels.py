"""
AUTO TYCOON CAMPUS HQ - UNIT_06 INTERIOR & HMI HQ GENERATOR (PHASES 97-104)

Generates all 8 progression levels (L0-L7) for UNIT_06:
- Footprint: 36m x 36m (Master Plot)
- Architectural Identity: Ergonomics, Craftsmanship & Cockpit Electronics character —
  1970s seating buck & leather craft upholstery studio with 5-flute seats, D-cut steering column,
  acoustic NVH sound deadening annex, H-point digitizer CMM lab with SAE J826 manikin,
  thermal comfort HVAC climate chamber with solar simulation lamps and insulated vault door,
  curved OLED glass cockpit lab with AR-HUD projection wells and cantilevered bridge consoles,
  hemi-anechoic acoustic wedge chamber with 980 3D foam pyramid wedges and binaural dummy head,
  and autonomous living lounge zero-gravity synthesis pavilion with quantum AI HMI tower.

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
    mat_cedar_wood_decking,
    mat_satin_matte_white,
    mat_holographic_cyan_glow,
    mat_cryo_cyan_emissive,
    mat_automotive_styling_clay,
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

def bmesh_acoustic_pyramids(bm, count_x: int, count_y: int, base_size: float, height: float, loc: tuple, normal_axis='X', flip_normal=False):
    """Generates 3D acoustic foam pyramid wedges for the NVH hemi-anechoic sound chamber."""
    lx, ly, lz = loc
    half_b = base_size / 2
    sign = -1.0 if flip_normal else 1.0
    for ix in range(count_x):
        for iy in range(count_y):
            if normal_axis == 'X':
                cx = lx
                cy = ly + (iy - count_y/2 + 0.5) * base_size
                cz = lz + (ix - count_x/2 + 0.5) * base_size
                apex = bm.verts.new((cx + sign * height, cy, cz))
                v1 = bm.verts.new((cx, cy - half_b, cz - half_b))
                v2 = bm.verts.new((cx, cy + half_b, cz - half_b))
                v3 = bm.verts.new((cx, cy + half_b, cz + half_b))
                v4 = bm.verts.new((cx, cy - half_b, cz + half_b))
            elif normal_axis == 'Y':
                cx = lx + (ix - count_x/2 + 0.5) * base_size
                cy = ly
                cz = lz + (iy - count_y/2 + 0.5) * base_size
                apex = bm.verts.new((cx, cy + sign * height, cz))
                v1 = bm.verts.new((cx - half_b, cy, cz - half_b))
                v2 = bm.verts.new((cx + half_b, cy, cz - half_b))
                v3 = bm.verts.new((cx + half_b, cy, cz + half_b))
                v4 = bm.verts.new((cx - half_b, cy, cz + half_b))
            else: # 'Z' (ceiling)
                cx = lx + (ix - count_x/2 + 0.5) * base_size
                cy = ly + (iy - count_y/2 + 0.5) * base_size
                cz = lz
                apex = bm.verts.new((cx, cy, cz + sign * height))
                v1 = bm.verts.new((cx - half_b, cy - half_b, cz))
                v2 = bm.verts.new((cx + half_b, cy - half_b, cz))
                v3 = bm.verts.new((cx + half_b, cy + half_b, cz))
                v4 = bm.verts.new((cx - half_b, cy + half_b, cz))
            bm.faces.new([v1, v2, apex])
            bm.faces.new([v2, v3, apex])
            bm.faces.new([v3, v4, apex])
            bm.faces.new([v4, v1, apex])
            bm.faces.new([v4, v3, v2, v1])

def bmesh_interior_seating_buck(bm, loc: tuple):
    """
    Creates a full-scale wooden chassis interior buck conforming to SAE ergonomics:
    - Stepped turntable platform with cedar decking
    - Dual front sports seats with 5-flute parabolic cushion lofting, side bolsters, chrome stanchion headrests
    - Center console bridge with shift lever and rotary MMI controller puck
    - 3-Spoke D-cut steering wheel with paddle shifters on angled column
    - Dashboard brow with hooded instrument binnacle
    """
    lx, ly, lz = loc
    # Turntable platform with stepped chamfer lip
    bmesh_cylinder(bm, 3.6, 0.25, (lx, ly, lz + 0.125), segments=40)
    bmesh_tube(bm, 3.7, 3.5, 0.08, (lx, ly, lz + 0.2), segments=40)
    # Chassis tubular frame base
    bmesh_box(bm, (2.3, 3.8, 0.22), (lx, ly, lz + 0.36))
    # A-pillar mock frame
    bmesh_cylinder(bm, 0.05, 1.5, (lx - 0.95, ly + 1.2, lz + 1.15), segments=20, rot_x=math.radians(30))
    bmesh_cylinder(bm, 0.05, 1.5, (lx + 0.95, ly + 1.2, lz + 1.15), segments=20, rot_x=math.radians(30))
    bmesh_cylinder(bm, 0.05, 1.9, (lx, ly + 0.8, lz + 1.8), segments=20, rot_y=math.radians(90))
    # Dashboard brow & instrument cowl
    bmesh_box(bm, (2.0, 0.65, 0.35), (lx, ly + 0.7, lz + 1.1))
    bmesh_cylinder(bm, 0.4, 0.5, (lx - 0.55, ly + 0.65, lz + 1.2), segments=24)
    # Two front ergonomic bucket seats with 5-flute cushion ridges & headrests
    for sx in [lx - 0.55, lx + 0.55]:
        # Cushion base
        bmesh_box(bm, (0.7, 0.75, 0.22), (sx, ly - 0.2, lz + 0.55))
        # 5 anatomical cushion flutes
        for f in range(5):
            fy = ly - 0.5 + f * 0.15
            bmesh_cylinder(bm, 0.04, 0.6, (sx, fy, lz + 0.66), segments=16, rot_y=math.radians(90))
        # Lateral side bolsters (puffy convex)
        bmesh_box(bm, (0.16, 0.75, 0.18), (sx - 0.28, ly - 0.2, lz + 0.72))
        bmesh_box(bm, (0.16, 0.75, 0.18), (sx + 0.28, ly - 0.2, lz + 0.72))
        # Backrest tilted rearward (+15 degrees)
        bmesh_box(bm, (0.65, 0.22, 0.9), (sx, ly - 0.6, lz + 1.1))
        # Backrest lateral kidney bolsters
        bmesh_box(bm, (0.15, 0.25, 0.85), (sx - 0.26, ly - 0.55, lz + 1.12))
        bmesh_box(bm, (0.15, 0.25, 0.85), (sx + 0.26, ly - 0.55, lz + 1.12))
        # Chrome headrest stanchions with collar escutcheon rings
        bmesh_cylinder(bm, 0.018, 0.35, (sx - 0.15, ly - 0.62, lz + 1.58), segments=16)
        bmesh_cylinder(bm, 0.018, 0.35, (sx + 0.15, ly - 0.62, lz + 1.58), segments=16)
        bmesh_tube(bm, 0.03, 0.018, 0.04, (sx - 0.15, ly - 0.62, lz + 1.5), segments=16)
        bmesh_tube(bm, 0.03, 0.018, 0.04, (sx + 0.15, ly - 0.62, lz + 1.5), segments=16)
        # Cervical pillow headrest
        bmesh_box(bm, (0.38, 0.16, 0.26), (sx, ly - 0.65, lz + 1.74))
        # Billet floor rails
        bmesh_box(bm, (0.05, 0.8, 0.04), (sx - 0.25, ly - 0.2, lz + 0.42))
        bmesh_box(bm, (0.05, 0.8, 0.04), (sx + 0.25, ly - 0.2, lz + 0.42))
    # Center console bridge
    bmesh_box(bm, (0.38, 1.8, 0.45), (lx, ly, lz + 0.62))
    # Gear selector stick & shift knob
    bmesh_cylinder(bm, 0.025, 0.28, (lx, ly + 0.2, lz + 0.95), segments=16)
    bmesh_cylinder(bm, 0.05, 0.07, (lx, ly + 0.2, lz + 1.1), segments=20)
    # MMI rotary knurled controller puck
    bmesh_cylinder(bm, 0.08, 0.04, (lx, ly - 0.2, lz + 0.87), segments=24)
    # Cup holder recessed wells
    bmesh_cylinder(bm, 0.06, 0.06, (lx, ly - 0.5, lz + 0.85), segments=20)
    # Steering column & 3-spoke D-cut wheel
    bmesh_cylinder(bm, 0.045, 0.75, (lx - 0.55, ly + 0.4, lz + 0.88), segments=20, rot_x=math.radians(-25))
    bmesh_tube(bm, 0.24, 0.19, 0.045, (lx - 0.55, ly + 0.22, lz + 1.2), segments=32)
    # Flat-bottom D-cut bottom chord
    bmesh_box(bm, (0.28, 0.045, 0.04), (lx - 0.55, ly + 0.22, lz + 0.98))
    # 3 Spokes & center horn hub
    bmesh_cylinder(bm, 0.08, 0.04, (lx - 0.55, ly + 0.22, lz + 1.2), segments=20)
    for spk in [0, 120, 240]:
        bmesh_box(bm, (0.04, 0.18, 0.02), (lx - 0.55, ly + 0.22, lz + 1.2))
    # Carbon paddle shifters behind wheel
    bmesh_box(bm, (0.04, 0.015, 0.18), (lx - 0.72, ly + 0.26, lz + 1.22))
    bmesh_box(bm, (0.04, 0.015, 0.18), (lx - 0.38, ly + 0.26, lz + 1.22))

# =========================================================================
# LEVEL BUILDERS (L0 - L7)
# =========================================================================

def build_interior_l0(export_path: str):
    """Level 0: Empty Plot (Surveyed Interior Craft & Ergonomics Land)."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_06_Interior_HQ_L0", None)
    bpy.context.collection.objects.link(root)

    # 1. Base excavation pad
    bm_pad = bmesh.new()
    bmesh_box(bm_pad, (36.0, 36.0, 0.3), (0.0, 0.0, -0.15))
    create_mesh_object("GEO_Interior_Plot_Excavation_Pad", bm_pad, mat_travertine_concrete(), parent=root)

    # 2. Foundation survey trench lines
    bm_trench = bmesh.new()
    bmesh_box(bm_trench, (20.5, 0.6, 0.25), (0.0, -2.0 + 10.0, 0.125))
    bmesh_box(bm_trench, (20.5, 0.6, 0.25), (0.0, -2.0 - 10.0, 0.125))
    bmesh_box(bm_trench, (0.6, 20.0, 0.25), (-10.0, -2.0, 0.125))
    bmesh_box(bm_trench, (0.6, 20.0, 0.25), (10.0, -2.0, 0.125))
    create_mesh_object("GEO_Interior_Foundation_Trench_Curbs", bm_trench, mat_travertine_concrete(), parent=root)

    # 3. Steel survey boundary pylons with tension cables
    bm_pylons = bmesh.new()
    corners = [(-17.0, -17.0), (17.0, -17.0), (17.0, 17.0), (-17.0, 17.0)]
    for cx, cy in corners:
        bmesh_cylinder(bm_pylons, 0.25, 2.2, (cx, cy, 1.1), segments=24)
        bmesh_box(bm_pylons, (0.8, 0.8, 0.3), (cx, cy, 0.15))
        for off_x, off_y in [(-0.8, -0.8), (0.8, 0.8)]:
            bmesh_cylinder(bm_pylons, 0.03, 1.8, (cx + off_x*0.5, cy + off_y*0.5, 0.9), segments=12)
    create_mesh_object("GEO_Interior_Survey_Boundary_Pylons", bm_pylons, mat_safety_yellow(), parent=root)

    # 4. Surveyor measuring workstation & tripod
    bm_tripod = bmesh.new()
    tx, ty = -6.0, 4.0
    for ang in [0, 120, 240]:
        rad = math.radians(ang)
        lx, ly = tx + 0.6 * math.cos(rad), ty + 0.6 * math.sin(rad)
        bmesh_cylinder(bm_tripod, 0.05, 1.5, ((tx + lx)/2, (ty + ly)/2, 0.75), segments=16)
    bmesh_cylinder(bm_tripod, 0.18, 0.35, (tx, ty, 1.5), segments=24)
    bmesh_cylinder(bm_tripod, 0.09, 0.45, (tx, ty, 1.7), segments=24, rot_y=math.radians(90))
    create_mesh_object("GEO_Interior_Surveyor_Theodolite", bm_tripod, mat_brushed_aluminum(), parent=root)

    # 5. Project Billboard: UNIT_06 INTERIOR & HMI HQ
    bm_board = bmesh.new()
    bx, by = 0.0, 16.0
    bmesh_box(bm_board, (0.2, 0.2, 3.2), (bx - 3.2, by, 1.6))
    bmesh_box(bm_board, (0.2, 0.2, 3.2), (bx + 3.2, by, 1.6))
    bmesh_box(bm_board, (6.8, 0.15, 2.0), (bx, by, 2.4))
    create_mesh_object("GEO_Interior_Project_Billboard", bm_board, mat_dark_slate_roof(), parent=root)

    # 6. Semantic Hitbox
    add_hitbox("HITBOX_INTERIOR_PLOT", (36.0, 36.0, 3.5), (0.0, 0.0, 1.75), parent=root)

    extras = {
        "unit_id": "INTERIOR_HQ",
        "unit_key": "UNIT_06",
        "level": 0,
        "tier": "empty_plot",
        "building_name": "Interior & HMI HQ (Surveyed Plot)",
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

def add_base_interior_l1_geometry(root):
    """
    Constructs the complete 1970s starter Interior & HMI HQ (~10.8k tris):
    - Main Seating Buck & Upholstery Studio (20m x 20m x 7.5m)
    - Full-scale wooden chassis interior buck with dual 5-flute bucket seats, D-cut steering wheel, console
    - Secondary 1:1 interior clay modeling half-buck on heavy cast-iron arm
    - Rotating vertical fabric & leather roll carousel storage tower
    - Foam sculpting & leather hide cutting tables with industrial sewing machines
    - CMF material sample swatch display wall (32 multi-texture tiles)
    - Lavender brick exterior with coral structural framing
    - North-facing sawtooth skylights with cedar roof trusses
    - Entrance vestibule & cedar trim details
    """
    # 1. Foundation Plinth (min Z = -0.30m, within ground contact spec)
    bm_plinth = bmesh.new()
    bmesh_box(bm_plinth, (36.0, 36.0, 0.3), (0.0, 0.0, -0.15))
    create_mesh_object("GEO_Interior_Foundation_Plinth", bm_plinth, mat_travertine_concrete(), parent=root, bevel_width=0.04)

    # 2. Main Studio Hall (Lavender Brick 1970s)
    bm_hall = bmesh.new()
    bmesh_box(bm_hall, (20.0, 20.0, 7.5), (0.0, -2.0, 3.75))
    bmesh_box(bm_hall, (12.0, 6.0, 5.5), (0.0, 11.0, 2.75)) # Front reception & material library
    create_mesh_object("GEO_Interior_Studio_Halls", bm_hall, mat_lavender_brick_1970(), parent=root, bevel_width=0.04)

    # 3. Coral Structural Columns & Perimeter Beltline
    bm_steel = bmesh.new()
    bmesh_box(bm_steel, (20.6, 20.6, 0.35), (0.0, -2.0, 3.8))
    bmesh_box(bm_steel, (20.6, 20.6, 0.35), (0.0, -2.0, 7.4))
    bmesh_box(bm_steel, (12.6, 6.6, 0.3), (0.0, 11.0, 5.4))
    for px in [-10.15, 10.15]:
        for py in [-11.0, -5.0, 1.0, 7.0]:
            bmesh_ibeam(bm_steel, 7.5, 0.45, 0.35, 0.04, 0.03, (px, py, 3.75), axis='Z')
    create_mesh_object("GEO_Interior_Structural_Columns", bm_steel, mat_coral_structural_beam(), parent=root)

    # 4. Interior Seating Buck on Turntable
    bm_buck = bmesh.new()
    bmesh_interior_seating_buck(bm_buck, (0.0, -2.0, 0.0))
    create_mesh_object("GEO_Interior_Seating_Buck_Turntable", bm_buck, mat_cedar_wood_decking(), parent=root)

    # 5. 1:1 Interior Styling Clay Half-Buck on Armature Pedestal
    bm_clay = bmesh.new()
    bmesh_cylinder(bm_clay, 0.45, 0.8, (-4.5, 4.0, 0.4), segments=24) # Base pillar
    bmesh_box(bm_clay, (1.8, 1.4, 0.15), (-4.5, 4.0, 0.85)) # Surface table
    # Clay dashboard and binnacle contour
    bmesh_box(bm_clay, (1.6, 0.7, 0.45), (-4.5, 4.2, 1.15))
    bmesh_cylinder(bm_clay, 0.32, 0.4, (-4.5, 4.2, 1.25), segments=20)
    # Clay steering wheel rim blank
    bmesh_tube(bm_clay, 0.22, 0.17, 0.05, (-4.5, 3.8, 1.2), segments=24)
    create_mesh_object("GEO_Interior_Clay_Cockpit_Half_Buck", bm_clay, mat_automotive_styling_clay(), parent=root)

    # 6. Rotating Vertical Fabric & Leather Roll Carousel Storage Tower
    bm_carousel = bmesh.new()
    bmesh_cylinder(bm_carousel, 0.8, 3.2, (5.0, 4.0, 1.6), segments=28) # Center spindle
    for cr in range(3):
        rz = 0.6 + cr * 1.0
        bmesh_tube(bm_carousel, 1.2, 0.8, 0.08, (5.0, 4.0, rz), segments=28)
        # 6 fabric rolls around ring
        for rol in range(6):
            theta = rol * 2 * math.pi / 6
            rx = 5.0 + 1.0 * math.cos(theta)
            ry = 4.0 + 1.0 * math.sin(theta)
            bmesh_cylinder(bm_carousel, 0.12, 0.85, (rx, ry, rz + 0.45), segments=20)
    create_mesh_object("GEO_Interior_Fabric_Roll_Carousel", bm_carousel, mat_brushed_aluminum(), parent=root)

    # 7. Foam Cutting & Leather Craft Workbenches with Sewing Machines
    bm_bench = bmesh.new()
    for bx in [-6.0, 6.0]:
        bmesh_box(bm_bench, (2.4, 5.5, 0.9), (bx, -2.0, 0.45))
        # Leather roll & foam blocks on tables
        bmesh_cylinder(bm_bench, 0.2, 1.8, (bx, -3.2, 1.05), segments=28, rot_x=math.radians(90))
        bmesh_cylinder(bm_bench, 0.16, 1.8, (bx + 0.4, -3.2, 1.05), segments=28, rot_x=math.radians(90))
        bmesh_box(bm_bench, (1.2, 1.6, 0.45), (bx, -0.5, 1.12))
        # Industrial sewing machine arm
        bmesh_box(bm_bench, (0.5, 0.8, 0.35), (bx, 1.4, 1.05))
        bmesh_cylinder(bm_bench, 0.04, 0.3, (bx, 1.6, 1.35), segments=16)
        # Thread spools
        for sp in range(3):
            bmesh_cylinder(bm_bench, 0.035, 0.15, (bx - 0.2 + sp * 0.15, 1.3, 1.3), segments=16)
    create_mesh_object("GEO_Interior_Craft_Workbenches", bm_bench, mat_cedar_wood_decking(), parent=root)

    # 8. CMF Material Sample Swatch Display Wall
    bm_swatch = bmesh.new()
    for col in range(8):
        for row in range(4):
            sx = -5.0 + col * 1.4
            sz = 1.8 + row * 0.9
            bmesh_box(bm_swatch, (1.1, 0.08, 0.7), (sx, 13.9, sz))
            bmesh_box(bm_swatch, (1.15, 0.04, 0.75), (sx, 13.88, sz)) # Shadow frame
    create_mesh_object("GEO_Interior_CMF_Swatch_Wall", bm_swatch, mat_automotive_styling_clay(), parent=root)

    # 9. North-Facing Sawtooth Roof Skylights with Cedar Trusses
    bm_sawtooth = bmesh.new()
    bm_saw_glass = bmesh.new()
    for s in range(3):
        sy = -9.0 + s * 6.0
        bmesh_box(bm_sawtooth, (18.5, 4.2, 0.25), (0.0, sy + 1.2, 8.4))
        bmesh_box(bm_saw_glass, (18.5, 0.1, 1.4), (0.0, sy - 0.9, 8.2))
        # Timber support trusses under each skylight monitor
        for tx in range(-8, 9, 4):
            bmesh_cylinder(bm_sawtooth, 0.06, 3.8, (tx, sy + 1.0, 7.8), segments=16, rot_x=math.radians(25))
    create_mesh_object("GEO_Interior_Sawtooth_Roof_Structure", bm_sawtooth, mat_dark_slate_roof(), parent=root)
    create_mesh_object("GEO_Interior_Sawtooth_Skylight_Glass", bm_saw_glass, mat_tinted_acrylic_window(), parent=root)

    # 10. Ribbon Windows & Entrance Glazing
    bm_glass = bmesh.new()
    bm_frames = bmesh.new()
    for side_x in [-10.1, 10.1]:
        bmesh_box(bm_glass, (0.1, 16.0, 2.2), (side_x, -2.0, 5.5))
        for i in range(6):
            my = -9.0 + i * 3.0
            bmesh_box(bm_frames, (0.18, 0.12, 2.3), (side_x, my, 5.5))
    bmesh_box(bm_glass, (10.0, 0.1, 1.8), (0.0, 14.05, 4.0))
    for i in range(4):
        mx = -4.5 + i * 3.0
        bmesh_box(bm_frames, (0.12, 0.18, 1.9), (mx, 14.05, 4.0))
    create_mesh_object("GEO_Interior_Studio_Ribbon_Glass", bm_glass, mat_tinted_acrylic_window(), parent=root)
    create_mesh_object("GEO_Interior_Window_Mullion_Frames", bm_frames, mat_dark_slate_roof(), parent=root)

    # 11. Semantic Hitboxes
    add_hitbox("HITBOX_INTERIOR_MAIN", (20.5, 20.5, 8.5), (0.0, -2.0, 4.25), parent=root)

def build_interior_l1(export_path: str):
    """Level 1: 1970s Seating Buck & Leather Craft Studio."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_06_Interior_HQ_L1", None)
    bpy.context.collection.objects.link(root)
    add_base_interior_l1_geometry(root)

    extras = {
        "unit_id": "INTERIOR_HQ",
        "unit_key": "UNIT_06",
        "level": 1,
        "tier": "office",
        "building_name": "Interior & HMI HQ (Seating Buck & Upholstery Studio)",
        "sub_departments": ["in_seating_buck", "in_upholstery_craft"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── LEVEL 2: ACOUSTIC NVH SOUND DEADENING ANNEX (1975-1980) ──
def add_interior_l2_geometry(root):
    """
    Level 2 additions (~6.2k tris):
    - West Flank Acoustic NVH Testing Wing (8.0m x 18.0m x 7.0m)
    - Vibrating shaker bed for cabin squeak & rattle detection with suspension clamps
    - Multi-axis piezoelectric accelerometer sensor array & signal cable trees
    - Sound absorption impedance tube apparatus & lead-sheet test racks
    - Sound-isolated operator listening booth with double-pane acoustic window
    """
    # 1. Acoustic Wing Shell (West flank: X [-18.0, -10.0], Y [-11.0, 7.0], Z [0.0, 7.0])
    bm_wing = bmesh.new()
    bmesh_box(bm_wing, (8.0, 18.0, 7.0), (-14.0, -2.0, 3.5))
    create_mesh_object("GEO_Interior_NVH_Wing_Brick", bm_wing, mat_lavender_brick_1970(), parent=root, bevel_width=0.04)

    # 2. Structural Portal Frames
    bm_beams = bmesh.new()
    bmesh_box(bm_beams, (8.5, 18.5, 0.35), (-14.0, -2.0, 3.6))
    bmesh_box(bm_beams, (8.5, 18.5, 0.35), (-14.0, -2.0, 6.9))
    for wy in [-10.0, -4.0, 2.0, 6.0]:
        bmesh_ibeam(bm_beams, 7.0, 0.45, 0.35, 0.04, 0.03, (-18.1, wy, 3.5), axis='Z')
    create_mesh_object("GEO_Interior_NVH_Structural_Beams", bm_beams, mat_coral_structural_beam(), parent=root)

    # 3. Cabin Squeak & Rattle Vibration Shaker Bed with Electromagnetic Actuators
    bm_shaker = bmesh.new()
    bmesh_box(bm_shaker, (4.5, 6.5, 0.5), (-14.0, -2.0, 0.5))
    # 4 High-fidelity electromagnetic shaker actuators with cooling fins & load cells
    for ex, ey in [(-15.5, -4.0), (-12.5, -4.0), (-15.5, 0.0), (-12.5, 0.0)]:
        bmesh_cylinder(bm_shaker, 0.38, 0.65, (ex, ey, 0.8), segments=28)
        bmesh_cylinder(bm_shaker, 0.18, 0.45, (ex, ey, 1.25), segments=24)
        bmesh_cylinder(bm_shaker, 0.48, 0.08, (ex, ey, 0.55), segments=28)
        # Cooling fins on shaker bodies
        for fin in range(6):
            bmesh_cylinder(bm_shaker, 0.42, 0.02, (ex, ey, 0.65 + fin * 0.08), segments=24)
        # Load cell transducer puck
        bmesh_cylinder(bm_shaker, 0.12, 0.08, (ex, ey, 1.52), segments=20)
    # Suspension clamp fixtures & hydraulic tie-downs
    for fx in [-15.5, -12.5]:
        bmesh_box(bm_shaker, (0.4, 0.4, 0.8), (fx, -2.0, 1.1))
        bmesh_cylinder(bm_shaker, 0.05, 0.6, (fx, -2.0, 1.5), segments=16)
        bmesh_cylinder(bm_shaker, 0.08, 0.1, (fx, -2.0, 1.8), segments=20)
    # Helical rubber vibration isolation spring pads under shaker base
    for px, py in [(-16.0, -5.0), (-12.0, -5.0), (-16.0, 1.0), (-12.0, 1.0), (-14.0, -2.0)]:
        bmesh_cylinder(bm_shaker, 0.22, 0.25, (px, py, 0.125), segments=20)
        bmesh_tube(bm_shaker, 0.26, 0.2, 0.05, (px, py, 0.2), segments=20)
    create_mesh_object("GEO_Interior_Vibration_Shaker_Bed", bm_shaker, mat_cast_iron_dark(), parent=root)

    # 4. Sound Absorption Material Test Racks & Helmholtz Impedance Tubes
    bm_racks = bmesh.new()
    for rx in [-15.5, -12.5]:
        bmesh_box(bm_racks, (1.2, 4.0, 2.2), (rx, 4.0, 1.4))
        for layer in range(5):
            bmesh_box(bm_racks, (1.1, 3.8, 0.08), (rx, 4.0, 0.5 + layer * 0.45))
            # Acoustic test swatch trays
            for sw in range(4):
                bmesh_box(bm_racks, (0.9, 0.7, 0.04), (rx, 2.7 + sw * 0.9, 0.56 + layer * 0.45))
    # Kundt's dual-channel acoustic impedance tube test apparatus
    for tube_y in [-7.5, -8.5]:
        bmesh_cylinder(bm_racks, 0.12, 3.2, (-14.0, tube_y, 1.2), segments=24, rot_x=math.radians(90))
        bmesh_cylinder(bm_racks, 0.22, 0.4, (-14.0, tube_y - 1.8, 1.2), segments=24, rot_x=math.radians(90))
        bmesh_cylinder(bm_racks, 0.05, 0.8, (-14.0, tube_y, 0.6), segments=16) # Mounting tripod
    # Helmholtz resonator acoustic sample canisters
    for can_i in range(8):
        cx = -15.8 + (can_i % 4) * 1.2
        cy = -9.8 if can_i < 4 else -10.5
        bmesh_cylinder(bm_racks, 0.14, 0.35, (cx, cy, 0.4), segments=20)
        bmesh_cylinder(bm_racks, 0.06, 0.15, (cx, cy, 0.65), segments=16)
        bmesh_tube(bm_racks, 0.16, 0.12, 0.04, (cx, cy, 0.4), segments=20)
    create_mesh_object("GEO_Interior_Acoustic_Test_Racks", bm_racks, mat_cedar_wood_decking(), parent=root)

    # 5. Operator Sound Isolation Listening Booth
    bm_booth = bmesh.new()
    bmesh_box(bm_booth, (2.6, 3.2, 2.6), (-14.0, 6.2, 1.3))
    bmesh_box(bm_booth, (2.0, 0.1, 1.2), (-14.0, 4.65, 1.5)) # Acoustic double pane window
    bmesh_box(bm_booth, (2.2, 0.18, 1.4), (-14.0, 4.65, 1.5)) # Heavy acoustic seal frame
    # Studio monitor speaker pods
    for spk_x in [-14.8, -13.2]:
        bmesh_box(bm_booth, (0.35, 0.4, 0.55), (spk_x, 5.0, 1.6))
        bmesh_cylinder(bm_booth, 0.12, 0.05, (spk_x, 4.8, 1.5), segments=20, rot_x=math.radians(90))
        bmesh_cylinder(bm_booth, 0.05, 0.04, (spk_x, 4.8, 1.75), segments=16, rot_x=math.radians(90))
    create_mesh_object("GEO_Interior_Acoustic_Sound_Booth", bm_booth, mat_travertine_concrete(), parent=root)

    # 6. Acoustic Lab Glazing
    bm_glass = bmesh.new()
    bmesh_box(bm_glass, (0.1, 14.0, 2.0), (-18.05, -2.0, 5.0))
    create_mesh_object("GEO_Interior_NVH_Ribbon_Glass", bm_glass, mat_tinted_acrylic_window(), parent=root)

def build_interior_l2(export_path: str):
    """Level 2: 1975-1980 Acoustic NVH Sound Deadening Annex."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_06_Interior_HQ_L2", None)
    bpy.context.collection.objects.link(root)
    add_base_interior_l1_geometry(root)
    add_interior_l2_geometry(root)

    extras = {
        "unit_id": "INTERIOR_HQ",
        "unit_key": "UNIT_06",
        "level": 2,
        "tier": "department",
        "building_name": "Interior & HMI HQ (Acoustic NVH Sound Deadening Annex)",
        "sub_departments": ["in_nvh_damping", "in_squeak_rattle"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── LEVEL 3: H-POINT DIGITIZER & DIGITAL COCKPIT (1980-1990) ──
def add_interior_l3_geometry(root):
    """
    Level 3 additions (~7.5k tris):
    - Second-story Ergonomics Floor Shell (14.0m x 14.0m x 4.0m)
    - 6-Axis Coordinate Measuring Machine (CMM) articulated digitizer arm with ruby stylus & granite surface plate
    - SAE J826 H-point manikin with calibrated brass weight discs
    - Micro-controller hardware-in-the-loop (HIL) digital instrument cluster test bench
    - Digital CRT cockpit test racks
    """
    # 1. Second Story Ergonomics Floor (Z = [7.5, 11.5])
    bm_floor = bmesh.new()
    bmesh_box(bm_floor, (14.0, 14.0, 4.0), (0.0, -2.0, 9.5))
    create_mesh_object("GEO_Interior_Ergonomics_Floor_Shell", bm_floor, mat_lavender_brick_1970(), parent=root, bevel_width=0.04)

    # 2. Lab Ribbon Windows
    bm_win = bmesh.new()
    bmesh_box(bm_win, (13.6, 0.1, 1.8), (0.0, 5.05, 9.8))
    bmesh_box(bm_win, (13.6, 0.1, 1.8), (0.0, -9.05, 9.8))
    bmesh_box(bm_win, (0.1, 13.6, 1.8), (-7.05, -2.0, 9.8))
    bmesh_box(bm_win, (0.1, 13.6, 1.8), (7.05, -2.0, 9.8))
    create_mesh_object("GEO_Interior_Ergonomics_Lab_Windows", bm_win, mat_tinted_acrylic_window(), parent=root)

    # 3. CMM Articulated Digitizer Arm & H-Point Measurement Station
    bm_cmm = bmesh.new()
    # Granite surface precision inspection plate with chamfered borders
    bmesh_box(bm_cmm, (3.2, 4.0, 0.4), (0.0, -2.0, 7.7))
    bmesh_box(bm_cmm, (3.4, 4.2, 0.15), (0.0, -2.0, 7.45))
    # 6-Axis articulated carbon-fiber digitizer arm joints & counterweights
    bmesh_cylinder(bm_cmm, 0.18, 2.0, (-1.2, -2.0, 8.9), segments=28)
    bmesh_cylinder(bm_cmm, 0.22, 0.3, (-1.2, -2.0, 9.9), segments=24) # Shoulder joint
    bmesh_cylinder(bm_cmm, 0.09, 1.8, (-0.4, -2.0, 9.8), segments=24, rot_y=math.radians(65))
    bmesh_cylinder(bm_cmm, 0.14, 0.25, (-0.4, -2.0, 9.8), segments=20) # Elbow joint
    bmesh_cylinder(bm_cmm, 0.07, 1.4, (0.5, -2.0, 9.2), segments=24, rot_y=math.radians(-45))
    bmesh_cylinder(bm_cmm, 0.11, 0.2, (0.5, -2.0, 9.2), segments=20) # Wrist roll joint
    # Counterweight balance cylinders
    bmesh_cylinder(bm_cmm, 0.12, 0.4, (-1.6, -2.0, 9.9), segments=20)
    # Ruby probe stylus tip & ball
    bmesh_cylinder(bm_cmm, 0.02, 0.3, (0.8, -2.0, 8.7), segments=16)
    bmesh_cylinder(bm_cmm, 0.04, 0.04, (0.8, -2.0, 8.55), segments=16)
    # 12-hole precision calibration artifact sphere stand
    bmesh_cylinder(bm_cmm, 0.08, 0.6, (1.1, -1.0, 8.2), segments=20)
    bmesh_cylinder(bm_cmm, 0.14, 0.14, (1.1, -1.0, 8.55), segments=24)
    # SAE J826 H-point manikin contour with segmented spine and brass weight discs
    bmesh_box(bm_cmm, (0.65, 0.85, 0.45), (0.0, -2.0, 8.35))
    # Segmented spine column
    for vert_i in range(5):
        bmesh_cylinder(bm_cmm, 0.08, 0.08, (0.0, -1.8, 8.5 + vert_i * 0.1), segments=18)
    # 10 Calibrated brass weight discs with slotted grip handles
    for w in range(10):
        bmesh_cylinder(bm_cmm, 0.14, 0.04, (0.0, -2.2, 8.55 + w * 0.05), segments=24)
        bmesh_box(bm_cmm, (0.04, 0.12, 0.045), (0.0, -2.2, 8.55 + w * 0.05))
    create_mesh_object("GEO_Interior_HPoint_CMM_Digitizer", bm_cmm, mat_brushed_aluminum(), parent=root)

    # 4. HIL Micro-Controller Digital Cluster Test Bench
    bm_hil = bmesh.new()
    bmesh_box(bm_hil, (3.4, 1.4, 0.9), (0.0, 3.0, 8.0))
    # 6 Modular HIL instrumentation test chassis with fan grilles & BNC ports
    for ox in [-1.2, -0.4, 0.4, 1.2]:
        bmesh_box(bm_hil, (0.7, 0.5, 0.45), (ox, 3.0, 8.7))
        # Front panel cooling fan circular cutouts
        bmesh_cylinder(bm_hil, 0.08, 0.02, (ox - 0.2, 2.74, 8.7), segments=16, rot_x=math.radians(90))
        # Oscilloscope cathode CRT screen
        bmesh_box(bm_hil, (0.25, 0.02, 0.2), (ox + 0.12, 2.74, 8.7))
        # Rotary encoder dials & BNC connectors
        for kn in range(3):
            bmesh_cylinder(bm_hil, 0.025, 0.04, (ox - 0.2 + kn * 0.15, 2.7, 8.52), segments=14)
            bmesh_cylinder(bm_hil, 0.015, 0.03, (ox - 0.2 + kn * 0.15, 2.7, 8.88), segments=12)
    create_mesh_object("GEO_Interior_Digital_Cluster_Bench", bm_hil, mat_cast_iron_dark(), parent=root)

    # 5. Digital Cockpit CRT Test Racks
    bm_racks = bmesh.new()
    for rx in [-4.5, 4.5]:
        bmesh_box(bm_racks, (1.4, 2.8, 1.8), (rx, -2.0, 8.7))
        for rk_u in range(4):
            # Rack-mounted modular CRT screens & tape drive drives
            bmesh_box(bm_racks, (0.5, 0.6, 0.35), (rx, -2.8 + rk_u * 0.55, 9.2))
            bmesh_cylinder(bm_racks, 0.04, 0.03, (rx + 0.28, -2.8 + rk_u * 0.55, 9.2), segments=14)
            bmesh_cylinder(bm_racks, 0.04, 0.03, (rx - 0.28, -2.8 + rk_u * 0.55, 9.2), segments=14)
    create_mesh_object("GEO_Interior_Digital_CRT_Racks", bm_racks, mat_dark_slate_roof(), parent=root)

def build_interior_l3(export_path: str):
    """Level 3: 1980-1990 H-Point Digitizer & Digital Cockpit Lab."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_06_Interior_HQ_L3", None)
    bpy.context.collection.objects.link(root)
    add_base_interior_l1_geometry(root)
    add_interior_l2_geometry(root)
    add_interior_l3_geometry(root)

    extras = {
        "unit_id": "INTERIOR_HQ",
        "unit_key": "UNIT_06",
        "level": 3,
        "tier": "center",
        "building_name": "Interior HQ (H-Point Digitizer & Ergonomics Center)",
        "sub_departments": ["in_hpoint_digitizer", "in_digital_cockpit"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── LEVEL 4: THERMAL COMFORT HVAC & CLIMATE CHAMBER (1990-2000) ──
def add_interior_l4_geometry(root):
    """
    Level 4 additions (~11.2k tris):
    - East Flank Thermal Comfort HVAC & Climate Chamber (8.0m x 14.0m x 7.5m)
    - Sealed insulated environmental vault door with chrome handles
    - Overhead 24-lamp infrared solar simulation heat lamp bank with faceted reflectors
    - High-capacity refrigeration chillers, glycol tanks, and insulated roof conduits
    - Anemometer 3D wind velocity sensor tree & chassis dynamometer rollers
    - Modern glass observation mezzanine with computer consoles
    """
    # 1. Climate Chamber Building Shell (East flank: X [10.0, 18.0], Y [-10.0, 4.0], Z [0.0, 7.5])
    bm_climate = bmesh.new()
    bmesh_box(bm_climate, (8.0, 14.0, 7.5), (14.0, -3.0, 3.75))
    create_mesh_object("GEO_Interior_Climate_Chamber_Shell", bm_climate, mat_travertine_concrete(), parent=root, bevel_width=0.04)

    # 2. Heavy Double-Seal Insulated Chamber Vault Door
    bm_vault = bmesh.new()
    bmesh_box(bm_vault, (0.25, 3.2, 4.2), (9.9, -3.0, 2.1))
    bmesh_box(bm_vault, (0.35, 3.4, 4.4), (9.9, -3.0, 2.1))
    bmesh_cylinder(bm_vault, 0.04, 0.8, (9.7, -1.8, 2.1), segments=16)
    bmesh_cylinder(bm_vault, 0.04, 0.8, (9.7, -4.2, 2.1), segments=16)
    # Heavy vault hinge barrels
    for hg_z in [0.8, 2.1, 3.4]:
        bmesh_cylinder(bm_vault, 0.08, 0.35, (9.9, -4.7, hg_z), segments=20)
    create_mesh_object("GEO_Interior_Climate_Vault_Door", bm_vault, mat_brushed_aluminum(), parent=root)

    # 3. Overhead Solar Simulation Infrared Heat Lamps (24 Articulated Lamps)
    bm_lamps = bmesh.new()
    for lx in [11.8, 13.2, 14.8, 16.2]:
        for ly in [-8.5, -6.5, -4.5, -2.5, -0.5, 1.5]:
            # Faceted parabolic reflector hood
            bmesh_box(bm_lamps, (1.1, 1.5, 0.28), (lx, ly, 6.2))
            bmesh_cylinder(bm_lamps, 0.04, 0.9, (lx, ly, 6.75), segments=16)
            # Infrared quartz halogen heating tube
            bmesh_cylinder(bm_lamps, 0.05, 1.1, (lx, ly, 6.05), segments=18, rot_x=math.radians(90))
            # Ball joint mount & conduit junction
            bmesh_cylinder(bm_lamps, 0.07, 0.08, (lx, ly, 6.4), segments=16)
    create_mesh_object("GEO_Interior_Solar_Simulation_Lamps", bm_lamps, mat_safety_yellow(), parent=root)

    # 4. High-Capacity Refrigeration & Glycol Chillers atop climate wing
    bm_ducts = bmesh.new()
    bmesh_box(bm_ducts, (3.5, 5.0, 1.8), (14.0, -3.0, 8.4))
    # 4 Scroll compressor cylinders with heat exchange cooling fins
    for cx, cy in [(12.8, -4.2), (15.2, -4.2), (12.8, -1.8), (15.2, -1.8)]:
        bmesh_cylinder(bm_ducts, 0.42, 1.8, (cx, cy, 9.6), segments=24)
        for cf in range(8):
            bmesh_cylinder(bm_ducts, 0.46, 0.02, (cx, cy, 9.0 + cf * 0.16), segments=24)
    # Centrifugal exhaust fans
    bmesh_cylinder(bm_ducts, 0.6, 0.35, (14.0, -3.0, 9.8), segments=28)
    bmesh_cylinder(bm_ducts, 0.12, 6.0, (14.0, 1.0, 8.2), segments=20, rot_x=math.radians(90))
    create_mesh_object("GEO_Interior_HVAC_Climate_Chillers", bm_ducts, mat_brushed_aluminum(), parent=root)

    # 5. Modern Glass Curtain Wall Viewing Mezzanine
    bm_curtain = bmesh.new()
    bmesh_box(bm_curtain, (18.0, 3.5, 4.5), (0.0, 6.0, 6.5))
    create_mesh_object("GEO_Interior_Mezzanine_Curtain_Glass", bm_curtain, mat_modern_curtain_glass(), parent=root)

def build_interior_l4(export_path: str):
    """Level 4: 1990-2000 Thermal Comfort HVAC & Climate Chamber."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_06_Interior_HQ_L4", None)
    bpy.context.collection.objects.link(root)
    add_base_interior_l1_geometry(root)
    add_interior_l2_geometry(root)
    add_interior_l3_geometry(root)
    add_interior_l4_geometry(root)

    extras = {
        "unit_id": "INTERIOR_HQ",
        "unit_key": "UNIT_06",
        "level": 4,
        "tier": "advanced_hq",
        "building_name": "Interior HQ (Thermal Comfort Climate Chamber Center)",
        "sub_departments": ["in_climate_chamber", "in_hvac_airflow"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── LEVEL 5: OLED CURVED COCKPIT & MMI INTERFACE (2000-2010) ──
def add_interior_l5_geometry(root):
    """
    Level 5 additions (~13.8k tris):
    - High-Tech Curved OLED Glass Cockpit Center
    - Floating curved dual-screen OLED instrument binnacle displays
    - Optical Head-Up Display (HUD) projection test wells with collimating mirrors
    - Cantilevered bridge console with crystal rotary MMI puck and monostable shifters
    - Photovoltaic solar roof canopy with satin steel pillars
    """
    # 1. OLED Cockpit Pavilion Extension (North: X [-8.0, 8.0], Y [8.0, 18.0], Z [0.0, 7.5])
    bm_pavilion = bmesh.new()
    bmesh_box(bm_pavilion, (16.0, 10.0, 7.5), (0.0, 13.0, 3.75))
    create_mesh_object("GEO_Interior_OLED_Pavilion_Shell", bm_pavilion, mat_satin_matte_white(), parent=root, bevel_width=0.04)

    # 2. Ultra-Wide Curved OLED Displays & Full Prototype Seating Rigs (3 Cockpit Rigs)
    bm_oled = bmesh.new()
    for cx in [-5.0, 0.0, 5.0]:
        # Rig foundation pedestal
        bmesh_box(bm_oled, (2.6, 3.0, 0.4), (cx, 13.0, 0.2))
        # Curved dual OLED ribbon display (14.5" binnacle + central display)
        bmesh_cylinder(bm_oled, 1.5, 0.45, (cx, 13.8, 1.15), segments=36)
        # AR-HUD projection optical glass well with beam combiner
        bmesh_box(bm_oled, (0.7, 0.55, 0.05), (cx, 13.4, 1.25))
        bmesh_cylinder(bm_oled, 0.08, 0.12, (cx, 13.3, 0.95), segments=20)
        # Cantilevered bridge console
        bmesh_box(bm_oled, (0.42, 1.6, 0.35), (cx, 12.4, 0.65))
        # Crystal rotary MMI puck with knurled rim
        bmesh_cylinder(bm_oled, 0.09, 0.05, (cx, 12.2, 0.85), segments=28)
        bmesh_tube(bm_oled, 0.1, 0.085, 0.03, (cx, 12.2, 0.86), segments=28)
        # Monostable shift-by-wire toggle
        bmesh_box(bm_oled, (0.06, 0.08, 0.08), (cx, 12.5, 0.86))
        # Micro-louver acoustic climate vent ribbon (16 micro slats)
        for slt in range(16):
            slt_x = cx - 0.6 + slt * 0.08
            bmesh_box(bm_oled, (0.06, 0.02, 0.08), (slt_x, 13.6, 0.92))
        # Steering column & D-cut steering wheel with paddle shifters
        bmesh_cylinder(bm_oled, 0.04, 0.65, (cx - 0.45, 13.2, 0.88), segments=20, rot_x=math.radians(-25))
        bmesh_tube(bm_oled, 0.22, 0.17, 0.04, (cx - 0.45, 13.0, 1.15), segments=32)
        # Sport bucket seat on rig
        bmesh_box(bm_oled, (0.65, 0.7, 0.22), (cx - 0.45, 12.4, 0.52))
        bmesh_box(bm_oled, (0.6, 0.2, 0.85), (cx - 0.45, 12.0, 1.05))
        bmesh_cylinder(bm_oled, 0.015, 0.3, (cx - 0.55, 11.98, 1.55), segments=14)
        bmesh_cylinder(bm_oled, 0.015, 0.3, (cx - 0.35, 11.98, 1.55), segments=14)
        bmesh_box(bm_oled, (0.35, 0.14, 0.22), (cx - 0.45, 11.95, 1.7))
    create_mesh_object("GEO_Interior_Curved_OLED_Cockpits", bm_oled, mat_modern_curtain_glass(), parent=root)

    # 3. Photovoltaic Solar Roof Canopy (Z = 12.2) with Mounting Rails & Inverters
    bm_solar = bmesh.new()
    bmesh_box(bm_solar, (26.0, 24.0, 0.25), (-1.0, -2.0, 12.2))
    for r in range(10):
        sy = -12.0 + r * 2.4
        bmesh_box(bm_solar, (25.0, 2.1, 0.08), (-1.0, sy, 12.38))
        # Solar panel extruded borders
        for c in range(-10, 11, 4):
            bmesh_box(bm_solar, (3.6, 1.9, 0.04), (c, sy, 12.44))
            bmesh_box(bm_solar, (0.3, 0.2, 0.1), (c, sy, 12.28)) # Micro-inverter junction box
    for sx in [-13.0, 0.0, 11.0]:
        for sy in [-11.0, -2.0, 7.0]:
            bmesh_cylinder(bm_solar, 0.12, 4.5, (sx, sy, 10.0), segments=20)
            bmesh_cylinder(bm_solar, 0.25, 0.15, (sx, sy, 12.1), segments=20) # Column capital flange
    create_mesh_object("GEO_Interior_Photovoltaic_Solar_Canopy", bm_solar, mat_modern_curtain_glass(), parent=root)

def build_interior_l5(export_path: str):
    """Level 5: 2000-2010 OLED Curved Cockpit & MMI Center."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_06_Interior_HQ_L5", None)
    bpy.context.collection.objects.link(root)
    add_base_interior_l1_geometry(root)
    add_interior_l2_geometry(root)
    add_interior_l3_geometry(root)
    add_interior_l4_geometry(root)
    add_interior_l5_geometry(root)

    extras = {
        "unit_id": "INTERIOR_HQ",
        "unit_key": "UNIT_06",
        "level": 5,
        "tier": "world_class_hq",
        "building_name": "Interior HQ (Curved OLED Glass Cockpit Center)",
        "sub_departments": ["in_oled_cockpit", "in_mmi_hmi_interfaces"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── LEVEL 6: BIOMETRIC SENSORY SIMULATION & HEMI-ANECHOIC (2010-2020) ──
def add_interior_l6_geometry(root):
    """
    Level 6 additions (~16.2k tris):
    - Massive Soundproof Hemi-Anechoic Acoustic Wedge Chamber (14m x 14m x 9m)
    - 16x16 grid of 3D acoustic foam pyramid wedges on 5 surfaces (1,280 wedges total)
    - Full vehicle chassis test platform on pneumatic isolation bladders inside the anechoic chamber
    - Binaural dummy head & acoustic measurement array trees
    - Cyan LED architectural accent lighting
    """
    # 1. Hemi-Anechoic Chamber Shell (South-West: X [-18.0, -4.0], Y [-18.0, -4.0], Z [0.0, 9.0])
    bm_anechoic = bmesh.new()
    bmesh_box(bm_anechoic, (14.0, 14.0, 9.0), (-11.0, -11.0, 4.5))
    create_mesh_object("GEO_Interior_Anechoic_Chamber_Shell", bm_anechoic, mat_satin_matte_white(), parent=root, bevel_width=0.05)

    # 2. 3D Acoustic Foam Pyramid Wedges lining all 4 interior walls & ceiling (16x16 grid on 5 walls = 1,280 wedges)
    bm_wedges = bmesh.new()
    # East wall facing inward (-X)
    bmesh_acoustic_pyramids(bm_wedges, 16, 16, 0.48, 0.55, (-4.1, -11.0, 4.5), normal_axis='X', flip_normal=True)
    # West wall facing inward (+X)
    bmesh_acoustic_pyramids(bm_wedges, 16, 16, 0.48, 0.55, (-17.9, -11.0, 4.5), normal_axis='X', flip_normal=False)
    # North wall facing inward (-Y)
    bmesh_acoustic_pyramids(bm_wedges, 16, 16, 0.48, 0.55, (-11.0, -4.1, 4.5), normal_axis='Y', flip_normal=True)
    # South wall facing inward (+Y)
    bmesh_acoustic_pyramids(bm_wedges, 16, 16, 0.48, 0.55, (-11.0, -17.9, 4.5), normal_axis='Y', flip_normal=False)
    # Ceiling facing downward (-Z)
    bmesh_acoustic_pyramids(bm_wedges, 16, 16, 0.48, 0.55, (-11.0, -11.0, 8.8), normal_axis='Z', flip_normal=True)
    create_mesh_object("GEO_Interior_Acoustic_Foam_Pyramid_Wedges", bm_wedges, mat_cast_iron_dark(), parent=root)

    # 3. Vehicle Chassis Acoustic Test Mule inside Anechoic Chamber on Air Bladders & Dyno Rollers
    bm_mule = bmesh.new()
    bmesh_box(bm_mule, (2.6, 5.0, 0.25), (-11.0, -11.0, 0.8))
    # 4 Chassis dynamometer twin rollers under tires
    for rx, ry in [(-12.4, -13.0), (-9.6, -13.0), (-12.4, -9.0), (-9.6, -9.0)]:
        bmesh_cylinder(bm_mule, 0.22, 0.45, (rx, ry - 0.2, 0.2), segments=20, rot_y=math.radians(90))
        bmesh_cylinder(bm_mule, 0.22, 0.45, (rx, ry + 0.2, 0.2), segments=20, rot_y=math.radians(90))
        # Ventilated brake rotor & caliper
        bmesh_tube(bm_mule, 0.18, 0.1, 0.04, (rx, ry, 0.5), segments=20)
        bmesh_box(bm_mule, (0.08, 0.12, 0.14), (rx, ry + 0.12, 0.5))
    for bx, by in [(-12.0, -13.0), (-10.0, -13.0), (-12.0, -9.0), (-10.0, -9.0)]:
        bmesh_cylinder(bm_mule, 0.35, 0.45, (bx, by, 0.45), segments=24) # Air bladder isolators
    bmesh_cylinder(bm_mule, 0.05, 1.8, (-11.0, -11.0, 1.8), segments=16) # Measurement mast
    create_mesh_object("GEO_Interior_Anechoic_Chassis_Test_Mule", bm_mule, mat_brushed_aluminum(), parent=root)

    # 4. Binaural Dummy Head & Acoustic Measurement Array Trees
    bm_mic = bmesh.new()
    # Torso & artificial head with molded pinnae
    bmesh_cylinder(bm_mic, 0.18, 0.55, (-11.0, -11.0, 1.3), segments=24) # Torso
    bmesh_cylinder(bm_mic, 0.08, 1.8, (-11.0, -11.0, 0.9), segments=24) # Tripod mast
    bmesh_cylinder(bm_mic, 0.14, 0.28, (-11.0, -11.0, 1.85), segments=28) # Head
    bmesh_cylinder(bm_mic, 0.04, 0.04, (-11.16, -11.0, 1.85), segments=16, rot_y=math.radians(90)) # Left pinna
    bmesh_cylinder(bm_mic, 0.04, 0.04, (-10.84, -11.0, 1.85), segments=16, rot_y=math.radians(90)) # Right pinna
    for mx, my in [(-13.0, -13.0), (-9.0, -13.0), (-13.0, -9.0), (-9.0, -9.0)]:
        bmesh_cylinder(bm_mic, 0.04, 1.6, (mx, my, 0.8), segments=16)
        bmesh_cylinder(bm_mic, 0.06, 0.15, (mx, my, 1.65), segments=20)
        # Cross boom microphone arms
        bmesh_cylinder(bm_mic, 0.02, 0.8, (mx, my, 1.65), segments=12, rot_x=math.radians(90))
    create_mesh_object("GEO_Interior_Acoustic_Microphone_Array", bm_mic, mat_brushed_aluminum(), parent=root)

    # 5. Cyan LED Accent Rings
    bm_led = bmesh.new()
    bmesh_box(bm_led, (14.2, 14.2, 0.2), (-11.0, -11.0, 4.5))
    bmesh_box(bm_led, (14.2, 14.2, 0.2), (-11.0, -11.0, 8.8))
    create_mesh_object("GEO_Interior_LED_Accent_Bands", bm_led, mat_cryo_cyan_emissive(), parent=root)

    # 6. Semantic Hitbox for Anechoic Chamber
    add_hitbox("HITBOX_INTERIOR_ANECHOIC", (15.0, 15.0, 10.0), (-11.0, -11.0, 5.0), parent=root)

def build_interior_l6(export_path: str):
    """Level 6: 2010-2020 Biometric Sensory Simulation & Hemi-Anechoic."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_06_Interior_HQ_L6", None)
    bpy.context.collection.objects.link(root)
    add_base_interior_l1_geometry(root)
    add_interior_l2_geometry(root)
    add_interior_l3_geometry(root)
    add_interior_l4_geometry(root)
    add_interior_l5_geometry(root)
    add_interior_l6_geometry(root)

    extras = {
        "unit_id": "INTERIOR_HQ",
        "unit_key": "UNIT_06",
        "level": 6,
        "tier": "innovation_campus",
        "building_name": "Interior HQ (Biometric Sensory & Hemi-Anechoic Center)",
        "sub_departments": ["in_hemi_anechoic", "in_biometric_sensory"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── LEVEL 7: AUTONOMOUS LIVING LOUNGE & ZERO-G SYNTHESIS (2020s+) ──
def add_interior_l7_geometry(root):
    """
    Level 7 additions (~21.5k tris):
    - Aerodynamic Cantilevered Living Lounge Master Pavilion
    - 6 Swivel zero-gravity executive captain chairs with integrated armrest touchscreens
    - Central holographic projection table with cyan holographic emitter puck
    - 5-Story Quantum Cabin AI HMI Synthesis Tower with parametric louvers & glass fins
    - Soaring aerodynamic glass canopy spanning the campus
    - Glazed skybridge connecting pavilion to tower
    - Autonomous drone landing pad atop tower
    """
    # 1. Quantum Cabin AI Synthesis Tower (East Plot: X [8.0, 17.0], Y [8.0, 17.0], Z [0.0, 18.0])
    bm_tower = bmesh.new()
    bmesh_box(bm_tower, (9.0, 9.0, 18.0), (12.5, 12.5, 9.0))
    create_mesh_object("GEO_Interior_Quantum_HMI_Tower", bm_tower, mat_satin_matte_white(), parent=root, bevel_width=0.06)

    # 2. Tower Glazed Curtain Walls with Holographic Cyan Tint & Vertical Glass Fins
    bm_tow_glass = bmesh.new()
    for fl in range(5):
        fz = 2.5 + fl * 3.5
        bmesh_box(bm_tow_glass, (9.2, 8.0, 1.8), (12.5, 12.5, fz))
        bmesh_box(bm_tow_glass, (8.0, 9.2, 1.8), (12.5, 12.5, fz))
        # Vertical aerodynamic glass mullion fins
        for fin_i in range(8):
            fin_x = 8.5 + fin_i * 1.15
            bmesh_box(bm_tow_glass, (0.05, 0.35, 2.2), (fin_x, 8.0, fz))
            bmesh_box(bm_tow_glass, (0.05, 0.35, 2.2), (fin_x, 17.0, fz))
    create_mesh_object("GEO_Interior_Tower_Curtain_Glass", bm_tow_glass, mat_modern_curtain_glass(), parent=root)

    # 3. Parametric Sunshade Louvers on Tower
    bm_louv = bmesh.new()
    for fl in range(5):
        fz = 2.5 + fl * 3.5
        for edge_x in [-4.6, 4.6]:
            for edge_y in [-4.6, 4.6]:
                bmesh_cylinder(bm_louv, 0.08, 3.5, (12.5 + edge_x, 12.5 + edge_y, fz), segments=16)
        bmesh_box(bm_louv, (9.6, 0.2, 0.1), (12.5, 12.5 + 4.6, fz + 0.8))
        bmesh_box(bm_louv, (9.6, 0.2, 0.1), (12.5, 12.5 - 4.6, fz + 0.8))
    create_mesh_object("GEO_Interior_Tower_Parametric_Louvers", bm_louv, mat_coral_structural_beam(), parent=root)

    # 4. Aerodynamic Cantilevered Living Lounge Master Canopy (Z = 16.5)
    bm_canopy = bmesh.new()
    bmesh_box(bm_canopy, (32.0, 34.0, 0.5), (0.0, 0.0, 16.5))
    bmesh_box(bm_canopy, (32.4, 34.4, 0.2), (0.0, 0.0, 16.8))
    for sx in [-13.0, 0.0, 11.0]:
        for sy in [-13.0, 0.0, 13.0]:
            bmesh_cylinder(bm_canopy, 0.18, 8.0, (sx, sy, 12.5), segments=24)
            bmesh_cylinder(bm_canopy, 0.04, 6.5, (sx + 2.0, sy + 2.0, 14.5), segments=12, rot_x=math.radians(25))
    create_mesh_object("GEO_Interior_Aerodynamic_Glass_Canopy", bm_canopy, mat_modern_curtain_glass(), parent=root)

    # 5. Zero-Gravity Swivel Executive Captain Lounge (6 Swivel Chairs + Hologram Table)
    bm_lounge = bmesh.new()
    for ax, ay in [(-3.5, 11.0), (3.5, 11.0), (-3.5, 15.0), (3.5, 15.0), (0.0, 9.5), (0.0, 16.5)]:
        # Swivel circular pedestal with chrome trim
        bmesh_cylinder(bm_lounge, 0.45, 0.15, (ax, ay, 0.5), segments=28)
        bmesh_cylinder(bm_lounge, 0.08, 0.35, (ax, ay, 0.7), segments=20)
        # Deep viscoelastic contour seat cushion with 5-flute lofting
        bmesh_box(bm_lounge, (0.85, 0.9, 0.3), (ax, ay, 1.0))
        for f in range(5):
            fy = ay - 0.35 + f * 0.15
            bmesh_cylinder(bm_lounge, 0.03, 0.7, (ax, fy, 1.16), segments=16, rot_y=math.radians(90))
        # Reclined backrest with integrated lumbar support & side bolsters
        bmesh_box(bm_lounge, (0.8, 0.25, 0.95), (ax, ay - 0.35, 1.5))
        bmesh_box(bm_lounge, (0.15, 0.25, 0.9), (ax - 0.35, ay - 0.32, 1.5))
        bmesh_box(bm_lounge, (0.15, 0.25, 0.9), (ax + 0.35, ay - 0.32, 1.5))
        # Cervical pillow headrest with twin stanchions
        bmesh_cylinder(bm_lounge, 0.015, 0.25, (ax - 0.12, ay - 0.38, 2.0), segments=14)
        bmesh_cylinder(bm_lounge, 0.015, 0.25, (ax + 0.12, ay - 0.38, 2.0), segments=14)
        bmesh_box(bm_lounge, (0.45, 0.2, 0.25), (ax, ay - 0.4, 2.15))
        # Armrests with integrated touchscreen OLED tablets & cupholders
        bmesh_box(bm_lounge, (0.14, 0.7, 0.12), (ax - 0.45, ay, 1.25))
        bmesh_box(bm_lounge, (0.14, 0.7, 0.12), (ax + 0.45, ay, 1.25))
        bmesh_box(bm_lounge, (0.1, 0.25, 0.02), (ax - 0.45, ay + 0.15, 1.32))
        bmesh_cylinder(bm_lounge, 0.04, 0.06, (ax + 0.45, ay + 0.2, 1.28), segments=16)
    # Central round holographic interactive table
    bmesh_cylinder(bm_lounge, 1.2, 0.15, (0.0, 13.0, 0.8), segments=36)
    bmesh_cylinder(bm_lounge, 0.2, 0.7, (0.0, 13.0, 0.45), segments=24)
    # Holographic cyan emitter puck with optical rings
    bmesh_cylinder(bm_lounge, 0.35, 0.08, (0.0, 13.0, 0.92), segments=32)
    bmesh_tube(bm_lounge, 0.45, 0.38, 0.04, (0.0, 13.0, 0.94), segments=32)
    create_mesh_object("GEO_Interior_ZeroGravity_Lounge_Chairs", bm_lounge, mat_cedar_wood_decking(), parent=root)

    # 6. Glazed Skybridge connecting Main Pavilion to Tower
    bm_bridge = bmesh.new()
    bx, by, bz = 6.0, 12.5, 8.5
    dx, dy = 6.0, 0.0
    dist = math.sqrt(dx*dx + dy*dy)
    bmesh_box(bm_bridge, (dist, 2.2, 2.6), (bx, by, bz))
    create_mesh_object("GEO_Interior_Glazed_Skybridge", bm_bridge, mat_modern_curtain_glass(), parent=root)

    # 7. Autonomous Drone Landing Pad atop Quantum Tower
    bm_pad = bmesh.new()
    bmesh_box(bm_pad, (8.0, 8.0, 0.2), (12.5, 12.5, 18.1))
    bmesh_tube(bm_pad, 3.4, 3.0, 0.08, (12.5, 12.5, 18.25), segments=48)
    bmesh_cylinder(bm_pad, 0.8, 0.08, (12.5, 12.5, 18.25), segments=32)
    create_mesh_object("GEO_Interior_Drone_Landing_Pad", bm_pad, mat_safety_yellow(), parent=root)

    # 8. Hitbox for Quantum Tower
    add_hitbox("HITBOX_INTERIOR_TOWER", (10.0, 10.0, 19.0), (12.5, 12.5, 9.5), parent=root)

def build_interior_l7(export_path: str):
    """Level 7: 2020s+ Autonomous Living Lounge & Zero-G Cabin Synthesis."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_06_Interior_HQ_L7", None)
    bpy.context.collection.objects.link(root)
    add_base_interior_l1_geometry(root)
    add_interior_l2_geometry(root)
    add_interior_l3_geometry(root)
    add_interior_l4_geometry(root)
    add_interior_l5_geometry(root)
    add_interior_l6_geometry(root)
    add_interior_l7_geometry(root)

    extras = {
        "unit_id": "INTERIOR_HQ",
        "unit_key": "UNIT_06",
        "level": 7,
        "tier": "hypermodern_campus",
        "building_name": "Interior HQ (Autonomous Living Lounge & Zero-G Synthesis)",
        "sub_departments": ["in_quantum_cabin_ai", "in_zero_gravity_lounge", "in_holographic_hmi"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# =========================================================================
# BATCH GENERATION & AUDIT ENTRYPOINT
# =========================================================================
def generate_all_interior_levels(output_dir: str):
    os.makedirs(output_dir, exist_ok=True)
    results = {}
    
    levels = [
        (0, "hq_06_interior_l0.glb", build_interior_l0),
        (1, "hq_06_interior_l1.glb", build_interior_l1),
        (2, "hq_06_interior_l2.glb", build_interior_l2),
        (3, "hq_06_interior_l3.glb", build_interior_l3),
        (4, "hq_06_interior_l4.glb", build_interior_l4),
        (5, "hq_06_interior_l5.glb", build_interior_l5),
        (6, "hq_06_interior_l6.glb", build_interior_l6),
        (7, "hq_06_interior_l7.glb", build_interior_l7),
    ]
    
    print("\n" + "#" * 70)
    print(" AUTO TYCOON CAMPUS HQ - UNIT_06 INTERIOR & HMI HQ GENERATION")
    print(f" Target Output Directory: {output_dir}")
    print("#" * 70)
    
    all_passed = True
    for lvl, filename, builder_func in levels:
        out_path = os.path.join(output_dir, filename)
        tier_name = CAMPUS_TRIANGLE_BUDGETS[lvl]["tier"]
        print(f"\n>>> Generating UNIT_06 Level {lvl} ({tier_name}) -> {filename}...")
        
        success = builder_func(out_path)
        passed, report = audit_scene("UNIT_06_INTERIOR", lvl, bpy)
        print_audit_summary(report)
        
        file_size = os.path.getsize(out_path) if os.path.exists(out_path) else 0
        tris = report["total_triangles"]
        print(f"    Export: {success} | Size: {file_size / 1024:.1f} KB | Triangles: {tris:,}")
        results[lvl] = {"file": filename, "passed": passed, "size_kb": file_size / 1024.0, "triangles": tris}
        if not passed:
            all_passed = False
            
    print("\n" + "=" * 70)
    print(" UNIT_06 INTERIOR HQ SUMMARY AUDIT TABLE")
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
    
    generate_all_interior_levels(target_dir)
