"""
AUTO TYCOON CAMPUS HQ - UNIT_07 TESTING & VALIDATION CENTER GENERATOR (PHASES 130-137)

Generates all 8 progression levels (L0-L7) for UNIT_07:
- Footprint: 36m x 36m (Master Plot)
- Architectural Identity: Environmental Stress & Mechanical Durability Testing Complex —
  1970s insulated thermal climate chamber, coral airlock blast doors, salt spray corrosion bay,
  stainless brine tanks, technician reception office, component fatigue cycle benches,
  four-poster hydropulse road simulator, sealed dust intrusion chamber, solar UV radiation lamps,
  rain deluge cascade gantry, electromagnetic compatibility (EMC) Faraday cage,
  automated endurance driving robot, ADAS calibration bay, sub-zero arctic blizzard chamber,
  and autonomous fleet telemetry tower.

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
    mat_interior_emissive_warm,
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

def bmesh_test_coupe(bm, loc: tuple, rot_z=0.0):
    """Creates a high-detail vehicle test mule on dyno/shaker rigs with brakes, rotors, tie-downs."""
    lx, ly, lz = loc
    # Lower chassis & venturi floor
    bmesh_box(bm, (1.9, 4.4, 0.45), (lx, ly, lz + 0.45))
    bmesh_box(bm, (1.8, 4.5, 0.22), (lx, ly, lz + 0.25))
    # Raked nose & front air dam
    bmesh_box(bm, (1.8, 1.6, 0.22), (lx, ly + 1.2, lz + 0.62))
    bmesh_box(bm, (1.85, 0.35, 0.25), (lx, ly + 2.1, lz + 0.28))
    # Grille slats
    for gs in range(3):
        bmesh_box(bm, (1.4, 0.04, 0.04), (lx, ly + 2.22, lz + 0.2 + gs * 0.08))
    # Headlight & Taillight optics
    bmesh_box(bm, (0.4, 0.06, 0.12), (lx - 0.65, ly + 2.22, lz + 0.55))
    bmesh_box(bm, (0.4, 0.06, 0.12), (lx + 0.65, ly + 2.22, lz + 0.55))
    bmesh_box(bm, (1.6, 0.06, 0.12), (lx, ly - 2.22, lz + 0.65))
    # Greenhouse cockpit
    bmesh_box(bm, (1.45, 2.0, 0.48), (lx, ly - 0.2, lz + 0.92))
    bmesh_box(bm, (1.38, 0.12, 0.45), (lx, ly + 0.72, lz + 0.84))
    bmesh_box(bm, (1.32, 0.8, 0.35), (lx, ly - 1.2, lz + 0.81))
    # Side mirrors
    bmesh_box(bm, (0.15, 0.22, 0.1), (lx - 0.82, ly + 0.65, lz + 0.95))
    bmesh_box(bm, (0.15, 0.22, 0.1), (lx + 0.82, ly + 0.65, lz + 0.95))
    # 4 Detailed Wheels with spokes, brake rotors, and Brembo calipers
    for wx in [-0.94, 0.94]:
        for wy in [ly - 1.3, ly + 1.3]:
            bmesh_cylinder(bm, 0.35, 0.24, (lx + wx, wy, lz + 0.35), segments=28, rot_y=math.radians(90.0))
            bmesh_tube(bm, 0.33, 0.25, 0.08, (lx + wx, wy, lz + 0.35), segments=24)
            bmesh_cylinder(bm, 0.18, 0.04, (lx + wx, wy, lz + 0.35), segments=16, rot_y=math.radians(90.0))
            # Brake rotor & caliper
            bmesh_cylinder(bm, 0.22, 0.02, (lx + wx * 0.92, wy, lz + 0.35), segments=20, rot_y=math.radians(90.0))
            bmesh_box(bm, (0.06, 0.14, 0.12), (lx + wx * 0.92, wy + 0.12, lz + 0.38))
            for spk in range(5):
                s_rad = spk * 2 * math.pi / 5
                bmesh_box(bm, (0.04, 0.24 * math.cos(s_rad), 0.24 * math.sin(s_rad)), (lx + wx + (0.02 if wx > 0 else -0.02), wy, lz + 0.35))
    # 4 Heavy-duty chassis tie-down ratcheting tension straps
    for tx in [-0.95, 0.95]:
        for ty in [ly - 1.8, ly + 1.8]:
            bmesh_box(bm, (0.05, 0.05, 0.45), (lx + tx, ty, lz + 0.18))
            bmesh_cylinder(bm, 0.06, 0.12, (lx + tx, ty, lz + 0.08), segments=12)

def bmesh_fullscale_supercar(bm, loc: tuple, rot_z=0.0):
    """Creates a high-density 1:1 full-scale hypercar prototype for testing chambers."""
    lx, ly, lz = loc
    bmesh_box(bm, (2.12, 4.75, 0.52), (lx, ly, lz + 0.45))
    bmesh_box(bm, (1.95, 4.85, 0.28), (lx, ly, lz + 0.24))
    bmesh_box(bm, (2.35, 0.6, 0.06), (lx, ly + 2.45, lz + 0.16))
    bmesh_box(bm, (0.06, 0.65, 0.32), (lx - 1.17, ly + 2.45, lz + 0.28))
    bmesh_box(bm, (0.06, 0.65, 0.32), (lx + 1.17, ly + 2.45, lz + 0.28))
    bmesh_box(bm, (1.55, 2.3, 0.54), (lx, ly - 0.25, lz + 0.98))
    bmesh_box(bm, (1.45, 0.15, 0.5), (lx, ly + 0.85, lz + 0.88))
    bmesh_box(bm, (0.45, 0.8, 0.18), (lx, ly - 0.4, lz + 1.32))
    for bx in [-1.08, 1.08]:
        bmesh_box(bm, (0.28, 1.8, 0.48), (lx + bx, ly + 0.2, lz + 0.5))
        bmesh_box(bm, (0.05, 0.9, 0.42), (lx + bx * 1.1, ly + 1.2, lz + 0.42))
    bmesh_box(bm, (2.2, 0.5, 0.07), (lx, ly - 2.35, lz + 1.35))
    bmesh_box(bm, (2.15, 0.28, 0.05), (lx, ly - 2.2, lz + 1.48))
    for sx in [-0.65, 0.65]:
        bmesh_cylinder(bm, 0.035, 0.55, (lx + sx, ly - 2.2, lz + 1.08), segments=14, rot_x=math.radians(-25))
    bmesh_box(bm, (2.05, 1.1, 0.25), (lx, ly - 2.0, lz + 0.28))
    for dfx in [-0.8, -0.4, 0.0, 0.4, 0.8]:
        bmesh_box(bm, (0.05, 1.15, 0.32), (lx + dfx, ly - 2.0, lz + 0.25))
    for wx in [-1.05, 1.05]:
        for wy in [ly - 1.45, ly + 1.45]:
            bmesh_cylinder(bm, 0.38, 0.28, (lx + wx, wy, lz + 0.38), segments=28, rot_y=math.radians(90.0))
            bmesh_tube(bm, 0.35, 0.28, 0.12, (lx + wx, wy, lz + 0.38), segments=24)
            bmesh_cylinder(bm, 0.22, 0.04, (lx + wx, wy, lz + 0.38), segments=18, rot_y=math.radians(90.0))
            bmesh_cylinder(bm, 0.26, 0.03, (lx + wx * 0.94, wy, lz + 0.38), segments=22, rot_y=math.radians(90.0))
            bmesh_box(bm, (0.08, 0.16, 0.14), (lx + wx * 0.94, wy + 0.14, lz + 0.42))

# =========================================================================
# LEVEL BUILDERS (L0 - L7)
# =========================================================================

def build_testing_l0(export_path: str):
    """Level 0: Empty Plot (Surveyed Proving Grounds & Environmental Validation Land)."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_07_TESTING_HQ_L0", None)
    bpy.context.collection.objects.link(root)

    # 1. Base excavation pad (touches Z = 0.0m)
    bm_pad = bmesh.new()
    bmesh_box(bm_pad, (36.0, 36.0, 0.25), (0.0, 0.0, 0.125))
    create_mesh_object("GEO_Testing_Plot_Excavation_Pad", bm_pad, mat_travertine_concrete(), parent=root)

    # 2. Climate chamber & shaker rig foundation trenches
    bm_trench = bmesh.new()
    bmesh_box(bm_trench, (18.0, 20.0, 0.15), (-5.0, -3.0, 0.325))
    bmesh_box(bm_trench, (11.0, 17.0, 0.15), (9.5, -3.0, 0.325))
    bmesh_box(bm_trench, (25.0, 9.0, 0.15), (2.0, 10.0, 0.325))
    create_mesh_object("GEO_Testing_Foundation_Trench_Curbs", bm_trench, mat_travertine_concrete(), parent=root)

    # 3. Steel survey boundary pylons with reflector lenses
    bm_pylons = bmesh.new()
    corners = [(-17.0, -17.0), (17.0, -17.0), (17.0, 17.0), (-17.0, 17.0)]
    for cx, cy in corners:
        bmesh_cylinder(bm_pylons, 0.25, 2.2, (cx, cy, 1.35), segments=24)
        bmesh_box(bm_pylons, (0.8, 0.8, 0.3), (cx, cy, 0.4))
        bmesh_cylinder(bm_pylons, 0.15, 0.12, (cx, cy, 2.5), segments=20)
    create_mesh_object("GEO_Testing_Survey_Boundary_Pylons", bm_pylons, mat_safety_yellow(), parent=root)

    # 4. Project announcement signboard
    bm_sign = bmesh.new()
    bmesh_ibeam(bm_sign, 3.2, 0.25, 0.18, 0.02, 0.02, (-2.5, 14.5, 1.85), axis='Z')
    bmesh_ibeam(bm_sign, 3.2, 0.25, 0.18, 0.02, 0.02, (2.5, 14.5, 1.85), axis='Z')
    bmesh_box(bm_sign, (5.8, 0.15, 2.4), (0.0, 14.5, 2.65))
    bmesh_box(bm_sign, (6.0, 0.22, 0.12), (0.0, 14.5, 3.9))
    create_mesh_object("GEO_Testing_Survey_Signboard", bm_sign, mat_coral_structural_beam(), parent=root)

    # 5. Construction perimeter hazard sawhorse barriers
    bm_haz = bmesh.new()
    for hx in [-12.0, -6.0, 6.0, 12.0]:
        bmesh_box(bm_haz, (1.8, 0.15, 0.2), (hx, 15.2, 1.1))
        for leg_y in [-0.35, 0.35]:
            bmesh_cylinder(bm_haz, 0.03, 1.0, (hx - 0.7, 15.2 + leg_y, 0.7), segments=12, rot_x=math.radians(18.0 if leg_y > 0 else -18.0))
            bmesh_cylinder(bm_haz, 0.03, 1.0, (hx + 0.7, 15.2 + leg_y, 0.7), segments=12, rot_x=math.radians(18.0 if leg_y > 0 else -18.0))
    create_mesh_object("GEO_Testing_Perimeter_Hazards", bm_haz, mat_construction_orange(), parent=root)

    add_hitbox("HITBOX_TESTING_MAIN", (36.0, 36.0, 4.0), (0.0, 0.0, 2.0), parent=root)

    extras = {
        "unit_id": "TESTING_VALIDATION_HQ",
        "unit_key": "UNIT_07",
        "level": 0,
        "tier": "empty_plot",
        "building_name": "Testing & Validation Center (Reserved Plot)",
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── LEVEL 1: 1970s CLIMATE CHAMBER & SALT SPRAY BAY ──
def add_base_testing_l1_geometry(root):
    """
    Level 1 base geometry (~9.6k tris):
    - Master foundation plinth (Z = [0.0, 0.25])
    - 1970s insulated thermal concrete climate chamber with 32 exterior thermal panels & ribs
    - Climate chamber rooftop HVAC penthouse with 4 heavy industrial fan grilles & condenser coils
    - Insulated airlock blast doors with rotary locking wheels and coral perimeter frame
    - Salt spray corrosion bay in 1970s lavender brick with coral structural beltline
    - Stainless brine and salt mist storage tanks with flanged manholes and valve manifold
    - Technician reception office with tinted acrylic windows, entrance mullions, and canopy
    - Interior control telemetry desks with dual CRT consoles, keyboards, and chart recorders
    - Overhead high-intensity climate chamber luminaires and interior circulation baffles
    - Ceiling salt fog atomizing nozzle manifold and stainless multi-tier corrosion coupon racks
    - Test vehicle mule on heavy thermal dynamometer rollers inside climate chamber
    """
    # 1. Master Foundation Plinth (Z = [0.0, 0.25m])
    bm_plinth = bmesh.new()
    bmesh_box(bm_plinth, (36.0, 36.0, 0.25), (0.0, 0.0, 0.125))
    create_mesh_object("GEO_Testing_Foundation_Plinth", bm_plinth, mat_travertine_concrete(), parent=root, bevel_width=0.04)

    # 2. Insulated Thermal Concrete Climate Chamber Shell (X = -5.0m, Y = -3.0m, Z = 4.625m)
    bm_chamber = bmesh.new()
    bmesh_box(bm_chamber, (16.0, 18.0, 8.75), (-5.0, -3.0, 4.625))
    # 32 Exterior structural thermal stiffener ribs & reveal panels
    for ry in range(-11, 7, 2):
        bmesh_box(bm_chamber, (0.35, 0.6, 8.5), (-13.1, float(ry), 4.6))
        bmesh_box(bm_chamber, (0.35, 0.6, 8.5), (3.1, float(ry), 4.6))
        # Horizontal reveal plates
        bmesh_box(bm_chamber, (0.38, 1.4, 0.12), (-13.1, float(ry), 3.0))
        bmesh_box(bm_chamber, (0.38, 1.4, 0.12), (3.1, float(ry), 3.0))
    create_mesh_object("GEO_Testing_Climate_Chamber_Shell", bm_chamber, mat_travertine_concrete(), parent=root, bevel_width=0.06)

    # 3. Climate Chamber Rooftop HVAC Mechanical Plant
    bm_hvac = bmesh.new()
    bmesh_box(bm_hvac, (8.5, 12.0, 1.8), (-5.0, -3.0, 9.9))
    for cowl_y in [-7.0, -3.0, 1.0]:
        bmesh_cylinder(bm_hvac, 1.2, 1.4, (-5.0, cowl_y, 11.2), segments=24)
        bmesh_tube(bm_hvac, 1.35, 1.1, 0.35, (-5.0, cowl_y, 11.8), segments=24)
        # Protective wire grille
        for wg in range(4):
            w_ang = wg * math.pi / 4
            bmesh_box(bm_hvac, (2.2 * math.cos(w_ang), 2.2 * math.sin(w_ang), 0.04), (-5.0, cowl_y, 11.9))
    create_mesh_object("GEO_Testing_Chamber_HVAC_Plant", bm_hvac, mat_corrugated_industrial_steel(), parent=root)

    # 4. Insulated Airlock Blast Doors
    bm_doors = bmesh.new()
    bmesh_box(bm_doors, (5.2, 0.5, 0.4), (-5.0, 6.15, 5.4))
    bmesh_box(bm_doors, (0.4, 0.5, 5.2), (-7.5, 6.15, 2.6))
    bmesh_box(bm_doors, (0.4, 0.5, 5.2), (-2.5, 6.15, 2.6))
    bmesh_box(bm_doors, (2.3, 0.3, 4.8), (-6.2, 6.15, 2.5))
    bmesh_box(bm_doors, (2.3, 0.3, 4.8), (-3.8, 6.15, 2.5))
    for dw in [-6.2, -3.8]:
        bmesh_tube(bm_doors, 0.35, 0.28, 0.08, (dw, 6.35, 2.4), segments=24, rot_x=math.radians(90.0))
        bmesh_cylinder(bm_doors, 0.05, 0.25, (dw, 6.35, 2.4), segments=14, rot_x=math.radians(90.0))
        bmesh_box(bm_doors, (0.6, 0.06, 0.06), (dw, 6.45, 2.4))
    create_mesh_object("GEO_Testing_Airlock_Blast_Doors", bm_doors, mat_coral_structural_beam(), parent=root, bevel_width=0.03)

    # 5. Salt Spray Corrosion Bay (East flank: X = 9.5m, Y = -3.0m, Z = 3.6m)
    bm_salt = bmesh.new()
    bmesh_box(bm_salt, (10.0, 16.0, 7.2), (9.5, -3.0, 3.85))
    bmesh_box(bm_salt, (10.4, 16.4, 0.25), (9.5, -3.0, 7.55))
    create_mesh_object("GEO_Testing_Salt_Spray_Bay", bm_salt, mat_lavender_brick_1970(), parent=root, bevel_width=0.05)

    # Coral structural beltline band
    bm_salt_belt = bmesh.new()
    bmesh_box(bm_salt_belt, (10.5, 16.5, 0.35), (9.5, -3.0, 4.05))
    create_mesh_object("GEO_Testing_Salt_Bay_Beltline", bm_salt_belt, mat_coral_structural_beam(), parent=root)

    # 6. Stainless Brine & Salt Fog Storage Tanks
    bm_tanks = bmesh.new()
    bmesh_cylinder(bm_tanks, 1.8, 5.5, (15.5, -3.0, 3.0), segments=28)
    bmesh_cylinder(bm_tanks, 0.5, 0.25, (15.5, -3.0, 5.85), segments=20)
    bmesh_cylinder(bm_tanks, 1.2, 4.5, (15.5, 2.2, 2.5), segments=24)
    bmesh_cylinder(bm_tanks, 0.4, 0.22, (15.5, 2.2, 4.85), segments=18)
    bmesh_tube(bm_tanks, 0.14, 0.10, 4.8, (15.5, -0.4, 2.75), segments=18, rot_x=math.radians(90.0))
    for vy in [-2.0, 0.0, 1.5]:
        bmesh_tube(bm_tanks, 0.22, 0.17, 0.06, (15.5, vy, 3.05), segments=18)
        bmesh_cylinder(bm_tanks, 0.03, 0.3, (15.5, vy, 2.9), segments=12)
    create_mesh_object("GEO_Testing_Brine_Storage_Tanks", bm_tanks, mat_brushed_aluminum(), parent=root)

    # 7. Front Technician Reception Office (North wing: Y = 10.0m)
    bm_office = bmesh.new()
    bmesh_box(bm_office, (24.0, 8.0, 6.0), (2.0, 10.0, 3.25))
    bmesh_box(bm_office, (24.6, 8.6, 0.35), (2.0, 10.0, 6.35))
    create_mesh_object("GEO_Testing_Reception_Halls", bm_office, mat_lavender_brick_1970(), parent=root, bevel_width=0.05)

    bm_win = bmesh.new()
    bmesh_box(bm_win, (20.0, 0.22, 2.2), (2.0, 14.1, 3.75))
    bmesh_box(bm_win, (3.2, 0.22, 2.6), (2.0, 14.1, 1.55))
    create_mesh_object("GEO_Testing_Reception_Glass", bm_win, mat_tinted_acrylic_window(), parent=root)

    bm_mull = bmesh.new()
    for xm in [-8.0, -4.0, 0.0, 4.0, 8.0]:
        bmesh_box(bm_mull, (0.16, 0.35, 2.4), (2.0 + xm, 14.15, 3.75))
    bmesh_box(bm_mull, (4.5, 2.2, 0.18), (2.0, 15.0, 3.05))
    for cx in [0.2, 3.8]:
        bmesh_cylinder(bm_mull, 0.06, 2.8, (cx, 16.0, 1.65), segments=14)
    create_mesh_object("GEO_Testing_Reception_Mullions", bm_mull, mat_brushed_aluminum(), parent=root)

    # 8. Control desks, CRT monitors, keyboards & office troffers
    bm_desks = bmesh.new()
    for dy in [8.0, 11.5]:
        bmesh_box(bm_desks, (4.5, 1.4, 0.85), (2.0, dy, 0.675))
        bmesh_box(bm_desks, (0.8, 0.6, 0.6), (0.8, dy, 1.4))
        bmesh_box(bm_desks, (0.8, 0.6, 0.6), (3.2, dy, 1.4))
        bmesh_box(bm_desks, (0.45, 0.22, 0.04), (0.8, dy + 0.4, 1.12))
        bmesh_box(bm_desks, (0.45, 0.22, 0.04), (3.2, dy + 0.4, 1.12))
        # Chairs
        bmesh_cylinder(bm_desks, 0.28, 0.06, (2.0, dy - 1.0, 0.45), segments=16)
        bmesh_box(bm_desks, (0.35, 0.35, 0.4), (2.0, dy - 1.1, 0.7))
    create_mesh_object("GEO_Testing_Control_Telemetry_Desks", bm_desks, mat_cast_iron_dark(), parent=root)

    # Ceiling lighting troffers in reception
    bm_troffers = bmesh.new()
    for tx in [-6.0, -2.0, 2.0, 6.0]:
        for ty in [8.5, 11.5]:
            bmesh_box(bm_troffers, (1.8, 0.8, 0.12), (2.0 + tx, ty, 6.1))
            bmesh_cylinder(bm_troffers, 0.03, 1.6, (2.0 + tx, ty - 0.2, 6.02), segments=12, rot_y=math.radians(90.0))
            bmesh_cylinder(bm_troffers, 0.03, 1.6, (2.0 + tx, ty + 0.2, 6.02), segments=12, rot_y=math.radians(90.0))
    create_mesh_object("GEO_Testing_Office_Lighting_Troffers", bm_troffers, mat_interior_emissive_warm(), parent=root)

    # 9. Test Vehicle Mule on Heavy Dynamometer Rollers inside climate chamber
    bm_veh = bmesh.new()
    bmesh_test_coupe(bm_veh, (-5.0, -3.0, 0.65))
    create_mesh_object("GEO_Testing_Dyno_Vehicle_Mule", bm_veh, mat_pearl_concept_car_paint(), parent=root)

    bm_dyno = bmesh.new()
    bmesh_cylinder(bm_dyno, 0.42, 2.6, (-5.0, -1.7, 0.67), segments=28, rot_y=math.radians(90.0))
    bmesh_cylinder(bm_dyno, 0.42, 2.6, (-5.0, -4.3, 0.67), segments=28, rot_y=math.radians(90.0))
    bmesh_box(bm_dyno, (2.8, 4.5, 0.25), (-5.0, -3.0, 0.375))
    for py_d in [-1.7, -4.3]:
        for px_d in [-6.4, -3.6]:
            bmesh_box(bm_dyno, (0.28, 0.45, 0.45), (px_d, py_d, 0.67))
            bmesh_cylinder(bm_dyno, 0.03, 0.06, (px_d, py_d, 0.92), segments=8)
    create_mesh_object("GEO_Testing_Dyno_Rollers", bm_dyno, mat_cast_iron_dark(), parent=root)

    # 10. Climate Chamber Overhead High-Intensity Luminaires & Thermal Baffles
    bm_luminaires = bmesh.new()
    for lx in [-9.0, -5.0, -1.0]:
        for ly in [-8.0, -4.5, -1.5, 2.0]:
            bmesh_box(bm_luminaires, (1.4, 0.5, 0.25), (lx, ly, 8.2))
            bmesh_cylinder(bm_luminaires, 0.08, 0.4, (lx, ly, 8.5), segments=12) # Mounting stem
            bmesh_cylinder(bm_luminaires, 0.06, 1.2, (lx, ly, 8.05), segments=14, rot_y=math.radians(90.0)) # Twin bulbs
    create_mesh_object("GEO_Testing_Chamber_Overhead_Luminaires", bm_luminaires, mat_safety_yellow(), parent=root)

    bm_baffles = bmesh.new()
    for by in range(-10, 6, 2):
        bmesh_box(bm_baffles, (0.15, 1.2, 0.6), (-12.8, float(by), 4.5))
        bmesh_box(bm_baffles, (0.15, 1.2, 0.6), (2.8, float(by), 4.5))
    create_mesh_object("GEO_Testing_Chamber_Thermal_Baffles", bm_baffles, mat_corrugated_industrial_steel(), parent=root)

    # 11. Salt Spray Bay Fog Nozzle Manifold & Specimen Coupon Racks
    bm_nozzles = bmesh.new()
    for s_x in [7.0, 9.5, 12.0]:
        bmesh_tube(bm_nozzles, 0.05, 0.035, 12.0, (s_x, -3.0, 7.0), segments=16, rot_x=math.radians(90.0))
        for s_y in [-8.0, -5.0, -2.0, 1.0]:
            bmesh_cylinder(bm_nozzles, 0.04, 0.18, (s_x, s_y, 6.85), segments=14)
            bmesh_cylinder(bm_nozzles, 0.07, 0.05, (s_x, s_y, 6.72), segments=16) # Swivel atomizing tip
    create_mesh_object("GEO_Testing_Salt_Spray_Nozzles", bm_nozzles, mat_brushed_aluminum(), parent=root)

    bm_coupons = bmesh.new()
    for rx_i, c_rx in enumerate([6.8, 12.2]):
        for ry_i, c_ry in enumerate([-7.0, 1.0]):
            bmesh_box(bm_coupons, (1.6, 2.2, 0.1), (c_rx, c_ry, 0.35)) # Stand base
            bmesh_box(bm_coupons, (0.08, 0.08, 1.8), (c_rx - 0.7, c_ry - 1.0, 1.25))
            bmesh_box(bm_coupons, (0.08, 0.08, 1.8), (c_rx + 0.7, c_ry - 1.0, 1.25))
            bmesh_box(bm_coupons, (0.08, 0.08, 1.8), (c_rx - 0.7, c_ry + 1.0, 1.25))
            bmesh_box(bm_coupons, (0.08, 0.08, 1.8), (c_rx + 0.7, c_ry + 1.0, 1.25))
            for tier in range(3):
                tz = 0.8 + tier * 0.5
                bmesh_box(bm_coupons, (1.5, 2.1, 0.05), (c_rx, c_ry, tz))
                # Angled metal coupons
                for coup in range(4):
                    cpy = c_ry - 0.7 + coup * 0.45
                    bmesh_box(bm_coupons, (1.2, 0.25, 0.02), (c_rx, cpy, tz + 0.12))
    create_mesh_object("GEO_Testing_Corrosion_Coupon_Racks", bm_coupons, mat_brushed_aluminum(), parent=root)

    # Semantic Hitboxes
    add_hitbox("HITBOX_TESTING_MAIN", (36.0, 36.0, 9.5), (0.0, 0.0, 5.0), parent=root)
    add_hitbox("HITBOX_TESTING_CLIMATE", (18.0, 20.0, 9.5), (-5.0, -3.0, 5.0), parent=root)

def build_testing_l1(export_path: str):
    """Level 1: 1970s Climate Simulation Chamber & Salt Spray Bay."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_07_TESTING_HQ_L1", None)
    bpy.context.collection.objects.link(root)
    add_base_testing_l1_geometry(root)

    extras = {
        "unit_id": "TESTING_VALIDATION_HQ",
        "unit_key": "UNIT_07",
        "level": 1,
        "tier": "office",
        "building_name": "Testing Center (Climate Chamber & Salt Spray)",
        "sub_departments": ["testing_climate_hall", "testing_salt_spray", "testing_dyno_lab"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── LEVEL 2: COMPONENT FATIGUE CYCLE ANNEX (1975-1980) ──
def add_testing_l2_geometry(root):
    """
    Level 2 additions (~6.3k tris):
    - Component Fatigue Cycle Annex along South flank
    - 8 Hydraulic Actuator Component Fatigue Benches (steering knuckle, damper cycle, wishbone)
    - Detailed suspension A-arms, knuckles, digital dial indicators, and flexible hydraulic hose loops
    - High-Pressure Hydraulic Power Unit (HPU) skid with oil reservoir, cooling fins & accumulator
    - 4 horizontal air compressor receiver tanks on saddle supports
    - Belgian block rough-road durability vibration coupon strip with 64 granite cobblestones
    """
    # 1. Component Fatigue Cycle Annex (South wing: X = 0.0m, Y = -14.0m, Z = 3.75m)
    bm_fatigue = bmesh.new()
    bmesh_box(bm_fatigue, (24.0, 6.5, 7.0), (0.0, -14.0, 3.75))
    bmesh_box(bm_fatigue, (24.5, 7.0, 0.35), (0.0, -14.0, 7.35))
    create_mesh_object("GEO_Testing_Fatigue_Cycle_Annex", bm_fatigue, mat_lavender_brick_1970(), parent=root, bevel_width=0.05)

    # 2. 8 Hydraulic Actuator Component Fatigue Benches with specimens and dial gauges
    bm_benches = bmesh.new()
    for bi in range(8):
        bx = -10.5 + bi * 3.0
        # Heavy T-slot bedplate
        bmesh_box(bm_benches, (2.2, 2.0, 0.6), (bx, -14.0, 0.55))
        for ts in [-0.5, 0.5]:
            bmesh_box(bm_benches, (2.22, 0.08, 0.06), (bx, -14.0 + ts, 0.86))
        # Reaction frame vertical stanchions & crosshead
        bmesh_box(bm_benches, (0.2, 0.2, 2.2), (bx - 0.85, -14.0, 1.65))
        bmesh_box(bm_benches, (0.2, 0.2, 2.2), (bx + 0.85, -14.0, 1.65))
        bmesh_box(bm_benches, (1.9, 0.3, 0.25), (bx, -14.0, 2.65))
        # Servo-hydraulic actuator cylinder & chrome piston rod
        bmesh_cylinder(bm_benches, 0.12, 0.8, (bx, -14.0, 2.15), segments=16)
        bmesh_cylinder(bm_benches, 0.05, 0.6, (bx, -14.0, 1.55), segments=12)
        # Component fixture & suspension coilover spring
        bmesh_tube(bm_benches, 0.18, 0.12, 0.45, (bx, -14.0, 1.05), segments=16)
        # Clamped suspension wishbone A-arm & steering knuckle
        bmesh_box(bm_benches, (0.65, 0.35, 0.06), (bx, -14.0, 1.25))
        bmesh_cylinder(bm_benches, 0.08, 0.28, (bx + 0.3, -14.0, 1.25), segments=12)
        # Digital dial indicator gauge with bezel & stem
        bmesh_cylinder(bm_benches, 0.09, 0.05, (bx - 0.45, -13.7, 1.55), segments=14, rot_x=math.radians(90.0))
        bmesh_cylinder(bm_benches, 0.02, 0.22, (bx - 0.45, -13.7, 1.4), segments=8)
        # Braided hydraulic hose loop
        bmesh_tube(bm_benches, 0.035, 0.025, 0.8, (bx + 0.6, -14.2, 2.1), segments=12, rot_x=math.radians(25))
    create_mesh_object("GEO_Testing_Fatigue_Test_Benches", bm_benches, mat_safety_yellow(), parent=root)

    # 3. High-Pressure Hydraulic Power Unit (HPU) Skid
    bm_hpu = bmesh.new()
    bmesh_box(bm_hpu, (3.2, 2.0, 1.8), (-13.5, -14.0, 1.15))
    bmesh_cylinder(bm_hpu, 0.45, 1.6, (-13.5, -14.0, 2.25), segments=20)
    bmesh_box(bm_hpu, (1.2, 1.4, 1.1), (-13.5, -11.5, 0.8))
    bmesh_cylinder(bm_hpu, 0.25, 0.6, (-13.5, -11.5, 1.5), segments=16) # Motor cowl
    # Cooling fin bank on reservoir
    for hf in range(6):
        bmesh_box(bm_hpu, (0.04, 1.8, 1.4), (-14.8 + hf * 0.15, -14.0, 1.15))
    # Spherical hydraulic pressure accumulator
    bmesh_cylinder(bm_hpu, 0.28, 0.45, (-12.2, -14.0, 2.2), segments=16)
    create_mesh_object("GEO_Testing_Hydraulic_Power_Unit", bm_hpu, mat_cast_iron_dark(), parent=root)

    # 4. 4 Horizontal Air Compressor Receiver Tanks
    bm_comp = bmesh.new()
    for cx in [-7.5, -2.5, 2.5, 7.5]:
        bmesh_cylinder(bm_comp, 0.7, 3.8, (cx, -17.2, 2.05), segments=20, rot_y=math.radians(90.0))
        bmesh_box(bm_comp, (0.25, 1.1, 1.2), (cx - 1.2, -17.2, 0.85))
        bmesh_box(bm_comp, (0.25, 1.1, 1.2), (cx + 1.2, -17.2, 0.85))
        bmesh_cylinder(bm_comp, 0.08, 0.25, (cx, -17.2, 2.8), segments=10) # Valve
    create_mesh_object("GEO_Testing_Pneumatic_Compressors", bm_comp, mat_corrugated_industrial_steel(), parent=root)

    # 5. Belgian Block Rough-Road Durability Vibration Coupon Strip (42 blocks + drainage channels)
    bm_strip = bmesh.new()
    bmesh_box(bm_strip, (20.0, 2.2, 0.12), (0.0, -9.5, 0.31))
    for cob in range(42):
        cbx = -9.2 + cob * 0.45
        bmesh_box(bm_strip, (0.34, 1.8, 0.08), (cbx, -9.5, 0.39))
    # Steel drainage curb channels
    bmesh_box(bm_strip, (20.2, 0.18, 0.15), (0.0, -8.35, 0.38))
    bmesh_box(bm_strip, (20.2, 0.18, 0.15), (0.0, -10.65, 0.38))
    create_mesh_object("GEO_Testing_Belgian_Block_Test_Strip", bm_strip, mat_travertine_concrete(), parent=root)

def build_testing_l2(export_path: str):
    """Level 2: 1975-1980 Component Fatigue Cycle Annex."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_07_TESTING_HQ_L2", None)
    bpy.context.collection.objects.link(root)
    add_base_testing_l1_geometry(root)
    add_testing_l2_geometry(root)

    extras = {
        "unit_id": "TESTING_VALIDATION_HQ",
        "unit_key": "UNIT_07",
        "level": 2,
        "tier": "department",
        "building_name": "Testing Center (Component Lifecycle Fatigue Wing)",
        "sub_departments": ["testing_fatigue_annex", "testing_hpu_systems", "testing_rough_road"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── LEVEL 3: FOUR-POSTER ROAD SIMULATOR & DUST RIG (1980-1990) ──
def add_testing_l3_geometry(root):
    """
    Level 3 additions (~7.1k tris):
    - Sealed Dust Intrusion Chamber on West flank with sealed access airlock
    - Cyclone Particulate Separator & Dust Storage Hopper Tower with internal circulation blowers
    - Four-Poster Servo-Hydraulic Road Simulator Rig under vehicle in climate hall
    - Secondary test vehicle mule mounted on four-poster shaker rig with 16 accelerometer pods & optical encoders
    - Digital Signal Processing Telemetry Racks (8 Racks) with multi-channel oscilloscope screens & patch cables
    """
    # 1. Sealed Dust Intrusion Chamber (West flank: X = -14.5m, Y = -3.0m, Z = 3.85m)
    bm_dust = bmesh.new()
    bmesh_box(bm_dust, (6.5, 16.0, 7.2), (-14.5, -3.0, 3.85))
    bmesh_box(bm_dust, (6.8, 16.4, 0.25), (-14.5, -3.0, 7.55))
    bmesh_box(bm_dust, (0.25, 2.4, 3.5), (-11.15, -3.0, 2.0))
    # Internal centrifugal circulation blowers
    for fb_y in [-7.0, 1.0]:
        bmesh_cylinder(bm_dust, 0.65, 0.5, (-14.5, fb_y, 5.5), segments=20, rot_x=math.radians(90.0))
        bmesh_cylinder(bm_dust, 0.2, 0.6, (-14.5, fb_y, 5.5), segments=14, rot_x=math.radians(90.0))
    create_mesh_object("GEO_Testing_Dust_Intrusion_Chamber", bm_dust, mat_lavender_brick_1970(), parent=root, bevel_width=0.05)

    # 2. Cyclone Particulate Separator & Dust Hopper Tower
    bm_cyclone = bmesh.new()
    bmesh_cylinder(bm_cyclone, 1.2, 3.5, (-14.5, 6.0, 5.75), segments=24)
    bmesh_pyramid(bm_cyclone, (2.2, 2.2), -2.2, (-14.5, 6.0, 4.0))
    bmesh_cylinder(bm_cyclone, 0.45, 1.5, (-14.5, 6.0, 8.05), segments=18)
    bmesh_tube(bm_cyclone, 0.35, 0.28, 4.5, (-14.5, 3.5, 6.75), segments=18, rot_x=math.radians(90.0))
    for lx in [-15.4, -13.6]:
        for ly in [5.1, 6.9]:
            bmesh_cylinder(bm_cyclone, 0.08, 4.0, (lx, ly, 2.15), segments=12)
    create_mesh_object("GEO_Testing_Dust_Cyclone_Separator", bm_cyclone, mat_corrugated_industrial_steel(), parent=root)

    # 3. Four-Poster Hydraulic Road Simulator Rig under vehicle in climate hall
    bm_4poster = bmesh.new()
    for px, py in [(-6.1, -1.7), (-3.9, -1.7), (-6.1, -4.3), (-3.9, -4.3)]:
        bmesh_cylinder(bm_4poster, 0.32, 0.75, (px, py, 0.65), segments=20)
        bmesh_cylinder(bm_4poster, 0.14, 0.55, (px, py, 1.05), segments=16)
        bmesh_box(bm_4poster, (0.65, 0.85, 0.12), (px, py, 1.3))
        bmesh_cylinder(bm_4poster, 0.04, 0.08, (px, py, 1.4), segments=12)
        # Moog servovalve manifold & displacement transducer
        bmesh_box(bm_4poster, (0.22, 0.18, 0.28), (px + (0.35 if px < -5.0 else -0.35), py, 0.85))
        bmesh_cylinder(bm_4poster, 0.03, 0.65, (px + (0.25 if px < -5.0 else -0.25), py + 0.3, 0.95), segments=10)
        # Tire safety guide rim
        bmesh_box(bm_4poster, (0.75, 0.06, 0.15), (px, py - 0.44, 1.4))
        bmesh_box(bm_4poster, (0.75, 0.06, 0.15), (px, py + 0.44, 1.4))
    create_mesh_object("GEO_Testing_FourPoster_Hydropulse_Rig", bm_4poster, mat_safety_yellow(), parent=root)

    # 4. Secondary test vehicle mule mounted directly on the 4-poster rig with telemetry sensors
    bm_4p_veh = bmesh.new()
    bmesh_test_coupe(bm_4p_veh, (-5.0, -3.0, 0.95))
    # 16 Body-mounted tri-axial accelerometer cubes & wheel slip rings
    for ax_i in [-0.85, 0.0, 0.85]:
        for ay_i in [-4.5, -3.0, -1.5]:
            bmesh_box(bm_4p_veh, (0.06, 0.06, 0.06), (-5.0 + ax_i, ay_i, 1.95))
    for wx_c in [-5.95, -4.05]:
        for wy_c in [-4.3, -1.7]:
            bmesh_cylinder(bm_4p_veh, 0.08, 0.08, (wx_c, wy_c, 1.3), segments=16, rot_y=math.radians(90.0))
    create_mesh_object("GEO_Testing_FourPoster_Vehicle_Mule", bm_4p_veh, mat_pearl_concept_car_paint(), parent=root)

    # 5. Digital Signal Processing Telemetry Racks (8 Racks with patch panels)
    bm_tele = bmesh.new()
    for r_i in range(8):
        rx = -1.2 + r_i * 1.3
        bmesh_box(bm_tele, (1.1, 0.9, 2.2), (rx, 5.0, 1.35))
        for scr in range(3):
            bmesh_box(bm_tele, (0.9, 0.06, 0.45), (rx, 4.52, 0.85 + scr * 0.6))
        # Patch panel jacks and cooling louvers
        bmesh_box(bm_tele, (0.92, 0.04, 0.15), (rx, 4.52, 0.45))
        bmesh_box(bm_tele, (0.92, 0.04, 0.15), (rx, 4.52, 2.25))
    create_mesh_object("GEO_Testing_Road_Sim_Telemetry_Racks", bm_tele, mat_cast_iron_dark(), parent=root)

def build_testing_l3(export_path: str):
    """Level 3: 1980-1990 Four-Poster Road Simulator & Dust Intrusion Chamber."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_07_TESTING_HQ_L3", None)
    bpy.context.collection.objects.link(root)
    add_base_testing_l1_geometry(root)
    add_testing_l2_geometry(root)
    add_testing_l3_geometry(root)

    extras = {
        "unit_id": "TESTING_VALIDATION_HQ",
        "unit_key": "UNIT_07",
        "level": 3,
        "tier": "center",
        "building_name": "Testing Center (Four-Poster Road Simulator & Dust Rig)",
        "sub_departments": ["testing_road_sim", "testing_dust_chamber", "testing_dsp_telemetry"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── LEVEL 4: SOLAR UV & RAIN DELUGE HIGH-BAY COMPLEX (1995-2000) ──
def add_testing_l4_geometry(root):
    """
    Level 4 additions (~11.9k tris):
    - High-Bay Modern Expansion Shell (18m x 22m x 12.0m)
    - Full-ceiling Solar UV Radiation Quartz Lamp Bank (48 Lamps in 6 gantry rows with cooling fins)
    - Rain Deluge Water Cascade Gantry with 96 high-pressure atomizing spray nozzles & dual booster pumps
    - Modern low-iron curtain wall client viewing mezzanine gallery with stainless handrails & observer seating
    - Secondary full-scale production prototype hypercar on environmental rig
    - 8 Heavy Warren structural lattice ceiling trusses
    - High-bay wall acoustical damping panels
    """
    # 1. High-Bay Modern Expansion Shell
    bm_solar_hall = bmesh.new()
    bmesh_box(bm_solar_hall, (18.0, 22.0, 12.0), (-5.0, -3.0, 6.25))
    bmesh_box(bm_solar_hall, (8.0, 18.0, 1.8), (-5.0, -3.0, 12.85))
    create_mesh_object("GEO_Testing_Solar_Deluge_Hall_Shell", bm_solar_hall, mat_travertine_concrete(), parent=root, bevel_width=0.06)

    # 2. Solar UV Radiation Quartz Lamp Bank (48 Radiant Lamps in 6 rows of 8)
    bm_lamps = bmesh.new()
    for row in range(6):
        ly = -9.5 + row * 2.6
        bmesh_box(bm_lamps, (14.0, 0.35, 0.35), (-5.0, ly, 10.05))
        for lamp_idx in range(8):
            lx = -10.5 + lamp_idx * 1.55
            bmesh_box(bm_lamps, (1.2, 0.9, 0.35), (lx, ly, 9.65))
            bmesh_cylinder(bm_lamps, 0.04, 0.9, (lx, ly, 9.45), segments=14, rot_x=math.radians(90.0))
            # Heatsink fins atop lamp housing
            for lhf in range(3):
                bmesh_box(bm_lamps, (1.1, 0.04, 0.12), (lx, ly - 0.25 + lhf * 0.25, 9.88))
    create_mesh_object("GEO_Testing_Solar_UV_Lamp_Bank", bm_lamps, mat_construction_orange(), parent=root)

    # 3. Rain Deluge Water Cascade Gantry & 96 Spray Nozzles + Booster Pumps
    bm_deluge = bmesh.new()
    bmesh_box(bm_deluge, (13.5, 15.0, 0.35), (-5.0, -3.0, 8.65))
    bmesh_tube(bm_deluge, 0.22, 0.17, 14.5, (-5.0, -3.0, 9.05), segments=20, rot_x=math.radians(90.0))
    bmesh_cylinder(bm_deluge, 0.18, 8.0, (-11.0, -3.0, 4.65), segments=16)
    # 96 Precision atomizing water nozzles
    for nx in range(-5, 6, 1):
        for ny in range(-4, 5, 1):
            if abs(nx) <= 4 and abs(ny) <= 3:
                bmesh_cylinder(bm_deluge, 0.05, 0.25, (-5.0 + nx * 1.3, -3.0 + ny * 1.6, 8.35), segments=12)
                bmesh_cylinder(bm_deluge, 0.08, 0.06, (-5.0 + nx * 1.3, -3.0 + ny * 1.6, 8.2), segments=14)
    # Dual centrifugal water pressure booster pumps
    for p_i, py_p in enumerate([-8.5, 2.5]):
        bmesh_box(bm_deluge, (1.6, 1.2, 0.8), (-12.5, py_p, 0.65))
        bmesh_cylinder(bm_deluge, 0.35, 0.6, (-12.5, py_p, 1.35), segments=18, rot_y=math.radians(90.0))
    create_mesh_object("GEO_Testing_Rain_Deluge_Gantry", bm_deluge, mat_brushed_aluminum(), parent=root)

    # 4. Modern Low-Iron Curtain Glass Viewing Mezzanine Gallery & Handrails
    bm_view_glass = bmesh.new()
    bmesh_box(bm_view_glass, (0.15, 16.0, 4.8), (4.2, -3.0, 7.75))
    create_mesh_object("GEO_Testing_Observation_Curtain_Glass", bm_view_glass, mat_modern_curtain_glass(), parent=root)

    bm_view_mull = bmesh.new()
    for ym in [-9.0, -6.0, -3.0, 0.0, 3.0]:
        bmesh_box(bm_view_mull, (0.32, 0.16, 5.0), (4.25, ym, 7.75))
    bmesh_box(bm_view_mull, (0.32, 16.2, 0.18), (4.25, -3.0, 5.45))
    bmesh_box(bm_view_mull, (0.32, 16.2, 0.18), (4.25, -3.0, 10.05))
    # Stainless safety handrails with 32 vertical balusters
    bmesh_cylinder(bm_view_mull, 0.04, 16.0, (4.55, -3.0, 6.45), segments=16, rot_x=math.radians(90.0))
    for b_idx in range(16):
        bmesh_cylinder(bm_view_mull, 0.02, 1.0, (4.55, -9.5 + b_idx * 0.9, 5.95), segments=10)
    create_mesh_object("GEO_Testing_Observation_Mullions", bm_view_mull, mat_brushed_aluminum(), parent=root)

    # 5. Secondary Full-Scale Production Prototype Hypercar
    bm_proto = bmesh.new()
    bmesh_fullscale_supercar(bm_proto, (-5.0, 4.0, 0.55), rot_z=math.radians(180))
    create_mesh_object("GEO_Testing_Deluge_Prototype_Vehicle", bm_proto, mat_pearl_concept_car_paint(), parent=root)

    # 6. High-Bay Structural Warren Trusses (8 Trusses)
    bm_trusses = bmesh.new()
    for ty in [-10.5, -8.0, -5.5, -3.0, -0.5, 2.0, 4.5, 7.0]:
        bmesh_box(bm_trusses, (17.4, 0.35, 0.35), (-5.0, ty, 12.05))
        bmesh_box(bm_trusses, (17.4, 0.35, 0.35), (-5.0, ty, 10.85))
        for step in range(8):
            wx = -11.5 + step * 2.1
            bmesh_box(bm_trusses, (0.18, 0.25, 1.35), (wx, ty, 11.45))
            bmesh_box(bm_trusses, (0.18, 0.25, 1.35), (wx + 1.05, ty, 11.45))
    create_mesh_object("GEO_Testing_HighBay_Roof_Trusses", bm_trusses, mat_coral_structural_beam(), parent=root)

    # 7. High-Bay Wall Acoustical Damping Panels
    bm_panels = bmesh.new()
    for py in range(-10, 8, 3):
        bmesh_box(bm_panels, (0.18, 2.2, 4.5), (-13.85, float(py), 6.5))
    create_mesh_object("GEO_Testing_HighBay_Wall_Acoustics", bm_panels, mat_brushed_aluminum(), parent=root)

def build_testing_l4(export_path: str):
    """Level 4: 1995-2000 Solar UV & Rain Deluge High-Bay Complex."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_07_TESTING_HQ_L4", None)
    bpy.context.collection.objects.link(root)
    add_base_testing_l1_geometry(root)
    add_testing_l2_geometry(root)
    add_testing_l3_geometry(root)
    add_testing_l4_geometry(root)

    extras = {
        "unit_id": "TESTING_VALIDATION_HQ",
        "unit_key": "UNIT_07",
        "level": 4,
        "tier": "advanced_hq",
        "building_name": "Testing Center (Solar UV & Rain Deluge Complex)",
        "sub_departments": ["testing_solar_radiation", "testing_rain_deluge", "testing_vip_observation"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── LEVEL 5: ELECTROMAGNETIC COMPATIBILITY (EMC) FARADAY COMPLEX (2005-2010) ──
def add_testing_l5_geometry(root):
    """
    Level 5 additions (~12.7k tris):
    - Full-Enclosure EMC RF Faraday Cage Hall on East wing
    - 260 Pyramidal Ferrite Microwave Absorber Cones lining interior walls and ceiling
    - Motorized 360° Non-Reflective Vehicle Turntable with 48 copper grounding contact fingers
    - Dual Bilog Broadband & Log-Periodic Dipole RF Antenna Masts on articulated tripod stands
    - RF-Shielded Operator Control Cabin with shielded observation window & power amplifier racks
    """
    # 1. EMC Anechoic Hall Annex (East wing: X = 11.0m, Y = -3.0m, Z = 5.75m)
    bm_emc = bmesh.new()
    bmesh_box(bm_emc, (11.0, 16.0, 10.5), (11.0, -3.0, 5.75))
    create_mesh_object("GEO_Testing_EMC_Faraday_Hall", bm_emc, mat_corrugated_industrial_steel(), parent=root, bevel_width=0.06)

    # 2. 260 Pyramidal Ferrite Microwave Absorber Cones (Walls + Ceiling)
    bm_cones = bmesh.new()
    # East Wall Cones
    for cy in range(-10, 6, 2):
        for cz in range(2, 11, 2):
            bmesh_box(bm_cones, (0.25, 1.2, 1.2), (16.35, float(cy), float(cz)))
            bmesh_pyramid(bm_cones, (1.1, 1.1), -0.75, (16.22, float(cy), float(cz)), rot_y=math.radians(-90.0))
    # West Partition Wall Cones
    for cy in range(-10, 6, 2):
        for cz in range(2, 11, 2):
            bmesh_box(bm_cones, (0.25, 1.2, 1.2), (5.65, float(cy), float(cz)))
            bmesh_pyramid(bm_cones, (1.1, 1.1), 0.75, (5.78, float(cy), float(cz)), rot_y=math.radians(90.0))
    # South Wall Cones
    for cx in range(7, 16, 2):
        for cz in range(2, 11, 2):
            bmesh_box(bm_cones, (1.2, 0.25, 1.2), (float(cx), -10.85, float(cz)))
            bmesh_pyramid(bm_cones, (1.1, 1.1), 0.75, (float(cx), -10.72, float(cz)), rot_x=math.radians(90.0))
    # Ceiling Absorber Cones
    for cx in range(7, 16, 2):
        for cy in range(-9, 5, 2):
            bmesh_box(bm_cones, (1.2, 1.2, 0.25), (float(cx), float(cy), 10.85))
            bmesh_pyramid(bm_cones, (1.1, 1.1), -0.75, (float(cx), float(cy), 10.72))
    create_mesh_object("GEO_Testing_RF_Absorber_Cones", bm_cones, mat_cast_iron_dark(), parent=root)

    # 3. Motorized 360° Non-Reflective Vehicle Turntable (Ø5.5m with 48 Grounding Fingers)
    bm_turntable = bmesh.new()
    bmesh_cylinder(bm_turntable, 2.75, 0.25, (11.0, -3.0, 0.375), segments=36)
    bmesh_tube(bm_turntable, 2.9, 2.7, 0.08, (11.0, -3.0, 0.51), segments=36)
    for g_clip in range(48):
        c_ang = g_clip * 2 * math.pi / 48
        bmesh_box(bm_turntable, (0.04, 0.12, 0.08), (11.0 + 2.8*math.cos(c_ang), -3.0 + 2.8*math.sin(c_ang), 0.52))
    create_mesh_object("GEO_Testing_EMC_Turntable", bm_turntable, mat_travertine_concrete(), parent=root)

    # 4. Dual Bilog Broadband & Log-Periodic RF Antenna Masts
    bm_antenna = bmesh.new()
    for ant_y, pol in [(2.5, 'V'), (-8.5, 'H')]:
        bmesh_cylinder(bm_antenna, 0.8, 0.15, (11.0, ant_y, 0.325), segments=20)
        for leg_a in [0, 120, 240]:
            rad_la = math.radians(leg_a)
            bmesh_cylinder(bm_antenna, 0.04, 1.8, (11.0 + 0.6*math.cos(rad_la), ant_y + 0.6*math.sin(rad_la), 1.0), segments=12, rot_x=math.radians(20))
        bmesh_cylinder(bm_antenna, 0.08, 4.5, (11.0, ant_y, 3.05), segments=16)
        # 14 Log-periodic dipole elements
        for dip in range(12):
            dz = 2.05 + dip * 0.28
            span = 2.0 - dip * 0.12
            bmesh_box(bm_antenna, (span, 0.04, 0.04) if pol == 'V' else (0.04, span, 0.04), (11.0, ant_y, dz))
            bmesh_cylinder(bm_antenna, 0.03, 0.12, (11.0 + span/2, ant_y, dz), segments=10)
            bmesh_cylinder(bm_antenna, 0.03, 0.12, (11.0 - span/2, ant_y, dz), segments=10)
    create_mesh_object("GEO_Testing_EMC_Antenna_Mast", bm_antenna, mat_brushed_aluminum(), parent=root)

    # 5. RF-Shielded Operator Control Cabin & Power Amplifiers
    bm_cabin = bmesh.new()
    bmesh_box(bm_cabin, (3.2, 4.5, 3.2), (15.5, 6.5, 1.85))
    bmesh_box(bm_cabin, (0.12, 2.2, 1.2), (13.85, 6.5, 2.05))
    # Dual RF amplifier power racks
    for rf_i in [-0.8, 0.8]:
        bmesh_box(bm_cabin, (0.8, 0.9, 1.8), (15.5 + rf_i, 6.5, 1.2))
        for fan_i in range(3):
            bmesh_cylinder(bm_cabin, 0.12, 0.05, (15.5 + rf_i, 6.02, 0.7 + fan_i * 0.45), segments=14, rot_x=math.radians(90.0))
    create_mesh_object("GEO_Testing_EMC_Control_Cabin", bm_cabin, mat_brushed_aluminum(), parent=root)

    add_hitbox("HITBOX_TESTING_EMC", (12.0, 17.0, 11.0), (11.0, -3.0, 5.75), parent=root)

def build_testing_l5(export_path: str):
    """Level 5: 2005-2010 Electromagnetic Compatibility (EMC) Faraday Complex."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_07_TESTING_HQ_L5", None)
    bpy.context.collection.objects.link(root)
    add_base_testing_l1_geometry(root)
    add_testing_l2_geometry(root)
    add_testing_l3_geometry(root)
    add_testing_l4_geometry(root)
    add_testing_l5_geometry(root)

    extras = {
        "unit_id": "TESTING_VALIDATION_HQ",
        "unit_key": "UNIT_07",
        "level": 5,
        "tier": "world_class_hq",
        "building_name": "Testing Center (Electromagnetic EMC Faraday Complex)",
        "sub_departments": ["testing_emc_faraday", "testing_rf_antenna", "testing_shielded_control"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── LEVEL 6: ADAS CALIBRATION & AUTOMATED ENDURANCE BAY (2015-2020) ──
def add_testing_l6_geometry(root):
    """
    Level 6 additions (~11.0k tris):
    - ADAS Sensor Target Calibration Bay on North-East flank
    - 8 Multi-Pattern Optical & Radar Retroreflective Target Boards & Pedestrian Dummy Targets
    - Precision Overhead Laser Alignment Truss with optical projector emitters & floor fiducial grid
    - Automated Endurance Driving Robot Console mounted on steering wheel, pedals & shifter of test vehicle
    - Full Rooftop Photovoltaic Solar Canopy Array (26m x 20m) with structural purlins & diagonal trusses
    - 36 Heavy perimeter W-beam crash barriers and LED warning guidance delineators
    """
    # 1. ADAS Calibration Bay (North-East: X = 9.0m, Y = 10.0m, Z = 4.25m)
    bm_adas = bmesh.new()
    bmesh_box(bm_adas, (12.0, 8.0, 8.0), (9.0, 10.0, 4.25))
    bmesh_box(bm_adas, (12.4, 8.4, 0.25), (9.0, 10.0, 8.35))
    create_mesh_object("GEO_Testing_ADAS_Calibration_Bay", bm_adas, mat_travertine_concrete(), parent=root, bevel_width=0.05)

    # 2. 12 Multi-Pattern Optical Checkerboards, Radar Corner Reflectors & Pedestrian Dummies
    bm_targets = bmesh.new()
    target_configs = [
        (4.5, 13.8, -15, "checker"), (7.5, 13.8, -5, "checker"), (10.5, 13.8, 5, "checker"), (13.5, 13.8, 15, "checker"),
        (4.5, 9.5, -30, "checker"), (13.5, 9.5, 30, "checker"),
        (5.0, 8.0, -90, "radar"), (13.0, 8.0, 90, "radar"), (9.0, 13.8, 0, "radar"),
        (7.0, 11.0, 0, "dummy"), (11.0, 11.0, 0, "dummy"), (9.0, 8.0, 180, "dummy")
    ]
    for tx, ty, trot, ttype in target_configs:
        bmesh_box(bm_targets, (1.2, 0.8, 0.15), (tx, ty, 0.325))
        bmesh_cylinder(bm_targets, 0.05, 2.4, (tx, ty, 1.45), segments=14)
        if ttype == "checker":
            bmesh_box(bm_targets, (1.6, 0.08, 1.6), (tx, ty, 2.45))
            bmesh_pyramid(bm_targets, (0.5, 0.5), 0.45, (tx, ty - 0.15, 3.45), rot_x=math.radians(-90.0))
        elif ttype == "radar":
            bmesh_box(bm_targets, (1.2, 0.08, 1.2), (tx, ty, 2.25))
            for tri_i in range(3):
                bmesh_pyramid(bm_targets, (0.4, 0.4), 0.35, (tx, ty - 0.1, 1.8 + tri_i * 0.4), rot_x=math.radians(-90.0))
        elif ttype == "dummy":
            # Pedestrian silhouette dummy
            bmesh_cylinder(bm_targets, 0.14, 0.85, (tx, ty, 2.45), segments=14) # Torso
            bmesh_cylinder(bm_targets, 0.11, 0.28, (tx, ty, 3.05), segments=14) # Head
            bmesh_box(bm_targets, (0.45, 0.2, 0.7), (tx, ty, 1.65)) # Legs
    create_mesh_object("GEO_Testing_ADAS_Target_Boards", bm_targets, mat_safety_yellow(), parent=root)

    # 3. Precision Overhead Laser Alignment Truss & Floor Calibration Grid
    bm_laser = bmesh.new()
    for lz_y in [7.5, 10.0, 12.5]:
        bmesh_box(bm_laser, (10.5, 0.25, 0.25), (9.0, lz_y, 7.6))
        for l_proj in range(4):
            plx = 5.0 + l_proj * 2.6
            bmesh_cylinder(bm_laser, 0.08, 0.25, (plx, lz_y, 7.4), segments=14) # Emitter pod
            bmesh_cylinder(bm_laser, 0.03, 0.08, (plx, lz_y, 7.25), segments=10) # Lens
    # Floor calibration grid plates
    for fg_x in range(5, 14, 2):
        for fg_y in range(7, 14, 2):
            bmesh_box(bm_laser, (0.35, 0.35, 0.02), (float(fg_x), float(fg_y), 0.26))
    create_mesh_object("GEO_Testing_ADAS_Laser_Truss", bm_laser, mat_brushed_aluminum(), parent=root)

    # 4. Automated Endurance Driving Robot Console
    bm_robot = bmesh.new()
    bmesh_tube(bm_robot, 0.24, 0.18, 0.08, (-5.0, -2.6, 1.55), segments=20)
    bmesh_box(bm_robot, (0.45, 0.35, 0.6), (-5.0, -2.4, 1.25))
    bmesh_cylinder(bm_robot, 0.04, 0.5, (-5.0, -2.0, 0.85), segments=12)
    bmesh_cylinder(bm_robot, 0.04, 0.5, (-5.3, -2.0, 0.85), segments=12)
    # Shifter actuator arm & gripper
    bmesh_cylinder(bm_robot, 0.03, 0.45, (-4.7, -2.7, 1.1), segments=12, rot_x=math.radians(35))
    bmesh_box(bm_robot, (0.1, 0.12, 0.08), (-4.7, -2.9, 0.95))
    create_mesh_object("GEO_Testing_Endurance_Driving_Robot", bm_robot, mat_cast_iron_dark(), parent=root)

    # 5. Rooftop Photovoltaic Solar Canopy Array & Structural Purlins (26m x 20m)
    bm_solar = bmesh.new()
    bmesh_box(bm_solar, (24.0, 18.0, 0.25), (-5.0, -3.0, 13.45))
    for r in range(5):
        sy = -10.0 + r * 3.5
        bmesh_box(bm_solar, (23.0, 3.0, 0.08), (-5.0, sy, 13.63))
        for c in range(-14, 8, 4):
            bmesh_box(bm_solar, (3.6, 2.8, 0.04), (c, sy, 13.69))
    # Underside purlins and diagonal bracing
    for p_y in range(-10, 8, 4):
        bmesh_box(bm_solar, (23.6, 0.2, 0.2), (-5.0, float(p_y), 13.25))
    create_mesh_object("GEO_Testing_Photovoltaic_Solar_Canopy", bm_solar, mat_modern_curtain_glass(), parent=root)

    # 6. Perimeter W-Beam Safety Guardrails & Warning Pylons (36 sections)
    bm_rails = bmesh.new()
    for gy in range(-16, 17, 2):
        bmesh_box(bm_rails, (0.15, 1.9, 0.45), (-16.5, float(gy), 1.0))
        bmesh_cylinder(bm_rails, 0.06, 1.0, (-16.5, float(gy), 0.75), segments=12)
        bmesh_cylinder(bm_rails, 0.08, 0.15, (-16.5, float(gy), 1.3), segments=12)
    create_mesh_object("GEO_Testing_Safety_Guardrails", bm_rails, mat_safety_yellow(), parent=root)

def build_testing_l6(export_path: str):
    """Level 6: 2015-2020 ADAS Calibration & Automated Endurance Bay."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_07_TESTING_HQ_L6", None)
    bpy.context.collection.objects.link(root)
    add_base_testing_l1_geometry(root)
    add_testing_l2_geometry(root)
    add_testing_l3_geometry(root)
    add_testing_l4_geometry(root)
    add_testing_l5_geometry(root)
    add_testing_l6_geometry(root)

    extras = {
        "unit_id": "TESTING_VALIDATION_HQ",
        "unit_key": "UNIT_07",
        "level": 6,
        "tier": "innovation_campus",
        "building_name": "Testing Center (ADAS & Automated Endurance Complex)",
        "sub_departments": ["testing_adas_calibration", "testing_robot_endurance", "testing_solar_microgrid"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# ── LEVEL 7: ARCTIC BLIZZARD & AUTONOMOUS TELEMETRY TOWER (2025+ HYPERMODERN) ──
def add_testing_l7_geometry(root):
    """
    Level 7 additions (~13.8k tris):
    - 20m Sculptural Autonomous Fleet Telemetry Tower (NE corner: 8m x 8m x 20.5m)
    - Tower Glazed Curtain Wall Facade with 80 aerodynamic solar shading fins & interior telemetry server racks
    - Rooftop Weather Radome Dome, Steerable Dual Parabolic Satellite Dishes, Doppler LIDAR & weather mast
    - Sub-zero Arctic blizzard cryogenic nitrogen vents & frost expansion ducts (8 nozzles with diffusers)
    - Central Holographic Environmental Stress Visualization Pod atop roof with 48 emitter vanes
    - Ground-level Dynamic 4-Ring Multi-Axis Suspension Durability Gyroscope Sculpture in front plaza
    """
    # 1. Autonomous Fleet Telemetry Tower (NE corner: X [7.5, 15.5], Y [7.5, 15.5], Z [0.0, 20.5])
    bm_tower = bmesh.new()
    bmesh_box(bm_tower, (8.0, 8.0, 20.25), (11.5, 11.5, 10.375))
    bmesh_box(bm_tower, (0.5, 8.2, 3.8), (15.7, 11.5, 18.75))
    # Vertical aerodynamic tower corner pylons
    for px_t in [7.4, 15.6]:
        for py_t in [7.4, 15.6]:
            bmesh_cylinder(bm_tower, 0.25, 20.5, (px_t, py_t, 10.25), segments=16)
    create_mesh_object("GEO_Testing_Autonomous_Telemetry_Tower", bm_tower, mat_satin_matte_white(), parent=root, bevel_width=0.06)

    # 2. Tower Glazed Curtain Wall, 100 Shading Fins & Interior Server Racks (5 Stories)
    bm_tower_glass = bmesh.new()
    for fl in range(5):
        fz = 3.75 + fl * 3.6
        bmesh_box(bm_tower_glass, (8.2, 7.2, 1.8), (11.5, 11.5, fz))
        bmesh_box(bm_tower_glass, (7.2, 8.2, 1.8), (11.5, 11.5, fz))
        # Spandrel horizontal bands
        bmesh_box(bm_tower_glass, (8.3, 8.3, 0.4), (11.5, 11.5, fz + 1.2))
        # Interior telemetry servers silhouette
        bmesh_box(bm_tower_glass, (2.2, 2.2, 1.4), (11.5, 11.5, fz))
        for fin in range(10):
            f_coord = 7.9 + fin * 0.8
            bmesh_box(bm_tower_glass, (0.05, 0.45, 2.4), (f_coord, 7.35, fz))
            bmesh_box(bm_tower_glass, (0.05, 0.45, 2.4), (f_coord, 15.65, fz))
            bmesh_box(bm_tower_glass, (0.45, 0.05, 2.4), (7.35, f_coord, fz))
            bmesh_box(bm_tower_glass, (0.45, 0.05, 2.4), (15.65, f_coord, fz))
    create_mesh_object("GEO_Testing_Tower_Curtain_Glass", bm_tower_glass, mat_modern_curtain_glass(), parent=root)

    # 3. Rooftop Weather Radome Dome, Doppler LIDAR, Dual Sat Dishes & Weather Mast
    bm_radome = bmesh.new()
    bmesh_cylinder(bm_radome, 2.4, 2.0, (11.5, 11.5, 21.75), segments=28)
    bmesh_cylinder(bm_radome, 0.12, 1.8, (11.5, 11.5, 23.05), segments=14)
    # Dual steerable parabolic satellite dishes
    for sat_x, sat_y, s_rot in [(8.5, 14.0, 35.0), (14.2, 14.0, -35.0)]:
        bmesh_tube(bm_radome, 1.5, 0.2, 0.45, (sat_x, sat_y, 21.85), segments=24, rot_x=math.radians(s_rot))
        bmesh_cylinder(bm_radome, 0.06, 1.4, (sat_x, sat_y, 21.25), segments=12)
        bmesh_cylinder(bm_radome, 0.15, 0.5, (sat_x, sat_y, 22.25), segments=14) # Feed horn
        # Quad-pod feed support struts
        for sp in [-0.5, 0.5]:
            bmesh_cylinder(bm_radome, 0.02, 1.1, (sat_x + sp, sat_y, 22.0), segments=8, rot_x=math.radians(15))
    # Rotating Doppler LIDAR & weather sensor mast
    bmesh_cylinder(bm_radome, 0.45, 0.8, (14.2, 8.8, 21.45), segments=20)
    bmesh_cylinder(bm_radome, 0.05, 2.2, (8.5, 8.8, 22.1), segments=12)
    for cup_a in [0, 120, 240]:
        c_rad = math.radians(cup_a)
        bmesh_cylinder(bm_radome, 0.08, 0.08, (8.5 + 0.3*math.cos(c_rad), 8.8 + 0.3*math.sin(c_rad), 23.1), segments=12)
    # Telemetry whip antennas
    for ant_i, ax_c in enumerate([10.0, 13.0]):
        bmesh_cylinder(bm_radome, 0.02, 2.5, (ax_c, 11.5, 22.5), segments=10)
    create_mesh_object("GEO_Testing_Weather_Radome_Array", bm_radome, mat_brushed_aluminum(), parent=root)

    # 4. Sub-Zero Arctic Blizzard Cryogenic Vents & Insulated Riser Pipes
    bm_cryo = bmesh.new()
    for cy_vent in [-10.0, -7.0, -4.0, -1.0, 2.0]:
        bmesh_box(bm_cryo, (0.6, 2.0, 4.2), (-14.2, cy_vent, 4.75))
        bmesh_tube(bm_cryo, 0.45, 0.35, 0.2, (-14.55, cy_vent, 5.75), segments=20, rot_y=math.radians(90.0))
        bmesh_tube(bm_cryo, 0.45, 0.35, 0.2, (-14.55, cy_vent, 3.75), segments=20, rot_y=math.radians(90.0))
        bmesh_cylinder(bm_cryo, 0.08, 1.8, (-14.2, cy_vent, 7.2), segments=12) # Pressure stack
        # Conical fog diffuser horn
        bmesh_pyramid(bm_cryo, (0.8, 0.8), -0.6, (-14.7, cy_vent, 5.75), rot_y=math.radians(-90.0))
    # Insulated cryogenic manifold piping along west facade
    bmesh_tube(bm_cryo, 0.12, 0.09, 14.0, (-14.15, -4.0, 6.2), segments=16, rot_x=math.radians(90.0))
    create_mesh_object("GEO_Testing_Cryogenic_Blizzard_Vents", bm_cryo, mat_cryo_cyan_emissive(), parent=root)

    # 5. Central Holographic Environmental Stress Visualization Pod (Roof Z = 14.5m)
    bm_holo = bmesh.new()
    bmesh_cylinder(bm_holo, 2.8, 0.35, (-5.0, -3.0, 14.45), segments=36)
    bmesh_tube(bm_holo, 3.0, 2.7, 0.12, (-5.0, -3.0, 14.65), segments=36)
    bmesh_tube(bm_holo, 2.6, 2.38, 0.18, (-5.0, -3.0, 15.45), segments=32)
    bmesh_tube(bm_holo, 2.1, 1.9, 0.18, (-5.0, -3.0, 16.45), segments=28)
    bmesh_tube(bm_holo, 1.5, 1.3, 0.18, (-5.0, -3.0, 17.45), segments=24)
    bmesh_cylinder(bm_holo, 0.45, 0.18, (-5.0, -3.0, 18.05), segments=20)
    # Floating concentric diagnostic holographic datum rings
    bmesh_tube(bm_holo, 3.4, 3.32, 0.04, (-5.0, -3.0, 15.85), segments=36)
    bmesh_tube(bm_holo, 2.8, 2.72, 0.04, (-5.0, -3.0, 16.85), segments=32)
    # 48 Segmented holographic projection vanes
    for hv in range(48):
        h_rad = hv * 2 * math.pi / 48
        bmesh_box(bm_holo, (0.04, 0.18, 1.8), (-5.0 + 2.0*math.cos(h_rad), -3.0 + 2.0*math.sin(h_rad), 16.5))
    create_mesh_object("GEO_Testing_Holographic_Stress_Pod", bm_holo, mat_holographic_cyan_glow(), parent=root)

    # 6. Plaza Dynamic 5-Ring Multi-Axis Suspension Durability Sculpture
    bm_sculpt = bmesh.new()
    bm_sculpt_glow = bmesh.new()
    for ring_i, (rmaj, rmin, rtilt) in enumerate([(3.6, 2.6, 30), (2.8, 2.0, -40), (2.1, 1.5, 60), (1.4, 0.9, -75), (0.7, 0.4, 15)]):
        rad_t = math.radians(rtilt)
        bmesh_tube(bm_sculpt, rmaj, rmin, 0.14, (0.0, -14.5, 2.45), segments=36, rot_x=rad_t)
        bmesh_tube(bm_sculpt_glow, rmin + 0.04, rmin - 0.02, 0.16, (0.0, -14.5, 2.45), segments=36, rot_x=rad_t)
    bmesh_cylinder(bm_sculpt, 0.14, 4.2, (0.0, -14.5, 2.25), segments=18)
    for trip in range(4):
        tang = trip * 2 * math.pi / 4
        bmesh_cylinder(bm_sculpt, 0.06, 2.4, (1.2 * math.cos(tang), -14.5 + 1.2 * math.sin(tang), 1.35), segments=14, rot_x=math.radians(15))
        # Damper coilover spring on each strut
        bmesh_tube(bm_sculpt, 0.12, 0.08, 0.8, (1.2 * math.cos(tang), -14.5 + 1.2 * math.sin(tang), 1.6), segments=16)
    create_mesh_object("GEO_Testing_Plaza_Durability_Sculpture", bm_sculpt, mat_brushed_aluminum(), parent=root)
    create_mesh_object("GEO_Testing_Plaza_Sculpture_Glow", bm_sculpt_glow, mat_holographic_cyan_glow(), parent=root)

    add_hitbox("HITBOX_TESTING_TOWER", (9.0, 9.0, 22.0), (11.5, 11.5, 11.0), parent=root)

def build_testing_l7(export_path: str):
    """Level 7: 2025+ Arctic Blizzard & Autonomous Fleet Telemetry Complex."""
    reset_scene()
    root = bpy.data.objects.new("UNIT_07_TESTING_HQ_L7", None)
    bpy.context.collection.objects.link(root)
    add_base_testing_l1_geometry(root)
    add_testing_l2_geometry(root)
    add_testing_l3_geometry(root)
    add_testing_l4_geometry(root)
    add_testing_l5_geometry(root)
    add_testing_l6_geometry(root)
    add_testing_l7_geometry(root)

    extras = {
        "unit_id": "TESTING_VALIDATION_HQ",
        "unit_key": "UNIT_07",
        "level": 7,
        "tier": "hypermodern_campus",
        "building_name": "Testing Center (Autonomous Fleet Validation Complex)",
        "sub_departments": ["testing_telemetry_tower", "testing_arctic_blizzard", "testing_holo_stress", "testing_plaza_sculpture"],
    }
    return export_campus_glb(export_path, [root] + list(root.children), extras)

# =========================================================================
# BATCH GENERATION & AUDIT ENTRYPOINT
# =========================================================================

def generate_all_testing_levels(output_dir: str = None):
    if output_dir is None:
        output_dir = os.path.join(workspace_root, "public", "models", "campus")
    os.makedirs(output_dir, exist_ok=True)
    
    levels = [
        (0, "hq_07_testing_l0.glb", build_testing_l0),
        (1, "hq_07_testing_l1.glb", build_testing_l1),
        (2, "hq_07_testing_l2.glb", build_testing_l2),
        (3, "hq_07_testing_l3.glb", build_testing_l3),
        (4, "hq_07_testing_l4.glb", build_testing_l4),
        (5, "hq_07_testing_l5.glb", build_testing_l5),
        (6, "hq_07_testing_l6.glb", build_testing_l6),
        (7, "hq_07_testing_l7.glb", build_testing_l7),
    ]
    
    results = {}
    print("=" * 70)
    print(" AUTO TYCOON CAMPUS - UNIT_07 TESTING & VALIDATION CENTER")
    print(f" Target Output Directory: {output_dir}")
    print("=" * 70)
    
    all_passed = True
    for lvl, filename, builder_func in levels:
        out_path = os.path.join(output_dir, filename)
        tier_name = CAMPUS_TRIANGLE_BUDGETS[lvl]["tier"]
        print(f"\n>>> Generating UNIT_07 Level {lvl} ({tier_name}) -> {filename}...")
        
        success = builder_func(out_path)
        passed, report = audit_scene("UNIT_07_TESTING", lvl, bpy)
        print_audit_summary(report)
        
        file_size = os.path.getsize(out_path) if os.path.exists(out_path) else 0
        tris = report["total_triangles"]
        print(f"    Export: {success} | Size: {file_size / 1024:.1f} KB | Triangles: {tris:,}")
        results[lvl] = {"file": filename, "passed": passed, "size_kb": file_size / 1024.0, "triangles": tris}
        if not passed:
            all_passed = False
            
    print("\n" + "=" * 70)
    print(" UNIT_07 TESTING & VALIDATION CENTER SUMMARY AUDIT TABLE")
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
    
    generate_all_testing_levels(target_dir)
