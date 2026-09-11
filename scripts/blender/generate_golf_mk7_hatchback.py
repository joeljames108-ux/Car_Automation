"""
==============================================================================
PROCEDURAL VOLKSWAGEN GOLF MK7 5-DOOR HATCHBACK
==============================================================================
Generates a complete VW Golf Mk7 hatchback based on reference blueprints:
  - Front, Side, Rear, Top views provided by user
  - 5-door hatchback configuration
  - Accurate dimensions: L 4,255mm × W 1,799mm × H 1,452mm
  - Wheelbase 2,637mm, Track F 1,549mm / R 1,522mm

Coordinate standard (matching project):
  +Y = Forward, -Y = Rearward
  +Z = Up, Ground at Z=0
  +X = Driver LHD side
==============================================================================
"""

import bpy
import bmesh
import math
import os
from mathutils import Vector, Matrix

def log(msg):
    print(f"[GOLF_MK7] {msg}")

# ============================================================================
# 1. SETUP
# ============================================================================
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
EXPORTS_DIR = os.path.join(PROJECT_DIR, "exports")
os.makedirs(EXPORTS_DIR, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
for obj in list(bpy.data.objects):
    bpy.data.objects.remove(obj, do_unlink=True)
for col in list(bpy.data.collections):
    bpy.data.collections.remove(col)
for block in [bpy.data.meshes, bpy.data.materials, bpy.data.curves]:
    for item in list(block):
        if item.users == 0:
            block.remove(item)

scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
scene.unit_settings.scale_length = 1.0

# ============================================================================
# 2. PBR MATERIALS
# ============================================================================
def set_socket(principled, names, val):
    for n in names:
        if n in principled.inputs:
            principled.inputs[n].default_value = val
            return True
    return False

def make_mat(name, base_color, metallic=0.0, roughness=0.5, clearcoat=0.0, transmission=0.0, alpha=1.0, emission=None, emission_strength=1.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()
    bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    out = nodes.new(type='ShaderNodeOutputMaterial')
    links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    set_socket(bsdf, ['Base Color'], base_color)
    set_socket(bsdf, ['Metallic'], metallic)
    set_socket(bsdf, ['Roughness'], roughness)
    set_socket(bsdf, ['Alpha'], alpha)
    if clearcoat > 0:
        set_socket(bsdf, ['Coat Weight', 'Clearcoat'], clearcoat)
        set_socket(bsdf, ['Coat Roughness', 'Clearcoat Roughness'], 0.03)
    if transmission > 0:
        set_socket(bsdf, ['Transmission Weight', 'Transmission'], transmission)
        set_socket(bsdf, ['IOR'], 1.52)
    if emission:
        set_socket(bsdf, ['Emission Color', 'Emission'], emission)
        set_socket(bsdf, ['Emission Strength'], emission_strength)
    if transmission > 0 or alpha < 1.0:
        mat.blend_method = 'BLEND' if hasattr(mat, 'blend_method') else None
    return mat

# VW Golf Mk7 Reflex Blue Metallic theme
M = {
    "paint":         make_mat("Golf_Paint_ReflexBlue", (0.04, 0.12, 0.35, 1.0), metallic=0.92, roughness=0.12, clearcoat=1.0),
    "gloss_black":   make_mat("Golf_GlossBlack", (0.02, 0.02, 0.02, 1.0), metallic=0.1, roughness=0.05, clearcoat=1.0),
    "matte_plastic": make_mat("Golf_MattePlastic", (0.05, 0.05, 0.05, 1.0), roughness=0.75),
    "chrome":        make_mat("Golf_Chrome", (0.92, 0.92, 0.94, 1.0), metallic=1.0, roughness=0.03, clearcoat=1.0),
    "glass":         make_mat("Golf_Glass", (0.88, 0.94, 1.0, 0.35), roughness=0.01, transmission=0.92, alpha=0.35),
    "glass_tint":    make_mat("Golf_GlassTint", (0.10, 0.12, 0.18, 0.6), roughness=0.02, transmission=0.85, alpha=0.6),
    "tire":          make_mat("Golf_Tire", (0.04, 0.04, 0.04, 1.0), roughness=0.88),
    "wheel":         make_mat("Golf_WheelAlloy", (0.80, 0.82, 0.85, 1.0), metallic=0.96, roughness=0.18, clearcoat=0.5),
    "wheel_dark":    make_mat("Golf_WheelDark", (0.12, 0.13, 0.15, 1.0), metallic=0.90, roughness=0.25),
    "brake_rotor":   make_mat("Golf_BrakeRotor", (0.60, 0.60, 0.63, 1.0), metallic=0.92, roughness=0.28),
    "brake_caliper": make_mat("Golf_CaliperRed", (0.80, 0.05, 0.05, 1.0), metallic=0.25, roughness=0.12, clearcoat=1.0),
    "headlight":     make_mat("Golf_Headlight", (1.0, 1.0, 1.0, 0.3), roughness=0.02, transmission=0.96, alpha=0.3),
    "drl":           make_mat("Golf_DRL", (0.3, 0.8, 1.0, 1.0), emission=(0.3, 0.8, 1.0, 1.0), emission_strength=15.0),
    "led_white":     make_mat("Golf_LED_White", (1.0, 1.0, 1.0, 1.0), emission=(1.0, 1.0, 1.0, 1.0), emission_strength=20.0),
    "taillight":     make_mat("Golf_Taillight", (0.85, 0.02, 0.02, 0.65), roughness=0.05, transmission=0.80, alpha=0.65),
    "taillight_led": make_mat("Golf_TaillightLED", (1.0, 0.02, 0.02, 1.0), emission=(1.0, 0.02, 0.02, 1.0), emission_strength=14.0),
    "interior":      make_mat("Golf_InteriorLeather", (0.08, 0.08, 0.09, 1.0), roughness=0.72),
    "interior_dash": make_mat("Golf_Dashboard", (0.06, 0.06, 0.07, 1.0), roughness=0.65),
    "interior_trim": make_mat("Golf_InteriorTrim", (0.75, 0.77, 0.80, 1.0), metallic=0.90, roughness=0.22),
    "underbody":     make_mat("Golf_Underbody", (0.15, 0.16, 0.18, 1.0), metallic=0.85, roughness=0.38),
}

# ============================================================================
# 3. HELPERS
# ============================================================================
PARTS = {}

def register(name, obj):
    PARTS[name] = obj
    return obj

def smooth(obj):
    if obj.type == 'MESH':
        for p in obj.data.polygons:
            p.use_smooth = True

def finish(obj, bevel=0.005, subsurf=0):
    smooth(obj)
    if bevel > 0:
        bm = obj.modifiers.new("Bevel", 'BEVEL')
        bm.width = bevel
        bm.segments = 2
        bm.limit_method = 'ANGLE'
        bm.angle_limit = math.radians(35)
    if subsurf > 0:
        sm = obj.modifiers.new("Subsurf", 'SUBSURF')
        sm.levels = subsurf
        sm.render_levels = subsurf
    wn = obj.modifiers.new("WN", 'WEIGHTED_NORMAL')
    wn.keep_sharp = True
    return obj

def make_obj(name, bm, mat, bevel=0.005, subsurf=0, mirror=False):
    mesh = bpy.data.meshes.new(f"Mesh_{name}")
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    if mat:
        obj.data.materials.append(mat)
    if mirror:
        m = obj.modifiers.new("Mirror", 'MIRROR')
        m.use_axis[0] = True
        m.use_clip = True
    finish(obj, bevel, subsurf)
    return register(name, obj)

# ============================================================================
# 4. GOLF MK7 DIMENSIONS (meters)
# ============================================================================
WB       = 2.637    # Wheelbase
HALF_WB  = WB / 2   # 1.3185
LEN      = 4.255    # Overall length
WIDTH    = 1.799    # Body width (no mirrors)
HALF_W   = WIDTH / 2  # 0.8995
HEIGHT   = 1.452    # Overall height
TRACK_F  = 1.549    # Front track
TRACK_R  = 1.522    # Rear track
HALF_TF  = TRACK_F / 2  # 0.7745
HALF_TR  = TRACK_R / 2  # 0.761
GND_CLR  = 0.155    # Ground clearance
WHEEL_R  = 0.318    # Tire outer radius (225/45R17)

# Front/rear overhangs
FRONT_Y  = 1.85     # Front bumper Y from center
REAR_Y   = -1.65    # Rear bumper Y from center
ROOF_Z   = 1.400    # Roof height
BELT_Z   = 0.900    # Beltline height

# ============================================================================
# 5. BODY — MAIN SHELL (Golf Mk7 proportions from blueprints)
# ============================================================================
log("Building main body shell...")

# The Golf Mk7 has a characteristic flat-sided body with a subtle character
# line running from front wheel arch through door handles to rear lights.

# --- LOWER BODY (Slab-sided panels with subtle crown) ---
bm_body = bmesh.new()
# Grid: Y positions from front to rear, X positions center to side
body_y = [FRONT_Y, 1.50, 1.00, 0.50, 0.00, -0.50, -1.00, REAR_Y]
body_x = [0.00, 0.25, 0.50, 0.72, 0.85, HALF_W]

# Z heights for the body side (lower body contour)
# Golf Mk7 is relatively flat-sided with gentle curves
body_z = [
    # Y=1.85 (front bumper area)
    [0.35, 0.38, 0.42, 0.48, 0.52, 0.55],
    # Y=1.50 (front fender)
    [0.30, 0.34, 0.40, 0.48, 0.56, 0.62],
    # Y=1.00 (front door area)
    [0.28, 0.32, 0.38, 0.46, 0.56, 0.64],
    # Y=0.50 (rear door area)
    [0.28, 0.32, 0.38, 0.46, 0.56, 0.64],
    # Y=0.00 (mid body)
    [0.28, 0.32, 0.38, 0.46, 0.56, 0.64],
    # Y=-0.50 (rear quarter)
    [0.28, 0.32, 0.38, 0.46, 0.56, 0.62],
    # Y=-1.00 (rear quarter near hatch)
    [0.30, 0.34, 0.40, 0.48, 0.55, 0.58],
    # Y=-1.65 (rear bumper)
    [0.35, 0.38, 0.42, 0.48, 0.52, 0.55],
]

verts_body = []
for r, y_val in enumerate(body_y):
    row = []
    for c, x_val in enumerate(body_x):
        v = bm_body.verts.new((x_val, y_val, body_z[r][c]))
        row.append(v)
    verts_body.append(row)

# Create faces for lower body
for r in range(len(body_y) - 1):
    for c in range(len(body_x) - 1):
        bm_body.faces.new((verts_body[r][c], verts_body[r][c+1], verts_body[r+1][c+1], verts_body[r+1][c]))

# Solidify and mirror
bmesh.ops.solidify(bm_body, geom=bm_body.faces, thickness=0.004)
make_obj("GEO_Body_Main", bm_body, M["paint"], bevel=0.006, subsurf=1, mirror=True)

# --- UPPER BODY / BELTLINE TRANSITION ---
bm_upper = bmesh.new()
upper_y = [FRONT_Y, 1.50, 1.00, 0.50, 0.00, -0.50, -1.00, REAR_Y]
upper_x = [0.00, 0.30, 0.55, 0.75, 0.85, HALF_W]

# Beltline Z (where windows start)
belt_z = [
    [0.55, 0.60, 0.68, 0.75, 0.82, 0.88],  # Y=1.85
    [0.62, 0.68, 0.75, 0.84, 0.92, 0.98],  # Y=1.50
    [0.64, 0.70, 0.78, 0.86, 0.95, 1.00],  # Y=1.00
    [0.64, 0.70, 0.78, 0.86, 0.95, 1.00],  # Y=0.50
    [0.64, 0.70, 0.78, 0.86, 0.95, 1.00],  # Y=0.00
    [0.62, 0.68, 0.76, 0.84, 0.93, 0.98],  # Y=-0.50
    [0.58, 0.64, 0.72, 0.80, 0.88, 0.92],  # Y=-1.00
    [0.55, 0.60, 0.68, 0.75, 0.82, 0.86],  # Y=-1.65
]

verts_upper = []
for r, y_val in enumerate(upper_y):
    row = []
    for c, x_val in enumerate(upper_x):
        v = bm_upper.verts.new((x_val, y_val, belt_z[r][c]))
        row.append(v)
    verts_upper.append(row)

for r in range(len(upper_y) - 1):
    for c in range(len(upper_x) - 1):
        bm_upper.faces.new((verts_upper[r][c], verts_upper[r][c+1], verts_upper[r+1][c+1], verts_upper[r+1][c]))

bmesh.ops.solidify(bm_upper, geom=bm_upper.faces, thickness=0.004)
make_obj("GEO_Body_Upper", bm_upper, M["paint"], bevel=0.006, subsurf=1, mirror=True)

# ============================================================================
# 6. FRONT FASCIA (Golf Mk7 signature horizontal grille)
# ============================================================================
log("Building front fascia...")

# Front bumper with horizontal grille slats
bm_fb = bmesh.new()
fb_pts = [
    # Upper edge (hood seam)
    (0.00, FRONT_Y, 0.72), (0.35, FRONT_Y, 0.70), (0.65, FRONT_Y, 0.66), (HALF_W, FRONT_Y, 0.60),
    # Mid (grille center)
    (0.00, FRONT_Y + 0.02, 0.55), (0.35, FRONT_Y + 0.02, 0.54), (0.65, FRONT_Y + 0.02, 0.52), (HALF_W, FRONT_Y + 0.02, 0.48),
    # Lower grille
    (0.00, FRONT_Y + 0.03, 0.38), (0.35, FRONT_Y + 0.03, 0.37), (0.65, FRONT_Y + 0.03, 0.36), (HALF_W, FRONT_Y + 0.03, 0.34),
    # Bottom (splitter)
    (0.00, FRONT_Y + 0.04, 0.22), (0.35, FRONT_Y + 0.04, 0.22), (0.65, FRONT_Y + 0.04, 0.22), (HALF_W, FRONT_Y + 0.04, 0.22),
]
vfb = [bm_fb.verts.new(p) for p in fb_pts]
for r in range(3):
    for c in range(3):
        bm_fb.faces.new((vfb[r*4+c], vfb[r*4+c+1], vfb[(r+1)*4+c+1], vfb[(r+1)*4+c]))

bmesh.ops.solidify(bm_fb, geom=bm_fb.faces, thickness=0.004)
make_obj("GEO_Bumper_Front", bm_fb, M["paint"], bevel=0.006, subsurf=1, mirror=True)

# Upper grille (gloss black horizontal slats - Golf signature)
bm_grille = bmesh.new()
bmesh.ops.create_cube(bm_grille, size=1.0)
bmesh.ops.scale(bm_grille, vec=Vector((0.45, 0.04, 0.14)), verts=bm_grille.verts)
bmesh.ops.translate(bm_grille, vec=Vector((0, FRONT_Y + 0.02, 0.56)), verts=bm_grille.verts)
make_obj("GEO_Grille_Upper", bm_grille, M["gloss_black"], bevel=0.008)

# Lower air intake
bm_low = bmesh.new()
bmesh.ops.create_cube(bm_low, size=1.0)
bmesh.ops.scale(bm_low, vec=Vector((0.50, 0.04, 0.10)), verts=bm_low.verts)
bmesh.ops.translate(bm_low, vec=Vector((0, FRONT_Y + 0.03, 0.32)), verts=bm_low.verts)
make_obj("GEO_Grille_Lower", bm_low, M["matte_plastic"], bevel=0.006)

# Front splitter
bm_split = bmesh.new()
bmesh.ops.create_cube(bm_split, size=1.0)
bmesh.ops.scale(bm_split, vec=Vector((HALF_W * 0.95, 0.25, 0.020)), verts=bm_split.verts)
bmesh.ops.translate(bm_split, vec=Vector((0, FRONT_Y + 0.06, 0.18)), verts=bm_split.verts)
make_obj("GEO_Front_Splitter", bm_split, M["matte_plastic"], bevel=0.008)

# VW badge area (chrome circle on grille)
bm_badge = bmesh.new()
bmesh.ops.create_cone(bm_badge, cap_ends=True, radius1=0.045, radius2=0.045, depth=0.012, segments=24)
bmesh.ops.rotate(bm_badge, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.pi/2, 4, 'Y'), verts=bm_badge.verts)
bmesh.ops.translate(bm_badge, vec=Vector((0, FRONT_Y + 0.04, 0.58)), verts=bm_badge.verts)
make_obj("GEO_VW_Badge_Front", bm_badge, M["chrome"], bevel=0.003)

# ============================================================================
# 7. HEADLIGHTS (Swept-back Golf Mk7 style)
# ============================================================================
log("Building headlights...")

for side_name, sx in [("L", 1), ("R", -1)]:
    bm_hl = bmesh.new()
    # Headlight housing shape
    hl_pts = [
        (sx * 0.72, FRONT_Y - 0.02, 0.70),  # inner top
        (sx * 0.85, FRONT_Y - 0.06, 0.68),  # outer top
        (sx * 0.85, FRONT_Y - 0.06, 0.56),  # outer bottom
        (sx * 0.72, FRONT_Y - 0.02, 0.58),  # inner bottom
    ]
    vhl = [bm_hl.verts.new(p) for p in hl_pts]
    bm_hl.faces.new((vhl[0], vhl[1], vhl[2], vhl[3]))
    bmesh.ops.solidify(bm_hl, geom=bm_hl.faces, thickness=0.015)
    make_obj(f"GEO_Headlight_Housing_{side_name}", bm_hl, M["gloss_black"], bevel=0.005)

    # Headlight lens (glass cover)
    bm_lens = bmesh.new()
    lens_pts = [
        (sx * 0.73, FRONT_Y, 0.69), (sx * 0.84, FRONT_Y - 0.04, 0.67),
        (sx * 0.84, FRONT_Y - 0.04, 0.57), (sx * 0.73, FRONT_Y, 0.59),
    ]
    vln = [bm_lens.verts.new(p) for p in lens_pts]
    bm_lens.faces.new((vln[0], vln[1], vln[2], vln[3]))
    make_obj(f"GEO_Headlight_Lens_{side_name}", bm_lens, M["headlight"], bevel=0.003)

    # LED projector inside
    bm_led = bmesh.new()
    bmesh.ops.create_cone(bm_led, cap_ends=True, radius1=0.030, radius2=0.025, depth=0.020, segments=16)
    bmesh.ops.rotate(bm_led, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.pi/2, 4, 'Y'), verts=bm_led.verts)
    bmesh.ops.translate(bm_led, vec=Vector((sx * 0.78, FRONT_Y + 0.01, 0.63)), verts=bm_led.verts)
    make_obj(f"GEO_Headlight_LED_{side_name}", bm_led, M["led_white"], bevel=0.002)

    # DRL strip (ice blue)
    bm_drl = bmesh.new()
    bmesh.ops.create_cube(bm_drl, size=1.0)
    bmesh.ops.scale(bm_drl, vec=Vector((0.08, 0.015, 0.008)), verts=bm_drl.verts)
    bmesh.ops.translate(bm_drl, vec=Vector((sx * 0.79, FRONT_Y + 0.01, 0.66)), verts=bm_drl.verts)
    make_obj(f"GEO_DRL_{side_name}", bm_drl, M["drl"], bevel=0.002)

