"""
AUTO TYCOON CAMPUS HQ - UNIT_04 VEHICLE DESIGN HQ GENERATOR (PHASES 81-88)

Generates all 8 progression levels (L0-L7) for UNIT_04:
- Footprint: 36m x 36m (Master Plot)
- Architectural Identity: Creative studio character — north-facing sawtooth skylights,
  clay modeling bays, cedar viewing terrace, CMF library, glass reveal rotunda,
  and cantilevered parametric bio-design AI pavilion.

Follows the UNIT_01 Proven Production Standard:
- 100% deterministic GEO_* and HITBOX_* naming
- Parameterized BMesh modeling
- Strict triangle budgets (L0: 1k-3k, L1: 8k-12k, L2: 14k-18k, L3: 20k-26k,
  L4: 30k-38k, L5: 40k-55k, L6: 50k-65k, L7: 60k-80k)
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
    mat_automotive_styling_clay,
    mat_cedar_wood_decking,
    mat_satin_matte_white,
    mat_pearl_concept_car_paint,
    mat_holographic_cyan_glow,
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

def bmesh_sawtooth_skylight(bm, length: float, width: float, height: float, loc: tuple):
    lx, ly, lz = loc
    half_l, half_w = length / 2, width / 2
    v_b0 = bm.verts.new((lx - half_l, ly - half_w, lz))
    v_b1 = bm.verts.new((lx + half_l, ly - half_w, lz))
    v_b2 = bm.verts.new((lx + half_l, ly + half_w, lz))
    v_b3 = bm.verts.new((lx - half_l, ly + half_w, lz))
    
    v_r0 = bm.verts.new((lx - half_l, ly + half_w * 0.75, lz + height))
    v_r1 = bm.verts.new((lx + half_l, ly + half_w * 0.75, lz + height))
    
    bm.faces.new([v_b0, v_b1, v_r1, v_r0])
    bm.faces.new([v_r0, v_r1, v_b2, v_b3])
    bm.faces.new([v_b0, v_r0, v_b3])
    bm.faces.new([v_b1, v_b2, v_r1])

def bmesh_deck_planks(bm, length: float, width: float, num_planks: int, loc: tuple):
    lx, ly, lz = loc
    plank_w = width / num_planks
    for p in range(num_planks):
        py = -width/2 + p * plank_w + plank_w/2
        bmesh_box(bm, (length * 0.98, plank_w * 0.90, 0.04), (lx, ly + py, lz))

def bmesh_standing_seam_roof(bm, length: float, width: float, num_seams: int, loc: tuple, height=0.08):
    lx, ly, lz = loc
    seam_spacing = length / num_seams
    for s in range(num_seams):
        sx = -length/2 + s * seam_spacing + seam_spacing/2
        bmesh_box(bm, (0.05, width, height), (lx + sx, ly, lz))

def bmesh_window_mullions_matrix(bm, width: float, height: float, rows: int, cols: int, loc: tuple):
    lx, ly, lz = loc
    col_w = width / cols
    row_h = height / rows
    bmesh_box(bm, (width, 0.12, 0.06), (lx, ly, lz - height/2))
    bmesh_box(bm, (width, 0.12, 0.06), (lx, ly, lz + height/2))
    bmesh_box(bm, (0.06, 0.12, height), (lx - width/2, ly, lz))
    bmesh_box(bm, (0.06, 0.12, height), (lx + width/2, ly, lz))
    for c in range(1, cols):
        cx = -width/2 + c * col_w
        bmesh_box(bm, (0.05, 0.10, height), (lx + cx, ly, lz))
    for r in range(1, rows):
        rz = -height/2 + r * row_h
        bmesh_box(bm, (width, 0.10, 0.05), (lx, ly, lz + rz))

def bmesh_drafting_table(bm, loc: tuple):
    lx, ly, lz = loc
    # Angled drawing surface
    bmesh_box(bm, (2.2, 1.4, 0.08), (lx, ly, lz + 0.9))
    # Parallel-motion drawing bar
    bmesh_box(bm, (2.3, 0.08, 0.03), (lx, ly, lz + 0.95))
    # A-frame legs
    bmesh_cylinder(bm, 0.04, 1.4, (lx - 0.9, ly - 0.4, lz + 0.4), segments=12)
    bmesh_cylinder(bm, 0.04, 1.4, (lx - 0.9, ly + 0.4, lz + 0.4), segments=12)
    bmesh_cylinder(bm, 0.04, 1.4, (lx + 0.9, ly - 0.4, lz + 0.4), segments=12)
    bmesh_cylinder(bm, 0.04, 1.4, (lx + 0.9, ly + 0.4, lz + 0.4), segments=12)
    # Drafting lamp
    bmesh_cylinder(bm, 0.02, 0.6, (lx - 0.8, ly + 0.5, lz + 1.2), segments=8, rot_x=radians(30))
    bmesh_cylinder(bm, 0.10, 0.15, (lx - 0.8, ly + 0.7, lz + 1.4), segments=12)
    # Drafting stool
    bmesh_cylinder(bm, 0.22, 0.08, (lx, ly - 0.8, lz + 0.6), segments=16)
    bmesh_cylinder(bm, 0.04, 0.6, (lx, ly - 0.8, lz + 0.3), segments=12)
    for si in range(5):
        theta = si * 2 * math.pi / 5
        bmesh_box(bm, (0.04, 0.25, 0.04), (lx + 0.18 * math.cos(theta), ly - 0.8 + 0.18 * math.sin(theta), lz + 0.05))

def bmesh_theater_chair(bm, loc: tuple):
    lx, ly, lz = loc
    # Contoured seat cushion
    bmesh_box(bm, (0.55, 0.55, 0.12), (lx, ly, lz + 0.45))
    # Contoured backrest
    bmesh_box(bm, (0.55, 0.12, 0.65), (lx, ly - 0.22, lz + 0.78))
    # Dual armrests
    bmesh_box(bm, (0.08, 0.45, 0.06), (lx - 0.31, ly, lz + 0.62))
    bmesh_box(bm, (0.08, 0.45, 0.06), (lx + 0.31, ly, lz + 0.62))
    # Pedestal support
    bmesh_cylinder(bm, 0.05, 0.4, (lx, ly, lz + 0.2), segments=12)

def bmesh_car_silhouette_buck(bm, length: float, width: float, height: float, loc: tuple, high_detail=False):
    lx, ly, lz = loc
    # Low aerodynamic body form
    bmesh_box(bm, (width, length, height * 0.45), (lx, ly, lz + height * 0.22))
    # Tapered sports car cabin / greenhouse
    bmesh_box(bm, (width * 0.75, length * 0.45, height * 0.45), (lx, ly - length * 0.05, lz + height * 0.65))
    # Front hood slope wedge
    bmesh_box(bm, (width * 0.88, length * 0.32, height * 0.28), (lx, ly + length * 0.3, lz + height * 0.25))
    # Rear ducktail spoiler
    bmesh_box(bm, (width * 0.82, length * 0.08, height * 0.12), (lx, ly - length * 0.44, lz + height * 0.52))
    
    if high_detail:
        # Flared front/rear wheel arches and 4 wheels
        wheel_r = height * 0.28
        wheel_w = width * 0.18
        for wx in [-width * 0.48, width * 0.48]:
            for wy in [-length * 0.32, length * 0.32]:
                bmesh_cylinder(bm, wheel_r, wheel_w, (lx + wx, ly + wy, lz + wheel_r), segments=36, rot_y=radians(90))
                # Brake rotor disc inside
                bmesh_cylinder(bm, wheel_r * 0.72, wheel_w * 0.3, (lx + wx * 0.85, ly + wy, lz + wheel_r), segments=24, rot_y=radians(90))
        # Front aerodynamic splitter with endplate winglets
        bmesh_box(bm, (width * 1.05, length * 0.12, 0.04), (lx, ly + length * 0.50, lz + 0.08))
        bmesh_box(bm, (0.04, length * 0.14, 0.18), (lx - width * 0.52, ly + length * 0.48, lz + 0.15))
        bmesh_box(bm, (0.04, length * 0.14, 0.18), (lx + width * 0.52, ly + length * 0.48, lz + 0.15))
        # Rear aerodynamic diffuser with 4 vertical strakes
        bmesh_box(bm, (width * 0.90, length * 0.15, 0.04), (lx, ly - length * 0.50, lz + 0.12))
        for sx in [-0.6, -0.2, 0.2, 0.6]:
            bmesh_box(bm, (0.03, length * 0.15, 0.16), (lx + sx, ly - length * 0.50, lz + 0.18))

def add_hitbox(name: str, size: tuple, loc: tuple, parent=None):
    bm = bmesh.new()
    bmesh_box(bm, size, loc)
    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    obj["is_hitbox"] = True
    obj["unit_id"] = "UNIT_04"
    obj.display_type = 'WIRE'
    obj.data.materials.append(mat_hitbox_invisible())
    if parent:
        obj.parent = parent
    bpy.context.collection.objects.link(obj)
    return obj

# =========================================================================
# LEVEL 0: SURVEYED CREATIVE PLOT (36m x 36m) [1k-3k tris]
# =========================================================================
def build_design_l0(export_path: str):
    reset_scene()
    root = bpy.data.objects.new("UNIT_04_Design_HQ_L0", None)
    bpy.context.collection.objects.link(root)
    
    W, L = 36.0, 36.0
    half_w, half_l = W / 2, L / 2
    
    # Ground pad plinth with chamfer
    bm_pad = bmesh.new()
    bmesh_box(bm_pad, (W, L, 0.35), (0, 0, 0.17))
    create_mesh_object("PLOT_04_GROUND_PAD", bm_pad, mat_travertine_concrete(), root, bevel_width=0.04)
    
    # Topography survey grid (16x16 grid pins and soil trenches)
    bm_grid = bmesh.new()
    for gx in range(-14, 15, 4):
        for gy in range(-14, 15, 4):
            bmesh_box(bm_grid, (0.35, 0.35, 0.12), (gx, gy, 0.40))
            bmesh_cylinder(bm_grid, 0.04, 0.6, (gx, gy, 0.65), segments=12)
    create_mesh_object("PLOT_04_TOPOGRAPHY_GRID", bm_grid, mat_construction_orange(), root)
    
    # Access walkway stub
    bm_road = bmesh.new()
    bmesh_box(bm_road, (10.0, 10.0, 0.12), (0, -half_l + 5.0, 0.38))
    bmesh_box(bm_road, (0.35, 10.0, 0.22), (-5.1, -half_l + 5.0, 0.44))
    bmesh_box(bm_road, (0.35, 10.0, 0.22), (5.1, -half_l + 5.0, 0.44))
    create_mesh_object("PLOT_04_ACCESS_WALKWAY", bm_road, mat_cedar_wood_decking(), root)
    
    # Architectural survey markers
    bm_stakes = bmesh.new()
    corners = [(-half_w + 1.5, -half_l + 1.5), (half_w - 1.5, -half_l + 1.5),
               (half_w - 1.5, half_l - 1.5), (-half_w + 1.5, half_l - 1.5)]
    for i, (cx, cy) in enumerate(corners):
        bmesh_cylinder(bm_stakes, 0.14, 2.4, (cx, cy, 1.2), segments=16)
        bmesh_box(bm_stakes, (0.5, 0.5, 0.12), (cx, cy, 2.3))
    create_mesh_object("PLOT_04_SURVEY_STAKES", bm_stakes, mat_safety_yellow(), root)
    
    # Layout boundary ribbon
    bm_ribbon = bmesh.new()
    for i in range(4):
        c1 = corners[i]
        c2 = corners[(i + 1) % 4]
        mid_x = (c1[0] + c2[0]) / 2
        mid_y = (c1[1] + c2[1]) / 2
        dist = math.hypot(c2[0] - c1[0], c2[1] - c1[1])
        if abs(c1[0] - c2[0]) > abs(c1[1] - c2[1]):
            bmesh_box(bm_ribbon, (dist, 0.05, 0.15), (mid_x, mid_y, 1.7))
        else:
            bmesh_box(bm_ribbon, (0.05, dist, 0.15), (mid_x, mid_y, 1.7))
    create_mesh_object("PLOT_04_LAYOUT_RIBBON", bm_ribbon, mat_construction_orange(), root)
    
    # Project Announcement Billboard
    bm_sign = bmesh.new()
    bmesh_box(bm_sign, (7.4, 0.25, 2.8), (0, half_l - 3.2, 3.5))
    create_mesh_object("PLOT_04_STUDIO_BILLBOARD", bm_sign, mat_dark_slate_roof(), root, bevel_width=0.03)
    
    bm_legs = bmesh.new()
    for lx in [-2.8, 0.0, 2.8]:
        bmesh_cylinder(bm_legs, 0.14, 4.0, (lx, half_l - 3.2, 2.0), segments=16)
        bmesh_cylinder(bm_legs, 0.09, 2.8, (lx, half_l - 4.0, 1.6), segments=12, rot_x=radians(28))
    create_mesh_object("PLOT_04_BILLBOARD_FRAME", bm_legs, mat_coral_structural_beam(), root)
    
    add_hitbox("HITBOX_DESIGN_MAIN", (W, L, 4.0), (0, 0, 2.0), root)
    
    extras = {
        "unit_id": "VEHICLE_DESIGN_HQ",
        "unit_key": "UNIT_04",
        "level": 0,
        "tier": "empty_plot",
        "building_name": "Vehicle Design HQ (Surveyed Creative Plot)",
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# =========================================================================
# LEVEL 1: 1970s AUTOMOTIVE DESIGN STUDIO [8k-12k tris]
# =========================================================================
def add_l1_elements(root):
    # Foundation plinth
    bm_plinth = bmesh.new()
    bmesh_box(bm_plinth, (36.0, 36.0, 0.45), (0, 0, 0.225))
    create_mesh_object("GEO_Plinth_Foundation", bm_plinth, mat_travertine_concrete(), root, bevel_width=0.03)
    
    # Main studio brick hall
    bm_studio = bmesh.new()
    bmesh_box(bm_studio, (24.0, 22.0, 6.8), (-3.0, 2.0, 3.6))
    create_mesh_object("GEO_Design_Studio_Brick_Hall", bm_studio, mat_lavender_brick_1970(), root, bevel_width=0.04)
    
    # Perimeter true I-beam steel columns with flanges and roof ring beam
    bm_columns = bmesh.new()
    bmesh_box(bm_columns, (24.8, 22.8, 0.45), (-3.0, 2.0, 7.2))
    for cx in [-15.0, -9.0, -3.0, 3.0, 9.0]:
        for cy in [-9.0, 13.0]:
            # Central web
            bmesh_box(bm_columns, (0.15, 0.55, 7.2), (cx, cy, 3.6))
            # Outer flanges
            bmesh_box(bm_columns, (0.55, 0.12, 7.2), (cx, cy - 0.22, 3.6))
            bmesh_box(bm_columns, (0.55, 0.12, 7.2), (cx, cy + 0.22, 3.6))
    create_mesh_object("GEO_Studio_Structural_IBeams", bm_columns, mat_coral_structural_beam(), root)
    
    # Triple Sawtooth Clerestory North Skylights with Standing Seam Panels
    bm_sawtooth_roof = bmesh.new()
    bm_sawtooth_glass = bmesh.new()
    bm_sawtooth_mullions = bmesh.new()
    for si, sy in enumerate([-4.0, 3.0, 10.0]):
        bmesh_sawtooth_skylight(bm_sawtooth_roof, 22.8, 6.8, 3.4, (-3.0, sy, 7.4))
        bmesh_standing_seam_roof(bm_sawtooth_roof, 22.4, 4.8, 28, (-3.0, sy - 0.8, 9.1), height=0.08)
        bmesh_box(bm_sawtooth_glass, (22.0, 0.15, 2.8), (-3.0, sy + 2.5, 9.2))
        bmesh_window_mullions_matrix(bm_sawtooth_mullions, 22.2, 2.9, 3, 10, (-3.0, sy + 2.55, 9.2))
    create_mesh_object("GEO_Sawtooth_Roof_Slopes", bm_sawtooth_roof, mat_dark_slate_roof(), root)
    create_mesh_object("GEO_Sawtooth_Clerestory_Glass", bm_sawtooth_glass, mat_tinted_acrylic_window(), root)
    create_mesh_object("GEO_Sawtooth_Window_Mullions", bm_sawtooth_mullions, mat_brushed_aluminum(), root)
    
    # Outdoor Natural-Light Design Review Terrace with 72 Individual Cedar Planks
    bm_deck = bmesh.new()
    bmesh_box(bm_deck, (10.0, 20.0, 0.35), (12.0, 2.0, 0.55))
    bmesh_deck_planks(bm_deck, 9.6, 19.6, 72, (12.0, 2.0, 0.74))
    for rx in [7.2, 16.8]:
        bmesh_box(bm_deck, (0.12, 19.8, 0.95), (rx, 2.0, 1.25))
    bmesh_box(bm_deck, (9.6, 0.12, 0.95), (12.0, -7.8, 1.25))
    bmesh_box(bm_deck, (9.6, 0.12, 0.95), (12.0, 11.8, 1.25))
    create_mesh_object("GEO_Outdoor_Review_Terrace_Deck", bm_deck, mat_cedar_wood_decking(), root)
    
    # 1:4 Scale Clay Modeling Turntables & Detailed Styling Clay Bucks
    bm_clay_bays = bmesh.new()
    bm_clay_models = bmesh.new()
    for ti, (tx, ty) in enumerate([(12.0, -3.0), (12.0, 6.0)]):
        bmesh_cylinder(bm_clay_bays, 2.6, 0.35, (tx, ty, 0.9), segments=36)
        bmesh_cylinder(bm_clay_bays, 0.45, 0.5, (tx, ty, 0.65), segments=20)
        bmesh_car_silhouette_buck(bm_clay_models, 3.4, 1.5, 0.95, (tx, ty, 1.45), high_detail=True)
    create_mesh_object("GEO_Clay_Turntables_Pedestals", bm_clay_bays, mat_brushed_aluminum(), root)
    create_mesh_object("GEO_1_to_4_Clay_Styling_Bucks", bm_clay_models, mat_automotive_styling_clay(), root)
    
    # Studio North Ribbon Windows
    bm_ribbon_win = bmesh.new()
    bm_win_frames = bmesh.new()
    for wx in [-11.0, -5.0, 1.0]:
        bmesh_box(bm_ribbon_win, (4.8, 0.15, 2.4), (wx, 13.1, 4.2))
        bmesh_window_mullions_matrix(bm_win_frames, 5.0, 2.5, 3, 4, (wx, 13.15, 4.2))
    create_mesh_object("GEO_Studio_Ribbon_Glass", bm_ribbon_win, mat_tinted_acrylic_window(), root)
    create_mesh_object("GEO_Studio_Window_Frames", bm_win_frames, mat_brushed_aluminum(), root)
    
    # 6 Complete Drafting Stations with Stools and Articulated Lamps
    bm_drafting = bmesh.new()
    for dy in [-5.0, -1.0, 3.0]:
        for dx in [-11.0, -7.0]:
            bmesh_drafting_table(bm_drafting, (dx, dy, 0.45))
    create_mesh_object("GEO_Drafting_Studio_Desks", bm_drafting, mat_satin_matte_white(), root)
    
    # Front Entrance Steps & Decorative Planter Boxes
    bm_entrance = bmesh.new()
    bmesh_box(bm_entrance, (6.0, 4.0, 0.25), (-3.0, -10.0, 0.35))
    bmesh_box(bm_entrance, (4.5, 2.5, 0.25), (-3.0, -11.0, 0.2))
    for px in [-7.5, 1.5]:
        bmesh_box(bm_entrance, (1.8, 1.8, 1.1), (px, -10.0, 0.8))
        bmesh_box(bm_entrance, (1.5, 1.5, 0.9), (px, -10.0, 1.4))
    create_mesh_object("GEO_Studio_Entrance_Steps", bm_entrance, mat_travertine_concrete(), root, bevel_width=0.03)
    
    add_hitbox("HITBOX_DESIGN_MAIN", (24.0, 22.0, 10.5), (-3.0, 2.0, 5.25), root)
    add_hitbox("HITBOX_DESIGN_TERRACE", (10.0, 20.0, 2.5), (12.0, 2.0, 1.25), root)

def build_design_l1(export_path: str):
    reset_scene()
    root = bpy.data.objects.new("UNIT_04_Design_HQ_L1", None)
    bpy.context.collection.objects.link(root)
    add_l1_elements(root)
    
    extras = {
        "unit_id": "VEHICLE_DESIGN_HQ",
        "unit_key": "UNIT_04",
        "level": 1,
        "tier": "office",
        "building_name": "Vehicle Design HQ (1970s Automotive Styling Studio)",
        "sub_departments": ["ds_exterior_sketch", "ds_1_4_clay_modeling", "ds_trim_review", "ds_director_office", "ds_colour_board"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# =========================================================================
# LEVEL 2: 1:1 CLAY MODELING HALL & TAPE DRAWING ROOM [14k-18k tris]
# =========================================================================
def add_l2_elements(root):
    # West 1:1 Full-Scale Clay Modeling Hall
    bm_clay_hall = bmesh.new()
    bmesh_box(bm_clay_hall, (11.0, 24.0, 8.2), (-18.5, 2.0, 4.3))
    bmesh_box(bm_clay_hall, (11.6, 24.6, 0.45), (-18.5, 2.0, 8.5))
    create_mesh_object("GEO_FullScale_1_to_1_Clay_Hall", bm_clay_hall, mat_lavender_brick_1970(), root, bevel_width=0.04)
    
    # 1:1 Cast-Iron Surface Plate Bed with Dense Coordinate Sipe Matrix
    bm_surface_plate = bmesh.new()
    bmesh_box(bm_surface_plate, (5.4, 13.0, 0.45), (-18.5, 2.0, 0.6))
    for gy in range(-12, 13, 1):
        bmesh_box(bm_surface_plate, (5.2, 0.04, 0.02), (-18.5, 2.0 + gy * 0.48, 0.84))
    for gx in [-2.2, -1.5, -0.8, 0.0, 0.8, 1.5, 2.2]:
        bmesh_box(bm_surface_plate, (0.04, 12.8, 0.02), (-18.5 + gx, 2.0, 0.84))
    create_mesh_object("GEO_CastIron_Surface_Plate", bm_surface_plate, mat_cast_iron_dark(), root)
    
    # 1:1 Full-Scale Styling Clay Buck (Full size hypercar silhouette with high detail)
    bm_clay_1to1 = bmesh.new()
    bmesh_car_silhouette_buck(bm_clay_1to1, 5.8, 2.4, 1.45, (-18.5, 2.0, 1.6), high_detail=True)
    create_mesh_object("GEO_FullScale_1_to_1_Clay_Model", bm_clay_1to1, mat_automotive_styling_clay(), root)
    
    # Bridge Coordinate Measuring Machine (CMM) Overhead Gantry with Dual Linear Encoder Rails
    bm_cmm = bmesh.new()
    bmesh_box(bm_cmm, (0.35, 18.0, 0.4), (-22.5, 2.0, 7.2))
    bmesh_box(bm_cmm, (0.35, 18.0, 0.4), (-14.5, 2.0, 7.2))
    bmesh_box(bm_cmm, (8.4, 0.55, 0.6), (-18.5, 3.5, 7.3))
    bmesh_cylinder(bm_cmm, 0.12, 3.6, (-18.5, 3.5, 5.4), segments=24)
    bmesh_cylinder(bm_cmm, 0.04, 1.2, (-18.5, 3.5, 3.2), segments=16) # Probe stylus
    create_mesh_object("GEO_CMM_Measuring_Gantry", bm_cmm, mat_brushed_aluminum(), root)
    
    # Tape Drawing Studio Wall with Multiple Orthographic Styling Tapes
    bm_tape_wall = bmesh.new()
    bmesh_box(bm_tape_wall, (0.25, 16.0, 4.5), (-13.1, 2.0, 3.8))
    for ty_i in range(12):
        bmesh_box(bm_tape_wall, (0.28, 14.5, 0.04), (-13.1, 2.0, 1.6 + ty_i * 0.35))
    create_mesh_object("GEO_Tape_Drawing_Wall", bm_tape_wall, mat_dark_slate_roof(), root)
    
    # High-level clerestory strip windows on west facade
    bm_west_win = bmesh.new()
    for wy in [-7.0, -2.5, 2.0, 6.5]:
        bmesh_box(bm_west_win, (0.15, 3.8, 2.2), (-24.05, wy, 6.0))
    create_mesh_object("GEO_Clay_Hall_West_Clerestory", bm_west_win, mat_tinted_acrylic_window(), root)

def build_design_l2(export_path: str):
    reset_scene()
    root = bpy.data.objects.new("UNIT_04_Design_HQ_L2", None)
    bpy.context.collection.objects.link(root)
    add_l1_elements(root)
    add_l2_elements(root)
    
    extras = {
        "unit_id": "VEHICLE_DESIGN_HQ",
        "unit_key": "UNIT_04",
        "level": 2,
        "tier": "department",
        "building_name": "Vehicle Design HQ (1:1 Clay Hall & Tape Studio)",
        "sub_departments": ["ds_1_1_clay_bay", "ds_interior_sketch", "ds_tape_drawing_room"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# =========================================================================
# LEVEL 3: CAS COMPUTER LAB & DESIGN REVIEW THEATER [20k-26k tris]
# =========================================================================
def add_l3_elements(root):
    # East Wing CAS Computer Lab
    bm_cas_wing = bmesh.new()
    bmesh_box(bm_cas_wing, (10.0, 18.0, 7.2), (14.0, 2.0, 4.0))
    bmesh_box(bm_cas_wing, (10.6, 18.6, 0.45), (14.0, 2.0, 7.8))
    create_mesh_object("GEO_CAS_Digital_Styling_Wing", bm_cas_wing, mat_lavender_brick_1970(), root, bevel_width=0.04)
    
    # Double-Height Design Review Theater Auditorium
    bm_theater = bmesh.new()
    bmesh_box(bm_theater, (14.0, 12.0, 9.5), (-3.0, -11.0, 5.0))
    for si, sz in enumerate([1.2, 1.8, 2.4, 3.0]):
        bmesh_box(bm_theater, (12.5, 1.6, 0.45), (-3.0, -14.5 + si * 1.6, sz))
    create_mesh_object("GEO_Design_Review_Theater", bm_theater, mat_travertine_concrete(), root, bevel_width=0.04)
    
    # 36 Executive Bucket Chairs in Auditorium
    bm_chairs = bmesh.new()
    for si, sz in enumerate([1.2, 1.8, 2.4, 3.0]):
        for cx in range(-7, 8, 2):
            bmesh_theater_chair(bm_chairs, (-3.0 + cx * 0.75, -14.5 + si * 1.6, sz))
    create_mesh_object("GEO_Theater_Auditorium_Chairs", bm_chairs, mat_dark_slate_roof(), root)
    
    # Theater Presentation Screen (8.5m wide curved display board)
    bm_screen = bmesh.new()
    bmesh_box(bm_screen, (8.5, 0.35, 4.8), (-3.0, -6.0, 5.4))
    create_mesh_object("GEO_Theater_Presentation_Screen", bm_screen, mat_modern_curtain_glass(), root)
    
    # 10 Dual-Monitor Silicon Graphics Workstations with Ergonomic Seating
    bm_workstations = bmesh.new()
    for wy in [-4.0, -1.5, 1.0, 3.5, 6.0]:
        for wx in [11.5, 16.5]:
            bmesh_box(bm_workstations, (2.2, 1.5, 0.75), (wx, wy, 1.1))
            bmesh_box(bm_workstations, (0.55, 0.45, 0.45), (wx - 0.45, wy + 0.3, 1.65))
            bmesh_box(bm_workstations, (0.55, 0.45, 0.45), (wx + 0.45, wy + 0.3, 1.65))
            bmesh_box(bm_workstations, (0.6, 0.25, 0.03), (wx, wy - 0.2, 1.15)) # Keyboard
            bmesh_box(bm_workstations, (0.4, 0.35, 0.02), (wx + 0.6, wy - 0.2, 1.15)) # Digitizer
            bmesh_cylinder(bm_workstations, 0.25, 0.6, (wx, wy - 0.6, 0.7), segments=16) # Chair
    create_mesh_object("GEO_CAS_Styling_Workstations", bm_workstations, mat_brushed_aluminum(), root)
    
    # Cantilevered Mezzanine Glass Balcony overlooking the 1:1 Clay Hall
    bm_mezz = bmesh.new()
    bmesh_box(bm_mezz, (2.4, 16.0, 0.35), (-13.0, 2.0, 5.5))
    bmesh_box(bm_mezz, (0.1, 16.0, 1.05), (-14.2, 2.0, 6.2))
    create_mesh_object("GEO_Mezzanine_Viewing_Balcony", bm_mezz, mat_modern_curtain_glass(), root)
    
    # Rooftop HVAC Air Conditioning Cooling Fin Banks
    bm_hvac = bmesh.new()
    for hx in [-8.0, 2.0]:
        bmesh_box(bm_hvac, (4.5, 3.5, 1.8), (hx, -10.0, 10.6))
        bmesh_cylinder(bm_hvac, 0.8, 1.6, (hx, -10.0, 11.6), segments=24)
        for fi in range(24):
            bmesh_box(bm_hvac, (4.3, 0.04, 1.6), (hx, -11.5 + fi * 0.13, 10.6))
    create_mesh_object("GEO_Theater_Rooftop_HVAC", bm_hvac, mat_brushed_aluminum(), root)

def build_design_l3(export_path: str):
    reset_scene()
    root = bpy.data.objects.new("UNIT_04_Design_HQ_L3", None)
    bpy.context.collection.objects.link(root)
    add_l1_elements(root)
    add_l2_elements(root)
    add_l3_elements(root)
    
    extras = {
        "unit_id": "VEHICLE_DESIGN_HQ",
        "unit_key": "UNIT_04",
        "level": 3,
        "tier": "center",
        "building_name": "Vehicle Design HQ (CAS Computer Lab & Review Theater)",
        "sub_departments": ["ds_cas_lab", "ds_surface_dev", "ds_review_theater"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# =========================================================================
# LEVEL 4: VR IMMERSIVE CAVE & CLASS-A SURFACING LAB [30k-38k tris]
# =========================================================================
def add_l4_elements(root):
    # Hexagonal VR Immersive Projection CAVE
    bm_vr_cave = bmesh.new()
    bmesh_cylinder(bm_vr_cave, 5.5, 6.5, (14.0, 2.0, 10.5), segments=6)
    for vi in range(6):
        theta = vi * 2 * math.pi / 6
        px = 14.0 + 4.2 * math.cos(theta)
        py = 2.0 + 4.2 * math.sin(theta)
        bmesh_box(bm_vr_cave, (0.8, 0.8, 0.6), (px, py, 13.0))
    create_mesh_object("GEO_VR_Immersive_Cave_Shell", bm_vr_cave, mat_dark_slate_roof(), root, bevel_width=0.05)
    
    # 24 Motion Tracking Optical Infrared Sensor Units
    bm_opt_tracking = bmesh.new()
    for ti in range(24):
        theta = ti * 2 * math.pi / 24
        tx = 14.0 + 4.8 * math.cos(theta)
        ty = 2.0 + 4.8 * math.sin(theta)
        bmesh_cylinder(bm_opt_tracking, 0.12, 0.35, (tx, ty, 13.5), segments=16, rot_x=radians(45))
    create_mesh_object("GEO_VR_Tracking_Camera_Rig", bm_opt_tracking, mat_safety_yellow(), root)
    
    # Class-A Surface Engineering Wing
    bm_class_a = bmesh.new()
    bmesh_box(bm_class_a, (16.0, 10.0, 4.5), (-3.0, 13.5, 9.8))
    create_mesh_object("GEO_ClassA_Surfacing_Curtain_Wall", bm_class_a, mat_modern_curtain_glass(), root)
    
    # 72 Modular CMF Material Sample Cubes Wall
    bm_cmf_wall = bmesh.new()
    for cx in range(-8, 9, 2):
        for cz in [7.6, 8.4, 9.2, 10.0, 10.8, 11.6, 12.4, 13.2]:
            bmesh_box(bm_cmf_wall, (1.2, 0.25, 0.65), (cx * 0.9, 8.6, cz))
    create_mesh_object("GEO_CMF_Material_Sample_Wall", bm_cmf_wall, mat_satin_matte_white(), root)
    
    # 44 Architectural Airfoil Sunshade Louvers
    bm_louvers = bmesh.new()
    for li in range(44):
        lz = 1.2 + li * 0.22
        bmesh_box(bm_louvers, (11.5, 0.75, 0.04), (-18.5, 14.2, lz))
    create_mesh_object("GEO_Architectural_Sunshade_Louvers", bm_louvers, mat_brushed_aluminum(), root)

def build_design_l4(export_path: str):
    reset_scene()
    root = bpy.data.objects.new("UNIT_04_Design_HQ_L4", None)
    bpy.context.collection.objects.link(root)
    add_l1_elements(root)
    add_l2_elements(root)
    add_l3_elements(root)
    add_l4_elements(root)
    
    extras = {
        "unit_id": "VEHICLE_DESIGN_HQ",
        "unit_key": "UNIT_04",
        "level": 4,
        "tier": "advanced_hq",
        "building_name": "Vehicle Design HQ (VR CAVE & Class-A Surfacing Studio)",
        "sub_departments": ["ds_vr_cave", "ds_class_a_surface", "ds_cmf_library"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# =========================================================================
# LEVEL 5: SHOW CAR BUILD BAY & GLASS REVEAL ROTUNDA [40k-55k tris]
# =========================================================================
def add_l5_elements(root):
    rot_center = (0.0, -8.0)
    bm_rotunda_base = bmesh.new()
    bm_rotunda_glass = bmesh.new()
    bm_rotunda_mullions = bmesh.new()
    
    bmesh_cylinder(bm_rotunda_base, 8.2, 0.6, (rot_center[0], rot_center[1], 0.7), segments=64)
    bmesh_cylinder(bm_rotunda_glass, 7.8, 8.2, (rot_center[0], rot_center[1], 4.8), segments=64)
    bmesh_cylinder(bm_rotunda_base, 8.8, 0.65, (rot_center[0], rot_center[1], 9.2), segments=64)
    
    # 64 Vertical Mullions and 5 Horizontal Transoms
    for mi in range(64):
        theta = mi * 2 * math.pi / 64
        mx = rot_center[0] + 7.9 * math.cos(theta)
        my = rot_center[1] + 7.9 * math.sin(theta)
        bmesh_box(bm_rotunda_mullions, (0.08, 0.38, 8.2), (mx, my, 4.8))
    for rz in [2.5, 4.0, 5.5, 7.0, 8.5]:
        bmesh_cylinder(bm_rotunda_mullions, 7.95, 0.06, (rot_center[0], rot_center[1], rz), segments=64)
        
    create_mesh_object("GEO_Reveal_Rotunda_Structure", bm_rotunda_base, mat_travertine_concrete(), root, bevel_width=0.04)
    create_mesh_object("GEO_Reveal_Rotunda_Curtain_Glass", bm_rotunda_glass, mat_modern_curtain_glass(), root)
    create_mesh_object("GEO_Reveal_Rotunda_Mullions", bm_rotunda_mullions, mat_brushed_aluminum(), root)
    
    # Motorized Central Turntable with Halo LED Glow
    bm_turntable = bmesh.new()
    bmesh_cylinder(bm_turntable, 4.2, 0.15, (rot_center[0], rot_center[1], 1.1), segments=64)
    bmesh_cylinder(bm_turntable, 4.35, 0.05, (rot_center[0], rot_center[1], 1.05), segments=64)
    create_mesh_object("GEO_Rotunda_Motorized_Turntable", bm_turntable, mat_satin_matte_white(), root)
    
    # 1:1 Concept Show Car Prototype on Turntable with 48 Turbine Blades
    bm_concept_car = bmesh.new()
    bmesh_car_silhouette_buck(bm_concept_car, 5.6, 2.3, 1.35, (rot_center[0], rot_center[1], 1.8), high_detail=True)
    for wx, wy in [(-1.15, -1.8), (1.15, -1.8), (-1.15, 1.8), (1.15, 1.8)]:
        for bi in range(12):
            theta = bi * 2 * math.pi / 12
            bx = 0.28 * math.cos(theta)
            bz = 0.28 * math.sin(theta)
            bmesh_box(bm_concept_car, (0.24, 0.04, 0.14), (rot_center[0] + wx, rot_center[1] + wy + bx, 1.45 + bz))
    create_mesh_object("GEO_Concept_Show_Car_Prototype", bm_concept_car, mat_pearl_concept_car_paint(), root)
    
    # Computerized 5-Axis CNC Clay Milling Robot Arm with Floor Drag-Chain
    bm_cnc_milling = bmesh.new()
    bmesh_cylinder(bm_cnc_milling, 0.45, 4.5, (-20.0, -4.0, 3.5), segments=24)
    bmesh_box(bm_cnc_milling, (1.8, 0.6, 0.6), (-18.8, -4.0, 5.2))
    bmesh_box(bm_cnc_milling, (0.5, 1.6, 0.5), (-17.6, -3.2, 4.6))
    bmesh_cylinder(bm_cnc_milling, 0.15, 0.8, (-17.6, -2.2, 4.0), segments=20, rot_x=radians(45))
    for di in range(36):
        bmesh_box(bm_cnc_milling, (0.22, 0.15, 0.12), (-20.0, -4.0 + di * 0.18, 0.65))
    create_mesh_object("GEO_5Axis_CNC_Clay_Milling_Robot", bm_cnc_milling, mat_brushed_aluminum(), root)

def build_design_l5(export_path: str):
    reset_scene()
    root = bpy.data.objects.new("UNIT_04_Design_HQ_L5", None)
    bpy.context.collection.objects.link(root)
    add_l1_elements(root)
    add_l2_elements(root)
    add_l3_elements(root)
    add_l4_elements(root)
    add_l5_elements(root)
    
    extras = {
        "unit_id": "VEHICLE_DESIGN_HQ",
        "unit_key": "UNIT_04",
        "level": 5,
        "tier": "world_class_hq",
        "building_name": "Vehicle Design HQ (Show Car Bay & Reveal Rotunda)",
        "sub_departments": ["ds_show_car_bay", "ds_digital_clay_haptic", "ds_concept_reveal_studio"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# =========================================================================
# LEVEL 6: AI GENERATIVE DESIGN & HOLOGRAPHIC REVIEW DOME [50k-65k tris]
# =========================================================================
def add_l6_elements(root):
    # Spherical Holographic Review Dome (16 latitude rings x 64 segments)
    bm_holo_dome = bmesh.new()
    dome_center = (14.0, 2.0, 8.2)
    for lat in range(16):
        phi = lat * (math.pi / 2) / 16
        r_lat = 5.2 * math.cos(phi)
        z_lat = dome_center[2] + 5.2 * math.sin(phi)
        bmesh_cylinder(bm_holo_dome, r_lat, 0.10, (dome_center[0], dome_center[1], z_lat), segments=64)
    create_mesh_object("GEO_Holographic_Review_Dome", bm_holo_dome, mat_modern_curtain_glass(), root)
    
    # Central Holographic Volumetric Projector Emitter Core with Lensing Rings
    bm_holo_emitter = bmesh.new()
    bmesh_cylinder(bm_holo_emitter, 1.8, 0.45, (dome_center[0], dome_center[1], dome_center[2] + 0.3), segments=48)
    bmesh_cylinder(bm_holo_emitter, 0.6, 2.8, (dome_center[0], dome_center[1], dome_center[2] + 1.8), segments=36)
    for ring_i in range(12):
        bmesh_cylinder(bm_holo_emitter, 0.8 + ring_i * 0.1, 0.05, (dome_center[0], dome_center[1], dome_center[2] + 0.5 + ring_i * 0.22), segments=36)
    create_mesh_object("GEO_Volumetric_Holo_Projector", bm_holo_emitter, mat_holographic_cyan_glow(), root)
    
    # Biophilic Sustainable Materials Greenhouse Atrium with 48 Bamboo Stalks
    bm_atrium = bmesh.new()
    bmesh_box(bm_atrium, (12.0, 8.0, 5.0), (-3.0, 2.0, 12.0))
    for py in [-1.0, 1.0, 3.0]:
        bmesh_box(bm_atrium, (10.5, 1.2, 0.6), (-3.0, py + 2.0, 9.8))
    for bi in range(48):
        bx = -7.5 + (bi % 16) * 0.95
        by = 0.8 + (bi // 16) * 1.2
        bmesh_cylinder(bm_atrium, 0.04, 3.8, (bx, by, 12.0), segments=12)
        for node_z in [10.8, 11.6, 12.4, 13.2]:
            bmesh_cylinder(bm_atrium, 0.055, 0.04, (bx, by, node_z), segments=12)
    create_mesh_object("GEO_Sustainable_Materials_Atrium", bm_atrium, mat_satin_matte_white(), root)
    
    # High-Density Generative AI Computing Blade Racks (12 Racks x 16 Sleds)
    bm_ai_blades = bmesh.new()
    for rx in [-8.0, -6.6, -5.2, -3.8, -2.4, -1.0, 0.4, 1.8, 3.2]:
        bmesh_box(bm_ai_blades, (0.9, 3.2, 2.4), (rx, 14.5, 11.2))
        for sz in [10.3, 10.7, 11.1, 11.5, 11.9, 12.3]:
            bmesh_box(bm_ai_blades, (0.95, 3.3, 0.06), (rx, 14.5, sz))
    create_mesh_object("GEO_AI_Generative_Computing_Racks", bm_ai_blades, mat_brushed_aluminum(), root)
    
    # Perimeter Photovoltaic Solar Glass Tiles on Roof Ridges
    bm_solar_glass = bmesh.new()
    for si, sy in enumerate([-4.0, 3.0, 10.0]):
        bmesh_box(bm_solar_glass, (21.5, 4.5, 0.08), (-3.0, sy - 1.2, 9.4))
    create_mesh_object("GEO_Sawtooth_Photovoltaic_Skin", bm_solar_glass, mat_modern_curtain_glass(), root)

def build_design_l6(export_path: str):
    reset_scene()
    root = bpy.data.objects.new("UNIT_04_Design_HQ_L6", None)
    bpy.context.collection.objects.link(root)
    add_l1_elements(root)
    add_l2_elements(root)
    add_l3_elements(root)
    add_l4_elements(root)
    add_l5_elements(root)
    add_l6_elements(root)
    
    extras = {
        "unit_id": "VEHICLE_DESIGN_HQ",
        "unit_key": "UNIT_04",
        "level": 6,
        "tier": "innovation_campus",
        "building_name": "Vehicle Design HQ (AI Generative & Holo Review Center)",
        "sub_departments": ["ds_ai_generative", "ds_holographic_theater", "ds_sustainable_materials"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# =========================================================================
# LEVEL 7: HYPERMODERN PARAMETRIC BIO-DESIGN MASTER TOWER [60k-80k tris]
# =========================================================================
def add_l7_elements(root):
    # Dramatic Cantilevered Aerogel "Design Cube"
    cube_center = (-6.0, -4.0, 17.5)
    bm_cantilever_cube = bmesh.new()
    bmesh_box(bm_cantilever_cube, (16.0, 16.0, 7.5), cube_center)
    create_mesh_object("GEO_Cantilevered_Design_Cube", bm_cantilever_cube, mat_modern_curtain_glass(), root)
    
    # Ultra-Dense Parametric Voronoi Titanium Sun-Shading Exoskeleton
    bm_voronoi_exo = bmesh.new()
    for dx in range(-8, 9, 1):
        for dy in [-8.1, 8.1]:
            bmesh_cylinder(bm_voronoi_exo, 0.045, 7.5, (cube_center[0] + dx, cube_center[1] + dy, cube_center[2]), segments=12, rot_x=radians(35))
            bmesh_cylinder(bm_voronoi_exo, 0.045, 7.5, (cube_center[0] + dx, cube_center[1] + dy, cube_center[2]), segments=12, rot_x=radians(-35))
    for dy in range(-8, 9, 1):
        for dx in [-8.1, 8.1]:
            bmesh_cylinder(bm_voronoi_exo, 0.045, 7.5, (cube_center[0] + dx, cube_center[1] + dy, cube_center[2]), segments=12, rot_y=radians(35))
            bmesh_cylinder(bm_voronoi_exo, 0.045, 7.5, (cube_center[0] + dx, cube_center[1] + dy, cube_center[2]), segments=12, rot_y=radians(-35))
    for bz in [14.5, 16.0, 17.5, 19.0, 20.5]:
        bmesh_box(bm_voronoi_exo, (16.4, 16.4, 0.10), (cube_center[0], cube_center[1], bz))
    create_mesh_object("GEO_Parametric_Voronoi_Exoskeleton", bm_voronoi_exo, mat_brushed_aluminum(), root)
    
    # Parametric Entrance Courtyard Space-Frame Canopy
    bm_entrance_canopy = bmesh.new()
    bmesh_box(bm_entrance_canopy, (18.0, 10.0, 0.25), (-3.0, -14.0, 6.5))
    for ex in range(-8, 9, 2):
        for ey in range(-4, 5, 2):
            bmesh_cylinder(bm_entrance_canopy, 0.04, 2.6, (-3.0 + ex, -14.0 + ey, 5.2), segments=12, rot_x=radians(35), rot_y=radians(35))
    create_mesh_object("GEO_Voronoi_Entrance_Canopy", bm_entrance_canopy, mat_modern_curtain_glass(), root)
    
    # Neuro-Aesthetic Research Lab & Biometric Sensory Sphere atop Cube
    bm_neuro_sphere = bmesh.new()
    bmesh_cylinder(bm_neuro_sphere, 4.2, 3.2, (cube_center[0], cube_center[1], cube_center[2] + 5.2), segments=64)
    for si in range(32):
        theta = si * 2 * math.pi / 32
        sx = cube_center[0] + 4.4 * math.cos(theta)
        sy = cube_center[1] + 4.4 * math.sin(theta)
        bmesh_box(bm_neuro_sphere, (0.18, 0.18, 3.4), (sx, sy, cube_center[2] + 5.2))
    create_mesh_object("GEO_NeuroAesthetic_Research_Pod", bm_neuro_sphere, mat_satin_matte_white(), root)
    
    # High-Altitude Cable-Stayed Observation Skybridge
    bm_skybridge = bmesh.new()
    bmesh_box(bm_skybridge, (6.5, 12.0, 3.2), (cube_center[0] + 11.0, cube_center[1], cube_center[2]))
    for wi in range(12):
        wy = -5.0 + wi * 0.95
        bmesh_cylinder(bm_skybridge, 0.03, 8.0, (cube_center[0] + 11.0, cube_center[1] + wy, cube_center[2] + 4.0), segments=10, rot_x=radians(25))
    create_mesh_object("GEO_Executive_Observation_Skybridge", bm_skybridge, mat_modern_curtain_glass(), root)
    
    # VIP Concept Delivery & Drone Aerocraft Landing Pad
    bm_helipad = bmesh.new()
    pad_center = (12.0, 10.0, 14.5)
    bmesh_cylinder(bm_helipad, 4.5, 0.35, pad_center, segments=48)
    bmesh_cylinder(bm_helipad, 3.4, 0.4, pad_center, segments=36)
    bmesh_cylinder(bm_helipad, 1.8, 0.45, pad_center, segments=24)
    for bi in range(16):
        theta = bi * 2 * math.pi / 16
        bx = pad_center[0] + 4.2 * math.cos(theta)
        by = pad_center[1] + 4.2 * math.sin(theta)
        bmesh_box(bm_helipad, (0.35, 0.35, 0.45), (bx, by, pad_center[2] + 0.3))
    create_mesh_object("GEO_Concept_Delivery_Drone_Pad", bm_helipad, mat_safety_yellow(), root)

def build_design_l7(export_path: str):
    reset_scene()
    root = bpy.data.objects.new("UNIT_04_Design_HQ_L7", None)
    bpy.context.collection.objects.link(root)
    add_l1_elements(root)
    add_l2_elements(root)
    add_l3_elements(root)
    add_l4_elements(root)
    add_l5_elements(root)
    add_l6_elements(root)
    add_l7_elements(root)
    
    extras = {
        "unit_id": "VEHICLE_DESIGN_HQ",
        "unit_key": "UNIT_04",
        "level": 7,
        "tier": "hypermodern_campus",
        "building_name": "Vehicle Design HQ (Parametric Bio-Design Master Tower)",
        "sub_departments": ["ds_neuro_aesthetic", "ds_parametric_bio_ai", "ds_executive_penthouse"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# =========================================================================
# BATCH GENERATION & AUDIT ENTRYPOINT
# =========================================================================
def generate_all_design_levels(output_dir: str):
    os.makedirs(output_dir, exist_ok=True)
    results = {}
    
    levels = [
        (0, "hq_04_design_l0.glb", build_design_l0),
        (1, "hq_04_design_l1.glb", build_design_l1),
        (2, "hq_04_design_l2.glb", build_design_l2),
        (3, "hq_04_design_l3.glb", build_design_l3),
        (4, "hq_04_design_l4.glb", build_design_l4),
        (5, "hq_04_design_l5.glb", build_design_l5),
        (6, "hq_04_design_l6.glb", build_design_l6),
        (7, "hq_04_design_l7.glb", build_design_l7),
    ]
    
    print("\n" + "#" * 70)
    print(" AUTO TYCOON CAMPUS HQ - UNIT_04 VEHICLE DESIGN HQ GENERATION")
    print(f" Target Output Directory: {output_dir}")
    print("#" * 70)
    
    all_passed = True
    for lvl, filename, builder_func in levels:
        out_path = os.path.join(output_dir, filename)
        tier_name = CAMPUS_TRIANGLE_BUDGETS[lvl]["tier"]
        print(f"\n>>> Generating UNIT_04 Level {lvl} ({tier_name}) -> {filename}...")
        
        success = builder_func(out_path)
        passed, report = audit_scene("UNIT_04_DESIGN", lvl, bpy)
        print_audit_summary(report)
        
        file_size = os.path.getsize(out_path) if os.path.exists(out_path) else 0
        tris = report["total_triangles"]
        print(f"    Export: {success} | Size: {file_size / 1024:.1f} KB | Triangles: {tris:,}")
        results[lvl] = {"file": filename, "passed": passed, "size_kb": file_size / 1024.0, "triangles": tris}
        if not passed:
            all_passed = False
            
    print("\n" + "=" * 70)
    print(" UNIT_04 DESIGN HQ SUMMARY AUDIT TABLE")
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
    
    generate_all_design_levels(target_dir)
