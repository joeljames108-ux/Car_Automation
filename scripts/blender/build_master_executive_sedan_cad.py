"""
==============================================================================
AUTOMOTIVE 3D CAD SYSTEMS: MASTER CLASS-A EXECUTIVE SPORT SEDAN
==============================================================================
Procedural generation of an authentic 4-Door Executive Sport Sedan in Blender.
World Coordinates: Y-Forward (+Y), Z-Up (+Z), X-Lateral (+X Driver LHD).
All dimensions strictly adhere to 1:1 metric scale. Ground contact at Z=0.000m.
Zero-gap Class-A shutlines, authentic 3-box executive proportions:
- Long hood / dash-to-axle ratio
- Swept aerodynamic greenhouse with continuous A/B/C-pillars & Hofmeister kink
- Muscular rear haunches and sculpted decklid with quad titanium exhausts
- 20" forged 5-twin-spoke turbine wheels with drilled carbon-ceramic brakes
- Complete dual-mode export: 82 zero-offset modular GLBs + unified master sedan
==============================================================================
"""

import bpy
import bmesh
import math
import os
import sys
from mathutils import Vector, Matrix

def log(msg):
    print(f"[SEDAN_CAD_MASTER] {msg}")

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(os.path.dirname(SCRIPT_DIR))

PUBLIC_MODULAR_DIR = os.path.join(PROJECT_DIR, "public", "models", "modular_parts", "individual")
PUBLIC_MODELS_DIR = os.path.join(PROJECT_DIR, "public", "models")
PUBLIC_VEHICLES_SEDAN_DIR = os.path.join(PUBLIC_MODELS_DIR, "vehicles", "sedan")
EXPORTS_DIR = os.path.join(PROJECT_DIR, "exports")
EXPORTS_PARTS_DIR = os.path.join(EXPORTS_DIR, "parts")

for d in [PUBLIC_MODULAR_DIR, PUBLIC_VEHICLES_SEDAN_DIR, EXPORTS_PARTS_DIR]:
    os.makedirs(d, exist_ok=True)

# ----------------------------------------------------------------------------
# SCENE INITIALIZATION
# ----------------------------------------------------------------------------
bpy.ops.wm.read_factory_settings(use_empty=True)
for o in list(bpy.data.objects):
    bpy.data.objects.remove(o, do_unlink=True)
for c in list(bpy.data.collections):
    bpy.data.collections.remove(c)
for b in [bpy.data.meshes, bpy.data.materials, bpy.data.curves]:
    for it in list(b):
        if it.users == 0:
            b.remove(it)

scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
scene.unit_settings.scale_length = 1.0

# ----------------------------------------------------------------------------
# 1. PBR AUTOMOTIVE SHADERS
# ----------------------------------------------------------------------------
def set_socket(bsdf, names, val):
    for n in names:
        if n in bsdf.inputs:
            bsdf.inputs[n].default_value = val
            return True
    return False

def make_pbr_mat(name, base_color, metallic=0.0, roughness=0.5, clearcoat=0.0, clearcoat_rough=0.03, alpha=1.0, emission=None, emission_strength=1.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    out = nodes.new(type='ShaderNodeOutputMaterial')
    bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])

    set_socket(bsdf, ['Base Color'], base_color)
    set_socket(bsdf, ['Metallic'], metallic)
    set_socket(bsdf, ['Roughness'], roughness)
    set_socket(bsdf, ['Alpha'], alpha)

    if clearcoat > 0:
        set_socket(bsdf, ['Coat Weight', 'Clearcoat'], clearcoat)
        set_socket(bsdf, ['Coat Roughness', 'Clearcoat Roughness'], clearcoat_rough)

    if emission:
        set_socket(bsdf, ['Emission Color', 'Emission'], emission)
        set_socket(bsdf, ['Emission Strength'], emission_strength)

    if alpha < 1.0:
        if hasattr(mat, 'blend_method'):
            mat.blend_method = 'BLEND'

    return mat

# Executive Deep Tanzanite Blue Metallic with high-gloss clearcoat
MAT_PAINT = make_pbr_mat("Mat_Paint_Tanzanite_Blue", (0.012, 0.048, 0.155, 1.0), metallic=0.92, roughness=0.07, clearcoat=1.0, clearcoat_rough=0.012)
MAT_PAINT_ACCENT = make_pbr_mat("Mat_Paint_Sill_Dark", (0.010, 0.012, 0.018, 1.0), metallic=0.85, roughness=0.16, clearcoat=0.8)
MAT_CARBON = make_pbr_mat("Mat_Carbon_Fiber_Satin", (0.025, 0.025, 0.028, 1.0), metallic=0.25, roughness=0.22, clearcoat=0.85)
MAT_GLOSS_BLACK = make_pbr_mat("Mat_Trim_Piano_Gloss_Black", (0.008, 0.008, 0.010, 1.0), metallic=0.12, roughness=0.03, clearcoat=1.0)
MAT_CHROME = make_pbr_mat("Mat_Chrome_High_Mirror", (0.95, 0.95, 0.97, 1.0), metallic=1.0, roughness=0.015, clearcoat=1.0)
# Crystal-clear noise-free dielectric automotive glass
MAT_GLASS = make_pbr_mat("Mat_Glass_Dielectric", (0.82, 0.90, 0.98, 0.22), roughness=0.02, alpha=0.22)
MAT_GLASS_TINT = make_pbr_mat("Mat_Glass_Privacy_Tint", (0.08, 0.10, 0.14, 0.50), roughness=0.02, alpha=0.50)
MAT_TIRE = make_pbr_mat("Mat_Tire_Rubber_Radial", (0.022, 0.022, 0.024, 1.0), metallic=0.00, roughness=0.86)
MAT_ALLOY = make_pbr_mat("Mat_Forged_Alloy_Rim", (0.88, 0.89, 0.92, 1.0), metallic=0.98, roughness=0.10, clearcoat=0.8)
MAT_ROTOR = make_pbr_mat("Mat_CarbonCeramic_Rotor", (0.34, 0.34, 0.36, 1.0), metallic=0.82, roughness=0.32)
MAT_CALIPER = make_pbr_mat("Mat_Brembo_Red_Caliper", (0.92, 0.02, 0.02, 1.0), metallic=0.45, roughness=0.10, clearcoat=1.0)
MAT_LED_HEAD = make_pbr_mat("Mat_LED_Projector_White", (1.0, 1.0, 1.0, 1.0), roughness=0.05, emission=(1.0, 1.0, 1.0, 1.0), emission_strength=20.0)
MAT_LED_DRL = make_pbr_mat("Mat_DRL_Ice_Blue", (0.40, 0.90, 1.0, 1.0), roughness=0.05, emission=(0.40, 0.90, 1.0, 1.0), emission_strength=16.0)
MAT_LED_TAIL = make_pbr_mat("Mat_OLED_Taillight_Ruby", (1.0, 0.01, 0.01, 1.0), roughness=0.05, emission=(1.0, 0.01, 0.01, 1.0), emission_strength=18.0)
MAT_LED_IND = make_pbr_mat("Mat_LED_Amber_Indicator", (1.0, 0.52, 0.02, 1.0), roughness=0.05, emission=(1.0, 0.52, 0.02, 1.0), emission_strength=14.0)
MAT_LEATHER = make_pbr_mat("Mat_Interior_Nappa_Leather", (0.045, 0.045, 0.050, 1.0), roughness=0.65)
MAT_SCREEN = make_pbr_mat("Mat_Interior_Digital_Screen", (0.08, 0.25, 0.45, 1.0), roughness=0.15, emission=(0.10, 0.35, 0.65, 1.0), emission_strength=5.0)
MAT_STEEL = make_pbr_mat("Mat_Structural_Steel", (0.22, 0.24, 0.26, 1.0), metallic=0.90, roughness=0.35)
MAT_ALUM = make_pbr_mat("Mat_Extruded_Aluminum", (0.72, 0.74, 0.76, 1.0), metallic=0.94, roughness=0.25)
MAT_EXHAUST = make_pbr_mat("Mat_Inconel_Exhaust", (0.65, 0.58, 0.50, 1.0), metallic=0.96, roughness=0.18, clearcoat=0.6)

EXPORT_REGISTRY = {}
def register_part(glb_name, obj_or_objs):
    if not isinstance(obj_or_objs, list):
        obj_or_objs = [obj_or_objs]
    if glb_name not in EXPORT_REGISTRY:
        EXPORT_REGISTRY[glb_name] = []
    EXPORT_REGISTRY[glb_name].extend(obj_or_objs)

def apply_finishing(obj, bevel=0.003, subsurf=1):
    for p in obj.data.polygons:
        p.use_smooth = True
    if bevel > 0:
        b = obj.modifiers.new(name="Bevel", type='BEVEL')
        b.width = bevel
        b.segments = 2
        b.limit_method = 'ANGLE'
        b.angle_limit = math.radians(35)
    if subsurf > 0:
        s = obj.modifiers.new(name="Subsurf", type='SUBSURF')
        s.levels = subsurf
        s.render_levels = subsurf
    w = obj.modifiers.new(name="WeightedNormal", type='WEIGHTED_NORMAL')
    w.keep_sharp = True
    return obj

def link_and_finish(name, bm, mat, bevel=0.003, subsurf=1):
    mesh = bpy.data.meshes.new(f"Mesh_{name}")
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    if mat:
        obj.data.materials.append(mat)
    apply_finishing(obj, bevel=bevel, subsurf=subsurf)
    return obj