# ============================================================================
# 8. REAR FASCIA (Clean Golf Mk7 hatch)
# ============================================================================
log("Building rear fascia...")

# Rear bumper
bm_rb = bmesh.new()
rb_pts = [
    (0.00, REAR_Y, 0.70), (0.35, REAR_Y, 0.68), (0.65, REAR_Y, 0.64), (HALF_W, REAR_Y, 0.58),
    (0.00, REAR_Y - 0.02, 0.50), (0.35, REAR_Y - 0.02, 0.49), (0.65, REAR_Y - 0.02, 0.47), (HALF_W, REAR_Y - 0.02, 0.44),
    (0.00, REAR_Y - 0.03, 0.30), (0.35, REAR_Y - 0.03, 0.30), (0.65, REAR_Y - 0.03, 0.30), (HALF_W, REAR_Y - 0.03, 0.28),
    (0.00, REAR_Y - 0.04, 0.18), (0.35, REAR_Y - 0.04, 0.18), (0.65, REAR_Y - 0.04, 0.18), (HALF_W, REAR_Y - 0.04, 0.18),
]
vrb = [bm_rb.verts.new(p) for p in rb_pts]
for r in range(3):
    for c in range(3):
        bm_rb.faces.new((vrb[r*4+c], vrb[r*4+c+1], vrb[(r+1)*4+c+1], vrb[(r+1)*4+c]))

