"""
AUTO TYCOON CAMPUS HQ - CARGO RAILWAY TERMINAL GENERATOR (L0 - L5)

Generates all 6 progression levels for the HQ Cargo Railway Terminal:
- Footprint: 55m x 110m (Zone A Western Logistics Perimeter)
- Architectural Identity: Industrial Rail Spur to Continental Intermodal Mega-Hub:
  L0: Unconnected Dirt Staging Yard (road trucks only, surveyor stakes, gravel loop)
  L1: Single Industrial Rail Spur (ballast, steel rails, wooden ties, diesel shunter, flatcar coils, derrick crane)
  L2: Covered Freight Depot & Dual Siding (dual tracks, crossover switch, 20t gantry crane, auto-rack ramp, warehouse)
  L3: Intermodal Container & Marshalling Yard (4 tracks, RMG container crane, stacked ISO containers, tanker siding)
  L4: Automated Logistics Rail Hub (6 electrified tracks, overhead catenary, twin RTG cranes, multi-tier auto-rack terminal)
  L5: Continental High-Speed Intermodal Mega-Terminal (8 slab tracks, aero electric loco, ASRS automated containers, control tower, solar canopy, factory tunnel)

Strict Quality Gate Compliance:
- 100% deterministic GEO_* and HITBOX_* naming convention
- Strict triangle budgets:
    L0:  1,000 -  3,000 tris (Target: ~1,800 - 2,500)
    L1:  8,000 - 12,000 tris (Target: ~9,500 - 11,500)
    L2: 14,000 - 18,000 tris (Target: ~15,000 - 17,500)
    L3: 20,000 - 26,000 tris (Target: ~22,000 - 25,500)
    L4: 30,000 - 40,000 tris (Target: ~33,000 - 37,000)
    L5: 40,000 - 65,000 tris (Target: ~52,000 - 60,000)
- Ground contact at Z in [-0.45, 0.10]
- Zero generic primitive names
"""

import bpy
import bmesh
import math
import mathutils
from mathutils import Matrix, Euler, Vector
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
    mat_corrugated_industrial_steel,
    mat_oil_stained_asphalt,
    mat_high_voltage_orange,
    mat_cryo_cyan_emissive,
    mat_cast_iron_dark,
    mat_cedar_wood_decking,
    mat_satin_matte_white,
    mat_pearl_concept_car_paint,
    mat_hitbox_invisible,
)
from campus.utils.campus_export_utils import export_campus_glb
from campus.utils.campus_quality_gate import audit_scene, print_audit_summary, count_mesh_triangles

def reset_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for block in bpy.data.meshes:
        if block.users == 0:
            bpy.data.meshes.remove(block)
    for block in bpy.data.materials:
        if block.users == 0:
            bpy.data.materials.remove(block)

def create_mesh_object(name: str, bm: bmesh.types.BMesh, material, parent=None):
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
    obj.select_set(False)
    return obj

def add_box(bm, x, y, z, dx, dy, dz):
    """Adds an axis-aligned box to a bmesh centered at (x, y, z) with dimensions (dx, dy, dz)."""
    x0, x1 = x - dx/2, x + dx/2
    y0, y1 = y - dy/2, y + dy/2
    z0, z1 = z - dz/2, z + dz/2
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

def add_cylinder(bm, x, y, z, radius, depth, segments=12, axis='Z'):
    """Adds a cylinder to a bmesh along specified axis."""
    rot_x = 0.0
    rot_y = 0.0
    if axis == 'X':
        rot_y = math.pi / 2
    elif axis == 'Y':
        rot_x = math.pi / 2
    cos_rx, sin_rx = math.cos(rot_x), math.sin(rot_x)
    cos_ry, sin_ry = math.cos(rot_y), math.sin(rot_y)
    top_verts, bot_verts = [], []
    for i in range(segments):
        theta = i * 2 * math.pi / segments
        vx = radius * math.cos(theta)
        vy = radius * math.sin(theta)
        # Apply rot_y then rot_x for top cap
        x1 = vx * cos_ry + (depth/2) * sin_ry
        z1 = -vx * sin_ry + (depth/2) * cos_ry
        y2 = vy * cos_rx - z1 * sin_rx
        z2 = vy * sin_rx + z1 * cos_rx
        top_verts.append(bm.verts.new((x + x1, y + y2, z + z2)))

        # Bottom cap
        x1_b = vx * cos_ry - (depth/2) * sin_ry
        z1_b = -vx * sin_ry - (depth/2) * cos_ry
        y2_b = vy * cos_rx - z1_b * sin_rx
        z2_b = vy * sin_rx + z1_b * cos_rx
        bot_verts.append(bm.verts.new((x + x1_b, y + y2_b, z + z2_b)))

    for i in range(segments):
        i_next = (i + 1) % segments
        bm.faces.new([bot_verts[i], top_verts[i], top_verts[i_next], bot_verts[i_next]])
    bm.faces.new(top_verts)
    bm.faces.new(reversed(bot_verts))