def link_mirrored(name, bm_half, mat, bevel=0.003, subsurf=1):
    mesh = bpy.data.meshes.new(f"Mesh_{name}")
    bm_half.to_mesh(mesh)
    bm_half.free()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    
    m = obj.modifiers.new(name="Mirror", type='MIRROR')
    m.use_axis[0] = True
    m.use_clip = True
    m.merge_threshold = 0.002
    
    if mat:
        obj.data.materials.append(mat)
    apply_finishing(obj, bevel=bevel, subsurf=subsurf)
    return obj

def link_sided(name_l, name_r, bm_half, mat, bevel=0.003, subsurf=1):
    mesh_l = bpy.data.meshes.new(f"Mesh_{name_l}")
    bm_half.to_mesh(mesh_l)
    obj_l = bpy.data.objects.new(name_l, mesh_l)
    bpy.context.scene.collection.objects.link(obj_l)
    if mat: obj_l.data.materials.append(mat)
    apply_finishing(obj_l, bevel=bevel, subsurf=subsurf)

    bm_r = bm_half.copy()
    for v in bm_r.verts:
        v.co.x = -v.co.x
    bmesh.ops.reverse_faces(bm_r, faces=bm_r.faces)
    mesh_r = bpy.data.meshes.new(f"Mesh_{name_r}")
    bm_r.to_mesh(mesh_r)
    bm_r.free()
    obj_r = bpy.data.objects.new(name_r, mesh_r)
    bpy.context.scene.collection.objects.link(obj_r)
    if mat: obj_r.data.materials.append(mat)
    apply_finishing(obj_r, bevel=bevel, subsurf=subsurf)

    return obj_l, obj_r

def make_quad_patch(bm, rows):
    verts_grid = []
    for r in rows:
        row_verts = [bm.verts.new(pt) for pt in r]
        verts_grid.append(row_verts)
    for i in range(len(rows) - 1):
        for j in range(len(rows[i]) - 1):
            v0 = verts_grid[i][j]
            v1 = verts_grid[i][j+1]
            v2 = verts_grid[i+1][j+1]
            v3 = verts_grid[i+1][j]
            bm.faces.new((v0, v1, v2, v3))

def make_tube_segment(bm, p1, p2, radius=0.022, segments=12):
    vec = p2 - p1
    length = vec.length
    if length < 1e-4: return
    center = (p1 + p2) * 0.5
    rot = Vector((0, 0, 1)).rotation_difference(vec).to_matrix().to_4x4()
    rc = bmesh.ops.create_cone(bm, cap_ends=True, radius1=radius, radius2=radius, depth=length, segments=segments)
    bmesh.ops.rotate(bm, cent=Vector((0,0,0)), matrix=rot, verts=rc['verts'])
    bmesh.ops.translate(bm, vec=center, verts=rc['verts'])

# ============================================================================
# MASTER COORDINATE BOUNDARIES (1:1 CAD Scale, 0-Gap Alignment)
# ============================================================================
# Axles: Front Y = +1.480, Rear Y = -1.480, Ground Z = 0.000, Wheel Center Z = 0.340
# Beltline: Z = 0.920, Waist X = 0.860 (Doors) to 0.940 (Fender/Quarter Haunches)
# Roof Crown: Z = 1.425, Roof Cantrail: X = 0.520
# Cowl / Windshield Base: Y = +0.940, Z = 0.920
# Windshield Header / Roof Front: Y = +0.280, Z = 1.420
# Roof Rear / Backlite Top: Y = -0.760, Z = 1.420
# Trunk Forward / Backlite Base: Y = -1.640, Z = 1.040
# Trunk Rear Lip: Y = -2.420, Z = 1.010
# Front Bumper Tip: Y = +2.480, Z = 0.440
# Rear Bumper Tip: Y = -2.520, Z = 0.520
# Rocker Sill: Z = 0.190

# ----------------------------------------------------------------------------
# 2. CLASS-A EXTERIOR BODY PANELS
# ----------------------------------------------------------------------------
log("Generating Class-A Exterior Body Panels (Zero-Gap Master Lofts)...")

# 2.1 HOOD / BONNET (hood.glb)
# Sculpted executive powerdome with dual swage lines
bm_hood = bmesh.new()
hood_rows = []
for i in range(8):
    t = i / 7.0
    y = 0.94 + (2.32 - 0.94) * t
    base_z = 0.92 - 0.22 * t
    w = 0.66 - 0.08 * t
    hood_rows.append([
        Vector((0.0, y, base_z + 0.015)),                # Center spine
        Vector((w * 0.35, y, base_z + 0.032)),          # Powerdome peak
        Vector((w * 0.70, y, base_z + 0.016)),          # Outer swage slope
        Vector((w * 1.00, y, base_z)),                  # Fender shutline
    ])
make_quad_patch(bm_hood, hood_rows)
bmesh.ops.solidify(bm_hood, geom=bm_hood.faces, thickness=0.005)
obj_hood = link_mirrored("GEO_Hood", bm_hood, MAT_PAINT, bevel=0.003, subsurf=1)
register_part("hood.glb", obj_hood)

# 2.2 FRONT FENDERS (front_left_fender.glb, front_right_fender.glb)
# Blends seamlessly from hood shutline (X=0.66..0.58) out to muscular wheel flares (X=0.94)
# and aligns with the front door beltline at Y=0.94
bm_fender = bmesh.new()
fender_rows = []
f_y_pts = [2.32, 2.05, 1.84, 1.48, 1.12, 0.94]
for f_y in f_y_pts:
    t_f = (f_y - 0.94) / (2.32 - 0.94)
    hood_x = 0.66 - 0.08 * t_f
    hood_z = 0.92 - 0.22 * t_f
    
    dy = f_y - 1.48
    if abs(dy) < 0.380:
        arch_z = 0.340 + math.sqrt(max(0.01, 0.380**2 - dy**2))
        flare_x = 0.945
        bot_z = arch_z
    else:
        flare_x = 0.920
        bot_z = 0.190

    # Door shutline alignment at Y = 0.94: matches door beltline X=0.86, waist X=0.93
    if abs(f_y - 0.94) < 1e-3:
        fender_rows.append([
            Vector((hood_x, f_y, hood_z)),
            Vector((0.760, f_y, 0.920)),
            Vector((0.860, f_y, 0.920)),                 # Matches door beltline
            Vector((0.930, f_y, 0.740)),                 # Matches door shoulder crease
            Vector((0.880, f_y, 0.190)),                 # Matches rocker sill
        ])
    else:
        fender_rows.append([
            Vector((hood_x, f_y, hood_z)),
            Vector((hood_x + (flare_x - hood_x) * 0.35, f_y, hood_z - 0.05)),
            Vector((hood_x + (flare_x - hood_x) * 0.70, f_y, (hood_z + bot_z) * 0.55)),
            Vector((flare_x, f_y, (hood_z + bot_z) * 0.50)),
            Vector((flare_x, f_y, bot_z)),
        ])
make_quad_patch(bm_fender, fender_rows)
bmesh.ops.solidify(bm_fender, geom=bm_fender.faces, thickness=0.005)
obj_fen_l, obj_fen_r = link_sided("GEO_Fender_Front_Left", "GEO_Fender_Front_Right", bm_fender, MAT_PAINT, bevel=0.003, subsurf=1)
register_part("front_left_fender.glb", obj_fen_l)
register_part("front_right_fender.glb", obj_fen_r)

# 2.3 FRONT BUMPER & AIR DAM (front_bumper.glb)
# Sculpted aerodynamic fascia with central air dam and side brake ducts
bm_fb = bmesh.new()
fb_rows = []
fb_stations = [
    # (y, z, x_center, x_mid, x_outer)
    (2.32, 0.70, 0.58, 0.74, 0.90),
    (2.40, 0.58, 0.56, 0.72, 0.88),
    (2.46, 0.44, 0.54, 0.70, 0.86),
    (2.48, 0.32, 0.52, 0.68, 0.84),
    (2.44, 0.19, 0.50, 0.66, 0.82),
]
for y_c, z_v, x1, x2, x3 in fb_stations:
    fb_rows.append([
        Vector((0.00, y_c, z_v)),
        Vector((x1 * 0.50, y_c, z_v)),
        Vector((x1, y_c - 0.04, z_v)),
        Vector((x2, y_c - 0.10, z_v * 0.98)),
        Vector((x3, y_c - 0.20, z_v * 0.95)),
    ])
make_quad_patch(bm_fb, fb_rows)
bmesh.ops.solidify(bm_fb, geom=bm_fb.faces, thickness=0.005)
obj_fb = link_mirrored("GEO_Front_Bumper", bm_fb, MAT_PAINT, bevel=0.004, subsurf=1)
register_part("front_bumper.glb", obj_fb)

# 2.4 DOORS (front_left_door.glb, front_right_door.glb, rear_left_door.glb, rear_right_door.glb)
# Precise shutlines from Y=0.94 (fender) down to Y=-1.28 (rear quarter haunch)
def make_door_panel(y_start, y_end, is_rear=False):
    bm = bmesh.new()
    door_rows = []
    num_steps = 7
    for i in range(num_steps):
        t_d = i / float(num_steps - 1)
        cur_y = y_start + (y_end - y_start) * t_d
        x_waist = 0.930 if not is_rear else 0.950
        x_sill = 0.880
        door_rows.append([
            Vector((0.860, cur_y, 0.920)),                       # Beltline
            Vector((x_waist, cur_y, 0.740)),                    # Athletic shoulder crease
            Vector((x_waist * 0.985, cur_y, 0.480)),            # Scalloped waist tuck
            Vector((x_sill, cur_y, 0.190)),                     # Rocker sill
        ])
    make_quad_patch(bm, door_rows)
    # Flush aerodynamic door handle pocket
    h_y = (y_start + y_end) * 0.5
    rc_h = bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=Vector((0.016, 0.14, 0.024)), verts=rc_h['verts'])
    bmesh.ops.translate(bm, vec=Vector((0.935, h_y, 0.880)), verts=rc_h['verts'])
    bmesh.ops.solidify(bm, geom=bm.faces, thickness=0.005)
    return bm

