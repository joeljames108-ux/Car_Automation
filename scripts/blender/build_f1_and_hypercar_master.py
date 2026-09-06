"""
==============================================================================
BLENDER 5.2 MASTER AUTOMOTIVE PIPELINE: FORMULA 1 & HYPERCAR MODULAR SYSTEM
==============================================================================
High-Fidelity Class-A CAD Procedural Generator & Exporter for:
1. Formula 1 2024+ Grand Prix Race Car (Car_F1_Complete.glb)
2. 25 Individual Modular F1 Component GLBs matching f1ComponentRegistry.ts
3. Apex GT3 Track Hypercar (Car_GT3_Supercar_Complete.glb / Car_Hypercar_Complete.glb)
4. 20 Individual Modular Hypercar Component GLBs
5. Photorealistic Studio Beauty Showcase Renders (Hero & Exploded Modular Views)
==============================================================================
"""

import bpy
import bmesh
import math
import os
import shutil
import sys
from mathutils import Vector, Matrix, Euler

try:
    PROJECT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
except Exception:
    PROJECT_DIR = r"e:\Car_Automation"

EXPORTS_DIR = os.path.join(PROJECT_DIR, "exports")
PARTS_F1_DIR = os.path.join(EXPORTS_DIR, "parts", "f1")
PARTS_GT3_DIR = os.path.join(EXPORTS_DIR, "parts", "gt3_supercar")
PARTS_HYPERCAR_DIR = os.path.join(EXPORTS_DIR, "parts", "hypercar")

PUB_VEHICLES_F1_DIR = os.path.join(PROJECT_DIR, "public", "models", "vehicles", "f1")
PUB_VEHICLES_GT3_DIR = os.path.join(PROJECT_DIR, "public", "models", "vehicles", "gt3_supercar")
PUB_EXTERIOR_DIR = os.path.join(PROJECT_DIR, "public", "models", "exterior")

ARTIFACTS_DIR = r"C:\Users\acer\.gemini\antigravity-ide\brain\cef2f360-6ed6-4e67-9c7e-e3351074871b"

for d in [EXPORTS_DIR, PARTS_F1_DIR, PARTS_GT3_DIR, PARTS_HYPERCAR_DIR,
          PUB_VEHICLES_F1_DIR, PUB_VEHICLES_GT3_DIR, PUB_EXTERIOR_DIR, ARTIFACTS_DIR]:
    os.makedirs(d, exist_ok=True)

# ----------------------------------------------------------------------------
# 1. PBR SHADER SUITE FACTORY
# ----------------------------------------------------------------------------
def make_pbr_material(name, base_color, metallic=0.0, roughness=0.5, clearcoat=0.0,
                      transmission=0.0, ior=1.52, emission=None, emission_strength=1.0, alpha=1.0):
    mat = bpy.data.materials.get(name)
    if not mat:
        mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
    tree = mat.node_tree
    nodes = tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if bsdf:
        if "Base Color" in bsdf.inputs:
            bsdf.inputs["Base Color"].default_value = base_color
        if "Metallic" in bsdf.inputs:
            bsdf.inputs["Metallic"].default_value = metallic
        if "Roughness" in bsdf.inputs:
            bsdf.inputs["Roughness"].default_value = roughness
        if "Coat Weight" in bsdf.inputs:
            bsdf.inputs["Coat Weight"].default_value = clearcoat
        elif "Clearcoat" in bsdf.inputs:
            bsdf.inputs["Clearcoat"].default_value = clearcoat
        if "Transmission Weight" in bsdf.inputs:
            bsdf.inputs["Transmission Weight"].default_value = transmission
        elif "Transmission" in bsdf.inputs:
            bsdf.inputs["Transmission"].default_value = transmission
        if "IOR" in bsdf.inputs:
            bsdf.inputs["IOR"].default_value = ior
        if "Alpha" in bsdf.inputs:
            bsdf.inputs["Alpha"].default_value = alpha
        if emission:
            if "Emission Color" in bsdf.inputs:
                bsdf.inputs["Emission Color"].default_value = emission
            elif "Emission" in bsdf.inputs:
                bsdf.inputs["Emission"].default_value = emission
            if "Emission Strength" in bsdf.inputs:
                bsdf.inputs["Emission Strength"].default_value = emission_strength
    return mat

def create_master_shader_library():
    return {
        # F1 Works Racing Materials
        "f1_cyan": make_pbr_material("F1_Livery_PetronasCyan", (0.00, 0.65, 0.60, 1.0), metallic=0.75, roughness=0.12, clearcoat=1.0),
        "f1_neon": make_pbr_material("F1_Livery_NeonVolt", (0.82, 0.98, 0.05, 1.0), metallic=0.20, roughness=0.15, clearcoat=0.9),
        "f1_white": make_pbr_material("F1_Livery_PureWhite", (0.95, 0.95, 0.96, 1.0), metallic=0.10, roughness=0.18, clearcoat=0.9),
        "f1_silver": make_pbr_material("F1_Livery_SilverArrow", (0.82, 0.84, 0.86, 1.0), metallic=0.95, roughness=0.14, clearcoat=1.0),
        "carbon_twill": make_pbr_material("F1_Carbon_Twill_Gloss", (0.05, 0.05, 0.06, 1.0), metallic=0.45, roughness=0.22, clearcoat=1.0),
        "carbon_matte": make_pbr_material("F1_Carbon_T800_Matte", (0.04, 0.04, 0.045, 1.0), metallic=0.15, roughness=0.55),
        "titanium_raw": make_pbr_material("F1_Titanium_Grade5", (0.65, 0.68, 0.72, 1.0), metallic=0.96, roughness=0.22),
        "slick_rubber": make_pbr_material("F1_Pirelli_Slick_Rubber", (0.04, 0.04, 0.04, 1.0), metallic=0.00, roughness=0.88),
        "tire_compound_red": make_pbr_material("F1_Tire_Pinstripe_Red", (0.92, 0.05, 0.08, 1.0), metallic=0.10, roughness=0.40),
        "tire_compound_yellow": make_pbr_material("F1_Tire_Pinstripe_Yellow", (0.95, 0.82, 0.08, 1.0), metallic=0.10, roughness=0.40),
        "bbs_magnesium": make_pbr_material("F1_Wheel_BBS_Forged", (0.12, 0.13, 0.14, 1.0), metallic=0.92, roughness=0.25),
        "carbon_disc": make_pbr_material("F1_Brake_CarbonDisc", (0.16, 0.16, 0.17, 1.0), metallic=0.45, roughness=0.40),
        "caliper_gold": make_pbr_material("F1_Brake_Caliper_Gold", (0.88, 0.72, 0.18, 1.0), metallic=0.85, roughness=0.16, clearcoat=1.0),
        "caliper_red": make_pbr_material("Hypercar_Brake_Caliper_Red", (0.92, 0.06, 0.08, 1.0), metallic=0.35, roughness=0.12, clearcoat=1.0),
        "f1_rain_light": make_pbr_material("F1_FIA_Rain_Light", (1.0, 0.0, 0.0, 1.0), emission=(1.0, 0.02, 0.02, 1.0), emission_strength=25.0),
        "halo_titanium": make_pbr_material("F1_Halo_TiGrade5", (0.10, 0.10, 0.12, 1.0), metallic=0.85, roughness=0.30),
        "display_oled": make_pbr_material("Cockpit_OLED_Display", (0.02, 0.06, 0.15, 1.0), emission=(0.10, 0.65, 1.0, 1.0), emission_strength=8.0),
        "led_shift": make_pbr_material("Cockpit_LED_ShiftLights", (1.0, 0.1, 0.1, 1.0), emission=(1.0, 0.2, 0.05, 1.0), emission_strength=20.0),

        # Hypercar Materials
        "hypercar_red": make_pbr_material("Hypercar_Paint_RossoCorsa", (0.88, 0.05, 0.08, 1.0), metallic=0.92, roughness=0.08, clearcoat=1.0),
        "hypercar_alloy": make_pbr_material("Hypercar_Rim_DiamondCut", (0.75, 0.77, 0.80, 1.0), metallic=0.96, roughness=0.18, clearcoat=0.6),
        "glass_optical": make_pbr_material("Glass_Windshield_Clear", (0.04, 0.06, 0.09, 1.0), metallic=0.10, roughness=0.03, clearcoat=1.0),
        "glass_taillight": make_pbr_material("Glass_Taillight_Ruby", (0.80, 0.02, 0.02, 0.80), transmission=0.85, ior=1.54, alpha=0.80),
        "drl_ice_blue": make_pbr_material("DRL_Ice_Blue_Laser", (0.20, 0.80, 1.0, 1.0), emission=(0.20, 0.80, 1.0, 1.0), emission_strength=22.0),
        "led_laser": make_pbr_material("LED_Laser_Projector_White", (1.0, 1.0, 1.0, 1.0), emission=(1.0, 1.0, 1.0, 1.0), emission_strength=25.0),
        "taillight_oled": make_pbr_material("Taillight_OLED_Lightbar", (1.0, 0.04, 0.06, 1.0), emission=(1.0, 0.02, 0.04, 1.0), emission_strength=18.0),
        "exhaust_titanium": make_pbr_material("Titanium_Flame_Blued", (0.40, 0.52, 0.78, 1.0), metallic=0.98, roughness=0.15, emission=(0.10, 0.25, 0.80, 1.0), emission_strength=2.0),
        "carbon_satin": make_pbr_material("Carbon_Aero_Satin", (0.04, 0.04, 0.05, 1.0), metallic=0.25, roughness=0.32),
        "gold_heatshield": make_pbr_material("Gold_Foil_Heatshield", (0.95, 0.75, 0.15, 1.0), metallic=0.95, roughness=0.18),

        # Custom Motorsport Livery & Mechanical Shaders
        "gulf_blue": make_pbr_material("Livery_Gulf_PowderBlue", (0.22, 0.55, 0.85, 1.0), metallic=0.75, roughness=0.12, clearcoat=1.0),
        "gulf_orange": make_pbr_material("Livery_Gulf_TangerineOrange", (1.0, 0.42, 0.02, 1.0), metallic=0.60, roughness=0.14, clearcoat=1.0),
        "stealth_carbon": make_pbr_material("Livery_Stealth_TwillWeave", (0.025, 0.025, 0.028, 1.0), metallic=0.35, roughness=0.18, clearcoat=1.0),
        "spring_blue": make_pbr_material("Suspension_CoilSpring_Blue", (0.08, 0.35, 0.95, 1.0), metallic=0.85, roughness=0.20),
        "damper_gold": make_pbr_material("Suspension_Damper_KashimaGold", (0.92, 0.76, 0.20, 1.0), metallic=0.92, roughness=0.18),
        "fire_red": make_pbr_material("Safety_Extinguisher_GlossRed", (0.90, 0.08, 0.05, 1.0), metallic=0.40, roughness=0.30),
        "brass_gold": make_pbr_material("Safety_Brass_ValveHardware", (0.85, 0.68, 0.22, 1.0), metallic=0.90, roughness=0.25),
    }

# ----------------------------------------------------------------------------
# 2. SCENE RESET & PROCEDURAL CAD PRIMITIVES
# ----------------------------------------------------------------------------
def reset_clean_scene():
    # Non-destructive scene cleanup: preserve active MCP socket and addon state
    for o in list(bpy.context.scene.collection.objects):
        bpy.data.objects.remove(o, do_unlink=True)
    for o in list(bpy.data.objects):
        bpy.data.objects.remove(o, do_unlink=True)
    for c in list(bpy.context.scene.collection.children):
        try:
            bpy.context.scene.collection.children.unlink(c)
        except Exception:
            pass
    for c in list(bpy.data.collections):
        try:
            bpy.data.collections.remove(c, do_unlink=True)
        except Exception:
            pass
    for m in list(bpy.data.materials):
        if m.users == 0:
            bpy.data.materials.remove(m, do_unlink=True)
    for me in list(bpy.data.meshes):
        if me.users == 0:
            bpy.data.meshes.remove(me, do_unlink=True)
    for l in list(bpy.data.lights):
        if l.users == 0:
            bpy.data.lights.remove(l, do_unlink=True)
    for cam in list(bpy.data.cameras):
        if cam.users == 0:
            bpy.data.cameras.remove(cam, do_unlink=True)

def ensure_collection(name):
    col = bpy.data.collections.get(name)
    if not col:
        col = bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(col)
    return col

def make_box(name, location, size, col_name, mat, bevel=0.004, segments=2, rot=(0,0,0)):
    col = ensure_collection(col_name)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=location, rotation=rot)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = size
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    if bevel > 0 and min(size) > bevel * 2.2:
        bev = obj.modifiers.new(name="Bevel", type='BEVEL')
        bev.width = min(bevel, min(size) * 0.25)
        bev.segments = segments
        bev.limit_method = 'ANGLE'
        bev.angle_limit = math.radians(40)
        try:
            bpy.ops.object.modifier_apply(modifier="Bevel")
        except Exception:
            pass
    if mat:
        obj.data.materials.clear()
        obj.data.materials.append(mat)
    for p in obj.data.polygons:
        p.use_smooth = True
    for c in obj.users_collection:
        c.objects.unlink(obj)
    col.objects.link(obj)
    return obj