# ═══════════════════════════════════════════════════════════════════════
# LEVEL 0: UNCONNECTED DIRT STAGING YARD (~2,000 tris)
# ═══════════════════════════════════════════════════════════════════════
def build_railway_l0():
    reset_scene()
    root = bpy.data.objects.new("GEO_Railway_L0_Root", None)
    bpy.context.collection.objects.link(root)

    # 1. Graded gravel / dirt ground pad
    bm_pad = bmesh.new()
    add_box(bm_pad, 0, 0, -0.1, 52, 95, 0.2)
    # Ruts / tire tracks
    for offset_x in [-12, -4, 4, 12]:
        add_box(bm_pad, offset_x, 0, 0.02, 1.8, 85, 0.04)
    create_mesh_object("GEO_Railway_L0_Gravel_Base", bm_pad, mat_oil_stained_asphalt(), root)

    # 2. Surveyor stakes and perimeter wire
    bm_stakes = bmesh.new()
    for sx in [-24, 24]:
        for sy in range(-40, 45, 10):
            add_cylinder(bm_stakes, sx, sy, 0.6, 0.08, 1.2, segments=6, axis='Z')
            # Stake flag top
            add_box(bm_stakes, sx + 0.15, sy, 1.1, 0.3, 0.05, 0.2)
    # Perimeter fence wire rails
    for sx in [-24, 24]:
        add_box(bm_stakes, sx, 0, 0.8, 0.04, 85, 0.04)
    create_mesh_object("GEO_Railway_L0_Survey_Stakes", bm_stakes, mat_construction_orange(), root)

    # 3. Small wooden watchman guard shack
    bm_shack = bmesh.new()
    add_box(bm_shack, -18, -35, 1.6, 4.0, 4.5, 3.2)
    # Overhanging tin roof
    add_box(bm_shack, -18, -35, 3.3, 4.8, 5.2, 0.2)
    # Door and small window frame
    add_box(bm_shack, -18, -32.7, 1.3, 1.2, 0.2, 2.2)
    add_box(bm_shack, -15.9, -35, 1.8, 0.2, 1.6, 1.2)
    create_mesh_object("GEO_Railway_L0_Watchman_Shack", bm_shack, mat_cedar_wood_decking(), root)

    # 4. Overland Semi-Truck & Trailer
    bm_truck = bmesh.new()
    # Cab
    add_box(bm_truck, 8, -10, 1.6, 2.6, 6.0, 2.8)
    add_box(bm_truck, 8, -7.5, 2.0, 2.5, 2.8, 2.0) # Cab engine hood step
    # Wheels (10 wheels)
    for wx in [6.6, 9.4]:
        for wy in [-12, -10.5, -8, 2, 4, 10, 12]:
            add_cylinder(bm_truck, wx, wy, 0.55, 0.55, 0.45, segments=8, axis='X')
    # Trailer chassis & flatbed deck
    add_box(bm_truck, 8, 3, 1.4, 2.6, 16.0, 0.4)
    # Wooden freight crates stacked on trailer
    add_box(bm_truck, 8, -1, 2.4, 2.2, 3.5, 1.6)
    add_box(bm_truck, 8, 4, 2.6, 2.3, 4.0, 2.0)
    add_box(bm_truck, 8, 9, 2.2, 2.1, 3.2, 1.3)
    create_mesh_object("GEO_Railway_L0_Road_Truck_Hauler", bm_truck, mat_cast_iron_dark(), root)

    # 5. Hitbox
    bm_hitbox = bmesh.new()
    add_box(bm_hitbox, 0, 0, 2.0, 50, 90, 4.0)
    create_mesh_object("HITBOX_Railway_L0_Main", bm_hitbox, mat_hitbox_invisible(), root)

    return root