bmesh.ops.solidify(bm_rb, geom=bm_rb.faces, thickness=0.004)
make_obj("GEO_Bumper_Rear", bm_rb, M["paint"], bevel=0.006, subsurf=1, mirror=True)

# Lower rear valance (black plastic)
bm_val = bmesh.new()
bmesh.ops.create_cube(bm_val, size=1.0)
bmesh.ops.scale(bm_val, vec=Vector((HALF_W * 0.85, 0.08, 0.12)), verts=bm_val.verts)
bmesh.ops.translate(bm_val, vec=Vector((0, REAR_Y - 0.06, 0.24)), verts=bm_val.verts)
make_obj("GEO_Rear_Valance", bm_val, M["matte_plastic"], bevel=0.006)

# Exhaust tips (dual, left side)
for ex, ey in [(0.25, REAR_Y - 0.06), (0.40, REAR_Y - 0.06)]:
    bm_ex = bmesh.new()
    bmesh.ops.create_cone(bm_ex, cap_ends=False, radius1=0.025, radius2=0.028, depth=0.08, segments=16)
    bmesh.ops.rotate(bm_ex, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.pi/2, 4, 'Y'), verts=bm_ex.verts)
    bmesh.ops.translate(bm_ex, vec=Vector((ex, ey, 0.20)), verts=bm_ex.verts)
    make_obj(f"GEO_Exhaust_{ex:.2f}", bm_ex, M["chrome"], bevel=0.003)

