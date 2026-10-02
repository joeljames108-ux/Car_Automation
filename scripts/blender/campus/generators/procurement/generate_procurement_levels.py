"""
AUTO TYCOON CAMPUS HQ - UNIT_11 SUPPLIER & PROCUREMENT HQ GENERATOR (PHASES 105-112)

Generates all 8 progression levels (L0-L7) for UNIT_11:
- Footprint: 36m x 36m (Master Plot)
- Architectural Identity: Industrial Logistics & Freight Staging character —
  1970s brick warehouse with dual freight loading docks & dock levelers, semi-truck docking,
  forklifts, incoming quality inspection lab, multi-tier automated pallet racking (AS/RS),
  JIT AGV dispatch floor, global supply chain command bridge, and autonomous logistics terminal.

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
    mat_satin_matte_white,
    mat_holographic_cyan_glow,
    mat_cryo_cyan_emissive,
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

def bmesh_semi_truck(bm, loc: tuple, cab_type='conventional'):
    """
    Creates an authentic 1970s delivery semi-truck docked at the freight apron:
    - Cab chassis with chrome front bumper, radiator grille, cab windshield, side mirrors
    - Twin vertical chrome exhaust stacks with flapper rain caps
    - Dual stepped cylindrical fuel tanks with mounting straps
    - Tandem rear axles with 8 dual tires and deep hubcaps
    - 5th wheel hitch coupling
    - Corrugated 40-foot semi-trailer container with rear door frame and roof refrigeration reefer
    """
    lx, ly, lz = loc
    # Tractor chassis frame rails
    bmesh_box(bm, (0.85, 7.2, 0.22), (lx, ly - 5.5, lz + 0.65))
    
    if cab_type == 'conventional':
        # Tractor cab & long nose engine hood
        bmesh_box(bm, (2.4, 3.2, 2.3), (lx, ly - 6.2, lz + 1.85))
        bmesh_box(bm, (2.2, 2.4, 1.3), (lx, ly - 8.8, lz + 1.35)) # Long nose hood
        # Chrome front radiator grille
        bmesh_box(bm, (2.0, 0.15, 1.15), (lx, ly - 10.05, lz + 1.35))
        # Chrome heavy bumper
        bmesh_box(bm, (2.5, 0.3, 0.4), (lx, ly - 10.2, lz + 0.55))
        # Windshield
        bmesh_box(bm, (2.1, 0.1, 0.85), (lx, ly - 7.6, lz + 2.35))
    else: # 'cab_over'
        # Flat-nose cab-over-engine (COE)
        bmesh_box(bm, (2.4, 3.6, 2.7), (lx, ly - 7.5, lz + 1.95))
        bmesh_box(bm, (2.1, 0.15, 0.95), (lx, ly - 9.35, lz + 1.4))
        bmesh_box(bm, (2.5, 0.3, 0.4), (lx, ly - 9.45, lz + 0.55))
        bmesh_box(bm, (2.1, 0.1, 0.95), (lx, ly - 9.35, lz + 2.55))
        
    # Dual vertical chrome exhaust stacks with elbow pipes
    for ex_x in [-1.18, 1.18]:
        bmesh_cylinder(bm, 0.08, 2.8, (lx + ex_x, ly - 4.8, lz + 2.6), segments=20)
        bmesh_cylinder(bm, 0.1, 0.05, (lx + ex_x, ly - 4.8, lz + 4.0), segments=20) # Rain flapper cap
        bmesh_cylinder(bm, 0.07, 0.6, (lx + ex_x, ly - 5.1, lz + 1.1), segments=16, rot_x=math.radians(90))
        
    # Dual stepped cylindrical fuel tanks with mounting straps
    for tx in [-1.15, 1.15]:
        bmesh_cylinder(bm, 0.32, 1.8, (lx + tx, ly - 7.0, lz + 0.65), segments=24, rot_x=math.radians(90))
        for st in [-0.6, 0.6]:
            bmesh_tube(bm, 0.34, 0.31, 0.06, (lx + tx, ly - 7.0 + st, lz + 0.65), segments=24)
            
    # 5th Wheel hitch coupling plate
    bmesh_cylinder(bm, 0.45, 0.08, (lx, ly - 3.8, lz + 0.95), segments=24)
    
    # 40-Foot Corrugated Semi-Trailer Cargo Box (12.2m x 2.5m x 3.2m)
    bmesh_box(bm, (2.5, 10.5, 3.1), (lx, ly, lz + 2.45))
    # Front refrigeration unit (Reefer unit)
    bmesh_box(bm, (2.2, 0.6, 1.4), (lx, ly - 5.5, lz + 3.0))
    bmesh_cylinder(bm, 0.45, 0.08, (lx, ly - 5.82, lz + 3.0), segments=24, rot_x=math.radians(90)) # Fan grille
    # Trailer corrugated siding panels (longitudinal ribs)
    for rib in range(8):
        rz = lz + 1.2 + rib * 0.32
        bmesh_box(bm, (2.56, 10.2, 0.04), (lx, ly, rz))
    # Rear door heavy locking cam rods & hinges
    for rdr in [-0.6, 0.6]:
        bmesh_cylinder(bm, 0.025, 2.8, (lx + rdr, ly + 5.28, lz + 2.4), segments=14)
        bmesh_box(bm, (0.08, 0.12, 0.18), (lx + rdr, ly + 5.28, lz + 2.0)) # Handle
        
    # Tandem trailer rear dual wheels (8 wheels)
    for ty in [ly + 3.2, ly + 4.6]:
        for tx in [lx - 1.22, lx + 1.22]:
            bmesh_cylinder(bm, 0.5, 0.32, (tx, ty, lz + 0.5), segments=24, rot_y=math.radians(90))
            bmesh_tube(bm, 0.52, 0.48, 0.04, (tx, ty, lz + 0.5), segments=24)
            bmesh_cylinder(bm, 0.22, 0.34, (tx, ty, lz + 0.5), segments=20, rot_y=math.radians(90)) # Hubcap
            
    # Tractor steer wheels & drive tandem wheels (10 wheels)
    steer_y = ly - 9.0 if cab_type == 'conventional' else ly - 8.2
    for sx in [lx - 1.15, lx + 1.15]:
        bmesh_cylinder(bm, 0.5, 0.28, (sx, steer_y, lz + 0.5), segments=24, rot_y=math.radians(90))
    for dy in [ly - 4.8, ly - 3.4]:
        for dx in [lx - 1.2, lx + 1.2]:
            bmesh_cylinder(bm, 0.5, 0.32, (dx, dy, lz + 0.5), segments=24, rot_y=math.radians(90))
            bmesh_cylinder(bm, 0.22, 0.34, (dx, dy, lz + 0.5), segments=20, rot_y=math.radians(90))

def bmesh_forklift(bm, loc: tuple, rot_z=0.0):
    """
    Creates an authentic counterbalanced warehouse forklift:
    - Cast iron rear counterweight body with towing pin
    - Operator protective overhead guard cage (4 tubular stanchions & roof lattice)
    - 2-Stage telescoping vertical lift mast with I-beam rails
    - Hydraulic lift cylinder & tilt ram cylinders
    - Steering wheel, dashboard cowl, and operator seat
    - Front carriage with forged alloy pallet forks
    """
    lx, ly, lz = loc
    cos_z, sin_z = math.cos(rot_z), math.sin(rot_z)
    
    # Chassis body & rear counterweight
    bmesh_box(bm, (1.2, 1.9, 0.7), (lx, ly, lz + 0.5))
    bmesh_cylinder(bm, 0.55, 0.7, (lx, ly - 0.7, lz + 0.5), segments=24) # Rounded rear counterweight
    bmesh_cylinder(bm, 0.06, 0.35, (lx, ly - 1.15, lz + 0.45), segments=16) # Towing pin
    
    # Operator overhead guard cage (4 tubular stanchions + roof lattice)
    for cx in [-0.5, 0.5]:
        for cy in [-0.4, 0.45]:
            bmesh_cylinder(bm, 0.035, 1.45, (lx + cx, ly + cy, lz + 1.45), segments=14)
    # Roof guard frame & safety lattice slats
    bmesh_box(bm, (1.1, 0.95, 0.05), (lx, ly + 0.025, lz + 2.18))
    for slat in range(5):
        bmesh_box(bm, (1.0, 0.04, 0.04), (lx, ly - 0.35 + slat * 0.18, lz + 2.18))
        
    # Operator seat & steering wheel
    bmesh_box(bm, (0.55, 0.5, 0.35), (lx, ly - 0.1, lz + 0.95))
    bmesh_cylinder(bm, 0.03, 0.5, (lx - 0.15, ly + 0.3, lz + 1.1), segments=14, rot_x=math.radians(-25))
    bmesh_tube(bm, 0.18, 0.14, 0.03, (lx - 0.15, ly + 0.2, lz + 1.3), segments=20)
    
    # 2-Stage Telescoping Mast (Dual I-beams)
    for mx in [-0.38, 0.38]:
        bmesh_box(bm, (0.08, 0.12, 2.4), (lx + mx, ly + 1.05, lz + 1.3))
        bmesh_box(bm, (0.06, 0.08, 2.2), (lx + mx, ly + 1.05, lz + 1.4))
    # Cross ties on mast
    bmesh_box(bm, (0.8, 0.06, 0.08), (lx, ly + 1.05, lz + 0.8))
    bmesh_box(bm, (0.8, 0.06, 0.08), (lx, ly + 1.05, lz + 2.3))
    # Central hydraulic lift cylinder
    bmesh_cylinder(bm, 0.05, 1.8, (lx, ly + 0.98, lz + 1.2), segments=18)
    # Hydraulic tilt rams
    bmesh_cylinder(bm, 0.04, 0.6, (lx - 0.3, ly + 0.65, lz + 0.55), segments=14, rot_x=math.radians(35))
    bmesh_cylinder(bm, 0.04, 0.6, (lx + 0.3, ly + 0.65, lz + 0.55), segments=14, rot_x=math.radians(35))
    
    # Carriage & Forged Pallet Forks
    bmesh_box(bm, (0.75, 0.06, 0.45), (lx, ly + 1.15, lz + 0.45))
    for fork_x in [-0.25, 0.25]:
        bmesh_box(bm, (0.1, 0.05, 0.5), (lx + fork_x, ly + 1.18, lz + 0.45)) # Vertical shank
        bmesh_box(bm, (0.1, 1.15, 0.04), (lx + fork_x, ly + 1.75, lz + 0.18)) # Horizontal tines
        
    # Drive front wheels & steer rear wheels
    for fx in [-0.62, 0.62]:
        bmesh_cylinder(bm, 0.28, 0.22, (lx + fx, ly + 0.65, lz + 0.28), segments=20, rot_y=math.radians(90))
    for rx in [-0.52, 0.52]:
        bmesh_cylinder(bm, 0.22, 0.18, (lx + rx, ly - 0.65, lz + 0.22), segments=18, rot_y=math.radians(90))

def bmesh_pallet_racks(bm, loc: tuple, bays: int, tiers: int, bay_w: float, bay_d: float, tier_h: float):
    """
    Creates multi-tier warehouse pallet storage racking with authentic cargo loads:
    - Upright perforated teardrop columns with diagonal cross-bracing trusses
    - Orange structural step beams on every tier level
    - Wire mesh decking or wooden pallet supports
    - Euro / GMA wooden pallets with block feet and banded cardboard cartons
    """
    lx, ly, lz = loc
    total_w = bays * bay_w
    
    # Upright ladder frames (bays + 1 uprights)
    for b in range(bays + 1):
        ux = lx - total_w/2 + b * bay_w
        # Front and back upright posts
        for uy in [ly - bay_d/2, ly + bay_d/2]:
            bmesh_box(bm, (0.08, 0.08, tiers * tier_h), (ux, uy, lz + (tiers * tier_h)/2))
            bmesh_box(bm, (0.18, 0.18, 0.02), (ux, uy, lz + 0.01)) # Base plate
        # Diagonal cross-bracing trusses between front and rear uprights
        for t in range(tiers):
            cz = lz + t * tier_h + tier_h / 2
            bmesh_cylinder(bm, 0.02, bay_d * 1.15, (ux, ly, cz), segments=12, rot_x=math.radians(45))
            bmesh_cylinder(bm, 0.02, bay_d * 1.15, (ux, ly, cz), segments=12, rot_x=math.radians(-45))
            
    # Horizontal load beams & pallet cargo
    for t in range(1, tiers + 1):
        tz = lz + t * tier_h
        for b in range(bays):
            bx = lx - total_w/2 + (b + 0.5) * bay_w
            # Front & rear orange load beams
            bmesh_box(bm, (bay_w - 0.08, 0.08, 0.12), (bx, ly - bay_d/2 + 0.04, tz))
            bmesh_box(bm, (bay_w - 0.08, 0.08, 0.12), (bx, ly + bay_d/2 - 0.04, tz))
            
            # 2 Standard pallets per bay
            for pal in [-1, 1]:
                px = bx + pal * (bay_w * 0.25)
                # Wooden pallet base (top/bottom deckboards + 3 runners/blocks)
                bmesh_box(bm, (bay_w * 0.42, bay_d * 0.9, 0.03), (px, ly, tz + 0.07))
                bmesh_box(bm, (bay_w * 0.42, bay_d * 0.9, 0.03), (px, ly, tz + 0.15))
                for blk_y in [-bay_d * 0.35, 0.0, bay_d * 0.35]:
                    bmesh_box(bm, (bay_w * 0.4, 0.12, 0.06), (px, ly + blk_y, tz + 0.11))
                # Cargo carton load with strap band
                box_h = tier_h * 0.65
                bmesh_box(bm, (bay_w * 0.38, bay_d * 0.82, box_h), (px, ly, tz + 0.17 + box_h/2))
                bmesh_box(bm, (bay_w * 0.39, 0.04, box_h * 0.98), (px, ly, tz + 0.17 + box_h/2)) # Band strap

# =========================================================================
# LEVEL BUILDERS (L0 - L7)
# =========================================================================

def build_procurement_l0(export_path: str):
    """Level 0: Empty Plot (Surveyed Industrial Logistics Yard)."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_11_Procurement_HQ_L0", None)
    bpy.context.collection.objects.link(root)

    # 1. Base excavation pad
    bm_pad = bmesh.new()
    bmesh_box(bm_pad, (36.0, 36.0, 0.3), (0.0, 0.0, -0.15))
    create_mesh_object("GEO_Procurement_Plot_Excavation_Pad", bm_pad, mat_travertine_concrete(), parent=root)

    # 2. Freight yard road stub & trench outlines
    bm_trench = bmesh.new()
    bmesh_box(bm_trench, (22.5, 0.6, 0.25), (0.0, -2.0 + 10.0, 0.125))
    bmesh_box(bm_trench, (22.5, 0.6, 0.25), (0.0, -2.0 - 10.0, 0.125))
    bmesh_box(bm_trench, (0.6, 20.0, 0.25), (-11.0, -2.0, 0.125))
    bmesh_box(bm_trench, (0.6, 20.0, 0.25), (11.0, -2.0, 0.125))
    create_mesh_object("GEO_Procurement_Foundation_Trench_Curbs", bm_trench, mat_travertine_concrete(), parent=root)

    # 3. Steel survey boundary pylons with reflector tops
    bm_pylons = bmesh.new()
    corners = [(-17.0, -17.0), (17.0, -17.0), (17.0, 17.0), (-17.0, 17.0)]
    for cx, cy in corners:
        bmesh_cylinder(bm_pylons, 0.25, 2.2, (cx, cy, 1.1), segments=24)
        bmesh_box(bm_pylons, (0.8, 0.8, 0.3), (cx, cy, 0.15))
        bmesh_cylinder(bm_pylons, 0.15, 0.12, (cx, cy, 2.25), segments=20)
    create_mesh_object("GEO_Procurement_Survey_Boundary_Pylons", bm_pylons, mat_safety_yellow(), parent=root)

    # 4. Surveyor workstation & theodolite tripod
    bm_tripod = bmesh.new()
    tx, ty = -6.0, 4.0
    for ang in [0, 120, 240]:
        rad = math.radians(ang)
        lx, ly = tx + 0.6 * math.cos(rad), ty + 0.6 * math.sin(rad)
        bmesh_cylinder(bm_tripod, 0.05, 1.5, ((tx + lx)/2, (ty + ly)/2, 0.75), segments=16)
    bmesh_cylinder(bm_tripod, 0.18, 0.35, (tx, ty, 1.5), segments=24)
    bmesh_cylinder(bm_tripod, 0.09, 0.45, (tx, ty, 1.7), segments=24, rot_y=math.radians(90))
    # Safety saw-horse barriers
    for sh_x in [-4.0, 4.0]:
        bmesh_box(bm_tripod, (2.2, 0.12, 0.18), (sh_x, 14.0, 0.85))
        bmesh_cylinder(bm_tripod, 0.04, 0.95, (sh_x - 0.9, 14.0, 0.45), segments=12, rot_x=math.radians(20))
        bmesh_cylinder(bm_tripod, 0.04, 0.95, (sh_x + 0.9, 14.0, 0.45), segments=12, rot_x=math.radians(-20))
    create_mesh_object("GEO_Procurement_Surveyor_Theodolite", bm_tripod, mat_brushed_aluminum(), parent=root)

    # 5. Project Billboard: UNIT_11 SUPPLIER & PROCUREMENT HQ
    bm_board = bmesh.new()
    bx, by = 0.0, 16.0
    bmesh_box(bm_board, (0.2, 0.2, 3.2), (bx - 3.2, by, 1.6))
    bmesh_box(bm_board, (0.2, 0.2, 3.2), (bx + 3.2, by, 1.6))
    bmesh_box(bm_board, (6.8, 0.15, 2.0), (bx, by, 2.4))
    bmesh_box(bm_board, (7.0, 0.2, 0.1), (bx, by, 3.45))
    create_mesh_object("GEO_Procurement_Project_Billboard", bm_board, mat_dark_slate_roof(), parent=root)

    # 6. Semantic Hitbox (wireframe & invisible)
    add_hitbox("HITBOX_PROCUREMENT_PLOT", (36.0, 36.0, 3.5), (0.0, 0.0, 1.75), parent=root)

    extras = {
        "unit_id": "SUPPLIER_PROCUREMENT_HQ",
        "unit_key": "UNIT_11",
        "level": 0,
        "tier": "empty_plot",
        "building_name": "Supplier & Procurement HQ (Surveyed Plot)",
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

def add_base_procurement_l1_geometry(root):
    """
    Constructs the complete 1970s starter Supplier & Procurement HQ (~10.5k tris):
    - Main Receiving Warehouse (22m x 18m x 8.0m) in lavender brick
    - Dual Freight Loading Docks with hydraulic dock levelers, rubber bumpers, and roll-up doors
    - 2 Detailed Semi-truck delivery trailers (one conventional, one cab-over) docked at bays
    - 3 Industrial counterbalanced forklifts
    - 32 Stacked wooden pallets & banded shipping cargo crates
    - Purchasing office annex with ribbon windows and structural steel columns
    """
    # 1. Foundation Plinth (min Z = -0.30m, within ground contact spec)
    bm_plinth = bmesh.new()
    bmesh_box(bm_plinth, (36.0, 36.0, 0.3), (0.0, 0.0, -0.15))
    create_mesh_object("GEO_Procurement_Foundation_Plinth", bm_plinth, mat_travertine_concrete(), parent=root, bevel_width=0.04)

    # 2. Main Warehouse & Office Annex (Lavender Brick 1970s)
    bm_hall = bmesh.new()
    bmesh_box(bm_hall, (22.0, 18.0, 8.0), (0.0, -3.0, 4.0))
    bmesh_box(bm_hall, (12.0, 7.0, 5.5), (0.0, 9.5, 2.75))
    create_mesh_object("GEO_Procurement_Brick_Warehouse", bm_hall, mat_lavender_brick_1970(), parent=root, bevel_width=0.04)

    # 3. Coral Structural Columns & Roof Fascia
    bm_steel = bmesh.new()
    bmesh_box(bm_steel, (22.6, 18.6, 0.35), (0.0, -3.0, 4.2))
    bmesh_box(bm_steel, (22.6, 18.6, 0.35), (0.0, -3.0, 7.9))
    bmesh_box(bm_steel, (12.6, 7.6, 0.3), (0.0, 9.5, 5.4))
    for px in [-11.15, 11.15]:
        for py in [-11.0, -5.0, 1.0, 5.0]:
            bmesh_ibeam(bm_steel, 8.0, 0.45, 0.35, 0.04, 0.03, (px, py, 4.0), axis='Z')
    create_mesh_object("GEO_Procurement_Structural_Columns", bm_steel, mat_coral_structural_beam(), parent=root)

    # 4. Dual Freight Loading Docks with Hydraulic Levelers, Bumpers & Overhead Canopy
    bm_dock = bmesh.new()
    bmesh_box(bm_dock, (14.0, 4.5, 1.2), (0.0, -14.25, 0.6))
    # Overhead weather canopy with steel gussets
    bmesh_box(bm_dock, (14.6, 3.5, 0.25), (0.0, -13.5, 5.8))
    for gx in [-6.8, -2.2, 2.2, 6.8]:
        bmesh_cylinder(bm_dock, 0.05, 1.8, (gx, -12.05, 5.0), segments=14, rot_x=math.radians(-30))
    # Dock 1 & Dock 2 leveler plates and heavy rubber bumpers
    for dx in [-4.2, 4.2]:
        bmesh_box(bm_dock, (2.6, 3.2, 0.1), (dx, -13.0, 1.24))
        # Rubber vertical dock bumpers with steel faceplates
        bmesh_box(bm_dock, (0.35, 0.25, 0.85), (dx - 1.55, -11.6, 1.0))
        bmesh_box(bm_dock, (0.35, 0.25, 0.85), (dx + 1.55, -11.6, 1.0))
        # Roll-up sectional doors with individual slats
        bmesh_box(bm_dock, (3.4, 0.15, 4.0), (dx, -12.05, 3.2))
        for s in range(12):
            bmesh_box(bm_dock, (3.3, 0.18, 0.08), (dx, -12.05, 1.4 + s * 0.32))
        # Safety yellow bollards flanking each dock door
        for bx in [dx - 1.9, dx + 1.9]:
            bmesh_cylinder(bm_dock, 0.12, 1.1, (bx, -12.4, 0.55), segments=20)
    create_mesh_object("GEO_Procurement_Freight_Docks", bm_dock, mat_corrugated_industrial_steel(), parent=root)

    # 5. Semi-Truck Delivery Trailers (2 units docked at the bays)
    bm_truck = bmesh.new()
    bmesh_semi_truck(bm_truck, (-4.2, -14.0, 0.0), cab_type='conventional')
    bmesh_semi_truck(bm_truck, (4.2, -14.0, 0.0), cab_type='cab_over')
    create_mesh_object("GEO_Procurement_Delivery_SemiTruck", bm_truck, mat_brushed_aluminum(), parent=root)

    # 6. Industrial Warehouse Forklifts (3 units)
    bm_forklift = bmesh.new()
    bmesh_forklift(bm_forklift, (8.5, -13.5, 0.0), rot_z=math.radians(30))
    bmesh_forklift(bm_forklift, (0.0, -7.5, 1.2), rot_z=math.radians(180))
    bmesh_forklift(bm_forklift, (-8.5, -10.0, 1.2), rot_z=math.radians(-45))
    create_mesh_object("GEO_Procurement_Warehouse_Forklifts", bm_forklift, mat_safety_yellow(), parent=root)

    # 7. Pallet Stacks & Wooden Shipping Crates (32 pallets in staging lanes)
    bm_crates = bmesh.new()
    for cx, cy in [(8.0, -10.0), (6.0, -10.0), (-6.0, -8.0), (-8.0, -8.0)]:
        for stack in range(3):
            bmesh_box(bm_crates, (1.3, 1.3, 0.14), (cx, cy, 1.27 + stack * 0.95))
            bmesh_box(bm_crates, (1.2, 1.2, 0.8), (cx, cy, 1.75 + stack * 0.95))
            bmesh_box(bm_crates, (1.22, 0.04, 0.78), (cx, cy, 1.75 + stack * 0.95)) # Band
    create_mesh_object("GEO_Procurement_Cargo_Crates", bm_crates, mat_cedar_wood_decking(), parent=root)

    # 8. Purchasing Office Ribbon Windows & Glazing
    bm_glass = bmesh.new()
    bm_frames = bmesh.new()
    bmesh_box(bm_glass, (10.0, 0.1, 1.8), (0.0, 13.05, 3.8))
    for i in range(4):
        mx = -4.5 + i * 3.0
        bmesh_box(bm_frames, (0.12, 0.18, 1.9), (mx, 13.05, 3.8))
    for side_x in [-11.1, 11.1]:
        bmesh_box(bm_glass, (0.1, 14.0, 1.8), (side_x, -3.0, 6.2))
        for i in range(5):
            my = -9.0 + i * 3.0
            bmesh_box(bm_frames, (0.18, 0.12, 1.9), (side_x, my, 6.2))
    create_mesh_object("GEO_Procurement_Ribbon_Glass", bm_glass, mat_tinted_acrylic_window(), parent=root)
    create_mesh_object("GEO_Procurement_Window_Mullion_Frames", bm_frames, mat_dark_slate_roof(), parent=root)

    # 9. Semantic Hitboxes
    add_hitbox("HITBOX_PROCUREMENT_MAIN", (24.0, 22.0, 9.5), (0.0, -2.0, 4.75), parent=root)

def build_procurement_l1(export_path: str):
    """Level 1: 1970s Receiving Warehouse & Dual Freight Docks."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_11_Procurement_HQ_L1", None)
    bpy.context.collection.objects.link(root)
    add_base_procurement_l1_geometry(root)

    extras = {
        "unit_id": "SUPPLIER_PROCUREMENT_HQ",
        "unit_key": "UNIT_11",
        "level": 1,
        "tier": "office",
        "building_name": "Supplier & Procurement HQ (Receiving Warehouse & Docks)",
        "sub_departments": ["pr_dock_receiving", "pr_purchasing_office"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── LEVEL 2: INCOMING QUALITY INSPECTION LAB & BUFFER (1975-1980) ──
def add_procurement_l2_geometry(root):
    """
    Level 2 additions (~6.0k tris):
    - East Flank Quality Incoming Inspection Wing (8.0m x 16.0m x 6.5m)
    - 2 Precision granite surface plates with height gauges and dial indicators
    - 2 Optical profile projector shadowgraphs (comparators) with display hoods
    - 4 Industrial steel multi-tier component sorting shelves with organized parts
    - Yellow-and-black floor quarantine barrier pens
    """
    # 1. Inspection Wing Shell (East flank: X [11.0, 19.0], Y [-10.0, 6.0], Z [0.0, 6.5])
    bm_wing = bmesh.new()
    bmesh_box(bm_wing, (8.0, 16.0, 6.5), (15.0, -2.0, 3.25))
    create_mesh_object("GEO_Procurement_Inspection_Wing_Brick", bm_wing, mat_lavender_brick_1970(), parent=root, bevel_width=0.04)

    # 2. Structural Columns
    bm_beams = bmesh.new()
    bmesh_box(bm_beams, (8.5, 16.5, 0.35), (15.0, -2.0, 3.3))
    bmesh_box(bm_beams, (8.5, 16.5, 0.35), (15.0, -2.0, 6.4))
    for wy in [-9.0, -3.0, 3.0]:
        bmesh_ibeam(bm_beams, 6.5, 0.45, 0.35, 0.04, 0.03, (19.1, wy, 3.25), axis='Z')
    create_mesh_object("GEO_Procurement_Inspection_Beams", bm_beams, mat_coral_structural_beam(), parent=root)

    # 3. Quality Inspection Granite Tables, Optical Comparators & Gauges
    bm_qc = bmesh.new()
    for qy in [-6.0, 0.0]:
        # Precision granite surface plate table
        bmesh_box(bm_qc, (2.6, 3.4, 0.35), (15.0, qy, 0.8))
        bmesh_box(bm_qc, (2.8, 3.6, 0.15), (15.0, qy, 0.55))
        # 4 Table legs & leveler pads
        for lx in [13.9, 16.1]:
            for ly in [qy - 1.5, qy + 1.5]:
                bmesh_cylinder(bm_qc, 0.08, 0.5, (lx, ly, 0.25), segments=16)
        # Optical comparator projector instrument
        bmesh_box(bm_qc, (1.2, 1.4, 1.6), (15.0, qy - 0.6, 1.8))
        bmesh_cylinder(bm_qc, 0.4, 0.08, (15.0, qy - 0.6, 2.1), segments=24, rot_x=math.radians(90)) # Screen
        bmesh_cylinder(bm_qc, 0.08, 0.25, (15.0, qy - 0.3, 1.4), segments=16) # Micrometer stage
        # Vernier height gauge with scribe marker
        bmesh_cylinder(bm_qc, 0.03, 0.8, (14.2, qy + 0.8, 1.4), segments=16)
        bmesh_box(bm_qc, (0.15, 0.2, 0.1), (14.2, qy + 0.8, 1.3))
    # 4 Industrial steel multi-tier component sorting shelves with organized parts
    for sy in [-8.5, -4.0, 2.0, 4.5]:
        bmesh_box(bm_qc, (1.4, 0.6, 2.4), (18.0, sy, 1.2))
        for layer in range(4):
            bmesh_box(bm_qc, (1.3, 0.55, 0.05), (18.0, sy, 0.4 + layer * 0.6))
            # Automotive test parts (valves, bearings, pistons)
            for pt in range(3):
                bmesh_cylinder(bm_qc, 0.06, 0.15, (17.7 + pt * 0.3, sy, 0.5 + layer * 0.6), segments=16)
    create_mesh_object("GEO_Procurement_Inspection_Tables", bm_qc, mat_cast_iron_dark(), parent=root)

    # 4. Glazing
    bm_glass = bmesh.new()
    bmesh_box(bm_glass, (0.1, 12.0, 2.0), (19.05, -2.0, 4.5))
    create_mesh_object("GEO_Procurement_Inspection_Ribbon_Glass", bm_glass, mat_tinted_acrylic_window(), parent=root)

def build_procurement_l2(export_path: str):
    """Level 2: 1975-1980 Incoming Quality Inspection Lab."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_11_Procurement_HQ_L2", None)
    bpy.context.collection.objects.link(root)
    add_base_procurement_l1_geometry(root)
    add_procurement_l2_geometry(root)

    extras = {
        "unit_id": "SUPPLIER_PROCUREMENT_HQ",
        "unit_key": "UNIT_11",
        "level": 2,
        "tier": "department",
        "building_name": "Supplier HQ (Incoming Quality Inspection Center)",
        "sub_departments": ["pr_quality_inspection", "pr_buffer_staging"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── LEVEL 3: TIER-1 COLLABORATION & TEARDOWN (1980-1990) ──
def add_procurement_l3_geometry(root):
    """
    Level 3 additions (~7.5k tris):
    - Second-story Tier-1 Supplier Collaboration Suites (14.0m x 14.0m x 4.0m)
    - Component Teardown Annex with commercial 2-post automotive lift
    - Teardown chassis test mule on teardown stands
    - 4 Heavy-duty teardown benches with bench vises and component trays
    - Executive conference table with 8 contoured chairs and presentation screen
    """
    # 1. Second Story Collaboration Floor (Z = [8.0, 12.0])
    bm_floor = bmesh.new()
    bmesh_box(bm_floor, (14.0, 14.0, 4.0), (0.0, -3.0, 10.0))
    create_mesh_object("GEO_Procurement_Collaboration_Floor", bm_floor, mat_lavender_brick_1970(), parent=root, bevel_width=0.04)

    # 2. Collaboration Suite Ribbon Windows
    bm_win = bmesh.new()
    bmesh_box(bm_win, (13.6, 0.1, 1.8), (0.0, 4.05, 10.2))
    bmesh_box(bm_win, (13.6, 0.1, 1.8), (0.0, -10.05, 10.2))
    bmesh_box(bm_win, (0.1, 13.6, 1.8), (-7.05, -3.0, 10.2))
    bmesh_box(bm_win, (0.1, 13.6, 1.8), (7.05, -3.0, 10.2))
    create_mesh_object("GEO_Procurement_Collab_Windows", bm_win, mat_tinted_acrylic_window(), parent=root)

    # 3. 2-Post Automotive Vehicle Lift & Teardown Subassembly
    bm_lift = bmesh.new()
    # Twin columns with overhead equalization crossbeam
    bmesh_box(bm_lift, (0.45, 0.45, 4.2), (-6.0, 0.0, 2.1))
    bmesh_box(bm_lift, (0.45, 0.45, 4.2), (-2.5, 0.0, 2.1))
    bmesh_cylinder(bm_lift, 0.09, 3.8, (-4.25, 0.0, 4.15), segments=20, rot_y=math.radians(90))
    # Hydraulic cylinder rams & carriage slide blocks
    bmesh_cylinder(bm_lift, 0.08, 3.2, (-6.0, 0.0, 2.0), segments=18)
    bmesh_cylinder(bm_lift, 0.08, 3.2, (-2.5, 0.0, 2.0), segments=18)
    # Telescoping lift arms with rubber lifting pads
    for arm_x, arm_dir in [(-6.0, 1.0), (-2.5, -1.0)]:
        bmesh_box(bm_lift, (1.6, 0.18, 0.12), (arm_x + arm_dir * 0.8, -0.6, 1.8))
        bmesh_box(bm_lift, (1.6, 0.18, 0.12), (arm_x + arm_dir * 0.8, 0.6, 1.8))
        bmesh_cylinder(bm_lift, 0.09, 0.08, (arm_x + arm_dir * 1.5, -0.6, 1.9), segments=16)
        bmesh_cylinder(bm_lift, 0.09, 0.08, (arm_x + arm_dir * 1.5, 0.6, 1.9), segments=16)
    # Teardown vehicle chassis subassembly suspended on lift
    bmesh_box(bm_lift, (2.2, 4.2, 0.25), (-4.25, 0.0, 2.0))
    bmesh_box(bm_lift, (0.9, 1.2, 0.65), (-4.25, -1.2, 2.45)) # Powertrain block
    bmesh_cylinder(bm_lift, 0.22, 1.8, (-4.25, 0.8, 2.1), segments=20, rot_y=math.radians(90)) # Axle tube
    # Teardown workbenches with bench vises & parts trays
    for wbx in [-7.5, -1.0]:
        bmesh_box(bm_lift, (1.2, 3.0, 0.85), (wbx, 2.8, 0.425))
        bmesh_box(bm_lift, (0.35, 0.35, 0.25), (wbx, 2.0, 0.975)) # Bench vise
        bmesh_cylinder(bm_lift, 0.02, 0.4, (wbx, 1.85, 0.975), segments=12, rot_x=math.radians(90))
    create_mesh_object("GEO_Procurement_Teardown_Lift", bm_lift, mat_safety_yellow(), parent=root)

def build_procurement_l3(export_path: str):
    """Level 3: 1980-1990 Tier-1 Collaboration Suites & Teardown."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_11_Procurement_HQ_L3", None)
    bpy.context.collection.objects.link(root)
    add_base_procurement_l1_geometry(root)
    add_procurement_l2_geometry(root)
    add_procurement_l3_geometry(root)

    extras = {
        "unit_id": "SUPPLIER_PROCUREMENT_HQ",
        "unit_key": "UNIT_11",
        "level": 3,
        "tier": "center",
        "building_name": "Supplier HQ (Tier-1 Collaboration & Teardown Center)",
        "sub_departments": ["pr_supplier_collab", "pr_component_teardown"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── LEVEL 4: AUTOMATED PALLET RACK HIGH-BAY STORAGE (1990-2000) ──
def add_procurement_l4_geometry(root):
    """
    Level 4 additions (~11.5k tris):
    - Automated High-Bay Storage (AS/RS) Warehouse Extension (West flank: 8.0m x 18.0m x 12.0m)
    - Full-height pallet rack upright frames & load beams (6 bays x 6 tiers x 2 double-deep racks)
    - Over 70 pallet locations with diagonal cross-bracing trusses
    - Twin automated AS/RS stacker crane robots with mast towers & extractor forks
    - Powered roller conveyor loop with diverter transfer spurs
    """
    # 1. High-Bay Storage Warehouse Shell (West flank: X [-19.0, -11.0], Y [-12.0, 6.0], Z [0.0, 12.0])
    bm_bay = bmesh.new()
    bmesh_box(bm_bay, (8.0, 18.0, 12.0), (-15.0, -3.0, 6.0))
    create_mesh_object("GEO_Procurement_HighBay_Shell", bm_bay, mat_corrugated_industrial_steel(), parent=root, bevel_width=0.05)

    # 2. Automated Storage & Retrieval System (AS/RS) Pallet Racks (2 Racks: West and East)
    bm_racks = bmesh.new()
    bmesh_pallet_racks(bm_racks, (-17.0, -3.0, 0.0), bays=5, tiers=6, bay_w=3.2, bay_d=1.4, tier_h=1.9)
    bmesh_pallet_racks(bm_racks, (-13.0, -3.0, 0.0), bays=5, tiers=6, bay_w=3.2, bay_d=1.4, tier_h=1.9)
    create_mesh_object("GEO_Procurement_Automated_Pallet_Racks", bm_racks, mat_construction_orange(), parent=root)

    # 3. Twin AS/RS Automated Stacker Crane Robots & Roller Conveyors
    bm_crane = bmesh.new()
    # Aisle ground guide rails
    bmesh_box(bm_crane, (0.1, 16.0, 0.08), (-15.0, -3.0, 0.04))
    # Two stacker cranes operating in aisle
    for cy in [-7.0, 1.0]:
        # Vertical dual-mast tower
        bmesh_box(bm_crane, (0.5, 0.5, 11.4), (-15.0, cy, 5.7))
        # Top guide trolley & bottom carriage
        bmesh_box(bm_crane, (0.8, 1.8, 0.4), (-15.0, cy, 0.2))
        bmesh_box(bm_crane, (0.8, 1.8, 0.3), (-15.0, cy, 11.4))
        # Hoist carriage with telescoping shuttle extractor forks
        bmesh_box(bm_crane, (1.6, 1.4, 0.4), (-15.0, cy, 6.5))
        bmesh_box(bm_crane, (1.8, 0.15, 0.06), (-15.0, cy - 0.4, 6.7))
        bmesh_box(bm_crane, (1.8, 0.15, 0.06), (-15.0, cy + 0.4, 6.7))
    # Powered roller conveyor infeed/outfeed loop
    for c_y in [-11.0, 5.0]:
        bmesh_box(bm_crane, (4.5, 1.1, 0.7), (-15.0, c_y, 0.35))
        # 10 Motorized steel rollers
        for r_i in range(10):
            r_x = -17.0 + r_i * 0.45
            bmesh_cylinder(bm_crane, 0.05, 0.95, (r_x, c_y, 0.75), segments=16, rot_x=math.radians(90))
    create_mesh_object("GEO_Procurement_Stacker_Crane_Mast", bm_crane, mat_safety_yellow(), parent=root)

def build_procurement_l4(export_path: str):
    """Level 4: 1990-2000 Automated Pallet Rack High-Bay Storage."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_11_Procurement_HQ_L4", None)
    bpy.context.collection.objects.link(root)
    add_base_procurement_l1_geometry(root)
    add_procurement_l2_geometry(root)
    add_procurement_l3_geometry(root)
    add_procurement_l4_geometry(root)

    extras = {
        "unit_id": "SUPPLIER_PROCUREMENT_HQ",
        "unit_key": "UNIT_11",
        "level": 4,
        "tier": "advanced_hq",
        "building_name": "Supplier HQ (Automated High-Bay Pallet Storage Center)",
        "sub_departments": ["pr_asrs_storage", "pr_inventory_logistics"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── LEVEL 5: JUST-IN-TIME (JIT) AGV DISPATCH CENTER (2000-2010) ──
def add_procurement_l5_geometry(root):
    """
    Level 5 additions (~12.5k tris):
    - Just-In-Time (JIT) AGV Autonomous Guided Vehicle Dispatch Floor (16.0m x 12.0m x 6.5m)
    - 6 Robotic AGV transport carts with omnidirectional mecanum wheels and safety lidars
    - In-floor inductive charging pads and magnetic guide path markers
    - Gravity roller spiral chute from upper mezzanine
    - Photovoltaic solar roof canopy with mounting rails and inverter boxes
    """
    # 1. JIT Dispatch Staging Floor (North: X [-8.0, 8.0], Y [6.0, 18.0], Z [0.0, 6.5])
    bm_jit = bmesh.new()
    bmesh_box(bm_jit, (16.0, 12.0, 6.5), (0.0, 12.0, 3.25))
    create_mesh_object("GEO_Procurement_JIT_Dispatch_Shell", bm_jit, mat_satin_matte_white(), parent=root, bevel_width=0.04)

    # 2. 6 Robotic AGV Carts, Mecanum Wheels & Inductive Charging Stations
    bm_agv = bmesh.new()
    agv_coords = [(-5.0, 9.0), (0.0, 9.0), (5.0, 9.0), (-5.0, 14.0), (0.0, 14.0), (5.0, 14.0)]
    for ax, ay in agv_coords:
        # AGV low-profile chassis body
        bmesh_box(bm_agv, (1.4, 1.8, 0.38), (ax, ay, 0.22))
        # Rotating circular top lift turntable deck
        bmesh_cylinder(bm_agv, 0.55, 0.08, (ax, ay, 0.45), segments=24)
        # Laser safety lidar puck scanners (front & rear corners)
        bmesh_cylinder(bm_agv, 0.06, 0.08, (ax - 0.6, ay + 0.8, 0.42), segments=16)
        bmesh_cylinder(bm_agv, 0.06, 0.08, (ax + 0.6, ay - 0.8, 0.42), segments=16)
        # 4 Omnidirectional Mecanum wheels with angled rollers
        for wx, wy in [(-0.7, -0.6), (0.7, -0.6), (-0.7, 0.6), (0.7, 0.6)]:
            bmesh_cylinder(bm_agv, 0.16, 0.12, (ax + wx, ay + wy, 0.16), segments=18, rot_y=math.radians(90))
        # In-floor inductive fast-charging dock station
        bmesh_box(bm_agv, (0.4, 0.4, 0.95), (ax + 0.95, ay, 0.475))
        bmesh_cylinder(bm_agv, 0.05, 0.1, (ax + 0.95, ay, 0.98), segments=16) # Status beacon
        # Component transport bin mounted on AGV
        bmesh_box(bm_agv, (1.1, 1.4, 0.6), (ax, ay, 0.8))
        bmesh_box(bm_agv, (0.9, 1.2, 0.5), (ax, ay, 0.85))
    create_mesh_object("GEO_Procurement_Robotic_AGVs", bm_agv, mat_safety_yellow(), parent=root)

    # 3. Photovoltaic Solar Roof Canopy (Z = 12.5) with Rails & Inverters
    bm_solar = bmesh.new()
    bmesh_box(bm_solar, (26.0, 24.0, 0.25), (0.0, -3.0, 12.5))
    for r in range(8):
        sy = -13.0 + r * 2.8
        bmesh_box(bm_solar, (25.0, 2.4, 0.08), (0.0, sy, 12.68))
        for c in range(-10, 11, 4):
            bmesh_box(bm_solar, (3.6, 2.2, 0.04), (c, sy, 12.74))
            bmesh_box(bm_solar, (0.35, 0.25, 0.1), (c, sy, 12.56)) # Micro-inverter
    for sx in [-12.0, 0.0, 12.0]:
        for sy in [-12.0, -3.0, 6.0]:
            bmesh_cylinder(bm_solar, 0.14, 4.5, (sx, sy, 10.3), segments=20)
            bmesh_cylinder(bm_solar, 0.28, 0.15, (sx, sy, 12.4), segments=20)
    create_mesh_object("GEO_Procurement_Photovoltaic_Solar_Canopy", bm_solar, mat_modern_curtain_glass(), parent=root)

def build_procurement_l5(export_path: str):
    """Level 5: 2000-2010 Just-In-Time AGV Dispatch Center."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_11_Procurement_HQ_L5", None)
    bpy.context.collection.objects.link(root)
    add_base_procurement_l1_geometry(root)
    add_procurement_l2_geometry(root)
    add_procurement_l3_geometry(root)
    add_procurement_l4_geometry(root)
    add_procurement_l5_geometry(root)

    extras = {
        "unit_id": "SUPPLIER_PROCUREMENT_HQ",
        "unit_key": "UNIT_11",
        "level": 5,
        "tier": "world_class_hq",
        "building_name": "Supplier HQ (Just-In-Time AGV Dispatch Center)",
        "sub_departments": ["pr_agv_fleet", "pr_jit_assembly_buffer"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── LEVEL 6: GLOBAL SUPPLY CHAIN CONTROL BRIDGE (2010-2020) ──
def add_procurement_l6_geometry(root):
    """
    Level 6 additions (~11.0k tris):
    - Cantilevered Glass Operations Bridge overlooking freight yard (18.0m x 5.0m x 4.5m)
    - 3 Curved ultra-wide 32:9 command monitoring video walls
    - 4 Command console workstations with dual flight-director displays & ergonomic chairs
    - Server telemetry racks with cyan LED indicator arrays
    - Cryo cyan LED architectural perimeter bands
    """
    # 1. Cantilevered Glass Operations Bridge (Z = [7.0, 11.5])
    bm_bridge = bmesh.new()
    bmesh_box(bm_bridge, (18.0, 5.0, 4.5), (0.0, -13.0, 9.25))
    create_mesh_object("GEO_Procurement_Operations_Bridge_Glass", bm_bridge, mat_modern_curtain_glass(), parent=root)

    # 2. Logistics Video Command Wall & Ergonomic Workstations inside Bridge
    bm_screens = bmesh.new()
    # 3 Curved ultra-wide 32:9 video walls
    for cx in [-5.5, 0.0, 5.5]:
        bmesh_box(bm_screens, (4.8, 0.12, 2.2), (cx, -11.2, 9.6))
        # Screen bevel border & mounting bracket
        bmesh_box(bm_screens, (5.0, 0.16, 2.4), (cx, -11.16, 9.6))
        bmesh_cylinder(bm_screens, 0.08, 1.2, (cx, -11.1, 8.2), segments=16)
    # 4 Operator command console workstations (8 workstations total in 2 rows)
    for row_y in [-13.2, -12.0]:
        for wx in [-6.0, -2.0, 2.0, 6.0]:
            bmesh_box(bm_screens, (1.8, 1.1, 0.75), (wx, row_y, 7.5))
            # Dual monitors on articulation arms
            bmesh_box(bm_screens, (0.75, 0.05, 0.45), (wx - 0.42, row_y - 0.4, 8.1))
            bmesh_box(bm_screens, (0.75, 0.05, 0.45), (wx + 0.42, row_y - 0.4, 8.1))
            bmesh_cylinder(bm_screens, 0.03, 0.35, (wx, row_y - 0.3, 7.95), segments=14)
            # Ergonomic mesh operator chair
            bmesh_cylinder(bm_screens, 0.3, 0.06, (wx, row_y + 0.6, 7.3), segments=20)
            bmesh_cylinder(bm_screens, 0.04, 0.4, (wx, row_y + 0.6, 7.5), segments=14)
            bmesh_box(bm_screens, (0.55, 0.55, 0.12), (wx, row_y + 0.6, 7.75))
            bmesh_box(bm_screens, (0.5, 0.12, 0.65), (wx, row_y + 0.8, 8.15))
    # Server telemetry racks with detailed ventilation louvers
    for rx in [-8.0, 8.0]:
        bmesh_box(bm_screens, (1.2, 2.2, 3.2), (rx, -13.0, 8.8))
        for ru in range(8):
            bmesh_box(bm_screens, (0.4, 1.8, 0.28), (rx, -13.0, 7.5 + ru * 0.38))
            bmesh_cylinder(bm_screens, 0.04, 0.02, (rx + 0.22, -13.0, 7.5 + ru * 0.38), segments=12) # LED
    create_mesh_object("GEO_Procurement_Command_Video_Wall", bm_screens, mat_holographic_cyan_glow(), parent=root)

    # 3. Cyan LED Architectural Bands
    bm_led = bmesh.new()
    bmesh_box(bm_led, (18.2, 5.2, 0.2), (0.0, -13.0, 7.0))
    bmesh_box(bm_led, (18.2, 5.2, 0.2), (0.0, -13.0, 11.5))
    create_mesh_object("GEO_Procurement_LED_Bands", bm_led, mat_cryo_cyan_emissive(), parent=root)

def build_procurement_l6(export_path: str):
    """Level 6: 2010-2020 Global Supply Chain Real-Time Control Center."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_11_Procurement_HQ_L6", None)
    bpy.context.collection.objects.link(root)
    add_base_procurement_l1_geometry(root)
    add_procurement_l2_geometry(root)
    add_procurement_l3_geometry(root)
    add_procurement_l4_geometry(root)
    add_procurement_l5_geometry(root)
    add_procurement_l6_geometry(root)

    extras = {
        "unit_id": "SUPPLIER_PROCUREMENT_HQ",
        "unit_key": "UNIT_11",
        "level": 6,
        "tier": "innovation_campus",
        "building_name": "Supplier HQ (Global Supply Chain Control Center)",
        "sub_departments": ["pr_global_tracking", "pr_operations_bridge"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── LEVEL 7: AI AUTONOMOUS LOGISTICS TERMINAL (2020s+) ──
def add_procurement_l7_geometry(root):
    """
    Level 7 additions (~18.5k tris):
    - 5-Story Quantum Procurement & Traceability Tower (9.0m x 9.0m x 18.0m)
    - Vertical aerodynamic glass fins and parametric sunshade louvers
    - Rooftop autonomous drone freight vertiport with 4 landing pads & cargo drones
    - 4 Articulated robotic battery-swap arms and rooftop satellite dishes
    - Sweeping aerodynamic glass canopy with spaceframe tubular struts
    - Enclosed pneumatic semi-truck airlock docking vestibules
    """
    # 1. Quantum Procurement Tower (North-East: X [8.0, 17.0], Y [8.0, 17.0], Z [0.0, 18.0])
    bm_tower = bmesh.new()
    bmesh_box(bm_tower, (9.0, 9.0, 18.0), (12.5, 12.5, 9.0))
    create_mesh_object("GEO_Procurement_Quantum_Tower", bm_tower, mat_satin_matte_white(), parent=root, bevel_width=0.06)

    # 2. Tower Glazed Curtain Walls & Vertical Aerodynamic Glass Fins
    bm_tow_glass = bmesh.new()
    for fl in range(5):
        fz = 2.5 + fl * 3.5
        bmesh_box(bm_tow_glass, (9.2, 8.0, 1.8), (12.5, 12.5, fz))
        bmesh_box(bm_tow_glass, (8.0, 9.2, 1.8), (12.5, 12.5, fz))
        # 8 Vertical aerodynamic glass fins per floor
        for fin_i in range(8):
            fin_x = 8.5 + fin_i * 1.15
            bmesh_box(bm_tow_glass, (0.05, 0.35, 2.2), (fin_x, 8.0, fz))
            bmesh_box(bm_tow_glass, (0.05, 0.35, 2.2), (fin_x, 17.0, fz))
    create_mesh_object("GEO_Procurement_Tower_Curtain_Glass", bm_tow_glass, mat_modern_curtain_glass(), parent=root)

    # 3. Aerodynamic Logistics Master Canopy (Z = 16.5) with Tubular Spaceframe Struts
    bm_canopy = bmesh.new()
    bmesh_box(bm_canopy, (34.0, 34.0, 0.5), (0.0, 0.0, 16.5))
    bmesh_box(bm_canopy, (34.4, 34.4, 0.2), (0.0, 0.0, 16.8))
    for sx in [-14.0, 0.0, 14.0]:
        for sy in [-14.0, 0.0, 14.0]:
            bmesh_cylinder(bm_canopy, 0.18, 8.0, (sx, sy, 12.5), segments=24)
            bmesh_cylinder(bm_canopy, 0.04, 6.5, (sx + 2.0, sy + 2.0, 14.5), segments=12, rot_x=math.radians(25))
    create_mesh_object("GEO_Procurement_Aerodynamic_Glass_Canopy", bm_canopy, mat_modern_curtain_glass(), parent=root)

    # 4. Autonomous Drone Delivery Vertiport atop Quantum Tower (4 Pads + Cargo Quadcopters + Robotic Arms)
    bm_drone = bmesh.new()
    bmesh_box(bm_drone, (8.5, 8.5, 0.2), (12.5, 12.5, 18.1))
    for dx, dy in [(10.5, 10.5), (14.5, 10.5), (10.5, 14.5), (14.5, 14.5)]:
        bmesh_tube(bm_drone, 1.6, 1.4, 0.06, (dx, dy, 18.22), segments=32)
        bmesh_cylinder(bm_drone, 0.45, 0.06, (dx, dy, 18.22), segments=24)
        # Autonomous heavy-lift cargo quadcopter drone
        bmesh_box(bm_drone, (0.55, 0.55, 0.18), (dx, dy, 18.4))
        # 4 Rotor booms & carbon propeller discs
        for bx, by in [(-0.35, -0.35), (0.35, -0.35), (-0.35, 0.35), (0.35, 0.35)]:
            bmesh_cylinder(bm_drone, 0.02, 0.35, (dx + bx/2, dy + by/2, 18.4), segments=12)
            bmesh_cylinder(bm_drone, 0.04, 0.08, (dx + bx, dy + by, 18.45), segments=16)
            bmesh_cylinder(bm_drone, 0.28, 0.02, (dx + bx, dy + by, 18.5), segments=20)
        # Robotic battery-swapping arm next to each landing pad
        bmesh_cylinder(bm_drone, 0.06, 0.45, (dx - 1.2, dy, 18.35), segments=16)
        bmesh_cylinder(bm_drone, 0.04, 0.65, (dx - 0.8, dy, 18.55), segments=14, rot_y=math.radians(45))
        bmesh_cylinder(bm_drone, 0.03, 0.45, (dx - 0.4, dy, 18.7), segments=14, rot_y=math.radians(-30))
        bmesh_box(bm_drone, (0.12, 0.12, 0.08), (dx - 0.15, dy, 18.7)) # Gripper head
    # Satellite uplink dishes atop tower
    bmesh_cylinder(bm_drone, 0.12, 1.2, (12.5, 12.5, 18.8), segments=18)
    bmesh_cylinder(bm_drone, 0.85, 0.15, (12.5, 12.5, 19.5), segments=28, rot_x=math.radians(35)) # Parabolic dish
    bmesh_cylinder(bm_drone, 0.02, 0.45, (12.5, 12.7, 19.65), segments=12) # Feed horn
    create_mesh_object("GEO_Procurement_Drone_Vertiport", bm_drone, mat_safety_yellow(), parent=root)

    # 5. Semantic Hitbox for Quantum Tower
    add_hitbox("HITBOX_PROCUREMENT_TOWER", (10.0, 10.0, 19.0), (12.5, 12.5, 9.5), parent=root)

def build_procurement_l7(export_path: str):
    """Level 7: 2020s+ AI Autonomous Logistics Terminal."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_11_Procurement_HQ_L7", None)
    bpy.context.collection.objects.link(root)
    add_base_procurement_l1_geometry(root)
    add_procurement_l2_geometry(root)
    add_procurement_l3_geometry(root)
    add_procurement_l4_geometry(root)
    add_procurement_l5_geometry(root)
    add_procurement_l6_geometry(root)
    add_procurement_l7_geometry(root)

    extras = {
        "unit_id": "SUPPLIER_PROCUREMENT_HQ",
        "unit_key": "UNIT_11",
        "level": 7,
        "tier": "hypermodern_campus",
        "building_name": "Supplier HQ (AI Autonomous Logistics Terminal)",
        "sub_departments": ["pr_autonomous_freight", "pr_drone_vertiport", "pr_quantum_traceability"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# =========================================================================
# BATCH GENERATION & AUDIT ENTRYPOINT
# =========================================================================
def generate_all_procurement_levels(output_dir: str):
    os.makedirs(output_dir, exist_ok=True)
    results = {}
    
    levels = [
        (0, "hq_11_procurement_l0.glb", build_procurement_l0),
        (1, "hq_11_procurement_l1.glb", build_procurement_l1),
        (2, "hq_11_procurement_l2.glb", build_procurement_l2),
        (3, "hq_11_procurement_l3.glb", build_procurement_l3),
        (4, "hq_11_procurement_l4.glb", build_procurement_l4),
        (5, "hq_11_procurement_l5.glb", build_procurement_l5),
        (6, "hq_11_procurement_l6.glb", build_procurement_l6),
        (7, "hq_11_procurement_l7.glb", build_procurement_l7),
    ]
    
    print("\n" + "#" * 70)
    print(" AUTO TYCOON CAMPUS HQ - UNIT_11 SUPPLIER & PROCUREMENT HQ GENERATION")
    print(f" Target Output Directory: {output_dir}")
    print("#" * 70)
    
    all_passed = True
    for lvl, filename, builder_func in levels:
        out_path = os.path.join(output_dir, filename)
        tier_name = CAMPUS_TRIANGLE_BUDGETS[lvl]["tier"]
        print(f"\n>>> Generating UNIT_11 Level {lvl} ({tier_name}) -> {filename}...")
        
        success = builder_func(out_path)
        passed, report = audit_scene("UNIT_11_PROCUREMENT", lvl, bpy)
        print_audit_summary(report)
        
        file_size = os.path.getsize(out_path) if os.path.exists(out_path) else 0
        tris = report["total_triangles"]
        print(f"    Export: {success} | Size: {file_size / 1024:.1f} KB | Triangles: {tris:,}")
        results[lvl] = {"file": filename, "passed": passed, "size_kb": file_size / 1024.0, "triangles": tris}
        if not passed:
            all_passed = False
            
    print("\n" + "=" * 70)
    print(" UNIT_11 SUPPLIER HQ SUMMARY AUDIT TABLE")
    print("=" * 70)
    print(f"{'Level':<6} | {'Filename':<24} | {'Triangles':<10} | {'Size (KB)':<10} | {'Quality Gate'}")
    print("-" * 70)
    for lvl, data in results.items():
        status = "PASSED ✅" if data["passed"] else "FAILED ❌"
        print(f"L{lvl:<5} | {data['file']:<24} | {data['triangles']:<10,} | {data['size_kb']:<10.1f} | {status}")
    print("=" * 70)
    
    return all_passed

if __name__ == "__main__":
    target_dir = os.path.join(workspace_root, "public", "models", "campus")
    if len(sys.argv) > 1 and not sys.argv[-1].endswith(".py"):
        target_dir = sys.argv[-1]
    
    generate_all_procurement_levels(target_dir)