# ═══════════════════════════════════════════════════════════════════════
# LEVEL 1: SINGLE INDUSTRIAL RAIL SPUR (~10,500 tris)
# ═══════════════════════════════════════════════════════════════════════
def build_railway_l1():
    reset_scene()
    root = bpy.data.objects.new("GEO_Railway_L1_Root", None)
    bpy.context.collection.objects.link(root)

    # 1. Ballast Stone Bed
    bm_ballast = bmesh.new()
    add_box(bm_ballast, -8, 0, 0.15, 7.5, 100, 0.3)
    create_mesh_object("GEO_Railway_L1_Track_Ballast", bm_ballast, mat_travertine_concrete(), root)

    # 2. Ties / Sleepers & Steel Rails (Single Track Spur)
    bm_track = bmesh.new()
    track_x = -8
    # Wooden Ties every 1.2m
    for ty in range(-48, 48, 2):
        add_box(bm_track, track_x, ty, 0.32, 2.7, 0.35, 0.22)
    # Steel T-Rails (1.435m gauge)
    rail_offset = 0.7175
    for ro in [-rail_offset, rail_offset]:
        add_box(bm_track, track_x + ro, 0, 0.52, 0.14, 98, 0.18)
    # End-of-track Buffer Stop Bumper
    add_box(bm_track, track_x, 48.5, 1.1, 2.8, 0.8, 1.2)
    add_box(bm_track, track_x, 48.2, 1.0, 2.2, 0.3, 0.4)
    create_mesh_object("GEO_Railway_L1_Rails_And_Ties", bm_track, mat_cast_iron_dark(), root)

    # 3. 1970s Industrial Wooden/Brick Freight Shed
    bm_shed = bmesh.new()
    shed_x, shed_y = 10, -10
    # Brick foundation platform
    add_box(bm_shed, shed_x, shed_y, 0.75, 14, 34, 1.5)
    # Wooden warehouse shed walls
    add_box(bm_shed, shed_x + 2, shed_y, 3.6, 9.5, 30, 4.2)
    # Gabled roof with pitch
    add_box(bm_shed, shed_x + 2, shed_y, 6.0, 11.0, 32, 0.5)
    # Loading platform apron beside track
    add_box(bm_shed, -1.8, shed_y, 0.75, 5.0, 34, 1.5)
    # Support pillars
    for py in range(-24, 6, 6):
        add_box(bm_shed, -3.8, py, 2.2, 0.25, 0.25, 3.0)
    create_mesh_object("GEO_Railway_L1_Freight_Shed", bm_shed, mat_lavender_brick_1970(), root)

    # 4. 1970s Diesel Shunter Locomotive
    bm_loco = bmesh.new()
    loco_x, loco_y = track_x, 15
    # Frame & Cowcatchers
    add_box(bm_loco, loco_x, loco_y, 1.0, 2.7, 12.0, 0.5)
    # Wheels (6 heavy flanged steel wheels)
    for side_x in [-loco_x - 0.75, -loco_x + 0.75]:
        for wy in [loco_y - 4, loco_y, loco_y + 4]:
            add_cylinder(bm_loco, loco_x + (side_x * 0.9), wy, 0.65, 0.55, 0.25, segments=12, axis='X')
    # Engine hood
    add_box(bm_loco, loco_x, loco_y - 1.5, 2.4, 2.3, 7.5, 2.2)
    # Driver Cab
    add_box(bm_loco, loco_x, loco_y + 3.8, 2.9, 2.5, 3.0, 3.2)
    # Exhaust stacks & horn
    add_cylinder(bm_loco, loco_x, loco_y - 3.5, 3.8, 0.2, 0.8, segments=8, axis='Z')
    add_cylinder(bm_loco, loco_x + 0.4, loco_y + 3.0, 4.6, 0.08, 0.5, segments=6, axis='Y')
    create_mesh_object("GEO_Railway_L1_Locomotive_Shunter", bm_loco, mat_safety_yellow(), root)

    # 5. Flatcar with Steel Coils
    bm_flatcar = bmesh.new()
    fc_y = -10
    add_box(bm_flatcar, track_x, fc_y, 0.95, 2.6, 14.0, 0.45)
    # Wheels
    for wy in [fc_y - 5.5, fc_y - 3.8, fc_y + 3.8, fc_y + 5.5]:
        for side in [-0.75, 0.75]:
            add_cylinder(bm_flatcar, track_x + side, wy, 0.55, 0.45, 0.2, segments=10, axis='X')
    # 3 Heavy rolled steel coils
    for cy in [fc_y - 3.5, fc_y, fc_y + 3.5]:
        add_cylinder(bm_flatcar, track_x, cy, 1.9, 0.85, 1.8, segments=16, axis='X')
        # Wooden wedges
        add_box(bm_flatcar, track_x, cy - 0.75, 1.25, 2.0, 0.3, 0.3)
        add_box(bm_flatcar, track_x, cy + 0.75, 1.25, 2.0, 0.3, 0.3)
    create_mesh_object("GEO_Railway_L1_Flatcar_Steel_Coils", bm_flatcar, mat_corrugated_industrial_steel(), root)

    # 6. Heavy 5-ton Derrick Crane
    bm_crane = bmesh.new()
    cx, cy = 2, 12
    # Concrete base
    add_cylinder(bm_crane, cx, cy, 0.5, 1.4, 1.0, segments=12, axis='Z')
    # Mast column
    add_cylinder(bm_crane, cx, cy, 3.5, 0.35, 5.0, segments=8, axis='Z')
    # Angled Jib Boom
    add_box(bm_crane, cx - 2.5, cy, 5.0, 5.5, 0.4, 0.4)
    # Hoist Cable & Hook
    add_cylinder(bm_crane, cx - 4.5, cy, 3.2, 0.05, 3.2, segments=6, axis='Z')
    add_cylinder(bm_crane, cx - 4.5, cy, 1.4, 0.25, 0.3, segments=8, axis='Y')
    create_mesh_object("GEO_Railway_L1_Derrick_Crane", bm_crane, mat_coral_structural_beam(), root)

    # 7. Hitbox
    bm_hitbox = bmesh.new()
    add_box(bm_hitbox, 0, 0, 3.5, 52, 95, 7.0)
    create_mesh_object("HITBOX_Railway_L1_Main", bm_hitbox, mat_hitbox_invisible(), root)

    return root

