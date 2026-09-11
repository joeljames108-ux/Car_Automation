"""
Comprehensive Master Executive Sedan CAD Test & Beauty Render
"""
import bpy
import bmesh
import math
import os
from mathutils import Vector, Matrix

OUTPUT_ISO = r"C:\Users\acer\.gemini\antigravity-ide\brain\c774af4c-ac14-4622-b3f7-1682dd510f06\test_sedan_iso.png"
OUTPUT_SIDE = r"C:\Users\acer\.gemini\antigravity-ide\brain\c774af4c-ac14-4622-b3f7-1682dd510f06\test_sedan_side.png"
OUTPUT_REAR = r"C:\Users\acer\.gemini\antigravity-ide\brain\c774af4c-ac14-4622-b3f7-1682dd510f06\test_sedan_rear.png"

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

MAT_PAINT = make_pbr_mat("Paint", (0.012, 0.048, 0.155, 1.0), metallic=0.92, roughness=0.08, clearcoat=1.0)
MAT_GLASS = make_pbr_mat("Glass", (0.82, 0.90, 0.98, 0.22), roughness=0.02, alpha=0.22)
MAT_GLASS_TINT = make_pbr_mat("Tint", (0.08, 0.10, 0.14, 0.50), roughness=0.02, alpha=0.50)
MAT_GLOSS_BLACK = make_pbr_mat("Trim", (0.008, 0.008, 0.010, 1.0), metallic=0.12, roughness=0.03, clearcoat=1.0)
MAT_CARBON = make_pbr_mat("Carbon", (0.025, 0.025, 0.028, 1.0), metallic=0.25, roughness=0.22, clearcoat=0.85)
MAT_TIRE = make_pbr_mat("Tire", (0.022, 0.022, 0.024, 1.0), metallic=0.0, roughness=0.86)
MAT_ALLOY = make_pbr_mat("Alloy", (0.88, 0.89, 0.92, 1.0), metallic=0.98, roughness=0.10, clearcoat=0.8)
MAT_ROTOR = make_pbr_mat("Rotor", (0.34, 0.34, 0.36, 1.0), metallic=0.82, roughness=0.32)
MAT_CALIPER = make_pbr_mat("Caliper", (0.92, 0.02, 0.02, 1.0), metallic=0.45, roughness=0.10, clearcoat=1.0)
MAT_LED_HEAD = make_pbr_mat("HeadLED", (1.0, 1.0, 1.0, 1.0), roughness=0.05, emission=(1.0, 1.0, 1.0, 1.0), emission_strength=20.0)
MAT_LED_DRL = make_pbr_mat("DRL", (0.40, 0.90, 1.0, 1.0), roughness=0.05, emission=(0.40, 0.90, 1.0, 1.0), emission_strength=16.0)
MAT_LED_TAIL = make_pbr_mat("TailLED", (1.0, 0.01, 0.01, 1.0), roughness=0.05, emission=(1.0, 0.01, 0.01, 1.0), emission_strength=18.0)

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

def link_mirrored(name, bm_half, mat, bevel=0.003, subsurf=1):
    mesh = bpy.data.meshes.new(f"Mesh_{name}")
    bm_half.to_mesh(mesh)
    bm_half.free()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    m = obj.modifiers.new(name="Mirror", type='MIRROR')
    m.use_axis[0] = True
    m.use_clip = True
    if mat: obj.data.materials.append(mat)
    apply_finishing(obj, bevel=bevel, subsurf=subsurf)
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

# 2. Front Fenders (Zero-gap match: hood at X=0.66..0.58, door at Y=0.94, X=0.86, Z=0.92)
bm_fen = bmesh.new()
fen_rows = []
f_y_pts = [2.32, 2.05, 1.84, 1.48, 1.12, 0.94]
for f_y in f_y_pts:
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

    if abs(f_y - 0.94) < 1e-3:
        # Door shutline match
        fen_rows.append([
            Vector((hx, f_y, hz)),
            Vector((0.76, f_y, 0.92)),
            Vector((0.86, f_y, 0.92)),
            Vector((0.93, f_y, 0.74)),
            Vector((0.88, f_y, 0.19)),
        ])
    else:
        fen_rows.append([
            Vector((hx, f_y, hz)),
            Vector((hx + (fl_x - hx) * 0.35, f_y, hz - 0.05)),
            Vector((hx + (fl_x - hx) * 0.70, f_y, (hz + bot_z) * 0.55)),
            Vector((fl_x, f_y, (hz + bot_z) * 0.50)),
            Vector((fl_x, f_y, bot_z)),
        ])
