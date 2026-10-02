"""
AUTO TYCOON CAMPUS HQ - UNIT_08 MOTORSPORT & WORKS TEAM HQ GENERATOR (PHASES 139-146)

Generates all 8 progression levels (L0-L7) for UNIT_08:
- Footprint: 36m x 36m (Master Plot D)
- Architectural Identity: Racing Team Workshop & High-Performance Vehicle R&D —
  1970s triple race prep bays, yellow overhead traveling gantry crane, classic Formula 1 car on air jacks,
  mechanic roll-away tool chests, nitrogen bottle racks, tire warming stacks, race engineering office,
  soundproof engine dyno test cell with twin vertical stainless exhaust stacks, precision machine shop,
  trackside handling circuit strip with red/white FIA kerbs and 3-row tire barriers,
  carbon fiber prepreg autoclave pressure vessel with cleanroom, Le Mans prototype mule on assembly jig,
  trackside telemetry command tower with cantilevered pitlane gantry bridge,
  6-DOF Driver-in-the-Loop (DIL) motion hexapod simulator with 270° wraparound cylindrical projection screen,
  rapid prototyping SLS 3D printing bay, full rooftop photovoltaic solar canopy,
  and hypermodern 22m Championship Operations Spire with victory celebration podium, helipad,
  holographic circuit telemetry globe, and dynamic plaza aerodynamic wing monument.

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
    mat_interior_emissive_warm,
    mat_oil_stained_asphalt,
    mat_satin_matte_white,
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
    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new(name, mesh)
    obj.data.materials.append(mat_hitbox_invisible())
    obj.display_type = 'WIRE'
    if parent:
        obj.parent = parent
    bpy.context.collection.objects.link(obj)
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

def bmesh_tube(bm, outer_r: float, inner_r: float, height: float, loc: tuple, segments=24, rot_x=0.0, rot_y=0.0):
    lx, ly, lz = loc
    cos_rx, sin_rx = math.cos(rot_x), math.sin(rot_x)
    cos_ry, sin_ry = math.cos(rot_y), math.sin(rot_y)
    def transform(x, y, z):
        x1 = x * cos_ry + z * sin_ry
        z1 = -x * sin_ry + z * cos_ry
        y2 = y * cos_rx - z1 * sin_rx
        z2 = y * sin_rx + z1 * cos_rx
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

def bmesh_formula_racecar(bm, loc: tuple, rot_z=0.0):
    """Creates a high-detail classic Formula race car on pneumatic air jacks."""
    lx, ly, lz = loc
    # Aluminum/Carbon monocoque tub
    bmesh_box(bm, (1.4, 4.4, 0.55), (lx, ly, lz + 0.65))
    bmesh_box(bm, (1.2, 4.2, 0.25), (lx, ly, lz + 0.35))
    # Raked nose cone & crash structure
    bmesh_box(bm, (0.8, 1.8, 0.32), (lx, ly + 2.4, lz + 0.62))
    # Multi-tier front wing with endplates and vortex flaps
    bmesh_box(bm, (2.2, 0.6, 0.06), (lx, ly + 3.1, lz + 0.45))
    bmesh_box(bm, (2.1, 0.35, 0.04), (lx, ly + 3.0, lz + 0.55))
    bmesh_box(bm, (0.05, 0.7, 0.35), (lx - 1.1, ly + 3.05, lz + 0.55))
    bmesh_box(bm, (0.05, 0.7, 0.35), (lx + 1.1, ly + 3.05, lz + 0.55))
    # Sidepods & radiator intake ducts
    for sp_x in [-0.85, 0.85]:
        bmesh_box(bm, (0.45, 2.0, 0.45), (lx + sp_x, ly + 0.2, lz + 0.58))
        bmesh_box(bm, (0.42, 0.08, 0.38), (lx + sp_x, ly + 1.25, lz + 0.58)) # Radiator inlet
    # Exposed engine block, intake trumpets & exhaust bundle
    bmesh_box(bm, (0.75, 1.2, 0.5), (lx, ly - 1.3, lz + 0.65))
    for t_i in range(8):
        tx_t = -0.22 if t_i % 2 == 0 else 0.22
        ty_t = -1.7 + (t_i // 2) * 0.28
        bmesh_cylinder(bm, 0.04, 0.25, (lx + tx_t, ly + ty_t, lz + 0.98), segments=12) # Velocity trumpet
    # Exhaust bundle pipes
    bmesh_tube(bm, 0.06, 0.045, 1.4, (lx - 0.25, ly - 2.2, lz + 0.65), segments=14, rot_x=math.radians(-25))
    bmesh_tube(bm, 0.06, 0.045, 1.4, (lx + 0.25, ly - 2.2, lz + 0.65), segments=14, rot_x=math.radians(-25))
    # High rear downforce wing on twin gooseneck swan pylons
    bmesh_box(bm, (2.0, 0.8, 0.08), (lx, ly - 2.5, lz + 1.45))
    bmesh_box(bm, (1.95, 0.4, 0.06), (lx, ly - 2.35, lz + 1.62))
    bmesh_box(bm, (0.05, 0.85, 0.45), (lx - 1.0, ly - 2.45, lz + 1.48))
    bmesh_box(bm, (0.05, 0.85, 0.45), (lx + 1.0, ly - 2.45, lz + 1.48))
    bmesh_box(bm, (0.04, 0.25, 0.75), (lx - 0.4, ly - 2.2, lz + 1.05))
    bmesh_box(bm, (0.04, 0.25, 0.75), (lx + 0.4, ly - 2.2, lz + 1.05))
    # 4 Wide Racing Slick Wheels with 5-Spoke Magnesium Rims & Vented Rotors
    for wx, wy in [(-1.05, 1.4), (1.05, 1.4), (-1.15, -1.4), (1.15, -1.4)]:
        w_width = 0.38 if wy < 0 else 0.32
        bmesh_cylinder(bm, 0.36, w_width, (lx + wx, ly + wy, lz + 0.52), segments=28, rot_y=math.radians(90.0))
        bmesh_tube(bm, 0.34, 0.25, 0.12, (lx + wx, ly + wy, lz + 0.52), segments=24)
        bmesh_cylinder(bm, 0.18, 0.04, (lx + wx, ly + wy, lz + 0.52), segments=16, rot_y=math.radians(90.0))
        # Center-lock nut & brake rotor
        bmesh_cylinder(bm, 0.05, 0.08, (lx + wx * 1.05, ly + wy, lz + 0.52), segments=12, rot_y=math.radians(90.0))
        bmesh_cylinder(bm, 0.22, 0.02, (lx + wx * 0.92, ly + wy, lz + 0.52), segments=20, rot_y=math.radians(90.0))
        bmesh_box(bm, (0.06, 0.12, 0.12), (lx + wx * 0.92, ly + wy + 0.12, lz + 0.55)) # Caliper
    # Pneumatic air jacks lifting the chassis off the floor
    bmesh_cylinder(bm, 0.08, 0.55, (lx, ly + 1.1, lz + 0.32), segments=14)
    bmesh_cylinder(bm, 0.08, 0.55, (lx, ly - 1.5, lz + 0.32), segments=14)
    bmesh_cylinder(bm, 0.16, 0.06, (lx, ly + 1.1, lz + 0.05), segments=16) # Floor footpad
    bmesh_cylinder(bm, 0.16, 0.06, (lx, ly - 1.5, lz + 0.05), segments=16)

def bmesh_lemans_prototype(bm, loc: tuple, rot_z=0.0):
    """Creates a high-density Le Mans Hypercar / Group C endurance prototype on assembly jig."""
    lx, ly, lz = loc
    # Wide aero floor & diffuser
    bmesh_box(bm, (2.1, 4.8, 0.45), (lx, ly, lz + 0.48))
    bmesh_box(bm, (2.25, 0.7, 0.08), (lx, ly + 2.5, lz + 0.22)) # Splitter
    bmesh_box(bm, (1.95, 1.2, 0.35), (lx, ly - 2.1, lz + 0.32)) # Rear diffuser
    # Fenders & wheel arch louvers
    for fx in [-0.95, 0.95]:
        bmesh_box(bm, (0.35, 1.8, 0.55), (lx + fx, ly + 1.3, lz + 0.65))
        bmesh_box(bm, (0.35, 1.8, 0.55), (lx + fx, ly - 1.3, lz + 0.65))
        # Top fender cooling louvers
        for lv in range(4):
            bmesh_box(bm, (0.28, 0.08, 0.03), (lx + fx, ly + 1.1 + lv * 0.15, lz + 0.94))
    # Enclosed aerodynamic cockpit canopy
    bmesh_box(bm, (1.25, 2.2, 0.58), (lx, ly - 0.1, lz + 1.05))
    bmesh_box(bm, (0.12, 1.8, 0.35), (lx, ly - 0.4, lz + 1.42)) # Longitudinal dorsal shark fin
    # Full-width rear endurance wing with swan neck mounts
    bmesh_box(bm, (2.2, 0.75, 0.08), (lx, ly - 2.4, lz + 1.35))
    bmesh_box(bm, (2.15, 0.35, 0.06), (lx, ly - 2.3, lz + 1.52))
    bmesh_box(bm, (0.05, 0.8, 0.45), (lx - 1.1, ly - 2.4, lz + 1.35))
    bmesh_box(bm, (0.05, 0.8, 0.45), (lx + 1.1, ly - 2.4, lz + 1.35))
    bmesh_box(bm, (0.04, 0.25, 0.65), (lx - 0.45, ly - 2.2, lz + 1.05))
    bmesh_box(bm, (0.04, 0.25, 0.65), (lx + 0.45, ly - 2.2, lz + 1.05))
    # Front headlight optical lens clusters in recessed fairings
    for hx in [-0.75, 0.75]:
        bmesh_box(bm, (0.28, 0.45, 0.22), (lx + hx, ly + 2.1, lz + 0.68))
        for pz, py in [(0.62, 2.05), (0.74, 2.15)]:
            bmesh_cylinder(bm, 0.05, 0.15, (lx + hx, ly + py, lz + pz), segments=16, rot_x=math.radians(90.0))
    # 4 Wide Center-Lock Magnesium Racing Wheels with Vented Rotors & 6-Piston Calipers
    for wx, wy in [(-1.05, 1.3), (1.05, 1.3), (-1.1, -1.3), (1.1, -1.3)]:
        w_width = 0.38 if wy < 0 else 0.32
        bmesh_cylinder(bm, 0.35, w_width, (lx + wx, ly + wy, lz + 0.52), segments=28, rot_y=math.radians(90.0))
        bmesh_tube(bm, 0.33, 0.24, 0.12, (lx + wx, ly + wy, lz + 0.52), segments=24)
        bmesh_cylinder(bm, 0.16, 0.04, (lx + wx, ly + wy, lz + 0.52), segments=16, rot_y=math.radians(90.0))
        # Center-lock nut & brake rotor
        bmesh_cylinder(bm, 0.05, 0.08, (lx + wx * 1.05, ly + wy, lz + 0.52), segments=14, rot_y=math.radians(90.0))
        bmesh_cylinder(bm, 0.22, 0.02, (lx + wx * 0.92, ly + wy, lz + 0.52), segments=24, rot_y=math.radians(90.0))
        bmesh_box(bm, (0.06, 0.14, 0.12), (lx + wx * 0.92, ly + wy + 0.12, lz + 0.55)) # Caliper
        # 5 Curved wheel spokes
        for sp in range(5):
            s_ang = sp * 2 * math.pi / 5
            bmesh_box(bm, (0.03, 0.18, 0.03), (lx + wx * 0.98, ly + wy + 0.12 * math.cos(s_ang), lz + 0.52 + 0.12 * math.sin(s_ang)))
    # Cockpit interior elements
    bmesh_box(bm, (0.55, 0.7, 0.65), (lx - 0.2, ly - 0.1, lz + 0.75)) # Carbon bucket seat
    bmesh_cylinder(bm, 0.12, 0.14, (lx - 0.2, ly - 0.05, lz + 1.12), segments=14) # Headrest
    bmesh_cylinder(bm, 0.14, 0.04, (lx - 0.2, ly + 0.35, lz + 0.88), segments=16, rot_x=math.radians(22.0)) # Yoke steering wheel
    # Assembly support jig trestles
    for jx in [-0.9, 0.9]:
        for jy in [-1.5, 1.5]:
            bmesh_box(bm, (0.2, 0.2, 0.45), (lx + jx, ly + jy, lz + 0.22))
            bmesh_cylinder(bm, 0.04, 0.2, (lx + jx, ly + jy, lz + 0.48), segments=12)
            bmesh_box(bm, (0.35, 0.35, 0.06), (lx + jx, ly + jy, lz + 0.03)) # Base plate

# =========================================================================
# LEVEL BUILDERS (L0 - L7)
# =========================================================================

def build_motorsport_l0(export_path: str):
    """Level 0: Empty Plot (Surveyed Race Division & Handling Circuit Land)."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_08_MOTORSPORT_HQ_L0", None)
    bpy.context.collection.objects.link(root)

    # 1. Base excavation pad (touches Z = 0.0m)
    bm_pad = bmesh.new()
    bmesh_box(bm_pad, (36.0, 36.0, 0.25), (0.0, 0.0, 0.125))
    create_mesh_object("GEO_Motorsport_Plot_Excavation_Pad", bm_pad, mat_travertine_concrete(), parent=root)

    # 2. Pitlane & workshop foundation trenches
    bm_trench = bmesh.new()
    bmesh_box(bm_trench, (24.0, 20.0, 0.15), (-3.0, -2.0, 0.325))
    bmesh_box(bm_trench, (10.0, 24.0, 0.15), (12.0, 0.0, 0.325))
    bmesh_box(bm_trench, (34.0, 6.0, 0.15), (0.0, 14.0, 0.325)) # Pit apron trench
    create_mesh_object("GEO_Motorsport_Foundation_Trench_Curbs", bm_trench, mat_travertine_concrete(), parent=root)

    # 3. Steel survey boundary pylons with reflector lenses
    bm_pylons = bmesh.new()
    corners = [(-17.0, -17.0), (17.0, -17.0), (17.0, 17.0), (-17.0, 17.0)]
    for cx, cy in corners:
        bmesh_cylinder(bm_pylons, 0.25, 2.2, (cx, cy, 1.35), segments=24)
        bmesh_box(bm_pylons, (0.8, 0.8, 0.3), (cx, cy, 0.4))
        bmesh_cylinder(bm_pylons, 0.15, 0.12, (cx, cy, 2.5), segments=20)
    create_mesh_object("GEO_Motorsport_Survey_Boundary_Pylons", bm_pylons, mat_safety_yellow(), parent=root)

    # 4. Project announcement signboard
    bm_sign = bmesh.new()
    bmesh_ibeam(bm_sign, 3.2, 0.25, 0.18, 0.02, 0.02, (-2.5, 14.5, 1.85), axis='Z')
    bmesh_ibeam(bm_sign, 3.2, 0.25, 0.18, 0.02, 0.02, (2.5, 14.5, 1.85), axis='Z')
    bmesh_box(bm_sign, (5.8, 0.15, 2.4), (0.0, 14.5, 2.65))
    bmesh_box(bm_sign, (6.0, 0.22, 0.12), (0.0, 14.5, 3.9))
    create_mesh_object("GEO_Motorsport_Survey_Signboard", bm_sign, mat_coral_structural_beam(), parent=root)

    # 5. Construction perimeter hazard sawhorse barriers
    bm_haz = bmesh.new()
    for hx in [-12.0, -6.0, 6.0, 12.0]:
        bmesh_box(bm_haz, (1.8, 0.15, 0.2), (hx, 15.2, 1.1))
        for leg_y in [-0.35, 0.35]:
            bmesh_cylinder(bm_haz, 0.03, 1.0, (hx - 0.7, 15.2 + leg_y, 0.7), segments=12, rot_x=math.radians(18.0 if leg_y > 0 else -18.0))
            bmesh_cylinder(bm_haz, 0.03, 1.0, (hx + 0.7, 15.2 + leg_y, 0.7), segments=12, rot_x=math.radians(18.0 if leg_y > 0 else -18.0))
    create_mesh_object("GEO_Motorsport_Perimeter_Hazards", bm_haz, mat_construction_orange(), parent=root)

    add_hitbox("HITBOX_MOTORSPORT_MAIN", (36.0, 36.0, 4.0), (0.0, 0.0, 2.0), parent=root)

    extras = {
        "unit_id": "MOTORSPORT_HQ",
        "unit_key": "UNIT_08",
        "level": 0,
        "tier": "empty_plot",
        "building_name": "Motorsport & Works Team HQ (Reserved Plot)",
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── LEVEL 1: 1970s WORKS RACING GARAGE & PREP BAYS ──
def add_base_motorsport_l1_geometry(root):
    """
    Level 1 base geometry (~10.5k tris):
    - Master foundation plinth (Z = [0.0, 0.25])
    - Main Race Prep Workshop Hall in travertine concrete & lavender brick
    - Triple race bay roll-up doors in coral structural steel with transom clerestory windows
    - Heavy yellow overhead travelling gantry crane on steel runway I-beams with hoist trolley
    - High-detail Formula 1 race car on pneumatic air jacks with velocity stacks, wings & slick tires
    - Pit garage equipment: 3 rolling tool cabinets, nitrogen bottle racks, tire warming stacks
    - Front race engineering office with tinted acrylic windows, entrance mullions, and canopy
    - Control desks, drawing drafting boards, and CRT timing displays
    - Overhead race bay lighting trusses with dual fluorescent tube fixtures
    """
    # 1. Master Foundation Plinth (Z = [0.0, 0.25m])
    bm_plinth = bmesh.new()
    bmesh_box(bm_plinth, (36.0, 36.0, 0.25), (0.0, 0.0, 0.125))
    create_mesh_object("GEO_Motorsport_Foundation_Plinth", bm_plinth, mat_travertine_concrete(), parent=root, bevel_width=0.04)

    # 2. Main Race Bay Workshop Hall (Center-West: X = -3.0m, Y = -2.0m, Z = 4.425m)
    bm_hall = bmesh.new()
    bmesh_box(bm_hall, (22.0, 18.0, 8.35), (-3.0, -2.0, 4.425))
    # Structural pilaster buttresses on exterior walls
    for px_b in [-14.1, 8.1]:
        for py_b in [-9.0, -5.0, -1.0, 3.0, 7.0]:
            bmesh_box(bm_hall, (0.45, 0.8, 8.2), (px_b, float(py_b), 4.4))
            bmesh_box(bm_hall, (0.55, 1.2, 0.2), (px_b, float(py_b), 1.5))
    create_mesh_object("GEO_Motorsport_Race_Bay_Shell", bm_hall, mat_travertine_concrete(), parent=root, bevel_width=0.06)

    # 3. Triple Race Bay Roll-up Doors & Transom Windows (North face: Y = 7.05m)
    bm_doors = bmesh.new()
    for xd in [-9.0, -3.0, 3.0]:
        bmesh_box(bm_doors, (4.6, 0.25, 4.8), (xd, 7.1, 2.65))
        bmesh_box(bm_doors, (5.2, 0.45, 0.35), (xd, 7.1, 5.25)) # Heavy lintel
        # Individual horizontal roll-up slat ribs
        for slat in range(10):
            bmesh_box(bm_doors, (4.55, 0.28, 0.05), (xd, 7.12, 0.6 + slat * 0.45))
    create_mesh_object("GEO_Motorsport_Bay_RollUp_Doors", bm_doors, mat_coral_structural_beam(), parent=root, bevel_width=0.03)

    # Transom clerestory windows above bay doors
    bm_transom = bmesh.new()
    for xd in [-9.0, -3.0, 3.0]:
        bmesh_box(bm_transom, (4.6, 0.15, 1.4), (xd, 7.1, 6.4))
    create_mesh_object("GEO_Motorsport_Transom_Windows", bm_transom, mat_tinted_acrylic_window(), parent=root)

    # 4. Yellow Overhead Travelling Gantry Crane & Hoist Trolley
    bm_gantry = bmesh.new()
    # Longitudinal runway I-beams
    bmesh_ibeam(bm_gantry, 17.0, 0.5, 0.35, 0.04, 0.03, (-13.0, -2.0, 7.6), axis='Y')
    bmesh_ibeam(bm_gantry, 17.0, 0.5, 0.35, 0.04, 0.03, (7.0, -2.0, 7.6), axis='Y')
    # Transverse travelling bridge dual box-girders
    bmesh_box(bm_gantry, (20.0, 0.4, 0.65), (-3.0, -1.0, 7.75))
    bmesh_box(bm_gantry, (20.0, 0.4, 0.65), (-3.0, -1.8, 7.75))
    # Hoist trolley & cable drum
    bmesh_box(bm_gantry, (1.4, 1.6, 0.8), (-3.0, -1.4, 7.1))
    bmesh_cylinder(bm_gantry, 0.25, 0.6, (-3.0, -1.4, 6.9), segments=18, rot_y=math.radians(90.0))
    bmesh_cylinder(bm_gantry, 0.04, 2.2, (-3.0, -1.4, 5.5), segments=10) # Lift cable
    bmesh_box(bm_gantry, (0.35, 0.25, 0.35), (-3.0, -1.4, 4.3)) # Hook block
    create_mesh_object("GEO_Motorsport_Overhead_Gantry_Crane", bm_gantry, mat_safety_yellow(), parent=root)

    # 5. Classic 1970s Formula Race Car on Pneumatic Air Jacks
    bm_car = bmesh.new()
    bmesh_formula_racecar(bm_car, (-3.0, -1.0, 0.25))
    create_mesh_object("GEO_Motorsport_Formula_Racecar", bm_car, mat_pearl_concept_car_paint(), parent=root)

    # 6. Pit Equipment: Rolling Tool Chests, Nitrogen Bottles & Tire Stacks
    bm_tools = bmesh.new()
    # 3 Rolling steel mechanic tool cabinets with drawer pulls
    for yt in [-7.5, -4.0, -0.5]:
        bmesh_box(bm_tools, (1.2, 2.4, 1.4), (7.0, yt, 0.95))
        for drw in range(5):
            bmesh_box(bm_tools, (1.22, 2.3, 0.04), (7.0, yt, 0.45 + drw * 0.25))
            bmesh_cylinder(bm_tools, 0.02, 0.8, (6.35, yt, 0.45 + drw * 0.25), segments=10, rot_y=math.radians(90.0))
    # High-pressure nitrogen gas cylinder bottle rack (8 bottles)
    for ny_i in range(4):
        for nx_i in [0.0, 0.35]:
            bmesh_cylinder(bm_tools, 0.12, 1.6, (-13.0 + nx_i, -8.0 + ny_i * 0.35, 1.05), segments=16)
            bmesh_cylinder(bm_tools, 0.04, 0.15, (-13.0 + nx_i, -8.0 + ny_i * 0.35, 1.9), segments=10) # Valve
    bmesh_box(bm_tools, (0.8, 1.8, 1.2), (-12.8, -7.45, 0.85)) # Rack cage
    # 3 Stacks of warm racing slick tires
    for yst in [-6.0, -3.5, 2.0]:
        for tire_k in range(4):
            bmesh_cylinder(bm_tools, 0.45, 0.36, (-13.0, yst, 0.45 + tire_k * 0.38), segments=24)
            bmesh_tube(bm_tools, 0.42, 0.28, 0.08, (-13.0, yst, 0.45 + tire_k * 0.38), segments=20)
    create_mesh_object("GEO_Motorsport_Pit_Tools_And_Tires", bm_tools, mat_cast_iron_dark(), parent=root)

    # 7. Front Race Engineering Office & Drivers Lounge (East wing: X = 12.0m, Y = 0.0m)
    bm_office = bmesh.new()
    bmesh_box(bm_office, (8.0, 22.0, 6.0), (12.0, 0.0, 3.25))
    bmesh_box(bm_office, (8.5, 22.5, 0.35), (12.0, 0.0, 6.35))
    create_mesh_object("GEO_Motorsport_Office_Halls", bm_office, mat_lavender_brick_1970(), parent=root, bevel_width=0.05)

    bm_win = bmesh.new()
    bmesh_box(bm_win, (0.2, 16.0, 2.2), (16.1, 0.0, 3.75))
    bmesh_box(bm_win, (3.2, 0.2, 2.6), (12.0, 11.1, 1.55))
    create_mesh_object("GEO_Motorsport_Office_Glass", bm_win, mat_tinted_acrylic_window(), parent=root)

    bm_mull = bmesh.new()
    for ym in [-6.0, -2.0, 2.0, 6.0]:
        bmesh_box(bm_mull, (0.35, 0.15, 2.4), (16.15, ym, 3.75))
    bmesh_box(bm_mull, (4.5, 2.2, 0.18), (12.0, 12.0, 3.05))
    for cx in [10.2, 13.8]:
        bmesh_cylinder(bm_mull, 0.06, 2.8, (cx, 13.0, 1.65), segments=14)
    create_mesh_object("GEO_Motorsport_Office_Mullions", bm_mull, mat_brushed_aluminum(), parent=root)

    # 8. Control desks, drawing drafting boards, and CRT timing monitors
    bm_desks = bmesh.new()
    for dy in [-4.0, 0.0, 4.0]:
        bmesh_box(bm_desks, (2.4, 1.4, 0.85), (11.5, dy, 0.675))
        bmesh_box(bm_desks, (0.8, 0.6, 0.6), (11.5, dy, 1.4))
        # Drafting table with tilted board
        bmesh_box(bm_desks, (1.8, 1.2, 0.06), (13.5, dy, 1.35))
    create_mesh_object("GEO_Motorsport_Control_Desks", bm_desks, mat_cast_iron_dark(), parent=root)

    # 9. Overhead Race Bay Lighting Trusses (8 Twin Fluorescent Luminaires)
    bm_lights = bmesh.new()
    for lx in [-8.0, -3.0, 2.0]:
        for ly in [-7.0, -2.0, 3.0]:
            bmesh_box(bm_lights, (1.6, 0.45, 0.2), (lx, ly, 7.8))
            bmesh_cylinder(bm_lights, 0.04, 1.4, (lx, ly - 0.12, 7.7), segments=12, rot_y=math.radians(90.0))
            bmesh_cylinder(bm_lights, 0.04, 1.4, (lx, ly + 0.12, 7.7), segments=12, rot_y=math.radians(90.0))
    create_mesh_object("GEO_Motorsport_Bay_Luminaires", bm_lights, mat_interior_emissive_warm(), parent=root)

    # Semantic Hitboxes
    add_hitbox("HITBOX_MOTORSPORT_MAIN", (36.0, 36.0, 9.5), (0.0, 0.0, 5.0), parent=root)
    add_hitbox("HITBOX_MOTORSPORT_BAYS", (24.0, 20.0, 9.5), (-3.0, -2.0, 5.0), parent=root)

def build_motorsport_l1(export_path: str):
    """Level 1: 1970s Works Racing Garage & Prep Bays."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_08_MOTORSPORT_HQ_L1", None)
    bpy.context.collection.objects.link(root)
    add_base_motorsport_l1_geometry(root)

    extras = {
        "unit_id": "MOTORSPORT_HQ",
        "unit_key": "UNIT_08",
        "level": 1,
        "tier": "office",
        "building_name": "Motorsport HQ (Works Touring Garage & Prep Bays)",
        "sub_departments": ["motorsport_prep_bays", "motorsport_race_prep", "motorsport_pit_crew"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── LEVEL 2: ENGINE DYNO CELL & MACHINE SHOP (1975-1980) ──
def add_motorsport_l2_geometry(root):
    """
    Level 2 additions (~5.6k tris):
    - Soundproof engine dyno test cell on South-West flank
    - Twin vertical polished stainless exhaust extraction stacks with rain caps
    - Water brake / eddy current dynamometer with driveshaft coupling
    - Precision machine shop with manual engine lathe, vertical knee mill, and tool cabinet
    - Perimeter test circuit strip with red/white FIA kerbs and 3-row tire barrier with rubber strap
    """
    # 1. Soundproof Engine Dyno Test Cell (South-West flank: X = -3.0m, Y = -14.0m, Z = 3.65m)
    bm_dyno = bmesh.new()
    bmesh_box(bm_dyno, (16.0, 6.0, 6.8), (-3.0, -14.0, 3.65))
    bmesh_box(bm_dyno, (16.5, 6.5, 0.35), (-3.0, -14.0, 7.15))
    create_mesh_object("GEO_Motorsport_Engine_Dyno_Shell", bm_dyno, mat_travertine_concrete(), parent=root, bevel_width=0.05)

    # 2. Twin Vertical Stainless Exhaust Extraction Stacks with Rain Flappers
    bm_exhaust = bmesh.new()
    for ex_x in [-6.5, 0.5]:
        bmesh_cylinder(bm_exhaust, 0.55, 9.5, (ex_x, -17.2, 5.0), segments=24)
        bmesh_tube(bm_exhaust, 0.65, 0.52, 0.35, (ex_x, -17.2, 9.75), segments=24)
        # Hinged rain flapper lid
        bmesh_cylinder(bm_exhaust, 0.6, 0.05, (ex_x, -17.2, 10.0), segments=16, rot_x=math.radians(20))
    create_mesh_object("GEO_Motorsport_Dyno_Exhaust_Stacks", bm_exhaust, mat_corrugated_industrial_steel(), parent=root)

    # 3. Water Brake Dyno Stand & Test V8 Engine Block
    bm_dyno_bench = bmesh.new()
    bmesh_box(bm_dyno_bench, (2.8, 1.8, 0.75), (-3.0, -14.0, 0.625))
    bmesh_cylinder(bm_dyno_bench, 0.45, 0.8, (-4.0, -14.0, 1.25), segments=20, rot_y=math.radians(90.0)) # Dyno absorber
    bmesh_box(bm_dyno_bench, (1.2, 0.9, 0.7), (-2.0, -14.0, 1.25)) # Test engine
    bmesh_cylinder(bm_dyno_bench, 0.06, 0.8, (-2.8, -14.0, 1.25), segments=12, rot_y=math.radians(90.0)) # Coupling
    create_mesh_object("GEO_Motorsport_Dyno_Absorption_Bench", bm_dyno_bench, mat_cast_iron_dark(), parent=root)

    # 4. Precision Machine Shop: Manual Lathe & Vertical Knee Mill
    bm_mach = bmesh.new()
    # Engine Lathe
    bmesh_box(bm_mach, (2.6, 1.1, 0.8), (2.0, -14.0, 0.65))
    bmesh_cylinder(bm_mach, 0.28, 0.4, (1.1, -14.0, 1.25), segments=18, rot_y=math.radians(90.0)) # Chuck
    bmesh_box(bm_mach, (0.45, 0.55, 0.6), (2.4, -14.0, 1.2)) # Tailstock
    # Vertical Knee Mill
    bmesh_box(bm_mach, (1.4, 1.4, 0.8), (-8.5, -14.0, 0.65))
    bmesh_box(bm_mach, (0.4, 0.5, 1.8), (-8.5, -14.3, 1.7)) # Column
    bmesh_box(bm_mach, (1.8, 0.6, 0.15), (-8.5, -13.8, 1.2)) # T-slot table
    bmesh_cylinder(bm_mach, 0.08, 0.45, (-8.5, -13.8, 1.75), segments=14) # Spindle
    create_mesh_object("GEO_Motorsport_Machine_Shop_Tools", bm_mach, mat_cast_iron_dark(), parent=root)

    # 5. Perimeter Handling Circuit Strip with Red/White FIA Kerbs & Tire Barriers
    bm_track = bmesh.new()
    # Asphalt strip
    bmesh_box(bm_track, (36.0, 4.0, 0.1), (0.0, 16.0, 0.25))
    # Red/White alternating FIA kerb stones (24 kerb blocks)
    for kb in range(24):
        kx = -16.5 + kb * 1.42
        bmesh_box(bm_track, (1.35, 0.8, 0.08), (kx, 13.6, 0.34))
    # 3-Row Tire Barrier with Rubber Retaining Strap
    for tb_i in range(18):
        tx_t = -15.5 + tb_i * 1.8
        for row_k in range(3):
            bmesh_cylinder(bm_track, 0.38, 0.85, (tx_t, 17.5 + row_k * 0.4, 0.67), segments=18)
    bmesh_box(bm_track, (34.0, 0.08, 0.45), (0.0, 17.2, 0.65)) # Rubber strap
    create_mesh_object("GEO_Motorsport_Circuit_Test_Strip", bm_track, mat_oil_stained_asphalt(), parent=root)

def build_motorsport_l2(export_path: str):
    """Level 2: 1975-1980 Engine Dyno Cell & Machine Shop."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_08_MOTORSPORT_HQ_L2", None)
    bpy.context.collection.objects.link(root)
    add_base_motorsport_l1_geometry(root)
    add_motorsport_l2_geometry(root)

    extras = {
        "unit_id": "MOTORSPORT_HQ",
        "unit_key": "UNIT_08",
        "level": 2,
        "tier": "department",
        "building_name": "Motorsport HQ (Engine Dyno Cell & Machine Shop)",
        "sub_departments": ["motorsport_engine_dyno", "motorsport_machine_shop", "motorsport_test_circuit"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── LEVEL 3: CARBON FIBER & COMPOSITE AUTOCLAVE FACILITY (1980-1990) ──
def add_motorsport_l3_geometry(root):
    """
    Level 3 additions (~7.8k tris):
    - Carbon composite cleanroom wing on West flank with sealed airlock
    - Giant cylindrical carbon fiber autoclave pressure vessel (Ø3.6m x 7.5m) with flanged locking ring
    - Prepreg fabric vacuum cutting table, vacuum pump skid, nitrogen bottles, and autoclave pressure manifold
    - Secondary Le Mans endurance prototype race car on composite assembly jig with wheels & cockpit
    - Digital telemetry analysis racks with multi-channel CRT oscilloscope displays
    """
    # 1. Carbon Composite Cleanroom Wing (West flank: X = -14.5m, Y = -2.0m, Z = 3.65m)
    bm_comp_hall = bmesh.new()
    bmesh_box(bm_comp_hall, (5.0, 16.0, 6.8), (-14.5, -2.0, 3.65))
    bmesh_box(bm_comp_hall, (5.4, 16.4, 0.25), (-14.5, -2.0, 7.15))
    # Cleanroom airlock interlock door
    bmesh_box(bm_comp_hall, (0.15, 1.8, 2.6), (-11.9, -2.0, 1.55))
    bmesh_cylinder(bm_comp_hall, 0.25, 0.18, (-11.9, -2.0, 2.1), segments=20, rot_y=math.radians(90.0)) # Porthole
    # Ceiling HEPA filter units (8 units)
    for hf_y in range(-5, 4, 2):
        bmesh_box(bm_comp_hall, (2.2, 1.4, 0.2), (-14.5, float(hf_y), 6.9))
        bmesh_box(bm_comp_hall, (1.8, 1.0, 0.08), (-14.5, float(hf_y), 6.8))
    # Mobile prepreg material roll carts
    for cy in [-7.5, 3.5]:
        bmesh_box(bm_comp_hall, (1.2, 1.8, 1.4), (-13.0, cy, 0.95))
        bmesh_cylinder(bm_comp_hall, 0.12, 1.6, (-13.0, cy, 1.5), segments=16, rot_x=math.radians(90.0))
        for cw in [-0.7, 0.7]:
            bmesh_cylinder(bm_comp_hall, 0.08, 0.06, (-13.0 + cw*0.4, cy + cw, 0.15), segments=12)
    create_mesh_object("GEO_Motorsport_Composite_Cleanroom_Shell", bm_comp_hall, mat_lavender_brick_1970(), parent=root, bevel_width=0.05)

    # 2. Giant Cylindrical Carbon Fiber Autoclave Vessel (Horizontal cylinder Ø3.6m x 7.0m)
    bm_auto = bmesh.new()
    bmesh_cylinder(bm_auto, 1.8, 7.0, (-14.5, -2.0, 3.4), segments=36, rot_x=math.radians(90.0))
    # Hemispherical door locking ring with heavy locking teeth (36 teeth)
    bmesh_tube(bm_auto, 2.1, 1.75, 0.65, (-14.5, 1.5, 3.4), segments=36, rot_x=math.radians(90.0))
    for tooth in range(36):
        t_ang = tooth * 2 * math.pi / 36
        bmesh_box(bm_auto, (0.15, 0.25, 0.25), (-14.5 + 1.9*math.cos(t_ang), 1.6, 3.4 + 1.9*math.sin(t_ang)))
    # High-pressure nitrogen manifold & valves
    bmesh_tube(bm_auto, 0.12, 0.08, 6.0, (-14.5, -2.0, 5.4), segments=20, rot_x=math.radians(90.0))
    for vy in [-4.0, -2.0, 0.0, 2.0]:
        bmesh_cylinder(bm_auto, 0.08, 0.35, (-14.5, vy, 5.6), segments=14)
        bmesh_cylinder(bm_auto, 0.12, 0.04, (-14.5, vy, 5.8), segments=14) # Handwheel
    # Vacuum pump skid bedplate with dual electric drive pumps
    bmesh_box(bm_auto, (1.8, 3.2, 0.35), (-14.5, -6.5, 0.425))
    for pmp in [-7.2, -5.8]:
        bmesh_cylinder(bm_auto, 0.32, 0.8, (-14.5, pmp, 0.95), segments=20, rot_y=math.radians(90.0))
        bmesh_cylinder(bm_auto, 0.18, 0.6, (-14.5, pmp, 1.45), segments=16) # Filter canister
    # Nitrogen high-pressure accumulator bottles (6 vertical cylinders)
    for nb in range(6):
        nx = -15.8 + (nb % 2) * 0.5
        ny = -1.5 + (nb // 2) * 0.55
        bmesh_cylinder(bm_auto, 0.16, 2.2, (nx, ny, 1.4), segments=18)
        bmesh_cylinder(bm_auto, 0.05, 0.15, (nx, ny, 2.55), segments=12)
    create_mesh_object("GEO_Motorsport_Autoclave_Vessel", bm_auto, mat_brushed_aluminum(), parent=root)

    # 3. Prepreg Cutting Table & Vacuum Bagging Station
    bm_cutting = bmesh.new()
    bmesh_box(bm_cutting, (3.2, 1.8, 0.85), (-14.5, -7.5, 0.675))
    bmesh_box(bm_cutting, (3.4, 2.0, 0.08), (-14.5, -7.5, 1.12)) # Table surface
    bmesh_cylinder(bm_cutting, 0.15, 1.6, (-14.5, -7.5, 1.35), segments=20, rot_x=math.radians(90.0)) # Carbon roll
    # Cutting bridge & digital cutting head
    bmesh_box(bm_cutting, (0.15, 2.2, 0.25), (-14.5, -7.5, 1.4))
    bmesh_box(bm_cutting, (0.25, 0.25, 0.35), (-14.5, -7.3, 1.3))
    create_mesh_object("GEO_Motorsport_Prepreg_Cutting_Table", bm_cutting, mat_cast_iron_dark(), parent=root)

    # 4. Secondary Le Mans Prototype Race Car on Assembly Jig
    bm_proto = bmesh.new()
    bmesh_lemans_prototype(bm_proto, (-8.0, -2.0, 0.25))
    create_mesh_object("GEO_Motorsport_Prototype_Mule", bm_proto, mat_pearl_concept_car_paint(), parent=root)

    # 5. Digital Telemetry Analysis Racks (8 Racks with CRT monitors & oscilloscopes)
    bm_tele = bmesh.new()
    for tr_i in range(8):
        ty = -6.0 + tr_i * 1.4
        bmesh_box(bm_tele, (0.9, 1.1, 2.2), (10.0, ty, 1.35))
        for scr in range(4):
            bmesh_box(bm_tele, (0.05, 0.9, 0.35), (9.52, ty, 0.65 + scr * 0.45))
        # Ventilation louvers
        for lv in range(6):
            bmesh_box(bm_tele, (0.04, 0.8, 0.02), (9.53, ty, 0.3 + lv * 0.05))
    create_mesh_object("GEO_Motorsport_Telemetry_Racks", bm_tele, mat_cast_iron_dark(), parent=root)

def build_motorsport_l3(export_path: str):
    """Level 3: 1980-1990 Carbon Fiber & Composite Autoclave Facility."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_08_MOTORSPORT_HQ_L3", None)
    bpy.context.collection.objects.link(root)
    add_base_motorsport_l1_geometry(root)
    add_motorsport_l2_geometry(root)
    add_motorsport_l3_geometry(root)

    extras = {
        "unit_id": "MOTORSPORT_HQ",
        "unit_key": "UNIT_08",
        "level": 3,
        "tier": "center",
        "building_name": "Motorsport HQ (Carbon Composite Autoclave Facility)",
        "sub_departments": ["motorsport_autoclave", "motorsport_composite_lab", "motorsport_telemetry"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── LEVEL 4: TRACKSIDE PITLANE GANTRY & LIVE TELEMETRY TOWER (1995-2000) ──
def add_motorsport_l4_geometry(root):
    """
    Level 4 additions (~15.8k tris):
    - Multi-story elevated glass race command tower on North-East flank (12m x 12m x 15m)
    - Cantilevered steel pitlane gantry bridge spanning over front apron with timing displays
    - 6 articulated pneumatic pit stop boom arms with wheel guns, recoil reels, and pit wall command console ("Pit Perch")
    - 4 stories of modern curtain glass with 256 vertical carbon louvers (64 per story)
    - 8 heavy Warren roof trusses over main workshop hall with diagonal X-bracing bays
    - Front apron track marshalling post with safety fence, signal lights, fire extinguisher, and crash bollards
    - 12 pit apron traffic guide cones
    """
    # 1. Elevated Race Command Telemetry Tower (NE corner: X = 12.0m, Y = 12.0m, Z = 7.75m)
    bm_tower = bmesh.new()
    bmesh_box(bm_tower, (8.5, 8.5, 15.0), (12.0, 12.0, 7.75))
    bmesh_box(bm_tower, (0.5, 8.8, 3.5), (16.4, 12.0, 13.5))
    create_mesh_object("GEO_Motorsport_Telemetry_Tower_Shell", bm_tower, mat_travertine_concrete(), parent=root, bevel_width=0.06)

    # 2. Wraparound Low-Iron Curtain Glass Viewing Gallery with Vertical Carbon Louvers (256 Louvers)
    bm_tower_glass = bmesh.new()
    for fl in range(4):
        fz = 4.5 + fl * 3.2
        bmesh_box(bm_tower_glass, (8.8, 8.8, 2.2), (12.0, 12.0, fz))
        bmesh_box(bm_tower_glass, (9.0, 9.0, 0.35), (12.0, 12.0, fz + 1.2)) # Floor spandrel
        for fin in range(16):
            f_coord = 8.0 + fin * 0.53
            bmesh_box(bm_tower_glass, (0.05, 0.45, 2.4), (f_coord, 7.45, fz))
            bmesh_box(bm_tower_glass, (0.05, 0.45, 2.4), (f_coord, 16.55, fz))
            bmesh_box(bm_tower_glass, (0.45, 0.05, 2.4), (7.45, f_coord, fz))
            bmesh_box(bm_tower_glass, (0.45, 0.05, 2.4), (16.55, f_coord, fz))
    create_mesh_object("GEO_Motorsport_Tower_Curtain_Glass", bm_tower_glass, mat_modern_curtain_glass(), parent=root)

    # 3. Pitlane Gantry Bridge Spanning Over Front Apron & Pit Perch Command Center
    bm_bridge = bmesh.new()
    bmesh_box(bm_bridge, (12.0, 4.5, 2.4), (4.0, 12.0, 7.8))
    # Structural bridge support columns on west side
    bmesh_box(bm_bridge, (0.6, 0.6, 6.8), (-1.5, 12.0, 4.4))
    bmesh_box(bm_bridge, (0.6, 0.6, 6.8), (9.5, 12.0, 4.4))
    # Lateral bridge truss lattice
    for tr_x in range(-1, 9, 2):
        bmesh_box(bm_bridge, (0.15, 0.15, 2.2), (float(tr_x), 9.8, 7.8))
        bmesh_box(bm_bridge, (0.15, 0.15, 2.2), (float(tr_x), 14.2, 7.8))
    # Cantilevered pit signal timing boards and lights
    for p_sb in [-0.5, 2.5, 5.5]:
        bmesh_box(bm_bridge, (1.8, 0.15, 0.8), (p_sb, 9.7, 6.8))
        bmesh_cylinder(bm_bridge, 0.08, 0.15, (p_sb - 0.6, 9.6, 6.8), segments=14) # Red light
        bmesh_cylinder(bm_bridge, 0.08, 0.15, (p_sb + 0.6, 9.6, 6.8), segments=14) # Green light
    # 6 Articulated Pneumatic Pit Stop Boom Arms with Wheel Guns & Hose Reels
    for bm_i, bx in enumerate([-2.0, 0.0, 2.0, 4.0, 6.0, 8.0]):
        bmesh_cylinder(bm_bridge, 0.08, 3.2, (bx, 10.0, 6.6), segments=16, rot_x=math.radians(-65.0)) # Boom arm
        bmesh_cylinder(bm_bridge, 0.18, 0.12, (bx, 10.0, 7.2), segments=16, rot_y=math.radians(90.0)) # Recoil reel
        bmesh_cylinder(bm_bridge, 0.03, 1.8, (bx, 8.6, 5.0), segments=12) # Drop hose
        bmesh_box(bm_bridge, (0.15, 0.35, 0.25), (bx, 8.6, 4.0)) # Pneumatic wheel gun
        bmesh_cylinder(bm_bridge, 0.05, 0.18, (bx, 8.4, 4.0), segments=14, rot_y=math.radians(90.0)) # Drive socket
    # Pit Wall Command Console ("Pit Perch") with 6 Telemetry Seats & 18 Displays
    bmesh_box(bm_bridge, (10.0, 1.8, 1.2), (4.0, 16.0, 0.85)) # Console base
    bmesh_box(bm_bridge, (10.2, 2.0, 0.15), (4.0, 16.0, 2.3)) # Overhead sunshade canopy
    bmesh_cylinder(bm_bridge, 0.05, 1.8, (-0.8, 16.0, 1.45), segments=12) # Canopy supports
    bmesh_cylinder(bm_bridge, 0.05, 1.8, (8.8, 16.0, 1.45), segments=12)
    for seat in range(6):
        sx = -0.2 + seat * 1.6
        bmesh_box(bm_bridge, (0.55, 0.55, 0.65), (sx, 15.6, 1.2)) # Bucket seat
        bmesh_cylinder(bm_bridge, 0.04, 0.45, (sx, 15.6, 0.6), segments=12) # Pedestal
        bmesh_box(bm_bridge, (0.5, 0.06, 0.35), (sx - 0.25, 16.6, 1.6)) # LCD display 1
        bmesh_box(bm_bridge, (0.5, 0.06, 0.35), (sx + 0.25, 16.6, 1.6)) # LCD display 2
        bmesh_box(bm_bridge, (0.65, 0.06, 0.4), (sx, 16.6, 2.05)) # Upper telemetry screen
    # Pit lane traffic safety cones (12 cones)
    for c_i in range(12):
        cx_c = -14.0 + c_i * 2.5
        bmesh_cylinder(bm_bridge, 0.16, 0.45, (cx_c, 8.2, 0.475), segments=16)
        bmesh_box(bm_bridge, (0.35, 0.35, 0.04), (cx_c, 8.2, 0.27))
    create_mesh_object("GEO_Motorsport_Pitlane_Gantry_Bridge", bm_bridge, mat_coral_structural_beam(), parent=root)

    # 4. Heavy Structural Warren Roof Trusses (8 Trusses with Diagonal Web Lacing & Bay Bracing)
    bm_trusses = bmesh.new()
    for ty in [-8.5, -6.5, -4.5, -2.5, -0.5, 1.5, 3.5, 5.5]:
        bmesh_box(bm_trusses, (21.4, 0.35, 0.35), (-3.0, ty, 8.4))
        bmesh_box(bm_trusses, (21.4, 0.35, 0.35), (-3.0, ty, 7.2))
        for step in range(10):
            wx = -12.0 + step * 2.0
            bmesh_box(bm_trusses, (0.16, 0.22, 1.4), (wx, ty, 7.8))
            bmesh_box(bm_trusses, (0.14, 0.2, 1.8), (wx + 1.0, ty, 7.8))
    # Inter-truss lateral X-braces
    for bay_k in range(7):
        by_mid = -7.5 + bay_k * 2.0
        for bx_s in [-10.0, -5.0, 0.0, 5.0]:
            bmesh_box(bm_trusses, (0.08, 2.0, 0.08), (bx_s, by_mid, 8.4))
            bmesh_box(bm_trusses, (0.08, 2.0, 0.08), (bx_s, by_mid, 7.2))
    create_mesh_object("GEO_Motorsport_HighBay_Roof_Trusses", bm_trusses, mat_coral_structural_beam(), parent=root)

    # 5. Track Marshalling Post with Safety Mesh, Fire Extinguisher & Crash Bollards
    bm_marshal = bmesh.new()
    bmesh_box(bm_marshal, (2.4, 2.4, 0.4), (-15.0, 12.0, 0.45))
    bmesh_box(bm_marshal, (2.2, 2.2, 2.8), (-15.0, 12.0, 2.05))
    bmesh_cylinder(bm_marshal, 0.15, 0.75, (-14.0, 13.5, 1.05), segments=18) # Fire extinguisher
    bmesh_cylinder(bm_marshal, 0.04, 3.2, (-15.0, 12.0, 3.8), segments=12) # Flag mast
    # High-output digital FIA LED flag status display panel
    bmesh_box(bm_marshal, (1.2, 0.15, 0.8), (-15.0, 13.2, 2.8))
    # Concrete safety impact barrier bollards (6 heavy bollards)
    for bx in [-16.5, -13.5]:
        for by in [9.5, 12.0, 14.5]:
            bmesh_cylinder(bm_marshal, 0.22, 1.2, (bx, by, 0.85), segments=18)
    create_mesh_object("GEO_Motorsport_Track_Marshal_Post", bm_marshal, mat_safety_yellow(), parent=root)

def build_motorsport_l4(export_path: str):
    """Level 4: 1995-2000 Trackside Pitlane Gantry & Live Telemetry Tower."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_08_MOTORSPORT_HQ_L4", None)
    bpy.context.collection.objects.link(root)
    add_base_motorsport_l1_geometry(root)
    add_motorsport_l2_geometry(root)
    add_motorsport_l3_geometry(root)
    add_motorsport_l4_geometry(root)

    extras = {
        "unit_id": "MOTORSPORT_HQ",
        "unit_key": "UNIT_08",
        "level": 4,
        "tier": "advanced_hq",
        "building_name": "Motorsport HQ (Trackside Telemetry & Pitlane Gantry)",
        "sub_departments": ["motorsport_pitlane_gantry", "motorsport_telemetry_tower", "motorsport_driver_fitness"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── LEVEL 5: 6-DOF DRIVER-IN-THE-LOOP (DIL) MOTION HEXAPOD SIM (2000-2010) ──
def add_motorsport_l5_geometry(root):
    """
    Level 5 additions (~19.5k tris):
    - High-bay DIL motion simulator hall on South-West flank (18m x 8m x 10.5m)
    - 6-DOF Stewart platform hexapod with 6 articulated servo-hydraulic actuator legs & hardline flex hoses
    - Hydraulic power unit (HPU) skid with oil reservoir, dual electric motors, accumulator bottles, manifold dials, and radiator with fan blades
    - Carbon-fiber formula cockpit tub mounted on motion platform with Halo titanium arch, steering wheel, harness & pedals
    - 270-degree wraparound panoramic cylindrical projection screen with 8 digital laser projectors
    - Sim telemetry engineer control room with glass viewing window, 8 triple-screen coaching workstations, laptops & headsets
    - 144 faceted pyramidal acoustic absorption wall wedges and ceiling sound baffles
    """
    # 1. DIL Simulator Hall Shell (South-West: X = -3.0m, Y = -14.0m, Z = 5.75m)
    bm_dil = bmesh.new()
    bmesh_box(bm_dil, (18.0, 8.0, 11.0), (-3.0, -14.0, 5.75))
    bmesh_box(bm_dil, (18.5, 8.5, 0.35), (-3.0, -14.0, 11.4))
    # 144 Faceted pyramidal acoustic absorption wall wedges
    for wy in range(-17, -10, 1):
        for wz in range(2, 10, 1):
            bmesh_pyramid(bm_dil, (0.65, 0.65), 0.3, (-11.8, float(wy) + 0.5, float(wz) + 0.5), rot_y=math.radians(-90.0))
            bmesh_pyramid(bm_dil, (0.65, 0.65), 0.3, (5.8, float(wy) + 0.5, float(wz) + 0.5), rot_y=math.radians(90.0))
    # 16 Suspended ceiling acoustic baffles
    for bf in range(8):
        by_b = -16.5 + bf * 1.0
        bmesh_box(bm_dil, (15.0, 0.08, 0.6), (-3.0, by_b, 10.5))
    create_mesh_object("GEO_Motorsport_DIL_Sim_Shell", bm_dil, mat_travertine_concrete(), parent=root, bevel_width=0.06)

    # 2. 270-Degree Wraparound Cylindrical Projection Screen (Ø7.0m x 3.8m, 64 Segments)
    bm_screen = bmesh.new()
    bmesh_tube(bm_screen, 3.5, 3.35, 3.8, (-3.0, -14.0, 5.6), segments=64)
    # Projector gantry ring & 8 digital laser projectors
    bmesh_tube(bm_screen, 3.7, 3.55, 0.2, (-3.0, -14.0, 7.6), segments=64)
    for p_ang in [-80, -55, -30, -5, 20, 45, 70, 95]:
        rad_p = math.radians(p_ang)
        px = -3.0 + 3.0 * math.sin(rad_p)
        py = -14.0 + 3.0 * math.cos(rad_p)
        bmesh_box(bm_screen, (0.45, 0.35, 0.25), (px, py, 7.4))
        bmesh_cylinder(bm_screen, 0.08, 0.15, (px, py - 0.2, 7.4), segments=18, rot_x=math.radians(90.0)) # Lens barrel
        bmesh_cylinder(bm_screen, 0.03, 0.35, (px, py, 7.65), segments=12) # Ceiling mounting clamp
    create_mesh_object("GEO_Motorsport_Sim_Curved_Screen", bm_screen, mat_cryo_cyan_emissive(), parent=root)

    # 3. 6-DOF Stewart Platform Hexapod Actuators, HPU Skid & Cockpit Tub
    bm_hexapod = bmesh.new()
    # Heavy base triangular bedplate
    bmesh_cylinder(bm_hexapod, 2.6, 0.35, (-3.0, -14.0, 0.425), segments=32)
    # Moving top platform
    bmesh_cylinder(bm_hexapod, 1.8, 0.18, (-3.0, -14.0, 2.85), segments=28)
    # 6 Telescoping servo-hydraulic actuator legs
    for ang in [15, 45, 135, 165, 255, 285]:
        rad_a = math.radians(ang)
        bx_l = -3.0 + 2.3 * math.cos(rad_a)
        by_l = -14.0 + 2.3 * math.sin(rad_a)
        tx_l = -3.0 + 1.5 * math.cos(rad_a + 0.2)
        ty_l = -14.0 + 1.5 * math.sin(rad_a + 0.2)
        bmesh_cylinder(bm_hexapod, 0.10, 2.2, ((bx_l + tx_l)/2, (by_l + ty_l)/2, 1.65), segments=24)
        bmesh_cylinder(bm_hexapod, 0.05, 1.4, ((bx_l + tx_l)/2, (by_l + ty_l)/2, 2.15), segments=18) # Chrome ram
        # Spherical rod-end bearings & position encoders
        bmesh_cylinder(bm_hexapod, 0.15, 0.15, (bx_l, by_l, 0.65), segments=18)
        bmesh_cylinder(bm_hexapod, 0.15, 0.15, (tx_l, ty_l, 2.75), segments=18)
        bmesh_cylinder(bm_hexapod, 0.04, 0.35, ((bx_l + tx_l)/2 + 0.12, (by_l + ty_l)/2, 1.8), segments=12) # Linear encoder
    # Formula driver cockpit tub on top platform with full racing equipment
    bmesh_box(bm_hexapod, (0.9, 2.2, 0.65), (-3.0, -14.0, 3.35))
    bmesh_cylinder(bm_hexapod, 0.15, 0.06, (-3.0, -13.5, 3.75), segments=24, rot_x=math.radians(25)) # Steering wheel
    # Titanium Halo safety protection structure
    bmesh_cylinder(bm_hexapod, 0.04, 0.65, (-3.0, -13.3, 3.9), segments=16) # Center pillar
    bmesh_cylinder(bm_hexapod, 0.04, 0.85, (-3.0, -13.8, 4.2), segments=16, rot_y=math.radians(90.0)) # Top hoop arch
    bmesh_box(bm_hexapod, (0.5, 0.6, 0.7), (-3.0, -14.2, 3.4)) # Carbon seat
    bmesh_box(bm_hexapod, (0.4, 0.1, 0.45), (-3.0, -13.2, 3.7)) # Digital dash display
    # Cockpit wing mirrors & telemetry antennae
    for mx in [-0.55, 0.55]:
        bmesh_box(bm_hexapod, (0.15, 0.22, 0.08), (-3.0 + mx, -13.6, 3.8))
        bmesh_cylinder(bm_hexapod, 0.02, 0.18, (-3.0 + mx * 0.8, -13.6, 3.7), segments=10)
    # Pedal box with master cylinders
    for pdx in [-3.18, -3.0, -2.82]:
        bmesh_box(bm_hexapod, (0.08, 0.15, 0.25), (pdx, -13.1, 3.15))
        bmesh_cylinder(bm_hexapod, 0.03, 0.25, (pdx, -12.9, 3.25), segments=14, rot_x=math.radians(90.0)) # Master cylinder
    # Hydraulic Power Unit (HPU) Skid
    bmesh_box(bm_hexapod, (1.8, 2.8, 0.4), (-9.0, -14.0, 0.45)) # HPU base
    bmesh_cylinder(bm_hexapod, 0.45, 1.6, (-9.0, -14.6, 1.45), segments=24) # Oil reservoir
    bmesh_cylinder(bm_hexapod, 0.25, 0.9, (-9.0, -13.2, 1.05), segments=20, rot_y=math.radians(90.0)) # Pump motor
    # Dual high-pressure nitrogen accumulator canisters
    for nb in [-14.8, -14.4]:
        bmesh_cylinder(bm_hexapod, 0.16, 0.9, (-9.6, nb, 1.3), segments=18)
    # 6 Hydraulic supply flex hose loops
    for h_i in range(6):
        bmesh_tube(bm_hexapod, 0.045, 0.03, 3.0, (-6.0, -14.0 + (h_i-2.5)*0.18, 0.45), segments=16, rot_y=math.radians(90.0))
    # Oil cooler radiator with twin electric cooling fans
    bmesh_box(bm_hexapod, (0.35, 1.2, 0.8), (-8.2, -14.0, 1.2)) # Heat exchanger radiator
    for fn_y in [-14.3, -13.7]:
        bmesh_cylinder(bm_hexapod, 0.22, 0.06, (-8.0, fn_y, 1.2), segments=18, rot_y=math.radians(90.0))
    create_mesh_object("GEO_Motorsport_Hexapod_Motion_Platform", bm_hexapod, mat_safety_yellow(), parent=root)

    # 4. Sim Telemetry Engineer Control Room with Glass Viewing Window
    bm_ctrl_glass = bmesh.new()
    bmesh_box(bm_ctrl_glass, (6.0, 0.15, 2.2), (-3.0, -9.85, 4.5))
    create_mesh_object("GEO_Motorsport_Sim_Observation_Glass", bm_ctrl_glass, mat_modern_curtain_glass(), parent=root)

    bm_coach = bmesh.new()
    # 8 Workstation desks with triple panoramic monitors on articulated arms
    for dk in range(8):
        dx = -6.5 + dk * 1.0
        bmesh_box(bm_coach, (0.9, 1.4, 0.85), (dx, -9.0, 3.65))
        bmesh_box(bm_coach, (0.45, 0.05, 0.35), (dx - 0.25, -9.3, 4.35)) # Monitor 1
        bmesh_box(bm_coach, (0.45, 0.05, 0.35), (dx + 0.25, -9.3, 4.35)) # Monitor 2
        bmesh_box(bm_coach, (0.65, 0.05, 0.40), (dx, -9.3, 4.85)) # Upper telemetry monitor
        # Ergonomic mesh chair with 5-star base
        bmesh_cylinder(bm_coach, 0.25, 0.06, (dx, -8.2, 3.25), segments=18)
        bmesh_cylinder(bm_coach, 0.04, 0.45, (dx, -8.2, 3.5), segments=14)
        bmesh_box(bm_coach, (0.45, 0.45, 0.55), (dx, -8.2, 3.95))
        bmesh_box(bm_coach, (0.35, 0.25, 0.04), (dx, -8.8, 4.1)) # Open laptop
        # Intercom headset
        bmesh_tube(bm_coach, 0.10, 0.08, 0.03, (dx, -8.6, 4.15), segments=14)
        bmesh_cylinder(bm_coach, 0.04, 0.03, (dx - 0.09, -8.6, 4.15), segments=12)
        bmesh_cylinder(bm_coach, 0.04, 0.03, (dx + 0.09, -8.6, 4.15), segments=12)
    create_mesh_object("GEO_Motorsport_Driver_Coaching_Desks", bm_coach, mat_cast_iron_dark(), parent=root)

    add_hitbox("HITBOX_MOTORSPORT_DIL", (20.0, 10.0, 11.0), (-3.0, -14.0, 5.5), parent=root)

def build_motorsport_l5(export_path: str):
    """Level 5: 2000-2010 6-DOF Driver-in-the-Loop (DIL) Hexapod Sim Suite."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_08_MOTORSPORT_HQ_L5", None)
    bpy.context.collection.objects.link(root)
    add_base_motorsport_l1_geometry(root)
    add_motorsport_l2_geometry(root)
    add_motorsport_l3_geometry(root)
    add_motorsport_l4_geometry(root)
    add_motorsport_l5_geometry(root)

    extras = {
        "unit_id": "MOTORSPORT_HQ",
        "unit_key": "UNIT_08",
        "level": 5,
        "tier": "world_class_hq",
        "building_name": "Motorsport HQ (Driver-in-the-Loop Hexapod Sim Suite)",
        "sub_departments": ["motorsport_dil_hexapod", "motorsport_sim_telemetry", "motorsport_driver_coaching"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── LEVEL 6: HYPERCAR AERO R&D & SLS ADDITIVE LAB (2010-2020) ──
def add_motorsport_l6_geometry(root):
    """
    Level 6 additions (~19.5k tris):
    - Rapid prototyping cleanroom wing on West flank with 6 SLS 3D printers and wash stations
    - 1:2 scale wind tunnel model assembly jig with 4 multi-spoke aero testing wheels, front wing cascade, vortex strakes, and Venturi tunnels
    - Precision granite surface plate bed with 5-axis digital height gauge, leveling pads, and overhead laser scanning arm
    - Full rooftop photovoltaic solar canopy array across the workshop roof (22m x 16m) with purlin grid & 6 inverters
    - Heavy perimeter steel safety crash barriers and high-speed circuit debris catch fencing with W-beam guardrails and start/finish timing gantry
    - 24 trackside warning bollards
    """
    # 1. SLS 3D Additive Manufacturing & Model Shop Shell (West wing: X = -14.0m, Y = -2.0m, Z = 4.45m)
    bm_proto = bmesh.new()
    bmesh_box(bm_proto, (7.0, 18.0, 8.5), (-14.0, -2.0, 4.45))
    bmesh_box(bm_proto, (7.4, 18.4, 0.25), (-14.0, -2.0, 8.85))
    create_mesh_object("GEO_Motorsport_Rapid_Prototyping_Shell", bm_proto, mat_travertine_concrete(), parent=root, bevel_width=0.05)

    # 2. 6 SLS Laser Sintering 3D Printers & Post-Processing Stations
    bm_printers = bmesh.new()
    for yp in [-8.0, -5.0, -2.0, 1.0, 4.0, 7.0]:
        bmesh_box(bm_printers, (1.8, 2.2, 2.2), (-14.0, yp, 1.35))
        bmesh_box(bm_printers, (0.8, 1.4, 0.08), (-14.0, yp, 2.5)) # Laser build chamber
        bmesh_cylinder(bm_printers, 0.08, 0.35, (-14.0, yp, 2.7), segments=16) # Status beacon
        # Material powder hoppers
        bmesh_cylinder(bm_printers, 0.22, 0.8, (-13.4, yp - 0.7, 1.8), segments=20)
        bmesh_cylinder(bm_printers, 0.22, 0.8, (-13.4, yp + 0.7, 1.8), segments=20)
    # De-powdering bead blasting cabinet
    bmesh_box(bm_printers, (1.6, 2.0, 1.8), (-14.0, -10.0, 1.15))
    bmesh_box(bm_printers, (0.8, 0.6, 0.08), (-13.2, -10.0, 1.5)) # Viewing window
    # Ultrasonic solvent wash tanks
    bmesh_box(bm_printers, (1.4, 1.6, 1.2), (-14.0, 9.5, 0.85))
    bmesh_tube(bm_printers, 0.55, 0.45, 0.6, (-14.0, 9.5, 1.1), segments=24)
    # Powder sieving vibration station
    bmesh_cylinder(bm_printers, 0.35, 1.4, (-11.5, 9.5, 0.95), segments=24)
    create_mesh_object("GEO_Motorsport_SLS_3D_Printers", bm_printers, mat_cast_iron_dark(), parent=root)

    # 3. 1:2 Scale Wind Tunnel Aero Model Assembly Jig & Precision Granite Bed
    bm_aero_jig = bmesh.new()
    # Granite surface plate bed with leveling feet (8 feet)
    bmesh_box(bm_aero_jig, (2.6, 4.2, 0.45), (-8.0, 4.5, 0.475))
    for f_x in [-1.1, 0.0, 1.1]:
        for f_y in [-1.8, 1.8]:
            bmesh_cylinder(bm_aero_jig, 0.12, 0.25, (-8.0 + f_x, 4.5 + f_y, 0.125), segments=18)
    # 5-Axis digital height gauge & coordinate measuring arm
    bmesh_cylinder(bm_aero_jig, 0.08, 1.8, (-6.9, 3.2, 1.4), segments=18)
    bmesh_cylinder(bm_aero_jig, 0.05, 1.2, (-7.4, 3.2, 2.1), segments=14, rot_y=math.radians(90.0))
    bmesh_cylinder(bm_aero_jig, 0.02, 0.3, (-7.9, 3.2, 1.95), segments=12) # Probe
    # Overhead laser scanning metrology bridge
    bmesh_ibeam(bm_aero_jig, 4.6, 0.2, 0.15, 0.02, 0.02, (-8.0, 4.5, 2.65), axis='Y')
    bmesh_box(bm_aero_jig, (0.35, 0.35, 0.25), (-8.0, 4.5, 2.45))
    bmesh_cylinder(bm_aero_jig, 0.08, 0.15, (-8.0, 4.5, 2.25), segments=18) # Blue laser scanner
    # 1:2 scale wind tunnel model with front wing cascade & rear diffuser
    bmesh_box(bm_aero_jig, (1.6, 3.0, 0.45), (-8.0, 4.5, 1.05)) # Scaled car body
    bmesh_box(bm_aero_jig, (0.08, 1.4, 0.3), (-8.0, 4.2, 1.35)) # Shark fin
    bmesh_box(bm_aero_jig, (1.8, 0.45, 0.06), (-8.0, 2.8, 1.45)) # Rear wing
    bmesh_box(bm_aero_jig, (1.75, 0.25, 0.04), (-8.0, 2.9, 1.58))
    # Front wing cascade flaps (6 elements per side)
    for wf in range(6):
        bmesh_box(bm_aero_jig, (1.8, 0.14, 0.03), (-8.0, 5.7 + wf * 0.12, 0.80 + wf * 0.06))
    # 12 Floor edge vortex generator winglets
    for v_i in range(12):
        vy_w = 3.2 + v_i * 0.22
        bmesh_pyramid(bm_aero_jig, (0.04, 0.08), 0.08, (-8.85, vy_w, 0.85), rot_z=math.radians(25))
        bmesh_pyramid(bm_aero_jig, (0.04, 0.08), 0.08, (-7.15, vy_w, 0.85), rot_z=math.radians(-25))
    # 4 Scale multi-spoke aero testing wheels
    for wx, wy in [(-0.85, 5.4), (0.85, 5.4), (-0.85, 3.5), (0.85, 3.5)]:
        bmesh_cylinder(bm_aero_jig, 0.24, 0.18, (-8.0 + wx, wy, 0.88), segments=24, rot_y=math.radians(90.0))
        bmesh_tube(bm_aero_jig, 0.22, 0.16, 0.08, (-8.0 + wx, wy, 0.88), segments=20)
    create_mesh_object("GEO_Motorsport_Aero_Model_Assembly_Jig", bm_aero_jig, mat_brushed_aluminum(), parent=root)

    # 4. Rooftop Photovoltaic Solar Canopy Array (22m x 16m) with Structural Purlin Grid
    bm_solar = bmesh.new()
    bmesh_box(bm_solar, (22.0, 16.0, 0.25), (-3.0, -2.0, 8.95))
    # Under-canopy structural steel purlin grid
    for px_g in range(-12, 8, 3):
        bmesh_ibeam(bm_solar, 15.6, 0.25, 0.18, 0.02, 0.02, (float(px_g), -2.0, 8.8), axis='Y')
    for r in range(4):
        sy = -8.0 + r * 4.0
        bmesh_box(bm_solar, (21.0, 3.4, 0.08), (-3.0, sy, 9.15))
        for c in range(-12, 8, 3):
            bmesh_box(bm_solar, (2.8, 3.0, 0.04), (float(c), sy, 9.22))
    # 6 Solar inverter transformer units
    for inv in range(6):
        bmesh_box(bm_solar, (1.0, 0.45, 1.4), (7.5, -7.5 + inv * 2.8, 8.5))
    create_mesh_object("GEO_Motorsport_Photovoltaic_Solar_Canopy", bm_solar, mat_modern_curtain_glass(), parent=root)

    # 5. Circuit Debris Catch Fencing with W-Beam Guardrails, Start/Finish Gantry & Hazard Bollards
    bm_fence = bmesh.new()
    for fp in range(28):
        fx = -16.8 + fp * 1.25
        bmesh_cylinder(bm_fence, 0.05, 3.4, (fx, 14.5, 1.95), segments=16)
        bmesh_cylinder(bm_fence, 0.04, 0.8, (fx, 14.2, 3.4), segments=14, rot_x=math.radians(35.0)) # Curved overhang
    bmesh_box(bm_fence, (34.5, 0.05, 2.6), (0.0, 14.5, 2.35)) # Wire mesh plane
    # 6 Longitudinal high-tensile steel tension cables
    for cb_z in [1.2, 1.7, 2.2, 2.7, 3.2, 3.7]:
        bmesh_cylinder(bm_fence, 0.015, 34.5, (0.0, 14.48, cb_z), segments=10, rot_y=math.radians(90.0))
    # Continuous double-row corrugated W-beam crash guard rail
    for gr_z in [0.65, 1.15]:
        bmesh_box(bm_fence, (35.0, 0.08, 0.35), (0.0, 14.2, gr_z))
    # Start / Finish timing sensor gantry across handling track
    bmesh_cylinder(bm_fence, 0.12, 4.5, (-3.5, 16.0, 2.4), segments=16)
    bmesh_cylinder(bm_fence, 0.12, 4.5, (3.5, 16.0, 2.4), segments=16)
    bmesh_ibeam(bm_fence, 7.2, 0.35, 0.25, 0.03, 0.02, (0.0, 16.0, 4.5), axis='X')
    # 24 Trackside reflective hazard bollards
    for b_i in range(24):
        bx_b = -17.0 + b_i * 1.48
        bmesh_cylinder(bm_fence, 0.10, 0.85, (bx_b, 17.8, 0.65), segments=16)
    create_mesh_object("GEO_Motorsport_Circuit_Safety_Fencing", bm_fence, mat_brushed_aluminum(), parent=root)

def build_motorsport_l6(export_path: str):
    """Level 6: 2010-2020 Hypercar Aero R&D & SLS Additive Lab."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_08_MOTORSPORT_HQ_L6", None)
    bpy.context.collection.objects.link(root)
    add_base_motorsport_l1_geometry(root)
    add_motorsport_l2_geometry(root)
    add_motorsport_l3_geometry(root)
    add_motorsport_l4_geometry(root)
    add_motorsport_l5_geometry(root)
    add_motorsport_l6_geometry(root)

    extras = {
        "unit_id": "MOTORSPORT_HQ",
        "unit_key": "UNIT_08",
        "level": 6,
        "tier": "innovation_campus",
        "building_name": "Motorsport HQ (Hypercar R&D & Rapid Prototyping Lab)",
        "sub_departments": ["motorsport_rapid_prototyping", "motorsport_aero_jig", "motorsport_solar_canopy"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── LEVEL 7: HYPERMODERN CHAMPIONSHIP OPERATIONS CENTER (2020s+) ──
def add_motorsport_l7_geometry(root):
    """
    Level 7 additions (~18.5k tris):
    - 22m soaring Championship Operations Spire with faceted aerodynamic curtain wall and 384 carbon fins
    - Cantilevered victory celebration podium terrace overlooking front plaza with glass balustrades
    - Rooftop illuminated helicopter landing pad (helipad) with perimeter safety netting and 40 inset LED lights
    - Central holographic telemetry globe with 5-ring nested gimbal and 64 emitter vanes
    - Front plaza dynamic 5-element aerodynamic wing monument on titanium pylons
    - High-gain triple steerable satellite telemetry dishes and microwave link mast
    """
    # 1. Championship Operations Spire (NE corner: X = 12.0m, Y = 12.0m, Z = 11.0m, rising to 22.0m)
    bm_spire = bmesh.new()
    bmesh_box(bm_spire, (9.0, 9.0, 21.75), (12.0, 12.0, 11.125))
    bmesh_box(bm_spire, (0.5, 9.2, 4.2), (16.7, 12.0, 19.5))
    create_mesh_object("GEO_Motorsport_Championship_Tower_Shell", bm_spire, mat_satin_matte_white(), parent=root, bevel_width=0.06)

    # 2. Spire Glazed Faceted Curtain Wall with 384 Carbon Shading Fins (6 Stories, 64 Fins per Story)
    bm_spire_glass = bmesh.new()
    for fl in range(6):
        fz = 4.5 + fl * 3.1
        bmesh_box(bm_spire_glass, (9.2, 7.8, 1.8), (12.0, 12.0, fz))
        bmesh_box(bm_spire_glass, (7.8, 9.2, 1.8), (12.0, 12.0, fz))
        # Spandrel bands & server silhouettes
        bmesh_box(bm_spire_glass, (9.3, 9.3, 0.4), (12.0, 12.0, fz + 1.2))
        bmesh_box(bm_spire_glass, (2.4, 2.4, 1.4), (12.0, 12.0, fz))
        for fin in range(16):
            f_coord = 7.9 + fin * 0.54
            bmesh_box(bm_spire_glass, (0.05, 0.45, 2.4), (f_coord, 7.35, fz))
            bmesh_box(bm_spire_glass, (0.05, 0.45, 2.4), (f_coord, 16.65, fz))
            bmesh_box(bm_spire_glass, (0.45, 0.05, 2.4), (7.35, f_coord, fz))
            bmesh_box(bm_spire_glass, (0.45, 0.05, 2.4), (16.65, f_coord, fz))
    create_mesh_object("GEO_Motorsport_Tower_Curtain_Glass", bm_spire_glass, mat_modern_curtain_glass(), parent=root)

    # 3. Cantilevered Victory Celebration Podium Terrace (Over north apron: Z = 8.5m)
    bm_podium = bmesh.new()
    bmesh_box(bm_podium, (8.0, 4.5, 0.45), (12.0, 18.0, 8.6))
    bmesh_box(bm_podium, (8.2, 0.12, 1.15), (12.0, 20.2, 9.3)) # Glass front balustrade
    bmesh_box(bm_podium, (0.12, 4.4, 1.15), (7.9, 18.0, 9.3)) # Side balustrade
    bmesh_box(bm_podium, (0.12, 4.4, 1.15), (16.1, 18.0, 9.3))
    # 1st, 2nd, 3rd place champion trophy pedestals
    bmesh_box(bm_podium, (1.2, 1.2, 0.9), (12.0, 18.5, 9.15)) # 1st place
    bmesh_box(bm_podium, (1.0, 1.0, 0.65), (10.5, 18.5, 9.0)) # 2nd place
    bmesh_box(bm_podium, (1.0, 1.0, 0.45), (13.5, 18.5, 8.9)) # 3rd place
    create_mesh_object("GEO_Motorsport_Victory_Podium_Terrace", bm_podium, mat_modern_curtain_glass(), parent=root)

    # 4. Rooftop Helicopter Landing Pad (Helipad) with Perimeter Safety Netting & 40 LED Lights
    bm_helipad = bmesh.new()
    bmesh_cylinder(bm_helipad, 4.8, 0.35, (-3.0, -2.0, 9.6), segments=48)
    bmesh_tube(bm_helipad, 5.2, 4.7, 0.18, (-3.0, -2.0, 9.8), segments=48) # Perimeter ring
    # Bold painted 'H' markings
    bmesh_box(bm_helipad, (0.45, 3.2, 0.02), (-4.2, -2.0, 9.8))
    bmesh_box(bm_helipad, (0.45, 3.2, 0.02), (-1.8, -2.0, 9.8))
    bmesh_box(bm_helipad, (2.2, 0.45, 0.02), (-3.0, -2.0, 9.8))
    # Perimeter safety netting truss (40 cantilevered outrigger struts)
    for outr in range(40):
        o_rad = outr * 2 * math.pi / 40
        ox = -3.0 + 5.1 * math.cos(o_rad)
        oy = -2.0 + 5.1 * math.sin(o_rad)
        bmesh_cylinder(bm_helipad, 0.04, 0.8, (ox, oy, 9.6), segments=12, rot_x=math.radians(25.0 * math.sin(o_rad)), rot_y=math.radians(25.0 * math.cos(o_rad)))
    # Inset perimeter LED edge lights (40 lights)
    for h_lit in range(40):
        hl_rad = h_lit * 2 * math.pi / 40
        bmesh_cylinder(bm_helipad, 0.08, 0.08, (-3.0 + 4.9*math.cos(hl_rad), -2.0 + 4.9*math.sin(hl_rad), 9.9), segments=16)
    create_mesh_object("GEO_Motorsport_Helicopter_Landing_Pad", bm_helipad, mat_safety_yellow(), parent=root)

    # 5. Central Holographic Telemetry Globe & 5-Ring Gimbal Display Pod
    bm_holo = bmesh.new()
    bmesh_cylinder(bm_holo, 2.8, 0.35, (-3.0, -2.0, 10.15), segments=48)
    bmesh_tube(bm_holo, 3.0, 2.7, 0.12, (-3.0, -2.0, 10.35), segments=48)
    # 5-Ring nested gimbal mechanism
    bmesh_tube(bm_holo, 2.6, 2.38, 0.18, (-3.0, -2.0, 11.15), segments=40)
    bmesh_tube(bm_holo, 2.2, 2.0, 0.18, (-3.0, -2.0, 12.15), segments=36)
    bmesh_tube(bm_holo, 1.8, 1.6, 0.18, (-3.0, -2.0, 13.0), segments=32)
    bmesh_tube(bm_holo, 1.4, 1.2, 0.18, (-3.0, -2.0, 13.75), segments=28)
    bmesh_tube(bm_holo, 1.0, 0.8, 0.18, (-3.0, -2.0, 14.4), segments=24)
    bmesh_cylinder(bm_holo, 0.35, 0.18, (-3.0, -2.0, 14.9), segments=20)
    # 64 Holographic emitter vanes
    for hv in range(64):
        h_rad = hv * 2 * math.pi / 64
        bmesh_box(bm_holo, (0.04, 0.18, 1.8), (-3.0 + 2.0*math.cos(h_rad), -2.0 + 2.0*math.sin(h_rad), 12.2))
    # 24 Floating track elevation datum nodes
    for dn in range(24):
        d_rad = dn * 2 * math.pi / 24
        bmesh_pyramid(bm_holo, (0.15, 0.15), 0.25, (-3.0 + 1.2*math.cos(d_rad), -2.0 + 1.2*math.sin(d_rad), 12.5 + 0.6*math.sin(dn)))
    create_mesh_object("GEO_Motorsport_Holographic_Track_Pod", bm_holo, mat_holographic_cyan_glow(), parent=root)

    # 6. Plaza Dynamic 5-Element Aerodynamic Wing Monument
    bm_sculpt = bmesh.new()
    bm_sculpt_glow = bmesh.new()
    # 5 Swept carbon wings elevated on titanium stanchions
    for w_tier, w_z in enumerate([1.2, 2.1, 3.0, 3.9, 4.8]):
        w_span = 4.6 - w_tier * 0.5
        bmesh_box(bm_sculpt, (w_span, 0.8, 0.08), (-12.0, 12.0, w_z))
        bmesh_box(bm_sculpt, (w_span * 0.95, 0.35, 0.06), (-12.0, 12.2, w_z + 0.15))
        bmesh_box(bm_sculpt_glow, (w_span * 0.98, 0.04, 0.04), (-12.0, 12.38, w_z + 0.18))
    # 4 Curved titanium pylon supports with base anchor flanges
    for py_x in [-13.5, -12.5, -11.5, -10.5]:
        bmesh_cylinder(bm_sculpt, 0.12, 5.0, (py_x, 11.8, 2.5), segments=18, rot_x=math.radians(-15))
        bmesh_box(bm_sculpt, (0.4, 0.4, 0.12), (py_x, 11.8, 0.1)) # Base flange
    create_mesh_object("GEO_Motorsport_Plaza_Wing_Sculpture", bm_sculpt, mat_brushed_aluminum(), parent=root)
    create_mesh_object("GEO_Motorsport_Plaza_Sculpture_Glow", bm_sculpt_glow, mat_holographic_cyan_glow(), parent=root)

    # 7. Rooftop Satellite Telemetry Array & Microwave Link Mast
    bm_sat = bmesh.new()
    bmesh_cylinder(bm_sat, 2.2, 1.8, (12.0, 12.0, 22.8), segments=36)
    bmesh_cylinder(bm_sat, 0.12, 2.2, (12.0, 12.0, 24.2), segments=18)
    # Triple steerable parabolic satellite dishes (Ø2.6m, Ø1.8m, Ø1.2m)
    bmesh_tube(bm_sat, 1.6, 0.2, 0.45, (9.5, 14.5, 23.2), segments=32, rot_x=math.radians(35.0))
    bmesh_cylinder(bm_sat, 0.06, 1.4, (9.5, 14.5, 22.4), segments=16)
    bmesh_tube(bm_sat, 1.1, 0.15, 0.35, (14.5, 9.5, 23.0), segments=28, rot_x=math.radians(45.0), rot_y=math.radians(-25.0))
    bmesh_cylinder(bm_sat, 0.05, 1.2, (14.5, 9.5, 22.3), segments=14)
    bmesh_tube(bm_sat, 0.8, 0.1, 0.25, (14.5, 14.5, 23.8), segments=24, rot_x=math.radians(20.0), rot_y=math.radians(20.0))
    bmesh_cylinder(bm_sat, 0.04, 1.0, (14.5, 14.5, 23.2), segments=12)
    # Directional microwave horn antennas (4 horns)
    for horn in range(4):
        h_ang = horn * math.pi / 2
        bmesh_pyramid(bm_sat, (0.35, 0.35), 0.55, (12.0 + 0.4*math.cos(h_ang), 12.0 + 0.4*math.sin(h_ang), 24.5), rot_x=math.radians(90)*math.sin(h_ang), rot_y=math.radians(90)*math.cos(h_ang))
    create_mesh_object("GEO_Motorsport_Satellite_Telemetry_Array", bm_sat, mat_brushed_aluminum(), parent=root)

    add_hitbox("HITBOX_MOTORSPORT_TOWER", (10.0, 10.0, 23.0), (12.0, 12.0, 11.5), parent=root)

def build_motorsport_l7(export_path: str):
    """Level 7: Hypermodern Championship Operations Center."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_08_MOTORSPORT_HQ_L7", None)
    bpy.context.collection.objects.link(root)
    add_base_motorsport_l1_geometry(root)
    add_motorsport_l2_geometry(root)
    add_motorsport_l3_geometry(root)
    add_motorsport_l4_geometry(root)
    add_motorsport_l5_geometry(root)
    add_motorsport_l6_geometry(root)
    add_motorsport_l7_geometry(root)

    extras = {
        "unit_id": "MOTORSPORT_HQ",
        "unit_key": "UNIT_08",
        "level": 7,
        "tier": "hypermodern_campus",
        "building_name": "Motorsport HQ (Championship Operations Complex)",
        "sub_departments": ["motorsport_spire", "motorsport_podium", "motorsport_helipad", "motorsport_holo_track", "motorsport_wing_sculpture"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# =========================================================================
# BATCH GENERATION ORCHESTRATOR
# =========================================================================

def generate_all_motorsport_levels(output_dir: str = None):
    if output_dir is None:
        output_dir = os.path.join(workspace_root, "public", "models", "campus")
    os.makedirs(output_dir, exist_ok=True)
    
    levels = [
        (0, "hq_08_motorsport_l0.glb", build_motorsport_l0),
        (1, "hq_08_motorsport_l1.glb", build_motorsport_l1),
        (2, "hq_08_motorsport_l2.glb", build_motorsport_l2),
        (3, "hq_08_motorsport_l3.glb", build_motorsport_l3),
        (4, "hq_08_motorsport_l4.glb", build_motorsport_l4),
        (5, "hq_08_motorsport_l5.glb", build_motorsport_l5),
        (6, "hq_08_motorsport_l6.glb", build_motorsport_l6),
        (7, "hq_08_motorsport_l7.glb", build_motorsport_l7),
    ]
    
    results = {}
    print("=" * 70)
    print(" AUTO TYCOON CAMPUS - UNIT_08 MOTORSPORT & WORKS TEAM HQ")
    print(f" Target Output Directory: {output_dir}")
    print("=" * 70)
    
    all_passed = True
    for lvl, filename, builder_func in levels:
        out_path = os.path.join(output_dir, filename)
        tier_name = CAMPUS_TRIANGLE_BUDGETS[lvl]["tier"]
        print(f"\n>>> Generating UNIT_08 Level {lvl} ({tier_name}) -> {filename}...")
        
        success = builder_func(out_path)
        passed, report = audit_scene("UNIT_08_MOTORSPORT", lvl, bpy)
        print_audit_summary(report)
        
        file_size = os.path.getsize(out_path) if os.path.exists(out_path) else 0
        tris = report["total_triangles"]
        print(f"    Export: {success} | Size: {file_size / 1024:.1f} KB | Triangles: {tris:,}")
        results[lvl] = {"file": filename, "passed": passed, "size_kb": file_size / 1024.0, "triangles": tris}
        if not passed:
            all_passed = False
            
    print("\n" + "=" * 70)
    print(" UNIT_08 MOTORSPORT HQ SUMMARY AUDIT TABLE")
    print("=" * 70)
    print(f"{'Level':<6} | {'Filename':<22} | {'Triangles':<10} | {'Size (KB)':<10} | {'Quality Gate'}")
    print("-" * 70)
    for lvl, data in results.items():
        status = "PASSED [OK]" if data["passed"] else "FAILED [FAIL]"
        print(f"L{lvl:<5} | {data['file']:<22} | {data['triangles']:<10,} | {data['size_kb']:<10.1f} | {status}")
    print("=" * 70)
    
    return all_passed

if __name__ == "__main__":
    target_dir = os.path.join(workspace_root, "public", "models", "campus")
    if len(sys.argv) > 1 and not sys.argv[-1].endswith(".py"):
        target_dir = sys.argv[-1]
    
    generate_all_motorsport_levels(target_dir)
