"""
AUTO TYCOON CAMPUS HQ - UNIT_09 COMMERCIAL & HEAVY VEHICLES HQ GENERATOR (PHASES 147-154)

Generates all 8 progression levels (L0-L7) for UNIT_09:
- Footprint: 36m x 36m (Master Plot G, front axle ground origin aligned)
- Architectural Identity: Heavy Commercial Trucks, Buses & Fleet Transport Complex —
  1970s twin high-clearance service depot, heavy semi-truck cab on hydraulic lift columns,
  overhead gantry crane, soot extraction chimney, dispatch office with ribbon glass,
  torsional chassis test rig, fleet durability shaker rig, megawatt heavy EV charging yard,
  automated battery pack swap gantry, autonomous fleet logistics bridge,
  and hypermodern zero-emission hydrogen transport innovation center.

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
    mat_interior_emissive_warm,
    mat_safety_yellow,
    mat_construction_orange,
    mat_cast_iron_dark,
    mat_corrugated_industrial_steel,
    mat_oil_stained_asphalt,
    mat_high_voltage_orange,
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

def bmesh_truck_wheel(bm, radius: float, width: float, loc: tuple, rot_y=math.radians(90.0), dual=False):
    """Generates a detailed commercial truck tire with 10-stud disc rim and hub reduction cap."""
    lx, ly, lz = loc
    t_widths = [(-width/2, width/2)] if not dual else [(-width * 1.05, -width * 0.15), (width * 0.15, width * 1.05)]
    for w_start, w_end in t_widths:
        w_center = (w_start + w_end) / 2
        w_span = abs(w_end - w_start)
        # Main heavy tire
        bmesh_cylinder(bm, radius, w_span, (lx + w_center, ly, lz), segments=20, rot_y=rot_y)
        # Stepped outer steel wheel rim lip
        bmesh_tube(bm, radius * 0.70, radius * 0.58, w_span * 0.85, (lx + w_center, ly, lz), segments=20, rot_y=rot_y)
    
    # Outer hub plate with 10 lug nuts
    out_x = lx + (width * 1.1 if dual else width * 0.52)
    bmesh_cylinder(bm, radius * 0.56, 0.06, (out_x, ly, lz), segments=16, rot_y=rot_y)
    # Axle center oil-lubricated hub reduction dome
    bmesh_cylinder(bm, radius * 0.26, 0.18, (out_x + 0.08, ly, lz), segments=16, rot_y=rot_y)
    # 10 wheel lug bolts
    for b_i in range(10):
        theta = b_i * 2 * math.pi / 10
        by = radius * 0.42 * math.cos(theta)
        bz = radius * 0.42 * math.sin(theta)
        bmesh_box(bm, (0.08, 0.04, 0.04), (out_x + 0.04, ly + by, lz + bz))

def bmesh_semi_truck(bm, loc: tuple, cab_tilted=False, on_lift=False, lift_z=1.8):
    """Creates a high-density Class-8 commercial semi-truck tractor with chassis rails and tandem duals."""
    lx, ly, lz = loc
    base_z = lz + (lift_z if on_lift else 0.55)
    
    # 1. Dual C-Channel Chassis Rails (8.2m length)
    for rx in [-0.45, 0.45]:
        bmesh_box(bm, (0.12, 8.2, 0.28), (lx + rx, ly - 0.6, base_z + 0.55))
    # 6 Heavy Tubular/Flanged Crossmembers
    for cy in [-4.2, -2.8, -1.4, 0.0, 1.4, 2.8]:
        bmesh_box(bm, (0.80, 0.14, 0.22), (lx, ly + cy, base_z + 0.55))
        
    # 2. Front Steer Axle & Suspension
    bmesh_cylinder(bm, 0.08, 2.1, (lx, ly + 2.4, base_z + 0.50), segments=12, rot_y=math.radians(90.0))
    for sx in [-0.55, 0.55]:
        bmesh_box(bm, (0.12, 1.4, 0.16), (lx + sx, ly + 2.4, base_z + 0.68)) # Multi-leaf spring packs
    # 2 Front Single Steer Wheels
    bmesh_truck_wheel(bm, 0.56, 0.35, (lx - 1.15, ly + 2.4, base_z + 0.55), dual=False)
    bmesh_truck_wheel(bm, 0.56, 0.35, (lx + 1.15, ly + 2.4, base_z + 0.55), dual=False)

    # 3. Tandem Dual Rear Drive Axles
    for ay in [-2.4, -3.8]:
        bmesh_cylinder(bm, 0.10, 2.2, (lx, ly + ay, base_z + 0.55), segments=14, rot_y=math.radians(90.0))
        # Differential pumpkin housing
        bmesh_cylinder(bm, 0.26, 0.35, (lx, ly + ay, base_z + 0.55), segments=16)
        # Type 30/30 dual air brake chambers
        bmesh_cylinder(bm, 0.14, 0.28, (lx - 0.70, ly + ay + 0.22, base_z + 0.55), segments=12)
        bmesh_cylinder(bm, 0.14, 0.28, (lx + 0.70, ly + ay + 0.22, base_z + 0.55), segments=12)
        # Tandem dual wheels (left & right)
        bmesh_truck_wheel(bm, 0.56, 0.32, (lx - 1.25, ly + ay, base_z + 0.55), dual=True)
        bmesh_truck_wheel(bm, 0.56, 0.32, (lx + 1.25, ly + ay, base_z + 0.55), dual=True)

    # 4. Fifth Wheel Coupling Plate (Heavy Oscillating Hitch)
    bmesh_box(bm, (1.0, 1.1, 0.12), (lx, ly - 3.1, base_z + 0.85))
    bmesh_pyramid(bm, (0.35, 0.8), 0.12, (lx, ly - 3.7, base_z + 0.85))
    bmesh_box(bm, (0.08, 0.45, 0.08), (lx - 0.55, ly - 3.1, base_z + 0.85)) # Release handle

    # 5. Saddle Aluminum Diesel Fuel Tanks
    for tx in [-1.05, 1.05]:
        bmesh_cylinder(bm, 0.34, 2.2, (lx + tx, ly + 0.3, base_z + 0.52), segments=18, rot_x=math.radians(90.0))
        # Tank mounting straps
        bmesh_tube(bm, 0.36, 0.34, 0.08, (lx + tx, ly - 0.5, base_z + 0.52), segments=18, rot_x=math.radians(90.0))
        bmesh_tube(bm, 0.36, 0.34, 0.08, (lx + tx, ly + 1.1, base_z + 0.52), segments=18, rot_x=math.radians(90.0))
        # Filler cap
        bmesh_cylinder(bm, 0.06, 0.12, (lx + tx, ly + 0.8, base_z + 0.90), segments=12)

    # 6. Commercial Truck Cab & Sleeper Compartment
    cab_pitch = math.radians(35.0) if cab_tilted else 0.0
    cab_pivot_y = ly + 3.2
    cab_pivot_z = base_z + 0.85
    
    cos_p, sin_p = math.cos(cab_pitch), math.sin(cab_pitch)
    def cab_tx(x, y, z):
        # Rotate around local front pivot
        dy = y - cab_pivot_y
        dz = z - cab_pivot_z
        ry = dy * cos_p - dz * sin_p
        rz = dy * sin_p + dz * cos_p
        return (x, cab_pivot_y + ry, cab_pivot_z + rz)

    # Main Cab Box
    c_loc = cab_tx(lx, ly + 2.0, base_z + 2.2)
    bmesh_box(bm, (2.45, 2.6, 2.5), c_loc)
    # Sleeper Box
    s_loc = cab_tx(lx, ly + 0.2, base_z + 2.2)
    bmesh_box(bm, (2.45, 1.8, 2.5), s_loc)
    # Aerodynamic Roof Deflector Fairing
    f_loc = cab_tx(lx, ly + 1.6, base_z + 3.8)
    bmesh_box(bm, (2.35, 2.2, 0.8), f_loc)
    
    # Heavy Front Bumper & Radiator Grille
    bmp_loc = cab_tx(lx, ly + 3.35, base_z + 0.85)
    bmesh_box(bm, (2.55, 0.35, 0.45), bmp_loc)
    # Recessed Headlamps
    for hx in [-1.0, 1.0]:
        hl_loc = cab_tx(lx + hx, ly + 3.45, base_z + 0.85)
        bmesh_box(bm, (0.35, 0.12, 0.22), hl_loc)
    # Radiator vertical grille slats
    for gx_i in range(-5, 6):
        gr_loc = cab_tx(lx + gx_i * 0.16, ly + 3.32, base_z + 1.6)
        bmesh_box(bm, (0.05, 0.08, 0.95), gr_loc)

    # 7. Twin Vertical Chrome Exhaust Stacks with Perforated Heat Shields
    for ex_x in [-1.15, 1.15]:
        stk_loc = (lx + ex_x, ly - 0.75, base_z + 2.6)
        bmesh_cylinder(bm, 0.09, 3.8, stk_loc, segments=18)
        # Heat shield perforated outer tube
        bmesh_tube(bm, 0.15, 0.12, 2.2, (lx + ex_x, ly - 0.75, base_z + 2.0), segments=18)
        # Rain flapper lid on top of stack
        bmesh_box(bm, (0.24, 0.24, 0.03), (lx + ex_x, ly - 0.75, base_z + 4.55))

    # 8. If on lift, add 4 heavy electro-mechanical lift columns
    if on_lift:
        for lx_col, ly_col in [(-1.6, ly + 2.4), (1.6, ly + 2.4), (-1.6, ly - 3.1), (1.6, ly - 3.1)]:
            # Column mast (H-profile or box)
            bmesh_box(bm, (0.45, 0.45, 3.2), (lx + lx_col, ly_col, lz + 1.6))
            # Base plate
            bmesh_box(bm, (0.80, 0.80, 0.12), (lx + lx_col, ly_col, lz + 0.06))
            # Lifting carriage & wheel wheel-engagement fork
            bmesh_box(bm, (0.55, 0.55, 0.45), (lx + lx_col, ly_col, base_z + 0.2))
            bmesh_box(bm, (0.35, 0.12, 0.12), (lx + lx_col * 0.5, ly_col, base_z + 0.35))

# ── LEVEL BUILDERS ──

def build_commercial_l0(export_path: str):
    """Level 0: Empty / Reserved Plot with survey markers and geotechnical drill rig."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_09_COMMERCIAL_HQ_L0", None)
    bpy.context.collection.objects.link(root)
    
    # 1. Foundation Plinth (36m x 36m)
    bm_plinth = bmesh.new()
    bmesh_box(bm_plinth, (36.0, 36.0, 0.3), (0.0, 0.0, -0.15))
    create_mesh_object("GEO_Commercial_Foundation_Plinth", bm_plinth, mat_travertine_concrete(), root, 0.04)
    
    # 2. Survey Stakes & Perimeter Bunting (24 perimeter stakes)
    bm_stakes = bmesh.new()
    for s_i in range(16):
        theta = s_i * 2 * math.pi / 16
        sx = 16.5 * math.cos(theta)
        sy = 16.5 * math.sin(theta)
        bmesh_cylinder(bm_stakes, 0.08, 1.8, (sx, sy, 0.9), segments=12)
        # Warning flag atop stake
        bmesh_box(bm_stakes, (0.28, 0.02, 0.18), (sx + 0.12, sy, 1.7))
    create_mesh_object("GEO_Commercial_Survey_Stakes", bm_stakes, mat_safety_yellow(), root)
    
    # 3. Architectural Billboard & Structural Steel Frame
    bm_sign = bmesh.new()
    # Twin lattice upright poles
    bmesh_box(bm_sign, (0.25, 0.25, 3.6), (-2.8, 14.5, 1.8))
    bmesh_box(bm_sign, (0.25, 0.25, 3.6), (2.8, 14.5, 1.8))
    # Rear diagonal support struts
    bmesh_cylinder(bm_sign, 0.06, 3.2, (-2.8, 13.5, 1.5), segments=10, rot_x=math.radians(35.0))
    bmesh_cylinder(bm_sign, 0.06, 3.2, (2.8, 13.5, 1.5), segments=10, rot_x=math.radians(35.0))
    # Large billboard panel
    bmesh_box(bm_sign, (6.4, 0.18, 2.8), (0.0, 14.5, 3.2))
    # Billboard lighting fixtures
    for bx in [-2.2, 0.0, 2.2]:
        bmesh_cylinder(bm_sign, 0.04, 0.8, (bx, 14.8, 4.6), segments=8, rot_x=math.radians(45.0))
        bmesh_box(bm_sign, (0.45, 0.25, 0.12), (bx, 15.1, 4.9))
    create_mesh_object("GEO_Commercial_Survey_Signboard", bm_sign, mat_dark_slate_roof(), root)
    
    # 4. Geotechnical Soil Core Drilling Rig & Core Sample Crates
    bm_drill = bmesh.new()
    # Skid trailer platform
    bmesh_box(bm_drill, (2.4, 4.2, 0.4), (-6.0, 4.0, 0.2))
    # Vertical drilling mast & rotary swivel
    bmesh_box(bm_drill, (0.35, 0.35, 4.5), (-6.0, 5.2, 2.45))
    bmesh_cylinder(bm_drill, 0.12, 3.8, (-6.0, 5.2, 2.1), segments=12) # Kelly bar drill rod
    # Power generator engine unit
    bmesh_box(bm_drill, (1.6, 2.0, 1.4), (-6.0, 3.2, 1.1))
    # Core sample wooden sample boxes
    for c_i in range(4):
        bmesh_box(bm_drill, (0.85, 1.2, 0.22), (-2.5, 4.0 + c_i * 0.45, 0.11))
    create_mesh_object("GEO_Commercial_Soil_Drill_Rig", bm_drill, mat_construction_orange(), root)

    # 5. Semantic Hitbox
    bm_hitbox = bmesh.new()
    bmesh_box(bm_hitbox, (34.0, 34.0, 3.0), (0.0, 0.0, 1.5))
    create_mesh_object("HITBOX_COMMERCIAL_MAIN", bm_hitbox, None, root)
    
    extras = {
        "unit_id": "COMMERCIAL_VEHICLES_HQ",
        "unit_key": "UNIT_09",
        "level": 0,
        "tier": "empty_plot",
        "building_name": "Commercial Vehicles HQ (Reserved Plot)",
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

def add_base_commercial_l1(root):
    """Core 1970s Heavy Truck Service Depot architecture shared across L1-L7."""
    # 1. Foundation Plinth (36m x 36m)
    bm_plinth = bmesh.new()
    bmesh_box(bm_plinth, (36.0, 36.0, 0.3), (0.0, 0.0, -0.15))
    create_mesh_object("GEO_Commercial_Foundation_Plinth", bm_plinth, mat_travertine_concrete(), root, 0.04)
    
    # 2. Main High-Clearance Twin Service Depot Shell (24m x 22m x 10.8m)
    # Center-West footprint: X = -3.0m, Y = -2.0m, Z = 5.4m
    bm_depot = bmesh.new()
    bmesh_box(bm_depot, (22.0, 20.0, 10.4), (-3.0, -2.0, 5.2))
    # Parapet capping trim along roof perimeter
    bmesh_box(bm_depot, (22.6, 20.6, 0.45), (-3.0, -2.0, 10.5))
    create_mesh_object("GEO_Commercial_Service_Depot_Shell", bm_depot, mat_travertine_concrete(), root, 0.06)

    # 3. Structural Heavy Steel Columns & Crane Runway I-Beams (Inside High-Bay)
    bm_columns = bmesh.new()
    for col_x in [-13.5, 7.5]:
        for col_y in [-11.0, -6.0, -1.0, 4.0, 7.5]:
            bmesh_box(bm_columns, (0.55, 0.55, 10.2), (col_x, col_y, 5.1))
            # Crane beam bracket corbel
            bmesh_box(bm_columns, (0.75, 0.45, 0.45), (col_x + (0.35 if col_x < 0 else -0.35), col_y, 7.8))
    # Runway longitudinal I-beams
    bmesh_ibeam(bm_columns, 19.5, 0.65, 0.45, 0.04, 0.03, (-13.1, -1.8, 8.2), axis='Y')
    bmesh_ibeam(bm_columns, 19.5, 0.65, 0.45, 0.04, 0.03, (7.1, -1.8, 8.2), axis='Y')
    create_mesh_object("GEO_Commercial_Structural_Columns", bm_columns, mat_coral_structural_beam(), root)

    # 4. Exposed Steel Roof Trusses Spanning the High Bay (6 Warren Trusses)
    bm_trusses = bmesh.new()
    for tr_y in [-9.5, -6.0, -2.5, 1.0, 4.5, 7.0]:
        # Top chord
        bmesh_box(bm_trusses, (21.2, 0.25, 0.25), (-3.0, tr_y, 10.1))
        # Bottom chord
        bmesh_box(bm_trusses, (21.2, 0.25, 0.25), (-3.0, tr_y, 8.8))
        # Vertical struts & diagonal webbing
        for web_x in range(-12, 8, 3):
            bmesh_box(bm_trusses, (0.18, 0.18, 1.3), (web_x + 0.5, tr_y, 9.45))
            bmesh_cylinder(bm_trusses, 0.06, 2.1, (web_x + 2.0, tr_y, 9.45), segments=8, rot_y=math.radians(38.0))
    create_mesh_object("GEO_Commercial_HighBay_Roof_Trusses", bm_trusses, mat_coral_structural_beam(), root)

    # 5. Twin High-Clearance Roll-up Service Doors (North face: X = -8.5m and 2.5m, Y = 8.1m)
    bm_doors = bmesh.new()
    for xd in [-8.5, 2.5]:
        # Outer heavy portal frame
        bmesh_box(bm_doors, (6.8, 0.5, 6.8), (xd, 8.1, 3.4))
        # Corrugated roll-up door slats (14 horizontal slats)
        for sl_i in range(14):
            bmesh_box(bm_doors, (6.0, 0.15, 0.42), (xd, 8.12, 0.35 + sl_i * 0.45))
        # Top drum housing for rolled door
        bmesh_cylinder(bm_doors, 0.45, 6.4, (xd, 7.9, 6.4), segments=18, rot_y=math.radians(90.0))
    create_mesh_object("GEO_Commercial_HighClearance_Doors", bm_doors, mat_corrugated_industrial_steel(), root)

    # 6. Class-8 Heavy Commercial Semi-Truck inside Bay on Hydraulic Lift
    bm_truck = bmesh.new()
    bmesh_semi_truck(bm_truck, loc=(-8.5, -1.5, 0.0), cab_tilted=True, on_lift=True, lift_z=1.6)
    create_mesh_object("GEO_Commercial_Heavy_Semi_Truck", bm_truck, mat_pearl_concept_car_paint(), root)

    # 7. 10-Ton Overhead Bridge Gantry Crane
    bm_crane = bmesh.new()
    # Main transverse bridge double I-beams spanning across the shop
    bmesh_ibeam(bm_crane, 20.2, 0.75, 0.45, 0.04, 0.03, (-3.0, -1.0, 8.8), axis='X')
    bmesh_ibeam(bm_crane, 20.2, 0.75, 0.45, 0.04, 0.03, (-3.0, 0.2, 8.8), axis='X')
    # End truck wheel carriages
    for ec_x in [-13.1, 7.1]:
        bmesh_box(bm_crane, (0.6, 2.4, 0.5), (ec_x, -0.4, 8.5))
        bmesh_cylinder(bm_crane, 0.22, 0.2, (ec_x, -1.2, 8.3), segments=16, rot_y=math.radians(90.0))
        bmesh_cylinder(bm_crane, 0.22, 0.2, (ec_x, 0.4, 8.3), segments=16, rot_y=math.radians(90.0))
    # Hoist trolley box, wire rope drum, and heavy forged hook
    bmesh_box(bm_crane, (1.8, 1.8, 0.8), (-7.5, -0.4, 9.4))
    bmesh_cylinder(bm_crane, 0.35, 1.2, (-7.5, -0.4, 8.6), segments=18, rot_y=math.radians(90.0)) # Cable drum
    bmesh_cylinder(bm_crane, 0.03, 2.2, (-7.5, -0.4, 7.4), segments=8) # Suspended wire rope
    bmesh_cylinder(bm_crane, 0.28, 0.35, (-7.5, -0.4, 6.2), segments=16) # Hook block
    bmesh_tube(bm_crane, 0.35, 0.22, 0.12, (-7.5, -0.4, 5.7), segments=16) # Forged hook
    create_mesh_object("GEO_Commercial_Overhead_Gantry_Crane", bm_crane, mat_safety_yellow(), root)

    # 8. Industrial Diesel Soot Exhaust Chimney Stack & Filtration Hoods
    bm_stack = bmesh.new()
    bmesh_cylinder(bm_stack, 0.75, 13.5, (-13.2, -10.5, 6.75), segments=24)
    bmesh_tube(bm_stack, 0.95, 0.75, 0.9, (-13.2, -10.5, 13.5), segments=24)
    # Wall anchor braces
    for st_z in [4.0, 8.0, 11.0]:
        bmesh_box(bm_stack, (0.8, 0.15, 0.15), (-13.6, -10.5, st_z))
    # Articulated soot snorkel drop arms over service bays
    for sn_x, sn_y in [(-8.5, 2.0), (2.5, 2.0)]:
        bmesh_cylinder(bm_stack, 0.14, 2.4, (sn_x, sn_y, 7.2), segments=14)
        bmesh_cylinder(bm_stack, 0.32, 0.45, (sn_x, sn_y, 5.8), segments=16) # Intake funnel
    create_mesh_object("GEO_Commercial_Soot_Exhaust_Stack", bm_stack, mat_corrugated_industrial_steel(), root)

    # 9. Fleet Dispatch & Engineering Office Wing (East wing: X = 12.0m, Y = 0.0m)
    bm_office = bmesh.new()
    bmesh_box(bm_office, (8.0, 24.0, 7.2), (12.0, 0.0, 3.6))
    # Decorative concrete cornice and base trim
    bmesh_box(bm_office, (8.5, 24.5, 0.45), (12.0, 0.0, 7.3))
    bmesh_box(bm_office, (8.5, 24.5, 0.40), (12.0, 0.0, 0.2))
    create_mesh_object("GEO_Commercial_Dispatch_Halls", bm_office, mat_lavender_brick_1970(), root, 0.05)

    # 10. Dispatch Office Clerestory & Ribbon Windows
    bm_win = bmesh.new()
    bmesh_box(bm_win, (0.2, 18.0, 2.4), (16.1, 0.0, 4.8))
    bmesh_box(bm_win, (4.5, 0.2, 2.6), (12.0, 12.1, 1.3))
    create_mesh_object("GEO_Commercial_Dispatch_Glass", bm_win, mat_tinted_acrylic_window(), root)

    # Window Mullions
    bm_mull = bmesh.new()
    for ym in range(-8, 9, 2):
        bmesh_box(bm_mull, (0.35, 0.12, 2.5), (16.15, ym, 4.8))
    create_mesh_object("GEO_Commercial_Dispatch_Mullions", bm_mull, mat_brushed_aluminum(), root)

    # 11. Compressed Air Ring Main & Lubrication Reel Bank
    bm_lube = bmesh.new()
    # Blue compressed air pipe along wall
    bmesh_cylinder(bm_lube, 0.04, 21.0, (-13.6, -1.8, 4.5), segments=12, rot_x=math.radians(90.0))
    # Hose reels bank (5 reels on overhead beam)
    for r_i in range(5):
        bmesh_cylinder(bm_lube, 0.28, 0.16, (-8.5 + (r_i - 2) * 0.45, 5.2, 5.6), segments=18, rot_y=math.radians(90.0))
        bmesh_tube(bm_lube, 0.32, 0.28, 0.04, (-8.5 + (r_i - 2) * 0.45, 5.2, 5.6), segments=18, rot_y=math.radians(90.0))
    create_mesh_object("GEO_Commercial_Shop_Lube_And_Air", bm_lube, mat_coral_structural_beam(), root)

    # 12. Semantic Hitboxes
    bm_hitbox = bmesh.new()
    bmesh_box(bm_hitbox, (34.0, 34.0, 11.2), (0.0, 0.0, 5.6))
    create_mesh_object("HITBOX_COMMERCIAL_MAIN", bm_hitbox, None, root)
    
    bm_depot_hb = bmesh.new()
    bmesh_box(bm_depot_hb, (24.0, 22.0, 11.0), (-3.0, -2.0, 5.5))
    create_mesh_object("HITBOX_COMMERCIAL_DEPOT", bm_depot_hb, None, root)

def build_commercial_l1(export_path: str):
    """Level 1: 1970s Heavy Truck Service Depot."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_09_COMMERCIAL_HQ_L1", None)
    bpy.context.collection.objects.link(root)
    add_base_commercial_l1(root)
    
    extras = {
        "unit_id": "COMMERCIAL_VEHICLES_HQ",
        "unit_key": "UNIT_09",
        "level": 1,
        "tier": "office",
        "building_name": "Commercial Vehicles HQ (Heavy Service Depot)",
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

def add_commercial_l2_geometry(root):
    """Level 2: Chassis Torsion Rig Annex & Heavy Axle Shop (1975-1980)."""
    # 1. Torsional Rig Annex Shell on South Flank (X = -3.0m, Y = -14.2m)
    bm_torsion = bmesh.new()
    bmesh_box(bm_torsion, (20.0, 6.5, 7.8), (-3.0, -14.25, 3.9))
    bmesh_box(bm_torsion, (20.6, 7.1, 0.4), (-3.0, -14.25, 7.9)) # Cornice
    # Clerestory transom windows along annex
    for wx_i in range(-8, 5, 3):
        bmesh_box(bm_torsion, (2.2, 0.15, 1.4), (wx_i, -17.55, 5.8))
    create_mesh_object("GEO_Commercial_Torsional_Rig_Shell", bm_torsion, mat_travertine_concrete(), root, 0.05)

    # 2. Heavy Chassis Torsional Twisting Rig & Load Cell Crossheads
    bm_rig = bmesh.new()
    # Ground bedplate with T-slots
    bmesh_box(bm_rig, (16.5, 4.5, 0.45), (-3.0, -14.25, 0.22))
    # Bedplate hold-down clamping T-bolts (24 bolts)
    for bx_i in range(-7, 7, 2):
        for by_i in [-15.8, -12.7]:
            bmesh_cylinder(bm_rig, 0.05, 0.18, (bx_i, by_i, 0.5), segments=8)
    # Fixed rear chassis clamping tower
    bmesh_box(bm_rig, (2.8, 1.2, 2.6), (-9.5, -14.25, 1.5))
    # Front torsional twisting head with hydraulic actuator cylinders
    bmesh_cylinder(bm_rig, 0.65, 1.2, (3.5, -14.25, 1.6), segments=20, rot_y=math.radians(90.0))
    for cyl_y in [-15.2, -13.3]:
        bmesh_cylinder(bm_rig, 0.24, 2.4, (3.5, cyl_y, 1.8), segments=18) # Vertical hydraulic twisting cylinders
        bmesh_cylinder(bm_rig, 0.14, 1.8, (3.5, cyl_y, 2.6), segments=16) # Polished chrome piston rods
        # Servo valve manifold blocks
        bmesh_box(bm_rig, (0.35, 0.35, 0.45), (3.5, cyl_y, 0.8))
    # Test chassis ladder frame being twisted on rig
    for ch_y in [-14.7, -13.8]:
        bmesh_box(bm_rig, (11.0, 0.15, 0.25), (-3.0, ch_y, 1.6))
    for ch_x in range(-8, 3, 2):
        bmesh_box(bm_rig, (0.15, 1.0, 0.18), (ch_x, -14.25, 1.6))
    # High pressure hydraulic hose bundle
    for h_i in range(6):
        bmesh_cylinder(bm_rig, 0.035, 3.8, (1.8 + h_i * 0.25, -14.25, 0.6), segments=8, rot_y=math.radians(90.0))
    create_mesh_object("GEO_Commercial_Torsion_Test_Rig", bm_rig, mat_safety_yellow(), root)

    # 3. Heavy Axle Dynamometer & Leaf Spring Fatigue Tester
    bm_axle = bmesh.new()
    # High-torque electric drive motor with cooling fins
    bmesh_cylinder(bm_axle, 0.55, 1.8, (12.0, -8.0, 1.1), segments=20, rot_x=math.radians(90.0))
    for f_i in range(8):
        bmesh_tube(bm_axle, 0.58, 0.55, 0.06, (12.0, -8.6 + f_i * 0.18, 1.1), segments=18, rot_x=math.radians(90.0))
    # Heavy tandem axle under cyclic deflection test
    bmesh_cylinder(bm_axle, 0.14, 2.4, (12.0, -11.0, 1.1), segments=18, rot_y=math.radians(90.0))
    # Massive cast brake drums on axle ends
    for bdx in [10.6, 13.4]:
        bmesh_cylinder(bm_axle, 0.42, 0.28, (bdx, -11.0, 1.1), segments=20, rot_y=math.radians(90.0))
    # Leaf spring multi-packs
    for sp_x in [10.8, 13.2]:
        bmesh_box(bm_axle, (0.15, 1.6, 0.25), (sp_x, -11.0, 1.35))
        # Hydraulic cyclic push-pull actuator
        bmesh_cylinder(bm_axle, 0.18, 1.6, (sp_x, -11.0, 2.4), segments=16)
    create_mesh_object("GEO_Commercial_Axle_Fatigue_Bench", bm_axle, mat_coral_structural_beam(), root)

    # 4. Diagnostic Instrumentation Trolleys & Calibration Carts
    bm_carts = bmesh.new()
    for cart_i, cart_pos in enumerate([(-10.5, -11.5), (-1.0, -11.5), (6.0, -11.5)]):
        bmesh_box(bm_carts, (1.2, 0.8, 1.4), (cart_pos[0], cart_pos[1], 0.7))
        bmesh_box(bm_carts, (0.8, 0.6, 0.5), (cart_pos[0], cart_pos[1], 1.65)) # Oscilloscope / data display
        for w_i in [(-0.5, -0.3), (0.5, -0.3), (-0.5, 0.3), (0.5, 0.3)]:
            bmesh_cylinder(bm_carts, 0.08, 0.06, (cart_pos[0] + w_i[0], cart_pos[1] + w_i[1], 0.08), segments=12)
    # Heavy duty steel workshop tool cabinets & workbench
    for tb_x in [-12.5, -7.0, 0.0]:
        bmesh_box(bm_carts, (1.8, 0.7, 1.1), (tb_x, -16.8, 0.55))
        # Tool drawers
        for dr_i in range(4):
            bmesh_box(bm_carts, (1.6, 0.04, 0.18), (tb_x, -16.42, 0.2 + dr_i * 0.24))
    create_mesh_object("GEO_Commercial_Diagnostic_Carts", bm_carts, mat_brushed_aluminum(), root)

def build_commercial_l2(export_path: str):
    """Level 2: Chassis Torsion Rig Annex & Heavy Axle Shop."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_09_COMMERCIAL_HQ_L2", None)
    bpy.context.collection.objects.link(root)
    add_base_commercial_l1(root)
    add_commercial_l2_geometry(root)
    
    extras = {
        "unit_id": "COMMERCIAL_VEHICLES_HQ",
        "unit_key": "UNIT_09",
        "level": 2,
        "tier": "department",
        "building_name": "Commercial Vehicles HQ (Chassis Torsion & Axle Wing)",
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

def add_commercial_l3_geometry(root):
    """Level 3: Fleet Durability Shaker Rig & Dust Ingress Environmental Tunnel (1980-1990)."""
    # 1. Shaker Rig & Environmental Test Wing along West Flank (X = -15.5m, Y = -2.0m)
    bm_shaker = bmesh.new()
    bmesh_box(bm_shaker, (4.6, 20.0, 8.2), (-15.7, -2.0, 4.1))
    bmesh_box(bm_shaker, (5.0, 20.5, 0.45), (-15.7, -2.0, 8.3)) # Cornice
    # Industrial high-bay clerestory glazing
    for zy_i in range(-8, 8, 3):
        bmesh_box(bm_shaker, (0.15, 2.2, 1.4), (-17.95, zy_i, 6.2))
    create_mesh_object("GEO_Commercial_Shaker_Rig_Shell", bm_shaker, mat_lavender_brick_1970(), root, 0.05)

    # 2. 6-Post Heavy Vehicle Multi-Axis Servo-Hydraulic Shaker Rig
    bm_act = bmesh.new()
    # 6 Massive hydraulic shaker actuator cylinders with spherical ball mounts
    for ay in [-7.5, -4.5, -1.5, 1.5, 4.5, 6.5]:
        bmesh_cylinder(bm_act, 0.34, 1.8, (-15.7, ay, 0.9), segments=20)
        bmesh_cylinder(bm_act, 0.20, 1.2, (-15.7, ay, 1.8), segments=16) # Polished chrome shaft
        # Rubber bellows accordion cover (3 stacked rings)
        for bel_z in [1.5, 1.7, 1.9]:
            bmesh_tube(bm_act, 0.28, 0.20, 0.08, (-15.7, ay, bel_z), segments=16)
        # Tire contact pad plate with non-slip grid
        bmesh_box(bm_act, (1.3, 0.85, 0.16), (-15.7, ay, 2.45))
        # High pressure hydraulic feed hoses
        bmesh_cylinder(bm_act, 0.045, 1.6, (-17.2, ay, 1.2), segments=10, rot_y=math.radians(90.0))
    # Nitrogen Accumulator Bottles Bank (16 vertical bottles)
    for n_i in range(16):
        ny = -8.5 + n_i * 0.95
        bmesh_cylinder(bm_act, 0.12, 1.8, (-17.4, ny, 1.2), segments=16)
        bmesh_cylinder(bm_act, 0.07, 0.25, (-17.4, ny, 2.2), segments=12) # Valve head
        bmesh_box(bm_act, (0.05, 0.12, 0.08), (-17.4, ny, 2.35))
    # Heavy Commercial Flatbed Truck Chassis on Shaker Pads
    for rx_s in [-16.2, -15.2]:
        bmesh_box(bm_act, (0.12, 8.5, 0.28), (rx_s, -0.5, 3.1))
    for ry_s in range(-4, 4):
        bmesh_box(bm_act, (1.2, 0.12, 0.18), (-15.7, ry_s * 1.1, 3.1))
    # Cab assembly on shaker chassis
    bmesh_box(bm_act, (2.2, 2.4, 2.2), (-15.7, 2.2, 4.4))
    bmesh_box(bm_act, (2.1, 0.15, 1.0), (-15.7, 3.35, 4.7)) # Windshield
    create_mesh_object("GEO_Commercial_Multiaxis_Shakers", bm_act, mat_safety_yellow(), root)

    # 3. Dust Ingress & Environmental Wind Blowers (North approach tunnel: Y = 13.0m)
    bm_dust = bmesh.new()
    # Drive-through chamber shell
    bmesh_box(bm_dust, (8.5, 6.0, 6.5), (2.5, 13.0, 3.25))
    # 4 Cyclonic centrifugal dust blowers atop chamber
    for bx_i in [-1.5, 1.5, 4.5]:
        bmesh_cylinder(bm_dust, 0.65, 0.8, (bx_i, 13.0, 6.8), segments=20)
        bmesh_cylinder(bm_dust, 0.28, 1.4, (bx_i, 13.0, 7.6), segments=16) # Exhaust duct
        bmesh_tube(bm_dust, 0.32, 0.28, 0.12, (bx_i, 13.0, 8.3), segments=16)
    # Internal sand/dust injection nozzle array (24 nozzles)
    for nz_i in range(12):
        nz_y = 10.5 + (nz_i % 6) * 0.85
        nz_z = 2.0 if nz_i < 6 else 4.5
        bmesh_pyramid(bm_dust, (0.12, 0.12), 0.18, (-1.5, nz_y, nz_z), rot_y=math.radians(90.0))
        bmesh_pyramid(bm_dust, (0.12, 0.12), 0.18, (6.5, nz_y, nz_z), rot_y=math.radians(-90.0))
    create_mesh_object("GEO_Commercial_Dust_Ingress_Chamber", bm_dust, mat_corrugated_industrial_steel(), root)

    # 4. Central Hydraulic Power Unit (HPU) Skid (300kW pumping station)
    bm_hpu = bmesh.new()
    bmesh_box(bm_hpu, (3.2, 2.4, 1.8), (-13.0, -15.5, 0.9))
    for m_i in range(3):
        bmesh_cylinder(bm_hpu, 0.35, 1.2, (-13.0 + (m_i - 1) * 0.9, -15.5, 2.2), segments=18, rot_x=math.radians(90.0))
        # Motor junction box & cooling fan cowl
        bmesh_box(bm_hpu, (0.25, 0.25, 0.25), (-13.0 + (m_i - 1) * 0.9, -15.5, 2.65))
        bmesh_tube(bm_hpu, 0.36, 0.32, 0.15, (-13.0 + (m_i - 1) * 0.9, -16.2, 2.2), segments=18, rot_x=math.radians(90.0))
    create_mesh_object("GEO_Commercial_HPU_Pumping_Skid", bm_hpu, mat_cast_iron_dark(), root)

def build_commercial_l3(export_path: str):
    """Level 3: Fleet Durability Shaker Rig & Dust Ingress Complex."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_09_COMMERCIAL_HQ_L3", None)
    bpy.context.collection.objects.link(root)
    add_base_commercial_l1(root)
    add_commercial_l2_geometry(root)
    add_commercial_l3_geometry(root)
    
    extras = {
        "unit_id": "COMMERCIAL_VEHICLES_HQ",
        "unit_key": "UNIT_09",
        "level": 3,
        "tier": "center",
        "building_name": "Commercial Vehicles HQ (Fleet Durability Shaker Complex)",
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

def add_commercial_l4_geometry(root):
    """Level 4: Megawatt Commercial Powertrain Test Cell & Evaporative Cooling Towers (1995-2000)."""
    # 1. Massive High-Bay Powertrain Dyno Cell (X = -3.0m, Y = -14.0m, Z = 6.2m, rising to 12.4m)
    bm_cell = bmesh.new()
    bmesh_box(bm_cell, (22.0, 8.5, 12.2), (-3.0, -14.25, 6.1))
    bmesh_box(bm_cell, (22.6, 9.1, 0.5), (-3.0, -14.25, 12.3)) # Roof parapet cap
    # Acoustic isolation door on east flank
    bmesh_box(bm_cell, (0.25, 3.2, 4.5), (8.1, -14.25, 2.25))
    create_mesh_object("GEO_Commercial_Powertrain_Cell_Shell", bm_cell, mat_travertine_concrete(), root, 0.06)

    # 2. Acoustic Anechoic Pyramidal Wedges inside Dyno Cell
    bm_wedges = bmesh.new()
    for w_x in range(-12, 7, 2):
        for w_z in range(2, 10, 2):
            bmesh_pyramid(bm_wedges, (0.75, 0.75), 0.55, (w_x + 0.5, -17.85, w_z), rot_x=math.radians(90.0))
            bmesh_pyramid(bm_wedges, (0.75, 0.75), 0.55, (w_x + 0.5, -10.65, w_z), rot_x=math.radians(-90.0))
    create_mesh_object("GEO_Commercial_Acoustic_Wedges", bm_wedges, mat_dark_slate_roof(), root)

    # 3. High-Capacity V16 Heavy Industrial Diesel Engine & Twin Dyno Absorption Units
    bm_dyno = bmesh.new()
    # Cast-iron slotted bedplate
    bmesh_box(bm_dyno, (18.0, 5.5, 0.5), (-3.0, -14.25, 0.25))
    # Twin massive absorption dynamometer casings
    for dx in [-7.5, 1.5]:
        bmesh_cylinder(bm_dyno, 0.95, 1.8, (dx, -14.25, 1.4), segments=24, rot_y=math.radians(90.0))
        # Rotor end bells & torque arm
        bmesh_cylinder(bm_dyno, 0.75, 0.25, (dx - 1.0, -14.25, 1.4), segments=20, rot_y=math.radians(90.0))
        bmesh_box(bm_dyno, (0.15, 0.25, 1.4), (dx, -14.25, 2.2)) # Torque reaction load cell
        # Cooling water recirculation manifolds
        bmesh_cylinder(bm_dyno, 0.16, 2.2, (dx, -12.8, 1.6), segments=16, rot_y=math.radians(90.0))
    
    # 16-Liter Heavy Duty V16 Diesel Engine on Test Stand
    bmesh_box(bm_dyno, (1.8, 3.2, 1.6), (-3.0, -14.25, 1.6))
    # 16 Individual cylinder valve covers
    for v_i in range(8):
        v_y = -15.4 + v_i * 0.35
        bmesh_box(bm_dyno, (0.45, 0.28, 0.25), (-3.6, v_y, 2.5))
        bmesh_box(bm_dyno, (0.45, 0.28, 0.25), (-2.4, v_y, 2.5))
        # Fuel injector lines
        bmesh_cylinder(bm_dyno, 0.025, 0.4, (-3.6, v_y, 2.75), segments=8)
        bmesh_cylinder(bm_dyno, 0.025, 0.4, (-2.4, v_y, 2.75), segments=8)
    # Twin turbocharger compressors
    for tbx in [-3.8, -2.2]:
        bmesh_cylinder(bm_dyno, 0.38, 0.45, (tbx, -13.2, 2.2), segments=20)
        # Intercooler charge air pipes
        bmesh_tube(bm_dyno, 0.18, 0.14, 1.4, (tbx, -12.4, 2.2), segments=16, rot_x=math.radians(90.0))
    # Stainless Steel Exhaust Scrubber & Silencer Manifolds
    for sx in [-4.5, -1.5]:
        bmesh_cylinder(bm_dyno, 0.28, 6.5, (sx, -15.5, 6.0), segments=20)
        bmesh_tube(bm_dyno, 0.35, 0.28, 0.45, (sx, -15.5, 9.4), segments=20)
    # Front radiator cooling fans (2 fans * 8 blades)
    for fx in [-3.5, -2.5]:
        bmesh_cylinder(bm_dyno, 0.45, 0.12, (fx, -12.4, 1.6), segments=18, rot_x=math.radians(90.0))
        for b_i in range(8):
            th_b = b_i * 2 * math.pi / 8
            bmesh_box(bm_dyno, (0.28, 0.04, 0.08), (fx + 0.22 * math.cos(th_b), -12.4, 1.6 + 0.22 * math.sin(th_b)))
    # 8 Common rail high-pressure injection pipes
    for p_i in range(8):
        bmesh_tube(bm_dyno, 0.035, 0.025, 0.85, (-3.0, -15.4 + p_i * 0.35, 2.65), segments=12)
    # Dyno driveshaft safety containment cages (twin slotted steel cages around high-speed shafts)
    for sc_x in [-5.8, -0.2]:
        bmesh_tube(bm_dyno, 0.35, 0.30, 1.6, (sc_x, -14.25, 1.4), segments=20, rot_y=math.radians(90.0))
        for cut_i in range(6):
            th_c = cut_i * 2 * math.pi / 6
            bmesh_box(bm_dyno, (1.2, 0.06, 0.06), (sc_x, -14.25 + 0.32 * math.cos(th_c), 1.4 + 0.32 * math.sin(th_c)))
    create_mesh_object("GEO_Commercial_Powertrain_Dynos", bm_dyno, mat_coral_structural_beam(), root)

    # 4. Rooftop Industrial Evaporative Cooling Tower Bank (3 Cylindrical Towers atop Dyno Cell)
    bm_towers = bmesh.new()
    for cx in [-8.5, -3.0, 2.5]:
        # Cylindrical cooling tower body
        bmesh_cylinder(bm_towers, 1.6, 2.8, (cx, -14.25, 13.8), segments=24)
        # Top aerodynamic fan cowl shroud
        bmesh_tube(bm_towers, 1.8, 1.4, 0.6, (cx, -14.25, 15.4), segments=24)
        # 4 Axial fan blades
        for fb_i in range(4):
            f_rad = fb_i * math.pi / 2
            bmesh_box(bm_towers, (1.2, 0.25, 0.05), (cx + 0.6 * math.cos(f_rad), -14.25 + 0.6 * math.sin(f_rad), 15.3))
        # Structural steel support legs
        for leg_a in [math.pi/4, 3*math.pi/4, 5*math.pi/4, 7*math.pi/4]:
            lx_t = cx + 1.4 * math.cos(leg_a)
            ly_t = -14.25 + 1.4 * math.sin(leg_a)
            bmesh_box(bm_towers, (0.15, 0.15, 1.4), (lx_t, ly_t, 12.8))
        # Internal mist eliminator baffle louvers
        for lv_i in range(5):
            bmesh_tube(bm_towers, 1.55, 1.45, 0.08, (cx, -14.25, 13.0 + lv_i * 0.35), segments=20)
    # Connecting coolant header pipes
    bmesh_cylinder(bm_towers, 0.18, 13.0, (-3.0, -12.4, 13.2), segments=18, rot_y=math.radians(90.0))
    # 4 Industrial Coolant Recirculation Pumps with Electric Motors
    for p_i in range(4):
        px_i = -7.5 + p_i * 3.5
        bmesh_cylinder(bm_towers, 0.28, 0.65, (px_i, -12.4, 12.6), segments=16, rot_x=math.radians(90.0))
        bmesh_cylinder(bm_towers, 0.18, 0.55, (px_i, -12.4, 13.1), segments=14)
    # Overhung Engine Monorail Hoist Beam & Chain Fall over Test Bed
    bmesh_ibeam(bm_towers, 12.0, 0.45, 0.35, 0.03, 0.02, (-3.0, -14.25, 5.2), axis='Y')
    bmesh_cylinder(bm_towers, 0.15, 0.8, (-3.0, -14.25, 4.8), segments=16) # Hoist motor
    bmesh_tube(bm_towers, 0.22, 0.14, 0.08, (-3.0, -14.25, 4.3), segments=16) # Forged hoist hook
    create_mesh_object("GEO_Commercial_Cooling_Towers", bm_towers, mat_corrugated_industrial_steel(), root)

def build_commercial_l4(export_path: str):
    """Level 4: Megawatt Commercial Powertrain Test Cell."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_09_COMMERCIAL_HQ_L4", None)
    bpy.context.collection.objects.link(root)
    add_base_commercial_l1(root)
    add_commercial_l2_geometry(root)
    add_commercial_l3_geometry(root)
    add_commercial_l4_geometry(root)
    
    extras = {
        "unit_id": "COMMERCIAL_VEHICLES_HQ",
        "unit_key": "UNIT_09",
        "level": 4,
        "tier": "advanced_hq",
        "building_name": "Commercial Vehicles HQ (Megawatt Powertrain Test Cell)",
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

def add_commercial_l5_geometry(root):
    """Level 5: Heavy EV Megawatt Charging Yard & Automated Battery Swap Station (2005-2010)."""
    # 1. Automated Battery Swap Gantry Building (East Wing Expansion: X = 12.0m, Y = 8.0m)
    bm_swap = bmesh.new()
    bmesh_box(bm_swap, (9.0, 10.5, 9.2), (12.0, 8.0, 4.6))
    bmesh_box(bm_swap, (9.5, 11.0, 0.45), (12.0, 8.0, 9.35))
    # Roll-up vehicle drive-through portals (North & South faces)
    for sy_p in [2.7, 13.3]:
        bmesh_box(bm_swap, (4.8, 0.25, 5.2), (12.0, sy_p, 2.6))
    create_mesh_object("GEO_Commercial_Battery_Swap_Shell", bm_swap, mat_travertine_concrete(), root, 0.05)

    # 2. Robotic Scissor-Lift Tray Handler & Conveyor Track System
    bm_mech = bmesh.new()
    # In-ground swap pit
    bmesh_box(bm_mech, (6.5, 8.0, 0.4), (12.0, 8.0, 0.2))
    # Scissor lift mechanism (X-linkage arms)
    for sx in [10.5, 13.5]:
        bmesh_cylinder(bm_mech, 0.09, 3.4, (sx, 8.0, 1.4), segments=16, rot_x=math.radians(35.0))
        bmesh_cylinder(bm_mech, 0.09, 3.4, (sx, 8.0, 1.4), segments=16, rot_x=math.radians(-35.0))
        # Hydraulic lift cylinder
        bmesh_cylinder(bm_mech, 0.16, 2.2, (sx, 8.0, 1.4), segments=16, rot_x=math.radians(20.0))
    # High-voltage battery pack payload on lift tray
    bmesh_box(bm_mech, (2.6, 5.2, 0.35), (12.0, 8.0, 2.4))
    # Orange high-voltage safety conduits & quick disconnect couplers
    for hy in [6.5, 8.0, 9.5]:
        bmesh_cylinder(bm_mech, 0.06, 1.2, (13.6, hy, 2.4), segments=12, rot_y=math.radians(90.0))
    # Roller conveyor staging lanes (16 rollers)
    for r_i in range(16):
        ry_c = 4.5 + r_i * 0.45
        bmesh_cylinder(bm_mech, 0.06, 2.8, (12.0, ry_c, 0.35), segments=14, rot_y=math.radians(90.0))
    create_mesh_object("GEO_Commercial_Battery_Swap_Robotics", bm_mech, mat_safety_yellow(), root)

    # 3. High-Voltage Battery Storage Racks (16 Commercial EV Battery Packs in Vertical Stacks)
    bm_racks = bmesh.new()
    for ry in [4.5, 6.5, 8.5, 10.5]:
        for rz in [1.5, 3.2, 5.0, 6.8]:
            # Rack frame shelf
            bmesh_box(bm_racks, (2.8, 1.4, 0.08), (15.5, ry, rz - 0.2))
            # Battery module pack
            bmesh_box(bm_racks, (2.4, 1.1, 0.32), (15.5, ry, rz))
            # Orange warning light diode & heat sink ribs
            bmesh_cylinder(bm_racks, 0.035, 0.06, (14.2, ry, rz), segments=10, rot_y=math.radians(90.0))
            bmesh_box(bm_racks, (0.05, 0.9, 0.18), (14.22, ry, rz))
    create_mesh_object("GEO_Commercial_Battery_Storage_Racks", bm_racks, mat_high_voltage_orange(), root)

    # 4. Megawatt Charging System (MCS) Yard & Overhead Pantograph Gantry
    bm_chargers = bmesh.new()
    # 4 Megawatt fast-charging dispenser pillars on concrete islands
    for cy_i in [-4.0, 0.0, 4.0, 8.0]:
        # Raised concrete curb island
        bmesh_box(bm_chargers, (1.8, 1.2, 0.25), (16.8, cy_i, 0.125))
        # MCS dispenser terminal
        bmesh_box(bm_chargers, (1.0, 0.7, 2.6), (16.8, cy_i, 1.4))
        # Digital billing/status screen
        bmesh_box(bm_chargers, (0.05, 0.45, 0.35), (16.28, cy_i, 1.8))
        # Heavy liquid-cooled high-voltage cable bundle
        bmesh_cylinder(bm_chargers, 0.07, 2.2, (16.8, cy_i + 0.4, 1.2), segments=14)
        # Charging coupler holster nozzle
        bmesh_box(bm_chargers, (0.15, 0.25, 0.35), (16.28, cy_i + 0.4, 1.4))
    # Dual overhead articulated pantograph arms on steel gantry frames
    bmesh_box(bm_chargers, (0.35, 14.0, 0.35), (16.8, 2.0, 6.2))
    for py in [-1.0, 5.0]:
        bmesh_box(bm_chargers, (3.2, 0.2, 0.2), (15.2, py, 6.4))
        # Diamond linkage arms
        bmesh_cylinder(bm_chargers, 0.05, 1.8, (14.4, py, 6.0), segments=10, rot_y=math.radians(35.0))
        bmesh_cylinder(bm_chargers, 0.05, 1.8, (14.4, py, 6.0), segments=10, rot_y=math.radians(-35.0))
        # Inverted charging contact shoes
        bmesh_box(bm_chargers, (1.8, 0.4, 0.12), (13.6, py, 5.4))
    create_mesh_object("GEO_Commercial_Megawatt_Charging_Gantry", bm_chargers, mat_construction_orange(), root)

    # 5. Heavy Electric Commercial Bus on Apron
    bm_ebus = bmesh.new()
    # Bus aerodynamic monocoque body (12m transit bus)
    bmesh_box(bm_ebus, (2.55, 11.5, 3.2), (2.5, 1.0, 2.1))
    # Roof battery pack fairings
    bmesh_box(bm_ebus, (2.3, 8.5, 0.45), (2.5, 1.0, 3.85))
    # Bus panoramic passenger glazing
    bmesh_box(bm_ebus, (2.6, 9.8, 1.2), (2.5, 1.0, 2.4))
    # 4 Commercial bus wheels
    for b_wx in [1.35, 3.65]:
        bmesh_truck_wheel(bm_ebus, 0.52, 0.32, (b_wx, 4.2, 0.52), dual=False)
        bmesh_truck_wheel(bm_ebus, 0.52, 0.32, (b_wx, -2.8, 0.52), dual=True)
    create_mesh_object("GEO_Commercial_Electric_Transit_Bus", bm_ebus, mat_pearl_concept_car_paint(), root)

    # 6. Under-Chassis Roller Brake Tester & Heavy Chassis Dyno Rolls on Inspection Lane
    bm_brake_test = bmesh.new()
    bmesh_box(bm_brake_test, (3.8, 12.0, 0.45), (-8.5, -1.5, 0.22))
    # 4 Heavy serrated roller pairs for commercial axle braking testing
    for br_y in [-5.5, -4.0, 0.0, 3.5]:
        bmesh_cylinder(bm_brake_test, 0.24, 1.4, (-9.3, br_y, 0.25), segments=20, rot_y=math.radians(90.0))
        bmesh_cylinder(bm_brake_test, 0.24, 1.4, (-7.7, br_y, 0.25), segments=20, rot_y=math.radians(90.0))
        # Roller drive gearboxes
        bmesh_box(bm_brake_test, (0.35, 0.45, 0.45), (-10.15, br_y, 0.25))
    # Battery Pack Lifting Spreader Bar with 4 Pneumatic Twist-Locks
    bmesh_box(bm_brake_test, (2.8, 5.4, 0.25), (12.0, 8.0, 3.4))
    for t_x in [10.8, 13.2]:
        for t_y in [5.6, 10.4]:
            bmesh_cylinder(bm_brake_test, 0.12, 0.35, (t_x, t_y, 3.15), segments=16)
            bmesh_box(bm_brake_test, (0.22, 0.22, 0.15), (t_x, t_y, 2.9))
    # 8 Heavy charging cable retractor towers with counterweights
    for rw_i in range(8):
        rw_y = -6.0 + rw_i * 2.2
        bmesh_cylinder(bm_brake_test, 0.08, 3.2, (17.5, rw_y, 1.6), segments=12)
        bmesh_cylinder(bm_brake_test, 0.22, 0.18, (17.5, rw_y, 3.0), segments=16, rot_y=math.radians(90.0)) # Spring reel
    # 16 High-Voltage Perimeter Safety Barrier Stanchions around Swap Pit
    for st_i in range(16):
        st_x = 7.5 if st_i < 8 else 16.5
        st_y = 2.5 + (st_i % 8) * 1.5
        bmesh_cylinder(bm_brake_test, 0.05, 1.1, (st_x, st_y, 0.55), segments=12)
        bmesh_cylinder(bm_brake_test, 0.12, 0.06, (st_x, st_y, 0.03), segments=14) # Base plate
        bmesh_cylinder(bm_brake_test, 0.08, 0.08, (st_x, st_y, 1.05), segments=12) # Cap ring
    # 4 Commercial Rubber Wheel Chocks
    for chk_y in [-6.2, -3.2, 0.8, 4.2]:
        bmesh_pyramid(bm_brake_test, (0.45, 0.35), 0.28, (-6.8, chk_y, 0.14), rot_z=math.radians(90.0))
    # 4 Laser Wheel Alignment Optical Measurement Towers on Bay Approach
    for t_i, t_y in enumerate([-4.5, -1.5, 1.5, 4.5]):
        bmesh_cylinder(bm_brake_test, 0.12, 1.6, (-6.2, t_y, 0.8), segments=16)
        bmesh_box(bm_brake_test, (0.35, 0.25, 0.25), (-6.2, t_y, 1.6))
    create_mesh_object("GEO_Commercial_Brake_Tester_And_Spreader", bm_brake_test, mat_cast_iron_dark(), root)

    # 7. Semantic Hitbox
    bm_swap_hb = bmesh.new()
    bmesh_box(bm_swap_hb, (11.0, 12.0, 10.0), (12.0, 8.0, 5.0))
    create_mesh_object("HITBOX_COMMERCIAL_SWAP", bm_swap_hb, None, root)

def build_commercial_l5(export_path: str):
    """Level 5: Heavy EV Megawatt Charging Yard & Automated Battery Swap."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_09_COMMERCIAL_HQ_L5", None)
    bpy.context.collection.objects.link(root)
    add_base_commercial_l1(root)
    add_commercial_l2_geometry(root)
    add_commercial_l3_geometry(root)
    add_commercial_l4_geometry(root)
    add_commercial_l5_geometry(root)
    
    extras = {
        "unit_id": "COMMERCIAL_VEHICLES_HQ",
        "unit_key": "UNIT_09",
        "level": 5,
        "tier": "world_class_hq",
        "building_name": "Commercial Vehicles HQ (Megawatt Charging & Battery Swap)",
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

def add_commercial_l6_geometry(root):
    """Level 6: Autonomous Commercial Fleet Logistics Hub & Solar Canopy (2015-2020)."""
    # 1. Elevated Panoramic Fleet Dispatch Bridge (Spanning between High-Bay & Office: Z = 11.5m)
    bm_bridge = bmesh.new()
    bmesh_box(bm_bridge, (16.5, 6.5, 3.8), (3.0, 0.0, 11.6))
    # Aerodynamic overhang roof trim
    bmesh_box(bm_bridge, (17.2, 7.2, 0.4), (3.0, 0.0, 13.6))
    create_mesh_object("GEO_Commercial_Logistics_Bridge_Shell", bm_bridge, mat_travertine_concrete(), root, 0.05)

    # 2. Bridge Floor-to-Ceiling Curtain Glass & Sun Louvers
    bm_bglass = bmesh.new()
    bmesh_box(bm_bglass, (16.2, 6.2, 2.8), (3.0, 0.0, 11.6))
    create_mesh_object("GEO_Commercial_Logistics_Bridge_Glass", bm_bglass, mat_modern_curtain_glass(), root)

    # Aluminum sun louver fins
    bm_fins = bmesh.new()
    for l_i in range(-8, 9):
        bmesh_box(bm_fins, (0.08, 6.8, 0.45), (3.0 + l_i * 0.95, 0.0, 13.1))
    create_mesh_object("GEO_Commercial_Bridge_Sun_Fins", bm_fins, mat_brushed_aluminum(), root)

    # 3. Bridge Interior Dispatcher Consoles & Server Cabinets (Visible through Glass)
    bm_desk = bmesh.new()
    for d_i in range(-3, 4):
        # Curved dispatcher desk
        bmesh_box(bm_desk, (1.6, 0.8, 0.75), (3.0 + d_i * 2.1, 0.0, 10.4))
        # Dual curved LED monitors
        bmesh_box(bm_desk, (0.7, 0.08, 0.4), (3.0 + d_i * 2.1 - 0.38, 0.25, 11.0))
        bmesh_box(bm_desk, (0.7, 0.08, 0.4), (3.0 + d_i * 2.1 + 0.38, 0.25, 11.0))
        # Ergonomic task chair
        bmesh_cylinder(bm_desk, 0.28, 0.1, (3.0 + d_i * 2.1, -0.4, 10.2), segments=12)
        bmesh_box(bm_desk, (0.45, 0.1, 0.55), (3.0 + d_i * 2.1, -0.55, 10.6))
    # 4 Tall 42U Data Server Cabinets
    for sc_i in range(4):
        bmesh_box(bm_desk, (0.8, 0.8, 2.2), (-3.5 + sc_i * 0.95, 2.4, 11.1))
        # Status LED indicator row
        bmesh_cylinder(bm_desk, 0.02, 0.05, (-3.5 + sc_i * 0.95, 2.0, 11.6), segments=8, rot_x=math.radians(90.0))
    create_mesh_object("GEO_Commercial_Dispatch_Consoles", bm_desk, mat_brushed_aluminum(), root)

    # 4. Rooftop Photovoltaic Solar Canopy Array (24m x 18m steel purlin grid with 48 PV panels)
    bm_solar = bmesh.new()
    bmesh_box(bm_solar, (22.5, 16.5, 0.28), (-3.0, -2.0, 11.2))
    # 48 Solar panel modules with blue anti-reflective glass cells
    for px_i in range(-5, 6):
        for py_i in range(-3, 4):
            bmesh_box(bm_solar, (1.8, 2.1, 0.04), (-3.0 + px_i * 2.0, -2.0 + py_i * 2.3, 11.38))
            # Panel aluminum border frame
            bmesh_tube(bm_solar, 1.1, 1.0, 0.06, (-3.0 + px_i * 2.0, -2.0 + py_i * 2.3, 11.4), segments=16)
    # Supporting steel column legs for canopy
    for sc_x in [-11.0, -3.0, 5.0]:
        for sc_y in [-8.0, 4.0]:
            bmesh_cylinder(bm_solar, 0.15, 1.4, (sc_x, sc_y, 10.5), segments=14)
    create_mesh_object("GEO_Commercial_Photovoltaic_Solar_Canopy", bm_solar, mat_modern_curtain_glass(), root)

    # 5. Autonomous Electric Yard Tug Mules (2 Robotic Shunting Tugs on Apron)
    bm_tugs = bmesh.new()
    for tug_i, t_pos in enumerate([(8.5, -6.0), (8.5, 2.0)]):
        # Heavy low chassis tub
        bmesh_box(bm_tugs, (2.4, 4.2, 0.8), (t_pos[0], t_pos[1], 0.7))
        # Top elevating fifth wheel plate
        bmesh_cylinder(bm_tugs, 0.55, 0.18, (t_pos[0], t_pos[1] - 0.8, 1.2), segments=20)
        # Lidar sensor puck on mast
        bmesh_cylinder(bm_tugs, 0.08, 0.6, (t_pos[0], t_pos[1] + 1.4, 1.4), segments=14)
        bmesh_cylinder(bm_tugs, 0.16, 0.14, (t_pos[0], t_pos[1] + 1.4, 1.75), segments=18)
        # Solid commercial rubber wheels
        for wx in [-1.15, 1.15]:
            for wy in [-1.2, 1.2]:
                bmesh_cylinder(bm_tugs, 0.45, 0.28, (t_pos[0] + wx, t_pos[1] + wy, 0.45), segments=18, rot_y=math.radians(90.0))
    # 3 Vertical-Axis Micro Wind Turbines on Roof Parapet
    for wt_i, wt_x in enumerate([-12.5, -3.0, 6.5]):
        bmesh_cylinder(bm_tugs, 0.08, 2.4, (wt_x, 7.8, 11.5), segments=12) # Mast
        bmesh_cylinder(bm_tugs, 0.45, 1.6, (wt_x, 7.8, 12.8), segments=16) # Rotor barrel
        # Curved aerodynamic turbine scoop vanes
        for v_i in range(3):
            v_rad = v_i * 2 * math.pi / 3
            bmesh_tube(bm_tugs, 0.52, 0.42, 1.4, (wt_x + 0.1 * math.cos(v_rad), 7.8 + 0.1 * math.sin(v_rad), 12.8), segments=12)
    # Perimeter CCTV & High-Output Floodlight Masts (6 perimeter floodlight towers)
    for fl_i, (fl_x, fl_y) in enumerate([(-17.0, -17.0), (17.0, -17.0), (17.0, 17.0), (-17.0, 17.0), (-17.0, 0.0), (17.0, 0.0)]):
        bmesh_cylinder(bm_tugs, 0.10, 6.5, (fl_x, fl_y, 3.25), segments=12)
        bmesh_box(bm_tugs, (0.65, 0.45, 0.35), (fl_x, fl_y, 6.6)) # Quad LED floodlight head
    create_mesh_object("GEO_Commercial_Autonomous_Yard_Tugs", bm_tugs, mat_safety_yellow(), root)

    # 6. Satellite Telematics Communication Dome Array
    bm_sat = bmesh.new()
    for sx, sy in [(12.0, -8.0), (14.5, -8.0)]:
        bmesh_cylinder(bm_sat, 0.65, 0.8, (sx, sy, 7.8), segments=20)
        bmesh_pyramid(bm_sat, (1.2, 1.2), 0.7, (sx, sy, 8.2))
        bmesh_cylinder(bm_sat, 0.04, 1.8, (sx, sy, 8.8), segments=8) # Rod antenna
    create_mesh_object("GEO_Commercial_Fleet_Satcom_Domes", bm_sat, mat_brushed_aluminum(), root)

def build_commercial_l6(export_path: str):
    """Level 6: Autonomous Commercial Fleet Logistics Hub."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_09_COMMERCIAL_HQ_L6", None)
    bpy.context.collection.objects.link(root)
    add_base_commercial_l1(root)
    add_commercial_l2_geometry(root)
    add_commercial_l3_geometry(root)
    add_commercial_l4_geometry(root)
    add_commercial_l5_geometry(root)
    add_commercial_l6_geometry(root)
    
    extras = {
        "unit_id": "COMMERCIAL_VEHICLES_HQ",
        "unit_key": "UNIT_09",
        "level": 6,
        "tier": "innovation_campus",
        "building_name": "Commercial Vehicles HQ (Autonomous Fleet Logistics Hub)",
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

def add_commercial_l7_geometry(root):
    """Level 7: Zero-Emission Heavy Transport Hypermodern Innovation Center (2025+)."""
    # 1. Soaring Fleet Operations Tower (NE corner: X = 12.0m, Y = 12.0m, rising to 24.8m)
    bm_tower = bmesh.new()
    bmesh_box(bm_tower, (9.5, 9.5, 23.5), (12.0, 12.0, 12.0))
    # Cantilevered Aerodynamic Observation Wing atop Tower
    bmesh_box(bm_tower, (12.0, 12.0, 1.4), (12.0, 12.0, 24.2))
    # Tapered crown spire mast
    bmesh_cylinder(bm_tower, 0.18, 5.5, (12.0, 12.0, 27.5), segments=16)
    # Architectural exterior floor bands
    for f_z in [6.0, 11.5, 17.0, 22.5]:
        bmesh_box(bm_tower, (10.2, 10.2, 0.45), (12.0, 12.0, f_z))
    # 8 Heliostat Sun-Tracking Solar Concentrator Mirrors on Tower Terrace
    for h_i in range(8):
        th_h = h_i * 2 * math.pi / 8
        hx_m = 12.0 + 4.8 * math.cos(th_h)
        hy_m = 12.0 + 4.8 * math.sin(th_h)
        bmesh_cylinder(bm_tower, 0.06, 0.8, (hx_m, hy_m, 24.6), segments=10) # Pedestal
        bmesh_box(bm_tower, (1.2, 0.8, 0.05), (hx_m, hy_m, 25.1)) # Dual-axis mirror
    create_mesh_object("GEO_Commercial_Operations_Tower_Shell", bm_tower, mat_travertine_concrete(), root, 0.06)

    # 2. Tower High-Performance Curtain Glass & Vertical Fin Elements
    bm_tglass = bmesh.new()
    bmesh_box(bm_tglass, (9.2, 9.2, 18.0), (12.0, 12.0, 12.5))
    create_mesh_object("GEO_Commercial_Tower_Curtain_Glass", bm_tglass, mat_modern_curtain_glass(), root)

    bm_tfins = bmesh.new()
    for tf_i in range(-4, 5):
        bmesh_box(bm_tfins, (0.08, 0.45, 18.5), (12.0 + tf_i * 1.1, 16.75, 12.5))
        bmesh_box(bm_tfins, (0.08, 0.45, 18.5), (12.0 + tf_i * 1.1, 7.25, 12.5))
    create_mesh_object("GEO_Commercial_Tower_Mullion_Fins", bm_tfins, mat_brushed_aluminum(), root)

    # 3. Cryogenic Liquid Hydrogen (LH2) Vacuum-Insulated Storage Spheres & Dispenser
    bm_h2 = bmesh.new()
    # Twin spherical vacuum dewars (X = 12.0m, Y = -8.0m)
    for hx in [10.2, 14.8]:
        bmesh_cylinder(bm_h2, 1.6, 2.8, (hx, -8.0, 2.4), segments=24)
        bmesh_tube(bm_h2, 1.8, 1.5, 0.4, (hx, -8.0, 2.4), segments=24) # Equatorial ring
        # Equatorial reinforcement bands
        bmesh_tube(bm_h2, 1.7, 1.55, 0.15, (hx, -8.0, 1.5), segments=20)
        bmesh_tube(bm_h2, 1.7, 1.55, 0.15, (hx, -8.0, 3.3), segments=20)
        # Tripod support legs
        for leg_i in range(3):
            th = leg_i * 2 * math.pi / 3
            bmesh_cylinder(bm_h2, 0.12, 1.8, (hx + 1.4 * math.cos(th), -8.0 + 1.4 * math.sin(th), 0.9), segments=12)
    # Vacuum-jacketed cryo transfer piping with valve pods
    bmesh_cylinder(bm_h2, 0.14, 6.2, (12.5, -8.0, 4.2), segments=16, rot_y=math.radians(90.0))
    bmesh_cylinder(bm_h2, 0.14, 6.0, (12.5, -5.0, 4.2), segments=16, rot_x=math.radians(90.0))
    # Emergency boil-off vent stack
    bmesh_cylinder(bm_h2, 0.10, 6.8, (12.5, -2.0, 5.5), segments=14)
    bmesh_tube(bm_h2, 0.22, 0.12, 0.35, (12.5, -2.0, 9.0), segments=16) # Flame arrester cowl
    # 4 Autonomous Robotic Snake Charging Arm Pods in Yard
    for r_i in range(4):
        rx_c = 15.2
        ry_c = -3.0 + r_i * 3.5
        bmesh_cylinder(bm_h2, 0.18, 1.4, (rx_c, ry_c, 0.7), segments=16) # Base turret
        bmesh_cylinder(bm_h2, 0.08, 1.8, (rx_c - 0.4, ry_c, 1.6), segments=12, rot_y=math.radians(45.0)) # Articulated arm 1
        bmesh_cylinder(bm_h2, 0.06, 1.6, (rx_c - 1.2, ry_c, 2.2), segments=12, rot_y=math.radians(-30.0)) # Articulated arm 2
        bmesh_tube(bm_h2, 0.12, 0.08, 0.25, (rx_c - 1.8, ry_c, 2.0), segments=14) # Magnetic coupler head
    create_mesh_object("GEO_Commercial_Cryogenic_H2_Storage", bm_h2, mat_cryo_cyan_emissive(), root)

    # 4. Central Holographic Global Fleet Route Optimizer Pod
    bm_holo = bmesh.new()
    bmesh_cylinder(bm_holo, 2.8, 0.35, (-3.0, -2.0, 11.5), segments=24)
    bmesh_tube(bm_holo, 2.5, 2.2, 0.18, (-3.0, -2.0, 12.2), segments=24)
    bmesh_tube(bm_holo, 1.8, 1.5, 0.18, (-3.0, -2.0, 12.9), segments=24)
    bmesh_cylinder(bm_holo, 0.15, 2.4, (-3.0, -2.0, 13.8), segments=14) # Central hologram emitter beam
    # Orbiting planetary data nodes
    for p_i in range(8):
        th_p = p_i * 2 * math.pi / 8
        bmesh_cylinder(bm_holo, 0.12, 0.12, (-3.0 + 2.0 * math.cos(th_p), -2.0 + 2.0 * math.sin(th_p), 13.2), segments=10)
    create_mesh_object("GEO_Commercial_Holographic_Route_Pod", bm_holo, mat_holographic_cyan_glow(), root)

    # 5. Heavy Cargo Drone Delivery Port & Illuminated Approach Beacon
    bm_drone = bmesh.new()
    # Circular rooftop landing pad
    bmesh_cylinder(bm_drone, 3.6, 0.25, (-3.0, -2.0, 11.8), segments=24)
    bmesh_tube(bm_drone, 3.8, 3.5, 0.15, (-3.0, -2.0, 12.0), segments=24)
    # Perimeter guidance beacons (16 LED light pucks)
    for b_i in range(16):
        th_b = b_i * 2 * math.pi / 16
        bmesh_cylinder(bm_drone, 0.08, 0.15, (-3.0 + 3.4 * math.cos(th_b), -2.0 + 3.4 * math.sin(th_b), 12.1), segments=10)
    # Autonomous Electric Cargo Pod Container Cart
    bmesh_box(bm_drone, (2.2, 3.5, 1.8), (-3.0, -2.0, 13.0))
    create_mesh_object("GEO_Commercial_Drone_Cargo_Helipad", bm_drone, mat_safety_yellow(), root)

    # 6. Sculptural Aerodynamic Hydrogen-Electric Concept Hauler on Apron Plinth
    bm_concept = bmesh.new()
    bmesh_semi_truck(bm_concept, loc=(2.5, -1.5, 0.0), cab_tilted=False, on_lift=False)
    # Streamlined aerodynamic trailer attached to concept truck
    bmesh_box(bm_concept, (2.55, 10.5, 3.6), (2.5, -8.2, 2.6))
    # Full aerodynamic side skirts & rear boat-tail vortex flaps
    bmesh_box(bm_concept, (2.6, 8.5, 0.8), (2.5, -8.2, 1.0))
    bmesh_pyramid(bm_concept, (2.55, 0.8), 0.6, (2.5, -13.8, 2.6), rot_x=math.radians(90.0))
    create_mesh_object("GEO_Commercial_Concept_Hyper_Hauler", bm_concept, mat_pearl_concept_car_paint(), root)

    # 7. Semantic Hitbox
    bm_tower_hb = bmesh.new()
    bmesh_box(bm_tower_hb, (11.0, 11.0, 26.0), (12.0, 12.0, 13.0))
    create_mesh_object("HITBOX_COMMERCIAL_TOWER", bm_tower_hb, None, root)

def build_commercial_l7(export_path: str):
    """Level 7: Zero-Emission Heavy Transport Hypermodern Innovation Center."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_09_COMMERCIAL_HQ_L7", None)
    bpy.context.collection.objects.link(root)
    add_base_commercial_l1(root)
    add_commercial_l2_geometry(root)
    add_commercial_l3_geometry(root)
    add_commercial_l4_geometry(root)
    add_commercial_l5_geometry(root)
    add_commercial_l6_geometry(root)
    add_commercial_l7_geometry(root)
    
    extras = {
        "unit_id": "COMMERCIAL_VEHICLES_HQ",
        "unit_key": "UNIT_09",
        "level": 7,
        "tier": "hypermodern_campus",
        "building_name": "Commercial Vehicles HQ (Zero-Emission Heavy Transport Center)",
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── BATCH GENERATION ORCHESTRATOR ──

def generate_all_commercial_levels(output_dir: str = None):
    if output_dir is None:
        output_dir = os.path.join(workspace_root, "public", "models", "campus")
    os.makedirs(output_dir, exist_ok=True)
    
    levels = [
        (0, "hq_09_commercial_l0.glb", build_commercial_l0),
        (1, "hq_09_commercial_l1.glb", build_commercial_l1),
        (2, "hq_09_commercial_l2.glb", build_commercial_l2),
        (3, "hq_09_commercial_l3.glb", build_commercial_l3),
        (4, "hq_09_commercial_l4.glb", build_commercial_l4),
        (5, "hq_09_commercial_l5.glb", build_commercial_l5),
        (6, "hq_09_commercial_l6.glb", build_commercial_l6),
        (7, "hq_09_commercial_l7.glb", build_commercial_l7),
    ]
    
    results = {}
    print("=" * 70)
    print(" AUTO TYCOON CAMPUS - UNIT_09 COMMERCIAL VEHICLES HQ")
    print(f" Target Output Directory: {output_dir}")
    print("=" * 70)
    
    all_passed = True
    for lvl, filename, builder_func in levels:
        out_path = os.path.join(output_dir, filename)
        tier_name = CAMPUS_TRIANGLE_BUDGETS[lvl]["tier"]
        print(f"\n>>> Generating UNIT_09 Level {lvl} ({tier_name}) -> {filename}...")
        
        success = builder_func(out_path)
        passed, report = audit_scene("UNIT_09_COMMERCIAL", lvl, bpy)
        print_audit_summary(report)
        
        file_size = os.path.getsize(out_path) if os.path.exists(out_path) else 0
        tris = report["total_triangles"]
        print(f"    Export: {success} | Size: {file_size / 1024:.1f} KB | Triangles: {tris:,}")
        results[lvl] = {"file": filename, "passed": passed, "size_kb": file_size / 1024.0, "triangles": tris}
        if not passed:
            all_passed = False
            
    print("\n" + "=" * 70)
    print(" UNIT_09 COMMERCIAL VEHICLES HQ SUMMARY AUDIT TABLE")
    print("=" * 70)
    print(f"{'Level':<6} | {'Filename':<22} | {'Triangles':<10} | {'Size (KB)':<10} | {'Quality Gate'}")
    print("-" * 70)
    for lvl, data in results.items():
        status = "PASSED [OK]" if data["passed"] else "FAILED [X]"
        print(f"L{lvl:<5} | {data['file']:<22} | {data['triangles']:<10,} | {data['size_kb']:<10.1f} | {status}")
    print("=" * 70)
    
    return all_passed

if __name__ == "__main__":
    target_dir = os.path.join(workspace_root, "public", "models", "campus")
    if len(sys.argv) > 1 and not sys.argv[-1].endswith(".py"):
        target_dir = sys.argv[-1]
    
    generate_all_commercial_levels(target_dir)