bm_df = make_door_panel(0.94, -0.28, is_rear=False)
obj_df_l, obj_df_r = link_sided("GEO_Door_Front_Left", "GEO_Door_Front_Right", bm_df, MAT_PAINT, bevel=0.003, subsurf=1)
register_part("front_left_door.glb", obj_df_l)
register_part("front_right_door.glb", obj_df_r)

bm_dr = make_door_panel(-0.28, -1.28, is_rear=True)
obj_dr_l, obj_dr_r = link_sided("GEO_Door_Rear_Left", "GEO_Door_Rear_Right", bm_dr, MAT_PAINT, bevel=0.003, subsurf=1)
register_part("rear_left_door.glb", obj_dr_l)
register_part("rear_right_door.glb", obj_dr_r)

# 2.5 REAR QUARTER PANELS & HAUNCHES (rear_quarter_left.glb, rear_quarter_right.glb)
# Wide-body rear stance (X=0.97m) over rear 295/30R20 tires, blending into trunk shutlines
bm_rq = bmesh.new()
rq_rows = []
rq_y_pts = [-1.28, -1.48, -1.72, -1.98, -2.24, -2.42]
for r_y in rq_y_pts:
    dy = r_y - (-1.48)
    if abs(dy) < 0.385:
        arch_z = 0.340 + math.sqrt(max(0.01, 0.385**2 - dy**2))
        flare_x = 0.970
        bot_z = arch_z
    else:
        flare_x = 0.940
        bot_z = 0.190
    
    t_rq = (r_y - (-1.28)) / (-2.42 - (-1.28))
    top_x = 0.860 - 0.280 * t_rq
    top_z = 0.920 + 0.090 * math.sin(t_rq * math.pi * 0.8)

    if abs(r_y - (-1.28)) < 1e-3:
        # Door shutline match at Y = -1.28
        rq_rows.append([
            Vector((0.860, r_y, 0.920)),
            Vector((0.950, r_y, 0.740)),
            Vector((0.935, r_y, 0.480)),
            Vector((0.880, r_y, 0.190)),
        ])
    else:
        rq_rows.append([
            Vector((top_x, r_y, top_z)),
            Vector((top_x + (flare_x - top_x) * 0.45, r_y, top_z - 0.12)),
            Vector((flare_x, r_y, (top_z + bot_z) * 0.50)),
            Vector((flare_x, r_y, bot_z)),
        ])
make_quad_patch(bm_rq, rq_rows)
bmesh.ops.solidify(bm_rq, geom=bm_rq.faces, thickness=0.005)
obj_rq_l, obj_rq_r = link_sided("GEO_Quarter_Rear_Left", "GEO_Quarter_Rear_Right", bm_rq, MAT_PAINT, bevel=0.003, subsurf=1)
register_part("rear_quarter_left.glb", obj_rq_l)
register_part("rear_quarter_right.glb", obj_rq_r)

# 2.6 ROOF PANEL (roof_panel.glb)
# Swept aerodynamic roof with double-bubble contour and shark fin antenna
bm_roof = bmesh.new()
roof_rows = []
for i in range(7):
    t_r = i / 6.0
    r_y = 0.28 + (-0.76 - 0.28) * t_r
    peak_z = 1.425 + 0.015 * math.sin(t_r * math.pi)
    roof_rows.append([
        Vector((0.0, r_y, peak_z - 0.006)),              # Central aero trough
        Vector((0.22, r_y, peak_z + 0.006)),             # Double bubble crown
        Vector((0.42, r_y, peak_z)),                     # Outer crown
        Vector((0.52, r_y, peak_z - 0.012)),             # Cantrail rebate
    ])
make_quad_patch(bm_roof, roof_rows)
# Shark Fin Antenna
rc_ant = bmesh.ops.create_cone(bm_roof, cap_ends=True, radius1=0.030, radius2=0.005, depth=0.070, segments=16)
bmesh.ops.rotate(bm_roof, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(-18), 4, 'X'), verts=rc_ant['verts'])
bmesh.ops.translate(bm_roof, vec=Vector((0.0, -0.62, 1.465)), verts=rc_ant['verts'])
bmesh.ops.solidify(bm_roof, geom=bm_roof.faces, thickness=0.005)
obj_roof = link_mirrored("GEO_Roof_Panel", bm_roof, MAT_PAINT, bevel=0.003, subsurf=1)
register_part("roof_panel.glb", obj_roof)

# 2.7 EXTERIOR A-PILLARS & ROOF CANTRAIL (a_pillar.glb)
# Seamless Class-A bodywork framing the windshield and front side glass
bm_ap = bmesh.new()
ap_rows = []
for i in range(7):
    t_a = i / 6.0
    ay = 0.94 + (0.28 - 0.94) * t_a
    az_roof = 0.92 + (1.42 - 0.92) * t_a + 0.035 * math.sin(t_a * math.pi)
    ax_in = 0.64 + (0.52 - 0.64) * t_a
    ax_out = 0.76 + (0.55 - 0.76) * t_a
    az_bot = 0.92 + (1.41 - 0.92) * t_a
    ap_rows.append([
        Vector((ax_in, ay, az_roof)),
        Vector((ax_out, ay, az_roof - 0.01)),
        Vector((ax_out + 0.05 * (1 - t_a), ay, (az_roof + az_bot) * 0.5)),
        Vector((0.86 * (1 - t_a) + 0.58 * t_a, ay, 0.92 * (1 - t_a) + 1.40 * t_a)),
    ])
make_quad_patch(bm_ap, ap_rows)
bmesh.ops.solidify(bm_ap, geom=bm_ap.faces, thickness=0.005)
obj_ap = link_mirrored("GEO_A_Pillars", bm_ap, MAT_PAINT, bevel=0.003, subsurf=1)
register_part("a_pillar.glb", obj_ap)

# 2.8 EXTERIOR C-PILLARS / SAIL PANELS & HOFMEISTER KINK (c_pillar.glb)
# Connects roof cantrail (X=0.52, Y=-0.76, Z=1.42) down to rear haunches (X=0.86, Y=-1.64, Z=1.04)
bm_cp = bmesh.new()
cp_rows = []
for i in range(7):
    t_c = i / 6.0
    cy = -0.76 + (-1.64 - (-0.76)) * t_c
    cz_top = 1.42 + (1.04 - 1.42) * t_c + 0.030 * math.sin(t_c * math.pi)
    cx_in = 0.52 + (0.64 - 0.52) * t_c
    cz_bot = 1.41 * (1 - t_c) + 0.96 * t_c
    cx_out = 0.56 * (1 - t_c) + 0.88 * t_c
    cp_rows.append([
        Vector((cx_in, cy, cz_top)),
        Vector((cx_in + (cx_out - cx_in) * 0.40, cy, cz_top * 0.85 + cz_bot * 0.15)),
        Vector((cx_in + (cx_out - cx_in) * 0.75, cy, cz_top * 0.50 + cz_bot * 0.50)),
        Vector((cx_out, cy, cz_bot)),
    ])
make_quad_patch(bm_cp, cp_rows)
bmesh.ops.solidify(bm_cp, geom=bm_cp.faces, thickness=0.005)
obj_cp = link_mirrored("GEO_C_Pillars", bm_cp, MAT_PAINT, bevel=0.003, subsurf=1)
register_part("c_pillar.glb", obj_cp)

# 2.9 FLUSH SHADOWLINE B-PILLARS (b_pillar.glb)
# High-gloss piano black pillar between front and rear door glass
bm_bp = bmesh.new()
for sx in [-1, 1]:
    rc_bp = bmesh.ops.create_cube(bm_bp, size=1.0)
    bmesh.ops.scale(bm_bp, vec=Vector((0.020, 0.065, 0.500)), verts=rc_bp['verts'])
    bmesh.ops.translate(bm_bp, vec=Vector((sx * 0.705, -0.280, 1.170)), verts=rc_bp['verts'])
obj_bp = link_and_finish("GEO_B_Pillars", bm_bp, MAT_GLOSS_BLACK, bevel=0.002, subsurf=0)
register_part("b_pillar.glb", obj_bp)

# 2.10 TRUNK DECKLID (trunk.glb)
# Fastback 3-box decklid with subtle negative rear camber
bm_trunk = bmesh.new()
trunk_rows = []
for i in range(6):
    t_t = i / 5.0
    t_y = -1.64 + (-2.42 - (-1.64)) * t_t
    t_z = 1.040 - 0.030 * t_t + (0.020 * (t_t**2))
    w_tk = 0.640 - 0.080 * t_t
    trunk_rows.append([
        Vector((0.00, t_y, t_z)),
        Vector((w_tk * 0.35, t_y, t_z * 0.995)),
        Vector((w_tk * 0.72, t_y, t_z * 0.990)),
        Vector((w_tk * 1.00, t_y, t_z * 0.982)),
    ])
make_quad_patch(bm_trunk, trunk_rows)
bmesh.ops.solidify(bm_trunk, geom=bm_trunk.faces, thickness=0.005)
obj_trunk = link_mirrored("GEO_Trunk", bm_trunk, MAT_PAINT, bevel=0.003, subsurf=1)
register_part("trunk.glb", obj_trunk)

# 2.11 REAR BUMPER & VALANCE (rear_bumper.glb)
bm_rb = bmesh.new()
rb_rows = []
for y_v, z_v in [(-2.42, 1.00), (-2.48, 0.82), (-2.52, 0.62), (-2.50, 0.40), (-2.44, 0.22)]:
    rb_rows.append([
        Vector((0.00, y_v, z_v)),
        Vector((0.26, y_v + 0.02, z_v)),
        Vector((0.54, y_v + 0.05, z_v)),
        Vector((0.74, y_v + 0.12, z_v)),
        Vector((0.92, y_v + 0.22, z_v)),
    ])