def make_cylinder(name, location, radius, depth, rot_euler, col_name, mat, vertices=36, bevel=0.003):
    col = ensure_collection(col_name)
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=location, rotation=rot_euler)
    obj = bpy.context.active_object
    obj.name = name
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    if bevel > 0 and depth > bevel * 2.5 and radius > bevel * 2.5:
        bev = obj.modifiers.new(name="Bevel", type='BEVEL')
        bev.width = min(bevel, radius * 0.15)
        bev.segments = 2
        bev.limit_method = 'ANGLE'
        bev.angle_limit = math.radians(40)
        try:
            bpy.ops.object.modifier_apply(modifier="Bevel")
        except Exception:
            pass
    if mat:
        obj.data.materials.clear()
        obj.data.materials.append(mat)
    for p in obj.data.polygons:
        p.use_smooth = True
    for c in obj.users_collection:
        c.objects.unlink(obj)
    col.objects.link(obj)
    return obj

def make_cone(name, location, r1, r2, depth, rot_euler, col_name, mat, vertices=32):
    col = ensure_collection(col_name)
    bpy.ops.mesh.primitive_cone_add(vertices=vertices, radius1=r1, radius2=r2, depth=depth, location=location, rotation=rot_euler)
    obj = bpy.context.active_object
    obj.name = name
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    if mat:
        obj.data.materials.clear()
        obj.data.materials.append(mat)
    for p in obj.data.polygons:
        p.use_smooth = True
    for c in obj.users_collection:
        c.objects.unlink(obj)
    col.objects.link(obj)
    return obj

def make_wedge_pod(name, fwd_pt, aft_pt, fwd_dim, aft_dim, col_name, mat, bevel=0.015):
    """Creates a sleek tapered aerodynamic pod with beveled downwash slope."""
    col = ensure_collection(col_name)
    bm = bmesh.new()
    fx, fy, fz = fwd_pt
    ax, ay, az = aft_pt
    wf, hf = fwd_dim
    wa, ha = aft_dim

    v0 = bm.verts.new(Vector((fx - wf/2, fy, fz - hf/2)))
    v1 = bm.verts.new(Vector((fx + wf/2, fy, fz - hf/2)))
    v2 = bm.verts.new(Vector((fx + wf/2, fy, fz + hf/2)))
    v3 = bm.verts.new(Vector((fx - wf/2, fy, fz + hf/2)))

    v4 = bm.verts.new(Vector((ax - wa/2, ay, az - ha/2)))
    v5 = bm.verts.new(Vector((ax + wa/2, ay, az - ha/2)))
    v6 = bm.verts.new(Vector((ax + wa/2, ay, az + ha/2)))
    v7 = bm.verts.new(Vector((ax - wa/2, ay, az + ha/2)))

    bm.verts.ensure_lookup_table()
    bm.faces.new([v3, v2, v1, v0]) # Front
    bm.faces.new([v4, v5, v6, v7]) # Aft
    bm.faces.new([v0, v1, v5, v4]) # Bottom
    bm.faces.new([v2, v3, v7, v6]) # Top downwash slope
    bm.faces.new([v0, v4, v7, v3]) # Left
    bm.faces.new([v1, v2, v6, v5]) # Right

    if bevel > 0:
        bmesh.ops.bevel(bm, geom=bm.edges, offset=bevel, segments=2, affect='EDGES')

    mesh = bpy.data.meshes.new(f"Mesh_{name}")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new(name, mesh)
    col.objects.link(obj)
    if mat:
        obj.data.materials.append(mat)
    for p in obj.data.polygons:
        p.use_smooth = True
    return obj

def make_streamlined_strut(name, pt_a, pt_b, chord, thickness, col_name, mat, steps=12):
    """Creates a streamlined aerodynamic aerofoil wishbone/strut between two 3D points."""
    col = ensure_collection(col_name)
    bm = bmesh.new()
    va = Vector(pt_a)
    vb = Vector(pt_b)
    vec = vb - va
    direction = vec.normalized()
    up = Vector((0, 0, 1))
    if abs(direction.dot(up)) > 0.98:
        up = Vector((0, 1, 0))
    right = direction.cross(up).normalized()
    up_perp = right.cross(direction).normalized()

    pts_a = []
    pts_b = []
    for i in range(steps):
        theta = 2 * math.pi * i / steps
        dx = math.cos(theta) * (chord / 2)
        dz = math.sin(theta) * (thickness / 2)
        offset = right * dx + up_perp * dz
        pts_a.append(bm.verts.new(va + offset))
        pts_b.append(bm.verts.new(vb + offset))

    bm.verts.ensure_lookup_table()
    for i in range(steps):
        i_next = (i + 1) % steps
        bm.faces.new([pts_a[i], pts_b[i], pts_b[i_next], pts_a[i_next]])
    bm.faces.new(list(reversed(pts_a)))
    bm.faces.new(pts_b)

    mesh = bpy.data.meshes.new(f"Mesh_{name}")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new(name, mesh)
    col.objects.link(obj)
    if mat:
        obj.data.materials.append(mat)
    for p in obj.data.polygons:
        p.use_smooth = True
    return obj

def make_airfoil(name, location, chord, thickness, span, camber, aoa_rad, col_name, mat):
    """Procedural cambered aerofoil with rounded leading edge."""
    col = ensure_collection(col_name)
    bm = bmesh.new()
    steps = 18
    pts_upper = []
    pts_lower = []
    for i in range(steps + 1):
        x = i / steps
        yt = 5 * thickness * (0.2969 * math.sqrt(max(0, x)) - 0.1260 * x - 0.3516 * (x**2) + 0.2843 * (x**3) - 0.1015 * (x**4))
        yc = camber * (2 * 0.4 * x - x**2) / (0.4**2) if x < 0.4 else camber * ((1 - 2 * 0.4) + 2 * 0.4 * x - x**2) / ((1 - 0.4)**2)
        dy = (x - 0.5) * chord
        dz_u = (yc + yt) * chord
        dz_l = (yc - yt) * chord
        pts_upper.append((dy, dz_u))
        pts_lower.append((dy, dz_l))

    half_s = span / 2.0
    v_left = []
    v_right = []
    for dy, dz in pts_upper + list(reversed(pts_lower[:-1])):
        v_left.append(bm.verts.new(Vector((-half_s, dy, dz))))
        v_right.append(bm.verts.new(Vector((half_s, dy, dz))))

    bm.verts.ensure_lookup_table()
    num_pts = len(v_left)
    for i in range(num_pts):
        i_next = (i + 1) % num_pts
        bm.faces.new([v_left[i], v_right[i], v_right[i_next], v_left[i_next]])

    bm.faces.new(list(reversed(v_left)))
    bm.faces.new(v_right)

    bmesh.ops.rotate(bm, cent=Vector((0,0,0)), matrix=Matrix.Rotation(aoa_rad, 4, 'X'), verts=bm.verts)
    bmesh.ops.translate(bm, vec=Vector(location), verts=bm.verts)

    mesh = bpy.data.meshes.new(f"Mesh_{name}")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new(name, mesh)
    col.objects.link(obj)
    if mat:
        obj.data.materials.append(mat)
    for p in obj.data.polygons:
        p.use_smooth = True
    return obj

def join_objects_into_part(objects_to_join, final_name, col_name):
    """Joins a list of mesh objects into a single multi-material component."""
    valid_objs = [o for o in objects_to_join if o and o.type == 'MESH']
    if not valid_objs:
        return None
    bpy.ops.object.select_all(action='DESELECT')
    for o in valid_objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = valid_objs[0]
    bpy.ops.object.join()
    joined = bpy.context.active_object
    joined.name = final_name
    joined.data.name = f"Mesh_{final_name}"
    for p in joined.data.polygons:
        p.use_smooth = True
    col = ensure_collection(col_name)
    for c in joined.users_collection:
        c.objects.unlink(joined)
    col.objects.link(joined)
    return joined

def make_helical_spring(name, location, radius, wire_r, height, coils, col_name, mat, steps_per_turn=20):
    col = ensure_collection(col_name)
    bm = bmesh.new()
    total_steps = int(coils * steps_per_turn)
    spine = []
    for s in range(total_steps + 1):
        t = s / max(1, total_steps)
        theta = 2 * math.pi * coils * t
        z = (t - 0.5) * height
        x = math.cos(theta) * radius
        y = math.sin(theta) * radius
        spine.append(Vector((x, y, z)))

    circle_pts = 8
    rings = []
    for i, pt in enumerate(spine):
        if i == 0:
            tangent = (spine[1] - pt).normalized()
        elif i == len(spine) - 1:
            tangent = (pt - spine[-2]).normalized()
        else:
            tangent = (spine[i+1] - spine[i-1]).normalized()

        up = Vector((0, 0, 1))
        if abs(tangent.dot(up)) > 0.95:
            up = Vector((1, 0, 0))
        n1 = tangent.cross(up).normalized()
        n2 = tangent.cross(n1).normalized()

        ring = []
        for c in range(circle_pts):
            c_ang = 2 * math.pi * c / circle_pts
            c_offset = (n1 * math.cos(c_ang) + n2 * math.sin(c_ang)) * wire_r
            v = bm.verts.new(pt + c_offset + Vector(location))
            ring.append(v)
        rings.append(ring)

    bm.verts.ensure_lookup_table()
    for r in range(len(rings) - 1):
        for c in range(circle_pts):
            c_next = (c + 1) % circle_pts
            bm.faces.new([rings[r][c], rings[r+1][c], rings[r+1][c_next], rings[r][c_next]])
    bm.faces.new(list(reversed(rings[0])))
    bm.faces.new(rings[-1])

    mesh = bpy.data.meshes.new(f"Mesh_{name}")
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    col.objects.link(obj)
    if mat:
        obj.data.materials.append(mat)
    for p in obj.data.polygons:
        p.use_smooth = True
    return obj

def build_racing_pedal_box(name, location, col_name, mats):
    col = ensure_collection(col_name)
    sub = []
    lx, ly, lz = location
    base = make_box(f"{name}_Base", (lx, ly, lz), (0.28, 0.22, 0.015), col_name, mats["carbon_twill"], bevel=0.003)
    sub.append(base)
    pedal_specs = [
        ("Clutch", lx - 0.08, ly + 0.04, lz + 0.08, 0.045, 0.09),
        ("Brake", lx, ly + 0.04, lz + 0.08, 0.055, 0.10),
        ("Throttle", lx + 0.08, ly + 0.02, lz + 0.09, 0.040, 0.14)
    ]
    for p_name, px, py, pz, pw, ph in pedal_specs:
        arm = make_box(f"{name}_{p_name}_Arm", (px, py, pz), (0.015, 0.02, ph), col_name, mats["titanium_raw"], bevel=0.002, rot=(math.radians(-15), 0, 0))
        sub.append(arm)
        face = make_box(f"{name}_{p_name}_Face", (px, py + 0.025, pz + ph * 0.4), (pw, 0.01, ph * 0.55), col_name, mats["hypercar_alloy"], bevel=0.003, rot=(math.radians(-15), 0, 0))
        sub.append(face)
        hole = make_cylinder(f"{name}_{p_name}_Hole", (px, py + 0.032, pz + ph * 0.4), pw * 0.22, 0.012, (math.radians(75), 0, 0), col_name, mats["carbon_matte"], vertices=12)
        sub.append(hole)
    return join_objects_into_part(sub, name, col_name)

def build_fire_suppression_bottle(name, location, col_name, mats):
    col = ensure_collection(col_name)
    sub = []
    lx, ly, lz = location
    body = make_cylinder(f"{name}_Cylinder", (lx, ly, lz), 0.065, 0.28, (math.radians(90), 0, 0), col_name, mats["fire_red"], vertices=24, bevel=0.01)
    sub.append(body)
    valve = make_cylinder(f"{name}_Valve", (lx, ly + 0.16, lz), 0.025, 0.05, (math.radians(90), 0, 0), col_name, mats["brass_gold"], vertices=16)
    sub.append(valve)
    ring = make_cylinder(f"{name}_Ring", (lx + 0.03, ly + 0.18, lz), 0.014, 0.006, (0, math.pi/2, 0), col_name, mats["f1_neon"], vertices=16)
    sub.append(ring)
    for by in [-0.08, 0.08]:
        bracket = make_box(f"{name}_Bracket_{by}", (lx, ly + by, lz - 0.04), (0.15, 0.02, 0.04), col_name, mats["carbon_twill"], bevel=0.002)
        sub.append(bracket)
    return join_objects_into_part(sub, name, col_name)

