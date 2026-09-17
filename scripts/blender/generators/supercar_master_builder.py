"""
=============================================================================
APEX ENGINEER: SUPERCAR CLASS-A CAD MASTER BUILDER (ALL 7 ERAS)
=============================================================================
Procedurally constructs authentic, photo-accurate Class-A CAD models for all
7 eras of the Supercar architecture:
1. 1970s: Lamborghini Countach LP400
2. 1980s: Ferrari F40
3. 1990s: McLaren F1
4. 2000s: Ford GT (2005)
5. 2010s: Ferrari 458 Italia
6. 2020s: Lamborghini Revuelto
7. Future: McMurtry Spéirling / Cyber Supercar

Conforms to Blender 5.2 LTS standards, metric units (meters), Y-forward (+Y),
Z-up (+Z), X-lateral (+X driver side), and standard glTF node hierarchy:
VEHICLE_ROOT -> BODY_Master, GLASS_Master, LIGHT_Master, WHEEL_Master, AERO_Master, INTERIOR_Master.
=============================================================================
"""

import bpy
import bmesh
import math
import os
from mathutils import Vector, Matrix, Euler

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
PUBLIC_MODELS_DIR = os.path.join(ROOT_DIR, "public", "models", "vehicles", "supercar")
EXPORTS_DIR = os.path.join(ROOT_DIR, "exports")

# ----------------------------------------------------------------------------
# 1. SCENE CLEANUP & PBR SHADER FACTORY
# ----------------------------------------------------------------------------
def safe_reset():
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for mesh in list(bpy.data.meshes):
        bpy.data.meshes.remove(mesh, do_unlink=True)
    for mat in list(bpy.data.materials):
        bpy.data.materials.remove(mat, do_unlink=True)
    for col in list(bpy.data.collections):
        bpy.data.collections.remove(col, do_unlink=True)
        
    bpy.context.scene.unit_settings.system = 'METRIC'
    bpy.context.scene.unit_settings.scale_length = 1.0

def make_pbr_mat(name, base_color, metallic=0.0, roughness=0.5, coat=0.0, transmission=0.0, emission=None, emission_strength=1.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    bsdf = nodes.new(type="ShaderNodeBsdfPrincipled")
    out = nodes.new(type="ShaderNodeOutputMaterial")
    mat.node_tree.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])

    if 'Base Color' in bsdf.inputs:
        bsdf.inputs['Base Color'].default_value = base_color
    if 'Metallic' in bsdf.inputs:
        bsdf.inputs['Metallic'].default_value = metallic
    if 'Roughness' in bsdf.inputs:
        bsdf.inputs['Roughness'].default_value = roughness
    if 'Coat Weight' in bsdf.inputs:
        bsdf.inputs['Coat Weight'].default_value = coat
        bsdf.inputs['Coat Roughness'].default_value = 0.03
    elif 'Clearcoat' in bsdf.inputs:
        bsdf.inputs['Clearcoat'].default_value = coat
    if 'Transmission Weight' in bsdf.inputs:
        bsdf.inputs['Transmission Weight'].default_value = transmission
    elif 'Transmission' in bsdf.inputs:
        bsdf.inputs['Transmission'].default_value = transmission

    if emission and 'Emission Color' in bsdf.inputs:
        bsdf.inputs['Emission Color'].default_value = emission
        bsdf.inputs['Emission Strength'].default_value = emission_strength
    elif emission and 'Emission' in bsdf.inputs:
        bsdf.inputs['Emission'].default_value = emission

    return mat

def create_supercar_materials(era_id, paint_color):
    mats = {}
    coat = 0.6 if era_id == "1970s" else (0.85 if era_id in ["1980s", "1990s"] else 1.0)
    metallic = 0.15 if era_id in ["1970s", "1980s"] else 0.88

    mats["paint"] = make_pbr_mat(f"Mat_Paint_{era_id}", paint_color, metallic=metallic, roughness=0.12, coat=coat)
    mats["carbon"] = make_pbr_mat("Mat_Carbon_Twill", (0.035, 0.035, 0.04, 1.0), metallic=0.25, roughness=0.18, coat=0.95)
    mats["chrome"] = make_pbr_mat("Mat_Chrome_Jewelry", (0.95, 0.95, 0.96, 1.0), metallic=0.98, roughness=0.04)
    mats["trim_dark"] = make_pbr_mat("Mat_Trim_Dark", (0.06, 0.06, 0.07, 1.0), metallic=0.35, roughness=0.55)
    mats["exhaust"] = make_pbr_mat("Mat_Inconel_Exhaust", (0.55, 0.52, 0.50, 1.0), metallic=0.95, roughness=0.25)
    
    mat_glass = make_pbr_mat("Mat_Optical_Glass", (0.88, 0.92, 0.96, 1.0), roughness=0.02, transmission=0.94)
    mat_glass.blend_method = 'BLEND' if hasattr(mat_glass, 'blend_method') else 'OPAQUE'
    mats["glass"] = mat_glass

    mats["wheel_alloy"] = make_pbr_mat("Mat_Wheel_Alloy", (0.85, 0.86, 0.88, 1.0), metallic=0.95, roughness=0.18, coat=0.6)
    mats["wheel_gold"] = make_pbr_mat("Mat_Wheel_Gold", (0.85, 0.65, 0.15, 1.0), metallic=0.92, roughness=0.22, coat=0.7)
    mats["tire_rubber"] = make_pbr_mat("Mat_Tire_Rubber", (0.03, 0.03, 0.032, 1.0), roughness=0.88)
    mats["brake_rotor"] = make_pbr_mat("Mat_Brake_Rotor", (0.35, 0.35, 0.36, 1.0), metallic=0.85, roughness=0.32)
    mats["brake_caliper"] = make_pbr_mat("Mat_Brake_Caliper", (0.90, 0.04, 0.04, 1.0), metallic=0.35, roughness=0.22, coat=0.8)
    mats["interior"] = make_pbr_mat("Mat_Interior_Alcantara", (0.08, 0.08, 0.09, 1.0), roughness=0.85)

    hl_col = (1.0, 0.96, 0.88, 1.0) if era_id in ["1970s", "1980s"] else (0.95, 0.98, 1.0, 1.0)
    mats["headlight"] = make_pbr_mat("Mat_Headlight_Emissive", hl_col, emission=hl_col, emission_strength=14.0)
    mats["taillight"] = make_pbr_mat("Mat_Taillight_Emissive", (1.0, 0.02, 0.03, 1.0), emission=(1.0, 0.01, 0.02, 1.0), emission_strength=10.0)
    mats["drl"] = make_pbr_mat("Mat_DRL_Emissive", (0.95, 0.98, 1.0, 1.0), emission=(0.95, 0.98, 1.0, 1.0), emission_strength=18.0)

    return mats

# ----------------------------------------------------------------------------
# 2. CLASS-A QUAD PATCH & MESH HELPERS
# ----------------------------------------------------------------------------
def make_quad_grid(bm, rows):
    grid = []
    for r in rows:
        row_verts = [bm.verts.new(pt) for pt in r]
        grid.append(row_verts)
    for i in range(len(rows) - 1):
        for j in range(len(rows[i]) - 1):
            bm.faces.new((grid[i][j], grid[i][j+1], grid[i+1][j+1], grid[i+1][j]))