make_quad_patch(bm_rb, rb_rows)
bmesh.ops.solidify(bm_rb, geom=bm_rb.faces, thickness=0.005)
obj_rb = link_mirrored("GEO_Rear_Bumper", bm_rb, MAT_PAINT, bevel=0.004, subsurf=1)
register_part("rear_bumper.glb", obj_rb)

# ----------------------------------------------------------------------------
# 3. OPTICAL DIELECTRIC GLASS & GLAZING
# ----------------------------------------------------------------------------
log("Generating Optical Dielectric Glass Glazing...")

# 3.1 Windshield (windshield.glb)
bm_ws = bmesh.new()
ws_rows = []
for i in range(7):
    t_w = i / 6.0
    w_y = 0.94 + (0.28 - 0.94) * t_w
    w_z = 0.92 + (1.42 - 0.92) * t_w + 0.035 * math.sin(t_w * math.pi)
    w_span = 0.64 + (0.52 - 0.64) * t_w
    ws_rows.append([
        Vector((0.00, w_y, w_z)),
        Vector((w_span * 0.35, w_y, w_z * 0.996)),
        Vector((w_span * 0.72, w_y, w_z * 0.988)),
        Vector((w_span * 1.00, w_y - 0.015, w_z * 0.978)),
    ])
make_quad_patch(bm_ws, ws_rows)
bmesh.ops.solidify(bm_ws, geom=bm_ws.faces, thickness=0.004)
obj_ws = link_mirrored("GEO_Windshield", bm_ws, MAT_GLASS, bevel=0.002, subsurf=1)
register_part("windshield.glb", obj_ws)

# 3.2 Rear Glass / Backlite (rear_glass.glb)
bm_rg = bmesh.new()
rg_rows = []
for i in range(7):
    t_g = i / 6.0
    g_y = -0.76 + (-1.64 - (-0.76)) * t_g
    g_z = 1.42 + (1.04 - 1.42) * t_g + 0.030 * math.sin(t_g * math.pi)
    g_span = 0.52 + (0.64 - 0.52) * t_g
    rg_rows.append([
        Vector((0.00, g_y, g_z)),
        Vector((g_span * 0.35, g_y, g_z * 0.996)),
        Vector((g_span * 0.72, g_y, g_z * 0.988)),
        Vector((g_span * 1.00, g_y + 0.015, g_z * 0.978)),
    ])
make_quad_patch(bm_rg, rg_rows)
bmesh.ops.solidify(bm_rg, geom=bm_rg.faces, thickness=0.004)
obj_rg = link_mirrored("GEO_Rear_Glass", bm_rg, MAT_GLASS_TINT, bevel=0.002, subsurf=1)
register_part("rear_glass.glb", obj_rg)

# 3.3 Flush Side Windows (Strictly follow cabin roofline & A/C-pillar profiles)
bm_swf = bmesh.new()
swf_rows = []
for i in range(7):
    t_s = i / 6.0
    sy = 0.92 + (-0.28 - 0.92) * t_s
    if sy >= 0.28:
        t_a = (sy - 0.92) / (0.28 - 0.92)
        z_top = 0.93 + (1.415 - 0.93) * t_a
        x_top = 0.64 + (0.53 - 0.64) * t_a
    else:
        z_top = 1.415
        x_top = 0.530
    swf_rows.append([
        Vector((x_top, sy, z_top)),
        Vector((x_top + (0.855 - x_top) * 0.5, sy, (z_top + 0.92) * 0.5)),
        Vector((0.855, sy, 0.92)),
    ])
make_quad_patch(bm_swf, swf_rows)
bmesh.ops.solidify(bm_swf, geom=bm_swf.faces, thickness=0.003)
obj_sw_fl, obj_sw_fr = link_sided("GEO_SideWindow_FL", "GEO_SideWindow_FR", bm_swf, MAT_GLASS_TINT, bevel=0.001, subsurf=0)
register_part("side_window_front_left.glb", obj_sw_fl)
register_part("side_window_front_right.glb", obj_sw_fr)

bm_swr = bmesh.new()
swr_rows = []
for i in range(7):
    t_s = i / 6.0
    sy = -0.28 + (-1.28 - (-0.28)) * t_s
    if sy >= -0.76:
        z_top = 1.415
        x_top = 0.530
    else:
        t_c = (sy - (-0.76)) / (-1.28 - (-0.76))
        z_top = 1.415 + (0.98 - 1.415) * t_c
        x_top = 0.530 + (0.84 - 0.53) * t_c
    swr_rows.append([
        Vector((x_top, sy, z_top)),
        Vector((x_top + (0.855 - x_top) * 0.5, sy, (z_top + 0.92) * 0.5)),
        Vector((0.855, sy, 0.92)),
    ])
make_quad_patch(bm_swr, swr_rows)
bmesh.ops.solidify(bm_swr, geom=bm_swr.faces, thickness=0.003)
obj_sw_rl, obj_sw_rr = link_sided("GEO_SideWindow_RL", "GEO_SideWindow_RR", bm_swr, MAT_GLASS_TINT, bevel=0.001, subsurf=0)
register_part("side_window_rear_left.glb", obj_sw_rl)
register_part("side_window_rear_right.glb", obj_sw_rr)

# ----------------------------------------------------------------------------
# 4. OPTICAL LIGHTING & ACCESSORIES
# ----------------------------------------------------------------------------
log("Generating Optical Matrix LED, OLED Lighting & Mirrors...")

# 4.1 Matrix LED Headlights (headlamp_left.glb, headlamp_right.glb)
def make_headlight_cluster(is_left):
    bm = bmesh.new()
    sx = 1 if is_left else -1
    
    # Internal dark reflector bucket recessed inside front fascia
    rc_h = bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=Vector((0.14, 0.22, 0.055)), verts=rc_h['verts'])
    bmesh.ops.rotate(bm, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(-16 * sx), 4, 'Z'), verts=rc_h['verts'])
    bmesh.ops.translate(bm, vec=Vector((sx * 0.68, 2.24, 0.68)), verts=rc_h['verts'])
    
    # Twin LED Projector Lenses
    for dy_pj, dz_pj in [(-0.035, 0.010), (0.035, -0.010)]:
        rc_pj = bmesh.ops.create_cone(bm, cap_ends=True, radius1=0.028, radius2=0.028, depth=0.022, segments=24)
        bmesh.ops.rotate(bm, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.pi/2, 4, 'X'), verts=rc_pj['verts'])
        bmesh.ops.translate(bm, vec=Vector((sx * (0.68 + dy_pj * 0.45), 2.26 + dy_pj, 0.68 + dz_pj)), verts=rc_pj['verts'])
    
    # Ice-Blue DRL Lightguide Brow
    rc_drl = bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=Vector((0.135, 0.012, 0.008)), verts=rc_drl['verts'])
    bmesh.ops.rotate(bm, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(-16 * sx), 4, 'Z'), verts=rc_drl['verts'])
    bmesh.ops.translate(bm, vec=Vector((sx * 0.68, 2.27, 0.71)), verts=rc_drl['verts'])
    return bm

bm_hl_l = make_headlight_cluster(True)
bm_hl_r = make_headlight_cluster(False)
obj_hl_l = link_and_finish("GEO_Headlamp_Left", bm_hl_l, MAT_LED_HEAD, bevel=0.002, subsurf=0)
obj_hl_r = link_and_finish("GEO_Headlamp_Right", bm_hl_r, MAT_LED_HEAD, bevel=0.002, subsurf=0)
register_part("headlamp_left.glb", obj_hl_l)
register_part("headlamp_right.glb", obj_hl_r)

# 4.2 3D OLED Taillights & Continuous Ruby Lightbar (tail_lamp_left.glb, tail_lamp_right.glb)
def make_taillight_cluster(is_left):
    bm = bmesh.new()
    sx = 1 if is_left else -1
    rc_t = bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=Vector((0.36, 0.042, 0.032)), verts=rc_t['verts'])
    bmesh.ops.translate(bm, vec=Vector((sx * 0.48, -2.42, 0.88)), verts=rc_t['verts'])
    rc_in = bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=Vector((0.18, 0.040, 0.010)), verts=rc_in['verts'])
    bmesh.ops.translate(bm, vec=Vector((sx * 0.62, -2.41, 0.855)), verts=rc_in['verts'])
    return bm

bm_tl_l = make_taillight_cluster(True)
bm_tl_r = make_taillight_cluster(False)
obj_tl_l = link_and_finish("GEO_Taillight_Left", bm_tl_l, MAT_LED_TAIL, bevel=0.002, subsurf=0)
obj_tl_r = link_and_finish("GEO_Taillight_Right", bm_tl_r, MAT_LED_TAIL, bevel=0.002, subsurf=0)
register_part("tail_lamp_left.glb", obj_tl_l)
register_part("tail_lamp_right.glb", obj_tl_r)

# CHMSL Brake Light (brake_light.glb)
bm_bl = bmesh.new()
rc_bl = bmesh.ops.create_cube(bm_bl, size=1.0)
bmesh.ops.scale(bm_bl, vec=Vector((0.38, 0.024, 0.014)), verts=rc_bl['verts'])
bmesh.ops.translate(bm_bl, vec=Vector((0.0, -0.74, 1.415)), verts=rc_bl['verts'])
obj_bl = link_and_finish("GEO_Brake_Light", bm_bl, MAT_LED_TAIL, bevel=0.002, subsurf=0)
register_part("brake_light.glb", obj_bl)