def build_suspension_coilover(name, top_pt, bottom_pt, col_name, mats):
    col = ensure_collection(col_name)
    sub = []
    v_top = Vector(top_pt)
    v_bot = Vector(bottom_pt)
    v_mid = (v_top + v_bot) * 0.5
    vec = v_top - v_bot
    length = vec.length

    damper = make_streamlined_strut(f"{name}_DamperBody", v_bot + vec * 0.25, v_top, 0.048, 0.048, col_name, mats["damper_gold"], steps=16)
    sub.append(damper)
    rod = make_streamlined_strut(f"{name}_PistonRod", v_bot, v_bot + vec * 0.35, 0.020, 0.020, col_name, mats["titanium_raw"], steps=14)
    sub.append(rod)
    spring = make_helical_spring(f"{name}_Spring", (v_mid.x, v_mid.y, v_mid.z), 0.038, 0.007, length * 0.65, 7.5, col_name, mats["spring_blue"])
    sub.append(spring)
    collar = make_cylinder(f"{name}_Collar", (v_top.x, v_top.y, v_top.z - 0.03), 0.042, 0.016, (0, 0, 0), col_name, mats["caliper_gold"], vertices=18)
    sub.append(collar)
    return join_objects_into_part(sub, name, col_name)

# ----------------------------------------------------------------------------
# 3. HIGH-FIDELITY MOTORSPORT WHEEL BUILDER
# ----------------------------------------------------------------------------
def build_wheel_assembly(name, location, tire_r, tire_w, rim_r, is_left, style, mats, col_name):
    """
    Builds an authentic motorsport wheel with:
    - Crowned performance slick tire using primitive torus
    - Sidewall motorsport compound color pinstripe
    - Deep forged alloy rim barrel with inner stepped lip
    - Center hub & anodized centerlock competition nut (Red LHD / Blue RHD)
    - BBS 10-spoke web with aero disc (F1) / Concave split 5-spoke (Hypercar)
    - Cross-drilled carbon-ceramic brake rotor with radial cooling vents
    - Monobloc 6-piston brake caliper (Gold for F1, Brembo Red for Hypercar)
    """
    col = ensure_collection(col_name)
    sub_objs = []
    wx, wy, wz = location
    w_sign = -1 if is_left else 1

    # 1. Authentic crowned tire using primitive torus
    bpy.ops.mesh.primitive_torus_add(
        major_radius=tire_r - 0.065,
        minor_radius=0.070,
        major_segments=48,
        minor_segments=24,
        location=(wx, wy, wz),
        rotation=(0, math.pi/2, 0)
    )
    obj_tire = bpy.context.active_object
    obj_tire.name = f"Tire_{name}"
    obj_tire.scale = (1.0, 1.0, tire_w / 0.140)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    obj_tire.data.materials.append(mats["slick_rubber"])
    for p in obj_tire.data.polygons:
        p.use_smooth = True
    for c in obj_tire.users_collection:
        c.objects.unlink(obj_tire)
    col.objects.link(obj_tire)
    sub_objs.append(obj_tire)

    # 2. Tire sidewall motorsport compound stripe
    stripe_mat = mats["tire_compound_yellow"] if style == "F1" else mats["tire_compound_red"]
    stripe_out_x = wx + w_sign * (tire_w * 0.49)
    bpy.ops.mesh.primitive_torus_add(
        major_radius=tire_r * 0.82,
        minor_radius=0.007,
        major_segments=48,
        minor_segments=10,
        location=(stripe_out_x, wy, wz),
        rotation=(0, math.pi/2, 0)
    )
    stripe_obj = bpy.context.active_object
    stripe_obj.name = f"TireStripe_{name}"
    stripe_obj.scale = (1.0, 1.0, 0.35)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    stripe_obj.data.materials.append(stripe_mat)
    for p in stripe_obj.data.polygons:
        p.use_smooth = True
    for c in stripe_obj.users_collection:
        c.objects.unlink(stripe_obj)
    col.objects.link(stripe_obj)
    sub_objs.append(stripe_obj)

    # 3. Rim Barrel (Forged Alloy)
    barrel_depth = tire_w * 0.88
    rim_mat = mats["bbs_magnesium"] if style == "F1" else mats["hypercar_alloy"]
    rim_barrel = make_cylinder(f"RimBarrel_{name}", (wx, wy, wz), rim_r, barrel_depth,
                               (0, math.pi/2, 0), col_name, rim_mat, vertices=36, bevel=0.005)
    sub_objs.append(rim_barrel)

    # 4. Center Hub & Centerlock Nut
    out_face_x = wx + w_sign * (tire_w * 0.36)
    hub = make_cylinder(f"Hub_{name}", (out_face_x, wy, wz), rim_r * 0.32, 0.035,
                        (0, math.pi/2, 0), col_name, rim_mat, vertices=24, bevel=0.003)
    sub_objs.append(hub)

    nut_mat = mats["caliper_gold"] if style == "F1" else (mats["caliper_red"] if is_left else mats["drl_ice_blue"])
    nut = make_cylinder(f"Centerlock_{name}", (wx + w_sign * (tire_w * 0.42), wy, wz), 0.032, 0.042,
                        (0, math.pi/2, 0), col_name, nut_mat, vertices=8, bevel=0.003)
    sub_objs.append(nut)

    # 5. Spokes / Aero Disc
    if style == "F1":
        # 10 Spokes
        num_spk = 10
        spk_len = rim_r * 0.72
        for s_i in range(num_spk):
            ang = (2 * math.pi / num_spk) * s_i
            spk_cy = wy + math.cos(ang) * (spk_len * 0.52)
            spk_cz = wz + math.sin(ang) * (spk_len * 0.52)
            spk = make_box(f"Spoke_{name}_{s_i}", (out_face_x, spk_cy, spk_cz),
                           (0.016, 0.022, spk_len), col_name, rim_mat, bevel=0.002,
                           rot=(0, -ang, 0))
            sub_objs.append(spk)
        # BBS Aero Carbon Disc Ring
        aero_ring = make_cylinder(f"AeroRing_{name}", (wx + w_sign * (tire_w * 0.40), wy, wz), rim_r * 0.88, 0.014,
                                  (0, math.pi/2, 0), col_name, mats["carbon_twill"], vertices=36, bevel=0.002)
        sub_objs.append(aero_ring)
    else:
        # Hypercar: Deep-concave twin 5-spoke directional forged alloy rim
        num_spk = 5
        spk_len = rim_r * 0.74
        for s_i in range(num_spk):
            ang = (2 * math.pi / num_spk) * s_i
            for pair_off in [-0.075, 0.075]:
                p_ang = ang + pair_off
                spk_cy = wy + math.cos(p_ang) * (spk_len * 0.54)
                spk_cz = wz + math.sin(p_ang) * (spk_len * 0.54)
                spk = make_box(f"Spoke_{name}_{s_i}_{pair_off}", (out_face_x - w_sign * 0.012, spk_cy, spk_cz),
                               (0.018, 0.022, spk_len), col_name, rim_mat, bevel=0.003,
                               rot=(0, -p_ang, 0))
                sub_objs.append(spk)

    # 6. Carbon-Ceramic Brake Rotor with ventilation ring
    rotor_x = wx - w_sign * (tire_w * 0.18)
    rotor = make_cylinder(f"Rotor_{name}", (rotor_x, wy, wz), rim_r * 0.78, 0.028,
                          (0, math.pi/2, 0), col_name, mats["carbon_disc"], vertices=36, bevel=0.003)
    sub_objs.append(rotor)
    # Rotor center hat (aluminum bell)
    rotor_hat = make_cylinder(f"RotorHat_{name}", (rotor_x, wy, wz), rim_r * 0.38, 0.032,
                              (0, math.pi/2, 0), col_name, rim_mat, vertices=24, bevel=0.002)
    sub_objs.append(rotor_hat)

    # 7. Monobloc Racing Caliper (Gold for F1, Brembo Red for Hypercar)
    caliper_mat = mats["caliper_gold"] if style == "F1" else mats["caliper_red"]
    cal_y = wy + (rim_r * 0.52)
    cal_z = wz + (rim_r * 0.32)
    caliper = make_box(f"Caliper_{name}", (rotor_x, cal_y, cal_z),
                       (0.065, 0.13, 0.22), col_name, caliper_mat, bevel=0.006,
                       rot=(math.radians(-24), 0, 0))
    sub_objs.append(caliper)

    # 8. Motorsport Aero Brake Duct & Floating Rotor Hardware
    if style == "F1":
        # Inboard Carbon Aero Brake Drum & Scoop
        duct_x = wx - w_sign * (tire_w * 0.28)
        drum = make_cylinder(f"BrakeDrum_{name}", (duct_x, wy, wz), rim_r * 0.84, 0.045,
                             (0, math.pi/2, 0), col_name, mats["carbon_twill"], vertices=28, bevel=0.003)
        sub_objs.append(drum)
        scoop = make_box(f"BrakeScoop_{name}", (duct_x, wy + rim_r * 0.55, wz + 0.02),
                         (0.045, 0.08, 0.09), col_name, mats["carbon_twill"], bevel=0.004)
        sub_objs.append(scoop)
    else:
        # Hypercar Floating Rotor Titanium Bobbins
        for b_i in range(8):
            b_ang = (2 * math.pi / 8) * b_i
            by = wy + math.cos(b_ang) * (rim_r * 0.38)
            bz = wz + math.sin(b_ang) * (rim_r * 0.38)
            bobbin = make_cylinder(f"Bobbin_{name}_{b_i}", (rotor_x, by, bz), 0.008, 0.034,
                                   (0, math.pi/2, 0), col_name, mats["titanium_raw"], vertices=8)
            sub_objs.append(bobbin)

    joined_wheel = join_objects_into_part(sub_objs, name, col_name)
    return joined_wheel