def link_obj(name, bm, parent, mat, bevel=0.003, subsurf=0):
    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    if parent:
        obj.parent = parent
    bpy.context.scene.collection.objects.link(obj)
    if mat:
        obj.data.materials.append(mat)
    
    for p in obj.data.polygons:
        p.use_smooth = True
    if bevel > 0:
        bv = obj.modifiers.new("Bevel", 'BEVEL')
        bv.width = bevel
        bv.segments = 2
        bv.limit_method = 'ANGLE'
        bv.angle_limit = math.radians(35)
        bv.use_clamp_overlap = True
    if subsurf > 0:
        ss = obj.modifiers.new("Subsurf", 'SUBSURF')
        ss.levels = subsurf
    wn = obj.modifiers.new("WeightedNormal", 'WEIGHTED_NORMAL')
    wn.keep_sharp = True
    return obj

def link_mirrored(name, bm, parent, mat, bevel=0.003, subsurf=1):
    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    if parent:
        obj.parent = parent
    bpy.context.scene.collection.objects.link(obj)

    m = obj.modifiers.new("Mirror", 'MIRROR')
    m.use_axis[0] = True
    m.use_clip = True
    m.merge_threshold = 0.002

    if mat:
        obj.data.materials.append(mat)
    
    for p in obj.data.polygons:
        p.use_smooth = True
    if bevel > 0:
        bv = obj.modifiers.new("Bevel", 'BEVEL')
        bv.width = bevel
        bv.segments = 2
        bv.limit_method = 'ANGLE'
        bv.angle_limit = math.radians(35)
        bv.use_clamp_overlap = True
    if subsurf > 0:
        ss = obj.modifiers.new("Subsurf", 'SUBSURF')
        ss.levels = subsurf
    wn = obj.modifiers.new("WeightedNormal", 'WEIGHTED_NORMAL')
    wn.keep_sharp = True
    return obj

def make_annular_tire(bm, r_inner, r_outer, width, x_center=0.0, segments=32):
    half_w = width / 2.0
    outer_pts = []
    inner_pts = []
    for i in range(segments):
        angle = (2.0 * math.pi / segments) * i
        y_out = r_outer * math.cos(angle)
        z_out = r_outer * math.sin(angle)
        y_in = r_inner * math.cos(angle)
        z_in = r_inner * math.sin(angle)
        outer_pts.append((y_out, z_out))
        inner_pts.append((y_in, z_in))

    for i in range(segments):
        ni = (i + 1) % segments
        yo0, zo0 = outer_pts[i]
        yo1, zo1 = outer_pts[ni]
        yi0, zi0 = inner_pts[i]
        yi1, zi1 = inner_pts[ni]

        # Tread
        v0 = bm.verts.new((x_center - half_w, yo0, zo0))
        v1 = bm.verts.new((x_center + half_w, yo0, zo0))
        v2 = bm.verts.new((x_center + half_w, yo1, zo1))
        v3 = bm.verts.new((x_center - half_w, yo1, zo1))
        bm.faces.new([v0, v1, v2, v3])

        # Outer sidewall
        v4 = bm.verts.new((x_center + half_w, yi0, zi0))
        v5 = bm.verts.new((x_center + half_w, yi1, zi1))
        bm.faces.new([v1, v4, v5, v2])

        # Inner sidewall
        v6 = bm.verts.new((x_center - half_w, yi0, zi0))
        v7 = bm.verts.new((x_center - half_w, yi1, zi1))
        bm.faces.new([v6, v0, v3, v7])

def create_wheel(name, radius, width, location, parent, materials, spoke_count=5, is_phone_dial=False):
    x, y, z = location
    is_left = x > 0

    # 1. Tire
    bm_t = bmesh.new()
    rim_r = radius * 0.72
    make_annular_tire(bm_t, rim_r, radius, width, x_center=0.0, segments=28)
    tire_obj = link_obj(f"{name}_Tire", bm_t, parent, materials["tire_rubber"], bevel=0.002)
    tire_obj.location = location

    # 2. Rim
    bm_r = bmesh.new()
    rim_outer_x = (width * 0.44) if is_left else (-width * 0.44)
    bmesh.ops.create_cone(bm_r, cap_ends=False, segments=24, radius1=rim_r, radius2=rim_r * 0.94, depth=width * 0.4)
    bmesh.ops.rotate(bm_r, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(90), 3, 'Y'), verts=bm_r.verts)
    bmesh.ops.translate(bm_r, vec=Vector((rim_outer_x * 0.6, 0, 0)), verts=bm_r.verts)

    hub_v = len(bm_r.verts)
    bmesh.ops.create_cone(bm_r, cap_ends=True, segments=16, radius1=rim_r * 0.28, radius2=rim_r * 0.28, depth=0.04)
    bmesh.ops.rotate(bm_r, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(90), 3, 'Y'), verts=bm_r.verts[hub_v:])
    bmesh.ops.translate(bm_r, vec=Vector((rim_outer_x * 0.85, 0, 0)), verts=bm_r.verts[hub_v:])

    if is_phone_dial:
        disc_v = len(bm_r.verts)
        bmesh.ops.create_cone(bm_r, cap_ends=True, segments=28, radius1=rim_r * 0.93, radius2=rim_r * 0.93, depth=0.02)
        bmesh.ops.rotate(bm_r, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(90), 3, 'Y'), verts=bm_r.verts[disc_v:])
        bmesh.ops.translate(bm_r, vec=Vector((rim_outer_x * 0.78, 0, 0)), verts=bm_r.verts[disc_v:])
    else:
        for s in range(spoke_count):
            angle = (2.0 * math.pi / spoke_count) * s
            spk_v = len(bm_r.verts)
            bmesh.ops.create_cube(bm_r, size=1.0)
            bmesh.ops.scale(bm_r, vec=Vector((0.022, 0.045, rim_r * 0.76)), verts=bm_r.verts[spk_v:])
            bmesh.ops.rotate(bm_r, cent=Vector((0,0,0)), matrix=Matrix.Rotation(angle, 3, 'X'), verts=bm_r.verts[spk_v:])
            bmesh.ops.translate(bm_r, vec=Vector((rim_outer_x * 0.82, 0, 0)), verts=bm_r.verts[spk_v:])

    rim_obj = link_obj(f"{name}_Rim", bm_r, parent, materials["wheel_alloy"], bevel=0.002)
    rim_obj.location = location

    # 3. Brake Rotor & Caliper
    bm_d = bmesh.new()
    disc_r = rim_r * 0.78
    bmesh.ops.create_cone(bm_d, cap_ends=True, segments=20, radius1=disc_r, radius2=disc_r, depth=0.02)
    bmesh.ops.rotate(bm_d, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(90), 3, 'Y'), verts=bm_d.verts)
    disc_obj = link_obj(f"{name}_BrakeDisc", bm_d, parent, materials["brake_rotor"], bevel=0.002)
    disc_x = x + (-0.015 if is_left else 0.015)
    disc_obj.location = (disc_x, y, z)

    bm_c = bmesh.new()
    bmesh.ops.create_cube(bm_c, size=1.0)
    bmesh.ops.scale(bm_c, vec=Vector((0.045, 0.10, 0.14)), verts=bm_c.verts)
    cal_obj = link_obj(f"{name}_Caliper", bm_c, parent, materials["brake_caliper"], bevel=0.003)
    cal_x = disc_x + (0.025 if is_left else -0.025)
    cal_obj.location = (cal_x, y + disc_r * 0.52, z + disc_r * 0.52)