# Indicators / Mirror repeaters (indicators.glb)
bm_ind = bmesh.new()
for sx in [-1, 1]:
    rc_i = bmesh.ops.create_cube(bm_ind, size=1.0)
    bmesh.ops.scale(bm_ind, vec=Vector((0.08, 0.012, 0.010)), verts=rc_i['verts'])
    bmesh.ops.translate(bm_ind, vec=Vector((sx * 0.97, 0.74, 0.94)), verts=rc_i['verts'])
obj_ind = link_and_finish("GEO_Indicators", bm_ind, MAT_LED_IND, bevel=0.002, subsurf=0)
register_part("indicators.glb", obj_ind)

# M-Style Aerodynamic Wing Mirrors (mirror_left.glb, mirror_right.glb)
def make_aero_mirror(is_left):
    bm = bmesh.new()
    sx = 1 if is_left else -1
    rc_stk = bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=Vector((0.06, 0.025, 0.020)), verts=rc_stk['verts'])
    bmesh.ops.translate(bm, vec=Vector((sx * 0.88, 0.72, 0.93)), verts=rc_stk['verts'])
    rc_m = bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=Vector((0.14, 0.11, 0.065)), verts=rc_m['verts'])
    bmesh.ops.rotate(bm, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(14 * sx), 4, 'Z'), verts=rc_m['verts'])
    bmesh.ops.translate(bm, vec=Vector((sx * 0.97, 0.72, 0.94)), verts=rc_m['verts'])
    return bm

bm_mir_l = make_aero_mirror(True)
bm_mir_r = make_aero_mirror(False)
obj_mir_l = link_and_finish("GEO_Mirror_Left", bm_mir_l, MAT_PAINT, bevel=0.004, subsurf=1)
obj_mir_r = link_and_finish("GEO_Mirror_Right", bm_mir_r, MAT_PAINT, bevel=0.004, subsurf=1)
register_part("mirror_left.glb", obj_mir_l)
register_part("mirror_right.glb", obj_mir_r)

# Executive Front Grille (grille.glb)
bm_gr = bmesh.new()
rc_gr = bmesh.ops.create_cube(bm_gr, size=1.0)
bmesh.ops.scale(bm_gr, vec=Vector((0.62, 0.04, 0.22)), verts=rc_gr['verts'])
bmesh.ops.translate(bm_gr, vec=Vector((0.0, 2.45, 0.52)), verts=rc_gr['verts'])
for dy_f in [-0.01, 0.01]:
    rc_fr = bmesh.ops.create_cube(bm_gr, size=1.0)
    bmesh.ops.scale(bm_gr, vec=Vector((0.64, 0.015, 0.24)), verts=rc_fr['verts'])
    bmesh.ops.translate(bm_gr, vec=Vector((0.0, 2.46, 0.52)), verts=rc_fr['verts'])
obj_gr = link_and_finish("GEO_Grille", bm_gr, MAT_GLOSS_BLACK, bevel=0.005, subsurf=0)
register_part("grille.glb", obj_gr)

# ----------------------------------------------------------------------------
# 5. AERODYNAMICS & EXHAUST SYSTEM
# ----------------------------------------------------------------------------
log("Generating Carbon Aerodynamics & Quad Titanium Exhausts...")

# Front Splitter (front_splitter.glb)
bm_sp = bmesh.new()
sp_rows = []
for i in range(5):
    t_s = i / 4.0
    sp_x = 0.88 * t_s
    sp_y = 2.46 - 0.16 * (t_s**2)
    sp_rows.append([
        Vector((sp_x, sp_y, 0.15)),
        Vector((sp_x, sp_y + 0.06, 0.145)),
    ])
make_quad_patch(bm_sp, sp_rows)
bmesh.ops.solidify(bm_sp, geom=bm_sp.faces, thickness=0.015)
for sx in [-0.88, 0.88]:
    rc_w = bmesh.ops.create_cube(bm_sp, size=1.0)
    bmesh.ops.scale(bm_sp, vec=Vector((0.018, 0.12, 0.055)), verts=rc_w['verts'])
    bmesh.ops.translate(bm_sp, vec=Vector((sx, 2.38, 0.170)), verts=rc_w['verts'])
obj_sp = link_mirrored("GEO_Front_Splitter", bm_sp, MAT_CARBON, bevel=0.003, subsurf=0)
register_part("front_splitter.glb", obj_sp)

# Front Aero Canards (front_canard.glb)
bm_can = bmesh.new()
for sx in [-1, 1]:
    rc_c = bmesh.ops.create_cube(bm_can, size=1.0)
    bmesh.ops.scale(bm_can, vec=Vector((0.12, 0.14, 0.010)), verts=rc_c['verts'])
    bmesh.ops.rotate(bm_can, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(-14), 4, 'X'), verts=rc_c['verts'])
    bmesh.ops.translate(bm_can, vec=Vector((sx * 0.86, 2.32, 0.42)), verts=rc_c['verts'])
obj_can = link_and_finish("GEO_Front_Canards", bm_can, MAT_CARBON, bevel=0.003, subsurf=0)
register_part("front_canard.glb", obj_can)

# Side Skirts (side_skirt.glb)
bm_sk = bmesh.new()
for sx in [-0.89, 0.89]:
    rc_s = bmesh.ops.create_cube(bm_sk, size=1.0)
    bmesh.ops.scale(bm_sk, vec=Vector((0.045, 2.15, 0.024)), verts=rc_s['verts'])
    bmesh.ops.translate(bm_sk, vec=Vector((sx, 0.00, 0.175)), verts=rc_s['verts'])
obj_sk = link_and_finish("GEO_Side_Skirts", bm_sk, MAT_CARBON, bevel=0.003, subsurf=0)
register_part("side_skirt.glb", obj_sk)

# Rear Diffuser & Quad Titanium Exhaust System (diffuser.glb)
bm_df = bmesh.new()
rc_d = bmesh.ops.create_cube(bm_df, size=1.0)
bmesh.ops.scale(bm_df, vec=Vector((1.42, 0.42, 0.045)), verts=rc_d['verts'])
bmesh.ops.translate(bm_df, vec=Vector((0.0, -2.40, 0.22)), verts=rc_d['verts'])
for sx in [-0.42, -0.18, 0.18, 0.42]:
    rc_fin = bmesh.ops.create_cube(bm_df, size=1.0)
    bmesh.ops.scale(bm_df, vec=Vector((0.014, 0.36, 0.065)), verts=rc_fin['verts'])
    bmesh.ops.translate(bm_df, vec=Vector((sx, -2.40, 0.19)), verts=rc_fin['verts'])
for sx in [-0.68, -0.58, 0.58, 0.68]:
    rc_pipe = bmesh.ops.create_cone(bm_df, cap_ends=True, radius1=0.045, radius2=0.045, depth=0.18, segments=24)
    bmesh.ops.rotate(bm_df, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.pi/2, 4, 'X'), verts=rc_pipe['verts'])
    bmesh.ops.translate(bm_df, vec=Vector((sx, -2.46, 0.24)), verts=rc_pipe['verts'])
obj_df = link_and_finish("GEO_Diffuser", bm_df, MAT_CARBON, bevel=0.003, subsurf=0)
register_part("diffuser.glb", obj_df)

# Integrated Carbon Ducktail Lip Spoiler (rear_wing.glb, rear_spoiler.glb)
bm_w = bmesh.new()
rc_w = bmesh.ops.create_cube(bm_w, size=1.0)
bmesh.ops.scale(bm_w, vec=Vector((1.12, 0.060, 0.022)), verts=rc_w['verts'])
bmesh.ops.rotate(bm_w, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(-12), 4, 'X'), verts=rc_w['verts'])
bmesh.ops.translate(bm_w, vec=Vector((0.0, -2.41, 1.025)), verts=rc_w['verts'])
obj_w = link_and_finish("GEO_Rear_Wing", bm_w, MAT_CARBON, bevel=0.003, subsurf=0)
register_part("rear_wing.glb", obj_w)
register_part("rear_spoiler.glb", obj_w)

# Active Aero Louvers (active_aero.glb)
bm_aa = bmesh.new()
for vz in [0.36, 0.42, 0.48]:
    rc_l = bmesh.ops.create_cube(bm_aa, size=1.0)
    bmesh.ops.scale(bm_aa, vec=Vector((0.64, 0.02, 0.016)), verts=rc_l['verts'])
    bmesh.ops.translate(bm_aa, vec=Vector((0.0, 2.40, vz)), verts=rc_l['verts'])
obj_aa = link_and_finish("GEO_Active_Aero", bm_aa, MAT_CARBON, bevel=0.002, subsurf=0)
register_part("active_aero.glb", obj_aa)

# Underbody Flat Floor Tray (underbody_panel.glb) - clipped neatly inside bumpers
bm_ub = bmesh.new()
rc_ub = bmesh.ops.create_cube(bm_ub, size=1.0)
bmesh.ops.scale(bm_ub, vec=Vector((1.65, 4.10, 0.015)), verts=rc_ub['verts'])
bmesh.ops.translate(bm_ub, vec=Vector((0.0, -0.05, 0.135)), verts=rc_ub['verts'])
obj_ub = link_and_finish("GEO_Underbody_Panel", bm_ub, MAT_CARBON, bevel=0.002, subsurf=0)
register_part("underbody_panel.glb", obj_ub)

# ----------------------------------------------------------------------------
# 6. INTERNAL REINFORCEMENT CELL (SUB-SURFACE CONCEALED)
# ----------------------------------------------------------------------------
log("Generating Sub-Surface Internal Structural Cell...")