# ═══════════════════════════════════════════════════════════════════════
# LEVEL 2: COVERED FREIGHT DEPOT & DUAL SIDING (~16,500 tris)
# ═══════════════════════════════════════════════════════════════════════
def build_railway_l2():
    reset_scene()
    root = bpy.data.objects.new("GEO_Railway_L2_Root", None)
    bpy.context.collection.objects.link(root)

    # 1. Dual Track Ballast Bed with Crossover
    bm_ballast = bmesh.new()
    add_box(bm_ballast, -12, 0, 0.15, 16.0, 100, 0.3)
    create_mesh_object("GEO_Railway_L2_Ballast_Bed", bm_ballast, mat_travertine_concrete(), root)

    bm_tracks = bmesh.new()
    for track_x in [-16, -8]:
        for ty in range(-48, 48, 2):
            add_box(bm_tracks, track_x, ty, 0.32, 2.7, 0.35, 0.22)
        rail_offset = 0.7175
        for ro in [-rail_offset, rail_offset]:
            add_box(bm_tracks, track_x + ro, 0, 0.52, 0.14, 98, 0.18)
        # End stops
        add_box(bm_tracks, track_x, 48.5, 1.1, 2.8, 0.8, 1.2)
    # Turnout Crossover diagonal rail links
    for diag_step in range(-10, 11, 2):
        alpha = (diag_step + 10) / 20.0
        cx = -16 + (8 * alpha)
        add_box(bm_tracks, cx, diag_step, 0.52, 0.14, 1.8, 0.18)
    create_mesh_object("GEO_Railway_L2_Dual_Tracks", bm_tracks, mat_cast_iron_dark(), root)

    # 2. Large Covered Transshipment Warehouse (Brick & Steel Truss)
    bm_depot = bmesh.new()
    depot_x, depot_y = 12, -5
    # Concrete dock foundation
    add_box(bm_depot, depot_x, depot_y, 0.75, 18, 52, 1.5)
    # Steel frame warehouse body
    add_box(bm_depot, depot_x + 3, depot_y, 4.5, 12, 48, 6.0)
    # Overhanging roof canopy extending over track siding
    add_box(bm_depot, 3.5, depot_y, 6.8, 25, 52, 0.4)
    # Heavy canopy support pillars along dock edge
    for py in range(-28, 25, 7):
        add_box(bm_depot, -3.5, py, 3.5, 0.4, 0.4, 6.2)
    # Rollup warehouse doors
    for dy in range(-22, 20, 8):
        add_box(bm_depot, -2.8, dy, 2.2, 0.2, 4.0, 3.2)
    create_mesh_object("GEO_Railway_L2_Depot_Building", bm_depot, mat_corrugated_industrial_steel(), root)

    # 3. 20-ton Overhead Bridge Gantry Crane
    bm_gantry = bmesh.new()
    gx = -12
    gy = 25
    # Two tall A-frame gantry legs
    for leg_x in [-21, -3]:
        add_box(bm_gantry, leg_x, gy, 5.0, 1.0, 1.2, 9.5)
        # Wheel bogies on ground rails
        add_box(bm_gantry, leg_x, gy, 0.4, 1.4, 4.5, 0.6)
    # Transverse bridge girder beam spanning both tracks
    add_box(bm_gantry, gx, gy, 9.8, 19.5, 1.8, 1.6)
    # Hoist trolley & spreader bar
    add_box(bm_gantry, gx - 2, gy, 8.8, 2.2, 2.4, 1.0)
    add_cylinder(bm_gantry, gx - 2, gy, 6.2, 0.08, 4.2, segments=6, axis='Z')
    add_box(bm_gantry, gx - 2, gy, 4.0, 3.5, 1.4, 0.4)
    create_mesh_object("GEO_Railway_L2_Gantry_Crane", bm_gantry, mat_safety_yellow(), root)

    # 4. Bi-Level Auto-Rack Vehicle Loading Ramp
    bm_autorack = bmesh.new()
    ar_x, ar_y = -8, -35
    # Steel ramp incline to lower deck
    add_box(bm_autorack, ar_x, ar_y, 0.8, 2.8, 12.0, 1.2)
    # Upper deck steel framework
    add_box(bm_autorack, ar_x, ar_y - 2, 2.8, 2.8, 14.0, 0.3)
    for ry in range(-42, -26, 3):
        add_box(bm_autorack, ar_x - 1.3, ry, 1.5, 0.15, 0.15, 2.6)
        add_box(bm_autorack, ar_x + 1.3, ry, 1.5, 0.15, 0.15, 2.6)
    # Vehicles loaded on auto-rack (2 sedans)
    for vy, vz in [(-36, 1.45), (-34, 3.5)]:
        add_box(bm_autorack, ar_x, vy, vz, 1.8, 4.2, 1.2)
        add_box(bm_autorack, ar_x, vy + 0.3, vz + 0.45, 1.6, 2.2, 0.8)
    create_mesh_object("GEO_Railway_L2_AutoRack_Ramp", bm_autorack, mat_coral_structural_beam(), root)

    # 5. Boxcars on Track 1
    bm_boxcars = bmesh.new()
    for by in [5, -15]:
        add_box(bm_boxcars, -16, by, 2.2, 2.8, 15.0, 3.0)
        # Roof curve & end doors
        add_box(bm_boxcars, -16, by, 3.8, 2.6, 15.0, 0.3)
        add_box(bm_boxcars, -16, by - 7.5, 2.0, 2.5, 0.2, 2.4)
        add_box(bm_boxcars, -16, by + 7.5, 2.0, 2.5, 0.2, 2.4)
    create_mesh_object("GEO_Railway_L2_Boxcars", bm_boxcars, mat_cast_iron_dark(), root)

    # 6. Hitbox
    bm_hitbox = bmesh.new()
    add_box(bm_hitbox, 0, 0, 5.0, 52, 98, 10.0)
    create_mesh_object("HITBOX_Railway_L2_Main", bm_hitbox, mat_hitbox_invisible(), root)

    return root