# VW badge rear
bm_badge_r = bmesh.new()
bmesh.ops.create_cone(bm_badge_r, cap_ends=True, radius1=0.045, radius2=0.045, depth=0.012, segments=24)
bmesh.ops.rotate(bm_badge_r, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.pi/2, 4, 'Y'), verts=bm_badge_r.verts)
bmesh.ops.translate(bm_badge_r, vec=Vector((0, REAR_Y - 0.03, 0.58)), verts=bm_badge_r.verts)
make_obj("GEO_VW_Badge_Rear", bm_badge_r, M["chrome"], bevel=0.003)

# License plate recess
bm_plate = bmesh.new()
bmesh.ops.create_cube(bm_plate, size=1.0)
bmesh.ops.scale(bm_plate, vec=Vector((0.18, 0.02, 0.08)), verts=bm_plate.verts)
bmesh.ops.translate(bm_plate, vec=Vector((0, REAR_Y - 0.04, 0.38)), verts=bm_plate.verts)
make_obj("GEO_LicensePlate_Rear", bm_plate, M["gloss_black"], bevel=0.004)

# ============================================================================
# 9. TAILLIGHTS (Golf Mk7 horizontal LED)
# ============================================================================
log("Building taillights...")

for side_name, sx in [("L", 1), ("R", -1)]:
    # Taillight housing
    bm_tl = bmesh.new()
    tl_pts = [
        (sx * 0.55, REAR_Y - 0.01, 0.68), (sx * 0.80, REAR_Y - 0.01, 0.64),
        (sx * 0.80, REAR_Y - 0.01, 0.54), (sx * 0.55, REAR_Y - 0.01, 0.56),
    ]
    vtl = [bm_tl.verts.new(p) for p in tl_pts]
    bm_tl.faces.new((vtl[0], vtl[1], vtl[2], vtl[3]))
    bmesh.ops.solidify(bm_tl, geom=bm_tl.faces, thickness=0.012)
    make_obj(f"GEO_Taillight_Housing_{side_name}", bm_tl, M["gloss_black"], bevel=0.004)

    # LED element
    bm_tled = bmesh.new()
    bmesh.ops.create_cube(bm_tled, size=1.0)
    bmesh.ops.scale(bm_tled, vec=Vector((0.10, 0.010, 0.04)), verts=bm_tled.verts)
    bmesh.ops.translate(bm_tled, vec=Vector((sx * 0.67, REAR_Y, 0.62)), verts=bm_tled.verts)
    make_obj(f"GEO_Taillight_LED_{side_name}", bm_tled, M["taillight_led"], bevel=0.002)

    # Lens cover
    bm_tll = bmesh.new()
    tl_lens = [
        (sx * 0.56, REAR_Y + 0.01, 0.67), (sx * 0.79, REAR_Y + 0.01, 0.63),
        (sx * 0.79, REAR_Y + 0.01, 0.55), (sx * 0.56, REAR_Y + 0.01, 0.57),
    ]
    vln2 = [bm_tll.verts.new(p) for p in tl_lens]
    bm_tll.faces.new((vln2[0], vln2[1], vln2[2], vln2[3]))
    make_obj(f"GEO_Taillight_Lens_{side_name}", bm_tll, M["taillight"], bevel=0.002)