bm_rf_st = bmesh.new()
for cy in [0.18, -0.28, -0.68]:
    p1 = Vector((-0.42, cy, 1.38))
    p2 = Vector((0.42, cy, 1.38))
    make_tube_segment(bm_rf_st, p1, p2, radius=0.016)
obj_rf_st = link_and_finish("GEO_Roof_Structure", bm_rf_st, MAT_STEEL, bevel=0.003, subsurf=0)
register_part("roof_structure.glb", obj_rf_st)

bm_biw = bmesh.new()
for sx in [-0.76, 0.76]:
    rc_b = bmesh.ops.create_cube(bm_biw, size=1.0)
    bmesh.ops.scale(bm_biw, vec=Vector((0.08, 2.20, 0.10)), verts=rc_b['verts'])
    bmesh.ops.translate(bm_biw, vec=Vector((sx, 0.00, 0.20)), verts=rc_b['verts'])
obj_biw = link_and_finish("GEO_Body_Framework", bm_biw, MAT_STEEL, bevel=0.003, subsurf=0)
register_part("body_framework.glb", obj_biw)

bm_rs = bmesh.new()
rc_rs = bmesh.ops.create_cube(bm_rs, size=1.0)
bmesh.ops.scale(bm_rs, vec=Vector((1.15, 0.30, 0.03)), verts=rc_rs['verts'])
bmesh.ops.translate(bm_rs, vec=Vector((0.0, -1.35, 0.94)), verts=rc_rs['verts'])
obj_rs = link_and_finish("GEO_Rear_Structure", bm_rs, MAT_STEEL, bevel=0.003, subsurf=0)
register_part("rear_structure.glb", obj_rs)

bm_wh_f = bmesh.new()
for sx in [-0.80, 0.80]:
    rc_wf = bmesh.ops.create_cone(bm_wh_f, cap_ends=False, radius1=0.380, radius2=0.380, depth=0.20, segments=32)
    bmesh.ops.rotate(bm_wh_f, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.pi/2, 4, 'Y'), verts=rc_wf['verts'])
    bmesh.ops.translate(bm_wh_f, vec=Vector((sx, 1.48, 0.34)), verts=rc_wf['verts'])
obj_wh_f = link_and_finish("GEO_Wheelhouse_Front", bm_wh_f, MAT_GLOSS_BLACK, bevel=0.0, subsurf=0)
register_part("wheelhouse_front.glb", obj_wh_f)

bm_wh_r = bmesh.new()
for sx in [-0.80, 0.80]:
    rc_wr = bmesh.ops.create_cone(bm_wh_r, cap_ends=False, radius1=0.385, radius2=0.385, depth=0.22, segments=32)
    bmesh.ops.rotate(bm_wh_r, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.pi/2, 4, 'Y'), verts=rc_wr['verts'])
    bmesh.ops.translate(bm_wh_r, vec=Vector((sx, -1.48, 0.34)), verts=rc_wr['verts'])
obj_wh_r = link_and_finish("GEO_Wheelhouse_Rear", bm_wh_r, MAT_GLOSS_BLACK, bevel=0.0, subsurf=0)
register_part("wheelhouse_rear.glb", obj_wh_r)

# ----------------------------------------------------------------------------
# 7. CHASSIS PLATFORM & CRASH STRUCTURES
# ----------------------------------------------------------------------------
log("Generating Chassis Platform & Crash Structures...")

bm_ch = bmesh.new()
for sx in [-0.68, 0.68]:
    rc_c = bmesh.ops.create_cube(bm_ch, size=1.0)
    bmesh.ops.scale(bm_ch, vec=Vector((0.12, 2.95, 0.10)), verts=rc_c['verts'])
    bmesh.ops.translate(bm_ch, vec=Vector((sx, 0.00, 0.20)), verts=rc_c['verts'])
rc_tub = bmesh.ops.create_cube(bm_ch, size=1.0)
bmesh.ops.scale(bm_ch, vec=Vector((1.24, 2.10, 0.12)), verts=rc_tub['verts'])
bmesh.ops.translate(bm_ch, vec=Vector((0.0, -0.05, 0.19)), verts=rc_tub['verts'])
obj_ch = link_and_finish("GEO_Chassis_Main", bm_ch, MAT_STEEL, bevel=0.005, subsurf=0)
register_part("chassis_main.glb", obj_ch)

bm_fs = bmesh.new()
rc_fs = bmesh.ops.create_cube(bm_fs, size=1.0)
bmesh.ops.scale(bm_fs, vec=Vector((1.08, 0.72, 0.10)), verts=rc_fs['verts'])
bmesh.ops.translate(bm_fs, vec=Vector((0.0, 1.48, 0.22)), verts=rc_fs['verts'])
obj_fs = link_and_finish("GEO_Front_Subframe", bm_fs, MAT_ALUM, bevel=0.004, subsurf=0)
register_part("front_subframe.glb", obj_fs)

bm_rsf = bmesh.new()
rc_rsf = bmesh.ops.create_cube(bm_rsf, size=1.0)
bmesh.ops.scale(bm_rsf, vec=Vector((1.12, 0.76, 0.10)), verts=rc_rsf['verts'])
bmesh.ops.translate(bm_rsf, vec=Vector((0.0, -1.48, 0.22)), verts=rc_rsf['verts'])
obj_rsf = link_and_finish("GEO_Rear_Subframe", bm_rsf, MAT_ALUM, bevel=0.004, subsurf=0)
register_part("rear_subframe.glb", obj_rsf)

bm_fl = bmesh.new()
rc_fl = bmesh.ops.create_cube(bm_fl, size=1.0)
bmesh.ops.scale(bm_fl, vec=Vector((1.60, 4.00, 0.02)), verts=rc_fl['verts'])
bmesh.ops.translate(bm_fl, vec=Vector((0.0, -0.05, 0.14)), verts=rc_fl['verts'])
obj_fl = link_and_finish("GEO_Floor_Structure", bm_fl, MAT_CARBON, bevel=0.002, subsurf=0)
register_part("floor_structure.glb", obj_fl)

bm_fw = bmesh.new()
rc_fw = bmesh.ops.create_cube(bm_fw, size=1.0)
bmesh.ops.scale(bm_fw, vec=Vector((1.42, 0.04, 0.65)), verts=rc_fw['verts'])
bmesh.ops.translate(bm_fw, vec=Vector((0.0, 0.94, 0.56)), verts=rc_fw['verts'])
obj_fw = link_and_finish("GEO_Firewall", bm_fw, MAT_STEEL, bevel=0.004, subsurf=0)
register_part("firewall.glb", obj_fw)

# Crash Structures - strictly inside bumper envelopes
bm_cf = bmesh.new()
rc_cf = bmesh.ops.create_cube(bm_cf, size=1.0)
bmesh.ops.scale(bm_cf, vec=Vector((1.12, 0.10, 0.12)), verts=rc_cf['verts'])
bmesh.ops.translate(bm_cf, vec=Vector((0.0, 2.22, 0.38)), verts=rc_cf['verts'])
obj_cf = link_and_finish("GEO_Crash_Structure_Front", bm_cf, MAT_ALUM, bevel=0.004, subsurf=0)
register_part("crash_structure_front.glb", obj_cf)

bm_cr = bmesh.new()
rc_cr = bmesh.ops.create_cube(bm_cr, size=1.0)
bmesh.ops.scale(bm_cr, vec=Vector((1.15, 0.10, 0.12)), verts=rc_cr['verts'])
bmesh.ops.translate(bm_cr, vec=Vector((0.0, -2.25, 0.42)), verts=rc_cr['verts'])
obj_cr = link_and_finish("GEO_Crash_Structure_Rear", bm_cr, MAT_ALUM, bevel=0.004, subsurf=0)
register_part("crash_structure_rear.glb", obj_cr)

# ----------------------------------------------------------------------------
# 8. POWERTRAIN & DRIVETRAIN
# ----------------------------------------------------------------------------
log("Generating 4.4L Twin-Turbo V8 Powertrain...")

bm_eb = bmesh.new()
rc_eb = bmesh.ops.create_cube(bm_eb, size=1.0)
bmesh.ops.scale(bm_eb, vec=Vector((0.52, 0.60, 0.36)), verts=rc_eb['verts'])
bmesh.ops.translate(bm_eb, vec=Vector((0.0, 1.48, 0.46)), verts=rc_eb['verts'])
obj_eb = link_and_finish("GEO_Engine_Block", bm_eb, MAT_ALUM, bevel=0.005, subsurf=0)
register_part("engine_block.glb", obj_eb)

bm_chd = bmesh.new()
for sx in [-0.20, 0.20]:
    rc_c = bmesh.ops.create_cube(bm_chd, size=1.0)
    bmesh.ops.scale(bm_chd, vec=Vector((0.16, 0.56, 0.12)), verts=rc_c['verts'])
    bmesh.ops.translate(bm_chd, vec=Vector((sx, 1.48, 0.66)), verts=rc_c['verts'])
obj_chd = link_and_finish("GEO_Cylinder_Heads", bm_chd, MAT_CALIPER, bevel=0.004, subsurf=0)
register_part("cylinder_heads.glb", obj_chd)

bm_pl = bmesh.new()
rc_pl = bmesh.ops.create_cube(bm_pl, size=1.0)
bmesh.ops.scale(bm_pl, vec=Vector((0.34, 0.46, 0.10)), verts=rc_pl['verts'])
bmesh.ops.translate(bm_pl, vec=Vector((0.0, 1.48, 0.75)), verts=rc_pl['verts'])
obj_pl = link_and_finish("GEO_Intake_Plenum", bm_pl, MAT_CARBON, bevel=0.004, subsurf=0)
register_part("intake_plenum.glb", obj_pl)