# ----------------------------------------------------------------------------
# 4. MASTER FORMULA 1 VEHICLE & COMPONENT GENERATOR (25 MODULAR NODES)
# ----------------------------------------------------------------------------
def generate_f1_grand_prix_vehicle(mats):
    print("\n[F1_GENERATOR] Building 2024+ Grand Prix Race Car & 25 Modular Components...")
    f1_parts = {}

    # ── 1. Monocoque Survival Cell (F1_Monocoque_T800 & M55J) ──
    mono_objs = []
    # Tub main fuselage (sculpted multi-segment)
    tub_fwd = make_wedge_pod("F1_Tub_Fwd", (0.0, 1.25, 0.36), (0.0, 0.35, 0.38),
                             (0.52, 0.38), (0.68, 0.44), "01_Chassis", mats["f1_cyan"], bevel=0.022)
    mono_objs.append(tub_fwd)
    tub_mid = make_box("F1_Tub_Mid", (0.0, -0.10, 0.38), (0.68, 0.90, 0.44), "01_Chassis", mats["f1_cyan"], bevel=0.025)
    mono_objs.append(tub_mid)
    tub_rear = make_wedge_pod("F1_Tub_Rear", (0.0, -0.55, 0.38), (0.0, -0.95, 0.36),
                              (0.68, 0.44), (0.58, 0.40), "01_Chassis", mats["f1_cyan"], bevel=0.020)
    mono_objs.append(tub_rear)

    # Cockpit cutout inner lining & padding
    seat_recess = make_box("F1_Cockpit_Tub_Cavity", (0.0, 0.15, 0.42), (0.54, 0.95, 0.32), "01_Chassis", mats["carbon_matte"], bevel=0.015)
    mono_objs.append(seat_recess)
    coaming_lip = make_box("F1_Cockpit_Coaming", (0.0, 0.42, 0.58), (0.52, 0.12, 0.05), "01_Chassis", mats["carbon_twill"], bevel=0.008)
    mono_objs.append(coaming_lip)

    # Roll Hoop & 3-Way Airbox Intake Scoop
    airbox = make_wedge_pod("F1_Airbox_Scoop", (0.0, -0.10, 0.78), (0.0, -0.65, 0.55),
                            (0.32, 0.38), (0.24, 0.25), "01_Chassis", mats["f1_cyan"], bevel=0.020)
    mono_objs.append(airbox)
    airbox_hole = make_cylinder("F1_Airbox_Intake_Hole", (0.0, -0.05, 0.84), 0.11, 0.15, (math.radians(90), 0, 0), "01_Chassis", mats["carbon_matte"])
    mono_objs.append(airbox_hole)
    # T-Cam Aerial Antenna (Fluorescent broadcast pod)
    tcam_mast = make_cylinder("F1_TCam_Mast", (0.0, -0.12, 0.98), 0.012, 0.12, (0, 0, 0), "01_Chassis", mats["carbon_matte"])
    mono_objs.append(tcam_mast)
    tcam_pod = make_box("F1_TCam_Pod", (0.0, -0.12, 1.04), (0.035, 0.09, 0.035), "01_Chassis", mats["f1_neon"], bevel=0.004)
    mono_objs.append(tcam_pod)

    # Dorsal Shark Fin
    shark_fin = make_box("F1_Dorsal_Shark_Fin", (0.0, -1.05, 0.74), (0.016, 1.45, 0.46), "01_Chassis", mats["f1_cyan"], bevel=0.005)
    mono_objs.append(shark_fin)
    # Headrest foam surround
    headrest = make_box("F1_Cockpit_Headrest", (0.0, -0.22, 0.62), (0.42, 0.35, 0.16), "01_Chassis", mats["f1_neon"], bevel=0.015)
    mono_objs.append(headrest)

    # Dual Aerodynamic Side Mirrors on flow conditioner wings
    for m_side, mx, m_sign in [("L", -0.42, -1), ("R", 0.42, 1)]:
        m_stalk = make_streamlined_strut(f"F1_Mirror_Stalk_{m_side}", (m_sign * 0.28, 0.35, 0.52), (mx, 0.32, 0.58), 0.035, 0.010, "01_Chassis", mats["carbon_twill"])
        mono_objs.append(m_stalk)
        m_housing = make_box(f"F1_Mirror_Housing_{m_side}", (mx, 0.32, 0.58), (0.13, 0.06, 0.055), "01_Chassis", mats["f1_cyan"], bevel=0.008)
        mono_objs.append(m_housing)
        m_glass = make_box(f"F1_Mirror_Glass_{m_side}", (mx, 0.30, 0.58), (0.11, 0.005, 0.045), "01_Chassis", mats["f1_silver"])
        mono_objs.append(m_glass)

    f1_parts["F1_Monocoque_T800"] = join_objects_into_part(mono_objs, "F1_Monocoque_T800", "01_Chassis")

    # M55J Variant (Exposed ultra-stiff pitch carbon weave)
    f1_parts["F1_Monocoque_M55J"] = make_box("F1_Monocoque_M55J", (0.0, 0.25, 0.38), (0.68, 2.20, 0.44), "01_Chassis", mats["carbon_twill"], bevel=0.025)
    f1_parts["F1_Monocoque_M55J"].hide_set(True)

    # ── 2. Nose Cone (F1_Nose_Undercut & F1_Nose_Wide) ──
    nose_objs = []
    # Drooping curved nose cone
    nose_taper = make_wedge_pod("F1_Nose_Taper_Wedge", (0.0, 2.50, 0.22), (0.0, 1.25, 0.36),
                                (0.18, 0.16), (0.52, 0.38), "02_Aerodynamics_Front", mats["f1_cyan"], bevel=0.018)
    nose_objs.append(nose_taper)
    nose_tip = make_cone("F1_Nose_Tip_Cone", (0.0, 2.58, 0.20), 0.08, 0.03, 0.16, (math.radians(90), 0, 0), "02_Aerodynamics_Front", mats["f1_cyan"])
    nose_objs.append(nose_tip)
    nose_undercut = make_box("F1_Nose_Undercut_Keel", (0.0, 1.95, 0.18), (0.22, 1.10, 0.06), "02_Aerodynamics_Front", mats["carbon_twill"], bevel=0.008)
    nose_objs.append(nose_undercut)
    # Pitot tube mast
    pitot = make_cylinder("F1_Pitot_Tube", (0.0, 1.65, 0.44), 0.004, 0.08, (0, 0, 0), "02_Aerodynamics_Front", mats["titanium_raw"])
    nose_objs.append(pitot)
    # Dual FIA forward telemetry cameras
    for c_side, cx in [("L", -0.22), ("R", 0.22)]:
        cam_stalk = make_streamlined_strut(f"F1_Camera_Stalk_{c_side}", (cx * 0.6, 2.12, 0.32), (cx, 2.12, 0.34), 0.025, 0.008, "02_Aerodynamics_Front", mats["carbon_matte"])
        nose_objs.append(cam_stalk)
        cam = make_box(f"F1_Camera_Pod_{c_side}", (cx, 2.12, 0.34), (0.055, 0.14, 0.035), "02_Aerodynamics_Front", mats["carbon_matte"], bevel=0.004)
        nose_objs.append(cam)
    f1_parts["F1_Nose_Undercut"] = join_objects_into_part(nose_objs, "F1_Nose_Undercut", "02_Aerodynamics_Front")

    f1_parts["F1_Nose_Wide"] = make_cone("F1_Nose_Wide", (0.0, 1.95, 0.32), 0.18, 0.38, 1.35, (math.radians(90), 0, 0), "02_Aerodynamics_Front", mats["f1_cyan"])
    f1_parts["F1_Nose_Wide"].hide_set(True)

    # ── 3. Front Wing (F1_FrontWing_Outwash4 & F1_FrontWing_Monza3) ──
    fw_objs = []
    fw_objs.append(make_airfoil("F1_FW_Mainplane", (0.0, 2.36, 0.12), 0.32, 0.024, 2.00, 0.045, math.radians(-5), "02_Aerodynamics_Front", mats["f1_cyan"]))
    fw_objs.append(make_airfoil("F1_FW_Flap1", (0.0, 2.46, 0.16), 0.24, 0.018, 1.94, 0.038, math.radians(-9), "02_Aerodynamics_Front", mats["carbon_twill"]))
    fw_objs.append(make_airfoil("F1_FW_Flap2", (0.0, 2.54, 0.20), 0.18, 0.015, 1.90, 0.030, math.radians(-14), "02_Aerodynamics_Front", mats["f1_cyan"]))
    fw_objs.append(make_airfoil("F1_FW_Flap3", (0.0, 2.60, 0.24), 0.14, 0.012, 1.86, 0.025, math.radians(-20), "02_Aerodynamics_Front", mats["f1_neon"]))
    for s_side, sx in [("L", -1.00), ("R", 1.00)]:
        s_sign = -1 if sx < 0 else 1
        ep = make_box(f"F1_FW_Endplate_{s_side}", (sx, 2.48, 0.22), (0.018, 0.58, 0.28), "02_Aerodynamics_Front", mats["f1_cyan"], bevel=0.005)
        fw_objs.append(ep)
        dive = make_box(f"F1_FW_Diveplane_{s_side}", (sx + s_sign * 0.035, 2.46, 0.24), (0.065, 0.26, 0.012), "02_Aerodynamics_Front", mats["carbon_twill"], rot=(math.radians(-16), 0, 0))
        fw_objs.append(dive)
        foot = make_box(f"F1_FW_Footplate_{s_side}", (sx + s_sign * 0.025, 2.48, 0.09), (0.050, 0.52, 0.010), "02_Aerodynamics_Front", mats["carbon_twill"])
        fw_objs.append(foot)
    f1_parts["F1_FrontWing_Outwash4"] = join_objects_into_part(fw_objs, "F1_FrontWing_Outwash4", "02_Aerodynamics_Front")

    f1_parts["F1_FrontWing_Monza3"] = make_airfoil("F1_FrontWing_Monza3", (0.0, 2.45, 0.15), 0.26, 0.018, 2.00, 0.020, math.radians(-6), "02_Aerodynamics_Front", mats["carbon_twill"])
    f1_parts["F1_FrontWing_Monza3"].hide_set(True)

    # ── 4. Titanium Halo (F1_Halo_Grade5) ──
    halo_objs = []
    center_strut = make_streamlined_strut("F1_Halo_CenterStrut", (0.0, 0.48, 0.45), (0.0, 0.22, 0.68), 0.038, 0.022, "01_Chassis", mats["halo_titanium"])
    halo_objs.append(center_strut)
    hoop_fwd = make_cylinder("F1_Halo_Hoop_Front", (0.0, 0.12, 0.68), 0.24, 0.038, (math.radians(90), 0, 0), "01_Chassis", mats["halo_titanium"])
    halo_objs.append(hoop_fwd)
    for s_side, sx in [("L", -0.25), ("R", 0.25)]:
        leg = make_streamlined_strut(f"F1_Halo_Leg_{s_side}", (sx * 0.9, 0.0, 0.68), (sx, -0.32, 0.58), 0.042, 0.024, "01_Chassis", mats["halo_titanium"])
        halo_objs.append(leg)
    f1_parts["F1_Halo_Grade5"] = join_objects_into_part(halo_objs, "F1_Halo_Grade5", "01_Chassis")

    # ── 5. Cockpit PDU Interior (F1_Cockpit_PDU) ──
    cockpit_objs = []
    seat = make_box("F1_Seat_Shell", (0.0, 0.05, 0.32), (0.46, 0.68, 0.38), "03_Cockpit", mats["carbon_twill"], bevel=0.020)
    cockpit_objs.append(seat)
    for h_side, hx in [("L", -0.12), ("R", 0.12)]:
        strap = make_box(f"F1_Harness_Strap_{h_side}", (hx, 0.08, 0.44), (0.055, 0.55, 0.008), "03_Cockpit", mats["f1_neon"])
        cockpit_objs.append(strap)
    buckle = make_cylinder("F1_Harness_Rotary_Buckle", (0.0, 0.18, 0.36), 0.032, 0.015, (0, 0, 0), "03_Cockpit", mats["titanium_raw"])
    cockpit_objs.append(buckle)
    wheel_body = make_box("F1_Steering_Wheel_Body", (0.0, 0.48, 0.54), (0.28, 0.035, 0.16), "03_Cockpit", mats["carbon_matte"], bevel=0.008)
    cockpit_objs.append(wheel_body)
    # Ergonomic handgrips
    for g_side, gx in [("L", -0.13), ("R", 0.13)]:
        grip = make_cylinder(f"F1_Grip_{g_side}", (gx, 0.48, 0.54), 0.016, 0.14, (0, 0, 0), "03_Cockpit", mats["carbon_twill"])
        cockpit_objs.append(grip)
    # Carbon shift & clutch paddles behind wheel
    for p_side, px in [("L", -0.11), ("R", 0.11)]:
        paddle = make_box(f"F1_Paddle_{p_side}", (px, 0.46, 0.55), (0.045, 0.006, 0.09), "03_Cockpit", mats["carbon_twill"], bevel=0.002)
        cockpit_objs.append(paddle)
    # Rotary knobs on faceplate
    for r_i, rx in enumerate([-0.05, 0.0, 0.05]):
        dial = make_cylinder(f"F1_Dial_{r_i+1}", (rx, 0.50, 0.51), 0.010, 0.008, (math.radians(90), 0, 0), "03_Cockpit", mats["f1_neon"])
        cockpit_objs.append(dial)
    oled_display = make_box("F1_Steering_OLED", (0.0, 0.495, 0.56), (0.12, 0.006, 0.065), "03_Cockpit", mats["display_oled"])
    cockpit_objs.append(oled_display)
    led_revs = make_box("F1_Shift_LED_Bar", (0.0, 0.496, 0.61), (0.14, 0.004, 0.012), "03_Cockpit", mats["led_shift"])
    cockpit_objs.append(led_revs)
    f1_parts["F1_Cockpit_PDU"] = join_objects_into_part(cockpit_objs, "F1_Cockpit_PDU", "03_Cockpit")

    # ── 6. Front Pullrod Suspension (Streamlined Airfoil Wishbones) ──
    for s_side, sx, s_sign in [("FL", -0.45, -1), ("FR", 0.45, 1)]:
        susp_objs = []
        upr_x = s_sign * 0.72
        # Upper Forward Wishbone
        susp_objs.append(make_streamlined_strut(f"{s_side}_Upper_Fwd", (s_sign * 0.26, 1.88, 0.42), (upr_x, 1.82, 0.40), 0.035, 0.012, "04_Suspension", mats["carbon_twill"]))
        # Upper Aft Wishbone
        susp_objs.append(make_streamlined_strut(f"{s_side}_Upper_Aft", (s_sign * 0.28, 1.66, 0.42), (upr_x, 1.78, 0.40), 0.035, 0.012, "04_Suspension", mats["carbon_twill"]))
        # Lower Forward Wishbone
        susp_objs.append(make_streamlined_strut(f"{s_side}_Lower_Fwd", (s_sign * 0.24, 1.86, 0.22), (upr_x, 1.82, 0.24), 0.038, 0.014, "04_Suspension", mats["carbon_twill"]))
        # Lower Aft Wishbone
        susp_objs.append(make_streamlined_strut(f"{s_side}_Lower_Aft", (s_sign * 0.26, 1.68, 0.22), (upr_x, 1.78, 0.24), 0.038, 0.014, "04_Suspension", mats["carbon_twill"]))
        # Pullrod Strut (from top of upright to bottom inboard rocker)
        susp_objs.append(make_streamlined_strut(f"{s_side}_Pullrod", (s_sign * 0.22, 1.74, 0.18), (upr_x, 1.80, 0.38), 0.022, 0.010, "04_Suspension", mats["titanium_raw"]))
        # Carbon Upright
        susp_objs.append(make_box(f"{s_side}_Upright", (upr_x, 1.80, 0.36), (0.06, 0.14, 0.28), "04_Suspension", mats["titanium_raw"]))
        f1_parts[f"F1_Suspension_{s_side}_Pullrod"] = join_objects_into_part(susp_objs, f"F1_Suspension_{s_side}_Pullrod", "04_Suspension")

    # ── 7. Ground Effect Floor & Diffuser ──
    floor_objs = []
    underfloor = make_box("F1_Floor_Tray", (0.0, -0.25, 0.065), (1.68, 2.75, 0.024), "05_Aerodynamics_Underbody", mats["carbon_twill"])
    floor_objs.append(underfloor)
    for fx in [-0.68, -0.42, 0.42, 0.68]:
        fence = make_box(f"F1_Floor_Fence_{fx}", (fx, 0.85, 0.16), (0.012, 0.65, 0.18), "05_Aerodynamics_Underbody", mats["carbon_twill"], bevel=0.003)
        floor_objs.append(fence)
    for ex in [-0.85, 0.85]:
        edge_winglet = make_box(f"F1_Edge_Winglet_{ex}", (ex, -0.25, 0.085), (0.022, 1.85, 0.045), "05_Aerodynamics_Underbody", mats["carbon_twill"])
        floor_objs.append(edge_winglet)
    f1_parts["F1_Floor_QuadFence"] = join_objects_into_part(floor_objs, "F1_Floor_QuadFence", "05_Aerodynamics_Underbody")

    f1_parts["F1_Floor_AntiPorpoise"] = make_box("F1_Floor_AntiPorpoise", (0.0, -0.25, 0.065), (1.68, 2.75, 0.024), "05_Aerodynamics_Underbody", mats["carbon_twill"])
    f1_parts["F1_Floor_AntiPorpoise"].hide_set(True)

    diff_objs = []
    diff_tunnel = make_box("F1_Diffuser_Expansion", (0.0, -2.05, 0.22), (1.18, 0.85, 0.028), "05_Aerodynamics_Underbody", mats["carbon_twill"], rot=(math.radians(-18), 0, 0))
    diff_objs.append(diff_tunnel)
    for dx in [-0.42, -0.14, 0.14, 0.42]:
        strake = make_box(f"F1_Diff_Strake_{dx}", (dx, -2.05, 0.24), (0.014, 0.78, 0.24), "05_Aerodynamics_Underbody", mats["carbon_twill"])
        diff_objs.append(strake)
    gurney = make_box("F1_Diff_Gurney", (0.0, -2.42, 0.35), (1.18, 0.015, 0.035), "05_Aerodynamics_Underbody", mats["carbon_twill"])
    diff_objs.append(gurney)
    f1_parts["F1_Diffuser_QuadStrake"] = join_objects_into_part(diff_objs, "F1_Diffuser_QuadStrake", "05_Aerodynamics_Underbody")

    # ── 8. 2024+ Overbite Waterslide Downwash Sidepods (F1_Sidepod_L/R_Downwash) ──
    for s_side, sx, s_sign in [("L", -0.58, -1), ("R", 0.58, 1)]:
        sidepod_objs = []
        # Main waterslide downwash body
        pod_body = make_wedge_pod(f"F1_Sidepod_Wedge_{s_side}",
                                  (sx, 0.40, 0.34), (sx, -1.25, 0.20),
                                  (0.54, 0.42), (0.36, 0.20),
                                  "06_Sidepods", mats["f1_cyan"], bevel=0.025)
        sidepod_objs.append(pod_body)
        # Overbite upper leading edge cowl
        overbite_cowl = make_box(f"F1_Overbite_Cowl_{s_side}", (sx, 0.48, 0.46), (0.50, 0.12, 0.06), "06_Sidepods", mats["f1_cyan"], bevel=0.010)
        sidepod_objs.append(overbite_cowl)
        # Recessed horizontal radiator inlet slot
        pod_mouth = make_box(f"F1_Sidepod_Inlet_{s_side}", (sx, 0.44, 0.35), (0.46, 0.08, 0.16), "06_Sidepods", mats["carbon_matte"], bevel=0.008)
        sidepod_objs.append(pod_mouth)
        # Deep undercut airflow channel carved beneath
        undercut_sculpt = make_wedge_pod(f"F1_Sidepod_Undercut_{s_side}", (sx + s_sign * 0.08, 0.35, 0.18), (sx + s_sign * 0.06, -0.65, 0.15),
                                         (0.32, 0.16), (0.24, 0.12), "06_Sidepods", mats["carbon_twill"], bevel=0.012)
        sidepod_objs.append(undercut_sculpt)
        # Cooling louvers
        for l in range(6):
            louver = make_box(f"F1_Sidepod_Louver_{s_side}_{l}", (sx - s_sign * 0.05, -0.15 - l * 0.08, 0.42 - l * 0.025),
                              (0.24, 0.045, 0.008), "06_Sidepods", mats["carbon_twill"], rot=(math.radians(-22), 0, 0))
            sidepod_objs.append(louver)
        f1_parts[f"F1_Sidepod_{s_side}_Downwash"] = join_objects_into_part(sidepod_objs, f"F1_Sidepod_{s_side}_Downwash", "06_Sidepods")

    # ── 9. Power Unit & Gearbox ──
    pu_objs = []
    engine_block = make_box("F1_PU_V6_Block", (0.0, -0.85, 0.34), (0.42, 0.65, 0.38), "07_Powertrain", mats["carbon_matte"], bevel=0.015)
    pu_objs.append(engine_block)
    for px in [-0.14, 0.14]:
        plenum = make_cylinder(f"F1_Intake_Plenum_{px}", (px, -0.85, 0.52), 0.065, 0.55, (math.radians(90), 0, 0), "07_Powertrain", mats["carbon_twill"])
        pu_objs.append(plenum)
        heatshield = make_box(f"F1_Heatshield_{px}", (px * 1.3, -0.85, 0.28), (0.08, 0.45, 0.18), "07_Powertrain", mats["gold_heatshield"])
        pu_objs.append(heatshield)
    tailpipe = make_cylinder("F1_Exhaust_Tailpipe", (0.0, -1.55, 0.44), 0.048, 0.42, (math.radians(90), 0, 0), "07_Powertrain", mats["exhaust_titanium"])
    pu_objs.append(tailpipe)
    f1_parts["F1_PowerUnit_ApexWorks"] = join_objects_into_part(pu_objs, "F1_PowerUnit_ApexWorks", "07_Powertrain")

    gb_objs = []
    gb_case = make_box("F1_Gearbox_Case", (0.0, -1.45, 0.32), (0.34, 0.62, 0.34), "07_Powertrain", mats["titanium_raw"], bevel=0.015)
    gb_objs.append(gb_case)
    rear_crash = make_box("F1_Rear_Crash_Structure", (0.0, -2.05, 0.28), (0.18, 0.58, 0.18), "07_Powertrain", mats["carbon_twill"], bevel=0.010)
    gb_objs.append(rear_crash)
    rain_light = make_box("F1_FIA_Rain_Light", (0.0, -2.36, 0.28), (0.11, 0.015, 0.075), "07_Powertrain", mats["f1_rain_light"])
    gb_objs.append(rain_light)
    f1_parts["F1_Gearbox_Carbon8"] = join_objects_into_part(gb_objs, "F1_Gearbox_Carbon8", "07_Powertrain")

    # ── 10. Rear Pushrod Suspension (Streamlined Airfoil Wishbones) ──
    for s_side, sx, s_sign in [("RL", -0.45, -1), ("RR", 0.45, 1)]:
        susp_objs = []
        upr_x = s_sign * 0.70
        # Upper Forward Wishbone
        susp_objs.append(make_streamlined_strut(f"{s_side}_Upper_Fwd", (s_sign * 0.20, -1.68, 0.42), (upr_x, -1.76, 0.40), 0.035, 0.012, "04_Suspension", mats["carbon_twill"]))
        # Upper Aft Wishbone
        susp_objs.append(make_streamlined_strut(f"{s_side}_Upper_Aft", (s_sign * 0.20, -1.88, 0.42), (upr_x, -1.84, 0.40), 0.035, 0.012, "04_Suspension", mats["carbon_twill"]))
        # Lower Forward Wishbone
        susp_objs.append(make_streamlined_strut(f"{s_side}_Lower_Fwd", (s_sign * 0.18, -1.68, 0.22), (upr_x, -1.76, 0.24), 0.038, 0.014, "04_Suspension", mats["carbon_twill"]))
        # Pushrod Strut
        susp_objs.append(make_streamlined_strut(f"{s_side}_Pushrod", (s_sign * 0.16, -1.78, 0.44), (upr_x, -1.80, 0.26), 0.024, 0.012, "04_Suspension", mats["titanium_raw"]))
        # Upright
        susp_objs.append(make_box(f"{s_side}_Upright", (upr_x, -1.80, 0.36), (0.06, 0.14, 0.28), "04_Suspension", mats["titanium_raw"]))
        f1_parts[f"F1_Suspension_{s_side}_Pushrod"] = join_objects_into_part(susp_objs, f"F1_Suspension_{s_side}_Pushrod", "04_Suspension")

    # ── 11. Rear Wing & DRS (Cascade High-Downforce & Monza Low-Drag) ──
    rw_objs = []
    for px in [-0.18, 0.18]:
        pylon = make_box(f"F1_RW_Pylon_{px}", (px, -2.15, 0.72), (0.022, 0.28, 0.48), "08_Aerodynamics_Rear", mats["carbon_twill"], bevel=0.004)
        rw_objs.append(pylon)
    # Biplane Beam Wing
    rw_objs.append(make_airfoil("F1_BeamWing_Lower", (0.0, -2.05, 0.38), 0.22, 0.018, 1.15, 0.040, math.radians(14), "08_Aerodynamics_Rear", mats["carbon_twill"]))
    rw_objs.append(make_airfoil("F1_BeamWing_Upper", (0.0, -2.14, 0.46), 0.18, 0.015, 1.05, 0.032, math.radians(18), "08_Aerodynamics_Rear", mats["carbon_twill"]))
    # Mainplane & DRS flap
    rw_objs.append(make_airfoil("F1_RW_Mainplane", (0.0, -2.32, 0.86), 0.42, 0.032, 1.36, 0.045, math.radians(22), "08_Aerodynamics_Rear", mats["f1_cyan"]))
    rw_objs.append(make_airfoil("F1_RW_DRS_Flap", (0.0, -2.44, 0.94), 0.28, 0.022, 1.34, 0.065, math.radians(28), "08_Aerodynamics_Rear", mats["f1_neon"]))
    rw_objs.append(make_box("F1_DRS_Actuator", (0.0, -2.35, 0.96), (0.06, 0.16, 0.05), "08_Aerodynamics_Rear", mats["titanium_raw"], bevel=0.003))
    for sx in [-0.69, 0.69]:
        ep = make_box(f"F1_RW_Endplate_{sx}", (sx, -2.32, 0.82), (0.02, 0.65, 0.46), "08_Aerodynamics_Rear", mats["f1_cyan"], bevel=0.006)
        rw_objs.append(ep)
    f1_parts["F1_RearWing_CascadeDRS"] = join_objects_into_part(rw_objs, "F1_RearWing_CascadeDRS", "08_Aerodynamics_Rear")

    f1_parts["F1_RearWing_MonzaSpoon"] = make_airfoil("F1_RearWing_MonzaSpoon", (0.0, -2.32, 0.86), 0.30, 0.018, 1.36, 0.015, math.radians(12), "08_Aerodynamics_Rear", mats["carbon_twill"])
    f1_parts["F1_RearWing_MonzaSpoon"].hide_set(True)

    # ── 12. 18-Inch Pirelli Slicks & BBS Forged Racing Wheels ──
    wheel_specs = [
        ("FL", -0.82, 1.80, 0.36, 0.305, 0.360, True),
        ("FR", 0.82, 1.80, 0.36, 0.305, 0.360, False),
        ("RL", -0.80, -1.80, 0.36, 0.405, 0.360, True),
        ("RR", 0.80, -1.80, 0.36, 0.405, 0.360, False),
    ]
    for w_name, wx, wy, wz, tire_w, tire_r, is_left in wheel_specs:
        part_name = f"F1_Wheel_{w_name}"
        f1_parts[part_name] = build_wheel_assembly(
            part_name, (wx, wy, wz), tire_r, tire_w, 0.230, is_left, "F1", mats, "09_Running_Gear"
        )

    print(f"[F1_GENERATOR] Success! Built {len(f1_parts)} modular parts.")
    return f1_parts