# ============================================================================
# 10. ROOF (Crowned with subtle ridge)
# ============================================================================
log("Building roof...")

bm_roof = bmesh.new()
roof_y = [FRONT_Y - 0.30, 0.50, 0.00, -0.50, REAR_Y + 0.30]
roof_x = [0.00, 0.25, 0.50, 0.70, 0.82]
roof_z = [
    [ROOF_Z, ROOF_Z - 0.005, ROOF_Z - 0.015, ROOF_Z - 0.025, ROOF_Z - 0.035],
    [ROOF_Z + 0.005, ROOF_Z, ROOF_Z - 0.008, ROOF_Z - 0.018, ROOF_Z - 0.028],
    [ROOF_Z + 0.008, ROOF_Z + 0.003, ROOF_Z - 0.005, ROOF_Z - 0.015, ROOF_Z - 0.025],
    [ROOF_Z + 0.005, ROOF_Z, ROOF_Z - 0.008, ROOF_Z - 0.018, ROOF_Z - 0.028],
    [ROOF_Z - 0.010, ROOF_Z - 0.015, ROOF_Z - 0.025, ROOF_Z - 0.035, ROOF_Z - 0.045],
]

verts_roof = []
for r, y_val in enumerate(roof_y):
    row = []
    for c, x_val in enumerate(roof_x):
        v = bm_roof.verts.new((x_val, y_val, roof_z[r][c]))
        row.append(v)
    verts_roof.append(row)

for r in range(len(roof_y) - 1):
    for c in range(len(roof_x) - 1):
        bm_roof.faces.new((verts_roof[r][c], verts_roof[r][c+1], verts_roof[r+1][c+1], verts_roof[r+1][c]))

make_obj("GEO_Roof", bm_roof, M["paint"], bevel=0.008, subsurf=1, mirror=True)