bm_ex = bmesh.new()
for sx in [-0.30, 0.30]:
    rc_x = bmesh.ops.create_cube(bm_ex, size=1.0)
    bmesh.ops.scale(bm_ex, vec=Vector((0.09, 0.52, 0.10)), verts=rc_x['verts'])
    bmesh.ops.translate(bm_ex, vec=Vector((sx, 1.48, 0.40)), verts=rc_x['verts'])
obj_ex = link_and_finish("GEO_Exhaust_Headers", bm_ex, MAT_EXHAUST, bevel=0.004, subsurf=0)
register_part("exhaust_headers.glb", obj_ex)

bm_tb = bmesh.new()
for sx in [-0.36, 0.36]:
    rc_t = bmesh.ops.create_cone(bm_tb, cap_ends=True, radius1=0.08, radius2=0.045, depth=0.13, segments=24)
    bmesh.ops.translate(bm_tb, vec=Vector((sx, 1.28, 0.42)), verts=rc_t['verts'])
obj_tb = link_and_finish("GEO_Turbochargers", bm_tb, MAT_EXHAUST, bevel=0.003, subsurf=0)
register_part("turbochargers.glb", obj_tb)

bm_tr = bmesh.new()
rc_tr = bmesh.ops.create_cube(bm_tr, size=1.0)
bmesh.ops.scale(bm_tr, vec=Vector((0.36, 0.62, 0.32)), verts=rc_tr['verts'])
bmesh.ops.translate(bm_tr, vec=Vector((0.0, 0.90, 0.36)), verts=rc_tr['verts'])
obj_tr = link_and_finish("GEO_Transmission", bm_tr, MAT_ALUM, bevel=0.004, subsurf=0)
register_part("transmission.glb", obj_tr)

bm_ds = bmesh.new()
rc_ds = bmesh.ops.create_cone(bm_ds, cap_ends=True, radius1=0.042, radius2=0.042, depth=2.15, segments=24)
bmesh.ops.rotate(bm_ds, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.pi/2, 4, 'X'), verts=rc_ds['verts'])
bmesh.ops.translate(bm_ds, vec=Vector((0.0, -0.45, 0.30)), verts=rc_ds['verts'])
obj_ds = link_and_finish("GEO_Driveshaft", bm_ds, MAT_CARBON, bevel=0.002, subsurf=0)
register_part("driveshaft.glb", obj_ds)

bm_dc = bmesh.new()
rc_dc = bmesh.ops.create_cube(bm_dc, size=1.0)
bmesh.ops.scale(bm_dc, vec=Vector((0.34, 0.36, 0.26)), verts=rc_dc['verts'])
bmesh.ops.translate(bm_dc, vec=Vector((0.0, -1.48, 0.32)), verts=rc_dc['verts'])
obj_dc = link_and_finish("GEO_Differential", bm_dc, MAT_ALUM, bevel=0.004, subsurf=0)
register_part("differential.glb", obj_dc)

# ----------------------------------------------------------------------------
# 9. SUSPENSION & BRAKES
# ----------------------------------------------------------------------------
log("Generating Adaptive Suspension & Brembo Brakes...")

bm_sf = bmesh.new()
for sx in [-1, 1]:
    ra1 = bmesh.ops.create_cube(bm_sf, size=1.0)
    bmesh.ops.scale(bm_sf, vec=Vector((0.30, 0.24, 0.032)), verts=ra1['verts'])
    bmesh.ops.translate(bm_sf, vec=Vector((sx * 0.62, 1.48, 0.22)), verts=ra1['verts'])
    ra2 = bmesh.ops.create_cube(bm_sf, size=1.0)
    bmesh.ops.scale(bm_sf, vec=Vector((0.26, 0.20, 0.030)), verts=ra2['verts'])
    bmesh.ops.translate(bm_sf, vec=Vector((sx * 0.64, 1.48, 0.42)), verts=ra2['verts'])
obj_sf = link_and_finish("GEO_Suspension_Front", bm_sf, MAT_ALUM, bevel=0.003, subsurf=0)
register_part("suspension_wishbones_front.glb", obj_sf)

bm_sr = bmesh.new()
for sx in [-1, 1]:
    ra1 = bmesh.ops.create_cube(bm_sr, size=1.0)
    bmesh.ops.scale(bm_sr, vec=Vector((0.32, 0.26, 0.032)), verts=ra1['verts'])
    bmesh.ops.translate(bm_sr, vec=Vector((sx * 0.62, -1.48, 0.22)), verts=ra1['verts'])
    ra2 = bmesh.ops.create_cube(bm_sr, size=1.0)
    bmesh.ops.scale(bm_sr, vec=Vector((0.26, 0.22, 0.030)), verts=ra2['verts'])
    bmesh.ops.translate(bm_sr, vec=Vector((sx * 0.64, -1.48, 0.42)), verts=ra2['verts'])
obj_sr = link_and_finish("GEO_Suspension_Rear", bm_sr, MAT_ALUM, bevel=0.003, subsurf=0)
register_part("suspension_wishbones_rear.glb", obj_sr)

bm_co = bmesh.new()
for cy in [1.48, -1.48]:
    for sx in [-0.70, 0.70]:
        rc_c = bmesh.ops.create_cone(bm_co, cap_ends=True, radius1=0.045, radius2=0.045, depth=0.36, segments=24)
        bmesh.ops.translate(bm_co, vec=Vector((sx, cy, 0.42)), verts=rc_c['verts'])
obj_co = link_and_finish("GEO_Coilovers", bm_co, MAT_CALIPER, bevel=0.003, subsurf=0)
register_part("coilovers.glb", obj_co)

bm_ar = bmesh.new()
for cy in [1.62, -1.62]:
    rc_a = bmesh.ops.create_cone(bm_ar, cap_ends=True, radius1=0.020, radius2=0.020, depth=1.30, segments=24)
    bmesh.ops.rotate(bm_ar, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.pi/2, 4, 'Y'), verts=rc_a['verts'])
    bmesh.ops.translate(bm_ar, vec=Vector((0.0, cy, 0.22)), verts=rc_a['verts'])
obj_ar = link_and_finish("GEO_Antiroll_Bars", bm_ar, MAT_STEEL, bevel=0.002, subsurf=0)
register_part("antiroll_bars.glb", obj_ar)

bm_st = bmesh.new()
rc_st = bmesh.ops.create_cube(bm_st, size=1.0)
bmesh.ops.scale(bm_st, vec=Vector((1.20, 0.08, 0.08)), verts=rc_st['verts'])
bmesh.ops.translate(bm_st, vec=Vector((0.0, 1.58, 0.26)), verts=rc_st['verts'])
obj_st = link_and_finish("GEO_Steering_Rack", bm_st, MAT_ALUM, bevel=0.003, subsurf=0)
register_part("steering_rack.glb", obj_st)

def make_rotors(is_front):
    bm = bmesh.new()
    cy = 1.48 if is_front else -1.48
    rd = 0.210 if is_front else 0.198
    for sx in [-0.83, 0.83]:
        shift_x = -0.035 if sx > 0 else 0.035
        rc_r = bmesh.ops.create_cone(bm, cap_ends=True, radius1=rd, radius2=rd, depth=0.026, segments=36)
        bmesh.ops.rotate(bm, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.pi/2, 4, 'Y'), verts=rc_r['verts'])
        bmesh.ops.translate(bm, vec=Vector((sx + shift_x, cy, 0.340)), verts=rc_r['verts'])
    return bm

bm_rt_f = make_rotors(True)
bm_rt_r = make_rotors(False)
obj_rt_f = link_and_finish("GEO_Brake_Rotors_Front", bm_rt_f, MAT_ROTOR, bevel=0.002, subsurf=0)
obj_rt_r = link_and_finish("GEO_Brake_Rotors_Rear", bm_rt_r, MAT_ROTOR, bevel=0.002, subsurf=0)
register_part("brake_rotors_front.glb", obj_rt_f)
register_part("brake_rotors_rear.glb", obj_rt_r)

bm_cal = bmesh.new()
for cy in [1.48, -1.48]:
    for sx in [-0.83, 0.83]:
        shift_x = -0.035 if sx > 0 else 0.035
        rc_cl = bmesh.ops.create_cube(bm_cal, size=1.0)
        bmesh.ops.scale(bm_cal, vec=Vector((0.075, 0.070, 0.21)), verts=rc_cl['verts'])
        bmesh.ops.translate(bm_cal, vec=Vector((sx + shift_x, cy + 0.12, 0.43)), verts=rc_cl['verts'])
obj_cal = link_and_finish("GEO_Brake_Calipers", bm_cal, MAT_CALIPER, bevel=0.005, subsurf=1)
register_part("brake_calipers.glb", obj_cal)

# ----------------------------------------------------------------------------
# 10. 20-INCH FORGED 5-TWIN-SPOKE TURBINE WHEELS & PERFORMANCE TIRES
# ----------------------------------------------------------------------------
log("Generating 20-Inch Forged 5-Twin-Spoke Wheels & Tires...")