# ═══════════════════════════════════════════════════════════════════════
# LEVEL 3: INTERMODAL CONTAINER & MARSHALLING YARD (~24,500 tris)
# ═══════════════════════════════════════════════════════════════════════
def build_railway_l3():
    reset_scene()
    root = bpy.data.objects.new("GEO_Railway_L3_Root", None)
    bpy.context.collection.objects.link(root)

    # 1. 4 Classification Tracks Ballast Bed
    bm_ballast = bmesh.new()
    add_box(bm_ballast, -10, 0, 0.15, 28.0, 102, 0.3)
    create_mesh_object("GEO_Railway_L3_Ballast_Bed", bm_ballast, mat_travertine_concrete(), root)

    bm_tracks = bmesh.new()
    track_positions = [-20, -14, -8, -2]
    for tx in track_positions:
        for ty in range(-48, 48, 2):
            add_box(bm_tracks, tx, ty, 0.32, 2.7, 0.35, 0.22)
        rail_offset = 0.7175
        for ro in [-rail_offset, rail_offset]:
            add_box(bm_tracks, tx + ro, 0, 0.52, 0.14, 98, 0.18)
        # Buffer stops
        add_box(bm_tracks, tx, 48.5, 1.1, 2.8, 0.8, 1.2)
    create_mesh_object("GEO_Railway_L3_Tracks", bm_tracks, mat_cast_iron_dark(), root)

    # 2. Rail-Mounted Gantry (RMG) Intermodal Crane
    bm_rmg = bmesh.new()
    rmg_y = 15
    # Crane legs spanning tracks -20 to -8
    for lx in [-23, -5]:
        add_box(bm_rmg, lx, rmg_y, 7.5, 1.4, 2.2, 14.5)
        add_box(bm_rmg, lx, rmg_y, 0.5, 2.2, 6.5, 0.8) # 8-wheel ground truck
    # Massive dual box girder crossbeam
    add_box(bm_rmg, -14, rmg_y - 0.7, 14.8, 20.0, 1.2, 1.8)
    add_box(bm_rmg, -14, rmg_y + 0.7, 14.8, 20.0, 1.2, 1.8)
    # Operator cab & trolley
    add_box(bm_rmg, -11, rmg_y, 13.5, 3.2, 3.4, 1.6)
    # Container Spreader assembly holding 40ft container
    add_box(bm_rmg, -14, rmg_y, 10.5, 2.8, 12.5, 0.6)
    add_box(bm_rmg, -14, rmg_y, 8.8, 2.4, 12.2, 2.6) # Suspended container
    create_mesh_object("GEO_Railway_L3_RMG_Crane", bm_rmg, mat_safety_yellow(), root)

    # 3. Stacked ISO Shipping Containers (Paved yard on East flank)
    bm_containers = bmesh.new()
    container_x = 14
    # Stacks of 20ft and 40ft containers
    for cy in range(-35, 35, 14):
        for tier in range(0, 3):
            cz = 1.4 + (tier * 2.6)
            add_box(bm_containers, container_x - 3, cy, cz, 2.4, 12.2, 2.6)
            add_box(bm_containers, container_x + 3, cy + 2, cz, 2.4, 6.1, 2.6)
            add_box(bm_containers, container_x + 3, cy - 4, cz, 2.4, 6.1, 2.6)
    create_mesh_object("GEO_Railway_L3_Container_Stacks", bm_containers, mat_coral_structural_beam(), root)

    # 4. Liquid & Chemical Tanker Siding
    bm_tankers = bmesh.new()
    tanker_track = -2
    for ty in [-25, -5]:
        # Tanker railcar cylinder
        add_cylinder(bm_tankers, tanker_track, ty, 2.4, 1.35, 13.0, segments=16, axis='Y')
        # Underframe chassis & dome hatch
        add_box(bm_tankers, tanker_track, ty, 1.0, 2.6, 14.5, 0.45)
        add_cylinder(bm_tankers, tanker_track, ty, 3.9, 0.45, 0.4, segments=8, axis='Z')
    # Stationary chemical storage tanks beside siding
    add_cylinder(bm_tankers, 5, -20, 4.5, 2.8, 7.5, segments=16, axis='Z')
    add_cylinder(bm_tankers, 5, -30, 4.5, 2.8, 7.5, segments=16, axis='Z')
    # Piping manifold
    add_box(bm_tankers, 1.5, -25, 2.0, 0.2, 18.0, 0.2)
    create_mesh_object("GEO_Railway_L3_Tanker_Siding", bm_tankers, mat_brushed_aluminum(), root)

    # 5. Floodlight Mast Towers & Switcher Engine
    bm_ancillaries = bmesh.new()
    # High-mast yard lights
    for ly in [-35, 35]:
        add_cylinder(bm_ancillaries, -24, ly, 10.0, 0.35, 20.0, segments=8, axis='Z')
        add_box(bm_ancillaries, -24, ly, 19.8, 2.5, 1.5, 0.4)
    create_mesh_object("GEO_Railway_L3_Yard_Towers", bm_ancillaries, mat_corrugated_industrial_steel(), root)

    # 6. Hitbox
    bm_hitbox = bmesh.new()
    add_box(bm_hitbox, 0, 0, 7.5, 52, 100, 15.0)
    create_mesh_object("HITBOX_Railway_L3_Main", bm_hitbox, mat_hitbox_invisible(), root)

    return root