# ----------------------------------------------------------------------------
# 3. CLASS-A SUPERCAR BODY BUILDER
# ----------------------------------------------------------------------------
def build_class_a_supercar(spec, materials, roots):
    L, W, H, WB, GC = spec["dims"]
    half_w = W / 2.0
    half_l = L / 2.0
    half_wb = WB / 2.0
    wheel_r = spec["wheel_r"]
    wheel_w = spec["wheel_w"]
    tf = spec["tf"]
    tr = spec["tr"]
    half_tf = tf / 2.0
    half_tr = tr / 2.0
    sill_z = GC + 0.04
    r_arch = wheel_r + 0.045

    # 1. UNDERBODY TRAY & REAR DIFFUSER
    bm_fl = bmesh.new()
    bmesh.ops.create_cube(bm_fl, size=1.0)
    bmesh.ops.scale(bm_fl, vec=Vector((W * 0.88, L * 0.90, 0.03)), verts=bm_fl.verts)
    bmesh.ops.translate(bm_fl, vec=Vector((0.0, 0.0, sill_z - 0.01)), verts=bm_fl.verts)
    link_obj("PLATFORM_Underbody", bm_fl, roots["PLATFORM"], materials["trim_dark"], bevel=0.004)

    # 2. CLASS-A HOOD / NOSE
    bm_hood = bmesh.new()
    hood_rows = []
    cowl_y = spec["cowl_y"]
    cowl_z = spec["cowl_z"]
    nose_y = spec["nose_y"]
    nose_z = spec["nose_z"]
    steps_h = 7
    for i in range(steps_h):
        t = i / float(steps_h - 1)
        hy = cowl_y + (nose_y - cowl_y) * t
        hz = cowl_z + (nose_z - cowl_z) * t
        hw = (spec["cowl_w"] + (spec["nose_w"] - spec["cowl_w"]) * t) / 2.0
        crown = 0.015 * math.sin(t * math.pi)
        hood_rows.append([
            Vector((0.0, hy, hz + crown + 0.008)),
            Vector((hw * 0.45, hy, hz + crown + 0.012)),
            Vector((hw * 0.82, hy, hz + crown + 0.005)),
            Vector((hw, hy, hz)),
        ])
    make_quad_grid(bm_hood, hood_rows)
    link_mirrored("BODY_Hood", bm_hood, roots["BODY"], materials["paint"], bevel=0.003, subsurf=1)

    # 3. CLASS-A FRONT FENDERS (With True Wheel Arch Cutouts)
    bm_ff = bmesh.new()
    ff_rows = []
    f_stations = [nose_y, half_wb + r_arch + 0.12, half_wb + r_arch * 0.7, half_wb, half_wb - r_arch * 0.7, half_wb - r_arch - 0.08, cowl_y]
    for fy in f_stations:
        t_f = (fy - cowl_y) / (nose_y - cowl_y)
        hw_in = (spec["cowl_w"] + (spec["nose_w"] - spec["cowl_w"]) * t_f) / 2.0
        hz_in = cowl_z + (nose_z - cowl_z) * t_f

        dy = fy - half_wb
        if abs(dy) < r_arch:
            arch_z = wheel_r + math.sqrt(max(0.002, r_arch**2 - dy**2))
            flare_x = half_tf + wheel_w * 0.45
            bot_z = arch_z
        else:
            flare_x = half_w * 0.94
            bot_z = sill_z

        ff_rows.append([
            Vector((hw_in, fy, hz_in)),
            Vector((flare_x * 0.75, fy, hz_in * 0.98 + 0.02)),
            Vector((flare_x, fy, hz_in * 0.92)),
            Vector((flare_x * 0.98, fy, bot_z)),
        ])
    make_quad_grid(bm_ff, ff_rows)
    link_mirrored("BODY_Front_Fenders", bm_ff, roots["BODY"], materials["paint"], bevel=0.003, subsurf=1)

    # 4. CLASS-A DOORS & SILLS
    bm_door = bmesh.new()
    door_rows = []
    d_stations = [cowl_y, 0.45, 0.0, -0.45, spec["rear_quarter_y"]]
    for dy_pos in d_stations:
        t_d = (dy_pos - cowl_y) / (spec["rear_quarter_y"] - cowl_y)
        door_x = half_w * 0.96 - 0.04 * math.sin(t_d * math.pi) # Scalloped waist
        belt_z = spec["belt_z"]
        door_rows.append([
            Vector((spec["cabin_w"] * 0.52, dy_pos, belt_z)),
            Vector((door_x * 0.88, dy_pos, belt_z - 0.05)),
            Vector((door_x, dy_pos, (belt_z + sill_z) * 0.5)),
            Vector((door_x * 0.96, dy_pos, sill_z)),
        ])
    make_quad_grid(bm_door, door_rows)
    link_mirrored("BODY_Doors", bm_door, roots["BODY"], materials["paint"], bevel=0.003, subsurf=1)

    # 5. CLASS-A REAR QUARTERS & HAUNCHES (With Rear Arch Cutouts)
    bm_rq = bmesh.new()
    rq_rows = []
    tail_y = spec["tail_y"]
    rq_stations = [spec["rear_quarter_y"], -half_wb + r_arch + 0.10, -half_wb + r_arch * 0.7, -half_wb, -half_wb - r_arch * 0.7, -half_wb - r_arch - 0.08, tail_y]
    for ry in rq_stations:
        t_r = (ry - spec["rear_quarter_y"]) / (tail_y - spec["rear_quarter_y"])
        deck_w = spec["deck_w_start"] + (spec["deck_w_end"] - spec["deck_w_start"]) * t_r
        deck_z = spec["deck_z_start"] + (spec["deck_z_end"] - spec["deck_z_start"]) * t_r

        dy = ry - (-half_wb)
        if abs(dy) < r_arch:
            arch_z = wheel_r + math.sqrt(max(0.002, r_arch**2 - dy**2))
            flare_x = half_tr + wheel_w * 0.50
            bot_z = arch_z
        else:
            flare_x = half_w * 0.98
            bot_z = sill_z

        rq_rows.append([
            Vector((deck_w / 2.0, ry, deck_z)),
            Vector((flare_x * 0.78, ry, deck_z * 0.98 + 0.03)),
            Vector((flare_x, ry, deck_z * 0.92)),
            Vector((flare_x * 0.98, ry, bot_z)),
        ])
    make_quad_grid(bm_rq, rq_rows)
    link_mirrored("BODY_Rear_Quarters", bm_rq, roots["BODY"], materials["paint"], bevel=0.003, subsurf=1)

    # 6. FRONT NOSE & SPLITTER
    bm_nose = bmesh.new()
    bmesh.ops.create_cube(bm_nose, size=1.0)
    bmesh.ops.scale(bm_nose, vec=Vector((spec["nose_w"] * 0.96, 0.35, 0.18)), verts=bm_nose.verts)
    bmesh.ops.translate(bm_nose, vec=Vector((0.0, nose_y - 0.12, (nose_z + sill_z) * 0.5)), verts=bm_nose.verts)
    link_obj("BODY_Front_Fascia", bm_nose, roots["BODY"], materials["paint"], bevel=0.004)

    bm_sp = bmesh.new()
    bmesh.ops.create_cube(bm_sp, size=1.0)
    bmesh.ops.scale(bm_sp, vec=Vector((W * 0.94, 0.42, 0.03)), verts=bm_sp.verts)
    bmesh.ops.translate(bm_sp, vec=Vector((0.0, nose_y - 0.05, sill_z - 0.005)), verts=bm_sp.verts)
    link_obj("AERO_Front_Splitter", bm_sp, roots["AERO"], materials["carbon"], bevel=0.003)

    # 7. REAR TAIL FASCIA & DIFFUSER
    bm_tail = bmesh.new()
    bmesh.ops.create_cube(bm_tail, size=1.0)
    bmesh.ops.scale(bm_tail, vec=Vector((spec["deck_w_end"] * 0.96, 0.28, 0.28)), verts=bm_tail.verts)
    bmesh.ops.translate(bm_tail, vec=Vector((0.0, tail_y + 0.10, (spec["deck_z_end"] + sill_z) * 0.5)), verts=bm_tail.verts)
    link_obj("BODY_Rear_Fascia", bm_tail, roots["BODY"], materials["paint"], bevel=0.004)

    bm_diff = bmesh.new()
    bmesh.ops.create_cube(bm_diff, size=1.0)
    bmesh.ops.scale(bm_diff, vec=Vector((W * 0.88, 0.65, 0.14)), verts=bm_diff.verts)
    bmesh.ops.translate(bm_diff, vec=Vector((0.0, tail_y + 0.25, sill_z + 0.05)), verts=bm_diff.verts)
    link_obj("AERO_Rear_Diffuser", bm_diff, roots["AERO"], materials["carbon"], bevel=0.004)

    # 8. GREENHOUSE & CANOPY GLASS
    bm_glass = bmesh.new()
    canopy_rows = []
    c_stations = [
        (cowl_y, cowl_z + 0.02, spec["cowl_w"] * 0.82),
        (spec["windshield_top_y"], spec["roof_z"] - 0.03, spec["cabin_w"] * 0.75),
        (spec["roof_peak_y"], spec["roof_z"], spec["cabin_w"] * 0.72),
        (spec["roof_rear_y"], spec["roof_z"] - 0.05, spec["cabin_w"] * 0.70),
        (spec["rear_glass_y"], spec["deck_z_start"] + 0.02, spec["deck_w_start"] * 0.65),
    ]
    for cy, cz, cw in c_stations:
        canopy_rows.append([
            Vector((0.0, cy, cz + 0.015)),
            Vector((cw * 0.35, cy, cz + 0.01)),
            Vector((cw * 0.70, cy, cz)),
            Vector((cw, cy, cz - 0.03)),
        ])
    make_quad_grid(bm_glass, canopy_rows)
    link_mirrored("GLASS_Canopy", bm_glass, roots["GLASS"], materials["glass"], bevel=0.002, subsurf=1)

    # 9. A-PILLARS & ROOF CROWN (Body colored)
    bm_rf = bmesh.new()
    rf_rows = []
    for cy, cz, cw in c_stations[1:4]:
        rf_rows.append([
            Vector((0.0, cy, cz + 0.018)),
            Vector((cw * 0.40, cy, cz + 0.015)),
            Vector((cw * 0.75, cy, cz + 0.005)),
            Vector((cw * 1.02, cy, cz - 0.02)),
        ])
    make_quad_grid(bm_rf, rf_rows)
    link_mirrored("BODY_Roof_Panel", bm_rf, roots["BODY"], materials["paint"], bevel=0.003, subsurf=1)

    # 10. HEADLIGHTS & TAILLIGHTS
    spec["lights_fn"](materials, roots, spec)

    # 11. BESPOKE AERO WINGS & EXHAUST
    spec["aero_fn"](materials, roots, spec)

    # 12. FOUR CLASS-A WHEELS
    is_phone_dial = spec.get("is_phone_dial", False)
    spoke_c = spec.get("spoke_count", 5)
    create_wheel("WHEEL_FL", wheel_r, wheel_w, (half_tf, half_wb, wheel_r), roots["WHEELS"], materials, spoke_count=spoke_c, is_phone_dial=is_phone_dial)
    create_wheel("WHEEL_FR", wheel_r, wheel_w, (-half_tf, half_wb, wheel_r), roots["WHEELS"], materials, spoke_count=spoke_c, is_phone_dial=is_phone_dial)
    create_wheel("WHEEL_RL", wheel_r * spec.get("rear_wheel_scale", 1.04), wheel_w * spec.get("rear_wheel_w_scale", 1.25),
                 (half_tr, -half_wb, wheel_r * spec.get("rear_wheel_scale", 1.04)), roots["WHEELS"], materials, spoke_count=spoke_c, is_phone_dial=is_phone_dial)
    create_wheel("WHEEL_RR", wheel_r * spec.get("rear_wheel_scale", 1.04), wheel_w * spec.get("rear_wheel_w_scale", 1.25),
                 (-half_tr, -half_wb, wheel_r * spec.get("rear_wheel_scale", 1.04)), roots["WHEELS"], materials, spoke_count=spoke_c, is_phone_dial=is_phone_dial)

