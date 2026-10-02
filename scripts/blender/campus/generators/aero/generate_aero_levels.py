"""
AUTO TYCOON CAMPUS HQ - UNIT_03 AERODYNAMICS HQ & WIND TUNNEL GENERATOR (PHASES 122-129)

Generates all 8 progression levels (L0-L7) for UNIT_03:
- Footprint: 36m x 36m (Master Plot)
- Architectural Identity: Göttingen closed-circuit aerodynamic wind tunnel complex —
  1970s closed-loop return ducting, axial fan drive nacelle, contraction bellmouth nozzle & test throat,
  scale car model on aerodynamic balance sting, observation control booth,
  rolling road boundary layer suction, laser PIV smoke flow visualization,
  full-scale 1:1 production vehicle test hall, HPC CFD supercomputer cluster,
  anechoic NVH wind noise chamber, and hypermodern quantum aerodynamic transonic spire.

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
    mat_cedar_wood_decking,
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

def bmesh_pyramid(bm, base_size: tuple, height: float, loc: tuple, rot_x=0.0, rot_y=0.0):
    lx, ly, lz = loc
    bx, by = base_size
    cos_rx, sin_rx = math.cos(rot_x), math.sin(rot_x)
    cos_ry, sin_ry = math.cos(rot_y), math.sin(rot_y)
    def transform(x, y, z):
        x1 = x * cos_ry + z * sin_ry
        z1 = -x * sin_ry + z * cos_ry
        y2 = y * cos_rx - z1 * sin_rx
        z2 = y * sin_rx + z1 * cos_rx
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

def bmesh_turning_vanes(bm, loc: tuple, radius: float, count=8, height=4.2):
    """Creates a curved aerodynamic turning vane cascade inside a 90-degree wind tunnel duct corner."""
    lx, ly, lz = loc
    for i in range(count):
        t = (i + 1) / (count + 1)
        r_vane = radius * (0.3 + 0.7 * t)
        # Curve segments
        steps = 10
        for s in range(steps):
            th1 = (s / steps) * (math.pi / 2)
            th2 = ((s + 1) / steps) * (math.pi / 2)
            x1 = lx + r_vane * math.cos(th1)
            y1 = ly + r_vane * math.sin(th1)
            x2 = lx + r_vane * math.cos(th2)
            y2 = ly + r_vane * math.sin(th2)
            bmesh_box(bm, (abs(x2 - x1) + 0.04, abs(y2 - y1) + 0.04, height), ((x1 + x2)/2, (y1 + y2)/2, lz))

def bmesh_honeycomb_screen(bm, loc: tuple, outer_r: float, depth=0.35, rings=3):
    """Creates a wind tunnel turbulence-reduction honeycomb flow straightener screen."""
    lx, ly, lz = loc
    bmesh_tube(bm, outer_r + 0.15, outer_r, depth, loc, segments=36, rot_x=math.radians(90.0))
    for r in range(1, rings + 1):
        rad = outer_r * (r / (rings + 1))
        bmesh_tube(bm, rad + 0.03, rad, depth, loc, segments=28, rot_x=math.radians(90.0))
    for ang in range(0, 180, 30):
        rad_ang = math.radians(ang)
        bmesh_box(bm, (2 * outer_r * math.cos(rad_ang), 0.03, 2 * outer_r * math.sin(rad_ang)), (lx, ly, lz))

def bmesh_scale_test_coupe(bm, loc: tuple, rot_z=0.0):
    """
    Creates an authentic 40% scale aerodynamic wind tunnel test model:
    - Low-drag streamlined sports coupe silhouette
    - Prominent front splitter with endplates
    - Active rear wing on swan-neck carbon pylons
    - Rear aerodynamic venturi diffuser with vertical strakes
    - Surface boundary layer pressure tap arrays
    """
    lx, ly, lz = loc
    cos_z, sin_z = math.cos(rot_z), math.sin(rot_z)
    
    # 1. Main streamlined chassis body
    bmesh_box(bm, (1.85, 4.2, 0.46), (lx, ly, lz + 0.4))
    bmesh_box(bm, (1.75, 4.3, 0.25), (lx, ly, lz + 0.25)) # Rocker tuck
    
    # 2. Long aerodynamic raked nose & hood
    bmesh_box(bm, (1.8, 1.6, 0.22), (lx, ly + 1.2, lz + 0.58))
    # Dual hood heat extraction vents
    bmesh_box(bm, (0.35, 0.55, 0.06), (lx - 0.45, ly + 1.1, lz + 0.7))
    bmesh_box(bm, (0.35, 0.55, 0.06), (lx + 0.45, ly + 1.1, lz + 0.7))
    
    # 3. Aerodynamic front splitter & side endplates
    bmesh_box(bm, (2.05, 0.45, 0.05), (lx, ly + 2.15, lz + 0.16))
    bmesh_box(bm, (0.05, 0.5, 0.22), (lx - 1.02, ly + 2.15, lz + 0.25))
    bmesh_box(bm, (0.05, 0.5, 0.22), (lx + 1.02, ly + 2.15, lz + 0.25))
    
    # 4. Raked cockpit greenhouse
    bmesh_box(bm, (1.45, 2.0, 0.48), (lx, ly - 0.2, lz + 0.86))
    bmesh_box(bm, (1.38, 0.12, 0.45), (lx, ly + 0.72, lz + 0.78)) # Windshield
    bmesh_box(bm, (1.32, 0.8, 0.35), (lx, ly - 1.2, lz + 0.75)) # Fastback
    
    # 5. Rear diffuser with 4 vertical aerodynamic fins
    bmesh_box(bm, (1.75, 0.8, 0.18), (lx, ly - 1.85, lz + 0.28))
    for fx in [-0.6, -0.2, 0.2, 0.6]:
        bmesh_box(bm, (0.04, 0.85, 0.22), (lx + fx, ly - 1.85, lz + 0.25))
        
    # 6. Swan-neck rear GT aerodynamic wing
    bmesh_box(bm, (1.9, 0.45, 0.06), (lx, ly - 2.05, lz + 1.18))
    for wx in [-0.55, 0.55]:
        bmesh_cylinder(bm, 0.03, 0.42, (lx + wx, ly - 1.95, lz + 0.98), segments=12, rot_x=math.radians(-20))
    # Wing endplates
    bmesh_box(bm, (0.04, 0.5, 0.26), (lx - 0.95, ly - 2.05, lz + 1.18))
    bmesh_box(bm, (0.04, 0.5, 0.26), (lx + 0.95, ly - 2.05, lz + 1.18))
    
    # 7. Aerodynamic solid-face turbine wheels
    for wx in [-0.94, 0.94]:
        for wy in [ly - 1.3, ly + 1.3]:
            bmesh_cylinder(bm, 0.34, 0.24, (lx + wx, wy, lz + 0.34), segments=24, rot_y=math.radians(90.0))
            bmesh_tube(bm, 0.32, 0.25, 0.08, (lx + wx, wy, lz + 0.34), segments=20)

def bmesh_fullscale_supercar(bm, loc: tuple, rot_z=0.0):
    """Creates a high-density 1:1 full-scale hypercar prototype for high-bay test hall."""
    lx, ly, lz = loc
    # Lower monocoque body
    bmesh_box(bm, (2.12, 4.75, 0.52), (lx, ly, lz + 0.45))
    bmesh_box(bm, (1.95, 4.85, 0.28), (lx, ly, lz + 0.24)) # Venturi floor
    # Front splitter with winglets
    bmesh_box(bm, (2.35, 0.6, 0.06), (lx, ly + 2.45, lz + 0.16))
    bmesh_box(bm, (0.06, 0.65, 0.32), (lx - 1.17, ly + 2.45, lz + 0.28))
    bmesh_box(bm, (0.06, 0.65, 0.32), (lx + 1.17, ly + 2.45, lz + 0.28))
    # Canopy greenhouse
    bmesh_box(bm, (1.55, 2.3, 0.54), (lx, ly - 0.25, lz + 0.98))
    bmesh_box(bm, (1.45, 0.15, 0.5), (lx, ly + 0.85, lz + 0.88)) # Windshield
    # Roof air intake scoop
    bmesh_box(bm, (0.45, 0.8, 0.18), (lx, ly - 0.4, lz + 1.32))
    # Deep side radiator sidepods & bargeboards
    for bx in [-1.08, 1.08]:
        bmesh_box(bm, (0.28, 1.8, 0.48), (lx + bx, ly + 0.2, lz + 0.5))
        bmesh_box(bm, (0.05, 0.9, 0.42), (lx + bx * 1.1, ly + 1.2, lz + 0.42))
    # Dual-element active rear wing
    bmesh_box(bm, (2.2, 0.5, 0.07), (lx, ly - 2.35, lz + 1.35))
    bmesh_box(bm, (2.15, 0.28, 0.05), (lx, ly - 2.2, lz + 1.48)) # Flap
    for sx in [-0.65, 0.65]:
        bmesh_cylinder(bm, 0.035, 0.55, (lx + sx, ly - 2.2, lz + 1.08), segments=14, rot_x=math.radians(-25))
    # High-downforce rear diffuser tunnels
    bmesh_box(bm, (2.05, 1.1, 0.25), (lx, ly - 2.0, lz + 0.28))
    for dfx in [-0.8, -0.4, 0.0, 0.4, 0.8]:
        bmesh_box(bm, (0.05, 1.15, 0.32), (lx + dfx, ly - 2.0, lz + 0.25))
    # 4 Large multi-spoke wheels with drilled carbon ceramic brake rotors
    for wx in [-1.05, 1.05]:
        for wy in [ly - 1.45, ly + 1.45]:
            bmesh_cylinder(bm, 0.38, 0.28, (lx + wx, wy, lz + 0.38), segments=28, rot_y=math.radians(90.0))
            bmesh_tube(bm, 0.35, 0.28, 0.12, (lx + wx, wy, lz + 0.38), segments=24)
            bmesh_cylinder(bm, 0.22, 0.04, (lx + wx, wy, lz + 0.38), segments=18, rot_y=math.radians(90.0))

def bmesh_aerodynamic_drone(bm, loc: tuple, rot_z=0.0):
    """Creates an aerodynamic multi-rotor boundary layer survey drone with anemometer mast."""
    lx, ly, lz = loc
    # Central fuselage pod
    bmesh_cylinder(bm, 0.35, 0.18, (lx, ly, lz + 0.35), segments=20)
    bmesh_cylinder(bm, 0.08, 0.45, (lx, ly, lz + 0.65), segments=14) # Top sensor mast / anemometer
    # 4 Carbon boom arms & motor pods
    for ang in [45, 135, 225, 315]:
        rad = math.radians(ang + math.degrees(rot_z))
        bx = lx + 0.75 * math.cos(rad)
        by = ly + 0.75 * math.sin(rad)
        bmesh_box(bm, (0.04, 0.75, 0.03), ((lx + bx)/2, (ly + by)/2, lz + 0.35))
        bmesh_cylinder(bm, 0.1, 0.12, (bx, by, lz + 0.38), segments=16) # Motor bell
        # Twin rotor blades
        bmesh_box(bm, (0.55 * math.cos(rad + 0.8), 0.55 * math.sin(rad + 0.8), 0.015), (bx, by, lz + 0.45))
    # Landing skids
    for sk in [-0.25, 0.25]:
        bmesh_cylinder(bm, 0.02, 0.7, (lx + sk, ly, lz + 0.08), segments=10, rot_x=math.radians(90.0))
        bmesh_cylinder(bm, 0.015, 0.25, (lx + sk, ly + 0.2, lz + 0.2), segments=8, rot_x=math.radians(20.0))
        bmesh_cylinder(bm, 0.015, 0.25, (lx + sk, ly - 0.2, lz + 0.2), segments=8, rot_x=math.radians(-20.0))

# =========================================================================
# LEVEL BUILDERS (L0 - L7)
# =========================================================================

def build_aero_l0(export_path: str):
    """Level 0: Empty Plot (Surveyed Wind Tunnel & Aerodynamics Land)."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_03_AERO_HQ_L0", None)
    bpy.context.collection.objects.link(root)

    # 1. Base excavation pad
    bm_pad = bmesh.new()
    bmesh_box(bm_pad, (36.0, 36.0, 0.3), (0.0, 0.0, -0.15))
    create_mesh_object("GEO_Aero_Plot_Excavation_Pad", bm_pad, mat_travertine_concrete(), parent=root)

    # 2. Wind tunnel test throat and closed-circuit duct foundation trenches
    bm_trench = bmesh.new()
    # Test section central pit
    bmesh_box(bm_trench, (11.0, 15.0, 0.25), (-3.5, 0.0, 0.125))
    # Return duct trenches
    bmesh_box(bm_trench, (3.5, 27.0, 0.25), (-12.5, 0.0, 0.125))
    bmesh_box(bm_trench, (10.0, 3.5, 0.25), (-8.0, 11.5, 0.125))
    bmesh_box(bm_trench, (10.0, 3.5, 0.25), (-8.0, -11.5, 0.125))
    create_mesh_object("GEO_Aero_Foundation_Trench_Curbs", bm_trench, mat_travertine_concrete(), parent=root)

    # 3. Steel survey boundary pylons with reflector lenses
    bm_pylons = bmesh.new()
    corners = [(-17.0, -17.0), (17.0, -17.0), (17.0, 17.0), (-17.0, 17.0)]
    for cx, cy in corners:
        bmesh_cylinder(bm_pylons, 0.25, 2.2, (cx, cy, 1.1), segments=24)
        bmesh_box(bm_pylons, (0.8, 0.8, 0.3), (cx, cy, 0.15))
        bmesh_cylinder(bm_pylons, 0.15, 0.12, (cx, cy, 2.25), segments=20)
    create_mesh_object("GEO_Aero_Survey_Boundary_Pylons", bm_pylons, mat_safety_yellow(), parent=root)

    # 4. Surveyor theodolite & tripod workstation
    bm_tripod = bmesh.new()
    tx, ty = 6.0, 4.0
    for ang in [0, 120, 240]:
        rad = math.radians(ang)
        lx, ly = tx + 0.6 * math.cos(rad), ty + 0.6 * math.sin(rad)
        bmesh_cylinder(bm_tripod, 0.05, 1.5, ((tx + lx)/2, (ty + ly)/2, 0.75), segments=16)
    bmesh_cylinder(bm_tripod, 0.18, 0.35, (tx, ty, 1.5), segments=24)
    bmesh_cylinder(bm_tripod, 0.09, 0.45, (tx, ty, 1.7), segments=24, rot_y=math.radians(90))
    # Safety saw-horse barriers
    for sh_x in [3.0, 9.0]:
        bmesh_box(bm_tripod, (2.2, 0.12, 0.18), (sh_x, 14.0, 0.85))
        bmesh_cylinder(bm_tripod, 0.04, 0.95, (sh_x - 0.9, 14.0, 0.45), segments=12, rot_x=math.radians(20))
        bmesh_cylinder(bm_tripod, 0.04, 0.95, (sh_x + 0.9, 14.0, 0.45), segments=12, rot_x=math.radians(-20))
    create_mesh_object("GEO_Aero_Surveyor_Theodolite", bm_tripod, mat_brushed_aluminum(), parent=root)

    # 5. Project Billboard: UNIT_03 AERODYNAMICS HQ & CLOSED-CIRCUIT WIND TUNNEL
    bm_board = bmesh.new()
    bx, by = 0.0, 16.0
    bmesh_box(bm_board, (0.2, 0.2, 3.2), (bx - 3.2, by, 1.6))
    bmesh_box(bm_board, (0.2, 0.2, 3.2), (bx + 3.2, by, 1.6))
    bmesh_box(bm_board, (6.8, 0.15, 2.0), (bx, by, 2.4))
    bmesh_box(bm_board, (7.0, 0.2, 0.1), (bx, by, 3.45))
    create_mesh_object("GEO_Aero_Project_Billboard", bm_board, mat_dark_slate_roof(), parent=root)

    # 6. Semantic Hitbox (wireframe & invisible)
    add_hitbox("HITBOX_AERO_PLOT", (36.0, 36.0, 3.5), (0.0, 0.0, 1.75), parent=root)

    extras = {
        "unit_id": "AERO_HQ",
        "unit_key": "UNIT_03",
        "level": 0,
        "tier": "empty_plot",
        "building_name": "Aerodynamics HQ (Surveyed Plot)",
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

def add_base_aero_l1_geometry(root):
    """
    Constructs the complete 1970s Göttingen Closed-Circuit Wind Tunnel & Control Lab (~11.0k tris):
    - Foundation Plinth & Service Basements (36m x 36m)
    - Closed-Circuit Return Circuit Ducting (Ø4.8m) with corner elbows & aerodynamic turning vane cascades
    - Massive 2,500 kW Axial Drive Fan nacelle with 12 twisted rotor/stator blades & bullet spinner nose
    - Parameterized Contraction Bellmouth Nozzle with honeycomb flow straightener screen
    - Transparent Acrylic Observation Test Throat with 40% scale GT Coupe on aerodynamic sting balance
    - 2-Story Lavender Brick Telemetry Control Booth with operator desks, multi-manometer tubes & patch panels
    - Coral Structural I-beam cradles, pipe bridges, and facility entrance pylon
    """
    # 1. Foundation Plinth
    bm_plinth = bmesh.new()
    bmesh_box(bm_plinth, (36.0, 36.0, 0.3), (0.0, 0.0, -0.15))
    create_mesh_object("GEO_Aero_Foundation_Plinth", bm_plinth, mat_travertine_concrete(), parent=root, bevel_width=0.04)

    # 2. Main Wind Tunnel Test Chamber Shell (Center-West: X = -3.5m, Y = 0.0m) - Hollow Room
    bm_chamber = bmesh.new()
    # Hollow chamber walls: North wall, South diffuser, West return wall, and roof
    bmesh_box(bm_chamber, (10.5, 0.6, 7.8), (-3.5, 7.2, 3.9)) # North wall
    bmesh_box(bm_chamber, (10.5, 0.6, 7.8), (-3.5, -7.2, 3.9)) # South wall
    bmesh_box(bm_chamber, (0.6, 14.0, 7.8), (-8.5, 0.0, 3.9)) # West wall
    bmesh_box(bm_chamber, (10.5, 15.0, 0.35), (-3.5, 0.0, 7.7)) # Roof slab
    bmesh_box(bm_chamber, (10.5, 15.0, 0.15), (-3.5, 0.0, 0.075)) # Floor slab
    # Contraction bellmouth nozzle housing (North: Y = 9.5m)
    bmesh_tube(bm_chamber, 4.2, 3.4, 3.6, (-3.5, 9.5, 4.2), segments=36, rot_x=math.radians(90.0))
    # Diffuser cone housing (South: Y = -9.5m)
    bmesh_tube(bm_chamber, 4.0, 3.2, 3.6, (-3.5, -9.5, 4.2), segments=36, rot_x=math.radians(90.0))
    create_mesh_object("GEO_Aero_Test_Chamber_Shell", bm_chamber, mat_travertine_concrete(), parent=root, bevel_width=0.04)

    # 3. Observation Acrylic Windows & Heavy Mullions (East side: X = 1.7m, looking from Control Booth)
    bm_glass = bmesh.new()
    bm_mull = bmesh.new()
    # Full length observation window pane (12m x 4.2m)
    bmesh_box(bm_glass, (0.12, 12.0, 4.2), (1.75, 0.0, 4.2))
    # Structural steel window mullions & crash rail
    for my in [-5.0, -2.5, 0.0, 2.5, 5.0]:
        bmesh_box(bm_mull, (0.28, 0.16, 4.5), (1.75, my, 4.2))
    bmesh_box(bm_mull, (0.28, 12.2, 0.16), (1.75, 0.0, 2.1)) # Sill
    bmesh_box(bm_mull, (0.28, 12.2, 0.16), (1.75, 0.0, 6.3)) # Header
    bmesh_box(bm_mull, (0.35, 12.2, 0.08), (1.55, 0.0, 3.2)) # Visitor safety rail
    create_mesh_object("GEO_Aero_Observation_Glass", bm_glass, mat_tinted_acrylic_window(), parent=root)
    create_mesh_object("GEO_Aero_Observation_Mullions", bm_mull, mat_dark_slate_roof(), parent=root)

    # 4. Closed-Circuit Return Air Duct (West flank: X = -12.8m) with Aerodynamic Turning Vanes
    bm_duct = bmesh.new()
    # Main longitudinal return duct tube (Ø4.8m x 25m)
    bmesh_tube(bm_duct, 2.4, 2.22, 24.0, (-12.8, 0.0, 4.5), segments=36, rot_x=math.radians(90.0))
    # Longitudinal stiffening flanges (4 rings)
    for ry in [-8.0, -2.5, 2.5, 8.0]:
        bmesh_tube(bm_duct, 2.55, 2.38, 0.18, (-12.8, ry, 4.5), segments=36, rot_x=math.radians(90.0))
    # North cross-duct elbow & corner
    bmesh_tube(bm_duct, 2.4, 2.22, 9.2, (-8.2, 11.8, 4.5), segments=36, rot_y=math.radians(90.0))
    # South cross-duct elbow & corner
    bmesh_tube(bm_duct, 2.4, 2.22, 9.2, (-8.2, -11.8, 4.5), segments=36, rot_y=math.radians(90.0))
    # Aerodynamic turning vane cascades in NW and SW elbows
    bmesh_turning_vanes(bm_duct, (-12.8, 11.8, 4.5), radius=2.2, count=6, height=4.2)
    bmesh_turning_vanes(bm_duct, (-12.8, -11.8, 4.5), radius=2.2, count=6, height=4.2)
    # Honeycomb flow straightener screen in North contraction entry
    bmesh_honeycomb_screen(bm_duct, (-3.5, 11.2, 4.2), outer_r=2.2, depth=0.4, rings=4)
    create_mesh_object("GEO_Aero_Closed_Circuit_Duct", bm_duct, mat_corrugated_industrial_steel(), parent=root)

    # 5. Giant Axial Fan Nacelle (Drive motor casing at south return turn: X = -12.8m, Y = -13.2m)
    bm_fan = bmesh.new()
    # Nacelle housing shroud (Ø5.2m)
    bmesh_tube(bm_fan, 2.6, 2.42, 4.8, (-12.8, -13.2, 4.5), segments=36, rot_x=math.radians(90.0))
    # Aerodynamic motor drive bullet hub & spinner cone
    bmesh_cylinder(bm_fan, 0.95, 3.2, (-12.8, -13.2, 4.5), segments=24, rot_x=math.radians(90.0))
    bmesh_cylinder(bm_fan, 0.95, 1.2, (-12.8, -11.0, 4.5), segments=24, rot_x=math.radians(90.0)) # Spinner nose
    # 12 Aerodynamically twisted fan blades
    for b in range(12):
        b_ang = b * 2 * math.pi / 12
        bx = -12.8 + 1.6 * math.cos(b_ang)
        bz = 4.5 + 1.6 * math.sin(b_ang)
        bmesh_box(bm_fan, (0.08, 0.42, 1.4), (bx, -13.2, bz))
    # Electric drive motor cooling fin casing
    bmesh_box(bm_fan, (2.8, 3.2, 2.2), (-12.8, -16.0, 2.2))
    create_mesh_object("GEO_Aero_Axial_Fan_Nacelle", bm_fan, mat_coral_structural_beam(), parent=root, bevel_width=0.04)

    # 6. Coral Structural I-Beam Cradles & Support Frames
    bm_cradles = bmesh.new()
    for cy in [-7.5, 0.0, 7.5]:
        # Cradle under return duct
        bmesh_box(bm_cradles, (0.35, 0.35, 3.2), (-14.5, cy, 1.6))
        bmesh_box(bm_cradles, (0.35, 0.35, 3.2), (-11.1, cy, 1.6))
        bmesh_box(bm_cradles, (3.8, 0.4, 0.35), (-12.8, cy, 2.1))
        # Top truss tie
        bmesh_box(bm_cradles, (3.8, 0.35, 0.25), (-12.8, cy, 7.1))
    # 8 Main building vertical structural columns
    for sx in [-8.8, 1.8]:
        for sy in [-12.0, -4.0, 4.0, 12.0]:
            bmesh_ibeam(bm_cradles, 7.8, 0.45, 0.35, 0.04, 0.03, (sx, sy, 3.9), axis='Z')
    create_mesh_object("GEO_Aero_Structural_Support_Frames", bm_cradles, mat_coral_structural_beam(), parent=root)

    # 7. Aerodynamic 40% Scale Test Vehicle on 6-Axis Balance Sting
    bm_model = bmesh.new()
    # 6-Axis Underfloor Balance Turntable Plate (Ø3.6m)
    bmesh_cylinder(bm_model, 1.8, 0.2, (-3.5, 0.0, 0.1), segments=36)
    bmesh_tube(bm_model, 1.95, 1.75, 0.08, (-3.5, 0.0, 0.18), segments=36)
    # Streamlined aerodynamic balance vertical mounting sting strut
    bmesh_box(bm_model, (0.16, 0.65, 1.8), (-3.5, -0.4, 1.0))
    bmesh_cylinder(bm_model, 0.12, 1.8, (-3.5, 0.2, 1.0), segments=16) # Pivot cylinder
    # Authentic 40% Scale Aerodynamic Test Coupe
    bmesh_scale_test_coupe(bm_model, (-3.5, 0.0, 1.9), rot_z=math.radians(180)) # Facing North into wind flow
    create_mesh_object("GEO_Aero_Scale_Test_Vehicle", bm_model, mat_pearl_concept_car_paint(), parent=root)

    # 8. Lavender Brick Control Booth & Telemetry Lab Wing (East: X [3.5, 14.5], Y [-12.0, 12.0])
    bm_booth = bmesh.new()
    bmesh_box(bm_booth, (11.0, 24.0, 7.0), (9.0, 0.0, 3.5))
    create_mesh_object("GEO_Aero_Control_Booth_Halls", bm_booth, mat_lavender_brick_1970(), parent=root, bevel_width=0.04)

    # 9. Control Booth Clerestory Windows, Entry & Manometer Consoles
    bm_booth_glass = bmesh.new()
    # East exterior windows
    bmesh_box(bm_booth_glass, (0.15, 18.0, 1.8), (14.55, 0.0, 4.8))
    # Front entrance double glass doors
    bmesh_box(bm_booth_glass, (3.2, 0.15, 2.8), (9.0, 12.05, 1.4))
    create_mesh_object("GEO_Aero_Booth_Windows", bm_booth_glass, mat_tinted_acrylic_window(), parent=root)

    # 10. Control Room Ergonomic Console Stations & Multi-Tube Manometer Bank
    bm_console = bmesh.new()
    # 4 Operator console desks with CRT monitors & technician chairs
    for oy in [-6.0, -2.0, 2.0, 6.0]:
        bmesh_box(bm_console, (1.8, 1.2, 0.75), (4.5, oy, 0.375))
        # CRT monitors (2 per station)
        for my in [-0.35, 0.35]:
            bmesh_box(bm_console, (0.45, 0.45, 0.4), (4.2, oy + my, 0.95))
            bmesh_box(bm_console, (0.42, 0.38, 0.05), (3.95, oy + my, 0.95)) # Screen face
        # Technician swivel chair
        bmesh_cylinder(bm_console, 0.28, 0.05, (5.8, oy, 0.2), segments=18)
        bmesh_cylinder(bm_console, 0.04, 0.35, (5.8, oy, 0.4), segments=14)
        bmesh_box(bm_console, (0.5, 0.5, 0.1), (5.8, oy, 0.62))
        bmesh_box(bm_console, (0.45, 0.1, 0.5), (6.05, oy, 0.92))
    # 48-Tube multi-tube alcohol manometer board mounted on wall
    bmesh_box(bm_console, (0.25, 4.5, 2.2), (14.3, 0.0, 2.4))
    for tube in range(24):
        ty = -2.0 + tube * 0.17
        bmesh_cylinder(bm_console, 0.02, 1.8, (14.15, ty, 2.4), segments=10)
    # Facility entry sign pylon (6.0m tall)
    bmesh_box(bm_console, (0.6, 0.4, 6.0), (14.0, -14.0, 3.0))
    bmesh_box(bm_console, (1.8, 0.5, 2.2), (14.0, -14.0, 4.8))
    create_mesh_object("GEO_Aero_Control_Consoles", bm_console, mat_cast_iron_dark(), parent=root)

    # 11. Semantic Hitboxes (wireframe & invisible)
    add_hitbox("HITBOX_AERO_MAIN", (34.0, 34.0, 9.5), (0.0, 0.0, 4.75), parent=root)
    add_hitbox("HITBOX_AERO_TUNNEL", (16.0, 30.0, 9.0), (-7.5, 0.0, 4.5), parent=root)

def build_aero_l1(export_path: str):
    """Level 1: 1970s Subsonic Göttingen Closed-Circuit Wind Tunnel & Control Lab."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_03_AERO_HQ_L1", None)
    bpy.context.collection.objects.link(root)
    add_base_aero_l1_geometry(root)

    extras = {
        "unit_id": "AERO_HQ",
        "unit_key": "UNIT_03",
        "level": 1,
        "tier": "office",
        "building_name": "Aerodynamics HQ (40% Subsonic Wind Tunnel)",
        "sub_departments": ["aero_test_throat", "aero_control_booth"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── LEVEL 2: ROLLING ROAD & BOUNDARY LAYER SUCTION (1975-1980) ──
def add_aero_l2_geometry(root):
    """
    Level 2 additions (~5.5k tris):
    - Under-floor Moving Ground Rolling Road steel belt rig in test throat
    - High-volume boundary layer suction scoop & vacuum manifold with exhaust stack
    - North Flank Calibration & Model Workshop Annex (8.5m x 6.5m x 5.5m)
    - Precision pitot-static calibration bench, 3-axis probe traverse, and tool roll-cabs
    """
    # 1. Under-Floor Moving Ground Rolling Road & Boundary Layer Suction Rig
    bm_rolling = bmesh.new()
    # Continuous steel belt rolling road flush with turntable floor
    bmesh_box(bm_rolling, (2.4, 7.5, 0.16), (-3.5, 0.0, 0.22))
    # Twin drive & idler drum rollers
    bmesh_cylinder(bm_rolling, 0.28, 2.4, (-3.5, -3.7, 0.18), segments=24, rot_y=math.radians(90.0))
    bmesh_cylinder(bm_rolling, 0.28, 2.4, (-3.5, 3.7, 0.18), segments=24, rot_y=math.radians(90.0))
    # Boundary layer suction plenum duct in front of vehicle
    bmesh_cylinder(bm_rolling, 0.85, 4.5, (-3.5, 4.5, 0.8), segments=24, rot_y=math.radians(90.0))
    # 32 Stainless steel boundary layer pitot tube sensors across test section floor
    for pt in range(32):
        px = -3.5 - 1.8 + pt * (3.6 / 31)
        bmesh_cylinder(bm_rolling, 0.012, 0.22, (px, 2.8, 0.18), segments=10, rot_x=math.radians(90.0))
        bmesh_cylinder(bm_rolling, 0.008, 0.12, (px, 2.8, 0.06), segments=8)
    # Suction turboblower exhaust stack extending out through roof
    bmesh_cylinder(bm_rolling, 0.65, 8.5, (-7.5, 4.5, 4.25), segments=24)
    bmesh_tube(bm_rolling, 0.8, 0.62, 0.35, (-7.5, 4.5, 8.6), segments=24) # Exhaust cowl
    create_mesh_object("GEO_Aero_Rolling_Road_Suction_Rig", bm_rolling, mat_corrugated_industrial_steel(), parent=root)

    # 2. Calibration & Model Prep Workshop Annex (North flank: X [4.5, 13.5], Y [12.0, 17.5], Z [0.0, 5.5])
    bm_annex = bmesh.new()
    bmesh_box(bm_annex, (9.0, 5.5, 5.5), (9.0, 14.75, 2.75))
    create_mesh_object("GEO_Aero_Calibration_Workshop_Annex", bm_annex, mat_lavender_brick_1970(), parent=root, bevel_width=0.04)

    # 3. Calibration Workshop Equipment: Pitot-Static Test Rig, 2nd Scale Car & Tool Benches
    bm_calib = bmesh.new()
    # Double roll-up aluminum service delivery doors
    bmesh_box(bm_calib, (3.6, 0.2, 3.8), (9.0, 17.55, 1.9))
    # Elevated turntable prep jig & secondary 40% scale GT Coupe model
    bmesh_cylinder(bm_calib, 1.4, 0.35, (9.0, 14.5, 0.175), segments=28)
    bmesh_scale_test_coupe(bm_calib, (9.0, 14.5, 0.35), rot_z=math.radians(-90.0))
    # Pitot-static probe calibration bench
    bmesh_box(bm_calib, (2.6, 1.2, 0.85), (5.8, 14.5, 0.425))
    # Micro-wind calibration nozzle pipe
    bmesh_cylinder(bm_calib, 0.18, 1.8, (5.8, 14.5, 1.15), segments=20, rot_x=math.radians(90.0))
    bmesh_tube(bm_calib, 0.25, 0.17, 0.35, (5.8, 15.4, 1.15), segments=20)
    # Heavy mechanic roll-cab toolboxes with drawers
    for tbx in [11.5, 12.8]:
        bmesh_box(bm_calib, (1.0, 0.7, 1.1), (tbx, 14.5, 0.55))
        for drw in range(4):
            bmesh_box(bm_calib, (0.9, 0.05, 0.16), (tbx, 14.12, 0.25 + drw * 0.22))
    create_mesh_object("GEO_Aero_Calibration_Rig_Tools", bm_calib, mat_safety_yellow(), parent=root)

def build_aero_l2(export_path: str):
    """Level 2: 1975-1980 Rolling Road & Boundary Layer Suction Annex."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_03_AERO_HQ_L2", None)
    bpy.context.collection.objects.link(root)
    add_base_aero_l1_geometry(root)
    add_aero_l2_geometry(root)

    extras = {
        "unit_id": "AERO_HQ",
        "unit_key": "UNIT_03",
        "level": 2,
        "tier": "department",
        "building_name": "Aerodynamics HQ (Rolling Road & Suction Annex)",
        "sub_departments": ["aero_rolling_road", "aero_boundary_suction", "aero_model_prep"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── LEVEL 3: LASER PIV & 256-CH PRESSURE SCANNER (1985-1990) ──
def add_aero_l3_geometry(root):
    """
    Level 3 additions (~9.0k tris):
    - Motorized dual-axis Laser Sheet PIV Traverse Gantry spanning test section
    - Glowing cyan laser flow sheet emissive line illuminating streamlines
    - Aerodynamic smoke rake generator array with 18 heated vaporization nozzles
    - 256-Channel Digital Pressure Scanner Bay with pneumatic line harnesses
    - Multi-Tube Differential Glass Manometer Wall Rack (Control Booth Interior)
    - Overhead Pneumatic & Sensor Cable Tray Harness
    """
    # 1. Laser Sheet PIV Traverse Gantry spanning test section (Z = 6.2m)
    bm_laser = bmesh.new()
    bmesh_box(bm_laser, (8.5, 0.35, 0.35), (-3.5, 1.5, 6.4))
    bmesh_box(bm_laser, (8.5, 0.35, 0.35), (-3.5, -1.5, 6.4))
    bmesh_box(bm_laser, (0.35, 3.2, 0.35), (-7.5, 0.0, 6.4))
    bmesh_box(bm_laser, (0.35, 3.2, 0.35), (0.5, 0.0, 6.4))
    bmesh_box(bm_laser, (1.1, 1.1, 0.75), (-3.5, 0.0, 6.0))
    bmesh_cylinder(bm_laser, 0.12, 0.35, (-3.5, 0.0, 5.5), segments=20)
    for cam_x in [-5.5, -1.5]:
        bmesh_box(bm_laser, (0.35, 0.45, 0.35), (cam_x, 0.0, 5.2))
        bmesh_cylinder(bm_laser, 0.1, 0.25, (cam_x, 0.0, 4.8), segments=16)
        bmesh_cylinder(bm_laser, 0.03, 1.1, (cam_x, 0.0, 5.8), segments=10)
    create_mesh_object("GEO_Aero_Laser_Traverse_Gantry", bm_laser, mat_cast_iron_dark(), parent=root)

    # 2. Glowing Laser Light Sheet Emissive Sheet
    bm_beam = bmesh.new()
    bmesh_box(bm_beam, (0.04, 5.5, 2.8), (-3.5, 0.0, 3.8))
    create_mesh_object("GEO_Aero_Laser_Flow_Sheet", bm_beam, mat_cryo_cyan_emissive(), parent=root)

    # 3. Aerodynamic Smoke Rake Generator Array in contraction nozzle (18 Nozzles & Ceiling Extraction Hood)
    bm_smoke = bmesh.new()
    for zs in [2.2, 3.4, 4.6]:
        bmesh_cylinder(bm_smoke, 0.05, 7.5, (-3.5, 6.0, zs), segments=16, rot_y=math.radians(90.0))
        for nz in range(6):
            nx = -6.0 + nz * 1.0
            bmesh_cylinder(bm_smoke, 0.02, 0.35, (nx, 5.75, zs), segments=10, rot_x=math.radians(90.0))
    bmesh_box(bm_smoke, (8.5, 3.5, 0.45), (-3.5, -6.5, 7.2))
    bmesh_cylinder(bm_smoke, 0.75, 1.4, (-3.5, -6.5, 8.1), segments=24)
    bmesh_cylinder(bm_smoke, 0.35, 0.9, (-7.5, 6.0, 1.8), segments=18)
    create_mesh_object("GEO_Aero_Smoke_Rake_Array", bm_smoke, mat_brushed_aluminum(), parent=root)

    # 4. 256-Channel Digital Pressure Scanner Bay with 64 Differential Pressure Indicators
    bm_scanner = bmesh.new()
    bmesh_box(bm_scanner, (4.0, 12.0, 4.5), (16.0, -2.0, 2.25))
    bmesh_box(bm_scanner, (3.8, 11.8, 0.3), (16.0, -2.0, 4.4))
    for sv in range(4):
        sy = -6.0 + sv * 2.6
        bmesh_box(bm_scanner, (0.8, 1.8, 1.4), (16.2, sy, 1.2))
        for p_row in range(8):
            bmesh_cylinder(bm_scanner, 0.015, 0.6, (15.7, sy - 0.7 + p_row * 0.2, 1.2), segments=8, rot_y=math.radians(90.0))
    for pr in range(4):
        for pc in range(16):
            px = 14.15
            py = -7.0 + pc * 0.68
            pz = 1.0 + pr * 0.65
            bmesh_box(bm_scanner, (0.14, 0.45, 0.35), (px, py, pz))
            bmesh_box(bm_scanner, (0.05, 0.35, 0.15), (px - 0.05, py, pz))
    create_mesh_object("GEO_Aero_Pressure_Scanner_Bay", bm_scanner, mat_lavender_brick_1970(), parent=root)

    # 5. Multi-Tube Differential Glass Manometer Wall Rack (Control Booth Interior)
    bm_mano = bmesh.new()
    for col in range(24):
        cx = 7.5 + (col % 12) * 0.45
        cz = 1.0 + (col // 12) * 1.4
        bmesh_cylinder(bm_mano, 0.025, 1.1, (cx, 13.8, cz + 0.55), segments=14)
    create_mesh_object("GEO_Aero_Liquid_Manometer_Bank", bm_mano, mat_tinted_acrylic_window(), parent=root)

    # 6. Overhead Pneumatic & Sensor Cable Tray Harness
    bm_conduit = bmesh.new()
    for cy in [-4.0, 0.0, 4.0]:
        bmesh_ibeam(bm_conduit, 7.5, 0.25, 0.18, 0.02, 0.02, (-3.5, cy, 6.8), axis='X')
        for tube_x in range(-6, 2):
            bmesh_cylinder(bm_conduit, 0.025, 4.0, (float(tube_x), cy, 6.85), segments=12, rot_x=math.radians(90.0))
    create_mesh_object("GEO_Aero_Pneumatic_Overhead_Harness", bm_conduit, mat_coral_structural_beam(), parent=root)

def build_aero_l3(export_path: str):
    """Level 3: 1985-1990 Laser PIV & 256-Channel Digital Pressure Scanner."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_03_AERO_HQ_L3", None)
    bpy.context.collection.objects.link(root)
    add_base_aero_l1_geometry(root)
    add_aero_l2_geometry(root)
    add_aero_l3_geometry(root)

    extras = {
        "unit_id": "AERO_HQ",
        "unit_key": "UNIT_03",
        "level": 3,
        "tier": "center",
        "building_name": "Aerodynamics HQ (Laser PIV & Smoke Flow Tunnel)",
        "sub_departments": ["aero_laser_piv", "aero_smoke_flow", "aero_pressure_telemetry"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── LEVEL 4: FULL-SCALE 1:1 TEST HALL & MEZZANINE (1995-2000) ──
def add_aero_l4_geometry(root):
    """
    Level 4 additions (~18.0k tris):
    - Full-Scale 1:1 High-Bay Production Wind Tunnel Hall (15m x 24m x 12.5m)
    - Full-scale production prototype hypercar on 6-component aerodynamic balance
    - Modern low-iron curtain wall client viewing mezzanine gallery
    - Overhead traveling bridge crane with hoist trolley
    - 6 Heavy Warren structural lattice ceiling trusses
    - Secondary full-scale production prototype hypercar on transport dollies in staging bay
    - High-bay wall acoustical panels and 4 corner lighting towers
    """
    # 1. High-Bay Structural Envelope (Center-West: X = -3.5m, Y = 0.0m, Z = [0.0, 12.5])
    bm_fullscale = bmesh.new()
    bmesh_box(bm_fullscale, (15.0, 24.0, 12.5), (-3.5, 0.0, 6.25))
    bmesh_box(bm_fullscale, (7.0, 20.0, 1.8), (-3.5, 0.0, 13.0))
    create_mesh_object("GEO_Aero_FullScale_TestHall_Shell", bm_fullscale, mat_travertine_concrete(), parent=root, bevel_width=0.06)

    # 2. Modern Low-Iron Curtain Wall Viewing Mezzanine (East side: X = 4.2m, Z = [5.5, 10.5])
    bm_mezzanine = bmesh.new()
    bmesh_box(bm_mezzanine, (0.15, 18.0, 4.8), (4.2, 0.0, 8.0))
    create_mesh_object("GEO_Aero_Viewing_Mezzanine_Glass", bm_mezzanine, mat_modern_curtain_glass(), parent=root)

    # Mezzanine Structural Mullions & Stainless Steel Handrails
    bm_mezz_mull = bmesh.new()
    for ym in [-7.5, -4.5, -1.5, 1.5, 4.5, 7.5]:
        bmesh_box(bm_mezz_mull, (0.32, 0.16, 5.0), (4.25, ym, 8.0))
    bmesh_box(bm_mezz_mull, (0.32, 18.2, 0.18), (4.25, 0.0, 5.6))
    bmesh_box(bm_mezz_mull, (0.32, 18.2, 0.18), (4.25, 0.0, 10.4))
    # Overhead Traveling Bridge Crane with Hoist Trolley
    bmesh_box(bm_mezz_mull, (14.2, 0.5, 0.6), (-3.5, 0.0, 11.2))
    bmesh_box(bm_mezz_mull, (1.2, 1.4, 0.8), (-3.5, 0.0, 10.5))
    bmesh_cylinder(bm_mezz_mull, 0.06, 1.2, (-3.5, 0.0, 9.5), segments=12)
    bmesh_tube(bm_mezz_mull, 0.18, 0.12, 0.08, (-3.5, 0.0, 8.8), segments=16)
    create_mesh_object("GEO_Aero_Mezzanine_Mullions", bm_mezz_mull, mat_brushed_aluminum(), parent=root)

    # 3. 6-Component Aerodynamic Balance Turntable Platform (Flush floor: Ø6.0m)
    bm_balance = bmesh.new()
    bmesh_cylinder(bm_balance, 3.2, 0.25, (-3.5, 0.0, 0.125), segments=36)
    bmesh_tube(bm_balance, 3.35, 3.15, 0.08, (-3.5, 0.0, 0.26), segments=36)
    for px in [-1.05, 1.05]:
        for py in [-1.45, 1.45]:
            bmesh_box(bm_balance, (0.6, 0.8, 0.04), (-3.5 + px, py, 0.28))
    create_mesh_object("GEO_Aero_6Component_Balance_Turntable", bm_balance, mat_cast_iron_dark(), parent=root)

    # 4. Full-Scale 1:1 Production Hypercar Prototype on the Balance
    bm_proto = bmesh.new()
    bmesh_fullscale_supercar(bm_proto, (-3.5, 0.0, 0.3), rot_z=math.radians(180))
    create_mesh_object("GEO_Aero_FullScale_Prototype_Vehicle", bm_proto, mat_pearl_concept_car_paint(), parent=root)

    # 5. High-Bay Structural Warren Trusses (Spanning Ceiling Z = 11.5m to 12.3m)
    bm_trusses = bmesh.new()
    for ty in [-9.0, -5.5, -2.0, 1.5, 5.0, 8.5]:
        bmesh_box(bm_trusses, (14.6, 0.35, 0.35), (-3.5, ty, 12.3))
        bmesh_box(bm_trusses, (14.6, 0.35, 0.35), (-3.5, ty, 11.1))
        for step in range(8):
            wx = -10.0 + step * 1.8
            bmesh_box(bm_trusses, (0.18, 0.25, 1.35), (wx, ty, 11.7))
            bmesh_box(bm_trusses, (0.18, 0.25, 1.35), (wx + 0.9, ty, 11.7))
    create_mesh_object("GEO_Aero_HighBay_Roof_Trusses", bm_trusses, mat_coral_structural_beam(), parent=root)

    # 6. Secondary Full-Scale Production Prototype on Transport Dollies in Staging Bay
    bm_proto2 = bmesh.new()
    bmesh_fullscale_supercar(bm_proto2, (-3.5, 8.0, 0.35), rot_z=0.0)
    for dx in [-4.55, -2.45]:
        for dy in [6.55, 9.45]:
            bmesh_box(bm_proto2, (0.55, 0.75, 0.12), (dx, dy, 0.12))
            for caster in range(4):
                cang = caster * math.pi / 2
                bmesh_cylinder(bm_proto2, 0.05, 0.08, (dx + 0.18*math.cos(cang), dy + 0.25*math.sin(cang), 0.04), segments=12)
    create_mesh_object("GEO_Aero_Staging_Prototype_Vehicle", bm_proto2, mat_satin_matte_white(), parent=root)

    # 7. Perimeter High-Bay Wall Acoustical Baffles & Floodlights
    bm_baffles = bmesh.new()
    for by in range(-10, 11, 3):
        bmesh_box(bm_baffles, (0.22, 2.2, 4.5), (-10.85, float(by), 6.5))
        bmesh_box(bm_baffles, (0.22, 2.2, 4.5), (3.85, float(by), 6.5))
    for fl_x, fl_y in [(-10.2, -11.0), (-10.2, 11.0), (3.2, -11.0), (3.2, 11.0)]:
        bmesh_cylinder(bm_baffles, 0.15, 9.0, (fl_x, fl_y, 4.5), segments=16)
        bmesh_box(bm_baffles, (0.8, 0.8, 0.4), (fl_x, fl_y, 9.2))
        for spot in range(4):
            bmesh_cylinder(bm_baffles, 0.12, 0.25, (fl_x + 0.25*(spot%2*2-1), fl_y + 0.25*(spot//2*2-1), 9.5), segments=12)
    create_mesh_object("GEO_Aero_HighBay_Wall_Acoustics_Lighting", bm_baffles, mat_brushed_aluminum(), parent=root)

def build_aero_l4(export_path: str):
    """Level 4: 1995-2000 Full-Scale 1:1 Wind Tunnel Hall & Mezzanine."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_03_AERO_HQ_L4", None)
    bpy.context.collection.objects.link(root)
    add_base_aero_l1_geometry(root)
    add_aero_l2_geometry(root)
    add_aero_l3_geometry(root)
    add_aero_l4_geometry(root)

    extras = {
        "unit_id": "AERO_HQ",
        "unit_key": "UNIT_03",
        "level": 4,
        "tier": "advanced_hq",
        "building_name": "Aerodynamics HQ (Full-Scale 1:1 Production Wind Tunnel)",
        "sub_departments": ["aero_full_scale_hall", "aero_6comp_balance", "aero_vip_mezzanine"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── LEVEL 5: HPC CFD SUPERCOMPUTER DATA CENTER (2005-2010) ──
def add_aero_l5_geometry(root):
    """
    Level 5 additions (~22.0k tris):
    - 3-Story Glass Cube CFD Supercomputer Center (10m x 14m x 11m) on East wing
    - 24 High-density CFD compute rack cabinets with illuminated cyan LED status blades
    - Overhead cable ladder trays & fiber bus
    - 3D CAVE Aerodynamic Visualization Studio with curved projection screen & 4 engineer consoles
    - Cryogenic Closed-Loop Nitrogen Flow Test Bench
    - Rooftop evaporative cooling towers with ducted fan intake cowls and insulated piping
    - Overhead fiber-optic data umbilical bridge connecting CFD cluster to wind tunnel control room
    """
    # 1. 3-Story HPC Supercomputer Data Center Shell
    bm_hpc = bmesh.new()
    bmesh_box(bm_hpc, (10.0, 14.0, 11.0), (12.5, 4.0, 5.5))
    create_mesh_object("GEO_Aero_HPC_DataCenter_Shell", bm_hpc, mat_travertine_concrete(), parent=root, bevel_width=0.06)

    # 2. Curtain Glass Facade on HPC Center
    bm_hpc_glass = bmesh.new()
    bmesh_box(bm_hpc_glass, (0.15, 12.0, 9.5), (17.55, 4.0, 5.5))
    bmesh_box(bm_hpc_glass, (8.5, 0.15, 9.5), (12.5, 11.05, 5.5))
    create_mesh_object("GEO_Aero_HPC_Curtain_Glass", bm_hpc_glass, mat_modern_curtain_glass(), parent=root)

    # 3. 24 High-Density CFD Compute Server Racks with Blade Drawers
    bm_racks = bmesh.new()
    bm_leds = bmesh.new()
    bm_trays = bmesh.new()
    for rx in [9.0, 11.4, 13.8, 16.2]:
        bmesh_box(bm_trays, (0.8, 13.0, 0.12), (rx, 4.0, 8.3))
        for step_tray in range(12):
            bmesh_box(bm_trays, (0.75, 0.08, 0.08), (rx, -2.0 + step_tray * 1.1, 8.35))
        for ry in [-2.0, 0.5, 3.0, 5.5, 8.0, 10.2]:
            bmesh_box(bm_racks, (0.95, 1.8, 7.4), (rx, ry, 4.2))
            for b_idx in range(6):
                bz = 1.0 + b_idx * 1.15
                bmesh_box(bm_racks, (0.98, 1.7, 0.12), (rx, ry, bz))
                bmesh_box(bm_leds, (1.02, 1.6, 0.08), (rx, ry, bz + 0.18))
    create_mesh_object("GEO_Aero_CFD_Server_Racks", bm_racks, mat_cast_iron_dark(), parent=root)
    create_mesh_object("GEO_Aero_HPC_Server_LEDs", bm_leds, mat_cryo_cyan_emissive(), parent=root)
    create_mesh_object("GEO_Aero_CFD_Cable_Ladders", bm_trays, mat_safety_yellow(), parent=root)

    # 4. 3D CAVE Aerodynamic Visualization Studio & 4 Workstations
    bm_cave = bmesh.new()
    bm_cave_screen = bmesh.new()
    bmesh_tube(bm_cave_screen, 2.8, 2.65, 2.8, (12.5, -4.5, 2.2), segments=36)
    for ws_i, (ws_x, ws_y, ws_rot) in enumerate([
        (10.5, -4.0, 45), (14.5, -4.0, -45), (10.5, -6.5, 135), (14.5, -6.5, -135)
    ]):
        rad_w = math.radians(ws_rot)
        cos_w, sin_w = math.cos(rad_w), math.sin(rad_w)
        bmesh_box(bm_cave, (1.4, 0.75, 0.75), (ws_x, ws_y, 0.375))
        for m_off in [-0.35, 0.35]:
            mx = ws_x + m_off * cos_w
            my = ws_y + m_off * sin_w
            bmesh_box(bm_cave, (0.04, 0.45, 0.3), (mx, my, 0.95))
            bmesh_cylinder(bm_cave, 0.02, 0.25, (mx, my, 0.8), segments=10)
        bmesh_cylinder(bm_cave, 0.28, 0.08, (ws_x - 0.45*sin_w, ws_y + 0.45*cos_w, 0.45), segments=16)
        bmesh_box(bm_cave, (0.35, 0.38, 0.45), (ws_x - 0.55*sin_w, ws_y + 0.55*cos_w, 0.72))
        bmesh_cylinder(bm_cave, 0.03, 0.45, (ws_x - 0.45*sin_w, ws_y + 0.45*cos_w, 0.22), segments=12)
    create_mesh_object("GEO_Aero_CAVE_Workstations", bm_cave, mat_brushed_aluminum(), parent=root)
    create_mesh_object("GEO_Aero_CAVE_Holo_Screen", bm_cave_screen, mat_holographic_cyan_glow(), parent=root)

    # 5. Cryogenic Closed-Loop Nitrogen Flow Test Bench
    bm_cryo = bmesh.new()
    bmesh_cylinder(bm_cryo, 0.75, 4.5, (16.2, -1.5, 2.5), segments=24)
    bmesh_cylinder(bm_cryo, 0.95, 0.35, (16.2, -1.5, 4.6), segments=24)
    for pipe_z in [1.5, 3.0, 4.2]:
        bmesh_tube(bm_cryo, 0.16, 0.12, 5.5, (13.5, -1.5, pipe_z), segments=18, rot_y=math.radians(90.0))
        for v in range(3):
            bmesh_cylinder(bm_cryo, 0.22, 0.15, (11.5 + v * 1.8, -1.5, pipe_z), segments=14)
            bmesh_cylinder(bm_cryo, 0.08, 0.3, (11.5 + v * 1.8, -1.5, pipe_z + 0.2), segments=12)
    create_mesh_object("GEO_Aero_Cryogenic_Fluid_Loop", bm_cryo, mat_corrugated_industrial_steel(), parent=root)

    # 6. Rooftop Evaporative Cooling Towers (Z = 11.5m) atop HPC Center
    bm_cooling = bmesh.new()
    for cy in [1.5, 6.5]:
        bmesh_cylinder(bm_cooling, 1.8, 2.4, (12.5, cy, 12.2), segments=24)
        bmesh_tube(bm_cooling, 2.0, 1.6, 0.6, (12.5, cy, 13.6), segments=24)
        bmesh_cylinder(bm_cooling, 0.16, 5.0, (12.5, cy, 14.2), segments=14, rot_y=math.radians(90.0))
    create_mesh_object("GEO_Aero_Rooftop_Cooling_Towers", bm_cooling, mat_corrugated_industrial_steel(), parent=root)

    # 7. Data Fiber Umbilical Bridge connecting HPC center to wind tunnel control room
    bm_bridge = bmesh.new()
    bmesh_box(bm_bridge, (5.5, 1.4, 1.2), (5.0, 4.0, 6.8))
    bmesh_tube(bm_bridge, 0.25, 0.18, 5.2, (5.0, 4.0, 6.8), segments=16, rot_y=math.radians(90.0))
    create_mesh_object("GEO_Aero_Fiber_Conduit_Bridge", bm_bridge, mat_coral_structural_beam(), parent=root)

    # Semantic Hitbox
    add_hitbox("HITBOX_AERO_HPC", (11.0, 15.0, 13.0), (12.5, 4.0, 6.5), parent=root)

def build_aero_l5(export_path: str):
    """Level 5: 2005-2010 HPC CFD Supercomputer Center & Cryogenic Fluid Lab."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_03_AERO_HQ_L5", None)
    bpy.context.collection.objects.link(root)
    add_base_aero_l1_geometry(root)
    add_aero_l2_geometry(root)
    add_aero_l3_geometry(root)
    add_aero_l4_geometry(root)
    add_aero_l5_geometry(root)

    extras = {
        "unit_id": "AERO_HQ",
        "unit_key": "UNIT_03",
        "level": 5,
        "tier": "world_class_hq",
        "building_name": "Aerodynamics HQ (HPC CFD Supercomputer Center)",
        "sub_departments": ["aero_hpc_cluster", "aero_cooling_towers", "aero_cfd_telemetry"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── LEVEL 6: AEROACOUSTIC ANECHOIC NVH CHAMBER (2015-2020) ──
def add_aero_l6_geometry(root):
    """
    Level 6 additions (~22.0k tris):
    - Aeroacoustic Anechoic NVH Wind Noise Chamber Annex (10m x 12m x 9m) on South-East
    - 120 Geometric foam sound-absorbing acoustic wedge baffles and pyramids lining walls and ceiling
    - Overhead ceiling-suspended 3D acoustic microphone array ring with 48 capsules
    - Ground-plane porous boundary layer suction floor grid with 96 evacuation slots
    - Quiet Low-Turbulence Acoustic Fan Silencer Fairing casing on axial drive
    - 64-Microphone Phased Acoustic Array Dish for aeroacoustic sound source localization
    - Rooftop Photovoltaic Solar Canopy Array (28m x 22m)
    """
    # 1. Anechoic NVH Acoustic Chamber Annex (South-East flank: X [7.5, 17.5], Y [-15.0, -3.0], Z [0.0, 9.0])
    bm_anechoic = bmesh.new()
    bmesh_box(bm_anechoic, (10.0, 12.0, 9.0), (12.5, -9.0, 4.5))
    create_mesh_object("GEO_Aero_Anechoic_NVH_Chamber", bm_anechoic, mat_dark_slate_roof(), parent=root, bevel_width=0.06)

    # 2. 120 Geometric Foam Sound-Absorbing Acoustic Wedge Baffles with Pyramids
    bm_wedges = bmesh.new()
    for wy in range(-14, -3, 2):
        for wz in range(2, 9, 2):
            bmesh_box(bm_wedges, (0.45, 1.4, 1.4), (17.75, wy + 0.5, wz))
            bmesh_box(bm_wedges, (1.4, 0.45, 1.4), (12.5 + (wy+9)*0.8, -15.2, wz))
            bmesh_pyramid(bm_wedges, (1.2, 1.2), 0.45, (17.95, wy + 0.5, wz), rot_y=math.radians(90.0))
    for ix in range(9, 17, 2):
        for iy in range(-14, -4, 2):
            bmesh_pyramid(bm_wedges, (1.4, 1.4), 0.55, (float(ix), float(iy), 8.5), rot_x=math.radians(180.0))
            bmesh_pyramid(bm_wedges, (1.4, 1.4), 0.45, (float(ix), -3.2, float(ix - 5)), rot_x=math.radians(90.0))
    create_mesh_object("GEO_Aero_Acoustic_Wedge_Baffles", bm_wedges, mat_cast_iron_dark(), parent=root)

    # 3. Overhead Ceiling-Suspended 3D Acoustic Microphone Array Ring (48 Capsules)
    bm_ceiling_array = bmesh.new()
    for ring_r in [1.8, 3.2, 4.4]:
        bmesh_tube(bm_ceiling_array, ring_r + 0.05, ring_r, 0.08, (-3.5, 0.0, 9.8), segments=36)
    for cap_idx in range(48):
        c_theta = cap_idx * 2 * math.pi / 48
        c_rad = 1.8 + (cap_idx % 3) * 1.3
        cap_x = -3.5 + c_rad * math.cos(c_theta)
        cap_y = c_rad * math.sin(c_theta)
        bmesh_cylinder(bm_ceiling_array, 0.02, 1.2, (cap_x, cap_y, 9.2), segments=10)
        bmesh_cylinder(bm_ceiling_array, 0.045, 0.12, (cap_x, cap_y, 8.55), segments=14)
    create_mesh_object("GEO_Aero_Ceiling_Acoustic_Array", bm_ceiling_array, mat_safety_yellow(), parent=root)

    # 4. Boundary Layer Porous Suction Floor Grid (96 Suction Slots)
    bm_grid = bmesh.new()
    bmesh_box(bm_grid, (8.5, 12.0, 0.12), (-3.5, 0.0, 0.06))
    for slot_y in range(-5, 6):
        sy = slot_y * 1.05
        for slot_x in range(-3, 4):
            sx = -3.5 + slot_x * 1.15
            bmesh_box(bm_grid, (0.85, 0.18, 0.06), (sx, sy, 0.13))
    create_mesh_object("GEO_Aero_Boundary_Suction_Floor_Grid", bm_grid, mat_cast_iron_dark(), parent=root)

    # 5. Quiet Low-Turbulence Acoustic Fan Silencer Fairing Casing on Axial Fan
    bm_silencer = bmesh.new()
    bmesh_tube(bm_silencer, 3.2, 2.65, 4.2, (-12.8, -13.2, 4.5), segments=36, rot_x=math.radians(90.0))
    for s_i in range(5):
        s_y = -14.5 + s_i * 0.7
        bmesh_box(bm_silencer, (4.8, 0.12, 4.8), (-12.8, s_y, 4.5))
    create_mesh_object("GEO_Aero_Acoustic_Silencer_Fairing", bm_silencer, mat_brushed_aluminum(), parent=root)

    # 6. 64-Microphone Phased Acoustic Array Dish inside Test Hall
    bm_mic = bmesh.new()
    bmesh_cylinder(bm_mic, 1.6, 0.12, (2.8, 0.0, 3.8), segments=32, rot_y=math.radians(90.0))
    bmesh_tube(bm_mic, 1.75, 1.55, 0.06, (2.8, 0.0, 3.8), segments=32, rot_y=math.radians(90.0))
    for m in range(32):
        ang = m * 2 * math.pi / 8 + (m // 8) * 0.4
        rad_m = 0.3 + (m / 32) * 1.2
        my = rad_m * math.cos(ang)
        mz = 3.8 + rad_m * math.sin(ang)
        bmesh_cylinder(bm_mic, 0.035, 0.08, (2.72, my, mz), segments=12, rot_y=math.radians(90.0))
    create_mesh_object("GEO_Aero_Acoustic_Microphone_Array", bm_mic, mat_safety_yellow(), parent=root)

    # 7. Rooftop Photovoltaic Solar Canopy Array (28m x 22m) on satin steel columns
    bm_solar = bmesh.new()
    bmesh_box(bm_solar, (26.0, 20.0, 0.25), (-3.5, 0.0, 13.5))
    for r in range(6):
        sy = -8.0 + r * 3.2
        bmesh_box(bm_solar, (25.0, 2.8, 0.08), (-3.5, sy, 13.68))
        for c in range(-12, 10, 4):
            bmesh_box(bm_solar, (3.6, 2.6, 0.04), (c, sy, 13.74))
    create_mesh_object("GEO_Aero_Photovoltaic_Solar_Canopy", bm_solar, mat_modern_curtain_glass(), parent=root)

def build_aero_l6(export_path: str):
    """Level 6: 2015-2020 Aeroacoustic Anechoic NVH Wind Noise Chamber."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_03_AERO_HQ_L6", None)
    bpy.context.collection.objects.link(root)
    add_base_aero_l1_geometry(root)
    add_aero_l2_geometry(root)
    add_aero_l3_geometry(root)
    add_aero_l4_geometry(root)
    add_aero_l5_geometry(root)
    add_aero_l6_geometry(root)

    extras = {
        "unit_id": "AERO_HQ",
        "unit_key": "UNIT_03",
        "level": 6,
        "tier": "innovation_campus",
        "building_name": "Aerodynamics HQ (Aeroacoustic Anechoic Complex)",
        "sub_departments": ["aero_nvh_chamber", "aero_beamforming_array", "aero_fan_silencer"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── LEVEL 7: QUANTUM TRANSONIC FACILITY & AIRFOIL SPIRE (2020s+) ──
def add_aero_l7_geometry(root):
    """
    Level 7 additions (~32.0k tris):
    - 20m Sculptural Aerodynamic Airfoil Spire Tower with knife-edge trailing edge & 72 glass fins across 4 faces
    - Sweeping aerodynamic glass airfoil canopy with spaceframe tubular struts
    - Elevated Transonic Mach 0.8 Supersonic Nozzle Bench with Schlieren optical window
    - Central Holographic Wind Flow Streamline Visualization Pod displaying 3D vortex cores
    - Rooftop Drone Anemometry Vertiport with 2 autonomous multi-rotor survey drones
    - Ground-level supersonic shockwave diffuser ring sculpture in front plaza
    - Rooftop satellite radar and telemetry sensor cluster
    """
    # 1. Sculptural Aerodynamic Airfoil Spire Tower (NE corner: X [8.0, 16.0], Y [8.0, 16.0], Z [0.0, 19.5])
    bm_spire = bmesh.new()
    bmesh_box(bm_spire, (8.0, 8.0, 19.5), (12.0, 12.0, 9.75))
    bmesh_box(bm_spire, (0.5, 8.2, 3.5), (16.2, 12.0, 18.0))
    create_mesh_object("GEO_Aero_Quantum_Transonic_Tower", bm_spire, mat_satin_matte_white(), parent=root, bevel_width=0.06)

    # 2. Spire Glazed Curtain Wall & 72 Vertical Aerodynamic Glass Fins (4 Faces x 4 Floors)
    bm_spire_glass = bmesh.new()
    for fl in range(5):
        fz = 3.0 + fl * 3.6
        bmesh_box(bm_spire_glass, (8.2, 7.2, 1.8), (12.0, 12.0, fz))
        bmesh_box(bm_spire_glass, (7.2, 8.2, 1.8), (12.0, 12.0, fz))
        if fl < 4:
            for fin in range(6):
                f_coord = 8.8 + fin * 1.2
                bmesh_box(bm_spire_glass, (0.05, 0.45, 2.4), (f_coord, 7.75, fz))
                bmesh_box(bm_spire_glass, (0.05, 0.45, 2.4), (f_coord, 16.25, fz))
                bmesh_box(bm_spire_glass, (0.45, 0.05, 2.4), (7.75, f_coord, fz))
                bmesh_box(bm_spire_glass, (0.45, 0.05, 2.4), (16.25, f_coord, fz))
    create_mesh_object("GEO_Aero_Transonic_Tower_Glass", bm_spire_glass, mat_modern_curtain_glass(), parent=root)

    # 3. Sweeping Aerodynamic Glass Airfoil Canopy over Main Wind Tunnel Roof
    bm_canopy = bmesh.new()
    bmesh_box(bm_canopy, (24.0, 28.0, 0.45), (-3.5, 0.0, 14.8))
    bmesh_box(bm_canopy, (0.45, 28.0, 2.4), (-15.5, 0.0, 15.8))
    bmesh_box(bm_canopy, (0.45, 28.0, 2.4), (8.5, 0.0, 15.8))
    for sx in [-12.0, -3.5, 5.0]:
        for sy in [-12.0, 0.0, 12.0]:
            bmesh_cylinder(bm_canopy, 0.16, 7.0, (sx, sy, 11.5), segments=20)
            bmesh_cylinder(bm_canopy, 0.04, 5.5, (sx + 1.5, sy + 1.5, 13.0), segments=12, rot_x=math.radians(25))
    create_mesh_object("GEO_Aero_Airfoil_Glass_Canopy", bm_canopy, mat_modern_curtain_glass(), parent=root)

    # 4. Transonic Supersonic Nozzle Test Bench (Elevated conduit along north facade: Z = 9.5m)
    bm_transonic = bmesh.new()
    bmesh_cylinder(bm_transonic, 1.4, 16.0, (-3.5, 14.5, 9.5), segments=28, rot_y=math.radians(90.0))
    bmesh_tube(bm_transonic, 1.8, 1.35, 2.8, (2.5, 14.5, 9.5), segments=24, rot_y=math.radians(90.0))
    bmesh_cylinder(bm_transonic, 0.45, 0.25, (2.5, 13.0, 9.5), segments=20, rot_x=math.radians(90.0))
    create_mesh_object("GEO_Aero_Transonic_Nozzle_Bench", bm_transonic, mat_brushed_aluminum(), parent=root)

    # 5. Central Holographic Wind Flow Streamline Visualization Pod
    bm_holo = bmesh.new()
    bmesh_cylinder(bm_holo, 2.8, 0.35, (-3.5, 0.0, 15.2), segments=36)
    bmesh_tube(bm_holo, 3.0, 2.7, 0.12, (-3.5, 0.0, 15.4), segments=36)
    bmesh_tube(bm_holo, 2.6, 2.38, 0.18, (-3.5, 0.0, 16.2), segments=32)
    bmesh_tube(bm_holo, 2.1, 1.9, 0.18, (-3.5, 0.0, 17.2), segments=28)
    bmesh_tube(bm_holo, 1.5, 1.3, 0.18, (-3.5, 0.0, 18.2), segments=24)
    bmesh_cylinder(bm_holo, 0.45, 0.18, (-3.5, 0.0, 18.8), segments=20)
    create_mesh_object("GEO_Aero_Holographic_Streamline_Pod", bm_holo, mat_holographic_cyan_glow(), parent=root)

    # 6. Rooftop Drone Anemometry Vertiport atop Anechoic Chamber (Z = 9.2m)
    bm_drone = bmesh.new()
    bmesh_box(bm_drone, (7.5, 7.5, 0.2), (12.5, -9.0, 9.2))
    bmesh_tube(bm_drone, 3.2, 2.8, 0.08, (12.5, -9.0, 9.35), segments=36)
    bmesh_cylinder(bm_drone, 0.8, 0.08, (12.5, -9.0, 9.35), segments=24)
    bmesh_box(bm_drone, (0.2, 1.4, 0.09), (12.1, -9.0, 9.36))
    bmesh_box(bm_drone, (0.2, 1.4, 0.09), (12.9, -9.0, 9.36))
    bmesh_box(bm_drone, (0.8, 0.2, 0.09), (12.5, -9.0, 9.36))
    for ap in range(12):
        ap_rad = ap * 2 * math.pi / 12
        ax = 12.5 + 3.4 * math.cos(ap_rad)
        ay = -9.0 + 3.4 * math.sin(ap_rad)
        bmesh_cylinder(bm_drone, 0.08, 0.15, (ax, ay, 9.35), segments=14)
    bmesh_cylinder(bm_drone, 0.04, 2.5, (15.5, -6.0, 10.45), segments=12)
    bmesh_cylinder(bm_drone, 0.16, 0.8, (15.5, -5.6, 11.5), segments=16, rot_x=math.radians(90.0))
    create_mesh_object("GEO_Aero_Drone_Anemometry_Pad", bm_drone, mat_safety_yellow(), parent=root)

    # 7. 2 Autonomous Multi-Rotor Boundary Layer Survey Drones on Vertiport
    bm_drones = bmesh.new()
    bmesh_aerodynamic_drone(bm_drones, (11.0, -8.0, 9.35), rot_z=math.radians(35.0))
    bmesh_aerodynamic_drone(bm_drones, (14.0, -10.0, 9.35), rot_z=math.radians(-45.0))
    create_mesh_object("GEO_Aero_Survey_Drones", bm_drones, mat_brushed_aluminum(), parent=root)

    # 8. Ground-Level Supersonic Shockwave Diffuser Ring Sculpture (Front Plaza)
    bm_sculpture = bmesh.new()
    bm_sculpture_glow = bmesh.new()
    for r_idx, (r_major, r_minor, r_tilt) in enumerate([(3.4, 2.4, 25), (2.5, 1.7, -35), (1.6, 1.1, 50)]):
        rad_t = math.radians(r_tilt)
        bmesh_tube(bm_sculpture, r_major, r_minor, 0.14, (0.0, -14.5, 2.2), segments=36, rot_x=rad_t)
        bmesh_tube(bm_sculpture_glow, r_minor + 0.04, r_minor - 0.02, 0.16, (0.0, -14.5, 2.2), segments=36, rot_x=rad_t)
    bmesh_cylinder(bm_sculpture, 0.08, 4.2, (0.0, -14.5, 2.2), segments=18, rot_y=math.radians(90.0))
    bmesh_pyramid(bm_sculpture, (0.24, 0.24), 0.8, (2.1, -14.5, 2.2), rot_y=math.radians(90.0))
    for tripod in range(3):
        t_ang = tripod * 2 * math.pi / 3
        bmesh_cylinder(bm_sculpture, 0.06, 2.4, (1.2 * math.cos(t_ang), -14.5 + 1.2 * math.sin(t_ang), 1.2), segments=12, rot_x=math.radians(15))
    create_mesh_object("GEO_Aero_Supersonic_Sculpture", bm_sculpture, mat_brushed_aluminum(), parent=root)
    create_mesh_object("GEO_Aero_Supersonic_Sculpture_Glow", bm_sculpture_glow, mat_holographic_cyan_glow(), parent=root)

    # 9. Rooftop Telemetry & Weather Radar Station (Spire Roof Z = 19.8m)
    bm_telemetry = bmesh.new()
    bmesh_tube(bm_telemetry, 1.4, 0.2, 0.45, (12.0, 12.0, 20.8), segments=28, rot_x=math.radians(35.0))
    bmesh_cylinder(bm_telemetry, 0.06, 1.4, (12.0, 12.0, 20.2), segments=14)
    bmesh_cylinder(bm_telemetry, 0.55, 0.9, (14.5, 14.0, 20.4), segments=20)
    bmesh_cylinder(bm_telemetry, 0.04, 2.2, (9.5, 9.5, 21.0), segments=12)
    bmesh_cylinder(bm_telemetry, 0.12, 0.6, (9.5, 9.5, 22.0), segments=14, rot_x=math.radians(90.0))
    create_mesh_object("GEO_Aero_Rooftop_Aero_Telemetry", bm_telemetry, mat_safety_yellow(), parent=root)

    # Semantic Hitbox for Transonic Tower
    add_hitbox("HITBOX_AERO_TOWER", (9.0, 9.0, 21.0), (12.0, 12.0, 10.5), parent=root)

def build_aero_l7(export_path: str):
    """Level 7: 2020s+ Quantum Transonic Facility & Airfoil Spire."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_03_AERO_HQ_L7", None)
    bpy.context.collection.objects.link(root)
    add_base_aero_l1_geometry(root)
    add_aero_l2_geometry(root)
    add_aero_l3_geometry(root)
    add_aero_l4_geometry(root)
    add_aero_l5_geometry(root)
    add_aero_l6_geometry(root)
    add_aero_l7_geometry(root)

    extras = {
        "unit_id": "AERO_HQ",
        "unit_key": "UNIT_03",
        "level": 7,
        "tier": "hypermodern_campus",
        "building_name": "Aerodynamics HQ (Quantum Transonic Facility)",
        "sub_departments": ["aero_transonic_spire", "aero_airfoil_canopy", "aero_holo_streamlines", "aero_drone_vertiport"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# =========================================================================
# BATCH GENERATION & AUDIT ENTRYPOINT
# =========================================================================

def generate_all_aero_levels(output_dir: str = None):
    if output_dir is None:
        output_dir = os.path.join(workspace_root, "public", "models", "campus")
    os.makedirs(output_dir, exist_ok=True)
    
    levels = [
        (0, "hq_03_aero_l0.glb", build_aero_l0),
        (1, "hq_03_aero_l1.glb", build_aero_l1),
        (2, "hq_03_aero_l2.glb", build_aero_l2),
        (3, "hq_03_aero_l3.glb", build_aero_l3),
        (4, "hq_03_aero_l4.glb", build_aero_l4),
        (5, "hq_03_aero_l5.glb", build_aero_l5),
        (6, "hq_03_aero_l6.glb", build_aero_l6),
        (7, "hq_03_aero_l7.glb", build_aero_l7),
    ]
    
    results = {}
    print("=" * 70)
    print(" AUTO TYCOON CAMPUS - UNIT_03 AERODYNAMICS HQ & WIND TUNNEL")
    print(f" Target Output Directory: {output_dir}")
    print("=" * 70)
    
    all_passed = True
    for lvl, filename, builder_func in levels:
        out_path = os.path.join(output_dir, filename)
        tier_name = CAMPUS_TRIANGLE_BUDGETS[lvl]["tier"]
        print(f"\n>>> Generating UNIT_03 Level {lvl} ({tier_name}) -> {filename}...")
        
        success = builder_func(out_path)
        passed, report = audit_scene("UNIT_03_AERO", lvl, bpy)
        print_audit_summary(report)
        
        file_size = os.path.getsize(out_path) if os.path.exists(out_path) else 0
        tris = report["total_triangles"]
        print(f"    Export: {success} | Size: {file_size / 1024:.1f} KB | Triangles: {tris:,}")
        results[lvl] = {"file": filename, "passed": passed, "size_kb": file_size / 1024.0, "triangles": tris}
        if not passed:
            all_passed = False
            
    print("\n" + "=" * 70)
    print(" UNIT_03 AERODYNAMICS HQ SUMMARY AUDIT TABLE")
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
    
    generate_all_aero_levels(target_dir)