def make_wheel_assembly(corner_id, x_pos, y_pos, is_front):
    is_left = x_pos > 0
    w_width = 0.265 if is_front else 0.305
    r_barrel = 0.254 # 10" radius = 20" diameter
    r_tire = 0.340   # Tire outer radius (ground contact Z=0.000m)

    # 10.1 PERFORMANCE TIRE (Radial Bead Flush to Alloy Barrel)
    bm_t = bmesh.new()
    rc_out = bmesh.ops.create_cone(bm_t, cap_ends=False, radius1=r_tire, radius2=r_tire, depth=w_width, segments=48)
    bmesh.ops.rotate(bm_t, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.pi/2, 4, 'Y'), verts=rc_out['verts'])
    bmesh.ops.translate(bm_t, vec=Vector((x_pos, y_pos, 0.340)), verts=rc_out['verts'])
    bmesh.ops.solidify(bm_t, geom=bm_t.faces, thickness=(r_tire - r_barrel))
    obj_tire = link_and_finish(f"GEO_Tire_{corner_id.upper()}", bm_t, MAT_TIRE, bevel=0.004, subsurf=1)
    register_part(f"tire_{corner_id}.glb", obj_tire)

    # 10.2 FORGED 5-TWIN-SPOKE TURBINE ALLOY RIM
    bm_r = bmesh.new()
    rc_bar = bmesh.ops.create_cone(bm_r, cap_ends=False, radius1=r_barrel, radius2=r_barrel, depth=w_width * 0.96, segments=48)
    bmesh.ops.rotate(bm_r, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.pi/2, 4, 'Y'), verts=rc_bar['verts'])
    bmesh.ops.translate(bm_r, vec=Vector((x_pos, y_pos, 0.340)), verts=rc_bar['verts'])
    bmesh.ops.solidify(bm_r, geom=bm_r.faces, thickness=0.016)

    out_shift = (w_width * 0.42) if is_left else -(w_width * 0.42)
    for spk_idx in range(5):
        angle = spk_idx * (2 * math.pi / 5)
        for d_ang in [-0.075, 0.075]:
            a = angle + d_ang
            spoke = bmesh.ops.create_cube(bm_r, size=1.0)
            bmesh.ops.scale(bm_r, vec=Vector((0.016, 0.024, r_barrel * 0.84)), verts=spoke['verts'])
            bmesh.ops.rotate(bm_r, cent=Vector((0,0,0)), matrix=Matrix.Rotation(a, 4, 'X'), verts=spoke['verts'])
            bmesh.ops.translate(bm_r, vec=Vector((
                x_pos + out_shift,
                y_pos + math.sin(a) * (r_barrel * 0.46),
                0.340 + math.cos(a) * (r_barrel * 0.46)
            )), verts=spoke['verts'])

    rhub = bmesh.ops.create_cone(bm_r, cap_ends=True, radius1=0.075, radius2=0.075, depth=0.040, segments=32)
    bmesh.ops.rotate(bm_r, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.pi/2, 4, 'Y'), verts=rhub['verts'])
    bmesh.ops.translate(bm_r, vec=Vector((x_pos + out_shift * 0.85, y_pos, 0.340)), verts=rhub['verts'])

    obj_rim = link_and_finish(f"GEO_WheelRim_{corner_id.upper()}", bm_r, MAT_ALLOY, bevel=0.003, subsurf=1)
    register_part(f"wheel_rim_{corner_id}.glb", obj_rim)

make_wheel_assembly("fl", 0.83, 1.48, True)
make_wheel_assembly("fr", -0.83, 1.48, True)
make_wheel_assembly("rl", 0.84, -1.48, False)
make_wheel_assembly("rr", -0.84, -1.48, False)

# ----------------------------------------------------------------------------
# 11. LUXURY EXECUTIVE COCKPIT INTERIOR
# ----------------------------------------------------------------------------
log("Generating Executive Cockpit Interior...")

bm_dash = bmesh.new()
rc_db = bmesh.ops.create_cube(bm_dash, size=1.0)
bmesh.ops.scale(bm_dash, vec=Vector((1.42, 0.40, 0.22)), verts=rc_db['verts'])
bmesh.ops.translate(bm_dash, vec=Vector((0.0, 0.65, 0.80)), verts=rc_db['verts'])
obj_dash = link_and_finish("GEO_Dashboard", bm_dash, MAT_LEATHER, bevel=0.006, subsurf=0)
register_part("dashboard.glb", obj_dash)

bm_sw = bmesh.new()
rc_sw = bmesh.ops.create_cone(bm_sw, cap_ends=False, radius1=0.175, radius2=0.175, depth=0.032, segments=32)
bmesh.ops.rotate(bm_sw, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(-22), 4, 'X'), verts=rc_sw['verts'])
bmesh.ops.translate(bm_sw, vec=Vector((0.38, 0.38, 0.82)), verts=rc_sw['verts'])
bmesh.ops.solidify(bm_sw, geom=bm_sw.faces, thickness=0.024)
obj_sw = link_and_finish("GEO_Steering_Wheel", bm_sw, MAT_LEATHER, bevel=0.003, subsurf=0)
register_part("steering_wheel.glb", obj_sw)

bm_st = bmesh.new()
for sy in [0.05, -0.75]:
    for sx in [-0.38, 0.38]:
        sb = bmesh.ops.create_cube(bm_st, size=1.0)
        bmesh.ops.scale(bm_st, vec=Vector((0.44, 0.48, 0.12)), verts=sb['verts'])
        bmesh.ops.translate(bm_st, vec=Vector((sx, sy, 0.32)), verts=sb['verts'])
        sbk = bmesh.ops.create_cube(bm_st, size=1.0)
        bmesh.ops.scale(bm_st, vec=Vector((0.42, 0.12, 0.55)), verts=sbk['verts'])
        bmesh.ops.rotate(bm_st, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(14), 4, 'X'), verts=sbk['verts'])
        bmesh.ops.translate(bm_st, vec=Vector((sx, sy - 0.20, 0.62)), verts=sbk['verts'])
obj_seats = link_and_finish("GEO_Interior_Seats", bm_st, MAT_LEATHER, bevel=0.008, subsurf=0)
register_part("seats.glb", obj_seats)

bm_cc = bmesh.new()
rc_cc = bmesh.ops.create_cube(bm_cc, size=1.0)
bmesh.ops.scale(bm_cc, vec=Vector((0.26, 1.40, 0.22)), verts=rc_cc['verts'])
bmesh.ops.translate(bm_cc, vec=Vector((0.0, 0.05, 0.42)), verts=rc_cc['verts'])
obj_cc = link_and_finish("GEO_Center_Console", bm_cc, MAT_CARBON, bevel=0.005, subsurf=0)
register_part("center_console.glb", obj_cc)

bm_dp = bmesh.new()
for sx in [-0.80, 0.80]:
    for dy in [0.35, -0.75]:
        rc_d = bmesh.ops.create_cube(bm_dp, size=1.0)
        bmesh.ops.scale(bm_dp, vec=Vector((0.06, 0.85, 0.45)), verts=rc_d['verts'])
        bmesh.ops.translate(bm_dp, vec=Vector((sx, dy, 0.60)), verts=rc_d['verts'])
obj_dp = link_and_finish("GEO_Door_Panels", bm_dp, MAT_LEATHER, bevel=0.006, subsurf=0)
register_part("door_panels.glb", obj_dp)

bm_ic = bmesh.new()
rc_i = bmesh.ops.create_cube(bm_ic, size=1.0)
bmesh.ops.scale(bm_ic, vec=Vector((0.28, 0.02, 0.12)), verts=rc_i['verts'])
bmesh.ops.translate(bm_ic, vec=Vector((0.38, 0.56, 0.92)), verts=rc_i['verts'])
obj_ic = link_and_finish("GEO_Instrument_Cluster", bm_ic, MAT_SCREEN, bevel=0.002, subsurf=0)
register_part("instrument_cluster.glb", obj_ic)

bm_if = bmesh.new()
rc_f = bmesh.ops.create_cube(bm_if, size=1.0)
bmesh.ops.scale(bm_if, vec=Vector((0.36, 0.02, 0.18)), verts=rc_f['verts'])
bmesh.ops.translate(bm_if, vec=Vector((0.00, 0.58, 0.94)), verts=rc_f['verts'])
obj_if = link_and_finish("GEO_Infotainment", bm_if, MAT_SCREEN, bevel=0.002, subsurf=0)
register_part("infotainment.glb", obj_if)

# ----------------------------------------------------------------------------
# 12. EXPORT PASS: ALL 82 MODULAR GLBS & COMPLETE ASSEMBLED SEDAN GLB
# ----------------------------------------------------------------------------
log("=================================================================")
log(f"SERIALIZING {len(EXPORT_REGISTRY)} MODULAR CAD PARTS TO GLB")
log("=================================================================")

for filename, objs in EXPORT_REGISTRY.items():
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]

    public_out = os.path.join(PUBLIC_MODULAR_DIR, filename)
    exports_out = os.path.join(EXPORTS_PARTS_DIR, filename)

    for target_path in [public_out, exports_out]:
        bpy.ops.export_scene.gltf(
            filepath=target_path,
            use_selection=True,
            export_format='GLB',
            export_apply=True,
            export_yup=True,
            export_materials='EXPORT'
        )

log("✓ All modular individual parts exported with zero-offset world coordinates.")

# Serializing complete assembled sedan
log("Serializing Unified Class-A Executive Sport Sedan GLB...")
bpy.ops.object.select_all(action='SELECT')

complete_targets = [
    os.path.join(PUBLIC_MODELS_DIR, "Car_Sedan_Complete.glb"),
    os.path.join(PUBLIC_MODELS_DIR, "Car_Complete.glb"),
    os.path.join(PUBLIC_VEHICLES_SEDAN_DIR, "complete-sedan.glb"),
    os.path.join(EXPORTS_DIR, "Car_Sedan_Complete.glb"),
]

for target in complete_targets:
    bpy.ops.export_scene.gltf(
        filepath=target,
        use_selection=True,
        export_format='GLB',
        export_apply=True,
        export_yup=True,
        export_materials='EXPORT'
    )
    sz_mb = os.path.getsize(target) / (1024 * 1024)
    log(f"✓ Complete Sedan serialized: {target} ({sz_mb:.2f} MB)")

log("=================================================================")
log("  MASTER PROCEDURAL EXECUTIVE SPORT SEDAN PIPELINE FINISHED!")
log("=================================================================")