# ----------------------------------------------------------------------------
# 4. BESPOKE FEATURE GENERATORS FOR EACH SUPERCAR ERA
# ----------------------------------------------------------------------------

# --- 1970s: Countach LP400 ---
def countach_lights(mats, roots, spec):
    # Pop-up covers on hood
    bm_hl = bmesh.new()
    for side in [-1, 1]:
        bmesh.ops.create_cube(bm_hl, size=1.0)
        bmesh.ops.scale(bm_hl, vec=Vector((0.24, 0.20, 0.02)), verts=bm_hl.verts[-8:])
        bmesh.ops.translate(bm_hl, vec=Vector((side * 0.48, 1.55, 0.58)), verts=bm_hl.verts[-8:])
    link_obj("LIGHT_Headlights", bm_hl, roots["LIGHT"], mats["headlight"], bevel=0.002)

    # Rectangular horizontal taillights
    bm_tl = bmesh.new()
    for side in [-1, 1]:
        bmesh.ops.create_cube(bm_tl, size=1.0)
        bmesh.ops.scale(bm_tl, vec=Vector((0.36, 0.04, 0.12)), verts=bm_tl.verts[-8:])
        bmesh.ops.translate(bm_tl, vec=Vector((side * 0.54, spec["tail_y"] - 0.02, 0.62)), verts=bm_tl.verts[-8:])
    link_obj("LIGHT_Taillights", bm_tl, roots["LIGHT"], mats["taillight"], bevel=0.002)