make_quad_patch(bm_fen, fen_rows)
bmesh.ops.solidify(bm_fen, geom=bm_fen.faces, thickness=0.005)
link_mirrored("Front_Fenders", bm_fen, MAT_PAINT)

# 3. Front Bumper
bm_fb = bmesh.new()
fb_rows = []
for y_c, z_v in [(2.32, 0.70), (2.40, 0.58), (2.46, 0.44), (2.48, 0.32), (2.44, 0.19)]:
    fb_rows.append([
        Vector((0.00, y_c, z_v)),
        Vector((0.28, y_c, z_v)),
        Vector((0.56, y_c - 0.04, z_v)),
        Vector((0.74, y_c - 0.10, z_v * 0.98)),
        Vector((0.90, y_c - 0.20, z_v * 0.95)),
    ])
make_quad_patch(bm_fb, fb_rows)
bmesh.ops.solidify(bm_fb, geom=bm_fb.faces, thickness=0.005)
link_mirrored("Front_Bumper", bm_fb, MAT_PAINT)

# 4. Front Splitter (Aero conforming)
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
link_mirrored("Front_Splitter", bm_sp, MAT_CARBON, bevel=0.003, subsurf=0)

# 5. Roof Panel
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
rc_ant = bmesh.ops.create_cone(bm_rf, cap_ends=True, radius1=0.030, radius2=0.005, depth=0.070, segments=16)
bmesh.ops.rotate(bm_rf, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(-18), 4, 'X'), verts=rc_ant['verts'])
bmesh.ops.translate(bm_rf, vec=Vector((0.0, -0.62, 1.465)), verts=rc_ant['verts'])
bmesh.ops.solidify(bm_rf, geom=bm_rf.faces, thickness=0.005)
link_mirrored("Roof", bm_rf, MAT_PAINT)

# 6. Windshield
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
link_mirrored("Windshield", bm_ws, MAT_GLASS, bevel=0.002, subsurf=1)

# 7. Rear Glass (Backlite)
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
link_mirrored("Rear_Glass", bm_rg, MAT_GLASS_TINT, bevel=0.002, subsurf=1)

# 8. Exterior A-Pillars: bridges windshield outer edge to front door beltline & cowl
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

# 9. Exterior C-Pillars (Sail Panel): bridges roof cantrail to rear haunch & Hofmeister kink
bm_cp = bmesh.new()
cp_rows = []
for i in range(7):
    t = i / 6.0
    y = -0.76 + (-1.64 - (-0.76)) * t
    z_top = 1.42 + (1.04 - 1.42) * t + 0.030 * math.sin(t * math.pi)
    x_in = 0.52 + (0.64 - 0.52) * t
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

# 10. Flush B-Pillars (Gloss black)
bm_bp = bmesh.new()
for sx in [-1, 1]:
    rc_bp = bmesh.ops.create_cube(bm_bp, size=1.0)
    bmesh.ops.scale(bm_bp, vec=Vector((0.020, 0.065, 0.500)), verts=rc_bp['verts'])
    bmesh.ops.translate(bm_bp, vec=Vector((sx * 0.705, -0.280, 1.170)), verts=rc_bp['verts'])
link_mirrored("B_Pillars", bm_bp, MAT_GLOSS_BLACK, bevel=0.002, subsurf=0)

# 11. Doors
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
    h_y = (y_start + y_end) * 0.5
    rc_h = bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=Vector((0.016, 0.14, 0.024)), verts=rc_h['verts'])
    bmesh.ops.translate(bm, vec=Vector((0.935, h_y, 0.880)), verts=rc_h['verts'])
    bmesh.ops.solidify(bm, geom=bm.faces, thickness=0.005)
    return bm

link_mirrored("Front_Doors", make_door(0.94, -0.28, False), MAT_PAINT)
link_mirrored("Rear_Doors", make_door(-0.28, -1.28, True), MAT_PAINT)