# Roof spoiler (small lip at rear)
bm_spoiler = bmesh.new()
sp_pts = [
    (0.00, REAR_Y + 0.35, ROOF_Z - 0.04), (0.40, REAR_Y + 0.35, ROOF_Z - 0.04),
    (0.40, REAR_Y + 0.25, ROOF_Z - 0.03), (0.00, REAR_Y + 0.25, ROOF_Z - 0.03),
    (0.00, REAR_Y + 0.35, ROOF_Z - 0.06), (0.40, REAR_Y + 0.35, ROOF_Z - 0.06),
]
vsp = [bm_spoiler.verts.new(p) for p in sp_pts]
bm_spoiler.faces.new((vsp[0], vsp[1], vsp[2], vsp[3]))
bm_spoiler.faces.new((vsp[0], vsp[1], vsp[5], vsp[4]))
make_obj("GEO_Roof_Spoiler", bm_spoiler, M["paint"], bevel=0.006, mirror=True)

# ============================================================================
# 11. WINDSHIELD & WINDOWS (Glass)
# ============================================================================
log("Building glass panels...")

# Windshield
bm_ws = bmesh.new()
ws_pts = [
    (0.00, 1.20, BELT_Z),        (0.70, 1.20, BELT_Z),        # bottom
    (0.55, 0.90, ROOF_Z - 0.02), (0.00, 0.85, ROOF_Z - 0.01), # top
]
vws = [bm_ws.verts.new(p) for p in ws_pts]
bm_ws.faces.new((vws[0], vws[1], vws[2], vws[3]))
make_obj("GEO_Windshield", bm_ws, M["glass"], bevel=0.003, mirror=True)

# Rear window (more upright - hatchback)
bm_rw = bmesh.new()
rw_pts = [
    (0.00, REAR_Y + 0.30, BELT_Z), (0.65, REAR_Y + 0.30, BELT_Z),
    (0.50, REAR_Y + 0.40, ROOF_Z - 0.04), (0.00, REAR_Y + 0.35, ROOF_Z - 0.04),
]
vrw = [bm_rw.verts.new(p) for p in rw_pts]
bm_rw.faces.new((vrw[0], vrw[1], vrw[2], vrw[3]))
make_obj("GEO_RearWindow", bm_rw, M["glass_tint"], bevel=0.003, mirror=True)

# Side windows (front door)
for side_name, sx in [("FL", 1), ("FR", -1)]:
    bm_sw = bmesh.new()
    sw_pts = [
        (sx * 0.83, 1.10, BELT_Z), (sx * 0.84, 0.15, BELT_Z),
        (sx * 0.82, 0.15, ROOF_Z - 0.05), (sx * 0.78, 0.85, ROOF_Z - 0.02),
    ]
    vsw = [bm_sw.verts.new(p) for p in sw_pts]
    bm_sw.faces.new((vsw[0], vsw[1], vsw[2], vsw[3]))
    make_obj(f"GEO_Window_Door_{side_name}", bm_sw, M["glass_tint"], bevel=0.003)

# Side windows (rear door)
for side_name, sx in [("RL", 1), ("RR", -1)]:
    bm_rsw = bmesh.new()
    rsw_pts = [
        (sx * 0.84, 0.15, BELT_Z), (sx * 0.83, -0.70, BELT_Z),
        (sx * 0.80, -0.70, ROOF_Z - 0.06), (sx * 0.82, 0.15, ROOF_Z - 0.05),
    ]
    vrsw = [bm_rsw.verts.new(p) for p in rsw_pts]
    bm_rsw.faces.new((vrsw[0], vrsw[1], vrsw[2], vrsw[3]))
    make_obj(f"GEO_Window_Door_{side_name}", bm_rsw, M["glass_tint"], bevel=0.003)

# ============================================================================
# 12. DOORS (5-door: 4 side doors + hatch)
# ============================================================================
log("Building doors...")

# Door panel lines (shutlines) are visual only - the body shell IS the doors
# Add subtle door handle recesses
for side_name, sx in [("FL", 1), ("FR", -1)]:
    bm_dh = bmesh.new()
    bmesh.ops.create_cube(bm_dh, size=1.0)
    bmesh.ops.scale(bm_dh, vec=Vector((0.008, 0.10, 0.015)), verts=bm_dh.verts)
    bmesh.ops.translate(bm_dh, vec=Vector((sx * (HALF_W + 0.005), 0.50, 0.82)), verts=bm_dh.verts)
    make_obj(f"GEO_DoorHandle_{side_name}", bm_dh, M["gloss_black"], bevel=0.002)

for side_name, sx in [("RL", 1), ("RR", -1)]:
    bm_dh = bmesh.new()
    bmesh.ops.create_cube(bm_dh, size=1.0)
    bmesh.ops.scale(bm_dh, vec=Vector((0.008, 0.10, 0.015)), verts=bm_dh.verts)
    bmesh.ops.translate(bm_dh, vec=Vector((sx * (HALF_W + 0.005), -0.40, 0.82)), verts=bm_dh.verts)
    make_obj(f"GEO_DoorHandle_{side_name}", bm_dh, M["gloss_black"], bevel=0.002)

# ============================================================================
# 13. WHEEL ARCHES (Circular cutouts with liners)
# ============================================================================
log("Building wheel arches...")

for arch_name, ax, ay in [("FL", HALF_TF, HALF_WB), ("FR", -HALF_TF, HALF_WB),
                           ("RL", HALF_TR, -HALF_WB), ("RR", -HALF_TR, -HALF_WB)]:
    bm_arch = bmesh.new()
    bmesh.ops.create_cone(bm_arch, cap_ends=False, radius1=0.365, radius2=0.365, depth=0.18, segments=24)
    bmesh.ops.rotate(bm_arch, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.pi/2, 4, 'Y'), verts=bm_arch.verts)
    bmesh.ops.translate(bm_arch, vec=Vector((ax, ay, WHEEL_R)), verts=bm_arch.verts)
    make_obj(f"GEO_WheelArch_{arch_name}", bm_arch, M["matte_plastic"], bevel=0.0)