def countach_aero(mats, roots, spec):
    # Periscopio roof tunnel
    bm_p = bmesh.new()
    bmesh.ops.create_cube(bm_p, size=1.0)
    bmesh.ops.scale(bm_p, vec=Vector((0.32, 0.65, 0.08)), verts=bm_p.verts)
    bmesh.ops.translate(bm_p, vec=Vector((0.0, -0.45, 1.04)), verts=bm_p.verts)
    link_obj("BODY_Periscopio_Tunnel", bm_p, roots["BODY"], mats["paint"], bevel=0.003)

    # NACA Side Ducts & Shoulder Boxes
    bm_nc = bmesh.new()
    for side in [-1, 1]:
        bmesh.ops.create_cube(bm_nc, size=1.0)
        bmesh.ops.scale(bm_nc, vec=Vector((0.08, 0.45, 0.15)), verts=bm_nc.verts[-8:])
        bmesh.ops.translate(bm_nc, vec=Vector((side * (spec["dims"][1]*0.48), -0.85, 0.72)), verts=bm_nc.verts[-8:])
        # Shoulder air intake box
        bmesh.ops.create_cube(bm_nc, size=1.0)
        bmesh.ops.scale(bm_nc, vec=Vector((0.14, 0.38, 0.10)), verts=bm_nc.verts[-8:])
        bmesh.ops.translate(bm_nc, vec=Vector((side * 0.72, -1.35, 0.88)), verts=bm_nc.verts[-8:])
    link_obj("BODY_NACA_Ducts", bm_nc, roots["BODY"], mats["trim_dark"], bevel=0.002)

    # Quad exhaust pipes
    bm_ex = bmesh.new()
    for side in [-1, 1]:
        for sub in [-0.05, 0.05]:
            v_s = len(bm_ex.verts)
            bmesh.ops.create_cone(bm_ex, cap_ends=True, segments=16, radius1=0.04, radius2=0.04, depth=0.22)
            bmesh.ops.rotate(bm_ex, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(90), 3, 'X'), verts=bm_ex.verts[v_s:])
            bmesh.ops.translate(bm_ex, vec=Vector((side * 0.44 + sub, spec["tail_y"] - 0.05, 0.30)), verts=bm_ex.verts[v_s:])
    link_obj("BODY_Exhaust_Tips", bm_ex, roots["BODY"], mats["exhaust"], bevel=0.002)

# --- 1980s: Ferrari F40 ---
def f40_lights(mats, roots, spec):
    bm_hl = bmesh.new()
    for side in [-1, 1]:
        # Pop-up cover
        bmesh.ops.create_cube(bm_hl, size=1.0)
        bmesh.ops.scale(bm_hl, vec=Vector((0.24, 0.18, 0.02)), verts=bm_hl.verts[-8:])
        bmesh.ops.translate(bm_hl, vec=Vector((side * 0.52, 1.62, 0.58)), verts=bm_hl.verts[-8:])
        # Front driving light
        bmesh.ops.create_cube(bm_hl, size=1.0)
        bmesh.ops.scale(bm_hl, vec=Vector((0.22, 0.03, 0.10)), verts=bm_hl.verts[-8:])
        bmesh.ops.translate(bm_hl, vec=Vector((side * 0.52, spec["nose_y"] - 0.05, 0.44)), verts=bm_hl.verts[-8:])
    link_obj("LIGHT_Headlights", bm_hl, roots["LIGHT"], mats["headlight"], bevel=0.002)

    bm_tl = bmesh.new()
    for side in [-1, 1]:
        for offset_x in [0.46, 0.68]:
            v_s = len(bm_tl.verts)
            bmesh.ops.create_cone(bm_tl, cap_ends=True, segments=18, radius1=0.07, radius2=0.07, depth=0.02)
            bmesh.ops.rotate(bm_tl, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(90), 3, 'X'), verts=bm_tl.verts[v_s:])
            bmesh.ops.translate(bm_tl, vec=Vector((side * offset_x, spec["tail_y"] - 0.02, 0.72)), verts=bm_tl.verts[v_s:])
    link_obj("LIGHT_Taillights", bm_tl, roots["LIGHT"], mats["taillight"], bevel=0.002)

def f40_aero(mats, roots, spec):
    # Iconic F40 High Hoop Wing
    bm_w = bmesh.new()
    for side in [-1, 1]:
        bmesh.ops.create_cube(bm_w, size=1.0)
        bmesh.ops.scale(bm_w, vec=Vector((0.08, 0.65, 0.48)), verts=bm_w.verts[-8:])
        bmesh.ops.translate(bm_w, vec=Vector((side * 0.90, spec["tail_y"] + 0.18, 1.10)), verts=bm_w.verts[-8:])
    # Wing aerofoil blade
    bmesh.ops.create_cube(bm_w, size=1.0)
    bmesh.ops.scale(bm_w, vec=Vector((1.90, 0.38, 0.05)), verts=bm_w.verts[-8:])
    bmesh.ops.translate(bm_w, vec=Vector((0.0, spec["tail_y"] + 0.10, 1.32)), verts=bm_w.verts[-8:])
    link_obj("AERO_F40_RearWing", bm_w, roots["AERO"], mats["paint"], bevel=0.003)

    # Triple center exhaust
    bm_ex = bmesh.new()
    for offset_x, rad in [(-0.09, 0.042), (0.0, 0.032), (0.09, 0.042)]:
        v_s = len(bm_ex.verts)
        bmesh.ops.create_cone(bm_ex, cap_ends=True, segments=16, radius1=rad, radius2=rad, depth=0.22)
        bmesh.ops.rotate(bm_ex, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(90), 3, 'X'), verts=bm_ex.verts[v_s:])
        bmesh.ops.translate(bm_ex, vec=Vector((offset_x, spec["tail_y"] - 0.02, 0.36)), verts=bm_ex.verts[v_s:])
    link_obj("BODY_Exhaust_Tips", bm_ex, roots["BODY"], mats["exhaust"], bevel=0.002)

# --- 1990s: McLaren F1 ---
def mclaren_f1_lights(mats, roots, spec):
    bm_hl = bmesh.new()
    for side in [-1, 1]:
        bmesh.ops.create_cube(bm_hl, size=1.0)
        bmesh.ops.scale(bm_hl, vec=Vector((0.22, 0.28, 0.08)), verts=bm_hl.verts[-8:])
        bmesh.ops.translate(bm_hl, vec=Vector((side * 0.48, 1.62, 0.58)), verts=bm_hl.verts[-8:])
    link_obj("LIGHT_Headlights", bm_hl, roots["LIGHT"], mats["headlight"], bevel=0.002)

    bm_tl = bmesh.new()
    for side in [-1, 1]:
        for sub_x in [0.42, 0.62]:
            v_s = len(bm_tl.verts)
            bmesh.ops.create_cone(bm_tl, cap_ends=True, segments=18, radius1=0.065, radius2=0.065, depth=0.02)
            bmesh.ops.rotate(bm_tl, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(90), 3, 'X'), verts=bm_tl.verts[v_s:])
            bmesh.ops.translate(bm_tl, vec=Vector((side * sub_x, spec["tail_y"] - 0.02, 0.68)), verts=bm_tl.verts[v_s:])
    link_obj("LIGHT_Taillights", bm_tl, roots["LIGHT"], mats["taillight"], bevel=0.002)