# 12. Side Windows
bm_swf = bmesh.new()
swf_rows = []
for i in range(7):
    t = i / 6.0
    y = 0.92 + (-0.28 - 0.92) * t
    if y >= 0.28:
        t_a = (y - 0.92) / (0.28 - 0.92)
        z_top = 0.93 + (1.415 - 0.93) * t_a
        x_top = 0.64 + (0.53 - 0.64) * t_a
    else:
        z_top = 1.415
        x_top = 0.530
    swf_rows.append([
        Vector((x_top, y, z_top)),
        Vector((x_top + (0.855 - x_top) * 0.5, y, (z_top + 0.92) * 0.5)),
        Vector((0.855, y, 0.92)),
    ])
make_quad_patch(bm_swf, swf_rows)
bmesh.ops.solidify(bm_swf, geom=bm_swf.faces, thickness=0.003)
link_mirrored("Side_Windows_Front", bm_swf, MAT_GLASS_TINT, bevel=0.001, subsurf=0)

bm_swr = bmesh.new()
swr_rows = []
for i in range(7):
    t = i / 6.0
    y = -0.28 + (-1.28 - (-0.28)) * t
    if y >= -0.76:
        z_top = 1.415
        x_top = 0.530
    else:
        t_c = (y - (-0.76)) / (-1.28 - (-0.76))
        z_top = 1.415 + (0.98 - 1.415) * t_c
        x_top = 0.530 + (0.84 - 0.53) * t_c
    swr_rows.append([
        Vector((x_top, y, z_top)),
        Vector((x_top + (0.855 - x_top) * 0.5, y, (z_top + 0.92) * 0.5)),
        Vector((0.855, y, 0.92)),
    ])
make_quad_patch(bm_swr, swr_rows)
bmesh.ops.solidify(bm_swr, geom=bm_swr.faces, thickness=0.003)
link_mirrored("Side_Windows_Rear", bm_swr, MAT_GLASS_TINT, bevel=0.001, subsurf=0)

# 13. Rear Quarters
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
    
    if abs(r_y - (-1.28)) < 1e-3:
        rq_rows.append([
            Vector((0.86, r_y, 0.92)),
            Vector((0.95, r_y, 0.74)),
            Vector((0.935, r_y, 0.48)),
            Vector((0.88, r_y, 0.19)),
        ])
    else:
        rq_rows.append([
            Vector((top_x, r_y, top_z)),
            Vector((top_x + (fl_x - top_x) * 0.45, r_y, top_z - 0.12)),
            Vector((fl_x, r_y, (top_z + bot_z) * 0.50)),
            Vector((fl_x, r_y, bot_z)),
        ])
make_quad_patch(bm_rq, rq_rows)
bmesh.ops.solidify(bm_rq, geom=bm_rq.faces, thickness=0.005)
link_mirrored("Rear_Quarters", bm_rq, MAT_PAINT)

# 14. Trunk & Ducktail Spoiler
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

# Integrated Carbon Ducktail
bm_w = bmesh.new()
rc_w = bmesh.ops.create_cube(bm_w, size=1.0)
bmesh.ops.scale(bm_w, vec=Vector((1.12, 0.060, 0.022)), verts=rc_w['verts'])
bmesh.ops.rotate(bm_w, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(-12), 4, 'X'), verts=rc_w['verts'])
bmesh.ops.translate(bm_w, vec=Vector((0.0, -2.41, 1.025)), verts=rc_w['verts'])
link_mirrored("Ducktail", bm_w, MAT_CARBON, bevel=0.003, subsurf=0)

# 15. Rear Bumper & Diffuser with Quad Exhausts
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
link_mirrored("Rear_Bumper", bm_rb, MAT_PAINT)

# Carbon Diffuser
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
link_mirrored("Diffuser", bm_df, MAT_CARBON, bevel=0.003, subsurf=0)

# 16. Lighting: LED Headlights & Full-Width OLED Taillight Lightbar
bm_hl = bmesh.new()
for sx in [-0.68, 0.68]:
    rc_h = bmesh.ops.create_cube(bm_hl, size=1.0)
    bmesh.ops.scale(bm_hl, vec=Vector((0.14, 0.22, 0.055)), verts=rc_h['verts'])
    bmesh.ops.rotate(bm_hl, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(-16 * (1 if sx > 0 else -1)), 4, 'Z'), verts=rc_h['verts'])
    bmesh.ops.translate(bm_hl, vec=Vector((sx, 2.24, 0.68)), verts=rc_h['verts'])