# ----------------------------------------------------------------------------
# 5. MASTER APEX GT3 TRACK HYPERCAR GENERATOR (20 MODULAR NODES)
# ----------------------------------------------------------------------------
def generate_apex_gt3_hypercar_vehicle(mats):
    print("\n[HYPERCAR_GENERATOR] Building Apex GT3 Track Hypercar & 20 Modular Components...")
    hc_parts = {}

    wb = 2.70       # Wheelbase
    tf = 1.66 / 2   # Front half-track = 0.83m
    tr = 1.71 / 2   # Rear half-track = 0.855m
    rh = 0.10       # Ride height ground clearance

    # ── 1. Monocoque Survival Cell & Undertray ──
    chassis_objs = []
    tub = make_box("Hypercar_Tub_Core", (0.0, 0.0, rh + 0.22), (tf * 1.55, wb * 0.96, 0.32), "01_Hypercar_Chassis", mats["carbon_twill"], bevel=0.025)
    chassis_objs.append(tub)
    undertray = make_box("Hypercar_Undertray", (0.0, 0.0, rh + 0.015), (tf * 1.88, wb * 1.15, 0.024), "01_Hypercar_Chassis", mats["carbon_satin"])
    chassis_objs.append(undertray)
    cradle = make_box("Hypercar_Engine_Cradle", (0.0, -(wb * 0.42), rh + 0.26), (0.75, 0.85, 0.28), "01_Hypercar_Chassis", mats["titanium_raw"], bevel=0.015)
    chassis_objs.append(cradle)
    # Twin Turbochargers with titanium compressor housings and wastegates
    for t_side, tx in [("L", -0.25), ("R", 0.25)]:
        turbo = make_cylinder(f"Hypercar_Turbo_{t_side}", (tx, -(wb * 0.42), rh + 0.38), 0.075, 0.08, (0, math.pi/2, 0), "01_Hypercar_Chassis", mats["titanium_raw"], vertices=20)
        chassis_objs.append(turbo)
        wastegate = make_cylinder(f"Hypercar_Wastegate_{t_side}", (tx, -(wb * 0.46), rh + 0.40), 0.035, 0.06, (math.radians(90), 0, 0), "01_Hypercar_Chassis", mats["exhaust_titanium"], vertices=12)
        chassis_objs.append(wastegate)
    hc_parts["Hypercar_Chassis_Monocoque"] = join_objects_into_part(chassis_objs, "Hypercar_Chassis_Monocoque", "01_Hypercar_Chassis")

    # ── 2. Aerodynamic Greenhouse & Roof Canopy (Teardrop Bubble + Flying Buttresses) ──
    canopy_objs = []
    # Double-bubble roof panel with center channel
    roof_left = make_box("Hypercar_Roof_Bubble_L", (-tf * 0.24, 0.04, rh + 0.90), (tf * 0.48, wb * 0.48, 0.09), "02_Hypercar_Greenhouse", mats["hypercar_red"], bevel=0.030)
    canopy_objs.append(roof_left)
    roof_right = make_box("Hypercar_Roof_Bubble_R", (tf * 0.24, 0.04, rh + 0.90), (tf * 0.48, wb * 0.48, 0.09), "02_Hypercar_Greenhouse", mats["hypercar_red"], bevel=0.030)
    canopy_objs.append(roof_right)
    roof_spine = make_box("Hypercar_Roof_Spine", (0.0, 0.04, rh + 0.87), (0.16, wb * 0.48, 0.06), "02_Hypercar_Greenhouse", mats["carbon_twill"])
    canopy_objs.append(roof_spine)

    # Sloped panoramic windshield
    windshield = make_wedge_pod("Hypercar_Windshield_Wedge", (0.0, wb * 0.26, rh + 0.70), (0.0, 0.08, rh + 0.88),
                                (tf * 1.12, 0.28), (tf * 1.02, 0.08), "02_Hypercar_Greenhouse", mats["glass_optical"], bevel=0.015)
    canopy_objs.append(windshield)

    # Side glass windows
    for s_side, sx in [("L", -tf * 0.54), ("R", tf * 0.54)]:
        side_glass = make_box(f"Hypercar_Side_Glass_{s_side}", (sx, 0.04, rh + 0.76), (0.018, wb * 0.44, 0.22), "02_Hypercar_Greenhouse", mats["glass_optical"], bevel=0.008)
        canopy_objs.append(side_glass)

    # Rear engine glass cover
    rear_glass = make_wedge_pod("Hypercar_Engine_Glass_Wedge", (0.0, 0.02, rh + 0.88), (0.0, -(wb * 0.36), rh + 0.60),
                                (tf * 1.02, 0.08), (tf * 0.84, 0.20), "02_Hypercar_Greenhouse", mats["glass_optical"], bevel=0.015)
    canopy_objs.append(rear_glass)

    # Flying Buttresses (channeling downforce air over rear deck)
    for s_side, sx, s_sign in [("L", -tf * 0.48, -1), ("R", tf * 0.48, 1)]:
        fb1 = make_streamlined_strut(f"Hypercar_Buttress_{s_side}_A", (sx, -0.05, rh + 0.88), (sx - s_sign * 0.12, -(wb * 0.28), rh + 0.76), 0.085, 0.024, "02_Hypercar_Greenhouse", mats["hypercar_red"])
        canopy_objs.append(fb1)
        fb2 = make_streamlined_strut(f"Hypercar_Buttress_{s_side}_B", (sx - s_sign * 0.12, -(wb * 0.28), rh + 0.76), (sx - s_sign * 0.24, -(wb * 0.46), rh + 0.55), 0.085, 0.024, "02_Hypercar_Greenhouse", mats["hypercar_red"])
        canopy_objs.append(fb2)

    # Integrated Roof Ram-Air Scoop
    roof_scoop = make_wedge_pod("Hypercar_Roof_RamAir", (0.0, 0.22, rh + 0.94), (0.0, -0.15, rh + 0.98),
                                (0.22, 0.08), (0.24, 0.12), "02_Hypercar_Greenhouse", mats["carbon_twill"], bevel=0.012)
    canopy_objs.append(roof_scoop)
    hc_parts["Hypercar_Roof_Canopy"] = join_objects_into_part(canopy_objs, "Hypercar_Roof_Canopy", "02_Hypercar_Greenhouse")

    # ── 3. Front Bumper Fascia (Sculpted Shark Nose & Jewel-Eye Laser Headlights) ──
    front_bumper_y = (wb * 0.5) + 0.48
    fb_objs = []
    # Sculpted center nose
    center_nose = make_wedge_pod("Hypercar_Bumper_Center_Nose", (0.0, front_bumper_y + 0.16, rh + 0.26), (0.0, front_bumper_y - 0.12, rh + 0.32),
                                 (tf * 0.82, 0.26), (tf * 1.76, 0.32), "03_Hypercar_Body", mats["hypercar_red"], bevel=0.022)
    fb_objs.append(center_nose)
    # Lower central radiator mouth
    air_dam = make_box("Hypercar_Center_AirDam", (0.0, front_bumper_y + 0.15, rh + 0.16), (tf * 0.88, 0.08, 0.16), "03_Hypercar_Body", mats["carbon_satin"])
    fb_objs.append(air_dam)

    # Jewel-eye triple projector headlights with DRL blades
    for s_side, sx in [("L", -tf * 0.65), ("R", tf * 0.65)]:
        s_sign = -1 if sx < 0 else 1
        # Carbon headlight bucket recess
        bucket = make_box(f"Hypercar_Headlight_Bucket_{s_side}", (sx, front_bumper_y + 0.10, rh + 0.34), (0.26, 0.18, 0.08), "03_Hypercar_Body", mats["carbon_matte"], rot=(0, 0, s_sign * math.radians(12)))
        fb_objs.append(bucket)
        # Triple LED projector lenses
        for p_i in range(3):
            proj_y = front_bumper_y + 0.08 + p_i * 0.04
            proj_x = sx + s_sign * (p_i - 1) * 0.055
            lens = make_cylinder(f"Hypercar_Projector_{s_side}_{p_i}", (proj_x, proj_y, rh + 0.34), 0.022, 0.04, (math.radians(90), 0, s_sign * math.radians(12)), "03_Hypercar_Body", mats["led_laser"], vertices=16)
            fb_objs.append(lens)
        # Razor-sharp DRL Eyebrow Blade
        drl = make_box(f"Hypercar_DRL_Blade_{s_side}", (sx, front_bumper_y + 0.16, rh + 0.38), (0.24, 0.02, 0.016), "03_Hypercar_Body", mats["drl_ice_blue"], rot=(0, 0, s_sign * math.radians(12)))
        fb_objs.append(drl)
    hc_parts["Hypercar_Front_Bumper_Fascia"] = join_objects_into_part(fb_objs, "Hypercar_Front_Bumper_Fascia", "03_Hypercar_Body")

    # ── 4. Front Splitter (Ground Effect Tray + Canards + Titanium Struts) ──
    sp_objs = []
    splitter = make_box("Hypercar_Splitter_Tray", (0.0, front_bumper_y + 0.22, rh + 0.02), (tf * 1.88, 0.44, 0.024), "04_Hypercar_Aero", mats["carbon_twill"])
    sp_objs.append(splitter)
    for s_side, sx in [("L", -tf * 0.94), ("R", tf * 0.94)]:
        s_sign = -1 if sx < 0 else 1
        ep = make_box(f"Hypercar_Splitter_EP_{s_side}", (sx, front_bumper_y + 0.22, rh + 0.075), (0.016, 0.42, 0.11), "04_Hypercar_Aero", mats["carbon_twill"])
        sp_objs.append(ep)
        # Titanium support turnbuckle struts
        strut = make_streamlined_strut(f"Hypercar_Splitter_Strut_{s_side}", (s_sign * 0.32, front_bumper_y + 0.32, rh + 0.03), (s_sign * 0.26, front_bumper_y + 0.18, rh + 0.22), 0.012, 0.008, "04_Hypercar_Aero", mats["titanium_raw"])
        sp_objs.append(strut)
        canard1 = make_box(f"Hypercar_Canard1_{s_side}", (sx * 0.98, front_bumper_y + 0.14, rh + 0.22), (0.14, 0.18, 0.012), "04_Hypercar_Aero", mats["carbon_twill"], rot=(math.radians(-12), 0, s_sign * math.radians(16)))
        sp_objs.append(canard1)
        canard2 = make_box(f"Hypercar_Canard2_{s_side}", (sx * 0.98, front_bumper_y + 0.14, rh + 0.31), (0.12, 0.16, 0.012), "04_Hypercar_Aero", mats["carbon_twill"], rot=(math.radians(-14), 0, s_sign * math.radians(18)))
        sp_objs.append(canard2)
    # Aerodynamic under-splitter ground-effect strakes
    for st_x in [-tf * 0.52, tf * 0.52]:
        st = make_box(f"Hypercar_Splitter_Strake_{st_x}", (st_x, front_bumper_y + 0.20, rh + 0.01), (0.014, 0.38, 0.024), "04_Hypercar_Aero", mats["carbon_twill"])
        sp_objs.append(st)
    hc_parts["Hypercar_Front_Splitter"] = join_objects_into_part(sp_objs, "Hypercar_Front_Splitter", "04_Hypercar_Aero")

    # ── 5. Muscular Front Fenders (Shark-Gill Pressure Louvers) ──
    for s_side, sx, s_sign in [("Left", -tf * 0.96, -1), ("Right", tf * 0.96, 1)]:
        fend_objs = []
        fend_body = make_box(f"Hypercar_Fender_{s_side}", (sx, wb * 0.5, rh + 0.32), (0.24, 0.78, 0.38), "03_Hypercar_Body", mats["hypercar_red"], bevel=0.024)
        fend_objs.append(fend_body)
        for l in range(5):
            louver = make_box(f"Hypercar_Fender_Louver_{s_side}_{l}", (sx, (wb * 0.5) - (l - 2.0) * 0.065, rh + 0.52 - l * 0.008),
                              (0.16, 0.048, 0.008), "03_Hypercar_Body", mats["carbon_twill"], rot=(math.radians(-18), 0, 0))
            fend_objs.append(louver)
        hc_parts[f"Hypercar_Fender_Front_{s_side}"] = join_objects_into_part(fend_objs, f"Hypercar_Fender_Front_{s_side}", "03_Hypercar_Body")

    # ── 6. Vented Raked Hood with S-Duct Extraction ──
    hood_objs = []
    hood_w = tf * 1.44
    hood_body = make_wedge_pod("Hypercar_Hood_Rake", (0.0, wb * 0.16, rh + 0.58), (0.0, wb * 0.5 + 0.40, rh + 0.38),
                               (hood_w, 0.06), (hood_w * 0.88, 0.05), "03_Hypercar_Body", mats["hypercar_red"], bevel=0.018)
    hood_objs.append(hood_body)
    # Central S-Duct radiator extraction tunnel
    s_duct = make_box("Hypercar_Hood_SDuct", (0.0, wb * 0.34, rh + 0.50), (hood_w * 0.50, 0.42, 0.025), "03_Hypercar_Body", mats["carbon_twill"])
    hood_objs.append(s_duct)
    for s_side, sx in [("L", -hood_w * 0.28), ("R", hood_w * 0.28)]:
        naca = make_box(f"Hypercar_Hood_NACA_{s_side}", (sx, wb * 0.28, rh + 0.52), (0.08, 0.18, 0.018), "03_Hypercar_Body", mats["carbon_matte"])
        hood_objs.append(naca)
        pin = make_cylinder(f"Hypercar_Hood_Pin_{s_side}", (sx, wb * 0.48, rh + 0.42), 0.014, 0.008, (0, 0, 0), "03_Hypercar_Body", mats["titanium_raw"])
        hood_objs.append(pin)
    hc_parts["Hypercar_Hood_Vented"] = join_objects_into_part(hood_objs, "Hypercar_Hood_Vented", "03_Hypercar_Body")

    # ── 7. Butterfly Doors with Side Scallop Air Channels ──
    for s_side, sx, s_sign in [("Left", -tf * 0.88, -1), ("Right", tf * 0.88, 1)]:
        door_objs = []
        door_shell = make_box(f"Hypercar_Door_{s_side}", (sx, 0.06, rh + 0.44), (0.20, 1.25, 0.54), "03_Hypercar_Body", mats["hypercar_red"], bevel=0.022)
        door_objs.append(door_shell)
        channel = make_box(f"Hypercar_Door_AirChannel_{s_side}", (sx + s_sign * 0.08, 0.06, rh + 0.42), (0.06, 0.85, 0.22), "03_Hypercar_Body", mats["carbon_twill"])
        door_objs.append(channel)
        # Cantilevered carbon aerodynamic side mirror
        m_stalk = make_streamlined_strut(f"Hypercar_Mirror_Stalk_{s_side}", (sx, wb * 0.18, rh + 0.60), (sx + s_sign * 0.16, wb * 0.18, rh + 0.68), 0.035, 0.012, "03_Hypercar_Body", mats["carbon_twill"])
        door_objs.append(m_stalk)
        mirror = make_box(f"Hypercar_Mirror_{s_side}", (sx + s_sign * 0.18, wb * 0.18, rh + 0.68), (0.16, 0.08, 0.06), "03_Hypercar_Body", mats["carbon_twill"], bevel=0.005)
        door_objs.append(mirror)
        hc_parts[f"Hypercar_Door_Butterfly_{s_side}"] = join_objects_into_part(door_objs, f"Hypercar_Door_Butterfly_{s_side}", "03_Hypercar_Body")

    # ── 8. Side Skirts with Rear Wake Deflectors ──
    for s_side, sx in [("Left", -tf * 0.94), ("Right", tf * 0.94)]:
        skirt_objs = []
        skirt = make_box(f"Hypercar_Skirt_{s_side}", (sx, 0.0, rh + 0.035), (0.09, wb * 0.74, 0.055), "04_Hypercar_Aero", mats["carbon_twill"], bevel=0.006)
        skirt_objs.append(skirt)
        flick = make_box(f"Hypercar_Skirt_Flick_{s_side}", (sx, -(wb * 0.35), rh + 0.08), (0.035, 0.18, 0.12), "04_Hypercar_Aero", mats["carbon_twill"])
        skirt_objs.append(flick)
        hc_parts[f"Hypercar_Rocker_Skirt_{s_side}"] = join_objects_into_part(skirt_objs, f"Hypercar_Rocker_Skirt_{s_side}", "04_Hypercar_Aero")

    # ── 9. Wide Rear Haunches with Intercooler Scoops ──
    for s_side, sx, s_sign in [("Left", -tr * 0.98, -1), ("Right", tr * 0.98, 1)]:
        haunch_objs = []
        haunch = make_box(f"Hypercar_Haunch_{s_side}", (sx, -(wb * 0.5), rh + 0.34), (0.26, 0.88, 0.42), "03_Hypercar_Body", mats["hypercar_red"], bevel=0.026)
        haunch_objs.append(haunch)
        intercooler_scoop = make_box(f"Hypercar_Haunch_Scoop_{s_side}", (sx - s_sign * 0.06, -(wb * 0.28), rh + 0.38), (0.12, 0.22, 0.24), "03_Hypercar_Body", mats["carbon_satin"])
        haunch_objs.append(intercooler_scoop)
        # Alloy fuel filler cap
        cap = make_cylinder(f"Hypercar_Fuel_Cap_{s_side}", (sx, -(wb * 0.42), rh + 0.55), 0.038, 0.010, (0, 0, 0), "03_Hypercar_Body", mats["hypercar_alloy"])
        haunch_objs.append(cap)
        hc_parts[f"Hypercar_Rear_Haunch_{s_side}"] = join_objects_into_part(haunch_objs, f"Hypercar_Rear_Haunch_{s_side}", "03_Hypercar_Body")

    # ── 10. Rear Bumper & Diffuser ──
    rear_bumper_y = -(wb * 0.5) - 0.38
    rb_objs = []
    bumper_r = make_box("Hypercar_Rear_Bumper_Shell", (0.0, rear_bumper_y, rh + 0.30), (tr * 1.76, 0.36, 0.36), "03_Hypercar_Body", mats["hypercar_red"], bevel=0.024)
    rb_objs.append(bumper_r)
    # Continuous 3D OLED Taillight Ribbon
    taillight = make_box("Hypercar_OLED_Taillight", (0.0, rear_bumper_y - 0.16, rh + 0.42), (tr * 1.72, 0.02, 0.035), "03_Hypercar_Body", mats["taillight_oled"])
    rb_objs.append(taillight)
    # Central Quad Flame-Blued Titanium Exhaust Tips
    for ex_i, ex in enumerate([-0.12, -0.04, 0.04, 0.12]):
        tip = make_cylinder(f"Hypercar_Exhaust_{ex_i+1}", (ex, rear_bumper_y - 0.18, rh + 0.28), 0.034, 0.16, (math.radians(90), 0, 0), "03_Hypercar_Body", mats["exhaust_titanium"], vertices=24)
        rb_objs.append(tip)
    hc_parts["Hypercar_Rear_Bumper"] = join_objects_into_part(rb_objs, "Hypercar_Rear_Bumper", "03_Hypercar_Body")

    diff_objs = []
    diff_tray = make_box("Hypercar_Diffuser_Tray", (0.0, rear_bumper_y - 0.06, rh + 0.10), (tr * 1.65, 0.65, 0.035), "04_Hypercar_Aero", mats["carbon_twill"], rot=(math.radians(-14), 0, 0))
    diff_objs.append(diff_tray)
    for dx in [-0.55, -0.33, -0.11, 0.11, 0.33, 0.55]:
        strake = make_box(f"Hypercar_Diff_Strake_{dx}", (dx, rear_bumper_y - 0.06, rh + 0.10), (0.016, 0.62, 0.18), "04_Hypercar_Aero", mats["carbon_twill"])
        diff_objs.append(strake)
    hc_parts["Hypercar_Rear_Diffuser"] = join_objects_into_part(diff_objs, "Hypercar_Rear_Diffuser", "04_Hypercar_Aero")

    # ── 11. Active Dual-Element Rear Wing (Arched Swan-Neck Uprights) ──
    rw_objs = []
    for px in [-0.34, 0.34]:
        pylon = make_streamlined_strut(f"Hypercar_Wing_Pylon_{px}", (px, -(wb * 0.5) - 0.15, rh + 0.55), (px, -(wb * 0.5) - 0.38, rh + 1.05), 0.065, 0.020, "04_Hypercar_Aero", mats["carbon_twill"])
        rw_objs.append(pylon)
    wing_main = make_airfoil("Hypercar_Wing_Mainplane", (0.0, -(wb * 0.5) - 0.42, rh + 1.05), 0.38, 0.028, tr * 1.92, 0.040, math.radians(16), "04_Hypercar_Aero", mats["carbon_twill"])
    rw_objs.append(wing_main)
    # DRS actuator pod
    actuator = make_box("Hypercar_Wing_Actuator", (0.0, -(wb * 0.5) - 0.40, rh + 1.08), (0.06, 0.12, 0.04), "04_Hypercar_Aero", mats["titanium_raw"], bevel=0.003)
    rw_objs.append(actuator)
    for sx in [-(tr * 0.96), tr * 0.96]:
        ep = make_box(f"Hypercar_Wing_EP_{sx}", (sx, -(wb * 0.5) - 0.42, rh + 1.04), (0.018, 0.46, 0.26), "04_Hypercar_Aero", mats["carbon_twill"], bevel=0.004)
        rw_objs.append(ep)
    hc_parts["Hypercar_Active_Rear_Wing"] = join_objects_into_part(rw_objs, "Hypercar_Active_Rear_Wing", "04_Hypercar_Aero")

    # ── 12. Michelin Slicks & Split 5-Spoke Wheels ──
    wheel_specs = [
        ("FL", -tf, wb * 0.5, rh + 0.24, 0.295, 0.340, True),
        ("FR", tf, wb * 0.5, rh + 0.24, 0.295, 0.340, False),
        ("RL", -tr, -(wb * 0.5), rh + 0.25, 0.345, 0.350, True),
        ("RR", tr, -(wb * 0.5), rh + 0.25, 0.345, 0.350, False),
    ]
    for w_name, wx, wy, wz, tire_w, tire_r, is_left in wheel_specs:
        part_name = f"Hypercar_Wheel_{w_name}"
        hc_parts[part_name] = build_wheel_assembly(
            part_name, (wx, wy, wz), tire_r, tire_w, 0.245, is_left, "HYPERCAR", mats, "05_Hypercar_Running_Gear"
        )

    print(f"[HYPERCAR_GENERATOR] Success! Built {len(hc_parts)} modular parts.")
    return hc_parts