# ============================================================================
# 14. WHEELS & BRAKES (5-spoke Golf style)
# ============================================================================
log("Building wheels...")

def build_wheel(name, pos, is_front=True):
    x, y, z = pos

    # Tire (torus)
    bpy.ops.mesh.primitive_torus_add(
        major_radius=WHEEL_R - 0.050, minor_radius=0.058,
        major_segments=48, minor_segments=20,
        location=pos, rotation=(0, math.pi/2, 0)
    )
    tire = bpy.context.active_object
    tire.name = f"GEO_Tire_{name}"
    tire.scale = (1.8, 1.0, 1.0)
    bpy.ops.object.transform_apply(scale=True)
    tire.data.materials.append(M["tire"])
    finish(tire, bevel=0.0)
    register(tire.name, tire)

    # Rim barrel
    bm_bar = bmesh.new()
    bmesh.ops.create_cone(bm_bar, cap_ends=False, radius1=0.225, radius2=0.225, depth=0.16, segments=36)
    bmesh.ops.rotate(bm_bar, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.pi/2, 4, 'Y'), verts=bm_bar.verts)
    bmesh.ops.translate(bm_bar, vec=Vector(pos), verts=bm_bar.verts)
    make_obj(f"GEO_Rim_{name}", bm_bar, M["wheel"], bevel=0.004)

    # 5 Spokes (Golf signature)
    bm_spk = bmesh.new()
    # Center hub
    bmesh.ops.create_cone(bm_spk, cap_ends=True, radius1=0.060, radius2=0.060, depth=0.030, segments=20)
    for i in range(5):
        ang = (2 * math.pi / 5) * i
        spk = bmesh.ops.create_cube(bm_spk, size=1.0)
        bmesh.ops.scale(bm_spk, vec=Vector((0.018, 0.022, 0.155)), verts=spk['verts'])
        r_mid = 0.120
        bmesh.ops.translate(bm_spk, vec=Vector((0.025 if x > 0 else -0.025, 0, r_mid)), verts=spk['verts'])
        bmesh.ops.rotate(bm_spk, cent=Vector((0,0,0)), matrix=Matrix.Rotation(ang, 4, 'X'), verts=spk['verts'])
    bmesh.ops.rotate(bm_spk, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.pi/2, 4, 'Y'), verts=bm_spk.verts)
    bmesh.ops.translate(bm_spk, vec=Vector(pos), verts=bm_spk.verts)
    make_obj(f"GEO_Spokes_{name}", bm_spk, M["wheel"], bevel=0.003)

    # Brake rotor
    bm_rot = bmesh.new()
    rotor_r = 0.165 if is_front else 0.150
    bmesh.ops.create_cone(bm_rot, cap_ends=True, radius1=rotor_r, radius2=rotor_r, depth=0.022, segments=30)
    bmesh.ops.rotate(bm_rot, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.pi/2, 4, 'Y'), verts=bm_rot.verts)
    inward = -0.035 if x > 0 else 0.035
    bmesh.ops.translate(bm_rot, vec=Vector((x + inward, y, z)), verts=bm_rot.verts)
    make_obj(f"GEO_Rotor_{name}", bm_rot, M["brake_rotor"], bevel=0.002)

    # Caliper
    bm_cal = bmesh.new()
    bmesh.ops.create_cube(bm_cal, size=1.0)
    cal_l = 0.18 if is_front else 0.15
    bmesh.ops.scale(bm_cal, vec=Vector((0.065, 0.055, cal_l)), verts=bm_cal.verts)
    cal_y = 0.10 if is_front else -0.08
    bmesh.ops.translate(bm_cal, vec=Vector((x + inward, y + cal_y, z + 0.09)), verts=bm_cal.verts)
    make_obj(f"GEO_Caliper_{name}", bm_cal, M["brake_caliper"], bevel=0.006)

# Assemble 4 wheels
build_wheel("FL", (HALF_TF, HALF_WB, WHEEL_R), is_front=True)
build_wheel("FR", (-HALF_TF, HALF_WB, WHEEL_R), is_front=True)
build_wheel("RL", (HALF_TR, -HALF_WB, WHEEL_R), is_front=False)
build_wheel("RR", (-HALF_TR, -HALF_WB, WHEEL_R), is_front=False)

# ============================================================================
# 15. MIRRORS (Aerodynamic, body-color cap)
# ============================================================================
log("Building mirrors...")

for side_name, sx in [("L", 1), ("R", -1)]:
    # Mirror housing
    bm_mir = bmesh.new()
    bmesh.ops.create_cube(bm_mir, size=1.0)
    bmesh.ops.scale(bm_mir, vec=Vector((0.06, 0.10, 0.06)), verts=bm_mir.verts)
    bmesh.ops.translate(bm_mir, vec=Vector((sx * (HALF_W + 0.08), 1.05, 0.98)), verts=bm_mir.verts)
    make_obj(f"GEO_Mirror_{side_name}", bm_mir, M["paint"], bevel=0.008)

    # Mirror stalk
    bm_stalk = bmesh.new()
    bmesh.ops.create_cube(bm_stalk, size=1.0)
    bmesh.ops.scale(bm_stalk, vec=Vector((0.02, 0.04, 0.02)), verts=bm_stalk.verts)
    bmesh.ops.translate(bm_stalk, vec=Vector((sx * (HALF_W + 0.02), 1.05, 0.96)), verts=bm_stalk.verts)
    make_obj(f"GEO_MirrorStalk_{side_name}", bm_stalk, M["gloss_black"], bevel=0.003)

# ============================================================================
# 16. INTERIOR (Visible through glass)
# ============================================================================
log("Building interior...")