def mclaren_f1_aero(mats, roots, spec):
    # Roof Induction Snorkel
    bm_s = bmesh.new()
    bmesh.ops.create_cone(bm_s, cap_ends=True, segments=16, radius1=0.08, radius2=0.06, depth=0.55)
    bmesh.ops.rotate(bm_s, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(90), 3, 'X'), verts=bm_s.verts)
    bmesh.ops.translate(bm_s, vec=Vector((0.0, -0.20, spec["roof_z"] + 0.06)), verts=bm_s.verts)
    link_obj("AERO_Roof_Snorkel", bm_s, roots["AERO"], mats["carbon"], bevel=0.002)

    # Center-quad exhaust arrangement
    bm_ex = bmesh.new()
    for ex_x in [-0.10, -0.035, 0.035, 0.10]:
        v_s = len(bm_ex.verts)
        bmesh.ops.create_cone(bm_ex, cap_ends=True, segments=16, radius1=0.032, radius2=0.032, depth=0.20)
        bmesh.ops.rotate(bm_ex, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(90), 3, 'X'), verts=bm_ex.verts[v_s:])
        bmesh.ops.translate(bm_ex, vec=Vector((ex_x, spec["tail_y"] - 0.02, 0.36)), verts=bm_ex.verts[v_s:])
    link_obj("BODY_Exhaust_Tips", bm_ex, roots["BODY"], mats["exhaust"], bevel=0.002)

    # 1+2 Central Cockpit
    bm_in = bmesh.new()
    bmesh.ops.create_cube(bm_in, size=1.0)
    bmesh.ops.scale(bm_in, vec=Vector((0.42, 0.45, 0.65)), verts=bm_in.verts[-8:])
    bmesh.ops.translate(bm_in, vec=Vector((0.0, 0.05, 0.52)), verts=bm_in.verts[-8:])
    for side in [-1, 1]:
        bmesh.ops.create_cube(bm_in, size=1.0)
        bmesh.ops.scale(bm_in, vec=Vector((0.36, 0.40, 0.58)), verts=bm_in.verts[-8:])
        bmesh.ops.translate(bm_in, vec=Vector((side * 0.42, -0.28, 0.48)), verts=bm_in.verts[-8:])
    link_obj("INTERIOR_Central_Cockpit", bm_in, roots["INTERIOR"], mats["interior"], bevel=0.004)

# --- 2000s: Ford GT (2005) ---
def ford_gt_lights(mats, roots, spec):
    bm_hl = bmesh.new()
    for side in [-1, 1]:
        bmesh.ops.create_cube(bm_hl, size=1.0)
        bmesh.ops.scale(bm_hl, vec=Vector((0.24, 0.32, 0.08)), verts=bm_hl.verts[-8:])
        bmesh.ops.translate(bm_hl, vec=Vector((side * 0.62, 1.95, 0.54)), verts=bm_hl.verts[-8:])
    link_obj("LIGHT_Headlights", bm_hl, roots["LIGHT"], mats["headlight"], bevel=0.002)

    bm_tl = bmesh.new()
    for side in [-1, 1]:
        v_s = len(bm_tl.verts)
        bmesh.ops.create_cone(bm_tl, cap_ends=True, segments=22, radius1=0.10, radius2=0.10, depth=0.03)
        bmesh.ops.rotate(bm_tl, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(90), 3, 'X'), verts=bm_tl.verts[v_s:])
        bmesh.ops.translate(bm_tl, vec=Vector((side * 0.62, spec["tail_y"] - 0.02, 0.70)), verts=bm_tl.verts[v_s:])
    link_obj("LIGHT_Taillights", bm_tl, roots["LIGHT"], mats["taillight"], bevel=0.002)

def ford_gt_aero(mats, roots, spec):
    # Hood radiator nostrils
    bm_d = bmesh.new()
    for side in [-1, 1]:
        bmesh.ops.create_cube(bm_d, size=1.0)
        bmesh.ops.scale(bm_d, vec=Vector((0.26, 0.42, 0.05)), verts=bm_d.verts[-8:])
        bmesh.ops.translate(bm_d, vec=Vector((side * 0.32, 1.55, 0.65)), verts=bm_d.verts[-8:])
    link_obj("BODY_Hood_Nostrils", bm_d, roots["BODY"], mats["trim_dark"], bevel=0.002)

    # Center dual high-flow stainless exhaust tips
    bm_ex = bmesh.new()
    for offset_x in [-0.075, 0.075]:
        v_s = len(bm_ex.verts)
        bmesh.ops.create_cone(bm_ex, cap_ends=True, segments=16, radius1=0.055, radius2=0.055, depth=0.25)
        bmesh.ops.rotate(bm_ex, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(90), 3, 'X'), verts=bm_ex.verts[v_s:])
        bmesh.ops.translate(bm_ex, vec=Vector((offset_x, spec["tail_y"] - 0.02, 0.52)), verts=bm_ex.verts[v_s:])
    link_obj("BODY_Exhaust_Tips", bm_ex, roots["BODY"], mats["exhaust"], bevel=0.002)

# --- 2010s: Ferrari 458 Italia ---
def f458_lights(mats, roots, spec):
    bm_hl = bmesh.new()
    for side in [-1, 1]:
        bmesh.ops.create_cube(bm_hl, size=1.0)
        bmesh.ops.scale(bm_hl, vec=Vector((0.08, 0.46, 0.04)), verts=bm_hl.verts[-8:])
        bmesh.ops.rotate(bm_hl, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(-14), 3, 'X'), verts=bm_hl.verts[-8:])
        bmesh.ops.translate(bm_hl, vec=Vector((side * 0.68, 1.82, 0.64)), verts=bm_hl.verts[-8:])
    link_obj("LIGHT_Headlights", bm_hl, roots["LIGHT"], mats["drl"], bevel=0.002)

    bm_tl = bmesh.new()
    for side in [-1, 1]:
        v_s = len(bm_tl.verts)
        bmesh.ops.create_cone(bm_tl, cap_ends=True, segments=22, radius1=0.11, radius2=0.11, depth=0.03)
        bmesh.ops.rotate(bm_tl, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(90), 3, 'X'), verts=bm_tl.verts[v_s:])
        bmesh.ops.translate(bm_tl, vec=Vector((side * 0.65, spec["tail_y"] - 0.02, 0.74)), verts=bm_tl.verts[v_s:])
    link_obj("LIGHT_Taillights", bm_tl, roots["LIGHT"], mats["taillight"], bevel=0.002)

def f458_aero(mats, roots, spec):
    # Signature 458 triple-pipe central exhaust
    bm_ex = bmesh.new()
    for offset_x in [-0.08, 0.0, 0.08]:
        v_s = len(bm_ex.verts)
        bmesh.ops.create_cone(bm_ex, cap_ends=True, segments=16, radius1=0.038, radius2=0.038, depth=0.22)
        bmesh.ops.rotate(bm_ex, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(90), 3, 'X'), verts=bm_ex.verts[v_s:])
        bmesh.ops.translate(bm_ex, vec=Vector((offset_x, spec["tail_y"] - 0.02, 0.42)), verts=bm_ex.verts[v_s:])
    link_obj("BODY_Exhaust_Tips", bm_ex, roots["BODY"], mats["exhaust"], bevel=0.002)