# ----------------------------------------------------------------------------
# 6. DUAL-MODE GLB EXPORT PIPELINE
# ----------------------------------------------------------------------------
def safe_copy(src, dst):
    try:
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        if os.path.exists(dst):
            try:
                os.remove(dst)
            except Exception:
                pass
        with open(src, 'rb') as f_in, open(dst, 'wb') as f_out:
            f_out.write(f_in.read())
        print(f"  [SAFE_COPY] Synchronized {dst}")
    except Exception as e:
        print(f"  [SAFE_COPY] Warning copying to {dst}: {e}")

def export_modular_parts_batch(components_dict, export_dirs, verbose_name):
    print(f"\n[PARTS_EXPORT] Exporting {len(components_dict)} modular components for {verbose_name}...")
    for part_name, obj in components_dict.items():
        if not obj or obj.type != 'MESH':
            continue
        obj.hide_set(False)
        bpy.ops.object.select_all(action='DESELECT')
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj

        primary_dir = export_dirs[0]
        primary_path = os.path.join(primary_dir, f"{part_name.lower()}.glb")

        try:
            bpy.ops.export_scene.gltf(
                filepath=primary_path,
                export_format='GLB',
                use_selection=True,
                export_apply=False
            )
        except Exception as ex:
            print(f"Error exporting {primary_path}: {ex}")
            continue

        for alt_dir in export_dirs[1:]:
            alt_path = os.path.join(alt_dir, f"{part_name.lower()}.glb")
            safe_copy(primary_path, alt_path)

    print(f"[PARTS_EXPORT] Finished batch export of {len(components_dict)} parts to {len(export_dirs)} directories.")