# Dashboard
bm_dash = bmesh.new()
bmesh.ops.create_cube(bm_dash, size=1.0)
bmesh.ops.scale(bm_dash, vec=Vector((0.65, 0.20, 0.18)), verts=bm_dash.verts)
bmesh.ops.translate(bm_dash, vec=Vector((0, 1.05, 0.68)), verts=bm_dash.verts)
make_obj("GEO_Dashboard", bm_dash, M["interior_dash"], bevel=0.008)

# Steering wheel
bm_sw = bmesh.new()
bmesh.ops.create_torus(bm_sw, major_radius=0.085, minor_radius=0.012, major_segments=24, minor_segments=8)
bmesh.ops.rotate(bm_sw, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(-25), 4, 'X'), verts=bm_sw.verts)
bmesh.ops.translate(bm_sw, vec=Vector((0.30, 1.10, 0.80)), verts=bm_sw.verts)
make_obj("GEO_SteeringWheel", bm_sw, M["interior"], bevel=0.003)

# Front seats
for side_name, sx in [("L", 1), ("R", -1)]:
    bm_seat = bmesh.new()
    # Seat cushion
    bmesh.ops.create_cube(bm_seat, size=1.0)
    bmesh.ops.scale(bm_seat, vec=Vector((0.22, 0.26, 0.10)), verts=bm_seat.verts)
    bmesh.ops.translate(bm_seat, vec=Vector((sx * 0.35, 0.50, 0.42)), verts=bm_seat.verts)
    # Backrest
    rb = bmesh.ops.create_cube(bm_seat, size=1.0)
    bmesh.ops.scale(bm_seat, vec=Vector((0.21, 0.08, 0.30)), verts=rb['verts'])
    bmesh.ops.rotate(bm_seat, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(-12), 4, 'X'), verts=rb['verts'])
    bmesh.ops.translate(bm_seat, vec=Vector((sx * 0.35, 0.32, 0.68)), verts=rb['verts'])
    # Headrest
    rh = bmesh.ops.create_cube(bm_seat, size=1.0)
    bmesh.ops.scale(bm_seat, vec=Vector((0.11, 0.05, 0.07)), verts=rh['verts'])
    bmesh.ops.translate(bm_seat, vec=Vector((sx * 0.35, 0.28, 0.92)), verts=rh['verts'])
    make_obj(f"GEO_Seat_Front_{side_name}", bm_seat, M["interior"], bevel=0.010)

# Rear bench
bm_rear = bmesh.new()
bmesh.ops.create_cube(bm_rear, size=1.0)
bmesh.ops.scale(bm_rear, vec=Vector((0.62, 0.24, 0.10)), verts=bm_rear.verts)
bmesh.ops.translate(bm_rear, vec=Vector((0, -0.55, 0.43)), verts=bm_rear.verts)
rr_back = bmesh.ops.create_cube(bm_rear, size=1.0)
bmesh.ops.scale(bm_rear, vec=Vector((0.60, 0.08, 0.28)), verts=rr_back['verts'])
bmesh.ops.rotate(bm_rear, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(-14), 4, 'X'), verts=rr_back['verts'])
bmesh.ops.translate(bm_rear, vec=Vector((0, -0.70, 0.65)), verts=rr_back['verts'])
make_obj("GEO_Seat_Rear", bm_rear, M["interior"], bevel=0.010)

# Center console
bm_con = bmesh.new()
bmesh.ops.create_cube(bm_con, size=1.0)
bmesh.ops.scale(bm_con, vec=Vector((0.12, 0.45, 0.14)), verts=bm_con.verts)
bmesh.ops.translate(bm_con, vec=Vector((0, 0.75, 0.42)), verts=bm_con.verts)
make_obj("GEO_CenterConsole", bm_con, M["interior_trim"], bevel=0.006)

# ============================================================================
# 17. UNDERBODY
# ============================================================================
log("Building underbody...")

bm_floor = bmesh.new()
bmesh.ops.create_cube(bm_floor, size=1.0)
bmesh.ops.scale(bm_floor, vec=Vector((HALF_W * 0.90, WB * 1.30, 0.018)), verts=bm_floor.verts)
bmesh.ops.translate(bm_floor, vec=Vector((0, 0.05, GND_CLR + 0.02)), verts=bm_floor.verts)
make_obj("GEO_Underbody", bm_floor, M["underbody"], bevel=0.004)

# ============================================================================
# 18. EXPORT
# ============================================================================
log("=================================================================")
log(f"EXPORTING {len(PARTS)} PARTS...")
log("=================================================================")

bpy.ops.object.select_all(action='SELECT')
complete_out = os.path.join(EXPORTS_DIR, "Car_GolfMk7_Hatchback.glb")
bpy.ops.export_scene.gltf(
    filepath=complete_out,
    use_selection=True,
    export_format='GLB',
    export_apply=True,
    export_yup=True,
    export_materials='EXPORT'
)
log(f"[SUCCESS] Golf Mk7 exported: {complete_out} ({os.path.getsize(complete_out)/(1024*1024):.2f} MB)")

# Also overwrite the standard hatchback path
hatch_out = os.path.join(EXPORTS_DIR, "Car_Hatchback_Complete.glb")
bpy.ops.export_scene.gltf(
    filepath=hatch_out,
    use_selection=True,
    export_format='GLB',
    export_apply=True,
    export_yup=True,
    export_materials='EXPORT'
)
log(f"[SUCCESS] Hatchback updated: {hatch_out} ({os.path.getsize(hatch_out)/(1024*1024):.2f} MB)")

log("DONE.")