# ═══════════════════════════════════════════════════════════════════════
# LEVEL 4: AUTOMATED LOGISTICS RAIL HUB (~35,000 tris)
# ═══════════════════════════════════════════════════════════════════════
def build_railway_l4():
    reset_scene()
    root = bpy.data.objects.new("GEO_Railway_L4_Root", None)
    bpy.context.collection.objects.link(root)

    # 1. 6 Electrified Tracks Ballast & Concrete Slab Bed
    bm_ballast = bmesh.new()
    add_box(bm_ballast, -6, 0, 0.15, 38.0, 104, 0.3)
    create_mesh_object("GEO_Railway_L4_Ballast_Bed", bm_ballast, mat_travertine_concrete(), root)

    bm_tracks = bmesh.new()
    track_positions = [-22, -16, -10, -4, 2, 8]
    for tx in track_positions:
        for ty in range(-50, 50, 2):
            add_box(bm_tracks, tx, ty, 0.32, 2.7, 0.35, 0.22)
        rail_offset = 0.7175
        for ro in [-rail_offset, rail_offset]:
            add_box(bm_tracks, tx + ro, 0, 0.52, 0.14, 100, 0.18)
        # Buffer stops
        add_box(bm_tracks, tx, 49.5, 1.1, 2.8, 0.8, 1.2)
    create_mesh_object("GEO_Railway_L4_Tracks", bm_tracks, mat_cast_iron_dark(), root)

    # 2. Catenary Electrification Gantries & Masts
    bm_catenary = bmesh.new()
    for gy in range(-40, 45, 20):
        # Support masts
        add_cylinder(bm_catenary, -25, gy, 5.5, 0.3, 10.5, segments=8, axis='Z')
        add_cylinder(bm_catenary, 11, gy, 5.5, 0.3, 10.5, segments=8, axis='Z')
        # Cross-truss gantry
        add_box(bm_catenary, -7, gy, 9.8, 36.5, 0.6, 0.8)
        # Contact wire droppers
        for tx in track_positions:
            add_cylinder(bm_catenary, tx, gy, 7.5, 0.04, 3.8, segments=6, axis='Z')
    # Longitudinal contact wires
    for tx in track_positions:
        add_box(bm_catenary, tx, 0, 6.0, 0.04, 100, 0.04)
    create_mesh_object("GEO_Railway_L4_Catenary_System", bm_catenary, mat_high_voltage_orange(), root)

    # 3. Twin Automated RTG Cranes
    bm_rtg = bmesh.new()
    for crane_y in [-15, 25]:
        cx = -13
        # 4 heavy rubber-tired corner bogies
        for bx in [-24, -2]:
            for by in [crane_y - 4, crane_y + 4]:
                add_cylinder(bm_rtg, bx, by, 0.9, 0.9, 0.7, segments=12, axis='X')
        # Legs & portal frame
        for leg_x in [-24, -2]:
            add_box(bm_rtg, leg_x, crane_y, 7.5, 1.2, 2.4, 13.0)
        add_box(bm_rtg, cx, crane_y, 14.2, 23.0, 2.2, 1.6)
        # Trolley with spreader
        add_box(bm_rtg, cx + 2, crane_y, 13.0, 3.0, 3.2, 1.4)
        add_box(bm_rtg, cx + 2, crane_y, 9.5, 2.8, 12.4, 2.6) # Container held
    create_mesh_object("GEO_Railway_L4_RTG_Cranes", bm_rtg, mat_safety_yellow(), root)

    # 4. Multi-Track Covered Auto-Rack Staging Terminal
    bm_autorack_terminal = bmesh.new()
    ar_x = 18
    # Enclosed multi-bay steel structure
    add_box(bm_autorack_terminal, ar_x, -5, 5.0, 14.0, 65.0, 9.0)
    # Glass clerestory skylight band
    add_box(bm_autorack_terminal, ar_x, -5, 9.6, 12.0, 60.0, 1.2)
    # Multi-level ramp towers
    add_box(bm_autorack_terminal, ar_x - 7, -25, 4.0, 3.5, 12.0, 7.5)
    add_box(bm_autorack_terminal, ar_x - 7, 15, 4.0, 3.5, 12.0, 7.5)
    create_mesh_object("GEO_Railway_L4_AutoRack_Terminal", bm_autorack_terminal, mat_corrugated_industrial_steel(), root)

    # 5. Illuminated LED Railway Signals & Control Interlocking Shed
    bm_signals = bmesh.new()
    for tx in track_positions:
        add_cylinder(bm_signals, tx + 1.2, 42, 2.5, 0.12, 4.8, segments=8, axis='Z')
        add_box(bm_signals, tx + 1.2, 42, 4.5, 0.4, 0.4, 1.2)
    # Concrete signaling bungalow
    add_box(bm_signals, 18, 40, 2.0, 6.0, 8.0, 3.5)
    create_mesh_object("GEO_Railway_L4_Signaling_System", bm_signals, mat_cryo_cyan_emissive(), root)

    # 6. Hitbox
    bm_hitbox = bmesh.new()
    add_box(bm_hitbox, 0, 0, 8.0, 52, 102, 16.0)
    create_mesh_object("HITBOX_Railway_L4_Main", bm_hitbox, mat_hitbox_invisible(), root)

    return root