def export_unified_vehicle_asset(all_objects, export_paths, verbose_name):
    print(f"\n[UNIFIED_EXPORT] Exporting complete unified vehicle asset for {verbose_name}...")
    bpy.ops.object.select_all(action='DESELECT')
    for obj in all_objects:
        if obj and obj.type == 'MESH':
            obj.hide_set(False)
            obj.select_set(True)

    primary_path = export_paths[0]
    os.makedirs(os.path.dirname(primary_path), exist_ok=True)

    bpy.ops.export_scene.gltf(
        filepath=primary_path,
        export_format='GLB',
        use_selection=True,
        export_apply=True
    )

    file_sz_mb = os.path.getsize(primary_path) / (1024 * 1024)
    print(f"[UNIFIED_EXPORT] Exported {primary_path} ({file_sz_mb:.2f} MB)")

    for alt_path in export_paths[1:]:
        safe_copy(primary_path, alt_path)

# ----------------------------------------------------------------------------
# 7. STUDIO LIGHTING & SHOWCASE BEAUTY RENDERER
# ----------------------------------------------------------------------------
def setup_photorealistic_studio(cam_pos, look_at, fov_deg=42.0):
    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE'
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 720
    scene.render.film_transparent = False

    # Clean existing studio objects to prevent duplicates
    for old_name in ["Studio_Floor", "Light_Key", "Light_Rim", "Light_Overhead", "Showcase_Camera"]:
        for o in list(bpy.data.objects):
            if o.name.startswith(old_name):
                bpy.data.objects.remove(o, do_unlink=True)

    # Studio Satin Reflective Floor
    mat_floor = make_pbr_material("Studio_Floor_Satin", (0.015, 0.015, 0.018, 1.0), metallic=0.70, roughness=0.25)
    bpy.ops.mesh.primitive_plane_add(size=40.0, location=(0, 0, 0))
    floor_obj = bpy.context.active_object
    floor_obj.name = "Studio_Floor"
    floor_obj.data.materials.append(mat_floor)

    # Key Light (Soft Warm Overhead Front-Quarter)
    light_key = bpy.data.lights.new(name="Light_Key", type='AREA')
    light_key.energy = 3800.0
    light_key.size = 8.0
    light_key.color = (1.0, 0.98, 0.95)
    obj_key = bpy.data.objects.new("Light_Key", light_key)
    obj_key.location = (4.5, 4.2, 5.0)
    scene.collection.objects.link(obj_key)

    # Rim / Edge Light (Cool Blue Back-Quarter)
    light_rim = bpy.data.lights.new(name="Light_Rim", type='AREA')
    light_rim.energy = 2600.0
    light_rim.size = 6.0
    light_rim.color = (0.75, 0.88, 1.0)
    obj_rim = bpy.data.objects.new("Light_Rim", light_rim)
    obj_rim.location = (-4.8, -4.5, 3.8)
    scene.collection.objects.link(obj_rim)

    # Overhead Spine Strip Light
    light_top = bpy.data.lights.new(name="Light_Overhead", type='AREA')
    light_top.energy = 3200.0
    light_top.size = 12.0
    light_top.color = (1.0, 1.0, 1.0)
    obj_top = bpy.data.objects.new("Light_Overhead", light_top)
    obj_top.location = (0.0, 0.0, 6.2)
    scene.collection.objects.link(obj_top)

    # Camera Setup
    cam_data = bpy.data.cameras.new("Showcase_Camera")
    cam_data.lens = 48.0
    cam_obj = bpy.data.objects.new("Showcase_Camera", cam_data)
    cam_obj.location = cam_pos
    scene.collection.objects.link(cam_obj)
    scene.camera = cam_obj

    direction = Vector(look_at) - Vector(cam_pos)
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam_obj.rotation_euler = rot_quat.to_euler()

    return cam_obj

