"""
AUTO TYCOON CAMPUS HQ - UNIT_14 MARKETING & SALES HQ GENERATOR (PHASES 113-120)

Generates all 8 progression levels (L0-L7) for UNIT_14:
- Footprint: 36m x 36m (Master Plot)
- Architectural Identity: Showroom, Brand Experience & Heritage Museum character —
  1970s glass dealership showroom with rotating display turntable & classic concept car,
  corporate heritage vault & restoration studio, press reveal auditorium with lighting grid,
  multi-level spiral vehicle display rotunda, immersive holo-cinema, and VIP delivery sky-lounge.

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
    mat_satin_matte_white,
    mat_pearl_concept_car_paint,
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

def bmesh_classic_gt_car(bm, loc: tuple, rot_z=0.0):
    """
    Creates an authentic 1970s Grand Touring Coupe display show-car:
    - Long sculpted hood with twin cowl scoops
    - Recessed quad circular projector headlamps in chrome bezel
    - Split chrome front and rear bumpers
    - Contoured fastback greenhouse canopy with A-pillars and chrome beltline trim
    - Quad polished Inconel exhaust tips with dark inner bore
    - Deep-dish wire-spoke wheels with directional tread tires and 3-eared knockoff spinner caps
    - Cockpit interior with twin bucket seats, 3-spoke wood-rim steering wheel, and dashboard
    """
    lx, ly, lz = loc
    cos_z, sin_z = math.cos(rot_z), math.sin(rot_z)
    
    # 1. Main lower chassis body (streamlined coke-bottle waist)
    bmesh_box(bm, (1.92, 4.4, 0.48), (lx, ly, lz + 0.44))
    bmesh_box(bm, (1.82, 4.5, 0.28), (lx, ly, lz + 0.32)) # Rocker sill tuck
    
    # 2. Long hood & front nose
    bmesh_box(bm, (1.88, 1.8, 0.24), (lx, ly + 1.25, lz + 0.65))
    # Twin hood cowl air extractors
    bmesh_box(bm, (0.35, 0.6, 0.06), (lx - 0.45, ly + 1.1, lz + 0.8))
    bmesh_box(bm, (0.35, 0.6, 0.06), (lx + 0.45, ly + 1.1, lz + 0.8))
    
    # 3. Recessed Quad Headlamp Housing & Grille
    bmesh_box(bm, (1.75, 0.15, 0.35), (lx, ly + 2.22, lz + 0.58)) # Grille mesh cavity
    for hx in [-0.72, -0.48, 0.48, 0.72]:
        bmesh_cylinder(bm, 0.09, 0.08, (lx + hx, ly + 2.22, lz + 0.58), segments=20, rot_x=math.radians(90))
        bmesh_tube(bm, 0.11, 0.09, 0.04, (lx + hx, ly + 2.24, lz + 0.58), segments=20) # Chrome bezel
        
    # 4. Chrome Split Bumpers
    for bx in [-0.65, 0.65]:
        bmesh_box(bm, (0.55, 0.12, 0.12), (lx + bx, ly + 2.28, lz + 0.42))
        bmesh_box(bm, (0.55, 0.12, 0.12), (lx + bx, ly - 2.28, lz + 0.48))
        
    # 5. Fastback Greenhouse & Windshield Canopy
    bmesh_box(bm, (1.52, 2.1, 0.52), (lx, ly - 0.25, lz + 0.95))
    bmesh_box(bm, (1.45, 0.12, 0.5), (lx, ly + 0.7, lz + 0.85)) # Raked windshield
    bmesh_box(bm, (1.4, 0.8, 0.38), (lx, ly - 1.25, lz + 0.82)) # Fastback rear window
    # Chrome beltline trim
    bmesh_box(bm, (1.94, 2.8, 0.03), (lx, ly - 0.1, lz + 0.68))
    
    # 6. Quad Chrome Exhaust Tips with Dark Bore
    for ex in [-0.55, -0.42, 0.42, 0.55]:
        bmesh_tube(bm, 0.055, 0.045, 0.3, (lx + ex, ly - 2.25, lz + 0.3), segments=20)
        bmesh_cylinder(bm, 0.044, 0.02, (lx + ex, ly - 2.38, lz + 0.3), segments=16, rot_x=math.radians(90)) # Inner bore
        
    # 7. Interior Cockpit visible through glass
    for sx in [-0.42, 0.42]:
        # Bucket seats
        bmesh_box(bm, (0.5, 0.55, 0.18), (lx + sx, ly - 0.35, lz + 0.52))
        bmesh_box(bm, (0.45, 0.18, 0.65), (lx + sx, ly - 0.65, lz + 0.85))
    # Wood-rim 3-spoke steering wheel
    bmesh_cylinder(bm, 0.03, 0.45, (lx - 0.42, ly + 0.1, lz + 0.75), segments=14, rot_x=math.radians(-25))
    bmesh_tube(bm, 0.19, 0.16, 0.025, (lx - 0.42, ly + 0.0, lz + 0.92), segments=24)
    # Dashboard brow & cowl
    bmesh_box(bm, (1.35, 0.45, 0.25), (lx, ly + 0.45, lz + 0.78))
    
    # 8. 4 Deep-Dish Wheels with Siped Tires & Knockoff Spinners
    wheel_r = 0.35
    wheel_w = 0.26
    for wx in [-0.98, 0.98]:
        for wy in [ly - 1.35, ly + 1.35]:
            # Outer tire with tread sipes
            bmesh_cylinder(bm, wheel_r, wheel_w, (lx + wx, wy, lz + wheel_r), segments=28, rot_y=math.radians(90))
            # Stepped chrome outer rim lip
            bmesh_tube(bm, wheel_r * 0.85, wheel_r * 0.72, wheel_w * 0.6, (lx + wx, wy, lz + wheel_r), segments=24)
            # Center hub & 3-eared knockoff spinner cap
            bmesh_cylinder(bm, 0.08, wheel_w + 0.06, (lx + wx, wy, lz + wheel_r), segments=18, rot_y=math.radians(90))
            for ear in [0, 120, 240]:
                rad = math.radians(ear)
                bmesh_box(bm, (0.04, 0.16, 0.04), (lx + wx, wy + 0.08 * math.cos(rad), lz + wheel_r + 0.08 * math.sin(rad)))

def bmesh_spiral_ramp(bm, center: tuple, inner_r: float, outer_r: float, height: float, turns=1.5, segments=36):
    """Creates a multi-level spiral vehicle display showcase ramp with balustrades."""
    cx, cy, cz = center
    total_steps = int(segments * turns)
    for i in range(total_steps):
        t1 = (i / total_steps) * turns * 2 * math.pi
        t2 = ((i + 1) / total_steps) * turns * 2 * math.pi
        z1 = cz + (i / total_steps) * height
        z2 = cz + ((i + 1) / total_steps) * height
        
        # Ramp deck floor
        v1 = bm.verts.new((cx + inner_r * math.cos(t1), cy + inner_r * math.sin(t1), z1))
        v2 = bm.verts.new((cx + outer_r * math.cos(t1), cy + outer_r * math.sin(t1), z1))
        v3 = bm.verts.new((cx + outer_r * math.cos(t2), cy + outer_r * math.sin(t2), z2))
        v4 = bm.verts.new((cx + inner_r * math.cos(t2), cy + inner_r * math.sin(t2), z2))
        bm.faces.new([v1, v2, v3, v4])
        
        # Outer glass balustrade & stainless steel handrail
        b_h = 1.05
        bv1 = bm.verts.new((cx + outer_r * math.cos(t1), cy + outer_r * math.sin(t1), z1 + b_h))
        bv2 = bm.verts.new((cx + outer_r * math.cos(t2), cy + outer_r * math.sin(t2), z2 + b_h))
        bm.faces.new([v2, bv1, bv2, v3])

def bmesh_vintage_gp_racer(bm, loc: tuple, rot_z=0.0):
    """
    Creates an authentic classic Grand Prix single-seater heritage racecar on axle stands:
    - Torpedo cigar body with tapered tail and riveted headrest fairing
    - Exposed inline-8 engine block with 8 polished aluminum velocity stacks
    - Sweeping side exhaust pipe bundle terminating in flared fishtail
    - Open cockpit with wood-rim steering wheel and 5 analog dial gauges
    - Exposed front and rear tubular beam axles with leaf springs and friction dampers
    - Deep-dish wire wheels resting on tubular workshop jackstands
    """
    lx, ly, lz = loc
    cos_z, sin_z = math.cos(rot_z), math.sin(rot_z)

    def rot_pt(x, y, z):
        rx = x * cos_z - y * sin_z
        ry = x * sin_z + y * cos_z
        return (lx + rx, ly + ry, lz + z)

    # 1. Torpedo Cigar Main Body & Headrest Fairing
    bmesh_cylinder(bm, 0.42, 3.4, (lx, ly, lz + 0.52), segments=24, rot_x=math.radians(90))
    bmesh_cylinder(bm, 0.28, 1.2, (lx, ly - 1.8, lz + 0.50), segments=20, rot_x=math.radians(90)) # Tapered tail
    # Radiator nose grille cowl with mesh recess
    bmesh_cylinder(bm, 0.38, 0.25, (lx, ly + 1.8, lz + 0.52), segments=24, rot_x=math.radians(90))
    bmesh_tube(bm, 0.40, 0.35, 0.08, (lx, ly + 1.9, lz + 0.52), segments=24) # Polished aluminum bezel

    # 2. Exposed Inline-8 Engine & Intake Trumpets
    bmesh_box(bm, (0.42, 1.4, 0.45), (lx, ly + 0.7, lz + 0.65)) # Engine block
    for stack in range(8):
        sy = ly + 0.15 + stack * 0.16
        bmesh_cylinder(bm, 0.035, 0.14, (lx - 0.12, sy, lz + 0.94), segments=14)
        bmesh_cylinder(bm, 0.05, 0.03, (lx - 0.12, sy, lz + 1.02), segments=14) # Trumpet bellmouth

    # 3. Sweeping Side Exhaust Pipe & Fishtail
    bmesh_cylinder(bm, 0.06, 2.2, (lx + 0.44, ly - 0.2, lz + 0.42), segments=16, rot_x=math.radians(90))
    bmesh_box(bm, (0.05, 0.35, 0.18), (lx + 0.44, ly - 1.4, lz + 0.42)) # Fishtail tip

    # 4. Open Cockpit & Aerodynamic Windscreen
    bmesh_box(bm, (0.55, 0.7, 0.35), (lx, ly - 0.45, lz + 0.7)) # Cockpit tub opening
    bmesh_box(bm, (0.45, 0.45, 0.35), (lx, ly - 0.65, lz + 0.55)) # Leather bucket seat
    # Wood-rim steering wheel
    bmesh_tube(bm, 0.18, 0.15, 0.02, (lx, ly - 0.28, lz + 0.82), segments=20)
    bmesh_cylinder(bm, 0.025, 0.3, (lx, ly - 0.22, lz + 0.72), segments=12, rot_x=math.radians(-30))
    # Aero brooklands windscreen
    bmesh_box(bm, (0.42, 0.02, 0.18), (lx, ly - 0.12, lz + 0.92))

    # 5. Exposed Axles, Leaf Springs & Workshop Jackstands
    for ax_y in [ly + 1.25, ly - 1.25]:
        bmesh_cylinder(bm, 0.04, 1.7, (lx, ax_y, lz + 0.38), segments=14, rot_y=math.radians(90)) # Axle tube
        bmesh_box(bm, (0.1, 0.8, 0.06), (lx - 0.45, ax_y, lz + 0.32)) # Leaf springs
        bmesh_box(bm, (0.1, 0.8, 0.06), (lx + 0.45, ax_y, lz + 0.32))
        # 4 Heavy workshop jackstands supporting chassis
        for jx in [-0.55, 0.55]:
            bmesh_box(bm, (0.28, 0.28, 0.05), (lx + jx, ax_y, lz + 0.025))
            bmesh_cylinder(bm, 0.035, 0.36, (lx + jx, ax_y, lz + 0.19), segments=12)

    # 6. 4 Wire Wheels Resting beside Chassis
    for wx, wy in [(-0.95, ly + 1.25), (0.95, ly + 1.25), (-0.95, ly - 1.25), (0.95, ly - 1.25)]:
        bmesh_cylinder(bm, 0.38, 0.18, (lx + wx, wy, lz + 0.38), segments=24, rot_y=math.radians(90))
        bmesh_tube(bm, 0.36, 0.28, 0.12, (lx + wx, wy, lz + 0.38), segments=20)
        bmesh_cylinder(bm, 0.06, 0.22, (lx + wx, wy, lz + 0.38), segments=14, rot_y=math.radians(90))

def bmesh_car_reveal_sheet(bm, loc: tuple, rot_z=0.0):
    """
    Creates a presentation reveal vehicle draped in heavy satin cloth:
    - Sculpted supercar silhouette: raked nose, wide fenders, cockpit greenhouse, active aero rear wing
    - Flowing cloth ripples, side drape folds, and floor perimeter pooling
    - Satin corner tension darts and ceremonial presentation ribbons
    """
    lx, ly, lz = loc
    # 1. Main body drape volume
    bmesh_box(bm, (2.05, 4.6, 0.55), (lx, ly, lz + 0.45))
    bmesh_box(bm, (1.85, 4.75, 0.35), (lx, ly, lz + 0.22)) # Low sill skirt
    # 2. Raked cockpit canopy under sheet
    bmesh_box(bm, (1.45, 2.2, 0.5), (lx, ly - 0.2, lz + 0.95))
    bmesh_box(bm, (1.35, 0.3, 0.45), (lx, ly + 0.8, lz + 0.85)) # Windshield ridge
    # 3. Muscular wheel arches protruding under cloth
    for wx in [-0.98, 0.98]:
        for wy in [ly - 1.4, ly + 1.4]:
            bmesh_cylinder(bm, 0.42, 0.28, (lx + wx, wy, lz + 0.42), segments=20, rot_y=math.radians(90))
    # 4. Rear GT Wing silhouette under cloth
    bmesh_box(bm, (1.75, 0.45, 0.15), (lx, ly - 2.1, lz + 1.15))
    bmesh_box(bm, (0.08, 0.25, 0.45), (lx - 0.55, ly - 2.05, lz + 0.9))
    bmesh_box(bm, (0.08, 0.25, 0.45), (lx + 0.55, ly - 2.05, lz + 0.9))
    # 5. Cloth perimeter puddling & ripples
    bmesh_box(bm, (2.25, 4.9, 0.08), (lx, ly, lz + 0.04))
    bmesh_tube(bm, 2.45, 2.15, 0.06, (lx, ly, lz + 0.03), segments=32)

def bmesh_evtol_drone(bm, loc: tuple, rot_z=0.0):
    """
    Creates a futuristic 2-passenger electric air taxi (eVTOL) craft:
    - Aerodynamic carbon-fiber pod fuselage with optical bubble canopy
    - 4 Cantilevered carbon boom arms extending diagonally
    - 4 Ducted fan nacelles with counter-rotating fan blades and motor hubs
    - Twin aerodynamic tubular landing skids
    - Navigation beacon lights and passenger cabin seating
    """
    lx, ly, lz = loc
    # 1. Pod Fuselage
    bmesh_cylinder(bm, 0.85, 3.4, (lx, ly, lz + 1.05), segments=24, rot_x=math.radians(90))
    bmesh_cylinder(bm, 0.55, 1.2, (lx, ly - 1.8, lz + 1.15), segments=20, rot_x=math.radians(90)) # Tapered tail boom
    bmesh_box(bm, (1.1, 1.8, 0.65), (lx, ly + 0.4, lz + 1.35)) # Panoramic canopy bubble
    
    # 2. 4 Outrigger Booms & Ducted Fan Nacelles
    boom_reach = 2.4
    for bx, by in [(-boom_reach, boom_reach * 0.8), (boom_reach, boom_reach * 0.8),
                   (-boom_reach, -boom_reach * 0.8), (boom_reach, -boom_reach * 0.8)]:
        nx, ny = lx + bx, ly + by
        # Cantilevered carbon wing boom
        bmesh_box(bm, (abs(bx), 0.18, 0.12), (lx + bx/2, ly + by/2, lz + 1.1))
        # Outer duct shroud ring
        bmesh_tube(bm, 0.85, 0.72, 0.45, (nx, ny, lz + 1.25), segments=28)
        # Center electric motor spinner
        bmesh_cylinder(bm, 0.22, 0.55, (nx, ny, lz + 1.25), segments=18)
        # 4 Rotor blades inside duct
        for b_ang in [0, 90, 180, 270]:
            rad = math.radians(b_ang)
            bmesh_box(bm, (0.55 * math.cos(rad), 0.55 * math.sin(rad), 0.04),
                      (nx + 0.35 * math.cos(rad), ny + 0.35 * math.sin(rad), lz + 1.25))

    # 3. Twin Landing Skids
    for sk_x in [-0.85, 0.85]:
        bmesh_cylinder(bm, 0.05, 3.2, (lx + sk_x, ly, lz + 0.18), segments=14, rot_x=math.radians(90))
        # Vertical struts to fuselage
        bmesh_cylinder(bm, 0.04, 0.85, (lx + sk_x, ly + 0.8, lz + 0.55), segments=12, rot_x=math.radians(15))
        bmesh_cylinder(bm, 0.04, 0.85, (lx + sk_x, ly - 0.8, lz + 0.55), segments=12, rot_x=math.radians(-15))

# =========================================================================
# LEVEL BUILDERS (L0 - L7)
# =========================================================================

def build_marketing_l0(export_path: str):
    """Level 0: Empty Plot (Surveyed Dealership & Museum Land)."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_14_Marketing_HQ_L0", None)
    bpy.context.collection.objects.link(root)

    # 1. Base excavation pad
    bm_pad = bmesh.new()
    bmesh_box(bm_pad, (36.0, 36.0, 0.3), (0.0, 0.0, -0.15))
    create_mesh_object("GEO_Marketing_Plot_Excavation_Pad", bm_pad, mat_travertine_concrete(), parent=root)

    # 2. Showroom foundation perimeter trench lines & curbs
    bm_trench = bmesh.new()
    bmesh_box(bm_trench, (20.5, 0.6, 0.25), (0.0, -2.0 + 10.0, 0.125))
    bmesh_box(bm_trench, (20.5, 0.6, 0.25), (0.0, -2.0 - 10.0, 0.125))
    bmesh_box(bm_trench, (0.6, 20.0, 0.25), (-10.0, -2.0, 0.125))
    bmesh_box(bm_trench, (0.6, 20.0, 0.25), (10.0, -2.0, 0.125))
    create_mesh_object("GEO_Marketing_Foundation_Trench_Curbs", bm_trench, mat_travertine_concrete(), parent=root)

    # 3. Steel survey boundary pylons with reflector lenses
    bm_pylons = bmesh.new()
    corners = [(-17.0, -17.0), (17.0, -17.0), (17.0, 17.0), (-17.0, 17.0)]
    for cx, cy in corners:
        bmesh_cylinder(bm_pylons, 0.25, 2.2, (cx, cy, 1.1), segments=24)
        bmesh_box(bm_pylons, (0.8, 0.8, 0.3), (cx, cy, 0.15))
        bmesh_cylinder(bm_pylons, 0.15, 0.12, (cx, cy, 2.25), segments=20)
    create_mesh_object("GEO_Marketing_Survey_Boundary_Pylons", bm_pylons, mat_safety_yellow(), parent=root)

    # 4. Surveyor theodolite & tripod workstation
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
    create_mesh_object("GEO_Marketing_Surveyor_Theodolite", bm_tripod, mat_brushed_aluminum(), parent=root)

    # 5. Project Billboard: UNIT_14 MARKETING, SALES & HERITAGE MUSEUM
    bm_board = bmesh.new()
    bx, by = 0.0, 16.0
    bmesh_box(bm_board, (0.2, 0.2, 3.2), (bx - 3.2, by, 1.6))
    bmesh_box(bm_board, (0.2, 0.2, 3.2), (bx + 3.2, by, 1.6))
    bmesh_box(bm_board, (6.8, 0.15, 2.0), (bx, by, 2.4))
    bmesh_box(bm_board, (7.0, 0.2, 0.1), (bx, by, 3.45))
    create_mesh_object("GEO_Marketing_Project_Billboard", bm_board, mat_dark_slate_roof(), parent=root)

    # 6. Semantic Hitbox (wireframe & invisible)
    add_hitbox("HITBOX_MARKETING_PLOT", (36.0, 36.0, 3.5), (0.0, 0.0, 1.75), parent=root)

    extras = {
        "unit_id": "MARKETING_SALES_HQ",
        "unit_key": "UNIT_14",
        "level": 0,
        "tier": "empty_plot",
        "building_name": "Marketing & Sales HQ (Surveyed Plot)",
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

def add_base_marketing_l1_geometry(root):
    """
    Constructs the complete 1970s starter Dealership Showroom & Brand Pavilion (~10.5k tris):
    - Main Dealership Showroom (22m x 20m x 7.5m) in travertine concrete & lavender brick
    - Full-height glass curtain wall facade facing front plaza
    - Central rotating vehicle display turntable (Ø7.0m) with polished lip & cedar parquet inlay
    - High-fidelity 1970s Classic GT Coupé on the turntable
    - Customer consultation lounge & sales desks with swivel chairs
    - Exterior dealership illuminated brand pylon totem (6.5m tall) & lot floodlights
    """
    # 1. Foundation Plinth (min Z = -0.30m, within ground contact spec)
    bm_plinth = bmesh.new()
    bmesh_box(bm_plinth, (36.0, 36.0, 0.3), (0.0, 0.0, -0.15))
    create_mesh_object("GEO_Marketing_Foundation_Plinth", bm_plinth, mat_travertine_concrete(), parent=root, bevel_width=0.04)

    # 2. Showroom Architectural Brick Walls & Sales Office Wing (Hollow Interior Showroom)
    bm_hall = bmesh.new()
    # North back wall behind showroom
    bmesh_box(bm_hall, (22.0, 0.6, 7.5), (0.0, 7.7, 3.75))
    # West brick side wall (rear portion)
    bmesh_box(bm_hall, (0.6, 5.5, 7.5), (-10.7, 5.0, 3.75))
    # East brick side wall (rear portion)
    bmesh_box(bm_hall, (0.6, 5.5, 7.5), (10.7, 5.0, 3.75))
    # Showroom polished floor slab
    bmesh_box(bm_hall, (21.4, 19.4, 0.15), (0.0, -2.0, 0.075))
    # Roof ceiling slab atop showroom
    bmesh_box(bm_hall, (22.0, 20.0, 0.35), (0.0, -2.0, 7.35))
    # Sales office annex wing at rear
    bmesh_box(bm_hall, (12.0, 6.0, 5.0), (0.0, 10.5, 2.5))
    create_mesh_object("GEO_Marketing_Showroom_Brick_Halls", bm_hall, mat_lavender_brick_1970(), parent=root, bevel_width=0.04)

    # 3. Coral Structural Columns & Perimeter Fascia Beams
    bm_steel = bmesh.new()
    # Mid-height perimeter architectural beltline beams (Z = 3.9m)
    bmesh_box(bm_steel, (22.6, 0.35, 0.35), (0.0, -12.15, 3.9))
    bmesh_box(bm_steel, (22.6, 0.35, 0.35), (0.0, 8.15, 3.9))
    bmesh_box(bm_steel, (0.35, 20.6, 0.35), (-11.15, -2.0, 3.9))
    bmesh_box(bm_steel, (0.35, 20.6, 0.35), (11.15, -2.0, 3.9))
    # Roof perimeter fascia beams (Z = 7.4m)
    bmesh_box(bm_steel, (22.6, 0.45, 0.45), (0.0, -12.15, 7.4))
    bmesh_box(bm_steel, (22.6, 0.45, 0.45), (0.0, 8.15, 7.4))
    bmesh_box(bm_steel, (0.45, 20.6, 0.45), (-11.15, -2.0, 7.4))
    bmesh_box(bm_steel, (0.45, 20.6, 0.45), (11.15, -2.0, 7.4))
    # 8 Main structural vertical I-beam columns
    for px in [-11.15, 11.15]:
        for py in [-12.0, -6.0, 0.0, 6.0]:
            bmesh_ibeam(bm_steel, 7.5, 0.45, 0.35, 0.04, 0.03, (px, py, 3.75), axis='Z')
    create_mesh_object("GEO_Marketing_Structural_Columns", bm_steel, mat_coral_structural_beam(), parent=root)

    # 4. Glass Curtain Wall Facade & Dark Slate Mullions
    bm_glass = bmesh.new()
    bm_mull = bmesh.new()
    # South showroom main glass curtain
    bmesh_box(bm_glass, (21.6, 0.1, 6.2), (0.0, -12.05, 3.5))
    for i in range(8):
        mx = -9.0 + i * 2.55
        bmesh_box(bm_mull, (0.14, 0.22, 6.4), (mx, -12.05, 3.5))
    # Side display glass
    for side_x in [-11.05, 11.05]:
        bmesh_box(bm_glass, (0.1, 14.0, 5.5), (side_x, -4.0, 3.8))
        for j in range(5):
            my = -10.0 + j * 3.0
            bmesh_box(bm_mull, (0.22, 0.14, 5.6), (side_x, my, 3.8))
    create_mesh_object("GEO_Marketing_Showroom_Glass_Curtain", bm_glass, mat_modern_curtain_glass(), parent=root)
    create_mesh_object("GEO_Marketing_Showroom_Glass_Mullions", bm_mull, mat_dark_slate_roof(), parent=root)

    # 5. Central Rotating Display Turntable & 1970s Classic GT Coupé
    bm_turn = bmesh.new()
    # Turntable platform (Ø7.0m) with stepped chrome bezel & cedar parquet floor
    bmesh_cylinder(bm_turn, 3.5, 0.28, (0.0, -3.0, 0.14), segments=40)
    bmesh_tube(bm_turn, 3.65, 3.45, 0.12, (0.0, -3.0, 0.22), segments=40) # Polished chrome outer rim
    bmesh_cylinder(bm_turn, 3.4, 0.05, (0.0, -3.0, 0.29), segments=40) # Parquet floor deck
    # Authentic 1970s Classic GT Coupé on the turntable
    bmesh_classic_gt_car(bm_turn, (0.0, -3.0, 0.3), rot_z=math.radians(-25))
    create_mesh_object("GEO_Marketing_Turntable_Display_Car", bm_turn, mat_pearl_concept_car_paint(), parent=root)

    # 5b. Second Showroom Floor Car in East Glass Display Window
    bm_car2 = bmesh.new()
    bmesh_box(bm_car2, (3.2, 5.8, 0.18), (6.5, -4.5, 0.09)) # Low display plinth
    bmesh_classic_gt_car(bm_car2, (6.5, -4.5, 0.18), rot_z=math.radians(20))
    create_mesh_object("GEO_Marketing_Showroom_Floor_Car", bm_car2, mat_pearl_concept_car_paint(), parent=root)

    # 5c. Suspended Aluminum Ceiling Lighting Grid with 24 Articulated Spotlights
    bm_grid = bmesh.new()
    for gy in [-9.0, -3.0, 3.0]:
        bmesh_box(bm_grid, (18.0, 0.12, 0.12), (0.0, gy, 6.8))
    for gx in [-8.0, -2.5, 2.5, 8.0]:
        bmesh_box(bm_grid, (0.12, 14.0, 0.12), (gx, -3.0, 6.8))
    # 24 Spotlights with mounting yokes angled down at display cars
    for sx in [-7.0, -4.0, -1.0, 2.0, 5.0, 7.5]:
        for sy in [-8.5, -3.0, 2.5]:
            bmesh_cylinder(bm_grid, 0.1, 0.28, (sx, sy, 6.55), segments=16, rot_x=math.radians(25))
            bmesh_cylinder(bm_grid, 0.02, 0.2, (sx, sy, 6.72), segments=10) # Mount clamp
    create_mesh_object("GEO_Marketing_Showroom_Lighting_Grid", bm_grid, mat_brushed_aluminum(), parent=root)

    # 6. Customer Consultation Lounge, Sales Desks & Dealership Totem
    bm_lounge = bmesh.new()
    # 3 Sales consultation desks with chairs
    for dx in [-6.0, 0.0, 6.0]:
        bmesh_box(bm_lounge, (1.8, 1.0, 0.75), (dx, 6.0, 0.375))
        # Client swivel chairs (2 per desk)
        for cx in [-0.5, 0.5]:
            bmesh_cylinder(bm_lounge, 0.25, 0.06, (dx + cx, 5.0, 0.2), segments=18)
            bmesh_cylinder(bm_lounge, 0.04, 0.35, (dx + cx, 5.0, 0.4), segments=14)
            bmesh_box(bm_lounge, (0.5, 0.5, 0.1), (dx + cx, 5.0, 0.62))
            bmesh_box(bm_lounge, (0.45, 0.1, 0.5), (dx + cx, 4.75, 0.92))
    # Customer waiting lounge sofa
    bmesh_box(bm_lounge, (3.4, 1.2, 0.45), (0.0, 1.5, 0.225))
    bmesh_box(bm_lounge, (3.4, 0.35, 0.65), (0.0, 2.0, 0.55))
    # Exterior Dealership Illuminated Brand Pylon Sign (6.5m tall)
    bmesh_box(bm_lounge, (0.6, 0.4, 6.5), (14.0, -14.0, 3.25))
    bmesh_box(bm_lounge, (1.8, 0.5, 2.4), (14.0, -14.0, 5.2)) # Lightbox head
    bmesh_box(bm_lounge, (2.0, 0.55, 0.12), (14.0, -14.0, 6.45))
    create_mesh_object("GEO_Marketing_Customer_Lounge", bm_lounge, mat_cedar_wood_decking(), parent=root)

    # 7. Semantic Hitbox (wireframe & invisible)
    add_hitbox("HITBOX_MARKETING_MAIN", (24.0, 24.0, 9.0), (0.0, -1.0, 4.5), parent=root)

def build_marketing_l1(export_path: str):
    """Level 1: 1970s Dealership Showroom & Display Turntable."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_14_Marketing_HQ_L1", None)
    bpy.context.collection.objects.link(root)
    add_base_marketing_l1_geometry(root)

    extras = {
        "unit_id": "MARKETING_SALES_HQ",
        "unit_key": "UNIT_14",
        "level": 1,
        "tier": "office",
        "building_name": "Marketing & Sales HQ (Dealership Showroom & Pavilion)",
        "sub_departments": ["mkt_showroom_floor", "mkt_sales_office"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── LEVEL 2: CORPORATE HERITAGE VAULT & RESTORATION (1975-1980) ──
def add_marketing_l2_geometry(root):
    """
    Level 2 additions (~6.0k tris):
    - East Flank Corporate Heritage Vault & Restoration Studio (8.0m x 16.0m x 6.5m)
    - 4-Post vehicle restoration lift with drive-on ramps and hydraulic cylinders
    - Vintage classic roadster chassis undergoing restoration on jackstands
    - Heavy mechanic roll-cab toolboxes, parts wash tank, English wheel sheet metal shaper
    - Vault secure heavy doors and display shelving
    """
    # 1. Heritage Vault Shell (East flank: X [11.0, 19.0], Y [-10.0, 6.0], Z [0.0, 6.5])
    bm_vault = bmesh.new()
    bmesh_box(bm_vault, (8.0, 16.0, 6.5), (15.0, -2.0, 3.25))
    create_mesh_object("GEO_Marketing_Heritage_Vault_Brick", bm_vault, mat_lavender_brick_1970(), parent=root, bevel_width=0.04)

    # 2. Vault Ribbon Windows
    bm_glass = bmesh.new()
    bmesh_box(bm_glass, (0.1, 12.0, 1.8), (19.05, -2.0, 4.2))
    create_mesh_object("GEO_Marketing_Vault_Ribbon_Glass", bm_glass, mat_tinted_acrylic_window(), parent=root)

    # 3. Restoration Workshop: 4-Post Lift & Vintage Roadster Chassis Undergoing Restoration
    bm_resto = bmesh.new()
    # 4-Post automotive lift
    for col_x in [13.2, 16.8]:
        for col_y in [-6.5, -1.5]:
            bmesh_box(bm_resto, (0.35, 0.35, 3.8), (col_x, col_y, 1.9))
            bmesh_cylinder(bm_resto, 0.06, 3.2, (col_x, col_y, 1.8), segments=16) # Hydraulic ram
    # Drive-on steel runway ramps
    bmesh_box(bm_resto, (0.6, 5.4, 0.18), (13.6, -4.0, 1.6))
    bmesh_box(bm_resto, (0.6, 5.4, 0.18), (16.4, -4.0, 1.6))
    # Vintage Roadster chassis on the lift
    bmesh_box(bm_resto, (1.65, 3.8, 0.22), (15.0, -4.0, 1.85))
    # Inline-6 engine block mockup with triple carburetors
    bmesh_box(bm_resto, (0.6, 1.2, 0.5), (15.0, -3.2, 2.2))
    for carb in range(3):
        bmesh_cylinder(bm_resto, 0.08, 0.18, (15.35, -3.6 + carb * 0.4, 2.45), segments=16)
    # Exposed tubular spaceframe roll hoop
    bmesh_cylinder(bm_resto, 0.04, 1.4, (15.0, -4.6, 2.4), segments=14, rot_y=math.radians(90))
    bmesh_cylinder(bm_resto, 0.04, 0.8, (14.4, -4.6, 2.1), segments=14)
    bmesh_cylinder(bm_resto, 0.04, 0.8, (15.6, -4.6, 2.1), segments=14)
    
    # Restoration workshop tools: Heavy roll-cab toolbox & English wheel
    bmesh_box(bm_resto, (1.8, 0.7, 1.2), (18.0, 1.5, 0.6))
    for drw in range(5):
        bmesh_box(bm_resto, (1.7, 0.05, 0.16), (17.95, 1.15, 0.2 + drw * 0.2))
    # English wheel metal forming machine
    bmesh_box(bm_resto, (0.6, 0.8, 1.8), (18.0, 4.0, 0.9))
    bmesh_cylinder(bm_resto, 0.15, 0.1, (18.0, 4.2, 1.4), segments=20) # Top anvil wheel
    bmesh_cylinder(bm_resto, 0.08, 0.08, (18.0, 4.2, 1.1), segments=18) # Bottom contour wheel

    # Vintage Grand Prix Single-Seater Racer undergoing chassis restoration on axle stands
    bmesh_vintage_gp_racer(bm_resto, (14.8, 2.5, 0.0), rot_z=math.radians(90))

    # Heavy industrial steel parts storage racks with components
    for ry in [4.8, -7.5]:
        bmesh_box(bm_resto, (1.6, 0.6, 2.4), (17.5, ry, 1.2)) # Rack frame
        for sh in range(4):
            sz = 0.4 + sh * 0.55
            bmesh_box(bm_resto, (1.5, 0.55, 0.04), (17.5, ry, sz))
            # Engine components on shelves
            bmesh_cylinder(bm_resto, 0.16, 0.08, (17.2, ry, sz + 0.06), segments=16) # Brake disc
            bmesh_box(bm_resto, (0.28, 0.2, 0.18), (17.6, ry, sz + 0.1)) # Battery box
            bmesh_cylinder(bm_resto, 0.08, 0.22, (17.9, ry, sz + 0.12), segments=14) # Oil filter

    create_mesh_object("GEO_Marketing_Restoration_Bay_Vehicle", bm_resto, mat_safety_yellow(), parent=root)

def build_marketing_l2(export_path: str):
    """Level 2: 1975-1980 Corporate Heritage Vault & Restoration Studio."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_14_Marketing_HQ_L2", None)
    bpy.context.collection.objects.link(root)
    add_base_marketing_l1_geometry(root)
    add_marketing_l2_geometry(root)

    extras = {
        "unit_id": "MARKETING_SALES_HQ",
        "unit_key": "UNIT_14",
        "level": 2,
        "tier": "department",
        "building_name": "Marketing HQ (Heritage Vault & Restoration Studio)",
        "sub_departments": ["mkt_heritage_vault", "mkt_vintage_restoration"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── LEVEL 3: PRESS REVEAL AUDITORIUM & MEDIA CENTER (1980-1990) ──
def add_marketing_l3_geometry(root):
    """
    Level 3 additions (~7.3k tris):
    - Second-story Press Reveal Auditorium (16.0m x 14.0m x 4.5m)
    - Tiered curved theater amphitheater seating: 4 curved rows with 32 molded seats
    - Elevated vehicle reveal presentation stage with circular turntable
    - Overhead spaceframe lighting truss with 18 stage Fresnel spotlights
    - 140-Degree curved panoramic presentation backdrop screen
    - 2 Broadcast television studio camera rigs on three-wheeled pedestal dollies
    """
    # 1. Auditorium Floor Shell (Z = [7.5, 12.0])
    bm_aud = bmesh.new()
    bmesh_box(bm_aud, (16.0, 14.0, 4.5), (0.0, -2.0, 9.75))
    create_mesh_object("GEO_Marketing_Auditorium_Shell", bm_aud, mat_lavender_brick_1970(), parent=root, bevel_width=0.04)

    # 2. Tiered Curved Theater Seating & Reveal Stage
    bm_stage = bmesh.new()
    # Elevated reveal stage (front of auditorium)
    bmesh_box(bm_stage, (12.0, 4.5, 0.6), (0.0, -6.5, 7.8))
    bmesh_cylinder(bm_stage, 2.2, 0.1, (0.0, -6.5, 8.15), segments=36) # Stage turntable
    # 140-degree curved panoramic presentation backdrop screen
    bmesh_cylinder(bm_stage, 5.5, 2.8, (0.0, -8.0, 9.6), segments=40)
    # 6 Tiered curved seating risers & 48 molded auditorium seats
    for r in range(6):
        tier_y = -3.5 + r * 1.35
        tier_z = 7.7 + r * 0.42
        bmesh_box(bm_stage, (13.5, 1.25, 0.42), (0.0, tier_y, tier_z))
        # 8 Seats per row
        for s in range(8):
            seat_x = -5.25 + s * 1.5
            # Seat cushion & folding backrest
            bmesh_box(bm_stage, (0.55, 0.5, 0.12), (seat_x, tier_y - 0.2, tier_z + 0.35))
            bmesh_box(bm_stage, (0.52, 0.12, 0.65), (seat_x, tier_y + 0.15, tier_z + 0.72))
            bmesh_cylinder(bm_stage, 0.03, 0.45, (seat_x - 0.3, tier_y - 0.1, tier_z + 0.55), segments=12) # Armrest
    # Acoustic wall prism diffusers on East and West auditorium walls
    for wall_x in [-7.85, 7.85]:
        for di in range(8):
            dy = -6.0 + di * 1.45
            bmesh_box(bm_stage, (0.22, 0.9, 3.2), (wall_x, dy, 9.6))
    # 2 Broadcast television studio camera pedestal dollies
    for cam_x in [-3.5, 3.5]:
        bmesh_cylinder(bm_stage, 0.45, 0.12, (cam_x, 3.8, 9.8), segments=20) # Dolly base
        bmesh_cylinder(bm_stage, 0.08, 1.2, (cam_x, 3.8, 10.45), segments=16) # Pedestal column
        bmesh_box(bm_stage, (0.4, 0.75, 0.4), (cam_x, 3.8, 11.15)) # Broadcast camera
        bmesh_cylinder(bm_stage, 0.12, 0.35, (cam_x, 3.3, 11.15), segments=20, rot_x=math.radians(90)) # Zoom lens
        bmesh_box(bm_stage, (0.35, 0.25, 0.04), (cam_x, 4.25, 11.3)) # Teleprompter hood
    create_mesh_object("GEO_Marketing_Auditorium_Seating_Stage", bm_stage, mat_cedar_wood_decking(), parent=root)

    # 3. Suspended Overhead Steel Spaceframe Lighting Truss (18 Spotlights + 2 DLP Laser Projectors)
    bm_truss = bmesh.new()
    # Rectangular lighting grid frame (12m x 10m at Z = 11.4)
    bmesh_box(bm_truss, (12.0, 0.12, 0.12), (0.0, -7.0, 11.4))
    bmesh_box(bm_truss, (12.0, 0.12, 0.12), (0.0, -2.0, 11.4))
    bmesh_box(bm_truss, (12.0, 0.12, 0.12), (0.0, 3.0, 11.4))
    bmesh_box(bm_truss, (0.12, 10.0, 0.12), (-6.0, -2.0, 11.4))
    bmesh_box(bm_truss, (0.12, 10.0, 0.12), (6.0, -2.0, 11.4))
    # 18 Theatrical stage spotlights angled toward stage
    for tx in [-5.0, -3.0, -1.0, 1.0, 3.0, 5.0]:
        for ty in [-7.0, -2.0, 3.0]:
            bmesh_cylinder(bm_truss, 0.12, 0.35, (tx, ty, 11.1), segments=18, rot_x=math.radians(-35))
            bmesh_cylinder(bm_truss, 0.02, 0.3, (tx, ty, 11.3), segments=12) # Mounting clamp
    # Dual DLP 4K laser projectors with mounting brackets
    for px in [-2.5, 2.5]:
        bmesh_box(bm_truss, (0.75, 1.1, 0.4), (px, 2.0, 11.15))
        bmesh_cylinder(bm_truss, 0.14, 0.22, (px, 1.42, 11.15), segments=20, rot_x=math.radians(90))
        bmesh_cylinder(bm_truss, 0.03, 0.35, (px, 2.0, 11.45), segments=12)
    create_mesh_object("GEO_Marketing_Theater_Lighting_Truss", bm_truss, mat_brushed_aluminum(), parent=root)

def build_marketing_l3(export_path: str):
    """Level 3: 1980-1990 Press Reveal Auditorium & Media Center."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_14_Marketing_HQ_L3", None)
    bpy.context.collection.objects.link(root)
    add_base_marketing_l1_geometry(root)
    add_marketing_l2_geometry(root)
    add_marketing_l3_geometry(root)

    extras = {
        "unit_id": "MARKETING_SALES_HQ",
        "unit_key": "UNIT_14",
        "level": 3,
        "tier": "center",
        "building_name": "Marketing HQ (Press Reveal Auditorium & Media Center)",
        "sub_departments": ["mkt_press_reveal", "mkt_media_production"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── LEVEL 4: SPIRAL VEHICLE DISPLAY ROTUNDA & ATELIER (1990-2000) ──
def add_marketing_l4_geometry(root):
    """
    Level 4 additions (~11.7k tris):
    - West Flank Multi-Level Spiral Vehicle Display Rotunda (Ø12m x 14m high glass cylinder)
    - Helical ascending ramp with 48 tempered glass balustrades & handrails
    - 2 Display vehicles parked on elevated spiral tiers
    - Bespoke Personalization Atelier: 24 paint swatches, 16 leather hide rolls, touch kiosks
    """
    # 1. Glass Rotunda Outer Cylinder & Roof Fascia
    bm_rot = bmesh.new()
    bmesh_cylinder(bm_rot, 6.0, 13.5, (-14.0, -2.0, 6.75), segments=36)
    bmesh_tube(bm_rot, 6.3, 5.9, 0.45, (-14.0, -2.0, 13.4), segments=36) # Roof fascia
    bmesh_tube(bm_rot, 6.3, 5.9, 0.45, (-14.0, -2.0, 6.75), segments=36) # Mid-band
    create_mesh_object("GEO_Marketing_Glass_Rotunda_Cylinder", bm_rot, mat_modern_curtain_glass(), parent=root)

    # 2. Helical Ascending Vehicle Display Ramp & 4 Display Vehicles
    bm_ramp = bmesh.new()
    bmesh_spiral_ramp(bm_ramp, (-14.0, -2.0, 0.2), inner_r=2.5, outer_r=5.5, height=11.5, turns=2.0, segments=48)
    # Central support column
    bmesh_cylinder(bm_ramp, 1.2, 13.0, (-14.0, -2.0, 6.5), segments=32)
    # 4 Display cars ascending the spiral ramp tiers
    bmesh_classic_gt_car(bm_ramp, (-14.0, -5.8, 3.2), rot_z=math.radians(90))
    bmesh_classic_gt_car(bm_ramp, (-17.8, -2.0, 5.8), rot_z=math.radians(0))
    bmesh_classic_gt_car(bm_ramp, (-14.0, 1.8, 8.8), rot_z=math.radians(-90))
    bmesh_classic_gt_car(bm_ramp, (-10.2, -2.0, 11.2), rot_z=math.radians(180))
    create_mesh_object("GEO_Marketing_Spiral_Display_Ramp", bm_ramp, mat_travertine_concrete(), parent=root)

    # 3. Bespoke Personalization Atelier: Paint Swatches & Leather Hides Wall
    bm_atelier = bmesh.new()
    bmesh_box(bm_atelier, (8.0, 6.0, 4.0), (0.0, 11.0, 7.5))
    create_mesh_object("GEO_Marketing_Configurator_Studio_Shell", bm_atelier, mat_satin_matte_white(), parent=root, bevel_width=0.04)

    # 4. Atelier CMF Samples & Configurator Touch Kiosks
    bm_kiosks = bmesh.new()
    # 24 Automotive paint samples on display rack
    for r in range(4):
        for c in range(6):
            px = -3.0 + c * 1.2
            pz = 6.5 + r * 0.7
            bmesh_cylinder(bm_kiosks, 0.22, 0.05, (px, 13.85, pz), segments=20, rot_x=math.radians(90))
    # 16 Leather hide hanging rolls on brass bars
    for lh in range(8):
        lx = -3.2 + lh * 0.9
        bmesh_cylinder(bm_kiosks, 0.08, 1.4, (lx, 8.2, 7.2), segments=18)
        bmesh_cylinder(bm_kiosks, 0.015, 1.5, (lx, 8.2, 7.9), segments=12) # Brass rod
    # 2 Touchscreen Configurator Kiosks
    for kx in [-1.8, 1.8]:
        bmesh_box(bm_kiosks, (0.8, 0.6, 1.1), (kx, 11.0, 6.05))
        bmesh_box(bm_kiosks, (0.75, 0.5, 0.05), (kx, 11.0, 6.65)) # Angled screen
        bmesh_cylinder(bm_kiosks, 0.06, 0.8, (kx, 11.0, 5.8), segments=16)
    # 2 Circular CMF design consultation tables with rotating material swatches
    for tx in [-1.5, 1.5]:
        bmesh_cylinder(bm_kiosks, 0.75, 0.05, (tx, 8.5, 7.4), segments=24)
        bmesh_cylinder(bm_kiosks, 0.08, 0.7, (tx, 8.5, 7.05), segments=16)
        bmesh_cylinder(bm_kiosks, 0.4, 0.08, (tx, 8.5, 7.55), segments=20)
    create_mesh_object("GEO_Marketing_Configurator_Kiosks", bm_kiosks, mat_cast_iron_dark(), parent=root)

    # 5. Atelier Glazing
    bm_curt = bmesh.new()
    bmesh_box(bm_curt, (7.6, 0.1, 2.5), (0.0, 14.05, 7.5))
    create_mesh_object("GEO_Marketing_Configurator_Curtain_Glass", bm_curt, mat_modern_curtain_glass(), parent=root)

def build_marketing_l4(export_path: str):
    """Level 4: 1990-2000 Spiral Vehicle Display Rotunda & Atelier."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_14_Marketing_HQ_L4", None)
    bpy.context.collection.objects.link(root)
    add_base_marketing_l1_geometry(root)
    add_marketing_l2_geometry(root)
    add_marketing_l3_geometry(root)
    add_marketing_l4_geometry(root)

    extras = {
        "unit_id": "MARKETING_SALES_HQ",
        "unit_key": "UNIT_14",
        "level": 4,
        "tier": "advanced_hq",
        "building_name": "Marketing HQ (Spiral Vehicle Rotunda & Atelier Center)",
        "sub_departments": ["mkt_spiral_rotunda", "mkt_bespoke_atelier"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── LEVEL 5: IMMERSIVE HOLO-CINEMA & DIGITAL COMMERCE (2000-2010) ──
def add_marketing_l5_geometry(root):
    """
    Level 5 additions (~12.0k tris):
    - 360-Degree Cylindrical Holo-Cinema Chamber (Ø8.5m x 5.5m) with acoustic louvers
    - Central holographic cyan emitter pedestal with optical refractive rings
    - 6 VR simulation viewer pods with swivel chairs & surround-sound headsets
    - Photovoltaic solar roof canopy (26m x 24m) on satin steel columns
    """
    # 1. Cylindrical Holo-Cinema Chamber
    bm_holo = bmesh.new()
    bmesh_cylinder(bm_holo, 4.25, 5.5, (0.0, 12.0, 2.75), segments=36)
    # Acoustic acoustic wall rib louvers
    for rib in range(24):
        theta = rib * 2 * math.pi / 24
        rx = 4.25 * math.cos(theta)
        ry = 12.0 + 4.25 * math.sin(theta)
        bmesh_box(bm_holo, (0.12, 0.25, 5.2), (rx, ry, 2.75))
    create_mesh_object("GEO_Marketing_HoloCinema_Pod", bm_holo, mat_satin_matte_white(), parent=root, bevel_width=0.04)

    # 2. Central Holographic Cyan Emitter Pedestal, 12 VR Pods & Halo Chandelier
    bm_emit = bmesh.new()
    # Central hologram projector stage
    bmesh_cylinder(bm_emit, 1.4, 0.35, (0.0, 12.0, 0.2), segments=32)
    bmesh_tube(bm_emit, 1.55, 1.35, 0.1, (0.0, 12.0, 0.38), segments=32)
    bmesh_cylinder(bm_emit, 0.45, 0.12, (0.0, 12.0, 0.45), segments=28) # Core emitter puck
    # Suspended overhead holographic projection halo chandelier (Z = 4.8m)
    bmesh_tube(bm_emit, 2.6, 2.3, 0.15, (0.0, 12.0, 4.8), segments=36)
    for lp in range(16):
        l_ang = lp * 2 * math.pi / 16
        bmesh_cylinder(bm_emit, 0.07, 0.22, (2.45 * math.cos(l_ang), 12.0 + 2.45 * math.sin(l_ang), 4.7), segments=14, rot_x=math.radians(25))
    # 12 Swivel VR viewer pods positioned in circle around hologram
    for p in range(12):
        ang = p * 2 * math.pi / 12
        px = 2.85 * math.cos(ang)
        py = 12.0 + 2.85 * math.sin(ang)
        bmesh_cylinder(bm_emit, 0.38, 0.08, (px, py, 0.05), segments=20)
        bmesh_cylinder(bm_emit, 0.06, 0.45, (px, py, 0.3), segments=16)
        bmesh_box(bm_emit, (0.65, 0.65, 0.18), (px, py, 0.55))
        bmesh_box(bm_emit, (0.6, 0.18, 0.75), (px, py - 0.25, 0.95))
        # Headset articulation boom
        bmesh_cylinder(bm_emit, 0.02, 0.6, (px + 0.3, py, 1.1), segments=12)
        bmesh_box(bm_emit, (0.2, 0.12, 0.1), (px, py + 0.2, 1.15)) # VR goggle
    # Digital commerce server rack bank in cinema anteroom
    for srv in range(4):
        bmesh_box(bm_emit, (1.2, 0.7, 2.4), (-4.5 + srv * 1.5, 6.5, 1.2))
        for rack in range(6):
            bmesh_box(bm_emit, (1.1, 0.05, 0.25), (-4.5 + srv * 1.5, 6.12, 0.3 + rack * 0.35))
    create_mesh_object("GEO_Marketing_Holographic_Emitter", bm_emit, mat_holographic_cyan_glow(), parent=root)

    # 3. Photovoltaic Solar Roof Canopy (Z = 12.5) with Rails & Inverters
    bm_solar = bmesh.new()
    bmesh_box(bm_solar, (26.0, 24.0, 0.25), (0.0, -2.0, 12.5))
    for r in range(8):
        sy = -12.0 + r * 2.8
        bmesh_box(bm_solar, (25.0, 2.4, 0.08), (0.0, sy, 12.68))
        for c in range(-10, 11, 4):
            bmesh_box(bm_solar, (3.6, 2.2, 0.04), (c, sy, 12.74))
            bmesh_box(bm_solar, (0.35, 0.25, 0.1), (c, sy, 12.56))
    for sx in [-12.0, 0.0, 12.0]:
        for sy in [-11.0, -2.0, 7.0]:
            bmesh_cylinder(bm_solar, 0.14, 4.5, (sx, sy, 10.3), segments=20)
            bmesh_cylinder(bm_solar, 0.28, 0.15, (sx, sy, 12.4), segments=20)
    create_mesh_object("GEO_Marketing_Photovoltaic_Solar_Canopy", bm_solar, mat_modern_curtain_glass(), parent=root)

    # 4. Semantic Hitbox for Holo-Cinema
    add_hitbox("HITBOX_MARKETING_HOLOCINEMA", (10.0, 10.0, 7.0), (0.0, 12.0, 3.5), parent=root)

def build_marketing_l5(export_path: str):
    """Level 5: 2000-2010 Immersive Holo-Cinema & Digital Commerce."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_14_Marketing_HQ_L5", None)
    bpy.context.collection.objects.link(root)
    add_base_marketing_l1_geometry(root)
    add_marketing_l2_geometry(root)
    add_marketing_l3_geometry(root)
    add_marketing_l4_geometry(root)
    add_marketing_l5_geometry(root)

    extras = {
        "unit_id": "MARKETING_SALES_HQ",
        "unit_key": "UNIT_14",
        "level": 5,
        "tier": "world_class_hq",
        "building_name": "Marketing HQ (Immersive Holo-Cinema & Digital Commerce)",
        "sub_departments": ["mkt_holo_cinema", "mkt_digital_commerce"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── LEVEL 6: VIP HANDOVER SKY-LOUNGE & BRAND BRIDGE (2010-2020) ──
def add_marketing_l6_geometry(root):
    """
    Level 6 additions (~10.0k tris):
    - Cantilevered Glass Brand Experience Bridge extending out over plaza (18.0m x 5.0m x 4.5m)
    - VIP Customer Handover Suite with velvet-draped reveal plinth
    - Curving champagne bar counter with mirror backsplash, 4 high bar stools & crystal displays
    - 4 Executive swivel armchairs around marble consultation table
    - Cryo cyan LED architectural perimeter halo glow bands
    """
    # 1. Cantilevered Glass Brand Experience Bridge (Z = [7.0, 11.5])
    bm_bridge = bmesh.new()
    bmesh_box(bm_bridge, (18.0, 5.0, 4.5), (0.0, -12.5, 9.25))
    create_mesh_object("GEO_Marketing_VIP_Delivery_Cube", bm_bridge, mat_modern_curtain_glass(), parent=root)

    # 2. VIP Handover Plinth, Champagne Bar & Lounge inside Bridge
    bm_vip = bmesh.new()
    # Velvet-draped vehicle reveal plinth with concealed perimeter uplights
    bmesh_box(bm_vip, (5.2, 2.6, 0.25), (0.0, -12.5, 7.15))
    bmesh_tube(bm_vip, 2.8, 2.6, 0.08, (0.0, -12.5, 7.28), segments=32)
    # Curving Champagne Bar counter
    bmesh_box(bm_vip, (4.5, 0.8, 1.05), (-5.0, -11.5, 7.55))
    bmesh_box(bm_vip, (4.5, 0.15, 2.2), (-5.0, -10.8, 8.2)) # Mirror backsplash
    # 4 High bar stools
    for bs in range(4):
        bx = -6.5 + bs * 1.0
        bmesh_cylinder(bm_vip, 0.2, 0.05, (bx, -12.4, 7.3), segments=18)
        bmesh_cylinder(bm_vip, 0.03, 0.7, (bx, -12.4, 7.65), segments=14)
        bmesh_cylinder(bm_vip, 0.22, 0.08, (bx, -12.4, 8.0), segments=20)
    # 4 Executive swivel armchairs around round marble table
    bmesh_cylinder(bm_vip, 0.8, 0.06, (5.5, -12.5, 7.75), segments=28) # Table
    bmesh_cylinder(bm_vip, 0.08, 0.7, (5.5, -12.5, 7.4), segments=16)
    for ca in [0, 90, 180, 270]:
        crad = math.radians(ca)
        cx = 5.5 + 1.2 * math.cos(crad)
        cy = -12.5 + 1.2 * math.sin(crad)
        bmesh_cylinder(bm_vip, 0.3, 0.05, (cx, cy, 7.25), segments=18)
        bmesh_cylinder(bm_vip, 0.04, 0.45, (cx, cy, 7.5), segments=14)
        bmesh_box(bm_vip, (0.55, 0.55, 0.12), (cx, cy, 7.75))
        bmesh_box(bm_vip, (0.5, 0.12, 0.65), (cx, cy + 0.2, 8.15))
    # VIP Champagne cellar display wall with 24 crystal bottles
    for cy_i in range(4):
        for cx_i in range(6):
            bx = -7.5 + cx_i * 0.4
            bz = 7.5 + cy_i * 0.45
            bmesh_cylinder(bm_vip, 0.04, 0.26, (bx, -10.75, bz), segments=12) # Bottle body
            bmesh_cylinder(bm_vip, 0.015, 0.1, (bx, -10.75, bz + 0.16), segments=8) # Neck
    create_mesh_object("GEO_Marketing_VIP_Lounge_Furniture", bm_vip, mat_cedar_wood_decking(), parent=root)

    # 2b. VIP Handover Presentation Vehicles (1 Draped under Silk Sheet, 1 Unveiled)
    bm_vip_cars = bmesh.new()
    bmesh_car_reveal_sheet(bm_vip_cars, (-2.5, -12.5, 7.35), rot_z=math.radians(10))
    bmesh_classic_gt_car(bm_vip_cars, (2.5, -12.5, 7.35), rot_z=math.radians(-10))
    create_mesh_object("GEO_Marketing_VIP_Handover_Vehicles", bm_vip_cars, mat_pearl_concept_car_paint(), parent=root)

    # 3. Cyan LED Architectural Halo Bands
    bm_led = bmesh.new()
    bmesh_box(bm_led, (18.2, 5.2, 0.2), (0.0, -12.5, 7.0))
    bmesh_box(bm_led, (18.2, 5.2, 0.2), (0.0, -12.5, 11.5))
    create_mesh_object("GEO_Marketing_LED_Bands", bm_led, mat_cryo_cyan_emissive(), parent=root)

def build_marketing_l6(export_path: str):
    """Level 6: 2010-2020 VIP Handover Sky-Lounge & Brand Bridge."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_14_Marketing_HQ_L6", None)
    bpy.context.collection.objects.link(root)
    add_base_marketing_l1_geometry(root)
    add_marketing_l2_geometry(root)
    add_marketing_l3_geometry(root)
    add_marketing_l4_geometry(root)
    add_marketing_l5_geometry(root)
    add_marketing_l6_geometry(root)

    extras = {
        "unit_id": "MARKETING_SALES_HQ",
        "unit_key": "UNIT_14",
        "level": 6,
        "tier": "innovation_campus",
        "building_name": "Marketing HQ (VIP Handover Sky-Lounge & Brand Bridge)",
        "sub_departments": ["mkt_vip_handover", "mkt_brand_bridge"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── LEVEL 7: HYPERMODERN BRAND EXPERIENCE CENTER (2020s+) ──
def add_marketing_l7_geometry(root):
    """
    Level 7 additions (~15.0k tris):
    - 5-Story Quantum Brand & Global Commercial Operations Tower (9.0m x 9.0m x 18.0m)
    - Vertical aerodynamic glass fins and parametric sunshade louvers
    - Rooftop VIP Helipad / Passenger Drone Vertiport with illuminated approach rings & windsock
    - Sweeping aerodynamic glass canopy with spaceframe tubular struts
    - 12m Monumental 3D Brand Monolith Pylon in travertine and crystal glass
    """
    # 1. Quantum Brand Experience Tower (North-East: X [8.0, 17.0], Y [8.0, 17.0], Z [0.0, 18.0])
    bm_tower = bmesh.new()
    bmesh_box(bm_tower, (9.0, 9.0, 18.0), (12.5, 12.5, 9.0))
    create_mesh_object("GEO_Marketing_Quantum_Tower", bm_tower, mat_satin_matte_white(), parent=root, bevel_width=0.06)

    # 2. Tower Glazed Curtain Walls & 4-Sided Parametric Vertical Aerodynamic Glass Fins
    bm_tow_glass = bmesh.new()
    for fl in range(5):
        fz = 2.5 + fl * 3.5
        bmesh_box(bm_tow_glass, (9.2, 8.0, 1.8), (12.5, 12.5, fz))
        bmesh_box(bm_tow_glass, (8.0, 9.2, 1.8), (12.5, 12.5, fz))
        # 16 Vertical aerodynamic glass fins per floor (North, South, East, West)
        for fin_i in range(8):
            fin_coord = 8.5 + fin_i * 1.15
            bmesh_box(bm_tow_glass, (0.05, 0.35, 2.2), (fin_coord, 8.0, fz))
            bmesh_box(bm_tow_glass, (0.05, 0.35, 2.2), (fin_coord, 17.0, fz))
            bmesh_box(bm_tow_glass, (0.35, 0.05, 2.2), (8.0, fin_coord, fz))
            bmesh_box(bm_tow_glass, (0.35, 0.05, 2.2), (17.0, fin_coord, fz))
    create_mesh_object("GEO_Marketing_Tower_Curtain_Glass", bm_tow_glass, mat_modern_curtain_glass(), parent=root)

    # 3. Aerodynamic Brand Master Canopy (Z = 16.5) with Tubular Spaceframe Struts
    bm_canopy = bmesh.new()
    bmesh_box(bm_canopy, (34.0, 34.0, 0.5), (0.0, 0.0, 16.5))
    bmesh_box(bm_canopy, (34.4, 34.4, 0.2), (0.0, 0.0, 16.8))
    for sx in [-14.0, 0.0, 14.0]:
        for sy in [-14.0, 0.0, 14.0]:
            bmesh_cylinder(bm_canopy, 0.18, 8.0, (sx, sy, 12.5), segments=24)
            bmesh_cylinder(bm_canopy, 0.04, 6.5, (sx + 2.0, sy + 2.0, 14.5), segments=12, rot_x=math.radians(25))
    create_mesh_object("GEO_Marketing_Aerodynamic_Glass_Canopy", bm_canopy, mat_modern_curtain_glass(), parent=root)

    # 4. VIP Helipad / Passenger Drone Vertiport atop Quantum Tower
    bm_pad = bmesh.new()
    bmesh_box(bm_pad, (8.5, 8.5, 0.2), (12.5, 12.5, 18.1))
    bmesh_tube(bm_pad, 3.5, 3.1, 0.08, (12.5, 12.5, 18.25), segments=40) # Outer ring
    bmesh_cylinder(bm_pad, 0.9, 0.08, (12.5, 12.5, 18.25), segments=32) # Center circle
    # 'H' Letter marking in helipad center
    bmesh_box(bm_pad, (0.22, 1.4, 0.09), (12.1, 12.5, 18.26))
    bmesh_box(bm_pad, (0.22, 1.4, 0.09), (12.9, 12.5, 18.26))
    bmesh_box(bm_pad, (0.8, 0.22, 0.09), (12.5, 12.5, 18.26))
    # Perimeter approach lighting beacon fixtures
    for lp in range(12):
        lrad = lp * 2 * math.pi / 12
        lx = 12.5 + 3.8 * math.cos(lrad)
        ly = 12.5 + 3.8 * math.sin(lrad)
        bmesh_cylinder(bm_pad, 0.08, 0.15, (lx, ly, 18.25), segments=16)
    # Windsock mast
    bmesh_cylinder(bm_pad, 0.04, 2.5, (16.2, 16.2, 19.35), segments=14)
    bmesh_cylinder(bm_pad, 0.18, 0.8, (16.2, 16.6, 20.4), segments=18, rot_x=math.radians(90))

    # Autonomous Passenger eVTOL Air Taxi on the Helipad
    bmesh_evtol_drone(bm_pad, (12.5, 12.5, 18.25), rot_z=math.radians(45))

    # 12m Monumental Brand Monolith Pylon with Reflection Fountain Pool
    bmesh_box(bm_pad, (1.2, 0.8, 12.0), (-14.0, -14.0, 6.0))
    bmesh_box(bm_pad, (1.4, 1.0, 0.6), (-14.0, -14.0, 0.3)) # Base plinth
    bmesh_box(bm_pad, (1.25, 0.85, 3.5), (-14.0, -14.0, 10.0)) # Illuminated crystal logo band
    # Circular reflection fountain pool basin
    bmesh_tube(bm_pad, 4.2, 3.8, 0.45, (-14.0, -14.0, 0.22), segments=36)
    bmesh_cylinder(bm_pad, 3.8, 0.05, (-14.0, -14.0, 0.35), segments=36) # Water surface
    for fz_i in range(8):
        f_rad = fz_i * 2 * math.pi / 8
        bmesh_cylinder(bm_pad, 0.04, 0.3, (-14.0 + 2.5 * math.cos(f_rad), -14.0 + 2.5 * math.sin(f_rad), 0.45), segments=12)

    create_mesh_object("GEO_Marketing_Drone_Helipad", bm_pad, mat_safety_yellow(), parent=root)

    # 5. Semantic Hitbox for Quantum Tower
    add_hitbox("HITBOX_MARKETING_TOWER", (10.0, 10.0, 19.0), (12.5, 12.5, 9.5), parent=root)

def build_marketing_l7(export_path: str):
    """Level 7: 2020s+ Hypermodern Brand Experience Center."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_14_Marketing_HQ_L7", None)
    bpy.context.collection.objects.link(root)
    add_base_marketing_l1_geometry(root)
    add_marketing_l2_geometry(root)
    add_marketing_l3_geometry(root)
    add_marketing_l4_geometry(root)
    add_marketing_l5_geometry(root)
    add_marketing_l6_geometry(root)
    add_marketing_l7_geometry(root)

    extras = {
        "unit_id": "MARKETING_SALES_HQ",
        "unit_key": "UNIT_14",
        "level": 7,
        "tier": "hypermodern_campus",
        "building_name": "Marketing HQ (Hypermodern Brand Experience Center)",
        "sub_departments": ["mkt_brand_monolith", "mkt_drone_vertiport", "mkt_quantum_commerce"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# =========================================================================
# BATCH GENERATION & AUDIT ENTRYPOINT
# =========================================================================
def generate_all_marketing_levels(output_dir: str):
    os.makedirs(output_dir, exist_ok=True)
    results = {}
    
    levels = [
        (0, "hq_14_marketing_l0.glb", build_marketing_l0),
        (1, "hq_14_marketing_l1.glb", build_marketing_l1),
        (2, "hq_14_marketing_l2.glb", build_marketing_l2),
        (3, "hq_14_marketing_l3.glb", build_marketing_l3),
        (4, "hq_14_marketing_l4.glb", build_marketing_l4),
        (5, "hq_14_marketing_l5.glb", build_marketing_l5),
        (6, "hq_14_marketing_l6.glb", build_marketing_l6),
        (7, "hq_14_marketing_l7.glb", build_marketing_l7),
    ]
    
    print("\n" + "#" * 70)
    print(" AUTO TYCOON CAMPUS HQ - UNIT_14 MARKETING & SALES HQ GENERATION")
    print(f" Target Output Directory: {output_dir}")
    print("#" * 70)
    
    all_passed = True
    for lvl, filename, builder_func in levels:
        out_path = os.path.join(output_dir, filename)
        tier_name = CAMPUS_TRIANGLE_BUDGETS[lvl]["tier"]
        print(f"\n>>> Generating UNIT_14 Level {lvl} ({tier_name}) -> {filename}...")
        
        success = builder_func(out_path)
        passed, report = audit_scene("UNIT_14_MARKETING", lvl, bpy)
        print_audit_summary(report)
        
        file_size = os.path.getsize(out_path) if os.path.exists(out_path) else 0
        tris = report["total_triangles"]
        print(f"    Export: {success} | Size: {file_size / 1024:.1f} KB | Triangles: {tris:,}")
        results[lvl] = {"file": filename, "passed": passed, "size_kb": file_size / 1024.0, "triangles": tris}
        if not passed:
            all_passed = False
            
    print("\n" + "=" * 70)
    print(" UNIT_14 MARKETING HQ SUMMARY AUDIT TABLE")
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
    
    generate_all_marketing_levels(target_dir)