link_mirrored("Headlamps", bm_hl, MAT_LED_HEAD, bevel=0.002, subsurf=0)

bm_tl = bmesh.new()
rc_bar = bmesh.ops.create_cube(bm_tl, size=1.0)
bmesh.ops.scale(bm_tl, vec=Vector((1.20, 0.035, 0.028)), verts=rc_bar['verts'])
bmesh.ops.translate(bm_tl, vec=Vector((0.0, -2.42, 0.88)), verts=rc_bar['verts'])
link_mirrored("Taillights", bm_tl, MAT_LED_TAIL, bevel=0.002, subsurf=0)

# 17. 20-inch Forged Alloy Wheels & Tires
def make_wheel(corner, x_pos, y_pos, is_front):
    is_left = x_pos > 0
    w_w = 0.265 if is_front else 0.305
    r_bar = 0.254
    r_t = 0.340

    bm_t = bmesh.new()
    rc_t = bmesh.ops.create_cone(bm_t, cap_ends=False, radius1=r_t, radius2=r_t, depth=w_w, segments=48)
    bmesh.ops.rotate(bm_t, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.pi/2, 4, 'Y'), verts=rc_t['verts'])
    bmesh.ops.translate(bm_t, vec=Vector((x_pos, y_pos, 0.340)), verts=rc_t['verts'])
    bmesh.ops.solidify(bm_t, geom=bm_t.faces, thickness=(r_t - r_bar))
    mesh_t = bpy.data.meshes.new(f"Mesh_Tire_{corner}")
    bm_t.to_mesh(mesh_t)
    bm_t.free()
    obj_t = bpy.data.objects.new(f"Tire_{corner}", mesh_t)
    bpy.context.scene.collection.objects.link(obj_t)
    obj_t.data.materials.append(MAT_TIRE)
    apply_finishing(obj_t, bevel=0.004, subsurf=1)

    bm_r = bmesh.new()
    rc_b = bmesh.ops.create_cone(bm_r, cap_ends=False, radius1=r_bar, radius2=r_bar, depth=w_w * 0.96, segments=48)
    bmesh.ops.rotate(bm_r, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.pi/2, 4, 'Y'), verts=rc_b['verts'])
    bmesh.ops.translate(bm_r, vec=Vector((x_pos, y_pos, 0.340)), verts=rc_b['verts'])
    bmesh.ops.solidify(bm_r, geom=bm_r.faces, thickness=0.016)

    out_s = (w_w * 0.42) if is_left else -(w_w * 0.42)
    for s_idx in range(5):
        ang = s_idx * (2 * math.pi / 5)
        for d_a in [-0.075, 0.075]:
            a = ang + d_a
            spk = bmesh.ops.create_cube(bm_r, size=1.0)
            bmesh.ops.scale(bm_r, vec=Vector((0.016, 0.024, r_bar * 0.84)), verts=spk['verts'])
            bmesh.ops.rotate(bm_r, cent=Vector((0,0,0)), matrix=Matrix.Rotation(a, 4, 'X'), verts=spk['verts'])
            bmesh.ops.translate(bm_r, vec=Vector((
                x_pos + out_s,
                y_pos + math.sin(a) * (r_bar * 0.46),
                0.340 + math.cos(a) * (r_bar * 0.46)
            )), verts=spk['verts'])

    rhub = bmesh.ops.create_cone(bm_r, cap_ends=True, radius1=0.075, radius2=0.075, depth=0.040, segments=32)
    bmesh.ops.rotate(bm_r, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.pi/2, 4, 'Y'), verts=rhub['verts'])
    bmesh.ops.translate(bm_r, vec=Vector((x_pos + out_s * 0.85, y_pos, 0.340)), verts=rhub['verts'])

    mesh_r = bpy.data.meshes.new(f"Mesh_Rim_{corner}")
    bm_r.to_mesh(mesh_r)
    bm_r.free()
    obj_r = bpy.data.objects.new(f"Rim_{corner}", mesh_r)
    bpy.context.scene.collection.objects.link(obj_r)
    obj_r.data.materials.append(MAT_ALLOY)
    apply_finishing(obj_r, bevel=0.003, subsurf=1)

    # Rotor & Caliper
    bm_rot = bmesh.new()
    rc_rt = bmesh.ops.create_cone(bm_rot, cap_ends=True, radius1=0.205, radius2=0.205, depth=0.026, segments=36)
    bmesh.ops.rotate(bm_rot, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.pi/2, 4, 'Y'), verts=rc_rt['verts'])
    sh_x = -0.035 if is_left else 0.035
    bmesh.ops.translate(bm_rot, vec=Vector((x_pos + sh_x, y_pos, 0.340)), verts=rc_rt['verts'])
    mesh_rot = bpy.data.meshes.new(f"Mesh_Rotor_{corner}")
    bm_rot.to_mesh(mesh_rot)
    bm_rot.free()
    obj_rot = bpy.data.objects.new(f"Rotor_{corner}", mesh_rot)
    bpy.context.scene.collection.objects.link(obj_rot)
    obj_rot.data.materials.append(MAT_ROTOR)

    bm_cal = bmesh.new()
    rc_cl = bmesh.ops.create_cube(bm_cal, size=1.0)
    bmesh.ops.scale(bm_cal, vec=Vector((0.075, 0.070, 0.20)), verts=rc_cl['verts'])
    bmesh.ops.translate(bm_cal, vec=Vector((x_pos + sh_x, y_pos + 0.12, 0.43)), verts=rc_cl['verts'])
    mesh_cal = bpy.data.meshes.new(f"Mesh_Caliper_{corner}")
    bm_cal.to_mesh(mesh_cal)
    bm_cal.free()
    obj_cal = bpy.data.objects.new(f"Caliper_{corner}", mesh_cal)
    bpy.context.scene.collection.objects.link(obj_cal)
    obj_cal.data.materials.append(MAT_CALIPER)