def render_showcase_image(output_path):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    scene = bpy.context.scene
    scene.render.filepath = output_path
    print(f"[RENDER] Capturing showcase -> {output_path}")
    bpy.ops.render.render(write_still=True)
    print("  -> Render finished successfully.")

def setup_360_turntable_animation(target_center=(0.0, 0.0, 0.4), radius=5.8, height=2.2, total_frames=120):
    scene = bpy.context.scene
    scene.frame_start = 1
    scene.frame_end = total_frames
    
    cam_data = bpy.data.cameras.get("Turntable_Camera") or bpy.data.cameras.new("Turntable_Camera")
    cam_data.lens = 45.0
    cam_obj = bpy.data.objects.get("Turntable_Camera") or bpy.data.objects.new("Turntable_Camera", cam_data)
    if cam_obj.name not in scene.collection.objects:
        scene.collection.objects.link(cam_obj)
    scene.camera = cam_obj
    
    for f in range(1, total_frames + 1):
        scene.frame_set(f)
        ang = 2 * math.pi * ((f - 1) / total_frames)
        cx = target_center[0] + radius * math.sin(ang)
        cy = target_center[1] + radius * math.cos(ang)
        cz = target_center[2] + height
        cam_obj.location = (cx, cy, cz)
        direction = Vector(target_center) - Vector(cam_obj.location)
        rot_quat = direction.to_track_quat('-Z', 'Y')
        cam_obj.rotation_euler = rot_quat.to_euler()
        cam_obj.keyframe_insert(data_path="location", frame=f)
        cam_obj.keyframe_insert(data_path="rotation_euler", frame=f)
    scene.frame_set(1)

def render_multi_angle_showcase(prefix, target_center=(0.0, 0.0, 0.4)):
    angles = [
        ("hero_front_3_4", (5.2, 4.6, 2.2), (0.0, 0.2, 0.35)),
        ("hero_rear_3_4", (-5.2, -4.6, 2.2), (0.0, -0.4, 0.45)),
    ]
    for angle_name, cam_pos, look_at in angles:
        setup_photorealistic_studio(cam_pos=cam_pos, look_at=look_at, fov_deg=40.0)
        output_path = os.path.join(ARTIFACTS_DIR, f"{prefix}_{angle_name}.png")
        render_showcase_image(output_path)

def setup_kinematic_hierarchy_hypercar(hc_parts):
    col = ensure_collection("00_Kinematic_Pivots")
    pivots = {}
    wb = 2.70
    tf = 1.66 / 2
    rh = 0.10

    # Butterfly Door Pivots
    for s_side, sx, s_sign in [("Left", -tf * 0.88, -1), ("Right", tf * 0.88, 1)]:
        pivot = bpy.data.objects.new(f"Door_Hinge_Pivot_{s_side}", None)
        pivot.empty_display_type = 'ARROWS'
        pivot.empty_display_size = 0.25
        pivot.location = (sx, 0.18, rh + 0.60)
        pivot.rotation_euler = (math.radians(-25), s_sign * math.radians(35), 0)
        col.objects.link(pivot)
        part_key = f"Hypercar_Door_Butterfly_{s_side}"
        if part_key in hc_parts and hc_parts[part_key]:
            door_obj = hc_parts[part_key]
            door_obj.parent = pivot
            door_obj.matrix_parent_inverse = pivot.matrix_world.inverted()
        pivots[f"Door_Hinge_Pivot_{s_side}"] = pivot

    # Bonnet / Hood Pivot
    bonnet_pivot = bpy.data.objects.new("Bonnet_Hinge_Pivot", None)
    bonnet_pivot.empty_display_type = 'SINGLE_ARROW'
    bonnet_pivot.empty_display_size = 0.30
    bonnet_pivot.location = (0.0, (wb * 0.5) + 0.35, rh + 0.38)
    col.objects.link(bonnet_pivot)
    if "Hypercar_Hood_Vented" in hc_parts and hc_parts["Hypercar_Hood_Vented"]:
        hood = hc_parts["Hypercar_Hood_Vented"]
        hood.parent = bonnet_pivot
        hood.matrix_parent_inverse = bonnet_pivot.matrix_world.inverted()
    pivots["Bonnet_Hinge_Pivot"] = bonnet_pivot

    # Active Rear Wing DRS Pivot
    wing_pivot = bpy.data.objects.new("Active_Rear_Wing_Pivot", None)
    wing_pivot.empty_display_type = 'ARROWS'
    wing_pivot.empty_display_size = 0.30
    wing_pivot.location = (0.0, -(wb * 0.5) - 0.38, rh + 1.05)
    col.objects.link(wing_pivot)
    if "Hypercar_Active_Rear_Wing" in hc_parts and hc_parts["Hypercar_Active_Rear_Wing"]:
        wing = hc_parts["Hypercar_Active_Rear_Wing"]
        wing.parent = wing_pivot
        wing.matrix_parent_inverse = wing_pivot.matrix_world.inverted()
    pivots["Active_Rear_Wing_Pivot"] = wing_pivot

    return pivots

def setup_kinematic_hierarchy_f1(f1_parts):
    col = ensure_collection("00_F1_Kinematic_Pivots")
    pivots = {}

    drs_pivot = bpy.data.objects.new("F1_DRS_Flap_Pivot", None)
    drs_pivot.empty_display_type = 'SINGLE_ARROW'
    drs_pivot.empty_display_size = 0.30
    drs_pivot.location = (0.0, -2.44, 0.94)
    col.objects.link(drs_pivot)
    pivots["F1_DRS_Flap_Pivot"] = drs_pivot

    steering_pivot = bpy.data.objects.new("F1_Steering_Wheel_Pivot", None)
    steering_pivot.empty_display_type = 'SINGLE_ARROW'
    steering_pivot.empty_display_size = 0.20
    steering_pivot.location = (0.0, 0.48, 0.54)
    steering_pivot.rotation_euler = (math.radians(-20), 0, 0)
    col.objects.link(steering_pivot)
    pivots["F1_Steering_Wheel_Pivot"] = steering_pivot

    return pivots

# ----------------------------------------------------------------------------
# 8. MASTER PIPELINE ORCHESTRATOR
# ----------------------------------------------------------------------------
def run_f1_pipeline():
    print("\n" + "="*80)
    print("EXECUTING FORMULA 1 PIPELINE")
    print("="*80)
    reset_clean_scene()
    mats = create_master_shader_library()
    f1_parts = generate_f1_grand_prix_vehicle(mats)

    export_modular_parts_batch(f1_parts, [PARTS_F1_DIR, PUB_VEHICLES_F1_DIR], "Formula 1 Modular Parts")

    export_unified_vehicle_asset(
        list(f1_parts.values()),
        [
            os.path.join(EXPORTS_DIR, "Car_F1_Complete.glb"),
            os.path.join(PUB_VEHICLES_F1_DIR, "complete-f1.glb"),
            os.path.join(PUB_EXTERIOR_DIR, "f1_car_complete.glb")
        ],
        "Formula 1 Complete Car"
    )

    setup_photorealistic_studio(cam_pos=(6.8, 5.2, 3.0), look_at=(0.0, 0.2, 0.4), fov_deg=42.0)
    render_showcase_image(os.path.join(ARTIFACTS_DIR, "f1_car_beauty.png"))
    render_multi_angle_showcase("f1", target_center=(0.0, 0.2, 0.4))
    setup_360_turntable_animation(target_center=(0.0, 0.2, 0.4), radius=6.5, height=2.4, total_frames=120)

    print("\n[F1] Staging exploded modular view...")
    exploded_offsets = {
        "F1_FrontWing_Outwash4": Vector((0, 0.90, -0.05)),
        "F1_Nose_Undercut": Vector((0, 0.65, 0.08)),
        "F1_Halo_Grade5": Vector((0, 0.0, 0.38)),
        "F1_RearWing_CascadeDRS": Vector((0, -0.85, 0.35)),
        "F1_Diffuser_QuadStrake": Vector((0, -0.60, -0.15)),
        "F1_Sidepod_L_Downwash": Vector((-0.42, 0, 0)),
        "F1_Sidepod_R_Downwash": Vector((0.42, 0, 0)),
        "F1_Wheel_FL": Vector((-0.35, 0.20, 0)),
        "F1_Wheel_FR": Vector((0.35, 0.20, 0)),
        "F1_Wheel_RL": Vector((-0.35, -0.20, 0)),
        "F1_Wheel_RR": Vector((0.35, -0.20, 0)),
    }
    for part_name, offset in exploded_offsets.items():
        if part_name in f1_parts and f1_parts[part_name]:
            f1_parts[part_name].location += offset

    render_showcase_image(os.path.join(ARTIFACTS_DIR, "f1_exploded_parts_beauty.png"))

def run_hypercar_pipeline():
    print("\n" + "="*80)
    print("EXECUTING APEX GT3 TRACK HYPERCAR PIPELINE")
    print("="*80)
    reset_clean_scene()
    mats = create_master_shader_library()
    hc_parts = generate_apex_gt3_hypercar_vehicle(mats)

    export_modular_parts_batch(hc_parts, [PARTS_GT3_DIR, PARTS_HYPERCAR_DIR, PUB_VEHICLES_GT3_DIR], "Apex GT3 Hypercar Modular Parts")

    export_unified_vehicle_asset(
        list(hc_parts.values()),
        [
            os.path.join(EXPORTS_DIR, "Car_GT3_Supercar_Complete.glb"),
            os.path.join(EXPORTS_DIR, "Car_Hypercar_Complete.glb"),
            os.path.join(PUB_VEHICLES_GT3_DIR, "complete-gt3_supercar.glb"),
            os.path.join(PUB_EXTERIOR_DIR, "hypercar_apex_gt3.glb")
        ],
        "Apex GT3 Track Hypercar Complete"
    )

    setup_photorealistic_studio(cam_pos=(5.6, 4.4, 2.4), look_at=(0.0, 0.1, 0.4), fov_deg=40.0)
    render_showcase_image(os.path.join(ARTIFACTS_DIR, "hypercar_beauty.png"))
    render_multi_angle_showcase("hypercar", target_center=(0.0, 0.1, 0.4))
    setup_360_turntable_animation(target_center=(0.0, 0.1, 0.4), radius=5.8, height=2.2, total_frames=120)

    print("\n[HYPERCAR] Staging exploded modular view...")
    exploded_offsets = {
        "Hypercar_Front_Splitter": Vector((0, 0.90, -0.10)),
        "Hypercar_Front_Bumper_Fascia": Vector((0, 0.65, 0.05)),
        "Hypercar_Hood_Vented": Vector((0, 0.35, 0.38)),
        "Hypercar_Roof_Canopy": Vector((0, 0.0, 0.45)),
        "Hypercar_Active_Rear_Wing": Vector((0, -0.85, 0.40)),
        "Hypercar_Rear_Bumper": Vector((0, -0.65, 0.05)),
        "Hypercar_Rear_Diffuser": Vector((0, -0.60, -0.15)),
        "Hypercar_Door_Butterfly_Left": Vector((-0.45, 0.10, 0.30)),
        "Hypercar_Door_Butterfly_Right": Vector((0.45, 0.10, 0.30)),
        "Hypercar_Wheel_FL": Vector((-0.35, 0.20, 0)),
        "Hypercar_Wheel_FR": Vector((0.35, 0.20, 0)),
        "Hypercar_Wheel_RL": Vector((-0.35, -0.20, 0)),
        "Hypercar_Wheel_RR": Vector((0.35, -0.20, 0)),
    }
    for part_name, offset in exploded_offsets.items():
        if part_name in hc_parts and hc_parts[part_name]:
            hc_parts[part_name].location += offset

    render_showcase_image(os.path.join(ARTIFACTS_DIR, "hypercar_exploded_parts_beauty.png"))

if __name__ == "__main__":
    print("\n" + "#"*80)
    print("STARTING BLENDER 5.2 F1 & HYPERCAR MASTER PIPELINE")
    print("#"*80)
    run_f1_pipeline()
    run_hypercar_pipeline()
    print("\n" + "="*80)
    print("ALL F1 & HYPERCAR ASSETS AND SHOWCASE RENDERS GENERATED SUCCESSFULLY!")
    print("="*80)