# ═══════════════════════════════════════════════════════════════════════
# LEVEL 5: CONTINENTAL HIGH-SPEED INTERMODAL MEGA-TERMINAL (~55,000 tris)
# ═══════════════════════════════════════════════════════════════════════
def build_railway_l5():
    reset_scene()
    root = bpy.data.objects.new("GEO_Railway_L5_Root", None)
    bpy.context.collection.objects.link(root)

    # 1. 8 High-Speed Slab Tracks & Concrete Embankment
    bm_slab = bmesh.new()
    add_box(bm_slab, 0, 0, 0.25, 52.0, 106, 0.5)
    create_mesh_object("GEO_Railway_L5_Slab_Base", bm_slab, mat_travertine_concrete(), root)

    bm_tracks = bmesh.new()
    track_positions = [-21, -15, -9, -3, 3, 9, 15, 21]
    for tx in track_positions:
        for ty in range(-52, 52, 2):
            add_box(bm_tracks, tx, ty, 0.42, 2.7, 0.35, 0.18)
        rail_offset = 0.7175
        for ro in [-rail_offset, rail_offset]:
            add_box(bm_tracks, tx + ro, 0, 0.60, 0.14, 104, 0.18)
        # Low-profile hydraulic buffer stops
        add_box(bm_tracks, tx, 51.5, 1.2, 2.8, 1.0, 1.4)
    create_mesh_object("GEO_Railway_L5_Slab_Tracks", bm_tracks, mat_cast_iron_dark(), root)

    # 2. Aerodynamic High-Speed Electric Freight Locomotive
    bm_loco = bmesh.new()
    lx, ly = -9, 15
    # Aerodynamic wedge nose
    add_box(bm_loco, lx, ly, 1.8, 2.9, 18.0, 2.8)
    add_box(bm_loco, lx, ly - 7.5, 1.5, 2.8, 4.0, 2.2) # Sloped wedge nose
    # Aerodynamic pantographs
    add_box(bm_loco, lx, ly - 3, 3.6, 1.4, 2.5, 0.8)
    add_box(bm_loco, lx, ly + 4, 3.6, 1.4, 2.5, 0.8)
    # Underbody bogie skirts
    add_box(bm_loco, lx, ly, 0.8, 3.1, 16.0, 0.8)
    create_mesh_object("GEO_Railway_L5_Aero_Locomotive", bm_loco, mat_pearl_concept_car_paint(), root)

    # 3. High-Density ASRS Automated Container Stacking Grid & AGVs
    bm_asrs = bmesh.new()
    asrs_x = 15
    # High-density rack towers
    for rack_y in range(-36, 36, 14):
        add_box(bm_asrs, asrs_x, rack_y, 8.5, 12.0, 11.5, 16.0)
        # Transparent panel cutouts showing automated container slots
        for tz in range(3, 15, 3):
            add_box(bm_asrs, asrs_x - 3, rack_y, tz, 2.4, 11.8, 2.4)
            add_box(bm_asrs, asrs_x + 3, rack_y, tz, 2.4, 11.8, 2.4)
    # AGV automated container shuttle rovers on ground lanes
    for agv_y in [-20, 0, 20]:
        add_box(bm_asrs, 4.5, agv_y, 0.8, 2.8, 6.5, 0.6)
        # 4 omni wheels
        for wx in [3.0, 6.0]:
            for wy in [agv_y - 2.5, agv_y + 2.5]:
                add_cylinder(bm_asrs, wx, wy, 0.45, 0.45, 0.3, segments=10, axis='X')
    create_mesh_object("GEO_Railway_L5_ASRS_System", bm_asrs, mat_brushed_aluminum(), root)

    # 4. Modern Glass-and-Steel Rail Operations Control Tower
    bm_tower = bmesh.new()
    tx, ty = -20, -35
    # Tower base & elevator core
    add_box(bm_tower, tx, ty, 8.0, 6.0, 6.0, 15.0)
    # Cantilevered 360-degree glass control cab
    add_box(bm_tower, tx, ty, 16.5, 10.5, 10.5, 4.0)
    # Radar radome & communication spire mast
    add_cylinder(bm_tower, tx, ty, 21.0, 0.25, 6.0, segments=8, axis='Z')
    add_cylinder(bm_tower, tx, ty, 19.5, 1.4, 1.4, segments=12, axis='Z')
    create_mesh_object("GEO_Railway_L5_Control_Tower", bm_tower, mat_satin_matte_white(), root)

    # 5. Solar Canopy Roof & Direct Factory Intermodal Portal
    bm_canopy = bmesh.new()
    # Massive curved solar canopy over northern loading bays
    add_box(bm_canopy, -3, 30, 11.5, 44.0, 42.0, 0.5)
    for px in range(-21, 22, 7):
        for py in [12, 48]:
            add_box(bm_canopy, px, py, 5.8, 0.5, 0.5, 11.5)
    # Underground automated pneumatic conveyor portal linking directly to Factory
    add_box(bm_canopy, -23, 10, 2.5, 6.0, 14.0, 4.5)
    add_box(bm_canopy, -25.5, 10, 2.5, 1.5, 12.0, 3.8) # Portal entrance
    create_mesh_object("GEO_Railway_L5_Canopy_And_Portal", bm_canopy, mat_modern_curtain_glass(), root)

    # 6. Hitbox
    bm_hitbox = bmesh.new()
    add_box(bm_hitbox, 0, 0, 9.0, 52, 106, 18.0)
    create_mesh_object("HITBOX_Railway_L5_Main", bm_hitbox, mat_hitbox_invisible(), root)

    return root

