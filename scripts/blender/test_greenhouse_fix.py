"""
Test and refine the executive sedan greenhouse geometry, window frames, and seamless body surfacing.
"""
import bpy
import bmesh
import math
import os
from mathutils import Vector, Matrix

OUTPUT_IMG = r"C:\Users\acer\.gemini\antigravity-ide\brain\c774af4c-ac14-4622-b3f7-1682dd510f06\test_sedan_preview.png"

# Quick setup
bpy.ops.wm.read_factory_settings(use_empty=True)
for o in list(bpy.data.objects):
    bpy.data.objects.remove(o, do_unlink=True)

scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'

def make_pbr_mat(name, base_color, metallic=0.0, roughness=0.5, clearcoat=0.0, alpha=1.0, emission=None, emission_strength=1.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if not bsdf:
        bsdf = mat.node_tree.nodes.new(type='ShaderNodeBsdfPrincipled')
    out = mat.node_tree.nodes.get("Material Output")
    if not out:
        out = mat.node_tree.nodes.new(type='ShaderNodeOutputMaterial')
        mat.node_tree.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    
    bsdf.inputs['Base Color'].default_value = base_color
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['Alpha'].default_value = alpha
    if 'Coat Weight' in bsdf.inputs and clearcoat > 0:
        bsdf.inputs['Coat Weight'].default_value = clearcoat
    elif 'Clearcoat' in bsdf.inputs and clearcoat > 0:
        bsdf.inputs['Clearcoat'].default_value = clearcoat
    if emission:
        bsdf.inputs['Emission Color'].default_value = emission
        bsdf.inputs['Emission Strength'].default_value = emission_strength
    if alpha < 1.0:
        mat.blend_method = 'BLEND'
    return mat

MAT_PAINT = make_pbr_mat("Paint", (0.015, 0.055, 0.170, 1.0), metallic=0.92, roughness=0.07, clearcoat=1.0)
MAT_GLASS = make_pbr_mat("Glass", (0.82, 0.90, 0.98, 0.22), roughness=0.02, alpha=0.22)
MAT_GLASS_TINT = make_pbr_mat("Tint", (0.08, 0.10, 0.14, 0.45), roughness=0.02, alpha=0.45)
MAT_GLOSS_BLACK = make_pbr_mat("Trim", (0.008, 0.008, 0.010, 1.0), metallic=0.12, roughness=0.03, clearcoat=1.0)
MAT_CARBON = make_pbr_mat("Carbon", (0.025, 0.025, 0.028, 1.0), metallic=0.25, roughness=0.22, clearcoat=0.85)

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

def link_mirrored(name, bm_half, mat):
    mesh = bpy.data.meshes.new(f"Mesh_{name}")
    bm_half.to_mesh(mesh)
    bm_half.free()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    m = obj.modifiers.new(name="Mirror", type='MIRROR')
    m.use_axis[0] = True
    m.use_clip = True
    if mat: obj.data.materials.append(mat)
    for p in obj.data.polygons: p.use_smooth = True
    return obj

# 1. Hood
bm_h = bmesh.new()
h_rows = []
for i in range(7):
    t = i / 6.0
    y = 0.94 + (2.32 - 0.94) * t
    base_z = 0.92 - 0.18 * t - 0.04 * (t**2)
    w = 0.66 - 0.08 * t
    h_rows.append([
        Vector((0.0, y, base_z + 0.015)),
        Vector((w * 0.35, y, base_z + 0.032)),
        Vector((w * 0.70, y, base_z + 0.016)),
        Vector((w, y, base_z)),
    ])
make_quad_patch(bm_h, h_rows)
bmesh.ops.solidify(bm_h, geom=bm_h.faces, thickness=0.005)
link_mirrored("Hood", bm_h, MAT_PAINT)

# 2. Roof
bm_rf = bmesh.new()
rf_rows = []
for i in range(7):
    t = i / 6.0
    y = 0.28 + (-0.76 - 0.28) * t
    base_z = 1.425 + 0.015 * math.sin(t * math.pi)
    rf_rows.append([
        Vector((0.0, y, base_z - 0.006)),
        Vector((0.22, y, base_z + 0.006)),
        Vector((0.42, y, base_z)),
        Vector((0.52, y, base_z - 0.012)),
    ])
make_quad_patch(bm_rf, rf_rows)
bmesh.ops.solidify(bm_rf, geom=bm_rf.faces, thickness=0.005)
link_mirrored("Roof", bm_rf, MAT_PAINT)

# 3. Windshield
bm_ws = bmesh.new()
ws_rows = []
for i in range(7):
    t = i / 6.0
    y = 0.94 + (0.28 - 0.94) * t
    z = 0.92 + (1.42 - 0.92) * t + 0.035 * math.sin(t * math.pi)
    w = 0.64 + (0.52 - 0.64) * t
    ws_rows.append([
        Vector((0.0, y, z)),
        Vector((w * 0.35, y, z * 0.996)),
        Vector((w * 0.72, y, z * 0.988)),
        Vector((w, y, z * 0.980)),
    ])
make_quad_patch(bm_ws, ws_rows)
bmesh.ops.solidify(bm_ws, geom=bm_ws.faces, thickness=0.004)
link_mirrored("Windshield", bm_ws, MAT_GLASS)

# 4. Rear Glass
bm_rg = bmesh.new()
rg_rows = []
for i in range(7):
    t = i / 6.0
    y = -0.76 + (-1.64 - (-0.76)) * t
    z = 1.42 + (1.04 - 1.42) * t + 0.030 * math.sin(t * math.pi)
    w = 0.52 + (0.64 - 0.52) * t
    rg_rows.append([
        Vector((0.0, y, z)),
        Vector((w * 0.35, y, z * 0.996)),
        Vector((w * 0.72, y, z * 0.988)),
        Vector((w, y, z * 0.980)),
    ])
make_quad_patch(bm_rg, rg_rows)
bmesh.ops.solidify(bm_rg, geom=bm_rg.faces, thickness=0.004)
link_mirrored("Rear_Glass", bm_rg, MAT_GLASS_TINT)

# 5. Trunk
bm_tk = bmesh.new()
tk_rows = []
for i in range(6):
    t = i / 5.0
    y = -1.64 + (-2.42 - (-1.64)) * t
    z = 1.040 - 0.030 * t + 0.020 * (t**2)
    w = 0.640 - 0.080 * t
    tk_rows.append([
        Vector((0.0, y, z)),
        Vector((w * 0.35, y, z * 0.995)),
        Vector((w * 0.72, y, z * 0.990)),
        Vector((w, y, z * 0.982)),
    ])
make_quad_patch(bm_tk, tk_rows)
bmesh.ops.solidify(bm_tk, geom=bm_tk.faces, thickness=0.005)
link_mirrored("Trunk", bm_tk, MAT_PAINT)

# 6. Exterior A-Pillars: Roof cantrail (X=0.52, Y=0.28, Z=1.42) down to Cowl (X=0.66, Y=0.94, Z=0.92)
# Bridges outer edge of windshield to front door waistline (X=0.86, Z=0.92)
bm_ap = bmesh.new()
ap_rows = []
for i in range(7):
    t = i / 6.0
    y = 0.94 + (0.28 - 0.94) * t
    z_roof = 0.92 + (1.42 - 0.92) * t + 0.035 * math.sin(t * math.pi)
    x_in = 0.64 + (0.52 - 0.64) * t
    x_out = 0.76 + (0.55 - 0.76) * t
    z_bot = 0.92 + (1.41 - 0.92) * t
    ap_rows.append([
        Vector((x_in, y, z_roof)),
        Vector((x_out, y, z_roof - 0.01)),
        Vector((x_out + 0.05 * (1-t), y, (z_roof + z_bot) * 0.5)),
        Vector((0.86 * (1-t) + 0.58 * t, y, 0.92 * (1-t) + 1.40 * t)),
    ])
make_quad_patch(bm_ap, ap_rows)
bmesh.ops.solidify(bm_ap, geom=bm_ap.faces, thickness=0.005)
link_mirrored("A_Pillars", bm_ap, MAT_PAINT)

# 7. Exterior C-Pillars (Sail Panel): Roof cantrail (X=0.52, Y=-0.76, Z=1.42) down to Rear Haunch (X=0.86, Y=-1.64, Z=1.04)
# Solid vertical/sloped metal panel framing the rear backlite and Hofmeister kink
bm_cp = bmesh.new()
cp_rows = []
for i in range(7):
    t = i / 6.0
    y = -0.76 + (-1.64 - (-0.76)) * t
    z_top = 1.42 + (1.04 - 1.42) * t + 0.030 * math.sin(t * math.pi)
    x_in = 0.52 + (0.64 - 0.52) * t
    
    # Drops down to beltline/haunch
    z_bot = 1.41 * (1-t) + 0.96 * t
    x_out = 0.56 * (1-t) + 0.88 * t
    
    cp_rows.append([
        Vector((x_in, y, z_top)),
        Vector((x_in + (x_out - x_in) * 0.40, y, z_top * 0.85 + z_bot * 0.15)),
        Vector((x_in + (x_out - x_in) * 0.75, y, z_top * 0.50 + z_bot * 0.50)),
        Vector((x_out, y, z_bot)),
    ])
make_quad_patch(bm_cp, cp_rows)
bmesh.ops.solidify(bm_cp, geom=bm_cp.faces, thickness=0.005)
link_mirrored("C_Pillars", bm_cp, MAT_PAINT)

# 8. Doors
def make_door(y_start, y_end, is_rear):
    bm = bmesh.new()
    d_rows = []
    for i in range(6):
        t = i / 5.0
        y = y_start + (y_end - y_start) * t
        xw = 0.93 if not is_rear else 0.95
        d_rows.append([
            Vector((0.86, y, 0.92)),
            Vector((xw, y, 0.74)),
            Vector((xw * 0.985, y, 0.48)),
            Vector((0.88, y, 0.19)),
        ])
    make_quad_patch(bm, d_rows)
    bmesh.ops.solidify(bm, geom=bm.faces, thickness=0.005)
    return bm

link_mirrored("Front_Doors", make_door(0.94, -0.28, False), MAT_PAINT)
link_mirrored("Rear_Doors", make_door(-0.28, -1.28, True), MAT_PAINT)

# 9. Side Windows that strictly follow cabin profile
# Front window: Y from 0.92 to -0.28
# Top edge: from (0.64, 0.92, 0.93) along A-pillar to (0.53, 0.28, 1.42), then flat along roof cantrail to (0.53, -0.28, 1.42)
bm_swf = bmesh.new()
swf_rows = []
for i in range(7):
    t = i / 6.0
    y = 0.92 + (-0.28 - 0.92) * t
    if y >= 0.28: # Along A-pillar
        t_a = (y - 0.92) / (0.28 - 0.92)
        z_top = 0.93 + (1.415 - 0.93) * t_a
        x_top = 0.64 + (0.53 - 0.64) * t_a
    else: # Along roof cantrail
        z_top = 1.415
        x_top = 0.530
    x_bot = 0.855
    z_bot = 0.920
    swf_rows.append([
        Vector((x_top, y, z_top)),
        Vector((x_top + (x_bot - x_top) * 0.5, y, (z_top + z_bot) * 0.5)),
        Vector((x_bot, y, z_bot)),
    ])
make_quad_patch(bm_swf, swf_rows)
bmesh.ops.solidify(bm_swf, geom=bm_swf.faces, thickness=0.003)
link_mirrored("Side_Windows_Front", bm_swf, MAT_GLASS_TINT)

# Rear window: Y from -0.28 to -1.28
# Top edge: from (0.53, -0.28, 1.42) along roof cantrail to (0.53, -0.76, 1.42), then down along C-pillar to (0.84, -1.28, 0.98)
bm_swr = bmesh.new()
swr_rows = []
for i in range(7):
    t = i / 6.0
    y = -0.28 + (-1.28 - (-0.28)) * t
    if y >= -0.76: # Along roof cantrail
        z_top = 1.415
        x_top = 0.530
    else: # Down C-pillar / Hofmeister kink
        t_c = (y - (-0.76)) / (-1.28 - (-0.76))
        z_top = 1.415 + (0.98 - 1.415) * t_c
        x_top = 0.530 + (0.84 - 0.53) * t_c
    x_bot = 0.855
    z_bot = 0.920
    swr_rows.append([
        Vector((x_top, y, z_top)),
        Vector((x_top + (x_bot - x_top) * 0.5, y, (z_top + z_bot) * 0.5)),
        Vector((x_bot, y, z_bot)),
    ])
make_quad_patch(bm_swr, swr_rows)
bmesh.ops.solidify(bm_swr, geom=bm_swr.faces, thickness=0.003)
link_mirrored("Side_Windows_Rear", bm_swr, MAT_GLASS_TINT)

# 10. Front Fenders & Rear Quarters
bm_fen = bmesh.new()
fen_rows = []
for f_y in [2.32, 2.05, 1.84, 1.48, 1.12, 0.94]:
    t_f = (f_y - 0.94) / (2.32 - 0.94)
    hx = 0.66 - 0.08 * t_f
    hz = 0.92 - 0.18 * t_f - 0.04 * (t_f**2)
    dy = f_y - 1.48
    if abs(dy) < 0.38:
        bot_z = 0.34 + math.sqrt(max(0.01, 0.38**2 - dy**2))
        fl_x = 0.945
    else:
        bot_z = 0.19
        fl_x = 0.920
    fen_rows.append([
        Vector((hx, f_y, hz)),
        Vector((hx + (fl_x - hx) * 0.5, f_y, hz - 0.10)),
        Vector((fl_x, f_y, (hz + bot_z) * 0.52)),
        Vector((fl_x, f_y, bot_z)),
    ])
make_quad_patch(bm_fen, fen_rows)
bmesh.ops.solidify(bm_fen, geom=bm_fen.faces, thickness=0.005)
link_mirrored("Front_Fenders", bm_fen, MAT_PAINT)

bm_rq = bmesh.new()
rq_rows = []
for r_y in [-1.28, -1.48, -1.72, -1.98, -2.24, -2.42]:
    t_q = (r_y - (-1.28)) / (-2.42 - (-1.28))
    top_x = 0.86 - 0.28 * t_q
    top_z = 0.92 + 0.09 * math.sin(t_q * math.pi * 0.8)
    dy = r_y - (-1.48)
    if abs(dy) < 0.385:
        bot_z = 0.34 + math.sqrt(max(0.01, 0.385**2 - dy**2))
        fl_x = 0.970
    else:
        bot_z = 0.19
        fl_x = 0.940
    rq_rows.append([
        Vector((top_x, r_y, top_z)),
        Vector((top_x + (fl_x - top_x) * 0.45, r_y, top_z - 0.12)),
        Vector((fl_x, r_y, (top_z + bot_z) * 0.50)),
        Vector((fl_x, r_y, bot_z)),
    ])
make_quad_patch(bm_rq, rq_rows)
bmesh.ops.solidify(bm_rq, geom=bm_rq.faces, thickness=0.005)
link_mirrored("Rear_Quarters", bm_rq, MAT_PAINT)

# Render Studio View
# Studio Lighting
world = bpy.data.worlds.new("StudioWorld")
scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes.get("Background")
if bg:
    bg.inputs[0].default_value = (0.12, 0.14, 0.18, 1.0)

key_light = bpy.data.lights.new("KeyLight", type='SUN')
key_light.energy = 5.0
key_obj = bpy.data.objects.new("KeyLight", key_light)
scene.collection.objects.link(key_obj)
key_obj.location = (6, 5, 8)

fill_light = bpy.data.lights.new("FillLight", type='SUN')
fill_light.energy = 3.0
fill_obj = bpy.data.objects.new("FillLight", fill_light)
scene.collection.objects.link(fill_obj)
fill_obj.location = (-6, -4, 6)

cam_data = bpy.data.cameras.new("Cam")
cam = bpy.data.objects.new("Cam", cam_data)
scene.collection.objects.link(cam)
scene.camera = cam

# ISO view
cam.location = (4.5, 4.5, 2.2)
target = Vector((0, 0, 0.75))
rot_quat = (target - cam.location).to_track_quat('-Z', 'Y')
cam.rotation_euler = rot_quat.to_euler()

scene.render.resolution_x = 1000
scene.render.resolution_y = 600
scene.render.filepath = OUTPUT_IMG
bpy.ops.render.render(write_still=True)

# Side view
cam.location = (5.5, 0.0, 0.85)
rot_quat = (target - cam.location).to_track_quat('-Z', 'Y')
cam.rotation_euler = rot_quat.to_euler()
scene.render.filepath = OUTPUT_IMG.replace(".png", "_side.png")
bpy.ops.render.render(write_still=True)
print("Preview rendered!")