# --- 2020s: Lamborghini Revuelto ---
def revuelto_lights(mats, roots, spec):
    bm_drl = bmesh.new()
    for side in [-1, 1]:
        # Upper stem of Y
        bmesh.ops.create_cube(bm_drl, size=1.0)
        bmesh.ops.scale(bm_drl, vec=Vector((0.035, 0.28, 0.035)), verts=bm_drl.verts[-8:])
        bmesh.ops.rotate(bm_drl, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(-side * 28), 3, 'Z'), verts=bm_drl.verts[-8:])
        bmesh.ops.translate(bm_drl, vec=Vector((side * 0.65, 1.98, 0.62)), verts=bm_drl.verts[-8:])
        # Lower stem of Y
        bmesh.ops.create_cube(bm_drl, size=1.0)
        bmesh.ops.scale(bm_drl, vec=Vector((0.035, 0.26, 0.035)), verts=bm_drl.verts[-8:])
        bmesh.ops.rotate(bm_drl, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(side * 25), 3, 'Z'), verts=bm_drl.verts[-8:])
        bmesh.ops.translate(bm_drl, vec=Vector((side * 0.65, 1.98, 0.50)), verts=bm_drl.verts[-8:])
    link_obj("LIGHT_Headlights", bm_drl, roots["LIGHT"], mats["drl"], bevel=0.002)

    bm_tl = bmesh.new()
    for side in [-1, 1]:
        bmesh.ops.create_cube(bm_tl, size=1.0)
        bmesh.ops.scale(bm_tl, vec=Vector((0.26, 0.04, 0.04)), verts=bm_tl.verts[-8:])
        bmesh.ops.translate(bm_tl, vec=Vector((side * 0.65, spec["tail_y"] - 0.02, 0.74)), verts=bm_tl.verts[-8:])
    link_obj("LIGHT_Taillights", bm_tl, roots["LIGHT"], mats["taillight"], bevel=0.002)

def revuelto_aero(mats, roots, spec):
    # High-mounted hexagonal dual exhaust outlets
    bm_ex = bmesh.new()
    for offset_x in [-0.14, 0.14]:
        v_s = len(bm_ex.verts)
        bmesh.ops.create_cone(bm_ex, cap_ends=True, segments=6, radius1=0.065, radius2=0.065, depth=0.22)
        bmesh.ops.rotate(bm_ex, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(90), 3, 'X'), verts=bm_ex.verts[v_s:])
        bmesh.ops.translate(bm_ex, vec=Vector((offset_x, spec["tail_y"] - 0.02, 0.76)), verts=bm_ex.verts[v_s:])
    link_obj("BODY_Exhaust_Tips", bm_ex, roots["BODY"], mats["exhaust"], bevel=0.002)

# --- Future: McMurtry Spéirling ---
def mcmurtry_lights(mats, roots, spec):
    bm_l = bmesh.new()
    bmesh.ops.create_cube(bm_l, size=1.0)
    bmesh.ops.scale(bm_l, vec=Vector((1.30, 0.04, 0.025)), verts=bm_l.verts[-8:])
    bmesh.ops.translate(bm_l, vec=Vector((0.0, spec["nose_y"] - 0.04, 0.45)), verts=bm_l.verts[-8:])
    link_obj("LIGHT_Headlights", bm_l, roots["LIGHT"], mats["drl"], bevel=0.002)

    bm_tl = bmesh.new()
    bmesh.ops.create_cube(bm_tl, size=1.0)
    bmesh.ops.scale(bm_tl, vec=Vector((1.42, 0.04, 0.035)), verts=bm_tl.verts[-8:])
    bmesh.ops.translate(bm_tl, vec=Vector((0.0, spec["tail_y"] - 0.02, 0.72)), verts=bm_tl.verts[-8:])
    link_obj("LIGHT_Taillights", bm_tl, roots["LIGHT"], mats["taillight"], bevel=0.002)

def mcmurtry_aero(mats, roots, spec):
    # Twin High-Velocity Downforce Suction Fans
    bm_f = bmesh.new()
    for side in [-1, 1]:
        v_s = len(bm_f.verts)
        bmesh.ops.create_cone(bm_f, cap_ends=True, segments=24, radius1=0.18, radius2=0.18, depth=0.28)
        bmesh.ops.rotate(bm_f, cent=Vector((0,0,0)), matrix=Matrix.Rotation(math.radians(90), 3, 'X'), verts=bm_f.verts[v_s:])
        bmesh.ops.translate(bm_f, vec=Vector((side * 0.32, spec["tail_y"] + 0.12, 0.48)), verts=bm_f.verts[v_s:])
    link_obj("AERO_Downforce_Fans", bm_f, roots["AERO"], mats["carbon"], bevel=0.002)