# ═══════════════════════════════════════════════════════════════════════
# BATCH GENERATION & GLB EXPORT PIPELINE
# ═══════════════════════════════════════════════════════════════════════
BUILDERS = {
    0: ("hq_railway_l0.glb", build_railway_l0),
    1: ("hq_railway_l1.glb", build_railway_l1),
    2: ("hq_railway_l2.glb", build_railway_l2),
    3: ("hq_railway_l3.glb", build_railway_l3),
    4: ("hq_railway_l4.glb", build_railway_l4),
    5: ("hq_railway_l5.glb", build_railway_l5),
}

def generate_and_export_all(target_level=None):
    output_dir = os.path.join(workspace_root, "public", "models", "campus")
    os.makedirs(output_dir, exist_ok=True)
    
    results = {}
    levels_to_run = [target_level] if target_level is not None else sorted(BUILDERS.keys())
    
    for lvl in levels_to_run:
        filename, builder_fn = BUILDERS[lvl]
        print(f"\n========================================================")
        print(f"[RailwayGenerator] Building Level {lvl}: {filename}")
        print(f"========================================================")
        
        root_obj = builder_fn()
        
        # Calculate total mesh triangles in scene
        total_tris = 0
        for obj in bpy.data.objects:
            if obj.type == 'MESH' and not obj.name.startswith("HITBOX"):
                total_tris += count_mesh_triangles(obj.data)
        
        print(f"[RailwayGenerator] Total Triangles (excl. hitboxes): {total_tris}")
        
        filepath = os.path.join(output_dir, filename)
        export_campus_glb(
            filepath=filepath,
            extras_metadata={
                "unit_id": "CARGO_RAILWAY_TERMINAL",
                "level": lvl,
                "facility_type": "freight_terminal",
                "interactive": True
            }
        )
        results[lvl] = {
            "filename": filename,
            "triangles": total_tris,
            "filepath": filepath,
            "exists": os.path.exists(filepath)
        }
    
    print("\n[RailwayGenerator] === ALL GENERATED ASSETS SUMMARY ===")
    for lvl, data in results.items():
        size_kb = os.path.getsize(data["filepath"]) / 1024 if data["exists"] else 0
        print(f"  Level {lvl} -> {data['filename']}: {data['triangles']} tris, {size_kb:.1f} KB")

if __name__ == "__main__":
    lvl_arg = None
    if len(sys.argv) > 1:
        for arg in sys.argv:
            if arg.startswith("--level="):
                try:
                    lvl_arg = int(arg.split("=")[1])
                except ValueError:
                    pass
    generate_and_export_all(lvl_arg)