make_wheel("FL", 0.83, 1.48, True)
make_wheel("FR", -0.83, 1.48, True)
make_wheel("RL", 0.84, -1.48, False)
make_wheel("RR", -0.84, -1.48, False)

# Lighting & Camera Setup
world = bpy.data.worlds.new("StudioWorld")
scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes.get("Background")
if bg:
    bg.inputs[0].default_value = (0.04, 0.05, 0.07, 1.0)

key_light = bpy.data.lights.new("KeyLight", type='SUN')
key_light.energy = 5.0
key_obj = bpy.data.objects.new("KeyLight", key_light)
scene.collection.objects.link(key_obj)
key_obj.location = (6, 5, 8)

fill_light = bpy.data.lights.new("FillLight", type='SUN')
fill_light.energy = 2.5
fill_obj = bpy.data.objects.new("FillLight", fill_light)
scene.collection.objects.link(fill_obj)
fill_obj.location = (-6, -4, 6)

rim_light = bpy.data.lights.new("RimLight", type='SUN')
rim_light.energy = 3.5
rim_obj = bpy.data.objects.new("RimLight", rim_light)
scene.collection.objects.link(rim_obj)
rim_obj.location = (0, -8, 5)

cam_data = bpy.data.cameras.new("Cam")
cam = bpy.data.objects.new("Cam", cam_data)
scene.collection.objects.link(cam)
scene.camera = cam

scene.render.resolution_x = 1200
scene.render.resolution_y = 700

target = Vector((0, 0, 0.65))

# 1. ISO view
cam.location = (4.6, 5.0, 2.2)
rot_quat = (target - cam.location).to_track_quat('-Z', 'Y')
cam.rotation_euler = rot_quat.to_euler()
scene.render.filepath = OUTPUT_ISO
bpy.ops.render.render(write_still=True)
print("ISO Rendered!")

# 2. Side view
cam.location = (6.0, 0.0, 0.80)
rot_quat = (target - cam.location).to_track_quat('-Z', 'Y')
cam.rotation_euler = rot_quat.to_euler()
scene.render.filepath = OUTPUT_SIDE
bpy.ops.render.render(write_still=True)
print("Side Rendered!")

# 3. Rear Three-Quarter view
cam.location = (4.6, -5.2, 2.0)
rot_quat = (target - cam.location).to_track_quat('-Z', 'Y')
cam.rotation_euler = rot_quat.to_euler()
scene.render.filepath = OUTPUT_REAR
bpy.ops.render.render(write_still=True)
print("Rear Rendered!")