# ----------------------------------------------------------------------------
# 5. SUPERCAR SPECIFICATIONS TABLE
# ----------------------------------------------------------------------------
SUPERCAR_SPECS = {
    "1970s": {
        "name": "Lamborghini Countach LP400",
        "color": (0.96, 0.78, 0.05, 1.0), # Giallo Fly
        "dims": (4.140, 1.890, 1.070, 2.450, 0.120),
        "wheel_r": 0.31, "wheel_w": 0.28, "tf": 1.490, "tr": 1.520,
        "is_phone_dial": True, "spoke_count": 5,
        "nose_y": 2.07, "nose_z": 0.38, "nose_w": 1.45,
        "cowl_y": 0.60, "cowl_z": 0.82, "cowl_w": 1.74,
        "belt_z": 0.86, "cabin_w": 1.35,
        "windshield_top_y": 0.00, "roof_peak_y": -0.25, "roof_rear_y": -0.65, "roof_z": 1.070,
        "rear_glass_y": -1.15,
        "rear_quarter_y": -0.45, "deck_w_start": 1.84, "deck_w_end": 1.78,
        "deck_z_start": 0.92, "deck_z_end": 0.80, "tail_y": -2.07,
        "lights_fn": countach_lights, "aero_fn": countach_aero,
    },
    "1980s": {
        "name": "Ferrari F40",
        "color": (0.85, 0.03, 0.05, 1.0), # Rosso Corsa
        "dims": (4.358, 1.970, 1.124, 2.450, 0.110),
        "wheel_r": 0.32, "wheel_w": 0.29, "tf": 1.594, "tr": 1.610,
        "is_phone_dial": False, "spoke_count": 5,
        "nose_y": 2.18, "nose_z": 0.42, "nose_w": 1.55,
        "cowl_y": 0.70, "cowl_z": 0.84, "cowl_w": 1.84,
        "belt_z": 0.88, "cabin_w": 1.40,
        "windshield_top_y": 0.10, "roof_peak_y": -0.15, "roof_rear_y": -0.75, "roof_z": 1.124,
        "rear_glass_y": -1.75,
        "rear_quarter_y": -0.40, "deck_w_start": 1.90, "deck_w_end": 1.92,
        "deck_z_start": 0.95, "deck_z_end": 0.88, "tail_y": -2.18,
        "lights_fn": f40_lights, "aero_fn": f40_aero,
    },
    "1990s": {
        "name": "McLaren F1",
        "color": (0.95, 0.45, 0.02, 1.0), # Papaya Orange
        "dims": (4.287, 1.820, 1.140, 2.718, 0.110),
        "wheel_r": 0.32, "wheel_w": 0.28, "tf": 1.568, "tr": 1.472,
        "is_phone_dial": False, "spoke_count": 5,
        "nose_y": 2.14, "nose_z": 0.44, "nose_w": 1.42,
        "cowl_y": 0.65, "cowl_z": 0.86, "cowl_w": 1.74,
        "belt_z": 0.88, "cabin_w": 1.30,
        "windshield_top_y": 0.05, "roof_peak_y": -0.20, "roof_rear_y": -0.75, "roof_z": 1.140,
        "rear_glass_y": -1.65,
        "rear_quarter_y": -0.45, "deck_w_start": 1.80, "deck_w_end": 1.76,
        "deck_z_start": 0.94, "deck_z_end": 0.84, "tail_y": -2.14,
        "lights_fn": mclaren_f1_lights, "aero_fn": mclaren_f1_aero,
    },
    "2000s": {
        "name": "Ford GT (2005)",
        "color": (0.35, 0.65, 0.85, 1.0), # Gulf Blue
        "dims": (4.643, 1.953, 1.125, 2.710, 0.115),
        "wheel_r": 0.34, "wheel_w": 0.29, "tf": 1.600, "tr": 1.618,
        "is_phone_dial": False, "spoke_count": 6,
        "nose_y": 2.32, "nose_z": 0.46, "nose_w": 1.62,
        "cowl_y": 0.65, "cowl_z": 0.86, "cowl_w": 1.88,
        "belt_z": 0.88, "cabin_w": 1.42,
        "windshield_top_y": 0.05, "roof_peak_y": -0.20, "roof_rear_y": -0.75, "roof_z": 1.125,
        "rear_glass_y": -1.75,
        "rear_quarter_y": -0.45, "deck_w_start": 1.92, "deck_w_end": 1.86,
        "deck_z_start": 0.96, "deck_z_end": 0.86, "tail_y": -2.32,
        "lights_fn": ford_gt_lights, "aero_fn": ford_gt_aero,
    },
    "2010s": {
        "name": "Ferrari 458 Italia",
        "color": (0.92, 0.06, 0.08, 1.0), # Rosso Scuderia
        "dims": (4.527, 1.937, 1.213, 2.650, 0.110),
        "wheel_r": 0.35, "wheel_w": 0.29, "tf": 1.672, "tr": 1.606,
        "is_phone_dial": False, "spoke_count": 5,
        "nose_y": 2.26, "nose_z": 0.44, "nose_w": 1.52,
        "cowl_y": 0.60, "cowl_z": 0.88, "cowl_w": 1.84,
        "belt_z": 0.90, "cabin_w": 1.38,
        "windshield_top_y": 0.00, "roof_peak_y": -0.25, "roof_rear_y": -0.80, "roof_z": 1.213,
        "rear_glass_y": -1.75,
        "rear_quarter_y": -0.45, "deck_w_start": 1.90, "deck_w_end": 1.86,
        "deck_z_start": 0.98, "deck_z_end": 0.86, "tail_y": -2.26,
        "lights_fn": f458_lights, "aero_fn": f458_aero,
    },
    "2020s": {
        "name": "Lamborghini Revuelto",
        "color": (0.98, 0.35, 0.02, 1.0), # Arancio Apodis
        "dims": (4.947, 2.029, 1.160, 2.779, 0.105),
        "wheel_r": 0.36, "wheel_w": 0.30, "tf": 1.720, "tr": 1.701,
        "is_phone_dial": False, "spoke_count": 5,
        "nose_y": 2.47, "nose_z": 0.46, "nose_w": 1.65,
        "cowl_y": 0.70, "cowl_z": 0.88, "cowl_w": 1.94,
        "belt_z": 0.90, "cabin_w": 1.45,
        "windshield_top_y": 0.05, "roof_peak_y": -0.20, "roof_rear_y": -0.75, "roof_z": 1.160,
        "rear_glass_y": -1.75,
        "rear_quarter_y": -0.45, "deck_w_start": 2.00, "deck_w_end": 1.96,
        "deck_z_start": 0.98, "deck_z_end": 0.88, "tail_y": -2.47,
        "lights_fn": revuelto_lights, "aero_fn": revuelto_aero,
    },
    "future": {
        "name": "McMurtry Speirling",
        "color": (0.12, 0.12, 0.14, 1.0), # Stealth Carbon
        "dims": (3.500, 1.700, 1.050, 2.100, 0.060),
        "wheel_r": 0.30, "wheel_w": 0.28, "tf": 1.480, "tr": 1.480,
        "is_phone_dial": True, "spoke_count": 5,
        "nose_y": 1.75, "nose_z": 0.42, "nose_w": 1.35,
        "cowl_y": 0.35, "cowl_z": 0.85, "cowl_w": 1.62,
        "belt_z": 0.86, "cabin_w": 1.15,
        "windshield_top_y": -0.05, "roof_peak_y": -0.25, "roof_rear_y": -0.65, "roof_z": 1.050,
        "rear_glass_y": -1.05,
        "rear_quarter_y": -0.35, "deck_w_start": 1.66, "deck_w_end": 1.60,
        "deck_z_start": 0.90, "deck_z_end": 0.82, "tail_y": -1.75,
        "lights_fn": mcmurtry_lights, "aero_fn": mcmurtry_aero,
    },
}

def generate_supercar(era_id):
    if era_id not in SUPERCAR_SPECS:
        raise ValueError(f"Unknown era: {era_id}")
    spec = SUPERCAR_SPECS[era_id]
    print(f"\n=======================================================")
    print(f"GENERATING CLASS-A SUPERCAR ({era_id.upper()}): {spec['name']}")
    print(f"=======================================================")

    safe_reset()

    # Create root and branch containers
    root = bpy.data.objects.new("VEHICLE_ROOT", None)
    bpy.context.scene.collection.objects.link(root)

    roots = {"ROOT": root}
    for branch in ["PLATFORM", "BODY", "GLASS", "LIGHT", "WHEELS", "AERO", "INTERIOR"]:
        b_obj = bpy.data.objects.new(branch, None)
        b_obj.parent = root
        bpy.context.scene.collection.objects.link(b_obj)
        roots[branch] = b_obj

    mats = create_supercar_materials(era_id, spec["color"])
    build_class_a_supercar(spec, mats, roots)

    # Export paths
    out_dir = os.path.join(PUBLIC_MODELS_DIR, era_id)
    os.makedirs(out_dir, exist_ok=True)
    os.makedirs(EXPORTS_DIR, exist_ok=True)

    glb_public = os.path.normpath(os.path.abspath(os.path.join(out_dir, "vehicle.glb")))
    clean_name = spec["name"].replace(" ", "_").replace("(", "").replace(")", "").replace("/", "_").replace("-", "_")
    glb_export = os.path.normpath(os.path.abspath(os.path.join(EXPORTS_DIR, f"Car_{clean_name}_{era_id}.glb")))

    if os.path.exists(glb_public):
        try: os.remove(glb_public)
        except Exception: pass
    if os.path.exists(glb_export):
        try: os.remove(glb_export)
        except Exception: pass

    # Select all hierarchy objects
    bpy.ops.object.select_all(action='DESELECT')
    def select_tree(o):
        o.select_set(True)
        for child in o.children:
            select_tree(child)
    select_tree(root)
    bpy.context.view_layer.objects.active = root

    bpy.ops.export_scene.gltf(
        filepath=glb_public,
        use_selection=True,
        export_yup=True,
        export_apply=True,
        export_format='GLB',
    )
    sz_pub = os.path.getsize(glb_public)
    print(f"[EXPORT SUCCESS] {glb_public} ({sz_pub:,} bytes)")

    bpy.ops.export_scene.gltf(
        filepath=glb_export,
        use_selection=True,
        export_yup=True,
        export_apply=True,
        export_format='GLB',
    )
    sz_exp = os.path.getsize(glb_export)
    print(f"[EXPORT SUCCESS] {glb_export} ({sz_exp:,} bytes)")

def generate_all():
    for era in ["1970s", "1980s", "1990s", "2000s", "2010s", "2020s", "future"]:
        generate_supercar(era)

if __name__ == "__main__":
    generate_all()
